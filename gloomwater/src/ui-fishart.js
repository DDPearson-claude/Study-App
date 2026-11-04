// ui-fishart.js — hand-inked fish illustrations drawn on a 2D canvas from a species'
// `model` {shape, body, belly, fin, glow, pattern, eyes}. Used by the catch card, the
// journal, the creel and the shop. Undiscovered species render as ink silhouettes.
// Imported only by the ui module.

const INK = '#07080d';
const BONE = '233,226,207';

const hex = (n, d = '#7a8a86') => (typeof n === 'number' && isFinite(n) ? '#' + (n >>> 0).toString(16).padStart(6, '0').slice(-6) : (typeof n === 'string' && n ? n : d));
function rgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mix(a, b, t) { const A = rgb(a), B = rgb(b); return '#' + [0, 1, 2].map((i) => Math.round(A[i] + (B[i] - A[i]) * t).toString(16).padStart(2, '0')).join(''); }
function rgba(h, a) { const [r, g, b] = rgb(h); return `rgba(${r},${g},${b},${a})`; }
function seedRng(str) {
  let s = 2166136261;
  for (let i = 0; i < str.length; i++) { s ^= str.charCodeAt(i); s = Math.imul(s, 16777619); }
  return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ------------------------------------------------------------------ generic body profiles
const SHAPES = {
  minnow:   { top: 0.19, bot: 0.16, hx: 0.22, ped: 0.055, nose: 0.55, tail: 'fork', tailLen: 0.36, spread: 0.30, dorsal: { x0: -0.08, x1: 0.22, h: 0.15, type: 'soft' }, anal: { x0: -0.40, x1: -0.16, h: 0.09 }, pelvic: { x: 0.02, h: 0.09 }, pect: { x: 0.5, len: 0.2 }, eye: { x: 0.74, y: -0.02, r: 0.055 } },
  perch:    { top: 0.29, bot: 0.22, hx: 0.12, ped: 0.07, nose: 0.5, tail: 'fork', tailLen: 0.33, spread: 0.33, dorsal: { x0: -0.28, x1: 0.46, h: 0.22, type: 'spiny' }, anal: { x0: -0.40, x1: -0.14, h: 0.12 }, pelvic: { x: 0.18, h: 0.12 }, pect: { x: 0.46, len: 0.22 }, eye: { x: 0.72, y: -0.05, r: 0.06 } },
  carp:     { top: 0.31, bot: 0.26, hx: 0.04, ped: 0.09, nose: 0.42, tail: 'fork', tailLen: 0.36, spread: 0.40, dorsal: { x0: -0.38, x1: 0.32, h: 0.16, type: 'long' }, anal: { x0: -0.44, x1: -0.22, h: 0.12 }, pelvic: { x: 0.08, h: 0.12 }, pect: { x: 0.46, len: 0.24 }, eye: { x: 0.74, y: -0.06, r: 0.055 }, barbels: true },
  koi:      { top: 0.28, bot: 0.24, hx: 0.05, ped: 0.08, nose: 0.42, tail: 'fan', tailLen: 0.5, spread: 0.46, dorsal: { x0: -0.40, x1: 0.30, h: 0.18, type: 'long' }, anal: { x0: -0.46, x1: -0.24, h: 0.13 }, pelvic: { x: 0.06, h: 0.16 }, pect: { x: 0.44, len: 0.36 }, eye: { x: 0.74, y: -0.06, r: 0.055 }, barbels: true },
  pike:     { top: 0.13, bot: 0.12, hx: -0.05, ped: 0.06, nose: 1.6, snoutLen: 0.0, tail: 'fork', tailLen: 0.30, spread: 0.26, dorsal: { x0: -0.58, x1: -0.32, h: 0.15, type: 'soft' }, anal: { x0: -0.56, x1: -0.34, h: 0.13 }, pelvic: { x: -0.08, h: 0.08 }, pect: { x: 0.42, len: 0.16 }, eye: { x: 0.66, y: -0.04, r: 0.045 }, jaw: true },
  ghost:    { top: 0.17, bot: 0.15, hx: 0.25, ped: 0.04, nose: 0.6, tail: 'ribbon', tailLen: 0.6, spread: 0.22, dorsal: { x0: -0.55, x1: 0.3, h: 0.18, type: 'ribbon' }, anal: { x0: -0.58, x1: 0.05, h: 0.16, type: 'ribbon' }, pelvic: { x: 0.2, h: 0.1 }, pect: { x: 0.5, len: 0.3 }, eye: { x: 0.74, y: -0.03, r: 0.06 }, ghost: true },
  leviathan:{ top: 0.18, bot: 0.17, hx: 0.3, ped: 0.05, nose: 0.75, tail: 'crescent', tailLen: 0.42, spread: 0.42, dorsal: { x0: -0.5, x1: 0.42, h: 0.12, type: 'spines' }, anal: { x0: -0.5, x1: -0.2, h: 0.1 }, pelvic: { x: 0.12, h: 0.12 }, pect: { x: 0.5, len: 0.32 }, eye: { x: 0.76, y: -0.04, r: 0.07 }, scutes: true, ember: true },
};
const BOUNDS = {
  eel: [-1.08, 1.06, -0.32, 0.32], angler: [-1.0, 1.25, -0.72, 0.52], puffer: [-0.9, 0.78, -0.64, 0.64],
  ray: [-1.18, 0.66, -0.64, 0.64], jelly: [-0.58, 0.58, -0.58, 0.82], crayfish: [-0.98, 1.28, -0.66, 0.5],
};

function profile(p, x, side) {   // y of top (side −1) or bottom (side +1) body edge at x
  const px = -0.62, sx = 1.0;
  const t = (x - px) / (sx - px);
  if (t <= 0) return side * p.ped;
  if (t >= 1) return 0;
  const hT = (p.hx - px) / (sx - px);
  const H = side < 0 ? p.top : p.bot;
  let b;
  if (t < hT) b = Math.pow(Math.sin((Math.PI / 2) * (t / hT)), 0.9);
  else b = Math.pow(Math.cos((Math.PI / 2) * ((t - hT) / (1 - hT))), p.nose);
  const tailBlend = t < hT ? (1 - t / hT) : 0;
  return side * (p.ped * tailBlend + H * b * (1 - tailBlend * 0.15) + (t >= hT ? 0 : 0));
}

function smoothPath(path, pts, close) {
  path.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    path.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
  }
  const l = pts[pts.length - 1];
  path.lineTo(l[0], l[1]);
  if (close) path.closePath();
  return path;
}

