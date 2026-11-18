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
import { ownedPieces, foundOf, foundKit } from './loop-finds.js';
import { lureHere } from './loop-carry.js';   // LAKE 2, lane D2 (LAKE2.md §5.7): a water's lures are its own (found ones travel)
// LAKE 2, lane G (LAKE2.md §5.5): the Tackle screen reads the gear water's tiers, the carry and the fitted pieces as the ledger does
import { TACKLE_SLOTS, firstWaterOf, gearWaterOf, tiersOf, fittedTier, tackleHold, castMaxOf, carriedLine, lineCapAt } from './loop-carry.js';

const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const arr = (v) => (Array.isArray(v) ? v : []);
const int = (v) => { const n = Math.floor(Number(v)); return Number.isFinite(n) ? Math.max(0, n) : 0; };
const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const fill = (s, o) => String(s ?? '').replace(/\{(\w+)\}/g, (m, k) => (o?.[k] != null ? String(o[k]) : m));
const escH = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

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
  const lure = Object.keys(isObj(D?.LOOP?.lures) ? D.LOOP.lures : {}).filter((id) => (own.has(id) && lureHere(D, id, zone)) || id === lureOn)
    .map((id) => ({ id, name: nameOf(D, id), glyph: GEAR_GLYPH[id] || 'spoon', on: id === lureOn, ...(D?.LOOP?.lures?.[id]?.found ? { found: true } : {}) }));
  lure.push({ id: null, name: W.none, glyph: null, on: false });
  const kit = ownedPieces(ml, D).map((id) => { const slot = D?.LOOP?.lostTackle?.[id]?.slot; return { id, slot, name: D?.TEXT_LOOP?.finds?.items?.[id]?.name || id, on: foundOf(ml, D, slot) === id }; });
  return { bait, lure, kit, baitOn, lureOn, count: baitOn ? int(bag[baitOn]) : null };
}

// ------------------------------------------------------------------ the Tackle screen (LAKE 2, lane G; LAKE2.md §5.5)
/** The Tackle screen's words (TEXT_LOOP.tackle.screen, the tin's and the logs' own), with their fallbacks. */
export function screenWords(D) {
  const T = isObj(D?.TEXT_LOOP?.tackle) ? D.TEXT_LOOP.tackle : {}, S = isObj(T.screen) ? T.screen : {}, LG = D?.TEXT_LOOP?.lost?.log || {};
  return { title: T.tin || 'Tackle', rod: S.rod || 'Rod', line: S.line || 'Line', reel: S.reel || 'Reel', lure: T.lure || 'Lure', bait: T.bait || 'Bait',
    bare: T.bare || 'Bare hook', done: S.done || 'Done', hold: S.hold || '+{n} Hold.', after: T.after || 'After this fish.',
    cast: LG.cast || 'Casts {m} m.', play: LG.play || 'Plays {x}× as long.', wait: LG.wait || 'Bites come {p}% sooner.', upTo: D?.TEXT_LOOP?.gate?.upTo || 'Lands up to {class}.' };
}
const r1 = (v) => String(Math.round(num(v) * 10) / 10);
const classWord = (D, c) => D?.TEXT_V3?.classes?.[c] || (c ? c.charAt(0).toUpperCase() + c.slice(1) : '');
/** A tier's name at a gear water: the start pieces and the first water's tiers as TACKLE names them, a later water's its own words. */
function tierNameAt(D, gw, slot, t) {
  const tier = tiersOf(D, gw, slot)[t];
  if (t === 0 || gw === firstWaterOf(D)) return D?.TACKLE?.[slot]?.[t]?.name ?? D?.LOOP?.tackle?.names?.[t]?.[TACKLE_SLOTS.indexOf(slot)] ?? D?.TEXT_LOOP?.gearItems?.[tier?.id] ?? tier?.id ?? '';
  return D?.TEXT_LOOP?.gearItems?.[tier?.id] ?? tier?.id ?? '';
}

/**
 * The Tackle screen's model (pure; LAKE2 §5.5): one screen for changing rod, line, reel, lure and bait at leisure, at home or on the water.
 * metaLoop: the save's block; run: the trip's run on a trip (else null: the save's fitted hook and the water's bag); line: fishing.hookLine();
 * canChange: loop.canChangeHook() (false only while a fish is on).
 * → {water, waterName, gearWater, carried, busy, words, rows: [{kind, head, items}]}: the five rows Rod · Line · Reel · Lure · Bait. A tackle
 *   row holds the start piece, each tier bought at the gear water's shelf (a lower one may be fitted) and the owned found pieces; the Lure row
 *   the water's own owned lures and the found ones; the Bait row the legend's ball, the water's tins and Cut Strip with any left, then the
 *   bare hook. Each item {kind, key, pick, name, on, art | find | plain, count?, log}: `pick` is what the ledger is asked (fitTackle's id, null
 *   for the best bought; changeHook's bait or lure, null for the bare hook); `log` the fitted piece's lines from the gear log (its Hold with
 *   the carry, the rod's cast, the line's cap, a found piece's own), [] on the others. No odds: numbers of the logs only (§5.3).
 */
