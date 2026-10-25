// Unit tests for the calculator's engine, U.calc (app/src/js/45-calc.js): precedence, powers that
// group right to left, a minus in front, multiplication without a sign, degrees and radians (and the
// inverses in both), SI prefixes, ×10ⁿ, Ans, how results are shown (10 significant figures with no
// float noise, ×10ⁿ, ENG with prefixes, plain digits for an answer box), every error in plain words,
// and that nothing typed ever reaches eval or Function. The engine runs in a VM context that cannot
// make code from strings at all (codeGeneration.strings: false): eval and new Function throw there.
// Run: node --test tests/calc.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => readFileSync(join(root, 'app', 'src', 'js', f), 'utf8');
const ENGINE = src('45-calc.js');

function load() {
  const ctx = vm.createContext({ console }, { codeGeneration: { strings: false, wasm: false } });
  vm.runInContext('var window = globalThis;', ctx);
  vm.runInContext('"use strict";\n' + src('00-core.js') + '\n' + ENGINE, ctx, { filename: '00-core.js+45-calc.js' });
  return ctx;
}
const ctx = load();
const C = ctx.U.calc;
const E = C.ERR;
// The value of a sum (degrees unless said), failing the test on an error.
function v(text, o = {}) {
  const r = C.evaluate(text, { angle: 'deg', ...o });
  assert.equal(r.ok, true, `${text} should work out, got ${JSON.stringify(r)}`);
  return r.value;
}
function err(text, o = {}) {
  const r = C.evaluate(text, { angle: 'deg', ...o });
  assert.equal(r.ok, false, `${text} should be an error, got ${JSON.stringify(r)}`);
  assert.equal(r.bug, undefined, `${text}: an engine fault, not his sum: ${r.bug}`);
  return r.error;
}
const near = (a, b, tol = 1e-12) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} is not ${b}`);

test('precedence: brackets, then powers, then × ÷, then + −, left to right', () => {
  assert.equal(v('2+3×4'), 14);
  assert.equal(v('(2+3)×4'), 20);
  assert.equal(v('10−4−3'), 3);
  assert.equal(v('8÷4÷2'), 1);
  assert.equal(v('2×3^2'), 18);
  assert.equal(v('2*3+4/2'), 8, '* and / work as × and ÷');
  assert.equal(v('12-2-3'), 7, 'a hyphen is a minus');
  assert.equal(v('2 x 3'), 6, 'an x between numbers is times');
});

test('powers group right to left; superscripts are powers too', () => {
  assert.equal(v('2^3^2'), 512);
  assert.equal(v('(2^3)^2'), 64);
  assert.equal(v('2^-1'), 0.5, 'a minus after ^ belongs to the power');
  assert.equal(v('2^-3^2'), Math.pow(2, -9));
  assert.equal(v('3²'), 9);
  assert.equal(v('2³'), 8);
  assert.equal(v('4⁻¹'), 0.25);
  assert.equal(v('1.5×10⁻⁷'), 1.5e-7, 'what the display shows reads back');
  near(v('2^3π'), 8 * Math.PI, 1e-14);   // a power binds before a following π: (2^3)π, not 2^(3π)
});

test('a minus in front: −2² is −4, (−2)² is 4, and minus minus is plus', () => {
  assert.equal(v('-2^2'), -4);
  assert.equal(v('−2²'), -4);
  assert.equal(v('(-2)^2'), 4);
  assert.equal(v('3−−2'), 5);
  assert.equal(v('-(-3)'), 3);
  assert.equal(v('2×-3'), -6);
  assert.equal(v('+5'), 5);
  assert.ok(Object.is(v('-0'), 0), 'no negative zero');
});

test('multiplication without a sign: 2π, 3(4+1), 2sin(30), and it binds before ÷', () => {
  near(v('2pi'), 2 * Math.PI);
  near(v('2π'), 2 * Math.PI);
  assert.equal(v('3(4+1)'), 15);
  assert.equal(v('2sin(30)'), 1);
  assert.equal(v('(1+2)(3+4)'), 21);
  near(v('1÷2π'), 1 / (2 * Math.PI), 1e-14);
  assert.equal(v('6÷2(1+2)'), 1, 'as a school calculator reads it');
  assert.equal(v('2Ans', { ans: 4 }), 8);
  assert.equal(v('2√9'), 6);
  assert.equal(err('2 3'), E.OPERATOR, 'two numbers side by side are not multiplied');
  assert.equal(err('(1+2)3'), E.OPERATOR);
});

test('degrees and radians: exact at the angles that are exact', () => {
  assert.equal(v('sin(30)'), 0.5);
  assert.equal(v('cos(60)'), 0.5);
  assert.equal(v('tan(45)'), 1);
  assert.equal(v('sin(180)'), 0);
  assert.equal(v('cos(90)'), 0);
  assert.equal(v('sin(-90)'), -1);
  assert.equal(v('cos(120)'), -0.5);
  assert.equal(v('tan(-45)'), -1);
  assert.equal(v('sin(390)'), 0.5, 'a turn and a bit');
  near(v('sin(45)'), Math.SQRT1_2, 1e-14);
  assert.equal(v('sin30'), 0.5, 'a function takes the number after it without brackets');
  assert.equal(v('sin(pi/6)', { angle: 'rad' }), 0.5);
  assert.equal(v('sin(π)', { angle: 'rad' }), 0);
  assert.equal(v('cos(π)', { angle: 'rad' }), -1);
  assert.equal(v('cos(π÷2)', { angle: 'rad' }), 0);
  assert.equal(v('sin(2π)', { angle: 'rad' }), 0);
  near(v('sin(1)', { angle: 'rad' }), Math.sin(1), 1e-14);
  near(v('sin(1)'), Math.sin(Math.PI / 180), 1e-14);
  assert.equal(err('tan(90)'), E.TAN);
  assert.equal(err('tan(270)'), E.TAN);
  assert.equal(err('tan(π÷2)', { angle: 'rad' }), E.TAN);
  assert.equal(v('sin(30)', {}), 0.5, 'degrees by default');
});

test('inverse trig in degrees and in radians', () => {
  assert.equal(v('sin⁻¹(0.5)'), 30);
  assert.equal(v('asin(1)'), 90);
  assert.equal(v('arcsin(1)'), 90);
  assert.equal(v('cos⁻¹(0)'), 90);
  assert.equal(v('acos(-1)'), 180);
  assert.equal(v('tan⁻¹(1)'), 45);
  assert.equal(v('sin^-1(0.5)'), 30, 'sin^-1 reads as the inverse too');
  near(v('sin⁻¹(0.5)', { angle: 'rad' }), Math.PI / 6, 1e-14);
  near(v('cos⁻¹(0)', { angle: 'rad' }), Math.PI / 2, 1e-14);
  near(v('atan(1)', { angle: 'rad' }), Math.PI / 4, 1e-14);
  assert.equal(v('sin⁻¹(1)−90'), 0, 'no float noise left over');
  assert.equal(err('asin(2)'), E.REAL);
  assert.equal(err('cos⁻¹(-1.5)', { angle: 'rad' }), E.REAL);
});

test('roots, logs and the rest', () => {
  assert.equal(v('√(16)'), 4);
  assert.equal(v('sqrt(2)^2'), 2);
  assert.equal(v('∛(27)'), 3);
  assert.equal(v('cbrt(-8)'), -2);
  assert.equal(v('log(1000)'), 3);
  assert.equal(v('ln(e)'), 1);
  near(v('e^(2)'), Math.exp(2), 1e-13);
  assert.equal(v('10^(3)'), 1000);
  near(v('exp(1)'), Math.E, 1e-14);
  assert.equal(v('abs(-3)'), 3);
  assert.equal(v('50%'), 0.5);
  assert.equal(v('200×5%'), 10);
  assert.equal(v('(-8)^(1/3)'), -2, 'an odd root of a negative number is real');
  near(v('PI'), Math.PI, 1e-14);   // names in any case
});

test('SI prefixes straight after a number: 4.7k 220u 10m 2M, and M is not m', () => {
  assert.equal(v('4.7k'), 4700);
  assert.equal(v('220u'), 0.00022);
  assert.equal(v('220µ'), 0.00022, 'the micro sign');
  assert.equal(v('220μ'), 0.00022, 'the Greek mu');
  assert.equal(v('10m'), 0.01);
  assert.equal(v('2M'), 2e6);
  assert.notEqual(v('1m'), v('1M'));
  assert.equal(v('3n'), 3e-9);
  assert.equal(v('5p'), 5e-12);
  assert.equal(v('1G'), 1e9);
  assert.equal(v('2T'), 2e12);
  assert.equal(v('4.7k÷2'), 2350);
  assert.equal(v('230÷4.7k'), Number((230 / 4700).toPrecision(15)));
  near(v('1÷(2π×50×100µ)'), 1 / (2 * Math.PI * 50 * 1e-4), 1e-14);   // a capacitor's reactance at 50 Hz
  near(v('2pi'), 2 * Math.PI, 1e-14);
  assert.equal(err('k'), E.PREFIX, 'a prefix on its own');
  assert.equal(err('2+M'), E.PREFIX);
  assert.equal(err('2 k'), E.PREFIX, 'with a space it is not straight after');
  assert.equal(err('µ'), E.PREFIX);
  assert.equal(err('2mA'), E.word('mA'), 'units are not read');
  assert.equal(err('4.7kΩ'), E.word('kΩ'));
});

test('a lowercase e is always the constant e, never a power of ten (the e key after a number)', () => {
  // The sheet's e key (2nd + π) types e and ×10ⁿ types E. Pressing 2, e, −, 3 must be 2e − 3,
  // whether or not a number comes first; it was read as 2×10⁻³ = 0.002.
  near(v('2e−3'), 2 * Math.E - 3, 1e-14);
  near(v('2e-3'), 2 * Math.E - 3, 1e-14);
  near(v('2e+1'), 2 * Math.E + 1, 1e-14);
  near(v('e−3'), Math.E - 3, 1e-14);
  near(v('1.5e−7'), 1.5 * Math.E - 7, 1e-14);
  near(v('2e×3'), 6 * Math.E, 1e-14);
  near(v('2e(3)'), 6 * Math.E, 1e-14);
  // 2, e, 3 is e then a bare number, which needs a sign, as 2π3 does (never 2000).
  assert.equal(err('2e3'), E.OPERATOR);
  assert.equal(err('2π3'), E.OPERATOR);
  // The power of ten stays with E.
  assert.equal(v('2E−3'), 0.002);
  assert.equal(v('2E3'), 2000);
});

test('×10ⁿ: E (the EXP key) binds to its number', () => {
  assert.equal(v('2E3'), 2000);
  assert.equal(v('1.5E-7'), 1.5e-7);
  assert.equal(v('1.5E−7'), 1.5e-7, 'with a true minus');
  assert.equal(v('E3'), 1000, 'EXP first means 1×10ⁿ');
  assert.equal(v('1÷2E3'), 0.0005, '1 ÷ (2×10³), not (1÷2)×10³');
  assert.equal(v('2E3k'), 2e6, 'and a prefix after it');
  assert.equal(v('2ᴇ3'), 2000, 'a small-capital ᴇ too');
  near(v('2e'), 2 * Math.E, 1e-14);
  assert.equal(v('1E-500'), 0);
  assert.equal(err('2E'), E.POWER);
  assert.equal(err('2E+'), E.POWER);
  assert.equal(err('E'), E.POWER);
  assert.equal(err('1E500'), E.BIG);
});

test('Ans is the last answer (0 when there is none)', () => {
  assert.equal(v('Ans×2', { ans: 21 }), 42);
  assert.equal(v('ans+1', { ans: 21 }), 22);
  assert.equal(v('Ans', { ans: -3.5 }), -3.5);
  assert.equal(v('Ans+1'), 1);
  assert.equal(v('Ans+1', { ans: NaN }), 1);
});

test('results: 10 significant figures, no float noise, ×10ⁿ for the very big and small', () => {
  assert.equal(v('0.1+0.2'), 0.3);
  assert.equal(v('0.1+0.2−0.3'), 0, 'no 5.55×10⁻¹⁷ left over');
  assert.equal(v('√(2)^2'), 2);
  assert.equal(v('√(2)×√(2)−2'), 0);
  assert.equal(v('sin(30)×2−1'), 0);
  assert.equal(v('1/3×3−1'), 0);
  assert.equal(v('sin(pi/6)×2−1', { angle: 'rad' }), 0);
  assert.equal(v('1.000000000001−1'), 1e-12, 'a real small difference stays');
  assert.equal(v('1E20+1'), 1e20, '15 significant figures, as a school calculator keeps');
  assert.equal(C.format(v('0.1+0.2')), '0.3');
  assert.equal(C.format(0.1 + 0.2), '0.3', 'even given the raw float');
  assert.equal(C.format(1 / 3), '0.3333333333');
  assert.equal(C.format(2 / 3), '0.6666666667');
  assert.equal(C.format(13.325244207), '13.32524421');
  assert.equal(C.format(0), '0');
  assert.equal(C.format(-0), '0');
  assert.equal(C.format(-3), '−3', 'a true minus');
  assert.equal(C.format(1e10), '1×10¹⁰');
  assert.equal(C.format(9999999999), '9999999999');
  assert.equal(C.format(12345678901), '1.23456789×10¹⁰');
  assert.equal(C.format(0.0001234), '0.0001234');
  assert.equal(C.format(0.00001234), '1.234×10⁻⁵');
  assert.equal(C.format(1.5e-7), '1.5×10⁻⁷');
  assert.equal(C.format(-6.02e23), '−6.02×10²³');
  assert.equal(C.format(9.9999999999e-5), '0.0001', 'rounded first, then placed');
  assert.equal(C.format(NaN), '');
  assert.equal(C.format(Infinity), '');
});

test('ENG: powers of ten in threes, shown as their prefix', () => {
  const eng = (x) => C.format(x, { eng: true });
  assert.equal(eng(4700), '4.7k');
  assert.equal(eng(0.00022), '220µ');
  assert.equal(eng(2e6), '2M');
  assert.equal(eng(0.01), '10m');
  assert.equal(eng(1.5), '1.5');
  assert.equal(eng(3.3e-9), '3.3n');
  assert.equal(eng(1e-12), '1p');
  assert.equal(eng(1.2e9), '1.2G');
  assert.equal(eng(5e12), '5T');
  assert.equal(eng(999.99999999999), '1k', 'rounding up into the next prefix');
  assert.equal(eng(-4700), '−4.7k');
  assert.equal(eng(1e18), '1×10¹⁸', 'beyond the prefixes');
  assert.equal(eng(2.5e-15), '2.5×10⁻¹⁵');
  assert.equal(eng(0), '0');
  assert.equal(v(eng(4700)), 4700, 'what ENG shows reads back');
  assert.equal(v(eng(0.00022)), 0.00022);
});

test('plain: the digits that go into an answer box', () => {
  assert.equal(C.plain(13.325244207), '13.32524421');
  assert.equal(C.plain(1.5e-7), '0.00000015');
  assert.equal(C.plain(6.02e23), '602000000000000000000000');
  assert.equal(C.plain(-13.33), '-13.33');
  assert.equal(C.plain(0.1 + 0.2), '0.3');
  assert.equal(C.plain(4700), '4700');
  assert.equal(C.plain(0), '0');
  assert.equal(C.plain(-0), '0');
  for (const x of [1 / 3, 1.5e-7, 6.02e23, -2.5e-12, 123456.789]) assert.match(C.plain(x), /^-?\d+(\.\d+)?$/, 'digits, a point and a minus only');
});

test('every error in plain words, never NaN or Infinity', () => {
  assert.equal(err('(2+3'), E.CLOSE);
  assert.equal(err('sin(30'), E.CLOSE);
  assert.equal(v('(2+3', { close: true }), 5, 'close: the brackets left open are closed');
  assert.equal(v('sin(30', { close: true }), 0.5);
  assert.equal(C.closeBrackets('sin(√(3'), 'sin(√(3))');
  assert.equal(C.closeBrackets('2+3)'), '2+3)', 'a stray closing bracket is left for the parser');
  assert.equal(err('2+3)'), E.OPEN);
  assert.equal(err(')'), E.OPEN);
  assert.equal(err('(2+3))'), E.OPEN);
  assert.equal(err('1/0'), E.ZERO);
  assert.equal(err('1÷(2−2)'), E.ZERO);
  assert.equal(err('0^-1'), E.ZERO);
  assert.equal(err('sqrt(-1)'), E.REAL);
  assert.equal(err('ln(0)'), E.REAL);
  assert.equal(err('log(-1)'), E.REAL);
  assert.equal(err('(-8)^0.5'), E.REAL);
  assert.equal(err('10^400'), E.BIG);
  assert.equal(err('exp(1000)'), E.BIG);
  assert.equal(err('2+'), E.NUMBER);
  assert.equal(err('×3'), E.NUMBER);
  assert.equal(err('2××3'), E.NUMBER);
  assert.equal(err('()'), E.NUMBER);
  assert.equal(err('sin()'), E.NUMBER);
  assert.equal(err('sin'), E.NUMBER);
  assert.equal(err('.'), E.NUMBER);
  assert.equal(err('%5'), E.NUMBER);
  assert.equal(err('⁻'), E.NUMBER);
  assert.equal(err(''), E.EMPTY);
  assert.equal(err('   '), E.EMPTY);
  assert.equal(err('2 3'), E.OPERATOR);
  assert.equal(err('(2 3)'), E.OPERATOR);
  assert.equal(err('1.2.3'), E.POINTS);
  assert.equal(err('1,5'), E.COMMA);
  assert.equal(err('foo'), E.word('foo'));
  assert.equal(err('$'), E.sign('$'));
  assert.equal(err('2E'), E.POWER);
  assert.equal(err('k'), E.PREFIX);
  assert.equal(err('tan(90)'), E.TAN);
  assert.equal(err('('.repeat(60) + '1' + ')'.repeat(60)), E.DEEP);
  assert.equal(err('1+'.repeat(200) + '1'), E.LONG);
  // The messages themselves are words, not numbers or codes.
  for (const [k, m] of Object.entries(E)) if (typeof m === 'string') assert.doesNotMatch(m, /NaN|Infinity|undefined|Error/, k);
  // And no sum ever gives a value that is not a finite number.
  for (const s of ['1/3', '2^0.5', 'sin(1)', 'ln(2)', '1E300×1E8', '1E-300÷1E300', '0^0', '(-1)^3']) {
    const r = C.evaluate(s);
    assert.ok(!r.ok || (typeof r.value === 'number' && Number.isFinite(r.value)), s + ' -> ' + JSON.stringify(r));
  }
});

test('nothing typed is run as code: no eval, no Function, no lookups by his words', () => {
  // The engine's own text uses neither.
  const code = ENGINE.replace(/\/\/[^\n]*/g, '');
  assert.doesNotMatch(code, /\beval\s*\(|\bFunction\s*\(|new\s+Function|setTimeout\s*\(\s*['"`]|\bwith\s*\(|\bimport\s*\(/);
  // In this context strings cannot become code at all: eval and new Function throw.
  assert.throws(() => vm.runInContext('eval("1+1")', ctx), /EvalError|Code generation/);
  assert.throws(() => vm.runInContext('new Function("return 1")', ctx), /EvalError|Code generation/);
  // ...and the engine still works out everything above in it. Words that name code are refused
  // as words he cannot use, with nothing run and nothing changed.
  const hostile = ['constructor', 'toString', 'valueOf', 'hasOwnProperty', 'alert(1)', 'this', 'window', 'globalThis', 'U', 'process.exit()',
    'eval(1)', 'Function("x")()', '__proto__', 'constructor.constructor("return 1")()', '[1]', '{}', 'a=1', '1;2', '`x`', '"x"', "'x'", '<script>', '\\u0041'];
  for (const s of hostile) {
    const r = C.evaluate(s);
    assert.equal(r.ok, false, s);
    assert.equal(r.bug, undefined, s + ': ' + r.bug);
    assert.match(r.error, /^Can't (read|use) /, s + ' -> ' + r.error);
  }
  assert.equal(typeof ctx.U, 'object');
  assert.equal(ctx.a, undefined, 'nothing assigned');
  // Its names are looked up in its own list, never on an object: no prototype key works as a name.
  for (const s of ['2constructor', 'sin(toString)', 'proto', 'Ansconstructor']) assert.equal(C.evaluate(s).ok, false, s);
});

test('the engine is pure: no DOM at load (it ran here with none)', () => {
  assert.equal(typeof ctx.document, 'undefined');
  assert.equal(typeof C.evaluate, 'function');
  assert.equal(C.MAX_LEN, 300);
});
