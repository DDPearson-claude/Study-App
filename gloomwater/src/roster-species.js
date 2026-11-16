// src/roster-species.js — the roster's converter (docs/loop/SPEC.md §13, M1 step 2; docs/v3/pounds/SPEC.md §6.4).
//
// One shared module, imported by data.js (the loop's SPECIES_LOOP) and by tools/sim/clams.mjs (its species table), so the game and
// the sim cannot drift. Pure: no DOM, no data.js import (data.js passes its tables in).
//
//   allowList(fish)                       a roster record cut to the allow-list (ROSTER_KEYS): what may reach src/
//   rosterSpecies(roster, built, opts)    game species records, one per roster fish per water, by SPEC §13's rules
//   hourKey(hours) · HOUR_WINDOWS         the roster's hour strings as LOOP.hours keys, and each one's window in the sim's words
//   styleOf(fish, legendStyle) · baitsOf(favours, items)   the play's style word; the tins a fish favours (and its one bait, if any)
//   rosterItemNames(D)                    the item names the favours text is read against: LURES, BAITS and the roster's own tins
//   placeIdOf(name)                       a roster place name as its place id ("Under the Span" → under_the_span; M1 step 3a)
//
// The allow-list (SPEC §13, the names rule of §0 row 17): only the fields below are ever copied out of docs/loop/roster.json. Every
// research field stays in docs/; validate-data fails if one of them (as a word), an episode title or a research name appears anywhere
// in src/ or the built file. `favours` is the converter's bait input: the game's own item names only (it becomes `baits` and `bait`).

export const ROSTER_KEYS = Object.freeze(['id', 'name', 'journal', 'haunt', 'play', 'sizeModel', 'hours', 'place', 'placeName', 'giant',
  'rarity', 'family', 'bodyPlan', 'water', 'favours']);

/** A roster record with only the allow-listed fields (a fresh object; sizeModel copied). */
export function allowList(f) {
  const out = {};
  for (const k of ROSTER_KEYS) if (f && f[k] !== undefined) out[k] = k === 'sizeModel' ? { ...f[k] } : Array.isArray(f[k]) ? f[k].slice() : f[k];
  return out;
}

// ---------------------------------------------------------------------------------------------------------------- the rules
/** SPEC §13: "day" → day, dusk · "dusk" → dusk, night · "night" → night · "day, dusk" and "dusk, night" as written · "any" → all ·
 *  "any, best at night" → all (×1.5 after dark: `bestNight`). The window in the sim's words (day, dusk, night). */
export const HOUR_WINDOWS = Object.freeze({ any: ['day', 'dusk', 'night'], day: ['day', 'dusk'], dusk: ['dusk', 'night'], night: ['night'],
  'day,dusk': ['day', 'dusk'], 'dusk,night': ['dusk', 'night'] });
