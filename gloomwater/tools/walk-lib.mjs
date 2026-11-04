// tools/walk-lib.mjs — graph, camera and cast helpers over data.walkGridFor() for validate-data.mjs,
// walkmap.mjs and balance-foot.mjs (walking build: data.js is evaluated with WALK_ENABLED on).
//
// Movement rules are the ones the player controller and the crawler flow field use (DESIGN §24.3–§24.4):
// 8-neighbour moves on walkable cells, no corner cutting, symmetric steps (walkStepOK: |dy| ≤ stepUp + eps),
// plus authored one-way drops. Every reachability check runs on the grid ERODED by the Wick's body: a cell
// is usable only when a disc of BALANCE.walk.radius around its centre overlaps no blocking cell (a cell that
// is not walkable, or whose height is not a legal step from the centre cell).
import './walk-on.mjs';
import * as D from '../src/data.js?walk';

export { D };
const F = D.WALK_FLAGS;
const W = D.BALANCE.walk;
export const isWalk = (G, k) => k >= 0 && (G.flags[k] & F.GROUND) && !(G.flags[k] & F.BLOCK);
export const isLakeWater = (G, k) => k >= 0 && (G.flags[k] & F.WATER) && !(G.flags[k] & F.BLOCK) && (!(G.flags[k] & F.GROUND) || (G.flags[k] & F.RAFTPASS));
export const isAnyWater = (G, k) => k >= 0 && !(G.flags[k] & F.BLOCK) && ((G.flags[k] & F.POOL) || (G.flags[k] & F.WATER)) && (!(G.flags[k] & F.GROUND) || (G.flags[k] & F.BRIDGE));
export const cellXZ = (G, k) => [G.ox + ((k % G.n) + 0.5) * G.cell, G.oz + (((k / G.n) | 0) + 0.5) * G.cell];
export const openAll = (zone) => Object.fromEntries((D.walkArenaFor(zone).shortcuts || []).map((s) => [s.id, true]));
export const variantsOf = (zone) => [null, ...((D.walkArenaFor(zone).walk?.variants) || []).map((v) => v.id)];
export const footSpeed = () => D.STATS.moveSpeed.base * W.speedMult;

class Heap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(d, k) { const a = this.a; a.push([d, k]); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (a[p][0] <= a[i][0]) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } }
  pop() {
    const a = this.a, r = a[0], l = a.pop();
    if (a.length) { a[0] = l; let i = 0; for (;;) { const x = 2 * i + 1, y = x + 1; let m = i; if (x < a.length && a[x][0] < a[m][0]) m = x; if (y < a.length && a[y][0] < a[m][0]) m = y; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } }
    return r;
  }
}

