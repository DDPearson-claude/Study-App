// Unit tests for the two ways into a ready-made steps lesson (docs/ARCHITECTURE.md section 10):
// the read-through's pure parts (53-read.js: the guide's pages in reading order, pictures only from
// SVG) and how the course page tells a read-through from a quiz (70-learn.js: V.way, V.lessonHref,
// V.readThrough). The screens are checked in tests/e2e/read.spec.mjs.
// Run: node --test tests/read.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const plain = (x) => JSON.parse(JSON.stringify(x));
function load(files) {
  const ctx = { console, setTimeout, clearTimeout, Promise, Date, Math, JSON };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of files) vm.runInContext(readFileSync(join(root, 'app', 'src', 'js', f), 'utf8'), ctx, { filename: f });
  return ctx.U;
}

test('U.readThrough.parts: the pages in order with the summary card apart; pictures only from SVG', () => {
  const U = load(['00-core.js', '53-read.js']);
  const g = { pages: [
    { kind: 'summary', title: 'Design current, Ib', rule: 'Ib = P ÷ U' },
    { kind: 'show', text: 'One.', svg: '<svg viewBox="0 0 1 1"></svg>' },
    { kind: 'example', task: 'Two?', answer: '2' },
    { kind: 'show', text: '' }, { kind: 'example' }, null, { kind: 'mystery', text: 'x' },
  ] };
  const p = plain(U.readThrough.parts(g));
  assert.equal(p.summary.title, 'Design current, Ib');
  assert.deepEqual(p.pages.map((x) => x.kind + ':' + (x.text || x.task)), ['show:One.', 'example:Two?']);
  assert.deepEqual(plain(U.readThrough.parts({ pages: [{ kind: 'show', text: 'a' }] })).summary, null, 'a plain guide has no card');
  assert.deepEqual(plain(U.readThrough.parts(null)), { pages: [], summary: null });
  assert.match(U.readThrough.pic('<svg viewBox="0 0 1 1"/>'), /^data:image\/svg\+xml;charset=utf-8,%3Csvg/);
  for (const bad of ['<img src=x onerror=alert(1)>', ' <svg>', 'data:image/png;base64,x', null]) assert.equal(U.readThrough.pic(bad), null, String(bad));
});

test('V.way, V.lessonHref and V.readThrough: his choice per course, and read-through against quizzed', () => {
  const U = load(['00-core.js', '70-learn.js']);
  const V = U.views;
  assert.equal(V.way(null), 'quiz', 'quiz by default');
  assert.equal(V.way({ way: 'read' }), 'read');
  assert.equal(V.lessonHref('t 1', 'i2', { way: 'read' }), '#/t/t%201/i2/read');
  assert.equal(V.lessonHref('t1', 'i2', { way: 'read' }, 'quiz'), '#/t/t1/i2');
  const P = (i) => ({ ideas: { i1: Object.assign({ stage: 'done', round: 0, readRound: 0 }, i) } });
  assert.equal(V.readThrough(P({ readThrough: 0 }), 'i1'), true, 'finished by reading it through');
  assert.equal(V.readThrough(P({ readThrough: 0, quizRound: 0 }), 'i1'), false, 'quizzed too: quizzed');
  assert.equal(V.readThrough(P({}), 'i1'), false, 'finished before there were two ways: quizzed');
  assert.equal(V.readThrough(P({ readThrough: 0, round: 1, readRound: 1 }), 'i1'), false, 'an older round\'s read-through');
  assert.equal(V.readThrough(P({ readThrough: 0, stage: 'play' }), 'i1'), false, 'not finished');
  assert.equal(V.isRead(P({ readThrough: 0 }), 'i1'), true, 'read, as any read lesson');
});

test('U.readThrough.stillHtml: a still step for a sandboxed frame, with no script, no handler and no motion', () => {
  const U = load(['00-core.js', '53-read.js']);
  const s = U.readThrough.stillHtml('<div class="rule1"><p>Ib ≤ In ≤ Iz</p></div>', '.rule1{padding:12px}</style><script>x()</script>');
  assert.match(s, /^<style>[^]*animation:none!important[^]*\.rule1\{padding:12px\}<\\\/style><script>x\(\)<\\\/script><\/style><div class="rule1">/, 'the lesson\'s style cannot close its own element');
  assert.equal(U.readThrough.stillHtml('<p>x</p><script>alert(1)</script>', ''), null, 'a script is refused');
  assert.equal(U.readThrough.stillHtml('<img src=x onerror="alert(1)">', ''), null, 'a handler is refused');
  assert.equal(U.readThrough.stillHtml('  ', ''), null);
  const p = JSON.parse(JSON.stringify(U.readThrough.parts({ pages: [{ kind: 'show', text: '', html: '<p>panel</p>' }] })));
  assert.equal(p.pages.length, 1, 'a step that is all still HTML is a page');
});

