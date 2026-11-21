// ui-teach.js — the float's two marks, taught once (the user's play-test, 16 November 2026: "add a one-time teaching moment for
// both"). Under the loop only (ui.js builds it beside the loop view; the flag-off game never builds it). SPEC §8.1's float carries
// no word of its own; this is the one moment it is explained: the first time the float settles on a trip after the opening
// tutorial is done, two ink captions in the Drowned Filigree hand (the strike tip's type and ink-shadow), each with a fine ink
// leader to its mark: TEXT_LOOP.teach.notches by the favour notches, TEXT_LOOP.teach.dots by the good-bite dots. They ink in, hold
// LOOP_TEACH.hold s (or until the bite, a tap or the next cast), then fade; reduced motion: a plain fade. pointer-events none: they
// never take a tap from the water, and they never touch fishing (the bite is never delayed).
// Once a save: meta.seenTips[TEACH_TIP], written (and the game saved) the moment they show, so a reload never repeats it; an
// older save that has played already has no such key and is taught once, on its next settled float.
// The quiet water (SPEC §3.3, §8.6) is Murk's first quiet-water line (ui-loop's update: sayOnce('firstQuiet')); nothing here.
//
// Pure exports (node: tools/tests/loop-teach.test.mjs): TEACH_TIP · LOOP_TEACH · TEACH_CSS · teachDue · teachWords · teachSide · teachLayout
const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

/** The save's record: meta.seenTips[TEACH_TIP] = true once the captions have shown. */
export const TEACH_TIP = 'loop_marks';
/** The moment's timing and its margins (CSS px). */
export const LOOP_TEACH = Object.freeze({
  after: 0.6,    // s the float has been settled (its marks inked) before the captions come
  hold: 6,       // s they hold before they fade
  lead: 26,      // px between a caption's edge and its mark (the leader's run)
  gutter: 16,    // px from the screen's edges
  gap: 10,       // px between the two captions
  maxW: 250,     // px a caption's widest line
  // the HUD's bands (ui-hud-v3's placeNear: the float's own marks keep inside them)
  top: (W) => (W < 700 ? 186 : 112),
  bottom: (W) => (W < 700 ? 214 : 118),
});

/** The two captions' words (TEXT_LOOP.teach), or null when either is missing. */
export function teachWords(D) {
  const T = D?.TEXT_LOOP?.teach;
  return isObj(T) && typeof T.notches === 'string' && T.notches && typeof T.dots === 'string' && T.dots ? { notches: T.notches, dots: T.dots } : null;
}

/**
 * Is the moment due now? `loopOn` the loop build, `trip` a trip on the water (flow playing), `tutorialDone` the opening tutorial's
 * record is done (meta.loop.tutorial.done), `seen` meta.seenTips[TEACH_TIP], `shown` the captions are up this session, `state` the
 * fishing state, `marks` the float's notches and dots are on screen, `blocking` a blocking screen is up, `lifting` a place's lift
 * holds the evening, `settled` s the marks have been on screen.
 */
export function teachDue({ loopOn = false, trip = false, tutorialDone = false, seen = false, shown = false, state = 'idle', marks = false,
  blocking = false, lifting = false, settled = 0, after = LOOP_TEACH.after } = {}) {
  return loopOn === true && trip === true && tutorialDone === true && seen !== true && shown !== true && state === 'waiting' && marks === true
    && blocking !== true && lifting !== true && num(settled) >= after - 1e-9;
}

const union = (a, b) => ({ left: Math.min(a.left, b.left), right: Math.max(a.right, b.right), top: Math.min(a.top, b.top), bottom: Math.max(a.bottom, b.bottom) });
const overlap = (a, b, pad = 0) => a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad;

/**
 * Which side of the marks the captions take, and how wide a caption may be there. `ticks` and `dots` are the marks' screen rects
 * ({left, right, top, bottom}); the side with the more room, the right when both fit a full caption (a desktop: beside the float).
 */
export function teachSide({ W, ticks, dots } = {}) {
  const M = LOOP_TEACH, u = union(ticks, dots);
  const roomR = W - M.gutter - u.right - M.lead, roomL = u.left - M.lead - M.gutter;
  const side = roomR >= Math.min(M.maxW, 200) || roomR >= roomL ? 'right' : 'left';
  const room = side === 'right' ? roomR : roomL;
  return { side, maxW: Math.max(80, Math.min(M.maxW, Math.floor(room))) };
}