function genericBody(p) {
  const pts = [];
  const N = 44, px = -0.62, tb = -0.68;
  for (let i = 0; i <= N; i++) { const x = 1 - (i / N) * (1 - px); pts.push([x, profile(p, x, -1)]); }
  pts.push([tb, -p.ped * 0.92]); pts.push([tb, p.ped * 0.92]);
  for (let i = N; i >= 0; i--) { const x = 1 - (i / N) * (1 - px); pts.push([x, profile(p, x, 1)]); }
  return smoothPath(new Path2D(), pts, true);
}

function tailPath(p) {
  const tb = -0.68, L = p.tailLen, S = p.spread, ped = p.ped;
  const t = new Path2D();
  t.moveTo(tb + 0.04, -ped);
  if (p.tail === 'fork') {
    t.quadraticCurveTo(tb - L * 0.45, -S * 0.5, tb - L, -S);
    t.quadraticCurveTo(tb - L * 0.62, -S * 0.32, tb - L * 0.52, 0);
    t.quadraticCurveTo(tb - L * 0.62, S * 0.32, tb - L, S);
    t.quadraticCurveTo(tb - L * 0.45, S * 0.5, tb + 0.04, ped);
  } else if (p.tail === 'crescent') {
    t.quadraticCurveTo(tb - L * 0.35, -S * 0.3, tb - L * 0.9, -S * 1.05);
    t.quadraticCurveTo(tb - L * 0.55, -S * 0.2, tb - L * 0.62, 0);
    t.quadraticCurveTo(tb - L * 0.55, S * 0.2, tb - L * 0.9, S * 1.05);
    t.quadraticCurveTo(tb - L * 0.35, S * 0.3, tb + 0.04, ped);
  } else if (p.tail === 'fan') {
    t.bezierCurveTo(tb - L * 0.3, -S * 0.7, tb - L * 0.8, -S * 1.15, tb - L, -S * 0.75);
    t.bezierCurveTo(tb - L * 1.08, -S * 0.35, tb - L * 0.8, -S * 0.15, tb - L * 0.95, 0);
    t.bezierCurveTo(tb - L * 0.8, S * 0.15, tb - L * 1.08, S * 0.35, tb - L, S * 0.75);
    t.bezierCurveTo(tb - L * 0.8, S * 1.15, tb - L * 0.3, S * 0.7, tb + 0.04, ped);
  } else if (p.tail === 'ribbon') {
    t.bezierCurveTo(tb - L * 0.3, -S * 0.9, tb - L * 0.7, S * 0.2, tb - L, -S * 0.35);
    t.bezierCurveTo(tb - L * 0.85, S * 0.1, tb - L * 0.95, S * 0.5, tb - L * 0.75, S * 0.7);
    t.bezierCurveTo(tb - L * 0.5, S * 0.6, tb - L * 0.2, S * 0.4, tb + 0.04, ped);
  } else {   // round
    t.bezierCurveTo(tb - L * 0.5, -S, tb - L * 1.1, -S * 0.6, tb - L, 0);
    t.bezierCurveTo(tb - L * 1.1, S * 0.6, tb - L * 0.5, S, tb + 0.04, ped);
  }
  t.closePath();
  return t;
}

function finAlong(p, f, side, rng) {
  const path = new Path2D();
  const N = 14;
  const base = [];
  for (let i = 0; i <= N; i++) { const x = f.x0 + (f.x1 - f.x0) * (i / N); base.push([x, profile(p, x, side) * 0.9]); }
  const edge = [];
  for (let i = N; i >= 0; i--) {
    const u = i / N;
    let hh;
    if (f.type === 'spiny') hh = f.h * (0.55 + 0.45 * Math.sin(Math.PI * Math.pow(u, 0.6))) * (i % 2 ? 0.72 : 1.08);
    else if (f.type === 'long') hh = f.h * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.15)), 0.5) * (0.55 + 0.45 * u);
    else if (f.type === 'ribbon') hh = f.h * (0.4 + 0.6 * Math.sin(Math.PI * u)) * (1 + 0.15 * Math.sin(u * 13));
    else if (f.type === 'spines') hh = f.h * (i % 2 ? 0.25 : 1) * (0.5 + 0.5 * Math.sin(Math.PI * u));
    else hh = f.h * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.75)), 0.8);
    const x = f.x0 + (f.x1 - f.x0) * u - hh * 0.55;       // raked backward
    edge.push([x, profile(p, f.x0 + (f.x1 - f.x0) * u, side) + side * hh]);
  }
  path.moveTo(base[0][0], base[0][1]);
  for (const q of base) path.lineTo(q[0], q[1]);
  if (f.type === 'spiny' || f.type === 'spines') for (const q of edge) path.lineTo(q[0], q[1]);
  else { const e = edge; for (let i = 0; i < e.length - 1; i++) path.quadraticCurveTo(e[i][0], e[i][1], (e[i][0] + e[i + 1][0]) / 2, (e[i][1] + e[i + 1][1]) / 2); path.lineTo(e[e.length - 1][0], e[e.length - 1][1]); }
  path.closePath();
  return { path, base, edge };
}

