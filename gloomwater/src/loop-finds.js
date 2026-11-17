// loop-finds.js — M1 step 5c: what the line brings up that is not a fish (docs/loop/FINDS.md; SPEC §4.10, decisions 49–57).
// Pure: no data import (data is passed in as D, as progression-loop's helpers take it), no ctx; node tests call it directly.
//
//   findsOf(D, waterId) · findById(D, id) · findName(D, id) · findLine(D, id) · findValue(D, id) · findPose(D, id) ·
//   findShares(meta, D, waterId, {exclude}) (THE one function the snag roll draws from and the catalogue prints, FINDS §10) ·
//   drawFind(shares, u) · snagChance(D, {evening, legendCast, tutorial}) · noteSnag(metaLoop, D, waterId, findId) (the soft
//   guarantee) · owned(metaLoop, id) · fillFinds(metaLoop) (migrateLoop's fill) · findBiteBonus / findOrderBonus / findBaitFloor
//   (the parts' three effects, each capped at one and only at the part's own water, FINDS §3.2) · findLine (the hold entry) ·
//   findTallyLine(entry) · findCatalogue(meta, D, waterId) (catalogueFor's finds half) · fmtRate(share) (SPEC §8.8's format) ·
//   snagHeading(D) ("Snags · 1 bite in 20") · findDoes(D, id) (a lost-tackle piece's one plain line) · revealedPlaces(metaLoop) /
//   placeRevealed(metaLoop, placeId) (the places a lost notebook has shown: meta.loop.places.revealed; LOST-TACKLE §5.2, §8)
//
// A find in the hold is run.creel[i] = {uid, find: findId, kind, grade, clams, waterKey} beside the fish (FINDS §10's run.hold[i]);
// meta.loop.finds = {got: {findId: n}, worn: {slot: findId}, share: {waterId: kindShare}, tackleMiss: {waterId: n}}; a part, a look or
// a lost-tackle piece with got ≥ 1 is owned and never drawn again. Odds are never in the play: findShares is read by the roll and the
// catalogue only. Lost tackle (LOST-TACKLE.md §2): kind 'tackle' with a `slot` (rod, line, reel, lure, notebook), each piece
// LOOP.finds.tackle.each of the water's snags; the soft guarantee climbs one named piece (tackle.guarantee) a step a snag to its cap.

const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const arr = (v) => (Array.isArray(v) ? v : []);
export const FIND_KINDS = Object.freeze(['treasure', 'part', 'look', 'tackle']);
export const TACKLE_SLOTS = Object.freeze(['rod', 'line', 'reel', 'lure', 'notebook']);
export const FIND_GRADES = Object.freeze(['plain', 'fine', 'precious', 'rare', 'jackpot']);
export const FIND_EFFECTS = Object.freeze(['bait', 'order', 'bite']);

