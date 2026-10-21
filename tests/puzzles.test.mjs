// Unit tests for puzzles as review cards (phase 6, docs/ARCHITECTURE.md sections 4 and 8): cards made
// from a ready-made steps lesson's guide (60-today.js), typed answers graded to the course's rounding
// (41-cards.js), the backfill for lessons quizzed through before (once, spread out), and a lesson
// read through making none. The modules run in a VM with a settable clock and an in-memory store.
// Run: node --test tests/puzzles.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => readFileSync(join(root, 'app', 'src', 'js', f), 'utf8');
const clone = (o) => (o == null ? o : JSON.parse(JSON.stringify(o)));
function merge(a, b) {
  const out = a && typeof a === 'object' && !Array.isArray(a) ? { ...a } : {};
  for (const [k, v] of Object.entries(b || {})) {
    if (v === null) delete out[k];
    else if (v && typeof v === 'object' && !Array.isArray(v)) out[k] = merge(out[k], v);
    else out[k] = v;
  }
  return out;
}

// The app's review modules over an in-memory store: cards, progress, profile, topics, guides, lessons.
function load(seed = {}) {
  const docs = { cards: {}, profile: { prefs: { cap: 15, light: false }, days: {} }, progress: {}, topics: {}, guides: {}, lessons: {}, ...clone(seed) };
  const reads = { guide: 0, lesson: 0 };
  const ctx = vm.createContext({ console: { log() {}, warn() {}, error: console.error }, document: { getElementById: () => null } });
  vm.runInContext(`var window = globalThis;
    (function () {
      var Real = Date, now = Real.now();
      function D() {
        if (!new.target) return new Real(now).toString();
        return arguments.length ? new (Function.prototype.bind.apply(Real, [null].concat([].slice.call(arguments))))() : new Real(now);
      }
      D.prototype = Real.prototype; D.UTC = Real.UTC; D.parse = Real.parse;
      D.now = function () { return now; };
      globalThis.__setNow = function (t) { now = +t; };
      globalThis.Date = D;
    })();`, ctx);
  vm.runInContext('"use strict";\n' + ['00-core.js', '40-fsrs.js', '41-cards.js', '60-today.js'].map(src).join('\n'), ctx);
  const U = ctx.U;
  U.store = {
    cards: {
      all: async () => clone(docs.cards),
      get: async (tid) => clone(docs.cards[tid]) || { cards: {} },
      patch: async (tid, patch) => { docs.cards[tid] = merge(docs.cards[tid] || { cards: {} }, clone(patch)); return patch; },
      update: async (tid, id, fn) => {
        const c = docs.cards[tid] && docs.cards[tid].cards[id];
        if (!c || !c.type) return null;
        const fields = fn(clone(c));
        if (!fields) return null;
        Object.assign(c, clone(fields));
        return fields;
      },
      dropOrphan: async () => {},
    },
    topicsExist: async (tids) => Object.fromEntries(tids.map((t) => [t, true])),
    topics: { list: async () => Object.entries(docs.topics).map(([id, t]) => ({ __id: id, ...clone(t) })) },
    guide: { get: async (tid, iid) => { reads.guide++; return clone((docs.guides[tid] || {})[iid]) || null; } },
    lesson: { get: async (tid, iid) => { reads.lesson++; return clone((docs.lessons[tid] || {})[iid]) || null; } },
    profile: { get: async () => clone(docs.profile), patch: async (p) => { docs.profile = merge(docs.profile, clone(p)); } },
    progress: {
      get: async (tid) => clone(docs.progress[tid]) || null,
      patch: async (tid, p) => { docs.progress[tid] = merge(docs.progress[tid] || {}, clone(p)); },
      all: async () => clone(docs.progress),
    },
    replacing: (old, neu) => neu,
    retryLater: (e) => e,
  };
  return { U, docs, reads, at: (d) => ctx.__setNow(d) };
}
const plain = clone;
const iso = (d) => d.toISOString();

