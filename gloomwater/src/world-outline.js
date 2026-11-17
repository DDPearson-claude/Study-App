// world-outline.js — the outline shore (docs/loop/LAKE2.md §3.1; lane W1): a natural basin's engine. Pure: no three.js, no state.
// A water whose arena has `layout: 'outline'` (Sporewood Pools under the loop) draws its shore from an authored closed curve, its
// islands from curves of their own and its banks from a height profile authored at the curve's control points; world-layout builds
// one signed-distance grid from them (1 m cells, positive in the water) and every reader that once asked the polar shore its radius
// asks this field instead (world-layout.shoreDist, the one seam). The Mossmere keeps its polar shore: nothing here runs for it.
//
//   curveOf(pts, step)               a closed centripetal Catmull-Rom curve through `pts`, sampled about every `step` m:
//                                    {x, z, u (control index + fraction), n}
//   buildOutline(A, opts)            the arena's outline record: {curves, segs, grid, shore, islands, len, area, bbox}
//   sdfAt(O, x, z)                   the signed distance (m) to the nearest bank, + in the water (bilinear on the grid)
//   sdfGrad(O, x, z, out)            its unit slope ({x, z}, toward the water), written into `out`
//   nearestAt(O, x, z, out)          the nearest bank's feature: {curve, u, x, z} (the grid's feature, projected exactly)
//   bankAt(O, x, z, out)             the bank's profile there: {h (its top, m above the water), shelf (m), w (its face, m), island}
//   groundAt(O, x, z)                the ground's height (m; below 0 in the water, the bed beside the bank)
//   shoreAt(O, s, out)               the shore curve at arc length s (m, wrapping): {x, z, nx, nz (outward, into the land), h, shelf}
//   arcAt(O, u) · alongAt(O, x, z)   a control parameter's arc length (m) · the nearest shore point's control parameter (−1: an island's)
//   polarShore(O, cx, cz, n)         the farthest water along each of n bearings from (cx, cz) (the polar readers' fallback)

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

/** A closed centripetal Catmull-Rom curve (alpha 0.5: no cusp, no self-loop at the control points) through `pts` ([[x, z], …]),
 *  sampled about every `step` m along each span. → {x, z, u, n}: u is the span's control index plus its fraction (0 … n). */
export function curveOf(pts, step = 1) {
  const P = pts.map((p) => [Number(p[0]), Number(p[1])]), n = P.length;
  const X = [], Z = [], U = [];
  const knot = (a, b) => Math.max(1e-4, Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1])));
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    const t1 = knot(p0, p1), t2 = t1 + knot(p1, p2), t3 = t2 + knot(p2, p3);
    const k = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let j = 0; j < k; j++) {
      const t = t1 + ((t2 - t1) * j) / k;
      const l = (a, b, ta, tb, c) => a[c] * ((tb - t) / (tb - ta)) + b[c] * ((t - ta) / (tb - ta));
      const A1 = [l(p0, p1, 0, t1, 0), l(p0, p1, 0, t1, 1)], A2 = [l(p1, p2, t1, t2, 0), l(p1, p2, t1, t2, 1)], A3 = [l(p2, p3, t2, t3, 0), l(p2, p3, t2, t3, 1)];
      const B1 = [l(A1, A2, 0, t2, 0), l(A1, A2, 0, t2, 1)], B2 = [l(A2, A3, t1, t3, 0), l(A2, A3, t1, t3, 1)];
      X.push(l(B1, B2, t1, t2, 0)); Z.push(l(B1, B2, t1, t2, 1)); U.push(i + j / k);
    }
  }
  return { x: Float64Array.from(X), z: Float64Array.from(Z), u: Float64Array.from(U), n: X.length, nc: n };
}

/** The signed area of a sampled closed curve (+: counter-clockwise in x right, z down the screen as the camera sees it from the south). */
const areaOf = (C) => { let a = 0; for (let i = 0; i < C.n; i++) { const j = (i + 1) % C.n; a += C.x[i] * C.z[j] - C.x[j] * C.z[i]; } return a / 2; };

