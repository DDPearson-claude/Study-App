// What the page needs beside the baked image: the Lamp Road as dense curves along the drawn
// waterways, the sixteen sheets' reveal masks, and the lettering with the sheet that shows it.
import { SHEET, SEED, WATERS, HOME, ACTS, LEGS, SHEETS, LABELS, SEA_WAYS } from './canon.mjs';
import { clamp, smoothstep, makeNoise, spline, resample, arcLengths, nearestOnPolyline, encodePNG } from './lib/util.mjs';

const r1 = (v) => Math.round(v * 10) / 10;

function waterway(T, id) {
  if (T.riverById[id]) return T.riverById[id].pts;
  const c = T.canals.find((q) => q.id === id);
  if (!c) throw new Error('no waterway ' + id);
  return c.dense;
}
function stretch(pts, from, to) {
  const s = arcLengths(pts);
  const a = from ? nearestOnPolyline(pts, from[0], from[1], s) : { i: 0, t: 0 };
  const b = to ? nearestOnPolyline(pts, to[0], to[1], s) : { i: pts.length - 2, t: 1 };
  const ia = a.i + a.t, ib = b.i + b.t;
  const lo = Math.min(ia, ib), hi = Math.max(ia, ib);
  const at = (f) => { const i = Math.min(pts.length - 2, Math.floor(f)), t = f - i; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]; };
  const out = [at(lo)];
  for (let i = Math.floor(lo) + 1; i <= Math.floor(hi); i++) out.push([pts[i][0], pts[i][1]]);
  out.push(at(hi));
  return ia <= ib ? out : out.reverse();
}

// signed distance to a sheet's inked region (negative inside), and its soft alpha
function sheetFns(T) {
  const nz = makeNoise(SEED + 21);
  const prims = SHEETS.map((sheet) => sheet.map((p) => {
    if (Array.isArray(p)) return { c: [p[0], p[1]], r: p[2] };
    let pts = p.p ? resample(spline(p.p, 2), 3) : resample(stretch(waterway(T, p.r), p.from, p.to), 3);
    return { pts, w: p.w };
  }));
  const bbox = prims.map((list) => {
    let b = [1e9, 1e9, -1e9, -1e9];
    for (const p of list) {
      const pts = p.c ? [p.c] : p.pts, r = p.c ? p.r : p.w;
      for (const q of pts) { b[0] = Math.min(b[0], q[0] - r); b[1] = Math.min(b[1], q[1] - r); b[2] = Math.max(b[2], q[0] + r); b[3] = Math.max(b[3], q[1] + r); }
    }
    return b;
  });
  const dist = (k, x, y) => {
    const b = bbox[k];
    if (x < b[0] - 30 || x > b[2] + 30 || y < b[1] - 30 || y > b[3] + 30) return 99;
    let d = 1e9;
    for (const p of prims[k]) {
      if (p.c) d = Math.min(d, Math.hypot(x - p.c[0], y - p.c[1]) - p.r);
      else d = Math.min(d, nearestOnPolyline(p.pts, x, y).d - p.w);
    }
    return d;
  };
  const alpha = (k, x, y) => {
    const d = dist(k, x, y);
    if (d > 40) return 0;
    return 1 - smoothstep(-13, 7, d + 9 * nz.fbm(x / 48, y / 48, 3) + 3 * nz.fbm(x / 13 + 5, y / 13, 2));
  };
  return { alpha, bbox };
}

export function buildMasks(T) {
  const { alpha } = sheetFns(T);
  const unit = 4, tw = Math.ceil(T.UW / unit), th = Math.ceil(T.UH / unit), cols = 4, rows = 4;
  const buf = new Uint8Array(tw * cols * th * rows);
  for (let k = 0; k < 16; k++) {
    const ox = (k % cols) * tw, oy = Math.floor(k / cols) * th;
    for (let j = 0; j < th; j++) for (let i = 0; i < tw; i++) {
      const a = alpha(k, T.x0 + (i + 0.5) * unit, T.y0 + (j + 0.5) * unit);
      buf[(oy + j) * tw * cols + ox + i] = Math.round(clamp(a, 0, 1) * 255);
    }
  }
  return { png: encodePNG(tw * cols, th * rows, buf, 1), cols, rows, tw, th, unit };
}

