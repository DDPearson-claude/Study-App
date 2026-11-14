// The opening cut scene's SET AND PICTURE (lane A; docs/v3/intro/SPEC.md §4–§6, §10 A6 / A9): the score (introScore, introWindow:
// every piece of the set as a pure function of timeline time), the composition rules of §5 by projection in both orientations, and
// the stage on a real three.js scene with a fake game around it (slices, purity on the real objects, the cost budget on every
// tier, no light, the hooks it drives, disposal). The pictures themselves are judged on tools/tests/intro-shots.scenario.mjs.
//   node tools/tests/intro-stage.test.mjs
globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
// a DOM just big enough for toon.glowTexture (the sprites' shared texture is a canvas)
globalThis.document = globalThis.document || { createElement: () => ({ width: 0, height: 0, getContext: () => ({ createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }), putImageData() {} }) }) };
const THREE = await import('three');
const D = await import('../../src/data.js');
const STG = await import('../../src/intro-stage.js');
const MOD = await import('../../src/intro-models.js');
const { REFLECT_LAYER } = await import('../../src/toon.js');

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const near = (a, b, eps, msg) => ok(Math.abs(a - b) <= eps, `${msg} (got ${a}, want ${b} ± ${eps})`);
const section = (s) => console.log(`- ${s}`);
const I = D.INTRO, S = I.set, F = S.fall, B = S.below, W = S.wick, CUT = I.cut.at;
const A = { S: { x: 0, z: 46 }, G: { x: 0, z: -77.63, face: 0 } };
const LAND = 16 / 9, PORT = 390 / 844;
const sc = (t, o = {}) => STG.introScore(I, t, { aspect: LAND, ...o }, {});
const beat = (id) => I.beats.find((b) => b.id === id);
const lineUp = (t) => I.lines.some((l) => t >= l.at && t < l.out);

// ------------------------------------------------------------------ the score is a pure function of t
section('score: pure, and silent before the swap');
{ const a = JSON.stringify(sc(6.7)); sc(17); sc(9.9); sc(0.1); eq(JSON.stringify(sc(6.7)), a, 'introScore(t) does not depend on what was asked before');
  const out = {}; STG.introScore(I, 10.6, { aspect: LAND }, out); STG.introScore(I, 3, { aspect: LAND }, out); eq(JSON.stringify(out), JSON.stringify(sc(3)), 'a reused `out` carries nothing over');
  const s = sc(0.2); ok(!s.on && !s.lantern.vis && !s.windows && !s.card.vis && !s.kindle.on && s.lantern.water === 0, 'before INTRO.swapAt: nothing of the set, the raft\'s light left alone');
  const e = sc(I.length); ok(e.end && e.kindle.on && e.kindle.wick === 1 && e.kindle.lantern === 1 && !e.lantern.vis && !e.windows && !e.card.vis && !e.flank.vis && !e.ember.vis && e.spark.k === 0, 'the end state: the set gone, the ink clear, the Wick and its lantern fully lit'); }

section('score: the lit kingdom');
{ const s = sc(3);
  ok(s.lantern.vis && Math.abs(s.lantern.y - S.lantern.at[2]) < 1e-9 && s.lantern.tilt === 0 && s.chains.a.vis && s.chains.bc.vis && s.chains.a.lift === 0, 'the lantern hangs at rest on all its chains');
  ok(s.lantern.water > 0.9 && s.lantern.glow > 0.9, 'its light is on the water');
  ok(s.kindle.on && s.kindle.wick === 0 && s.kindle.lantern === 0, 'one warm light: the raft\'s own lantern and the Wick\'s flame are out');
  let lit = 0; for (let r = 0; r < S.windows.rows; r++) if (STG.introWindow(I, 3, r, 0.5, {}).k > 0.7) lit++;
  eq(lit, S.windows.rows, 'every row of windows is lit'); }

section('score: the fall');
{ ok(sc(F.part + 0.2).chains.a.lift > 5 && sc(F.part + 0.2).chains.bc.lift === 0 && sc(F.part + 0.2).lantern.tilt > 0.02, 'one chain parts first: it whips up, and the lantern lurches');
  ok(sc(F.part + 0.05).chains.spark.k > 0.5 && sc(F.part + 0.05).chains.spark.which === 0 && sc(F.drop + 0.06).chains.spark.which === 1 && sc(F.drop + 0.4).chains.spark.k === 0, 'a spark where each chain parts');
  ok(!sc(F.drop + 0.6).chains.a.vis && !sc(F.drop + 0.6).chains.bc.vis, 'the chains above the breaks are gone once it falls');
  let prev = Infinity, mono = true; for (let t = F.drop; t <= F.contact; t += 0.05) { const y = sc(t).lantern.y; if (y > prev + 1e-9) mono = false; prev = y; }
  ok(mono, 'it only goes down');
  near(sc(F.contact).lantern.y, F.restY, 1e-6, 'its foot meets the water at INTRO.set.fall.contact');
  near(sc(F.contact).lantern.tilt, F.tilt, 1e-6, 'tilted by INTRO.set.fall.tilt');
  ok(sc(F.drop + 0.5).lantern.y - sc(F.drop + 1).lantern.y < sc(F.drop + 1.5).lantern.y - sc(F.contact).lantern.y, 'slow, then fast (it is heavy)');
  ok(sc(F.contact + 0.2).lantern.y < F.restY, 'and it goes under'); }

