// LAKE 2, lane W1 (docs/loop/LAKE2.md §3.1, §9): the outline shore.
//   node tools/tests/outline-shore.test.mjs            (or node tools/check.mjs)
//   node tools/tests/outline-shore.test.mjs --print    prints the Mossmere's hashes (to pin them again, only when a lane means to move it)
// Part 1 (the first commit of the lane, before any builder moved): the Mossmere's geometry is pinned. Its layout (the polar shore at 720
// bearings, the depth on a 1 m grid, open water, the obstacles, the docks, the spawn, the gate, the cut), the queries the water's bake and
// the collision read (shoreDist, isOpenWaterL), the Chart's water geometry and the built arena's statics, halos and floaters hash as they
// did at gw-lake2's 87408ff, with the loop off (the flag-off game and v3) and on (the loop's default and ?redress=0). The outline shore
// never moves the Mossmere: it keeps shoreR (LAKE2 §13's first guard).
import * as THREE from 'three';
import { createHash } from 'node:crypto';

const sink = () => new Proxy(function () {}, { get: (t, k) => (k === 'data' ? new Uint8ClampedArray(4) : k === 'width' || k === 'height' ? 1 : k === Symbol.toPrimitive ? () => 0 : sink()), apply: () => sink(), set: () => true });
globalThis.Path2D = globalThis.Path2D || class { constructor() {} };
globalThis.document = globalThis.document || { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => sink(), toDataURL: () => '' }) };

// four data builds in one process (data.js reads its flags at import; each import has its own query)
const D_OFF = await import('../../src/data.js?osOff');
globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
const D_V3 = await import('../../src/data.js?osV3');
globalThis.GW_LOOP = true;
globalThis.GW_REDRESS = false;
const D_LOOP0 = await import('../../src/data.js?osLoop0');
delete globalThis.GW_REDRESS;
const D_LOOP = await import('../../src/data.js?osLoop');

const WL = await import('../../src/world-layout.js');
const { buildArena } = await import('../../src/world-art.js');
const UC = await import('../../src/ui-chart.js');

const PRINT = process.argv.includes('--print');
let pass = 0, fail = 0;
const ok = (c, msg, extra) => { if (c) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra).slice(0, 600) : ''); } };
const section = (s) => console.log(`- ${s}`);
const r6 = (v) => (Number.isFinite(v) ? Math.round(v * 1e6) / 1e6 : String(v));

