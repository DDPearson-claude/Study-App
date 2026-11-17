// loop-carry.js — LAKE 2, lane D2 (docs/loop/LAKE2.md §5, the user's words and answers of 17 Nov 2026): the gear loop across waters,
// as pure functions. "At the next lake you lose everything you bought but keep permanently a portion of the stats you got. Anything you
// found whilst fishing you keep permanently." No data import: `D` (the data module) is passed in, as in progression-loop.js. Read only
// under the loop. On a save that has never been towed past its first water every function here gives what the Mossmere gave before.
//
// meta.loop's keys this module reads and writes (additive; LOOP_SCHEMA stays 4: migrateLoop fills them for every block):
//   carry      {rod, line, reel, cast, slots, raft: {oars, keel, lantern}}: what earlier tows kept for good (the tackle's Hold a slot, the
//              rod's metres beyond the start rod's, the hold's slots, the raft parts' levels, a fraction)
//   gearWater  the water whose shelf `tackle`, the bought part of `holdSlots` and `raft` belong to (the first water's until a first tow)
//   fit        {rod, line, reel}: the piece fitted in a slot, a found piece's id or a tier's id of the gear water (a lower tier may be
//              fitted), or null for the best bought (the Tackle screen's, lane G; LOST-TACKLE's `found` is read into it once)
//   eveningsAt {water: n}: evenings fished at each water (the first evenings' rule, LOOP.arrival)
//
//   firstWaterOf(D) · gearWaterOf(D, ml) · carryOf(ml) · tiersOf(D, water, slot) · fittedTier(D, ml, slot) · tierHold(D, water, slot, t)
//   tackleHold(D, ml, found) · castMaxOf(D, ml, foundCast) · hookWindowOf(D, ml, foundWindow) · raftLevels(ml) · holdBought(D, ml)
//   carryAdd(D, ml) · applyTow(D, ml, to) · leaveTerms(D, ml, to) · carriedLine(D, ml) · lureHere(D, id, water) · arrivalOf(D, ml, water)
//   lineCapAt(D, water, lineHold) · startKitAt(D, water)

const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const int = (v, d = 0) => Math.trunc(num(v, d));
const arr = (v) => (Array.isArray(v) ? v : []);
export const TACKLE_SLOTS = Object.freeze(['rod', 'line', 'reel']);
export const RAFT_PARTS = Object.freeze(['oars', 'keel', 'lantern']);
/** A fresh carry: nothing kept yet. */
export const freshCarry = () => ({ rod: 0, line: 0, reel: 0, cast: 0, slots: 0, raft: { oars: 0, keel: 0, lantern: 0 } });
/** Round a carried stat as LOOP.carry.round says ('up': ceil, with a hair's room for 5 × ⅓ and 3 × ⅓). */
const roundUp = (x) => Math.max(0, Math.ceil(x - 1e-9));

/** The water a fresh save owns: the one LOOP.waters puts first (the Mossmere). */
export function firstWaterOf(D) {
  const W = D?.LOOP?.waters;
  if (isObj(W)) {
    const ids = Object.keys(W).filter((id) => isObj(W[id])).sort((a, b) => num(W[a].order, 99) - num(W[b].order, 99));
    if (ids.length) return ids[0];
  }
  return D?.ZONES?.[0]?.id || 'mossmere';
}
/** The water whose shelf the save's bought gear belongs to: meta.loop.gearWater when LOOP.gear knows it, else the first water. */
export function gearWaterOf(D, ml) {
  const w = ml?.gearWater;
  return typeof w === 'string' && isObj(D?.LOOP?.gear?.[w]) ? w : firstWaterOf(D);
}
/** meta.loop.carry made whole (a copy; numbers ≥ 0). */
export function carryOf(ml) {
  const c = isObj(ml?.carry) ? ml.carry : {}, out = freshCarry();
  for (const k of ['rod', 'line', 'reel', 'cast', 'slots']) out[k] = Math.max(0, num(c[k]));
  for (const p of RAFT_PARTS) out.raft[p] = Math.max(0, num(c.raft?.[p]));
  return out;
}
/** A water's tackle tiers for a slot (LOOP.gear[water][slot]: level 0 the start piece), or []. */
export const tiersOf = (D, water, slot) => arr(D?.LOOP?.gear?.[water]?.[slot]);
/** The Hold of a slot's tier `t` at a water: LOOP.gear's, else (a tier past the water's own, a debug or old save on the Mossmere's global
 *  ladder) data.tackleHoldAt for T0–T4 and LOOP.tackle.extraHold for T5–T6, as before. */
