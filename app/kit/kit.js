/* House kit for My University interactives (API reference for prompts: app/kit/KIT.md).
 * Runs inside <iframe sandbox="allow-scripts" srcdoc>: no same-origin, so no storage, no network
 * and no access to the app. A model-written body uses the global K to build themed controls,
 * readouts and plots, declares a pure model, known-answer checks, and calls K.ready().
 * The kit talks to the host (app/src/js/32-sandbox.js) with postMessage, every message tagged
 * src:'kit': height, ready, error, change, and replies to selftest / get / set / theme.
 * This file is inlined into a <script> element, so it never contains a closing script tag or an
 * HTML comment opener. */
(function () {
  'use strict';
  if (window.K && window.K.__kit) return;
  var K = (window.K = { __kit: 1 });
  var SVGNS = 'http://www.w3.org/2000/svg';
  var FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  var SLOW_MS = 150;                      // an update slower than this feels laggy on a phone
  var BODY_LINE = +window.K_BODY_LINE || 0; // srcdoc line where the body starts (for error lines)
  var host = window.parent;                // captured now, so a body can't redirect it
  var hosted = !!host && host !== window;

  // ---------- host messaging ----------
  function post(msg) {
    if (!hosted) return;
    msg.src = 'kit';
    try { host.postMessage(msg, '*'); } catch (e) { /* host gone */ }
  }

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
  window.fetch = function () {
    fail('fetch() is not available: interactives have no network. Put the data in the script.');
    return new Promise(function () {});
  };

  // ---------- theme ----------
  // The host sets window.K_THEME = {dark, size, c:{...}} before this script. Dan's light palette
  // is the fallback so a body opened on its own still looks right.
  var LIGHT = {
    bg: '#FFFFFF', panel: '#F7F5F0', sunk: '#EFEBE3', ink: '#1F2937', muted: '#5B6573', line: '#DED8CC',
    strong: '#B9B1A3', accent: '#0F6B66', accent2: '#17324D', onAccent2: '#F7F5F0', warn: '#9F3038',
    good: '#2E7D4F', hl: '#FBE29A', amber: '#FFF1CC',
  };
  K.theme = { dark: false, size: 16, c: {} };
  function cssName(k) { return '--k-' + k.replace(/[A-Z]/g, function (m) { return '-' + m.toLowerCase(); }); }
  function applyTheme(t) {
    t = t && typeof t === 'object' ? t : {};
    var c = {}, src = t.c || {};
    Object.keys(LIGHT).forEach(function (k) { c[k] = typeof src[k] === 'string' && src[k] ? src[k] : LIGHT[k]; });
    K.theme.dark = !!t.dark;
    K.theme.size = clamp(+t.size || 16, 14, 24);
    Object.keys(c).forEach(function (k) { K.theme.c[k] = c[k]; });
    var root = document.documentElement, s = root.style;
    Object.keys(c).forEach(function (k) { s.setProperty(cssName(k), c[k]); });
    s.setProperty('--k-fs', K.theme.size + 'px');
    root.setAttribute('data-theme', K.theme.dark ? 'dark' : 'light');
  }
  applyTheme(window.K_THEME);
  // A palette name ('accent2', 'muted', ...) or any CSS colour.
  K.color = function (name) { return K.theme.c[name] || name || K.theme.c.accent2; };

  // ---------- small helpers ----------
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function isNum(v) { return typeof v === 'number' && isFinite(v); }
  function num(v, d) { v = typeof v === 'string' && v.trim() !== '' ? +v : v; return isNum(v) ? v : d; }
  function now() { return window.performance && performance.now ? performance.now() : Date.now(); }
  K.clamp = clamp;
  K.lerp = function (a, b, t) { return a + (b - a) * t; };
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
  // K.fmt(v, {dp, sig, unit, prefix, percent, sign, compact}) -> readable text. Non-finite -> '—'.
  //   default: 3 significant figures, thousands separators, a true minus sign, ×10ⁿ for extremes.
  K.fmt = function (v, o) {
    o = typeof o === 'number' ? { dp: o } : (o || {});
    if (!isNum(v)) return '—';
    if (o.percent) v = v * 100;
    var a = Math.abs(v), s;
    if (o.compact && a >= 1e4) {
      var units = [[1e12, ' trillion'], [1e9, ' billion'], [1e6, ' million'], [1e3, 'k']];
      for (var i = 0; i < units.length; i++) if (a >= units[i][0]) { s = K.fmt(v / units[i][0], { sig: o.sig || 3 }) + units[i][1]; break; }
    } else if (o.dp != null) {
      s = group(v, clamp(o.dp | 0, 0, 12));
    } else {
      var sig = clamp(o.sig || 3, 1, 12);
      if (a === 0) s = '0';
      else if (a >= 1e15 || a < 1e-4) {
        var e = v.toExponential(sig - 1).split('e');
        s = e[0].replace(/\.?0+$/, '') + ' × 10' + String(+e[1]).split('').map(function (ch) { return SUP[ch] || ch; }).join('');
      } else if (a >= Math.pow(10, sig)) s = group(Math.round(v), 0);
      else {
        var p = +v.toPrecision(sig);
        s = group(p, Math.max(0, Math.min(12, decimalsOf(p))));
      }
    }
    s = s.replace(/^-/, '−');
    if (o.sign && v > 0) s = '+' + s;
    if (o.percent) s += '%';
    return (o.prefix || '') + s + unitText(o.unit);
  };
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

  // ---------- registry and the update pipeline ----------
  // Every control registers itself; K.params() is {id: value}. A change runs: model(params) ->
  // outputs; readouts whose id matches an output key update themselves; then each K.update fn.
  var controls = [], byId = Object.create(null), readouts = Object.create(null), readoutList = [], plots = [], anims = [], checks = [];
  var modelFn = null, updates = [], lastOutputs = {}, readyCalled = false, everRun = false;
  var sink = null;          // during the self-test sweep: where problems go, with the current setting
  var liveProblems = [];    // problems seen outside the sweep (e.g. a NaN while Dan plays)

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
  function run() {
    everRun = true;
    var p = K.params(), out = {};
    if (modelFn) {
      try { out = modelFn(p) || {}; } catch (e) { fault('the model', e); return; }
    }
    lastOutputs = out;
    Object.keys(out).forEach(function (k) { if (readouts[k]) readouts[k].set(out[k]); });
    for (var i = 0; i < updates.length; i++) {
      try { updates[i](p, out); } catch (e) { fault('K.update', e); }
    }
    heightSoon();
  }
  K.refresh = function () { run(); return K; };

  // User changes are coalesced to one run per frame (with a timer fallback for throttled frames),
  // and the host hears about them (debounced) for checks graded through the kit.
  var pending = false, changeTimer = 0;
  function changed() {
    if (!pending) {
      pending = true;
      var done = false;
      var go = function () { if (done) return; done = true; pending = false; run(); };
      if (window.requestAnimationFrame) requestAnimationFrame(go);
      setTimeout(go, 60);
    }
    clearTimeout(changeTimer);
    changeTimer = setTimeout(function () { post({ type: 'change', params: K.params(), outputs: stateOutputs() }); }, 250);
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

  // ---------- controls ----------
  // Label (and live value on the right), then an optional one-line hint across the full width.
  function fieldHead(id, label, hint, right) {
    var lab = K.el('label', { class: 'k-field-label', for: id }, label || '');
    return [K.el('div', { class: 'k-field-head' }, lab, right || null), hint ? K.el('span', { class: 'k-hint' }, hint) : null];
  }

  // K.control({id, label, min, max, step, value, unit, prefix, fmt, log, hint, into}) -> {el, get, set}
  K.control = function (o) {
    o = o || {};
    var min = num(o.min, 0), max = num(o.max, 100), log = !!o.log;
    var who = 'K.control "' + (o.id || '') + '"';
    if (!(max > min)) throw new Error(who + ': max must be greater than min');
    if (log && !(min > 0)) throw new Error(who + ': a log slider needs min > 0');
    var step = num(o.step, 0) > 0 ? +o.step : (log ? 0 : niceStep((max - min) / 100));
    var dp = Math.max(decimalsOf(step), decimalsOf(min));
    var N = 1000; // log sliders run over N positions
    var show = function (v) { return o.fmt ? String(o.fmt(v)) : (o.prefix || '') + (log && !o.step ? K.fmt(v) : K.fmt(v, { dp: dp })) + unitText(o.unit); };
    function snap(v) {
      v = clamp(num(v, min), min, max);
      if (log && !step) return clamp(+v.toPrecision(3), min, max);
      return clamp(+(min + Math.round((v - min) / step) * step).toFixed(Math.min(dp, 12)), min, max);
    }
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
    var el = K.el('div', { class: 'k-field k-control', 'data-id': c.id },
      fieldHead(fid, o.label || c.id, o.hint, K.el('span', { class: 'k-value' }, out)),
      K.el('div', { class: 'k-slide' }, minus,
        K.el('div', { class: 'k-track' }, input,
          K.el('div', { class: 'k-scale', 'aria-hidden': 'true' }, K.el('span', null, show(min)), K.el('span', null, show(max)))),
        plus));
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
    input.addEventListener('input', function () { value = snap(fromPos(+input.value)); paint(); changed(); });
    minus.addEventListener('click', function () { nudge(-1); });
    plus.addEventListener('click', function () { nudge(1); });
    c.el = el; c.input = input;
    c.get = function () { return value; };
    c.set = function (v, silent) { value = snap(v); paint(); if (!silent) changed(); return c; };
    c.sweep = function () {
      var vals = [0, 0.25, 0.5, 0.75, 1].map(function (t) { return snap(log ? min * Math.pow(max / min, t) : min + t * (max - min)); });
      return vals.filter(function (v, i) { return vals.indexOf(v) === i; });
    };
    c.describe = show;
    paint();
    place(el, o.into, who);
    return c;
  };

  function normOptions(list) {
    return (list || []).map(function (x) {
      return x && typeof x === 'object' ? { value: x.value, label: x.label != null ? String(x.label) : String(x.value) } : { value: x, label: String(x) };
    });
  }
  // K.choice({id, label, options:[value | {value, label}], value, hint, into}) -> {el, get, set}
  K.choice = function (o) {
    o = o || {};
    var opts = normOptions(o.options);
    var who = 'K.choice "' + (o.id || '') + '"';
    if (opts.length < 2) throw new Error(who + ': needs at least two options');
    function has(v) { return opts.some(function (x) { return x.value === v; }); }
    var value = has(o.value) ? o.value : opts[0].value;
    var c = { id: o.id, initial: value };
    register(c, 'choice');
    var labId = 'k-' + c.id + '-label';
    var seg = K.el('div', { class: 'k-seg', role: 'radiogroup', 'aria-labelledby': labId });
    var buttons = opts.map(function (x, i) {
      var b = K.el('button', { type: 'button', role: 'radio' }, x.label);
      b.addEventListener('click', function () { c.set(x.value); });
      b.addEventListener('keydown', function (ev) {
        var d = ev.key === 'ArrowRight' || ev.key === 'ArrowDown' ? 1 : ev.key === 'ArrowLeft' || ev.key === 'ArrowUp' ? -1 : 0;
        if (!d) return;
        ev.preventDefault();
        var j = (i + d + opts.length) % opts.length;
        c.set(opts[j].value); buttons[j].focus();
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
    c.set = function (v, silent) {
      if (!has(v)) { var n = opts.filter(function (x) { return String(x.value) === String(v); })[0]; if (!n) return c; v = n.value; }
      value = v; paint(); if (!silent) changed(); return c;
    };
    c.sweep = function () {
      if (opts.length <= 8) return opts.map(function (x) { return x.value; });
      return K.linspace(0, opts.length - 1, 8).map(function (i) { return opts[Math.round(i)].value; });
    };
    c.describe = function (v) { var x = opts.filter(function (y) { return y.value === v; })[0]; return x ? x.label : String(v); };
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
    btn.addEventListener('click', function () { c.set(!value); });
    var el = K.el('div', { class: 'k-field k-toggle-field', 'data-id': c.id }, btn);
    function paint() { btn.setAttribute('aria-checked', value ? 'true' : 'false'); }
    c.el = el;
    c.get = function () { return value; };
    c.set = function (v, silent) { value = v === true || v === 'true' || v === 1; paint(); if (!silent) changed(); return c; };
    c.sweep = function () { return [false, true]; };
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
    back.addEventListener('click', function () { c.set(value - 1); });
    next.addEventListener('click', function () { c.set(value + 1); });
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
    c.steps = function () { return steps.slice(); };
    c.setSteps = function (list) { steps = norm(list); value = clamp(value, 0, steps.length - 1); paint(); return c; };
    c.sweep = function () {
      var n = steps.length;
      if (n <= 12) return K.linspace(0, n - 1, Math.max(n, 2)).map(Math.round).filter(function (v, i, a) { return a.indexOf(v) === i; });
      return K.linspace(0, n - 1, 12).map(Math.round);
    };
    c.describe = function (v) { return 'step ' + (v + 1); };
    paint();
    place(el, o.into, 'K.stepper "' + c.id + '"');
    return c;
  };

  // ---------- readouts ----------
  // K.readout({id, label, unit, prefix, fmt, big, hint, into}) -> {el, set(v), get()}
  // A readout whose id matches a key of the model's outputs updates itself on every change.
  K.readout = function (o) {
    o = o || {};
    var id = String(o.id || 'readout' + (readoutList.length + 1));
    if (readouts[id]) fail('Two readouts share the id "' + id + '": ids must be unique.');
    var val = K.el('span', { class: 'k-readout-value' }, '—');
    var el = K.el('div', { class: 'k-readout' + (o.big ? ' big' : ''), 'data-id': id },
      K.el('span', { class: 'k-readout-label' }, o.label || id), val,
      o.hint ? K.el('span', { class: 'k-hint' }, o.hint) : null);
    var r = { id: id, el: el, value: undefined };
    // Long values stay on one line: shrink the text (down to 60%) rather than break a number.
    function fit() {
      val.style.fontSize = '';
      var w = val.clientWidth;
      if (!w || val.scrollWidth <= w + 1) return;
      var px = parseFloat(getComputedStyle(val).fontSize);
      val.style.fontSize = Math.max(px * 0.6, Math.floor(px * w / val.scrollWidth * 10) / 10) + 'px';
    }
    r.set = function (v) {
      setValue(v);
      fit();
      return r;
    };
    function setValue(v) {
      r.value = v;
      if (typeof v === 'number') {
        if (!isFinite(v)) { val.textContent = '—'; problem('readout "' + id + '" was given ' + (isNaN(v) ? 'NaN' : 'Infinity')); return; }
        var text = o.fmt ? String(o.fmt(v)) : K.fmt(v, o.dp != null ? { dp: o.dp } : null);
        val.textContent = (o.fmt ? '' : (o.prefix || '')) + text;
        if (o.unit && !o.fmt) val.appendChild(K.el('span', { class: 'k-readout-unit' }, unitText(o.unit)));
      } else if (v == null) {
        val.textContent = '—';
        problem('readout "' + id + '" was given ' + v);
      } else {
        val.textContent = String(v);
        if (/\bNaN\b|\bundefined\b|Infinity/.test(val.textContent)) problem('readout "' + id + '" shows "' + val.textContent.slice(0, 40) + '"');
      }
    }
    r.get = function () { return r.value; };
    readouts[id] = r;
    readoutList.push(r);
    place(el, o.into, 'K.readout "' + id + '"');
    return r;
  };

  // ---------- plots ----------
  // K.plot(target, {x, y, series, marks, regions, lines, height, aspect, label, after}) -> {draw(opts)}
  //   x / y: {min, max, label, log, prefix, unit, fmt, ticks}; leave out y.min/max to fit the data.
  //   series: [{fn(x) | points:[[x,y]...], label, color, dash, width, fill, dots, gaps}]
  //   marks:  [{x, y, label, color, guides}]   regions: [{x0, x1 | y0, y1, label, color}]
  //   lines:  [{x | y, label, color}]          after(ctx, plot): draw extra things on top
  // draw(opts) redraws with opts layered over the options the plot was created with.
  var SERIES_COLORS = ['accent2', 'accent', 'muted', 'ink'];
  function compact(v) {
    var a = Math.abs(v), u = [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'k']];
    for (var i = 0; i < u.length; i++) if (a >= u[i][0]) return K.fmt(v / u[i][0], { sig: 3 }) + u[i][1];
    return K.fmt(v);
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
    var s = Math.abs(v) >= 1e4 ? compact(v) : A.log || !A.step ? K.fmt(v) : K.fmt(v, { dp: Math.min(6, decimalsOf(A.step)) });
    return (A.prefix || '') + s + unitText(A.unit);
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
    var api = { el: root, canvas: canvas, ctx: ctx };

    function axisOf(spec, which) {
      spec = spec || {};
      var A = { min: num(spec.min, NaN), max: num(spec.max, NaN), log: !!spec.log, label: spec.label || '', fmt: spec.fmt, ticks: spec.ticks, zero: spec.zero !== false, prefix: spec.prefix, unit: spec.unit };
      if (which === 'x' && !(A.max > A.min)) throw new Error('K.plot "' + name + '": x needs {min, max} with max > min');
      if (A.log && which === 'x' && !(A.min > 0)) throw new Error('K.plot "' + name + '": a log x axis needs min > 0');
      return A;
    }
    function sample(s, i, X, w) {
      var pts = [], label = s.label || 'series ' + (i + 1), bad = null;
      if (typeof s.fn === 'function') {
        var n = clamp(Math.round(w / 2), 80, 600);
        var a = X.log ? Math.log(X.min) : X.min, b = X.log ? Math.log(X.max) : X.max;
        for (var k = 0; k <= n; k++) {
          var x = a + (b - a) * k / n;
          if (X.log) x = Math.exp(x);
          var y;
          try { y = s.fn(x); } catch (e) { fault('plot "' + name + '" series "' + label + '"', e); break; }
          pts.push([x, y]);
        }
      } else if (Array.isArray(s.points)) {
        pts = s.points.map(function (p) { return Array.isArray(p) ? [p[0], p[1]] : [p && p.x, p && p.y]; });
      }
      pts.forEach(function (p) { if (!bad && !(isNum(p[0]) && isNum(p[1]))) bad = p; });
      if (bad && !s.gaps) problem('plot "' + name + '": series "' + label + '" has ' + (isNaN(bad[1]) || isNaN(bad[0]) ? 'NaN' : 'Infinity') + ' at x = ' + K.fmt(bad[0]));
      return { s: s, pts: pts, label: s.label, color: K.color(s.color || SERIES_COLORS[i % SERIES_COLORS.length]) };
    }
    function fitY(Y, data, marks) {
      var lo = Infinity, hi = -Infinity;
      data.forEach(function (d) { d.pts.forEach(function (p) { if (isNum(p[1]) && (!Y.log || p[1] > 0)) { lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); } }); });
      (marks || []).forEach(function (m) { if (isNum(m.y)) { lo = Math.min(lo, m.y); hi = Math.max(hi, m.y); } });
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
      var c = K.theme.c;
      var w = Math.round(root.clientWidth || (root.parentNode && root.parentNode.clientWidth) || 320);
      lastW = root.clientWidth;
      var h = Math.round(num(cur.height, 0) || clamp(w * num(cur.aspect, 0.62), 220, 380));
      var dpr = clamp(window.devicePixelRatio || 1, 1, 3);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      var X = axisOf(cur.x, 'x'), Y = axisOf(cur.y, 'y');
      var data = (cur.series || []).map(function (s, i) { return sample(s, i, X, w); });
      if (!(Y.max > Y.min) || Y.log && !(Y.min > 0)) fitY(Y, data, cur.marks);
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

      // Gridlines (horizontal only: calm) and the baseline.
      ctx.lineWidth = 1;
      ctx.strokeStyle = c.line;
      yt.forEach(function (t) { var y = Math.round(sy(t)) + 0.5; ctx.beginPath(); ctx.moveTo(box.x, y); ctx.lineTo(box.x + box.w, y); ctx.stroke(); });
      ctx.strokeStyle = c.strong;
      ctx.beginPath(); ctx.moveTo(box.x, Math.round(box.y + box.h) + 0.5); ctx.lineTo(box.x + box.w, Math.round(box.y + box.h) + 0.5); ctx.stroke();

      ctx.save();
      ctx.beginPath(); ctx.rect(box.x, box.y - 1, box.w, box.h + 2); ctx.clip();
      // Shaded regions (amber highlight by default).
      (cur.regions || []).forEach(function (r) {
        var col = K.color(r.color || 'hl');
        ctx.fillStyle = col;
        ctx.globalAlpha = r.color && r.color !== 'hl' ? 0.14 : (K.theme.dark ? 1 : 0.6);
        if (isNum(r.x0) || isNum(r.x1)) {
          var a = sx(isNum(r.x0) ? r.x0 : X.min), b = sx(isNum(r.x1) ? r.x1 : X.max);
          ctx.fillRect(Math.min(a, b), box.y, Math.abs(b - a), box.h);
        } else {
          var t = sy(isNum(r.y1) ? r.y1 : Y.max), u = sy(isNum(r.y0) ? r.y0 : Y.min);
          ctx.fillRect(box.x, Math.min(t, u), box.w, Math.abs(u - t));
        }
        ctx.globalAlpha = 1;
      });
      // Reference lines.
      (cur.lines || []).forEach(function (l) {
        ctx.strokeStyle = K.color(l.color || 'muted');
        ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (isNum(l.x)) { ctx.moveTo(sx(l.x), box.y); ctx.lineTo(sx(l.x), box.y + box.h); }
        else if (isNum(l.y)) { ctx.moveTo(box.x, sy(l.y)); ctx.lineTo(box.x + box.w, sy(l.y)); }
        ctx.stroke(); ctx.setLineDash([]);
      });
      // Series.
      var zero = sy(Y.log ? Y.min : clamp(0, Y.min, Y.max));
      data.forEach(function (d, i) {
        var s = d.s;
        ctx.strokeStyle = d.color; ctx.fillStyle = d.color;
        ctx.lineWidth = num(s.width, i === 0 ? 2.75 : 2.25);
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.setLineDash(s.dash ? [7, 6] : []);
        if (s.dots) {
          d.pts.forEach(function (p) { if (isNum(p[0]) && isNum(p[1])) { ctx.beginPath(); ctx.arc(sx(p[0]), sy(p[1]), num(s.r, 3.5), 0, 7); ctx.fill(); } });
          return;
        }
        var runs = [], run = [];
        d.pts.forEach(function (p) {
          if (isNum(p[0]) && isNum(p[1]) && (!Y.log || p[1] > 0)) run.push([sx(p[0]), sy(p[1])]);
          else if (run.length) { runs.push(run); run = []; }
        });
        if (run.length) runs.push(run);
        runs.forEach(function (r) {
          if (s.fill) {
            ctx.globalAlpha = 0.13;
            ctx.beginPath(); ctx.moveTo(r[0][0], zero);
            r.forEach(function (q) { ctx.lineTo(q[0], q[1]); });
            ctx.lineTo(r[r.length - 1][0], zero); ctx.closePath(); ctx.fill();
            ctx.globalAlpha = 1;
          }
          ctx.beginPath();
          r.forEach(function (q, j) { if (j) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); });
          ctx.stroke();
        });
        ctx.setLineDash([]);
      });
      ctx.restore();

      // Tick labels and axis titles.
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
      ctx.font = labelFont; ctx.fillStyle = c.muted;
      if (X.label) { ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(X.label, box.x + box.w / 2, h - 2, w - 8); }
      if (Y.label) { ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(Y.label, 2, 4, w - 8); }

      // Region labels (top-left inside the band).
      ctx.font = '600 12px ' + FONT; ctx.textBaseline = 'top'; ctx.textAlign = 'left'; ctx.fillStyle = c.ink;
      (cur.regions || []).forEach(function (r) {
        if (!r.label) return;
        var x0 = isNum(r.x0) ? sx(r.x0) : box.x;
        var tw = ctx.measureText(r.label).width;
        ctx.fillText(r.label, clamp(x0 + 6, box.x + 4, box.x + box.w - tw - 4), isNum(r.y1) && !isNum(r.x0) ? sy(r.y1) + 4 : box.y + 4);
      });
      (cur.lines || []).forEach(function (l) {
        if (!l.label) return;
        ctx.fillStyle = c.muted;
        var tw = ctx.measureText(l.label).width;
        if (isNum(l.x)) ctx.fillText(l.label, clamp(sx(l.x) + 5, box.x + 2, box.x + box.w - tw - 2), box.y + 4);
        else if (isNum(l.y)) { ctx.textBaseline = 'bottom'; ctx.fillText(l.label, box.x + box.w - tw - 4, sy(l.y) - 3); ctx.textBaseline = 'top'; }
      });

      // Marks: a dot with a ring and optional guides to the axes; then label pills, each placed
      // above-right, above-left, below-right or below-left of its dot, wherever it collides with
      // nothing already drawn (a label that fits nowhere is left out; its dot stays).
      var placed = [], shown = [];
      (cur.marks || []).forEach(function (m) {
        if (!isNum(m.x) || !isNum(m.y)) { problem('plot "' + name + '": mark "' + (m.label || '') + '" has a non-finite position'); return; }
        var px = sx(m.x), py = sy(m.y), col = K.color(m.color || 'accent2'), rad = num(m.r, 6.5);
        if (px < box.x - 1 || px > box.x + box.w + 1 || py < box.y - 1 || py > box.y + box.h + 1) return;
        if (m.guides) {
          ctx.strokeStyle = col; ctx.globalAlpha = 0.5; ctx.lineWidth = 1.25; ctx.setLineDash([3, 4]);
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, box.y + box.h); ctx.moveTo(px, py); ctx.lineTo(box.x, py); ctx.stroke();
          ctx.setLineDash([]); ctx.globalAlpha = 1;
        }
        ctx.beginPath(); ctx.arc(px, py, rad, 0, 7);
        ctx.fillStyle = col; ctx.fill();
        ctx.lineWidth = 2.5; ctx.strokeStyle = c.bg; ctx.stroke();
        placed.push({ x: px - rad - 2, y: py - rad - 2, w: 2 * rad + 4, h: 2 * rad + 4 });
        if (m.label) shown.push({ px: px, py: py, text: String(m.label) });
      });
      ctx.font = '700 13px ' + FONT;
      shown.forEach(function (l) {
        var tw = ctx.measureText(l.text).width, bw = tw + 14, bh = 24;
        var spots = [[l.px + 10, l.py - bh - 8], [l.px - 10 - bw, l.py - bh - 8], [l.px + 10, l.py + 10], [l.px - 10 - bw, l.py + 10]];
        var spot = null;
        for (var k = 0; k < spots.length && !spot; k++) {
          var r = { x: spots[k][0], y: spots[k][1], w: bw, h: bh };
          if (r.x < 2 || r.x + bw > w - 2 || r.y < 2 || r.y + bh > h - 2) continue;
          if (!placed.some(function (q) { return r.x < q.x + q.w && q.x < r.x + r.w && r.y < q.y + q.h && q.y < r.y + r.h; })) spot = r;
        }
        if (!spot) return;
        placed.push(spot);
        ctx.fillStyle = c.bg; ctx.strokeStyle = c.line; ctx.lineWidth = 1;
        roundRect(ctx, spot.x, spot.y, bw, bh, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = c.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(l.text, spot.x + 7, spot.y + bh / 2 + 0.5);
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
      (cur.marks || []).forEach(function (m) { if (m.label) alt += '. ' + m.label + ' at ' + K.fmt(m.x) + ', ' + K.fmt(m.y); });
      canvas.setAttribute('aria-label', alt);
    }

    api.draw = function (next) {
      cur = next ? Object.assign({}, base, next) : cur;
      try { render(); } catch (e) { fault('plot "' + name + '"', e); }
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

  // K.bars(target, {max, unit, prefix, fmt, into}) -> {draw(items)}   horizontal bars in HTML
  //   items: [{label, value, color?}]; values are non-negative; max defaults to a nice ceiling.
  K.bars = function (target, o) {
    if (o === undefined && target && typeof target === 'object' && !target.nodeType) { o = target; target = null; }
    o = o || {};
    var root = target ? resolve(target, 'K.bars') : K.el('div');
    if (!target && o.into) place(root, o.into, 'K.bars');
    root.classList.add('k-bars');
    var api = { el: root };
    api.draw = function (items, next) {
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
        row.querySelector('b').textContent = ok ? (opt.fmt ? String(opt.fmt(it.value)) : (opt.prefix || '') + K.fmt(it.value) + unitText(opt.unit)) : '—';
        var fill = row.querySelector('i');
        fill.style.width = (ok ? clamp(it.value / top, 0, 1) * 100 : 0).toFixed(2) + '%';
        fill.style.background = K.color(it.color || 'accent2');
      });
      heightSoon();
      return api;
    };
    if (o.items) api.draw(o.items);
    return api;
  };

  // ---------- animation ----------
  // K.anim({step(dt, t), reset?, label?, autoplay?, into}) -> {el, play, pause, toggle, reset, playing()}
  // Never autoplays when the viewer prefers reduced motion; pauses when the page is hidden.
  K.anim = function (o) {
    o = o || {};
    if (typeof o.step !== 'function') throw new Error('K.anim needs step(dt, t)');
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var playing = false, t = 0, last = 0, raf = 0;
    var btn = K.el('button', { type: 'button', class: 'k-btn', 'aria-pressed': 'false' });
    var resetBtn = o.reset ? K.el('button', { type: 'button', class: 'k-btn secondary' }, 'Reset') : null;
    var el = K.el('div', { class: 'k-anim' }, btn, resetBtn);
    function paint() {
      btn.innerHTML = playing ? ICON.pause : ICON.play;
      btn.appendChild(document.createTextNode(playing ? 'Pause' : (o.label || 'Play')));
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    }
    function frame(ts) {
      if (!playing) return;
      var dt = last ? Math.min((ts - last) / 1000, 0.05) : 0;
      last = ts; t += dt;
      try { o.step(dt, t); } catch (e) { api.pause(); fault('K.anim step', e); return; }
      raf = requestAnimationFrame(frame);
    }
    var api = {
      el: el,
      playing: function () { return playing; },
      play: function () { if (playing) return api; playing = true; last = 0; raf = requestAnimationFrame(frame); paint(); return api; },
      pause: function () { playing = false; cancelAnimationFrame(raf); paint(); return api; },
      toggle: function () { return playing ? api.pause() : api.play(); },
      reset: function () { api.pause(); t = 0; if (o.reset) { try { o.reset(); } catch (e) { fault('K.anim reset', e); } } return api; },
      time: function () { return t; },
    };
    btn.addEventListener('click', api.toggle);
    if (resetBtn) resetBtn.addEventListener('click', api.reset);
    document.addEventListener('visibilitychange', function () { if (document.hidden) api.pause(); });
    anims.push({ o: o, api: api, autoplay: !!o.autoplay && !reduce });
    paint();
    place(el, o.into, 'K.anim');
    return api;
  };

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
        if (!r.ok) r.error = 'returned ' + (typeof v === 'number' ? K.fmt(v, { sig: 6 }) : String(v)).slice(0, 60);
      } catch (e) { r.error = errText(e) + stackLine(e); }
      return r;
    });
  }
  // Call once at the end of the body script: draws the opening state and reports checks.
  K.ready = function () {
    if (readyCalled) return K;
    readyCalled = true;
    run();
    var results = runChecks();
    post({ type: 'ready', checks: results });
    sendHeight();
    [60, 250, 800, 2000].forEach(function (ms) { setTimeout(sendHeight, ms); });
    anims.forEach(function (a) { if (a.autoplay) a.api.play(); });
    return K;
  };

  // ---------- self-test ----------
  function describeEl(el) {
    var s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    var cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/)[0] : '';
    if (cls) s += '.' + cls;
    return '<' + s + '>';
  }
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
  }
  function attachedProblems(list) {
    controls.forEach(function (c) { if (c.el && !c.el.isConnected) list.push('control "' + c.id + '" was created but never added to the page (pass into: or append control.el)'); });
    readoutList.forEach(function (r) { if (!r.el.isConnected) list.push('readout "' + r.id + '" was created but never added to the page'); });
    plots.forEach(function (p, i) { if (!p.el.isConnected) list.push('plot ' + (i + 1) + ' is not on the page'); });
  }
  // Exercise every control across its range, timing each update and catching faults, then restore.
  function sweep() {
    var s = { seen: Object.create(null), order: [], ctx: '' }, overflow = null;
    sink = s;
    var init = controls.map(function (c) { return c.get(); });
    function step(ctxText) {
      s.ctx = ctxText;
      var t0 = now(); run(); var dt = now() - t0;
      if (dt > SLOW_MS) { t0 = now(); run(); dt = Math.min(dt, now() - t0); }
      if (dt > SLOW_MS) problem('an update took ' + Math.round(dt) + ' ms (keep each under ' + SLOW_MS + ' ms)');
      if (!overflow) { var o = overflowNow(); if (o) overflow = o + ' (at ' + ctxText + ')'; }
    }
    try {
      step('the opening state');
      controls.forEach(function (c, i) {
        c.sweep().forEach(function (v) { c.set(v, true); step(c.id + ' = ' + c.describe(v)); });
        c.set(init[i], true);
      });
      if (controls.length > 1) {
        controls.forEach(function (c) { var v = c.sweep(); c.set(v[0], true); });
        step('every control at its lowest');
        controls.forEach(function (c) { var v = c.sweep(); c.set(v[v.length - 1], true); });
        step('every control at its highest');
      }
      anims.forEach(function (a, i) {
        s.ctx = 'animation ' + (i + 1);
        try { for (var k = 1; k <= 30; k++) a.o.step(1 / 30, k / 30); } catch (e) { problem('K.anim step threw ' + errText(e) + stackLine(e)); }
        a.api.reset();
      });
    } finally {
      controls.forEach(function (c, i) { c.set(init[i], true); });
      s.ctx = 'restoring the opening state';
      run();
      sink = null;
    }
    var problems = s.order.map(function (m) { var e = s.seen[m]; return m + ' (at ' + e.at + (e.n > 1 ? ', and ' + (e.n - 1) + ' more setting' + (e.n > 2 ? 's' : '') : '') + ')'; });
    return { problems: problems, overflow: overflow, seen: s.seen };
  }
  function selftest() {
    var t0 = now();
    scanExternal();
    if (!readyCalled) addUnique(errors, 'K.ready() was never called: call it once at the end of the script.');
    if (!checks.length) addUnique(errors, 'There are no K.check(...) assertions: add 3-5 known-answer checks.');
    var checkResults = runChecks();
    var sw = sweep();
    var problems = liveProblems.filter(function (m) { return !sw.seen[m]; }).concat(sw.problems);
    attachedProblems(problems);
    var report = {
      ok: false,
      errors: errors.slice(),
      overflow: !!sw.overflow,
      checks: checkResults,
      sweep: { ok: !problems.length, problems: problems.slice(0, 16) },
      controls: controls.map(function (c) { return c.id; }),
      readouts: readoutList.map(function (r) { return r.id; }),
      outputs: Object.keys(lastOutputs || {}),
      ready: readyCalled,
      warnings: warnings.slice(),
      width: document.documentElement.clientWidth,
      height: measure(),
      ms: 0,
    };
    if (sw.overflow) report.overflowDetail = sw.overflow;
    if (checks.length && checks.length < 3) report.warnings.push('Only ' + checks.length + ' K.check assertion' + (checks.length > 1 ? 's' : '') + ': aim for 3-5.');
    if (checks.length && !checks.some(function (c) { return c.source; })) report.warnings.push('No K.check has a source: add one known value from a cited reference.');
    if (!controls.length) report.warnings.push('No K.control / K.choice / K.toggle / K.stepper: the self-test could not exercise the model.');
    report.ok = !report.errors.length && !report.overflow && checkResults.length > 0 &&
      checkResults.every(function (c) { return c.ok; }) && report.sweep.ok && readyCalled;
    report.ms = Math.round(now() - t0);
    return report;
  }

  // ---------- height ----------
  // The host sizes the iframe to the content. A runaway (content that grows with the frame, e.g.
  // vh units) is capped and reported.
  var lastH = 0, hTimer = 0, grows = [], MAX_H = 6000;
  function measure() {
    var b = document.body;
    if (!b) return 0;
    var top = document.documentElement.getBoundingClientRect().top;
    var cs = getComputedStyle(b);
    return Math.ceil(b.getBoundingClientRect().bottom - top + (parseFloat(cs.marginBottom) || 0));
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
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(heightSoon);
      ro.observe(document.body);
      ro.observe(document.documentElement);
    }
    sendHeight();
    [120, 600].forEach(function (ms) { setTimeout(sendHeight, ms); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  // ---------- host requests ----------
  window.addEventListener('message', function (ev) {
    if (!hosted || ev.source !== host) return;
    var d = ev.data;
    if (!d || typeof d !== 'object' || typeof d.type !== 'string') return;
    var rid = d.rid;
    if (d.type === 'selftest') {
      var report;
      try { report = selftest(); } catch (e) { report = { ok: false, errors: ['The self-test itself failed: ' + errText(e)], overflow: false, checks: [], sweep: { ok: false, problems: [] }, controls: [], readouts: [] }; }
      post({ type: 'report', rid: rid, report: report });
    } else if (d.type === 'get') {
      post({ type: 'state', rid: rid, params: K.params(), outputs: stateOutputs() });
    } else if (d.type === 'set') {
      var c = byId[d.id];
      if (!c) { post({ type: 'error', rid: rid, message: 'No control with id "' + d.id + '"' }); return; }
      c.set(d.value, true);
      run();
      post({ type: 'state', rid: rid, params: K.params(), outputs: stateOutputs() });
    } else if (d.type === 'theme') {
      applyTheme(d.theme);
      plots.forEach(function (p) { p.redraw(); });
      if (everRun) run();
    }
  });
})();