section('score: the windows go out behind it, and the lake remembers');
{ const rows = S.windows.rows, start = [], w = {};
  for (let r = 0; r < rows; r++) start.push(STG.introWindow(I, 0, r, 0, w).start);
  ok(start.every((s, r) => r === 0 || s < start[r - 1]), 'the top row goes first, the lowest last');
  ok(start[rows - 1] > F.drop && start[rows - 1] < F.drop + 0.5, 'the dark starts as the lantern drops');
  let late = 0; for (let r = 0; r < rows; r++) for (const seed of [0, 0.5, 1]) if (STG.introWindow(I, F.contact, r, seed, w).k > 1e-6) late++;
  eq(late, 0, 'every window is out by the contact (only the lantern is left)');
  { const a = STG.introWindow(I, start[4] + 0.08, 4, 0, {}).k, b = STG.introWindow(I, start[4] + 0.15, 4, 0, {}).k, c = STG.introWindow(I, start[4] + 0.3, 4, 0, {}).k; ok(a < 0.5 * 1.3 && b > a && c < b, 'a window gutters: it dips, flares once, and goes'); }
  { const t = start[6] + S.dark.gutter + 0.3, x = STG.introWindow(I, t, 6, 0, {}); ok(x.k === 0 && x.mk > 0.7 && x.rise > 0 && x.rise < S.memory.rise, 'its reflection stays lit after the window is dark, and has begun to sink');
    const y = STG.introWindow(I, start[6] + S.memory.linger + 0.01, 6, 0, {}); ok(y.mk === 0 && Math.abs(y.rise - S.memory.rise) < 0.2, '… for INTRO.set.memory.linger, sinking INTRO.set.memory.rise'); }
  ok(STG.introWindow(I, CUT - 0.01, 0, 0.5, {}).mk > 0.3, 'at the contact the lowest reflections are still lit: the lake outlives the towers');
  ok([0.1, 0.5, 0.9].every((seed) => { const a = STG.introWindow(I, 2, 3, seed, {}).k; return a > 0.7 && a < 1.3; }) && STG.introWindow(I, 2, 3, 0.1, {}).k !== STG.introWindow(I, 2, 3, 0.9, {}).k, 'no two windows burn alike'); }

section('score: the contact and the cut');
{ const s = sc(F.contact + 0.02); ok(s.lantern.flash > 0.7 && s.lantern.haloSize > S.lantern.halo.size && s.ring.vis && s.ring.r >= S.contact.ring.r[0], 'a flash and one ring at the contact');
  ok(sc(F.contact + S.contact.flash).lantern.flash === 0, 'the flash is over in INTRO.set.contact.flash');
  near(sc(F.contact + 0.02, { reduced: true }).lantern.flash, s.lantern.flash / 4, 1e-9, 'reduced: the flash is quartered');
  ok(sc(F.contact + 0.2).ring.r > s.ring.r && sc(F.contact + 0.2).ring.k < s.ring.k, 'the ring widens and fades');
  ok(sc(F.contact + S.contact.flash + 0.01).lantern.water === 0, 'its light leaves the water with it');
  const a = sc(CUT - 0.01), b = sc(CUT);
  ok(a.card.opacity === 0 && a.lantern.vis && a.windows && b.card.opacity === 1 && b.card.vis && !b.lantern.vis && !b.windows && !b.ring.vis, 'one hard cut at INTRO.cut.at: the world, then ink');
  const d = sc(CUT - 0.15, { reduced: true }); ok(d.card.opacity > 0.1 && d.card.opacity < 0.9 && sc(CUT - 0.31, { reduced: true }).card.opacity === 0, 'reduced: the cut is a 0.3 s dip into the ink'); }

