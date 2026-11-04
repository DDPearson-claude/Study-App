// world-paint.js — canvas painters for the parallax silhouette rings (world author).
// Each ring is painted once per zone build into a 2-channel mask:
//   R = ink silhouette (rising architecture from the mist + things hanging from the vault)
//   G = glow (lit windows, lanterns, crystal tips, candle flames, glowing caps)
// Painting is done in METRES (world units on the cylinder) so shapes keep their
// proportions regardless of texture size / repeat.
import { makeRng } from './core.js';

const TAU = Math.PI * 2;

function painter(g, W, H, yTop, yBot, mx) {
  const my = H / (yTop - yBot);
  return { g, W, H, mx, my, yTop, yBot, X: (m) => m * mx, Y: (y) => (yTop - y) * my };
}

/** Run fn(dx) once, plus wrapped copies when the shape straddles the seam. */
function wrap(P, rng, xpx, halfW, fn) {
  const seed = (rng() * 4294967296) >>> 0;
  fn(0, makeRng(seed));
  if (xpx - halfW < 0) fn(P.W, makeRng(seed));
  if (xpx + halfW > P.W) fn(-P.W, makeRng(seed));
}

const INK = '#ff0000';
const GLOW = '#00ff00';

/** Filled polygon from a centre-line with a width profile (px). */
function ribbon(g, pts, wFn) {
  const n = pts.length;
  if (n < 2) return;
  const L = [], Rr = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
    const w = wFn(i / (n - 1)) * 0.5;
    L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
    Rr.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  g.beginPath();
  g.moveTo(L[0][0], L[0][1]);
  for (let i = 1; i < n; i++) g.lineTo(L[i][0], L[i][1]);
  for (let i = n - 1; i >= 0; i--) g.lineTo(Rr[i][0], Rr[i][1]);
  g.closePath();
  g.fill();
}

function poly(g, pts) {
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath();
  g.fill();
}

function dot(g, x, y, r) { g.beginPath(); g.arc(x, y, Math.max(0.6, r), 0, TAU); g.fill(); }

// ------------------------------------------------------------------ shared motifs
function ground(P, rng, baseM, ampM) {
  const { g, W, H } = P;
  g.fillStyle = INK;
  g.beginPath();
  g.moveTo(0, H);
  const f = [rng() * TAU, rng() * TAU, rng() * TAU];
  const k1 = 2 + ((rng() * 3) | 0), k2 = 5 + ((rng() * 5) | 0), k3 = 13 + ((rng() * 9) | 0);
  for (let x = 0; x <= W; x += 4) {
    const u = (x / W) * TAU;
    const h = baseM + ampM * (0.5 * Math.sin(u * k1 + f[0]) + 0.3 * Math.sin(u * k2 + f[1]) + 0.2 * Math.sin(u * k3 + f[2]));
    g.lineTo(x, P.Y(h));
  }
  g.lineTo(W, H);
  g.closePath();
  g.fill();
}

function stalactite(P, rng, xm, lenM, wM) {
  const { g } = P;
  const x = P.X(xm), w = P.X(wM), y0 = P.Y(P.yTop), y1 = P.Y(P.yTop - lenM);
  wrap(P, rng, x, w, (dx, rng) => {
    g.fillStyle = INK;
    const jag = [];
    const steps = 6;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      jag.push([x + dx - w * 0.5 * (1 - t) * (0.8 + rng() * 0.4) - w * 0.08 * t, y0 + (y1 - y0) * t]);
    }
    const right = [];
    for (let i = steps; i >= 0; i--) {
      const t = i / steps;
      right.push([x + dx + w * 0.5 * (1 - t) * (0.8 + rng() * 0.4), y0 + (y1 - y0) * t]);
    }
    poly(g, [[x + dx - w * 0.6, y0 - 2], ...jag, ...right, [x + dx + w * 0.6, y0 - 2]]);
  });
}

function hangRoot(P, rng, xm, lenM, wM, glowTips = 0) {
  const { g } = P;
  const x = P.X(xm), y0 = P.Y(P.yTop) - 2, len = lenM * P.my, w = wM * P.mx;
  const sway = (rng() - 0.5) * 2;
  const pts = [];
  const n = 16;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([x + Math.sin(t * 5 + sway * 3) * w * 1.6 * t + sway * w * 3 * t * t, y0 + len * t]);
  }
  wrap(P, rng, x, w * 6, (dx, rng) => {
    g.fillStyle = INK;
    ribbon(g, pts.map((p) => [p[0] + dx, p[1]]), (t) => w * (1 - t * 0.92));
    // little side tendrils
    const branches = 1 + ((rng() * 3) | 0);
    for (let b = 0; b < branches; b++) {
      const i0 = 3 + ((rng() * (n - 6)) | 0);
      const p0 = pts[i0];
      const dir = rng() < 0.5 ? -1 : 1;
      const bl = len * (0.15 + rng() * 0.2);
      const bp = [];
      for (let j = 0; j <= 8; j++) { const t = j / 8; bp.push([p0[0] + dx + dir * w * 3 * Math.sin(t * 1.6), p0[1] + bl * t]); }
      ribbon(g, bp, (t) => w * 0.5 * (1 - t * 0.9));
    }
    if (glowTips && rng() < glowTips) { g.fillStyle = GLOW; const e = pts[n]; dot(g, e[0] + dx, e[1] + 2, Math.max(1.2, w * 0.7)); }
  });
}