/** Body-eroded walkable mask (Uint8). radius defaults to BALANCE.walk.radius. */
export function erode(G, radius = W.radius) {
  const { n, cell, top } = G, h = cell / 2, R = Math.ceil((radius + h) / cell) + 1, m = new Uint8Array(n * n);
  for (let j = R; j < n - R; j++) for (let i = R; i < n - R; i++) {
    const k = j * n + i; if (!isWalk(G, k)) continue;
    let ok = true;
    for (let dj = -R; dj <= R && ok; dj++) for (let di = -R; di <= R && ok; di++) {
      const q = k + dj * n + di;
      if (isWalk(G, q) && D.walkStepOK(top[k], top[q])) continue;
      const ex = Math.max(0, Math.abs(di) * cell - h), ez = Math.max(0, Math.abs(dj) * cell - h);
      if (Math.hypot(ex, ez) < radius) ok = false;
    }
    m[k] = ok ? 1 : 0;
  }
  return m;
}
/** Nearest cell of `mask` to (x, z) within maxR metres (−1 if none). */
export function snap(G, mask, x, z, maxR = 1.5) {
  const k0 = G.idx(x, z); if (k0 < 0) return -1;
  const { n, cell } = G, i0 = k0 % n, j0 = (k0 / n) | 0, R = Math.ceil(maxR / cell);
  let best = -1, bd = Infinity;
  for (let dj = -R; dj <= R; dj++) for (let di = -R; di <= R; di++) {
    const i = i0 + di, j = j0 + dj; if (i < 0 || j < 0 || i >= n || j >= n) continue;
    const k = j * n + i; if (!mask[k]) continue;
    const [cx, cz] = cellXZ(G, k), d = Math.hypot(cx - x, cz - z);
    if (d <= maxR && d < bd) { bd = d; best = k; }
  }
  return best;
}
/** Walking distance field (metres) over `mask` from seed cells; drops are one-way edges. */
export function walkDistances(G, zone, seeds, mask) {
  const A = D.walkArenaFor(zone), { n, cell, top } = G, dist = new Float64Array(n * n).fill(Infinity), hp = new Heap();
  for (const k of seeds) if (k >= 0 && mask[k]) { dist[k] = 0; hp.push(0, k); }
  const drops = new Map();
  for (const d of A.drops || []) {
    const a = snap(G, mask, d.from.x, d.from.z, 1.5), b = snap(G, mask, d.to.x, d.to.z, 1.5);
    if (a < 0 || b < 0) continue;
    // a drop may be taken from any usable cell within 1 m of its top end
    const [ax, az] = cellXZ(G, a);
    for (let dj = -2; dj <= 2; dj++) for (let di = -2; di <= 2; di++) {
      const k = a + dj * n + di; if (!mask[k]) continue; const [x, z] = cellXZ(G, k); if (Math.hypot(x - ax, z - az) > 1) continue;
      if (!drops.has(k)) drops.set(k, []); drops.get(k).push([b, Math.hypot(d.to.x - d.from.x, d.to.z - d.from.z) + 1]);
    }
  }
  while (hp.size) {
    const [d, k] = hp.pop(); if (d > dist[k]) continue;
    const i = k % n, j = (k / n) | 0;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      if (!di && !dj) continue;
      const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue;
      const q = jj * n + ii; if (!mask[q]) continue;
      if (di && dj && (!mask[j * n + ii] || !mask[jj * n + i])) continue;
      if (!D.walkStepOK(top[k], top[q])) continue;
      const nd = d + (di && dj ? Math.SQRT2 : 1) * cell;
      if (nd < dist[q]) { dist[q] = nd; hp.push(nd, q); }
    }
    for (const [b, c] of drops.get(k) || []) if (d + c < dist[b]) { dist[b] = d + c; hp.push(d + c, b); }
  }
  return dist;
}
/** Raft-navigable mask: lake water (or under a raftPass bridge) with `radius` clearance. */
export function raftMask(G, radius = D.BALANCE.move.raftRadius) {
  const { n, cell } = G, m = new Uint8Array(n * n), r = Math.ceil(radius / cell), offs = [];
  for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) if (Math.hypot(di, dj) * cell <= radius) offs.push([di, dj]);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const k = j * n + i; if (!isLakeWater(G, k)) continue;
    let okc = true;
    for (const [di, dj] of offs) { const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= n || jj >= n || !isLakeWater(G, jj * n + ii)) { okc = false; break; } }
    if (okc) m[k] = 1;
  }
  return m;
}
/** Connected component (4-neighbour) of a mask from a start cell. */
export function component(G, mask, start) {
  const { n } = G, seen = new Uint8Array(n * n); if (start < 0 || !mask[start]) return seen;
  const q = [start]; seen[start] = 1;
  while (q.length) {
    const k = q.pop(), i = k % n, j = (k / n) | 0;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue;
      const p = jj * n + ii; if (!seen[p] && mask[p]) { seen[p] = 1; q.push(p); }
    }
  }
  return seen;
}
/** Seeds for "reachable on foot": foot lakes the spawn; mixed lakes every mooring stand. Snapped to the eroded mask. */
export function footSeeds(G, zone, mask) {
  const A = D.walkArenaFor(zone);
  const pts = A.spawnMode === 'foot' ? [A.spawn] : (A.moorings || []).map((m) => m.stand);
  return pts.map((p) => snap(G, mask, p.x, p.z, 1.5)).filter((k) => k >= 0);
}
export function lampName(zone, l) { return l.name ?? D.PLACE_BY_ID[l.place]?.name ?? l.id; }

// ------------------------------------------------------------------------------- heights of solids
const PROP_H = { island: 8, giant: 14, tower: 10, cap: 4, lily: 1.2, wreck: 3, stalk: 10, reliquary: 5, shelf: 6, rib: 9, post: 2.5 };
/** Height (m) of whatever stands at (x, z): ground top, prop height for blocks, else −1 (water/void). */
export function solidHeight(G, zone, x, z) {
  const k = G.idx(x, z); if (k < 0) return -1;
  const f = G.flags[k];
  if (f & F.BLOCK) {
    const A = D.walkArenaFor(zone);
    [x, z] = cellXZ(G, k);   // blocks are painted by cell centre
    for (const o of A.islands || []) if (Math.hypot(x - o.x, z - o.z) <= D.obstacleRadius(o, true)) return PROP_H[o.kind] ?? PROP_H.island;
    for (const o of A.pillars || []) if (Math.hypot(x - o.x, z - o.z) <= o.r) return (Number.isNaN(G.top[k]) ? 0 : G.top[k]) + (PROP_H[o.kind] ?? 5);
    for (const l of A.lamps || []) if (Math.hypot(x - l.x, z - l.z) <= D.BALANCE.lamps.postR) return (Number.isNaN(G.top[k]) ? 0 : G.top[k]) + PROP_H.post;
    for (const b of A.walk?.blocks || []) if (!Number.isNaN(D.walkShapeHeight(b.kind === 'rect' ? b : { ...b, kind: 'disc' }, x, z))) return (Number.isNaN(G.top[k]) ? 0 : G.top[k]) + (b.h ?? 1.5);
    return 5;
  }
  if (f & F.GROUND) return G.top[k];
  return -1;
}
/** Ground top at (x, z) for land cells (props ignored), else −1. This is what render samples. */
export function groundTop(G, x, z) { const k = G.idx(x, z); return k >= 0 && (G.flags[k] & F.GROUND) ? G.top[k] : -1; }

