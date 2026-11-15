// Small numeric toolkit for the world-map generator: a seeded PRNG, gradient noise, splines,
// an exact distance transform, marching squares and a PNG writer. No dependencies.
import zlib from 'node:zlib';

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 2D gradient noise in about [-1, 1], with fbm and ridged variants.
export function makeNoise(seed) {
  const rnd = mulberry32(seed);
  const perm = new Uint8Array(256);
  for (let i = 0; i < 256; i++) perm[i] = i;
  for (let i = 255; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; const t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
  const p = new Uint8Array(512);
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
  const gx = new Float32Array(256), gy = new Float32Array(256);
  for (let i = 0; i < 256; i++) { const a = rnd() * Math.PI * 2; gx[i] = Math.cos(a); gy[i] = Math.sin(a); }
  function n(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const X = xi & 255, Y = yi & 255;
    const aa = p[p[X] + Y], ab = p[p[X] + Y + 1], ba = p[p[X + 1] + Y], bb = p[p[X + 1] + Y + 1];
    const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10), v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);
    const d00 = gx[aa] * xf + gy[aa] * yf, d10 = gx[ba] * (xf - 1) + gy[ba] * yf;
    const d01 = gx[ab] * xf + gy[ab] * (yf - 1), d11 = gx[bb] * (xf - 1) + gy[bb] * (yf - 1);
    const a = d00 + (d10 - d00) * u, b = d01 + (d11 - d01) * u;
    return (a + (b - a) * v) * 1.5;
  }
  function fbm(x, y, oct = 4, lac = 2, gain = 0.5) {
    let s = 0, a = 1, f = 1, norm = 0;
    for (let i = 0; i < oct; i++) { s += a * n(x * f + i * 17.3, y * f - i * 9.1); norm += a; a *= gain; f *= lac; }
    return s / norm;
  }
  function ridged(x, y, oct = 4, lac = 2.1, gain = 0.5) {
    let s = 0, a = 1, f = 1, norm = 0, prev = 1;
    for (let i = 0; i < oct; i++) {
      let v = 1 - Math.abs(n(x * f + i * 31.7, y * f + i * 11.9));
      v *= v;
      s += a * v * prev; norm += a; prev = clamp(v * 1.6, 0, 1); a *= gain; f *= lac;
    }
    return s / norm; // 0..1
  }
  return { n, fbm, ridged };
}

// ---------- polylines ----------
// Centripetal-ish Catmull-Rom through the points, resampled to about `step` units.
// Extra numeric columns (index >= 2) are carried by linear interpolation.
export function spline(pts, step = 1, closed = false) {
  const n = pts.length;
  if (n < 2) return pts.map((q) => q.slice());
  const get = (i) => (closed ? pts[((i % n) + n) % n] : pts[clamp(i, 0, n - 1)]);
  const out = [];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const m = Math.max(1, Math.round(len / step));
    for (let k = 0; k < m; k++) {
      const t = k / m, t2 = t * t, t3 = t2 * t;
      const q = [0, 0];
      for (let c = 0; c < 2; c++) {
        q[c] = 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3);
      }
      for (let c = 2; c < p1.length; c++) q.push(p1[c] + (p2[c] - p1[c]) * t);
      out.push(q);
    }
  }
  if (!closed) out.push(pts[n - 1].slice());
  return out;
}

export function arcLengths(pts) {
  const s = new Float32Array(pts.length);
  for (let i = 1; i < pts.length; i++) s[i] = s[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return s;
}

export function resample(pts, step) {
  const s = arcLengths(pts);
  const L = s[s.length - 1];
  const m = Math.max(1, Math.round(L / step));
  const out = [];
  let j = 0;
  for (let k = 0; k <= m; k++) {
    const d = (L * k) / m;
    while (j < pts.length - 2 && s[j + 1] < d) j++;
    const t = s[j + 1] > s[j] ? (d - s[j]) / (s[j + 1] - s[j]) : 0;
    const q = [];
    for (let c = 0; c < pts[j].length; c++) q.push(pts[j][c] + (pts[j + 1][c] - pts[j][c]) * t);
    out.push(q);
  }
  return out;
}

export function chaikin(pts, iters = 2, closed = false) {
  let p = pts;
  for (let it = 0; it < iters; it++) {
    const q = [];
    const n = p.length;
    if (!closed) q.push(p[0]);
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const a = p[i], b = p[(i + 1) % n];
      q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
      q.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    if (!closed) q.push(p[n - 1]);
    p = q;
  }
  return p;
}

// Nearest point on a polyline: returns {d, i, t, s} (distance, segment, parameter, arc length).
export function nearestOnPolyline(pts, x, y, sArr) {
  let best = Infinity, bi = 0, bt = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const ax = pts[i][0], ay = pts[i][1], bx = pts[i + 1][0], by = pts[i + 1][1];
    const dx = bx - ax, dy = by - ay;
    const l2 = dx * dx + dy * dy;
    let t = l2 > 0 ? ((x - ax) * dx + (y - ay) * dy) / l2 : 0;
    t = clamp(t, 0, 1);
    const px = ax + dx * t, py = ay + dy * t;
    const d = (x - px) * (x - px) + (y - py) * (y - py);
    if (d < best) { best = d; bi = i; bt = t; }
  }
  const s = sArr ? sArr[bi] + (sArr[bi + 1] - sArr[bi]) * bt : 0;
  return { d: Math.sqrt(best), i: bi, t: bt, s };
}

