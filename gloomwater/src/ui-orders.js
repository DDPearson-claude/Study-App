// ui-orders.js — Murk's orders on the water (the user's words of 17 November 2026: "When you buy murks board it doesn't tell you what
// he wants you to catch anywhere that I can see"). A small chalk slate in the HUD beside the hold row while an order is open: each
// order's fish as its small ink drawing (drawFishInk, as the shelf's slate draws them), no words; a hover or a tap shows the order's own
// text in a small tip. It keeps out of a fish on the line (the bite, the strike's gauge, the play, the landing, the catch show) and any
// screen over the water; a fish in the hold that fills an order puts the chalk tick on its drawing (the order leaves at home, as the
// tally settles it). It finds a place clear of the HUD's pieces (beside the hold row, beside the tackle tin, or under it) and hides
// when none is clear. Read only under the loop (ui-loop builds it: one line, and its update ticks it).
// Selectors: [data-loop=oslate], [data-order], .gw-oslate-tip.
import { drawFishInk } from './ui-fishart.js';
import { slateOrders, slateShown } from './loop-gear.js';
import { CHALK_TICK } from './ui-gear.js';

const CSS = `
.gw-oslate { position: absolute; left: 0; top: 0; z-index: 3; display: flex; align-items: center; gap: 2px; padding: 4px 7px; border-radius: 5px; pointer-events: auto;
  background: linear-gradient(180deg, rgba(38, 42, 54, .9), rgba(24, 27, 38, .9));
  box-shadow: inset 0 0 0 1.5px rgba(122, 96, 70, .9), inset 0 0 12px rgba(0, 0, 0, .55), 0 2px 8px rgba(0, 0, 0, .5); transform: rotate(-1.2deg);
  opacity: 0; transition: opacity .35s ease; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
.gw-oslate::before { content: ''; position: absolute; inset: 3px; border-radius: 3px; border: 1px solid rgba(214, 214, 228, .08); pointer-events: none; }
.gw-oslate.gw-in { opacity: 1; }
.gw-oslate[hidden] { display: none; }
.gw-oslate-o { position: relative; flex: none; width: 40px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.gw-oslate-o canvas { display: block; width: 36px; height: 18px; opacity: .88; filter: grayscale(1) brightness(1.4) drop-shadow(0 0 2px rgba(230, 226, 216, .2)); }
.gw-oslate-o.gw-done canvas { opacity: .45; }
.gw-oslate-o .gw-chalk-tick { position: absolute; right: -1px; top: -1px; margin: 0; }
.gw-oslate-o .gw-chalk-tick svg { width: 17px; height: 12px; }
.gw-oslate-tip { position: absolute; top: calc(100% + 8px); left: 0; margin: 0; padding: 5px 10px 4px; border-radius: 4px; white-space: nowrap; pointer-events: none;
  background: rgba(24, 27, 38, .94); box-shadow: inset 0 0 0 1px rgba(122, 96, 70, .8), 0 2px 8px rgba(0, 0, 0, .5);
  color: #e6e2d8; font: 400 17px/1.2 var(--f-hand, var(--f-body)); text-shadow: 0 0 6px rgba(230, 226, 216, .25); transform: rotate(1.2deg);
  opacity: 0; transition: opacity .2s ease; }
.gw-oslate-tip.gw-r { left: auto; right: 0; }
.gw-oslate-tip.gw-in { opacity: 1; }
`;

/** The slate keeps clear of every visible piece of the HUD, the toasts and the banner: each leaf (a word, a glyph, a button, a drawing)
 *  smaller than a fifth of the screen (a full-screen veil or the touch zone is not a piece); the touch stick's base whole. */
const LEAF = new Set(['BUTTON', 'svg', 'CANVAS', 'KBD', 'IMG']);
const WHOLE = ['.gw-joy-base'];
const GAP = 12;