section('score: the dark below');
for (const [name, aspect] of [['landscape', LAND], ['portrait', PORT]]) {
  const at = (t) => STG.introScore(I, t, { aspect }, {});
  const band = I.words.band[name], fy = (y) => 0.5 - y;      // picture y (up, from the middle) → fraction from the top
  const e0 = at(CUT), e1 = at(B.ember.sinkUntil);
  near(fy(e0.ember.y), B.ember.from[1], 1e-6, `${name}: the ember starts where the lantern went under`);
  near(fy(e1.ember.y), B.ember.to[1], 0.01, `${name}: … and has sunk to its place by sinkUntil`);
  ok(e0.ember.size > e1.ember.size * 3 && e0.ember.heat === 0 && e1.ember.heat === 1 && e0.ember.k === 1, `${name}: it shrinks and cools as it sinks`);
  let inBand = 0, warmOnly = true; for (let t = CUT; t < beat('below').t1; t += 0.05) { const s = at(t); if (s.ember.vis && fy(s.ember.y) > band[0]) inBand++; if (s.lantern.vis || s.windows) warmOnly = false; }
  eq(inBand, 0, `${name}: the ember never sits in the words band`); ok(warmOnly, `${name}: the ember is the only warm thing in the dark`);
  const fl = B.flank, half = (aspect / 2) * Math.abs(Math.cos(at(10).flank.angle)) + 0.5 * Math.abs(Math.sin(at(10).flank.angle));
  ok(!at(fl.enter - 0.01).flank.vis && at(fl.enter + 0.01).flank.vis && Math.abs(at(fl.enter).flank.nose + half) < 0.1, `${name}: the flank's nose enters the picture at enter`);
  ok(Math.abs(at(fl.eye).flank.eyeAt) < half, `${name}: its eye is in the picture at INTRO.set.below.flank.eye`);
  ok(at(fl.cover - 0.05).ember.covered < 0.5 && at(fl.cover + 0.15).ember.covered === 1 && at(fl.cover + 0.15).flank.emberK > 0.7, `${name}: it takes the ember at cover, and the ember glows through it`);
  ok(at(fl.cover + 0.3).ember.k < 0.6 && at(fl.cover + 0.3).ember.k > 0.3, `${name}: the ember shows through, dimmed`);
  { const a = at(fl.cover + 0.2).ember, b = at(fl.leave - 0.1).ember; ok(Math.hypot(b.x - a.x, b.y - a.y) > 0.3, `${name}: the glow travels off with it`);
    const out = at(fl.leave + 0.05).ember; ok(!out.vis || Math.abs(out.x) > aspect / 2 || Math.abs(out.y) > 0.5, `${name}: … and is out of the picture by leave`); }
  ok(at(fl.out - 0.01).flank.alpha < 0.05 && !at(fl.out).flank.vis && !at(fl.out).ember.vis, `${name}: gone by out`);
  const len = fl.length * at(10).flank.unit; ok(len > 2 * half * 1.3 && fl.girth * at(10).flank.unit > (name === 'landscape' ? 1 : aspect), `${name}: too big for the frame (never its nose and its tail at once: ${len.toFixed(2)} long in a picture ${(2 * half).toFixed(2)} across its path)`);
  let mono = true, p = -Infinity; for (let t = fl.enter; t <= fl.out; t += 0.02) { const n = at(t).flank.nose; if (n < p) mono = false; p = n; } ok(mono, `${name}: it only swims on`);
  if (name === 'portrait') near((at(10).flank.angle * 180) / Math.PI, fl.portraitAngle, 1e-6, 'portrait: it crosses on its diagonal'); else eq(at(10).flank.angle, 0, 'landscape: it crosses level');
  ok(at(beat('below').t1 - 0.1).motes < 0.05 && at(9).motes > 0.5, `${name}: motes in the dark, gone before the spark`);
}

section('score: the Wick');
{ ok(sc(W.spark + 0.1).spark.k > 0.5 && sc(W.spark - 0.01).spark.k === 0 && sc(W.spark + 0.4).spark.k === 0, 'a spark at INTRO.set.wick.spark');
  eq(W.flame.map(([t]) => +sc(t).kindle.wick.toFixed(6)), W.flame.map(([, k]) => k), 'the flame catches, gutters, catches (INTRO.set.wick.flame)');
  ok(sc(W.lantern[0]).kindle.lantern === 0 && sc((W.lantern[0] + W.lantern[1]) / 2).kindle.lantern > 0.3 && sc(W.lantern[1]).kindle.lantern === 1, 'then its hanging lantern takes');
  ok(sc(W.lift[0] - 0.01).card.open === 0 && sc(W.lift[0] - 0.01).card.opacity === 1, 'the ink is whole until the spark has caught');
  { let prev = -1, drops = 0; for (let t = W.lift[0] + 0.3; t <= W.lift[1]; t += 0.02) { const o = sc(t).card.open; if (o < prev - 1e-9) drops++; prev = o; } eq(drops, 0, 'once it thins, the ink only opens'); }
  ok(sc(W.lift[1]).card.open === 1 && !sc(W.lift[1]).card.vis && sc(W.lift[1] - 0.05).card.opacity < 0.2, 'the ink is gone by INTRO.set.wick.lift'); }