/**
 * Where the two captions and their leaders go. `W`, `H` the viewport; `ticks`, `dots` the marks' rects; `float` the float's rect
 * (the bobber and its tip), `raft` the raft and its Wick's (kept clear where there is room); `notes`, `dotsCap` the captions' measured sizes ({w, h}) at teachSide's maxW; `side` teachSide's.
 * The notches' caption sits above the dots' caption (in the marks' order), both on `side`, stacked `gap` apart round the marks'
 * middle, shifted together to stay inside the HUD's bands and clear of the float. → {side, notes: rect, dots: rect, leaders:
 * [{x1, y1, x2, y2}] (caption → mark), ok, faults, soft (over the raft: no room to clear it)}. Pure.
 */
export function teachLayout({ W, H, ticks, dots, float = null, raft = null, notes, dotsCap, side = 'right' } = {}) {
  const M = LOOP_TEACH;
  const top = M.top(W), bottom = H - M.bottom(W);
  const tY = (ticks.top + ticks.bottom) / 2, dY = (dots.top + dots.bottom) / 2;
  const mid = (tY + dY) / 2;
  const right = side === 'right';
  const col = union(ticks, dots);   // one column for both, clear of both marks (a single dot is narrower than the notches)
  const xOf = (mark, w) => (right ? col.right + M.lead : col.left - M.lead - w);
  let nY = mid - M.gap / 2 - notes.h, dTop = mid + M.gap / 2;
  // inside the bands, the pair together
  const span = () => ({ t: nY, b: dTop + dotsCap.h });
  { const s = span(); if (s.t < top) { const k = top - s.t; nY += k; dTop += k; } }
  { const s = span(); if (s.b > bottom) { const k = s.b - bottom; nY -= k; dTop -= k; } }
  const clampX = (x, w) => Math.max(M.gutter, Math.min(W - M.gutter - w, x));
  let nRect = { left: clampX(xOf(ticks, notes.w), notes.w), top: nY, w: notes.w, h: notes.h };
  let dRect = { left: clampX(xOf(dots, dotsCap.w), dotsCap.w), top: dTop, w: dotsCap.w, h: dotsCap.h };
  const box = (r) => ({ left: r.left, right: r.left + r.w, top: r.top, bottom: r.top + r.h });
  // clear of the float (always) and of the raft and its Wick (where there is room): the pair moves up or down together, the least
  // that clears them inside the bands; with no such move it steps out sideways, away from the float
  const hard = float ? [float] : [], all = hard.concat(raft ? [raft] : []);
  if (all.length) {
    const caps = [nRect, dRect];
    const hx = (r, o) => r.left < o.right + 6 && r.left + r.w > o.left - 6;
    const clears = (k, list) => list.every((o) => caps.every((r) => !overlap(box({ ...r, top: r.top + k }), o, 6)));
    const inBand = (k) => nRect.top + k >= top - 0.5 && dRect.top + dRect.h + k <= bottom + 0.5;
    const ks = [0];
    for (const o of all) {
      const hs = caps.filter((r) => hx(r, o));
      if (hs.length) ks.push(o.top - 8 - Math.max(...hs.map((r) => r.top + r.h)), o.bottom + 8 - Math.min(...hs.map((r) => r.top)));
    }
    for (const a of ks.slice(1)) for (const b of ks.slice(1)) if (Math.sign(a) === Math.sign(b)) ks.push(Math.sign(a) * Math.max(Math.abs(a), Math.abs(b)));
    ks.sort((a, b) => Math.abs(a) - Math.abs(b));
    const k = ks.find((x) => inBand(x) && clears(x, all)) ?? ks.find((x) => inBand(x) && clears(x, hard));
    if (k !== undefined) { nRect.top += k; dRect.top += k; }
    else if (float) {   // no room up or down: the captions step out sideways, away from the float
      const b = box(caps.find((r) => overlap(box(r), float, 6)) || nRect);
      const dx = right ? Math.max(0, float.right + 8 - b.left) : -Math.max(0, b.right - (float.left - 8));
      nRect = { ...nRect, left: clampX(nRect.left + dx, nRect.w) }; dRect = { ...dRect, left: clampX(dRect.left + dx, dRect.w) };
    }
  }
  const nB = box(nRect), dB = box(dRect);
  // the leaders: from the caption's near edge, level with its line nearest the mark, to just short of the mark's near edge
  const near = (b, mark, markY, above) => {
    const x1 = right ? b.left - 4 : b.right + 4;
    const y1 = above ? Math.max(b.top + 10, b.bottom - 12) : Math.min(b.bottom - 10, b.top + 12);
    return { x1, y1, x2: right ? mark.right + 3 : mark.left - 3, y2: markY };
  };
  const leaders = [near(nB, ticks, tY, true), near(dB, dots, dY, false)];
  const faults = [], soft = [];
  if (overlap(nB, dB)) faults.push('the captions overlap');
  for (const [n, b] of [['notches', nB], ['dots', dB]]) {
    if (b.left < M.gutter - 0.5 || b.right > W - M.gutter + 0.5) faults.push(`${n}: off the screen's side`);
    if (b.top < top - 0.5 || b.bottom > bottom + 0.5) faults.push(`${n}: in the HUD's band`);
    if (overlap(b, ticks) || overlap(b, dots)) faults.push(`${n}: over a mark`);
    if (float && overlap(b, float)) faults.push(`${n}: over the float`);
    if (raft && overlap(b, raft)) soft.push(`${n}: over the raft`);
  }
  return { side, notes: nB, dots: dB, leaders, ok: faults.length === 0, faults, soft };
}

