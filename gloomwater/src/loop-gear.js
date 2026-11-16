// loop-gear.js — M1 step 4 (lane 4): the Full Hold's tins and lures, the raft's parts and Murk's orders, as pure functions (docs/loop/
// M1.md §4 step 4, SPEC §3.2, §4.4, §4.5, §4.7, §6.3, §7, §8.4). No data import: `D` (the data module) is passed in, as in
// progression-loop.js, so the node tests can evaluate `data.js?loop` as a module instance of its own. Read only under the loop.
//
//   gearItems(D, metaLoop, session)            the shelf's step-4 cards (lures, tins, raft parts, the Order Board), shelfItems' shape
//   applyGear(D, metaLoop, item)               what a bought step-4 card does to meta.loop (in place)
//   tinPrice(D, water) · lureOf(D, id) · tinWater(D, id) · gearName(D, id)
//   lurePool(D, pool, {lure, phase, wickId})   data.placePool's result with the fitted lure's draw (a family lure ×attract on its
//                                              family; a giants' lure ×1.5 on the fish it names and on its giants' share), the sim's rule
//   raftTerms(D, metaLoop, phase)              the Keel's and the Lantern's favour terms on a trip ({family, id, value})
//   raftStats(D, metaLoop)                     {speed: m/s added, light: the light's radius ×}
//   orders: orderPool · newOrder · refillOrders · orderMatches · assignOrders · orderPhrase · orderPhraseOk · orderCount
import { uid } from './core.js';
import { findOrderBonus } from './loop-finds.js';   // M1 step 5c: the Rust Buoy-Bell's one more order (the integration's seam)

const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const int = (v, d = 0) => Math.trunc(num(v, d));
const arr = (v) => (Array.isArray(v) ? v : []);

/** The water order (catalogue order) of the lakes this save owns, plus 1 (the start): a level whose `with` is in it is on the shelf. */
function ownedOrders(D, ml) {
  const out = new Set([1]);
  for (const id of arr(ml?.maps?.lakes)) { const o = num(D?.LOOP?.waters?.[id]?.order, NaN); if (Number.isFinite(o)) out.add(o); }
  return out;
}
const shippedWater = (D, w) => {
  const W = D?.LOOP?.waters || {}, o = num(W[w]?.order, NaN), last = num(W[D?.LOOP?.shipped]?.order, NaN);
  return Number.isFinite(o) && (!Number.isFinite(last) || o <= last);
};
const ownedWaters = (D, ml) => arr(ml?.maps?.lakes).filter((w) => typeof w === 'string' && isObj(D?.LOOP?.waters?.[w]) && shippedWater(D, w));

/** A tin's price in a water (SPEC §4.5): max(5, round(grade × the water's value tier / 5) × 5); the Mossmere's is 10. */
export function tinPrice(D, water) {
  const R = D?.LOOP?.baitRule || { grade: 1.5 }, tier = num(D?.LOOP?.waters?.[water]?.tier, 7);
  return Math.max(5, Math.round((num(R.grade, 1.5) * tier) / 5) * 5);
}
/** The LOOP.lures row of a lure id with its built LURES record's draw (`attract`), or null. */
export function lureOf(D, id) {
  const L = D?.LOOP?.lures?.[id];
  if (!isObj(L)) return null;
  const built = arr(D?.LURES).find((x) => x?.id === id) || {};
  return { id, ...L, attract: num(built.attract, 1), favour: num(built.favour, 0) };
}
/** The water whose tin a bait id is (LOOP.tins), or null. Cut Strip is no water's tin (it is free, cut from a fish). */
export function tinWater(D, id) {
  for (const [w, ids] of Object.entries(isObj(D?.LOOP?.tins) ? D.LOOP.tins : {})) if (arr(ids).includes(id)) return w;
  return null;
}
/** An item's name as the shelf and the slots show it (TEXT_LOOP.gearItems, else the built record's). */
export function gearName(D, id) {
  return D?.TEXT_LOOP?.gearItems?.[id] ?? arr(D?.LURES).find((x) => x?.id === id)?.name ?? arr(D?.BAITS).find((x) => x?.id === id)?.name ?? String(id ?? '');
}
const ROMAN = ['I', 'II', 'III', 'IV'];
/** The shelf cards' drawings (ui-icons' names). */
const ART = { feather_fly: 'feather', glimmer_spoon: 'spoon', bone_jig: 'bone', bell_spinner: 'bell', mireworm: 'worm', lumen_moss: 'moss',
  oars: 'oar', keel: 'hull', lantern: 'lantern', orders: 'ledger' };
