// Clarity report — objective image metrics for the "Clear Night" graphics pass (docs/v3/clarity/SPEC.md).
// Pair it with tools/tests/clarity-shots.scenario.mjs (the fixed frames) and tools/hue-report.mjs (the hue bands).
//
//   node tools/clarity-report.mjs <png|dir> [...more]              per-frame table + pooled row
//        [--json=out.json]                                         also write every number (the baseline other stages compare to)
//        [--baseline=before/metrics.json] [--gate]                 ratios against a baseline + the spec's targets (PASS / FAIL);
//                                                                  with --gate a FAIL exits 1
//        [--md]                                                    print the tables as Markdown
//   node tools/clarity-report.mjs --iso <dir>                      the audit's knob sweep: files named <frame>__<knob>.png, each
//                                                                  knob against <frame>__base.png (what one cause contributes)
//
// Pure Node (its own small PNG reader: 8/16-bit grey, RGB, RGBA, palette; non-interlaced), no browser, ~0.2 s a frame.
// Everything is measured on what the player sees: the 8-bit sRGB frame. Y' = Rec.709 luma of the encoded values (0..255).
//
// Metrics
//   lapVar    variance of the 4-neighbour Laplacian of Y' — the classic sharpness score, raw. In this game it is dominated
//             by point sparkle (the vault's stars, their mirror image all over the water, glints, motes) and by film grain,
//             so the score the spec gates on is taken after those are removed:
//   sharp     EDGE SHARPNESS: the Laplacian variance of the 3×3-median-filtered Y' (a median keeps edges and lines of two
//             pixels and more, and deletes specks and grain). Rises with crisper, higher-contrast silhouettes, outlines,
//             shadow edges and reflections; falls with haze, bloom smear, chromatic fringe, MSAA softening and upscaling
//   noise     σ of the per-pixel noise (Immerkær's operator, median form: edges and stars do not bias it): grain + paper
//   speck     point sparkle: % of pixels more than 12 luma levels above their 3×3 median (stars, glints, motes, grain peaks);
//   speckLo   the same over the lower 35 % of the frame (open water in every frame of the set: the "snow" of mirrored stars)
//   grad      mean Sobel gradient magnitude, in luma levels per pixel
//   acut      edge acutance: the mean gradient of the strongest 2 % of pixels of the 2×2-averaged frame (noise-robust; it
//             rises with contrast across real edges and falls with haze, blur and bloom)
//   eWidth    median edge spread in pixels over those strong edges (contrast ÷ peak slope along the gradient): 1.0 is a
//             perfect one-pixel step; blur, a low render resolution, bloom smear and chromatic fringe widen it. Haze does not
//   tileRms   LOCAL CONTRAST: the frame is cut into square tiles (short side ÷ 15); mean of each tile's σ(Y')
//   farRms    the same over the upper 40 % of the frame (the far shore, the ruins and the vault in the sail framing)
//   darkCh    HAZE: mean of the dark channel (min of R, G, B over a short-side ÷ 36 patch; He, Sun & Tang 2009). Clear air
//             has near-black patches everywhere; a veil of fog, bloom or lifted blacks raises it
//   hazeR     darkCh ÷ mean Y': the haze as a fraction of the frame's own brightness (compares day and night frames)
//   p1 p50 p99   percentiles of Y' — p1 is the BLACK POINT, p99 the white point; DR = p99 − p1; stops = log2 of their
//             linear-light ratio (DYNAMIC RANGE)
//   sat       mean HSV saturation of the pixels brighter than V 0.06
//   lav vio gt amb   hue shares (%) of the chromatic weight (same test and weight as tools/hue-report.mjs: S > 0.10, V > 0.06,
//             weight S·V): LAVENDER 230–290°; the whole cool violet family 210–300° (cobalt Glasswater sits at ≈ 228° and
//             plum Sporewood at ≈ 285°, on the lavender band's edges); GREEN-TEAL 65–195° (the ≤ 2 % rule); amber 15–65°
import { readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { resolve, basename, join } from 'node:path';

// ------------------------------------------------------------------ the spec's targets (docs/v3/clarity/SPEC.md §4)
// POOLED: after ÷ baseline of the mean over the frames both runs share (kind 'ratio'), or the after value itself ('abs').
export const TARGETS = [
  { key: 'sharp', kind: 'ratio', min: 2.0, label: 'edge sharpness ≥ 2.0× baseline' },
  { key: 'acut', kind: 'ratio', min: 1.2, label: 'edge acutance ≥ 1.2× baseline' },
  { key: 'eWidth', kind: 'ratio', max: 0.92, label: 'edge spread ≤ 0.92× baseline' },
  { key: 'tileRms', kind: 'ratio', min: 1.2, label: 'local contrast ≥ 1.2× baseline' },
  { key: 'farRms', kind: 'ratio', min: 1.3, label: 'far-field contrast ≥ 1.3× baseline' },
  { key: 'darkCh', kind: 'ratio', max: 0.85, label: 'dark-channel haze ≤ 0.85× baseline (goal: 0.7×)' },
  { key: 'noise', kind: 'ratio', max: 0.5, label: 'pixel noise (grain + paper) ≤ 0.5× baseline' },
  { key: 'speckLo', kind: 'ratio', max: 0.7, label: 'point sparkle on the water ≤ 0.7× baseline (the mirrored-star "snow")' },
  { key: 'stops', kind: 'ratio', min: 1.1, label: 'dynamic range (stops) ≥ 1.1× baseline' },
  { key: 'p50', kind: 'ratio', min: 0.85, max: 1.15, label: 'median luma within ±15 % of baseline (clearer, not darker)' },
  { key: 'lav', kind: 'ratio', min: 0.85, max: 1.15, label: 'lavender share (230–290°) within ±15 % of baseline' },
  { key: 'sat', kind: 'ratio', min: 0.95, max: 1.2, label: 'mean saturation 0.95–1.2× baseline (a relight, not a repaint)' },
  { key: 'amb', kind: 'ratio', min: 0.6, max: 1.6, label: 'amber share 0.6–1.6× baseline (the lantern stays the one warm light)' },
  { key: 'gt', kind: 'abs', max: 1.0, label: 'green-teal share ≤ 1 % pooled' },
];
// EVERY FRAME of the after set: `ratio` against the frame's own baseline, `min` / `max` on the value itself, `drop` = the
// most the value may fall below its baseline. `skip` names frames the rule does not apply to (substring match).
export const FRAME_RULES = [
  { key: 'sharp', ratioMin: 1.3, label: 'edge sharpness ≥ 1.3× its baseline' },
  { key: 'p50', ratioMin: 0.8, min: 12, label: 'median luma ≥ 0.8× its baseline and ≥ 12 (a night stays readable)' },
  { key: 'p1', min: 2, max: 14, skip: ['raft-lantern', 'catch', 'swarm'], label: 'black point 2 ≤ p1 ≤ 14 (above the night floor, below a veil)' },
  { key: 'vio', drop: 8, label: 'cool violet family (210–300°) no more than 8 points under its baseline' },
  { key: 'gt', max: 2.0, label: 'green-teal share ≤ 2 %' },
];

// ------------------------------------------------------------------ PNG
const SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
export function readPng(file) {
  const buf = readFileSync(file);
  if (buf.subarray(0, 8).compare(SIG) !== 0) throw new Error('not a PNG: ' + file);
  let off = 8, W = 0, H = 0, depth = 8, ctype = 6, interlace = 0, plte = null;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off), type = buf.toString('latin1', off + 4, off + 8), data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') { W = data.readUInt32BE(0); H = data.readUInt32BE(4); depth = data[8]; ctype = data[9]; interlace = data[12]; }
    else if (type === 'PLTE') plte = data;
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (interlace) throw new Error('interlaced PNG not supported: ' + file);
  if (depth !== 8 && depth !== 16) throw new Error(`bit depth ${depth} not supported: ${file}`);
  const ch = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ctype];
  if (!ch) throw new Error('colour type ' + ctype + ' not supported: ' + file);
  const bps = depth / 8, bpp = ch * bps, stride = W * bpp;
  const raw = inflateSync(Buffer.concat(idat));
  const px = new Uint8Array(H * stride);
  for (let y = 0; y < H; y++) {
    const f = raw[y * (stride + 1)], s = y * (stride + 1) + 1, d = y * stride, u = d - stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[d + x - bpp] : 0, b = y > 0 ? px[u + x] : 0, c = x >= bpp && y > 0 ? px[u + x - bpp] : 0;
      let v = raw[s + x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      px[d + x] = v & 255;
    }
  }
  const rgb = new Uint8Array(W * H * 3);
  for (let i = 0, n = W * H; i < n; i++) {
    const p = i * bpp;
    let r, g, b;
    if (ctype === 2 || ctype === 6) { r = px[p]; g = px[p + bps]; b = px[p + 2 * bps]; }
    else if (ctype === 3) { const k = px[p] * 3; r = plte[k]; g = plte[k + 1]; b = plte[k + 2]; }
    else { r = g = b = px[p]; }
    rgb[i * 3] = r; rgb[i * 3 + 1] = g; rgb[i * 3 + 2] = b;
  }
  return { W, H, rgb };
}

