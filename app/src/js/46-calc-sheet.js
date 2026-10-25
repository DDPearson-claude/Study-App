// The calculator sheet (U.calcSheet): Dan's scientific calculator (Dan, 25 Oct: "Some quizzes require
// quite complicated maths… add a scientific calculator icon I can tap to open in the app"). Its icon
// sits in the top bar beside Aa, and in the lesson's own bar, the read-through's and the review's
// (focus screens hide the top bar). It opens over the lower part of the screen and is not modal: the
// page above stays readable and scrollable (#view takes the sheet's height as bottom padding while it
// is open, --calc-h), and a sheet such as Settings still opens over it. Closed by its icon again,
// its Close button or Escape. Built with U.h only; every sum goes to U.calc (45-calc.js), never to eval.
//
// It keeps its state for the visit when closed (the sum, Ans, 2nd), and remembers DEG/RAD, ENG and
// the last 10 sums on this device (localStorage 'mu.calc', always inside try). Keys are 44 px or
// more, six to a row, so it fits a 360 px phone; its keys scroll inside it on a short screen. The
// sum is a text field with no on-screen keyboard (inputmode none): the keys type into it at the
// caret, and a laptop's keyboard types into it directly (Enter works it out, Escape closes).
// Insert: when a typed-answer box is showing (a lesson page's K.answer, asked through the kit's
// 'field' and 'insert' messages, or a puzzle card's own box), one tap puts the result in it as
// plain digits, focused and not checked; with no such box the button is not shown.
//
//   U.calcSheet.open(opener?) / close() / toggle(opener?) / isOpen()
//   U.calcSheet.button(cls?) -> the calculator icon button (aria-expanded follows the sheet)
//   U.calcSheet.state   the live state, for tests: {expr, done, value, error, angle, eng, hist, ans, target}
(function () {
  'use strict';
  if (typeof document === 'undefined' || !U.calc) return;
  var h = U.h, C = U.calc;
  var KEY = 'mu.calc', HIST_MAX = 10, POLL_MS = 1500;

  U.icons.calc = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="2.75" width="14" height="18.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="8" y="5.6" width="8" height="3.6" rx="1" fill="currentColor"/><g fill="currentColor"><circle cx="9" cy="13" r="1.2"/><circle cx="12" cy="13" r="1.2"/><circle cx="15" cy="13" r="1.2"/><circle cx="9" cy="17" r="1.2"/><circle cx="12" cy="17" r="1.2"/><circle cx="15" cy="17" r="1.2"/></g></svg>';
  U.icons.history = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.6 12a7.4 7.4 0 1 0 2.2-5.25M4.4 3.9v3.6H8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8v4.3l2.9 1.8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  U.icons.backspace = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5.5h10a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H9L3.5 12 9 5.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m11.5 9.5 5 5m0-5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  U.icons.insert = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5v10.5m-4.2-4.2L12 14l4.2-4.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 14.5v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  // ---------- state ----------
  var S = U.calcSheet && U.calcSheet.state ? U.calcSheet.state : {
    open: false, expr: '', caret: 0, done: false, value: null, error: '', shift: false,
    angle: 'deg', eng: false, hist: [], ans: 0, view: 'keys', target: null,
  };
  // What this device remembers: DEG/RAD, ENG and the last 10 sums ({e: the sum, v: its value}).
  (function load() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!d || typeof d !== 'object') return;
      if (d.angle === 'rad' || d.angle === 'deg') S.angle = d.angle;
      S.eng = d.eng === true;
      S.hist = (Array.isArray(d.hist) ? d.hist : []).filter(function (x) {
        return x && typeof x.e === 'string' && x.e.length <= C.MAX_LEN && typeof x.v === 'number' && isFinite(x.v);
      }).slice(0, HIST_MAX).map(function (x) { return { e: x.e, v: x.v }; });
      if (S.hist.length) S.ans = S.hist[0].v;
    } catch (e) { /* storage blocked or spoilt: the defaults */ }
  })();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ v: 1, angle: S.angle, eng: S.eng, hist: S.hist })); } catch (e) { /* kept for this visit */ }
  }

  // ---------- keys ----------
  // Seven to a row, five rows: powers, roots, brackets and logs along the top; trig and the prefixes
  // down the left; then a school calculator's own block (7 8 9 DEL AC / 4 5 6 × ÷ / 1 2 3 + − /
  // 0 . ×10ⁿ Ans =). op: after a result the key carries on from Ans ("Ans×"); the others start a new
  // sum. alt: what the key does while 2nd (in the top row) is on; its label changes to say so.
  function key(id, label, aria, ins, kind, extra) { return Object.assign({ id: id, label: label, aria: aria, ins: ins, kind: kind || 'fn' }, extra || {}); }
  function digit(d) { return key('d' + d, d, null, d, 'num'); }
  var KEYS = [
    key('sq', 'x²', 'squared', '²', 'fn', { op: true, alt: key('cube', 'x³', 'cubed', '³', 'fn', { op: true }) }),
    key('pow', 'xʸ', 'to the power', '^', 'fn', { op: true, alt: key('inv', 'x⁻¹', 'reciprocal, to the power minus 1', '⁻¹', 'fn', { op: true }) }),
    key('sqrt', '√', 'square root', '√(', 'fn', { alt: key('cbrt', '∛', 'cube root', '∛(') }),
    key('lp', '(', 'open bracket', '(', 'fn', { alt: key('abs', 'abs', 'absolute value', 'abs(') }),
    key('rp', ')', 'close bracket', ')', 'fn', { op: true }),
    key('log', 'log', 'log, base 10', 'log(', 'fn', { alt: key('tenx', '10ˣ', '10 to the power', '10^(') }),
    key('ln', 'ln', 'natural log', 'ln(', 'fn', { alt: key('ex', 'eˣ', 'e to the power', 'e^(') }),

    key('sin', 'sin', 'sine', 'sin(', 'fn', { alt: key('asin', 'sin⁻¹', 'inverse sine', 'sin⁻¹(') }),
    key('M', 'M', 'M, mega', 'M', 'pre', { alt: key('G', 'G', 'G, giga', 'G', 'pre') }),
    digit('7'), digit('8'), digit('9'),
    key('del', '', 'Delete', null, 'ctl', { act: 'back', icon: 'backspace' }),
    key('ac', 'AC', 'AC, clear all', null, 'ctl', { act: 'clear' }),

    key('cos', 'cos', 'cosine', 'cos(', 'fn', { alt: key('acos', 'cos⁻¹', 'inverse cosine', 'cos⁻¹(') }),
    key('k', 'k', 'k, kilo', 'k', 'pre'),
    digit('4'), digit('5'), digit('6'),
    key('mul', '×', 'times', '×', 'op', { op: true }),
    key('div', '÷', 'divided by', '÷', 'op', { op: true, alt: key('pct', '%', 'percent', '%', 'op', { op: true }) }),

    key('tan', 'tan', 'tangent', 'tan(', 'fn', { alt: key('atan', 'tan⁻¹', 'inverse tangent', 'tan⁻¹(') }),
    key('m', 'm', 'm, milli', 'm', 'pre', { alt: key('n', 'n', 'n, nano', 'n', 'pre') }),
    digit('1'), digit('2'), digit('3'),
    key('add', '+', 'plus', '+', 'op', { op: true }),
    key('sub', '−', 'minus', '−', 'op', { op: true }),

    key('pi', 'π', 'pi', 'π', 'fn', { alt: key('e', 'e', 'e, 2.718', 'e') }),
    key('u', 'µ', 'µ, micro', 'µ', 'pre', { alt: key('p', 'p', 'p, pico', 'p', 'pre') }),
    digit('0'), key('dot', '.', 'point', '.', 'num'),
    key('exp', '×10ⁿ', '×10ⁿ, times ten to the power', 'E', 'fn'),
    key('ans', 'Ans', 'Ans, the last answer', 'Ans', 'fn'),
    key('eq', '=', 'equals', null, 'eq', { act: 'equals' }),
  ];

  // ---------- the sheet ----------
  var el = null, poll = 0, opener = null, ro = null, sayTimer = 0, insertedTimer = 0;
  function build() {
    if (el) return el;
    el = {};
    el.status = h('p', { class: 'visually-hidden', role: 'status', 'aria-live': 'polite' });
    el.shift = h('button', { class: 'calc-tog calc-shift', type: 'button', 'aria-label': '2nd, second functions', 'aria-pressed': 'false', on: { click: toggleShift } }, '2nd');
    el.angle = h('button', { class: 'calc-tog calc-angle', type: 'button', on: { click: toggleAngle } });
    el.eng = h('button', { class: 'calc-tog calc-eng', type: 'button', 'aria-label': 'ENG, engineering notation', on: { click: toggleEng } }, 'ENG');
    el.histBtn = h('button', { class: 'calc-tog calc-hist-btn', type: 'button', 'aria-label': 'History', on: { click: toggleHistory } }, U.icon('history'));
    el.insert = h('button', { class: 'btn small calc-insert', type: 'button', hidden: true, 'aria-label': 'Insert the answer into the answer box', on: { click: insertResult } },
      U.icon('insert'), h('span', { class: 'calc-insert-t' }, 'Insert'));
    el.close = h('button', { class: 'icon-btn calc-x', type: 'button', 'aria-label': 'Close calculator', on: { click: function () { close(); } } }, U.icon('close'));
    el.res = h('p', { class: 'calc-res', id: 'calc-res' });
    el.expr = h('input', { class: 'calc-expr', type: 'text', inputmode: 'none', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
      maxlength: String(C.MAX_LEN), 'aria-label': 'Sum', 'aria-describedby': 'calc-res', enterkeyhint: 'done',
      on: { input: onInput, keydown: onExprKey, select: keepCaret, click: keepCaret, keyup: keepCaret } });
    el.keys = h('div', { class: 'calc-keys', role: 'group', 'aria-label': 'Keys' }, KEYS.map(function (k) {
      var b = h('button', { class: 'calc-key is-' + k.kind, type: 'button', dataset: { key: k.id }, on: { click: function () { press(k); } } });
      k.btn = b;
      return b;
    }));
    el.histList = h('ol', { class: 'calc-hist-list' });
    el.hist = h('div', { class: 'calc-hist', hidden: true },
      h('p', { class: 'calc-hist-h' }, 'Your last sums'),
      el.histList,
      el.histClear = h('button', { class: 'linkish calc-hist-clear', type: 'button', on: { click: clearHistory } }, 'Clear history'));
    el.panel = h('section', { class: 'calc', id: 'calc', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'calc-h', hidden: true,
      on: { keydown: onPanelKey, mousedown: keepFocus } },
      h('div', { class: 'calc-in' },
        h('h2', { id: 'calc-h', class: 'visually-hidden' }, 'Calculator'),
        h('div', { class: 'calc-top' }, el.shift, el.angle, el.eng, el.histBtn, h('span', { class: 'calc-gap' }), el.close),
        h('div', { class: 'calc-disp' }, el.expr, h('div', { class: 'calc-out' }, el.insert, el.res)),
        h('div', { class: 'calc-body' }, el.keys, el.hist),
        el.status));
    document.body.appendChild(el.panel);
    return el;
  }
  // Tapping a key keeps the caret in the sum when it is there (no focus jumps, no keyboard).
  function keepFocus(e) {
    if (e.target === el.expr || !el.expr || document.activeElement !== el.expr) return;
    if (e.target.closest && e.target.closest('button')) e.preventDefault();
  }
  function keepCaret() { if (document.activeElement === el.expr) S.caret = el.expr.selectionEnd == null ? S.expr.length : el.expr.selectionEnd; }

  // ---------- drawing ----------
  function labelKeys() {
    KEYS.forEach(function (k) {
      var on = S.shift && k.alt ? k.alt : k;
      U.clear(k.btn);
      if (on.icon) k.btn.appendChild(U.icon(on.icon));
      else k.btn.appendChild(document.createTextNode(on.label));
      if (on.aria) k.btn.setAttribute('aria-label', on.aria); else k.btn.removeAttribute('aria-label');
      k.btn.classList.toggle('is-alt', on !== k);
    });
    el.shift.setAttribute('aria-pressed', S.shift ? 'true' : 'false');
  }
  // How a number is said: "1.5×10⁻⁷" as "1.5 times 10 to the power minus 7".
  function spoken(text) {
    var map = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': 'minus ' };
    return String(text).replace(/×10([⁻⁰¹²³⁴-⁹]+)/, function (_, p) {
      return ' times 10 to the power ' + p.split('').map(function (c) { return map[c]; }).join('');
    });
  }
  function say(text) {
    clearTimeout(sayTimer);
    el.status.textContent = '';
    sayTimer = setTimeout(function () { if (el) el.status.textContent = text; }, 60);
  }
  function show(v) { return C.format(v, { eng: S.eng }); }
  function drawResult() {
    var text = '', cls = 'calc-res';
    if (S.error) { text = S.error; cls += ' is-error'; }
    else if (S.done && S.value != null) { text = show(S.value); cls += ' is-done'; }
    else if (S.expr.trim()) {
      var live = C.evaluate(S.expr, { angle: S.angle, ans: S.ans, close: true });
      if (live.ok) text = show(live.value);
      cls += ' is-live';
    }
    el.res.className = cls;
    el.res.textContent = text;
  }
  function drawHistory() {
    U.clear(el.histList);
    if (!S.hist.length) el.histList.appendChild(h('li', { class: 'calc-hist-none muted' }, 'Your last 10 sums show here. Tap one to use it again.'));
    S.hist.forEach(function (x) {
      el.histList.appendChild(h('li', null, h('button', { class: 'calc-hrow', type: 'button', 'aria-label': x.e + ' equals ' + spoken(show(x.v)) + '. Use this sum again',
        on: { click: function () { reuse(x); } } },
        h('span', { class: 'calc-hrow-e' }, x.e), h('span', { class: 'calc-hrow-v' }, '= ' + show(x.v)))));
    });
    el.histClear.hidden = !S.hist.length;
  }
  function render(fromInput) {
    if (!el) return;
    if (!fromInput && el.expr.value !== S.expr) el.expr.value = S.expr;
    if (!fromInput && document.activeElement === el.expr) try { el.expr.setSelectionRange(S.caret, S.caret); } catch (e) { /* fine */ }
    drawResult();
    el.angle.textContent = S.angle === 'rad' ? 'RAD' : 'DEG';
    el.angle.setAttribute('aria-label', S.angle === 'rad' ? 'RAD, angles in radians' : 'DEG, angles in degrees');
    el.eng.setAttribute('aria-pressed', S.eng ? 'true' : 'false');
    el.histBtn.setAttribute('aria-pressed', S.view === 'hist' ? 'true' : 'false');
    el.keys.classList.toggle('is-away', S.view === 'hist');
    if (S.view === 'hist') el.keys.setAttribute('inert', ''); else el.keys.removeAttribute('inert');
    el.hist.hidden = S.view !== 'hist';
    labelKeys();
    if (S.view === 'hist') drawHistory();
  }

  // ---------- typing ----------
  function caretRange() {
    if (document.activeElement === el.expr && el.expr.selectionStart != null) return [el.expr.selectionStart, el.expr.selectionEnd];
    var c = Math.max(0, Math.min(S.caret, S.expr.length));
    return [c, c];
  }
  // text goes in at the caret. After a result, a key that carries on (op) starts from Ans; any
  // other starts a new sum.
  function typeIn(text, carriesOn) {
    var r;
    if (S.done) {
      S.expr = carriesOn ? 'Ans' : '';
      r = [S.expr.length, S.expr.length];
      S.done = false;
    } else r = caretRange();
    S.expr = (S.expr.slice(0, r[0]) + text + S.expr.slice(r[1])).slice(0, C.MAX_LEN);
    S.caret = Math.min(S.expr.length, r[0] + text.length);
    S.error = ''; S.value = null;
    render();
  }
  // The name or symbol just before the caret goes as one (sin⁻¹(, Ans, ×10ⁿ's E), else one character.
  var UNITS = /(sin⁻¹\(|cos⁻¹\(|tan⁻¹\(|sin\(|cos\(|tan\(|log\(|ln\(|abs\(|10\^\(|e\^\(|√\(|∛\(|Ans|⁻¹)$/;
  function backspace() {
    S.done = false; S.error = ''; S.value = null;
    var r = caretRange(), a = r[0], b = r[1];
    if (a === b) {
      var m = UNITS.exec(S.expr.slice(0, a));
      a = Math.max(0, a - (m ? m[0].length : 1));
    }
    S.expr = S.expr.slice(0, a) + S.expr.slice(b);
    S.caret = a;
    render();
  }
  function clearAll() {
    S.expr = ''; S.caret = 0; S.done = false; S.value = null; S.error = '';
    render();
  }
  function toggleShift() { S.shift = !S.shift; render(); }
  function press(k) {
    var on = S.shift && k.alt ? k.alt : k;
    S.shift = false;
    if (S.view === 'hist') S.view = 'keys';
    if (on.act === 'clear') clearAll();
    else if (on.act === 'back') backspace();
    else if (on.act === 'equals') equals();
    else typeIn(on.ins, !!on.op);
  }
  // Works the sum out. Brackets still open are closed at the end (as a school calculator does) and
  // shown so. -> true when there is a result.
  function equals() {
    if (!S.expr.trim()) { S.error = ''; render(); return false; }
    var closed = C.closeBrackets(S.expr);
    if (closed !== S.expr) { S.expr = closed; S.caret = closed.length; }
    var r = C.evaluate(S.expr, { angle: S.angle, ans: S.ans });
    if (!r.ok) {
      S.error = r.error; S.done = false; S.value = null;
      render(); say(r.error);
      return false;
    }
    S.value = r.value; S.ans = r.value; S.done = true; S.error = '';
    var top = S.hist[0];
    if (!top || top.e !== S.expr || top.v !== r.value) S.hist.unshift({ e: S.expr, v: r.value });
    S.hist = S.hist.slice(0, HIST_MAX);
    save();
    S.caret = S.expr.length;
    render();
    say('equals ' + spoken(show(r.value)));
    return true;
  }
  var OPS = /^[+\-−*×/÷^%)²³]$/;
  function normal(text) { return text.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−'); }
  function onInput() {
    var v = el.expr.value, c = el.expr.selectionEnd, n = normal(v);
    if (n !== v) { el.expr.value = n; try { el.expr.setSelectionRange(c, c); } catch (e) { /* fine */ } }
    S.expr = n; S.caret = c == null ? n.length : c;
    S.done = false; S.error = ''; S.value = null;
    render(true);
  }
  function onExprKey(e) {
    if (e.key === 'Enter') { e.preventDefault(); equals(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (S.done && e.key.length === 1) { e.preventDefault(); typeIn(normal(e.key), OPS.test(e.key)); return; }
    if (S.done && /^(Backspace|Delete|Arrow|Home|End)/.test(e.key)) { S.done = false; S.value = null; drawResult(); }
  }
  function onPanelKey(e) {
    // Keys pressed in the sheet belong to it (a page that turns on the arrow keys never sees them).
    e.stopPropagation();
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.target === el.expr || e.ctrlKey || e.metaKey || e.altKey) return;
    // Typing while a key or toggle has focus goes into the sum.
    if (e.key.length === 1 && e.key !== ' ') {
      e.preventDefault();
      focusSum();
      typeIn(normal(e.key), S.done && OPS.test(e.key));
    } else if (e.key === 'Backspace') { e.preventDefault(); focusSum(); backspace(); }
  }
  function focusSum() { try { el.expr.focus({ preventScroll: true }); } catch (e) { /* fine */ } }

  // ---------- toggles and history ----------
  function toggleAngle() { S.angle = S.angle === 'rad' ? 'deg' : 'rad'; save(); render(); say(S.angle === 'rad' ? 'Radians' : 'Degrees'); }
  function toggleEng() { S.eng = !S.eng; save(); render(); say(S.eng ? 'Engineering notation on' : 'Engineering notation off'); }
  function toggleHistory() { S.view = S.view === 'hist' ? 'keys' : 'hist'; render(); }
  function reuse(x) {
    S.expr = x.e; S.caret = x.e.length; S.done = false; S.value = null; S.error = '';
    S.view = 'keys';
    render();
    focusSum();
    render();
    say('Using ' + x.e);
  }
  function clearHistory() { S.hist = []; save(); render(); say('History cleared'); }

  // ---------- the answer box ----------
  function shown(node) { return !!node && node.isConnected && node.getClientRects().length > 0; }
  // -> Promise<{input} | {mount, field} | null>: a puzzle card's own box in the app, else a lesson
  // frame's typed answer (the focused one first).
  function findTarget() {
    var view = document.getElementById('view');
    if (!view) return Promise.resolve(null);
    var own = Array.prototype.filter.call(view.querySelectorAll('input.qc-typed-input'), function (i) { return !i.readOnly && !i.disabled && shown(i); })[0];
    if (own) return Promise.resolve({ input: own });
    var mounts = U.sandbox && typeof U.sandbox.mounted === 'function' ? U.sandbox.mounted().filter(function (m) { return view.contains(m.el) && shown(m.frame); }) : [];
    if (!mounts.length) return Promise.resolve(null);
    return Promise.all(mounts.map(function (m) {
      return m.field().then(function (f) { return f ? { mount: m, field: f } : null; }, function () { return null; });
    })).then(function (list) {
      list = list.filter(Boolean);
      return list.filter(function (x) { return x.field.focused; })[0] || list[0] || null;
    });
  }
  var seq = 0;
  function refreshTarget() {
    var mine = ++seq;
    return findTarget().then(function (t) {
      if (mine !== seq || !S.open || !el) return;
      S.target = t ? (t.input ? { kind: 'box' } : { kind: 'frame', id: t.field.id }) : null;
      el.insert.hidden = !t;
    });
  }
  // Scrolls so the field (top and height in the window) sits clear of the bars above and of the
  // sheet below, with room for the Check under it.
  function reveal(top, height) {
    var limit = el.panel.getBoundingClientRect().top;
    var bar = document.querySelector('#view .lsn-bar, #view .rv-top'), tb = document.getElementById('topbar');
    var under = bar ? bar.getBoundingClientRect().bottom : tb && tb.offsetParent !== null ? tb.getBoundingClientRect().bottom : 0;
    var below = top + height + 64 - limit, above = under + 12 - top, dy = 0;
    if (below > 0) dy = Math.min(below, top - under - 12);
    else if (above > 0) dy = -above;
    if (dy) window.scrollBy(0, dy);
  }
  function inserted(text) {
    var t = el.insert.querySelector('.calc-insert-t');
    if (t) { t.textContent = 'Inserted'; clearTimeout(insertedTimer); insertedTimer = setTimeout(function () { t.textContent = 'Insert'; }, 1600); }
    say(text + ' is in the answer box. Check it when you are ready.');
  }
  function insertResult() {
    if (!S.done && !equals()) return;
    if (S.value == null) return;
    var text = C.plain(S.value);
    findTarget().then(function (t) {
      if (!t) { el.insert.hidden = true; say('There is no answer box showing now.'); return; }
      if (t.input) {
        t.input.value = text;
        try { t.input.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) { /* fine */ }
        try { t.input.focus({ preventScroll: true }); } catch (e) { /* fine */ }
        var b = t.input.getBoundingClientRect();
        reveal(b.top, b.height);
        inserted(text);
        return;
      }
      return t.mount.insert(text).then(function (r) {
        if (typeof r.y === 'number' && t.mount.frame.isConnected) reveal(t.mount.frame.getBoundingClientRect().top + r.y, r.h || 44);
        inserted(text);
      }, function () { say('The answer box could not be reached.'); refreshTarget(); });
    });
  }

  // ---------- open and close ----------
  function sync() {
    document.querySelectorAll('.calc-btn').forEach(function (b) { b.setAttribute('aria-expanded', S.open ? 'true' : 'false'); });
  }
  function fit() {
    if (!el || !S.open) return;
    document.documentElement.style.setProperty('--calc-h', el.panel.offsetHeight + 'px');
  }
  function open(from) {
    build();
    opener = from || opener;
    if (S.open) { focusSum(); return; }
    S.open = true;
    el.panel.hidden = false;
    document.documentElement.classList.add('calc-open');
    if (!ro && typeof ResizeObserver === 'function') ro = new ResizeObserver(fit);
    if (ro) ro.observe(el.panel);
    fit();
    render();
    focusSum();
    render();
    sync();
    el.insert.hidden = true;
    refreshTarget();
    clearInterval(poll);
    poll = setInterval(refreshTarget, POLL_MS);
  }
  function close() {
    if (!S.open) return;
    var inside = el.panel.contains(document.activeElement);
    S.open = false;
    S.shift = false;
    el.panel.hidden = true;
    clearInterval(poll); poll = 0;
    if (ro) ro.disconnect();
    document.documentElement.classList.remove('calc-open');
    document.documentElement.style.removeProperty('--calc-h');
    sync();
    if (inside || !document.activeElement || document.activeElement === document.body) {
      var to = opener && opener.isConnected && opener.offsetParent !== null ? opener
        : Array.prototype.filter.call(document.querySelectorAll('.calc-btn'), function (b) { return b.offsetParent !== null; })[0];
      if (to) try { to.focus({ preventScroll: true }); } catch (e) { /* fine */ }
    }
  }
  function toggle(from) { if (S.open) close(); else open(from); }
  // Escape with nothing else focused (a tap on the page) closes it too; not while a sheet is open.
  document.addEventListener('keydown', function (e) {
    if (!S.open || e.key !== 'Escape' || (U._sheets && U._sheets.length)) return;
    var a = document.activeElement;
    if (!a || a === document.body || a === document.documentElement) { e.preventDefault(); close(); }
  });

  function button(cls) {
    return h('button', { class: 'icon-btn calc-btn' + (cls ? ' ' + cls : ''), type: 'button', 'aria-label': 'Calculator',
      'aria-expanded': S.open ? 'true' : 'false', 'aria-controls': 'calc', on: { click: function (e) { toggle(e.currentTarget); } } }, U.icon('calc'));
  }

  U.calcSheet = { open: open, close: close, toggle: toggle, isOpen: function () { return S.open; }, button: button, state: S, refresh: refreshTarget };

  // The shell's top bar: the icon beside Aa.
  build();
  var aa = document.getElementById('settings-btn');
  if (aa && aa.parentNode && !document.getElementById('calc-btn')) {
    var top = button('top-calc');
    top.id = 'calc-btn';
    aa.parentNode.insertBefore(top, aa);
  }
})();
