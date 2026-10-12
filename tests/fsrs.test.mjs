// Unit tests for the FSRS-4.5 scheduler (app/src/js/40-fsrs.js) and the review queue's
// interleaving (60-today.js). Loads the plain app scripts into a vm context where window = globalThis.
// Run: node --test tests/fsrs.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => readFileSync(join(root, 'app', 'src', 'js', f), 'utf8');

function load(files = ['00-core.js', '40-fsrs.js']) {
  const ctx = vm.createContext({ console });
  vm.runInContext('var window = globalThis;', ctx);
  vm.runInContext('"use strict";\n' + files.map(src).join('\n'), ctx, { filename: files.join('+') });
  return ctx.U;
}

const U = load();
const F = U.fsrs;
const W = F.params.w;
const ivl = (s) => U.daysBetween(s.last, s.due);
const ids = Array.from({ length: 60 }, (_, i) => 'i' + (i % 7) + '_c' + i);

test('a new card is due the day after it is made, and has no strength yet', () => {
  const s = F.init('2026-10-05');
  assert.equal(s.due, '2026-10-06');
  assert.equal(s.reps, 0);
  assert.equal(s.lapses, 0);
  assert.equal(s.last, null);
  assert.equal(F.retrievability(s, '2026-10-06'), 0);
  assert.equal(F.band(s, '2026-10-06'), 'new');
  assert.equal(F.band(null, '2026-10-06'), 'new');
});

test('first review uses the published initial stability and difficulty', () => {
  const day = '2026-10-06';
  for (const g of [1, 2, 3, 4]) {
    const s = F.review(F.init('2026-10-05'), g, day, 'card');
    assert.equal(s.stability, Math.round(W[g - 1] * 100) / 100, 'S0 for grade ' + g);
    const d0 = Math.min(10, Math.max(1, W[4] - (g - 3) * W[5]));
    assert.equal(s.difficulty, Math.round(d0 * 100) / 100, 'D0 for grade ' + g);
    assert.equal(s.reps, 1);
    assert.equal(s.last, day);
  }
});

test('first review intervals: Again and Hard tomorrow, Good about 4 days, Easy about 2 weeks', () => {
  for (const id of ids) {
    const p = F.preview(F.init('2026-10-05'), '2026-10-06', id);
    assert.equal(p[1].interval, 1);
    assert.equal(p[2].interval, 1);
    assert.ok(p[3].interval >= 3 && p[3].interval <= 5, 'good ' + p[3].interval);
    assert.ok(p[4].interval >= 12 && p[4].interval <= 16, 'easy ' + p[4].interval);
  }
});

test('fuzz is deterministic per card id and spreads cards apart', () => {
  const a = F.review(F.init('2026-10-05'), 4, '2026-10-06', 'i1_c1');
  const b = F.review(F.init('2026-10-05'), 4, '2026-10-06', 'i1_c1');
  assert.deepEqual(a, b);
  const spread = new Set(ids.map((id) => F.review(F.init('2026-10-05'), 4, '2026-10-06', id).due));
  assert.ok(spread.size >= 3, 'easy intervals should vary across cards, got ' + [...spread]);
});

test('a follow-up review matches the FSRS-4.5 recall formula', () => {
  const s1 = F.review(F.init('2026-10-05'), 3, '2026-10-06', 'x');
  const t = 4, day = U.addDays('2026-10-06', t);
  const s2 = F.review(s1, 3, day, 'x');
  const R = Math.pow(1 + (19 / 81) * t / s1.stability, -0.5);
  const expectS = s1.stability * (1 + Math.exp(W[8]) * (11 - s1.difficulty) * Math.pow(s1.stability, -W[9]) * (Math.exp((1 - R) * W[10]) - 1));
  assert.ok(Math.abs(s2.stability - expectS) < 0.01, s2.stability + ' vs ' + expectS);
  const d1 = s1.difficulty, d0g = W[4];
  const expectD = W[7] * d0g + (1 - W[7]) * (d1 - W[6] * 0);
  assert.ok(Math.abs(s2.difficulty - expectD) < 0.01);
  assert.ok(ivl(s2) > ivl(s1));
});

test('steady Good answers make intervals grow and stability climb', () => {
  for (const id of ['a', 'b', 'c']) {
    let s = F.init('2026-01-01'), day = s.due, prev = 0, prevS = 0;
    for (let n = 0; n < 8; n++) {
      s = F.review(s, 3, day, id);
      assert.ok(s.stability > prevS, 'stability grows');
      assert.ok(ivl(s) >= prev, `interval ${ivl(s)} after ${prev}`);
      prev = ivl(s); prevS = s.stability; day = s.due;
    }
    assert.ok(prev > 60, 'after 8 good reviews the gap is over two months, got ' + prev);
  }
});

