// ui-tow.js — the tow's Chart (M1 step 5b, LANE 5B-TOW; docs/loop/OPENING.md §6.2 rev. 5, SPEC §6.5, M1.md §2.1, §3.5). The view
// half of the one tow component (src/loop-tow.js is the director): a full screen in flow `home` that draws the Chart's first sheet
// in its own ink (the bake, src/chart-art.js, and the live layer, src/chart-draw.js, as the drawn Chart draws them), closed in on
// the Landing in the opening (the arch, the old barge-house moored in the cove with its stove's banked glow in the windows and the
// dozing candles by it, Murk's barge alongside with its green lamp, the Wick's mark kindling aboard), then the leg: the view follows
// the water's piece of the road, the raft's mark towing the barge's on a line, Murk's alongside, the road inking behind them and,
// in the opening, the water's sheet inking in as they arrive. Murk's wake line is the only word (TEXT_LOOP.murk.wake). The ink dip
// is this view's overlay too. Never a ring or a disc round the raft, the Wick or the barge.
//
//   createTowView(K) → {open({water, opening, onTap}), paint(state), dip(alpha), close(), isTop(), prepare(), debug()}
//   pure (node: tools/tests/loop-tow.test.mjs): towFrame(W, H, phone) · legPoint(piece, s, reverse) · towMarks(piece, u, reverse)
import { chartView, prepPieces, pointOnPiece, road, lantern, deckle, ease, C, clamp } from './chart-draw.js';
import { CHART_ART } from './chart-art.js';
import { icon } from './ui-icons.js';

const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const lerp = (a, b, t) => a + (b - a) * t;
const INK_RGB = '10,12,25';   // the opening's ink (INTRO.colors.ink), the dip's colour
const LANDING = { at: [600, 190], arch: [600.5, 181.5], view: [599.5, 195], end: [588, 236] };

/** The sheet's rectangle on the screen (CSS px): the vellum laid on the dark, Murk's line above it. Pure. */
export function towFrame(W, H, phone = W < 560 || W < H) {
  const side = phone ? 16 : Math.max(28, Math.round(W * 0.05));
  const top = phone ? Math.round(Math.min(190, H * 0.2)) : Math.round(Math.max(84, H * 0.17));
  const bottom = phone ? 28 : 26;
  return { x: side, y: top, w: Math.max(80, W - 2 * side), h: Math.max(80, H - top - bottom), phone };
}
/** A point s chart units along a piece, from its start (or from its end when `reverse`): {x, y, ang} (ang: the way travelled). Pure. */
export function legPoint(pc, s, reverse = false) {
  const L = pc.len, d = clamp(reverse ? L - s : s, 0, L);
  const p = pointOnPiece(pc, d);
  return { x: p.x, y: p.y, ang: reverse ? p.ang + Math.PI : p.ang };
}
/** The marks along the leg at progress u: the raft leads, the barge `gap` units behind it on the line, Murk alongside. Pure. */
export function towMarks(pc, u, reverse = false, { gap = 6, side = 3.2 } = {}) {
  const L = pc.len, sr = lerp(gap * 0.8, L - 1.5, clamp(u, 0, 1)), sb = Math.max(0, sr - gap);
  const raft = legPoint(pc, sr, reverse), barge = legPoint(pc, sb, reverse);
  const nx = -Math.sin(barge.ang), ny = Math.cos(barge.ang);
  return { raft, barge, murk: { x: barge.x + nx * side, y: barge.y + ny * side, ang: barge.ang }, sr, sb, L };
}