function chainLantern(P, rng, xm, lenM, glow = true, cage = 'lantern') {
  const { g } = P;
  const x = P.X(xm), y0 = P.Y(P.yTop) - 2, y1 = y0 + lenM * P.my;
  const lw = Math.max(1, 0.35 * P.mx);
  wrap(P, rng, x, 30, (dx, rng) => {
    g.fillStyle = INK;
    g.fillRect(x + dx - lw * 0.5, y0, lw, y1 - y0);
    const s = Math.max(3, 1.6 * P.mx);
    if (cage === 'lantern') {
      poly(g, [[x + dx - s * 0.5, y1], [x + dx + s * 0.5, y1], [x + dx + s * 0.7, y1 + s * 0.6], [x + dx + s * 0.5, y1 + s * 1.5], [x + dx - s * 0.5, y1 + s * 1.5], [x + dx - s * 0.7, y1 + s * 0.6]]);
      poly(g, [[x + dx - s * 0.3, y1 - s * 0.4], [x + dx + s * 0.3, y1 - s * 0.4], [x + dx, y1 - s * 0.9]]);
      if (glow) { g.fillStyle = GLOW; g.fillRect(x + dx - s * 0.32, y1 + s * 0.25, s * 0.64, s * 0.95); }
    } else if (cage === 'chandelier') {
      g.fillRect(x + dx - s * 2.2, y1, s * 4.4, Math.max(1, s * 0.25));
      for (let k = -2; k <= 2; k++) {
        g.fillStyle = INK; g.fillRect(x + dx + k * s - lw * 0.5, y1 - s * 0.6, lw, s * 0.6);
        if (glow) { g.fillStyle = GLOW; dot(g, x + dx + k * s, y1 - s * 0.85, s * 0.28); }
      }
    } else {
      // cage: tall bell shape
      poly(g, [[x + dx - s * 0.6, y1 + s * 2.2], [x + dx + s * 0.6, y1 + s * 2.2], [x + dx + s * 0.5, y1 + s * 0.5], [x + dx, y1], [x + dx - s * 0.5, y1 + s * 0.5]]);
      if (glow) { g.fillStyle = GLOW; dot(g, x + dx, y1 + s * 1.5, s * 0.3); }
    }
  });
}

function windows(P, rng, x, yTopPx, yBotPx, w, chance) {
  const { g } = P;
  const ww = Math.max(1.2, w * 0.09), wh = Math.max(2, ww * 2.6);
  const cols = Math.max(1, Math.floor(w / (ww * 4)));
  for (let r = yTopPx + wh * 2; r < yBotPx - wh; r += wh * 2.6) {
    for (let c = 0; c < cols; c++) {
      if (rng() > chance) continue;
      const cx = x - w * 0.5 + (c + 0.5) * (w / cols);
      g.fillStyle = GLOW;
      g.beginPath();
      g.moveTo(cx - ww / 2, r + wh);
      g.lineTo(cx - ww / 2, r + ww * 0.5);
      g.arc(cx, r + ww * 0.5, ww / 2, Math.PI, 0);
      g.lineTo(cx + ww / 2, r + wh);
      g.closePath();
      g.fill();
    }
  }
}