// ================================================================== the view
export const TEACH_CSS = `
.gw-teach { position: absolute; inset: 0; pointer-events: none !important; z-index: 4; }
.gw-teach * { pointer-events: none !important; }
.gw-teach-svg { position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: visible; }
.gw-teach-svg path { fill: none; stroke: var(--ink, #ecebf6); stroke-width: 1.25; stroke-linecap: round; opacity: .78;
  filter: drop-shadow(0 1px 1px rgba(4, 5, 12, .95)); stroke-dasharray: 100; stroke-dashoffset: 100; }
.gw-teach-cap { position: absolute; left: 0; top: 0; box-sizing: border-box; width: max-content; padding: 2px 4px;
  font: 400 19px/1.25 var(--f-body); letter-spacing: .01em; color: var(--ink, #ecebf6); text-align: left; text-wrap: balance;
  text-shadow: 0 1px 2px #000, 0 0 14px rgba(4, 5, 12, .85);
  background: radial-gradient(ellipse 60% 62% at 50% 50%, rgba(var(--veil-rgb, 10, 12, 25), .62), rgba(var(--veil-rgb, 10, 12, 25), .3) 62%, transparent 100%);
  opacity: 0; }
.gw-teach-cap.gw-teach-l { text-align: right; }
@media (max-width: 700px) { .gw-teach-cap { font-size: 17px; line-height: 1.24; } }
/* the ink-in: the leader draws from its mark, then the words write in left to right (a mask sweep) */
.gw-teach.gw-in path { animation: gwTeachLead .55s var(--ease-ink, ease-out) forwards; }
.gw-teach.gw-in path.gw-teach-2 { animation-delay: .35s; }
.gw-teach.gw-in .gw-teach-cap { animation: gwTeachInk .9s var(--ease-ink, ease-out) .3s forwards;
  -webkit-mask-image: linear-gradient(90deg, #000 45%, transparent 55%); mask-image: linear-gradient(90deg, #000 45%, transparent 55%);
  -webkit-mask-size: 260% 100%; mask-size: 260% 100%; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; }
.gw-teach.gw-in .gw-teach-cap.gw-teach-2 { animation-delay: .65s; }
@keyframes gwTeachLead { to { stroke-dashoffset: 0; } }
@keyframes gwTeachInk { 0% { opacity: 0; -webkit-mask-position: 100% 0; mask-position: 100% 0; } 25% { opacity: 1; }
  100% { opacity: 1; -webkit-mask-position: 0 0; mask-position: 0 0; } }
.gw-teach.gw-out { opacity: 0; transition: opacity .6s ease; }
.gw-teach.gw-out path { animation: none; stroke-dashoffset: 0; }
.gw-teach.gw-out .gw-teach-cap { animation: none; opacity: 1; -webkit-mask-image: none; mask-image: none; }
/* reduced motion: no ink-in, a plain fade */
.gw-teach.gw-rm path { animation: none !important; stroke-dashoffset: 0; }
.gw-teach.gw-rm .gw-teach-cap { animation: none !important; -webkit-mask-image: none !important; mask-image: none !important; opacity: 1; }
.gw-teach.gw-rm { opacity: 0; transition: opacity .5s ease; }
.gw-teach.gw-rm.gw-in { opacity: 1; }
.gw-teach.gw-rm.gw-out { opacity: 0; }
`;