// A version 2 guide (tools/course/guide.mjs): each example says how the lesson asked it.
const GUIDE = {
  v: 2, iid: 'i1', pages: [
    { kind: 'show', text: 'Area counts squares.', svg: '<svg viewBox="0 0 1 1"></svg>' },
    { kind: 'example', name: 'Typed', task: 'A plant room is 6 m by 4 m. What is its area?', answer: '24 m²', why: '6 × 4 = 24.', input: 'typed', svg: '<svg viewBox="0 0 2 2"></svg>', alt: 'A floor' },
    { kind: 'example', name: 'Pick words', task: 'Both floors are 16 m around. Which covers more floor?', answer: 'Floor B', why: 'B is square.', input: 'pick', options: ['Floor A', 'Floor B', 'The same'] },
    { kind: 'example', name: 'Pick a figure', task: 'A 7.5 kW motor at 400 V, pf 0.85, efficiency 90%. What is Ib?', answer: '14.15 A', why: 'Ib = P ÷ (√3 × U × eff × pf).', input: 'pick', options: ['12.03 A', '12.74 A', '14.15 A'] },
    { kind: 'example', name: 'Which of these', task: 'Which of these is the area of the plate?', answer: '600 cm²', why: 'Half of 40 × 30.', input: 'pick', options: ['1,200 cm²', '600 cm²', '1,000 cm²'] },
    { kind: 'example', name: 'Drag', task: 'A floor has a 3 m side and covers 12 m². Drag the corner to draw it.', answer: '4 m × 3 m', why: '12 ÷ 3 = 4.' },
    { kind: 'example', name: 'Colour', task: 'Colour 1 1/4.', answer: '5', why: 'Four quarters and one more.' },
    { kind: 'example', name: 'Section B', task: 'Explain why Ib at a sub-board uses its own voltage.', answer: '', why: 'A model answer: …', written: 'b1' },
  ],
};
const LESSON = { title: 'Design current', written: { b1: { q: 'Explain why Ib at a sub-board uses its own voltage.', points: [{ text: 'The submain drops voltage', cite: 'slides p.18' }, { text: 'Lower voltage, more current', cite: 'p.19' }], need: 2, model: 'The submain drops some voltage…' } } };

test('cards made from a guide: typed figures, picked choices, written questions; drags and older guides make none', () => {
  const { U } = load();
  const made = plain(U.review.puzzlesFrom('tA', 'i1', GUIDE, LESSON, { written: { b1: { k1: { text: 'first go', at: '1' }, k2: { text: 'my words', at: '2' } } } }));
  assert.deepEqual(Object.keys(made).sort(), ['i1_w_b1', 'i1_x1', 'i1_x2', 'i1_x3', 'i1_x4']);
  assert.deepEqual(made.i1_x1, { id: 'i1_x1', tid: 'tA', iid: 'i1', type: 'puzzle', spec: { q: 'A plant room is 6 m by 4 m. What is its area?', answer: '24 m²', why: '6 × 4 = 24.', input: 'typed', page: 1, name: 'Typed' } });
  assert.equal(made.i1_x2.spec.input, 'pick', 'words are picked from the lesson\'s own options');
  assert.deepEqual(made.i1_x2.spec.options, ['Floor A', 'Floor B', 'The same']);
  assert.equal(made.i1_x3.spec.input, 'typed', 'a figure picked in the lesson is typed in review');
  assert.equal(made.i1_x3.spec.options, undefined);
  assert.equal(made.i1_x4.spec.input, 'pick', 'a task that names its options keeps them');
  assert.equal(made.i1_w_b1.type, 'written');
  assert.deepEqual(made.i1_w_b1.spec, { qid: 'b1', q: LESSON.written.b1.q, points: LESSON.written.b1.points, model: LESSON.written.b1.model, need: 2, title: 'Design current', mine: 'my words' });
  // The picture is never copied into the card (a cards doc stays small): the card keeps the page's place.
  assert.ok(!JSON.stringify(made).includes('<svg'));
  // An older guide says nothing about how an example was asked: no puzzles, only written questions.
  const old = { pages: GUIDE.pages.map((p) => { const q = { ...p }; delete q.input; delete q.options; return q; }) };
  assert.deepEqual(Object.keys(plain(U.review.puzzlesFrom('tA', 'i1', old, LESSON, null))), ['i1_w_b1']);
  assert.deepEqual(plain(U.review.puzzlesFrom('tA', 'i1', null, null, null)), {});
  // A pick whose answer is not among its options, or with one option, is not a puzzle.
  const odd = { v: 2, pages: [{ kind: 'example', task: 'Q?', answer: 'C', input: 'pick', options: ['A', 'B'] }, { kind: 'example', task: 'Q2?', answer: 'A', input: 'pick', options: ['A'] }] };
  assert.deepEqual(plain(U.review.puzzlesFrom('tA', 'i2', odd, null, null)), {});
});

