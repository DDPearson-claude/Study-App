// The Library, the home (#/): ready-made courses only (Dan, 18 Oct: "material and content I can
// dive into when I feel like learning something new or brushing up"). Top to bottom: the look-up
// field, one row for the course he left open, one row for the puzzles in the box, then the shelves
// as 76-shelves.js draws them, the shelves with nothing built yet folded under one line. Nothing on
// it is due or counts down, and a row with nothing to say is not drawn. It also queues the course
// pictures (35-art.js) and, once he has a course, asks once whether he wants them (below the
// shelves, never in the way), as Learn did.
// Design: docs/design/library-home/README.md; build order: docs/HANDOFF-build-library-home.md.
(function () {
  'use strict';
  var V = U.views, SH = U.shelves;
  function enc(x) { return encodeURIComponent(x); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many || one + 's'); }
  // "Trigonometry", "Trigonometry and Fractions", "Trigonometry, Fractions and 2 more".
  function names(list) {
    if (list.length <= 1) return list.join('');
    if (list.length === 2) return list[0] + ' and ' + list[1];
    return list.slice(0, 2).join(', ') + ' and ' + plural(list.length - 2, 'more', 'more');
  }
  // "A", "A and B", "A, B and C": every name.
  function andList(list) { return list.length <= 1 ? list.join('') : list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1]; }
  // The built courses on these shelves: tid -> {title, shelf}.
  function builtCourses(shelves) {
    var out = {};
    shelves.forEach(function (s) {
      SH.allCourses(s).forEach(function (c) { var tid = SH.built(c); if (tid && !out[tid]) out[tid] = { title: SH.str(c.title), shelf: s.__id }; });
    });
    return out;
  }

  // The course he left open: the most recently touched built course whose next lesson he has
  // begun or reached but not finished (progress.lastIdea, V.summary), or null.
  function leftOpen(topics, progress, built) {
    var best = null;
    topics.forEach(function (t) {
      if (!t || !built[t.id] || t.status !== 'ready') return;
      var p = progress[t.id];
      if (!p || !p.updatedAt) return;
      var s = V.summary(t, p);
      if (!s.current || s.allDone || !(s.started || s.done > 0)) return;
      if (!best || String(s.touched) > String(best.s.touched)) best = { t: t, s: s };
    });
    return best;
  }
  function openRow(best) {
    var t = best.t, s = best.s, title = V.asTitle(t.title || t.query);
    return U.h('a', { class: 'today-row lib-open', 'data-tone': V.toneOf(title, t), href: '#/t/' + enc(t.id) + '/' + enc(s.current.id), 'aria-label': 'Left open: ' + title + ', lesson ' + (s.index + 1) + ' of ' + s.total + ', ' + s.current.title },
      U.h('span', { class: 'lib-open-cover', 'aria-hidden': 'true' }, V.cover(t)),
      U.h('span', { class: 'today-text' },
        U.h('span', { class: 'lib-open-label' }, 'Left open · ' + title),
        U.h('strong', null, s.current.title),
        U.h('span', { class: 'lib-open-n' }, 'lesson ' + (s.index + 1) + ' of ' + s.total)),
      U.icon('arrow', 'today-go'));
  }
  // The puzzle box: how many there are and from which courses, opening Today. Never "due".
  function boxRow(box, titleOf) {
    var from = box.courses.map(function (c) { return titleOf(c.tid); }).filter(Boolean);
    return U.h('a', { class: 'today-row lib-box', href: '#/today' },
      U.h('span', { class: 'today-ico', 'aria-hidden': 'true' }, U.icon('puzzle')),
      U.h('span', { class: 'today-text' },
        U.h('strong', null, plural(box.size, 'puzzle') + ' in the box'),
        U.h('span', { class: 'muted small' }, (from.length ? 'From ' + names(from) + ' · ' : '') + 'when you like')),
      U.icon('arrow', 'today-go'));
  }

  // A shelf with nothing built yet: a card that opens nothing, its tile grey, saying what is coming.
  function waitingCard(s) {
    var n = SH.allCourses(s).length;
    return U.h('div', { class: 'shelf-card is-waiting', 'data-tone': V.toneOf(SH.str(s.title)) },
      U.h('span', { class: 'shelf-ico', 'aria-hidden': 'true' }, U.icon('folder')),
      U.h('span', { class: 'shelf-body' },
        U.h('span', { class: 'shelf-title' }, SH.str(s.title)),
        SH.str(s.blurb) ? U.h('span', { class: 'shelf-blurb' }, SH.str(s.blurb)) : null,
        U.h('span', { class: 'shelf-meta' }, 'On the way · ' + (n ? 'about ' + plural(n, 'course') : 'courses to come'))));
  }
  function shelfMeta(s) {
    var f = SH.folders(s), all = SH.allCourses(s), b = all.filter(SH.built).length;
    return plural(f.length, 'folder') + ' · ' + plural(b, 'course') + ' built' + (all.length > b ? ' · ' + (all.length - b) + ' to come' : '');
  }

  U.routes.add('#/', function (params, ctx) {
    var eyebrow = U.h('p', { class: 'eyebrow' }, V.greeting());
    // Look up (77-library.js, phase 3 makes it search): the one search in the app.
    var look = U.h('input', { class: 'input ask-input lib-look-input', id: 'lib-look', type: 'search', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', enterkeyhint: 'search', maxlength: '80', placeholder: 'Look up a lesson: power factor, cosine rule…' });
    var lookBox = U.h('div', { class: 'lib-look', role: 'search' },
      U.h('label', { class: 'visually-hidden', for: 'lib-look' }, 'Look up a lesson'),
      U.h('span', { class: 'lib-look-ico', 'aria-hidden': 'true' }, U.icon('search')), look);
    var openBox = U.h('div', { class: 'lib-row-open' }), boxBox = U.h('div', { class: 'lib-row-box' });
    var rows = U.h('div', { class: 'lib-rows', hidden: true }, openBox, boxBox);
    var liveBox = U.h('div', { class: 'lib-live' });
    var shelvesBox = U.h('div', { class: 'shelf-grid' }, U.h('div', { class: 'skeleton', style: 'height:96px;border-radius:18px' }));
    var laterBox = U.h('div', { class: 'lib-later' });
    var artBox = U.h('div', { class: 'lib-art' });
    var page = U.h('div', { class: 'lib-body' }, rows,
      U.h('section', { class: 'lib-shelves', 'aria-labelledby': 'lib-shelves-h' },
        U.h('h2', { class: 'eyebrow', id: 'lib-shelves-h' }, 'Shelves'), liveBox, shelvesBox, laterBox),
      artBox);
    ctx.view.appendChild(U.h('div', { class: 'lib-page lib-home' },
      U.h('header', { class: 'page-head' }, eyebrow, U.h('h1', null, 'Your library')),
      lookBox, page));

    // Hello by first name when the runtime knows it.
    if (U.rt.user && U.rt.user.me) {
      Promise.resolve(U.rt.user.me()).then(function (me) {
        var first = me && me.name ? String(me.name).trim().split(/\s+/)[0] : '';
        if (first && ctx.alive()) eyebrow.textContent = V.greeting() + ', ' + first;
      }, function () {});
    }

    // --- what the rows read: the shelves, the topics, his progress and the box ---
    var shelves = null, topics = null, progress = null, box = null;
    var ui = { later: null };   // the planned shelves' fold, as he left it across a redraw
    function built() { return builtCourses(shelves || []); }
    function titleOf(tid) {
      var t = (topics || []).filter(function (x) { return x && x.id === tid; })[0], b = built()[tid];
      return t ? V.asTitle(t.title || t.query) : b ? b.title : '';
    }
    var openSig = null, boxSig = null;
    function paintRows() {
      var best = shelves && topics && progress ? leftOpen(topics, progress, built()) : null;
      var os = best ? [best.t.id, best.s.current.id, best.s.index, best.s.total, best.t.title, best.t.hue].join('|') : '';
      if (os !== openSig) { openSig = os; U.clear(openBox); if (best) openBox.appendChild(openRow(best)); }
      var bs = box && box.size > 0 && topics ? JSON.stringify(box) + '|' + box.courses.map(function (c) { return titleOf(c.tid); }).join('|') : '';
      if (bs !== boxSig) { boxSig = bs; U.clear(boxBox); if (bs) boxBox.appendChild(boxRow(box, titleOf)); }
      rows.hidden = !openBox.firstChild && !boxBox.firstChild;
    }
    function loadProgress() {
      U.store.progress.all().then(function (r) { if (ctx.alive()) { progress = r || {}; paintRows(); } }, function (e) { console.warn('progress', e); });
    }
    loadProgress();
    if (U.review && typeof U.review.box === 'function') {
      Promise.resolve().then(function () { return U.review.box(); }).then(function (b) { if (ctx.alive()) { box = b; paintRows(); } }, function (e) { console.warn('box', e); });
    }

    // Course pictures: the ones still to draw are queued; the question is asked once.
    // invite: null (none shown) | 'asking' (the card is up) | 'answered' (his answer, said back).
    var invite = null, hasCourse = false;
    function paintInvite() {
      if (invite === 'answered') return;
      var ask = !!U.art && !!(U.settings && U.settings.loaded) && !U.art.asked() && hasCourse;
      if (!ask) { if (invite) { U.clear(artBox); invite = null; } return; }
      if (invite) return;
      invite = 'asking';
      U.art.available().then(function (ok) {
        if (!ctx.alive() || invite !== 'asking') return;
        if (!ok || U.art.asked()) { invite = null; return; }
        U.clear(artBox).appendChild(V.artInvite(function (note) {
          if (!note || !ctx.alive()) return;
          var had = artBox.contains(document.activeElement);
          invite = 'answered';
          var p = U.h('p', { class: 'muted small art-note', tabindex: '-1', role: 'status' }, note);
          U.clear(artBox).appendChild(p);
          if (had || document.activeElement === document.body) p.focus();
        }));
      });
    }
    var offPrefs = U.on('prefs', paintInvite);
    var stopTopics = U.store.topics.watch(function (list) {
      if (!ctx.alive()) return;
      list = list || [];
      topics = list;
      hasCourse = list.some(function (t) { return t && t.status === 'ready'; });
      if (U.art) { U.art.want(list); paintInvite(); }
      paintRows();
    }, function () { /* the shelves still show; the rows and pictures wait for the next visit */ });

    // The shelves, live. A watch that stops once they are shown keeps them and says so above them
    // until its next snapshot (V.liveError); before they are shown it says "Reconnecting…" while
    // the store retries, and only a refusal is an error, with Try again.
    function paintShelves() {
      var list = SH.order(shelves.filter(function (s) { return U.validId(s.__id) && SH.str(s.title) && SH.folders(s).length; }));
      var ready = list.filter(function (s) { return SH.allCourses(s).some(SH.built); }), later = list.filter(function (s) { return ready.indexOf(s) < 0; });
      U.clear(shelvesBox); U.clear(laterBox);
      if (!list.length && U.rt.savedLate()) { shelvesBox.appendChild(V.savedLate('your shelves')); return; }
      if (!list.length) { shelvesBox.appendChild(U.h('p', { class: 'muted' }, 'No shelves yet. Courses arrive here as they are built.')); return; }
      ready.forEach(function (s) { shelvesBox.appendChild(SH.card('#/shelf/' + enc(s.__id), SH.str(s.title), SH.str(s.blurb), shelfMeta(s))); });
      if (!later.length) return;
      // Nothing built anywhere yet: the planned shelves are all there is, so they show.
      var open = ui.later == null ? !ready.length : ui.later;
      laterBox.appendChild(U.h('details', { class: 'lib-fold', open: open, on: { toggle: function (e) { ui.later = !!e.target.open; } } },
        U.h('summary', null, U.h('span', null, (later.length === 1 ? '1 more shelf planned: ' : later.length + ' more shelves planned: ') + andList(later.map(function (s) { return SH.str(s.title); }))),
          U.h('span', { class: 'lsn-chev', 'aria-hidden': 'true' }, U.icon('back'))),
        U.h('div', { class: 'lib-fold-body shelf-grid' }, later.map(waitingCard))));
    }
    var shown = false;
    var stopShelves = U.store.shelves.watch(function (list) {
      if (!ctx.alive()) return;
      shown = true;
      U.clear(liveBox);
      shelves = list || [];
      paintShelves();
      paintRows();
    }, function (e, info) {
      if (!ctx.alive()) return;
      if (shown) { if (!info || !info.retrying) U.clear(liveBox).appendChild(V.liveError('Your shelves', e)); return; }
      U.clear(shelvesBox).appendChild(V.loadError('Your shelves', e, V.reconnecting(e, info)));
    });
    return function () { stopShelves(); stopTopics(); offPrefs(); };
  }, { tab: 'library', title: 'Your library', screen: 'library' });
})();