// ------------------------------------------------------------------ metrics
const LIN = new Float64Array(256);
for (let i = 0; i < 256; i++) { const c = i / 255; LIN[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
const lin8 = (v) => { const i = Math.max(0, Math.min(255, v)); const a = Math.floor(i), f = i - a; return LIN[a] + (LIN[Math.min(255, a + 1)] - LIN[a]) * f; };
function pct(hist, total, q) { let acc = 0; const want = total * q; for (let i = 0; i < hist.length; i++) { acc += hist[i]; if (acc >= want) return i; } return hist.length - 1; }
function minFilter(src, W, H, r) {
  const tmp = new Uint8Array(W * H), out = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let m = 255; for (let k = Math.max(0, x - r), e = Math.min(W - 1, x + r); k <= e; k++) { const v = src[y * W + k]; if (v < m) m = v; } tmp[y * W + x] = m; }
  for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) { let m = 255; for (let k = Math.max(0, y - r), e = Math.min(H - 1, y + r); k <= e; k++) { const v = tmp[k * W + x]; if (v < m) m = v; } out[y * W + x] = m; }
  return out;
}

export function measure({ W, H, rgb }) {
  const N = W * H;
  const Y = new Float32Array(N), minC = new Uint8Array(N);
  const hist = new Float64Array(256);
  let sumY = 0, satSum = 0, satN = 0, wAll = 0, wLav = 0, wGT = 0, wAmb = 0, wVio = 0, chromaPx = 0;
  for (let i = 0; i < N; i++) {
    const r = rgb[i * 3], g = rgb[i * 3 + 1], b = rgb[i * 3 + 2];
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    Y[i] = y; sumY += y; hist[Math.round(y)]++;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    minC[i] = mn;
    const v = mx / 255;
    if (v > 0.06) {
      const s = d / mx;
      satSum += s; satN++;
      if (s > 0.10 && d > 0) {
        let h;
        if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
        h *= 60; if (h < 0) h += 360;
        const w = s * v;
        wAll += w; chromaPx++;
        if (h >= 230 && h < 290) wLav += w; else if (h >= 65 && h < 195) wGT += w; else if (h >= 15 && h < 65) wAmb += w;
        if (h >= 210 && h < 300) wVio += w;
      }
    }
  }
  const meanY = sumY / N;
  const p1 = pct(hist, N, 0.01), p50 = pct(hist, N, 0.5), p99 = pct(hist, N, 0.99);

  // Laplacian variance, Sobel gradient, Immerkær noise (interior pixels)
  let lapS = 0, lapS2 = 0, gradS = 0, cnt = 0;
  const nh = new Float64Array(4096);   // |Immerkær response| in 1/8 luma steps
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const a = Y[i - W - 1], b = Y[i - W], c = Y[i - W + 1], d = Y[i - 1], e = Y[i], f = Y[i + 1], g = Y[i + W - 1], h = Y[i + W], k = Y[i + W + 1];
      const lap = b + d + f + h - 4 * e;
      lapS += lap; lapS2 += lap * lap;
      const gx = (c + 2 * f + k) - (a + 2 * d + g), gy = (g + 2 * h + k) - (a + 2 * b + c);
      gradS += Math.sqrt(gx * gx + gy * gy) / 8;
      const im = Math.abs(a - 2 * b + c - 2 * d + 4 * e - 2 * f + g - 2 * h + k);
      nh[Math.min(4095, Math.round(im * 8))]++;
      cnt++;
    }
  }
  const lapVar = lapS2 / cnt - (lapS / cnt) ** 2;
  const noise = (pct(nh, cnt, 0.5) / 8) / (0.6745 * 6);

  // 3×3 median of Y' (specks and grain out, edges kept): the structural sharpness, and the count of specks it removed
  const M = new Float32Array(N);
  const v9 = new Float32Array(9);
  let spk = 0, spkLo = 0, nLo = 0;
  const yLo = Math.floor(H * 0.65);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (y === 0 || x === 0 || y === H - 1 || x === W - 1) { M[i] = Y[i]; continue; }
      v9[0] = Y[i - W - 1]; v9[1] = Y[i - W]; v9[2] = Y[i - W + 1]; v9[3] = Y[i - 1]; v9[4] = Y[i]; v9[5] = Y[i + 1]; v9[6] = Y[i + W - 1]; v9[7] = Y[i + W]; v9[8] = Y[i + W + 1];
      for (let a = 1; a < 9; a++) { const t = v9[a]; let b = a - 1; while (b >= 0 && v9[b] > t) { v9[b + 1] = v9[b]; b--; } v9[b + 1] = t; }
      M[i] = v9[4];
      const sp = Y[i] - v9[4] > 12 ? 1 : 0;
      spk += sp;
      if (y >= yLo) { spkLo += sp; nLo++; }
    }
  }
  let mS = 0, mS2 = 0;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; const l = M[i - W] + M[i - 1] + M[i + 1] + M[i + W] - 4 * M[i]; mS += l; mS2 += l * l; }
  const sharp = mS2 / cnt - (mS / cnt) ** 2;

  // acutance + edge spread on the 2×2-averaged frame
  const W2 = W >> 1, H2 = H >> 1;
  const Y2 = new Float32Array(W2 * H2);
  for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) { const i = (y * 2) * W + x * 2; Y2[y * W2 + x] = (Y[i] + Y[i + 1] + Y[i + W] + Y[i + W + 1]) * 0.25; }
  const G2 = new Float32Array(W2 * H2), GX = new Float32Array(W2 * H2), GY = new Float32Array(W2 * H2);
  const gh = new Float64Array(2048);
  let n2 = 0;
  for (let y = 1; y < H2 - 1; y++) for (let x = 1; x < W2 - 1; x++) {
    const i = y * W2 + x;
    const gx = (Y2[i - W2 + 1] + 2 * Y2[i + 1] + Y2[i + W2 + 1]) - (Y2[i - W2 - 1] + 2 * Y2[i - 1] + Y2[i + W2 - 1]);
    const gy = (Y2[i + W2 - 1] + 2 * Y2[i + W2] + Y2[i + W2 + 1]) - (Y2[i - W2 - 1] + 2 * Y2[i - W2] + Y2[i - W2 + 1]);
    const m = Math.sqrt(gx * gx + gy * gy) / 8;
    G2[i] = m; GX[i] = gx; GY[i] = gy;
    gh[Math.min(2047, Math.round(m * 8))]++; n2++;
  }
  const thr = pct(gh, n2, 0.98) / 8;
  let acS = 0, acN = 0;
  const widths = [];
  const samp = (fx, fy) => {   // bilinear on the full-resolution luma
    const x = Math.max(0, Math.min(W - 1.001, fx)), y = Math.max(0, Math.min(H - 1.001, fy));
    const x0 = Math.floor(x), y0 = Math.floor(y), tx = x - x0, ty = y - y0, i = y0 * W + x0;
    return (Y[i] * (1 - tx) + Y[i + 1] * tx) * (1 - ty) + (Y[i + W] * (1 - tx) + Y[i + W + 1] * tx) * ty;
  };
  for (let y = 2; y < H2 - 2; y++) for (let x = 2; x < W2 - 2; x++) {
    const i = y * W2 + x, m = G2[i];
    if (m < thr || m <= 0) continue;
    acS += m; acN++;
    // edge spread: only at the ridge of the edge (a local maximum of the gradient along its own direction)
    const l = Math.hypot(GX[i], GY[i]); if (l < 1e-6) continue;
    const ux = GX[i] / l, uy = GY[i] / l;
    const xa = Math.round(x + ux), ya = Math.round(y + uy), xb = Math.round(x - ux), yb = Math.round(y - uy);
    if (G2[ya * W2 + xa] > m || G2[yb * W2 + xb] > m) continue;
    const cx = x * 2 + 0.5, cy = y * 2 + 0.5;   // back to full-resolution coordinates (pixel centres)
    let hi = samp(cx, cy), lo = hi, peak = 0, prev = hi;
    for (let s = 1; s <= 8; s++) { const v = samp(cx + ux * s * 0.5, cy + uy * s * 0.5); if (v < prev - 0.25) break; peak = Math.max(peak, (v - prev) * 2); hi = v; prev = v; }
    prev = lo;
    for (let s = 1; s <= 8; s++) { const v = samp(cx - ux * s * 0.5, cy - uy * s * 0.5); if (v > prev + 0.25) break; peak = Math.max(peak, (prev - v) * 2); lo = v; prev = v; }
    if (peak > 0.5 && hi - lo > 6) widths.push((hi - lo) / peak);
  }
  widths.sort((a, b) => a - b);
  const acut = acN ? acS / acN / 2 : 0;   // per full-resolution pixel
  const eWidth = widths.length ? widths[widths.length >> 1] : 0;

  // local contrast in tiles
  const T = Math.max(8, Math.round(Math.min(W, H) / 15));
  let tS = 0, tN = 0, fS = 0, fN = 0;
  for (let ty = 0; ty + T <= H; ty += T) for (let tx = 0; tx + T <= W; tx += T) {
    let s = 0, s2 = 0;
    for (let y = ty; y < ty + T; y++) for (let x = tx; x < tx + T; x++) { const v = Y[y * W + x]; s += v; s2 += v * v; }
    const n = T * T, sd = Math.sqrt(Math.max(0, s2 / n - (s / n) ** 2));
    tS += sd; tN++;
    if (ty + T / 2 < H * 0.4) { fS += sd; fN++; }
  }

  // dark channel
  const pr = Math.max(1, Math.round(Math.min(W, H) / 72));
  const dc = minFilter(minC, W, H, pr);
  let dS = 0; for (let i = 0; i < N; i++) dS += dc[i];
  const darkCh = dS / N;

  const r2 = (x, d = 2) => +x.toFixed(d);
  return {
    w: W, h: H,
    lapVar: r2(lapVar, 1), noise: r2(noise, 3), sharp: r2(sharp, 1), speck: r2((100 * spk) / cnt, 3), speckLo: r2((100 * spkLo) / Math.max(1, nLo), 3), grad: r2(gradS / cnt, 3), acut: r2(acut, 2), eWidth: r2(eWidth, 2),
    tileRms: r2(tS / Math.max(1, tN)), farRms: r2(fS / Math.max(1, fN)),
    darkCh: r2(darkCh), hazeR: r2(darkCh / Math.max(1e-6, meanY), 3),
    meanY: r2(meanY), p1, p50, p99, DR: p99 - p1, stops: r2(Math.log2((lin8(p99) + 5e-4) / (lin8(p1) + 5e-4))),
    sat: r2(satN ? satSum / satN : 0, 3), chroma: r2(wAll / N, 4),
    lav: r2(wAll ? (100 * wLav) / wAll : 0), vio: r2(wAll ? (100 * wVio) / wAll : 0), gt: r2(wAll ? (100 * wGT) / wAll : 0), amb: r2(wAll ? (100 * wAmb) / wAll : 0),
    _w: { all: +wAll.toFixed(2), lav: +wLav.toFixed(2), vio: +wVio.toFixed(2), gt: +wGT.toFixed(2), amb: +wAmb.toFixed(2) },
  };
}

