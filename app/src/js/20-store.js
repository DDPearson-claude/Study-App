// Data layer over the artifact db (docs/ARCHITECTURE.md section 4).
// Writes to one document are serialised and coalesced; reads go straight to the db.

// In-memory stand-in used when the page runs without the db capability (nothing persists).
U.memdb = (function () {
  var docs = {}, listeners = {}, qListeners = [];
  function parent(p) { return p.split('/').slice(0, -1).join('/'); }
  function snap(p) { var d = docs[p]; return { id: p.split('/').pop(), exists: !!d, data: function () { return d ? U.clone(d) : undefined; } }; }
  function fire(p) {
    (listeners[p] || []).forEach(function (fn) { setTimeout(function () { fn(snap(p)); }); });
    qListeners.forEach(function (l) { if (l.c === parent(p)) setTimeout(function () { l.fn(query(l.c, l.o)); }); });
  }
  function query(c, o) {
    var list = Object.keys(docs).filter(function (p) { return parent(p) === c; }).map(snap);
    if (o && o.field) list.sort(function (a, b) { var x = a.data()[o.field], y = b.data()[o.field]; return (x < y ? -1 : x > y ? 1 : 0) * (o.dir === 'desc' ? -1 : 1); });
    return { docs: list, size: list.length };
  }
  function merge(t, s) { Object.keys(s).forEach(function (k) { var v = s[k]; if (v && typeof v === 'object' && !Array.isArray(v) && t[k] && typeof t[k] === 'object' && !Array.isArray(t[k])) merge(t[k], v); else t[k] = U.clone(v); }); return t; }
  function doc(p) {
    return {
      get: function () { return Promise.resolve(snap(p)); },
      set: function (d) { docs[p] = U.clone(d); fire(p); return Promise.resolve(); },
      update: function (d) { if (!docs[p]) return Promise.reject({ code: 'invalid_argument', message: 'missing' }); merge(docs[p], d); fire(p); return Promise.resolve(); },
      delete: function () { delete docs[p]; fire(p); return Promise.resolve(); },
      onSnapshot: function (fn) { (listeners[p] = listeners[p] || []).push(fn); setTimeout(function () { fn(snap(p)); }); return function () { listeners[p] = listeners[p].filter(function (f) { return f !== fn; }); }; },
    };
  }
  function coll(c, o) {
    return {
      orderBy: function (field, dir) { return coll(c, { field: field, dir: dir }); },
      limit: function () { return coll(c, o); },
      where: function () { return coll(c, o); },
      get: function () { return Promise.resolve(query(c, o)); },
      onSnapshot: function (fn) { var l = { c: c, o: o, fn: fn }; qListeners.push(l); setTimeout(function () { fn(query(c, o)); }); return function () { qListeners = qListeners.filter(function (x) { return x !== l; }); }; },
      doc: function (id) { return doc(c + '/' + id); },
    };
  }
  return { doc: doc, collection: coll, isMemory: true };
})();

