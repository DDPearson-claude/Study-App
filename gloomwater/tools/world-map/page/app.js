// The Evenland chart: pan and zoom, the sixteen sheets revealed by "maps owned", a card for
// each water, and a raft that sails the Lamp Road. Everything is drawn on one canvas: the baked
// world image under a live layer of route, lamps, lettering and chart furniture.
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
  };
  const C = { ink: '59,46,68', paper: '238,233,240', amber: '240,162,60', gold: '248,214,136', pale: '222,216,252', deep: '26,24,58', sage: '166,212,160' };

  const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  let reduced = mq.matches;
  const chartEl = $('chart'), cv = $('cv'), ctx = cv.getContext('2d');
  const off = document.createElement('canvas'), octx = off.getContext('2d');
  const maskCv = document.createElement('canvas'), mctx = maskCv.getContext('2d');
  const S = {
    owned: 16, mode: 'inked', sel: null, vw: 0, vh: 0, dpr: 1,
    view: { x: SH.x0 + SH.w / 2, y: SH.y0 + SH.h / 2, k: 0.5 }, fitK: 0.5, userMoved: false,
    reveal: null, // { sheet, t0, ms } while a sheet inks in
    tween: null, journey: null, raft: null, gold: 0, ready: false, world: [], tiles: [],
  };
  const W = D.waters, HOME = D.home, ACTS = D.acts;

  // ------------------------------------------------------------------ geometry of the road
  const legs = D.legs.map((leg) => {
    const pts = []; // [x, y, kind]
    for (const pc of leg.pieces) for (let i = 0; i < pc.p.length; i += 2) {
      if (pts.length && Math.hypot(pts[pts.length - 1][0] - pc.p[i], pts[pts.length - 1][1] - pc.p[i + 1]) < 0.01) continue;
      pts.push([pc.p[i], pc.p[i + 1], pc.k]);
    }
    const s = [0];
    for (let i = 1; i < pts.length; i++) s.push(s[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of pts) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
    return { to: leg.to, pts, s, len: s[s.length - 1], box: [x0, y0, x1, y1], pieces: leg.pieces };
  });
  const pointOnLeg = (leg, d) => {
    const s = leg.s; let lo = 0, hi = s.length - 1;
    d = clamp(d, 0, leg.len);
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (s[m] <= d) lo = m; else hi = m; }
    const t = s[hi] > s[lo] ? (d - s[lo]) / (s[hi] - s[lo]) : 0, a = leg.pts[lo], b = leg.pts[hi];
    return { x: lerp(a[0], b[0], t), y: lerp(a[1], b[1], t), i: lo, kind: b[2], ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
  };
  const piecePath = (pc, path) => { path.moveTo(pc.p[0], pc.p[1]); for (let i = 2; i < pc.p.length; i += 2) path.lineTo(pc.p[i], pc.p[i + 1]); };
  let roadPaths = null;
  const buildRoad = () => {
    const solid = new Path2D(), sea = new Path2D(), haul = new Path2D(), restSolid = new Path2D(), restSea = new Path2D();
    const j = S.journey;
    legs.forEach((leg) => {
      const ownedLeg = leg.to <= S.owned && !(j && j.phase !== 'done' && leg.to === j.leg && j.phase !== 'dwell');
      for (const pc of leg.pieces) {
        if (ownedLeg) piecePath(pc, pc.k === 'sea' ? sea : pc.k === 'haul' ? haul : solid);
        else piecePath(pc, pc.k === 'sea' ? restSea : restSolid);
      }
    });
    roadPaths = { solid, sea, haul, restSolid, restSea };
  };

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
    // the sixteen sheets: grey tiles in one atlas, turned into alpha
    const M = D.masks, atlas = document.createElement('canvas');
    atlas.width = M.tw * M.cols; atlas.height = M.th * M.rows;
    const ax = atlas.getContext('2d'); ax.drawImage(masks, 0, 0);
    for (let k = 0; k < 16; k++) {
      const id = ax.getImageData((k % M.cols) * M.tw, Math.floor(k / M.cols) * M.th, M.tw, M.th), d = id.data;
      for (let i = 0; i < d.length; i += 4) { d[i + 3] = d[i]; d[i] = d[i + 1] = d[i + 2] = 255; }
      const t = document.createElement('canvas'); t.width = M.tw; t.height = M.th; t.getContext('2d').putImageData(id, 0, 0);
      S.tiles.push(t);
    }
    maskCv.width = M.tw; maskCv.height = M.th;
    S.tileAlpha = S.tiles.map((t) => { const d = t.getContext('2d').getImageData(0, 0, M.tw, M.th).data, a = new Uint8Array(M.tw * M.th); for (let i = 0; i < a.length; i++) a[i] = d[i * 4 + 3]; return a; });
    const bin = atob(D.tone.bits); S.tone = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) S.tone[i] = bin.charCodeAt(i);
    S.ready = true;
    $('loading').classList.add('is-done');
    buildMask(); invalidate();
  }
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
  const now = () => performance.now();
  // is the finished chart dark under this point? (sea, forest: letter in pale ink; paper: in dark ink)
  function darkAt(x, y) {
    const M = D.masks, i = clamp(Math.floor((x - SH.x0) / M.unit), 0, M.tw - 1), j = clamp(Math.floor((y - SH.y0) / M.unit), 0, M.th - 1), q = j * M.tw + i;
    if (S.mode !== 'inked') { let a = 0; for (let k = 0; k < S.owned; k++) a = Math.max(a, S.tileAlpha[k][q]); if (a < 110) return false; }
    const T = D.tone, ti = clamp(Math.floor((x - SH.x0) / T.unit), 0, T.w - 1), tj = clamp(Math.floor((y - SH.y0) / T.unit), 0, T.h - 1), tq = tj * T.w + ti;
    return !!(S.tone[tq >> 3] & (1 << (tq & 7)));
  }
  // a name is lettered pale only where nearly all of it lies on dark ground
  const darkUnder = (px, py, w) => { let n = 0; for (const f of [-0.45, -0.22, 0, 0.22, 0.45]) if (darkAt(cxOf(px + f * w), cyOf(py))) n++; return n >= 4; };

  // ------------------------------------------------------------------ the view
  const sx = (x) => (x - S.view.x) * S.view.k + S.vw / 2, sy = (y) => (y - S.view.y) * S.view.k + S.vh / 2;
  const cxOf = (px) => (px - S.vw / 2) / S.view.k + S.view.x, cyOf = (py) => (py - S.vh / 2) / S.view.k + S.view.y;
  function fitView(box, pad, maxK) {
    const bw = Math.max(20, box[2] - box[0]), bh = Math.max(20, box[3] - box[1]);
    const padPx = pad == null ? 28 : pad;
    // leave room for the card on narrow screens
    const cardH = !$('card').hidden && S.vw < 700 ? Math.min($('card').offsetHeight, S.vh * 0.5) : 0;
    const k = Math.min((S.vw - padPx * 2) / bw, (S.vh - cardH - padPx * 2) / bh, maxK || 99);
    return { x: (box[0] + box[2]) / 2, y: (box[1] + box[3]) / 2 + cardH / 2 / k, k: clamp(k, S.fitK * 0.8, 6.5) };
  }
  const sheetBox = () => [SH.x0, SH.y0, SH.x0 + SH.w, SH.y0 + SH.h];
  const homeView = () => (S.vw < 700 ? fitView([62, 70, 1000, 1392], 2) : fitView(sheetBox(), 6));
  function ownedBox() {
    let b = [1e9, 1e9, -1e9, -1e9];
    for (let k = 0; k < S.owned; k++) { const q = D.sheetBox[k]; b = [Math.min(b[0], q[0]), Math.min(b[1], q[1]), Math.max(b[2], q[2]), Math.max(b[3], q[3])]; }
    return b;
  }
  function flyTo(v, ms) {
    v.k = clamp(v.k, S.fitK * 0.8, 6.5);
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
    S.fitK = Math.min((S.vw - 12) / SH.w, (S.vh - 12) / SH.h);
    if (first || !S.userMoved) S.view = homeView();
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
    if (S.goldAnim) { const q = (t - S.goldAnim.t0) / 260; S.gold = Math.min(17, Math.floor(q)); if (S.gold < 17) again = true; else S.goldAnim = null; }
    draw(t);
    if (again) invalidate();
  }
  function pickWorld() {
    const need = S.view.k * S.dpr;
    for (let i = S.world.length - 1; i >= 0; i--) if (S.world[i].bs >= need * 0.92) return S.world[i].img;
    return S.world[0].img;
  }
  function draw(t) {
    const { vw, vh, dpr } = S, k = S.view.k;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, vw, vh);
    if (!S.ready) return;
    const px = sx(SH.x0), py = sy(SH.y0), pw = SH.w * k, ph = SH.h * k;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#d8d2e2'; ctx.fillRect(px, py, pw, ph);
    ctx.restore();
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(S.paper, px, py, pw, ph);
    const src = pickWorld();
    if (S.mode === 'inked') ctx.drawImage(src, px, py, pw, ph);
    else {
      if (S.mode === 'faint') { ctx.globalAlpha = 0.26; ctx.drawImage(src, px, py, pw, ph); ctx.globalAlpha = 1; }
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      octx.globalCompositeOperation = 'source-over';
      octx.clearRect(0, 0, vw, vh);
      octx.imageSmoothingEnabled = true; octx.imageSmoothingQuality = 'high';
      octx.drawImage(src, px, py, pw, ph);
      octx.globalCompositeOperation = 'destination-in';
      octx.drawImage(maskCv, px, py, pw, ph);
      ctx.drawImage(off, 0, 0, vw, vh);
    }
    drawFurniture();
    drawRoad(t);
    drawLamps(t);
    drawLabels();
    drawRaft(t);
  }
  const chartSpace = () => { const k = S.view.k, d = S.dpr; ctx.setTransform(d * k, 0, 0, d * k, d * (S.vw / 2 - S.view.x * k), d * (S.vh / 2 - S.view.y * k)); };
  const screenSpace = () => ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
  const shown = (sheet) => S.mode === 'inked' || (sheet > 0 && sheet <= S.owned);

  // ---- the road
  function drawRoad() {
    if (!roadPaths) buildRoad();
    const k = S.view.k, P = roadPaths;
    chartSpace();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (S.mode === 'inked' && S.owned < 16) {
      ctx.strokeStyle = `rgba(${C.amber},.34)`; ctx.lineWidth = 1.2 / k; ctx.setLineDash([0.1 / k, 4.5 / k]);
      ctx.stroke(P.restSolid); ctx.stroke(P.restSea); ctx.setLineDash([]);
    }
    const gold = S.gold >= 17;
    const col = gold ? C.gold : C.amber;
    // a soft light under the line, then the line
    ctx.strokeStyle = `rgba(${col},.2)`; ctx.lineWidth = 6.5 / k; ctx.stroke(P.solid); ctx.stroke(P.haul);
    ctx.strokeStyle = `rgba(${col},.14)`; ctx.stroke(P.sea);
    ctx.strokeStyle = `rgba(40,24,30,.5)`; ctx.lineWidth = 2.9 / k; ctx.stroke(P.solid);
    ctx.strokeStyle = `rgb(${col})`; ctx.lineWidth = 1.7 / k; ctx.stroke(P.solid);
    ctx.setLineDash([3.2 / k, 3.2 / k]); ctx.lineCap = 'butt'; ctx.lineWidth = 3.4 / k; ctx.strokeStyle = `rgba(40,24,30,.5)`; ctx.stroke(P.haul);
    ctx.lineWidth = 2.4 / k; ctx.strokeStyle = `rgb(${col})`; ctx.stroke(P.haul);
    ctx.lineCap = 'round'; ctx.setLineDash([0.1 / k, 5.2 / k]); ctx.lineWidth = 2.3 / k; ctx.strokeStyle = `rgb(${col})`; ctx.stroke(P.sea);
    ctx.setLineDash([]);
    // the leg being sailed, as far as the raft has come
    const j = S.journey;
    if (j && j.phase === 'sail') {
      const leg = legs[j.leg - 1], pos = pointOnLeg(leg, j.d);
      let kind = null, open = false;
      const flush = () => { if (!open) return; styleFor(kind, k, col); ctx.stroke(); ctx.setLineDash([]); open = false; };
      for (let i = 0; i <= pos.i; i++) {
        const p = leg.pts[i], nk = (leg.pts[i + 1] || p)[2];
        if (nk !== kind) { if (open) { ctx.lineTo(p[0], p[1]); flush(); } kind = nk; ctx.beginPath(); ctx.moveTo(p[0], p[1]); open = true; } else ctx.lineTo(p[0], p[1]);
      }
      if (open) { ctx.lineTo(pos.x, pos.y); flush(); }
    }
    // where the owned road runs on into a water not yet bought
    if (S.mode !== 'inked' && S.owned < 16 && D.wisps[S.owned - 1] && !(j && j.phase === 'sail')) {
      const w = D.wisps[S.owned - 1];
      screenSpace();
      const x = sx(w[0]), y = sy(w[1]), r = clamp(11 * Math.sqrt(k), 10, 26);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(206,196,246,.9)'); g.addColorStop(0.5, 'rgba(196,186,240,.5)'); g.addColorStop(1, 'rgba(196,186,240,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r * 1.5, r, 0, 0, 6.3); ctx.fill();
    }
  }
  function styleFor(kind, k, col) {
    ctx.strokeStyle = `rgb(${col})`;
    if (kind === 'sea') { ctx.setLineDash([0.1 / k, 5.2 / k]); ctx.lineWidth = 2.3 / k; }
    else if (kind === 'haul') { ctx.setLineDash([3.2 / k, 3.2 / k]); ctx.lineWidth = 2.4 / k; }
    else { ctx.setLineDash([]); ctx.lineWidth = 1.7 / k; }
  }

  // ---- lamps: one at each water, one at home
  function lampDot(x, y, r, col, glow) {
    if (glow > 0) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, glow);
      g.addColorStop(0, `rgba(${col},.75)`); g.addColorStop(0.35, `rgba(${col},.3)`); g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, glow, 0, 6.3); ctx.fill();
    }
    ctx.fillStyle = `rgb(${col})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.3); ctx.fill();
    ctx.fillStyle = 'rgba(255,246,222,.9)'; ctx.beginPath(); ctx.arc(x, y, r * 0.42, 0, 6.3); ctx.fill();
  }
  function drawLamps() {
    screenSpace();
    const k = S.view.k, big = clamp(0.8 + 0.35 * Math.log2(k / S.fitK + 1), 0.9, 1.9);
    for (const w of W) {
      const own = w.n <= S.owned;
      if (!own && S.mode !== 'inked') continue;
      const x = sx(w.at[0]), y = sy(w.at[1]);
      if (x < -30 || y < -30 || x > S.vw + 30 || y > S.vh + 30) continue;
      if (!own) { ctx.fillStyle = 'rgba(150,146,200,.9)'; ctx.beginPath(); ctx.arc(x, y, 2.1 * big, 0, 6.3); ctx.fill(); ctx.fillStyle = 'rgba(40,36,80,.9)'; ctx.beginPath(); ctx.arc(x, y, 0.9 * big, 0, 6.3); ctx.fill(); continue; }
      const gold = S.gold > 16 - w.n, sel = S.sel === w.n;
      lampDot(x, y, (sel ? 3.6 : 2.8) * big, gold ? C.gold : C.amber, (sel ? 22 : 12) * big);
    }
    // home: the warmest point on the sheet, and Murk's green lamp beside it
    const hx = sx(HOME.at[0]), hy = sy(HOME.at[1]);
    lampDot(hx, hy, (S.sel === 0 ? 4 : 3.2) * big, S.gold > 16 ? C.gold : '255,186,96', (S.sel === 0 ? 26 : 17) * big);
    lampDot(hx + 5 * big, hy + 3.5 * big, 1.5 * big, C.sage, 5 * big);
    if (S.owned >= 15 || S.mode === 'inked') lampDot(sx(836.5), sy(981.5), 1.4 * big, C.sage, 5 * big);
  }

  // ---- lettering: placed in screen space, most important first, and never on top of each other
  const widths = new Map();
  function spacedWidth(text, font, sp) {
    const key = font + '|' + text;
    let w = widths.get(key);
    if (w == null) { ctx.font = font; w = ctx.measureText(text).width; if (fontsReady) widths.set(key, w); }
    return w + sp * (text.length - 1);
  }
  function drawSpaced(text, x, y, font, sp, fill, halo, haloW) {
    ctx.font = font; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    let cx = x - spacedWidth(text, font, sp) / 2;
    const chars = sp ? Array.from(text) : [text];
    if (halo) { ctx.strokeStyle = halo; ctx.lineWidth = haloW; ctx.lineJoin = 'round'; let hx = cx; for (const ch of chars) { ctx.strokeText(ch, hx, y); hx += ctx.measureText(ch).width + sp; } }
    ctx.fillStyle = fill;
    for (const ch of chars) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + sp; }
  }
  let fontsReady = false;
  function drawLabels() {
    screenSpace();
    const k = S.view.k, zoom = k / S.fitK, placed = [];
    const hit = (r) => { for (const q of placed) if (r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1]) return true; return false; };
    const onScreen = (r) => r[2] > 0 && r[0] < S.vw && r[3] > 0 && r[1] < S.vh;
    const ts = clamp(0.92 + 0.11 * Math.log2(Math.max(1, zoom)), 0.92, 1.5); // lettering grows a little as you zoom in
    const lampR = 5;
    // lamps keep their place first
    const lamps = [{ n: 0, at: HOME.at, name: 'the Landing' }, ...W.filter((w) => w.n <= S.owned || S.mode === 'inked').map((w) => ({ n: w.n, at: w.at, name: w.name, owned: w.n <= S.owned }))];
    for (const l of lamps) { l.x = sx(l.at[0]); l.y = sy(l.at[1]); placed.push([l.x - lampR, l.y - lampR, l.x + lampR, l.y + lampR]); }
    // numerals
    const numFont = `400 ${Math.round(12.5 * ts)}px ${F.display}`;
    for (const l of lamps) {
      if (!l.n) continue;
      const t = String(l.n), w = spacedWidth(t, numFont, 0), h = 12 * ts;
      const opts = [[l.x + 6, l.y - h * 0.95], [l.x - 6 - w, l.y - h * 0.95], [l.x + 6, l.y + 2], [l.x - 6 - w, l.y + 2]];
      for (const o of opts) {
        const r = [o[0] - 1, o[1] - 1, o[0] + w + 1, o[1] + h + 1];
        if (hit(r)) continue;
        placed.push(r); l.num = r;
        ctx.font = numFont; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
        const dk = darkUnder(o[0] + w / 2, o[1] + h / 2, w);
        ctx.lineJoin = 'round'; ctx.strokeStyle = dk ? 'rgba(20,16,40,.85)' : `rgba(${C.paper},.92)`; ctx.lineWidth = 3; ctx.strokeText(t, o[0], o[1]);
        ctx.fillStyle = !l.owned ? (dk ? 'rgba(196,192,236,.95)' : 'rgba(92,86,140,.95)') : dk ? `rgb(${S.gold > 16 - l.n ? C.gold : '255,196,112'})` : 'rgb(158,78,10)'; ctx.fillText(t, o[0], o[1]);
        break;
      }
    }
    // water names (the selected one first)
    const nameFont = `italic 400 ${Math.round(15.5 * ts)}px ${F.chart}`;
    const order = lamps.slice().sort((a, b) => (b.n === S.sel) - (a.n === S.sel) || a.n - b.n);
    for (const l of order) {
      const always = l.n === S.sel;
      if (!always && zoom < 1.25 && S.vw < 700 && l.n && l.n !== S.owned) continue;
      const w = spacedWidth(l.name, nameFont, 0.2), h = 17 * ts, nr = l.num;
      const right = nr && nr[0] > l.x ? nr[2] + 3 : l.x + 8, left = nr && nr[0] < l.x ? nr[0] - 3 - w : l.x - 8 - w;
      const opts = [[right, l.y - h * 0.62], [left, l.y - h * 0.62], [l.x - w / 2, l.y + 8], [l.x - w / 2, l.y - h - 9], [right, l.y + 3], [left, l.y + 3]];
      for (const o of opts) {
        const r = [o[0] - 2, o[1] - 1, o[0] + w + 2, o[1] + h + 1];
        if (hit(r) && !always) continue;
        if (!onScreen(r)) break;
        placed.push(r);
        if (darkUnder(o[0] + w / 2, o[1] + h / 2, w)) drawSpaced(l.name, o[0] + w / 2, o[1] + h / 2, nameFont, 0.2, 'rgba(250,246,255,.98)', 'rgba(22,18,44,.8)', 3.4);
        else drawSpaced(l.name, o[0] + w / 2, o[1] + h / 2, nameFont, 0.2, 'rgba(40,28,50,.98)', `rgba(${C.paper},.9)`, 3.6);
        break;
      }
    }
    // everything else
    const list = D.labels.filter((l) => shown(l.sheet) && k >= l.z);
    const rank = { sea: 0, region: 1, river: 2, place: 3, note: 4 };
    list.sort((a, b) => rank[a.kind] - rank[b.kind]);
    for (const l of list) {
      const x = sx(l.at[0]), y = sy(l.at[1]);
      if (x < -200 || y < -200 || x > S.vw + 200 || y > S.vh + 200) continue;
      if (l.kind === 'river') { riverLabel(l, placed, hit, ts); continue; }
      let font, sp, fill, halo, haloW = 3, text = l.t;
      if (l.kind === 'sea') { const px = (l.small ? 13.5 : 18) * clamp(0.8 + 0.12 * zoom, 0.88, 1.2); font = `italic 400 ${Math.round(px)}px ${F.chart}`; sp = px * (l.small ? 0.14 : 0.3); fill = `rgba(${C.pale},.86)`; halo = `rgba(${C.deep},.35)`; }
      else if (l.kind === 'region') { const px = 11.5 * ts * clamp(0.85 + 0.1 * zoom, 0.9, 1.3); font = `400 ${Math.round(px)}px ${F.display}`; sp = px * 0.34; text = l.t.toUpperCase(); if (darkAt(l.at[0], l.at[1])) { fill = 'rgba(236,232,252,.95)'; halo = 'rgba(14,20,30,.55)'; haloW = 3.4; } else { fill = l.tone === 'ice' ? 'rgba(74,78,150,.92)' : `rgba(${C.ink},.88)`; halo = `rgba(${C.paper},.62)`; haloW = 3.2; } }
      else { const px = (l.kind === 'note' ? 11.5 : 12.5) * ts; font = `italic 400 ${Math.round(px)}px ${F.chart}`; sp = 0.3; if (l.on === 'sea' || darkAt(l.at[0], l.at[1])) { fill = `rgba(${C.pale},.92)`; halo = `rgba(${C.deep},.55)`; } else { fill = `rgba(${C.ink},.95)`; halo = `rgba(${C.paper},.78)`; } }
      const w = spacedWidth(text, font, sp), h = parseFloat(font.match(/(\d+)px/)[1]) * 1.25;
      const a = (l.a || 0) * Math.PI / 180, ca = Math.abs(Math.cos(a)), sa = Math.abs(Math.sin(a));
      const isPoint = l.kind === 'place';
      // a place name sits beside its mark; the rest are centred on their ground
      const spots = isPoint ? [[x + w / 2 + 7, y - 1], [x - w / 2 - 7, y - 1], [x, y - h * 0.9], [x, y + h * 0.9]] : [[x, y]];
      for (const o of spots) {
        const bw = (w * ca + h * sa) / 2 + 2, bh = (w * sa + h * ca) / 2 + 1;
        const subH = l.sub && k >= 0.9 ? 15 * ts : 0;
        const r = [o[0] - bw, o[1] - bh, o[0] + bw, o[1] + bh + subH];
        if (hit(r)) continue;
        if (!onScreen(r)) break;
        placed.push(r);
        ctx.save(); ctx.translate(o[0], o[1]); ctx.rotate(a);
        drawSpaced(text, 0, 0, font, sp, fill, halo, haloW);
        if (subH) drawSpaced(l.sub, 0, h * 0.5 + 8 * ts, `italic 400 ${Math.round(12 * ts)}px ${F.chart}`, 0.2, fill, halo, 3);
        ctx.restore();
        break;
      }
    }
  }
  function riverLabel(l, placed, hit, ts) {
    const font = `italic 400 ${Math.round(12 * ts)}px ${F.chart}`, sp = 1.1 * ts;
    const P = l.path, n = P.length / 2, pts = [];
    for (let i = 0; i < n; i++) pts.push([sx(P[i * 2]), sy(P[i * 2 + 1])]);
    if (pts[n - 1][0] < pts[0][0]) pts.reverse();
    const s = [0];
    for (let i = 1; i < n; i++) s.push(s[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = s[n - 1], w = spacedWidth(l.t, font, sp);
    if (total < w * 1.25) return;
    // centre the name on the label's own point along the course
    const ax = sx(l.at[0]), ay = sy(l.at[1]);
    let bi = 0, bd = 1e12;
    for (let i = 0; i < n; i++) { const d = (pts[i][0] - ax) * (pts[i][0] - ax) + (pts[i][1] - ay) * (pts[i][1] - ay); if (d < bd) { bd = d; bi = i; } }
    let d0 = clamp(s[bi] - w / 2, 2, total - w - 2);
    ctx.font = font;
    const glyphs = []; let d = d0, j = 0;
    for (const ch of Array.from(l.t)) {
      const cw = ctx.measureText(ch).width, mid = d + cw / 2;
      while (j < n - 2 && s[j + 1] < mid) j++;
      const t = (mid - s[j]) / (s[j + 1] - s[j] || 1), a = pts[Math.max(0, j - 1)], b = pts[Math.min(n - 1, j + 2)];
      glyphs.push({ ch, x: lerp(pts[j][0], pts[j + 1][0], t), y: lerp(pts[j][1], pts[j + 1][1], t), ang: Math.atan2(b[1] - a[1], b[0] - a[0]), cw });
      d += cw + sp;
    }
    const rects = [];
    for (let g = 0; g < glyphs.length; g += 2) { const q = glyphs[g]; rects.push([q.x - 7, q.y - 12, q.x + 7, q.y + 4]); }
    for (const r of rects) if (hit(r)) return;
    for (const r of rects) placed.push(r);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    const dk = darkAt(cxOf(glyphs[glyphs.length >> 1].x), cyOf(glyphs[glyphs.length >> 1].y - 8));
    for (const pass of [0, 1]) for (const q of glyphs) {
      ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.ang);
      if (!pass) { ctx.strokeStyle = dk ? 'rgba(14,20,30,.6)' : `rgba(${C.paper},.8)`; ctx.lineWidth = 3; ctx.strokeText(q.ch, 0, -4.5); }
      else { ctx.fillStyle = dk ? 'rgba(232,228,252,.96)' : 'rgba(44,40,96,.96)'; ctx.fillText(q.ch, 0, -4.5); }
      ctx.restore();
    }
  }

  // ---- the chart's own furniture, drawn in chart units so it belongs to the sheet
  function chartText(text, x, y, size, font, fill, sp, align) {
    if (size * S.view.k < 5.2) return false;
    ctx.font = `${font.style || '400'} ${size}px ${font.fam}`; ctx.textBaseline = 'middle'; ctx.fillStyle = fill;
    const chars = Array.from(text); let w = 0;
    for (const ch of chars) w += ctx.measureText(ch).width + (sp || 0);
    w -= sp || 0;
    let cx = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
    ctx.textAlign = 'left';
    for (const ch of chars) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + (sp || 0); }
    return true;
  }
  function drawFurniture() {
    chartSpace();
    const k = S.view.k, ink = (a) => `rgba(${C.ink},${a})`;
    const disp = { fam: F.display }, ital = { fam: F.chart, style: 'italic 400' };
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // title cartouche, bottom left
    const tx = 100, ty = 1368;
    chartText('THE EVENLAND', tx, ty, 21, disp, ink(0.92), 5.4);
    ctx.strokeStyle = ink(0.6); ctx.lineWidth = 0.35;
    ctx.beginPath(); ctx.moveTo(tx - 88, ty + 15); ctx.lineTo(tx - 9, ty + 15); ctx.moveTo(tx + 9, ty + 15); ctx.lineTo(tx + 88, ty + 15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx, ty + 11.5); ctx.lineTo(tx + 3.6, ty + 15); ctx.lineTo(tx, ty + 18.5); ctx.lineTo(tx - 3.6, ty + 15); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx - 88, ty - 17); ctx.lineTo(tx + 88, ty - 17); ctx.lineWidth = 0.2; ctx.stroke();
    chartText('a road chart of the Lamp Road', tx, ty + 27, 8.6, ital, ink(0.85), 0.3);
    chartText('the waters drawn large, the empty miles short', tx, ty + 38.5, 6.4, ital, ink(0.72), 0.2);
    chartText('GLOOMWATER', tx, ty - 26, 6.2, disp, ink(0.62), 3.2);

    // a plain compass rose, and the Waystones' four arcs beside it (WORLD.md §7)
    const rx = 1006, ry = 6, R = 22;
    ctx.strokeStyle = ink(0.8); ctx.lineWidth = 0.3; ctx.fillStyle = ink(0.8);
    ctx.beginPath(); ctx.arc(rx, ry, R * 0.62, 0, 6.3); ctx.stroke();
    for (let q = 0; q < 8; q++) {
      const a = (q * Math.PI) / 4, long = q % 2 === 0 ? R : R * 0.5, wd = q % 2 === 0 ? 2.3 : 1.4;
      ctx.beginPath(); ctx.moveTo(rx + Math.sin(a) * long, ry - Math.cos(a) * long);
      ctx.lineTo(rx + Math.sin(a + 1.57) * wd, ry - Math.cos(a + 1.57) * wd); ctx.lineTo(rx + Math.sin(a - 1.57) * wd, ry - Math.cos(a - 1.57) * wd); ctx.closePath();
      ctx.stroke(); if (q === 0) ctx.fill();
    }
    chartText('N', rx, ry - R - 5.5, 7, disp, ink(0.9), 0);
    const wx = 944, wy = 34;
    for (let arc = 0; arc < 4; arc++) for (let st = 0; st < 4; st++) {
      const n = arc * 4 + st + 1, rad = 9.5 + arc * 7.2, a = (-148 + (116 / 3) * st) * Math.PI / 180;
      const px = wx + Math.cos(a) * rad, py = wy + Math.sin(a) * rad;
      const lit = n <= S.owned, gold = S.gold > 16 - n;
      ctx.beginPath(); ctx.ellipse(px, py, 1.9, 2.4, 0, 0, 6.3);
      if (lit) { ctx.fillStyle = `rgb(${gold ? C.gold : C.amber})`; ctx.shadowColor = `rgba(${C.amber},.9)`; ctx.shadowBlur = 5 * k * S.dpr; ctx.fill(); ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; }
      ctx.strokeStyle = ink(0.75); ctx.lineWidth = 0.28; ctx.stroke();
    }
    chartText('the Waystones', wx, wy + 9, 6.6, ital, ink(0.85), 0.2);
    chartText('one lit for each map bought', wx, wy + 17.5, 5, ital, ink(0.7), 0.15);

    // scale: three rules and a fold, as the chart-makers drew it (WORLD.md §1)
    const bx = 800, by = 1350;
    chartText('SCALE OF THE ROAD', bx + 86, by, 6.6, disp, ink(0.85), 2.6);
    const bar = (y, len, parts, left, right) => {
      ctx.strokeStyle = ink(0.85); ctx.lineWidth = 0.3; ctx.strokeRect(bx + 62, y - 1.3, len, 2.6);
      ctx.fillStyle = ink(0.8); for (let q = 0; q < parts; q += 2) ctx.fillRect(bx + 62 + (len / parts) * q, y - 1.3, len / parts, 2.6);
      chartText(left, bx + 58, y, 6.4, ital, ink(0.85), 0.2, 'right');
      chartText(right, bx + 66 + len, y, 6.4, ital, ink(0.85), 0.2, 'left');
    };
    bar(by + 14, 40, 4, 'the kingdom', '10 km');
    bar(by + 26, 100, 4, 'the north', '100 km');
    bar(by + 38, 100, 4, 'the south', '200 km');
    chartText('the Fold', bx + 58, by + 50, 6.4, ital, ink(0.85), 0.2, 'right');
    ctx.strokeStyle = ink(0.8); ctx.lineWidth = 0.3; ctx.beginPath();
    for (let q = 0; q < 9; q++) { const fx = bx + 63 + q * 5; ctx.moveTo(fx, by + 51); ctx.quadraticCurveTo(fx + 1.25, by + 48, fx + 2.5, by + 50.6); ctx.quadraticCurveTo(fx + 3.7, by + 53, fx + 5, by + 50); }
    ctx.stroke();
    chartText('a hand’s width: 4,500 km', bx + 112, by + 50, 6.4, ital, ink(0.85), 0.2, 'left');

    // true latitudes down the left margin (the Fold swallows forty degrees)
    const lx = SH.x0 + 9;
    ctx.strokeStyle = ink(0.75); ctx.lineWidth = 0.3;
    for (const [y, t] of [[190, '51°N'], [580, '49°N'], [758, '6°N'], [852, '4°N'], [996, '2°N'], [1100, '0°'], [1336, '4°S']]) {
      ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(lx + 5, y); ctx.stroke();
      chartText(t, lx + 7, y, 5.6, ital, ink(0.8), 0.2, 'left');
    }
    ctx.beginPath(); ctx.moveTo(lx + 3, 642); ctx.lineTo(lx + 5.5, 642); ctx.lineTo(lx + 5.5, 738); ctx.lineTo(lx + 3, 738); ctx.stroke();
    ctx.save(); ctx.translate(lx + 11.5, 690); ctx.rotate(-Math.PI / 2); chartText('the Fold: 48° to 7°N', 0, 0, 5.6, ital, ink(0.8), 0.2); ctx.restore();
  }

  // ---- the raft: a small hull and a warm light, never a ring
  function drawRaft(t) {
    const r = S.raft; if (!r) return;
    screenSpace();
    const x = sx(r.x), y = sy(r.y) + (reduced ? 0 : Math.sin(t / 420) * 1.1);
    const fl = reduced ? 1 : 0.92 + 0.08 * Math.sin(t / 97) + 0.05 * Math.sin(t / 41);
    const g = ctx.createRadialGradient(x, y - 5, 0, x, y - 5, 30 * fl);
    g.addColorStop(0, 'rgba(255,214,150,.85)'); g.addColorStop(0.25, 'rgba(250,170,70,.42)'); g.addColorStop(1, 'rgba(250,170,70,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - 5, 30 * fl, 0, 6.3); ctx.fill();
    ctx.fillStyle = 'rgba(30,22,36,.96)';
    ctx.beginPath(); ctx.moveTo(x - 7.5, y - 0.5); ctx.lineTo(x + 7.5, y - 0.5); ctx.lineTo(x + 5.6, y + 2.6); ctx.lineTo(x - 5.6, y + 2.6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(30,22,36,.96)'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(x + 2.5, y - 0.5); ctx.lineTo(x + 2.5, y - 8.5); ctx.stroke();
    // the Wick: a stub of candle and its flame
    ctx.fillStyle = 'rgba(246,238,224,.98)'; ctx.fillRect(x - 3.4, y - 4.6, 2.6, 4.2);
    ctx.fillStyle = 'rgba(255,205,120,1)'; ctx.beginPath(); ctx.moveTo(x - 2.1, y - 9.4 * fl); ctx.quadraticCurveTo(x - 0.3, y - 6.2, x - 2.1, y - 4.8); ctx.quadraticCurveTo(x - 3.9, y - 6.2, x - 2.1, y - 9.4 * fl); ctx.fill();
    ctx.fillStyle = 'rgba(255,186,96,1)'; ctx.beginPath(); ctx.arc(x + 2.5, y - 9.2, 1.5, 0, 6.3); ctx.fill();
  }

  // ------------------------------------------------------------------ the journey
  const caption = (html) => { const el = $('caption'); if (html) { el.innerHTML = html; el.classList.add('is-on'); } else el.classList.remove('is-on'); };
  const legDuration = (leg) => clamp(1100 + leg.len * 19, 1700, 5600);
  const legCaption = (n) => `<b>${n}</b>${W[n - 1].name}. ${W[n - 1].from}`;
  function frameLeg(n, ms) {
    const leg = legs[n - 1], b = leg.box, q = D.sheetBox[n - 1];
    const box = [Math.min(b[0], q[0] + 12), Math.min(b[1], q[1] + 12), Math.max(b[2], q[2] - 12), Math.max(b[3], q[3] - 12)];
    flyTo(fitView(box, S.vw < 700 ? 34 : 70, 6.5), ms);
  }
  function setOwned(n, opts) {
    opts = opts || {};
    const prev = S.owned;
    S.owned = clamp(n, 1, 16);
    $('owned').value = S.owned;
    $('owned').style.setProperty('--fill', ((S.owned - 1) / 15) * 100 + '%');
    $('ownedOut').innerHTML = `${S.owned} of 16<span> · ${W[S.owned - 1].name}</span>`;
    S.reveal = !reduced && opts.reveal && S.owned > prev ? { sheet: S.owned, t0: now(), ms: 950 } : null;
    if (S.gold && !opts.keepGold) { S.gold = 0; S.goldAnim = null; }
    buildMask(); buildRoad(); syncRoadList(); invalidate();
  }
  function startJourney() {
    if (reduced) { stepRoad(); return; }
    S.gold = 0; S.goldAnim = null;
    S.journey = { leg: 1, phase: 'fly', t0: now(), d: 0 };
    S.raft = { x: HOME.at[0], y: HOME.at[1] };
    setOwned(1); select(null);
    beginLeg(1);
    $('journey').textContent = 'Pause';
    invalidate();
  }
  function beginLeg(n) {
    const j = S.journey;
    j.leg = n; j.phase = 'fly'; j.t0 = now(); j.d = 0;
    if (n > 1) setOwned(n, { reveal: true });
    buildRoad();
    caption(legCaption(n));
    frameLeg(n, 950);
  }
  function stepJourney(t) {
    const j = S.journey;
    if (!j || j.paused || j.phase === 'done') return false;
    const leg = legs[j.leg - 1];
    if (j.phase === 'fly') { if (t - j.t0 > 1000) { j.phase = 'sail'; j.t0 = t; } return true; }
    if (j.phase === 'sail') {
      const q = clamp((t - j.t0) / legDuration(leg), 0, 1);
      j.d = leg.len * (q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2);
      const p = pointOnLeg(leg, j.d); S.raft = { x: p.x, y: p.y };
      if (q >= 1) { j.phase = 'dwell'; j.t0 = t; buildRoad(); }
      return true;
    }
    if (j.phase === 'dwell') {
      if (t - j.t0 > 1150) {
        if (j.leg >= 16) { endJourney(); return true; }
        beginLeg(j.leg + 1);
      }
      return true;
    }
    return false;
  }
  function endJourney() {
    const j = S.journey; j.phase = 'done';
    $('journey').textContent = 'Sail again';
    caption('<b>Home</b>The first time the Wick comes home from the Inkwood, the Landing has something like morning.');
    S.goldAnim = { t0: now() };
    flyTo(homeView(), 1800);
    buildRoad(); invalidate();
  }
  function stopJourney(keepCaption) {
    if (!S.journey && !S.raft) return;
    S.journey = null; S.raft = null; S.raftAt = null;
    if (!keepCaption) caption('');
    $('journey').textContent = reduced ? 'Next water' : 'Sail the road';
    buildRoad(); invalidate();
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
    if (S.mode === 'inked') setMode('blank');
    setOwned(n);
    const w = W[n - 1]; S.raft = { x: w.at[0], y: w.at[1] };
    caption(legCaption(n));
    S.view = fitView(n === 1 ? D.sheetBox[0] : ownedBox(), 30, 6.5);
    select(n, true);
    $('journey').textContent = n >= 16 ? 'Start again' : 'Next water';
    invalidate();
  }

  // ------------------------------------------------------------------ the card and the road list
  function select(n, quiet) {
    S.sel = n;
    const card = $('card');
    if (n == null) { card.hidden = true; syncRoadList(); invalidate(); return; }
    const facts = $('cardFacts'); facts.textContent = '';
    const add = (dt, html) => { const a = document.createElement('dt'); a.textContent = dt; const b = document.createElement('dd'); b.innerHTML = html; const w = document.createElement('div'); w.append(a, b); facts.append(w); };
    if (n === 0) {
      $('cardKicker').textContent = 'Home';
      $('cardName').textContent = HOME.name;
      $('cardMeta').textContent = `${HOME.kind} · ${HOME.lat}`;
      $('cardStory').textContent = HOME.story;
      add('The mist and the Waystones', HOME.more);
      $('cardMurk').hidden = true;
    } else {
      const w = W[n - 1], act = ACTS[w.act];
      $('cardKicker').textContent = `${w.n} of 16 · Act ${act.n}, ${act.title}`;
      $('cardName').textContent = w.name;
      $('cardMeta').textContent = `${w.kind}, ${w.detail} · ${w.lat} · green step ${w.step} of 15`;
      $('cardStory').textContent = w.story;
      add('Its legend', `<b>${w.legend}.</b> <i>${w.legendLine}</i>`);
      add('How you got here', w.from);
      const m = $('cardMurk');
      if (w.murk) { m.hidden = false; m.innerHTML = `“${w.murk}”<span>Old Murk, selling the map</span>`; } else m.hidden = true;
    }
    card.hidden = false; card.scrollTop = 0;
    syncRoadList();
    if (!quiet) {
      const at = n === 0 ? HOME.at : W[n - 1].at, box = n === 0 ? [560, 150, 640, 262] : D.sheetBox[n - 1];
      const v = fitView(box, S.vw < 700 ? 30 : 80, 5.5);
      // keep the water itself in view, clear of the card
      v.x = lerp(v.x, at[0], 0.5); v.y = lerp(v.y, at[1], 0.35) + (S.vw < 700 ? 0 : 0);
      flyTo(v, 900);
    }
    invalidate();
  }
  function buildRoadList() {
    const root = $('roadList');
    const row = (n, name, kind) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'ev-water'; b.dataset.n = n;
      b.innerHTML = `<span class="n">${n || '◆'}</span><span class="name"></span><span class="kind"></span>`;
      b.children[1].textContent = name; b.children[2].textContent = kind;
      b.addEventListener('click', () => { if (!wide.matches) toggleRoad(false); pick(n); });
      const li = document.createElement('li'); li.append(b); return li;
    };
    const home = document.createElement('ol'); home.append(row(0, HOME.name, 'home, where every evening starts')); root.append(home);
    ACTS.forEach((a, i) => {
      const box = document.createElement('div'); box.className = 'ev-act';
      const h = document.createElement('h3'); h.className = 'ev-act-name'; h.innerHTML = `<span>${a.n}</span>`; h.append(a.title);
      const sub = document.createElement('p'); sub.className = 'ev-act-sub'; sub.textContent = `${a.reach} · ${a.hand}`;
      const ol = document.createElement('ol');
      W.filter((w) => w.act === i).forEach((w) => ol.append(row(w.n, w.name, `${w.kind}, ${w.detail}`)));
      box.append(h, sub, ol); root.append(box);
    });
  }
  function syncRoadList() {
    document.querySelectorAll('.ev-water').forEach((b) => {
      const n = +b.dataset.n;
      b.classList.toggle('is-sealed', n > S.owned);
      if (n === S.sel) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
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
    S.mode = m;
    document.querySelectorAll('.ev-seg-opts button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
    invalidate();
  }

  // ------------------------------------------------------------------ input
  const pointers = new Map();
  let gesture = null, moved = 0, downAt = null;
  const local = (e) => { const r = chartEl.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  function zoomAt(px, py, factor, ms) {
    const k = clamp(S.view.k * factor, S.fitK * 0.8, 6.5), cx = cxOf(px), cy = cyOf(py);
    const v = { k, x: cx - (px - S.vw / 2) / k, y: cy - (py - S.vh / 2) / k };
    S.userMoved = true;
    if (ms) flyTo(v, ms); else { S.tween = null; S.view = v; invalidate(); }
  }
  function keepInReach() {
    const v = S.view, mx = S.vw / 2 / v.k, my = S.vh / 2 / v.k;
    v.x = clamp(v.x, SH.x0 - mx * 0.6, SH.x0 + SH.w + mx * 0.6); v.y = clamp(v.y, SH.y0 - my * 0.6, SH.y0 + SH.h + my * 0.6);
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
    const cand = [{ n: 0, at: HOME.at }, ...W.filter((w) => w.n <= S.owned || S.mode === 'inked')];
    for (const c of cand) { const d = (sx(c.at[0]) - px) ** 2 + (sy(c.at[1]) - py) ** 2; if (d < bd) { bd = d; best = c.n; } }
    if (best != null) { if (S.journey && S.journey.phase !== 'done') { S.journey.paused = true; S.journey.pausedAt = now(); $('journey').textContent = 'Sail on'; } pick2(best); }
    else if (!$('card').hidden) select(null);
  }
  function pick2(n) { if (n > S.owned) setOwned(n, { reveal: true }); select(n); }
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
  $('owned').addEventListener('input', (e) => {
    stopJourney();
    const n = +e.target.value, grew = n > S.owned;
    if (S.mode === 'inked') setMode('blank');
    setOwned(n, { reveal: grew });
    select(n, true);
    flyTo(fitView(ownedBox(), S.vw < 700 ? 22 : 60, 6), 700);
  });
  document.querySelectorAll('.ev-seg-opts button').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
  if (mq.addEventListener) mq.addEventListener('change', (e) => { reduced = e.matches; stopJourney(); });

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
    Promise.all([document.fonts.load(`italic 15px ${F.chart}`), document.fonts.load(`12px ${F.display}`)]).catch(() => {}).then(() => { fontsReady = true; widths.clear(); invalidate(); });
    if (document.fonts.ready) document.fonts.ready.then(() => { fontsReady = true; widths.clear(); invalidate(); });
  } else fontsReady = true;
  // a hook for the generator's renders
  window.__chart = { setOwned, setMode, select, pick, startJourney, stopJourney, state: S, fit: () => { S.view = homeView(); invalidate(); }, look: (box, pad, maxK) => { S.userMoved = true; S.view = fitView(box, pad, maxK); invalidate(); },
    journeyStill: (n, frac) => { S.journey = null; setOwned(n); const leg = legs[n - 1], p = pointOnLeg(leg, leg.len * frac); S.raft = { x: p.x, y: p.y }; invalidate(); } };
})();
