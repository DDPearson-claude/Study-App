// home-shelf.js — M1 step 5b (lane 5b-home): the home barge's own shelf items and the Mossmere complete, as pure functions
// (docs/loop/M1.md §2.5, §2.6, §4 step 5b; SPEC §4.7, §6.3, §8.4, §8.6). No data import: `D` (the data module) is passed in, as in
// progression-loop.js, so the node tests can evaluate `data.js?loop` as a module instance of its own. Read only under the loop.
//
//   homeItems(D, metaLoop, session)     the Home tab's step-5 cards (the Bait Bed, the Long Wall's wing, Barge lights, the three
//                                       looks), shelfItems' shape: {id, tab: 'home', slot, level, name, goalName, line, price, bought}
//   applyHome(D, metaLoop, item)        what a bought step-5 card does to meta.loop (in place); true when it was one of these
//   baitBedFloor(D, metaLoop, water)    the free plain bait the Bait Bed sets you out with ({baitId, n} or null)
//   applyBaitBed(D, metaLoop, run)      tops a new trip's bag up to the floor (never piles up); → the count added
//   shelfBare(items)                    every permanent card of the shelf bought (M1's 32): the empty shelf
//   waterGilded(meta, D, water, items)  the water complete (M1.md §2.5): its shelf bare, its list full and its giants and legend landed
// The Order Board (Home, step 4) is lane 4's (src/loop-gear.js); this module never offers it.

const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const int = (v, d = 0) => Math.trunc(num(v, d));
const arr = (v) => (Array.isArray(v) ? v : []);
const ROMAN = ['I', 'II', 'III', 'IV'];

/** The water orders the save owns (catalogue order of its lakes, plus 1, the start): a level whose `with` is in it is on the shelf. */
function ownedOrders(D, ml) {
  const out = new Set([1]);
  for (const id of arr(ml?.maps?.lakes)) { const o = num(D?.LOOP?.waters?.[id]?.order, NaN); if (Number.isFinite(o)) out.add(o); }
  return out;
}
/** A home item's name (TEXT_LOOP.homeNames), else a plain fallback. */
export function homeName(D, slot, lv) {
  const n = D?.TEXT_LOOP?.homeNames?.[slot]?.[lv - 1];
  return typeof n === 'string' ? n : `${slot} ${ROMAN[lv - 1] ?? lv}`;
}
/** A look's name (TEXT_LOOP.lookNames, else COSMETICS_V3's). */
export function lookName(D, id) {
  return D?.TEXT_LOOP?.lookNames?.[id] ?? arr(D?.COSMETICS_V3).find((c) => c?.id === id)?.name ?? String(id ?? '');
}
/** The home ladders this module sells, in the Home tab's order (after lane 4's Order Board). */
export const HOME_SLOTS = Object.freeze(['baitBed', 'wall', 'lights']);

/**
 * The Home tab's step-5 cards (SPEC §8.4, M1.md §2.5), in shelfItems' shape. Each ladder (the Bait Bed, the Long Wall, Barge lights)
 * shows its next level whose `with` water is owned, else its last level owned as a bought card; a level bought while the shelf is open
 * (`session`) reads bought in place. Each look of LOOP.looks whose `with` is owned: {id: 'look:<id>', slot: 'look', lookId}, bought once
 * and kept. Lines: the Bait Bed's and the wall's (SPEC §8.4); lights and looks none. Nothing from a later water's era (decision 38).
 */
export function homeItems(D, metaLoop, session = []) {
  const LP = D?.LOOP; if (!LP?.home) return [];
  const ml = isObj(metaLoop) ? metaLoop : {}, TL = D.TEXT_LOOP || {}, ses = new Set(arr(session)), withs = ownedOrders(D, ml), out = [];
  for (const slot of HOME_SLOTS) {
    const R = LP.home[slot];
    if (!isObj(R)) continue;
    const prices = arr(R.prices), w = arr(R.with), top = prices.length, cur = Math.max(0, int(ml.home?.[slot]));
    const on = (lv) => lv >= 1 && lv <= top && withs.has(num(w[lv - 1], 1));
    const card = (lv, bought) => ({ id: `${slot}:${lv}`, tab: 'home', slot, level: lv, name: homeName(D, slot, lv), goalName: homeName(D, slot, lv),
      line: TL.shelf?.[slot] ?? '', price: num(prices[lv - 1], 0), bought });
    if (cur >= 1 && ses.has(`${slot}:${cur}`)) out.push(card(cur, true));
    else if (on(cur + 1)) out.push(card(cur + 1, false));
    else if (cur >= 1) out.push(card(cur, true));
  }
  const have = new Set(arr(ml.looks));
  for (const [id, K] of Object.entries(isObj(LP.looks) ? LP.looks : {})) {
    if (!isObj(K) || !withs.has(num(K.with, 1))) continue;
    out.push({ id: `look:${id}`, tab: 'home', slot: 'look', level: null, lookId: id, on: K.on ?? null, name: lookName(D, id), goalName: lookName(D, id),
      line: '', price: num(K.price, 0), bought: have.has(id) });
  }
  return out;
}