// ------------------------------------------------------------------ mossmere: drowned kingdom
function tower(P, rng, xm, baseM, wM, hM, glow) {
  const { g } = P;
  const x = P.X(xm), w = P.X(wM), yb = P.Y(baseM), yt = P.Y(baseM + hM);
  const broken = rng() < 0.3;
  const roofH = (0.9 + rng() * 1.6) * w;
  wrap(P, rng, x, w * 1.5, (dx, rng) => {
    const cx = x + dx;
    g.fillStyle = INK;
    poly(g, [[cx - w * 0.5, yb], [cx - w * 0.44, yt], [cx + w * 0.44, yt], [cx + w * 0.5, yb]]);
    if (broken) {
      const pts = [[cx - w * 0.44, yt]];
      for (let i = 1; i < 6; i++) pts.push([cx - w * 0.44 + (w * 0.88 * i) / 6, yt - (rng() * 0.6 + 0.1) * w]);
      pts.push([cx + w * 0.44, yt]);
      poly(g, pts);
    } else {
      // balcony band + conical roof with a finial
      g.fillRect(cx - w * 0.56, yt - w * 0.12, w * 1.12, w * 0.16);
      poly(g, [[cx - w * 0.52, yt - w * 0.1], [cx + w * 0.52, yt - w * 0.1], [cx + w * 0.06, yt - roofH], [cx, yt - roofH - w * 0.5], [cx - w * 0.06, yt - roofH]]);
      if (rng() < 0.6) {
        // side turret
        const s = rng() < 0.5 ? -1 : 1, tw = w * 0.38, th = (yb - yt) * (0.35 + rng() * 0.3);
        const tx = cx + s * w * 0.55, ty = yt + (yb - yt) * (0.25 + rng() * 0.2);
        poly(g, [[tx - tw * 0.5, ty + th], [tx - tw * 0.5, ty], [tx + tw * 0.5, ty], [tx + tw * 0.5, ty + th]]);
        poly(g, [[tx - tw * 0.6, ty], [tx + tw * 0.6, ty], [tx, ty - tw * 1.8]]);
      }
    }
    if (glow > 0) windows(P, rng, cx, yt, yb, w * 0.9, glow);
  });
}

function aqueduct(P, rng, xm, baseM, spanM, hM) {
  const { g } = P;
  const x0 = P.X(xm), x1 = P.X(xm + spanM), yb = P.Y(baseM), yt = P.Y(baseM + hM);
  const deck = (yb - yt) * 0.16;
  const nA = Math.max(2, Math.round(spanM / (hM * 0.55)));
  const aw = (x1 - x0) / nA;
  wrap(P, rng, (x0 + x1) / 2, (x1 - x0) / 2 + 4, (dx, rng) => {
    g.fillStyle = INK;
    g.beginPath();
    g.moveTo(x0 + dx, yb);
    g.lineTo(x0 + dx, yt);
    // broken top edge
    const steps = 18;
    for (let i = 1; i <= steps; i++) g.lineTo(x0 + dx + ((x1 - x0) * i) / steps, yt + (rng() < 0.2 ? rng() * deck * 1.5 : 0));
    g.lineTo(x1 + dx, yb);
    g.closePath();
    g.fill();
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < nA; i++) {
      const cx = x0 + dx + aw * (i + 0.5), r = aw * 0.36;
      g.beginPath();
      g.moveTo(cx - r, yb + 2);
      g.lineTo(cx - r, yt + deck + r);
      g.arc(cx, yt + deck + r, r, Math.PI, 0);
      g.lineTo(cx + r, yb + 2);
      g.closePath();
      g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  });
}

function bigArch(P, rng, xm, baseM, wM, hM) {
  const { g } = P;
  const x = P.X(xm), w = P.X(wM), yb = P.Y(baseM), yt = P.Y(baseM + hM);
  const th = w * 0.16;
  wrap(P, rng, x, w, (dx, rng) => {
    const cx = x + dx;
    g.fillStyle = INK;
    g.beginPath();
    g.moveTo(cx - w / 2, yb);
    g.lineTo(cx - w / 2, yt + w / 2);
    g.arc(cx, yt + w / 2, w / 2, Math.PI, 0);
    g.lineTo(cx + w / 2, yb);
    g.lineTo(cx + w / 2 - th, yb);
    g.lineTo(cx + w / 2 - th, yt + w / 2);
    g.arc(cx, yt + w / 2, w / 2 - th, 0, Math.PI, true);
    g.lineTo(cx - w / 2 + th, yb);
    g.closePath();
    g.fill();
    // keystone + broken right shoulder
    poly(g, [[cx - th * 0.5, yt - th * 0.3], [cx + th * 0.5, yt - th * 0.3], [cx + th * 0.35, yt + th * 1.1], [cx - th * 0.35, yt + th * 1.1]]);
  });
}

function needle(P, rng, xm, baseM, wM, hM) {
  const { g } = P;
  const x = P.X(xm), w = P.X(wM), yb = P.Y(baseM), yt = P.Y(baseM + hM);
  wrap(P, rng, x, w, (dx, rng) => {
    g.fillStyle = INK;
    poly(g, [[x + dx - w / 2, yb], [x + dx - w * 0.18, yt + (yb - yt) * 0.3], [x + dx, yt], [x + dx + w * 0.18, yt + (yb - yt) * 0.3], [x + dx + w / 2, yb]]);
  });
}