function levelName(D, slot, lv) {
  const n = D?.TEXT_LOOP?.gearNames?.[slot]?.[lv - 1];
  if (typeof n === 'string') return n;
  return `${slot} ${ROMAN[lv - 1] ?? lv}`;
}

/**
 * The shelf's step-4 cards (SPEC §8.4, M1.md §2.5), in shelfItems' shape: {id, tab, slot, level, name, goalName, line, price, bought, …}.
 * - Tackle: each lure of an owned, shipped water ({id: 'lure:<id>', slot: 'lure', lureId}); bought once and kept ("Yours." for good).
 * - Bait: each tin of an owned water ({id: 'tin:<id>', slot: 'tin', baitId, water, count, consumable: true}: always on the shelf, never
 *   "Yours.", never the goal). Cut Strip is never on the shelf (never sold: the bait slot shows its count).
 * - Raft: Oars, Keel and Lantern, the next level whose `with` water is owned ({id: 'oars:1', slot: 'oars', level}); the last level this
 *   shelf offers, once owned, a bought card; a level bought while the shelf is open (`session`) reads bought in place.
 * - Home: Murk's Order Board the same way ({id: 'orders:1', slot: 'orders', level}).
 * Nothing from a later water's era is offered (decision 38): Keel III with the Pallid Deep's map, Order Board III with Glasswater's.
 */
export function gearItems(D, metaLoop, session = []) {
  const LP = D?.LOOP; if (!LP?.lures) return [];
  const ml = isObj(metaLoop) ? metaLoop : {}, TL = D.TEXT_LOOP || {}, ses = new Set(arr(session)), out = [];
  const waters = ownedWaters(D, ml), have = new Set(arr(ml.lures)), withs = ownedOrders(D, ml);
  // the lures (Tackle)
  for (const [id, L] of Object.entries(LP.lures)) {
    if (!isObj(L) || !waters.includes(L.water)) continue;
    out.push({ id: `lure:${id}`, tab: 'tackle', slot: 'lure', level: null, lureId: id, water: L.water, art: ART[id] || 'lure', name: gearName(D, id), goalName: gearName(D, id),
      line: TL.shelf?.[id] ?? '', price: num(L.price, 0), bought: have.has(id) });
  }
  // the tins (Bait), each water's in its order; Cut Strip's count while the bag holds some
  for (const w of waters) {
    for (const id of arr(LP.tins?.[w])) {
      out.push({ id: `tin:${id}`, tab: 'bait', slot: 'tin', level: null, baitId: id, water: w, art: ART[id] || 'worm', name: gearName(D, id), goalName: gearName(D, id),
        line: TL.shelf?.[id] ?? '', price: tinPrice(D, w), count: Math.max(0, int(ml.bait?.[w]?.[id])), consumable: true, bought: false });
    }
  }
  // the raft's parts (Raft) and Murk's Order Board (Home): the next level on the shelf, else the last one owned
  const ladder = (tab, slot, R, cur) => {
    const prices = arr(R?.prices), w = arr(R?.with), top = prices.length;
    const on = (lv) => lv >= 1 && lv <= top && withs.has(num(w[lv - 1], 1));
    const card = (lv, bought) => ({ id: `${slot}:${lv}`, tab, slot, level: lv, art: ART[slot] || 'star', name: levelName(D, slot, lv), goalName: levelName(D, slot, lv),
      line: TL.shelf?.[slot] ?? '', price: num(prices[lv - 1], 0), bought });
    if (cur >= 1 && ses.has(`${slot}:${cur}`)) out.push(card(cur, true));
    else if (on(cur + 1)) out.push(card(cur + 1, false));
    else if (cur >= 1) out.push(card(cur, true));
  };
  for (const slot of ['oars', 'keel', 'lantern']) ladder('raft', slot, LP.raft?.[slot], Math.max(0, int(ml.raft?.[slot])));
  ladder('home', 'orders', LP.home?.orders, Math.max(0, int(ml.home?.orders)));
  return out;
}

