// ui-loop.js — the Full Hold's screens (docs/loop/SPEC.md §8, slice-1a/PLAN.md §2.3 items 2 and 10; lane C): the hold row and the
// Home pill on the water, the Jetty, Murk's tally, Murk's shelf, the Chart (a list in 1a), the home pause, Murk's lines and the
// first trip's two tips. Created by ui.js only when data.LOOP_ENABLED (ui.loop), so the v1 and v3 builds never build any of it.
// Every word is TEXT_LOOP's (or a built word SPEC §8 names: a species, a water, a Wick, a tip), read directly from the data;
// every neighbour (ctx.progression.loop, ctx.game.*) is read through optional chaining (PLAN §3's stub rule).
// Drowned Filigree throughout: no boxes, no frames; ink on a feathered pool of night; hook curls on the chosen word; one warm
// light (the clam's gold, the Jetty's lamp) in a cold world. Nothing is ever drawn in world space, and never round the raft.
//
// Pure exports (node: tools/tests/ui-loop.test.mjs): slotCells · tallyPlan · goalLine · shelfCards · murkLineFor · clamTag ·
// pillHold · chartModel · titleModel · descentModel · cardActions · CARD_KEYS · LOOP_MODALS · tripKeySwallow · journalFirst · journalModel ·
// settingsWords · castTipDue · strikeTipText · allowedWords · textAllowed · chartVignette · scaleSvg
import { icon, ORN, murkPortrait, wickPortrait, keySeal, sealedSheet } from './ui-icons.js';
import { drawFishInk } from './ui-fishart.js';
import { fmtClams } from './core.js';
import { createLoopTutorial, murkLineFor } from './loop-tutorial.js';
import { mapCards, sealsOf, listCount as listCountOf } from './progression-loop.js';

export { murkLineFor };

const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const arr = (v) => (Array.isArray(v) ? v : []);
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const escH = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const spOf = (D, id) => D?.SPECIES_BY_ID?.[id] || arr(D?.SPECIES).find((s) => s?.id === id) || null;
const T_ = (D) => D?.TEXT_LOOP || {};

// ================================================================== pure helpers
/** The size of a kept fish's glyph in its slot, by class (PLAN §2.3: Small 0.7 … Elder 1.2). */
export const CLASS_SCALE = Object.freeze({ small: 0.7, keeper: 0.82, prize: 0.94, trophy: 1.06, elder: 1.2 });
/**
 * The hold row's cells (SPEC §8.1): exactly hold.slots cells (the Wick's count: loop.hold().slots, Tallow one more; the view never
 * tests the Wick), the first ones holding the kept fish in the order caught. A cell: {i, filled, uid, speciesId, sizeClass, scale,
 * gild} (gild: a giant, a legend or an epic fish wears the gold edge).
 */
export function slotCells(hold, { D = null } = {}) {
  const fish = arr(hold?.fish).filter(isObj);
  const n = Math.max(0, Math.floor(num(Number(hold?.slots), 0)), fish.length);
  const out = [];
  for (let i = 0; i < n; i++) {
    const f = fish[i];
    if (!f) { out.push({ i, filled: false }); continue; }
    const sp = spOf(D, f.speciesId);
    const r = sp?.rarity || f.rarity || null;
    out.push({ i, filled: true, uid: f.uid ?? null, speciesId: f.speciesId ?? null, sizeClass: f.sizeClass ?? null,
      scale: CLASS_SCALE[f.sizeClass] ?? CLASS_SCALE.keeper, gild: f.giant === true || f.legendary === true || r === 'legendary' || r === 'epic' });
  }
  return out;
}

/** A price with the clam glyph: "<clam> 9,999", "<clam> 12.4k" (core.fmtClams). */
export function clamTag(n, { cls = '' } = {}) {
  return `<span class="gw-price gw-clams${cls ? ` ${cls}` : ''}">${icon('clam')}<b>${escH(fmtClams(Math.max(0, Math.round(num(Number(n), 0)))))}</b></span>`;
}

/** The Home pill's press and hold (SPEC §8.1): 0.6 s fills the ring and goes home; a full hold needs only a tap. Pure. */
export const PILL_HOLD = 0.6;
export function pillHold(t, full = false, { hold = PILL_HOLD } = {}) {
  const k = full ? 1 : clamp01(num(t, 0) / Math.max(1e-6, hold));
  return { k, fire: full === true || num(t, 0) >= hold - 1e-9 };
}

/**
 * The Jetty's goal line (SPEC §8.3): "Next: {name} · {price}" for loop.goal() (the cheapest unbought item), null for none. A hold
 * step names the slots it gives THIS Wick (WICKS §2.4: data.wickSlots of the step; Tallow at the start "Next: Hold 5 · 30"); a tier
 * keeps its TACKLE name. Returns {text, name, price, priceText, html} (html: the price wears the clam glyph).
 */
export function goalLine(goal, { D = null, wick = null } = {}) {
  if (!isObj(goal) || !Number.isFinite(Number(goal.price))) return null;
  const TL = T_(D);
  const isHold = goal.slot === 'hold' || String(goal.id || '').startsWith('hold:');
  const level = Number.isFinite(Number(goal.level)) ? Number(goal.level) : Number(String(goal.id || '').split(':')[1]);
  const slots = isHold ? (typeof D?.wickSlots === 'function' ? D.wickSlots(level, wick) : level) : null;
  const name = isHold ? String(TL.holdName || 'Hold {n}').replace('{n}', String(slots)) : String(goal.name || '');
  if (!name) return null;
  const price = Math.max(0, Math.round(Number(goal.price)));
  const priceText = fmtClams(price);
  const tpl = String(TL.next || 'Next: {name} · {price}');
  const text = tpl.replace('{name}', name).replace('{price}', priceText);
  const [a, b = ''] = tpl.split('{price}');
  const html = `${escH(a.replace('{name}', name))}${icon('clam')}<b>${escH(priceText)}</b>${escH(b)}`;
  return { text, name, price, priceText, html, id: goal.id ?? null };
}

/**
 * Murk's shelf as cards (SPEC §8.4, PLAN CHOICEs 11 and 26), from loop.shelf(): only the tabs with an item, in their order; each
 * card {id (the buy id, data-buy), name, line, price, priceText, dear (too dear: the price dimmed, no other words), bought (the
 * button reads "Yours."), slot, level, art (its glyph)}. The tab words are TEXT_LOOP.tabs'.
 */
const TAB_ICON = { tackle: 'rod', raft: 'hull', bait: 'worm', maps: 'map', home: 'hearth' };
const ART = { rod: 'rod', line: 'line', reel: 'reel', hold: 'creel', bait: 'mossball', place: 'map', lake: 'map' };
export function shelfCards(shelf, { D = null, clams = 0 } = {}) {
  const TL = T_(D);
  const tabs = arr(shelf?.tabs).filter((t) => isObj(t) && arr(t.items).length);
  return {
    tabs: tabs.map((t) => ({
      id: t.id, label: TL.tabs?.[t.id] || t.id, icon: TAB_ICON[t.id] || 'star',
      cards: arr(t.items).filter(isObj).map((it) => {
        const sealed = it.sealed === true;
        const price = sealed || it.price == null ? null : Math.max(0, Math.round(num(Number(it.price), 0)));
        const consumable = it.consumable === true;
        const bought = !consumable && it.bought === true;
        const card = { id: String(it.id), name: String(it.name || ''), line: String(it.line || ''), price, priceText: price == null ? '' : fmtClams(price),
          dear: !bought && price != null && num(Number(clams), 0) < price, bought, slot: it.slot ?? null, level: it.level ?? null, art: ART[it.slot] || 'star',
          buyWord: bought ? (TL.yours || 'Yours.') : null };
        // M1 step 3a (SPEC §8.4): a map card names its fish (★ for a giant or the legend), its hour glyphs and its line; the next
        // water's card is sealed ("Coming soon", its three seals, no button); a legend's bait is a consumable with its count
        if (it.slot === 'place') {
          const sp = spOf(D, it.fish);
          const star = sp && (sp.giant === true || sp.rarity === 'legendary');
          Object.assign(card, { placeId: it.placeId ?? null, kind: it.kind ?? null, fish: it.fish ?? null, fishName: sp?.name || '', star: !!star, hours: arr(it.hours).slice() });
        } else if (it.slot === 'lake') Object.assign(card, { waterId: it.waterId ?? null, sealed, seals: isObj(it.seals) ? it.seals : null, name: sealed ? '' : card.name });
        else if (consumable) Object.assign(card, { consumable: true, baitId: it.baitId ?? null, count: Math.max(0, Math.floor(num(Number(it.count), 0))) });
        return card;
      }),
    })),
  };
}
/**
 * M1 step 3a (SPEC §8.4, M1.md §2.4): a map card's drawing, the fish "life-size beside the Wick": the Wick's portrait and the fish's
 * ink drawing at one scale (k px a metre), the Wick at BALANCE_V3.ceremony.wickHeight, the fish at its typical length (size.L50),
 * both inside w × h. → {k, wick: {w, h}, fish: {w, h, len}} (CSS px; the fish's canvas carries `pad` either side). Pure.
 */
export const MAP_ART = Object.freeze({ w: 214, h: 86, gap: 6, pad: 0.04, figure: 0.78, fishAspect: 0.56 });
export function mapArtSizes(D, sp, { w = MAP_ART.w, h = MAP_ART.h } = {}) {
  const wickM = num(D?.BALANCE_V3?.ceremony?.wickHeight, 0.85);
  const L50 = num(Number(typeof sp?.size?.L50 === 'number' ? sp.size.L50 : sp?.size?.L50 && Math.min(...Object.values(sp.size.L50))), 40) / 100;
  const P = MAP_ART, boxH = wickM / P.figure, boxW = boxH * (100 / 120), fishBoxW = L50 / (1 - 2 * P.pad);
  const k = Math.min((w - P.gap) / (boxW + fishBoxW), h / Math.max(boxH, fishBoxW * P.fishAspect));
  return { k, wick: { w: boxW * k, h: boxH * k, m: wickM }, fish: { w: fishBoxW * k, h: fishBoxW * P.fishAspect * k, len: L50 * k, m: L50 } };
}

/**
 * The tally's plan (SPEC §8.3; pounds): Murk's scale takes the fish one by one, lightest first and heaviest last by the weight the
 * card showed (data.weightOz of data.fishWeight; two that read the same by value, then in the order caught), legends after them and
 * a giant last of all, alone, with a longer pause. Each row: {uid, speciesId, name, weight (fmtWeight), oz, clams, base, first,
 * giant, legend, sizeClass, at (it settles on the pan), countAt, countDur, ticks ([base, clams] for a first: two ticks, the base
 * then the sale; else [clams])}; then the total (+N, gold) at totalAt and the end. An empty hold: Murk's empty line. Pure.
 */
export const TALLY_PACE = Object.freeze({ start: 0.6, row: 0.95, firstExtra: 0.55, count: 0.45, second: 0.35, giantPause: 0.85, giantCount: 0.9, giantAfter: 0.6, total: 0.4, end: 0.55 });
export function tallyPlan(tally, { D = null, pace = {} } = {}) {
  const P = { ...TALLY_PACE, ...(isObj(pace) ? pace : {}) };
  const lines = arr(tally?.lines).filter(isObj);
  const wOz = (l) => {
    const sp = spOf(D, l.speciesId);
    if (typeof D?.weightOz === 'function' && typeof D?.fishWeight === 'function') return D.weightOz(D.fishWeight(sp, l));
    return num(Number(l.length), 0);
  };
  const keyed = lines.map((l, i) => ({ l, i, oz: wOz(l), g: l.giant === true ? 2 : l.legend === true ? 1 : 0 }));
  keyed.sort((a, b) => a.g - b.g || a.oz - b.oz || num(a.l.clams) - num(b.l.clams) || a.i - b.i);
  let t = P.start;
  const rows = keyed.map(({ l, oz }) => {
    const sp = spOf(D, l.speciesId);
    const clams = Math.max(0, Math.round(num(Number(l.clams), 0)));
    const base = Number.isFinite(Number(l.base)) ? Math.max(0, Math.round(Number(l.base))) : clams;
    const first = l.first === true && clams > base;
    const big = l.giant === true || l.legend === true;
    if (big) t += P.giantPause;
    const at = t, countAt = at + 0.25, countDur = big ? P.giantCount : P.count;
    const row = { uid: l.uid ?? null, speciesId: l.speciesId ?? null, name: sp?.name || String(l.speciesId || ''), sizeClass: l.sizeClass ?? null,
      weight: typeof D?.fmtWeight === 'function' && typeof D?.fishWeight === 'function' ? D.fmtWeight(D.fishWeight(sp, l)) : '', oz,
      clams, base, first, giant: l.giant === true, legend: l.legend === true, at, countAt, countDur,
      secondAt: first ? countAt + countDur + 0.12 : null, ticks: first ? [base, clams] : [clams] };
    t = at + (big ? P.giantCount + P.giantAfter + 0.25 : P.row) + (first ? P.firstExtra : 0);
    return row;
  });
  const total = rows.reduce((a, r) => a + r.clams, 0);
  const totalAt = rows.length ? t + P.total - 0.3 : P.start;
  return { rows, total, totalAt, end: totalAt + P.end, empty: rows.length === 0, line: rows.length ? null : (T_(D).murk?.empty || '') };
}
/** What a row shows at time t of the tally: {shown, value, ticked (0, 1 or 2)}. Pure. */
export function tallyRowAt(row, t) {
  if (!row || t < row.at) return { shown: false, value: 0, ticked: 0 };
  const e = (k) => 1 - (1 - k) * (1 - k);
  if (!row.first) {
    const k = clamp01((t - row.countAt) / Math.max(1e-6, row.countDur));
    return { shown: true, value: Math.round(row.clams * e(k)), ticked: k >= 1 ? 1 : 0 };
  }
  const k1 = clamp01((t - row.countAt) / Math.max(1e-6, row.countDur));
  if (t < row.secondAt) return { shown: true, value: Math.round(row.base * e(k1)), ticked: k1 >= 1 ? 1 : 0 };
  const k2 = clamp01((t - row.secondAt) / Math.max(1e-6, TALLY_PACE.second));
  return { shown: true, value: Math.round(row.base + (row.clams - row.base) * e(k2)), ticked: k2 >= 1 ? 2 : 1 };
}