function paintMossmere(P, rng, layer, n) {
  const s = P.scale;
  const far = layer / Math.max(1, n - 1);
  ground(P, rng, 2 + 4 * s, 3 * s);
  const span = P.W / P.mx; // metres around the texture
  let x = rng() * 20;
  while (x < span) {
    const r = rng();
    if (r < 0.34) tower(P, rng, x, 0, (4 + rng() * 5) * s, (14 + rng() * 22) * s, far > 0.6 ? 0.06 : 0.12);
    else if (r < 0.52) aqueduct(P, rng, x, 0, (30 + rng() * 40) * s, (12 + rng() * 10) * s);
    else if (r < 0.68) bigArch(P, rng, x, 0, (14 + rng() * 14) * s, (16 + rng() * 16) * s);
    else if (r < 0.84) needle(P, rng, x, 0, (3 + rng() * 3) * s, (18 + rng() * 26) * s);
    x += (12 + rng() * 26) * s * (layer === 0 ? 1.4 : 1);
  }
  // hanging roots, chains and stalactites from the vault
  let hx = rng() * 10;
  const hs = P.hs;
  while (hx < span) {
    if (rng() > P.hang) { hx += (6 + rng() * 10) * s; continue; }
    const r = rng();
    if (r < 0.45) hangRoot(P, rng, hx, (16 + rng() * 34) * hs, (1.2 + rng() * 1.4) * hs, 0.25);
    else if (r < 0.6) chainLantern(P, rng, hx, (14 + rng() * 30) * hs, rng() < 0.7, rng() < 0.7 ? 'lantern' : 'cage');
    else stalactite(P, rng, hx, (8 + rng() * 24) * hs, (3 + rng() * 6) * hs);
    hx += (5 + rng() * 14) * s;
  }
}

// ------------------------------------------------------------------ sporewood: colossal fungi
function fungus(P, rng, xm, baseM, hM, capM, glow) {
  const { g } = P;
  const x = P.X(xm), yb = P.Y(baseM), yt = P.Y(baseM + hM), cw = P.X(capM);
  const bend = (rng() - 0.5) * cw * 0.6;
  const pts = [];
  for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push([x + bend * Math.sin(t * Math.PI * 0.8), yb + (yt - yb) * t]); }
  const top = pts[12];
  const sw = Math.max(2, cw * 0.14);
  const capH = cw * (0.28 + rng() * 0.22);
  wrap(P, rng, x, cw, (dx, rng) => {
    g.fillStyle = INK;
    ribbon(g, pts.map((p) => [p[0] + dx, p[1]]), (t) => sw * (1.35 - t * 0.55));
    // cap: dome with scalloped gill fringe
    const cx = top[0] + dx, cy = top[1];
    g.beginPath();
    g.moveTo(cx - cw / 2, cy);
    g.bezierCurveTo(cx - cw * 0.48, cy - capH * 1.25, cx + cw * 0.48, cy - capH * 1.25, cx + cw / 2, cy);
    const sc = 7 + ((rng() * 5) | 0);
    for (let i = sc; i >= 0; i--) {
      const px = cx - cw / 2 + (cw * i) / sc;
      g.lineTo(px, cy + (i % 2 ? capH * 0.14 : 0));
    }
    g.closePath();
    g.fill();
    if (glow) {
      g.fillStyle = GLOW;
      for (let i = 1; i < sc; i++) if (rng() < 0.7) dot(g, cx - cw / 2 + (cw * i) / sc, cy + capH * 0.12, Math.max(0.8, cw * 0.018));
      const spots = (rng() * 4) | 0;
      for (let i = 0; i < spots; i++) dot(g, cx + (rng() - 0.5) * cw * 0.6, cy - capH * (0.3 + rng() * 0.5), Math.max(0.8, cw * 0.02));
    }
  });
}

function puffballs(P, rng, xm, baseM, sM, glow) {
  const { g } = P;
  const count = 3 + ((rng() * 4) | 0);
  for (let i = 0; i < count; i++) {
    const xx = xm + (rng() - 0.5) * sM * 3, hh = sM * (0.6 + rng() * 2.2), rr = sM * (0.3 + rng() * 0.5);
    const x = P.X(xx), y = P.Y(baseM + hh), r = P.X(rr);
    wrap(P, rng, x, r * 2, (dx, rng) => {
      g.fillStyle = INK;
      g.fillRect(x + dx - r * 0.18, y, r * 0.36, P.Y(baseM) - y);
      dot(g, x + dx, y, r);
      if (glow && rng() < 0.6) { g.fillStyle = GLOW; dot(g, x + dx - r * 0.3, y - r * 0.2, r * 0.3); }
    });
  }
}