/** A bought step-4 card on meta.loop (in place): a lure joins `lures`; a tin adds LOOP.baitRule.tin to its water's bag; a raft part or
 *  the Order Board takes its level. → true when the card was one of these. */
export function applyGear(D, L, it) {
  if (!isObj(L) || !isObj(it)) return false;
  if (it.slot === 'lure') { if (!Array.isArray(L.lures)) L.lures = []; if (!L.lures.includes(it.lureId)) L.lures.push(it.lureId); return true; }
  if (it.slot === 'tin') {
    if (!isObj(L.bait)) L.bait = {};
    const bag = isObj(L.bait[it.water]) ? L.bait[it.water] : (L.bait[it.water] = {});
    bag[it.baitId] = Math.max(0, int(bag[it.baitId])) + Math.max(1, int(D?.LOOP?.baitRule?.tin, 10));
    return true;
  }
  if (['oars', 'keel', 'lantern'].includes(it.slot)) { if (!isObj(L.raft)) L.raft = {}; L.raft[it.slot] = Math.max(int(L.raft[it.slot]), int(it.level)); return true; }
  if (it.slot === 'orders') { if (!isObj(L.home)) L.home = {}; L.home.orders = Math.max(int(L.home.orders), int(it.level)); return true; }
  return false;
}

/**
 * The fitted lure's draw on a cast's pool (the sim's poolFor: lureMatch and lureAttract), on data.placePool's result {list, giant, tot,
 * place}: a family lure multiplies the weight of its family's fish by its built `attract` (never a giant: a family lure draws none); a
 * giants' lure (LOOP.lures[id].giants) multiplies the fish it names by its `share` (1.5) and its giant's share of the bites too (Taper's
 * ×1.3 on top, never above her cap). A fresh object; no lure (or an unknown one): the pool as it was.
 */
export function lurePool(D, pool, { lure = null, phase = 'calm', wickId = null } = {}) {
  const L = lure ? lureOf(D, lure) : null;
  if (!L || !isObj(pool) || !Array.isArray(pool.list)) return pool;
  const named = arr(L.giants), gl = num(L.share, 1.5);
  const k = (s) => (named.length ? (named.includes(s?.id) ? gl : 1) : (L.family && s?.family === L.family ? L.attract : 1));
  const list = pool.list.map(([s, w]) => [s, num(w) * k(s)]);
  const rest = list.reduce((a, [, w]) => a + w, 0);
  let giant = pool.giant;
  if (giant?.sp) {
    let share = num(giant.share, 0);
    if (named.includes(giant.sp.id)) {
      const base = typeof D?.giantShare === 'function' ? D.giantShare(giant.sp, phase, null) : share;
      const K = D?.LOOP?.wicks?.[typeof D?.loopWickId === 'function' ? D.loopWickId(wickId) : wickId];
      share = K?.giantShare ? Math.min(num(K.giantCap, 1), base * gl * K.giantShare) : base * gl;
    }
    giant = { sp: giant.sp, share, weight: share > 0 && share < 1 ? rest * share / (1 - share) : 0 };
  }
  return { ...pool, list, giant, tot: rest + (giant ? giant.weight : 0) };
}

