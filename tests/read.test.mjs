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