function mycelium(P, rng, xm, lenM, s) {
  const { g } = P;
  const x = P.X(xm), y0 = P.Y(P.yTop) - 2, len = lenM * P.my;
  const w = Math.max(1, 0.3 * s * P.mx);
  const pts = [];
  for (let i = 0; i <= 14; i++) { const t = i / 14; pts.push([x + Math.sin(t * 4 + xm) * 4 * s * t, y0 + len * t]); }
  wrap(P, rng, x, 20, (dx, rng) => {
    g.fillStyle = INK;
    ribbon(g, pts.map((p) => [p[0] + dx, p[1]]), (t) => w * (1 - t * 0.6));
    g.fillStyle = GLOW;
    const e = pts[14];
    dot(g, e[0] + dx, e[1] + w, Math.max(1, w * 1.1));
    if (rng() < 0.5) dot(g, pts[8][0] + dx + w, pts[8][1], Math.max(0.8, w * 0.7));
  });
}

function shelfHang(P, rng, xm, lenM, wM) {
  // drooping gill shelves hanging from a root
  const { g } = P;
  hangRoot(P, rng, xm, lenM, wM * 0.25, 0);
  const x = P.X(xm), y0 = P.Y(P.yTop - lenM * (0.4 + rng() * 0.4)), w = P.X(wM);
  wrap(P, rng, x, w, (dx, rng) => {
    g.fillStyle = INK;
    g.beginPath();
    g.ellipse(x + dx, y0, w * 0.5, w * 0.16, 0, 0, Math.PI, true);
    g.fill();
    g.fillStyle = GLOW;
    for (let i = 0; i < 5; i++) dot(g, x + dx - w * 0.4 + (w * 0.8 * i) / 4, y0 + 1.5, Math.max(0.8, w * 0.03));
  });
}

function paintSporewood(P, rng, layer, n) {
  const s = P.scale;
  ground(P, rng, 2 + 5 * s, 4 * s);
  const span = P.W / P.mx;
  let x = rng() * 15;
  while (x < span) {
    const r = rng();
    if (r < 0.62) fungus(P, rng, x, 0, (14 + rng() * 34) * s, (10 + rng() * 22) * s, true);
    else if (r < 0.85) puffballs(P, rng, x, 0, (3 + rng() * 3) * s, true);
    x += (9 + rng() * 22) * s;
  }
  let hx = rng() * 8;
  const hs = P.hs;
  while (hx < span) {
    if (rng() > P.hang) { hx += (6 + rng() * 10) * s; continue; }
    const r = rng();
    if (r < 0.45) mycelium(P, rng, hx, (12 + rng() * 34) * hs, hs);
    else if (r < 0.65) shelfHang(P, rng, hx, (16 + rng() * 26) * hs, (6 + rng() * 6) * hs);
    else stalactite(P, rng, hx, (8 + rng() * 22) * hs, (3 + rng() * 6) * hs);
    hx += (4 + rng() * 11) * s;
  }
}

// ------------------------------------------------------------------ glasswater: crystal vault
function shard(P, rng, xm, baseM, wM, hM, tilt, glow) {
  const { g } = P;
  const x = P.X(xm), w = P.X(wM), yb = P.Y(baseM), h = hM * P.my;
  const tx = Math.sin(tilt) * h, ty = Math.cos(tilt) * h;
  wrap(P, rng, x, w + Math.abs(tx), (dx, rng) => {
    g.fillStyle = INK;
    const cx = x + dx;
    poly(g, [[cx - w / 2, yb], [cx - w / 2 + tx * 0.82, yb - ty * 0.82], [cx + tx, yb - ty], [cx + w / 2 + tx * 0.82, yb - ty * 0.82], [cx + w / 2, yb]]);
    if (glow) {
      g.fillStyle = GLOW;
      // bright facet line toward the tip
      ribbon(g, [[cx + tx * 0.7, yb - ty * 0.7], [cx + tx * 0.97, yb - ty * 0.97]], (t) => Math.max(1, w * 0.1 * (1 - t)));
    }
  });
}

function crystalCluster(P, rng, xm, baseM, sM, glow) {
  const k = 3 + ((rng() * 5) | 0);
  for (let i = 0; i < k; i++) {
    const h = sM * (0.5 + rng() * 1.6) * (i === 0 ? 1.5 : 1);
    shard(P, rng, xm + (rng() - 0.5) * sM * 0.9, baseM, sM * (0.12 + rng() * 0.14), h, (rng() - 0.5) * 0.9, glow && rng() < 0.45);
  }
}