/**
 * The arena's outline record (A: the arena: `outline` [[x, z], …], `banks` [[h, shelf], …] one per control point, `islands`
 * [{x, z, outline, h, shelf, name, kind}], `cell` the grid's cell in m (1), `margin` m round the curve (28)). → {curves, segs, grid,
 * shore, islands, len, area, bbox}. Built once per layout (about 34k cells over Sporewood's basin).
 */
export function buildOutline(A, { step = 1, cell = Number(A?.cell) || 1, margin = Number(A?.margin) || 28 } = {}) {
  const ctrl = Array.isArray(A?.outline) ? A.outline : [];
  if (ctrl.length < 3) return null;
  const banks = Array.isArray(A.banks) ? A.banks : [];
  // the shore's samples and its profile (each control point's [h, shelf], eased between them along the curve)
  const shoreC = curveOf(ctrl, step), nc = ctrl.length;
  const prof = (i) => { const b = banks[((i % nc) + nc) % nc]; return Array.isArray(b) ? [Number(b[0]) || 1, Number(b[1]) || 4] : [1, 4]; };
  shoreC.h = new Float64Array(shoreC.n); shoreC.shelf = new Float64Array(shoreC.n);
  for (let k = 0; k < shoreC.n; k++) {
    const i = Math.floor(shoreC.u[k]), f = sstep(0, 1, shoreC.u[k] - i), a = prof(i), b = prof(i + 1);
    shoreC.h[k] = a[0] + (b[0] - a[0]) * f; shoreC.shelf[k] = a[1] + (b[1] - a[1]) * f;
  }
  shoreC.kind = 'shore';
  const curves = [shoreC];
  const islands = [];
  for (const o of Array.isArray(A.islands) ? A.islands : []) {
    if (!Array.isArray(o?.outline) || o.outline.length < 3) continue;
    const C = curveOf(o.outline, Math.min(step, 0.75));
    C.kind = 'island'; C.island = islands.length; C.hTop = Number(o.h) || 1; C.shelfW = Number(o.shelf) || 3;
    curves.push(C);
    islands.push({ name: o.name || null, kind: o.kind || null, x: Number(o.x), z: Number(o.z), h: C.hTop, shelf: C.shelfW, curve: curves.length - 1 });
  }
  // every curve's segments in one table (a, b and the curve and the sample they start from)
  let ns = 0; for (const C of curves) ns += C.n;
  const S = { ax: new Float64Array(ns), az: new Float64Array(ns), bx: new Float64Array(ns), bz: new Float64Array(ns), curve: new Int32Array(ns), k: new Int32Array(ns), n: ns };
  { let q = 0; curves.forEach((C, ci) => { for (let k = 0; k < C.n; k++, q++) { const j = (k + 1) % C.n; S.ax[q] = C.x[k]; S.az[q] = C.z[k]; S.bx[q] = C.x[j]; S.bz[q] = C.z[j]; S.curve[q] = ci; S.k[q] = k; } }); }
  // the arc length along the shore (its samples), for shoreAt and the reed runs
  shoreC.s = new Float64Array(shoreC.n + 1);
  for (let k = 0; k < shoreC.n; k++) { const j = (k + 1) % shoreC.n; shoreC.s[k + 1] = shoreC.s[k] + Math.hypot(shoreC.x[j] - shoreC.x[k], shoreC.z[j] - shoreC.z[k]); }
  const len = shoreC.s[shoreC.n], orient = Math.sign(areaOf(shoreC)) || 1;
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (let k = 0; k < shoreC.n; k++) { x0 = Math.min(x0, shoreC.x[k]); x1 = Math.max(x1, shoreC.x[k]); z0 = Math.min(z0, shoreC.z[k]); z1 = Math.max(z1, shoreC.z[k]); }
  const bbox = { x0, x1, z0, z1 };
  // ---- the grid: nodes every `cell` m over the curve's box and the margin
  const gx0 = Math.floor(x0 - margin), gz0 = Math.floor(z0 - margin);
  const nx = Math.ceil((x1 + margin - gx0) / cell) + 1, nz = Math.ceil((z1 + margin - gz0) / cell) + 1, N = nx * nz;
  const D = new Float32Array(N).fill(Infinity), F = new Int32Array(N).fill(-1), IN = new Uint8Array(N);
  // (1) inside: an even-odd scan of every curve on each row of nodes (water: inside the shore, outside every island)
  const xs = [];
  for (let j = 0; j < nz; j++) {
    const zz = gz0 + j * cell;
    xs.length = 0;
    for (let q = 0; q < ns; q++) {
      const az = S.az[q], bz = S.bz[q];
      if ((az <= zz) === (bz <= zz)) continue;
      xs.push(S.ax[q] + ((zz - az) / (bz - az)) * (S.bx[q] - S.ax[q]));
    }
    xs.sort((a, b) => a - b);
    for (let p = 0; p + 1 < xs.length; p += 2) {
      const i0 = Math.max(0, Math.ceil((xs[p] - gx0) / cell)), i1 = Math.min(nx - 1, Math.floor((xs[p + 1] - gx0) / cell));
      for (let i = i0; i <= i1; i++) IN[j * nx + i] = 1;
    }
  }
  // (2) the exact distance near each segment (its box, 3 cells round)
  const VX = new Float64Array(ns), VZ = new Float64Array(ns), IL = new Float64Array(ns);
  for (let q = 0; q < ns; q++) { VX[q] = S.bx[q] - S.ax[q]; VZ[q] = S.bz[q] - S.az[q]; const l2 = VX[q] * VX[q] + VZ[q] * VZ[q]; IL[q] = l2 > 0 ? 1 / l2 : 0; }
  const segD = (q, px, pz) => {
    const dx = px - S.ax[q], dz = pz - S.az[q];
    let t = (dx * VX[q] + dz * VZ[q]) * IL[q];
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const ex = dx - VX[q] * t, ez = dz - VZ[q] * t;
    return Math.sqrt(ex * ex + ez * ez);
  };
  const B = 3;
  for (let q = 0; q < ns; q++) {
    const i0 = Math.max(0, Math.floor((Math.min(S.ax[q], S.bx[q]) - gx0) / cell) - B), i1 = Math.min(nx - 1, Math.ceil((Math.max(S.ax[q], S.bx[q]) - gx0) / cell) + B);
    const j0 = Math.max(0, Math.floor((Math.min(S.az[q], S.bz[q]) - gz0) / cell) - B), j1 = Math.min(nz - 1, Math.ceil((Math.max(S.az[q], S.bz[q]) - gz0) / cell) + B);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const c = j * nx + i, d = segD(q, gx0 + i * cell, gz0 + j * cell);
      if (d < D[c]) { D[c] = d; F[c] = q; }
    }
  }
  // (3) the rest by passing each node's nearest segment on to its neighbours, both ways twice (the distance stays exact to the
  // segment found; the feature transform's small error is where two banks are nearly equidistant, far from any shore)
  const relax = (c, cn, px, pz) => { const f = F[cn]; if (f < 0 || f === F[c]) return; const d = segD(f, px, pz); if (d < D[c]) { D[c] = d; F[c] = f; } };
  for (let pass = 0; pass < 2; pass++) {
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const c = j * nx + i, px = gx0 + i * cell, pz = gz0 + j * cell;
      if (i > 0) relax(c, c - 1, px, pz);
      if (j > 0) { relax(c, c - nx, px, pz); if (i > 0) relax(c, c - nx - 1, px, pz); if (i < nx - 1) relax(c, c - nx + 1, px, pz); }
    }
    for (let j = nz - 1; j >= 0; j--) for (let i = nx - 1; i >= 0; i--) {
      const c = j * nx + i, px = gx0 + i * cell, pz = gz0 + j * cell;
      if (i < nx - 1) relax(c, c + 1, px, pz);
      if (j < nz - 1) { relax(c, c + nx, px, pz); if (i < nx - 1) relax(c, c + nx + 1, px, pz); if (i > 0) relax(c, c + nx - 1, px, pz); }
    }
  }
  for (let c = 0; c < N; c++) if (!IN[c]) D[c] = -D[c];
  // (4) the bank's profile at every node (its nearest bank's top and shelf, and whether that bank is an island's), softened by a few
  // metres, so the ground behind two banks of different heights and the shallows between two shelves meet without a seam
  const HB = new Float32Array(N), SB = new Float32Array(N), IB = new Float32Array(N);
  for (let c = 0; c < N; c++) {
    const q = Math.max(0, F[c]), C = curves[S.curve[q]];
    if (C.kind === 'island') { HB[c] = C.hTop; SB[c] = C.shelfW; IB[c] = 1; } else { HB[c] = C.h[S.k[q]]; SB[c] = C.shelf[S.k[q]]; }
  }
  for (const A2 of [HB, SB, IB]) blur(A2, nx, nz, 3, 2);
  const grid = { x0: gx0, z0: gz0, nx, nz, cell, d: D, f: F, hb: HB, sh: SB, isl: IB };
  return { curves, segs: S, grid, shore: shoreC, islands, len, orient, area: Math.abs(areaOf(shoreC)), bbox };
}

