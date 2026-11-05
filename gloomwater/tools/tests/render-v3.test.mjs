// Unit tests for render's v3 camera maths (DESIGN §25.14.2 R1 / R2, CONTRACT §13.7 render): the presets read from
// BALANCE.cameras in render's convention, the fish / reel distances (line distance only, never the size class), the night
// rule (combat.swarmActive, never the phase) and the trophy shot (distance, crane, yaw toward the landmark, portrait fit).
//   node tools/tests/render-v3.test.mjs
globalThis.GW_V3 = true;
globalThis.GW_V3_PHASE = 1;
const data = await import('../../src/data.js');
const C = await import('../../src/render-camera.js');
const { MODES } = await import('../../src/render.js');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; failures.push(msg); console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const near = (a, b, msg, eps = 1e-9) => ok(Math.abs(a - b) <= eps, `${msg} (got ${a}, want ${b})`);
const section = (s) => console.log(`- ${s}`);
const DEG = Math.PI / 180;

const CAM = data.BALANCE.cameras;
ok(data.V3_ENABLED === true && data.V3_PHASE === 1 && !!CAM, 'v3 phase-1 data carries BALANCE.cameras');

// ------------------------------------------------------------------ R1: presets from BALANCE.cameras
section('R1 presets (render convention)');
{
  const v = C.v3Presets(CAM, MODES);
  const S = v.modes.sail, F = v.modes.fish, R = v.modes.reel, N = v.modes.night;
  eq([S.elev, S.dist, S.aim, S.aimY, S.fov], [24, 15, 6.5, 1.4, 52], 'sail 24° / 15 m / aim 6.5 / aimY 1.4 / fov 52');
  eq([F.elev, F.dist], [28, 13], 'fish 28° / 13 m');
  for (const k of C.PARAM_KEYS) {
    eq(S[k], CAM.sail[k], `sail.${k} is data's`);
    eq(F[k], CAM.fish[k], `fish.${k} is data's`);
    eq(R[k], CAM.reel[k], `reel.${k} is data's`);
  }
  eq(N, MODES.night, 'night keeps render\'s overview numbers (data carries its rule only)');
  eq(v.modes.title, MODES.title, 'title untouched in P1');
  eq(v.modes.shop, MODES.shop, 'shop untouched in P1');
  eq(v.modes.death, MODES.death, 'death untouched in P1');
  eq(v.nightBlend, CAM.night.blend, 'night blend rate from data');
  eq(v.nightFollows, 'swarmActive', 'the night overview follows combat.swarmActive');
  eq(v.downAim, { fish: MODES.fish.aim, reel: MODES.reel.aim }, 'casts toward the camera keep v1\'s plain lean');
  // the v1 table is never mutated by the merge (flag-off parity)
  eq([MODES.sail.elev, MODES.sail.dist, MODES.fish.elev, MODES.fish.dist], [32, 16.5, 34, 14], 'v1 MODES untouched');
  for (const k of Object.keys(MODES)) ok(v.modes[k] !== MODES[k], `v3 ${k} is a copy, not v1's object`);
  // pitch in render's convention
  near(C.pitchOf(S), Math.atan2(15 * Math.sin(24 * DEG) - 1.4, 15 * Math.cos(24 * DEG) + 6.5) / DEG, 'sail pitch = atan((d·sin e − aimY)/(d·cos e + aim))');
  ok(C.pitchOf(S) > 12 && C.pitchOf(S) < 14.5, `sail looks ≈ 13° down (got ${C.pitchOf(S).toFixed(2)})`);
  ok(C.pitchOf(F) > 30 && C.pitchOf(F) < 34, `fish looks ≈ 32° down (got ${C.pitchOf(F).toFixed(2)})`);
  // a missing / partial table falls back to v1's numbers key by key
  const part = C.v3Presets({ sail: { elev: 20 } }, MODES);
  eq([part.modes.sail.elev, part.modes.sail.dist], [20, MODES.sail.dist], 'partial table: present keys win, the rest are v1\'s');
  eq(C.v3Presets(null, MODES).modes.reel, { ...MODES.reel }, 'no table: v1\'s reel');
}

// ------------------------------------------------------------------ R1: reel / fish distances never read the size class
section('R1 reel distance follows the line only');
{
  const R = C.v3Presets(CAM, MODES).modes.reel;
  eq(C.reelDistance.length, 2, 'reelDistance(sep, base): no class, tension or species argument exists');
  for (const sep of [0, 3, 6, 10, 14.2, 22, 39]) near(C.reelDistance(sep, R), Math.max(R.dist, 7.5 + sep * 0.6), `reel distance at ${sep} m`);
  ok(C.reelDistance(4, R) === R.dist, 'a short line keeps the preset distance');
  ok(C.reelDistance(20, R) > C.reelDistance(10, R), 'a longer line pulls the camera back');
  near(C.reelDistance(80, R), C.reelDistance(40, R), 'the line distance is capped at 40 m');
  const F = C.v3Presets(CAM, MODES).modes.fish;
  near(C.fishDistance(4, F), 13, 'fish: short casts keep 13 m');
  near(C.fishDistance(12, F), 8.5 + 12 * 0.78, 'fish: long casts back off with the line');
  near(C.fishElev(10, F), 28, 'fish: 28° up to 12 m');
  near(C.fishElev(20, F), 28 + 8 * 0.4, 'fish: rises past 12 m');
}