function cathedral(P, rng, xm, baseM, wM, hM) {
  const { g } = P;
  const x = P.X(xm), w = P.X(wM), yb = P.Y(baseM), yt = P.Y(baseM + hM);
  const h = yb - yt;
  wrap(P, rng, x, w, (dx, rng) => {
    const cx = x + dx;
    g.fillStyle = INK;
    // nave
    poly(g, [[cx - w / 2, yb], [cx - w / 2, yt + h * 0.45], [cx, yt + h * 0.2], [cx + w / 2, yt + h * 0.45], [cx + w / 2, yb]]);
    // twin towers + central spire
    for (const s of [-1, 1]) {
      const tx = cx + s * w * 0.38, tw = w * 0.2;
      poly(g, [[tx - tw / 2, yb], [tx - tw / 2, yt + h * 0.28], [tx, yt + h * 0.05], [tx + tw / 2, yt + h * 0.28], [tx + tw / 2, yb]]);
    }
    poly(g, [[cx - w * 0.06, yt + h * 0.25], [cx, yt - h * 0.08], [cx + w * 0.06, yt + h * 0.25]]);
    // rose window + lancets
    g.fillStyle = GLOW;
    if (rng() < 0.85) dot(g, cx, yt + h * 0.42, w * 0.07);
    for (let i = -2; i <= 2; i++) {
      if (rng() < 0.4) continue;
      const lx = cx + i * w * 0.08, lw = w * 0.03, top = yt + h * 0.55;
      g.beginPath();
      g.moveTo(lx - lw, yb - h * 0.08);
      g.lineTo(lx - lw, top + lw);
      g.lineTo(lx, top - lw);
      g.lineTo(lx + lw, top + lw);
      g.lineTo(lx + lw, yb - h * 0.08);
      g.closePath();
      g.fill();
    }
  });
}

function statueFig(P, rng, xm, baseM, hM, glow) {
  const { g } = P;
  const x = P.X(xm), yb = P.Y(baseM), h = hM * P.my, w = h * 0.34 * (P.mx / P.my);
  wrap(P, rng, x, w, (dx, rng) => {
    const cx = x + dx;
    g.fillStyle = INK;
    // pedestal
    g.fillRect(cx - w * 0.6, yb - h * 0.12, w * 1.2, h * 0.12);
    // robed body with hood
    poly(g, [[cx - w * 0.5, yb - h * 0.12], [cx - w * 0.3, yb - h * 0.7], [cx - w * 0.22, yb - h * 0.86], [cx, yb - h * 0.98], [cx + w * 0.22, yb - h * 0.86], [cx + w * 0.3, yb - h * 0.7], [cx + w * 0.5, yb - h * 0.12]]);
    // staff with lantern
    const sx = cx + w * 0.55;
    g.fillRect(sx - 1, yb - h * 1.02, Math.max(1.5, w * 0.05), h * 0.9);
    if (glow) { g.fillStyle = GLOW; dot(g, sx, yb - h * 1.05, Math.max(1.5, w * 0.08)); }
  });
}

function paintGlasswater(P, rng, layer, n) {
  const s = P.scale;
  ground(P, rng, 2 + 3 * s, 3 * s);
  const span = P.W / P.mx;
  let x = rng() * 15;
  while (x < span) {
    const r = rng();
    if (r < 0.45) crystalCluster(P, rng, x, 0, (10 + rng() * 22) * s, true);
    else if (r < 0.65) cathedral(P, rng, x, 0, (20 + rng() * 18) * s, (26 + rng() * 22) * s);
    else if (r < 0.78) statueFig(P, rng, x, 0, (16 + rng() * 14) * s, true);
    else if (r < 0.9) needle(P, rng, x, 0, (3 + rng() * 2) * s, (24 + rng() * 26) * s);
    x += (11 + rng() * 22) * s;
  }
  let hx = rng() * 8;
  const hs = P.hs;
  while (hx < span) {
    if (rng() > P.hang) { hx += (6 + rng() * 10) * s; continue; }
    const r = rng();
    if (r < 0.4) {
      // inverted crystal cluster hanging
      const k = 2 + ((rng() * 3) | 0);
      for (let i = 0; i < k; i++) {
        const hh = (6 + rng() * 18) * hs;
        shard(P, rng, hx + (rng() - 0.5) * 5 * hs, P.yTop + 1, (1.5 + rng() * 2.5) * hs, -hh, (rng() - 0.5) * 0.5, rng() < 0.6);
      }
    } else if (r < 0.55) chainLantern(P, rng, hx, (16 + rng() * 26) * hs, true, 'chandelier');
    else stalactite(P, rng, hx, (8 + rng() * 22) * hs, (2.5 + rng() * 5) * hs);
    hx += (5 + rng() * 12) * s;
  }
}