test('Hard <= Good < Easy for review cards in many states', () => {
  let s = F.init('2026-01-01'), day = s.due;
  for (let n = 0; n < 12; n++) {
    for (const extra of [0, 3, 20]) {
      const d = U.addDays(day, extra);
      for (const id of ids.slice(0, 15)) {
        const p = F.preview(s, d, id);
        assert.ok(p[2].interval <= p[3].interval, 'hard <= good');
        assert.ok(p[3].interval < p[4].interval || p[4].interval === 365, 'good < easy');
        assert.equal(p[1].interval, 1, 'again is tomorrow');
      }
    }
    s = F.review(s, n % 3 === 2 ? 2 : 3, day, 'z');
    day = s.due;
  }
});

test('a lapse brings the card back tomorrow, lowers stability and raises difficulty', () => {
  let s = F.init('2026-01-01'), day = s.due;
  for (let n = 0; n < 4; n++) { s = F.review(s, 3, day, 'l'); day = s.due; }
  const before = s;
  const after = F.review(s, 1, day, 'l');
  assert.equal(after.due, U.addDays(day, 1));
  assert.equal(after.lapses, before.lapses + 1);
  assert.equal(after.reps, before.reps + 1);
  assert.ok(after.stability < before.stability, `${after.stability} < ${before.stability}`);
  assert.ok(after.difficulty > before.difficulty);
  // forgetting a new card on its first review counts as a lapse too (Dan already answered it once)
  assert.equal(F.review(F.init('2026-01-01'), 1, '2026-01-02', 'n').lapses, 1);
  // relearning after a lapse grows again
  const back = F.review(after, 3, after.due, 'l');
  assert.ok(ivl(back) >= 2);
});

test('post-lapse stability never exceeds the stability before it', () => {
  const s = { due: '2026-01-02', stability: 0.3, difficulty: 9, reps: 3, lapses: 1, last: '2026-01-01' };
  const a = F.review(s, 1, '2026-01-02', 'q');
  assert.ok(a.stability <= 0.3);
});

test('intervals are capped at 365 days', () => {
  let s = F.init('2026-01-01'), day = s.due, maxSeen = 0;
  for (let n = 0; n < 15; n++) {
    s = F.review(s, 4, day, 'cap');
    maxSeen = Math.max(maxSeen, ivl(s));
    assert.ok(ivl(s) <= 365, 'interval ' + ivl(s));
    day = s.due;
  }
  assert.ok(maxSeen >= 340, 'reaches the cap (fuzz may land a few days short): ' + maxSeen);
  assert.ok(s.stability > 365);
  // without fuzz room above the cap, the scheduler never exceeds it for any card id
  for (const id of ids) assert.ok(ivl(F.review(s, 4, day, id)) <= 365);
  // even a review long overdue cannot schedule past the cap
  const late = F.review(s, 4, U.addDays(s.due, 900), 'cap');
  assert.ok(ivl(late) <= 365);
});

test('retrievability is 90% at t = stability and fades with time', () => {
  const s = { due: '2026-01-11', stability: 10, difficulty: 5, reps: 2, lapses: 0, last: '2026-01-01' };
  assert.equal(F.retrievability(s, '2026-01-01'), 1);
  assert.ok(Math.abs(F.retrievability(s, '2026-01-11') - 0.9) < 1e-9);
  assert.ok(F.retrievability(s, '2026-02-01') < F.retrievability(s, '2026-01-15'));
  assert.ok(F.retrievability(s, '2025-12-25') === 1, 'a review date in the past is clamped to t = 0');
});

test('bands: new, fragile, growing, strong', () => {
  const day = '2026-03-01';
  assert.equal(F.band(F.review(F.init(day), 1, day, 'b'), day), 'fragile');
  assert.equal(F.band(F.review(F.init(day), 2, day, 'b'), day), 'fragile');
  assert.equal(F.band(F.review(F.init(day), 3, day, 'b'), day), 'growing');
  let s = F.init(day), d = s.due;
  for (let n = 0; n < 4; n++) { s = F.review(s, 3, d, 'b'); d = s.due; }
  assert.ok(s.stability >= 21);
  assert.equal(F.band(s, s.last), 'strong');
  assert.equal(F.band(s, U.addDays(s.last, Math.round(s.stability * 12))), 'fragile', 'long neglect fades to fragile');
  const mid = { due: '2026-03-05', stability: 6, difficulty: 5, reps: 2, lapses: 0, last: '2026-03-01' };
  assert.equal(F.band(mid, '2026-03-03'), 'growing');
});

test('day arithmetic across month, year and leap-day boundaries', () => {
  assert.equal(F.init('2026-01-31').due, '2026-02-01');
  assert.equal(F.init('2026-12-31').due, '2027-01-01');
  assert.equal(F.init('2028-02-28').due, '2028-02-29');
  assert.equal(F.init('2027-02-28').due, '2027-03-01');
  const y = F.review(F.init('2026-12-29'), 4, '2026-12-30', 'yr');
  assert.ok(y.due > '2027-01-10' && y.due < '2027-01-20', y.due);
  assert.equal(U.daysBetween('2026-12-30', y.due), ivl(y));
  // elapsed time is measured across the year end
  const s = { due: '2027-01-10', stability: 21, difficulty: 5, reps: 3, lapses: 0, last: '2026-12-20' };
  assert.ok(Math.abs(F.retrievability(s, '2027-01-10') - 0.9) < 1e-9);
});

