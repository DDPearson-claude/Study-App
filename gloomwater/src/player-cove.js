// player-cove.js — the Landing's raft mode for player.js (Landing v0 / the First Evening slice; DESIGN §25.4.8, §25.14.2b FE-S1,
// CONTRACT §13.3, §13.12). Pure helpers: no THREE, no ctx, so tools/tests can drive them in node.
//
//   coveRaftMask(D)              the closed cove as raft water: data.walkGridFor(COVE) eroded by the raft radius (validate-data's
//                                model, FE-T1), minus the breakwaters and the soft wall across the arch (COVE.arena.closure), minus
//                                Murk's barge pad and the Waystones, cut to the component that holds the mooring slot. The cove is
//                                closed (validated), so a raft that only ever steps onto mask cells never crosses the arch line
//                                and never leaves the cove. Only a glide (no collision) passes the soft wall.
//   pathLength / pointAt         arc-length helpers for the glides and the auto-sail lane
//   hermite(L, T, v0, v1)        a cubic arc-length profile s(t) with s(0) = 0, s(T) = L and the given end speeds
//   crossTime(path, prof, z)     when a profile along a path first crosses the line z (northward), by bisection
//   departurePlan(...)           the Set Out timing: an input-locked auto-sail along [start, ...via, joinAt] at raft speed, then the
//                                3 s glide along [joinAt, ...setOutPath.slice(glideFrom)], timed so the raft crosses COVE.archLineZ
//                                FIRST_EVENING.stepSec.setout (6 s) after Set Out whatever point in the post's reach it leaves from

const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const segD = (px, pz, ax, az, bx, bz) => {
  const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
  const t = L2 > 0 ? Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / L2)) : 0;
  return Math.hypot(px - ax - t * dx, pz - az - t * dz);
};
/** Distance from a point to a polyline [[x, z], …]. */
export function polyDist(pts, x, z) {
  let m = Infinity;
  for (let i = 1; i < pts.length; i++) m = Math.min(m, segD(x, z, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]));
  return m;
}

const WATER = 2, BLOCK = 8, GROUND = 1, RAFTPASS = 16;
const isLakeWater = (G, k) => k >= 0 && (G.flags[k] & WATER) && !(G.flags[k] & BLOCK) && (!(G.flags[k] & GROUND) || (G.flags[k] & RAFTPASS));

/**
 * The closed cove's raft water (see the header). `D` is data.js (needs COVE, walkGridFor, BALANCE.move.raftRadius, WALK_FLAGS).
 * Returns {ok(x, z) -> bool, nearest(x, z) -> [x, z] | null, G, mask, cells} or null when the data cannot build it.
 */
