// Data layer over the artifact db (docs/ARCHITECTURE.md section 4).
// Writes to one document are serialised and coalesced; reads go straight to the db. A write
// rejected as 'unavailable' (a transient bridge blip) is retried once after 300-900 ms before
// the failure is reported. Subscriptions that die with 'unavailable' resubscribe (up to 3 times,
// backing off); other failures reach the view's onError so it can show an error, never "empty".
//
// Shapes beyond docs/ARCHITECTURE.md section 4 (what this layer and its callers agree on):
//   progress.ideas[iid].say   {[key]: {text, at, verdict, met:[bool], nailed?, followUp?, model?, round}}
//   progress.questions        {[key]: {q, iid, at}}          questions typed to Ask Claude, newest 20 kept
//   lessons/{iid}.flags       {[key]: {note, at, stage}}     "This looks wrong" notes, newest 30 kept
//       Keys come from U.key() (time + random), so entries added on two devices at once merge
//       instead of one list replacing the other; null marks a removed entry. Older docs hold
//       these as arrays: read them with U.list / U.entries (either shape, oldest first). The first
//       keyed write over an array converts it in place (old entries get keys L000, L001, ...).
//   progress.ideas[iid].round 0 for the first lesson, +1 for each "Learn it again" (a new lesson).
//       Within a round, stage only moves forward, and predict, startedAt, doneAt and each check
//       result stay as first written: a stale screen on another device cannot overwrite them.
//       Writes tagged with an older round are dropped (say entries excepted). Also kept per idea:
//       past {[round]: {predict, checks, doneAt, stage}} (earlier rounds), replays {[key]: {at,
//       predict, checks}} ("Go through it again" runs, which never touch the originals),
//       againAt (when the current round began) and relearn (Today asks for a new lesson).
//   profile.days[day]         {[deviceId]: minutes, legacy?: minutes}   (older: a number). Each
//       device writes only its own count; U.store.minutesOn(days[day]) sums either shape.
//   Card.retired              true once a card cannot be used (skipped as unusable in review, or its
//       interactive is gone); re-learning the idea brings it back.
// Private progress and cards docs are only ever created while topics/{tid} exists (checked once per
// topic, cached, re-checked before any creation), so a topic deleted on another device stays gone.

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
  function isObj(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }

  function deepMerge(t, s) {
    Object.keys(s).forEach(function (k) {
      var v = s[k];
      if (isObj(v) && isObj(t[k])) deepMerge(t[k], v);
      else t[k] = U.clone(v);
    });
    return t;
  }
  // A patch that turns `old` into exactly `neu` when deep-merged (keys only in `old` become null).
  function replacing(old, neu) {
    if (!isObj(old) || !isObj(neu)) return U.clone(neu);
    var out = {};
    Object.keys(old).forEach(function (k) { if (!(k in neu)) out[k] = null; });
    Object.keys(neu).forEach(function (k) { out[k] = isObj(old[k]) && isObj(neu[k]) ? replacing(old[k], neu[k]) : U.clone(neu[k]); });
    return out;
  }
  function stripNulls(o) {
    if (!isObj(o)) return o;
    var out = {};
    Object.keys(o).forEach(function (k) { if (o[k] !== null) out[k] = stripNulls(o[k]); });
    return out;
  }

  // ---- serialised, coalesced writes, with one retry on a transient failure ----
  var chains = {}, pending = {};
  function transient(e) { return !!(e && e.code === 'unavailable'); }
  // Errors worth sending again later (the bridge or the network, not a refused write).
  function resendable(e) { return !!(e && /^(unavailable|timeout|resource_exhausted|deadline_exceeded|aborted|internal)$/.test(e.code || '')); }
  function tag(e) { if (e && typeof e === 'object' && !Object.isFrozen(e)) try { e.where = 'db'; } catch (x) { /* frozen */ } return e; }
  function retrying(fn) {
    return Promise.resolve().then(fn).catch(function (e) {
      if (!transient(e)) throw tag(e);
      return U.sleep(300 + Math.random() * 600).then(fn).catch(function (e2) { throw tag(e2); });
    });
  }
  function run(path, fn) {
    var job = function () { return retrying(fn); };
    var p = (chains[path] || Promise.resolve()).then(job, job);
    chains[path] = p.catch(function () {});
    p.then(wrote, function () {});
    return p;
  }
  // Outbox: writes that failed for a transient reason wait in this page and are sent again when
  // the db answers again (the next write that succeeds), when the device comes back online or to
  // the foreground, or every 20 s. A held patch is merged under any newer patch to the same doc,
  // so a resend never undoes something newer. Dan sees one notice per outage, not one per write.
  var held = {}, cardJobs = [], outage = false, flushTimer = null;
  function waiting() { return Object.keys(held).length + cardJobs.length; }
  function arm() { if (!flushTimer) flushTimer = setTimeout(flush, 20000); }
  function flush() {
    clearTimeout(flushTimer); flushTimer = null;
    Object.keys(held).forEach(function (path) { if (!pending[path]) patchDoc(path, {}).catch(function () { /* held again */ }); });
    cardJobs.splice(0).forEach(function (t) { Promise.resolve().then(t).catch(function () { /* held again */ }); });
  }
  function wrote() {
    if (outage) { outage = false; U.toast('Saving works again. What you did meanwhile is saved.', { kind: 'good' }); }
    if (waiting()) setTimeout(flush, 0);
  }
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('online', function () { if (waiting()) flush(); });
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', function () { if (!document.hidden && waiting()) flush(); });
  }
  // A write failed after its retry. keep(): hold it for a resend (returns false when it cannot be
  // held). Tells Dan once per outage, and rejects with e.queued set when the write will be resent.
  function failed(e, keep) {
    tag(e);
    var kept = !!keep && resendable(e) && keep() !== false;
    if (kept && e && typeof e === 'object') try { e.queued = true; } catch (x) { /* frozen */ }
    console.error('db write failed', e);
    if (kept) {
      arm();
      if (!outage) U.toast('Your work could not be saved just now. It is kept here and saved as soon as the connection is back.', { kind: 'bad', ms: 8000 });
      outage = true;
    } else {
      U.toast(e && e.code === 'quota_exceeded' ? U.errText(e) : 'Could not save just now: ' + U.errText(e), { kind: 'bad' });
    }
    throw e;
  }
  function reportWrite(e) { return failed(e, null); }

  // ---- topics that exist ----
  // Topics deleted in this page: late writes from work still in flight (research, a prefetched
  // lesson) must not bring them back. Added only once the topic doc is really gone.
  var removed = new Set();
  var known = {}, checking = {}, TOPIC_TTL = 60000;
  function tidOf(path) {
    var seg = path.split('/');
    if (seg[0] === 'topics') return seg[1];
    var i = seg.indexOf('progress'); if (i < 0) i = seg.indexOf('cards');
    return i >= 0 && seg[i + 1] ? seg[i + 1] : null;
  }
  // The topic a private progress/cards doc belongs to (null for every other path).
  function privTid(path) { return isPriv(path) ? tidOf(path) : null; }
  function gone(path) { var t = tidOf(path); return !!(t && removed.has(t)); }
  function noteTopic(tid, ok) { if (tid) known[tid] = { ok: !!ok, at: Date.now() }; }
  // Does topics/{tid} exist? Cached per page; a "no" is final (ids are never reused), a "yes" is
  // re-checked after a minute, or at once with fresh=true.
  function topicExists(tid, fresh) {
    var k = known[tid];
    if (k && (k.ok === false || (!fresh && Date.now() - k.at < TOPIC_TTL))) return Promise.resolve(k.ok);
    if (checking[tid]) return checking[tid];
    var p = checking[tid] = D('topics/' + tid).get().then(function (snap) {
      delete checking[tid];
      noteTopic(tid, snap.exists);
      return !!snap.exists;
    }, function (e) { delete checking[tid]; throw e; });
    return p;
  }
  // Which of these topics exist: answered from the cache, or from one read of the topics list.
  function topicsExist(tids) {
    var now = Date.now();
    var stale = tids.some(function (t) { var k = known[t]; return !k || (k.ok && now - k.at >= TOPIC_TTL); });
    var load = stale ? listColl('topics').then(function (list) {
      var ids = {};
      list.forEach(function (t) { ids[t.__id] = true; noteTopic(t.__id, true); });
      tids.forEach(function (t) { if (!ids[t]) noteTopic(t, false); });
    }) : Promise.resolve();
    return load.then(function () { var o = {}; tids.forEach(function (t) { o[t] = known[t] ? known[t].ok : true; }); return o; });
  }
  function mayCreate(path) {
    var tid = privTid(path);
    return tid ? topicExists(tid, true) : Promise.resolve(true);
  }

  // ---- write-time rules (applied to the doc as it is when the write lands) ----
  // An object written over an old array list converts the list to a keyed map first.
  function upgradeLists(cur, body) {
    Object.keys(body).forEach(function (k) {
      var v = body[k], c = cur && cur[k];
      if (!isObj(v)) return;
      if (Array.isArray(c)) body[k] = Object.assign(U.keyed(c), v);
      else if (isObj(c)) upgradeLists(c, v);
    });
  }
  var STAGE = { predict: 0, play: 1, explain: 2, say: 3, checks: 4, done: 5 };
  var ROUND_FIELDS = ['round', 'stage', 'predict', 'checks', 'doneAt', 'startedAt', 'relearn', 'againAt', 'past'];
  function guardProgress(cur, body) {
    var bi = body.ideas, ci = (cur && cur.ideas) || {};
    if (!isObj(bi)) return;
    Object.keys(bi).forEach(function (iid) {
      var b = bi[iid], c = ci[iid];
      if (!isObj(b) || !isObj(c)) return;
      var cr = Number(c.round) || 0, br = b.round == null ? null : (Number(b.round) || 0);
      if (br != null && br > cr) return;           // Learn it again: a new round starts afresh
      if (br != null && br < cr) { ROUND_FIELDS.forEach(function (k) { delete b[k]; }); return; }
      if (b.stage != null && (STAGE[b.stage] || 0) < (STAGE[c.stage] || 0)) delete b.stage;
      if (b.predict != null && c.predict) delete b.predict;
      if (b.doneAt && c.doneAt) delete b.doneAt;
      if (b.startedAt && c.startedAt) delete b.startedAt;
      if (isObj(b.checks) && isObj(c.checks)) Object.keys(b.checks).forEach(function (k) { if (c.checks[k]) delete b.checks[k]; });
    });
  }
  function prepare(path, cur, body) {
    upgradeLists(cur, body);
    if (/\/profile\/progress\//.test(path)) guardProgress(cur, body);
    return body;
  }

  function setDoc(path, data) {
    if (gone(path)) return Promise.resolve(null);
    var tid = privTid(path);
    return run(path, function () {
      return (tid ? topicExists(tid) : Promise.resolve(true)).then(function (ok) {
        if (!ok) return null;
        return D(path).set(data).then(function () { if (/^topics\/[^/]+$/.test(path)) noteTopic(tidOf(path), true); });
      });
    }).catch(reportWrite);
  }
  // Private docs (progress, cards, profile) are created on first patch (progress and cards only
  // while their topic exists). Shared content (topics, lessons, research) is created only by an
  // explicit set: a patch to a missing one is dropped, so a topic deleted elsewhere stays deleted.
  // Most patches are one round trip (update; create only if that says the doc is missing).
  // Progress patches read the doc first: the write-time rules above need it. Resolves null when
  // the write was dropped.
  function create(path, ref, body) {
    if (!isPriv(path)) return null;
    return mayCreate(path).then(function (ok) { return ok ? ref.set(stripNulls(body)) : null; });
  }
  function writePatch(path, body) {
    var ref = D(path);
    if (/\/profile\/progress\//.test(path)) {
      return ref.get().then(function (s) { return s.exists ? ref.update(prepare(path, s.data() || {}, body)) : create(path, ref, body); });
    }
    return ref.update(body).catch(function (e) {
      if (!(e && e.code === 'invalid_argument')) throw e;
      return ref.get().then(function (s) { if (s.exists) throw e; return create(path, ref, body); });
    });
  }
  var latest = {};    // path -> the newest patch not yet being written
  function patchDoc(path, patch) {
    if (gone(path)) return Promise.resolve(null);
    var p = pending[path];
    if (p) { deepMerge(p.patch, patch); return p.promise; }
    var base = held[path];
    delete held[path];
    p = pending[path] = latest[path] = { patch: base ? deepMerge(base, U.clone(patch)) : U.clone(patch), started: false };
    p.promise = U.sleep(120).then(function () {
      delete pending[path];
      if (gone(path)) return null;
      return run(path, function () { p.started = true; return writePatch(path, U.clone(p.patch)); });
    }).then(function (r) { if (latest[path] === p) delete latest[path]; return r; }, function (e) {
      if (latest[path] === p) delete latest[path];
      return failed(e, function () {
        if (gone(path)) return false;
        var n = latest[path];
        if (n && !n.started) n.patch = deepMerge(U.clone(p.patch), n.patch);   // goes out with the newer one
        else held[path] = held[path] ? deepMerge(U.clone(p.patch), held[path]) : U.clone(p.patch);
      });
    });
    return p.promise;
  }
  // Read-modify-write of one review card inside the doc's write queue: fn(card) gets the card as
  // stored right now and returns the fields to write (or null for none). A card that no longer
  // exists (deleted with its topic, or dropped when its idea was re-learned) is never recreated.
  function updateCard(tid, id, fn) {
    var path = S.paths.cards(tid);
    if (gone(path)) return Promise.resolve(null);
    return run(path, function () {
      var ref = D(path);
      return ref.get().then(function (s) {
        var d = s.exists ? s.data() : null, c = d && isObj(d.cards) ? d.cards[id] : null;
        if (!isObj(c) || !c.type) return null;
        var fields = fn(U.clone(c));
        if (!fields) return null;
        var body = { cards: {} };
        body.cards[id] = fields;
        return ref.update(body).then(function () { return fields; });
      });
    }).catch(function (e) { return failed(e, function () { cardJobs.push(function () { return updateCard(tid, id, fn); }); }); });
  }
  function getDoc(path) { return retrying(function () { return D(path).get(); }).then(function (s) { return s.exists ? U.clone(s.data()) : null; }); }

  // ---- subscriptions that survive a dead bridge ----
  // onError(e, {retrying}) tells the view: retrying while it resubscribes after 'unavailable',
  // then (or at once, for any other code) retrying:false - the view shows an error with Try again.
  function subscribe(source, onNext, onError) {
    var stop = null, dead = false, tries = 0, timer = null;
    function quit() { if (stop) { try { stop(); } catch (e) { /* already gone */ } stop = null; } }
    function fail(e) {
      if (dead) return;
      console.warn('watch failed', e && (e.code || e.message), e);
      quit();
      var again = transient(e) && tries < 3;
      if (onError) try { onError(e, { retrying: again }); } catch (x) { console.error(x); }
      if (again) { tries++; timer = setTimeout(start, 400 * Math.pow(2, tries - 1) + Math.random() * 300); }
    }
    function start() {
      if (dead) return;
      try { stop = source().onSnapshot(function (snap) { if (dead) return; tries = 0; onNext(snap); }, fail); }
      catch (e) { fail(e); }
    }
    start();
    return function () { dead = true; clearTimeout(timer); quit(); };
  }
  function watchDoc(path, fn, onError) {
    return subscribe(function () { return D(path); }, function (s) {
      var d = s.exists ? s.data() : null;
      var t = /^topics\/[^/]+$/.test(path) ? tidOf(path) : null;
      if (t) noteTopic(t, !!d);
      fn(d);
    }, onError);
  }
  function listColl(path) { return retrying(function () { return C(path).get(); }).then(function (q) { return q.docs.map(function (d) { var x = U.clone(d.data()) || {}; x.__id = d.id; return x; }); }); }

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
    topicExists: topicExists,
    topicsExist: topicsExist,
    replacing: replacing,
    waiting: waiting,
    flush: flush,
    setDoc: setDoc, patchDoc: patchDoc, getDoc: getDoc, watchDoc: watchDoc,
    // Minutes studied on one day, whichever shape days[day] has.
    minutesOn: function (v) {
      if (typeof v === 'number') return isFinite(v) ? v : 0;
      if (!isObj(v)) return 0;
      return Object.keys(v).reduce(function (sum, k) { var n = Number(v[k]); return sum + (isFinite(n) ? n : 0); }, 0);
    },
    _known: known,
  };

  S.topics = {
    // fn(list of topic docs, newest first); onError(e, {retrying}) when the subscription fails.
    watch: function (fn, onError) {
      return subscribe(function () { return C('topics').orderBy('updatedAt', 'desc'); }, function (q) {
        var seen = {};
        var list = q.docs.map(function (d) { seen[d.id] = true; return d.data(); }).filter(Boolean);
        Object.keys(seen).forEach(function (tid) { noteTopic(tid, true); });
        // Topics this page thought existed but the full list no longer has: check again next time.
        Object.keys(known).forEach(function (tid) { if (known[tid].ok && !seen[tid]) known[tid].at = 0; });
        fn(list);
      }, onError);
    },
    list: function () { return listColl('topics').then(function (l) { return l.sort(function (a, b) { return (b.updatedAt || '').localeCompare(a.updatedAt || ''); }); }); },
  };
  S.topic = {
    get: function (tid) { return getDoc(S.paths.topic(tid)).then(function (t) { noteTopic(tid, !!t); return t; }); },
    watch: function (tid, fn, onError) { return watchDoc(S.paths.topic(tid), fn, onError); },
    create: function (data) { return setDoc(S.paths.topic(data.id), data).then(function () { return data; }); },
    update: function (tid, patch) { patch.updatedAt = U.now(); return patchDoc(S.paths.topic(tid), patch); },
    // Deletes the topic doc first: it disappears everywhere at once, and only then is the tid
    // treated as removed in this page. Its lessons, research, progress and cards go next (each
    // retried once); any that still fail are invisible orphans, tidied later (see 60-today plan).
    // Resolves {leftovers: n}; rejects (nothing removed) if the topic doc itself could not go.
    remove: function (tid) {
      var path = S.paths.topic(tid);
      return run(path, function () { return D(path).delete(); }).then(function () {
        removed.add(tid);
        noteTopic(tid, false);
        var left = 0;
        function del(p) { return retrying(function () { return D(p).delete(); }).catch(function (e) { left++; console.warn('could not delete', p, e); }); }
        function list(p) { return listColl(p).catch(function (e) { left++; console.warn('could not list', p, e); return []; }); }
        return Promise.all([list('topics/' + tid + '/lessons'), list('topics/' + tid + '/research')]).then(function (r) {
          var jobs = [];
          r[0].forEach(function (d) { jobs.push(del(S.paths.lesson(tid, d.__id))); });
          r[1].forEach(function (d) { jobs.push(del(S.paths.research(tid, d.__id))); });
          jobs.push(del(S.paths.progress(tid)), del(S.paths.cards(tid)));
          return Promise.all(jobs);
        }).then(function () { return { leftovers: left }; });
      });
    },
  };
  S.lesson = {
    get: function (tid, iid) { return getDoc(S.paths.lesson(tid, iid)); },
    watch: function (tid, iid, fn, onError) { return watchDoc(S.paths.lesson(tid, iid), fn, onError); },
    // Only under a topic that still exists (it may have been deleted on another device).
    set: function (tid, iid, data) {
      data.updatedAt = U.now();
      return getDoc(S.paths.topic(tid)).then(function (t) { noteTopic(tid, !!t); return t ? setDoc(S.paths.lesson(tid, iid), data) : null; });
    },
    update: function (tid, iid, patch) { patch.updatedAt = U.now(); return patchDoc(S.paths.lesson(tid, iid), patch); },
    // Deletes one lesson doc (a job putting back a doc it created). Queued behind pending writes.
    remove: function (tid, iid) {
      var path = S.paths.lesson(tid, iid);
      delete held[path];
      return run(path, function () { return D(path).delete(); });
    },
    list: function (tid) { return listColl('topics/' + tid + '/lessons'); },
  };
  S.research = {
    get: function (tid, key) { return getDoc(S.paths.research(tid, key)); },
    set: function (tid, key, data) {
      return getDoc(S.paths.topic(tid)).then(function (t) { noteTopic(tid, !!t); return t ? setDoc(S.paths.research(tid, key), data) : null; });
    },
  };
  S.progress = {
    get: function (tid) { return getDoc(S.paths.progress(tid)).then(function (d) { return d || { ideas: {} }; }); },
    watch: function (tid, fn, onError) { return watchDoc(S.paths.progress(tid), function (d) { fn(d || { ideas: {} }); }, onError); },
    patch: function (tid, patch) { patch.updatedAt = U.now(); return patchDoc(S.paths.progress(tid), patch); },
    all: function () { return listColl(priv('profile/progress')).then(function (l) { var o = {}; l.forEach(function (d) { o[d.__id] = d; }); return o; }); },
  };
  S.cards = {
    get: function (tid) { return getDoc(S.paths.cards(tid)).then(function (d) { return d || { cards: {} }; }); },
    patch: function (tid, patch) { return patchDoc(S.paths.cards(tid), patch); },
    update: updateCard,
    all: function () { return listColl(priv('profile/cards')).then(function (l) { var o = {}; l.forEach(function (d) { o[d.__id] = d; }); return o; }); },
    // Deletes the cards and progress docs of a topic that no longer exists (left behind by a
    // delete that half failed, or written by an older version of the app).
    dropOrphan: function (tid) {
      return topicExists(tid, true).then(function (ok) {
        if (ok) return false;
        return Promise.all([S.paths.cards(tid), S.paths.progress(tid)].map(function (p) {
          return retrying(function () { return D(p).delete(); }).catch(function (e) { console.warn('could not tidy', p, e); });
        })).then(function () { return true; });
      });
    },
  };
  S.profile = {
    defaults: function () { return { prefs: { size: 'm', easy: false, theme: 'light', cap: 15, light: false }, days: {}, createdAt: U.now() }; },
    get: function () { return getDoc(S.paths.profile()).then(function (d) { return d ? deepMerge(S.profile.defaults(), d) : S.profile.defaults(); }); },
    watch: function (fn, onError) { return watchDoc(S.paths.profile(), function (d) { fn(d ? deepMerge(S.profile.defaults(), d) : S.profile.defaults()); }, onError); },
    patch: function (patch) { return patchDoc(S.paths.profile(), patch); },
  };
  return S;
})();

// Record study time for "this week". Each device keeps its own running total for the day
// (profile.days[day][deviceId]), so two devices logging at once never undo each other; calls in
// this page are queued so none is lost. An old single number for the day is kept as `legacy`.
U.logStudy = (function () {
  var chain = Promise.resolve(), mine = {};
  return function (minutes) {
    var day = U.today(), dev = U.device();
    var job = chain.then(function () {
      return (mine[day] == null ? U.store.profile.get() : Promise.resolve(null)).then(function (p) {
        var rec = {};
        if (mine[day] == null) {
          var cur = p && p.days ? p.days[day] : null;
          mine[day] = cur && typeof cur === 'object' ? (Number(cur[dev]) || 0) : 0;
          if (typeof cur === 'number' && cur > 0) rec.legacy = cur;
        }
        mine[day] = Math.round(mine[day] + (Number(minutes) || 0));
        rec[dev] = mine[day];
        var patch = { days: {} };
        patch.days[day] = rec;
        return U.store.profile.patch(patch);
      });
    });
    chain = job.catch(function () {});
    return job;
  };
})();
