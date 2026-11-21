// WC-3 (docs/loop/WATERCRAFT.md §2.1–§2.2, §3.9, §5.4, §5.7, §9.4): the water's face on the Mossmere under the loop, and the gear log.
//   - the reed beds and the lily beds lie where §2.2 says (the shore arcs 0.5–6 m off the shore, the rock isles' reeds to k·r + plus, the
//     masonry isles' thin fringe; the four beds' pads inside their discs) and ≥ 3 m clear of the mooring's hulls and lane, the dock
//     posts, the tow's glide-in and the places; built into the 'fine' static and the pads' InstancedMesh (no new mesh); world.stems
//   - watercraft.laneFor is deterministic per evening, a new line each evening, and its lane is carved from deep or open water only;
//     the lane's uniforms by light (day and dusk; none at night)
//   - the baked masks (the inflow's seam, the outflow's pull, the gravel fan) and the water's GW_WC build: RGBA only in a loop build,
//     the masks filled only on the Mossmere, no new sampler, the Glowtide's and the droplets' gold water-white there
//   - the Mossmere's water voices (the trickle, the stems' rustle, the Matriarch's toll; no comeback hiss there)
//   - the gear log: Who bites names no unmet fish and reads the pike "<1%" on worms; the Hold line names no fish at all
//   - the heron stands only at margin or reed spots of the top third for small fish, lifts at 8 m, is gone at dark, changes no odd
//   node tools/tests/watercraft-face.test.mjs   (or node tools/check.mjs)
import * as THREE from 'three';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sink = () => new Proxy(function () {}, { get: (t, k) => (k === 'data' ? new Uint8ClampedArray(4) : k === 'width' || k === 'height' ? 1 : k === Symbol.toPrimitive ? () => 0 : sink()), apply: () => sink(), set: () => true });
globalThis.Path2D = globalThis.Path2D || class { constructor() {} };
globalThis.document = globalThis.document || { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => sink(), toDataURL: () => '' }) };

globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
const DV3 = await import('../../src/data.js?wcf-v3');
const { loadLoopData, freshLoopMeta } = await import('./loop-fixture.mjs');
const D = await loadLoopData({ query: 'wcf-loop' });
const WC = await import('../../src/watercraft.js');
const F = await import('../../src/watercraft-face.js');
const { buildLayout, depthAt } = await import('../../src/world-layout.js');
const { buildArena } = await import('../../src/world-art.js');
const { create: createWater } = await import('../../src/water.js');
const { WATER_FRAG } = await import('../../src/water-shader.js');
const MOSS = await import('../../src/audio-mossmere.js');
const AF = await import('../../src/ui-af.js');
const here = dirname(fileURLToPath(import.meta.url));
const src = (f) => readFileSync(resolve(here, '../../src', f), 'utf8');
const FL = await import('../../src/world-flora.js');   // (LAKE 2, lane W2: a lush water's masks)

let pass = 0, fail = 0;
function ok(cond, msg, extra) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra).slice(0, 600) : ''); } }
const section = (s) => console.log(`- ${s}`);
const degOf = (x, z) => { const a = (Math.atan2(z, x) * 180) / Math.PI; return a < 0 ? a + 360 : a; };

const Z = D.ZONES.find((z) => z.id === 'mossmere');
const L = buildLayout(Z);
const probe = { depth: (x, z) => depthAt(L, x, z), fromShore: (x, z) => L.shoreR(Math.atan2(z, x)) - Math.hypot(x, z) };
const M = D.loopMooring('mossmere', L.docks);
const hulls = M.circles, arena = Z.arena;
const G = WC.WATERCRAFT.mossmere.geometry;
const avoid = F.avoidList(L, D);

section('the face reads WC-1\'s geometry; it runs on the Mossmere under the loop only');
{
  ok(F.GEO === G, 'watercraft-face.GEO is watercraft.WATERCRAFT.mossmere.geometry (one copy)');
  ok(F.faceOn(D, 'mossmere') && !F.faceOn(D, 'sporewood') && !F.faceOn(DV3, 'mossmere') && !F.faceOn(null, 'mossmere'), 'faceOn: the loop and the Mossmere only');
  ok(['calm', 'day', 'dawn'].every((p) => F.lightOf(p) === 'day') && F.lightOf('dusk') === 'dusk' && F.lightOf('gloomtide') === 'night', 'lightOf as watercraft\'s');
  const kinds = new Set([...avoid.circles.map((c) => c.kind.split(':')[0]), ...avoid.segs.map((s) => s.kind.split(':')[0])]);
  ok(['post', 'place', 'hull', 'murk', 'lane', 'glideIn'].every((k) => kinds.has(k)), 'the avoid list holds the posts, the places, the hulls, Murk\'s barge, the lane and the glide-in', [...kinds]);
  const gi = avoid.segs.find((s) => s.kind === 'glideIn');
  ok(gi && Math.abs(Math.hypot(gi.bx - gi.ax, gi.bz - gi.az) - (D.LOOP?.tow?.glideIn?.len ?? 14)) < 1e-6 && gi.r === 3, 'the glide-in: 14 m out along the barge\'s line, 3 m a side', gi);
  ok(Math.hypot(gi.bx, gi.bz) < Math.hypot(gi.ax, gi.az), '… toward open water (away from the shore)');
}

