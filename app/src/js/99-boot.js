// Boot: runs last. Wires the settings button, waits for the runtime (U.rt.ready: 10 s for each
// bridge call, up to 30 s for Dan's saved work, saying so plainly while it waits), starts the hash
// router at once (the device's reading settings were already applied before first paint by
// head.html; the db copy is loaded in the background and applied when it arrives), warns once
// when progress cannot be kept, starts the Today badge, and counts study minutes while the page is
// visible and in use. Saved work that arrives after the app opened is shown at once.
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
    start: function () {
      if (study.timer) return;
      ['pointerdown', 'keydown', 'wheel', 'touchstart', 'input', 'scroll'].forEach(function (evt) {
        document.addEventListener(evt, study.poke, { passive: true, capture: true });
      });
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
  // in localStorage wins and is saved to the profile.
  function loadPrefs() {
    if (!U.settings) return Promise.resolve();
    return U.store.getDoc(U.store.paths.profile()).then(function (doc) {
      if (doc && doc.prefs) U.settings.apply(doc.prefs);
      else {
        var local = U.settings.readLocal();
        U.settings.apply(local || {});
        if (local) {
          U.settings._localAt = Date.now(); // the profile snapshot may arrive before this write
          U.store.profile.patch({ prefs: U.settings.prefs }).catch(function () {});
        }
      }
      B.stopProfile = U.store.profile.watch(function (p) { U.settings.fromProfile(p && p.prefs); });
    });
  }

  // ---------- one-line notice when nothing will be kept ----------
  // Two cases, said plainly: saved work still on its way (U.rt.savedLate), or none in this view.
  function persistNotice() {
    var old = document.getElementById('persist-notice');
    if (U.store.persistent()) { if (old) old.remove(); return; }
    var kind = U.rt.savedLate() ? 'late' : 'none';
    if (old) { if (old.getAttribute('data-kind') === kind) return; old.remove(); }
    if (kind === 'none') try { if (sessionStorage.getItem('mu-notice-persist') === '1') return; } catch (e) { /* fine */ }
    var view = document.getElementById('view');
    if (!view) return;
    var box = U.h('div', { class: 'boot-notice', id: 'persist-notice', role: 'note', 'data-kind': kind },
      U.h('div', { class: 'boot-notice-in' },
        U.h('span', null, kind === 'late'
          ? 'Your saved work has not loaded yet, so what you do now may not be kept. It will appear here as soon as it arrives.'
          : 'Open this in the Claude app to keep your progress.'),
        U.h('button', { class: 'boot-notice-x', type: 'button', 'aria-label': 'Dismiss', on: { click: function () {
          box.remove();
          if (kind === 'none') try { sessionStorage.setItem('mu-notice-persist', '1'); } catch (e) { /* fine */ }
        } } }, U.icon('close'))));
    view.parentNode.insertBefore(box, view);
  }

  // Saved work that arrived after the app opened: the screen is drawn again from it, the reading
  // settings and the Today badge reload, and the notice goes (or says what is still missing).
  B.persistent = false;
  U.on('rt-late', function (name) {
    if (!B.ready) return;
    var now = U.store.persistent();
    if ((name === 'db' && U.rt.db) || (name === 'uid' && U.rt.uid)) {
      if (B.stopProfile) { try { B.stopProfile(); } catch (e) { /* gone */ } B.stopProfile = null; }
      loadPrefs().catch(function (e) { console.error('prefs', e); });
      U._route();
      refreshBadge();
      if (now && !B.persistent) U.toast('Your saved work has loaded.', { kind: 'good' });
    }
    B.persistent = now;
    persistNotice();
  });
  function refreshBadge() {
    if (U.review && U.review.refreshBadge) {
      Promise.resolve().then(function () { return U.review.refreshBadge(); }).catch(function (e) { console.error('badge', e); });
    }
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
    // Only Dan's saved work keeps boot waiting past 10 s (U.rt.ready): say that it is the slow part.
    var slow = setTimeout(function () {
      var line = view && view.querySelector('.boot-opening p');
      if (line && !B.ready) line.textContent = 'Your saved work is taking longer than usual to load. Still waiting for it…';
    }, U.rt.TIMEOUT_MS + 1000);

    U.rt.ready.then(function () {
      clearTimeout(slow);
      B.persistent = U.store.persistent();
      loadPrefs().catch(function (e) { console.error('prefs', e); });
      persistNotice();
      window.addEventListener('hashchange', function () { U._memHash = null; U._route(); });
      // In-app links ("#/...") route here (capture phase, before anything else sees the click),
      // so a viewer that handles link clicks itself can never send them anywhere else.
      document.addEventListener('click', function (e) {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var a = e.target && e.target.closest ? e.target.closest('a[href^="#/"]') : null;
        if (!a || a.target) return;
        e.preventDefault();
        U.go(a.getAttribute('href'));
      }, true);
      U._route();
      refreshBadge();
      study.start();
      B.ready = true;
      U.emit('booted');
    }).catch(function (e) { U.fail(view, e); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