test('U.readThrough.stillDoc: a whole still document that needs no script, and refuses what could load or leave', () => {
  const U = load(['00-core.js', '53-read.js']);
  U.KIT_CSS = ':root{--k-bg:#FFFFFF}';
  const d = U.readThrough.stillDoc('<div class="rule1"><p>Ib ≤ In ≤ Iz</p></div>', '.rule1{padding:12px}');
  assert.match(d, /^<!doctype html><html lang="en" data-theme="light"><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; form-action 'none'">/);
  assert.match(d, /<style>:root\{--k-bg:#FFFFFF\}<\/style><\/head><body><style>[^]*\.rule1\{padding:12px\}<\/style><div class="rule1">/, 'kit CSS, then the lesson\'s, then the step');
  assert.ok(!/<script/i.test(d), 'no script at all');
  for (const bad of ['<iframe src="x"></iframe>', '<form><button>Go</button></form>', '<meta http-equiv="refresh" content="0;url=x">', '<link rel="stylesheet" href="x">', '<base href="x">', '<a href="javascript:alert(1)">x</a>', '<object data="x"></object>', '<embed src="x">'])
    assert.equal(U.readThrough.stillDoc(bad, ''), null, bad);
});

test('U.readThrough.answerOf and choicesOf: an answer with its unit, and a choice example\'s options', () => {
  const U = load(['00-core.js', '53-read.js']);
  const R = U.readThrough;
  assert.equal(R.answerOf({ answer: '23.08', unit: 'A' }), '23.08 A', 'its unit added');
  assert.equal(R.answerOf({ answer: '23.08 A', unit: 'A' }), '23.08 A', 'not twice');
  assert.equal(R.answerOf({ answer: '1.5 mm²', unit: 'mm²' }), '1.5 mm²');
  assert.equal(R.answerOf({ answer: '3 circuits' }), '3 circuits');
  assert.equal(R.answerOf({ answer: '' }), '');
  assert.deepEqual(plain(R.choicesOf({ input: 'pick', options: ['12.03 A', '14.15 A'], answer: '14.15 A' })), ['12.03 A', '14.15 A']);
  assert.deepEqual(plain(R.choicesOf({ input: 'pick', options: ['12.03 A', '14.15 A'], answer: '9 A' })), [], 'the answer must be among them');
  assert.deepEqual(plain(R.choicesOf({ input: 'typed', options: ['a', 'b'], answer: 'a' })), [], 'a typed example lists none');
});

// The live D&V guides (docs/courses/.../out, what is published): every page reads as words, with no
// quiz-only instruction, verdict or leftover markup, and every still carries its size.
test('the published Design and verification guides read as plain sense', () => {
  const dir = join(root, 'docs', 'courses', 'electrical', 'design-and-verification', 'out');
  const QUIZ = /(^|[.!?]\s+)(Drag|Tap|Press|Click|Choose|Pick|Work each|Check yours)\b|Skip to the practice|Refresh the why|two wrong tries|on to screen \d/;
  for (const iid of ['i1', 'i2', 'i3', 'i4']) {
    const g = JSON.parse(readFileSync(join(dir, 'guide-' + iid + '.json'), 'utf8'));
    assert.ok(g.v >= 3 && g.stillW > 0, iid + ': version 3, with the stills\' width');
    for (const p of g.pages) {
      const words = [p.text, p.task, p.answer, p.why].filter(Boolean).join(' ');
      assert.ok(!QUIZ.test(words), iid + ' ' + p.name + ': quiz-only words: ' + words);
      assert.ok(!/\bundefined\b|\bNaN\b|&[a-z]+;|\[object|\bK\.[a-z]+\(/.test(words), iid + ' ' + p.name + ': leftovers');
      if (p.kind === 'example' && !p.written) {
        assert.ok(/\?|\b(Determine|State|Explain|Calculate|Find)\b/i.test(p.task), iid + ' ' + p.name + ': the task is a question: ' + p.task);
        assert.ok(!p.answer || !p.task.includes(p.answer), iid + ' ' + p.name + ': the task does not give the answer');
      }
      if (p.html) {
        assert.ok(p.h > 40, iid + ' ' + p.name + ': a still with its height');
        const text = p.html.replace(/<style[^]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
        assert.ok(!/\b(Drag|Tap) (a|the|either|it)\b/.test(text), iid + ' ' + p.name + ': no instruction in its still');
        assert.ok(!/>\s*(Right|Still there|That's it)\.\s*</.test(p.html), iid + ' ' + p.name + ': no verdict in its still');
      }
    }
    const scen = g.pages.filter((p) => p.html && /\bk-scen\b/.test(p.html)).length;
    assert.ok(scen <= 1, iid + ': the scenario once, not on every Section A page (' + scen + ')');
  }
});