test('typed answers are graded to the course\'s rounding: half a unit in the last decimal shown, the unit optional', () => {
  const { U } = load();
  const g = (text, answer) => U.cards.gradeTyped(text, { answer }).state;
  assert.equal(g('28.87', '28.87 A'), 'right');
  assert.equal(g('28.87 A', '28.87 A'), 'right');
  assert.equal(g('28.874', '28.87 A'), 'right', 'within half a unit in the second decimal');
  assert.equal(g('28.866', '28.87 A'), 'right');
  assert.equal(g('28.88', '28.87 A'), 'wrong');
  assert.equal(g('28.9', '28.87 A'), 'wrong', 'rounded further than the course rounds is not the answer');
  assert.equal(g('28,87', '28.87 A'), 'right', 'a decimal comma');
  assert.equal(g('28.87 V', '28.87 A'), 'unreadable', 'another unit is not accepted as the answer');
  assert.equal(g('', '28.87 A'), 'empty');
  assert.equal(g('about 30', '28.87 A'), 'unreadable');
  assert.equal(g('24', '24 m²'), 'right');
  assert.equal(g('24.4', '24 m²'), 'right', 'a whole number: half a unit either way');
  assert.equal(g('24.6', '24 m²'), 'wrong');
  assert.equal(g('24 m2', '24 m²'), 'right', 'm2 for m²');
  assert.equal(g('1 000 000', '1,000,000 mm²'), 'right');
  assert.equal(g('-3', '−3'), 'right', 'a typed minus for the printed one');
  assert.equal(g('5 ohms', '5 Ω'), 'right');
  assert.equal(g('47 uF', '47 µF'), 'right');
  assert.equal(g('168 m/us', '168 m/µs'), 'right', 'u for µ after a slash too');
  assert.equal(g('25.21 ma', '25.21 mA'), 'right', 'case does not matter for most units');
  assert.equal(g('25.21 MA', '25.21 mA'), 'unreadable', 'but M (mega) is never m (milli)');
  assert.equal(g('2.5 Mohm', '2.5 MΩ'), 'right');
  assert.equal(g('2.5 mohm', '2.5 MΩ'), 'unreadable');
  assert.deepEqual(plain(U.cards.figureOf('0.5 m')), { value: 0.5, decimals: 1, unit: 'm' });
  for (const notFigure of ['9⁸', '1/3', '3 1/2', '4 times the light', 'Floor B', 'Near 70.7 V', '16a²', '200 × 10⁶ N/m²']) assert.equal(U.cards.figureOf(notFigure), null, notFigure);
});

test('finishing by quizzing through makes the puzzles once, first in the box tomorrow; an older guide only its written questions', async () => {
  const { U, docs, at } = load({ topics: { tA: { readyMade: { shelf: 'maths', course: 'a' }, guideV: 2 } } });
  at(new Date(2026, 9, 6, 12, 0));
  const n = await U.review.puzzlesFor('tA', 'i1', { guide: GUIDE, lesson: LESSON, idea: {}, round: 0 });
  assert.equal(n, 5);
  const cards = docs.cards.tA.cards;
  assert.equal(cards.i1_x1.s.due, '2026-10-07', 'ready from tomorrow');
  assert.equal(cards.i1_w_b1.type, 'written');
  assert.deepEqual(plain(docs.progress.tA.ideas.i1), { puzzleRound: 0, puzzleV: 2 });
  // Again (another device, a Start again): unchanged puzzles keep their schedule.
  cards.i1_x1.s = { due: '2026-10-20', stability: 9, difficulty: 5, reps: 2, lapses: 0, last: '2026-10-06' };
  cards.i1_x1.hist = [{ at: iso(new Date()), grade: 3, ok: true }];
  await U.review.puzzlesFor('tA', 'i1', { guide: GUIDE, lesson: LESSON, idea: {}, round: 0 });
  assert.equal(docs.cards.tA.cards.i1_x1.s.due, '2026-10-20');
  assert.equal(docs.cards.tA.cards.i1_x1.hist.length, 1);
  // The box counts them as puzzles from the day they are ready.
  at(new Date(2026, 9, 7, 12, 0));
  const box = plain(await U.review.box());
  assert.equal(box.size, 4, 'four puzzles ready: the fifth was answered and comes back later');
  assert.deepEqual(box.courses, [{ tid: 'tA', n: 4, ideas: ['i1'] }]);
  // An older guide (version 1): its examples cannot be asked, so only the written question, and
  // nothing recorded, so the guide's next version still makes the rest.
  const old = load();
  old.at(new Date(2026, 9, 6, 12, 0));
  const v1 = { pages: GUIDE.pages.map((p) => { const q = { ...p }; delete q.input; delete q.options; return q; }) };
  assert.equal(await old.U.review.puzzlesFor('tA', 'i1', { guide: v1, lesson: LESSON, idea: {}, round: 0 }), 1);
  assert.deepEqual(Object.keys(old.docs.cards.tA.cards), ['i1_w_b1']);
  assert.equal(old.docs.progress.tA, undefined);
});