export function coveRaftMask(D, opts = {}) {
  const C = D?.COVE, A = C?.arena;
  if (!C || !A || typeof D.walkGridFor !== 'function') return null;
  const F = D.WALK_FLAGS || {};
  const W = { water: F.WATER ?? WATER, block: F.BLOCK ?? BLOCK, ground: F.GROUND ?? GROUND, raftpass: F.RAFTPASS ?? RAFTPASS };
  const lake = (G, k) => k >= 0 && (G.flags[k] & W.water) && !(G.flags[k] & W.block) && (!(G.flags[k] & W.ground) || (G.flags[k] & W.raftpass));
  let G;
  try { G = D.walkGridFor(C); } catch { return null; }
  if (!G || !G.flags) return null;
  const rr = num(opts.raftRadius, num(D.BALANCE?.move?.raftRadius, 1.6));
  const { n, cell } = G;
  const xz = (k) => [G.ox + ((k % n) + 0.5) * cell, G.oz + (((k / n) | 0) + 0.5) * cell];
  // 1) raft water: every cell within the raft radius is lake water (validate-data's raftMask)
  const r = Math.ceil(rr / cell), offs = [];
  for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) if (Math.hypot(di, dj) * cell <= rr) offs.push(dj * n + di, di, dj);
  const m = new Uint8Array(n * n);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const k = j * n + i; if (!lake(G, k)) continue;
    let okc = true;
    for (let q = 0; q < offs.length; q += 3) {
      const ii = i + offs[q + 1], jj = j + offs[q + 2];
      if (ii < 0 || jj < 0 || ii >= n || jj >= n || !lake(G, jj * n + ii)) { okc = false; break; }
    }
    if (okc) m[k] = 1;
  }
  // 2) the closure (breakwaters + the soft wall), Murk's barge pad and the Waystones
  const CL = A.closure || {};
  const segs = [...(CL.breakwaters || []).map((b) => [b.pts, num(b.w, 1.2)]), ...(CL.softWall ? [[CL.softWall.pts, 0]] : [])];
  const discs = [];
  for (const d of A.docks || []) discs.push([d.x, d.z, num(opts.bargePad, 2.3)]);
  for (const w of C.waystones || []) discs.push([w.x, w.z, num(opts.stoneR, 1.1)]);
  for (let k = 0; k < n * n; k++) {
    if (!m[k]) continue;
    const [x, z] = xz(k);
    if (segs.some(([pts, w]) => polyDist(pts, x, z) < rr + w / 2 + 0.1) || discs.some(([dx, dz, dr]) => Math.hypot(x - dx, z - dz) < rr + dr)) m[k] = 0;
  }
  // 3) the component that holds the mooring slot (4-neighbour)
  const slot = A.moorings?.[0]?.slot || { x: 7, z: 2 };
  let start = G.idx(slot.x, slot.z);
  if (start < 0 || !m[start]) {
    let best = Infinity; start = -1;
    for (let k = 0; k < n * n; k++) if (m[k]) { const [x, z] = xz(k), d = Math.hypot(x - slot.x, z - slot.z); if (d < best) { best = d; start = k; } }
  }
  const comp = new Uint8Array(n * n);
  if (start >= 0) {
    const stack = [start]; comp[start] = 1;
    while (stack.length) {
      const k = stack.pop(), i = k % n, j = (k / n) | 0;
      if (i > 0 && m[k - 1] && !comp[k - 1]) { comp[k - 1] = 1; stack.push(k - 1); }
      if (i < n - 1 && m[k + 1] && !comp[k + 1]) { comp[k + 1] = 1; stack.push(k + 1); }
      if (j > 0 && m[k - n] && !comp[k - n]) { comp[k - n] = 1; stack.push(k - n); }
      if (j < n - 1 && m[k + n] && !comp[k + n]) { comp[k + n] = 1; stack.push(k + n); }
    }
  }
  let cells = 0; for (let k = 0; k < n * n; k++) cells += comp[k];
  const ok = (x, z) => { const k = G.idx(x, z); return k >= 0 && comp[k] === 1; };
  function nearest(x, z, maxR = 12) {
    const k0 = G.idx(x, z);
    if (k0 >= 0 && comp[k0]) return [x, z];
    let best = null, bd = Infinity;
    const R = Math.ceil(maxR / cell), i0 = Math.floor((x - G.ox) / cell), j0 = Math.floor((z - G.oz) / cell);
    for (let dj = -R; dj <= R; dj++) for (let di = -R; di <= R; di++) {
      const ii = i0 + di, jj = j0 + dj; if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue;
      const k = jj * n + ii; if (!comp[k]) continue;
      const [cx, cz] = xz(k), d = Math.hypot(cx - x, cz - z);
      if (d < bd) { bd = d; best = [cx, cz]; }
    }
    return best;
  }
  return { ok, nearest, G, mask: comp, cells, raftRadius: rr };
}
export { isLakeWater };

// ---------------------------------------------------------------- paths and timing
export function pathLength(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
}
/** The point at arc length s along pts (clamped), with the unit direction of its segment. */
export function pointAt(pts, s, out = {}) {
  let rem = Math.max(0, s);
  for (let i = 1; i < pts.length; i++) {
    const ax = pts[i - 1][0], az = pts[i - 1][1], bx = pts[i][0], bz = pts[i][1];
    const L = Math.hypot(bx - ax, bz - az);
    if (rem <= L || i === pts.length - 1) {
      const t = L > 0 ? Math.min(1, rem / L) : 1;
      out.x = ax + (bx - ax) * t; out.z = az + (bz - az) * t;
      out.dx = L > 0 ? (bx - ax) / L : 0; out.dz = L > 0 ? (bz - az) / L : -1;
      return out;
    }
    rem -= L;
  }
  const p = pts[pts.length - 1] || [0, 0];
  out.x = p[0]; out.z = p[1]; out.dx = 0; out.dz = -1;
  return out;
}
/**
 * A cubic arc-length profile over [0, T]: s(0) = 0, s(T) = L, s'(0) = v0, s'(T) = v1. Falls back to constant speed when the
 * cubic would run backwards (it never does for the speeds the cove uses). Returns {s(t), v(t), L, T}.
 */