U.store = (function () {
  function db() { return U.rt.db || U.memdb; }
  function priv(rest) { return U.rt.uid ? 'data/users/' + U.rt.uid + '/' + rest : 'local/me/' + rest; }
  function pdb() { return U.rt.db && U.rt.uid ? U.rt.db : U.memdb; }
  function isPriv(path) { return path.indexOf('data/users/') === 0 || path.indexOf('local/') === 0; }
  function D(path) { return (isPriv(path) ? pdb() : db()).doc(path); }
  function C(path) { return (isPriv(path) ? pdb() : db()).collection(path); }

  function deepMerge(t, s) {
    Object.keys(s).forEach(function (k) {
      var v = s[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && t[k] && typeof t[k] === 'object' && !Array.isArray(t[k])) deepMerge(t[k], v);
      else t[k] = U.clone(v);
    });
    return t;
  }

  // ---- serialised, coalesced writes ----
  var chains = {}, pending = {};
  function run(path, fn) {
    var p = (chains[path] || Promise.resolve()).then(fn, fn);
    chains[path] = p.catch(function () {});
    return p;
  }
  function reportWrite(e) {
    console.error('db write failed', e);
    U.toast(e && e.code === 'quota_exceeded' ? U.errText(e) : 'Could not save just now: ' + U.errText(e), { kind: 'bad' });
    throw e;
  }
  // Topics deleted in this page: late writes from work still in flight (research, a prefetched
  // lesson) must not bring them back.
  var removed = new Set();
  function tidOf(path) {
    var seg = path.split('/');
    if (seg[0] === 'topics') return seg[1];
    var i = seg.indexOf('progress'); if (i < 0) i = seg.indexOf('cards');
    return i >= 0 && seg[i + 1] ? seg[i + 1] : null;
  }
  function gone(path) { var t = tidOf(path); return !!(t && removed.has(t)); }
  function setDoc(path, data) {
    if (gone(path)) return Promise.resolve(null);
    return run(path, function () { return D(path).set(data); }).catch(reportWrite);
  }
  // Private docs (progress, cards, profile) are created on first patch. Shared content (topics,
  // lessons, research) is created only by an explicit set: a patch to a missing one is dropped,
  // so a topic deleted on another device stays deleted.
  function patchDoc(path, patch) {
    if (gone(path)) return Promise.resolve(null);
    var p = pending[path];
    if (p) { deepMerge(p.patch, patch); return p.promise; }
    p = pending[path] = { patch: U.clone(patch) };
    p.promise = U.sleep(120).then(function () {
      delete pending[path];
      var body = p.patch;
      if (gone(path)) return null;
      return run(path, function () {
        var ref = D(path);
        return ref.get().then(function (s) {
          if (s.exists) return ref.update(body);
          return isPriv(path) ? ref.set(body) : null;
        });
      });
    }).catch(reportWrite);
    return p.promise;
  }
  function getDoc(path) { return D(path).get().then(function (s) { return s.exists ? U.clone(s.data()) : null; }); }
  function watchDoc(path, fn) {
    var stop = D(path).onSnapshot(function (s) { fn(s.exists ? s.data() : null); }, function (e) { console.error('watch failed', path, e); });
    return stop;
  }
  function listColl(path) { return C(path).get().then(function (q) { return q.docs.map(function (d) { var x = U.clone(d.data()) || {}; x.__id = d.id; return x; }); }); }

  var S = {
    paths: {
      topic: function (tid) { return 'topics/' + tid; },
      lesson: function (tid, iid) { return 'topics/' + tid + '/lessons/' + iid; },
      research: function (tid, key) { return 'topics/' + tid + '/research/' + key; },
      profile: function () { return priv('profile'); },
      progress: function (tid) { return priv('profile/progress/' + tid); },
      cards: function (tid) { return priv('profile/cards/' + tid); },
    },
    persistent: function () { return !!(U.rt.db && U.rt.uid); },
    isRemoved: function (tid) { return removed.has(tid); },
    setDoc: setDoc, patchDoc: patchDoc, getDoc: getDoc, watchDoc: watchDoc,
  };

  S.topics = {
    watch: function (fn) {
      return C('topics').orderBy('updatedAt', 'desc').onSnapshot(function (q) {
        fn(q.docs.map(function (d) { return d.data(); }).filter(Boolean));
      }, function (e) { console.error(e); fn([]); });
    },
    list: function () { return listColl('topics').then(function (l) { return l.sort(function (a, b) { return (b.updatedAt || '').localeCompare(a.updatedAt || ''); }); }); },
  };
  S.topic = {
    get: function (tid) { return getDoc(S.paths.topic(tid)); },
    watch: function (tid, fn) { return watchDoc(S.paths.topic(tid), fn); },
    create: function (data) { return setDoc(S.paths.topic(data.id), data).then(function () { return data; }); },
    update: function (tid, patch) { patch.updatedAt = U.now(); return patchDoc(S.paths.topic(tid), patch); },
    remove: function (tid) {
      removed.add(tid);
      var jobs = [listColl('topics/' + tid + '/lessons'), listColl('topics/' + tid + '/research')];
      return Promise.all(jobs).then(function (r) {
        var dels = [];
        r[0].forEach(function (d) { dels.push(D(S.paths.lesson(tid, d.__id)).delete()); });
        r[1].forEach(function (d) { dels.push(D(S.paths.research(tid, d.__id)).delete()); });
        dels.push(D(S.paths.progress(tid)).delete(), D(S.paths.cards(tid)).delete());
        return Promise.all(dels);
      }).then(function () { return D(S.paths.topic(tid)).delete(); });
    },
  };
  S.lesson = {
    get: function (tid, iid) { return getDoc(S.paths.lesson(tid, iid)); },
    watch: function (tid, iid, fn) { return watchDoc(S.paths.lesson(tid, iid), fn); },
    // Only under a topic that still exists (it may have been deleted on another device).
    set: function (tid, iid, data) {
      data.updatedAt = U.now();
      return getDoc(S.paths.topic(tid)).then(function (t) { return t ? setDoc(S.paths.lesson(tid, iid), data) : null; });
    },
    update: function (tid, iid, patch) { patch.updatedAt = U.now(); return patchDoc(S.paths.lesson(tid, iid), patch); },
    list: function (tid) { return listColl('topics/' + tid + '/lessons'); },
  };
  S.research = {
    get: function (tid, key) { return getDoc(S.paths.research(tid, key)); },
    set: function (tid, key, data) {
      return getDoc(S.paths.topic(tid)).then(function (t) { return t ? setDoc(S.paths.research(tid, key), data) : null; });
    },
  };
  S.progress = {
    get: function (tid) { return getDoc(S.paths.progress(tid)).then(function (d) { return d || { ideas: {} }; }); },
    watch: function (tid, fn) { return watchDoc(S.paths.progress(tid), function (d) { fn(d || { ideas: {} }); }); },
    patch: function (tid, patch) { patch.updatedAt = U.now(); return patchDoc(S.paths.progress(tid), patch); },
    all: function () { return listColl(priv('profile/progress')).then(function (l) { var o = {}; l.forEach(function (d) { o[d.__id] = d; }); return o; }); },
  };
  S.cards = {
    get: function (tid) { return getDoc(S.paths.cards(tid)).then(function (d) { return d || { cards: {} }; }); },
    patch: function (tid, patch) { return patchDoc(S.paths.cards(tid), patch); },
    all: function () { return listColl(priv('profile/cards')).then(function (l) { var o = {}; l.forEach(function (d) { o[d.__id] = d; }); return o; }); },
  };
  S.profile = {
    defaults: function () { return { prefs: { size: 'm', easy: false, theme: 'light', cap: 15, light: false }, days: {}, createdAt: U.now() }; },
    get: function () { return getDoc(S.paths.profile()).then(function (d) { return d ? deepMerge(S.profile.defaults(), d) : S.profile.defaults(); }); },
    watch: function (fn) { return watchDoc(S.paths.profile(), function (d) { fn(d ? deepMerge(S.profile.defaults(), d) : S.profile.defaults()); }); },
    patch: function (patch) { return patchDoc(S.paths.profile(), patch); },
  };
  return S;
})();

// Record study time for "this week" (minutes per day, coalesced).
U.logStudy = function (minutes) {
  var day = U.today(), patch = { days: {} };
  return U.store.profile.get().then(function (p) {
    patch.days[day] = Math.round(((p.days && p.days[day]) || 0) + minutes);
    return U.store.profile.patch(patch);
  });
};
