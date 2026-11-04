// tools/walk-lib.mjs — graph helpers over data.walkGridFor() for validate-data.mjs and walkmap.mjs.
// Same move rules the player controller and the crawler flow field use (DESIGN §24.3 / §24.8):
// 8-neighbour moves on walkable cells, no corner cutting, step up ≤ stepUp, step down ≤ stepDown,
// plus authored one-way drops.
import * as D from '../src/data.js';

const F = D.WALK_FLAGS;
export const isWalk = (G, k) => k >= 0 && (G.flags[k] & F.GROUND) && !(G.flags[k] & F.BLOCK);
export const isLakeWater = (G, k) => k >= 0 && (G.flags[k] & F.WATER) && !(G.flags[k] & F.BLOCK) && (!(G.flags[k] & F.GROUND) || (G.flags[k] & F.RAFTPASS));
export const isAnyWater = (G, k) => k >= 0 && !(G.flags[k] & F.BLOCK) && ((G.flags[k] & F.POOL) || (G.flags[k] & F.WATER)) && (!(G.flags[k] & F.GROUND) || (G.flags[k] & F.BRIDGE));
export const cellXZ = (G, k) => [G.ox + ((k % G.n) + 0.5) * G.cell, G.oz + (((k / G.n) | 0) + 0.5) * G.cell];

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

/** Walking distance field (metres) from seed cells. */
export function walkDistances(G, zone, seeds, opt = {}) {
  const W = D.BALANCE.walk, up = opt.stepUp ?? W.stepUp, down = opt.stepDown ?? W.stepDown;
  const { n, cell, top } = G, dist = new Float64Array(n * n).fill(Infinity), h = new Heap();
  for (const k of seeds) if (isWalk(G, k)) { dist[k] = 0; h.push(0, k); }
  const drops = new Map();
  for (const d of zone.arena.drops || []) {
    const a = G.idx(d.from.x, d.from.z), b = G.idx(d.to.x, d.to.z);
    if (!drops.has(a)) drops.set(a, []);
    drops.get(a).push([b, Math.hypot(d.to.x - d.from.x, d.to.z - d.from.z) + 1]);
  }
  while (h.size) {
    const [d, k] = h.pop(); if (d > dist[k]) continue;
    const i = k % n, j = (k / n) | 0;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      if (!di && !dj) continue;
      const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue;
      const q = jj * n + ii; if (!isWalk(G, q)) continue;
      if (di && dj && (!isWalk(G, j * n + ii) || !isWalk(G, jj * n + i))) continue;
      const dy = top[q] - top[k]; if (dy > up || -dy > down) continue;
      const nd = d + (di && dj ? Math.SQRT2 : 1) * cell;
      if (nd < dist[q]) { dist[q] = nd; h.push(nd, q); }
    }
    for (const [b, c] of drops.get(k) || []) if (isWalk(G, b) && d + c < dist[b]) { dist[b] = d + c; h.push(d + c, b); }
  }
  return dist;
}

/** Raft-navigable mask: lake water (or under a raftPass bridge) with `radius` clearance. */
export function raftMask(G, radius = D.BALANCE.move.raftRadius) {
  const { n, cell } = G, m = new Uint8Array(n * n), r = Math.ceil(radius / cell);
  const offs = [];
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

/** Seeds for "reachable on foot". Foot lakes: the spawn only (the ferry raft is optional).
 *  Mixed lakes: every mooring stand (each island is reached by raft, then walked). */
export function footSeeds(G, zone) {
  const A = zone.arena;
  if (A.spawnMode === 'foot') return [G.idx(A.spawn.x, A.spawn.z)];
  return (A.moorings || []).map((m) => G.idx(m.stand.x, m.stand.z));
}
export const openAll = (zone) => Object.fromEntries((zone.arena.shortcuts || []).map((s) => [s.id, true]));
