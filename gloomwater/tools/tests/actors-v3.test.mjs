// Unit tests for the actors / models v3 pieces that are pure logic (DESIGN §25.14.2 A1 A2 A3 A10, CONTRACT §13.7 models /
// actors, §13.8): the honest stretched length (models-size trueLengthM), the measuring pose by length, the knotted cord's
// knots and unroll clock, the v3 data the Phase-1 stager asked for (bite tells, the Lantern Warden's timing, the lamp-watch
// text) and Murk's look and tip, plus the flag-off data staying untouched.   node tools/tests/actors-v3.test.mjs
import * as size from '../../src/models-size.js';

let pass = 0, fail = 0;
const failures = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; failures.push(msg); console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const near = (a, b, msg, eps = 1e-9) => ok(Math.abs(a - b) <= eps, `${msg} (got ${a}, want ${b})`);
const section = (s) => console.log(`- ${s}`);

// flag off first (the v1 build), then the v3 phase-1 build under its own module URL
const off = await import('../../src/data.js');
globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
const D = await import('../../src/data.js?v3p1');
delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE;

// ------------------------------------------------------------------ A1: true length
section('A1: createFish {z} → the true length in metres (models-size trueLengthM)');
{
  const m = D.SPECIES_BY_ID.dusk_minnow;
  near(size.trueLengthM(m, { z: 0.4 }, { data: D }), 0.2308, 'Dusk Minnow z 0.4 = 0.231 m', 5e-4);
  near(size.trueLengthM(m, { z: 3.0 }, { data: D }), 0.3971, 'Dusk Minnow z 3.0 = 0.397 m', 5e-4);
  // the formula without the data helper gives the same numbers (L50·e^(σz + 0.06·max(0, z − 1.04)²))
  for (const z of [-2, -0.25, 0, 1.04, 1.9, 2.65, 3.2, 3.6]) {
    near(size.trueLengthM(m, { z }), size.trueLengthM(m, { z }, { data: D }), `inline formula = data.sizeLength at z ${z}`, 1e-9);
    near(size.trueLengthM(m, { z }), 0.22 * Math.exp(0.12 * z + 0.06 * Math.max(0, z - 1.04) ** 2), `L50·e^(σz + tail) at z ${z}`, 1e-12);
  }
  // no ±22% scaling: the length depends on z alone, and a v3 weight inverts to the same length (W = k·L³)
  for (const sp of D.SPECIES) {
    if (sp.rarity === 'legendary') continue;
    for (const z of [-1, 0.4, 2.2, 3.0]) {
      const L = size.trueLengthM(sp, { z }, { data: D, zone: sp.zone });
      const kg = D.sizeWeight(sp, D.sizeLength(sp, z, sp.zone));
      near(size.trueLengthM(sp, kg, { data: D }), L, `${sp.id} z ${z}: weight ${kg.toFixed(3)} kg inverts to ${L.toFixed(3)} m`, 1e-9);
    }
  }
  // the Elder is 1.58–2.0× a typical Keeper for every species (the stretched tail shows on the model)
  const bad = D.SPECIES.filter((sp) => sp.rarity !== 'legendary').filter((sp) => {
    const r = size.trueLengthM(sp, { z: 3.0 }, { data: D, zone: sp.zone }) / size.trueLengthM(sp, { z: 0.4 }, { data: D, zone: sp.zone });
    return r < 1.58 || r > 2.0;
  }).map((s) => s.id);
  eq(bad, [], 'an Elder (z 3.0) is 1.58–2.0× a Keeper (z 0.4) on every model');
  near(size.trueLengthM(m, { lengthCm: 8 }), 0.08, 'an exact {lengthCm} wins (a 0.08 m Cupbearer)');
  eq(size.trueLengthM(m, { lengthCm: 1 }), 0.04, 'the only floor is 0.04 m');
  eq(size.MIN_LENGTH_M, 0.04, 'MIN_LENGTH_M');
  const cup = D.SPECIES_V3.find((s) => s.id === 'cupbearer');
  ok(!!cup && Math.abs(size.trueLengthM(cup, { z: 0 }, { data: D }) - cup.size.L50 / 100) < 1e-9, 'the Cupbearer (P2) sizes from its own L50');
  const lev = D.SPECIES_BY_ID.lantern_swallower;
  near(size.trueLengthM(lev, { z: 0 }, { data: D }), 8.5, 'the Lantern-Swallower is 8.5 m at z 0 (legends: no tail)', 1e-9);
  near(size.trueLengthM(lev, { z: 3 }, { data: D }), 8.5 * Math.exp(0.02 * 3), 'legends grow by σ 0.02 only', 1e-9);
  // v1 species (no size data) keep the weight model
  eq(size.trueLengthM(off.SPECIES_BY_ID.dusk_minnow, { z: 0.4 }), null, 'a v1 species has no true length (weight model stays)');
  eq(size.trueLengthM(off.SPECIES_BY_ID.dusk_minnow, 0.1), null, 'a v1 weight is not inverted');
  eq(size.trueLengthM(null, { z: 1 }), null, 'no species → null');
  eq(size.trueLengthM(m, { z: NaN }), null, 'z NaN → null');
  // the Pilgrim Salmon grows each lake down (L50 by lake)
  const pil = D.SPECIES_V3.find((s) => s.size && typeof s.size.L50 === 'object');
  if (pil) {
    const zs = Object.keys(pil.size.L50);
    near(size.trueLengthM(pil, { z: 0, zone: zs[zs.length - 1] }, { data: D }), pil.size.L50[zs[zs.length - 1]] / 100, `${pil.id}: L50 by lake (${zs[zs.length - 1]})`);
  }
}