export function pointInPolygon(poly, x, y) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// ---------- grids ----------
// Exact Euclidean distance (in cells) to the nearest cell where mask != 0 (Felzenszwalb & Huttenlocher).
export function edt(mask, W, H) {
  const INF = 1e20;
  const f = new Float64Array(Math.max(W, H));
  const d = new Float64Array(Math.max(W, H));
  const v = new Int32Array(Math.max(W, H));
  const z = new Float64Array(Math.max(W, H) + 1);
  const out = new Float32Array(W * H);
  const tmp = new Float64Array(W * H);
  function dt1(n) {
    let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
    for (let q = 1; q < n; q++) {
      let s;
      for (;;) {
        s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
        if (s <= z[k]) { k--; if (k < 0) { k = 0; break; } } else break;
      }
      if (s > z[k]) k++;
      v[k] = q; z[k] = s; z[k + 1] = INF;
    }
    k = 0;
    for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; const dq = q - v[k]; d[q] = dq * dq + f[v[k]]; }
  }
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) f[y] = mask[y * W + x] ? 0 : INF;
    dt1(H);
    for (let y = 0; y < H; y++) tmp[y * W + x] = d[y];
  }
  for (let y = 0; y < H; y++) {
    const o = y * W;
    for (let x = 0; x < W; x++) f[x] = tmp[o + x];
    dt1(W);
    for (let x = 0; x < W; x++) out[o + x] = Math.sqrt(d[x]);
  }
  return out;
}

export function fillPolygonMask(poly, W, H, toCell) {
  const mask = new Uint8Array(W * H);
  const P = poly.map((p) => toCell(p[0], p[1]));
  const n = P.length;
  for (let y = 0; y < H; y++) {
    const yc = y + 0.5;
    const xs = [];
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const yi = P[i][1], yj = P[j][1];
      if (yi > yc !== yj > yc) xs.push(P[i][0] + ((yc - yi) / (yj - yi)) * (P[j][0] - P[i][0]));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const x0 = Math.max(0, Math.ceil(xs[k] - 0.5)), x1 = Math.min(W - 1, Math.floor(xs[k + 1] - 0.5));
      for (let x = x0; x <= x1; x++) mask[y * W + x] = 1;
    }
  }
  return mask;
}

// Box blur (separable), `r` in cells, `iters` passes (3 passes approximates a Gaussian).
export function boxBlur(src, W, H, r, iters = 2) {
  let a = Float32Array.from(src), b = new Float32Array(W * H);
  const win = 2 * r + 1;
  for (let it = 0; it < iters; it++) {
    for (let y = 0; y < H; y++) {
      const o = y * W; let acc = 0;
      for (let x = -r; x <= r; x++) acc += a[o + clamp(x, 0, W - 1)];
      for (let x = 0; x < W; x++) { b[o + x] = acc / win; acc += a[o + clamp(x + r + 1, 0, W - 1)] - a[o + clamp(x - r, 0, W - 1)]; }
    }
    for (let x = 0; x < W; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += b[clamp(y, 0, H - 1) * W + x];
      for (let y = 0; y < H; y++) { a[y * W + x] = acc / win; acc += b[clamp(y + r + 1, 0, H - 1) * W + x] - b[clamp(y - r, 0, H - 1) * W + x]; }
    }
  }
  return a;
}

