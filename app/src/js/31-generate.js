// Generation pipelines (docs/ARCHITECTURE.md sections 4, 7 and 9).
//
//   U.gen.createTopic(query, {level, onCreated(tid)}) -> Promise<tid>   resolves once planned
//   U.gen.replan(tid) -> Promise<tid>                plans a failed topic again
//   U.gen.research(tid) -> Promise<result|null>      (re)runs source research; never rejects
//   U.gen.ensureLesson(tid, iid, {onStatus(text)}) -> Promise<lessonDoc>
//   U.gen.relearn(tid, iid, {onStatus}) -> Promise<lessonDoc>   new lesson, different interactive
//   U.gen.grade(say, answer, attempt, {previous, title}) -> Promise<{met, verdict, nailed, followUp, model?}>
//   U.gen.tutor(messages, context, {onText(textSoFar), signal}) -> Promise<string>
//   U.gen.status(tid) -> {planning, research, lessons:{iid: status}}   this page's live work
// Progress is also broadcast as U.emit('gen', {tid, iid, kind, status, text}).
//
// Lesson docs move writing -> building -> ready (or failed, with a readable `error`). While a job
// runs, the doc's updatedAt is refreshed every 45 s; a 'writing'/'building' doc left by another
// device is watched until it settles, and taken over once it has been silent for 4 minutes.
(function () {
  'use strict';
  var U = window.U;
  var CFG = {
    STALE_MS: 4 * 60 * 1000,          // a busy lesson doc silent this long is abandoned
    HEARTBEAT_MS: 45 * 1000,          // how often a running job refreshes its doc
    RESEARCH_WAIT_MS: 120 * 1000,     // longest a lesson waits for research (from research start)
    RESEARCH_STALE_MS: 8 * 60 * 1000, // a 'running' research older than this is abandoned
    RESEARCH_RETRY_MS: 10 * 60 * 1000, // a lesson re-tries 'failed'/'unavailable' research this old
    KNOWN_MAX: 60,
  };
  var LEVELS = ['new', 'some', 'solid'];
  var NO_INTERACTIVE = 'The interactive for this idea could not be built and tested this time, so this lesson carries on without it.';
  var PAGE = U.id('p');
  var DEVICE = (function () {
    try {
      if (typeof localStorage === 'undefined') return U.id('d');
      var v = localStorage.getItem('mu.device');
      if (!v) { v = U.id('d'); localStorage.setItem('mu.device', v); }
      return v;
    } catch (e) { return U.id('d'); }
  })();

  var jobs = {};        // 'tid/iid' -> lesson job (de-duplicates work in this page)
  var plans = {};       // tid -> planning promise
  var researching = {}; // tid -> research promise
  var live = {};        // tid -> {planning, research, lessons:{iid: status}}

  function noop() {}
  function s(x) { return x == null ? '' : String(x); }
  function one(x) { return s(x).replace(/\s+/g, ' ').trim(); }
  function isStr(x) { return typeof x === 'string' && x.trim().length > 0; }
  function age(iso) { var t = Date.parse(iso || ''); return isFinite(t) ? Date.now() - t : Infinity; }
  function fresh(iso) { return age(iso) < CFG.STALE_MS; }
  function safe(fn, a) { try { fn(a); } catch (e) { console.error(e); } }

  // ---------- live state for the UI ----------
  function liveOf(tid) { return (live[tid] = live[tid] || { planning: false, research: null, lessons: {} }); }
  function emit(tid, iid, kind, status, text) { U.emit('gen', { tid: tid, iid: iid || null, kind: kind, status: status, text: text || '' }); }

  // ---------- readable errors ----------
  function friendly(e, doing) {
    var code = e && e.code;
    if (code === 'not_granted') return 'Claude needs your permission to ' + doing + '. Tap "Allow" when the app asks (or allow Claude for this app in its settings), then try again.';
    if (code === 'rate_limited') return 'Claude is busy right now. Wait a minute, then try again.';
    if (code === 'truncated') return 'Claude\'s answer was cut off before it finished. Try again; it usually works second time.';
    if (code === 'invalid' || code === 'bad_json') return 'Claude\'s answer came back in the wrong shape, so nothing was saved. Try again.';
    if (code === 'not_found') return s(e.message) || 'That could not be found.';
    return U.errText(e);
  }
  function failure(e, doing) {
    var out = { code: (e && e.code) || 'error', message: friendly(e, doing) };
    if (e && e.message && e.message !== out.message) out.detail = String(e.message).slice(0, 600);
    return out;
  }

  // ---------- ideas Dan already knows (from other topics' progress) ----------
  var knownCache = null;
  function knownIdeas(excludeTid) {
    if (!knownCache || Date.now() - knownCache.at > 60000) {
      var p = Promise.all([
        U.store.progress && U.store.progress.all ? U.store.progress.all() : {},
        U.store.topics && U.store.topics.list ? U.store.topics.list() : [],
      ]).then(function (r) {
        var prog = r[0] || {}, byId = {}, out = [];
        (r[1] || []).forEach(function (t) { if (t) byId[t.id || t.__id] = t; });
        Object.keys(prog).forEach(function (tid) {
          var t = byId[tid], ideas = (prog[tid] && prog[tid].ideas) || {};
          if (!t || !Array.isArray(t.ideas)) return;
          t.ideas.forEach(function (i) {
            var p = ideas[i.id];
            if (p && (p.stage === 'done' || p.doneAt || p.known)) out.push({ tid: tid, title: i.title, topic: t.title, at: p.doneAt || p.startedAt || '' });
          });
        });
        return out.sort(function (a, b) { return s(b.at).localeCompare(s(a.at)); });
      }).catch(function () { return []; });
      knownCache = { at: Date.now(), p: p };
    }
    return knownCache.p.then(function (list) {
      return list.filter(function (k) { return k.tid !== excludeTid; }).slice(0, CFG.KNOWN_MAX).map(function (k) { return { title: k.title, topic: k.topic }; });
    });
  }

  // ==================================================================================
  // Topics: create, plan, replan
  // ==================================================================================
  function tidyTitle(q) { q = one(q).slice(0, 90); return q.charAt(0).toUpperCase() + q.slice(1); }

  function createTopic(query, opts) {
    opts = opts || {};
    var q = s(query).replace(/\s+/g, ' ').trim();
    if (!q) return Promise.reject({ code: 'invalid', message: 'Type something you would like to learn first.' });
    if (q.length > 300) q = q.slice(0, 300);
    var level = LEVELS.indexOf(opts.level) >= 0 ? opts.level : 'new';
    var tid = U.slug(q) + '-' + Math.random().toString(36).slice(2, 7);
    var now = U.now(), title = tidyTitle(q);
    var doc = {
      id: tid, title: title, query: q, createdAt: now, updatedAt: now, status: 'planning',
      hook: '', oneBreath: '', level: level, ideas: [], calibration: [],
      research: { status: 'none', at: null, sources: 0 }, hue: U.hash(title) % 360, error: null,
    };
    liveOf(tid).planning = true;
    return U.store.topic.create(doc).then(function () {
      emit(tid, null, 'plan', 'planning', 'Planning your topic…');
      if (typeof opts.onCreated === 'function') safe(opts.onCreated, tid);
      return plan(tid);
    }, function (e) { delete live[tid]; throw failure(e, 'save topics'); });
  }

  function cleanPlan(p) {
    return {
      title: one(p.title).slice(0, 90),
      hook: one(p.hook),
      oneBreath: one(p.oneBreath),
      ideas: p.ideas.map(function (i) {
        var o = { id: i.id, title: one(i.title), oneLine: one(i.oneLine), deps: i.deps.slice(), kind: i.kind };
        if (i.known === true) o.known = true;
        return o;
      }),
      calibration: p.calibration.map(function (c) {
        var o = { id: c.id, q: one(c.q), options: c.options.map(one), answer: c.answer, why: one(c.why) };
        if (c.iid) o.iid = c.iid;
        return o;
      }),
    };
  }

  function plan(tid) {
    if (plans[tid]) return plans[tid];
    var L = liveOf(tid), found = false;
    L.planning = true;
    var p = U.store.topic.get(tid).then(function (t) {
      if (!t) throw { code: 'not_found', message: 'This topic could not be found. It may have been deleted.' };
      found = true;
      return knownIdeas(tid).then(function (known) {
        return U.ask(U.prompts.planTopic(t.query || t.title, { level: t.level, known: known }), {
          tier: 'quick', json: true, label: 'plan-topic', schema: U.validate.plan,
        });
      });
    }).then(function (raw) {
      var pl = cleanPlan(raw);
      return U.store.topic.update(tid, {
        status: 'ready', title: pl.title, hook: pl.hook, oneBreath: pl.oneBreath, ideas: pl.ideas,
        calibration: pl.calibration, error: null, plannedAt: U.now(),
      });
    }).then(function () {
      L.planning = false;
      emit(tid, null, 'plan', 'ready', 'Planned.');
      afterPlan(tid);
      return tid;
    }, function (e) {
      L.planning = false;
      var f = failure(e, 'plan topics');
      emit(tid, null, 'plan', 'failed', f.message);
      if (!found) throw f;
      return U.store.topic.update(tid, { status: 'failed', error: f.message }).catch(noop).then(function () { throw f; });
    });
    plans[tid] = p;
    p.then(clear, clear);
    function clear() { if (plans[tid] === p) delete plans[tid]; }
    return p;
  }

  function replan(tid) {
    if (plans[tid]) return plans[tid];
    return U.store.topic.get(tid).then(function (t) {
      if (!t) throw { code: 'not_found', message: 'This topic could not be found. It may have been deleted.' };
      return U.store.topic.update(tid, { status: 'planning', error: null }).then(function () { return plan(tid); });
    });
  }

  // After planning: research in the background, and get lesson 1 ready.
  function afterPlan(tid) {
    research(tid);
    U.store.topic.get(tid).then(function (t) {
      var first = t && (t.ideas || []).filter(function (i) { return !i.known; })[0];
      if (first) return ensureLesson(tid, first.id, {});
    }).catch(noop);
  }

  // ==================================================================================
  // Research (Parallel Search through sample tools), with source checking
  // ==================================================================================

  // Everything the research tools returned, so sources can be checked against it: a source
  // survives only if its URL appeared in a tool result (or was opened) and its quote is on it.
  function Corpus() {
    var raw = [], norm = [];
    function unescape(t) {
      return String(t)
        .replace(/\\u([0-9a-fA-F]{4})/g, function (_, h) { return String.fromCharCode(parseInt(h, 16)); })
        .replace(/\\[nrt]/g, ' ')
        .replace(/\\(["\\/])/g, '$1');
    }
    function esc(x) { return x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
    return {
      calls: 0,
      add: function (text) { var t = unescape(text); raw.push(t.toLowerCase()); norm.push(normText(t)); },
      hasUrl: function (url) {
        var key = U.prompts.urlKey(url);
        if (!key || key.indexOf('.') < 0) return false;
        var re = new RegExp(esc(key) + '/?(?=$|[\\s"\'<>\\\\)\\]},?#|])');
        return raw.some(function (t) { return re.test(t); });
      },
      hasQuote: function (quote) {
        var hay = norm.join(' \u0001 ');
        var frags = s(quote).split(/\.\.\.|…/).map(normText).filter(function (f) { return f.length >= 8; });
        if (!frags.length) frags = [normText(quote)];
        return frags.every(function (f) { return f && hay.indexOf(f) >= 0; });
      },
    };
  }
  function normText(t) {
    return s(t).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/&(amp|nbsp|quot|apos|lt|gt|#\d+);/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function wrapTools(tools, corpus) {
    return (tools || []).map(function (t) {
      var w = {};
      Object.keys(t).forEach(function (k) { w[k] = t[k]; });
      w.execute = function (input) {
        corpus.calls++;
        return Promise.resolve().then(function () { return t.execute(input); }).then(function (out) {
          var text = typeof out === 'string' ? out : JSON.stringify(out);
          if (!/^Tool error \(/.test(text)) {
            corpus.add(text);
            if (t.name === 'web_fetch' && input) corpus.add([].concat(input.urls || input.url || []).join('\n'));
          }
          return out;
        });
      };
      return w;
    });
  }

  // raw = research reply {sources, topic:{notes}, ideas:{iid:{notes}}} -> per-key docs.
  function filterResearch(raw, corpus, ideaIds) {
    var keep = {}, sources = [], dropped = [];
    (Array.isArray(raw && raw.sources) ? raw.sources : []).forEach(function (x) {
      if (!x || !isStr(x.url)) return;
      if (!corpus.hasUrl(x.url)) { dropped.push({ n: x.n, url: x.url, why: 'not a page the tools returned' }); return; }
      if (!corpus.hasQuote(x.quote)) { dropped.push({ n: x.n, url: x.url, why: 'quote not found in what the tools returned' }); return; }
      keep[x.n] = sources.length + 1;
      sources.push({ n: sources.length + 1, title: one(x.title), url: one(x.url), quote: one(x.quote) });
    });
    function notes(list) {
      return (Array.isArray(list) ? list : []).map(function (n) {
        var ids = (Array.isArray(n && n.sourceIds) ? n.sourceIds : []).map(function (i) { return keep[i]; }).filter(Boolean);
        var o = { claim: one(n && n.claim), sourceIds: ids.filter(function (x, i) { return ids.indexOf(x) === i; }) };
        if (n && isStr(n.contested)) o.contested = one(n.contested);
        return o;
      }).filter(function (n) { return n.claim && (n.sourceIds.length || n.contested); });
    }
    function doc(list) {
      var ns = notes(list), used = {};
      ns.forEach(function (n) { n.sourceIds.forEach(function (i) { used[i] = 1; }); });
      return { notes: ns, sources: sources.filter(function (x) { return used[x.n]; }) };
    }
    var docs = { topic: doc(raw && raw.topic && raw.topic.notes) };
    ideaIds.forEach(function (iid) { docs[iid] = doc(raw && raw.ideas && raw.ideas[iid] && raw.ideas[iid].notes); });
    if (dropped.length) console.warn('research: dropped ' + dropped.length + ' unverifiable source(s)', dropped);
    return { docs: docs, kept: sources.length, dropped: dropped };
  }

  function runResearch(topic) {
    var corpus = Corpus(), ids = topic.ideas.map(function (i) { return i.id; });
    return U.research.tools(function (call) {
      if (call && call.tool === 'web_search') emit(topic.id, null, 'research', 'running', 'Searching for sources…');
      if (call && call.tool === 'web_fetch') emit(topic.id, null, 'research', 'running', 'Reading sources…');
    }).then(function (tools) {
      if (!tools || !tools.length) throw { code: 'unavailable', message: 'The research tools did not load.' };
      return U.ask(U.prompts.research(topic, { ideas: topic.ideas }), {
        tier: 'default', json: true, label: 'research', tools: wrapTools(tools, corpus),
        schema: function (o) { return U.validate.research(o, { ideas: ids }); },
      });
    }).then(function (raw) {
      var res = filterResearch(raw, corpus, ids), at = U.now();
      var writes = [U.store.research.set(topic.id, 'topic', { notes: res.docs.topic.notes, sources: res.docs.topic.sources, at: at })];
      ids.forEach(function (iid) {
        var d = res.docs[iid];
        if (d.notes.length) writes.push(U.store.research.set(topic.id, iid, { notes: d.notes, sources: d.sources, at: at }));
      });
      return Promise.all(writes).then(function () { return res; });
    });
  }

  // Starts (or joins) research for a topic. Never rejects: failures land in topic.research.
  function research(tid) {
    if (researching[tid]) return researching[tid];
    var L = liveOf(tid);
    var p = Promise.resolve().then(function () { return U.research.available(); }).then(function (ok) {
      if (!ok) {
        L.research = 'unavailable';
        emit(tid, null, 'research', 'unavailable', '');
        return U.store.topic.update(tid, { research: { status: 'unavailable', at: U.now(), sources: 0 } }).then(function () { return null; });
      }
      return U.store.topic.get(tid).then(function (t) {
        if (!t || !Array.isArray(t.ideas) || !t.ideas.length) throw { code: 'not_found', message: 'There is no plan to research yet.' };
        L.research = 'running';
        emit(tid, null, 'research', 'running', 'Looking for sources…');
        return U.store.topic.update(tid, { research: { status: 'running', at: U.now(), sources: 0, error: null } }).then(function () { return runResearch(t); });
      });
    }).then(function (res) {
      if (!res) return null;
      L.research = 'done';
      emit(tid, null, 'research', 'done', res.kept + ' sources checked');
      return U.store.topic.update(tid, { research: { status: 'done', at: U.now(), sources: res.kept, dropped: res.dropped.length, error: null } }).then(function () { return res; });
    }).catch(function (e) {
      console.warn('research failed', e);
      L.research = 'failed';
      var f = failure(e, 'check sources');
      emit(tid, null, 'research', 'failed', f.message);
      if (e && e.code === 'not_found') return null;
      return U.store.topic.update(tid, { research: { status: 'failed', at: U.now(), sources: 0, error: f.message } }).catch(noop).then(function () { return null; });
    });
    researching[tid] = p;
    p.then(function () { if (researching[tid] === p) delete researching[tid]; });
    return p;
  }

  function loadResearch(tid, iid) {
    return Promise.all([U.store.research.get(tid, 'topic'), U.store.research.get(tid, iid)]).then(function (r) {
      return r[0] || r[1] ? { topic: r[0], idea: r[1] } : null;
    }, function () { return null; });
  }
  function waitForTopicResearch(tid, ms) {
    return new Promise(function (resolve) {
      var stop = null, done = false, timer = setTimeout(finish, ms);
      function finish() { if (done) return; done = true; clearTimeout(timer); if (stop) stop(); resolve(); }
      stop = U.store.topic.watch(tid, function (t) { if (!t || !t.research || t.research.status !== 'running') finish(); });
      if (done && stop) stop();
    });
  }
  // The research a lesson should be written from: waits (bounded) for research that is running.
  function researchFor(topic, iid, job) {
    var tid = topic.id, r = topic.research || {}, wait = null;
    var started = Date.parse(r.at || '') || Date.now();
    if (researching[tid]) wait = researching[tid];
    else if (r.status === 'running' && age(r.at) < CFG.RESEARCH_STALE_MS) wait = 'watch';
    else if (!r.status || r.status === 'none' || r.status === 'running' ||
      ((r.status === 'failed' || r.status === 'unavailable') && age(r.at) > CFG.RESEARCH_RETRY_MS)) { started = Date.now(); wait = research(tid); }
    if (!wait) return loadResearch(tid, iid);
    var left = Math.max(5000, CFG.RESEARCH_WAIT_MS - (Date.now() - started));
    progress(job, 'Checking sources for this idea…', 'writing');
    var p = wait === 'watch' ? waitForTopicResearch(tid, left) : Promise.race([wait.catch(noop), U.sleep(left)]);
    return p.then(function () { return loadResearch(tid, iid); });
  }

  // ==================================================================================
  // Lessons
  // ==================================================================================
  function newJob(tid, iid, onStatus) {
    var job = { tid: tid, iid: iid, key: tid + '/' + iid, subs: [], text: '', hb: null, promise: null };
    subscribe(job, onStatus);
    jobs[job.key] = job;
    return job;
  }
  function subscribe(job, fn) { if (typeof fn === 'function') { job.subs.push(fn); if (job.text) safe(fn, job.text); } }
  function progress(job, text, status) {
    if (status) liveOf(job.tid).lessons[job.iid] = status;
    if (text && text !== job.text) { job.text = text; job.subs.forEach(function (fn) { safe(fn, text); }); }
    emit(job.tid, job.iid, 'lesson', status || liveOf(job.tid).lessons[job.iid] || 'writing', text);
  }
  function settle(job) {
    function done() { stopBeat(job); if (jobs[job.key] === job) delete jobs[job.key]; }
    job.promise.then(function (doc) {
      liveOf(job.tid).lessons[job.iid] = (doc && doc.status) || 'ready';
      done();
    }, function () { liveOf(job.tid).lessons[job.iid] = 'failed'; done(); });
    return job.promise;
  }
  function beat(job) {
    stopBeat(job);
    job.hb = setInterval(function () { U.store.lesson.update(job.tid, job.iid, {}).catch(noop); }, CFG.HEARTBEAT_MS);
  }
  function stopBeat(job) { if (job.hb) { clearInterval(job.hb); job.hb = null; } }
  function busy(doc) { return doc && (doc.status === 'writing' || doc.status === 'building'); }
  // Left by this device with no job running for it here (an earlier load of the app, or a job
  // that ended without saving): that work died with the page, so there is nothing to wait for.
  function abandoned(doc) { return !!(doc.by && doc.by.device === DEVICE); }

  function ensureLesson(tid, iid, opts) {
    opts = opts || {};
    var job = jobs[tid + '/' + iid];
    if (job) { subscribe(job, opts.onStatus); return job.promise; }
    job = newJob(tid, iid, opts.onStatus);
    job.promise = U.store.lesson.get(tid, iid).then(function (doc) {
      if (doc && doc.status === 'ready' && doc.lesson) return doc;
      if (busy(doc) && fresh(doc.updatedAt) && !abandoned(doc)) {
        progress(job, 'Your other device is preparing this lesson. Waiting for it…', 'waiting');
        return watchOther(tid, iid).then(function (d) {
          return d || U.store.lesson.get(tid, iid).then(function (now) { return takeOver(job, now); });
        });
      }
      return takeOver(job, doc);
    });
    return settle(job);
  }
  // A lesson already written but left at 'building' only needs its interactive; anything else is rewritten.
  function takeOver(job, doc) {
    if (doc && doc.status === 'ready' && doc.lesson) return doc;
    if (doc && doc.status === 'building' && doc.lesson) return resume(job, doc);
    return write(job, { avoid: doc && doc.avoid });
  }

  // Watch a lesson another device is writing. Resolves the ready doc, or null to take over
  // (it failed, vanished or went silent for STALE_MS).
  function watchOther(tid, iid) {
    return new Promise(function (resolve) {
      var stop = null, done = false, timer = null;
      function finish(v) { if (done) return; done = true; clearTimeout(timer); if (stop) stop(); resolve(v); }
      stop = U.store.lesson.watch(tid, iid, function (doc) {
        if (done) return;
        if (!doc || doc.status === 'failed') return finish(null);
        if (doc.status === 'ready' && doc.lesson) return finish(U.clone(doc));
        if (!fresh(doc.updatedAt)) return finish(null);
        clearTimeout(timer);
        timer = setTimeout(function () { finish(null); }, Math.max(500, CFG.STALE_MS - age(doc.updatedAt) + 500));
      });
      if (done && stop) stop();
    });
  }

  function relearn(tid, iid, opts) {
    opts = opts || {};
    var job = jobs[tid + '/' + iid];
    if (job) { subscribe(job, opts.onStatus); return job.promise; }
    job = newJob(tid, iid, opts.onStatus);
    job.promise = U.store.lesson.get(tid, iid).then(function (doc) {
      var avoid = [], brief = doc && ((doc.interactive && doc.interactive.brief) || (doc.lesson && doc.lesson.interactive && doc.lesson.interactive.brief));
      if (isStr(brief)) avoid.push(brief);
      [].concat((doc && doc.avoid) || []).forEach(function (a) { if (isStr(a) && avoid.indexOf(a) < 0) avoid.push(a); });
      return write(job, { avoid: avoid.slice(0, 3) });
    });
    return settle(job);
  }

  // Briefs of the ready lessons this idea builds on, so the writer can refer back to them.
  function priorLessons(topic, idea) {
    var deps = (idea.deps || []).slice(-3);
    return Promise.all(deps.map(function (d) {
      return U.store.lesson.get(topic.id, d).then(function (doc) {
        var i = (topic.ideas || []).filter(function (x) { return x.id === d; })[0];
        var it = doc && doc.status === 'ready' && doc.lesson && doc.lesson.interactive;
        return it ? { title: (i && i.title) || d, brief: it.brief } : null;
      }, function () { return null; });
    })).then(function (list) { return list.filter(Boolean); });
  }

  function write(job, o) {
    o = o || {};
    var tid = job.tid, iid = job.iid, topic, idea, lr = null, wrote = false;
    var avoid = [].concat(o.avoid || []).filter(isStr);
    progress(job, 'Reading the plan for this idea…', 'writing');
    return (plans[tid] ? plans[tid].catch(noop) : Promise.resolve()).then(function () {
      return U.store.topic.get(tid);
    }).then(function (t) {
      if (!t || !Array.isArray(t.ideas)) throw { code: 'not_found', message: 'This topic could not be found. It may have been deleted.' };
      idea = t.ideas.filter(function (i) { return i.id === iid; })[0];
      if (!idea) throw { code: 'not_found', message: 'This idea is not part of the topic any more.' };
      topic = t;
      return U.store.lesson.set(tid, iid, {
        status: 'writing', error: null, lesson: null, interactive: null, sourced: false,
        by: { device: DEVICE, page: PAGE }, avoid: avoid.length ? avoid : null, startedAt: U.now(),
      });
    }).then(function () {
      wrote = true;
      beat(job);
      return researchFor(topic, iid, job);
    }).then(function (rsrch) {
      lr = U.prompts.lessonResearch(rsrch, iid);
      var allowed = lr && lr.sources.length ? lr.sources : null;
      return Promise.all([knownIdeas(tid), priorLessons(topic, idea)]).then(function (r) {
        progress(job, allowed ? 'Writing your lesson from ' + allowed.length + ' checked source' + (allowed.length === 1 ? '' : 's') + '…' : 'Writing your lesson…', 'writing');
        return U.ask(U.prompts.writeLesson(topic, idea, { research: rsrch, known: r[0], avoid: avoid, prior: r[1] }), {
          tier: 'default', json: true, label: 'write-lesson',
          schema: function (x) { return U.validate.lesson(x, { iid: iid, sources: allowed }); },
        });
      });
    }).then(function (raw) {
      var lesson = finaliseLesson(raw, iid, lr);
      var sourced = lesson.sources.length > 0;
      if (!lesson.interactive) {
        return U.store.lesson.update(tid, iid, { status: 'ready', lesson: lesson, sourced: sourced, interactive: null, note: null, error: null });
      }
      progress(job, 'Building your interactive…', 'building');
      return U.store.lesson.update(tid, iid, { status: 'building', lesson: lesson, sourced: sourced }).then(function () {
        return buildInteractive(topic, idea, lesson, avoid, job);
      }).then(function (built) {
        progress(job, built ? 'Interactive tested and ready.' : 'Finishing without the interactive…', 'building');
        return U.store.lesson.update(tid, iid, { status: 'ready', interactive: built, note: built ? null : NO_INTERACTIVE, error: null });
      });
    }).then(function () {
      stopBeat(job);
      progress(job, 'Ready.', 'ready');
      return U.store.lesson.get(tid, iid);
    }).catch(function (e) {
      stopBeat(job);
      var f = failure(e, 'write lessons');
      progress(job, f.message, 'failed');
      if (!wrote) throw f;
      return U.store.lesson.update(tid, iid, { status: 'failed', error: f.message, errorCode: f.code, errorDetail: f.detail || null })
        .catch(noop).then(function () { throw f; });
    });
  }

  // Finish a lesson whose text was saved but whose interactive build never completed.
  function resume(job, doc) {
    var tid = job.tid, iid = job.iid, wrote = false;
    var avoid = [].concat(doc.avoid || []).filter(isStr);
    progress(job, 'Finishing the interactive for this lesson…', 'building');
    return U.store.topic.get(tid).then(function (t) {
      var idea = t && (t.ideas || []).filter(function (i) { return i.id === iid; })[0];
      if (!idea) return write(job, { avoid: avoid });
      return U.store.lesson.update(tid, iid, { status: 'building', by: { device: DEVICE, page: PAGE }, error: null }).then(function () {
        wrote = true;
        beat(job);
        return buildInteractive(t, idea, doc.lesson, avoid, job);
      }).then(function (built) {
        return U.store.lesson.update(tid, iid, { status: 'ready', interactive: built, note: built ? null : NO_INTERACTIVE, error: null });
      }).then(function () {
        stopBeat(job);
        progress(job, 'Ready.', 'ready');
        return U.store.lesson.get(tid, iid);
      }, function (e) {
        stopBeat(job);
        var f = failure(e, 'build interactives');
        progress(job, f.message, 'failed');
        if (!wrote) throw f;
        return U.store.lesson.update(tid, iid, { status: 'failed', error: f.message, errorCode: f.code, errorDetail: f.detail || null })
          .catch(noop).then(function () { throw f; });
      });
    });
  }

  function buildInteractive(topic, idea, lesson, avoid, job) {
    var I = U.interactive;
    if (!I || typeof I.build !== 'function') return Promise.resolve(null);
    return Promise.resolve().then(function () {
      return I.build(topic, idea, lesson, { onStatus: function (t) { if (isStr(t)) progress(job, t, 'building'); }, avoid: avoid[0] || null });
    }).then(function (r) { return r && isStr(r.html) ? r : null; }, function (e) { console.warn('interactive build failed', e); return null; });
  }

  // Map the model's sources onto the checked research sources, drop anything else, renumber
  // 1..n in order of first citation and rewrite every [^n] (and numbers[].source) to match.
  var FIELD_ORDER = ['iid', 'title', 'predict', 'interactive', 'explain', 'analogy', 'say', 'checks', 'confidence', 'contested'];
  function finaliseLesson(raw, iid, lr) {
    var L = U.clone(raw), allowed = (lr && lr.sources) || [], key = U.prompts.urlKey;
    L.iid = iid;
    var byModel = {};
    (Array.isArray(L.sources) ? L.sources : []).forEach(function (x) {
      if (!x || !isStr(x.url)) return;
      var k = key(x.url), qn = normText(x.quote);
      var hit = allowed.filter(function (a) { return a.n === x.n && key(a.url) === k; })[0] ||
        allowed.filter(function (a) { return key(a.url) === k && normText(a.quote) === qn; })[0] ||
        allowed.filter(function (a) { return key(a.url) === k; })[0];
      if (hit && !(x.n in byModel)) byModel[x.n] = hit;
    });
    var order = [], renum = {};
    function cite(n) {
      var hit = byModel[n];
      if (!hit) return 0;
      if (!renum[hit.n]) { order.push(hit); renum[hit.n] = order.length; }
      return renum[hit.n];
    }
    function walk(v) {
      if (typeof v === 'string') return v.replace(/\s?\[\^(\d{1,3})\]/g, function (m, d) { var n = cite(Number(d)); return n ? m.replace('[^' + d + ']', '[^' + n + ']') : ''; });
      if (Array.isArray(v)) return v.map(walk);
      if (v && typeof v === 'object') {
        var out = {};
        Object.keys(v).forEach(function (k) {
          if (k === 'source' && typeof v[k] === 'number') { var n = cite(v[k]); if (n) out[k] = n; return; }
          out[k] = walk(v[k]);
        });
        return out;
      }
      return v;
    }
    var out = {};
    FIELD_ORDER.concat(Object.keys(L).filter(function (k) { return FIELD_ORDER.indexOf(k) < 0 && k !== 'sources'; })).forEach(function (k) {
      if (k in L) out[k] = walk(L[k]);
    });
    out.sources = order.map(function (x, i) { return { n: i + 1, title: x.title, url: x.url, quote: x.quote }; });
    if (out.analogy === undefined) out.analogy = null;
    if (out.confidence !== 'contested') out.contested = null;
    var problems = U.validate.lesson(out, { iid: iid, final: true });
    if (problems.length) console.warn('lesson ' + iid + ' after source checks:', problems);
    return out;
  }

  // ==================================================================================
  // Grading and tutoring
  // ==================================================================================
  function grade(say, answer, attempt, opts) {
    opts = opts || {};
    say = say || {};
    attempt = Math.max(1, Number(attempt) || 1);
    var rubric = Array.isArray(say.rubric) ? say.rubric : [];
    var text = s(answer).trim();
    if (!rubric.length) return Promise.reject({ code: 'invalid', message: 'This question has no rubric to check against.' });
    if (text.replace(/[^A-Za-z0-9À-￿]/g, '').length < 2) {
      var blank = { met: rubric.map(function () { return false; }), verdict: 'not-yet', nailed: '', followUp: 'Have a go in your own words: a rough sentence or two is plenty.' };
      if (attempt >= 2 && isStr(say.model)) blank.model = say.model;
      return Promise.resolve(blank);
    }
    return U.ask(U.prompts.grade(say, text, { attempt: attempt, previous: opts.previous, title: opts.title }), {
      tier: 'default', json: true, label: 'grade',
      schema: function (g) { return U.validate.grade(g, { rubric: rubric.length, attempt: attempt }); },
    }).then(function (g) {
      var out = {
        met: rubric.map(function (_, i) { return g.met[i] === true; }),
        verdict: g.verdict, nailed: one(g.nailed), followUp: g.verdict === 'got-it' ? '' : one(g.followUp),
      };
      if (attempt >= 2 && g.verdict !== 'got-it') out.model = isStr(g.model) ? one(g.model) : s(say.model);
      return out;
    }, function (e) { throw failure(e, 'check your answers'); });
  }

  function researchTools() {
    return Promise.resolve().then(function () { return U.research.available(); }).then(function (ok) {
      return ok ? U.research.tools() : null;
    }).catch(function () { return null; });
  }
  // Fill in whatever the caller did not pass: topic, idea, lesson and research for the idea.
  function tutorContext(c) {
    var tid = c.tid || (c.topic && c.topic.id) || null, iid = c.iid || (c.idea && c.idea.id) || null;
    return Promise.all([
      c.topic && Array.isArray(c.topic.ideas) ? c.topic : tid ? U.store.topic.get(tid) : (c.topic || null),
      c.lesson ? c.lesson : c.lessonDoc && c.lessonDoc.lesson ? c.lessonDoc.lesson : tid && iid ? U.store.lesson.get(tid, iid).then(function (d) { return (d && d.lesson) || null; }) : null,
      tid && iid ? loadResearch(tid, iid) : null,
    ]).then(function (r) {
      var topic = r[0] || c.topic || {};
      var idea = c.idea || (topic.ideas || []).filter(function (i) { return i.id === iid; })[0] || {};
      return { topic: topic, idea: idea, lesson: r[1], research: r[2], stage: c.stage || null, state: c.state || null };
    }, function () {
      return { topic: c.topic || {}, idea: c.idea || {}, lesson: c.lesson || null, research: null, stage: c.stage || null, state: c.state || null };
    });
  }
  // Conversation turns for sample: the preamble rides on the first user turn; turns alternate.
  function conversation(pre, messages) {
    var turns = [];
    (Array.isArray(messages) ? messages : []).forEach(function (m) {
      if (!m) return;
      var role = m.role === 'assistant' ? 'assistant' : 'user';
      var text = s(m.content != null ? m.content : m.text).trim();
      if (!text) return;
      var last = turns[turns.length - 1];
      if (last && last.role === role) last.content += '\n\n' + text;
      else turns.push({ role: role, content: text });
    });
    while (turns.length && turns[turns.length - 1].role === 'assistant') turns.pop();
    if (!turns.length) return null;
    if (turns.length > 16) turns = turns.slice(-16);
    var lead = [];
    while (turns[0].role === 'assistant') lead.push(turns.shift().content);
    turns[0] = { role: 'user', content: pre + (lead.length ? '\n\nYou opened with: "' + lead.join(' ').slice(0, 1500) + '"' : '') + '\n\n---\n\n' + turns[0].content };
    return turns;
  }
  function tutor(messages, context, opts) {
    opts = opts || {};
    return Promise.all([tutorContext(context || {}), researchTools()]).then(function (r) {
      var ctx = r[0], tools = r[1];
      ctx.tools = !!(tools && tools.length);
      var turns = conversation(U.prompts.tutor(ctx), messages);
      if (!turns) throw { code: 'invalid', message: 'Ask a question first.' };
      var acc = '';
      return U.ask(turns, {
        tier: 'default', label: 'tutor', signal: opts.signal, tools: tools || undefined,
        onText: typeof opts.onText === 'function' ? function (ev) {
          if (typeof ev === 'string') acc = acc && ev.indexOf(acc) === 0 ? ev : acc + ev;
          else if (ev && typeof ev.text === 'string') acc = ev.text;
          else if (ev && typeof ev.delta === 'string') acc += ev.delta;
          safe(opts.onText, acc);
        } : undefined,
      });
    }).then(function (text) { return s(text).trim(); }, function (e) { throw failure(e, 'answer questions'); });
  }

  function status(tid) {
    var L = live[tid] || { planning: false, research: null, lessons: {} };
    return { planning: !!L.planning, research: L.research, lessons: U.clone(L.lessons) };
  }

  U.gen = {
    createTopic: createTopic,
    replan: replan,
    research: research,
    ensureLesson: ensureLesson,
    relearn: relearn,
    grade: grade,
    tutor: tutor,
    status: status,
    knownIdeas: knownIdeas,
    // exposed for tests and tools
    _cfg: CFG,
    _who: function () { return { device: DEVICE, page: PAGE }; },
    _filterResearch: filterResearch,
    _finaliseLesson: finaliseLesson,
    _corpus: Corpus,
    _wrapTools: wrapTools,
    _conversation: conversation,
    _resetKnown: function () { knownCache = null; },
  };
})();
