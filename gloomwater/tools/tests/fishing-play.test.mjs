// Unit tests for the automatic play's planner (DESIGN §25.6.5, §25.14.2a F2′ test (a); CONTRACT §13.7 planPlay): src/fishing-play.js
// is pure, never sees a species, and plans durations, beats, glimpses, scares, last stands and leaps from class, z, the fitted
// tackle and a seed; the loss is chosen from the strike's two draws and always lands past half the plan.
//   node tools/tests/fishing-play.test.mjs   (or node tools/check.mjs; --verbose prints every passing check)
import { readFileSync } from 'node:fs';
import { AUTOFISH as A, BALANCE_V3 } from '../../src/data.js';
import { planPlay, chooseLoss, applyLoss, partPlan, presentAt, lossWeights, zBand, playClassOf, PLAY_CLASSES, mulberry32 } from '../../src/fishing-play.js';

let pass = 0, fail = 0;
const VERBOSE = process.argv.includes('--verbose');
function ok(cond, msg) { if (cond) { pass++; if (VERBOSE) console.log('  ok:', msg); } else { fail++; console.log('  FAIL:', msg); } }
const section = (s) => console.log(`- ${s}`);
const near = (a, b, eps) => Math.abs(a - b) <= eps;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const rng = mulberry32(99);
const zIn = (cls, u) => { const [lo, hi] = zBand(cls); return lo + (hi - lo) * (0.001 + 0.998 * u); };
const elderOf = (cls) => (cls === 'ancient' ? 'elder' : cls);