/**
 * The Chart's model (SPEC §5.4, M1.md §3.8; one signature everywhere): {sheets: [{waterId, name, owned, gilded, places}], next,
 * hold: {slots}, fitted: {lure, bait}, pick: {water, place}}. Slice 1a: one sheet per owned lake that LOOP.waters knows (the
 * Mossmere; no Sporewood row), open water chosen, no places; next is null (and always null in the tutorial). opts.slots is
 * loop.hold().slots (the Wick's count); without it data.loopSlots(meta.loop). M1 step 3's drawn Chart draws the same model.
 */
export function chartModel(meta, D, opts = {}) {
  const ml = isObj(meta?.loop) ? meta.loop : {};
  const W = isObj(D?.LOOP?.waters) ? D.LOOP.waters : {};
  const lakes = arr(ml.maps?.lakes).filter((id) => typeof id === 'string' && isObj(W[id]));
  if (!lakes.length && isObj(W.mossmere)) lakes.push('mossmere');
  lakes.sort((a, b) => num(W[a].order, 99) - num(W[b].order, 99));
  const zone = (id) => D?.ZONE_BY_ID?.[id] || arr(D?.ZONES).find((z) => z?.id === id) || null;
  const tutorial = opts.tutorial === true;
  const sheets = lakes.map((id) => ({ waterId: id, name: zone(id)?.name || id, owned: true, gilded: false, places: chartPlacesOf(meta, D, id, { tutorial }) }));
  const slots = Number.isFinite(Number(opts.slots)) ? Number(opts.slots) : typeof D?.loopSlots === 'function' ? D.loopSlots(ml) : num(ml.holdSlots, 3);
  const water = lakes.includes(opts.water) ? opts.water : lakes[0] ?? null;
  // M1 step 3a (M1.md §3.4: "the first open of a session chooses the place you sailed to last"): the saved pick while the Chart can
  // still choose it (its water drawn and, for a place, that place owned there); open water otherwise, and always in the tutorial
  const cp = isObj(ml.chartPick) ? ml.chartPick : null;
  const canPick = !tutorial && cp && sheets.some((s) => s.waterId === cp.water && (!cp.place || s.places.some((p) => p.id === cp.place && p.owned)));
  const pick = canPick && !(opts.water && opts.water !== cp.water) ? { water: cp.water, place: cp.place ?? null } : { water, place: null };
  return { sheets, next: tutorial ? null : chartNext(meta, D), hold: { slots }, fitted: { lure: ml.fitted?.lure ?? null, bait: ml.fitted?.bait ?? null }, pick, tutorial };
}
/**
 * The Chart's next water (M1.md §3.8 `next`, SPEC §5.4, §5.5 (f)): the first water of D.ZONES past the last water the Chart draws
 * (owned and in LOOP.waters), {waterId, shipped, seals}, or null past the last. `shipped` is false for a water past LOOP.shipped
 * (decision 39): in M1, Sporewood, "Coming soon". M1 step 3a: the seals are progression-loop's sealsOf (one source for the Chart, the
 * shelf's sealed card and the catalogue's head): {map: {held, price, shipped}, gear: {held, slot, tier, item}, catch: {held, have,
 * need}}, a superset of 3b's shape. Pure.
 */
export function chartNext(meta, D) {
  const ml = isObj(meta?.loop) ? meta.loop : {};
  const W = isObj(D?.LOOP?.waters) ? D.LOOP.waters : {};
  const zones = arr(D?.ZONES).filter((z) => z && typeof z.id === 'string').slice().sort((a, b) => num(a.index, 0) - num(b.index, 0));
  const owned = arr(ml.maps?.lakes).filter((id) => typeof id === 'string');
  if (!owned.length && isObj(W.mossmere)) owned.push('mossmere');
  // the frontier is the last water the Chart draws (owned and in LOOP.waters): an old save's unshipped lake is the next sheet, its
  // map seal pressed, never a water past it
  const drawn = owned.filter((id) => isObj(W[id]));
  const at = Math.max(-1, ...drawn.map((id) => zones.findIndex((z) => z.id === id)));
  const nz = zones[at + 1];
  if (!nz || at < 0) return null;
  const sh = D?.LOOP?.shipped;
  const order = (id) => num(W[id]?.order, 0);
  const shipped = typeof sh === 'string' ? order(nz.id) > 0 && order(nz.id) <= order(sh) : Array.isArray(sh) ? sh.includes(nz.id) : isObj(W[nz.id]);
  return { waterId: nz.id, shipped, seals: sealsOf(isObj(meta) ? meta : { loop: ml }, D, nz.id) };
}
/**
 * M1 step 3a (M1.md §3.8): a water's places on the Chart, in the Chart's order (data.loopPlaceIds: day, old, night, crown), each
 * exactly {id, kind, owned, price, best, giantLanded, marked, wounds}: `price` mapCards' (null unless among Murk's three, null once
 * owned, null in the tutorial); `best` {speciesId, weight} from meta.loop.best's saved length (data.fishWeight: pounds, never a saved
 * weight) or null; `giantLanded` its giant's (or legend's) first landing; `marked` a Marked giant waiting there; `wounds` the legend's
 * (meta.legendWounds, at most LOOP's cap). Pure.
 */
export function chartPlacesOf(meta, D, waterId, { tutorial = false } = {}) {
  const ml = isObj(meta?.loop) ? meta.loop : {};
  const P = isObj(D?.LOOP?.places) ? D.LOOP.places : {};
  const ids = typeof D?.loopPlaceIds === 'function' ? arr(D.loopPlaceIds(waterId)) : Object.keys(P).filter((id) => P[id]?.water === waterId);
  if (!ids.length) return [];
  const owned = new Set(arr(ml.maps?.places));
  const priced = new Map();
  if (!tutorial) { try { for (const c of arr(mapCards(D, ml, { meta }))) if (c?.placeId) priced.set(c.placeId, num(Number(c.price), 0)); } catch { /* no prices */ } }
  const cap = Math.max(1, Math.round(num(D?.CATCH_V3?.legend?.woundCap, 18) / Math.max(1, num(D?.CATCH_V3?.legend?.woundPerEscape, 6))));
  return ids.filter((id) => isObj(P[id])).map((id) => {
    const p = P[id], own = owned.has(id);
    const b = isObj(ml.best?.[id]) ? ml.best[id] : null, bsp = b ? spOf(D, b.speciesId) : null;
    let best = null;
    if (bsp && num(Number(b.length), 0) > 0) {
      let w = null;
      try { w = typeof D?.fishWeight === 'function' ? D.fishWeight(bsp, { length: Number(b.length) }) : null; } catch { w = null; }
      if (Number.isFinite(w) && w > 0) best = { speciesId: bsp.id, weight: w };
    }
    const giant = typeof p.giant === 'string' ? p.giant : null, legend = typeof p.legend === 'string' ? p.legend : null;
    const landed = giant ? num(Number(ml.giants?.[giant]?.landed), 0) > 0 : legend ? num(Number(ml.legends?.[legend]), 0) > 0 : false;
    return { id, kind: p.kind ?? null, owned: own, price: !own && priced.has(id) ? priced.get(id) : null, best, giantLanded: landed,
      marked: giant ? num(Number(ml.giants?.[giant]?.marked), 0) > 0 : false,
      wounds: legend ? Math.max(0, Math.min(cap, Math.floor(num(Number(meta?.legendWounds?.[legend]), 0)))) : 0 };
  });
}
/** M1 step 3a (M1.md §3.6, PLAN CHOICE 19): the list Chart's place rows, in the Chart's order: every owned place and every priced one
 *  (among Murk's three), nothing else; none in the tutorial. Each row: the place ({id, kind, owned, price, best, giantLanded, …}) and
 *  its `name` (an owned place's own name; a priced one is never named, as its blot). Pure. */
export function chartRows(model, D) {
  if (!isObj(model) || model.tutorial === true) return [];
  const nameOf = (id) => (typeof D?.loopPlace === 'function' ? D.loopPlace(id)?.name : null) || D?.PLACE_BY_ID?.[id]?.name || id;
  return arr(model.sheets).flatMap((s) => arr(s.places).filter((p) => p.owned === true || p.price != null)
    .map((p) => ({ ...p, water: s.waterId, name: p.owned ? nameOf(p.id) : null })));
}
/** M1 step 3a (M1.md §3.3, §3.6): the bait slot under the Chart: the chosen water's legend bait (LOOP.legendBait; 3a's only item),
 *  {id, name, count (the water's bag), fitted, can (one to fit, or one fitted)}; null in the tutorial or for a water with none. Pure. */
export function baitSlotModel(model, metaLoop, D) {
  if (!isObj(model) || model.tutorial === true) return null;
  const water = model.pick?.water || model.sheets?.[0]?.waterId || null;
  const lb = water ? D?.LOOP?.legendBait?.[water] : null;
  if (!isObj(lb) || typeof lb.id !== 'string') return null;
  const ml = isObj(metaLoop) ? metaLoop : {};
  const count = Math.max(0, Math.floor(num(Number(ml.bait?.[water]?.[lb.id]), 0)));
  const fitted = (model.fitted?.bait ?? ml.fitted?.bait ?? null) === lb.id;
  const name = arr(D?.BAITS).find((b) => b?.id === lb.id)?.name || lb.id;
  return { id: lb.id, water, name, count, fitted, can: fitted || count > 0 };
}

/** The title's words under the loop (SPEC §8.5, PLAN CHOICE 33): fresh → New Descent · Settings; else Continue · Settings (· Prologue). */
export function titleModel({ fresh = false, replay = false, D = null } = {}) {
  const TL = T_(D);
  const settings = TL.settings?.label || 'Settings';
  if (fresh) return { fresh: true, primary: TL.newDescent || 'New Descent', words: [TL.newDescent || 'New Descent', settings], prologue: false };
  const words = [TL.continue || 'Continue', settings];
  const pro = D?.INTRO?.trigger?.replay?.word || 'Prologue';
  if (replay) words.push(pro);
  return { fresh: false, primary: TL.continue || 'Continue', words, prologue: !!replay };
}

/** New Descent under the loop (SPEC §8.5, PLAN CHOICEs 29, 42): the five Wicks in LOOP.wicks order, the lit Wick's one line, Back,
 *  Start. {cards: [{id, name, look}], sel, line, words}. */
export function descentModel(D, sel = 'wick') {
  const order = arr(D?.LOOP?.wicks?.order).length ? D.LOOP.wicks.order : ['wick', 'taper', 'stub', 'tallow', 'ashwick'];
  const by = (id) => D?.CHARACTER_BY_ID?.[id] || arr(D?.CHARACTERS).find((c) => c?.id === id) || null;
  const s = order.includes(sel) ? sel : order[0];
  const cards = order.map((id) => ({ id, name: by(id)?.name || id, look: by(id)?.look || {} }));
  const TL = T_(D);
  const line = TL.wicks?.[s] || '';
  return { cards, sel: s, line, words: [...cards.map((c) => c.name), line, TL.back || 'Back', TL.start || 'Start'] };
}

/** The catch card's foot on a trip (SPEC §8.2, PLAN §2.3 item 5, T54): exactly Keep (key 1, primary; its clams; dimmed with no
 *  words when the hold is full) and Let go (key 2; focused when Keep is dimmed). Pure. */
export function cardActions({ clams = 0, holdFull = false, D = null } = {}) {
  const TL = T_(D);
  const V = Math.max(0, Math.round(num(Number(clams), 0)));
  return [
    { action: 'keep', key: '1', label: TL.keep || 'Keep', clams: V, clamsText: fmtClams(V), primary: true, disabled: holdFull === true, autofocus: holdFull !== true },
    { action: 'letgo', key: '2', label: TL.letGo || 'Let go', clams: null, primary: false, disabled: false, autofocus: holdFull === true },
  ];
}
/** The card's keys on a trip (T54): 1 keeps, 2 lets go (1 does nothing while Keep is dimmed: the button is disabled). */
export const CARD_KEYS = Object.freeze({ Digit1: 'keep', Digit2: 'letgo', Numpad1: 'keep', Numpad2: 'letgo' });

/** The loop's modal options (T57): what Escape does on each screen. The Jetty's Escape opens the home pause (never closes the Jetty);
 *  the tally's skips to its end (never presses Sold); the shelf's and the Chart's go back to the Jetty. */