// ------------------------------------------------------------------ drawing helpers
function drawEye(g, x, y, r, kind, col, U, sil) {
  if (sil) { g.fillStyle = `rgba(${BONE},.12)`; g.beginPath(); g.arc(x, y, r * 0.7, 0, 7); g.fill(); return; }
  if (kind === 'glow') {
    g.save(); g.shadowColor = col.glowEye; g.shadowBlur = 14;
    g.fillStyle = col.glowEye; g.beginPath(); g.arc(x, y, r * 1.05, 0, 7); g.fill(); g.restore();
    g.fillStyle = '#fffbe8'; g.beginPath(); g.arc(x, y, r * 0.45, 0, 7); g.fill();
  } else if (kind === 'blind') {
    g.fillStyle = '#d9d6cc'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    g.fillStyle = 'rgba(160,170,175,.6)'; g.beginPath(); g.arc(x + r * 0.15, y + r * 0.1, r * 0.55, 0, 7); g.fill();
    g.strokeStyle = INK; g.lineWidth = 1.2 * U; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
  } else {
    g.fillStyle = '#e9e2cf'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    g.fillStyle = INK; g.beginPath(); g.arc(x + r * 0.12, y, r * 0.62, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(x - r * 0.15, y - r * 0.28, r * 0.22, 0, 7); g.fill();
    g.strokeStyle = INK; g.lineWidth = 1.2 * U; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
  }
}

function finFill(g, path, col, U, sil, alpha = 0.85) {
  if (sil) { g.fillStyle = '#0b0d12'; g.fill(path); g.strokeStyle = `rgba(${BONE},.16)`; g.lineWidth = 1.1 * U; g.stroke(path); return; }
  g.fillStyle = rgba(col.fin, alpha); g.fill(path);
  g.strokeStyle = INK; g.lineWidth = 1.8 * U; g.stroke(path);
}

function finRays(g, path, from, to, count, col, U, sil) {
  if (sil) return;
  g.save(); g.clip(path);
  g.strokeStyle = 'rgba(7,8,13,.35)'; g.lineWidth = 0.9 * U;
  for (let i = 0; i < count; i++) {
    const u = (i + 0.5) / count;
    g.beginPath(); g.moveTo(from(u)[0], from(u)[1]); g.lineTo(to(u)[0], to(u)[1]); g.stroke();
  }
  g.restore();
}

function bodyShade(g, path, col, bounds, U, sil, alpha = 1) {
  const [x0, x1, y0, y1] = bounds;
  if (sil) { g.fillStyle = '#0b0d12'; g.fill(path); return; }
  const lg = g.createLinearGradient(0, y0, 0, y1);
  lg.addColorStop(0, mix(col.body, '#000000', 0.35));
  lg.addColorStop(0.35, col.body);
  lg.addColorStop(0.62, mix(col.body, col.belly, 0.55));
  lg.addColorStop(1, col.belly);
  g.save(); g.globalAlpha = alpha; g.fillStyle = lg; g.fill(path);
  // soft core shadow toward the tail and under the back
  const rg = g.createRadialGradient(x1 * 0.4, y0 * 0.2, 0.05, x1 * 0.2, 0, Math.max(0.6, (x1 - x0) * 0.7));
  rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,.42)');
  g.fillStyle = rg; g.fill(path);
  g.restore();
}

function pattern(g, path, kind, col, bounds, rng, U, sil) {
  if (sil || !kind || kind === 'none') return;
  const [x0, x1, y0, y1] = bounds;
  g.save(); g.clip(path);
  if (kind === 'scales') {
    const s = 0.065;
    g.lineWidth = 0.9 * U;
    for (let y = y0, row = 0; y < y1 + s; y += s * 0.62, row++) {
      for (let x = x0 + (row % 2 ? s / 2 : 0); x < x1 + s; x += s) {
        g.strokeStyle = 'rgba(7,8,13,.28)';
        g.beginPath(); g.arc(x, y, s * 0.55, Math.PI * 0.15, Math.PI * 0.85); g.stroke();
        g.strokeStyle = `rgba(${BONE},.07)`;
        g.beginPath(); g.arc(x, y - U * 0.8, s * 0.55, Math.PI * 0.25, Math.PI * 0.75); g.stroke();
      }
    }
  } else if (kind === 'stripes') {
    g.fillStyle = rgba(mix(col.body, '#000000', 0.55), 0.55);
    const n = 6;
    for (let i = 0; i < n; i++) {
      const x = x0 + (x1 - x0) * (0.18 + 0.62 * (i / (n - 1))) + (rng() - 0.5) * 0.03;
      const w = 0.035 + rng() * 0.03;
      g.beginPath(); g.moveTo(x - w, y0); g.quadraticCurveTo(x + 0.04, 0, x - w * 0.4, y1 * 0.4); g.lineTo(x + w * 0.4, y1 * 0.4); g.quadraticCurveTo(x + 0.04 + w, 0, x + w, y0); g.fill();
    }
  } else if (kind === 'bands') {
    g.strokeStyle = 'rgba(7,8,13,.30)'; g.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      g.lineWidth = (0.03 + k * 0.006);
      const off = y0 + (y1 - y0) * (0.28 + k * 0.16);
      g.beginPath(); g.moveTo(x0, off * 0.5); g.quadraticCurveTo((x0 + x1) / 2, off, x1, off * 0.3); g.stroke();
    }
  } else if (kind === 'spots') {
    const n = 16;
    for (let i = 0; i < n; i++) {
      const x = x0 + (x1 - x0) * (0.12 + rng() * 0.75), y = y0 + (y1 - y0) * (0.12 + rng() * 0.55);
      const r = 0.018 + rng() * 0.035;
      if (col.glow) { g.save(); g.shadowColor = col.glow; g.shadowBlur = 8; g.fillStyle = rgba(col.glow, 0.85); g.beginPath(); g.arc(x, y, r * 0.8, 0, 7); g.fill(); g.restore(); }
      else { g.fillStyle = rng() < 0.5 ? rgba(col.fin, 0.75) : 'rgba(7,8,13,.35)'; g.beginPath(); g.ellipse(x, y, r * 1.3, r, 0, 0, 7); g.fill(); }
    }
  }
  g.restore();
}

