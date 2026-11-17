// ui-tackle.js — TK, the tackle tin (the user's words of 16 November 2026, during play-testing: "We should have an option to equip bait
// or change lures whilst out on the lake"; SPEC §16 answer 43 superseded; CONTRACT §14.19). Built only under the loop: ui-loop's
// createLoopView calls createTackleView once and hands it the B key and its frame.
//   - THE TIN: a small engraved tackle tin in the HUD's top-left corner, under the hold row (where the gear glyphs sat: they make way for
//     it), on a trip once the tutorial is done. Its two compartments show what is on the hook: the bait's own glyph with its count left,
//     and the lure's glyph beside it (a bare hook and no lure drawn plainly). Tap, click or B opens the drawer. While a fish is on its
//     contents dim, and a tap gives the soft denied sound and one line: "After this fish.". Never near the raft, no ring, no disc.
//   - THE DRAWER: two short rows, Bait (every bait in the trip's bag with a count, then a bare hook) and Lure (every owned lure, then
//     none), each item its engraving (Murk's catalogue's, murk-engrave.js), its name and its count; the one on the hook pressed. A tap
//     changes the hook through loop.changeHook (a waiting line comes in quietly when the drawer closes; its bait is back in the bag at
//     once). No odds, no percentages, no "likes": those live in the logs. Anchored under the tin on a desktop; a bottom sheet on a phone
//     (thumb-reachable, every target ≥ 44 px). A blocking modal: the evening waits while it is open.
// Sounds: a tin lid's soft click on open and on a change (ui_click, low), the line's reel-in (reel_ratchet, light) as a waiting line
// comes in. Its CSS is its own (one <style>, injected once). The pure model (tackleModel) is node-tested (tools/tests/loop-tackle.test.mjs).
import { icon } from './ui-icons.js';
import { engrave } from './murk-engrave.js';
import { gearName } from './loop-gear.js';
import { GEAR_GLYPH } from './ui-gear.js';
import { drawFindArt } from './ui-finds.js';   // LOST-TACKLE §2.1: a found piece's drawing in the Kit and Lure rows
import { ownedPieces, foundOf } from './loop-finds.js';

const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const arr = (v) => (Array.isArray(v) ? v : []);
const int = (v) => { const n = Math.floor(Number(v)); return Number.isFinite(n) ? Math.max(0, n) : 0; };

/** The words (TEXT_LOOP.tackle), with their fallbacks. */
export function tackleWords(D) {
  const T = isObj(D?.TEXT_LOOP?.tackle) ? D.TEXT_LOOP.tackle : {};
  return { tin: T.tin || 'Tackle', bait: T.bait || 'Bait', lure: T.lure || 'Lure', kit: T.kit || 'Kit', bare: T.bare || 'Bare hook', none: T.none || 'No lure', after: T.after || 'After this fish.' };
}
/** A bait's or a lure's name as the shelf names it (TEXT_LOOP.gearItems, else the built record's). */
const nameOf = (D, id) => gearName(D, id) || arr(D?.BAITS).find((b) => b?.id === id)?.name || String(id);
/** The engraving's card for an item (murk-engrave's plateKey): a tin, Cut Strip, the legend's ball, a lure. */
export function artCard(D, kind, id) {
  if (kind === 'lure') return { id: `lure:${id}` };
  if (id === 'cut_strip') return { id: 'tin:cut_strip' };
  if (arr(D?.BAITS).find((b) => b?.id === id)?.legend) return { id: `bait:${id}` };
  return { id: `tin:${id}` };
}

/**
 * The tin's and the drawer's model (pure). run: the trip's run (its bag run.bait, run.equippedBait, run.lure, run.zone); metaLoop: the
 * save's block (its owned lures); line: fishing.hookLine() ({out, castBait}: while a line is out the hook carries the cast's bait).
 * → {bait: [{id, name, count, glyph, on}], lure: [{id, name, glyph, on, found}], kit: [{id, slot, name, on}], baitOn, lureOn, count}: the
 * bait row is the legend's ball, the water's tins and Cut Strip the bag holds (or the one on the hook), then the bare hook (id null); the
 * lure row every owned lure in LOOP.lures' order, then none (id null); the Kit row (LOST-TACKLE §2.1) each owned found rod, line or reel,
 * pressed while fitted ([] until one is owned: the row is not drawn). No odds, no likes: names, counts and glyphs only.
 */