// ------------------------------------------------------------------ §5: the composition, by projection, in both orientations
section('composition (SPEC §5)');
const cam = new THREE.PerspectiveCamera();
function shoot(t, aspect) {
  const c = STG.introCamera(I, t, aspect), pos = STG.resolvePoint(c.pos, A), look = STG.resolvePoint(c.look, A);
  cam.fov = c.fov; cam.aspect = aspect; cam.near = 0.25; cam.far = 900; cam.updateProjectionMatrix();
  cam.position.set(...pos); cam.up.set(0, 1, 0); cam.lookAt(...look); cam.updateMatrixWorld(); cam.matrixWorldInverse.copy(cam.matrixWorld).invert();
  return (x, y, z) => { const v = new THREE.Vector3(x, y, z).project(cam); return [v.x * 0.5 + 0.5, 1 - (v.y * 0.5 + 0.5), v.z < 1]; };
}
const hang = STG.resolvePoint(S.lantern.at, A), H = S.lantern.height;
for (const [name, aspect] of [['landscape', LAND], ['portrait', PORT]]) {
  const band = I.words.band[name], bad = { frame: [], water: [], band: [], raft: [] };
  for (let t = 1.4; t <= F.contact + 1e-9; t += 0.1) {
    const P = shoot(t, aspect), y = STG.introScore(I, t, { aspect }, {}).lantern.y, top = y + H * 0.62, foot = Math.max(0, y - H * 0.6);
    const fTop = P(hang[0], top, hang[2])[1], mFoot = P(hang[0], -top, hang[2])[1], l = P(hang[0] - S.lantern.radius * 1.3, y, hang[2])[0], r = P(hang[0] + S.lantern.radius * 1.3, y, hang[2])[0];
    if (!(fTop > 0.005 && mFoot < 0.995 && l > 0 && r < 1 && P(hang[0], foot, hang[2])[1] < 1)) bad.frame.push(t.toFixed(1));
    const water = P(0, 0, A.G.z + 16)[1]; if (!(water >= 0.46 && water <= 0.56)) bad.water.push(`${t.toFixed(1)}:${(water * 100).toFixed(1)}`);
    if (lineUp(t) && mFoot > band[0]) bad.band.push(`${t.toFixed(1)}:${(mFoot * 100).toFixed(1)}`);
    const raft = P(A.S.x, 1, A.S.z); if (raft[2] && raft[0] > 0 && raft[0] < 1 && raft[1] > 0 && raft[1] < 1) bad.raft.push(t.toFixed(1));
  }
  eq(bad.frame, [], `${name} (a): the lantern and its mirror image are wholly in frame from 1.4 s to the contact`);
  eq(bad.water, [], `${name} (a): the waterline stays between 46 % and 56 %`);
  eq(bad.band, [], `${name} (b): the lantern's mirror image stays out of the words band while a line is up`);
  eq(bad.raft, [], `${name} (c): the raft is not in the gate take`);
  // (d) the Wick's flame (≈ 1.9 m over the deck at the spawn) in the lower-left third, above the band; both towers in frame
  for (const t of [W.spark, 13.4, beat('wick').t1 - 0.01]) {
    const P = shoot(t, aspect), f = P(A.S.x + 0.1, 1.9, A.S.z + 0.16), tw = [P(A.G.x - 13, 24, A.G.z), P(A.G.x + 13, 24, A.G.z)];
    ok(f[0] > 0.02 && f[0] < 0.45 && f[1] > 0.5 && f[1] < band[0], `${name} (d) t ${t}: the Wick's flame is in the lower-left third, above the words band (${(f[0] * 100).toFixed(0)}, ${(f[1] * 100).toFixed(0)} %)`);
    ok(tw.every((p) => p[2] && p[0] > 0 && p[0] < 1 && p[1] > 0 && p[1] < 1), `${name} (d) t ${t}: both towers are in frame`);
  }
}
{ const tk = I.cameras.takes.at(-1); ok(tk.rig === 'sail' && tk.blend[1] <= I.length - 0.4, '(e) the crane home ends at least 0.4 s before the end');
  const a = STG.introCamera(I, 3, LAND), b = STG.introCamera(I, 3, PORT); ok(JSON.stringify(a.look) !== JSON.stringify(b.look) && a.fov !== b.fov, '(f) portrait has its own keys'); }

