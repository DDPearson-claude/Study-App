// ui-guide.js — the first-play guide (the user's ask, 17 November 2026: "some nice text boxes that appear to walk you through what
// you're doing and why you're doing it ... breaking the 4th wall"). Under the loop only (ui.js builds it beside the loop view; the
// flag-off game never builds it). About ten plain cards, each shown ONCE a save at the moment it matters, in TEXT_LOOP.guide's plain
// words (not the game's voice): a small "Guide" tag, the words, one "Got it" (Enter, Space or Escape), "Skip the guide" on the first,
// and a small arrow toward the thing it talks about, never over it; never a ring or an outline round anything.
// The game waits while a card is up: it is a blocking modal (ui's stack), so the game clock, fishing, the tutorial's and the tow's
// clocks all hold and every tap and key goes to the card. Cards come only at calm moments (never in a bite, the strike gauge, the
// show or a place's lift), one at a time: when two fall due together they queue in GUIDE_ORDER, each after its own short wait.
// While a card is up the in-world lines (the first trip's tips, the float's captions, Murk's lines) are hidden, so no line says the
// same thing beside it; they come back when it closes.
// The save: meta.guide = {on, seen: {id: true}}, made on its first read: on for a new save, off for a save that has already landed
// a fish. Settings (under the loop) has "Guide tips" (on/off) and "Replay guide" (clears seen). ?guide=0 / ?guide=1 (or a preset
// GW_GUIDE boolean; the URL wins) turns it off or on for a page load whatever the save says: the scenario runner presets it off.
//
// Pure exports (node: tools/tests/ui-guide.test.mjs): GUIDE_ORDER · GUIDE_WAIT · GUIDE_TARGETS · guideSwitch · landedAny · ownsKit ·
// guideRecord · guideWords · guideCond · createGuide · guidePlace · GUIDE_CSS
const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

/** The boxes in the order they queue (and, on a first play, the order they come). */
export const GUIDE_ORDER = Object.freeze(['welcome', 'chart', 'cast', 'bite', 'fight', 'card', 'tackle', 'home', 'murk', 'away']);
/** Seconds each box's moment must hold, calm, before it shows (the card's count-up and stamp come first; a lost fish's line ends). */
export const GUIDE_WAIT = Object.freeze({ welcome: 0.4, chart: 0.8, cast: 0.6, bite: 0.5, fight: 0.5, card: 1.3, tackle: 0.8, home: 0.6, murk: 0.7, away: 1.5 });
/** What a box points at (a selector), when it points at anything. */
export const GUIDE_TARGETS = Object.freeze({ chart: '[data-modal=chart] [data-action=sail]', card: '[data-modal=catch] .gw-catch-actions',
  tackle: '[data-loop=tin]', home: '[data-loop=home]', murk: '[data-modal=jetty] [data-tile=murk]' });

/** This page load's switch: ?guide=0|1 (the URL wins), else a preset GW_GUIDE boolean, else null (the save decides). Pure. */
export function guideSwitch(g = globalThis) {
  let q = null;
  try { q = new URLSearchParams(g?.location?.search || ''); } catch { q = null; }
  if (q && q.has('guide')) {
    const v = String(q.get('guide')).trim().toLowerCase();
    if (['0', 'off', 'false', 'no'].includes(v)) return false;
    if (['', '1', 'on', 'true', 'yes'].includes(v)) return true;
  }
  return typeof g?.GW_GUIDE === 'boolean' ? g.GW_GUIDE : null;
}

/** Has this save landed a fish (a Journal entry caught, or a fish counted)? Pure. */
export function landedAny(meta) {
  const J = isObj(meta?.journal) ? meta.journal : {};
  return Object.values(J).some((j) => num(Number(j?.caught), 0) > 0) || num(Number(meta?.totalFish), 0) > 0;
}

/** Does meta.loop own a lure and a bait (any water's bag)? The tin's box waits for it (GEAR-GATES' start kit). Pure. */
export function ownsKit(L) {
  const pos = (o, d = 0) => isObj(o) && d < 3 && Object.values(o).some((v) => (typeof v === 'number' ? v > 0 : pos(v, d + 1)));
  return isObj(L) && Array.isArray(L.lures) && L.lures.length > 0 && pos(L.bait);
}

