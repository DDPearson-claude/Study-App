// From terrain to drawing: the washed base raster (paper, sea wash, land, relief shading, ice,
// lakes) and every vector mark the bake page inks on top of it (coast, water lining, rivers,
// hachures, plant marks, the Fold's ribbon). Colours follow WORLD.md §10's style brief.
import { SHEET, SEED, CORNERS, CANALS, LANDMARKS, RIVERS } from './canon.mjs';
import { GS } from './terrain.mjs';
import { clamp, lerp, smoothstep, mulberry32, makeNoise, isolines, simplify, edt, boxBlur, arcLengths, nearestOnPolyline, resample, spline } from './lib/util.mjs';

const mix3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const PAPER = [230, 223, 219], LAV = [183, 174, 224], PAPER_EDGE = [198, 188, 204];
const SEA_STOPS = [[0, [172, 167, 228]], [0.7, [134, 134, 196]], [2.4, [102, 103, 166]], [7, [80, 80, 142]], [20, [61, 59, 119]], [55, [47, 45, 102]], [130, [40, 38, 89]]];
const seaCol = (d) => {
  for (let i = 1; i < SEA_STOPS.length; i++) if (d <= SEA_STOPS[i][0]) { const a = SEA_STOPS[i - 1], b = SEA_STOPS[i]; return mix3(a[1], b[1], (d - a[0]) / (b[0] - a[0])); }
  return SEA_STOPS[SEA_STOPS.length - 1][1];
};

export const G = { CONIFER: 0, BROADLEAF: 1, CANOPY: 2, MANGROVE: 3, SWAMP: 4, PALM: 5, ACACIA: 6, MOSS: 7, HEATH: 8, GRASS: 9, SCRUB: 10, DUNE: 11, REED: 12, PAPYRUS: 13 };