// ------------------------------------------------------------------ the models
section('models: the windows, the flank');
{ const lay = MOD.windowLayout(A.G, S.windows);
  eq(lay.length, 2 * S.windows.perTower, '54 windows');
  ok(lay.every((w) => w.z > A.G.z + 3 && w.z < A.G.z + 6 && Math.abs(Math.abs(w.x) - 13) < 3 && w.y >= S.windows.y0 && w.y < 34), 'all on the towers\' lake faces, between the foot and the eaves');
  let clash = 0; for (let i = 0; i < lay.length; i++) for (let j = i + 1; j < lay.length; j++) if (Math.abs(lay[i].x - lay[j].x) < 0.9 && Math.abs(lay[i].y - lay[j].y) < 2.2) clash++;
  eq(clash, 0, 'no two windows overlap');
  ok(lay.every((w) => w.seed >= 0 && w.seed < 1) && new Set(lay.map((w) => w.seed.toFixed(6))).size === lay.length && JSON.stringify(lay) === JSON.stringify(MOD.windowLayout(A.G, S.windows)), 'each has its own seed, and the layout is the same every time (no Math.random)');
  const p = MOD.flankPoint(0, 0, B.flank), q = MOD.flankPoint(1, 0, B.flank); near(p[0] - q[0], B.flank.length, 1e-9, 'the flank is INTRO.set.below.flank.length from nose to tail root');
  let tall = 0; for (let s = 0; s <= 1; s += 0.01) tall = Math.max(tall, MOD.flankPoint(s, 1, B.flank)[1] - MOD.flankPoint(s, -1, B.flank)[1]); near(tall, B.flank.girth, 0.05, '… and its girth'); }

// ------------------------------------------------------------------ the stage on a real three.js scene, a fake game around it
function game({ tier = 'high', mirror = true } = {}) {
  const calls = { cams: [], mood: [], light: [], kindle: [], warm: [], splash: 0, snap: 0 };
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(50, LAND, 0.25, 900); scene.add(camera);
  const ctx = { data: D, errors: [], state: { meta: { runs: 0 }, run: null }, flow: 'title' };
  ctx.render = { scene, camera, quality: tier, renderer: { info: { memory: { geometries: 0, textures: 0 } }, getDrawingBufferSize: (v) => v.set(960, 540) },
    setIntroCamera(p) { calls.cams.push(p ? { pos: [...p.pos], look: [...p.look], fov: p.fov, w: p.w } : null); }, snapCamera() { calls.snap++; }, warmPrograms(o) { calls.warm.push(o.name); return true; } };
  ctx.world = { getSpawn: () => ({ position: { x: A.S.x, y: 0, z: A.S.z }, yaw: 0 }), getHeroAnchor: () => ({ x: A.G.x, z: A.G.z, face: 0, theme: 'mossmere' }),
    setIntroMood(on) { calls.mood.push(on); }, setIntroWaterLight(l) { calls.light.push(l ? { ...l } : null); }, isOpenWater: () => true };
  ctx.actors = { setIntroKindle(k) { calls.kindle.push(k ? { ...k } : null); }, getHeadPos: (o = new THREE.Vector3()) => o.set(A.S.x + 0.1, 1.9, A.S.z + 0.16) };
  ctx.water = { reflection: { on: mirror }, splash() { calls.splash++; } };
  return { ctx, calls, scene, camera };
}
const parts = (g) => [g.scene.getObjectByName('intro:set'), g.camera.getObjectByName('intro:below')].filter(Boolean);
/** Everything the stage shows, as a string: transforms, visibility, colours, opacities, uniforms, instance colours and matrices. */
function digest(g) {
  const out = [], r = (x) => Math.round(x * 1e5) / 1e5;
  const visit = (o, shown) => {
    shown = shown && o.visible;
    if (!shown) { out.push(`${o.name},hidden`); return; }
    const m = o.material, row = [o.name, ...o.position.toArray().map(r), ...o.quaternion.toArray().map(r), ...o.scale.toArray().map(r)];
    if (o.matrixAutoUpdate === false) row.push(...o.matrix.elements.map(r));
    if (m) { if (m.color) row.push(...m.color.toArray().map(r)); if (m.opacity !== undefined) row.push(r(m.opacity)); if (m.uniforms) for (const k of Object.keys(m.uniforms)) { const v = m.uniforms[k].value; row.push(typeof v === 'number' ? r(v) : v && v.toArray ? v.toArray().map(r).join('/') : ''); } }
    if (o.isInstancedMesh) row.push(Array.from(o.instanceColor.array).map(r).join('/'), Array.from(o.instanceMatrix.array).map(r).join('/'));
    if (o.isPoints && o.geometry.attributes.aColor) row.push(Array.from(o.geometry.attributes.aColor.array).map(r).join('/'));
    out.push(row.join(','));
    for (const ch of o.children) visit(ch, shown);
  };
  for (const p of parts(g)) visit(p, true);
  return out.join('|');
}
const STRIP = []; for (let t = 0; t <= I.length + 1e-9; t += 0.25) STRIP.push(+t.toFixed(2));

