// loop-sheet.js — the Wick's sheet, "Taper's Sheet" (docs/loop/SHEET.md v2 §7; SPEC v8.8 §8.12, decisions 105–110; the user's answers
// 41–43): the one pure model of the page where the player sees their gear's quality, what they own as upgrades, what each does to their
// chances, their buffs and their odds. Pure: no DOM, no three.js and no import of data.js or progression-loop.js (the data module `D` and
// Murk's shelf come in through the arguments), so the node tests, the view and the game read the same numbers. Every figure is computed
// from the functions the bite roll draws from: watercraft.castOdds / openMix with the roll's rarity bonus, data.catchParts with the
// struck strike, and the size roll's own truncated normal (fishing-reel.normCdf, capZ). Nothing here is typed: a figure that cannot be
// computed is null and the view draws nothing for it.
//
//   sheetModel(meta, D, {run, view, live, cast, shelf})   the page (ids and numbers; ui-sheet.sheetView turns them into words)
//   sheetKeys(metaLoop, D)                                every owned key a "new" mark can carry (SHEET §5.2)
//   sizeOdds(mu, {min, cap, classes, ancient})            the size roll's class shares: {small … elder, ancient}
//   favourHere(D, metaLoop, {place, light, bait, lure, quiet, mercy})   a plain cast's favour terms, μ, notches and family μs
//   moveOf(D, ctx, term, {next})                          a buff's or a Next line's move {what, from, to} (SHEET §3.3)
//   passiveExact(D, wickId, waterId)                      the exact line's numbers
//   LIGHT_PHASE                                           the page's light → the game's phase (day calm, dusk dusk, night gloomtide)
import * as WC from './watercraft.js';
import { normCdf, capZ, sumFavour } from './fishing-reel.js';
import { raftStats, raftTerms, orderCount } from './loop-gear.js';
import { owned as findOwned, findsOf, findBiteBonus, findBaitFloor, foundKit, ownedNotes } from './loop-finds.js';
import { baitBedFloor } from './home-shelf.js';

const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const int = (v, d = 0) => Math.trunc(num(v, d));
const arr = (v) => (Array.isArray(v) ? v : []);
const r2 = (v) => Math.round(v * 100) / 100;

/** The page's hours as the game's phases (SHEET §7.2): fishing.baseTerms adds Night Rise only for 'gloomtide', raftTerms the Lantern. */
export const LIGHT_PHASE = Object.freeze({ day: 'calm', dusk: 'dusk', night: 'gloomtide' });
export const LIGHTS = Object.freeze(['day', 'dusk', 'night']);
export const SHEET_CLASSES = Object.freeze(['small', 'keeper', 'prize', 'trophy', 'elder']);
const SLOTS = ['rod', 'line', 'reel'];
// the built size ladder (data.SIZE_CLASSES' zMax; an Ancient z ≥ 3.2), the defaults sizeOdds uses when no ladder is passed
const LADDER = [['small', -0.25], ['keeper', 1.04], ['prize', 1.88], ['trophy', 2.65], ['elder', Infinity]];

/** The size roll's class shares for z ~ N(μ, 1) truncated to [min, cap] (fishing-reel.rollZ's law; data.classOdds at the floor −2).
 *  opts.classes [[id, zMax], …] (data.SIZE_CLASSES), opts.ancient (BALANCE.size.ancient). → {small, keeper, prize, trophy, elder, ancient}. */
export function sizeOdds(mu, { min = -2, cap = 3.6, classes = LADDER, ancient = 3.2 } = {}) {
  const m = num(mu, 0), hi = Math.max(min, num(cap, 3.6));
  const P = (a) => normCdf(Math.min(a, hi) - m);
  const lo = P(min), n = P(hi) - lo, out = {};
  if (!(n > 1e-12)) { for (const [id] of classes) out[id] = 0; out.ancient = 0; return out; }
  let prev = lo;
  for (const [id, zMax] of classes) { const p = Math.max(P(Math.max(zMax, min)), prev); out[id] = Math.max(0, p - prev) / n; prev = p; }
  out.ancient = Math.max(0, P(hi) - P(Math.max(ancient, min))) / n;
  return out;
}
const ladderOf = (D) => (arr(D?.SIZE_CLASSES).length ? D.SIZE_CLASSES.map((c) => [c.id, num(c.zMax, Infinity)]) : LADDER);
const sizeCfg = (D) => D?.BALANCE_V3?.size || D?.BALANCE?.size || {};
const favCfg = (D) => D?.BALANCE?.favour || D?.BALANCE_V3?.favour || {};
const capOf = (D, sp, place) => capZ({ species: sp || {}, place: place || null, size: sizeCfg(D), loop: true });
const floorOf = (D, sp) => (sp?.giant ? Math.max(num(sizeCfg(D).z?.min, -2), num(D?.LOOP?.giant?.minZ, -0.25)) : num(sizeCfg(D).z?.min, -2));
const shares = (D, mu, min, cap) => sizeOdds(mu, { min, cap, classes: ladderOf(D), ancient: num(sizeCfg(D).ancient, 3.2) });

