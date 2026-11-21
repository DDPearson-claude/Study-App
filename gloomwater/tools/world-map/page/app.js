// The Waxwold chart: pan and zoom, the sixteen sheets revealed by "maps owned", a card for each
// water, and a raft that sails the Lamp Road. One canvas: the baked world image under a live layer
// of border, road, lamps, landmark vignettes and lettering, so those stay sharp at every zoom.
(function () {
  'use strict';
  const D = DATA, SH = D.sheet;
  const $ = (id) => document.getElementById(id);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const css = getComputedStyle(document.documentElement);
  const F = {
    display: css.getPropertyValue('--f-display').trim() || 'Georgia, serif',
    chart: css.getPropertyValue('--f-chart').trim() || 'Georgia, serif',
    body: css.getPropertyValue('--f-body').trim() || 'Georgia, serif',
    hand: css.getPropertyValue('--f-hand').trim() || 'cursive',
  };
  // the drawing is chart-draw.js's (src/chart-draw.js, bundled in as ChartDraw): one code for this page and the game's Chart
  const CD = ChartDraw, C = CD.C;
  const INK = `rgb(${C.ink})`, AMBER = `rgb(${C.amber})`;

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
  CD.prepPieces(PC);
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
  const pointOnPiece = CD.pointOnPiece;
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
  const screenSpace = () => ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
  const V = () => CD.chartView({ x: S.view.x, y: S.view.y, k: S.view.k, vw: S.vw, vh: S.vh, dpr: S.dpr });
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
    CD.sheetEdge(ctx, V(), D.edges[S.owned - 1], { whole: S.owned >= 16 });
  }

  // ---- the road: the water first, then a fine amber line inside it
  function drawRoad() {
    const own = [], rest = [];
    PC.forEach((pc, i) => { if (pc.leg <= S.owned) own.push(i); else if (inked()) rest.push(i); });
    // where the owned road runs on into a water not yet bought: a small wisp, no name and no shape
    const j = S.journey;
    const wisp = !inked() && S.owned < 16 && D.wisps[S.owned - 1] && !(j && j.phase !== 'done') ? D.wisps[S.owned - 1] : null;
    CD.road(ctx, V(), PC, { own, rest, bothWays, wisp });
  }

  // ------------------------------------------------------------------ marks: a lamp and a landmark vignette for each water
  // Laid out afresh each frame, in screen px (CD.layoutMarks): a vignette stands at its landmark's true place, stepping aside
  // where it would crowd its own lamp or a neighbour.
  function layoutMarks() {
    const list = [{ n: 0, at: HOME.at, vg: HOME.vg, name: 'The Landing', owned: true }];
    for (const w of W) if (w.n <= S.owned || inked()) list.push({ n: w.n, at: w.at, vg: w.vg, name: w.name, owned: w.n <= S.owned, act: w.act });
    return CD.layoutMarks(V(), list, { fitK: S.fitK, small: S.vw < 700 });
  }
  function drawLamps() {
    screenSpace();
    for (const m of S.marks) {
      if (m.lx < -40 || m.ly < -40 || m.lx > S.vw + 40 || m.ly > S.vh + 40) continue;
      if (m.n === 0) { CD.hearth(ctx, m.lx, m.ly, m.u * 1.15, S.hearthFull); continue; }
      CD.lantern(ctx, m.lx, m.ly, m.u * (S.sel === m.n ? 1.18 : 1), m.owned, S.sel === m.n);
    }
  }
  function drawVignettes() {
    screenSpace();
    for (const m of S.marks) {
      if (m.vx < -60 || m.vy < -60 || m.vx > S.vw + 60 || m.vy > S.vh + 60) continue;
      CD.vignette(ctx, m.n, m.vx, m.vy, m.vs, { owned: m.owned });
    }
  }

  // ------------------------------------------------------------------ lettering
  // One style everywhere: dark ink on a soft reserve of vellum. Placed in screen space, the most
  // important first, never on top of each other, the road, a mark, the page's buttons or the sheet's edge.
  const widths = new Map();
  let fontsReady = false;
  const spacedWidth = (text, font, sp) => CD.spacedWidth(ctx, text, font, sp, fontsReady ? widths : null);
  const inkText = (text, x, y, font, sp, alpha, colour) => CD.inkText(ctx, text, x, y, font, sp, alpha, colour, { dpr: S.dpr, cache: fontsReady ? widths : null }); // centred on x, y
  const handFont = (n, px) => CD.handFont(F, n, px);
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
  function drawFrame() {
    CD.frame(ctx, V(), { SH, WIN, SILL, ACTS, owned: S.owned, inked: inked(), reveal: S.reveal, foldTicks: shown(9) ? FOLD_TICKS : null, F });
  }

  // ---- the raft: a small hull, the Wick and its flame. Never a ring.
  function drawRaft(t) {
    const r = S.raft; if (!r) return;
    screenSpace();
    const z = clamp(0.9 + 0.2 * Math.log2(S.view.k / S.fitK + 1), 1, 1.5) * 1.25;
    CD.raft(ctx, sx(r.x), sy(r.y), z, t, reduced);
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