const F_ = (D) => (isObj(D?.LOOP?.finds) ? D.LOOP.finds : null);
/** The finds of a water, in the table's order (the treasures plain to jackpot, the parts, the looks). */
export function findsOf(D, waterId) { return arr(F_(D)?.items).filter((it) => isObj(it) && it.water === waterId); }
export function findById(D, id) { return arr(F_(D)?.items).find((it) => isObj(it) && it.id === id) || null; }
const words = (D, id) => (isObj(D?.TEXT_LOOP?.finds?.items?.[id]) ? D.TEXT_LOOP.finds.items[id] : {});
export const findName = (D, id) => words(D, id).name || '';
export const findLine = (D, id) => words(D, id).line || '';
/** A lost-tackle piece's one plain line, what it does (the card's, under the name; LOST-TACKLE §6.1); '' for any other find. */
export const findDoes = (D, id) => (findById(D, id)?.kind === 'tackle' ? words(D, id).does || '' : '');
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
  for (const k of ['got', 'worn', 'share', 'tackleMiss']) if (!isObj(f[k])) f[k] = {};
  for (const [id, n] of Object.entries(f.got)) { const c = Math.max(0, Math.floor(num(n))); if (c > 0) f.got[id] = c; else delete f.got[id]; }
  for (const [w, n] of Object.entries(f.tackleMiss)) { const c = Math.max(0, Math.floor(num(n))); if (c > 0) f.tackleMiss[w] = c; else delete f.tackleMiss[w]; }
  // LOST-TACKLE §8: the places a lost notebook has shown (meta.loop.places.revealed, each id once)
  if (!isObj(L.places)) L.places = { revealed: [] };
  L.places.revealed = arr(L.places.revealed).filter((id, i, a) => typeof id === 'string' && id && a.indexOf(id) === i);
  return L;
}
/** The places a lost notebook has shown (LOST-TACKLE §5.2): a copy of meta.loop.places.revealed. */
export function revealedPlaces(metaLoop) { return arr(metaLoop?.places?.revealed).filter((id) => typeof id === 'string'); }
/** Has a lost notebook shown this place (the brook behind the Veil: drawn on the Chart and sailable only then)? */
export function placeRevealed(metaLoop, placeId) { return typeof placeId === 'string' && revealedPlaces(metaLoop).includes(placeId); }
/** A part, a look or a lost-tackle piece owned (got ≥ 1); a treasure is never "owned" (it sells and may come again). */
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
  // lost tackle (LOST-TACKLE §2.2): each unowned piece not in this trip's hold `each`; the guaranteed one `each + step × misses` to its cap
  const TK = isObj(F.tackle) ? F.tackle : {}, each = num(TK.each, 0.01), GU = isObj(TK.guarantee) ? TK.guarantee : {};
  const miss = Math.max(0, Math.floor(num(L.finds?.tackleMiss?.[waterId], 0)));
  const tk = {};
  for (const it of items) if (it.kind === 'tackle' && !owned(L, it.id) && !ex.has(it.id)) tk[it.id] = it.id === GU.item ? Math.min(num(GU.cap, 0.4), each + num(GU.step, 0.05) * miss) : each;
  const T = Object.values(tk).reduce((a, b) => a + b, 0);
  const elig = items.filter((it) => (it.kind === 'part' || it.kind === 'look') && !owned(L, it.id) && !ex.has(it.id));
  const K = F.kind || {}, base = num(K.share, 0.35), cap = num(K.cap, 0.8);
  const saved = num(L.finds?.share?.[waterId], base);
  // the parts' and looks' share, clamped so the two kinds never take more than the plain and fine treasures can give (partCap)
  const share = elig.length ? Math.max(0, Math.min(cap, Math.max(base, saved), num(TK.partCap, 1) - T)) : 0;
  const G = F.grades || {}, p0 = num(G.plain?.share), f0 = num(G.fine?.share), pf = p0 + f0 || 1, took = share + T;
  for (const it of items) {
    if (it.kind === 'treasure') {
      const g = it.grade, s0 = num(G[g]?.share);
      out[it.id] = g === 'plain' ? p0 - took * (p0 / pf) : g === 'fine' ? f0 - took * (f0 / pf) : s0;
    } else if (it.kind === 'tackle') out[it.id] = tk[it.id] ?? 0;
    else out[it.id] = elig.includes(it) ? share / elig.length : 0;
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
/** The soft guarantees (FINDS §4.1; LOST-TACKLE §2.2), on metaLoop in place, after a snag brought up `findId` at the water: a treasure
 *  while some part or look is unowned raises the kind share by kind.step (to kind.cap); a part or a look sets it back to kind.share (a
 *  lost-tackle piece leaves it be). While the water's guaranteed piece (tackle.guarantee.item) is unowned, every snag that is not it
 *  counts one miss (meta.loop.finds.tackleMiss[water], to the count that reaches its cap) and bringing it up deletes the count.
 *  → the new kind share. */
export function noteSnag(metaLoop, D, waterId, findId) {
  const F = F_(D), it = findById(D, findId);
  if (!F || !isObj(metaLoop) || !it) return null;
  fillFinds(metaLoop);
  const GU = isObj(F.tackle?.guarantee) ? F.tackle.guarantee : null, gi = GU?.item ? findById(D, GU.item) : null;
  if (gi && gi.water === waterId && !owned(metaLoop, gi.id)) {
    const top = Math.max(0, Math.ceil((num(GU.cap, 0.4) - num(F.tackle.each, 0.01)) / Math.max(1e-6, num(GU.step, 0.05)) - 1e-9));
    if (it.id === gi.id) delete metaLoop.finds.tackleMiss[waterId];
    else metaLoop.finds.tackleMiss[waterId] = Math.min(top, Math.max(0, Math.floor(num(metaLoop.finds.tackleMiss[waterId]))) + 1);
  }
  const K = F.kind || {}, base = num(K.share, 0.35);
  const unowned = findsOf(D, waterId).some((x) => (x.kind === 'part' || x.kind === 'look') && !owned(metaLoop, x.id));
  const cur = num(metaLoop.finds.share[waterId], base);
  let next = cur;
  if (it.kind === 'treasure') { if (unowned) next = Math.min(num(K.cap, 0.8), cur + num(K.step, 0.15)); }
  else if (it.kind !== 'tackle') next = base;
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
export const findTallyGroup = (l) => (l.kind === 'treasure' ? (l.jackpot ? 4 : 3) : l.kind === 'tackle' ? 6 : 5);   // (lost tackle after the parts and looks)
/** The tally's bookkeeping for the finds in it (tallyBook's part): each find brought home counted in meta.loop.finds.got (a part or a
 *  look is fitted or worn from then on; worn[slot] names a look). A lost-tackle piece is owned from then on: the guaranteed one's miss
 *  count goes, and a notebook that shows a place (LOOP.lostTackle[id].reveals) adds it to meta.loop.places.revealed (LOST-TACKLE §8). */
export function bookFinds(metaLoop, lines, D = null) {
  if (!isObj(metaLoop)) return;
  fillFinds(metaLoop);
  for (const l of arr(lines)) {
    if (!l?.find) continue;
    metaLoop.finds.got[l.find] = Math.max(0, Math.floor(num(metaLoop.finds.got[l.find]))) + 1;
    const it = D ? findById(D, l.find) : null;
    if (it?.kind === 'look' && it.slot && !metaLoop.finds.worn[it.slot]) metaLoop.finds.worn[it.slot] = it.id;
    if (it?.kind === 'tackle') {
      if (F_(D)?.tackle?.guarantee?.item === it.id) delete metaLoop.finds.tackleMiss[it.water];
      const rv = D?.LOOP?.lostTackle?.[it.id]?.reveals;
      if (typeof rv === 'string' && rv && !metaLoop.places.revealed.includes(rv)) metaLoop.places.revealed.push(rv);
    }
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
 * catalogueFor's finds half (FINDS §6.5, SPEC §8.8, M1 §2.17): the water's finds in four rows (treasures, parts, looks, tackle), each
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
      name: had ? findName(D, it.id) : null, line: had ? findLine(D, it.id) : null, does: had && it.kind === 'tackle' ? findDoes(D, it.id) : null,
      rate, rateText: own ? null : fmtRate(rate), tick: own, gold: it.grade === 'jackpot' };
  };
  return {
    water: waterId, heading: snagHeading(D),
    rows: { treasure: items.filter((i) => i.kind === 'treasure').map(card), part: items.filter((i) => i.kind === 'part').map(card),
      look: items.filter((i) => i.kind === 'look').map(card), tackle: items.filter((i) => i.kind === 'tackle').map(card) },
  };
}
