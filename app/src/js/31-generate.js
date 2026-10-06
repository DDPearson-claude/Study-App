// Generation pipelines (docs/ARCHITECTURE.md sections 4, 7 and 9).
//
//   U.gen.createTopic(query, {level, onCreated(tid)}) -> Promise<tid>   resolves once planned
//   U.gen.replan(tid) -> Promise<tid>                plans a failed topic again
//   U.gen.research(tid) -> Promise<result|null>      (re)runs source research; never rejects
//   U.gen.ensureLesson(tid, iid, {onStatus(text), background, signal}) -> Promise<lessonDoc>
//       background: a prefetch (yields to Dan's calls; aborting signal cancels it)
//   U.gen.relearn(tid, iid, {onStatus, feedback}) -> Promise<lessonDoc>   new lesson, different
//       interactive; feedback = Dan's "This looks wrong" note (up to 1000 characters), which the
//       writer is asked to address
//   U.gen.grade(say, answer, attempt, {previous, title}) -> Promise<{met, verdict, nailed, followUp, model?}>
//   U.gen.tutor(messages, context, {onText(textSoFar), signal}) -> Promise<string>
//   U.gen.status(tid) -> {planning, research, lessons:{iid: status}}   this page's live work
// Progress is also broadcast as U.emit('gen', {tid, iid, kind, status, text}).
//
// Lesson docs move writing -> building -> ready (or failed, with a readable `error`). A job holds
// the db's lease on its lesson doc (renewed every 45 s with the doc's updatedAt); another device
// waits for it, and takes over once the lease runs out (without leases: once the doc has been
// silent for 4 minutes). Errors that say nothing about the lesson never mark it failed.
(function () {
  'use strict';
  var U = window.U;
  var CFG = {
    STALE_MS: 4 * 60 * 1000,          // without leases: a busy lesson doc silent this long is abandoned
    HEARTBEAT_MS: 45 * 1000,          // how often a running job refreshes its doc and lease
    LEASE_MS: 90 * 1000,              // the generation lease on a lesson doc (renewed by the heartbeat)
    LEASE_ROUNDS: 8,                  // how many times a job waits out another holder before giving up
    RESEARCH_WAIT_MS: 120 * 1000,     // longest a lesson waits for research (from research start)
    FIRST_RESEARCH_WAIT_MS: 15 * 1000, // ...and the topic's first lesson, so Dan is not kept waiting
    RESEARCH_STALE_MS: 8 * 60 * 1000, // a 'running' research older than this is abandoned
    RESEARCH_RETRY_MS: 10 * 60 * 1000, // a lesson re-tries 'failed'/'unavailable' research this old
    KNOWN_MAX: 60,
  };
  var LEVELS = ['new', 'some', 'solid'];
  var NO_INTERACTIVE = 'The interactive for this idea could not be built and tested this time, so this lesson carries on without it.';
  var PAGE = U.id('p');
  // Ids that outlive a reload: this device (localStorage) and this tab (sessionStorage, so two
  // tabs of one browser never mistake each other's live work for their own leftovers).
  function kept(store, key, prefix) {
    try {
      var st = store();
      if (!st) return U.id(prefix);
      var v = st.getItem(key);
      if (!v) { v = U.id(prefix); st.setItem(key, v); }
      return v;
    } catch (e) { return U.id(prefix); }
  }
  var DEVICE = kept(function () { return typeof localStorage === 'undefined' ? null : localStorage; }, 'mu.device', 'd');
  var TAB = kept(function () { return typeof sessionStorage === 'undefined' ? null : sessionStorage; }, 'mu.tab', 't');
  var HOLDER = DEVICE + '/' + TAB;

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
  function safe(fn, a, b) { try { fn(a, b); } catch (e) { console.error(e); } }

  // ---------- live state for the UI ----------
  function liveOf(tid) { return (live[tid] = live[tid] || { planning: false, research: null, lessons: {} }); }
  function emit(tid, iid, kind, status, text) { U.emit('gen', { tid: tid, iid: iid || null, kind: kind, status: status, text: text || '' }); }
  // Writing a lesson whose reply still fails the app's checks after U.ask's one repair gets one
  // fresh go from scratch (a new call, not another repair) before the job gives up. Errors that
  // say nothing about the lesson (rate limits, cancelled, no permission…) are not retried here.
  var AGAIN = 'Having another go at writing this lesson…';
  function rewritable(e) { return !!e && (e.code === 'invalid' || e.code === 'bad_json'); }

  // ---------- readable errors ----------
  // What a reply that failed the app's checks would have saved, by what Claude was doing.
  var CHECKED = { 'write lessons': 'lesson', 'plan topics': 'plan', 'check sources': 'research' };
  function friendly(e, doing) {
    var code = e && e.code;
    if (code === 'not_granted') return 'Claude needs your permission to ' + doing + '. Tap "Allow" when the app asks (or allow Claude for this app in its settings), then try again.';
    if (code === 'rate_limited') return 'Claude is busy right now. Wait a minute, then try again.';
    if (code === 'truncated') return 'Claude\'s answer was cut off before it finished. Try again; it usually works second time.';
    // Dan never sees the checks, so the message names what failed them, never a "shape".
    if (code === 'invalid' || code === 'bad_json') {
      return CHECKED[doing] ? 'Claude\'s ' + CHECKED[doing] + ' did not pass the app\'s own checks, so it was not saved. Try again; it usually works.'
        : 'Claude\'s reply did not pass the app\'s own checks. Try again; it usually works.';
    }
    if (code === 'not_found') return s(e.message) || 'That could not be found.';
    return U.errText(e);
  }
  // A store write resolves null when its topic has been deleted (here or on another device):
  // the work in hand stops.
  function goneIfNull(r) {
    if (r === null) throw { code: 'not_found', message: 'This topic has been deleted.' };
    return r;
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

  // Length limits are soft (30-prompts.js), so a long title is shortened at a word, never mid-word.
  function shorten(t, n) {
    t = one(t);
    if (t.length <= n) return t;
    var c = t.slice(0, n - 1), sp = c.lastIndexOf(' ');
    return (sp > n / 2 ? c.slice(0, sp) : c).replace(/[\s,;:.]+$/, '') + '…';
  }
  function cleanPlan(p) {
    return {
      title: shorten(p.title, 120),
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
    }).then(function (r) {
      goneIfNull(r);
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
  // survives only if its URL is a page a tool returned and its quote is on that page. Results
  // are read per page (the connector's {results:[{url, title, excerpts, full_content}]}); text
  // that isn't in that shape is kept whole and checked the old way (URL anywhere, quote anywhere).
  function Corpus() {
    var raw = [], norm = [], pages = {};
    function unescape(t) {
      return String(t)
        .replace(/\\u([0-9a-fA-F]{4})/g, function (_, h) { return String.fromCharCode(parseInt(h, 16)); })
        .replace(/\\[nrt]/g, ' ')
        .replace(/\\(["\\/])/g, '$1');
    }
    function esc(x) { return x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
    function parsed(text) {
      if (text && typeof text === 'object') return text;
      try { return JSON.parse(String(text)); } catch (e) { return null; }
    }
    function found(hay, quote) {
      var frags = s(quote).split(/\.\.\.|…/).map(normText).filter(function (f) { return f.length >= 8; });
      if (!frags.length) frags = [normText(quote)];
      return frags.every(function (f) { return f && hay.indexOf(f) >= 0; });
    }
    return {
      calls: 0,
      add: function (text) {
        var p = parsed(text);
        if (p && Array.isArray(p.results)) {
          p.results.forEach(function (r) {
            var key = r && U.prompts.urlKey(r.url);
            if (!key) return;
            var parts = [r.title].concat(Array.isArray(r.excerpts) ? r.excerpts : [], [r.full_content]).filter(function (x) { return typeof x === 'string'; });
            if (U.research && U.research._plain) parts = parts.map(U.research._plain);
            (pages[key] = pages[key] || []).push(normText(parts.join(' \u0001 ')));
          });
          return true;
        }
        var t = unescape(text); raw.push(t.toLowerCase()); norm.push(normText(t));
        return false;
      },
      hasUrl: function (url) {
        var key = U.prompts.urlKey(url);
        if (!key || key.indexOf('.') < 0) return false;
        if (pages[key]) return true;
        var re = new RegExp(esc(key) + '/?(?=$|[\\s"\'<>\\\\)\\]},?#|])');
        return raw.some(function (t) { return re.test(t); });
      },
      // With a url: the quote must be on that page when the tools returned it as a result.
      hasQuote: function (quote, url) {
        var key = url ? U.prompts.urlKey(url) : null;
        if (key && pages[key]) return found(pages[key].join(' \u0001 '), quote);
        var all = norm.concat(Object.keys(pages).map(function (k) { return pages[k].join(' \u0001 '); }));
        return found(all.join(' \u0001 '), quote);
      },
    };
  }
  // Lower-case words only. A hyphen between two letters or digits is dropped, with any line break
  // after it, so "dis- turbances" (a PDF line break), "disturbances" and "well-known" / "wellknown"
  // compare equal on both sides.
  function normText(t) {
    return s(t).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/([a-z0-9])[-‐‑–]\s*([a-z0-9])/g, '$1$2')
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
            // A fetch whose reply isn't in the results shape still counts the pages it opened.
            if (!corpus.add(text) && t.name === 'web_fetch' && input) corpus.add([].concat(input.urls || input.url || []).join('\n'));
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
      if (!corpus.hasQuote(x.quote, x.url)) { dropped.push({ n: x.n, url: x.url, why: 'quote not found on that page' }); return; }
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
    }, { patient: true }).then(function (tools) {
      if (!tools || !tools.length) throw { code: 'unavailable', message: 'The research tools did not load.' };
      return U.ask(U.prompts.research(topic, { ideas: topic.ideas }), {
        tier: 'default', json: true, label: 'research', tools: wrapTools(tools, corpus), priority: 'background',
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

  // The topic's research, the idea's, and that of the ideas it builds on (deps).
  function loadResearch(tid, iid, deps) {
    deps = (Array.isArray(deps) ? deps : []).filter(function (d) { return d && d !== iid; }).slice(0, 4);
    var get = function (k) { return U.store.research.get(tid, k).catch(function () { return null; }); };
    return Promise.all([get('topic'), iid ? get(iid) : null].concat(deps.map(get))).then(function (r) {
      var earlier = r.slice(2).filter(Boolean);
      return r[0] || r[1] || earlier.length ? { topic: r[0], idea: r[1], earlier: earlier } : null;
    }, function () { return null; });
  }
  function depsOf(topic, iid) {
    var idea = (topic && topic.ideas || []).filter(function (i) { return i.id === iid; })[0];
    return idea && Array.isArray(idea.deps) ? idea.deps : [];
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
  // The topic's first lesson waits only briefly; it is written unsourced rather than keep Dan waiting.
  function researchFor(tid, topic, iid, job) {
    var r = topic.research || {}, wait = null;
    var started = Date.parse(r.at || '') || Date.now();
    if (researching[tid]) wait = researching[tid];
    else if (r.status === 'running' && age(r.at) < CFG.RESEARCH_STALE_MS) wait = 'watch';
    else if (!r.status || r.status === 'none' || r.status === 'running' ||
      ((r.status === 'failed' || r.status === 'unavailable') && age(r.at) > CFG.RESEARCH_RETRY_MS)) { started = Date.now(); wait = research(tid); }
    if (!wait) return loadResearch(tid, iid, depsOf(topic, iid));
    var left = Math.max(5000, CFG.RESEARCH_WAIT_MS - (Date.now() - started));
    var first = (topic.ideas || []).filter(function (i) { return !i.known; })[0];
    if (first && first.id === iid) left = Math.min(left, CFG.FIRST_RESEARCH_WAIT_MS);
    progress(job, 'Checking sources for this idea…', 'writing');
    var p = wait === 'watch' ? waitForTopicResearch(tid, left) : Promise.race([wait.catch(noop), U.sleep(left)]);
    return p.then(function () { return loadResearch(tid, iid, depsOf(topic, iid)); });
  }

  // ==================================================================================
  // Lessons
  //
  // One writer per lesson, across devices and tabs: a job claims the db's cooperative lease on
  // the lesson doc (holder = this tab), renews it with the heartbeat, and before each write checks
  // that it still holds the lease and that the doc still names it; if not, another device has
  // taken over and this job stops without writing. Where the db has no leases (memdb), the doc's
  // `by` and updatedAt decide who waits, as before. Errors that say nothing about the lesson (no
  // permission, rate limits, a cancelled prefetch, a passing outage) leave the shared doc as it
  // was: only this page hears about them.
  // ==================================================================================
  var TRANSIENT = ['not_granted', 'rate_limited', 'cancelled', 'aborted', 'unavailable', 'upstream_error', 'timeout', 'session_expired'];
  function transient(e) { return !!(e && TRANSIENT.indexOf(e.code) >= 0); }
  function superseded(job) { job.lost = true; return { code: 'superseded', message: 'Another device took over this lesson.' }; }

  function newJob(tid, iid, opts) {
    var job = {
      tid: tid, iid: iid, key: tid + '/' + iid, subs: [], text: '', hb: null, promise: null, ref: null, lost: false,
      background: !!opts.background, ctrl: typeof AbortController === 'function' ? new AbortController() : null,
    };
    join(job, opts);
    jobs[job.key] = job;
    return job;
  }
  // Another caller for the same lesson. A foreground caller (Dan opening it) promotes a
  // background prefetch, which then can no longer be cancelled.
  function join(job, opts) {
    subscribe(job, opts.onStatus);
    if (!opts.background) {
      job.background = false;
      if (U._gate && typeof U._gate.promote === 'function') U._gate.promote(function (input, o) { return !!o && o.key === gateKey(job); });
      return;
    }
    var sig = opts.signal;
    if (sig && typeof sig.addEventListener === 'function') {
      if (sig.aborted) cancel(job);
      else sig.addEventListener('abort', function () { cancel(job); });
    }
  }
  function cancel(job) { if (job.background && job.ctrl && !job.ctrl.signal.aborted) job.ctrl.abort(); }
  // Dan left a lesson that is still being written: it carries on as background work (it yields to
  // whatever he opens next), like a prefetch, and stops only if opts.signal aborts (the lesson
  // screen passes none: it keeps going while the app is open). Opening it again makes it
  // foreground once more. -> true if a job was demoted.
  function demote(tid, iid, opts) {
    var job = running(tid, iid);
    if (!job || job.background) return false;
    job.background = true;
    var sig = opts && opts.signal;
    if (sig && typeof sig.addEventListener === 'function') {
      if (sig.aborted) cancel(job);
      else sig.addEventListener('abort', function () { cancel(job); });
    }
    return true;
  }
  function cancelled(job) { return !!(job.ctrl && job.ctrl.signal.aborted); }
  function stillWanted(job) { if (cancelled(job)) throw { code: 'cancelled', message: 'This lesson was not needed after all.' }; }
  // U.ask options for this job: background work yields to Dan's foreground calls.
  // Every model call for one lesson carries the lesson's key, so when Dan opens a lesson that
  // was being prefetched its queued calls run at once (U._gate promotes by key).
  function gateKey(job) { return 'lesson:' + job.key; }
  function askOpts(job, o) {
    if (job.ctrl) o.signal = job.ctrl.signal;
    if (job.background) o.priority = 'background';
    o.key = gateKey(job);
    return o;
  }
  // A job already running here for this lesson, unless it was a cancelled prefetch.
  function running(tid, iid) { var job = jobs[tid + '/' + iid]; return job && !cancelled(job) ? job : null; }

  // onStatus(text, meta): meta.redo -> the step on screen is being done again (say so in its
  // line, do not tick it off); meta.failed -> the job failed (the caller's rejection says why).
  // A caller who joins later first hears the latest line on its own.
  function subscribe(job, fn) { if (typeof fn === 'function') { job.subs.push(fn); if (job.text) safe(fn, job.text, {}); } }
  function progress(job, text, status, meta) {
    if (status) liveOf(job.tid).lessons[job.iid] = status;
    meta = meta || (status === 'failed' ? { failed: true } : {});
    if (text && text !== job.text) { job.text = text; job.subs.forEach(function (fn) { safe(fn, text, meta); }); }
    emit(job.tid, job.iid, 'lesson', status || liveOf(job.tid).lessons[job.iid] || 'writing', text);
  }
  function settle(job) {
    function done() { stopBeat(job); release(job); if (jobs[job.key] === job) delete jobs[job.key]; }
    job.promise.then(function (doc) {
      liveOf(job.tid).lessons[job.iid] = (doc && doc.status) || 'ready';
      done();
    }, function () { liveOf(job.tid).lessons[job.iid] = 'failed'; done(); });
    return job.promise;
  }

  // ---------- the lease ----------
  var leaseDb = null; // tests swap in a db with acquire()
  function leaseRef(job) {
    var db = leaseDb || (U.rt && U.rt.db);
    if (!db || typeof db.doc !== 'function') return null;
    try {
      var ref = db.doc(U.store.paths.lesson(job.tid, job.iid));
      return ref && typeof ref.acquire === 'function' ? ref : null;
    } catch (e) { return null; }
  }
  // Claim or renew -> {acquired, expiresAt}. Trouble with the lease itself is no reason to stop.
  function claim(job, ttl) {
    var ref = job.ref || leaseRef(job);
    if (!ref) return Promise.resolve({ acquired: true, none: true });
    return Promise.resolve().then(function () { return ref.acquire({ holder: HOLDER, ttlMs: ttl || CFG.LEASE_MS }); }).then(function (r) {
      r = r && typeof r === 'object' ? r : { acquired: true };
      if (r.acquired) job.ref = ref;
      return r;
    }, function (e) { console.warn('lesson lease', e); return { acquired: true }; });
  }
  // Let the lease lapse at once (the shortest lease there is), so the next writer need not wait.
  function release(job) {
    var ref = job.ref;
    job.ref = null;
    if (ref) Promise.resolve().then(function () { return ref.acquire({ holder: HOLDER, ttlMs: 1000 }); }).catch(noop);
  }
  // Is this lesson still ours: the lease (renewed here) and the doc's `by`?
  function mine(job) {
    if (job.lost) return Promise.reject(superseded(job));
    return claim(job).then(function (r) {
      if (!r.acquired) throw superseded(job);
      return U.store.lesson.get(job.tid, job.iid);
    }).then(function (doc) {
      if (doc && doc.by && doc.by.holder && doc.by.holder !== HOLDER) throw superseded(job);
    });
  }
  // Before each write: still wanted, and still ours.
  function own(job) { return Promise.resolve().then(function () { stillWanted(job); return mine(job); }); }
  function beat(job) {
    stopBeat(job);
    job.hb = setInterval(function () {
      own(job).then(function () { return U.store.lesson.update(job.tid, job.iid, {}); }).catch(function (e) { if (e && e.code === 'superseded') stopBeat(job); });
    }, CFG.HEARTBEAT_MS);
  }
  function stopBeat(job) { if (job.hb) { clearInterval(job.hb); job.hb = null; } }
  function busy(doc) { return doc && (doc.status === 'writing' || doc.status === 'building'); }
  // Left by this tab with no job running for it here (an earlier load of the page, or a job that
  // ended without saving): that work died with the page, so there is nothing to wait for.
  function abandoned(doc) { return !!(doc.by && doc.by.tab && doc.by.tab === TAB); }
  function untilExpiry(r) { var t = Date.parse((r && r.expiresAt) || ''); return Math.min(CFG.LEASE_MS, Math.max(300, isFinite(t) ? t - Date.now() + 200 : CFG.LEASE_MS)); }

  // ensureLesson(tid, iid, {onStatus, background, signal}): background marks a prefetch (its
  // calls yield to Dan's, and aborting `signal` cancels it until a foreground caller joins).
  function ensureLesson(tid, iid, opts) {
    opts = opts || {};
    var job = running(tid, iid);
    if (job) { join(job, opts); return job.promise; }
    if (jobs[tid + '/' + iid]) return jobs[tid + '/' + iid].promise.catch(noop).then(function () { return ensureLesson(tid, iid, opts); });
    job = newJob(tid, iid, opts);
    job.promise = U.store.lesson.get(tid, iid).then(function (doc) {
      if (doc && doc.status === 'ready' && doc.lesson) return doc;
      return takeOver(job, doc, 0);
    });
    return settle(job);
  }
  // Claim the lesson and finish it: a lesson already written but left at 'building' only needs
  // its interactive; anything else is written. While another device holds it, wait for that.
  function takeOver(job, doc, round) {
    if (doc && doc.status === 'ready' && doc.lesson) return doc;
    var tid = job.tid, iid = job.iid;
    if (!leaseRef(job) && busy(doc) && fresh(doc.updatedAt) && !abandoned(doc) && !round) {
      progress(job, 'Your other device is preparing this lesson. Waiting for it…', 'waiting');
      return watchOther(tid, iid).then(function (d) {
        return d || U.store.lesson.get(tid, iid).then(function (now) { return takeOver(job, now, 1); });
      });
    }
    return claim(job).then(function (r) {
      if (!r.acquired) {
        if (round >= CFG.LEASE_ROUNDS) throw { code: 'busy', message: 'Another device is preparing this lesson. Try again in a minute.' };
        progress(job, 'Your other device is preparing this lesson. Waiting for it…', 'waiting');
        return watchOther(tid, iid, untilExpiry(r)).then(function (d) {
          return d || U.store.lesson.get(tid, iid).then(function (now) { return takeOver(job, now, round + 1); });
        });
      }
      if (doc && doc.status === 'building' && doc.lesson) return resume(job, doc);
      return write(job, { avoid: doc && doc.avoid, feedback: doc && doc.feedback, prev: doc });
    });
  }

  // Watch a lesson another device is writing. Resolves the ready doc, or null to try again: with a
  // lease, when it runs out (untilMs); without, when the doc fails, vanishes or goes silent.
  function watchOther(tid, iid, untilMs) {
    return new Promise(function (resolve) {
      var stop = null, done = false, timer = null;
      function finish(v) { if (done) return; done = true; clearTimeout(timer); if (stop) stop(); resolve(v); }
      if (untilMs != null) timer = setTimeout(function () { finish(null); }, untilMs);
      stop = U.store.lesson.watch(tid, iid, function (doc) {
        if (done) return;
        if (doc && doc.status === 'ready' && doc.lesson) return finish(U.clone(doc));
        if (untilMs != null) return;
        if (!doc || doc.status === 'failed' || !fresh(doc.updatedAt)) return finish(null);
        clearTimeout(timer);
        timer = setTimeout(function () { finish(null); }, Math.max(500, CFG.STALE_MS - age(doc.updatedAt) + 500));
      });
      if (done && stop) stop();
    });
  }

  function relearn(tid, iid, opts) {
    opts = opts || {};
    var job = running(tid, iid);
    if (job) { join(job, opts); return job.promise; }
    job = newJob(tid, iid, {});
    subscribe(job, opts.onStatus);
    var feedback = isStr(opts.feedback) ? s(opts.feedback).trim().slice(0, 1000) : null;
    job.promise = U.store.lesson.get(tid, iid).then(function (doc) {
      var avoid = [], brief = doc && ((doc.interactive && doc.interactive.brief) || (doc.lesson && doc.lesson.interactive && doc.lesson.interactive.brief));
      if (isStr(brief)) avoid.push(brief);
      [].concat((doc && doc.avoid) || []).forEach(function (a) { if (isStr(a) && avoid.indexOf(a) < 0) avoid.push(a); });
      // A ready lesson does not count as done here: wait out another holder, then write.
      return (function attempt(round) {
        return claim(job).then(function (r) {
          if (r.acquired) return write(job, { avoid: avoid.slice(0, 3), feedback: feedback, prev: doc });
          if (round >= CFG.LEASE_ROUNDS) throw { code: 'busy', message: 'Another device is preparing this lesson. Try again in a minute.' };
          progress(job, 'Your other device is working on this lesson. Waiting for it…', 'waiting');
          return U.sleep(untilExpiry(r)).then(function () { return attempt(round + 1); });
        });
      })(0);
    });
    return settle(job);
  }

  // What the lessons already written for earlier ideas in this topic gave Dan (terms, analogy,
  // interactive, numbers), so the writer can build on them without repeating or contradicting.
  function priorLessons(tid, topic, idea) {
    var ideas = topic.ideas || [], idx = ideas.map(function (i) { return i.id; }).indexOf(idea.id);
    return Promise.all(ideas.slice(0, Math.max(0, idx)).map(function (i) {
      return U.store.lesson.get(tid, i.id).then(function (doc) {
        return doc && doc.lesson && (doc.status === 'ready' || doc.status === 'building') ? doc.lesson : null;
      }, function () { return null; });
    })).then(function (list) { return U.prompts.priorSummary(list.filter(Boolean)); });
  }

  // The lesson doc patch once the interactive build is over. Target checks the built page could
  // not satisfy are dropped: Dan is never asked for a reading the interactive cannot give.
  function builtPatch(lesson, built) {
    var patch = { status: 'ready', interactive: null, note: NO_INTERACTIVE, error: null };
    if (!built) return patch;
    var drop = Array.isArray(built.unreachable) ? built.unreachable : [];
    patch.interactive = { html: built.html, title: built.title, brief: built.brief, selftest: built.selftest, attempts: built.attempts };
    patch.note = null;
    if (drop.length && lesson && Array.isArray(lesson.checks)) {
      console.warn('interactive: dropping target checks it cannot reach', drop);
      var L = U.clone(lesson);
      L.checks = L.checks.filter(function (c) { return !(c && c.type === 'target' && drop.indexOf(c.id) >= 0); });
      patch.lesson = L;
    }
    return patch;
  }
  function who() { return { device: DEVICE, tab: TAB, page: PAGE, holder: HOLDER }; }

  // The doc back as it was before this job touched it: gone if the job created it, or if it was
  // someone's unfinished work (restoring that would only make it look alive again).
  function restore(tid, iid, prev) {
    if (prev && !busy(prev)) { var d = U.clone(prev); delete d.__id; return U.store.lesson.set(tid, iid, d); }
    if (U.store.lesson.remove) return U.store.lesson.remove(tid, iid);
    var db = U.rt.db || U.memdb;
    return db.doc(U.store.paths.lesson(tid, iid)).delete();
  }
  // How a job that stopped part-way leaves the shared doc. stage: 'none' (untouched), 'writing'
  // (claimed, no lesson text yet) or 'building' (lesson saved, interactive unfinished).
  function stopped(job, e, stage, prev, doing) {
    stopBeat(job);
    var f = failure(e, doing), tid = job.tid, iid = job.iid;
    if (e && e.code === 'superseded') {
      progress(job, 'Your other device took over this lesson. Waiting for it…', 'waiting');
      return watchOther(tid, iid).then(function (d) { return d || U.store.lesson.get(tid, iid); });
    }
    progress(job, f.message, 'failed');
    if (stage === 'none') throw f;
    if (transient(e)) {
      // Nothing is wrong with the lesson: a 'building' doc stays resumable; a claimed one goes back.
      return (stage === 'writing' ? mine(job).then(function () { return restore(tid, iid, prev); }) : Promise.resolve())
        .catch(noop).then(function () { release(job); throw f; });
    }
    return mine(job).then(function () {
      return U.store.lesson.update(tid, iid, { status: 'failed', error: f.message, errorCode: f.code, errorDetail: f.detail || null });
    }).catch(noop).then(function () { throw f; });
  }

  function write(job, o) {
    o = o || {};
    var tid = job.tid, iid = job.iid, topic, idea, lr = null, stage = 'none';
    var avoid = [].concat(o.avoid || []).filter(isStr), feedback = isStr(o.feedback) ? o.feedback : null;
    progress(job, 'Reading the plan for this idea…', 'writing');
    return (plans[tid] ? plans[tid].catch(noop) : Promise.resolve()).then(function () {
      stillWanted(job);
      // A page that cannot reach Claude leaves the shared doc alone.
      if (!U.rt || !U.rt.sample) throw { code: 'not_granted', message: 'Claude is not available in this view.' };
      return U.store.topic.get(tid);
    }).then(function (t) {
      if (!t || !Array.isArray(t.ideas)) throw { code: 'not_found', message: 'This topic could not be found. It may have been deleted.' };
      idea = t.ideas.filter(function (i) { return i.id === iid; })[0];
      if (!idea) throw { code: 'not_found', message: 'This idea is not part of the topic any more.' };
      topic = t;
      return U.store.lesson.set(tid, iid, {
        status: 'writing', error: null, lesson: null, interactive: null, sourced: false,
        by: who(), avoid: avoid.length ? avoid : null, feedback: feedback, startedAt: U.now(),
      });
    }).then(function (r) {
      goneIfNull(r);
      stage = 'writing';
      beat(job);
      return researchFor(tid, topic, iid, job);
    }).then(function (rsrch) {
      stillWanted(job);
      lr = U.prompts.lessonResearch(rsrch, iid, idea.deps);
      var allowed = lr && lr.sources.length ? lr.sources : null;
      return Promise.all([knownIdeas(tid), priorLessons(tid, topic, idea)]).then(function (r) {
        progress(job, allowed ? 'Writing your lesson from ' + allowed.length + ' checked source' + (allowed.length === 1 ? '' : 's') + '…' : 'Writing your lesson…', 'writing');
        function ask() {
          return U.ask(U.prompts.writeLesson(topic, idea, { research: rsrch, known: r[0], avoid: avoid, feedback: feedback, prior: r[1] }), askOpts(job, {
            tier: 'default', json: true, label: 'write-lesson',
            schema: function (x) { return U.validate.lesson(x, { iid: iid, sources: allowed }); },
          }));
        }
        return ask().catch(function (e) {
          if (!rewritable(e)) throw e;
          console.warn('lesson ' + iid + ': writing it again from scratch after', e);
          return own(job).then(function () {
            progress(job, AGAIN, 'writing', { redo: true });
            return ask();
          });
        });
      });
    }).then(function (raw) {
      var lesson = finaliseLesson(raw, iid, lr);
      var sourced = lesson.sources.length > 0;
      return own(job).then(function () {
        if (!lesson.interactive) return U.store.lesson.update(tid, iid, { status: 'ready', lesson: lesson, sourced: sourced, interactive: null, note: null, error: null });
        progress(job, 'Building your interactive…', 'building');
        return U.store.lesson.update(tid, iid, { status: 'building', lesson: lesson, sourced: sourced }).then(function (r) {
          goneIfNull(r);
          stage = 'building';
          return buildInteractive(topic, idea, lesson, avoid, job);
        }).then(function (built) {
          progress(job, built ? 'Interactive tested and ready.' : 'Finishing without the interactive…', 'building');
          return own(job).then(function () { return U.store.lesson.update(tid, iid, builtPatch(lesson, built)); });
        });
      });
    }).then(function (r) {
      goneIfNull(r);
      stopBeat(job);
      progress(job, 'Ready.', 'ready');
      return U.store.lesson.get(tid, iid);
    }).catch(function (e) { return stopped(job, e, stage, o.prev, 'write lessons'); });
  }

  // Finish a lesson whose text was saved but whose interactive build never completed.
  function resume(job, doc) {
    var tid = job.tid, iid = job.iid, stage = 'none';
    var avoid = [].concat(doc.avoid || []).filter(isStr);
    progress(job, 'Finishing the interactive for this lesson…', 'building');
    return U.store.topic.get(tid).then(function (t) {
      var idea = t && (t.ideas || []).filter(function (i) { return i.id === iid; })[0];
      if (!idea) return write(job, { avoid: avoid, prev: doc });
      return Promise.resolve().then(function () {
        stillWanted(job);
        if (!U.rt || !U.rt.sample) throw { code: 'not_granted', message: 'Claude is not available in this view.' };
        return U.store.lesson.update(tid, iid, { status: 'building', by: who(), error: null });
      }).then(function (r) {
        goneIfNull(r);
        stage = 'building';
        beat(job);
        return buildInteractive(t, idea, doc.lesson, avoid, job);
      }).then(function (built) {
        return own(job).then(function () { return U.store.lesson.update(tid, iid, builtPatch(doc.lesson, built)); });
      }).then(function (r) {
        goneIfNull(r);
        stopBeat(job);
        progress(job, 'Ready.', 'ready');
        return U.store.lesson.get(tid, iid);
      }).catch(function (e) { return stopped(job, e, stage, doc, 'build interactives'); });
    });
  }

  // The kit body for a written lesson, or null when it could not be built and tested. Errors that
  // say nothing about the lesson (no permission, rate limits, cancelled) are passed on instead.
  function buildInteractive(topic, idea, lesson, avoid, job) {
    var I = U.interactive;
    if (!I || typeof I.build !== 'function') return Promise.resolve(null);
    return Promise.resolve().then(function () {
      stillWanted(job);
      return I.build(topic, idea, lesson, {
        onStatus: function (t) { if (isStr(t)) progress(job, t, 'building'); }, avoid: avoid[0] || null,
        signal: job.ctrl ? job.ctrl.signal : undefined, key: gateKey(job),
        // Asked at each call, so repairs follow the lesson once Dan opens it.
        priority: function () { return job.background ? 'background' : undefined; },
      });
    }).then(function (r) { return r && isStr(r.html) ? r : null; }, function (e) {
      if (transient(e) || cancelled(job)) throw e;
      console.warn('interactive build failed', e);
      return null;
    });
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

  // The tutor's tools: web_fetch opens pages from its own searches, plus `allow` (the checked sources).
  function researchTools(allow) {
    return Promise.resolve().then(function () { return U.research.available(); }).then(function (ok) {
      return ok ? U.research.tools(null, { allow: allow || [] }) : null;
    }).catch(function () { return null; });
  }
  // Pages the tutor may reopen without searching: the lesson's sources and the checked research.
  function sourceUrls(ctx) {
    var out = [];
    function add(list) { (Array.isArray(list) ? list : []).forEach(function (x) { if (x && isStr(x.url) && out.indexOf(x.url) < 0) out.push(x.url); }); }
    add(ctx.lesson && ctx.lesson.sources);
    if (ctx.research) { add(ctx.research.topic && ctx.research.topic.sources); add(ctx.research.idea && ctx.research.idea.sources); }
    return out;
  }
  // Fill in whatever the caller did not pass: topic, idea, lesson and research for the idea.
  function tutorContext(c) {
    var tid = c.tid || (c.topic && c.topic.id) || null, iid = c.iid || (c.idea && c.idea.id) || null;
    return Promise.all([
      c.topic && Array.isArray(c.topic.ideas) ? c.topic : tid ? U.store.topic.get(tid) : (c.topic || null),
      c.lesson ? c.lesson : c.lessonDoc && c.lessonDoc.lesson ? c.lessonDoc.lesson : tid && iid ? U.store.lesson.get(tid, iid).then(function (d) { return (d && d.lesson) || null; }) : null,
      tid ? loadResearch(tid, iid) : null,
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
    return tutorContext(context || {}).then(function (ctx) {
      return researchTools(sourceUrls(ctx)).then(function (tools) { return [ctx, tools]; });
    }).then(function (r) {
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
    demote: demote,
    relearn: relearn,
    grade: grade,
    tutor: tutor,
    status: status,
    knownIdeas: knownIdeas,
    // exposed for tests and tools
    _cfg: CFG,
    _who: who,
    _leaseDb: function (db) { leaseDb = db || null; },
    _filterResearch: filterResearch,
    _finaliseLesson: finaliseLesson,
    _builtPatch: builtPatch,
    _corpus: Corpus,
    _wrapTools: wrapTools,
    _conversation: conversation,
    _resetKnown: function () { knownCache = null; },
  };
})();