/** The Mossmere's layout and its queries, hashed (pure: no three.js). */
function layoutHash(D, zid = 'mossmere') {
  const z = D.ZONES.find((q) => q.id === zid), L = WL.buildLayout(z);
  const h = createHash('sha256');
  const put = (v) => h.update(JSON.stringify(v));
  const shore = []; for (let i = 0; i < 720; i++) shore.push(r6(L.shoreR((i / 720) * Math.PI * 2)));
  put(shore);
  put({ R: L.R, seed: L.seed, theme: L.theme, shelf: L.shelf, spawn: L.spawn, gate: { x: L.gate.x, z: L.gate.z, r: L.gate.radius, stones: L.gate.stones },
    islands: L.islands, pillars: L.pillars, docks: L.docks, obstacles: L.obstacles, gateObstacles: L.gateObstacles, cracks: L.cracks, artSeed: L.artSeed,
    depthScale: L.depthScale ?? null, depthStats: L.depthStats ?? null });
  const N = L.notch;
  put(N ? { a: N.a, hw: N.hw, r0: N.r0, end: N.end, depth: N.depth, pool: N.pool, endHw: N.endHw, place: N.place, open: N.open, ray: Array.from(N.ray?.r || []).map(r6) } : null);
  const obs = [...L.obstacles, ...L.gateObstacles];
  const dep = [], sd = [], open = [];
  for (const opened of N ? [false, true] : [false]) {
    if (N) N.open = opened;
    for (let x = -70; x <= 70; x += 1) for (let zz = -70; zz <= 70; zz += 1) {
      dep.push(r6(WL.depthAt(L, x + 0.37, zz + 0.61)));
      sd.push(r6(WL.shoreDist(L, x + 0.37, zz + 0.61)));
      open.push(WL.isOpenWaterL(L, obs, x + 0.37, zz + 0.61, 1.6) ? 1 : 0);
    }
  }
  if (N) N.open = typeof N.place !== 'string';
  put(dep); put(sd); put(open.join(''));
  return h.digest('hex');
}
/** The Mossmere's built arena (its statics' positions and colours, the instanced floaters' counts, the halos), hashed. */
function arenaHash(D, opts = {}, zid = 'mossmere') {
  const z = D.ZONES.find((q) => q.id === zid), L = WL.buildLayout(z);
  const ctx = { data: D, render: { isStub: true }, state: { meta: { settings: {} } } };
  const loop = D.LOOP_ENABLED === true, redress = loop && D.LOOP?.redress === true;
  const arena = buildArena(ctx, L, { quality: opts.quality || 'high', far: 500, ...(loop ? { loop: true } : {}), ...(redress ? { redress: true } : {}) });
  const h = createHash('sha256');
  for (const m of arena.statics) {
    const g = m.geometry;
    h.update(m.name);
    for (const k of ['position', 'color']) { const a = g.attributes[k]?.array; if (a) h.update(Buffer.from(a.buffer, a.byteOffset, a.byteLength)); }
    if (g.index) h.update(Buffer.from(g.index.array.buffer, g.index.array.byteOffset, g.index.array.byteLength));
  }
  const fl = []; arena.group.traverse((o) => { if (o.isInstancedMesh) fl.push(`${o.name}:${o.count}`); if (o.isMesh && o.name === 'cliffs') { const p = o.geometry.attributes.position.array; h.update(Buffer.from(p.buffer, p.byteOffset, p.byteLength)); } });
  h.update(fl.join());
  const hs = arena.halos, n = hs.count;
  h.update(Buffer.from(hs.geo.attributes.position.array.slice(0, n * 3).buffer)); h.update(Buffer.from(hs.geo.attributes.aColor.array.slice(0, n * 3).buffer));
  arena.dispose?.();
  return h.digest('hex');
}
/** The real world module's queries on the Mossmere (the collision, the shore the water's bake reads, the bake's half-size), hashed. */
async function worldHash(D) {
  const { createBus } = await import('../../src/core.js');
  const { create } = await import('../../src/world.js');
  const ctx = { data: D, bus: createBus(), state: { meta: { settings: {} }, run: null }, flow: 'title', isMobile: false, errors: [], debug: {}, render: { isStub: true } };
  const W = create(ctx);
  W.setZone('mossmere', { instant: true });
  const h = createHash('sha256'), out = [];
  for (let i = 0; i < 2400; i++) {
    const a = (i * 2.399963) % (Math.PI * 2), r = 4 + ((i * 37) % 70), p = { x: Math.cos(a) * r, z: Math.sin(a) * r };
    W.collide(p, 1.6);
    out.push(r6(p.x), r6(p.z), r6(W.getShoreRadius(a)), r6(W.getShoreDist(Math.cos(a) * r, Math.sin(a) * r)), W.isOpenWater(Math.cos(a) * r, Math.sin(a) * r, 1.2) ? 1 : 0);
  }
  out.push(r6(W.getBakeHalf()), W.bounds.radius);
  h.update(JSON.stringify(out));
  return h.digest('hex');
}
const chartHash = (D) => createHash('sha256').update(JSON.stringify(UC.waterGeometry(D, 'mossmere'), (k, v) => (typeof v === 'function' ? `fn:${[0, 1, 2, 3, 4, 5].map((i) => r6(v(i))).join(',')}` : v))).digest('hex');

