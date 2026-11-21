// WC-2 (WATERCRAFT §6): silhouettes, pure rules from src/fishing-sight.js on the loop's data.
//   node tools/tests/fishing-sight.test.mjs [--verbose]
// Where (never at depth ≥ 0.45 nor in the deep, open water, the drop-off, a lane or Under the Span; none in mist or quiet water), which
// fish (never a giant, the legend, the sturgeon, the trout or the eel), how big (its true length, sizeLength), how far (its length's
// band, its own 3–5 m off the raft), the night (opacity follows the lantern's intensity; none spawns under 0.25), the lead window, the
// spook disc, the still fish's window, the take by grade over 20,000 trials (45 / 55 / 65%, a stray 1%), the pike's holds, the caps,
// and the fx budget (≤ 20 instances, one per silhouette).
if (typeof globalThis.document === 'undefined') {
  const ctx2d = new Proxy({}, { get: (t, k) => (k === 'createImageData' ? (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h })
    : k === 'createRadialGradient' || k === 'createLinearGradient' ? () => ({ addColorStop() {} }) : k === 'measureText' ? () => ({ width: 40 }) : () => {}), set: () => true });
  globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx2d, style: {} }) };
}
import { loadLoopData } from './loop-fixture.mjs';
import * as SI from '../../src/fishing-sight.js';

const D = await loadLoopData();
let WC = null;
try { WC = await import('../../src/watercraft.js'); } catch { WC = null; }