/** The save's record, made on its first read: on for a new save, off for one that has landed a fish. Writes meta.guide. */
export function guideRecord(meta) {
  if (!isObj(meta)) return { on: false, seen: {} };
  if (!isObj(meta.guide)) meta.guide = { on: !landedAny(meta), seen: {} };
  const g = meta.guide;
  if (typeof g.on !== 'boolean') g.on = true;
  if (!isObj(g.seen)) g.seen = {};
  return g;
}

/** A box's words (TEXT_LOOP.guide; `touch`: its touch words where they differ), with the card's own: {text, tag, ok, skip}; text ''
 *  for an unknown id. Pure. */
export function guideWords(D, id, { touch = false } = {}) {
  const G = isObj(D?.TEXT_LOOP?.guide) ? D.TEXT_LOOP.guide : {};
  const text = touch && typeof G.touch?.[id] === 'string' ? G.touch[id] : typeof G.boxes?.[id] === 'string' ? G.boxes[id] : '';
  return { text, tag: G.tag || 'Guide', ok: G.ok || 'Got it', skip: G.skip || 'Skip the guide' };
}

// the calm water: a trip in play with nothing biting, striking, showing or lifting, and no screen over it
const quiet = (s) => !s.cinematic && !s.inShow && !s.measuring && !s.lifting && !s.tell && !s.gauge && s.fish !== 'bite';
const water = (s) => s.trip === true && s.flow === 'playing' && !s.paused && !s.top && quiet(s);

/**
 * Is box `id`'s moment here? `s` is the frame's snapshot: {flow, top (the top modal's id or null), trip, paused, fish (the fishing
 * state), tell, gauge, inShow, measuring, cinematic, lifting, casts (this session's casts), holdFull, evenings (meta.loop's), towPhase,
 * away (a fish has got away since the last box), tin (the tackle tin is on screen), kit (the save owns a lure and a bait: the tin's
 * box names worms and a spoon, GEAR-GATES' start kit)}. Pure.
 */
export function guideCond(id, s = {}) {
  switch (id) {
    case 'welcome': return (s.top === 'tow' && s.towPhase === 'arrive') || (s.flow === 'home' && (s.top === 'jetty' || s.top === 'chart'));
    case 'chart': return s.flow === 'home' && s.top === 'chart';
    case 'cast': return water(s) && s.fish === 'idle' && num(s.casts) === 0;
    case 'bite': return water(s) && s.fish === 'waiting';
    case 'fight': return s.trip === true && s.flow === 'playing' && !s.paused && !s.top && s.fish === 'reeling' && !s.gauge && !s.inShow && !s.cinematic && !s.lifting;
    case 'card': return s.trip === true && s.top === 'catch' && !s.measuring;
    case 'tackle': return water(s) && s.fish === 'idle' && num(s.casts) >= 1 && s.tin === true && s.kit === true;
    case 'home': return water(s) && s.fish === 'idle' && s.holdFull === true;
    case 'murk': return s.flow === 'home' && s.top === 'jetty' && num(s.evenings) >= 1;
    case 'away': return water(s) && s.fish === 'idle' && s.away === true;
    default: return false;
  }
}

/**
 * The guide's machine, pure: `record()` → the save's {on, seen}; `force` the page's switch (true, false or null). step(s, dt) → the
 * id to show now (or null): each unseen box's calm time adds up while its moment holds (reset when it breaks), and the first in
 * GUIDE_ORDER past its wait wins; nothing while a box is open or the guide is off. open(id) marks it seen; close() lets the next
 * one start its wait afresh; skip() turns the guide off; setOn(v); replay() clears seen and turns it on.
 */