export function tierHold(D, water, slot, t) {
  const tier = tiersOf(D, water, slot)[t];
  if (tier && Number.isFinite(Number(tier.hold))) return Number(tier.hold);
  const X = D?.LOOP?.tackle?.extraHold || {};
  if (t <= 4) return typeof D?.tackleHoldAt === 'function' ? D.tackleHoldAt(slot, t) : 0;
  return Number(X[slot]?.[t - 5] ?? X[slot]?.[arr(X[slot]).length - 1] ?? 0);
}
/** The tier fitted in a slot: a tier id of the gear water at or below the bought one (meta.loop.fit[slot]), else the bought tier. */
export function fittedTier(D, ml, slot) {
  const cur = Math.max(0, int(ml?.tackle?.[slot])), id = ml?.fit?.[slot];
  if (typeof id !== 'string') return cur;
  const i = tiersOf(D, gearWaterOf(D, ml), slot).findIndex((t) => t?.id === id);
  return i >= 0 && i <= cur ? i : cur;
}
/** The Hold of the loop's tackle per slot (LAKE2 §5.3: holdOf = the carry + the fitted piece): the carried Hold plus the fitted found
 *  piece's own Hold (`found`: loop-finds.foundKit's hold) or else the fitted tier's at the gear water. */
export function tackleHold(D, ml, found = {}) {
  const c = carryOf(ml), w = gearWaterOf(D, ml), out = {};
  for (const s of TACKLE_SLOTS) out[s] = c[s] + (Number.isFinite(found?.[s]) ? found[s] : tierHold(D, w, s, fittedTier(D, ml, s)));
  return out;
}
/** The rod's cast (castMax, m): a fitted found rod's own (`foundCast`), else the start rod's (LOOP.carry.castFrom) plus the fitted tier's
 *  metres; plus the carried metres. A tier past the water's own reads TACKLE's castMax, as before. */
export function castMaxOf(D, ml, foundCast = null) {
  const c = carryOf(ml), from = num(D?.LOOP?.carry?.castFrom, num(D?.TACKLE?.rod?.[0]?.castMax, 16));
  if (num(foundCast, 0) > 0) return num(foundCast) + c.cast;
  const t = fittedTier(D, ml, 'rod'), tier = tiersOf(D, gearWaterOf(D, ml), 'rod')[t];
  if (tier && Number.isFinite(Number(tier.cast))) return from + Number(tier.cast) + c.cast;
  const rods = arr(D?.TACKLE?.rod), rod = rods[Math.max(0, Math.min(rods.length - 1, t))];
  return num(rod?.castMax, from) + c.cast;
}
/** The rod's strike window: a fitted found rod's own, else the fitted tier's (never carried: LAKE2 §5.3). */
export function hookWindowOf(D, ml, foundWindow = null) {
  if (num(foundWindow, 0) > 0) return num(foundWindow);
  const t = fittedTier(D, ml, 'rod'), tier = tiersOf(D, gearWaterOf(D, ml), 'rod')[t];
  if (tier && num(tier.hookWindow, 0) > 0) return num(tier.hookWindow);
  const rods = arr(D?.TACKLE?.rod);
  return num(rods[Math.max(0, Math.min(rods.length - 1, t))]?.hookWindow, 1);
}
/** The raft's parts as they work (LAKE2 §5.3, the user's answer 1): the levels bought at the gear water plus the carried fraction. */
export function raftLevels(ml) {
  const c = carryOf(ml), r = isObj(ml?.raft) ? ml.raft : {}, out = {};
  for (const p of RAFT_PARTS) out[p] = Math.max(0, int(r[p])) + c.raft[p];
  return out;
}
/** The hold's slots bought at the gear water (holdSlots − the start − the carried slots), ≥ 0. */
export function holdBought(D, ml) {
  const start = int(D?.LOOP?.hold?.start, 3) || 3;
  return Math.max(0, int(ml?.holdSlots, start) - start - Math.round(carryOf(ml).slots));
}
/**
 * What a first tow from the gear water adds to the carry (LAKE2 §5.3): per tackle slot ceil(H × share), H the Hold of the best piece
 * bought there (its bought tier; the start piece and a found piece are never counted); the cast ceil((the best bought rod's cast beyond the
 * start rod's) × share); the hold ceil(B × share), B its slots bought there; each raft part its levels bought there × share (unrounded).
 * → {rod, line, reel, cast, slots, raft: {oars, keel, lantern}}.
 */