export function buildPageData(T) {
  const { alpha, bbox } = sheetFns(T);
  const sheetOf = (x, y) => { for (let k = 0; k < 16; k++) if (alpha(k, x, y) >= 0.6) return k + 1; return 0; };

  // ---- the Lamp Road
  const legs = LEGS.map((leg) => {
    const pieces = [];
    let last = null;
    for (const pc of leg.pieces) {
      let pts, kind;
      if (pc.p) { pts = spline(pc.p, 1); kind = pc.k || 'lake'; }
      else { pts = stretch(waterway(T, pc.r), pc.from, pc.to); kind = pc.k || 'river'; pts = pts.filter((_, i) => i % 2 === 0 || i === pts.length - 1); }
      if (last && Math.hypot(pts[0][0] - last[0], pts[0][1] - last[1]) > 0.2) pts.unshift(last);
      last = pts[pts.length - 1];
      pieces.push({ k: kind, p: pts.flatMap((q) => [r1(q[0]), r1(q[1])]) });
    }
    let len = 0;
    for (const pc of pieces) for (let i = 2; i < pc.p.length; i += 2) len += Math.hypot(pc.p[i] - pc.p[i - 2], pc.p[i + 1] - pc.p[i - 1]);
    return { to: leg.to, len: r1(len), pieces };
  });
  // sea routes must stay in the sea, river routes on land: report what strays
  const strays = [];
  for (const leg of legs) for (const pc of leg.pieces) {
    if (pc.k !== 'sea') continue;
    let n = 0;
    for (let i = 0; i < pc.p.length; i += 2) { const k = clamp(Math.round(T.gj(pc.p[i + 1])), 0, T.H - 1) * T.W + clamp(Math.round(T.gi(pc.p[i])), 0, T.W - 1); if (!T.sea[k]) n++; }
    if (n > 6) strays.push(`leg ${leg.to}: ${n} sea points on land`); // a few units at a river mouth are the join, not a stray
  }

  // where an owned road runs on into a water not yet bought: a small lavender wisp (WORLD.md §10)
  const wisps = [];
  for (let k = 1; k < 16; k++) {
    const leg = legs[k]; let found = null;
    outer: for (const pc of leg.pieces) for (let i = 0; i < pc.p.length; i += 2) {
      let a = 0;
      for (let q = 0; q < k; q++) a = Math.max(a, alpha(q, pc.p[i], pc.p[i + 1]));
      if (a < 0.45) { found = [pc.p[i], pc.p[i + 1]]; break outer; }
    }
    wisps.push(found);
  }

  // ---- lettering
  const labels = LABELS.map((l) => {
    const out = { t: l.t, kind: l.kind, at: l.at, a: l.a || 0, z: l.z || 0, sheet: l.never ? 0 : sheetOf(l.at[0], l.at[1]) };
    if (l.sub) out.sub = l.sub;
    if (l.small) out.small = true;
    if (l.tone) out.tone = l.tone;
    const k = clamp(Math.round(T.gj(l.at[1])), 0, T.H - 1) * T.W + clamp(Math.round(T.gi(l.at[0])), 0, T.W - 1);
    out.on = l.on || (l.kind === 'sea' ? 'sea' : T.sea[k] ? 'sea' : 'land');
    if (l.kind === 'river') {
      const pts = waterway(T, l.river || l.canal), s = arcLengths(pts), nr = nearestOnPolyline(pts, l.at[0], l.at[1], s);
      const half = 46, seg = [];
      for (let i = 0; i < pts.length; i++) if (Math.abs(s[i] - nr.s) <= half && (seg.length === 0 || i % 2 === 0)) seg.push(r1(pts[i][0]), r1(pts[i][1]));
      out.path = seg;
      out.at = [r1(pts[nr.i][0]), r1(pts[nr.i][1])];
    }
    return out;
  });

  const waters = WATERS.map((w) => ({ ...w, step: w.n - 1, act: Math.floor((w.n - 1) / 4) }));
  return {
    sheet: { x0: T.x0, y0: T.y0, w: T.UW, h: T.UH, cw: SHEET.W, ch: SHEET.H },
    waters, home: HOME, acts: ACTS, legs, wisps, labels,
    sheetBox: bbox.map((b) => b.map(r1)),
    seaWays: SEA_WAYS.map((p) => spline(p, 3).flatMap((q) => [r1(q[0]), r1(q[1])])),
    strays,
  };
}