export function buildInk(T, log = () => {}) {
  const { W, H, N, x0, y0, UW, UH, cx, cy, gi, gj, sd, sea, dSea, dLand, lakeF, lakeId, lakes, h, ice, iceRaw, rain } = T;
  const nzP = makeNoise(SEED + 11), nzV = makeNoise(SEED + 12), nzW = makeNoise(SEED + 13);
  const rnd = mulberry32(SEED + 14);
  const t0 = Date.now();
  const lap = (s) => log(`  [${((Date.now() - t0) / 1000).toFixed(1)}s] ${s}`);

  // ---- paper and wash
  const paperAt = (x, y) => {
    const mott = nzP.fbm(x / 150, y / 150, 3), north = 1 - smoothstep(280, 900, y);
    const wash = clamp(0.2 + 0.13 * north + 0.12 * mott + 0.05 * nzP.fbm(x / 38 + 9, y / 38, 2), 0, 1);
    let c = mix3(PAPER, LAV, wash);
    const edge = Math.min(x - x0, y - y0, x0 + UW - x, y0 + UH - y);
    c = mix3(c, PAPER_EDGE, 0.5 * smoothstep(34, 0, edge + 8 * nzP.fbm(x / 30, y / 30, 2)));
    return c;
  };
  const grainAt = (x, y) => 1 + 0.02 * nzP.fbm(x / 1.9, y / 1.9, 2) + 0.012 * nzP.n(x / 0.9, y / 13) + 0.01 * nzP.n(x / 17, y / 1.1);
  const washAt = (x, y) => { // how much sea wash reaches this paper, 0..1
    const edge = Math.min(x - x0, y - y0, x0 + UW - x, y0 + UH - y);
    const nz = 16 * nzW.fbm(x / 70, y / 70, 3) + 5 * nzW.fbm(x / 17, y / 17, 2);
    let a = smoothstep(16, 44, edge + nz);
    for (const key of Object.keys(CORNERS)) { const c = CORNERS[key]; a *= smoothstep(c[2] - 26, c[2] + 14, Math.hypot(x - c[0], y - c[1]) + nz * 0.9); }
    return a;
  };

  // ---- relief shading
  const zr = new Float32Array(N);
  for (let k = 0; k < N; k++) zr[k] = sea[k] ? 0 : 13 * Math.pow(Math.max(0, h[k]) / 1000, 0.62);
  const zs = boxBlur(zr, W, H, 1, 2);
  const Lx = -0.542, Ly = -0.542, Lz = 0.643;
  const slopeAt = (k) => { const gx = (zs[k + 1] - zs[k - 1]) * GS * 0.5, gy = (zs[k + W] - zs[k - W]) * GS * 0.5; return [gx, gy]; };

  const base = new Uint8ClampedArray(N * 4);
  for (let j = 0; j < H; j++) {
    const y = cy(j);
    for (let i = 0; i < W; i++) {
      const k = j * W + i, x = cx(i), o = k * 4;
      const paper = paperAt(x, y);
      let c;
      const landness = clamp(sd[k] * GS * 0.9 + 0.5, 0, 1);
      // land
      let lc = null;
      if (landness > 0) {
        const north = 1 - smoothstep(280, 900, y), mott = nzP.fbm(x / 150, y / 150, 3);
        lc = mix3(PAPER, LAV, clamp(0.07 + 0.16 * north + 0.06 * mott, 0, 1));
        const hh = h[k];
        const dry = smoothstep(0.3, 0.08, rain[k]) * smoothstep(600, 700, y);
        lc = mix3(lc, [238, 222, 204], 0.5 * dry);
        lc = mix3(lc, [198, 192, 216], 0.55 * smoothstep(250, 2600, hh) * (1 - smoothstep(660, 760, y) * 0.6));
        if (j > 0 && j < H - 1 && i > 0 && i < W - 1) {
          const [gx, gy] = slopeAt(k);
          const inv = 1 / Math.sqrt(gx * gx + gy * gy + 1);
          const rel0 = (-gx * Lx - gy * Ly + Lz) * inv - Lz, slope = Math.sqrt(gx * gx + gy * gy);
          const rel = Math.sign(rel0) * Math.pow(Math.abs(rel0), 0.72);
          const ic = ice[k];
          if (ic > 0.02) lc = mix3(lc, [247, 247, 253], Math.min(1, ic) * 0.93);
          if (rel < 0) lc = mix3(lc, ic > 0.5 ? [150, 150, 205] : [74, 64, 116], clamp(-rel * (ic > 0.5 ? 1.1 : 1.3), 0, 0.56));
          else lc = mix3(lc, [250, 246, 244], clamp(rel * 0.95, 0, 0.42));
          lc = mix3(lc, [92, 80, 122], clamp(slope * 0.34 - 0.03, 0, 0.44) * (1 - Math.min(1, ic) * 0.7));
        }
        const lf = lakeF[k];
        if (lf > -0.6) {
          const lk = lakes[(lakeId[k] || 1) - 1], t = clamp(lf * GS * 0.9 + 0.5, 0, 1);
          let wc;
          if (lk && lk.kind === 'pan') wc = [232, 226, 226];
          else { const deep = lk && lk.id === 'pallid' ? [40, 37, 86] : [74, 72, 134]; wc = mix3([176, 170, 232], deep, smoothstep(0, lk && lk.kind === 'tarn' ? 1.2 : 5, lf)); }
          lc = mix3(lc, wc, t);
        }
      }
      // sea
      let sc = null;
      if (landness < 1) {
        const d = dSea[k];
        const blot = 1 + 0.07 * nzW.fbm(x / 46, y / 46, 3) + 0.035 * nzW.fbm(x / 9, y / 9, 2);
        const col = seaCol(d * (0.86 + 0.3 * nzW.fbm(x / 60 + 3, y / 60, 2)));
        const a = washAt(x, y);
        // a wash dries darker at its edge
        const rim = smoothstep(0.02, 0.3, a) * (1 - smoothstep(0.3, 0.75, a));
        sc = mix3(paper, [col[0] * blot, col[1] * blot, col[2] * blot], a);
        sc = mix3(sc, [70, 66, 124], 0.1 * rim);
      }
      c = lc && sc ? mix3(sc, lc, landness) : lc || sc;
      const g = grainAt(x, y);
      base[o] = c[0] * g; base[o + 1] = c[1] * g; base[o + 2] = c[2] * g; base[o + 3] = 255;
    }
  }
  lap('base raster');

  // the blank vellum the page shows where no sheet is pinned (4 units a pixel)
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
  const lining = [1.25, 2.8, 4.9, 7.6].map((lv) => flat(isolines(dSeaS, W, H, lv), 0.16).filter((a) => a.length > 10));
  const lakeMaskF = new Float32Array(N);
  const panF = new Float32Array(N).fill(-1e6);
  for (let k = 0; k < N; k++) { const lk = lakeId[k] ? lakes[lakeId[k] - 1] : null; lakeMaskF[k] = lakeF[k] > -100 ? lakeF[k] : -3; if (lakeF[k] > -100 && (lakeId[k] ? lk.kind === 'pan' : false)) { panF[k] = lakeF[k]; } }
  // pans are drawn dotted: split shores by kind
  const isPanCell = (x, y) => { const k = Math.round(gj(y)) * W + Math.round(gi(x)); for (const q of [k, k + 1, k - 1, k + W, k - W, k + 2, k - 2, k + 2 * W, k - 2 * W]) if (lakeId[q] && lakes[lakeId[q] - 1].kind === 'pan') return true; return false; };
  const shoresAll = isolines(lakeMaskF, W, H, 0).map(toChart);
  const lakeShores = [], panShores = [];
  for (const l of shoresAll) { const s = simplify(l, 0.08); if (s.length < 4) continue; const a = s.flatMap((p) => [+p[0].toFixed(2), +p[1].toFixed(2)]); (isPanCell(l[0][0], l[0][1]) ? panShores : lakeShores).push(a); }
  const lakeLining = flat(isolines(lakeMaskF, W, H, 1.0), 0.12).filter((a) => a.length > 12);
  const iceEdge = flat(isolines(ice, W, H, 0.5), 0.14).filter((a) => a.length > 10);
  lap('coast, lining, shores');

  // ---- rivers: cut where they run through lakes or out to sea
  const cellAt = (x, y) => clamp(Math.round(gj(y)), 0, H - 1) * W + clamp(Math.round(gi(x)), 0, W - 1);
  const cut = (pts, keepSea = false) => {
    const parts = []; let cur = [];
    for (const p of pts) {
      const k = cellAt(p[0], p[1]);
      const hidden = lakeF[k] > 0.25 || (!keepSea && sea[k] && sd[k] < -0.5) || iceRaw[k] === 1;
      if (hidden) { if (cur.length > 1) parts.push(cur); cur = []; } else cur.push(p);
    }
    if (cur.length > 1) parts.push(cur);
    return parts;
  };
  const rivers = [];
  for (const r of T.rivers) for (const part of cut(r.pts)) rivers.push({ id: r.id, cls: r.cls, pts: part.flatMap((p) => [+p[0].toFixed(2), +p[1].toFixed(2), +p[3].toFixed(2)]) });
  // the Thin Water braids over its sand
  const braid = [];
  {
    const tw = T.riverById.thinWater, s = arcLengths(tw.pts), L = s[s.length - 1];
    for (let c = 0; c < 4; c++) {
      const line = [];
      tw.pts.forEach((p, i) => {
        if (i % 2) return;
        const a = tw.pts[Math.max(0, i - 3)], b = tw.pts[Math.min(tw.pts.length - 1, i + 3)];
        let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
        const env = smoothstep(0.17, 0.3, s[i] / L) * (0.5 + 0.5 * smoothstep(1, 0.9, s[i] / L));
        const off = env * (1.5 * Math.sin(s[i] / (4.2 + c * 1.3) + c * 2.1) + 0.9 * Math.sin(s[i] / (2.1 + c * 0.6) + c * 4.4) + (c - 1.5) * 0.7);
        line.push(+(p[0] - ty * off).toFixed(2), +(p[1] + tx * off).toFixed(2));
      });
      braid.push(line);
    }
  }
  const streams = [], wadis = [];
  for (const st of T.streams) {
    const a = st.pts.flatMap((p) => [+p[0].toFixed(2), +p[1].toFixed(2), +clamp(0.03 * Math.pow(p[2], 0.42), 0.13, 0.62).toFixed(2)]);
    (st.wadi ? wadis : streams).push(a);
  }
  const canals = T.canals.map((c) => ({ id: c.id, pts: c.pts.flat(), locks: c.locks }));

  // distance to drawn fresh water, for the plant marks
  const wmask = new Uint8Array(N), siltMask = new Uint8Array(N), inkMask = new Uint8Array(N), thinMask = new Uint8Array(N), stairMask = new Uint8Array(N);
  const mark = (m, pts) => { for (const p of pts) m[cellAt(p[0], p[1])] = 1; };
  const namedMask = new Uint8Array(N);
  for (const r of T.rivers) { mark(wmask, r.pts); mark(namedMask, r.pts); if (r.cls === 'great' || r.cls === 'arm') mark(siltMask, r.pts); if (r.cls === 'black' || r.cls === 'seasonal') mark(inkMask, r.pts); if (r.cls === 'braided') mark(thinMask, r.pts); }
  for (const st of T.streams) if (!st.wadi) for (const p of st.pts) wmask[cellAt(p[0], p[1])] = 1;
  for (const c of T.canals) mark(wmask, c.dense);
  { const rush = T.riverById.rush; mark(stairMask, rush.pts.filter((p) => p[0] > 218 && p[0] < 268)); }
  const dNamed = edt(namedMask, W, H);
  const dWater = edt(wmask, W, H), dSilt = edt(siltMask, W, H), dInk = edt(inkMask, W, H), dThin = edt(thinMask, W, H), dStair = edt(stairMask, W, H);
  lap('rivers');

  // ---- hachures on steep ground
  const hach = [];
  {
    const sp = 1.08;
    for (let y = y0 + 1; y < y0 + UH - 1; y += sp) for (let x = x0 + 1; x < x0 + UW - 1; x += sp) {
      const px = x + (rnd() - 0.5) * sp, py = y + (rnd() - 0.5) * sp, k = cellAt(px, py);
      if (sea[k] || lakeId[k]) { rnd(); continue; }
      const [gx, gy] = slopeAt(k), s = Math.hypot(gx, gy);
      const u = rnd();
      if (s < 0.1 || u > (s - 0.05) * 1.5) continue;
      const len = clamp(0.55 + 1.7 * s, 0.7, 3.2), nx = gx / s, ny = gy / s;
      const rel = (-gx * Lx - gy * Ly + Lz) / Math.sqrt(s * s + 1) - Lz;
      const ic = ice[k] > 0.5 ? 1 : 0;
      hach.push(px - nx * len * 0.5, py - ny * len * 0.5, px + nx * len * 0.5, py + ny * len * 0.5, clamp(0.1 + 0.66 * s + (rel < 0 ? 0.16 : 0), 0.08, 0.95) * (ic ? 0.45 : 1), ic);
    }
  }
  lap(`hachures: ${hach.length / 6}`);

  // ---- plant marks: density and kind follow the rain, the height and the lushness ramp
  const keepOut = LANDMARKS.filter((l) => l.at && ['gate', 'ruins', 'town', 'stilts', 'seaGate', 'hulls', 'towers', 'pyreStairs', 'tower', 'monolith', 'garden', 'hearth'].includes(l.g)).map((l) => [l.at[0], l.at[1], (l.r || 3) + 1.2]);
  const d2 = (x, y, ax, ay) => (x - ax) * (x - ax) + (y - ay) * (y - ay);
  const vegAt = (x, y, k, u) => {
    const R = rain[k], hh = h[k], dl = dLand[k], dw = dWater[k] / GS;
    const northW = 1 - smoothstep(636, 700, y), southW = smoothstep(704, 764, y);
    let tree = -1, td = 0, ground = -1, gd = 0;
    if (u < northW) {
      const treeline = 1250;
      if (R > 0.66) {
        tree = (nzV.n(x / 5, y / 5) > 0.35 && x > 270) ? G.BROADLEAF : G.CONIFER;
        td = 0.96 * smoothstep(0.66, 0.84, R) * (1 - smoothstep(treeline - 380, treeline, hh));
        ground = G.MOSS; gd = 0.12;
        if (dThin[k] / GS < 4.5) { ground = G.REED; gd = 0.75; tree = G.BROADLEAF; td *= 0.35; }
      } else {
        const east = smoothstep(640, 720, x);
        if (R < 0.2) { ground = G.GRASS; gd = 0.2; }
        else if (east > 0.5) { ground = G.HEATH; gd = 0.5; }
        else { ground = G.MOSS; gd = 0.24; }
        tree = G.CONIFER;
        td = 0.42 * Math.exp(-d2(x, y, 377, 430) / (36 * 36)) * (dw > 1 ? 1 : 0); // cedars round the Pallid Deep
        td = Math.max(td, east * (0.1 + 0.4 * smoothstep(5, 1.5, dw) + 0.25 * smoothstep(780, 850, x)));
        if (east > 0.5 && nzV.n(x / 6 + 3, y / 6) > 0.3 && dw < 4) tree = G.BROADLEAF;
        td *= 1 - smoothstep(treeline - 500, treeline - 150, hh);
        gd *= 1 - smoothstep(1300, 1900, hh);
      }
    } else if (u < northW + (1 - northW - southW) || y < 704) {
      if (R < 0.08 || (x < 240 && dl < 26)) { ground = G.DUNE; gd = 0.42; }
      else if (R > 0.3) { ground = G.SCRUB; gd = 0.4; tree = G.ACACIA; td = 0.14; }
      else { ground = G.GRASS; gd = 0.26; if (nzV.n(x / 30, y / 30) > 0.25) { ground = G.DUNE; gd = 0.3; } }
      gd *= 1 - smoothstep(1200, 1900, hh);
    } else {
      if (R < 0.3) {
        ground = G.SCRUB; gd = 0.16 + 0.3 * smoothstep(0.08, 0.3, R);
        if (R < 0.075 && nzV.n(x / 24, y / 24) > 0.1) { ground = G.DUNE; gd = 0.3; }
        const gal = smoothstep(3.6, 1.1, dNamed[k] / GS) + 0.3 * smoothstep(2.2, 0.9, dw);
        tree = nzV.n(x / 3, y / 3 + 9) > -0.15 ? G.PALM : G.BROADLEAF; td = 0.8 * Math.min(1, gal);
        const fen = Math.exp(-d2(x, y, 326, 850) / (22 * 22));
        if (fen > 0.2 && (lakeF[k] > -7 || dw < 5)) { ground = G.PAPYRUS; gd = Math.max(gd, fen * 1.5); tree = G.PALM; td = Math.max(td, 0.22 * fen); }
        const spray = smoothstep(8, 2.5, dStair[k] / GS);
        if (spray > 0) { tree = nzV.n(x / 2, y / 2) > 0.2 ? G.PALM : G.BROADLEAF; td = Math.max(td, 0.9 * spray); }
        if (d2(x, y, 196, 800) < 26 * 26 && dl < 7) { tree = G.PALM; td = Math.max(td, 0.42); }
      } else {
        const wet = smoothstep(0.3, 0.75, R);
        tree = G.BROADLEAF; td = 0.32 + 0.64 * wet; ground = G.GRASS; gd = 0.12 * (1 - wet);
        if (R > 0.9 && hh < 170 && x > 528 && x < 835 && y > 815 && y < 1068) { tree = G.CANOPY; td = 1; }
        if (Math.exp(-d2(x, y, 300, 1070) / (50 * 50)) > 0.42 && hh < 90) { tree = G.SWAMP; td = 0.9; }
        const sav = smoothstep(0.64, 0.44, R) * smoothstep(1150, 1210, y);
        if (sav > 0.02) { td = lerp(td, 0.26, sav); if (u * 7 % 1 < sav) tree = G.ACACIA; ground = G.GRASS; gd = 0.34 * sav; }
        if (dl < 3.4 && hh < 14 && R > 0.42) { tree = G.MANGROVE; td = 0.94; }
        td *= 1 - 0.55 * smoothstep(900, 1500, hh);
        const ds = dSilt[k] / GS;
        if (ds > 1.8 && ds < 4.6) { ground = G.REED; gd = 0.8; td *= 0.25; }
      }
    }
    return [tree, td, ground, gd];
  };
  const glyphs = [];
  const place = (sp, treePass, only) => {
    for (let y = y0 + PADDING; y < y0 + UH - PADDING; y += sp) for (let x = x0 + PADDING; x < x0 + UW - PADDING; x += sp) {
      const px = x + (rnd() - 0.5) * sp * 0.95, py = y + (rnd() - 0.5) * sp * 0.95, u1 = rnd(), u2 = rnd(), u3 = rnd();
      const k = cellAt(px, py);
      if (sea[k] || lakeF[k] > -0.7 || ice[k] > 0.35) continue;
      const [tree, td, ground, gd] = vegAt(px, py, k, u1);
      const type = treePass ? tree : ground, dens = treePass ? td : gd;
      if (type < 0 || dens <= 0.01 || (only && !only.includes(type))) continue;
      const clump = smoothstep(-0.3, 0.3, nzV.fbm(px / 20 + (treePass ? 0 : 50), py / 20, 3) * 1.25 + (dens - 0.5) * 1.7);
      if (u2 > dens * (0.25 + 0.75 * clump)) continue;
      const [gx, gy] = slopeAt(k), s = Math.hypot(gx, gy);
      if (s > (type === G.CONIFER ? 1.25 : 0.9)) continue;
      const dw = dWater[k] / GS, ds = dSilt[k] / GS, di = dInk[k] / GS;
      if (treePass) { if (dw < 0.85 || ds < 2.3 || (di < 1.25)) continue; if (sd[k] < (type === G.MANGROVE ? 0.2 : 0.75)) continue; }
      else if (dw < 0.6 || ds < 1.9 || sd[k] < 0.5) continue;
      let bad = false;
      for (const q of keepOut) if (d2(px, py, q[0], q[1]) < q[2] * q[2]) { bad = true; break; }
      if (bad) continue;
      const lush = clamp(T.lushAt(px, py) + (u3 - 0.5) * 1.4, 0, 15);
      const rel = (-gx * Lx - gy * Ly + Lz) / Math.sqrt(s * s + 1) - Lz;
      const big = type === G.CANOPY || (type === G.BROADLEAF && td > 0.6) ? 0.55 * u3 * u3 * u3 : 0;
      glyphs.push([px, py, type, 0.74 + 0.36 * u3 + big, lush, u1, rel]);
    }
  };
  const PADDING = 1;
  place(1.5, true);
  place(2.5, false);
  place(1.25, false, [G.REED, G.PAPYRUS]); // meadows and reed beds stand thick
  glyphs.sort((a, b) => a[1] - b[1]);
  const glyphArr = new Float32Array(glyphs.length * 7);
  glyphs.forEach((g, i) => glyphArr.set(g, i * 7));
  lap(`plant marks: ${glyphs.length}`);

  // ---- stipple on the ice, and the Fold's ribbon
  const iceDots = [];
  for (let n = 0; n < 60000; n++) {
    const x = 235 + rnd() * 130, y = 160 + rnd() * 520, k = cellAt(x, y);
    if (ice[k] > 0.55 && !sea[k] && rnd() < 0.42) iceDots.push(+x.toFixed(2), +y.toFixed(2));
  }
  const fold = [];
  for (let row = 0, y = 646; y <= 734; y += 6.8, row++) for (let x = x0 + 30 + (row % 2) * 5; x < x0 + UW - 30; x += 10) {
    const px = x + (rnd() - 0.5) * 1.6, py = y + (rnd() - 0.5) * 1.2, k = cellAt(px, py);
    const a = smoothstep(642, 660, py) * smoothstep(738, 720, py);
    if (sea[k]) { if (dSea[k] > 2.5 && washAt(px, py) > 0.6) fold.push(+px.toFixed(1), +py.toFixed(1), 0, +a.toFixed(2)); }
    else if (lakeF[k] < -1 && dWater[k] / GS > 1.5 && h[k] < 1500 && dLand[k] > 1.5) fold.push(+px.toFixed(1), +py.toFixed(1), 1, +a.toFixed(2));
  }

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
      const side = 1; const off = p[3] / 2 + 1.1;
      pts.push([+(p[0] - ty * off * side).toFixed(2), +(p[1] + tx * off * side).toFixed(2)]);
    }
    return { g: 'posts', pts };
  });

  // the Great Step's scarp line, for the bake's escarpment symbol: [x, y, strength]
  const step = [];
  {
    const dense = resample(T.stepLine, 1.1);
    for (const p of dense) {
      const win = smoothstep(696, 730, p[1]) * (1 - smoothstep(950, 1004, p[1]));
      const x = p[0] + 2.2 * nzV.fbm(p[1] / 14, 3, 2), k = cellAt(x, p[1]);
      // not across the Rush's stair or the Sweetwater
      const wet = dWater[k] / GS < 1.4 || lakeF[k] > -1;
      step.push([+x.toFixed(2), +p[1].toFixed(2), wet ? 0 : +win.toFixed(2)]);
    }
  }
  return { base, paper, pw, ph, glyphArr, hachArr: new Float32Array(hach),
    vec: { coast, lining, lakeShores, panShores, lakeLining, iceEdge, rivers, braid, streams, wadis, canals, iceDots, fold, landmarks, step } };
}
