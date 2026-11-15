// From terrain to drawing. WORLD.md §10's style brief is an old hand-drawn chart, so this file makes
// very little raster (vellum, the sea's wash, the lakes, the ice, a faint shade on the high ranges)
// and a great deal of ink: the coast and its water lining, hachures down every steep slope, hill
// signs, rivers as banked bands, plant marks whose number and green follow the lushness ramp, the
// Fold's ribbon. bake-client.js draws what this file hands it.
import { SHEET, SEED, LANDMARKS, FOLD, SEA_WAYS, WATERS, HOME } from './canon.mjs';
import { GS } from './terrain.mjs';
import { clamp, lerp, smoothstep, mulberry32, makeNoise, isolines, simplify, edt, boxBlur, arcLengths, nearestOnPolyline, resample, spline } from './lib/util.mjs';

const mix3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const PAPER = [231, 224, 216], LAV = [190, 182, 224], PAPER_EDGE = [205, 196, 204];
// the sea: night-violet washes, darkest offshore, a pale lavender halo at the coast (WORLD.md §10)
const SEA_STOPS = [[0, [170, 164, 226]], [0.6, [142, 140, 202]], [2.0, [116, 116, 180]], [5.5, [94, 94, 158]], [14, [75, 73, 137]], [40, [59, 57, 118]], [110, [49, 47, 103]]];
const seaCol = (d) => {
  for (let i = 1; i < SEA_STOPS.length; i++) if (d <= SEA_STOPS[i][0]) { const a = SEA_STOPS[i - 1], b = SEA_STOPS[i]; return mix3(a[1], b[1], (d - a[0]) / (b[0] - a[0])); }
  return SEA_STOPS[SEA_STOPS.length - 1][1];
};

export const G = { CONIFER: 0, BROADLEAF: 1, CANOPY: 2, MANGROVE: 3, SWAMP: 4, PALM: 5, ACACIA: 6, MOSS: 7, HEATH: 8, GRASS: 9, SCRUB: 10, DUNE: 11, REED: 12, PAPYRUS: 13, GRAVEL: 14, WILLOW: 15 };
// How much of the paper the plant marks cover at each lushness step (0 the Mossmere, 15 the Inkwood):
// a trace, then a steady climb. The page's renders are checked against this by eye at the whole-world view.
const COVER = [0.004, 0.025, 0.04, 0.065, 0.1, 0.12, 0.14, 0.18, 0.2, 0.23, 0.27, 0.3, 0.36, 0.46, 0.6, 0.84];
const coverAt = (L) => { const a = clamp(L, 0, 15), i = Math.min(14, Math.floor(a)); return lerp(COVER[i], COVER[i + 1], a - i); };