// Marching squares: iso-lines of `field` at `level`, as polylines in cell coordinates
// (cell centres at integer coordinates). Each returned line is [[x,y],...]; closed lines repeat
// their first point. `step` subsamples the grid.
export function isolines(field, W, H, level, step = 1, x0 = 0, y0 = 0, x1 = W - 1, y1 = H - 1) {
  const segs = new Map(); // key(start) -> [end key, ...]
  const pts = new Map();
  const key = (ex, ey, horiz) => (ey * (W + 1) + ex) * 2 + (horiz ? 1 : 0);
  const addPt = (k, x, y) => { if (!pts.has(k)) pts.set(k, [x, y]); };
  const link = (a, b) => {
    let l = segs.get(a); if (!l) segs.set(a, (l = [])); l.push(b);
    l = segs.get(b); if (!l) segs.set(b, (l = [])); l.push(a);
  };
  const interp = (va, vb) => { const d = vb - va; return Math.abs(d) < 1e-12 ? 0.5 : clamp((level - va) / d, 0, 1); };
  for (let y = y0; y + step <= y1; y += step) {
    for (let x = x0; x + step <= x1; x += step) {
      const a = field[y * W + x], b = field[y * W + x + step], c = field[(y + step) * W + x + step], d = field[(y + step) * W + x];
      const code = (a > level ? 1 : 0) | (b > level ? 2 : 0) | (c > level ? 4 : 0) | (d > level ? 8 : 0);
      if (code === 0 || code === 15) continue;
      // edges: top (a-b), right (b-c), bottom (d-c), left (a-d)
      const top = () => { const k = key(x, y, true); addPt(k, x + interp(a, b) * step, y); return k; };
      const right = () => { const k = key(x + step, y, false); addPt(k, x + step, y + interp(b, c) * step); return k; };
      const bottom = () => { const k = key(x, y + step, true); addPt(k, x + interp(d, c) * step, y + step); return k; };
      const left = () => { const k = key(x, y, false); addPt(k, x, y + interp(a, d) * step); return k; };
      switch (code) {
        case 1: case 14: link(left(), top()); break;
        case 2: case 13: link(top(), right()); break;
        case 3: case 12: link(left(), right()); break;
        case 4: case 11: link(right(), bottom()); break;
        case 6: case 9: link(top(), bottom()); break;
        case 7: case 8: link(left(), bottom()); break;
        case 5: link(left(), top()); link(right(), bottom()); break;
        case 10: link(top(), right()); link(left(), bottom()); break;
      }
    }
  }
  const used = new Set();
  const lines = [];
  const walk = (start) => {
    const line = [start];
    used.add(start);
    let cur = start;
    for (;;) {
      const nb = segs.get(cur); let nxt = -1;
      for (const k of nb) if (!used.has(k)) { nxt = k; break; }
      if (nxt < 0) break;
      used.add(nxt); line.push(nxt); cur = nxt;
    }
    return line;
  };
  // open lines first (endpoints have one neighbour)
  for (const [k, nb] of segs) if (nb.length === 1 && !used.has(k)) lines.push({ keys: walk(k), closed: false });
  for (const [k] of segs) if (!used.has(k)) { const ks = walk(k); lines.push({ keys: ks, closed: true }); }
  return lines.map((l) => { const p = l.keys.map((k) => pts.get(k)); if (l.closed) p.push(p[0]); return p; });
}

// Douglas-Peucker simplification.
export function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const ax = pts[a][0], ay = pts[a][1], dx = pts[b][0] - ax, dy = pts[b][1] - ay;
    const l2 = dx * dx + dy * dy;
    let md = 0, mi = -1;
    for (let i = a + 1; i < b; i++) {
      let t = l2 > 0 ? ((pts[i][0] - ax) * dx + (pts[i][1] - ay) * dy) / l2 : 0;
      t = clamp(t, 0, 1);
      const d = Math.hypot(pts[i][0] - ax - dx * t, pts[i][1] - ay - dy * t);
      if (d > md) { md = d; mi = i; }
    }
    if (md > tol && mi > 0) { keep[mi] = 1; stack.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}

// ---------- PNG ----------
export function encodePNG(w, h, data, channels = 4) {
  const stride = w * channels;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(data.buffer, data.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const chunk = (type, body) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(body.length);
    const td = Buffer.concat([Buffer.from(type, 'ascii'), body]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(td) >>> 0);
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = channels === 4 ? 6 : channels === 3 ? 2 : channels === 2 ? 4 : 0; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 6 })), chunk('IEND', Buffer.alloc(0)),
  ]);
}

export function hexToRgb(hex) {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
export function hsvToRgb(h, s, v) {
  h = ((h % 360) + 360) % 360;
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0]; else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c]; else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}
