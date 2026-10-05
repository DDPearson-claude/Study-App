// Kit host: runs model-written interactive bodies in sandboxed srcdoc iframes on top of the house
// kit (app/kit), sizes each frame to its content, and self-tests bodies in hidden frames.
// Contract: docs/ARCHITECTURE.md sections 6 and 9. The frame never gets allow-same-origin, so a
// body cannot reach the app or its storage; a Content-Security-Policy (the first thing in every
// srcdoc) blocks all network requests from it; messages are trusted only when they come from that
// frame's own window. Error text that comes from a frame (onError, report errors) is for logs and
// repair prompts only: the app shows fixed wording, never the frame's own words.
//
//   U.sandbox.srcdoc(body, {theme}) -> string
//   U.sandbox.mount(container, {html, title, onReady, onError, onChange, minHeight, loading}) ->
//     { el, frame, ready, selftest(), get(), set(id, value), press(label?), inputs(), reach(spec), theme(t), destroy() }
//       set() counts as a move (it reveals the body's .k-after-move parts), and takes a slider value,
//       a choice's option value, label or 0-based index, or a toggle's true/false.
//       press(label?) presses a K.button (or starts a K.anim) by label, or the first one.
//       inputs() -> {inputs:[{id, kind, label, min?, max?, step?, options?, value}], actions:[labels]}
//   U.sandbox.test(html, {widths:[340, 720, 1040], timeout:8000}) -> Promise<Report>   hidden, merged
//   U.sandbox.reach(mounted | html, {control, output, target, tolerance}) ->
//       Promise<{reachable, best:{value, output} | null, tried, error?}>
//     Can moving that one control (every setting it has, every option of a choice; the others at
//     their opening values) bring the output within tolerance of the target? For lesson target
//     checks. Given html it runs in a hidden frame; given a mounted frame it uses that one.
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

  // The app's current palette for the kit: {dark, size, c:{bg, panel, ..., amber}}.
  function theme() {
    var cs = getComputedStyle(document.documentElement);
    var scheme = (cs.getPropertyValue('color-scheme') || '').trim();
    var dark = scheme === 'dark';
    var base = FALLBACK[dark ? 'dark' : 'light'], c = {};
    Object.keys(TOKENS).forEach(function (k) { c[k] = cs.getPropertyValue(TOKENS[k]).trim() || base[k]; });
    // Reading size (Aa setting): the app's 18px default maps to the kit's 16px.
    var fs = parseFloat(cs.getPropertyValue('--fs')) || 18;
    return { dark: dark, size: Math.max(16, Math.round(fs * 0.9)), c: c };
  }

  function byteLength(s) { try { return new TextEncoder().encode(s).length; } catch (e) { return s.length * 2; } }
  function tooBig(body) {
    var n = byteLength(String(body || ''));
    return n > MAX_BYTES ? 'The interactive is too large (' + Math.round(n / 1024) + ' KB; the limit is ' + (MAX_BYTES / 1024) + ' KB).' : null;
  }
  // JSON that is safe inside an inline <script>.
  function inlineJson(v) { return JSON.stringify(v).replace(/</g, '\\u003c'); }

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

  // The full document for one body: CSP first, then kit CSS, theme, kit JS, then the body.
  // Throws {code:'too_large'}.
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
      '<script>window.K_THEME=' + inlineJson(o.theme || theme()) + ';window.K_BODY_LINE=@@LINE@@;</' + 'script>' +
      '<script>' + U.KIT_JS + '</' + 'script></head><body>\n';
    // Error line numbers are reported relative to the body (the kit counts from this line).
    var line = head.split('\n').length;
    return head.replace('@@LINE@@', String(line)) + body + '\n</body></html>';
  }

  // ---------- messages ----------
  // One window listener; each live frame registers a handler keyed by its contentWindow.
  var live = [];
  var listening = false;
  function listen() {
    if (listening) return;
    listening = true;
    window.addEventListener('message', function (ev) {
      var d = ev.data;
      if (!d || typeof d !== 'object' || d.src !== 'kit' || !ev.source) return;
      for (var i = 0; i < live.length; i++) {
        if (live[i].frame.contentWindow === ev.source) { live[i].handle(d); return; }
      }
    });
  }
  // Mounted frames whose element was removed without destroy() (e.g. the router cleared the view).
  function prune() {
    live.slice().forEach(function (e) { if (e.gone && !e.frame.isConnected) e.gone(); });
  }
  // A frame's channel: request(type, data) -> Promise of the reply with the same rid.
  // onGone (mounted frames only) runs when the frame is found detached from the page.
  function channel(frame, onMessage, onGone) {
    var pending = {}, seq = 0;
    var entry = {
      frame: frame,
      gone: onGone || null,
      handle: function (d) {
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
        return ch.request('reach', { control: String(spec.control || ''), output: String(spec.output || ''), target: Number(spec.target), tolerance: Math.abs(Number(spec.tolerance)) || 0 }, 10000)
          .then(function (d) { return d.result; });
      },
    };
  }

  // ---------- mount ----------
  // mount(container, {html, title, onReady(checks), onError(msg), onChange(state), minHeight, loading})
  //   -> {el, frame, ready: Promise<checks|null>, selftest(), get(), set(id, value), press(label), inputs(), reach(spec), theme(t), destroy()}
  // ready resolves with the kit's check results, or null if K.ready() never arrives (12 s).
  // onChange({params, outputs}) follows Dan's changes (debounced). onError(msg) carries the frame's
  // own text: log it, never show it. loading:false hides the built-in loading line, for callers
  // that draw their own cover.
  function mount(container, o) {
    o = o || {};
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

    var resolveReady, readyDone = false, revealTimer = 0, destroyed = false, seenErrors = [], loads = 0, readyCount = 0;
    var ready = new Promise(function (r) { resolveReady = r; });
    function settle(v) { if (!readyDone) { readyDone = true; resolveReady(v); } }
    function reveal() {
      if (wrap.dataset.state === 'live') return;
      wrap.dataset.state = 'live';
      loading.remove();
    }
    function report(msg) {
      if (seenErrors.indexOf(msg) >= 0) return;
      seenErrors.push(msg);
      if (o.onError) try { o.onError(String(msg || 'error')); } catch (e) { console.error(e); }
    }
    prune();
    var ch = channel(frame, function (d) {
      if (d.type === 'height' && d.px > 0) {
        frame.style.height = Math.ceil(d.px) + 'px';
        // Reveal on ready; if the body never calls K.ready, show it shortly after it has drawn.
        if (!revealTimer) revealTimer = setTimeout(reveal, 900);
      } else if (d.type === 'ready') {
        readyCount++;
        reveal();
        settle(d.checks || []);
        if (o.onReady) try { o.onReady(d.checks || []); } catch (e) { console.error(e); }
      } else if (d.type === 'error') {
        report(d.message);
      } else if (d.type === 'change') {
        if (o.onChange) try { o.onChange({ params: d.params, outputs: d.outputs }); } catch (e) { console.error(e); }
      }
    }, function () { api.destroy(); });
    var readyTimer = visibleTimeout(function () { settle(null); reveal(); }, 12000);
    // A body that navigates its frame away from the kit is stopped there. (A frame that was moved
    // in the page reloads the kit, which says ready again within moments.)
    var awayTimer = null;
    frame.addEventListener('load', function () {
      if (++loads < 2 || destroyed) return;
      readyCount = 0;
      cancel(awayTimer);
      awayTimer = visibleTimeout(function () {
        if (!readyCount && !destroyed) { report('The interactive tried to leave its page, so it was stopped.'); api.destroy(); }
      }, 3000);
    });

    // Follow the app's light/dark and text-size settings while mounted.
    var lastTheme = '';
    function pushTheme() {
      if (destroyed) return;
      if (!wrap.isConnected) { api.destroy(); return; }
      var t = theme(), key = JSON.stringify(t);
      if (key !== lastTheme) { lastTheme = key; ch.send('theme', { theme: t }); }
    }
    var mo = new MutationObserver(function () { setTimeout(pushTheme, 30); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mu-theme', 'data-theme', 'data-size', 'data-easy'] });
    var mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
    function onScheme() { setTimeout(pushTheme, 30); }
    if (mq && mq.addEventListener) mq.addEventListener('change', onScheme);

    try {
      var t0 = theme();
      lastTheme = JSON.stringify(t0);
      frame.setAttribute('srcdoc', srcdoc(o.html, { theme: t0 }));
    } catch (e) {
      wrap.dataset.state = 'failed';
      U.clear(loading).appendChild(U.h('span', { class: 'small' }, 'This interactive could not be shown.'));
      frame.remove();
      settle(null);
      if (o.onError) setTimeout(function () { o.onError(e.message || String(e)); });
    }
    container.appendChild(wrap);

    var api = Object.assign({
      el: wrap,
      frame: frame,
      ready: ready,
      selftest: function () { return ch.request('selftest', null, 10000).then(function (d) { return d.report; }); },
      theme: function (t) { ch.send('theme', { theme: t || theme() }); },
      destroy: function () {
        if (destroyed) return;
        destroyed = true;
        cancel(readyTimer); clearTimeout(revealTimer); cancel(awayTimer);
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
  // onMessage gets the kit's unsolicited messages; returns {frame, ch, close}.
  function hiddenFrame(html, width, th, onMessage) {
    var frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.setAttribute('aria-hidden', 'true');
    frame.setAttribute('tabindex', '-1');
    frame.title = 'Interactive self-test';
    frame.className = 'kit-test';
    frame.style.cssText = 'position:fixed;left:0;top:0;border:0;opacity:0;pointer-events:none;z-index:-1;' +
      'width:' + width + 'px;height:700px;max-width:none';
    var ch = channel(frame, function (d) {
      if (d.type === 'height' && d.px > 0) frame.style.height = Math.min(4000, Math.ceil(d.px)) + 'px';
      if (onMessage) onMessage(d);
    });
    frame.setAttribute('srcdoc', srcdoc(html, { theme: th }));
    document.body.appendChild(frame);
    return { frame: frame, ch: ch, close: function () { ch.close(); frame.remove(); } };
  }

  // ---------- test ----------
  function failing(message, width) {
    return { ok: false, errors: [message], overflow: false, clipped: [], checks: [], sweep: { ok: false, problems: [] }, controls: [], readouts: [], ready: false, warnings: [], width: width };
  }
  // One hidden frame at one width -> the kit's Report (or a failing one on timeout).
  function testOne(html, width, timeout, th) {
    return new Promise(function (resolve) {
      var finished = false, asked = false, graceTimer = null, hf = null, t0 = Date.now(), timer = null;
      function finish(report) {
        if (finished) return;
        finished = true;
        cancel(timer); cancel(graceTimer);
        if (hf) hf.close();
        report.width = width;
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
        hf = hiddenFrame(html, width, th, function (d) { if (d.type === 'ready') setTimeout(ask, 30); });
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
    var first = reports[0];
    var checks = (first.checks || []).map(function (c, i) {
      var out = { label: c.label, ok: reports.every(function (r) { return r.checks && r.checks[i] && r.checks[i].ok; }) };
      if (c.source) out.source = c.source;
      var err = reports.map(function (r) { return r.checks && r.checks[i] && r.checks[i].error; }).filter(Boolean)[0];
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

  // reach(mounted | html, {control, output, target, tolerance}) -> Promise<{reachable, best, tried, error?}>
  function reach(target, spec, o) {
    o = o || {};
    if (target && typeof target === 'object' && typeof target.reach === 'function') return target.reach(spec);
    var html = String(target || '');
    var big = tooBig(html);
    if (big) return Promise.resolve({ reachable: false, best: null, tried: 0, error: big });
    var timeout = o.timeout || 8000;
    return new Promise(function (resolve) {
      var hf = null, done = false, timer = null;
      function finish(r) { if (done) return; done = true; cancel(timer); if (hf) hf.close(); resolve(r); }
      timer = visibleTimeout(function () { finish({ reachable: false, best: null, tried: 0, error: 'The interactive did not load within ' + Math.round(timeout / 1000) + ' s.' }); }, timeout);
      try {
        hf = hiddenFrame(html, o.width || 340, o.theme || theme(), function (d) {
          if (d.type !== 'ready') return;
          requests(hf.ch).reach(spec).then(function (r) { finish(r || { reachable: false, best: null, tried: 0, error: 'no answer' }); },
            function (e) { finish({ reachable: false, best: null, tried: 0, error: (e && e.message) || 'no answer' }); });
        });
      } catch (e) { finish({ reachable: false, best: null, tried: 0, error: e.message || String(e) }); }
    });
  }

  return { MAX_BYTES: MAX_BYTES, CSP: CSP, theme: theme, srcdoc: srcdoc, mount: mount, test: test, merge: merge, reach: reach, visibleTimeout: visibleTimeout };
})();