export function createTeachView(K) {
  const { ctx, D } = K;
  const report = (where, e) => { try { K.report?.(`teach.${where}`, e); } catch { /* ignore */ } };
  const meta = () => (typeof K.meta === 'function' ? K.meta() : ctx.state?.meta) || null;
  const loop = () => { const p = ctx.progression; if (!p || p.isStub) return null; const l = p.loop; return l && typeof l === 'object' && !l.isStub ? l : null; };
  const fishing = () => { const f = ctx.fishing; return f && !f.isStub ? f : null; };
  const reducedMotion = () => K.settings?.().reducedMotion === true || (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } })();
  if (typeof document !== 'undefined' && !document.getElementById('gw-teach-css')) {
    const st = document.createElement('style'); st.id = 'gw-teach-css'; st.textContent = TEACH_CSS; document.head.appendChild(st);
  }
  const S = { el: null, t: 0, settled: 0, out: false, layout: null, float: null };
  const seen = () => !!meta()?.seenTips?.[TEACH_TIP];
  function markSeen() {
    const m = meta();
    if (!m) return;
    m.seenTips = isObj(m.seenTips) ? m.seenTips : {};
    m.seenTips[TEACH_TIP] = true;
    Promise.resolve().then(() => { try { ctx.game?.save?.(); } catch (e) { report('save', e); } });
  }
  const tutorialDone = () => { try { return loop()?.tutorial?.()?.done === true; } catch { return false; } };
  const onTrip = () => ctx.state?.run?.outing === 'trip' && ctx.flow === 'playing';
  const lifting = () => { try { return ctx.game?.lifting?.() === true; } catch { return false; } };
  const favEl = () => K.root?.querySelector?.('.gw-favour.gw-on.gw-loopfav') || null;
  const rectOf = (r) => ({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
  /** The marks' rects on screen (the lit and spent dots, not their row's full width), or null. */
  function marks() {
    const fav = favEl();
    if (!fav) return null;
    const tk = fav.querySelector('.gw-fav-ticks'), dots = [...fav.querySelectorAll('.gw-fav-dots i')];
    if (!tk || !dots.length) return null;
    const t = tk.getBoundingClientRect();
    if (!(t.width > 0)) return null;
    let d = null;
    for (const i of dots) { const r = rectOf(i.getBoundingClientRect()); d = d ? union(d, r) : r; }
    if (!d || !(d.right > d.left)) return null;
    return { ticks: rectOf(t), dots: d };
  }
  function floatRect() {
    const f = fishing(), b = f?.bobberPos;
    if (!b || typeof K.project !== 'function') return null;
    const p = K.project({ x: b.x, y: num(b.y) + 0.35, z: b.z });
    if (!p?.ok || p.behind) return null;
    return { left: p.x - 16, right: p.x + 16, top: p.y - 12, bottom: p.y + 38 };
  }
  function raftRect() {
    const pp = ctx.player?.position;
    if (!pp || typeof K.project !== 'function') return null;
    const p = K.project({ x: pp.x, y: num(pp.y) + 0.3, z: pp.z });
    if (!p?.ok || p.behind) return null;
    return { left: p.x - 56, right: p.x + 56, top: p.y - 50, bottom: p.y + 32 };   // (the deck, the Wick's flame above it)
  }
  function build(words) {
    const h = K.h;
    const el = h('div', `gw-teach${reducedMotion() ? ' gw-rm' : ''}`);
    el.dataset.loop = 'teach';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<svg class="gw-teach-svg" aria-hidden="true"><path class="gw-teach-1" pathLength="100"/><path class="gw-teach-2" pathLength="100"/></svg>';
    const a = h('div', 'gw-teach-cap gw-teach-1'), b = h('div', 'gw-teach-cap gw-teach-2');
    a.dataset.mark = 'notches'; b.dataset.mark = 'dots';
    a.textContent = words.notches; b.textContent = words.dots;
    el.appendChild(a); el.appendChild(b);
    // (the live region speaks it once for a screen reader; the drawing itself is aria-hidden)
    const sr = h('span', 'gw-sr'); sr.textContent = `${words.notches} ${words.dots}`;
    sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);';
    try { K.layers.toasts?.appendChild?.(sr); setTimeout(() => sr.remove(), 8000); } catch { /* ignore */ }
    (K.layers.hud || K.root).appendChild(el);
    return el;
  }
  /** Lay the captions out against the marks now (each frame: the float bobs and the camera moves). */
  function place() {
    const el = S.el, m = marks();
    if (!el || !m) return false;
    const W = K.vw || innerWidth, H = K.vh || innerHeight;
    const { side, maxW } = teachSide({ W, ticks: m.ticks, dots: m.dots });
    const [a, b] = el.querySelectorAll('.gw-teach-cap');
    for (const c of [a, b]) { c.style.maxWidth = `${maxW}px`; c.classList.toggle('gw-teach-l', side === 'left'); }
    S.float = floatRect(); S.raft = raftRect();
    const L = teachLayout({ W, H, ticks: m.ticks, dots: m.dots, float: S.float, raft: S.raft, side,
      notes: { w: a.offsetWidth, h: a.offsetHeight }, dotsCap: { w: b.offsetWidth, h: b.offsetHeight } });
    a.style.transform = `translate3d(${L.notes.left.toFixed(1)}px,${L.notes.top.toFixed(1)}px,0)`;
    b.style.transform = `translate3d(${L.dots.left.toFixed(1)}px,${L.dots.top.toFixed(1)}px,0)`;
    const paths = el.querySelectorAll('path');
    L.leaders.forEach((q, i) => {
      // a fine ink line that leaves the words level and bends into its mark (from the mark: the ink-in draws it mark-first)
      const cx = q.x2 + (q.x1 - q.x2) * 0.55, cy = q.y1;
      paths[i].setAttribute('d', `M${q.x2.toFixed(1)} ${q.y2.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${q.x1.toFixed(1)} ${q.y1.toFixed(1)}`);
    });
    S.layout = L;
    return true;
  }
  function show() {
    const words = teachWords(D());
    if (!words) return false;
    markSeen();
    S.el = build(words); S.t = 0; S.out = false;
    place();
    void S.el.offsetWidth;   // (the start state is laid out first, so the ink-in runs from it; no frame waited on)
    S.el.classList.add('gw-in');
    try { ctx.bus?.emit?.('loop:teach', { tip: TEACH_TIP, words }); } catch { /* ignore */ }
    return true;
  }
  function drop(now = false) {
    const el = S.el;
    if (!el || S.out) return;
    S.out = true;
    if (now) { el.remove(); S.el = null; return; }
    el.classList.add('gw-out');
    setTimeout(() => { el.remove(); if (S.el === el) S.el = null; }, 650);
  }
  // until the bite, a tap or the next cast; never over a screen or off the water
  const on = (evt, fn) => { try { ctx.bus?.on?.(evt, fn); } catch (e) { report(`on ${evt}`, e); } };
  for (const evt of ['fishing:bite', 'fishing:cast', 'fishing:strike', 'fishing:miss', 'run:end', 'home:enter']) on(evt, () => drop());
  on('flow:change', ({ flow } = {}) => { if (flow !== 'playing') drop(true); });
  on('run:start', () => { drop(true); S.settled = 0; });
  try { addEventListener('pointerdown', () => { if (S.el && !S.out && S.t > 0.25) drop(); }, { capture: true, passive: true }); } catch { /* node */ }

  function update(dt) {
    const d = Math.max(0, Math.min(0.25, num(dt)));
    const f = fishing();
    const state = typeof f?.state === 'string' ? f.state : 'idle';
    if (S.el && !S.out) {
      S.t += d;
      if (state !== 'waiting' || !favEl() || S.t >= LOOP_TEACH.hold || K.hasBlocking?.()) drop();
      else place();
      return;
    }
    if (S.el) return;
    const mk = state === 'waiting' && !!favEl();
    S.settled = mk ? S.settled + d : 0;
    if (!mk || seen()) return;
    if (teachDue({ loopOn: D()?.LOOP_ENABLED === true, trip: onTrip(), tutorialDone: tutorialDone(), seen: seen(), shown: !!S.el, state,
      marks: !!marks(), blocking: K.hasBlocking?.() === true, lifting: lifting(), settled: S.settled })) show();
  }

  return {
    update,
    /** debug builds and tests: {shown, t, seen, layout} */
    debug: () => ({ shown: !!S.el && !S.out, t: S.t, seen: seen(), settled: S.settled, layout: S.layout ? { ...S.layout } : null, float: S.float || null, raft: S.raft || null }),
    /** debug builds: forget the record (so the moment can be seen again) */
    forget: () => { const m = meta(); if (isObj(m?.seenTips)) delete m.seenTips[TEACH_TIP]; drop(true); S.settled = 0; },
  };
}