// ------------------------------------------------------------------ R1: the night rule
section('R1 night overview follows combat.swarmActive');
{
  eq(C.nightTarget({ playing: true, swarmActive: true }), 1, 'a swarm window → night');
  eq(C.nightTarget({ playing: true, swarmActive: false }), 0, 'a Stillnight / lamp-watch / quiet tail → sail');
  eq(C.nightTarget({ playing: false, swarmActive: true }), 0, 'not in play → no overview');
  eq(C.nightTarget({ playing: true }), 0, 'unknown swarm state → sail');
}

// ------------------------------------------------------------------ R2: the trophy shot
section('R2 trophy distance, crane, yaw');
{
  const T = C.trophyRule(CAM, data.BALANCE.ceremony?.camera);
  eq([T.base, T.perM, T.min, T.max, T.craneAbove, T.craneElev, T.yawMax], [1.2, 1.6, 1.6, 16, 4, 50, 35], 'rule from data (cameras.trophy / ceremony.camera)');
  eq(C.v3Presets(CAM, MODES).trophy.yawMax, 35, 'v3Presets carries the same rule');
  near(C.trophyDistance(0.2, T), 1.6, '0.2 m fish → 1.6 m (clamped)');
  near(C.trophyDistance(1.2, T), 3.12, '1.2 m fish → 3.12 m', 1e-12);
  near(C.trophyDistance(8.5, T), 14.8, '8.5 m fish → 14.8 m', 1e-12);
  near(C.trophyDistance(12, T), 16, 'a 12 m fish → 16 m (clamped)');
  near(C.trophyDistance(0.04, T), 1.6, 'a 4 cm fry → 1.6 m');
  eq([C.trophyCranes(0.2, T), C.trophyCranes(1.2, T), C.trophyCranes(4, T), C.trophyCranes(4.01, T), C.trophyCranes(8.5, T)], [false, false, false, true, true], 'cranes only above 4 m');
  near(C.trophyElev(8.5, T, 0), 18, 'the crane starts at the preset 18°');
  near(C.trophyElev(8.5, T, C.CRANE_DELAY + C.CRANE_TIME), 50, 'the crane reaches 50°');
  near(C.trophyElev(8.5, T), 50, 'settled crane: 50°');
  near(C.trophyElev(1.2, T, 99), 18, 'no crane at 1.2 m: 18°');
  const mid = C.trophyElev(8.5, T, C.CRANE_DELAY + C.CRANE_TIME / 2);
  near(mid, 34, 'the crane is eased (half way at half time)', 1e-9);
  let mono = true, prev = -1;
  for (let t = 0; t <= 3; t += 0.05) { const e = C.trophyElev(8.5, T, t); if (e < prev - 1e-12) mono = false; prev = e; }
  ok(mono, 'the crane never dips');
  ok(Math.abs(C.trophyElev(8.5, T, C.CRANE_DELAY + 0.01) - 18) < 0.01, 'the crane starts gently (ease in)');
  // yaw: north (0) without a landmark; toward the landmark, clamped to ±35°
  const at = { x: 10, z: -4 };
  eq(C.trophyYaw(at, null, 35), 0, 'no landmark (no place) → north');
  eq(C.trophyYaw(at, undefined, 35), 0, 'undefined landmark → north');
  near(C.trophyYaw(at, { x: 10, y: 3, z: -40 }, 35), 0, 'a landmark due north → north');
  near(C.trophyYaw(at, { x: 10 - Math.tan(20 * DEG) * 30, y: 3, z: -34 }, 35) / DEG, 20, 'a landmark 20° west of north → yaw +20° (toward −X)', 1e-9);
  near(C.trophyYaw(at, { x: 50, y: 3, z: -4 }, 35) / DEG, -35, 'a landmark due east → clamped to −35°', 1e-9);
  near(C.trophyYaw(at, { x: -30, y: 3, z: -4 }, 35) / DEG, 35, 'a landmark due west → clamped to +35°', 1e-9);
  ok(Math.abs(C.trophyYaw(at, { x: 11, y: 3, z: 40 }, 35)) <= 35 * DEG + 1e-12, 'a landmark behind → never more than ±35°');
  eq(C.trophyYaw(at, { x: 10, y: 3, z: -4 }, 35), 0, 'a landmark on the subject → north');
  // close-up lift and the portrait fit
  near(C.trophyAimY(14.8, T), 0.6, 'at range the look target sits aimY 0.6 above the subject');
  ok(C.trophyAimY(1.6, T) < 0.2 && C.trophyAimY(1.6, T) > 0, 'in a close-up the lift shrinks (the palm catch stays centred)');
  eq(C.trophyFov(44, 0.5, 1.6, 16 / 9), 44, 'landscape palm shot keeps fov 44');
  eq(C.trophyFov(44, 1.0, 3.12, 16 / 9), 44, 'landscape hang shot keeps fov 44');
  const pf = C.trophyFov(44, 1.0, 3.12, 390 / 844);
  ok(pf > 44 && pf <= 80, `portrait widens the fov so the subject fits across (got ${pf.toFixed(1)})`);
  const hHalf = Math.atan(Math.tan(pf / 2 * DEG) * (390 / 844));
  ok(Math.tan(hHalf) * 3.12 >= 1.0 * 1.15 - 1e-9 || pf === 80, 'the widened fov covers the subject\'s radius horizontally');
  eq(C.trophyFov(44, 6, 14.8, 390 / 844, 80), 80, 'never past the cap');
}

console.log(`render-v3: ${pass} passed, ${fail} failed`);
if (fail) { console.log(failures.join('\n')); process.exit(1); }