/** A place's record for the loop (data.loopPlace: its kind, name, giant, legend), or null. */
const placeRec = (D, id) => (id ? (typeof D?.loopPlace === 'function' ? D.loopPlace(id) : null) || (isObj(D?.LOOP?.places?.[id]) ? { id, ...D.LOOP.places[id] } : null) : null);
const lureRec = (D, id) => (id ? arr(D?.LURES).find((l) => l?.id === id) || null : null);
const baitRec = (D, id) => (id ? arr(D?.BAITS).find((b) => b?.id === id) || null : null);
const legendBaitOf = (D, water = 'mossmere') => D?.LOOP?.legendBait?.[water]?.id ?? null;
const spOf = (D, id) => D?.SPECIES_BY_ID?.[id] || arr(D?.SPECIES).find((s) => s?.id === id) || null;
const metOf = (meta, id) => { const j = meta?.journal?.[id]; return !!j && (num(j.caught) > 0 || !!j.seen); };

/**
 * A plain cast's favour (SHEET §3.5 "Bigger fish here", §7.2): the species-independent terms fishing.baseTerms builds under the loop (the
 * place's LOOP.place.favour, the hour's, the tin's, the Keel and the Lantern; on a trip the water's quiet and let-go terms), no sign, no
 * clean cast, no depth band. `light` is the page's ('day' | 'dusk' | 'night'), mapped to the game's phase. → {terms, mu, notches,
 * families: {predator?, bottom?}: each family's μ where a term on the hook favours it, phase}.
 */
export function favourHere(D, metaLoop, { place = null, light = 'dusk', bait = null, lure = null, quiet = 0, mercy = 0 } = {}) {
  const F = favCfg(D), T = F.tackle || {}, H = F.hour || {}, phase = LIGHT_PHASE[light] || 'calm', terms = [];
  const P = typeof place === 'string' ? placeRec(D, place) : place;
  if (P && !(P.kind === 'night' && phase !== 'gloomtide')) {
    const LF = D?.LOOP?.place?.favour;
    if (LF) terms.push({ family: 'place', id: P.id, kind: P.kind, value: r2(num(LF.base, 0.15) + num(LF.window?.[P.kind], 0)) });
  }
  if (phase === 'dusk') terms.push({ family: 'hour', id: 'dusk', value: num(H.dusk, 0.2) });
  else if (phase === 'gloomtide') terms.push({ family: 'hour', id: 'nightRise', value: num(H.nightRise, 0.25) });
  const b = bait && bait === legendBaitOf(D) ? null : bait;   // the ball is a bare hook to every fish but her (castInfo)
  if (b) { const bv = num(T.bait?.[b], num(baitRec(D, b)?.bonus?.weightBias, 0)); if (bv) terms.push({ family: 'tackle', id: b, value: bv }); }
  const L = lureRec(D, lure);
  if (L && !L.family && (!L.night || phase === 'gloomtide')) { const lv = num(T.lure?.[L.id], num(L.favour, 0)); if (lv) terms.push({ family: 'tackle', id: L.id, value: lv }); }
  if (!b && !L && num(D?.LOOP?.bare?.favour, 0)) terms.push({ family: 'tackle', id: 'bare', value: num(D.LOOP.bare.favour, 0) });   // (GEAR-GATES §2.2, fishing.baseTerms)
  if (num(quiet)) terms.push({ family: 'quiet', id: 'quiet', value: num(quiet) });
  if (num(mercy)) terms.push({ family: 'letGo', id: 'letGo', value: num(mercy) });
  terms.push(...raftTerms(D, metaLoop, phase));
  const cap = num(F.cap, 1.8), mu = sumFavour(terms, cap);
  const families = {};
  for (const fam of ['predator', 'bottom']) {
    const extra = famTerms(D, fam, { bait: b, lure });
    if (extra.length) families[fam] = { mu: sumFavour([...terms, ...extra], cap), terms: extra };
  }
  return { terms, mu, notches: notchesOf(D, mu), families, phase };
}
/** The species terms a family takes from the hook (fishing.speciesTerms: a family lure's favour, Cut Strip's on predators). */
function famTerms(D, family, { bait = null, lure = null } = {}) {
  const T = favCfg(D).tackle || {}, out = [];
  if (bait === 'cut_strip' && family === 'predator') out.push({ family: 'tackle', id: 'cutStrip', value: num(T.cutStrip, 0.3) });
  const L = lureRec(D, lure);
  if (L?.family && L.family === family) { const v = num(T.lure?.[L.id], num(L.favour, 0)); if (v) out.push({ family: 'tackle', id: L.id, value: v }); }
  return out;
}
const notchesOf = (D, mu) => { let n = 0; for (const t of arr(favCfg(D).notches)) if (mu >= t) n++; return n; };
/** A fish's full μ at a plain cast (its family's terms and a giant's own: fishing.speciesTerms on top of the base). */
function fishMu(D, here, sp, hook) {
  const cap = num(favCfg(D).cap, 1.8), extra = famTerms(D, sp?.family, hook);
  if (sp?.giant) extra.push({ family: 'place', id: 'giant', value: num(D?.LOOP?.giant?.favour, 0.3) });
  return sumFavour([...here.terms, ...extra], cap);
}

/** The exact line's numbers (SHEET §3.1): filled from LOOP.wicks, never typed. → {id, values}. */
export function passiveExact(D, wickId, waterId = 'mossmere') {
  const id = typeof D?.loopWickId === 'function' ? D.loopWickId(wickId) : (wickId || 'wick');
  const K = D?.LOOP?.wicks?.[id] || {}, tier = num(D?.LOOP?.waters?.[waterId]?.tier, 7), stale = D?.LOOP?.water?.stale || {};
  const values = {
    wick: { mult: num(K.firstMult, 1), floor: Math.round(num(K.firstFloor, 0) * tier) },
    taper: { share: num(K.giantShare, 1), cap: Math.round(num(K.giantCap, 0) * 100) },
    stub: { sooner: r2(1 / num(K.waitMul, 1)), quiet: Math.round(num(K.quietStep, 0) / Math.abs(num(stale.favour, -0.15)) * 10) / 10 },
    tallow: { good: num(K.good, 0) },
    ashwick: { hold: num(K.hold, 0) },
  }[id] || {};
  return { id, values };
}

