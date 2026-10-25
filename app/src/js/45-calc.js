// The calculator's engine (U.calc): works out the sums Dan types into the calculator sheet
// (46-calc-sheet.js) with its own tokenizer and recursive-descent parser. Nothing he types is ever
// run as code: no eval, no Function, no lookups on objects by his words. Pure (no DOM at load), so
// Node tests run it. Contract: docs/ARCHITECTURE.md section 9 (Calculator).
//
//   U.calc.evaluate(text, {angle: 'deg'|'rad', ans, close}) -> {ok: true, value} | {ok: false, error}
//       angle: how sin, cos and tan read an angle and how their inverses give one (default 'deg').
//       ans: the value of Ans (default 0). close: brackets still open at the end are closed, as a
//       school calculator does; without it they are "Missing a closing bracket".
//   U.calc.format(value, {eng}) -> '0.3', '1.5×10⁻⁷', '−4'; eng: '4.7k', '220µ', '1.5'
//   U.calc.plain(value) -> '0.00000015'   digits, one point and a minus: what an answer box reads
//   U.calc.closeBrackets(text) -> text with its open brackets closed at the end
//   U.calc.ERR   the messages, in plain words
//
// What it reads: numbers with a point (4.7, .5), a power of ten written with E (2E3, 1.5E-7; the
// EXP key types E; a lowercase e is always the constant, so 2e−3 is 2e − 3) and an SI prefix
// straight after a number (p n u µ m k M G T: 4.7k, 220u, 10m,
// 2M; m is milli and M mega); π or pi, e, Ans; + − × ÷ (also * /), ^ (2^3^2 is 2^9), ² ³ ⁻¹ and
// other superscript powers, % (divides by 100), brackets; sin cos tan, their inverses (sin⁻¹,
// asin, arcsin), √ or sqrt, ∛ or cbrt, ln, log (base 10), exp, abs, and 10^( and e^( for 10ˣ, eˣ.
// Precedence, tightest first: brackets and functions; % and superscript powers; ^ (right to left, a
// minus after it belongs to the power: 2^-1); multiplication without a sign (2π, 3(4+1), 2sin(30)),
// which binds before × and ÷ as on a school calculator, so 1÷2π is 1÷(2π); a minus in front (−2² is
// −4); × ÷; + −.
// Float noise never shows: a sum or difference is kept to 15 significant figures of its larger
// part (so 0.1 + 0.2 is 0.3 and asin(0.5) − 30 is 0), the angles whose answers are exact give them
// (sin 180° is 0), and the answer is kept to 15 significant figures (Ans too); results show to 10.
(function () {
  'use strict';
  var MAX_LEN = 300, MAX_DEPTH = 40;
  var ERR = {
    EMPTY: 'Type a sum first',
    CLOSE: 'Missing a closing bracket',
    OPEN: 'A closing bracket has no opening one',
    NUMBER: 'Missing a number',
    OPERATOR: 'Missing a + − × or ÷ between two numbers',
    ZERO: 'Can\'t divide by zero',
    REAL: 'Not a real number',
    TAN: 'tan has no value at this angle',
    BIG: 'Too big to work out',
    POWER: 'Missing the power of ten after E',
    POINTS: 'A number can only have one point',
    COMMA: 'Use a point for decimals, not a comma',
    PREFIX: 'Put a prefix straight after a number, like 4.7k',
    DEEP: 'Too many brackets inside each other',
    LONG: 'This sum is too long',
    CANT: 'Can\'t work that out',
    word: function (w) { return 'Can\'t read "' + w + '"'; },
    sign: function (c) { return 'Can\'t use "' + c + '" in a sum'; },
  };
  function fail(message) { return { calc: true, message: message }; }

  // ---------- tokens ----------
  // {t:'num', v} {t:'op', v:'+'|'-'|'*'|'/'|'^'} {t:'lp'} {t:'rp'} {t:'fn', v} {t:'const', v}
  // {t:'ans'} {t:'pct'} {t:'sup', v: integer power}
  var PREFIX = { p: -12, n: -9, u: -6, 'µ': -6, 'μ': -6, m: -3, k: 3, M: 6, G: 9, T: 12 };
  var SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };
  // Names, longest first, so a run of letters splits greedily ("2sinpi" is 2·sin(π)).
  var NAMES = [
    ['arcsin', 'fn', 'asin'], ['arccos', 'fn', 'acos'], ['arctan', 'fn', 'atan'],
    ['asin', 'fn', 'asin'], ['acos', 'fn', 'acos'], ['atan', 'fn', 'atan'], ['sqrt', 'fn', 'sqrt'], ['cbrt', 'fn', 'cbrt'],
    ['sin', 'fn', 'sin'], ['cos', 'fn', 'cos'], ['tan', 'fn', 'tan'], ['exp', 'fn', 'exp'], ['abs', 'fn', 'abs'],
    ['ans', 'ans', null], ['log', 'fn', 'log'], ['ln', 'fn', 'ln'], ['pi', 'const', 'pi'], ['π', 'const', 'pi'], ['e', 'const', 'e'],
  ];
  var INVERSE = { sin: 'asin', cos: 'acos', tan: 'atan' };
  function isDigit(c) { return c >= '0' && c <= '9'; }
  // A letter of any script (× and ÷ are not), so 4.7kΩ is not read as 4.7k then Ω.
  function isLetter(c) { return !!c && /\p{L}/u.test(c); }

  function tokenize(s) {
    var out = [], i = 0, n = s.length;
    while (i < n) {
      var c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      // A number: digits with one point, then a power of ten (E and a whole number), then a prefix.
      // Only E (or ᴇ) is the power of ten. A lowercase e is always the constant, so the sheet's e key
      // means e wherever it goes: 2e−3 is 2e − 3, never 0.002 (a laptop's 1.5e3 is typed 1.5E3).
      if (isDigit(c) || c === '.') {
        var m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
        if (!m) throw fail(ERR.NUMBER);
        var mant = m[1], exp = 0;
        i += mant.length;
        if (s[i] === '.') throw fail(ERR.POINTS);
        if (s[i] === 'E' || s[i] === 'ᴇ') {
          var x = /^[Eᴇ]([+\-−]?)(\d+)/.exec(s.slice(i));
          if (x) { exp = Number(x[2]) * (x[1] && x[1] !== '+' ? -1 : 1); i += x[0].length; }
          else if (!isLetter(s[i + 1]) || s[i] === 'ᴇ') throw fail(ERR.POWER);
        }
        var p = s[i];
        if (Object.prototype.hasOwnProperty.call(PREFIX, p) && !isLetter(s[i + 1])) { exp += PREFIX[p]; i++; }
        // Far past a double's range: too big, or as good as nothing.
        if (exp > 400) throw fail(ERR.BIG);
        out.push({ t: 'num', v: exp < -400 ? 0 : Number(mant + 'e' + exp) });
        continue;
      }
      // The power of ten on its own (EXP pressed first): 1E3.
      if ((c === 'E' || c === 'ᴇ') && !isLetter(s[i + 1])) {
        var y = /^[Eᴇ]([+\-−]?)(\d+)/.exec(s.slice(i));
        if (!y) throw fail(ERR.POWER);
        var e1 = Number(y[2]) * (y[1] && y[1] !== '+' ? -1 : 1);
        if (e1 > 400) throw fail(ERR.BIG);
        out.push({ t: 'num', v: e1 < -400 ? 0 : Number('1e' + e1) });
        i += y[0].length;
        continue;
      }
      // A run of letters: names (sin, pi, Ans…), split greedily; a prefix on its own is not a number.
      if (isLetter(c)) {
        var run = /^\p{L}+/u.exec(s.slice(i))[0];
        i += run.length;
        if (run === 'x' || run === 'X') { out.push({ t: 'op', v: '*' }); continue; }
        var low = run.toLowerCase(), at = 0;
        while (at < low.length) {
          var hit = null;
          for (var k = 0; k < NAMES.length && !hit; k++) if (low.substr(at, NAMES[k][0].length) === NAMES[k][0]) hit = NAMES[k];
          if (!hit) {
            if (run.length === 1 && Object.prototype.hasOwnProperty.call(PREFIX, run)) throw fail(ERR.PREFIX);
            throw fail(ERR.word(run));
          }
          at += hit[0].length;
          var f = hit[2];
          // sin⁻¹ and sin^-1 straight after a trig name (only at the end of the run of letters)
          if (hit[1] === 'fn' && INVERSE[f] && at === low.length) {
            var inv = /^(⁻¹|\^\s*[-−]\s*1(?![\d.]))/.exec(s.slice(i));
            if (inv) { f = INVERSE[f]; i += inv[0].length; }
          }
          out.push(hit[1] === 'fn' ? { t: 'fn', v: f } : hit[1] === 'const' ? { t: 'const', v: f } : { t: 'ans' });
        }
        continue;
      }
      if (SUP[c]) {
        var j = i, txt = '';
        while (j < n && SUP[s[j]]) { txt += SUP[s[j]]; j++; }
        if (!/^-?\d+$/.test(txt)) throw fail(ERR.NUMBER);
        out.push({ t: 'sup', v: Number(txt) });
        i = j;
        continue;
      }
      i++;
      if (c === '+') out.push({ t: 'op', v: '+' });
      else if (c === '-' || c === '−' || c === '–') out.push({ t: 'op', v: '-' });
      else if (c === '*' || c === '×' || c === '·' || c === '⋅') out.push({ t: 'op', v: '*' });
      else if (c === '/' || c === '÷' || c === '∕') out.push({ t: 'op', v: '/' });
      else if (c === '^') out.push({ t: 'op', v: '^' });
      else if (c === '(') out.push({ t: 'lp' });
      else if (c === ')') out.push({ t: 'rp' });
      else if (c === '%') out.push({ t: 'pct' });
      else if (c === '√') out.push({ t: 'fn', v: 'sqrt' });
      else if (c === '∛') out.push({ t: 'fn', v: 'cbrt' });
      else if (c === ',') throw fail(ERR.COMMA);
      else throw fail(ERR.sign(c));
    }
    return out;
  }

  // ---------- parser ----------
  //   sum      := product (('+' | '-') product)*
  //   product  := signed (('×' | '÷') signed)*
  //   signed   := ('-' | '+') signed | implicit
  //   implicit := power (power)*           only before a name, a constant, Ans or a bracket
  //   power    := postfix ('^' expo)?
  //   expo     := ('-' | '+') expo | power  (so 2^3^2 is 2^(3^2) and 2^-1 is a half)
  //   postfix  := primary ('%' | superscript power)*
  //   primary  := number | constant | Ans | '(' sum ')' | function (bracket or expo)
  function parse(tokens, close) {
    var i = 0, depth = 0;
    function peek() { return tokens[i]; }
    function isOp(t, ops) { return !!t && t.t === 'op' && ops.indexOf(t.v) >= 0; }
    function sum() {
      var node = product();
      while (isOp(peek(), '+-')) { var op = tokens[i++].v; node = { k: 'bin', op: op, a: node, b: product() }; }
      return node;
    }
    function product() {
      var node = signed();
      while (isOp(peek(), '*/')) { var op = tokens[i++].v; node = { k: 'bin', op: op, a: node, b: signed() }; }
      return node;
    }
    function signed() {
      if (isOp(peek(), '+-')) { var op = tokens[i++].v, a = signed(); return op === '-' ? { k: 'neg', a: a } : a; }
      return implicit();
    }
    function startsImplicit(t) { return !!t && (t.t === 'fn' || t.t === 'const' || t.t === 'ans' || t.t === 'lp'); }
    function implicit() {
      var node = power();
      while (startsImplicit(peek())) node = { k: 'bin', op: '*', a: node, b: power() };
      return node;
    }
    function power() {
      var base = postfix();
      if (isOp(peek(), '^')) { i++; return { k: 'bin', op: '^', a: base, b: expo() }; }
      return base;
    }
    function expo() {
      if (isOp(peek(), '+-')) { var op = tokens[i++].v, a = expo(); return op === '-' ? { k: 'neg', a: a } : a; }
      return power();
    }
    function postfix() {
      var node = primary();
      for (;;) {
        var t = peek();
        if (t && t.t === 'pct') { i++; node = { k: 'pct', a: node }; }
        else if (t && t.t === 'sup') { i++; node = { k: 'bin', op: '^', a: node, b: { k: 'num', v: t.v } }; }
        else return node;
      }
    }
    function bracket() {
      i++;
      if (++depth > MAX_DEPTH) throw fail(ERR.DEEP);
      if (peek() && peek().t === 'rp') throw fail(ERR.NUMBER);
      var inner = sum();
      var t = peek();
      if (t && t.t === 'rp') i++;
      else if (!t) { if (!close) throw fail(ERR.CLOSE); }
      else throw fail(ERR.OPERATOR);
      depth--;
      return inner;
    }
    function primary() {
      var t = peek();
      if (!t) throw fail(ERR.NUMBER);
      if (t.t === 'num') { i++; return { k: 'num', v: t.v }; }
      if (t.t === 'const') { i++; return { k: 'num', v: t.v === 'pi' ? Math.PI : Math.E }; }
      if (t.t === 'ans') { i++; return { k: 'ans' }; }
      if (t.t === 'lp') return bracket();
      if (t.t === 'fn') {
        i++;
        if (++depth > MAX_DEPTH) throw fail(ERR.DEEP);
        var arg = peek() && peek().t === 'lp' ? bracket() : expo();
        depth--;
        return { k: 'fn', f: t.v, a: arg };
      }
      // A ')' with no bracket open, else an operator, ')' or '%' where a number should be.
      throw fail(t.t === 'rp' && depth === 0 ? ERR.OPEN : ERR.NUMBER);
    }
    var tree = sum();
    if (i < tokens.length) throw fail(tokens[i].t === 'rp' ? ERR.OPEN : ERR.OPERATOR);
    return tree;
  }

  // ---------- working it out ----------
  // Each step in full double precision, checked: NaN is not a real number, an infinity too big.
  function chk(v) {
    if (v !== v) throw fail(ERR.REAL);
    if (v === Infinity || v === -Infinity) throw fail(ERR.BIG);
    return v === 0 ? 0 : v;
  }
  // A sum or difference kept to 15 significant figures of its larger part, as a school calculator's
  // 15 digits would: binary float noise (0.1 + 0.2, or 30.000000000000004 − 30) goes, and a real
  // small difference (1.000000000001 − 1) stays.
  function addq(r, a, b) {
    r = chk(r);
    var m = Math.max(Math.abs(a), Math.abs(b));
    if (!r || !m) return r;
    var k = 14 - Math.floor(Math.log10(m));
    if (k > 100) return r;
    if (k >= 0) return Number(r.toFixed(k)) || 0;
    var p = Math.pow(10, -k);
    return Math.round(r / p) * p || 0;
  }
  // The answer, kept to 15 significant figures (what Ans holds).
  function fix(v) {
    v = chk(v);
    if (v === 0) return 0;
    return chk(Number(v.toPrecision(15)));
  }
  function pow(a, b) {
    if (a === 0 && b < 0) throw fail(ERR.ZERO);
    if (a < 0 && Math.floor(b) !== b) {
      // A negative number to a fractional power is real only for an odd root: (−8)^(1/3) is −2.
      var r = 1 / b, k = Math.round(r);
      if (Math.abs(r - k) < 1e-9 && Math.abs(k % 2) === 1) return chk(-Math.pow(-a, 1 / k));
      throw fail(ERR.REAL);
    }
    return chk(Math.pow(a, b));
  }
  // Sine and cosine at the angles where the exact answer is known (whole quarter turns, and 30°
  // multiples for sine), so sin 180° is 0 and cos 60° is 0.5, not 6.1×10⁻¹⁷.
  var QUARTER_SIN = [0, 1, 0, -1], QUARTER_COS = [1, 0, -1, 0];
  function trig(f, x, rad) {
    if (!rad) {
      var turn = f === 'tan' ? 180 : 360, d = ((x % turn) + turn) % turn;
      if (f === 'tan') {
        if (d === 90) throw fail(ERR.TAN);
        if (d === 0) return 0;
        if (d === 45) return 1;
        if (d === 135) return -1;
        return chk(Math.tan(d * Math.PI / 180));
      }
      if (f === 'cos') d = (d + 90) % 360;
      if (d % 90 === 0) return QUARTER_SIN[d / 90];
      if (d === 30 || d === 150) return 0.5;
      if (d === 210 || d === 330) return -0.5;
      return chk(Math.sin(d * Math.PI / 180));
    }
    // Radians: a whole number of quarter turns (π, 2π, π/2 as typed) gives the exact answer.
    var q = x / (Math.PI / 2), k = Math.round(q);
    if (k !== 0 && Math.abs(q - k) < 1e-12 * Math.max(1, Math.abs(k))) {
      var at = ((k % 4) + 4) % 4;
      if (f === 'sin') return QUARTER_SIN[at];
      if (f === 'cos') return QUARTER_COS[at];
      if (at % 2) throw fail(ERR.TAN);
      return 0;
    }
    return chk(f === 'sin' ? Math.sin(x) : f === 'cos' ? Math.cos(x) : Math.tan(x));
  }
  function fn(f, x, o) {
    var rad = o.angle === 'rad';
    switch (f) {
      case 'sin': case 'cos': case 'tan': return trig(f, x, rad);
      case 'asin': case 'acos':
        if (x > 1 || x < -1) throw fail(ERR.REAL);
        var r = f === 'asin' ? Math.asin(x) : Math.acos(x);
        return chk(rad ? r : r * 180 / Math.PI);
      case 'atan': var t = Math.atan(x); return chk(rad ? t : t * 180 / Math.PI);
      case 'sqrt': if (x < 0) throw fail(ERR.REAL); return chk(Math.sqrt(x));
      case 'cbrt': return chk(Math.cbrt(x));
      case 'ln': if (x <= 0) throw fail(ERR.REAL); return chk(Math.log(x));
      case 'log': if (x <= 0) throw fail(ERR.REAL); return chk(Math.log10(x));
      case 'exp': return chk(Math.exp(x));
      case 'abs': return Math.abs(x);
    }
    throw fail(ERR.CANT);
  }
  function run(node, o) {
    switch (node.k) {
      case 'num': return chk(node.v);
      case 'ans': return o.ans;
      case 'neg': return -run(node.a, o) || 0;
      case 'pct': return chk(run(node.a, o) / 100);
      case 'fn': return fn(node.f, run(node.a, o), o);
      case 'bin':
        var a = run(node.a, o), b = run(node.b, o);
        if (node.op === '+') return addq(a + b, a, b);
        if (node.op === '-') return addq(a - b, a, b);
        if (node.op === '*') return chk(a * b);
        if (node.op === '/') { if (b === 0) throw fail(ERR.ZERO); return chk(a / b); }
        return pow(a, b);
    }
    throw fail(ERR.CANT);
  }

  // The brackets still open at the end, closed (a stray closing bracket is left for the parser).
  function closeBrackets(text) {
    var s = String(text == null ? '' : text), open = 0;
    for (var i = 0; i < s.length; i++) {
      if (s[i] === '(') open++;
      else if (s[i] === ')' && open > 0) open--;
    }
    return open > 0 ? s + new Array(open + 1).join(')') : s;
  }

  function evaluate(text, opts) {
    var o = opts || {}, s = String(text == null ? '' : text);
    var ans = typeof o.ans === 'number' && isFinite(o.ans) ? o.ans : 0;
    try {
      if (s.length > MAX_LEN) throw fail(ERR.LONG);
      var tokens = tokenize(s);
      if (!tokens.length) throw fail(ERR.EMPTY);
      var v = fix(run(parse(tokens, !!o.close), { angle: o.angle === 'rad' ? 'rad' : 'deg', ans: ans }));
      return { ok: true, value: v === 0 ? 0 : v };
    } catch (e) {
      if (e && e.calc) return { ok: false, error: e.message };
      // A fault in the engine, never shown as his mistake's words; said plainly instead.
      return { ok: false, error: ERR.CANT, bug: String(e && e.message || e) };
    }
  }

  // ---------- showing a number ----------
  var SUPS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  function sup(n) { return String(n).replace(/-/g, '⁻').replace(/\d/g, function (d) { return SUPS[+d]; }); }
  function sig(v, n) { return Number(v.toPrecision(n || 10)); }
  // a × 10^e as a mantissa of 1 to `top` (10, or 1000 for engineering) at 10 significant figures.
  function scaled(a, e, step, top) {
    var m = 0;
    for (var guard = 0; guard < 6; guard++) {
      m = sig(e < 0 ? a * Math.pow(10, -e) : a / Math.pow(10, e));
      if (m >= top) e += step;
      else if (m < 1) e -= step;
      else break;
    }
    return { m: m, e: e };
  }
  var ENG = { '-12': 'p', '-9': 'n', '-6': 'µ', '-3': 'm', '0': '', '3': 'k', '6': 'M', '9': 'G', '12': 'T' };
  // format(value, {eng}) -> how the calculator shows it: 10 significant figures, a true minus, and
  // ×10ⁿ for numbers under 0.0001 or from 10¹⁰; eng: a power of ten that is a multiple of 3, as
  // its prefix where there is one (4.7k, 220µ).
  function format(value, opts) {
    if (typeof value !== 'number' || !isFinite(value)) return '';
    if (value === 0) return '0';
    var neg = value < 0, a = Math.abs(value), out;
    if (opts && opts.eng) {
      var g = scaled(a, Math.floor(Math.log10(a) / 3) * 3, 3, 1000);
      out = String(g.m) + (Object.prototype.hasOwnProperty.call(ENG, String(g.e)) ? ENG[String(g.e)] : '×10' + sup(g.e));
    } else {
      var r = sig(a);
      if (r >= 1e-4 && r < 1e10) out = String(r);
      else { var s = scaled(r, Math.floor(Math.log10(r)), 1, 10); out = String(s.m) + '×10' + sup(s.e); }
    }
    return (neg ? '−' : '') + out;
  }
  // plain(value) -> the value at 10 significant figures as plain digits ('0.00000015', '-13.33'),
  // for an answer box (the kit reads digits, a point and a minus, not ×10ⁿ or prefixes).
  function plain(value) {
    if (typeof value !== 'number' || !isFinite(value) || value === 0) return '0';
    var r = sig(Math.abs(value)), s = String(r);
    var m = /^(\d+)(?:\.(\d+))?e([+-]\d+)$/.exec(s);
    if (m) {
      var digits = m[1] + (m[2] || ''), point = m[1].length + Number(m[3]);
      if (point <= 0) s = '0.' + new Array(1 - point).join('0') + digits;
      else if (point >= digits.length) s = digits + new Array(point - digits.length + 1).join('0');
      else s = digits.slice(0, point) + '.' + digits.slice(point);
    }
    return (value < 0 ? '-' : '') + s;
  }

  U.calc = { evaluate: evaluate, format: format, plain: plain, closeBrackets: closeBrackets, tokenize: tokenize, ERR: ERR, MAX_LEN: MAX_LEN };
})();