section('the reed beds (§2.2): the shore arcs, the rock isles thick, the masonry isles thin; clear of the mooring, docks, lane, glide-in and places');
for (const low of [false, true]) {
  const tag = low ? 'low' : 'high';
  const plan = F.reedPlan(L, F.faceRng(((L.artSeed | 0) ^ 0x5eed5) >>> 0), { low, avoid });
  const shore = plan.filter((c) => c.where === 'shore'), rock = plan.filter((c) => c.where === 'rock'), stone = plan.filter((c) => c.where === 'stone');
  ok(G.reedArcs.every((_, i) => shore.filter((c) => c.bed === i).length >= (low ? 8 : 20)), `${tag}: every shore bed is planted`, G.reedArcs.map((_, i) => shore.filter((c) => c.bed === i).length));
  const badArc = shore.filter((c) => { const a = G.reedArcs[c.bed], d = degOf(c.x, c.z), off = probe.fromShore(c.x, c.z); return !(d >= a[0] && d <= a[1] && off >= G.reedOff[0] - 0.05 && off <= G.reedOff[1] + 0.05); });
  ok(!badArc.length, `${tag}: every shore clump inside its arc, ${G.reedOff[0]}–${G.reedOff[1]} m off the shore`, badArc.slice(0, 3));
  const isl = (c) => L.islands.find((o) => o.name === c.island);
  const badRock = rock.filter((c) => { const o = isl(c), d = Math.hypot(c.x - o.x, c.z - o.z); return !(o.kind === 'rock' && d >= o.r && d <= G.reedReach.k * o.r + G.reedReach.plus + 1e-6); });
  ok(!badRock.length && rock.length > 0, `${tag}: the rock isles' reeds lie from the isle's edge to k·r + plus`, badRock.slice(0, 3));
  const perIsle = (list) => { const m = {}; for (const c of list) m[c.island] = (m[c.island] || 0) + 1; return m; };
  const rk = perIsle(rock), st = perIsle(stone);
  ok(['Mossbell Isle', 'Elder Sister', 'Younger Sister'].every((n) => rk[n] > 0) && Object.keys(rk).every((n) => L.islands.find((o) => o.name === n)?.kind === 'rock'), `${tag}: the three rock isles carry reeds`, rk);
  ok(Object.keys(st).every((n) => G.stoneIslands.includes(L.islands.find((o) => o.name === n)?.kind)) && Math.max(...Object.values(st)) < Math.min(...Object.values(rk)), `${tag}: the masonry isles' fringe is thinner than any rock isle's`, { st, rk });
  const minClear = Math.min(...plan.map((c) => F.clearanceOf(avoid, c.x, c.z)));
  ok(minClear >= 3, `${tag}: every reed clump ≥ 3 m clear of the mooring, docks, lane, glide-in and places (${minClear.toFixed(2)} m)`);
  ok(plan.every((c) => probe.fromShore(c.x, c.z) > 0 && L.islands.every((o) => Math.hypot(c.x - o.x, c.z - o.z) >= o.r)), `${tag}: never on land or an island`);
  const areas = {}; for (const c of [...shore, ...rock]) { const a = WC.areaAt(c.x, c.z, probe, { arena, hulls, docks: L.docks }); areas[a] = (areas[a] || 0) + 1; }
  ok((areas.reeds || 0) / (shore.length + rock.length) >= 0.85, `${tag}: the reeds stand where watercraft.areaAt reads 'reeds' (${areas.reeds}/${shore.length + rock.length})`, areas);
}