/** A box blur of a grid in place (radius r nodes, `passes` times each way: about a Gaussian), its edges held. */
function blur(A, nx, nz, r, passes) {
  const tmp = new Float32Array(Math.max(nx, nz));
  for (let p = 0; p < passes; p++) {
    for (let j = 0; j < nz; j++) {
      const o = j * nx;
      for (let i = 0; i < nx; i++) tmp[i] = A[o + i];
      let sum = 0; for (let k = -r; k <= r; k++) sum += tmp[clamp(k, 0, nx - 1)];
      for (let i = 0; i < nx; i++) { A[o + i] = sum / (2 * r + 1); sum += tmp[Math.min(nx - 1, i + r + 1)] - tmp[Math.max(0, i - r)]; }
    }
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < nz; j++) tmp[j] = A[j * nx + i];
      let sum = 0; for (let k = -r; k <= r; k++) sum += tmp[clamp(k, 0, nz - 1)];
      for (let j = 0; j < nz; j++) { A[j * nx + i] = sum / (2 * r + 1); sum += tmp[Math.min(nz - 1, j + r + 1)] - tmp[Math.max(0, j - r)]; }
    }
  }
}
/** Bilinear on one of the grid's node fields (clamped to the grid). */
function fieldAt(G, A, x, z) {
  const c = G.cell, fx = clamp((x - G.x0) / c, 0, G.nx - 1), fz = clamp((z - G.z0) / c, 0, G.nz - 1);
  const i = Math.min(G.nx - 2, Math.floor(fx)), j = Math.min(G.nz - 2, Math.floor(fz)), u = fx - i, v = fz - j, k = j * G.nx + i;
  return (A[k] * (1 - u) + A[k + 1] * u) * (1 - v) + (A[k + G.nx] * (1 - u) + A[k + G.nx + 1] * u) * v;
}
/** The signed distance (m) to the nearest bank at (x, z): + in the water, − on the land (the islands land too). Bilinear on the grid;
 *  past its edge, the edge's value less the way out. */
