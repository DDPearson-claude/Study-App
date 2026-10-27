// Problem set (#/t/:tid/:iid/problems): a ready-made steps lesson's worked examples whose answer is
// a figure, to work out with pen and paper (Dan, 27 Oct: "a set of problems I need to work out but I
// need to type the answer into the app to get a check"). One problem at a time, as a puzzle card
// (41-cards.js) in lesson mode: the question, his answer typed (the unit optional, the calculator
// one tap away in the bar), Check. A wrong first answer gets one more go ("Check your working and
// try again"); then the answer, Claude's why and the solved picture. The end says how many were
// right first time and lists them, and keeps the score in progress.ideas[iid].problems
// {at, of, first, right}; the course page shows it. Nothing goes into the review box.
//
// The problems are U.review.puzzlesFrom's typed cards (60-today.js): an example whose answer is a
// figure ("28.87 A", "About 9.26 V"), unless its task names its options ("Which of these…"). An
// example answered by choosing words or by moving the picture is left out.
//   U.problems.from(tid, iid, guide, lesson, idea) -> [card]   pure: the typed cards, in guide order
//   U.problems.href(tid, iid) -> '#/t/<tid>/<iid>/problems'
(function () {
  'use strict';

  function str(v) { return typeof v === 'string' ? v : v == null ? '' : String(v); }
  function href(tid, iid) { return '#/t/' + encodeURIComponent(tid) + '/' + encodeURIComponent(iid) + '/problems'; }

  function from(tid, iid, guide, lesson, idea) {
    if (!U.review || typeof U.review.puzzlesFrom !== 'function') return [];
    var made = U.review.puzzlesFrom(tid, iid, guide, lesson, idea) || {};
    return Object.keys(made).map(function (k) { return made[k]; })
      .filter(function (c) { return c && c.type === 'puzzle' && c.spec && c.spec.input === 'typed'; })
      .sort(function (a, b) { return a.spec.page - b.spec.page; });
  }
  // The solved picture for a card, from the guide already read (as 60-today.js's pageFor reads it).
  function pageOf(guide, card) {
    var p = guide && Array.isArray(guide.pages) ? guide.pages[card.spec.page] : null;
    if (!p || p.kind !== 'example' || !(p.svg || p.html)) return null;
    return { svg: p.svg || null, html: p.html || null, alt: str(p.alt), style: str(guide.style), w: Number(guide.stillW) || 0, h: Number(p.h) || 0 };
  }

  U.problems = { from: from, href: href };
  if (!U.routes) return;

  function problemsScreen(params, ctx) {
    var tid = params.tid, iid = params.iid;
    var topicHref = '#/t/' + encodeURIComponent(tid), lessonHref = topicHref + '/' + encodeURIComponent(iid);
    var root = U.h('div', { class: 'lsn rd pb' });
    ctx.view.appendChild(root);
    var back = U.lesson && U.lesson.backLink ? U.lesson.backLink(tid) : U.h('a', { class: 'icon-btn lsn-close lsn-back', href: topicHref, 'aria-label': 'Back to the course' }, U.icon('back'));
    root.appendChild(U.h('div', { class: 'lsn-bar rd-bar' }, back, U.h('span', { class: 'rd-bar-label' }, 'Problems'),
      U.calcSheet ? U.calcSheet.button('rd-calc') : U.h('span')));
    var body = U.h('div', { class: 'rd-body pb-body' }, U.h('p', { class: 'muted rd-wait', role: 'status' }, 'Opening the problems…'));
    root.appendChild(body);
    var st = { topic: null, idea: null, index: -1, doc: null, guide: null, cards: [], at: 0, done: [], card: null };
    function alive() { return ctx.alive(); }

    U.rt.ready.then(function () {
      return Promise.all([U.store.topic.get(tid), U.store.lesson.get(tid, iid), U.readThrough ? U.readThrough.guide(tid, iid) : null]);
    }).then(function (r) {
      if (!alive()) return;
      st.topic = r[0]; st.doc = r[1]; st.guide = r[2];
      var ideas = st.topic && Array.isArray(st.topic.ideas) ? st.topic.ideas : [];
      st.index = ideas.map(function (i) { return i.id; }).indexOf(iid);
      st.idea = st.index >= 0 ? ideas[st.index] : null;
      // No lesson here at all: the lesson's own address says so as it always does.
      if (!st.topic || !st.idea) { U.replaceHash(lessonHref); return; }
      var lesson = st.doc && st.doc.status === 'ready' ? st.doc.lesson : null;
      st.cards = st.guide && lesson ? from(tid, iid, st.guide, lesson, null) : [];
      U.setTitle((lesson && lesson.title || st.idea.title) + ' · Problems');
      start();
    }).catch(function (e) { if (alive()) U.fail(body, e); });

    function head() {
      var n = (st.topic.ideas || []).length, title = (st.doc && st.doc.lesson && st.doc.lesson.title) || st.idea.title;
      return U.h('header', { class: 'lsn-head rd-head' },
        U.h('p', { class: 'eyebrow lsn-eb is-filled' }, U.h('span', { class: 'lsn-eb-topic' }, st.topic.title || 'Course'), U.h('span', { class: 'lsn-eb-n' }, 'Lesson ' + (st.index + 1) + ' of ' + n)),
        U.h('h1', { class: 'lsn-title', tabindex: '-1' }, title),
        st.cards.length
          ? U.h('p', { class: 'lsn-one pb-lede' }, (st.cards.length === 1 ? 'One problem' : st.cards.length + ' problems') +
            ' from this lesson. Work each one out on paper, then type your answer. If it is not right, you get one more go before the working shows.')
          : null);
    }
    function start() {
      st.at = 0; st.done = [];
      U.clear(body);
      body.appendChild(head());
      if (!st.cards.length) {
        body.appendChild(U.h('section', { class: 'rd-end pb-none' },
          U.h('p', null, 'This lesson has no problems with a figure to work out. Its questions are answered by choosing words or by moving the picture.'),
          U.h('div', { class: 'pb-go' },
            U.h('a', { class: 'btn lsn-main', href: lessonHref }, 'Open the lesson'),
            U.h('a', { class: 'btn secondary', href: topicHref }, 'Back to the course'))));
        return;
      }
      st.slot = U.h('div', { class: 'pb-slot' });
      body.appendChild(st.slot);
      show();
    }
    function show() {
      if (st.card && st.card.destroy) st.card.destroy();
      var card = st.cards[st.at];
      var el = U.cards.render(card, { mode: 'lesson', kind: 'Problem ' + (st.at + 1) + ' of ' + st.cards.length, retries: 1, page: pageOf(st.guide, card),
        onDone: function (res) { answered(card, res || {}); } });
      st.card = el;
      U.clear(st.slot);
      st.slot.appendChild(el);
      if (st.at > 0) {
        var q = el.querySelector('.qc-q');
        if (q) { q.setAttribute('tabindex', '-1'); try { q.focus({ preventScroll: true }); } catch (e) { q.focus(); } }
        el.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    }
    function answered(card, res) {
      st.done.push({ card: card, correct: res.correct === true, tries: Number(res.tries) || 1, said: str(res.answer) });
      st.at++;
      if (st.at < st.cards.length) show(); else end();
    }
    function end() {
      if (st.card && st.card.destroy) st.card.destroy();
      st.card = null;
      var of = st.done.length;
      var first = st.done.filter(function (d) { return d.correct && d.tries === 1; }).length;
      var right = st.done.filter(function (d) { return d.correct; }).length;
      var p = { ideas: {} };
      p.ideas[iid] = { problems: { at: U.now(), of: of, first: first, right: right } };
      U.store.progress.patch(tid, p).catch(function () { /* the store already told Dan */ });
      var second = right - first;
      var sec = U.h('section', { class: 'rd-end pb-end', 'aria-label': 'Problems done', tabindex: '-1' },
        U.h('div', { class: 'lsn-done-mark', 'aria-hidden': 'true' }, U.icon('tick')),
        U.h('h2', { class: 'lsn-h' }, first + ' of ' + of + ' right first time'),
        second || right < of ? U.h('p', { class: 'lsn-done-text' },
          (second ? second + ' more on the second go. ' : '') + (right < of ? (of - right === 1 ? 'One to look at again.' : (of - right) + ' to look at again.') : '')) : null,
        U.h('ol', { class: 'pb-list' }, st.done.map(function (d, k) {
          var ok = d.correct;
          return U.h('li', { class: ok ? 'is-right' : 'is-wrong' },
            U.h('span', { class: 'pb-mark', 'aria-hidden': 'true' }, U.icon(ok ? 'tick' : 'close')),
            U.h('span', { class: 'pb-q' }, U.h('span', { class: 'pb-n' }, 'Problem ' + (k + 1) + ': '), U.inline(U.h('span'), str(d.card.spec.q))),
            U.h('span', { class: 'pb-a' }, ok ? (d.tries > 1 ? 'Right on the second go: ' : 'Right: ') + str(d.card.spec.answer)
              : 'You said ' + (d.said || 'nothing') + '. The answer: ' + str(d.card.spec.answer)),
            U.h('span', { class: 'visually-hidden' }, ok ? ' (right)' : ' (not right)'));
        })),
        U.h('div', { class: 'pb-go' },
          U.h('button', { class: 'btn lsn-main', type: 'button', on: { click: start } }, 'Work them again'),
          U.h('a', { class: 'btn secondary', href: topicHref }, 'Back to the course')));
      U.clear(st.slot);
      st.slot.appendChild(sec);
      try { sec.focus({ preventScroll: true }); } catch (e) { sec.focus(); }
      sec.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
    return function () { if (st.card && st.card.destroy) st.card.destroy(); };
  }
  U.routes.add('#/t/:tid/:iid/problems', problemsScreen, { focus: true, title: 'Problems' });
})();