// ------------------------------------------------------------------ A2: measuring pose by length, the cord
section('A2: measuring poses by length, the knotted cord');
{
  const P = D.BALANCE.ceremony.poses;
  const f = (L, o = {}) => size.measurePoseFor(L, { poses: P, ...o });
  eq([0.04, 0.2, 0.249].map((L) => f(L)), ['measurePalm', 'measurePalm', 'measurePalm'], 'Palm under 0.25 m');
  eq([0.25, 0.6, 0.849].map((L) => f(L)), ['measureArms', 'measureArms', 'measureArms'], 'Arms 0.25–0.85 m');
  eq([0.85, 1.5, 1.999].map((L) => f(L)), ['measureHang', 'measureHang', 'measureHang'], 'Hang 0.85–2.0 m');
  eq([2.0, 3.0, 8.5].map((L) => f(L)), ['measureAlongside', 'measureAlongside', 'measureAlongside'], 'Alongside from 2.0 m');
  eq(f(0.3, { legendary: true }), 'measureAlongside', 'every legend lies alongside');
  eq(size.measurePoseFor(0.2), 'measurePalm', 'built-in cuts match BALANCE.ceremony.poses (palm)');
  eq([0.6, 1.5, 3].map((L) => size.measurePoseFor(L)), [0.6, 1.5, 3].map((L) => f(L)), 'built-in cuts = data cuts');
  eq(size.MEASURE_POSES, ['measurePalm', 'measureArms', 'measureHang', 'measureAlongside'], 'the four pose names (CONTRACT §13.7)');
  eq(D.BALANCE.ceremony.wickHeight, 0.85, 'the Wick is 0.85 m');
  // knots: ≤ 10, ≥ 1, evenly spaced from the snout, never crowding the tail tip; great knots at round marks
  for (const L of [0.04, 0.08, 0.2, 0.231, 0.397, 0.6, 0.85, 1.5, 2.0, 3.0, 4.2, 8.5, 9.7]) {
    const { step, knots } = size.cordKnots(L);
    ok(knots.length <= 10 && knots.length >= 1, `cord ${L} m: ${knots.length} knots (step ${step} m)`);
    ok(knots.every((k, i) => Math.abs(k.at - (i + 1) * step) < 1e-6 && k.at < L - step * 0.19), `cord ${L} m: knots every ${step} m from the snout`);
    ok(knots.every((k) => Math.abs(k.u - k.at / L) < 1e-9), `cord ${L} m: u = at / L`);
  }
  eq(size.cordKnots(0.231).knots.map((k) => k.at), [0.05, 0.1, 0.15, 0.2], 'a 23 cm minnow: knots at 5 cm');
  eq(size.cordKnots(3.0).knots.filter((k) => k.great).map((k) => k.at), [1, 2], 'a 3 m fish: great knots at each metre');
  eq(size.cordKnots(8.5).knots.filter((k) => k.great).map((k) => k.at), [5], 'an 8.5 m legend: a great knot at 5 m');
  // the unroll clock matches audio's knot ticks (count(k) = L·(1 − (1 − k)²))
  near(size.cordEase(0), 0, 'ease 0'); near(size.cordEase(0.5), 0.75, 'ease 0.5 = 0.75'); near(size.cordEase(1), 1, 'ease 1'); near(size.cordEase(3), 1, 'ease clamps');
  // the cord's span inside the ceremony (same rule as audio-v3 cordDuration)
  near(size.cordDurationFor(D, 'keeper'), 1.2 * 1.4 / 3.6, 'Keeper cord ≈ 0.47 s', 1e-9);
  near(size.cordDurationFor(D, 'elder'), 5.0 * 1.4 / 3.6, 'Elder cord ≈ 1.94 s', 1e-9);
  near(size.cordDurationFor(D, 'elder', { short: true }), 0.4667, 'during a swarm: the 1.2 s variant', 1e-3);
  near(size.cordDurationFor(null, 'prize'), 2.4 * 1.4 / 3.6, 'no data → defaults', 1e-9);
}

