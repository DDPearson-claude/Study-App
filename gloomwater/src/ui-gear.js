// ui-gear.js — M1 step 4 (lane 4): the step's screens, as one view the loop's view builds (ui-loop.js createLoopView: one line) and the
// catch card calls (ui-screens.js: one line). Read only under data.LOOP_ENABLED (the loop's view exists only then).
//   - the Chart's foot: the bait slot cycles the bag's bait (the Heartmoss Ball, the tins, Cut Strip) and the lure slot sits beside it
//     (SPEC §5.4, M1.md §3.3: "the lure slot under the sheet; the tins in the bait slot"); no word, a glyph and the bait's count
//   - Murk's shelf: his chalk board of orders under his line (SPEC §6.3: each order a fish drawn in chalk and its words; tap one to wipe
//     it and Murk chalks a new one), [data-loop=orders] [data-order]
//   - the catch card: a chalk tick by Keep's value when the fish fills an order (SPEC §8.2, no words); Let go held on a Small or a
//     Keeper shows a knife and cuts it into Cut Strip (SPEC §3.2)
//   - the tally: a chalk tick on a row that filled an order (SPEC §8.3; ui-loop's renderTally reads CHALK_TICK)
//   - Murk's first-Small line once (SPEC §8.6), as his other lines on the water
// Its CSS is its own (one <style>, injected once), so ui.css is not touched by this lane.
import { icon } from './ui-icons.js';
import { drawFishInk } from './ui-fishart.js';
import { gearName } from './loop-gear.js';
import { bitesTable, HOOK_ITEMS as WC_ITEMS, LURE_IDS as WC_LURES } from './watercraft.js';   // WC-3: the gear log's Who bites
import { bitesBlock } from './ui-af.js';

const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const arr = (v) => (Array.isArray(v) ? v : []);

/** The glyph of a bait or a lure on the slots (ui-icons' names). */
export const GEAR_GLYPH = Object.freeze({ heartmoss: 'mossball', mireworm: 'worm', lumen_moss: 'moss', cut_strip: 'fish',
  feather_fly: 'feather', glimmer_spoon: 'spoon', bone_jig: 'bone', bell_spinner: 'bell' });
/** The chalk tick (SPEC §8.2, §8.3: "a chalk-tick glyph beside the value, no words"). */
export const CHALK_TICK = '<i class="gw-chalk-tick" aria-hidden="true"><svg viewBox="0 0 22 16"><path d="M2.5 9.2 C4.4 10.3 6 12 7.6 14 C10.6 8.6 14.2 4.6 19.6 1.8"/></svg></i>';

/** The bait slot's choices for a water (pure): the legend's ball, the water's tins and Cut Strip, each the bag holds (or the one fitted),
 *  in that order: [{id, count, glyph}]. */
export function baitChoices(D, metaLoop, water = 'mossmere') {
  const ml = isObj(metaLoop) ? metaLoop : {}, bag = isObj(ml.bait?.[water]) ? ml.bait[water] : {};
  const fitted = ml.fitted?.bait ?? null;
  const ids = [D?.LOOP?.legendBait?.[water]?.id, ...arr(D?.LOOP?.tins?.[water]), 'cut_strip'].filter((id) => typeof id === 'string');
  return ids.filter((id, i, a) => a.indexOf(id) === i && (Math.max(0, Math.floor(num(bag[id]))) > 0 || id === fitted))
    .map((id) => ({ id, count: Math.max(0, Math.floor(num(bag[id]))), glyph: GEAR_GLYPH[id] || 'worm' }));
}
/** The lure slot's choices (pure): the owned lures of LOOP.lures, in their order: [{id, glyph}]. */
export function lureChoices(D, metaLoop) {
  const own = new Set(arr(metaLoop?.lures));
  return Object.keys(isObj(D?.LOOP?.lures) ? D.LOOP.lures : {}).filter((id) => own.has(id)).map((id) => ({ id, glyph: GEAR_GLYPH[id] || 'hook' }));
}
/** The next choice when a slot is tapped: the one after the fitted one, and after the last none (a bare hook). Pure. */
export function nextChoice(choices, fitted) {
  const order = [...arr(choices).map((c) => c.id), null];
  const i = order.indexOf(fitted ?? null);
  return order[(i + 1) % order.length] ?? null;
}