section('stage: building in slices');
{ const g = game(), st = STG.createIntroStage(g.ctx);
  ok(st.ready === false, 'not ready before prebuild()');
  let n = 0; while (!st.prebuild() && n++ < 40) { /* one slice a call */ }
  ok(st.ready && n >= 2, `prebuild() works in slices (${n + 1}) and reports ready`);
  eq(parts(g).length, 0, 'prebuild() adds nothing to the scene');
  ok(g.calls.warm.length >= 5 && g.calls.cams.length === 0 && g.calls.mood.length === 0 && g.calls.kindle.length === 0, 'it warms the set\'s programs and touches nothing you can see');
  ok(st.prebuild() === true, 'idempotent once ready');
  st.enter({}); st.enter({});
  eq(parts(g).length, 2, 'enter() puts the set in the scene and the dark beat\'s things on the camera');
  ok(parts(g).every((p) => !p.visible), '… all hidden until the first setTime past the swap');
  st.dispose(); }
{ const g = game(), st = STG.createIntroStage(g.ctx); st.enter({}); ok(st.ready && parts(g).length === 2, 'enter() builds at once whatever the idle slices left');
  st.dispose(); }

section('stage: a pure function of t on the real objects');
{ const g = game(), st = STG.createIntroStage(g.ctx); st.enter({});
  const ref = new Map();
  for (const t of STRIP) { st.setTime(t, {}); ref.set(t, digest(g)); }
  let diff = [];
  for (const t of [...STRIP].reverse()) { st.setTime(t, {}); if (digest(g) !== ref.get(t)) diff.push(t); }
  eq(diff, [], 'the same picture going backwards through the film');
  diff = []; for (const t of [7.9, 0.3, 13, 9.5, 5.7, 18, 10.5, 3.6, 12.6]) { st.setTime(17.2, {}); st.setTime(t, { seek: true }); const a = digest(g); st.setTime(4.4, {}); st.setTime(t, { seek: true }); if (a !== digest(g)) diff.push(t); }
  eq(diff, [], 'the same picture after any other moment');
  st.setTime(0.2, {}); ok(parts(g).every((p) => !p.visible), 'before the swap nothing shows');
  st.setTime(I.length, {}); ok(parts(g).every((p) => !p.visible), 'at the end nothing shows');
  st.setTime(3.6, {}); const lan = g.scene.getObjectByName('intro:lantern'), hangG = g.scene.getObjectByName('intro:hang');
  eq([lan.position.x, lan.position.y, lan.position.z], hang, 'the lantern hangs at INTRO.set.lantern.at');
  ok(hangG.visible && g.scene.getObjectByName('intro:chain-a').visible && !g.scene.getObjectByName('intro:ink-card').visible, 'lit: chains whole, no ink');
  st.setTime(10.5, {}); ok(g.scene.getObjectByName('intro:ink-card').visible && g.camera.getObjectByName('intro:flank').parent.visible && g.camera.getObjectByName('intro:ember-core').visible && !lan.visible && !g.scene.getObjectByName('intro:windows').visible, 'below: the ink card, the flank and the ember, nothing of the lake\'s');
  { const card = g.scene.getObjectByName('intro:ink-card'), fl = g.camera.getObjectByName('intro:flank'), em = g.camera.getObjectByName('intro:ember-core');
    ok(card.renderOrder >= 900 && fl.renderOrder > card.renderOrder && em.renderOrder > fl.renderOrder && card.material.depthWrite && card.material.depthFunc === THREE.AlwaysDepth && em.material.depthTest === false, 'the card is drawn after the world and resets the depth; the flank and the ember stand in front of it'); }
  st.dispose(); }