export function buildInk(T, log = () => {}) {
  const { W, H, N, x0, y0, UW, UH, cx, cy, gi, gj, sd, sea, dSea, dLand, lakeF, lakeId, lakes, h, mount, ice, iceRaw, rain } = T;
  const nzP = makeNoise(SEED + 11), nzV = makeNoise(SEED + 12), nzW = makeNoise(SEED + 13);
  const rnd = mulberry32(SEED + 14);
  const t0 = Date.now();
  const lap = (s) => log(`  [${((Date.now() - t0) / 1000).toFixed(1)}s] ${s}`);
  // the map's window: sea runs to the neatline, the border band beyond it is plain vellum
  const win = [x0 + SHEET.NEAT, y0 + SHEET.NEAT, x0 + UW - SHEET.NEAT, y0 + UH - SHEET.NEAT];
  const inWin = (x, y, m = 0) => x > win[0] + m && x < win[2] - m && y > win[1] + m && y < win[3] - m;
  const cellAt = (x, y) => clamp(Math.round(gj(y)), 0, H - 1) * W + clamp(Math.round(gi(x)), 0, W - 1);
  const d2 = (x, y, ax, ay) => (x - ax) * (x - ax) + (y - ay) * (y - ay);

  // ---- paper
  const paperAt = (x, y) => {
    const mott = nzP.fbm(x / 150, y / 150, 3), north = 1 - smoothstep(280, 900, y);
    const wash = clamp(0.16 + 0.14 * north + 0.11 * mott + 0.05 * nzP.fbm(x / 38 + 9, y / 38, 2), 0, 1);
    let c = mix3(PAPER, LAV, wash);
    const edge = Math.min(x - x0, y - y0, x0 + UW - x, y0 + UH - y);
    c = mix3(c, PAPER_EDGE, 0.45 * smoothstep(20, 0, edge + 6 * nzP.fbm(x / 30, y / 30, 2)));
    return c;
  };
  const grainAt = (x, y) => 1 + 0.02 * nzP.fbm(x / 1.9, y / 1.9, 2) + 0.012 * nzP.n(x / 0.9, y / 13) + 0.01 * nzP.n(x / 17, y / 1.1);

  // ---- relief: slope from the heights, in metres, so a plateau is flat and a range is steep
  const zr = new Float32Array(N);
  for (let k = 0; k < N; k++) zr[k] = sea[k] ? 0 : Math.max(0, h[k]) * 0.011;
  const zs = boxBlur(zr, W, H, 1, 2);
  const Lx = -0.542, Ly = -0.542, Lz = 0.643;
  const slopeAt = (k) => [(zs[k + 1] - zs[k - 1]) * GS * 0.5, (zs[k + W] - zs[k - W]) * GS * 0.5];

  // ---- drawn water: bands as wide as the rivers are inked, so plant marks keep to the banks
  const bankMask = new Uint8Array(N), siltMask = new Uint8Array(N), inkMask = new Uint8Array(N), thinMask = new Uint8Array(N);
  const ribbonMask = new Uint8Array(N), stairMask = new Uint8Array(N), gorgeMask = new Uint8Array(N), fallMask = new Uint8Array(N);
  const stamp = (m, pts, rad) => T.splat(pts, rad, (k) => { m[k] = 1; });
  for (const r of T.rivers) {
    const wide = r.cls === 'braided' ? 4.6 : null;
    stamp(bankMask, r.pts, (p) => (wide || p[3] / 2) + 0.01);
    if (r.cls === 'great' || r.cls === 'arm') stamp(siltMask, r.pts, (p) => p[3] / 2 + 0.01);
    if (r.cls === 'black' || r.cls === 'seasonal') stamp(inkMask, r.pts, (p) => p[3] / 2 + 0.01);
    if (r.cls === 'braided') stamp(thinMask, r.pts, 4.6);
  }
  for (const st of T.streams) if (!st.wadi) for (const p of st.pts) bankMask[cellAt(p[0], p[1])] = 1;
  for (const c of T.canals) stamp(bankMask, c.dense, 1.15);
  {
    const rush = T.riverById.rush, sweet = T.riverById.sweetwater, pyre = T.riverById.pyre, fall = T.riverById.fallway;
    stamp(ribbonMask, rush.pts.filter((p) => p[0] > 268), 0.3); stamp(ribbonMask, sweet.pts, 0.3);
    stamp(stairMask, rush.pts.filter((p) => p[0] > 212 && p[0] < 268), 0.3);
    stamp(gorgeMask, pyre.pts.filter((p) => p[1] > 538 && p[1] < 606), 0.3);
    stamp(fallMask, fall.pts.filter((p) => p[0] < 300), 0.3);
  }
  const U = (m) => { const d = edt(m, W, H); for (let k = 0; k < N; k++) d[k] /= GS; return d; }; // units
  const dBank = U(bankMask), dSilt = U(siltMask), dInk = U(inkMask), dThin = U(thinMask), dRibbon = U(ribbonMask), dStair = U(stairMask), dGorge = U(gorgeMask), dFall = U(fallMask);
  lap('water distances');

  // ---- the base raster
  const base = new Uint8ClampedArray(N * 4);
  for (let j = 0; j < H; j++) {
    const y = cy(j);
    for (let i = 0; i < W; i++) {
      const k = j * W + i, x = cx(i), o = k * 4;
      const paper = paperAt(x, y);
      let c;
      const landness = clamp(sd[k] * GS * 0.9 + 0.5, 0, 1);
      const inside = smoothstep(-0.6, 0.6, Math.min(x - win[0], y - win[1], win[2] - x, win[3] - y));
      const fold = smoothstep(FOLD.y0 - 3, FOLD.y0 + 3, y) * smoothstep(FOLD.y1 + 3, FOLD.y1 - 3, y);
      let lc = null;
      if (landness > 0) {
        const north = 1 - smoothstep(280, 900, y), mott = nzP.fbm(x / 150, y / 150, 3);
        lc = mix3(PAPER, LAV, clamp(0.05 + 0.15 * north + 0.05 * mott, 0, 1));
        const hh = h[k];
        // the dry west and the Fold: warm sand; the Shingle Flats: grey gravel; high bare stone: a cool grey
        const dry = smoothstep(0.3, 0.1, rain[k]) * smoothstep(600, 690, y);
        lc = mix3(lc, [236, 221, 198], 0.5 * dry);
        const flats = Math.exp(-(d2(x, y, 405, 548)) / (62 * 62)) * smoothstep(0.26, 0.14, rain[k]);
        lc = mix3(lc, [214, 208, 214], 0.45 * flats);
        lc = mix3(lc, [203, 197, 218], 0.5 * smoothstep(500, 2600, hh) * (1 - 0.5 * smoothstep(660, 760, y)));
        // black water standing under the Orchard Basin's trees (the flooded forest)
        if (x > 500 && x < 870 && y > 810 && y < 1080 && hh < 150) {
          const basin = smoothstep(13.4, 14.5, T.lushAt(x, y)) * smoothstep(150, 60, hh) * smoothstep(0.8, 0.95, rain[k]);
          const patch = smoothstep(0.02, 0.22, nzV.fbm(x / 15 + 20, y / 15, 3) + 0.75 * smoothstep(13, 2, dInk[k]) - 0.25);
          if (basin * patch > 0.01) lc = mix3(lc, [62, 52, 84], 0.62 * basin * patch);
        }
        if (j > 0 && j < H - 1 && i > 0 && i < W - 1) {
          const [gx, gy] = slopeAt(k), s = Math.hypot(gx, gy);
          const rel = (-gx * Lx - gy * Ly + Lz) / Math.sqrt(s * s + 1) - Lz;
          const ic = ice[k];
          if (ic > 0.3) lc = mix3(lc, [250, 250, 255], smoothstep(0.3, 0.62, ic) * (iceRaw[k] === 1 || ic > 0.8 ? 1 : 0.9));
          // a faint shade on the dark side of real slopes only; the hachures carry the relief
          if (rel < 0) lc = mix3(lc, ic > 0.5 ? [196, 198, 236] : [104, 94, 140], clamp(-rel * 0.85, 0, ic > 0.5 ? 0.22 : 0.26) * smoothstep(0.12, 0.5, s));
        }
        const lf = lakeF[k];
        if (lf > -0.6) {
          const lk = lakes[(lakeId[k] || 1) - 1], t = clamp(lf * GS * 0.9 + 0.5, 0, 1);
          let wc;
          if (lk && lk.kind === 'pan') wc = [240, 234, 226];
          else if (lk && lk.kind === 'mere') wc = [44, 36, 62];
          else { const deep = lk && lk.id === 'pallid' ? [38, 35, 84] : [78, 76, 140]; wc = mix3([182, 176, 236], deep, smoothstep(0, lk && lk.kind === 'tarn' ? 1.2 : 5, lf)); }
          lc = mix3(lc, wc, t);
        }
        lc = mix3(lc, paper, 0.22 * fold);
      }
      let sc = null;
      if (landness < 1) {
        const d = dSea[k];
        const blot = 1 + 0.06 * nzW.fbm(x / 46, y / 46, 3) + 0.03 * nzW.fbm(x / 9, y / 9, 2);
        const col = seaCol(d * (0.86 + 0.3 * nzW.fbm(x / 60 + 3, y / 60, 2)));
        sc = [col[0] * blot, col[1] * blot, col[2] * blot];
        sc = mix3(sc, [150, 146, 204], 0.2 * fold);
      }
      c = lc && sc ? mix3(sc, lc, landness) : lc || sc;
      c = mix3(paper, c, inside);
      const g = grainAt(x, y);
      base[o] = c[0] * g; base[o + 1] = c[1] * g; base[o + 2] = c[2] * g; base[o + 3] = 255;
    }
  }
  lap('base raster');

  // the blank vellum the page shows where no sheet is pinned (2 units a pixel)
  const PS = 2, pw = Math.round(UW / PS), ph = Math.round(UH / PS);
  const paper = new Uint8ClampedArray(pw * ph * 4);
  for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i++) {
    const x = x0 + (i + 0.5) * PS, y = y0 + (j + 0.5) * PS, c = paperAt(x, y), g = grainAt(x, y), o = (j * pw + i) * 4;
    paper[o] = c[0] * g; paper[o + 1] = c[1] * g; paper[o + 2] = c[2] * g; paper[o + 3] = 255;
  }

  // ---- lines from fields
  const toChart = (line) => line.map((p) => [x0 + (p[0] + 0.5) / GS, y0 + (p[1] + 0.5) / GS]);
  const flat = (lines, tol) => lines.map((l) => { const s = simplify(toChart(l), tol); const a = new Array(s.length * 2); for (let i = 0; i < s.length; i++) { a[i * 2] = +s[i][0].toFixed(2); a[i * 2 + 1] = +s[i][1].toFixed(2); } return a; }).filter((a) => a.length >= 4);
  const coast = flat(isolines(sd, W, H, 0), 0.1);
  // water lining: fine lines parallel to the shore, each fainter than the last
  const dSeaS = boxBlur(dSea, W, H, 1, 1);
  const lining = [1.3, 3.0, 5.2, 8.0].map((lv) => flat(isolines(dSeaS, W, H, lv), 0.16).filter((a) => a.length > 10));
  const lakeMaskF = new Float32Array(N);
  for (let k = 0; k < N; k++) lakeMaskF[k] = lakeF[k] > -100 ? lakeF[k] : -3;
  const isPanCell = (x, y) => { const k = cellAt(x, y); for (const q of [k, k + 1, k - 1, k + W, k - W, k + 2, k - 2, k + 2 * W, k - 2 * W]) if (lakeId[q] && lakes[lakeId[q] - 1].kind === 'pan') return true; return false; };
  const lakeShores = [], panShores = [];
  for (const l of isolines(lakeMaskF, W, H, 0).map(toChart)) { const s = simplify(l, 0.08); if (s.length < 4) continue; const a = s.flatMap((p) => [+p[0].toFixed(2), +p[1].toFixed(2)]); (isPanCell(l[0][0], l[0][1]) ? panShores : lakeShores).push(a); }
  const lakeLining = flat(isolines(lakeMaskF, W, H, 1.0), 0.12).filter((a) => a.length > 12);
  // the ice: one crisp edge for the field and its tongues, another for the peaks' snow
  const crownF = new Float32Array(N), snowF = new Float32Array(N);
  for (let k = 0; k < N; k++) { crownF[k] = iceRaw[k] === 1 ? 1 : 0; snowF[k] = iceRaw[k] > 0 && iceRaw[k] < 1 ? 1 : 0; }
  const iceEdge = flat(isolines(boxBlur(crownF, W, H, 1, 1), W, H, 0.5), 0.12).filter((a) => a.length > 10);
  const snowEdge = flat(isolines(boxBlur(snowF, W, H, 1, 1), W, H, 0.5), 0.14).filter((a) => a.length > 12);
  lap('coast, lining, shores, ice');

  // ---- rivers: cut where they run through lakes, under the ice or out to sea
  const cut = (pts) => {
    const parts = []; let cur = [];
    for (const p of pts) {
      const k = cellAt(p[0], p[1]);
      const hidden = lakeF[k] > 0.25 || (sea[k] && sd[k] < -0.5) || iceRaw[k] === 1;
      if (hidden) { if (cur.length > 1) parts.push(cur); cur = []; } else cur.push(p);
    }
    if (cur.length > 1) parts.push(cur);
    return parts;
  };
  const rivers = [];
  for (const r of T.rivers) for (const part of cut(r.pts)) rivers.push({ id: r.id, cls: r.cls, pts: part.flatMap((p) => [+p[0].toFixed(2), +p[1].toFixed(2), +p[3].toFixed(2)]) });
  // the Thin Water braids over its sand: threads that part and meet
  const braid = [];
  {
    const tw = T.riverById.thinWater, s = arcLengths(tw.pts), L = s[s.length - 1];
    for (let c = 0; c < 5; c++) {
      const line = [];
      tw.pts.forEach((p, i) => {
        if (i % 2) return;
        const a = tw.pts[Math.max(0, i - 3)], b = tw.pts[Math.min(tw.pts.length - 1, i + 3)];
        let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
        const env = smoothstep(0.14, 0.26, s[i] / L) * (0.45 + 0.55 * smoothstep(1, 0.86, s[i] / L));
        const off = env * (1.7 * Math.sin(s[i] / (5.2 + c * 1.5) + c * 2.1) + 1.0 * Math.sin(s[i] / (2.6 + c * 0.7) + c * 4.4) + (c - 2) * 1.25);
        line.push(+(p[0] - ty * off).toFixed(2), +(p[1] + tx * off).toFixed(2));
      });
      braid.push(line);
    }
  }
  const streams = [], wadis = [];
  for (const st of T.streams) {
    const a = st.pts.flatMap((p) => [+p[0].toFixed(2), +p[1].toFixed(2), +clamp(0.036 * Math.pow(p[2], 0.42), 0.16, 0.7).toFixed(2)]);
    (st.wadi ? wadis : streams).push(a);
  }
  const canals = T.canals.map((c) => ({ id: c.id, pts: c.pts.flat(), locks: c.locks }));
  // falls and rapids as short bars across the stream; the gorge as ticks down both walls
  const tangentAt = (pts, i) => { const a = pts[Math.max(0, i - 3)], b = pts[Math.min(pts.length - 1, i + 3)]; const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; };
  const falls = [], gorge = [];
  const barsAlong = (id, test, every, len) => {
    const r = T.riverById[id], s = arcLengths(r.pts); let next = 0;
    r.pts.forEach((p, i) => { if (!test(p) || s[i] < next) return; next = s[i] + every; const [tx, ty] = tangentAt(r.pts, i), w = p[3] / 2 + len; falls.push(+(p[0] - ty * w).toFixed(2), +(p[1] + tx * w).toFixed(2), +(p[0] + ty * w).toFixed(2), +(p[1] - tx * w).toFixed(2)); });
  };
  barsAlong('fallway', (p) => p[0] < 300 && p[0] > 259, 2.6, 0.5);
  barsAlong('rush', (p) => p[0] > 231 && p[0] < 263, 2.0, 0.6);
  barsAlong('sluiceRun', (p) => p[1] < 208 && p[1] > 193, 2.2, 0.45);
  barsAlong('sweetwater', (p) => p[1] > 986 && p[1] < 995, 2.4, 0.5);
  barsAlong('lockwater', (p) => p[0] > 536 && p[0] < 562, 2.6, 0.4);
  {
    const r = T.riverById.pyre, s = arcLengths(r.pts); let next = 0;
    r.pts.forEach((p, i) => {
      if (p[1] > 603 || p[1] < 541 || s[i] < next) return; next = s[i] + 1.15;
      const [tx, ty] = tangentAt(r.pts, i);
      for (const side of [-1, 1]) { const a = p[3] / 2 + 0.75, b = a + 1.5 + 1.6 * rnd(); gorge.push(+(p[0] - ty * a * side).toFixed(2), +(p[1] + tx * a * side).toFixed(2), +(p[0] - ty * b * side + tx * 0.5).toFixed(2), +(p[1] + tx * b * side + ty * 0.5).toFixed(2)); }
    });
  }
  // the barge pilots' mile ticks along the canal and the barge road (reach IV's hand)
  const mileTicks = [];
  {
    const along = (pts, sFrom, sTo, every, wOf) => {
      const s = arcLengths(pts); let n = 0, next = sFrom;
      pts.forEach((p, i) => { if (s[i] < next || s[i] > sTo) return; next = s[i] + every; n++; const [tx, ty] = tangentAt(pts, i), a = wOf(p) + 0.5, b = a + (n % 5 === 0 ? 2.0 : 1.1); mileTicks.push(+(p[0] + ty * a).toFixed(2), +(p[1] - tx * a).toFixed(2), +(p[0] + ty * b).toFixed(2), +(p[1] - tx * b).toFixed(2)); });
    };
    const silt = T.riverById.siltway, ss = arcLengths(silt.pts);
    along(silt.pts, nearestOnPolyline(silt.pts, 398, 1094, ss).s + 2, nearestOnPolyline(silt.pts, 842, 1070, ss).s, 6, (p) => p[3] / 2);
    const canal = T.canals.find((c) => c.id === 'straightCanal');
    along(canal.dense, 3, 1e9, 6, () => 1.0);
  }
  lap('rivers');

  // ---- hachures: short strokes down the fall of every real slope, heavier on the shaded side
  const hach = [];
  const hachDens = new Float32Array(N);
  // the Great Step is drawn by its own sign (one lip, hachures falling west), so the slope strokes stay off it
  const stepMask = new Uint8Array(N);
  T.splat(T.stepLine.filter((p) => p[1] > 700 && p[1] < 996), 7.5, (k) => { stepMask[k] = 1; });
  {
    const sp = 0.98;
    for (let y = win[1] + 1; y < win[3] - 1; y += sp) for (let x = win[0] + 1; x < win[2] - 1; x += sp) {
      const px = x + (rnd() - 0.5) * sp, py = y + (rnd() - 0.5) * sp, u = rnd(), k = cellAt(px, py);
      if (sea[k] || lakeId[k] || dBank[k] < 0.5 || stepMask[k]) continue;
      const [gx, gy] = slopeAt(k), s = Math.hypot(gx, gy);
      if (s < 0.15 || (iceRaw[k] === 1 && u > 0.3)) continue;
      const kingdom = px > 330 && px < 640 && py > 160 && py < 470 ? 1.35 : 1; // the court surveyors' careful hand
      if (u > (s - 0.13) * 1.5 * kingdom) continue;
      const len = clamp(0.8 + 2.3 * s, 1, 3.7), nx = gx / s, ny = gy / s;
      const rel = (-gx * Lx - gy * Ly + Lz) / Math.sqrt(s * s + 1) - Lz;
      const ic = iceRaw[k] > 0 ? 1 : 0;
      hach.push(px - nx * len * 0.5, py - ny * len * 0.5, px + nx * len * 0.5, py + ny * len * 0.5, clamp(0.24 + 0.5 * s + (rel < 0 ? 0.24 : -0.04), 0.14, 0.98) * (ic ? 0.5 : 1), ic);
      hachDens[k] = 1;
    }
  }
  const hachNear = boxBlur(hachDens, W, H, 3, 1);
  lap(`hachures: ${hach.length / 6}`);

  // ---- hill signs: a small inked hump on every rounded top the hachures leave bare
  const hills = [];
  const hillMask = new Uint8Array(N);
  {
    const hb = boxBlur(h, W, H, 4, 2), R = 9; // cells
    for (let j = R + 2; j < H - R - 2; j += 2) for (let i = R + 2; i < W - R - 2; i += 2) {
      const k = j * W + i;
      if (sea[k] || lakeId[k] || iceRaw[k] > 0 || !inWin(cx(i), cy(j), 3)) continue;
      const v = hb[k]; if (v < 60) continue;
      let top = true, mn = v;
      for (let dj = -R; dj <= R && top; dj += 3) for (let di = -R; di <= R; di += 3) { const q = hb[k + dj * W + di]; if (q > v + 1e-3) { top = false; break; } if (q < mn) mn = q; }
      if (!top) continue;
      const prom = v - mn;
      if (prom < 22 || hachNear[k] > 0.32 || dBank[k] < 2.2 || dLand[k] < 2) continue;
      const s = clamp(0.62 + prom / 260, 0.62, 1.7);
      hills.push(+cx(i).toFixed(2), +cy(j).toFixed(2), +s.toFixed(2));
      T.splat([[cx(i), cy(j)]], 1.9 * s, (q) => { hillMask[q] = 1; });
    }
  }
  lap(`hill signs: ${hills.length / 3}`);

  // ---- plant marks. How many: the lushness ramp (COVER). Where and what: each country's own habitat.
  // Green is only ever here, in the ink of living things (WORLD.md §10).
  const keepOut = [];
  for (const l of LANDMARKS) if (l.at && ['ruins', 'town', 'stilts', 'hulls', 'tower', 'garden', 'caps', 'crystals'].includes(l.g)) keepOut.push([l.at[0], l.at[1], (l.r || 3) * 0.8 + 1.4]);
  for (const w of [HOME, ...WATERS]) keepOut.push([w.vg[0], w.vg[1], 4.4], [w.at[0], w.at[1], 2.6]);
  // FILL: how much paper a kind of tree hides when one stands at every point of the placing grid
  const FILL = new Float32Array(16).fill(0.3);
  FILL[G.CONIFER] = 0.26; FILL[G.BROADLEAF] = 0.5; FILL[G.CANOPY] = 0.78; FILL[G.MANGROVE] = 0.36; FILL[G.SWAMP] = 0.48; FILL[G.PALM] = 0.22; FILL[G.WILLOW] = 0.24; FILL[G.ACACIA] = 0.2;
  const trunkOf = (x, y, k, L) => { // -> [kind of tree, chance that one stands here]
    const R = rain[k], hh = h[k], dl = dLand[k], dw = dBank[k];
    const cov = coverAt(L);
    if (y < FOLD.y0 + 8) {
      const fade = smoothstep(FOLD.y0 + 8, FOLD.y0 - 22, y);
      if (R > 0.62) { // the Spine's wet west face: firs on the fjord walls and up the stream valleys, little between
        if (dThin[k] < 12) return [G.WILLOW, dThin[k] < 6.6 ? 0.6 * smoothstep(4.2, 5.2, dThin[k]) + 0.4 : smoothstep(12, 7.5, dThin[k])];
        const wall = Math.max(smoothstep(7.5, 1.2, dl), 0.8 * smoothstep(4.5, 0.8, dw));
        return [G.CONIFER, fade * (cov / FILL[G.CONIFER]) * (0.2 + 1.5 * wall) * (1 - smoothstep(700, 1150, hh))];
      }
      // the gorge: pines on the rim, hanging forest where the spray reaches
      const gr = smoothstep(19, 3, dGorge[k]);
      if (gr > 0.02) return [nzV.n(x / 3, y / 3) > 0.1 ? G.BROADLEAF : G.CONIFER, gr];
      const fl = smoothstep(6, 1.5, dFall[k]); // spray firs by the Fallway's falls
      if (fl > 0.05 && x < 300) return [G.CONIFER, 0.45 * fl];
      if (x > 640) { // the Eastern Downs: heath, with a few trees along the streams
        const t = 0.05 + 0.3 * smoothstep(5, 1, dw) + 0.12 * smoothstep(780, 860, x);
        return [nzV.n(x / 6 + 3, y / 6) > 0.2 ? G.BROADLEAF : G.CONIFER, fade * t * (1 - smoothstep(600, 900, hh))];
      }
      // the stone highland: cedar spires round the Pallid Deep, nothing else stands
      const cedar = Math.exp(-d2(x, y, 377, 430) / (34 * 34)) * smoothstep(0.6, 2, dw);
      return [G.CONIFER, 0.2 * cedar];
    }
    if (y < FOLD.y1 + 4) return [G.ACACIA, 0]; // the Fold is drawn by its own marks
    const fade = smoothstep(FOLD.y1 + 2, FOLD.y1 + 14, y);
    const wet = smoothstep(0.26, 0.8, R);
    // the dry west: green only where sea, spray or river water reaches
    let type = G.ACACIA, p = (0.02 + 0.045 * smoothstep(8, 11, L) * smoothstep(0.05, 0.2, R)) * (1 - wet); // thorn trees thicken toward the gate
    if (R < 0.42) {
      const wR = 4.2 + 1.7 * clamp(L - 7, 0, 5), rib = smoothstep(wR, wR * 0.35, dRibbon[k]);
      if (rib > 0.01) { type = nzV.n(x / 3, y / 3 + 9) > 0.32 ? G.PALM : G.BROADLEAF; p = Math.max(p, 0.95 * rib); }
      const spray = smoothstep(17, 4.5, dStair[k]);
      if (spray > 0.01) { type = nzV.n(x / 2.4, y / 2.4) > 0.15 ? G.PALM : G.BROADLEAF; p = Math.max(p, spray); }
      const fen = Math.exp(-d2(x, y, 314, 846) / (30 * 30));
      if (fen > 0.22 && lakeF[k] > -13) { type = G.PALM; p = Math.max(p, 0.4 * fen); }
      if (d2(x, y, 172, 790) < 58 * 58 && dl < 11) { type = G.PALM; p = Math.max(p, smoothstep(11, 5, dl)); } // the reef headlands' palms
      const gate = Math.exp(-d2(x, y, 244, 1008) / (42 * 42)); // strangler figs over the old quays
      if (gate > 0.1 && p < 1.1 * gate) { type = G.BROADLEAF; p = Math.min(1, 1.1 * gate); }
      if (Math.exp(-d2(x, y, 232, 1008) / (56 * 56)) > 0.3 && dl < 14) { type = G.MANGROVE; p = Math.max(p, smoothstep(14, 8, dl)); }
      const sm = smoothstep(4.2, 1.2, dw) * smoothstep(0.1, 0.3, R); // a thin gallery on the lesser streams
      if (sm > 0.02 && p < 0.3) { type = G.BROADLEAF; p = Math.max(p, 0.4 * sm); }
    }
    if (wet > 0.01) { // the wet south: the forest thickens with the ramp, in groves, with glades between
      const clump = smoothstep(-0.3, 0.3, nzV.fbm(x / 26, y / 26, 3) + 0.38 * nzV.fbm(x / 8 + 40, y / 8, 2));
      const river = Math.max(smoothstep(9, 2, dSilt[k]), smoothstep(10, 1.5, dInk[k]), 0.5 * smoothstep(4, 1, dw));
      let t2 = G.BROADLEAF, c = cov * wet * (0.16 + 1.14 * clump);
      c = Math.max(c, cov * 1.25 * river * wet);
      if (L > 13.5 && hh < 170 && R > 0.86) { t2 = G.CANOPY; c = cov * Math.max(0.52 + 0.62 * clump, 1.1 * river); }
      const gap = Math.exp(-d2(x, y, 300, 1070) / (52 * 52));
      if (gap > 0.36 && hh < 90) { t2 = G.SWAMP; c = Math.max(c, 0.4 * gap * (0.4 + 0.8 * clump)); }
      if (dl < 4.2 && hh < 16 && R > 0.42) { t2 = G.MANGROVE; c = Math.max(c, 0.3); }
      if (Math.exp(-d2(x, y, 838, 984) / (30 * 30)) > 0.28 && (dl < 9 || hh < 9)) { t2 = G.MANGROVE; c = Math.max(c, 0.32); }
      const sav = smoothstep(0.62, 0.42, R) * smoothstep(1160, 1230, y); // the Low Horn: dry savanna
      if (sav > 0.02) { c = lerp(c, 0.014, sav); if (nzV.n(x / 2.2, y / 2.2) < sav - 0.3) t2 = G.ACACIA; }
      c *= 1 - 0.5 * smoothstep(700, 1300, hh);
      const pw = c / FILL[t2];
      if (pw > p) { type = t2; p = pw; }
    }
    return [type, fade * p];
  };
  const groundOf = (x, y, k, L) => { // -> [type, probability] for the low marks
    const R = rain[k], hh = h[k], dl = dLand[k], dw = dBank[k];
    if (y < FOLD.y0 + 6) {
      if (dThin[k] < 6.4 && dThin[k] > 0.2) return [G.REED, 0.75];
      if (R > 0.62) return [G.MOSS, 0.1 * smoothstep(8, 2, dl)];
      const flats = Math.exp(-d2(x, y, 405, 548) / (62 * 62));
      if (R < 0.22 && flats > 0.25) return [nzV.n(x / 5, y / 5) > 0.2 ? G.GRASS : G.GRAVEL, 0.3 * flats];
      if (x > 640) return [G.HEATH, 0.3 * (1 - smoothstep(700, 1000, hh))];
      // moss, a trace at the Mossmere and a little more at each water after it
      const near = Math.max(1.1 * Math.exp(-d2(x, y, 520, 305) / (22 * 22)), 1.5 * Math.exp(-d2(x, y, 455, 368) / (28 * 28)), 0.42 * Math.exp(-d2(x, y, 377, 430) / (32 * 32)));
      if (nzV.n(x / 4, y / 4) > 0.3) return [G.GRAVEL, 0.09]; // stone showing through
      return [G.MOSS, (coverAt(L) / 0.07) * (0.08 + 1.0 * near) * (1 - smoothstep(900, 1500, hh))];
    }
    if (y < FOLD.y1 + 4) return [-1, 0];
    const fade = smoothstep(FOLD.y1 + 4, FOLD.y1 + 30, y);
    if (R < 0.3) {
      const fen = Math.exp(-d2(x, y, 316, 846) / (30 * 30));
      if (fen > 0.16 && (lakeF[k] > -8 || (dw < 6 && x > 296))) return [G.PAPYRUS, Math.min(0.5, fen * 1.0)];
      if (R < 0.085 && nzV.n(x / 24, y / 24) > 0.05) return [G.DUNE, 0.12 * fade];
      return [G.SCRUB, fade * (0.07 + 0.2 * smoothstep(0.08, 0.3, R))];
    }
    if (dSilt[k] > 0.4 && dSilt[k] < 3.6) return [G.REED, 0.55]; // the Siltway's floating meadows
    const sav = smoothstep(0.62, 0.42, R) * smoothstep(1160, 1230, y);
    if (sav > 0.05) return [G.GRASS, 0.34 * sav];
    return [G.GRASS, 0.05 * (1 - smoothstep(0.3, 0.7, R))];
  };
  const glyphs = [];
  const place = (sp, trees) => {
    for (let y = win[1] + 1.5; y < win[3] - 1.5; y += sp) for (let x = win[0] + 1.5; x < win[2] - 1.5; x += sp) {
      const px = x + (rnd() - 0.5) * sp * 0.92, py = y + (rnd() - 0.5) * sp * 0.92, u1 = rnd(), u2 = rnd(), u3 = rnd();
      const k = cellAt(px, py);
      if (sea[k] || lakeF[k] > -0.9 || iceRaw[k] > 0) continue;
      const L = clamp(T.lushAt(px, py), 0, 15);
      const [type, p] = trees ? trunkOf(px, py, k, L) : groundOf(px, py, k, L);
      if (type < 0 || p <= 0.004) continue;
      if (u2 > p) continue;
      const [gx, gy] = slopeAt(k), s = Math.hypot(gx, gy);
      if (s > (type === G.CONIFER ? 1.0 : 0.7)) continue;
      const clear = trees ? (type === G.MANGROVE ? 0.5 : 1.25) : 0.7;
      if (dBank[k] < clear || sd[k] < (type === G.MANGROVE ? 0.3 : 1.1)) continue;
      if (hillMask[k] && u1 < 0.8) continue;
      let bad = false;
      for (const q of keepOut) if (d2(px, py, q[0], q[1]) < q[2] * q[2]) { bad = true; break; }
      if (bad) continue;
      const rel = (-gx * Lx - gy * Ly + Lz) / Math.sqrt(s * s + 1) - Lz;
      glyphs.push([px, py, type, 0.84 + 0.34 * u3, clamp(L + (u1 - 0.5) * 1.1, 0, 15), u1, rel]);
    }
  };
  place(2.7, true);
  place(2.3, false);
  glyphs.sort((a, b) => a[1] - b[1]);
  const glyphArr = new Float32Array(glyphs.length * 7);
  glyphs.forEach((g, i) => glyphArr.set(g, i * 7));
  lap(`plant marks: ${glyphs.length}`);

  // ---- stipple on the ice
  const iceDots = [];
  for (let n = 0; n < 26000; n++) {
    const x = 236 + rnd() * 136, y = 150 + rnd() * 160, k = cellAt(x, y);
    if (iceRaw[k] === 1 && !sea[k]) iceDots.push(+x.toFixed(2), +y.toFixed(2));
  }
  // ---- the Fold: rows of one repeated mark, waves on the sea and dunes on the land, coast to coast
  const fold = [];
  for (let row = 0, y = FOLD.y0 + 9; y <= FOLD.y1 - 7; y += 7.6, row++) for (let x = win[0] + 7 + (row % 2) * 4.6; x < win[2] - 6; x += 9.2) {
    const px = x + (rnd() - 0.5) * 1.1, py = y + (rnd() - 0.5) * 0.9, k = cellAt(px, py);
    if (sea[k]) { if (dSea[k] > 2.2) fold.push(+px.toFixed(1), +py.toFixed(1), 0); }
    else if (lakeF[k] < -1 && dBank[k] > 1.6 && dLand[k] > 1.8 && iceRaw[k] === 0) fold.push(+px.toFixed(1), +py.toFixed(1), 1);
  }
  // its two edges: a pleat drawn right across the sheet
  const pleat = [FOLD.y0, FOLD.y1].map((yy, e) => {
    const line = [];
    for (let x = win[0]; x <= win[2] + 0.1; x += 3.4) line.push(+x.toFixed(1), +(yy + 1.5 * nzP.fbm(x / 34 + e * 9, 3.3 + e, 2) + ((Math.round(x / 3.4) % 2) ? 0.55 : -0.55)).toFixed(2));
    return line;
  });

  // resolve landmarks that sit on rivers
  const landmarks = LANDMARKS.map((l) => {
    if (l.g !== 'posts') return l;
    const r = T.riverById[l.river], s = arcLengths(r.pts);
    const a = nearestOnPolyline(r.pts, l.from[0], l.from[1], s).s, b = nearestOnPolyline(r.pts, l.to[0], l.to[1], s).s;
    const pts = []; let j = 0;
    for (let d = a + l.every / 2; d < b; d += l.every) {
      while (j < r.pts.length - 2 && s[j + 1] < d) j++;
      const p = r.pts[j], q = r.pts[Math.min(r.pts.length - 1, j + 2)];
      let tx = q[0] - p[0], ty = q[1] - p[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const off = p[3] / 2 + 1.5;
      pts.push([+(p[0] - ty * off).toFixed(2), +(p[1] + tx * off).toFixed(2)]);
    }
    return { g: 'posts', pts };
  });

  // the Great Step's lip, for the bake's escarpment sign: [x, y, strength]
  const step = [];
  for (const p of resample(T.stepLine, 1.0)) {
    const k = cellAt(p[0], p[1]);
    const wn = smoothstep(696, 730, p[1]) * (1 - smoothstep(950, 1000, p[1]));
    step.push([+p[0].toFixed(2), +p[1].toFixed(2), dBank[k] < 1.6 || lakeF[k] > -1 ? 0 : +wn.toFixed(2)]);
  }
  // the Seam: the Inkwood's black water keeps to its own bank for miles below the confluence
  const seam = [];
  {
    const r = T.riverById.siltway, s = arcLengths(r.pts), a = nearestOnPolyline(r.pts, 758, 1068, s);
    for (let i = a.i; i < r.pts.length && s[i] - a.s < 17; i++) { const p = r.pts[i], [tx, ty] = tangentAt(r.pts, i), t = (s[i] - a.s) / 17, w = p[3] / 2; seam.push(+(p[0] + ty * w * (0.62 - 0.1 * t)).toFixed(2), +(p[1] - tx * w * (0.62 - 0.1 * t)).toFixed(2), +(w * 0.62 * (1 - t * t)).toFixed(2)); }
  }
  const seaWays = SEA_WAYS.map((p) => spline(p, 3).flat().map((v) => +v.toFixed(1)));
  return { base, paper, pw, ph, glyphArr, hachArr: new Float32Array(hach), win,
    vec: { coast, lining, lakeShores, panShores, lakeLining, iceEdge, snowEdge, rivers, braid, streams, wadis, canals, falls, gorge, mileTicks, iceDots, fold, pleat, hills, landmarks, step, seam, seaWays, win } };
}
