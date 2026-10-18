// The Library, the home (#/): ready-made courses only (Dan, 18 Oct: "material and content I can
// dive into when I feel like learning something new or brushing up"). It greets him and shows the
// shelves as 76-shelves.js draws them; nothing on it is due or counts down. It also queues the
// course pictures (35-art.js) and, once he has a course, asks once whether he wants them (below the
// shelves, never in the way), as Learn did.
// Design: docs/design/library-home/README.md; build order: docs/HANDOFF-build-library-home.md.
(function () {
  'use strict';
  var V = U.views, SH = U.shelves;

  U.routes.add('#/', function (params, ctx) {
    var eyebrow = U.h('p', { class: 'eyebrow' }, V.greeting());
    var artBox = U.h('div', { class: 'lib-art' });
    var shelvesBox = U.h('div', { class: 'shelf-grid' }, U.h('div', { class: 'skeleton', style: 'height:96px;border-radius:18px' }));
    ctx.view.appendChild(U.h('div', { class: 'lib-page lib-home' },
      U.h('header', { class: 'page-head' }, eyebrow, U.h('h1', null, 'Your library')),
      U.h('section', { class: 'lib-shelves', 'aria-labelledby': 'lib-shelves-h' },
        U.h('h2', { class: 'eyebrow', id: 'lib-shelves-h' }, 'Shelves'),
        shelvesBox),
      artBox));

    // Hello by first name when the runtime knows it.
    if (U.rt.user && U.rt.user.me) {
      Promise.resolve(U.rt.user.me()).then(function (me) {
        var first = me && me.name ? String(me.name).trim().split(/\s+/)[0] : '';
        if (first && ctx.alive()) eyebrow.textContent = V.greeting() + ', ' + first;
      }, function () {});
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
      list = list || [];
      hasCourse = list.some(function (t) { return t && t.status === 'ready'; });
      if (U.art) { U.art.want(list); paintInvite(); }
    }, function () { /* the shelves still show; pictures wait for the next visit */ });

    // The shelves, live. A watch that stops once they are shown keeps them and says so above them
    // until its next snapshot (V.liveError); before they are shown it says "Reconnecting…" while
    // the store retries, and only a refusal is an error, with Try again.
    var liveBox = U.h('div', { class: 'lib-live' }), shown = false;
    shelvesBox.parentNode.insertBefore(liveBox, shelvesBox);
    var stopShelves = U.store.shelves.watch(function (list) {
      if (!ctx.alive()) return;
      shown = true;
      U.clear(liveBox);
      var shelves = SH.order(list.filter(function (s) { return U.validId(s.__id) && SH.str(s.title) && SH.folders(s).length; }));
      U.clear(shelvesBox);
      if (!shelves.length && U.rt.savedLate()) { shelvesBox.appendChild(V.savedLate('your shelves')); return; }
      if (!shelves.length) { shelvesBox.appendChild(U.h('p', { class: 'muted' }, 'No shelves yet. Courses arrive here as they are built.')); return; }
      shelves.forEach(function (s) {
        var f = SH.folders(s);
        shelvesBox.appendChild(SH.card('#/shelf/' + encodeURIComponent(s.__id), SH.str(s.title), SH.str(s.blurb), (f.length === 1 ? '1 folder' : f.length + ' folders') + ' · ' + SH.counts(SH.allCourses(s))));
      });
    }, function (e, info) {
      if (!ctx.alive()) return;
      if (shown) { if (!info || !info.retrying) U.clear(liveBox).appendChild(V.liveError('Your shelves', e)); return; }
      U.clear(shelvesBox).appendChild(V.loadError('Your shelves', e, V.reconnecting(e, info)));
    });
    return function () { stopShelves(); stopTopics(); offPrefs(); };
  }, { tab: 'library', title: 'Your library', screen: 'library' });
})();
