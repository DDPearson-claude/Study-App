// The Waxwold chart: pan and zoom, the sixteen sheets revealed by "maps owned", a card for each
// water, and a raft that sails the Lamp Road. One canvas: the baked world image under a live layer
// of border, road, lamps, landmark vignettes and lettering, so those stay sharp at every zoom.
(function () {
  'use strict';
  const D = DATA, SH = D.sheet;
  const $ = (id) => document.getElementById(id);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const css = getComputedStyle(document.documentElement);
  const F = {
    display: css.getPropertyValue('--f-display').trim() || 'Georgia, serif',
    chart: css.getPropertyValue('--f-chart').trim() || 'Georgia, serif',
    body: css.getPropertyValue('--f-body').trim() || 'Georgia, serif',
    hand: css.getPropertyValue('--f-hand').trim() || 'cursive',
  };
  // the chart's own colours: it is vellum and ink whatever the page's theme
  const C = { ink: '59,46,68', paper: '238,232,236', amber: '240,162,60', flame: '255,206,128', pale: '226,220,252', water: '58,54,118', sage: '166,212,160', stone: '236,232,241' };
  const INK = `rgb(${C.ink})`, STONE = `rgb(${C.stone})`, AMBER = `rgb(${C.amber})`;

  const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  let reduced = mq.matches;
  const chartEl = $('chart'), cv = $('cv'), ctx = cv.getContext('2d');
  const off = document.createElement('canvas'), octx = off.getContext('2d');
  const maskCv = document.createElement('canvas'), mctx = maskCv.getContext('2d');
  const S = {
    owned: 16, mode: 'chart', sel: null, vw: 0, vh: 0, dpr: 1,
    view: { x: SH.x0 + SH.w / 2, y: SH.y0 + SH.h / 2, k: 0.5 }, fitK: 0.5, userMoved: false,
    reveal: null, // { sheet, t0, ms } while a sheet inks in
    tween: null, journey: null, raft: null, hearthFull: false, ready: false, world: [], tiles: [], marks: [],
  };
  const W = D.waters, HOME = D.home, ACTS = D.acts, PC = D.pieces;
  const WIN = [SH.x0 + SH.neat, SH.y0 + SH.neat, SH.x0 + SH.w - SH.neat, SH.y0 + SH.h - SH.neat]; // the neatline
  const SILL = [668, 98]; // the Waystones' sill, drawn off the Landing's cove
  const FURNITURE = [[2, 1352, 234, 1430], [SILL[0] - 22, SILL[1] - 28, SILL[0] + 22, SILL[1] + 46], [976, -14, 1024, 38]];

  // ------------------------------------------------------------------ geometry of the road
  PC.forEach((pc) => {
    pc.pts = []; for (let i = 0; i < pc.p.length; i += 2) pc.pts.push([pc.p[i], pc.p[i + 1]]);
    pc.s = [0]; for (let i = 1; i < pc.pts.length; i++) pc.s.push(pc.s[i - 1] + Math.hypot(pc.pts[i][0] - pc.pts[i - 1][0], pc.pts[i][1] - pc.pts[i - 1][1]));
    pc.len = pc.s[pc.s.length - 1];
    pc.path = new Path2D(); pc.path.moveTo(pc.pts[0][0], pc.pts[0][1]); for (let i = 1; i < pc.pts.length; i++) pc.path.lineTo(pc.pts[i][0], pc.pts[i][1]);
  });
  const legs = D.legs.map((leg) => {
    const pts = []; // [x, y, kind]
    for (const [idx, dir] of leg.via) {
      const pc = PC[idx], src = dir > 0 ? pc.pts : pc.pts.slice().reverse();
      for (const p of src) { const l = pts[pts.length - 1]; if (l && Math.hypot(l[0] - p[0], l[1] - p[1]) < 0.01) continue; pts.push([p[0], p[1], pc.k]); }
    }
    const s = [0];
    for (let i = 1; i < pts.length; i++) s.push(s[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of pts) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
    return { to: leg.to, pts, s, len: s[s.length - 1], box: [x0, y0, x1, y1], via: leg.via };
  });
  const pointOnLeg = (leg, d) => {
    const s = leg.s; let lo = 0, hi = s.length - 1;
    d = clamp(d, 0, leg.len);
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (s[m] <= d) lo = m; else hi = m; }
    const t = s[hi] > s[lo] ? (d - s[lo]) / (s[hi] - s[lo]) : 0, a = leg.pts[lo], b = leg.pts[hi];
    return { x: lerp(a[0], b[0], t), y: lerp(a[1], b[1], t), i: lo, kind: b[2] };
  };
  const pointOnPiece = (pc, d) => {
    let j = 0; while (j < pc.pts.length - 2 && pc.s[j + 1] < d) j++;
    const t = (d - pc.s[j]) / (pc.s[j + 1] - pc.s[j] || 1), a = pc.pts[j], b = pc.pts[j + 1];
    return { x: lerp(a[0], b[0], t), y: lerp(a[1], b[1], t), ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
  };
  // where a sea piece crosses the line y: the Long Coast's two ticks at the Fold's pleats
  const crossing = (id, y) => { const pc = PC.find((q) => q.id === id); if (!pc) return null; for (let i = 1; i < pc.pts.length; i++) { const a = pc.pts[i - 1], b = pc.pts[i]; if ((a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1]) return lerp(a[0], b[0], (y - a[1]) / (b[1] - a[1])); } return null; };
  const FOLD_TICKS = [D.fold.y0, D.fold.y1].map((y) => [crossing('longCoast', y), y]).filter((q) => q[0] != null);
  // a piece sailed both ways by the legs owned so far is an out-and-back: one line, one return mark
  const bothWays = (i) => { let f = false, b = false; for (const l of D.legs) { if (l.to > S.owned) break; for (const v of l.via) if (v[0] === i) { if (v[1] > 0) f = true; else b = true; } } return f && b; };

  // ------------------------------------------------------------------ assets
  const whenImg = (img) => (img.decode ? img.decode().catch(() => {}) : new Promise((res) => { if (img.complete) res(); else img.onload = img.onerror = res; }));
  async function loadAssets() {
    const world = $('imgWorld'), paper = $('imgPaper'), masks = $('imgMasks');
    await Promise.all([whenImg(world), whenImg(paper), whenImg(masks)]);
    // two smaller copies of the world, so zoomed-out views are resampled cleanly
    const half = (src, w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, w, h); return c; };
    const m1 = half(world, Math.round(D.world.w / 2), Math.round(D.world.h / 2));
    const m2 = half(m1, Math.round(D.world.w / 4), Math.round(D.world.h / 4));
    S.world = [{ img: world, bs: D.world.bs }, { img: m1, bs: D.world.bs / 2 }, { img: m2, bs: D.world.bs / 4 }];
    S.paper = paper;
    // the sixteen sheets and the veil over the never-charted land: grey tiles in one atlas, turned into alpha
    const M = D.masks, atlas = document.createElement('canvas');
    atlas.width = M.tw * M.cols; atlas.height = M.th * M.rows;
    const ax = atlas.getContext('2d'); ax.drawImage(masks, 0, 0);
    for (let k = 0; k < 17; k++) {
      const id = ax.getImageData((k % M.cols) * M.tw, Math.floor(k / M.cols) * M.th, M.tw, M.th), d = id.data;
      for (let i = 0; i < d.length; i += 4) { d[i + 3] = d[i]; d[i] = d[i + 1] = d[i + 2] = 255; }
      const t = document.createElement('canvas'); t.width = M.tw; t.height = M.th; t.getContext('2d').putImageData(id, 0, 0);
      S.tiles.push(t);
    }
    maskCv.width = M.tw; maskCv.height = M.th;
    S.ready = true;
    $('loading').classList.add('is-done');
    buildMask(); invalidate();
  }
  const now = () => performance.now();
  function buildMask() {
    if (!S.ready) return;
    mctx.globalCompositeOperation = 'source-over'; mctx.globalAlpha = 1;
    mctx.clearRect(0, 0, maskCv.width, maskCv.height);
    const rv = S.reveal;
    for (let k = 0; k < S.owned; k++) {
      mctx.globalAlpha = rv && rv.sheet === k + 1 ? ease(clamp((now() - rv.t0) / rv.ms, 0, 1)) : 1;
      mctx.drawImage(S.tiles[k], 0, 0);
    }
    mctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------------ the view
  const sx = (x) => (x - S.view.x) * S.view.k + S.vw / 2, sy = (y) => (y - S.view.y) * S.view.k + S.vh / 2;
  const cxOf = (px) => (px - S.vw / 2) / S.view.k + S.view.x, cyOf = (py) => (py - S.vh / 2) / S.view.k + S.view.y;
  const maxK = 7;
  function fitView(box, pad, capK) {
    const bw = Math.max(20, box[2] - box[0]), bh = Math.max(20, box[3] - box[1]);
    const padPx = pad == null ? 28 : pad;
    // leave room for the card on narrow screens
    const cardH = !$('card').hidden && S.vw < 700 ? Math.min($('card').offsetHeight, S.vh * 0.5) : 0;
    const k = Math.min((S.vw - padPx * 2) / bw, (S.vh - cardH - padPx * 2) / bh, capK || 99);
    return { x: (box[0] + box[2]) / 2, y: (box[1] + box[3]) / 2 + cardH / 2 / k, k: clamp(k, S.fitK, maxK) };
  }
  const sheetBox = () => [SH.x0, SH.y0, SH.x0 + SH.w, SH.y0 + SH.h];
  const homeView = () => fitView(sheetBox(), 5);
  function ownedBox() {
    let b = [1e9, 1e9, -1e9, -1e9];
    for (let k = 0; k < S.owned; k++) { const q = D.sheetBox[k]; b = [Math.min(b[0], q[0]), Math.min(b[1], q[1]), Math.max(b[2], q[2]), Math.max(b[3], q[3])]; }
    return [Math.max(b[0], WIN[0]), Math.max(b[1], WIN[1] - 30), Math.min(b[2], WIN[2]), Math.min(b[3], WIN[3])];
  }
  function flyTo(v, ms) {
    v.k = clamp(v.k, S.fitK, maxK);
    if (reduced || !ms) { S.view = v; S.tween = null; invalidate(); return; }
    S.tween = { from: { ...S.view }, to: v, t0: now(), ms };
    invalidate();
  }
  function resize() {
    const r = chartEl.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    const first = !S.vw;
    S.vw = r.width; S.vh = r.height; S.dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(S.vw * S.dpr); cv.height = Math.round(S.vh * S.dpr);
    off.width = cv.width; off.height = cv.height;
    S.fitK = Math.min((S.vw - 10) / SH.w, (S.vh - 10) / SH.h);
    if (first || !S.userMoved) S.view = homeView();
    else S.view.k = clamp(S.view.k, S.fitK, maxK);
    invalidate();
  }

  // ------------------------------------------------------------------ drawing
  let raf = 0;
  function invalidate() { if (!raf) raf = requestAnimationFrame(frame); }
  function frame(t) {
    raf = 0;
    let again = false;
    if (S.tween) {
      const q = clamp((t - S.tween.t0) / S.tween.ms, 0, 1), e = ease(q), a = S.tween.from, b = S.tween.to;
      // zoom in log space so a long flight feels even
      S.view = { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), k: Math.exp(lerp(Math.log(a.k), Math.log(b.k), e)) };
      if (q >= 1) S.tween = null; else again = true;
    }
    if (S.reveal) { if (t - S.reveal.t0 >= S.reveal.ms) S.reveal = null; else again = true; buildMask(); }
    if (S.journey && stepJourney(t)) again = true;
    if (S.raft && !reduced) again = true; // the Wick's flame keeps moving
    draw(t);
    if (again) invalidate();
  }
  function pickWorld() {
    const need = S.view.k * S.dpr;
    for (let i = S.world.length - 1; i >= 0; i--) if (S.world[i].bs >= need * 0.92) return S.world[i].img;
    return S.world[0].img;
  }
  const chartSpace = () => { const k = S.view.k, d = S.dpr; ctx.setTransform(d * k, 0, 0, d * k, d * (S.vw / 2 - S.view.x * k), d * (S.vh / 2 - S.view.y * k)); };
  const screenSpace = () => ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
  const inked = () => S.mode === 'world';
  // a name shows when its sheet is owned; the never-charted names (sheet 99) only in the design view
  const shown = (sheet) => inked() || (sheet > 0 && sheet <= S.owned);
  const shadowCol = () => getComputedStyle(document.documentElement).getPropertyValue('--sheet-shadow').trim() || 'rgba(0,0,0,.6)';

  function draw(t) {
    const { vw, vh, dpr } = S, k = S.view.k;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, vw, vh);
    if (!S.ready) return;
    const px = sx(SH.x0), py = sy(SH.y0), pw = SH.w * k, ph = SH.h * k;
    ctx.save();
    ctx.shadowColor = shadowCol(); ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#ddd7e2'; ctx.fillRect(px, py, pw, ph);
    ctx.restore();
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(S.paper, px, py, pw, ph);
    const src = pickWorld();
    const through = (image, tile, alpha) => { // draw `image` only where `tile` lets it through
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      octx.globalCompositeOperation = 'source-over';
      octx.clearRect(0, 0, vw, vh);
      octx.imageSmoothingEnabled = true; octx.imageSmoothingQuality = 'high';
      octx.drawImage(image, px, py, pw, ph);
      octx.globalCompositeOperation = 'destination-in';
      octx.drawImage(tile, px, py, pw, ph);
      ctx.globalAlpha = alpha; ctx.drawImage(off, 0, 0, vw, vh); ctx.globalAlpha = 1;
    };
    if (inked()) ctx.drawImage(src, px, py, pw, ph);
    else if (S.owned >= 16 && !S.reveal) { ctx.drawImage(src, px, py, pw, ph); through(S.paper, S.tiles[16], 0.6); } // the whole road; the east stays faint
    else through(src, maskCv, 1);
    S.marks = layoutMarks();
    drawSheetEdge();
    drawFrame();
    drawRoad();
    drawVignettes();
    drawLamps(t);
    drawLabels();
    drawRaft(t);
    drawLocator();
  }

  // ---- where the charted country stops: a feathered ink edge and a thin rim of mist
  function drawSheetEdge() {
    if (inked() || S.reveal) return;
    const lines = D.edges[S.owned - 1]; if (!lines) return;
    const whole = S.owned >= 16; // then the only edge left is where the charted land meets the never-charted
    chartSpace();
    const k = S.view.k, p = new Path2D();
    for (const a of lines) { p.moveTo(a[0], a[1]); for (let i = 2; i < a.length; i += 2) p.lineTo(a[i], a[i + 1]); }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (!whole) { ctx.strokeStyle = 'rgba(190,180,240,.3)'; ctx.lineWidth = 7 / k + 2.5; ctx.stroke(p); }
    ctx.strokeStyle = `rgba(${C.ink},.5)`; ctx.lineWidth = 0.9 / k; ctx.setLineDash([7 / k, 2.2 / k, 1.2 / k, 2.2 / k]); ctx.stroke(p); ctx.setLineDash([]);
  }

  // ---- the road: the water first, then a fine amber line inside it
  function drawRoad() {
    const k = S.view.k;
    chartSpace();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const aw = clamp(1.2 + 0.3 * Math.log2(k / 0.6 + 0.001), 1.15, 2.3); // the amber line, in screen px
    const casing = 1 - sstep(1.7, 3.4, k);
    const own = [], rest = [];
    PC.forEach((pc, i) => { if (pc.leg <= S.owned) own.push(i); else if (inked()) rest.push(i); });
    // the design view shows the road still to come, faintly
    if (rest.length) {
      ctx.strokeStyle = `rgba(${C.amber},.42)`; ctx.lineWidth = 1.2 / k; ctx.setLineDash([0.1 / k, 4.5 / k]);
      for (const i of rest) ctx.stroke(PC[i].path);
      ctx.setLineDash([]);
    }
    // 1. water under every river and canal leg, so the road is never the only sign of it
    if (casing > 0.01) {
      ctx.strokeStyle = `rgba(${C.water},${0.92 * casing})`; ctx.lineWidth = (aw + 2.5) / k;
      for (const i of own) { const pc = PC[i]; if ((pc.k === 'river' || pc.k === 'canal' || pc.k === 'haul') && !pc.wide) ctx.stroke(pc.path); }
      ctx.strokeStyle = `rgba(${C.pale},${0.55 * casing})`; ctx.lineWidth = (aw + 1.1) / k;
      for (const i of own) { const pc = PC[i]; if (pc.k === 'canal') ctx.stroke(pc.path); }
    }
    // 2. the amber line: solid on rivers, canals and lakes, hatched steps on the haul-way, dotted at sea
    for (const i of own) {
      const pc = PC[i];
      if (pc.k === 'sea') {
        ctx.setLineDash([0.1 / k, (aw * 3.1) / k]); ctx.lineWidth = (aw * 1.45) / k;
        ctx.strokeStyle = 'rgba(40,24,30,.5)'; ctx.lineWidth = (aw * 1.45 + 1.1) / k; ctx.stroke(pc.path);
        ctx.strokeStyle = AMBER; ctx.lineWidth = (aw * 1.45) / k; ctx.stroke(pc.path); ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = 'rgba(40,24,30,.55)'; ctx.lineWidth = (aw + 1.0) / k; ctx.stroke(pc.path);
        ctx.strokeStyle = AMBER; ctx.lineWidth = aw / k; ctx.stroke(pc.path);
        if (pc.k === 'haul') { // the lock stair: small hatched steps across the line
          ctx.lineCap = 'butt'; ctx.setLineDash([1.1 / k, 3.2 / k]); ctx.strokeStyle = `rgba(${C.ink},.9)`; ctx.lineWidth = (aw + 5) / k; ctx.stroke(pc.path); ctx.setLineDash([]); ctx.lineCap = 'round';
        }
      }
    }
    // 3. which way the water runs, and the return mark on an out-and-back
    screenSpace();
    for (const i of own) {
      const pc = PC[i], Lpx = pc.len * k;
      if (pc.flow && Lpx > 26) {
        const n = Math.max(1, Math.floor(Lpx / 58));
        for (let q = 0; q < n; q++) { const p = pointOnPiece(pc, pc.len * ((q + 0.62) / n)); chevron(sx(p.x), sy(p.y), p.ang, aw * 2.3 + 1.4); }
      }
      if (Lpx > 30 && pc.k !== 'sea' && bothWays(i)) { const p = pointOnPiece(pc, pc.len * (Lpx > 54 ? 0.3 : 0.5)); returnMark(sx(p.x), sy(p.y), p.ang, Lpx > 54 ? aw * 2.2 + 2.2 : aw * 1.7 + 1.6); }
    }
    // where the owned road runs on into a water not yet bought: a small wisp, no name and no shape
    const j = S.journey;
    if (!inked() && S.owned < 16 && D.wisps[S.owned - 1] && !(j && j.phase !== 'done')) {
      const w = D.wisps[S.owned - 1];
      const x = sx(w[0]), y = sy(w[1]), r = clamp(11 * Math.sqrt(k), 10, 24);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(214,204,250,.95)'); g.addColorStop(0.5, 'rgba(200,190,244,.6)'); g.addColorStop(1, 'rgba(196,186,240,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r * 1.5, r, 0, 0, 6.3); ctx.fill();
      ctx.strokeStyle = 'rgba(116,104,176,.7)'; ctx.lineWidth = 1; ctx.lineCap = 'round';
      for (const [dx, dy, s] of [[-0.5, -0.25, 0.5], [0.25, 0.05, 0.62], [-0.2, 0.36, 0.42]]) { ctx.beginPath(); ctx.moveTo(x + (dx - s) * r, y + dy * r); ctx.bezierCurveTo(x + (dx - s * 0.4) * r, y + (dy - 0.22) * r, x + (dx + s * 0.4) * r, y + (dy + 0.22) * r, x + (dx + s) * r, y + dy * r); ctx.stroke(); }
    }
  }
  function chevron(x, y, ang, s) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(-s * 0.45, -s * 0.62); ctx.lineTo(s * 0.5, 0); ctx.lineTo(-s * 0.45, s * 0.62);
    ctx.lineJoin = 'miter'; ctx.strokeStyle = `rgba(${C.paper},.9)`; ctx.lineWidth = 2.6; ctx.stroke();
    ctx.strokeStyle = `rgb(${C.ink})`; ctx.lineWidth = 1.15; ctx.stroke();
    ctx.restore();
  }
  function returnMark(x, y, ang, s) { // two small arrows, out and back, set beside the line
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.translate(0, -s * 1.5);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (const pass of [0, 1]) {
      ctx.beginPath();
      ctx.moveTo(-s, -s * 0.3); ctx.lineTo(s, -s * 0.3); ctx.lineTo(s * 0.5, -s * 0.75);
      ctx.moveTo(s, s * 0.3); ctx.lineTo(-s, s * 0.3); ctx.lineTo(-s * 0.5, s * 0.75);
      if (!pass) { ctx.strokeStyle = `rgba(${C.paper},.9)`; ctx.lineWidth = 2.8; } else { ctx.strokeStyle = 'rgb(150,84,14)'; ctx.lineWidth = 1.15; }
      ctx.stroke();
    }
    ctx.restore();
  }

  // ------------------------------------------------------------------ marks: a lamp and a landmark vignette for each water
  // Laid out afresh each frame, in screen px. A vignette stands at its landmark's true place; where
  // that would crowd its own lamp or a neighbour (zoomed out), it steps aside.
  function layoutMarks() {
    const k = S.view.k;
    const lampU = clamp(4.6 + 1.5 * Math.log2(k / S.fitK + 1), 5.2, 9.5);
    const small = S.vw < 700, vs = clamp(k * 13, small ? 13 : 18, 68);
    const list = [{ n: 0, at: HOME.at, vg: HOME.vg, name: 'The Landing', owned: true }];
    for (const w of W) if (w.n <= S.owned || inked()) list.push({ n: w.n, at: w.at, vg: w.vg, name: w.name, owned: w.n <= S.owned, act: w.act });
    for (const m of list) {
      m.lx = sx(m.at[0]); m.ly = sy(m.at[1]); m.u = lampU; m.vs = vs;
      let vx = sx(m.vg[0]), vy = sy(m.vg[1]);
      const need = vs * 0.56 + lampU * 1.2;
      let dx = vx - m.lx, dy = vy - m.ly; const d = Math.hypot(dx, dy);
      if (d < need) { if (d < 0.01) { dx = 0; dy = -1; } else { dx /= d; dy /= d; } vx = m.lx + dx * need; vy = m.ly + dy * need; }
      m.vx = vx; m.vy = vy;
    }
    // neighbours' vignettes part a little; lamps keep their place
    for (let it = 0; it < 4; it++) for (let a = 0; a < list.length; a++) for (let b = a + 1; b < list.length; b++) {
      const A = list[a], B = list[b], dx = B.vx - A.vx, dy = B.vy - A.vy, d = Math.hypot(dx, dy), need = vs * 1.02;
      if (d < need && d > 0.01) { const push = (need - d) / 2; A.vx -= (dx / d) * push; A.vy -= (dy / d) * push; B.vx += (dx / d) * push; B.vy += (dy / d) * push; }
    }
    for (const A of list) for (const B of list) {
      const dx = A.vx - B.lx, dy = A.vy - B.ly, d = Math.hypot(dx, dy), need = vs * 0.5 + lampU;
      if (d < need && d > 0.01) { A.vx = B.lx + (dx / d) * need; A.vy = B.ly + (dy / d) * need; }
    }
    return list;
  }

  // ---- lamps: each its own small lantern, a flame-shaped point of amber and a soft glow. Never a ring.
  function lantern(x, y, u, lit, strong) {
    if (lit) {
      const gr = u * (strong ? 4.6 : 3.1), g = ctx.createRadialGradient(x, y - u * 0.3, 0, x, y - u * 0.3, gr);
      g.addColorStop(0, `rgba(${C.flame},${strong ? 0.8 : 0.62})`); g.addColorStop(0.3, `rgba(${C.amber},.26)`); g.addColorStop(1, `rgba(${C.amber},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - u * 0.3, gr, 0, 6.3); ctx.fill();
    }
    // the hook and the cap
    ctx.strokeStyle = INK; ctx.lineWidth = Math.max(0.9, u * 0.16); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y - u * 1.72, u * 0.32, Math.PI * 0.9, Math.PI * 2.1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - u * 0.62, y - u * 1.28); ctx.lineTo(x + u * 0.62, y - u * 1.28); ctx.stroke();
    // the flame
    const fl = () => { ctx.beginPath(); ctx.moveTo(x, y - u * 1.16); ctx.bezierCurveTo(x + u * 0.85, y - u * 0.3, x + u * 0.62, y + u * 0.62, x, y + u * 0.62); ctx.bezierCurveTo(x - u * 0.62, y + u * 0.62, x - u * 0.85, y - u * 0.3, x, y - u * 1.16); };
    fl();
    if (lit) { ctx.fillStyle = AMBER; ctx.fill(); ctx.strokeStyle = 'rgba(96,44,10,.85)'; ctx.lineWidth = Math.max(0.7, u * 0.11); ctx.stroke(); ctx.fillStyle = 'rgba(255,244,214,.95)'; ctx.beginPath(); ctx.ellipse(x, y + u * 0.12, u * 0.24, u * 0.36, 0, 0, 6.3); ctx.fill(); }
    else { ctx.fillStyle = `rgba(${C.paper},.85)`; ctx.fill(); ctx.strokeStyle = `rgba(${C.ink},.7)`; ctx.lineWidth = Math.max(0.8, u * 0.13); ctx.stroke(); }
    ctx.strokeStyle = INK; ctx.lineWidth = Math.max(0.9, u * 0.16);
    ctx.beginPath(); ctx.moveTo(x - u * 0.5, y + u * 0.84); ctx.lineTo(x + u * 0.5, y + u * 0.84); ctx.stroke();
  }
  function drawLamps() {
    screenSpace();
    for (const m of S.marks) {
      if (m.lx < -40 || m.ly < -40 || m.lx > S.vw + 40 || m.ly > S.vh + 40) continue;
      if (m.n === 0) { hearth(m.lx, m.ly, m.u * 1.15, S.hearthFull); continue; }
      lantern(m.lx, m.ly, m.u * (S.sel === m.n ? 1.18 : 1), m.owned, S.sel === m.n);
    }
  }
  // home: the Landing's hearth, the warmest point on the sheet; banked low until the road comes home
  function hearth(x, y, u, full) {
    const gr = u * (full ? 6.5 : 3.8), g = ctx.createRadialGradient(x, y, 0, x, y, gr);
    g.addColorStop(0, `rgba(255,214,150,${full ? 0.95 : 0.78})`); g.addColorStop(0.3, `rgba(250,170,70,${full ? 0.42 : 0.3})`); g.addColorStop(1, 'rgba(250,170,70,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, gr, 0, 6.3); ctx.fill();
    const f = full ? 1.5 : 1;
    ctx.beginPath(); ctx.moveTo(x, y - u * 1.5 * f); ctx.bezierCurveTo(x + u * 1.0 * f, y - u * 0.4, x + u * 0.8, y + u * 0.6, x, y + u * 0.6); ctx.bezierCurveTo(x - u * 0.8, y + u * 0.6, x - u * 1.0 * f, y - u * 0.4, x, y - u * 1.5 * f);
    ctx.fillStyle = full ? 'rgb(252,190,92)' : 'rgb(246,168,70)'; ctx.fill(); ctx.strokeStyle = 'rgba(96,44,10,.85)'; ctx.lineWidth = Math.max(0.7, u * 0.11); ctx.stroke();
    ctx.fillStyle = 'rgba(255,246,220,.95)'; ctx.beginPath(); ctx.ellipse(x, y + u * 0.05, u * 0.3 * f, u * 0.44 * f, 0, 0, 6.3); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1, u * 0.2); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - u * 1.1, y + u * 0.86); ctx.lineTo(x + u * 1.1, y + u * 0.86); ctx.stroke();
  }

  // ---- landmark vignettes (WORLD.md §10): one small ink drawing for each water, drawn in a 20-unit box
  const vg = { halo: false, u: 1 };
  // the foliage track of WATERS.md: olive at step 1, deep green at step 15
  const LEAF = (st) => {
    const hue = 84 + 2.9 * st, cap = Math.min(0.62, 0.25 + 0.04 * st), sat = Math.min(cap - 0.04, 0.24 + 0.02 * st), val = 0.43 + 0.01 * st;
    const f = (n) => { const q = (n + hue / 60) % 6; return Math.round(255 * (val - val * sat * Math.max(0, Math.min(q, 4 - q, 1)))); };
    return `rgb(${f(5)},${f(3)},${f(1)})`;
  };
  // P: one inked shape. In the halo pass it is only a vellum outline, so every mark reads on sea and forest alike.
  function P(build, fill, lw, stroke) {
    ctx.beginPath(); build();
    const w = Math.max((lw || 1) * 0.7, 0.95 / vg.u); // local units: never thinner than a pixel on screen
    if (vg.halo) { ctx.strokeStyle = `rgba(${C.paper},.86)`; ctx.lineWidth = w + 2.4 / vg.u; ctx.stroke(); return; }
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke !== null) { ctx.strokeStyle = stroke || INK; ctx.lineWidth = w; ctx.stroke(); }
  }
  const dot = (x, y, r, col) => { if (vg.halo) return; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.3); ctx.fillStyle = col || AMBER; ctx.fill(); };
  const rect = (x, y, w, h) => () => ctx.rect(x, y, w, h);
  const poly = (pts, close) => () => { ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); if (close !== false) ctx.closePath(); };
  const wave = (x0, x1, y, amp) => () => { ctx.moveTo(x0, y); for (let x = x0; x < x1; x += 3) ctx.quadraticCurveTo(x + 0.75, y - (amp || 0.9), x + 1.5, y), ctx.quadraticCurveTo(x + 2.25, y + (amp || 0.9), Math.min(x1, x + 3), y); };
  const VIGNETTES = [
    function landing() { // the cove arch, the hearth, and Murk's lily-pad barge with his towering pack and green lamp
      P(rect(-9.2, -2, 1.9, 8.4), STONE); P(rect(-3.2, 0.5, 1.9, 5.9), STONE);
      P(() => { ctx.arc(-5.3, -2, 3.9, Math.PI, Math.PI * 1.42); }, null, 1.5); P(() => { ctx.arc(-5.3, -2, 3.9, Math.PI * 1.62, Math.PI * 1.9); }, null, 1.5);
      if (!vg.halo) { ctx.beginPath(); ctx.moveTo(-5.3, 1.6); ctx.bezierCurveTo(-3.9, 3.6, -4.2, 5.8, -5.3, 5.8); ctx.bezierCurveTo(-6.4, 5.8, -6.7, 3.6, -5.3, 1.6); ctx.fillStyle = AMBER; ctx.fill(); }
      P(() => ctx.ellipse(4.6, 6.6, 5.2, 1.5, 0, 0, 6.3), 'rgb(116,132,100)');
      P(() => { ctx.moveTo(1.2, 6.1); ctx.quadraticCurveTo(0.4, 3.2, 2.6, 3.2); ctx.quadraticCurveTo(4.4, 3.4, 4.2, 6.1); ctx.closePath(); }, 'rgb(116,92,76)'); // the old toad
      P(poly([4.4, 6, 4.1, -5.6, 5.6, -7.2, 7.4, -5.6, 7.3, 6]), 'rgb(196,176,150)'); // his pack
      P(poly([4.2, -2, 7.4, -2], false), null, 0.8); P(poly([4.3, 2, 7.3, 2], false), null, 0.8);
      P(poly([5.7, -7.2, 6.6, -9.6, 8.4, -8.2], false), null, 0.8);
      P(poly([8.6, 6.2, 9.2, 0.4], false), null, 0.8); dot(9.3, -0.4, 1.05, `rgb(${C.sage})`);
    },
    function mossmere() { // the Sunken Gate's towers, the Toppled Bridge and its hanging chain
      P(rect(-7.6, -7, 3, 11.4), STONE); P(rect(4.6, -7, 3, 11.4), STONE);
      P(poly([-8.2, -7, -4, -7], false), null, 1.5); P(poly([4, -7, 8.2, -7], false), null, 1.5);
      P(() => { ctx.moveTo(-4.6, 4.4); ctx.lineTo(-4.6, -0.6); ctx.arc(0, -0.6, 4.6, Math.PI, 0); ctx.lineTo(4.6, 4.4); }, null, 1.3);
      dot(-6.1, -3.6, 0.7); dot(6.1, -1.4, 0.7); dot(-6.1, 0.6, 0.6);
      P(poly([-9.6, 7.4, -1.6, 7.4], false), null, 1.9); P(poly([2.6, 8.6, 9.4, 7.2], false), null, 1.9);
      P(poly([-1.6, 7.4, -1.6, 8.3, -1.2, 9, -1.6, 9.8], false), null, 0.7);
    },
    function sporewood() { // three giant mushroom caps
      const cap = (x, y, rx, ry, base, col) => { P(poly([x, y, x + 0.3, base], false), null, 1.4); P(() => { ctx.ellipse(x, y, rx, ry, 0, Math.PI, 0); ctx.closePath(); }, col); };
      cap(-6.2, 1.2, 3.3, 2.1, 7, '#c79ab8'); cap(6.2, -0.4, 3.7, 2.3, 7, '#d6a4ba'); cap(0, -3.4, 5.6, 3.4, 7, '#b98cc0');
      P(poly([-9, 7, 9, 7], false), null, 0.8);
    },
    function glasswater() { // crystal monoliths and the fallen chandelier
      P(poly([-5.2, 6, -6.4, -3, -4.6, -6.4, -2.9, -3, -3.4, 6]), '#d5dafb'); P(poly([5, 6, 4, -1, 5.7, -4.4, 7.3, -1, 6.7, 6]), '#d5dafb');
      P(poly([-0.9, 6, -1.9, -5, 0.2, -9.4, 2.2, -5, 1.4, 6]), '#e2e5fd'); P(poly([0.2, -9.4, 0.2, 6], false), null, 0.6);
      P(() => ctx.arc(-0.2, 7, 3.4, 0.15, Math.PI - 0.15), null, 0.9); dot(-2.7, 8.6, 0.6); dot(-0.2, 9.9, 0.7); dot(2.4, 8.6, 0.6);
    },
    function pallid() { // the bone-white ribs and the two Kneeling statues with their dark lantern
      const rib = (x, h, lean) => { P(() => { ctx.moveTo(x, 6); ctx.quadraticCurveTo(x - 1.4, -h * 0.55, x + lean, -h); }, null, 2.6); if (!vg.halo) { ctx.beginPath(); ctx.moveTo(x, 6); ctx.quadraticCurveTo(x - 1.4, -h * 0.55, x + lean, -h); ctx.strokeStyle = '#f6f3fa'; ctx.lineWidth = 0.95; ctx.stroke(); } };
      rib(-8, 4.5, 2.6); rib(-4.8, 8.4, 3.4); rib(-1.4, 6.4, 3); rib(1.6, 3, 2);
      P(poly([3.6, 6.4, 3.8, 3.4, 5, 2.2, 5.8, 3.6, 5.6, 6.4]), STONE); P(poly([8.2, 6.4, 8, 3.4, 6.9, 2.2, 6.2, 3.6, 6.4, 6.4].map((v, i) => (i % 2 ? v : v + 1.4))), STONE);
      P(poly([6.6, 3.4, 7.3, 4.3, 6.6, 5.2, 5.9, 4.3]), 'rgb(52,42,62)', 0.7);
      P(wave(-9.5, 9.6, 6.6, 0.5), null, 0.7);
    },
    function rime() { // the glacier front, floe ice and the lantern by the one hole
      P(poly([-9.4, 1.6, -9.4, -2.6, -6, -6.4, -1.6, -7.4, 2.4, -5.2, 4.6, -1.8, 4.6, 1.6]), '#f7f7fd');
      P(poly([-6.5, 1.6, -6.2, -1.2], false), null, 0.7); P(poly([-3.2, 1.6, -3.4, -2.4], false), null, 0.7); P(poly([0, 1.6, 0.3, -1.6], false), null, 0.7); P(poly([2.6, 1.6, 2.5, -0.6], false), null, 0.7);
      P(poly([-8.4, 5, -5.6, 3.9, -4.2, 5.4, -7, 6.6]), '#f7f7fd', 0.8); P(poly([5.4, 4.4, 8.6, 4.8, 8, 6.8, 5, 6.2]), '#f7f7fd', 0.8);
      P(poly([-3.2, 7.4, 3.6, 7, 4.2, 9.2, -2.6, 9.6]), '#f7f7fd', 0.8);
      P(() => ctx.ellipse(0, 8.3, 1.3, 0.55, 0, 0, 6.3), 'rgb(44,40,90)', 0.6); dot(2.3, 7.5, 0.85);
    },
    function thin() { // the broken weir under its sluice lamp
      P(rect(-9.4, 0.6, 6.4, 2.4), STONE); P(rect(2.4, 0.6, 7, 2.4), STONE);
      P(poly([-2.4, 1, -1.9, 2.6, -1.2, 3.4], false), null, 0.9); P(poly([1.4, 1.2, 0.8, 2.8], false), null, 0.9);
      for (const x of [-1.6, 0, 1.4]) P(() => { ctx.moveTo(x, 4); ctx.quadraticCurveTo(x + 0.7, 5.6, x - 0.2, 7.4); }, null, 0.7, `rgb(${C.water})`);
      P(wave(-8, 8, 8.8, 0.6), null, 0.7, `rgb(${C.water})`);
      P(poly([-6.6, 0.6, -6.6, -5.2], false), null, 1.1); P(poly([-7.6, -5.2, -5.6, -5.2], false), null, 1.1); dot(-6.6, -6.6, 1.1);
    },
    function lastLight() { // the lighthouse on the Lamp Rock, its beam drawn as two fine rays
      if (!vg.halo) { ctx.beginPath(); ctx.moveTo(1.2, -8); ctx.lineTo(9.6, -10.4); ctx.moveTo(1.2, -7.6); ctx.lineTo(9.6, -5.6); ctx.strokeStyle = `rgb(${C.flame})`; ctx.lineWidth = 0.6; ctx.stroke(); }
      P(poly([-7.4, 7, -5.2, 2.8, -2, 1, 2.8, 1.6, 5.4, 4, 7.2, 7]), 'rgb(176,166,178)');
      P(poly([-1.8, 1.4, -1.1, -6.6, 1.1, -6.6, 1.8, 1.4]), STONE); P(poly([-1.5, -2.6, 1.5, -2.6], false), null, 0.7);
      P(rect(-1.5, -9, 3, 2.4), STONE, 0.9); P(poly([-1.9, -9, 0, -10.6, 1.9, -9], false), null, 0.9); dot(0, -7.8, 0.9);
      P(wave(-9.4, 9.4, 8, 0.6), null, 0.7, `rgb(${C.pale})`);
    },
    function pyrefall() { // the temple stairs into the river and the snow peaks behind
      P(poly([-9.6, 1.4, -4.6, -8.4, -0.4, 1.4]), STONE); P(poly([-1.6, 1.4, 4, -6.2, 9.6, 1.4]), STONE);
      P(poly([-6.3, -5, -5.2, -4, -4.4, -5.2, -3.4, -4], false), null, 0.7); P(poly([2.6, -4.2, 3.6, -3.2, 4.6, -4.4, 5.6, -3.4], false), null, 0.7);
      for (let i = 0; i < 4; i++) P(poly([-5.4 + i * 0.9, 2.6 + i * 1.6, 5.4 - i * 0.9, 2.6 + i * 1.6], false), null, 1.1);
      dot(-3.4, 1.9, 0.75); dot(2.6, 3.5, 0.75); dot(-1.2, 5.1, 0.75); dot(1.4, 6.7, 0.7);
      P(wave(-7, 7, 9.2, 0.6), null, 0.7, `rgb(${C.water})`);
    },
    function reef() { // the spire and chimneys of the drowned town above the reef, the wreck on the drop-off
      P(poly([-5.2, 1, -3.8, -9.4, -2.4, 1]), STONE); P(rect(0.6, -3.4, 1.8, 4.4), STONE); P(rect(4.6, -1.8, 1.8, 2.8), STONE);
      P(poly([-2.4, -1, 0.6, -2.4], false), null, 0.8); P(poly([2.4, -1.8, 4.6, -0.8], false), null, 0.8);
      P(wave(-9.4, 9.4, 1.2, 0.7), null, 0.8, vg.halo ? null : `rgb(${C.pale})`);
      P(() => { ctx.moveTo(-3.6, 5.2); ctx.quadraticCurveTo(1.4, 10.6, 7.6, 6.2); ctx.lineTo(6.2, 5); ctx.quadraticCurveTo(1.4, 7.4, -2.4, 4.2); ctx.closePath(); }, 'rgb(206,190,186)', 0.9);
      P(poly([1.6, 6.4, 3, 2.6], false), null, 0.9);
    },
    function stair() { // the broken lock stair between its two towers
      P(rect(-9.2, -8, 2.9, 12), STONE); P(rect(6.3, -2.6, 2.9, 10.6), STONE);
      P(poly([-9.8, -8, -5.7, -8], false), null, 1.4); P(poly([5.7, -2.6, 9.8, -2.6], false), null, 1.4); dot(-7.75, -9.6, 0.95); dot(7.75, -4.2, 0.95);
      P(poly([-6.3, -3, -3.6, -3, -3.6, -0.4, -0.9, -0.4, -0.9, 2.2, 0.6, 2.2], false), null, 1.4); P(poly([2.2, 3.4, 3.6, 3.4, 3.6, 5.6, 6.3, 5.6], false), null, 1.4);
      for (const [x, y] of [[-3.6, -0.2], [-0.9, 2.4], [1.4, 3.2], [3.6, 5.8]]) P(poly([x + 0.6, y + 0.4, x + 0.6, y + 2.2], false), null, 0.7, `rgb(${C.water})`);
    },
    function fen() { // the great dam on the Step's lip with its one lamp, papyrus behind
      const tuft = (x) => { for (const d of [-1.3, -0.4, 0.5, 1.4]) P(poly([x + d * 0.4, 1.6, x + d * 1.3, -4.6 - (d * d) * 0.4 + 1], false), null, 1, LEAF(10)); dot(x - 1.7, -4.2, 0.55); dot(x + 1.8, -4.4, 0.55); };
      tuft(-6.4); tuft(-2.4); tuft(5.6);
      P(poly([-9.6, 1.6, 9.6, 1.6, 8.4, 5.6, -8.4, 5.6]), STONE);
      for (const x of [-5.6, -1.9, 1.9, 5.6]) P(poly([x, 1.6, x, 5.6], false), null, 0.7);
      P(poly([1.8, 1.6, 1.8, -2.6], false), null, 1.1); dot(1.8, -3.8, 1.1);
      P(() => ctx.ellipse(0, 8, 5.4, 1.1, 0, 0, 6.3), 'rgb(44,38,70)', 0.6);
    },
    function saltGate() { // the two gate towers, left open, and the unfinished hulls on the slipway
      P(rect(-9.4, -6.6, 2.8, 12), STONE); P(rect(-3.4, -6.6, 2.8, 12), STONE);
      P(poly([-10, -6.6, -6, -6.6], false), null, 1.4); P(poly([-4, -6.6, 0, -6.6], false), null, 1.4);
      P(wave(-9.6, 1, 6.8, 0.6), null, 0.7, `rgb(${C.water})`);
      P(poly([1.2, 7, 9.8, 2.8], false), null, 1);
      const hull = (x, y) => { P(() => { ctx.moveTo(x - 2.6, y + 1.3); ctx.lineTo(x + 2.6, y - 1.3); }, null, 1.1); for (const t of [-0.8, -0.3, 0.2, 0.7]) P(() => { const px = x + t * 3, py = y - t * 1.5; ctx.moveTo(px - 1.1, py - 2.6); ctx.quadraticCurveTo(px - 1.4, py - 0.2, px, py); }, null, 0.8); };
      hull(4.2, 4.2); hull(7.4, 0.4);
    },
    function slough() { // the canal's lock gate under swamp trees
      P(() => { ctx.moveTo(-8.8, 6.4); ctx.quadraticCurveTo(-7.4, 2, -7.6, -2.4); ctx.lineTo(-6.4, -2.4); ctx.quadraticCurveTo(-6.4, 2, -5, 6.4); }, 'rgb(150,136,128)', 0.9);
      P(() => { ctx.ellipse(-3.4, -5.2, 6.8, 3.7, 0, 0, 6.3); }, LEAF(12));
      for (const x of [-7.8, -4.6, -1.4, 1.6]) P(poly([x, -2.2, x, 0.4 + ((x * 7) % 2)], false), null, 0.7, 'rgb(112,132,112)');
      P(rect(-3.2, 2, 1.7, 5.4), STONE); P(rect(7.2, 2, 1.7, 5.4), STONE);
      P(poly([-1.5, 3.2, 3.7, 5.6, 7.2, 3.2], false), null, 1.9);
      P(wave(-1.2, 7, 8, 0.5), null, 0.7, `rgb(${C.water})`);
    },
    function siltway() { // two mile-posts along the bank, and the sunk barge's mast at the great bend
      P(() => { ctx.moveTo(-9.6, 2.8); ctx.quadraticCurveTo(-3, 1.4, 2.6, 3.6); }, null, 1);
      const post = (x, y) => P(() => { ctx.moveTo(x - 1, y); ctx.lineTo(x - 1, y - 4.6); ctx.arc(x, y - 4.6, 1, Math.PI, 0); ctx.lineTo(x + 1, y); ctx.closePath(); }, '#f6f3fa');
      post(-7.2, 2.6); post(-2.4, 2.4);
      P(poly([4.2, 8, 6.9, -8.4], false), null, 1.4); P(poly([3.9, -4.2, 9, -3.2], false), null, 1.1); P(poly([6.9, -8.4, 9.2, -7.4, 7, -6.2], true), 'rgb(196,176,150)', 0.7);
      P(() => ctx.ellipse(4.3, 8, 3.2, 0.9, 0, 0, 6.3), null, 0.7, 'rgb(112,92,84)'); P(wave(-9, 0.6, 7.2, 0.5), null, 0.7, 'rgb(112,92,84)');
    },
    function lagoon() { // the stilt village with its lanterns, one of them green
      const hut = (x, y, w, h) => { for (const d of [0.14, 0.86]) P(poly([x + w * d, y + h, x + w * d, 7.6], false), null, 0.9); P(rect(x, y, w, h), STONE); P(poly([x - 0.9, y, x + w / 2, y - h * 1.05, x + w + 0.9, y]), 'rgb(196,176,150)'); };
      hut(-8.6, -2.8, 6, 3.8); hut(1.6, -0.6, 6, 3.4);
      P(poly([-2.6, -1.6, -1.2, -0.2], false), null, 0.6); dot(-1, 0.6, 0.85); P(poly([1.6, 0.6, 0.6, 1.8], false), null, 0.6); dot(0.5, 2.6, 0.8);
      P(poly([7.6, 0.6, 8.8, 1.8], false), null, 0.6); dot(9, 2.7, 0.95, `rgb(${C.sage})`);
      P(wave(-9.6, 9.6, 8, 0.6), null, 0.7, `rgb(${C.water})`);
    },
    function inkwood() { // the Kitchen Stair's hearth under the canopy, and the orchard rows' dikes
      const g = LEAF(15);
      P(() => { ctx.arc(-5.4, -4.4, 4.2, 0, 6.3); }, g); P(() => { ctx.arc(5.8, -4, 3.9, 0, 6.3); }, g); P(() => { ctx.arc(0.2, -6, 4.8, 0, 6.3); }, g);
      P(poly([-5.6, -0.2, -5.2, 6], false), null, 1.2); P(poly([5.8, -0.1, 5.4, 6], false), null, 1.2);
      P(poly([-2.6, 6, -2.6, 2.6, 0, 0.9, 2.6, 2.6, 2.6, 6]), STONE); P(() => { ctx.moveTo(-1.3, 6); ctx.lineTo(-1.3, 4.4); ctx.arc(0, 4.4, 1.3, Math.PI, 0); ctx.lineTo(1.3, 6); }, 'rgb(52,42,62)', 0.7); dot(0, 5.2, 0.55);
      for (const y of [7.6, 9.2]) P(poly([-9.2, y, 9.2, y + 0.2], false), null, 0.7);
    },
  ];
  function drawVignettes() {
    screenSpace();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const m of S.marks) {
      if (m.vx < -60 || m.vy < -60 || m.vx > S.vw + 60 || m.vy > S.vh + 60) continue;
      const u = m.vs / 20;
      ctx.save(); ctx.translate(m.vx, m.vy); ctx.scale(u, u);
      if (!m.owned) ctx.globalAlpha = 0.55;
      const draw = VIGNETTES[m.n];
      vg.u = u; vg.halo = true; draw(); vg.halo = false; draw();
      ctx.restore();
    }
  }

  // ------------------------------------------------------------------ lettering
  // One style everywhere: dark ink on a soft reserve of vellum. Placed in screen space, the most
  // important first, never on top of each other, the road, a mark, the page's buttons or the sheet's edge.
  const widths = new Map();
  let fontsReady = false;
  function spacedWidth(text, font, sp) {
    const key = font + '|' + text;
    let w = widths.get(key);
    if (w == null) { ctx.font = font; w = ctx.measureText(text).width; if (fontsReady) widths.set(key, w); }
    return w + sp * (Array.from(text).length - 1);
  }
  function inkText(text, x, y, font, sp, alpha, colour) { // centred on x, y
    ctx.font = font; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.lineJoin = 'round';
    const chars = sp ? Array.from(text) : [text];
    const start = x - spacedWidth(text, font, sp) / 2;
    const each = (fn) => { let cx = start; for (const ch of chars) { fn(ch, cx); cx += ctx.measureText(ch).width + sp; } };
    // the vellum reserve: soft, as if the wash had been lifted where the pen would go
    ctx.save(); ctx.shadowColor = `rgb(${C.paper})`; ctx.shadowBlur = 5 * S.dpr;
    ctx.strokeStyle = `rgba(${C.paper},.62)`; ctx.lineWidth = 2.8; each((ch, cx) => ctx.strokeText(ch, cx, y)); each((ch, cx) => ctx.strokeText(ch, cx, y));
    ctx.restore();
    ctx.fillStyle = colour || `rgba(${C.ink},${alpha == null ? 0.96 : alpha})`; each((ch, cx) => ctx.fillText(ch, cx, y));
  }
  // each reach's sheets are lettered in their own hand (WORLD.md §10); the Inkwood's old plan in a plainer one
  const handFont = (n, px) => {
    if (n === 16) return `400 ${Math.round(px * 1.02)}px ${F.hand}`;
    const act = n === 0 ? 0 : Math.floor((n - 1) / 4);
    return [`italic 400 ${px}px ${F.chart}`, `400 ${px}px ${F.chart}`, `italic 500 ${px}px ${F.body}`, `500 ${px}px ${F.body}`][act];
  };
  function drawLabels() {
    screenSpace();
    const k = S.view.k, zoom = k / S.fitK, sheetPx = SH.w * k;
    const tiny = sheetPx < 340, small = sheetPx < 560; // a sheet too small to letter: numbers only
    const sr = [sx(WIN[0]) + 3, sy(WIN[1]) + 3, sx(WIN[2]) - 3, sy(WIN[3]) - 3]; // lettering keeps inside the neatline
    const placed = [], soft = [];
    const hit = (r, list) => { for (const q of list) if (r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1]) return true; return false; };
    const fits = (r) => r[0] >= Math.max(2, sr[0]) && r[2] <= Math.min(S.vw - 2, sr[2]) && r[1] >= Math.max(2, sr[1]) && r[3] <= Math.min(S.vh - 2, sr[3]);
    // the page's own furniture: the zoom buttons, the caption, the locator, the card
    { const z = document.querySelector('.ev-zoom').getBoundingClientRect(), o = chartEl.getBoundingClientRect(); placed.push([z.left - o.left - 6, z.top - o.top - 6, z.right - o.left + 6, z.bottom - o.top + 6]); }
    if ($('caption').classList.contains('is-on')) placed.push([0, 0, S.vw, 46]);
    if (locatorRect) placed.push(locatorRect);
    if (!$('card').hidden) { const c = $('card').getBoundingClientRect(), o = chartEl.getBoundingClientRect(); placed.push([c.left - o.left - 4, c.top - o.top - 4, c.right - o.left + 4, c.bottom - o.top + 4]); }
    // and the sheet's own: the title, the Waystones' sill, the compass
    for (const f of FURNITURE) placed.push([sx(f[0]), sy(f[1]), sx(f[2]), sy(f[3])]);
    // marks keep their place first
    for (const m of S.marks) { placed.push([m.lx - m.u * 0.9, m.ly - m.u * 2.1, m.lx + m.u * 0.9, m.ly + m.u]); placed.push([m.vx - m.vs * 0.46, m.vy - m.vs * 0.46, m.vx + m.vs * 0.46, m.vy + m.vs * 0.46]); }
    // the road is a soft obstacle: a name goes on it only when there is nowhere else
    for (const pc of PC) {
      if (pc.leg > S.owned) continue;
      let lastX = -99, lastY = -99;
      for (const p of pc.pts) { const x = sx(p[0]), y = sy(p[1]); if (Math.abs(x - lastX) + Math.abs(y - lastY) < 9) continue; lastX = x; lastY = y; if (x > -10 && y > -10 && x < S.vw + 10 && y < S.vh + 10) soft.push([x - 3, y - 3, x + 3, y + 3]); }
    }
    const ts = clamp(0.94 + 0.1 * Math.log2(Math.max(1, zoom)), 0.94, 1.45) * (tiny ? 0.86 : 1); // lettering grows a little as you zoom in
    // numerals
    const numPx = Math.round(12.5 * ts), numFont = `400 ${numPx}px ${F.display}`;
    for (const m of S.marks) {
      if (!m.n) continue;
      const t = String(m.n), w = spacedWidth(t, numFont, 0), h = numPx, g = m.u * 0.95 + 2;
      const opts = [[m.lx + g, m.ly - h * 0.9], [m.lx - g - w, m.ly - h * 0.9], [m.lx + g, m.ly + 1], [m.lx - g - w, m.ly + 1], [m.lx - w / 2, m.ly + m.u + 2], [m.lx - w / 2, m.ly - m.u * 2.1 - h - 1]];
      for (const pass of [0, 1]) {
        let done = false;
        for (const o of opts) {
          const r = [o[0] - 1, o[1] - 1, o[0] + w + 1, o[1] + h + 1];
          if (hit(r, placed) || (!pass && hit(r, soft)) || !fits(r)) continue;
          placed.push(r); m.num = r; done = true;
          inkText(t, o[0] + w / 2, o[1] + h / 2, numFont, 0, 1, m.owned ? 'rgb(140,66,6)' : `rgba(${C.ink},.6)`);
          break;
        }
        if (done) break;
      }
    }
    // water names (the selected one first)
    if (!tiny) {
      const order = S.marks.slice().sort((a, b) => (b.n === S.sel) - (a.n === S.sel) || a.n - b.n);
      for (const m of order) {
        const always = m.n === S.sel;
        if (!always && small && m.n && m.n !== S.owned && zoom < 1.3) continue;
        const px = Math.round((small ? 13.5 : 15) * ts), font = handFont(m.n, px), sp = 0.2;
        const w = spacedWidth(m.name, font, sp), h = px * 1.2, nr = m.num;
        const g = m.u * 0.95 + 3;
        const right = nr && nr[0] >= m.lx ? nr[2] + 3 : m.lx + g, left = nr && nr[2] <= m.lx ? nr[0] - 3 - w : m.lx - g - w;
        const vr = m.vx + m.vs * 0.5 + 3, vl = m.vx - m.vs * 0.5 - 3 - w;
        const opts = [[right, m.ly - h * 0.62], [left, m.ly - h * 0.62], [vr, m.vy - h / 2], [vl, m.vy - h / 2], [m.lx - w / 2, m.ly + m.u + 3], [m.lx - w / 2, m.ly - m.u * 2.2 - h - 2], [right, m.ly + 2], [left, m.ly + 2], [m.vx - w / 2, m.vy + m.vs * 0.5 + 2], [m.vx - w / 2, m.vy - m.vs * 0.5 - h - 2]];
        let done = false;
        for (const pass of [0, 1, 2]) {
          for (const o of opts) {
            const r = [o[0] - 2, o[1] - 1, o[0] + w + 2, o[1] + h + 1];
            if (!fits(r)) continue;
            if (pass < 2 && hit(r, placed)) continue;
            if (pass === 0 && hit(r, soft)) continue;
            if (pass === 2 && !always) continue;
            placed.push(r); done = true;
            inkText(m.name, o[0] + w / 2, o[1] + h / 2, font, sp, m.owned ? 0.98 : 0.6);
            break;
          }
          if (done) break;
        }
      }
    }
    // everything else
    const list = D.labels.filter((l) => shown(l.sheet) && k >= l.z && !(tiny && l.kind !== 'sea'));
    if (!inked() && S.owned >= 16 && !tiny) list.push({ t: 'never charted', kind: 'hand', at: [752, 372], a: -7, z: 0 }); // the one note in the margin hand (WORLD.md §10)
    const rank = { sea: 0, region: 1, hand: 1, river: 2, place: 3, note: 4, sounding: 5 };
    list.sort((a, b) => rank[a.kind] - rank[b.kind]);
    for (const l of list) {
      const x = sx(l.at[0]), y = sy(l.at[1]);
      if (x < -200 || y < -200 || x > S.vw + 200 || y > S.vh + 200) continue;
      if (l.kind === 'river') { riverLabel(l, placed, hit, ts); continue; }
      let font, sp, text = l.t, alpha = 0.92;
      if (l.kind === 'sea') { const px = (l.small ? 0.76 : 1) * clamp(sheetPx / 42, 9.5, 21); font = `italic 400 ${Math.round(px)}px ${F.chart}`; sp = px * (l.small ? 0.12 : 0.26); alpha = 0.9; }
      else if (l.kind === 'region') { const px = 11.5 * ts * clamp(0.85 + 0.1 * zoom, 0.9, 1.3); font = `400 ${Math.round(px)}px ${F.display}`; sp = px * 0.32; text = l.t.toUpperCase(); alpha = 0.86; }
      else if (l.kind === 'hand') { font = `400 ${Math.round(clamp(sheetPx / 48, 10, 15) * ts)}px ${F.hand}`; sp = 0.4; alpha = 0.8; }
      else if (l.kind === 'sounding') { font = `italic 400 ${Math.round(10.5 * ts)}px ${F.chart}`; sp = 0; alpha = 0.8; }
      else { const px = (l.kind === 'note' ? 11.5 : 12.5) * ts; font = `italic 400 ${Math.round(px)}px ${F.chart}`; sp = 0.3; }
      const w = spacedWidth(text, font, sp), h = parseFloat(font.match(/(\d+)px/)[1]) * 1.25;
      const a = (l.a || 0) * Math.PI / 180, ca = Math.abs(Math.cos(a)), sa = Math.abs(Math.sin(a));
      // a place name sits beside its mark; the rest are centred on their ground
      const spots = l.kind === 'place' ? [[x + w / 2 + 7, y - 1], [x - w / 2 - 7, y - 1], [x, y - h * 0.9], [x, y + h * 0.9]] : [[x, y]];
      for (const o of spots) {
        const bw = (w * ca + h * sa) / 2 + 2, bh = (w * sa + h * ca) / 2 + 1;
        const subH = l.sub && k >= 0.9 ? 15 * ts : 0;
        const r = [o[0] - bw, o[1] - bh, o[0] + bw, o[1] + bh + subH];
        if (hit(r, placed) || !fits(r)) continue;
        if (l.kind !== 'sea' && l.kind !== 'region' && !l.force && hit(r, soft)) continue;
        placed.push(r);
        ctx.save(); ctx.translate(o[0], o[1]); ctx.rotate(a);
        inkText(text, 0, 0, font, sp, alpha, l.tone === 'ice' ? 'rgba(62,66,140,.95)' : null);
        if (subH) inkText(l.sub, 0, h * 0.5 + 8 * ts, `italic 400 ${Math.round(12 * ts)}px ${F.chart}`, 0.2, 0.86);
        ctx.restore();
        break;
      }
    }
  }
  function riverLabel(l, placed, hit, ts) {
    const font = `italic 400 ${Math.round(12 * ts)}px ${F.chart}`, sp = 1.5 * ts;
    const P2 = l.path, n = P2.length / 2, pts = [];
    for (let i = 0; i < n; i++) pts.push([sx(P2[i * 2]), sy(P2[i * 2 + 1])]);
    if (pts[n - 1][0] < pts[0][0]) pts.reverse();
    // letter along the river's sweep, not its every wriggle
    for (let it = 0; it < 14; it++) for (let i = 1; i < n - 1; i++) { pts[i][0] = (pts[i - 1][0] + 2 * pts[i][0] + pts[i + 1][0]) / 4; pts[i][1] = (pts[i - 1][1] + 2 * pts[i][1] + pts[i + 1][1]) / 4; }
    const s = [0];
    for (let i = 1; i < n; i++) s.push(s[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = s[n - 1], w = spacedWidth(l.t, font, sp);
    if (total < w * 1.25) return;
    // centre the name on the label's own point along the course
    const ax = sx(l.at[0]), ay = sy(l.at[1]);
    let bi = 0, bd = 1e12;
    for (let i = 0; i < n; i++) { const d = (pts[i][0] - ax) * (pts[i][0] - ax) + (pts[i][1] - ay) * (pts[i][1] - ay); if (d < bd) { bd = d; bi = i; } }
    const d0 = clamp(s[bi] - w / 2, 2, total - w - 2);
    ctx.font = font;
    const glyphs = []; let d = d0, j = 0;
    const lift = 7.5 * ts; // the name rides just above its water, clear of the road's line
    for (const ch of Array.from(l.t)) {
      const cw = ctx.measureText(ch).width * (ch === ' ' ? 1.9 : 1), mid = d + cw / 2;
      while (j < n - 2 && s[j + 1] < mid) j++;
      const t = (mid - s[j]) / (s[j + 1] - s[j] || 1), a = pts[Math.max(0, j - 1)], b = pts[Math.min(n - 1, j + 2)];
      glyphs.push({ ch, x: lerp(pts[j][0], pts[j + 1][0], t), y: lerp(pts[j][1], pts[j + 1][1], t), ang: Math.atan2(b[1] - a[1], b[0] - a[0]), cw });
      d += cw + sp;
    }
    const rects = [];
    for (let g = 0; g < glyphs.length; g += 2) { const q = glyphs[g], ox = Math.sin(q.ang) * lift, oy = -Math.cos(q.ang) * lift; rects.push([q.x + ox - 7, q.y + oy - 7, q.x + ox + 7, q.y + oy + 7]); }
    for (const r of rects) if (hit(r, placed) || r[0] < 0 || r[1] < 0 || r[2] > S.vw || r[3] > S.vh) return;
    for (const r of rects) placed.push(r);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    for (const pass of [0, 1]) for (const q of glyphs) {
      ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.ang);
      if (!pass) { ctx.strokeStyle = `rgba(${C.paper},.85)`; ctx.lineWidth = 3; ctx.strokeText(q.ch, 0, -lift + 3.5); }
      else { ctx.fillStyle = 'rgba(44,40,96,.96)'; ctx.fillText(q.ch, 0, -lift + 3.5); }
      ctx.restore();
    }
  }

  // ------------------------------------------------------------------ the sheet's own furniture, in chart units
  function chartText(text, x, y, size, font, fill, sp, align, least) {
    if (size * S.view.k < (least || 6.4)) return false;
    ctx.font = `${font.style || '400'} ${size}px ${font.fam}`; ctx.textBaseline = 'middle'; ctx.fillStyle = fill;
    const chars = Array.from(text); let w = 0;
    for (const ch of chars) w += ctx.measureText(ch).width + (sp || 0);
    w -= sp || 0;
    let cx = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
    ctx.textAlign = 'left';
    for (const ch of chars) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + (sp || 0); }
    return true;
  }
  const stone = (x, y, s, lit) => { // a Waystone: a small standing stone, with a point of amber when its map is owned
    ctx.beginPath(); ctx.moveTo(x - s * 0.5, y + s * 0.7); ctx.lineTo(x - s * 0.5, y - s * 0.3); ctx.arc(x, y - s * 0.3, s * 0.5, Math.PI, 0); ctx.lineTo(x + s * 0.5, y + s * 0.7); ctx.closePath();
    ctx.fillStyle = lit ? 'rgb(244,238,230)' : 'rgb(164,158,186)'; ctx.fill(); ctx.strokeStyle = `rgba(${C.ink},.85)`; ctx.lineWidth = s * 0.11; ctx.stroke();
    if (lit) { ctx.beginPath(); ctx.moveTo(x, y - s * 0.52); ctx.quadraticCurveTo(x + s * 0.36, y + s * 0.1, x, y + s * 0.34); ctx.quadraticCurveTo(x - s * 0.36, y + s * 0.1, x, y - s * 0.52); ctx.fillStyle = AMBER; ctx.fill(); }
  };
  function drawFrame() {
    chartSpace();
    const ink = (a) => `rgba(${C.ink},${a})`, pale = (a) => `rgba(${C.pale},${a})`;
    const disp = { fam: F.display }, ital = { fam: F.chart, style: 'italic 400' };
    ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
    const X0 = SH.x0, Y0 = SH.y0, X1 = SH.x0 + SH.w, Y1 = SH.y0 + SH.h, e = SH.edge;
    // the neatline: a heavy rule and a fine one; the border band beyond it; a fine rule at the sheet's edge
    ctx.strokeStyle = ink(0.86); ctx.lineWidth = 1.1; ctx.strokeRect(WIN[0], WIN[1], WIN[2] - WIN[0], WIN[3] - WIN[1]);
    ctx.lineWidth = 0.3; ctx.strokeRect(WIN[0] - 2.6, WIN[1] - 2.6, WIN[2] - WIN[0] + 5.2, WIN[3] - WIN[1] + 5.2);
    ctx.strokeStyle = ink(0.6); ctx.strokeRect(X0 + e, Y0 + e, SH.w - 2 * e, SH.h - 2 * e);
    // ticks along the band, as on a ruled border
    ctx.beginPath(); ctx.strokeStyle = ink(0.55); ctx.lineWidth = 0.3;
    for (let x = 0; x <= 1000; x += 50) { ctx.moveTo(x, WIN[1] - 2.6); ctx.lineTo(x, WIN[1] - 6.2); ctx.moveTo(x, WIN[3] + 2.6); ctx.lineTo(x, WIN[3] + 6.2); }
    for (let y = 0; y <= 1400; y += 50) { ctx.moveTo(WIN[0] - 2.6, y); ctx.lineTo(WIN[0] - 6.2, y); ctx.moveTo(WIN[2] + 2.6, y); ctx.lineTo(WIN[2] + 6.2, y); }
    ctx.stroke();
    // true latitudes down the right band (the Fold swallows forty degrees)
    for (const [y, t] of [[190, '51°N'], [580, '49°N'], [758, '6°N'], [1100, '0°'], [1336, '4°S']]) { ctx.save(); ctx.translate(WIN[2] + 14, y); ctx.rotate(Math.PI / 2); chartText(t, 0, 0, 8.4, ital, ink(0.78), 0.3); ctx.restore(); }
    // the four cartouches, one for each reach: empty until its fourth map is owned, then its Waystones and its act
    const bandMid = (SH.neat + e) / 2;
    const cart = (i, cx, cy, rot) => {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
      const full = S.owned >= (i + 1) * 4 || inked(), L = 316, Hh = 27;
      ctx.beginPath(); ctx.moveTo(-L / 2 + 9, -Hh / 2); ctx.lineTo(L / 2 - 9, -Hh / 2); ctx.lineTo(L / 2, 0); ctx.lineTo(L / 2 - 9, Hh / 2); ctx.lineTo(-L / 2 + 9, Hh / 2); ctx.lineTo(-L / 2, 0); ctx.closePath();
      ctx.fillStyle = 'rgba(244,240,236,.7)'; ctx.fill(); ctx.strokeStyle = ink(0.75); ctx.lineWidth = 0.45; ctx.stroke();
      if (full) {
        const a = ACTS[i], font = [{ fam: F.chart, style: 'italic 400' }, { fam: F.chart }, { fam: F.body, style: 'italic 500' }, { fam: F.body, style: '500' }][i];
        chartText(a.n, -L / 2 + 28, 0.8, 14, disp, ink(0.9), 0.8, null, 5.6);
        chartText(a.title, -L / 2 + 50, 0.4, 17.5, font, ink(0.96), 0.7, 'left', 5.6);
        for (let q = 0; q < 4; q++) stone(L / 2 - 68 + q * 14.6, 0.8, 10.5, true);
        if (i === 0) pilgrim(L / 2 + 16, 0);
      }
      ctx.restore();
    };
    cart(0, 590, Y0 + bandMid, 0);
    cart(1, X0 + bandMid, 372, -Math.PI / 2);
    cart(2, X0 + bandMid, 884, -Math.PI / 2);
    cart(3, 640, Y1 - bandMid, 0);
    // the title cartouche: a vellum label laid on the Warm Sea
    const tx = 118, ty = 1392;
    ctx.fillStyle = 'rgba(238,232,230,.95)'; ctx.fillRect(tx - 116, ty - 40, 232, 78);
    ctx.strokeStyle = ink(0.8); ctx.lineWidth = 0.8; ctx.strokeRect(tx - 116, ty - 40, 232, 78); ctx.lineWidth = 0.25; ctx.strokeRect(tx - 112.5, ty - 36.5, 225, 71);
    chartText('GLOOMWATER', tx, ty - 25, 7.4, disp, ink(0.66), 3.6);
    chartText('THE WAXWOLD', tx, ty - 3, 23, disp, ink(0.94), 5);
    ctx.strokeStyle = ink(0.6); ctx.lineWidth = 0.35;
    ctx.beginPath(); ctx.moveTo(tx - 86, ty + 13); ctx.lineTo(tx - 8, ty + 13); ctx.moveTo(tx + 8, ty + 13); ctx.lineTo(tx + 86, ty + 13); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx, ty + 9.6); ctx.lineTo(tx + 3.4, ty + 13); ctx.lineTo(tx, ty + 16.4); ctx.lineTo(tx - 3.4, ty + 13); ctx.closePath(); ctx.stroke();
    chartText('a road chart of the Lamp Road', tx, ty + 26, 10.6, ital, ink(0.86), 0.3, null, 8.2);
    // one small, plain compass rose, in the corner by the Waystones. It and the sill stand in the Cold
    // Sea, which is blank vellum until the whole road is charted: pale ink on the sea, dark on the vellum.
    const onSea = inked() || (S.owned >= 16 && !S.reveal), fur = (a) => (onSea ? pale(a) : ink(a * 0.9));
    const rx = 1000, ry = 14, R = 21;
    ctx.lineJoin = 'round'; ctx.strokeStyle = fur(0.85); ctx.fillStyle = fur(0.85); ctx.lineWidth = 0.4;
    ctx.beginPath(); ctx.arc(rx, ry, R * 0.6, 0, 6.3); ctx.stroke();
    for (let q = 0; q < 8; q++) {
      const a = (q * Math.PI) / 4, long = q % 2 === 0 ? R : R * 0.5, wd = q % 2 === 0 ? 2.3 : 1.4;
      ctx.beginPath(); ctx.moveTo(rx + Math.sin(a) * long, ry - Math.cos(a) * long);
      ctx.lineTo(rx + Math.sin(a + 1.57) * wd, ry - Math.cos(a + 1.57) * wd); ctx.lineTo(rx + Math.sin(a - 1.57) * wd, ry - Math.cos(a - 1.57) * wd); ctx.closePath();
      ctx.stroke(); if (q === 0) ctx.fill();
    }
    chartText('N', rx, ry - R - 7, 9, disp, fur(0.92), 0);
    // the Waystones: the sill under the Landing's arch, sixteen stones in four arcs, one arc for each
    // reach (WORLD.md §7), drawn in the Cold Sea just off the Landing's cove
    const wx = SILL[0], wy = SILL[1];
    ctx.setLineDash([0.4, 2.4]); ctx.lineCap = 'round'; ctx.strokeStyle = fur(0.6); ctx.lineWidth = 0.4;
    ctx.beginPath(); ctx.moveTo(wx - 12, wy + 46); ctx.quadraticCurveTo(626, 158, 603, 171); ctx.stroke();
    ctx.setLineDash([]); ctx.lineCap = 'butt';
    ctx.fillStyle = STONE; ctx.strokeStyle = ink(0.9); ctx.lineWidth = 0.5;
    for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.rect(wx + sgn * 16 - 2.6, wy - 9, 5.2, 13); ctx.fill(); ctx.stroke(); }
    for (const [lw, col] of [[2.8, ink(0.9)], [1.6, STONE]]) { ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(wx, wy - 9, 16, Math.PI, Math.PI * 1.36); ctx.stroke(); ctx.beginPath(); ctx.arc(wx, wy - 9, 16, Math.PI * 1.52, Math.PI * 2); ctx.stroke(); }
    for (let arc = 0; arc < 4; arc++) for (let st = 0; st < 4; st++) {
      const n = arc * 4 + st + 1, t = (st - 1.5) / 1.5;
      stone(wx + t * 12.4, wy + 13 + arc * 8.6 + 1.7 * (1 - t * t), 5.8, n <= S.owned);
    }
    chartText('the Waystones', wx + 26, wy + 18, 9.2, ital, fur(0.95), 0.2, 'left');
    chartText('one lights for each map bought', wx + 26, wy + 29, 7.2, ital, fur(0.85), 0.15, 'left');
    // the Long Coast's sailing line is broken by the Fold: a tick at each pleat
    if (shown(9)) {
      ctx.strokeStyle = `rgba(${C.paper},.9)`; ctx.lineWidth = 0.6; ctx.beginPath();
      for (const [x, y] of FOLD_TICKS) { ctx.moveTo(x - 5, y + 1.4); ctx.lineTo(x + 5, y - 1.4); ctx.moveTo(x - 5, y + 3.2); ctx.lineTo(x + 5, y + 0.4); }
      ctx.stroke();
    }
  }
  // the court surveyors' little Pilgrim Salmon, always swimming down the road
  function pilgrim(x, y) {
    if (10 * S.view.k < 6) return;
    ctx.save(); ctx.translate(x, y);
    ctx.beginPath(); ctx.moveTo(-8, 0); ctx.quadraticCurveTo(-2, -4.2, 6, -0.6); ctx.lineTo(10.4, -3.4); ctx.lineTo(9.4, 0); ctx.lineTo(10.4, 3.4); ctx.lineTo(6, 0.6); ctx.quadraticCurveTo(-2, 4.2, -8, 0); ctx.closePath();
    ctx.strokeStyle = `rgba(${C.ink},.85)`; ctx.lineWidth = 0.5; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-1, -2.6); ctx.lineTo(1.4, -4.6); ctx.lineTo(2.6, -2); ctx.moveTo(-4.8, -0.6); ctx.arc(-5.2, -0.6, 0.4, 0, 6.3); ctx.stroke();
    ctx.restore();
  }

  // ---- the raft: a small hull, the Wick and its flame. Never a ring.
  function drawRaft(t) {
    const r = S.raft; if (!r) return;
    screenSpace();
    const z = clamp(0.9 + 0.2 * Math.log2(S.view.k / S.fitK + 1), 1, 1.5) * 1.25;
    const x = sx(r.x), y = sy(r.y) + (reduced ? 0 : Math.sin(t / 420) * 1.1);
    const fl = reduced ? 1 : 0.92 + 0.08 * Math.sin(t / 97) + 0.05 * Math.sin(t / 41);
    ctx.save(); ctx.translate(x, y); ctx.scale(z, z);
    const g = ctx.createRadialGradient(0, -9, 0, 0, -9, 26 * fl);
    g.addColorStop(0, 'rgba(255,214,150,.9)'); g.addColorStop(0.25, 'rgba(250,170,70,.42)'); g.addColorStop(1, 'rgba(250,170,70,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -9, 26 * fl, 0, 6.3); ctx.fill();
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // the raft
    ctx.beginPath(); ctx.moveTo(-8.5, -0.5); ctx.lineTo(8.5, -0.5); ctx.lineTo(6.6, 3); ctx.lineTo(-6.6, 3); ctx.closePath();
    ctx.strokeStyle = `rgba(${C.paper},.9)`; ctx.lineWidth = 2.6; ctx.stroke(); ctx.fillStyle = 'rgb(96,72,60)'; ctx.fill(); ctx.strokeStyle = 'rgb(34,24,36)'; ctx.lineWidth = 1; ctx.stroke();
    // its lantern on a pole
    ctx.beginPath(); ctx.moveTo(5.2, -0.5); ctx.lineTo(5.2, -9.5); ctx.strokeStyle = 'rgb(34,24,36)'; ctx.lineWidth = 1.1; ctx.stroke();
    ctx.beginPath(); ctx.arc(5.2, -10.6, 1.7, 0, 6.3); ctx.fillStyle = 'rgb(255,190,100)'; ctx.fill(); ctx.strokeStyle = 'rgb(96,44,10)'; ctx.lineWidth = 0.6; ctx.stroke();
    // the Wick: a small candle with a candle-flame head
    ctx.beginPath(); ctx.rect(-3.6, -6.2, 3.6, 5.7); ctx.fillStyle = 'rgb(248,240,226)'; ctx.fill(); ctx.strokeStyle = 'rgb(34,24,36)'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-1.8, -13.4 * fl); ctx.bezierCurveTo(0.9, -10, 0.4, -6.6, -1.8, -6.6); ctx.bezierCurveTo(-4, -6.6, -4.5, -10, -1.8, -13.4 * fl);
    ctx.fillStyle = 'rgb(255,186,84)'; ctx.fill(); ctx.strokeStyle = 'rgb(120,56,8)'; ctx.lineWidth = 0.6; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-1.8, -8.4, 0.9, 1.4, 0, 0, 6.3); ctx.fillStyle = 'rgba(255,246,220,.95)'; ctx.fill();
    ctx.restore();
  }

  // ---- a small locator: where this view lies on the whole sheet
  let locatorRect = null;
  function drawLocator() {
    locatorRect = null;
    const k = S.view.k;
    if (k < S.fitK * 1.5 || S.vw < 300 || S.vh < 260) return;
    if (S.vw < 700 && !$('card').hidden) return;
    screenSpace();
    const h = clamp(S.vh * 0.2, 84, 140), w = h * SH.w / SH.h, x = S.vw < 700 ? 10 : S.vw - w - 10, y = S.vh - h - 10; // on a narrow screen the zoom buttons have the other corner
    locatorRect = [x - 4, y - 4, x + w + 4, y + h + 4];
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 10; ctx.fillStyle = '#ddd7e2'; ctx.fillRect(x, y, w, h); ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
    ctx.drawImage(S.paper, x, y, w, h);
    const img = S.world[S.world.length - 1].img;
    if (inked() || S.owned >= 16) ctx.drawImage(img, x, y, w, h);
    else { octx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0); octx.globalCompositeOperation = 'source-over'; octx.clearRect(0, 0, S.vw, S.vh); octx.drawImage(img, x, y, w, h); octx.globalCompositeOperation = 'destination-in'; octx.drawImage(maskCv, x, y, w, h); ctx.drawImage(off, 0, 0, S.vw, S.vh); }
    ctx.strokeStyle = `rgba(${C.ink},.9)`; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    const q = w / SH.w, vx0 = x + (cxOf(0) - SH.x0) * q, vy0 = y + (cyOf(0) - SH.y0) * q, vx1 = x + (cxOf(S.vw) - SH.x0) * q, vy1 = y + (cyOf(S.vh) - SH.y0) * q;
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.strokeStyle = AMBER; ctx.lineWidth = 1.6; ctx.strokeRect(vx0, vy0, vx1 - vx0, vy1 - vy0);
    if (S.raft) { ctx.fillStyle = AMBER; ctx.beginPath(); ctx.arc(x + (S.raft.x - SH.x0) * q, y + (S.raft.y - SH.y0) * q, 2.6, 0, 6.3); ctx.fill(); ctx.strokeStyle = 'rgb(60,30,10)'; ctx.lineWidth = 0.8; ctx.stroke(); }
    ctx.restore();
  }

  // ------------------------------------------------------------------ the journey
  const caption = (html) => { const el = $('caption'); if (html) { el.innerHTML = html; el.classList.add('is-on'); } else el.classList.remove('is-on'); };
  const legDuration = (leg) => clamp(1300 + leg.len * 16, 2000, 6800);
  const legCaption = (n) => `<b>${n}</b>${W[n - 1].name}. ${W[n - 1].from}`;
  // a short leg is framed close; a long one from far out: the barge road, and the Long Coast, which is a
  // hand's width on the sheet but some 4,500 km through the Fold
  function frameLeg(n, ms) {
    const leg = legs[n - 1], b = leg.box, pad = 46;
    const box = [b[0] - pad, b[1] - pad, b[2] + pad, b[3] + pad];
    const v = fitView(box, S.vw < 700 ? 26 : 60, 2.6);
    const throughFold = b[1] < D.fold.y0 && b[3] > D.fold.y1;
    flyTo(leg.len > 420 || throughFold || v.k < S.fitK * 1.25 ? homeView() : v, ms);
  }
  function setOwned(n, opts) {
    opts = opts || {};
    const prev = S.owned;
    S.owned = clamp(n, 1, 16);
    $('owned').value = S.owned;
    $('owned').style.setProperty('--fill', ((S.owned - 1) / 15) * 100 + '%');
    $('ownedOut').innerHTML = `${S.owned} of 16<span> · ${W[S.owned - 1].name}</span>`;
    S.reveal = !reduced && opts.reveal && S.owned > prev && !inked() ? { sheet: S.owned, t0: now(), ms: 1100 } : null;
    if (!opts.keepHearth) S.hearthFull = false;
    buildMask(); syncRoadList(); invalidate();
  }
  function startJourney() {
    if (reduced) { stepRoad(); return; }
    S.before = S.journey && S.journey.phase === 'done' ? S.before : S.owned;
    S.hearthFull = false;
    S.journey = { leg: 1, phase: 'fly', t0: now(), d: 0 };
    S.raft = { x: HOME.at[0], y: HOME.at[1] };
    if (S.mode !== 'chart') setMode('chart');
    setOwned(1); select(null);
    beginLeg(1);
    $('journey').textContent = 'Pause'; $('journeyStop').hidden = false;
    invalidate();
  }
  function beginLeg(n) {
    const j = S.journey;
    j.leg = n; j.phase = 'fly'; j.t0 = now(); j.d = 0;
    if (n > 1) setOwned(n, { reveal: true }); // the new sheet inks itself in, road and all; then the raft sets out
    caption(legCaption(n));
    frameLeg(n, 1000);
  }
  function stepJourney(t) {
    const j = S.journey;
    if (!j || j.paused || j.phase === 'done') return false;
    const leg = legs[j.leg - 1];
    if (j.phase === 'fly') { if (t - j.t0 > 1250) { j.phase = 'sail'; j.t0 = t; } return true; }
    if (j.phase === 'sail') {
      const q = clamp((t - j.t0) / legDuration(leg), 0, 1);
      j.d = leg.len * (q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2);
      const p = pointOnLeg(leg, j.d); S.raft = { x: p.x, y: p.y };
      if (q >= 1) { j.phase = 'dwell'; j.t0 = t; }
      return true;
    }
    if (j.phase === 'dwell') {
      if (t - j.t0 > 1100) {
        if (j.leg >= 16) { endJourney(); return true; }
        beginLeg(j.leg + 1);
      }
      return true;
    }
    return false;
  }
  // the ending: nothing on the Chart changes but the Landing's hearth, which burns full (WORLD.md §10)
  function endJourney() {
    const j = S.journey; j.phase = 'done';
    $('journey').textContent = 'Sail again'; $('journeyStop').hidden = true;
    caption('<b>Home</b>The whole Lamp Road, about 7,300 km, from the Landing to the Inkwood. At the Landing the hearth burns full.');
    S.raft = { x: HOME.at[0], y: HOME.at[1] + 5 };
    S.hearthFull = true;
    flyTo(homeView(), 1800);
    invalidate();
  }
  function stopJourney(restore) {
    if (!S.journey && !S.raft) return;
    const was = S.journey;
    S.journey = null; S.raft = null; S.raftAt = null;
    caption('');
    $('journey').textContent = reduced ? 'Next water' : 'Sail the road'; $('journeyStop').hidden = true;
    // give the slider back where the reader left it
    if (restore && was && was.phase !== 'done' && S.before) setOwned(S.before);
    invalidate();
  }
  function toggleJourney() {
    const j = S.journey;
    if (reduced) { stepRoad(); return; }
    if (!j || j.phase === 'done') { startJourney(); return; }
    j.paused = !j.paused;
    if (!j.paused) j.t0 = now() - (j.pausedAt - j.t0);
    else j.pausedAt = now();
    $('journey').textContent = j.paused ? 'Sail on' : 'Pause';
    invalidate();
  }
  // reduced motion: no flight, no sailing. Each press pins the next sheet and sets the raft at its water.
  function stepRoad() {
    const n = S.raftAt == null ? 1 : S.raftAt >= 16 ? 1 : S.raftAt + 1;
    S.raftAt = n;
    if (S.mode !== 'chart') setMode('chart');
    setOwned(n);
    const w = W[n - 1]; S.raft = { x: w.at[0], y: w.at[1] + 6 };
    caption(legCaption(n));
    S.view = fitView(n === 1 ? D.sheetBox[0] : ownedBox(), 30, 2.6);
    select(n, true);
    $('journey').textContent = n >= 16 ? 'Start again' : 'Next water';
    invalidate();
  }

  // ------------------------------------------------------------------ the card and the road list
  const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  function select(n, quiet) {
    S.sel = n;
    const card = $('card');
    if (n == null) { card.hidden = true; syncRoadList(); invalidate(); return; }
    const facts = $('cardFacts'); facts.textContent = '';
    const add = (dt, html) => { const a = document.createElement('dt'); a.textContent = dt; const b = document.createElement('dd'); b.innerHTML = html; const w = document.createElement('div'); w.append(a, b); facts.append(w); };
    if (n === 0) {
      $('cardKicker').textContent = 'Home';
      $('cardName').textContent = HOME.name;
      $('cardMeta').textContent = `${cap1(HOME.kind)} · ${HOME.lat}`;
      $('cardLand').textContent = cap1(HOME.land) + '.';
      $('cardStory').textContent = HOME.story;
      add('The Waystones', HOME.more);
      $('cardMurk').hidden = true;
    } else {
      const w = W[n - 1], act = ACTS[w.act];
      $('cardKicker').textContent = `${w.n} of 16 · Act ${act.n}, ${act.title}`;
      $('cardName').textContent = w.name;
      $('cardMeta').textContent = `${cap1(w.kind)}: ${w.detail} · ${w.lat}`;
      $('cardLand').textContent = cap1(w.land) + '.';
      $('cardStory').textContent = w.story;
      add('Its legend', `<b>${w.legend}.</b> <i>${w.legendLine}</i>`);
      add('How you got here', w.from);
      const m = $('cardMurk');
      if (w.murk) { m.hidden = false; m.innerHTML = `“${w.murk}”<span>Old Murk, selling the map</span>`; } else m.hidden = true;
    }
    card.hidden = false; card.scrollTop = 0;
    syncRoadList();
    if (!quiet) {
      const at = n === 0 ? HOME.at : W[n - 1].at, box = n === 0 ? [540, 130, 660, 270] : D.sheetBox[n - 1];
      const v = fitView(box, S.vw < 700 ? 30 : 90, 3.4);
      // keep the water itself in view, clear of the card
      v.x = lerp(v.x, at[0], 0.6); v.y = lerp(v.y, at[1], 0.5);
      if (S.vw >= 1040) v.x -= 150 / v.k; // the card sits on the left of the chart
      flyTo(v, 900);
    }
    invalidate();
  }
  // The road list follows the Chart's rule: a water you do not own is not in the world. Owned waters
  // are named; the next one is a sealed sheet on Murk's shelf; an act's heading comes with its first water.
  function buildRoadList() {
    const root = $('roadList');
    const row = (n, name, kind) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'ev-water'; b.dataset.n = n;
      b.innerHTML = '<span class="n"></span><span class="name"></span><span class="kind"></span>';
      b.children[0].textContent = n || '◆'; b.children[1].textContent = name; b.children[2].textContent = kind;
      b.dataset.name = name; b.dataset.kind = kind;
      b.addEventListener('click', () => { if (!wide.matches) toggleRoad(false); pick(n); });
      const li = document.createElement('li'); li.append(b); return li;
    };
    const home = document.createElement('ol'); home.append(row(0, HOME.name, 'home, where every evening starts')); root.append(home);
    ACTS.forEach((a, i) => {
      const box = document.createElement('div'); box.className = 'ev-act'; box.dataset.act = i;
      const h = document.createElement('h3'); h.className = 'ev-act-name'; h.innerHTML = '<span></span>'; h.firstChild.textContent = a.n; h.append(a.title);
      const sub = document.createElement('p'); sub.className = 'ev-act-sub'; sub.textContent = `${a.reach} · ${a.hand}`;
      const ol = document.createElement('ol');
      W.filter((w) => w.act === i).forEach((w) => ol.append(row(w.n, w.name, `${w.kind}, ${w.detail}`)));
      box.append(h, sub, ol); root.append(box);
    });
  }
  function syncRoadList() {
    const all = inked();
    document.querySelectorAll('.ev-water').forEach((b) => {
      const n = +b.dataset.n, sealed = !all && n === S.owned + 1, hidden = !all && n > S.owned + 1;
      b.parentNode.hidden = hidden;
      b.classList.toggle('is-sealed', sealed);
      b.children[1].textContent = sealed ? 'A sealed sheet' : b.dataset.name;
      b.children[2].textContent = sealed ? 'on Murk’s shelf: buy the map to find the water' : b.dataset.kind;
      b.children[0].textContent = sealed ? '·' : n || '◆';
      if (n === S.sel) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    document.querySelectorAll('.ev-act').forEach((box) => { const i = +box.dataset.act; box.hidden = !all && S.owned < i * 4; box.classList.toggle('is-next', !all && S.owned === i * 4); });
  }
  // choosing a water you do not own buys the maps up to it
  function pick(n) {
    stopJourney();
    if (n > S.owned) setOwned(n, { reveal: true });
    select(n);
  }
  const wide = window.matchMedia('(min-width: 1040px)');
  let roadOpen = false;
  function toggleRoad(open) {
    const road = $('road'), t = $('roadToggle');
    roadOpen = open == null ? !roadOpen : open;
    road.hidden = !(wide.matches || roadOpen); t.setAttribute('aria-expanded', String(roadOpen));
  }
  if (wide.addEventListener) wide.addEventListener('change', () => toggleRoad(false));
  function setMode(m) {
    S.mode = m; S.reveal = null;
    document.querySelectorAll('.ev-seg-opts button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
    buildMask(); syncRoadList(); invalidate();
  }

  // ------------------------------------------------------------------ input
  const pointers = new Map();
  let gesture = null, moved = 0, downAt = null;
  const local = (e) => { const r = chartEl.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  function zoomAt(px, py, factor, ms) {
    const k = clamp(S.view.k * factor, S.fitK, maxK), cx = cxOf(px), cy = cyOf(py);
    const v = { k, x: cx - (px - S.vw / 2) / k, y: cy - (py - S.vh / 2) / k };
    keepInReach(v);
    S.userMoved = true;
    if (ms) flyTo(v, ms); else { S.tween = null; S.view = v; invalidate(); }
  }
  // the sheet never leaves the view: at the whole-sheet zoom it sits centred, further in it stops at its edges
  function keepInReach(v) {
    v = v || S.view;
    const hx = S.vw / 2 / v.k, hy = S.vh / 2 / v.k, cx = SH.x0 + SH.w / 2, cy = SH.y0 + SH.h / 2;
    const rx = Math.max(0, SH.w / 2 - hx) + 40 / v.k, ry = Math.max(0, SH.h / 2 - hy) + 40 / v.k;
    v.x = clamp(v.x, cx - rx, cx + rx); v.y = clamp(v.y, cy - ry, cy + ry);
  }
  chartEl.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.ev-card, .ev-zoom, .ev-road')) return;
    try { chartEl.setPointerCapture(e.pointerId); } catch (err) { /* a synthetic pointer has no capture */ }
    pointers.set(e.pointerId, local(e));
    S.tween = null; moved = 0; downAt = local(e);
    if (pointers.size === 1) gesture = { type: 'pan', last: local(e) };
    else if (pointers.size === 2) { const [a, b] = [...pointers.values()]; gesture = { type: 'pinch', dist: Math.hypot(a[0] - b[0], a[1] - b[1]), mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] }; }
    chartEl.classList.add('is-drag');
  });
  chartEl.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    const p = local(e); pointers.set(e.pointerId, p);
    if (!gesture) return;
    if (gesture.type === 'pan' && pointers.size === 1) {
      const dx = p[0] - gesture.last[0], dy = p[1] - gesture.last[1];
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 5) { S.view.x -= dx / S.view.k; S.view.y -= dy / S.view.k; keepInReach(); S.userMoved = true; invalidate(); }
      gesture.last = p;
    } else if (gesture.type === 'pinch' && pointers.size >= 2) {
      const [a, b] = [...pointers.values()], dist = Math.hypot(a[0] - b[0], a[1] - b[1]), mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      S.view.x -= (mid[0] - gesture.mid[0]) / S.view.k; S.view.y -= (mid[1] - gesture.mid[1]) / S.view.k;
      if (gesture.dist > 0) zoomAt(mid[0], mid[1], dist / gesture.dist);
      gesture.dist = dist; gesture.mid = mid; moved += 10; keepInReach();
    }
  });
  const up = (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (pointers.size === 1) gesture = { type: 'pan', last: [...pointers.values()][0] };
    if (pointers.size === 0) {
      chartEl.classList.remove('is-drag');
      if (moved <= 5 && downAt && e.type === 'pointerup') tap(downAt[0], downAt[1]);
      gesture = null;
    }
  };
  chartEl.addEventListener('pointerup', up); chartEl.addEventListener('pointercancel', up);
  chartEl.addEventListener('wheel', (e) => {
    if (e.target.closest('.ev-card, .ev-road')) return;
    e.preventDefault();
    const p = local(e), dy = e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY;
    zoomAt(p[0], p[1], Math.exp(-dy * (e.ctrlKey ? 0.012 : 0.0016)));
  }, { passive: false });
  chartEl.addEventListener('dblclick', (e) => { if (e.target.closest('.ev-card, .ev-zoom, .ev-road')) return; const p = local(e); zoomAt(p[0], p[1], 1.9, 350); });
  function tap(px, py) {
    let best = null, bd = 26 * 26;
    for (const m of S.marks) {
      const d = Math.min((m.lx - px) ** 2 + (m.ly - m.u * 0.5 - py) ** 2, (m.vx - px) ** 2 + (m.vy - py) ** 2);
      if (d < bd) { bd = d; best = m.n; }
    }
    if (best != null) { if (S.journey && S.journey.phase !== 'done') { S.journey.paused = true; S.journey.pausedAt = now(); $('journey').textContent = 'Sail on'; } if (best > S.owned) setOwned(best, { reveal: true }); select(best); }
    else if (!$('card').hidden) select(null);
  }
  chartEl.addEventListener('keydown', (e) => {
    const step = 60 / S.view.k;
    if (e.key === 'ArrowLeft') S.view.x -= step; else if (e.key === 'ArrowRight') S.view.x += step;
    else if (e.key === 'ArrowUp') S.view.y -= step; else if (e.key === 'ArrowDown') S.view.y += step;
    else if (e.key === '+' || e.key === '=') { zoomAt(S.vw / 2, S.vh / 2, 1.4, 200); return; }
    else if (e.key === '-' || e.key === '_') { zoomAt(S.vw / 2, S.vh / 2, 1 / 1.4, 200); return; }
    else if (e.key === '0') { flyTo(homeView(), 500); return; }
    else if (e.key === 'Escape') { select(null); return; }
    else return;
    e.preventDefault(); S.tween = null; S.userMoved = true; keepInReach(); invalidate();
  });
  $('zoomIn').addEventListener('click', () => zoomAt(S.vw / 2, S.vh / 2, 1.6, 260));
  $('zoomOut').addEventListener('click', () => zoomAt(S.vw / 2, S.vh / 2, 1 / 1.6, 260));
  $('zoomFit').addEventListener('click', () => { S.userMoved = false; flyTo(homeView(), 600); });
  $('cardClose').addEventListener('click', () => select(null));
  $('roadToggle').addEventListener('click', () => toggleRoad());
  $('journey').addEventListener('click', toggleJourney);
  $('journeyStop').addEventListener('click', () => { stopJourney(true); S.userMoved = false; flyTo(homeView(), 600); });
  $('owned').addEventListener('input', (e) => {
    stopJourney();
    const n = +e.target.value, grew = n > S.owned;
    if (S.mode !== 'chart') setMode('chart');
    setOwned(n, { reveal: grew });
    select(n, true);
    flyTo(n >= 16 ? homeView() : fitView(ownedBox(), S.vw < 700 ? 22 : 60, 2.8), 700);
  });
  document.querySelectorAll('.ev-seg-opts button').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
  if (mq.addEventListener) mq.addEventListener('change', (e) => { reduced = e.matches; stopJourney(); });
  // the page's theme may change under us: the sheet's shadow follows it
  if (window.MutationObserver) new MutationObserver(invalidate).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ------------------------------------------------------------------ start
  buildRoadList();
  toggleRoad(false);
  setOwned(16);
  if (reduced) $('journey').textContent = 'Next water';
  if (window.ResizeObserver) new ResizeObserver(resize).observe(chartEl); else window.addEventListener('resize', resize);
  resize();
  loadAssets();
  // canvas text does not fetch web fonts by itself: ask for the faces, then letter the chart again
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load(`italic 15px ${F.chart}`), document.fonts.load(`15px ${F.chart}`), document.fonts.load(`12px ${F.display}`), document.fonts.load(`italic 500 15px ${F.body}`), document.fonts.load(`500 15px ${F.body}`), document.fonts.load(`15px ${F.hand}`)]).catch(() => {}).then(() => { fontsReady = true; widths.clear(); invalidate(); });
    if (document.fonts.ready) document.fonts.ready.then(() => { fontsReady = true; widths.clear(); invalidate(); });
  } else fontsReady = true;
  // a hook for the generator's renders
  window.__chart = { setOwned, setMode, select, pick, startJourney, stopJourney, endJourney, state: S, redraw: () => draw(now()), fit: () => { S.userMoved = false; S.view = homeView(); invalidate(); }, look: (box, pad, capK) => { S.userMoved = true; S.view = fitView(box, pad, capK); invalidate(); },
    journeyStill: (n, frac) => { S.journey = null; setOwned(n); const leg = legs[n - 1], p = pointOnLeg(leg, leg.len * frac); S.raft = { x: p.x, y: p.y }; invalidate(); } };
})();