export function tackleScreenModel(D, { metaLoop = null, run = null, line = null, canChange = true } = {}) {
  const ml = isObj(metaLoop) ? metaLoop : {}, S = screenWords(D);
  const trip = isObj(run) && run.outing === 'trip' && run.active !== false;
  const first = firstWaterOf(D);
  const water = trip && typeof run.zone === 'string' ? run.zone : (typeof ml.barge?.water === 'string' ? ml.barge.water : first);
  const gw = gearWaterOf(D, ml);
  const fk = foundKit(ml, D), th = tackleHold(D, ml, fk.hold), LT = D?.LOOP?.lostTackle || {}, G = D?.LOOP?.gearCap || {};
  const findName = (id) => D?.TEXT_LOOP?.finds?.items?.[id]?.name || id;
  const holdLine = (s) => fill(S.hold, { n: r1(th[s]) });
  const upTo = (cls) => (cls ? fill(S.upTo, { class: classWord(D, cls) }) : null);
  const lineCls = fk.lineCap || lineCapAt(D, water, th.line) || arr(G.line)[Math.min(arr(G.line).length - 1, fittedTier(D, ml, 'line'))] || null;
  const tackleLog = (slot) => {
    const out = [holdLine(slot)], id = fk[slot], X = id ? LT[id] || {} : {};
    if (slot === 'rod') out.push(fill(S.cast, { m: r1(castMaxOf(D, ml, fk.castMax)) }));
    if (slot === 'line') { const u = upTo(lineCls); if (u) out.push(u); if (num(X.waitMult, 0) > 0) out.push(fill(S.wait, { p: String(Math.round((1 - num(X.waitMult)) * 100)) })); }
    if (slot === 'reel' && num(X.playMult, 0) > 0) out.push(fill(S.play, { x: r1(X.playMult) }));
    return out;
  };
  const rows = [];
  for (const slot of TACKLE_SLOTS) {
    const tiers = tiersOf(D, gw, slot), bought = int(ml.tackle?.[slot]), foundOn = foundOf(ml, D, slot), tierOn = foundOn ? -1 : fittedTier(D, ml, slot);
    const items = [];
    for (let t = 0; t <= bought; t++) {
      const tier = tiers[t];
      if (!tier && t < bought) continue;   // (a tier past the water's own list, under the bought one: never fitted alone)
      const id = tier?.id ?? D?.TACKLE?.[slot]?.[t]?.id ?? `${slot}_${t}`;
      // (the best bought is asked as null, so a tier bought later is fitted by itself; the cards name a later water's item, for lane S's plates)
      items.push({ kind: slot, key: id, pick: t === bought ? null : id, name: tierNameAt(D, gw, slot, t), on: t === tierOn, tier: t,
        art: { id: `${slot}:${t}`, slot, level: t, ...(gw === first ? {} : { itemId: tier?.id ?? null, gearWater: gw }) }, log: [] });
    }
    for (const id of ownedPieces(ml, D, [slot])) items.push({ kind: slot, key: id, pick: id, name: findName(id), on: id === foundOn, find: id, log: [] });
    const on = items.find((x) => x.on);
    if (on) on.log = tackleLog(slot);
    rows.push({ kind: slot, head: S[slot], items });
  }
  // the hook: the run's on a trip (a line out carries the cast's bait), the save's fitted at home; the bag is the trip's, else the water's
  // (at home, what the next trip here carries, as createTrip reads the fit: an owned lure of this water, else a bait its bag holds; on the
  //  way back the other water's fitted bait or lure waits at its water)
  const bag = trip ? (isObj(run.bait) ? run.bait : {}) : (isObj(ml.bait?.[water]) ? ml.bait[water] : {});
  const own = new Set(arr(ml.lures));
  const fl = ml.fitted?.lure, fb = ml.fitted?.bait;
  const lureOn = trip ? (typeof run.lure === 'string' ? run.lure : null) : (typeof fl === 'string' && own.has(fl) && lureHere(D, fl, water) ? fl : null);
  const baitOn = trip ? (line?.out === true && typeof line.castBait === 'string' ? line.castBait : (typeof run.equippedBait === 'string' ? run.equippedBait : null))
    : (!lureOn && typeof fb === 'string' && int(bag[fb]) > 0 ? fb : null);
  const lureItems = Object.keys(isObj(D?.LOOP?.lures) ? D.LOOP.lures : {}).filter((id) => (own.has(id) && lureHere(D, id, water)) || id === lureOn)
    .map((id) => ({ kind: 'lure', key: id, pick: id, name: nameOf(D, id), on: id === lureOn, ...(D?.LOOP?.lures?.[id]?.found ? { find: id } : { art: { id: `lure:${id}` } }),
      log: id === lureOn ? [upTo(G.item?.[id])].filter(Boolean) : [] }));
  rows.push({ kind: 'lure', head: S.lure, items: lureItems });
  const ids = [D?.LOOP?.legendBait?.[water]?.id, ...arr(D?.LOOP?.tins?.[water]), 'cut_strip'].filter((id, i, a) => typeof id === 'string' && a.indexOf(id) === i);
  if (baitOn && !ids.includes(baitOn)) ids.push(baitOn);
  const baitItems = ids.filter((id) => int(bag[id]) > 0 || id === baitOn)
    .map((id) => ({ kind: 'bait', key: id, pick: id, name: nameOf(D, id), count: int(bag[id]), on: id === baitOn, art: artCard(D, 'bait', id),
      log: id === baitOn ? [upTo(G.item?.[id])].filter(Boolean) : [] }));
  const bare = baitOn == null && lureOn == null;
  baitItems.push({ kind: 'bait', key: 'bare', pick: null, name: S.bare, on: bare, plain: 'bare', log: bare ? [upTo(G.item?.bare)].filter(Boolean) : [] });
  rows.push({ kind: 'bait', head: S.bait, items: baitItems });
  const zn = arr(D?.ZONES).find((z) => z?.id === water)?.name || '';
  return { water, waterName: zn, gearWater: gw, carried: carriedLine(D, ml), busy: canChange === false, words: S, rows };
}