section('the lily beds (§2.2): 12–16 pads a bed (8 on low), inside each bed\'s disc, clear by ≥ 3 m');
for (const low of [false, true]) {
  const tag = low ? 'low' : 'high';
  const pads = F.bedPadPlan(L, F.faceRng(((L.artSeed | 0) ^ 0xbed5) >>> 0), { low, avoid });
  const per = G.beds.map((_, i) => pads.filter((p) => p.bed === i).length);
  ok(per.every((n) => (low ? n === 8 : n >= 12 && n <= 16)), `${tag}: pads a bed ${per.join(', ')}`);
  ok(pads.every((p) => Math.hypot(p.x - G.beds[p.bed].x, p.z - G.beds[p.bed].z) <= G.beds[p.bed].r), `${tag}: every pad inside its bed`);
  ok(pads.every((p) => WC.areaAt(p.x, p.z, probe, { arena, hulls, docks: L.docks }) === 'pads'), `${tag}: every pad where watercraft.areaAt reads 'pads'`);
  ok(Math.min(...pads.map((p) => F.clearanceOf(avoid, p.x, p.z))) >= 3, `${tag}: every pad ≥ 3 m clear of the mooring, docks, lane, glide-in and places`);
}
{
  const bedClear = G.beds.map((b) => F.clearanceOf(avoid, b.x, b.z) - b.r);
  ok(bedClear.every((c) => c >= 3), `the four beds' discs ≥ 3 m clear (${bedClear.map((c) => c.toFixed(1)).join(', ')} m)`);
}

section('the built arena: the reeds in the \'fine\' static, the bed pads in the pads\' InstancedMesh, world.stems');
{
  const ctx = { data: D, render: { isStub: true }, state: { meta: { settings: {} } } };
  const A0 = buildArena(ctx, buildLayout(Z), { quality: 'high', far: 500, face: false });
  const A1 = buildArena(ctx, buildLayout(Z), { quality: 'high', far: 500 });
  const fine = (A) => A.statics.find((m) => m.name === 'fine');
  const padsOf = (A) => { let p = null; A.group.traverse((o) => { if (o.name === 'lilypads') p = o; }); return p; };
  ok(A1.statics.length === A0.statics.length && fine(A1).geometry.attributes.position.count > fine(A0).geometry.attributes.position.count * 3, 'no new static; the \'fine\' static carries the beds', [fine(A0).geometry.attributes.position.count, fine(A1).geometry.attributes.position.count]);
  ok(fine(A1).material !== A1.statics.find((m) => m.name === 'organics').material && fine(A0).material === A0.statics.find((m) => m.name === 'organics').material, 'the \'fine\' static has its own material (the twitch\'s) only with the face');
  const p0 = padsOf(A0), p1 = padsOf(A1), aBed = p1.geometry.attributes.aBed;
  let beds = 0; for (let i = 0; i < p1.count; i++) if (aBed.getX(i) > 0.5) beds++;
  ok(p1.count - p0.count === beds && beds >= 48 && beds <= 64 && !p0.geometry.attributes.aBed, `the bed pads ride in the pads' mesh (${beds}), flagged aBed for the shader's bob`);
  ok(A1.stats().floaters === A0.stats().floaters, 'the bed pads are not floaters (out of the CPU bob loop)', [A0.stats().floaters, A1.stats().floaters]);
  ok(A0.stems === null && A1.stems && typeof A1.stems.nudge === 'function', 'world.stems: {nudge} with the face, null without');
  ok(A1.stems.nudge(-30, 21.5, 1) === true && A1.stems.nudge(NaN, 0) === false, 'nudge(x, z, k) takes a point');
  for (let i = 0; i < 5; i++) A1.stems.nudge(i, i, 0.5);
  const pts = A1.stems.points();
  ok(pts.length === F.FACE.twitch.max && pts.filter((p) => p.k > 0).length === 4 && !pts.some((p) => p.x === -30), 'up to four twitch points, the oldest replaced', pts);
  const Av3 = buildArena({ data: DV3, render: { isStub: true }, state: { meta: { settings: {} } } }, buildLayout(DV3.ZONES[0]), { quality: 'high', far: 500 });
  ok(Av3.stems === null && padsOf(Av3).count === p0.count, 'off the loop nothing of the face is built');
  ok(/get stems\(\) \{ return arena\?\.stems \|\| null; \}/.test(src('world.js')), 'world.stems is the arena\'s');
}