// ------------------------------------------------------------------ part 1: the Mossmere pinned
section('W1 part 1: the Mossmere\'s geometry is pinned (gw-lake2 87408ff, before the outline shore)');
const BUILDS = { off: D_OFF, v3: D_V3, loop0: D_LOOP0, loop: D_LOOP };
const got = {};
for (const [k, D] of Object.entries(BUILDS)) got[k] = { layout: layoutHash(D), arena: arenaHash(D), arenaLow: arenaHash(D, { quality: 'low' }), chart: chartHash(D), world: await worldHash(D) };
if (PRINT) console.log(JSON.stringify(Object.fromEntries(Object.entries(got).map(([k, v]) => [k, Object.fromEntries(Object.entries(v).map(([a, b]) => [a, b.slice(0, 24)]))])), null, 2));
const PIN = {
  off:   { layout: '9d3b37762fa53dc8e40a3e53', arena: '0b733f4dd63fe58a250f9b93', arenaLow: '3ebc3b4524b46a0ad63c868a', chart: '96163911f9f587d2072ff062', world: 'd534d5ef8ae3c17bdf15e2f5' },
  v3:    { layout: '9d3b37762fa53dc8e40a3e53', arena: '064622b91fe7dda371e049fe', arenaLow: '29c9e1073c8ec9c9db0f9f96', chart: '96163911f9f587d2072ff062', world: 'd534d5ef8ae3c17bdf15e2f5' },
  loop0: { layout: '6585b37b6bff5a14eeee1040', arena: '86e37d052847852162a6d7dc', arenaLow: '30cbda05b98f25ef15668db4', chart: '954e8ad8eba19cd77ece7d5c', world: '8d6cb201716794e9dff1ff60' },
  loop:  { layout: '6585b37b6bff5a14eeee1040', arena: '849dd7e691df35ecb97efcf2', arenaLow: '27fe0a57a612820b730a1580', chart: '954e8ad8eba19cd77ece7d5c', world: '8d6cb201716794e9dff1ff60' },
};
// (and Sporewood off the loop: the flag-off game and v3 keep their own Sporewood, its twoBasins layout as built)
got.off.swLayout = layoutHash(D_OFF, 'sporewood'); got.off.swArena = arenaHash(D_OFF, {}, 'sporewood');
got.v3.swLayout = layoutHash(D_V3, 'sporewood'); got.v3.swArena = arenaHash(D_V3, {}, 'sporewood');
if (PRINT) console.log(JSON.stringify({ off: [got.off.swLayout, got.off.swArena].map((x) => x.slice(0, 24)), v3: [got.v3.swLayout, got.v3.swArena].map((x) => x.slice(0, 24)) }));
PIN.off.swLayout = PIN.v3.swLayout = 'b67e292001ec198e0185c1ff'; PIN.off.swArena = PIN.v3.swArena = 'ac3b63dc7f9c34d8ede1982d';
for (const [k, P] of Object.entries(PIN)) for (const [part, want] of Object.entries(P)) {
  ok(want !== '' && got[k][part].startsWith(want), `${/^sw/.test(part) ? 'Sporewood' : 'the Mossmere'}'s ${part.replace(/^sw/, '').toLowerCase()} (${k} build) hashes as pinned (${got[k][part].slice(0, 12)} / ${want.slice(0, 12) || 'unpinned'})`);
}

// ------------------------------------------------------------------ part 2: the outline shore (Sporewood under the loop)
section('W1 part 2: the outline shore (pure: world-outline.js and world-layout.js on Sporewood\'s arena)');
const WO = await import('../../src/world-outline.js');
const SW = D_LOOP.ZONE_BY_ID.sporewood, A = SW.arena;
ok(A.layout === 'outline' && D_OFF.ZONE_BY_ID.sporewood.arena.layout === 'twoBasins' && D_V3.ZONE_BY_ID.sporewood.arena.layout === 'twoBasins', 'the outline is the loop\'s alone: the flag-off game and v3 keep their twoBasins Sporewood');
const t0 = performance.now(), L = WL.buildLayout(SW), ms = performance.now() - t0, O = L.outline;
ok(!!O && O.grid.cell === 1 && O.grid.nx * O.grid.nz < 40000, `the field: 1 m cells, ${O?.grid.nx} × ${O?.grid.nz} nodes (built with the layout in ${ms.toFixed(0)} ms)`);
// the curve passes through its control points (centripetal Catmull-Rom); inside and outside
ok(A.outline.every(([x, z]) => Math.abs(WL.shoreDist(L, x, z)) < 0.2), 'the shore passes through every control point (|field| < 0.2 m there)');
ok(WL.shoreDist(L, -66, 4) > 10 && WL.shoreDist(L, 40, -4) > 10 && WL.shoreDist(L, 0, -20) < -5 && WL.shoreDist(L, 0, 30) < -5 && WL.shoreDist(L, 120, 0) < -30, 'the two pools are water; north and south of the neck and far beyond the rim are land');
ok(WL.isOpenWaterL(L, [], -66, 4, 1) && !WL.isOpenWaterL(L, [], 0, -20, 1) && !WL.isOpenWaterL(L, [], -50, -6, 0.1), 'isOpenWaterL reads the field: the pool open, the land and Mossback Isle not');
// the field's slope is a unit vector toward the water; its value matches the exact distance to the curve near the shore
{ let worst = 0; const g = { x: 0, z: 0 };
  for (let k = 0; k < 400; k++) {
    const x = -88 + ((k * 37) % 170), z = -44 + ((k * 53) % 88), s0 = WL.shoreDist(L, x, z);
    if (Math.abs(s0) > 6) continue;
    let best = Infinity; for (let q = 0; q < O.segs.n; q++) { const ax = O.segs.ax[q], az = O.segs.az[q], vx = O.segs.bx[q] - ax, vz = O.segs.bz[q] - az, l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / l2)); best = Math.min(best, Math.hypot(x - ax - vx * t, z - az - vz * t)); }
    worst = Math.max(worst, Math.abs(Math.abs(s0) - best));
    WO.sdfGrad(O, x, z, g);
    if (Math.abs(Math.hypot(g.x, g.z) - 1) > 1e-6) worst = 99;
  }
  ok(worst < 0.15, `near the shore the field is the exact distance to the curve within 0.15 m (worst ${worst.toFixed(3)}), its slope a unit vector`); }