function rimLight(g, path, U, sil) {
  g.save(); g.clip(path);
  g.translate(-1.2 * U, -2.0 * U);
  g.strokeStyle = sil ? `rgba(${BONE},.10)` : `rgba(${BONE},.42)`;
  g.lineWidth = 2.4 * U; g.stroke(path);
  g.restore();
}

function outline(g, path, U, sil, w = 2.6) {
  g.strokeStyle = sil ? `rgba(${BONE},.22)` : INK;
  g.lineWidth = (sil ? 1.2 : w) * U; g.lineJoin = 'round'; g.stroke(path);
}

function halo(g, path, colStr, blur, sil) {
  if (sil || !colStr) return;
  g.save(); g.shadowColor = colStr; g.shadowBlur = blur; g.fillStyle = rgba(colStr, 0.25); g.fill(path); g.restore();
}

// ------------------------------------------------------------------ shapes
function drawGeneric(g, p, col, U, sil, rng, m) {
  const body = genericBody(p);
  const bb = [-0.68, 1.0, -p.top, p.bot];
  const tail = tailPath(p);
  if (col.glow && !sil) { g.save(); g.shadowColor = col.glow; g.shadowBlur = 26; g.fillStyle = rgba(col.glow, 0.18); g.fill(body); g.fill(tail); g.restore(); }
  // back fins
  const dorsal = finAlong(p, p.dorsal, -1, rng);
  const anal = finAlong(p, { type: 'soft', ...p.anal }, 1, rng);
  const ghostA = p.ghost ? 0.45 : 0.85;
  finFill(g, tail, col, U, sil, p.ghost ? 0.4 : 0.9);
  finRays(g, tail, (u) => [-0.66, (u - 0.5) * p.ped * 1.6], (u) => [-0.68 - p.tailLen * 1.05, (u - 0.5) * p.spread * 2.3], 9, col, U, sil);
  finFill(g, dorsal.path, col, U, sil, ghostA);
  finRays(g, dorsal.path, (u) => dorsal.base[Math.round(u * (dorsal.base.length - 1))], (u) => dorsal.edge[dorsal.edge.length - 1 - Math.round(u * (dorsal.edge.length - 1))], 10, col, U, sil);
  finFill(g, anal.path, col, U, sil, ghostA);
  // pelvic
  if (p.pelvic) {
    const x = p.pelvic.x, y = profile(p, x, 1) * 0.9, h = p.pelvic.h;
    const pv = new Path2D(); pv.moveTo(x + 0.06, y); pv.quadraticCurveTo(x - 0.02, y + h * 0.7, x - 0.1, y + h); pv.quadraticCurveTo(x - 0.04, y + h * 0.4, x - 0.06, y); pv.closePath();
    finFill(g, pv, col, U, sil, ghostA);
  }
  bodyShade(g, body, col, bb, U, sil, p.ghost ? 0.62 : 1);
  pattern(g, body, m.pattern, col, bb, rng, U, sil);
  if (!sil) {
    g.save(); g.clip(body);
    // lateral line
    g.strokeStyle = col.glow ? rgba(col.glow, 0.5) : 'rgba(7,8,13,.25)'; g.lineWidth = 1 * U;
    g.beginPath(); g.moveTo(0.68, -p.top * 0.15);
    g.quadraticCurveTo(0.1, -p.top * 0.32, -0.62, -p.ped * 0.1); g.stroke();
    if (p.scutes) {
      g.fillStyle = `rgba(${BONE},.22)`; g.strokeStyle = 'rgba(7,8,13,.45)'; g.lineWidth = 0.9 * U;
      for (let i = 0; i < 11; i++) { const x = 0.55 - i * 0.11, y = -p.top * 0.25 * (1 - i / 14); g.beginPath(); g.moveTo(x + 0.035, y); g.lineTo(x, y - 0.025); g.lineTo(x - 0.035, y); g.lineTo(x, y + 0.025); g.closePath(); g.fill(); g.stroke(); }
    }
    if (p.ember) {
      const eg = g.createRadialGradient(0.15, 0.06, 0, 0.15, 0.06, 0.22);
      eg.addColorStop(0, 'rgba(255,236,170,.95)'); eg.addColorStop(0.35, 'rgba(232,198,106,.55)'); eg.addColorStop(1, 'rgba(232,198,106,0)');
      g.fillStyle = eg; g.beginPath(); g.arc(0.15, 0.06, 0.22, 0, 7); g.fill();
    }
    // gill arc
    g.strokeStyle = 'rgba(7,8,13,.55)'; g.lineWidth = 1.5 * U;
    const gx = p.eye.x - 0.17;
    g.beginPath(); g.moveTo(gx + 0.02, profile(p, gx, -1) * 0.8); g.quadraticCurveTo(gx - 0.06, 0, gx + 0.03, profile(p, gx, 1) * 0.75); g.stroke();
    g.restore();
  }
  rimLight(g, body, U, sil);
  outline(g, body, U, sil);
  // jaw / mouth
  if (!sil) {
    g.strokeStyle = INK; g.lineWidth = 1.4 * U; g.beginPath();
    if (p.jaw) { g.moveTo(1.0, 0.0); g.lineTo(0.7, 0.025); } else { g.moveTo(0.995, profile(p, 0.99, 1) * 0.3 + 0.01); g.quadraticCurveTo(0.94, 0.03, 0.9, 0.025); }
    g.stroke();
    if (p.barbels) { g.strokeStyle = rgba(col.fin, 0.9); g.lineWidth = 1.1 * U; g.beginPath(); g.moveTo(0.95, 0.04); g.quadraticCurveTo(0.98, 0.12, 0.9, 0.16); g.moveTo(0.9, 0.05); g.quadraticCurveTo(0.9, 0.14, 0.82, 0.17); g.stroke(); }
  }
  // pectoral fin on top of the body
  if (p.pect) {
    const x = p.pect.x, y = profile(p, x, 1) * 0.25, L = p.pect.len;
    const pc = new Path2D(); pc.moveTo(x, y - 0.02); pc.bezierCurveTo(x - L * 0.4, y - 0.05, x - L, y + 0.02, x - L * 0.95, y + L * 0.35); pc.bezierCurveTo(x - L * 0.6, y + L * 0.25, x - L * 0.2, y + 0.08, x, y + 0.03); pc.closePath();
    finFill(g, pc, col, U, sil, p.ghost ? 0.4 : 0.72);
  }
  drawEye(g, p.eye.x, p.eye.y, p.eye.r, m.eyes, col, U, sil);
  return [-0.68 - p.tailLen * 1.02, 1.02, -(p.top + p.dorsal.h * 0.95), p.bot + Math.max(p.anal.h, p.pelvic?.h || 0) * 1.05];
}