export function sdfAt(O, x, z) {
  const G = O.grid, c = G.cell;
  let fx = (x - G.x0) / c, fz = (z - G.z0) / c, out = 0;
  const mx = G.nx - 1, mz = G.nz - 1;
  if (fx < 0 || fz < 0 || fx > mx || fz > mz) {
    const cx = clamp(fx, 0, mx), cz = clamp(fz, 0, mz);
    out = Math.hypot(fx - cx, fz - cz) * c; fx = cx; fz = cz;
  }
  const i = Math.min(mx - 1, Math.floor(fx)), j = Math.min(mz - 1, Math.floor(fz)), u = fx - i, v = fz - j, k = j * G.nx + i, D = G.d;
  const d = (D[k] * (1 - u) + D[k + 1] * u) * (1 - v) + (D[k + G.nx] * (1 - u) + D[k + G.nx + 1] * u) * v;
  return d - out;
}
/** The field's unit slope at (x, z), toward the water (central differences, 0.5 m), into `out` ({x, z}). */
export function sdfGrad(O, x, z, out = { x: 0, z: 0 }) {
  const h = 0.5, gx = sdfAt(O, x + h, z) - sdfAt(O, x - h, z), gz = sdfAt(O, x, z + h) - sdfAt(O, x, z - h), l = Math.hypot(gx, gz);
  if (l > 1e-9) { out.x = gx / l; out.z = gz / l; } else { out.x = 0; out.z = 0; }
  return out;
}
const NEAR = { curve: 0, u: 0, k: 0, t: 0, x: 0, z: 0 };
/** The nearest bank's feature at (x, z): the grid node's nearest segment, projected exactly. → {curve, k, t, u, x, z} (a shared
 *  scratch by default: read it before the next call). */
