// Settings: U.settings.open() shows a sheet with appearance, text size, easier reading,
// daily reviews, research status, a full backup and the build id. Every change applies at once,
// is mirrored to localStorage 'mu-prefs' (read before first paint by head.html) and saved to the
// profile in the db (docs/ARCHITECTURE.md section 4: profile.prefs).
(function () {
  'use strict';

  var THEMES = [['light', 'Light'], ['dark', 'Dark'], ['system', 'Match system']];
  var SIZES = [['s', 'Small text'], ['m', 'Medium text'], ['l', 'Large text'], ['xl', 'Extra large text']];
  var CAPS = [10, 15, 20, 30];
  var LAYOUTS = [['auto', 'Auto'], ['phone', 'Phone'], ['laptop', 'Laptop']];

  function defaults() { return U.store.profile.defaults().prefs; }
  function clean(p) {
    var d = defaults(), o = Object.assign({}, d, p || {});
    if (['light', 'dark', 'system'].indexOf(o.theme) < 0) o.theme = d.theme;
    if (['s', 'm', 'l', 'xl'].indexOf(o.size) < 0) o.size = d.size;
    o.easy = !!o.easy; o.light = !!o.light;
    o.cap = Number(o.cap) || d.cap;
    return o;
  }

  var S = (U.settings = {
    prefs: clean(),
    _localAt: 0,

    readLocal: function () {
      try { var s = JSON.parse(localStorage.getItem('mu-prefs') || 'null'); return s && typeof s === 'object' ? s : null; } catch (e) { return null; }
    },

    // Apply prefs to the page now and mirror them for the next first paint.
    apply: function (prefs) {
      var p = clean(prefs), d = document.documentElement;
      S.prefs = p;
      d.setAttribute('data-mu-theme', p.theme);
      d.setAttribute('data-size', p.size);
      if (p.easy) d.setAttribute('data-easy', '1'); else d.removeAttribute('data-easy');
      try { localStorage.setItem('mu-prefs', JSON.stringify(p)); } catch (e) { /* storage blocked: fine */ }
      U.emit('prefs', p);
      return p;
    },

    // Change one pref: apply instantly, then save to the profile.
    set: function (key, value) {
      var next = Object.assign({}, S.prefs);
      next[key] = value;
      S.apply(next);
      S._localAt = Date.now();
      var patch = { prefs: {} };
      patch.prefs[key] = S.prefs[key];
      var saved = U.store.profile.patch(patch).catch(function () { /* the store already told Dan */ });
      if ((key === 'cap' || key === 'light') && U.review && U.review.refreshBadge) {
        saved.then(function () { try { U.review.refreshBadge(); } catch (e) { console.error(e); } });
      }
      return saved;
    },

    // Prefs that arrive from the db (another device). Ignored briefly after a local change so a
    // slower snapshot cannot undo what Dan just picked.
    fromProfile: function (prefs) {
      if (Date.now() - S._localAt < 3000 || !prefs) return;
      var p = clean(prefs), cur = S.prefs;
      if (p.theme !== cur.theme || p.size !== cur.size || p.easy !== cur.easy || p.cap !== cur.cap || p.light !== cur.light) S.apply(p);
    },

    // Everything Dan has, as one JSON document.
    backup: function () {
      function strip(d) { if (!d) return d; var c = Object.assign({}, d); delete c.__id; return c; }
      function stripMap(m) { var o = {}; Object.keys(m || {}).forEach(function (k) { o[k] = strip(m[k]); }); return o; }
      return U.store.topics.list().then(function (topics) {
        return Promise.all(topics.map(function (t) {
          var tid = t.__id || t.id;
          var keys = ['topic'].concat((Array.isArray(t.ideas) ? t.ideas : []).map(function (i) { return i.id; }));
          return Promise.all([
            U.store.lesson.list(tid).catch(function () { return []; }),
            Promise.all(keys.map(function (k) { return U.store.research.get(tid, k).then(function (d) { return d ? [k, d] : null; }, function () { return null; }); })),
          ]).then(function (r) {
            var lessons = {}, research = {};
            r[0].forEach(function (l) { lessons[l.__id] = strip(l); });
            r[1].filter(Boolean).forEach(function (x) { research[x[0]] = x[1]; });
            return { tid: tid, lessons: lessons, research: research };
          });
        })).then(function (per) {
          return Promise.all([U.store.progress.all(), U.store.cards.all(), U.store.profile.get()]).then(function (r) {
            var lessons = {}, research = {};
            per.forEach(function (x) { lessons[x.tid] = x.lessons; research[x.tid] = x.research; });
            return {
              app: 'My University', kind: 'backup', version: 1, build: U.BUILD, exportedAt: U.now(),
              topics: topics.map(strip), lessons: lessons, research: research,
              progress: stripMap(r[0]), cards: stripMap(r[1]), profile: r[2],
            };
          });
        });
      });
    },

    open: function () {
      if (S._sheet && S._sheet.el.isConnected) return S._sheet; // already open
      var p = S.prefs;

      // A row of radio buttons that behaves like a segmented control.
      function seg(label, opts, value, onPick, cls) {
        var btns = opts.map(function (o) {
          return U.h('button', { class: 'seg-btn', type: 'button', role: 'radio', 'aria-checked': String(o.value === value), 'aria-label': o.aria || null, dataset: { v: String(o.value) }, on: { click: function () {
            btns.forEach(function (b) { b.setAttribute('aria-checked', String(b === this)); }, this);
            onPick(o.value);
          } } }, o.label);
        });
        return U.h('div', { class: 'seg' + (cls ? ' ' + cls : ''), role: 'radiogroup', 'aria-label': label }, btns);
      }
      function toggle(title, text, checked, onChange, name) {
        var id = U.id('sw');
        return U.h('label', { class: 'set-switch', for: id },
          U.h('span', { class: 'set-switch-text' }, U.h('strong', null, title), U.h('span', { class: 'muted small' }, text)),
          U.h('input', { class: 'switch', type: 'checkbox', role: 'switch', id: id, name: name, checked: !!checked, on: { change: function (e) { onChange(e.target.checked); } } }));
      }
      function group(title, children, note) {
        return U.h('section', { class: 'set-group' }, U.h('h3', { class: 'set-h' }, title), note ? U.h('p', { class: 'muted small set-note' }, note) : null, children);
      }

      var research = U.h('div', { class: 'set-research' }, U.h('p', { class: 'muted' }, 'Checking…'));
      function checkResearch(fresh) {
        if (fresh && U.research.reset) U.research.reset();
        U.clear(research).appendChild(U.h('p', { class: 'muted' }, 'Checking…'));
        U.research.available().then(function (ok) {
          U.clear(research);
          if (ok) {
            research.appendChild(U.h('p', { class: 'set-ok' }, U.icon('tick'), U.h('span', null, U.h('strong', null, 'Connected. '), 'New topics are checked against real sources, with quotes you can open.')));
          } else {
            research.appendChild(U.h('p', null, U.h('strong', null, 'Not connected. '), 'Lessons still work, but they are marked as not source-checked.'));
            research.appendChild(U.h('ol', { class: 'set-steps small' },
              U.h('li', null, 'In Claude, open Settings, then Connectors.'),
              U.h('li', null, 'Connect Parallel Search.'),
              U.h('li', null, 'Come back here and check again.')));
            research.appendChild(U.h('button', { class: 'linkish', type: 'button', on: { click: function () { checkResearch(true); } } }, 'Check again'));
          }
        }, function () { U.clear(research).appendChild(U.h('p', { class: 'muted' }, 'Could not check just now.')); });
      }
      checkResearch(false);

      var backupBtn = U.h('button', { class: 'btn secondary small', type: 'button', on: { click: function () {
        backupBtn.disabled = true; backupBtn.textContent = 'Preparing…';
        S.backup().then(function (data) {
          return U.saveFile('my-university-backup-' + U.today() + '.json', JSON.stringify(data, null, 2), 'application/json');
        }).then(function (ok) {
          if (ok) U.toast('Backup saved.', { kind: 'good' });
        }, function (e) { U.toast('Could not make the backup: ' + U.errText(e), { kind: 'bad' }); }).then(function () {
          backupBtn.disabled = false; backupBtn.textContent = 'Save a backup';
        });
      } } }, 'Save a backup');

      // Layout is per device (U.layout, localStorage only), so it is not one of the prefs.
      function layoutNote() {
        var eff = U.layout.effective();
        return (U.layout.pref() === 'auto' ? 'Auto picks for this screen: the ' + eff + ' layout here. ' : '') + 'Saved on this device only.';
      }
      var layoutNoteEl = U.h('p', { class: 'muted small set-note set-layout-note' }, layoutNote());
      var layoutGroup = U.layout ? group('Layout', [
        seg('Layout', LAYOUTS.map(function (l) { return { value: l[0], label: l[1] }; }), U.layout.pref(), function (v) {
          U.layout.set(v);
          layoutNoteEl.textContent = layoutNote();
        }, 'seg-layout'),
        layoutNoteEl,
      ]) : null;
      var offLayout = U.on('layout', function () { layoutNoteEl.textContent = layoutNote(); });

      var body = U.h('div', { class: 'set' },
        group('Appearance', seg('Appearance', THEMES.map(function (t) { return { value: t[0], label: t[1] }; }), p.theme, function (v) { S.set('theme', v); })),
        group('Text size', [
          seg('Text size', SIZES.map(function (s, i) { return { value: s[0], label: U.h('span', { class: 'seg-aa seg-aa-' + i, 'aria-hidden': 'true' }, 'Aa'), aria: s[1] }; }), p.size, function (v) { S.set('size', v); }, 'seg-size'),
          U.h('p', { class: 'reading set-preview' }, 'Tides rise and fall twice a day because the Moon pulls on the oceans.'),
          toggle('Easier reading', 'A very clear typeface with a little more space between letters.', p.easy, function (v) { S.set('easy', v); }, 'easy'),
        ]),
        layoutGroup,
        group('Daily reviews', [
          seg('Most reviews in a day', CAPS.map(function (c) { return { value: c, label: String(c) }; }), p.cap, function (v) { S.set('cap', v); }),
          toggle('Light days', 'Just 5 reviews a day until you turn this off. For busy or tired weeks.', p.light, function (v) { S.set('light', v); }, 'light'),
        ], 'The most reviews Today will offer in one day.'),
        group('Research', research),
        group('Backup', backupBtn, 'Save a copy of everything: topics, lessons, sources, your answers, review cards and settings.'),
        U.h('p', { class: 'set-build muted small' }, 'Build ' + U.BUILD));

      S._sheet = U.sheet({ title: 'Settings', body: body, autofocus: false, onClose: function () { S._sheet = null; offLayout(); } });
      return S._sheet;
    },
  });
})();