export const LOOP_MODALS = Object.freeze({
  jetty: Object.freeze({ screen: true, blocking: false, dismissable: false, escape: 'homepause' }),
  tally: Object.freeze({ screen: false, blocking: true, dismissable: false, escape: 'skip' }),
  shelf: Object.freeze({ screen: false, blocking: true, dismissable: true, escape: 'jetty' }),
  chart: Object.freeze({ screen: false, blocking: true, dismissable: true, escape: 'jetty' }),
  homepause: Object.freeze({ screen: false, blocking: true, dismissable: true, escape: 'close' }),
});
/** On a trip ui's handleKey swallows the built creel, Burn-a-fish and bait-cycle keys (T58): true, nothing done, nothing said. */
export function tripKeySwallow(code) { return code === 'KeyC' || code === 'KeyR' || code === 'KeyB'; }

/** The Journal species page's "First" cell under the loop (T47, SPEC §10 "Evening N"): never a day or a descent. */
export function journalFirst(entry) {
  const n = Math.floor(num(Number(entry?.firstEvening), 0));
  return n > 0 ? `Evening ${n}` : '—';
}
/**
 * v8 (SPEC §5.5 (f), T83): a water's tab under the loop: its list's cards first (listFor, with a notch, pressed once landed), the
 * water's other species after a thin rule, outside the count; the badge is the list's count "n/6" (num(caught) > 0 only).
 */
export function journalModel(meta, D, waterId, { listFor = null } = {}) {
  const J = isObj(meta?.journal) ? meta.journal : {};
  const ids = typeof listFor === 'function' ? arr(listFor(D, waterId)) : [];
  const caught = (id) => num(Number(J[id]?.caught), 0) > 0;
  const list = ids.map((id) => ({ id, landed: caught(id) }));
  const rest = arr(D?.SPECIES).filter((s) => s?.zone === waterId && !ids.includes(s.id)).map((s) => ({ id: s.id, landed: caught(s.id) }));
  const have = list.filter((x) => x.landed).length;
  return { list, rest, have, need: list.length, badge: `${have}/${list.length}` };
}

/**
 * M1 step 3a (SPEC §8.8, M1.md §2.17): the catalogue's page as the view draws it, from progression-loop's catalogueFor: {head: {waterId,
 * name, count ("n/12"), seals}, list: Card[], groups: [{placeId, kind, owned, name (null while unowned), cards}], finds: null}. A
 * Card: {id, caught, listed, name (its own once caught, "· · ·" until then), star (a giant or the legend), gold (the legend's card),
 * edge ('gold' for a giant), glyphs (icon names: a listed fish its place glyph and its hours; a fish under a heading its hours and its
 * one bait)}. No number and no rate in a card, ever (revision 7). Pure.
 */
const BAIT_GLYPH = { heartmoss: 'mossball' };
export function catalogueView(cat, D) {
  if (!isObj(cat)) return null;
  const card = (e, listed) => {
    const sp = spOf(D, e.id);
    const caught = e.caught === true;
    const glyphs = listed ? [e.place ? `kind_${e.place}` : 'kind_open', ...arr(e.hours)] : [...arr(e.hours), ...(e.bait ? [BAIT_GLYPH[e.bait] || 'worm'] : [])];
    return { id: e.id, caught, listed, name: caught ? sp?.name || e.id : '· · ·', star: e.giant === true || e.legend === true, gold: e.legend === true,
      edge: e.giant === true ? 'gold' : null, glyphs };
  };
  const h = isObj(cat.head) ? cat.head : {};
  return {
    head: { waterId: h.waterId ?? null, name: h.name ?? '', count: `${Math.floor(num(Number(h.have), 0))}/${Math.floor(num(Number(h.need), 0))}`, have: num(Number(h.have), 0), need: num(Number(h.need), 0), seals: isObj(h.seals) ? h.seals : null },
    list: arr(cat.list).map((e) => card(e, true)),
    groups: arr(cat.groups).map((g) => ({ placeId: g.placeId ?? null, kind: g.kind ?? 'open', owned: g.owned === true, name: g.owned === true ? g.name ?? null : null, cards: arr(g.entries).map((e) => card(e, false)) })),
    finds: null,
  };
}
/** M1 step 3a (PLAN CHOICEs 11, 25): the Journal's ★ page, the giants and the legend of the given waters (in M1 the Mossmere's three),
 *  each {id, caught, name ("· · ·" until landed), legend, weight (its best, fmtWeight of its best length) | null}. Pure. */
export function giantsView(meta, D, waterIds = ['mossmere']) {
  const J = isObj(meta?.journal) ? meta.journal : {};
  const ws = arr(waterIds);
  return arr(D?.SPECIES).filter((s) => isObj(s) && ws.includes(s.zone) && (s.giant === true || s.rarity === 'legendary')).map((s) => {
    const rec = J[s.id], caught = num(Number(rec?.caught), 0) > 0, len = num(Number(rec?.pbLength), 0);
    let weight = null;
    if (caught && len > 0 && typeof D?.fmtWeight === 'function' && typeof D?.fishWeight === 'function') { try { weight = D.fmtWeight(D.fishWeight(s, { length: len })); } catch { weight = null; } }
    return { id: s.id, caught, name: caught ? s.name : '· · ·', legend: s.rarity === 'legendary', weight };
  });
}
/** M1 step 3a (T142): the lift's title card for a place:lift event: {show, name, dur} (the 'title' phase only; LOOP.lift.title s). */
export function liftTitle(p, D) {
  const dur = num(D?.LOOP?.lift?.title, 1.2);
  if (!isObj(p) || p.phase !== 'title') return { show: false, name: null, dur };
  const name = (typeof p.name === 'string' && p.name) || (typeof D?.loopPlace === 'function' ? D.loopPlace(p.placeId)?.name : null) || null;
  return { show: !!name, name, dur };
}
/**
 * M1 step 3a (T144, SPEC §8.6): Murk's one line after a sale, by its order: a water's list complete (with the catch seal's press), a
 * legend's first landing, the first giant sold, the first sale, the first Trophy or bigger. `rows` the tally's (tallyPlan), `said`
 * meta.loop.said, `listDone` the list complete on this save. → the sayOnce id, or null.
 */
export function saleLineId({ rows = [], said = {}, listDone = false, empty = false } = {}) {
  const S = isObj(said) ? said : {};
  if (listDone && !S.listComplete) return 'listComplete';
  if (empty) return null;
  const R = arr(rows);
  if (R.some((r) => r.legend) && !S.legendFirst) return 'legendFirst';
  if (R.some((r) => r.giant) && !S.firstGiant) return 'firstGiant';
  if (!S.firstSale) return 'firstSale';
  if (R.some((r) => r.giant || r.legend || r.sizeClass === 'trophy' || r.sizeClass === 'elder') && !S.firstTrophy) return 'firstTrophy';
  return null;
}

/** Settings' words under the loop (PLAN CHOICE 43, T74, T69); off the loop the built words. */
export function settingsWords(D, loopOn) {
  const S = T_(D).settings || {}, F = T_(D).forget || {};
  if (loopOn !== true) {
    return { damageNumbers: true, flashSub: 'Softer flares and hit flashes', ringFirst: 'First outing',
      hurry: 'From your second outing, hold anywhere to hurry a small fish in. It never changes the outcome',
      forgetRow: 'Memories, relics, trials, the Journal. There is no undo.', forgetConfirm: 'Every Memory, relic, trial and name in the Journal will be lost.' };
  }
  return { damageNumbers: false, flashSub: '', ringFirst: S.ringFirst || 'First evening', hurry: S.hurry || '', forgetRow: F.row || '', forgetConfirm: F.confirm || '' };
}

/** The first trip's two words (PLAN CHOICE 39, T68): fe_cast once, castTipAfter s after run:start while fishing is idle. */
export function castTipDue({ evening = 0, seen = false, state = 'idle', since = 0, after = 1.5, shown = false } = {}) {
  return evening === 1 && !seen && !shown && state === 'idle' && since >= after;
}
/** fe_strike: "Now. Tap." on touch, "Now. Click." with a mouse. */
export function strikeTipText(D, isTouch = false) {
  const t = D?.FIRST_EVENING?.tips?.fe_strike;
  return isObj(t) ? (isTouch ? t.touch : t.desktop) || '' : typeof t === 'string' ? t : '';
}

/**
 * T43's allow-list (the scenario's helper, lane D): the words a loop screen may show. A visible text node passes when it is a
 * TEXT_LOOP string, a species, water or Wick name, a size-class label, a shelf item's name, a built record kicker, the card's
 * "length" label, a built tip the loop shows, the Prologue word, a key glyph, or a number (a price, a count, a weight as fmtWeight
 * prints it, the card's one length in cm). "New Descent" is allowed on the fresh title and the panel only (screen 'title' or
 * 'newdescent'); "cm" only on the card ('catch').
 */
export function allowedWords(D) {
  const out = new Set();
  const walk = (v) => { if (typeof v === 'string') out.add(v); else if (Array.isArray(v)) v.forEach(walk); else if (isObj(v)) Object.values(v).forEach(walk); };
  walk(T_(D));
  for (const s of arr(D?.SPECIES)) if (s?.name) out.add(s.name);
  for (const z of arr(D?.ZONES)) if (z?.name) out.add(z.name);
  for (const c of arr(D?.CHARACTERS)) if (c?.name) out.add(c.name);
  for (const c of arr(D?.SIZE_CLASSES)) if (c?.label) out.add(c.label);
  out.add('Legend');
  for (const st of arr(D?.LOOP?.hold?.ladder)) if (st?.name) out.add(st.name);
  if (D?.LOOP?.hold?.startName) out.add(D.LOOP.hold.startName);
  for (const slot of ['rod', 'line', 'reel']) for (const t of arr(D?.TACKLE?.[slot])) if (t?.name) out.add(t.name);
  for (const names of Object.values(D?.LOOP?.tackle?.names || {})) walk(names);
  const tips = D?.FIRST_EVENING?.tips || {};
  walk(tips.fe_cast); walk(tips.fe_strike);
  out.add(D?.INTRO?.trigger?.replay?.word || 'Prologue');
  // M1 step 3a (T143): the places' names (an owned place's row, its catalogue heading, the lift's title card) and a legend's bait
  for (const id of Object.keys(isObj(D?.LOOP?.places) ? D.LOOP.places : {})) { const n = typeof D?.loopPlace === 'function' ? D.loopPlace(id)?.name : null; if (n) out.add(n); }
  for (const lb of Object.values(isObj(D?.LOOP?.legendBait) ? D.LOOP.legendBait : {})) { const n = arr(D?.BAITS).find((b) => b?.id === lb?.id)?.name; if (n) out.add(n); }
  for (const k of ['A new personal best', 'A new name for the journal', 'Old Ledger beaten', 'Written in the Elder Log', 'A new record for this place', 'length']) out.add(k);
  return out;
}
const NUM_RE = /^[+]?\d[\d,]*(\.\d+)?[km]?$/;
const WEIGHT_RE = /^(?:[¼½¾]|\d+(?:\s?[¼½¾])?)\s?oz$|^\d[\d,]*\s?lb(?:\s\d+\s?oz)?$/;
const CM_RE = /^\d+(?:\.\d+)?\s?cm$/;
const KEY_RE = /^(?:[A-Z0-9]|Esc|Space|Enter)$/;
export function textAllowed(text, { D = null, screen = null, words = null } = {}) {
  const t = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (!t) return true;
  const W = words || allowedWords(D);
  if (/descent/i.test(t)) return t === (T_(D).newDescent || 'New Descent') && (screen === 'title' || screen === 'newdescent');
  if (/shells?|memories/i.test(t)) return false;
  if (W.has(t)) return true;
  if (NUM_RE.test(t) || WEIGHT_RE.test(t) || KEY_RE.test(t) || t === '—' || t === '·' || t === '★' || t === '· · ·') return true;
  if (CM_RE.test(t)) return screen === 'catch';
  if (/^Your first (Small|Keeper|Prize|Trophy|Elder|Ancient)$/.test(t) || /^A legend of /.test(t)) return true;
  if (/^Evening \d+$/.test(t)) return true;
  // M1 step 3a: a list's count ("7/12", SPEC §8), and a giant's or the legend's name after its ★
  if (/^\d+\/\d+$/.test(t)) return true;
  if (/^★ /.test(t) && W.has(t.slice(2))) return true;
  // the goal line: "Next: {name} · {price}" with a known name (a hold step or a shelf item) and a number
  const m = /^Next: (.+) · (.+)$/.exec(t);
  if (m && NUM_RE.test(m[2]) && (W.has(m[1]) || /^Hold \d+$/.test(m[1]))) return true;
  return false;
}