export function tackleModel(D, { run = null, metaLoop = null, line = null } = {}) {
  const r = isObj(run) ? run : {}, ml = isObj(metaLoop) ? metaLoop : {}, W = tackleWords(D);
  const zone = typeof r.zone === 'string' ? r.zone : 'mossmere', bag = isObj(r.bait) ? r.bait : {};
  const baitOn = line?.out === true && typeof line.castBait === 'string' ? line.castBait : (typeof r.equippedBait === 'string' ? r.equippedBait : null);
  const lureOn = typeof r.lure === 'string' ? r.lure : null;
  const ids = [D?.LOOP?.legendBait?.[zone]?.id, ...arr(D?.LOOP?.tins?.[zone]), 'cut_strip'].filter((id, i, a) => typeof id === 'string' && a.indexOf(id) === i);
  if (baitOn && !ids.includes(baitOn)) ids.push(baitOn);
  const bait = ids.filter((id) => int(bag[id]) > 0 || id === baitOn)
    .map((id) => ({ id, name: nameOf(D, id), count: int(bag[id]), glyph: GEAR_GLYPH[id] || 'worm', on: id === baitOn }));
  bait.push({ id: null, name: W.bare, count: null, glyph: 'hook', on: baitOn == null && lureOn == null });   // (one thing on the hook: one pressed)
  const own = new Set(arr(ml.lures));
  const lure = Object.keys(isObj(D?.LOOP?.lures) ? D.LOOP.lures : {}).filter((id) => own.has(id) || id === lureOn)
    .map((id) => ({ id, name: nameOf(D, id), glyph: GEAR_GLYPH[id] || 'spoon', on: id === lureOn, ...(D?.LOOP?.lures?.[id]?.found ? { found: true } : {}) }));
  lure.push({ id: null, name: W.none, glyph: null, on: false });
  const kit = ownedPieces(ml, D).map((id) => { const slot = D?.LOOP?.lostTackle?.[id]?.slot; return { id, slot, name: D?.TEXT_LOOP?.finds?.items?.[id]?.name || id, on: foundOf(ml, D, slot) === id }; });
  return { bait, lure, kit, baitOn, lureOn, count: baitOn ? int(bag[baitOn]) : null };
}

// ------------------------------------------------------------------ drawings
/** The tin itself (viewBox 108 × 52): a flat tackle tin seen from above, its rolled rim, two compartments, small engraved curls. */
const TIN_SVG = `<svg class="gw-tk-tin-svg" viewBox="0 0 108 56" aria-hidden="true" focusable="false">
  <path class="gw-tk-wallf" d="M3 36V45C3 49 5.5 52 10 52H98C102.5 52 105 49 105 45V36"/>
  <path class="gw-tk-hatch" d="M10 43V49M16 43.5V50M22 44V50.5M28 44V50.5M34 44V50.5M40 44V50.5M46 44V50.5M52 44V50.5M58 44V50.5M64 44V50.5M70 44V50.5M76 44V50.5M82 44V50.5M88 44V50.5M94 44V50M100 43.5V49"/>
  <path class="gw-tk-body" d="M10 4H98C102.5 4 105 6.5 105 11V35C105 39.5 102.5 42 98 42H10C5.5 42 3 39.5 3 35V11C3 6.5 5.5 4 10 4Z"/>
  <path class="gw-tk-rim" d="M11.5 8H96.5C99.5 8 101 9.5 101 12.5V33.5C101 36.5 99.5 38 96.5 38H11.5C8.5 38 7 36.5 7 33.5V12.5C7 9.5 8.5 8 11.5 8Z"/>
  <path class="gw-tk-wall" d="M68 8.5V37.5"/>
  <path class="gw-tk-hinge" d="M24 4.2V1.6H36V4.2M72 4.2V1.6H84V4.2M30 1.6V4.2M78 1.6V4.2"/>
  <path class="gw-tk-curl" d="M14 47C16 45 19 45.5 19 47.5C19 49 17 49.4 16.4 48.2M94 47C92 45 89 45.5 89 47.5C89 49 91 49.4 91.6 48.2"/>
</svg>`;
/** No lure: the bare line's empty snap, drawn plainly. */
const SNAP_SVG = '<svg class="gw-ico gw-tk-snap" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5v5.2"/><path d="M12 7.7c-1.7 0-2.5 1.1-2.5 2.5v6.6c0 1.6.9 2.7 2.5 2.7s2.5-1.1 2.5-2.7v-4.4"/><path d="M14.5 12.4c-.9-.2-1.6.3-1.6 1.1" stroke-opacity=".6"/></svg>';
/** A bare hook and no lure, drawn plainly at the engravings' size (viewBox 200 × 150, the ink a single line). */
const PLAIN = {
  bare: '<svg class="cat-eng gw-tk-plain" viewBox="0 0 200 150" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M112 14V88C112 112 98 124 82 124C66 124 56 112 56 98V90L70 104" stroke-width="5"/><path d="M106 14H118" stroke-width="4"/><circle cx="112" cy="10" r="5" stroke-width="3.4"/>'
    + '<path d="M70 104L62 108" stroke-width="3.4"/><path d="M60 138H140" stroke-width="1.6" stroke-opacity=".45"/></g></svg>',
  none: '<svg class="cat-eng gw-tk-plain" viewBox="0 0 200 150" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M100 4V44" stroke-width="3"/><path d="M100 44C90 44 85 51 85 60V100C85 110 91 117 100 117C109 117 115 110 115 100V74" stroke-width="5"/>'
    + '<path d="M115 74C109 72 104 76 104 81" stroke-width="3.6" stroke-opacity=".7"/><path d="M60 138H140" stroke-width="1.6" stroke-opacity=".45"/></g></svg>',
};
const glyphOf = (g) => (g ? icon(g) : SNAP_SVG);

