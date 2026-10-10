// Kit host: runs model-written interactive bodies in sandboxed srcdoc iframes on top of the house
// kit (app/kit), sizes each frame to its content, and self-tests bodies in hidden frames.
// Contract: docs/ARCHITECTURE.md sections 6 and 9. The frame never gets allow-same-origin, so a
// body cannot reach the app or its storage; a Content-Security-Policy (the first thing in every
// srcdoc) blocks the requests a page makes (fetch, images, styles, frames, forms), but not the frame
// navigating itself away. So a frame that starts to leave its page is removed at once, and a
// message is trusted only when it comes from that frame's own window and carries the frame's
// token (a random value in its srcdoc that a page it was navigated to cannot know). Error text that
// comes from a frame (onError, report errors) is for logs and repair prompts only: the app shows
// fixed wording, never the frame's own words. A page can also stop being the kit without
// leaving (document.open() wipes the kit's listeners, and a page it then navigates to may never
// finish loading), so the host pings every mounted frame and removes one that stops answering.
//
//   U.sandbox.srcdoc(body, {theme, token, quiz}) -> string
//   U.sandbox.mount(container, {html, title, onReady, onError, onChange, onComplete, minHeight, loading, quiz, theme}) ->
//     { el, frame, ready, selftest(), get(), set(id, value), press(label?), inputs(), reach(spec), theme(t),
//       quiz(hide), reveal(), destroy() }
//       set() counts as a move (it reveals the body's .k-after-move parts), and takes a slider value,
//       a choice's option value, label or 0-based index, or a toggle's true/false.
//       press(label?) presses a K.button (or starts a K.anim) by label, or the first one.
//       inputs() -> {inputs:[{id, kind, label, min?, max?, step?, options?, value}], actions:[labels]}
//       quiz: {hide: '<output id>'} mounts it in quiz mode (a target check Dan is answering): the
//       kit shows that readout as "?", hides the .say line and any plot or bar label giving its
//       value; get() and onChange still carry the real outputs. reveal() (or quiz(null)) ends it.
//       theme: a function returning the K_THEME to use (asked again on every theme or size change).
//   U.sandbox.test(html, {widths:[340, 720, 1040], timeout:8000}) -> Promise<Report>   hidden, merged
//   U.sandbox.reach(mounted | html, {control, output, target, tolerance, decimals?}) ->
//       Promise<{reachable, exact, best:{value, output} | null, tried, error?}>
//     Can moving that one control (every setting it has, every option of a choice; the others at
//     their opening values) bring the output within tolerance of the target? exact: some setting
//     shows the target exactly at `decimals` (else as the page's readout rounds it). For lesson
//     target checks. Given html it runs in a hidden frame; given a mounted frame it uses that one.
//   U.sandbox.theme() -> {dark, size, c:{...}}
U.KIT_JS = "@@KIT_JS@@";
U.KIT_CSS = "@@KIT_CSS@@";