const KEYS = ['sharp', 'lapVar', 'noise', 'speck', 'speckLo', 'grad', 'acut', 'eWidth', 'tileRms', 'farRms', 'darkCh', 'hazeR', 'meanY', 'p1', 'p50', 'p99', 'DR', 'stops', 'sat', 'lav', 'vio', 'gt', 'amb'];
const DEC = { sharp: 1, lapVar: 1, noise: 2, speck: 2, speckLo: 2, grad: 2, acut: 2, eWidth: 2, tileRms: 2, farRms: 2, darkCh: 1, hazeR: 3, meanY: 1, p1: 0, p50: 0, p99: 0, DR: 0, stops: 2, sat: 3, lav: 1, vio: 1, gt: 2, amb: 1 };
/** Pooled over frames: the mean of each metric; hue shares from the summed chromatic weight (as hue-report pools them). */
export function pool(rows) {
  const out = {};
  if (!rows.length) return out;
  for (const k of KEYS) out[k] = rows.reduce((s, r) => s + r[k], 0) / rows.length;
  const w = rows.reduce((a, r) => ({ all: a.all + r._w.all, lav: a.lav + r._w.lav, vio: a.vio + r._w.vio, gt: a.gt + r._w.gt, amb: a.amb + r._w.amb }), { all: 0, lav: 0, vio: 0, gt: 0, amb: 0 });
  if (w.all > 0) { out.lav = (100 * w.lav) / w.all; out.vio = (100 * w.vio) / w.all; out.gt = (100 * w.gt) / w.all; out.amb = (100 * w.amb) / w.all; }
  for (const k of KEYS) out[k] = +out[k].toFixed(Math.max(2, DEC[k] + 1));
  return out;
}