/** Every owned key a "new" mark can carry (SHEET §5.2): the tackle's tiers, the creel's step, the raft's and the home's levels, each lure,
 *  each look and each found part or look (consumables never). */
export function sheetKeys(metaLoop, D) {
  const L = isObj(metaLoop) ? metaLoop : {}, out = [];
  for (const s of SLOTS) { const t = int(L.tackle?.[s]); if (t >= 1) out.push(`${s}:${t}`); }
  const start = int(D?.LOOP?.hold?.start, 3), h = int(L.holdSlots, start);
  if (h > start) out.push(`hold:${h}`);
  for (const s of ['oars', 'keel', 'lantern']) { const v = int(L.raft?.[s]); if (v >= 1) out.push(`${s}:${v}`); }
  for (const s of ['orders', 'baitBed', 'wall', 'lights']) { const v = int(L.home?.[s]); if (v >= 1) out.push(`${s}:${v}`); }
  for (const id of arr(L.lures)) if (typeof id === 'string') out.push(`lure:${id}`);
  for (const id of arr(L.looks)) if (typeof id === 'string') out.push(`look:${id}`);
  for (const it of arr(D?.LOOP?.finds?.items)) if (it && (it.kind === 'part' || it.kind === 'look') && findOwned(L, it.id)) out.push(`find:${it.id}`);
  return out;
}

/** The kit the land roll reads: the tackle's tiers and the hook (the lure as the item, the bait as the upgrade; the larger Hold counts). */
const kitOf = (tackle, hook) => ({ rod: int(tackle?.rod), line: int(tackle?.line), reel: int(tackle?.reel), item: hook?.lure || null,
  upgrade: hook?.bait ? { id: hook.bait } : undefined });
const landOf = (D, id, cls, kit) => { const p = D?.catchParts?.(id, cls, kit, { strike: 'struck' }); return p ? p.p : null; };

/**
 * Who bites at the picks (SHEET §3.5, §7.2): a place's castOdds (area null), the open water's openMix at that hour, or the last cast's
 * area (the user's answer 41: "where you last cast", the area never named), on this hook with the roll's rarity bonus. A plain cast: no
 * sign, no pre-roll, no comeback, no Taper's first bite. → {id: share} (sums to 1) or {} with no water.
 */
export function whoBites(D, { place = null, area = null, light = 'dusk', lure = null, bait = null, wickId = null, rb = 0, water = 'mossmere', notes = null } = {}) {
  const phase = LIGHT_PHASE[light] || 'calm';
  const P = typeof place === 'string' ? placeRec(D, place) : place;
  if (!P && !area) return WC.openMix(D, { light, lure, bait, wickId, rb, notes });
  const pool = D.placePool(arr(D.SPECIES), { placeId: P?.id ?? null, phase, bait, wickId, water });
  const odds = WC.castOdds(D, { pool, area: P ? null : area, phase, lure, bait, wickId, rb, notes });
  const out = {};
  for (const e of arr(odds.entries)) if (e.sp?.id) out[e.sp.id] = (out[e.sp.id] || 0) + num(e.p);
  return out;
}

/** The rarity bonus of a plain cast (SHEET §7.2): the stats' and the bait's (fishing.rollBite, less the spot, the clean cast and pity). */
export function plainRb(D, stats, bait) { return num(stats?.rarityBonus) + num(baitRec(D, bait)?.bonus?.rarityBonus); }

/** A move (SHEET §3.3): the share of bites in the class at μ without → with a term. → {what, from, to} or null (the same rounded figure). */
export function moveOf(D, { mu = 0, min = -2, cap = 2.64, cls = 'trophy' } = {}, term = 0, { next = false, night = false } = {}) {
  const a = shares(D, mu - num(term), min, cap)[cls], b = shares(D, mu, min, cap)[cls];
  if (!Number.isFinite(a) || !Number.isFinite(b) || Math.round(a * 100) === Math.round(b * 100)) return null;
  return { what: cls, from: a, to: b, next, night };
}

/**
 * The page (SHEET §7.1). meta: the save. opts:
 *   run    the trip's run on a trip (its lure, equippedBait, bait, character, stats), else null
 *   view   the page's picks {place: placeId | 'last' | null, light, cls} (undefined: the defaults of §3.5)
 *   live   on a trip {waterKey, place, light, quiet, mercy} (ui-sheet reads the raft's water and the hour), else null
 *   cast   the last cast {area, place} (fishing.lastCastArea, the user's answer 41), else null
 *   shelf  progression-loop.shelfItems(D, meta.loop) (prices with Murk's factor in)
 *   canChange  loop.canChangeHook() (the chips' taps: at home and on a trip, never while a fish is on); default true
 */
