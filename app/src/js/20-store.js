// Data layer over the artifact db (docs/ARCHITECTURE.md section 4).
// Writes to one document are serialised and coalesced; reads go straight to the db. A write
// rejected as 'unavailable' (a transient bridge blip) is retried once after 300-900 ms before
// the failure is reported. Subscriptions that die with 'unavailable' resubscribe (3 quick tries,
// then slowly until the bridge answers); other failures reach the view's onError so it can show
// an error, never "empty". Writes to Dan's private docs asked for before the runtime is ready
// wait for it (their path names his user id, which is only known then).
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
  // Outbox: writes that failed for a transient reason wait in this page and are sent again: every
  // 3 s for the first minute of an outage (then every 15 s), at once when another write succeeds,
  // and when the device comes back online or to the foreground. A held patch is merged under any
  // newer patch to the same doc, so a resend never undoes something newer. Dan sees one notice per
  // outage, not one per write, and another when saving works again.
  // Patches to lesson docs are never held: the job writing a lesson owns its retries under the
  // lesson's lease, and a patch sent later could land on a lesson that another device (or "Try
  // again" here) has rewritten since, bringing back the old text beside the new interactive.
  // Held patches to Dan's private docs (progress, cards, profile) are also kept on this device
  // (localStorage 'mu.outbox.<uid>.<page>') until they land, and if this page closes first, the
  // next page to open sends them. By then Dan may have used another device, so such a patch is
  // first compared with the doc as it is (sendOld), and one older than RESTORE_MAX_MS is dropped.
  // Patches to shared docs and multi-step jobs (`later`) live only as long as the page: by the
  // next visit another device may have rewritten what an old patch would overwrite.
  var held = {}, later = [], outage = false, since = 0, flushTimer = null;
  var carrying = {};   // path -> the write now resending a held patch (kept on the device until it lands)
  var heldSince = {};  // path -> when the oldest write now held for it was asked for
  var PAGE = U.id('p'), OUTBOX = 'mu.outbox.', LOCK = 'mu.page.';
  var RESTORE_MAX_MS = 14 * 24 * 3600 * 1000;
  function waiting() { return Object.keys(held).length + later.length; }
  function holdable(path) { return !/^topics\/[^/]+\/lessons\//.test(path); }
  function ownPriv(path) { return !!U.rt.uid && path.indexOf('data/users/' + U.rt.uid + '/') === 0; }
  function outboxKey() { return U.rt.db && U.rt.uid ? OUTBOX + U.rt.uid + '.' + PAGE : null; }
  // This page holds a Web Lock named after it for as long as it is open (the browser lets go when
  // the page closes or is killed). A page opening later can then tell what a closed page left on
  // the device, which it takes over, from what a tab still open holds, which that tab sends itself.
  function lockApi() { try { return typeof navigator !== 'undefined' && navigator.locks && typeof navigator.locks.query === 'function' ? navigator.locks : null; } catch (e) { return null; } }
  (function () {
    var L = lockApi();
    if (L) try { L.request(LOCK + PAGE, function () { return new Promise(function () {}); }).catch(function () { /* no lock: other pages treat this one as closed */ }); } catch (e) { /* the same */ }
  })();
  // The ids of the pages still open, or null when the browser cannot tell (no Web Locks): then
  // every page's leftovers are taken over, and a tab still open may send the same patch again.
  function openPages() {
    var L = lockApi();
    if (!L) return Promise.resolve(null);
    return Promise.resolve().then(function () { return L.query(); }).then(function (s) {
      var o = {};
      ((s && s.held) || []).forEach(function (l) { if (l && typeof l.name === 'string' && l.name.indexOf(LOCK) === 0) o[l.name.slice(LOCK.length)] = true; });
      return o;
    }, function () { return null; });
  }
  // Mirrors what waits for Dan's private docs onto the device (nothing without the db), with the
  // time the oldest part of each was asked for (`since`), so a page that sends it later can tell
  // what has changed since.
  function persist() {
    var key = outboxKey(), docs = {}, times = {}, n = 0;
    if (!key) return;
    Object.keys(carrying).forEach(function (p) { if (ownPriv(p)) { docs[p] = carrying[p].patch; n++; } });
    Object.keys(held).forEach(function (p) { if (ownPriv(p)) { docs[p] = docs[p] ? deepMerge(U.clone(docs[p]), held[p]) : held[p]; n++; } });
    Object.keys(docs).forEach(function (p) { times[p] = heldSince[p] || U.now(); });
    try { if (n) localStorage.setItem(key, JSON.stringify({ at: U.now(), since: times, docs: docs })); else localStorage.removeItem(key); } catch (e) { /* storage blocked: this page's copy only */ }
  }
  function landed(path) { if (!held[path] && !carrying[path]) delete heldSince[path]; }
  // Once the runtime is known, takes over what earlier pages of this user left on the device
  // (closed before their writes landed) and sends it, oldest first. Each doc goes through sendOld,
  // queued in that doc's write queue before any private write of this page (those wait for this,
  // whenKnown below), so this page's own newer writes land after it. A copy stays on the device
  // until its write lands; one that cannot be sent yet is tried again when the db answers.
  var taking = {}, untaken = false;
  function restore() {
    var key = outboxKey(), mine = OUTBOX + U.rt.uid + '.', found = [];
    if (!key) return null;
    try {
      for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(mine) === 0 && k !== key && !taking[k]) found.push(k); }
    } catch (e) { return null; }
    if (!found.length) return null;
    return openPages().then(function (open) {
      var list = [];
      found.forEach(function (k) {
        if (taking[k] || (open && open[k.slice(mine.length)])) return;   // a tab still open sends its own
        var saved = null;
        try { saved = JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { /* unreadable: dropped below */ }
        var age = saved && typeof saved.at === 'string' ? Date.now() - Date.parse(saved.at) : NaN;
        // Weeks old: what it held has been redone or overtaken by now, and sending it would undo that.
        if (!saved || !isObj(saved.docs) || !(age <= RESTORE_MAX_MS)) { stash(k, null); return; }
        list.push({ key: k, saved: saved });
      });
      list.sort(function (a, b) { return a.saved.at < b.saved.at ? -1 : a.saved.at > b.saved.at ? 1 : 0; });
      list.forEach(take);
    });
  }
  function stash(k, saved) {
    try { if (saved && Object.keys(saved.docs).length) localStorage.setItem(k, JSON.stringify(saved)); else localStorage.removeItem(k); } catch (e) { /* storage blocked */ }
  }
  function take(item) {
    var k = item.key, saved = item.saved, times = isObj(saved.since) ? saved.since : {};
    var paths = Object.keys(saved.docs).filter(function (p) { return ownPriv(p) && isObj(saved.docs[p]); });
    Object.keys(saved.docs).forEach(function (p) { if (paths.indexOf(p) < 0) delete saved.docs[p]; });
    if (!paths.length) { stash(k, null); return; }
    taking[k] = true;
    var left = paths.length;
    paths.forEach(function (p) {
      sendOld(p, saved.docs[p], String(times[p] || saved.at)).then(function () { return true; }, function (e) {
        console.warn('outbox', p, e);
        if (!resendable(e)) return true;   // refused: it never will be written
        untaken = true;                      // the db is not answering: try again once it does
        return false;
      }).then(function (done) {
        if (done) { delete saved.docs[p]; stash(k, saved); }
        if (--left === 0) delete taking[k];
      });
    });
  }
  // Writes an old patch (left by a page that closed before it landed) inside the doc's write
  // queue, keeping only what is not older than the doc as it is now (fresher). `at` is when the
  // oldest part of it was asked for.
  function sendOld(path, patch, at) {
    if (gone(path)) return Promise.resolve(null);
    return run(path, function () {
      var ref = D(path);
      return ref.get().then(function (s) {
        var cur = s.exists ? s.data() || {} : null;
        var body = cur ? fresher(path, cur, U.clone(patch), at) : U.clone(patch);
        if (!body || !Object.keys(body).length) return null;
        return cur ? ref.update(prepare(path, cur, body)) : create(path, ref, body);
      });
    });
  }
  function arm() {
    if (flushTimer || !waiting()) return;
    flushTimer = setTimeout(flush, Date.now() - since < 60000 ? 3000 : 15000);
  }
  function flush() {
    clearTimeout(flushTimer); flushTimer = null;
    Object.keys(held).forEach(function (path) {
      if (gone(path)) { delete held[path]; landed(path); persist(); return; }   // its topic was deleted in this page
      if (!pending[path]) patchDoc(path, {}).catch(function () { /* held again */ });
    });
    later.splice(0).forEach(function (t) { Promise.resolve().then(t).catch(function () { /* queued again by itself */ }); });
  }
  function wrote() {
    if (outage) { outage = false; U.toast('Saving works again. What you did meanwhile is saved.', { kind: 'good' }); }
    if (waiting()) setTimeout(flush, 0);
    wake();   // the bridge answers again: subscriptions it ended can start again
    retake();
  }
  // What earlier pages left that could not be sent when it was taken over: try again.
  function retake() {
    if (!untaken || !opened) return;
    untaken = false;
    Promise.resolve().then(restore).catch(function (e) { console.warn('outbox', e); });
  }
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('online', function () { if (waiting()) flush(); wake(); retake(); });
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', function () { if (!document.hidden) { if (waiting()) flush(); wake(); retake(); } });
  }
  function noteOutage() {
    if (!outage) {
      since = Date.now();
      // Not "kept here": a job made of several steps lives only as long as this page does.
      U.toast('Your work could not be saved just now. It will be saved as soon as the connection is back, so keep the app open until then.', { kind: 'bad', ms: 8000 });
    }
    outage = true;
    arm();
  }
  // A write failed after its retry. keep(): hold it for a resend (returns false when it cannot be
  // held). Rejects with e.queued set when the write will be resent. quiet: the caller tells Dan
  // itself and keeps what he typed for another go, so the store neither holds it nor toasts.
  function failed(e, keep, quiet) {
    tag(e);
    var kept = !quiet && !!keep && resendable(e) && keep() !== false;
    if (kept && e && typeof e === 'object') try { e.queued = true; } catch (x) { /* frozen */ }
    (quiet ? console.warn : console.error)('db write failed', e);
    if (kept) noteOutage();
    else if (!quiet) U.toast(e && e.code === 'quota_exceeded' ? U.errText(e) : 'Could not save just now: ' + U.errText(e), { kind: 'bad' });
    throw e;
  }
  // For work made of several steps (a read, then writes): run `job` again once the db answers,
  // if `e` says it is worth it. Returns e (marked queued) for the caller to rethrow.
  function retryLater(e, job) {
    tag(e);
    if (!resendable(e)) return e;
    if (e && typeof e === 'object') try { e.queued = true; } catch (x) { /* frozen */ }
    later.push(job);
    noteOutage();
    return e;
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
  // Saved work that arrived after the app opened (10-runtime.js, U.rt.late): what was learned
  // about topics from the in-memory store until then says nothing about the real one.
  U.on('rt-late', function () { known = {}; checking = {}; });
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
    // The round whose review cards were made only moves forward (a late write cannot unmake it).
    Object.keys(bi).forEach(function (iid) {
      var b = bi[iid], c = ci[iid];
      if (isObj(b) && isObj(c) && b.cardsRound != null && c.cardsRound != null && Number(b.cardsRound) < Number(c.cardsRound)) delete b.cardsRound;
    });
  }
  function prepare(path, cur, body) {
    upgradeLists(cur, body);
    if (/\/profile\/progress\//.test(path)) guardProgress(cur, body);
    return body;
  }

  // ---- an old patch against the doc as it is now ----
  // A patch left on the device by a page that closed before it landed may be days old, and Dan may
  // have used another device since. fresher() keeps only the parts not older than what the doc
  // holds now (null when nothing is left). `at` is when the oldest part of the patch was asked for.
  //   cards     a card learned again or reviewed since stays as it is (a card patch with no time
  //             of its own loses to one with more reviews); a missing card is made only whole,
  //             and not when its idea has been learned again since
  //   profile   a setting changed since stays (prefsAt: when each was set); a day's study minutes
  //             keep the larger count (a device's count for a day only grows)
  //   progress  the write-time rules above keep each round's first answers; on top, an idea that
  //             began a new round since loses this patch's round fields, and plain fields
  //             (lastIdea, calibration answers) written since stay
  function after(a, b) { return String(a || '') > String(b || ''); }
  function fresher(path, cur, patch, at) {
    if (/\/profile\/cards\/[^/]+$/.test(path)) return freshCards(cur, patch, at);
    if (/\/profile\/progress\/[^/]+$/.test(path)) return freshProgress(cur, patch, at);
    if (/\/profile$/.test(path)) return freshProfile(cur, patch, at);
    return patch;
  }
  function touchedAt(c) {   // the last time a card was learned or reviewed
    var t = String(c.learnedAt || c.createdAt || '');
    U.list(c.hist).forEach(function (e) { if (after(e.at, t)) t = String(e.at); });
    return t;
  }
  function reviewsOf(c) { return Math.max(U.list(c && c.hist).length, Number(c && c.s && c.s.reps) || 0); }
  function freshCards(cur, patch, at) {
    var have = isObj(cur.cards) ? cur.cards : {}, out = {}, learned = {};
    Object.keys(have).forEach(function (id) { var c = have[id]; if (isObj(c) && c.iid && after(c.learnedAt, learned[c.iid])) learned[c.iid] = String(c.learnedAt); });
    Object.keys(isObj(patch.cards) ? patch.cards : {}).forEach(function (id) {
      var pv = patch.cards[id], cv = have[id], own = isObj(pv) ? pv.learnedAt || pv.createdAt : null;
      // Not there: a whole card is made, unless its idea has been learned again since (a lesson
      // that may not ask this question any more).
      if (!isObj(cv)) { if (isObj(pv) && pv.type && !after(learned[pv.iid], own || at)) out[id] = pv; return; }
      if (after(touchedAt(cv), own || at)) return;
      if (!own && isObj(pv) && (pv.s || pv.hist) && reviewsOf(cv) > reviewsOf(pv)) return;
      out[id] = pv;
    });
    return Object.keys(out).length ? { cards: out } : null;
  }
  function freshProfile(cur, patch, at) {
    var body = {}, curAt = isObj(cur.prefsAt) ? cur.prefsAt : {}, ownAt = isObj(patch.prefsAt) ? patch.prefsAt : {};
    if (isObj(patch.prefs)) Object.keys(patch.prefs).forEach(function (k) {
      var t = ownAt[k] || at;
      if (after(curAt[k], t)) return;
      (body.prefs = body.prefs || {})[k] = patch.prefs[k];
      (body.prefsAt = body.prefsAt || {})[k] = t;
    });
    if (isObj(patch.days)) Object.keys(patch.days).forEach(function (day) {
      var rec = patch.days[day], now = isObj(cur.days) ? cur.days[day] : null;
      if (!isObj(rec)) return;
      Object.keys(rec).forEach(function (dev) {
        if (isObj(now) && Number(now[dev]) >= Number(rec[dev])) return;
        body.days = body.days || {};
        (body.days[day] = body.days[day] || {})[dev] = rec[dev];
      });
    });
    Object.keys(patch).forEach(function (k) { if (k !== 'prefs' && k !== 'prefsAt' && k !== 'days' && !(k in cur)) body[k] = patch[k]; });
    return Object.keys(body).length ? body : null;
  }
  function freshProgress(cur, patch, at) {
    var body = patch, have = isObj(cur.ideas) ? cur.ideas : {};
    if (after(cur.updatedAt, at)) {
      ['lastIdea', 'calibrationSkipped', 'updatedAt'].forEach(function (k) { delete body[k]; });
      if (isObj(body.calibration) && isObj(cur.calibration)) Object.keys(body.calibration).forEach(function (q) { if (cur.calibration[q] != null) delete body.calibration[q]; });
    }
    Object.keys(isObj(body.ideas) ? body.ideas : {}).forEach(function (iid) {
      var b = body.ideas[iid], c = have[iid];
      if (!isObj(b) || !isObj(c)) return;
      if (b.round == null && after(c.againAt, at)) ROUND_FIELDS.forEach(function (k) { delete b[k]; });
      if (isObj(b.past) && isObj(c.past)) Object.keys(b.past).forEach(function (r) { if (c.past[r]) delete b.past[r]; });
    });
    return body;
  }

  function setDoc(path, data) {
    if (gone(path)) return Promise.resolve(null);
    var tid = privTid(path);
    // A whole new document supersedes any older patch still waiting to be sent for it.
    if (held[path]) { delete held[path]; landed(path); persist(); }
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
  // opts.quiet (see failed): only when every patch merged into the write asked for it.
  function patchDoc(path, patch, opts) {
    if (gone(path)) return Promise.resolve(null);
    var loud = !(opts && opts.quiet);
    var p = pending[path];
    if (p) { deepMerge(p.patch, patch); p.loud = p.loud || loud; if (carrying[path] === p) persist(); return p.promise; }
    var base = held[path];
    delete held[path];
    p = pending[path] = latest[path] = { patch: base ? deepMerge(base, U.clone(patch)) : U.clone(patch), started: false, at: U.now(), loud: loud || !!base };
    if (base) carrying[path] = p;
    p.promise = U.sleep(120).then(function () {
      delete pending[path];
      if (gone(path)) return null;
      return run(path, function () { p.started = true; return writePatch(path, U.clone(p.patch)); });
    }).then(function (r) {
      if (latest[path] === p) delete latest[path];
      if (carrying[path] === p) { delete carrying[path]; landed(path); persist(); }
      return r;
    }, function (e) {
      if (latest[path] === p) delete latest[path];
      if (carrying[path] === p) { delete carrying[path]; persist(); }
      // A refused write (not held) drops what it carried: forget its time too, or a later held
      // write would be saved as older than it is and lose to staler data on restore.
      if (!resendable(e)) landed(path);
      return failed(e, function () {
        if (gone(path) || !holdable(path)) return false;
        if (!heldSince[path]) heldSince[path] = p.at;
        var n = latest[path];
        if (n && !n.started) { n.patch = deepMerge(U.clone(p.patch), n.patch); carrying[path] = n; }   // goes out with the newer one
        else held[path] = held[path] ? deepMerge(U.clone(p.patch), held[path]) : U.clone(p.patch);
        persist();
      }, !p.loud);
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
    }).catch(function (e) { return failed(e, function () { later.push(function () { return updateCard(tid, id, fn); }); }); });
  }
  function getDoc(path) { return retrying(function () { return D(path).get(); }).then(function (s) { return s.exists ? U.clone(s.data()) : null; }); }

  // ---- subscriptions that survive a dead bridge ----
  // onError(e, {retrying}) tells the view: retrying while it resubscribes after 'unavailable',
  // then (or at once, for any other code) retrying:false - the view shows an error with Try again.
  // The platform ends a listener with 'unavailable' only when its bridge stops answering, and a
  // fresh subscription is the only way back. So after the quick tries, one that died that way is
  // parked, not dropped: it tries again every WATCH_PARK_MS, and at once when the device comes
  // online or to the foreground or a write succeeds (wake()). The view hears retrying:false once;
  // the next snapshot brings it back to life. A try that fails for another reason (permission
  // denied, say) ends the subscription for good, so the view hears that too, even after parking.
  var parked = [];
  function wake() { parked.splice(0).forEach(function (revive) { revive(); }); }
  function subscribe(source, onNext, onError) {
    var stop = null, dead = false, tries = 0, timer = null, told = false;
    function quit() { if (stop) { try { stop(); } catch (e) { /* already gone */ } stop = null; } }
    function unpark() { parked = parked.filter(function (f) { return f !== revive; }); }
    function revive() { if (dead) return; unpark(); clearTimeout(timer); timer = null; start(); }
    function fail(e) {
      if (dead) return;
      tag(e);
      console.warn('watch failed', e && (e.code || e.message), e);
      quit();
      var again = transient(e) && tries < 3;
      // `told`: the view already knows the bridge is down; only a failure that ends it is news.
      if (onError && (!told || !transient(e))) try { onError(e, { retrying: again }); } catch (x) { console.error(x); }
      if (again) { tries++; timer = setTimeout(start, S.WATCH_RETRY_MS * Math.pow(2, tries - 1) + Math.random() * 300); return; }
      told = true;
      if (transient(e)) { unpark(); parked.push(revive); timer = setTimeout(revive, S.WATCH_PARK_MS); }
    }
    function start() {
      if (dead) return;
      try { stop = source().onSnapshot(function (snap) { if (dead) return; tries = 0; told = false; onNext(snap); }, fail); }
      catch (e) { fail(e); }
    }
    start();
    return function () { dead = true; clearTimeout(timer); unpark(); quit(); };
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

  // A private doc's path names Dan's user id, known only once the runtime is ready. A write asked
  // for before then (a reading setting changed while the app is still opening) waits for it, so it
  // reaches his profile instead of the in-memory stand-in (or an invalid 'local/me/…' db path).
  // It also waits while what earlier pages left in the outbox is taken over, so those older
  // patches go out under this page's newer ones, never after them.
  var opened = false;
  var opening = U.rt.ready.then(function () { return restore(); })
    .catch(function (e) { console.warn('outbox', e); })
    .then(function () { opened = true; });
  function whenKnown(fn) { return opened ? fn() : opening.then(fn); }
  // Saved work that answers only after the app opened (an 'rt-late' notice for the db or the user
  // id): the outbox left by earlier pages can be taken over only now.
  U.on('rt-late', function () { if (opened && outboxKey()) Promise.resolve(restore()).catch(function (e) { console.warn('outbox', e); }); });

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
    retryLater: retryLater,
    flush: flush,
    setDoc: setDoc, patchDoc: patchDoc, getDoc: getDoc, watchDoc: watchDoc,
    // Minutes studied on one day, whichever shape days[day] has.
    minutesOn: function (v) {
      if (typeof v === 'number') return isFinite(v) ? v : 0;
      if (!isObj(v)) return 0;
      return Object.keys(v).reduce(function (sum, k) { var n = Number(v[k]); return sum + (isFinite(n) ? n : 0); }, 0);
    },
    // Subscriptions ended by a dead bridge: first quick resubscribe after WATCH_RETRY_MS (doubling,
    // 3 tries), then one every WATCH_PARK_MS until it answers.
    WATCH_RETRY_MS: 400, WATCH_PARK_MS: 30000,
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
    // opts.quiet: a failure is the caller's to tell (no toast) and is not held for a resend.
    update: function (tid, iid, patch, opts) { patch.updatedAt = U.now(); return patchDoc(S.paths.lesson(tid, iid), patch, opts); },
    // What a lesson doc means for Dan. A lesson opens only when it is whole: 'ready' is status
    // ready with its lesson (the interactive built and tested, or a note saying why there is
    // none). 'preparing': a job is writing or building it, by `live` (this page's own status for
    // it, from U.gen.status) or, without one, a writing/building doc touched in the last
    // BUSY_MS (a running job's heartbeat touches it every 45 s, 31-generate.js). 'failed', or
    // 'none': nothing yet, or work that stopped (opening the lesson prepares it). A doc still
    // writing or building is never a lesson to open or study.
    BUSY_MS: 4 * 60 * 1000,
    state: function (doc, live) {
      var busy = !!doc && (doc.status === 'writing' || doc.status === 'building');
      if (doc && doc.status === 'ready' && doc.lesson) return 'ready';
      if (live === 'writing' || live === 'waiting' || live === 'building') return 'preparing';
      if (doc && doc.status === 'failed') return 'failed';
      // This page's job stopped (live 'failed' or 'ready' with no ready doc): it left the doc.
      if (busy && !live) { var t = Date.parse(doc.updatedAt || ''); if (isFinite(t) && Date.now() - t < S.lesson.BUSY_MS) return 'preparing'; }
      return 'none';
    },
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
    patch: function (tid, patch) { patch.updatedAt = U.now(); return whenKnown(function () { return patchDoc(S.paths.progress(tid), patch); }); },
    all: function () { return listColl(priv('profile/progress')).then(function (l) { var o = {}; l.forEach(function (d) { o[d.__id] = d; }); return o; }); },
  };
  S.cards = {
    get: function (tid) { return getDoc(S.paths.cards(tid)).then(function (d) { return d || { cards: {} }; }); },
    patch: function (tid, patch) { return whenKnown(function () { return patchDoc(S.paths.cards(tid), patch); }); },
    update: function (tid, id, fn) { return whenKnown(function () { return updateCard(tid, id, fn); }); },
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
    // Each setting written carries the time it was set (prefsAt[key]), so an older write sent late
    // (from a page that closed before it landed) can tell it is older and leave it be.
    patch: function (patch) {
      if (isObj(patch.prefs)) {
        var now = U.now(), at = patch.prefsAt = isObj(patch.prefsAt) ? patch.prefsAt : {};
        Object.keys(patch.prefs).forEach(function (k) { if (!at[k]) at[k] = now; });
      }
      return whenKnown(function () { return patchDoc(S.paths.profile(), patch); });
    },
  };
  return S;
})();