/** The Keel's and the Lantern's favour on a cast (SPEC §7): the Keel +favour a level everywhere; the Lantern +favour a level after dark
 *  (the gloomtide). → [{family: 'tackle', id: 'keel' | 'lantern', value}], each only when it adds something. */
export function raftTerms(D, metaLoop, phase) {
  const R = D?.LOOP?.raft || {}, r = isObj(metaLoop?.raft) ? metaLoop.raft : {}, out = [];
  const keel = Math.max(0, int(r.keel)) * num(R.keel?.favour, 0.1), lantern = Math.max(0, int(r.lantern)) * num(R.lantern?.favour, 0.1);
  if (keel > 0) out.push({ family: 'tackle', id: 'keel', value: Math.round(keel * 100) / 100 });
  if (lantern > 0 && phase === 'gloomtide') out.push({ family: 'tackle', id: 'lantern', value: Math.round(lantern * 100) / 100 });
  return out;
}
/** The raft's parts on its stats (SPEC §7): {speed: +m/s from the Oars, light: × the light's radius from the Lantern}. */
export function raftStats(D, metaLoop) {
  const R = D?.LOOP?.raft || {}, r = isObj(metaLoop?.raft) ? metaLoop.raft : {};
  return { speed: Math.max(0, int(r.oars)) * num(R.oars?.speed, 1.5), light: 1 + Math.max(0, int(r.lantern)) * num(R.lantern?.light, 0.15) };
}

// ---------------------------------------------------------------- Murk's orders (SPEC §6.3; the bounty engine's shape: one record a request)
/** How many orders Murk chalks at this save's Order Board level (LOOP.home.orders.count; 0 with no board). */
export function orderCount(D, metaLoop) {
  const lv = Math.max(0, int(metaLoop?.home?.orders));
  // + the Rust Buoy-Bell (a found part, M1 step 5c): one more order once Order Board I is owned (loop-finds findOrderBonus)
  return lv > 0 ? Math.max(0, int(arr(D?.LOOP?.home?.orders?.count)[lv - 1], lv)) + findOrderBonus(metaLoop, D) : 0;
}
/** The fish an order may name (SPEC §6.3): a fish of an opened water that the player can always reach there: its list (SPEC §5.5 (c),
 *  `listFor`) and the own fish of the places the save owns; never a giant, the legend, a bait-only fish or a fish of a place not owned.
 *  → {common: [sp], uncommon: [sp], rare: [sp]} (the common bucket holds commons, the uncommon one uncommons). */
export function orderPool(D, metaLoop, { listFor = null, water = null } = {}) {
  const w = water || metaLoop?.barge?.water || arr(metaLoop?.maps?.lakes)[0] || 'mossmere';
  const byId = (id) => D?.SPECIES_BY_ID?.[id] || arr(D?.SPECIES).find((s) => s?.id === id) || null;
  const ids = new Set(typeof listFor === 'function' ? listFor(D, w) : []);
  const owned = new Set(arr(metaLoop?.maps?.places));
  for (const s of arr(D?.SPECIES)) if (s?.zone === w && s.place && owned.has(s.place) && !s.giant && s.rarity !== 'legendary' && !s.bait) ids.add(s.id);
  const out = { common: [], uncommon: [], rare: [] };
  for (const id of ids) {
    const s = byId(id);
    if (!s || s.giant || s.rarity === 'legendary' || s.rarity === 'epic' || s.cove) continue;
    (out[s.rarity] || out.rare).push(s);
  }
  return out;
}
const pickOf = (rng, list) => list[Math.min(list.length - 1, Math.floor(rng() * list.length))];
function pickKind(rng, weights) {
  const e = Object.entries(weights || { count: 1 }), tot = e.reduce((a, [, w]) => a + num(w), 0);
  let x = rng() * tot;
  for (const [k, w] of e) { x -= num(w); if (x <= 0) return k; }
  return e[e.length - 1][0];
}
/** A new order (SPEC §6.3): two in three name a common or uncommon fish, the rest a rare; a count ("2 Dusk Minnows"), a class ("a Prize
 *  Weeping Carp") or a weight ("a Reedjaw Pike over 9 lb 0 oz"); never the same fish as an order already open (`taken`). → the order
 *  {id, speciesId, kind, n, have: 0, cls?, oz?} or null when the pool is empty. */
