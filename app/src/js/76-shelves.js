// Ready-made courses: shelves of folders of courses (Dan, 7 Oct: "In the learn category, create
// a folder called Maths. Inside that folder are 6 folders… Inside that folder are the courses that
// make up that folder's entire content"). The shelves live in the db (shared docs shelves/{sid},
// 20-store.js S.shelves), so Claude's build sessions fill them in without a new version of the
// app: a course with a tid opens that topic; one without says it is not built yet.
//
//   #/library/courses                      the Library's Ready-made courses: every shelf (Maths…)
//   #/shelf/:sid                           a shelf: its folders
//   #/shelf/:sid/:fid                      a folder: its courses, in order
(function () {
  'use strict';
  var U = window.U, V = U.views;
  function arr(x) { return Array.isArray(x) ? x : []; }
  function isObj(x) { return !!x && typeof x === 'object' && !Array.isArray(x); }
  function str(x) { return typeof x === 'string' ? x.trim() : ''; }
  // Only what can be shown and linked to safely: ids the router accepts, plain text.
  function folders(shelf) {
    return arr(shelf && shelf.folders).filter(function (f) { return isObj(f) && U.validId(f.id) && str(f.title); });
  }
  function courses(folder) {
    return arr(folder && folder.courses).filter(function (c) { return isObj(c) && str(c.title); });
  }
  function built(c) { return U.validId(c.tid) ? c.tid : null; }
  function counts(list) {
    var n = list.length, b = list.filter(built).length;
    return (n === 1 ? '1 course' : n + ' courses') + ' · ' + (b === 0 ? 'none built yet' : b === n ? 'all built' : b + ' built');
  }
  function allCourses(shelf) { return folders(shelf).reduce(function (a, f) { return a.concat(courses(f)); }, []); }
  function order(list) { return list.slice().sort(function (a, b) { return (Number(a.order) || 99) - (Number(b.order) || 99) || String(a.title).localeCompare(String(b.title)); }); }
  function card(href, title, blurb, meta) {
    return U.h('a', { class: 'shelf-card', href: href },
      U.h('span', { class: 'shelf-ico', 'aria-hidden': 'true' }, U.icon('folder')),
      U.h('span', { class: 'shelf-body' },
        U.h('span', { class: 'shelf-title' }, title),
        blurb ? U.h('span', { class: 'shelf-blurb' }, blurb) : null,
        U.h('span', { class: 'shelf-meta' }, meta)),
      U.icon('arrow', 'shelf-go'));
  }
  function loadError(box, what, e) { U.clear(box).appendChild(V && V.loadError ? V.loadError(what, e, false) : U.h('p', { class: 'muted' }, what + ' could not be loaded just now.')); }

  // ---------- the Library's Ready-made courses ----------
  U.routes.add('#/library/courses', function (params, ctx) {
    var box = U.h('div', { class: 'shelf-grid' }, U.h('div', { class: 'skeleton', style: 'height:96px;border-radius:18px' }));
    ctx.view.appendChild(U.h('div', { class: 'shelf-page' },
      V.back('#/book', 'Library'),
      U.h('header', { class: 'page-head' },
        U.h('p', { class: 'eyebrow' }, 'Library'),
        U.h('h1', null, 'Ready-made courses'),
        U.h('p', { class: 'muted' }, 'Whole courses, built in full, to browse at your leisure.')),
      box));
    return U.store.shelves.watch(function (list) {
      if (!ctx.alive()) return;
      var shelves = order(list.filter(function (s) { return U.validId(s.__id) && str(s.title) && folders(s).length; }));
      U.clear(box);
      if (!shelves.length) { box.appendChild(U.h('p', { class: 'muted' }, 'None yet.')); return; }
      shelves.forEach(function (s) {
        var f = folders(s);
        box.appendChild(card('#/shelf/' + encodeURIComponent(s.__id), str(s.title), str(s.blurb), (f.length === 1 ? '1 folder' : f.length + ' folders') + ' · ' + counts(allCourses(s))));
      });
    }, function (e) { if (ctx.alive()) loadError(box, 'Ready-made courses', e); });
  }, { tab: 'book', title: 'Ready-made courses' });

  // ---------- a shelf, and one of its folders ----------
  function page(params, ctx) {
    var sid = params.sid, fid = params.fid || null;
    var box = U.h('div', { class: 'shelf-page' }, U.h('div', { class: 'skeleton', style: 'height:220px;border-radius:18px' }));
    ctx.view.appendChild(box);
    U.store.shelves.get(sid).then(function (shelf) {
      if (!ctx.alive()) return;
      if (!shelf || !folders(shelf).length) {
        U.clear(box).appendChild(V.empty({ h1: true, title: 'Not here', text: 'These ready-made courses are not here any more.', action: { href: '#/library/courses', label: 'Ready-made courses' } }));
        return;
      }
      var title = str(shelf.title);
      if (!fid) {
        U.setTitle(title);
        U.clear(box).append(V.back('#/library/courses', 'Ready-made courses'),
          U.h('header', { class: 'page-head' },
            U.h('p', { class: 'eyebrow' }, 'Ready-made courses'),
            U.h('h1', { tabindex: '-1' }, title),
            str(shelf.blurb) ? U.h('p', { class: 'muted' }, str(shelf.blurb)) : null),
          U.h('div', { class: 'shelf-grid' }, folders(shelf).map(function (f) {
            return card('#/shelf/' + encodeURIComponent(sid) + '/' + encodeURIComponent(f.id), str(f.title), str(f.blurb), counts(courses(f)));
          })));
        return;
      }
      var folder = folders(shelf).filter(function (f) { return f.id === fid; })[0];
      if (!folder) {
        U.clear(box).appendChild(V.empty({ h1: true, title: 'Not here', text: 'This folder is not in ' + title + ' any more.', action: { href: '#/shelf/' + encodeURIComponent(sid), label: 'Back to ' + title } }));
        return;
      }
      U.setTitle(str(folder.title) + ' · ' + title);
      U.clear(box).append(V.back('#/shelf/' + encodeURIComponent(sid), title),
        U.h('header', { class: 'page-head' },
          U.h('p', { class: 'eyebrow' }, title),
          U.h('h1', { tabindex: '-1' }, str(folder.title)),
          str(folder.blurb) ? U.h('p', { class: 'muted' }, str(folder.blurb)) : null,
          U.h('p', { class: 'muted small' }, counts(courses(folder)))),
        U.h('ol', { class: 'shelf-courses' }, courses(folder).map(function (c, i) {
          var tid = built(c);
          var inner = [
            U.h('span', { class: 'shelf-n', 'aria-hidden': 'true' }, String(i + 1)),
            U.h('span', { class: 'shelf-body' },
              U.h('span', { class: 'shelf-title' }, str(c.title)),
              str(c.blurb) ? U.h('span', { class: 'shelf-blurb' }, str(c.blurb)) : null,
              tid ? U.h('span', { class: 'shelf-ready' }, 'Ready to browse') : U.h('span', { class: 'shelf-meta' }, 'Not built yet')),
            tid ? U.icon('arrow', 'shelf-go') : null];
          return U.h('li', { class: tid ? 'is-built' : 'is-waiting' },
            tid ? U.h('a', { class: 'shelf-course', href: '#/t/' + encodeURIComponent(tid) }, inner) : U.h('div', { class: 'shelf-course' }, inner));
        })));
    }, function (e) { if (ctx.alive()) loadError(box, 'These courses', e); });
  }
  U.routes.add('#/shelf/:sid', page, { tab: 'book', title: 'Ready-made courses' });
  U.routes.add('#/shelf/:sid/:fid', page, { tab: 'book', title: 'Ready-made courses' });

  U.shelves = {};
})();
