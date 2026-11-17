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

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
