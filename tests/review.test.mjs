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

// Cards for U.review._plan(opts, data): `due` due today, `doneToday` reviewed today (due in four
// days), and `at` = {days from today: how many} for cards due later.
function day(n) { return U.addDays(U.today(), n); }
function deck({ due = 0, doneToday = 0, at = {} } = {}) {
  const cards = [], old = new Date(Date.now() - 9 * 864e5).toISOString();
  const add = (dueDay, today) => cards.push({ id: 'c' + cards.length, tid: 't', iid: 'i' + (cards.length % 4), type: 'choice', spec: { q: 'Q?' },
    s: { due: dueDay, stability: 3, difficulty: 5, reps: 1, lapses: 0, last: today ? day(0) : day(-9) },
    hist: [{ at: old, grade: 3, ok: true }].concat(today ? [{ at: new Date().toISOString(), grade: 3, ok: true }] : []) });
  for (let i = 0; i < due; i++) add(day(0));
  for (let i = 0; i < doneToday; i++) add(day(4), true);
  for (const [n, k] of Object.entries(at)) for (let i = 0; i < k; i++) add(day(Number(n)));
  return cards;
}
const words = async (cards, prefs = {}) => U.review._clearWords(await U.review._plan({}, { cards, profile: { prefs: { cap: 15, ...prefs } } }));

test('with nothing waiting, the words say when cards come back, counting what the daily limit held back', async () => {
  // The checker's case: limit 15 used up, 5 still due, 2 due in two days. The 5 wait for tomorrow.
  let w = await words(deck({ due: 5, doneToday: 15, at: { 2: 2 } }));
  assert.equal(w.head, 'Done for today');
  assert.equal(w.lead, 'You reviewed 15 cards today. That is what keeps it all fresh.');
  assert.equal(w.next, 'Next up: 5 cards tomorrow.');
  // With cards due tomorrow as well, they come back together.
  assert.equal((await words(deck({ due: 5, doneToday: 15, at: { 1: 3, 2: 2 } }))).next, 'Next up: 8 cards tomorrow.');
  // Tomorrow's review holds its usual limit, not more.
  assert.equal((await words(deck({ due: 20, doneToday: 15 }))).next, 'Next up: 15 cards tomorrow.');
  // A light day is for today only: 5 reviewed, 8 still due; tomorrow's limit is the usual 15.
  w = await words(deck({ due: 8, doneToday: 5 }), { lightDay: U.today() });
  assert.equal(w.head, 'Done for today');
  assert.equal(w.next, 'Next up: 8 cards tomorrow.');
  // Light days kept on in settings: tomorrow holds 5 too.
  assert.equal((await words(deck({ due: 8, doneToday: 5 }), { light: true })).next, 'Next up: 5 cards tomorrow.');
  // Nothing held back: the soonest day cards come back.
  w = await words(deck({ doneToday: 3, at: { 1: 2, 3: 4 } }));
  assert.equal(w.head, 'Done for today');
  assert.equal(w.next, 'Next up: 2 cards tomorrow.');
  assert.match((await words(deck({ at: { 2: 2 } }))).next, /^Next up: 2 cards on \S+\.$/);
});

test('Today and Learn share one set of calm words', async () => {
  let w = await words([]);
  assert.deepEqual({ ...w }, { head: 'Nothing to review yet', lead: 'When you finish a lesson, the questions you answered come back the next day, so they stick.', next: '' });
  w = await words(deck({ at: { 5: 1 } }));
  assert.equal(w.head, 'Nothing to review today');
  assert.equal(w.lead, 'Everything you have learned is holding up for now.');
  assert.match(w.next, /^Next up: 1 card on /);
});
