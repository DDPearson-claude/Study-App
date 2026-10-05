// Unit tests for the review screens' pure helpers: how a target card names its readout
// (41-cards.js) and how the summary ties cards to ideas (60-today.js).
// Run: node --test tests/review.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => readFileSync(join(root, 'app', 'src', 'js', f), 'utf8');
const U = (() => {
  const ctx = vm.createContext({ console });
  vm.runInContext('var window = globalThis;', ctx);
  vm.runInContext('"use strict";\n' + ['00-core.js', '40-fsrs.js', '41-cards.js', '60-today.js'].map(src).join('\n'), ctx);
  return ctx.U;
})();

test('a target card finds the readout it reads, in a lesson doc or a bare lesson', () => {
  const lesson = { interactive: { controls: [{ id: 'L', label: 'Length of string' }], outputs: [{ id: 'T', label: 'Time for one swing', unit: 's', decimals: 2 }] } };
  const doc = { status: 'ready', lesson, interactive: { html: '<div></div>' } };
  assert.equal(U.cards.outputOf(doc, 'T').label, 'Time for one swing');
  assert.equal(U.cards.outputOf(lesson, 'T').unit, 's');
  assert.equal(U.cards.outputOf(doc, 'missing'), null);
  // Lessons from before readouts were declared: no label or unit to show, nothing invented.
  assert.equal(U.cards.outputOf({ lesson: { interactive: { controls: [] } } }, 'T'), null);
  assert.equal(U.cards.outputOf(null, 'T'), null);
});

test('the summary says how the cards coming back map to ideas', () => {
  assert.equal(U.review._backCount(4, 2), '4 cards, from 2 ideas:');
  assert.equal(U.review._backCount(2, 2), '2 cards, from 2 ideas:');
  assert.equal(U.review._backCount(3, 1), '3 cards, all from this idea:');
  assert.equal(U.review._backCount(1, 1), 'One card, from this idea:');
});
