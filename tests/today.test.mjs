// Unit tests for spaced review's day and slipping rules (40-fsrs.js, 60-today.js) and for the
// review contract in docs/ARCHITECTURE.md section 8. The modules run in a VM with a clock the test
// sets and a small in-memory U.store, so plans can be checked at 23:55 and at 00:01.
// Run: node --test tests/today.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => readFileSync(join(root, 'app', 'src', 'js', f), 'utf8');
const clone = (o) => (o == null ? o : JSON.parse(JSON.stringify(o)));
// Results built inside the VM have its own prototypes; compare plain copies.
const plain = clone;

function merge(a, b) {
  const out = a && typeof a === 'object' && !Array.isArray(a) ? { ...a } : {};
  for (const [k, v] of Object.entries(b || {})) {
    if (v === null) delete out[k];
    else if (v && typeof v === 'object' && !Array.isArray(v)) out[k] = merge(out[k], v);
    else out[k] = v;
  }
  return out;
}

// The app's modules with a settable clock and an in-memory store (cards, profile, progress).
function load(seed = {}) {
  const docs = { cards: {}, profile: { prefs: { cap: 15, light: false }, days: {} }, progress: {}, ...clone(seed) };
  const ctx = vm.createContext({ console, document: { getElementById: () => null } });
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
    profile: { get: async () => clone(docs.profile), patch: async (p) => { docs.profile = merge(docs.profile, clone(p)); } },
    progress: {
      get: async (tid) => clone(docs.progress[tid]) || null,
      patch: async (tid, p) => { docs.progress[tid] = merge(docs.progress[tid] || {}, clone(p)); },
      all: async () => clone(docs.progress),
    },
    replacing: (old, neu) => neu,
    retryLater: (e) => e,
  };
  return { U, docs, at: (d) => ctx.__setNow(d) };
}

const iso = (d) => d.toISOString();
const card = (id, iid, extra = {}) => ({
  id, tid: 'tA', iid, type: 'choice', spec: { id: id.split('_')[1], type: 'choice', q: 'Q ' + id + '?', options: ['A', 'B'], answer: 0, why: 'w' },
  ...extra,
});

// ---------- finding 32: the study day turns over at 4 am ----------
test('the study day turns over at 4 am, not at midnight', () => {
  const { U } = load();
  assert.equal(U.studyDay(new Date(2026, 9, 5, 23, 55)), '2026-10-05');
  assert.equal(U.studyDay(new Date(2026, 9, 6, 0, 1)), '2026-10-05');
  assert.equal(U.studyDay(new Date(2026, 9, 6, 3, 59)), '2026-10-05');
  assert.equal(U.studyDay(new Date(2026, 9, 6, 4, 0)), '2026-10-06');
  // An ISO time from a card's history reads the same way.
  assert.equal(U.studyDay(new Date(2026, 9, 6, 1, 30).toISOString()), '2026-10-05');
  // Across a month end too.
  assert.equal(U.studyDay(new Date(2026, 10, 1, 2, 0)), '2026-10-31');
});

test('a card learned at 23:55 is not due at 00:01, only the next study day', async () => {
  const { U, docs, at } = load();
  at(new Date(2026, 9, 5, 23, 55));
  const lesson = { checks: [{ id: 'c1', type: 'choice', q: 'Which?', options: ['A', 'B'], answer: 0, why: 'w' }] };
  await U.review.addFromLesson('tA', 'i1', lesson, { checks: { c1: { correct: true } } });
  assert.equal(docs.cards.tA.cards.i1_c1.s.due, '2026-10-06');

  at(new Date(2026, 9, 6, 0, 1));
  assert.equal((await U.review._plan({})).due.length, 0, 'six minutes after learning it, nothing is due');
  at(new Date(2026, 9, 6, 3, 59));
  assert.equal((await U.review._plan({})).due.length, 0);
  at(new Date(2026, 9, 6, 4, 1));
  assert.equal((await U.review._plan({})).due.length, 1, 'due once the next study day begins');

  // The scheduler's own default day is the study day: an Again at 00:30 brings a card back the
  // next study day (from 4 am the day after), not three and a half hours later.
  at(new Date(2026, 9, 6, 0, 30));
  assert.equal(U.fsrs.init().due, '2026-10-06');
  assert.equal(U.fsrs.review({ due: '2026-10-05', stability: 30, difficulty: 5, reps: 5, lapses: 0, last: '2026-09-05' }, 1).due, '2026-10-06');
});