section('stage: cost (A9) on every tier, and nothing it must not make');
for (const [tier, mirror] of [['high', true], ['medium', true], ['low', false]]) {
  const g = game({ tier, mirror }), st = STG.createIntroStage(g.ctx); st.enter({});
  let worst = { calls: 0, triangles: 0 };
  for (const t of STRIP) { st.setTime(t, {}); const s = st.stats(); if (s.calls > worst.calls) worst = { ...worst, calls: s.calls, at: t }; if (s.triangles > worst.triangles) worst = { ...worst, triangles: s.triangles, atT: t }; }
  ok(worst.calls <= S.budget.calls && worst.triangles <= S.budget.triangles, `${tier}: the set's peak is ${worst.calls} calls (t ${worst.at}) and ${worst.triangles} triangles (t ${worst.atT}); budget ${S.budget.calls} / ${S.budget.triangles}`);
  let lights = 0, shadows = 0; g.scene.traverse((o) => { if (o.isLight) lights++; if (o.castShadow) shadows++; });
  eq([lights, shadows], [0, 0], `${tier}: no light, nothing that casts into a shadow map`);
  const own = new Set(), shared = new Set();
  for (const p of parts(g)) p.traverse((o) => { const m = o.material; if (!m) return; for (const k of ['map', 'gradientMap']) if (m[k]) shared.add(m[k].uuid); if (m.uniforms) for (const u of Object.values(m.uniforms)) if (u.value && u.value.isTexture) own.add(u.value.uuid); });
  ok(own.size === 0 && shared.size <= 2 && st.stats().textures <= S.budget.textures, `${tier}: no texture of its own (it shares the toon ramp and the glow sprite's)`);
  const twin = g.scene.getObjectByName('intro:windows-memory'), win = g.scene.getObjectByName('intro:windows');
  if (S.memory.tiers.includes(tier)) ok(!!twin && twin.layers.mask === (1 << REFLECT_LAYER) && !win.layers.isEnabled(REFLECT_LAYER), `${tier}: the lake's memory is a mirror-only twin of the windows`);
  else ok(!twin && win.layers.isEnabled(REFLECT_LAYER), `${tier}: no twin`);
  ok(st.stats().geometries <= 18, `${tier}: ${st.stats().geometries} geometries`);
  st.dispose();
}

section('stage: the hooks it drives');
// where the lake is a mirror the reflection carries the gold: the pool is at INTRO's intensityMirror there (0: never set)
{ const g = game({ mirror: true }), st = STG.createIntroStage(g.ctx); st.enter({});
  for (const t of [2, 5, 7.5, 7.95, 8.4]) st.setTime(t, {});
  const want = S.lantern.water.intensityMirror ?? S.lantern.water.intensity;
  if (want <= 0.001) ok(g.calls.light.every((l) => l === null), 'mirror tiers: the lantern lays no pool on the water (its reflection is the gold)');
  else ok(g.calls.light.some((l) => l && l.intensity > 0 && l.intensity <= want * 2.3), 'mirror tiers: the pool at its own, lower level');
  st.dispose(); }
{ const g = game({ mirror: false }), st = STG.createIntroStage(g.ctx); st.enter({});   // (no mirror: the pool and the gold path are the lantern's reflection)
  st.setTime(0.2, {}); eq([g.calls.kindle.length, g.calls.light.length, g.calls.mood.length], [0, 0, 0], 'before the swap: no hook is touched');
  st.setTime(2, {}); eq(g.calls.kindle.at(-1), { wick: 0, lantern: 0 }, 'from the swap: the raft\'s fire is out'); eq(g.calls.mood, [true], '… and the world wears the run\'s opening mood');
  const L = g.calls.light.at(-1); ok(L && L.x === hang[0] && L.z === hang[2] && Math.abs(L.y - hang[1]) < 1e-9 && L.intensity > S.lantern.water.intensity * 0.9 && L.radius === S.lantern.water.radius && L.streak === S.lantern.water.streak, 'the lantern\'s light on the water, at the lantern');
  st.setTime(7.5, {}); ok(g.calls.light.at(-1).y < hang[1] - 3, '… follows it down');
  st.setTime(8.4, {}); eq(g.calls.light.at(-1), null, '… and is taken off once it is under');
  st.setTime(13.0, {}); { const k = g.calls.kindle.at(-1); ok(k.wick > 0 && k.wick < 1 && k.lantern === 0, 'the Wick\'s flame is catching'); }
  st.setTime(16, {}); eq(g.calls.kindle.at(-1), { wick: 1, lantern: 1 }, 'home: both fully lit (releasing the hook changes nothing)');
  st.setTime(0.1, {}); eq(g.calls.kindle.at(-1), null, 'sought back before the swap: the raft\'s fire is the game\'s again'); eq(g.calls.mood.at(-1), false, '… and the mood');
  ok(g.calls.kindle.every((k) => k === null || (k.wick >= 0 && k.wick <= 1 && k.lantern >= 0 && k.lantern <= 1)), 'kindle values stay within 0 … 1');
  // the live splash: once, forward, never on a seek
  eq(g.calls.splash, 0, 'no splash so far (nothing was live)');
  st.setTime(F.contact - 0.05, { live: true }); st.setTime(F.contact + 0.02, { live: true }); eq(g.calls.splash, 1, 'live: one splash as the contact is crossed');
  st.setTime(F.contact + 0.1, { live: true }); st.setTime(F.contact - 0.05, { live: true, seek: true }); st.setTime(F.contact + 0.02, { live: true, seek: true }); eq(g.calls.splash, 1, '… never again, and never on a seek');
  st.exit(); st.exit();
  eq([g.calls.cams.at(-1), g.calls.mood.at(-1), g.calls.light.at(-1), g.calls.kindle.at(-1)], [null, false, null, null], 'exit() gives back the camera, the mood, the water light and the raft\'s fire');
  eq(parts(g).length, 0, '… and takes the set out of the scene');
  st.dispose(); }