// the neck: 11 m wide at x = 0, the raft (r 1.6) passes; the islands are land in the field
{ let lo = null, hi = null; for (let z = -6; z <= 18; z += 0.02) if (WL.shoreDist(L, 0, z) > 0) { if (lo === null) lo = z; hi = z; }
  ok(Math.abs(hi - lo - 11) < 0.3, `the neck is ${(hi - lo).toFixed(2)} m wide at x = 0 (11)`);
  ok(WL.isOpenWaterL(L, L.obstacles, 0, (lo + hi) / 2, 1.6 + 0.3), 'the raft passes through the neck with 0.3 m to spare'); }
ok(L.islands.length === 6 && L.islands.every((o) => o.outline === true && WL.shoreDist(L, o.x, o.z) < -0.3), 'six islands, each land in the field');
// depth: 0 on land, deeper into each pool, the Mother's Cup the deepest and monotone to its middle, the neck's channel mid water
ok(WL.depthAt(L, 0, -20) === 0 && WL.depthAt(L, -50, -6) === 0, 'no depth on land or on an island');
{ const Cp = A.deepPools[0]; let mono = true;
  for (let k = 0; k < 72 && mono; k++) { const t = (k / 72) * Math.PI * 2; let prev = Infinity; for (let r = 0; r <= Cp.r + 2; r += 0.2) { const d = WL.depthAt(L, Cp.x + Math.cos(t) * r, Cp.z + Math.sin(t) * r); if (d > prev + 1e-9) mono = false; prev = d; } }
  ok(mono && WL.depthAt(L, Cp.x, Cp.z) >= 0.99, 'the depth only deepens on the way into the Mother\'s Cup, to 1.0 at its middle'); }
{ const dn = WL.depthAt(L, 0, 6.5); ok(dn > 0.35 && dn < 0.8, `the neck's channel is mid water (${dn.toFixed(2)})`); }
{ const flats = WL.depthAt(L, -50, 31), bluff = WL.depthAt(L, -78, -20); ok(flats < 0.35, `the Reed Flats' broad shelf is shallow 6 m off the bank (${flats.toFixed(2)})`); }
// the ground: continuous over the waterline, the Fern Bluff high, the Reed Flats low, an island a low mound
{ let jump = 0; for (let s = 0; s < O.len; s += 3) { const q = WO.shoreAt(O, s); const a = WL.groundAt(L, q.x - q.nx * 0.01, q.z - q.nz * 0.01), b = WL.groundAt(L, q.x + q.nx * 0.01, q.z + q.nz * 0.01); jump = Math.max(jump, Math.abs(a - b)); }
  ok(jump < 0.05, `the ground meets the water on the shore (the worst step across 2 cm of it ${jump.toFixed(3)} m)`); }
{ const bluff = Math.max(...[[-84, -18], [-86, -16]].map(([x, z]) => { const q = WO.nearestAt(O, x, z); return WL.groundAt(L, q.x - (x - q.x) * -1.2, q.z); })), g = (x, z) => WL.groundAt(L, x, z);
  ok(g(-92, -18) > 5 && g(-55, 43) < 2.5 && g(-50, -6) > 2.5 && g(-50, -6) < 4.6 && g(-62, 22) < 1, `the banks rise and fall: the Fern Bluff ${g(-92, -18).toFixed(1)} m, the Reed Flats ${g(-55, 43).toFixed(1)}, Mossback Isle's hill ${g(-50, -6).toFixed(1)}, the Tussock ${g(-62, 22).toFixed(1)}`); }