// ------------------------------------------------------------------------------- casting
export const castReach = (standY) => D.STATS.castMax.base + (standY > W.highCast.from ? Math.min(W.highCast.cap, W.highCast.perM * (standY - W.highCast.from)) : 0);
/** Does the cast arc from a stand (ground y) to a water point clear land? (fishing's test, DESIGN §24.3) */
export function arcClear(G, zone, sx, sz, sy, tx, tz) {
  const d = Math.hypot(tx - sx, tz - sz), tip = sy + W.rodTip, aH = D.BALANCE.cast.arcHeight * d;
  for (let s = 0.15; s <= 0.951; s += 0.02) {
    const x = sx + (tx - sx) * s, z = sz + (tz - sz) * s, y = tip * (1 - s) + 4 * aH * s * (1 - s);
    const h = solidHeight(G, zone, x, z); if (h > y - 0.15) return false;
  }
  return true;
}
/** Locked / plumbed targets drop in from above (DESIGN §24.3): no arc test. */
export const dropIn = (place) => place.rule?.type === 'plumb' || (place.rule?.type === 'targets' && !!place.rule.lockPicks);

// ------------------------------------------------------------------------------- camera (render's fish / pool framing)
const DEGR = Math.PI / 180;
/** Required fish-camera elevation (deg) over the bobber from the land profile toward the camera (+z). */
export function poolElev(G, bx, bz) {
  const P = W.camera.pool; let e = 0;
  for (let s = P.step; s <= P.reach + 1e-9; s += P.step) { const t = groundTop(G, bx, bz + s); if (t >= 0) e = Math.max(e, Math.atan((t + P.pad) / s) / DEGR + P.add); }
  return e;
}
/** Fish-framing camera for a stand → bobber (day), following render's formulas and the v2 pool rule. */
export function fishCamera(G, sx, sz, sy, bx, bz) {
  const sep = Math.min(40, Math.hypot(bx - sx, bz - sz));
  const base = 34 + Math.max(0, Math.min(20, sep - 12)) * 0.4, dist = Math.max(14, 8.5 + sep * 0.78);
  const need = poolElev(G, bx, bz), pool = need > base || sy - 0 >= 2;
  const elev = Math.min(W.camera.pool.cap, Math.max(base, need));
  const fx = pool ? bx : sx + (bx - sx) * 0.44, fz = pool ? bz : sz + (bz - sz) * 0.44, fy = pool ? 0 : sy * 0.5;
  const cy = Math.max(fy + Math.sin(elev * DEGR) * dist, sy + 2.5), cz = fz + Math.cos(elev * DEGR) * dist;
  return { x: fx, y: cy, z: cz, elev, need, pool };
}
/** Is a point visible from a camera position (props and land as solids)? */
export function seen(G, zone, cam, px, py, pz, skip = 0.3) {
  const L = Math.hypot(px - cam.x, pz - cam.z), N = Math.ceil(L / 0.25);
  for (let i = 1; i < N; i++) {
    const s = i / N, x = cam.x + (px - cam.x) * s, z = cam.z + (pz - cam.z) * s, y = cam.y + (py - cam.y) * s;
    if (Math.hypot(x - px, z - pz) < skip) continue;
    if (solidHeight(G, zone, x, z) > y) return false;
  }
  return true;
}
/**
 * Castable water of a place from a stand: cells inside place.water that are water (not under a bridge),
 * within reach, ≥ cast.minDist, with a clear arc (unless the place drops in). Returns [{x, z, vis}].
 */
export function castable(G, zone, place, st, onlyIn = null) {
  const sy = G.top[G.idx(st.x, st.z)], reach = castReach(sy), minD = D.BALANCE.cast.minDist, out = [];
  if (!Number.isFinite(sy)) return { sy, cells: out };
  const [x0, z0, x1, z1] = D.walkShapeBounds(place.water);
  for (let z = Math.ceil(z0 / G.cell) * G.cell + G.cell / 2; z <= z1; z += G.cell) for (let x = Math.ceil(x0 / G.cell) * G.cell + G.cell / 2; x <= x1; x += G.cell) {
    if (!D.placeContains(place, x, z) || (onlyIn && !onlyIn(x, z))) continue;
    const k = G.idx(x, z); if (!isAnyWater(G, k) || (G.flags[k] & F.BRIDGE)) continue;
    const d = Math.hypot(x - st.x, z - st.z); if (d > reach || (d < minD && !dropIn(place))) continue;
    if (!dropIn(place) && !arcClear(G, zone, st.x, st.z, sy, x, z)) continue;
    const cam = fishCamera(G, st.x, st.z, sy, x, z);
    out.push({ x, z, vis: cam.elev <= W.camera.pool.cap + 1e-9 && cam.need <= W.camera.pool.cap + 1e-9 && seen(G, zone, cam, x, 0.05, z) });
  }
  return { sy, cells: out };
}
