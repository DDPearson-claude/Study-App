// loop-finds.js — M1 step 5c: what the line brings up that is not a fish (docs/loop/FINDS.md; SPEC §4.10, decisions 49–57).
// Pure: no data import (data is passed in as D, as progression-loop's helpers take it), no ctx; node tests call it directly.
//
//   findsOf(D, waterId) · findById(D, id) · findName(D, id) · findLine(D, id) · findValue(D, id) · findPose(D, id) ·
//   findShares(meta, D, waterId, {exclude}) (THE one function the snag roll draws from and the catalogue prints, FINDS §10) ·
//   drawFind(shares, u) · snagChance(D, {evening, legendCast, tutorial}) · noteSnag(metaLoop, D, waterId, findId) (the soft
//   guarantee) · owned(metaLoop, id) · fillFinds(metaLoop) (migrateLoop's fill) · findBiteBonus / findOrderBonus / findBaitFloor
//   (the parts' three effects, each capped at one and only at the part's own water, FINDS §3.2) · findLine (the hold entry) ·
//   findTallyLine(entry) · findCatalogue(meta, D, waterId) (catalogueFor's finds half) · fmtRate(share) (SPEC §8.8's format) ·
//   snagHeading(D) ("Snags · 1 bite in 20")
//
// A find in the hold is run.creel[i] = {uid, find: findId, kind, grade, clams, waterKey} beside the fish (FINDS §10's run.hold[i]);
// meta.loop.finds = {got: {findId: n}, worn: {slot: findId}, share: {waterId: kindShare}}; a part or a look with got ≥ 1 is owned
// (fitted or worn) and never drawn again. Odds are never in the play: findShares is read by the roll and the catalogue only.

const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const arr = (v) => (Array.isArray(v) ? v : []);
export const FIND_KINDS = Object.freeze(['treasure', 'part', 'look']);
export const FIND_GRADES = Object.freeze(['plain', 'fine', 'precious', 'rare', 'jackpot']);
export const FIND_EFFECTS = Object.freeze(['bait', 'order', 'bite']);

const F_ = (D) => (isObj(D?.LOOP?.finds) ? D.LOOP.finds : null);
/** The finds of a water, in the table's order (the treasures plain to jackpot, the parts, the looks). */
export function findsOf(D, waterId) { return arr(F_(D)?.items).filter((it) => isObj(it) && it.water === waterId); }
export function findById(D, id) { return arr(F_(D)?.items).find((it) => isObj(it) && it.id === id) || null; }
const words = (D, id) => (isObj(D?.TEXT_LOOP?.finds?.items?.[id]) ? D.TEXT_LOOP.finds.items[id] : {});
export const findName = (D, id) => words(D, id).name || '';
export const findLine = (D, id) => words(D, id).line || '';
/** A treasure's price (FINDS §4.2): round(tier[water] × grade.x × priceFactor); a part or a look 0 (its slot is its price). */
export function findValue(D, id) {
  const it = typeof id === 'string' ? findById(D, id) : id;
  if (!isObj(it) || it.kind !== 'treasure') return 0;
  const tier = num(D?.LOOP?.waters?.[it.water]?.tier, 0), x = num(F_(D)?.grades?.[it.grade]?.x, 0);
  return Math.max(0, Math.round(tier * x * num(D?.LOOP?.priceFactor, 1)));
}
/** The show's pose of a find (one of the built five: pinch, both, alongside). */
export function findPose(D, id) { const p = findById(D, id)?.pose; return p === 'pinch' || p === 'alongside' ? p : 'both'; }
/** The haul (s, FINDS §2) and the show's held beat (s, §6.2) by the find's pose; the jackpot holds a giant's longer beat. */
export function findHaul(D, id) { return num(F_(D)?.haul?.[findPose(D, id)], 3); }
export function findHoldBeat(D, id) {
  const H = F_(D)?.hold || {}, it = findById(D, id);
  return it?.grade === 'jackpot' ? num(H.jackpot, 2.4) : num(H[findPose(D, id)], 1.5);
}

