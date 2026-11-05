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
// a small GLSL preprocessor (#ifdef / #ifndef / #if [!]defined(X) && … / #else / #endif; comments and blank lines dropped):
// the fragment shader as the GPU compiles it for a given set of defines
function pp(src, defs) {
  const out = [], stack = [];
  const cond = (c) => c.replace(/(!?)\s*defined\((\w+)\)/g, (_, not, n) => String(!!defs[n] !== !!not))
    .replace(/\b([A-Z_][A-Z0-9_]*)\b/g, (n) => (n in defs ? String(defs[n]) : '0'));
  for (const raw of src.split('\n')) {
    const l = raw.trim();
    let m;
    if ((m = l.match(/^#ifdef\s+(\w+)/))) { stack.push(!!defs[m[1]]); continue; }
    if ((m = l.match(/^#ifndef\s+(\w+)/))) { stack.push(!defs[m[1]]); continue; }
    if ((m = l.match(/^#if\s+(.*)$/))) { stack.push(!!Function(`return (${cond(m[1])});`)()); continue; }
    if (l.startsWith('#else')) { stack.push(!stack.pop()); continue; }
    if (l.startsWith('#endif')) { stack.pop(); continue; }
    if (!stack.every(Boolean)) continue;
    const c = raw.replace(/\/\/.*$/, '').trim();
    if (c) out.push(c);
  }
  return out;
}
const BUILDS = {
  v1: { SL_LAYERS: 3 }, v1low: { SL_LAYERS: 2, GW_LOW: 1 },
  v3: { SL_LAYERS: 3, GW_V3: 1 }, v3low: { SL_LAYERS: 2, GW_LOW: 1, GW_V3: 1 },
};
const uniformsOf = (lines) => lines.flatMap((l) => { const m = l.match(/^uniform\s+(\w+)\s+([^;]+);/); return m ? m[2].split(',').map((n) => n.trim()) : []; });
const BASE = ['uTime', 'uDeep', 'uShallow', 'uFoam', 'uGlow', 'uSky', 'uArenaR', 'uRip', 'uRipN', 'uWake', 'uWakeD', 'uWakeN', 'uWakeB', 'uObs', 'uObsN', 'uLP', 'uLC', 'uLN', 'uRaft',
  'uDepthTex', 'uDepthScale', 'uDepthOn', 'uWaveT', 'uWaveA', 'uWaveB', 'uStars', 'uStarDen', 'uNebK', 'uStarCol', 'uNeb', 'uNebV', 'uBandN', 'uNeb1', 'uNeb2'];
const ARRAYS = ['uLC[MAX_L]', 'uLP[MAX_L]', 'uObs[MAX_OBS]', 'uRip[MAX_RIP]', 'uWake[MAX_WAKE]', 'uWakeD[MAX_WAKE]', 'uWaveA[4]', 'uWaveB[4]'];
const SRC = Object.fromEntries(Object.entries(BUILDS).map(([k, d]) => [k, pp(WATER_FRAG, d)]));
const sorted = (a) => JSON.stringify([...a].sort());
for (const [k, lines] of Object.entries(SRC)) {
  const u = uniformsOf(lines);
  ok(sorted(u.filter((n) => n.includes('['))) === sorted(ARRAYS), `${k}: no new uniform array (signs ride uRip / uWake)`, u.filter((n) => n.includes('[')));
  const names = u.map((n) => n.replace(/\[.*$/, ''));
  const want = k.startsWith('v3') ? [...BASE, 'uGlowtide'] : BASE;
  ok(sorted(names) === sorted(want), `${k}: fragment uniforms = the base set${k.startsWith('v3') ? ' + uGlowtide (CONTRACT §13.9)' : ''}`, names.filter((n) => !BASE.includes(n)));
}
const uses = (k, re) => SRC[k].some((l) => re.test(l) && !/^uniform/.test(l));
ok(!uses('v1', /uGlowtide|signMark|linesG|sLine|wGlow/) && !uses('v1low', /uGlowtide|signMark|linesG|sLine|wGlow/), 'a v1 / v2 build compiles none of the v3 water (signs, Glowtide)');
ok(uses('v3', /uGlowtide/) && !uses('v3low', /uGlowtide/), 'the Glowtide term is compiled on high / medium and absent on low (GW_LOW)');
ok(uses('v3', /signMark\(r, xz/) && uses('v3low', /signMark\(r, xz/), 'signs paint on every tier of a v3 build');
ok(SRC.v3.some((l) => /^if \(r\.w >= 64\.0\) \{$/.test(l)) && /if \(r\.w >= 64\.0\) \{[\s\S]{0,200}?signMark\(/.test(WATER_FRAG), 'the ripple loop hands tagged marks (.w ≥ 64) to signMark before the plain path');
ok(SRC.v3.includes('float wk = floor(m.w * 0.25);') && SRC.v3.includes('m.w -= wk * 4.0;'), 'the wake loop unpacks 4·kind + strength');
ok(/kind < 1\.5 \? 5\.2 : kind < 2\.5 \? 4\.2 : kind < 3\.5 \? 4\.2 : kind < 4\.5 \? 7\.5 : kind < 5\.5 \? 2\.8 : 2\.6/.test(WATER_FRAG)
  && JSON.stringify(SIGN_LIFE) === JSON.stringify([0, 5.2, 4.2, 4.2, 7.5, 2.8, 2.6]), 'shader signLife() matches SIGN_LIFE');
// derivatives only in uniform control flow (undefined inside the divergent ripple / wake loops)
{
  const main = WATER_FRAG.slice(WATER_FRAG.indexOf('void main()'));
  const dLines = main.split('\n').filter((l) => /dFd[xy]|fwidth/.test(l));
  ok(dLines.some((l) => /^ {2}vec2 pxX = dFdx\(xz\), pxY = dFdy\(xz\);/.test(l)) && dLines.every((l) => /^ {2}\S/.test(l))
    && !/dFd[xy]|fwidth/.test(WATER_FRAG.slice(WATER_FRAG.indexOf('void signMark'), WATER_FRAG.indexOf('void main()'))),
    'screen derivatives are taken at the top level of main, never inside a loop or signMark', dLines);
}
// the Glowtide never lights rings born at the hull (no ring of light around the raft)
ok(uses('v3', /linesG \+= .*hullK/) && uses('v3', /float gE = clamp\(linesG \* 0\.7/) && !uses('v3', /float gE = clamp\(lines \*/), 'the Glowtide lights ripples by origin, never the rings born at the hull');

// ------------------------------------------------------------------ water.js with a fake ctx
console.log('- water.addRipple / addWake / setGlowtide');
function fakeCtx({ v3 = false, phase = 'calm', k = 0, outing = 'normal' } = {}) {
  const BALANCE = v3 ? { nightModes: { still: {} } } : {};
  const ctx = {
    time: { t: 100, gameDt: 0.016 }, debug: {}, bus: { on() {} }, flow: 'playing',
    data: { ZONES: [], BALANCE }, state: { run: { zone: 'mossmere', outing } },
    survival: { getPhaseInfo: () => ({ phase: ctx._phase, k: ctx._k }) },
    render: { quality: 'high' },
    _phase: phase, _k: k,
  };
  return ctx;
}
const kindsIn = (U, n0, n1) => { const r = U.uRip.value, out = []; for (let i = n0; i < n1; i++) out.push(Math.floor(r[i * 4 + 3] / 64)); return out; };
{
  const ctx = fakeCtx({ v3: true });
  const w = createWater(ctx);
  w.init();
  const U = w.material.uniforms;
  const keys0 = Object.keys(U).sort();
  // the raft's wake fills the plain wake ring, then six signs arrive
  for (let i = 0; i < 40; i++) { ctx.time.t += 0.12; w.addWake(0, i * 0.8, 0, 1, 0.9); }
  for (let i = 0; i < 40; i++) { ctx.time.t += 0.002; w.addRipple(i, 5, 1); }   // a burst of plain ripples
  w.update(0.016);
  const plainOnly = U.uWakeN.value;
  for (const [i, k] of SIGN_KINDS.entries()) w.addRipple(10 + i * 3, -20, 1, { kind: k, size: 0.2 + i * 0.4 });
  w.addWake(14, -18, 1, 0, 0.5, { kind: 'glow' });
  w.update(0.016);
  const d = ctx.debug.water();
  ok(JSON.stringify(Object.keys(U).sort()) === JSON.stringify(keys0) && keys0.length === 39, 'signs add no uniform (v3: 39 = base 38 + uGlowtide)', keys0.length);
  ok(Array.isArray(w.signKinds) && w.signKinds.length === 6, 'water.signKinds lists the six kinds in a v3 build (fishing-fx feature-detects it)');
  ok(d.signRipN === 6 && SIGN_KINDS.every((k) => d.signMarks[k] === 1), 'six tagged ripples, one per kind', d.signMarks);
  ok(sorted(kindsIn(U, 0, 6)) === sorted([1, 2, 3, 4, 5, 6]), 'tagged ripples packed first', kindsIn(U, 0, 6));
  ok(U.uRipN.value === 32 && d.ripN - d.signRipN === 26, 'plain ripples fill the rest of the 32 slots', { n: U.uRipN.value });
  ok(kindsIn(U, 6, 32).every((k) => k === 0), 'no plain slot holds a tagged ripple');
  { const r = U.uRip.value; const xs = []; for (let i = 6; i < 32; i++) xs.push(r[i * 4]); ok(Math.min(...xs) === 14, 'with signs in, the 26 newest plain ripples keep the slots', Math.min(...xs)); }
  ok(d.signWakeN === 1 && Math.floor(U.uWake.value[3] / 4) === 6, 'the glow wake rides uWake, packed first', U.uWake.value[3]);
  ok(U.uWakeN.value === Math.min(32, plainOnly + 1), 'the raft\'s wake keeps its marks beside it', { before: plainOnly, after: U.uWakeN.value });
  ok(typeof w.setGlowtide === 'function' && w.glowtide === 0, 'setGlowtide exists; 0 in calm');
  // plain addRipple keeps its numeric delay (splash uses it)
  w.addRipple(1, 1, 1, 0.5);
  w.update(0.016);
  const tNow = (ctx.time.t % 3600);
  const rip = U.uRip.value;
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
  // the pool recycles: 20 rises in a row never exceed the 16 reserved slots, newest first
  for (let i = 0; i < 20; i++) w.addRipple(i, 0, 1, { kind: 'rise' });
  w.update(0.016);
  { const dd = ctx.debug.water(); const rp = U.uRip.value; let newest = true; for (let i = 0; i < dd.signRipN; i++) if (Math.round(rp[i * 4]) < 4) newest = false; ok(dd.signRipN === 16 && newest, 'a flood of signs takes at most its 16 reserved slots, newest first', dd.signRipN); }
}
{
  // fairness: three glow trails, two rises and a lone boil overflow the 16 slots; every kind keeps its newest marks
  const ctx = fakeCtx({ v3: true });
  const w = createWater(ctx); w.init();
  const U = w.material.uniforms;
  w.addRipple(30, 30, 1, { kind: 'boil', size: 1.6 });
  for (let i = 0; i < 18; i++) {
    ctx.time.t += 0.1;
    for (let tr = 0; tr < 3; tr++) w.addRipple(tr * 10 + i * 0.7, -5, 1, { kind: 'glow', size: 0.8 });   // 0.7 m steps: a new mark each call
    if (i % 6 === 0) w.addRipple(-20 + i, 12, 1, { kind: 'rise', size: 0.4 });
  }
  w.update(0.016);
  const d = ctx.debug.water();
  const packed = kindsIn(U, 0, d.signRipN);
  ok(d.signRipN === 16 && packed.includes(2) && packed.includes(1) && packed.filter((k) => k === 6).length >= 10, 'over the cap every kind keeps a slot (the lone boil is never pushed off by glow trails)', { packed, marks: d.signMarks });
}
{
  // a glow trail's head follows its fish: calls 0.3 m apart within 0.8 s move one mark; then a new mark starts
  const ctx = fakeCtx({ v3: true });
  const w = createWater(ctx); w.init();
  const U = w.material.uniforms;
  for (let i = 0; i < 5; i++) { w.addRipple(i * 0.3, 0, 0.8, { kind: 'glow', size: 0.6 }); ctx.time.t += 0.1; }
  w.update(0.016);
  let d = ctx.debug.water();
  ok(d.signMarks.glow === 1 && near(U.uRip.value[0], 1.2, 1e-6), 'glow calls close in time and space move the trail\'s head', { marks: d.signMarks, x: U.uRip.value[0] });
  ctx.time.t += 0.5; w.addRipple(1.5, 0, 0.8, { kind: 'glow', size: 0.6 });
  w.update(0.016);
  d = ctx.debug.water();
  ok(d.signMarks.glow === 2, 'past 0.8 s the head stays behind and a new mark leads', d.signMarks);
  w.addRipple(9, 9, 0.8, { kind: 'glow', size: 0.6 });
  w.update(0.016);
  ok(ctx.debug.water().signMarks.glow === 3, 'a second trail far away gets its own mark');
  // sign wakes of one trail merge (one V per ~0.6 m of trail), other trails do not
  for (let i = 0; i < 6; i++) { w.addWake(i * 0.1, 0, 1, 0, 0.5 + i * 0.05, { kind: 'glow' }); ctx.time.t += 0.1; }
  w.addWake(20, 0, 1, 0, 0.5, { kind: 'glow' });
  w.update(0.016);
  ok(ctx.debug.water().signWakeN === 2, 'sign wakes laid 0.1 m apart fold into one mark; a far trail keeps its own', ctx.debug.water().signWakeN);
  ok(near(U.uWake.value[3] - 24, 0.75, 1e-6) || near(U.uWake.value[7] - 24, 0.75, 1e-6), 'the folded mark keeps the strongest strength', [U.uWake.value[3], U.uWake.value[7]]);
}
{
  // a v1 / v2 build: no GW_V3 shader, so a tagged mark is drawn as a plain ripple / wake and never packed as a sign
  const ctx = fakeCtx({ v3: false });
  const w = createWater(ctx); w.init();
  const U = w.material.uniforms;
  ok(Object.keys(U).length === 38 && !('uGlowtide' in U), 'v1 build: the base 38 uniforms (no uGlowtide)', Object.keys(U).length);
  ok(!('GW_V3' in w.material.defines) && w.signKinds === undefined, 'v1 build: no GW_V3 define, no signKinds');
  w.addRipple(3, 3, 0.8, { kind: 'boil', size: 1.2 });
  w.addWake(4, 4, 1, 0, 0.6, { kind: 'glow' });
  w.update(0.016);
  const d = ctx.debug.water();
  ok(d.signRipN === 0 && U.uRipN.value === 1 && U.uRip.value[3] < 64 && near(U.uRip.value[3], 0.8, 1e-6), 'v1 build: a tagged ripple is a plain ripple', { n: U.uRipN.value, w: U.uRip.value[3] });
  ok(d.signWakeN === 0 && U.uWakeN.value === 1 && U.uWake.value[3] <= 1, 'v1 build: a tagged wake is a plain wake', { n: U.uWakeN.value, w: U.uWake.value[3] });
  w.setGlowtide(1); for (let i = 0; i < 20; i++) w.update(0.05);
  ok(w.glowtide === 0, 'v1 build: setGlowtide is accepted and does nothing');
}
{
  // a sign's tagged wake is not the player's: water's fallback raft wake still runs beside it
  const ctx = fakeCtx({ v3: true });
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
  ok(w1.glowtide === 0 && !('uGlowtide' in w1.material.uniforms), 'flag off: no Glowtide at night');
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
  const cd = fakeCtx({ v3: true, phase: 'gloomtide', k: 0.5, outing: 'descent' });
  const wd = createWater(cd); wd.init();
  for (let i = 0; i < 200; i++) wd.update(0.05);
  ok(wd.material.uniforms.uGlowtide.value === 0, 'The Long Descent keeps the v1 / v2 water: no Glowtide by itself');
}
console.log('- glowtideFor');
ok(glowtideFor(null) === 0 && glowtideFor({ phase: 'calm', k: 0.9 }) === 0, 'calm / none: 0');
ok(glowtideFor({ phase: 'dusk', k: 0.3 }) === 0 && near(glowtideFor({ phase: 'dusk', k: 1 }), 0.4, 1e-9), 'dusk: a glimmer only at its end');
ok(near(glowtideFor({ phase: 'gloomtide', k: 0 }), 0.4, 1e-9) && glowtideFor({ phase: 'gloomtide', k: 0.5 }) === 1 && near(glowtideFor({ phase: 'gloomtide', k: 1 }), 0.75, 1e-9), 'night: continuous from dusk, full, easing out');
ok(near(glowtideFor({ phase: 'dawn', k: 0 }), 0.75, 1e-9) && glowtideFor({ phase: 'dawn', k: 0.6 }) === 0, 'dawn: continuous, fades out by half-way');

console.log(`\nwater-signs: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