const CSS = `
.gw-loop-on .gw-hud.gw-tk-on .gw-gear-hud { display: none !important; }
.gw-tk-wrap { position: relative; display: flex; align-items: center; gap: 12px; margin-top: 4px; pointer-events: none; }
.gw-tk-wrap[hidden] { display: none; }
.gw-tk-tin { position: relative; flex: none; width: 108px; height: 56px; padding: 0; border: none; background: none; cursor: pointer; pointer-events: auto;
  color: var(--ink); -webkit-tap-highlight-color: transparent; filter: drop-shadow(0 1px 2px rgba(0, 0, 0, .9)) drop-shadow(0 0 8px rgba(4, 5, 12, .7)); transition: filter .25s; }
.gw-tk-tin::before { content: ''; position: absolute; inset: -12px -22px -12px; z-index: -1; pointer-events: none;
  background: radial-gradient(ellipse 50% 50% at 50% 50%, rgba(var(--veil-rgb), .6), rgba(var(--veil-rgb), .3) 60%, transparent 100%); }
.gw-tk-tin:hover, .gw-tk-tin:focus-visible { outline: none; filter: drop-shadow(0 1px 2px rgba(0, 0, 0, .9)) drop-shadow(0 0 10px var(--glow)); }
.gw-tk-tin-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.gw-tk-tin-svg path { fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; }
.gw-tk-tin-svg .gw-tk-body { fill: rgba(20, 22, 40, .72); stroke-width: 1.5; stroke-opacity: .9; }
.gw-tk-tin-svg .gw-tk-wallf { fill: rgba(8, 9, 20, .8); stroke-width: 1.5; stroke-opacity: .75; }
.gw-tk-tin-svg .gw-tk-hatch { stroke-width: .8; stroke-opacity: .32; }
.gw-tk-tin-svg .gw-tk-rim { stroke-width: .8; stroke-opacity: .38; }
.gw-tk-tin-svg .gw-tk-wall { stroke-width: 1.2; stroke-opacity: .6; }
.gw-tk-tin-svg .gw-tk-hinge { stroke-width: 1.1; stroke-opacity: .7; }
.gw-tk-tin-svg .gw-tk-curl { stroke-width: .9; stroke-opacity: .55; }
.gw-tk-cell { position: absolute; top: 8px; height: 30px; display: flex; align-items: center; justify-content: center; gap: 4px; transition: opacity .3s; }
.gw-tk-cell--bait { left: 7px; width: 61px; }
.gw-tk-cell--lure { left: 68px; width: 33px; }
.gw-tk-cell .gw-ico { width: 24px; height: 24px; color: var(--ink); }
.gw-tk-cell.gw-tk-empty .gw-ico { color: var(--ink-dim); opacity: .72; }
.gw-tk-c { font: 500 17px/1 var(--f-body); color: var(--ink); font-variant-numeric: tabular-nums; text-shadow: var(--ink-shadow); }
.gw-tk-tin.gw-busy .gw-tk-cell { opacity: .34; }
.gw-tk-tin kbd { position: absolute; right: -10px; bottom: -8px; font-size: 14px; color: var(--ink-faint); text-shadow: 0 1px 2px #000, 0 0 6px #000; }
.gw-tk-note { font: italic 400 17px/1.2 var(--f-body); color: var(--ink); white-space: nowrap; text-shadow: var(--ink-shadow); opacity: 0; transform: translateX(-4px);
  transition: opacity .3s, transform .3s; pointer-events: none; }
.gw-tk-note.gw-in { opacity: 1; transform: none; }

.gw-m-tackle .gw-scrim { background: radial-gradient(ellipse 90% 80% at 30% 30%, rgba(var(--veil-rgb), .18), rgba(var(--veil-rgb), .42) 70%, rgba(5, 6, 14, .6)); }
.gw-m-tackle.gw-tk-anchored { align-items: flex-start; justify-content: flex-start; }
.gw-m-tackle.gw-tk-anchored .gw-modal-body { position: absolute; left: var(--tk-x, 24px); top: var(--tk-y, 120px); transform: translateY(-6px); }
.gw-m-tackle.gw-tk-anchored.gw-in .gw-modal-body { transform: none; }
.gw-tk { position: relative; isolation: isolate; width: max-content; max-width: min(620px, calc(100vw - 32px)); padding: 16px 22px 18px; color: var(--ink); }
.gw-tk-rows { display: flex; flex-direction: column; gap: 10px; max-height: calc(100vh - 64px); overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; }
.gw-tk-rows::-webkit-scrollbar { display: none; }
.gw-tk-pool { position: absolute; inset: -40px -70px -50px -60px; z-index: -1; pointer-events: none; background: rgba(var(--veil-rgb), .9);
  -webkit-mask: radial-gradient(ellipse 50% 50% at 50% 50%, #000 62%, transparent 100%); mask: radial-gradient(ellipse 50% 50% at 50% 50%, #000 62%, transparent 100%); }
.gw-tk-h { display: flex; align-items: center; gap: 10px; margin: 0 0 2px; padding-right: 40px; font: 400 16px/1 var(--f-display); letter-spacing: .18em; text-transform: uppercase; color: var(--ink-dim); }
.gw-tk-h::after { content: ''; flex: 1 1 auto; min-width: 40px; max-width: 150px; height: 14px; background: var(--ink-line); -webkit-mask: var(--orn-rule) left center / contain no-repeat; mask: var(--orn-rule) left center / contain no-repeat; }
.gw-tk-items { display: flex; flex-wrap: wrap; gap: 4px 6px; }
.gw-tk-it { position: relative; flex: none; width: 108px; min-height: 120px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 3px;
  padding: 6px 4px 6px; border: none; border-radius: 10px; background: none; color: var(--ink-dim); cursor: pointer; text-align: center; -webkit-tap-highlight-color: transparent; transition: color .2s; }
.gw-tk-art { position: relative; display: block; width: 80px; height: 60px; flex: none; color: var(--ink); opacity: .74; transition: opacity .2s, filter .2s; }
.gw-tk-art .cat-eng, .gw-tk-art .gw-tk-find { display: block; width: 100%; height: 100%; }
.gw-tk-art .cat-pp { fill: #0d0f21; }
.gw-tk-art .gw-tk-plain { opacity: .9; }
.gw-tk-name { display: block; max-width: 100%; font: 400 16px/1.15 var(--f-body); color: inherit; overflow-wrap: normal; word-break: normal; hyphens: manual; text-shadow: var(--ink-shadow); }
.gw-tk-n { display: block; font: 500 16px/1 var(--f-body); color: var(--ink-faint); font-variant-numeric: tabular-nums; }
.gw-tk-it:hover, .gw-tk-it:focus-visible { outline: none; color: var(--ink); }
.gw-tk-it:hover .gw-tk-art, .gw-tk-it:focus-visible .gw-tk-art { opacity: .95; }
.gw-tk-it[aria-pressed=true] { color: var(--ink-hi); }
.gw-tk-it[aria-pressed=true] .gw-tk-name { text-shadow: 0 0 14px var(--glow), var(--ink-shadow); }
.gw-tk-it[aria-pressed=true] .gw-tk-n { color: var(--ink); }
.gw-tk-it[aria-pressed=true] .gw-tk-art { opacity: 1; filter: drop-shadow(0 0 7px var(--glow-soft)); }
.gw-tk-name { position: relative; }
.gw-tk-it[aria-pressed=true] .gw-tk-name::after { content: ''; position: absolute; left: 50%; bottom: -5px; width: min(76px, 100%); height: 6px; transform: translateX(-50%);
  background: var(--ink-dim); opacity: .8; -webkit-mask: var(--orn-brush) center / 100% 100% no-repeat; mask: var(--orn-brush) center / 100% 100% no-repeat; }
.gw-tk-it[aria-pressed=true] .gw-tk-n { margin-top: 5px; }
.gw-tk .gw-x { top: 2px; right: 2px; }
.gw-tk .gw-x .gw-ico { width: 20px; height: 20px; }

/* a phone: a bottom sheet, thumb-reachable (every target ≥ 44 px, text ≥ 16 px, nothing cut at 358 px): each item a row of its own, the
   engraving at its left, its name and count beside it, two to a line (five on a phone held sideways) */
.gw-m-tackle.gw-tk-sheet { align-items: flex-end; justify-content: center; padding: 0; }
.gw-m-tackle.gw-tk-sheet .gw-scrim { background: linear-gradient(0deg, rgba(5, 6, 14, .66), rgba(var(--veil-rgb), .3) 60%, rgba(var(--veil-rgb), .2)); }
.gw-m-tackle.gw-tk-sheet .gw-modal-body { width: 100%; align-items: flex-end; transform: translateY(24px); }
.gw-m-tackle.gw-tk-sheet.gw-in .gw-modal-body { transform: none; }
.gw-tk-sheet .gw-tk { width: 100%; max-width: none; padding: 20px max(16px, var(--sar)) calc(var(--sab) + 14px) max(16px, var(--sal)); }
.gw-tk-sheet .gw-tk-rows { gap: 8px; max-width: 700px; margin: 0 auto; max-height: calc(100vh - var(--sat) - var(--sab) - 48px); }
.gw-tk-sheet .gw-tk-pool { inset: -56px 0 0; -webkit-mask: linear-gradient(0deg, #000 calc(100% - 72px), transparent); mask: linear-gradient(0deg, #000 calc(100% - 72px), transparent); background: rgba(var(--veil-rgb), .94); }
.gw-tk-sheet .gw-tk-items { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 2px 8px; }
.gw-tk-sheet .gw-tk-it { width: auto; min-height: 58px; display: grid; grid-template-columns: 46px 1fr; grid-template-rows: auto auto; column-gap: 8px; row-gap: 1px;
  align-items: center; align-content: center; padding: 4px 4px; text-align: left; }
.gw-tk-sheet .gw-tk-art { grid-row: 1 / span 2; width: 46px; height: 35px; opacity: .86; }
.gw-tk-sheet .gw-tk-name { grid-column: 2; align-self: end; }
.gw-tk-sheet .gw-tk-n { grid-column: 2; align-self: start; }
.gw-tk-sheet .gw-tk-it:not(:has(.gw-tk-n)) .gw-tk-name { grid-row: 1 / span 2; align-self: center; }
.gw-tk-sheet .gw-tk-it[aria-pressed=true] .gw-tk-name::after { left: 0; transform: none; width: min(64px, 100%); bottom: -4px; }
.gw-tk-sheet .gw-tk-it[aria-pressed=true] .gw-tk-n { margin-top: 4px; }
.gw-tk-sheet .gw-tk-h { font-size: 16px; }
.gw-tk-sheet .gw-x { right: max(4px, var(--sar)); top: 4px; }
.gw-tk-sheet.gw-tk-low .gw-tk { padding-top: 12px; }
.gw-tk-sheet.gw-tk-low .gw-tk-rows { gap: 4px; }
.gw-tk-sheet.gw-tk-low .gw-tk-it { min-height: 52px; }
@media (max-width: 700px) {
  .gw-tk-wrap { margin-top: 2px; }
}
@media (prefers-reduced-motion: reduce) { .gw-tk-note, .gw-m-tackle .gw-modal-body { transition: none; } }
`;