const CSS = `
.gw-loop-on .gw-lure-slot { margin-right: 6px; }
.gw-loop-on .gw-lure-slot .gw-bait-ball .gw-ico { width: 28px; height: 28px; }
.gw-loop-on .gw-orders { position: relative; margin: 2px auto 10px; max-width: 560px; padding: 10px 14px 8px; border-radius: 6px;
  background: linear-gradient(180deg, rgba(36, 40, 52, .92), rgba(24, 27, 38, .92)); box-shadow: inset 0 0 0 1.5px rgba(122, 96, 70, .85), inset 0 0 18px rgba(0, 0, 0, .55), 0 2px 10px rgba(0, 0, 0, .5); }
.gw-loop-on .gw-orders::before { content: ''; position: absolute; inset: 4px; border-radius: 4px; border: 1px solid rgba(214, 214, 228, .08); pointer-events: none; }
.gw-loop-on .gw-orders-list { display: flex; flex-direction: column; gap: 4px; list-style: none; margin: 0; padding: 0; }
.gw-loop-on .gw-order { display: flex; align-items: center; gap: 10px; width: 100%; min-height: 48px; padding: 2px 6px; border: none; background: none; cursor: pointer;
  color: #e6e2d8; font: 400 18px/1.2 var(--f-hand, var(--f-body)); text-align: left; text-shadow: 0 0 6px rgba(230, 226, 216, .25); -webkit-tap-highlight-color: transparent; }
.gw-loop-on .gw-order canvas { flex: none; opacity: .85; filter: grayscale(1) brightness(1.4); }
.gw-loop-on .gw-order:hover, .gw-loop-on .gw-order:focus-visible { outline: none; background: rgba(214, 214, 228, .05); border-radius: 4px; }
.gw-loop-on .gw-order.gw-wiped { opacity: .25; transition: opacity .3s; }
.gw-loop-on .gw-chalk-tick { display: inline-flex; vertical-align: middle; margin-left: 4px; }
.gw-loop-on .gw-chalk-tick svg { width: 22px; height: 16px; fill: none; stroke: #ebe6da; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round;
  filter: drop-shadow(0 0 3px rgba(235, 230, 218, .35)); }
.gw-loop-on .gw-cc-letgo { position: relative; overflow: hidden; }
.gw-loop-on .gw-cc-letgo .gw-cut-knife { display: none; margin-right: 6px; vertical-align: middle; }
.gw-loop-on .gw-cc-letgo .gw-cut-knife svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.gw-loop-on .gw-cc-letgo.gw-cutting .gw-cut-knife { display: inline-flex; }
.gw-loop-on .gw-cc-letgo .gw-cut-fill { position: absolute; left: 10%; right: 10%; bottom: 6px; height: 2px; background: var(--ink-dim); transform: scaleX(0); transform-origin: left; pointer-events: none; }
.gw-loop-on .gw-cc-letgo.gw-cutting .gw-cut-fill { transform: scaleX(1); transition: transform var(--cut, .6s) linear; }
`;
const CSS_HUD = `
.gw-loop-on .gw-gear-hud { display: flex; align-items: center; gap: 10px; margin-top: 6px; min-height: 26px; pointer-events: none; color: var(--ink-dim); }
.gw-loop-on .gw-gear-hud[hidden] { display: none; }
.gw-loop-on .gw-gear-hud i { display: inline-flex; align-items: center; gap: 3px; font: 500 16px/1 var(--f-body); font-style: normal; color: var(--ink); text-shadow: var(--ink-shadow); }
.gw-loop-on .gw-gear-hud .gw-ico { width: 22px; height: 22px; filter: drop-shadow(0 1px 2px #000); }
`;
// >>> WC-3 (WATERCRAFT §3.9): the gear log's Who bites, under a Mossmere tin's or lure's Hold line
const CSS_WB = `
.gw-wb { margin: 8px 0 2px; padding: 6px 10px 6px; border-radius: 4px; background: rgba(10, 9, 26, .35); box-shadow: inset 0 0 0 1px rgba(214, 214, 228, .1); }
.gw-wb-h { font: 400 15px/1.2 var(--f-head, var(--f-body)); letter-spacing: .06em; color: var(--ink-dim); margin: 0 0 4px; }
.gw-wb table { width: 100%; border-collapse: collapse; font: 400 15px/1.35 var(--f-body); color: var(--ink); font-variant-numeric: tabular-nums; }
.gw-wb th { font-weight: 400; font-size: 13px; color: var(--ink-dim); text-align: right; padding: 0 0 2px 10px; }
.gw-wb th:first-child, .gw-wb td:first-child { text-align: left; padding-left: 0; }
.gw-wb td { text-align: right; padding: 1px 0 1px 10px; border-top: 1px solid rgba(214, 214, 228, .06); }
.gw-wb td.gw-wb-b { color: var(--ink-dim); }
.gw-wb-more { margin: 4px 0 0; font: italic 400 14px/1.3 var(--f-body); color: var(--ink-dim); }
`;
const wbCache = new Map();
/** The Who bites block's HTML for a gear-log row (a Mossmere tin or lure under the loop), or '' for anything else. o = {met (Set, array
 *  or function), names (id → name), esc}. The table is computed once per item (watercraft.bitesTable is pure on the data). */