function drawEel(g, col, U, sil, rng, m) {
  const N = 60, pts = [], top = [], bot = [];
  const A = 0.07, k = 3.4;
  for (let i = 0; i <= N; i++) {
    const u = i / N, x = 1 - u * 2.05;
    const y = A * Math.sin(k * (1 - u) * Math.PI * 0.62 + 0.4) * (0.4 + u);
    const dy = A * Math.cos(k * (1 - u) * Math.PI * 0.62 + 0.4) * k * Math.PI * 0.62 * -1 / 2.05;
    const nl = Math.hypot(1, dy); const nx = -dy / nl, ny = 1 / nl;
    const h = 0.085 * Math.pow(Math.sin(Math.PI * Math.min(1, (u * 0.92 + 0.08))), 0.35) * (1 - u * 0.75) + 0.008;
    pts.push([x, y]); top.push([x - nx * h, y - ny * h]); bot.push([x + nx * h, y + ny * h]);
  }
  const body = new Path2D(); smoothPath(body, [...top, ...bot.reverse()], true);
  // fin fringe
  const fin = new Path2D(); const ft = [], fb = [];
  for (let i = 18; i <= N; i++) { const t = top[i], b = bot[N - i]; const w = 0.035 + 0.02 * Math.sin(i * 0.9); ft.push([t[0], t[1] - w]); fb.push([b[0], b[1] + w]); }
  smoothPath(fin, [...ft, ...fb.reverse()], true);
  if (col.glow && !sil) { g.save(); g.shadowColor = col.glow; g.shadowBlur = 24; g.fillStyle = rgba(col.glow, 0.2); g.fill(body); g.restore(); }
  finFill(g, fin, col, U, sil, 0.6);
  bodyShade(g, body, col, [-1.05, 1, -0.12, 0.12], U, sil);
  pattern(g, body, m.pattern, col, [-1.05, 1, -0.12, 0.12], rng, U, sil);
  rimLight(g, body, U, sil); outline(g, body, U, sil);
  if (!sil) { g.strokeStyle = INK; g.lineWidth = 1.3 * U; g.beginPath(); g.moveTo(0.99, pts[0][1] + 0.02); g.lineTo(0.9, pts[3][1] + 0.03); g.stroke(); }
  drawEye(g, 0.9, pts[3][1] - 0.025, 0.03, m.eyes, col, U, sil);
  return BOUNDS.eel;
}

function drawAngler(g, col, U, sil, rng, m) {
  const p = { top: 0.4, bot: 0.34, hx: 0.42, ped: 0.06, nose: 0.38, tail: 'round', tailLen: 0.28, spread: 0.24, dorsal: { x0: -0.4, x1: -0.05, h: 0.12, type: 'soft' }, anal: { x0: -0.45, x1: -0.2, h: 0.1 }, pelvic: null, pect: { x: 0.28, len: 0.22 }, eye: { x: 0.62, y: -0.2, r: 0.045 } };
  const body = genericBody(p);
  const tail = tailPath(p);
  const glowCol = col.glow || '#ffe2a8';
  // lure stalk & bulb
  const stalk = new Path2D(); stalk.moveTo(0.6, -0.36); stalk.bezierCurveTo(0.7, -0.75, 1.05, -0.78, 1.12, -0.52);
  finFill(g, tail, col, U, sil, 0.85);
  const dorsal = finAlong(p, p.dorsal, -1, rng); finFill(g, dorsal.path, col, U, sil, 0.8);
  const anal = finAlong(p, { type: 'soft', ...p.anal }, 1, rng); finFill(g, anal.path, col, U, sil, 0.8);
  bodyShade(g, body, col, [-0.68, 1, -p.top, p.bot], U, sil);
  pattern(g, body, m.pattern, col, [-0.68, 1, -p.top, p.bot], rng, U, sil);
  rimLight(g, body, U, sil); outline(g, body, U, sil);
  // mouth with teeth
  const mouth = new Path2D(); mouth.moveTo(1.0, -0.02); mouth.quadraticCurveTo(0.8, 0.02, 0.55, 0.06); mouth.quadraticCurveTo(0.8, 0.2, 0.99, 0.06); mouth.closePath();
  g.fillStyle = sil ? '#0b0d12' : '#120a0a'; g.fill(mouth); g.strokeStyle = sil ? `rgba(${BONE},.2)` : INK; g.lineWidth = 1.6 * U; g.stroke(mouth);
  if (!sil) {
    g.fillStyle = '#e9e2cf';
    for (let i = 0; i < 7; i++) { const x = 0.6 + i * 0.055; const yT = 0.035 - (x - 0.6) * 0.1; g.beginPath(); g.moveTo(x, yT); g.lineTo(x + 0.018, yT); g.lineTo(x + 0.009, yT + 0.05); g.closePath(); g.fill(); }
    for (let i = 0; i < 6; i++) { const x = 0.62 + i * 0.06; const yB = 0.12 - (x - 0.6) * 0.15; g.beginPath(); g.moveTo(x, yB); g.lineTo(x + 0.018, yB); g.lineTo(x + 0.009, yB - 0.045); g.closePath(); g.fill(); }
  }
  g.strokeStyle = sil ? `rgba(${BONE},.2)` : INK; g.lineWidth = 2.2 * U; g.stroke(stalk);
  if (!sil) {
    g.save(); g.shadowColor = glowCol; g.shadowBlur = 22; g.fillStyle = glowCol; g.beginPath(); g.arc(1.12, -0.5, 0.055, 0, 7); g.fill(); g.restore();
    g.fillStyle = '#fffbe8'; g.beginPath(); g.arc(1.12, -0.5, 0.025, 0, 7); g.fill();
  } else { g.fillStyle = `rgba(${BONE},.18)`; g.beginPath(); g.arc(1.12, -0.5, 0.05, 0, 7); g.fill(); }
  const pc = new Path2D(); const x = p.pect.x, y = 0.1; pc.moveTo(x, y); pc.quadraticCurveTo(x - 0.22, y + 0.02, x - 0.2, y + 0.18); pc.quadraticCurveTo(x - 0.08, y + 0.12, x, y + 0.05); pc.closePath();
  finFill(g, pc, col, U, sil, 0.7);
  drawEye(g, p.eye.x, p.eye.y, p.eye.r, m.eyes, col, U, sil);
  return BOUNDS.angler;
}