// ------------------------------------------------------------------ paleabyss: bones & veiled giants
function ribcage(P, rng, xm, baseM, wM, hM) {
  const { g } = P;
  const x0 = P.X(xm), w = P.X(wM), yb = P.Y(baseM), h = hM * P.my;
  const nR = 5 + ((rng() * 4) | 0);
  const lean = (rng() - 0.5) * 0.3;
  wrap(P, rng, x0 + w / 2, w, (dx, rng) => {
    g.fillStyle = INK;
    // spine
    const sp = [];
    for (let i = 0; i <= 16; i++) { const t = i / 16; sp.push([x0 + dx + w * t, yb - h * (0.92 + 0.08 * Math.sin(t * Math.PI)) + lean * h * (t - 0.5)]); }
    ribbon(g, sp, () => Math.max(2, h * 0.05));
    for (let r = 0; r < nR; r++) {
      const t = (r + 0.5) / nR;
      const p = sp[Math.round(t * 16)];
      const rh = h * (0.75 + 0.25 * Math.sin(t * Math.PI));
      const curl = (rng() - 0.3) * w * 0.08;
      const pts = [];
      for (let i = 0; i <= 12; i++) {
        const u = i / 12;
        pts.push([p[0] + Math.sin(u * Math.PI * 0.9) * w * 0.07 + curl * u * u, p[1] + rh * u]);
      }
      ribbon(g, pts, (u) => Math.max(1.5, h * 0.04 * (1 - u * 0.65)));
    }
  });
}

function veiledGiant(P, rng, xm, baseM, hM) {
  const { g } = P;
  const x = P.X(xm), yb = P.Y(baseM), h = hM * P.my, w = h * 0.62 * (P.mx / P.my);
  wrap(P, rng, x, w, (dx, rng) => {
    const cx = x + dx;
    g.fillStyle = INK;
    g.beginPath();
    g.moveTo(cx - w * 0.55, yb);
    g.quadraticCurveTo(cx - w * 0.6, yb - h * 0.35, cx - w * 0.38, yb - h * 0.55);  // knee/back
    g.quadraticCurveTo(cx - w * 0.3, yb - h * 0.78, cx - w * 0.12, yb - h * 0.84);  // shoulder
    g.quadraticCurveTo(cx - w * 0.1, yb - h * 1.0, cx + w * 0.02, yb - h * 1.0);    // veiled head
    g.quadraticCurveTo(cx + w * 0.16, yb - h * 0.98, cx + w * 0.14, yb - h * 0.82);
    g.quadraticCurveTo(cx + w * 0.3, yb - h * 0.7, cx + w * 0.32, yb - h * 0.45);    // bowed front, hands
    g.quadraticCurveTo(cx + w * 0.42, yb - h * 0.25, cx + w * 0.58, yb);
    g.closePath();
    g.fill();
    // veil hem trailing on the ground
    poly(g, [[cx - w * 0.7, yb], [cx - w * 0.5, yb - h * 0.08], [cx + w * 0.6, yb - h * 0.06], [cx + w * 0.8, yb]]);
    // a cupped candle in its hands
    g.fillStyle = GLOW;
    dot(g, cx + w * 0.3, yb - h * 0.5, Math.max(1.2, w * 0.025));
  });
}

function vertebraColumn(P, rng, xm, baseM, wM, hM) {
  const { g } = P;
  const x = P.X(xm), w = P.X(wM), yb = P.Y(baseM), h = hM * P.my;
  const segs = 6 + ((rng() * 6) | 0);
  const bend = (rng() - 0.5) * w * 1.5;
  wrap(P, rng, x, w * 2, (dx, rng) => {
    g.fillStyle = INK;
    for (let i = 0; i < segs; i++) {
      const t = i / segs, sh = h / segs;
      const cx = x + dx + bend * t * t, cy = yb - sh * (i + 0.5);
      const sw = w * (1 - t * 0.5);
      g.beginPath();
      g.ellipse(cx, cy, sw * 0.5, sh * 0.42, 0, 0, TAU);
      g.fill();
      poly(g, [[cx - sw * 0.75, cy], [cx, cy - sh * 0.2], [cx + sw * 0.75, cy], [cx, cy + sh * 0.2]]);
    }
  });
}

function coralTree(P, rng, xm, baseM, hM) {
  const { g } = P;
  const branch = (x, y, ang, len, w, depth) => {
    const x2 = x + Math.sin(ang) * len, y2 = y - Math.cos(ang) * len;
    ribbon(g, [[x, y], [(x + x2) / 2 + (rng() - 0.5) * len * 0.2, (y + y2) / 2], [x2, y2]], (t) => w * (1 - t * 0.4));
    if (depth > 0) {
      branch(x2, y2, ang - 0.3 - rng() * 0.4, len * 0.72, w * 0.7, depth - 1);
      branch(x2, y2, ang + 0.3 + rng() * 0.4, len * 0.72, w * 0.7, depth - 1);
    }
  };
  const x = P.X(xm), yb = P.Y(baseM), len = hM * P.my * 0.38;
  wrap(P, rng, x, len * 2, (dx, rng) => {
    g.fillStyle = INK;
    branch(x + dx, yb, (rng() - 0.5) * 0.3, len, Math.max(2, len * 0.16), 3);
  });
}

