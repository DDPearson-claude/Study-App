// Boot: runs last. Wires the settings button, waits for the runtime (U.rt.ready, which every
// bridge call bounds at 10 s), starts the hash router at once (the device's reading settings were
// already applied before first paint by head.html; the db copy is loaded in the background and
// applied when it arrives), warns once when progress cannot be kept, starts the Today badge, and
// counts study minutes while the page is visible and in use.
// Exposes U.boot.study for tests. Contract: docs/ARCHITECTURE.md sections 3, 4 and 10.
(function () {
  'use strict';
  var B = (U.boot = U.boot || {});

  // ---------- study time ----------
  // Every TICK, if the page is visible and Dan touched, typed or scrolled within IDLE, the tick
  // counts as active. Each CHUNK of active time is logged as 2 minutes with U.logStudy.
  var study = B.study = {
    TICK: 15000, IDLE: 120000, CHUNK: 120000,
    active: 0, lastInput: Date.now(), lastTick: Date.now(), timer: null,
    poke: function () { study.lastInput = Date.now(); },
    tick: function (now) {
      now = now || Date.now();
      var dt = Math.max(0, Math.min(now - study.lastTick, study.TICK * 2)); // a sleeping phone does not count
      study.lastTick = now;
      if (document.visibilityState === 'visible' && now - study.lastInput <= study.IDLE) study.active += dt;
      while (study.active >= study.CHUNK) {
        study.active -= study.CHUNK;
        Promise.resolve().then(function () { return U.logStudy(study.CHUNK / 60000); }).catch(function (e) { console.error('logStudy', e); });
      }
    },
    // Playing with an interactive counts too: its taps and drags happen inside the sandboxed frame
    // and never reach this document, but the kit reports each change Dan makes ({src:'kit',
    // type:'change'}). Only frames on screen count (.kit-iframe), never the hidden self-test frames.
    fromKit: function (e) {
      var d = e.data;
      if (!d || typeof d !== 'object' || d.src !== 'kit' || d.type !== 'change' || !e.source) return;
      var frames = document.querySelectorAll('iframe.kit-iframe');
      for (var i = 0; i < frames.length; i++) if (frames[i].contentWindow === e.source) { study.poke(); return; }
    },
    start: function () {
      if (study.timer) return;
      ['pointerdown', 'keydown', 'wheel', 'touchstart', 'input', 'scroll'].forEach(function (evt) {
        document.addEventListener(evt, study.poke, { passive: true, capture: true });
      });
      window.addEventListener('message', study.fromKit);
      document.addEventListener('visibilitychange', function () {
        study.lastTick = Date.now();
        if (document.visibilityState === 'visible') study.poke();
      });
      study.lastTick = Date.now();
      study.timer = setInterval(function () { study.tick(); }, study.TICK);
    },
  };

  // ---------- reading settings ----------
  // The db profile is the durable copy. On a first visit (no profile yet) the per-device copy
  // in localStorage wins and is saved to the profile. A setting Dan changed while the app was
  // opening wins over the profile's (its own save is on the way).
  function loadPrefs() {
    if (!U.settings) return Promise.resolve();
    var S = U.settings;
    return U.store.getDoc(U.store.paths.profile()).then(function (doc) {
      if (doc && doc.prefs) S.apply(Object.assign({}, doc.prefs, S._picked));
      else {
        var local = S.readLocal();
        S.apply(Object.assign({}, local || {}, S._picked));
        if (local || Object.keys(S._picked).length) {
          S._localAt = Date.now(); // the profile snapshot may arrive before this write
          U.store.profile.patch({ prefs: S.prefs }).catch(function () {});
        }
      }
    }).catch(function (e) {
      console.warn('prefs', e);   // the device's copy stays (U.settings starts from it)
    }).then(function () {
      // Changes from Dan's other devices. Started even when the read failed, so the profile still
      // arrives once the db answers; a profile that does not exist yet says nothing.
      B.stopProfile = U.store.watchDoc(U.store.paths.profile(), function (d) { if (d && d.prefs) S.fromProfile(d.prefs); });
    });
  }

  // ---------- one-line notice when nothing will be kept ----------
  function persistNotice() {
    if (U.store.persistent()) return;
    try { if (sessionStorage.getItem('mu-notice-persist') === '1') return; } catch (e) { /* fine */ }
    var view = document.getElementById('view');
    if (!view || document.getElementById('persist-notice')) return;
    var box = U.h('div', { class: 'boot-notice', id: 'persist-notice', role: 'note' },
      U.h('div', { class: 'boot-notice-in' },
        U.h('span', null, 'Open this in the Claude app to keep your progress.'),
        U.h('button', { class: 'boot-notice-x', type: 'button', 'aria-label': 'Dismiss', on: { click: function () {
          box.remove();
          try { sessionStorage.setItem('mu-notice-persist', '1'); } catch (e) { /* fine */ }
        } } }, U.icon('close'))));
    view.parentNode.insertBefore(box, view);
  }

  function opening() {
    return U.h('div', { class: 'boot-opening', role: 'status' },
      U.h('p', { class: 'muted' }, 'Opening your university…'),
      U.h('div', { class: 'working' }));
  }

  function start() {
    var btn = document.getElementById('settings-btn');
    if (btn) {
      btn.setAttribute('aria-label', 'Settings');
      btn.addEventListener('click', function () {
        if (U.settings) U.settings.open(); else U.toast('Settings are not available in this build.');
      });
    }
    var view = document.getElementById('view');
    // Each screen announces itself through its h1 (focused on every route) and its own small live
    // regions; the whole view as one live region read every change out loud.
    if (view) view.removeAttribute('aria-live');
    if (view && !view.firstChild) view.appendChild(opening());

    U.rt.ready.then(function () {
      loadPrefs().catch(function (e) { console.error('prefs', e); });
      persistNotice();
      window.addEventListener('hashchange', function () { U._memHash = null; U._route(); });
      // In-app links ("#/...") route here (capture phase, before anything else sees the click),
      // so a viewer that handles link clicks itself can never send them anywhere else.
      document.addEventListener('click', function (e) {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var a = e.target && e.target.closest ? e.target.closest('a[href^="#/"]') : null;
        // The attribute, not .target: an SVG <a> (a Map dot) has an SVGAnimatedString there, which
        // is always truthy, so testing the property let every dot past the router.
        if (!a || a.hasAttribute('target')) return;
        e.preventDefault();
        U.go(a.getAttribute('href'));
      }, true);
      U._route();
      if (U.review && U.review.refreshBadge) {
        Promise.resolve().then(function () { return U.review.refreshBadge(); }).catch(function (e) { console.error('badge', e); });
      }
      study.start();
      B.ready = true;
      U.emit('booted');
    }).catch(function (e) { U.fail(view, e); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