export function carryAdd(D, ml) {
  const C = D?.LOOP?.carry || {}, share = num(C.share, 1 / 3), w = gearWaterOf(D, ml), out = freshCarry();
  const up = C.round === 'up' || C.round == null ? roundUp : (x) => Math.max(0, Math.round(x));
  for (const s of arr(C.tackle).length ? C.tackle : TACKLE_SLOTS) {
    const t = Math.max(0, int(ml?.tackle?.[s]));
    out[s] = t >= 1 ? up(tierHold(D, w, s, t) * share) : 0;
  }
  if (C.cast !== false) {
    const t = Math.max(0, int(ml?.tackle?.rod)), tier = tiersOf(D, w, 'rod')[t];
    const m = t >= 1 ? (tier && Number.isFinite(Number(tier.cast)) ? Number(tier.cast) : num(D?.TACKLE?.rod?.[Math.min(4, t)]?.castMax, 16) - num(C.castFrom, 16)) : 0;
    out.cast = m > 0 ? up(m * share) : 0;
  }
  if (C.slots !== false) out.slots = up(holdBought(D, ml) * share);
  for (const p of arr(C.raft).length ? C.raft : RAFT_PARTS) out.raft[p] = Math.max(0, int(ml?.raft?.[p])) * share;
  return out;
}
/** A water's start kit (GEAR-GATES §2.1's shape): the first water's LOOP.start, a later water's LOOP.start[water]. → {lures, bait, fit}. */
export function startKitAt(D, water) {
  const ST = isObj(D?.LOOP?.start) ? D.LOOP.start : {}, K = water === firstWaterOf(D) ? ST : isObj(ST[water]) ? ST[water] : {};
  const Ls = isObj(D?.LOOP?.lures) ? D.LOOP.lures : {};
  const lures = arr(K.lures).filter((id, i, a) => typeof id === 'string' && isObj(Ls[id]) && a.indexOf(id) === i);
  const bait = {};
  for (const [id, n] of Object.entries(isObj(K.bait) ? K.bait : {})) if (int(n) > 0) bait[id] = int(n);
  return { lures, bait, fit: typeof K.fit === 'string' && bait[K.fit] > 0 ? K.fit : null };
}
/**
 * The first tow to a new water (LAKE2 §5.2, §5.3, the user's answer 1), in place on meta.loop: the carry grows by carryAdd; everything
 * bought at the water left stays there (the tackle's tiers to the start pieces, a fitted tier off, the hold to its start plus the carried
 * slots, the raft's parts to none); the new water's start kit is given once (its free lure owned, a tin of its plain bait in its bag,
 * fitted); its evenings start at 0. Found pieces stay fitted and owned; lures and tins stay owned at their own water; clams, the barge, the
 * home and the record are untouched. → {from, to, add, carry}.
 */