/**
 * The view (ui-loop's createLoopView calls it once): K is ui's kit; L(name, …) calls ctx.progression.loop. → {update, toggle, open,
 * close, isOpen, paint, debug}; ui-loop routes B to toggle() on a trip and calls update() every frame.
 */
export function createTackleView({ K, L, D, report = () => {} }) {
  const h = K.h, ctx = K.ctx;
  try {
    if (typeof document !== 'undefined' && !document.getElementById('gw-tackle-css')) {
      const st = document.createElement('style'); st.id = 'gw-tackle-css'; st.textContent = CSS; document.head.appendChild(st);
    }
  } catch (e) { report('tackle.css', e); }
  const W = () => tackleWords(D());
  const sfx = (name, o) => { try { K.sfx?.(name, o); } catch { /* audio optional */ } };
  const run = () => ctx?.state?.run || null;
  const line = () => { try { const l = ctx.fishing?.hookLine?.(); return isObj(l) ? l : null; } catch { return null; } };
  const onTrip = () => { const r = run(); return !!r && r.outing === 'trip' && r.active !== false && ctx.flow === 'playing'; };
  const tutorialDone = () => L('tutorial')?.done === true;

  // ---------------------------------------------------------------- the tin
  const wrap = h('div', 'gw-tk-wrap');
  wrap.dataset.loop = 'tackle-tin';
  wrap.hidden = true;
  const tin = h('button', 'gw-tk-tin');
  tin.type = 'button';
  tin.dataset.loop = 'tin';
  tin.setAttribute('aria-haspopup', 'dialog');
  const note = h('span', 'gw-tk-note');
  note.setAttribute('aria-live', 'polite');
  wrap.appendChild(tin);
  wrap.appendChild(note);
  const hudEl = K.layers?.hud;
  try { (hudEl?.querySelector('.gw-tl') || hudEl)?.appendChild(wrap); } catch (e) { report('tackle.mount', e); }
  try { hudEl?.classList.add('gw-tk-on'); } catch { /* ignore */ }
  let key = '', noteT = 0;
  function paint(force = false) {
    try {
      const show = onTrip() && tutorialDone();
      const l = show ? line() : null;
      const busy = show && L('canChangeHook') === false;
      const m = show ? tackleModel(D(), { run: run(), metaLoop: L('state'), line: l }) : null;
      const k = show ? `${m.baitOn}|${m.count}|${m.lureOn}|${busy}` : 'off';
      if (!force && k === key) return;
      key = k;
      // (under the hold row, which the loop's view places first in the corner)
      const hr = wrap.parentNode?.querySelector?.(':scope > .gw-hold');
      if (hr && wrap.previousElementSibling !== hr) hr.after(wrap);
      wrap.hidden = !show;
      if (!show) { closeDrawer({ quiet: true }); return; }
      const b = m.bait.find((x) => x.on) || m.bait[m.bait.length - 1], u = m.lure.find((x) => x.on) || m.lure[m.lure.length - 1];
      tin.classList.toggle('gw-busy', busy);
      tin.dataset.bait = b.id ?? '';
      tin.dataset.lure = u.id ?? '';
      tin.setAttribute('aria-label', `${W().tin}: ${b.name}${b.count != null ? ` ${b.count}` : ''} · ${u.name}`);
      tin.innerHTML = `${TIN_SVG}<span class="gw-tk-cell gw-tk-cell--bait${b.id ? '' : ' gw-tk-empty'}">${glyphOf(b.glyph)}${b.id ? `<b class="gw-tk-c">${m.count ?? 0}</b>` : ''}</span>`
        + `<span class="gw-tk-cell gw-tk-cell--lure${u.id ? '' : ' gw-tk-empty'}">${glyphOf(u.glyph)}</span><kbd>B</kbd>`;
    } catch (e) { report('tackle.paint', e); }
  }
  function sayAfter() {
    note.textContent = W().after;
    note.classList.add('gw-in');
    noteT = 1.8;
  }
  /** A tap on the tin (or B): the drawer, or while a fish is on the soft denied sound and one line. */
  function tapTin({ key = false } = {}) {
    if (!onTrip() || !tutorialDone()) return false;
    if (L('canChangeHook') !== true) { sfx('denied', { volume: 0.35 }); sayAfter(); paint(true); return true; }
    openDrawer({ key });
    return true;
  }
  tin.addEventListener('pointerdown', (e) => { e.stopPropagation(); });
  tin.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); tapTin(); });
  try { for (const ev of ['run:start', 'run:end', 'bait:change', 'loop:fit', 'loop:hook', 'loop:found', 'fishing:cast', 'fishing:bite', 'fishing:state', 'fish:action', 'flow:change', 'home:enter', 'loop:tutorial']) ctx.bus?.on?.(ev, () => paint()); } catch (e) { report('tackle.bus', e); }

  // ---------------------------------------------------------------- the drawer
  let reeled = false;
  const isOpen = () => !!K.has?.('tackle');
  function layoutClass(entry) {
    const vw = K.vw || (typeof innerWidth === 'number' ? innerWidth : 960), vh = K.vh || (typeof innerHeight === 'number' ? innerHeight : 540);
    const sheet = vw < 700 || (K.isTouch === true && vh < 560);
    const el = entry?.el;
    if (!el) return;
    el.classList.toggle('gw-tk-sheet', sheet);
    el.classList.toggle('gw-tk-low', sheet && vh < 560);
    el.classList.toggle('gw-tk-anchored', !sheet);
    if (!sheet) {
      const r = tin.getBoundingClientRect?.();
      const x = r && r.width ? Math.max(12, r.left - 18) : 24, y = r && r.height ? r.bottom + 10 : 120;
      el.style.setProperty('--tk-x', `${Math.round(x)}px`);
      el.style.setProperty('--tk-y', `${Math.round(y)}px`);
      // (a drawer taller than the room under the tin rises to fit: its foot ≥ 16 px above the screen's)
      const body = el.querySelector('.gw-tk'), bh = body?.getBoundingClientRect?.().height || 0;
      if (bh && y + bh > vh - 16) el.style.setProperty('--tk-y', `${Math.round(Math.max(12, vh - 16 - bh))}px`);
    }
  }
  function itemButton(kind, it, uid) {
    const b = h('button', 'gw-tk-it');
    b.type = 'button';
    b.dataset[kind] = it.id ?? '';
    b.setAttribute('aria-pressed', String(!!it.on));
    let art = '';
    const drawn = kind === 'kit' || it.found === true;   // (a found piece: its own ink drawing, the card's, LOST-TACKLE §2.1)
    try { art = drawn ? '' : it.id ? engrave(artCard(D(), kind, it.id), { uid }) : PLAIN[kind === 'bait' ? 'bare' : 'none']; } catch (e) { report('tackle.art', e); art = glyphOf(it.glyph); }
    b.innerHTML = `<span class="gw-tk-art">${art}</span><span class="gw-tk-name"></span>${kind === 'bait' && it.id ? `<span class="gw-tk-n">${it.count}</span>` : ''}`;
    b.querySelector('.gw-tk-name').textContent = it.name;
    if (drawn) {
      try { const cv = document.createElement('canvas'); cv.className = 'gw-tk-find'; drawFindArt(cv, D(), it.id, { w: 80, h: 60, pad: 0.1 }); cv.style.width = '100%'; cv.style.height = '100%'; b.querySelector('.gw-tk-art').appendChild(cv); } catch (e) { report('tackle.find', e); }
    }
    if (kind === 'kit') b.dataset.slot = it.slot || '';
    b.addEventListener('click', (e) => { e.stopPropagation(); if (kind === 'kit') pickKit(it); else pick(kind, it.id); });
    return b;
  }
  function renderDrawer(entry, body) {
    const m = tackleModel(D(), { run: run(), metaLoop: L('state'), line: line() }), T = W();
    const box = h('div', 'gw-tk');
    box.dataset.loop = 'tackle';
    box.innerHTML = '<i class="gw-tk-pool" aria-hidden="true"></i>';
    const x = h('button', 'gw-x', icon('close'));
    x.type = 'button';
    x.dataset.action = 'close';
    x.setAttribute('aria-label', 'Close');
    x.addEventListener('click', (e) => { e.stopPropagation(); closeDrawer(); });
    const rowsEl = h('div', 'gw-tk-rows');
    for (const kind of ['bait', 'lure', 'kit']) {
      if (!m[kind].length) continue;   // (the Kit row only once a found rod, line or reel is owned)
      const sec = h('section', 'gw-tk-row');
      sec.dataset.row = kind;
      const hd = h('h3', 'gw-tk-h');
      hd.textContent = T[kind];
      sec.appendChild(hd);
      const items = h('div', 'gw-tk-items');
      items.setAttribute('role', 'group');
      items.setAttribute('aria-label', T[kind]);
      m[kind].forEach((it, i) => items.appendChild(itemButton(kind, it, `tk-${kind}-${i}`)));
      sec.appendChild(items);
      rowsEl.appendChild(sec);
    }
    box.appendChild(rowsEl);
    box.appendChild(x);
    body.appendChild(box);
    try { requestAnimationFrame(() => layoutClass(entry)); } catch { /* ignore */ }
    layoutClass(entry);
  }
  function openDrawer({ key = false } = {}) {
    if (isOpen()) return;
    reeled = false;
    sfx('ui_click', { volume: 0.42, pitch: 0.62 });   // a tin lid's soft click
    const entry = K.openModal('tackle', renderDrawer, { blocking: true, dismissable: true, quiet: true, focus: false, cls: 'gw-m-tackle', onKey: drawerKey, onClose: () => afterClose() });
    layoutClass(entry);
    // (from the keyboard the focus starts on the bait on the hook; a tap leaves no focus ring)
    if (key) { try { setTimeout(() => entry?.el?.querySelector('[data-row=bait] [aria-pressed=true]')?.focus?.(), 30); } catch { /* ignore */ } }
    paint(true);
  }
  function drawerKey(code) {
    if (code === 'KeyB') { closeDrawer(); return true; }
    return false;
  }
  function closeDrawer({ quiet = false } = {}) {
    if (!isOpen()) return;
    K.closeModal('tackle', { silent: true });
    void quiet;
  }
  function afterClose() {
    // the line comes in as the evening runs on: its reel (a light ratchet, as a small fish's)
    if (reeled) { reeled = false; sfx('reel_ratchet', { k: 0.1, dur: 0.55, volume: 0.45 }); }
    paint(true);
  }
  /** A tap on an item: loop.changeHook; the drawer redrawn with the new one pressed; the tin's lid clicks. */
  function pick(kind, id) {
    const res = L('changeHook', kind === 'bait' ? { bait: id ?? null } : { lure: id ?? null });
    if (res?.ok !== true) { sfx('denied', { volume: 0.35 }); if (res?.reason === 'fish') { closeDrawer(); sayAfter(); } return; }
    if (res.changed) { sfx('ui_click', { volume: 0.5, pitch: 0.74 }); if (res.reeled) reeled = true; }
    try { K.entry?.('tackle')?.render?.(); layoutClass(K.entry?.('tackle')); } catch (e) { report('tackle.rerender', e); }
    paint(true);
  }

  /** A tap on a Kit chip (LOST-TACKLE §2.1): fit the piece in its slot, or take a pressed one off (the bought tier comes back). The rules
   *  are changeHook's (loop.fitFound: at home, or on the lake when no fish is on). */
  function pickKit(it) {
    const res = it.on ? L('unfitFound', it.slot) : L('fitFound', it.slot, it.id);
    if (res?.ok !== true) { sfx('denied', { volume: 0.35 }); if (res?.reason === 'fish') { closeDrawer(); sayAfter(); } return; }
    if (res.changed) { sfx('ui_click', { volume: 0.5, pitch: 0.7 }); if (res.reeled) reeled = true; }
    try { K.entry?.('tackle')?.render?.(); layoutClass(K.entry?.('tackle')); } catch (e) { report('tackle.rerender', e); }
    paint(true);
  }
  function update(dt = 0) {
    if (noteT > 0) { noteT -= Math.max(0, Math.min(0.25, Number(dt) || 0)); if (noteT <= 0) note.classList.remove('gw-in'); }
    paint();
  }
  /** B on a trip (ui-loop's handleKey): open (or the denied line), or close an open drawer. → true when the key is the tin's. */
  function toggle() {
    if (isOpen()) { closeDrawer(); return true; }
    return tapTin({ key: true });
  }
  return {
    update, toggle, paint, isOpen, open: openDrawer, close: closeDrawer, tin,
    debug: () => ({ shown: !wrap.hidden, busy: tin.classList.contains('gw-busy'), bait: tin.dataset.bait ?? null, lure: tin.dataset.lure ?? null,
      open: isOpen(), note: note.classList.contains('gw-in') ? note.textContent : null,
      kit: (() => { try { return [...(K.entry?.('tackle')?.el?.querySelectorAll?.('[data-row=kit] .gw-tk-it') || [])].map((b) => ({ id: b.dataset.kit, on: b.getAttribute('aria-pressed') === 'true' })); } catch { return []; } })() }),
  };
}