// ---------------------------------------------------------------- drawings (pure strings)
/** The Chart's ink vignette of a water (1a: the Mossmere): its rim, its islands, the Jetty's warm lamp and the way out to open water. */
export function chartVignette(D, waterId = 'mossmere', { uid = 'cv', places = [], pick = null } = {}) {
  const z = D?.ZONE_BY_ID?.[waterId] || arr(D?.ZONES).find((x) => x?.id === waterId) || null;
  const A = z?.arena || {};
  const R = Math.max(10, num(A.radius, 60));
  const s = 64 / R;   // the drawing's radius is 64 units
  const P = (x, y) => `${(x * s).toFixed(1)} ${(y * s).toFixed(1)}`;
  // the rim: a hand-inked loop (a few slow harmonics, so it never reads as a drawn circle)
  const seed = String(waterId).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const pts = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const r = R * (1 + 0.06 * Math.sin(3 * a + seed) + 0.035 * Math.sin(5 * a + seed * 0.7) + 0.02 * Math.cos(9 * a + seed * 1.3));
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  const rim = `M${P(...pts[0])}` + pts.slice(1).map((p) => ` L${P(...p)}`).join('') + ' Z';
  const isles = arr(A.islands).map((q, i) => {
    const r = Math.max(1.5, num(q.r, 4));
    const k = 8, wob = (j) => 1 + 0.18 * Math.sin(j * 2.3 + i * 1.7);
    let d = '';
    for (let j = 0; j <= k; j++) { const a = (j / k) * Math.PI * 2; d += `${j ? ' L' : 'M'}${P(num(q.x) + Math.cos(a) * r * wob(j), num(q.z) + Math.sin(a) * r * wob(j))}`; }
    return `<path class="gw-cv-isle" d="${d} Z"/>`;
  }).join('');
  const dock = arr(A.docks)[0] || null;
  let way = '', home = '';
  if (dock && typeof D?.sailPlan === 'function') {
    const g = D.sailPlan({ x: num(dock.x), z: num(dock.z) }, { x: 0, z: 0 }, D?.LOOP?.tutorial, waterId);
    way = `<path class="gw-cv-way" d="M${g.path.map((p) => P(p.x, p.z)).join(' L')}"/>`
      + `<g class="gw-cv-float" transform="translate(${P(g.to.x, g.to.z).replace(' ', ' ')})"><circle r="2.6"/><path d="M0 -2.6 V-6.4"/></g>`;
  }
  if (dock) home = `<circle class="gw-cv-glow" cx="${(num(dock.x) * s).toFixed(1)}" cy="${(num(dock.z) * s).toFixed(1)}" r="9" fill="url(#${uid}g)"/><circle class="gw-cv-home" cx="${(num(dock.x) * s).toFixed(1)}" cy="${(num(dock.z) * s).toFixed(1)}" r="2.2"/>`;
  // M1 step 3a (M1.md §3.3): the places at their arena sites: a place not yet owned is a soft lavender blot of mist; an owned one a
  // small ink mark, a chosen one underlined in ink (never a ring round anything)
  let marks = '', mist = '';
  for (const q of arr(places)) {
    const lp = typeof D?.loopPlace === 'function' ? D.loopPlace(q?.id) : null;
    if (!lp || !Number.isFinite(lp.x) || !Number.isFinite(lp.z)) continue;
    const a = lp.area || {};
    const cx = (a.kind === 'path' && arr(a.pts).length >= 2 ? (a.pts[0][0] + a.pts[a.pts.length - 1][0]) / 2 : Number.isFinite(a.x) ? a.x : lp.x) * s;
    const cy = (a.kind === 'path' && arr(a.pts).length >= 2 ? (a.pts[0][1] + a.pts[a.pts.length - 1][1]) / 2 : Number.isFinite(a.z) ? a.z : lp.z) * s;
    const ext = a.kind === 'rect' ? Math.max(num(a.w), num(a.d)) / 2 : a.kind === 'path' && arr(a.pts).length >= 2 ? Math.hypot(a.pts[a.pts.length - 1][0] - a.pts[0][0], a.pts[a.pts.length - 1][1] - a.pts[0][1]) / 2 : num(a.r, 7);
    const rr = Math.max(4, Math.min(12, ext * s));
    if (q.owned) {
      const on = pick && pick.place === q.id;
      marks += `<g class="gw-cv-place gw-cv-place--${escH(q.kind)}${on ? ' gw-on' : ''}"><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="2.3"/>${on ? `<path d="M${(cx - 5).toFixed(1)} ${(cy + 5).toFixed(1)} q5 2 10 0"/>` : ''}</g>`;
    } else mist += `<ellipse class="gw-cv-mist" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(rr * 1.2).toFixed(1)}" ry="${(rr * 0.8).toFixed(1)}" fill="url(#${uid}m)"/>`;
  }
  return `<svg class="gw-cv" viewBox="-74 -74 148 148" aria-hidden="true"><defs><radialGradient id="${uid}g"><stop offset="0" stop-color="#ed9e3b" stop-opacity=".75"/><stop offset="1" stop-color="#ed9e3b" stop-opacity="0"/></radialGradient>`
    + `${mist ? `<radialGradient id="${uid}m"><stop offset="0" stop-color="#c8c2f0" stop-opacity=".55"/><stop offset=".6" stop-color="#b8b0ee" stop-opacity=".22"/><stop offset="1" stop-color="#b8b0ee" stop-opacity="0"/></radialGradient>` : ''}</defs>`
    + `<path class="gw-cv-wash" d="${rim}"/><path class="gw-cv-rim" filter="url(#gw-brush)" d="${rim}"/>${isles}${mist}${way}${home}${marks}</svg>`;
}
/** Murk's scale (the tally): a post, a beam and two pans in ink; the fish settle on the right pan, the clams on the left. */
export function scaleSvg() {
  const pan = (x, cls) => `<g class="gw-scale-pan ${cls}" data-x="${x}"><path class="gw-sc-thread" d="M${x} 24 L${x - 22} 66 M${x} 24 L${x + 22} 66 M${x} 24 V66"/>`
    + `<path class="gw-sc-dish" d="M${x - 26} 66 Q${x} 80 ${x + 26} 66"/><g class="gw-sc-load"></g></g>`;
  return `<svg class="gw-scale" viewBox="0 0 260 112" aria-hidden="true"><g filter="url(#gw-brush)">`
    + '<path class="gw-sc-post" d="M130 106 V20 M104 106 H156 M118 106 Q130 98 142 106"/><circle class="gw-sc-pin" cx="130" cy="20" r="3"/></g>'
    + `<g class="gw-scale-beam"><path class="gw-sc-beam" filter="url(#gw-brush)" d="M42 22 Q130 16 218 22"/><circle class="gw-sc-knob" cx="42" cy="22" r="2.2"/><circle class="gw-sc-knob" cx="218" cy="22" r="2.2"/></g>`
    + `${pan(46, 'gw-scale-pan--clams')}${pan(214, 'gw-scale-pan--fish')}</svg>`;
}
/** The three Jetty tiles' small ink drawings: Murk (his barge-lamp, the UI's one sage trace), the Chart (a rolled sheet), the Journal. */
function tileArt(id) {
  if (id === 'murk') {
    // Murk in the tiles' own pale ink (his full portrait is the shelf's): the hunched toad under his towering pack, his gold eyes and
    // his dim barge-lamp, the interface's one sage trace
    return `<svg class="gw-tile-art gw-tile-art--murk" viewBox="0 0 96 64" aria-hidden="true"><g filter="url(#gw-brush)" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M30 44 C28 26 34 12 46 8 C54 5 62 8 64 17 L65 44" stroke-width="1.7"/><path d="M35 18 h24 M33 27 h29 M32 36 h31" stroke-width="1.1" stroke-opacity=".55"/>
      <path d="M64 17 q8 -10 9 -2 v4" stroke-width="1.4"/><path d="M69 19 h8 l-1.4 3 h-5.2 z M70.5 22 h5.2 l1 6 h-7.2 z" stroke-width="1.2"/>
      <path d="M18 62 C15 50 22 40 36 38 C43 30 59 30 66 38 C79 40 86 50 83 62" stroke-width="1.8"/>
      <path d="M26 52 c5 -2 8 -1 10 1 M62 53 c4 -3 8 -2 11 1" stroke-width="1.1" stroke-opacity=".6"/></g>
      <path d="M36 41 q5 -3.4 10 0 q-5 1.8 -10 0z M52 41 q5 -3.4 10 0 q-5 1.8 -10 0z" fill="#e8c86a"/>
      <circle cx="73" cy="25" r="2.2" class="gw-tile-sage"/></svg>`;
  }
  if (id === 'chart') {
    return `<svg class="gw-tile-art" viewBox="0 0 96 64" aria-hidden="true"><g filter="url(#gw-brush)" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 14 C30 10 66 10 82 14 L80 50 C64 46 32 46 16 50 Z" stroke-width="1.8"/><path d="M82 14 c5 1 6 6 3 9 c-2 2 -5 1 -5 -2" stroke-width="1.6"/>
      <path d="M16 50 c-5 1 -7 6 -3 8 c3 2 6 -1 4 -4" stroke-width="1.6"/>
      <path d="M30 32 C34 22 50 20 58 26 C66 32 62 42 50 42 C40 42 28 40 30 32 Z" stroke-width="1.3" stroke-opacity=".8"/>
      <path d="M38 30 q4 -3 7 0" stroke-width="1.1" stroke-opacity=".6"/><path d="M52 36 q3 -2 5 0" stroke-width="1.1" stroke-opacity=".6"/></g>
      <circle cx="58" cy="38" r="2.2" class="gw-tile-lamp"/></svg>`;
  }
  return `<svg class="gw-tile-art" viewBox="0 0 96 64" aria-hidden="true"><g filter="url(#gw-brush)" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 14 C32 10 42 12 48 18 C54 12 64 10 76 14 V52 C64 48 54 50 48 56 C42 50 32 48 20 52 Z" stroke-width="1.8"/><path d="M48 18 V56" stroke-width="1.4"/>
    <path d="M27 24 h14 M27 31 h12 M56 24 h13 M56 31 h10" stroke-width="1.1" stroke-opacity=".55"/>
    <path d="M57 40 c4 -3 9 -3 12 0 l3 -2 v5 l-3 -2 c-3 3 -8 3 -12 -1z" stroke-width="1.1" stroke-opacity=".8"/></g></svg>`;
}
const SEAL_GLYPH = '<svg class="gw-trow-seal" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2c2.2 0 2.6 1.6 4.4 2.3s3.4.1 4 2.1-.8 2.9-.7 4.6.9 3.2-.4 4.6-2.9.6-4.4 1.6-1.9 2.8-3.9 2.8-2.5-1.8-3.9-2.8-3.2-.2-4.4-1.6-.4-2.9-.4-4.6S2.4 9.6 3 7.6s2.3-1.4 4-2.1S9.8 3.2 12 3.2z"/><path class="k" d="M8.6 12.4l2.4 2.4 4.6-5"/></svg>';