export function hermite(L, T, v0 = 0, v1 = null) {
  T = Math.max(1e-3, T);
  const avg = L / T;
  const e1 = v1 === null || v1 === undefined ? Math.max(0, 2 * avg - v0) : v1;
  const s = (t) => { const u = Math.max(0, Math.min(1, t / T)), u2 = u * u, u3 = u2 * u; return (u3 - 2 * u2 + u) * T * v0 + (3 * u2 - 2 * u3) * L + (u3 - u2) * T * e1; };
  const v = (t) => { const u = Math.max(0, Math.min(1, t / T)), u2 = u * u; return (3 * u2 - 4 * u + 1) * v0 + (6 * u - 6 * u2) * L / T + (3 * u2 - 2 * u) * e1; };
  let mono = true;
  for (let i = 0; i <= 40; i++) if (v((i / 40) * T) < -1e-6) { mono = false; break; }
  if (!mono) return { s: (t) => avg * Math.max(0, Math.min(T, t)), v: () => avg, L, T, v0: avg, v1: avg };
  return { s, v, L, T, v0, v1: e1 };
}
/** The time a profile along `path` first reaches the line z = lineZ heading north (−z), or null if it never does. */
export function crossTime(path, prof, lineZ) {
  // arc length at the crossing: the first segment that spans lineZ
  let acc = 0, sCross = null;
  for (let i = 1; i < path.length; i++) {
    const [ax, az] = path[i - 1], [bx, bz] = path[i];
    const L = Math.hypot(bx - ax, bz - az);
    if (az > lineZ && bz <= lineZ) { sCross = acc + L * ((az - lineZ) / (az - bz)); break; }
    acc += L;
  }
  if (sCross === null || sCross > prof.L + 1e-9) return null;
  let lo = 0, hi = prof.T;
  for (let k = 0; k < 60; k++) { const mid = (lo + hi) / 2; if (prof.s(mid) < sCross) lo = mid; else hi = mid; }
  return hi;
}
/**
 * The Set Out departure (FE-S1): from `start` [x, z] with speed `vStart` along the lane, an auto-sail along [start, ...via, joinAt]
 * ending at raft speed `vRaft`, then the glide along [joinAt, ...setOutPath.slice(glideFrom)] for `glide` s; the auto-sail's length
 * in time makes the arch crossing land at `total` s (6 s). Returns {lane, glidePath, sail: profile, glideProf, sailT, crossAt, total}.
 */
export function departurePlan({ start, via = [], joinAt, setOutPath, glideFrom = 1, archLineZ = -18, vStart = 0, vRaft = 6, glide = 3, total = 6, minSail = 1.2 }) {
  const lane = [start, ...via, joinAt];
  const glidePath = [joinAt, ...setOutPath.slice(glideFrom)];
  const glideProf = hermite(pathLength(glidePath), glide, vRaft);
  const tArch = crossTime(glidePath, glideProf, archLineZ) ?? glide;
  const sailT = Math.max(minSail, total - tArch);
  const sail = hermite(pathLength(lane), sailT, Math.max(0, vStart), vRaft);
  return { lane, glidePath, sail, glideProf, sailT, crossAt: sailT + tArch, total: sailT + glide };
}
/** The every-run glide from the mooring (FIRST_EVENING.everyRun): COVE.setOutPath over `glide` s from rest. */
export function everyRunPlan({ setOutPath, archLineZ = -18, glide = 3 }) {
  const prof = hermite(pathLength(setOutPath), glide, 0);
  return { path: setOutPath, prof, crossAt: crossTime(setOutPath, prof, archLineZ) ?? glide, total: glide };
}