export function nearestAt(O, x, z, out = NEAR) {
  const G = O.grid, S = O.segs;
  const i = clamp(Math.round((x - G.x0) / G.cell), 0, G.nx - 1), j = clamp(Math.round((z - G.z0) / G.cell), 0, G.nz - 1);
  let q = G.f[j * G.nx + i];
  if (q < 0) q = 0;
  // (the node's segment and its neighbours along the same curve: the projection settles on the nearest of the three)
  const C = O.curves[S.curve[q]], base = q - S.k[q];
  let best = Infinity, bk = S.k[q], bt = 0;
  for (let dk = -2; dk <= 2; dk++) {
    const k = (((S.k[q] + dk) % C.n) + C.n) % C.n, qq = base + k;
    const vx = S.bx[qq] - S.ax[qq], vz = S.bz[qq] - S.az[qq], l2 = vx * vx + vz * vz;
    const t = l2 > 0 ? clamp(((x - S.ax[qq]) * vx + (z - S.az[qq]) * vz) / l2, 0, 1) : 0;
    const d = Math.hypot(x - S.ax[qq] - vx * t, z - S.az[qq] - vz * t);
    if (d < best) { best = d; bk = k; bt = t; }
  }
  const qq = base + bk;
  out.curve = S.curve[q]; out.k = bk; out.t = bt;
  out.u = C.u[bk] + ((bk + 1 < C.n ? C.u[bk + 1] : C.nc) - C.u[bk]) * bt;
  out.x = S.ax[qq] + (S.bx[qq] - S.ax[qq]) * bt; out.z = S.az[qq] + (S.bz[qq] - S.az[qq]) * bt;
  return out;
}
const BANK = { h: 0, shelf: 0, w: 0, isl: 0 };
/** The bank's profile by its nearest bank, softened: {h (its top, m above the water), shelf (the shallows' width off it, m), w (its
 *  face's width, m: the steeper the higher), isl (1 where that bank is an island's, 0 the shore's)} (a shared scratch by default). */
export function bankAt(O, x, z, out = BANK) {
  const G = O.grid;
  out.h = fieldAt(G, G.hb, x, z); out.shelf = fieldAt(G, G.sh, x, z); out.isl = fieldAt(G, G.isl, x, z);
  out.w = 1.2 + 0.7 * out.h;
  return out;
}
// a low, smooth, deterministic noise in [-1, 1] (the ground's roll behind the banks: no seed needed, the curve is authored)
const roll = (x, z) => 0.55 * Math.sin(x * 0.083 + 1.7) * Math.cos(z * 0.097 + 0.4) + 0.3 * Math.sin((x - z) * 0.051 + 2.9) + 0.15 * Math.cos(x * 0.21 - z * 0.17);
/** The ground's height (m) at (x, z): in the water the bed falls away from the bank (0 at the waterline, to −2.5 m); on land the bank's
 *  face rises to its top (steep at the water, easing over) and the ground behind it rises slowly on toward the rim; an island is its own
 *  low mound. Continuous across the waterline, so a mesh of it meets the water on the shore. */