export function whoBitesHtml(D, e, { met = null, names = {}, esc = (s) => String(s ?? '') } = {}) {
  if (!D || D.LOOP_ENABLED !== true || !e || !['bait', 'lure'].includes(e.kind) || e.id === 'bare' || !WC_ITEMS.includes(e.id)) return '';
  let rows = wbCache.get(e.id);
  if (!rows) { rows = bitesTable(D, WC_LURES.includes(e.id) ? { lure: e.id } : { bait: e.id }); wbCache.set(e.id, rows); }
  const v = bitesBlock(D, rows, { met, names, item: gearName(D, e.id) || e.name || '' });
  if (!v.rows.length && !v.more) return '';
  return `<div class="gw-wb" data-loop="whobites"><div class="gw-wb-h">${esc(v.heading)}</div>${v.rows.length ? `<table><thead><tr><th></th><th>${esc(v.cols[0])}</th><th>${esc(v.cols[1])}</th></tr></thead><tbody>${
    v.rows.map((r) => `<tr data-fish="${esc(r.id)}"><td>${esc(r.name)}</td><td>${esc(r.on)}</td><td class="gw-wb-b">${esc(r.bare)}</td></tr>`).join('')}</tbody></table>` : ''}${v.more ? `<p class="gw-wb-more">${esc(v.more)}</p>` : ''}</div>`;
}
// <<< WC-3
const KNIFE = '<i class="gw-cut-knife" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3.5 20.5 L13.5 10.5 M13.5 10.5 C16 8 18.5 5 20.5 3.5 C19.5 7 17 10 14.6 12.4 Z M5.6 16.2 L7.8 18.4"/></svg></i>';

/**
 * The view (createLoopView calls it once): K is ui-loop's kit ({ctx, h, D, sfx, …}); L(name, …) calls ctx.progression.loop; murkToast
 * shows one of Murk's lines on the water. → {placeSlots, shelfBoard}; cardHooks is exported for ui-screens.
 */
