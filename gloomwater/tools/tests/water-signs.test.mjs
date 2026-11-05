// Unit tests for the v3 water items (DESIGN §25.14.2 Wa1, Wa2; CONTRACT §13.7 water, §13.9), no browser:
//   Wa2  sign tags pack into the existing ripple / wake vec4s and decode exactly as the shader does; a plain
//        ripple or wake is never mistaken for a sign; water.addRipple / addWake with a {kind} fill their own
//        reserved slots, are packed ahead of plain marks and never evict the raft's wake (nor it them); the
//        shader declares no new array uniform and the material's uniform list is the base list + uGlowtide.
//   Wa1  glowtideFor() follows the night; water drives uGlowtide by itself only in a v3 build (BALANCE.nightModes),
//        setGlowtide(k) holds a value and setGlowtide(null) hands it back; the sparkle term sits inside
//        #ifndef GW_LOW; with the flag off nothing moves (uGlowtide stays 0).
//   node tools/tests/water-signs.test.mjs   (or node tools/check.mjs)
import {
  SIGN_KINDS, SIGN_ID, SIGN_LIFE, SIGN_CAP, signId, signLength, sizeBucket, bucketLength,
  encodeSignRipple, decodeSignRipple, encodeSignWake, decodeSignWake, glowtideFor,
} from '../../src/water-signs.js';
import { WATER_FRAG } from '../../src/water-shader.js';
import { create as createWater } from '../../src/water.js';

let pass = 0, fail = 0;
const ok = (c, msg, extra) => { if (c) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra) : ''); } };
const near = (a, b, e) => Math.abs(a - b) <= e;

// ------------------------------------------------------------------ packing (Wa2)
console.log('- sign packing');
ok(SIGN_KINDS.length === 6 && SIGN_KINDS.every((k, i) => SIGN_ID[k] === i + 1), 'six kinds, ids 1..6 in CONTRACT §13.5 order');
ok(signId('rise') === 1 && signId('GLOW') === 6 && signId('spot') === 0 && signId(undefined) === 0 && signId(7) === 0, 'signId maps names / ids, else 0');
for (const k of SIGN_KINDS) {
  for (const L of [0.04, 0.08, 0.2, 0.45, 1.0, 2.5, 3.0, 8.5, 9.7]) {
    for (const i of [0, 0.3, 1]) {
      const w = encodeSignRipple(k, L, i);
      const d = decodeSignRipple(w);
      const f32 = decodeSignRipple(Math.fround(w));           // what the GPU sees
      ok(d.kind === SIGN_ID[k] && f32.kind === SIGN_ID[k], `${k} ${L} m ${i}: kind survives (float32 too)`, { w, d, f32 });
      ok(near(f32.length, bucketLength(sizeBucket(L)), 1e-6), `${k} ${L} m: bucket survives float32`, f32);
      ok(near(f32.intensity, Math.min(i, 0.999) * 1.002, 0.003), `${k} ${L} m ${i}: intensity survives float32`, f32);
    }
  }
}
ok(near(bucketLength(sizeBucket(0.2)), 0.2, 0.012) && near(bucketLength(sizeBucket(1.0)), 1.0, 0.06) && near(bucketLength(sizeBucket(8.5)), 8.5, 0.35), 'size buckets resolve a minnow to a legend');
ok(sizeBucket(0) === 1 && sizeBucket(50) === 63, 'bucket clamps 1..63');
// a plain ripple's strength is clamped to [0.05, 3] by water.addRipple, so it never reaches the sign range
for (const s of [0.05, 1, 2.5, 3]) ok(decodeSignRipple(s).kind === 0 && decodeSignRipple(s).strength === s, `plain ripple ${s} stays plain`);
for (const s of [0, 0.5, 1]) ok(decodeSignWake(encodeSignWake(0, s)).kind === 0 && encodeSignWake(0, s) === s, `plain wake ${s} stays plain and unchanged`);
ok(decodeSignWake(Math.fround(encodeSignWake('glow', 0.5))).kind === 6 && near(decodeSignWake(encodeSignWake('glow', 0.5)).intensity, 0.5, 1e-6), 'glow wake packs kind 6 + strength');
ok(signLength('boil', { size: 1.7 }) === 1.7 && signLength('boil', { sizeClass: 'elder' }) === 2.0 && signLength('rise', {}) === 0.3, 'size → sizeClass → kind default');
ok(SIGN_LIFE.length === 7 && SIGN_LIFE.slice(1).every((l) => l > 2 && l < 8), 'a life per kind');
ok(SIGN_CAP.low.rip <= 20 && SIGN_CAP.low.wake <= 24 && SIGN_CAP.high.rip < 32 && SIGN_CAP.high.wake < 32, 'reserved sign slots leave room for plain marks on every tier');

