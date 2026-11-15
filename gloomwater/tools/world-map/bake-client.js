// Runs inside headless Chromium (build.mjs serves it): inks the world image on a canvas from the
// generator's rasters and vectors, and hands back WebP / JPEG data URIs. No text is baked: the
// page letters the chart live so labels stay sharp at every zoom.
/* global window, document, fetch, ImageData */
window.bake = async function bake() {
  const meta = await (await fetch('/meta.json')).json();
  const vec = await (await fetch('/vec.json')).json();
  const bin = async (name, Type) => new Type(await (await fetch(name)).arrayBuffer());
  const base = await bin('/base.bin', Uint8ClampedArray);
  const glyphs = await bin('/glyphs.bin', Float32Array);
  const hach = await bin('/hach.bin', Float32Array);
  const paper = await bin('/paper.bin', Uint8ClampedArray);
  const { W, H, x0, y0, UW, UH, BS, quality } = meta;

  const cv = document.createElement('canvas');
  cv.width = Math.round(UW * BS); cv.height = Math.round(UH * BS);
  const ctx = cv.getContext('2d');
  const tmp = document.createElement('canvas');
  tmp.width = W; tmp.height = H;
  tmp.getContext('2d').putImageData(new ImageData(base, W, H), 0, 0);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(tmp, 0, 0, cv.width, cv.height);
  ctx.setTransform(BS, 0, 0, BS, -x0 * BS, -y0 * BS); // chart units from here on
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  // a small seeded generator for hand wobble
  let seed = meta.seed >>> 0;
  const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };

  const INK = '#3b2e44', INK_RGB = '59,46,68', WATER_INK = '#35316a', STONE = '#e9e5f0';
  const path = (a, close) => { ctx.moveTo(a[0], a[1]); for (let i = 2; i < a.length; i += 2) ctx.lineTo(a[i], a[i + 1]); if (close) ctx.closePath(); };
  const strokeLines = (lines, style, width, dash) => {
    ctx.beginPath(); for (const a of lines) path(a);
    ctx.strokeStyle = style; ctx.lineWidth = width; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
  };

  // ---- water lining
  [0.5, 0.34, 0.22, 0.13].forEach((al, i) => strokeLines(vec.lining[i], `rgba(222,216,252,${al})`, 0.2 - i * 0.02));

  // ---- the Fold's ribbon: wave marks on the sea, dune marks on the land
  for (let i = 0; i < vec.fold.length; i += 4) {
    const x = vec.fold[i], y = vec.fold[i + 1], land = vec.fold[i + 2], a = vec.fold[i + 3];
    ctx.beginPath();
    if (land) { ctx.moveTo(x - 2.0, y + 0.55); ctx.quadraticCurveTo(x - 0.3, y - 1.3, x + 2.0, y + 0.55); ctx.moveTo(x + 0.4, y + 0.1); ctx.lineTo(x + 1.0, y + 0.5); ctx.strokeStyle = `rgba(${INK_RGB},${0.5 * a})`; }
    else { ctx.moveTo(x - 1.7, y); ctx.bezierCurveTo(x - 0.9, y - 0.9, x - 0.5, y + 0.9, x + 0.2, y); ctx.bezierCurveTo(x + 0.7, y - 0.7, x + 1.2, y + 0.4, x + 1.7, y - 0.1); ctx.strokeStyle = `rgba(214,208,250,${0.62 * a})`; }
    ctx.lineWidth = 0.25; ctx.stroke();
  }

  // ---- currents: fine feathered arrows
  const smoothPath = (pts) => {
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); }
    const l = pts[pts.length - 1]; ctx.lineTo(l[0], l[1]);
  };
  for (const c of meta.currents) {
    const col = c.tone === 'cold' ? '206,214,255' : '255,214,196';
    ctx.beginPath(); smoothPath(c.pts); ctx.strokeStyle = `rgba(${col},0.34)`; ctx.lineWidth = 0.34; ctx.setLineDash([4.5, 2.2]); ctx.stroke(); ctx.setLineDash([]);
    const n = c.pts.length, a = c.pts[n - 2], b = c.pts[n - 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    ctx.beginPath();
    ctx.moveTo(b[0], b[1]); ctx.lineTo(b[0] - 3.4 * Math.cos(ang - 0.42), b[1] - 3.4 * Math.sin(ang - 0.42));
    ctx.moveTo(b[0], b[1]); ctx.lineTo(b[0] - 3.4 * Math.cos(ang + 0.42), b[1] - 3.4 * Math.sin(ang + 0.42));
    ctx.strokeStyle = `rgba(${col},0.5)`; ctx.lineWidth = 0.36; ctx.stroke();
  }

  // ---- hachures, binned by strength
  {
    const bins = 10, land = Array.from({ length: bins }, () => []), icy = Array.from({ length: bins }, () => []);
    for (let i = 0; i < hach.length; i += 6) (hach[i + 5] ? icy : land)[Math.min(bins - 1, Math.floor(hach[i + 4] * bins))].push(i);
    for (let b = 0; b < bins; b++) for (const [set, rgb] of [[land, INK_RGB], [icy, '92,96,170']]) {
      if (!set[b].length) continue;
      ctx.beginPath();
      for (const i of set[b]) { ctx.moveTo(hach[i], hach[i + 1]); ctx.lineTo(hach[i + 2], hach[i + 3]); }
      ctx.strokeStyle = `rgba(${rgb},${((b + 0.5) / bins) * 0.85})`; ctx.lineWidth = 0.15 + b * 0.02; ctx.stroke();
    }
  }

  // ---- ice: stipple and a fine edge
  ctx.fillStyle = 'rgba(110,116,190,0.5)';
  for (let i = 0; i < vec.iceDots.length; i += 2) { ctx.beginPath(); ctx.arc(vec.iceDots[i], vec.iceDots[i + 1], 0.11, 0, 6.3); ctx.fill(); }
  strokeLines(vec.iceEdge, 'rgba(96,100,176,0.55)', 0.16, [0.9, 0.5]);

  // ---- lakes
  strokeLines(vec.lakeLining, 'rgba(226,220,252,0.42)', 0.16);
  ctx.beginPath(); for (const a of vec.lakeShores) path(a, true); ctx.strokeStyle = `rgba(${INK_RGB},0.25)`; ctx.lineWidth = 0.7; ctx.filter = 'blur(1.4px)'; ctx.stroke(); ctx.filter = 'none';
  ctx.beginPath(); for (const a of vec.lakeShores) path(a, true); ctx.strokeStyle = INK; ctx.lineWidth = 0.28; ctx.stroke();
  strokeLines(vec.panShores, `rgba(${INK_RGB},0.7)`, 0.22, [0.25, 0.7]);

  // ---- running water
  const strokeVar = (a, style, k = 1) => { // [x, y, w, ...] with a width per point
    ctx.strokeStyle = style;
    for (let i = 0; i + 5 < a.length; i += 3) {
      ctx.beginPath(); ctx.moveTo(a[i], a[i + 1]); ctx.lineTo(a[i + 3], a[i + 4]); ctx.lineWidth = ((a[i + 2] + a[i + 5]) / 2) * k; ctx.stroke();
    }
  };
  for (const a of vec.wadis) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); for (let i = 3; i < a.length; i += 3) ctx.lineTo(a[i], a[i + 1]); ctx.strokeStyle = `rgba(${INK_RGB},0.42)`; ctx.lineWidth = 0.2; ctx.setLineDash([0.2, 0.85]); ctx.stroke(); ctx.setLineDash([]); }
  for (const a of vec.streams) strokeVar(a, 'rgba(53,49,106,0.72)');
  // the Thin Water's sand, then its braids
  {
    const tw = vec.rivers.filter((r) => r.cls === 'braided');
    for (const r of tw) { ctx.beginPath(); ctx.moveTo(r.pts[0], r.pts[1]); for (let i = 3; i < r.pts.length; i += 3) ctx.lineTo(r.pts[i], r.pts[i + 1]); ctx.strokeStyle = 'rgba(244,236,222,0.9)'; ctx.lineWidth = 4.6; ctx.stroke(); ctx.strokeStyle = `rgba(${INK_RGB},0.16)`; ctx.lineWidth = 0.14; }
    ctx.beginPath(); for (const b of vec.braid) path(b); ctx.strokeStyle = 'rgba(53,49,106,0.85)'; ctx.lineWidth = 0.32; ctx.stroke();
    // sand grains
    ctx.fillStyle = `rgba(${INK_RGB},0.3)`;
    for (const b of vec.braid) for (let i = 0; i < b.length; i += 6) { ctx.beginPath(); ctx.arc(b[i] + (rnd() - 0.5) * 2.4, b[i + 1] + (rnd() - 0.5) * 2.4, 0.08, 0, 6.3); ctx.fill(); }
  }
  const band = (a, fill, edge, k = 1) => { // a wide river as a filled band with inked banks
    const n = a.length / 3, L = [], R = [];
    for (let i = 0; i < n; i++) {
      const p = Math.max(0, i - 1), q = Math.min(n - 1, i + 1);
      let tx = a[q * 3] - a[p * 3], ty = a[q * 3 + 1] - a[p * 3 + 1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const w = (a[i * 3 + 2] * k) / 2;
      L.push(a[i * 3] - ty * w, a[i * 3 + 1] + tx * w); R.push(a[i * 3] + ty * w, a[i * 3 + 1] - tx * w);
    }
    ctx.beginPath(); ctx.moveTo(L[0], L[1]); for (let i = 2; i < L.length; i += 2) ctx.lineTo(L[i], L[i + 1]);
    for (let i = R.length - 2; i >= 0; i -= 2) ctx.lineTo(R[i], R[i + 1]);
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    ctx.beginPath(); path(L); path(R); ctx.strokeStyle = edge; ctx.lineWidth = 0.2; ctx.stroke();
  };
  for (const r of vec.rivers) {
    if (r.cls === 'braided') continue;
    if (r.cls === 'great' || r.cls === 'arm') band(r.pts, '#77709f', INK);
    else if (r.cls === 'black') { band(r.pts, '#2a2444', '#1d1830'); }
    else if (r.cls === 'seasonal') { ctx.beginPath(); ctx.moveTo(r.pts[0], r.pts[1]); for (let i = 3; i < r.pts.length; i += 3) ctx.lineTo(r.pts[i], r.pts[i + 1]); ctx.strokeStyle = 'rgba(42,36,68,0.85)'; ctx.lineWidth = 0.42; ctx.setLineDash([1.5, 0.8]); ctx.stroke(); ctx.setLineDash([]); }
    else if (r.cls === 'clear') { strokeVar(r.pts, '#3a3672'); strokeVar(r.pts, 'rgba(206,204,246,0.9)', 0.42); }
    else strokeVar(r.pts, WATER_INK);
  }
  // canals: ruled, with a chevron at each lock
  for (const c of vec.canals) {
    ctx.beginPath(); path(c.pts); ctx.strokeStyle = INK; ctx.lineWidth = 0.95; ctx.lineCap = 'butt'; ctx.stroke();
    ctx.beginPath(); path(c.pts); ctx.strokeStyle = '#a9a4dc'; ctx.lineWidth = 0.5; ctx.stroke(); ctx.lineCap = 'round';
    for (const l of c.locks) {
      // direction of the canal at the lock
      let best = 0, bd = 1e9; for (let i = 0; i + 3 < c.pts.length; i += 2) { const d = Math.hypot(c.pts[i] - l[0], c.pts[i + 1] - l[1]); if (d < bd) { bd = d; best = i; } }
      const j = Math.min(best, c.pts.length - 4), ang = Math.atan2(c.pts[j + 3] - c.pts[j + 1], c.pts[j + 2] - c.pts[j]);
      ctx.save(); ctx.translate(l[0], l[1]); ctx.rotate(ang);
      ctx.beginPath(); ctx.moveTo(-0.5, -1.0); ctx.lineTo(0.45, 0); ctx.lineTo(-0.5, 1.0); ctx.strokeStyle = INK; ctx.lineWidth = 0.24; ctx.stroke(); ctx.restore();
    }
  }

  // ---- the Great Step: an escarpment line with teeth pointing down the fall
  {
    const st = vec.step;
    ctx.beginPath(); ctx.moveTo(st[0][0], st[0][1]); for (const p of st) ctx.lineTo(p[0], p[1]);
    ctx.strokeStyle = `rgba(${INK_RGB},0.85)`; ctx.lineWidth = 0.44; ctx.stroke();
    ctx.beginPath();
    for (let i = 1; i < st.length - 1; i++) {
      const a = st[i - 1], b = st[i + 1]; let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const len = (2.3 + 1.7 * hash(i, 3)) * st[i][2];
      if (len < 0.3) continue;
      ctx.moveTo(st[i][0], st[i][1]); ctx.lineTo(st[i][0] - ty * len, st[i][1] + tx * len);
    }
    ctx.strokeStyle = `rgba(${INK_RGB},0.74)`; ctx.lineWidth = 0.26; ctx.stroke();
  }

  // ---- the coast: a feathered under-line, then the pen
  ctx.beginPath(); for (const a of vec.coast) path(a); ctx.strokeStyle = `rgba(${INK_RGB},0.34)`; ctx.lineWidth = 0.9; ctx.filter = 'blur(1.6px)'; ctx.stroke(); ctx.filter = 'none';
  ctx.beginPath(); for (const a of vec.coast) path(a); ctx.strokeStyle = INK; ctx.lineWidth = 0.36; ctx.stroke();

  // ---- plant marks. Colour follows WATERS.md's foliage track: olive in the north, deep green at the Inkwood.
  const hsv = (hh, s, v) => { const f = (n) => { const k = (n + hh / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); }; return [f(5) * 255, f(3) * 255, f(1) * 255]; };
  const leaf = [];
  for (let st = 0; st <= 15; st++) {
    const hue = 84 + 2.9 * st, cap = Math.min(0.62, 0.25 + 0.04 * st), sat = Math.min(cap - 0.04, 0.24 + 0.02 * st), val = 0.38 + 0.01 * st;
    const c = (s, v, a = 1) => { const [r, g, b] = hsv(hue, Math.min(1, s), Math.min(1, v)); return `rgba(${r | 0},${g | 0},${b | 0},${a})`; };
    const q = 0.8; // a chart's ink is quieter than the game's lit leaves
    leaf.push({ mid: c(sat * q, val + 0.02), deep: c(sat * q, val - 0.09), bright: c(sat * q * 0.92, val + 0.12), dark: c(sat * q, val * 0.46), light: c(sat * 0.62, val + 0.26), ink: c(sat * q, val * 0.78), soft: c(sat * 0.75, val + 0.06, 0.78), shade: c(sat * 0.72, val * 0.5, 0.9), shadeSoft: c(sat * 0.7, val * 0.52, 0.64) });
  }
  const T = { CONIFER: 0, BROADLEAF: 1, CANOPY: 2, MANGROVE: 3, SWAMP: 4, PALM: 5, ACACIA: 6, MOSS: 7, HEATH: 8, GRASS: 9, SCRUB: 10, DUNE: 11, REED: 12, PAPYRUS: 13 };
  // under the crowns: the forest's own shade, so a closed canopy reads dark and not as dots on paper
  for (let i = 0; i < glyphs.length; i += 7) {
    const type = glyphs[i + 2];
    if (type !== T.BROADLEAF && type !== T.CANOPY && type !== T.SWAMP && type !== T.MANGROVE) continue;
    const x = glyphs[i], y = glyphs[i + 1], s = glyphs[i + 3], lf = leaf[Math.max(0, Math.min(15, Math.round(glyphs[i + 4])))];
    ctx.beginPath(); ctx.arc(x + 0.22, y - 0.25, (type === T.CANOPY ? 1.5 : 1.3) * s, 0, 6.3); ctx.fillStyle = type === T.CANOPY ? lf.shade : lf.shadeSoft; ctx.fill();
  }
  for (let i = 0; i < glyphs.length; i += 7) {
    const x = glyphs[i], y = glyphs[i + 1], type = glyphs[i + 2], s = glyphs[i + 3], u = glyphs[i + 5];
    const lf0 = leaf[Math.max(0, Math.min(15, Math.round(glyphs[i + 4])))], tone = hash(x * 1.7, y * 1.3) + glyphs[i + 6] * 2.2;
    const lf = tone < 0.24 ? { ...lf0, mid: lf0.deep } : tone > 0.84 ? { ...lf0, mid: lf0.bright } : lf0;
    switch (type) {
      case T.CONIFER: {
        const hgt = 1.55 * s, w = 0.5 * s;
        ctx.beginPath(); ctx.moveTo(x, y - hgt); ctx.lineTo(x + w, y + 0.12); ctx.lineTo(x - w, y + 0.12); ctx.closePath();
        ctx.fillStyle = lf.mid; ctx.fill(); ctx.strokeStyle = lf.dark; ctx.lineWidth = 0.1; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y - hgt); ctx.lineTo(x + w, y + 0.12); ctx.lineTo(x + w * 0.15, y + 0.12); ctx.closePath(); ctx.fillStyle = lf.dark; ctx.globalAlpha = 0.45; ctx.fill(); ctx.globalAlpha = 1;
        break; }
      case T.BROADLEAF: {
        const r = 0.74 * s;
        ctx.beginPath(); ctx.arc(x, y - r * 0.5, r, 0, 6.3); ctx.fillStyle = lf.mid; ctx.fill(); ctx.strokeStyle = lf.dark; ctx.lineWidth = 0.09; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y - r * 0.5, r * 0.7, -0.3, 1.9); ctx.strokeStyle = lf.dark; ctx.globalAlpha = 0.5; ctx.lineWidth = 0.16; ctx.stroke(); ctx.globalAlpha = 1;
        break; }
      case T.CANOPY: {
        const r = 0.86 * s;
        ctx.beginPath(); ctx.arc(x - r * 0.42, y - r * 0.35, r * 0.78, 0, 6.3); ctx.arc(x + r * 0.42, y - r * 0.55, r * 0.74, 0, 6.3); ctx.arc(x + r * 0.05, y - r * 1.05, r * 0.62, 0, 6.3);
        ctx.fillStyle = lf.mid; ctx.fill();
        ctx.beginPath(); ctx.arc(x - r * 0.42, y - r * 0.35, r * 0.78, 0.5, 2.9); ctx.strokeStyle = lf.dark; ctx.lineWidth = 0.13; ctx.stroke();
        ctx.beginPath(); ctx.arc(x + r * 0.42, y - r * 0.55, r * 0.74, -0.6, 1.9); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + r * 0.05, y - r * 1.05, r * 0.45, 3.4, 5.2); ctx.strokeStyle = lf.light; ctx.lineWidth = 0.12; ctx.stroke();
        break; }
      case T.MANGROVE: {
        const r = 0.6 * s;
        ctx.strokeStyle = lf.dark; ctx.lineWidth = 0.09; ctx.beginPath();
        for (const d of [-0.5, 0, 0.5]) { ctx.moveTo(x + d * r * 0.5, y - r * 0.7); ctx.quadraticCurveTo(x + d * r * 1.7, y - r * 0.2, x + d * r * 1.5, y + r * 0.42); }
        ctx.stroke();
        ctx.beginPath(); ctx.ellipse(x, y - r * 1.05, r * 1.05, r * 0.72, 0, 0, 6.3); ctx.fillStyle = lf.mid; ctx.fill(); ctx.stroke();
        break; }
      case T.SWAMP: {
        const r = 0.62 * s;
        ctx.beginPath(); ctx.moveTo(x - r * 0.35, y + 0.2); ctx.lineTo(x, y - r * 0.6); ctx.lineTo(x + r * 0.35, y + 0.2); ctx.strokeStyle = lf.dark; ctx.lineWidth = 0.1; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y - r * 1.2, r, 0, 6.3); ctx.fillStyle = lf.mid; ctx.fill(); ctx.stroke();
        ctx.beginPath(); for (const d of [-0.6, -0.1, 0.5]) { ctx.moveTo(x + d * r, y - r * 0.8); ctx.lineTo(x + d * r, y - r * 0.05 + hash(x, y + d) * 0.3); }
        ctx.strokeStyle = 'rgba(122,138,120,0.85)'; ctx.lineWidth = 0.08; ctx.stroke();
        break; }
      case T.PALM: {
        const hh = 1.25 * s, lean = (u - 0.5) * 0.7;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + lean * 0.2, y - hh * 0.6, x + lean, y - hh); ctx.strokeStyle = lf.dark; ctx.lineWidth = 0.11; ctx.stroke();
        ctx.beginPath(); const tx = x + lean, ty = y - hh;
        for (let f = 0; f < 6; f++) { const a = -Math.PI + (f / 5) * Math.PI + (hash(x + f, y) - 0.5) * 0.3, l = 0.72 * s; ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + Math.cos(a) * l * 0.6, ty + Math.sin(a) * l * 0.9 - 0.12, tx + Math.cos(a) * l, ty + Math.sin(a) * l * 0.4 + 0.22); }
        ctx.strokeStyle = lf.ink; ctx.lineWidth = 0.15; ctx.stroke();
        break; }
      case T.ACACIA: {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 0.75 * s); ctx.moveTo(x, y - 0.5 * s); ctx.lineTo(x + 0.4 * s, y - 0.85 * s); ctx.strokeStyle = lf.dark; ctx.lineWidth = 0.09; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(x + 0.08, y - 0.95 * s, 0.85 * s, 0.3 * s, 0, 0, 6.3); ctx.fillStyle = lf.mid; ctx.fill(); ctx.stroke();
        break; }
      case T.MOSS: {
        ctx.beginPath(); for (const d of [-0.32, 0, 0.3]) { ctx.moveTo(x + d * s, y); ctx.lineTo(x + d * s + 0.04, y - (0.3 + hash(x + d, y) * 0.22) * s); }
        ctx.strokeStyle = lf.soft; ctx.lineWidth = 0.13; ctx.stroke(); break; }
      case T.HEATH: {
        ctx.beginPath(); for (const d of [-0.5, -0.15, 0.2, 0.5]) { ctx.moveTo(x, y); ctx.lineTo(x + d * s, y - (0.55 - Math.abs(d) * 0.3) * s); }
        ctx.strokeStyle = 'rgba(112,104,128,0.75)'; ctx.lineWidth = 0.1; ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 0.2 * s, y - 0.58 * s, 0.1, 0, 6.3); ctx.fillStyle = lf.soft; ctx.fill(); break; }
      case T.GRASS: {
        ctx.beginPath(); ctx.moveTo(x - 0.3 * s, y - 0.34 * s); ctx.lineTo(x, y); ctx.lineTo(x + 0.3 * s, y - 0.38 * s);
        ctx.strokeStyle = `rgba(${INK_RGB},0.3)`; ctx.lineWidth = 0.09; ctx.stroke(); break; }
      case T.SCRUB: {
        ctx.beginPath(); ctx.arc(x, y - 0.2, 0.24 * s, 0, 6.3); ctx.fillStyle = lf.soft; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y - 0.2, 0.24 * s, 0.2, 2.2); ctx.strokeStyle = lf.dark; ctx.lineWidth = 0.07; ctx.stroke(); break; }
      case T.DUNE: {
        ctx.beginPath(); ctx.moveTo(x - 1.1 * s, y + 0.3); ctx.quadraticCurveTo(x - 0.1, y - 0.8 * s, x + 1.2 * s, y + 0.3);
        ctx.strokeStyle = `rgba(${INK_RGB},0.36)`; ctx.lineWidth = 0.11; ctx.stroke();
        ctx.fillStyle = `rgba(${INK_RGB},0.3)`; for (let d = 0; d < 3; d++) { ctx.beginPath(); ctx.arc(x + 0.3 + d * 0.32, y + 0.05 + d * 0.1, 0.05, 0, 6.3); ctx.fill(); } break; }
      case T.REED: case T.PAPYRUS: {
        ctx.beginPath(); const tips = [];
        for (const d of [-0.36, -0.08, 0.22, 0.46]) { const tx = x + d * s * 1.3, ty = y - (0.7 + hash(x + d, y) * 0.35) * s; ctx.moveTo(x + d * s * 0.5, y); ctx.lineTo(tx, ty); tips.push(tx, ty); }
        ctx.strokeStyle = lf.bright; ctx.lineWidth = 0.17; ctx.stroke();
        if (type === T.PAPYRUS) { ctx.fillStyle = 'rgba(226,160,68,0.95)'; for (let q = 0; q < tips.length; q += 4) { ctx.beginPath(); ctx.arc(tips[q], tips[q + 1], 0.13, 0, 6.3); ctx.fill(); } }
        break; }
      default: break;
    }
  }

  // ---- the kingdom's works
  const lamp = (x, y, r = 0.22, col = '#f0a23c') => { ctx.beginPath(); ctx.arc(x, y, r, 0, 6.3); ctx.fillStyle = col; ctx.fill(); };
  const towerAt = (x, y, s = 1) => { ctx.beginPath(); ctx.rect(x - 0.5 * s, y - 2.1 * s, s, 2.1 * s); ctx.fillStyle = STONE; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.16; ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 0.66 * s, y - 2.1 * s); ctx.lineTo(x + 0.66 * s, y - 2.1 * s); ctx.lineWidth = 0.26; ctx.stroke(); };
  const along = (pts, step, fn) => { for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / step)), ang = Math.atan2(b[1] - a[1], b[0] - a[0]); for (let q = 0; q <= n; q++) fn(a[0] + ((b[0] - a[0]) * q) / n, a[1] + ((b[1] - a[1]) * q) / n, ang); } };
  for (const l of vec.landmarks) {
    const s = l.s || 1;
    ctx.save();
    switch (l.g) {
      case 'city': { // the lower city, seen through the water
        ctx.translate(l.at[0], l.at[1]); ctx.rotate((l.rot * Math.PI) / 180);
        ctx.beginPath(); ctx.ellipse(0, 0, l.rx, l.ry, 0, 0, 6.3); ctx.clip();
        ctx.beginPath(); for (let gx = -l.rx; gx <= l.rx; gx += 1.9) { ctx.moveTo(gx, -l.ry); ctx.lineTo(gx + 0.6, l.ry); } for (let gy = -l.ry; gy <= l.ry; gy += 1.7) { ctx.moveTo(-l.rx, gy); ctx.lineTo(l.rx, gy + 0.5); }
        ctx.strokeStyle = 'rgba(214,208,250,0.42)'; ctx.lineWidth = 0.16; ctx.stroke();
        ctx.fillStyle = 'rgba(214,208,250,0.2)'; for (let q = 0; q < 46; q++) { const gx = (hash(q, 1) - 0.5) * 2 * l.rx, gy = (hash(q, 7) - 0.5) * 2 * l.ry; ctx.fillRect(gx, gy, 0.5 + hash(q, 3) * 0.9, 0.4 + hash(q, 5) * 0.7); }
        break; }
      case 'gate': {
        const [x, y] = l.at; towerAt(x - 1.7 * s, y, s * 1.05); towerAt(x + 1.7 * s, y, s * 1.05);
        ctx.beginPath(); ctx.moveTo(x - 1.2 * s, y); ctx.lineTo(x - 1.2 * s, y - 1.0 * s); ctx.arc(x, y - 1.0 * s, 1.2 * s, Math.PI, 0); ctx.lineTo(x + 1.2 * s, y); ctx.strokeStyle = INK; ctx.lineWidth = 0.2; ctx.stroke();
        lamp(x - 1.7 * s, y - 1.3 * s, 0.16); lamp(x + 1.7 * s, y - 0.9 * s, 0.16);
        break; }
      case 'tower': towerAt(l.at[0], l.at[1], s * 0.95); break;
      case 'wall': {
        ctx.beginPath(); path(l.pts.flat()); ctx.strokeStyle = INK; ctx.lineWidth = 0.86; ctx.lineCap = 'butt'; ctx.stroke();
        ctx.beginPath(); path(l.pts.flat()); ctx.strokeStyle = STONE; ctx.lineWidth = 0.42; ctx.stroke(); ctx.lineCap = 'round';
        along(l.pts, 4.4, (x, y) => { ctx.beginPath(); ctx.rect(x - 0.62, y - 0.62, 1.24, 1.24); ctx.fillStyle = STONE; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.2; ctx.stroke(); });
        break; }
      case 'sluice': { const [x, y] = l.at; ctx.beginPath(); ctx.rect(x - 0.7, y - 0.9, 1.4, 1.5); ctx.fillStyle = STONE; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.16; ctx.stroke(); ctx.beginPath(); for (const d of [-0.3, 0, 0.3]) { ctx.moveTo(x + d, y - 0.9); ctx.lineTo(x + d, y + 0.6); } ctx.lineWidth = 0.1; ctx.stroke(); break; }
      case 'stair': { along(l.pts, 0.8 * s, (x, y, a) => { ctx.beginPath(); ctx.moveTo(x - Math.sin(a) * 0.3 + Math.sin(a) * 1.5, y + Math.cos(a) * 0.3 - Math.cos(a) * 1.5); ctx.lineTo(x + Math.sin(a) * 0.3 + Math.sin(a) * 1.5, y - Math.cos(a) * 0.3 - Math.cos(a) * 1.5); ctx.strokeStyle = INK; ctx.lineWidth = 0.13; ctx.stroke(); }); break; }
      case 'ruins': case 'town': case 'drowned': {
        for (let q = 0; q < l.n; q++) {
          const a = hash(l.at[0] + q, 2) * 6.3, r = Math.sqrt(hash(q, l.at[1])) * l.r, x = l.at[0] + Math.cos(a) * r, y = l.at[1] + Math.sin(a) * r * 0.7, w = 0.9 + hash(q, 9) * 1.1, hh = 0.8 + hash(q, 4) * 0.8;
          ctx.beginPath();
          if (l.g === 'drowned') { ctx.moveTo(x - w * 0.6, y + 0.3); ctx.lineTo(x, y - 0.4); ctx.lineTo(x + w * 0.6, y + 0.3); ctx.strokeStyle = 'rgba(222,216,252,0.6)'; ctx.lineWidth = 0.14; ctx.stroke(); continue; }
          ctx.moveTo(x - w / 2, y + hh / 2); ctx.lineTo(x - w / 2, y - hh / 2); ctx.lineTo(x + w / 2, y - hh / 2); ctx.lineTo(x + w / 2, y + hh * (hash(q, 6) - 0.2));
          if (hash(q, 8) > 0.45) ctx.lineTo(x - w / 2, y + hh / 2);
          ctx.strokeStyle = `rgba(${INK_RGB},0.9)`; ctx.lineWidth = 0.22; ctx.stroke();
        }
        break; }
      case 'bridge': { const [a, b] = l.pts; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(a[0] + (b[0] - a[0]) * 0.42, a[1] + (b[1] - a[1]) * 0.42); ctx.moveTo(a[0] + (b[0] - a[0]) * 0.66, a[1] + (b[1] - a[1]) * 0.66); ctx.lineTo(b[0], b[1]); ctx.strokeStyle = STONE; ctx.lineWidth = 0.5; ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 0.12; ctx.setLineDash([0.5, 0.5]); ctx.stroke(); ctx.setLineDash([]); break; }
      case 'lock': { ctx.translate(l.at[0], l.at[1]); ctx.rotate((l.rot * Math.PI) / 180); ctx.beginPath(); ctx.moveTo(-0.5, -0.9); ctx.lineTo(0.4, 0); ctx.lineTo(-0.5, 0.9); ctx.strokeStyle = INK; ctx.lineWidth = 0.2; ctx.stroke(); break; }
      case 'caps': { // giant mushrooms
        for (let q = 0; q < l.n; q++) {
          const a = hash(q, 11) * 6.3, r = (0.35 + 0.65 * hash(q, 13)) * l.r, x = l.at[0] + Math.cos(a) * r, y = l.at[1] + Math.sin(a) * r * 0.75, z = 0.7 + hash(q, 17) * 0.8;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 1.3 * z); ctx.strokeStyle = INK; ctx.lineWidth = 0.16; ctx.stroke();
          ctx.beginPath(); ctx.ellipse(x, y - 1.3 * z, 0.95 * z, 0.5 * z, 0, Math.PI, 0); ctx.closePath(); ctx.fillStyle = ['#c98aa8', '#b88cc0', '#d8a0b4'][q % 3]; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.13; ctx.stroke();
        }
        break; }
      case 'garden': { const [x, y] = l.at; ctx.beginPath(); ctx.rect(x - 1.5, y - 1, 3, 2); for (let d = -0.5; d <= 0.5; d += 0.5) { ctx.moveTo(x - 1.5, y + d); ctx.lineTo(x + 1.5, y + d); } ctx.strokeStyle = `rgba(${INK_RGB},0.7)`; ctx.lineWidth = 0.11; ctx.stroke(); break; }
      case 'monolith': { const [x, y] = l.at; ctx.beginPath(); ctx.moveTo(x - 0.4, y + 0.3); ctx.lineTo(x - 0.28, y - 1.9); ctx.lineTo(x, y - 2.3); ctx.lineTo(x + 0.28, y - 1.9); ctx.lineTo(x + 0.4, y + 0.3); ctx.closePath(); ctx.fillStyle = '#d5dafb'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.14; ctx.stroke(); break; }
      case 'crystals': { for (let q = 0; q < l.n; q++) { const a = hash(q, 21) * 6.3, r = (0.55 + 0.45 * hash(q, 23)) * l.r, x = l.at[0] + Math.cos(a) * r, y = l.at[1] + Math.sin(a) * r * 0.62, z = 0.45 + hash(q, 27) * 0.5; ctx.beginPath(); ctx.moveTo(x, y - 1.5 * z); ctx.lineTo(x + 0.5 * z, y - 0.4 * z); ctx.lineTo(x, y + 0.3 * z); ctx.lineTo(x - 0.5 * z, y - 0.4 * z); ctx.closePath(); ctx.fillStyle = '#c3cbfa'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.1; ctx.stroke(); } break; }
      case 'ribs': { // bone-white ribs standing out of the lake
        ctx.translate(l.at[0], l.at[1]); ctx.rotate((l.rot * Math.PI) / 180);
        for (let q = 0; q < l.n; q++) { const t = (q + 0.5) / l.n, x = (t - 0.5) * 2 * l.rx * 0.86, hgt = l.ry * (0.55 + 0.4 * Math.sin(t * Math.PI));
          for (const col of [[INK, 0.5], ['#f3f0f8', 0.28]]) { ctx.beginPath(); ctx.moveTo(x - 1.3, hgt * 0.5); ctx.quadraticCurveTo(x - 0.9, -hgt * 0.9, x + 0.5, -hgt * 0.75); ctx.strokeStyle = col[0]; ctx.lineWidth = col[1]; ctx.stroke(); } }
        break; }
      case 'weir': { ctx.translate(l.at[0], l.at[1]); ctx.rotate((l.rot * Math.PI) / 180); ctx.beginPath(); ctx.moveTo(-3.2, 0); ctx.lineTo(-0.6, 0); ctx.moveTo(0.9, 0); ctx.lineTo(3.2, 0); ctx.strokeStyle = INK; ctx.lineWidth = 0.55; ctx.lineCap = 'butt'; ctx.stroke(); ctx.strokeStyle = STONE; ctx.lineWidth = 0.25; ctx.stroke(); ctx.lineCap = 'round'; lamp(-3.4, -0.6, 0.2); break; }
      case 'lighthouse': { const [x, y] = l.at; ctx.beginPath(); ctx.moveTo(x - 0.5, y); ctx.lineTo(x - 0.3, y - 2.4); ctx.lineTo(x + 0.3, y - 2.4); ctx.lineTo(x + 0.5, y); ctx.closePath(); ctx.fillStyle = STONE; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.14; ctx.stroke(); lamp(x, y - 2.75, 0.3); break; }
      case 'slipway': { ctx.beginPath(); path(l.pts.flat()); ctx.strokeStyle = `rgba(${INK_RGB},0.8)`; ctx.lineWidth = 0.9; ctx.setLineDash([0.16, 0.6]); ctx.lineCap = 'butt'; ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'round'; break; }
      case 'pyreStairs': { ctx.translate(l.at[0], l.at[1]); ctx.rotate((l.rot * Math.PI) / 180); for (let q = 0; q < 5; q++) { ctx.beginPath(); ctx.moveTo(-1.6 + q * 0.2, 0.9 + q * 0.62); ctx.lineTo(1.6 - q * 0.2, 0.9 + q * 0.62); ctx.strokeStyle = INK; ctx.lineWidth = 0.15; ctx.stroke(); lamp(-1.2 + q * 0.6, 0.6 + q * 0.62, 0.13); } break; }
      case 'reefTown': { const [x, y] = l.at; // roofs under coral, and the reef's edge
        ctx.strokeStyle = 'rgba(232,206,214,0.8)'; ctx.lineWidth = 0.14;
        for (let q = 0; q < 26; q++) { const a = hash(q, 31) * 6.3, r = 2 + Math.sqrt(hash(q, 33)) * 9, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.8; ctx.beginPath(); if (q % 3 === 0) { ctx.moveTo(px - 0.6, py + 0.3); ctx.lineTo(px, py - 0.4); ctx.lineTo(px + 0.6, py + 0.3); } else { ctx.arc(px, py, 0.35, Math.PI, 0); ctx.arc(px + 0.7, py, 0.35, Math.PI, 0); } ctx.stroke(); }
        break; }
      case 'towers': { ctx.translate(l.at[0], l.at[1]); ctx.rotate((l.rot * Math.PI) / 180); towerAt(-0.4, -1.5, 0.85); towerAt(0.4, 3.4, 0.85); lamp(-0.4, -3.6, 0.2); lamp(0.4, 1.3, 0.2); break; }
      case 'dam': { const [a, b] = l.pts; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineCap = 'butt'; ctx.strokeStyle = INK; ctx.lineWidth = 1.3; ctx.stroke(); ctx.strokeStyle = STONE; ctx.lineWidth = 0.9; ctx.stroke(); ctx.lineCap = 'round'; lamp((a[0] + b[0]) / 2 - 0.9, (a[1] + b[1]) / 2, 0.22); break; }
      case 'seaGate': { const [x, y] = l.at; towerAt(x, y - 9.3, 1.1); towerAt(x, y + 11.4, 1.1); ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x, y + 9); ctx.strokeStyle = 'rgba(222,216,252,0.5)'; ctx.lineWidth = 0.2; ctx.setLineDash([0.5, 1.1]); ctx.stroke(); ctx.setLineDash([]); lamp(x + 6, y + 8.6, 0.2); break; }
      case 'hulls': { for (let q = 0; q < l.n; q++) { const x = l.at[0] + (q % 3) * 3.4 + (q > 2 ? 1.2 : 0), y = l.at[1] + (q > 2 ? 2.4 : 0); ctx.beginPath(); ctx.moveTo(x - 1.3, y); ctx.lineTo(x + 1.3, y); for (let d = -1; d <= 1; d += 0.5) { ctx.moveTo(x + d, y - 0.55); ctx.quadraticCurveTo(x + d + 0.15, y, x + d, y + 0.55); } ctx.strokeStyle = INK; ctx.lineWidth = 0.12; ctx.stroke(); } break; }
      case 'posts': { for (const p of l.pts) { ctx.beginPath(); ctx.rect(p[0] - 0.2, p[1] - 0.5, 0.4, 0.62); ctx.fillStyle = '#f1edf6'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.1; ctx.stroke(); } break; }
      case 'barge': case 'wreck': { ctx.translate(l.at[0], l.at[1]); ctx.rotate((l.rot * Math.PI) / 180); ctx.beginPath(); ctx.moveTo(-1.6, 0); ctx.quadraticCurveTo(0, -0.9, 1.6, 0); ctx.quadraticCurveTo(0, 0.9, -1.6, 0); ctx.moveTo(-0.4, -0.5); ctx.lineTo(-0.4, 0.5); ctx.moveTo(0.4, -0.5); ctx.lineTo(0.4, 0.5); ctx.strokeStyle = 'rgba(226,220,250,0.75)'; ctx.lineWidth = 0.13; ctx.stroke(); if (l.g === 'barge') lamp(1.1, 0, 0.17); break; }
      case 'stilts': { for (let q = 0; q < l.n; q++) { const a = hash(q, 41) * 6.3, r = Math.sqrt(hash(q, 43)) * l.r, x = l.at[0] + Math.cos(a) * r * 0.8, y = l.at[1] + Math.sin(a) * r; ctx.beginPath(); ctx.rect(x - 0.45, y - 0.8, 0.9, 0.55); ctx.moveTo(x - 0.6, y - 0.8); ctx.lineTo(x, y - 1.25); ctx.lineTo(x + 0.6, y - 0.8); ctx.moveTo(x - 0.35, y - 0.25); ctx.lineTo(x - 0.35, y + 0.25); ctx.moveTo(x + 0.35, y - 0.25); ctx.lineTo(x + 0.35, y + 0.25); ctx.fillStyle = STONE; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.1; ctx.stroke(); lamp(x + 0.62, y - 0.42, 0.13, q === 3 ? '#a6d4a0' : '#f0a23c'); } break; }
      case 'hearth': { const [x, y] = l.at; ctx.beginPath(); ctx.rect(x - 0.6, y - 0.6, 1.2, 0.9); ctx.moveTo(x - 0.8, y - 0.6); ctx.lineTo(x, y - 1.25); ctx.lineTo(x + 0.8, y - 0.6); ctx.fillStyle = STONE; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.11; ctx.stroke(); for (let q = 0; q < 4; q++) { ctx.beginPath(); ctx.moveTo(x + 0.7 + q * 0.3, y + 0.3 + q * 0.26); ctx.lineTo(x + 1.3 + q * 0.3, y + 0.3 + q * 0.26); ctx.stroke(); } lamp(x, y - 0.1, 0.14); break; }
      case 'oxbow': { ctx.translate(l.at[0], l.at[1]); ctx.rotate((l.rot * Math.PI) / 180); ctx.beginPath(); ctx.arc(0, 0, 3 * s, 0.5, 2.9); ctx.strokeStyle = INK; ctx.lineWidth = 1.05; ctx.stroke(); ctx.strokeStyle = '#77709f'; ctx.lineWidth = 0.7; ctx.stroke(); break; }
      case 'buoys': { for (const p of l.pts) { ctx.beginPath(); ctx.moveTo(p[0], p[1] - 0.55); ctx.lineTo(p[0] + 0.38, p[1]); ctx.lineTo(p[0], p[1] + 0.3); ctx.lineTo(p[0] - 0.38, p[1]); ctx.closePath(); ctx.fillStyle = 'rgba(236,232,250,0.9)'; ctx.fill(); ctx.strokeStyle = '#231d3a'; ctx.lineWidth = 0.09; ctx.stroke(); } break; }
      case 'driftLine': { ctx.beginPath(); smoothPath(l.pts); ctx.strokeStyle = 'rgba(150,160,96,0.8)'; ctx.lineWidth = 0.5; ctx.setLineDash([0.9, 0.7]); ctx.stroke(); ctx.setLineDash([]); break; }
      default: break;
    }
    ctx.restore();
  }

  // ---- the far isle stands in cloud
  ctx.filter = 'blur(5px)'; ctx.fillStyle = 'rgba(236,232,250,0.55)';
  for (const c of [[50, 490, 9, 3], [60, 494, 7, 2.4], [53, 499, 10, 2.6]]) { ctx.beginPath(); ctx.ellipse(c[0], c[1], c[2], c[3], 0, 0, 6.3); ctx.fill(); }
  ctx.filter = 'none';

  // ---- the neatline
  ctx.strokeStyle = `rgba(${INK_RGB},0.75)`; ctx.lineWidth = 0.5; ctx.strokeRect(x0 + 9, y0 + 9, UW - 18, UH - 18);
  ctx.lineWidth = 0.16; ctx.strokeRect(x0 + 11.2, y0 + 11.2, UW - 22.4, UH - 22.4);

  // ---- hand the images back
  const out = {};
  out.world = cv.toDataURL('image/webp', quality);
  const pv = document.createElement('canvas'); pv.width = Math.round(UW * 1.2); pv.height = Math.round(UH * 1.2);
  const pc = pv.getContext('2d'); pc.imageSmoothingQuality = 'high'; pc.drawImage(cv, 0, 0, pv.width, pv.height);
  out.preview = pv.toDataURL('image/jpeg', 0.9);
  const pp = document.createElement('canvas'); pp.width = meta.pw; pp.height = meta.ph;
  pp.getContext('2d').putImageData(new ImageData(paper, meta.pw, meta.ph), 0, 0);
  out.paper = pp.toDataURL('image/jpeg', 0.86);
  out.crops = {};
  for (const [name, c] of Object.entries(meta.crops || {})) {
    const cc = document.createElement('canvas'); cc.width = Math.round(c[2] * BS); cc.height = Math.round(c[3] * BS);
    cc.getContext('2d').drawImage(cv, (c[0] - x0) * BS, (c[1] - y0) * BS, cc.width, cc.height, 0, 0, cc.width, cc.height);
    out.crops[name] = cc.toDataURL('image/jpeg', 0.92);
  }
  // a coarse map of where the finished chart is dark, so the page can letter dark on light and light on dark
  {
    const tc = document.createElement('canvas'); tc.width = meta.toneW; tc.height = meta.toneH;
    const tx = tc.getContext('2d'); tx.imageSmoothingQuality = 'high';
    const mid = document.createElement('canvas'); mid.width = meta.toneW * 4; mid.height = meta.toneH * 4;
    mid.getContext('2d').drawImage(cv, 0, 0, mid.width, mid.height);
    tx.drawImage(mid, 0, 0, tc.width, tc.height);
    const d = tx.getImageData(0, 0, tc.width, tc.height).data, bytes = new Uint8Array(Math.ceil((tc.width * tc.height) / 8));
    for (let i = 0; i < tc.width * tc.height; i++) { const lum = 0.3 * d[i * 4] + 0.59 * d[i * 4 + 1] + 0.11 * d[i * 4 + 2]; if (lum < 160) bytes[i >> 3] |= 1 << (i & 7); }
    let bin = ''; for (const b of bytes) bin += String.fromCharCode(b);
    out.tone = btoa(bin);
  }
  out.size = [cv.width, cv.height];
  return out;
};