// the polar fallback: the farthest water along each bearing (never the collision's)
ok(L.R >= 98 && Math.abs(L.shoreR(Math.PI) - 80) < 1.5 && Math.abs(L.shoreR(0) - 77) < 2, `R ${L.R} covers the basin; shoreR is the farthest water along a bearing (west ${L.shoreR(Math.PI).toFixed(1)} m, the West Point's; east ${L.shoreR(0).toFixed(1)})`);
// the shore by arc length, the reed runs
{ const q = WO.shoreAt(O, 10), back = WL.shoreDist(L, q.x + q.nx, q.z + q.nz), on = WL.shoreDist(L, q.x - q.nx, q.z - q.nz);
  ok(back < 0 && on > 0 && Math.abs(WO.arcAt(O, A.outline.length - 1e-9) - O.len) < 1e-3 && WO.arcAt(O, 0) === 0 && WO.arcAt(O, A.outline.length) === 0, 'shoreAt\'s normal points into the land; arcAt runs 0 … the shore\'s length over its control points (and wraps)'); }
{ const WF = await import('../../src/watercraft-face.js'), WC = await import('../../src/watercraft.js');
  const GE = WC.WATERCRAFT.sporewood.geometry, reeds = WF.reedPlan(L, WF.faceRng(7), { geo: GE });
  const shore = reeds.filter((r) => r.where === 'shore');
  ok(shore.length > 100 && shore.every((r) => WL.shoreDist(L, r.x, r.z) >= 0.3 && WL.shoreDist(L, r.x, r.z) <= GE.reedOff[1] + 0.2), `the reed runs plant ${shore.length} clumps by arc length along the shore, in the water within ${GE.reedOff[1]} m of the bank`);
  ok(reeds.some((r) => r.where === 'rock' && r.island === 'The Tussock') && reeds.every((r) => WL.shoreDist(L, r.x, r.z) > 0), 'reeds round the Tussock; no clump on land');
  const probe = { depth: (x, z) => WL.depthAt(L, x, z), fromShore: (x, z) => WL.shoreDist(L, x, z), along: (x, z) => WL.shoreAlong(L, x, z) };
  const at = (x, z) => WC.areaAt(x, z, probe, { arena: A, geo: GE });
  const inRuns = shore.filter((r) => at(r.x, r.z) === 'reeds').length, r0 = shore.find((r) => at(r.x, r.z) === 'reeds');
  ok(inRuns / shore.length > 0.65, `${inRuns} of the ${shore.length} shore clumps stand in the reeds' area (the rest in the outflow and the beds, decided first)`);
  ok(!!r0 && at(-66, 4) !== 'reeds' && at(GE.inflow.x, GE.inflow.z) === 'inflow' && at(48, 13) === 'dropoff' && at(0, -20) === null, 'areaAt on Sporewood\'s geometry: its reed runs, the inflow under the Seep, the Cup\'s drop-off; land is no area'); }
// the Chart's sheet: the world's own outline
{ const G = UC.waterGeometry(D_LOOP, 'sporewood');
  ok(G.outline === true && G.shore.length > 200 && G.shore.every(([x, z]) => Math.abs(WL.shoreDist(L, x, z)) < 0.2) && typeof G.shoreDist === 'function' && G.shoreDist(-46, 4) > 0,
    `the Chart's sheet is the world's outline (${G.shore.length} points on the shore) with its shore's distance for the pen`);
  ok(G.islands.length === 6 && G.islands.every((q) => Array.isArray(q.outline) && q.outline.length >= 6 && q.outline.every(([x, z]) => Math.abs(WL.shoreDist(L, x, z)) < 0.25)), 'each island on the sheet is its own outline'); }