export function createTowView(K) {
  const { ctx, h } = K;
  const D = () => K.D?.() || ctx.data || {};
  const report = (w, e) => { try { K.report?.(`tow.${w}`, e); } catch { /* ignore */ } };
  const S = { art: null, status: 'idle', entry: null, cv: null, line: null, onTap: null, water: null, opening: false, dipEl: null, mask: null, sheet: null, paints: 0, last: null };

  // ---- the bake and its paper, decoded once in idle time (the drawn Chart decodes its own; this is the tow's copy)
  const decode = async (uri) => {
    if (typeof createImageBitmap === 'function' && typeof fetch === 'function') return createImageBitmap(await (await fetch(uri)).blob());
    const img = new Image(); img.src = uri; await img.decode(); return img;
  };
  async function prepare() {
    if (S.status !== 'idle') return S.status;
    S.status = 'loading';
    try {
      const A = CHART_ART, first = A?.sheets?.[0];
      if (!first) throw new Error('no chart art');
      const [image, paper] = await Promise.all([decode(first.uri), A.paper ? decode(A.paper.uri) : null]);
      S.art = { box: first.box, image, paper };
      if (A.live?.pieces && !A.live.pieces[0]?.pts) prepPieces(A.live.pieces);
      S.status = 'ready';
    } catch (e) { S.status = 'failed'; report('decode', e); }
    return S.status;
  }
  try {
    const idle = typeof requestIdleCallback === 'function' ? (f) => requestIdleCallback(f, { timeout: 3000 }) : (f) => setTimeout(f, 0);
    setTimeout(() => idle(() => { prepare(); }), 900);
  } catch (e) { report('prepare', e); }

  // ---- its own few styles (the screen, the line over the sheet, the dip), kept here so the tow is one module
  function styles() {
    if (typeof document === 'undefined' || document.getElementById('gw-tow-css')) return;
    const st = document.createElement('style');
    st.id = 'gw-tow-css';
    st.textContent = `
.gw-m-tow .gw-modal-body { position: absolute; inset: 0; padding: 0; align-items: stretch; }
.gw-tow { position: absolute; inset: 0; background: rgb(20,16,40); pointer-events: auto; }
.gw-tow-cv { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.gw-tow-say { position: absolute; left: 0; right: 0; display: flex; justify-content: center; padding: 0 16px; pointer-events: none; }
.gw-tow-say .gw-murk-line { max-width: min(76ch, 92vw); }
.gw-tow-dip { position: fixed; inset: 0; background: rgb(${INK_RGB}); opacity: 0; pointer-events: none; z-index: 60; }
.gw-tow .gw-loop-pauseglyph { z-index: 3; }`;
    document.head.appendChild(st);
  }

  function open({ water = 'mossmere', opening = false, onTap = null } = {}) {
    styles();
    if (S.status === 'idle') prepare();
    S.water = water; S.opening = opening; S.onTap = onTap; S.line = null; S.last = null;
    const entry = K.openModal('tow', (en, body) => {
      const wrap = h('div', 'gw-tow');
      wrap.dataset.loop = 'tow';
      wrap.dataset.water = water;
      wrap.innerHTML = `<canvas class="gw-tow-cv" aria-hidden="true"></canvas>
        <button type="button" class="gw-hbtn gw-hb-pause gw-loop-pauseglyph" data-loop="homepause">${icon('pause')}</button>
        <div class="gw-tow-say"><p class="gw-murk-line"></p></div>`;
      body.appendChild(wrap);
      S.cv = wrap.querySelector('canvas');
      wrap.querySelector('[data-loop=homepause]').addEventListener('click', (e) => { e.stopPropagation(); K.sfx?.('ui_click'); K.loop?.openHomePause?.(); });
      wrap.addEventListener('click', () => { try { S.onTap?.(); } catch (e) { report('tap', e); } });
    }, { screen: true, blocking: true, dismissable: false, cls: 'gw-m-tow', focus: false,
      onEscape: () => K.loop?.openHomePause?.(),
      onKey: (code) => { if (code === 'Enter' || code === 'NumpadEnter' || code === 'Space') { try { S.onTap?.(); } catch (e) { report('key', e); } return true; } return false; } });
    S.entry = entry;
    return !!entry;
  }
  function close() {
    try { K.closeModal('tow', { instant: true }); } catch (e) { report('close', e); }
    S.entry = null; S.cv = null;
  }
  const isTop = () => K.top?.()?.id === 'tow';
  /** The tow's screen is on the stack (under a pause or Settings too). */
  const isOpen = () => !!S.entry && (typeof K.has === 'function' ? K.has('tow') : true);
  function dip(a) {
    if (typeof document === 'undefined') return;
    if (!S.dipEl) { styles(); S.dipEl = h('div', 'gw-tow-dip'); S.dipEl.setAttribute('aria-hidden', 'true'); (K.root || document.body).appendChild(S.dipEl); }
    S.dipEl.style.opacity = String(clamp(num(a, 0), 0, 1));
  }

  // ---- the line (Murk's wake line: the tutorial's words, shown once it is said)
  function setLine(text, frame) {
    const el = S.entry?.el?.querySelector('.gw-tow-say'), p = el?.querySelector('.gw-murk-line');
    if (!p) return;
    if (frame) el.style.top = `${Math.max(8, Math.round(frame.y * 0.5 - 30))}px`;
    if ((text || null) === S.line) return;
    S.line = text || null;
    p.textContent = S.line || '';
    p.classList.toggle('gw-in', !!S.line);
  }

  // ---- the drawing
  const piece = (id) => (CHART_ART?.live?.pieces || []).find((p) => p.id === id) || null;
  function paint(st = {}) {
    const cv = S.cv;
    if (!cv || !cv.isConnected) return null;
    const W = Math.max(1, Math.round(cv.clientWidth || innerWidth)), H = Math.max(1, Math.round(cv.clientHeight || innerHeight));
    const dpr = Math.min(2, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1);
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const g = cv.getContext('2d');
    const F = towFrame(W, H);
    setLine(st.line || null, F);
    const legD = D()?.LOOP?.tow?.legs?.[st.water || S.water] || null;
    const pc = legD ? piece(legD.piece) : null;
    if (pc && !pc.pts) prepPieces([pc]);
    const u = clamp(num(st.u, 0), 0, 1), ink = clamp(num(st.ink, 1), 0, 1), kin = clamp(num(st.kindle, 1), 0, 1), t = num(st.t, 0) * 1000;
    const eu = ease(u);
    // the view: closed in on the Landing, opening out down the leg to the water
    const k0 = Math.min(F.w / 74, F.h / 50), k = lerp(k0 * 1.3, k0 * 0.62, eu);   // (closed in on the Landing, out to the water)
    const cx = lerp(LANDING.view[0], LANDING.end[0], eu), cy = lerp(LANDING.view[1], LANDING.end[1], eu);
    const V = chartView({ x: cx, y: cy, k, vw: W, vh: H, dpr, ox: F.x + F.w / 2, oy: F.y + F.h / 2 });
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    // the sheet of vellum on the dark
    g.save(); g.shadowColor = 'rgba(4,2,12,.6)'; g.shadowBlur = 18; g.shadowOffsetY = 4;
    deckle(g, F.x, F.y, F.w, F.h, 5, 1.6); g.fillStyle = 'rgb(226,220,226)'; g.fill(); g.restore();
    g.save(); deckle(g, F.x, F.y, F.w, F.h, 5, 1.6); g.clip();
    const paper = S.art?.paper;
    if (paper) { const sc = Math.max(F.w / paper.width, F.h / paper.height); g.globalAlpha = 0.85; g.drawImage(paper, F.x + (F.w - paper.width * sc) / 2, F.y + (F.h - paper.height * sc) / 2, paper.width * sc, paper.height * sc); g.globalAlpha = 1; }
    const wash = g.createLinearGradient(0, F.y, 0, F.y + F.h); wash.addColorStop(0, 'rgba(176,166,224,.16)'); wash.addColorStop(1, 'rgba(176,166,224,.04)');
    g.fillStyle = wash; g.fillRect(F.x, F.y, F.w, F.h);
    const M = pc ? towMarks(pc, u, legD.reverse === true) : null;
    // the first sheet's bake, inked where the tow has been (the Landing, the way behind the raft) and, as they arrive, all of it
    if (S.art?.image) drawSheet(g, V, W, H, dpr, pc, legD, M, ink);
    // the road: the way travelled in its amber line, the rest of it as the sheet inks in
    if (pc && M) {
      const rev = legD.reverse === true, from = rev ? pc.len - M.sr : 0, to = rev ? pc.len : M.sr;
      const sub = subPiece(pc, from, to);
      if (ink > 0.02) road(g, V, [pc], { own: [0], alpha: ink * 0.9 });
      if (sub) road(g, V, [sub], { own: [0], alpha: 1 });
      V.screenSpace(g);
    }
    // the water's lantern, lit as its sheet inks in
    const wat = (CHART_ART?.live?.waters || []).find((w) => w.water === (st.water || S.water));
    const u0 = clamp(k * 0.55, 5.2, 9);
    if (wat && ink > 0.02) { g.save(); g.globalAlpha = ink; lantern(g, V.sx(wat.at[0]), V.sy(wat.at[1]), u0, ink > 0.6, false); g.restore(); }
    // the arch over the cove (the opening's Landing)
    if (st.opening || S.opening) archMark(g, V.sx(LANDING.arch[0]), V.sy(LANDING.arch[1]), clamp(k / 6.5, 0.8, 2.2));
    if (M) {
      const z = clamp(k / 5.5, 0.9, 2);
      const bx = V.sx(M.barge.x), by = V.sy(M.barge.y), rx = V.sx(M.raft.x), ry = V.sy(M.raft.y);
      // the tow line: from the raft's stern to the barge's bow, a little slack in it
      const ba = M.barge.ang, bowX = bx + Math.cos(ba) * 21 * z, bowY = by + Math.sin(ba) * 21 * z;
      const ra = M.raft.ang, sternX = rx - Math.cos(ra) * 8 * z, sternY = ry - Math.sin(ra) * 8 * z;
      g.save(); g.strokeStyle = `rgba(${C.ink},.85)`; g.lineWidth = Math.max(1, 1.1 * z); g.lineCap = 'round';
      g.beginPath(); g.moveTo(bowX, bowY); g.quadraticCurveTo((bowX + sternX) / 2 + 2 * z, (bowY + sternY) / 2 + 3 * z, sternX, sternY); g.stroke(); g.restore();
      murkMark(g, V.sx(M.murk.x), V.sy(M.murk.y), M.murk.ang, z);
      bargeMark(g, bx, by, ba, z, t, !!st.reduced);
      raftMark(g, rx, ry, ra, z, kin, t, !!st.reduced);
    }
    g.restore();
    S.paints++;
    S.last = { W, H, k: Math.round(k * 100) / 100, u, ink, kindle: kin, frame: F, art: !!S.art?.image, raft: M ? [Math.round(V.sx(M.raft.x)), Math.round(V.sy(M.raft.y))] : null };
    return S.last;
  }
  function subPiece(pc, a, b) {
    if (!(b - a > 0.3)) return null;
    const p = [];
    for (let d = a; d < b; d += 1) { const q = pointOnPiece(pc, d); p.push(q.x, q.y); }
    const e = pointOnPiece(pc, b); p.push(e.x, e.y);
    const sub = { id: 'tow-sub', k: pc.k, flow: pc.flow, wide: pc.wide, p };
    prepPieces([sub]);
    return sub;
  }
  function drawSheet(g, V, W, H, dpr, pc, legD, M, ink) {
    const box = S.art.box, img = S.art.image;
    const w = Math.round(W * dpr), hh = Math.round(H * dpr);
    const mk = (c) => { if (!c || c.width !== w || c.height !== hh) { c = document.createElement('canvas'); c.width = w; c.height = hh; } return c; };
    S.mask = mk(S.mask); S.sheet = mk(S.sheet);
    const m = S.mask.getContext('2d'), s = S.sheet.getContext('2d');
    m.setTransform(1, 0, 0, 1, 0, 0); m.clearRect(0, 0, w, hh);
    m.setTransform(dpr, 0, 0, dpr, 0, 0);
    const blob = (x, y, r, a = 1) => { const gr = m.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(0.55, `rgba(0,0,0,${a * 0.85})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); m.fillStyle = gr; m.beginPath(); m.arc(x, y, r, 0, 6.3); m.fill(); };
    if (S.opening) blob(V.sx(LANDING.at[0]), V.sy(LANDING.at[1] - 3), 30 * V.k);
    if (pc && M) for (let d = 0; d <= M.sr; d += 2.5) { const p = legPoint(pc, d, legD.reverse === true); blob(V.sx(p.x), V.sy(p.y), 15 * V.k); }
    if (ink > 0) { m.fillStyle = `rgba(0,0,0,${ink})`; m.fillRect(0, 0, W, H); }
    s.setTransform(1, 0, 0, 1, 0, 0); s.clearRect(0, 0, w, hh); s.globalCompositeOperation = 'source-over';
    s.setTransform(dpr, 0, 0, dpr, 0, 0);
    s.imageSmoothingEnabled = true; s.imageSmoothingQuality = 'high';
    s.drawImage(img, V.sx(box[0]), V.sy(box[1]), box[2] * V.k, box[3] * V.k);
    s.setTransform(1, 0, 0, 1, 0, 0); s.globalCompositeOperation = 'destination-in'; s.drawImage(S.mask, 0, 0); s.globalCompositeOperation = 'source-over';
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(S.sheet, 0, 0); g.restore();
  }

  // ---- the marks, in the Chart's ink: outlined in vellum first, so each reads on water and land alike
  const INK = `rgb(${C.ink})`, STONE = `rgb(${C.stone})`, AMBER = `rgb(${C.amber})`, HALO = `rgba(${C.paper},.9)`;
  function shape(g, build, fill, lw = 1) {
    g.beginPath(); build();
    g.strokeStyle = HALO; g.lineWidth = lw + 2.4; g.stroke();
    if (fill) { g.fillStyle = fill; g.fill(); }
    g.strokeStyle = INK; g.lineWidth = lw; g.stroke();
  }
  function archMark(g, x, y, s) {   // the cove's arch: two stone piers and the broken arc between them
    g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round';
    shape(g, () => g.rect(-14, -6, 4, 16), STONE, 1);
    shape(g, () => g.rect(9, -2, 4, 12), STONE, 1);
    shape(g, () => { g.arc(-0.5, -4, 11.5, Math.PI * 1.02, Math.PI * 1.46); }, null, 1.6);
    shape(g, () => { g.arc(-0.5, -4, 11.5, Math.PI * 1.6, Math.PI * 1.95); }, null, 1.6);
    g.restore();
  }
  function bargeMark(g, x, y, ang, z, t, rm) {   // the Slow Hearth: the long low hull, the cabin, its windows' banked glow, the pipe
    g.save(); g.translate(x, y); g.rotate(ang); g.scale(z, z); g.lineJoin = 'round'; g.lineCap = 'round';
    shape(g, () => { g.moveTo(-20, -4); g.lineTo(17, -4); g.quadraticCurveTo(23, -3.4, 21, 0.5); g.quadraticCurveTo(19, 4.2, 15, 4.4); g.lineTo(-19, 4.4); g.quadraticCurveTo(-21.5, 0, -20, -4); }, 'rgb(104,78,64)', 1);
    shape(g, () => g.rect(-12, -3.2, 21, 6.4), 'rgb(132,104,92)', 0.9);
    shape(g, () => { g.moveTo(-14, -3.8); g.lineTo(11, -3.8); g.moveTo(-14, 3.8); g.lineTo(11, 3.8); }, null, 0.8);
    const fl = rm ? 1 : 0.86 + 0.1 * Math.sin(t / 310) + 0.04 * Math.sin(t / 97);
    g.fillStyle = `rgba(250,182,86,${0.92 * fl})`;
    for (const wx of [-9, -3, 3]) { g.fillRect(wx, -1.4, 2.8, 2.8); }
    g.strokeStyle = INK; g.lineWidth = 0.6; for (const wx of [-9, -3, 3]) g.strokeRect(wx, -1.4, 2.8, 2.8);
    shape(g, () => g.rect(5.5, -6.6, 2, 3.2), 'rgb(58,46,60)', 0.6);
    // the dozing candles by the stove's door: three small stubs at the stern, their flames low
    for (let i = 0; i < 3; i++) {
      const cx = -18 + i * 2.2, cy = -1.2 + (i % 2) * 1.6;
      g.fillStyle = 'rgb(244,236,222)'; g.fillRect(cx - 0.6, cy - 0.2, 1.2, 1.8); g.strokeStyle = INK; g.lineWidth = 0.4; g.strokeRect(cx - 0.6, cy - 0.2, 1.2, 1.8);
      g.fillStyle = `rgba(246,168,70,${0.55 + 0.15 * Math.sin(t / 420 + i * 1.7) * (rm ? 0 : 1)})`; g.beginPath(); g.ellipse(cx, cy - 0.9, 0.45, 0.7, 0, 0, 6.3); g.fill();
    }
    g.restore();
  }
  function murkMark(g, x, y, ang, z) {   // Murk's barge: the lily pad, the old toad and his towering pack, the green lamp on its pole
    g.save(); g.translate(x, y); g.rotate(ang + Math.PI / 2); g.scale(z * 1.5, z * 1.5); g.lineJoin = 'round'; g.lineCap = 'round';
    shape(g, () => g.ellipse(0, 3, 5.6, 1.7, 0, 0, 6.3), 'rgb(116,132,100)', 0.8);
    shape(g, () => { g.moveTo(-3.4, 2.6); g.quadraticCurveTo(-4.2, -0.4, -2, -0.4); g.quadraticCurveTo(-0.2, -0.2, -0.4, 2.6); g.closePath(); }, 'rgb(116,92,76)', 0.7);
    shape(g, () => { g.moveTo(-0.2, 2.6); g.lineTo(-0.5, -8.6); g.lineTo(1, -10.2); g.lineTo(2.8, -8.6); g.lineTo(2.7, 2.6); g.closePath(); }, 'rgb(196,176,150)', 0.7);
    shape(g, () => { g.moveTo(4, 2.8); g.lineTo(4.6, -2.8); }, null, 0.6);
    g.fillStyle = `rgb(${C.sage})`; g.beginPath(); g.arc(4.7, -3.5, 1.05, 0, 6.3); g.fill();
    g.restore();
  }
  function raftMark(g, x, y, ang, z, kindle, t, rm) {   // the raft, the Wick on it and its candle head (kindling: no flame until lit)
    const fl = rm ? 1 : 0.92 + 0.08 * Math.sin(t / 97) + 0.05 * Math.sin(t / 41);
    g.save(); g.translate(x, y); g.scale(z, z);
    if (kindle > 0.02) {   // the Wick's own light, soft and edgeless (the built chart raft's, grown with its flame)
      const r = 22 * fl * kindle, gr = g.createRadialGradient(0, -9, 0, 0, -9, Math.max(1, r));
      gr.addColorStop(0, `rgba(255,214,150,${0.85 * kindle})`); gr.addColorStop(0.25, `rgba(250,170,70,${0.38 * kindle})`); gr.addColorStop(1, 'rgba(250,170,70,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(0, -9, Math.max(1, r), 0, 6.3); g.fill();
    }
    g.rotate(Math.cos(ang) < 0 ? 0 : 0);
    g.lineJoin = 'round'; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-8.5, -0.5); g.lineTo(8.5, -0.5); g.lineTo(6.6, 3); g.lineTo(-6.6, 3); g.closePath();
    g.strokeStyle = HALO; g.lineWidth = 2.6; g.stroke(); g.fillStyle = 'rgb(96,72,60)'; g.fill(); g.strokeStyle = 'rgb(34,24,36)'; g.lineWidth = 1; g.stroke();
    g.beginPath(); g.moveTo(5.2, -0.5); g.lineTo(5.2, -9.5); g.strokeStyle = 'rgb(34,24,36)'; g.lineWidth = 1.1; g.stroke();
    g.beginPath(); g.arc(5.2, -10.6, 1.7, 0, 6.3); g.fillStyle = kindle > 0.5 ? 'rgb(255,190,100)' : 'rgb(150,128,118)'; g.fill(); g.strokeStyle = 'rgb(96,44,10)'; g.lineWidth = 0.6; g.stroke();
    g.beginPath(); g.rect(-3.6, -6.2, 3.6, 5.7); g.fillStyle = 'rgb(248,240,226)'; g.fill(); g.strokeStyle = 'rgb(34,24,36)'; g.lineWidth = 0.8; g.stroke();
    if (kindle > 0.02) {   // the flame catching, as in the film
      const fh = 6.8 * kindle * fl;
      g.beginPath(); g.moveTo(-1.8, -6.6 - fh); g.bezierCurveTo(0.9, -6.6 - fh * 0.5, 0.4, -6.6, -1.8, -6.6); g.bezierCurveTo(-4, -6.6, -4.5, -6.6 - fh * 0.5, -1.8, -6.6 - fh);
      g.fillStyle = 'rgb(255,186,84)'; g.fill(); g.strokeStyle = 'rgb(120,56,8)'; g.lineWidth = 0.6; g.stroke();
      g.beginPath(); g.ellipse(-1.8, -6.6 - fh * 0.27, 0.9 * kindle, 1.4 * kindle, 0, 0, 6.3); g.fillStyle = 'rgba(255,246,220,.95)'; g.fill();
    } else { g.beginPath(); g.moveTo(-1.8, -6.4); g.lineTo(-1.8, -7.6); g.strokeStyle = 'rgb(34,24,36)'; g.lineWidth = 0.7; g.stroke(); }
    g.restore();
  }

  return {
    open, close, paint, dip, isTop, isOpen, prepare,
    debug: () => ({ status: S.status, open: !!S.entry, paints: S.paints, last: S.last, line: S.line, dip: S.dipEl ? Number(S.dipEl.style.opacity || 0) : 0 }),
  };
}