export function createGuide({ record = () => ({ on: true, seen: {} }), force = null } = {}) {
  const S = { open: null, held: {} };
  const rec = () => { const r = record(); return isObj(r) ? r : { on: false, seen: {} }; };
  const isOn = () => force === false ? false : force === true ? true : rec().on === true;
  return {
    step(s, dt = 0) {
      if (S.open || !isOn()) { S.held = {}; return null; }
      const seen = isObj(rec().seen) ? rec().seen : {}, d = Math.max(0, num(dt));
      let pick = null;
      for (const id of GUIDE_ORDER) {
        if (seen[id] || !guideCond(id, s)) { S.held[id] = 0; continue; }
        S.held[id] = num(S.held[id]) + d;
        if (!pick && S.held[id] >= GUIDE_WAIT[id] - 1e-9) pick = id;
      }
      return pick;
    },
    open(id) { const r = rec(); if (!isObj(r.seen)) r.seen = {}; r.seen[id] = true; S.open = id; S.held = {}; },
    close() { S.open = null; S.held = {}; },
    skip() { rec().on = false; S.open = null; S.held = {}; },
    setOn(v) { rec().on = v === true; },
    replay() { const r = rec(); r.seen = {}; r.on = true; S.held = {}; },
    isOn,
    get openId() { return S.open; },
    get held() { return { ...S.held }; },
  };
}

const hit = (a, b, pad = 0) => !!a && !!b && a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad;
const area = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

/**
 * Where a card of `w` × `h` goes on a `W` × `H` screen. With a `target` rect it sits beside it (above or below first, the side with
 * the room, centred or flush with one of its edges; then left or right), `gap` + the arrow's reach away, so it never covers it, and its arrow sits on the facing edge
 * toward the target's middle. Without one: high or low (`low` first), else the middle, centred. Always inside the `gutter`; the candidate that covers
 * the least of `avoid` (the raft, the float, the HUD) wins. `free` (with a target): the free places (high, low, middle, no arrow) may
 * win too, at a small cost, when every place beside the target covers something avoided (the catch card's words on a phone).
 * → {left, top, side ('above'|'below'|'left'|'right'|null), ax, ay (the arrow's middle along its edge, card px), ok (inside, clear of
 * the target and of everything avoided)}. Pure.
 */
export function guidePlace({ W, H, w, h, target = null, avoid = [], gutter = 16, gap = 10, reach = 10, low = false, free = false } = {}) {
  const cx0 = (x) => Math.max(gutter, Math.min(W - gutter - w, x)), cy0 = (y) => Math.max(gutter, Math.min(H - gutter - h, y));
  const R = (x, y) => ({ left: x, top: y, right: x + w, bottom: y + h });
  const inside = (r) => r.left >= gutter - 0.5 && r.top >= gutter - 0.5 && r.right <= W - gutter + 0.5 && r.bottom <= H - gutter + 0.5;
  const list = [];
  if (target) {
    const cx = (target.left + target.right) / 2, cy = (target.top + target.bottom) / 2, off = gap + reach;
    // above or below: centred on the target, else flush with its left or its right edge (so a word beside it can stay clear)
    const xs = [cx0(cx - w / 2), cx0(target.left - 12), cx0(target.right + 12 - w)];
    const above = xs.map((x) => ({ side: 'above', x, y: target.top - off - h })), below = xs.map((x) => ({ side: 'below', x, y: target.bottom + off }));
    const left = { side: 'left', x: target.left - off - w, y: cy0(cy - h / 2) }, right = { side: 'right', x: target.right + off, y: cy0(cy - h / 2) };
    list.push(...(cy > H / 2 ? [...above, ...below] : [...below, ...above]), ...(cx > W / 2 ? [left, right] : [right, left]));
  }
  if (!target || free) {
    const x = cx0((W - w) / 2), pen = target ? 2500 : 0, hi = { side: null, x, y: cy0(Math.round(H * 0.14)), pen }, lo = { side: null, x, y: cy0(H - h - Math.round(H * 0.14)), pen };
    list.push(...(low ? [lo, hi] : [hi, lo]), { side: null, x, y: cy0((H - h) / 2), pen });
  }
  let best = null;
  for (const c of list) {
    const r = R(c.x, c.y);
    const bad = (inside(r) ? 0 : 1e9) + (target && hit(r, target, 4) ? 1e8 : 0) + avoid.filter(Boolean).reduce((a, b) => a + area(r, b), 0);
    const cost = bad + num(c.pen);
    if (!best || cost < best.cost) best = { ...c, cost, bad, r };
  }
  const { x, y, side, bad: cost } = best;
  let ax = null, ay = null;
  if (target && side) {
    const cx = (target.left + target.right) / 2, cy = (target.top + target.bottom) / 2, m = Math.min(22, w / 2, h / 2);
    if (side === 'above' || side === 'below') ax = Math.max(m, Math.min(w - m, cx - x));
    else ay = Math.max(m, Math.min(h - m, cy - y));
  }
  return { left: Math.round(x), top: Math.round(y), side, ax, ay, ok: cost === 0 };
}