export function newOrder(D, metaLoop, { rng = Math.random, taken = [], listFor = null, water = null } = {}) {
  const O = D?.LOOP?.orders || {}, pool = orderPool(D, metaLoop, { listFor, water });
  const not = new Set(arr(taken));
  const lowList = [...pool.common, ...pool.uncommon].filter((s) => !not.has(s.id)), rareList = pool.rare.filter((s) => !not.has(s.id));
  let list = rng() < num(O.common, 2 / 3) ? lowList : rareList;
  if (!list.length) list = lowList.length ? lowList : rareList;
  if (!list.length) return null;
  const sp = pickOf(rng, list), rare = sp.rarity === 'rare';
  const kind = pickKind(rng, rare ? O.rareKinds : O.kinds);
  const o = { id: uid('ord'), speciesId: sp.id, kind, n: 1, have: 0 };
  if (kind === 'count') { const [lo, hi] = arr(O.count?.[sp.rarity]).length ? O.count[sp.rarity] : [1, 1]; o.n = Math.max(1, lo + Math.floor(rng() * (hi - lo + 1))); }
  else if (kind === 'class') o.cls = O.cls || 'prize';
  else if (kind === 'heavy') {
    const len = typeof D?.sizeLength === 'function' ? D.sizeLength(sp, num(O.heavyZ, 0.35), sp.zone) : null;
    const kg = len && typeof D?.sizeWeight === 'function' ? D.sizeWeight(sp, len) : null;
    const t = kg && typeof D?.weightTarget === 'function' ? D.weightTarget(kg) : null;
    if (t && t.oz > 0) o.oz = t.oz; else { o.kind = 'count'; }
  }
  return o;
}
/** Murk chalks orders up to the board's count (in place on metaLoop.orders); → the orders added. */
export function refillOrders(D, metaLoop, opts = {}) {
  if (!isObj(metaLoop)) return [];
  if (!Array.isArray(metaLoop.orders)) metaLoop.orders = [];
  const want = orderCount(D, metaLoop), added = [];
  metaLoop.orders = metaLoop.orders.filter((o) => isObj(o) && typeof o.speciesId === 'string');
  while (metaLoop.orders.length < want) {
    const o = newOrder(D, metaLoop, { ...opts, taken: metaLoop.orders.map((x) => x.speciesId) });
    if (!o) break;
    metaLoop.orders.push(o); added.push(o);
  }
  return added;
}
const CLASS_RANK = ['small', 'keeper', 'prize', 'trophy', 'elder', 'ancient'];
/** Does a fish fill an order (SPEC §6.3, §8.2)? Its species, and for a class order at least that class, for a weight order more than its
 *  ounces as the card shows them (data.weightOz of data.fishWeight). Never a giant or a legend. */
export function orderMatches(D, o, fish) {
  if (!isObj(o) || !isObj(fish) || fish.speciesId !== o.speciesId || fish.giant === true || fish.legendary === true) return false;
  if (o.kind === 'class') return CLASS_RANK.indexOf(fish.sizeClass) >= CLASS_RANK.indexOf(o.cls || 'prize');
  if (o.kind === 'heavy') {
    const sp = D?.SPECIES_BY_ID?.[fish.speciesId];
    const oz = sp && typeof D?.weightOz === 'function' && typeof D?.fishWeight === 'function' ? D.weightOz(D.fishWeight(sp, fish)) : 0;
    return oz > num(o.oz, Infinity);
  }
  return true;
}
/**
 * The tally's orders (SPEC §6.3, §8.3): each fish (in the order given: the tally's, lightest first) fills the first open order it matches
 * that still wants one. → {fills: Map(uid → order id), orders: the orders after (a filled one removed; `have` counted), filled: [id]}.
 * Pure: the input orders are not touched.
 */
