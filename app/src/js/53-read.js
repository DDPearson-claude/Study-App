// Read-through (#/t/:tid/:iid/read): a ready-made steps lesson taken as a read-through instead of
// a quiz (Dan, 20 Oct: "two options: quiz me through the read through, or just a read through
// using the same material"). The material is the lesson's still guide (topics/{tid}/guide/{iid},
// written by tools/course/guide.mjs and drawn by the dossier as its chapter): each demonstration's
// sentence with its finished picture, each puzzle as a worked example with its answer and why, and
// a refresher lesson's Keep this card. The guide is read only when the read-through opens (the
// course page offers it for every built lesson of a ready-made course, never reading guides to
// decide). Shown in the lesson's reading column, nothing hidden and
// nothing to answer. "Finished reading" records the idea as read (readRound, as any read lesson:
// no review cards), and readThrough, so the course page can tell a lesson read through from one
// quizzed through (V.readThrough in 70-learn.js). Only quizzing through it puts its puzzles in the
// box (60-today.js, puzzleRound): reading it through makes none. A lesson without a guide has no read-through:
// its address opens the lesson as it is.
//
//   U.readThrough.guide(tid, iid) -> Promise<guide | null>   read once per page load, then cached
//   U.readThrough.known(tid, iid) -> true | false | undefined (not read yet)
//   U.readThrough.parts(guide) -> {pages: [show | example], summary: summary page | null}   pure
//   U.readThrough.pic(svg) -> data: URL of an SVG image, or null for anything that is not one
//   U.readThrough.still(container, html, style, {w, h}) -> {el, frame, destroy()} | null   a step kept
//       as still HTML (a guide page's html and h, its guide's style and stillW): a sandboxed frame
//       that runs no script (sandbox=""), never the app's page, in the light palette, laid out at the
//       build's width and scaled to the column like a picture
//   U.readThrough.stillDoc(html, style) -> the still's whole document | null   pure
// Contract: docs/ARCHITECTURE.md sections 4 (progress), 9 and 10.
(function () {
  'use strict';

  function isObj(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }
  function str(v) { return typeof v === 'string' ? v : v == null ? '' : String(v); }

  // ---------- pure parts ----------
  // The guide's pages in reading order, the summary card apart (the Book opens a chapter on it;
  // the read-through ends with it, where the lesson keeps it).
  function parts(g) {
    var list = isObj(g) && Array.isArray(g.pages) ? g.pages.filter(isObj) : [];
    var summary = list.filter(function (p) { return p.kind === 'summary' && str(p.title); })[0] || null;
    var pages = list.filter(function (p) { return (p.kind === 'show' && (str(p.text) || str(p.html))) || (p.kind === 'example' && str(p.task)); });
    return { pages: pages, summary: summary };
  }
  // Only a string that is an SVG becomes a picture, as a plain image (an <img> runs no script).
  function pic(svg) { return typeof svg === 'string' && /^<svg[\s>]/.test(svg) ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) : null; }
  // An example's answer as it reads: with its unit when the guide gives one apart ('23.08' + 'A').
  function answerOf(p) {
    var a = isObj(p) ? str(p.answer).trim() : '', u = isObj(p) ? str(p.unit).trim() : '';
    if (!a || !u) return a;
    return a.slice(-u.length) === u ? a : a + ' ' + u;
  }
  // A choice example's options, in screen order, when the answer is one of them; else none.
  function choicesOf(p) {
    var o = isObj(p) && p.input === 'pick' && Array.isArray(p.options) ? p.options.map(str).filter(Boolean) : [];
    return o.length >= 2 && o.indexOf(str(p.answer)) >= 0 ? o : [];
  }
  function usable(g) { var p = parts(g); return p.pages.length > 0 || !!p.summary; }

  // ---------- the guide, read once per page load ----------
  var cache = {}, seen = {};
  function guide(tid, iid) {
    var k = tid + '/' + iid;
    if (!cache[k]) {
      cache[k] = Promise.resolve().then(function () { return U.store && U.store.guide ? U.store.guide.get(tid, iid) : null; }).then(function (g) {
        seen[k] = usable(g);
        return seen[k] ? g : null;
      }, function () { delete cache[k]; return null; });   // a failed read is tried again next time
    }
    return cache[k];
  }
  function known(tid, iid) { var k = tid + '/' + iid; return k in seen ? seen[k] : undefined; }
  // A step kept as still HTML (tools/course/guide.mjs): the lesson's own markup and styles, shown
  // as it looked finished. Model-written, so it is only ever drawn inside a sandboxed frame, never
  // in the app's page. It is a still, so the frame runs no script at all (sandbox=""): nothing in it
  // waits for a message, a timer or an animation frame before it paints (Dan, 20 Oct: the stills
  // came out blank). Markup that could load, navigate or submit anything is refused outright.
  var UNSAFE = /<\s*(script|iframe|frame|object|embed|form|meta|link|base|portal)\b|\son[a-z]+\s*=|javascript:/i;
  var STILL_CSS = '.k-after-move{visibility:visible!important}*,*::before,*::after{animation:none!important;transition:none!important}' +
    'html,body{overflow:hidden}body{padding:10px 12px 14px}';
  function stillHtml(html, style) {
    if (typeof html !== 'string' || !html.trim() || UNSAFE.test(html)) return null;
    var css = STILL_CSS + (typeof style === 'string' ? style : '');
    return '<style>' + css.replace(/<\//g, '<\\/') + '</style>' + html;
  }
  // The whole document of a still: the kit's styles in Dan's light palette (kit.css's own defaults:
  // no kit script runs to set a theme), the lesson's styles, the step. A light card in both themes,
  // as the SVG pictures are on their white well. null for anything stillHtml refuses.
  function stillDoc(html, style) {
    var body = stillHtml(html, style);
    if (!body) return null;
    var csp = "default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; form-action 'none'";
    return '<!doctype html><html lang="en" data-theme="light"><head><meta http-equiv="Content-Security-Policy" content="' + csp + '">' +
      '<meta charset="utf-8"><style>' + String(U.KIT_CSS || '').replace(/<\//g, '<\\/') + '</style></head><body>' + body + '</body></html>';
  }
  // still(container, html, style, size) -> {el, frame, destroy()} | null. size {w, h}: the width the
  // build laid the step out at and its height there (guide.stillW, page.h). The frame keeps that
  // layout and is scaled to the column like a picture (at most 1.25 times, centred beyond that), so
  // its height is known before it paints. A guide made before 20 Oct (no size) falls back to the
  // kit frame that measures itself (U.sandbox.mount).
  var MAX_SCALE = 1.25;
  function still(container, html, style, size) {
    var w = size && Number(size.w), h = size && Number(size.h);
    if (!(w > 0 && h > 0)) return liveStill(container, html, style);
    var doc = stillDoc(html, style);
    if (!doc) return null;
    var frame = U.h('iframe', { class: 'rd-still-frame', sandbox: '', srcdoc: doc, title: 'A step of the lesson, as it looks', referrerpolicy: 'no-referrer',
      scrolling: 'no', tabindex: '-1', 'aria-hidden': 'true', style: { width: w + 'px', height: h + 'px' } });
    var box = U.h('div', { class: 'rd-still-box', style: { maxWidth: Math.round(w * MAX_SCALE) + 'px', aspectRatio: w + ' / ' + h } }, frame);
    container.appendChild(box);
    function fit() { var cw = box.clientWidth; if (cw > 0) frame.style.transform = 'scale(' + (cw / w).toFixed(4) + ')'; }
    fit();
    var ro = window.ResizeObserver ? new ResizeObserver(fit) : null;
    if (ro) ro.observe(box); else window.addEventListener('resize', fit);
    return { el: box, frame: frame, destroy: function () { if (ro) ro.disconnect(); else window.removeEventListener('resize', fit); box.remove(); } };
  }
  function liveStill(container, html, style) {
    var body = stillHtml(html, style);
    if (!body || !U.sandbox || typeof U.sandbox.mount !== 'function') return null;
    try { return U.sandbox.mount(container, { html: body, title: 'A step of the lesson, as it looks', minHeight: 120, loading: false, theme: function () { return U.sandbox.theme({ light: true }); } }); }
    catch (e) { console.warn('still step', e); return null; }
  }
  U.readThrough = { guide: guide, known: known, parts: parts, pic: pic, still: still, stillHtml: stillHtml, stillDoc: stillDoc, answerOf: answerOf, choicesOf: choicesOf };
  if (!U.routes) return;

  // ---------- the screen ----------
  function readScreen(params, ctx) {
    var tid = params.tid, iid = params.iid, V = U.views || {};
    var quizHref = '#/t/' + encodeURIComponent(tid) + '/' + encodeURIComponent(iid), topicHref = '#/t/' + encodeURIComponent(tid);
    var root = U.h('div', { class: 'lsn rd' });
    ctx.view.appendChild(root);
    var back = U.lesson && U.lesson.backLink ? U.lesson.backLink(tid) : U.h('a', { class: 'icon-btn lsn-close lsn-back', href: topicHref, 'aria-label': 'Back to the course' }, U.icon('back'));
    root.appendChild(U.h('div', { class: 'lsn-bar rd-bar' }, back, U.h('span', { class: 'rd-bar-label' }, 'Read-through'), U.h('span')));
    var body = U.h('div', { class: 'rd-body' }, U.h('p', { class: 'muted rd-wait', role: 'status' }, 'Opening the read-through…'));
    root.appendChild(body);
    var st = { topic: null, idea: null, index: -1, doc: null, guide: null, progress: null };
    function alive() { return ctx.alive(); }
    // His choice, kept with the course's progress, so the course page offers it first next time.
    function choose(way) { if (V.setWay) V.setWay(tid, way, st.progress); }

    U.rt.ready.then(function () {
      return Promise.all([U.store.topic.get(tid), U.store.progress.get(tid), U.store.lesson.get(tid, iid), guide(tid, iid)]);
    }).then(function (r) {
      if (!alive()) return;
      st.topic = r[0]; st.progress = U.clone(r[1]) || { ideas: {} }; st.doc = r[2]; st.guide = r[3];
      var ideas = st.topic && Array.isArray(st.topic.ideas) ? st.topic.ideas : [];
      st.index = ideas.map(function (i) { return i.id; }).indexOf(iid);
      st.idea = st.index >= 0 ? ideas[st.index] : null;
      // No guide (an older lesson, a course written in the page) or no whole lesson: the lesson
      // as it is, at its own address.
      if (!st.topic || !st.idea || !st.guide || !(st.doc && st.doc.status === 'ready' && st.doc.lesson)) {
        try { history.replaceState(null, '', quizHref); } catch (e) { /* fine */ }
        U.go(quizHref);
        return;
      }
      U.setTitle((st.doc.lesson.title || st.idea.title) + ' · Read-through');
      start();
      draw();
    }).catch(function (e) { if (alive()) U.fail(body, e); });

    // Opening it begins the idea (as opening the lesson does), once.
    function start() {
      var ip = (st.progress.ideas || {})[iid] || {};
      var f = {};
      if (!ip.startedAt) { f.startedAt = U.now(); f.stage = 'play'; }
      if (!Object.keys(f).length && st.progress.lastIdea === iid) return;
      save(f);
    }
    function round() { var ip = (st.progress.ideas || {})[iid] || {}; return Number(ip.round) || 0; }
    function save(fields) {
      fields.round = round();
      var p = { lastIdea: iid, ideas: {} };
      p.ideas[iid] = fields;
      return U.store.progress.patch(tid, p).catch(function () { /* the store already told Dan */ });
    }

    function sources() { return st.doc && st.doc.lesson && Array.isArray(st.doc.lesson.sources) ? st.doc.lesson.sources : []; }
    function sourceOf(n) { return sources().filter(function (s) { return Number(s.n) === Number(n); })[0] || null; }
    var fx = { footnotes: { has: function (n) { return !!sourceOf(n); }, open: function (n) { if (U.lesson && U.lesson.sourceSheet) U.lesson.sourceSheet(sourceOf(n)); } } };
    function words(tag, cls, text) { return U.inline(U.h(tag, { class: cls }), str(text), fx); }
    // A step's picture: its still HTML in a frame (mounted once the list is on the page), else its SVG.
    var stills = [], mounts = [];
    function picture(p) {
      if (stillHtml(p.html, st.guide.style)) { var box = U.h('div', { class: 'rd-still' }); stills.push([box, p]); return box; }
      var src = pic(p.svg);
      return src ? U.h('div', { class: 'rd-well' }, U.h('img', { class: 'rd-pic', src: src, alt: str(p.alt), decoding: 'async' })) : null;
    }
    function quizLink(label, cls) {
      return U.h('a', { class: cls || 'linkish rd-quiz', href: quizHref, on: { click: function () { choose('quiz'); } } }, label);
    }

    function draw() {
      var L = st.doc.lesson, n = (st.topic.ideas || []).length, p = parts(st.guide);
      U.clear(body);
      body.appendChild(U.h('header', { class: 'lsn-head rd-head' },
        U.h('p', { class: 'eyebrow lsn-eb is-filled' }, U.h('span', { class: 'lsn-eb-topic' }, st.topic.title || 'Course'), U.h('span', { class: 'lsn-eb-n' }, 'Lesson ' + (st.index + 1) + ' of ' + n)),
        U.h('h1', { class: 'lsn-title', tabindex: '-1' }, L.title || st.idea.title),
        st.idea.oneLine ? U.line(U.h('p', { class: 'lsn-one' }), st.idea.oneLine) : null,
        U.h('p', { class: 'rd-switch' }, U.h('span', null, 'Just reading it through. '), quizLink('Quiz me through it instead'))));
      var list = U.h('ol', { class: 'rd-pages' });
      p.pages.forEach(function (pg) {
        if (pg.kind === 'show') {
          // A still step reads as the lesson does: its words, then what it shows; a picture comes first.
          var shown = picture(pg), said = str(pg.text) ? words('p', 'rd-text', pg.text) : null;
          list.appendChild(U.h('li', { class: 'rd-show' }, shown && shown.classList.contains('rd-still') ? [said, shown] : [shown, said]));
        } else {
          // The question, the choices it offered (the right one marked), the step as it looks
          // worked, the answer with its unit, then why.
          var ans = answerOf(pg), opts = choicesOf(pg);
          list.appendChild(U.h('li', { class: 'rd-ex' },
            U.h('p', { class: 'eyebrow rd-ex-l' }, pg.written ? 'Written question' : 'Worked example'),
            words('p', 'rd-ex-q', pg.task),
            opts.length ? U.h('ul', { class: 'rd-ex-opts', 'aria-label': 'The choices' }, opts.map(function (o) {
              var right = o === str(pg.answer);
              return U.h('li', { class: right ? 'is-right' : null }, right ? U.h('span', { class: 'rd-ex-tick', 'aria-hidden': 'true' }, U.icon('tick')) : null, U.h('span', null, o), right ? U.h('span', { class: 'visually-hidden' }, ' (the answer)') : null);
            })) : null,
            picture(pg),
            ans ? U.h('p', { class: 'rd-ex-a' }, U.h('span', { class: 'rd-ex-k' }, 'Answer'), U.h('b', null, ans)) : null,
            str(pg.why) ? words('p', 'rd-ex-why', pg.why) : null));
        }
      });
      body.appendChild(list);
      stills.forEach(function (x) { var m = still(x[0], x[1].html, st.guide.style, { w: st.guide.stillW, h: x[1].h }); if (m) mounts.push(m); });
      if (p.summary) body.appendChild(summaryCard(p.summary));
      body.appendChild(endPart());
    }
    // The Keep this card, words only: what it is for, the rule, the traps (red: mistakes), the
    // case's figures and where it lives in his materials.
    function summaryCard(s) {
      var lab = function (t) { return U.h('p', { class: 'eyebrow rd-sum-l' }, t); };
      var rule = str(s.rule).split(/\n\s*\n/).map(function (b, k) {
        return b.split('\n').filter(function (l) { return l.trim(); }).map(function (l) { return U.inline(U.h('p', { class: k ? 'n' : null }), l.trim()); });
      });
      var traps = (Array.isArray(s.traps) ? s.traps : []).filter(function (t) { return isObj(t) && str(t.text); });
      var figs = (Array.isArray(s.figures) ? s.figures : []).filter(function (f) { return isObj(f) && str(f.label); });
      return U.h('section', { class: 'rd-sum', 'aria-labelledby': 'rd-sum-h' },
        U.h('p', { class: 'eyebrow', id: 'rd-sum-h' }, 'Keep this'),
        U.h('h2', { class: 'rd-sum-t' }, str(s.title)),
        str(s.for) ? U.h('div', null, lab('What it is for'), U.inline(U.h('p'), str(s.for))) : null,
        str(s.rule) ? U.h('div', { class: 'rd-sum-rule' }, lab('The rule'), rule) : null,
        traps.length ? U.h('div', { class: 'rd-sum-traps' }, lab('Traps'), traps.map(function (t) {
          return U.inline(U.h('p', { class: 'rd-trap' }), str(t.text));   // its cite: data, not shown
        })) : null,
        figs.length ? U.h('div', null, lab(str(s.figuresLabel) || 'Figures so far'), U.h('dl', { class: 'rd-figs' }, figs.map(function (f) { return U.h('div', null, U.h('dt', null, str(f.label)), U.h('dd', null, str(f.value))); }))) : null,
        str(s.where) ? U.h('p', { class: 'rd-sum-where' }, 'Where it lives: ' + str(s.where).replace(/^where it lives:\s*/i, '')) : null);
    }
    // The end: Finished reading records it as read; quizzing through it stays one tap away.
    var endBox = null;
    function endPart() {
      endBox = U.h('section', { class: 'rd-end', 'aria-label': 'Finish' },
        U.h('button', { class: 'btn lsn-main rd-finish', type: 'button', on: { click: finish } }, 'Finished reading'),
        U.h('p', { class: 'rd-end-alt' }, U.h('span', null, 'Want to test yourself on it? '), quizLink('Quiz me through it')));
      return endBox;
    }
    function nextIdea() {
      var ideas = st.topic.ideas || [], prog = st.progress.ideas || {};
      function open(i) { var p = prog[i.id] || {}; return i.id !== iid && p.stage !== 'done' && !p.known && !i.known; }
      for (var k = st.index + 1; k < ideas.length; k++) if (open(ideas[k])) return ideas[k];
      for (var j = 0; j < st.index; j++) if (open(ideas[j])) return ideas[j];
      return null;
    }
    // Read, as any read lesson is (readRound: no review cards, cardsRound with it), and marked as a
    // read-through (readThrough), unless he has already quizzed through this round.
    function finish() {
      var ip = (st.progress.ideas || {})[iid] || {}, r = round(), first = !ip.doneAt;
      var f = { stage: 'done' };
      if (first) f.doneAt = U.now();
      if (Number(ip.readRound) !== r || ip.readRound == null) f.readRound = r;
      if (ip.cardsRound == null || Number(ip.cardsRound) < r) f.cardsRound = r;
      if (Number(ip.quizRound) !== r || ip.quizRound == null) f.readThrough = r;
      save(f);
      var ideas = st.progress.ideas || (st.progress.ideas = {});
      ideas[iid] = Object.assign({}, ip, f);
      // The course's dossier binds the lesson as a chapter, as finishing the lesson does.
      if (first && U.dossier && typeof U.dossier.bind === 'function') U.dossier.bind(tid, iid, { doc: st.doc, doneAt: f.doneAt });
      var nx = nextIdea();
      var done = U.h('section', { class: 'rd-end rd-done', 'aria-label': 'Lesson read', tabindex: '-1' },
        U.h('div', { class: 'lsn-done-mark', 'aria-hidden': 'true' }, U.icon('tick')),
        U.h('h2', { class: 'lsn-h' }, 'Lesson read'),
        U.h('p', { class: 'lsn-done-text' }, 'Marked as read on your course page. You can quiz yourself through it whenever you like.'),
        nx ? U.h('div', { class: 'lsn-next' }, U.h('p', { class: 'eyebrow' }, 'Next'), U.h('h3', null, str(nx.title)),
          U.h('div', { class: 'rd-next-go' },
            // Read through too (a lesson without a guide opens as it is, from its read-through).
            U.h('a', { class: 'btn lsn-main', href: topicHref + '/' + encodeURIComponent(nx.id) + '/read' }, 'Next lesson', U.icon('arrow')),
            U.h('a', { class: 'btn secondary', href: topicHref }, 'Back to the course')))
          : U.h('div', { class: 'lsn-next' }, U.h('h3', null, 'That was the last lesson in ' + (st.topic.title || 'this course')),
            U.h('a', { class: 'btn lsn-main', href: topicHref }, 'Back to the course')),
        U.h('p', { class: 'rd-end-alt' }, quizLink('Quiz me through it')));
      endBox.replaceWith(done);
      endBox = done;
      try { done.focus({ preventScroll: true }); } catch (e) { done.focus(); }
      done.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
    return function () { mounts.forEach(function (m) { try { m.destroy(); } catch (e) { /* gone */ } }); };
  }
  U.routes.add('#/t/:tid/:iid/read', readScreen, { focus: true, title: 'Read-through' });
})();