function veilHang(P, rng, xm, lenM, wM) {
  const { g } = P;
  const x = P.X(xm), w = P.X(wM), y0 = P.Y(P.yTop) - 2, len = lenM * P.my;
  wrap(P, rng, x, w, (dx, rng) => {
    g.fillStyle = INK;
    g.beginPath();
    g.moveTo(x + dx - w / 2, y0);
    const folds = 4 + ((rng() * 3) | 0);
    g.lineTo(x + dx - w * 0.45, y0 + len * 0.7);
    for (let i = 0; i <= folds; i++) {
      const px = x + dx - w * 0.45 + (w * 0.9 * i) / folds;
      g.lineTo(px, y0 + len * (i % 2 ? 0.86 : 1.0) * (0.9 + rng() * 0.2));
    }
    g.lineTo(x + dx + w / 2, y0);
    g.closePath();
    g.fill();
  });
}

function paintPaleabyss(P, rng, layer, n) {
  const s = P.scale;
  ground(P, rng, 2 + 4 * s, 3 * s);
  const span = P.W / P.mx;
  let x = rng() * 15;
  let giants = layer === Math.min(2, n - 1) ? 2 : 0;
  while (x < span) {
    const r = rng();
    if (giants > 0 && x > span * (giants === 2 ? 0.15 : 0.6)) { veiledGiant(P, rng, x, 0, (52 + rng() * 10) * s); giants--; x += 50 * s; continue; }
    if (r < 0.34) ribcage(P, rng, x, 0, (40 + rng() * 30) * s, (16 + rng() * 14) * s);
    else if (r < 0.56) vertebraColumn(P, rng, x, 0, (3 + rng() * 2) * s, (18 + rng() * 22) * s);
    else if (r < 0.78) coralTree(P, rng, x, 0, (12 + rng() * 14) * s);
    else needle(P, rng, x, 0, (3 + rng() * 2) * s, (16 + rng() * 22) * s);
    x += (14 + rng() * 26) * s;
  }
  let hx = rng() * 8;
  const hs = P.hs;
  while (hx < span) {
    if (rng() > P.hang) { hx += (6 + rng() * 10) * s; continue; }
    const r = rng();
    if (r < 0.3) veilHang(P, rng, hx, (12 + rng() * 26) * hs, (6 + rng() * 8) * hs);
    else if (r < 0.5) chainLantern(P, rng, hx, (16 + rng() * 26) * hs, rng() < 0.4, 'cage');
    else stalactite(P, rng, hx, (8 + rng() * 26) * hs, (2.5 + rng() * 5) * hs);
    hx += (5 + rng() * 12) * s;
  }
}

const PAINTERS = { mossmere: paintMossmere, sporewood: paintSporewood, glasswater: paintGlasswater, paleabyss: paintPaleabyss };

/**
 * Paint one ring mask. Returns { data: Uint8Array (RG, rows bottom->top), width, height }.
 * spec: { theme, layer, layers, W, H, yTop, yBot, mx (px per metre horizontally), scale, blur }
 */
export function paintRing(spec, rng) {
  const { W, H } = spec;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.clearRect(0, 0, W, H);
  const P = painter(g, W, H, spec.yTop, spec.yBot, spec.mx);
  P.scale = spec.scale;
  P.hs = spec.hangScale ?? spec.scale;
  P.hang = spec.hang ?? 1;
  const t0 = performance.now();
  (PAINTERS[spec.theme] || paintMossmere)(P, rng, spec.layer, spec.layers);
  let src = g;
  if (spec.blur > 0 && 'filter' in g) {
    // one blur pass over the finished painting (a filter set while drawing would blur every shape)
    const c2 = document.createElement('canvas');
    c2.width = W; c2.height = H;
    const g2 = c2.getContext('2d', { willReadFrequently: true });
    g2.filter = `blur(${spec.blur}px)`;
    g2.drawImage(c, 0, 0);
    src = g2;
  }
  const t1 = performance.now();
  const img = src.getImageData(0, 0, W, H).data;
  if (src !== g) src.canvas.width = src.canvas.height = 1;
  const t2 = performance.now();
  const out = new Uint8Array(W * H * 2);
  for (let y = 0; y < H; y++) {
    const src = (H - 1 - y) * W * 4, dst = y * W * 2;
    for (let x = 0; x < W; x++) {
      const i = src + x * 4, a = img[i + 3];
      out[dst + x * 2] = (img[i] * a + 127) / 255;
      out[dst + x * 2 + 1] = (img[i + 1] * a + 127) / 255;
    }
  }
  c.width = c.height = 1; // release canvas memory early
  return { data: out, width: W, height: H, ms: [Math.round(t1 - t0), Math.round(t2 - t1), Math.round(performance.now() - t2)] };
}