export function assignOrders(D, orders, fish) {
  const open = arr(orders).filter(isObj).map((o) => ({ ...o, have: Math.max(0, int(o.have)) }));
  const fills = new Map();
  for (const f of arr(fish)) {
    if (!isObj(f) || f.uid == null) continue;
    const o = open.find((x) => x.have < Math.max(1, int(x.n, 1)) && orderMatches(D, x, f));
    if (o) { o.have += 1; fills.set(f.uid, o.id); }
  }
  const filled = open.filter((o) => o.have >= Math.max(1, int(o.n, 1))).map((o) => o.id);
  return { fills, orders: open.filter((o) => !filled.includes(o.id)), filled };
}
const VOWEL = /^[AEIOU]/;
const SAME_PLURAL = /(?:perch|carp|koi|bass|pike|trout|crayfish|sturgeon|fish)$/i;
/** A species' name for a count of n ("Dusk Minnow" → "Dusk Minnows"; a Perch, a Carp, a Pike … stay as they are). */
export function pluralName(name, n) { return n === 1 || SAME_PLURAL.test(name) ? name : `${name}s`; }
/** An order as Murk chalks it (SPEC §6.3, §8.2): "2 Dusk Minnows" (what is still wanted), "a Dusk Minnow", "a Prize Weeping Carp",
 *  "a Reedjaw Pike over 9 lb 0 oz". Words: TEXT_LOOP.orderWords, the species' name, the class's label, data.fmtWeight. */
export function orderPhrase(D, o) {
  if (!isObj(o)) return '';
  const W = D?.TEXT_LOOP?.orderWords || { a: 'a', an: 'an', over: 'over' };
  const sp = D?.SPECIES_BY_ID?.[o.speciesId], name = sp?.name || String(o.speciesId || '');
  const left = Math.max(1, Math.max(1, int(o.n, 1)) - Math.max(0, int(o.have)));
  const art = (s) => `${VOWEL.test(s) ? W.an : W.a} ${s}`;
  if (o.kind === 'class') { const lab = arr(D?.SIZE_CLASSES).find((c) => c?.id === o.cls)?.label || 'Prize'; return art(`${lab} ${name}`); }
  if (o.kind === 'heavy') return `${art(name)} ${W.over} ${typeof D?.fmtWeight === 'function' ? D.fmtWeight(num(o.oz) / num(D.OZ_PER_KG, 35.27396195)) : `${o.oz} oz`}`;
  return left === 1 ? art(name) : `${left} ${pluralName(name, left)}`;
}
const WEIGHT_RE = /^(?:[¼½¾]|\d+(?:\s?[¼½¾])?)\s?oz$|^\d[\d,]*\s?lb(?:\s\d+\s?oz)?$/;
/** Is a text node one of orderPhrase's forms (ui-loop's textAllowed: the order board's words)? `names` the species' names. */
export function orderPhraseOk(t, D, names = null) {
  const W = D?.TEXT_LOOP?.orderWords || { a: 'a', an: 'an', over: 'over' };
  const N = names || new Set(arr(D?.SPECIES).map((s) => s?.name).filter(Boolean));
  const labels = arr(D?.SIZE_CLASSES).map((c) => c?.label).filter(Boolean);
  let m = /^(\d+) (.+)$/.exec(t);
  if (m && Number(m[1]) >= 2) return [...N].some((n) => pluralName(n, 2) === m[2]);
  m = new RegExp(`^(?:${W.a}|${W.an}) (.+?)(?: ${W.over} (.+))?$`).exec(t);
  if (!m) return false;
  if (m[2] != null && !WEIGHT_RE.test(m[2])) return false;
  const body = m[1];
  if (N.has(body)) return true;
  return labels.some((l) => body.startsWith(`${l} `) && N.has(body.slice(l.length + 1)));
}