section('stage: a replay from another lake\'s title');
{ const g = game(), st = STG.createIntroStage(g.ctx);
  // prebuilt under a title that shows another lake (its landmark stands elsewhere) …
  const moss = g.ctx.world.getHeroAnchor;
  g.ctx.world.getHeroAnchor = () => ({ x: 40, z: -60, face: 0.5, theme: 'sporewood' });
  while (!st.prebuild()) { /* slices */ }
  st.enter({ replay: true }); st.setTime(0.2, {});
  // … and under the opening's full ink main swaps the Mossmere in: at the swap the stage stands on the lake that is there now
  g.ctx.world.getHeroAnchor = moss;
  st.setTime(1, {});
  const lan = g.scene.getObjectByName('intro:lantern');
  eq([lan.position.x, lan.position.z], [hang[0], hang[2]], 'the set is rebuilt on the Mossmere\'s anchors at the swap');
  eq(g.calls.cams.at(-1).pos, STG.resolvePoint(STG.introCamera(I, 1, LAND).pos, A), '… and the camera flies from them');
  eq(parts(g).length, 2, 'one set in the scene, not two'); ok(g.scene.getObjectByName('intro:windows').visible, 'the windows are on its towers');
  st.dispose();
  // a world that cannot say yet where things stand (no lake built): prebuild() waits without an error, and the set is built
  // the moment the film needs it
  g.ctx.world.getHeroAnchor = () => null;
  ok(st.prebuild() === false && st.prebuild() === false && !st.ready, 'no anchors yet: prebuild() waits, and does not throw');
  st.enter({}); eq(parts(g).length, 0, '… the film can still be entered (camera only)');
  g.ctx.world.getHeroAnchor = moss;
  st.setTime(2, {}); ok(parts(g).length === 2 && g.scene.getObjectByName('intro:lantern').visible, '… and the set is built at the swap once the world can say');
  st.dispose();
  // a lake with no Sunken Gate: the film still runs, without windows floating in the air
  g.ctx.world.getHeroAnchor = () => ({ x: 0, z: -77.63, face: 0, theme: 'glasswater' });
  st.enter({}); st.setTime(3, {}); ok(g.scene.getObjectByName('intro:lantern').visible && !g.scene.getObjectByName('intro:windows').visible, 'no towers, no windows');
  st.dispose(); }

section('stage: disposal');
{ const g = game(), st = STG.createIntroStage(g.ctx); st.enter({}); st.setTime(7, {}); st.setTime(10.5, {});
  const geos = new Set(), mats = new Set(), freed = { g: 0, m: 0 };
  for (const p of parts(g)) p.traverse((o) => { if (o.isSprite) { if (o.material) mats.add(o.material); return; } if (o.geometry) geos.add(o.geometry); if (o.material) mats.add(o.material); });
  for (const x of geos) x.addEventListener('dispose', () => freed.g++);
  for (const x of mats) x.addEventListener('dispose', () => freed.m++);
  const glow = [...mats].find((m) => m.isSpriteMaterial).map; let glowFreed = false; glow.addEventListener('dispose', () => { glowFreed = true; });
  eq(geos.size, st.stats().geometries, 'stats().geometries counts every geometry the set holds');
  st.dispose();
  eq([freed.g, freed.m], [geos.size, mats.size], 'dispose() frees every geometry and every material the stage made');
  ok(!glowFreed, '… but never the sprites\' shared glow texture (the raft holds it)');
  eq([parts(g).length, st.ready, st.stats().calls, st.stats().geometries], [0, false, 0, 0], 'nothing left in the scene; not ready; no cost');
  st.dispose(); st.exit(); ok(true, 'dispose() and exit() are idempotent');
  st.enter({}); st.setTime(3.6, {}); ok(st.ready && parts(g).length === 2 && g.scene.getObjectByName('intro:lantern').visible, 'a replay builds it again');
  st.dispose(); eq(g.ctx.errors, [], 'no errors'); }

console.log(`intro-stage: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