test('reviews either side of midnight count towards one day\'s cap and one light day', async () => {
  const day5 = (h, m) => iso(new Date(2026, 9, 5, h, m));
  const cards = {};
  // Two cards reviewed late on the 5th (one at 23:50, one at 00:10), three still due.
  cards.i1_c1 = card('i1_c1', 'i1', { s: { due: '2026-10-09', stability: 3, difficulty: 5, reps: 2, lapses: 0, last: '2026-10-05' }, hist: [{ at: day5(23, 50), grade: 3, ok: true }] });
  cards.i2_c1 = card('i2_c1', 'i2', { s: { due: '2026-10-09', stability: 3, difficulty: 5, reps: 2, lapses: 0, last: '2026-10-05' }, hist: [{ at: iso(new Date(2026, 9, 6, 0, 10)), grade: 3, ok: true }] });
  for (const k of ['i3_c1', 'i4_c1', 'i5_c1']) cards[k] = card(k, k.split('_')[0], { s: { due: '2026-10-05', stability: 3, difficulty: 5, reps: 1, lapses: 0, last: '2026-10-01' }, hist: [] });
  const { U, at } = load({ cards: { tA: { cards } }, profile: { prefs: { cap: 15, light: false, lightDay: '2026-10-05' }, days: {} } });
  at(new Date(2026, 9, 6, 0, 20));
  const p = await U.review._plan({});
  assert.equal(p.day, '2026-10-05');
  assert.equal(p.done, 2, 'both late reviews count for the 5th');
  assert.equal(p.cap, 5, 'the light day set before midnight still holds at 00:20');
  assert.equal(p.size, 3);
  at(new Date(2026, 9, 6, 9, 0));
  const q = await U.review._plan({});
  assert.equal(q.done, 0);
  assert.equal(q.cap, 15, 'the light day ends with its study day');
});

// ---------- finding 10: an unfinished Learn it again is not flagged again ----------
test('one more Again during an unfinished Learn it again does not flag the idea again', async () => {
  const now = new Date(2026, 9, 6, 12, 0), ago = (days) => iso(new Date(+now - days * 864e5));
  // Round 1 began 3 days ago (two Agains before it started it); Dan stopped half-way through the
  // new lesson, so the old round's card is still reviewed and keeps its old learnedAt.
  const hist = [{ at: ago(19), grade: 3, ok: true }, { at: ago(6), grade: 1, ok: false }, { at: ago(5), grade: 1, ok: false }, { at: ago(1), grade: 1, ok: false }];
  const seed = {
    cards: { tA: { cards: { i1_c1: card('i1_c1', 'i1', { learnedAt: ago(20), s: { due: '2026-10-06', stability: 0.5, difficulty: 8, reps: 4, lapses: 3, last: '2026-10-05' }, hist }) } } },
    progress: { tA: { ideas: { i1: { round: 1, stage: 'explain', againAt: ago(3), relearn: false } } } },
  };
  const { U, docs, at } = load(seed);
  at(now);
  assert.deepEqual(plain(await U.review.slipping()), [], 'only one Again since the new round began');
  await new Promise((r) => setTimeout(r, 10));
  assert.equal(docs.progress.tA.ideas.i1.relearn, false, 'the half-done round is left alone');

  // A second Again since the round began does make it slipping again (the contract).
  docs.cards.tA.cards.i1_c1.hist.push({ at: ago(0.1), grade: 1, ok: false });
  const list = plain(await U.review.slipping());
  assert.equal(list.length, 1);
  assert.equal(list[0].iid, 'i1');
  assert.equal(list[0].lapses, 2, 'counts the Agains since the round began');
  await new Promise((r) => setTimeout(r, 10));
  assert.equal(docs.progress.tA.ideas.i1.relearn, true);
});

test('an idea never learned again is slipping after two Agains in 30 days', async () => {
  const now = new Date(2026, 9, 6, 12, 0), ago = (days) => iso(new Date(+now - days * 864e5));
  const seed = { cards: { tA: { cards: {
    i1_c1: card('i1_c1', 'i1', { learnedAt: ago(40), s: { due: '2026-10-07', stability: 1, difficulty: 7, reps: 3, lapses: 2, last: '2026-10-05' }, hist: [{ at: ago(35), grade: 1 }, { at: ago(4), grade: 1 }, { at: ago(1), grade: 1 }] }),
    i2_c1: card('i2_c1', 'i2', { learnedAt: ago(40), s: { due: '2026-10-07', stability: 1, difficulty: 7, reps: 3, lapses: 2, last: '2026-10-05' }, hist: [{ at: ago(35), grade: 1 }, { at: ago(4), grade: 1 }] }),
  } } } };
  const { U, at } = load(seed);
  at(now);
  const list = plain(await U.review.slipping());
  assert.deepEqual(list.map((g) => [g.iid, g.lapses]), [['i1', 2]], 'the Again 35 days ago no longer counts');
});

