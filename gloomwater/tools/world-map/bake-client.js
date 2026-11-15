// Runs inside headless Chromium (build.mjs serves it): inks the world image on a canvas from the
// generator's rasters and vectors, and hands back WebP / JPEG data URIs. No text is baked, and
// neither are the border, the lamps or the landmark vignettes: the page draws those live, so they
// stay sharp at every zoom.
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
  const win = vec.win;

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
  // everything inked stays inside the neatline
  ctx.save(); ctx.beginPath(); ctx.rect(win[0], win[1], win[2] - win[0], win[3] - win[1]); ctx.clip();

  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  const INK = '#3b2e44', INK_RGB = '59,46,68', WATER_INK = '#35316a', WATER_RGB = '53,49,106', STONE = '#ece8f1';
  const path = (a, close) => { ctx.moveTo(a[0], a[1]); for (let i = 2; i < a.length; i += 2) ctx.lineTo(a[i], a[i + 1]); if (close) ctx.closePath(); };
  const strokeLines = (lines, style, width, dash) => {
    ctx.beginPath(); for (const a of lines) path(a);
    ctx.strokeStyle = style; ctx.lineWidth = width; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
  };
  const segs = (a, style, width) => { ctx.beginPath(); for (let i = 0; i + 3 < a.length; i += 4) { ctx.moveTo(a[i], a[i + 1]); ctx.lineTo(a[i + 2], a[i + 3]); } ctx.strokeStyle = style; ctx.lineWidth = width; ctx.stroke(); };
  const smoothPath = (pts) => {
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); }
    const l = pts[pts.length - 1]; ctx.lineTo(l[0], l[1]);
  };

  // ---- the sea: water lining, the sea ways from the Landing, the currents
  [0.4, 0.27, 0.17, 0.1].forEach((al, i) => strokeLines(vec.lining[i], `rgba(226,220,252,${al})`, 0.24 - i * 0.025));
  strokeLines(vec.seaWays, 'rgba(226,220,252,0.3)', 0.3, [0.3, 2.2]);
  for (const c of meta.currents) {
    const col = c.tone === 'cold' ? '206,214,255' : '255,214,196';
    ctx.beginPath(); smoothPath(c.pts); ctx.strokeStyle = `rgba(${col},0.34)`; ctx.lineWidth = 0.36; ctx.setLineDash([4.5, 2.2]); ctx.stroke(); ctx.setLineDash([]);
    const n = c.pts.length, a = c.pts[n - 2], b = c.pts[n - 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    ctx.beginPath();
    ctx.moveTo(b[0], b[1]); ctx.lineTo(b[0] - 3.4 * Math.cos(ang - 0.42), b[1] - 3.4 * Math.sin(ang - 0.42));
    ctx.moveTo(b[0], b[1]); ctx.lineTo(b[0] - 3.4 * Math.cos(ang + 0.42), b[1] - 3.4 * Math.sin(ang + 0.42));
    ctx.strokeStyle = `rgba(${col},0.5)`; ctx.lineWidth = 0.38; ctx.stroke();
  }

  // ---- relief: hachures, binned by strength, then the hill signs
  {
    const bins = 10, land = Array.from({ length: bins }, () => []), icy = Array.from({ length: bins }, () => []);
    for (let i = 0; i < hach.length; i += 6) (hach[i + 5] ? icy : land)[Math.min(bins - 1, Math.floor(hach[i + 4] * bins))].push(i);
    for (let b = 0; b < bins; b++) for (const [set, rgb] of [[land, INK_RGB], [icy, '96,100,172']]) {
      if (!set[b].length) continue;
      ctx.beginPath();
      for (const i of set[b]) { ctx.moveTo(hach[i], hach[i + 1]); ctx.lineTo(hach[i + 2], hach[i + 3]); }
      ctx.strokeStyle = `rgba(${rgb},${0.2 + ((b + 0.5) / bins) * 0.7})`; ctx.lineWidth = 0.2 + b * 0.016; ctx.stroke();
    }
  }
  for (let i = 0; i < vec.hills.length; i += 3) {
    const x = vec.hills[i], y = vec.hills[i + 1], s = vec.hills[i + 2];
    ctx.beginPath();
    ctx.moveTo(x - 1.8 * s, y + 0.5 * s); ctx.bezierCurveTo(x - 1.0 * s, y - 0.85 * s, x - 0.25 * s, y - 1.3 * s, x + 0.25 * s, y - 0.95 * s);
    ctx.bezierCurveTo(x + 0.9 * s, y - 0.5 * s, x + 1.4 * s, y + 0.1 * s, x + 1.9 * s, y + 0.5 * s);
    ctx.strokeStyle = `rgba(${INK_RGB},0.62)`; ctx.lineWidth = 0.24; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 0.45 * s, y - 0.62 * s); ctx.lineTo(x + 0.22 * s, y + 0.2 * s);
    ctx.moveTo(x + 0.92 * s, y - 0.28 * s); ctx.lineTo(x + 0.76 * s, y + 0.34 * s);
    ctx.moveTo(x + 1.34 * s, y + 0.08 * s); ctx.lineTo(x + 1.24 * s, y + 0.44 * s);
    ctx.strokeStyle = `rgba(${INK_RGB},0.46)`; ctx.lineWidth = 0.2; ctx.stroke();
  }

  // ---- ice: stippled white inside one crisp, scalloped edge; the peaks' snow has a quieter one
  ctx.fillStyle = 'rgba(104,110,186,0.62)';
  for (let i = 0; i < vec.iceDots.length; i += 2) { ctx.beginPath(); ctx.arc(vec.iceDots[i], vec.iceDots[i + 1], 0.15, 0, 6.3); ctx.fill(); }
  strokeLines(vec.iceEdge, 'rgba(158,166,226,0.8)', 1.1, [0.01, 1.5]);
  strokeLines(vec.iceEdge, 'rgba(78,82,150,0.95)', 0.3);
  strokeLines(vec.snowEdge, 'rgba(92,96,166,0.7)', 0.22, [0.7, 0.5]);

  // ---- lakes
  strokeLines(vec.lakeLining, 'rgba(230,224,252,0.42)', 0.2);
  ctx.beginPath(); for (const a of vec.lakeShores) path(a, true); ctx.strokeStyle = `rgba(${INK_RGB},0.25)`; ctx.lineWidth = 0.8; ctx.filter = 'blur(1.4px)'; ctx.stroke(); ctx.filter = 'none';
  ctx.beginPath(); for (const a of vec.lakeShores) path(a, true); ctx.strokeStyle = INK; ctx.lineWidth = 0.32; ctx.stroke();
  strokeLines(vec.panShores, `rgba(${INK_RGB},0.7)`, 0.26, [0.3, 0.8]);

  // ---- running water
  const strokeVar = (a, style, k = 1) => { // [x, y, w, ...] with a width per point
    ctx.strokeStyle = style;
    for (let i = 0; i + 5 < a.length; i += 3) {
      ctx.beginPath(); ctx.moveTo(a[i], a[i + 1]); ctx.lineTo(a[i + 3], a[i + 4]); ctx.lineWidth = ((a[i + 2] + a[i + 5]) / 2) * k; ctx.stroke();
    }
  };
  for (const a of vec.wadis) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); for (let i = 3; i < a.length; i += 3) ctx.lineTo(a[i], a[i + 1]); ctx.strokeStyle = `rgba(${INK_RGB},0.42)`; ctx.lineWidth = 0.22; ctx.setLineDash([0.25, 0.95]); ctx.stroke(); ctx.setLineDash([]); }
  for (const a of vec.streams) strokeVar(a, `rgba(${WATER_RGB},0.74)`);
  // the Thin Water: a wide bed of pale sand, and the threads of the river over it
  {
    for (const r of vec.rivers.filter((q) => q.cls === 'braided')) {
      const centre = () => { ctx.beginPath(); ctx.moveTo(r.pts[0], r.pts[1]); for (let i = 3; i < r.pts.length; i += 3) ctx.lineTo(r.pts[i], r.pts[i + 1]); };
      centre(); ctx.strokeStyle = `rgba(${INK_RGB},0.5)`; ctx.lineWidth = 9.7; ctx.setLineDash([0.3, 0.9]); ctx.lineCap = 'butt'; ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'round';
      centre(); ctx.strokeStyle = 'rgb(243,233,214)'; ctx.lineWidth = 9.2; ctx.stroke();
    }
    ctx.fillStyle = `rgba(${INK_RGB},0.3)`;
    for (const b of vec.braid) for (let i = 0; i < b.length; i += 4) for (let q = 0; q < 3; q++) { ctx.beginPath(); ctx.arc(b[i] + (hash(i, q) - 0.5) * 7, b[i + 1] + (hash(q, i) - 0.5) * 4, 0.11, 0, 6.3); ctx.fill(); }
    ctx.beginPath(); for (const b of vec.braid) path(b); ctx.strokeStyle = `rgba(${WATER_RGB},0.9)`; ctx.lineWidth = 0.62; ctx.stroke();
    ctx.beginPath(); for (const b of vec.braid) path(b); ctx.strokeStyle = 'rgba(190,186,238,0.95)'; ctx.lineWidth = 0.26; ctx.stroke();
  }
  const band = (a, fill, edge, edgeW = 0.24) => { // a river as a filled band with inked banks
    const n = a.length / 3, L = [], R = [];
    for (let i = 0; i < n; i++) {
      const p = Math.max(0, i - 1), q = Math.min(n - 1, i + 1);
      let tx = a[q * 3] - a[p * 3], ty = a[q * 3 + 1] - a[p * 3 + 1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const w = a[i * 3 + 2] / 2;
      L.push(a[i * 3] - ty * w, a[i * 3 + 1] + tx * w); R.push(a[i * 3] + ty * w, a[i * 3 + 1] - tx * w);
    }
    ctx.beginPath(); ctx.moveTo(L[0], L[1]); for (let i = 2; i < L.length; i += 2) ctx.lineTo(L[i], L[i + 1]);
    for (let i = R.length - 2; i >= 0; i -= 2) ctx.lineTo(R[i], R[i + 1]);
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    ctx.beginPath(); path(L); path(R); ctx.strokeStyle = edge; ctx.lineWidth = edgeW; ctx.stroke();
  };
  const SILT = 'rgb(140,116,104)', BLACKWATER = 'rgb(38,29,44)';
  const maxW = (r) => { let m = 0; for (let i = 2; i < r.pts.length; i += 3) m = Math.max(m, r.pts[i]); return m; };
  for (const r of vec.rivers) {
    if (r.cls === 'braided') continue;
    if (r.cls === 'great' || r.cls === 'arm') band(r.pts, SILT, INK, 0.28);
    else if (r.cls === 'black') band(r.pts, BLACKWATER, '#1b1526');
    else if (r.cls === 'seasonal') { band(r.pts, 'rgb(66,54,78)', '#1b1526', 0.2); ctx.beginPath(); ctx.moveTo(r.pts[0], r.pts[1]); for (let i = 3; i < r.pts.length; i += 3) ctx.lineTo(r.pts[i], r.pts[i + 1]); ctx.strokeStyle = 'rgba(206,198,236,0.55)'; ctx.lineWidth = 0.2; ctx.setLineDash([0.9, 1.1]); ctx.stroke(); ctx.setLineDash([]); }
    else if (r.cls === 'clear') band(r.pts, 'rgb(222,222,250)', WATER_INK, 0.2);
    else if (maxW(r) >= 1.0) band(r.pts, r.id === 'pyre' ? 'rgb(222,222,242)' : 'rgb(178,174,232)', WATER_INK, 0.24);
    else strokeVar(r.pts, WATER_INK);
  }
  // the Seam: black water beside brown, unmixed
  if (vec.seam.length > 5) { const a = vec.seam; ctx.strokeStyle = BLACKWATER; for (let i = 0; i + 5 < a.length; i += 3) { ctx.beginPath(); ctx.moveTo(a[i], a[i + 1]); ctx.lineTo(a[i + 3], a[i + 4]); ctx.lineWidth = Math.max(0.1, a[i + 2]); ctx.lineCap = 'butt'; ctx.stroke(); } ctx.lineCap = 'round'; }
  // falls and rapids: bars across the stream; the gorge: ticks down both walls
  segs(vec.falls, 'rgba(244,242,252,0.95)', 0.5); segs(vec.falls, INK, 0.22);
  segs(vec.gorge, `rgba(${INK_RGB},0.86)`, 0.26);

  // ---- the Great Step: one lip, and hachures falling west from it
  {
    const st = vec.step;
    ctx.beginPath(); let pen = false;
    for (const p of st) { if (p[2] > 0.2) { if (pen) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); pen = true; } else pen = false; }
    ctx.strokeStyle = INK; ctx.lineWidth = 0.62; ctx.stroke();
    for (let i = 1; i < st.length - 1; i++) {
      if (st[i][2] < 0.05) continue;
      const a = st[i - 1], b = st[i + 1]; let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const long = i % 3 === 0, len = (long ? 6.4 + 3.2 * hash(i, 3) : 2.6 + 1.8 * hash(i, 5)) * st[i][2];
      ctx.beginPath(); ctx.moveTo(st[i][0], st[i][1]); ctx.lineTo(st[i][0] - ty * len + tx * 0.5, st[i][1] + tx * len + ty * 0.5);
      ctx.strokeStyle = `rgba(${INK_RGB},${long ? 0.92 : 0.7})`; ctx.lineWidth = long ? 0.4 : 0.28; ctx.stroke();
    }
  }

  // ---- the coast: a feathered under-line, then the pen
  ctx.beginPath(); for (const a of vec.coast) path(a); ctx.strokeStyle = `rgba(${INK_RGB},0.34)`; ctx.lineWidth = 1.0; ctx.filter = 'blur(1.6px)'; ctx.stroke(); ctx.filter = 'none';
  ctx.beginPath(); for (const a of vec.coast) path(a); ctx.strokeStyle = INK; ctx.lineWidth = 0.4; ctx.stroke();

  // ---- plant marks. Their green follows WATERS.md's foliage track, olive at step 1 to deep green at 15.
  const hsv = (hh, s, v) => { const f = (n) => { const k = (n + hh / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); }; return [f(5) * 255, f(3) * 255, f(1) * 255]; };
  const leaf = [];
  for (let st = 0; st <= 15; st++) {
    const hue = 84 + 2.9 * st, cap = Math.min(0.62, 0.25 + 0.04 * st), sat = Math.min(cap - 0.04, 0.24 + 0.02 * st), val = 0.38 + 0.01 * st;
    const c = (s, v, a = 1) => { const [r, g, b] = hsv(hue, Math.min(1, s), Math.min(1, v)); return `rgba(${r | 0},${g | 0},${b | 0},${a})`; };
    leaf.push({ mid: c(sat, val + 0.05), deep: c(sat, val - 0.05), bright: c(sat * 0.9, val + 0.15), dark: c(sat, val * 0.5), ink: c(sat, val * 0.72), soft: c(sat * 0.8, val + 0.08, 0.85) });
  }
  const DRY = 'rgba(126,112,104,0.8)', DRY_FILL = 'rgba(176,164,146,0.9)';
  const T = { CONIFER: 0, BROADLEAF: 1, CANOPY: 2, MANGROVE: 3, SWAMP: 4, PALM: 5, ACACIA: 6, MOSS: 7, HEATH: 8, GRASS: 9, SCRUB: 10, DUNE: 11, REED: 12, PAPYRUS: 13, GRAVEL: 14, WILLOW: 15 };
  const OUT = 0.24; // the one line weight the plant marks are inked in
  for (let i = 0; i < glyphs.length; i += 7) {
    const x = glyphs[i], y = glyphs[i + 1], type = glyphs[i + 2], s = glyphs[i + 3], u = glyphs[i + 5];
    const lf0 = leaf[Math.max(0, Math.min(15, Math.round(glyphs[i + 4])))], tone = hash(x * 1.7, y * 1.3) + glyphs[i + 6] * 2.4;
    const fill = tone < 0.26 ? lf0.deep : tone > 0.86 ? lf0.bright : lf0.mid, lf = lf0;
    ctx.lineWidth = OUT;
    switch (type) {
      case T.CONIFER: {
        const hgt = 2.75 * s, w = 0.8 * s;
        ctx.beginPath(); ctx.moveTo(x, y + 0.1); ctx.lineTo(x, y + 0.55 * s); ctx.strokeStyle = lf.dark; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y - hgt); ctx.lineTo(x + w, y + 0.1); ctx.lineTo(x - w, y + 0.1); ctx.closePath();
        ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = lf.dark; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 0.02, y - hgt * 0.8); ctx.lineTo(x + w * 0.72, y - 0.05); ctx.strokeStyle = lf.dark; ctx.globalAlpha = 0.55; ctx.stroke(); ctx.globalAlpha = 1;
        break; }
      case T.BROADLEAF: {
        const r = 1.3 * s, cy2 = y - r * 0.82;
        ctx.beginPath(); ctx.moveTo(x, y + 0.4 * s); ctx.lineTo(x, y - 0.1); ctx.strokeStyle = lf.dark; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, cy2, r, 0, 6.3); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = lf.dark; ctx.stroke();
        ctx.beginPath(); ctx.arc(x - r * 0.05, cy2 - r * 0.05, r * 0.6, 0.1, 1.7); ctx.globalAlpha = 0.6; ctx.stroke(); ctx.globalAlpha = 1;
        break; }
      case T.CANOPY: {
        const r = 1.5 * s;
        const lobes = [[-0.5, -0.3, 0.78], [0.48, -0.45, 0.76], [0.02, -1.02, 0.68]];
        ctx.beginPath(); for (const l of lobes) { ctx.moveTo(x + r * (l[0] + l[2]), y + r * l[1]); ctx.arc(x + r * l[0], y + r * l[1], r * l[2], 0, 6.3); }
        ctx.fillStyle = fill; ctx.fill();
        ctx.strokeStyle = lf.dark;
        ctx.beginPath(); ctx.arc(x + r * lobes[0][0], y + r * lobes[0][1], r * lobes[0][2], 0.4, 3.9); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + r * lobes[1][0], y + r * lobes[1][1], r * lobes[1][2], -1.2, 2.5); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + r * lobes[2][0], y + r * lobes[2][1], r * lobes[2][2], 2.9, 6.5); ctx.stroke();
        break; }
      case T.MANGROVE: {
        const r = 1.1 * s;
        ctx.strokeStyle = lf.dark; ctx.beginPath();
        for (const d of [-0.55, 0, 0.55]) { ctx.moveTo(x + d * r * 0.4, y - r * 0.6); ctx.quadraticCurveTo(x + d * r * 1.5, y - r * 0.2, x + d * r * 1.35, y + r * 0.5); }
        ctx.stroke();
        ctx.beginPath(); ctx.ellipse(x, y - r * 1.02, r * 1.08, r * 0.72, 0, 0, 6.3); ctx.fillStyle = fill; ctx.fill(); ctx.stroke();
        break; }
      case T.SWAMP: {
        const r = 1.15 * s;
        ctx.beginPath(); ctx.moveTo(x - r * 0.42, y + 0.45 * s); ctx.lineTo(x - 0.08, y - r * 0.5); ctx.moveTo(x + r * 0.42, y + 0.45 * s); ctx.lineTo(x + 0.08, y - r * 0.5); ctx.strokeStyle = lf.dark; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y - r * 1.25, r, 0, 6.3); ctx.fillStyle = fill; ctx.fill(); ctx.stroke();
        ctx.beginPath(); for (const d of [-0.62, -0.1, 0.5]) { ctx.moveTo(x + d * r, y - r * 0.6); ctx.lineTo(x + d * r, y - r * 0.6 + (0.5 + hash(x, y + d) * 0.5) * r); }
        ctx.strokeStyle = 'rgba(112,132,112,0.9)'; ctx.stroke();
        break; }
      case T.PALM: {
        const hh = 2.4 * s, lean = (u - 0.5) * 1.1;
        ctx.beginPath(); ctx.moveTo(x, y + 0.2); ctx.quadraticCurveTo(x + lean * 0.2, y - hh * 0.6, x + lean, y - hh); ctx.strokeStyle = lf.dark; ctx.stroke();
        ctx.beginPath(); const tx = x + lean, ty = y - hh;
        for (let f = 0; f < 6; f++) { const a = -Math.PI + (f / 5) * Math.PI + (hash(x + f, y) - 0.5) * 0.3, l = 1.3 * s; ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + Math.cos(a) * l * 0.6, ty + Math.sin(a) * l * 0.9 - 0.14, tx + Math.cos(a) * l, ty + Math.sin(a) * l * 0.4 + 0.3); }
        ctx.strokeStyle = fill; ctx.lineWidth = 0.34; ctx.stroke();
        ctx.beginPath(); ctx.arc(tx, ty + 0.05, 0.62 * s, 0, 6.3); ctx.fillStyle = fill; ctx.fill(); // the crown's heart, so a palm carries its green
        break; }
      case T.WILLOW: {
        const r = 1.1 * s;
        ctx.beginPath(); ctx.arc(x, y - r * 0.7, r, Math.PI, 0); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = lf.dark; ctx.stroke();
        ctx.beginPath(); for (const d of [-0.6, 0, 0.6]) { ctx.moveTo(x + d * r, y - r * 0.7); ctx.lineTo(x + d * r, y - r * 0.15); } ctx.strokeStyle = lf.ink; ctx.stroke();
        break; }
      case T.ACACIA: {
        ctx.beginPath(); ctx.moveTo(x, y + 0.2); ctx.lineTo(x, y - 0.9 * s); ctx.moveTo(x, y - 0.5 * s); ctx.lineTo(x + 0.5 * s, y - 1.0 * s); ctx.strokeStyle = DRY; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(x + 0.12, y - 1.2 * s, 1.15 * s, 0.4 * s, 0, 0, 6.3); ctx.fillStyle = lf.soft; ctx.fill(); ctx.strokeStyle = lf.dark; ctx.stroke();
        break; }
      case T.MOSS: {
        // a cushion of moss: a low mound and a few ticks
        ctx.beginPath(); ctx.ellipse(x, y, 0.95 * s, 0.5 * s, 0, Math.PI, 0); ctx.closePath(); ctx.fillStyle = lf.mid; ctx.fill();
        ctx.beginPath(); for (const d of [-0.5, 0, 0.48]) { ctx.moveTo(x + d * s, y - 0.3 * s); ctx.lineTo(x + d * s + 0.06, y - (0.72 + hash(x + d, y) * 0.34) * s); }
        ctx.strokeStyle = lf.ink; ctx.lineWidth = 0.22; ctx.stroke(); break; }
      case T.HEATH: {
        ctx.beginPath(); for (const d of [-0.7, -0.2, 0.3, 0.7]) { ctx.moveTo(x, y); ctx.lineTo(x + d * s, y - (0.85 - Math.abs(d) * 0.4) * s); }
        ctx.strokeStyle = 'rgba(112,104,128,0.75)'; ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 0.3 * s, y - 0.85 * s, 0.16, 0, 6.3); ctx.fillStyle = lf.soft; ctx.fill(); break; }
      case T.GRASS: {
        ctx.beginPath(); ctx.moveTo(x - 0.5 * s, y - 0.55 * s); ctx.lineTo(x, y); ctx.lineTo(x + 0.5 * s, y - 0.6 * s); ctx.moveTo(x, y); ctx.lineTo(x + 0.04, y - 0.72 * s);
        ctx.strokeStyle = DRY; ctx.globalAlpha = 0.62; ctx.stroke(); ctx.globalAlpha = 1; break; }
      case T.SCRUB: {
        ctx.beginPath(); ctx.arc(x, y - 0.3 * s, 0.46 * s, Math.PI, 0); ctx.closePath(); ctx.fillStyle = DRY_FILL; ctx.fill(); ctx.strokeStyle = DRY; ctx.stroke(); break; }
      case T.DUNE: {
        ctx.beginPath(); ctx.moveTo(x - 1.6 * s, y + 0.4); ctx.quadraticCurveTo(x - 0.1, y - 1.1 * s, x + 1.7 * s, y + 0.4);
        ctx.strokeStyle = `rgba(${INK_RGB},0.4)`; ctx.stroke();
        ctx.fillStyle = `rgba(${INK_RGB},0.34)`; for (let d = 0; d < 3; d++) { ctx.beginPath(); ctx.arc(x + 0.4 + d * 0.44, y + 0.05 + d * 0.13, 0.08, 0, 6.3); ctx.fill(); } break; }
      case T.GRAVEL: {
        ctx.fillStyle = `rgba(${INK_RGB},0.4)`; for (let d = 0; d < 4; d++) { ctx.beginPath(); ctx.arc(x + (hash(x, d) - 0.5) * 1.6, y + (hash(d, y) - 0.5) * 1.2, 0.1, 0, 6.3); ctx.fill(); } break; }
      case T.REED: case T.PAPYRUS: {
        ctx.beginPath(); const tips = [];
        for (const d of [-0.5, -0.12, 0.3, 0.62]) { const tx = x + d * s * 1.3, ty = y - (1.0 + hash(x + d, y) * 0.5) * s; ctx.moveTo(x + d * s * 0.5, y); ctx.lineTo(tx, ty); tips.push(tx, ty); }
        ctx.strokeStyle = fill; ctx.lineWidth = 0.3; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(x + 0.05 * s, y, 0.7 * s, 0.34 * s, 0, Math.PI, 0); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); // the tuft's foot
        if (type === T.PAPYRUS) { ctx.fillStyle = 'rgba(226,160,68,0.95)'; for (let q = 0; q < tips.length; q += 4) { ctx.beginPath(); ctx.arc(tips[q], tips[q + 1], 0.2, 0, 6.3); ctx.fill(); } }
        break; }
      default: break;
    }
  }

  // ---- the kingdom's works, inked on top of whatever grows (WORLD.md §10)
  // canals: two ruled banks with still water between, and a bar across at each lock
  for (const c of vec.canals) {
    ctx.lineCap = 'butt';
    ctx.beginPath(); path(c.pts); ctx.strokeStyle = INK; ctx.lineWidth = 2.1; ctx.stroke();
    ctx.beginPath(); path(c.pts); ctx.strokeStyle = 'rgb(182,178,234)'; ctx.lineWidth = 1.42; ctx.stroke();
    for (const l of c.locks) {
      let best = 0, bd = 1e9; for (let i = 0; i + 3 < c.pts.length; i += 2) { const d = Math.hypot(c.pts[i] - l[0], c.pts[i + 1] - l[1]); if (d < bd) { bd = d; best = i; } }
      const j = Math.min(best, c.pts.length - 4), ang = Math.atan2(c.pts[j + 3] - c.pts[j + 1], c.pts[j + 2] - c.pts[j]);
      ctx.save(); ctx.translate(l[0], l[1]); ctx.rotate(ang);
      ctx.beginPath(); ctx.moveTo(-0.34, -1.7); ctx.lineTo(-0.34, 1.7); ctx.moveTo(0.34, -1.7); ctx.lineTo(0.34, 1.7); ctx.strokeStyle = INK; ctx.lineWidth = 0.3; ctx.stroke(); ctx.restore();
    }
    ctx.lineCap = 'round';
  }
  segs(vec.mileTicks, `rgba(${INK_RGB},0.85)`, 0.22);
  const lamp = (x, y, r = 0.28, col = '#f0a23c') => { ctx.beginPath(); ctx.arc(x, y, r, 0, 6.3); ctx.fillStyle = col; ctx.fill(); };
  const towerAt = (x, y, s = 1) => { ctx.beginPath(); ctx.rect(x - 0.5 * s, y - 2.1 * s, s, 2.1 * s); ctx.fillStyle = STONE; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.2; ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 0.66 * s, y - 2.1 * s); ctx.lineTo(x + 0.66 * s, y - 2.1 * s); ctx.lineWidth = 0.3; ctx.stroke(); };
  const along = (pts, step, fn) => { for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / step)), ang = Math.atan2(b[1] - a[1], b[0] - a[0]); for (let q = 0; q <= n; q++) fn(a[0] + ((b[0] - a[0]) * q) / n, a[1] + ((b[1] - a[1]) * q) / n, ang); } };
  for (const l of vec.landmarks) {
    const s = l.s || 1;
    ctx.save();
    switch (l.g) {
      case 'city': { // the lower city, seen through the water: crooked streets, a ring road, a few arches
        ctx.translate(l.at[0], l.at[1]); ctx.rotate((l.rot * Math.PI) / 180);
        ctx.beginPath(); ctx.ellipse(0, 0, l.rx, l.ry, 0, 0, 6.3); ctx.clip();
        ctx.fillStyle = 'rgba(206,200,246,0.1)'; ctx.fillRect(-l.rx, -l.ry, 2 * l.rx, 2 * l.ry);
        ctx.strokeStyle = 'rgba(222,216,252,0.5)'; ctx.lineWidth = 0.2;
        for (let q = 0; q < 9; q++) {
          const a = (q / 9) * 6.283 + hash(q, 2) * 0.5; ctx.beginPath(); let r = 1.2 + hash(q, 3) * 1.5, px = Math.cos(a) * r, py = Math.sin(a) * r * 0.62; ctx.moveTo(px, py);
          for (let t = 0; t < 6; t++) { r += 1.6 + hash(q, t) * 1.4; const aa = a + (hash(t, q) - 0.5) * 0.5; ctx.lineTo(Math.cos(aa) * r, Math.sin(aa) * r * 0.62); }
          ctx.stroke();
        }
        for (const rr of [0.36, 0.68]) { ctx.beginPath(); for (let t = 0; t <= 26; t++) { const a = (t / 26) * 6.283, w = 1 + 0.1 * (hash(t, rr * 9) - 0.5); const px = Math.cos(a) * l.rx * rr * w, py = Math.sin(a) * l.ry * rr * w; if (t === 0 || hash(t, 5 + rr) < 0.16) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.stroke(); }
        for (let q = 0; q < 12; q++) { const px = (hash(q, 1) - 0.5) * 1.7 * l.rx, py = (hash(q, 7) - 0.5) * 1.5 * l.ry; ctx.beginPath(); ctx.arc(px, py, 0.42, Math.PI, 0); ctx.stroke(); }
        break; }
      case 'tower': towerAt(l.at[0], l.at[1], s * 0.95); break;
      case 'wall': {
        ctx.beginPath(); path(l.pts.flat()); ctx.strokeStyle = INK; ctx.lineWidth = 0.95; ctx.lineCap = 'butt'; ctx.stroke();
        ctx.beginPath(); path(l.pts.flat()); ctx.strokeStyle = STONE; ctx.lineWidth = 0.46; ctx.stroke(); ctx.lineCap = 'round';
        along(l.pts, 4.4, (x, y) => { ctx.beginPath(); ctx.rect(x - 0.66, y - 0.66, 1.32, 1.32); ctx.fillStyle = STONE; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.22; ctx.stroke(); });
        break; }
      case 'sluice': { const [x, y] = l.at; ctx.beginPath(); ctx.rect(x - 0.8, y - 1.0, 1.6, 1.7); ctx.fillStyle = STONE; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.2; ctx.stroke(); ctx.beginPath(); for (const d of [-0.34, 0, 0.34]) { ctx.moveTo(x + d, y - 1.0); ctx.lineTo(x + d, y + 0.7); } ctx.lineWidth = 0.14; ctx.stroke(); break; }
      case 'stair': { along(l.pts, 0.9 * s, (x, y, a) => { ctx.beginPath(); ctx.moveTo(x - Math.sin(a) * 0.4 + Math.sin(a) * 1.9, y + Math.cos(a) * 0.4 - Math.cos(a) * 1.9); ctx.lineTo(x + Math.sin(a) * 0.4 + Math.sin(a) * 1.9, y - Math.cos(a) * 0.4 - Math.cos(a) * 1.9); ctx.strokeStyle = INK; ctx.lineWidth = 0.18; ctx.stroke(); }); break; }
      case 'ruins': case 'town': case 'drowned': {
        for (let q = 0; q < l.n; q++) {
          const a = hash(l.at[0] + q, 2) * 6.3, r = Math.sqrt(hash(q, l.at[1])) * l.r, x = l.at[0] + Math.cos(a) * r, y = l.at[1] + Math.sin(a) * r * 0.7, w = 1.0 + hash(q, 9) * 1.1, hh = 0.9 + hash(q, 4) * 0.8;
          ctx.beginPath();
          if (l.g === 'drowned') { ctx.moveTo(x - w * 0.6, y + 0.3); ctx.lineTo(x, y - 0.4); ctx.lineTo(x + w * 0.6, y + 0.3); ctx.strokeStyle = 'rgba(226,220,252,0.6)'; ctx.lineWidth = 0.18; ctx.stroke(); continue; }
          ctx.moveTo(x - w / 2, y + hh / 2); ctx.lineTo(x - w / 2, y - hh / 2); ctx.lineTo(x + w / 2, y - hh / 2); ctx.lineTo(x + w / 2, y + hh * (hash(q, 6) - 0.2));
          if (hash(q, 8) > 0.45) ctx.lineTo(x - w / 2, y + hh / 2);
          ctx.strokeStyle = `rgba(${INK_RGB},0.9)`; ctx.lineWidth = 0.24; ctx.stroke();
        }
        break; }
      case 'lock': { ctx.translate(l.at[0], l.at[1]); ctx.rotate((l.rot * Math.PI) / 180); ctx.beginPath(); ctx.moveTo(-0.34, -1.5); ctx.lineTo(-0.34, 1.5); ctx.moveTo(0.34, -1.5); ctx.lineTo(0.34, 1.5); ctx.strokeStyle = INK; ctx.lineWidth = 0.28; ctx.stroke(); break; }
      case 'caps': { // giant mushrooms
        for (let q = 0; q < l.n; q++) {
          const a = hash(q, 11) * 6.3, r = (0.35 + 0.65 * hash(q, 13)) * l.r, x = l.at[0] + Math.cos(a) * r, y = l.at[1] + Math.sin(a) * r * 0.75, z = 0.8 + hash(q, 17) * 0.9;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 1.3 * z); ctx.strokeStyle = INK; ctx.lineWidth = 0.2; ctx.stroke();
          ctx.beginPath(); ctx.ellipse(x, y - 1.3 * z, 0.95 * z, 0.5 * z, 0, Math.PI, 0); ctx.closePath(); ctx.fillStyle = ['#c98aa8', '#b88cc0', '#d8a0b4'][q % 3]; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.16; ctx.stroke();
        }
        break; }
      case 'garden': { const [x, y] = l.at; ctx.beginPath(); ctx.rect(x - 1.5, y - 1, 3, 2); for (let d = -0.5; d <= 0.5; d += 0.5) { ctx.moveTo(x - 1.5, y + d); ctx.lineTo(x + 1.5, y + d); } ctx.strokeStyle = `rgba(${INK_RGB},0.7)`; ctx.lineWidth = 0.14; ctx.stroke(); break; }
      case 'crystals': { for (let q = 0; q < l.n; q++) { const a = hash(q, 21) * 6.3, r = (0.55 + 0.45 * hash(q, 23)) * l.r, x = l.at[0] + Math.cos(a) * r, y = l.at[1] + Math.sin(a) * r * 0.62, z = 0.5 + hash(q, 27) * 0.6; ctx.beginPath(); ctx.moveTo(x, y - 1.5 * z); ctx.lineTo(x + 0.5 * z, y - 0.4 * z); ctx.lineTo(x, y + 0.3 * z); ctx.lineTo(x - 0.5 * z, y - 0.4 * z); ctx.closePath(); ctx.fillStyle = '#c3cbfa'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.13; ctx.stroke(); } break; }
      case 'ribs': { // a few bone-white ribs standing out of the lake, no two alike
        ctx.translate(l.at[0], l.at[1]); ctx.rotate((l.rot * Math.PI) / 180);
        for (let q = 0; q < l.n; q++) {
          const t = (q + 0.5) / l.n, x = (t - 0.5) * 2 * l.rx * 0.84 + (hash(q, 61) - 0.5) * 3, hgt = l.ry * (0.35 + 0.75 * Math.sin(t * Math.PI) * (0.6 + 0.6 * hash(q, 63))), lean = (hash(q, 67) - 0.3) * 3.2, base = (hash(q, 69) - 0.5) * 3;
          for (const col of [[INK, 0.62], ['#f6f3fa', 0.36]]) { ctx.beginPath(); ctx.moveTo(x - 1.0, base + hgt * 0.45); ctx.quadraticCurveTo(x - 1.4 + lean * 0.2, base - hgt * 0.7, x + lean, base - hgt * 0.62); ctx.strokeStyle = col[0]; ctx.lineWidth = col[1]; ctx.stroke(); }
        }
        break; }
      case 'weir': { ctx.translate(l.at[0], l.at[1]); ctx.rotate((l.rot * Math.PI) / 180); ctx.beginPath(); ctx.moveTo(-3.6, 0); ctx.lineTo(-0.7, 0); ctx.moveTo(1.0, 0); ctx.lineTo(3.6, 0); ctx.strokeStyle = INK; ctx.lineWidth = 0.66; ctx.lineCap = 'butt'; ctx.stroke(); ctx.strokeStyle = STONE; ctx.lineWidth = 0.32; ctx.stroke(); ctx.lineCap = 'round'; break; }
      case 'slipway': { ctx.beginPath(); path(l.pts.flat()); ctx.strokeStyle = `rgba(${INK_RGB},0.8)`; ctx.lineWidth = 1.0; ctx.setLineDash([0.2, 0.66]); ctx.lineCap = 'butt'; ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'round'; break; }
      case 'reefTown': { const [x, y] = l.at; // roofs under coral, and the reef's edge
        ctx.strokeStyle = 'rgba(238,212,220,0.85)'; ctx.lineWidth = 0.18;
        for (let q = 0; q < 26; q++) { const a = hash(q, 31) * 6.3, r = 2 + Math.sqrt(hash(q, 33)) * 9, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.8; ctx.beginPath(); if (q % 3 === 0) { ctx.moveTo(px - 0.7, py + 0.3); ctx.lineTo(px, py - 0.5); ctx.lineTo(px + 0.7, py + 0.3); } else { ctx.arc(px, py, 0.4, Math.PI, 0); ctx.arc(px + 0.8, py, 0.4, Math.PI, 0); } ctx.stroke(); }
        break; }
      case 'dam': { const [a, b] = l.pts; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineCap = 'butt'; ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke(); ctx.strokeStyle = STONE; ctx.lineWidth = 1.0; ctx.stroke(); ctx.lineCap = 'round'; break; }
      case 'hulls': { for (let q = 0; q < l.n; q++) { const x = l.at[0] + (q % 3) * 3.6 + (q > 2 ? 1.2 : 0), y = l.at[1] + (q > 2 ? 2.6 : 0); ctx.beginPath(); ctx.moveTo(x - 1.4, y); ctx.lineTo(x + 1.4, y); for (let d = -1; d <= 1; d += 0.5) { ctx.moveTo(x + d, y - 0.62); ctx.quadraticCurveTo(x + d + 0.16, y, x + d, y + 0.62); } ctx.strokeStyle = INK; ctx.lineWidth = 0.16; ctx.stroke(); } break; }
      case 'posts': { for (const p of l.pts) { ctx.beginPath(); ctx.rect(p[0] - 0.3, p[1] - 0.8, 0.6, 1.0); ctx.fillStyle = '#f6f3fa'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.14; ctx.stroke(); } break; }
      case 'barge': case 'wreck': { ctx.translate(l.at[0], l.at[1]); ctx.rotate((l.rot * Math.PI) / 180); ctx.beginPath(); ctx.moveTo(-1.8, 0); ctx.quadraticCurveTo(0, -1.0, 1.8, 0); ctx.quadraticCurveTo(0, 1.0, -1.8, 0); ctx.moveTo(-0.45, -0.55); ctx.lineTo(-0.45, 0.55); ctx.moveTo(0.45, -0.55); ctx.lineTo(0.45, 0.55); ctx.strokeStyle = 'rgba(232,226,250,0.85)'; ctx.lineWidth = 0.17; ctx.stroke(); break; }
      case 'stilts': { for (let q = 0; q < l.n; q++) { const a = hash(q, 41) * 6.3, r = Math.sqrt(hash(q, 43)) * l.r, x = l.at[0] + Math.cos(a) * r * 0.8, y = l.at[1] + Math.sin(a) * r; ctx.beginPath(); ctx.rect(x - 0.5, y - 0.9, 1.0, 0.62); ctx.moveTo(x - 0.68, y - 0.9); ctx.lineTo(x, y - 1.4); ctx.lineTo(x + 0.68, y - 0.9); ctx.moveTo(x - 0.38, y - 0.28); ctx.lineTo(x - 0.38, y + 0.3); ctx.moveTo(x + 0.38, y - 0.28); ctx.lineTo(x + 0.38, y + 0.3); ctx.fillStyle = STONE; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.13; ctx.stroke(); lamp(x + 0.7, y - 0.46, 0.16, '#f0a23c'); } break; }
      case 'rows': { // the orchard's rows and dikes, in the old plan's simple, unsure hand
        ctx.translate(l.at[0], l.at[1]); ctx.rotate((l.rot * Math.PI) / 180);
        ctx.strokeStyle = `rgba(${INK_RGB},0.8)`; ctx.lineWidth = 0.2;
        for (let yy = -l.h / 2; yy <= l.h / 2 + 0.01; yy += 2.1) { ctx.beginPath(); for (let xx = -l.w / 2; xx <= l.w / 2; xx += 2) { const wy = yy + (hash(xx, yy + l.at[0]) - 0.5) * 0.5; if (xx === -l.w / 2) ctx.moveTo(xx, wy); else ctx.lineTo(xx, wy); } ctx.stroke(); }
        ctx.beginPath(); ctx.rect(-l.w / 2 - 0.6, -l.h / 2 - 0.8, l.w + 1.2, l.h + 1.6); ctx.setLineDash([1.6, 0.7]); ctx.stroke(); ctx.setLineDash([]);
        break; }
      case 'oxbow': { ctx.translate(l.at[0], l.at[1]); ctx.rotate((l.rot * Math.PI) / 180); ctx.beginPath(); ctx.arc(0, 0, 3.2 * s, 0.5, 2.9); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke(); ctx.strokeStyle = SILT; ctx.lineWidth = 1.0; ctx.stroke(); break; }
      case 'buoys': { for (const p of l.pts) { ctx.beginPath(); ctx.moveTo(p[0], p[1] - 0.8); ctx.lineTo(p[0] + 0.52, p[1]); ctx.lineTo(p[0], p[1] + 0.42); ctx.lineTo(p[0] - 0.52, p[1]); ctx.closePath(); ctx.fillStyle = 'rgba(240,236,250,0.95)'; ctx.fill(); ctx.strokeStyle = '#231d3a'; ctx.lineWidth = 0.12; ctx.stroke(); ctx.beginPath(); ctx.moveTo(p[0], p[1] - 0.8); ctx.lineTo(p[0], p[1] - 1.4); ctx.stroke(); } break; }
      case 'driftLine': { ctx.beginPath(); smoothPath(l.pts); ctx.strokeStyle = 'rgba(132,150,92,0.85)'; ctx.lineWidth = 0.6; ctx.setLineDash([1.0, 0.8]); ctx.stroke(); ctx.setLineDash([]); break; }
      case 'tide': { // the harbour-masters' tide arrows: the flood in, the ebb out
        ctx.translate(l.at[0], l.at[1]); ctx.rotate((l.rot * Math.PI) / 180); ctx.strokeStyle = 'rgba(236,232,252,0.85)'; ctx.lineWidth = 0.22;
        for (const [yy, dir] of [[-3.2, 1], [3.2, -1]]) { ctx.beginPath(); ctx.moveTo(-4 * dir, yy); ctx.lineTo(4 * dir, yy); ctx.lineTo(2.6 * dir, yy - 0.9); ctx.moveTo(4 * dir, yy); ctx.lineTo(2.6 * dir, yy + 0.9); if (dir > 0) for (const f of [-3.2, -2.2]) { ctx.moveTo(f, yy); ctx.lineTo(f - 0.8, yy - 0.8); ctx.moveTo(f, yy); ctx.lineTo(f - 0.8, yy + 0.8); } ctx.stroke(); }
        break; }
      default: break;
    }
    ctx.restore();
  }

  // ---- the far isle stands in cloud: three pale strokes, no fog
  ctx.strokeStyle = 'rgba(236,232,252,0.7)'; ctx.lineWidth = 0.3;
  for (const c of [[47, 489, 6], [59, 492.5, 5], [51, 498.5, 6.5]]) { ctx.beginPath(); for (let q = 0; q < 4; q++) ctx.arc(c[0] + q * c[2] * 0.42, c[1], c[2] * 0.22, Math.PI, 0); ctx.stroke(); }

  // ---- the Fold: rows of one repeated mark, and a pleat drawn right across the sheet at each edge
  for (let i = 0; i < vec.fold.length; i += 3) {
    const x = vec.fold[i], y = vec.fold[i + 1], land = vec.fold[i + 2];
    ctx.beginPath();
    if (land) { ctx.moveTo(x - 2.3, y + 0.7); ctx.quadraticCurveTo(x - 0.3, y - 1.6, x + 2.3, y + 0.7); ctx.moveTo(x + 0.5, y + 0.05); ctx.lineTo(x + 1.2, y + 0.6); ctx.strokeStyle = `rgba(${INK_RGB},0.62)`; }
    else { ctx.moveTo(x - 2.1, y); ctx.bezierCurveTo(x - 1.1, y - 1.1, x - 0.6, y + 1.1, x + 0.2, y); ctx.bezierCurveTo(x + 0.9, y - 0.9, x + 1.5, y + 0.5, x + 2.1, y - 0.1); ctx.strokeStyle = 'rgba(226,220,252,0.6)'; }
    ctx.lineWidth = 0.3; ctx.stroke();
  }
  vec.pleat.forEach((line, e) => {
    const dir = e === 0 ? 1 : -1; // the shadow lies inside the Fold
    const g = ctx.createLinearGradient(0, line[1], 0, line[1] + dir * 5.5);
    g.addColorStop(0, 'rgba(40,30,60,0.26)'); g.addColorStop(1, 'rgba(40,30,60,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(line[0], line[1]); for (let i = 2; i < line.length; i += 2) ctx.lineTo(line[i], line[i + 1]);
    ctx.lineTo(line[line.length - 2], line[1] + dir * 6); ctx.lineTo(line[0], line[1] + dir * 6); ctx.closePath(); ctx.fill();
    ctx.beginPath(); path(line); ctx.strokeStyle = 'rgba(246,242,250,0.75)'; ctx.lineWidth = 0.9; ctx.stroke();
    ctx.beginPath(); path(line); ctx.strokeStyle = INK; ctx.lineWidth = 0.32; ctx.stroke();
  });
  ctx.restore();

  // ---- hand the images back
  const out = {};
  out.world = cv.toDataURL('image/webp', quality);
  const pv = document.createElement('canvas'); pv.width = Math.round(UW * 1.4); pv.height = Math.round(UH * 1.4);
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
  // how green the land is round each water: the share of land pixels that carry leaf-green ink
  out.ramp = (meta.ramp || []).map((p) => {
    const R = p[2], sx0 = Math.round((p[0] - R - x0) * BS), sy0 = Math.round((p[1] - R - y0) * BS), n = Math.round(2 * R * BS);
    const d = ctx.getImageData(sx0, sy0, n, n).data; let land = 0, green = 0;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      if ((i - n / 2) * (i - n / 2) + (j - n / 2) * (j - n / 2) > (n / 2) * (n / 2)) continue;
      const o = (j * n + i) * 4, r = d[o] / 255, g = d[o + 1] / 255, b = d[o + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), c = mx - mn;
      const s = mx ? c / mx : 0; let h = 0;
      if (c > 0) { h = mx === r ? ((g - b) / c) % 6 : mx === g ? (b - r) / c + 2 : (r - g) / c + 4; h *= 60; if (h < 0) h += 360; }
      if (h > 200 && h < 290 && s > 0.18) continue; // water
      land++; if (h >= 65 && h <= 160 && s > 0.12) green++;
    }
    return land ? +(100 * green / land).toFixed(1) : 0;
  });
  out.size = [cv.width, cv.height];
  return out;
};
