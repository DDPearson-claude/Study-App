// What the page needs beside the baked image: the Lamp Road as pieces along the drawn waterways
// (each drawn once, with the way its water runs), the legs that sail them, the sixteen sheets'
// reveal masks and their inked edges, the veil over the never-charted land, and the lettering
// with the sheet that brings each name.
import { SHEET, SEED, WATERS, HOME, ACTS, PIECES, LEGS, SHEETS, LABELS, LANDMARKS, FOLD } from './canon.mjs';
import { clamp, smoothstep, makeNoise, spline, resample, arcLengths, nearestOnPolyline, stretch, encodePNG, isolines, chaikin, simplify } from './lib/util.mjs';

const r1 = (v) => Math.round(v * 10) / 10;

function waterway(T, id) {
  if (T.riverById[id]) return T.riverById[id].pts;
  const c = T.canals.find((q) => q.id === id);
  if (!c) throw new Error('no waterway ' + id);
  return c.dense;
}

// signed distance to a sheet's inked region (negative inside), and its alpha: a clean edge that
// wanders a little, as a sheet laid down by hand does
function sheetFns(T) {
  const nz = makeNoise(SEED + 21);
  const prims = SHEETS.map((sheet) => sheet.map((p) => {
    if (Array.isArray(p)) return { c: [p[0], p[1]], r: p[2] };
    const pts = p.p ? resample(spline(p.p, 2), 3) : resample(stretch(waterway(T, p.r), p.from, p.to), 3);
    return { pts, w: p.w };
  }));
  const bbox = prims.map((list) => {
    const b = [1e9, 1e9, -1e9, -1e9];
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
    return 1 - smoothstep(-5, -2.4, d + 8 * nz.fbm(x / 44, y / 44, 3) + 3 * nz.fbm(x / 12 + 5, y / 12, 2));
  };
  return { alpha, bbox };
}

// The sheets as grey tiles in one atlas (tile 17 is the veil over the never-charted land), and the
// inked edge of the charted country at each count of maps owned.
export function buildMasks(T) {
  const { alpha } = sheetFns(T);
  const unit = 3, tw = Math.ceil(T.UW / unit), th = Math.ceil(T.UH / unit), cols = 5, rows = 4;
  const win = [T.x0 + SHEET.NEAT, T.y0 + SHEET.NEAT, T.x0 + T.UW - SHEET.NEAT, T.y0 + T.UH - SHEET.NEAT];
  const buf = new Uint8Array(tw * cols * th * rows);
  const tiles = [];
  for (let k = 0; k < 16; k++) {
    const t = new Float32Array(tw * th);
    for (let j = 0; j < th; j++) for (let i = 0; i < tw; i++) t[j * tw + i] = clamp(alpha(k, T.x0 + (i + 0.5) * unit, T.y0 + (j + 0.5) * unit), 0, 1);
    tiles.push(t);
  }
  // the veil: land no sheet covers (the east, the far south), but never the Fold's own band
  const veil = new Float32Array(tw * th), all = new Float32Array(tw * th);
  for (let q = 0; q < tw * th; q++) { let a = 0; for (let k = 0; k < 16; k++) a = Math.max(a, tiles[k][q]); all[q] = a; }
  for (let j = 0; j < th; j++) for (let i = 0; i < tw; i++) {
    const x = T.x0 + (i + 0.5) * unit, y = T.y0 + (j + 0.5) * unit, q = j * tw + i;
    const land = smoothstep(-1.5, 2.5, T.sample(T.sd, x, y));
    const band = smoothstep(FOLD.y0 - 10, FOLD.y0 - 2, y) * smoothstep(FOLD.y1 + 10, FOLD.y1 + 2, y);
    veil[q] = (1 - all[q]) * land * (1 - band);
  }
  tiles.push(veil);
  tiles.forEach((t, k) => {
    const ox = (k % cols) * tw, oy = Math.floor(k / cols) * th;
    for (let j = 0; j < th; j++) for (let i = 0; i < tw; i++) buf[(oy + j) * tw * cols + ox + i] = Math.round(t[j * tw + i] * 255);
  });
  // edges: where the charted country stops, for 1..15 maps owned
  const edges = [];
  const acc = new Float32Array(tw * th);
  const onLand = (p) => T.sample(T.sd, p[0], p[1]) > 1.2 && (p[1] < FOLD.y0 - 6 || p[1] > FOLD.y1 + 6);
  for (let n = 1; n <= 16; n++) {
    for (let q = 0; q < tw * th; q++) acc[q] = Math.max(acc[q], tiles[n - 1][q]);
    const lines = [];
    for (const l of isolines(acc, tw, th, 0.5)) {
      const pts = chaikin(l.map((p) => [T.x0 + (p[0] + 0.5) * unit, T.y0 + (p[1] + 0.5) * unit]), 2, false);
      // an edge that only follows the neatline is the frame, not a sheet's edge
      let cur = [];
      const flush = () => { if (cur.length > 4) { const s = simplify(cur, 0.5); lines.push(s.flatMap((p) => [Math.round(p[0] * 2) / 2, Math.round(p[1] * 2) / 2])); } cur = []; };
      // (at sixteen the sea is all drawn: the edge left is where the charted land meets the never-charted)
      for (const p of pts) { if (p[0] < win[0] + 3 || p[0] > win[2] - 3 || p[1] < win[1] + 3 || p[1] > win[3] - 3 || (n === 16 && !onLand(p))) flush(); else cur.push(p); }
      flush();
    }
    edges.push(lines);
  }
  return { png: encodePNG(tw * cols, th * rows, buf, 1), cols, rows, tw, th, unit, edges };
}

export function buildPageData(T) {
  const { alpha, bbox } = sheetFns(T);
  const sheetOf = (x, y) => { for (let k = 0; k < 16; k++) if (alpha(k, x, y) >= 0.6) return k + 1; return 0; };
  const inSea = (x, y) => !!T.sea[clamp(Math.round(T.gj(y)), 0, T.H - 1) * T.W + clamp(Math.round(T.gi(x)), 0, T.W - 1)];

  // ---- the Lamp Road: its pieces, each once
  const ids = Object.keys(PIECES);
  const pieces = ids.map((id) => {
    const pc = PIECES[id];
    let pts, kind, flow = 0, wide = 0;
    if (pc.p) { pts = spline(pc.p, 1); kind = pc.k || 'lake'; }
    else {
      const way = waterway(T, pc.r);
      pts = stretch(way, pc.from, pc.to); kind = pc.k || 'river';
      if (kind !== 'canal') { // a river piece is given downstream: check it against the river's own heights
        const s = arcLengths(way), za = way[nearestOnPolyline(way, pc.from[0], pc.from[1], s).i][2], zb = way[nearestOnPolyline(way, pc.to[0], pc.to[1], s).i][2];
        if (!(za > zb)) throw new Error(`piece ${id} is not given downstream`);
        flow = 1;
        // a river inked wider than the road's line needs no water drawn under the line
        const ia = nearestOnPolyline(way, pc.from[0], pc.from[1], s).i, ib = nearestOnPolyline(way, pc.to[0], pc.to[1], s).i;
        let sum = 0, cnt = 0; for (let i = Math.min(ia, ib); i <= Math.max(ia, ib); i++) { sum += way[i][3] || 0; cnt++; }
        if (cnt && sum / cnt >= 2.1) wide = 1;
      }
      pts = pts.filter((_, i) => i % 2 === 0 || i === pts.length - 1);
    }
    return { id, k: kind, flow, wide, p: pts.flatMap((q) => [r1(q[0]), r1(q[1])]) };
  });
  const legs = LEGS.map((leg) => {
    let len = 0, last = null; const via = [];
    for (const v of leg.via) {
      const back = v[0] === '-', idx = ids.indexOf(back ? v.slice(1) : v);
      if (idx < 0) throw new Error('no road piece ' + v);
      const p = pieces[idx].p, n = p.length;
      const a = back ? [p[n - 2], p[n - 1]] : [p[0], p[1]], b = back ? [p[0], p[1]] : [p[n - 2], p[n - 1]];
      if (last && Math.hypot(a[0] - last[0], a[1] - last[1]) > 2.5) throw new Error(`leg ${leg.to}: ${v} does not join the piece before it (${Math.hypot(a[0] - last[0], a[1] - last[1]).toFixed(1)} units apart)`);
      last = b;
      for (let i = 2; i < n; i += 2) len += Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]);
      via.push([idx, back ? -1 : 1]);
    }
    return { to: leg.to, len: r1(len), via };
  });
  // the leg that first draws each piece
  pieces.forEach((pc, i) => { pc.leg = 99; for (const l of legs) if (l.via.some((v) => v[0] === i)) { pc.leg = Math.min(pc.leg, l.to); } });
  // sea routes must stay in the sea: report what strays
  const strays = [];
  for (const pc of pieces) {
    if (pc.k !== 'sea') continue;
    let n = 0;
    for (let i = 0; i < pc.p.length; i += 2) if (!inSea(pc.p[i], pc.p[i + 1])) n++;
    if (n > 6) strays.push(`${pc.id}: ${n} sea points on land`); // a few units at a river mouth are the join, not a stray
  }
  // where an owned road runs on into a water not yet bought: a small lavender wisp, a little way
  // along the first piece the next leg would add (WORLD.md §10)
  const wisps = [];
  for (let k = 1; k < 16; k++) {
    const leg = legs[k]; let found = null;
    for (const [idx, dir] of leg.via) {
      const pc = pieces[idx]; if (pc.leg <= k) continue;
      const pts = []; for (let i = 0; i < pc.p.length; i += 2) pts.push([pc.p[i], pc.p[i + 1]]);
      if (dir < 0) pts.reverse();
      const s = arcLengths(pts), d = Math.min(11, s[s.length - 1] * 0.6);
      let j = 0; while (j < pts.length - 2 && s[j + 1] < d) j++;
      found = [r1(pts[j + 1][0]), r1(pts[j + 1][1])]; break;
    }
    wisps.push(found);
  }

  // ---- lettering
  const labels = LABELS.map((l) => {
    const sheet = l.never ? 99 : l.sheet || sheetOf(l.at[0], l.at[1]) || 99;
    const out = { t: l.t, kind: l.kind, at: l.at, a: l.a || 0, z: l.z || 0, sheet };
    if (l.sub) out.sub = l.sub;
    if (l.small) out.small = true;
    if (l.tone) out.tone = l.tone;
    if (l.force) out.force = 1;
    out.on = l.on || (l.kind === 'sea' ? 'sea' : inSea(l.at[0], l.at[1]) ? 'sea' : 'land');
    if (l.kind === 'river') {
      const pts = waterway(T, l.river || l.canal), s = arcLengths(pts), nr = nearestOnPolyline(pts, l.at[0], l.at[1], s);
      const half = 46, seg = [];
      for (let i = 0; i < pts.length; i++) if (Math.abs(s[i] - nr.s) <= half && (seg.length === 0 || i % 2 === 0)) seg.push(r1(pts[i][0]), r1(pts[i][1]));
      out.path = seg;
      out.at = [r1(pts[nr.i][0]), r1(pts[nr.i][1])];
    }
    return out;
  });
  // the harbour-masters' soundings, lettered small in the water (reach III's hand)
  for (const l of LANDMARKS) if (l.g === 'soundings') for (const p of l.pts) labels.push({ t: String(p[2]), kind: 'sounding', at: [p[0], p[1]], a: 0, z: 2.3, sheet: p[1] < 900 ? Math.max(9, sheetOf(p[0], p[1]) || 10) : 12, on: 'sea' });

  const waters = WATERS.map((w) => ({ ...w, step: w.n - 1, act: Math.floor((w.n - 1) / 4) }));
  return {
    sheet: { x0: T.x0, y0: T.y0, w: T.UW, h: T.UH, cw: SHEET.W, ch: SHEET.H, edge: SHEET.EDGE, neat: SHEET.NEAT },
    fold: FOLD, waters, home: HOME, acts: ACTS, pieces, legs, wisps, labels,
    sheetBox: bbox.map((b) => b.map(r1)),
    strays,
  };
}