export function applyTow(D, ml, to) {
  const from = gearWaterOf(D, ml), add = carryAdd(D, ml), c = carryOf(ml);
  for (const k of ['rod', 'line', 'reel', 'cast', 'slots']) c[k] += add[k];
  for (const p of RAFT_PARTS) c.raft[p] += add.raft[p];
  ml.carry = c;
  ml.tackle = { rod: 0, line: 0, reel: 0 };
  const fit = isObj(ml.fit) ? ml.fit : {};
  ml.fit = Object.fromEntries(TACKLE_SLOTS.map((s) => [s, typeof fit[s] === 'string' && D?.LOOP?.lostTackle?.[fit[s]] ? fit[s] : null]));   // (a found piece stays fitted)
  const start = int(D?.LOOP?.hold?.start, 3) || 3;
  ml.holdSlots = start + Math.round(c.slots);
  ml.raft = { oars: 0, keel: 0, lantern: 0 };
  ml.gearWater = to;
  const kit = startKitAt(D, to);
  if (!Array.isArray(ml.lures)) ml.lures = [];
  for (const id of kit.lures) if (!ml.lures.includes(id)) ml.lures.push(id);
  if (!isObj(ml.bait)) ml.bait = {};
  const bag = isObj(ml.bait[to]) ? ml.bait[to] : (ml.bait[to] = {});
  for (const [id, n] of Object.entries(kit.bait)) bag[id] = Math.max(0, int(bag[id])) + n;
  if (!isObj(ml.fitted)) ml.fitted = { lure: null, bait: null };
  const foundLure = typeof ml.fitted.lure === 'string' && D?.LOOP?.lures?.[ml.fitted.lure]?.found === true;
  if (!foundLure) ml.fitted = { lure: kit.fit ? null : kit.lures[0] ?? null, bait: kit.fit };
  if (!isObj(ml.eveningsAt)) ml.eveningsAt = {};
  ml.eveningsAt[to] = 0;
  return { from, to, add, carry: carryOf(ml) };
}
/** What the leaving card shows (LAKE2 §5.2) for a first tow to `to`, without writing: {to, from, first (a first tow: the card is due),
 *  add, carry (after the tow), line ("Carried +2 · +2 · +2": TEXT_LOOP.carry with the carry after)}. */
export function leaveTerms(D, ml, to) {
  const towed = arr(ml?.barge?.towed), first = typeof to === 'string' && to !== firstWaterOf(D) && !towed.includes(to);
  const add = first ? carryAdd(D, ml) : freshCarry(), c = carryOf(ml);
  const after = { ...c, raft: { ...c.raft } };
  for (const k of ['rod', 'line', 'reel', 'cast', 'slots']) after[k] += add[k];
  for (const p of RAFT_PARTS) after.raft[p] += add.raft[p];
  return { to, from: gearWaterOf(D, ml), first, add, carry: after, line: carryText(D, after) };
}
const carryText = (D, c) => String(D?.TEXT_LOOP?.carry ?? 'Carried {r} · {l} · {c}').replace('{r}', `+${c.rod}`).replace('{l}', `+${c.line}`).replace('{c}', `+${c.reel}`);
/** The carried line for the logs (the Wick's sheet at Tackle, the Tackle screen's head): "Carried +2 · +2 · +2", or null with nothing
 *  carried (the Mossmere's whole first age). */
export function carriedLine(D, ml) {
  const c = carryOf(ml);
  return c.rod > 0 || c.line > 0 || c.reel > 0 ? carryText(D, c) : null;
}
/** Is a lure usable at a water (LAKE2 §5.2, §5.7): its own water's, or a found one (found things travel)? */
export function lureHere(D, id, water) {
  const L = D?.LOOP?.lures?.[id];
  return isObj(L) && (L.found === true || !water || L.water === water);
}
/**
 * The first evenings at a water reached by a tow (LOOP.arrival, the user's answer 2): on its k-th evening there (k = evenings fished there
 * + 1, k ≤ arrival.evenings) a fish over the gear's cap lands at the cap (`cap`) and the water's Fight term is eased by fight[k − 1]. The
 * first water (the opening's) and a water not yet towed to have none. → {k, cap: bool, fight} or null.
 */
export function arrivalOf(D, ml, water) {
  const A = D?.LOOP?.arrival;
  if (!isObj(A) || typeof water !== 'string' || water === firstWaterOf(D) || !arr(ml?.barge?.towed).includes(water)) return null;
  const k = Math.max(0, int(ml?.eveningsAt?.[water])) + 1;
  if (k > int(A.evenings, 0)) return null;
  return { k, cap: A.cap === 'cap', fight: num(arr(A.fight)[k - 1], 0) };
}
/** The line's size cap by its total Hold at a water (LAKE2 §5.6: LOOP.gearCap.lineAt[water] = {trophy, elder}): 'prize' below `trophy`,
 *  'trophy' below `elder`, else 'elder'; null when the water has no lineAt (the tier's rule then stands). */
export function lineCapAt(D, water, lineHold) {
  const T = D?.LOOP?.gearCap?.lineAt?.[water];
  if (!isObj(T) || !Number.isFinite(Number(lineHold))) return null;
  const h = Number(lineHold);
  return h < num(T.trophy, Infinity) ? 'prize' : h < num(T.elder, Infinity) ? 'trophy' : 'elder';
}
