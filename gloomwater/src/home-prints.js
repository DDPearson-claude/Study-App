// home-prints.js — M1 step 5b (lane 5b-home): the ink prints, the Prints page and the Long Wall's gallery, as pure functions
// (docs/loop/SPEC.md §6.2, §6.3, §6.4; M1.md §2.4, §2.6, §4 step 5b). No data import (`D` is passed in). Read only under the loop.
//
// At the measure (the seal stamp, before the card) the Wick takes an ink print of the fish, whether it is kept or let go. The
// Journal keeps the best print per species: the heaviest by the weight the card shows (data.fishWeight of its length; a print
// that reads the same weight never replaces the one before). meta.loop.prints = {speciesId: {length, cls, key, zone, evening, n}},
// never a weight (a weight is derived wherever it is shown, as every other screen does).
//
//   notePrint(L, D, fish, {sp, cls, evening, zone})   → {best, first} (writes L.prints in place)
//   printsView(meta, D, waters)                      the Journal's Prints page: one card per printed species, the catalogue's order
//   galleryModel(meta, D, {wing})                    the cabin's wings: {wings: [{n, waters, frames}], eave} (frames at true size)
//   eavePrint(meta, D)                               the legend's print along the cabin's eave once she is home, or null

const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const int = (v, d = 0) => Math.trunc(num(v, d));
const arr = (v) => (Array.isArray(v) ? v : []);
const spOf = (D, id) => D?.SPECIES_BY_ID?.[id] || arr(D?.SPECIES).find((s) => s?.id === id) || null;
/** The ounces a length reads as on the card (data.weightOz(data.fishWeight)), else the length itself (no data). */
function shownOz(D, sp, length) {
  try {
    if (typeof D?.weightOz === 'function' && typeof D?.fishWeight === 'function') return D.weightOz(D.fishWeight(sp, { length }));
  } catch { /* fall through */ }
  return num(length);
}

/**
 * The print at the measure (SPEC §6.4): a measured fish (its `length`, cm) prints whether it is kept or let go. The species' best is
 * replaced only by a heavier print (by the ounces the card shows); every print counts in `n`. → {best (this print is now the best),
 * first (the species' first print)}.
 */
export function notePrint(L, D, fish, { sp = null, cls = null, evening = null, zone = null } = {}) {
  const none = { best: false, first: false };
  if (!isObj(L) || !isObj(fish)) return none;
  const s = sp || spOf(D, fish.speciesId), len = num(fish.length);
  if (!s || !(len > 0)) return none;
  if (!isObj(L.prints)) L.prints = {};
  const prev = isObj(L.prints[s.id]) ? L.prints[s.id] : null;
  const n = int(prev?.n) + 1;
  const best = !prev || shownOz(D, s, len) > shownOz(D, s, num(prev.length));
  if (best) {
    L.prints[s.id] = { length: len, cls: typeof cls === 'string' ? cls : fish.sizeClass ?? null, key: typeof fish.waterKey === 'string' ? fish.waterKey : null,
      zone: zone ?? fish.zone ?? s.zone ?? null, evening: int(evening) || null, n };
  } else prev.n = n;
  return { best, first: !prev };
}

/** Where a print was taken, in words the screens may show: an owned place's name, else its water's name. */
export function printWhere(D, rec) {
  const k = rec?.key;
  if (typeof k === 'string' && !k.startsWith('open:')) {
    const n = typeof D?.loopPlace === 'function' ? D.loopPlace(k)?.name : null;
    if (n) return n;
  }
  const z = typeof k === 'string' && k.startsWith('open:') ? k.slice(5) : rec?.zone;
  return arr(D?.ZONES).find((q) => q?.id === z)?.name ?? null;
}
/** One print as the screens draw it: {id, name, length (cm), weight (fmtWeight), cls, where, evening, giant, legend, n}. */
function printCard(D, sp, rec) {
  let weight = null;
  try { if (typeof D?.fmtWeight === 'function' && typeof D?.fishWeight === 'function') weight = D.fmtWeight(D.fishWeight(sp, { length: num(rec.length) })); } catch { weight = null; }
  return { id: sp.id, name: sp.name || sp.id, length: Math.round(num(rec.length) * 10) / 10, weight, cls: rec.cls ?? null, where: printWhere(D, rec),
    evening: int(rec.evening) || null, giant: sp.giant === true, legend: sp.rarity === 'legendary', n: Math.max(1, int(rec.n, 1)) };
}
/** The waters' species in the catalogue's order (D.SPECIES' order for each water, in the waters' order). */
function speciesOf(D, waters) {
  const ws = arr(waters);
  return ws.flatMap((w) => arr(D?.SPECIES).filter((s) => isObj(s) && s.zone === w && !s.cove));
}