/** meta.loop.finds made whole, in place (migrateLoop's fill: every block, every boot; never a schema step). */
export function fillFinds(L) {
  if (!isObj(L)) return L;
  if (!isObj(L.finds)) L.finds = { got: {}, worn: {}, share: {} };
  const f = L.finds;
  for (const k of ['got', 'worn', 'share']) if (!isObj(f[k])) f[k] = {};
  for (const [id, n] of Object.entries(f.got)) { const c = Math.max(0, Math.floor(num(n))); if (c > 0) f.got[id] = c; else delete f.got[id]; }
  return L;
}
/** A part or a look owned (got ≥ 1: fitted or worn); a treasure is never "owned" (it sells and may come again). */
export function owned(metaLoop, id) { return num(metaLoop?.finds?.got?.[id], 0) >= 1; }

/**
 * The share of the water's NEXT snag for each of its finds, as the save stands (FINDS §4.1, §4.1a, §10; revision 3): the kind share
 * (LOOP.finds.kind.share, raised by the soft guarantee in meta.loop.finds.share[water], to kind.cap) split equally among the unowned
 * parts and looks (never one in `exclude`: this trip's hold); the five grades are fixed shares of every snag (precious 12 · rare 4 ·
 * jackpot 1), plain and fine giving up the kind share in proportion (54 : 29); an owned part or look 0. With none left to draw, the
 * kind share is 0 and every snag is a treasure. → {[findId]: share}, summing to 1. Pure.
 */
export function findShares(meta, D, waterId, { exclude = [] } = {}) {
  const F = F_(D), items = findsOf(D, waterId), out = {};
  if (!F || !items.length) return out;
  const L = isObj(meta?.loop) ? meta.loop : isObj(meta) && isObj(meta.finds) ? meta : {};
  const ex = new Set(arr(exclude));
  const elig = items.filter((it) => (it.kind === 'part' || it.kind === 'look') && !owned(L, it.id) && !ex.has(it.id));
  const K = F.kind || {}, base = num(K.share, 0.35), cap = num(K.cap, 0.8);
  const saved = num(L.finds?.share?.[waterId], base);
  const share = elig.length ? Math.min(cap, Math.max(base, saved)) : 0;
  const G = F.grades || {}, p0 = num(G.plain?.share), f0 = num(G.fine?.share), pf = p0 + f0 || 1;
  for (const it of items) {
    if (it.kind === 'treasure') {
      const g = it.grade, s0 = num(G[g]?.share);
      out[it.id] = g === 'plain' ? p0 - share * (p0 / pf) : g === 'fine' ? f0 - share * (f0 / pf) : s0;
    } else out[it.id] = elig.includes(it) ? share / elig.length : 0;
  }
  return out;
}
/** The draw of one snag from findShares (u in [0, 1)): the first find whose running share passes u, in the table's order. */
export function drawFind(shares, u) {
  const e = Object.entries(isObj(shares) ? shares : {}).filter(([, s]) => s > 0);
  if (!e.length) return null;
  let acc = 0;
  const x = Math.min(Math.max(num(u, 0), 0), 1 - 1e-12);
  for (const [id, s] of e) { acc += s; if (x < acc - 1e-12) return id; }
  return e[e.length - 1][0];
}
/** The snag rate of this bite (FINDS §2, §4.1): perBite, 0 on the first evening (the tutorial's trip stays a lesson in fish) and
 *  on a legend's cast (her bait gives her sure bite). */
export function snagChance(D, { evening = 2, legendCast = false, tutorial = false } = {}) {
  const S = F_(D)?.snag;
  if (!S) return 0;
  if (legendCast === true) return num(S.legendCast, 0);
  if (tutorial === true || num(evening, 2) <= 1) return num(S.firstEvening, 0);
  return Math.max(0, Math.min(1, num(S.perBite, 0)));
}
/** The soft guarantee (FINDS §4.1), on metaLoop in place, after a snag brought up `findId` at the water: a treasure while some part or
 *  look is unowned raises the kind share by kind.step (to kind.cap); a part or a look sets it back to kind.share. → the new share. */