// ------------------------------------------------------------------ CLI
function table(head, rows, md) {
  const w = head.map((h, i) => Math.max(String(h).length, ...rows.map((r) => String(r[i]).length)));
  const line = (r) => (md ? '| ' + r.map((c, i) => (i ? String(c).padStart(w[i]) : String(c).padEnd(w[i]))).join(' | ') + ' |' : r.map((c, i) => (i ? String(c).padStart(w[i]) : String(c).padEnd(w[i]))).join('  '));
  const out = [line(head)];
  out.push(md ? '|' + w.map((n, i) => (i ? '-'.repeat(n + 1) + ':' : '-'.repeat(n + 2))).join('|') + '|' : w.map((n) => '-'.repeat(n)).join('  '));
  for (const r of rows) out.push(line(r));
  return out.join('\n');
}
const fmt = (v, k) => (typeof v === 'number' ? v.toFixed(DEC[k] ?? 2) : String(v));
function listPngs(inputs) {
  const files = [];
  for (const p of inputs) {
    const abs = resolve(process.cwd(), p);
    let st; try { st = statSync(abs); } catch { console.error('missing: ' + abs); continue; }
    if (st.isDirectory()) readdirSync(abs).filter((f) => /\.png$/i.test(f)).sort().forEach((f) => files.push(join(abs, f)));
    else files.push(abs);
  }
  return files;
}