test('the backfill: lessons quizzed through before get their puzzles once, spread over days within the daily limit; read-throughs get none', async () => {
  const ago = (d) => iso(new Date(2026, 9, 6 - d, 10, 0));
  // Six worked examples a lesson, each typed.
  const guideOf = (iid) => ({ v: 2, iid, pages: [1, 2, 3, 4, 5, 6].map((k) => ({ kind: 'example', task: iid + ' task ' + k + '?', answer: String(k * 10) + ' V', why: 'w', input: 'typed' })) });
  const seed = {
    topics: {
      tA: { readyMade: { shelf: 'maths', course: 'a' }, guideV: 2 },
      tB: { readyMade: { shelf: 'maths', course: 'b' }, guideV: 2 },
      tOld: { readyMade: { shelf: 'maths', course: 'c' } },          // guides not yet version 2: wait
      tMine: { title: 'Made in the page' },                           // not a ready-made course
    },
    guides: { tA: { i1: guideOf('i1'), i2: guideOf('i2'), i3: guideOf('i3'), i4: guideOf('i4') }, tB: { i1: guideOf('i1') }, tOld: { i1: guideOf('i1') } },
    progress: {
      tA: { ideas: {
        i1: { round: 0, stage: 'done', doneAt: ago(9), readRound: 0, cardsRound: 0, quizRound: 0 },     // quizzed
        i2: { round: 0, stage: 'done', doneAt: ago(8), readRound: 0, cardsRound: 0 },                   // before there were two ways: quizzed
        i3: { round: 0, stage: 'done', doneAt: ago(7), readRound: 0, cardsRound: 0, readThrough: 0 },   // read through only
        i4: { round: 0, stage: 'play' },                                                                 // not finished
      } },
      tB: { ideas: { i1: { round: 0, stage: 'done', doneAt: ago(1), readRound: 0, cardsRound: 0, quizRound: 0, readThrough: 0 } } },   // read, then quizzed
      tOld: { ideas: { i1: { round: 0, stage: 'done', doneAt: ago(3), readRound: 0, cardsRound: 0, quizRound: 0 } } },
      tMine: { ideas: { i1: { round: 0, stage: 'done', doneAt: ago(3), cardsRound: 0 } } },
    },
  };
  const { U, docs, reads, at } = load(seed);
  at(new Date(2026, 9, 6, 12, 0));
  const made = plain(await U.review.mendCards(true));
  assert.deepEqual(made.map((x) => x.tid + '/' + x.iid).sort(), ['tA/i1', 'tA/i2', 'tB/i1']);
  assert.equal(reads.guide, 3, 'only the guides of lessons quizzed through are read');
  const all = [...Object.values(docs.cards.tA.cards), ...Object.values(docs.cards.tB.cards)];
  assert.equal(all.length, 18);
  assert.ok(!Object.keys(docs.cards.tA.cards).some((id) => id.startsWith('i3_')), 'a read-through makes no puzzles');
  assert.equal(docs.cards.tOld, undefined, 'a course whose guides cannot be asked yet waits');
  // Spread: half the daily limit (15) of new puzzles a day, from tomorrow, a puzzle from each lesson in turn.
  const perDay = {};
  for (const c of all) perDay[c.s.due] = (perDay[c.s.due] || 0) + 1;
  assert.deepEqual(perDay, { '2026-10-07': 8, '2026-10-08': 8, '2026-10-09': 2 });
  const first = all.filter((c) => c.s.due === '2026-10-07').map((c) => c.tid + '/' + c.iid);
  assert.ok(first.includes('tA/i1') && first.includes('tA/i2') && first.includes('tB/i1'), 'the first day mixes the lessons: ' + first);
  assert.equal(docs.cards.tA.cards.i1_x1.learnedAt, ago(9), 'learned when he finished the lesson');
  assert.equal(docs.progress.tA.ideas.i1.puzzleRound, 0);
  assert.equal(docs.progress.tA.ideas.i1.puzzleV, 2);
  assert.equal(docs.progress.tA.ideas.i3.puzzleRound, undefined);
  // Once: the next open makes nothing and reads no guide.
  assert.deepEqual(plain(await U.review.mendCards(true)), []);
  assert.equal(reads.guide, 3);
  // Today's box the next day holds that day's share, and a session the daily limit.
  at(new Date(2026, 9, 7, 12, 0));
  assert.equal((await U.review.box()).size, 8);
  // The course's guides become version 2 later: that course's lessons get theirs then.
  docs.topics.tOld.guideV = 2;
  assert.deepEqual(plain(await U.review.mendCards(true)).map((x) => x.tid), ['tOld']);
  // New cards already waiting count towards each day: tomorrow (the 8th) has 8 already, the 9th 2,
  // so these six join the 9th.
  assert.deepEqual([...new Set(Object.values(docs.cards.tOld.cards).map((c) => c.s.due))].sort(), ['2026-10-09']);
});

