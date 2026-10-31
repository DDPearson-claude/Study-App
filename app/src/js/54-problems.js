// Problem sets: worked examples with a figure for an answer, to work out with pen and paper (Dan,
// 27 Oct: "a set of problems I need to work out but I need to type the answer into the app to get
// a check"). One problem at a time, as a puzzle card (41-cards.js) in lesson mode: the question,
// his answer typed (the unit optional, the calculator one tap away in the bar), Check. A wrong
// first answer gets one more go ("Check your working and try again"); then the answer, Claude's
// why and the solved picture. Under it, where this view can send photos, "Check my working from
// a photo" (55-practice.js). The end says how many were right first time and lists them.
//
// Two sets (Dan, 31 Oct, with new numbers and the photo):
//   #/t/:tid/:iid/problems   one lesson's problems; the score is kept in progress.ideas[iid].problems
//                            {at, of, first, right} and shown on the course page.
//   #/problems/mix           mixed problems from his finished lessons across the courses he picks
//                            (?topic=<tid>: that course alone, chosen); 10 or 20, spread over the
//                            courses and lessons, from at most twelve lesson guides read.
// Either can be worked with the lesson's numbers or with new numbers (U.practice.variants: Claude's
// formula, the app's own sum, a problem that fails a check keeping the lesson's numbers). A problem
// with new numbers shows no picture: the guide's is drawn for the lesson's numbers.
//
// The problems are U.review.puzzlesFrom's typed cards (60-today.js): an example whose answer is a
// figure ("28.87 A", "About 9.26 V", "1.25 per unit"), unless its task names its options. An
// example answered by choosing words or by moving the picture is left out. Nothing goes into the
// review box.
//   U.problems.from(tid, iid, guide, lesson, idea) -> [card]   pure: the typed cards, in guide order
//   U.problems.href(tid, iid) -> '#/t/<tid>/<iid>/problems'     U.problems.mixHref(tid?) -> '#/problems/mix[?topic=]'
//   U.problems.pick(pools, n, rand?) -> [item]   pure: n items taken in turn from each pool
(function () {
  'use strict';

  function str(v) { return typeof v === 'string' ? v : v == null ? '' : String(v); }
  function href(tid, iid) { return '#/t/' + encodeURIComponent(tid) + '/' + encodeURIComponent(iid) + '/problems'; }
  function mixHref(tid) { return '#/problems/mix' + (tid ? '?topic=' + encodeURIComponent(tid) : ''); }

  function from(tid, iid, guide, lesson, idea) {
    if (!U.review || typeof U.review.puzzlesFrom !== 'function') return [];
    var made = U.review.puzzlesFrom(tid, iid, guide, lesson, idea) || {};
    return Object.keys(made).map(function (k) { return made[k]; })
      .filter(function (c) { return c && c.type === 'puzzle' && c.spec && c.spec.input === 'typed'; })
      .sort(function (a, b) { return a.spec.page - b.spec.page; });
  }
  // The solved picture for a card, from its guide (as 60-today.js's pageFor reads it).
  function pageOf(guide, card) {
    var p = guide && Array.isArray(guide.pages) ? guide.pages[card.spec.page] : null;
    if (!p || p.kind !== 'example' || !(p.svg || p.html)) return null;
    return { svg: p.svg || null, html: p.html || null, alt: str(p.alt), style: str(guide.style), w: Number(guide.stillW) || 0, h: Number(p.h) || 0 };
  }
  function shuffle(a, rand) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  // n items, one from each pool in turn (each pool shuffled), so the set spreads over them all.
  function pick(pools, n, rand) {
    rand = rand || Math.random;
    var qs = shuffle(pools.filter(function (p) { return p && p.length; }), rand).map(function (p) { return shuffle(p, rand); }), out = [];
    while (out.length < n && qs.some(function (q) { return q.length; })) qs.forEach(function (q) { if (out.length < n && q.length) out.push(q.shift()); });
    return out;
  }

  U.problems = { from: from, href: href, mixHref: mixHref, pick: pick };
  if (!U.routes) return;

  function bar(root, tid) {
    var topicHref = tid ? '#/t/' + encodeURIComponent(tid) : '#/';
    var back = tid && U.lesson && U.lesson.backLink ? U.lesson.backLink(tid) : U.h('a', { class: 'icon-btn lsn-close lsn-back', href: topicHref, 'aria-label': tid ? 'Back to the course' : 'Back' }, U.icon('back'));
    root.appendChild(U.h('div', { class: 'lsn-bar rd-bar' }, back, U.h('span', { class: 'rd-bar-label' }, 'Problems'),
      U.calcSheet ? U.calcSheet.button('rd-calc') : U.h('span')));
  }

  // The runner both sets share. o = {body, head() -> Element, items: [{card, guide, title, where}],
  // backHref, backLabel, onEnd(score)}.
  function runner(ctx, o) {
    var st = { items: o.items, run: [], at: 0, done: [], card: null, slot: null, fresh: false, busy: false };
    function intro(note) {
      if (st.card && st.card.destroy) st.card.destroy();
      st.card = null;
      U.clear(o.body);
      o.body.appendChild(o.head());
      if (!st.items.length) return;
      o.body.appendChild(U.h('section', { class: 'pb-start' },
        note ? U.h('p', { class: 'small pr-photo-err', role: 'status' }, note) : null,
        U.h('div', { class: 'pb-go' },
          U.h('button', { class: 'btn lsn-main', type: 'button', on: { click: function () { start(false); } } }, 'Start'),
          U.h('button', { class: 'btn secondary', type: 'button', on: { click: function () { start(true); } } }, 'Start with new numbers')),
        U.h('p', { class: 'muted small' }, 'New numbers: Claude writes each problem again with fresh values, and the app works out the answers itself.')));
    }
    function start(fresh) {
      if (st.busy) return;
      st.fresh = !!fresh; st.at = 0; st.done = [];
      st.run = st.items.map(function (it) { return { card: it.card, guide: it.guide, title: it.title, where: it.where, spec: it.card.spec }; });
      if (!fresh) return begin();
      st.busy = true;
      U.clear(o.body);
      o.body.appendChild(o.head());
      o.body.appendChild(U.h('p', { class: 'muted', role: 'status' }, U.h('span', { class: 'v-dot', 'aria-hidden': 'true' }), 'Claude is writing new numbers for ' + (st.run.length === 1 ? 'this problem' : 'these ' + st.run.length + ' problems') + '…'));
      U.practice.variants(st.run.map(function (r) { return r.card; })).then(function (v) {
        st.busy = false;
        if (!ctx.alive()) return;
        var n = 0;
        st.run.forEach(function (r) { if (v[r.card.id]) { r.spec = v[r.card.id]; n++; } });
        if (!n) { intro('New numbers could not be made for these problems just now, so they keep the lesson\'s numbers.'); st.fresh = false; return; }
        st.freshNote = n < st.run.length ? n + ' of the ' + st.run.length + ' problems have new numbers; the rest keep the lesson\'s.' : '';
        begin();
      }, function (e) {
        st.busy = false;
        if (!ctx.alive()) return;
        var code = e && e.code;
        intro(code === 'not_granted' ? 'Asking Claude is not allowed on this page, so new numbers cannot be made.'
          : code === 'rate_limited' ? 'Claude is busy just now. Try again in a minute, or start with the lesson\'s numbers.'
            : 'New numbers could not be made just now. Try again, or start with the lesson\'s numbers.');
      });
    }
    function begin() {
      U.clear(o.body);
      o.body.appendChild(o.head());
      if (st.fresh && st.freshNote) o.body.appendChild(U.h('p', { class: 'muted small pb-fresh-note' }, st.freshNote));
      st.slot = U.h('div', { class: 'pb-slot' });
      o.body.appendChild(st.slot);
      show();
    }
    function show() {
      if (st.card && st.card.destroy) st.card.destroy();
      var r = st.run[st.at], fresh = !!r.spec.fresh;
      var card = { id: r.card.id + (fresh ? '-n' : ''), type: 'puzzle', spec: r.spec };
      var kind = 'Problem ' + (st.at + 1) + ' of ' + st.run.length + (r.where ? ' · ' + r.where : '') + (fresh ? ' · new numbers' : '');
      var el = U.cards.render(card, { mode: 'lesson', kind: kind, retries: 1, page: fresh ? null : pageOf(r.guide, r.card),
        afterAnswer: U.practice ? function (x) { return U.practice.photoPanel({ title: r.title, task: x.spec.q, answer: x.spec.answer, why: x.spec.why, said: x.said, correct: x.correct }); } : null,
        onDone: function (res) { answered(r, res || {}); } });
      st.card = el;
      U.clear(st.slot);
      st.slot.appendChild(el);
      if (st.at > 0) {
        var q = el.querySelector('.qc-q');
        if (q) { q.setAttribute('tabindex', '-1'); try { q.focus({ preventScroll: true }); } catch (e) { q.focus(); } }
        el.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    }
    function answered(r, res) {
      st.done.push({ r: r, correct: res.correct === true, tries: Number(res.tries) || 1, said: str(res.answer) });
      st.at++;
      if (st.at < st.run.length) show(); else end();
    }
    function end() {
      if (st.card && st.card.destroy) st.card.destroy();
      st.card = null;
      var of = st.done.length;
      var first = st.done.filter(function (d) { return d.correct && d.tries === 1; }).length;
      var right = st.done.filter(function (d) { return d.correct; }).length;
      if (o.onEnd) o.onEnd({ of: of, first: first, right: right, fresh: st.fresh });
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
            U.h('span', { class: 'pb-q' }, U.h('span', { class: 'pb-n' }, 'Problem ' + (k + 1) + (d.r.where ? ' (' + d.r.where + ')' : '') + ': '), U.inline(U.h('span'), str(d.r.spec.q))),
            U.h('span', { class: 'pb-a' }, ok ? (d.tries > 1 ? 'Right on the second go: ' : 'Right: ') + str(d.r.spec.answer)
              : 'You said ' + (d.said || 'nothing') + '. The answer: ' + str(d.r.spec.answer)),
            U.h('span', { class: 'visually-hidden' }, ok ? ' (right)' : ' (not right)'));
        })),
        U.h('div', { class: 'pb-go' },
          U.h('button', { class: 'btn lsn-main', type: 'button', on: { click: function () { start(true); } } }, 'Again with new numbers'),
          U.h('button', { class: 'btn secondary', type: 'button', on: { click: function () { start(false); } } }, 'Again with the lesson\'s numbers')),
        U.h('a', { class: 'linkish', href: o.backHref }, o.backLabel));
      U.clear(st.slot);
      st.slot.appendChild(sec);
      try { sec.focus({ preventScroll: true }); } catch (e) { sec.focus(); }
      sec.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
    return { intro: intro, destroy: function () { if (st.card && st.card.destroy) st.card.destroy(); } };
  }

  // ---------- one lesson's problems ----------
  function problemsScreen(params, ctx) {
    var tid = params.tid, iid = params.iid;
    var topicHref = '#/t/' + encodeURIComponent(tid), lessonHref = topicHref + '/' + encodeURIComponent(iid);
    var root = U.h('div', { class: 'lsn rd pb' });
    ctx.view.appendChild(root);
    bar(root, tid);
    var body = U.h('div', { class: 'rd-body pb-body' }, U.h('p', { class: 'muted rd-wait', role: 'status' }, 'Opening the problems…'));
    root.appendChild(body);
    var run = null;

    U.rt.ready.then(function () {
      return Promise.all([U.store.topic.get(tid), U.store.lesson.get(tid, iid), U.readThrough ? U.readThrough.guide(tid, iid) : null]);
    }).then(function (r) {
      if (!ctx.alive()) return;
      var topic = r[0], doc = r[1], guide = r[2];
      var ideas = topic && Array.isArray(topic.ideas) ? topic.ideas : [];
      var index = ideas.map(function (i) { return i.id; }).indexOf(iid), idea = index >= 0 ? ideas[index] : null;
      // No lesson here at all: the lesson's own address says so as it always does.
      if (!topic || !idea) { U.replaceHash(lessonHref); return; }
      var lesson = doc && doc.status === 'ready' ? doc.lesson : null;
      var title = (lesson && lesson.title) || idea.title;
      var cards = guide && lesson ? from(tid, iid, guide, lesson, null) : [];
      U.setTitle(title + ' · Problems');
      var head = function () {
        return U.h('header', { class: 'lsn-head rd-head' },
          U.h('p', { class: 'eyebrow lsn-eb is-filled' }, U.h('span', { class: 'lsn-eb-topic' }, topic.title || 'Course'), U.h('span', { class: 'lsn-eb-n' }, 'Lesson ' + (index + 1) + ' of ' + ideas.length)),
          U.h('h1', { class: 'lsn-title', tabindex: '-1' }, title),
          cards.length
            ? U.h('p', { class: 'lsn-one pb-lede' }, (cards.length === 1 ? 'One problem' : cards.length + ' problems') +
              ' from this lesson. Work each one out on paper, then type your answer. If it is not right, you get one more go before the working shows.')
            : null);
      };
      if (!cards.length) {
        U.clear(body);
        body.appendChild(head());
        body.appendChild(U.h('section', { class: 'rd-end pb-none' },
          U.h('p', null, 'This lesson has no problems with a figure to work out. Its questions are answered by choosing words or by moving the picture.'),
          U.h('div', { class: 'pb-go' },
            U.h('a', { class: 'btn lsn-main', href: lessonHref }, 'Open the lesson'),
            U.h('a', { class: 'btn secondary', href: topicHref }, 'Back to the course'))));
        return;
      }
      run = runner(ctx, {
        body: body, head: head, backHref: topicHref, backLabel: 'Back to the course',
        items: cards.map(function (c) { return { card: c, guide: guide, title: title, where: '' }; }),
        onEnd: function (sc) {
          var p = { ideas: {} };
          p.ideas[iid] = { problems: { at: U.now(), of: sc.of, first: sc.first, right: sc.right } };
          U.store.progress.patch(tid, p).catch(function () { /* the store already told Dan */ });
        },
      });
      run.intro();
    }).catch(function (e) { if (ctx.alive()) U.fail(body, e); });
    return function () { if (run) run.destroy(); };
  }
  U.routes.add('#/t/:tid/:iid/problems', problemsScreen, { focus: true, title: 'Problems' });

  // ---------- mixed problems ----------
  // The courses he can mix: ready-made ones with at least one finished lesson.
  function finished(topic, progress) {
    var V = U.views || {}, ideas = Array.isArray(topic.ideas) ? topic.ideas : [];
    return ideas.map(function (i, k) { return { idea: i, n: k + 1 }; }).filter(function (x) {
      return V.isDone ? V.isDone(progress || {}, x.idea.id) : !!(((progress || {}).ideas || {})[x.idea.id] || {}).doneAt;
    });
  }
  function mixScreen(params, ctx) {
    var only = ctx.query && ctx.query.topic || null;
    var root = U.h('div', { class: 'lsn rd pb' });
    ctx.view.appendChild(root);
    bar(root, only);
    var body = U.h('div', { class: 'rd-body pb-body' }, U.h('p', { class: 'muted rd-wait', role: 'status' }, 'Opening mixed problems…'));
    root.appendChild(body);
    var run = null, courses = [], chosen = {}, count = 10;
    var back = only ? '#/t/' + encodeURIComponent(only) : '#/today';

    U.rt.ready.then(function () { return Promise.all([U.store.topics.list(), U.store.progress.all()]); }).then(function (r) {
      if (!ctx.alive()) return;
      var progress = r[1] || {};
      courses = (r[0] || []).filter(function (t) { return t && t.readyMade && t.__id && (!only || t.__id === only); }).map(function (t) {
        return { tid: t.__id, title: str(t.title), lessons: finished(t, progress[t.__id]) };
      }).filter(function (c) { return c.lessons.length; });
      courses.forEach(function (c) { chosen[c.tid] = true; });
      U.setTitle('Mixed problems');
      picker();
    }).catch(function (e) { if (ctx.alive()) U.fail(body, e); });

    function head() {
      return U.h('header', { class: 'lsn-head rd-head' },
        U.h('p', { class: 'eyebrow lsn-eb is-filled' }, U.h('span', { class: 'lsn-eb-topic' }, only && courses[0] ? courses[0].title : 'Your courses'), U.h('span', { class: 'lsn-eb-n' }, 'Mixed problems')),
        U.h('h1', { class: 'lsn-title', tabindex: '-1' }, 'Mixed problems'),
        U.h('p', { class: 'lsn-one pb-lede' }, 'Problems from the lessons you have finished, mixed together, as an exam asks them. Work each one on paper, then type your answer.'));
    }
    function picker(note) {
      U.clear(body);
      body.appendChild(head());
      if (!courses.length) {
        body.appendChild(U.h('section', { class: 'rd-end pb-none' },
          U.h('p', null, 'Finish a lesson of a ready-made course first: its problems then come into the mix.'),
          U.h('div', { class: 'pb-go' }, U.h('a', { class: 'btn lsn-main', href: '#/' }, 'Browse your library'))));
        return;
      }
      var list = only ? null : U.h('fieldset', { class: 'pb-pick' }, U.h('legend', { class: 'qc-label' }, 'From these courses'),
        courses.map(function (c) {
          var box = U.h('input', { type: 'checkbox', checked: chosen[c.tid] ? 'checked' : null, on: { change: function () { chosen[c.tid] = box.checked; } } });
          return U.h('label', { class: 'pb-course' }, box, U.h('span', null, c.title), U.h('span', { class: 'muted small' }, c.lessons.length + (c.lessons.length === 1 ? ' lesson finished' : ' lessons finished')));
        }));
      var sizes = U.h('div', { class: 'pb-size', role: 'group', 'aria-label': 'How many problems' }, [10, 20].map(function (n) {
        var b = U.h('button', { class: 'chip', type: 'button', 'aria-pressed': String(count === n), on: { click: function () { count = n; sizes.querySelectorAll('.chip').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); } } }, n + ' problems');
        return b;
      }));
      body.appendChild(U.h('section', { class: 'pb-start' }, list, U.h('p', { class: 'qc-label' }, 'How many'), sizes,
        note ? U.h('p', { class: 'small pr-photo-err', role: 'status' }, note) : null,
        U.h('div', { class: 'pb-go' }, U.h('button', { class: 'btn lsn-main', type: 'button', on: { click: gather } }, 'Make the set'))));
    }
    // Reads at most twelve lesson guides (100-250 KB each): lessons in turn from each chosen course.
    function gather() {
      var use = courses.filter(function (c) { return chosen[c.tid]; });
      if (!use.length) { picker('Choose at least one course.'); return; }
      U.clear(body);
      body.appendChild(head());
      body.appendChild(U.h('p', { class: 'muted', role: 'status' }, U.h('span', { class: 'v-dot', 'aria-hidden': 'true' }), 'Gathering problems from your lessons…'));
      var lessons = pick(use.map(function (c) { return c.lessons.map(function (l) { return { c: c, l: l }; }); }), 12);
      Promise.all(lessons.map(function (x) {
        return Promise.all([U.readThrough.guide(x.c.tid, x.l.idea.id), U.store.lesson.get(x.c.tid, x.l.idea.id).catch(function () { return null; })]).then(function (r) {
          var g = r[0], d = r[1], L = d && d.status === 'ready' ? d.lesson : null;
          if (!g || !L) return [];
          var title = str(L.title || x.l.idea.title);
          return from(x.c.tid, x.l.idea.id, g, L, null).map(function (card) {
            return { card: card, guide: g, title: title, where: (only ? '' : x.c.title + ', ') + 'lesson ' + x.l.n };
          });
        }).catch(function () { return []; });
      })).then(function (pools) {
        if (!ctx.alive()) return;
        var items = pick(pools, count);
        if (!items.length) { picker('Those lessons have no problems with a figure to type. Choose other courses.'); return; }
        run = runner(ctx, {
          body: body, backHref: back, backLabel: only ? 'Back to the course' : 'Back to Today',
          head: function () {
            return U.h('header', { class: 'lsn-head rd-head' },
              U.h('p', { class: 'eyebrow lsn-eb is-filled' }, U.h('span', { class: 'lsn-eb-topic' }, 'Mixed problems'), U.h('span', { class: 'lsn-eb-n' }, items.length + ' problems')),
              U.h('h1', { class: 'lsn-title', tabindex: '-1' }, 'Mixed problems'),
              U.h('p', { class: 'lsn-one pb-lede' }, 'From ' + (only ? 'this course\'s finished lessons' : use.map(function (c) { return c.title; }).join(', ')) + '. Work each one on paper, then type your answer. One more go if it is not right, then the working.'));
          },
          items: items,
        });
        run.intro();
      });
    }
    return function () { if (run) run.destroy(); };
  }
  U.routes.add('#/problems/mix', mixScreen, { focus: true, title: 'Mixed problems', screen: 'lesson' });
})();