section('W1 part 2: the world module and the art on the outline shore');
{
  const { createBus } = await import('../../src/core.js');
  const { create } = await import('../../src/world.js');
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(46, 16 / 9, 0.1, 500);
  const ctx = { data: D_LOOP, bus: createBus(), state: { meta: { settings: {} }, run: null }, flow: 'title', isMobile: false, errors: [], debug: {}, render: { scene, camera, isStub: false } };
  const W = create(ctx);
  W.init();
  W.setZone('sporewood', { instant: true });
  ok(W.getZone().id === 'sporewood' && W.getOutline() === W.getOutline() && !!W.getOutline() && ctx.errors.length === 0, 'the world builds Sporewood on its outline with no error', ctx.errors);
  ok(W.getGateState() === 'hidden' && !W.getObstacles().some((o) => o.kind === 'gatestone'), 'no gate and no standing stones (its legend\'s water its hidden gate)');
  // collision: a raft driven from open water in a straight line at the banks (the neck's, the islands', the spit's tip), collided every
  // step as the player is, is held off every bank by its radius (a gap narrower than the raft, between the Two Stools, it cannot enter)
  let worst = Infinity, steps = 0;
  for (let k = 0; k < 160; k++) {
    const p = { x: -88 + ((k * 7.31) % 168), z: -44 + ((k * 3.77) % 88) };
    if (WL.shoreDist(L, p.x, p.z) < 3) continue;
    const a = k * 2.399963, dx = Math.cos(a) * 0.3, dz = Math.sin(a) * 0.3;
    for (let i = 0; i < 300; i++) { p.x += dx; p.z += dz; W.collide(p, 1.6); worst = Math.min(worst, WL.shoreDist(L, p.x, p.z)); steps++; }
  }
  ok(steps > 20000 && worst >= 1.6 - 0.05, `collide holds the raft ${worst.toFixed(2)} m off every bank over ${steps} steps driven at them (its radius 1.6)`);
  { const p = { x: 45, z: -15.5 }; W.collide(p, 1.6); ok(WL.shoreDist(L, p.x, p.z) >= 1.55, 'the Tongue\'s tip pushes the raft off it'); }
  ok(W.getShoreDist(10, 3) === WL.shoreDist(L, 10, 3) && W.getFromShore(10, 3) === WL.shoreDist(L, 10, 3) && W.getGround(0, -20) > 0 && W.getShoreAlong(-50, 36) > 20, 'the world\'s shore queries are the field\'s (the bake, the probes, the ground, the runs)');
  const WCm = await import('../../src/watercraft.js'), pr = WCm.probeOf(W);
  ok(pr.fromShore(-50, -6) < 0 && pr.fromShore(-46, 4) > 0 && pr.along(-50, 36) > 20, 'watercraft.probeOf reads the field (the islands are land) and the shore run');
  ok(W.getBakeHalf() >= Math.max(-L.outline.bbox.x0, L.outline.bbox.x1) + 4, `the water's bake (half ${W.getBakeHalf()} m) covers the basin`);
  // the art: the banks one mesh whose waterline lies on the shore; no stone ring or cliff
  let banks = null, cliffs = null, stones = null; W.group.traverse((o) => { if (o.name === 'banks') banks = o; if (o.name === 'cliffs') cliffs = o; if (o.name === 'gateStones') stones = o; });
  ok(!!banks && !cliffs && (!stones || !stones.geometry.attributes.position), 'the banks are one mesh (no polar cliff ring, no gate stones or ring)');
  const nm = []; W.group.traverse((o) => { if (o.isMesh) nm.push(o.name); });
  ok(!nm.includes('tollTower') && !nm.includes('sluiceVeil'), 'the Mossmere\'s W9 pieces (the toll-tower, the Sluice Veil) are not built at Sporewood');
  if (banks) {
    const P = banks.geometry.attributes.position.array; let onShore = 0, off = 0;
    for (let i = 0; i < P.length; i += 3) if (Math.abs(P[i + 1]) < 1e-6) { onShore++; if (Math.abs(WL.shoreDist(L, P[i], P[i + 2])) > 0.12) off++; }
    ok(onShore > 250 && off === 0, `the banks' waterline vertices (${onShore}) lie on the shore (|field| ≤ 0.12 m)`);
    ok(banks.geometry.index.count / 3 <= 26000, `the banks' triangles on high: ${banks.geometry.index.count / 3} (≤ 26k)`);
  }
  // the Mossmere is the Mossmere again after Sporewood (a re-built polar shore)
  W.setZone('mossmere', { instant: true });
  let cl = null; W.group.traverse((o) => { if (o.name === 'cliffs') cl = o; });
  ok(!!cl && W.getOutline() === null && W.getShoreAlong(1, 1) === null, 'back at the Mossmere: its cliffs, no outline');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
