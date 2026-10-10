/* House kit for My University interactives (API reference for prompts: app/kit/KIT.md).
 * Runs inside <iframe sandbox="allow-scripts" srcdoc>: no same-origin, so no storage, no network
 * and no access to the app. A model-written body uses the global K to build themed controls,
 * readouts, plots, buttons and sound, declares a pure model, known-answer checks, and calls K.ready().
 * The kit talks to the host (app/src/js/32-sandbox.js) with postMessage, every message tagged
 * src:'kit': height, ready, error, change, complete, and replies to selftest / get / set / press / inputs /
 * reach / theme.
 * This file is inlined into a <script> element, so it never contains a closing script tag or an
 * HTML comment opener. */
(function () {
  'use strict';
  if (window.K && window.K.__kit) return;
  var K = (window.K = { __kit: 1 });
  var SVGNS = 'http://www.w3.org/2000/svg';
  var FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  var SLOW_MS = 150;                      // an update slower than this feels laggy on a phone
  var PHONE = 560;                        // frames narrower than this get the phone layout
  var PHONE_VIEW = 640;                   // roughly how much of the frame a phone shows at once
  var FIG_MAX = 600;                      // custom figures never grow wider than this
  var SIZE_XL = 20;                       // K.theme.size at the app's largest Text size (XL)
  var BODY_LINE = +window.K_BODY_LINE || 0; // srcdoc line where the body starts (for error lines)
  var host = window.parent;                // captured now, so a body can't redirect it
  var hosted = !!host && host !== window;
  var create = Object.create, keysOf = Object.keys;   // captured before a body could replace them

  // ---------- host messaging ----------
  // Every message carries this frame's token: a random value the host put in the srcdoc. The kit
  // takes it and removes the script that held it before the body runs, so a page the frame is
  // navigated to can't know it, and the host refuses its messages. Messages are built on objects
  // with no prototype, so a setter a body adds to Object.prototype never sees the token.
  var TOKEN = typeof window.K_TOKEN === 'string' ? window.K_TOKEN : '';
  try { delete window.K_TOKEN; } catch (e) { window.K_TOKEN = undefined; }
  // Quiz mode from the start (the host's 'quiz' message follows ready): see "quiz mode" below.
  var quiz = typeof window.K_QUIZ === 'string' && window.K_QUIZ ? window.K_QUIZ : null;
  try { delete window.K_QUIZ; } catch (e) { window.K_QUIZ = undefined; }
  if (quiz) document.documentElement.classList.add('k-quiz');
  Array.prototype.slice.call(document.getElementsByTagName('script')).forEach(function (s) {
    if (s !== document.currentScript && /K_TOKEN/.test(s.textContent || '')) s.remove();
  });
  function post(msg) {
    if (!hosted) return;
    var out = create(null), k = keysOf(msg);
    for (var i = 0; i < k.length; i++) out[k[i]] = msg[k[i]];
    out.src = 'kit'; out.tok = TOKEN;
    try { host.postMessage(out, '*'); } catch (e) { /* host gone */ }
  }
  // A body that navigates its frame away (a link it clicks, location, a refresh) can't be stopped
  // from in here, so the host hears about it the moment the page starts to leave and removes the
  // frame. Built now and sent from capture listeners added before the body's, so a body can't
  // swallow it.
  var LEAVING = create(null);
  LEAVING.src = 'kit'; LEAVING.type = 'leaving'; LEAVING.tok = TOKEN;
  function leaving() { if (hosted) try { host.postMessage(LEAVING, '*'); } catch (e) { /* host gone */ } }
  window.addEventListener('beforeunload', leaving, true);
  window.addEventListener('pagehide', leaving, true);
  // document.open() throws the page away without leaving it, and erases those listeners (and the
  // kit's own): the root element it replaces is seen here, so the host still hears at once. (The
  // host's heartbeat catches anything that silences the kit some other way.)
  // Read through getters captured now, so a body can't redefine what the check sees.
  var DOC = document, ROOT = document.documentElement, apply = Reflect.apply;
  var parentOf = Object.getOwnPropertyDescriptor(Node.prototype, 'parentNode').get;
  if (window.MutationObserver) new MutationObserver(function () { if (apply(parentOf, ROOT, []) !== DOC) leaving(); }).observe(document, { childList: true });

  // ---------- errors ----------
  // `errors` are real faults (they fail the self-test); `warnings` are advice for a repair.
  var errors = [], warnings = [];
  function addUnique(list, msg, max) { if (list.indexOf(msg) < 0 && list.length < (max || 24)) list.push(msg); }
  function errText(e) {
    if (e == null) return 'unknown error';
    if (typeof e !== 'object') return String(e);
    var name = e.name && e.name !== 'Error' ? e.name + ': ' : '';
    return name + (e.message || String(e));
  }
  // " (body line N)" for a document line number, so a repair can find the fault.
  function lineNote(n) {
    n = +n;
    if (!n) return '';
    if (BODY_LINE && n >= BODY_LINE) return ' (body line ' + (n - BODY_LINE + 1) + ')';
    return ' (inside the kit: check the arguments passed to it)';
  }
  function stackLine(e) {
    var m = e && typeof e.stack === 'string' && e.stack.match(/about:srcdoc:(\d+):\d+/);
    return m ? lineNote(m[1]) : '';
  }
  function fail(msg) {
    var before = errors.length;
    addUnique(errors, msg);
    if (errors.length > before) post({ type: 'error', message: msg });
  }
  window.addEventListener('error', function (ev) {
    if (!ev || !ev.message) return;
    fail(ev.message + lineNote(ev.lineno));
  });
  window.addEventListener('unhandledrejection', function (ev) {
    fail('Unhandled promise rejection: ' + errText(ev && ev.reason) + stackLine(ev && ev.reason));
  });
  // console.error is advice, not a failure.
  var cerr = console.error;
  console.error = function () {
    try { addUnique(warnings, 'console.error: ' + Array.prototype.map.call(arguments, errText).join(' ').slice(0, 200), 8); } catch (e) {}
    return cerr.apply(console, arguments);
  };
  // Things the app's viewer blocks: fail loudly and clearly instead of silently.
  ['alert', 'confirm', 'prompt', 'print'].forEach(function (name) {
    window[name] = function () {
      fail(name + '() does not work in the app (the viewer blocks it). Show the text on the page instead.');
      return name === 'confirm' ? false : null;
    };
  });
  window.open = function () { fail('window.open() is not available. Keep everything on this page.'); return null; };
  // Peer-to-peer connections are outside the page's Content-Security-Policy: not available.
  ['RTCPeerConnection', 'webkitRTCPeerConnection', 'RTCDataChannel'].forEach(function (name) {
    try { Object.defineProperty(window, name, { value: undefined, configurable: false, writable: false }); } catch (e) {}
  });
  window.fetch = function () {
    fail('fetch() is not available: interactives have no network. Put the data in the script.');
    return new Promise(function () {});
  };

  // ---------- theme ----------
  // The host sets window.K_THEME = {dark, size, mute, c:{...}} before this script; Dan's light
  // palette is the fallback so a body opened on its own still looks right. The data roles in
  // KIT_ROLES belong to the kit (tuned so fills and highlights read on both backgrounds):
  //   strokes and text: ink, muted, accent2 (main), accent (second), warn, good, amberLine
  //   fills behind things: panel, sunk, amber (note box), hl (key-term highlighter),
  //     fill1 (main area), fill2 (highlighted area, amber), fill3 (second area)
  //   cat1..cat4: telling equal things apart (both strokes and fills), never meaning: blue,
  //     orange, magenta, aqua, checked for colour-blind separation as a set in both themes.
  var LIGHT = {
    bg: '#FFFFFF', panel: '#F7F5F0', sunk: '#EFEBE3', ink: '#1F2937', muted: '#5B6573', line: '#DED8CC',
    strong: '#B9B1A3', accent: '#0F6B66', accent2: '#17324D', onAccent2: '#F7F5F0', warn: '#9F3038',
    good: '#2E7D4F', amber: '#FFF1CC',
    hl: '#FBE29A', amberLine: '#B7791F', fill1: '#D6E0EB', fill2: '#F8D47A', fill3: '#CFE8E4',
    cat1: '#2A78D6', cat2: '#E66633', cat3: '#C2418A', cat4: '#19A070',
  };
  var DARK = {
    bg: '#1A2029', panel: '#12161C', sunk: '#232A35', ink: '#E7E4DD', muted: '#A9B1BC', line: '#2C3440',
    strong: '#4A5564', accent: '#6CC7BD', accent2: '#BBD0E6', onAccent2: '#12161C', warn: '#F2A6AC',
    good: '#6FCB94', amber: '#3A3016',
    hl: '#6E561E', amberLine: '#E8B64C', fill1: '#2E4763', fill2: '#8F6A1E', fill3: '#1F4D49',
    cat1: '#3987E5', cat2: '#D95926', cat3: '#CC5FA8', cat4: '#199E70',
  };
  var KIT_ROLES = ['hl', 'amberLine', 'fill1', 'fill2', 'fill3', 'cat1', 'cat2', 'cat3', 'cat4'];
  var FILL_ROLES = ['fill1', 'fill2', 'fill3', 'hl', 'amber', 'panel', 'sunk'];
  var hostMute = false, themeArg = null;
  K.theme = { dark: false, size: 16, c: {} };
  function cssName(k) { return '--k-' + k.replace(/[A-Z]/g, function (m) { return '-' + m.toLowerCase(); }); }
  function applyTheme(t) {
    t = t && typeof t === 'object' ? t : {};
    themeArg = t;
    var dark = !!t.dark, base = dark ? DARK : LIGHT, src = t.c || {};
    // roles: host-written replacements for the kit's own data roles (the dossier's ink-on-paper
    // plates); never model-written. Without them the kit keeps its tuned roles.
    if (t.roles && typeof t.roles === 'object') { base = Object.assign({}, base); KIT_ROLES.forEach(function (k) { if (typeof t.roles[k] === 'string' && t.roles[k]) base[k] = t.roles[k]; }); }
    K.theme.dark = dark;
    K.theme.size = clamp(+t.size || 16, 14, 24);
    hostMute = !!t.mute;
    var root = document.documentElement, s = root.style;
    Object.keys(base).forEach(function (k) {
      var v = src[k];
      K.theme.c[k] = KIT_ROLES.indexOf(k) < 0 && typeof v === 'string' && v ? v : base[k];
      s.setProperty(cssName(k), K.theme.c[k]);
    });
    s.setProperty('--k-fs', K.theme.size + 'px');
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
  }
  applyTheme(window.K_THEME);
  // Colour parsing (any CSS colour the canvas understands) for K.color(name, alpha) and halos.
  // -> [r, g, b, a], or null for anything the canvas can't paint with ('none', 'var(...)', a typo):
  // a canvas keeps its old colour when given one it rejects, so two different old colours tell.
  var cc = null;
  function rgbaOf(col) {
    var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(col);
    if (m) {
      var h = m[1].length === 3 ? m[1].replace(/./g, '$&$&') : m[1];
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1];
    }
    try {
      if (!cc) cc = document.createElement('canvas').getContext('2d');
      cc.fillStyle = '#000'; cc.fillStyle = col;
      var s = String(cc.fillStyle);
      cc.fillStyle = '#fff'; cc.fillStyle = col;
      if (String(cc.fillStyle) !== s) return null;
      if (s.charAt(0) === '#') return rgbaOf(s);
      var n = s.match(/[\d.]+/g);
      if (n && n.length >= 3) return [+n[0], +n[1], +n[2], n.length > 3 ? +n[3] : 1];
    } catch (e) {}
    return null;
  }
  // WCAG contrast of two [r, g, b] colours (1 to 21), and a see-through colour laid over another.
  function lumOf(p) {
    var v = [p[0], p[1], p[2]].map(function (x) { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }
  function contrastOf(a, b) { var x = lumOf(a), y = lumOf(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function overOf(top, alpha, under) { return [0, 1, 2].map(function (i) { return top[i] * alpha + under[i] * (1 - alpha); }); }
  // The palette role a name means: 'accent2', 'amber-line' or 'amberLine', or 'var(--k-warn)'
  // (the CSS form KIT.md gives) -> the role's key in K.theme.c, else null.
  function roleKey(name) {
    if (typeof name !== 'string') return null;
    var v = /^var\(\s*--k-([a-z0-9-]+)\s*\)$/i.exec(name.trim());
    var key = (v ? v[1] : name.trim()).replace(/-([a-z0-9])/g, function (_, ch) { return ch.toUpperCase(); });
    return K.theme.c[key] ? key : null;
  }
  // Colour words a body may write for roles (KIT.md describes roles by them): drawn as that role,
  // so they still follow the theme (navy is invisible on the dark page).
  var WORD_ROLES = { navy: 'accent2', blue: 'accent2', teal: 'accent', red: 'warn', green: 'good', black: 'ink', white: 'bg', gray: 'muted', grey: 'muted' };
  // A palette role ('accent2', 'fill2', 'cat1', 'var(--k-warn)', ...) or a CSS colour such as
  // '#2A78D6' or 'rgb(...)'; with alpha, an rgba() of it. A colour word or anything else the
  // canvas can't draw with is drawn as a role (so a plot line, its legend key and a fill still
  // agree and follow the theme) and fails the self-test, so a repair names a real role.
  K.color = function (name, alpha) {
    var key = roleKey(name), c;
    if (key) c = K.theme.c[key];
    else if (name == null || name === '') c = K.theme.c.accent2;
    else {
      var text = String(name).trim(), v = /^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)$/.exec(text);
      if (v) text = getComputedStyle(document.documentElement).getPropertyValue(v[1]).trim() || (v[2] || '').trim();
      var word = /^[a-z]+$/i.test(text) && !/^(none|transparent|currentcolor)$/i.test(text);
      if (word || !rgbaOf(text) && !/^(none|transparent|currentcolor)$/i.test(text)) {
        var fall = WORD_ROLES[text.toLowerCase()] || 'accent2';
        problem('K.color(\'' + name + '\') is not a colour role, so it was drawn as \'' + fall + '\': use one of ' + Object.keys(K.theme.c).join(', '));
        c = K.theme.c[fall];
      } else c = text;
    }
    if (alpha == null || !isNum(+alpha)) return c;
    var p = rgbaOf(c);
    if (!p) return c;
    return 'rgba(' + p[0] + ', ' + p[1] + ', ' + p[2] + ', ' + +(clamp(+alpha, 0, 1) * p[3]).toFixed(3) + ')';
  };

  // ---------- small helpers ----------
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function isNum(v) { return typeof v === 'number' && isFinite(v); }
  function num(v, d) { v = typeof v === 'string' && v.trim() !== '' ? +v : v; return isNum(v) ? v : d; }
  function now() { return window.performance && performance.now ? performance.now() : Date.now(); }
  K.clamp = clamp;
  K.lerp = function (a, b, t) { return a + (b - a) * t; };
  // Soft motion, one house style so every demonstration moves alike: unhurried, nothing popping in.
  // K.ease(p) eases 0..1 gently in and out (for something travelling or growing). K.arrive(T, t0,
  // dur?) is how far a part due at t0 seconds has arrived at time T: 0 before t0, rising softly to
  // 1 over dur (K.SOFT seconds); the finished picture (T = Infinity, how reduced motion opens it)
  // is 1. K.fade(el, a, rise?) shows el at arrival a: faded in, and risen `rise` units into place.
  K.SOFT = 0.6;
  K.ease = function (p) { p = clamp(num(p, 0), 0, 1); return (1 - Math.cos(Math.PI * p)) / 2; };
  K.arrive = function (T, t0, dur) {
    if (T === Infinity) return 1;
    if (!isNum(T)) return 0;
    var d = num(dur, K.SOFT), s = num(t0, 0);
    if (d <= 0) return T >= s ? 1 : 0;
    return K.ease((T - s) / d);
  };
  K.fade = function (el, a, rise) {
    if (!el || !el.style) return el;
    a = clamp(num(a, 1), 0, 1);
    var r = num(rise, 6);
    el.style.opacity = a >= 1 ? '' : a.toFixed(3);
    el.style.transform = a >= 1 || !r ? '' : 'translate(0px, ' + ((1 - a) * r).toFixed(2) + 'px)';
    return el;
  };
  K.linspace = function (a, b, n) { var out = []; n = Math.max(2, n | 0); for (var i = 0; i < n; i++) out.push(a + (b - a) * i / (n - 1)); return out; };
  // True when a and b agree within tol (absolute); default tolerance is a tiny relative one.
  K.near = function (a, b, tol) {
    if (!isNum(a) || !isNum(b)) return false;
    if (tol == null) tol = 1e-9 + 1e-6 * Math.max(Math.abs(a), Math.abs(b));
    return Math.abs(a - b) <= tol;
  };
  K.round = function (v, dp) { var f = Math.pow(10, dp || 0); return Math.round(v * f) / f; };
  function decimalsOf(x) {
    if (!isNum(x)) return 0;
    var s = String(Math.abs(x)), m = s.match(/e-(\d+)$/);
    if (m) return +m[1] + ((s.split('e')[0].split('.')[1] || '').length);
    return (s.split('.')[1] || '').length;
  }
  function niceStep(raw) {
    if (!(raw > 0)) return 1;
    var mag = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / mag;
    return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag;
  }
  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
  function group(v, dp) { return v.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp }); }
  function sci(v, sig) {
    var e = v.toExponential(sig - 1).split('e');
    return e[0].replace(/\.?0+$/, '') + ' × 10' + String(+e[1]).split('').map(function (ch) { return SUP[ch] || ch; }).join('');
  }
  // The default rounding (readouts and K.fmt): whole numbers stay whole; otherwise 3 significant
  // figures with trailing zeros kept, so the digits don't jump as a value changes; 100 and over
  // to the nearest whole number; extremes as × 10ⁿ.
  function autoText(v) {
    var a = Math.abs(v);
    if (a === 0) return '0';
    if (a >= 1e15 || a < 1e-4) return sci(v, 3);
    if (Number.isInteger(v)) return group(v, 0);
    var p = Math.abs(+v.toPrecision(3));
    if (p >= 100) return group(v, 0);
    return group(v, clamp(2 - Math.floor(Math.log10(p)), 0, 12));
  }
  // K.fmt(v, {dp | decimals, sig, unit, prefix, percent, sign, compact}) -> readable text. A value
  // that is not a finite number shows as '—', and from a body that is a problem: the self-test
  // fails on it, as it would on NaN in a readout ('It lands — m away' hides a broken formula).
  K.fmt = function (v, o) {
    if (!isNum(v)) problem('K.fmt was given ' + (typeof v === 'number' ? (isNaN(v) ? 'NaN' : 'Infinity') : v == null ? String(v) : typeof v + ' "' + String(v).slice(0, 20) + '"') + ', so it showed "—"');
    return fmt(v, o);
  };
  // The kit's own formatting: the same, without the report (it checks its values itself).
  function fmt(v, o) {
    o = typeof o === 'number' ? { dp: o } : (o || {});
    if (!isNum(v)) return '—';
    if (o.percent) v = v * 100;
    var a = Math.abs(v), s, dp = o.dp != null ? o.dp : o.decimals;
    if (o.compact && a >= 1e4) {
      var units = [[1e12, ' trillion'], [1e9, ' billion'], [1e6, ' million'], [1e3, 'k']];
      for (var i = 0; i < units.length; i++) if (a >= units[i][0]) { s = fmt(v / units[i][0], { sig: o.sig || 3 }) + units[i][1]; break; }
    } else if (dp != null) {
      s = group(v, clamp(dp | 0, 0, 12));
    } else if (o.sig) {
      var sig = clamp(o.sig | 0, 1, 12);
      if (a === 0) s = '0';
      else if (a >= 1e15 || a < 1e-4) s = sci(v, sig);
      else if (a >= Math.pow(10, sig)) s = group(Math.round(v), 0);
      else { var p = +v.toPrecision(sig); s = group(p, Math.max(0, Math.min(12, decimalsOf(p)))); }
    } else s = autoText(v);
    s = s.replace(/^-/, '−');
    // −0 (and a tiny negative rounded to nothing) is 0: no sign.
    if (!/[1-9]/.test(s)) s = s.replace(/^−/, '');
    else if (o.sign && v > 0) s = '+' + s;
    if (o.percent) s += '%';
    return (o.prefix || '') + s + unitText(o.unit);
  }
  function unitText(unit) {
    if (!unit) return '';
    return /^[%°′″:×/]/.test(unit) ? unit : ' ' + unit;
  }

  // ---------- DOM helpers ----------
  function append(el, kids) {
    kids.forEach(function (k) {
      if (k == null || k === false) return;
      if (Array.isArray(k)) append(el, k);
      else el.appendChild(k.nodeType ? k : document.createTextNode(String(k)));
    });
    return el;
  }
  function build(ns, tag, attrs, kids) {
    var el = ns ? document.createElementNS(ns, tag) : document.createElement(tag);
    if (attrs != null && (typeof attrs !== 'object' || attrs.nodeType || Array.isArray(attrs))) { kids.unshift(attrs); attrs = null; }
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') el.setAttribute('class', v);
      else if (k === 'style') {
        if (typeof v === 'string') el.style.cssText = v;
        else Object.keys(v).forEach(function (p) { if (p.indexOf('--') === 0) el.style.setProperty(p, v[p]); else el.style[p] = v[p]; });
      }
      else if (k === 'on') Object.keys(v).forEach(function (e) { el.addEventListener(e, v[e]); });
      else if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'dataset') Object.keys(v).forEach(function (d) { el.dataset[d] = v[d]; });
      else el.setAttribute(k, v === true ? '' : String(v));
    });
    return append(el, kids);
  }
  // K.el(tag, attrs?, ...children) -> HTMLElement; K.svg(tag, attrs?, ...children) -> SVG element.
  K.el = function (tag, attrs) { return build(null, tag, attrs, Array.prototype.slice.call(arguments, 2)); };
  K.svg = function (tag, attrs) { return build(SVGNS, tag, attrs, Array.prototype.slice.call(arguments, 2)); };
  K.$ = function (sel) { return document.querySelector(sel); };
  function resolve(target, who) {
    if (!target) return null;
    if (target.nodeType === 1) return target;
    var el = document.querySelector(String(target));
    if (!el) throw new Error(who + ': nothing on the page matches "' + target + '"');
    return el;
  }
  function place(el, into, who) { var p = resolve(into, who); if (p) p.appendChild(el); return el; }
  var ICON = {
    minus: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    plus: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M8 3v10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 2.8v10.4L13 8z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 3h3v10H4zM9 3h3v10H9z" fill="currentColor"/></svg>',
  };
  // Text width in px for a font (for layout decisions made before or without rendering).
  function textWidth(text, font) {
    try {
      if (!cc) cc = document.createElement('canvas').getContext('2d');
      cc.font = font;
      return cc.measureText(String(text)).width;
    } catch (e) { return String(text).length * 8; }
  }
  function fontOf(el) { var cs = getComputedStyle(el); return cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily; }

  // ---------- registry and the update pipeline ----------
  // Every control registers itself; K.params() is {id: value}. A change runs: model(params) ->
  // outputs; readouts whose id matches an output key update themselves; then each K.update fn.
  var controls = [], byId = Object.create(null), readouts = Object.create(null), readoutList = [], plots = [], barList = [], anims = [], checks = [];
  var actions = [], stages = [], drags = [];
  var modelFn = null, updates = [], lastOutputs = {}, readyCalled = false, everRun = false;
  var sink = null;          // during the self-test sweep: where problems go, with the current setting
  var liveProblems = [];    // problems seen outside the sweep (e.g. a NaN while Dan plays)
  var labelSkips = [];      // plot labels left out for lack of room (advice)

  function problem(msg) {
    if (!sink) { addUnique(liveProblems, msg, 12); return; }
    var e = sink.seen[msg];
    if (e) { e.n++; return; }
    sink.seen[msg] = { n: 1, at: sink.ctx };
    sink.order.push(msg);
  }
  function fault(where, e) {
    var msg = where + ' threw ' + errText(e) + stackLine(e);
    if (sink) problem(msg); else fail(msg);
  }
  function register(c, kind) {
    c.kind = kind;
    c.id = String(c.id || kind + (controls.length + 1));
    if (byId[c.id]) fail('Two controls share the id "' + c.id + '": ids must be unique.');
    byId[c.id] = c;
    controls.push(c);
  }

  K.model = function (fn) { if (typeof fn !== 'function') throw new Error('K.model needs a function'); modelFn = fn; return K; };
  K.update = function (fn) { if (typeof fn !== 'function') throw new Error('K.update needs a function'); updates.push(fn); return K; };
  K.params = function () { var p = {}; controls.forEach(function (c) { p[c.id] = c.get(); }); return p; };
  K.outputs = function () { return lastOutputs; };
  // The model at given params (missing ones take each control's starting value). Pure: no drawing.
  K.at = function (over) {
    var p = {};
    controls.forEach(function (c) { p[c.id] = c.initial; });
    Object.keys(over || {}).forEach(function (k) { p[k] = over[k]; });
    return modelFn ? (modelFn(p) || {}) : {};
  };
  function checkOutputs(out) {
    Object.keys(out).forEach(function (k) {
      var v = out[k];
      if (v != null && typeof v === 'object') problem('the model returned an ' + (Array.isArray(v) ? 'array' : 'object') + ' for "' + k + '": outputs must be numbers or short strings (keep lists in your own variables)');
      // Shown or not, a broken formula here ends up in the say sentence or a label.
      else if (typeof v === 'number' && !isFinite(v)) problem('the model returned ' + (isNaN(v) ? 'NaN' : 'Infinity') + ' for "' + k + '"');
    });
  }
  function run() {
    everRun = true;
    var p = K.params(), out = {};
    if (modelFn) {
      try { out = modelFn(p) || {}; } catch (e) { fault('the model', e); return; }
      if (sink) checkOutputs(out);
    }
    lastOutputs = out;
    Object.keys(out).forEach(function (k) { if (readouts[k]) readouts[k].set(out[k]); });
    for (var i = 0; i < updates.length; i++) {
      try { updates[i](p, out); } catch (e) { fault('K.update', e); }
    }
    if (drags.length) syncDrags();
    if (readyCalled) figures();
    heightSoon();
  }
  K.refresh = function () { run(); return K; };

  // User changes are coalesced to one run per frame (with a timer fallback for throttled frames),
  // and the host hears about them: 250 ms after the last one, and at least every 2 s while they
  // keep coming (a long drag, a slider an animation drives) or an animation Dan started plays, so
  // the app knows he is busy with the page (its study minutes). Only while Dan has touched the
  // page in the last 5 minutes: an animation left running on its own is not Dan studying.
  var pending = false, changeTimer = 0, changeSince = 0, touched = 0;
  var CHANGE_MS = 250, CHANGE_MAX = 2000, WATCH_MS = 5 * 60 * 1000;
  ['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach(function (ev) { document.addEventListener(ev, function () { touched = now(); }, true); });
  function watching() { return !!touched && now() - touched < WATCH_MS; }
  function changed() {
    if (!pending) {
      pending = true;
      var done = false;
      var go = function () { if (done) return; done = true; pending = false; run(); };
      if (window.requestAnimationFrame) requestAnimationFrame(go);
      setTimeout(go, 60);
    }
    tellHost();
  }
  function sendChange() {
    clearTimeout(changeTimer);
    changeTimer = 0; changeSince = 0;
    post({ type: 'change', params: K.params(), outputs: stateOutputs() });
  }
  function tellHost() {
    var t = now();
    if (!changeSince) changeSince = t;
    clearTimeout(changeTimer);
    if (t - changeSince >= CHANGE_MAX && watching()) sendChange();
    else changeTimer = setTimeout(sendChange, CHANGE_MS);
  }
  function stateOutputs() {
    var o = {};
    readoutList.forEach(function (r) { if (r.value !== undefined) o[r.id] = r.value; });
    Object.keys(lastOutputs || {}).forEach(function (k) {
      var v = lastOutputs[k];
      if (v == null || typeof v !== 'object') o[k] = v;
    });
    return o;
  }

  // ---------- reveal after a move ----------
  // Anything with class k-after-move stays hidden (its space kept) until Dan first moves a control
  // or presses a kit button, so the opening screen never answers his prediction. K.moved says
  // whether that has happened; K.afterMove(fn) runs fn once at that moment; K.reveal() marks it
  // from your own handlers (a drag on a drawing, say). The self-test shows these parts while it
  // checks the page, then hides them again.
  var moved = false, sweepReveal = false, afterMoveFns = [];
  function setMovedClass(on) { document.documentElement.classList.toggle('k-moved', !!on); }
  function markMoved() {
    if (moved) return;
    moved = true;
    setMovedClass(true);
    laterPlots();
    afterMoveFns.slice().forEach(function (fn) { try { fn(); } catch (e) { fault('K.afterMove', e); } });
  }
  Object.defineProperty(K, 'moved', { get: function () { return moved || sweepReveal; }, enumerable: true });
  K.afterMove = function (fn) {
    if (typeof fn !== 'function') throw new Error('K.afterMove needs a function');
    afterMoveFns.push(fn);
    if (moved) { try { fn(); } catch (e) { fault('K.afterMove', e); } }
    return K;
  };
  K.reveal = function () { markMoved(); changed(); return K; };
  // Plots with afterMove parts draw them now (one drawn once, outside K.update, too).
  function laterPlots() { plots.forEach(function (p) { if (p.drawn && p.later) p.redraw(); }); }

  // ---------- quiz mode ----------
  // While Dan answers a target check on this page (the host's 'quiz' message, or K_QUIZ in the
  // srcdoc so it holds from the first paint), the output it asks about stays hidden and he steers
  // by the picture and the rule: its readout shows "?" (labelled for screen readers) and every .say
  // line is hidden (visibility, so nothing moves). Nothing else is touched: the page must not print
  // that value anywhere else (KIT.md says so, and the self-test fails a page that does: echoes).
  // The model runs as usual: state and change messages carry the real outputs, which the app
  // grades. {type:'quiz', hide:null} or 'reveal' ends it. The self-test runs with it off.
  var testingNow = false, quizHeld = null, HIDDEN = 'Hidden until you check your answer';
  function setQuiz(id) {
    id = typeof id === 'string' && id ? id : typeof id === 'number' ? String(id) : null;
    if (testingNow) { quizHeld = id; return; }
    applyQuiz(id);
  }
  function applyQuiz(id) {
    if (id === quiz) return;
    quiz = id;
    document.documentElement.classList.toggle('k-quiz', !!quiz);
    readoutList.forEach(function (r) { if (r.value !== undefined) r.set(r.value); });
  }

  // ---------- controls ----------
  // Label (and live value on the right), then an optional one-line hint across the full width.
  function fieldHead(id, label, hint, right) {
    var lab = K.el('label', { class: 'k-field-label', for: id }, label || '');
    return [K.el('div', { class: 'k-field-head' }, lab, right || null), hint ? K.el('span', { class: 'k-hint' }, hint) : null];
  }

  // K.control({id, label, min, max, step, value, unit, prefix, fmt, log, snap, hint, into}) -> {el, get, set}
  // snap: values a drag lands on exactly when it comes within 2% of the range of one (the setting
  // a prediction or a check names), so Dan can hit 50% on a phone without fifty taps.
  K.control = function (o) {
    o = o || {};
    var min = num(o.min, 0), max = num(o.max, 100), log = !!o.log;
    var who = 'K.control "' + (o.id || '') + '"';
    if (!(max > min)) throw new Error(who + ': max must be greater than min');
    if (log && !(min > 0)) throw new Error(who + ': a log slider needs min > 0');
    var step = num(o.step, 0) > 0 ? +o.step : (log ? 0 : niceStep((max - min) / 100));
    var dp = Math.max(decimalsOf(step), decimalsOf(min));
    var N = 1000; // log sliders run over N positions
    var snaps = (Array.isArray(o.snap) ? o.snap : o.snap != null ? [o.snap] : []).map(Number).filter(function (s) { return isNum(s) && s >= min && s <= max; })
      .map(function (s) { return +s.toPrecision(12); });   // 0.5 × 20 × 9.81 is 98.10000000000001: shown and set as 98.1
    // A snap value between two steps shows its own decimals (98.1 on a slider of whole numbers).
    var numText = function (v) { return (o.prefix || '') + (log && !o.step ? fmt(v, { sig: 3 }) : fmt(v, { dp: snaps.indexOf(v) >= 0 ? Math.max(dp, decimalsOf(v)) : dp })); };
    var show = function (v) { return o.fmt ? String(o.fmt(v)) : numText(v) + unitText(o.unit); };
    // A long unit ("per second") is shown once, on the right-hand end of the scale.
    var longUnit = !o.fmt && o.unit && (/\s/.test(String(o.unit).trim()) || String(o.unit).trim().length > 4);
    function snap(v) {
      v = clamp(num(v, min), min, max);
      if (log && !step) return clamp(+v.toPrecision(3), min, max);
      return clamp(+(min + Math.round((v - min) / step) * step).toFixed(Math.min(dp, 12)), min, max);
    }
    // A dragged value within 2% of the range of a snap value lands on it (the nearest one).
    function toward(v) {
      var best = v, gap = Infinity;
      snaps.forEach(function (s) {
        var d = log ? Math.abs(Math.log(v / s)) / Math.log(max / min) : Math.abs(v - s) / (max - min);
        if (d <= 0.02 && d < gap) { gap = d; best = s; }
      });
      return best;
    }
    function settle(v) { var n = num(v, NaN); return snaps.indexOf(n) >= 0 ? n : snap(v); }
    function toPos(v) { return log ? Math.round(N * Math.log(v / min) / Math.log(max / min)) : v; }
    function fromPos(p) { return log ? min * Math.pow(max / min, p / N) : p; }
    var value = snap(o.value == null ? min : o.value);
    var c = { id: o.id, initial: value, min: min, max: max, log: log };
    register(c, 'control');
    var fid = 'k-' + c.id;
    var out = K.el('output', { for: fid });
    var minus = K.el('button', { type: 'button', class: 'k-nudge', 'aria-label': 'Less ' + (o.label || c.id), html: ICON.minus });
    var plus = K.el('button', { type: 'button', class: 'k-nudge', 'aria-label': 'More ' + (o.label || c.id), html: ICON.plus });
    var input = K.el('input', {
      type: 'range', id: fid, class: 'k-range', min: log ? 0 : min, max: log ? N : max,
      step: log ? 1 : step, 'aria-label': o.label || c.id,
    });
    var lo = K.el('span', null, longUnit ? numText(min) : show(min)), hi = K.el('span', null, show(max));
    var scale = K.el('div', { class: 'k-scale', 'aria-hidden': 'true' }, lo, hi);
    var el = K.el('div', { class: 'k-field k-control', 'data-id': c.id },
      fieldHead(fid, o.label || c.id, o.hint, K.el('span', { class: 'k-value' }, out)),
      K.el('div', { class: 'k-slide' }, minus, K.el('div', { class: 'k-track' }, input, scale), plus));
    function paint() {
      input.value = String(toPos(value));
      var t = log ? Math.log(value / min) / Math.log(max / min) : (value - min) / (max - min);
      input.style.setProperty('--p', (clamp(t, 0, 1) * 100).toFixed(2) + '%');
      var text = show(value);
      out.textContent = text;
      input.setAttribute('aria-valuetext', text);
      minus.disabled = value <= min;
      plus.disabled = value >= max;
    }
    function nudge(dir) {
      var before = value;
      if (log) value = snap(fromPos(clamp(toPos(value) + dir * N / 40, 0, N)));
      if (!log || value === before) value = snap(value + dir * (step || value * 0.05));
      paint(); changed();
    }
    input.addEventListener('input', function () { markMoved(); value = toward(snap(fromPos(+input.value))); paint(); changed(); });
    // − / +: a press moves one step; held down, they keep going (after 400 ms, every 80 ms) until
    // let go or the end of the range. A click with no pointer behind it (Enter, Space) is one step.
    [[minus, -1], [plus, 1]].forEach(function (b) {
      var btn = b[0], dir = b[1], timer = 0;
      function stop() { clearTimeout(timer); timer = 0; }
      function again(ms) { timer = setTimeout(function () { if (btn.disabled) { stop(); return; } nudge(dir); again(80); }, ms); }
      btn.addEventListener('pointerdown', function (ev) {
        if (ev.button > 0 || btn.disabled) return;
        markMoved(); nudge(dir); stop(); again(400);
      });
      ['pointerup', 'pointercancel', 'pointerleave', 'blur'].forEach(function (e) { btn.addEventListener(e, stop); });
      btn.addEventListener('click', function (ev) { if (ev.detail === 0) { markMoved(); nudge(dir); } });
      btn.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });
    });
    c.el = el; c.input = input;
    c.get = function () { return value; };
    c.set = function (v, silent) { value = settle(v); paint(); if (!silent) changed(); return c; };
    c.drag = function (v) { value = toward(snap(v)); paint(); changed(); return c; };
    c.accepts = function (v) { return isNum(num(v, NaN)); };
    c.sweep = function () {
      var vals = [0, 0.25, 0.5, 0.75, 1].map(function (t) { return snap(log ? min * Math.pow(max / min, t) : min + t * (max - min)); });
      return vals.filter(function (v, i) { return vals.indexOf(v) === i; });
    };
    // Every reachable setting (up to 2001 of them), for reach().
    c.values = function () {
      var out2 = [], n = log && !step ? N : Math.round((max - min) / step);
      var count = Math.min(n, 2000);
      for (var k = 0; k <= count; k++) {
        var t = k / count, v = log ? snap(min * Math.pow(max / min, t)) : snap(min + t * (max - min));
        if (!out2.length || out2[out2.length - 1] !== v) out2.push(v);
      }
      // The snap values are settings too (one may sit between two steps).
      snaps.forEach(function (s) { if (out2.indexOf(s) < 0) out2.push(s); });
      return out2.sort(function (a, b) { return a - b; });
    };
    // The settings strictly between two (at most 4000), so reach() can look closer than values().
    c.between = function (a, b) {
      var lo = Math.min(a, b), hi = Math.max(a, b), out2 = [];
      if (log && !step) { for (var p = toPos(lo) + 1; p < toPos(hi) && out2.length < 4000; p++) out2.push(snap(fromPos(p))); }
      else for (var k = Math.floor((lo - min) / step) + 1; min + k * step < hi && out2.length < 4000; k++) out2.push(snap(min + k * step));
      return out2.filter(function (v) { return v > lo && v < hi; });
    };
    c.settle = settle;
    c.info = function () {
      var i = { id: c.id, kind: 'control', label: o.label || c.id, min: min, max: max, step: step || null, log: log, value: value };
      if (snaps.length) i.snap = snaps.slice();
      return i;
    };
    c.describe = show;
    // Layout at the current width: the live value keeps a steady width (no jumping as it
    // changes), and the end labels never wrap or collide.
    c.fit = function () {
      if (!el.isConnected || !out.clientWidth && !el.clientWidth) return;
      var f = fontOf(out), wmax = 0;
      [min, max, value, (min + max) / 2].forEach(function (v) { wmax = Math.max(wmax, textWidth(show(snap(v)), f)); });
      out.style.minWidth = wmax < el.clientWidth * 0.55 ? Math.ceil(wmax + 2) + 'px' : '';
      lo.textContent = longUnit ? numText(min) : show(min); hi.textContent = show(max);
      scale.classList.remove('tight');
      var W = scale.clientWidth;
      if (!W) return;
      if (lo.offsetWidth + hi.offsetWidth + 12 <= W) return;
      if (!o.fmt) { lo.textContent = numText(min); hi.textContent = numText(max); }
      if (lo.offsetWidth + hi.offsetWidth + 12 > W) scale.classList.add('tight');
    };
    paint();
    place(el, o.into, who);
    return c;
  };

  function normOptions(list) {
    return (list || []).map(function (x) {
      return x && typeof x === 'object' ? { value: x.value !== undefined ? x.value : x.label, label: x.label != null ? String(x.label) : String(x.value) } : { value: x, label: String(x) };
    });
  }
  // K.choice({id, label, options:[value | {value, label}], value, hint, into}) -> {el, get, set}
  // value (and host set) takes an option's value, its label, or its 0-based index. A number is the
  // index when every option is a string, as a lesson gives it: options '1', '2', '4', '8' with
  // value 1 open on '2'.
  K.choice = function (o) {
    o = o || {};
    var opts = normOptions(o.options);
    var who = 'K.choice "' + (o.id || '') + '"';
    if (opts.length < 2) throw new Error(who + ': needs at least two options');
    var named = opts.every(function (x) { return typeof x.value === 'string'; });
    function find(v) {
      var i;
      if (named && typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < opts.length) return opts[v];
      for (i = 0; i < opts.length; i++) if (opts[i].value === v) return opts[i];
      for (i = 0; i < opts.length; i++) if (String(opts[i].value) === String(v)) return opts[i];
      for (i = 0; i < opts.length; i++) if (opts[i].label === String(v)) return opts[i];
      var n = typeof v === 'string' && /^\d+$/.test(v) ? +v : v;
      return typeof n === 'number' && Number.isInteger(n) && n >= 0 && n < opts.length ? opts[n] : null;
    }
    var first = o.value == null ? null : find(o.value);
    var value = first ? first.value : opts[0].value;
    var c = { id: o.id, initial: value };
    register(c, 'choice');
    var labId = 'k-' + c.id + '-label';
    var seg = K.el('div', { class: 'k-seg', role: 'radiogroup', 'aria-labelledby': labId });
    var buttons = opts.map(function (x, i) {
      var b = K.el('button', { type: 'button', role: 'radio' }, x.label);
      b.addEventListener('click', function () { markMoved(); c.set(x.value); });
      b.addEventListener('keydown', function (ev) {
        var d = ev.key === 'ArrowRight' || ev.key === 'ArrowDown' ? 1 : ev.key === 'ArrowLeft' || ev.key === 'ArrowUp' ? -1 : 0;
        if (!d) return;
        ev.preventDefault();
        var j = (i + d + opts.length) % opts.length;
        markMoved(); c.set(opts[j].value); buttons[j].focus();
      });
      seg.appendChild(b);
      return b;
    });
    var el = K.el('div', { class: 'k-field k-choice', 'data-id': c.id },
      o.label ? K.el('div', { class: 'k-field-head' }, K.el('span', { class: 'k-field-label', id: labId }, o.label)) : null,
      o.hint ? K.el('span', { class: 'k-hint' }, o.hint) : null,
      seg);
    if (!o.label) seg.setAttribute('aria-label', c.id);
    function paint() {
      opts.forEach(function (x, i) {
        var on = x.value === value;
        buttons[i].setAttribute('aria-checked', on ? 'true' : 'false');
        buttons[i].tabIndex = on ? 0 : -1;
      });
    }
    c.el = el;
    c.get = function () { return value; };
    c.set = function (v, silent) { var x = find(v); if (!x) return c; value = x.value; paint(); if (!silent) changed(); return c; };
    c.accepts = function (v) { return !!find(v); };
    c.index = function () { for (var i = 0; i < opts.length; i++) if (opts[i].value === value) return i; return 0; };
    c.sweep = function () {
      if (opts.length <= 24) return opts.map(function (x) { return x.value; });
      return K.linspace(0, opts.length - 1, 24).map(function (i) { return opts[Math.round(i)].value; });
    };
    c.values = function () { return opts.map(function (x) { return x.value; }); };
    c.info = function () { return { id: c.id, kind: 'choice', label: o.label || c.id, options: opts.map(function (x) { return x.value; }), labels: opts.map(function (x) { return x.label; }), value: value, index: c.index() }; };
    c.describe = function (v) { var x = find(v); return x ? '"' + x.label + '"' : String(v); };
    // Options that don't fit on one row stack into a tidy list instead of a lopsided wrap.
    c.fit = function () {
      seg.classList.remove('stack');
      if (buttons.length > 1 && buttons[buttons.length - 1].offsetTop > buttons[0].offsetTop + 4) seg.classList.add('stack');
    };
    paint();
    place(el, o.into, who);
    return c;
  };

  // K.toggle({id, label, value:false, hint, into}) -> {el, get, set}
  K.toggle = function (o) {
    o = o || {};
    var value = !!o.value;
    var c = { id: o.id, initial: value };
    register(c, 'toggle');
    var btn = K.el('button', { type: 'button', class: 'k-toggle', role: 'switch' },
      K.el('span', null, K.el('span', { class: 'k-field-label' }, o.label || c.id), o.hint ? K.el('span', { class: 'k-hint' }, o.hint) : null),
      K.el('span', { class: 'k-switch', 'aria-hidden': 'true' }));
    btn.addEventListener('click', function () { markMoved(); c.set(!value); });
    var el = K.el('div', { class: 'k-field k-toggle-field', 'data-id': c.id }, btn);
    function paint() { btn.setAttribute('aria-checked', value ? 'true' : 'false'); }
    c.el = el;
    c.get = function () { return value; };
    c.set = function (v, silent) { value = v === true || v === 'true' || v === 1 || v === '1' || v === 'on'; paint(); if (!silent) changed(); return c; };
    c.accepts = function () { return true; };
    c.sweep = function () { return [false, true]; };
    c.values = c.sweep;
    c.info = function () { return { id: c.id, kind: 'toggle', label: o.label || c.id, options: [false, true], value: value }; };
    c.describe = function (v) { return v ? 'on' : 'off'; };
    paint();
    place(el, o.into, 'K.toggle "' + c.id + '"');
    return c;
  };

  // K.stepper({id, steps:[title | {title, text}], value:0, label, compact, into}) -> {el, get, set, setSteps}
  // The value is the 0-based step index. setSteps() swaps the list (e.g. when a toggle adds a stage).
  // compact: just "Step n of N: title", progress dots and Back / Next (the body shows the content).
  K.stepper = function (o) {
    o = o || {};
    function norm(list) {
      var s = (list || []).map(function (x) { return x && typeof x === 'object' ? { title: String(x.title || ''), text: x.text ? String(x.text) : '' } : { title: String(x), text: '' }; });
      if (!s.length) throw new Error('K.stepper "' + (o.id || '') + '": needs at least one step');
      return s;
    }
    var steps = norm(o.steps);
    var value = clamp(num(o.value, 0) | 0, 0, steps.length - 1);
    var c = { id: o.id, initial: value };
    register(c, 'stepper');
    var count = K.el('span', { class: 'k-label' });
    var title = K.el('h3', { class: 'k-stepper-title' });
    var text = K.el('p', { class: 'k-stepper-text' });
    var dots = K.el('div', { class: 'k-dots', 'aria-hidden': 'true' });
    var back = K.el('button', { type: 'button', class: 'k-btn secondary' }, 'Back');
    var next = K.el('button', { type: 'button', class: 'k-btn' }, 'Next');
    back.addEventListener('click', function () { markMoved(); c.set(value - 1); });
    next.addEventListener('click', function () { markMoved(); c.set(value + 1); });
    var el = K.el('div', { class: 'k-field k-stepper' + (o.compact ? ' compact' : ''), 'data-id': c.id, role: 'group', 'aria-label': o.label || 'Steps' },
      K.el('div', { 'aria-live': 'polite' }, count, o.compact ? null : [title, text]), dots, K.el('div', { class: 'k-stepper-nav' }, back, next));
    function paint() {
      count.textContent = (o.label ? o.label + ' · ' : '') + 'Step ' + (value + 1) + ' of ' + steps.length + (o.compact ? ': ' + steps[value].title : '');
      title.textContent = steps[value].title;
      text.textContent = steps[value].text;
      text.hidden = !steps[value].text;
      while (dots.children.length > steps.length) dots.removeChild(dots.lastChild);
      while (dots.children.length < steps.length) dots.appendChild(K.el('i'));
      Array.prototype.forEach.call(dots.children, function (d, i) { d.className = i <= value ? 'on' : ''; });
      back.disabled = value <= 0;
      next.disabled = value >= steps.length - 1;
    }
    c.el = el;
    c.get = function () { return value; };
    c.set = function (v, silent) { value = clamp(num(v, 0) | 0, 0, steps.length - 1); paint(); if (!silent) changed(); return c; };
    c.accepts = function (v) { return isNum(num(v, NaN)); };
    c.steps = function () { return steps.slice(); };
    c.setSteps = function (list) { steps = norm(list); value = clamp(value, 0, steps.length - 1); paint(); return c; };
    c.sweep = function () {
      var n = steps.length;
      if (n <= 24) return K.linspace(0, n - 1, Math.max(n, 2)).map(Math.round).filter(function (v, i, a) { return a.indexOf(v) === i; });
      return K.linspace(0, n - 1, 24).map(Math.round);
    };
    c.values = function () { return steps.map(function (s, i) { return i; }); };
    c.info = function () { return { id: c.id, kind: 'stepper', label: o.label || c.id, min: 0, max: steps.length - 1, step: 1, steps: steps.map(function (s) { return s.title; }), value: value }; };
    c.describe = function (v) { return 'step ' + (v + 1); };
    paint();
    place(el, o.into, 'K.stepper "' + c.id + '"');
    return c;
  };

  // K.button({label, press, secondary, id, into}) -> {el, press(), setLabel(text)}
  // An action button (Shout, Hear it, Drop the ball, Clear). Pressing it counts as Dan moving
  // something; the self-test presses every K.button to check what it does.
  K.button = function (o) {
    o = o || {};
    if (typeof o.press !== 'function') throw new Error('K.button "' + (o.label || '') + '" needs press: function');
    var b = K.el('button', { type: 'button', class: 'k-btn' + (o.secondary ? ' secondary' : ''), 'data-id': o.id || null }, o.label || 'Go');
    var a = { el: b, label: String(o.label || 'button ' + (actions.length + 1)), kind: 'button' };
    a.run = function () { try { o.press(); } catch (e) { fault('K.button "' + a.label + '"', e); } };
    a.press = function () { a.run(); changed(); return a; };
    a.setLabel = function (t) { b.textContent = String(t); return a; };
    b.addEventListener('click', function () { markMoved(); a.press(); });
    actions.push(a);
    place(b, o.into, 'K.button "' + a.label + '"');
    return a;
  };

  // ---------- dragging the drawing ----------
  // K.drag(el, {control, toValue(x, y)}) -> {el}
  // Dan moves a part of the drawing with his finger (a handle, the thing itself, or the whole
  // drawing), and that moves a control: toValue gets the pointer in the drawing's own units (the
  // <svg>'s viewBox; px from el's top-left for an HTML element) and returns the control's new
  // value, which a slider fits to its range and step (and onto a snap value near it). The slider
  // moves with it, so the keyboard reaches the same thing through the slider, and the first touch
  // counts as Dan's move (K.reveal()). The page does not scroll under his finger while he drags,
  // and a handle smaller than a fingertip gets an invisible 44 px target around it.
  K.drag = function (target, o) {
    o = o || {};
    var el = resolve(target, 'K.drag');
    if (!el) throw new Error('K.drag needs an element');
    if (typeof o.toValue !== 'function') throw new Error('K.drag needs toValue(x, y)');
    var cid = o.control && typeof o.control === 'object' ? o.control.id : o.control;
    if (cid == null || cid === '') throw new Error('K.drag needs control: the id of the control it moves');
    var root = el instanceof SVGElement ? el : null;
    while (root && root.ownerSVGElement) root = root.ownerSVGElement;
    var d = { el: el, root: root, control: String(cid), toValue: o.toValue, hit: null, who: 'K.drag on ' + describeEl(el) };
    // A point on the screen -> the drawing's units.
    d.at = function (cx, cy) {
      if (root) {
        var m = root.getScreenCTM();
        if (!m) return null;
        var q = new DOMPoint(cx, cy).matrixTransform(m.inverse());
        return { x: q.x, y: q.y };
      }
      var r = el.getBoundingClientRect();
      return { x: cx - r.left, y: cy - r.top };
    };
    var active = null;
    function moveTo(ev) {
      var c = byId[d.control];
      if (!c) { fail(d.who + ' moves control "' + d.control + '", which does not exist: use the id of one of your controls.'); return; }
      var q = d.at(ev.clientX, ev.clientY), v;
      if (!q) return;
      try { v = o.toValue(q.x, q.y); } catch (e) { fault(d.who + ': toValue', e); return; }
      if (v == null || typeof v === 'number' && !isFinite(v) || c.accepts && !c.accepts(v)) return;
      if (c.drag) c.drag(v); else c.set(v);
    }
    function down(ev) {
      if (ev.button > 0) return;
      active = ev.pointerId;
      try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) { /* the drag still follows inside the target */ }
      ev.preventDefault();
      K.reveal();
      moveTo(ev);
    }
    function move(ev) { if (active === ev.pointerId) { ev.preventDefault(); moveTo(ev); } }
    function up(ev) { if (active === ev.pointerId) active = null; }
    d.listen = function (node) {
      node.addEventListener('pointerdown', down);
      node.addEventListener('pointermove', move);
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (e) { node.addEventListener(e, up); });
    };
    el.classList.add('k-drag');
    d.listen(el);
    drags.push(d);
    syncDrags();
    return { el: el };
  };
  // Keeps a small handle's 44 px target centred on it (it moves as the body redraws it). An HTML
  // element gets its target from kit.css (k-drag-small); a whole drawing is target enough.
  function syncDrag(d) {
    var el = d.el;
    if (!el.isConnected) return;
    var b = el.getBoundingClientRect();
    if (!(el instanceof SVGElement)) {
      var small = b.width < 44 || b.height < 44;
      el.classList.toggle('k-drag-small', small);
      if (small && !el.style.position && getComputedStyle(el).position === 'static') el.style.position = 'relative';
      return;
    }
    if (el === d.root) return;
    var big = b.width >= 44 && b.height >= 44, parent = el.parentNode;
    if (big || !b.width && !b.height || !parent || !parent.getScreenCTM) { if (d.hit) d.hit.setAttribute('display', 'none'); return; }
    var m = parent.getScreenCTM();
    if (!m) return;
    var q = new DOMPoint(b.left + b.width / 2, b.top + b.height / 2).matrixTransform(m.inverse()), r = 22 / ctmScale(m);
    if (!isNum(q.x) || !isNum(q.y) || !isNum(r)) return;
    if (!d.hit) { d.hit = K.svg('circle', { class: 'k-drag-hit', fill: 'transparent', 'aria-hidden': 'true' }); d.listen(d.hit); }
    d.hit.setAttribute('cx', +q.x.toFixed(2)); d.hit.setAttribute('cy', +q.y.toFixed(2)); d.hit.setAttribute('r', +r.toFixed(2));
    d.hit.removeAttribute('display');
    if (d.hit.parentNode !== parent || el.nextSibling !== d.hit) parent.insertBefore(d.hit, el.nextSibling);
  }
  // Chromium ignores touch-action on SVG shapes, so a drawing that holds a live handle gets
  // touch-action: none on its <svg> (k-drag-root): a finger on the handle moves it all the way
  // instead of scrolling the page (and cancelling the drag). It goes once no handle is left in it.
  function syncDrags() {
    var live = [];
    drags.forEach(function (d) {
      if (d.root && d.el !== d.root && d.el.isConnected && live.indexOf(d.root) < 0) live.push(d.root);
      try { syncDrag(d); } catch (e) { /* layout only */ }
    });
    drags.forEach(function (d) { if (d.root && d.el !== d.root) d.root.classList.toggle('k-drag-root', live.indexOf(d.root) >= 0); });
  }
  // The self-test asks each toValue about the drawing's corners and centre: it must give a value
  // the control can take there (a slider fits a number to its range itself).
  function dragProblems() {
    drags.forEach(function (d) {
      var c = byId[d.control];
      if (!c) { problem(d.who + ' moves control "' + d.control + '", which does not exist: use the id of one of your controls'); return; }
      if (!d.el.isConnected) addUnique(warnings, d.who + ' left the page when the drawing was redrawn, so dragging does nothing now: create the dragged element once, outside K.update, and move it there by setting its attributes (cx, x, transform)');
      var w, h, x0 = 0, y0 = 0, vb = d.root && d.root.viewBox && d.root.viewBox.baseVal;
      if (vb && vb.width) { x0 = vb.x; y0 = vb.y; w = vb.width; h = vb.height; }
      else { var r = (d.root || d.el).getBoundingClientRect(); w = r.width; h = r.height; }
      [[0.5, 0.5], [0, 0], [1, 0], [0, 1], [1, 1]].some(function (f) {
        var x = +(x0 + f[0] * w).toFixed(2), y = +(y0 + f[1] * h).toFixed(2), v;
        try { v = d.toValue(x, y); } catch (e) { problem(d.who + ': toValue(' + x + ', ' + y + ') threw ' + errText(e) + stackLine(e)); return true; }
        var bad = v == null || typeof v === 'number' && !isFinite(v) || c.accepts && !c.accepts(v);
        if (bad) problem(d.who + ': toValue(' + x + ', ' + y + ') gave ' + (typeof v === 'number' ? (isNaN(v) ? 'NaN' : 'Infinity') : String(v)) + ', so a drag there does nothing: return a value control "' + d.control + '" can take (a slider clamps a number to its range)');
        return bad;
      });
    });
  }

  // ---------- readouts ----------
  // K.readout({id, label, unit, prefix, dp | decimals, sig, fmt, big, hint, afterMove, into}) -> {el, set(v), get(), text()}
  // A readout whose id matches a key of the model's outputs updates itself on every change.
  // Default rounding: see autoText. Give decimals to match the rounding the lesson text uses.
  K.readout = function (o) {
    o = o || {};
    var id = String(o.id || 'readout' + (readoutList.length + 1));
    if (readouts[id]) fail('Two readouts share the id "' + id + '": ids must be unique.');
    var dp = o.decimals != null ? o.decimals : o.dp;
    var lab = K.el('span', { class: 'k-readout-label' }, o.label || id);
    var val = K.el('span', { class: 'k-readout-value' }, '—');
    var el = K.el('div', { class: 'k-readout' + (o.big ? ' big' : ''), 'data-id': id }, lab, val,
      o.hint ? K.el('span', { class: 'k-hint' }, o.hint) : null);
    var r = { id: id, el: el, value: undefined };
    // A long value shrinks a little (to 75% for words, 55% for a number) before it wraps; a number
    // itself never breaks across lines, and nothing is ever cut off.
    function fit() {
      val.style.fontSize = '';
      var w = val.clientWidth;
      if (!w) return;
      val.style.whiteSpace = 'nowrap';
      var need = val.scrollWidth;
      val.style.whiteSpace = '';
      if (need <= w + 1) return;
      var px = parseFloat(getComputedStyle(val).fontSize), least = typeof r.value === 'number' ? 0.55 : 0.75;
      val.style.fontSize = Math.max(px * least, Math.floor(px * w / need * 10) / 10) + 'px';
    }
    // A word value's tile widens to fit the widest word it has shown, at the smallest size fit()
    // gives words, so no word splits (a tile sized for its label alone can be too narrow).
    var widest = 0, lastWords = '';
    function wordRoom(v) {
      if (typeof v !== 'string' || v + '|' + K.theme.size === lastWords || !val.isConnected) return;
      lastWords = v + '|' + K.theme.size;
      var keep = val.style.fontSize;
      val.style.fontSize = '';
      var f = fontOf(val), w = v.split(/\s+/).reduce(function (m, t) { return Math.max(m, textWidth(t, f)); }, 0) * 0.75;
      val.style.fontSize = keep;
      if (w > widest + 0.5) { widest = w; r.layout(); }
    }
    r.set = function (v) { setValue(v); wordRoom(v); fit(); return r; };
    // The number as this readout shows it (without the unit).
    function numText(v) { return o.fmt ? String(o.fmt(v)) : (o.prefix || '') + fmt(v, dp != null ? { dp: dp } : o.sig ? { sig: o.sig } : null); }
    r.format = function (v) { try { return typeof v === 'number' ? numText(v) : String(v); } catch (e) { return fmt(v); } };
    function setValue(v) {
      r.value = v;
      while (val.firstChild) val.removeChild(val.firstChild);
      // afterMove: a "?" until Dan first moves something, so it can't answer his prediction.
      // Quiz mode: a "?" while he answers a target check on this output.
      var hide = quiz !== null && quiz === id, wait = hide || !!o.afterMove && !K.moved;
      val.classList.toggle('k-wait', wait);
      if (hide) { val.setAttribute('role', 'img'); val.setAttribute('aria-label', HIDDEN); }
      else if (val.hasAttribute('role')) { val.removeAttribute('role'); val.removeAttribute('aria-label'); }
      if (typeof v === 'number') {
        if (!isFinite(v)) { val.textContent = hide ? '?' : '—'; problem('readout "' + id + '" was given ' + (isNaN(v) ? 'NaN' : 'Infinity')); return; }
        if (wait) { val.textContent = '?'; return; }
        val.appendChild(K.el('span', { class: 'k-num' }, numText(v)));
        if (o.unit && !o.fmt) val.appendChild(K.el('span', { class: 'k-readout-unit' }, unitText(o.unit)));
      } else if (v == null) {
        val.textContent = hide ? '?' : '—';
        problem('readout "' + id + '" was given ' + v);
      } else {
        var shown = String(v);
        if (/\bNaN\b|\bundefined\b|Infinity|\[object /.test(shown)) problem('readout "' + id + '" shows "' + shown.slice(0, 40) + '"');
        val.textContent = wait ? '?' : shown;
      }
    }
    r.get = function () { return r.value; };
    r.text = function () { return val.textContent; };
    // Tiles share a row; a long label gets a wider tile so it wraps to at most two lines, and
    // never one narrower than its longest word, so no word splits (at a large Text size too).
    r.layout = function () {
      var font = fontOf(lab), w = textWidth(o.label || id, font);
      var word = String(o.label || id).split(/\s+/).reduce(function (m, t) { return Math.max(m, textWidth(t, font)); }, 0);
      el.style.flexBasis = 'min(100%, ' + Math.max(132, Math.ceil(w / 1.8 + 34), Math.ceil(word + 30), Math.ceil(widest + 30)) + 'px)';
      fit();
    };
    readouts[id] = r;
    readoutList.push(r);
    place(el, o.into, 'K.readout "' + id + '"');
    return r;
  };

  // ---------- plots ----------
  // K.plot(target, {x, y, series, shade, marks, regions, lines, height, aspect, label, after}) -> {draw(opts)}
  //   x / y: {min, max, label, log, prefix, unit, fmt, ticks}; leave out y.min/max to fit the data.
  //   series: [{fn(x) | points:[[x,y]...], label, color, dash, width, fill, dots, gaps}]
  //   shade:  [{between:[a, b], label, color, x0, x1}]  a / b: a series label, a function or a number
  //   marks:  [{x, y, label, color, guides}]   regions: [{x0, x1 | y0, y1, label, color}]
  //   lines:  [{x | y, label, color}]          after(ctx, plot): draw extra things on top
  // draw(opts) redraws with opts layered over the options the plot was created with.
  var SERIES_COLORS = ['accent2', 'accent', 'muted', 'ink'];
  function compact(v) {
    var a = Math.abs(v), u = [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'k']];
    for (var i = 0; i < u.length; i++) if (a >= u[i][0]) return fmt(v / u[i][0], { sig: 3 }) + u[i][1];
    return fmt(v, { sig: 3 });
  }
  function axisTicks(A, count) {
    if (Array.isArray(A.ticks)) {
      A.step = 0;
      return A.ticks.filter(function (t) { return isNum(t) && t >= A.min - 1e-12 && t <= A.max + 1e-12; });
    }
    var out = [];
    if (A.log) {
      var lo = Math.floor(Math.log10(A.min)), hi = Math.ceil(Math.log10(A.max)), decades = hi - lo;
      var mult = decades <= 1 ? [1, 2, 3, 5] : decades <= 3 ? [1, 2, 5] : [1];
      var every = Math.max(1, Math.ceil(decades / Math.max(2, count)));
      for (var d = lo; d <= hi; d += mult.length === 1 ? every : 1) {
        mult.forEach(function (m) { var v = m * Math.pow(10, d); if (v >= A.min * (1 - 1e-9) && v <= A.max * (1 + 1e-9)) out.push(+v.toPrecision(12)); });
      }
      return out;
    }
    var step = niceStep((A.max - A.min) / Math.max(1, count));
    A.step = step;
    for (var v = Math.ceil(A.min / step - 1e-9) * step; v <= A.max + step * 1e-9; v += step) out.push(+v.toPrecision(12));
    return out;
  }
  function tickText(A, v) {
    if (A.fmt) return String(A.fmt(v));
    var s = Math.abs(v) >= 1e4 ? compact(v) : A.log || !A.step ? fmt(v, { sig: 3 }) : fmt(v, { dp: Math.min(6, decimalsOf(A.step)) });
    return (A.prefix || '') + s + unitText(A.unit);
  }
  function overlap(a, b) { return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h; }
  function inside(px, py, r) { return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h; }
  function segsCross(ax, ay, bx, by, cx, cy, dx, dy) {
    var d1 = (dx - cx) * (ay - cy) - (dy - cy) * (ax - cx), d2 = (dx - cx) * (by - cy) - (dy - cy) * (bx - cx);
    var d3 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax), d4 = (bx - ax) * (dy - ay) - (by - ay) * (dx - ax);
    return d1 * d2 < 0 && d3 * d4 < 0;
  }
  function segHits(x1, y1, x2, y2, r) {
    if (Math.max(x1, x2) < r.x || Math.min(x1, x2) > r.x + r.w || Math.max(y1, y2) < r.y || Math.min(y1, y2) > r.y + r.h) return false;
    if (inside(x1, y1, r) || inside(x2, y2, r)) return true;
    var X2 = r.x + r.w, Y2 = r.y + r.h;
    return segsCross(x1, y1, x2, y2, r.x, r.y, X2, r.y) || segsCross(x1, y1, x2, y2, X2, r.y, X2, Y2) ||
      segsCross(x1, y1, x2, y2, r.x, Y2, X2, Y2) || segsCross(x1, y1, x2, y2, r.x, r.y, r.x, Y2);
  }
  // Interpolate a points series (for shading against it).
  function interp(points) {
    var p = points.map(function (q) { return Array.isArray(q) ? [q[0], q[1]] : [q && q.x, q && q.y]; })
      .filter(function (q) { return isNum(q[0]); }).sort(function (a, b) { return a[0] - b[0]; });
    return function (x) {
      if (!p.length || x < p[0][0] || x > p[p.length - 1][0]) return NaN;
      var lo = 0, hi = p.length - 1;
      while (hi - lo > 1) { var m = (lo + hi) >> 1; if (p[m][0] <= x) lo = m; else hi = m; }
      var a = p[lo], b = p[hi];
      return b[0] === a[0] ? a[1] : a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
    };
  }

  K.plot = function (target, o) {
    if (o === undefined && target && typeof target === 'object' && !target.nodeType) { o = target; target = null; }
    o = o || {};
    var root = target ? resolve(target, 'K.plot') : K.el('div');
    if (!target && o.into) place(root, o.into, 'K.plot');
    root.classList.add('k-plot');
    var canvas = K.el('canvas', { role: 'img' });
    var legend = K.el('div', { class: 'k-legend', 'aria-hidden': 'true' });
    root.appendChild(canvas);
    root.appendChild(legend);
    var ctx = canvas.getContext('2d');
    var base = o, cur = o, lastW = -1, geom = null;
    var name = o.id || root.id || (o.y && o.y.label) || 'plot';
    var api = { el: root, canvas: canvas, ctx: ctx, maxHeight: 0 };
    root.__kplot = api;

    function axisOf(spec, which) {
      spec = spec || {};
      var A = { min: num(spec.min, NaN), max: num(spec.max, NaN), log: !!spec.log, label: spec.label || '', fmt: spec.fmt, ticks: spec.ticks, zero: spec.zero !== false, prefix: spec.prefix, unit: spec.unit };
      if (which === 'x' && !(A.max > A.min)) throw new Error('K.plot "' + name + '": x needs {min, max} with max > min');
      if (A.log && which === 'x' && !(A.min > 0)) throw new Error('K.plot "' + name + '": a log x axis needs min > 0');
      return A;
    }
    function xs(X, n, x0, x1) {
      var a = X.log ? Math.log(x0) : x0, b = X.log ? Math.log(x1) : x1, out = [];
      for (var k = 0; k <= n; k++) { var x = a + (b - a) * k / n; out.push(X.log ? Math.exp(x) : x); }
      return out;
    }
    function sample(s, i, X, n) {
      var pts = [], label = s.label || 'series ' + (i + 1), bad = null;
      if (typeof s.fn === 'function') {
        var list = xs(X, n, X.min, X.max);
        for (var k = 0; k < list.length; k++) {
          var y;
          try { y = s.fn(list[k]); } catch (e) { fault('plot "' + name + '" series "' + label + '"', e); break; }
          pts.push([list[k], y]);
        }
      } else if (Array.isArray(s.points)) {
        pts = s.points.map(function (p) { return Array.isArray(p) ? [p[0], p[1]] : [p && p.x, p && p.y]; });
      }
      pts.forEach(function (p) { if (!bad && !(isNum(p[0]) && isNum(p[1]))) bad = p; });
      if (bad && !s.gaps) problem('plot "' + name + '": series "' + label + '" has ' + (isNaN(bad[1]) || isNaN(bad[0]) ? 'NaN' : 'Infinity') + ' at x = ' + fmt(bad[0]));
      var role = s.color || SERIES_COLORS[i % SERIES_COLORS.length];
      return { s: s, i: i, pts: pts, label: s.label, role: role, color: K.color(role) };
    }
    // A shade's edge: a series label, a function of x, or a constant y.
    function edgeFn(ref) {
      if (typeof ref === 'function') return ref;
      if (isNum(ref)) return function () { return ref; };
      var s = (cur.series || []).filter(function (q) { return q && q.label != null && String(q.label) === String(ref); })[0];
      if (!s) return null;
      if (typeof s.fn === 'function') return s.fn;
      if (Array.isArray(s.points)) return interp(s.points);
      return null;
    }
    function sampleShade(sh, X, n) {
      var b = Array.isArray(sh.between) ? sh.between : [];
      var fa = edgeFn(b[0]), fb = edgeFn(b[1]);
      if (!fa || !fb) { problem('plot "' + name + '": shade "' + (sh.label || '') + '" needs between: [a, b], each a series label, a function or a number (no series is labelled "' + (fa ? b[1] : b[0]) + '")'); return null; }
      var x0 = Math.max(X.min, isNum(sh.x0) ? sh.x0 : X.min), x1 = Math.min(X.max, isNum(sh.x1) ? sh.x1 : X.max);
      if (!(x1 > x0)) return null;
      var out = [];
      xs(X, n, x0, x1).forEach(function (x) {
        var a, c;
        try { a = fa(x); c = fb(x); } catch (e) { fault('plot "' + name + '" shade', e); a = c = NaN; }
        out.push([x, a, c]);
      });
      return { sh: sh, pts: out };
    }
    function fitY(Y, data, marks, shades) {
      var lo = Infinity, hi = -Infinity;
      function see(v) { if (isNum(v) && (!Y.log || v > 0)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }
      data.forEach(function (d) { d.pts.forEach(function (p) { see(p[1]); }); });
      shades.forEach(function (d) { if (d) d.pts.forEach(function (p) { see(p[1]); see(p[2]); }); });
      (marks || []).forEach(function (m) { see(m.y); });
      if (!isNum(lo)) { lo = Y.log ? 1 : 0; hi = Y.log ? 10 : 1; }
      if (Y.log) {
        Y.min = isNum(Y.min) ? Y.min : Math.pow(10, Math.floor(Math.log10(lo)));
        Y.max = isNum(Y.max) ? Y.max : Math.pow(10, Math.ceil(Math.log10(hi)));
        if (!(Y.max > Y.min)) Y.max = Y.min * 10;
        return;
      }
      if (Y.zero && lo > 0) lo = 0;
      if (Y.zero && hi < 0) hi = 0;
      if (isNum(Y.min)) lo = Y.min;
      if (isNum(Y.max)) hi = Y.max;
      if (hi <= lo) { var pad = Math.abs(lo) * 0.1 || 1; lo -= pad; hi += pad; }
      var step = niceStep((hi - lo) / 4);
      Y.min = isNum(Y.min) ? Y.min : Math.floor(lo / step + 1e-9) * step;
      Y.max = isNum(Y.max) ? Y.max : Math.ceil(hi / step - 1e-9) * step;
    }

    function render() {
      var c = K.theme.c, dark = K.theme.dark;
      var w = Math.round(root.clientWidth || (root.parentNode && root.parentNode.clientWidth) || 320);
      lastW = root.clientWidth;
      var h = Math.round(num(cur.height, 0) || clamp(w * num(cur.aspect, 0.62), 220, 380));
      if (api.maxHeight > 0) h = Math.max(180, Math.min(h, api.maxHeight));
      var dpr = clamp(window.devicePixelRatio || 1, 1, 3);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      var X = axisOf(cur.x, 'x'), Y = axisOf(cur.y, 'y');
      // Curves are sampled once per device pixel column, so they stay smooth on a phone.
      var n = clamp(Math.round(w * dpr), 120, 2400);
      var data = (cur.series || []).map(function (s, i) { return sample(s, i, X, n); });
      var shades = (cur.shade || []).map(function (sh) { return sampleShade(sh || {}, X, Math.round(n / 2)); });
      if (!(Y.max > Y.min) || Y.log && !(Y.min > 0)) fitY(Y, data, cur.marks, shades);
      // afterMove: a series, mark, shade, region or line drawn only once Dan has moved something.
      // The axes (fitted to everything, so they never jump) and the rest are there from the start.
      var later = function (x) { return !!(x && x.afterMove) && !K.moved; };
      api.later = [].concat(cur.series || [], cur.marks || [], cur.shade || [], cur.regions || [], cur.lines || []).some(function (x) { return x && x.afterMove; });
      data = data.filter(function (d) { return !later(d.s); });
      shades = shades.filter(function (d) { return !d || !later(d.sh); });
      var regions = (cur.regions || []).filter(function (r) { return !later(r); }), refLines = (cur.lines || []).filter(function (l) { return !later(l); });
      var marks = (cur.marks || []).filter(function (m) { return !later(m); });
      var tickFont = '12.5px ' + FONT, labelFont = '600 13px ' + FONT;

      // Space for tick labels, then the plotting box.
      ctx.font = tickFont;
      var yt = axisTicks(Y, clamp(Math.floor((h - 70) / 56), 3, 6));
      var yw = 0;
      yt.forEach(function (t) { yw = Math.max(yw, ctx.measureText(tickText(Y, t)).width); });
      var pad = { l: Math.ceil(yw) + 14, r: 14, t: Y.label ? 32 : 14, b: 27 + (X.label ? 20 : 0) };
      var box = { x: pad.l, y: pad.t, w: Math.max(40, w - pad.l - pad.r), h: Math.max(40, h - pad.t - pad.b) };
      var xt = axisTicks(X, clamp(Math.floor(box.w / 58), 2, 6));
      if (xt.length) {
        var lastLabel = ctx.measureText(tickText(X, xt[xt.length - 1])).width / 2;
        var over = Math.ceil(lastLabel - (pad.r + (1 - (X.log ? Math.log(xt[xt.length - 1] / X.min) / Math.log(X.max / X.min) : (xt[xt.length - 1] - X.min) / (X.max - X.min))) * box.w));
        if (over > 0) { pad.r += over + 2; box.w = Math.max(40, w - pad.l - pad.r); }
      }
      function fx(v) { return X.log ? Math.log(v / X.min) / Math.log(X.max / X.min) : (v - X.min) / (X.max - X.min); }
      function fy(v) { return Y.log ? Math.log(v / Y.min) / Math.log(Y.max / Y.min) : (v - Y.min) / (Y.max - Y.min); }
      function sx(v) { return clamp(box.x + fx(v) * box.w, -1e4, 1e4); }
      function sy(v) { return clamp(box.y + box.h - fy(v) * box.h, -1e4, 1e4); }
      geom = { box: box, X: X, Y: Y };
      api.x = sx; api.y = sy; api.box = box;
      var areaAlpha = dark ? 0.3 : 0.16, bandAlpha = dark ? 0.85 : 0.55;
      function bandColor(role) { var k = roleKey(role); return k && FILL_ROLES.indexOf(k) >= 0 ? K.color(k, bandAlpha) : K.color(role, areaAlpha + 0.04); }
      var ok = function (v) { return isNum(v) && (!Y.log || v > 0); };

      // 1. Areas, under everything: regions, shading between lines, filled series.
      ctx.save();
      ctx.beginPath(); ctx.rect(box.x, box.y - 1, box.w, box.h + 2); ctx.clip();
      regions.forEach(function (r) {
        ctx.fillStyle = bandColor(r.color || 'fill2');
        if (isNum(r.x0) || isNum(r.x1)) {
          var a = sx(isNum(r.x0) ? r.x0 : X.min), b = sx(isNum(r.x1) ? r.x1 : X.max);
          ctx.fillRect(Math.min(a, b), box.y, Math.abs(b - a), box.h);
        } else {
          var t = sy(isNum(r.y1) ? r.y1 : Y.max), u = sy(isNum(r.y0) ? r.y0 : Y.min);
          ctx.fillRect(box.x, Math.min(t, u), box.w, Math.abs(u - t));
        }
      });
      shades.forEach(function (d) {
        if (!d) return;
        ctx.fillStyle = bandColor(d.sh.color || 'fill2');
        var run = [];
        function flush() {
          if (run.length > 1) {
            ctx.beginPath();
            run.forEach(function (p, j) { if (j) ctx.lineTo(sx(p[0]), sy(p[1])); else ctx.moveTo(sx(p[0]), sy(p[1])); });
            for (var j = run.length - 1; j >= 0; j--) ctx.lineTo(sx(run[j][0]), sy(run[j][2]));
            ctx.closePath(); ctx.fill();
          }
          run = [];
        }
        d.pts.forEach(function (p) { if (ok(p[1]) && ok(p[2])) run.push(p); else flush(); });
        flush();
      });
      var zero = sy(Y.log ? Y.min : clamp(0, Y.min, Y.max));
      var runsOf = data.map(function (d) {
        var runs = [], run = [];
        d.pts.forEach(function (p) {
          if (isNum(p[0]) && ok(p[1])) run.push([sx(p[0]), sy(p[1])]);
          else if (run.length) { runs.push(run); run = []; }
        });
        if (run.length) runs.push(run);
        if (d.s.fill && !d.s.dots) {
          ctx.fillStyle = K.color(d.role, areaAlpha);
          runs.forEach(function (r) {
            ctx.beginPath(); ctx.moveTo(r[0][0], zero);
            r.forEach(function (q) { ctx.lineTo(q[0], q[1]); });
            ctx.lineTo(r[r.length - 1][0], zero); ctx.closePath(); ctx.fill();
          });
        }
        return runs;
      });
      ctx.restore();

      // 2. Gridlines (horizontal only: calm) and the baseline, over the areas.
      ctx.lineWidth = 1;
      ctx.strokeStyle = c.line;
      yt.forEach(function (t) { var y = Math.round(sy(t)) + 0.5; ctx.beginPath(); ctx.moveTo(box.x, y); ctx.lineTo(box.x + box.w, y); ctx.stroke(); });
      ctx.strokeStyle = c.strong;
      ctx.beginPath(); ctx.moveTo(box.x, Math.round(box.y + box.h) + 0.5); ctx.lineTo(box.x + box.w, Math.round(box.y + box.h) + 0.5); ctx.stroke();

      // 3. Reference lines and series.
      var segs = [];   // screen segments labels should keep off: [x1, y1, x2, y2]
      ctx.save();
      ctx.beginPath(); ctx.rect(box.x, box.y - 1, box.w, box.h + 2); ctx.clip();
      refLines.forEach(function (l) {
        ctx.strokeStyle = K.color(l.color || 'muted');
        ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (isNum(l.x)) { ctx.moveTo(sx(l.x), box.y); ctx.lineTo(sx(l.x), box.y + box.h); segs.push([sx(l.x), box.y, sx(l.x), box.y + box.h]); }
        else if (isNum(l.y)) { ctx.moveTo(box.x, sy(l.y)); ctx.lineTo(box.x + box.w, sy(l.y)); segs.push([box.x, sy(l.y), box.x + box.w, sy(l.y)]); }
        ctx.stroke(); ctx.setLineDash([]);
      });
      data.forEach(function (d, i) {
        var s = d.s;
        ctx.strokeStyle = d.color; ctx.fillStyle = d.color;
        ctx.lineWidth = num(s.width, d.i === 0 ? 2.75 : 2.25);
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.setLineDash(s.dash ? [7, 6] : []);
        if (s.dots) {
          d.pts.forEach(function (p) { if (isNum(p[0]) && isNum(p[1])) { ctx.beginPath(); ctx.arc(sx(p[0]), sy(p[1]), num(s.r, 3.5), 0, 7); ctx.fill(); } });
          return;
        }
        var every = Math.max(1, Math.round(dpr));
        runsOf[i].forEach(function (r) {
          ctx.beginPath();
          r.forEach(function (q, j) { if (j) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); });
          ctx.stroke();
          for (var j = every; j < r.length; j += every) segs.push([r[j - every][0], r[j - every][1], r[j][0], r[j][1]]);
          if (r.length > 1 && (r.length - 1) % every) segs.push([r[r.length - 2][0], r[r.length - 2][1], r[r.length - 1][0], r[r.length - 1][1]]);
        });
        ctx.setLineDash([]);
      });
      ctx.restore();

      // 4. Tick labels and axis titles.
      ctx.font = tickFont; ctx.fillStyle = c.muted; ctx.textBaseline = 'middle'; ctx.textAlign = 'right';
      yt.forEach(function (t) { ctx.fillText(tickText(Y, t), box.x - 8, sy(t)); });
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      var lastRight = -Infinity;
      xt.forEach(function (t) {
        var text = tickText(X, t), tw = ctx.measureText(text).width, x = clamp(sx(t), tw / 2 + 1, w - tw / 2 - 1);
        if (x - tw / 2 < lastRight + 8) return; // skip a label that would collide
        ctx.fillText(text, x, box.y + box.h + 7);
        lastRight = x + tw / 2;
        ctx.strokeStyle = c.strong; ctx.beginPath(); ctx.moveTo(Math.round(sx(t)) + 0.5, box.y + box.h); ctx.lineTo(Math.round(sx(t)) + 0.5, box.y + box.h + 4); ctx.stroke();
      });
      // Axis titles fit the canvas: a smaller size first, then kept inside the edges (a title
      // centred on the plot box sits right of the canvas centre); one far too long is reported.
      function titleText(text, x, y, centred) {
        var avail = w - 8, px = 13, tw;
        for (;;) { ctx.font = '600 ' + px + 'px ' + FONT; tw = ctx.measureText(text).width; if (tw <= avail || px <= 10.5) break; px -= 0.5; }
        var shown = Math.min(tw, avail);
        if (centred) x = clamp(x, shown / 2 + 4, w - shown / 2 - 4);
        if (tw > avail * 1.06) {
          var msg = 'plot "' + name + '": the axis title "' + text + '" is too long for a phone (' + Math.ceil(tw) + 'px, room for ' + Math.floor(avail) + 'px): shorten it';
          if (tw > avail * 1.2) problem(msg); else addUnique(warnings, msg, 12);
        }
        ctx.fillText(text, x, y, avail);
        ctx.font = labelFont;
      }
      ctx.font = labelFont; ctx.fillStyle = c.muted;
      if (X.label) { ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; titleText(String(X.label), box.x + box.w / 2, h - 2, true); }
      if (Y.label) { ctx.textAlign = 'left'; ctx.textBaseline = 'top'; titleText(String(Y.label), 2, 4, false); }

      // 5. Marks: a dot with a ring and optional guides to the axes.
      var placed = [], shown = [];
      api.labels = [];   // where each label went (canvas px), for tests and after()
      marks.forEach(function (m) {
        if (!isNum(m.x) || !isNum(m.y)) { problem('plot "' + name + '": mark "' + (m.label || '') + '" has a non-finite position'); return; }
        var px = sx(m.x), py = sy(m.y), col = K.color(m.color || 'accent2'), rad = num(m.r, 6.5);
        if (px < box.x - 1 || px > box.x + box.w + 1 || py < box.y - 1 || py > box.y + box.h + 1) return;
        if (m.guides) {
          ctx.strokeStyle = col; ctx.globalAlpha = 0.5; ctx.lineWidth = 1.25; ctx.setLineDash([3, 4]);
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, box.y + box.h); ctx.moveTo(px, py); ctx.lineTo(box.x, py); ctx.stroke();
          ctx.setLineDash([]); ctx.globalAlpha = 1;
          segs.push([px, py, px, box.y + box.h], [box.x, py, px, py]);
        }
        ctx.beginPath(); ctx.arc(px, py, rad, 0, 7);
        ctx.fillStyle = col; ctx.fill();
        ctx.lineWidth = 2.5; ctx.strokeStyle = c.bg; ctx.stroke();
        placed.push({ x: px - rad - 2, y: py - rad - 2, w: 2 * rad + 4, h: 2 * rad + 4 });
        if (m.label) shown.push({ px: px, py: py, text: String(m.label) });
      });

      // 6. Labels, each in the first free spot near its thing: clear of the axes and their labels
      // (inside the plot box, or in the margin above and to its right), never over another label
      // or a dot, and as far as possible off the lines. A label with no room is left out (and
      // reported as advice) rather than drawn over something.
      if (Y.label) { ctx.font = labelFont; placed.push({ x: 0, y: 0, w: ctx.measureText(Y.label).width + 8, h: 24 }); }
      function crossings(r) {
        var e = { x: r.x - 2, y: r.y - 2, w: r.w + 4, h: r.h + 4 }, k = 0;
        for (var i = 0; i < segs.length; i++) if (segHits(segs[i][0], segs[i][1], segs[i][2], segs[i][3], e)) k++;
        return k;
      }
      function spot(cands, bw, bh, text) {
        var best = null, cost = Infinity;
        cands.forEach(function (p, i) {
          var r = { x: p[0], y: p[1], w: bw, h: bh };
          if (r.x < box.x + 1 || r.x + bw > w - 2 || r.y < 2 || r.y + bh > box.y + box.h - 1) return;
          if (placed.some(function (q) { return overlap(r, q); })) return;
          var k = crossings(r) * 100 + i;
          if (k < cost) { cost = k; best = r; }
        });
        if (best) { placed.push(best); api.labels.push({ text: String(text), x: best.x, y: best.y, w: best.w, h: best.h }); }
        else if (sink) addUnique(labelSkips, 'plot "' + name + '": the label "' + String(text).slice(0, 40) + '" was left out for lack of room (shorten it or give the plot more space)', 6);
        return best;
      }
      function halo(r, alpha) { ctx.fillStyle = K.color('bg', alpha); roundRect(ctx, r.x, r.y, r.w, r.h, 5); ctx.fill(); }
      ctx.font = '700 13px ' + FONT;
      shown.forEach(function (l) {
        var tw = ctx.measureText(l.text).width, bw = tw + 14, bh = 24, px = l.px, py = l.py;
        var r = spot([[px + 10, py - bh - 8], [px - 10 - bw, py - bh - 8], [px + 10, py + 10], [px - 10 - bw, py + 10],
          [px - bw / 2, py - bh - 14], [px - bw / 2, py + 14], [px + 14, py - bh / 2], [px - 14 - bw, py - bh / 2],
          [px + 10, py - bh - 32], [px - 10 - bw, py - bh - 32], [px + 10, py + 34], [px - 10 - bw, py + 34]], bw, bh, l.text);
        if (!r) return;
        ctx.fillStyle = c.bg; ctx.strokeStyle = c.line; ctx.lineWidth = 1;
        roundRect(ctx, r.x, r.y, bw, bh, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = c.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(l.text, r.x + 7, r.y + bh / 2 + 0.5);
      });
      ctx.font = '600 12px ' + FONT; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      function smallLabel(text, cands, color, alpha) {
        var tw = ctx.measureText(text).width, bw = tw + 8, bh = 18;
        var r = spot(cands(bw, bh), bw, bh, text);
        if (!r) return;
        halo(r, alpha);
        ctx.fillStyle = color; ctx.fillText(text, r.x + 4, r.y + bh / 2 + 0.5);
      }
      // Reference line labels sit beside their line, never across it.
      refLines.forEach(function (l) {
        if (!l.label) return;
        var text = String(l.label);
        if (isNum(l.x)) {
          var x = sx(l.x);
          smallLabel(text, function (bw, bh) { return [[x + 5, box.y + 3], [x - 5 - bw, box.y + 3], [x + 5, box.y + box.h - bh - 3], [x - 5 - bw, box.y + box.h - bh - 3], [x + 5, box.y + box.h / 2 - bh / 2], [x - 5 - bw, box.y + box.h / 2 - bh / 2]]; }, c.muted, 0.85);
        } else if (isNum(l.y)) {
          var y = sy(l.y);
          smallLabel(text, function (bw, bh) { return [[box.x + box.w - bw - 4, y - bh - 3], [box.x + 4, y - bh - 3], [box.x + box.w - bw - 4, y + 3], [box.x + 4, y + 3], [box.x + box.w / 2 - bw / 2, y - bh - 3], [box.x + box.w / 2 - bw / 2, y + 3]]; }, c.muted, 0.85);
        }
      });
      // Shade labels: inside the band where it is wide enough (widest first), else just beside it.
      shades.forEach(function (d) {
        if (!d || !d.sh.label) return;
        var spots = d.pts.filter(function (p) { return ok(p[1]) && ok(p[2]); })
          .map(function (p) { return { x: sx(p[0]), y: (sy(p[1]) + sy(p[2])) / 2, gap: Math.abs(sy(p[1]) - sy(p[2])) }; })
          .sort(function (a, b) { return b.gap - a.gap; });
        if (!spots.length) return;
        var picks = [];
        spots.forEach(function (q) { if (picks.length < 6 && picks.every(function (r) { return Math.abs(r.x - q.x) > 30; })) picks.push(q); });
        smallLabel(String(d.sh.label), function (bw, bh) {
          var cands = [];
          picks.forEach(function (q) { if (q.gap >= bh + 4) cands.push([q.x - bw / 2, q.y - bh / 2], [q.x - bw, q.y - bh / 2], [q.x, q.y - bh / 2]); });
          var q0 = picks[0];
          return cands.concat([[q0.x - bw / 2, q0.y - q0.gap / 2 - bh - 4], [q0.x - bw / 2, q0.y + q0.gap / 2 + 4], [q0.x - bw - 6, q0.y - bh / 2]]);
        }, c.ink, 0.7);
      });
      // Region labels: inside the band, at a corner.
      regions.forEach(function (r) {
        if (!r.label) return;
        var text = String(r.label);
        if (isNum(r.x0) || isNum(r.x1)) {
          var a = Math.min(sx(isNum(r.x0) ? r.x0 : X.min), sx(isNum(r.x1) ? r.x1 : X.max)), b = Math.max(sx(isNum(r.x0) ? r.x0 : X.min), sx(isNum(r.x1) ? r.x1 : X.max));
          smallLabel(text, function (bw, bh) { return [[a + 4, box.y + 3], [b - bw - 4, box.y + 3], [a + 4, box.y + box.h - bh - 3], [b - bw - 4, box.y + box.h - bh - 3], [a + 4, box.y + 24], [b - bw - 4, box.y + 24]]; }, c.ink, 0.6);
        } else {
          var t = Math.min(sy(isNum(r.y1) ? r.y1 : Y.max), sy(isNum(r.y0) ? r.y0 : Y.min)), u = Math.max(sy(isNum(r.y1) ? r.y1 : Y.max), sy(isNum(r.y0) ? r.y0 : Y.min));
          smallLabel(text, function (bw, bh) { return [[box.x + 4, t + 3], [box.x + box.w - bw - 4, t + 3], [box.x + 4, u - bh - 3], [box.x + box.w - bw - 4, u - bh - 3]]; }, c.ink, 0.6);
        }
      });

      if (typeof cur.after === 'function') {
        ctx.save();
        try { cur.after(ctx, api); } catch (e) { fault('plot "' + name + '" after()', e); }
        ctx.restore();
      }

      // Legend (HTML, crisp and wraps on phones) and a text alternative for screen readers.
      while (legend.firstChild) legend.removeChild(legend.firstChild);
      var labelled = data.filter(function (d) { return d.label; });
      if (labelled.length > 1 || cur.legend === true) labelled.forEach(function (d) {
        legend.appendChild(K.el('span', { class: 'k-key' }, K.el('i', { class: d.s.dash ? 'dash' : '', style: { color: d.color } }), d.label));
      });
      var alt = cur.label || ((Y.label || 'y') + ' against ' + (X.label || 'x'));
      shades.forEach(function (d) { if (d && d.sh.label) alt += '. Shaded: ' + d.sh.label; });
      marks.forEach(function (m) { if (m.label) alt += '. ' + m.label + ' at ' + fmt(m.x) + ', ' + fmt(m.y); });
      canvas.setAttribute('aria-label', alt);
    }

    api.draw = function (next) {
      cur = next ? Object.assign({}, base, next) : cur;
      try { render(); api.drawn = true; } catch (e) { fault('plot "' + name + '"', e); }
      heightSoon();
      return api;
    };
    api.redraw = function () { return api.draw(); };
    // Canvas pixel position -> data coordinates (for drag interactions).
    api.invert = function (px, py) {
      if (!geom) return null;
      var b = geom.box, X = geom.X, Y = geom.Y, tx = (px - b.x) / b.w, ty = 1 - (py - b.y) / b.h;
      return { x: X.log ? X.min * Math.pow(X.max / X.min, tx) : X.min + tx * (X.max - X.min), y: Y.log ? Y.min * Math.pow(Y.max / Y.min, ty) : Y.min + ty * (Y.max - Y.min) };
    };
    plots.push(api);
    if (window.ResizeObserver) new ResizeObserver(function () { if (root.clientWidth && root.clientWidth !== lastW) api.draw(); }).observe(root);
    if (o.series || o.marks) api.draw();
    return api;
  };
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }

  // K.bars(target, {max, unit, prefix, fmt, dp, into}) -> {draw(items)}   horizontal bars in HTML
  //   items: [{label, value, color?}]; values are non-negative; max defaults to a nice ceiling.
  K.bars = function (target, o) {
    if (o === undefined && target && typeof target === 'object' && !target.nodeType) { o = target; target = null; }
    o = o || {};
    var root = target ? resolve(target, 'K.bars') : K.el('div');
    if (!target && o.into) place(root, o.into, 'K.bars');
    root.classList.add('k-bars');
    var api = { el: root }, last = null;
    api.draw = function (items, next) {
      last = [items, next];
      var opt = Object.assign({}, o, next || {});
      items = items || [];
      var top = num(opt.max, 0);
      if (!top) { items.forEach(function (it) { if (isNum(it.value)) top = Math.max(top, it.value); }); top = top > 0 ? niceStep(top / 4) * Math.ceil(top / niceStep(top / 4)) : 1; }
      while (root.children.length > items.length) root.removeChild(root.lastChild);
      items.forEach(function (it, i) {
        var row = root.children[i];
        if (!row) {
          row = K.el('div', { class: 'k-bar' }, K.el('div', { class: 'k-bar-head' }, K.el('span'), K.el('b')), K.el('div', { class: 'k-bar-track' }, K.el('i')));
          root.appendChild(row);
        }
        var ok = isNum(it.value);
        if (!ok) problem('bars: "' + (it.label || i) + '" has a non-finite value');
        row.querySelector('span').textContent = it.label || '';
        var d = opt.dp != null ? { dp: opt.dp } : opt.decimals != null ? { dp: opt.decimals } : null;
        var text = ok ? (opt.fmt ? String(opt.fmt(it.value)) : (opt.prefix || '') + fmt(it.value, d) + unitText(opt.unit)) : '—';
        row.querySelector('b').textContent = text;
        var fill = row.querySelector('i');
        fill.style.width = (ok ? clamp(it.value / top, 0, 1) * 100 : 0).toFixed(2) + '%';
        fill.style.background = K.color(it.color || 'accent2');
      });
      heightSoon();
      return api;
    };
    api.redraw = function () { return last ? api.draw(last[0], last[1]) : api; };
    barList.push(api);
    if (o.items) api.draw(o.items);
    return api;
  };

  // ---------- SVG geometry (K.labels and the self-test) ----------
  // Shapes are compared on screen (page px). A text's glyph box is its box with the empty space
  // above the letters and below the baseline trimmed off, so a label sitting just over or under a
  // line is fine and one the line strikes through is not.
  var GEOM = 'line, polyline, polygon, path, rect, circle, ellipse';
  var NOT_DRAWN = 'defs, marker, clipPath, mask, pattern, symbol';
  function ctmScale(m) { return Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) || 1; }
  function glyphRect(b) { return { x: b.left + 1, y: b.top + b.height * 0.2, w: Math.max(0, b.width - 2), h: b.height * 0.58 }; }
  // The outline of a shape as screen segments [x1, y1, x2, y2], sampled along its length (curves
  // every 3 px). A jump between two subpaths (M … M …) is never joined up: on one unbroken path two
  // points a step apart along it are never further apart than that step. Kept until the shape or
  // where it sits changes.
  var outlineCache = new WeakMap();
  function outlineSegs(el) {
    var m = el.getScreenCTM && el.getScreenCTM();
    if (!m) return [];
    var tag = el.tagName.toLowerCase();
    var sig = [m.a, m.b, m.c, m.d, m.e, m.f].join(',') + '|' + ['d', 'points', 'x', 'y', 'width', 'height', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry']
      .map(function (a) { return el.getAttribute(a); }).join('|');
    var known = outlineCache.get(el);
    if (known && known.sig === sig) return known.segs;
    var out = [];
    function P(x, y) { return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]; }
    try {
      if (tag === 'line') {
        out.push(P(el.x1.baseVal.value, el.y1.baseVal.value).concat(P(el.x2.baseVal.value, el.y2.baseVal.value)));
      } else if (tag === 'polyline' || tag === 'polygon') {
        var pts = Array.prototype.map.call(el.points, function (q) { return P(q.x, q.y); });
        if (tag === 'polygon' && pts.length > 2) pts.push(pts[0]);
        for (var i = 1; i < pts.length; i++) out.push(pts[i - 1].concat(pts[i]));
      } else {
        var L = el.getTotalLength();
        if (L > 0) {
          var n = clamp(Math.ceil(L * ctmScale(m) / 3), 2, 400), stepL = L / n, prev = null;
          for (var k = 0; k <= n; k++) {
            var q = el.getPointAtLength(Math.min(L, k * stepL));
            if (prev && Math.hypot(q.x - prev.x, q.y - prev.y) <= stepL * 1.05 + 1e-6) out.push(P(prev.x, prev.y).concat(P(q.x, q.y)));
            prev = { x: q.x, y: q.y };
          }
        }
      }
    } catch (e) { out = []; }
    outlineCache.set(el, { sig: sig, segs: out });
    return out;
  }
  // Where a shape's arrowheads (marker-start, marker-end) sit, as screen boxes: a square the size of
  // the marker along the line, placed as its refX puts it (tip on the end point, or beyond it).
  function arrowheads(el, segs, cs) {
    var out = [];
    if (!segs.length) return out;
    [['markerEnd', segs[segs.length - 1], 1], ['markerStart', segs[0], -1]].forEach(function (k) {
      var ref = cs[k[0]], id = ref && ref !== 'none' && /url\(\s*["']?#([^"')]+)/.exec(ref);
      var mk = id && document.getElementById(id[1]);
      if (!mk || mk.tagName.toLowerCase() !== 'marker') return;
      var s = k[1], at = k[2] > 0 ? [s[2], s[3]] : [s[0], s[1]], dx = s[2] - s[0], dy = s[3] - s[1], len0 = Math.hypot(dx, dy) || 1;
      var orient = mk.getAttribute('orient') || '';
      var dir = k[2] > 0 || orient !== 'auto-start-reverse' ? 1 : -1, ux = dx / len0 * dir, uy = dy / len0 * dir;
      var mw = num(mk.getAttribute('markerWidth'), 3), mh = num(mk.getAttribute('markerHeight'), 3);
      var units = mk.getAttribute('markerUnits') === 'userSpaceOnUse' ? 1 : (parseFloat(cs.strokeWidth) || 1);
      var sc = ctmScale(el.getScreenCTM()) * units, vb = mk.viewBox && mk.viewBox.baseVal, refX = num(mk.getAttribute('refX'), 0);
      var f = vb && vb.width ? (refX - vb.x) / vb.width : refX / mw, len = mw * sc, side = Math.max(len, mh * sc) * 0.8;
      var cx = at[0] + ux * len * (0.5 - f), cy = at[1] + uy * len * (0.5 - f);
      out.push({ x: cx - side / 2, y: cy - side / 2, w: side, h: side });
    });
    return out;
  }
  // Does a segment cross a box, or a turned text's four corners?
  function segInQuad(s, Q) {
    function inside(x, y) {
      var sign = 0;
      for (var i = 0; i < 4; i++) {
        var a = Q[i], b = Q[(i + 1) % 4], c = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]);
        if (c !== 0) { if (sign && (c > 0) !== (sign > 0)) return false; sign = c; }
      }
      return true;
    }
    if (inside(s[0], s[1]) || inside(s[2], s[3])) return true;
    for (var i = 0; i < 4; i++) if (segsCross(s[0], s[1], s[2], s[3], Q[i][0], Q[i][1], Q[(i + 1) % 4][0], Q[(i + 1) % 4][1])) return true;
    return false;
  }
  function segMeets(s, g) { return g.quad ? segInQuad(s, g.quad) : segHits(s[0], s[1], s[2], s[3], g); }
  function boxMeets(r, g) { return g.quad ? quadsMeet(g.quad, [[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]]) : overlap(r, g); }
  // Elements to keep labels off: an element, a selector, or a list of them; a group gives its shapes.
  var crowdedLabels = new WeakSet();   // <text>s K.labels could not place clear of everything
  function avoidList(v) {
    var out = [];
    (function add(x) {
      if (x == null || x === false) return;
      if (typeof x === 'string') { Array.prototype.forEach.call(document.querySelectorAll(x), add); return; }
      if (x.nodeType === 1) {
        if (x.matches(GEOM) || /^text$/i.test(x.tagName)) out.push(x);
        else Array.prototype.forEach.call(x.querySelectorAll(GEOM + ', text'), function (e) { out.push(e); });
        return;
      }
      if (typeof x.length === 'number') Array.prototype.forEach.call(x, add);
    })(v);
    return out;
  }

  // ---------- SVG labels ----------
  // K.labels(svg | g, [{x, y, text, anchor, class, size, color}], {gap, size, avoid}) -> [<text>]
  // Puts text labels on a drawing (in its viewBox units, 13 units high unless size or a class
  // says otherwise) and nudges each one off the labels already there (its own and any other <text>
  // in the drawing), off the lines and shapes in avoid (elements, a selector or a list; a line or
  // path by its course, a filled shape by its box) and inside the drawing's edges: it tries the
  // spot you gave, then just above, below, right and left. Call it in K.update with the same group
  // each time; it replaces that group's labels. A label with no clear spot is noted (crowdedLabels):
  // if the self-test then finds it on a line or a label, it says once that there are more labels
  // than room, with fixes the body can make, rather than per label.
  K.labels = function (into, items, o) {
    o = o || {};
    var g = resolve(into, 'K.labels');
    if (!g) return [];
    var svg = g.tagName.toLowerCase() === 'svg' ? g : g.ownerSVGElement;
    if (g === svg) {
      var mine = null;
      for (var i = 0; i < svg.children.length; i++) if (svg.children[i].getAttribute('class') === 'k-labels') mine = svg.children[i];
      g = mine || svg.appendChild(K.svg('g', { class: 'k-labels' }));
    }
    while (g.firstChild) g.removeChild(g.firstChild);
    if (!svg) return [];
    var sr = svg.getBoundingClientRect(), vb = svg.viewBox && svg.viewBox.baseVal;
    var scale = vb && vb.width && sr.width ? sr.width / vb.width : 1;
    var gap = num(o.gap, 2) * scale, size = num(o.size, 13);
    var taken = [], lines = [], blocks = [];
    Array.prototype.forEach.call(svg.querySelectorAll('text'), function (t) {
      var b = t.getBoundingClientRect();
      if (b.width && !g.contains(t)) taken.push({ x: b.left, y: b.top, w: b.width, h: b.height });
    });
    avoidList(o.avoid).forEach(function (el) {
      if (g.contains(el)) return;
      var cs = getComputedStyle(el), f = rgbaOf(cs.fill), b = el.getBoundingClientRect();
      if (/^text$/i.test(el.tagName)) { if (b.width) blocks.push({ x: b.left, y: b.top, w: b.width, h: b.height }); return; }
      var segs = cs.stroke !== 'none' || /^(line|polyline)$/i.test(el.tagName) ? outlineSegs(el) : [];
      // A shape with a fill is a solid block; an unfilled one (a line, an arc, an outline) only its course.
      if (f && f[3] > 0 && !/^(line|polyline)$/i.test(el.tagName)) { if (b.width || b.height) blocks.push({ x: b.left, y: b.top, w: b.width, h: b.height }); }
      else lines = lines.concat(segs);
      blocks = blocks.concat(arrowheads(el, segs, cs));
    });
    return (items || []).map(function (it) {
      var t = K.svg('text', {
        x: it.x, y: it.y, 'text-anchor': it.anchor || 'middle', class: it.class || null, 'font-size': num(it.size, size),
        fill: it.color ? K.color(it.color) : null, 'dominant-baseline': it.baseline || null,
      }, String(it.text == null ? '' : it.text));
      g.appendChild(t);
      var b = t.getBoundingClientRect();
      if (!b.width) return t;
      var w = b.width, h = b.height, best = null, bestCost = Infinity;
      // Each candidate spot is first pulled inside the drawing, then checked against the others.
      [[0, 0], [0, -(h + gap)], [0, h + gap], [w / 2 + gap * 2, 0], [-(w / 2 + gap * 2), 0], [w / 2 + gap, -(h + gap)], [-(w / 2 + gap), -(h + gap)],
        [w / 2 + gap, h + gap], [-(w / 2 + gap), h + gap], [0, -2 * (h + gap)], [0, 2 * (h + gap)], [w + gap, 0], [-(w + gap), 0]].forEach(function (d, i) {
        var x = clamp(b.left + d[0], sr.left + 1, Math.max(sr.left + 1, sr.right - w - 1)), y = clamp(b.top + d[1], sr.top + 1, Math.max(sr.top + 1, sr.bottom - h - 1));
        var r = { x: x, y: y, w: w, h: h };
        var hit = 0, glyph = glyphRect({ left: x, top: y, width: w, height: h });
        taken.forEach(function (q) { if (overlap({ x: r.x + 1, y: r.y + 1, w: w - 2, h: h - 2 }, q)) hit++; });
        blocks.forEach(function (q) { if (overlap(glyph, { x: q.x - gap, y: q.y - gap, w: q.w + 2 * gap, h: q.h + 2 * gap })) hit++; });
        for (var s = 0; s < lines.length; s++) if (segHits(lines[s][0], lines[s][1], lines[s][2], lines[s][3], glyph)) { hit++; break; }
        var cost = hit * 1000 + Math.hypot(x - b.left, y - b.top) / scale + i * 0.5;
        if (cost < bestCost) { bestCost = cost; best = [x - b.left, y - b.top]; }
      });
      if (bestCost >= 1000) crowdedLabels.add(t);
      if (best[0] || best[1]) {
        t.setAttribute('x', +it.x + best[0] / scale);
        t.setAttribute('y', +it.y + best[1] / scale);
      }
      taken.push({ x: b.left + best[0], y: b.top + best[1], w: w, h: h });
      return t;
    });
  };

  // ---------- stage: the main visual and its controls together ----------
  // K.stage(visual, controls, {max, beside}) -> {el}. Puts the controls right under the main
  // visual and, on a phone, shrinks the visual so the pair fits in about max px (600) of height:
  // Dan can see the picture while his thumb is on the slider. In a wide frame (a laptop) the
  // controls sit beside the visual instead, unless beside is false, and the .say line and
  // .k-readouts that come right after the stage join them in that column, so the sentence that
  // changes is next to the slider he is moving. Secondary figures go below.
  K.stage = function (visual, ctrls, o) {
    o = o || {};
    var v = resolve(visual, 'K.stage'), c = resolve(ctrls, 'K.stage');
    var st = K.el('div', { class: 'k-stage' + (o.beside === false ? ' k-stacked' : '') }), side = K.el('div', { class: 'k-side' });
    v.parentNode.insertBefore(st, v);
    st.appendChild(v);
    st.appendChild(side);
    side.appendChild(c);
    var follow = [];
    for (var n = st.nextElementSibling; n; n = n.nextElementSibling) {
      if (/^(script|style)$/i.test(n.tagName)) continue;
      if (n.classList.contains('say') || n.classList.contains('k-readouts')) follow.push(n); else break;
    }
    stageFill(v); stageFill(c);
    stages.push({ el: st, visual: v, controls: c, side: side, follow: follow, joined: false, max: num(o.max, 600) });
    return { el: st };
  };
  // Beside the visual, the say line and readouts sit under the controls; stacked, back after the stage.
  function stageFollowers(s) {
    var beside = !s.el.classList.contains('k-stacked') && !!window.matchMedia && matchMedia('(min-width: 860px)').matches;
    if (!s.follow.length || beside === s.joined) return;
    if (beside) s.follow.forEach(function (f) { s.side.appendChild(f); });
    else { var after = s.el; s.follow.forEach(function (f) { after.parentNode.insertBefore(f, after.nextSibling); after = f; }); }
    s.joined = beside;
  }
  // Beside each other (a wide frame) the two sides are grid items, and one centred with auto
  // margins shrinks to its narrowest content: a grid of tiles to one column. A side that is a grid,
  // or has a max-width, gets k-fill and fills its column up to that max-width, as on a phone
  // (kit.css). A side with neither (a fixed-size drawing the body centres) keeps its own size, and
  // so does one the body places itself (justify-self).
  function stageFill(el) {
    if (!el || /^(svg|canvas|img|video)$/i.test(el.tagName)) return;
    var cs = getComputedStyle(el), mw = cs.maxWidth;
    el.classList.toggle('k-fill', (/grid/.test(cs.display) || (mw !== 'none' && mw !== '100%')) &&
      /^(auto|normal|stretch|)$/.test(cs.justifySelf || ''));
  }
  function stageFigure(s) {
    if (s.visual.__kplot) return { plot: s.visual.__kplot };
    var f = /^(svg|canvas)$/i.test(s.visual.tagName) ? s.visual : s.visual.querySelector('.k-plot, svg, canvas');
    if (f && f.__kplot) return { plot: f.__kplot };
    if (f && f.classList.contains('k-plot')) return { plot: f.__kplot };
    return f ? { el: f } : null;
  }
  function fitStage(s) {
    if (!s.el.isConnected) return;
    stageFollowers(s);
    stageFill(s.visual); stageFill(s.controls);   // the body's own styles may change with the width
    var f = stageFigure(s);
    if (!f) return;
    if (f.plot) { if (f.plot.maxHeight) { f.plot.maxHeight = 0; f.plot.redraw(); } }
    else {
      f.el.style.maxHeight = '';
      if (s.width != null) { f.el.style.width = s.width; s.width = null; }
    }
    if (document.documentElement.clientWidth >= PHONE) return;
    var extra = s.el.getBoundingClientRect().height - s.max;
    if (extra <= 0) return;
    if (f.plot) {
      f.plot.maxHeight = Math.max(180, f.plot.canvas.getBoundingClientRect().height - extra);
      f.plot.redraw();
    } else {
      var r = f.el.getBoundingClientRect(), h = Math.max(180, r.height - extra);
      f.el.style.maxHeight = h + 'px';
      // A bitmap (a canvas) keeps its shape: with the height capped, its width shrinks to match
      // (an SVG keeps its own by letterboxing). The body's own inline width is back at the next fit.
      if (/^canvas$/i.test(f.el.tagName) && r.height > h) { s.width = f.el.style.width; f.el.style.width = (h * r.width / r.height).toFixed(1) + 'px'; }
    }
  }

  // ---------- figures ----------
  // A custom drawing that spans its column (an <svg> with a viewBox, or a canvas) is capped on
  // wide screens and centred: never wider than 600 px, nor 1.45 times its viewBox width, so
  // its text stays a readable size on desktop while it fills the phone.
  function figures() {
    if (!document.body) return;
    var list = document.body.querySelectorAll('svg, canvas');
    for (var i = 0; i < list.length; i++) {
      var el = list[i], tag = el.tagName.toLowerCase();
      if (el.classList.contains('k-fig') || el.ownerSVGElement) continue;
      if (el.closest('button, a, .k-plot, .k-field, .k-legend, .k-anim')) continue;
      if (tag === 'svg' && !el.getAttribute('viewBox')) continue;
      if (el.style.maxWidth || tag === 'canvas' && el.style.height) continue;
      var w = el.getBoundingClientRect().width, p = el.parentElement;
      if (w < 200 || !p) continue;
      var cs = getComputedStyle(p), pw = p.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
      if (w < 0.9 * pw) continue;
      var max = FIG_MAX;
      if (tag === 'svg') { var vb = el.viewBox && el.viewBox.baseVal; if (vb && vb.width > 0) max = clamp(1.45 * vb.width, 320, FIG_MAX); }
      el.classList.add('k-fig');
      el.style.setProperty('--k-fig-max', Math.round(max) + 'px');
    }
  }

  // ---------- halos ----------
  // SVG text drawn in a colour that stands out from the page gets a thin halo of the page colour
  // (class k-halo), so a label stays readable where it crosses a line or a shape. Text in a colour
  // close to the page's (white on a navy box) gets none; .k-nohalo on the text or a parent opts out.
  // Text with a stroke of its own (outlined lettering, a hand-made halo) keeps it, and so does text
  // whose fill is not a plain colour ('none', a gradient): the halo would paint over the stroke.
  var haloBg = null, haloRaf = 0, ownStroke = new WeakMap();
  // Does the text have a stroke of its own? Read without the halo (whose stroke would answer), and
  // remembered until its stroke, style or class attributes change.
  function stroked(t) {
    var sig = (t.getAttribute('stroke') || '') + '|' + (t.getAttribute('style') || '') + '|' + (t.getAttribute('class') || '').replace(/\bk-halo\b/, '');
    var known = ownStroke.get(t);
    if (known && known.sig === sig) return known.on;
    var had = t.classList.contains('k-halo');
    if (had) t.classList.remove('k-halo');
    var s = getComputedStyle(t).stroke, on = !!s && s !== 'none';
    if (had) t.classList.add('k-halo');
    ownStroke.set(t, { sig: sig, on: on });
    return on;
  }
  function haloOne(t) {
    if (t.closest('.k-nohalo')) { t.classList.remove('k-halo'); return; }
    if (!haloBg) return;
    var f = rgbaOf(getComputedStyle(t).fill);
    t.classList.toggle('k-halo', !!f && f[3] > 0.5 && !stroked(t) &&
      Math.abs(f[0] - haloBg[0]) + Math.abs(f[1] - haloBg[1]) + Math.abs(f[2] - haloBg[2]) > 160);
  }
  function halos() {
    haloRaf = 0;
    if (!document.body) return;
    haloBg = rgbaOf(getComputedStyle(document.body).backgroundColor) || haloBg;
    Array.prototype.forEach.call(document.body.querySelectorAll('svg text'), haloOne);
  }
  function halosSoon() { if (!haloRaf) haloRaf = (window.requestAnimationFrame || setTimeout)(halos); }

  // A new theme, and everything drawn with its colours drawn again.
  function retheme(t) {
    applyTheme(t);
    plots.forEach(function (p) { p.redraw(); });
    barList.forEach(function (b) { b.redraw(); });
    if (everRun) run();
    if (readyCalled) relayout();
  }

  // ---------- layout ----------
  // The text size in px (the self-test's XL pass): the root, so every rem size, and the body
  // follow --k-fs, and the layout is redone for it.
  function setTextSize(px) {
    K.theme.size = px;
    document.documentElement.style.setProperty('--k-fs', px + 'px');
    if (readyCalled) relayout();
  }
  // Width-dependent layout: control end labels and value widths, readout tiles, figure caps
  // and stages. Runs after K.ready(), when the frame changes width, and on a theme change.
  function relayout() {
    if (!document.body) return;
    figures();
    controls.forEach(function (c) { if (c.fit) try { c.fit(); } catch (e) {} });
    readoutList.forEach(function (r) { try { r.layout(); } catch (e) {} });
    stages.forEach(function (s) { try { fitStage(s); } catch (e) {} });
    syncDrags();
    try { halos(); } catch (e) {}
    heightSoon();
  }

  // ---------- animation ----------
  // K.anim({step(dt, t), reset?, label?, autoplay?, into}) -> {el, play, pause, toggle, reset, playing()}
  // step advances your own state (dt in seconds, at most 0.05) and redraws; it may set a control
  // (control.set(v) reruns the pipeline). Return false from step to stop (e.g. the echo is home).
  // reset (optional) adds a Reset button. Never autoplays when the viewer prefers reduced motion;
  // pauses when the page is hidden. Pressing Play counts as Dan moving something. button: false
  // leaves out the Play button when the page's own control starts and stops it (play/pause).
  K.anim = function (o) {
    o = o || {};
    if (typeof o.step !== 'function') throw new Error('K.anim needs step(dt, t)');
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var playing = false, t = 0, last = 0, raf = 0, beat = 0;
    var label = o.label || 'Play';
    var btn = o.button === false ? null : K.el('button', { type: 'button', class: 'k-btn', 'aria-pressed': 'false' });
    var resetBtn = o.reset ? K.el('button', { type: 'button', class: 'k-btn secondary' }, 'Reset') : null;
    var el = K.el('div', { class: 'k-anim' }, btn, resetBtn);
    function paint() {
      if (!btn) return;
      btn.innerHTML = playing ? ICON.pause : ICON.play;
      btn.appendChild(document.createTextNode(playing ? 'Pause' : label));
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    }
    function frame(ts) {
      if (!playing) return;
      var dt = last ? Math.min((ts - last) / 1000, 0.05) : 0;
      last = ts; t += dt;
      var r;
      try { r = o.step(dt, t); } catch (e) { api.pause(); fault('K.anim step', e); return; }
      if (drags.length) syncDrags();
      if (r === false) { api.pause(); return; }
      if (watching() && now() - beat >= CHANGE_MAX) { beat = now(); sendChange(); }   // Dan is watching it
      raf = requestAnimationFrame(frame);
    }
    var api = {
      el: el,
      playing: function () { return playing; },
      play: function () { if (playing) return api; playing = true; last = 0; beat = now(); raf = requestAnimationFrame(frame); paint(); return api; },
      pause: function () { playing = false; cancelAnimationFrame(raf); paint(); return api; },
      toggle: function () { return playing ? api.pause() : api.play(); },
      reset: function () { api.pause(); t = 0; if (o.reset) { try { o.reset(); } catch (e) { fault('K.anim reset', e); } } return api; },
      time: function () { return t; },
    };
    // Play and Pause are Dan doing something: the host hears at once.
    if (btn) btn.addEventListener('click', function () { markMoved(); api.toggle(); changed(); sendChange(); });
    if (resetBtn) resetBtn.addEventListener('click', function () { api.reset(); changed(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) api.pause(); });
    anims.push({ o: o, api: api, label: label, autoplay: !!o.autoplay && !reduce });
    paint();
    if (btn || resetBtn) place(el, o.into, 'K.anim');
    return api;
  };

  // ---------- sound ----------
  // K.sound.tone(hz, {dur, type, gain, at}), K.sound.chord([hz...], {dur, type, gain, stagger}),
  // K.sound.stop(), K.sound.mute(on). Plays only after Dan presses something (call it from a
  // K.button's press), never by itself; quiet by design, with a soft start and end (no clicks).
  // The self-test can't listen, so there it checks each call's numbers without making a sound.
  var audio = { ctx: null, out: null, live: [], gesture: false, muted: false, calls: 0 };
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { document.addEventListener(ev, function () { audio.gesture = true; }, true); });
  var WAVES = ['sine', 'triangle', 'square', 'sawtooth'];
  function soundTrouble(msg) { if (sink) problem(msg); else addUnique(warnings, msg, 8); }
  function audioOut() {
    if (!audio.ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { audio.ctx = new AC(); } catch (e) { return null; }
      audio.out = audio.ctx.createGain();
      audio.out.gain.value = 0.25;
      audio.out.connect(audio.ctx.destination);
    }
    if (audio.ctx.state === 'suspended' && audio.ctx.resume) { try { audio.ctx.resume(); } catch (e) {} }
    return audio.ctx;
  }
  function voice(ac, f, start, dur, type, peak) {
    var osc = ac.createOscillator(), g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f, start);
    var att = Math.min(0.025, dur / 4), rel = Math.min(0.3, dur / 3), end = start + dur;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(peak, start + att);
    g.gain.linearRampToValueAtTime(peak * 0.7, end - rel);
    g.gain.linearRampToValueAtTime(0, end);
    osc.connect(g); g.connect(audio.out);
    osc.start(start); osc.stop(end + 0.05);
    var v = { osc: osc, g: g, end: end };
    audio.live.push(v);
    osc.onended = function () { audio.live = audio.live.filter(function (x) { return x !== v; }); try { g.disconnect(); } catch (e) {} };
  }
  function playNotes(freqs, o, who) {
    o = o || {};
    audio.calls++;
    var list = (freqs || []).map(Number);
    var dur = o.dur == null ? 1 : +o.dur, type = o.type || 'sine', gain = o.gain == null ? 1 : +o.gain;
    var at = num(o.at, 0), stagger = num(o.stagger, 0);
    var bad = list.filter(function (f) { return !(isNum(f) && f >= 20 && f <= 20000); });
    if (!list.length || bad.length) { soundTrouble(who + ' was given ' + (list.length ? 'a frequency of ' + bad[0] : 'no frequencies') + ' (use 20 to 20,000 Hz)'); return false; }
    lowWarn(list, who);
    if (!(isNum(dur) && dur > 0 && dur <= 10)) { soundTrouble(who + ': dur must be more than 0 and at most 10 seconds (got ' + o.dur + ')'); return false; }
    if (WAVES.indexOf(type) < 0) { soundTrouble(who + ': type must be one of ' + WAVES.join(', ')); return false; }
    if (!(isNum(gain) && gain >= 0 && gain <= 1)) { soundTrouble(who + ': gain must be from 0 to 1'); return false; }
    if (sink) return true;
    if (audio.muted || hostMute) return false;
    var active = audio.gesture || (navigator.userActivation && navigator.userActivation.hasBeenActive);
    if (!active) { addUnique(warnings, 'K.sound was asked to play before Dan pressed anything: play sound only from a button press.', 8); return false; }
    var ac = audioOut();
    if (!ac) return false;
    var t = ac.currentTime + 0.03 + Math.max(0, at);
    var peak = gain * (type === 'square' || type === 'sawtooth' ? 0.35 : 0.8) / Math.sqrt(list.length);
    list.forEach(function (f, i) { voice(ac, f, t + i * Math.max(0, stagger), dur, type, peak); });
    return true;
  }
  // Phone speakers give out below about 150 Hz: a lower note may play as silence.
  function lowWarn(list, who) {
    var low = list.filter(function (f) { return f < 150; })[0];
    if (low != null) addUnique(warnings, who + ' plays ' + low + ' Hz, below what a phone speaker can make (about 150 Hz): Dan may hear nothing. Use 200 to 2,000 Hz and say on screen when the real sound is lower.', 8);
  }
  // K.sound.hold(hz, {type, gain, max}) -> {set({hz, gain}), stop(), playing()}: a tone that keeps
  // sounding (up to max seconds, default 20) while the page changes its pitch or loudness, e.g.
  // a slider that makes a hum fade as two waves line up. Start it from a button press.
  function hold(hz, o) {
    o = o || {};
    audio.calls++;
    var type = o.type || 'sine', gain = o.gain == null ? 1 : +o.gain, max = o.max == null ? 20 : +o.max;
    function okHz(f) { return isNum(f) && f >= 20 && f <= 20000; }
    function check(x) {
      x = x || {};
      if (x.hz != null && !okHz(+x.hz)) { soundTrouble('K.sound.hold set() was given a frequency of ' + x.hz + ' (use 20 to 20,000 Hz)'); return false; }
      if (x.gain != null && !(isNum(+x.gain) && +x.gain >= 0 && +x.gain <= 1)) { soundTrouble('K.sound.hold set(): gain must be from 0 to 1 (got ' + x.gain + ')'); return false; }
      return true;
    }
    var stub = { set: function (x) { check(x); return stub; }, stop: function () { return stub; }, playing: function () { return false; } };
    if (!okHz(+hz)) { soundTrouble('K.sound.hold was given a frequency of ' + hz + ' (use 20 to 20,000 Hz)'); return stub; }
    if (WAVES.indexOf(type) < 0) { soundTrouble('K.sound.hold: type must be one of ' + WAVES.join(', ')); return stub; }
    if (!(isNum(gain) && gain >= 0 && gain <= 1)) { soundTrouble('K.sound.hold: gain must be from 0 to 1'); return stub; }
    if (!(isNum(max) && max > 0 && max <= 60)) { soundTrouble('K.sound.hold: max must be more than 0 and at most 60 seconds'); return stub; }
    lowWarn([+hz], 'K.sound.hold');
    if (sink || audio.muted || hostMute) return stub;
    var active = audio.gesture || (navigator.userActivation && navigator.userActivation.hasBeenActive);
    if (!active) { addUnique(warnings, 'K.sound was asked to play before Dan pressed anything: play sound only from a button press.', 8); return stub; }
    var ac = audioOut();
    if (!ac) return stub;
    var scale = type === 'square' || type === 'sawtooth' ? 0.35 : 0.8;
    var osc = ac.createOscillator(), g = ac.createGain(), t0 = ac.currentTime + 0.02, end = t0 + max, on = true;
    osc.type = type;
    osc.frequency.setValueAtTime(+hz, t0);
    function fadeOut(at) { g.gain.setTargetAtTime(0, Math.max(at, ac.currentTime), 0.08); }
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain * scale, t0 + 0.03);
    fadeOut(end - 0.3);
    osc.connect(g); g.connect(audio.out);
    osc.start(t0); osc.stop(end + 0.1);
    var v = { osc: osc, g: g, end: end };
    audio.live.push(v);
    osc.onended = function () { on = false; audio.live = audio.live.filter(function (x) { return x !== v; }); try { g.disconnect(); } catch (e) {} };
    var api = {
      set: function (x) {
        if (!on || !check(x)) return api;
        var t = ac.currentTime;
        if (x.hz != null) osc.frequency.setTargetAtTime(+x.hz, t, 0.03);
        if (x.gain != null) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.setTargetAtTime(+x.gain * scale, t, 0.04); fadeOut(end - 0.3); }
        return api;
      },
      stop: function () {
        if (!on) return api;
        var t = ac.currentTime;
        try { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + 0.06); osc.stop(t + 0.08); } catch (e) {}
        return api;
      },
      playing: function () { return on && ac.currentTime < end; },
    };
    return api;
  }
  K.sound = {
    tone: function (hz, o) { return playNotes([hz], o, 'K.sound.tone'); },
    hold: hold,
    chord: function (list, o) { return playNotes(Array.isArray(list) ? list : [], o, 'K.sound.chord'); },
    stop: function () {
      if (!audio.ctx) return K.sound;
      var t = audio.ctx.currentTime;
      audio.live.forEach(function (v) {
        try { v.g.gain.cancelScheduledValues(t); v.g.gain.setValueAtTime(v.g.gain.value, t); v.g.gain.linearRampToValueAtTime(0, t + 0.06); v.osc.stop(t + 0.08); } catch (e) {}
      });
      return K.sound;
    },
    mute: function (on) { audio.muted = on !== false; if (audio.muted) K.sound.stop(); return K.sound; },
  };
  Object.defineProperty(K.sound, 'muted', { get: function () { return audio.muted || hostMute; }, enumerable: true });
  Object.defineProperty(K.sound, 'ready', { get: function () { return !!audio.ctx && audio.ctx.state === 'running'; }, enumerable: true });
  Object.defineProperty(K.sound, 'playing', { get: function () { return !!audio.ctx && audio.live.some(function (v) { return v.end > audio.ctx.currentTime; }); }, enumerable: true });

  // ---------- checks and ready ----------
  // K.check(label, fn, {source}) -> fn() must return true. Use K.at({...}) to ask the model.
  K.check = function (label, fn, o) {
    if (typeof fn !== 'function') throw new Error('K.check "' + label + '" needs a function');
    var src = typeof o === 'string' ? o : o && o.source;
    checks.push({ label: String(label), fn: fn, source: src ? String(src) : undefined });
    return K;
  };
  function runChecks() {
    return checks.map(function (c) {
      var r = { label: c.label, ok: false };
      if (c.source) r.source = c.source;
      try {
        var v = c.fn();
        r.ok = v === true;
        if (!r.ok) r.error = 'returned ' + (typeof v === 'number' ? fmt(v, { sig: 6 }) : String(v)).slice(0, 60);
      } catch (e) { r.error = errText(e) + stackLine(e); }
      return r;
    });
  }
  // Call once at the end of the body script: draws the opening state and reports checks.
  K.ready = function () {
    if (readyCalled) return K;
    readyCalled = true;
    noteOwnText();
    run();
    relayout();
    var results = runChecks();
    // beside: a K.stage here puts its controls beside the visual in a wide frame, so the host can
    // give the page that width; without one, a wider frame only adds empty space.
    post({ type: 'ready', checks: results, beside: stages.some(function (s) { return !s.el.classList.contains('k-stacked'); }) });
    sendHeight();
    [60, 250, 800, 2000].forEach(function (ms) { setTimeout(sendHeight, ms); });
    anims.forEach(function (a) { if (a.autoplay) a.api.play(); });
    return K;
  };
  // Call when Dan has finished the page (its last puzzle solved): the app marks the lesson done
  // and celebrates. Safe to call more than once (the app celebrates again).
  K.complete = function () {
    post({ type: 'complete' });
    return K;
  };

  // ---------- self-test ----------
  function describeEl(el) {
    var s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    var cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/)[0] : (el.getAttribute && el.getAttribute('class') || '').trim().split(/\s+/)[0];
    if (cls) s += '.' + cls;
    return '<' + s + '>';
  }
  // A stable key for "the same element" across redraws (tag and position among its siblings).
  function pathOf(el) {
    var parts = [];
    for (var e = el, k = 0; e && e !== document.body && k < 8; e = e.parentElement, k++) {
      var i = 0;
      for (var s = e.previousElementSibling; s; s = s.previousElementSibling) if (s.tagName === e.tagName) i++;
      parts.unshift(e.tagName + i + (e.id ? '#' + e.id : ''));
    }
    return parts.join('>');
  }
  function snippet(text) { text = String(text).replace(/\s+/g, ' ').trim(); return text.length > 40 ? text.slice(0, 39) + '…' : text; }
  function overflowNow() {
    var de = document.documentElement, cw = de.clientWidth;
    if (de.scrollWidth <= cw + 1) return null;
    var culprits = [], all = document.body ? document.body.getElementsByTagName('*') : [];
    for (var i = 0; i < all.length && culprits.length < 3; i++) {
      var el = all[i], r = el.getBoundingClientRect();
      if (r.width && r.right > cw + 1) {
        var p = el.parentElement, pr = p && p !== document.body ? p.getBoundingClientRect() : null;
        if (!pr || pr.right <= cw + 1) culprits.push(describeEl(el) + ' reaches ' + Math.round(r.right) + 'px');
      }
    }
    return 'content is ' + de.scrollWidth + 'px wide in a ' + cw + 'px frame' + (culprits.length ? ': ' + culprits.join(', ') : '');
  }
  // A word in a wrapping text node that is split across two lines (overflow-wrap breaks a word
  // wider than its box: "Germany" as "German" / "y"). Hyphens, soft hyphens and spaces are
  // ordinary breaks, so "Austria-" / "Hungary" is fine. Words come from Intl.Segmenter (else
  // runs of Latin letters and digits). Scripts that wrap between characters (Chinese, Japanese,
  // Korean) or by the line breaker's own dictionary (Thai, Lao, Khmer, Myanmar) end a line
  // anywhere in a "word", so they are never flagged. Changes `range`. -> {word, need} | null
  var WRAPS_ANYWHERE = /[\p{sc=Han}\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Hangul}\p{sc=Bopomofo}\p{sc=Thai}\p{sc=Lao}\p{sc=Khmer}\p{sc=Myanmar}]/u;
  var LATIN_WORD = /[\p{sc=Latin}\p{N}][\p{sc=Latin}\p{N}\p{M}'\u2019]*/gu;
  var segmenter = null;
  try { segmenter = new Intl.Segmenter(undefined, { granularity: 'word' }); } catch (e) { /* the Latin rule below */ }
  function wordsOf(text) {
    var out = [], m;
    if (segmenter) {
      Array.from(segmenter.segment(text), function (s) {
        if (!s.isWordLike || WRAPS_ANYWHERE.test(s.segment)) return;
        // A soft hyphen is a break too. The range of the part after one also holds the hyphen
        // drawn at the end of the line before, so that part is measured from its second letter.
        var at = s.index;
        s.segment.split('\u00ad').forEach(function (w, k) { out.push({ index: at, word: w, from: k ? 1 : 0 }); at += w.length + 1; });
      });
    } else {
      LATIN_WORD.lastIndex = 0;
      while ((m = LATIN_WORD.exec(text))) out.push({ index: m.index, word: m[0], from: text.charAt(m.index - 1) === '\u00ad' ? 1 : 0 });
    }
    return out;
  }
  function splitWord(n, range) {
    var words = wordsOf(n.nodeValue);
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (w.word.length < 2) continue;
      range.setStart(n, w.index + (w.from || 0));
      range.setEnd(n, w.index + w.word.length);
      var rs = Array.prototype.filter.call(range.getClientRects(), function (r) { return r.width > 0; });
      if (rs.length > 1 && rs[rs.length - 1].top - rs[0].top > rs[0].height / 2) {
        if (w.from) {   // the whole word for its width, less the hyphen on the line before
          var line1 = rs[0].top - rs[0].height / 2;
          range.setStart(n, w.index);
          rs = Array.prototype.filter.call(range.getClientRects(), function (r) { return r.width > 0 && r.top > line1; });
        }
        return { word: w.word, need: rs.reduce(function (sum, r) { return sum + r.width; }, 0) };
      }
    }
    return null;
  }
  // Text a person can't fully read at this width: cut off by its own or an ancestor's overflow
  // (hidden, clip, or a text-overflow ellipsis), a no-wrap line spilling out of its box, a word
  // split across two lines, text off the left edge, and SVG text Dan can't read (svgNow).
  // -> [{key, msg, warn?}]   warn: advice, not a fault
  function clippedNow() {
    var out = [], styles = new Map(), hidden = new Map();
    if (!document.body) return out;
    function st(el) { var s = styles.get(el); if (!s) { s = getComputedStyle(el); styles.set(el, s); } return s; }
    // Text kept for screen readers only (the usual visually-hidden box: 1 x 1 px with its overflow
    // hidden, clip: rect(0 0 0 0) or clip-path: inset(50%)) is cut off on purpose.
    function srOnly(el) {
      if (hidden.has(el)) return hidden.get(el);
      var on = false;
      for (var a = el; a && a !== document.body && !on; a = a.parentElement) {
        var as = st(a);
        if (/^rect\(0(px)?,? 0(px)?,? 0(px)?,? 0(px)?\)$/.test(as.clip) || /^inset\(50%\)$/.test(as.clipPath)) on = true;
        else if (/hidden|clip/.test(as.overflowX + as.overflowY)) { var r = a.getBoundingClientRect(); on = r.width <= 1 && r.height <= 1; }
      }
      hidden.set(el, on);
      return on;
    }
    var range = document.createRange();
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var seenEl = new Set();
    for (var n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!/\S/.test(n.nodeValue)) continue;
      var el = n.parentElement;
      if (!el || seenEl.has(el) || el.closest('script, style, svg, noscript, template, textarea, select')) continue;
      var es = st(el);
      if (es.visibility !== 'visible' || es.display === 'none' || +es.opacity === 0 || srOnly(el)) continue;
      range.selectNodeContents(n);
      var b = range.getBoundingClientRect();
      if (!b.width || !b.height) continue;
      var text = snippet(el.textContent || n.nodeValue), fs = parseFloat(es.fontSize) || 16;
      if (b.left < -1) { seenEl.add(el); out.push({ key: 'left|' + pathOf(el), msg: '"' + text + '" runs off the left edge of the page' }); continue; }
      // Only a node that wraps onto more than one line can split a word, and not where the body
      // asks for breaks inside words on purpose (hyphens: auto, a DNA string with break-all).
      var anyBreak = (es.hyphens || es.webkitHyphens) === 'auto' || es.wordBreak === 'break-all' || es.overflowWrap === 'anywhere' || es.lineBreak === 'anywhere';
      var split = !anyBreak && range.getClientRects().length > 1 && splitWord(n, range);
      if (split) {
        var box = el;
        while (box.parentElement && box !== document.body && /^(inline|contents)$/.test(st(box).display)) box = box.parentElement;
        var bs = st(box), room = box.clientWidth - (parseFloat(bs.paddingLeft) || 0) - (parseFloat(bs.paddingRight) || 0);
        seenEl.add(el);
        out.push({ key: 'split|' + pathOf(el), msg: 'the word "' + split.word + '" is split across two lines in ' + describeEl(box) + ' (it needs ' + Math.ceil(split.need) + 'px and has ' + Math.max(0, Math.floor(room)) + 'px)' });
        continue;
      }
      // A line that may not wrap (white-space: nowrap or pre) spilling out of its own box.
      if (/^(nowrap|pre)$/.test(es.whiteSpace) && es.display !== 'inline' && el.clientWidth) {
        var er = el.getBoundingClientRect(), left = er.left + el.clientLeft, right = left + el.clientWidth;
        if (b.right > right + 2 || b.left < left - 2) {
          if (es.overflowX === 'visible') { seenEl.add(el); out.push({ key: 'spill|' + pathOf(el), msg: '"' + text + '" spills out of ' + describeEl(el) + ' (it needs ' + Math.ceil(b.width) + 'px and has ' + el.clientWidth + 'px)' }); continue; }
        }
      }
      for (var a = el; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
        var as = st(a);
        if (as.display === 'inline' || as.display === 'contents') continue;
        var cx = as.overflowX === 'hidden' || as.overflowX === 'clip', cy = as.overflowY === 'hidden' || as.overflowY === 'clip';
        if (!cx && !cy) continue;
        var r = a.getBoundingClientRect(), L = r.left + a.clientLeft, T = r.top + a.clientTop, R = L + a.clientWidth, B = T + a.clientHeight;
        var padL = parseFloat(as.paddingLeft) || 0, padR = parseFloat(as.paddingRight) || 0;
        // Overflow clips at the padding edge; an ellipsis already shows at the content edge.
        var dots = as.textOverflow === 'ellipsis';
        if (dots) { L += padL; R -= padR; }
        var tolY = Math.max(2, fs * 0.25);
        var cutX = cx && (b.left < L - 1 || b.right > R + 1), cutY = cy && (b.top < T - tolY || b.bottom > B + tolY);
        if (cutX || cutY) {
          seenEl.add(el);
          var why = cutX ? (dots ? 'shortened with "…": ' : '') + 'it needs ' + Math.ceil(b.width) + 'px and has ' + Math.max(0, Math.floor(a.clientWidth - padL - padR)) + 'px'
            : 'cut off at the ' + (b.bottom > B + tolY ? 'bottom' : 'top');
          out.push({ key: 'clip|' + pathOf(el), msg: '"' + text + '" is cut off by ' + describeEl(a) + ' (' + why + ')' });
          break;
        }
      }
    }
    var phone = document.documentElement.clientWidth < PHONE, page = rgbaOf(K.theme.c.bg) || [255, 255, 255, 1], panelBg = rgbaOf(K.theme.c.panel) || page;
    Array.prototype.forEach.call(document.body.querySelectorAll('svg'), function (svg) {
      if (svg.ownerSVGElement || svg.closest('button')) return;
      svgNow(svg, st, out, phone, page, panelBg);
    });
    return out;
  }
  // SVG text Dan can't read: outside the drawing's visible box, too small on a phone, printed over
  // another label (or so close to one on its row that the two read as one: advice, warn: true),
  // struck through by a line or sitting on an arrowhead, or too close in colour to what is behind
  // it (3:1 at least: against the page and the panel colour both, when it sits on the page).
  var TEXT_MIN = 11;   // px on a phone; a 340-wide drawing shows at about 0.9x there
  function svgNow(svg, st, out, phone, page, panelBg) {
    var sr = svg.getBoundingClientRect();
    if (!sr.width || !sr.height) return;
    var ss = st(svg), clips = ss.overflow !== 'visible';
    var boxes = [];
    function opacityTo(el) {
      var o = 1;
      for (var p = el; p && p !== svg.parentNode; p = p.parentNode) if (p.nodeType === 1) o *= num(st(p).opacity, 1);
      return o;
    }
    Array.prototype.forEach.call(svg.querySelectorAll('text'), function (t) {
      var txt = (t.textContent || '').trim();
      if (!txt) return;
      var ts = st(t);
      if (ts.visibility !== 'visible' || ts.display === 'none') return;
      for (var p = t; p && p !== svg; p = p.parentNode) if (p.nodeType === 1 && (+st(p).opacity === 0 || st(p).display === 'none')) return;
      var b = t.getBoundingClientRect();
      if (!b.width || !b.height) return;
      var tol = Math.max(1.5, b.height * 0.12), key = pathOf(t);
      if (clips) {
        var sides = [];
        if (b.left < sr.left - 1.5) sides.push('left by ' + Math.ceil(sr.left - b.left) + 'px');
        if (b.right > sr.right + 1.5) sides.push('right by ' + Math.ceil(b.right - sr.right) + 'px');
        if (b.top < sr.top - tol) sides.push('top by ' + Math.ceil(sr.top - b.top) + 'px');
        if (b.bottom > sr.bottom + tol) sides.push('bottom by ' + Math.ceil(b.bottom - sr.bottom) + 'px');
        if (sides.length) out.push({ key: 'svgout|' + key, msg: 'SVG text "' + snippet(txt) + '" runs outside its drawing (' + sides.join(', ') + ')' });
      }
      var quad = turnedQuad(t), m = t.getScreenCTM(), sc = m ? ctmScale(m) : 1;
      // Its smallest letters (a tspan may be smaller), as shown on a phone.
      if (phone) {
        var least = Infinity;
        [t].concat(Array.prototype.slice.call(t.querySelectorAll('tspan, textPath'))).forEach(function (x) {
          if (x !== t && !(x.textContent || '').trim()) return;
          var fs = parseFloat(st(x).fontSize);
          if (fs > 0 && fs < least) least = fs;
        });
        var px = least * sc;
        if (isFinite(px) && px < TEXT_MIN - 0.25) out.push({ key: 'small|' + key, msg: 'SVG text "' + snippet(txt) + '" shows at ' + Math.round(px * 10) / 10 + ' px on a phone, too small to read: give it a font-size of at least ' + Math.ceil(TEXT_MIN / sc) + ' (13-16 in a drawing about 340 wide)' });
      }
      var cx = b.left + b.width / 2, cy = b.top + b.height / 2;
      if (quad) { cx = (quad[0][0] + quad[2][0]) / 2; cy = (quad[0][1] + quad[2][1]) / 2; }
      // Its own halo: a stroke of its own, painted under the letters (paint-order: stroke), at
      // least 2 px wide; whether it is the colour behind it is read below.
      var po = String(ts.paintOrder || 'normal'), ps = po.indexOf('stroke'), pf = po.indexOf('fill');
      var halo = ps >= 0 && (pf < 0 || ps < pf) && stroked(t) && (parseFloat(ts.strokeWidth) || 0) * sc >= 2 ? rgbaOf(ts.stroke) : null;
      boxes.push({ x: b.left, y: b.top, w: b.width, h: b.height, text: txt, key: key, quad: quad, el: t, cx: cx, cy: cy, ts: ts,
        glyph: quad ? { quad: quad } : glyphRect(b), near: quad ? { x: b.left, y: b.top, w: b.width, h: b.height } : glyphRect(b), cover: [],
        halo: halo && halo[3] * num(ts.strokeOpacity, 1) > 0.9 ? halo : null, crowded: crowdedLabels.has(t) });
    });
    if (!boxes.length) return;
    // Labels K.labels could not place clear (more labels than room): one fault for the drawing,
    // with a fix the body can make, instead of one per label telling it to use avoid.
    var crowdedHit = false, all = out;
    out = { push: function (x) { if (x.crowded) { if (!x.warn) crowdedHit = true; return; } all.push(x); } };
    var crowdOf = function () { for (var k = 0; k < arguments.length; k++) if (arguments[k].crowded) return true; return false; };
    for (var i = 0; i < boxes.length; i++) for (var j = i + 1; j < boxes.length; j++) {
      var p1 = boxes[i], p2 = boxes[j];
      var ix = Math.min(p1.x + p1.w, p2.x + p2.w) - Math.max(p1.x, p2.x), iy = Math.min(p1.y + p1.h, p2.y + p2.h) - Math.max(p1.y, p2.y);
      // Two labels on one row with almost no space between them read as one ("ignores itignores it").
      if (!p1.quad && !p2.quad && p1.text !== p2.text && iy > 0.5 * Math.min(p1.h, p2.h) && ix > -4 && ix <= 2) {
        out.push({ warn: true, crowded: crowdOf(p1, p2), key: 'crowd|' + p1.key + '|' + p2.key, msg: 'SVG labels "' + snippet(p1.text) + '" and "' + snippet(p2.text) + '" are ' + (ix >= 0 ? 'touching' : 'only ' + Math.round(-ix) + ' px apart') + ' on one row, so they read as one: leave at least 4 px between them, or label only what differs' });
      }
      if (ix <= 0 || iy <= 0) continue;
      // Turned text (diagonal timeline years): its upright box is much bigger than the words, so
      // the words' own boxes are compared, a little inside their edges as below.
      if (p1.quad || p2.quad) {
        if (p1.text === p2.text && Math.abs(p1.x - p2.x) < 1 && Math.abs(p1.y - p2.y) < 1) continue;
        if (quadsMeet(p1.quad || uprightQuad(p1), p2.quad || uprightQuad(p2))) out.push({ crowded: crowdOf(p1, p2), key: 'overlap|' + p1.key + '|' + p2.key, msg: 'SVG labels "' + snippet(p1.text) + '" and "' + snippet(p2.text) + '" are printed over each other' });
        continue;
      }
      var area = ix * iy, small = Math.min(p1.w * p1.h, p2.w * p2.h);
      if (p1.text === p2.text && area > 0.9 * small) continue;   // the same text drawn twice (a halo)
      // Any real overlap reads as a collision ("germ arrivesame germ returns"), even a few letters.
      if (ix > 2 && iy > 0.35 * Math.min(p1.h, p2.h) && area > 0.03 * small) out.push({ crowded: crowdOf(p1, p2), key: 'overlap|' + p1.key + '|' + p2.key, msg: 'SVG labels "' + snippet(p1.text) + '" and "' + snippet(p2.text) + '" are printed over each other' });
    }
    // The drawing's shapes, as painted: what lies behind each label, and the lines that cross one.
    var shapes = [];
    Array.prototype.forEach.call(svg.querySelectorAll(GEOM), function (el) {
      if (el.closest(NOT_DRAWN) || el.classList.contains('k-drag-hit')) return;
      var cs = st(el);
      if (cs.visibility !== 'visible' || cs.display === 'none') return;
      for (var p = el.parentNode; p && p !== svg; p = p.parentNode) if (p.nodeType === 1 && st(p).display === 'none') return;
      var op = opacityTo(el), r = el.getBoundingClientRect();
      if (op < 0.05 || !r.width && !r.height) return;
      var m = el.getScreenCTM(), fill = rgbaOf(cs.fill), stroke = rgbaOf(cs.stroke), sw = (parseFloat(cs.strokeWidth) || 0) * (m ? ctmScale(m) : 1);
      var fa = fill ? fill[3] * num(cs.fillOpacity, 1) * op : 0, sa = stroke ? stroke[3] * num(cs.strokeOpacity, 1) * op : 0;
      shapes.push({ el: el, cs: cs, r: r, m: m, fill: fa > 0.02 ? { c: fill, a: Math.min(1, fa) } : null, stroke: sa > 0.02 && sw > 0 ? { c: stroke, a: Math.min(1, sa), w: sw } : null });
    });
    // The colour behind the drawing: the nearest box with a background of its own (else the page).
    var base = page;
    for (var a = svg.parentElement; a; a = a.parentElement) { var bc = rgbaOf(st(a).backgroundColor); if (bc && bc[3] > 0.5) { base = bc; break; } }
    var same = function (x, y) { return Math.abs(x[0] - y[0]) + Math.abs(x[1] - y[1]) + Math.abs(x[2] - y[2]) < 6; };
    var onPage = same(base, page) || same(base, panelBg);
    boxes.forEach(function (bx) {
      var col = base.slice(0, 3), under = 0;
      shapes.forEach(function (sh) {
        if (!(sh.el.compareDocumentPosition(bx.el) & 4) || !sh.m) return;   // painted after the text: not behind it
        if (bx.cx < sh.r.left - 1 || bx.cx > sh.r.right + 1 || bx.cy < sh.r.top - 1 || bx.cy > sh.r.bottom + 1) return;
        var q = new DOMPoint(bx.cx, bx.cy).matrixTransform(sh.m.inverse()), hit = null;
        try {
          if (sh.fill && sh.el.isPointInFill(q)) hit = sh.fill;
          else if (sh.stroke && sh.stroke.w >= bx.h * 0.6 && sh.el.isPointInStroke(q)) hit = sh.stroke;   // a band it sits on
        } catch (e) { hit = null; }
        if (!hit) return;
        col = overOf(hit.c, hit.a, col); under++;
        if (hit.a > 0.9 && covers(sh.r, bx.near)) bx.cover.push(sh.el);
      });
      if (bx.halo && contrastOf(overOf(bx.halo, 1, col), col) >= 1.5) bx.halo = null;
      var f = rgbaOf(bx.ts.fill), alpha = f ? f[3] * num(bx.ts.fillOpacity, 1) * opacityTo(bx.el) : 0;
      if (!f || alpha < 0.05) return;   // no plain fill (an outline, a gradient): nothing to measure
      var worst = Infinity;
      (under || !onPage ? [col] : [page, panelBg]).forEach(function (bg) { worst = Math.min(worst, contrastOf(overOf(f, Math.min(1, alpha), bg), bg)); });
      if (worst < 3 - 1e-6) out.push({ crowded: bx.crowded, key: 'contrast|' + bx.key, msg: 'SVG text "' + snippet(bx.text) + '" is hard to read: ' + Math.floor(worst * 10) / 10 + ':1 contrast with ' + (under ? 'the shape behind it' : 'the page') + ' (it needs 3:1). Draw text in ink, muted, accent2, accent, warn or good (on-accent2 on a navy shape), with var(--k-…) or K.color in K.update, so it follows the theme' });
    });
    // Lines through a label: a stroked line, path or outline whose course crosses its letters, or
    // an arrowhead on them. Not faint guides (a halo keeps the label readable over those), not a
    // band thick enough to be what the text sits on, and not a line hidden under a solid shape
    // painted between it and the label (a label's own backing pill).
    var hidden = function (bx, el) { return bx.cover.some(function (cv) { return !!(el.compareDocumentPosition(cv) & 4); }); };
    shapes.forEach(function (sh) {
      var marked = sh.cs.markerEnd !== 'none' || sh.cs.markerStart !== 'none', segs = null;
      if (sh.stroke && (/^(line|polyline|path)$/i.test(sh.el.tagName) || !sh.fill) && contrastOf(overOf(sh.stroke.c, sh.stroke.a, page), page) >= 1.5) {
        var pad = sh.stroke.w / 2 + 2, rr = { x: sh.r.left - pad, y: sh.r.top - pad, w: sh.r.width + 2 * pad, h: sh.r.height + 2 * pad };
        boxes.forEach(function (bx) {
          if (!overlap(rr, bx.near) || sh.stroke.w >= bx.h * 0.6 || hidden(bx, sh.el) || bx.halo) return;
          segs = segs || outlineSegs(sh.el);
          for (var k = 0; k < segs.length; k++) {
            if (segMeets(segs[k], bx.glyph)) { out.push({ crowded: bx.crowded, key: 'cross|' + bx.key + '|' + pathOf(sh.el), msg: 'SVG text "' + snippet(bx.text) + '" has a line through it (' + describeEl(sh.el) + '): move the label off the line (K.labels with avoid: [that line]) or stop the line short of it' }); break; }
          }
        });
      }
      if (!marked) return;
      var heads = arrowheads(sh.el, segs || outlineSegs(sh.el), sh.cs);
      boxes.forEach(function (bx) {
        if (!hidden(bx, sh.el) && heads.some(function (hd) { return boxMeets(hd, bx.glyph); })) out.push({ crowded: bx.crowded, key: 'head|' + bx.key + '|' + pathOf(sh.el), msg: 'SVG text "' + snippet(bx.text) + '" sits on an arrowhead (' + describeEl(sh.el) + '): move the label clear of the arrow\'s tip' });
      });
    });
    if (crowdedHit) all.push({ key: 'crowded|' + pathOf(svg), msg: 'K.labels has more labels than room in ' + describeEl(svg) + ': some still sit on a line, a shape or another label, ' +
      'so avoid cannot be honoured. Label fewer things (only what differs), or move the labels into a key under the drawing, or a list beside it in HTML' });
  }
  // Does a shape's box cover most (80%) of a label's? Only then is it the label's backing (a pill).
  function covers(r, g) {
    var ix = Math.min(r.right, g.x + g.w) - Math.max(r.left, g.x), iy = Math.min(r.bottom, g.y + g.h) - Math.max(r.top, g.y);
    return ix > 0 && iy > 0 && ix * iy >= 0.8 * g.w * g.h;
  }
  // The corners (page px) of a turned SVG text's own box, trimmed as the upright test allows (1 px
  // along the line, 17.5% of its height at top and bottom), or null when the text is not turned.
  function turnedQuad(t) {
    var m = t.getScreenCTM && t.getScreenCTM();
    if (!m || Math.abs(m.b) < 1e-6 && Math.abs(m.c) < 1e-6) return null;
    var bb = t.getBBox(), dx = 1 / (Math.hypot(m.a, m.b) || 1), dy = bb.height * 0.175;
    var x0 = bb.x + dx, x1 = bb.x + bb.width - dx, y0 = bb.y + dy, y1 = bb.y + bb.height - dy;
    return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(function (p) { return [m.a * p[0] + m.c * p[1] + m.e, m.b * p[0] + m.d * p[1] + m.f]; });
  }
  function uprightQuad(b) {
    var x0 = b.x + 1, x1 = b.x + b.w - 1, y0 = b.y + b.h * 0.175, y1 = b.y + b.h * 0.825;
    return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  }
  // Do two convex four-sided shapes overlap? (No edge direction separates them.)
  function quadsMeet(P, Q) {
    for (var k = 0; k < 2; k++) {
      var A = k ? Q : P;
      for (var i = 0; i < 4; i++) {
        var nx = A[(i + 1) % 4][1] - A[i][1], ny = A[i][0] - A[(i + 1) % 4][0];
        var lo1 = Infinity, hi1 = -Infinity, lo2 = Infinity, hi2 = -Infinity;
        P.forEach(function (v) { var d = v[0] * nx + v[1] * ny; lo1 = Math.min(lo1, d); hi1 = Math.max(hi1, d); });
        Q.forEach(function (v) { var d = v[0] * nx + v[1] * ny; lo2 = Math.min(lo2, d); hi2 = Math.max(hi2, d); });
        if (hi1 <= lo2 || hi2 <= lo1) return false;
      }
    }
    return true;
  }
  // A broken value on show: NaN, Infinity, undefined or "[object Object]" in the text Dan reads
  // (the say sentence, any label, SVG text, an aria-label), or in a drawing's numbers (cx="NaN"
  // draws nothing). Readouts, K.fmt and plots check their own values; this catches the rest. Words
  // the body writes itself, in its HTML or in a quoted string ("undefined at zero"), are not faults.
  var BAD_SHOWN = /\bNaN\b|\bundefined\b|\[object\b|(?:^|[^A-Za-z])-?Infinity\b/;
  var GEOMETRY = ['x', 'y', 'cx', 'cy', 'r', 'rx', 'ry', 'x1', 'y1', 'x2', 'y2', 'dx', 'dy', 'width', 'height', 'd', 'points', 'transform', 'offset'];
  var ownText = '', ownScriptText = null;
  function textOf(after) {
    var out = [], walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    for (var n = walker.nextNode(); n; n = walker.nextNode()) {
      if (after && !(after.compareDocumentPosition(n) & 4)) continue;
      if (!n.parentElement || n.parentElement.closest('script, style, noscript, template')) continue;
      out.push(n.nodeValue);
    }
    return out.join(' ');
  }
  // At K.ready, before the first update: the page's own text so far, and (once parsed) the text
  // after the script that called it.
  function noteOwnText() {
    if (!document.body) return;
    ownText = textOf(null);
    var me = document.currentScript;
    if (me && document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { ownText += ' ' + textOf(me); });
  }
  function meant(word) {
    if (word === '[object') return false;
    if (ownScriptText == null) {
      var src = Array.prototype.map.call(document.body.querySelectorAll('script'), function (x) { return x.textContent; }).join('\n');
      ownScriptText = (src.match(/(["'`])(?:\\.|(?!\1)[^\\\n])*\1/g) || []).join(' ');
    }
    var re = new RegExp('\\b' + word + '\\b');
    return re.test(ownText) || re.test(ownScriptText);
  }
  function badWord(text) {
    var m = BAD_SHOWN.exec(text);
    if (!m) return null;
    var w = m[0].replace(/^[^A-Za-z[]*-?/, '');
    return meant(w) ? null : w;
  }
  function seen(el) { return !!el.getClientRects().length && getComputedStyle(el).visibility === 'visible'; }
  // ---------- echoes: an output with a readout, printed again elsewhere ----------
  // While Dan answers a check the app hides only that readout and the .say lines (quiz mode), so
  // a label, a bar, a plot label or an aria-label printing the same value gives the answer away.
  // A place counts only when it shows the readout's text (as the tile rounds it) at two or more
  // different values in the sweep: a fixed reference label ("2.00 s") or an axis tick matches one
  // value at most. A setting where a control or another output reads the same (Dan's own push,
  // while the grip equals it) does not count, nor does zero.
  function holdsNum(s, t) {
    for (var at = s.indexOf(t); at >= 0; at = s.indexOf(t, at + 1)) {
      if (/[\p{L}\p{N}.,−-]/u.test(s.charAt(at - 1))) continue;
      var a = s.charAt(at + t.length);
      if (/\d/.test(a) || /[.,]/.test(a) && /\d/.test(s.charAt(at + t.length + 1))) continue;
      return true;
    }
    return false;
  }
  function echoPlaces() {
    var out = [], byEl = new Map(), boxes = controls.map(function (c) { return c.el; }).filter(Boolean);
    var off = function (el) { return !!el.closest('.k-readout, .say, script, style, noscript, template, textarea') || boxes.some(function (b) { return b.contains(el); }); };
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    for (var n = walker.nextNode(); n; n = walker.nextNode()) {
      var el = n.parentElement;
      if (el && /\S/.test(n.nodeValue) && !off(el)) byEl.set(el, (byEl.get(el) || '') + n.nodeValue);
    }
    byEl.forEach(function (text, el) { if (seen(el)) out.push({ key: 'text|' + pathOf(el), text: text, where: 'the text "' + snippet(el.textContent) + '" (' + describeEl(el) + ')' }); });
    Array.prototype.forEach.call(document.body.querySelectorAll('[aria-label]'), function (el) {
      if (off(el) || !el.getClientRects().length || plots.some(function (p) { return p.canvas === el; })) return;
      out.push({ key: 'aria|' + pathOf(el), text: el.getAttribute('aria-label'), where: 'the aria-label of ' + describeEl(el) + ' ("' + snippet(el.getAttribute('aria-label')) + '")' });
    });
    plots.forEach(function (p, i) {
      if (p.el.isConnected) (p.labels || []).forEach(function (l, j) { out.push({ key: 'plot|' + i + '|' + j, text: l.text, where: 'the plot label "' + snippet(l.text) + '"' }); });
    });
    return out;
  }
  function echoNow(rec, ctxText) {
    var outs = lastOutputs || {}, places = null;
    readoutList.forEach(function (r) {
      if (!r.el.isConnected || !Object.prototype.hasOwnProperty.call(outs, r.id) || !isNum(outs[r.id])) return;
      var t = r.format(outs[r.id]);
      if (!/[1-9]/.test(t)) return;
      var others = controls.map(function (c) { return c.get(); });
      Object.keys(outs).forEach(function (k) { if (k !== r.id) others.push(outs[k]); });
      if (others.some(function (x) { return isNum(x) && r.format(x) === t; })) return;
      places = places || echoPlaces();
      places.forEach(function (pl) {
        if (!holdsNum(String(pl.text), t)) return;
        var key = r.id + '|' + pl.key, e = rec.seen[key];
        if (!e) { e = rec.seen[key] = { id: r.id, where: pl.where, values: [], at: ctxText }; rec.order.push(key); }
        if (e.values.indexOf(t) < 0) e.values.push(t);
      });
    });
  }
  function echoProblems(rec) {
    return rec.order.filter(function (k) { return rec.seen[k].values.length > 1; }).slice(0, 4).map(function (k) {
      var e = rec.seen[k];
      return 'output "' + e.id + '" has a readout, and ' + e.where + ' prints its value too: while Dan answers a check on it, the app hides only the readout and the .say line, ' +
        'so this gives the answer away. Show that value in its readout alone (no label or aria-label repeating it)';
    });
  }
  // -> [{key, msg}]
  function shownBadNow() {
    var out = [];
    if (!document.body) return out;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    for (var n = walker.nextNode(); n; n = walker.nextNode()) {
      var el = n.parentElement, w = BAD_SHOWN.test(n.nodeValue) && el && !el.closest('script, style, noscript, template, textarea') && badWord(n.nodeValue);
      if (!w || !seen(el)) continue;
      out.push({ key: 'shown|' + pathOf(el) + '|' + w, msg: 'the page shows ' + w + ': "' + snippet(el.textContent) + '" (in ' + describeEl(el) + ')' });
    }
    Array.prototype.forEach.call(document.body.querySelectorAll('[aria-label], svg *'), function (el) {
      var label = el.getAttribute('aria-label'), w = label && BAD_SHOWN.test(label) && badWord(label);
      if (w) out.push({ key: 'label|' + pathOf(el) + '|' + w, msg: 'the aria-label of ' + describeEl(el) + ' reads ' + w + ': "' + snippet(label) + '"' });
      if (!el.ownerSVGElement) return;
      for (var i = 0; i < GEOMETRY.length; i++) {
        var v = el.getAttribute(GEOMETRY[i]);
        if (v && /NaN|Infinity|undefined|\[object/.test(v)) {
          out.push({ key: 'attr|' + pathOf(el) + '|' + GEOMETRY[i], msg: 'an SVG ' + describeEl(el) + ' has ' + GEOMETRY[i] + '="' + snippet(v) + '", so it is not drawn' });
          break;
        }
      }
    });
    return out;
  }
  // Colours written on a drawing that the theme can't follow or the browser can't paint: a colour
  // name (fill="white" vanishes on the dark page), a var() the kit does not define (it paints
  // nothing, or black), a url(#…) to nothing, or a typo. -> [{key, msg}]
  var PAINT_OK = /^(none|transparent|currentcolor|inherit|initial|unset|context-fill|context-stroke)$/i;
  // A colour the canvas can't read but the page can compute (color-mix() over the kit's
  // variables): on a probe inside a box of a sentinel colour, a value the browser can't compute
  // falls back to inheriting the sentinel.
  var probe = null;
  function computesAsColour(v) {
    try {
      if (!probe) { probe = K.el('span', { style: 'display:none', 'aria-hidden': 'true' }, K.el('span')); probe.style.color = 'rgb(1, 2, 3)'; }
      var inner = probe.firstChild;
      inner.style.color = '';
      inner.style.color = v;
      if (!inner.style.color) return false;
      document.body.appendChild(probe);
      var got = getComputedStyle(inner).color;
      probe.remove();
      return !!got && got.replace(/\s/g, '') !== 'rgb(1,2,3)';
    } catch (e) { return false; }
  }
  function paintFault(v) {
    v = String(v).trim();
    if (!v || PAINT_OK.test(v)) return null;
    var u = /^url\(\s*["']?#([^"')\s]+)["']?\s*\)\s*(.*)$/i.exec(v);
    if (u) return document.getElementById(u[1]) ? (u[2] ? paintFault(u[2]) : null) : 'points to #' + u[1] + ', which is not on the page';
    var m = /^var\(\s*(--[\w-]+)\s*(?:,\s*(.*))?\)$/.exec(v);
    if (m) {
      if (getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim()) return null;
      return m[2] ? paintFault(m[2]) : 'uses ' + m[1] + ', which is not a kit colour, so it paints nothing';
    }
    if (/^[a-z]+$/i.test(v)) return rgbaOf(v) ? 'is a colour name, which does not follow the theme' : 'is not a colour';
    return rgbaOf(v) || computesAsColour(v) ? null : 'is not a colour';
  }
  function paintNow() {
    var out = [];
    if (!document.body) return out;
    Array.prototype.forEach.call(document.body.querySelectorAll('svg *'), function (el) {
      if (el.closest('button')) return;
      ['fill', 'stroke'].forEach(function (k) {
        [el.getAttribute(k), el.style && el.style.getPropertyValue(k)].forEach(function (v) {
          var why = v && paintFault(v);
          if (why) out.push({ key: 'paint|' + pathOf(el) + '|' + k, msg: 'an SVG ' + describeEl(el) + ' has ' + k + ' "' + snippet(v) + '": it ' + why + '. Use a role as var(--k-…) or K.color(role): ink, muted, accent2, accent, warn, good, amber-line, fill1-fill3, cat1-cat4 (on-accent2 for text on navy)' });
        });
      });
    });
    return out;
  }
  function scanExternal() {
    var bad = [];
    var nodes = document.querySelectorAll('script[src], link[href], img[src], iframe, object, embed, video[src], audio[src], source[src]');
    Array.prototype.forEach.call(nodes, function (el) {
      var u = el.getAttribute('src') || el.getAttribute('href') || '';
      if (/^(https?:)?\/\//i.test(u) || /^(IFRAME|OBJECT|EMBED)$/.test(el.tagName)) bad.push('<' + el.tagName.toLowerCase() + (u ? ' ' + u.slice(0, 80) : '') + '>');
    });
    Array.prototype.forEach.call(document.querySelectorAll('style'), function (st) {
      if (/@import|url\(\s*['"]?(https?:)?\/\//i.test(st.textContent || '')) bad.push('<style> loading a URL');
    });
    if (bad.length) addUnique(errors, 'External resources are not allowed (no network in the app): ' + bad.slice(0, 4).join(', '));
    // The policy blocks requests, but not a page that leaves itself: no links out, no navigating.
    var links = Array.prototype.filter.call(document.querySelectorAll('a[href], area[href], form[action]'), function (a) {
      return /^\s*(https?:|\/\/|javascript:)/i.test(a.getAttribute('href') || a.getAttribute('action') || '');
    });
    if (links.length) addUnique(errors, 'Links and forms that leave the page are not allowed: ' + links.slice(0, 3).map(function (a) { return '<' + a.tagName.toLowerCase() + ' ' + (a.getAttribute('href') || a.getAttribute('action')).slice(0, 60) + '>'; }).join(', ') + '. Name sources in words; the app shows the links.');
    var src = Array.prototype.map.call(document.body ? document.body.querySelectorAll('script') : [], function (x) { return x.textContent; }).join('\n');
    var leave = src.match(/(?:\b(?:window|document|self|top|parent)\.|(?<![\w$.]|\b(?:const|let|var)\s+))location\s*(?:\.\s*(?:href|assign|replace|search|hash|pathname|host|hostname)\b\s*(?:=(?!=)|\()|=(?!=))|\bcreateElement\s*\(\s*['"`](?:iframe|frame|object|embed)\b|\bRTCPeerConnection\b|\bsendBeacon\b|\bWebSocket\b|\bEventSource\b|\bXMLHttpRequest\b|\bimportScripts\b/);
    if (leave) addUnique(errors, 'The page may not navigate, open connections or make frames (found "' + leave[0].slice(0, 40) + '"). Everything stays on this page.');
  }
  // Runs after the sweep has hidden the after-move parts again, so it sees the opening screen.
  function attachedProblems(list) {
    controls.forEach(function (c) { if (c.el && !c.el.isConnected) list.push('control "' + c.id + '" was created but never added to the page (pass into: or append control.el)'); });
    readoutList.forEach(function (r) { if (!r.el.isConnected) list.push('readout "' + r.id + '" was created but never added to the page'); });
    plots.forEach(function (p, i) { if (!p.el.isConnected) list.push('plot ' + (i + 1) + ' is not on the page'); });
    actions.forEach(function (a) { if (!a.el.isConnected) list.push('button "' + a.label + '" was created but never added to the page'); });
    anims.forEach(function (a) { if (a.api.el.firstChild && !a.api.el.isConnected) list.push('K.anim "' + a.label + '" has no into:, so its Play button is not on the page'); });
    // Something Dan can move or press must be in view when the page opens: a control inside
    // .k-after-move (or a hidden box) can't be seen, tapped or focused, so nothing ever reveals.
    var parts = controls.map(function (c) { return { el: c.el, name: 'control "' + c.id + '"' }; })
      .concat(actions.map(function (a) { return { el: a.el, name: 'button "' + a.label + '"' }; }))
      .concat(anims.filter(function (a) { return a.api.el.firstChild; }).map(function (a) { return { el: a.api.el, name: 'the "' + a.label + '" button' }; }))
      .filter(function (x) { return x.el && x.el.isConnected; });
    var reachable = parts.filter(function (x) { return x.el.getClientRects().length && getComputedStyle(x.el).visibility === 'visible'; });
    if (parts.length && !reachable.length) list.push('Dan cannot reach any control when the page opens: ' + parts.slice(0, 3).map(function (x) { return x.name; }).join(', ') + (parts.length > 1 ? ' are' : ' is') + ' hidden (inside .k-after-move or a hidden box). Keep the controls in view from the start; hide only the answer');
  }
  // A big part hidden until Dan moves leaves a blank hole in the opening screen.
  function afterMoveAdvice() {
    // Whole blocks and whole drawings only: marks inside a drawing (an SVG group of arrows) sit over
    // the picture and leave no hole.
    var big = Array.prototype.filter.call(document.querySelectorAll('.k-after-move'), function (el) {
      return !el.ownerSVGElement && el.getBoundingClientRect().height > 180;
    })[0];
    if (!big) return null;
    return 'A part hidden until Dan moves something (' + describeEl(big) + ') is ' + Math.round(big.getBoundingClientRect().height) + ' px tall, so the opening screen has a large blank space: hide only the answer (the line, the mark, the sentence), not the whole figure.';
  }
  // On a phone, the main figure and the first control should fit on one screen together.
  function phoneAdvice() {
    if (document.documentElement.clientWidth >= PHONE) return null;
    var first = controls.filter(function (c) { return c.el && c.el.isConnected; })[0];
    var fig = document.body.querySelector('.k-stage, .k-plot, svg.k-fig, canvas.k-fig');
    if (!first || !fig) return null;
    var gap = first.el.getBoundingClientRect().top - fig.getBoundingClientRect().top;
    if (gap <= PHONE_VIEW) return null;
    return 'On a phone the first control starts ' + Math.round(gap) + ' px below the top of the main figure, so Dan can\'t see the figure while he moves it: put the controls right under the main visual with K.stage(visual, controls), and secondary figures below them.';
  }
  // The self-test runs in short slices, yielding to the browser in between, so it never holds
  // up the page (the frame may share a thread with the app) for more than a few tens of ms.
  var yq = null;
  function pause() {
    return new Promise(function (resolve) {
      try {
        if (!yq) { yq = { ch: new MessageChannel(), list: [] }; yq.ch.port1.onmessage = function () { var f = yq.list.shift(); if (f) f(); }; }
        yq.list.push(resolve);
        yq.ch.port2.postMessage(0);
      } catch (e) { setTimeout(resolve, 0); }
    });
  }
  function slicer(ms) {
    var t = now();
    return function () { if (now() - t < ms) return Promise.resolve(); return pause().then(function () { t = now(); }); };
  }
  // Exercise every control across its range, show what waits for a move, press every K.button,
  // play every K.anim for a burst, timing each update and checking for faults, sideways
  // overflow and cut-off text at each setting; then restore the opening state.
  async function sweep(throwaway) {
    var s = { seen: Object.create(null), order: [], ctx: '' }, overflow = null;
    var clip = { seen: Object.create(null), order: [] }, shown = { seen: Object.create(null), order: [] }, crowd = { seen: Object.create(null), order: [] };
    var echo = { seen: Object.create(null), order: [] };
    var dup = [];
    var breathe = slicer(25);
    sink = s;
    document.documentElement.classList.add('k-testing');   // no fade-ins while it looks
    var init = controls.map(function (c) { return c.get(); });
    // In a throwaway test frame nothing should move things between steps.
    if (throwaway) anims.forEach(function (a) { a.api.pause(); });
    function note(list, into, ctxText) {
      list.forEach(function (it) {
        var e = into.seen[it.key];
        if (e) { e.n++; return; }
        into.seen[it.key] = { msg: it.msg, at: ctxText, n: 1 };
        into.order.push(it.key);
      });
    }
    function look(ctxText) {
      if (!overflow) { var o = overflowNow(); if (o) overflow = o + ' (at ' + ctxText + ')'; }
      var cut = clippedNow();
      note(cut.filter(function (x) { return !x.warn; }), clip, ctxText);
      note(cut.filter(function (x) { return x.warn; }), crowd, ctxText);
      note(shownBadNow().concat(paintNow()), shown, ctxText);
      echoNow(echo, ctxText);
    }
    // A switch, button or slider that starts a K.anim which has its own Play button: two controls
    // for one action (advice). Throwaway frames only, where the animations start out paused.
    var played = anims.filter(function (a) { return a.o.button !== false; });
    function startedBy(who) {
      played.forEach(function (a) {
        if (!a.api.playing()) return;
        addUnique(dup, who + ' already starts the motion that "' + a.label + '" plays: use K.anim({button: false}) and call play() from that control, so one control does one thing.', 4);
        a.api.pause();
      });
    }
    // Sound from an update (K.update or the model) plays again on every change: dozens of tones
    // stacking up during a drag, or a fresh 20-second hum each time. Watched while the controls
    // are swept; buttons and animations may play sound.
    var hearUpdates = true;
    async function step(ctxText) {
      s.ctx = ctxText;
      var calls = audio.calls;
      var t0 = now(); run(); var dt = now() - t0;
      if (dt > SLOW_MS) { t0 = now(); run(); dt = Math.min(dt, now() - t0); }
      if (dt > SLOW_MS) problem('an update took ' + Math.round(dt) + ' ms (keep each under ' + SLOW_MS + ' ms)');
      if (hearUpdates && audio.calls > calls) problem('K.sound played from K.update, which runs on every change (a drag would stack up dozens of tones): play sound only from a K.button press; to follow a slider, start K.sound.hold from a button and call its set() in K.update');
      await breathe();
      s.ctx = ctxText;
      look(ctxText);
      await breathe();
    }
    try {
      await step('the opening state');
      if (!moved) {
        sweepReveal = true;
        setMovedClass(true);
        laterPlots();
        if (throwaway) afterMoveFns.forEach(function (fn) { s.ctx = 'K.afterMove'; try { fn(); } catch (e) { fault('K.afterMove', e); } });
        await step('the opening state, after a move');
      }
      for (var i = 0; i < controls.length; i++) {
        var c = controls[i], vals = c.sweep();
        for (var j = 0; j < vals.length; j++) {
          c.set(vals[j], true); await step(c.id + ' = ' + c.describe(vals[j]));
          if (throwaway) startedBy(c.kind === 'toggle' ? 'The switch "' + c.id + '"' : 'Moving "' + c.id + '"');
        }
        c.set(init[i], true);
      }
      s.ctx = 'K.drag';
      dragProblems();
      if (controls.length > 1) {
        controls.forEach(function (c) { var v = c.sweep(); c.set(v[0], true); });
        await step('every control at its lowest');
        controls.forEach(function (c) { var v = c.sweep(); c.set(v[v.length - 1], true); });
        await step('every control at its highest');
        controls.forEach(function (c, k) { c.set(init[k], true); });
      }
      // Once more at Dan's largest Text size: rem sizes grow by a quarter, so a word that fits
      // its tile at M can split, or a line spill, at XL. Throwaway frames only (Dan never sees it).
      if (throwaway && K.theme.size < SIZE_XL) {
        var size0 = K.theme.size;
        setTextSize(SIZE_XL);
        try {
          await step('Text size XL');
          for (var x = 0; x < controls.length; x++) {
            var cx = controls[x], xs = cx.sweep();
            for (var y = 0; y < xs.length; y++) { cx.set(xs[y], true); await step('Text size XL, ' + cx.id + ' = ' + cx.describe(xs[y])); }
            cx.set(init[x], true);
          }
        } finally { setTextSize(size0); }
      }
      hearUpdates = false;
      if (throwaway) {
        for (var b = 0; b < actions.length; b++) {
          s.ctx = 'pressing "' + actions[b].label + '"';
          actions[b].run();
          await step('after pressing "' + actions[b].label + '"');
          startedBy('The button "' + actions[b].label + '"');
        }
      }
      // Each animation plays for 3 seconds of its own time (90 frames).
      for (var a = 0; a < anims.length; a++) {
        var an = anims[a], where = 'playing "' + an.label + '"', t = 0;
        var flips = controls.map(function (c) { return c.kind === 'toggle' ? c.get() : null; });
        for (var k = 1; k <= 90; k++) {
          t += 1 / 30;
          s.ctx = where;
          var r;
          try { r = an.o.step(1 / 30, t); } catch (e) { problem('K.anim step threw ' + errText(e) + stackLine(e)); break; }
          if (k % 15 === 0 || r === false) await step(where + ' (frame ' + k + ')');
          else await breathe();
          if (r === false) break;
        }
        an.api.reset();
        if (throwaway && an.o.button !== false) controls.forEach(function (c, n) {
          if (flips[n] !== null && c.get() !== flips[n]) addUnique(dup, 'Playing "' + an.label + '" flips the switch "' + c.id + '": the switch already starts this motion, so use K.anim({button: false}) and call play() from the switch.', 4);
        });
        controls.forEach(function (c, n) { c.set(init[n], true); });
      }
      // Once more in the other theme (light <-> dark): colours set once at load, or written as
      // fixed values, stop matching the page there. Throwaway frames only.
      if (throwaway) {
        var keep = themeArg, other = !K.theme.dark;
        s.ctx = 'the ' + (other ? 'dark' : 'light') + ' theme';
        retheme({ dark: other, size: K.theme.size, mute: hostMute });
        try { await step('the opening state, in the ' + (other ? 'dark' : 'light') + ' theme'); }
        finally { retheme(keep); }
      }
    } finally {
      controls.forEach(function (c, k) { c.set(init[k], true); });
      sweepReveal = false;
      if (!moved) { setMovedClass(false); laterPlots(); }
      document.documentElement.classList.remove('k-testing');
      s.ctx = 'restoring the opening state';
      run();
      sink = null;
    }
    function atText(e) { return ' (at ' + e.at + (e.n > 1 ? ', and ' + (e.n - 1) + ' more setting' + (e.n > 2 ? 's' : '') : '') + ')'; }
    var problems = s.order.map(function (m) { return m + atText(s.seen[m]); })
      .concat(shown.order.slice(0, 8).map(function (key) { return shown.seen[key].msg + atText(shown.seen[key]); }))
      .concat(echoProblems(echo));
    var clipped = clip.order.slice(0, 12).map(function (key) { return clip.seen[key].msg + atText(clip.seen[key]); });
    var advice = crowd.order.slice(0, 3).map(function (key) { return crowd.seen[key].msg + atText(crowd.seen[key]); }).concat(dup);
    return { problems: problems, overflow: overflow, seen: s.seen, clipped: clipped, advice: advice };
  }
  var testing = null;
  function selftest(opt) {
    if (testing) return testing;     // one at a time; a second request shares the first
    testing = selftestNow(opt || {}).then(function (r) { testing = null; return r; }, function (e) { testing = null; throw e; });
    return testing;
  }
  // Quiz mode is a screen for Dan, never what the self-test judges: it is off while the test runs
  // (a quiz that arrives meanwhile waits for the end).
  async function selftestNow(opt) {
    quizHeld = quiz; testingNow = true; applyQuiz(null);
    try { return await selftestRun(opt); }
    finally { testingNow = false; var q = quizHeld; quizHeld = null; applyQuiz(q); }
  }
  async function selftestRun(opt) {
    var t0 = now();
    scanExternal();
    if (!readyCalled) addUnique(errors, 'K.ready() was never called: call it once at the end of the script.');
    if (!checks.length) addUnique(errors, 'There are no K.check(...) assertions: add 3-5 known-answer checks.');
    var checkResults = runChecks();
    audio.calls = 0;
    labelSkips = [];
    await pause();
    var sw = await sweep(!!opt.throwaway);
    var problems = liveProblems.filter(function (m) { return !sw.seen[m]; }).concat(sw.problems);
    attachedProblems(problems);
    var report = {
      ok: false,
      errors: errors.slice(),
      overflow: !!sw.overflow,
      clipped: sw.clipped,
      checks: checkResults,
      sweep: { ok: !problems.length, problems: problems.slice(0, 16) },
      controls: controls.map(function (c) { return c.id; }),
      readouts: readoutList.map(function (r) { return r.id; }),
      outputs: Object.keys(lastOutputs || {}),
      inputs: controls.map(function (c) { return c.info(); }),
      actions: actions.map(function (a) { return a.label; }).concat(anims.map(function (a) { return a.label; })),
      ready: readyCalled,
      warnings: warnings.slice(),
      width: document.documentElement.clientWidth,
      height: measure(),
      ms: 0,
    };
    if (sw.overflow) report.overflowDetail = sw.overflow;
    if (checks.length && checks.length < 3) report.warnings.push('Only ' + checks.length + ' K.check assertion' + (checks.length > 1 ? 's' : '') + ': aim for 3-5.');
    if (!controls.length && !actions.length && !anims.length) report.warnings.push('No K.control / K.choice / K.toggle / K.stepper / K.button: the self-test could not exercise the model.');
    var advice = phoneAdvice();
    if (advice) report.warnings.push(advice);
    // A blank hole in the opening screen is a fault the repair must fix, not advice.
    var hole = afterMoveAdvice();
    if (hole) report.errors.push(hole);
    labelSkips.forEach(function (m) { report.warnings.push(m); });
    sw.advice.forEach(function (m) { report.warnings.push(m); });
    if (opt.throwaway && !audio.calls) {
      var src = Array.prototype.map.call(document.body.querySelectorAll('script'), function (x) { return x.textContent; }).join('\n');
      if (/K\.sound\.(tone|chord)\s*\(/.test(src)) report.warnings.push('K.sound is used but no K.button press played anything: play sound from a K.button\'s press so the self-test (and Dan) can reach it.');
    }
    report.ok = !report.errors.length && !report.overflow && !report.clipped.length && checkResults.length > 0 &&
      checkResults.every(function (c) { return c.ok; }) && report.sweep.ok && readyCalled;
    report.ms = Math.round(now() - t0);
    return report;
  }
  // Does some setting of one control bring an output to a target? Tries every setting the control
  // can take (all options of a choice; up to 2001 spread over a slider's range), others staying
  // where they are, then looks closer on a slider: the setting at the target itself, and every
  // step between two tried settings whose outputs fall either side of the target (or next to the
  // closest one), so a fine slider (0-5000 in ones, 0-100 in hundredths) is judged on its own steps.
  // exact: some setting shows the target exactly, at d.decimals when given (the lesson's rounding),
  // else as the output's readout shows it (else the default rounding); −0 shows as 0. Runs in slices.
  // -> {reachable, exact, best:{value, output}, tried}
  function plainZero(t) { t = String(t); return /[1-9]/.test(t) ? t : t.replace(/[−-]/g, ''); }
  async function reach(d) {
    var c = byId[d.control];
    if (!c) return { reachable: false, exact: false, best: null, error: 'No control "' + d.control + '"', tried: 0 };
    var target = +d.target, tol = Math.abs(+d.tolerance || 0), key = String(d.output);
    var dp = d.decimals != null && d.decimals !== '' && isNum(+d.decimals) && +d.decimals >= 0 ? clamp(Math.round(+d.decimals), 0, 12) : null;
    var shown = dp != null ? function (x) { return fmt(x, { dp: dp }); } : readouts[key] ? readouts[key].format : function (x) { return fmt(x); };
    var shows = function (x) { return plainZero(shown(x)); };
    var aim = isNum(target) ? shows(target) : null, exact = false;
    var init = c.get(), base = K.params(), best = null, breathe = slicer(25), tried = 0;
    var fromModel = false;
    try { fromModel = !!modelFn && Object.prototype.hasOwnProperty.call(modelFn(base) || {}, key); } catch (e) {}
    var saved = sink;
    async function at(v) {
      var out;
      sink = { seen: Object.create(null), order: [], ctx: 'reach' };
      if (fromModel) {
        var p = Object.assign({}, base); p[c.id] = v;
        try { out = (modelFn(p) || {})[key]; } catch (e) { out = NaN; }
      } else { c.set(v, true); run(); out = stateOutputs()[key]; }
      sink = saved;
      out = +out; tried++;
      if (isNum(out)) {
        var diff = Math.abs(out - target);
        if (!best || diff < best.diff) best = { value: v, output: out, diff: diff };
        if (!exact && aim !== null && shows(out) === aim) exact = true;
      }
      await breathe();
      return out;
    }
    try {
      var vals = c.values(), outs = [];
      for (var i = 0; i < vals.length; i++) outs.push(await at(vals[i]));
      if (c.between && isNum(target)) {
        var more = [], near = vals.indexOf(best ? best.value : NaN);
        // The target's own step (a slider whose output is its own value, or close to it).
        if (c.settle && target >= c.min && target <= c.max && vals.indexOf(c.settle(target)) < 0) more.push(c.settle(target));
        for (var k = 0; k + 1 < vals.length && more.length < 20000; k++) {
          var a = outs[k] - target, b = outs[k + 1] - target;
          if (isNum(a) && isNum(b) && (a <= 0) !== (b <= 0) || k === near || k + 1 === near) more = more.concat(c.between(vals[k], vals[k + 1]));
        }
        for (var j = 0; j < more.length; j++) await at(more[j]);
      }
    } finally {
      sink = saved;
      if (!fromModel) { c.set(init, true); run(); }
    }
    return {
      reachable: !!best && best.diff <= tol + Math.abs(target) * 1e-9 + 1e-12,
      exact: exact,
      best: best ? { value: best.value, output: best.output } : null,
      tried: tried,
    };
  }

  // ---------- height ----------
  // The host sizes the iframe to the content. A runaway (content that grows with the frame, e.g.
  // vh units) is capped and reported.
  var lastH = 0, hTimer = 0, grows = [], MAX_H = 6000;
  function measure() {
    var b = document.body;
    if (!b) return 0;
    var top = document.documentElement.getBoundingClientRect().top, r = b.getBoundingClientRect();
    var cs = getComputedStyle(b);
    // Content that spills out of a fixed-height box (a plot taller than the 180px div it was
    // given) still has to be seen: body.scrollHeight includes it.
    var bottom = Math.max(r.bottom, r.top + b.scrollHeight);
    return Math.ceil(bottom - top + (parseFloat(cs.marginBottom) || 0));
  }
  function sendHeight() {
    hTimer = 0;
    var h = Math.min(measure(), MAX_H);
    if (!h || Math.abs(h - lastH) < 1) return;
    if (h > lastH) {
      var t = now();
      grows = grows.filter(function (g) { return t - g < 1500; });
      grows.push(t);
      if (grows.length > 12) { addUnique(warnings, 'The page height keeps growing with the frame (avoid vh units and height:100%).'); return; }
    }
    lastH = h;
    post({ type: 'height', px: h });
  }
  function heightSoon() { if (!hTimer) hTimer = setTimeout(sendHeight, 30); }
  function boot() {
    var lastWidth = document.documentElement.clientWidth;
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () {
        heightSoon();
        var w = document.documentElement.clientWidth;
        if (w !== lastWidth) { lastWidth = w; if (readyCalled) relayout(); }
      });
      ro.observe(document.body);
      ro.observe(document.documentElement);
    }
    // Labels drawn or redrawn later (in K.update) get their halo too.
    if (window.MutationObserver && document.body) new MutationObserver(halosSoon).observe(document.body, { childList: true, subtree: true });
    sendHeight();
    [120, 600].forEach(function (ms) { setTimeout(sendHeight, ms); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  // ---------- host requests ----------
  // A capture listener added before the body runs, so a body's own message listener can't
  // swallow the host's requests (the host removes a frame that stops answering its pings).
  window.addEventListener('message', function (ev) {
    if (!hosted || ev.source !== host) return;
    var d = ev.data;
    if (!d || typeof d !== 'object' || typeof d.type !== 'string') return;
    var rid = d.rid;
    function state() { post({ type: 'state', rid: rid, params: K.params(), outputs: stateOutputs(), moved: moved }); }
    if (d.type === 'ping') {
      post({ type: 'pong', rid: rid });
    } else if (d.type === 'quiz') {
      setQuiz(d.hide);
    } else if (d.type === 'reveal') {
      setQuiz(null);
    } else if (d.type === 'selftest') {
      Promise.resolve().then(function () { return selftest({ throwaway: !!d.throwaway }); }).then(function (report) {
        post({ type: 'report', rid: rid, report: report });
      }, function (e) {
        post({ type: 'report', rid: rid, report: { ok: false, errors: ['The self-test itself failed: ' + errText(e)], overflow: false, clipped: [], checks: [], sweep: { ok: false, problems: [] }, controls: [], readouts: [] } });
      });
    } else if (d.type === 'get') {
      state();
    } else if (d.type === 'set') {
      var c = byId[d.id];
      if (!c) { post({ type: 'error', rid: rid, message: 'No control with id "' + d.id + '"' }); return; }
      if (c.accepts && !c.accepts(d.value)) { post({ type: 'error', rid: rid, message: 'Control "' + d.id + '" has no setting "' + d.value + '"' }); return; }
      markMoved();
      c.set(d.value, true);
      run();
      state();
    } else if (d.type === 'press') {
      // Press a K.button (by label, or the first) or start a K.anim (Play).
      var want = d.label ? String(d.label).toLowerCase() : '';
      var a = actions.filter(function (x) { return !want || x.label.toLowerCase().indexOf(want) >= 0; })[0];
      var an = a ? null : anims.filter(function (x) { return !want || x.label.toLowerCase().indexOf(want) >= 0; })[0];
      if (!a && !an) { post({ type: 'error', rid: rid, message: 'No button' + (want ? ' labelled "' + d.label + '"' : '') }); return; }
      markMoved();
      if (a) a.press(); else an.api.play();
      run();
      state();
    } else if (d.type === 'inputs') {
      post({ type: 'inputs', rid: rid, inputs: controls.map(function (x) { return x.info(); }), actions: actions.map(function (x) { return x.label; }).concat(anims.map(function (x) { return x.label; })) });
    } else if (d.type === 'reach') {
      Promise.resolve().then(function () { return reach(d); }).then(function (res) { post({ type: 'reach', rid: rid, result: res }); },
        function (e) { post({ type: 'reach', rid: rid, result: { reachable: false, exact: false, best: null, error: errText(e), tried: 0 } }); });
    } else if (d.type === 'theme') {
      retheme(d.theme);
    }
  }, true);
})();
