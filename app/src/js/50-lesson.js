// Lesson screen, route #/t/:tid/:iid (focus mode). Teaches one idea in five stages:
//   Predict -> Play (the sandboxed interactive) -> Explain -> Say it back (graded) -> Check.
//
// Reads topics/{tid} and topics/{tid}/lessons/{iid}. When the lesson is not ready it asks
// U.gen.ensureLesson to write it and shows calm, specific progress lines; the predict question
// appears as soon as it is written, so Dan can guess while the interactive is still being built.
// Progress is saved to his private progress doc as he goes (stage, prediction, every say-it-back
// attempt, check results, doneAt), so reopening resumes where he left off with earlier stages
// collapsed but reviewable. Contract: docs/ARCHITECTURE.md sections 4, 5 and 9; the progress
// shapes (rounds, keyed say entries, replays) are described at the top of 20-store.js.
//
// Two devices: the screen watches the progress doc and folds in what the other device saved.
// Stages only move forward, and a guess or check result saved first (anywhere) is never
// overwritten. "Go through it again" records its run separately (ideas[iid].replays).
//
// Learn it again: '#/t/:tid/:iid/again' (Today's link), or progress.ideas[iid].relearn set, or
// "Rebuild this lesson" in the "This looks wrong" sheet. U.gen.relearn writes a fresh lesson with a
// different interactive; the idea starts a new round (stage back to predict, check results and
// guess for the new lesson cleared, the old ones kept under ideas[iid].past).
//
// Public: U.lesson.sourceSheet(source) opens a source (title, exact quote, link) in a sheet.
(function () {
  var STAGES = ['predict', 'play', 'explain', 'say', 'checks', 'done'];
  var STEPS = STAGES.slice(0, 5);
  var LABEL = { predict: 'Predict', play: 'Play', explain: 'Explain', say: 'Say it back', checks: 'Check', done: 'Done' };
  var VERDICT = { 'got-it': 'You\'ve got it', partly: 'Partly there', 'not-yet': 'Not there yet' };
  // How each number in "What am I looking at?" is labelled. Assumed values are examples chosen
  // for the interactive ("for example …"), never findings; dates are plain facts.
  var NUMBER_KIND = { control: 'you set this', computed: 'worked out from the rule', constant: 'a fixed value', assumed: 'an example value', date: null };
  var WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five'];
  var drafts = {}; // unsent say-it-back text for this page session, by 'tid/iid'
  // Prefetches of the next idea. Each keeps running while Dan stays in its topic (the topic page
  // or another of its lessons, where he is likely to open it next) and is cancelled once he
  // leaves the topic. A prefetch Dan opens becomes his foreground lesson (U.gen promotes it).
  var prefetches = [];
  function inTopic(tid) {
    var base = '#/t/' + encodeURIComponent(tid), h = location.hash || '';
    return h === base || h.indexOf(base + '/') === 0;
  }
  function sweepPrefetches() {
    prefetches = prefetches.filter(function (p) {
      if (p.done) return false;
      if (inTopic(p.tid)) return true;
      try { p.ctrl.abort(); } catch (e) { /* fine */ }
      return false;
    });
  }
  if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('hashchange', sweepPrefetches);

  // ---------- small helpers ----------
  function media(q) { return !!(window.matchMedia && window.matchMedia(q).matches); }
  function reducedMotion() { return media('(prefers-reduced-motion: reduce)'); }
  function btn(label, onClick, cls) {
    return U.h('button', { class: 'btn' + (cls ? ' ' + cls : ''), type: 'button', on: { click: onClick } }, label);
  }
  function linkBtn(label, onClick, cls) {
    return U.h('button', { class: 'linkish' + (cls ? ' ' + cls : ''), type: 'button', on: { click: onClick } }, label);
  }
  function eyebrow(text) { return U.h('p', { class: 'eyebrow' }, text); }
  function heading(text, rich) {
    var h2 = U.h('h2', { class: 'lsn-h', tabindex: '-1' });
    return rich ? U.inline(h2, String(text || '')) : U.append(h2, String(text || ''));
  }
  function richBox(text, cls, fnOpts) { return U.h('div', { class: cls || null }, U.rich(String(text || ''), fnOpts)); }
  function go() { return U.h('div', { class: 'lsn-go' }, Array.prototype.slice.call(arguments)); }
  function safeUrl(u) { return /^https?:\/\/[^\s]+$/i.test(String(u || '')) ? String(u) : null; }
  function hostOf(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }
  function clip(text, n) {
    var t = U.plain(String(text == null ? '' : text)).replace(/\s+/g, ' ').trim();
    return t.length > n ? t.slice(0, n - 1).replace(/[\s,.;:]+\S*$/, '') + '…' : t;
  }
  function disc(title, content, open) {
    return U.h('details', { class: 'lsn-disc', open: !!open },
      U.h('summary', null, U.h('span', null, title), U.h('span', { class: 'lsn-chev', 'aria-hidden': 'true' }, U.icon('back'))),
      U.h('div', { class: 'lsn-disc-body' }, content));
  }
  function bring(el, block) {
    if (!el || !el.isConnected) return;
    requestAnimationFrame(function () {
      el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: block || 'start' });
      var h = block === 'nearest' ? null : el.querySelector('.lsn-h');
      if (h) try { h.focus({ preventScroll: true }); } catch (e) {}
    });
  }
  function order(stage) { var i = STAGES.indexOf(stage); return i < 0 ? 0 : i; }
  // The interactive's build brief follows a template ("The one thing you should see is X when you
  // Y"); Dan sees it as a friendly instruction instead.
  function friendlyBrief(text) {
    var t = String(text || '').replace(/\s+/g, ' ').trim();
    var m = t.match(/^the one thing (?:you should|to) see is\s+(.+)$/i);
    if (m) t = 'Watch for ' + m[1];
    if (t && !/[.!?]$/.test(t)) t += '.';
    return t;
  }
  // Leaving for the topic page: it scrolls the next idea into view instead of starting at the top.
  function toTopic(tid) { try { sessionStorage.setItem('mu-from-lesson', tid); } catch (e) { /* fine */ } }

  // ---------- sources ----------
  function sourceSheet(src) {
    if (!src) return null;
    var url = safeUrl(src.url), host = url ? hostOf(url) : '';
    var body = U.h('div', { class: 'lsn-src' },
      eyebrow(src.n != null ? 'Source ' + src.n : 'Source'),
      src.quote
        ? U.h('blockquote', { class: 'lsn-quote' }, U.h('p', null, '“' + String(src.quote).trim() + '”'))
        : U.h('p', { class: 'muted' }, 'No quote was saved for this source.'),
      url
        ? U.h('div', { class: 'lsn-src-go' },
          U.h('a', { class: 'btn secondary lsn-src-link', href: url, target: '_blank', rel: 'noopener' }, 'Open the page', U.icon('arrow')),
          host ? U.h('span', { class: 'lsn-src-host' }, host) : null)
        : U.h('p', { class: 'muted small' }, 'There is no link for this source.'));
    return U.sheet({ title: src.title || 'Source', body: body, autofocus: false });
  }
  U.lesson = { sourceSheet: sourceSheet };

  // ---------- the screen ----------
  function lessonScreen(params, ctx) {
    var tid = params.tid, iid = params.iid, key = tid + '/' + iid;
    var st = {
      topic: null, idea: null, index: -1, progress: { ideas: {} }, ip: { say: {} },
      doc: null, lesson: null, ready: false, begun: false, replay: null, again: false, feedback: null,
      guess: null, gen: 0, stage: 'predict', sections: {}, closed: {}, mounts: [], liveMount: null, cards: [],
      stops: [], waiters: [], prep: null, openedAt: Date.now(), dead: false, gone: false,
    };
    function alive() { return !st.dead && ctx.alive(); }
    function round() { return Number(st.ip.round) || 0; }

    // ---- frame: sticky bar, heading, stages, footer ----
    var stepBtns = STEPS.map(function (s) {
      return U.h('button', { class: 'lsn-step', type: 'button', disabled: true, 'aria-label': LABEL[s], on: { click: function () { jumpTo(s); } } }, U.h('i'));
    });
    var stepLabel = U.h('span', { class: 'lsn-steps-label', 'aria-hidden': 'true' }, LABEL.predict + ' · 1 of 5');
    var askBtn = U.h('button', { class: 'lsn-ask', type: 'button', 'aria-label': 'Ask Claude', on: { click: openTutor } },
      U.icon('chat'), U.h('span', null, 'Ask', U.h('span', { class: 'lsn-wide' }, ' Claude')));
    var bar = U.h('div', { class: 'lsn-bar' },
      U.h('a', { class: 'icon-btn lsn-close', href: '#/t/' + encodeURIComponent(tid), 'aria-label': 'Close the lesson and go back to the topic', on: { click: function () { toTopic(tid); } } }, U.icon('close')),
      U.h('nav', { class: 'lsn-steps', 'aria-label': 'Lesson progress' }, U.h('div', { class: 'lsn-steps-row' }, stepBtns), stepLabel),
      askBtn);
    var eb = U.h('p', { class: 'eyebrow lsn-eb' }, U.h('span', { class: 'skeleton lsn-sk-eb' }));
    var h1 = U.h('h1', { class: 'lsn-title' }, U.h('span', { class: 'skeleton lsn-sk-h1' }));
    var one = U.h('p', { class: 'lsn-one' });
    var notice = U.h('div', { class: 'lsn-notice', hidden: true });
    var flow = U.h('div', { class: 'lsn-flow' });
    var prepSlot = U.h('div', { class: 'lsn-prep-slot' });
    // "This looks wrong" appears once there is a lesson to attach the note to.
    var foot = U.h('footer', { class: 'lsn-foot', hidden: true }, linkBtn('This looks wrong', flagSheet, 'lsn-flag-link'));
    var root = U.h('div', { class: 'lsn' }, bar, U.h('header', { class: 'lsn-head' }, eb, h1, one), notice, flow, prepSlot, foot);
    ctx.view.appendChild(root);
    paintBar();

    // ---- load ----
    var loaded = false;
    var slowTimer = setTimeout(function () {
      if (loaded || !alive()) return;
      U.clear(notice).appendChild(U.h('p', { class: 'muted small', role: 'status' }, 'Still waiting for this lesson. The connection seems slow; it appears as soon as it arrives.'));
      notice.hidden = false;
    }, 8000);
    U.rt.ready.then(function () {
      return Promise.all([U.store.topic.get(tid), U.store.progress.get(tid), U.store.lesson.get(tid, iid)]);
    }).then(function (r) {
      loaded = true;
      if (!alive()) return;
      if (!st.gone) { U.clear(notice); notice.hidden = true; }
      var topic = r[0], doc = r[2];
      if (!topic) return missing('#/');
      st.topic = topic;
      st.index = (topic.ideas || []).map(function (i) { return i.id; }).indexOf(iid);
      st.idea = st.index >= 0 ? topic.ideas[st.index] : null;
      if (!st.idea) return missing('#/t/' + encodeURIComponent(tid));
      st.progress = r[1] || { ideas: {} };
      st.ip = normalise(U.clone((st.progress.ideas || {})[iid]) || {});
      fillHead();
      watchProgress();
      watchTopic();
      // Learn it again: Today's link, or the flag Today set on progress.
      var again = !!params.again || !!st.ip.relearn;
      if (params.again) try { history.replaceState(null, '', '#/t/' + encodeURIComponent(tid) + '/' + encodeURIComponent(iid)); } catch (e) { /* fine */ }
      if (again && U.gen && typeof U.gen.relearn === 'function') return startRelearn({});
      var first = {};
      if (!st.ip.startedAt) first.startedAt = st.ip.startedAt = U.now();
      if (!st.ip.stage) first.stage = st.ip.stage = 'predict';
      saveIdea(first);
      if (doc && doc.status === 'ready' && doc.lesson) {
        setDoc(doc); st.ready = true; begin(); prefetchNext();
      } else prepare(doc);
    }).catch(function (e) { loaded = true; if (alive()) fatal(e); });

    function normalise(ip) {
      ip = ip || {};
      ip.say = U.keyed(ip.say);
      ip.checks = ip.checks && typeof ip.checks === 'object' ? ip.checks : {};
      return ip;
    }
    // Fold the progress another device saved into what this screen knows.
    function adopt(remote) {
      var r = remote || {}, rr = Number(r.round) || 0, lr = round();
      if (rr < lr) return null;
      if (rr > lr) { st.ip = normalise(U.clone(r)); return 'round'; }
      if (order(r.stage) > order(st.ip.stage)) st.ip.stage = r.stage;
      if (r.doneAt) st.ip.doneAt = r.doneAt;
      if (r.startedAt && !st.ip.startedAt) st.ip.startedAt = r.startedAt;
      if (r.predict) st.ip.predict = U.clone(r.predict);
      // In place: the checks on screen hold these objects. What the db has was saved first, so it wins.
      var cks = st.ip.checks || (st.ip.checks = {}), rc = r.checks && typeof r.checks === 'object' ? r.checks : {};
      Object.keys(rc).forEach(function (k) { if (rc[k]) cks[k] = U.clone(rc[k]); });
      var says = st.ip.say || (st.ip.say = {}), rs = U.keyed(r.say);
      Object.keys(rs).forEach(function (k) { says[k] = rs[k]; });
      st.ip.relearn = !!r.relearn;
      if (r.againAt) st.ip.againAt = r.againAt;
      return null;
    }
    function watchProgress() {
      st.stops.push(U.store.progress.watch(tid, function (p) {
        if (!alive()) return;
        st.progress = p || { ideas: {} };
        var res = adopt((st.progress.ideas || {})[iid]);
        if (res === 'round' && !st.again) {
          // Another device started this idea again with a fresh lesson: show that one.
          U.toast('This idea was restarted with a fresh lesson on another device.');
          U._route();
        }
      }));
    }
    function watchTopic() {
      st.stops.push(U.store.topic.watch(tid, function (t) {
        if (!alive() || t || !st.topic || st.gone) return;
        st.gone = true;
        U.clear(notice).appendChild(U.h('div', { class: 'notice bad', role: 'status' },
          U.h('p', null, U.h('strong', null, 'This topic was deleted on another device. '), 'You can finish reading, but nothing more from this lesson will be saved.')));
        notice.hidden = false;
      }));
    }

    function fillHead() {
      var n = (st.topic.ideas || []).length;
      eb.textContent = (st.topic.title || 'Topic') + ' · Idea ' + (st.index + 1) + ' of ' + n;
      h1.textContent = st.idea.title || (st.lesson && st.lesson.title) || 'This idea';
      one.textContent = st.idea.oneLine || '';
      one.hidden = !st.idea.oneLine;
      U.setTitle(st.idea.title || st.topic.title);
    }
    function setDoc(doc) { st.doc = doc; st.lesson = doc.lesson; foot.hidden = !st.lesson; }
    function sources() { return (st.lesson && Array.isArray(st.lesson.sources)) ? st.lesson.sources : []; }
    function sourceOf(n) { return sources().filter(function (s) { return Number(s.n) === Number(n); })[0] || null; }
    var fn = { footnotes: { has: function (n) { return !!sourceOf(n); }, open: function (n) { sourceSheet(sourceOf(n)); } } };
    function fnButton(n) {
      return U.h('button', { class: 'fn', type: 'button', 'aria-label': 'Source ' + n, on: { click: function () { sourceSheet(sourceOf(n)); } } }, String(n));
    }

    // ---- preparing: ensureLesson with progress lines; predict shows as soon as it is written ----
    function prepare(doc) {
      st.prep = makePrep();
      prepSlot.appendChild(st.prep.el);
      if (doc && doc.lesson) haveLesson(doc);
      watchLesson();
      ensure();
    }
    // The lesson text arrives before its interactive: let Dan start on Predict meanwhile. While
    // relearning, the old (ready) lesson is ignored: only the new one, still building, counts.
    function watchLesson() {
      st.stops.push(U.store.lesson.watch(tid, iid, function (d) {
        if (!alive() || st.ready || !d || !d.lesson || st.lesson) return;
        if (st.again && d.status !== 'building') return;
        haveLesson(d);
      }));
    }
    function haveLesson(doc) {
      setDoc(doc);
      st.prep.title('Building the interactive');
      if (!st.begun && order(st.ip.stage) === 0) begin();
    }
    // Only the latest request counts (a Rebuild can start while an earlier one is still running).
    function settled(gen, d) {
      if (!alive() || gen !== st.gen) return;
      if (!d || !d.lesson || d.status === 'failed') throw { message: (d && d.error) || 'The lesson could not be written.' };
      setDoc(d); st.ready = true; st.again = false;
      st.prep.finish();
      var waiting = st.waiters.splice(0);
      waiting.forEach(function (f) { f(); });
      if (!st.begun) begin();
      prefetchNext();
    }
    // Background calls for this lesson already waiting their turn (it was being prefetched) run
    // now: Dan is waiting for it.
    function promote() {
      if (!U._gate || typeof U._gate.promote !== 'function' || !st.idea) return;
      var needle = String(st.idea.title || '').slice(0, 60).split('"')[0];
      if (needle.length < 4) return;
      U._gate.promote(function (input, o) {
        if (!/^(write-lesson|build-interactive|repair-interactive)$/.test(o && o.label || '')) return false;
        return (typeof input === 'string' ? input : JSON.stringify(input)).indexOf(needle) >= 0;
      });
    }
    function ensure() {
      st.prep.start(st.lesson ? 'Asking Claude to finish the interactive' : 'Asking Claude to write this lesson');
      var gen = st.gen;
      Promise.resolve().then(function () {
        if (!U.gen || typeof U.gen.ensureLesson !== 'function') throw { message: 'The lesson writer is not loaded in this view.' };
        var p = U.gen.ensureLesson(tid, iid, { onStatus: function (t) { if (alive() && !st.ready) st.prep.line(t); } });
        promote();
        return p;
      }).then(function (d) { settled(gen, d); }).catch(function (e) { if (alive() && gen === st.gen) st.prep.fail(e, ensure); });
    }
    function makePrep() {
      var head = U.h('p', { class: 'lsn-prep-head' }, 'Getting this idea ready');
      var lines = U.h('ol', { class: 'lsn-prep-lines' });
      var working = U.h('div', { class: 'working', 'aria-hidden': 'true' });
      var slow = U.h('p', { class: 'lsn-prep-slow', hidden: true }, 'Still going. The interactive takes longest: it tests itself before you see it, so you never get a broken one.');
      var err = U.h('div', { class: 'lsn-prep-err', hidden: true });
      var el = U.h('div', { class: 'lsn-prep', role: 'status', 'aria-live': 'polite' }, head, lines, working, slow, err);
      var last = null, timer = null;
      // Lines that say the same thing ("Building your interactive…" / "Building the interactive")
      // are shown once.
      function same(a, b) {
        function n(t) { return String(t || '').toLowerCase().replace(/\b(your|the|this|a|an)\b/g, '').replace(/[.…!\s]+/g, ' ').trim(); }
        return n(a) === n(b);
      }
      function tick(li) {
        li.classList.add('is-done');
        var t = li.querySelector('.lsn-prep-text');
        if (t) t.textContent = t.textContent.replace(/\s*(…|\.\.\.)$/, '');
      }
      function line(text) {
        text = String(text || '').trim();
        if (!text || (last && same(last.dataset.text, text)) || same(head.textContent, text)) return;
        if (last) tick(last);
        last = U.h('li', { dataset: { text: text } },
          U.h('span', { class: 'lsn-prep-mark', 'aria-hidden': 'true' }, U.h('i'), U.icon('tick', 'lsn-prep-ok'), U.icon('close', 'lsn-prep-x')),
          U.h('span', { class: 'lsn-prep-text' }, text));
        lines.appendChild(last);
      }
      return {
        el: el, line: line,
        title: function (t) { head.textContent = t; },
        start: function (first) {
          err.hidden = true; slow.hidden = true; working.hidden = false; U.clear(lines); last = null;
          line(first);
          clearTimeout(timer);
          timer = setTimeout(function () { slow.hidden = false; }, 40000);
        },
        // The step that failed gets a red cross (never a tick), and the error is said once, below.
        fail: function (e, retry) {
          clearTimeout(timer); working.hidden = true; slow.hidden = true;
          var msg = U.errText(e);
          if (last && same(last.dataset.text, msg)) { var dup = last; last = dup.previousElementSibling; dup.remove(); }
          if (last) last.classList.add('is-failed');
          U.clear(err).appendChild(U.h('div', { class: 'notice bad' }, U.h('div', { class: 'stack-sm' },
            U.h('p', null, U.h('strong', null, 'This lesson could not be prepared. '), msg),
            U.h('div', { class: 'row' }, btn('Try again', retry, 'small'), U.h('a', { class: 'linkish', href: '#/t/' + encodeURIComponent(tid), on: { click: function () { toTopic(tid); } } }, 'Back to the topic')))));
          err.hidden = false;
        },
        finish: function () { clearTimeout(timer); el.remove(); },
        stop: function () { clearTimeout(timer); },
      };
    }
    function prefetchNext() {
      var nx = nextIdea();
      if (!nx || !U.gen || typeof U.gen.ensureLesson !== 'function') return;
      var ctrl = typeof AbortController === 'function' ? new AbortController() : { signal: undefined, abort: function () {} };
      var entry = { tid: tid, ctrl: ctrl, done: false };
      prefetches.push(entry);
      U.store.lesson.get(tid, nx.id).then(function (d) {
        if (d && d.status === 'ready') return null;
        if (!inTopic(tid)) return null;
        return U.gen.ensureLesson(tid, nx.id, { background: true, signal: ctrl.signal });
      }).catch(function () { /* background work: the next lesson retries when opened */ }).then(function () { entry.done = true; });
    }
    function nextIdea() {
      var ideas = (st.topic && st.topic.ideas) || [], prog = (st.progress && st.progress.ideas) || {};
      function open(i) { var p = prog[i.id] || {}; return i.id !== iid && p.stage !== 'done' && !p.known && !i.known; }
      for (var k = st.index + 1; k < ideas.length; k++) if (open(ideas[k])) return ideas[k];
      for (var j = 0; j < st.index; j++) if (open(ideas[j])) return ideas[j];
      return null;
    }

    // ---- Learn it again ----
    // A fresh lesson with a different interactive: the idea starts a new round now (before the
    // new lesson is written, because writing it replaces the old one).
    function startRelearn(opts) {
      opts = opts || {};
      var now = U.now(), prev = round(), past = {};
      past[prev] = { stage: st.ip.stage || null, predict: st.ip.predict || null, checks: st.ip.checks || null, doneAt: st.ip.doneAt || null, at: now };
      var fields = { round: prev + 1, stage: 'predict', startedAt: now, againAt: now, relearn: false, predict: null, checks: null, doneAt: null, past: past };
      st.ip = normalise(Object.assign({}, st.ip, U.clone(fields)));
      saveIdea(fields);
      st.again = true; st.gen++; st.feedback = opts.feedback || null; st.replay = null; st.guess = null;
      st.ready = false; st.begun = false; st.lesson = null; st.doc = null;
      foot.hidden = true;
      destroyLive();
      U.clear(flow); st.sections = {}; st.closed = {}; st.stage = 'predict'; st.waiters = [];
      paintBar();
      if (st.prep) st.prep.finish();
      st.prep = makePrep();
      st.prep.title('Writing a fresh lesson');
      prepSlot.appendChild(st.prep.el);
      watchLesson();
      relearn();
      bring(st.prep.el, 'nearest');
    }
    function relearn() {
      st.prep.start('Asking Claude for a new way into this idea, with a different interactive');
      var gen = st.gen;
      Promise.resolve().then(function () {
        var o = { onStatus: function (t) { if (alive() && !st.ready) st.prep.line(t); } };
        if (st.feedback) o.feedback = st.feedback;
        return U.gen.relearn(tid, iid, o);
      }).then(function (d) { settled(gen, d); }).catch(function (e) { if (alive() && gen === st.gen) st.prep.fail(e, relearn); });
    }

    // ---- stage machinery ----
    var RENDER = { predict: renderPredict, play: renderPlay, explain: renderExplain, say: renderSay, checks: renderChecks };

    function begin() {
      st.begun = true;
      destroyLive();
      U.clear(flow); st.sections = {}; st.closed = {};
      var cur = st.replay ? 'predict' : (st.ip.stage || 'predict');
      var ci = STAGES.indexOf(cur);
      if (ci < 0) { cur = 'predict'; ci = 0; }
      for (var i = 0; i < Math.min(ci, 5); i++) addPast(STAGES[i]);
      if (cur === 'done') addDone(false);
      else addLive(cur, false);
    }
    function addLive(stage, scroll) {
      var sec = U.h('section', { class: 'lsn-stage', dataset: { stage: stage }, 'aria-label': LABEL[stage] });
      flow.appendChild(sec);
      st.sections[stage] = sec; st.stage = stage;
      paintBar();
      RENDER[stage](sec, true);
      // A stage can finish while rendering (e.g. every check already answered): then don't scroll back.
      if (scroll && st.stage === stage) bring(sec);
    }
    function addPast(stage) {
      var body = U.h('div', { class: 'lsn-past-body' });
      var det = U.h('details', { class: 'lsn-past', dataset: { stage: stage } },
        U.h('summary', null,
          U.h('span', { class: 'lsn-past-tick', 'aria-hidden': 'true' }, U.icon('tick')),
          U.h('span', { class: 'lsn-past-text' }, U.h('span', { class: 'lsn-past-label' }, LABEL[stage]), U.h('span', { class: 'lsn-past-sum' }, summaryOf(stage))),
          U.h('span', { class: 'lsn-chev', 'aria-hidden': 'true' }, U.icon('back'))),
        body);
      var drawn = false;
      det.addEventListener('toggle', function () {
        if (det.open && !drawn) { drawn = true; RENDER[stage](body, false); }
      });
      st.closed[stage] = true;
      flow.appendChild(det);
      st.sections[stage] = det;
    }
    // The run on screen: the saved record, or (Go through it again) a separate replay record.
    function run() { return st.replay || st.ip; }
    function guessOf() { return st.replay ? st.replay.predict : (st.guess || st.ip.predict); }
    function attemptsNow() {
      return U.list(st.ip.say).filter(function (a) { return (Number(a.round) || 0) === round(); });
    }
    function summaryOf(stage) {
      var l = st.lesson || {};
      if (stage === 'predict') {
        var g = guessOf(), a = g && g.answer;
        return a != null && a !== '' ? 'You guessed: ' + clip(a, 70) : 'You skipped the guess';
      }
      if (stage === 'play') {
        var it = st.doc && st.doc.interactive;
        return it && it.html ? clip(it.title || (l.interactive && l.interactive.title) || 'The interactive', 70) : 'No interactive for this idea';
      }
      if (stage === 'explain') return clip(l.explain && l.explain.text, 80);
      if (stage === 'say') {
        var says = attemptsNow(), last = says[says.length - 1];
        return last ? '“' + clip(last.text, 60) + '”' : 'Not answered';
      }
      if (stage === 'checks') {
        var res = run().checks || {}, list = usableChecks(), right = list.filter(function (c) { return res[c.id] && res[c.id].correct; }).length;
        return list.length ? right + ' of ' + list.length + ' right' : 'No checks for this idea';
      }
      return '';
    }
    function complete(stage) {
      st.closed[stage] = true;
      var sec = st.sections[stage];
      if (sec) {
        sec.classList.add('is-done');
        sec.querySelectorAll('.lsn-go').forEach(function (g) { g.remove(); });
      }
      var next = STAGES[STAGES.indexOf(stage) + 1];
      // The saved stage only ever moves forward (another device may already be further on).
      if (!st.replay && order(next) > order(st.ip.stage)) { st.ip.stage = next; saveIdea({ stage: next }); }
      if (next === 'done') addDone(true);
      else addLive(next, true);
    }
    function paintBar() {
      var ci = STAGES.indexOf(st.stage), all = st.stage === 'done';
      stepBtns.forEach(function (b, i) {
        var state = all ? 'done' : i < ci ? 'done' : i === ci ? 'now' : 'later';
        b.className = 'lsn-step is-' + state + (all ? ' is-all' : '');
        b.disabled = !st.sections[STEPS[i]];
        b.setAttribute('aria-label', LABEL[STEPS[i]] + (state === 'done' ? ', done' : state === 'now' ? ', current step' : ''));
        if (state === 'now') b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      });
      stepLabel.textContent = all ? 'Idea learned' : LABEL[st.stage] + ' · ' + (ci + 1) + ' of 5';
      bar.classList.toggle('is-all', all);
    }
    function jumpTo(stage) {
      var el = st.sections[stage];
      if (!el) return;
      if (el.tagName === 'DETAILS') el.open = true;
      bring(el);
    }

    // ---- saving progress ----
    // Every write names the round it belongs to, so a screen still showing an older lesson can't
    // write over the new one (the store drops it).
    function saveIdea(fields) {
      if (st.gone) return Promise.resolve(null);
      fields.round = round();
      var p = { lastIdea: iid, ideas: {} };
      p.ideas[iid] = fields;
      return U.store.progress.patch(tid, p).catch(function () { /* the store already told Dan */ });
    }
    function outcome() {
      var checks = {}, res = run().checks || {};
      usableChecks().forEach(function (c) {
        var r = res[c.id];
        if (r && !r.skipped) checks[c.id] = { correct: !!r.correct };
      });
      var says = attemptsNow(), last = says[says.length - 1];
      return { checks: checks, say: last ? { text: last.text, verdict: last.verdict || null } : null };
    }

    // ---- 1. Predict ----
    function renderPredict(box, live) {
      var p = (st.lesson && st.lesson.predict) || {};
      var options = Array.isArray(p.options) && p.options.length ? p.options : null;
      U.append(box, [live ? eyebrow('Predict') : null, heading(p.q || 'What do you think will happen?', true)]);
      if (!live) { box.appendChild(guessAndReveal()); return; }
      var playable = !!(st.lesson && st.lesson.interactive);
      box.appendChild(U.h('p', { class: 'lsn-lede' }, (playable ? 'Have a guess before you play.' : 'Have a guess first.') + ' Being wrong first is fine: it helps the answer stick.'));
      var choice = null, list = null, input = null;
      var sure = btn('That\'s my guess', function () { submit(options ? choice : input.value.trim()); }, 'lsn-main');
      sure.disabled = true;
      if (options) {
        list = U.h('div', { class: 'options lsn-options', role: 'group', 'aria-label': 'Your guess' });
        options.forEach(function (o) {
          var b = U.h('button', { class: 'option', type: 'button', 'aria-pressed': 'false', on: { click: function () {
            list.querySelectorAll('.option').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
            choice = String(o); sure.disabled = false; U.haptic(8);
          } } });
          list.appendChild(U.inline(b, String(o)));
        });
        box.appendChild(list);
      } else {
        input = U.h('input', { class: 'input', type: 'text', placeholder: 'Your guess, in a few words', 'aria-label': 'Your guess', autocomplete: 'off', enterkeyhint: 'done', maxlength: '300' });
        input.addEventListener('input', function () { sure.disabled = !input.value.trim(); });
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && input.value.trim()) { e.preventDefault(); submit(input.value.trim()); } });
        box.appendChild(input);
      }
      box.appendChild(go(sure, linkBtn('Skip', function () { submit(null); })));
      function submit(answer) {
        if (st.closed.predict) return;
        var rec = { answer: answer == null ? null : String(answer), at: U.now() };
        if (list) list.querySelectorAll('.option').forEach(function (x) { x.disabled = true; });
        if (input) input.disabled = true;
        if (st.replay) st.replay.predict = rec;
        else {
          st.guess = rec;
          // A guess already saved (perhaps on another device) is his first one: keep it.
          if (!st.ip.predict) { st.ip.predict = rec; saveIdea({ predict: rec }); }
        }
        complete('predict');
      }
    }
    function guessAndReveal() {
      var p = (st.lesson && st.lesson.predict) || {};
      var gr = guessOf(), g = gr && gr.answer;
      var said = g != null && g !== '';
      // When the lesson marks which option was right, a right guess is acknowledged.
      var right = said && typeof p.answer === 'number' && Array.isArray(p.options) && String(p.options[p.answer]) === String(g);
      return U.h('div', { class: 'lsn-reveal' },
        U.h('div', { class: 'lsn-reveal-guess' + (right ? ' is-right' : '') }, eyebrow('Your guess'),
          said ? U.inline(U.h('p'), String(g)) : U.h('p', { class: 'muted' }, 'You skipped the guess.'),
          right ? U.h('p', { class: 'lsn-called' }, U.icon('tick'), 'You called it.') : null),
        p.reveal ? U.h('div', { class: 'lsn-reveal-answer callout remember' }, eyebrow('What happens'), richBox(p.reveal, 'lsn-reveal-text', fn)) : null);
    }

    // ---- 2. Play ----
    function renderPlay(box, live) {
      var spec = (st.lesson && st.lesson.interactive) || null;
      var built = st.doc && st.doc.interactive;
      var title = (built && built.title) || (spec && spec.title) || 'What happens';
      var head = heading(title);
      U.append(box, [live ? eyebrow('Play') : null, head]);
      var brief = spec && spec.brief ? U.h('p', { class: 'lsn-lede' }, friendlyBrief(spec.brief)) : null;
      var stage = U.h('div', { class: 'lsn-play' });
      var notes = U.h('div', { class: 'lsn-discs' });
      var after = U.h('div', { class: 'lsn-after' });
      U.append(box, [brief, stage, notes, after]);
      var has = null, played = !live;

      function draw() {
        U.clear(stage); U.clear(notes);
        if (!st.ready) {
          has = null;
          stage.appendChild(U.h('div', { class: 'lsn-panel is-waiting' }, st.prep.el));
          st.waiters.push(function () { if (alive()) { built = st.doc.interactive; draw(); drawAfter(); } });
          return;
        }
        built = st.doc.interactive;
        has = !!(built && built.html);
        if (brief) brief.hidden = !has;
        if (!has && !spec) head.textContent = 'What happens';
        var m = null;
        if (has) m = mountPanel(stage, built, title);
        else stage.appendChild(noInteractive(spec));
        if (spec && has) drawNotes(notes, spec, m);
      }
      function drawAfter() {
        U.clear(after);
        var acting = live && !st.closed.play;
        if (played || has === false) {
          after.appendChild(guessAndReveal());
          if (acting) after.appendChild(go(btn('Continue', function () { complete('play'); }, 'lsn-main')));
        } else if (has === true) {
          if (acting) after.appendChild(go(btn('I\'ve had a play', function () { played = true; drawAfter(); bring(after, 'nearest'); }, 'lsn-main')));
        } else if (acting) {
          after.appendChild(go(linkBtn('Don\'t wait: read on while it builds', function () { played = true; drawAfter(); })));
        }
      }
      draw(); drawAfter();
    }
    // The kit host draws the card and its own loading line. The frame starts at the reserved height
    // (the height this device last measured for this interactive at this width, else a typical
    // one), so the page below barely moves when the interactive arrives.
    function mountPanel(holder, built, title) {
      // By the width the panel really gets: a phone, a wide column (stacked controls) or a
      // laptop (controls beside the picture, so a shorter frame).
      var w = holder.getBoundingClientRect().width || window.innerWidth;
      var size = w >= 860 ? 'laptop' : w >= 560 ? 'wide' : 'phone';
      var hkey = 'mu-lsn-h:' + key + (size === 'phone' ? '' : ':' + size), reserve = size === 'laptop' ? 640 : size === 'wide' ? 760 : 600;
      try { reserve = Number(localStorage.getItem(hkey)) || reserve; } catch (e) {}
      var panel = U.h('div', { class: 'lsn-panel' });
      var meta = U.h('div', { class: 'lsn-panel-foot' });
      holder.appendChild(panel); holder.appendChild(meta);
      var settled = false, warned = false;
      function settle(checks) {
        if (settled || !alive()) return;
        settled = true;
        // The badge comes from the self-test the app ran itself before saving the lesson, never
        // from what the frame reports about itself.
        void checks;
        selfChecks(meta, (built.selftest && built.selftest.checks) || []);
        setTimeout(function () {
          var hgt = m && m.frame && m.frame.isConnected ? Math.round(m.frame.getBoundingClientRect().height) : 0;
          if (hgt > 120) try { localStorage.setItem(hkey, String(hgt)); } catch (e) {}
        }, 900);
      }
      function trouble(e) {
        if (warned || !alive()) return;
        warned = true;
        // Fixed wording: text from inside the frame never appears in the app's own interface.
        console.warn('interactive problem:', e && (e.message || e));
        meta.appendChild(U.h('p', { class: 'lsn-selfwarn callout warn' }, 'The interactive hit a problem. You can carry on; the explanation below does not depend on it.'));
      }
      if (!U.sandbox || typeof U.sandbox.mount !== 'function') { trouble({ message: 'the interactive player is not loaded in this view' }); return null; }
      var m = null;
      try {
        m = U.sandbox.mount(panel, { html: built.html, title: title, minHeight: reserve, onError: function (msg) { trouble({ message: msg }); } });
      } catch (e) { trouble(e); return null; }
      st.mounts.push(m);
      st.liveMount = m;
      Promise.resolve(m && m.ready).then(function (checks) { settle(Array.isArray(checks) ? checks : null); }, function () { settle(null); });
      return m;
    }
    function selfChecks(meta, checks) {
      var n = checks.length, ok = checks.filter(function (c) { return c && c.ok; }).length;
      if (!n) return;
      meta.appendChild(U.h('p', { class: 'lsn-selfcheck', title: 'The interactive tested itself against answers worked out by hand' },
        U.icon('tick'), U.h('span', { class: 'visually-hidden' }, 'Self-test: '), ok + '/' + n + ' checks'));
      if (ok < n) {
        meta.appendChild(U.h('p', { class: 'lsn-selfwarn callout remember' },
          (n - ok) + ' of its ' + n + ' self-checks did not pass, so treat its exact numbers with some care. The pattern it shows should still hold.'));
      }
    }
    function noInteractive(spec) {
      var why = spec
        ? 'The interactive for this idea did not pass its own tests, so it is left out rather than risk showing you something wrong.'
        : 'This idea is about how things fit together rather than numbers you can change, so there is nothing to play with.';
      return U.h('div', { class: 'lsn-none' },
        U.h('p', { class: 'lsn-none-head' }, 'No interactive for this one'),
        U.h('p', { class: 'muted' }, why + ' What happens is just below.'));
    }
    // "What am I looking at?": the numbers behind the interactive. Values Dan sets are read from
    // the interactive when the panel opens, so they match what it shows; the rest are labelled as
    // the values it starts from.
    function drawNotes(notes, spec, mount) {
      var nums = (spec.numbers || []).filter(function (n) { return n && n.label; });
      var controls = Array.isArray(spec.controls) ? spec.controls : [];
      function norm(t) { return String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
      function controlFor(n) {
        var l = norm(n.label);
        return controls.filter(function (c) { return c && (norm(c.label) === l || norm(c.id) === l); })[0] || null;
      }
      var live = [];
      if (spec.whatAmILookingAt || nums.length) {
        var d = disc('What am I looking at?', [
          spec.whatAmILookingAt ? richBox(spec.whatAmILookingAt, 'lsn-disc-text', fn) : null,
          nums.length ? U.h('dl', { class: 'lsn-nums' }, nums.map(function (n) {
            var c = n.kind === 'control' ? controlFor(n) : null;
            var now = c ? U.h('span', { class: 'lsn-num-now', hidden: true }) : null;
            if (now) live.push({ el: now, c: c });
            var val = String(n.value == null ? '' : n.value);
            var named = c && Array.isArray(c.options) && c.options.length ? c.options.map(String) : null;
            return U.h('div', { class: 'lsn-num' },
              U.h('dt', null, String(n.label)),
              U.h('dd', null, U.h('span', { class: 'lsn-num-val' }, n.kind === 'assumed' && !/^for example/i.test(val) ? 'for example ' + val : val), now,
                NUMBER_KIND[n.kind] ? U.h('span', { class: 'lsn-num-kind' }, NUMBER_KIND[n.kind] + (n.kind === 'computed' && mount ? ', from its starting values' : '')) : null,
                n.source != null && sourceOf(n.source) ? fnButton(n.source) : null),
              named ? U.h('dd', { class: 'lsn-num-options' }, 'Choices: ' + named.join(' · ')) : null);
          })) : null]);
        if (live.length && mount && typeof mount.get === 'function') {
          d.addEventListener('toggle', function () {
            if (!d.open) return;
            Promise.race([Promise.resolve().then(function () { return mount.get(); }), U.sleep(1500).then(function () { return null; })]).then(function (s) {
              var params = s && s.params || {};
              live.forEach(function (x) {
                var raw = params[x.c.id], text = null;
                if (Array.isArray(x.c.options) && x.c.options.length) {
                  // A named control: its value is the chosen option (or its index).
                  text = typeof raw === 'number' && x.c.options[raw] != null ? String(x.c.options[raw]) : (typeof raw === 'string' && raw ? raw : null);
                } else {
                  var v = Number(raw);
                  if (raw != null && raw !== '' && isFinite(v)) text = (Math.round(v * 1000) / 1000).toLocaleString() + (x.c.unit ? ' ' + x.c.unit : '');
                }
                if (text == null) return;
                x.el.textContent = 'now ' + text;
                x.el.hidden = false;
              });
            }, function () { /* the interactive did not answer: the starting values stay */ });
          });
        }
        notes.appendChild(d);
      }
      if (spec.ignores) notes.appendChild(disc('What this model ignores', richBox(spec.ignores, 'lsn-disc-text', fn)));
    }

    // ---- 3. Explain ----
    function renderExplain(box, live) {
      var l = st.lesson || {}, ex = l.explain || {};
      U.append(box, [live ? eyebrow('Explain') : null, heading('What\'s going on'), U.h('div', { class: 'reading lsn-reading' }, U.rich(ex.text || '', fn))]);
      if (st.doc && st.doc.sourced === false) {
        box.appendChild(U.h('p', { class: 'lsn-quiet' }, U.h('strong', null, 'Not yet source-checked. '), 'Claude wrote this from what it already knows; no live sources were checked for this idea.'));
      } else if (l.confidence === 'simplified') {
        box.appendChild(U.h('p', { class: 'lsn-quiet' }, U.h('strong', null, 'Simplified. '), 'The full picture has more to it. This is the part that matters for now.'));
      }
      if (l.analogy && l.analogy.text) {
        box.appendChild(U.h('div', { class: 'lsn-analogy' },
          eyebrow('Think of it like this'), richBox(l.analogy.text, 'lsn-analogy-text', fn),
          l.analogy.breaks ? U.h('div', { class: 'lsn-breaks' }, eyebrow('Where it breaks'), richBox(l.analogy.breaks, null, fn)) : null));
      }
      var views = l.contested && Array.isArray(l.contested.views) ? l.contested.views.filter(function (v) { return v && v.text; }) : [];
      if (l.confidence === 'contested' || views.length) {
        box.appendChild(U.h('div', { class: 'lsn-contest' },
          U.h('p', { class: 'lsn-flag' }, 'Experts disagree'),
          U.h('p', { class: 'lsn-contest-lede' }, views.length > 1 ? 'This is still argued over, so here are the main views side by side.' : 'This is still argued over; treat it as an open question.'),
          views.length ? U.h('div', { class: 'lsn-views' }, views.map(function (v) {
            return U.h('div', { class: 'lsn-view' }, U.h('h3', null, String(v.label || 'One view')), richBox(v.text, 'lsn-view-text', fn));
          })) : null));
      }
      var src = sources();
      if (src.length) {
        box.appendChild(U.h('div', { class: 'lsn-discs' }, disc('Sources (' + src.length + ')', U.h('ol', { class: 'lsn-sources' }, src.map(function (s) {
          return U.h('li', null, U.h('button', { class: 'lsn-source-btn', type: 'button', on: { click: function () { sourceSheet(s); } } },
            U.h('span', { class: 'lsn-source-n' }, String(s.n)),
            U.h('span', { class: 'lsn-source-t' }, String(s.title || hostOf(s.url) || 'Source'), U.h('span', { class: 'lsn-source-host' }, hostOf(s.url)))));
        })))));
      }
      if (live) box.appendChild(go(btn('Continue', function () { complete('explain'); }, 'lsn-main')));
    }

    // ---- 4. Say it back ----
    function renderSay(box, live) {
      var say = (st.lesson && st.lesson.say) || {};
      var rubric = Array.isArray(say.rubric) ? say.rubric : [];
      var attempts = attemptsNow();
      U.append(box, [live ? eyebrow('Say it back') : null, heading(say.prompt || 'Explain this idea in your own words.', true)]);
      var log = U.h('div', { class: 'lsn-say-log' });
      attempts.forEach(function (a, i) {
        var v = attemptView(a.text, i + 1);
        if (a.verdict) v.appendChild(gradeView(a, i + 1, i === attempts.length - 1 && live));
        log.appendChild(v);
      });
      if (!live) {
        box.appendChild(log);
        if (modelOf(attempts[attempts.length - 1])) box.appendChild(modelAnswer(attempts[attempts.length - 1], true));
        return;
      }
      var tip = media('(pointer: coarse)') ? ' Tip: tap the microphone on your keyboard to say it out loud instead of typing.' : '';
      box.appendChild(U.h('p', { class: 'lsn-lede' }, 'Explain it as if to a friend who hasn\'t seen it. A few sentences is plenty.' + tip));
      box.appendChild(log);
      var slot = U.h('div', { class: 'lsn-say-slot' });
      var ta = U.h('textarea', { class: 'textarea lsn-say-input', rows: 4, maxlength: 2000, 'aria-label': 'Your explanation', placeholder: 'In my own words…' });
      ta.value = drafts[key] || '';
      var send = btn('Check my answer', submit, 'lsn-main');
      send.disabled = !ta.value.trim();
      ta.addEventListener('input', function () { drafts[key] = ta.value; send.disabled = !ta.value.trim(); });
      ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submit(); } });
      var compose = U.h('div', { class: 'lsn-compose' }, ta, go(send));
      var after = U.h('div', { class: 'lsn-after' });
      U.append(box, [slot, compose, after]);
      var busy = false;
      compose.hidden = attempts.length > 0;
      if (attempts.length) next();

      function submit() {
        var text = ta.value.trim();
        if (!text || busy) return;
        busy = true;
        U.clear(slot);
        var no = attempts.length + 1;
        var view = attemptView(text, no);
        var wait = U.h('div', { class: 'lsn-grading', role: 'status' }, U.h('p', null, 'Reading your answer…'), U.h('div', { class: 'working', 'aria-hidden': 'true' }));
        view.appendChild(wait);
        log.appendChild(view);
        compose.hidden = true;
        bring(view, 'nearest');
        Promise.resolve().then(function () {
          if (!U.gen || typeof U.gen.grade !== 'function') throw { message: 'Checking answers is not available in this view.' };
          var prev = attempts[attempts.length - 1];
          return U.gen.grade(say, text, no, { previous: prev ? { text: prev.text, followUp: prev.followUp || '' } : null, title: st.idea && st.idea.title });
        }).then(function (g) {
          if (!g || typeof g !== 'object') throw { message: 'Claude\'s check came back empty.' };
          busy = false;
          var rec = { text: text, at: U.now(), verdict: g.verdict || 'not-yet', met: rubric.map(function (r, i) { return !!(g.met && g.met[i]); }), nailed: String(g.nailed || ''), followUp: String(g.followUp || '') };
          if (typeof g.model === 'string' && g.model.trim()) rec.model = g.model.trim();
          // Saved even if Dan has left the lesson while it was being graded.
          record(rec);
          if (!alive()) return;
          wait.remove();
          view.appendChild(gradeView(rec, no, true));
          next();
          bring(view.lastChild, 'nearest');
        }).catch(function (e) {
          busy = false;
          if (!alive()) return;
          view.remove();
          compose.hidden = false;
          slot.appendChild(U.h('div', { class: 'notice bad' }, U.h('div', { class: 'stack-sm' },
            U.h('p', null, U.h('strong', null, 'Your answer could not be checked just now. '), U.errText(e)),
            U.h('div', { class: 'row' }, btn('Try again', submit, 'small'),
              linkBtn('Save it without checking', function () {
                U.clear(slot);
                var rec = { text: text, at: U.now(), verdict: null, met: [] };
                record(rec);
                log.appendChild(attemptView(text, attempts.length));
                compose.hidden = true;
                reveal();
              })))));
        });
      }
      // Each attempt is its own entry (keyed), so answers given on two devices are both kept.
      function record(rec) {
        rec.round = round();
        var k = U.key(), patch = {};
        attempts.push(rec);
        st.ip.say[k] = rec;
        patch[k] = rec;
        delete drafts[key];
        saveIdea({ say: patch });
      }
      function next() {
        var last = attempts[attempts.length - 1];
        if (last && last.verdict && last.verdict !== 'got-it' && attempts.length < 2) {
          U.clear(after).appendChild(go(
            btn('Have another go', function () {
              U.clear(after);
              ta.value = last.text; drafts[key] = ta.value;
              send.textContent = 'Check again'; send.disabled = false;
              compose.hidden = false;
              ta.focus();
              bring(compose, 'nearest');
            }, 'lsn-main'),
            linkBtn('Show me a model answer', reveal)));
        } else reveal();
      }
      function reveal() {
        var last = attempts[attempts.length - 1];
        U.clear(after);
        if (modelOf(last)) after.appendChild(modelAnswer(last, !last || last.verdict !== 'got-it'));
        if (!st.closed.say) after.appendChild(go(btn('Continue', function () { complete('say'); }, 'lsn-main')));
      }
      function attemptView(text, no) {
        return U.h('div', { class: 'lsn-attempt' },
          U.h('div', { class: 'lsn-bubble' }, U.h('p', { class: 'lsn-bubble-label' }, no > 1 ? 'Your second go' : 'Your answer'), U.h('p', { class: 'lsn-bubble-text' }, text)));
      }
      function gradeView(a, no, withFollow) {
        var met = rubric.filter(function (r, i) { return a.met && a.met[i]; });
        return U.h('div', { class: 'lsn-grade' },
          U.h('p', { class: 'lsn-verdict' }, VERDICT[a.verdict] || 'Checked'),
          a.nailed ? richBox(a.nailed, 'lsn-nailed') : null,
          met.length ? U.h('ul', { class: 'lsn-met', 'aria-label': 'What you nailed' }, met.map(function (r) {
            return U.h('li', null, U.icon('tick', 'lsn-tick'), U.inline(U.h('span'), String(r)));
          })) : null,
          withFollow && a.followUp && a.verdict !== 'got-it' && no < 2
            ? U.h('div', { class: 'lsn-follow' }, eyebrow('One thing to add'), richBox(a.followUp)) : null);
      }
      // The grader may word a model answer for his second miss; otherwise the lesson's own.
      function modelOf(a) { return (a && a.model) || say.model || ''; }
      function modelAnswer(last, open) {
        var met = (last && last.met) || [];
        var content = [
          richBox(modelOf(last), 'lsn-model-text'),
          rubric.length ? U.h('ul', { class: 'lsn-met lsn-rubric', 'aria-label': 'What a full answer covers' }, rubric.map(function (r, i) {
            return U.h('li', { class: met[i] ? 'is-met' : null }, met[i] ? U.icon('tick', 'lsn-tick') : U.h('span', { class: 'lsn-ring', 'aria-hidden': 'true' }),
              U.inline(U.h('span'), String(r)), met[i] ? U.h('span', { class: 'visually-hidden' }, ' (you said this)') : null);
          })) : null];
        if (open) return U.h('div', { class: 'callout remember lsn-model' }, eyebrow('A model answer'), content);
        return U.h('div', { class: 'lsn-discs' }, disc('Compare with a model answer', content));
      }
    }

    // ---- 5. Check ----
    function usableChecks() {
      var hasIt = !!(st.doc && st.doc.interactive && st.doc.interactive.html);
      return ((st.lesson && st.lesson.checks) || []).filter(function (c) { return c && c.id && (c.type !== 'target' || hasIt); });
    }
    function renderChecks(box, live) {
      var all = usableChecks();
      U.append(box, [live ? eyebrow('Check') : null, heading('Quick checks')]);
      if (!all.length) {
        box.appendChild(U.h('p', { class: 'lsn-lede' }, 'There are no quick checks for this idea.'));
        if (live) box.appendChild(go(btn('Finish', function () { complete('checks'); }, 'lsn-main')));
        return;
      }
      if (!live) {
        var res = run().checks || {};
        box.appendChild(U.h('ol', { class: 'lsn-check-list' }, all.map(function (c) {
          var r = res[c.id];
          return U.h('li', null, U.inline(U.h('span', { class: 'lsn-check-q' }), clip(c.q, 140)),
            U.h('span', { class: 'lsn-check-res' + (r && !r.skipped ? (r.correct ? ' is-right' : ' is-wrong') : '') }, r && !r.skipped ? (r.correct ? 'Right' : 'Not quite') : 'Not answered'));
        })));
        return;
      }
      box.appendChild(U.h('p', { class: 'lsn-lede' }, (WORDS[all.length] || all.length) + ' quick question' + (all.length > 1 ? 's' : '') + '. What you answer here comes back later as review cards.'));
      var list = U.h('div', { class: 'lsn-checks' });
      box.appendChild(list);
      if (!U.cards || typeof U.cards.render !== 'function') {
        list.appendChild(U.h('p', { class: 'callout note' }, 'The quick checks are not loaded in this view, so they are skipped this time.'));
        box.appendChild(go(btn('Finish', function () { complete('checks'); }, 'lsn-main')));
        return;
      }
      // Answered already (here or on another device) are not asked again; a replay asks them all.
      var done = st.replay ? st.replay.checks : (st.ip.checks || (st.ip.checks = {}));
      var seen = {};
      var i = 0;
      step(false);
      function step(scroll) {
        while (i < all.length && (done[all[i].id] || seen[all[i].id])) i++;
        if (i >= all.length) { complete('checks'); return; }
        show(all[i], i, scroll);
      }
      function show(c, k, scroll) {
        var host = U.h('div', { class: 'lsn-check' }, U.h('p', { class: 'lsn-check-count' }, 'Question ' + (k + 1) + ' of ' + all.length));
        list.appendChild(host);
        var once = false, el;
        try {
          el = U.cards.render({ id: c.id, tid: tid, iid: iid, type: c.type, spec: c }, { mode: 'lesson', lesson: st.doc, onDone: function (r) {
            if (once || !alive()) return;
            once = true;
            r = r || {};
            seen[c.id] = true;
            if (!r.skipped) {
              var rec = { correct: r.correct === true, at: U.now() };
              if (st.replay) st.replay.checks[c.id] = rec;
              else if (!st.ip.checks[c.id]) {
                // The first answer to a check is the one that counts (and becomes a review card).
                st.ip.checks[c.id] = rec;
                var patch = {};
                patch[c.id] = rec;
                saveIdea({ checks: patch });
              }
            }
            i = k + 1;
            step(true);
          } });
        } catch (e) {
          console.error(e);
          el = U.h('p', { class: 'callout note' }, 'This question could not be shown, so it is skipped.');
          once = true; seen[c.id] = true; i = k + 1;
          setTimeout(function () { if (alive()) step(true); }, 0);
        }
        st.cards.push(el);
        host.appendChild(el);
        if (scroll) bring(host);
      }
    }

    // ---- Done ----
    function addDone(live) {
      var first = live && !st.replay && !st.ip.doneAt;
      if (live && !st.replay) {
        var f = { stage: 'done' };
        if (first) f.doneAt = st.ip.doneAt = U.now();
        st.ip.stage = 'done';
        saveIdea(f);
        // Review cards come from the first time through (or a fresh round of Learn it again).
        if (first && U.review && typeof U.review.addFromLesson === 'function' && !st.gone) {
          Promise.resolve().then(function () { return U.review.addFromLesson(tid, iid, st.lesson, outcome()); })
            .catch(function (e) { if (!(e && e.queued)) U.toast('Your review cards could not be saved: ' + U.errText(e), { kind: 'bad' }); });
        }
      }
      if (live && st.replay) {
        // Going through it again is recorded on its own: the first guess and results stay as they were.
        var rp = {}, rk = U.key();
        rp[rk] = { at: U.now(), predict: st.replay.predict || null, checks: st.replay.checks };
        saveIdea({ replays: rp });
      }
      st.stage = 'done';
      var res = run().checks || {};
      var all = usableChecks(), right = all.filter(function (c) { return res[c.id] && res[c.id].correct; }).length;
      var says = attemptsNow();
      var nx = nextIdea();
      var topicHref = '#/t/' + encodeURIComponent(tid);
      var sec = U.h('section', { class: 'lsn-stage lsn-done' + (first ? ' is-fresh' : ''), dataset: { stage: 'done' }, 'aria-label': 'Idea learned' },
        U.h('div', { class: 'lsn-done-mark', 'aria-hidden': 'true' }, U.icon('tick')),
        heading(live ? (st.replay ? 'Gone through again' : 'Idea learned') : 'You\'ve learned this idea'),
        U.h('p', { class: 'lsn-done-text' },
          (!all.length ? '' : right === all.length ? (all.length === 1 ? 'You got the check right. ' : 'All ' + all.length + ' checks right. ') : right + ' of ' + all.length + ' checks right. ') +
          (live && st.replay ? 'Your first answers stay as they were; this run is noted separately.' :
            (says.length ? 'Your explanation is saved in your Book, and ' : '') +
            (says.length ? 'what you answered comes back as review cards, spaced out so it sticks.' : 'What you answered comes back as review cards, spaced out so it sticks.'))),
        nx
          ? U.h('div', { class: 'lsn-next' }, eyebrow('Where next?'), U.h('h3', null, String(nx.title || 'The next idea')),
            nx.oneLine ? U.h('p', { class: 'muted' }, String(nx.oneLine)) : null,
            go(U.h('a', { class: 'btn lsn-main', href: topicHref + '/' + encodeURIComponent(nx.id) }, 'Start this idea', U.icon('arrow')),
              U.h('a', { class: 'btn secondary', href: topicHref, on: { click: function () { toTopic(tid); } } }, 'Back to topic')))
          : U.h('div', { class: 'lsn-next' }, eyebrow('Where next?'), U.h('h3', null, 'That was the last idea in ' + (st.topic.title || 'this topic')),
            U.h('p', { class: 'muted' }, 'Every idea here is learned. Your review cards will bring them back a little before you would forget them.'),
            go(U.h('a', { class: 'btn lsn-main', href: topicHref, on: { click: function () { toTopic(tid); } } }, 'Back to topic'))),
        U.h('p', { class: 'lsn-again' }, linkBtn('Go through it again', function () { st.replay = { predict: null, checks: {} }; begin(); bring(flow); })));
      flow.appendChild(sec);
      st.sections.done = sec;
      paintBar();
      if (live) bring(sec);
      // First time only: the celebration pops exactly where the done mark sits (the section is
      // scrolled so the mark is at the cheer's spot), then fades into it.
      if (first) setTimeout(function () { if (alive()) U.cheer(); }, reducedMotion() ? 0 : 450);
    }

    // ---- Ask Claude, flagging, errors ----
    function openTutor() {
      if (!U.tutor || typeof U.tutor.open !== 'function') { U.toast('Ask Claude is not available in this view.'); return; }
      var m = st.liveMount;
      U.tutor.open({
        tid: tid, iid: iid, topic: st.topic, idea: st.idea, lesson: st.lesson, lessonDoc: st.doc, stage: st.stage,
        getState: m && typeof m.get === 'function' ? function () { return m.get(); } : null,
      });
    }
    // "This looks wrong": the note is kept with the lesson (newest 30), and Dan can have Claude
    // rebuild the lesson with the note in mind (a new round, like Learn it again).
    function saveFlag(note) {
      return U.store.lesson.get(tid, iid).then(function (d) {
        if (!d) throw { message: 'There is no lesson saved yet to attach it to.' };
        var list = U.entries(d.flags), patch = { flags: Array.isArray(d.flags) ? U.keyed(d.flags) : {} };
        patch.flags[U.key()] = { note: note.slice(0, 1000), at: U.now(), stage: st.stage };
        list.slice(0, Math.max(0, list.length - 29)).forEach(function (e) { patch.flags[e.key] = null; });
        return U.store.lesson.update(tid, iid, patch);
      });
    }
    function flagSheet() {
      if (!st.lesson) return;
      var canRebuild = !!(U.gen && typeof U.gen.relearn === 'function') && !st.gone;
      var ta = U.h('textarea', { class: 'textarea', rows: 3, maxlength: 1000, 'aria-label': 'What looks wrong', placeholder: 'For example: the slider makes the swing faster, but the text says slower' });
      function send(rebuild) {
        return function (api) {
          var note = ta.value.trim();
          if (!note) { ta.focus(); return; }
          api.close();
          saveFlag(note).then(function () { if (!rebuild) U.toast('Thanks. Your note is kept with this lesson.'); },
            function (e) { if (!(e && e.queued)) U.toast('That could not be saved: ' + U.errText(e), { kind: 'bad' }); });
          if (rebuild && alive()) startRelearn({ feedback: note });
        };
      }
      U.sheet({
        title: 'What looks wrong?',
        body: U.h('div', { class: 'stack-sm' },
          U.h('p', { class: 'muted' }, 'Say what seems off and where. Your note is kept with this lesson.' +
            (canRebuild ? ' You can also have Claude rebuild the lesson with your note in mind: it writes a new version of this idea and starts it from the beginning.' : '')),
          ta),
        actions: [
          { label: 'Cancel', kind: 'secondary' },
          { label: 'Keep my note', kind: canRebuild ? 'secondary' : 'primary', onClick: send(false) },
          canRebuild ? { label: 'Rebuild this lesson', kind: 'primary', onClick: send(true) } : null,
        ].filter(Boolean),
      });
    }
    function missing(back) {
      U.clear(ctx.view).appendChild(U.h('div', { class: 'empty' },
        U.h('h1', { class: 'lsn-missing-h' }, 'This idea is not here'),
        U.h('p', null, 'It may have been removed along with its topic.'),
        U.h('p', { class: 'lsn-missing-go' }, U.h('a', { class: 'btn secondary', href: back }, 'Go back'))));
    }
    function fatal(e) {
      U.clear(ctx.view).appendChild(U.h('div', { class: 'notice bad' }, U.h('div', { class: 'stack-sm' },
        U.h('p', null, U.h('strong', null, 'This lesson could not be opened. '), U.errText(e)),
        U.h('div', { class: 'row' }, btn('Try again', function () { U._route(); }, 'small'), U.h('a', { class: 'linkish', href: '#/t/' + encodeURIComponent(tid) }, 'Back to the topic')))));
    }
    function destroyLive() {
      st.mounts.splice(0).forEach(function (m) { try { if (m && m.destroy) m.destroy(); } catch (e) {} });
      st.cards.splice(0).forEach(function (c) { try { if (c && c.destroy) c.destroy(); } catch (e) {} });
      st.liveMount = null;
    }

    return function cleanup() {
      st.dead = true;
      clearTimeout(slowTimer);
      destroyLive();
      st.stops.splice(0).forEach(function (f) { try { f(); } catch (e) {} });
      if (st.prep) st.prep.stop();
      // Study time is logged by the boot module's activity tracker (U.boot.study); log here only without it.
      var mins = (Date.now() - st.openedAt) / 60000;
      if (!(U.boot && U.boot.study) && mins >= 0.5 && typeof U.logStudy === 'function') {
        Promise.resolve().then(function () { return U.logStudy(Math.min(60, Math.max(1, Math.round(mins)))); }).catch(function () {});
      }
    };
  }

  U.routes.add('#/t/:tid/:iid', lessonScreen, { focus: true, title: 'Lesson' });
  U.routes.add('#/t/:tid/:iid/again', function (params, ctx) { params.again = true; return lessonScreen(params, ctx); }, { focus: true, title: 'Lesson' });
})();
