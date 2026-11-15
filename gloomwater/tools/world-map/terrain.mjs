// The Evenland's terrain, baked from canon.mjs: a fractal coastline round WORLD.md's outline, a
// heightfield (blended region heights, the ranges, the Great Step, noise, stream incision), the
// named rivers burned in along their WORLD.md courses, lakes, an ice field, and a drainage network
// computed on the result (priority-flood filling, lowest-neighbour flow, rain-weighted accumulation).
// Everything is seeded; the same inputs give the same world.
import { SHEET, SEED, OUTLINE, ISLANDS, INLETS, LAGOON, KEEP_LAND, KEEP_SEA, ROUGH, LAKES, TARNS, RIVERS, CANALS, HEIGHTS, RANGES, ICE, STEP, WATERS } from './canon.mjs';
import { clamp, lerp, smoothstep, mulberry32, makeNoise, spline, resample, arcLengths, nearestOnPolyline, edt, fillPolygonMask, boxBlur, pointInPolygon } from './lib/util.mjs';

export const GS = 2; // grid cells per chart unit

// Rain, 0..1 (WORLD.md §3): westerlies wet the Spine's west face, the trades wet the south lobe's
// east side and reach through the Low Gap; the Terrace, the Fold and the Pale Flats are dry.
const RAIN = [
  [150, 250, 0.95], [200, 300, 1], [180, 400, 1], [240, 430, 1], [170, 500, 0.95], [230, 540, 0.9], [180, 600, 0.55], [230, 620, 0.8],
  [170, 650, 0.2], [260, 330, 1], [240, 230, 0.9], [300, 230, 1], [200, 200, 0.9],
  [345, 300, 0.5], [400, 300, 0.42], [500, 300, 0.4], [600, 260, 0.42], [600, 400, 0.38], [450, 420, 0.36], [340, 440, 0.32],
  [332, 520, 0.24], [400, 540, 0.13], [460, 580, 0.14], [296, 592, 0.8, 12], [345, 572, 0.3], [560, 560, 0.3], [700, 300, 0.48],
  [800, 300, 0.55], [750, 450, 0.5], [820, 480, 0.55], [700, 560, 0.42], [780, 580, 0.5], [500, 200, 0.45], [700, 190, 0.5],
  [840, 170, 0.5], [420, 640, 0.14],
  [160, 700, 0.04], [200, 660, 0.08], [300, 700, 0.11], [400, 690, 0.11], [500, 680, 0.14], [600, 680, 0.24], [660, 730, 0.42],
  [640, 640, 0.24], [760, 770, 0.8], [240, 690, 0.3],
  [860, 900, 1], [800, 850, 1], [700, 900, 1], [600, 900, 1], [560, 850, 0.95], [640, 800, 0.9], [700, 780, 0.86], [800, 800, 0.95],
  [535, 790, 0.8], [505, 790, 0.6], [470, 780, 0.4], [430, 790, 0.16], [360, 790, 0.09], [300, 780, 0.07], [220, 780, 0.06],
  [200, 860, 0.06], [300, 880, 0.08], [400, 900, 0.07], [450, 940, 0.14], [480, 960, 0.36], [500, 1000, 0.62], [420, 1000, 0.24],
  [340, 1000, 0.2], [280, 960, 0.1], [220, 960, 0.12], [228, 1010, 0.5], [262, 1040, 0.78], [300, 1070, 0.92], [350, 1090, 0.92],
  [450, 1100, 0.95], [600, 1100, 1], [760, 1080, 1], [900, 1080, 1], [800, 1150, 0.9], [650, 1180, 0.85], [500, 1180, 0.85],
  [400, 1200, 0.8], [320, 1180, 0.76], [250, 1120, 0.72], [300, 1250, 0.7], [470, 1280, 0.62], [600, 1260, 0.46], [615, 1320, 0.36],
  [720, 1230, 0.66], [880, 1000, 1],
];
// The greening ramp as a field: each water's lushness step, plus the country no sheet shows.
const LUSH_EXTRA = [[740, 430, 3.5], [830, 170, 2.2], [700, 200, 1.5], [780, 860, 14], [620, 1290, 12], [420, 1220, 13], [505, 790, 10.5],
  [450, 690, 7.5], [700, 770, 12.5], [560, 1200, 13.5], [850, 1150, 14], [300, 1230, 12.5], [170, 250, 4.5], [180, 520, 6.2],
  [560, 420, 2], [640, 330, 0.8], [400, 780, 9.5], [380, 940, 10.5], [520, 1000, 14], [600, 1100, 13.2], [450, 1100, 12.8]];