// ---------- finding 30: an answer that lands while a plan's read is on its way ----------
// One card due today. Every read of the cards answers with what was stored when the read began,
// but only when the test lets it (a slow connection). save() writes the answer as the session does.
function racing() {
  const now = new Date(2026, 9, 6, 12, 0);
  const t = load({ cards: { tA: { cards: {
    i1_say: card('i1_say', 'i1', { s: { due: '2026-10-06', stability: 3, difficulty: 5, reps: 1, lapses: 0, last: '2026-10-02' }, hist: [{ at: iso(new Date(+now - 4 * 864e5)), grade: 3, ok: true }] }),
  } } } });
  t.at(now);
  const read = t.U.store.cards.all, waiting = [];
  t.U.store.cards.all = () => { const snap = read(); return new Promise((r) => waiting.push(() => r(snap))); };
  t.answerReads = () => waiting.splice(0).forEach((f) => f());
  t.save = () => {
    const c = t.docs.cards.tA.cards.i1_say;
    c.hist.push({ at: iso(now), grade: 3, ok: true });
    c.s = { ...c.s, due: '2026-10-09', last: '2026-10-06', reps: 2 };
  };
  t.card = { tid: 'tA', id: 'i1_say' };
  t.job = () => { let ok, no; const p = new Promise((a, b) => { ok = a; no = b; }); return { p, ok, no }; };
  return t;
}
const counts = (p) => ({ size: p.size, done: p.done });

test('a grade that lands while Today\'s plan is being read does not bring its card back', async () => {
  // Dan closes the review with a recall still being graded: Today's read begins, the grade lands,
  // then the read answers with the card as it was (still due, no answer today).
  const t = racing(), job = t.job();
  const held = t.U.review._hold(t.card, job.p);
  const reading = t.U.review._plan({});
  t.save(); job.ok({}); await held;
  t.answerReads();
  const p = await reading;
  assert.deepEqual(counts(p), { size: 0, done: 1 }, 'left out and counted as reviewed, as while it was on its way');
  // The Light day switch plans again from that same read: still left out.
  assert.deepEqual(counts(await t.U.review._plan({ light: true }, p.data)), { size: 0, done: 1 });
  // A read that begins after it landed sees the answer itself, and counts it once.
  const again = t.U.review._plan({});
  t.answerReads();
  assert.deepEqual(counts(await again), { size: 0, done: 1 });
});

test('an answer given and saved after a plan\'s read began is not offered by that plan', async () => {
  const t = racing(), job = t.job();
  const reading = t.U.review._plan({});
  const held = t.U.review._hold(t.card, job.p);
  t.save(); job.ok({}); await held;
  t.answerReads();
  assert.deepEqual(counts(await reading), { size: 0, done: 1 });
});

test('an answer still on its way, or one whose save failed, is counted as it stands', async () => {
  const t = racing(), job = t.job();
  const held = t.U.review._hold(t.card, job.p);
  const reading = t.U.review._plan({});
  t.answerReads();
  assert.deepEqual(counts(await reading), { size: 0, done: 1 }, 'still on its way: left out, counted as reviewed');
  // The save fails while the next read is on its way: nothing was written, so the card is due.
  const next = t.U.review._plan({});
  job.no(new Error('offline')); await held.catch(() => {});
  t.answerReads();
  assert.deepEqual(counts(await next), { size: 1, done: 0 }, 'a failed save leaves the card due');
});

// ---------- finding 33: the contract says what the code does ----------
test('ARCHITECTURE.md grades recall cards the way 41-cards.js does', () => {
  const { U } = load();
  const doc = readFileSync(join(root, 'docs', 'ARCHITECTURE.md'), 'utf8').replace(/\s+/g, ' ');
  const GRADE = { Again: 1, Hard: 2, Good: 3, Easy: 4 };
  const said = (verdict) => {
    const m = doc.match(new RegExp('Recall cards are graded by Claude[^.]*?' + verdict + ' = (Again|Hard|Good|Easy)'));
    assert.ok(m, 'section 8 names a grade for ' + verdict);
    return GRADE[m[1]];
  };
  // Claude's verdict, with and without "nailed": Claude never awards Easy.
  assert.equal(said('got-it'), U.cards.verdictGrade({ verdict: 'got-it', nailed: true }));
  assert.equal(said('got-it'), U.cards.verdictGrade({ verdict: 'got-it', nailed: false }));
  assert.equal(said('partly'), U.cards.verdictGrade({ verdict: 'partly' }));
  assert.equal(said('not-yet'), U.cards.verdictGrade({ verdict: 'not-yet' }));
  assert.ok(!/got-it = Easy/.test(doc), 'no leftover "got-it = Easy"');
});