/** What a tap on a Tackle screen chip asks the ledger (pure): [method, ...args], or null for the chip already fitted. A rod, line or reel:
 *  fitTackle(slot, pick); a lure: changeHook({lure}) (the bait comes off); a bait: changeHook({bait}) (the lure comes off); the bare hook:
 *  changeHook({bait: null, lure: null}) (both off: one thing on the hook, WATERCRAFT §3.4). */
export function screenCall(it) {
  if (!isObj(it) || it.on) return null;
  if (TACKLE_SLOTS.includes(it.kind)) return ['fitTackle', it.kind, it.pick ?? null];
  if (it.kind === 'lure') return ['changeHook', { lure: it.pick }];
  if (it.kind === 'bait') return it.pick == null ? ['changeHook', { bait: null, lure: null }] : ['changeHook', { bait: it.pick }];
  return null;
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

/* LAKE 2, lane G: the drawer's door to the Tackle screen (no line out), at the end of the Lure row's head */
.gw-tk-hrow { display: flex; align-items: center; gap: 6px; }
.gw-tk-hrow .gw-tk-h { flex: 1 1 auto; min-width: 0; padding-right: 0; }
.gw-tk-door { flex: none; display: inline-flex; align-items: center; gap: 7px; min-height: 44px; margin: -12px 0 -10px; padding: 2px 4px 2px 6px; border: none; background: none; cursor: pointer;
  color: var(--ink-dim); font: 400 16px/1 var(--f-display); letter-spacing: .12em; text-transform: uppercase; white-space: nowrap; text-shadow: var(--ink-shadow);
  -webkit-tap-highlight-color: transparent; transition: color .2s; }
.gw-tk-door .gw-ico { width: 20px; height: 20px; flex: none; }
.gw-tk-door:hover, .gw-tk-door:focus-visible { outline: none; color: var(--ink-hi); }

/* LAKE 2, lane G (LAKE2.md §5.5): the Tackle screen. A veil over the water, five rows of engraved chips (rod, line, reel, lure, bait), the
   fitted one inked and underlined in the brush, its gear-log line under its name; Done in a fixed foot. Rows scroll sideways; no text is
   cut (names wrap inside a chip); every target ≥ 44 px, text ≥ 16 px. A phone: the rows' heads above their strips, a sheet from below */
.gw-m-tacklescreen .gw-scrim { background: radial-gradient(ellipse 80% 78% at 50% 48%, rgba(var(--veil-rgb), .56), rgba(var(--veil-rgb), .74) 66%, rgba(5, 6, 14, .9)); }
.gw-m-tacklescreen .gw-modal-body { width: 100%; }
.gw-ts { position: relative; isolation: isolate; box-sizing: border-box; width: min(980px, 100%); max-height: calc(100vh - 32px - var(--sat) - var(--sab));
  margin: 0 auto; display: flex; flex-direction: column; padding: 14px 24px 8px; color: var(--ink); }
.gw-ts-pool { position: absolute; inset: -36px -48px; z-index: -1; pointer-events: none; background: rgba(var(--veil-rgb), .9);
  -webkit-mask: radial-gradient(ellipse 50% 50% at 50% 50%, #000 72%, transparent 100%); mask: radial-gradient(ellipse 50% 50% at 50% 50%, #000 72%, transparent 100%); }
.gw-ts-head { flex: none; display: flex; flex-wrap: wrap; align-items: baseline; column-gap: 20px; row-gap: 2px; margin: 0 0 10px; }
.gw-ts-title { margin: 0; font: 400 24px/1.15 var(--f-display); letter-spacing: .22em; text-transform: uppercase; color: var(--ink-hi); text-shadow: var(--ink-shadow); }
.gw-ts-sub { margin: 0; display: flex; flex-wrap: wrap; align-items: center; column-gap: 16px; row-gap: 2px; font: italic 400 17px/1.3 var(--f-body); color: var(--ink-dim); text-shadow: var(--ink-shadow); }
.gw-ts-carry { display: inline-flex; align-items: center; gap: 6px; font-style: normal; color: var(--ink); white-space: nowrap; font-variant-numeric: tabular-nums; }
.gw-ts-carry .gw-ico { width: 20px; height: 20px; flex: none; color: var(--ink-dim); }
.gw-ts-busy { color: var(--ink); }
.gw-ts-rows { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; gap: 4px; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; }
.gw-ts-rows::-webkit-scrollbar { display: none; }
.gw-ts-row { display: grid; grid-template-columns: 88px minmax(0, 1fr); align-items: center; column-gap: 10px; }
.gw-ts-h { margin: 0; font: 400 16px/1.1 var(--f-display); letter-spacing: .18em; text-transform: uppercase; color: var(--ink-dim); text-shadow: var(--ink-shadow); }
.gw-ts-strip { display: flex; gap: 4px; min-width: 0; padding: 2px 0; overflow-x: auto; overflow-y: hidden; overscroll-behavior-x: contain; scroll-snap-type: x proximity; scrollbar-width: none; }
.gw-ts-strip::-webkit-scrollbar { display: none; }
.gw-ts-strip.gw-ts-r { -webkit-mask: linear-gradient(90deg, #000 calc(100% - 48px), transparent); mask: linear-gradient(90deg, #000 calc(100% - 48px), transparent); }
.gw-ts-strip.gw-ts-l { -webkit-mask: linear-gradient(90deg, transparent, #000 48px); mask: linear-gradient(90deg, transparent, #000 48px); }
.gw-ts-strip.gw-ts-l.gw-ts-r { -webkit-mask: linear-gradient(90deg, transparent, #000 48px, #000 calc(100% - 48px), transparent); mask: linear-gradient(90deg, transparent, #000 48px, #000 calc(100% - 48px), transparent); }
.gw-ts-chip { position: relative; flex: none; display: grid; grid-template-columns: 64px auto; column-gap: 8px; align-items: center; min-height: 60px; padding: 4px 14px 4px 4px;
  border: none; border-radius: 10px; background: none; color: var(--ink-dim); text-align: left; cursor: pointer; scroll-snap-align: start; scroll-margin: 0 48px;
  -webkit-tap-highlight-color: transparent; transition: color .2s, background-color .2s; }
.gw-ts-art { position: relative; display: block; width: 64px; height: 48px; color: var(--ink); opacity: .74; transition: opacity .2s, filter .2s; }
.gw-ts-art .cat-eng, .gw-ts-art canvas { display: block; width: 100%; height: 100%; }
.gw-ts-art .cat-pp { fill: #0d0f21; }
.gw-ts-art .gw-tk-plain { opacity: .9; }
.gw-ts-txt { display: flex; flex-direction: column; align-items: flex-start; min-width: 0; max-width: 184px; }
.gw-ts-name { position: relative; display: block; font: 400 17px/1.15 var(--f-body); color: inherit; overflow-wrap: normal; word-break: normal; hyphens: manual; text-shadow: var(--ink-shadow); }
.gw-ts-n { display: block; font: 500 16px/1.15 var(--f-body); color: var(--ink-faint); font-variant-numeric: tabular-nums; }
.gw-ts-log { display: block; font: italic 400 16px/1.2 var(--f-body); color: var(--ink-dim); text-shadow: var(--ink-shadow); }
.gw-ts-chip:hover, .gw-ts-chip:focus-visible { outline: none; color: var(--ink); background-color: rgba(174, 172, 208, .07); }
.gw-ts-chip:hover .gw-ts-art, .gw-ts-chip:focus-visible .gw-ts-art { opacity: .95; }
.gw-ts-chip[aria-pressed=true] { color: var(--ink-hi); }
.gw-ts-chip[aria-pressed=true] .gw-ts-art { opacity: 1; filter: drop-shadow(0 0 7px var(--glow-soft)); }
.gw-ts-chip[aria-pressed=true] .gw-ts-name { padding-bottom: 7px; text-shadow: 0 0 14px var(--glow), var(--ink-shadow); }
.gw-ts-chip[aria-pressed=true] .gw-ts-name::after { content: ''; position: absolute; left: 0; bottom: 0; width: min(76px, 100%); height: 6px; background: var(--ink-dim); opacity: .8;
  -webkit-mask: var(--orn-brush) center / 100% 100% no-repeat; mask: var(--orn-brush) center / 100% 100% no-repeat; }
.gw-ts-chip[aria-pressed=true] .gw-ts-n { color: var(--ink); }
.gw-ts.gw-ts-busy .gw-ts-chip:not([aria-pressed=true]) { opacity: .45; }
.gw-ts-foot { flex: none; display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 4px 12px; padding-top: 6px; }
.gw-ts-foot .gw-btn { min-height: 48px; }

@media (max-width: 699px) {
  .gw-m-tacklescreen { align-items: flex-end; padding: 0; }
  .gw-m-tacklescreen .gw-scrim { background: linear-gradient(0deg, rgba(5, 6, 14, .82), rgba(var(--veil-rgb), .56) 70%, rgba(var(--veil-rgb), .4)); }
  .gw-m-tacklescreen .gw-modal-body { align-items: flex-end; transform: translateY(24px); }
  .gw-m-tacklescreen.gw-in .gw-modal-body { transform: none; }
  .gw-ts { width: 100%; max-height: calc(100vh - var(--sat) - 8px); padding: 16px max(16px, var(--sar)) calc(var(--sab) + 6px) max(16px, var(--sal)); }
  .gw-ts-pool { inset: -56px 0 0; background: rgba(var(--veil-rgb), .95);
    -webkit-mask: linear-gradient(0deg, #000 calc(100% - 72px), transparent); mask: linear-gradient(0deg, #000 calc(100% - 72px), transparent); }
  .gw-ts-head { column-gap: 14px; margin-bottom: 6px; }
  .gw-ts-title { font-size: 22px; }
  .gw-ts-sub { font-size: 16px; column-gap: 12px; }
  .gw-ts-rows { gap: 2px; }
  .gw-ts-row { grid-template-columns: minmax(0, 1fr); row-gap: 0; }
  .gw-ts-chip { grid-template-columns: 52px auto; min-height: 56px; padding-right: 12px; }
  .gw-ts-art { width: 52px; height: 39px; }
  .gw-ts-txt { max-width: 128px; }
  .gw-ts-name { font-size: 16px; }
  .gw-ts-foot { padding-top: 2px; }
}
@media (max-height: 499px) {
  .gw-ts { max-height: calc(100vh - 12px - var(--sat) - var(--sab)); padding-top: 8px; padding-bottom: 4px; }
  .gw-ts-head { margin-bottom: 4px; padding-right: 150px; }
  .gw-ts-foot { position: absolute; top: 2px; right: 16px; padding: 0; }
  .gw-ts-rows { gap: 0; }
  .gw-ts-chip { min-height: 52px; grid-template-columns: 52px auto; padding-top: 2px; padding-bottom: 2px; }
  .gw-ts-art { width: 52px; height: 39px; }
}
@media (prefers-reduced-motion: reduce) { .gw-m-tacklescreen .gw-modal-body { transition: none; } }
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
      // LAKE 2, lane G (LAKE2.md §5.5): with no line out, the Lure row's head carries the door to the Tackle screen (rod, line and reel)
      if (kind === 'lure' && line()?.out !== true) {
        const hr = h('div', 'gw-tk-hrow');
        hr.appendChild(hd);
        const S = screenWords(D()), door = h('button', 'gw-tk-door', icon('rod'));
        door.type = 'button';
        door.dataset.loop = 'tackle-door';
        door.appendChild(document.createTextNode([S.rod, S.line, S.reel].join(' · ')));
        door.addEventListener('click', (e) => { e.stopPropagation(); closeDrawer({ quiet: true }); openScreen({ from: 'tin' }); });
        hr.appendChild(door);
        sec.appendChild(hr);
      } else sec.appendChild(hd);
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
  // ---------------------------------------------------------------- the Tackle screen (LAKE 2, lane G; LAKE2.md §5.5)
  // Opened from the pause menus (pauseItem), the barge's rod rack (from: 'rack', with a link to the Wick's sheet) and the tin's drawer
  // with no line out (its door). Each row a radio strip; a tap fits through the ledger (fitTackle, changeHook: their rules, so a fish on
  // refuses with "After this fish."); one sound per fit (the tin's). Keys: the arrows (and WASD) move between chips and rows, Enter fits,
  // Esc or B closes; a pad's D-pad, A and B are input-pad's own over the same buttons.
  let reeledS = false;
  const screenOpen = () => !!K.has?.('tacklescreen');
  const tripRun = () => { const r = run(); return r && r.outing === 'trip' && r.active !== false && ctx.flow !== 'home' ? r : null; };
  const screenModel = () => tackleScreenModel(D(), { metaLoop: L('state'), run: tripRun(), line: tripRun() ? line() : null, canChange: L('canChangeHook') !== false });
  const sheetTitle = () => {
    const d = D(), wid = d?.loopWickId?.(L('wick')) || 'wick', nm = arr(d?.CHARACTERS).find((c) => c?.id === wid)?.name || 'The Wick';
    return String(d?.TEXT_LOOP?.sheet?.title || "{name}'s Sheet").replace('{name}', nm);
  };
  /** A strip's edge fades: content beyond its left or right edge. */
  const edges = (s) => { s.classList.toggle('gw-ts-l', s.scrollLeft > 2); s.classList.toggle('gw-ts-r', s.scrollLeft + s.clientWidth < s.scrollWidth - 2); };
  function screenChip(it, uid) {
    const b = h('button', 'gw-ts-chip');
    b.type = 'button';
    b.dataset.slot = it.kind;
    b.dataset.key = it.key;
    b.setAttribute('aria-pressed', String(!!it.on));
    let art = '';
    if (!it.find) { try { art = it.plain ? PLAIN.bare : engrave(it.art, { uid }); } catch (e) { report('screen.art', e); } }
    b.innerHTML = `<span class="gw-ts-art" aria-hidden="true">${art}</span><span class="gw-ts-txt"><span class="gw-ts-name"></span></span>`;
    const txt = b.querySelector('.gw-ts-txt');
    b.querySelector('.gw-ts-name').textContent = it.name;
    if (it.count != null) { const n = h('span', 'gw-ts-n'); n.textContent = String(it.count); txt.appendChild(n); }
    for (const ln of arr(it.log)) { const l = h('span', 'gw-ts-log'); l.textContent = ln; txt.appendChild(l); }
    b.setAttribute('aria-label', [it.name, it.count != null ? String(it.count) : null, ...arr(it.log)].filter(Boolean).join(', '));
    if (it.find) {
      try { const cv = document.createElement('canvas'); drawFindArt(cv, D(), it.find, { w: 80, h: 60, pad: 0.1 }); cv.style.width = '100%'; cv.style.height = '100%'; b.querySelector('.gw-ts-art').appendChild(cv); } catch (e) { report('screen.find', e); }
    }
    b.addEventListener('click', (e) => { e.stopPropagation(); pickScreen(it); });
    return b;
  }
  function renderScreen(entry, body) {
    const m = screenModel(), S = m.words, st = entry.state || {};
    const box = h('div', `gw-ts${m.busy ? ' gw-ts-busy' : ''}`);
    box.dataset.loop = 'tackle-screen';
    box.innerHTML = '<i class="gw-ts-pool" aria-hidden="true"></i>';
    const head = h('header', 'gw-ts-head');
    const ttl = h('h2', 'gw-ts-title');
    ttl.textContent = S.title;
    head.appendChild(ttl);
    const sub = h('p', 'gw-ts-sub');
    if (m.waterName) { const w = h('span', 'gw-ts-water'); w.textContent = m.waterName; sub.appendChild(w); }
    // the carried line (LAKE2 §5.3: the hand glyph, rod · line · reel; logs only, from the first tow on)
    if (m.carried) { const c = h('span', 'gw-ts-carry', icon('hand')); const t = document.createElement('span'); t.textContent = m.carried; c.appendChild(t); sub.appendChild(c); }
    if (m.busy) { const b = h('span', 'gw-ts-busy'); b.textContent = S.after; sub.appendChild(b); }
    if (sub.childNodes.length) head.appendChild(sub);
    box.appendChild(head);
    const rowsEl = h('div', 'gw-ts-rows');
    for (const row of m.rows) {
      const sec = h('section', 'gw-ts-row');
      sec.dataset.row = row.kind;
      const hd = h('h3', 'gw-ts-h');
      hd.textContent = row.head;
      sec.appendChild(hd);
      const strip = h('div', 'gw-ts-strip');
      strip.setAttribute('role', 'group');
      strip.setAttribute('aria-label', row.head);
      row.items.forEach((it, i) => strip.appendChild(screenChip(it, `ts-${row.kind}-${i}`)));
      strip.addEventListener('scroll', () => edges(strip), { passive: true });
      // (a mouse's wheel turns a strip that overflows; at either end it passes to the page)
      strip.addEventListener('wheel', (e) => {
        const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : 0, max = strip.scrollWidth - strip.clientWidth;
        if (!d || max <= 2 || (d < 0 && strip.scrollLeft <= 0) || (d > 0 && strip.scrollLeft >= max - 1)) return;
        strip.scrollLeft += d; e.preventDefault();
      }, { passive: false });
      sec.appendChild(strip);
      rowsEl.appendChild(sec);
    }
    box.appendChild(rowsEl);
    const foot = h('footer', 'gw-ts-foot');
    const btnF = K.screens?.parts?.btn;
    const mk = (label, o) => {
      if (btnF) return btnF(escH(label), { ...o, sound: false });
      const b = h('button', `gw-btn ${o.cls || ''}`); b.type = 'button'; b.textContent = label; b.addEventListener('click', (e) => { e.stopPropagation(); o.onClick(e); }); return b;
    };
    if (st.from === 'rack' && K.screens?.openSheet) {
      const sl = mk(sheetTitle(), { cls: 'gw-ts-sheet', onClick: () => { sfx('ui_click'); closeScreen(); try { K.screens.openSheet({ from: 'rack', section: 'tackle' }); } catch (e) { report('screen.sheet', e); } } });
      sl.dataset.loop = 'tackle-sheet';
      foot.appendChild(sl);
    }
    const done = mk(S.done, { cls: 'gw-ts-done', onClick: () => { sfx('ui_click'); closeScreen(); } });
    done.dataset.action = 'close';
    foot.appendChild(done);
    box.appendChild(foot);
    body.appendChild(box);
    // the strips' scroll, the rows' and the focus come back after a fit; on opening, each strip shows its fitted chip
    const keep = st.keep || null;
    st.keep = null;
    const settle = () => {
      for (const sec of box.querySelectorAll('.gw-ts-row')) {
        const s = sec.querySelector('.gw-ts-strip');
        if (!s) continue;
        if (keep) s.scrollLeft = num(keep.scroll?.[sec.dataset.row], 0);
        else { const on = s.querySelector('[aria-pressed=true]'); if (on && on.offsetLeft + on.offsetWidth > s.clientWidth) s.scrollLeft = Math.max(0, on.offsetLeft - 48); }
        edges(s);
      }
      if (keep) {
        rowsEl.scrollTop = num(keep.top, 0);
        if (keep.focus) { const f = [...box.querySelectorAll('.gw-ts-chip')].find((b) => `${b.dataset.slot}|${b.dataset.key}` === keep.focus); try { f?.focus({ preventScroll: true }); } catch { /* ignore */ } }
      }
    };
    if (box.isConnected) settle(); else { try { requestAnimationFrame(settle); } catch { /* ignore */ } }
  }
  function rerenderScreen() {
    const e = K.entry?.('tacklescreen');
    if (!e) return;
    const el = e.el, keep = { scroll: {}, top: el.querySelector('.gw-ts-rows')?.scrollTop || 0, focus: null };
    for (const sec of el.querySelectorAll('.gw-ts-row')) keep.scroll[sec.dataset.row] = sec.querySelector('.gw-ts-strip')?.scrollLeft || 0;
    const a = typeof document !== 'undefined' ? document.activeElement : null;
    if (a && el.contains(a) && a.dataset?.key) keep.focus = `${a.dataset.slot}|${a.dataset.key}`;
    e.state.keep = keep;
    e.render();
  }
  /** A tap on a chip: the ledger fits it (fitTackle for a rod, line or reel; changeHook for a lure, a bait or the bare hook). */
  function pickScreen(it) {
    const call = screenCall(it);
    if (!call) return;
    const res = L(...call);
    if (res?.ok !== true) { sfx('denied', { volume: 0.35 }); rerenderScreen(); return; }
    if (res.changed) { sfx('ui_click', { volume: 0.5, pitch: 0.74 }); if (res.reeled) reeledS = true; }
    rerenderScreen();
    paint(true);
  }
  /** The keys on the screen: the arrows (WASD) move between chips (left and right in a row, up and down to the nearest chip of the next
   *  row, then the foot's buttons); B closes (Esc is the modal's own). */
  function screenKey(code) {
    if (code === 'KeyB') { closeScreen(); return true; }
    const D4 = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0], KeyA: [0, -1], KeyD: [0, 1], KeyW: [-1, 0], KeyS: [1, 0] }[code];
    if (!D4) return false;
    const el = K.entry?.('tacklescreen')?.el;
    if (!el) return false;
    const grid = [...[...el.querySelectorAll('.gw-ts-strip')].map((s) => [...s.querySelectorAll('.gw-ts-chip')]), [...el.querySelectorAll('.gw-ts-foot button')]].filter((r) => r.length);
    if (!grid.length) return true;
    const a = document.activeElement, ri = grid.findIndex((r) => r.includes(a));
    let to = null;
    if (ri < 0) to = grid[0].find((b) => b.getAttribute('aria-pressed') === 'true') || grid[0][0];
    else if (D4[1]) { const ci = grid[ri].indexOf(a); to = grid[ri][Math.max(0, Math.min(grid[ri].length - 1, ci + D4[1]))]; }
    else {
      const nr = Math.max(0, Math.min(grid.length - 1, ri + D4[0]));
      if (nr !== ri) {
        const r = a.getBoundingClientRect(), cx = r.left + r.width / 2;
        to = grid[nr].reduce((best, b) => { const q = b.getBoundingClientRect(), d = Math.abs(q.left + q.width / 2 - cx); return !best || d < best.d ? { b, d } : best; }, null)?.b || null;
      }
    }
    if (to && to !== a) { try { to.focus({ preventScroll: true }); to.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch { /* ignore */ } sfx('ui_hover', { volume: 0.3 }); }
    return true;
  }
  /**
   * openScreen({from, pauseChild}): the Tackle screen over what is open (the tin's drawer closes first). from: 'pause' | 'rack' | 'tin'
   * ('rack' adds the link to the Wick's sheet, which the rack opened before, SHEET.md §2.3). A blocking modal: the evening waits.
   */
  function openScreen({ from = null, pauseChild = false } = {}) {
    if (!L('state')) return false;
    if (screenOpen()) return true;
    if (isOpen()) closeDrawer({ quiet: true });
    reeledS = false;
    sfx('ui_click', { volume: 0.42, pitch: 0.62 });   // the tin lid's click
    const entry = K.openModal('tacklescreen', renderScreen, { blocking: true, dismissable: true, quiet: true, focus: false, cls: 'gw-m-tacklescreen',
      onKey: screenKey, onClose: () => afterScreenClose(), state: { from, pauseChild: !!pauseChild } });
    return !!entry;
  }
  function closeScreen() { if (screenOpen()) K.closeModal('tacklescreen', { silent: true }); }
  function afterScreenClose() {
    if (reeledS) { reeledS = false; sfx('reel_ratchet', { k: 0.1, dur: 0.55, volume: 0.45 }); }
    paint(true);
  }
  /** The pause menus' Tackle item (the trip's and the home's), after the tutorial: dimmed with "After this fish." while a fish is on. */
  function pauseItem({ pauseChild = true } = {}) {
    try {
      if (!tutorialDone()) return null;
      const btnF = K.screens?.parts?.btn;
      if (!btnF) return null;
      const S = screenWords(D()), busy = L('canChangeHook') === false;
      const b = btnF(escH(S.title), { cls: `gw-mbtn gw-loop-tackle${busy ? ' gw-locked' : ''}`, icon: 'rod', sound: false,
        onClick: () => { if (L('canChangeHook') === false) { sfx('denied', { volume: 0.35 }); return; } openScreen({ from: 'pause', pauseChild }); } });
      b.dataset.loop = 'tackle-item';
      if (busy) { b.setAttribute('aria-label', `${S.title}: ${S.after}`); const w = h('small', 'gw-lock-w'); w.textContent = S.after; b.appendChild(w); }
      else b.setAttribute('aria-label', S.title);
      return b;
    } catch (e) { report('tackle.pauseItem', e); return null; }
  }
  try { for (const ev of ['run:end', 'home:enter']) ctx.bus?.on?.(ev, () => { if (screenOpen() && K.entry?.('tacklescreen')?.state?.from === 'tin') closeScreen(); }); } catch (e) { report('screen.bus', e); }

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
    openScreen, closeScreen, screenOpen, pauseItem,   // LAKE 2, lane G: the Tackle screen (LAKE2.md §5.5)
    debug: () => ({ shown: !wrap.hidden, busy: tin.classList.contains('gw-busy'), bait: tin.dataset.bait ?? null, lure: tin.dataset.lure ?? null,
      open: isOpen(), note: note.classList.contains('gw-in') ? note.textContent : null,
      kit: (() => { try { return [...(K.entry?.('tackle')?.el?.querySelectorAll?.('[data-row=kit] .gw-tk-it') || [])].map((b) => ({ id: b.dataset.kit, on: b.getAttribute('aria-pressed') === 'true' })); } catch { return []; } })(),
      // the Tackle screen: open, where from, and each row's chips (key, pressed) as drawn
      screen: (() => { try { const e = K.entry?.('tacklescreen'); if (!e) return null; return { from: e.state?.from ?? null, rows: Object.fromEntries([...e.el.querySelectorAll('.gw-ts-row')].map((s) => [s.dataset.row, [...s.querySelectorAll('.gw-ts-chip')].map((b) => ({ key: b.dataset.key, on: b.getAttribute('aria-pressed') === 'true' }))])) }; } catch { return null; } })() }),
  };
}