// ------------------------------------------------------------------ data additions (V3-gated), A3 targets, A10
section('data: bite tells, the Lantern Warden, the lamp-watch text, the fish palettes, Murk');
{
  eq(D.BALANCE.bite.tells, { doublePop: 0.36, flatSlide: 0.5, dome: 0.6, lead: 0.6 }, 'BALANCE.bite.tells (merged into v1 BALANCE.bite)');
  eq(D.BALANCE.bite.dragUnder, 0.4, 'Prize drag-under stays 0.4');
  ok('waitBase' in D.BALANCE.bite && D.BALANCE.bite.waitBase === off.BALANCE.bite.waitBase, 'v1 bite keys kept');
  eq(D.BALANCE.nightModes.lantern.wardens.at, 0.1, 'nightModes.lantern.wardens.at = 0.10 (combat LANTERN_BOSS_AT)');
  const lw = D.BALANCE.nightModes.lantern.window;
  ok(D.BALANCE.nightModes.lantern.wardens.at > lw[0] && D.BALANCE.nightModes.lantern.wardens.at < lw[1], 'the Warden rises inside the Lantern window');
  const T = D.TEXT.v3;
  ok(T && /\{m\}/.test(T.lampWatchStart) && /Lamp-watch/.test(T.lampWatchStart), 'TEXT.v3.lampWatchStart (with {m})');
  eq(T.lampWatchLeave, 'You left the lamp-watch. The Gloom stirs.', 'TEXT.v3.lampWatchLeave');
  ok(/\{m\}/.test(T.lampWatchCast), 'TEXT.v3.lampWatchCast (with {m})');
  // A3 targets (DESIGN §25.7.7)
  const M = (id) => D.SPECIES_BY_ID[id].model;
  eq([M('mossback_perch').body, M('mossback_perch').fin], [0x585e66, 0x8a4b3a], 'Mossback: slate, rust fins');
  eq(M('reedjaw_pike').body, 0x3e4a5c, 'Reedjaw: slate-blue');
  eq(M('weeping_carp').body, 0x646a74, 'Weeping Carp: pewter');
  eq(M('dusk_minnow').body, 0x7a8494, 'Dusk Minnow: pewter');
  eq([M('gloam_eel').body, M('gloam_eel').glow], [0x16142a, 0xb9a8ff], 'Gloam Eel: ink, moon-violet glow');
  eq([M('belled_matriarch').body, M('belled_matriarch').glow], [0x6a5a44, 0xd8d0ff], 'Matriarch: bronze, pale moon');
  const hue = (c) => { const r = ((c >> 16) & 255) / 255, g = ((c >> 8) & 255) / 255, b = (c & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (!d) return { h: 0, s: 0 }; let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; const l = (mx + mn) / 2; return { h, s: d / (1 - Math.abs(2 * l - 1)) }; };
  const green = [];
  for (const sp of D.SPECIES) for (const k of ['body', 'belly', 'fin', 'glow']) { const c = sp.model?.[k]; if (c == null) continue; const { h, s } = hue(c); if (h >= 65 && h <= 195 && s >= 0.15) green.push(`${sp.id}.${k}`); }
  eq(green, [], 'no fish colour in the green-teal band (hue 65–195°, s ≥ 0.15)');
  const glass = D.SPECIES.filter((s) => s.zone === 'glasswater' && s.model?.glow != null).filter((s) => { const { h } = hue(s.model.glow); return h >= 150 && h <= 190; });
  eq(glass.map((s) => s.id), [], 'Glasswater glows are sapphire / violet, never aqua');
  // A10
  eq(D.COVE.murkLook.skin, 0x5a5444, 'Murk skin #5a5444'); eq(D.COVE.murkLook.moss, 0xb8b0a0, 'lichen tufts #b8b0a0'); eq(D.COVE.murkLook.lamp, 0xffe2b0, 'lamp #ffe2b0');
  { const { h, s } = hue(D.COVE.murkLook.lamp); ok(!(h >= 65 && h <= 195), `Murk's lamp is off green (hue ${h.toFixed(0)}°, s ${s.toFixed(2)})`); }
  eq(D.TIPS.find((t) => t.id === 'merchant').text, 'A bell across the water. Old Murk has moored. Sail to his lantern.', 'v3 merchant tip: "Sail to his lantern"');
  eq(off.TIPS.find((t) => t.id === 'merchant').text, 'A bell across the water. Old Murk has moored. Sail to his green lamp.', 'flag off: the v1 tip is untouched');
  // flag off: none of it lands in the v1 tables
  ok(!('tells' in off.BALANCE.bite) && !off.BALANCE.nightModes && !('v3' in off.TEXT), 'flag off: BALANCE.bite, nightModes and TEXT untouched');
  ok(!off.SPECIES_BY_ID.dusk_minnow.size, 'flag off: species carry no size data (models keep the weight model)');
}

console.log(`\nactors-v3: ${pass} passed, ${fail} failed`);
if (fail) { console.log(failures.map((f) => '  - ' + f).join('\n')); process.exit(1); }