// ---------- audit 51: one time for the same reviews ----------
// Learn's reviews row and Today give the same "About N minutes": U.review.outlook (Learn's source)
// carries Today's own estimate, from each card's type, for the session Today would start.
test('Learn and Today share one estimate for the same reviews (per card type)', async () => {
  const day = '2026-10-06';
  const due = (id, iid, type) => card(id, iid, { type, s: { due: day, stability: 3, difficulty: 5, reps: 1, lapses: 0, last: '2026-10-03' }, hist: [] });
  const cards = {
    i1_c1: due('i1_c1', 'i1', 'choice'), i2_c1: due('i2_c1', 'i2', 'choice'), i3_c3: due('i3_c3', 'i3', 'target'),
    i4_c1: due('i4_c1', 'i4', 'order'), i5_c1: due('i5_c1', 'i5', 'estimate'), i6_say: due('i6_say', 'i6', 'recall'),
  };
  const { U, at } = load({ cards: { tA: { cards } } });
  at(new Date(2026, 9, 6, 12, 0));
  const o = await U.review.outlook();
  assert.equal(o.size, 6);
  // 25 + 25 + 60 + 40 + 30 + 90 s = 4.5 minutes: "About 5 minutes" on both screens (Learn used to
  // say 3, at 25 s a card whatever its type).
  assert.equal(o.minutes, 5);
  // Nothing waiting: no time to give.
  const none = load({ cards: { tA: { cards: { i1_c1: card('i1_c1', 'i1', { s: { due: '2026-10-09', stability: 3, difficulty: 5, reps: 1, lapses: 0, last: day }, hist: [] }) } } } });
  none.at(new Date(2026, 9, 6, 12, 0));
  assert.equal((await none.U.review.outlook()).minutes, 0);
});

// ---------- v9: ideas read, not studied ("Just teach me") ----------
// A read lesson makes no cards (its round is marked readRound, and cardsRound so nothing makes
// them later). Cards left from an earlier, studied round of the same idea are never counted:
// not in Today's plan, the badge's count, the Map's bands or Learn it again; nor made again.
test('ideas finished as read lessons are never counted: Today, the badge, bands, slipping, mending', async () => {
  const day = '2026-10-06', ago = (d) => iso(new Date(2026, 9, 6 - d, 10, 0));
  const due = (id, iid, extra = {}) => card(id, iid, { learnedAt: ago(20), s: { due: day, stability: 3, difficulty: 5, reps: 1, lapses: 0, last: '2026-10-03' }, hist: [], ...extra });
  const slipped = [{ at: ago(3), grade: 1, ok: false }, { at: ago(2), grade: 1, ok: false }];
  const cards = { i1_c1: due('i1_c1', 'i1'), i2_c1: due('i2_c1', 'i2', { hist: slipped }), i2_say: due('i2_say', 'i2'), i3_c1: due('i3_c1', 'i3') };
  const progress = { tA: { ideas: {
    i1: { round: 0, stage: 'done', doneAt: ago(20), cardsRound: 0 },
    // Studied first (round 0, its cards above), then learned again as a read lesson (round 1).
    i2: { round: 1, stage: 'done', doneAt: ago(1), readRound: 1, cardsRound: 1, againAt: ago(2) },
    // Read in round 0, then started again as a study round (1): its cards count once it makes them.
    i3: { round: 1, stage: 'play', readRound: 0, againAt: ago(1) },
  } } };
  const { U, docs, at } = load({ cards: { tA: { cards } }, progress });
  at(new Date(2026, 9, 6, 12, 0));
  const o = await U.review.outlook();
  assert.equal(o.size, 2, 'Today counts i1 and i3, never the read idea i2');
  assert.equal(await U.review.dueCount(), 2, 'nor does the badge');
  const q = await U.review.queue({});
  assert.equal(q.map((c) => c.iid).sort().join(), 'i1,i3', 'a review never shows its cards');
  const bands = await U.review.ideaBands();
  assert.ok(!(bands.tA && bands.tA.i2), 'no strength band for a read idea: ' + JSON.stringify(bands));
  assert.equal((await U.review.slipping()).length, 0, 'never offered to learn again');
  // A read round whose progress never recorded its cards is left alone by mending.
  docs.progress.tA.ideas.i2.cardsRound = 0;
  U.store.lesson = { get: async () => { throw new Error('mending must not read a read idea\'s lesson'); } };
  assert.equal((await U.review.mendCards(true)).length, 0, 'nothing is made for a read idea');
  assert.ok(docs.cards.tA.cards.i2_say, 'and nothing of its is touched');
});