export const GUIDE_CSS = `
.gw-m-guide .gw-scrim { background: rgba(var(--veil-rgb), .2); }
.gw-m-guide .gw-modal-body { position: static; display: block; transform: none !important; max-width: none; max-height: none; }
/* the screen under the card stays in view (ui.css hides a modal under another, and fades a covered screen's words) */
.gw-modal:has(~ .gw-m-guide.gw-in):not(:has(~ .gw-modal.gw-in:not(.gw-m-guide))) { opacity: 1 !important; }
.gw-screen.gw-covered:has(~ .gw-m-guide):not(:has(~ .gw-modal:not(.gw-m-guide):not(.gw-out))) .gw-modal-body { opacity: 1; }
/* the in-world lines wait while a card is up (never two voices saying one thing) */
.gw-ui.gw-guide-on .gw-loop-tip, .gw-ui.gw-guide-on .gw-teach, .gw-ui.gw-guide-on .gw-murk-line { visibility: hidden !important; }
.gw-guide { position: absolute; left: 0; top: 0; box-sizing: border-box; width: min(400px, calc(100vw - 32px)); padding: 14px 20px 10px;
  border-radius: 14px; color: var(--ink); text-align: left; pointer-events: auto;
  background: radial-gradient(120% 90% at 0% 0%, rgba(67, 62, 116, .34), rgba(67, 62, 116, 0) 60%), rgb(19, 22, 50);
  box-shadow: 0 12px 36px rgba(4, 5, 12, .72), 0 0 42px rgba(126, 129, 180, .16); animation: gwGuideIn .3s ease-out both; }
@keyframes gwGuideIn { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .gw-guide { animation: none; } }
/* the thing a box points at stays in view under it: the HUD fades to .2 under any screen and hides its actions (the Home pill's
   row), and a child is never clearer than its parents, so the HUD and the row are lifted too (their taps stay off) */
.gw-ui:is([data-guide=home], [data-guide=tackle]) .gw-hud.gw-visible.gw-live.gw-blocked { opacity: 1; }
.gw-ui[data-guide=home] .gw-hud.gw-blocked .gw-actions { opacity: 1; }
.gw-ui[data-guide=home] .gw-pill.gw-home { opacity: 1 !important; transform: none !important; }
.gw-guide-arrow { position: absolute; width: 14px; height: 14px; margin: -7px 0 0 -7px; background: rgb(19, 22, 50); transform: rotate(45deg); border-radius: 2px; }
.gw-guide-tag { display: flex; align-items: center; gap: 6px; font: 400 13px/1 var(--f-display); letter-spacing: .24em; text-transform: uppercase; color: var(--lavender); }
.gw-guide-tag .gw-ico { width: 15px; height: 15px; color: var(--lavender); }
.gw-guide-text { position: relative; margin: 9px 0 8px; font: 400 18px/1.42 var(--f-body); letter-spacing: .005em; color: var(--ink); text-wrap: pretty; }
.gw-guide-foot { position: relative; display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 4px 10px; }
.gw-guide-btn { min-height: 44px; padding: 0 22px; border: 0; border-radius: 999px; cursor: pointer; background: none; color: var(--ink-faint);
  font: 400 15px/1 var(--f-body); letter-spacing: .01em; transition: color .2s, background-color .2s, box-shadow .2s; }
.gw-guide-ok { background: rgba(126, 129, 180, .26); color: var(--ink-hi); font: 400 16px/1 var(--f-display); letter-spacing: .16em; text-transform: uppercase; }
.gw-guide-btn:hover, .gw-guide-btn:focus-visible { color: var(--ink-hi); outline: none; }
.gw-guide-ok:hover, .gw-guide-ok:focus-visible { background: rgba(126, 129, 180, .38); box-shadow: 0 0 18px var(--glow-soft); }
@media (max-width: 700px) { .gw-guide { padding: 13px 16px 8px; } .gw-guide-text { font-size: 17px; } }
`;