export function createOrderSlate({ K, L, D, trip, report = () => {} }) {
  try {
    if (typeof document !== 'undefined' && !document.getElementById('gw-oslate-css')) {
      const st = document.createElement('style'); st.id = 'gw-oslate-css'; st.textContent = CSS; document.head.appendChild(st);
    }
  } catch (e) { report('oslate.css', e); }
  const hud = K.layers?.hud;
  const el = document.createElement('div');
  el.className = 'gw-oslate';
  el.dataset.loop = 'oslate';
  el.hidden = true;
  const tip = document.createElement('p');
  tip.className = 'gw-oslate-tip';
  tip.setAttribute('aria-live', 'polite');
  try { hud?.appendChild(el); } catch (e) { report('oslate.mount', e); }
  let sig = '', acc = 1, tipT = 0, tipFor = null, list = [], why = 'boot';
  const art = new Map();

  const visible = (n) => {
    if (!n || n === el || el.contains(n) || n.hidden) return null;
    if (typeof n.checkVisibility === 'function' && !n.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return null;
    const r = n.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return null;
    const cs = getComputedStyle(n);
    return cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.05 ? null : r;
  };
  function avoidRects() {
    const out = [], big = innerWidth * innerHeight * 0.2;
    for (const root of [K.layers?.hud, K.layers?.toasts, K.layers?.banner]) {
      if (!root) continue;
      for (const n of root.querySelectorAll('*')) {
        if (n === el || el.contains(n)) continue;
        const up = n.parentElement?.closest('button, svg, .gw-joy-base');
        if (up && root.contains(up)) continue;   // (inside a piece already counted whole)
        if (!(LEAF.has(n.tagName) || n.childElementCount === 0 || WHOLE.some((sel) => n.matches(sel)))) continue;
        const r = visible(n);
        if (r && r.width * r.height <= big) out.push(r);
      }
    }
    return out;
  }
  /** Beside the hold row, else beside the tackle tin, else under it; the first clear of every HUD piece and inside the screen. */
  function place() {
    const hold = hud?.querySelector('.gw-hold'), hr = hold ? visible(hold) : null;
    if (!hr) { el.style.visibility = 'hidden'; why = 'no hold row'; return false; }
    const tin = hud.querySelector('.gw-tk-tin'), tr = tin ? visible(tin) : null;
    const host = hud.getBoundingClientRect();
    const w = el.offsetWidth, h = el.offsetHeight, vw = innerWidth, vh = innerHeight;
    const cand = [{ x: hr.right + GAP, y: hr.top + (hr.height - h) / 2 }];
    if (tr) cand.push({ x: tr.right + GAP + 6, y: tr.top + (tr.height - h) / 2 }, { x: hr.left, y: tr.bottom + GAP });
    else cand.push({ x: hr.left, y: hr.bottom + GAP });
    const avoid = avoidRects();
    const hit = (c) => avoid.some((r) => c.x < r.right + 6 && c.x + w > r.left - 6 && c.y < r.bottom + 6 && c.y + h > r.top - 6);
    const ok = cand.find((c) => c.x >= 8 && c.y >= 8 && c.x + w <= vw - 8 && c.y + h <= vh - 8 && !hit(c));
    if (!ok) { el.style.visibility = 'hidden'; why = `no clear place: ${JSON.stringify({ cand: cand.map((c) => [Math.round(c.x), Math.round(c.y)]), w, h, hits: avoid.filter((r) => cand.some((c) => c.x < r.right + 6 && c.x + w > r.left - 6 && c.y < r.bottom + 6 && c.y + h > r.top - 6)).map((r) => [r.left, r.top, r.right, r.bottom].map(Math.round)), vw, vh })}`; return false; }
    el.style.left = `${Math.round(ok.x - host.left)}px`;
    el.style.top = `${Math.round(ok.y - host.top)}px`;
    el.style.visibility = '';
    // the tip under the slate: it opens to the left when the screen's edge is near
    tip.classList.toggle('gw-r', ok.x + 220 > vw - 8);
    return true;
  }
  function showTip(o, dur = 0) {
    if (!o) { tip.classList.remove('gw-in'); tipFor = null; tipT = 0; return; }
    tip.textContent = o.text || '';
    if (!tip.isConnected) el.appendChild(tip);
    tipFor = o.id; tipT = dur;
    void tip.offsetWidth; tip.classList.add('gw-in');
  }
  function paint(orders) {
    list = orders;
    el.innerHTML = '';
    for (const o of orders) {
      const c = document.createElement('span');
      c.className = `gw-oslate-o${o.done ? ' gw-done' : ''}`;
      c.dataset.order = o.id;
      c.setAttribute('role', 'img');
      c.setAttribute('aria-label', o.text || '');
      let cv = art.get(o.speciesId);
      if (!cv) {
        cv = document.createElement('canvas');
        try { drawFishInk(cv, D()?.SPECIES_BY_ID?.[o.speciesId], { w: 36, h: 18, pad: 0.04, gain: 6, color: '#e6e2d8' }); } catch (e) { report('oslate.art', e); }
        art.set(o.speciesId, cv);
      }
      c.appendChild(cv);
      if (o.done) c.insertAdjacentHTML('beforeend', CHALK_TICK);
      c.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') showTip(o); });
      c.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && tipFor === o.id && !(tipT > 0)) showTip(null); });
      c.addEventListener('click', (e) => { e.stopPropagation(); if (tipFor === o.id && tipT > 0) showTip(null); else { showTip(o, 2.8); K.sfx?.('ui_hover', { volume: 0.35 }); } });
      el.appendChild(c);
    }
    if (tipFor) { const o = orders.find((x) => x.id === tipFor); if (o) { tip.textContent = o.text || ''; el.appendChild(tip); } else showTip(null); }
  }
  el.addEventListener('pointerdown', (e) => { e.stopPropagation(); });
  let wasShown = false;
  /** Ticked by the loop's view each frame: the full check four times a second. */
  let lastOrders = [];
  const quiet = (onTrip, orders) => !slateShown({ trip: onTrip, flow: K.ctx?.flow, orders, fishing: K.ctx?.fishing?.inShow === true ? 'show' : (K.ctx?.fishing?.state ?? 'idle'), modal: K.top?.()?.id ?? null });
  function hide() {
    if (wasShown || !el.hidden) { el.classList.remove('gw-in'); el.hidden = true; showTip(null); }   // (at once: a bite is a sharp moment)
    wasShown = false;
  }
  function update(dt) {
    if (tipT > 0) { tipT -= dt; if (tipT <= 0) showTip(null); }
    // every frame, cheaply: a fish on the line or a screen over the water hides it at once
    if (wasShown && quiet(trip(), lastOrders)) { why = 'quiet'; hide(); }
    acc += dt;
    if (acc < 0.25) return;
    acc = 0;
    try {
      const onTrip = trip();
      const orders = onTrip ? (L('orders') || []) : [];
      lastOrders = orders;
      if (quiet(onTrip, orders)) { why = `off: ${JSON.stringify({ trip: onTrip, flow: K.ctx?.flow, n: orders.length, fishing: K.ctx?.fishing?.state, modal: K.top?.()?.id ?? null })}`; hide(); return; }
      why = 'shown';
      const model = slateOrders(D(), orders, K.ctx?.state?.run?.creel);
      const s = model.map((o) => `${o.id}:${o.done ? 1 : 0}:${o.text}`).join('|');
      if (s !== sig) { sig = s; paint(model); }
      el.hidden = false;
      const placed = place();
      if (placed && !el.classList.contains('gw-in')) { void el.offsetWidth; el.classList.add('gw-in'); }
      wasShown = true;
    } catch (e) { report('oslate.update', e); }
  }
  return { update, el, debug: () => ({ why, shown: wasShown && !el.hidden && el.style.visibility !== 'hidden', n: list.length, done: list.filter((o) => o.done).length, rect: el.getBoundingClientRect().toJSON?.() ?? null, tip: tip.classList.contains('gw-in') ? tip.textContent : null }) };
}