test('the backfill waits for a guide still to be published: no stamp, and the puzzles come once it arrives', async () => {
  const guide = { v: 2, iid: 'i2', pages: [1, 2].map((k) => ({ kind: 'example', task: 'Task ' + k + '?', answer: String(k * 10) + ' V', why: 'w', input: 'typed' })) };
  const { U, docs, at } = load({
    topics: { tP: { readyMade: { shelf: 'electrical', course: 'p' }, guideV: 3 } },
    guides: { tP: {} },
    progress: { tP: { ideas: { i2: { round: 0, stage: 'done', doneAt: iso(new Date(2026, 9, 5, 10, 0)), readRound: 0, cardsRound: 0, quizRound: 0 } } } },
  });
  at(new Date(2026, 9, 6, 12, 0));
  assert.deepEqual(plain(await U.review.mendCards(true)), []);
  assert.equal(docs.progress.tP.ideas.i2.puzzleRound, undefined, 'not recorded as made');
  docs.guides.tP.i2 = guide;
  assert.deepEqual(plain(await U.review.mendCards(true)).map((x) => x.tid + '/' + x.iid), ['tP/i2']);
  assert.equal(Object.keys(docs.cards.tP.cards).length, 2);
});

test('puzzles of a lesson only read through are never counted; quizzed ones are, and never as slipping', async () => {
  const day = '2026-10-06', ago = (d) => iso(new Date(2026, 9, 6 - d, 10, 0));
  const due = (id, iid, extra = {}) => ({ id, tid: 'tA', iid, type: 'puzzle', spec: { q: id + '?', answer: '5 V', why: 'w', input: 'typed', page: 1 }, learnedAt: ago(20), s: { due: day, stability: 3, difficulty: 5, reps: 1, lapses: 0, last: '2026-10-03' }, hist: [], ...extra });
  const slipped = [{ at: ago(3), grade: 1, ok: false }, { at: ago(2), grade: 1, ok: false }];
  const cards = { i1_x1: due('i1_x1', 'i1', { hist: slipped }), i1_x2: due('i1_x2', 'i1'), i2_x1: due('i2_x1', 'i2') };
  const progress = { tA: { ideas: {
    i1: { round: 0, stage: 'done', doneAt: ago(20), readRound: 0, cardsRound: 0, quizRound: 0, puzzleRound: 0 },
    // Somehow carrying puzzles, but finished this round by reading it through only: left out.
    i2: { round: 0, stage: 'done', doneAt: ago(20), readRound: 0, cardsRound: 0, readThrough: 0 },
  } } };
  const { U, at } = load({ cards: { tA: { cards } }, progress });
  at(new Date(2026, 9, 6, 12, 0));
  assert.equal(await U.review.dueCount(), 2, 'a quizzed lesson\'s puzzles count, though the lesson is a read lesson');
  assert.deepEqual(plain((await U.review.queue({})).map((c) => c.iid).sort()), ['i1', 'i1']);
  assert.equal((await U.review.slipping()).length, 0, 'two Agains on a puzzle never offer Learn it again');
  const o = await U.review.outlook();
  assert.equal(o.minutes, 1, '40 s a puzzle');
});