// ================================================================== the view
export function createLoopView(K) {
  const { ctx, h, D, safe } = K;
  const esc = K.esc || escH;
  const report = (where, e) => { try { K.report?.(`loop.${where}`, e); } catch { /* ignore */ } };
  const loop = () => { const p = ctx.progression; if (!p || p.isStub) return null; const l = p.loop; return l && typeof l === 'object' && !l.isStub ? l : null; };
  const L = (name, ...a) => { const l = loop(); const f = l?.[name]; if (typeof f !== 'function') return null; try { return f.apply(l, a); } catch (e) { report(name, e); return null; } };
  const game = () => (ctx.game && typeof ctx.game === 'object' ? ctx.game : {});
  const G = (name, ...a) => { const f = game()[name]; if (typeof f !== 'function') return null; try { return f.apply(game(), a); } catch (e) { report(`game.${name}`, e); return null; } };
  const TL = () => T_(D());
  const run = () => ctx.state?.run || null;
  const onTrip = () => run()?.outing === 'trip';
  const parts = () => K.screens?.parts || {};
  const audioPlay = (name, o) => { try { return ctx.audio?.play?.(name, o) === true; } catch { return false; } };
  const coin = (bright, o = {}) => { if (bright) { if (!audioPlay('coinBright', o)) audioPlay('coin', o); } else audioPlay('coin', o); };
  const tut = createLoopTutorial({ bus: ctx.bus, loop, data: D, now: () => (typeof performance !== 'undefined' ? performance.now() / 1000 : 0) });
  const reducedMotion = () => K.settings?.().reducedMotion === true || (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } })();
  K.root.classList.add('gw-loop-on');

  // ------------------------------------------------------------------ the HUD on the water: the hold row and the Home pill
  const hudEl = K.layers.hud;
  const holdRow = h('div', 'gw-hold');
  holdRow.dataset.loop = 'hold';
  (hudEl.querySelector('.gw-tl') || hudEl).appendChild(holdRow);
  const pill = h('button', 'gw-pill gw-home', `<span class="gw-home-k" aria-hidden="true"><i class="gw-home-ring"></i>${icon('hearth')}</span><span class="gw-pill-label"></span><kbd>H</kbd>`);
  pill.type = 'button';
  pill.dataset.loop = 'home';
  pill.querySelector('.gw-pill-label').textContent = TL().home || 'Home';
  (hudEl.querySelector('.gw-actions') || hudEl).appendChild(pill);
  const P = { press: null, fired: false, key: false, k: 0 };
  const holdFull = () => L('holdFull') === true;
  function fireHome(via) {
    if (P.fired) return;
    P.fired = true;
    const ok = G('goHome');
    if (ok === false || ok === null) { pill.classList.remove('gw-nope'); void pill.offsetWidth; pill.classList.add('gw-nope'); P.fired = false; }
    else K.sfx?.('ui_click', { volume: 0.5 });
    void via;
  }
  function pressStart(src) {
    if (!onTrip() || P.press) return;
    if (G('canGoHome', { fromPause: false })?.ok !== true) return;
    P.press = { src, t: 0 }; P.fired = false;
    pill.classList.add('gw-held');
  }
  function pressEnd(src, { cancel = false } = {}) {
    if (!P.press || P.press.src !== src) return;
    const t = P.press.t;
    P.press = null;
    pill.classList.remove('gw-held');
    if (!cancel && !P.fired && pillHold(t, holdFull()).fire) fireHome(src);
    P.k = 0; pill.style.setProperty('--k', '0');
  }
  const guard = (fn) => (e) => { e.preventDefault(); e.stopPropagation(); try { fn(e); } catch (err) { report('pill', err); } };
  pill.addEventListener('pointerdown', guard((e) => { try { pill.setPointerCapture?.(e.pointerId); } catch { /* ignore */ } pressStart('pointer'); }));
  pill.addEventListener('pointerup', guard(() => pressEnd('pointer')));
  pill.addEventListener('pointercancel', guard(() => pressEnd('pointer', { cancel: true })));
  pill.addEventListener('lostpointercapture', () => pressEnd('pointer', { cancel: true }));
  pill.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); });
  try { addEventListener('keyup', (e) => { if (e.code === 'KeyH') pressEnd('key'); }); addEventListener('blur', () => { pressEnd('key', { cancel: true }); pressEnd('pointer', { cancel: true }); }); } catch { /* no window */ }

  let holdSig = '';
  const fishArt = new Map();
  function paintHold(force = false) {
    const H = L('hold');
    const cells = slotCells(isObj(H) ? H : { slots: 0, fish: [] }, { D: D() });
    const sig = cells.map((c) => (c.filled ? `${c.uid}:${c.sizeClass}:${c.gild ? 1 : 0}` : '-')).join('|');
    if (!force && sig === holdSig) return;
    const before = holdSig.split('|').filter((x) => x && x !== '-').length;
    holdSig = sig;
    holdRow.innerHTML = '';
    let filled = 0;
    for (const c of cells) {
      const cell = h('span', `gw-slot${c.filled ? ' gw-filled' : ''}${c.gild ? ' gw-gild' : ''}`);
      cell.dataset.filled = c.filled ? '1' : '0';
      if (c.filled) {
        filled++;
        cell.style.setProperty('--s', String(c.scale));
        let cv = fishArt.get(c.uid);
        if (!cv) {
          cv = h('canvas', 'gw-slot-fish');
          try { drawFishInk(cv, spOf(D(), c.speciesId), { w: 40, h: 22, pad: 0.04, gain: 7, color: c.gild ? '#f1d7a0' : '#ece8f4' }); } catch (e) { report('slot art', e); }
          if (c.uid) fishArt.set(c.uid, cv);
        }
        cell.appendChild(cv);
        if (filled > before && before >= 0 && holdSig) cell.classList.add('gw-new');
      }
      holdRow.appendChild(cell);
    }
    holdRow.classList.toggle('gw-full', cells.length > 0 && filled >= cells.length);
    // M1 step 3a (T141, SPEC §8.1): past six cells the row wraps to two on a phone (Tallow's 7 at Hold 6); one row on a desktop
    holdRow.dataset.n = String(cells.length);
    holdRow.classList.toggle('gw-hold--wrap', cells.length > 6);
    if (fishArt.size > 24) for (const k of fishArt.keys()) { if (!cells.some((c) => c.uid === k)) fishArt.delete(k); }
  }

  // ------------------------------------------------------------------ the first trip's two words (PLAN CHOICE 39)
  const TIP = { since: 0, castEl: null, strikeEl: null, firstBite: false };
  const seenTip = (id) => !!K.meta?.().seenTips?.[id];
  const markTip = (id) => { const m = K.meta?.(); if (m) { m.seenTips = m.seenTips || {}; m.seenTips[id] = true; } };
  // `low`: fe_strike sits in the lower part of the screen (the HUD layer), clear of the float, its bite glyph and the strike ring,
  // which the bite's camera frames in the upper part, where the toasts are
  function tipEl(text, { low = false } = {}) {
    const el = h('div', `gw-toast gw-toast--tip gw-loop-tip gw-toast--loop${low ? ' gw-loop-tip--low' : ''}`, `${icon('quill', { cls: 'gw-toast-ico' })}<span></span>`);
    el.querySelector('span').textContent = text;
    (low ? hudEl : K.layers.toasts).appendChild(el);
    requestAnimationFrame(() => el.classList.add('gw-in'));
    return el;
  }
  function dropTip(which) {
    const el = TIP[which];
    if (!el) return;
    TIP[which] = null;
    el.classList.remove('gw-in'); el.classList.add('gw-out');
    setTimeout(() => el.remove(), 420);
  }

  // ------------------------------------------------------------------ the lift's title card (M1 step 3a; T142, PLAN CHOICE 21)
  const LT = { el: null, t: 0, dur: 0 };
  function showLiftTitle(tc) {
    dropLiftTitle(true);
    const el = h('div', `gw-lift-title${reducedMotion() ? ' gw-rm' : ''}`, `<span class="gw-lift-crest" aria-hidden="true">${ORN.crest}</span><b></b><span class="gw-lift-flourish" aria-hidden="true">${ORN.flourish}</span>`);
    el.querySelector('b').textContent = tc.name;
    el.dataset.loop = 'lifttitle';
    hudEl.appendChild(el);
    requestAnimationFrame(() => el.classList.add('gw-in'));
    LT.el = el; LT.t = 0; LT.dur = tc.dur;
  }
  function dropLiftTitle(now = false) {
    const el = LT.el;
    if (!el) return;
    LT.el = null;
    if (now) { el.remove(); return; }
    el.classList.remove('gw-in'); el.classList.add('gw-out');
    setTimeout(() => el.remove(), 380);
  }

  // ------------------------------------------------------------------ Murk's lines on the water (one lore toast; never in a bite)
  function murkToast(line) {
    if (!line) return;
    K.toast(line, 'lore', { icon: 'lantern', cls: 'gw-toast--murk gw-toast--loop', dur: 4600 });
  }
  let quietSaid = false;

  // ------------------------------------------------------------------ the Jetty
  const J = { line: null, lineT: 0, lineHold: 0, press: null, count: null };
  function jettyLine() {
    const c = tut.cue();
    if (tut.isActive()) return c.line || null;
    return J.line;
  }
  function openJetty({ line = null, press = null } = {}) {
    J.line = line || null; J.lineT = 0;
    J.lineHold = line ? 4.5 + 0.05 * String(line).length : 0;
    // M1 step 3a (T144, PLAN CHOICE 12): the catch seal presses with Murk's line, once (its own stamp; loop:seal for its sound)
    J.press = press || null; J.pressed = false;
    if (J.press) { const lc = L('listCount', 'mossmere'); J.count = lc ? `${Math.floor(num(Number(lc.have), 0))}/${Math.floor(num(Number(lc.need), 0))}` : null; }
    if (K.has('jetty')) { K.entry('jetty')?.render(); return; }
    const o = LOOP_MODALS.jetty;
    K.openModal('jetty', renderJetty, { screen: o.screen, blocking: o.blocking, dismissable: false, cls: 'gw-m-jetty', onEscape: () => openHomePause(), onKey: jettyKeys });
  }
  let jettySig = '';
  function renderJetty(entry, body) {
    const c = tut.cue();
    const clams = num(Number(L('state')?.clams), 0);
    const goal = tut.isActive() ? null : goalLine(L('goal'), { D: D(), wick: L('wick') });
    const line = jettyLine();
    jettySig = JSON.stringify([c, clams, goal?.text, line]);
    const wrap = h('div', `gw-jetty${reducedMotion() ? ' gw-rm' : ''}`);
    wrap.dataset.loop = 'jetty';
    wrap.innerHTML = `<div class="gw-jetty-veil" aria-hidden="true"></div>
      <button type="button" class="gw-hbtn gw-hb-pause gw-loop-pauseglyph" data-loop="homepause">${icon('pause')}</button>
      <div class="gw-jetty-purse">${clamTag(clams)}</div>
      <div class="gw-jetty-say"><p class="gw-murk-line${line ? ' gw-in' : ''}"></p></div>
      <div class="gw-jetty-low">
        <nav class="gw-jetty-tiles"></nav>
        <p class="gw-jetty-goal"></p>
      </div>`;
    body.appendChild(wrap);
    if (line) wrap.querySelector('.gw-murk-line').textContent = line;
    if (J.press && line === J.line) {
      // the seal stays pressed beside Murk's line while it shows; it presses (and is heard) on the first drawing only
      const which = J.press, first = !J.pressed;
      J.pressed = true;
      const seal = h('div', `gw-jetty-press${first && !reducedMotion() ? ' gw-press' : ''}`, `${keySeal(which, { held: true })}${J.count ? `<small class="gw-seal-n"></small>` : ''}`);
      seal.dataset.seal = which;
      if (J.count) seal.querySelector('.gw-seal-n').textContent = J.count;
      wrap.querySelector('.gw-jetty-say')?.prepend(seal);
      if (first) setTimeout(() => { try { ctx.bus.emit('loop:seal', { seal: which }); } catch (e) { report('loop:seal', e); } K.sfx?.('seal_stamp', { volume: 0.6 }); }, reducedMotion() ? 0 : 520);
    }
    if (goal) wrap.querySelector('.gw-jetty-goal').innerHTML = goal.html; else wrap.querySelector('.gw-jetty-goal').remove();
    const nav = wrap.querySelector('.gw-jetty-tiles');
    for (const id of ['murk', 'chart', 'journal']) {
      const cue = c.tile === id, dim = c.dim && !cue;
      const b = h('button', `gw-mode gw-tile gw-tile--${id}${cue ? ' gw-cue' : ''}${dim ? ' gw-dim' : ''}`);
      b.type = 'button';
      b.dataset.tile = id;
      if (cue || (!c.tile && id === 'chart')) b.dataset.autofocus = '1';
      b.innerHTML = `<span class="gw-mode-vig gw-tile-vig">${tileArt(id)}</span><span class="gw-mode-name">${ORN.hookL}<b></b>${ORN.hookR}</span>`;
      b.querySelector('b').textContent = TL().jetty?.[id] || id;
      b.addEventListener('click', (e) => { e.stopPropagation(); K.sfx?.('ui_click'); onTile(id); });
      nav.appendChild(b);
    }
    wrap.querySelector('[data-loop=homepause]').addEventListener('click', (e) => { e.stopPropagation(); K.sfx?.('ui_click'); openHomePause(); });
    // a tap on the sheet outside a tile only ends Murk's line (the tutorial's, or a once-line)
    wrap.addEventListener('click', () => { if (tut.tap()) { refreshJetty(true); return; } if (J.line) { J.line = null; J.press = null; refreshJetty(true); } });
  }
  function refreshJetty(force = false) {
    const e = K.entry('jetty');
    if (!e) return;
    const c = tut.cue();
    const clams = num(Number(L('state')?.clams), 0);
    const goal = tut.isActive() ? null : goalLine(L('goal'), { D: D(), wick: L('wick') });
    const sig = JSON.stringify([c, clams, goal?.text, jettyLine()]);
    if (force || sig !== jettySig) e.render();
  }
  function onTile(id) {
    if (id === 'murk') { openShelf(); return; }
    if (id === 'journal') { K.screens?.openJournal?.({ from: 'jetty' }); return; }
    if (id === 'chart') { tut.onTile('chart'); openChart(); }
  }
  function jettyKeys(code) {
    const t = K.top();
    if (!t || t.id !== 'jetty') return false;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS'].includes(code)) return false;
    const btns = [...t.el.querySelectorAll('.gw-tile')];
    if (!btns.length) return false;
    const d = ['ArrowLeft', 'ArrowUp', 'KeyA', 'KeyW'].includes(code) ? -1 : 1;
    const i = btns.indexOf(document.activeElement);
    const next = i < 0 ? (d > 0 ? 0 : btns.length - 1) : (i + d + btns.length) % btns.length;
    btns[next].focus();
    K.sfx?.('ui_hover', { volume: 0.3 });
    return true;
  }
  const backToJetty = (id) => { K.closeModal(id); if (!K.has('jetty') && ctx.flow === 'home') openJetty(); else refreshJetty(true); };

  // ------------------------------------------------------------------ the home pause (the lead's ruling 12, PLAN CHOICE 45)
  function openHomePause() {
    if (K.has('homepause')) return;
    K.openModal('homepause', (entry, body) => {
      const { panel = null, btn = null } = parts();
      if (!panel || !btn) return;
      const { content, foot } = panel(entry, body, { cls: 'gw-p-pause gw-p-homepause', close: false });
      const menu = h('nav', 'gw-pause-menu');
      menu.appendChild(btn(TL().resume || 'Resume', { cls: 'gw-mbtn gw-btn--primary', icon: 'flame', autofocus: true, onClick: () => K.closeModal('homepause') }));
      menu.appendChild(btn(TL().settings?.label || 'Settings', { cls: 'gw-mbtn', icon: 'sun', onClick: () => K.screens?.openSettings?.({ pauseChild: true, homeChild: true }) }));
      content.appendChild(menu);
      foot.remove();
    }, { cls: 'gw-m-center', onEscape: () => K.closeModal('homepause'), onKey: (code) => menuArrows(code, '.gw-mbtn') });
  }
  function menuArrows(code, sel) {
    if (!['ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(code)) return false;
    const t = K.top();
    const btns = [...(t?.el.querySelectorAll(`${sel}:not([disabled])`) || [])];
    if (!btns.length) return false;
    const i = btns.indexOf(document.activeElement);
    btns[(i + (code === 'ArrowUp' || code === 'KeyW' ? -1 : 1) + btns.length) % btns.length].focus();
    return true;
  }

  // ------------------------------------------------------------------ the tally (SPEC §8.3)
  function openTally(tally) {
    if (!isObj(tally)) { openJetty(); return; }
    const plan = tallyPlan(tally, { D: D() });
    const st = { tally, plan, t: 0, done: false, ticks: new Map(), soldAt: 0 };
    K.closeModal('jetty', { silent: true, instant: true });
    const o = LOOP_MODALS.tally;
    const entry = K.openModal('tally', renderTally, { state: st, dismissable: o.dismissable, cls: 'gw-m-center gw-m-tally', onEscape: () => skipTally(), onKey: (code) => {
      if (code === 'Enter' || code === 'NumpadEnter') { if (st.done) sold(); else skipTally(); return true; }
      return false;
    } });
    entry.tick = (dt) => tickTally(entry, dt);
    // a tap anywhere (the scrim included) skips to the end; a second one presses Sold
    entry.el.addEventListener('click', (e) => { if (e.target?.closest?.('[data-action=sold]')) return; if (st.done) sold(); else skipTally(); });
  }
  function renderTally(entry, body) {
    const { panel = null, btn = null } = parts();
    if (!panel || !btn) return;
    const s = entry.state, plan = s.plan;
    const { panel: pn, content, foot } = panel(entry, body, { cls: 'gw-p-tally', close: false });
    pn.dataset.loop = 'tally';
    content.innerHTML = `<div class="gw-tally${plan.empty ? ' gw-tally--empty' : ''}">${scaleSvg()}
      ${plan.empty ? '<p class="gw-murk-line gw-in"></p>' : '<ol class="gw-tally-rows"></ol><div class="gw-tally-total"><span class="gw-tally-plus"></span></div>'}</div>`;
    if (plan.empty) content.querySelector('.gw-murk-line').textContent = plan.line || '';
    const ol = content.querySelector('.gw-tally-rows');
    plan.rows.forEach((r, i) => {
      const li = h('li', `gw-trow${r.first ? ' gw-trow--first' : ''}${r.giant || r.legend ? ' gw-trow--giant' : ''}`);
      li.dataset.i = String(i);
      if (r.uid) li.dataset.uid = r.uid;
      const art = h('canvas', 'gw-trow-fish');
      try { drawFishInk(art, spOf(D(), r.speciesId), { w: 56, h: 28, pad: 0.04, gain: 6, color: r.giant || r.legend ? '#efd9a6' : '#ece8f4' }); } catch (e) { report('tally art', e); }
      li.appendChild(art);
      li.insertAdjacentHTML('beforeend', `<span class="gw-trow-name"><b></b><small></small></span><span class="gw-trow-v">${r.first ? SEAL_GLYPH : ''}${icon('clam')}<b>0</b></span>`);
      li.querySelector('.gw-trow-name b').textContent = `${r.giant || r.legend ? '★ ' : ''}${r.name}`;
      li.querySelector('.gw-trow-name small').textContent = r.weight;
      ol.appendChild(li);
    });
    const tot = content.querySelector('.gw-tally-total');
    if (tot) tot.insertAdjacentHTML('beforeend', `${icon('clam')}`);
    const b = btn(TL().sold || 'Sold', { cls: 'gw-btn--primary gw-tally-sold', action: 'sold', autofocus: true, onClick: () => { if (!s.done) { skipTally(); return; } sold(); } });
    foot.appendChild(b);
    paintTally(entry, true);
  }
  function paintTally(entry, init = false) {
    const s = entry.state, plan = s.plan, el = entry.el;
    const t = s.done ? Infinity : s.t;
    let onPans = 0, cl = 0;
    plan.rows.forEach((r, i) => {
      const li = el.querySelector(`.gw-trow[data-i="${i}"]`);
      if (!li) return;
      const at = tallyRowAt(r, t);
      li.classList.toggle('gw-on', at.shown);
      const v = li.querySelector('.gw-trow-v b');
      const txt = fmtClams(at.value);
      if (v && v.textContent !== txt) v.textContent = txt;
      li.classList.toggle('gw-sale', r.first && at.ticked >= 2);
      if (at.shown) onPans++;
      if (at.ticked >= 1) cl++;
      const prev = s.ticks.get(i) || 0;
      if (!init && !s.done && at.ticked > prev) coin(r.first && at.ticked >= 2, { volume: 0.32, pitch: 0.95 + 0.05 * Math.min(6, i) });
      s.ticks.set(i, at.ticked);
    });
    const shown = t >= plan.totalAt;
    const tot = el.querySelector('.gw-tally-total');
    if (tot) {
      tot.classList.toggle('gw-on', shown);
      const plus = tot.querySelector('.gw-tally-plus');
      const want = `+${fmtClams(plan.total)}`;
      if (plus && plus.textContent !== want) plus.textContent = want;
    }
    // the scale: a fish glyph lands on the right pan per row, a clam on the left as it is valued; the beam dips to the fish and levels
    const fishLoad = el.querySelector('.gw-scale-pan--fish .gw-sc-load'), clamLoad = el.querySelector('.gw-scale-pan--clams .gw-sc-load');
    if (fishLoad && fishLoad.childElementCount !== onPans) {
      // (the place is the group's attribute; the glyph inside drops in by CSS, which would override a transform attribute on it)
      fishLoad.innerHTML = Array.from({ length: onPans }, (_, i) => `<g transform="translate(${214 - 17 + (i % 3) * 11} ${59 - Math.floor(i / 3) * 5}) scale(.62)"><path class="gw-sc-fish" d="M0 6c3-4 7.5-5.5 11.5-3.5L17 -1v14l-5.5-3.5C7.5 11.5 3 10 0 6z"/></g>`).join('');
    }
    if (clamLoad && clamLoad.childElementCount !== cl) {
      clamLoad.innerHTML = Array.from({ length: cl }, (_, i) => `<ellipse class="gw-sc-clam" cx="${46 - 12 + (i % 3) * 12}" cy="${62 - Math.floor(i / 3) * 4}" rx="5" ry="3.2"/>`).join('');
    }
    const tilt = Math.max(-5, Math.min(5, (onPans - cl) * 3.2));
    const beam = el.querySelector('.gw-scale-beam');
    if (beam) beam.setAttribute('transform', `rotate(${tilt.toFixed(2)} 130 20)`);
    for (const p of el.querySelectorAll('.gw-scale-pan')) {
      const x = Number(p.dataset.x) || 0, dy = Math.sin((tilt * Math.PI) / 180) * (x - 130);
      p.setAttribute('transform', `translate(0 ${dy.toFixed(2)})`);
    }
    el.querySelector('.gw-tally-sold')?.classList.toggle('gw-wait', !s.done && t < plan.end);
  }
  function tickTally(entry, dt) {
    const s = entry.state;
    if (s.done) return;
    s.t += Math.max(0, Math.min(0.25, num(dt)));
    if (s.t >= s.plan.end) s.done = true;
    paintTally(entry);
  }
  function skipTally() {
    const entry = K.entry('tally');
    if (!entry) return;
    const s = entry.state;
    if (!s.done) { s.done = true; if (s.plan.total > 0) coin(false, { volume: 0.3 }); paintTally(entry, true); }
  }
  function sold() {
    const entry = K.entry('tally');
    if (!entry) return;
    const s = entry.state;
    if (!s.done) { skipTally(); return; }
    if (s.soldAt) return;
    s.soldAt = Date.now();
    const id = s.tally?.id ?? null;
    if (id != null) L('markTallySeen', id);
    // Murk's one line after a sale (SPEC §8.6; M1 step 3a, T144): the list complete (the catch seal presses), else a legend's first
    // landing, the first giant sold, the first sale, the first Trophy or bigger; one at a time
    const { line, press } = homeLine({ rows: s.plan.rows, empty: s.plan.empty, zone: s.tally?.zone });
    K.closeModal('tally');
    if (ctx.flow === 'home') openJetty({ line, press });
  }
  /** Murk's line at home (saleLineId's order) and the catch seal's press with it: {line, press: 'catch' | null}. */
  function homeLine({ rows = [], empty = true, zone = null } = {}) {
    const said = L('state')?.said || {};
    const w = typeof zone === 'string' && zone ? zone : run()?.zone || 'mossmere';
    const lc = L('listCount', w);
    const listDone = !!lc && num(Number(lc.need), 0) > 0 && num(Number(lc.have), 0) >= num(Number(lc.need), 0);
    const id = saleLineId({ rows, said, listDone, empty });
    const line = id ? L('sayOnce', id) : null;
    return { line: line || null, press: line && id === 'listComplete' ? 'catch' : null, count: lc ? `${Math.floor(num(Number(lc.have), 0))}/${Math.floor(num(Number(lc.need), 0))}` : null };
  }

  // ------------------------------------------------------------------ the shelf (SPEC §8.4)
  /** openShelf({tab, focus}) (M1 step 3a, T138): `tab` 'tackle' | 'raft' | 'bait' | 'maps'; `focus` a place id or a card id ('rod:1'):
   *  that card scrolled into view and its button focused (a card not on the shelf: the tab opens at its head). The Chart's priced row
   *  and 3b's priced blot open it at their map's card; the sealed card's and the catalogue's gear seal at Rod T1's. */
  function openShelf(o = {}) {
    const opt = isObj(o) ? o : {};
    if (K.has('shelf')) { const e = K.entry('shelf'); if (e) { if (opt.tab) e.state.tab = opt.tab; e.state.focus = opt.focus ?? null; e.state.focused = false; e.render(); } return; }
    const st = { tab: opt.tab ?? null, line: '', focus: opt.focus ?? null, focused: false };
    K.openModal('shelf', renderShelf, { state: st, cls: 'gw-m-center gw-m-shelf', onEscape: () => backToJetty('shelf'),
      onKey: (code) => {
        if (!['BracketLeft', 'BracketRight', 'ArrowLeft', 'ArrowRight'].includes(code)) return false;
        const e = K.entry('shelf'); const ids = shelfCards(L('shelf'), { D: D() }).tabs.map((t) => t.id);
        if (!e || ids.length < 2) return false;
        const i = Math.max(0, ids.indexOf(e.state.tab));
        e.state.tab = ids[(i + (code === 'BracketLeft' || code === 'ArrowLeft' ? -1 : 1) + ids.length) % ids.length];
        e.state.focus = null;
        e.render(); return true;
      } });
  }
  function renderShelf(entry, body) {
    const { panel = null, btn = null, tabs = null } = parts();
    if (!panel || !btn) return;
    const s = entry.state;
    const clams = num(Number(L('state')?.clams), 0);
    const model = shelfCards(L('shelf'), { D: D(), clams });
    if (!model.tabs.some((t) => t.id === s.tab)) s.tab = model.tabs[0]?.id ?? null;
    const { panel: pn, content, foot } = panel(entry, body, { cls: 'gw-p-shelf' });
    pn.dataset.loop = 'shelf';
    pn.dataset.tab = s.tab || '';
    const head = h('div', 'gw-shelf-head', `<span class="gw-shelf-murk">${murkPortrait()}</span><div class="gw-shelf-purse">${clamTag(clams)}</div><p class="gw-murk-line${s.line ? ' gw-in' : ''}"></p>`);
    head.querySelector('.gw-murk-line').textContent = s.line || '';
    pn.insertBefore(head, content);
    if (tabs && model.tabs.length > 1) pn.insertBefore(tabs(model.tabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon })), s.tab, (id) => { s.tab = id; s.focus = null; entry.render(); }), content);
    const tab = model.tabs.find((t) => t.id === s.tab);
    const grid = h('div', `gw-shelf-cards gw-shelf-cards--${s.tab || 'none'}`);
    for (const c of tab?.cards || []) {
      if (c.slot === 'place') { grid.appendChild(mapCard(entry, c)); continue; }
      if (c.slot === 'lake') { grid.appendChild(sealedCard(entry, c)); continue; }
      const card = h('div', `gw-shelf-card${c.bought ? ' gw-bought' : ''}${c.dear ? ' gw-dear' : ''}${c.consumable ? ' gw-shelf-card--bait' : ''}`);
      card.dataset.item = c.id;
      card.innerHTML = `<span class="gw-shelf-art">${icon(c.art)}${c.consumable && c.count > 0 ? `<b class="gw-shelf-count">${c.count}</b>` : ''}</span><b class="gw-shelf-name"></b><span class="gw-shelf-line"></span>`;
      card.querySelector('.gw-shelf-name').textContent = c.name;
      card.querySelector('.gw-shelf-line').textContent = c.line;
      const b = btn(c.bought ? esc(c.buyWord) : clamTag(c.price), { cls: `gw-btn--sm gw-shelf-buy${c.dear ? ' gw-dear' : ''}`, hooks: !c.bought && !c.dear, disabled: c.bought || c.dear, onClick: () => buy(entry, c.id) });
      b.dataset.buy = c.id;
      card.appendChild(b);
      grid.appendChild(card);
    }
    content.appendChild(grid);
    if (s.tab === 'tackle' && typeof K.screens?.openTackle === 'function' && D().AUTOFISH) {
      const odds = h('button', 'gw-link gw-shelf-odds');
      odds.type = 'button';
      odds.textContent = TL().odds || 'Odds ›';
      odds.addEventListener('click', (e) => { e.stopPropagation(); K.sfx?.('ui_click'); K.screens.openTackle({ titleChild: true }); });
      content.appendChild(odds);
    }
    foot.remove();
    // the card asked for, in view and focused (once a render: a tab change or a buy keeps the page where it is)
    if (s.focus && !s.focused) {
      s.focused = true;
      const want = [String(s.focus), `place:${s.focus}`];
      const el = [...grid.querySelectorAll('[data-item]')].find((x) => want.includes(x.dataset.item));
      if (el) {
        el.classList.add('gw-focus');
        requestAnimationFrame(() => {
          try { el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch { /* ignore */ }
          const f = el.querySelector('.gw-shelf-buy:not([disabled]), button:not([disabled])');
          try { (f || el).focus?.({ preventScroll: true }); } catch { /* ignore */ }
        });
      }
    }
  }
  /** A map card (SPEC §8.4, M1.md §2.4): its fish drawn life-size beside the Wick (mapArtSizes), the fish's name (★ for a giant or the
   *  legend), its hour glyphs, the map's line, the price button (dimmed when too dear, "Yours." once bought on this shelf). */
  function mapCard(entry, c) {
    const { btn } = parts();
    const card = h('div', `gw-shelf-card gw-shelf-card--map gw-shelf-card--${c.kind}${c.bought ? ' gw-bought' : ''}${c.dear ? ' gw-dear' : ''}${c.star ? ' gw-gild' : ''}`);
    card.dataset.item = c.id;
    card.dataset.place = c.placeId || '';
    const sp = spOf(D(), c.fish);
    const A = mapArtSizes(D(), sp, K.vw < 700 ? { w: 132, h: 66 } : {});
    const art = h('span', 'gw-map-art');
    art.setAttribute('aria-hidden', 'true');
    const wick = h('span', 'gw-map-wick', wickPortrait(D().CHARACTER_BY_ID?.[L('wick') || 'wick']?.look || {}, { loop: true, uid: `mw${c.placeId}` }));
    wick.style.width = `${A.wick.w.toFixed(1)}px`; wick.style.height = `${A.wick.h.toFixed(1)}px`;
    const cv = h('canvas', 'gw-map-fish');
    try { drawFishInk(cv, sp, { w: Math.max(8, Math.round(A.fish.w)), h: Math.max(6, Math.round(A.fish.h)), pad: MAP_ART.pad, gain: 6.5, color: c.star ? '#f1d7a0' : '#ece8f4' }); } catch (e) { report('map art', e); }
    art.appendChild(wick); art.appendChild(cv);
    card.appendChild(art);
    const name = h('b', 'gw-shelf-name gw-map-name');
    if (c.star) name.innerHTML = '<i class="gw-map-star" aria-hidden="true">★</i>';
    name.appendChild(document.createTextNode(c.fishName || ''));
    card.appendChild(name);
    if (arr(c.hours).length) card.appendChild(h('span', 'gw-map-hours', arr(c.hours).map((g) => `<i class="gw-cat-glyph gw-cat-hr" aria-hidden="true">${icon(g)}</i>`).join('')));
    const line = h('span', 'gw-shelf-line');
    line.textContent = c.line;
    card.appendChild(line);
    const b = btn(c.bought ? esc(c.buyWord) : clamTag(c.price), { cls: `gw-btn--sm gw-shelf-buy${c.dear ? ' gw-dear' : ''}`, hooks: !c.bought && !c.dear, disabled: c.bought || c.dear, onClick: () => buy(entry, c.id) });
    b.dataset.buy = c.id;
    card.appendChild(b);
    return card;
  }
  /** The next water's sealed card (SPEC §5.5 (f), M1.md §3.4): its wax, the three seals (the gear seal opens Rod T1's card, the catch
   *  seal the catalogue's list), "Coming soon" where the price would be; no name, no line, no button. */
  function sealedCard(entry, c) {
    const card = h('div', 'gw-shelf-card gw-shelf-card--sealed');
    card.dataset.item = c.id;
    card.dataset.sealed = c.waterId || '';
    card.innerHTML = `<span class="gw-sealed-art">${sealedSheet()}</span><span class="gw-seal-row"></span><span class="gw-shelf-soon"></span>`;
    card.querySelector('.gw-shelf-soon').textContent = TL().comingSoon || 'Coming soon';
    card.querySelector('.gw-seal-row').appendChild(sealRow(c.seals, { from: 'shelf' }));
    return card;
  }
  /** The next water's three seals as buttons (the shelf's sealed card, the catalogue's head): map (no tap), gear (the shelf at its
   *  card), catch (the catalogue at its list; its count "n/12" under it). The catch seal presses once the list is complete. */
  function sealRow(seals, { from = 'shelf', zone = 'mossmere', onCatch = null } = {}) {
    const row = h('span', 'gw-seals');
    const S = isObj(seals) ? seals : {};
    for (const key of ['map', 'gear', 'catch']) {
      const sl = isObj(S[key]) ? S[key] : {};
      const b = h('button', `gw-seal-btn gw-seal-btn--${key}${sl.held ? ' gw-held' : ''}`, keySeal(key, { held: sl.held === true }));
      b.type = 'button';
      b.dataset.seal = key;
      const count = key === 'catch' && Number.isFinite(Number(sl.need)) && Number(sl.need) > 0 ? `${Math.floor(num(Number(sl.have), 0))}/${Math.floor(Number(sl.need))}` : null;
      if (count) b.insertAdjacentHTML('beforeend', `<small class="gw-seal-n">${count}</small>`);
      b.setAttribute('aria-label', count || key);
      if (key === 'map') { b.disabled = true; b.setAttribute('aria-disabled', 'true'); }
      else b.addEventListener('click', (e) => {
        e.stopPropagation(); K.sfx?.('ui_click');
        if (key === 'gear') { if (from === 'shelf') { const en = K.entry('shelf'); if (en) { en.state.tab = 'tackle'; en.state.focus = sl.item || 'rod:1'; en.state.focused = false; en.render(); return; } } openShelf({ tab: 'tackle', focus: sl.item || 'rod:1' }); }
        else if (onCatch) onCatch();
        else K.screens?.openJournal?.({ from, zone, section: 'list' });
      });
      row.appendChild(b);
    }
    return row;
  }
  function buy(entry, id) {
    const res = L('buy', id);
    if (res?.ok === true) {
      coin(true, { volume: 0.4 });
      K.sfx?.('shop_buy');
      K.hud?.dirtyStats?.();
      // the first place map (SPEC §8.6, T144): "It's in the mist. Go and look." in the shelf's head, once a save
      if (String(id).startsWith('place:')) { const line = L('sayOnce', 'firstMap'); if (line) entry.state.line = line; }
    } else K.sfx?.('denied', { volume: 0.5 });
    entry.render();
  }

  // ------------------------------------------------------------------ the Chart (SPEC §5.4; 1a's list, grown in M1 step 3a: M1.md §3.6)
  // The list draws chartModel: the water's row (its vignette, its book glyph: the catalogue), a row per owned or priced place (PLAN
  // CHOICE 19), the hold's slots; the foot holds the bait slot and Sail. Once M1 step 3b is in, its drawn Chart draws the same model and
  // this list stays the fallback (and the debug build's forced list: chartList(true)); the bait slot is this view's own piece in the
  // foot of whichever Chart is drawn (placeBaitSlot, PLAN §2.3 item 2).
  let chartListForced = false;
  function openChart() {
    if (K.has('chart')) { K.entry('chart')?.render(); return; }
    const st = { opened: performance.now(), sailing: false, inked: !tut.isActive(), pick: null };
    K.openModal('chart', renderChart, { state: st, cls: 'gw-m-center gw-m-chart', onEscape: () => { tut.onEscapeChart(); backToJetty('chart'); } });
  }
  function chartModelNow() {
    const H = L('hold');
    return chartModel(ctx.state?.meta, D(), { slots: Number.isFinite(Number(H?.slots)) ? Number(H.slots) : undefined, tutorial: tut.isActive() });
  }
  function renderChart(entry, body) {
    const { panel = null, btn = null } = parts();
    if (!panel || !btn) return;
    const model = chartModelNow();
    // (M1 step 3b's drawn branch sits here, read only while !chartListForced; then placeBaitSlot(body, model, entry) after it)
    renderChartList(entry, body, model);
  }
  /** The chosen water and place on this open (M1.md §3.4): the model's (the saved pick, or open water) until a row is tapped. */
  function chartPickOf(entry, model) {
    const s = entry.state;
    const ok = (p) => isObj(p) && model.sheets.some((sh) => sh.waterId === p.water && (!p.place || sh.places.some((q) => q.id === p.place && q.owned)));
    if (!ok(s.pick)) s.pick = { ...model.pick };
    return s.pick;
  }
  function choosePick(entry, pick) {
    const s = entry.state;
    if (s.sailing) return;
    s.pick = { water: pick.water, place: pick.place ?? null };
    L('setPick', { ...s.pick });
    try { ctx.bus.emit('chart:pick', { water: s.pick.water, place: s.pick.place }); } catch (e) { report('chart:pick', e); }
    K.sfx?.('ui_click');
    entry.render();
  }
  /** The list Chart (M1.md §3.6): renderChartList(entry, body, model). In the tutorial exactly 1a's list (T65, T67). */
  function renderChartList(entry, body, model) {
    const { panel = null, btn = null } = parts();
    if (!panel || !btn) return;
    const s = entry.state;
    const c = tut.cue();
    const tutorial = model.tutorial === true;
    const pick = chartPickOf(entry, model);
    const { panel: pn, content, foot } = panel(entry, body, { cls: `gw-p-chart${reducedMotion() ? ' gw-rm' : ''}${tutorial ? '' : ' gw-p-chart--3a'}` });
    pn.dataset.loop = 'chart';
    const line = c.line;
    content.innerHTML = `${line ? '<p class="gw-murk-line gw-in"></p>' : ''}<div class="gw-chart"></div>`;
    if (line) content.querySelector('.gw-murk-line').textContent = line;
    const list = content.querySelector('.gw-chart');
    const rows = chartRows(model, D());
    for (const sh of model.sheets) {
      const chosen = pick.water === sh.waterId && !pick.place;
      const row = h('div', `gw-chart-row${chosen ? ' gw-on' : ''}`);
      row.dataset.water = sh.waterId;
      const marks = tutorial ? [] : sh.places;
      row.innerHTML = `<span class="gw-chart-map">${chartVignette(D(), sh.waterId, { uid: `cv${sh.waterId}`, places: marks, pick })}</span><span class="gw-chart-name">${ORN.hookL}<b></b>${ORN.hookR}</span>`;
      row.querySelector('b').textContent = sh.name;
      if (!tutorial) {
        row.classList.add('gw-chart-row--pick');
        row.setAttribute('role', 'button'); row.tabIndex = 0;
        row.setAttribute('aria-pressed', String(chosen));
        row.setAttribute('aria-label', sh.name);
        const choose = (e) => { e.stopPropagation(); choosePick(entry, { water: sh.waterId, place: null }); };
        row.addEventListener('click', choose);
        row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(e); } });
        // the catalogue's book glyph (SPEC §8.8: no word; the Journal at this water's page, Back returns here)
        const book = h('button', 'gw-chart-book', icon('book'));
        book.type = 'button';
        book.dataset.action = 'catalogue';
        book.dataset.book = sh.waterId;
        book.setAttribute('aria-label', TL().jetty?.journal || 'Journal');
        book.addEventListener('click', (e) => { e.stopPropagation(); K.sfx?.('ui_click'); K.screens?.openJournal?.({ from: 'chart', zone: sh.waterId }); });
        row.appendChild(book);
      }
      list.appendChild(row);
      const mine = rows.filter((r) => r.water === sh.waterId);
      if (mine.length) {
        const ul = h('div', 'gw-chart-places');
        for (const r of mine) ul.appendChild(placeRow(entry, r, pick));
        list.appendChild(ul);
      }
    }
    const slots = h('div', 'gw-hold gw-chart-hold');
    const ink = !s.inked && !reducedMotion();
    const step = num(D().LOOP?.tutorial?.slotInk, 0.25);
    for (let i = 0; i < Math.max(0, model.hold.slots); i++) {
      const cell = h('span', `gw-slot${ink ? ' gw-ink' : ''}`);
      cell.dataset.filled = '0';
      if (ink) cell.style.animationDelay = `${(0.35 + i * step).toFixed(2)}s`;
      slots.appendChild(cell);
    }
    s.inked = true;
    list.appendChild(slots);
    foot.appendChild(sailButton(entry, c, () => chartPickOf(entry, chartModelNow())));
    placeBaitSlot(pn, model, entry);
  }
  /** A place's row on the list (M1.md §3.6): an owned place (its kind glyph, its name, its giant's ★ once landed, its best fish there
   *  in pounds) is chosen with a tap; a priced one (its kind glyph and its price, no name) opens Murk's map card. */
  function placeRow(entry, r, pick) {
    const chosen = r.owned && pick.water === r.water && pick.place === r.id;
    const b = h('button', `gw-chart-place gw-chart-place--${r.kind}${r.owned ? ' gw-owned' : ' gw-priced'}${chosen ? ' gw-on' : ''}${r.giantLanded ? ' gw-gild' : ''}`);
    b.type = 'button';
    b.dataset.place = r.id;
    b.dataset.water = r.water;
    if (!r.owned) b.dataset.buy = '1';
    const glyph = `<span class="gw-chart-kind" aria-hidden="true">${icon(`kind_${r.kind}`)}</span>`;
    if (r.owned) {
      b.setAttribute('aria-pressed', String(chosen));
      b.innerHTML = `${glyph}<span class="gw-chart-pname"><b></b></span>${r.giantLanded ? '<i class="gw-chart-star" aria-hidden="true">★</i>' : ''}<span class="gw-chart-best"></span>`;
      b.querySelector('b').textContent = r.name || r.id;
      b.setAttribute('aria-label', r.name || r.id);
      const best = b.querySelector('.gw-chart-best');
      if (r.best) {
        const sp = spOf(D(), r.best.speciesId);
        const cv = h('canvas', 'gw-chart-bestfish');
        try { drawFishInk(cv, sp, { w: 46, h: 24, pad: 0.04, gain: 7, color: '#ece8f4' }); } catch (e) { report('best art', e); }
        best.appendChild(cv);
        const w = h('small', 'gw-chart-bestw');
        w.textContent = typeof D().fmtWeight === 'function' ? D().fmtWeight(r.best.weight) : '';
        best.appendChild(w);
      } else best.remove();
      b.addEventListener('click', (e) => { e.stopPropagation(); choosePick(entry, { water: r.water, place: r.id }); });
    } else {
      b.innerHTML = `${glyph}${clamTag(r.price, { cls: 'gw-chart-price' })}`;
      b.setAttribute('aria-label', String(r.price));
      b.addEventListener('click', (e) => { e.stopPropagation(); K.sfx?.('ui_click'); openShelf({ tab: 'maps', focus: r.id }); });
    }
    return b;
  }
  /** Sail (SPEC §5.4: one action): live from the first frame; it starts the trip at the chosen water and place (B's
   *  game.sail({water, place}): the glide out heads for an owned place, PLAN CHOICE 7). */
  function sailButton(entry, c, pick) {
    const { btn } = parts();
    const s = entry.state;
    const b = btn(TL().sail || 'Sail', { cls: `gw-btn--primary gw-chart-sail${c.sail ? ' gw-cue' : ''}`, action: 'sail', icon: 'flame', autofocus: true, disabled: s.sailing, onClick: () => {
      if (s.sailing) return;
      s.sailing = true;
      b.disabled = true;
      tut.onSail();
      const p = pick() || {};
      const ok = G('sail', { water: p.water || 'mossmere', place: p.place ?? null });
      if (ok === false || ok === null) { s.sailing = false; b.disabled = false; }
    } });
    return b;
  }
  /** The bait slot (M1.md §3.3, §3.6; PLAN §2.3 item 2): its own piece, [data-slot=bait], the water's legend bait and its count; a tap
   *  fits it (loop.fit('bait', id)) or takes it off; empty with none in the bag. None in the tutorial. → the element, or null. */
  function baitSlot(model, { onFit = null } = {}) {
    const bm = baitSlotModel(model, L('state'), D());
    if (!bm) return null;
    const empty = !bm.fitted && bm.count <= 0;
    const b = h('button', `gw-bait-slot${bm.fitted ? ' gw-fitted' : ''}${empty ? ' gw-empty' : ''}`);
    b.type = 'button';
    b.dataset.slot = 'bait';
    b.dataset.bait = bm.id;
    b.setAttribute('aria-label', bm.name);
    b.setAttribute('aria-pressed', String(bm.fitted));
    if (empty) b.setAttribute('aria-disabled', 'true');
    b.innerHTML = `<span class="gw-bait-cradle" aria-hidden="true"></span><span class="gw-bait-ball" aria-hidden="true">${icon('mossball')}</span>${empty ? '' : `<b class="gw-bait-n">${bm.count}</b>`}`;
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      if (empty) { K.sfx?.('denied', { volume: 0.4 }); return; }
      const res = L('fit', 'bait', bm.fitted ? null : bm.id);
      if (res?.ok === true) { K.sfx?.('ui_click', { volume: 0.5 }); onFit?.(res); }
      else K.sfx?.('denied', { volume: 0.4 });
    });
    return b;
  }
  /** Put the bait slot in the foot of the drawn panel, before Sail (the list's foot on M; 3b's drawn foot once it is in). */
  function placeBaitSlot(root, model, entry) {
    const sail = root?.querySelector?.('[data-action=sail]');
    if (!sail || root.querySelector('[data-slot=bait]')) return null;
    const el = baitSlot(model, { onFit: () => entry?.render?.() });
    if (el) sail.parentNode.insertBefore(el, sail);
    return el;
  }

  // ------------------------------------------------------------------ events
  const on = (evt, fn) => { try { ctx.bus.on(evt, (p) => { try { fn(p || {}); } catch (e) { report(`on(${evt})`, e); } }); } catch (e) { report('bus', e); } };
  on('home:enter', (p) => {
    tut.start({ from: p.from ?? null });
    const unseen = isObj(p.tally) && p.tally.seen !== true ? p.tally : (() => { const lt = L('lastTrip'); return isObj(lt) && lt.seen !== true ? lt : null; })();
    if (unseen) openTally(unseen);
    else if (tut.isActive()) openJetty();
    else { const hl = homeLine({ rows: [], empty: true }); openJetty({ line: hl.line, press: hl.press }); }
  });
  on('run:start', (p) => {
    holdSig = ''; paintHold(true);
    quietSaid = false;
    TIP.since = 0; TIP.firstBite = false; dropTip('castEl'); dropTip('strikeEl');
    if (!p.continued && onTrip() && num(run()?.evening, 1) >= 2) {
      const line = L('sayOnce', 'sailOut');
      if (line) {
        // (after any lift: Murk's line never speaks over a place's title card)
        const say = (n = 0) => { if (ctx.flow !== 'playing' || !onTrip()) return; if (G('lifting') && n < 40) { setTimeout(() => say(n + 1), 500); return; } murkToast(line); };
        setTimeout(() => say(), 2200);
      }
    }
  });
  on('fish:action', (p) => {
    paintHold(true);
    if (onTrip() && p.letgo === true) { const line = L('sayOnce', 'firstLetGo'); if (line) murkToast(line); }
  });
  on('loop:holdFull', (p) => {
    if (p.via !== 'cast') return;
    K.toast(TL().holdFull || "Hold's full.", 'bad', { icon: 'creel', dur: 2200, cls: 'gw-toast--loop' });
    K.sfx?.('denied', { volume: 0.5 });
    pill.classList.remove('gw-pulse'); void pill.offsetWidth; pill.classList.add('gw-pulse');
    holdRow.classList.remove('gw-shake'); void holdRow.offsetWidth; holdRow.classList.add('gw-shake');
  });
  // M1 step 3a (T142): the lift's title card: the place's name in ink for LOOP.lift.title s, in the HUD layer (never in world space)
  on('place:lift', (p) => {
    const tc = liftTitle(p, D());
    if (p.phase === 'title' && tc.show) showLiftTitle(tc);
    else if (p.phase === 'end' || p.phase === 'start') dropLiftTitle();
  });
  on('fishing:cast', () => dropTip('castEl'));
  on('fishing:bite', () => {
    if (!onTrip() || TIP.firstBite) return;
    TIP.firstBite = true;
    if (num(run()?.evening, 0) !== 1 || seenTip('fe_strike')) return;
    const text = strikeTipText(D(), K.isTouch);
    if (!text) return;
    markTip('fe_strike');
    TIP.strikeEl = tipEl(text, { low: true });
  });
  on('fishing:strike', () => dropTip('strikeEl'));
  on('fishing:miss', () => dropTip('strikeEl'));
  on('fishing:escaped', () => dropTip('strikeEl'));
  on('fish:landed', () => dropTip('strikeEl'));
  on('flow:change', ({ flow }) => {
    if (flow !== 'playing') { pressEnd('pointer', { cancel: true }); pressEnd('key', { cancel: true }); dropTip('castEl'); dropTip('strikeEl'); }
  });
  on('ui:modal', (p) => {
    if (p.id === 'journal' && p.open === false && ctx.flow === 'home') refreshJetty(true);
    // M1 step 3a: a map bought from the Chart's card shows on the Chart as the shelf closes (its row owned, the next card priced)
    if ((p.id === 'shelf' || p.id === 'journal') && p.open === false && K.has('chart')) K.entry('chart')?.render();
  });

  // ------------------------------------------------------------------ per frame
  function update(dt) {
    const d = Math.max(0, Math.min(0.25, num(dt)));
    if (LT.el) { LT.t += d; if (LT.t >= LT.dur) dropLiftTitle(); }
    // the tutorial's clock (real time; it runs only under the Jetty or the Chart)
    const topId = K.top()?.id ?? null;
    if (ctx.flow === 'home') {
      tut.update(d, { top: topId });
      if (tut.wantsChart && topId === 'jetty') { tut.onTile('chart'); openChart(); }
      if (J.line && topId === 'jetty') { J.lineT += d; if (J.lineT > J.lineHold) { J.line = null; J.press = null; } }
      if (topId === 'jetty') refreshJetty();
    }
    if (!onTrip() || ctx.flow !== 'playing') return;
    paintHold();
    // the Home pill: hidden (no pointer) while home is not allowed; it pulses on a full hold; the press-and-hold ring
    const can = G('canGoHome', { fromPause: false });
    const ok = can?.ok === true;
    pill.classList.toggle('gw-on', ok);
    const full = holdFull();
    pill.classList.toggle('gw-full', full);
    // the refused cast's pulse (its glow is infinite) and the row's shake belong to that full hold: gone once it is not full
    // (a new trip, a fish let go), so they never replay when the HUD shows again
    if (!full) { pill.classList.remove('gw-pulse'); holdRow.classList.remove('gw-shake'); }
    if (!ok && P.press) pressEnd(P.press.src, { cancel: true });
    if (P.press) {
      P.press.t += d;
      const ph = pillHold(P.press.t, false);
      if (Math.abs(ph.k - P.k) > 0.004) { P.k = ph.k; pill.style.setProperty('--k', ph.k.toFixed(3)); }
      if (ph.fire && !P.fired) { const src = P.press.src; fireHome(src); pressEnd(src, { cancel: true }); }
    }
    // the first trip's two words
    const fs = ctx.fishing && !ctx.fishing.isStub ? ctx.fishing.state : 'idle';
    TIP.since += d;
    // (M1 step 3a: a place's lift holds the evening still: the tip's clock waits for it, as it waits for the glide)
    if (G('lifting')) TIP.since = 0;
    if (castTipDue({ evening: num(run()?.evening, 0), seen: seenTip('fe_cast'), state: fs, since: TIP.since, after: num(D().LOOP?.tutorial?.castTipAfter, 1.5), shown: !!TIP.castEl })
      && !K.hasBlocking()) {
      const text = D().FIRST_EVENING?.tips?.fe_cast;
      if (text) { markTip('fe_cast'); TIP.castEl = tipEl(text); }
    }
    // Murk's first quiet water (once a save; never during a bite)
    if (!quietSaid) {
      const F = ctx.fishing?.view?.favour;
      if (typeof F?.bitesLeft === 'number' && F.bitesLeft <= 0 && (fs === 'waiting' || fs === 'idle')) {
        quietSaid = true;
        const line = L('sayOnce', 'firstQuiet');
        if (line) murkToast(line);
      }
    }
  }

  /** ui's handleKey on a trip (T58): the parked keys are swallowed; H is the Home pill's press and hold (PLAN CHOICE 9). */
  function handleKey(code) {
    if (!onTrip() || ctx.flow !== 'playing') return false;
    if (tripKeySwallow(code)) return true;
    if (code === 'KeyH') { if (!P.press) { pressStart('key'); if (P.press && holdFull()) { fireHome('key'); pressEnd('key', { cancel: true }); } } return true; }
    return false;
  }

  return {
    update, handleKey, openJetty, openTally, openShelf, openChart, openHomePause, paintHold,
    /** M1 step 3a: the list Chart, the bait slot (its own piece, for either Chart's foot), the next water's seals as buttons */
    renderChartList, baitSlot, placeBaitSlot, sealRow,
    /** debug builds (ctx.debug.ui.chartList): draw the list even when 3b's drawn Chart is ready (T134, T149's list runs) */
    chartList: (on) => { if (on !== undefined) { chartListForced = on === true; if (K.has('chart')) K.entry('chart')?.render(); } return chartListForced; },
    /** the tutorial's machine (its state, step and cue(): PLAN §3.6) */
    tutorial: tut,
    pill, holdRow,
    debug: () => ({
      tutorial: { step: tut.step, active: tut.isActive(), cue: tut.cue() },
      hold: [...holdRow.querySelectorAll('.gw-slot')].map((c) => c.dataset.filled),
      pill: { on: pill.classList.contains('gw-on'), pulse: pill.classList.contains('gw-pulse'), k: P.k, held: !!P.press },
      tips: { cast: !!TIP.castEl, strike: !!TIP.strikeEl },
      liftTitle: LT.el ? { name: LT.el.querySelector('b')?.textContent ?? null, t: LT.t, dur: LT.dur } : null,
      chartList: chartListForced,
    }),
  };
}