section('(a) the plan is a pure function of (class, z, seed, leapChance, tiers, place); it never reads a species');
{
  const allowed = new Set(['leapChance', 'tiers', 'place', 'legendId', 'A']);
  let bad = null;
  const opts = new Proxy({ leapChance: 0.3, tiers: 2, place: null }, { get(t, k) { if (typeof k === 'string' && !allowed.has(k)) bad = k; return t[k]; } });
  const a = planPlay('trophy', 2.2, 4242, opts), b = planPlay('trophy', 2.2, 4242, { leapChance: 0.3, tiers: 2, place: null });
  ok(same(a, b), 'the same inputs give the same plan, twice');
  ok(bad === null, `planPlay reads only its five inputs (read ${bad})`);
  ok(!same(planPlay('trophy', 2.2, 4243, { tiers: 2 }), a), 'another seed gives another plan');
  const code = readFileSync(new URL('../../src/fishing-play.js', import.meta.url), 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  ok(!/species|SPECIES|speciesId/.test(code), 'fishing-play.js names no species field in code');
  ok(!/Math\.random/.test(code), 'no Math.random: every draw comes from the seed');
}

section('durations: in §25.6.5\'s band per class (× U(0.92, 1.08)), lengthening with z, −5% per mean fitted tier');
{
  const J = A.play.jitter, T = A.play.tackle.durPerTier;
  for (const cls of PLAY_CLASSES) {
    const P = A.play[cls];
    let inBand = 0, mono = 0, tierOk = 0;
    const n = 1000;
    for (let i = 0; i < n; i++) {
      const seed = 1 + i * 7919, u = rng();
      const z = zIn(cls, u), z2 = zIn(cls, Math.min(1, u + 0.2));
      const p0 = planPlay(elderOf(cls), z, seed, {});
      if (p0.sizeClass === cls && p0.dur >= P.dur[0] * J[0] - 1e-6 && p0.dur <= P.dur[1] * J[1] + 1e-6) inBand++;
      if (planPlay(elderOf(cls), z2, seed, {}).dur >= p0.dur - 1e-4) mono++;
      const t = (i % 5);
      if (near(planPlay(elderOf(cls), z, seed, { tiers: t }).dur, p0.dur * (1 + T * t), 2e-4)) tierOk++;
    }
    ok(inBand === n, `${cls}: every play ${P.dur[0]}–${P.dur[1]} s × jitter (${inBand}/${n})`);
    ok(mono === n, `${cls}: a bigger z never plays shorter on the same seed (${mono}/${n})`);
    ok(tierOk === n, `${cls}: each mean fitted tier shortens the play by 5% (${tierOk}/${n})`);
  }
  ok(planPlay('elder', 3.3, 5, {}).sizeClass === 'ancient' && playClassOf(3.3) === 'ancient' && playClassOf(2.9) === 'elder', 'an Elder past the Ancient threshold plays as an Ancient');
  ok(near(planPlay('trophy', 2.2, 5, { tiers: { rod: 4, line: 2, reel: 0 } }).dur, planPlay('trophy', 2.2, 5, { tiers: 2 }).dur, 1e-9), 'tiers {rod, line, reel} use the mean fitted tier');
  ok(planPlay('trophy', 2.2, 5, { tiers: 4 }).bend < planPlay('trophy', 2.2, 5, { tiers: 0 }).bend - 0.159, 'a T4 play\'s rod bend is 0.16 lower than a T0 play\'s');
}

section('the beats: contiguous from the take to the lift; the lift covers [≤ 0.88, 1]; counts by class; last stands and the still');
{
  let contiguous = 0, lift = 0, counts = 0, ls = 0, n = 0, still = 0, stillN = 0;
  for (const cls of PLAY_CLASSES) for (let i = 0; i < 300; i++) {
    const p = planPlay(elderOf(cls), zIn(cls, rng()), 100 + i * 31, { tiers: i % 5 });
    n++;
    const B = p.beats;
    if (B[0].phase === 'take' && B[0].t0 === 0 && B.every((b, j) => j === 0 || near(b.t0, B[j - 1].t1, 2e-4)) && near(B[B.length - 1].t1, p.dur, 1e-6)) contiguous++;
    const L = B[B.length - 1];
    if (L.phase === 'lift' && L.t0 <= 0.88 * p.dur + 1e-3) lift++;
    const P = A.play[cls];
    const runs = new Set(B.filter((b) => b.phase === 'run').map((b) => b.t0)).size;
    const g = p.events.filter((e) => e.phase === 'glimpse' && e.kind !== 'skitter').length, sc = p.events.filter((e) => e.phase === 'scare').length;
    if (g >= P.glimpses[0] && g <= P.glimpses[1] && sc >= A.play.scare[cls][0] && sc <= A.play.scare[cls][1] && (cls !== 'small' || runs === 0)) counts++;
    const want = A.play.lastStandAt[cls] || [];
    if (p.lastStands.length === (P.lastStand || 0) && p.lastStands.every(([t0], j) => t0 >= want[j][0] * p.dur - 1e-3 && t0 <= want[j][1] * p.dur + 1e-3)) ls++;
    if (cls === 'ancient') { stillN++; if (p.still && near(p.still[1] - p.still[0], 1.5, 1e-3) && p.still[0] >= p.lastStands[0][1] - 1e-3 && near(p.still[1], p.lastStands[1][0], 1e-3)) still++; }
  }
  ok(contiguous === n, `every plan's beats run contiguously from 0 to its length (${contiguous}/${n})`);
  ok(lift === n, `the lift starts by 0.88 of the plan, after the latest possible spat (${lift}/${n})`);
  ok(counts === n, `glimpses and scares by class; a Small has no runs (${counts}/${n})`);
  ok(ls === n, `last stands: Elder 1 at 55–70%, Ancient 2 at 55–65% and 80–88% (${ls}/${n})`);
  ok(still === stillN, `an Ancient's still: 1.5 s, just before its second last stand (${still}/${stillN})`);
  const sm = planPlay('small', -1, 3, {});
  ok(sm.events.length === 1 && sm.events[0].kind === 'skitter' && near(sm.events[0].at, sm.beats[sm.beats.length - 1].t0, 1e-6) && sm.firstGlimpse === sm.events[0].at, 'a Small shows itself only as the skitter at the lift (the class estimate stamps there)');
  const kp = planPlay('keeper', 0.5, 3, {});
  const g0 = kp.events.find((e) => e.phase === 'glimpse');
  ok(g0 && g0.at >= 0.7 * kp.dur - 1e-3 && g0.at <= 0.85 * kp.dur + 1e-3, 'a Keeper\'s glimpse: a swirl near the raft at 70–85%');
  const el = planPlay('elder', 2.9, 3, {});
  ok(el.events.some((e) => e.phase === 'glimpse' && e.kind === 'pass') && el.pass, 'an Elder\'s glimpses include the pass under the raft');
  const pl = planPlay('prize', 1.5, 3, { place: 'under_the_span' });
  ok(pl.beats.some((b) => b.phase === 'place' && b.kind === 'grind') && !planPlay('prize', 1.5, 3, {}).beats.some((b) => b.phase === 'place'), 'a place\'s beat (the Span\'s grind) replaces one gain');
}

section('leaps: per species only the chance; counts from the one class table (± 3% over 5,000 plays); each at 15–85%, ≥ 12% apart');
{
  for (const cls of ['keeper', 'prize', 'trophy', 'elder', 'ancient']) {
    const N = 5000, hist = {};
    let inWin = 0, gaps = 0, total = 0;
    for (let i = 0; i < N; i++) {
      const p = planPlay(elderOf(cls), zIn(cls, rng()), 7 + i * 13, { leapChance: 1 });
      hist[p.leapCount] = (hist[p.leapCount] || 0) + 1;
      const at = p.events.filter((e) => e.phase === 'leap').map((e) => e.at / p.dur);
      total += at.length;
      if (at.every((f) => f >= 0.15 - 1e-3 && f <= 0.85 + 1e-3)) inWin++;
      if (at.every((f, j) => j === 0 || f - at[j - 1] >= 0.12 - 1e-3)) gaps++;
    }
    const want = A.leap.count[cls];
    ok(want.every(([c, pr]) => near((hist[c] || 0) / N, pr, 0.03)), `${cls}: ${Object.entries(hist).map(([c, v]) => `${c}×${(100 * v / N).toFixed(1)}%`).join(' ')} ≈ ${want.map(([c, pr]) => `${c}×${pr * 100}%`).join(' ')}`);
    ok(inWin === N && gaps === N, `${cls}: every leap inside 15–85% of the play (${inWin}/${N}), ≥ 12% apart (${gaps}/${N})`);
  }
  let never = 0, smallNever = 0, share = 0;
  for (let i = 0; i < 1000; i++) {
    if (planPlay('trophy', 2.2, 11 + i, { leapChance: 0 }).leapCount === 0) never++;
    if (planPlay('small', -1, 11 + i, { leapChance: 1 }).leapCount === 0) smallNever++;
    if (planPlay('prize', 1.5, 900 + i * 3, { leapChance: 0.3 }).leapCount > 0) share++;
  }
  ok(never === 1000, `a species with no leaps entry (chance 0) never leaps in 1,000 plays (${never})`);
  ok(smallNever === 1000, `a Small never leaps (it skitters) (${smallNever})`);
  ok(near(share / 1000, 0.3, 0.04), `a 0.30 leaper leaps in ${(share / 10).toFixed(1)}% of its plays`);
  // the leap chance shifts nothing else: the same seed with another chance is the same plan but its leaps
  let rest = 0;
  for (let i = 0; i < 500; i++) {
    const a = planPlay('trophy', 2.1, 50 + i, { leapChance: 0.05 }), b = planPlay('trophy', 2.1, 50 + i, { leapChance: 0.95 });
    const strip = (p) => ({ ...p, events: p.events.filter((e) => e.phase !== 'leap'), leapCount: 0, leaps: 0 });
    if (same(strip(a), strip(b))) rest++;
  }
  ok(rest === 500, `two leap chances on one seed: identical plans but their leaps (${rest}/500)`);
}

section('the loss: always past half the plan; causes by class and style; on a leap or a scare by loss.onLeap / onScare');
{
  let past = 0, n = 0, smallOk = 0, smallN = 0, noSpool = 0, noSpoolN = 0, inWin = 0, winN = 0;
  for (const cls of PLAY_CLASSES) for (let i = 0; i < 2000; i++) {
    const p = planPlay(elderOf(cls), zIn(cls, rng()), 300 + i * 17, { leapChance: 0.4 });
    const style = ['leaper', 'runner', 'thrasher', 'sinker', 'sulker', 'steady', 'darter'][i % 7];
    const L = chooseLoss(p, { style, grade: ['clean', 'struck', 'early', 'late'][i % 4], foul: i % 9 === 0, leaper: style === 'leaper', causeU: rng(), momentU: rng() });
    n++; if (L.at >= 0.5 * p.dur - 1e-6 && L.frac >= 0.5 - 1e-6) past++;
    if (cls === 'small' || cls === 'keeper') { smallN++; if (['spat', 'thrown', 'fouled'].includes(L.cause)) smallOk++; }
    if (cls === 'prize' || cls === 'trophy') { noSpoolN++; if (L.cause !== 'spooled') noSpool++; }
    if (L.on === 'beat') { winN++; const w = A.loss.at[L.cause]; if (L.frac >= Math.max(0.5, w[0]) - 1e-3 && L.frac <= w[1] + 1e-3) inWin++; }
  }
  ok(past === n, `every loss lands at ≥ 0.5 of the plan (${past}/${n})`);
  ok(smallOk === smallN, `Small and Keeper lose only by spat or thrown (or the chains at a foul place) (${smallOk}/${smallN})`);
  ok(noSpool === noSpoolN, `a Prize or Trophy is never spooled (${noSpool}/${noSpoolN})`);
  ok(inWin === winN, `an ordinary loss lands inside its cause's window (${inWin}/${winN})`);
  const w = lossWeights('leaper', 'trophy', 'struck'), we = lossWeights('leaper', 'trophy', 'early');
  ok(near(Object.values(w).reduce((a, b) => a + b, 0), 1, 1e-9) && we.spat > w.spat * 1.7, `a mistimed strike doubles the spat weight (${w.spat.toFixed(3)} → ${we.spat.toFixed(3)})`);
  ok(lossWeights('runner', 'elder').spooled > 0.5 && lossWeights('thrasher', 'elder').snapped > 0.5 && lossWeights('leaper', 'elder').thrown > 0.5, 'the cause follows the slot the fish tests: runners spool, thrashers snap, leapers throw');
  // foul places: half of losses; on a leap: 60% leapers / 35% others; on a scare: 40%
  const p = planPlay('trophy', 2.2, 77, { leapChance: 1 });
  const lateLeap = p.events.some((e) => e.phase === 'leap' && e.at >= 0.5 * p.dur && e.at <= 0.9 * p.dur);
  let fouled = 0, onLeapL = 0, onLeapO = 0;
  const N = 20000;
  for (let i = 0; i < N; i++) {
    if (chooseLoss(p, { style: 'steady', foul: true, causeU: rng(), momentU: rng() }).cause === 'fouled') fouled++;
    if (chooseLoss(p, { style: 'leaper', leaper: true, causeU: rng(), momentU: rng() }).on === 'leap') onLeapL++;
    if (chooseLoss(p, { style: 'steady', leaper: false, causeU: rng(), momentU: rng() }).on === 'leap') onLeapO++;
  }
  ok(near(fouled / N, 0.5, 0.02), `at a foul place ${(100 * fouled / N).toFixed(1)}% of losses are fouled (half)`);
  ok(lateLeap && near(onLeapL / N, 0.6, 0.02) && near(onLeapO / N, 0.35, 0.02), `a second-half leap throws the hook on the leap: leapers ${(100 * onLeapL / N).toFixed(1)}%, others ${(100 * onLeapO / N).toFixed(1)}%`);
  let ps = null;
  for (let s = 1; s < 500 && !ps; s++) { const q = planPlay('trophy', 2.2, s, { leapChance: 0 }); if (q.events.some((e) => e.phase === 'scare' && e.at >= 0.5 * q.dur && e.at <= 0.9 * q.dur)) ps = q; }
  let onScare = 0;
  for (let i = 0; i < N; i++) if (chooseLoss(ps, { style: 'steady', causeU: rng(), momentU: rng() }).on === 'scare') onScare++;
  ok(near(onScare / N, 0.4, 0.02), `a scare in the loss window takes the loss ${(100 * onScare / N).toFixed(1)}% of the time (40%)`);
}

section('outcome-blind: on one seed a landed and a lost play are identical up to the loss; the cut plan keeps everything before it');
{
  let blind = 0, n = 0;
  for (const cls of PLAY_CLASSES) for (let i = 0; i < 300; i++) {
    const p = planPlay(elderOf(cls), zIn(cls, rng()), 500 + i, { leapChance: 0.5, tiers: i % 5 });
    const L = chooseLoss(p, { style: 'leaper', leaper: true, causeU: rng(), momentU: rng() });
    const q = applyLoss(p, L);
    n++;
    const before = (pl) => pl.beats.filter((b) => b.t0 < L.at - 1e-9);   // bit for bit: the interrupted beat keeps its planned end
    let same1 = same(before(p), before(q)) && same(p.events.filter((e) => e.at < L.at - 1e-9), q.events);
    for (let t = 0; t < L.at && same1; t += 0.05) { const a = presentAt(p, t), b = presentAt(q, t); if (a.phase !== b.phase || a.k !== b.k || a.line !== b.line || a.bend !== b.bend || a.beatK !== b.beatK) same1 = false; }
    if (same1 && q.end === Math.round((L.at + L.dur) * 1e4) / 1e4 && q.beats[q.beats.length - 1].phase === 'loss') blind++;
  }
  ok(blind === n, `identical presentation up to the loss, then the loss beat (${blind}/${n})`);
  const p = planPlay('trophy', 2.2, 9, {});
  const q = partPlan(p, 1.2);
  ok(q.loss.cause === 'staggered' && q.loss.at === 1.2 && q.beats[q.beats.length - 1].phase === 'loss', 'partPlan: an outside end (staggered) at once, wherever the play is');
}

section('presentation: the fish comes in to the scoop; the line and the rod by beat; legends\' authored plays');
{
  const p = planPlay('elder', 2.9, 21, { leapChance: 1, tiers: 1 });
  const a = presentAt(p, 0), z = presentAt(p, p.dur);
  ok(near(a.k, 0, 1e-9) && near(z.k, 1, 1e-9) && z.done, 'k runs from 0 at the take to 1 at the scoop');
  let range = true;
  for (let t = 0; t <= p.dur; t += 0.1) { const s = presentAt(p, t); if (!(s.line >= 0 && s.line <= 1 && s.bend <= p.bend + 1e-9 && s.k >= 0 && s.k <= 1)) range = false; }
  ok(range, 'line 0–1, bend ≤ the plan\'s maximum, k 0–1 everywhere');
  const ls = p.lastStands[0];
  ok(presentAt(p, (ls[0] + ls[1]) / 2).phase === 'lastStand' && presentAt(p, (ls[0] + ls[1]) / 2).line === 1, 'the last stand: the line at its hardest');
  for (const [id, L] of Object.entries(A.legendPlays)) {
    const lp = planPlay('legend', 0, 3, { legendId: id });
    ok(lp.dur === L.dur && lp.legend === id && lp.sizeClass === 'legend' && same(lp.events.filter((e) => e.phase === 'leap').map((e) => e.at / lp.dur).map((v) => Math.round(v * 100) / 100), (L.leaps || []).map((v) => Math.round(v * 100) / 100)), `${id}: an authored ${L.dur} s play, leaps at ${(L.leaps || []).join(', ') || 'none'}`);
  }
  const sw = planPlay('legend', 0, 3, { legendId: 'lantern_swallower' });
  ok(sw.beats.filter((b) => b.kind === 'graspingDark').length === 2 && sw.still && sw.lastStands.length === 1, 'the Lantern-Swallower: two staged Grasping Dark beats, the still and a last stand');
}

console.log(`fishing-play: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