function drawPuffer(g, col, U, sil, rng, m) {
  const cx = 0.05, rx = 0.55, ry = 0.46;
  const body = new Path2D(); body.ellipse(cx, 0, rx, ry, 0, 0, 7);
  // spikes
  const sp = new Path2D();
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2; if (Math.cos(a) > 0.85) continue;
    const bx = cx + Math.cos(a) * rx * 0.96, by = Math.sin(a) * ry * 0.96;
    const L = 0.07 + 0.03 * ((i * 7) % 3);
    sp.moveTo(bx - Math.sin(a) * 0.018, by + Math.cos(a) * 0.018); sp.lineTo(bx + Math.cos(a) * L, by + Math.sin(a) * L); sp.lineTo(bx + Math.sin(a) * 0.018, by - Math.cos(a) * 0.018);
  }
  const tail = new Path2D(); tail.moveTo(-0.46, -0.06); tail.quadraticCurveTo(-0.7, -0.22, -0.82, -0.14); tail.quadraticCurveTo(-0.74, 0, -0.82, 0.14); tail.quadraticCurveTo(-0.7, 0.22, -0.46, 0.06); tail.closePath();
  const dors = new Path2D(); dors.moveTo(-0.2, -0.42); dors.quadraticCurveTo(-0.38, -0.62, -0.46, -0.5); dors.quadraticCurveTo(-0.36, -0.42, -0.34, -0.34); dors.closePath();
  if (col.glow && !sil) halo(g, body, col.glow, 24, sil);
  finFill(g, tail, col, U, sil, 0.85); finFill(g, dors, col, U, sil, 0.85);
  g.fillStyle = sil ? '#0b0d12' : mix(col.body, '#000000', 0.3); g.fill(sp);
  g.strokeStyle = sil ? `rgba(${BONE},.16)` : INK; g.lineWidth = 1.2 * U; g.stroke(sp);
  bodyShade(g, body, col, [-0.5, 0.6, -ry, ry], U, sil);
  pattern(g, body, m.pattern, col, [-0.5, 0.6, -ry, ry], rng, U, sil);
  rimLight(g, body, U, sil); outline(g, body, U, sil);
  if (!sil) { g.strokeStyle = INK; g.lineWidth = 1.6 * U; g.beginPath(); g.moveTo(0.6, 0.02); g.quadraticCurveTo(0.56, 0.07, 0.5, 0.06); g.stroke(); }
  const pc = new Path2D(); pc.moveTo(0.22, 0.04); pc.quadraticCurveTo(0.08, 0.0, 0.04, 0.14); pc.quadraticCurveTo(0.14, 0.14, 0.22, 0.1); pc.closePath();
  finFill(g, pc, col, U, sil, 0.75);
  drawEye(g, 0.38, -0.12, 0.075, m.eyes, col, U, sil);
  return BOUNDS.puffer;
}

function drawRay(g, col, U, sil, rng, m) {
  const disc = new Path2D();
  disc.moveTo(0.62, 0);
  disc.bezierCurveTo(0.5, -0.24, 0.2, -0.6, -0.05, -0.6);
  disc.bezierCurveTo(-0.2, -0.45, -0.35, -0.2, -0.45, 0);
  disc.bezierCurveTo(-0.35, 0.2, -0.2, 0.45, -0.05, 0.6);
  disc.bezierCurveTo(0.2, 0.6, 0.5, 0.24, 0.62, 0);
  disc.closePath();
  const tail = new Path2D(); tail.moveTo(-0.42, -0.025); tail.bezierCurveTo(-0.7, -0.03, -0.95, 0.06, -1.15, 0.02); tail.lineTo(-1.15, 0.03); tail.bezierCurveTo(-0.95, 0.08, -0.7, 0.03, -0.42, 0.025); tail.closePath();
  if (col.glow && !sil) halo(g, disc, col.glow, 24, sil);
  finFill(g, tail, col, U, sil, 0.95);
  if (sil) { g.fillStyle = '#0b0d12'; g.fill(disc); }
  else {
    const rg = g.createRadialGradient(0.1, 0, 0.05, 0.05, 0, 0.66);
    rg.addColorStop(0, mix(col.body, col.belly, 0.25)); rg.addColorStop(0.6, col.body); rg.addColorStop(1, mix(col.fin, '#000000', 0.25));
    g.fillStyle = rg; g.fill(disc);
  }
  pattern(g, disc, m.pattern, col, [-0.45, 0.62, -0.6, 0.6], rng, U, sil);
  if (!sil) { g.save(); g.clip(disc); g.strokeStyle = 'rgba(7,8,13,.22)'; g.lineWidth = 1 * U; for (let i = 1; i < 4; i++) { g.beginPath(); g.ellipse(0.05, 0, 0.12 * i + 0.05, 0.14 * i + 0.04, 0, 0, 7); g.stroke(); } g.restore(); }
  rimLight(g, disc, U, sil); outline(g, disc, U, sil);
  drawEye(g, 0.34, -0.11, 0.035, m.eyes, col, U, sil); drawEye(g, 0.34, 0.11, 0.035, m.eyes, col, U, sil);
  return BOUNDS.ray;
}

