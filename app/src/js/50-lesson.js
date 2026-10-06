// Lesson screen, route #/t/:tid/:iid (focus mode). Teaches one idea in five stages:
//   Predict -> Play (the sandboxed interactive) -> Explain -> Say it back (graded) -> Check.
//
// Reads topics/{tid} and topics/{tid}/lessons/{iid}. A lesson opens only when it is whole: status
// ready, with its interactive built and tested (or ready without one, and the honest note why).
// Until then the screen shows only the preparation card (the eyebrow, the title, the idea's one
// line, honest steps of what is happening now and a calm note) while U.gen.ensureLesson writes
// it, builds its interactive and tests it; never Predict or any lesson text. Progress is saved to his private progress doc as he goes (stage, prediction, every say-it-back
// attempt, check results, doneAt), so reopening resumes where he left off with earlier stages
// collapsed but reviewable. Contract: docs/ARCHITECTURE.md sections 4, 5 and 9; the progress
// shapes (rounds, keyed say entries, replays) are described at the top of 20-store.js.
//
// Two devices: the screen watches the progress doc and folds in what the other device saved.
// Stages only move forward, and a guess or check result saved first (anywhere) is never
// overwritten. "Go through it again" records its run separately (ideas[iid].replays).
//
// Learn it again: '#/t/:tid/:iid/again' (Today's link, while the idea is still slipping), or
// "Rebuild this lesson" in the "This looks wrong" sheet. Today's flag on its own (relearn: true)
// never rebuilds a lesson Dan opens to read. U.gen.relearn writes a fresh lesson with a different
// interactive. His request stays open on progress (relearn, relearnId, relearnAt, relearnNote)
// until that lesson is whole: the doc the rewrite writes carries the request's token (request ===
// relearnId), so every device knows the fresh lesson without comparing clocks. Only then does the
// idea start a new round (stage back to predict, check results and guess for the new lesson
// cleared, the old ones kept under ideas[iid].past), once, whichever device gets there first.
// A rewrite that fails is tried again the next time the idea is opened. A screen writes only for
// the request it opened or took up when it loaded; a newer one asked on another device is
// followed (this screen's own work stops, and the lesson written there opens here).
//
// Screen readers: results (a say-it-back verdict, what happens, the next question) are said in one
// polite live region, and focus moves to what has just appeared, never left on a removed button.
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
  // Rewrites one screen starts on its own for one request of Dan's (the first, and one more when
  // the doc that came back is not the fresh one): more need his Try again.
  var MAX_REWRITES = 2;
  var drafts = {}; // unsent say-it-back text for this page session, by 'tid/iid'
  // Background work: once a lesson is whole, the next open idea is prepared in full (written, its
  // interactive built and tested) as background work, and a lesson Dan leaves while it is being
  // prepared carries on the same way (U.gen.demote). Both keep going while the app is open,
  // yielding to whatever Dan is doing; opening one makes it foreground again (U.gen promotes its
  // queued model calls by the lesson's gate key).

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
  // Scroll a new stage (or question) into view; focus goes to its heading (a stage's .lsn-h, a
  // check card's question .qc-q), so a keyboard or screen reader carries on from there.
  function bring(el, block) {
    if (!el || !el.isConnected) return;
    requestAnimationFrame(function () {
      el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: block || 'start' });
      var h = block === 'nearest' ? null : el.querySelector('.lsn-h, .qc-q');
      if (h) land(h);
    });
  }
  // Focus something that has just appeared (a heading, a verdict, a callout): it takes focus
  // without becoming a Tab stop, and the page does not jump for it.
  function land(el) {
    if (!el || !el.isConnected) return;
    if (!/^(A|BUTTON|INPUT|TEXTAREA|SELECT|SUMMARY)$/.test(el.tagName) && !el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '-1');
      el.classList.add('lsn-land');
    }
    try { el.focus({ preventScroll: true }); } catch (e) { /* fine */ }
  }
  function order(stage) { var i = STAGES.indexOf(stage); return i < 0 ? 0 : i; }
  // A lesson is shown only when it is whole (U.store.lesson.state, docs/ARCHITECTURE.md 4).
  function whole(doc) { return !!doc && doc.status === 'ready' && !!doc.lesson; }
  // This page's own generation status for a lesson (U.gen.status), when the generator is loaded.
  function liveOf(tid, iid) {
    try { return U.gen && typeof U.gen.status === 'function' ? (((U.gen.status(tid) || {}).lessons) || {})[iid] : undefined; } catch (e) { return undefined; }
  }
  function stepName(stage) { return 'Step ' + (STEPS.indexOf(stage) + 1) + ' of ' + STEPS.length + ': ' + LABEL[stage]; }
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
      stops: [], prep: null, pending: null, seen: null, asked: null, own: null, ctrl: null, saw: false, askRound: 0, askSaved: null, rewrites: 0, opening: -1,
      nextStop: null, openedAt: Date.now(), dead: false, gone: false,
    };
    function alive() { return !st.dead && ctx.alive(); }
    function round() { return Number(st.ip.round) || 0; }
    // Dan's own open Learn it again request (Today's link or Rebuild). Today's flag alone (relearn
    // with no token: the idea was slipping when Today looked) is a suggestion, not a request.
    function requestOpen() { return !!(st.ip.relearn && (st.ip.relearnId || st.ip.relearnAt)); }

    // ---- frame: sticky bar, heading, stages, footer ----
    var stepBtns = STEPS.map(function (s) {
      return U.h('button', { class: 'lsn-step', type: 'button', disabled: true, 'aria-label': stepName(s), on: { click: function () { jumpTo(s); } } }, U.h('i'));
    });
    // The bar names the stage only: its five segments show how far along he is, and the eyebrow
    // below already counts ideas ("Idea 1 of 6"), so a second "of N" would only confuse. Screen
    // readers hear the count from each segment's label ("Step 1 of 5: Predict, current step").
    var stepLabel = U.h('span', { class: 'lsn-steps-label', 'aria-hidden': 'true' });
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
    // "This looks wrong" appears once there is a lesson to attach the note to. Its thanks shows
    // under the link (flagKept), where Dan is looking when the sheet closes.
    var flagKept = U.h('p', { class: 'lsn-flag-kept', role: 'status' });
    var foot = U.h('footer', { class: 'lsn-foot', hidden: true }, linkBtn('This looks wrong', flagSheet, 'lsn-flag-link'), flagKept);
    // The one place results are said to a screen reader (politely, as they come).
    var voice = U.h('p', { class: 'visually-hidden lsn-said', role: 'status' });
    var root = U.h('div', { class: 'lsn' }, bar, U.h('header', { class: 'lsn-head' }, eb, h1, one), notice, flow, prepSlot, foot, voice);
    ctx.view.appendChild(root);
    paintBar();
    var sayTimer = 0;
    function announce(text) {
      clearTimeout(sayTimer);
      voice.textContent = '';
      text = U.plain(String(text || '')).replace(/\s+/g, ' ').trim();
      // Set a moment later, so the same words twice in a row are still said twice.
      if (text) sayTimer = setTimeout(function () { if (alive()) voice.textContent = text; }, 80);
    }
    // Focus is lost: on the page itself, or on something removed or hidden (a button that went).
    function focusLost() {
      var a = document.activeElement;
      return !a || a === document.body || !a.isConnected || (root.contains(a) && a.offsetParent === null);
    }

    // ---- load ----
    var loaded = false;
    var slowTimer = setTimeout(function () {
      if (loaded || !alive()) return;
      U.clear(notice).appendChild(U.h('p', { class: 'muted small', role: 'status' }, 'Still waiting for this lesson. The connection seems slow; it appears as soon as it arrives.'));
      notice.hidden = false;
    }, 8000);
    U.rt.ready.then(function () {
      return Promise.all([U.store.topic.get(tid), U.store.progress.get(tid), U.store.lesson.get(tid, iid), params.again ? stillSlipping() : null]);
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
      // Learn it again only when Dan chose it and it is current: his own request still open, or
      // Today's link to an idea that is still slipping. A link that is stale (the idea was learned
      // again since, perhaps on another device) and Today's flag on its own open the lesson as it is.
      var again = requestOpen() || (!!params.again && r[3] !== false);
      if (params.again) try { history.replaceState(null, '', '#/t/' + encodeURIComponent(tid) + '/' + encodeURIComponent(iid)); } catch (e) { /* fine */ }
      if (again && U.gen && typeof U.gen.relearn === 'function') return startRelearn({ doc: doc });
      if (whole(doc)) show(doc);
      else prepare(doc);
    }).catch(function (e) { loaded = true; if (alive()) fatal(e); });

    // Is this idea still one Today offers to learn again? true / false, or null when that cannot
    // be told here (no review module, or the cards could not be read): then his tap stands.
    function stillSlipping() {
      if (!U.review || typeof U.review.slipping !== 'function') return Promise.resolve(null);
      return Promise.resolve().then(function () { return U.review.slipping(); }).then(function (list) {
        return Array.isArray(list) ? list.some(function (g) { return g && g.tid === tid && g.iid === iid; }) : null;
      }, function () { return null; });
    }

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
      // A request is only ever opened or replaced within a round (the round that begins closes
      // it), so a snapshot from before this screen's own request landed never closes it here.
      if (r.relearn) st.ip.relearn = true;
      if (r.relearn && r.relearnId) ['relearnId', 'relearnAt', 'relearnNote'].forEach(function (k) { st.ip[k] = r[k] == null ? null : r[k]; });
      if (r.againAt) st.ip.againAt = r.againAt;
      return null;
    }
    function watchProgress() {
      st.stops.push(U.store.progress.watch(tid, function (p) {
        if (!alive()) return;
        st.progress = p || { ideas: {} };
        var res = adopt((st.progress.ideas || {})[iid]);
        // Another device started this idea again with a fresh lesson: show that one. (While this
        // screen waits for a fresh lesson, its request has closed there: its own work stops.)
        if (res === 'round') restarted();
        // A newer request may be open (Rebuild on another device): this screen follows it.
        else if (st.again && !st.ready && st.ip.relearn && st.ip.relearnId && st.ip.relearnId !== st.asked) recheck();
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
      // Two parts, so a narrow screen can drop the topic name whole (50-lesson.css).
      U.append(U.clear(eb), [U.h('span', { class: 'lsn-eb-topic' }, st.topic.title || 'Topic'), U.h('span', { class: 'lsn-eb-n' }, 'Idea ' + (st.index + 1) + ' of ' + n)]);
      eb.classList.add('is-filled');
      h1.textContent = st.idea.title || (st.lesson && st.lesson.title) || 'This idea';
      one.textContent = st.idea.oneLine || '';
      paintOne();
      U.setTitle(st.idea.title || st.topic.title);
    }
    // The idea's one line often gives the answer away, so it stays hidden while Predict asks its
    // question, and shows once he has answered or skipped it (and on the preparation card).
    function paintOne() {
      var asking = st.begun && st.stage === 'predict' && !st.closed.predict;
      one.hidden = !(st.idea && st.idea.oneLine) || asking;
    }
    function setDoc(doc) { st.doc = doc; st.lesson = doc.lesson; foot.hidden = !st.lesson; }
    // The interactive that was actually built and tested for this lesson, or null: the lesson's
    // brief for one (lesson.interactive) is not one, since a build that never passed its tests
    // leaves the lesson whole without it (doc.note says why).
    function builtIt() { var it = st.doc && st.doc.interactive; return it && it.html ? it : null; }
    function sources() { return (st.lesson && Array.isArray(st.lesson.sources)) ? st.lesson.sources : []; }
    function sourceOf(n) { return sources().filter(function (s) { return Number(s.n) === Number(n); })[0] || null; }
    var fn = { footnotes: { has: function (n) { return !!sourceOf(n); }, open: function (n) { sourceSheet(sourceOf(n)); } } };
    function fnButton(n) {
      return U.h('button', { class: 'fn', type: 'button', 'aria-label': 'Source ' + n, on: { click: function () { sourceSheet(sourceOf(n)); } } }, String(n));
    }

    // ---- the whole lesson, or the preparation card until it is whole ----
    function show(doc) {
      setDoc(doc); st.ready = true;
      begin();
      prefetchNext();
    }
    function prepare(doc) {
      st.prep = makePrep();
      prepSlot.appendChild(st.prep.el);
      paintBar();
      watchLesson();
      ensure(doc);
    }
    // The lesson may be finished elsewhere (another device, or a job this page joined): open it
    // the moment the doc is whole. While relearning, the old (ready) doc is not the new lesson:
    // only the lesson written for his request counts (fresh: it carries the request's token,
    // wherever it was written).
    function watchLesson() {
      st.watching = true;
      st.stops.push(U.store.lesson.watch(tid, iid, function (d) {
        st.seen = d;
        if (!alive() || st.ready) return;
        if (st.again && !ours()) watchElsewhere(d);
        if (!whole(d) || (st.again && !fresh(d))) return;
        var gen = st.gen;
        Promise.resolve().then(function () { return settled(gen, d); }).catch(failed(gen, tryAgain));
      }));
    }
    // Only the latest request counts (a Rebuild can start while an earlier one is still running).
    function settled(gen, d) {
      if (!alive() || gen !== st.gen || st.ready || st.opening === gen) return;
      if (!whole(d)) throw { message: (d && d.error) || 'The lesson could not be written.' };
      if (!st.again) return opened(d);
      // The old lesson came back (a try elsewhere was put back after it failed, or another
      // request's lesson): it is never the new round. The fresh one, if the watch has seen it, or
      // a rewrite, once it is clear the request is still the one this screen asked for (a newer
      // one, asked on another device, is followed instead; a round begun there is shown).
      if (!fresh(d)) {
        return standing().then(function (s) {
          if (!alive() || gen !== st.gen || st.ready) return;
          if (s.state === 'moved') return restarted();
          if (s.state === 'other') moveOn(s.cur);
          return rewrite(fresh(st.seen) ? st.seen : d, true);
        });
      }
      st.opening = gen;
      return newRound().then(function (res) {
        if (st.opening === gen) st.opening = -1;
        if (!alive() || gen !== st.gen || st.ready) return;
        // A newer request (Rebuild on another device) is open now: its lesson is the one to open,
        // written there (rewrite follows it, writing nothing here).
        if (res === 'other') return rewrite(fresh(st.seen) ? st.seen : d, true);
        opened(d);
      }, function (e) { if (st.opening === gen) st.opening = -1; throw e; });
    }
    function opened(d) {
      st.again = false;
      var wasPrep = !!st.prep;
      if (st.prep) { st.prep.finish(); st.prep = null; }
      show(d);
      // Focus was on the card (its Try again, say): it carries on at the lesson's first stage.
      if (wasPrep && focusLost()) { var h = flow.querySelector('.lsn-stage .lsn-h'); if (h) land(h); }
    }
    // Leaving keeps the work going (cleanup demotes it); a failure offers Try again.
    function track(p) {
      st.pending = p;
      p.then(function () { if (st.pending === p) st.pending = null; }, function () { if (st.pending === p) st.pending = null; });
      return p;
    }
    function failed(gen, retry) {
      return function (e) { if (alive() && gen === st.gen && !st.ready && st.prep) st.prep.fail(e, retry); };
    }
    // Dan's Try again on the card: the fresh lesson he asked for, or this lesson, once more. A
    // request this screen only followed (another device's, whose try stopped there) opens the
    // screen afresh, which takes the request up as its own.
    function tryAgain() {
      st.rewrites = 0;
      if (st.again && !ours()) { U._route(); return; }
      if (st.again) rewrite(st.seen, true); else ensure(st.seen);
      if (st.prep && focusLost()) land(st.prep.el.querySelector('.lsn-prep-head'));
    }
    function ensure(doc) {
      // A doc that already has its text says so first; the job's own lines follow.
      var written = doc && doc.lesson && doc.status === 'building';
      st.prep.start(written ? 'The lesson text is written' : 'Asking Claude to write this lesson');
      var gen = st.gen;
      Promise.resolve().then(function () {
        if (!U.gen || typeof U.gen.ensureLesson !== 'function') throw { message: 'The lesson writer is not loaded in this view.' };
        // A foreground call: if this lesson was being prepared in the background, U.gen promotes
        // its queued calls (they share the lesson's gate key) so they run at once.
        return track(U.gen.ensureLesson(tid, iid, { onStatus: function (t, meta) { if (alive() && !st.ready && st.prep) st.prep.line(t, meta); } }));
      }).then(function (d) { return settled(gen, d); }).catch(failed(gen, tryAgain));
    }
    // The preparation card: what is happening now, step by step (writing, building the
    // interactive, testing it, fixing what the test found), and that Dan need not wait here.
    function makePrep() {
      var head = U.h('p', { class: 'lsn-prep-head' }, 'Getting this idea ready');
      var CALM = 'This usually takes a few minutes. You can leave this screen; it keeps going while the app is open.';
      var calm = U.h('p', { class: 'lsn-prep-calm' }, CALM);
      var lines = U.h('ol', { class: 'lsn-prep-lines' });
      var working = U.h('div', { class: 'working', 'aria-hidden': 'true' });
      var slow = U.h('p', { class: 'lsn-prep-slow', hidden: true }, 'Still going. The interactive takes longest: it tests itself before you see it, so you never get a broken one.');
      var err = U.h('div', { class: 'lsn-prep-err', hidden: true });
      var el = U.h('div', { class: 'lsn-prep', role: 'status', 'aria-live': 'polite' }, head, calm, lines, working, slow, err);
      var last = null, timer = null;
      // Lines that say the same thing ("Building your interactive…" / "Building the interactive")
      // are shown once.
      function same(a, b) {
        function n(t) { return String(t || '').toLowerCase().replace(/\b(your|the|this|a|an)\b/g, '').replace(/[.…!\s]+/g, ' ').trim(); }
        return n(a) === n(b);
      }
      // Finish a line as 'done', 'missed' or 'failed': one state only, so it never shows a tick
      // and a cross together. A finished line loses its trailing "…". 'missed': the step ended
      // without success but the work went on (a test that found problems, a repair that did not
      // pass): a quiet dash, never a tick; 'failed' is the step the whole job stopped at.
      function mark(li, state) {
        li.classList.toggle('is-done', state === 'done');
        li.classList.toggle('is-missed', state === 'missed');
        li.classList.toggle('is-failed', state === 'failed');
        var t = li.querySelector('.lsn-prep-text');
        if (t) t.textContent = t.textContent.replace(/\s*(…|\.\.\.)$/, '');
        var sr = li.querySelector('.lsn-prep-sr');
        if (sr) sr.textContent = state === 'missed' ? ' (did not work out)' : '';
      }
      // How the step before a new line ended: the build's next repair, or finishing without the
      // interactive, means it did not work out (U.interactive.build's and U.gen's own lines).
      function endOf(next) { return /^(fixing what the test found|finishing without the interactive)/i.test(next) ? 'missed' : 'done'; }
      // meta (from U.gen): failed -> said once, by fail(), never as a step; redo -> the step in
      // progress is being done again, so its own line says so instead of a new one.
      function line(text, meta) {
        meta = meta || {};
        text = String(text || '').trim();
        if (!text || meta.failed) return;
        if (meta.redo && last && !/\bis-(done|missed|failed)\b/.test(last.className)) {
          last.dataset.text = text;
          last.querySelector('.lsn-prep-text').textContent = text;
          return;
        }
        if ((last && same(last.dataset.text, text)) || same(head.textContent, text)) return;
        if (last) mark(last, endOf(text));
        last = U.h('li', { dataset: { text: text } },
          U.h('span', { class: 'lsn-prep-mark', 'aria-hidden': 'true' }, U.h('i'), U.icon('tick', 'lsn-prep-ok'), U.icon('close', 'lsn-prep-x')),
          U.h('span', { class: 'lsn-prep-text' }, text), U.h('span', { class: 'visually-hidden lsn-prep-sr' }));
        lines.appendChild(last);
      }
      return {
        el: el, line: line,
        title: function (t) { head.textContent = t; },
        // note: the calm line under the heading, when the work is not this screen's own.
        start: function (first, note) {
          err.hidden = true; slow.hidden = true; calm.hidden = false; working.hidden = false; U.clear(lines); last = null;
          calm.textContent = note || CALM;
          line(first);
          clearTimeout(timer);
          if (!note) timer = setTimeout(function () { slow.hidden = false; }, 40000);
        },
        // The step that failed gets a red cross (never a tick), and the error is said once, below.
        fail: function (e, retry) {
          clearTimeout(timer); working.hidden = true; slow.hidden = true; calm.hidden = true;
          var msg = U.errText(e);
          // The error arrived as a line of its own (a caller without meta): drop it; the step
          // before it is the one that failed, although the error line ticked it off.
          if (last && same(last.dataset.text, msg)) { var dup = last; last = dup.previousElementSibling; dup.remove(); }
          if (last) mark(last, 'failed');
          U.clear(err).appendChild(U.h('div', { class: 'notice bad' }, U.h('div', { class: 'stack-sm' },
            U.h('p', null, U.h('strong', null, 'This lesson could not be prepared. '), msg),
            U.h('div', { class: 'row' }, btn('Try again', retry, 'small'), U.h('a', { class: 'linkish', href: '#/t/' + encodeURIComponent(tid), on: { click: function () { toTopic(tid); } } }, 'Back to the topic')))));
          err.hidden = false;
        },
        finish: function () { clearTimeout(timer); el.remove(); },
        stop: function () { clearTimeout(timer); },
      };
    }
    // Once this lesson is whole, the next open idea is prepared whole in the background.
    function prefetchNext() {
      var nx = nextIdea();
      if (!nx || !U.gen || typeof U.gen.ensureLesson !== 'function') return;
      U.store.lesson.get(tid, nx.id).then(function (d) {
        if (whole(d)) return null;
        return U.gen.ensureLesson(tid, nx.id, { background: true });
      }).catch(function () { /* background work: the next lesson tries again when opened */ });
    }
    function nextIdea() {
      var ideas = (st.topic && st.topic.ideas) || [], prog = (st.progress && st.progress.ideas) || {};
      function open(i) { var p = prog[i.id] || {}; return i.id !== iid && p.stage !== 'done' && !p.known && !i.known; }
      for (var k = st.index + 1; k < ideas.length; k++) if (open(ideas[k])) return ideas[k];
      for (var j = 0; j < st.index; j++) if (open(ideas[j])) return ideas[j];
      return null;
    }

    // ---- Learn it again ----
    // A fresh lesson with a different interactive. Asking opens a request on progress (relearn:
    // true; relearnId: its token; relearnAt: when he asked; relearnNote: his "This looks wrong"
    // note) that stays open until the fresh lesson is whole: only then does the idea start its
    // new round (newRound). The rewrite stamps the doc it writes with the token (doc.request), so
    // the fresh lesson is known on any device, whatever its clock says. A rewrite that fails, or
    // that a reload cuts off, leaves the idea marked to be learned again (Today keeps offering
    // it), and opening the idea tries again, with his note, and says so. The old lesson is never
    // shown as the new round.
    // A screen writes only for the request it opened (Rebuild) or took up when it loaded (st.own).
    // When the request moves on elsewhere (a newer one, asked on another device), this screen's
    // own work stops and it follows: it waits for the lesson written there (st.asked) and opens it.
    //   opts.feedback: a new note (Rebuild);  opts.doc: the lesson doc as the screen read it
    function startRelearn(opts) {
      opts = opts || {};
      var doc = 'doc' in opts ? opts.doc : st.seen;
      var open = requestOpen(), ask = null;
      if (opts.feedback || !open) ask = { relearn: true, relearnId: U.id('rq'), relearnAt: U.now(), relearnNote: opts.feedback || null };
      else if (!st.ip.relearnId) ask = { relearnId: U.id('rq') };   // a request opened before requests had tokens
      if (ask) { Object.assign(st.ip, ask); st.askSaved = saveIdea(ask); }
      // The old lesson goes from the screen at once; the new one appears only when it is whole.
      st.again = true; st.gen++; st.asked = st.own = st.ip.relearnId; st.askRound = round(); st.rewrites = 0;
      st.feedback = st.ip.relearnNote || null; st.replay = null; st.guess = null;
      st.ready = false; st.begun = false; st.lesson = null; st.doc = null;
      foot.hidden = true;
      U.clear(flagKept);
      destroyLive();
      stopNext();
      U.clear(flow); st.sections = {}; st.closed = {}; st.stage = 'predict';
      if (st.prep) st.prep.finish();
      st.prep = makePrep();
      st.prep.title('Writing a fresh lesson');
      prepSlot.appendChild(st.prep.el);
      paintBar();
      if (!st.watching) watchLesson();
      try { window.scrollTo(0, 0); } catch (e) { /* fine */ }
      // Rebuild was pressed in a sheet over the lesson that has just gone: carry on at the title.
      if (focusLost()) land(h1);
      rewrite(doc, open && !opts.feedback);
    }
    // Written for this request (the rewrite stamps its token on the doc): the fresh lesson.
    function fresh(doc) { return !!doc && !!st.asked && doc.request === st.asked; }
    // The request this screen waits for is its own (so it may write for it), not one it follows.
    function ours() { return !!st.asked && st.asked === st.own; }
    // Work on the fresh lesson that has begun is finished, never begun again: whole, it opens now
    // (its rewrite finished while he was away); writing or building, or cut off part-way, U.gen
    // joins its job, waits for the device on it, or picks it up (its claim carries his note, the
    // briefs to avoid and the token). Anything else (the old lesson, put back after a failed try)
    // is rewritten, at most MAX_REWRITES times before Dan says so again. retry: an earlier try
    // did not finish, and the card says so. A request this screen follows is never written here.
    function rewrite(doc, retry) {
      var gen = st.gen, job;
      if (fresh(doc) && whole(doc)) return settled(gen, doc);
      if (!ours()) return follow();
      if (fresh(doc) && (doc.status === 'writing' || doc.status === 'building')) {
        st.prep.start(doc.status === 'building' && doc.lesson ? 'The fresh lesson\'s text is written' : 'Carrying on with the fresh lesson you asked for');
        job = function (o) { return U.gen.ensureLesson(tid, iid, o); };
      } else {
        if (st.rewrites >= MAX_REWRITES) {
          // Each lesson that came back was not the one asked for: another device is rewriting it
          // too, or its request has moved on. Never a loop of rewrites: Dan decides.
          st.prep.start('Writing the fresh lesson you asked for');
          st.prep.fail({ message: 'It kept changing while the fresh one was being written, perhaps on your other device. Try again in a moment.' }, tryAgain);
          return;
        }
        st.rewrites++;
        st.prep.start(retry ? 'Trying again for the fresh lesson you asked for' + (st.feedback ? ', with your note' : '')
          : 'Asking Claude for a new way into this idea, with a different interactive');
        job = function (o) { o.request = st.asked; if (st.feedback) o.feedback = st.feedback; return U.gen.relearn(tid, iid, o); };
      }
      // This screen's own work, stopped if the request moves on (stopOwn).
      var ctrl = st.ctrl = typeof AbortController === 'function' ? new AbortController() : null;
      Promise.resolve().then(function () {
        return track(job({ signal: ctrl ? ctrl.signal : undefined, onStatus: function (t, meta) { if (alive() && gen === st.gen && !st.ready && st.prep) st.prep.line(t, meta); } }));
      }).then(function (d) { return settled(gen, d); }).catch(failed(gen, tryAgain));
    }
    // This screen's own work for a request that has moved on stops (a rewrite still waiting never
    // starts, one running is cancelled and puts the doc back as U.gen's rules say), so it writes
    // nothing more for it.
    function stopOwn() {
      var c = st.ctrl;
      st.ctrl = null;
      if (!c) return;
      c.abort();
      if (st.pending && U.gen && typeof U.gen.demote === 'function') U.gen.demote(tid, iid, { signal: c.signal });
    }
    // A newer request is open (Rebuild on another device, its note with it): it is the one this
    // screen now waits for. It stays the other device's to write.
    function moveOn(cur) {
      adopt(cur);
      st.asked = cur.relearnId; st.feedback = cur.relearnNote || null; st.rewrites = 0;
    }
    // Following another device's request: this screen's own work stops, the card says where the
    // lesson is being written, and the watch opens it when it is whole (watchElsewhere says if
    // the try there stops). Leaving and coming back, or Try again, takes the request up here.
    function follow() {
      stopOwn();
      var gen = ++st.gen;
      st.saw = false;
      st.prep.start('Your other device asked for a fresh lesson, so it is being written there',
        'It opens here as soon as it is ready. You can leave this screen.');
      var d = st.seen;
      if (fresh(d) && whole(d)) return settled(gen, d);
      if (fresh(d)) watchElsewhere(d);
    }
    function watchElsewhere(d) {
      if (!st.prep) return;
      if (fresh(d) && d.status === 'failed') { st.saw = false; st.prep.fail({ message: d.error || 'The fresh lesson could not be written on your other device.' }, tryAgain); }
      else if (fresh(d) && !whole(d)) st.saw = true;
      // (A doc being written for another request is a newer one: the progress watch says so.)
      else if (!fresh(d) && st.saw && !(d && (d.status === 'writing' || d.status === 'building'))) { st.saw = false; st.prep.fail({ message: 'Your other device stopped before the fresh lesson was finished.' }, tryAgain); }
    }
    // Where his request stands, read again from the db (once this screen's own request has
    // landed): 'open' while it is still the one this screen waits for, in the round it was asked
    // in; 'other' when a newer request is open (a Rebuild on another device); 'moved' when the
    // round has begun since (on another device). -> {state, cur}
    function standing() {
      var prev = st.askRound, want = st.asked;
      return Promise.resolve(st.askSaved).then(function () { return U.store.progress.get(tid); }).then(function (p) {
        return ((p && p.ideas) || {})[iid] || {};
      }, function () { return st.ip; }).then(function (cur) {
        if ((Number(cur.round) || 0) !== prev || round() !== prev) return { state: 'moved', cur: cur };
        // (A request with no token yet there is this screen's own, still on its way.)
        if (cur.relearn && cur.relearnId && cur.relearnId !== want) return { state: 'other', cur: cur };
        return { state: 'open', cur: cur };
      });
    }
    // The progress watch saw another request: is it a newer one (asked on another device), or a
    // snapshot from before this screen's own request landed?
    function recheck() {
      var gen = st.gen;
      standing().then(function (s) {
        if (!alive() || gen !== st.gen || st.ready || !st.again) return;
        if (s.state === 'moved') return restarted();
        if (s.state !== 'other') return;
        moveOn(s.cur);
        return follow();
      }).catch(failed(gen, tryAgain));
    }
    // The idea began a new round on another device, with a fresh lesson: this screen's own work
    // for it stops, and the screen opens afresh on that round.
    function restarted() {
      stopOwn();
      U.toast('This idea was restarted with a fresh lesson on another device.');
      U._route();
    }
    // The fresh lesson is whole and about to open: the idea starts its new round (stage back to
    // Predict, guess and check results cleared, the old round kept under past) and the request
    // is closed. Read, then written: only while this request is still the open one in the round
    // it was asked in. Resolves 'started'; 'moved' when another device opened the fresh lesson
    // first and began the round there (that round is the one on screen now); 'other' when a newer
    // request is open (a Rebuild on another device), which this screen now follows instead.
    // Two devices that read at the same moment both write; the store keeps the first start of a
    // round (20-store.js).
    function newRound() {
      var prev = st.askRound;
      return standing().then(function (s) {
        var cur = s.cur;
        if (s.state === 'moved') { adopt(cur); return 'moved'; }
        if (s.state === 'other') { moveOn(cur); return 'other'; }
        var now = U.now(), past = {}, was = Object.assign({}, st.ip, cur);
        past[prev] = { stage: was.stage || null, predict: was.predict || null, checks: was.checks || null, doneAt: was.doneAt || null, at: now };
        var fields = { round: prev + 1, stage: 'predict', startedAt: now, againAt: now, relearn: false, relearnId: null, relearnAt: null, relearnNote: null, predict: null, checks: null, doneAt: null, past: past };
        st.ip = normalise(Object.assign({}, st.ip, U.clone(fields)));
        saveIdea(fields);
        return 'started';
      });
    }

    // ---- stage machinery ----
    var RENDER = { predict: renderPredict, play: renderPlay, explain: renderExplain, say: renderSay, checks: renderChecks };

    function begin() {
      st.begun = true;
      // The idea counts as started only once its whole lesson is on screen.
      if (!st.replay) {
        var first = {};
        if (!st.ip.startedAt) first.startedAt = st.ip.startedAt = U.now();
        if (!st.ip.stage) first.stage = st.ip.stage = 'predict';
        saveIdea(first);
      }
      destroyLive();
      stopNext();
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
    // The summary on a finished stage's row: about two lines on a phone (the row wraps, 50-lesson.css).
    function summaryOf(stage) {
      var l = st.lesson || {};
      if (stage === 'predict') {
        var g = guessOf(), a = g && g.answer;
        return a != null && a !== '' ? 'You guessed: ' + clip(a, 52) : 'You skipped the guess';
      }
      if (stage === 'play') {
        var it = builtIt();
        return it ? clip(it.title || (l.interactive && l.interactive.title) || 'The interactive', 70) : 'No interactive for this idea';
      }
      if (stage === 'explain') return clip(l.explain && l.explain.text, 64);
      if (stage === 'say') {
        var says = attemptsNow(), last = says[says.length - 1];
        return last ? '“' + clip(last.text, 56) + '”' : 'Not answered';
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
      // Before the lesson is on screen no step is current (and the label says it is being prepared).
      var ci = st.begun ? STAGES.indexOf(st.stage) : -1, all = st.begun && st.stage === 'done';
      stepBtns.forEach(function (b, i) {
        var state = all ? 'done' : ci < 0 ? 'later' : i < ci ? 'done' : i === ci ? 'now' : 'later';
        b.className = 'lsn-step is-' + state + (all ? ' is-all' : '');
        b.disabled = !st.sections[STEPS[i]];
        b.setAttribute('aria-label', stepName(STEPS[i]) + (state === 'done' ? ', done' : state === 'now' ? ', current step' : ''));
        if (state === 'now') b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      });
      stepLabel.textContent = all ? 'Idea learned' : st.begun ? LABEL[st.stage] : st.prep ? 'Getting ready' : '';
      bar.classList.toggle('is-all', all);
      paintOne();
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
    function saveIdea(fields, r) {
      if (st.gone) return Promise.resolve(null);
      fields.round = r != null ? r : round();
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
      // Collapsed (a resumed lesson): "What happens" waits until Play is finished, as it does live.
      if (!live) { box.appendChild(guessAndReveal(!st.closed.play)); return; }
      var playable = !!builtIt();
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
    // noAnswer: his guess only, without "What happens" (Play is not finished yet).
    // titled false: the reveal goes without its "What happens" eyebrow (Play is headed so already).
    function guessAndReveal(noAnswer, titled) {
      var p = (st.lesson && st.lesson.predict) || {};
      var gr = guessOf(), g = gr && gr.answer;
      var said = g != null && g !== '';
      // When the lesson marks which option was right, a right guess is acknowledged.
      var right = said && typeof p.answer === 'number' && Array.isArray(p.options) && String(p.options[p.answer]) === String(g);
      return U.h('div', { class: 'lsn-reveal' },
        U.h('div', { class: 'lsn-reveal-guess' + (right ? ' is-right' : '') }, eyebrow('Your guess'),
          said ? U.inline(U.h('p'), String(g)) : U.h('p', { class: 'muted' }, 'You skipped the guess.'),
          right ? U.h('p', { class: 'lsn-called' }, U.icon('tick'), 'You called it.') : null),
        p.reveal && !noAnswer ? U.h('div', { class: 'lsn-reveal-answer callout remember' }, titled === false ? null : eyebrow('What happens'), richBox(p.reveal, 'lsn-reveal-text', fn)) : null);
    }

    // ---- 2. Play ----
    function renderPlay(box, live) {
      // The lesson is whole by now: its interactive is built and tested, or there is none (none
      // planned, or one that never passed its tests). What was built decides what Play shows;
      // without one, nothing here is named after an interactive that is not there.
      var spec = (st.lesson && st.lesson.interactive) || null;
      var built = builtIt(), has = !!built, played = !live;
      var title = has ? (built.title || (spec && spec.title) || 'What happens') : 'What happens';
      U.append(box, [live ? eyebrow('Play') : null, heading(title)]);
      var brief = has && spec && spec.brief ? U.h('p', { class: 'lsn-lede' }, friendlyBrief(spec.brief)) : null;
      var stage = U.h('div', { class: 'lsn-play' });
      var notes = U.h('div', { class: 'lsn-discs' });
      var after = U.h('div', { class: 'lsn-after' });
      U.append(box, [brief, stage, notes, after]);
      var m = null;
      if (has) m = mountPanel(stage, built, title);
      else stage.appendChild(noInteractive(spec));
      if (spec && has) drawNotes(notes, spec, m);
      function drawAfter() {
        U.clear(after);
        var acting = live && !st.closed.play;
        if (played || !has) {
          // Without an interactive, Play is headed "What happens": the answer is not titled again.
          after.appendChild(guessAndReveal(false, has));
          if (acting) after.appendChild(go(btn('Continue', function () { complete('play'); }, 'lsn-main')));
        } else if (acting) {
          after.appendChild(go(btn('I\'ve had a play', function () {
            played = true;
            drawAfter();
            // The button has gone: focus goes to what appeared (the answer), which is also said.
            var reveal = (st.lesson && st.lesson.predict && st.lesson.predict.reveal) || '';
            land(after.querySelector('.lsn-reveal-answer') || after.querySelector('.lsn-reveal-guess'));
            if (reveal) announce('What happens: ' + reveal);
            bring(after, 'nearest');
          }, 'lsn-main')));
        }
      }
      drawAfter();
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
    function named(c) { return !!c && Array.isArray(c.options) && c.options.length > 0; }
    // The lesson's own name for a named control's value from the frame, or null. raw: the index
    // the lesson uses, or an option's name; else (info: the frame's report of that control, its
    // option values and labels) the option whose value it is, by its label when that is one of
    // the lesson's names. Anything else is null, and the starting value stays: a frame's own
    // labels, or the place of an option in its list, may not be the lesson's.
    function optionName(c, raw, info) {
      var names = c.options.map(String);
      if (typeof raw === 'number' && Number.isInteger(raw) && raw >= 0 && raw < names.length) return names[raw];
      if (typeof raw === 'string' && names.indexOf(raw) >= 0) return raw;
      if (raw == null || !info || !Array.isArray(info.options)) return null;
      var at = -1;
      info.options.forEach(function (v, i) { if (at < 0 && (v === raw || String(v) === String(raw))) at = i; });
      if (at < 0) return null;
      var label = Array.isArray(info.labels) ? String(info.labels[at]) : null;
      return label != null && names.indexOf(label) >= 0 ? label : null;
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
            var choices = named(c) ? c.options.map(String) : null;
            return U.h('div', { class: 'lsn-num' },
              U.h('dt', null, String(n.label)),
              U.h('dd', null, U.h('span', { class: 'lsn-num-val' }, n.kind === 'assumed' && !/^for example/i.test(val) ? 'for example ' + val : val), now,
                NUMBER_KIND[n.kind] ? U.h('span', { class: 'lsn-num-kind' }, NUMBER_KIND[n.kind] + (n.kind === 'computed' && mount ? ', from its starting values' : '')) : null,
                n.source != null && sourceOf(n.source) ? fnButton(n.source) : null),
              choices ? U.h('dd', { class: 'lsn-num-options' }, 'Choices: ' + choices.join(' · ')) : null);
          })) : null]);
        if (live.length && mount && typeof mount.get === 'function') {
          d.addEventListener('toggle', function () {
            if (!d.open) return;
            function ask(fn) { return Promise.race([Promise.resolve().then(fn), U.sleep(1500).then(function () { return null; })]).catch(function () { return null; }); }
            ask(function () { return mount.get(); }).then(function (s) {
              var params = (s && s.params) || {};
              // Values from the frame are only ever shown in the lesson's own words: a number, or
              // one of the lesson's option names. Any other value of a named control (the kit
              // gives the chosen option's value, which a body may set to anything) is looked up
              // among the options the interactive reports, and shown as the lesson's option there.
              var odd = live.some(function (x) { return named(x.c) && optionName(x.c, params[x.c.id], null) == null && params[x.c.id] != null; });
              return (odd && typeof mount.inputs === 'function' ? ask(function () { return mount.inputs(); }) : Promise.resolve(null)).then(function (inp) {
                var info = {};
                ((inp && inp.inputs) || []).forEach(function (x) { if (x && x.id) info[x.id] = x; });
                live.forEach(function (x) {
                  var raw = params[x.c.id], text = null;
                  if (named(x.c)) text = optionName(x.c, raw, info[x.c.id]);
                  else if (typeof raw === 'number' && isFinite(raw)) text = (Math.round(raw * 1000) / 1000).toLocaleString() + (x.c.unit ? ' ' + x.c.unit : '');
                  // A value that cannot be said in the lesson's words: the starting value stands alone.
                  if (text == null) { x.el.hidden = true; return; }
                  x.el.textContent = 'now ' + text;
                  x.el.hidden = false;
                });
              });
            }).catch(function () { /* the interactive did not answer: the starting values stay */ });
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

      // The screen this answer was given on: once a new round has begun (Rebuild, or Learn it
      // again on another device) the old answer is filed under its own round and never shown as
      // an answer to the new lesson's question.
      function here(r0) { return alive() && r0 === round() && box.isConnected; }
      function submit() {
        var text = ta.value.trim();
        if (!text || busy) return;
        busy = true;
        var r0 = round();
        U.clear(slot);
        var no = attempts.length + 1;
        var view = attemptView(text, no);
        var wait = U.h('div', { class: 'lsn-grading' }, U.h('p', null, 'Reading your answer…'), U.h('div', { class: 'working', 'aria-hidden': 'true' }));
        view.appendChild(wait);
        log.appendChild(view);
        compose.hidden = true;
        // The button has gone with the box: focus waits on the answer being read.
        land(wait.firstChild);
        announce('Reading your answer…');
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
          record(rec, r0);
          if (!here(r0)) return;
          wait.remove();
          var graded = gradeView(rec, no, true);
          view.appendChild(graded);
          next();
          land(graded.querySelector('.lsn-verdict'));
          announce((VERDICT[rec.verdict] || 'Checked') + '. ' + rec.nailed);
          bring(view.lastChild, 'nearest');
        }).catch(function (e) {
          busy = false;
          if (!here(r0)) return;
          view.remove();
          compose.hidden = false;
          var again = btn('Try again', submit, 'small');
          slot.appendChild(U.h('div', { class: 'notice bad' }, U.h('div', { class: 'stack-sm' },
            U.h('p', null, U.h('strong', null, 'Your answer could not be checked just now. '), U.errText(e)),
            U.h('div', { class: 'row' }, again,
              linkBtn('Save it without checking', function () {
                U.clear(slot);
                var rec = { text: text, at: U.now(), verdict: null, met: [] };
                record(rec, r0);
                if (!here(r0)) return;
                log.appendChild(attemptView(text, attempts.length));
                compose.hidden = true;
                reveal(true);
              })))));
          land(again);
          announce('Your answer could not be checked just now. ' + U.errText(e));
        });
      }
      // Each attempt is its own entry (keyed), so answers given on two devices are both kept. r0:
      // the round it was given in; saved under it whatever round has begun since (the Book keeps
      // his words), but only an answer in the round on screen counts towards it.
      function record(rec, r0) {
        rec.round = r0;
        var k = U.key(), patch = {};
        if (r0 === round()) {
          attempts.push(rec);
          st.ip.say[k] = rec;
        }
        patch[k] = rec;
        delete drafts[key];
        saveIdea({ say: patch }, r0);
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
            linkBtn('Show me a model answer', function () { reveal(true); })));
        } else reveal();
      }
      // tapped: Dan asked for it (the link he pressed has gone): focus goes to the model answer,
      // or to Continue when there is none.
      function reveal(tapped) {
        var last = attempts[attempts.length - 1];
        U.clear(after);
        if (modelOf(last)) after.appendChild(modelAnswer(last, !last || last.verdict !== 'got-it'));
        if (!st.closed.say) after.appendChild(go(btn('Continue', function () { complete('say'); }, 'lsn-main')));
        if (!tapped) return;
        var model = after.querySelector('.lsn-model');
        land(model || after.querySelector('.btn'));
        if (model) announce('Here is a model answer.');
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
      var hasIt = !!builtIt();
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
        // The next question: focus goes to it (bring), and its number is said.
        if (scroll) { bring(host); announce('Question ' + (k + 1) + ' of ' + all.length + '.'); }
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
        // Review cards come from the first time through (or a fresh round of Learn it again). The
        // round is recorded with them, so cards lost with a closed app are made at the next open.
        if (first && U.review && typeof U.review.addFromLesson === 'function' && !st.gone) {
          Promise.resolve().then(function () { return U.review.addFromLesson(tid, iid, st.lesson, outcome(), { round: round() }); })
            .catch(function (e) { if (!(e && e.queued)) U.toast('Your review cards could not be saved: ' + U.errText(e), { kind: 'bad' }); });
        }
        // The course's dossier binds this lesson as a chapter (75-dossier.js; never rejects).
        if (first && U.dossier && !st.gone) U.dossier.bind(tid, iid, { doc: st.doc, doneAt: st.ip.doneAt });
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
        // Two short centred lines (how it went; where his work went), not one long ragged paragraph.
        U.h('p', { class: 'lsn-done-text' },
          all.length ? U.h('span', { class: 'lsn-done-score' }, right === all.length ? (all.length === 1 ? 'You got the check right.' : 'All ' + all.length + ' checks right.') : right + ' of ' + all.length + ' checks right.') : null,
          U.h('span', null, live && st.replay ? 'Your first answers stay as they were; this run is noted separately.'
            : says.length ? 'Your words are in your Book, and your answers will come back in review.' : 'Your answers will come back in review.')),
        nx
          ? U.h('div', { class: 'lsn-next' }, eyebrow('Where next?'), U.h('h3', null, String(nx.title || 'The next idea')),
            nx.oneLine ? U.h('p', { class: 'muted' }, String(nx.oneLine)) : null,
            nextStatus(nx),
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

    // "Idea 2 is being prepared…" / "Idea 2 is ready.": the next lesson's doc as it changes, and
    // this page's own work on it. Nothing is said until the doc has been read (no flicker), and
    // nothing when no lesson exists yet: opening it prepares it.
    function stopNext() { if (st.nextStop) { st.nextStop(); st.nextStop = null; } }
    function nextStatus(nx) {
      stopNext();
      var el = U.h('p', { class: 'lsn-next-status', role: 'status' });
      var n = 'Idea ' + ((st.topic.ideas || []).indexOf(nx) + 1), doc, read = false, shown = null;
      function paint() {
        if (!read || !alive()) return;
        var s = U.store.lesson.state(doc, liveOf(tid, nx.id));
        var now = s === 'ready' || s === 'preparing' ? s : null;
        if (now === shown) return;
        shown = now;
        U.clear(el);
        if (now === 'preparing') U.append(el, [U.h('span', { class: 'lsn-prep-mark', 'aria-hidden': 'true' }, U.h('i')), n + ' is being prepared…']);
        else if (now === 'ready') U.append(el, [U.icon('tick'), n + ' is ready.']);
      }
      var offs = [
        U.store.lesson.watch(tid, nx.id, function (d) { doc = d; read = true; paint(); }, function () { /* say nothing */ }),
        U.on('gen', function (g) { if (g && g.kind === 'lesson' && g.tid === tid && g.iid === nx.id) paint(); }),
      ];
      // A busy doc whose job went quiet stops counting as being prepared after a while.
      var timer = setInterval(paint, 30000);
      st.nextStop = function () { clearInterval(timer); offs.forEach(function (f) { try { f(); } catch (e) { /* fine */ } }); };
      return el;
    }

    // ---- Ask Claude, flagging, errors ----
    // The interactive Dan is using now: during the checks, a target question's own copy (its
    // card exposes its mount) while that question is the one on screen; else Play's.
    function mountInUse() {
      if (st.begun && st.stage === 'checks') {
        var card = st.cards[st.cards.length - 1];
        if (card && card.mount && typeof card.mount.get === 'function') return card.mount;
      }
      return st.liveMount;
    }
    function openTutor() {
      if (!U.tutor || typeof U.tutor.open !== 'function') { U.toast('Ask Claude is not available in this view.'); return; }
      var m = mountInUse();
      U.tutor.open({
        tid: tid, iid: iid, topic: st.topic, idea: st.idea, lesson: st.lesson, lessonDoc: st.doc, stage: st.begun ? st.stage : null,
        getState: m && typeof m.get === 'function' ? function () { return m.get(); } : null,
      });
    }
    // "This looks wrong": the note is kept with the lesson (newest 30), and Dan can have Claude
    // rebuild the lesson with the note in mind (a new round, like Learn it again). The save is
    // quiet in the store: this sheet says what went wrong, once, and keeps his words.
    function saveFlag(note) {
      return U.store.lesson.get(tid, iid).then(function (d) {
        if (!d) throw { message: 'There is no lesson saved yet to attach it to.' };
        var list = U.entries(d.flags), patch = { flags: Array.isArray(d.flags) ? U.keyed(d.flags) : {} };
        patch.flags[U.key()] = { note: note.slice(0, 1000), at: U.now(), stage: st.stage };
        list.slice(0, Math.max(0, list.length - 29)).forEach(function (e) { patch.flags[e.key] = null; });
        return U.store.lesson.update(tid, iid, patch, { quiet: true });
      });
    }
    function flagSheet() {
      if (!st.lesson) return;
      var canRebuild = !!(U.gen && typeof U.gen.relearn === 'function') && !st.gone;
      var ta = U.h('textarea', { class: 'textarea', rows: 3, maxlength: 1000, 'aria-label': 'What looks wrong', placeholder: 'For example: the slider makes the swing faster, but the text says slower' });
      var problem = U.h('div', { class: 'lsn-flag-err', role: 'alert' });
      var saving = false, open = true;
      // The sheet stays open until the note is saved; if it is not, it says why (once, here) and
      // keeps his words for another go. A rebuild starts only once the note is safe.
      function send(rebuild) {
        return function (api) {
          var note = ta.value.trim();
          if (!note) { ta.focus(); return; }
          if (saving) return;
          saving = true;
          U.clear(problem);
          var buttons = Array.prototype.slice.call(api.el.querySelectorAll('.sheet-actions .btn'));
          buttons.forEach(function (b) { b.disabled = true; });
          ta.readOnly = true;
          saveFlag(note).then(function () {
            saving = false;
            if (open) api.close();
            // The thanks goes under the link, not in a toast: a toast would sit over the next
            // stage for seconds and take its taps.
            if (!alive()) return;
            if (rebuild) startRelearn({ feedback: note });
            else U.append(U.clear(flagKept), [U.icon('tick'), 'Thanks. Your note is kept with this lesson.']);
          }, function (e) {
            saving = false;
            buttons.forEach(function (b) { b.disabled = false; });
            ta.readOnly = false;
            var why = U.errText(e);
            if (open) { U.clear(problem).appendChild(U.h('p', { class: 'notice bad' }, U.h('span', null, U.h('strong', null, 'Your note is not saved yet. '), why))); ta.focus(); }
            else U.toast('Your note was not saved. ' + why, { kind: 'bad' });
          });
        };
      }
      U.sheet({
        title: 'What looks wrong?',
        onClose: function () { open = false; },
        body: U.h('div', { class: 'stack-sm' },
          U.h('p', { class: 'muted' }, 'Say what seems off and where. Your note is kept with this lesson.' +
            (canRebuild ? ' You can also have Claude rebuild the lesson with your note in mind: it writes a new version of this idea and starts it from the beginning.' : '')),
          ta, problem),
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
      // Still being prepared: it carries on as background work (it yields to whatever Dan opens
      // next) while the app is open, so the lesson is whole when he comes back. Never cancelled.
      if (st.pending && U.gen && typeof U.gen.demote === 'function') U.gen.demote(tid, iid, {});
      clearTimeout(slowTimer);
      stopNext();
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