export function sheetModel(meta, D, { run = null, view = {}, live = null, cast = null, shelf = [], stats = null, canChange = true } = {}) {
  const ml = isObj(meta?.loop) ? meta.loop : {}, water = ml.barge?.water || arr(ml.maps?.lakes)[0] || 'mossmere';
  const trip = !!run && run.outing === 'trip';
  const wickId = typeof D?.loopWickId === 'function' ? D.loopWickId(trip ? run.character : ml.wick) : (ml.wick || 'wick');
  const tackle = { rod: int(ml.tackle?.rod), line: int(ml.tackle?.line), reel: int(ml.tackle?.reel) };
  const v = isObj(view) ? view : {};
  // ---- the hook: the run's on a trip, the save's fitted at home (SHEET §3.2.1). The user's answer 43 ("at home only") was superseded on
  //      16 Nov 2026: the hook changes on the lake too, so canFit is loop.canChangeHook() (false only while a fish is on), CONTRACT §14.19
  const hookLure = trip ? (typeof run.lure === 'string' ? run.lure : null) : (ml.fitted?.lure ?? null);
  const hookBait = trip ? (run.equippedBait ?? null) : (ml.fitted?.bait ?? null);
  const bag = trip ? (isObj(run.bait) ? run.bait : {}) : (isObj(ml.bait?.[water]) ? ml.bait[water] : {});
  const lures = arr(ml.lures).filter((id) => typeof id === 'string' && isObj(D?.LOOP?.lures?.[id]));
  const baitIds = [...arr(D?.LOOP?.tins?.[water]), 'cut_strip', legendBaitOf(D, water)].filter(Boolean);
  const baits = baitIds.map((id) => ({ id, count: Math.max(0, int(bag[id])) })).filter((b) => b.count > 0 || b.id === hookBait);
  const hook = { lure: hookLure, bait: hookBait, tipped: !!hookLure && !!hookBait, lures, baits, canFit: canChange !== false };
  const kit = kitOf(tackle, hook);
  // LOST-TACKLE §3.2, §4: a fitted found piece's Hold in its slot's place, its line's cap, and the owned notebooks on Who bites
  const fk = foundKit(ml, D), notes = ownedNotes(ml, D);
  if (Object.keys(fk.hold).length) kit.hold = Object.fromEntries(SLOTS.map((s) => [s, fk.hold[s] ?? (typeof D?.tackleHoldAt === 'function' ? D.tackleHoldAt(s, tackle[s]) : 0)]));
  // ---- the picks (§3.5): where, the hour, the class
  const lifted = new Set(arr(ml.lifted)), places = arr(ml.maps?.places).filter((id) => lifted.has(id) && placeRec(D, id));
  const lastArea = cast && !cast.place && typeof cast.area === 'string' && WC.AREAS.includes(cast.area) ? cast.area : null;
  const choices = [{ id: null, kind: 'open' }, ...(lastArea ? [{ id: 'last', kind: 'last' }] : []), ...places.map((id) => ({ id, kind: placeRec(D, id)?.kind || 'day' }))];
  const valid = (id) => choices.some((c) => c.id === id);
  let place;
  if (v.place !== undefined && valid(v.place)) place = v.place;
  else if (cast?.place && valid(cast.place)) place = cast.place;
  else if (lastArea) place = 'last';
  else if (live && live.place && valid(live.place)) place = live.place;
  else if (!trip && ml.chartPick?.place && valid(ml.chartPick.place)) place = ml.chartPick.place;
  else place = null;
  const P = place && place !== 'last' ? placeRec(D, place) : null;
  let light = LIGHTS.includes(v.light) ? v.light : (live && LIGHTS.includes(live.light) ? live.light : 'dusk');
  const nightOnly = P?.kind === 'night';
  if (nightOnly) light = 'night';
  const phase = LIGHT_PHASE[light];
  const pin = isObj(meta?.gearPin) && metOf(meta, meta.gearPin.speciesId) ? meta.gearPin : null;
  const cls = SHEET_CLASSES.includes(v.cls) ? v.cls : SHEET_CLASSES.includes(pin?.sizeClass) ? pin.sizeClass : 'trophy';
  // the trip's own terms at the water the raft is on (§3.4): the quiet and the let-go
  const liveKey = live?.waterKey ?? null, hereKey = P ? P.id : `open:${water}`;
  const atLive = trip && liveKey && liveKey === hereKey;
  const quiet = atLive ? num(live.quiet) : 0, mercy = atLive ? num(live.mercy) : 0;
  const here = favourHere(D, ml, { place: P, light, bait: hookBait, lure: hookLure, quiet, mercy });
  const rb = plainRb(D, stats || run?.stats || null, hookBait);
  // ---- the reference fish and class (§3.2): the pin, else the water's reference once met, else the first met fish of the list
  const listIds = arr(D?.LOOP?.species?.[water]);
  const refId = pin?.speciesId || (metOf(meta, D?.TACKLE?.reference?.[water]) ? D.TACKLE.reference[water] : listIds.find((id) => metOf(meta, id)) || null);
  const ref = refId ? { speciesId: refId, cls, pinned: !!pin && pin.speciesId === refId } : null;
  const refLand = (k) => (ref ? landOf(D, ref.speciesId, ref.cls, k) : null);
  const cmp = (a, b) => (a == null || b == null || num(D.catchDisplay?.(a), Math.floor(a * 100)) === num(D.catchDisplay?.(b), Math.floor(b * 100)) ? null : { from: a, to: b });
  const shelfOf = (slot) => arr(shelf).find((c) => c && c.slot === slot && !c.bought) || null;
  const seen = new Set(arr(ml.sheetSeen)), freshKeys = sheetKeys(ml, D).filter((k) => !seen.has(k)), isFresh = (k) => freshKeys.includes(k);
  const ownedOrd = new Set([1, ...arr(ml.maps?.lakes).map((id) => num(D?.LOOP?.waters?.[id]?.order, NaN)).filter(Number.isFinite)]);
  // ---- Tackle (§3.2)
  const TT = D?.LOOP?.tackle || {}, tierTop = Math.max(0, arr(TT.price).length - 1);
  const tierOf = arr(TT.shelfAt).map((w, t) => (t >= 1 && t <= Math.min(4, tierTop) && ownedOrd.has(num(w, 99)) ? t : 0)).filter(Boolean);
  const slots = SLOTS.map((slot) => {
    const t = tackle[slot], fid = fk[slot], LT = fid ? D?.LOOP?.lostTackle?.[fid] || {} : null, nx = shelfOf(slot);
    // (a fitted found piece stands in for the tier: its name and its own values, LOST-TACKLE §3.2)
    const rec = LT ? { ...LT, name: D?.TEXT_LOOP?.finds?.items?.[fid]?.name || fid, hold: fk.hold[slot] } : D?.TACKLE?.[slot]?.[t] || {};
    const values = { hold: num(rec.hold) };
    if (slot === 'rod') { values.castMax = num(rec.castMax); values.strike = Math.round((num(rec.hookWindow, 1) - 1) * 100); }
    const next = nx ? { key: nx.id, id: nx.id, name: nx.name, price: nx.price, compare: cmp(refLand(kit), refLand({ ...kit, [slot]: int(nx.level) })) } : null;
    return { key: `${slot}:${t}`, slot, level: t, name: rec.name || '', owned: true, found: fid || null, notches: { on: Math.min(t, tierOf.length), of: tierOf.length },
      values, figure: slot === 'rod' ? { m: values.castMax } : { hold: values.hold }, next, fresh: t >= 1 && isFresh(`${slot}:${t}`) };
  });
  const rating = D?.TACKLE?.reference?.[water] && metOf(meta, D.TACKLE.reference[water]) && typeof D.catchRating === 'function'
    ? D.catchRating(water, kit) : null;
  // the hook's two plates: each with the fish it suits (gradeTargets, the met ones counted) and its compare for the reference fish
  const suits = (id) => { const t = WC.gradeTargets(id, D); return { n: t.length, met: t.filter((x) => metOf(meta, x)).length }; };
  const hookPlate = (kind, id) => {
    if (!id) return { kind, id: null };
    const legend = id === legendBaitOf(D, water);
    const holdOf = num(D?.CATCH_V3?.items?.[id]?.hold, 0);
    const without = kind === 'lure' ? { ...kit, item: null } : { ...kit, upgrade: undefined };
    return { kind, id, legend, hold: legend ? 0 : holdOf, suits: legend ? null : suits(id), count: kind === 'bait' ? Math.max(0, int(bag[id])) : null,
      compare: legend ? null : cmp(refLand(without), refLand(kit)), fresh: kind === 'lure' && isFresh(`lure:${id}`) };
  };
  hook.plates = { lure: hookPlate('lure', hookLure), bait: hookPlate('bait', hookBait) };
  // ---- Raft and Home (§3.3)
  const H = D?.LOOP?.hold || {}, start = int(H.start, 3), hs = int(ml.holdSlots, start);
  const ladder = arr(H.ladder).filter((s) => int(s.slots) <= int(H.shelfMax, 6));
  const wickSlots = (n) => (typeof D?.wickSlots === 'function' ? D.wickSlots(n, wickId) : n);
  const goodOpen = (n) => (typeof D?.goodBitesFor === 'function' ? D.goodBitesFor({ kind: 'open', holdSlots: n, wickId, extra: findBiteBonus(ml, D, water) }) : 0);
  const creelNx = shelfOf('hold');
  const raft = [{
    key: `hold:${hs}`, slot: 'hold', level: hs, name: hs <= start ? (H.startName || '') : (arr(H.ladder).find((s) => int(s.slots) === hs)?.name || ''), owned: true,
    notches: { on: Math.max(0, Math.min(ladder.length, hs - start)), of: ladder.length }, values: { slots: wickSlots(hs), extra: wickSlots(hs) - hs, good: goodOpen(hs) },
    figure: { slots: wickSlots(hs) },
    next: creelNx ? { key: creelNx.id, id: creelNx.id, name: creelNx.name, price: creelNx.price, slots: wickSlots(int(creelNx.level)), good: goodOpen(int(creelNx.level)) } : null,
    fresh: hs > start && isFresh(`hold:${hs}`),
  }];
  const ladderPlate = (tab, slot, R, cur, nameOf) => {
    const prices = arr(R?.prices), w = arr(R?.with), of = prices.filter((_, i) => ownedOrd.has(num(w[i], 1))).length;
    const nx = shelfOf(slot);
    return { key: `${slot}:${cur}`, slot, level: cur, name: cur >= 1 ? nameOf(cur) : nameOf(1), owned: cur >= 1, notches: { on: Math.min(cur, of), of },
      values: {}, figure: null, next: nx ? { key: nx.id, id: nx.id, name: nx.name, price: nx.price, level: int(nx.level) } : null, fresh: cur >= 1 && isFresh(`${slot}:${cur}`) };
  };
  const gearName = (slot) => (lv) => D?.TEXT_LOOP?.gearNames?.[slot]?.[lv - 1] ?? `${slot} ${lv}`;
  const homeName = (slot) => (lv) => D?.TEXT_LOOP?.homeNames?.[slot]?.[lv - 1] ?? `${slot} ${lv}`;
  const R = D?.LOOP?.raft || {}, cap = (sp) => capOf(D, sp, P);
  const plainCap = cap({}), plainMin = num(sizeCfg(D).z?.min, -2);
  const oars = ladderPlate('raft', 'oars', R.oars, int(ml.raft?.oars), gearName('oars'));
  oars.values = { speed: raftStats(D, ml).speed }; oars.figure = oars.owned ? { speed: oars.values.speed } : null;
  if (oars.next) oars.next.speed = r2(int(oars.next.level) * num(R.oars?.speed, 1.5));
  const keel = ladderPlate('raft', 'keel', R.keel, int(ml.raft?.keel), gearName('keel'));
  const keelV = int(ml.raft?.keel) * num(R.keel?.favour, 0.1);
  keel.move = keel.owned ? moveOf(D, { mu: here.mu, min: plainMin, cap: plainCap, cls }, keelV) : null;
  keel.figure = keel.move ? { what: cls, to: keel.move.to } : null;
  if (keel.next) keel.next.move = nextMove(D, ml, { place: P, light, hook, cls, slot: 'keel', level: keel.next.level, quiet, mercy });
  const lantern = ladderPlate('raft', 'lantern', R.lantern, int(ml.raft?.lantern), gearName('lantern'));
  {
    const night = favourHere(D, ml, { place: P, light: 'night', bait: hookBait, lure: hookLure }), lv = int(ml.raft?.lantern) * num(R.lantern?.favour, 0.1);
    const ncap = capOf(D, {}, P);
    lantern.move = lantern.owned ? moveOf(D, { mu: night.mu, min: plainMin, cap: ncap, cls }, lv, { night: true }) : null;
    lantern.figure = lantern.move ? { what: cls, to: lantern.move.to, night: true } : null;
    if (lantern.next) lantern.next.move = nextMove(D, ml, { place: P, light: 'night', hook, cls, slot: 'lantern', level: lantern.next.level });
  }
  raft.push(oars, keel, lantern);
  const HM = D?.LOOP?.home || {};
  const orders = ladderPlate('home', 'orders', HM.orders, int(ml.home?.orders), gearName('orders'));
  orders.values = { count: orderCount(D, ml) }; orders.figure = orders.owned ? { ticks: orders.values.count } : null;
  if (orders.next) orders.next.count = orderCount(D, { ...ml, home: { ...(ml.home || {}), orders: int(orders.next.level) } });
  const bed = ladderPlate('home', 'baitBed', HM.baitBed, int(ml.home?.baitBed), homeName('baitBed'));
  const bedF = baitBedFloor(D, ml, water);
  bed.values = { n: bedF?.n ?? 0, baitId: bedF?.baitId ?? null }; bed.figure = bed.owned ? { n: bed.values.n } : null;
  if (bed.next) bed.next.n = baitBedFloor(D, { ...ml, home: { ...(ml.home || {}), baitBed: int(bed.next.level) } }, water)?.n ?? null;
  const wall = ladderPlate('home', 'wall', HM.wall, int(ml.home?.wall), homeName('wall'));
  const lights = ladderPlate('home', 'lights', HM.lights, int(ml.home?.lights), homeName('lights'));
  const home = [orders, bed, wall, lights];
  // the found parts (had or not: a part not had is not drawn) and the looks, by what wears them
  const parts = findsOf(D, water).filter((it) => it.kind === 'part' && findOwned(ml, it.id)).map((it) => {
    const eff = it.effect === 'order' ? { glyph: 'tick', n: 1, on: int(ml.home?.orders) >= 1 } : it.effect === 'bite' ? { glyph: 'dot', n: 1, on: true }
      : { glyph: 'tin', n: findBaitFloor(ml, D, water, 0).floor, on: true };
    return { key: `find:${it.id}`, id: it.id, effect: eff, fresh: isFresh(`find:${it.id}`) };
  });
  const looks = { wick: [], raft: [], barge: [] };
  for (const id of arr(ml.looks)) { const on = D?.LOOP?.looks?.[id]?.on; const k = on === 'wick' ? 'wick' : on === 'raft' ? 'raft' : 'barge'; looks[k].push({ key: `look:${id}`, id, found: false, fresh: isFresh(`look:${id}`) }); }
  for (const it of findsOf(D, water)) if (it.kind === 'look' && findOwned(ml, it.id)) { const k = it.wearer === 'wick' ? 'wick' : it.wearer === 'raft' ? 'raft' : 'barge'; looks[k].push({ key: `find:${it.id}`, id: it.id, found: true, fresh: isFresh(`find:${it.id}`) }); }
  // ---- Who bites and your odds (§3.5)
  const legendId = P?.legend || D?.LOOP?.places?.[P?.id]?.legend || null, ball = legendBaitOf(D, water);
  const legendOn = !!legendId && hookBait === ball && (() => { const sp = spOf(D, legendId); const hrs = typeof D?.loopHours === 'function' ? D.loopHours(sp) : LIGHTS; return hrs.includes(light); })();
  const mix = legendOn ? { [legendId]: 1 } : whoBites(D, { place: P, area: place === 'last' ? lastArea : null, light, lure: hookLure, bait: hookBait, wickId, rb, water, notes });
  const rows = [];
  let unmet = 0;
  for (const [id, share] of Object.entries(mix)) {
    if (!(share > 0)) continue;
    if (!metOf(meta, id)) { unmet++; continue; }
    const sp = spOf(D, id);
    if (sp?.rarity === 'legendary') { rows.push({ id, giant: false, legend: true, pinned: pin?.speciesId === id, share, land: { legend: landOf(D, id, 'legend', kit) } }); continue; }
    const mu = fishMu(D, here, sp, { bait: hookBait, lure: hookLure }), so = shares(D, mu, floorOf(D, sp), capOf(D, sp, P));
    // GEAR-GATES §5.1: a class over the hook's and the line's size cap lands never (it gets away): its cell reads "—", as a class it cannot roll
    const gc = WC.gearCap(D, id, { lure: hookLure, bait: hookBait === ball ? null : hookBait, line: tackle.line, lineCap: fk.lineCap }), top = gc ? SHEET_CLASSES.indexOf(gc.cls) : SHEET_CLASSES.length - 1;
    const land = {};
    for (const c of SHEET_CLASSES) {
      if (SHEET_CLASSES.indexOf(c) > top) { land[c] = null; continue; }
      if (c === 'elder') {
        if (!(so.elder > 1e-9)) { land.elder = null; continue; }
        const a = Math.min(1, so.ancient / so.elder), pe = landOf(D, id, 'elder', kit), pa = landOf(D, id, 'ancient', kit);
        land.elder = pe == null ? null : (1 - a) * pe + a * (pa ?? pe);
      } else land[c] = so[c] > 1e-9 ? landOf(D, id, c, kit) : null;
    }
    rows.push({ id, giant: !!sp?.giant, legend: false, pinned: pin?.speciesId === id, share, land, grade: WC.gradeOf(id, { lure: hookLure, bait: hookBait }), cap: gc ? gc.cls : null,
      ...(sp?.guestOf ? { guest: true } : {}) });   // (LOST-TACKLE §6.2: a notebook's guest, its row marked with the notebook glyph)
  }
  rows.sort((a, b) => b.share - a.share || (a.id < b.id ? -1 : 1));
  // the size lines: the plain cast's, each favoured family's, the pinned fish's own where its terms differ
  const size = [{ label: null, mu: here.mu, shares: shares(D, here.mu, plainMin, plainCap) }];
  for (const [fam, f] of Object.entries(here.families)) size.push({ label: fam, mu: f.mu, shares: shares(D, f.mu, plainMin, plainCap) });
  if (pin && !legendOn) {
    const sp = spOf(D, pin.speciesId);
    if (sp && sp.rarity !== 'legendary') {
      const mu = fishMu(D, here, sp, { bait: hookBait, lure: hookLure }), mn = floorOf(D, sp), cp = capOf(D, sp, P);
      const famLine = size.find((s) => s.label === sp.family) || size[0];
      if (Math.abs(mu - famLine.mu) > 1e-9 || mn !== plainMin || cp !== plainCap) size.push({ label: sp.id, mu, shares: shares(D, mu, mn, cp), giant: !!sp.giant });
    }
  }
  // ---- Buffs (§3.4): what is on, each with its move at the picks
  const buffs = [{ key: 'passive', source: { kind: 'passive', id: wickId }, effect: { kind: 'exact', ...passiveExact(D, wickId, water) }, move: null }];
  const mv = (term, o = {}) => moveOf(D, { mu: o.mu ?? here.mu, min: plainMin, cap: o.cap ?? plainCap, cls }, term, o);
  const bt = here.terms.find((t) => t.family === 'tackle' && t.id === hookBait);
  if (hookBait && hookBait !== ball) {
    if (bt) buffs.push({ key: `bait:${hookBait}`, source: { kind: 'bait', id: hookBait }, effect: { kind: 'bigger', value: bt.value }, move: mv(bt.value) });
    const bs = num(baitRec(D, hookBait)?.bonus?.biteSpeed);
    if (bs > 0) buffs.push({ key: `bait:${hookBait}:sooner`, source: { kind: 'bait', id: hookBait }, effect: { kind: 'sooner', value: r2(1 + bs) }, move: null });
    const rbb = num(baitRec(D, hookBait)?.bonus?.rarityBonus);
    if (rbb > 0) {
      const base = legendOn ? {} : whoBites(D, { place: P, area: place === 'last' ? lastArea : null, light, lure: hookLure, bait: hookBait, wickId, rb: rb - rbb, water, notes });
      let best = null;
      for (const r of rows) { const d = r.share - num(base[r.id]); if (!best || d > best.d) best = { id: r.id, d, from: num(base[r.id]), to: r.share }; }
      buffs.push({ key: `bait:${hookBait}:rarer`, source: { kind: 'bait', id: hookBait }, effect: { kind: 'rarer', value: rbb },
        move: best && Math.round(best.from * 100) !== Math.round(best.to * 100) ? { what: best.id, from: best.from, to: best.to } : null });
    }
    if (hookBait === 'cut_strip' && here.families.predator) {
      const f = here.families.predator, t = f.terms.find((x) => x.id === 'cutStrip');
      if (t) buffs.push({ key: 'bait:cut_strip:family', source: { kind: 'bait', id: 'cut_strip' }, effect: { kind: 'family', family: 'predator', value: t.value }, move: mv(t.value, { mu: f.mu }) });
    }
  }
  if (hookLure) {
    const L = lureRec(D, hookLure), LL = D?.LOOP?.lures?.[hookLure] || {};
    if (L?.family && here.families[L.family]) {
      const f = here.families[L.family], t = f.terms.find((x) => x.id === hookLure);
      if (t) buffs.push({ key: `lure:${hookLure}`, source: { kind: 'lure', id: hookLure }, effect: { kind: 'family', family: L.family, value: t.value }, move: mv(t.value, { mu: f.mu }) });
    }
    if (arr(LL.giants).length) {
      let move = null;
      const g = pin && arr(LL.giants).includes(pin.speciesId) ? spOf(D, pin.speciesId) : null;
      if (g?.place) {
        const at = whoBites(D, { place: g.place, light, lure: hookLure, bait: hookBait, wickId, rb, water, notes })[g.id] ?? 0;
        const off = whoBites(D, { place: g.place, light, lure: null, bait: hookBait, wickId, rb, water, notes })[g.id] ?? 0;
        if (Math.round(at * 100) !== Math.round(off * 100)) move = { what: g.id, from: off, to: at };
      }
      buffs.push({ key: `lure:${hookLure}`, source: { kind: 'lure', id: hookLure }, effect: { kind: 'giants', value: num(LL.share, 1.5) }, move });
    }
  }
  if (keel.owned) buffs.push({ key: keel.key, source: { kind: 'raft', id: 'keel', level: keel.level }, effect: { kind: 'keel', value: r2(keelV) }, move: keel.move });
  if (lantern.owned) buffs.push({ key: lantern.key, source: { kind: 'raft', id: 'lantern', level: lantern.level }, effect: { kind: 'lantern', value: r2(int(ml.raft?.lantern) * num(R.lantern?.favour, 0.1)) }, move: lantern.move, night: true });
  buffs.push({ key: raft[0].key, source: { kind: 'creel', id: 'hold', level: hs }, effect: { kind: 'creel', value: raft[0].values.slots }, move: null });
  {
    const good = [{ id: null, n: goodOpen(hs) }];
    for (const id of places) { const k = placeRec(D, id)?.kind; if (typeof D?.goodBitesFor === 'function') good.push({ id, n: D.goodBitesFor({ kind: k, holdSlots: hs, wickId, place: id }) }); }
    buffs.push({ key: 'good', source: { kind: 'good', id: 'good' }, effect: { kind: 'good', list: good }, move: null });
  }
  for (const p of parts) if (p.id === 'gate_glass') buffs.push({ key: p.key, source: { kind: 'find', id: p.id }, effect: { kind: 'glass', value: 1 }, move: null });
  if (orders.owned) buffs.push({ key: orders.key, source: { kind: 'home', id: 'orders', level: orders.level }, effect: { kind: 'orders', value: orderCount(D, ml) }, move: null });
  if (bed.owned || parts.some((p) => p.id === 'moat_bollard')) {
    const floor = findBaitFloor(ml, D, water, bed.values.n);
    buffs.push({ key: bed.owned ? bed.key : 'find:moat_bollard', source: { kind: 'home', id: 'baitBed', level: bed.level }, effect: { kind: 'bed', value: floor.floor, baitId: bed.values.baitId || floor.baitId }, move: null });
  }
  if (oars.owned) buffs.push({ key: oars.key, source: { kind: 'raft', id: 'oars', level: oars.level }, effect: { kind: 'oars', value: oars.values.speed }, move: null });
  if (atLive && mercy) buffs.push({ key: 'letGo', source: { kind: 'trip', id: 'letGo' }, effect: { kind: 'letGo', value: mercy }, move: mv(mercy) });
  if (atLive && quiet) buffs.push({ key: 'quiet', source: { kind: 'trip', id: 'quiet' }, effect: { kind: 'quiet', value: quiet }, move: mv(quiet) });
  return {
    water, trip, wickId,
    picks: { place, light, phase, cls, choices, nightOnly, live: !!atLive },
    wick: { id: wickId, look: arr(ml.looks).filter((id) => D?.LOOP?.looks?.[id]?.on === 'wick'), passive: wickId, exact: passiveExact(D, wickId, water), worn: looks.wick },
    tackle: { rating, slots, hook, notes },   // (LOST-TACKLE §4: the owned notebooks, under the tackle)
    raft, raftLooks: looks.raft, home, parts, homeLooks: looks.barge,
    buffs,
    odds: { hook, here, size, rows, unmet, ref, legend: legendOn ? legendId : null },
    fresh: freshKeys,
  };
}
/** A Next line's move (SHEET §3.3): the share of bites in the class now → with the next level of the Keel or the Lantern. */
function nextMove(D, ml, { place, light, hook, cls, slot, level, quiet = 0, mercy = 0 }) {
  const now = favourHere(D, ml, { place, light, bait: hook.bait, lure: hook.lure, quiet, mercy });
  const nx = favourHere(D, { ...ml, raft: { ...(ml.raft || {}), [slot]: int(level) } }, { place, light, bait: hook.bait, lure: hook.lure, quiet, mercy });
  const min = num(sizeCfg(D).z?.min, -2), cap = capOf(D, {}, typeof place === 'string' ? placeRec(D, place) : place);
  const a = shares(D, now.mu, min, cap)[cls], b = shares(D, nx.mu, min, cap)[cls];
  if (Math.round(a * 100) === Math.round(b * 100)) return null;
  return { what: cls, from: a, to: b, next: true, night: light === 'night' };
}