section('the wind lane: watercraft.laneFor per evening, carved from deep or open water; the four uniforms by light');
{
  const sig = (l) => JSON.stringify(l);
  let det = true, fresh = true, carved = true, minLane = 1;
  for (let e = 1; e <= 60; e++) {
    const a = WC.laneFor(e), b = WC.laneFor(e);
    if (sig(a) !== sig(b)) det = false;
    const n = WC.laneFor(e + 1);
    if (Math.hypot(a.x - n.x, a.z - n.z) < 0.5 && Math.abs(a.h - n.h) < 0.05) fresh = false;
    const l = F.laneOf(a);
    let inL = 0, tot = 0;
    for (let s = -24; s <= 24; s += 2) for (const q of [-1.5, 0, 1.5]) {
      const x = l.x + l.dx * s - l.dz * q, z = l.z + l.dz * s + l.dx * q;
      if (!(probe.fromShore(x, z) > 0)) continue;
      tot++;
      const withL = WC.areaAt(x, z, probe, { lane: a, arena, hulls, docks: L.docks }), without = WC.areaAt(x, z, probe, { arena, hulls, docks: L.docks });
      if (withL === 'lane') { inL++; if (!['deep', 'open'].includes(without)) carved = false; }
      if (!WC.inLane(a, x, z)) carved = false;
    }
    minLane = Math.min(minLane, inL / Math.max(1, tot));
  }
  ok(det, 'laneFor(evening) is deterministic');
  ok(fresh, 'a new line each evening');
  ok(carved, 'the lane is carved from deep or open water only (areaAt), inside its strip');
  ok(minLane >= 0.1, `every evening's lane holds open water (the least ${(minLane * 100).toFixed(0)}% of its strip)`);
  const l = WC.laneFor(7);
  const u = F.laneUniform(F.laneOf(l), 'dusk');
  ok(Math.abs(u[0] - l.x) < 1e-9 && Math.abs(u[1] - l.z) < 1e-9 && Math.abs(Math.cos(u[2]) - Math.cos(l.h)) < 1e-9 && Math.abs(Math.sin(u[2]) - Math.sin(l.h)) < 1e-9 && u[3] === 1, 'laneUniform: (x, z, heading, 1) at dusk', u);
  ok(F.laneUniform(F.laneOf(l), 'calm')[3] === 1 && F.laneUniform(F.laneOf(l), 'gloomtide')[3] === 0 && F.eveningLane(7, 'gloomtide') === null, 'by day and dusk only; none at night');
  ok(F.eveningLane(0) === null && F.inLane(F.laneOf(l), l.x, l.z), 'no evening, no lane; its centre is inside it');
}

section('the baked masks: the inflow\'s seam, the outflow\'s pull, the gravel fan; 0 on land');
{
  const m = (x, z) => F.faceMasks(x, z, probe);
  ok(m(50, F.seamZ(50)).seam > 0.6 && m(40, F.seamZ(40)).seam > 0.3 && m(50, F.seamZ(50) + 7).seam < 0.05, 'the seam runs west from the spill about its meandering line, fading downstream', [m(50, F.seamZ(50)).seam, m(40, F.seamZ(40)).seam]);
  ok(m(0, -42).seam > 0.5 && m(0, -49).seam === 0 && m(0, -30).seam === 0, 'the outflow\'s pull: a ring from the gate\'s stones out to ~14 m', [m(0, -42).seam]);
  ok(m(53, 4).fan > 0.4 && m(45, 4).fan === 0 && m(53, 12).fan === 0, 'the gravel fan opens west under the Veil', [m(53, 4).fan]);
  ok(m(0, 0).seam === 0 && m(0, 0).fan === 0 && m(0, 70).seam === 0 && m(70, 4).fan === 0, 'nothing in the open lake, nothing past the shore');
}