function drawJelly(g, col, U, sil, rng, m) {
  const bell = new Path2D();
  bell.moveTo(-0.48, 0.05);
  bell.bezierCurveTo(-0.5, -0.4, -0.25, -0.55, 0, -0.55);
  bell.bezierCurveTo(0.25, -0.55, 0.5, -0.4, 0.48, 0.05);
  for (let i = 0; i < 8; i++) { const x0 = 0.48 - i * 0.12, x1 = x0 - 0.12; bell.quadraticCurveTo((x0 + x1) / 2, 0.12, x1, 0.05); }
  bell.closePath();
  const glowCol = col.glow || col.belly;
  // tentacles
  g.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const x = -0.42 + i * 0.105;
    g.strokeStyle = sil ? `rgba(${BONE},.12)` : rgba(col.fin, 0.55); g.lineWidth = 1.3 * U;
    g.beginPath(); g.moveTo(x, 0.06);
    for (let k = 1; k <= 8; k++) g.lineTo(x + Math.sin(k * 0.9 + i) * 0.03, 0.06 + k * 0.09 * (0.7 + 0.3 * ((i * 3) % 4) / 3));
    g.stroke();
  }
  for (let i = 0; i < 3; i++) {
    const x = -0.12 + i * 0.12;
    const arm = new Path2D(); arm.moveTo(x - 0.03, 0.05);
    arm.bezierCurveTo(x - 0.1, 0.25, x + 0.08, 0.4, x - 0.02, 0.62); arm.bezierCurveTo(x + 0.1, 0.42, x + 0.06, 0.24, x + 0.04, 0.05); arm.closePath();
    finFill(g, arm, { ...col, fin: col.belly }, U, sil, 0.6);
  }
  if (!sil) { g.save(); g.shadowColor = glowCol; g.shadowBlur = 30; g.fillStyle = rgba(glowCol, 0.3); g.fill(bell); g.restore(); }
  if (sil) { g.fillStyle = '#0b0d12'; g.fill(bell); }
  else {
    const lg = g.createLinearGradient(0, -0.55, 0, 0.1);
    lg.addColorStop(0, rgba(mix(col.body, '#ffffff', 0.15), 0.9));
    lg.addColorStop(1, rgba(col.body, 0.55));
    g.fillStyle = lg; g.fill(bell);
    g.save(); g.clip(bell);
    g.strokeStyle = rgba(col.belly, 0.6); g.lineWidth = 2 * U;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-0.18 + i * 0.12, -0.12, 0.05, Math.PI, 0); g.stroke(); }
    g.restore();
  }
  rimLight(g, bell, U, sil); outline(g, bell, U, sil, 2);
  if (!sil) { for (let i = 0; i < 7; i++) { const x = -0.4 + i * 0.133; g.save(); g.shadowColor = glowCol; g.shadowBlur = 8; g.fillStyle = glowCol; g.beginPath(); g.arc(x, 0.065, 0.014, 0, 7); g.fill(); g.restore(); } }
  return BOUNDS.jelly;
}