let pass = 0, fail = 0;
const VERBOSE = process.argv.includes('--verbose');
function ok(cond, msg) { if (cond) { pass++; if (VERBOSE) console.log('  ok:', msg); } else { fail++; console.log('  FAIL:', msg); } }
const section = (s) => console.log(`- ${s}`);
const near = (a, b, eps) => Math.abs(a - b) <= eps;
function mul(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const SP = (id) => D.SPECIES.find((s) => s.id === id);

section('where a fish can be seen (§6.1)');
{
  for (const area of ['deep', 'open', 'dropoff', 'lane', 'under_the_span', 'outflow', 'bell_pool']) {
    let any = 0;
    for (const light of ['day', 'dusk', 'night']) for (let d = 0.05; d < 1; d += 0.05) if (SI.visibleAt({ area, depth: d, light, raftDist: 2 }) > 0) any++;
    ok(any === 0, `never in ${area}`);
  }
  for (const area of ['margin', 'pads', 'stones', 'inflow', 'reeds', 'lily_maze']) {
    ok(SI.visibleAt({ area, depth: 0.3, light: 'day' }) === 1 && SI.visibleAt({ area, depth: 0.45, light: 'day' }) === 0 && SI.visibleAt({ area, depth: 0.6, light: 'day' }) === 0,
      `${area}: seen at 0.30, never at 0.45 or deeper`);
  }
  ok(SI.visibleAt({ area: 'reeds', depth: 0.1, light: 'day' }) === 0, 'reeds: only the outer edge');
  ok(SI.visibleAt({ area: 'margin', depth: 0.3, light: 'dusk' }) < 1, 'fainter at dusk');
  ok(SI.visibleAt({ area: 'margin', depth: 0.3, light: 'day', mist: true }) === 0 && SI.visibleAt({ area: 'margin', depth: 0.3, light: 'day', quiet: true }) === 0, 'none in mist or quiet water');
  // night: the lantern's intensity, smooth, no step; none spawns where it is under 0.25
  const R = SI.lanternRadius({});
  ok(R === 8 && near(SI.lanternRadius({ stub: true }), 12, 1e-9) && near(SI.lanternRadius({ level: 2 }), 8 * 1.3, 1e-9), 'the lantern: 8 m, Stub ×1.5, +15% a level');
  let mono = true, step = 0, prev = SI.visibleAt({ area: 'margin', depth: 0.3, light: 'night', raftDist: 0, lanternR: R });
  for (let d = 0.05; d <= R + 1; d += 0.05) {
    const v = SI.visibleAt({ area: 'margin', depth: 0.3, light: 'night', raftDist: d, lanternR: R });
    if (v > prev + 1e-12) mono = false;
    step = Math.max(step, prev - v); prev = v;
    const want = 0.75 * SI.lanternAt(d, R);
    if (!near(v, want, 1e-12)) mono = false;
  }
  ok(mono && step < 0.02 && prev === 0, `night opacity = dusk × the lantern's intensity, falling smoothly to 0 (largest 5 cm step ${step.toFixed(4)})`);
  const reach = SI.lanternReach(R, 0.25);
  ok(SI.canSpawnAt({ area: 'margin', depth: 0.3, light: 'night', raftDist: reach - 0.05, lanternR: R })
    && !SI.canSpawnAt({ area: 'margin', depth: 0.3, light: 'night', raftDist: reach + 0.05, lanternR: R }), `night: spawns only where the light is ≥ 0.25 (to ${reach.toFixed(2)} m)`);
  let under = 0;
  for (let d = 0; d < 12; d += 0.01) if (SI.canSpawnAt({ area: 'stones', depth: 0.3, light: 'night', raftDist: d, lanternR: R }) && SI.lanternAt(d, R) < 0.25) under++;
  ok(under === 0, 'never a spawn under 0.25');
  // the Buoy Lights: only at night, over a lamp (any depth)
  ok(SI.visibleAt({ area: 'buoy_lights', depth: 0.9, light: 'night', lamp: 0.8 }) === 0.8 && SI.visibleAt({ area: 'buoy_lights', depth: 0.9, light: 'dusk', lamp: 1 }) === 0, 'the Buoy Lights: a shape over a lamp at night, any depth');
}

section('which fish (§6.2)');
{
  const pool = D.placePool(D.SPECIES, { phase: 'dusk' });
  const entries = [...pool.list.map(([sp, w]) => ({ sp, w })), { sp: pool.giant?.sp || SP('thousandcast_pike'), w: 50 },
    { sp: SP('belled_matriarch'), w: 50 }, { sp: SP('bridgechain_sturgeon'), w: 50 }, { sp: SP('kissmark_trout'), w: 50 }, { sp: SP('gloam_eel'), w: 50 }];
  const rng = mul(11), n = {};
  for (let i = 0; i < 20000; i++) { const sp = SI.pickSight(entries, { light: 'dusk', area: 'margin' }, rng); if (sp) n[sp.id] = (n[sp.id] || 0) + 1; }
  ok(!['thousandcast_pike', 'hullkiss_lamprey', 'belled_matriarch', 'bridgechain_sturgeon', 'kissmark_trout', 'gloam_eel'].some((id) => n[id]), `never a giant, the legend, the sturgeon, the trout or the eel (${Object.keys(n).join(', ')})`);
  ok(!n.gutter_crayfish && !n.milkeye_perch, 'no crayfish or Milkeye Perch shape by dusk');
  const night = { stones: {}, margin: {} };
  const np = D.placePool(D.SPECIES, { phase: 'gloomtide' }).list.map(([sp, w]) => ({ sp, w }));
  for (const a of ['stones', 'margin']) for (let i = 0; i < 5000; i++) { const sp = SI.pickSight(np, { light: 'night', area: a }, rng); if (sp) night[a][sp.id] = (night[a][sp.id] || 0) + 1; }
  ok(night.stones.gutter_crayfish > 0 && !night.margin.gutter_crayfish, 'the crayfish only at night on the stones');
  ok(night.margin.milkeye_perch > 0 || night.stones.milkeye_perch > 0, 'the Milkeye Perch at night');
  // deep-bodied and long ×1.5
  const two = [{ sp: SP('weeping_carp'), w: 1 }, { sp: SP('mossback_perch'), w: 1 }];
  let carp = 0;
  for (let i = 0; i < 20000; i++) if (SI.pickSight(two, { light: 'day', area: 'margin' }, rng).id === 'weeping_carp') carp++;
  ok(near(carp / 20000, 0.6, 0.015), `deep-bodied ×1.5 (${(carp / 200).toFixed(1)}% of a 1:1 carp / perch pool)`);
  ok(SI.outlineOf('weeping_carp') === 'deep' && SI.outlineOf('candlefin_koi') === 'deep' && SI.outlineOf('rustfin_sucker') === 'deep'
    && SI.outlineOf('mossback_perch') === 'torpedo' && SI.outlineOf('overbold_bass') === 'torpedo' && SI.outlineOf('likely_chub') === 'torpedo'
    && SI.outlineOf('milkeye_perch', 'night') === 'torpedo' && SI.outlineOf('reedjaw_pike') === 'long' && SI.outlineOf('dusk_minnow') === 'shoal'
    && SI.outlineOf('lampsipper', 'night') === 'shoal' && SI.outlineOf('gutter_crayfish', 'night', 'stones') === 'claw', 'the five outlines');
  // its true length: sizeLength at its z
  for (const id of ['weeping_carp', 'reedjaw_pike', 'dusk_minnow']) for (const z of [-1, 0, 1.2]) {
    const f = SI.createSight({ sp: SP(id), zScore: z, length: SI.sightLength(D, SP(id), z, 'mossmere'), x: 0, z: 0, light: 'day', area: 'margin', rng: mul(2) });
    ok(near(f.length, D.sizeLength(SP(id), z, 'mossmere') / 100, 1e-12), `${id} at z ${z}: ${(f.length * 100).toFixed(1)} cm = sizeLength`);
  }
}

section('how far, how many (§6.3)');
{
  // (16 Nov 2026: with a live camera the spawn is chosen on the screen, fishing-sight-read.test.mjs; these are the no-camera fallback's)
  ok(SI.spawnBand(0.2).join() === '4.5,8' && SI.spawnBand(0.4).join() === '5,11' && SI.spawnBand(0.8).join() === '6,15' && SI.spawnBand(1.3).join() === '7,20', 'fallback bands (no camera): <30 cm 4.5–8, <60 cm 5–11, <1 m 6–15, bigger 7–20');
  let okBand = true, okKeep = true;
  const rng = mul(21);
  for (let i = 0; i < 3000; i++) {
    const L = 0.08 + rng() * 1.2, k = SI.keepOffFor(L, rng());
    if (k < 3 || k > 5) okKeep = false;
    const range = SI.spawnRange(L, { light: 'day', keepOff: k });
    const p = SI.spawnPoint({ x: 0, z: 0 }, range, () => true, rng);
    const band = SI.spawnBand(L);
    if (!p || p.d < Math.max(band[0], k + 0.4) - 1e-9 || p.d > Math.max(band[1], k + 0.9) + 1e-9 || p.d < k) okBand = false;
  }
  ok(okBand, 'every spawn within its length\'s band and past its own distance');
  ok(okKeep && SI.keepOffFor(0.1, 0.5) < SI.keepOffFor(0.9, 0.5), 'its own 3–5 m off the raft: a small fish nearer, a big one farther');
  // night: inside the lantern's light
  const nr = SI.spawnRange(0.5, { light: 'night', lanternR: 8, keepOff: 4 });
  ok(nr[1] <= SI.lanternReach(8, 0.25) + 1e-9 && nr[0] >= 4, `night: from its own distance to where the light is 0.25 (${nr.map((v) => v.toFixed(2)).join('–')} m)`);
  ok(SI.sightCap('high') === 2 && SI.sightCap('medium') === 2 && SI.sightCap('low') === 2, '≤ 2 alive on every tier (a shoal counts as one)');
  ok(SI.SIGHT.every.join() === '12,30' && SI.SIGHT.life.join() === '40,90', 'a new one every 12–30 s; each lives 40–90 s');
}

section('how they move (§6.4)');
{
  const rng = mul(31);
  const pike = SI.createSight({ sp: SP('reedjaw_pike'), length: 0.7, x: 0, z: 0, light: 'day', area: 'reeds', rng });
  pike.life = 1e9;
  let still = 0, T = 0, maxV = 0;
  for (let t = 0; t < 3000; t += 0.05) { SI.stepSight(pike, 0.05, { raft: { x: 100, z: 100 }, ok: () => true, rng }); if (pike.speed < 0.01) still += 0.05; T += 0.05; maxV = Math.max(maxV, pike.speed); }
  ok(still / T > 0.55 && still / T < 0.85 && maxV <= 0.35 + 1e-9 && maxV > 0.15, `the pike holds ${(100 * still / T).toFixed(0)}% of the time and glides ≤ 0.35 m/s (never darts; ${maxV.toFixed(2)})`);
  const carp = SI.createSight({ sp: SP('weeping_carp'), length: 0.5, x: 0, z: 0, light: 'dusk', area: 'margin', rng });
  carp.life = 1e9;
  let tails = 0, vmax = 0, dmax = 0;
  for (let t = 0; t < 600; t += 0.05) {
    const ev = SI.stepSight(carp, 0.05, { raft: { x: 100, z: 100 }, ok: (x, z) => Math.hypot(x, z) < 6, depth: () => 0.25, rng });
    tails += ev.filter((e) => e.type === 'tail').length; vmax = Math.max(vmax, carp.speed); dmax = Math.max(dmax, Math.hypot(carp.x, carp.z));
  }
  ok(tails > 5 && vmax <= 0.45 + 1e-9 && dmax < 6.5, `a carp cruises ≤ 0.45 m/s, roots and tails in water < 0.3 (${tails} tails), keeps to its area (≤ ${dmax.toFixed(1)} m)`);
  // keeps its own distance off the raft: a raft that holds still never has it inside; a raft that comes close bolts it
  const perch = SI.createSight({ sp: SP('mossback_perch'), length: 0.3, x: 8, z: 0, light: 'day', area: 'stones', rng });
  perch.life = 1e9;
  let inside = false, bolted = false;
  for (let t = 0; t < 300 && !bolted; t += 0.05) {
    const ev = SI.stepSight(perch, 0.05, { raft: { x: 0, z: 0 }, ok: () => true, rng });
    if (ev.some((e) => e.type === 'bolt')) bolted = true;
    if (!bolted && Math.hypot(perch.x, perch.z) < perch.keepOff - 1e-9) inside = true;
  }
  ok(!inside && !bolted, `it keeps its ${perch.keepOff.toFixed(2)} m off a still raft`);
  const ev = SI.stepSight(perch, 0.05, { raft: { x: perch.x + 1, z: perch.z }, ok: () => true, rng });
  ok(ev.some((e) => e.type === 'bolt') && perch.mode === 'bolt', 'the raft within its distance: it bolts');
}

section('it glides (17 Nov 2026): no jump, no dart, gentle turns, a calm bolt, a ~1 s fade');
{
  const rng = mul(77), G = SI.SIGHT.glide, dt = 1 / 30;
  let worstTurn = 0, worstAcc = 0, worstStep = 0, vmax = 0;
  const ids = [['reedjaw_pike', 0.7, 'reeds'], ['mossback_perch', 0.3, 'stones'], ['weeping_carp', 0.6, 'margin'], ['dusk_minnow', 0.2, 'margin'], ['gutter_crayfish', 0.15, 'stones']];
  for (const [id, L, area] of ids) {
    const f = SI.createSight({ sp: SP(id), length: L, x: 6, z: 0, light: 'day', area, rng });
    f.life = 1e9;
    for (let t = 0; t < 400; t += dt) {
      const h0 = f.heading, v0 = f.speed, x0 = f.x, z0 = f.z;
      SI.stepSight(f, dt, { raft: { x: 0, z: 0 }, ok: (x, z) => Math.hypot(x - 6, z) < 3.5, depth: () => 0.3, rng });
      worstTurn = Math.max(worstTurn, Math.abs(Math.atan2(Math.sin(f.heading - h0), Math.cos(f.heading - h0))) / dt);
      worstAcc = Math.max(worstAcc, Math.abs(f.speed - v0) / dt);
      worstStep = Math.max(worstStep, Math.hypot(f.x - x0, f.z - z0) / dt);
      vmax = Math.max(vmax, f.speed);
    }
  }
  ok(worstTurn <= G.turn + 1e-6 && worstAcc <= G.boltAcc + 1e-6 && worstStep <= vmax + 1e-6 && vmax <= 0.8 + 1e-9,
    `while it swims: turns ≤ ${G.turn} rad/s (${worstTurn.toFixed(2)}), eases its pace ≤ ${G.boltAcc} m/s² (${worstAcc.toFixed(2)}), never jumps, ≤ 0.8 m/s`);
  // a calm bolt: it turns away and speeds up smoothly as it fades out over about 1 s
  const b = SI.createSight({ sp: SP('mossback_perch'), length: 0.3, x: 0, z: 0, heading: 0, light: 'day', area: 'stones', rng });
  b.alpha = 1; b.mode = 'cruise'; b.speed = b.vT = 0.4;
  SI.boltFrom(b, 0, 1);
  let bTurn = 0, bAcc = 0, bV = 0, T = 0, gone = false;
  while (!gone && T < 5) { const h0 = b.heading, v0 = b.speed; gone = SI.stepSight(b, dt, { rng }).some((e) => e.type === 'gone'); T += dt;
    bTurn = Math.max(bTurn, Math.abs(Math.atan2(Math.sin(b.heading - h0), Math.cos(b.heading - h0))) / dt); bAcc = Math.max(bAcc, Math.abs(b.speed - v0) / dt); bV = Math.max(bV, b.speed); }
  ok(gone && T >= 0.8 && T <= 1.6 && bTurn <= G.boltTurn + 1e-6 && bAcc <= G.boltAcc + 1e-6 && bV <= G.boltV + 1e-9, `a calm bolt: gone in ${T.toFixed(2)} s, turn ≤ ${G.boltTurn} rad/s, ≤ ${G.boltV} m/s, smooth`);
  // the fade in and out: about 1 s each way
  const c = SI.createSight({ sp: SP('weeping_carp'), length: 0.5, x: 0, z: 0, light: 'day', area: 'margin', rng });
  let tin = 0; while (c.alpha < 1 && tin < 5) { SI.stepSight(c, dt, { rng }); tin += dt; }
  c.life = c.age; let tout = 0; while (!c.gone && tout < 5) { SI.stepSight(c, dt, { rng }); tout += dt; }
  ok(tin >= 0.8 && tin <= 1.3 && tout >= 0.8 && tout <= 1.6, `it fades in over ${tin.toFixed(2)} s and out over ${tout.toFixed(2)} s`);
}

section('spooking and leading (§6.5, §6.6)');
{
  const f = SI.createSight({ sp: SP('weeping_carp'), length: 0.6, x: 0, z: 0, heading: 0, light: 'day', area: 'margin', rng: mul(1) });
  f.mode = 'cruise'; f.speed = 0.4;
  const disc = 0.6 + 0.3;
  ok(SI.spookTest(f, { cast: { x: disc - 0.01, z: 0 } }) && !SI.spookTest(f, { cast: { x: disc + 0.01, z: 0 } }), 'a cast within 0.6 m + half its length spooks it');
  ok(SI.sightRule(f, 0.2, 0.1)?.spook && SI.sightRule(f, 0.2, 0.1).waitMult === 1.5, 'a cast on it: the spook rule, wait × 1.5');
  // the moving window from its head: 1 + 1.6 v … 3 + 2.5 v ahead, ≤ 1.2 m aside
  const hz = 0.3, a = 1 + 1.6 * 0.4, b = 3 + 2.5 * 0.4;
  ok(SI.leadTest(f, 0, hz + a + 0.01) === 'lead' && SI.leadTest(f, 0, hz + b - 0.01) === 'lead' && SI.leadTest(f, 1.19, hz + (a + b) / 2) === 'lead', 'ahead on its line: led');
  ok(!SI.leadTest(f, 0, hz + a - 0.05) && !SI.leadTest(f, 0, hz + b + 0.05) && !SI.leadTest(f, 1.25, hz + (a + b) / 2) && !SI.leadTest(f, 0, -2), 'too near, too far, too wide or behind: not led');
  const r = SI.sightRule(f, 0, hz + 2);
  ok(r && r.inSign && r.preroll?.chance === 0.45 && r.takeWaitMult === 0.3 && r.makers.join() === 'weeping_carp' && r.kind === 'sight', 'the lead rule: a pre-roll at 0.45, the take wait × 0.3');
  // a still fish: 0.8–2 m from its head, beside it, never behind
  f.mode = 'hold'; f.speed = 0;
  ok(SI.leadTest(f, 1.3, hz) === 'still' && SI.leadTest(f, 0, hz + 1.5) === 'still', 'still: beside or before its head, 0.8–2 m');
  ok(!SI.leadTest(f, 0, hz + 0.6) && !SI.leadTest(f, 0, hz + 2.2) && !SI.leadTest(f, 0, -1.5), 'still: too near, too far, or by its tail: not led');
  ok(SI.spookTest(f, { splash: { x: 1.9, z: 0 } }) && !SI.spookTest(f, { splash: { x: 2.1, z: 0 } }), 'a splash within 2 m of a still fish spooks it');
  f.mode = 'cruise'; f.speed = 0.4;
  ok(!SI.spookTest(f, { splash: { x: 1.5, z: 0 } }), 'a splash by a moving fish does not');
  const bo = SI.boltFrom(f, 0, -1);
  ok(bo.type === 'bolt' && f.mode === 'bolt' && near(f.hT, 0, 1e-9), 'it bolts straight away from the cast');
  const quiet = [{ x: 0, z: 0, until: 30 }];
  ok(SI.quietAt(quiet, 9.9, 0, 29) && !SI.quietAt(quiet, 10.1, 0, 29) && !SI.quietAt(quiet, 0, 0, 30.1), 'the spot goes quiet: 10 m, 30 s');
}

section('the take (§6.6): 20,000 trials by grade');
{
  const rng = mul(41);
  for (const [g, want] of [[1, 0.45], [2, 0.55], [3, 0.65], [0, 0.01]]) {
    const p = SI.takeChance(0.45, g, WC);
    let n = 0;
    for (let i = 0; i < 20000; i++) if (rng() < p) n++;
    ok(near(p, want, 1e-12) && near(n / 20000, want, want < 0.05 ? 0.003 : 0.012), `grade ${g}: ${(100 * n / 20000).toFixed(2)}% (${want * 100}%)`);
  }
  if (WC?.castOdds) {
    // a stray's whole cast through castOdds: a silhouetted pike on worms is exactly 1%
    const pool = D.placePool(D.SPECIES, { phase: 'dusk', bait: 'mire_worms' });
    try {
      const o = WC.castOdds(D, { pool, area: 'reeds', phase: 'dusk', bait: 'mire_worms', lure: null, rule: { kind: 'sight', preroll: { chance: 0.45 }, takeWaitMult: 0.3 },
        preroll: { sp: SP('reedjaw_pike'), z: 0, base: 0.45 } });
      const p = o.entries.filter((e) => e.sp?.id === 'reedjaw_pike' || e.sp === 'reedjaw_pike').reduce((a, e) => a + e.p, 0);
      ok(near(p, 0.01, 1e-9), `castOdds: a silhouetted pike on worms, the whole cast ${(p * 100).toFixed(3)}%`);
    } catch (e) { ok(false, `castOdds threw: ${e.message}`); }
  } else console.log('  (castOdds: waiting for WC-1\'s watercraft.js; the stray\'s whole cast is checked once it is cherry-picked)');
  // the approach: after 0.5–1.5 s it swims to the bait; a refusal noses it and turns away
  const f = SI.createSight({ sp: SP('reedjaw_pike'), length: 0.7, x: 0, z: 0, heading: 0, light: 'day', area: 'reeds', rng });
  SI.approach(f, { x: 0, z: 2.5 }, false, rng);
  ok(f.wait >= 0.5 && f.wait <= 1.5 && f.mode === 'nose', 'the bob settles 0.5–1.5 s, then it turns to the bait');
  let turned = false, reached = false;
  for (let t = 0; t < 12; t += 0.05) { const ev = SI.stepSight(f, 0.05, { raft: { x: 50, z: 50 }, ok: () => true, rng }); if (ev.some((e) => e.type === 'reach')) reached = true; if (f.mode === 'turn') turned = true; }
  ok(turned && !reached && f.mode !== 'bolt', 'a refusal: it noses the bait and turns slowly away (no spook)');
  const g = SI.createSight({ sp: SP('weeping_carp'), length: 0.5, x: 0, z: 0, heading: 0, light: 'day', area: 'margin', rng });
  SI.approach(g, { x: 0.5, z: 2.5 }, true, rng);
  let got = false;
  for (let t = 0; t < 15 && !got; t += 0.05) got = SI.stepSight(g, 0.05, { raft: { x: 50, z: 50 }, ok: () => true, rng }).some((e) => e.type === 'reach');
  ok(got, 'a take: it swims to the bait');
}

section('the draw budget (§6.8)');
{
  let FX = null;
  try { FX = await import('../../src/fishing-fx.js'); } catch (e) { FX = null; console.log('  (fishing-fx not importable here:', e.message, ')'); }
  if (FX) ok(FX.MAX_SIGNS === 20, `MAX_SIGNS ${FX.MAX_SIGNS}`);
  ok(SI.OUTLINE_ID.shoal && SI.createSight({ sp: SP('dusk_minnow'), length: 0.2, x: 0, z: 0, light: 'day', area: 'margin', rng: mul(5) }).n >= 3, 'a shoal is one silhouette of 3–5 shapes');
}

console.log(`\nfishing-sight: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