section('the water: GW_WC only in a loop build, RGBA only there, the masks only on the Mossmere, no new sampler, gold water-white');
{
  const fakeCtx = (data, zone) => {
    const world = { isStub: false, getDepth: (x, z) => depthAt(L, x, z), getShoreRadius: (a) => L.shoreR(a), getZone: () => ({ id: zone }), getObstacles: () => [] };
    return { time: { t: 100, gameDt: 0.016 }, debug: {}, bus: { on() {} }, flow: 'playing', data, world,
      state: { run: { zone, outing: 'trip', evening: 3 }, meta: { loop: { evenings: 2 } } },
      survival: { getPhaseInfo: () => ({ phase: 'dusk', k: 0.5 }) }, render: { quality: 'high' } };
  };
  const bake = (w) => { for (let i = 0; i < 12; i++) w.update(0.05); };
  const wl = createWater(fakeCtx(D, 'mossmere')); wl.init(); bake(wl);
  const U = wl.material.uniforms, img = U.uDepthTex.value.image, tex = U.uDepthTex.value;
  ok(wl.material.defines.GW_WC === 1 && 'uWc' in U && 'uLane' in U && tex.format === THREE.RGBAFormat && img.data.length === 160 * 160 * 4, 'a loop build: GW_WC, uWc and uLane, the depth texture RGBA (160 texels: the lake and its cut)');
  const RES = img.width, at = (x, z, ch) => { const half = 1 / (2 * U.uDepthScale.value), c = Math.floor(((x + half) / (2 * half)) * RES), r = Math.floor(((z + half) / (2 * half)) * RES); return img.data[(r * RES + c) * 4 + ch]; };
  ok(U.uDepthOn.value === 1 && at(50, F.seamZ(50), 2) > 100 && at(53, 4, 3) > 80 && at(0, 0, 2) === 0, 'the bake fills B (the seam) and A (the fan) on the Mossmere', [at(50, F.seamZ(50), 2), at(53, 4, 3)]);
  ok(U.uWc.value === 1, 'uWc on, on the Mossmere');
  const lane = WC.laneFor(3);
  ok(Math.abs(U.uLane.value.x - lane.x) < 1e-6 && Math.abs(U.uLane.value.y - lane.z) < 1e-6 && U.uLane.value.w > 0, 'uLane from laneFor(the trip\'s evening), fading in at dusk', U.uLane.value);
  const wg = createWater(fakeCtx(D, 'glasswater')); wg.init(); bake(wg);
  const is = wg.material.uniforms.uDepthTex.value.image.data;
  let bs = 0; for (let i = 0; i < is.length; i += 4) bs += is[i + 2] + is[i + 3];
  ok(wg.material.uniforms.uWc.value === 0 && bs === 0 && !wg.material.defines.GW_LUSH, 'another water in a loop build: uWc off, no masks');
  // (LAKE 2, lane W2: a lush water (Sporewood) bakes its own masks in the spare channels, never the Mossmere's: B the moon coins' dapple,
  // A the weed film, as world-flora.lushMasks reads them, under GW_LUSH)
  const ws = createWater(fakeCtx(D, 'sporewood')); ws.init(); bake(ws);
  const US = ws.material.uniforms, ims = US.uDepthTex.value.image, half = 1 / (2 * US.uDepthScale.value);
  let worst = 0, shade = 0;
  for (let r = 0; r < ims.height; r += 7) for (let c = 0; c < ims.width; c += 7) {
    const x = ((c + 0.5) / ims.width) * 2 * half - half, z = ((r + 0.5) / ims.height) * 2 * half - half, i = (r * ims.width + c) * 4;
    const sd = L.shoreR(Math.atan2(z, x)) - Math.hypot(x, z), m = FL.lushMasks(D.ZONE_LOOKS.sporewood, x, z, sd, Math.max(0, Math.min(1, depthAt(L, x, z))));
    worst = Math.max(worst, Math.abs(ims.data[i + 2] - Math.round(m.dapple * 255)), Math.abs(ims.data[i + 3] - Math.round(m.weed * 255)));
    if (ims.data[i + 2] < 200) shade++;
  }
  ok(US.uWc.value === 0 && ws.material.defines.GW_LUSH === 1 && worst <= 1 && shade > 0, 'a lush water (Sporewood): uWc off; its own masks (the dapple, the weed film) under GW_LUSH, none of the Mossmere\'s', { worst, shade });
  const wv = createWater(fakeCtx(DV3, 'mossmere')); wv.init();
  ok(!wv.material.defines.GW_WC && !('uWc' in wv.material.uniforms) && wv.material.uniforms.uDepthTex.value.format === THREE.RGFormat, 'a v3 build without the loop: no GW_WC, no new uniform, the depth texture RG as built');
  const samplers = [...WATER_FRAG.matchAll(/uniform sampler2D (\w+)/g)].map((m) => m[1]).sort();
  ok(JSON.stringify(samplers) === JSON.stringify(['uDepthTex', 'uReflTex', 'uShadowTex']), 'no new sampler', samplers);
  ok(/#ifdef GW_WC[\s\S]*mix\(vec3\(0\.95, 0\.8, 0\.52\), uFoam, uWc\)/.test(WATER_FRAG), 'the Glowtide\'s gold glints water-white on the Mossmere (GW_WC)');
  const wsrc = src('water.js');
  ok((wsrc.match(/c\.copy\(wcWhite\(\) \? U\.uFoam\.value : GLOW_GOLD\)/g) || []).length === 2 && !/c\.copy\(GLOW_GOLD\)/.test(wsrc), 'water.js\'s gold droplets (emitDrops, slapDrops) water-white there');
  ok(/#ifdef GW_WC[\s\S]*wcRim = 1\.0 - smoothstep\(5\.4, 9\.0, rd\)[\s\S]*#endif/.test(WATER_FRAG) && /wcLip = 1\.0 - smoothstep\(0\.33/.test(WATER_FRAG), 'the drop-off\'s shade: the Bell Pool\'s rim and the shelf\'s lip in the depth tint');
  ok(!/wcPale/.test(WATER_FRAG), 'the Bell Pool\'s rim has no pale lip (Lake 1 polish: it read as a ring round a target)');
  const low = WATER_FRAG.split('#ifndef GW_LOW');
  ok(/wcSlick = /.test(WATER_FRAG) && /th \* wcTex\.b/.test(WATER_FRAG) && !low.slice(1).some((part) => /wcSlick = |th \* wcTex\.b|wcRim = /.test(part.split('#endif')[0])), 'the low tier keeps the rim, the seam and the lane (only the fan\'s speckle drops)');
}

section('the Mossmere\'s water voices');
{
  const V = MOSS.WATER_VOICES.inflow;
  ok(MOSS.waterVoiceAt(V, 54, 4).gain === 1 && MOSS.waterVoiceAt(V, 0, 0).gain === 0 && MOSS.waterVoiceAt(V, 35, 4).gain > 0, 'the trickle by distance from the Veil\'s spill');
  ok(MOSS.trickleLight('night') > MOSS.trickleLight('day'), 'heard more at night');
  ok(MOSS.stemsRustle({ kind: 'stems', x: 1, z: 1 }, 0, 0) === 1 && MOSS.stemsRustle({ kind: 'rise', x: 1, z: 1 }, 0, 0) === 0, 'the stems tell rustles; nothing else does');
  ok(MOSS.tollOn({ legendary: true, speciesId: 'belled_matriarch' }) && !MOSS.tollOn({ sizeClass: 'elder' }) && !MOSS.tollOn({ legendary: true, speciesId: 'other' }), 'the toll as the Matriarch takes, and only then');
  ok(MOSS.comebackQuiet({ loopOn: true, zone: 'mossmere' }) && !MOSS.comebackQuiet({ loopOn: false, zone: 'mossmere' }) && !MOSS.comebackQuiet({ loopOn: true, zone: 'sporewood' }), 'no comeback hiss on the Mossmere under the loop');
  const a = src('audio.js');
  ok(/on\('fishing:comeback', \(\) => \{ if \(MOSS\.comebackQuiet\(/.test(a) && /play\('ember_hiss', scratch\)/.test(a), 'audio.js\'s comeback handler asks comebackQuiet first (and keeps the hiss elsewhere)');
  ok(MOSS.WC_SFX.every((id) => typeof MOSS.SFX_WC[id].fn === 'function'), 'the trickle and the rustle are built voices (v.burst, v.tone)');
}

section('the gear log: Who bites names no unmet fish; the pike "<1%" on worms; the Hold line names no fish');
{
  const names = Object.fromEntries(Object.values(D.SPECIES_BY_ID).map((s) => [s.id, s.name]));
  const all = Object.values(names);
  const worms = WC.bitesTable(D, { bait: 'mireworm' });
  const met = new Set(['dusk_minnow', 'mossback_perch', 'reedjaw_pike', 'weeping_carp']);
  const v = AF.bitesBlock(D, worms, { met, names, item: 'Mire Worms' });
  ok(v.rows.length === 4 && v.rows.every((r) => met.has(r.id)), 'only met fish get a row', v.rows.map((r) => r.id));
  const pike = v.rows.find((r) => r.id === 'reedjaw_pike');
  ok(pike?.on === '<1%', 'the Reedjaw Pike on worms: "<1%"', pike);
  ok(v.rows.every((r) => /^(\d+%|<1%)$/.test(r.on) && /^(\d+%|<1%)$/.test(r.bare)), 'whole percent, "<1%" under one, beside the bare hook');
  const unmetN = worms.filter((r) => (r.share > 0 || r.bare > 0) && !met.has(r.id)).length;
  ok(v.unmet === unmetN && v.more === `and ${unmetN} you have not met`, `the rest counted, never named (${v.more})`);
  const text = JSON.stringify(v);
  ok(all.filter((n) => !['Dusk Minnow', 'Mossback Perch', 'Reedjaw Pike', 'Weeping Carp'].includes(n)).every((n) => !text.includes(n)), 'no unmet fish\'s name anywhere in the block');
  ok(v.heading === (D.TEXT_LOOP?.log?.whoBites || 'Who bites') && v.cols[1] === (D.TEXT_LOOP?.log?.bare || 'Bare hook'), 'its words: "Who bites", "Bare hook"');
  ok(AF.bitesBlock(D, worms, { met: new Set(), names }).rows.length === 0, 'a player who has met nothing sees only the count');
  const { whoBitesHtml } = await import('../../src/ui-gear.js');
  const html = whoBitesHtml(D, { kind: 'bait', id: 'mireworm' }, { met, names });
  ok(/data-loop="whobites"/.test(html) && /Reedjaw Pike<\/td><td>&lt;1%|Reedjaw Pike<\/td><td><1%/.test(html.replace(/&lt;/g, '&lt;')) && !/Kissmark Trout|Rustfin Sucker/.test(html), 'ui-gear\'s Who bites block renders it (the pike "<1%", no unmet names)');
  ok(whoBitesHtml(DV3, { kind: 'bait', id: 'mireworm' }, { met, names }) === '' && whoBitesHtml(D, { kind: 'rod', id: 'rod' }, {}) === '', 'nothing off the loop, nothing for tackle');
  // the Hold line, through progression's gear log
  const { createBus } = await import('../../src/core.js');
  const { create } = await import('../../src/progression.js');
  const meta = freshLoopMeta(D);
  meta.loop.bait = { mossmere: { mireworm: 4 } };
  for (const id of met) meta.journal[id] = { caught: 1, biggest: 0 };
  const bus = createBus();
  const ctx = { THREE, bus, data: D, state: { meta, run: null }, time: { dt: 0.016, gameDt: 0.016, t: 0, gameT: 0, timeScale: 1, frame: 1 }, flow: 'home', paused: false, debug: {}, errors: [], isMobile: false, input: {},
    core: { debugEnabled: () => false }, game: { save() {} }, survival: { getPhaseInfo: () => ({ phase: 'calm', day: 1, time: 0, duration: 40, k: 0, isNight: false }) },
    actors: { merchant: { present: false, position: new THREE.Vector3(), arrive() {}, leave() {} }, setRaftLevel() {}, setCharacter() {} },
    world: { getMerchantDock: () => ({ position: new THREE.Vector3(24, 0, 38), yaw: 1 }), setGateState() {}, getGate: () => null, getDepth: () => 0.5 },
    player: { position: new THREE.Vector3(), isNear() { return true; } }, combat: { addXp() {} }, fishing: { state: 'idle', spots: [], signs: [] }, ui: { isBlocking: () => false } };
  ctx.progression = create(ctx); ctx.progression.init();
  const log = ctx.progression.getGearLog();
  const rows = (Array.isArray(log) ? log : []).filter((e) => ['bait', 'lure'].includes(e.kind) && WC.HOOK_ITEMS.includes(e.id));
  if (!rows.length) console.log('  (gear log)', Array.isArray(log), log?.length, ctx.errors);
  ok(rows.length >= 5 && rows.some((e) => e.id === 'mireworm') && rows.some((e) => e.id === 'bell_spinner'), 'the gear log lists the Mossmere\'s tins and lures', rows.map((e) => e.id));
  for (const e of rows) {
    const line = AF.gearLine(D, e, { names });
    const suits = WC.gradeTargets(e.id, D);
    const m = suits.filter((id) => met.has(id)).length;
    const cap = AF.gearCapLine(D, e);   // (GEAR-GATES §5.1: the free hooks add "Lands up to {Class}.")
    ok(line === `+${e.hold} Hold on the fish it suits (${m} you have met).${cap ? ` ${cap}` : ''}` && !all.some((n) => line.includes(n)), `${e.id}: "${line}"`);
    ok(!!cap === ['bent_spoon', 'cut_strip'].includes(e.id), `${e.id}: a cap line only on the free hooks (${cap || 'none'})`);
  }
  eq0(ctx.errors);
  function eq0(errs) { ok(!errs.length, 'no progression errors', errs); }
}

section('the heron (WATERCRAFT §5.4, §9.4 item 4): margin or reed spots of the top third, lifts at 8 m, gone at dark, no odd changed');
{
  const HM = await import('../../src/actors-heron.js');
  for (const ph of ['calm', 'dusk']) {
    const ar = HM.heronAreas(ph);
    const ranked = WC.AREAS.map((a) => [a, WC.areaWeight('dusk_minnow', a, ph)]).sort((x, y) => y[1] - x[1]);
    const top = new Set(ranked.slice(0, Math.ceil(ranked.length / 3)).map(([a]) => a));
    ok(ar.length > 0 && ar.every((a) => (a === 'margin' || a === 'reeds') && (top.has(a) || WC.areaWeight('dusk_minnow', a, ph) >= ranked[Math.ceil(ranked.length / 3) - 1][1] - 1e-9)), `${ph}: its areas are margin or reeds in the minnow's top third`, { ar, ranked });
    const spots = HM.heronSpots(L, D, { phase: ph, probe });
    ok(spots.length >= 12, `${ph}: ${spots.length} spots to stand at`);
    ok(spots.filter((s) => !s.isle).every((s) => ar.includes(WC.areaAt(s.x, s.z, probe, { arena, hulls, docks: L.docks }))), `${ph}: every spot in one of those areas (but the islands' shores of LOOP.wildlife.heron)`);
    const lm = D.loopPlaceIds('mossmere').map((id) => D.loopPlace(id)?.landmark).filter((q) => q && Number.isFinite(q.x));
    ok(spots.every((s) => F.clearanceOf(avoid, s.x, s.z) >= 6 && lm.every((q) => Math.hypot(s.x - q.x, s.z - q.z) >= 6)), `${ph}: every spot ≥ 6 m from the mooring, the glide-in, the places and their landmarks`);
  }
  ok(HM.heronSpots(L, D, { phase: 'gloomtide', probe }).length === 0, 'no spot at night');
  const spots = HM.heronSpots(L, D, { phase: 'dusk', probe });
  const rng = F.faceRng(9);
  const H = HM.createHeronState(spots, rng);
  ok(H.mode === 'stand' && spots.some((s) => s.x === H.x && s.z === H.z), 'it starts standing at a spot');
  let stabs = 0;
  for (let i = 0; i < 900; i++) { HM.stepHeron(H, { dt: 1 / 30, raft: { x: H.x + 20, z: H.z }, phase: 'dusk', spots, rng }); if (H.events.includes('stab')) stabs++; }
  ok(stabs >= 1 && H.mode !== 'fly' && H.lifts === 0, `it stands and stabs now and then (${stabs} in 30 s), the raft 20 m off`);
  HM.stepHeron(H, { dt: 1 / 30, raft: { x: H.x + HM.HERON.lift + 0.2, z: H.z }, phase: 'dusk', spots, rng });
  ok(H.mode !== 'fly' && !H.events.includes('lift'), 'the raft at 8.2 m: it stays');
  const at = { x: H.x, z: H.z };
  HM.stepHeron(H, { dt: 1 / 30, raft: { x: H.x + HM.HERON.lift - 0.3, z: H.z }, phase: 'dusk', spots, rng });
  ok(H.mode === 'fly' && H.events.includes('lift'), 'the raft at 7.7 m: it lifts off (the croak)');
  const raft = { x: at.x + 7.7, z: at.z };
  for (let i = 0; i < 300 && H.mode === 'fly'; i++) HM.stepHeron(H, { dt: 1 / 30, raft, phase: 'dusk', spots, rng });
  ok(H.mode === 'stand' && spots.some((s) => s.x === H.x && s.z === H.z) && Math.hypot(H.x - raft.x, H.z - raft.z) >= HM.HERON.landFar, 'it lands again elsewhere, far from the raft');
  HM.stepHeron(H, { dt: 1 / 30, raft, phase: 'gloomtide', spots: [], rng });
  ok(H.mode === 'fly' && H.events.includes('leave'), 'at dark it flies off');
  for (let i = 0; i < 400 && H.mode !== 'gone'; i++) HM.stepHeron(H, { dt: 1 / 30, raft, phase: 'gloomtide', spots: [], rng });
  ok(H.mode === 'gone', 'and is gone at night');
  for (let i = 0; i < 60; i++) HM.stepHeron(H, { dt: 1 / 30, raft, phase: 'gloomtide', spots: [], rng });
  ok(H.mode === 'gone', 'it stays gone through the night');
  HM.stepHeron(H, { dt: 1 / 30, raft, phase: 'calm', spots, rng });
  ok(H.mode === 'stand' && H.events.includes('arrive'), 'with the light back it comes in again');
  const hs = src('actors-heron.js');
  ok(!/fishing|castOdds|rollSpecies|progression|hookWeights|finishPool/.test(hs.replace(/^\/\/.*$/gm, '')), 'it reads no fishing, odds or progression (it changes no odd)');
  ok(/q !== 'low'/.test(hs) && /setupSurface\(mesh, \{ cast: false, reflect: false \}\)/.test(hs) && (hs.match(/new THREE\.Mesh\(/g) || []).length === 1, 'one mesh (its poses swap geometry), no shadow or mirror pass, hidden on low');
  ok(/attachHeron\(ctx\)/.test(src('main.js')), 'main attaches it under the loop');
  ok(MOSS.croakGain({ x: 0, z: 0 }, 0, 5) === 1 && MOSS.croakGain({ x: 0, z: 0 }, 0, 80) === 0 && /on\('heron:lift'/.test(src('audio.js')), 'its croak by distance on heron:lift');
}

console.log(`\nwatercraft-face: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