// ------------------------------------------------------------------ the shader (Wa1, Wa2)
console.log('- shader');
const uniformDecls = [...WATER_FRAG.matchAll(/^\s*uniform\s+(\w+)\s+([^;]+);/gm)].flatMap((m) => m[2].split(',').map((n) => ({ type: m[1], name: n.trim() })));
const names = uniformDecls.map((u) => u.name.replace(/\[.*$/, ''));
const arrays = uniformDecls.filter((u) => u.name.includes('[')).map((u) => u.name);
ok(JSON.stringify(arrays.sort()) === JSON.stringify(['uLC[MAX_L]', 'uLP[MAX_L]', 'uObs[MAX_OBS]', 'uRip[MAX_RIP]', 'uWake[MAX_WAKE]', 'uWakeD[MAX_WAKE]', 'uWaveA[4]', 'uWaveB[4]'].sort()), 'no new uniform array (signs ride uRip / uWake)', arrays);
const BASE = ['uTime', 'uDeep', 'uShallow', 'uFoam', 'uGlow', 'uSky', 'uArenaR', 'uRip', 'uRipN', 'uWake', 'uWakeD', 'uWakeN', 'uWakeB', 'uObs', 'uObsN', 'uLP', 'uLC', 'uLN', 'uRaft',
  'uDepthTex', 'uDepthScale', 'uDepthOn', 'uWaveT', 'uWaveA', 'uWaveB', 'uStars', 'uStarDen', 'uNebK', 'uStarCol', 'uNeb', 'uNebV', 'uBandN', 'uNeb1', 'uNeb2'];
ok(JSON.stringify([...names].sort()) === JSON.stringify([...BASE, 'uGlowtide'].sort()), 'fragment uniforms = the base set + uGlowtide (CONTRACT §13.9)', names.filter((n) => !BASE.includes(n)));
const glowBlocks = [...WATER_FRAG.matchAll(/#if defined\(GW_V3\) && !defined\(GW_LOW\)([\s\S]*?)#endif/g)].map((m) => m[1]);
const glowUses = WATER_FRAG.split('\n').filter((l) => l.includes('uGlowtide') && !/^\s*uniform/.test(l));
ok(glowUses.length >= 1 && glowUses.every((l) => glowBlocks.some((b) => b.includes(l.trim()))), 'every use of uGlowtide sits inside #if defined(GW_V3) && !defined(GW_LOW) (absent on low and in v1 builds)', glowUses);
const v3Blocks = [...WATER_FRAG.matchAll(/#ifdef GW_V3([\s\S]*?)#endif/g)].map((m) => m[1]);
ok(v3Blocks.some((b) => /void signMark\(/.test(b)) && v3Blocks.some((b) => /signMark\(r, xz/.test(b)), 'signMark (definition and call) is compiled only under GW_V3');
ok(/if \(r\.w >= 64\.0\) \{[\s\S]{0,200}?signMark\(/.test(WATER_FRAG), 'the ripple loop hands tagged marks (.w ≥ 64) to signMark before the plain path');
ok(/float wk = floor\(m\.w \* 0\.25\);/.test(WATER_FRAG) && /\* ws;/.test(WATER_FRAG), 'the wake loop unpacks 4·kind + strength');
ok(/kind < 1\.5 \? 5\.2 : kind < 2\.5 \? 4\.2 : kind < 3\.5 \? 4\.2 : kind < 4\.5 \? 7\.5 : kind < 5\.5 \? 2\.8 : 2\.6/.test(WATER_FRAG)
  && JSON.stringify(SIGN_LIFE) === JSON.stringify([0, 5.2, 4.2, 4.2, 7.5, 2.8, 2.6]), 'shader signLife() matches SIGN_LIFE');

// ------------------------------------------------------------------ water.js with a fake ctx
console.log('- water.addRipple / addWake / setGlowtide');
function fakeCtx({ v3 = false, phase = 'calm', k = 0 } = {}) {
  const BALANCE = v3 ? { nightModes: { still: {} } } : {};
  const ctx = {
    time: { t: 100, gameDt: 0.016 }, debug: {}, bus: { on() {} }, flow: 'playing',
    data: { ZONES: [], BALANCE }, state: { run: { zone: 'mossmere' } },
    survival: { getPhaseInfo: () => ({ phase: ctx._phase, k: ctx._k }) },
    render: { quality: 'high' },
    _phase: phase, _k: k,
  };
  return ctx;
}
{
  const ctx = fakeCtx();
  const w = createWater(ctx);
  w.init();
  const U = w.material.uniforms;
  const keys0 = Object.keys(U).sort();
  // the raft's wake fills the plain wake ring, then six signs arrive
  for (let i = 0; i < 40; i++) { ctx.time.t += 0.12; w.addWake(0, i * 0.8, 0, 1, 0.9); }
  w.update(0.016);
  const plainOnly = U.uWakeN.value;
  for (const [i, k] of SIGN_KINDS.entries()) w.addRipple(10 + i * 3, -20, 1, { kind: k, size: 0.2 + i * 0.4 });
  w.addWake(14, -18, 1, 0, 0.5, { kind: 'glow' });
  for (let i = 0; i < 40; i++) w.addRipple(i, 5, 1);              // a burst of plain ripples
  w.update(0.016);
  const d = ctx.debug.water();
  ok(JSON.stringify(Object.keys(U).sort()) === JSON.stringify(keys0) && keys0.length === 39, 'signs add no uniform (39 = base 38 + uGlowtide)', keys0.length);
  ok(d.signRipN === 6 && SIGN_KINDS.every((k) => d.signMarks[k] === 1), 'six tagged ripples, one per kind', d.signMarks);
  const rip = U.uRip.value;
  const kindsPacked = [...Array(6).keys()].map((i) => Math.floor(rip[i * 4 + 3] / 64)).sort();
  ok(JSON.stringify(kindsPacked) === JSON.stringify([1, 2, 3, 4, 5, 6]), 'tagged ripples packed first', kindsPacked);
  ok(U.uRipN.value === 32 && d.ripN - d.signRipN === 26, 'plain ripples fill the rest of the 32 slots', { n: U.uRipN.value });
  ok(d.signWakeN === 1 && Math.floor(U.uWake.value[3] / 4) === 6, 'the glow wake rides uWake, packed first', U.uWake.value[3]);
  ok(U.uWakeN.value === Math.min(32, plainOnly + 1), 'the raft\'s wake keeps its marks beside it', { before: plainOnly, after: U.uWakeN.value });
  for (let i = 0; i < 32; i++) if (i >= d.signRipN && i < U.uRipN.value) { if (rip[i * 4 + 3] >= 64) { ok(false, 'a plain slot holds a tagged ripple', i); break; } }
  ok(typeof w.setGlowtide === 'function' && w.glowtide === 0, 'setGlowtide exists; 0 in a v1 build');
  ok(!('GW_V3' in w.material.defines), 'a v1 build compiles no v3 water code (no GW_V3 define)');
  // plain addRipple keeps its numeric delay (splash uses it)
  w.addRipple(1, 1, 1, 0.5);
  w.update(0.016);
  const tNow = (ctx.time.t % 3600);
  let delayed = false;
  for (let i = 0; i < U.uRipN.value; i++) if (rip[i * 4 + 3] < 64 && near(rip[i * 4 + 2], tNow + 0.5, 1e-3)) delayed = true;
  ok(delayed, 'a numeric 4th argument is still a delay');
  // unknown kind → a plain ripple
  w.addRipple(2, 2, 1, { kind: 'spot' });
  w.update(0.016);
  ok(ctx.debug.water().signRipN === 6, 'an unknown kind draws a plain ripple');
  // lives: a rise mark is gone after its life
  ctx.time.t += 5.3; w.update(0.016);
  const after = ctx.debug.water().signMarks;
  ok(!after.rise && !after.boil && !after.glow && after.strike === 1, 'marks expire on their own clocks (rise 5.2 s gone, strike 7.5 s still on)', after);
  ctx.time.t += 3; w.update(0.016);
  ok(Object.keys(ctx.debug.water().signMarks).length === 0, 'all marks gone after the longest life');
  // the pool recycles: 20 rises in a row never exceed the 16-mark pool / 12 slots
  for (let i = 0; i < 20; i++) w.addRipple(i, 0, 1, { kind: 'rise' });
  w.update(0.016);
  { const dd = ctx.debug.water(); const rp = U.uRip.value; let newest = true; for (let i = 0; i < dd.signRipN; i++) if (Math.round(rp[i * 4]) < 4) newest = false; ok(dd.signRipN === 16 && newest, "a flood of signs takes at most its 16 reserved slots, newest first", dd.signRipN); }
}
{
  // a sign's tagged wake is not the player's: water's fallback raft wake still runs beside it
  const ctx = fakeCtx();
  ctx.player = { position: { x: 0, z: 0 }, velocity: { x: 0, z: -3 } };
  const w = createWater(ctx); w.init();
  for (let i = 0; i < 20; i++) { ctx.time.t += 0.05; w.addWake(20, -20 - i * 0.4, 0, -1, 0.6, { kind: 'glow' }); w.update(0.05); }
  const d = ctx.debug.water();
  ok(d.signWakeN >= 1 && d.wakeN - d.signWakeN >= 1, 'tagged wakes do not suppress the raft\'s fallback wake', d);
}
{
  // Glowtide drive: v1 build → never moves; v3 build → follows the night; setGlowtide holds / releases
  const c1 = fakeCtx({ v3: false, phase: 'gloomtide', k: 0.5 });
  const w1 = createWater(c1); w1.init();
  for (let i = 0; i < 200; i++) w1.update(0.05);
  ok(w1.material.uniforms.uGlowtide.value === 0, 'flag off: the Glowtide stays 0 at night');
  const c3 = fakeCtx({ v3: true, phase: 'calm', k: 0.5 });
  const w3 = createWater(c3); w3.init();
  ok(w3.material.defines.GW_V3 === 1, 'a v3 build compiles the signs and the Glowtide (GW_V3)');
  for (let i = 0; i < 100; i++) w3.update(0.05);
  ok(w3.material.uniforms.uGlowtide.value === 0, 'v3 calm: 0');
  c3._phase = 'gloomtide'; c3._k = 0.4;
  for (let i = 0; i < 200; i++) w3.update(0.05);
  ok(w3.material.uniforms.uGlowtide.value === 1 && w3.glowtide === 1, 'v3 night: eases to 1', w3.material.uniforms.uGlowtide.value);
  w3.setGlowtide(0.3);
  for (let i = 0; i < 200; i++) w3.update(0.05);
  ok(near(w3.material.uniforms.uGlowtide.value, 0.3, 1e-9), 'setGlowtide(0.3) holds against the night', w3.material.uniforms.uGlowtide.value);
  w3.setGlowtide(null);
  for (let i = 0; i < 200; i++) w3.update(0.05);
  ok(w3.material.uniforms.uGlowtide.value === 1, 'setGlowtide(null) hands it back to the night');
  c3.render.quality = 'low'; w3.update(0.05);
  ok(w3.glowtide === 0 && w3.material.defines.GW_LOW === 1, 'low tier: GW_LOW defined, live Glowtide 0');
  c3.flow = 'title'; c3.render.quality = 'high';
  for (let i = 0; i < 200; i++) w3.update(0.05);
  ok(w3.material.uniforms.uGlowtide.value === 0, 'off outside play');
}
console.log('- glowtideFor');
ok(glowtideFor(null) === 0 && glowtideFor({ phase: 'calm', k: 0.9 }) === 0, 'calm / none: 0');
ok(glowtideFor({ phase: 'dusk', k: 0.3 }) === 0 && near(glowtideFor({ phase: 'dusk', k: 1 }), 0.4, 1e-9), 'dusk: a glimmer only at its end');
ok(near(glowtideFor({ phase: 'gloomtide', k: 0 }), 0.4, 1e-9) && glowtideFor({ phase: 'gloomtide', k: 0.5 }) === 1 && near(glowtideFor({ phase: 'gloomtide', k: 1 }), 0.75, 1e-9), 'night: continuous from dusk, full, easing out');
ok(near(glowtideFor({ phase: 'dawn', k: 0 }), 0.75, 1e-9) && glowtideFor({ phase: 'dawn', k: 0.6 }) === 0, 'dawn: continuous, fades out by half-way');

console.log(`\nwater-signs: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