export function groundAt(O, x, z) {
  const s = sdfAt(O, x, z);
  if (s >= 0) return -Math.min(2.5, s * 0.6);
  const d = -s, B = bankAt(O, x, z), t = Math.min(1, d / B.w), face = B.h * (1 - (1 - t) * (1 - t));
  const back = Math.max(0, d - B.w), rim = Math.max(0, d - 30);
  const shore = face + back * (0.1 + 0.03 * B.h) + rim * 0.16 + roll(x, z) * Math.min(1.4, back * 0.12);
  if (!(B.isl > 0)) return shore;
  const isle = face + 0.25 * roll(x * 2, z * 2) * Math.min(1, d / 2) * Math.min(1, B.h);
  return shore + (isle - shore) * B.isl;
}
/** The shore curve at arc length s (m; wrapping round the shore): {x, z, nx, nz (outward: into the land), h, shelf} into `out`. */
export function shoreAt(O, s, out = { x: 0, z: 0, nx: 0, nz: 0, h: 0, shelf: 0 }) {
  const C = O.shore, L = O.len, ss = ((s % L) + L) % L;
  let lo = 0, hi = C.n - 1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (C.s[m] <= ss) lo = m; else hi = m - 1; }
  const k = lo, k1 = (k + 1) % C.n, seg = C.s[k + 1] - C.s[k], t = seg > 0 ? (ss - C.s[k]) / seg : 0;
  const tx = C.x[k1] - C.x[k], tz = C.z[k1] - C.z[k], tl = Math.hypot(tx, tz) || 1;
  out.x = C.x[k] + tx * t; out.z = C.z[k] + tz * t;
  // (the water lies on the curve's inside: its left for a clockwise curve on this screen, its right for a counter-clockwise one)
  out.nx = (O.orient > 0 ? tz : -tz) / tl; out.nz = (O.orient > 0 ? -tx : tx) / tl;
  if (sdfAt(O, out.x + out.nx, out.z + out.nz) > sdfAt(O, out.x - out.nx, out.z - out.nz)) { out.nx = -out.nx; out.nz = -out.nz; }
  out.h = C.h[k] + (C.h[k1] - C.h[k]) * t; out.shelf = C.shelf[k] + (C.shelf[k1] - C.shelf[k]) * t;
  return out;
}
/** The arc length (m) along the shore at a control parameter u (a control point's index plus its fraction toward the next). */
export function arcAt(O, u) {
  const C = O.shore, nc = C.nc, uu = ((u % nc) + nc) % nc;
  let lo = 0, hi = C.n - 1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (C.u[m] <= uu) lo = m; else hi = m - 1; }
  const u1 = lo + 1 < C.n ? C.u[lo + 1] : nc, t = u1 > C.u[lo] ? (uu - C.u[lo]) / (u1 - C.u[lo]) : 0;
  return C.s[lo] + (C.s[lo + 1] - C.s[lo]) * t;
}
/** The control parameter u (0 … the control points' count) of the nearest point on the shore itself at (x, z), or −1 where an island's
 *  bank is nearer (the reed runs and the areas' shore runs are authored in u). */
export function alongAt(O, x, z) {
  const f = nearestAt(O, x, z);
  return O.curves[f.curve].kind === 'shore' ? f.u : -1;
}
/** The farthest water along each of `n` bearings from (cx, cz) (m; a table): the polar readers' fallback on an outline shore, never
 *  its collision or its water (those read sdfAt). */
export function polarShore(O, cx = 0, cz = 0, n = 360) {
  const r = new Float32Array(n), B = O.bbox, far = Math.max(Math.hypot(B.x0 - cx, B.z0 - cz), Math.hypot(B.x1 - cx, B.z0 - cz), Math.hypot(B.x0 - cx, B.z1 - cz), Math.hypot(B.x1 - cx, B.z1 - cz)) + 1;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
    let best = 0;
    for (let q = 0; q <= far; q += 0.5) if (sdfAt(O, cx + ca * q, cz + sa * q) > 0) best = q;
    r[i] = best;
  }
  return r;
}