function drawCrayfish(g, col, U, sil, rng, m) {
  const shell = new Path2D();
  shell.moveTo(0.72, -0.06); shell.lineTo(0.56, -0.12);
  shell.bezierCurveTo(0.44, -0.24, 0.1, -0.24, -0.02, -0.16);
  shell.lineTo(-0.02, 0.08); shell.bezierCurveTo(0.12, 0.14, 0.44, 0.14, 0.56, 0.04); shell.closePath();
  const segs = [];
  for (let i = 0; i < 5; i++) {
    const x0 = -0.02 - i * 0.12, x1 = x0 - 0.13, yo = i * i * 0.012;
    const s = new Path2D(); s.moveTo(x0, -0.15 + yo + i * 0.008); s.quadraticCurveTo((x0 + x1) / 2, -0.19 + yo, x1, -0.13 + yo + i * 0.012); s.lineTo(x1 + 0.01, 0.06 + yo * 1.2); s.quadraticCurveTo((x0 + x1) / 2, 0.1 + yo, x0, 0.07 + yo); s.closePath();
    segs.push(s);
  }
  const fan = new Path2D(); fan.moveTo(-0.62, -0.05 + 0.2); fan.lineTo(-0.9, -0.08 + 0.26); fan.quadraticCurveTo(-0.96, 0.28, -0.88, 0.4); fan.lineTo(-0.6, 0.24); fan.closePath();
  g.lineCap = 'round';
  // antennae & legs
  g.strokeStyle = sil ? `rgba(${BONE},.18)` : rgba(col.fin, 0.95); g.lineWidth = 1.3 * U;
  g.beginPath(); g.moveTo(0.66, -0.1); g.bezierCurveTo(0.9, -0.4, 1.1, -0.55, 1.26, -0.6); g.moveTo(0.64, -0.08); g.bezierCurveTo(0.95, -0.25, 1.15, -0.32, 1.27, -0.3); g.stroke();
  g.strokeStyle = sil ? `rgba(${BONE},.18)` : INK; g.lineWidth = 1.6 * U;
  for (let i = 0; i < 4; i++) { const x = 0.42 - i * 0.11; g.beginPath(); g.moveTo(x, 0.1); g.lineTo(x - 0.03, 0.24); g.lineTo(x - 0.08, 0.3); g.stroke(); }
  // claw arm
  const claw = new Path2D(); claw.moveTo(0.5, 0.06); claw.quadraticCurveTo(0.7, 0.2, 0.84, 0.14); claw.bezierCurveTo(0.98, 0.04, 1.18, 0.06, 1.24, 0.12); claw.lineTo(1.02, 0.15); claw.bezierCurveTo(1.16, 0.2, 1.2, 0.27, 1.16, 0.3); claw.bezierCurveTo(1.0, 0.32, 0.86, 0.27, 0.8, 0.22); claw.quadraticCurveTo(0.66, 0.24, 0.46, 0.12); claw.closePath();
  finFill(g, fan, col, U, sil, 0.92);
  for (let i = segs.length - 1; i >= 0; i--) { bodyShade(g, segs[i], col, [-0.7, 0, -0.2, 0.15], U, sil); pattern(g, segs[i], m.pattern === 'bands' ? 'none' : m.pattern, col, [-0.7, 0, -0.2, 0.15], rng, U, sil); rimLight(g, segs[i], U, sil); outline(g, segs[i], U, sil, 2); }
  bodyShade(g, shell, col, [0, 0.72, -0.24, 0.14], U, sil); pattern(g, shell, m.pattern, col, [0, 0.72, -0.24, 0.14], rng, U, sil);
  rimLight(g, shell, U, sil); outline(g, shell, U, sil, 2.2);
  bodyShade(g, claw, col, [0.45, 1.25, 0.04, 0.32], U, sil); rimLight(g, claw, U, sil); outline(g, claw, U, sil, 2);
  if (!sil) { g.strokeStyle = 'rgba(7,8,13,.5)'; g.lineWidth = 1.2 * U; g.beginPath(); g.moveTo(0.3, -0.2); g.quadraticCurveTo(0.26, -0.04, 0.32, 0.1); g.stroke(); }
  drawEye(g, 0.6, -0.16, 0.03, m.eyes, col, U, sil);
  return BOUNDS.crayfish;
}

// ------------------------------------------------------------------ public
const cache = new Map();

/**
 * Draw a species onto a canvas element (CSS size w×h). opts: {silhouette, pad, flip}
 * Returns the canvas.
 */
export function drawFish(canvas, species, opts = {}) {
  const w = opts.w || canvas.clientWidth || canvas.width || 160;
  const h = opts.h || canvas.clientHeight || canvas.height || 90;
  const dpr = Math.min(2, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1);
  const sil = !!opts.silhouette;
  const id = species?.id || 'unknown';
  const key = `${id}|${w}|${h}|${sil ? 1 : 0}|${dpr}|${opts.pad ?? ''}`;
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  if (!canvas.style.width) { canvas.style.width = w + 'px'; canvas.style.height = h + 'px'; }
  const g = canvas.getContext('2d');
  if (!g) return canvas;
  const hit = cache.get(key);
  if (hit) { g.clearRect(0, 0, canvas.width, canvas.height); g.drawImage(hit, 0, 0); return canvas; }
  const off = document.createElement('canvas');
  off.width = canvas.width; off.height = canvas.height;
  paint(off.getContext('2d'), off.width, off.height, species, sil, opts.pad ?? 0.08, dpr);
  if (cache.size > 160) cache.delete(cache.keys().next().value);
  cache.set(key, off);
  g.clearRect(0, 0, canvas.width, canvas.height);
  g.drawImage(off, 0, 0);
  return canvas;
}

function paint(g, W, H, species, sil, pad, dpr) {
  const m = species?.model || {};
  const shape = m.shape || 'minnow';
  const col = { body: hex(m.body, '#5f716c'), belly: hex(m.belly, '#cdd6c8'), fin: hex(m.fin, '#34433f'), glow: m.glow != null ? hex(m.glow) : null };
  col.glowEye = col.glow || '#ffd98a';
  const rng = seedRng(species?.id || 'x');
  const p = SHAPES[shape];
  let bounds;
  if (p) {
    bounds = [-0.68 - p.tailLen * 1.02, 1.02, -(p.top + p.dorsal.h * 0.95), p.bot + Math.max(p.anal.h, p.pelvic?.h || 0) * 1.05];
  } else bounds = BOUNDS[shape] || BOUNDS.eel;
  const [x0, x1, y0, y1] = bounds;
  const bw = x1 - x0, bh = y1 - y0;
  const avail = Math.min((W * (1 - pad * 2)) / bw, (H * (1 - pad * 2)) / bh);
  const scale = avail;
  const ox = W / 2 - ((x0 + x1) / 2) * scale, oy = H / 2 - ((y0 + y1) / 2) * scale;
  g.save();
  g.setTransform(scale, 0, 0, scale, ox, oy);
  const U = dpr / scale;      // one CSS px in unit space
  g.lineJoin = 'round';
  try {
    if (p) drawGeneric(g, p, col, U, sil, rng, m);
    else if (shape === 'eel') drawEel(g, col, U, sil, rng, m);
    else if (shape === 'angler') drawAngler(g, col, U, sil, rng, m);
    else if (shape === 'puffer') drawPuffer(g, col, U, sil, rng, m);
    else if (shape === 'ray') drawRay(g, col, U, sil, rng, m);
    else if (shape === 'jelly') drawJelly(g, col, U, sil, rng, m);
    else if (shape === 'crayfish') drawCrayfish(g, col, U, sil, rng, m);
    else drawGeneric(g, SHAPES.minnow, col, U, sil, rng, m);
  } catch (e) { /* never break a screen over an illustration */ }
  g.restore();
}