export function createGearView({ K, L, D, report = () => {}, murkToast = null }) {
  const h = K.h;
  try {
    if (typeof document !== 'undefined' && !document.getElementById('gw-gear-css')) {
      const st = document.createElement('style'); st.id = 'gw-gear-css'; st.textContent = CSS + CSS_HUD + CSS_WB; document.head.appendChild(st);
    }
  } catch (e) { report('gear.css', e); }

  function slotButton({ slot, id, glyph, count = null, fitted, empty, label, onTap }) {
    const b = h('button', `gw-bait-slot${slot === 'lure' ? ' gw-lure-slot' : ''}${fitted ? ' gw-fitted' : ''}${empty ? ' gw-empty' : ''}`);
    b.type = 'button';
    b.dataset.slot = slot;
    if (id) b.dataset[slot] = id;
    b.setAttribute('aria-label', label);
    b.setAttribute('aria-pressed', String(!!fitted));
    b.innerHTML = `<span class="gw-bait-cradle" aria-hidden="true"></span><span class="gw-bait-ball" aria-hidden="true">${icon(glyph)}</span>${count != null && !empty ? `<b class="gw-bait-n">${Math.max(0, Math.floor(num(count)))}</b>` : ''}`;
    b.addEventListener('click', (e) => { e.stopPropagation(); onTap(); });
    return b;
  }
  /**
   * The Chart's foot (ui-loop's placeBaitSlot calls it after 3a's bait slot is placed): once the bag holds a tin or Cut Strip, the bait
   * slot cycles every bait the bag holds (the ball first, as 3a's, then the tins, then a bare hook); and with a lure owned, the lure slot
   * before it. → the lure slot's element, or null.
   */
  function placeSlots(root, model, entry, ballEl, sail) {
    try {
      if (!isObj(model) || model.tutorial === true || !sail) return null;
      const ml = L('state') || {}, water = model.pick?.water || model.sheets?.[0]?.waterId || 'mossmere';
      const rerender = () => entry?.render?.();
      const choices = baitChoices(D(), ml, water);
      const tins = choices.some((c) => c.id !== D()?.LOOP?.legendBait?.[water]?.id);
      let baitEl = ballEl;
      if (tins) {
        const fitted = ml.fitted?.bait ?? null, cur = choices.find((c) => c.id === fitted) || null, next = nextChoice(choices, fitted);
        const show = cur || choices[0];
        const el = slotButton({ slot: 'bait', id: cur?.id ?? null, glyph: show?.glyph || 'worm', count: (cur || show)?.count ?? 0, fitted: !!cur, empty: !cur,
          label: gearName(D(), (cur || show)?.id || 'mireworm'), onTap: () => {
            const res = L('fit', 'bait', next);
            if (res?.ok === true) { K.sfx?.('ui_click', { volume: 0.5 }); rerender(); } else K.sfx?.('denied', { volume: 0.4 });
          } });
        el.classList.add('gw-bait-slot--tins');
        if (ballEl?.parentNode) ballEl.parentNode.replaceChild(el, ballEl); else sail.parentNode.insertBefore(el, sail);
        baitEl = el;
      }
      const lures = lureChoices(D(), ml);
      if (!lures.length || root.querySelector('[data-slot=lure]')) return null;
      const fl = ml.fitted?.lure ?? null, curL = lures.find((c) => c.id === fl) || null, nextL = nextChoice(lures, fl);
      const lel = slotButton({ slot: 'lure', id: curL?.id ?? null, glyph: (curL || lures[0]).glyph, fitted: !!curL, empty: !curL,
        label: gearName(D(), (curL || lures[0]).id), onTap: () => {
          const res = L('fit', 'lure', nextL);
          if (res?.ok === true) { K.sfx?.('ui_click', { volume: 0.5 }); rerender(); } else K.sfx?.('denied', { volume: 0.4 });
        } });
      (baitEl?.parentNode || sail.parentNode).insertBefore(lel, baitEl?.parentNode ? baitEl : sail);
      return lel;
    } catch (e) { report('gear.placeSlots', e); return null; }
  }

  /** Murk's chalk board on his shelf (SPEC §6.3): under his line while the Order Board is owned; each order a button (tap: wipe it). */
  function shelfBoard(pn, before, entry) {
    try {
      const orders = arr(L('orders'));
      if (!orders.length || !pn) return null;
      const board = h('div', 'gw-orders');
      board.dataset.loop = 'orders';
      const ol = h('ol', 'gw-orders-list');
      for (const o of orders) {
        const li = h('li', '');
        const b = h('button', 'gw-order');
        b.type = 'button';
        b.dataset.order = o.id;
        b.setAttribute('aria-label', o.text || '');
        const c = h('canvas', 'gw-order-fish');
        try { drawFishInk(c, D()?.SPECIES_BY_ID?.[o.speciesId], { w: 52, h: 26, pad: 0.04, gain: 6, color: '#e6e2d8' }); } catch (e) { report('gear.orderArt', e); }
        b.appendChild(c);
        const t = h('span', 'gw-order-text');
        t.textContent = o.text || '';
        b.appendChild(t);
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          b.classList.add('gw-wiped');
          K.sfx?.('ui_click', { volume: 0.45 });
          L('wipeOrder', o.id);
          setTimeout(() => entry?.render?.(), 160);
        });
        li.appendChild(b);
        ol.appendChild(li);
      }
      board.appendChild(ol);
      pn.insertBefore(board, before);
      return board;
    } catch (e) { report('gear.shelfBoard', e); return null; }
  }

  // the HUD on the water (SPEC §8.1 "tackle: the lure glyph, the bait glyph with its count"): the line's lure and bait under the hold
  // row, on a trip only; no word, no tap (the slots are the Chart's)
  const hud = h('div', 'gw-gear-hud');
  hud.dataset.loop = 'gear';
  hud.hidden = true;
  try { const host = K.layers?.hud; (host?.querySelector('.gw-tl') || host)?.appendChild(hud); } catch (e) { report('gear.hud', e); }
  let hudKey = '';
  function paintHud() {
    try {
      const r = K.ctx?.state?.run;
      const trip = !!r && r.outing === 'trip' && r.active !== false && K.ctx?.flow === 'playing';
      const lure = trip && typeof r.lure === 'string' ? r.lure : null, bait = trip && typeof r.equippedBait === 'string' ? r.equippedBait : null;
      const n = bait ? Math.max(0, Math.floor(num(r.bait?.[bait]))) : 0;
      const key = `${trip}|${lure}|${bait}|${n}`;
      if (key === hudKey) return;
      hudKey = key;
      const hr = hud.parentNode?.querySelector?.('.gw-hold');   // (under the hold row, which the loop's view adds after this view)
      if (hr && hud.previousElementSibling !== hr) hr.after(hud);
      hud.hidden = !trip || (!lure && !(bait && n > 0));
      hud.innerHTML = `${lure ? `<i data-lure="${lure}">${icon(GEAR_GLYPH[lure] || 'hook')}</i>` : ''}${bait && n > 0 ? `<i data-bait="${bait}">${icon(GEAR_GLYPH[bait] || 'worm')}<b>${n}</b></i>` : ''}`;
    } catch (e) { report('gear.paintHud', e); }
  }
  try { for (const ev of ['run:start', 'run:end', 'bait:change', 'fishing:cast', 'fishing:bite', 'fish:action', 'flow:change', 'home:enter', 'loop:fit']) K.ctx?.bus?.on?.(ev, () => { hudKey = ''; paintHud(); }); } catch (e) { report('gear.hudBus', e); }

  // Murk's first-Small line (SPEC §8.6: "Small ones make good bait. Hold Let go."), once a save, when the first Small is kept
  try {
    K.ctx?.bus?.on?.('fish:action', (p) => {
      if (p?.action !== 'keep' || p?.fish?.sizeClass !== 'small' || K.ctx?.state?.run?.outing !== 'trip') return;
      const line = L('sayOnce', 'firstSmall');
      if (line && typeof murkToast === 'function') murkToast(line);
    });
  } catch (e) { report('gear.firstSmall', e); }

  return { placeSlots, shelfBoard, paintHud };
}