function main() {
  const opts = { json: null, baseline: null, gate: false, md: false, iso: false };
  const inputs = [];
  for (const a of process.argv.slice(2)) {
    if (a.startsWith('--')) { const [k, v] = a.slice(2).split('='); if (k in opts) opts[k] = v === undefined ? true : v; else { console.error('unknown option ' + a); process.exit(2); } }
    else inputs.push(a);
  }
  const files = listPngs(inputs);
  if (!files.length) { console.error('usage: node tools/clarity-report.mjs <png|dir> [...] [--json=out.json] [--baseline=metrics.json] [--gate] [--md] | --iso <dir>'); process.exit(2); }
  const frames = {};
  for (const f of files) {
    const name = basename(f).replace(/\.png$/i, '');
    try { frames[name] = measure(readPng(f)); } catch (e) { console.error(`skip ${name}: ${e.message}`); }
  }
  const names = Object.keys(frames);
  const COLS = ['sharp', 'lapVar', 'noise', 'speck', 'speckLo', 'grad', 'acut', 'eWidth', 'tileRms', 'farRms', 'darkCh', 'hazeR', 'p1', 'p50', 'p99', 'stops', 'sat', 'lav', 'vio', 'gt', 'amb'];

  if (opts.iso) {
    // <frame>__<knob>: each knob against the frame's own __base, then the mean effect over the frames that have it
    const by = {};
    for (const n of names) { const [fr, kn] = n.split('__'); if (!kn) continue; (by[fr] = by[fr] || {})[kn] = frames[n]; }
    const RK = ['sharp', 'lapVar', 'acut', 'eWidth', 'tileRms', 'farRms', 'darkCh', 'noise', 'speckLo', 'p1', 'p50', 'stops', 'sat', 'lav'];
    const knobs = [...new Set(Object.values(by).flatMap((o) => Object.keys(o)))].filter((k) => k !== 'base');
    const out = { frames: {}, mean: {} };
    for (const [fr, set] of Object.entries(by)) {
      if (!set.base) continue;
      console.log(`\n${fr} — each knob ÷ base (p1 / p50 as differences in luma levels)   base: ${RK.map((k) => `${k} ${fmt(set.base[k], k)}`).join('  ')}`);
      const rows = [];
      out.frames[fr] = { base: Object.fromEntries(RK.map((k) => [k, set.base[k]])) };
      for (const kn of knobs) {
        const m = set[kn]; if (!m) continue;
        const rel = Object.fromEntries(RK.map((k) => [k, k === 'p1' || k === 'p50' ? m[k] - set.base[k] : set.base[k] ? +(m[k] / set.base[k]).toFixed(3) : 0]));
        out.frames[fr][kn] = rel;
        rows.push([kn, ...RK.map((k) => (k === 'p1' || k === 'p50' ? (rel[k] >= 0 ? '+' : '') + rel[k] : rel[k].toFixed(2)))]);
      }
      console.log(table(['knob', ...RK], rows, opts.md));
    }
    const rows = [];
    for (const kn of knobs) {
      const have = Object.values(out.frames).filter((f) => f[kn]);
      if (!have.length) continue;
      const mean = Object.fromEntries(RK.map((k) => [k, +(have.reduce((s, f) => s + f[kn][k], 0) / have.length).toFixed(3)]));
      out.mean[kn] = { n: have.length, ...mean };
      rows.push([kn, have.length, ...RK.map((k) => (k === 'p1' || k === 'p50' ? (mean[k] >= 0 ? '+' : '') + mean[k].toFixed(1) : mean[k].toFixed(2)))]);
    }
    console.log(`\nmean over frames — each knob ÷ base`);
    console.log(table(['knob', 'n', ...RK], rows, opts.md));
    if (opts.json) { writeFileSync(resolve(process.cwd(), String(opts.json)), JSON.stringify(out, null, 1)); console.log('wrote ' + opts.json); }
    return;
  }

  const rows = names.map((n) => [n, ...COLS.map((k) => fmt(frames[n][k], k))]);
  const pooled = pool(names.map((n) => frames[n]));
  rows.push(['POOLED', ...COLS.map((k) => fmt(pooled[k], k))]);
  console.log(table(['frame', ...COLS], rows, opts.md));

  let failed = 0;
  if (opts.baseline) {
    const base = JSON.parse(readFileSync(resolve(process.cwd(), String(opts.baseline)), 'utf8'));
    const shared = names.filter((n) => base.frames?.[n]);
    if (!shared.length) { console.error('no frame names shared with the baseline'); process.exit(2); }
    const pa = pool(shared.map((n) => frames[n])), pb = pool(shared.map((n) => base.frames[n]));
    const RK = ['sharp', 'acut', 'eWidth', 'tileRms', 'farRms', 'darkCh', 'noise', 'speckLo', 'stops', 'p50', 'sat', 'lav'];
    console.log(`\nafter ÷ baseline (${shared.length} shared frames; p1 and gt as absolute values)`);
    const rr = shared.map((n) => [n, ...RK.map((k) => (base.frames[n][k] ? (frames[n][k] / base.frames[n][k]).toFixed(2) : '–')), `${base.frames[n].p1}→${frames[n].p1}`, frames[n].gt.toFixed(2)]);
    rr.push(['POOLED', ...RK.map((k) => (pb[k] ? (pa[k] / pb[k]).toFixed(2) : '–')), `${pb.p1.toFixed(0)}→${pa.p1.toFixed(0)}`, pa.gt.toFixed(2)]);
    console.log(table(['frame', ...RK, 'p1', 'gt%'], rr, opts.md));
    console.log('\ntargets (pooled over the shared frames)');
    for (const t of TARGETS) {
      const v = t.kind === 'ratio' ? (pb[t.key] ? pa[t.key] / pb[t.key] : NaN) : pa[t.key];
      const ok = (t.min === undefined || v >= t.min) && (t.max === undefined || v <= t.max);
      if (!ok) failed++;
      console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${t.label}: ${t.kind === 'ratio' ? v.toFixed(2) + '×' : v.toFixed(2)}`);
    }
    for (const t of FRAME_RULES) {
      const bad = shared.filter((n) => {
        if (t.skip && t.skip.some((x) => n.includes(x))) return false;
        const v = frames[n][t.key], b = base.frames[n][t.key];
        return (t.min !== undefined && v < t.min) || (t.max !== undefined && v > t.max) || (t.ratioMin !== undefined && b > 0 && v / b < t.ratioMin) || (t.drop !== undefined && b !== undefined && v < b - t.drop);
      });
      if (bad.length) failed++;
      console.log(`  ${bad.length ? 'FAIL' : 'PASS'}  every frame: ${t.label}${bad.length ? ' — ' + bad.map((n) => `${n} ${base.frames[n][t.key]}→${frames[n][t.key]}`).join(', ') : ''}`);
    }
  }
  if (opts.json) {
    writeFileSync(resolve(process.cwd(), String(opts.json)), JSON.stringify({ frames, pooled }, null, 1));
    console.log('wrote ' + opts.json);
  }
  if (opts.gate && failed) process.exit(1);
}
if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) main();