/** A roster hour string as its LOOP.hours key (the game's `time`): spaces dropped; "any, best at night" is "any". */
export function hourKey(hours) {
  const k = String(hours ?? 'any').toLowerCase().replace(/\s+/g, '');
  if (k === 'any,bestatnight') return 'any';
  return Object.prototype.hasOwnProperty.call(HOUR_WINDOWS, k) ? k : 'any';
}
/** SPEC §13: `play` ("Sulker. …") → its first word, lower case; a legend keeps CATCH_V3.legend.style (else the style its play names). */
export function styleOf(f, legendStyle = {}) {
  const play = String(f?.play ?? '');
  if (f?.rarity === 'legendary') return legendStyle[f.id] || (play.match(/a (steady|darter|sinker|leaper|thrasher|runner|sulker)/i)?.[1] || play.split('.')[0]).toLowerCase();
  return play.split('.')[0].toLowerCase();
}
/** SPEC §13: a tin named in `favours` is a Hold bait; "bites on X only" makes X its only bait. items: [[id, name], …]. */
export function baitsOf(favours, items = []) {
  const fav = String(favours ?? ''), baits = [];
  for (const [id, n] of items) if (fav.includes(n) && !baits.includes(id)) baits.push(id);
  const only = fav.match(/bites on ([A-Z][A-Za-z' -]+?) only/);
  return { baits, only: only ? items.find(([, n]) => n === only[1])?.[0] ?? null : null };
}
/** The tins and lures the roster's favours name that are not (yet) in LURES or BAITS (the sim's list). */
export const ROSTER_EXTRA_ITEMS = Object.freeze([['cut_strip', 'Cut Strip'], ['ferry_coin', 'Ferryman'], ['windfall_plum', 'Windfall Plum'],
  ['tallow_soap', 'Tallow Soap'], ['lumen_moss', 'Lumen Moss']]);
/** The [id, name] list favours is read against: D.LURES, D.BAITS, then ROSTER_EXTRA_ITEMS (in that order, as the sim always had it). */
export function rosterItemNames(D) {
  return [...(D?.LURES || []).map((l) => [l.id, l.name]), ...(D?.BAITS || []).map((b) => [b.id, b.name]), ...ROSTER_EXTRA_ITEMS];
}
/** M1 step 3a: a roster place name as its place id (the sim's slug: "the" dropped, lower case, words joined by "_"):
 *  "Under the Span" → under_the_span, "the Buoy Lights" → buoy_lights. A giant's `placeName` becomes its record's `place`. */
export function placeIdOf(name) {
  return String(name ?? '').replace(/^the /i, '').toLowerCase().replace(/'s\b/g, 's').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}
/** The water a roster water name means: a built lake's id (roster.waters[].existingLake), else the name as a slug. */
export function waterIdsOf(roster) {
  const out = {};
  for (const w of roster?.waters || []) out[w.name] = w.existingLake || String(w.name).replace(/^the /i, '').toLowerCase().replace(/'s\b/g, 's').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  return out;
}
const TIER = { common: 1, uncommon: 2, rare: 3, epic: 3, legendary: 3 };
const YIELD = { common: [6, 18, 18], uncommon: [16, 24, 24], rare: [36, 28, 30], epic: [60, 34, 34] };   // v1-shaped value, food, oil (unread under the loop)
const clone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

/**
 * The converter (SPEC §13). roster: {fish, waters} (the full roster.json, or {fish: [allow-listed records], waters}); built: the built
 * species (data.js SPECIES_V3, finished). opts:
 *   k           BALANCE_V3.size.k (and the loop's own keys): `size.k` is the body's, `size.body` = sizeModel.body || bodyPlan
 *   legendStyle CATCH_V3.legend.style · items: rosterItemNames(D) · waterIds: {roster water name → zone id} (default waterIdsOf)
 *   diff(tier, style) → a difficulty block (data.js's) · art: {id: {model, prefers}} (a new fish's drawing; data.js ROSTER_ART)
 *   ids         only these fish (default all) · waters: only these zone ids (default all)
 * Returns game species records: a re-founded built species (its id in `built`) keeps its built record (model, lore, hint, set pieces)
 * and takes the roster's rarity, size, style, hours, family and the loop's any depth; a new fish is built from the roster's words and
 * its `art`. Every record carries {roster: true, bodyPlan, baits, bait, time, bestNight, kind, giant}; a rare giant (epic, `giant`, its
 * `placeName`) also its `place` (placeIdOf: where it bites, M1 step 3a); nothing research-only is copied.
 * A fish whose body has no k (its plan not built yet) comes back with `size.k` undefined: the caller ships only fish whose plan exists.
 */
export function rosterSpecies(roster, built = [], opts = {}) {
  const K = opts.k || {}, items = opts.items || [], W = opts.waterIds || waterIdsOf(roster), art = opts.art || {};
  const B = new Map((built || []).map((s) => [s.id, s]));
  const want = opts.ids ? new Set(opts.ids) : null, wantW = opts.waters ? new Set(opts.waters) : null;
  const out = [];
  for (const raw of roster?.fish || []) {
    if (want && !want.has(raw.id)) continue;
    const f = allowList(raw), b = B.get(f.id) || null;
    const style = styleOf(f, opts.legendStyle), time = hourKey(f.hours), bestNight = /best at night/i.test(String(f.hours ?? ''));
    const { baits, only } = baitsOf(f.favours, items);
    const bait = only ?? (b?.bait && !String(b.bait).includes('heart') ? b.bait : null);
    const body = f.sizeModel?.body || f.bodyPlan;
    const legend = f.rarity === 'legendary';
    const size = legend && b ? clone(b.size) : { L50: f.sizeModel?.L50, sigma: f.sizeModel?.sigma, body, k: K[body] };
    const zones = (f.water || []).map((n) => W[n]).filter(Boolean);
    for (const zone of zones) {
      if (wantW && !wantW.has(zone)) continue;
      const common = { rarity: f.rarity, size: clone(size), style, behavior: style, time, bestNight, depth: [0, 1], family: f.family,
        bodyPlan: f.bodyPlan, baits: baits.slice(), bait, kind: f.place, giant: !!f.giant, roster: true };
      if (f.giant && !legend && f.placeName) common.place = placeIdOf(f.placeName);
      if (zones.length > 1) common.zones = zones.slice();
      if (b) {
        const s = clone(b);
        delete s.weight; delete s.night;   // derived again by the caller's finish (data.js v3fin)
        out.push(Object.assign(s, { zone }, common));
        continue;
      }
      const tier = TIER[f.rarity] ?? 1, [value, food, oil] = YIELD[f.rarity] || YIELD.common, A = art[f.id] || {};
      out.push({ id: f.id, name: f.name, zone, tier, value, food, oil, ...common,
        difficulty: typeof opts.diff === 'function' ? opts.diff(tier, style) : undefined,
        model: clone(A.model) || { shape: f.bodyPlan, body: 0x646a74, belly: 0xe2ddd0, fin: 0x3c424c, glow: null, pattern: 'none', eyes: 'normal', scale: 1 },
        prefers: A.prefers || 'drip', lore: f.journal, hint: f.haunt, phase: 1, src: 'roster' });
    }
  }
  return out;
}