export function createGuideView(K) {
  const { ctx } = K;
  const D = () => (typeof K.D === 'function' ? K.D() : ctx.data) || {};
  const report = (where, e) => { try { K.report?.(`guide.${where}`, e); } catch { /* ignore */ } };
  const meta = () => (typeof K.meta === 'function' ? K.meta() : ctx.state?.meta) || null;
  const loop = () => { const p = ctx.progression; if (!p || p.isStub) return null; const l = p.loop; return l && typeof l === 'object' && !l.isStub ? l : null; };
  const fishing = () => { const f = ctx.fishing; return f && !f.isStub ? f : null; };
  const call = (fn, d = null) => { try { const v = fn(); return v === undefined ? d : v; } catch { return d; } };
  const force = guideSwitch();
  const machine = createGuide({ record: () => guideRecord(meta()), force });
  if (typeof document !== 'undefined' && !document.getElementById('gw-guide-css')) {
    const st = document.createElement('style'); st.id = 'gw-guide-css'; st.textContent = GUIDE_CSS; document.head.appendChild(st);
  }
  const S = { el: null, id: null, casts: 0, away: false, towPhase: null, placed: null };
  const on = (evt, fn) => { try { ctx.bus?.on?.(evt, fn); } catch (e) { report(`on ${evt}`, e); } };
  on('fishing:cast', () => { S.casts++; });
  on('fish:escaped', () => { S.away = true; });   // the lost fish (WATERCRAFT §7; from GEAR-GATES, the cap's got-away too)
  on('loop:tow', (p = {}) => { S.towPhase = p.opening === true ? p.phase || null : null; });
  on('run:start', () => { S.casts = 0; S.away = false; });
  const visible = (sel) => { const e = sel ? document.querySelector(sel) : null; if (!e) return null; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 ? r : null; };
  const rectOf = (r) => (r ? { left: r.left, top: r.top, right: r.right, bottom: r.bottom } : null);
  function projected(p, up, box) {
    if (!p || typeof K.project !== 'function') return null;
    const q = call(() => K.project({ x: p.x, y: num(p.y) + up, z: p.z }));
    return q?.ok && !q.behind ? { left: q.x - box[0], right: q.x + box[0], top: q.y - box[1], bottom: q.y + box[2] } : null;
  }
  function snapshot() {
    const f = fishing(), v = f?.view || {}, m = meta() || {};
    return {
      flow: ctx.flow, top: call(() => K.top()?.id, null) ?? null, trip: ctx.state?.run?.outing === 'trip', paused: ctx.paused === true,
      fish: typeof f?.state === 'string' ? f.state : 'idle', tell: !!v.biteTell, gauge: !!v.strikeGauge, inShow: f?.inShow === true,
      measuring: call(() => K.measure?.holding?.() === true, false), cinematic: ctx.cinematic === true, lifting: call(() => ctx.game?.lifting?.() === true, false),
      casts: S.casts, holdFull: call(() => loop()?.holdFull?.() === true, false), evenings: num(Number(m.loop?.evenings), 0),
      towPhase: S.towPhase, away: S.away, tin: !!visible('[data-loop=tin]'), kit: ownsKit(m.loop),
    };
  }
  function place() {
    const el = S.el;
    if (!el) return;
    const W = K.vw || innerWidth, H = K.vh || innerHeight;
    const target = rectOf(visible(GUIDE_TARGETS[S.id]));
    const avoid = [];
    if (S.id === 'welcome' || S.id === 'murk') {   // at home: clear of the barge's words, the purse and the goal line
      for (const e of document.querySelectorAll('[data-modal=jetty] .gw-jetty-tword, [data-modal=jetty] .gw-jetty-goal, [data-modal=jetty] .gw-jetty-purse')) {
        if (!e.closest(GUIDE_TARGETS[S.id] || '#none')) avoid.push(rectOf(e.getBoundingClientRect()));
      }
    } else if (S.id === 'card') {   // the card's own words stay clear: the name, the length line, the ruler and the drawing
      for (const e of document.querySelectorAll('[data-modal=catch] :is(.gw-cc-kicker, .gw-catch-name, .gw-cc-stats, .gw-cc-measure, .gw-cc-art)')) avoid.push(rectOf(e.getBoundingClientRect()));
    } else if (S.id !== 'chart') {
      // the raft and the Wick, the lamp post and its flag above them, and the float
      avoid.push(projected(ctx.player?.position, 0.3, [60, 56, 34]), projected(ctx.player?.position, 1.5, [44, 40, 30]), projected(fishing()?.bobberPos, 0.35, [24, 20, 40]));
      for (const sel of ['.gw-hold', '[data-loop=tin]', '[data-loop=home]', '.gw-hb-pause']) if (sel !== GUIDE_TARGETS[S.id]) avoid.push(rectOf(visible(sel)));
    }
    // (the welcome over the Landing sits low: the barge-house, the candles and the arch are the sheet's upper half)
    const low = S.id === 'welcome' && K.has?.('tow') === true;
    const P = guidePlace({ W, H, w: el.offsetWidth, h: el.offsetHeight, target, avoid, low, free: S.id === 'card' });
    el.style.transform = `translate3d(${P.left}px,${P.top}px,0)`;
    const a = el.querySelector('.gw-guide-arrow');
    if (a) {
      a.hidden = !P.side;
      if (P.side) {
        const s = a.style;
        s.left = P.ax != null ? `${P.ax}px` : P.side === 'left' ? '100%' : '0';
        s.top = P.ay != null ? `${P.ay}px` : P.side === 'above' ? '100%' : '0';
      }
    }
    S.placed = { ...P, id: S.id, w: el.offsetWidth, h: el.offsetHeight, target, sel: target ? GUIDE_TARGETS[S.id] : null };
  }
  function save() { try { ctx.game?.save?.(); } catch (e) { report('save', e); } }
  function close(how = 'ok') {
    if (!S.id) return;
    if (how === 'skip') machine.skip(); else machine.close();
    S.el = null; S.id = null; S.placed = null;
    try { K.root?.classList?.remove('gw-guide-on'); delete K.root.dataset.guide; } catch { /* ignore */ }
    try { K.closeModal('guide'); } catch (e) { report('close', e); }
    K.sfx?.('ui_click', { volume: 0.45 });
    save();
  }
  function show(id) {
    const w = guideWords(D(), id, { touch: K.isTouch === true });
    if (!w.text) { machine.open(id); machine.close(); return false; }
    machine.open(id);
    if (id === 'away') S.away = false;
    S.id = id;
    const h = K.h;
    K.openModal('guide', (entry, body) => {
      const card = h('div', `gw-guide gw-guide--${id}`);
      card.dataset.guide = id;
      card.setAttribute('role', 'note');
      card.innerHTML = `<i class="gw-guide-arrow" aria-hidden="true" hidden></i><div class="gw-guide-tag">${K.icon ? K.icon('quill') : ''}<span></span></div>
        <p class="gw-guide-text"></p><div class="gw-guide-foot"></div>`;
      card.querySelector('.gw-guide-tag span').textContent = w.tag;
      card.querySelector('.gw-guide-text').textContent = w.text;
      const foot = card.querySelector('.gw-guide-foot');
      if (id === 'welcome') {
        const sk = h('button', 'gw-guide-btn gw-guide-skip'); sk.type = 'button'; sk.dataset.guideAct = 'skip'; sk.textContent = w.skip;
        sk.addEventListener('click', () => close('skip')); foot.appendChild(sk);
      }
      const ok = h('button', 'gw-guide-btn gw-guide-ok'); ok.type = 'button'; ok.dataset.guideAct = 'ok'; ok.dataset.autofocus = '1'; ok.textContent = w.ok;
      ok.addEventListener('click', () => close('ok')); foot.appendChild(ok);
      body.appendChild(card);
      S.el = card;
    }, { blocking: true, quiet: true, dismissable: false, cls: 'gw-m-guide', onEscape: () => close('ok'),
      onKey: (code) => {
        if (code === 'Tab') return false;
        if (code === 'Enter' || code === 'Space' || code === 'NumpadEnter') close(document.activeElement?.dataset?.guideAct === 'skip' ? 'skip' : 'ok');
        else if (code === 'Escape') close('ok');
        return true;   // (every other key waits with the game)
      } });
    try { K.root?.classList?.add('gw-guide-on'); } catch { /* ignore */ }
    try { K.root.dataset.guide = id; } catch { /* ignore */ }
    place();
    K.sfx?.('ui_open', { volume: 0.4 });
    try { ctx.bus?.emit?.('loop:guide', { id }); } catch { /* ignore */ }
    return true;
  }
  /** Settings (under the loop): "Guide tips" on/off and "Replay guide". */
  function settingsRows(content, entry) {
    const G = D().TEXT_LOOP?.guide?.settings || {}, h = K.h, rec = guideRecord(meta());
    content.insertAdjacentHTML('beforeend', `<div class="gw-group"></div>`);
    content.lastElementChild.textContent = G.group || 'Guide';
    const row = h('div', 'gw-set-row'), on = rec.on === true;
    row.innerHTML = '<span class="gw-set-label"><span></span><small></small></span>';
    row.querySelector('.gw-set-label > span').textContent = G.tips || 'Guide tips';
    row.querySelector('small').textContent = G.tipsSub || '';
    const b = h('button', `gw-toggle${on ? ' gw-on' : ''}`, '<i></i>');
    b.type = 'button'; b.dataset.guideSet = 'tips';
    b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', on ? 'true' : 'false'); b.setAttribute('aria-label', G.tips || 'Guide tips');
    b.addEventListener('click', () => { machine.setOn(!on); K.sfx?.('ui_click'); save(); entry.render(); });
    row.appendChild(b);
    content.appendChild(row);
    const rr = h('div', 'gw-set-row');
    rr.innerHTML = '<span class="gw-set-label"><span></span><small></small></span>';
    rr.querySelector('.gw-set-label > span').textContent = G.replay || 'Replay guide';
    rr.querySelector('small').textContent = G.replaySub || '';
    const rb = h('button', 'gw-btn gw-btn--sm'); rb.type = 'button'; rb.dataset.guideSet = 'replay'; rb.textContent = G.replayBtn || 'Replay';
    rb.addEventListener('click', () => { machine.replay(); S.casts = 0; K.sfx?.('ui_click'); save(); entry.render(); });
    rr.appendChild(rb);
    content.appendChild(rr);
  }
  function update(dt) {
    const d = Math.max(0, Math.min(0.25, num(dt)));
    if (S.id) {
      if (!K.has?.('guide')) { machine.close(); S.el = null; S.id = null; try { K.root?.classList?.remove('gw-guide-on'); delete K.root.dataset.guide; } catch { /* ignore */ } return; }
      place();
      return;
    }
    if (force === false || !meta()) return;
    const id = machine.step(snapshot(), d);
    if (id) show(id);
  }
  return {
    update, settingsRows,
    /** debug builds and tests: {open, on, seen, held, placed, snapshot} */
    debug: () => ({ open: S.id, on: machine.isOn(), force, seen: { ...(guideRecord(meta()).seen || {}) }, held: machine.held, placed: S.placed ? { ...S.placed } : null, snapshot: snapshot() }),
    /** debug builds: close the open box ('ok' or 'skip'); show a box now, out of its moment (the look's frames) */
    close: (how) => close(how),
    show: (id) => (S.id || !GUIDE_ORDER.includes(id) ? false : show(id)),
  };
}