export function noteSnag(metaLoop, D, waterId, findId) {
  const F = F_(D), it = findById(D, findId);
  if (!F || !isObj(metaLoop) || !it) return null;
  fillFinds(metaLoop);
  const K = F.kind || {}, base = num(K.share, 0.35);
  const unowned = findsOf(D, waterId).some((x) => (x.kind === 'part' || x.kind === 'look') && !owned(metaLoop, x.id));
  const cur = num(metaLoop.finds.share[waterId], base);
  let next = cur;
  if (it.kind === 'treasure') { if (unowned) next = Math.min(num(K.cap, 0.8), cur + num(K.step, 0.15)); }
  else next = base;
  next = Math.round(next * 1e6) / 1e6;
  if (Math.abs(next - base) < 1e-9) delete metaLoop.finds.share[waterId]; else metaLoop.finds.share[waterId] = next;
  return next;
}

// ---------------------------------------------------------------- the parts' three effects (FINDS §3.2; SPEC decision 54)
/** The owned part of a water with that effect, or null. */
function partOf(metaLoop, D, waterId, effect) {
  return findsOf(D, waterId).find((it) => it.kind === 'part' && it.effect === effect && owned(metaLoop, it.id)) || null;
}
/** The bite part (the Gate Lamp-Glass): +1 good bite at its water's open water (goodBitesFor's `extra`), capped at LOOP.finds.parts.bite. */
export function findBiteBonus(metaLoop, D, waterId) {
  return partOf(metaLoop, D, waterId, 'bite') ? Math.min(1, Math.max(0, Math.round(num(F_(D)?.parts?.bite, 1)))) : 0;
}
/**
 * The order part (the Rust Buoy-Bell): once Order Board I is owned (meta.loop.home.orders ≥ 1), one more order on the board, for a fish
 * of the part's own water, only while the barge lies there (meta.loop.barge.water). Before the board it does nothing but ring.
 * THE SEAM (lane 4's order engine, src/loop-gear.js): orderCount(D, metaLoop) + findOrderBonus(metaLoop, D) is the board's count;
 * the extra order is `{…newOrder(…), water: findOrderWater(metaLoop, D)}`. → 0 or 1.
 */
export function findOrderBonus(metaLoop, D, waterId = metaLoop?.barge?.water ?? 'mossmere') {
  if (!(num(metaLoop?.home?.orders, 0) >= 1)) return 0;
  return partOf(metaLoop, D, waterId, 'order') ? Math.min(1, Math.max(0, Math.round(num(F_(D)?.parts?.order, 1)))) : 0;
}
/** The water the bell's extra order names (its part's own), or null with no bell working. */
export function findOrderWater(metaLoop, D, waterId = metaLoop?.barge?.water ?? 'mossmere') { return findOrderBonus(metaLoop, D, waterId) ? waterId : null; }
/**
 * The bait part (the Moat Bollard): at Sail, the trip's bag of the water's plain bait is topped up to the Bait Bed's floor + one tin
 * (with no Bait Bed, a floor of one tin). It tops you up like the Bed; it never piles up. `bedFloor` is the Bed's own floor in baits
 * (lane 5B's; 0 with no Bed). → {baitId, floor} (floor 0 and baitId null with no bollard at this water).
 */
export function findBaitFloor(metaLoop, D, waterId, bedFloor = 0) {
  const p = partOf(metaLoop, D, waterId, 'bait');
  const bed = Math.max(0, Math.floor(num(bedFloor, 0)));
  if (!p) return { baitId: null, floor: bed };
  const tin = Math.max(1, Math.round(num(D?.LOOP?.baitRule?.tin, num(F_(D)?.tin, 10))));
  const n = Math.min(1, Math.max(0, Math.round(num(F_(D)?.parts?.bait, 1))));
  return { baitId: typeof p.bait === 'string' ? p.bait : 'mireworm', floor: bed + n * tin };
}

// ---------------------------------------------------------------- the hold and the tally (FINDS §6.4)
/** The hold entry of a kept find: {uid, find, kind, grade, clams, waterKey, water}. */
export function holdEntry(D, findId, { uid = null, waterKey = null } = {}) {
  const it = findById(D, findId);
  if (!it) return null;
  return { uid, find: it.id, kind: it.kind, grade: it.kind === 'treasure' ? it.grade : null, clams: findValue(D, it), waterKey, water: it.water };
}
/** A find's tally row (tallyLines' shape plus the find's own fields): treasures by value, the jackpot last and alone (after the giant),
 *  then each part and look carried aboard for nothing. `g` is its group in the tally's order (fish 0, legend 1, giant 2, then 3–5). */