// Record study time for "this week". Each device keeps its own running total for the day
// (profile.days[day][deviceId]), so two devices logging at once never undo each other; calls in
// this page are queued so none is lost. An old single number for the day is kept as `legacy`.
// Every tab of one browser shares the device id, so the running total lives where all of them see
// it (localStorage 'mu.minutes'): each tab adds its minutes to it and writes the sum, and a tab
// back from the background never writes a total older than the other tab's. (A key per tab or
// page would also work, but would add a key to the profile for every visit.) Without storage the
// total is this page's own.
U.logStudy = (function () {
  var chain = Promise.resolve(), mem = {}, KEY = 'mu.minutes';
  function who() { return String(U.rt.uid || ''); }
  function load(day) {
    var o = null;
    try { o = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { /* storage blocked */ }
    if (o && o.day === day && o.uid === who() && isFinite(Number(o.n))) return Number(o.n);
    return mem[day] == null ? null : mem[day];
  }
  function save(day, n) {
    mem[day] = n;
    try { localStorage.setItem(KEY, JSON.stringify({ uid: who(), day: day, n: n })); } catch (e) { /* this page's count only */ }
  }
  return function (minutes) {
    var day = U.studyDay(), dev = U.device();   // the review's day: minutes after midnight count for the evening
    var job = chain.then(function () {
      return (load(day) == null ? U.store.profile.get() : Promise.resolve(null)).then(function (p) {
        var rec = {}, base = load(day);   // another tab may have started the day meanwhile
        if (base == null) {
          var cur = p && p.days ? p.days[day] : null;
          base = cur && typeof cur === 'object' ? (Number(cur[dev]) || 0) : 0;
          if (typeof cur === 'number' && cur > 0) rec.legacy = cur;
        }
        var n = Math.round(base + (Number(minutes) || 0));
        save(day, n);
        rec[dev] = n;
        var patch = { days: {} };
        patch.days[day] = rec;
        return U.store.profile.patch(patch);
      });
    });
    chain = job.catch(function () {});
    return job;
  };
})();