U.sandbox = (function () {
  var MAX_BYTES = 150 * 1024;
  // No network from a body: no fetch/XHR/beacon/WebSocket, no images, fonts, media, frames,
  // forms or <base> from anywhere; only the inline kit, styles and scripts. data: images stay.
  var CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:; " +
    "connect-src 'none'; form-action 'none'; base-uri 'none'";
  // Dan's palettes, used when the app's CSS variables can't be read. The kit owns its data
  // colours (highlighter, fills, categorical), tuned per theme, so they are not passed here.
  var FALLBACK = {
    light: { bg: '#FFFFFF', panel: '#F7F5F0', sunk: '#EFEBE3', ink: '#1F2937', muted: '#5B6573', line: '#DED8CC', strong: '#B9B1A3', accent: '#0F6B66', accent2: '#17324D', onAccent2: '#F7F5F0', warn: '#9F3038', good: '#2E7D4F', amber: '#FFF1CC' },
    dark: { bg: '#1A2029', panel: '#12161C', sunk: '#232A35', ink: '#E7E4DD', muted: '#A9B1BC', line: '#2C3440', strong: '#4A5564', accent: '#6CC7BD', accent2: '#BBD0E6', onAccent2: '#12161C', warn: '#F2A6AC', good: '#6FCB94', amber: '#3A3016' },
  };
  // Kit palette name -> app token. The interactive sits on a card, so its page is --surface.
  var TOKENS = { bg: '--surface', panel: '--bg', sunk: '--sunk', ink: '--ink', muted: '--muted', line: '--line', strong: '--line-strong', accent: '--teal', accent2: '--heading', onAccent2: '--on-heading', warn: '--red', good: '--green', amber: '--amber' };

  // Whether the app is showing its dark palette, by the same rule as 00-tokens.css: Dark chosen,
  // or Match system with the viewer dark (data-theme="dark" from the host page, else the OS
  // setting unless the host says light). Not the computed color-scheme: the Claude app's webview
  // reports the phone's dark scheme there even when the app is light, and the kit then painted
  // its dark highlighter on a light card.
  function isDark() {
    var d = document.documentElement, attr = function (n) { return d.getAttribute ? d.getAttribute(n) : null; };
    var mu = attr('data-mu-theme'), host = attr('data-theme');
    if (mu === 'dark') return true;
    if (mu !== 'system') return false;
    if (host === 'dark') return true;
    if (host === 'light') return false;
    try { return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches); } catch (e) { return false; }
  }

  // The app's current palette for the kit: {dark, size, c:{bg, panel, ..., amber}}.
  function theme() {
    var cs = getComputedStyle(document.documentElement);
    var dark = isDark();
    var base = FALLBACK[dark ? 'dark' : 'light'], c = {};
    Object.keys(TOKENS).forEach(function (k) { c[k] = cs.getPropertyValue(TOKENS[k]).trim() || base[k]; });
    // Reading size (Aa setting): the app's 18px default maps to the kit's 16px, so L and XL give 18
    // and 20.
    return { dark: dark, size: Math.max(16, Math.round(readingPx(cs) * 0.9)), c: c };
  }
  // --fs in px. A custom property comes back as written ("1.125rem"), not in px, so a rem or em
  // value is scaled by the root's font size, which is what the Text size setting changes.
  function readingPx(cs) {
    var v = String(cs.getPropertyValue('--fs') || '').trim(), n = parseFloat(v);
    if (!(n > 0)) return 18;
    return /r?em$/i.test(v) ? n * (parseFloat(cs.fontSize) || 16) : n;
  }

  function byteLength(s) { try { return new TextEncoder().encode(s).length; } catch (e) { return s.length * 2; } }
  function tooBig(body) {
    var n = byteLength(String(body || ''));
    return n > MAX_BYTES ? 'The interactive is too large (' + Math.round(n / 1024) + ' KB; the limit is ' + (MAX_BYTES / 1024) + ' KB).' : null;
  }
  // JSON that is safe inside an inline <script>.
  function inlineJson(v) { return JSON.stringify(v).replace(/</g, '\\u003c'); }
  // A fresh random token for one frame (its kit signs every message with it).
  function newToken() {
    try {
      var a = new Uint32Array(4);
      crypto.getRandomValues(a);
      return Array.prototype.map.call(a, function (x) { return x.toString(36); }).join('');
    } catch (e) { return Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2); }
  }

  // A timeout on a clock that only runs while the app is visible and awake: time with the page
  // hidden doesn't count, and nor does the gap when the device suspended it (a tick that arrives
  // far later than scheduled counts as one tick). So a late timer never fails anything by itself.
  // -> {cancel()}
  var TICK = 250;
  function visibleTimeout(fn, ms) {
    var used = 0, last = Date.now(), id = 0, done = false;
    function tick() {
      if (done) return;
      var t = Date.now(), gap = t - last;
      last = t;
      if (document.visibilityState !== 'hidden') used += Math.min(gap, TICK * 2);
      if (used >= ms) { done = true; fn(); return; }
      id = setTimeout(tick, Math.max(10, Math.min(TICK, ms - used)));
    }
    id = setTimeout(tick, Math.max(10, Math.min(TICK, ms)));
    return { cancel: function () { done = true; clearTimeout(id); } };
  }
  function cancel(t) { if (t && t.cancel) t.cancel(); }

  // The full document for one body: CSP first, then kit CSS, theme (and the frame's token and
  // quiz: the output it opens with hidden, so the value never shows before the host's 'quiz'
  // message lands), kit JS, then the body. Throws {code:'too_large'}.
  function srcdoc(body, o) {
    o = o || {};
    body = String(body || '');
    var big = tooBig(body);
    if (big) throw { code: 'too_large', message: big };
    var head = '<!doctype html><html lang="en"><head>' +
      '<meta http-equiv="Content-Security-Policy" content="' + CSP + '">' +
      '<meta http-equiv="x-dns-prefetch-control" content="off">' +
      '<meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<style>' + U.KIT_CSS + '</style>' +
      '<script>window.K_THEME=' + inlineJson(o.theme || theme()) + ';window.K_BODY_LINE=@@LINE@@;window.K_TOKEN=' + inlineJson(String(o.token || '')) +
        ';window.K_QUIZ=' + inlineJson(o.quiz ? String(o.quiz) : null) + ';</' + 'script>' +
      '<script>' + U.KIT_JS + '</' + 'script></head><body>\n';
    // Error line numbers are reported relative to the body (the kit counts from this line).
    var line = head.split('\n').length;
    return head.replace('@@LINE@@', String(line)) + body + '\n</body></html>';
  }

  // ---------- messages ----------
  // One window listener; each live frame registers a handler keyed by its contentWindow. A message
  // without the frame's token (from a page the frame was navigated to) is dropped.
  var live = [];
  var listening = false;
  function listen() {
    if (listening) return;
    listening = true;
    window.addEventListener('message', function (ev) {
      var d = ev.data;
      if (!d || typeof d !== 'object' || d.src !== 'kit' || !ev.source) return;
      for (var i = 0; i < live.length; i++) {
        if (live[i].frame.contentWindow === ev.source) { if (d.tok === live[i].token) live[i].handle(d); return; }
      }
    });
  }
  // Mounted frames whose element was removed without destroy() (e.g. the router cleared the view).
  function prune() {
    live.slice().forEach(function (e) { if (e.gone && !e.frame.isConnected) e.gone(); });
  }
  // A frame's channel: request(type, data) -> Promise of the reply with the same rid.
  // token: the one in the frame's srcdoc. onGone (mounted frames only) runs when the frame is
  // found detached from the page. heard() counts the messages the kit has sent (each one carries
  // the token, so only the kit, while its page is the one in the frame, can add to it).
  function channel(frame, token, onMessage, onGone) {
    var pending = {}, seq = 0;
    var entry = {
      frame: frame,
      token: token,
      gone: onGone || null,
      heard: 0,
      handle: function (d) {
        entry.heard++;
        if (d.rid && pending[d.rid]) {
          var p = pending[d.rid];
          delete pending[d.rid];
          cancel(p.timer);
          if (d.type === 'error') p.reject({ code: 'kit_error', message: d.message });
          else p.resolve(d);
          return;
        }
        onMessage(d);
      },
    };
    live.push(entry);
    listen();
    return {
      request: function (type, data, ms) {
        return new Promise(function (resolve, reject) {
          var w = frame.contentWindow;
          if (!w) return reject({ code: 'gone', message: 'The interactive is no longer on the page.' });
          var rid = 'r' + (++seq);
          var msg = Object.assign({ src: 'kit', type: type, rid: rid }, data || {});
          pending[rid] = { resolve: resolve, reject: reject, timer: visibleTimeout(function () {
            delete pending[rid];
            reject({ code: 'timeout', message: 'The interactive did not answer in time.' });
          }, ms || 4000) };
          w.postMessage(msg, '*');
        });
      },
      send: function (type, data) { var w = frame.contentWindow; if (w) w.postMessage(Object.assign({ src: 'kit', type: type }, data || {}), '*'); },
      heard: function () { return entry.heard; },
      close: function () {
        live = live.filter(function (e) { return e !== entry; });
        Object.keys(pending).forEach(function (rid) {
          cancel(pending[rid].timer);
          pending[rid].reject({ code: 'gone', message: 'The interactive was closed.' });
        });
        pending = {};
      },
    };
  }
  // Requests every frame api shares (mounted and hidden).
  function requests(ch) {
    return {
      get: function () { return ch.request('get').then(function (d) { return { params: d.params, outputs: d.outputs }; }); },
      set: function (id, value) { return ch.request('set', { id: id, value: value }).then(function (d) { return { params: d.params, outputs: d.outputs }; }); },
      press: function (label) { return ch.request('press', { label: label || '' }).then(function (d) { return { params: d.params, outputs: d.outputs }; }); },
      inputs: function () { return ch.request('inputs').then(function (d) { return { inputs: d.inputs || [], actions: d.actions || [] }; }); },
      reach: function (spec) {
        spec = spec || {};
        var dp = Number(spec.decimals);
        return ch.request('reach', { control: String(spec.control || ''), output: String(spec.output || ''), target: Number(spec.target), tolerance: Math.abs(Number(spec.tolerance)) || 0,
          decimals: spec.decimals != null && spec.decimals !== '' && isFinite(dp) && dp >= 0 ? Math.min(12, Math.round(dp)) : null }, 10000)
          .then(function (d) { return d.result; });
      },
    };
  }

  // ---------- mount ----------
  // mount(container, {html, title, onReady(checks, {beside}), onError(msg), onChange(state), onComplete(), minHeight, loading, quiz})
  //   -> {el, frame, ready: Promise<checks|null>, selftest(), get(), set(id, value), press(label), inputs(), reach(spec), theme(t),
  //       quiz(hide), reveal(), destroy()}
  // ready resolves with the kit's check results, or null if K.ready() never arrives (12 s).
  // onReady's beside is true when the page has a K.stage that sets its controls beside the visual
  // in a wide frame: only then does the interactive gain from more than a reading column.
  // onChange({params, outputs}) follows Dan's changes (debounced). onError(msg) carries the frame's
  // own text: log it, never show it. loading:false hides the built-in loading line, for callers
  // that draw their own cover. quiz: {hide: output id} (section 6, "Quiz mode"). onComplete()
  // follows the page's K.complete() (Dan finished its puzzles); it may come more than once.
  //
  // Heartbeat: every PING_MS the host pings the frame, and anything the kit says (a pong, a
  // height, a change), signed with the frame's token, counts as an answer. A frame that has
  // answered and then misses MISSES pings in a row (MISSES x PING_MS of silence, at least) is no
  // longer the kit (document.open() wiped it, or a page it navigated to has replaced it) and is
  // removed, like one that leaves. A page busy with a long computation still answers between its
  // tasks, so only a page frozen for seconds on end is taken out. One that has never said anything
  // gets FIRST_MS (the time K.ready() is waited for) and is removed, never shown. The clock runs
  // only while the app is visible (visibleTimeout).
  var PING_MS = 2000, MISSES = 2, FIRST_MS = 12000;
  var SILENT = 'The interactive stopped answering, so it was closed.';
  function mount(container, o) {
    o = o || {};
    // o.theme: a function giving the K_THEME to use instead of the app's (the dossier's paper
    // plates); it is asked again whenever the app's theme or text size changes.
    var themeOf = typeof o.theme === 'function' ? o.theme : theme;
    var minHeight = Math.max(120, o.minHeight || 320);
    var wrap = U.h('div', { class: 'kit-frame', dataset: { state: 'loading' } });
    var frame = U.h('iframe', {
      class: 'kit-iframe', sandbox: 'allow-scripts', title: o.title || 'Interactive',
      referrerpolicy: 'no-referrer', allow: 'autoplay', style: { height: minHeight + 'px' },
    });
    var loading = U.h('div', { class: 'kit-loading', role: 'status' },
      U.h('div', { class: 'working', 'aria-hidden': 'true' }),
      U.h('span', { class: 'muted small' }, 'Setting up the interactive…'));
    if (o.loading === false) loading.hidden = true;
    wrap.appendChild(loading);
    wrap.appendChild(frame);

    var resolveReady, readyDone = false, revealTimer = 0, destroyed = false, seenErrors = [], loads = 0, kitWindow = null;
    var token = newToken();
    var ready = new Promise(function (r) { resolveReady = r; });
    // Quiz mode: the output the kit hides, sent after every ready (a frame moved in the page loads
    // the kit again from its srcdoc) until reveal(). quizUsed: this mount has a quiz to keep.
    var quiz = o.quiz && o.quiz.hide != null && o.quiz.hide !== '' ? String(o.quiz.hide) : null, quizUsed = quiz !== null;
    function settle(v) { if (!readyDone) { readyDone = true; resolveReady(v); } }
    function uncover() {
      if (wrap.dataset.state === 'live') return;
      wrap.dataset.state = 'live';
      loading.remove();
    }
    function report(msg) {
      if (seenErrors.indexOf(msg) >= 0) return;
      seenErrors.push(msg);
      if (o.onError) try { o.onError(String(msg || 'error')); } catch (e) { console.error(e); }
    }
    // A body that navigates its frame away from the kit, or a frame that stops answering: the frame
    // is removed, so a page it lands on (no CSP of its own) is never left in the lesson.
    function stop(msg) {
      if (destroyed) return;
      report(msg);
      api.destroy();
    }
    function leave() { stop('The interactive tried to leave its page, so it was stopped.'); }
    function sendQuiz() { if (quizUsed && !destroyed) ch.send('quiz', { hide: quiz }); }
    prune();
    var ch = channel(frame, token, function (d) {
      if (d.type === 'leaving') {
        leave();
      } else if (d.type === 'height' && d.px > 0) {
        frame.style.height = Math.ceil(d.px) + 'px';
        // Reveal on ready; if the body never calls K.ready, show it shortly after it has drawn.
        if (!revealTimer) revealTimer = setTimeout(uncover, 900);
      } else if (d.type === 'ready') {
        sendQuiz();
        uncover();
        settle(d.checks || []);
        if (o.onReady) try { o.onReady(d.checks || [], { beside: d.beside === true }); } catch (e) { console.error(e); }
      } else if (d.type === 'error') {
        report(d.message);
      } else if (d.type === 'change') {
        if (o.onChange) try { o.onChange({ params: d.params, outputs: d.outputs }); } catch (e) { console.error(e); }
      } else if (d.type === 'complete') {
        if (o.onComplete) try { o.onComplete(); } catch (e) { console.error(e); }
      }
    }, function () { api.destroy(); });
    // A frame that has said nothing at all by now is not the kit: it is removed, never shown.
    var readyTimer = visibleTimeout(function () { settle(null); if (ch.heard()) uncover(); else stop(SILENT); }, FIRST_MS);
    // The kit says when its page starts to leave ('leaving'); a second load in the same window is
    // the backstop. A frame moved in the page gets a new window, which loads the kit afresh from
    // the srcdoc, so that load is kept.
    frame.addEventListener('load', function () {
      if (destroyed) return;
      var w = frame.contentWindow;
      if (++loads > 1 && w === kitWindow) { leave(); return; }
      kitWindow = w;
    });

    // The heartbeat (see above). A new window (the frame was moved in the page) starts afresh.
    var beat = null, beatWin = null, heard = 0, quiet = 0, fresh = true;
    function tick() {
      beat = null;
      if (destroyed) return;
      var w = frame.isConnected ? frame.contentWindow : null;
      if (!w) { beatWin = null; }
      else if (w !== beatWin) { beatWin = w; heard = ch.heard(); quiet = 0; fresh = true; ch.send('ping'); }
      else {
        var n = ch.heard();
        if (n !== heard) { heard = n; quiet = 0; fresh = false; } else quiet++;
        if (fresh ? quiet * PING_MS >= FIRST_MS : quiet >= MISSES) { stop(SILENT); return; }
        ch.send('ping');
      }
      beat = visibleTimeout(tick, PING_MS);
    }

    // Follow the app's light/dark and text-size settings while mounted.
    var lastTheme = '';
    function pushTheme() {
      if (destroyed) return;
      if (!wrap.isConnected) { api.destroy(); return; }
      var t = themeOf(), key = JSON.stringify(t);
      if (key !== lastTheme) { lastTheme = key; ch.send('theme', { theme: t }); }
    }
    var mo = new MutationObserver(function () { setTimeout(pushTheme, 30); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mu-theme', 'data-theme', 'data-size', 'data-easy'] });
    var mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
    function onScheme() { setTimeout(pushTheme, 30); }
    if (mq && mq.addEventListener) mq.addEventListener('change', onScheme);

    var shown = true;
    try {
      var t0 = themeOf();
      lastTheme = JSON.stringify(t0);
      frame.setAttribute('srcdoc', srcdoc(o.html, { theme: t0, token: token, quiz: quiz }));
    } catch (e) {
      shown = false;
      wrap.dataset.state = 'failed';
      U.clear(loading).appendChild(U.h('span', { class: 'small' }, 'This interactive could not be shown.'));
      frame.remove();
      settle(null);
      cancel(readyTimer);
      if (o.onError) setTimeout(function () { o.onError(e.message || String(e)); });
    }
    container.appendChild(wrap);
    if (shown) { beatWin = frame.contentWindow; beat = visibleTimeout(tick, PING_MS); }

    var api = Object.assign({
      el: wrap,
      frame: frame,
      ready: ready,
      selftest: function () { return ch.request('selftest', null, 10000).then(function (d) { return d.report; }); },
      theme: function (t) { ch.send('theme', { theme: t || themeOf() }); },
      // quiz(output id | null): hide that output while Dan answers; null ends it. reveal(): end it.
      quiz: function (hide) { quiz = hide == null || hide === '' ? null : String(hide); quizUsed = true; sendQuiz(); return api; },
      reveal: function () { quiz = null; quizUsed = true; if (!destroyed) ch.send('reveal'); return api; },
      destroy: function () {
        if (destroyed) return;
        destroyed = true;
        cancel(readyTimer); clearTimeout(revealTimer); cancel(beat);
        mo.disconnect();
        if (mq && mq.removeEventListener) mq.removeEventListener('change', onScheme);
        ch.close();
        settle(null);
        wrap.remove();
      },
    }, requests(ch));
    return api;
  }

  // ---------- hidden frames ----------
  // A frame in the viewport (so the browser doesn't throttle it) but invisible and inert.
  // onMessage gets the kit's unsolicited messages (a 'leaving' one means the body navigated the
  // frame away: the caller stops waiting for it); returns {frame, ch, close}.
  function hiddenFrame(html, width, th, onMessage) {
    var frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.setAttribute('aria-hidden', 'true');
    frame.setAttribute('tabindex', '-1');
    frame.title = 'Interactive self-test';
    frame.className = 'kit-test';
    frame.style.cssText = 'position:fixed;left:0;top:0;border:0;opacity:0;pointer-events:none;z-index:-1;' +
      'width:' + width + 'px;height:700px;max-width:none';
    var token = newToken();
    var ch = channel(frame, token, function (d) {
      if (d.type === 'height' && d.px > 0) frame.style.height = Math.min(4000, Math.ceil(d.px)) + 'px';
      if (onMessage) onMessage(d);
    });
    frame.setAttribute('srcdoc', srcdoc(html, { theme: th, token: token }));
    document.body.appendChild(frame);
    return { frame: frame, ch: ch, close: function () { ch.close(); frame.remove(); } };
  }

  // ---------- test ----------
  var LEFT = 'The page navigated its frame away (a link it clicked, a location change or a refresh), so it was stopped: everything must stay on this page.';
  function failing(message, width) {
    return { ok: false, errors: [message], overflow: false, clipped: [], checks: [], sweep: { ok: false, problems: [] }, controls: [], readouts: [], ready: false, warnings: [], width: width };
  }
  // One hidden frame at one width -> the kit's Report (or a failing one on timeout).
  function testOne(html, width, timeout, th) {
    return new Promise(function (resolve) {
      var finished = false, asked = false, graceTimer = null, hf = null, t0 = Date.now(), timer = null, leaving = null;
      function finish(report) {
        if (finished) return;
        finished = true;
        cancel(timer); cancel(graceTimer); cancel(leaving);
        if (hf) hf.close();
        report.width = width;
        // A page that started to leave fails, with whatever its self-test found before it went.
        if (leaving && (report.errors || []).indexOf(LEFT) < 0) { report.ok = false; report.errors = (report.errors || []).concat(LEFT); }
        resolve(report);
      }
      function ask() {
        if (asked || finished) return;
        asked = true;
        // The self-test itself gets the whole budget again (on the visible clock): the load is done.
        var left = Math.max(1500, timeout);
        // throwaway: this frame is discarded afterwards, so the kit may press buttons and run
        // K.afterMove callbacks as part of the test.
        hf.ch.request('selftest', { throwaway: true }, left).then(function (d) { finish(d.report || failing('The self-test returned nothing.', width)); },
          function (e) { finish(failing(e && e.code === 'timeout' ? 'The self-test did not finish within ' + Math.round(timeout / 1000) + ' s (a loop that never ends, or a very slow update?).' : 'The self-test could not run: ' + (e && e.message), width)); });
      }
      timer = visibleTimeout(function () { if (!asked) finish(failing('The interactive did not load within ' + Math.round(timeout / 1000) + ' s.', width)); }, timeout);
      try {
        hf = hiddenFrame(html, width, th, function (d) {
          if (d.type === 'ready') setTimeout(ask, 30);
          // The body navigated the frame away: its report may still come before the page goes.
          else if (d.type === 'leaving' && !leaving) leaving = visibleTimeout(function () { finish(failing(LEFT, width)); }, 1000);
        });
      } catch (e) { return finish(failing(e.message || String(e), width)); }
      // After load, give a body that calls K.ready() late a moment, then test whatever is there.
      hf.frame.addEventListener('load', function () { graceTimer = visibleTimeout(ask, 1000); });
    });
  }
  // Merge per-width reports. A message seen at only some widths says where.
  function merge(reports) {
    var widths = reports.map(function (r) { return r.width; });
    function union(get) {
      var seen = {}, order = [];
      reports.forEach(function (r) {
        (get(r) || []).forEach(function (m) {
          if (!seen[m]) { seen[m] = []; order.push(m); }
          if (seen[m].indexOf(r.width) < 0) seen[m].push(r.width);
        });
      });
      return order.map(function (m) { return seen[m].length < widths.length ? m + ' [at ' + seen[m].join(' and ') + ' px wide]' : m; });
    }
    // The ids, inputs and checks come from the widths whose page actually ran: one that timed out
    // (or never loaded) has none, which would read as every id missing and every check failing.
    // Its own error still fails the merged report.
    var ran = reports.filter(function (r) { return r.ready || (r.controls && r.controls.length) || (r.checks && r.checks.length); });
    var first = ran[0] || reports[0], judged = ran.length ? ran : reports;
    var checks = (first.checks || []).map(function (c, i) {
      var out = { label: c.label, ok: judged.every(function (r) { return r.checks && r.checks[i] && r.checks[i].ok; }) };
      if (c.source) out.source = c.source;
      var err = judged.map(function (r) { return r.checks && r.checks[i] && r.checks[i].error; }).filter(Boolean)[0];
      if (err) out.error = err;
      return out;
    });
    var problems = union(function (r) { return r.sweep && r.sweep.problems; });
    var merged = {
      ok: reports.every(function (r) { return r.ok; }),
      errors: union(function (r) { return r.errors; }),
      overflow: reports.some(function (r) { return r.overflow; }),
      clipped: union(function (r) { return r.clipped; }),
      checks: checks,
      sweep: { ok: reports.every(function (r) { return r.sweep && r.sweep.ok; }), problems: problems },
      controls: first.controls || [],
      readouts: first.readouts || [],
      outputs: first.outputs || [],
      inputs: first.inputs || [],
      actions: first.actions || [],
      ready: reports.every(function (r) { return r.ready; }),
      warnings: union(function (r) { return r.warnings; }),
      widths: reports.map(function (r) { return { width: r.width, ok: !!r.ok }; }),
    };
    var od = reports.filter(function (r) { return r.overflowDetail; }).map(function (r) { return 'at ' + r.width + ' px: ' + r.overflowDetail; });
    if (od.length) merged.overflowDetail = od.join('; ');
    return merged;
  }
  // test(html, {widths:[340, 720, 1040], timeout:8000}) -> Promise<Report>   hidden frames, one per width
  //   (a phone, a wide column, a laptop lesson where K.stage sets the controls beside the visual)
  function test(html, o) {
    o = o || {};
    var widths = o.widths && o.widths.length ? o.widths : [340, 720, 1040];
    var timeout = o.timeout || 8000;
    var big = tooBig(html);
    if (big) return Promise.resolve(merge(widths.map(function (w) { return failing(big, w); })));
    var th = o.theme || theme(), reports = [];
    // One width at a time with a breath in between, so the app stays responsive.
    return widths.reduce(function (p, w) {
      return p.then(function () { return new Promise(function (r) { setTimeout(r, 16); }); })
        .then(function () { return testOne(html, w, timeout, th).then(function (r) { reports.push(r); }); });
    }, Promise.resolve()).then(function () { return merge(reports); });
  }

  // reach(mounted | html, {control, output, target, tolerance, decimals?}) -> Promise<{reachable, exact, best, tried, error?}> (an error result has exact: false)
  function reach(target, spec, o) {
    o = o || {};
    if (target && typeof target === 'object' && typeof target.reach === 'function') return target.reach(spec);
    var html = String(target || '');
    var big = tooBig(html);
    if (big) return Promise.resolve({ reachable: false, exact: false, best: null, tried: 0, error: big });
    var timeout = o.timeout || 8000;
    return new Promise(function (resolve) {
      var hf = null, done = false, timer = null;
      function finish(r) { if (done) return; done = true; cancel(timer); if (hf) hf.close(); resolve(r); }
      timer = visibleTimeout(function () { finish({ reachable: false, exact: false, best: null, tried: 0, error: 'The interactive did not load within ' + Math.round(timeout / 1000) + ' s.' }); }, timeout);
      try {
        hf = hiddenFrame(html, o.width || 340, o.theme || theme(), function (d) {
          if (d.type === 'leaving') finish({ reachable: false, exact: false, best: null, tried: 0, error: LEFT });
          if (d.type !== 'ready') return;
          requests(hf.ch).reach(spec).then(function (r) { finish(r || { reachable: false, exact: false, best: null, tried: 0, error: 'no answer' }); },
            function (e) { finish({ reachable: false, exact: false, best: null, tried: 0, error: (e && e.message) || 'no answer' }); });
        });
      } catch (e) { finish({ reachable: false, exact: false, best: null, tried: 0, error: e.message || String(e) }); }
    });
  }

  return { MAX_BYTES: MAX_BYTES, CSP: CSP, theme: theme, isDark: isDark, srcdoc: srcdoc, mount: mount, test: test, merge: merge, reach: reach, visibleTimeout: visibleTimeout };
})();