export function buildTerrain(log = () => {}) {
  const { W: CW, H: CH, PAD } = SHEET;
  const x0 = -PAD, y0 = -PAD, UW = CW + 2 * PAD, UH = CH + 2 * PAD;
  const W = UW * GS, H = UH * GS, N = W * H;
  const cx = (i) => x0 + (i + 0.5) / GS, cy = (j) => y0 + (j + 0.5) / GS;
  const gi = (x) => (x - x0) * GS - 0.5, gj = (y) => (y - y0) * GS - 0.5;
  const nzC = makeNoise(SEED + 1), nzE = makeNoise(SEED + 2), nzM = makeNoise(SEED + 3), nzL = makeNoise(SEED + 4);
  const rnd = mulberry32(SEED + 5);
  const t0 = Date.now();
  const lap = (s) => log(`  [${((Date.now() - t0) / 1000).toFixed(1)}s] ${s}`);

  // bilinear sample of a grid field at chart coordinates
  const sample = (f, x, y) => {
    const fx = clamp(gi(x), 0, W - 1.001), fy = clamp(gj(y), 0, H - 1.001);
    const i = Math.floor(fx), j = Math.floor(fy), tx = fx - i, ty = fy - j, o = j * W + i;
    return (f[o] * (1 - tx) + f[o + 1] * tx) * (1 - ty) + (f[o + W] * (1 - tx) + f[o + W + 1] * tx) * ty;
  };
  // visit the cells within R units of each point of a dense polyline
  const splat = (pts, R, fn) => {
    for (let k = 0; k < pts.length; k++) {
      const p = pts[k], r = typeof R === 'function' ? R(p, k) : R;
      const i0 = Math.max(0, Math.ceil(gi(p[0] - r))), i1 = Math.min(W - 1, Math.floor(gi(p[0] + r)));
      const j0 = Math.max(0, Math.ceil(gj(p[1] - r))), j1 = Math.min(H - 1, Math.floor(gj(p[1] + r)));
      const r2 = r * r;
      for (let j = j0; j <= j1; j++) {
        const dy = cy(j) - p[1];
        for (let i = i0; i <= i1; i++) {
          const dx = cx(i) - p[0], d2 = dx * dx + dy * dy;
          if (d2 <= r2) fn(j * W + i, Math.sqrt(d2), p, k);
        }
      }
    }
  };
  const ellipseSd = (b, x, y) => {
    const a = ((b[4] || 0) * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    const dx = x - b[0], dy = y - b[1], u = dx * c + dy * s, v = -dx * s + dy * c;
    return (1 - Math.sqrt((u * u) / (b[2] * b[2]) + (v * v) / (b[3] * b[3]))) * Math.min(b[2], b[3]);
  };
  const forBlob = (b, pad, fn) => {
    const r = Math.max(b[2], b[3]) + pad;
    const i0 = Math.max(0, Math.ceil(gi(b[0] - r))), i1 = Math.min(W - 1, Math.floor(gi(b[0] + r)));
    const j0 = Math.max(0, Math.ceil(gj(b[1] - r))), j1 = Math.min(H - 1, Math.floor(gj(b[1] + r)));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) fn(j * W + i, cx(i), cy(j));
  };
  // inverse-distance blend of [x, y, value, radius?] points, sampled bilinearly from a coarse grid
  const shepard = (points, power = 3, defR = 22) => {
    const LR = 4, lw = Math.ceil(UW / LR) + 2, lh = Math.ceil(UH / LR) + 2, f = new Float32Array(lw * lh);
    for (let j = 0; j < lh; j++) for (let i = 0; i < lw; i++) {
      const x = x0 + i * LR, y = y0 + j * LR;
      let sw = 0, sv = 0;
      for (const p of points) {
        const r = p[3] || defR, d2 = (x - p[0]) * (x - p[0]) + (y - p[1]) * (y - p[1]);
        const w = 1 / Math.pow(d2 + r * r, power / 2);
        sw += w; sv += w * p[2];
      }
      f[j * lw + i] = sv / sw;
    }
    return (x, y) => {
      const fx = clamp((x - x0) / LR, 0, lw - 1.001), fy = clamp((y - y0) / LR, 0, lh - 1.001);
      const i = Math.floor(fx), j = Math.floor(fy), tx = fx - i, ty = fy - j, o = j * lw + i;
      return (f[o] * (1 - tx) + f[o + 1] * tx) * (1 - ty) + (f[o + lw] * (1 - tx) + f[o + lw + 1] * tx) * ty;
    };
  };

  // ------------------------------------------------------------------ 1. the coast
  const outline = spline(OUTLINE, 1.2, true);
  const polyMask = fillPolygonMask(outline, W, H, (x, y) => [(x - x0) * GS, (y - y0) * GS]);
  const inv = new Uint8Array(N);
  for (let k = 0; k < N; k++) inv[k] = polyMask[k] ? 0 : 1;
  const dIn = edt(inv, W, H), dOut = edt(polyMask, W, H);
  const sdBase = new Float32Array(N);
  for (let k = 0; k < N; k++) sdBase[k] = (polyMask[k] ? dIn[k] - 0.5 : -(dOut[k] - 0.5)) / GS;
  for (const isl of ISLANDS) {
    const b = [isl.at[0], isl.at[1], isl.rx, isl.ry, isl.rot];
    forBlob(b, 14, (k, x, y) => { const s = ellipseSd(b, x, y); if (s > sdBase[k]) sdBase[k] = s; });
  }
  lap('outline distance field');
  const inletF = new Float32Array(N).fill(1e6); // < 0 inside a cut inlet
  const inletLines = {};
  const cutInlet = (pts) => { const dense = resample(spline(pts, 0.6), 0.3); splat(dense, (p) => p[2] + 9, (k, d, p) => { const v = d - p[2]; if (v < inletF[k]) inletF[k] = v; }); return dense; };
  for (const inl of INLETS) inletLines[inl.id] = cutInlet(inl.pts);
  // drowned valleys of the fjord coast: seeded, winding, tapering, some with a side arm
  {
    const rf = mulberry32(SEED + 6);
    const tooNear = (x, y) => nearestOnPolyline(inletLines.rimeSound, x, y).d < 13 || (x > 212 && y > 196 && y < 314) || (Math.abs(y - 471) < 7 && x < 205) || x > 262;
    for (let y = 212; y < 552; y += 8 + rf() * 13) {
      let xc = -1; const j = Math.round(gj(y));
      for (let i = Math.round(gi(60)); i < Math.round(gi(260)); i++) if (sdBase[j * W + i] > 0) { xc = cx(i); break; }
      if (xc < 0 || Math.abs(y - 336) < 12) { rf(); rf(); rf(); continue; }
      const fade = 1 - smoothstep(470, 552, y);
      const len = (9 + rf() * rf() * 66) * (0.3 + 0.7 * fade), w = (1.7 + rf() * 2.5) * (0.6 + 0.4 * fade);
      let th = (rf() - 0.5) * 0.9, x = xc - 7, yy = y, run = 0;
      const pts = [[x, yy, w + 1.4]];
      while (run < len) {
        th = clamp(th + (rf() - 0.5) * 0.8, -1.15, 1.15);
        x += Math.cos(th) * 4; yy += Math.sin(th) * 4; run += 4;
        if (x > xc && tooNear(x, yy)) break;
        pts.push([x, yy, Math.max(0.45, w * (1 - (0.8 * run) / len))]);
      }
      if (pts.length < 3) continue;
      cutInlet(pts);
      if (rf() < 0.5 && pts.length > 5) {
        const b = pts[2 + Math.floor(rf() * (pts.length - 4))];
        let bth = th + (rf() < 0.5 ? -1 : 1) * (0.7 + rf() * 0.6), bx = b[0], by = b[1];
        const arm = [[bx, by, b[2] * 0.8]], bl = 6 + rf() * 18;
        for (let t = 0; t < bl; t += 3.5) { bth += (rf() - 0.5) * 0.6; bx += Math.cos(bth) * 3.5; by += Math.sin(bth) * 3.5; if (tooNear(bx, by)) break; arm.push([bx, by, Math.max(0.4, b[2] * 0.7 * (1 - t / bl))]); }
        if (arm.length > 2) cutInlet(arm);
      }
    }
    // skerries off the fjord coast, stacks off the Cold Coast, mud isles off the mangrove coasts
    const islet = (x, y, s) => { const b = [x, y, s * (1 + rf() * 1.3), s, rf() * 180]; forBlob(b, 6, (k, px, py) => { const v = ellipseSd(b, px, py); if (v > sdBase[k]) sdBase[k] = v; }); };
    for (let n = 0; n < 420; n++) {
      const x = 80 + rf() * 150, y = 200 + rf() * 350, s = 0.45 + rf() * rf() * 2.2, k = Math.round(gj(y)) * W + Math.round(gi(x));
      if (sdBase[k] > -2.4 || sdBase[k] < -17 || inletF[k] < 3 || nearestOnPolyline(inletLines.rimeSound, x, y).d < 10) continue;
      islet(x, y, s);
    }
    for (let n = 0; n < 900; n++) {
      const x = 100 + rf() * 880, y = 100 + rf() * 1260, s = 0.4 + rf() * rf() * 1.7, k = Math.round(gj(y)) * W + Math.round(gi(x));
      if (sdBase[k] > -2.6 || sdBase[k] < -11 || inletF[k] < 4) continue;
      const keep = (y < 200 ? 0.2 : 0) + (y > 780 && x > 400 ? 0.16 : 0) + (y > 1100 ? 0.1 : 0) + (x > 640 && y > 560 && y < 780 ? 0.12 : 0);
      if (rf() < keep && Math.hypot(x - 600, y - 180) > 30 && Math.hypot(x - 110, y - 440) > 26) islet(x, y, s);
    }
  }
  for (const way of KEEP_SEA) splat(resample(spline(way.pts, 2), 0.5), way.hw + 9, (k, d) => { const v = d - way.hw; if (v < inletF[k]) inletF[k] = v; });
  for (const lagB of LAGOON.blobs) forBlob(lagB, 9, (k, x, y) => { const v = -ellipseSd(lagB, x, y); if (v < inletF[k]) inletF[k] = v; });
  const keepF = new Float32Array(N).fill(-1e6); // > 0 where land is kept
  for (const kl of KEEP_LAND) {
    const dense = resample(kl.pts, 0.3);
    splat(dense, kl.hw + 5, (k, d) => { const v = kl.hw - d; if (v > keepF[k]) keepF[k] = v; });
  }
  const tidal = new Float32Array(N).fill(1e6);
  splat(inletLines.tidalInlet, (p) => p[2] + 4, (k, d, p) => { const v = d - p[2]; if (v < tidal[k]) tidal[k] = v; });

  const anchors = [[600, 186, 30], [540, 192, 26], [570, 194, 26], [630, 192, 26], [662, 190, 26], [690, 184, 22], [146, 335, 18], [188, 792, 42], [150, 766, 20],
    [228, 1006, 38], [848, 985, 46], [858, 134, 16], [648, 700, 20], [612, 1334, 12], [110, 440, 16], [55, 495, 14], [450, 118, 16],
    [947, 638, 12], [215, 1242, 10], [132, 756, 14], [940, 1070, 18], [920, 1041, 12], [930, 1121, 12], [862, 810, 15], [749, 608, 15],
    [741, 169, 15], [164, 471, 12], [165, 665, 15], [946, 1136, 16], [870, 950, 20]];
  const coastNoise = (x, y) => {
    const fj = smoothstep(335, 280, x) * smoothstep(196, 226, y) * smoothstep(545, 500, y);
    const nc = smoothstep(228, 196, y);
    const lc = smoothstep(300, 250, x) * smoothstep(520, 560, y) * smoothstep(772, 746, y);
    const so = smoothstep(760, 805, y);
    let damp = 1;
    for (const a of anchors) { const d2 = (x - a[0]) * (x - a[0]) + (y - a[1]) * (y - a[1]); damp *= 1 - 0.88 * Math.exp(-d2 / (a[2] * a[2])); }
    const wx = x + 7 * nzC.fbm(x / 50 + 13, y / 50, 2), wy = y + 7 * nzC.fbm(x / 50, y / 50 + 13, 2);
    const aB = 42 * (1 - 0.55 * lc - 0.3 * fj), aM = 20 * (1 + 0.2 * fj - 0.5 * lc + 0.15 * so);
    const aS = 8 * (1 + 0.5 * fj + 0.1 * nc - 0.5 * lc + 0.3 * so), aT = 3 * (1 + 0.6 * fj - 0.35 * lc + 0.2 * so), aU = 1.1 * (1 + 0.6 * fj - 0.3 * lc);
    return damp * (aB * nzC.fbm(wx / 150, wy / 150, 3) + aM * nzC.fbm(wx / 56 + 40, wy / 56, 3)) +
      (0.25 + 0.75 * damp) * (aS * nzC.fbm(wx / 21, wy / 21 + 70, 3) + aT * nzC.fbm(x / 7.5 + 9, y / 7.5, 2) + aU * nzC.fbm(x / 2.7, y / 2.7 + 31, 2));
  };
  const sd = new Float32Array(N);
  for (let j = 0; j < H; j++) {
    const y = cy(j);
    for (let i = 0; i < W; i++) {
      const k = j * W + i, b = sdBase[k], inl = inletF[k];
      let v = b;
      if (Math.abs(b) < 90 || inl < 12) {
        const x = cx(i), nz = coastNoise(x, y);
        v = b + nz;
        if (inl < 1e5) v = Math.min(v, inl + 1.5 * nzC.fbm(x / 9 + 3, y / 9, 3) + 0.5 * nzC.fbm(x / 2.6, y / 2.6 + 3, 2));
        if (keepF[k] > -1e5) v = Math.max(v, keepF[k] + 0.6 * nzC.fbm(x / 6, y / 6 + 9, 2));
        if (tidal[k] < 1e5) v = Math.min(v, tidal[k]);
      }
      sd[k] = v;
    }
  }
  lap('coast noise');
  // the sea is whatever non-land the sheet's edge can reach; stray pools become land, specks go
  const sea = new Uint8Array(N);
  {
    const stack = new Int32Array(N); let sp = 0;
    const push = (k) => { if (!sea[k] && sd[k] < 0) { sea[k] = 1; stack[sp++] = k; } };
    for (let i = 0; i < W; i++) { push(i); push((H - 1) * W + i); }
    for (let j = 0; j < H; j++) { push(j * W); push(j * W + W - 1); }
    while (sp) {
      const k = stack[--sp], i = k % W, j = (k / W) | 0;
      if (i > 0) push(k - 1); if (i < W - 1) push(k + 1); if (j > 0) push(k - W); if (j < H - 1) push(k + W);
    }
    for (let k = 0; k < N; k++) if (!sea[k] && sd[k] < 0) sd[k] = 0.25;
    // drop land specks under 6 cells
    const lab = new Int32Array(N); let nl = 0;
    for (let s = 0; s < N; s++) {
      if (sea[s] || lab[s]) continue;
      nl++; sp = 0; stack[sp++] = s; lab[s] = nl; const cells = [s];
      while (sp) {
        const k = stack[--sp], i = k % W, j = (k / W) | 0;
        const tryk = (q) => { if (!sea[q] && !lab[q]) { lab[q] = nl; stack[sp++] = q; if (cells.length < 8) cells.push(q); } };
        if (i > 0) tryk(k - 1); if (i < W - 1) tryk(k + 1); if (j > 0) tryk(k - W); if (j < H - 1) tryk(k + W);
      }
      if (cells.length < 6) for (const k of cells) { sea[k] = 1; sd[k] = -0.25; }
    }
  }
  const land = new Uint8Array(N);
  for (let k = 0; k < N; k++) land[k] = sea[k] ? 0 : 1;
  const dSea = edt(land, W, H), dLand = edt(sea, W, H); // sea cells: units to land; land cells: units to the sea
  for (let k = 0; k < N; k++) { dSea[k] = Math.max(0, dSea[k] - 0.5) / GS; dLand[k] = Math.max(0, dLand[k] - 0.5) / GS; }
  lap('sea and land');

  // ------------------------------------------------------------------ 2. lakes
  const lakeF = new Float32Array(N).fill(-1e6); // > 0 inside a lake
  const lakeId = new Uint8Array(N);
  const lakes = LAKES.map((l) => ({ ...l, kind: l.kind || 'lake' }));
  for (let t = 0; t < TARNS.count; t++) {
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * TARNS.radius;
    const s = 0.9 + rnd() * rnd() * 2.4;
    lakes.push({ id: 'tarn' + t, level: null, kind: 'tarn', blobs: [[TARNS.at[0] + Math.cos(a) * r, TARNS.at[1] + Math.sin(a) * r * 0.8, s * (1 + rnd() * 0.8), s, rnd() * 180]] });
  }
  lakes.forEach((l, li) => {
    for (const b of l.blobs) {
      forBlob(b, 8, (k, x, y) => {
        if (sea[k]) return;
        const wob = l.kind === 'tarn' ? 0.25 : 1;
        const v = ellipseSd(b, x, y) + wob * (0.9 * nzL.fbm(x / 7 + li * 13, y / 7, 3) + 0.35 * nzL.fbm(x / 2.2, y / 2.2 + li * 7, 2));
        if (v > lakeF[k]) { lakeF[k] = v; if (v > 0) lakeId[k] = li + 1; }
      });
    }
  });
  lap('lakes');

  // ------------------------------------------------------------------ 3. rivers and canals as curves
  const pinsOf = (r) => r.pts.map((p) => [p[0], p[1]]);
  const meander = (r, idx) => {
    let dense = resample(spline(r.pts, 0.5), 0.4);
    const s = arcLengths(dense), L = s[s.length - 1];
    const [amp, wl] = r.meander;
    const pinS = pinsOf(r).filter((_, i) => !r.pins || r.pins.includes(i)).map((p) => nearestOnPolyline(dense, p[0], p[1], s).s);
    const pinR = Math.min(5, wl / 4.5);
    const out = dense.map((p, i) => {
      const a = dense[Math.max(0, i - 2)], b = dense[Math.min(dense.length - 1, i + 2)];
      let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      let w = 1;
      for (const ps of pinS) w *= 1 - Math.exp(-((s[i] - ps) * (s[i] - ps)) / (pinR * pinR));
      w *= smoothstep(0, 4, s[i]) * smoothstep(0, 4, L - s[i]);
      // a steep reach runs straighter: tight loops there would only be cut off by the water itself
      const q0 = dense[Math.max(0, i - 12)], q1 = dense[Math.min(dense.length - 1, i + 12)];
      const grad = Math.abs(q0[2] - q1[2]) / Math.max(0.5, s[Math.min(dense.length - 1, i + 12)] - s[Math.max(0, i - 12)]);
      const f1 = 1 / (1 + (grad / 10) * (grad / 10)), f2 = 1 / (1 + (grad / 0.6) * (grad / 0.6));
      const off = amp * w * (1.5 * f1 * nzM.n(s[i] / wl + idx * 7.3, idx * 3.1) + 0.6 * f2 * nzM.n((s[i] / wl) * 2.6, idx * 5.7 + 9) + 0.22 * f2 * nzM.n((s[i] / wl) * 6.1, idx * 1.3 + 4));
      return [p[0] - ty * off, p[1] + tx * off, p[2]];
    });
    // smooth, then make the profile fall all the way
    for (let it = 0; it < 2; it++) for (let i = 1; i < out.length - 1; i++) { out[i][0] = (out[i - 1][0] + 2 * out[i][0] + out[i + 1][0]) / 4; out[i][1] = (out[i - 1][1] + 2 * out[i][1] + out[i + 1][1]) / 4; }
    for (let i = 1; i < out.length; i++) if (out[i][2] > out[i - 1][2] - 1e-4) out[i][2] = out[i - 1][2] - 1e-4;
    return out;
  };
  const rivers = RIVERS.map((r, idx) => ({ id: r.id, name: r.name, cls: r.cls, bank: r.bank, pts: meander(r, idx) }));
  // the fen: the Rush spreads into bright channels where it meets the reservoir's head (WORLD.md §5.11)
  [[336, 843.5], [335.5, 849], [335, 854.5], [336, 860]].forEach((e, i) => {
    rivers.push({ id: 'fen' + i, name: null, cls: 'fen', bank: 1, minor: true,
      pts: resample(spline([[353, 845, 646], [346, 845 + (e[1] - 851) * 0.55, 643], [e[0], e[1], 640.5]], 0.5), 0.4) });
  });
  // a river that ends at the sea is run on to the real shore if the coast's noise moved it away
  for (const r of rivers) {
    const n = r.pts.length, e = r.pts[n - 1];
    if (e[2] > 0.5) continue;
    const a = r.pts[Math.max(0, n - 8)];
    let dx = e[0] - a[0], dy = e[1] - a[1]; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
    let x = e[0], y = e[1], z = e[2];
    for (let t = 0; t < 110 && !sea[Math.round(gj(y)) * W + Math.round(gi(x))]; t++) { x += dx * 0.4; y += dy * 0.4; z -= 1e-4; r.pts.push([x, y, z]); }
  }
  const riverById = Object.fromEntries(rivers.map((r) => [r.id, r]));
  const canals = CANALS.map((c) => ({ ...c, dense: resample(c.pts, 0.4) }));
  lap('river curves');

  // ------------------------------------------------------------------ 4. heights
  // the ground near a named river or a lake sits a little above its water, so no course is left perched
  const autoHeights = [];
  for (const r of RIVERS) {
    const dense = resample(spline(r.pts, 2), 16);
    for (const p of dense) if (p[2] < 1300) autoHeights.push([p[0], p[1], p[2] + 8 + 0.07 * p[2], 11]);
  }
  for (const l of LAKES) if (l.level != null) for (const b of l.blobs) autoHeights.push([b[0], b[1], l.level + 6, Math.max(9, b[2] * 0.8)]);
  const baseAt = shepard([...HEIGHTS, ...autoHeights], 3, 22);
  const roughAt = shepard(ROUGH, 3, 40);
  const rainAt = shepard(RAIN, 3, 20);
  const lushAt = shepard([...WATERS.map((w) => [w.at[0], w.at[1], w.n - 1, 30]), ...LUSH_EXTRA.map((p) => [p[0], p[1], p[2], 34])], 3, 30);
  const rangeAdd = new Float32Array(N);
  for (const rg of RANGES) {
    const dense = resample(spline(rg.pts, 1), 0.45);
    // let the crest wander a little so it does not read as a ruled line
    const wand = dense.map((p, i) => [p[0] + 4.5 * nzE.n(i / 160 + 3, 1.7) * (rg.id === 'spine' ? 1 : 0.6), p[1], p[2], p[3]]);
    splat(wand, (p) => p[3] * 2.7, (k, d, p) => { const v = p[2] * Math.exp(-(d * d) / (2 * p[3] * p[3])); if (v > rangeAdd[k]) rangeAdd[k] = v; });
  }
  const stepLine = resample(spline(STEP, 1), 1);
  const stepAt = (x, y) => {
    if (y < 680 || y > 1024 || x < 120 || x > 430) return 1;
    const nr = nearestOnPolyline(stepLine, x, y);
    const a = stepLine[nr.i], b = stepLine[nr.i + 1];
    const cross = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]);
    const sdS = cross < 0 ? nr.d : -nr.d; // positive east of the Step (the Terrace)
    const win = smoothstep(688, 722, y) * (1 - smoothstep(985, 1020, y));
    const wob = 3 * nzE.fbm(x / 26, y / 26, 3);
    return lerp(1, 0.06 + 0.94 * smoothstep(-5, 6.5, sdS + wob), win);
  };
  const crownPoly = ICE.crown.poly;
  const h = new Float32Array(N);
  const mount = new Float32Array(N);
  for (let j = 0; j < H; j++) {
    const y = cy(j);
    for (let i = 0; i < W; i++) {
      const k = j * W + i;
      if (sea[k]) { h[k] = 0; continue; }
      const x = cx(i), dl = dLand[k];
      const cliff = smoothstep(500, 540, x) * smoothstep(710, 670, x) * smoothstep(232, 208, y) // the outer wall's sea cliffs
        + 0.6 * smoothstep(300, 250, x) * smoothstep(480, 520, y) * smoothstep(780, 740, y); // the Long Coast's desert cliffs
      const Dc = lerp(9, 3.2, clamp(cliff, 0, 1));
      const ramp = 1 - Math.exp(-dl / Dc);
      const wx = x + 9 * nzE.fbm(x / 60 + 5, y / 60, 2), wy = y + 9 * nzE.fbm(x / 60, y / 60 + 5, 2);
      let v = baseAt(wx, wy) * stepAt(x, y) * ramp;
      const ra = rangeAdd[k] * (1 - Math.exp(-dl / 7));
      const mt = smoothstep(120, 1500, ra);
      v += ra * (0.66 + 0.7 * nzE.ridged(wx / 38, wy / 38, 4));
      v += mt * 1150 * (nzE.ridged(wx / 23 + 11, wy / 23, 5) - 0.42);
      const m2 = smoothstep(500, 2000, v);
      const flats = Math.exp(-((x - 400) * (x - 400) + (y - 545) * (y - 545)) / (70 * 70));
      const rough = clamp(roughAt(x, y), 0.03, 1.4) * (1 - 0.5 * flats);
      v += rough * (80 * nzE.fbm(wx / 66, wy / 66 + 20, 4) + 34 * nzE.fbm(wx / 21 + 3, wy / 21, 3) + 13 * nzE.fbm(x / 7.5 + 30, y / 7.5, 3)) + 0.05 * v * nzE.fbm(x / 70 + 8, y / 70, 3);
      v += m2 * 260 * (nzE.ridged(x / 12, y / 12 + 40, 4) - 0.4);
      h[k] = Math.max(1.5, v);
      mount[k] = clamp(Math.max(mt, m2), 0, 1);
    }
  }
  lap('base heights');

  // burn-in fields from the named rivers: a floor (the river is the lowest thing near it) and a cap (its valley)
  const capF = new Float32Array(N).fill(1e9), floorF = new Float32Array(N).fill(1e9);
  const named = new Uint8Array(N); // cells on a named course
  const nearNamed = new Uint8Array(N); // cells within a few units of one: traced streams end here
  const RV = 15;
  for (const r of rivers) {
    const a = r.bank;
    splat(r.pts, RV, (k, d, p) => {
      const q = d / RV, cap = p[2] + a * Math.pow(d, 1.3) + q * q * q * q * q * q * 6000;
      if (cap < capF[k]) capF[k] = cap;
      if (d < 5) { const fl = p[2] + 0.2 * d; if (fl < floorF[k]) floorF[k] = fl; }
      if (d < 1.1) named[k] = 1;
      if (d < 3.4) nearNamed[k] = 1;
    });
  }
  for (const c of canals) {
    const zs = c.id === 'straightCanal' ? [[252, 1010, 1.5], [280, 1035, 8], [318, 1062, 15], [355, 1080, 13], [398, 1094, 10.6]] : null;
    const dense = zs ? resample(zs, 0.4) : c.dense.map((p) => [p[0], p[1], c.level]);
    splat(dense, 4, (k, d, p) => { const q = d / 4, cap = p[2] + 0.5 * Math.pow(d, 1.2) + q * q * q * q * 3000; if (cap < capF[k]) capF[k] = cap; });
  }
  // lake levels: authored, or where the ground already lies
  const lakeLevel = lakes.map((l, li) => {
    if (l.level != null) return l.level;
    let mn = 1e9;
    for (const b of l.blobs) forBlob(b, 2, (k) => { if (lakeId[k] === li + 1 && h[k] < mn) mn = h[k]; });
    return mn === 1e9 ? 0 : mn - 1;
  });
  const dLakeOut = (() => { const m = new Uint8Array(N); for (let k = 0; k < N; k++) m[k] = lakeId[k] ? 1 : 0; return edt(m, W, H); })();
  const nearLake = new Uint8Array(N); // id of the lake within 7 units, for its rim
  lakes.forEach((l, li) => { for (const b of l.blobs) forBlob(b, 8, (k) => { if (!nearLake[k] && !lakeId[k]) nearLake[k] = li + 1; }); });
  const constrain = () => {
    for (let k = 0; k < N; k++) {
      if (sea[k]) { h[k] = 0; continue; }
      let v = h[k];
      if (lakeId[k]) { h[k] = lakeLevel[lakeId[k] - 1]; continue; }
      if (nearLake[k]) { const dOutU = dLakeOut[k] / GS; if (dOutU < 7) v = Math.max(v, lakeLevel[nearLake[k] - 1] + 0.6 + 0.35 * dOutU); }
      if (floorF[k] < 1e8) v = Math.max(v, floorF[k]);
      if (capF[k] < v) v = capF[k];
      h[k] = Math.max(0.6, v);
    }
  };
  constrain();
  lap('rivers burned, lakes levelled');

  // ------------------------------------------------------------------ 5. drainage
  const rain = new Float32Array(N);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const k = j * W + i; if (!sea[k]) rain[k] = clamp(rainAt(cx(i), cy(j)), 0.02, 1); }
  const NB = [-1, 1, -W, W, -W - 1, -W + 1, W - 1, W + 1];
  // fine roughness for routing only: on a smooth slope lowest-neighbour flow runs in ruled lines
  const routeNoise = new Float32Array(N);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const k = j * W + i; if (sea[k] || floorF[k] < 1e8) continue;
    const x = cx(i), y = cy(j);
    routeNoise[k] = 3.2 * nzM.fbm(x / 2.6 + 50, y / 2.6, 2) + 2.6 * nzM.fbm(x / 6.5, y / 6.5 + 50, 2);
  }
  const drain = () => {
    const hr = new Float32Array(N);
    for (let k = 0; k < N; k++) hr[k] = lakeId[k] ? h[k] : h[k] + routeNoise[k] * Math.min(1, 0.25 + h[k] / 300);
    const filled = Float32Array.from(hr), recv = new Int32Array(N).fill(-1), seen = new Uint8Array(N);
    const hk = new Float32Array(N), hi = new Int32Array(N); let hn = 0;
    const order = new Int32Array(N); let no = 0;
    let lcg = (SEED * 2654435761) >>> 0;
    const rr = () => { lcg = (Math.imul(lcg, 1664525) + 1013904223) >>> 0; return lcg / 4294967296; };
    const push = (key, idx) => {
      let c = hn++; hk[c] = key; hi[c] = idx;
      while (c > 0) { const p = (c - 1) >> 1; if (hk[p] <= hk[c]) break; const tk = hk[p], ti = hi[p]; hk[p] = hk[c]; hi[p] = hi[c]; hk[c] = tk; hi[c] = ti; c = p; }
    };
    const pop = () => {
      const top = hi[0]; hn--;
      if (hn > 0) {
        hk[0] = hk[hn]; hi[0] = hi[hn]; let c = 0;
        for (;;) { const l = 2 * c + 1, r = l + 1; let m = c; if (l < hn && hk[l] < hk[m]) m = l; if (r < hn && hk[r] < hk[m]) m = r; if (m === c) break; const tk = hk[m], ti = hi[m]; hk[m] = hk[c]; hi[m] = hi[c]; hk[c] = tk; hi[c] = ti; c = m; }
      }
      return top;
    };
    for (let j = 1; j < H - 1; j++) for (let i = 1; i < W - 1; i++) {
      const k = j * W + i;
      if (!sea[k]) continue;
      seen[k] = 1;
      if (land[k - 1] || land[k + 1] || land[k - W] || land[k + W]) push(0, k);
    }
    for (let i = 0; i < W; i++) { seen[i] = 1; seen[(H - 1) * W + i] = 1; }
    for (let j = 0; j < H; j++) { seen[j * W] = 1; seen[j * W + W - 1] = 1; }
    while (hn) {
      const k = pop();
      const off = (rr() * 8) | 0;
      for (let qq = 0; qq < 8; qq++) {
        const q = (qq + off) & 7, m = k + NB[q];
        if (seen[m]) continue;
        seen[m] = 1; recv[m] = k;
        const f = Math.max(hr[m], filled[k] + (named[m] ? 0.0004 : 0.0015 + 0.012 * rr()) * (q < 4 ? 1 : 1.41));
        filled[m] = f; order[no++] = m; push(f, m);
      }
    }
    const acc = new Float32Array(N), area = new Float32Array(N);
    const cell = 1 / (GS * GS);
    for (let q = 0; q < no; q++) { const k = order[q]; acc[k] = rain[k] * cell; area[k] = cell; }
    for (let q = no - 1; q >= 0; q--) { const k = order[q], r = recv[k]; if (r >= 0 && !sea[r]) { acc[r] += acc[k]; area[r] += area[k]; } }
    return { filled, recv, acc, area, order, no };
  };
  let D = drain();
  lap('drainage pass 1');
  // streams cut their valleys: lower the ground along the drainage, most in the mountains
  for (let pass = 0; pass < 2; pass++) {
    const inc = new Float32Array(N);
    for (let k = 0; k < N; k++) {
      if (sea[k] || lakeId[k]) continue;
      const a = D.area[k];
      if (a > 6) inc[k] = Math.log(a / 6) * clamp(2 + 0.075 * h[k], 2, 44 + 80 * mount[k]) * (pass === 0 ? 1 : 0.55);
    }
    const blurred = boxBlur(inc, W, H, pass === 0 ? 3 : 2, 2);
    for (let k = 0; k < N; k++) if (!sea[k]) h[k] = Math.max(1, h[k] - blurred[k] * 1.25);
    constrain();
    D = drain();
    lap(`incision pass ${pass + 1}`);
  }

  // ------------------------------------------------------------------ 6. ice
  const ice = new Float32Array(N);
  {
    const bb = [240, 170, 356, 304];
    for (let j = Math.floor(gj(bb[1])); j <= Math.ceil(gj(bb[3])); j++) for (let i = Math.floor(gi(bb[0])); i <= Math.ceil(gi(bb[2])); i++) {
      const k = j * W + i, x = cx(i), y = cy(j);
      if (sea[k]) continue;
      const wx = x + 9 * nzE.fbm(x / 24, y / 24 + 3, 3) + 2.5 * nzE.fbm(x / 5, y / 5, 2), wy = y + 9 * nzE.fbm(x / 24 + 7, y / 24, 3) + 2.5 * nzE.fbm(x / 5 + 4, y / 5, 2);
      if (pointInPolygon(crownPoly, wx, wy)) ice[k] = 1;
    }
    for (const tg of ICE.tongues) splat(resample(spline(tg.pts, 0.5), 0.3), (p) => p[2], (k, d, p) => { if (!sea[k] && d < p[2] * (0.8 + 0.3 * nzE.n(cx(k % W) / 3, cy((k / W) | 0) / 3))) ice[k] = 1; });
    // perpetual snow on the high Spine and the Pyre Peaks (cold north only)
    for (let j = 0; j < H; j++) {
      const y = cy(j); if (y > 720) break;
      const line = lerp(2750, 3350, smoothstep(250, 700, y));
      for (let i = 0; i < W; i++) { const k = j * W + i; if (!sea[k] && !ice[k] && h[k] > line + 140 * nzE.fbm(cx(i) / 9, y / 9, 3)) ice[k] = 0.6; }
    }
  }
  const iceS = boxBlur(ice, W, H, 1, 1);
  // the ice dome: lift and smooth the Crown so it reads as one field
  {
    const hb = boxBlur(h, W, H, 6, 2);
    for (let k = 0; k < N; k++) if (ice[k] === 1 && !sea[k] && !lakeId[k]) h[k] = lerp(h[k], Math.min(hb[k] + 200, ICE.crown.top), 0.7);
    constrain();
    D = drain();
  }
  lap('ice');

  // ------------------------------------------------------------------ 7. the drawn network
  // named rivers carry a width; the rest of the network is traced from the accumulation field
  const widthOf = { great: [0.9, 3.4], black: [0.5, 1.9], river: [0.26, 1.0], kingdom: [0.3, 0.9], braided: [0.3, 0.6], stream: [0.2, 0.62], clear: [0.24, 0.9], arm: [0.7, 1.2], seasonal: [0.3, 0.5], fen: [0.22, 0.3] };
  for (const r of rivers) {
    const s = arcLengths(r.pts), L = s[s.length - 1], [w0, w1] = widthOf[r.cls];
    r.pts = r.pts.map((p, i) => [p[0], p[1], p[2], lerp(w0, w1, Math.pow(s[i] / L, 0.7))]);
    r.len = L;
  }
  const T_STREAM = 150, T_WADI = 520;
  const isStream = new Uint8Array(N); // 1 stream, 2 wadi
  for (let q = 0; q < D.no; q++) {
    const k = D.order[q];
    if (lakeId[k] || ice[k] === 1) continue;
    if (D.acc[k] > T_STREAM) isStream[k] = 1; else if (D.area[k] > T_WADI) isStream[k] = 2;
  }
  const upCount = new Uint8Array(N);
  for (let q = 0; q < D.no; q++) { const k = D.order[q]; if (isStream[k]) { const r = D.recv[k]; if (r >= 0 && isStream[r]) upCount[r]++; } }
  const visited = new Uint8Array(N);
  const streams = [];
  for (let q = D.no - 1; q >= 0; q--) {
    const k0 = D.order[q];
    if (!isStream[k0] || upCount[k0] || visited[k0] || nearNamed[k0]) continue;
    const line = []; let k = k0;
    for (;;) {
      line.push(k);
      if (visited[k] || nearNamed[k]) break;
      visited[k] = 1;
      const r = D.recv[k];
      if (r < 0 || sea[r]) { if (r >= 0) line.push(r); break; }
      if (lakeId[r] || !isStream[r]) { line.push(r); break; }
      k = r;
    }
    if (line.length < 16) continue;
    let pts = line.map((c) => [cx(c % W), cy((c / W) | 0), D.acc[c], isStream[c]]);
    // snap the end onto a named course so tributaries meet their river
    const endK = line[line.length - 1];
    if (nearNamed[endK]) {
      let best = null;
      for (const r of rivers) { const nr = nearestOnPolyline(r.pts, pts[pts.length - 1][0], pts[pts.length - 1][1]); if (!best || nr.d < best.d) best = { d: nr.d, p: [lerp(r.pts[nr.i][0], r.pts[nr.i + 1][0], nr.t), lerp(r.pts[nr.i][1], r.pts[nr.i + 1][1], nr.t)] }; }
      if (best) { pts[pts.length - 1][0] = best.p[0]; pts[pts.length - 1][1] = best.p[1]; }
    }
    for (let it = 0; it < 8; it++) for (let i = 1; i < pts.length - 1; i++) { pts[i][0] = (pts[i - 1][0] + 2 * pts[i][0] + pts[i + 1][0]) / 4; pts[i][1] = (pts[i - 1][1] + 2 * pts[i][1] + pts[i + 1][1]) / 4; }
    const wadiShare = pts.reduce((a, p) => a + (p[3] === 2 ? 1 : 0), 0) / pts.length;
    streams.push({ wadi: wadiShare > 0.6, pts: pts.filter((_, i) => i % 2 === 0 || i === pts.length - 1).map((p) => [p[0], p[1], p[2]]) });
  }
  lap(`network traced: ${streams.length} streams`);

  // ------------------------------------------------------------------ 8. the hydrology check
  // Follow the computed flow from each named river's head and see that it keeps to the WORLD.md course.
  const checks = [];
  for (const r of rivers) {
    if (r.minor) continue;
    const s = arcLengths(r.pts), L = s[s.length - 1];
    const st = r.pts[Math.max(3, Math.round(r.pts.length * 0.1))];
    let k = Math.round(gj(st[1])) * W + Math.round(gi(st[0]));
    let maxDev = 0, reached = 0, steps = 0, outside = 0, left = null;
    while (steps++ < 60000) {
      if (sea[k]) { reached = Math.max(reached, 1); break; }
      const x = cx(k % W), y = cy((k / W) | 0), nr = nearestOnPolyline(r.pts, x, y, s);
      if (nr.d > 3.5 && !lakeId[k]) { if (!left) left = [Math.round(x), Math.round(y)]; outside++; if (outside > 60) break; }
      else { outside = 0; left = null; reached = Math.max(reached, nr.s / L); if (!lakeId[k] && nr.s / L < 0.93) maxDev = Math.max(maxDev, nr.d); }
      if (nr.s / L > 0.93 && nr.d < 3.5) { reached = 1; break; }
      if (lakeId[k]) {
        // a lake the course runs through is crossed to the course's own way out (the fen has two outlets)
        let q = nr.i; while (q < r.pts.length - 1 && lakeId[Math.round(gj(r.pts[q][1])) * W + Math.round(gi(r.pts[q][0]))]) q++;
        if (q < r.pts.length - 1 && nr.d < 20) { k = Math.round(gj(r.pts[q][1])) * W + Math.round(gi(r.pts[q][0])); continue; }
      }
      const nx = D.recv[k]; if (nx < 0) break; k = nx;
    }
    checks.push({ id: r.id, reached: +reached.toFixed(3), maxDev: +maxDev.toFixed(2), ok: reached > 0.99 && maxDev < 3.5, left: reached > 0.99 ? null : left });
  }
  // every named course must fall all the way
  for (const r of rivers) { let ok = true; for (let i = 1; i < r.pts.length; i++) if (r.pts[i][2] > r.pts[i - 1][2]) ok = false; if (!ok) checks.push({ id: r.id + ':profile', ok: false }); }

  return { W, H, N, x0, y0, UW, UH, cx, cy, gi, gj, sample, sd, sea, land, dSea, dLand, lakeF, lakeId, lakes, lakeLevel, h, mount, ice: iceS, iceRaw: ice,
    rain, rainAt, lushAt, rivers, riverById, canals, streams, drain: D, named, inletLines, checks, stepLine, splat, forBlob };
}