/** A bought step-5 card on meta.loop (in place): a home ladder takes its level (never lower); a look joins `looks` once. */
export function applyHome(D, L, it) {
  if (!isObj(L) || !isObj(it)) return false;
  if (HOME_SLOTS.includes(it.slot) && it.tab === 'home') {
    if (!isObj(L.home)) L.home = {};
    L.home[it.slot] = Math.max(int(L.home[it.slot]), int(it.level));
    return true;
  }
  if (it.slot === 'look' && typeof it.lookId === 'string') {
    if (!Array.isArray(L.looks)) L.looks = [];
    if (!L.looks.includes(it.lookId)) L.looks.push(it.lookId);
    return true;
  }
  return false;
}

/** The Bait Bed's floor at a water (SPEC §6.3): {baitId (its plain bait: the water's first tin, LOOP.tins), n (3 / 6 / 10)} or null. */
export function baitBedFloor(D, metaLoop, water) {
  const lv = Math.max(0, int(metaLoop?.home?.baitBed));
  if (!lv) return null;
  const floor = arr(D?.LOOP?.home?.baitBed?.floor), n = int(floor[Math.min(lv, floor.length) - 1]);
  const baitId = D?.LOOP?.waters?.[water]?.plainBait ?? arr(D?.LOOP?.tins?.[water])[0] ?? null;
  return baitId && n > 0 ? { baitId, n } : null;
}
/** A new trip's bag topped up to the Bait Bed's floor (it tops you up; it does not pile up). → the count added. */
export function applyBaitBed(D, metaLoop, run) {
  if (!isObj(run)) return 0;
  const f = baitBedFloor(D, metaLoop, run.zone);
  if (!f) return 0;
  if (!isObj(run.bait)) run.bait = {};
  const have = Math.max(0, int(run.bait[f.baitId])), add = Math.max(0, f.n - have);
  if (add > 0) run.bait[f.baitId] = have + add;
  return add;
}

/** The empty shelf (M1.md §2.5): every permanent card bought (the consumables and the next water's lake card never count: sealed past
 *  LOOP.shipped, priced once it ships, when it is the empty shelf's goal line, the Lake 2 gate). */
export function shelfBare(items) {
  const perm = arr(items).filter((it) => isObj(it) && it.consumable !== true && it.sealed !== true && it.slot !== 'lake' && it.price != null);
  return perm.length > 0 && perm.every((it) => it.bought === true);
}
/** A water's giants and its legend (D.SPECIES: `giant`, or legendary), as ids. */
export function giantsOf(D, water) {
  return arr(D?.SPECIES).filter((s) => isObj(s) && s.zone === water && !s.cove && (s.giant === true || s.rarity === 'legendary')).map((s) => s.id);
}
/**
 * The water complete (M1.md §2.5): the shelf bare (`items`, the whole shelf as shelfItems gives it), its list full (listCount's have ≥
 * need > 0; `listCount` passed in) and every giant and its legend landed (journal caught > 0). Then its sheet on the Chart is gilded.
 */
export function waterGilded(meta, D, water, { items = [], listCount = null } = {}) {
  const J = isObj(meta?.journal) ? meta.journal : {};
  if (!shelfBare(items)) return false;
  const lc = typeof listCount === 'function' ? listCount(meta, D, water) : null;
  if (!lc || !(num(lc.need) > 0) || num(lc.have) < num(lc.need)) return false;
  const g = giantsOf(D, water);
  return g.length > 0 && g.every((id) => num(J[id]?.caught) > 0);
}
