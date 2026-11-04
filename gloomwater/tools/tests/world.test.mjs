// World layout tests (pure functions, no browser): the authored arena data (data.js ZONES[].arena,
// DESIGN §4.3–4.6) must actually be built.   node tools/tests/world.test.mjs
import * as data from '../../src/data.js';
import { buildLayout, depthAt, isOpenWaterL } from '../../src/world-layout.js';

let pass = 0, fail = 0;
const failures = [];
const ok = (c, msg) => { if (c) pass++; else { fail++; failures.push(msg); console.log('  FAIL:', msg); } };
const near = (a, b, eps) => Math.abs(a - b) <= eps;

for (const z of data.ZONES) {
  const A = z.arena, L = buildLayout(z);
  const obs = [...L.obstacles, ...L.gateObstacles];
  console.log(`- ${z.id}`);
  ok(L.islands.length === A.islands.length, `${z.id}: ${A.islands.length} authored islands built (got ${L.islands.length})`);
  ok(L.pillars.length === A.pillars.length, `${z.id}: ${A.pillars.length} authored pillars built (got ${L.pillars.length})`);
  ok(A.islands.every((o) => L.islands.some((p) => p.x === o.x && p.z === o.z && p.r === o.r)), `${z.id}: islands at their authored circles`);
  ok(near(L.spawn.x, A.spawn.x, 1e-9) && near(L.spawn.z, A.spawn.z, 1e-9), `${z.id}: spawn at (${A.spawn.x}, ${A.spawn.z})`);
  if (A.gate) ok(near(L.gate.x, A.gate.x, 1e-9) && near(L.gate.z, A.gate.z, 1e-9), `${z.id}: gate at (${A.gate.x}, ${A.gate.z})`);
  ok(L.docks.length === A.docks.length, `${z.id}: ${A.docks.length} docks`);
  ok(near(L.docks[0].x, A.docks[0].x, 3) && near(L.docks[0].z, A.docks[0].z, 3), `${z.id}: day-1 dock near (${A.docks[0].x}, ${A.docks[0].z})`);
  ok(isOpenWaterL(L, obs, L.spawn.x, L.spawn.z, 1.6), `${z.id}: spawn is open water`);
  ok(L.docks.every((d) => isOpenWaterL(L, obs, d.x, d.z, 1.6)), `${z.id}: every dock is open water`);
  // legend pool depth (DESIGN §4.3: legend pools sit at depth >= 0.8)
  const lp = A.legendPool;
  ok(depthAt(L, lp.x, lp.z) >= 0.8, `${z.id}: legend pool depth ${depthAt(L, lp.x, lp.z).toFixed(2)} >= 0.8`);
  for (const p of A.deepPools || []) ok(depthAt(L, p.x, p.z) >= 0.75, `${z.id}: ${p.name} reads deep`);
  // depth share shallow/mid/deep within 4 points of arena.depthShare
  const c = [0, 0, 0]; let n = 0;
  for (let x = -A.radius; x <= A.radius; x += 1.5) for (let y = -A.radius; y <= A.radius; y += 1.5) {
    if (!isOpenWaterL(L, obs, x, y, 0.5)) continue;
    n++; const d = depthAt(L, x, y); c[d < 0.35 ? 0 : d < 0.75 ? 1 : 2]++;
  }
  const share = c.map((v) => (100 * v) / n);
  ok(share.every((v, i) => near(v, A.depthShare[i], 4)), `${z.id}: depth share ${share.map((v) => v.toFixed(0)).join('/')} ~ ${A.depthShare.join('/')}`);
  // reachability (flood fill at the raft radius): gate (if any) and every dock reachable from the spawn
  const R = Math.ceil(L.R + 2), step = 0.75, M = Math.round((2 * R) / step) + 1;
  const open = new Uint8Array(M * M), seen = new Uint8Array(M * M);
  const toW = (i) => -R + i * step, idx = (i, j) => i * M + j;
  for (let i = 0; i < M; i++) for (let j = 0; j < M; j++) open[idx(i, j)] = isOpenWaterL(L, obs, toW(i), toW(j), 1.6) ? 1 : 0;
  const si = Math.round((L.spawn.x + R) / step), sj = Math.round((L.spawn.z + R) / step);
  const q = [idx(si, sj)]; seen[q[0]] = 1;
  while (q.length) {
    const k = q.pop(), i = (k / M) | 0, j = k % M;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const a = i + di, b = j + dj;
      if (a < 0 || b < 0 || a >= M || b >= M) continue;
      const kk = idx(a, b); if (open[kk] && !seen[kk]) { seen[kk] = 1; q.push(kk); }
    }
  }
  const reach = (x, zz, r = 3) => { const i = Math.round((x + R) / step), j = Math.round((zz + R) / step); for (let di = -r; di <= r; di++) for (let dj = -r; dj <= r; dj++) if (seen[idx(i + di, j + dj)]) return true; return false; };
  if (A.gate) ok(reach(L.gate.x, L.gate.z, 2), `${z.id}: the gate's whirlpool is reachable through the stones`);
  ok(L.docks.every((d) => reach(d.x, d.z)), `${z.id}: every dock reachable`);
}

// DESIGN §4.6 dock rotation through the real world module: day 1 = docks[0], never the same dock
// two days running, every dock used
{
  const { create } = await import('../../src/world.js');
  const { createBus } = await import('../../src/core.js');
  const ctx = { data, bus: createBus(), state: { meta: { settings: {} }, run: null }, flow: 'title', isMobile: false, errors: [] };
  const world = create(ctx);
  for (const z of data.ZONES) {
    world.setZone(z.id, { instant: true });
    const key = (d) => `${Math.round(d.position.x)},${Math.round(d.position.z)}`;
    const d1 = world.getMerchantDock(1);
    ok(Math.hypot(d1.position.x - z.arena.docks[0].x, d1.position.z - z.arena.docks[0].z) < 3, `${z.id}: day 1 moors at docks[0]`);
    let prev = key(d1); const used = new Set([prev]);
    for (let day = 2; day <= 40; day++) { const k = key(world.getMerchantDock(day)); ok(k !== prev, `${z.id}: day ${day} dock differs from yesterday`); used.add(k); prev = k; }
    ok(used.size >= Math.min(3, z.arena.docks.length), `${z.id}: Murk uses several docks (${used.size})`);
    ok(world.getObstacles().length >= z.arena.islands.length + z.arena.pillars.length, `${z.id}: world.getObstacles() carries islands + pillars`);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) { console.log(failures.map((f) => ' - ' + f).join('\n')); process.exit(1); }