/** The Journal's Prints page (SPEC §6.4, §8.8's tab row): every printed species of the given waters, in the catalogue's order. */
export function printsView(meta, D, waters = ['mossmere']) {
  const P = isObj(meta?.loop?.prints) ? meta.loop.prints : {};
  const cards = speciesOf(D, waters).filter((s) => isObj(P[s.id]) && num(P[s.id].length) > 0).map((s) => printCard(D, s, P[s.id]));
  return { cards, count: cards.length, of: speciesOf(D, waters).length };
}

/** The waters a wing hangs (wing n: catalogue order 4n−3 … 4n, LOOP.gallery.perWing), as ids. */
export function wingWaters(D, n) {
  const per = Math.max(1, int(D?.LOOP?.gallery?.perWing, 4)), lo = (n - 1) * per + 1, hi = n * per, W = isObj(D?.LOOP?.waters) ? D.LOOP.waters : {};
  // (LAKE 2, lane D1: only the waters that ship hang on a wing; a later water's LOOP.waters entry is data before it does)
  const sh = D?.LOOP?.shipped, last = typeof sh === 'string' ? num(W[sh]?.order, Infinity) : Infinity;
  return Object.keys(W).filter((id) => { const o = num(W[id]?.order, NaN); return o >= lo && o <= hi && o <= last && (!Array.isArray(sh) || sh.includes(id)); })
    .sort((a, b) => num(W[a].order) - num(W[b].order));
}
/**
 * The cabin's gallery (SPEC §6.3): one wing per Long Wall level owned (M1: wing I, the Mossmere's), each hanging the best print of
 * every fish of its waters that has one, at true size (its length in cm, on its painted ruler), a candle under each, the giants in gold
 * frames; the legend is not on the wall (her print hangs along the eave). `wall` the wings owned (meta.loop.home.wall by default).
 * → {wings: [{n, waters, frames: [card + {gold}], span (cm: the frames' lengths and their gaps)}], eave, owned}
 */
export function galleryModel(meta, D, { wall = null, gap = 18 } = {}) {
  const P = isObj(meta?.loop?.prints) ? meta.loop.prints : {};
  const owned = Math.max(0, int(wall ?? meta?.loop?.home?.wall));
  const wings = [];
  for (let n = 1; n <= owned; n++) {
    const waters = wingWaters(D, n);
    const frames = speciesOf(D, waters).filter((s) => s.rarity !== 'legendary' && isObj(P[s.id]) && num(P[s.id].length) > 0)
      .map((s) => ({ ...printCard(D, s, P[s.id]), gold: s.giant === true }));
    const span = frames.reduce((a, f) => a + f.length, 0) + gap * Math.max(0, frames.length - 1);
    wings.push({ n, waters, frames, span: Math.round(span) });
  }
  return { wings, eave: eavePrint(meta, D), owned };
}
/** The legend's print along the cabin's eave above the door (SPEC §6.2): once she is home (meta.loop.legends[id] ≥ 1) and printed. */
export function eavePrint(meta, D, waters = ['mossmere']) {
  const L = isObj(meta?.loop) ? meta.loop : {}, P = isObj(L.prints) ? L.prints : {};
  for (const s of speciesOf(D, waters)) {
    if (s.rarity !== 'legendary') continue;
    if (int(L.legends?.[s.id]) >= 1 && isObj(P[s.id]) && num(P[s.id].length) > 0) return printCard(D, s, P[s.id]);
  }
  return null;
}