export function findTallyLine(f) {
  const clams = f.kind === 'treasure' ? Math.max(0, Math.round(num(f.clams))) : 0;
  return { uid: f.uid ?? null, speciesId: null, sizeClass: null, length: 0, base: clams, clams, first: false, giant: false, legend: false,
    find: f.find, kind: f.kind ?? null, grade: f.grade ?? null, jackpot: f.grade === 'jackpot' };
}
export const findTallyGroup = (l) => (l.kind === 'treasure' ? (l.jackpot ? 4 : 3) : 5);
/** The tally's bookkeeping for the finds in it (tallyBook's part): each find brought home counted in meta.loop.finds.got (a part or a
 *  look is fitted or worn from then on; worn[slot] names a look). */
export function bookFinds(metaLoop, lines, D = null) {
  if (!isObj(metaLoop)) return;
  fillFinds(metaLoop);
  for (const l of arr(lines)) {
    if (!l?.find) continue;
    metaLoop.finds.got[l.find] = Math.max(0, Math.floor(num(metaLoop.finds.got[l.find]))) + 1;
    const it = D ? findById(D, l.find) : null;
    if (it?.kind === 'look' && it.slot && !metaLoop.finds.worn[it.slot]) metaLoop.finds.worn[it.slot] = it.id;
  }
}

// ---------------------------------------------------------------- the catalogue's finds row (FINDS §6.5, SPEC §8.8)
/** SPEC §8.8's format: a whole percent from 10% ("31%"), one decimal under it with ".0" dropped ("5.8%", "4%", "1%"); null for 0
 *  (never "0%" for anything that can still come: an owned part or look shows its tick). */
export function fmtRate(share) {
  const p = num(share, 0) * 100;
  if (!(p > 1e-9)) return null;
  if (p >= 10 - 1e-9) return `${Math.round(p)}%`;
  const r = Math.round(p * 10) / 10;
  return `${r % 1 === 0 ? r.toFixed(0) : r.toFixed(1)}%`;
}
/** The row's heading: TEXT_LOOP.finds.snags · "1 bite in N", N = round(1 ÷ perBite). */
export function snagHeading(D) {
  const T = D?.TEXT_LOOP?.finds || {}, pb = num(F_(D)?.snag?.perBite, 0.05);
  const n = pb > 0 ? Math.round(1 / pb) : 0;
  return { snags: T.snags || 'Snags', rate: String(T.biteIn || '1 bite in {n}').replace('{n}', String(n)), n };
}
/**
 * catalogueFor's finds half (FINDS §6.5, SPEC §8.8, M1 §2.17): the water's finds in three rows (treasures, parts, looks), each
 * {id, kind, grade, effect, slot, had, count, owned, name (null when not had: "· · ·"), line, rate (findShares'), rateText (fmtRate;
 * null for an owned part or look), tick (an owned part or look), gold (the jackpot)}, and the heading. null for a water the save does
 * not own (nothing unowned is drawn). The page's only rates.
 */
export function findCatalogue(meta, D, waterId) {
  const items = findsOf(D, waterId);
  if (!items.length) return null;
  const L = isObj(meta?.loop) ? meta.loop : {};
  const lakes = arr(L.maps?.lakes);
  if (lakes.length && !lakes.includes(waterId)) return null;
  const shares = findShares(meta, D, waterId);
  const card = (it) => {
    const count = Math.max(0, Math.floor(num(L.finds?.got?.[it.id], 0))), had = count > 0;
    const own = it.kind !== 'treasure' && had, rate = num(shares[it.id], 0);
    return { id: it.id, kind: it.kind, grade: it.grade ?? null, effect: it.effect ?? null, slot: it.slot ?? null, had, count, owned: own,
      name: had ? findName(D, it.id) : null, line: had ? findLine(D, it.id) : null, rate, rateText: own ? null : fmtRate(rate), tick: own, gold: it.grade === 'jackpot' };
  };
  return {
    water: waterId, heading: snagHeading(D),
    rows: { treasure: items.filter((i) => i.kind === 'treasure').map(card), part: items.filter((i) => i.kind === 'part').map(card),
      look: items.filter((i) => i.kind === 'look').map(card) },
  };
}