test('day arithmetic survives daylight-saving changes in several time zones', () => {
  const saved = process.env.TZ;
  try {
    for (const tz of ['Europe/London', 'America/Sao_Paulo', 'America/New_York', 'Australia/Lord_Howe', 'Pacific/Apia']) {
      process.env.TZ = tz;
      const Z = load();
      for (const [a, n, b] of [['2026-03-28', 1, '2026-03-29'], ['2026-03-29', 1, '2026-03-30'], ['2026-10-24', 2, '2026-10-26'],
        ['2026-11-01', 1, '2026-11-02'], ['2026-03-08', 1, '2026-03-09'], ['2026-04-05', 1, '2026-04-06'], ['2026-10-04', 1, '2026-10-05']]) {
        assert.equal(Z.addDays(a, n), b, `${tz}: ${a} + ${n}`);
        assert.equal(Z.daysBetween(a, b), n, `${tz}: ${a} -> ${b}`);
      }
      const s = Z.fsrs.review(Z.fsrs.init('2026-03-27'), 3, '2026-03-28', 'dst');
      assert.equal(Z.daysBetween('2026-03-28', s.due), Z.daysBetween(s.last, s.due));
    }
  } finally {
    if (saved === undefined) delete process.env.TZ; else process.env.TZ = saved;
  }
});

test('bad grades fall back sensibly', () => {
  const s = F.init('2026-01-01');
  assert.equal(F.review(s, 0, '2026-01-02', 'g').stability, F.review(s, 1, '2026-01-02', 'g').stability);
  assert.equal(F.review(s, 9, '2026-01-02', 'g').stability, F.review(s, 4, '2026-01-02', 'g').stability);
  assert.equal(F.review(s, 'x', '2026-01-02', 'g').stability, F.review(s, 3, '2026-01-02', 'g').stability);
  assert.equal(F.review(null, 3, '2026-01-02', 'g').reps, 1, 'a missing state is treated as new');
});

// ---------- queue interleaving (pure part of 60-today.js) ----------
const Q = (() => {
  const ctx = vm.createContext({ console });
  vm.runInContext('var window = globalThis;', ctx);
  vm.runInContext('"use strict";\n' + ['00-core.js', '40-fsrs.js', '60-today.js'].map(src).join('\n'), ctx);
  return ctx.U;
})();
const card = (tid, iid, n) => ({ id: iid + '_c' + n, tid, iid });
const keyOf = (c) => c.tid + '/' + c.iid;

test('interleaving never puts the same idea twice in a row when avoidable', () => {
  const list = [card('a', 'i1', 1), card('a', 'i1', 2), card('a', 'i1', 3), card('a', 'i2', 1), card('b', 'i1', 1), card('b', 'i3', 1)];
  const out = Q.review._interleave(list);
  assert.equal(out.length, list.length);
  for (let i = 1; i < out.length; i++) assert.notEqual(keyOf(out[i]), keyOf(out[i - 1]), 'repeat at ' + i);
});

test('interleaving alternates topics and keeps the most urgent card first', () => {
  const list = [card('a', 'i1', 1), card('a', 'i2', 1), card('a', 'i3', 1), card('b', 'i1', 1), card('b', 'i2', 1), card('b', 'i3', 1)];
  const out = Q.review._interleave(list);
  assert.equal(out[0].id, 'i1_c1');
  assert.equal(out[0].tid, 'a');
  assert.deepEqual(Array.from(out, (c) => c.tid), ['a', 'b', 'a', 'b', 'a', 'b']);
});

test('interleaving stays feasible when one idea dominates', () => {
  // 3 cards of one idea, 2 others: only A x A x A works
  const list = [card('a', 'i1', 1), card('a', 'i1', 2), card('a', 'i1', 3), card('a', 'i2', 1), card('a', 'i3', 1)];
  const out = Q.review._interleave(list);
  for (let i = 1; i < out.length; i++) assert.notEqual(keyOf(out[i]), keyOf(out[i - 1]));
  // only one idea at all: repeats are unavoidable, but nothing is lost
  assert.equal(Q.review._interleave([card('a', 'i1', 1), card('a', 'i1', 2)]).length, 2);
});

test('interleaving is valid for many random mixes', () => {
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let t = 0; t < 300; t++) {
    const n = 1 + Math.floor(rnd() * 15), list = [];
    for (let i = 0; i < n; i++) list.push(card('t' + Math.floor(rnd() * 3), 'i' + Math.floor(rnd() * 4), i));
    const out = Q.review._interleave(list);
    assert.equal(out.length, n);
    const counts = {};
    list.forEach((c) => { counts[keyOf(c)] = (counts[keyOf(c)] || 0) + 1; });
    const maxGroup = Math.max(...Object.values(counts));
    const possible = maxGroup <= Math.ceil(n / 2);
    if (possible) for (let i = 1; i < n; i++) assert.notEqual(keyOf(out[i]), keyOf(out[i - 1]), JSON.stringify(list.map(keyOf)) + ' -> ' + JSON.stringify(out.map(keyOf)));
  }
});