/**
 * The catch card on a trip (ui-screens' loop card calls it with its two buttons): Keep's chalk tick when the fish fills one of Murk's
 * orders; Let go held LOOP.cut.hold s on a Small or a Keeper (never a giant or the legend) shows a knife and cuts the fish into Cut
 * Strip (loop.cutBait), closing the card. `close()` closes it; `state.locked` stops a second action.
 */
export function cardHooks({ ctx, fish, sp = null, keepBtn = null, letBtn = null, state = {}, close = () => {}, report = () => {} }) {
  const loop = ctx?.progression?.loop;
  if (!loop || typeof loop !== 'object' || !fish) return;
  try {
    if (keepBtn && typeof loop.orderFor === 'function' && loop.orderFor(fish)) {
      (keepBtn.querySelector('em') || keepBtn).insertAdjacentHTML('beforeend', CHALK_TICK);
      keepBtn.classList.add('gw-cc-order');
    }
  } catch (e) { report('gear.orderTick', e); }
  try {
    const C = ctx.data?.LOOP?.cut || { classes: ['small', 'keeper'], hold: 0.6 };
    const can = letBtn && typeof loop.cutBait === 'function' && arr(C.classes).includes(fish.sizeClass) && fish.giant !== true && fish.legendary !== true
      && sp?.giant !== true && sp?.rarity !== 'legendary';
    if (!can) return;
    letBtn.insertAdjacentHTML('afterbegin', KNIFE);
    letBtn.insertAdjacentHTML('beforeend', '<i class="gw-cut-fill" aria-hidden="true"></i>');
    const ms = Math.max(200, num(C.hold, 0.6) * 1000);
    letBtn.style.setProperty('--cut', `${ms / 1000}s`);
    let timer = null;
    const cancel = () => { if (timer) { clearTimeout(timer); timer = null; } letBtn.classList.remove('gw-cutting'); };
    letBtn.addEventListener('pointerdown', (e) => {
      if (state.locked || (e.button != null && e.button !== 0)) return;
      cancel();
      letBtn.classList.add('gw-cutting');
      timer = setTimeout(() => {
        timer = null;
        if (state.locked) return;
        const res = loop.cutBait(fish);
        if (res?.ok === true) { state.locked = true; try { ctx.audio?.play?.('ui_click', { volume: 0.5 }); } catch { /* optional */ } close(); }
        else letBtn.classList.remove('gw-cutting');
      }, ms);
    });
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) letBtn.addEventListener(ev, () => { if (timer) cancel(); });
  } catch (e) { report('gear.cut', e); }
}
