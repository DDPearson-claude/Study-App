#!/usr/bin/env node
// tools/sim/clams.mjs — the clam economy of the Full Hold (docs/loop/SPEC.md, DESIGN §26), rebuilt on the roster.
//
// What it proves (167 checks; exits 1 if any fails):
//   0. every roster fish lives on at least one map; one legend per water; one giant per place;
//   1. fish values by water, rarity and size class under the value rule, and that the rare giants top every water's ladder;
//   2. the anti-grind rule: with "the water goes quiet", waiting for giants never beats fishing naturally; and "let go" is a real
//      choice: choosy play (let the small ones go while the water is fresh) earns 85–105% of the natural rule per minute;
//   3. clams per trip by tackle tier and hold size;
//   4. bait: +3–25% clams a minute net of the tins, a tin earns at least 1.3× its price, and no tin beats its water's plain bait;
//   4b. giants and legends: how often the giant a map promises bites and lands, and what a legend hunt costs and pays;
//   5. the pacing targets along a sensible buying order across all 16 waters (10 min, 1 h, 5 h, 20 h, 40 h, the end), every hold
//      step and raft part pays its way, a new water is the best water from the day its map is bought, and (decision 38) no purchase
//      comes before the map that puts it on the shelf;
//   6. the next map is always worth having: no lake map is a downgrade on the day you buy it (its open, day and old water pay
//      ≥ 1.05× the water before it fully mapped), every water fully mapped pays ≥ 1.2× the one before, every place map raises
//      clams a minute by ≥ 5%, and no set of a water's places pays more than the next water fully mapped;
//   7. the three keys (SPEC v8 §5.5): a water opens with its lake map, its gear key and one of each fish on the list of the water before
//      it, landed (kept or let go). Every gear key is on the shelf before its map and owned before it in the pacing run; every list has
//      ≥ 4 fish that bite on the water's plain bait; with the pull (the mercy) and the Journal route the slow player in twenty lands
//      each list in ≤ 60 min and the slowest in a hundred in ≤ 75; under 5% of players still have a list open when the next map and its
//      gear are owned; the pull's windfall is ≤ 15 min of income an era; no bought map waits sealed more than 30 min; a fresh save's
//      first trip is untouched; everything is bought in 45–52 h. Section 5's pacing run is gated the same way (a water is fished only
//      once it is open; a list is taken as landed at its 95th-percentile time). Giants, legends and the fish of places bought later
//      are never on a list; a place map needs only clams.
//
// Where the fish come from: docs/loop/roster.json (164 fish: rarity, water, place kind or a giant's own place, hours, family,
// play style, size model) plus the built species the roster keeps beside them (src/data.js SPECIES_V3, roster §5 "kept as they
// are"). Curiosities and the never-hooked Gill Lodger are outside the economy.
// What comes from src/data.js (never copied here): the size classes and the size model (BALANCE_V3.size, sizeClassOf, isAncient,
// maxZFor), the land chance (catchParts: the Wick, TACKLE Hold T0–T4, the strike, the Fight terms of the built lakes, class and
// rarity, CATCH_V3.items' Hold, the caps, the legend rule), the lures and baits (LURES, BAITS), the time model (AUTOFISH).
// What comes from data.js's `LOOP` (slice 1a moved it there; slice-1a PLAN §6.4, T42): the value rule, the hold ladder, quiet water,
// let go, the evening, tackle (prices, T5–T6, shelfAt), the trip's fixed times, and the Mossmere's value tier and place prices; and
// the quiet terms (data.quietTerms, the game's own function: at 4 good bites the 5th bite is already quiet, PLAN CHOICE 17).
// What is still a draft table here (it moves into data.js slice by slice): the other 15 waters' value tiers and Fight terms, the
// map catalogue and every other price, the giants, bait, lures, the raft and home, the three keys' targets, and the Wicks' copy
// (checked equal to data.js's LOOP.wicks).
//
// Run from gloomwater/:
//   node tools/sim/clams.mjs            everything (about 95 s)
//   node tools/sim/clams.mjs --quick    fewer trips per row (numbers move by a few percent; about 60 s)
//   node tools/sim/clams.mjs --md       the tables as markdown (for SPEC.md)
//   node tools/sim/clams.mjs --fish     Appendix A: every fish of every water with its values and its list mark (markdown)
//   node tools/sim/clams.mjs --json     the LOOP draft tables as JSON
//   node tools/sim/clams.mjs --calibrate  the value tiers that satisfy section 6's two ladder rules (with a 2-point margin)
//   node tools/sim/clams.mjs --wicks    the five Wicks' passives (docs/loop/WICKS.md §3): each Wick's pacing run, its domain and what is
//                                       seen on its first trip, the stations' anti-grind checks, giants, legends and caps, clams a minute in
//                                       every era, the map ladder and the lists per Wick (about 4.5 min; --quick about 2)
//   node tools/sim/clams.mjs --calibrate --wicks   each Wick's own value tiers, and the highest of the five per water (printed, not adopted)
//   node tools/sim/clams.mjs --shipped=mossmere [--step=1…6] [--wicks]   M1's own arc (docs/loop/M1.md §6.4): the Mossmere's shelf, fish
//                                       and places as that step ships them, to the empty shelf (step 5, the default, is M1's end), per Wick
// Deterministic: every row has its own fixed seed. Exits 1 if a pacing target, a ladder rule or the anti-grind check fails.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; globalThis.GW_LOOP = true;   // the loop's data: v3 at phase 1 (data.js reads the flags once, at import)
const D = await import('../../src/data.js');
const RS = await import('../../src/roster-species.js');   // the roster's converter, shared with data.js (SPEC §13, M1 step 2)
const ROSTER = JSON.parse(fs.readFileSync(new URL('../../docs/loop/roster.json', import.meta.url), 'utf8'));
const IS_MAIN = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

const A = D.AUTOFISH, SZ = D.BALANCE_V3.size, RW = D.RARITY_WEIGHTS, C = D.CATCH_V3;
const args = process.argv.slice(2), QUICK = args.includes('--quick'), MD = args.includes('--md') || args.includes('--fish');
const argOf = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? null;
const SHIPPED = argOf('shipped'), STEP = +(argOf('step') ?? 5);   // --shipped=mossmere --step=1…6: M1's own arc (M1.md §6.4)
const N = QUICK ? 1200 : 4000;                            // trips per row
const CLASSES = ['small', 'keeper', 'prize', 'trophy', 'elder', 'ancient'];
const CI = Object.fromEntries(CLASSES.map((c, i) => [c, i]));
const BUILT = ['mossmere', 'sporewood', 'glasswater', 'paleabyss'];
const slug = (s) => s.replace(/^the /i, '').toLowerCase().replace(/'s\b/g, 's').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const PLACE_ALIAS = { bottomless: 'the_bottomless', empty_ferry_slip: 'ferry_slip', long_pier_of_names: 'long_pier', bell_chapel_window: 'bell_window' };
const placeIdOf = (name) => PLACE_ALIAS[slug(name)] || slug(name);

// =====================================================================================================================
// LOOP — the draft tables (the binding copy is docs/loop/SPEC.md; tune here, then copy there)
// =====================================================================================================================
// The twelve new waters, in unlock order (SPEC v7 §5.2: the cold rim first, the green heart last; rivers alternate with stills).
// The lake price is the v6 rule, 42 minutes of the water's own income fully mapped, re-derived for each water in its new slot. `base` is the value tier (tuned with --calibrate: section 6's two ladder rules); `lake` is the lake map's
// price (about 42 minutes of the water's own income fully mapped; it opens the water's open, day and old water). Fight term: GEN.fight (28–32 on
// T5 waters, 39–44 on T6 waters; v7.1 raised the Rime Sound, the Thin Water and the Thunder Stair, so no giant at Prize lands more than half the time on arrival tackle; section 4b checks 30–50%). The place maps are shares of the lake map (PLACE_SHARE).
const NEW_WATER = {
  rime_sound:         { name: 'The Rime Sound',     base: 45, lake: 29700,  lure: ['rime_pirk', 'Rime Pirk'],                 legendBait: ['old_ration', 'Old Ration'] },
  thin_water:         { name: 'The Thin Water',     base: 69,  lake: 36600,   lure: ['weir_spoon', 'Weir Spoon'],               legendBait: ['lamp_snail', 'Lamp Snail'] },
  last_light:         { name: 'The Last Light',     base: 62,  lake: 45600,  lure: ['lighthouse_feather', 'Lighthouse Feather', 'predator'], legendBait: ['lighthouse_ration', 'Lighthouse Ration'] },
  pyrefall_gorge:     { name: 'Pyrefall Gorge',     base: 118,  lake: 59900,   lure: ['ember_wobbler', 'Ember Wobbler'],         legendBait: ['charred_offering', 'Charred Offering'] },
  waxen_reef:         { name: 'The Waxen Reef',     base: 167, lake: 85100,   lure: ['wax_jig', 'Wax Jig'],                     legendBait: ['lantern_fry', 'Lantern-Fry'] },
  thunder_stair:      { name: 'The Thunder Stair',  base: 203,  lake: 131600,   lure: ['thunder_plug', 'Thunder Plug'],           legendBait: ['wired_bream', 'Wired Bream'] },
  rushlight_fen:      { name: 'Rushlight Fen',      base: 336,  lake: 201200,   lure: ['rushlight_spinner', 'Rushlight Spinner'], legendBait: ['storm_candle', 'Storm Candle'] },
  salt_gate:          { name: 'The Salt Gate',      base: 269,  lake: 275900,   lure: ['tide_spoon', 'Tide Spoon'],               legendBait: ['tide_mullet', 'Tide Mullet'] },
  lampmoss_slough:    { name: 'Lampmoss Slough',    base: 608,  lake: 360900,   lure: ['mosslamp_jig', 'Moss-Lamp Jig'],          legendBait: ['carp_cutlet', 'Carp Cutlet'] },
  siltway:            { name: 'The Siltway',        base: 794,  lake: 440800,   lure: ['silt_rattle', 'Silt Rattle'],             legendBait: ['bargemans_supper', "Bargeman's Supper"] },
  lanternroot_lagoon: { name: 'Lanternroot Lagoon', base: 866,  lake: 667000,   lure: ['rootlamp_popper', 'Root-Lamp Popper'],    legendBait: ['mothwing_fly', 'Moth-Wing Fly'] },
  inkwood:            { name: 'The Inkwood',        base: 1675,  lake: 983500,   lure: ['ink_fly', 'Ink Fly'],                     legendBait: ['blossom_fly', 'Blossom Fly'] },
};
// A place may draw fish of its water's open pool (× weight); the two day waters with no fish of their own are drawn this way.
const PLACE_DRAWS = { lily_maze: { candlefin_koi: 3, weeping_carp: 1.5 }, lullaby: { sleepspore_jelly: 2, velvet_ray: 1.5 }, night_lanes: { reedwalker_catfish: 2.5 },
  coin_run: { lampspot_snakehead: 2.5 }, boulder_garden: { lampspot_snakehead: 2.5 } };
// a water's plain bait where the count rule picks a tin that another beats (section 2b checks every water): the open sea's and the
// lagoon's fish favour no one tin, so their plain bait is the Shimmerfly; the Inkwood's fruit eaters are few, so the Windfall Plum is a tin you pick for them
const PLAIN_BAIT = { mossmere: 'mireworm', sporewood: 'spore_cake', glasswater: 'ember_roe', paleabyss: 'ember_roe', last_light: 'shimmerfly', lanternroot_lagoon: 'shimmerfly', inkwood: 'mireworm' };
// Where a roster fish bites in play, where this spec moves it (SPEC §5.2: every place map promises a fish of its own, never a
// common): the roster's kind of place is kept for every other fish.
export const KIND_MOVE = { ambersickle_tuna: 'night', grumbleplate: 'day', cocoon_sleeper: 'day', kitewing_ray: 'day', bouldermouth: 'day', coalwing_skate: 'night',
  starbar_lancer: 'day', cabin_grouper: 'night', tailwatch_mudfish: 'night', reedwalker_catfish: 'open' };
// v7.1: the Lampspot Snakehead bites in Pyrefall Gorge's open water again (the roster's own kind: the gorge's open water had only two
// commons, so letting fish go there earned too little), and hunts the Coin Run and the Boulder Garden (PLACE_DRAWS ×2.5); the Reedwalker Catfish swims Rushlight Fen's open water and is drawn x1.5 at the
// Night Lanes (PLACE_DRAWS, as strongly as a night-water fish there), which thickens the fen's thin pool so the Salt Gate after it is no step down in what a giant sells for.
// A roster fish this spec gives a place of its own (it bites only there; SPEC §5.2)
export const OWN_MOVE = { picket_pike: 'drowned_spire' };
export const LAKE_OPENS = ['old', 'day'];   // a lake map opens its open water, its day water and its old water
const PLACE_SHARE = { day: 0, old: 0, extra: 0.39, night: 0.43, crown: 0.59 };   // a new water's place maps, as a share of its lake map (which opens its day and old water)
const GEN = { fight: [31, 31, 30, 30, 32, 40, 39, 40, 41, 42, 43, 44], legendFight: 26, legendBait: 0.12, lure: 0.3, floor: 1.05 };

function makeWaters() {
  const built = [
    { id: 'mossmere', name: 'The Mossmere', base: D.LOOP.waters.mossmere.tier, lake: 0, prices: { ...D.LOOP.waters.mossmere.prices },   // data.js (slice 1a)
      legend: 'belled_matriarch', legendBait: ['heartmoss', 60], lure: ['bell_spinner', 180] },
    { id: 'sporewood', name: 'Sporewood Pools', base: 11, lake: 2600, prices: { day: 400, old: 800, extra: 1100, night: 1200, crown: 2200 },
      legend: 'drifting_grove', legendBait: ['glowcap_bulb', 250], lure: ['sporelamp_fly', 500] },
    { id: 'glasswater', name: 'Glasswater Vault', base: 16, lake: 10200, prices: { day: 2000, old: 3200, extra: 4000, night: 4800, crown: 7500 },
      legend: 'glass_sovereign', legendBait: ['prism_moth', 1000], lure: ['mirror_shard', 2400] },
    { id: 'paleabyss', name: 'The Pallid Deep', base: 35, lake: 26000, prices: { day: 7000, old: 11000, night: 14000, crown: 19000 },
      legend: 'lantern_swallower', legendBait: ['last_candle', 3000], lure: ['ferry_coin', 9000] },
  ].map((w, i) => ({ ...w, order: i + 1, reach: 1, fight: null }));
  // a slot's place maps and legend bait never cost less than the slot before's (v7.1: the floor is 1.05× the previous water's price of
  // the same kind, its night water standing in for a fifth place), so every price on the shelf rises with the slot, not the lake maps only
  let prev = built[built.length - 1];
  const fresh = Object.entries(NEW_WATER).map(([id, w], k) => {
    const i = k + 5, lake = w.lake, floor = (v, p) => Math.max(v, p ? Math.ceil(p * GEN.floor / 100) * 100 : 0);
    const prices = Object.fromEntries(Object.entries(PLACE_SHARE).map(([kind, s]) => [kind, Math.round(lake * s / 100) * 100]));
    for (const kind of ['night', 'crown', 'extra']) prices[kind] = floor(prices[kind], prev.prices[kind] ?? prev.prices.night);
    const legend = ROSTER.fish.find((f) => f.rarity === 'legendary' && f.water.includes(w.name)).id;
    const bait = Math.max(Math.round(prices.crown * GEN.legendBait / 10) * 10, Math.ceil((prev.legendBait[1] * GEN.floor) / 10) * 10);
    const W = { id, name: w.name, order: i, reach: 1 + Math.floor((i - 1) / 4), base: w.base,
      fight: GEN.fight[k], lake, prices, legend, legendBait: [w.legendBait[0], bait, w.legendBait[1]],
      lure: [w.lure[0], Math.round(lake * GEN.lure / 100) * 100, w.lure[1]] };
    prev = W; return W;
  });
  return [...built, ...fresh];
}

export const baitTin = (id, water) => Math.max(5, Math.round(LOOP.baitRule.grade * WATER[water].base / 5) * 5);
/** The keys slice 1a moved into data.js (PLAN §6.4): read from data.LOOP, never drafted here (T42 fails if one comes back). */
// M1 step 3a (docs/loop/m1-step3a/PLAN.md §2.1 item 6): + `place` (the place pool's weights and the place favour: data.LOOP.place
// {common, dayDraw, kindWeight, kept, favour: {base, window}}) and `giant` (the rare giants' share, favour, floor and Fight: data.LOOP.giant)
export const MOVED = ['value', 'hold', 'water', 'letGo', 'evening', 'tackle', 'time', 'place', 'giant'];
const DRAFT = {
  // ---- sale value (data.LOOP.value): clams = max(1, round(base[water] × rarity × body × clamp(e^(perZ·z)) × classBonus)). body =
  // clamp(√(L50 / 45 cm)). A legend is not sold: her first landing pays her crown map's price, later landings 40% of it.
  // ---- the rare giants (data.LOOP.giant since M1 step 3a: its share of the bites at its own place, inHour in its hours and offHour
  // outside them; never Small; +10 Fight over a rare). The place pool (data.LOOP.place since M1 step 3a): a common ×common at a place,
  // a day water's open uncommon and rare ×dayDraw, a fish of a kind of place ×kindWeight, a built place's own species a rare's weight
  // × kept.weight × kept.live, the place favour base + its kind's window.
  // ---- the hold (data.LOOP.hold): 3 slots at the start; each step is bought once, in order. The water goes quiet (data.LOOP.water):
  // good bites per evening by kind (open water: one per slot of the hold, plus openExtra); EVERY bite spends one. Let go
  // (data.LOOP.letGo): the bite back, and +favour at that water to its cap. The evening (data.LOOP.evening): 40 s of day, 20 of dusk.
  // The favour terms still drafted here: dusk, night, the lantern and keel, the setup (the place's own are data.LOOP.place.favour).
  favour: { dusk: 0.2, night: 0.25, perLantern: 0.1, perKeel: 0.1, setup: 0.15 },
  // ---- tackle (data.LOOP.tackle): one price per tier per slot (Rod, Line, Reel bought separately); T5 and T6 are new; no proof
  // catches; shelfAt: the water whose map puts a tier on the shelf (v8: T6 with the slot-9 map, so Rod T6, the Thunder Stair's gear
  // key, can be bought before its map)
  waters: makeWaters(),
  // ---- the giants' lures: the four built ones are re-aimed at their lake's giants; one new lure per new water (+10 Hold, attract ×1.5)
  giantsLures: {
    bell_spinner: ['thousandcast_pike', 'hullkiss_lamprey', 'reedjaw_pike'],
    sporelamp_fly: ['harpstring_eel', 'festival_puffer', 'emberbrood_snakehead'],
    mirror_shard: ['shardspine_eel', 'wolfwake_trout', 'prismdrop_sturgeon'],
    ferry_coin: ['gilt_eyed_eel', 'candlewake_sturgeon', 'the_clapper'],
  },
  giantsLureNames: 2,                                     // a new water's giants' lure also names this many of its biggest rare or uncommon fish
  familyLures: { feather_fly: 50, glimmer_spoon: 90, bone_jig: 110, moth_popper: 400, lantern_lure: 4000 },
  familyLureAt: { moth_popper: 2, lantern_lure: 3 },
  // ---- bait: a tin of 10, one spent per hooked fish, fitted beside the lure. Every tin gives the same favour (every fish runs
  // bigger) and costs the same in a water: grade × that water's value tier (so a tin is 10 in the Mossmere and 95 in the Thin
  // Water). Tins differ only in which fish they help hold (+5 Hold on the fish that favour them, the larger of lure and bait) and
  // in the few fish that bite on one bait only. So no tin is the one to buy: you pick a tin for the fish you are after.
  baitRule: { grade: 1.5, favour: 0.3 },
  bait: {
    mireworm:      { at: 1, name: 'Mire Worms' },
    lumen_moss:    { at: 1, name: 'Lumen Moss' },     // the Gloam Eel bites on nothing else
    spore_cake:    { at: 2, name: 'Spore Cake' },     // the Threadling Eel bites on nothing else
    ember_roe:     { at: 2, name: 'Ember Roe' },
    glass_larva:   { at: 3, name: 'Glass Larvae' },   // the Chime Jelly bites on nothing else
    shimmerfly:    { at: 4, name: 'Shimmerfly' },
    windfall_plum: { at: 16, name: 'Windfall Plum', hold: 5 },   // new: the Inkwood's fruit eaters
    tallow_soap:   { at: 10, name: 'Tallow Soap', hold: 5 },      // new: whiskered scavengers
  },
  tinSize: 10,
  // ---- the raft, besides the hold
  raft: {
    oars:    { prices: [60, 300],  speed: 1.5, perLevel: 'raft speed +1.5 m/s (6 → 9)' },
    keel:    { prices: [100, 600, 3000], perLevel: 'every fish runs bigger: favour +0.1 everywhere' },
    lantern: { prices: [100, 500], perLevel: 'night fish run bigger: favour +0.1 after dark; a wider pool of light' },
  },
  // ---- home (the Jetty, then the home barge, SPEC §6)
  home: {
    orders:  { prices: [70, 400, 4000], perLevel: "one more of Murk's orders (an order pays double for one named fish)" },
    baitBed: { prices: [120, 700, 9000], perLevel: "free bait each evening: 3 / 6 / 10 of the water's plain bait" },
    wall:    { prices: [250, 30000, 80000, 150000], perLevel: "one wing of the Long Wall per reach of four waters: your best ink print of every fish there" },
    lights:  { prices: [200, 1200, 14000], perLevel: "the Barge lights: lanterns on the rails, lanterns along the roof's edge, a beacon on the bow (looks only)" },
  },
  looks: { slate_dye: 300, oxblood_pennant: 400, amber_glass: 600, painted_prow: 2500, bell_buoy: 6000, gilt_lantern: 40000, reed_sail: 50000, star_pennant: 100000, moon_lamp: 200000 },
  // (the trip's fixed times are data.LOOP.time: `show` is 0 since the catch show is built, because AUTOFISH.time.ceremony holds the
  // whole landing, the reveal and the show, PLAN CHOICE 15; the visit home is measured by T37 and written there)
  player: { clams: 0.9, time: 1.25, orderGain: 0.06 },
  // ---- the three keys (SPEC v8 §5.5): a water opens for sailing with its lake map, its gear key and the list of the water before it
  access: {
    // the gear key of every lake map: a shelf buy id, held when the owned level is at least the key's (no new item: tackle, raft and hold as priced above)
    gear: { sporewood: 'rod:1', glasswater: 'rod:3', paleabyss: 'rod:4', rime_sound: 'reel:5', thin_water: 'oars:2', last_light: 'keel:3',
      pyrefall_gorge: 'line:5', waxen_reef: 'rod:5', thunder_stair: 'rod:6', rushlight_fen: 'line:6', salt_gate: 'reel:6',
      lampmoss_slough: 'lantern:1', siltway: 'keel:2', lanternroot_lagoon: 'lantern:2', inkwood: 'hold:8' },
    // the list rule: a water's open-water fish and the fish of the day and old water its lake map opens, on its plain bait; the members are computed (listFor), never listed
    list: { kinds: ['open', 'day', 'old'], plainBaitOnly: true },
    // the pull (the mercy): a listed fish not yet landed bites at weight × min(cap, 1 + perEvening × n), n = evenings ended at that water with its list open;
    // from n ≥ floorFrom it never bites Small (z ≥ keeperFloor); from n ≥ sureFrom the first bite at each place and in open water, in a light where a missing
    // fish bites there, is one of them. floorFrom is 1 (the sim's re-tune): the first evening at a water is the natural rule untouched, so a fresh save's first
    // trip keeps its length and its bite after dark (with the floor from the first evening the hold filled early and 39% of first trips saw the night, not 63%)
    pull: { perEvening: 1, cap: 6, keeperFloor: -0.25, floorFrom: 1, sureFrom: 8 },
    // what section 7 holds every list to: the time to land it at the kit the water opens with, on the Journal route with the pull (pacing minutes, the visit home included)
    target: { p95: 60, p99: 75, stillOpen: 0.05, extraWait: 5, windfall: 15, sealed: 30, minList: 4, hours: [45, 52] },
  },
  // ---- the five Wicks' passives (docs/loop/WICKS.md §2, revision 3: one each, always on; the knobs and their ranges are §2's, tuned by
  // `--wicks` against §3.2). This table moves into data.js as `LOOP.wicks` with slice 1a (PLAN §2.1 item 15). The sim's reference row
  // is the no-passive Wick (`wick: null`, printed "none"), which every section 0–7 figure above is.
  wicks: {
    order: ['wick', 'taper', 'stub', 'tallow', 'ashwick'],
    // the balancing (QUEUE job 8, `--wicks`): firstMult 1.5 → 1.4, Taper's perWater true → false, Stub's waitMul 0.75 → 0.78, Tallow's
    // everyWater (its good bite at every place too). The lead's rulings (WICKS §3.5, 15 November 2026): everyWater kept, and Tallow keeps
    // its 9 slots at Hold 8 (no cap: the Harbour Chest is the Inkwood's gear key and gives Tallow its 9th slot)
    wick:    { passive: 'curious', firstMult: 1.4, firstFloor: 0.4, stats: {} },                                 // a kept first sells × firstMult, at least firstFloor × the tier
    taper:   { passive: 'long_reach', firstBites: 1, perWater: false, giantShare: 1.3, giantCap: 0.12, stats: {} }, // the first bite of each evening is never common
    stub:    { passive: 'moth_bright', waitMul: 0.78, quietStep: 0.08, quietWait: false, stats: { lightRadius: 1.5 } },   // quick bites; lively quiet water
    tallow:  { passive: 'broad_back', slots: 1, good: 1, everyWater: true, stats: {} },                      // one more slot at every step (to 9); +1 good bite at every water
    ashwick: { passive: 'burns_back', hold: 4, stats: {} },                                                   // a fish that gets away comes back once, tired (+4: the run cap)
  },
};
/** The sim's tables: the draft above with the moved keys read from data.js (the binding copy: PLAN §6.4). */
export const LOOP = { ...DRAFT, ...Object.fromEntries(MOVED.map((k) => [k, D.LOOP[k]])) };
const WATER = Object.fromEntries(LOOP.waters.map((w) => [w.id, w]));

// ---- the Wicks' pure helpers (WICKS.md §2.2–§2.4, §3.1): `wickSlots`, `goodBitesFor`, `quietTerms`, `wickPoolWeights`. Slice 1a exports
// them from data.js; where data.js has one, the sim calls it (the same function the game calls), and until then it uses the stand-in
// below, written to the rule as WICKS.md states it, with the same signature. `--wicks` prints which is which. The sim has no `meta.loop`,
// so it calls the numeric `wickSlots`, never `loopSlots`. A Wick id the table does not know (the reference row's null) is no passive.
export const WICK_IDS = LOOP.wicks.order;
/** Run fn with some of a Wick's knobs changed (a comparison row), then put them back. The data.js helpers read data's own
 *  LOOP.wicks (slice 1a's seam), so its row is patched too while fn runs. */
export function withKnobs(wid, patch, fn) {
  const tables = [LOOP.wicks[wid], D.LOOP?.wicks?.[wid]].filter((K, i, a) => K && a.indexOf(K) === i), keeps = tables.map((K) => ({ ...K }));
  for (const K of tables) Object.assign(K, patch);
  try { return fn(); } finally { tables.forEach((K, i) => { for (const k of Object.keys(K)) delete K[k]; Object.assign(K, keeps[i]); }); }
}
export const simWick = (id) => (id && id !== 'order' && LOOP.wicks[id] ? id : null);
export const STAND_INS = [];
const fromData = (name, standIn) => (typeof D[name] === 'function' ? D[name] : (STAND_INS.push(name), standIn));
/** Tallow's slots: the bought count (`holdSlots`, 3–8, the save's) plus the Wick's `slots`. */
export const wickSlots = fromData('wickSlots', (holdSlots, wickId) => { const K = LOOP.wicks[simWick(wickId)]; return holdSlots + (K?.slots || 0); });
/** Good bites a water gives each evening: open water one per slot of the Wick's hold plus openExtra plus the Wick's `good`; a place its built
 *  count, plus the Wick's `good` where its `everyWater` (Tallow's upward knob, WICKS §3.3 check 9: ECONOMY's measured every-water version). */
export const goodBitesFor = fromData('goodBitesFor', ({ kind, holdSlots, wickId }) => { const K = LOOP.wicks[simWick(wickId)]; return kind === 'open'
  ? Math.round(wickSlots(holdSlots, wickId) * LOOP.water.openPerSlot) + LOOP.water.openExtra + (K?.good || 0)
  : LOOP.water.good[kind] + (K?.everyWater ? K.good || 0 : 0); });
/** Quiet water `over` bites past the good bites: {favour, waitMult}. Stub: −quietStep a bite (not −0.15) and no slower waits. */
export const quietTerms = fromData('quietTerms', (over, wickId) => {
  const S = LOOP.water.stale, q = LOOP.wicks[simWick(wickId)] || {};
  return { favour: Math.max(S.floor, (q.quietStep != null ? -q.quietStep : S.favour) * over), waitMult: q.quietWait === false ? 1 : Math.min(S.waitMax, 1 + S.wait * over) };
});
/** Taper's first bite over a whole pool (species and their weights): the commons zeroed where the uncommon-and-rare rest keeps at least
 *  signRule.minSpecies kinds and none above signRule.maxShare; otherwise the weights unchanged (the rule waits). Other Wicks: unchanged. */
export const wickPoolWeights = fromData('wickPoolWeights', (wickId, pool, weights, { firstBite = false, signRule = A.signRule } = {}) => {
  if (LOOP.wicks[simWick(wickId)]?.passive !== 'long_reach' || !firstBite) return weights;
  const keep = weights.map((w, i) => (pool[i].rarity === 'common' ? 0 : w)), tot = keep.reduce((a, b) => a + b, 0), by = new Map();
  pool.forEach((s, i) => { if (keep[i] > 0) by.set(s.id, (by.get(s.id) || 0) + keep[i]); });
  if (!tot || by.size < signRule.minSpecies || Math.max(...by.values()) / tot > signRule.maxShare + 1e-12) return weights;
  return keep;
});
// places and giants are matched to waters by index (roster.json waters[i] and LOOP.waters[i]), species by name: the two lists must agree
for (const [i, rw] of ROSTER.waters.entries()) {
  if (rw.name !== LOOP.waters[i]?.name || rw.order !== i + 1) { console.error(`roster.json waters[${i}] is "${rw.name}" (order ${rw.order}) but the sim's slot ${i + 1} is "${LOOP.waters[i]?.name}": re-order one list to match the other`); process.exit(1); }
}
if (ROSTER.waters.length !== LOOP.waters.length) { console.error(`roster.json has ${ROSTER.waters.length} waters, the sim ${LOOP.waters.length}`); process.exit(1); }
const WATER_OF_NAME = Object.fromEntries(ROSTER.waters.map((w, i) => [w.name, LOOP.waters[i].id]));
const NAME = Object.fromEntries(LOOP.waters.map((w) => [w.id, w.name]));

// =====================================================================================================================
// the fish of the loop: the roster, plus the built species it keeps
// =====================================================================================================================
const HOURS = { any: ['day', 'dusk', 'night'], 'any, best at night': ['day', 'dusk', 'night'], day: ['day', 'dusk'], dusk: ['dusk', 'night'],
  night: ['night'], 'day, dusk': ['day', 'dusk'], 'dusk, night': ['dusk', 'night'] };   // an hour opens a window that runs into the next phase
const BUILT_TIME = { any: HOURS.any, calm: ['day', 'dusk'], gloom: ['night'], dawn: ['day'] };
const ITEM_NAMES = RS.rosterItemNames(D);   // LURES, BAITS and the roster's own tins (src/roster-species.js, the converter's list)
const builtIds = new Set(D.SPECIES_V3.map((s) => s.id));
export const SPECIES = [];
export const PLACES = [];
for (const [wi, rw] of ROSTER.waters.entries()) {
  const W = LOOP.waters[wi];
  W.places = [];
  for (const p of rw.places) {
    const id = placeIdOf(p.name);
    const giants = ROSTER.fish.filter((f) => f.giant && f.rarity !== 'legendary' && f.placeName === p.name).map((f) => f.id);
    if (p.later && !giants.length) continue;               // later sheets with no roster giant wait for the second edition
    const legend = p.kind === 'crown' ? W.legend : null;
    const extra = !!p.later;
    const inLake = W.order > 1 && LAKE_OPENS.includes(p.kind) && !extra;   // a lake map opens its open water and these places (SPEC §5.1 rule 1)
    const P = { id, water: W.id, kind: p.kind, extra, inLake, name: p.name.replace(/^the /, 'The '), price: inLake ? 0 : W.prices[extra ? 'extra' : p.kind], giants, legend, own: [], draws: PLACE_DRAWS[id] || null };
    PLACES.push(P); W.places.push(P);
  }
}
const PLACE = Object.fromEntries(PLACES.map((p) => [p.id, p]));
// the converter (src/roster-species.js, the game's own: style, hours, bait and baits, L50 from the roster's words by SPEC §13's rules), one
// record per fish per water; the sim adds what is its own (places, giants, the moves of §5.2, the record length)
export const CONVERTED = RS.rosterSpecies(ROSTER, D.SPECIES_V3, { k: D.BALANCE_V3.size.k, legendStyle: C.legend.style, items: ITEM_NAMES, waterIds: WATER_OF_NAME });
for (const f of ROSTER.fish) {
  for (const wn of f.water) {
    const water = WATER_OF_NAME[wn], c = CONVERTED.find((x) => x.id === f.id && x.zone === water);
    const placeId = f.giant && f.rarity !== 'legendary' ? placeIdOf(f.placeName) : null;
    SPECIES.push({ id: f.id, name: f.name, water, rarity: c.rarity, giant: c.giant, legend: c.rarity === 'legendary', kind: OWN_MOVE[f.id] ? 'old' : KIND_MOVE[f.id] ?? c.kind, ownPlace: OWN_MOVE[f.id] || undefined, moved: !!(KIND_MOVE[f.id] || OWN_MOVE[f.id]), placeId,
      hours: RS.HOUR_WINDOWS[c.time], hoursText: f.hours, bestNight: c.bestNight, style: c.style, family: c.family, L50: f.sizeModel.L50,
      record: f.lengthCm[2], bait: c.bait, baits: new Set(c.baits), plan: c.bodyPlan, never: c.family === 'none', roster: true });
  }
}
const rosterIds = new Set(ROSTER.fish.map((f) => f.id));
export const WAITING = [];                                // built species whose place is a later sheet
for (const s of D.SPECIES_V3) {
  if (!BUILT.includes(s.zone) || rosterIds.has(s.id) || s.rarity === 'legendary' || s.cove) continue;
  const pid = s.place || null;
  if (pid && !PLACE[pid]) { WAITING.push(s); continue; }
  const P = pid ? PLACE[pid] : null;
  if (P) P.own.push(s.id);
  const baits = new Set(D.BAITS.filter((b) => b.bonus?.attract?.includes(s.id)).map((b) => b.id));
  SPECIES.push({ id: s.id, name: s.name, water: s.zone, rarity: s.rarity, giant: false, legend: false, kind: P ? P.kind : 'open', placeId: null, ownPlace: pid,
    hours: P?.kind === 'night' ? ['night'] : BUILT_TIME[s.time] || HOURS.any, hoursText: P?.kind === 'night' ? 'night' : { any: 'any', calm: 'day, dusk', gloom: 'night', dawn: 'day' }[s.time] || 'any', bestNight: false, style: s.style, family: s.family, L50: s.size.L50,
    record: null, bait: s.bait || null, baits, plan: s.size.body, maxClass: s.maxClass || null, never: false, roster: false });
}
const SP = Object.fromEntries(SPECIES.map((s) => [s.id + '@' + s.water, s]));
for (const W of LOOP.waters) W.species = SPECIES.filter((s) => s.water === W.id);
// the new waters' giants' lures name the water's giants and its biggest rare; each new water's plain bait is the tin its fish name most
for (const W of LOOP.waters) {
  if (!LOOP.giantsLures[W.lure[0]]) {
    // v7.1: its giants and its two biggest rare or uncommon fish (rares first), so fitting it never costs the draw of a family lure
    const big = W.species.filter((s) => (s.rarity === 'rare' || s.rarity === 'uncommon') && !s.never && !s.giant).sort((a, b) => (b.rarity === 'rare') - (a.rarity === 'rare') || b.L50 - a.L50).slice(0, LOOP.giantsLureNames);
    LOOP.giantsLures[W.lure[0]] = [...W.species.filter((s) => s.giant && !s.legend).map((s) => s.id), ...big.map((s) => s.id)];
  }
  const tins = ['mireworm', 'spore_cake', 'ember_roe', 'windfall_plum', 'tallow_soap'].filter((b) => (LOOP.bait[b].at ?? 1) <= W.order);
  const count = (b) => W.species.filter((s) => s.baits.has(b)).length;
  W.plainBait = PLAIN_BAIT[W.id] || tins.sort((a, b) => count(b) - count(a))[0];
}
const LURE_NAME = Object.fromEntries([...D.LURES.map((l) => [l.id, l.name]), ...Object.values(NEW_WATER).map((w) => [w.lure[0], w.lure[1]])]);

// =====================================================================================================================
// the three keys (SPEC §5.5): the list of a water, computed from the fish above
// =====================================================================================================================
/** Why a fish is on its water's list or not: 'list' (on it), 'tin' (it bites only on a tin that is not the water's plain bait),
 *  or 'off' (a giant, a legend, the never-hooked, or a fish of a place the lake map does not open). */
export function listMark(s) {
  const W = WATER[s.water], R = LOOP.access.list;
  if (s.giant || s.legend || s.never) return 'off';
  if (s.ownPlace) { const P = PLACE[s.ownPlace]; if (!P.inLake || !R.kinds.includes(P.kind)) return 'off'; }
  else if (s.kind !== 'open' && !(R.kinds.includes(s.kind) && W.places.some((p) => p.inLake && p.kind === s.kind))) return 'off';
  else if (s.kind === 'open' && !R.kinds.includes('open')) return 'off';
  return R.plainBaitOnly && s.bait && s.bait !== W.plainBait ? 'tin' : 'list';
}
const LISTS = new Map();
/** A water's list (the next water's catch key): the ids of its open-water fish and of the fish of the day water and old water its lake map
 *  opens (their own fish included), each only if it bites on the water's plain bait. The Mossmere has no lake map: its open water only. */
export function listFor(waterId) {
  if (!LISTS.has(waterId)) LISTS.set(waterId, WATER[waterId].species.filter((s) => listMark(s) === 'list').map((s) => s.id));
  return LISTS.get(waterId);
}
/** The gear key of a water's lake map as { slot, level, id, price, shelfAt }: shelfAt is the water whose map puts it on the shelf (1: from the start). */
export function gearKey(waterId) {
  const id = LOOP.access.gear[waterId]; if (!id) return null;
  const [slot, lv] = id.split(':'), level = +lv;
  const tackle = slot === 'rod' || slot === 'line' || slot === 'reel';
  const price = tackle ? LOOP.tackle.price[level] : slot === 'hold' ? LOOP.hold.ladder.find((h) => h.slots === level).price : LOOP.raft[slot].prices[level - 1];
  return { id, slot, level, price, shelfAt: tackle ? LOOP.tackle.shelfAt[level] : 1 };
}

// =====================================================================================================================
// value, land chance, bite pools
// =====================================================================================================================
const bodyOf = (sp) => { const B = LOOP.value.body; return Math.min(B.clamp[1], Math.max(B.clamp[0], (sp.L50 / B.ref) ** B.exp)); };
/** Sale value in clams of a fish of species `sp` at size score z. */
export function clamsFor(sp, z, V = LOOP.value) {
  const cls = D.sizeClassOf(z), m = Math.min(V.clamp[1], Math.max(V.clamp[0], Math.exp(V.perZ * z)));
  return Math.max(1, Math.round(WATER[sp.water].base * V.rarity[sp.rarity] * bodyOf(sp) * m * (V.classBonus[cls] ?? 1)));
}
const tierHold = (slot, t) => (t <= 4 ? D.tackleHoldAt(slot, t) : LOOP.tackle.extraHold[slot][t - 5]);
const ITEM = (id) => C.items[id] || (LOOP.bait[id] ? { kind: 'bait', hold: LOOP.bait[id].hold ?? 5, attract: true } : LOOP.giantsLures[id] ? { kind: 'lure', hold: 10 } : null);
/** The Hold one fitted bait or lure gives this fish (the larger of lure and bait counts, never both: the built rule). */
function itemHold(id, sp, night) {
  const it = id && ITEM(id); if (!it || sp.legend) return 0;
  if (LOOP.giantsLures[id]) return LOOP.giantsLures[id].includes(sp.id) ? it.hold : 0;
  if (it.all) return it.hold;
  if (it.night) return sp.hours.length === 1 && sp.hours[0] === 'night' && night ? it.hold : 0;
  if (it.family) return sp.family === it.family ? it.hold : 0;
  if (it.attract) return sp.baits.has(id) || sp.bait === id ? it.hold : 0;
  return 0;
}
// a giants' lure may also be a lure of a family (NEW_WATER lure[2]): it then draws that family as the family's own lure does
const GL_FAMILY = Object.fromEntries(Object.values(NEW_WATER).filter((w) => w.lure[2]).map((w) => [w.lure[0], w.lure[2]]));
const familyLure = (fam) => D.LURES.find((l) => l.family === fam && !l.night);
const lureMatch = (id, sp) => {
  if (!id) return false;
  if (LOOP.giantsLures[id]) return LOOP.giantsLures[id].includes(sp.id) || (GL_FAMILY[id] != null && sp.family === GL_FAMILY[id]);
  const l = D.LURES.find((x) => x.id === id); if (!l) return false;
  return (l.family && sp.family === l.family) || (l.night && sp.hours.length === 1 && sp.hours[0] === 'night');
};
const lureAttract = (id, sp) => {
  if (!LOOP.giantsLures[id]) return D.LURES.find((x) => x.id === id)?.attract ?? 1;
  const fam = GL_FAMILY[id] && sp && sp.family === GL_FAMILY[id] ? familyLure(GL_FAMILY[id])?.attract ?? 1 : 1;
  return Math.max(fam, sp && !LOOP.giantsLures[id].includes(sp.id) ? 1 : 1.5);
};
const lureFavour = (id, sp) => {
  if (LOOP.giantsLures[id]) return GL_FAMILY[id] && sp.family === GL_FAMILY[id] ? familyLure(GL_FAMILY[id])?.favour ?? 0 : 0;
  const l = D.LURES.find((x) => x.id === id); return l?.favour && lureMatch(id, sp) ? l.favour : 0;
};
const P_CACHE = new Map();
/** Land chance: data.js's catchParts for the Wick, the tackle, the strike, class and rarity and the built lakes' Fight; the draft adds the
 *  new waters' Fight term, a giant's Fight and the item Hold for fish data.js does not know yet. Same formula, same caps, same floor.
 *  `extraHold`: a run buff's Hold (Ashwick's tired comeback, WICKS §2.5), passed to catchParts as its buffs (inside its caps). */
export function landP(sp, cls, kit, strike, night, extraHold = 0) {
  const key = `${sp.id}|${sp.water}|${cls}|${kit.rod}|${kit.line}|${kit.reel}|${kit.lure}|${kit.bait}|${strike}|${night}|${extraHold}`;
  let p = P_CACHE.get(key); if (p !== undefined) return p;
  const builtLake = BUILT.includes(sp.water) ? sp.water : 'mossmere', W = WATER[sp.water];
  const like = { id: sp.id, rarity: sp.rarity === 'epic' ? 'rare' : sp.rarity, style: sp.style, family: sp.family, place: sp.ownPlace || undefined, zone: builtLake, maxClass: sp.maxClass || undefined };
  const hold = { rod: tierHold('rod', kit.rod), line: tierHold('line', kit.line), reel: tierHold('reel', kit.reel) };
  const parts = D.catchParts(like, cls, { hold }, extraHold ? { strike, lake: builtLake, night, buffs: extraHold } : { strike, lake: builtLake, night });
  if (!parts) { P_CACHE.set(key, 0); return 0; }
  const elderish = cls === 'elder' || cls === 'ancient';
  let fight = parts.fight + (W.fight != null ? W.fight - (C.lake.mossmere ?? 0) : 0);
  if (W.fight != null && elderish) fight += 2 - (C.elderStep.mossmere ?? 0);   // a new water's Elder step is 2 (the deep lakes' value)
  if (sp.rarity === 'epic') fight += LOOP.giant.fight + (elderish ? LOOP.giant.elderFight : 0);
  const h = parts.hold + Math.max(itemHold(kit.lure, sp, night), itemHold(kit.bait, sp, night));
  p = Math.max(C.floor, parts.cap / (1 + Math.exp(-C.scale * (h - fight))));
  P_CACHE.set(key, p); return p;
}
/** A legend's land chance on a try: data.js for the four built legends; the new ones in the same formula with the draft Fight. */
export function legendP(id, kit, wounds = 0) {
  const hold = { rod: tierHold('rod', kit.rod), line: tierHold('line', kit.line), reel: tierHold('reel', kit.reel) };
  if (C.legend.fight[id] != null) return D.catchChance(id, 'legend', { hold }, { wounds });
  const sp = SPECIES.find((s) => s.id === id), W = WATER[sp.water], w = C.emphasis[sp.style] || C.emphasis.steady;
  const h = C.wick + hold.rod * w.rod + hold.line * w.line + hold.reel * w.reel + C.strike.struck + Math.min(C.legend.woundCap, wounds * C.legend.woundPerEscape);
  return Math.max(C.floor, C.cap.legend / (1 + Math.exp(-C.scale * (h - (W.fight + GEN.legendFight)))));
}

function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const gauss = (r) => { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); };
const truncZ = (r, mu, min, max) => { for (let i = 0; i < 200; i++) { const z = mu + gauss(r); if (z >= min && z <= max) return z; } return Math.min(max, Math.max(min, mu)); };

const POOLS = new Map(), PULLED = new Map();
/** The fish that can bite in a water at a phase: open-water fish everywhere; a place adds the fish of its kind, its giant and its own
 *  built species; the lure and the bait tilt the pool; a fish that bites on one bait only needs it. */
function poolFor(water, placeId, phase, lure, bait, miss = null, pull = 1, wick = null) {
  // the pull (SPEC §5.5 (d)): a listed fish not yet landed (`miss`) bites at weight × pull, after the hours, place and bait filters; a giant's
  // share is unchanged. `pool.sure` is the missing fish alone, for the sure bite. The missing set and the factor are part of the cache key.
  // Taper (WICKS §2.2 (b)): a giant's share × giantShare, never above giantCap; no other Wick changes a pool here.
  const GW = LOOP.wicks[simWick(wick)]?.giantShare ? LOOP.wicks[wick] : null, gk = GW ? `|g${GW.giantShare}/${GW.giantCap}` : '';
  const cache = miss ? PULLED : POOLS, key = (miss ? `${water}|${placeId}|${phase}|${lure}|${bait}|${pull}|${[...miss].sort().join(',')}` : `${water}|${placeId}|${phase}|${lure}|${bait}`) + gk;
  if (cache.has(key)) return cache.get(key);
  const P = placeId ? PLACE[placeId] : null, list = []; let giant = null;
  for (const s of WATER[water].species) {
    if (s.legend || s.never) continue;
    if (s.bait && s.bait !== bait) continue;
    // M1 step 3a's seam (PLAN CHOICE 27): a giant at its place reaches the giant branch whatever the hour (its offHour share outside its
    // hours, SPEC decision 7: "more in its hour, never none"); the hours filter applies to the rest. Before, the hours ran first, so a
    // giant had no share outside its hours (the Thousandcast none by day). data.placePool is the same rule on the game's records.
    if (s.giant) { if (P && s.placeId === P.id) giant = s; continue; }
    if (!s.hours.includes(phase)) continue;
    let w;
    const PW = LOOP.place;                                 // data.LOOP.place (M1 step 3a)
    if (s.ownPlace) { if (!P || s.ownPlace !== P.id) continue; w = (RW.rare ?? 6) * PW.kept.weight * PW.kept.live; }
    else if (s.kind !== 'open') { if (!P || P.kind !== s.kind) continue; w = (RW[s.rarity] ?? 6) * (s.rarity === 'common' ? PW.common : PW.kindWeight); }
    else w = (RW[s.rarity] ?? 6) * (P?.draws?.[s.id] ?? (P?.kind === 'day' && s.rarity !== 'common' ? PW.dayDraw : 1)) * (P && s.rarity === 'common' ? PW.common : 1);
    if (s.bestNight && phase === 'night') w *= 1.5;
    if (bait && s.bait === bait) w *= 1.5;               // a bait changes which fish bite only for a fish that bites on nothing else
    if (lureMatch(lure, s)) w *= lureAttract(lure, s);
    if (miss && miss.has(s.id)) w *= pull;
    list.push([s, w]);
  }
  const sure = miss ? list.filter(([s]) => miss.has(s.id)) : null;
  let others = list.reduce((a, [, w]) => a + w, 0);
  if (others < (RW.common ?? 70)) for (const s of WATER[water].species) {   // little of this hour here: the water's open fish still bite (nothing ever stops biting)
    if (s.kind !== 'open' || s.giant || s.legend || s.never || s.hours.includes(phase) || (s.bait && s.bait !== bait)) continue;
    const w = (RW[s.rarity] ?? 6) * (lureMatch(lure, s) ? lureAttract(lure, s) : 1); list.push([s, w]); others += w;
  }
  if (giant && others > 0) {                             // a giant is a fixed share of the bites at its place: more in its hour, never none
    const share = giant.hours.includes(phase) ? LOOP.giant.share.inHour : LOOP.giant.share.offHour, gl = LOOP.giantsLures[lure]?.includes(giant.id) ? lureAttract(lure, giant) : 1;   // only its own giants' lure draws it
    if (GW) { const s = Math.min(GW.giantCap, share * gl * GW.giantShare); list.push([giant, others * s / (1 - s)]); }
    else list.push([giant, others * share * gl / (1 - share * gl)]);
  }
  const pool = { list, tot: list.reduce((a, [, w]) => a + w, 0), sure: sure && sure.length ? { list: sure, tot: sure.reduce((a, [, w]) => a + w, 0) } : null };
  if (miss && PULLED.size > 60000) PULLED.clear();
  cache.set(key, pool); return pool;
}
const pick = (r, pool) => { let x = r() * pool.tot; for (const [s, w] of pool.list) { x -= w; if (x <= 0) return s; } return pool.list[pool.list.length - 1][0]; };
const STRIKES = Object.entries(A.player.strike);
const pickStrike = (r) => { let x = r(); for (const [g, f] of STRIKES) { x -= f; if (x <= 0) return g; } return 'struck'; };
const playMid = (c) => (A.play[c].dur[0] + A.play[c].dur[1]) / 2;
export const KIND_ORDER = { old: 0, day: 1, late: 2, night: 3, crown: 4, open: 5 };   // the natural route: old water first, day water while it is light,
// an old water whose giant bites only from dusk ("late", the hour glyph on its card) at dusk, night water when dark falls, open water to top up
// v8 (SPEC decision 21): so is an old water whose own fish bites only from dusk (the Chain Garden and its Candlewake Sturgeon)
const lateOwn = (P) => WATER[P.water].species.some((s) => s.ownPlace === P.id && !s.giant && !s.hours.includes('day'));
const routeKind = (P) => (P.kind === 'old' && ((P.giants.length && !SP[P.giants[0] + '@' + P.water].hours.includes('day')) || lateOwn(P)) ? 'late' : P.kind);
const LIGHT = ['day', 'dusk', 'night'];
/** The Journal route (SPEC §3.4, v8): while the water's list has fish missing, the Wick reads the Journal's silhouettes (a place glyph and
 *  the hour glyphs) and fishes first where a missing fish bites in the light there is: a place whose missing fish bite by day comes
 *  first (the day water before the old water: its fish have the least light), then open water for as long as its missing fish bite;
 *  a stop whose missing fish bite only later is fished when they do (the Wick waits there for the light to turn); the rest of the
 *  natural route follows, and open water tops up last. `home` maps each missing fish to its stop (null: open water). */
function journalRoute(kit, stops, miss) {
  const home = new Map(), first = new Map();
  for (const id of miss) {
    const s = SP[id + '@' + kit.water]; if (!s) continue;
    const h = s.ownPlace ? (kit.places.includes(s.ownPlace) ? s.ownPlace : undefined) : s.kind === 'open' ? null : kit.places.find((p) => PLACE[p].kind === s.kind && PLACE[p].inLake) ?? kit.places.find((p) => PLACE[p].kind === s.kind);
    if (h === undefined) continue;                         // its place is not owned: nothing to sail to
    home.set(id, h); first.set(h, Math.min(first.get(h) ?? 9, LIGHT.findIndex((ph) => s.hours.includes(ph))));
  }
  if (!home.size) return { stops, home };
  const keyed = [];
  for (const W of stops) {
    const e = first.get(W.id), nat = KIND_ORDER[W.route || W.kind] + 1;   // the natural route's order: old 1, day 2, late 3, night 4, crown 5, open 6
    if (e === undefined) { keyed.push([nat, W]); continue; }
    if (W.id === null) { if (e === 0) keyed.push([0.5, { ...W, target: true, early: true }]); keyed.push([nat, { ...W, target: true }]); continue; }
    keyed.push([e === 0 ? (W.route === 'late' ? nat : W.kind === 'day' ? 0 : 0.2) : Math.max(nat, e === 1 ? 3 : 4), { ...W, target: true }]);   // a dusk giant's old water keeps its hour
  }
  return { stops: keyed.sort((a, b) => a[0] - b[0]).map(([, W]) => W), home };
}

// =====================================================================================================================
// one trip.  kit: {water, rod, line, reel, hold, lure, bait, places: [ids], oars, keel, lantern}
// policy: {strike(cls, ctx), keep(fish, ctx), leave(ctx), waitDark}
// opts: {noQuiet} · the three keys (SPEC §5.5): {missing: Set of the water's listed fish not yet landed, n: evenings already ended there with
//   the list open, pull: false for no mercy, journal: true for the Journal route}. `out.landedIds` lists every fish landed, kept or let go.
// opts.wick (WICKS.md §3.1): a Wick id of LOOP.wicks (null: the no-passive reference row); every knob is read from LOOP.wicks. The Wick's sale needs opts.firsts, a ledger {seen, seals, best} (newLedger()) that the
//   trip reads and writes: without one the Wick's trip is the no-passive trip (its passive is the sale, not the fishing).
// =====================================================================================================================
/** An empty firsts ledger (WICKS §2.1: `meta.loop.firsts`, the loop's own, cleared by New Descent), and a copy of one. */
export const newLedger = () => ({ seen: new Set(), seals: new Set(), best: new Map() });
export const copyLedger = (l) => ({ seen: new Set(l.seen), seals: new Set(l.seals), best: new Map(l.best) });
const SEAL_CACHE = new Map();
/** Record a landed fish in the ledger as measure() stamps it (a new kind; that kind's first Prize, Trophy or Elder, sealsFor(sp); its first
 *  Ancient; a longer best). Returns what was new: {kind, seal, best, any}. */
export function stampFirst(led, sp, z, cls) {
  if (!SEAL_CACHE.has(sp.id)) SEAL_CACHE.set(sp.id, new Set(D.sealsFor(sp)));
  const can = SEAL_CACHE.get(sp.id), c = cls === 'ancient' ? 'elder' : cls, kind = !led.seen.has(sp.id);
  let seal = false;
  if (can.has(c) && !led.seals.has(`${sp.id}|${c}`)) { led.seals.add(`${sp.id}|${c}`); seal = true; }
  if (cls === 'ancient' && can.has('elder') && !led.seals.has(`${sp.id}|ancient`)) { led.seals.add(`${sp.id}|ancient`); seal = true; }
  const prev = led.best.get(sp.id), best = !kind && z > prev;
  if (kind || best) led.best.set(sp.id, z);
  led.seen.add(sp.id);
  return { kind, seal, best, any: kind || seal || best };
}
/** The Wick's first bonus on a fish worth `base` (WICKS §2.1): max(round(firstFloor × tier), round((firstMult − 1) × base)). */
export const firstBonus = (sp, base, K = LOOP.wicks.wick) => Math.max(Math.round(K.firstFloor * WATER[sp.water].base), Math.round((K.firstMult - 1) * base));

export function trip(kit, policy, r, opts = {}) {
  const L = LOOP, T = A.time, E = L.evening, F = L.favour;
  const wid = simWick(opts.wick), WK = wid ? L.wicks[wid] : null, pas = WK?.passive || null;
  const slots = wickSlots(kit.hold, wid);                          // Tallow: the bought hold + 1 (WICKS §2.4); everyone else the bought hold
  const freshOf = (W) => (opts.noQuiet ? Infinity : goodBitesFor({ kind: W.kind, holdSlots: kit.hold, wickId: wid }));
  const waitMul = pas === 'moth_bright' ? WK.waitMul : 1;           // Stub: every wait × waitMul (the sim has no legend cast inside a trip)
  const taperN = pas === 'long_reach' ? WK.firstBites ?? 1 : 0, taperLeft = new Map();   // Taper: first bites left under the rule, per water (or per evening)
  const led = pas === 'curious' ? opts.firsts || null : opts.firsts && opts.track ? opts.firsts : null;   // the Wick's ledger (or any Wick's, tracked for a report)
  const sail = (base) => base * L.time.raftSpeed / (L.time.raftSpeed + L.raft.oars.speed * (kit.oars | 0));
  let waters = [{ id: null, kind: 'open' }, ...kit.places.map((id) => ({ id, kind: PLACE[id].kind, route: routeKind(PLACE[id]) }))].sort((a, b) => KIND_ORDER[a.route || a.kind] - KIND_ORDER[b.route || b.kind]);
  const miss = opts.missing && opts.missing.size ? new Set(opts.missing) : null;          // a fish landed on this trip leaves the set at once
  const PULL = miss && opts.pull !== false ? L.access.pull : null, nEv = opts.n | 0;
  const pullBy = PULL ? Math.min(PULL.cap, 1 + PULL.perEvening * nEv) : 1, sureDone = PULL && nEv >= PULL.sureFrom ? new Set() : null;
  let home = null, openHere = 0, comeback = null;                  // Ashwick: {sp, z, at} the fish that got away, waiting at its water
  if (miss && opts.journal) ({ stops: waters, home } = journalRoute(kit, waters, miss));
  // the missing fish of a stop that bite in a light (the Journal's place and hour glyphs)
  const missAt = (W, ph) => { for (const [id, h] of home) if (h === W.id && miss.has(id) && SP[id + '@' + kit.water].hours.includes(ph)) return true; return false; };
  const baitFav = kit.bait && L.bait[kit.bait] ? L.baitRule.favour : 0;
  let clock = 0, real = 0, inQuiet = false;
  const out = { clams: 0, kept: 0, bites: 0, hooks: 0, landed: 0, letGo: 0, lost: 0, prize: 0, trophy: 0, elder: 0, elderBites: 0, nightBites: 0, baitUsed: 0, stale: 0,
    giantBites: 0, giantLanded: 0, giantKept: 0, giantClams: 0, giantRefused: 0, landedIds: [],
    slots, nonCommon: 0, waitSec: 0, quietSec: 0, quietClams: 0, firsts: 0, firstBonus: 0, newThings: 0, taperFirsts: 0, comebacks: 0, comebackLanded: 0 };
  const adv = (s, frozen = false) => { real += s; if (!frozen) clock += s; if (inQuiet) out.quietSec += s; };
  const phase = () => (clock < E.day ? 'day' : clock < E.day + E.dusk ? 'dusk' : 'night');
  const toDark = () => { const w = E.day + E.dusk - clock; if (w > 0) adv(w); };
  // Taper's first bite: the giant keeps its share (its roll comes first, unchanged), the rest is wickPoolWeights' (null: the rule waits).
  // The helper hands back the weights it was given when the sign rule fails (WICKS §2.2: the rule waits), so the same array means "not
  // served", even for a pool with no commons; a common left with weight means the same, whatever array a data.js helper returns
  const taperPool = (pool) => {
    const g = pool.list.find(([s]) => s.giant), rest = pool.list.filter(([s]) => !s.giant), w0 = rest.map(([, w]) => w);
    const w1 = wickPoolWeights(wid, rest.map(([s]) => s), w0, { firstBite: true, signRule: A.signRule });
    if (w1 === w0 || rest.some(([s], i) => s.rarity === 'common' && w1[i] > 0)) return null;
    const list = rest.map(([s], i) => [s, w1[i]]).filter(([, w]) => w > 0), others = list.reduce((a, [, w]) => a + w, 0);
    if (!others) return null;
    if (g) { const sh = g[1] / pool.tot; list.push([g[0], others * sh / (1 - sh)]); }
    return { list, tot: list.reduce((a, [, w]) => a + w, 0) };
  };
  const hold = [];
  adv(sail(L.time.out));
  if (policy.waitDark) toDark();
  outer: for (let wi = 0; wi < waters.length; wi++) {
    const W = waters[wi], last = wi === waters.length - 1;
    if (wi > 0 && waters[wi - 1].id !== W.id) adv(sail(L.time.between));
    if (W.kind === 'night') toDark();
    if (W.route === 'late' && clock < E.day) adv(E.day - clock);   // a dusk giant's old water: wait there for the light to turn
    if (W.target && miss.size && !missAt(W, phase())) {            // the Journal route: its missing fish bite later; wait there for the light to turn
      if (clock < E.day && missAt(W, 'dusk')) adv(E.day - clock); else if (missAt(W, 'night')) toDark();
    }
    let here = W.id === null ? openHere : 0, mercy = 0; const fresh = freshOf(W), tKey = WK?.perWater === false ? '*' : W.id ?? 'open';
    for (;;) {
      inQuiet = false;
      if (hold.length >= slots || out.bites >= 400) break outer;
      const cbHere = !!comeback && comeback.at === W.id;            // Ashwick's policy always takes a waiting comeback: no leaving
      if (!cbHere && W.early && !missAt(W, phase())) break;          // open water's missing fish are landed or their light is gone: on to the places; open water tops up last
      const over = Math.max(0, here - fresh);                        // the policies' count: quiet bites already taken here
      const qOver = Math.max(0, here + 1 - fresh);                   // this bite's quiet terms (PLAN CHOICE 17, the game's loop.favour): at 4 good bites the 5th is quiet
      const ctx = { slots: slots - hold.length, hold: slots, here, freshHere: Math.max(0, fresh - here), over, last, watersLeft: waters.length - 1 - wi, phase: phase(), kind: W.kind, giantHere: !!(W.id && PLACE[W.id].giants.length) };
      if (!cbHere && policy.leave(ctx)) { if (last) break outer; break; }
      const ph = phase(), night = ph === 'night';
      let sp, isCb = false;
      if (cbHere) { sp = comeback.sp; isCb = true; out.comebacks++; }   // the same fish, the next bite at this water: served (and so spent) now
      else {
        const pool = PULL && miss.size ? poolFor(kit.water, W.id, ph, kit.lure, kit.bait, miss, pullBy, wid) : poolFor(kit.water, W.id, ph, kit.lure, kit.bait, null, 1, wid);
        if (!pool.tot) { if (last) break outer; break; }
        const tLeft = taperN ? taperLeft.get(tKey) ?? taperN : 0;
        if (sureDone && pool.sure && !sureDone.has(W.id)) { sp = pick(r, pool.sure); sureDone.add(W.id); if (tLeft) taperLeft.set(tKey, tLeft - 1); }   // the sure bite: the first bite here in a light where a missing fish bites
        else if (tLeft) { const tp = taperPool(pool); if (tp) { sp = pick(r, tp); taperLeft.set(tKey, tLeft - 1); out.taperFirsts++; } else sp = pick(r, pool); }
        else sp = pick(r, pool);
      }
      const pulled = !!PULL && nEv >= PULL.floorFrom && miss.has(sp.id);
      const atOwn = sp.giant;                              // a giant only bites at its own place
      const q = quietTerms(qOver, wid);
      let mu = (W.id ? L.place.favour.base + L.place.favour.window[W.kind] : 0) + F.setup + (ph === 'dusk' ? F.dusk : night ? F.night + F.perLantern * (kit.lantern | 0) : 0)
        + baitFav + lureFavour(kit.lure, sp) + (sp.giant ? LOOP.giant.favour : 0) + q.favour + F.perKeel * (kit.keel | 0) + mercy;
      mu = Math.min(D.BALANCE_V3.favour.cap, mu);
      inQuiet = qOver > 0;
      const wait = T.wait * waitMul * q.waitMult; out.waitSec += wait;
      adv(T.cast + wait);
      const maxZ = Math.min(sp.maxClass ? SZ.classMaxZ[sp.maxClass] : SZ.z.max, W.kind === 'old' || atOwn ? SZ.z.max : SZ.elsewhereMaxZ);   // Elders: old water, and a giant at its own place
      const z = isCb ? comeback.z : truncZ(r, mu, sp.giant ? LOOP.giant.minZ : pulled ? Math.max(SZ.z.min, PULL.keeperFloor) : SZ.z.min, maxZ);   // a missing listed fish never bites Small
      if (isCb) comeback = null;
      const cls = D.isAncient(z) ? 'ancient' : D.sizeClassOf(z);
      here++; out.bites++; if (qOver > 0) out.stale++; if (night) out.nightBites++; if (CI[cls] >= 4) out.elderBites++; if (sp.giant) out.giantBites++; if (sp.rarity !== 'common') out.nonCommon++;
      if (!isCb && !policy.strike(cls, ctx)) { adv(L.time.pass); continue; }
      out.hooks++; if (kit.bait) out.baitUsed++;
      const p = landP(sp, cls, kit, pickStrike(r), night, isCb ? Math.min(C.buffs.runCap ?? C.buffs.cap, WK.hold) : 0);
      const quick = cls === 'small' || cls === 'keeper' ? 1 - A.player.hurry + A.player.hurry / A.play.inputs.hurry.mult : 1;
      adv(T.strike);
      if (r() < p) {
        out.landed++; if (sp.giant) out.giantLanded++; if (isCb) out.comebackLanded++;
        out.landedIds.push(sp.id); if (miss) miss.delete(sp.id);   // landed: its Journal entry is written at the measure, kept or let go
        adv(playMid(cls) * quick);
        adv(T.ceremony[cls] + L.time.show + T.card, true);
        const fish = { sp, z, cls, value: clamsFor(sp, z) };
        const first = led ? stampFirst(led, sp, z, cls) : null;   // the measure: the ledger keeps a let-go fish's records too
        if (first && (first.kind || first.seal)) out.newThings++;
        const kept = policy.keep(fish, ctx);
        if (kept) { hold.push(fish); if (CI[cls] >= 2) out.prize++; if (CI[cls] >= 3) out.trophy++; if (CI[cls] >= 4) out.elder++; if (sp.giant) { out.giantKept++; out.giantClams += fish.value; } } else { out.letGo++; mercy = Math.min(L.letGo.cap, mercy + L.letGo.favour); if (L.letGo.refund) here = Math.max(0, here - 1); }
        if (kept && inQuiet) out.quietClams += fish.value;
        if (kept && first?.any && pas === 'curious' && !sp.giant && !sp.legend) { out.firsts++; out.firstBonus += firstBonus(sp, fish.value, WK); }   // one bonus per fish, however many firsts
      } else {
        out.lost++; adv(playMid(cls) * quick * 0.72 + T.lostNote);
        if (pas === 'burns_back' && !isCb && !sp.giant && !sp.legend) comeback = { sp, z, at: W.id };   // it comes back once, tired; never a giant or a legend
      }
    }
    if (W.id === null) openHere = here;                             // the Journal route may visit open water twice: its good bites are counted once
  }
  inQuiet = false;
  adv(L.time.home + L.time.sale + L.time.shop, true);
  out.kept = hold.length; out.gross = hold.reduce((a, f) => a + f.value, 0);
  out.baitCost = kit.bait ? out.baitUsed * (baitTin(kit.bait, kit.water) / L.tinSize) : 0;
  out.clams = out.gross - out.baitCost + out.firstBonus; out.sec = real; out.sawNight = clock >= E.day + E.dusk;
  out.lostForGood = out.lost - out.comebacks;                       // each comeback answers one loss: landed, that fish is home; lost again, it is gone
  return out;
}

// =====================================================================================================================
// policies
// =====================================================================================================================
const anyFresh = (x) => x.freshHere > 0 || x.watersLeft > 0;
export const POL = {
  keepAll: (fill = 4) => ({ name: 'keep what bites', strike: () => true, keep: () => true, leave: (x) => x.freshHere === 0 && (!x.last || x.over >= fill) }),
  /** THE NATURAL RULE: let Smalls pass while good water is left, keep the rest, move on when a water goes quiet, top up a little, go home */
  natural: (fill = 4) => ({ name: 'natural: let Smalls pass, keep the rest', strike: (c, x) => c !== 'small' || !anyFresh(x), keep: () => true, leave: (x) => x.freshHere === 0 && (!x.last || x.over >= fill) }),
  picky: (fill = 6) => ({ name: 'picky: Prize+ while fresh, then fill', strike: () => true, keep: (f, x) => CI[f.cls] >= 2 || f.sp.giant || f.sp.rarity === 'rare' || !anyFresh(x), leave: (x) => x.freshHere === 0 && (!x.last || x.over >= fill) }),
  /** THE GIANT HUNT: strike Prize+ only, keep only a giant or a Trophy+, sit on the last water until the hold is full */
  giantHunt: (cap = 40) => ({ name: 'GIANT HUNT: keep only giants and Trophy+, stay till full', strike: (c) => CI[c] >= 1, keep: (f) => f.sp.giant || CI[f.cls] >= 3, leave: (x) => x.freshHere === 0 && (!x.last || x.over >= cap) }),
  grind: (min, cap = 40) => ({ name: `GRIND: only ${min}+, stay till full`, strike: (c) => CI[c] >= CI[min], keep: () => true, leave: (x) => x.freshHere === 0 && (!x.last || x.over >= cap) }),
  hop: (min) => ({ name: `only ${min}+, home when quiet`, strike: (c) => CI[c] >= CI[min], keep: () => true, leave: (x) => x.freshHere === 0 }),
  dark: () => ({ ...POL.natural(), name: 'wait for dark, then natural', waitDark: true }),
  /** WICKS §3.3 check 3, Taper's hop: one bite at each water, then on; open water (the last stop) is fished as the natural rule fishes it */
  hopOne: (fill = 4) => ({ ...POL.natural(fill), name: 'hop: one bite at each water, then on', leave: (x) => (x.last ? x.freshHere === 0 && x.over >= fill : x.here >= 1) }),
  grid: (sMin, kLast, fill) => ({ name: `grid ${sMin}/${kLast}/${fill}`, strike: (c, x) => CI[c] >= sMin || !anyFresh(x), keep: (f, x) => x.slots > 1 || CI[f.cls] >= kLast || f.sp.giant || !anyFresh(x), leave: (x) => x.freshHere === 0 && (!x.last || x.over >= fill) }),
};

const runOn = (...a) => run(...a);                         // calibrate() shadows run with a Wick's
/** n trips on one kit. opts as trip()'s; opts.firstsFrom: a ledger each trip starts from (a copy: the trip at that point of a game). */
export function run(kit, policy, n = N, seed = 1, opts = {}) {
  const r = rng(seed), acc = {}, all = []; let noBig = 0, anyTrophy = 0, anyElder = 0, full = 0, night = 0, nightBite = 0, giantBite = 0, giantHome = 0, comebackTrip = 0;
  for (let i = 0; i < n; i++) {
    const x = trip(kit, policy, r, opts.firstsFrom ? { ...opts, firsts: copyLedger(opts.firstsFrom) } : opts);
    for (const k of Object.keys(x)) if (typeof x[k] === 'number') acc[k] = (acc[k] || 0) + x[k];
    if (!x.prize) noBig++; if (x.trophy) anyTrophy++; if (x.elder) anyElder++; if (x.kept >= x.slots) full++; if (x.sawNight) night++; if (x.nightBites) nightBite++; if (x.comebacks) comebackTrip++;
    if (x.giantBites) giantBite++; if (x.giantKept) giantHome++;
    all.push(x.clams);
  }
  for (const k of Object.keys(acc)) acc[k] /= n;
  all.sort((a, b) => a - b);
  return { ...acc, min: acc.sec / 60, perMin: acc.clams / (acc.sec / 60), p10: all[(n * 0.1) | 0], p50: all[(n * 0.5) | 0], p90: all[(n * 0.9) | 0],
    noBig: noBig / n, anyTrophy: anyTrophy / n, anyElder: anyElder / n, full: full / n, night: night / n, nightBite: nightBite / n, giantBite: giantBite / n, giantHome: giantHome / n, comebackTrip: comebackTrip / n, name: policy.name };
}
function bestFound(kit, seed) {
  let best = null;
  for (const sMin of [0, 1, 2]) for (const kLast of [0, 1, 2]) for (const fill of [0, 2, 4, 8]) {
    const x = run(kit, POL.grid(sMin, kLast, fill), Math.max(600, N >> 2), seed);
    if (!best || x.perMin > best.perMin) best = { ...x, name: `best found (strike ${CLASSES[sMin]}+, last slot ${CLASSES[kLast]}+, ${fill} quiet bites)` };
  }
  return best;
}
const placesOf = (water, kinds = ['day', 'old', 'night', 'crown']) => WATER[water].places.filter((p) => kinds.includes(p.extra ? 'extra' : p.kind)).map((p) => p.id);
const bestLureOf = (water, owned) => {                     // the lure that pays best in this water, among those owned
  const W = WATER[water]; let best = null, bestV = -1;
  for (const id of owned) {
    if (LOOP.giantsLures[id] && !LOOP.giantsLures[id].some((s) => W.species.some((x) => x.id === s))) continue;
    const v = W.species.filter((s) => !s.legend && lureMatch(id, s)).reduce((a, s) => a + LOOP.value.rarity[s.rarity] * (s.giant ? 3 : 1), 0);
    if (v > bestV) { bestV = v; best = id; }
  }
  return best;
};

// =====================================================================================================================
// the three keys (SPEC §5.5): how long a water's list takes
// =====================================================================================================================
/** The fish of a water's list a player still has to land on arriving there: its list less the fish already landed for an earlier
 *  water's list (one Journal entry serves every list it is on: the Lampspot Snakehead of Pyrefall Gorge is ticked in Lampmoss Slough). */
export function listToLand(waterId) {
  const seen = new Set();
  for (const W of LOOP.waters) { if (W.id === waterId) break; for (const id of listFor(W.id)) seen.add(id); }
  return listFor(waterId).filter((id) => !seen.has(id));
}
const asc = (a, b) => a - b, quant = (a, q) => a[Math.min(a.length - 1, Math.floor(a.length * q))];
/** `players` players fish one water on `kit`, evening after evening, until every fish of its list is landed (kept or let go), on the
 *  natural rule. mode: {journal: the Journal route, pull: false for no mercy}. Times are pacing minutes (the visit home and the
 *  pacing player's 25% of looking around included). `open` is the share of players not done after `maxEv` evenings. */
export function listStudy(W, kit, players, mode = { journal: true }, seed = 7000 + W.order, maxEv = 400) {
  const r = rng(seed), start = listToLand(W.id), times = [], evs = []; let clams = 0, sec = 0, open = 0;
  for (let i = 0; i < players; i++) {
    const missing = new Set(start); let n = 0, t = 0;
    while (missing.size && n < maxEv) { const x = trip(kit, POL.natural(), r, { missing, n, ...mode }); t += x.sec; clams += x.clams; for (const id of x.landedIds) missing.delete(id); n++; }
    if (missing.size) open++;
    times.push(t * LOOP.player.time / 60); evs.push(n); sec += t;
  }
  times.sort(asc); evs.sort(asc);
  return { toLand: start.length, players, times, mean: times.reduce((a, b) => a + b, 0) / players, p50: quant(times, 0.5), p95: quant(times, 0.95), p99: quant(times, 0.99),
    ev: evs.reduce((a, b) => a + b, 0) / players, ev95: quant(evs, 0.95), perMin: clams / Math.max(1e-9, sec / 60), open: open / players };
}

// the tackle a water is fished on once you are settled there; the tackle and hold you own on the day you buy its map (the pacing order)
export const settleT = (W) => ({ mossmere: 1, sporewood: 2, glasswater: 3, paleabyss: 4 }[W.id] ?? (W.order < 10 ? 5 : 6));
export const settleHold = (W) => ({ mossmere: 5, sporewood: 6, glasswater: 7 }[W.id] ?? 8);
export const buyAt = (W) => ({ sporewood: [1, 5], glasswater: [3, 6], paleabyss: [4, 7] }[W.id] ?? [W.order <= 10 ? 5 : 6, 8]);
export const ordinaryPlaces = (W) => W.places.filter((p) => !p.legend).map((p) => p.id);
export const lakePlaces = (W) => W.places.filter((p) => p.inLake).map((p) => p.id);   // what a lake map opens besides its open water
/** A kit on one water: tackle tier t, a hold, the places owned, the water's plain bait (net of its price), a full raft; the best lure
 *  owned (family lures, and the water's own giants' lure if owned). */
export const kitAt = (W, t, hold, places, ownLure = true) => ({ water: W.id, rod: t, line: t, reel: t, hold, bait: W.plainBait, places, oars: LOOP.raft.oars.prices.length, keel: LOOP.raft.keel.prices.length, lantern: LOOP.raft.lantern.prices.length,
  lure: bestLureOf(W.id, [...Object.keys(LOOP.familyLures), ...(ownLure ? [W.lure[0]] : [])]) });
/** The two rules that make the next map worth having (SPEC §4.9): the new water's open water, on the day you buy it, pays at least
 *  OPEN × the old water fully mapped; and fully mapped, it pays GROWTH × the old water fully mapped once you are settled. */
export const LADDER = { open: 1.05, growth: 1.2, place: 0.05, margin: 0.02 };   // calibrate aims 2 points above each target, so a noisy run still clears it
export function calibrate(n = 3000, wick = null) {
  const rows = [], o = wick ? { wick } : {}, run = (k, p, nn, seed) => runOn(k, p, nn, seed, o);
  for (const [i, W] of LOOP.waters.entries()) {
    if (i === 0) { rows.push({ W, tier: W.base }); continue; }
    const Pw = LOOP.waters[i - 1], [bt, bh] = buyAt(W), st = settleT(W), keep = W.base;
    W.base = 1000;                                           // rates are linear in the tier (a tin's price too); 1000 keeps the rounding out
    const o1 = run(kitAt(W, bt, bh, lakePlaces(W), false), POL.natural(), n, 31 + W.order).perMin / 1000;
    const f1 = run(kitAt(W, st, 8, ordinaryPlaces(W)), POL.natural(), n, 31 + W.order).perMin / 1000;
    W.base = keep;
    const Fb = run(kitAt(Pw, bt, bh, ordinaryPlaces(Pw)), POL.natural(), n, 31 + Pw.order).perMin;
    const Fs = run(kitAt(Pw, st, 8, ordinaryPlaces(Pw)), POL.natural(), n, 31 + Pw.order).perMin;
    const byOpen = (LADDER.open + LADDER.margin) * Fb / o1, byGrowth = (LADDER.growth + LADDER.margin) * Fs / f1, tier = Math.ceil(Math.max(byOpen, byGrowth));
    W.base = tier;
    rows.push({ W, tier, byOpen, byGrowth, full: tier * f1, lakeAt25: 25 * tier * f1 });
  }
  return rows;
}

// =====================================================================================================================
// the pacing run (sim section 5): an average player along a sensible buying order. pacing() runs it, the report prints it.
// =====================================================================================================================
export const NL = QUICK ? 600 : 2000;                      // players per list study
/** Decision 38 (SPEC §4.7, "the shelf grows with the road"): the water whose map puts a shelf item on the shelf, as that water's order
 *  (1: the start). A lake map is offered with the map of the water before it; a place map and a legend hunt with their own water's map. */
export function withOf(id) {
  const [kind, a, b] = id.split(':');
  if (kind === 'hold') return { 7: 3, 8: 4 }[+a] ?? 1;
  if (kind === 'rod' || kind === 'line' || kind === 'reel') return LOOP.tackle.shelfAt[+a];
  if (kind === 'lake') return WATER[a].order - 1;
  if (kind === 'place') return WATER[PLACE[a].water].order;
  if (kind === 'legend') return LOOP.waters.find((w) => w.legend === a).order;
  if (kind === 'lure') return LOOP.familyLures[a] != null ? LOOP.familyLureAt[a] ?? 1 : LOOP.waters.find((w) => w.lure[0] === a).order;
  if (kind === 'raft') return a === 'keel' && +b === 3 ? 4 : 1;
  if (kind === 'home') return { orders: [1, 1, 3], baitBed: [1, 1, 4], wall: [1, 5, 9, 13], lights: [1, 3, 4] }[a][+b - 1];
  if (kind === 'look') return { slate_dye: 1, oxblood_pennant: 1, amber_glass: 1, painted_prow: 3, bell_buoy: 4, gilt_lantern: 5, reed_sail: 7, star_pennant: 11, moon_lamp: 15 }[a];
  throw new Error(id);
}
/** M1's steps (docs/loop/M1.md §2.5, §6.4): the step that first sells an item of the Mossmere's shelf. */
export function m1Step(id) {
  const [kind, a] = id.split(':');
  if (kind === 'hold') return +a <= 5 ? 1 : 3;
  if (kind === 'rod' || kind === 'line' || kind === 'reel') return 1;
  if (kind === 'place' || kind === 'legend') return 3;
  if (kind === 'lure' || kind === 'raft') return 4;
  if (kind === 'home') return a === 'orders' ? 4 : 5;
  if (kind === 'look') return 5;
  return 99;
}
const gearOrderId = (w) => { const g = gearKey(w); return !g ? null : g.slot === 'hold' ? `hold:${g.level}` : LOOP.raft[g.slot] ? `raft:${g.slot}:${g.level}` : `${g.slot}:${g.level}`; };
/** The pacing run's buying order (144 things; the gear keys moved before their maps). */
export function buyingOrder() {
  const pl = (w, kind) => WATER[w].places.filter((p) => !p.inLake && (kind === 'extra' ? p.extra : !p.extra && p.kind === kind)).map((p) => `place:${p.id}`);
  const crownOf = (w) => [...pl(w, 'crown'), `legend:${WATER[w].legend}`];
  const tiers = (t) => [`line:${t}`, `reel:${t}`, `rod:${t}`];
  const ORDER = [
    // ---- the Mossmere
    'hold:4', 'line:1', ...pl('mossmere', 'day'), 'rod:1', 'reel:1', 'raft:oars:1', 'home:orders:1', 'hold:5', ...pl('mossmere', 'old'), 'lure:glimmer_spoon',
    'lure:bone_jig', ...pl('mossmere', 'night'), 'lure:feather_fly', 'home:baitBed:1',
    'lake:sporewood', 'lure:bell_spinner', 'raft:lantern:1',
    // ---- Sporewood Pools
    'line:2', 'reel:2', 'rod:2', ...pl('sporewood', 'day'), 'home:wall:1', ...crownOf('mossmere'), ...pl('sporewood', 'old'), 'raft:oars:2', 'raft:keel:1', 'home:orders:2',
    'lure:sporelamp_fly', 'home:lights:1', ...pl('sporewood', 'extra'), 'lure:moth_popper', ...pl('sporewood', 'night'), 'hold:6', 'raft:lantern:2', 'look:slate_dye', 'raft:keel:2', 'line:3', 'look:oxblood_pennant', 'home:baitBed:2', 'reel:3', 'look:amber_glass', 'rod:3',
    'lake:glasswater',
    // ---- Glasswater Vault
    ...crownOf('sporewood'), ...pl('glasswater', 'day'), ...pl('glasswater', 'old'), 'lure:mirror_shard', 'home:lights:2', ...pl('glasswater', 'extra'),
    'home:orders:3', 'line:4', 'lure:lantern_lure', ...pl('glasswater', 'night'), 'hold:7', 'reel:4', 'look:painted_prow', 'rod:4',
    'lake:paleabyss',
    // ---- the Pallid Deep
    ...pl('paleabyss', 'day'), ...pl('paleabyss', 'old'), 'raft:keel:3', ...crownOf('glasswater'), 'home:baitBed:3', 'lure:ferry_coin', ...pl('paleabyss', 'night'), 'hold:8', 'home:lights:3', 'look:bell_buoy', ...tiers(5),
  ];
  // ---- the twelve new waters, one era each: the map, its day and old water, its giants' lure, the rest of its places, the crown before it
  const EXTRAS = { 5: ['home:wall:2', 'look:gilt_lantern'], 7: ['look:reed_sail'], 9: ['home:wall:3'], 10: [...tiers(6)], 11: ['look:star_pennant'], 13: ['home:wall:4'], 15: ['look:moon_lamp'] };
  for (const W of LOOP.waters.slice(4)) {
    const prev = LOOP.waters[W.order - 2].id, ex = EXTRAS[W.order] || [];
    ORDER.push(`lake:${W.id}`, ...ex.slice(0, 3), ...pl(W.id, 'day'), ...pl(W.id, 'old'), `lure:${W.lure[0]}`, ...crownOf(prev), ...pl(W.id, 'extra'), ...pl(W.id, 'night'), ...ex.slice(3));
  }
  ORDER.push(...crownOf(LOOP.waters[15].id));
  // v8: a gear key is bought before its map (the three seals show it from the first visit): any key the order above buys later moves to
  // just before its lake map. Today that is Rod T6 alone, the Thunder Stair's key (SPEC decision 37); Line and Reel T6 stay after that map.
  const movedKeys = [];
  for (const W of LOOP.waters.slice(1)) {
    const gid = gearOrderId(W.id), i = ORDER.indexOf(gid), j = ORDER.indexOf(`lake:${W.id}`);
    if (i < 0) throw new Error(`the gear key ${gid} of ${W.name} is not in the buying order`);
    if (i > j) { ORDER.splice(i, 1); ORDER.splice(j, 0, gid); movedKeys.push(`${NAME[W.id]}: ${gid}`); }
  }
  return { order: ORDER, movedKeys };
}
export const ITEM_NAMES_OF = { hold: (a) => `Hold ${a}`, rod: (a) => `Rod T${a}`, line: (a) => `Line T${a}`, reel: (a) => `Reel T${a}`, lake: (a) => `MAP: ${NAME[a]}`, place: (a) => `map: ${PLACE[a].name}`,
  lure: (a) => `lure: ${LURE_NAME[a] || a}`, raft: (a, b) => `raft: ${{ oars: 'Oars', keel: 'Keel', lantern: 'Lantern' }[a]} ${'I'.repeat(+b)}`,
  home: (a, b) => `home: ${{ orders: 'Order Board', baitBed: 'Bait Bed', wall: 'Long Wall wing', lights: 'Barge lights' }[a]} ${b}`, legend: (a) => `legend hunt: ${SPECIES.find((s) => s.id === a).name}`,
  look: (a) => `look: ${a.replace(/_/g, ' ')}` };
export const itemName = (id) => { const [k, a, b] = id.split(':'); return ITEM_NAMES_OF[k](a, b); };
export const PACING_MARKS = [[10 / 60, '10 min'], [1, '1 h'], [5, '5 h'], [20, '20 h'], [40, '40 h']];
export const M1_MARKS = [[10 / 60, '10 min'], [1, '1 h'], [2, '2 h']];
export const WICK_PLAYERS = 16;                            // the Wick's sampled players in a pacing run (its sale is their mean)

/** The pacing run. o: {wick: a Wick id (null: no passive), shipped: 'mossmere' (M1: the Mossmere's shelf alone, its fish and
 *  places as shipped at o.step 1–5), track: sample one player's catches along the run (the ledger, the giants, the list; the Wick always
 *  does, since its sale is paid on them)}. Every Wick buys the same order at the same prices (WICKS §2.4). */
export function pacing(o = {}) {
  const wid = simWick(o.wick), m1 = o.shipped === 'mossmere', step = o.step ?? 5, ek = wid === 'wick' ? null : wid;   // the Wick fishes as the no-passive player: its passive is the sale
  const KEYS = { list: {}, kit: {}, boughtAt: {}, openedAt: { mossmere: 0 }, gearAt: {}, era: {}, sealed: {}, doneH: 0 };
  const P = LOOP.player, state = { clams: 0, sec: 0, trips: 0, earned: 0, spent: 0, rod: 0, line: 0, reel: 0, hold: LOOP.hold.start, maps: ['mossmere'], open: [], places: new Set(), lures: new Set(), oars: 0, keel: 0, lantern: 0, orders: 0, baitBed: 0, wall: 0, lights: 0, legends: new Set() };
  const kitFor = (w, lure = bestLureOf(w, [...state.lures])) => ({ water: w, rod: state.rod, line: state.line, reel: state.reel, hold: state.hold, lure,
    bait: state.sec > 1800 && (!m1 || step >= 4) ? WATER[w].plainBait : null, places: WATER[w].places.filter((p) => state.places.has(p.id) && !p.legend).map((p) => p.id), oars: state.oars, keel: state.keel, lantern: state.lantern });
  const evalCache = new Map(), kitIdx = new Map();
  // the player fits the lure that pays best here, measured (v7.1): the giants' lure by its giants, or the best family lure owned. A kit's
  // seed is fixed by when the kit is first met, whichever Wick meets it (so the no-passive row and a Wick's row share their seeds there)
  const evalOne = (kit, w2 = ek) => {
    const kk = JSON.stringify(kit), key = `${w2}|${kk}`;
    if (!kitIdx.has(kk)) kitIdx.set(kk, kitIdx.size);
    if (!evalCache.has(key)) {
      const w = kit.water, x = run(kit, POL.natural(), QUICK ? 1000 : 1500, 9000 + kitIdx.get(kk), w2 ? { wick: w2 } : {});
      const bedFree = kit.bait ? Math.min(x.baitUsed, [0, 3, 6, 10][state.baitBed]) * (baitTin(kit.bait, w) / LOOP.tinSize) : 0;
      evalCache.set(key, { water: w, lure: kit.lure, clams: (x.clams + bedFree) * P.clams * (1 + P.orderGain * state.orders), min: x.min * P.time, kept: x.kept, elder: x.elder, giant: x.giantKept, slots: x.slots });
    }
    return evalCache.get(key);
  };
  const evalWater = (w) => {
    const lures = [...new Set([bestLureOf(w, [...state.lures]), bestLureOf(w, [...state.lures].filter((id) => LOOP.familyLures[id] != null))])];
    return lures.map((l) => evalOne(kitFor(w, l))).sort((a, b) => b.clams / b.min - a.clams / a.min)[0];
  };
  const bestWater = () => state.open.slice(-3).map(evalWater).sort((a, b) => b.clams / b.min - a.clams / a.min)[0];   // v8: the three newest OPEN waters
  // ---- the three keys (SPEC §5.5). A water opens when its map is bought, its gear key is owned and the list of the water before it is landed.
  // The list is modelled as landed once the player has fished that water for its 95th-percentile list time, measured (listStudy) on the kit
  // the water opened with: the pacing player is the slow one in twenty, so no figure here leans on luck.
  const fishedAt = {};                                      // pacing seconds fished at each water
  const ownsGear = (w) => { const g = gearKey(w); return !g || (g.slot === 'hold' ? state.hold : state[g.slot]) >= g.level; };
  const listDone = (w) => (fishedAt[w] || 0) >= KEYS.list[w].p95 * 60;
  const ledgerAt = {};                                      // the sampled player's firsts ledger on the day each water opens
  const openWater = (w) => { state.open.push(w); KEYS.openedAt[w] = state.sec / 3600; KEYS.kit[w] = kitFor(w, evalWater(w).lure); KEYS.list[w] = listStudy(WATER[w], KEYS.kit[w], NL, wid ? { journal: true, wick: ek } : { journal: true }); if (ledger) ledgerAt[w] = ledgers.map(copyLedger); };
  function legendCost(id) {
    const kit = { rod: state.rod, line: state.line, reel: state.reel }; let alive = 1, tries = 0;
    for (let k = 0; k < 12 && alive > 0.02; k++) { tries += alive; alive *= 1 - legendP(id, kit, k); }
    const W = LOOP.waters.find((w) => w.legend === id);
    return { cost: Math.round(tries * W.legendBait[1]), tries, prize: W.places.find((p) => p.legend).price };
  }
  const price = (id) => {
    const [kind, a, b] = id.split(':');
    if (kind === 'hold') return LOOP.hold.ladder.find((h) => h.slots === +a).price;
    if (kind === 'rod' || kind === 'line' || kind === 'reel') return LOOP.tackle.price[+a];
    if (kind === 'lake') return WATER[a].lake;
    if (kind === 'place') return PLACE[a].price;
    if (kind === 'lure') return LOOP.familyLures[a] ?? LOOP.waters.find((w) => w.lure[0] === a).lure[1];
    if (kind === 'raft') return LOOP.raft[a].prices[+b - 1];
    if (kind === 'home') return LOOP.home[a].prices[+b - 1];
    if (kind === 'look') return LOOP.looks[a];
    if (kind === 'legend') return legendCost(a).cost;
    throw new Error(id);
  };
  const apply = (id) => {
    const [kind, a, b] = id.split(':');
    if (kind === 'hold') state.hold = +a; else if (kind === 'rod' || kind === 'line' || kind === 'reel') state[kind] = +a;
    else if (kind === 'lake') { state.maps.push(a); for (const p of WATER[a].places) if (p.inLake) state.places.add(p.id); } else if (kind === 'place') state.places.add(a); else if (kind === 'lure') state.lures.add(a);
    else if (kind === 'raft' || kind === 'home') state[a] = +b; else if (kind === 'legend') { state.legends.add(a); state.clams += legendCost(a).prize; }
  };
  const full = buyingOrder(), ORDER = m1 ? full.order.filter((id) => withOf(id) === 1 && m1Step(id) <= step) : full.order, movedKeys = m1 ? [] : full.movedKeys;
  const log = [], marks = m1 ? M1_MARKS : PACING_MARKS, markRows = []; let mi = 0, lastBuyTrips = 0; const sinceBuy = [];
  let elders = 0, giants = 0, giantAt = null;
  // ---- one player's catches along the run (the Wick's sale is paid on them; for every Wick, the M1 report's giants, list and "nothing new")
  // the Wick's sale is the mean over WICK_PLAYERS sampled players, each with its own ledger (the pacing run is an expectation); player 0's
  // catches are the M1 report's one sampled player (its giants, its list, its longest run of trips with nothing new)
  const nS = wid === 'wick' ? WICK_PLAYERS : o.track ? 1 : 0, sample = nS > 0, rSs = [...Array(nS)].map((_, i) => rng((o.sampleSeed ?? 4711) + 101 * i));
  const ledgers = rSs.map(() => newLedger()), ledger = ledgers[0] || null, giantHome = {}, listMiss = new Set(listFor('mossmere'));
  let listDoneH = listMiss.size ? null : 0, bought = false, streak = 0, streakMin = 0, dull = { trips: 0, min: 0, at: 0 }, bonusAll = 0;
  const recentBonus = [], first25 = [], era = {};          // era[the newest open water]: {cw, tw, cn, tn}: this Wick's clams and minutes, and the no-passive player's on the same kits
  const snapshot = (label) => {
    const e = bestWater(), recent = sinceBuy.slice(-6), tpp = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 1;
    const rb = recentBonus.length ? recentBonus.reduce((a, b) => a + b, 0) / recentBonus.length : 0;
    markRows.push({ label, owned: state.maps.length, clams: e.clams + rb, min: e.min, tpp, bought: log.length, water: e.water, hold: state.hold, slots: wickSlots(state.hold, wid), h: state.sec / 3600,
      state: `T${state.rod}/${state.line}/${state.reel}, hold ${state.hold}${wickSlots(state.hold, wid) !== state.hold ? ` (${wickSlots(state.hold, wid)} slots)` : ''}, ${state.maps.length} water${state.maps.length > 1 ? 's' : ''}, ${state.places.size} place${state.places.size === 1 ? '' : 's'}`, giants, ledgers: ledger ? ledgers.map(copyLedger) : null });
  };
  const firstFished = {};
  openWater('mossmere');
  // `at`: a sealed water waits on the list alone, so the player fishes the water whose list it is, whatever pays best
  const playTrip = (at = null) => {
    const e = at ? evalWater(at) : bestWater();
    let bonus = 0;
    if (sample) {
      const kitE = kitFor(e.water, e.lure), xs = rSs.map((r, i) => trip(kitE, POL.natural(), r, { wick: wid, firsts: ledgers[i], track: true })), sx = xs[0];
      bonus = wid === 'wick' ? xs.reduce((a, x) => a + x.firstBonus, 0) / nS * P.clams : 0; bonusAll += bonus;
      recentBonus.push(bonus); if (recentBonus.length > 10) recentBonus.shift();
      for (const id of sx.landedIds) { const sp = SP[id + '@' + e.water]; if (sp?.giant && !sp.legend && giantHome[id] == null) giantHome[id] = (state.sec + e.min * 60) / 3600; if (e.water === 'mossmere') listMiss.delete(id); }
      if (listDoneH === null && !listMiss.size) listDoneH = (state.sec + e.min * 60) / 3600;
      if (sx.newThings > 0 || bought) { streak = 0; streakMin = 0; bought = false; } else { streak++; streakMin += e.min; if (streak > dull.trips) dull = { trips: streak, min: streakMin, at: state.sec / 3600 }; }
    }
    if (wid) {                                              // the per-era gain over the no-passive player, on the kits this Wick fishes
      const n0 = ek ? evalOne(kitFor(e.water, e.lure), null) : e, A0 = (era[state.open[state.open.length - 1]] ||= { cw: 0, tw: 0, cn: 0, tn: 0, trips: 0 });
      A0.cw += e.clams + bonus; A0.tw += e.min; A0.cn += n0.clams; A0.tn += n0.min; A0.trips++;
    }
    if (first25.length < 25) first25.push({ clams: e.clams + bonus, min: e.min });
    if (firstFished[e.water] == null) firstFished[e.water] = state.sec / 3600;
    fishedAt[e.water] = (fishedAt[e.water] || 0) + e.min * 60; state.clams += e.clams + bonus; state.earned += e.clams + bonus; state.sec += e.min * 60; state.trips++; elders += e.elder; giants += e.giant;
    if (giantAt === null && giants >= 1) giantAt = state.sec / 3600;
    while (mi < marks.length && state.sec / 3600 >= marks[mi][0]) snapshot(marks[mi++][1]);
    return e;
  };
  const gains = [], nG = QUICK ? 3000 : 6000, gOpt = ek ? { wick: ek } : {};
  const queue = [...ORDER];
  const buy = (id) => {
    const cost = price(id); let guard = 0;
    while (state.clams < cost && guard++ < 20000) playTrip();
    const kindOf = id.split(':')[0], measure = kindOf === 'hold' || kindOf === 'raft';
    const b0 = measure ? bestWater() : null, w0 = b0?.water, x0 = measure ? run(kitFor(w0, b0.lure), POL.natural(), nG, 606, gOpt) : null, trip0 = measure ? b0.clams : 0;
    state.clams -= cost; state.spent += cost; apply(id); bought = true;
    if (measure) { const x1 = run(kitFor(w0, b0.lure), POL.natural(), nG, 606, gOpt); gains.push({ id, name: itemName(id), h: state.sec / 3600, g: x1.perMin / x0.perMin - 1, gt: x1.clams / x0.clams - 1, trips: cost / trip0 }); }
    const [kind, a] = id.split(':'), hBuy = state.sec / 3600;
    for (const W of LOOP.waters) if (KEYS.gearAt[W.id] == null && gearOrderId(W.id) === id) KEYS.gearAt[W.id] = hBuy;
    const entry = { id, name: itemName(id), cost, h: hBuy, trips: state.trips, waited: state.trips - lastBuyTrips, clamsLeft: state.clams };
    sinceBuy.push(entry.waited); log.push(entry); lastBuyTrips = state.trips;
    if (kind === 'lake') {                                  // v8: the map inks the water; it opens with its gear key and the list of the water before
      const prevW = LOOP.waters[WATER[a].order - 2].id, gid = gearOrderId(a); let g2 = 0;
      KEYS.boughtAt[a] = hBuy; KEYS.gearOwned = (KEYS.gearOwned ?? true) && ownsGear(a);
      if (!ownsGear(a)) { const k = queue.indexOf(gid); if (k >= 0) queue.splice(k, 1); buy(gid); }   // the sealed sheet shows the gear seal hollow: it is the next thing bought
      KEYS.era[prevW] = (fishedAt[prevW] || 0) / 60;        // the fishing the water before had when the map and its gear were in hand
      while (!listDone(prevW) && g2++ < 20000) playTrip(prevW);
      KEYS.sealed[a] = (state.sec / 3600 - hBuy) * 60;
      openWater(a);
    }
    const e = bestWater();
    entry.water = e.water; entry.perTrip = e.clams; entry.min = e.min;
  };
  while (queue.length) buy(queue.shift());
  const doneH = state.sec / 3600, banked = state.clams;
  const lastW = m1 ? 'mossmere' : LOOP.waters[15].id;
  KEYS.doneH = doneH; KEYS.era[lastW] = (fishedAt[lastW] || 0) / 60; KEYS.movedKeys = movedKeys;
  const trips = state.trips;
  while (mi < marks.length && state.trips < 40000) playTrip();
  const byKind = {}; for (const l of log) { const k = l.id.split(':')[0]; const g = k === 'lake' || k === 'place' ? 'maps' : k === 'rod' || k === 'line' || k === 'reel' ? 'tackle' : k === 'look' ? 'looks' : k; byKind[g] = (byKind[g] || 0) + l.cost; }
  const longest = log.reduce((a, l) => (l.waited * l.min > a.w ? { w: l.waited * l.min, l } : a), { w: 0, l: null });
  return { wick: wid, knobs: wid ? JSON.stringify(LOOP.wicks[wid]) : null, m1, step, KEYS, log, markRows, gains, doneH, trips, banked, spent: state.spent, earned: state.earned, byKind, firstFished, giantAt, giants, elders, longest,
    era, first25, ledger, ledgers, ledgerAt, giantHome, listDoneH, dull, bonusAll, state };
}

// section 2's stations (and --wicks')
const full = (w, extra = []) => [...placesOf(w, ['day', 'old', 'night']), ...extra];
const W6 = LOOP.waters[5], W12 = LOOP.waters[11];   // the stations at 20 h and 40 h are slots, not waters (SPEC v7 re-ordered the waters)
const STAGES = [
  { id: 'start', label: 'first trip: T0, hold 3, the Mossmere, open water only', kit: { water: 'mossmere', rod: 0, line: 0, reel: 0, hold: 3, lure: null, bait: null, places: [], oars: 0, keel: 0, lantern: 0 } },
  { id: '10min', label: '10 min: Line T1, hold 4, the Lily Maze', kit: { water: 'mossmere', rod: 0, line: 1, reel: 0, hold: 4, lure: null, bait: null, places: ['lily_maze'], oars: 0, keel: 0, lantern: 0 } },
  { id: '1h', label: '1 h: T1, hold 5, the Mossmere with 3 places, Glimmer Spoon', kit: { water: 'mossmere', rod: 1, line: 1, reel: 1, hold: 5, lure: 'glimmer_spoon', bait: null, places: full('mossmere'), oars: 1, keel: 1, lantern: 0 } },
  { id: '5h', label: '5 h: T2, hold 6, Sporewood with its 4 ordinary places, Glimmer Spoon', kit: { water: 'sporewood', rod: 2, line: 2, reel: 2, hold: 6, lure: 'glimmer_spoon', bait: null, places: placesOf('sporewood', ['day', 'old', 'night', 'extra']), oars: 2, keel: 1, lantern: 1 } },
  { id: '20h', label: `20 h: T5, hold 8, ${NAME[W6.id]} (slot 6) with 3 places, its giants' lure`, kit: { water: W6.id, rod: 5, line: 5, reel: 5, hold: 8, lure: W6.lure[0], bait: null, places: full(W6.id), oars: 3, keel: 2, lantern: 2 } },
  { id: '40h', label: `40 h: T6, hold 8, ${NAME[W12.id]} (slot 12) with 4 places, Glimmer Spoon`, kit: { water: W12.id, rod: 6, line: 6, reel: 6, hold: 8, lure: 'glimmer_spoon', bait: null, places: placesOf(W12.id, ['day', 'old', 'night', 'extra']), oars: 3, keel: 3, lantern: 3 } },
];

/** The Wick's firsts over a run of evenings: `players` players fish `trips` evenings each on one kit, each from a copy of one of the ledgers
 *  `from` (null: an empty ledger, a New Descent). gain: the clams its firsts add ÷ the clams the same fish sell for; ticks: first-sale
 *  ticks an evening. */
export function firstsGain(kit, from, trips, players, seed) {
  const r = rng(seed); let base = 0, bonus = 0, ticks = 0;
  for (let p = 0; p < players; p++) {
    const led = from ? copyLedger(from[p % from.length]) : newLedger();
    for (let t = 0; t < trips; t++) { const x = trip(kit, POL.natural(), r, { wick: 'wick', firsts: led }); base += x.clams - x.firstBonus; bonus += x.firstBonus; ticks += x.firsts; }
  }
  return { gain: bonus / Math.max(1e-9, base), ticks: ticks / players / trips };
}

// =====================================================================================================================
// --shipped=mossmere: M1's own arc (docs/loop/M1.md §6.4), the Mossmere and its shelf alone
// =====================================================================================================================
/** The Mossmere as M1 ships it at a step (M1.md §2.3, §6.4): step 1 slice 1a's six built kinds at their built sizes in open water; step 2
 *  the roster's open-water fish but the Kissmark Trout (11); from step 3 every Mossmere fish, its four places, two giants and legend (the
 *  Gloam Eel bites on Lumen Moss only, a step-4 tin). Call before any pool is drawn: it edits the water in place and empties the caches. */
/** M1 step 2's Mossmere (M1.md §2.3): its open-water fish but the Kissmark Trout (its plan ships in step 3), 11 (no edit, no cache). */
export function step2Pool(W = WATER.mossmere) { return W.species.filter((s) => s.kind === 'open' && !s.ownPlace && !s.giant && !s.legend && s.id !== 'kissmark_trout'); }
export function shipMossmere(step) {
  const W = WATER.mossmere;
  if (step <= 1) {
    const ids = ['dusk_minnow', 'mossback_perch', 'gutter_crayfish', 'weeping_carp', 'candlefin_koi', 'reedjaw_pike'];
    for (const id of ids) { const sp = SP[id + '@mossmere'], b = D.SPECIES_V3_BY_ID[id]; Object.assign(sp, { rarity: b.rarity, L50: b.size.L50, style: b.style, family: b.family, hours: BUILT_TIME[b.time] || HOURS.any, kind: 'open', ownPlace: undefined, bait: null }); }
    W.species = W.species.filter((s) => ids.includes(s.id));
  } else if (step === 2) W.species = step2Pool(W);
  for (const c of [POOLS, PULLED, LISTS, P_CACHE]) c.clear();
  return W.species;
}

// =====================================================================================================================
// the report
// =====================================================================================================================
function report() {
const f0 = (v) => Math.round(v).toLocaleString('en-US');
const f1 = (v) => v.toFixed(1);
const pc = (v) => `${Math.round(v * 100)}%`;
function table(head, rows) {
  if (MD) { console.log(`| ${head.join(' | ')} |\n|${head.map(() => '---').join('|')}|`); for (const r of rows) console.log(`| ${r.join(' | ')} |`); console.log(''); return; }
  const w = head.map((h, i) => Math.max(String(h).length, ...rows.map((r) => String(r[i]).length)));
  const line = (r) => r.map((c, i) => (i === 0 ? String(c).padEnd(w[i]) : String(c).padStart(w[i]))).join('  ');
  console.log(line(head)); console.log(w.map((n) => '-'.repeat(n)).join('  ')); for (const r of rows) console.log(line(r)); console.log('');
}
const title = (s) => console.log(`\n${MD ? '### ' : '==================== '}${s}\n`);
const failures = [];
const check = (ok, label) => { console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}`); if (!ok) failures.push(label); };
const z = SZ.simZ, CL5 = ['small', 'keeper', 'prize', 'trophy', 'elder'];
const warns = [];
const warn = (ok, label) => { console.log(`${ok ? 'ok  ' : 'warn'}  ${label}`); if (!ok) warns.push(label); };
const within = (v, lo, hi) => v >= lo && v <= hi;
const sg = (v) => `${v >= 0 ? '+' : ''}${(v * 100).toFixed(1)}%`;
// ---- the tables data.js holds (slice-1a PLAN §6.4, T42): checked in every mode, before anything is printed from them
{
  const drafted = MOVED.filter((k) => k in DRAFT), mismatched = MOVED.filter((k) => LOOP[k] !== D.LOOP[k]);
  check(!drafted.length && !mismatched.length && D.LOOP_ENABLED === true, `T42: the sim reads data.LOOP's ${MOVED.join(', ')}; none is still drafted here${drafted.length ? ` (drafted: ${drafted.join(', ')})` : ''}${mismatched.length ? ` (not data's: ${mismatched.join(', ')})` : ''}`);
  const MW = WATER.mossmere;
  check(MW.base === D.LOOP.waters.mossmere.tier && JSON.stringify(MW.prices) === JSON.stringify(D.LOOP.waters.mossmere.prices), `the Mossmere's value tier (${MW.base}) and place prices are data.LOOP.waters.mossmere's`);
  // the sale rule is one rule: the sim's clamsFor equals data.fishClams for every built Mossmere species on its built L50, at every class
  const built = D.SPECIES.filter((s) => s.zone === 'mossmere' && s.rarity !== 'legendary' && !s.cove && s.size);
  const off = [];
  for (const s of built) for (const zz of [-1.2, 0, 0.4, 1.4, 2.2, 2.95]) {
    const like = { water: 'mossmere', rarity: s.rarity, L50: D.sizeL50(s, 'mossmere') };
    if (clamsFor(like, zz) !== D.fishClams(s, zz)) off.push(`${s.id} z ${zz}: ${clamsFor(like, zz)} vs ${D.fishClams(s, zz)}`);
  }
  check(built.length >= 6 && !off.length, `the sim's clamsFor equals data.fishClams for all ${built.length} built Mossmere species on their L50 (data.sizeL50: the roster's from M1 step 2), at six sizes${off.length ? `: ${off.slice(0, 4).join('; ')}` : ''}`);
  // M1 steps 2 and 3a (SPEC §13): the converter's output (data.js SPECIES_LOOP, the game's) equals the sim's species table for every fish
  // it ships: the open water's twelve, then the places' own fish and giants (15; the Gloam Eel and the Matriarch stay built records)
  {
    const sim = MW.species.filter((s) => !s.legend && !s.never && (s.kind === 'open' || s.ownPlace || s.giant)), game = D.SPECIES_LOOP, G = Object.fromEntries(game.map((g) => [g.id, g])), bad = [];
    const win = (g) => RS.HOUR_WINDOWS[g.time] || BUILT_TIME[g.time] || HOURS.any;
    for (const s of sim) {
      const g = G[s.id];
      if (!g) { bad.push(`${s.id} not in SPECIES_LOOP`); continue; }
      const diffs = [['rarity', s.rarity, g.rarity], ['style', s.style, g.style], ['family', s.family, g.family], ['L50', s.L50, D.sizeL50(g, 'mossmere')],
        ['hours', JSON.stringify(s.hours), JSON.stringify(win(g))], ['bait', s.bait ?? null, g.bait ?? null], ['giant', !!s.giant, !!g.giant],
        ['place', s.placeId || s.ownPlace || null, g.place || null]].filter(([, a, b]) => a !== b);
      for (const zz of [-1.2, 0, 0.4, 1.4, 2.2, 2.95]) if (clamsFor(s, zz) !== D.fishClams(g, zz)) diffs.push([`clams z ${zz}`, clamsFor(s, zz), D.fishClams(g, zz)]);
      if (diffs.length) bad.push(`${s.id}: ${diffs.map(([k, a, b]) => `${k} ${a} vs ${b}`).join(', ')}`);
    }
    const same = sim.length === game.length && sim.every((s) => G[s.id]);
    check(same && !bad.length && game.length === 15, `M1 steps 2 and 3a: the converter's output (data.js SPECIES_LOOP, ${game.length} fish) equals the sim's species table for the Mossmere's ${sim.length} (rarity, style, family, L50, hours, bait, giant, place, clams at six sizes)${bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''}${same ? '' : ` (sim: ${sim.map((s) => s.id).join(', ')})`}`);
  }
  // M1 step 3a (PLAN T104): the game's pool is the sim's. data.placePool (on the game's records, D.SPECIES) gives each species the share
  // the sim's poolFor gives it (within 1e-9) and the giant its share exactly, in open water and at each place in each light where the place
  // is a place (night water before dark is open water: PLAN CHOICE 3), with no bait, the Heartmoss Ball and Lumen Moss, no Wick and Taper;
  // the Gloam Eel bites only at the Buoy Lights after dark on Lumen Moss
  {
    const LIGHTS = { day: 'calm', dusk: 'dusk', night: 'gloomtide' }, places = [null, ...D.loopPlaceIds('mossmere')], bad = [];
    let n = 0, worst = 0, shares = 0, eelAt = [];
    for (const pid of places) for (const [ph, gph] of Object.entries(LIGHTS)) for (const bait of [null, 'heartmoss', 'lumen_moss']) for (const wick of [null, 'taper']) {
      const dark = ph === 'night', simPid = pid && !(PLACE[pid]?.kind === 'night' && !dark) ? pid : null;
      const sim = poolFor('mossmere', simPid, ph, null, bait, null, 1, wick), game = D.placePool(D.SPECIES, { placeId: pid, phase: gph, bait, wickId: wick });
      const gl = [...game.list, ...(game.giant ? [[game.giant.sp, game.giant.weight]] : [])];
      const sh = (list, tot) => new Map(list.map(([s, w]) => [s.id, w / tot]));
      const a = sh(sim.list, sim.tot), b = sh(gl, game.tot), ids = new Set([...a.keys(), ...b.keys()]);
      for (const id of ids) {
        const d = Math.abs((a.get(id) ?? 0) - (b.get(id) ?? 0)); worst = Math.max(worst, d); shares++;
        if (!a.has(id) || !b.has(id) || d > 1e-9) bad.push(`${pid || 'open'} ${ph} ${bait || 'no bait'} ${wick || 'none'}: ${id} ${a.get(id) ?? '—'} vs ${b.get(id) ?? '—'}`);
      }
      const sg = sim.list.find(([s]) => s.giant);
      if (!!sg !== !!game.giant || (sg && Math.abs(sg[1] / sim.tot - game.giant.share) > 1e-12)) bad.push(`${pid} ${ph} ${wick || 'none'}: the giant's share ${sg ? sg[1] / sim.tot : '—'} vs ${game.giant?.share ?? '—'}`);
      if (b.has('gloam_eel')) eelAt.push(`${pid || 'open'} ${ph} ${bait || 'no bait'}`);
      n++;
    }
    const eelOk = eelAt.length && eelAt.every((x) => x.startsWith('buoy_lights night lumen_moss'));
    const span = (ph) => `${((D.placePool(D.SPECIES, { placeId: 'under_the_span', phase: ph }).giant?.share ?? 0) * 100).toFixed(1)}%`;
    check(!bad.length && eelOk, `T104: the game's pool is the sim's (data.placePool against poolFor, ${n} pools: open water and each place in each light it is a place, no bait, the Heartmoss Ball and Lumen Moss, no Wick and Taper; ${shares} shares, worst ${worst.toExponential(1)}): the Thousandcast ${span('calm')} by day, ${span('dusk')} at dusk; the Gloam Eel only at the Buoy Lights after dark on Lumen Moss${bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''}${eelOk ? '' : ` (the eel: ${eelAt.join(', ') || 'nowhere'})`}`);
  }
  const wk = JSON.stringify(Object.fromEntries(WICK_IDS.map((w) => [w, LOOP.wicks[w]]))), dk = JSON.stringify(Object.fromEntries(WICK_IDS.map((w) => [w, D.LOOP.wicks[w]])));
  check(wk === dk && JSON.stringify(LOOP.wicks.order) === JSON.stringify(D.LOOP.wicks.order), "the sim's Wick table is data.LOOP.wicks (the balancing job's values, as ruled)");
  check(STAND_INS.length === 0, `the Wicks' helpers are data.js's own (${['wickSlots', 'goodBitesFor', 'quietTerms', 'wickPoolWeights'].join(', ')})${STAND_INS.length ? `: stand-ins for ${STAND_INS.join(', ')}` : ''}`);
}
const ASHWICK_SEEN = 0.6;         // Ashwick's "seen" floor: a comeback on at least 60% of first trips (the lead, 15 November 2026; WICKS §3.2, §3.5 decision 1)
const TALLOW_TRIP_HOLD8 = 6.1;   // Tallow's own trip ceiling at Hold 8, its 9 slots (the lead, 15 November 2026: measured 6.05 with everyWater; WICKS §4 guard 3)
const wickName = (w) => (w ? { wick: 'the Wick', taper: 'Taper', stub: 'Stub', tallow: 'Tallow', ashwick: 'Ashwick' }[w] : 'none');
/** Section 5's tables and checks on one pacing run. tag: '' for the no-passive run (section 5 itself), else a Wick's name, set before
 *  every check. Tallow's clams-a-trip marks are read per slot and its trips must print under 6.0 min, Tallow's at Hold 8 at most 6.1 (WICKS §3.3 check 1, §4 guard 3). */
function pacingReport(R, { tag = '', print = true } = {}) {
  const { log, markRows, gains, KEYS: K, doneH, giantAt, giants, elders, longest, byKind, firstFished } = R;
  const ck = (ok, label) => check(ok, (tag ? `[${tag}] ` : '') + label);
  // a band of the no-passive curve's own level (clams a trip, purchases and maps by an hour): a Wick is meant to be faster (WICKS §3.2, +5–20% a
  // minute), so for a Wick these are printed as warnings, not failures; the structural checks (and the ±5% of check 1) stay failures
  const band = (ok, label) => (tag ? warn(ok, `[${tag}] ${label}`) : check(ok, label));
  const perSlot = (m) => m.clams * m.hold / m.slots, slotNote = R.wick === 'tallow' ? ' per slot' : '';
  const at = (id) => log.find((l) => l.id === id);
  if (print) {
    table(['#', 'hour', 'trips', 'waited', 'buys', 'clams', 'then fishing', 'clams/trip', 'min/trip'],
      log.map((l, i) => [i + 1, l.h.toFixed(2), l.trips, l.waited, l.name, f0(l.cost), NAME[l.water], f0(l.perTrip), f1(l.min)]));
    console.log(`${log.length} purchases, ${f0(R.spent)} clams spent of ${f0(R.earned)} earned in ${doneH.toFixed(1)} h and ${f0(log[log.length - 1].trips)} trips.`);
    console.log(`Where the clams go: ${Object.entries(byKind).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${pc(v / R.spent)}`).join(' · ')}\n`);
    title(tag ? `5b. The pacing marks (${tag})` : '5b. The pacing marks');
    table(['mark', `clams/trip${slotNote}`, 'min/trip', 'trips per purchase', 'bought', 'fishing', 'state', 'giants landed'], markRows.map((m) => [m.label, f0(perSlot(m)), f1(m.min), f1(m.tpp), m.bought, NAME[m.water], m.state, f1(m.giants)]));
    title(tag ? `5c. When each water opens (${tag})` : '5c. When each water opens');
    table(['water', 'map bought at', 'opens at (its three keys held)', 'the best water to fish from', 'its legend landed at'], LOOP.waters.map((W) => [`${W.order}. ${W.name}`, W.order === 1 ? 'start' : `${at(`lake:${W.id}`).h.toFixed(1)} h`, W.order === 1 ? 'start' : `${K.openedAt[W.id].toFixed(1)} h`, firstFished[W.id] == null ? 'never' : `${firstFished[W.id].toFixed(1)} h`, `${at(`legend:${W.legend}`).h.toFixed(1)} h`]));
  }
  ck(LOOP.waters.every((W) => firstFished[W.id] != null), 'every water becomes the best water to fish for a while');
  const M = Object.fromEntries(markRows.map((m) => [m.label, m]));
  if (print) console.log(`Longest wait for one purchase: ${f0(longest.w)} min (${longest.l.name}). Giants landed and kept by the last purchase: ${f1(giants)} (the first at about hour ${giantAt === null ? '—' : giantAt.toFixed(1)}); Elders: ${f1(elders)}.\n`);
  ck(at('hold:4').trips <= 2, `10 min: the first purchase (Hold 4) comes after trip ${at('hold:4').trips} (target ≤ 2)`);
  band(within(M['10 min'].bought, 2, 5), `10 min: ${M['10 min'].bought} purchases made (target 2–5)`);
  band(within(perSlot(M['10 min']), 40, 90), `10 min: ${f0(perSlot(M['10 min']))} clams per trip${slotNote} (target 40–90)`);
  band(within(perSlot(M['1 h']), 100, 240), `1 h: ${f0(perSlot(M['1 h']))} clams per trip${slotNote} (target 100–240)`);
  band(within(M['1 h'].tpp, 0.5, 2.6), `1 h: ${f1(M['1 h'].tpp)} trips per purchase (target 0.5–2.6)`);
  band(within(M['1 h'].bought, 11, 19), `1 h: ${M['1 h'].bought} purchases made (target 11–19)`);
  band(within(at('lake:sporewood').h, 1.2, 2.0), `the Sporewood map at ${at('lake:sporewood').h.toFixed(1)} h (target 1.2–2.0)`);
  band(within(perSlot(M['5 h']), 300, 900), `5 h: ${f0(perSlot(M['5 h']))} clams per trip${slotNote} (target 300–900)`);
  band(within(M['5 h'].tpp, 1.5, 5), `5 h: ${f1(M['5 h'].tpp)} trips per purchase (target 1.5–5)`);
  band(within(at('lake:glasswater').h, 4.0, 6.5), `the Glasswater map at ${at('lake:glasswater').h.toFixed(1)} h (target 4.0–6.5)`);
  band(within(at('lake:paleabyss').h, 8.5, 13), `the Pallid Deep map at ${at('lake:paleabyss').h.toFixed(1)} h (target 8.5–13)`);
  band(within(at(`lake:${LOOP.waters[4].id}`).h, 12, 18), `the first new water (${LOOP.waters[4].name}) at ${at(`lake:${LOOP.waters[4].id}`).h.toFixed(1)} h (target 12–18)`);
  band(M['20 h'] && within(M['20 h'].tpp, 1.5, 7), `20 h: ${M['20 h'] ? f1(M['20 h'].tpp) : '—'} trips per purchase (target 1.5–7)`);
  band(M['20 h'] && within(M['20 h'].owned, 5, 8), `20 h: ${M['20 h'] ? M['20 h'].owned : '—'} waters owned (target 5–8)`);
  band(within(doneH, 40, 60), `the last purchase at ${doneH.toFixed(1)} h (target 40–60)`);
  ck(giantAt !== null && within(giantAt, 0.4, 3), `the first giant comes home at about hour ${giantAt === null ? '—' : giantAt.toFixed(1)} (target 0.4–3)`);
  ck(longest.w <= 90, `no purchase is more than 90 min away (longest ${f0(longest.w)} min)`);
  if (print) table(['raft and hold', 'bought at', 'clams a minute', 'clams a trip', 'price in trips'], gains.map((x) => [x.name, `${x.h.toFixed(1)} h`, sg(x.g), sg(x.gt), x.trips.toFixed(1)]));
  // every step pays its way: +3% clams a minute when bought, or (a bigger evening, priced as a look) more clams a trip for at most 2 trips' income
  const bad = gains.filter((x) => !(x.g >= 0.03 || (x.g >= -0.03 && x.trips <= 2)));
  band(!bad.length, `every hold step and raft part raises clams a minute by at least 3% when bought, or is priced as a look (at most 2 trips' income, and no more than 3% a minute lost)${bad.length ? ': ' + bad.map((x) => `${x.name} ${sg(x.g)}/min, ${x.trips.toFixed(1)} trips`).join('; ') : ''}`);
  const lag = LOOP.waters.slice(1).map((W) => ({ W, d: (firstFished[W.id] ?? 99) - K.openedAt[W.id] })).reduce((a, x) => (x.d > a.d ? x : a));
  // the map ladder per Wick is a warning (the lead, WICKS §3.5 decision 5); the no-passive player's stays a failure
  band(lag.d <= 0.5, `a new water is the best water to fish within half an hour of opening (v8: its three keys held; longest: ${lag.W.name}, ${(lag.d * 60).toFixed(0)} min)`);
  const longTrip = markRows.reduce((a, m) => Math.max(a, m.min), 0);
  // a Wick's trips print under 6.0 min; Tallow's at Hold 8 (its 9 slots) may run to TALLOW_TRIP_HOLD8 (the lead, WICKS §4 guard 3)
  const tripOver = markRows.filter((m) => (R.wick === 'tallow' && m.hold >= 8 ? +m.min.toFixed(1) > TALLOW_TRIP_HOLD8 : +m.min.toFixed(1) >= 6));
  if (tag) ck(!tripOver.length, `trips stay short: at most ${f1(longTrip)} min per trip at the pacing marks, the visit home included, at ${R.wick === 'tallow' ? `${Math.max(...markRows.map((m) => m.slots))} slots` : 'every hold'} (target under 6: a printed 6.0 fails${R.wick === 'tallow' ? `; Tallow at Hold 8, 9 slots, up to ${TALLOW_TRIP_HOLD8}` : ''})${tripOver.length ? `: over at ${tripOver.map((m) => `${m.label} ${f1(m.min)}`).join(', ')}` : ''}`);
  else ck(longTrip <= 6, `trips stay short: at most ${f1(longTrip)} min per trip at the pacing marks, the visit home included (target ≤ 6)`);
  const mapShare = (byKind.maps || 0) / R.spent;
  ck(within(mapShare, 0.5, 0.75), `maps are the big goals: ${pc(mapShare)} of all clams spent (target 50–75%)`);
  // decision 38 (SPEC §4.7): the shelf grows with the road, and no purchase of the pacing run comes before the map that puts it on the shelf
  const early = log.filter((l, i) => { const w = withOf(l.id); if (w <= 1) return false; const j = log.findIndex((x) => x.id === `lake:${LOOP.waters[w - 1].id}`); return j < 0 || j > i; });
  ck(!early.length, `the shelf grows with the road: no purchase comes before the map that puts it on the shelf (decision 38)${early.length ? ': ' + early.map((l) => l.name).join(', ') : ''}`);
}

if (args.includes('--json')) { console.log(JSON.stringify({ ...LOOP, waters: LOOP.waters.map(({ species, places, ...w }) => ({ ...w, places: places.map(({ id, kind, extra, price, giants, own }) => ({ id, kind, extra, price, giants, own })) })) }, null, 2)); return 0; }
if (args.includes('--calibrate')) {
  // the value tier each water needs (SPEC §4.9): the larger of "its open water pays 1.05× the water before, fully mapped, on the day
  // you buy its map" and "fully mapped, it pays 1.2× the water before, fully mapped, on the tackle you then fish it with"
  if (args.includes('--wicks')) {
    // WICKS §3.3 check 8: each Wick's own calibration (each chains from the tiers as they stand), and for each water the highest tier over
    // the five (a ladder rule must hold for every Wick); the tiers are printed, not adopted (a tier change re-prices the whole game)
    const keep = LOOP.waters.map((W) => W.base), per = {};
    for (const w of [null, ...WICK_IDS]) { per[w ?? 'none'] = calibrate(3000, w).map((r) => r.tier); LOOP.waters.forEach((W, i) => { W.base = keep[i]; }); }
    table(['water', 'tier now', ...[null, ...WICK_IDS].map(wickName), 'highest of the five'], LOOP.waters.map((W, i) => [`${W.order}. ${W.name}`, keep[i], ...[null, ...WICK_IDS].map((w) => per[w ?? 'none'][i]), Math.max(...WICK_IDS.map((w) => per[w][i]))]));
    console.log(JSON.stringify(Object.fromEntries(LOOP.waters.map((W, i) => [W.id, Math.max(...WICK_IDS.map((w) => per[w][i]))])))); return 0;
  }
  const rows = calibrate(), out = {};
  for (const r of rows) {
    out[r.W.id] = r.tier;
    console.log(`${r.W.order}. ${r.W.name}: tier ${r.tier}` + (r.byOpen ? ` (open-water rule ${r.byOpen.toFixed(1)}, growth rule ${r.byGrowth.toFixed(1)}; fully mapped ${f0(r.full)} clams/min; 25 min of it ${f0(r.lakeAt25)})` : ''));
  }
  console.log(JSON.stringify(out)); return 0;
}
if (args.includes('--fish')) {
  for (const W of LOOP.waters) {
    console.log(`\n**${W.order}. ${W.name}** (value tier ${W.base} · its list: ${listFor(W.id).length})\n`);
    const rows = W.species.filter((s) => !s.never).sort((a, b) => (b.legend - a.legend) || (b.giant - a.giant) || (LOOP.value.rarity[b.rarity] ?? 99) - (LOOP.value.rarity[a.rarity] ?? 99) || a.name.localeCompare(b.name)).map((s) => {
      const where = s.legend ? PLACES.find((p) => p.legend === s.id)?.name : s.giant ? PLACE[s.placeId].name : s.ownPlace ? PLACE[s.ownPlace].name : s.kind === 'open' ? 'open water' : `${s.kind} water`;
      const vals = s.legend ? ['—', '—', '—', '—', `pays ${f0(PLACES.find((p) => p.legend === s.id).price)}`] : CL5.map((c) => ((c === 'small' && s.giant) || (c === 'elder' && !(s.giant || s.kind === 'old' || (s.ownPlace && PLACE[s.ownPlace].kind === 'old') || s.kind === 'open')) ? '—' : f0(clamsFor(s, z[c]))));
      return [`${s.giant ? '★ ' : ''}${s.name}${s.roster ? '' : ' (built)'}`, s.rarity, s.hoursText, where, { list: '✓', tin: 'tin', off: '—' }[listMark(s)], ...vals];
    });
    table(['fish', 'rarity', 'bites', 'where', 'list', 'Small', 'Keeper', 'Prize', 'Trophy', 'Elder'], rows);
  }
  console.log(`Waiting for a later sheet (built, not roster fish): ${WAITING.map((s) => `${s.name} (${s.place})`).join(', ')}.`);
  return 0;
}

if (SHIPPED) return shippedReport();
if (args.includes('--wicks')) return wicksReport();
// ---------------------------------------------------------------- --shipped=mossmere: M1's arc, per step and (--wicks) per Wick
function shippedReport() {
  if (SHIPPED !== 'mossmere') { console.error(`--shipped=${SHIPPED}: only the Mossmere ships today (M1)`); return 1; }
  if (!(STEP >= 1 && STEP <= 6)) { console.error(`--step=${STEP}: M1's steps are 1–6`); return 1; }
  const step = Math.min(5, STEP), sp = shipMossmere(step), W = WATER.mossmere, ALL = args.includes('--wicks') ? [null, ...WICK_IDS] : [null];
  const pc1 = (v) => `${v >= 0 ? '+' : ''}${(v * 100).toFixed(1)}%`, opt = (w, x = {}) => (w ? { wick: w, ...x } : { ...x }), nW = Math.max(N, 4000);
  const shelf = buyingOrder().order.filter((id) => withOf(id) === 1 && m1Step(id) <= step), items = shelf.filter((id) => !id.startsWith('legend:'));
  const R0 = pacing({ shipped: 'mossmere', step });
  const cost = (id) => R0.log.find((l) => l.id === id)?.cost ?? 0, total = items.reduce((a, id) => a + cost(id), 0);
  title(`M1. The Mossmere alone (M1.md §6.4), step ${STEP}${STEP === 6 ? ' (as 5: step 6 adds no content)' : ''}: ${items.length} permanent items, ${f0(total)} clams${shelf.length > items.length ? ', and the Matriarch\'s hunt (Heartmoss Ball, a consumable)' : ''}`);
  console.log(`Its fish: ${sp.filter((s) => !s.never).map((s) => s.name + (s.legend ? ' (legend)' : s.giant ? ' (giant)' : '')).join(', ')}.`);
  console.log(`Its places: ${step >= 3 ? W.places.map((p) => `${p.name} ${f0(p.price)}`).join(' · ') : 'none yet (step 3)'}. Its list (the catch seal on Sporewood's sheet): ${listFor('mossmere').length} fish.`);
  console.log(`The visit home is the Jetty's (LOOP.time: home ${LOOP.time.home} s, sale ${LOOP.time.sale} s, shop ${LOOP.time.shop} s); step 5's barge re-measures it. Plain bait (Mire Worms) from minute 30 from step 4.\n`);
  const runs = {}; for (const w of ALL) runs[w ?? 'none'] = w ? pacing({ shipped: 'mossmere', step, wick: w, track: true }) : pacing({ shipped: 'mossmere', step, track: true });
  const R = runs.none;
  table(['#', 'hour', 'trips', 'waited', 'buys', 'clams', 'clams/trip', 'min/trip'], R.log.map((l, i) => [i + 1, l.h.toFixed(2), l.trips, l.waited, l.name, f0(l.cost), f0(l.perTrip), f1(l.min)]));
  const endTrip = R.log[R.log.length - 1];
  table(['mark', 'clams/trip', 'min/trip', 'bought', 'state'], [...R.markRows.map((m) => [m.label, f0(m.clams), f1(m.min), m.bought, m.state]), ['the empty shelf', f0(endTrip.perTrip), f1(endTrip.min), R.log.length, `${R.doneH.toFixed(2)} h`]]);
  const longest = R.longest, hunt = R.log.find((l) => l.id.startsWith('legend:')), gIds = W.species.filter((s) => s.giant && !s.legend).map((s) => s.id);
  const allHome = step >= 3 && gIds.every((id) => R.giantHome[id] != null) ? Math.max(...gIds.map((id) => R.giantHome[id]), hunt?.h ?? 0) : null;
  const L = R.KEYS.list.mossmere;
  console.log(`The empty shelf at ${R.doneH.toFixed(2)} h (${R.trips} trips), ${f0(R.banked)} clams banked then for Sporewood. The longest wait for one purchase: ${f0(longest.w)} min (${longest.l.name}).`);
  if (step >= 3) {
    console.log(`The first giant home at about hour ${R.giantAt == null ? '—' : R.giantAt.toFixed(1)} (the pacing run's expectation); one sampled player's giants: ${gIds.map((id) => `${SP[id + '@mossmere'].name} ${R.giantHome[id] == null ? 'not yet' : `${R.giantHome[id].toFixed(1)} h`}`).join(', ')}.`);
    console.log(`The Matriarch's first landing: her hunt bought at ${hunt.h.toFixed(2)} h (${f0(hunt.cost)} clams of Heartmoss Balls, 60 a try, about ${(hunt.cost / W.legendBait[1]).toFixed(1)} tries on Rod/Line/Reel T${R.state.rod}; her first landing pays ${f0(W.places.find((p) => p.legend).price)}). Both giants and the Matriarch home (the sampled player): ${allHome == null ? 'not by the end' : `${allHome.toFixed(1)} h`}.`);
    console.log('The Heartmoss Ball is spent only by her bite: the sim prices the hunt as tries × the ball, each try a sure bite in her pool in her hour, and no other fish takes it.');
  }
  console.log(`The Mossmere's list (${L.toLand} fish; a fresh save: every catch from the first trip counts, kept or let go): p50 ${f0(L.p50)} min, p95 ${f0(L.p95)}, p99 ${f0(L.p99)} on the starting kit with the pull (${L.players} players); the sampled player's list was complete at ${R.listDoneH == null ? '—' : `${R.listDoneH.toFixed(2)} h`}. (An old save's Journal counts too, SPEC §5.5 (c); a fresh-save sim does not model it.)`);
  console.log(`The longest run of trips that brought nothing new (no new kind, no class seal, no purchase; Murk's orders are not modelled one by one): ${R.dull.trips} trip${R.dull.trips === 1 ? '' : 's'}, ${f0(R.dull.min)} min, from hour ${R.dull.at.toFixed(1)} (the sampled player).`);
  // the class seals M1 can earn: where each fish bites, on the shelf's baits; Elders only in old water or a giant at its own place
  {
    const baits = [null, ...(step >= 4 ? ['mireworm', 'lumen_moss'] : [])], stops = [null, ...(step >= 3 ? W.places.filter((p) => !p.legend).map((p) => p.id) : [])], top = {};
    for (const pid of stops) for (const ph of LIGHT) for (const b of baits) for (const [s] of poolFor('mossmere', pid, ph, null, b).list) {
      const P = pid ? PLACE[pid] : null, mz = Math.min(s.maxClass ? SZ.classMaxZ[s.maxClass] : SZ.z.max, P?.kind === 'old' || (s.giant && s.placeId === pid) ? SZ.z.max : SZ.elsewhereMaxZ);
      top[s.id] = Math.max(top[s.id] ?? -9, mz);
    }
    const seals = Object.entries(top).map(([id, mz]) => { const s = SP[id + '@mossmere'], can = D.sealsFor(s), lim = CI[D.sizeClassOf(mz - 1e-9)]; return { s, cls: can.filter((c) => CI[c] <= lim && !(s.giant && c === 'small')) }; });
    const n = seals.reduce((a, x) => a + x.cls.length, 0), nElder = seals.filter((x) => x.cls.includes('elder')).length;
    console.log(`The class seals M1 can earn (the Journal draws only these): ${n}, of them ${nElder} Elder seals. ${seals.map((x) => `${x.s.name} ${x.cls.map((c) => c[0].toUpperCase()).join('')}`).join(' · ')}${step >= 4 ? ' (the Gloam Eel only on Lumen Moss)' : ''}.\n`);
  }
  const ck = (tag, ok, label) => check(ok, (tag ? `[${tag}] ` : '') + label);
  for (const w of ALL) {
    const Rw = runs[w ?? 'none'], tag = w ? wickName(w) : '', ends = [...Rw.markRows.map((m) => m.min), Rw.log[Rw.log.length - 1].min], tLong = Math.max(...ends), slots = wickSlots(Rw.state.hold, w);
    if (step === 5) ck(tag, Rw.doneH >= 1.5 && Rw.doneH <= 4, `M1: the empty shelf at ${Rw.doneH.toFixed(2)} h (target 1.5–4 h: the measured length is M1's default, M1 §6.2)`);
    ck(tag, Rw.longest.w <= 30, `M1: no purchase is more than 30 min away (longest ${f0(Rw.longest.w)} min, ${Rw.longest.l.name})`);
    if (step >= 3) ck(tag, Rw.giantAt != null && Rw.giantAt >= 0.4 && Rw.giantAt <= 3, `M1: the first giant comes home at about hour ${Rw.giantAt == null ? '—' : Rw.giantAt.toFixed(1)} (target 0.4–3)`);
    ck(tag, w ? +tLong.toFixed(1) < 6 : tLong <= 6, `M1: trips stay short at every mark and at the empty shelf, the visit home included: at most ${f1(tLong)} min at ${slots} slots (target ${w ? 'under 6: a printed 6.0 fails' : '≤ 6'})`);
    const bad = Rw.gains.filter((x) => !(x.g >= 0.03 || (x.g >= -0.03 && x.trips <= 2)));
    // "pays its way" fails at step 5 (the shipped M1); at steps 1–4, a build stage, it is a warning (the lead, M1 §6.2)
    (step === 5 ? (ok, label) => ck(tag, ok, label) : (ok, label) => warn(ok, (tag ? `[${tag}] ` : '') + label))(!bad.length, `M1${step < 5 ? ` (step ${step}, a build stage: a warning)` : ''}: every hold step and raft part raises clams a minute by at least 3% when bought, or is priced as a look (at most 2 trips' income, no more than 3% a minute lost)${bad.length ? ': ' + bad.map((x) => `${x.name} ${pc1(x.g)}/min, ${x.trips.toFixed(1)} trips`).join('; ') : ''}`);
    const Lw = Rw.KEYS.list.mossmere;
    ck(tag, Lw.p95 <= LOOP.access.target.p95 && Lw.p99 <= LOOP.access.target.p99 && Lw.open === 0, `M1: the Mossmere's list (${Lw.toLand} fish) is landed by the slow player in twenty in ${f0(Lw.p95)} min, the slowest in a hundred in ${f0(Lw.p99)} (target ≤ ${LOOP.access.target.p95} and ≤ ${LOOP.access.target.p99})`);
  }
  // every place map raises clams a minute by ≥ 5% on the Mossmere alone (in price order, on M1's mid kit: T1, Hold 5, the step's raft and lures)
  if (step >= 3) {
    const lures = step >= 4 ? ['feather_fly', 'glimmer_spoon', 'bone_jig', 'bell_spinner'] : [];
    const kitM = (places) => ({ water: 'mossmere', rod: 1, line: 1, reel: 1, hold: 5, lure: lures.length ? bestLureOf('mossmere', lures) : null, bait: step >= 4 ? 'mireworm' : null, places, oars: step >= 4 ? 1 : 0, keel: step >= 4 ? 1 : 0, lantern: 0 });
    for (const w of ALL) {
      let cur = [], prev = run(kitM(cur), POL.natural(), QUICK ? 1500 : 3000, 3, opt(w)).perMin; const steps = [];
      for (const P of W.places.filter((p) => !p.legend).sort((a, b) => a.price - b.price)) { cur = [...cur, P.id]; const r = run(kitM(cur), POL.natural(), QUICK ? 1500 : 3000, 3, opt(w)).perMin; steps.push({ P, g: r / prev - 1 }); prev = r; }
      const worst = steps.reduce((a, x) => (x.g < a.g ? x : a));
      ck(w ? wickName(w) : '', worst.g >= LADDER.place - 0.005, `M1: every place map raises clams a minute by at least 5% on the Mossmere alone (${steps.map((x) => `${x.P.name} ${pc1(x.g)}`).join(' · ')})`);
    }
  }
  if (ALL.length > 1) {
    title('M1 per Wick: the empty shelf, the marks and the first trip');
    const mean = WICK_IDS.reduce((a, w) => a + runs[w].doneH, 0) / WICK_IDS.length, k0 = { water: 'mossmere', rod: 0, line: 0, reel: 0, hold: 3, lure: null, bait: null, places: [], oars: 0, keel: 0, lantern: 0 };
    const F = {}; for (const w of ALL) F[w] = run(k0, POL.natural(), nW, 1000, opt(w, w === 'wick' ? { firstsFrom: newLedger() } : {}));
    const seenOf = (w) => ({ wick: F.wick.firsts, taper: F.taper.taperFirsts, stub: F.stub.bites, tallow: 1 + F.tallow.full, ashwick: F.ashwick.comebacks }[w]);
    table(['Wick', 'the empty shelf (h)', 'vs mean', '10 min', '1 h', '2 h', 'longest trip (min)', 'longest wait (min)', 'first giant (h)', 'first trip: clams', 'a bite after dark', 'home full', 'seen'],
      ALL.map((w) => { const Rw = runs[w ?? 'none'], M = Object.fromEntries(Rw.markRows.map((m) => [m.label, m])), ps = (m) => (m ? `${f0(m.clams * m.hold / m.slots)} (${f1(m.min)})` : '—');
        return [wickName(w), Rw.doneH.toFixed(2), w ? pc1(Rw.doneH / mean - 1) : '—', ps(M['10 min']), ps(M['1 h']), ps(M['2 h']), f1(Math.max(...Rw.markRows.map((m) => m.min), Rw.log[Rw.log.length - 1].min)), f0(Rw.longest.w), Rw.giantAt == null ? '—' : Rw.giantAt.toFixed(1), f0(F[w].clams), pc(F[w].nightBite), pc(F[w].full), w ? seenOf(w).toFixed(2) : '—']; }));
    console.log(`The five-Wick mean: ${mean.toFixed(2)} h (the no-passive player ${runs.none.doneH.toFixed(2)} h). Marks: clams a trip (Tallow per slot) and minutes a trip.\n`);
    for (const w of WICK_IDS) {
      const d = runs[w].doneH / mean - 1;
      check(Math.abs(d) <= 0.1, `[${wickName(w)}] M1: the empty shelf at ${runs[w].doneH.toFixed(2)} h, ${pc1(d)} of the five-Wick mean ${mean.toFixed(2)} h (target within ±10%)`);
      warn(Math.abs(d) <= 0.05, `[${wickName(w)}] M1 aim: within ±5% of the mean (${pc1(d)})`);
      if (w === 'ashwick') check(F.ashwick.comebackTrip >= ASHWICK_SEEN, `[Ashwick] M1's first trip: ${seenOf(w).toFixed(2)} comebacks on average, on ${pc(F.ashwick.comebackTrip)} of first trips (target: a comeback on at least ${pc(ASHWICK_SEEN)} of them, WICKS §3.2)`);
      else check(seenOf(w) >= 1, `[${wickName(w)}] M1's first trip: ${seenOf(w).toFixed(2)} clearly visible events of its passive on average (target ≥ 1, WICKS §3.2)`);
    }
  }
  console.log(failures.length ? `\n${failures.length} check(s) FAILED${warns.length ? `, ${warns.length} warning(s)` : ''}` : `\nall checks passed${warns.length ? ` (${warns.length} warning(s))` : ''}`);
  return failures.length ? 1 : 0;
}

// ---------------------------------------------------------------- --wicks: the five passives against WICKS.md §3.2, checks §3.3
function wicksReport() {
  const ALL = [null, ...WICK_IDS], nW = Math.max(N, 4000), nM = QUICK ? 1500 : 3000, opt = (w, x = {}) => (w ? { wick: w, ...x } : { ...x });
  const ratio = (a, b) => a / Math.max(1e-9, b), pc1 = (v) => `${v >= 0 ? '+' : ''}${(v * 100).toFixed(1)}%`;
  title('W0. The five passives as the sim models them (WICKS.md §2, §3.1; the knobs as they stand)');
  table(['Wick', 'passive', 'knobs'], WICK_IDS.map((w) => [wickName(w), LOOP.wicks[w].passive, Object.entries(LOOP.wicks[w]).filter(([k]) => k !== 'passive' && k !== 'stats').map(([k, v]) => `${k} ${v}`).join(', ')]));
  console.log(`data.js helpers: ${['wickSlots', 'goodBitesFor', 'quietTerms', 'wickPoolWeights'].map((n) => `${n} (${STAND_INS.includes(n) ? 'sim stand-in: not in data.js until slice 1a' : 'data.js'})`).join(' · ')}.`);
  console.log(`The reference row "none" is the no-passive player of sections 0–7. Not modelled here: Stub's light radius (a look); the spook rate per Wick (fishing's own test);`);
  console.log(`the 1a targets on the built phase-1 pools (a node test against fishing's speciesPool); a cut line (no comeback); an order fish that is also a first (the larger-of rule:`);
  console.log(`the sim's orders are a flat +6% a slot, the Wick's bonus is never multiplied by it). The Wick's sale is the mean of ${WICK_PLAYERS} sampled players' firsts in each pacing trip.\n`);

  // ---- the pacing run per Wick (check 1): run first, the other sections read its ledgers and kits
  const PR = {}; for (const w of ALL) PR[w ?? 'none'] = pacing({ wick: w });
  const TALLOW_R3 = withKnobs('tallow', { everyWater: false }, () => pacing({ wick: 'tallow' }));   // Tallow as revision 3 wrote it (open water only), for comparison
  const mean = WICK_IDS.reduce((a, w) => a + PR[w].doneH, 0) / WICK_IDS.length;

  // ---- W1. the first trip and the 1a kit
  title('W1. The first trip (T0, hold 3, open water) and the 1a kit (T1, Hold 4, open water): what each Wick is seen to do, and its own domain');
  const k0 = STAGES[0].kit, k1 = { water: 'mossmere', rod: 1, line: 1, reel: 1, hold: 4, lure: null, bait: null, places: [], oars: 0, keel: 0, lantern: 0 };
  const F = {}, K1 = {};
  for (const w of ALL) { F[w] = run(k0, POL.natural(), nW, 1000, opt(w, w === 'wick' ? { firstsFrom: newLedger() } : {})); K1[w] = run(k1, POL.natural(), nW, 1100, opt(w)); }
  // the Wick's first 10 trips on the 1a kit, from an empty ledger: the share of its clams that its firsts add
  const seq = firstsGain;
  const wick10 = seq(k1, null, 10, QUICK ? 300 : 800, 1200);
  const seen = {
    null: { n: 0, text: '—' },
    wick: { n: F.wick.firsts, text: `${f1(F.wick.firsts)} first-sale ticks at the tally (+${f0(F.wick.firstBonus)} clams)` },
    taper: { n: F.taper.taperFirsts, text: `${F.taper.taperFirsts.toFixed(2)} non-common first cards (${pc(F.taper.nonCommon / F.taper.bites)} of bites not common, against ${pc(F.null.nonCommon / F.null.bites)})` },
    stub: { n: F.stub.bites, text: `${f1(F.stub.bites)} bites, each ${(F.null.waitSec / F.null.bites - F.stub.waitSec / F.stub.bites).toFixed(1)} s sooner` },
    tallow: { n: 1 + F.tallow.full, text: `the fourth slot on the first Chart (every first trip); ${pc(F.tallow.full)} bring home 4 fish` },
    ashwick: { n: F.ashwick.comebacks, text: `${F.ashwick.comebacks.toFixed(2)} comebacks (on ${pc(F.ashwick.comebackTrip)} of first trips)` },
  };
  table(['Wick', 'first trip: clams', 'min', 'clams/min', 'vs none', 'fish home', 'home full', 'a bite after dark', 'no Prize or bigger', 'seen on the first trip'],
    ALL.map((w) => [wickName(w), f0(F[w].clams), f1(F[w].min), f1(F[w].perMin), pc1(ratio(F[w].perMin, F.null.perMin) - 1), f1(F[w].kept), pc(F[w].full), pc(F[w].nightBite), pc(F[w].noBig), seen[w].text]));
  for (const w of WICK_IDS) {
    check(F[w].nightBite >= 0.5, `[${wickName(w)}] first trip: ${pc(F[w].nightBite)} get a bite after dark (target ≥ 50%; check 4)`);
    check(F[w].full >= 0.9, `[${wickName(w)}] first trip: ${pc(F[w].full)} come home full${w === 'tallow' ? ' (at 4 slots)' : ''} (target ≥ 90%; check 4)`);
    // Ashwick's floor is a comeback seen on at least 60% of first trips (the lead, WICKS §3.5 decision 1); every other Wick ≥ 1 event a trip
    if (w === 'ashwick') check(F.ashwick.comebackTrip >= ASHWICK_SEEN, `[Ashwick] the "seen" floor: ${seen[w].text} (target: a comeback on at least ${pc(ASHWICK_SEEN)} of first trips; check 4)`);
    else check(seen[w].n >= 1, `[${wickName(w)}] the "seen" floor: ${seen[w].text} (target ≥ 1 clearly visible event per first trip on average; check 4)`);
  }
  // the domain gains on the 1a kit (§3.2)
  const stubQuiet = ratio(K1.stub.quietClams / Math.max(1e-9, K1.stub.quietSec), K1.null.quietClams / Math.max(1e-9, K1.null.quietSec));
  const lostRate = (x) => x.lostForGood / Math.max(1e-9, x.hooks - x.comebacks);
  const dom = {
    wick: { v: wick10.gain, lo: 0.2, hi: 0.35, text: `clams from firsts over the first 10 trips ${pc1(wick10.gain)} (${f1(wick10.ticks)} first-sale ticks a trip)`, target: '+20–35%' },
    taper: { v: ratio(K1.taper.nonCommon / K1.taper.bites, K1.null.nonCommon / K1.null.bites), lo: 1.6, hi: 2.0, text: `non-common share of bites ×${ratio(K1.taper.nonCommon / K1.taper.bites, K1.null.nonCommon / K1.null.bites).toFixed(2)} (${pc(K1.taper.nonCommon / K1.taper.bites)} against ${pc(K1.null.nonCommon / K1.null.bites)})`, target: '×1.6–2.0' },
    stub: { v: ratio(K1.stub.bites / K1.stub.min, K1.null.bites / K1.null.min) - 1, lo: 0.1, hi: 0.15, text: `bites a minute ${pc1(ratio(K1.stub.bites / K1.stub.min, K1.null.bites / K1.null.min) - 1)}; past the good bites, clams a minute ×${stubQuiet.toFixed(2)}`, target: '+10–15%; quiet ×1.3–1.6', v2: stubQuiet, lo2: 1.3, hi2: 1.6 },
    tallow: { v: ratio(K1.tallow.kept, K1.null.kept) - 1, lo: 0.2, hi: 0.35, text: `fish a trip ${pc1(ratio(K1.tallow.kept, K1.null.kept) - 1)} (${f1(K1.tallow.kept)} against ${f1(K1.null.kept)}), clams a trip ${pc1(ratio(K1.tallow.clams, K1.null.clams) - 1)} (${f0(K1.tallow.clams)} against ${f0(K1.null.clams)}), clams a minute ${pc1(ratio(K1.tallow.perMin, K1.null.perMin) - 1)}`, target: '+20–35% and +20–35%', v2: ratio(K1.tallow.clams, K1.null.clams) - 1, lo2: 0.2, hi2: 0.35 },
    ashwick: { v: lostRate(K1.ashwick) / lostRate(K1.null) - 1, lo: -1, hi: -0.5, text: `fish lost for good ${pc1(lostRate(K1.ashwick) / lostRate(K1.null) - 1)} (${pc(lostRate(K1.ashwick))} of the fish hooked, against ${pc(lostRate(K1.null))})`, target: '−50% or more' },
  };
  table(['Wick', '1a kit: clams/trip', 'min', 'clams/min', 'vs none', 'its own domain', 'target'], ALL.map((w) => [wickName(w), f0(K1[w].clams), f1(K1[w].min), f1(K1[w].perMin), w === 'wick' ? `${pc1(wick10.gain)} (10 trips)` : pc1(ratio(K1[w].perMin, K1.null.perMin) - 1), w ? dom[w].text : '—', w ? dom[w].target : '—']));
  for (const w of WICK_IDS) {
    const d = dom[w];
    check(d.v >= d.lo - 1e-9 && d.v <= d.hi + 1e-9 && (d.v2 == null || (d.v2 >= d.lo2 - 1e-9 && d.v2 <= d.hi2 + 1e-9)), `[${wickName(w)}] its own domain in the 1a kit: ${d.text} (target ${d.target}; check 2)`);
  }
  // the Wick at each new water's first 5 evenings, from its pacing players' ledgers on the day the water opens
  {
    const P = PR.wick, five = new Map(LOOP.waters.slice(1).map((W) => [W, seq(P.KEYS.kit[W.id], P.ledgerAt[W.id], 5, QUICK ? 160 : 400, 1300 + W.order).gain]));
    const vals = [...five.values()], out5 = [...five].filter(([, g]) => g < 0.12 || g > 0.32);   // +12–32% (the lead, WICKS §3.5 decision 2)
    console.log(`The Wick at each new water's first 5 evenings (clams its firsts add, from its pacing players' ledgers on the day the water opens): ${[...five].map(([W, g]) => `${W.order}. ${W.name.replace(/^The /, '')} ${pc1(g)}`).join(' · ')}\n`);
    check(!out5.length, `[the Wick] its own domain at each new water's first 5 evenings: ${pc1(Math.min(...vals))} to ${pc1(Math.max(...vals))} (target +12–32% at every water; check 2)${out5.length ? `: out at ${out5.map(([W, g]) => `${W.name} ${pc1(g)}`).join(', ')}` : ''}`);
  }

  // ---- W2. the stations: clams a minute and the anti-grind checks per Wick (check 3)
  title('W2. The stations of section 2, per Wick: clams a minute against the no-passive player, and the anti-grind rule (check 3)');
  const ledgerAtMark = (w, id) => { if (w !== 'wick') return null; if (id === 'start') return [newLedger()]; const m = PR.wick.markRows.find((x) => x.label === { '10min': '10 min', '1h': '1 h', '5h': '5 h', '20h': '20 h', '40h': '40 h' }[id]); return m?.ledgers; };
  const choosyAll = {};
  for (const [i, st] of STAGES.entries()) {
    const rows = [], seed = 1000 + i * 17; let nat0 = null;
    for (const w of ALL) {
      const L0 = ledgerAtMark(w, st.id), o = opt(w, L0 ? { firstsFrom: L0[0] } : {});
      const nat = run(st.kit, POL.natural(), N, seed, o); if (!w) nat0 = nat;
      const [ch, dk, gh, gp, gt] = [POL.picky(), POL.dark(), POL.giantHunt(), POL.grind('prize'), POL.grind('trophy')].map((p, k) => run(st.kit, p, k === 0 ? nW : N, seed, o).perMin / nat.perMin);
      const hop = w === 'taper' ? run(st.kit, POL.hopOne(), N, seed, o).perMin / nat.perMin : null;
      (choosyAll[st.id] ||= []).push(w ? ch : null);
      rows.push([wickName(w), f1(nat.perMin), pc1(nat.perMin / nat0.perMin - 1), f1(nat.min), pc(ch), pc(dk), pc(gh), pc(gp), pc(gt), hop == null ? '—' : pc(hop)]);
      if (!w) continue;
      check(gh <= 0.75 && gp <= 1 + 1e-9 && gt <= 1 + 1e-9 && dk <= 1 + 1e-9, `[${wickName(w)}] anti-grind (${st.id}): the giant hunt ${pc(gh)} (≤ 75%), the grinds ${pc(gp)} and ${pc(gt)} (≤ 100%), waiting for dark ${pc(dk)} (≤ 100%) of its natural rule`);
      check(ch >= 0.8 && ch <= 1.1, `[${wickName(w)}] let go is a choice (${st.id}): choosy play earns ${pc(ch)} of its natural rule per minute (target 80–110%)`);
      if (hop != null) check(hop <= 1.05, `[Taper] hopping (${st.id}): one bite at each water, then on, earns ${pc(hop)} of its natural rule (target ≤ 105%)`);
    }
    console.log(`-- ${st.label}`);
    table(['Wick', 'clams/min', 'vs none', 'min/trip', 'choosy', 'wait for dark', 'giant hunt', 'grind Prize+', 'grind Trophy+', 'hop (Taper)'], rows);
    const cm = choosyAll[st.id].filter((x) => x != null), m = cm.reduce((a, b) => a + b, 0) / cm.length;
    check(m >= 0.85 && m <= 1.05, `let go is a choice on the five-Wick mean (${st.id}): choosy play earns ${pc(m)} of the natural rule (target 85–105%)`);
  }

  // ---- W3. giants (check 5), against the no-passive player
  title('W3. Giants home, against the no-passive player: each giant place alone with open water, on its water\'s arrival tackle (check 5)');
  {
    const ARRIVE = { mossmere: 1, sporewood: 2, glasswater: 3, paleabyss: 4 }, nG2 = QUICK ? 1500 : 4000, tot = {}, rows = [];
    let shareMax = 0, shareAt = '';
    for (const P of PLACES.filter((p) => p.giants.length)) {
      const W = WATER[P.water], t = ARRIVE[W.id] ?? (W.order < 10 ? 5 : 6), kit = { water: W.id, rod: t, line: t, reel: t, hold: 6, lure: null, bait: null, places: [P.id], oars: 2, keel: 1, lantern: 1 };
      const cells = [`${W.order}. ${P.name}`];
      for (const w of ALL) { const x = run(kit, POL.natural(), nG2, 4243, opt(w)), T0 = (tot[w ?? 'none'] ||= { g: 0, trips: 0, h: 0, kept: 0 }); T0.g += x.giantKept * nG2; T0.trips += nG2; T0.h += x.sec * nG2 / 3600; T0.kept += x.kept * nG2; cells.push((x.giantKept * 100).toFixed(1)); }
      rows.push(cells);
      for (const ph of LIGHT) for (const lure of [null, W.lure[0]]) { const pool = poolFor(W.id, P.id, ph, lure, null, null, 1, 'taper'), g = pool.list.find(([s]) => s.giant); if (g) { const sh = g[1] / pool.tot; if (sh > shareMax) { shareMax = sh; shareAt = `${P.name}, ${ph}${lure ? `, ${LURE_NAME[lure]}` : ''}`; } } }
    }
    table(['giant place', ...ALL.map((w) => `${wickName(w)}: giants home per 100 trips`)], rows);
    const g0 = tot.none, per = (w) => ({ trip: (tot[w].g / tot[w].trips) / (g0.g / g0.trips), hour: (tot[w].g / tot[w].h) / (g0.g / g0.h), perFish: (tot[w].g / tot[w].kept) / (g0.g / g0.kept) });
    table(['Wick', 'giants home per trip ÷ none', 'per hour ÷ none', 'per fish home ÷ none'], WICK_IDS.map((w) => { const r = per(w); return [wickName(w), `×${r.trip.toFixed(2)}`, `×${r.hour.toFixed(2)}`, `×${r.perFish.toFixed(2)}`]; }));
    for (const w of WICK_IDS) {
      const r = per(w);
      if (w === 'taper') check(r.trip >= 1.2 && r.trip <= 1.4 && r.hour >= 0.85, `[Taper] giants home ×${r.trip.toFixed(2)} a trip and ×${r.hour.toFixed(2)} an hour over all the giants' places (target +20–40% a trip, its ceiling +40%; check 5)`);
      // Tallow's limit is 1.25 an hour: a side effect of its good bite at every place (the lead, WICKS §3.5 decision 4); Taper's ×1.33 stays the domain
      else { const hi = w === 'tallow' ? 1.25 : 1.15; check(r.trip >= 0.85 && r.hour >= 0.85 && r.hour <= hi, `[${wickName(w)}] giants home ×${r.trip.toFixed(2)} a trip${w === 'tallow' ? ` (×${r.perFish.toFixed(2)} per fish home: a bigger hold brings more of every fish)` : ''} and ×${r.hour.toFixed(2)} an hour (target ≥ 0.85× both and ≤ ${hi}× an hour${w === 'tallow' ? ': Tallow\'s own limit, its extra good bites' : ''}; only Taper above it; check 5)`); }
    }
    check(shareMax <= 0.12 + 1e-9, `[Taper] a giant's share of the bites is at most 12% at every place, hour and lure (highest ${(shareMax * 100).toFixed(1)}%: ${shareAt}; check 5)`);
  }

  // ---- W4. legends and caps (check 6)
  title('W4. Legends and the caps (check 6)');
  {
    // no Wick term reaches a legend: legendP and the legend hunt take no Wick; Ashwick's comeback skips giants and legends
    const hold = Math.min(C.buffs.runCap ?? C.buffs.cap, LOOP.wicks.ashwick.hold); let worst = 0, worstAt = '', giantMax = 0, giantAt = '';
    for (const W of LOOP.waters) {
      const t0 = { mossmere: 1, sporewood: 2, glasswater: 3, paleabyss: 4 }[W.id] ?? (W.order < 10 ? 5 : 6);
      for (const t of [t0, settleT(W)]) {
        const kit = { rod: t, line: t, reel: t, lure: null, bait: null };
        for (const sp of W.species.filter((s) => !s.legend && !s.never)) for (const cls of CLASSES) {
          const pb = landP(sp, cls, kit, 'clean', false, sp.giant ? 0 : hold), cap = C.cap[cls];
          if (pb / cap > worst) { worst = pb / cap; worstAt = `${sp.name} ${cls}, T${t}`; }
          if (sp.giant && cls === 'prize' && t === t0) { const p = landP(sp, cls, kit, 'struck', false); if (p > giantMax) { giantMax = p; giantAt = sp.name; } }
        }
      }
    }
    console.log(`Legends: the sim's legendP and the legend hunt take no Wick (no passive touches a legend), so a legend's land chance and the tries it takes are the same for all five; the hours each Wick lands them follow its pacing (section W5).`);
    check(worst < 1, `[Ashwick] every class cap holds with the comeback's +${hold} Hold, on each water's arrival and settled tackle, a clean strike (closest: ${(worst * 100).toFixed(1)}% of its cap, ${worstAt})`);
    check(giantMax <= 0.505, `every giant at Prize lands at most 50% on its water's arrival tackle for every Wick (no passive changes a giant's land chance; highest ${pc(giantMax)}: ${giantAt})`);
    const legH = (R) => LOOP.waters.map((W) => R.log.find((l) => l.id === `legend:${W.legend}`).h);
    table(['Wick', ...LOOP.waters.map((W) => `${W.order}`)], ALL.map((w) => [`${wickName(w)}: legend landed at (h)`, ...legH(PR[w ?? 'none']).map((h) => h.toFixed(1))]));
  }

  // ---- W5. the pacing per Wick (check 1)
  title('W5. The pacing run per Wick (check 1): everything bought, the marks, every section 5 check');
  {
    const rows = ALL.map((w) => {
      const R = PR[w ?? 'none'], M = Object.fromEntries(R.markRows.map((m) => [m.label, m])), ps = (m) => (m ? f0(m.clams * m.hold / m.slots) : '—');
      return [wickName(w), R.doneH.toFixed(1), w ? pc1(R.doneH / mean - 1) : '—', ps(M['10 min']), ps(M['1 h']), ps(M['5 h']), ps(M['20 h']), ps(M['40 h']), f1(R.markRows.reduce((a, m) => Math.max(a, m.min), 0)), f0(R.longest.w), R.giantAt == null ? '—' : R.giantAt.toFixed(1), R.trips];
    });
    table(['Wick', 'everything bought (h)', 'vs the five-Wick mean', '10 min', '1 h', '5 h', '20 h', '40 h (clams a trip; Tallow per slot)', 'longest trip (min)', 'longest wait (min)', 'first giant (h)', 'trips'], rows);
    console.log(`The five-Wick mean: ${mean.toFixed(1)} h (the no-passive player ${PR.none.doneH.toFixed(1)} h). Tallow as revision 3 wrote it (9 slots, its good bite at open water only): ${TALLOW_R3.doneH.toFixed(1)} h (${pc1(TALLOW_R3.doneH / mean - 1)} of this mean), its longest trip at the marks ${f1(Math.max(...TALLOW_R3.markRows.map((m) => m.min)))} min.\n`);
    table(['mark', ...WICK_IDS.map(wickName)], ['10 min', '1 h', '5 h', '20 h', '40 h'].map((lb) => [lb, ...WICK_IDS.map((w) => { const m = PR[w].markRows.find((x) => x.label === lb); return m ? `${m.state.replace(/, \d+ waters?/, '').replace(/, \d+ places?/, '')} · ${f1(m.min)} min` : '—'; })]));
    for (const w of WICK_IDS) {
      const R = PR[w], d = R.doneH / mean - 1;
      check(Math.abs(d) <= 0.05, `[${wickName(w)}] everything bought at ${R.doneH.toFixed(1)} h, ${pc1(d)} of the five-Wick mean ${mean.toFixed(1)} h (target within ±5%: the balance check, WICKS §3.5 decision 3; check 1)`);
    }
    check(mean >= 40 && mean <= 60, `the five-Wick mean ${mean.toFixed(1)} h is inside §4.9's 40–60 h band (outside it, one common price factor; check 1)`);
    console.log('\nSection 5\'s checks per Wick. Its bands of the no-passive curve\'s own level (clams a trip at a mark, purchases and maps by an hour, the last purchase in');
    console.log('40–60 h, each hold step\'s gain) are warnings for a Wick, which is meant to be faster (WICKS §3.2, +5–20% a minute); the rest fail as in section 5.\n');
    for (const w of WICK_IDS) pacingReport(PR[w], { tag: wickName(w), print: false });
    // Ashwick, the Wick and Tallow are the front-runners early: the first 25 trips side by side
    const f25 = (R) => R.first25.reduce((a, x) => a + x.clams, 0), m25 = (R) => R.first25.reduce((a, x) => a + x.min, 0);
    console.log(`\nThe first 25 trips (pacing clams; minutes): ${ALL.map((w) => `${wickName(w)} ${f0(f25(PR[w ?? 'none']))} (${f0(m25(PR[w ?? 'none']))} min, ${pc1(f25(PR[w ?? 'none']) / m25(PR[w ?? 'none']) / (f25(PR.none) / m25(PR.none)) - 1)} a minute)`).join(' · ')}\n`);
  }

  // ---- W6. clams a minute per era (check 2)
  title('W6. Clams a minute in each era over the no-passive player, on the kits each Wick fishes (check 2: +5–20% in every era)');
  {
    const g = (R, W) => { const e = R.era[W.id]; return e ? (e.cw / e.tw) / (e.cn / e.tn) - 1 : null; };
    table(['era (the newest open water)', ...WICK_IDS.map(wickName), 'Tallow as revision 3'], LOOP.waters.map((W) => [`${W.order}. ${W.name}`, ...WICK_IDS.map((w) => { const v = g(PR[w], W); return v == null ? '—' : pc1(v); }), (() => { const v = g(TALLOW_R3, W); return v == null ? '—' : pc1(v); })()]));
    for (const w of WICK_IDS) {
      const vals = LOOP.waters.map((W) => ({ W, v: g(PR[w], W) })).filter((x) => x.v != null), bad = vals.filter((x) => x.v < 0.05 || x.v > 0.2);
      warn(!bad.length, `[${wickName(w)}] +5–20% clams a minute in every era (a warning: the lead, WICKS §3.5 decision 3) (${pc1(Math.min(...vals.map((x) => x.v)))} to ${pc1(Math.max(...vals.map((x) => x.v)))})${bad.length ? `: out in ${bad.map((x) => `${x.W.name} ${pc1(x.v)}`).join(', ')}` : ''}`);
    }
  }

  // ---- W7. the map ladder and the place maps per Wick (checks 1 and 8)
  title('W7. The next map is worth having for every Wick: section 6 (a)–(c) per Wick (checks 1 and 8)');
  {
    const rate = (k, seed, w) => run(k, POL.natural(), nM, seed, opt(w)).perMin, rows = [];
    for (const w of WICK_IDS.filter((x) => x !== 'wick')) {
      let wOpen = Infinity, wOpenAt = '', wFull = Infinity, wFullAt = '', wPlace = Infinity, wPlaceAt = '';
      for (const [i, W] of LOOP.waters.entries()) {
        if (i > 0) {
          const Pw = LOOP.waters[i - 1], [bt, bh] = buyAt(W), st = settleT(W);
          const a = rate(kitAt(W, bt, bh, lakePlaces(W), false), 31 + W.order, w) / rate(kitAt(Pw, bt, bh, ordinaryPlaces(Pw)), 31 + Pw.order, w);
          const b = rate(kitAt(W, st, 8, ordinaryPlaces(W)), 31 + W.order, w) / rate(kitAt(Pw, st, 8, ordinaryPlaces(Pw)), 31 + Pw.order, w);
          if (a < wOpen) { wOpen = a; wOpenAt = W.name; } if (b < wFull) { wFull = b; wFullAt = W.name; }
        }
        const t = settleT(W), h = settleHold(W); let cur = lakePlaces(W), prev = rate(kitAt(W, t, h, cur), 3, w);
        for (const P of W.places.filter((p) => !p.legend && !p.inLake).sort((x, y) => x.price - y.price)) { cur = [...cur, P.id]; const r = rate(kitAt(W, t, h, cur), 3, w), gg = r / prev - 1; prev = r; if (gg < wPlace) { wPlace = gg; wPlaceAt = `${P.name} (${W.name})`; } }
      }
      rows.push([wickName(w), `${wOpen.toFixed(2)} (${wOpenAt})`, `${wFull.toFixed(2)} (${wFullAt})`, `${pc1(wPlace)} (${wPlaceAt})`]);
      warn(wOpen >= LADDER.open - 0.005, `[${wickName(w)}] no lake map is a downgrade on the day you buy it (worst ${wOpen.toFixed(2)}, ${wOpenAt}; target ≥ ${LADDER.open}; check 8)`);
      warn(wFull >= LADDER.growth - 0.005, `[${wickName(w)}] every water, fully mapped, pays at least ${LADDER.growth}× the one before (worst ${wFull.toFixed(2)}, ${wFullAt}; check 8)`);
      warn(wPlace >= LADDER.place - 0.005, `[${wickName(w)}] every place map, bought in price order, raises clams a minute by at least 5% (worst ${pc1(wPlace)}: ${wPlaceAt}; check 1)`);
    }
    console.log('The map ladder per Wick is a warning (the lead, WICKS §3.5 decision 5): the tiers are the no-passive player\'s, whose ladder (section 6) stays a failure.\n');
    table(['Wick', 'worst lake map on the day bought (≥ 1.05)', 'worst water fully mapped ÷ the one before (≥ 1.2)', 'worst place map (≥ +5%)'], rows);
    console.log('The Wick fishes as the no-passive player (its passive is the sale), so its rows are section 6\'s; its firsts only raise each new water\'s first evenings.\n');
  }

  // ---- W8. the three keys per Wick (check 7)
  title('W8. The three keys per Wick: the time to land each list, at the kit the water opens with in that Wick\'s pacing run (check 7)');
  {
    table(['water', ...ALL.map((w) => `${wickName(w)}: p50 / p95 / p99 min`)], LOOP.waters.map((W) => [`${W.order}. ${W.name}`, ...ALL.map((w) => { const L = PR[w ?? 'none'].KEYS.list[W.id]; return `${f0(L.p50)} / ${f0(L.p95)} / ${f0(L.p99)}`; })]));
    for (const w of WICK_IDS) {
      const Ls = LOOP.waters.map((W) => ({ W, L: PR[w].KEYS.list[W.id] })), worst = Ls.reduce((a, x) => (x.L.p95 > a.L.p95 ? x : a)), worst99 = Ls.reduce((a, x) => (x.L.p99 > a.L.p99 ? x : a));
      check(Ls.every((x) => x.L.p95 <= LOOP.access.target.p95 && x.L.p99 <= LOOP.access.target.p99 && x.L.open === 0), `[${wickName(w)}] every list: p95 ≤ ${LOOP.access.target.p95} min and p99 ≤ ${LOOP.access.target.p99} (worst p95 ${f0(worst.L.p95)}, ${worst.W.name}; worst p99 ${f0(worst99.L.p99)}, ${worst99.W.name}; check 7)`);
      const sealed = Math.max(...LOOP.waters.slice(1).map((W) => PR[w].KEYS.sealed[W.id]));
      check(sealed <= LOOP.access.target.sealed, `[${wickName(w)}] no bought lake map waits sealed more than ${LOOP.access.target.sealed} min (longest ${f0(sealed)} min)`);
    }
  }

  // ---- the summary
  title('W9. Summary');
  table(['Wick', 'everything bought (h)', 'vs mean', 'its own domain (1a kit)', 'seen on the first trip'], WICK_IDS.map((w) => [wickName(w), PR[w].doneH.toFixed(1), pc1(PR[w].doneH / mean - 1), dom[w].text, seen[w].text]));
  console.log(failures.length ? `\n${failures.length} check(s) FAILED${warns.length ? `, ${warns.length} warning(s)` : ''}` : `\nall checks passed${warns.length ? ` (${warns.length} warning(s))` : ''}`);
  return failures.length ? 1 : 0;
}

// ---------------------------------------------------------------- 0. the catalogue
title('0. The fish and the maps');
console.log(`${SPECIES.filter((s) => s.roster).length} roster entries (${ROSTER.fish.length} fish; one lives in two waters), ${SPECIES.filter((s) => !s.roster).length} built species kept beside them, ${WAITING.length} built species waiting for later sheets.`);
{
  const rows = LOOP.waters.map((W) => {
    const g = W.species.filter((s) => s.giant && !s.legend);
    return [`${W.order}. ${W.name}`, W.base, W.fight ?? `${C.lake[W.id]} (built)`, W.species.filter((s) => !s.never).length, g.length + 1, f0(W.lake), W.places.map((p) => `${p.extra ? p.kind + '+' : p.kind} ${p.inLake ? '(lake)' : f0(p.price)}`).join(' · '), W.plainBait];
  });
  table(['water', 'value tier', 'Fight', 'fish', 'giants', 'lake map', 'place maps', 'plain bait'], rows);
}
// every roster fish lives on at least one map
{
  const homeless = SPECIES.filter((s) => s.roster && !s.never && !s.legend && (s.giant ? !PLACE[s.placeId] : s.kind !== 'open' && !WATER[s.water].places.some((p) => p.kind === s.kind)));
  check(homeless.length === 0, `every roster fish lives on at least one map${homeless.length ? ': missing ' + homeless.map((s) => s.name).join(', ') : ''}`);
  const legends = LOOP.waters.every((W) => W.places.some((p) => p.legend === W.legend));
  check(legends, 'every water has one legend in its crown');
  const onePer = PLACES.every((p) => p.giants.length <= 1);
  check(onePer, 'one giant per place at most');
}

// ---------------------------------------------------------------- 1. values
title('1. What a fish sells for (clams): value tier × rarity × body × e^(0.9·z), clamped 0.4–30, Trophy × 1.25, Elder × 1.6');
{
  const rows = [];
  for (const W of LOOP.waters) for (const rar of ['common', 'uncommon', 'rare', 'epic']) {
    const sps = W.species.filter((s) => s.rarity === rar && !s.never); if (!sps.length) continue;
    const mean = (c) => sps.reduce((a, s) => a + clamsFor(s, z[c]), 0) / sps.length;
    rows.push([`${W.order}. ${W.name} · ${rar === 'epic' ? 'giants' : rar} (${sps.length})`, ...CL5.map((c) => f0(mean(c)))]);
  }
  table(['water · rarity (fish)', 'Small', 'Keeper', 'Prize', 'Trophy', 'Elder'], rows);
  const mult = (c) => (Math.min(LOOP.value.clamp[1], Math.max(LOOP.value.clamp[0], Math.exp(LOOP.value.perZ * z[c]))) * (LOOP.value.classBonus[c === 'ancient' ? 'elder' : c] ?? 1)).toFixed(1);
  console.log(`size multiplier at a class's typical size: Small ×${mult('small')} · Keeper ×${mult('keeper')} · Prize ×${mult('prize')} · Trophy ×${mult('trophy')} · Elder ×${mult('elder')} · Ancient ×${mult('ancient')}`);
  // the giants top the ladder: at every size class, the cheapest giant of a water sells for more than its dearest other fish
  let worst = Infinity, where = '';
  for (const W of LOOP.waters) {
    const g = W.species.filter((s) => s.giant && !s.legend), o = W.species.filter((s) => !s.giant && !s.never);
    if (!g.length) continue;
    const r = Math.min(...g.map((s) => clamsFor(s, z.keeper))) / Math.max(...o.map((s) => clamsFor(s, z.keeper)));
    if (r < worst) { worst = r; where = W.name; }
  }
  // no step down: a water's giants (mean Keeper value) sell for at least 0.8× the giants of the water before
  let dip = Infinity, dipAt = '', prevG = null;
  for (const W of LOOP.waters) {
    const g = W.species.filter((s) => s.giant && !s.legend); if (!g.length) continue;
    const m = g.reduce((a, s) => a + clamsFor(s, z.keeper), 0) / g.length;
    if (prevG) { const r = m / prevG.m; if (r < dip) { dip = r; dipAt = `${prevG.W.name} ${f0(prevG.m)} → ${W.name} ${f0(m)}`; } }
    prevG = { W, m };
  }
  check(dip >= 0.8, `no water's giants are a step down: a Keeper giant sells for at least 0.8× the water before's (worst ${dip.toFixed(2)}: ${dipAt})`);
  check(worst > 1, `the giants top every water's ladder: at the same size class the cheapest giant sells for ${worst.toFixed(2)}× the dearest other fish (worst: ${where})`);
}

// ---------------------------------------------------------------- 2. strategies and the anti-grind check
title('2. Strategies: does waiting for giants pay? (clams per minute against the natural rule)');
for (const [i, st] of STAGES.entries()) {
  const seed = 1000 + i * 17, nat = run(st.kit, POL.natural(), N, seed);
  const rows = [], row = (x, note = '') => rows.push([x.name + note, f0(x.clams), f1(x.min), f1(x.perMin), pc(x.perMin / nat.perMin), f1(x.bites), f1(x.kept), f1(x.letGo)]);
  const best = bestFound(st.kit, seed), all = [POL.keepAll(), POL.picky(), POL.dark(), POL.hop('prize'), POL.giantHunt(), POL.grind('prize'), POL.grind('trophy')].map((p) => run(st.kit, p, N, seed));
  row(nat); row(best); for (const x of all) row(x);
  const ctl = [POL.natural(), POL.giantHunt(1e9), POL.grind('trophy', 1e9)].map((p) => run(st.kit, p, Math.max(300, N >> 3), seed, { noQuiet: true }));
  for (const x of ctl) row(x, '  [if the water never went quiet]');
  const goodBites = Math.round(st.kit.hold * LOOP.water.openPerSlot) + LOOP.water.openExtra + st.kit.places.reduce((a, id) => a + LOOP.water.good[PLACE[id].kind], 0);
  console.log(`-- ${st.label}; ${goodBites} good bites for ${st.kit.hold} slots`);
  table(['strategy', 'clams/trip', 'min', 'clams/min', 'vs natural', 'bites', 'kept', 'let go'], rows);
  console.log(`   natural rule: 10th–90th percentile ${f0(nat.p10)}–${f0(nat.p90)} clams (median ${f0(nat.p50)}); ${pc(nat.noBig)} of trips bring home no Prize or bigger; ${pc(nat.anyTrophy)} a Trophy or bigger; ${(nat.anyElder * 100).toFixed(1)}% an Elder; a giant bites on ${pc(nat.giantBite)} of trips and comes home on ${(nat.giantHome * 100).toFixed(1)}%; ${pc(nat.full)} come home full; ${pc(nat.nightBite)} get a bite after dark; ${pc(nat.lost / Math.max(1e-9, nat.hooks))} of hooked fish get away\n`);
  const patient = all.slice(2), worst = Math.max(...patient.map((x) => x.perMin / nat.perMin));
  check(worst <= 1.05, `anti-grind (${st.id}): no patient strategy earns more than 105% of the natural rule per minute (best ${pc(worst)})`);
  check(all[4].perMin / nat.perMin <= 0.75, `anti-grind (${st.id}): the giant hunt earns at most 75% per minute (${pc(all[4].perMin / nat.perMin)})`);
  const choosy = all[1].perMin / nat.perMin;
  check(choosy >= 0.85 && choosy <= 1.05, `let go is a choice (${st.id}): choosy play ("Prize+ while fresh, then fill") earns ${pc(choosy)} of the natural rule per minute and ${pc(all[1].clams / nat.clams)} per trip (target 85–105% per minute)`);
  check(nat.perMin / best.perMin >= 0.88, `natural play (${st.id}): the natural rule earns at least 88% of the best rule found (${pc(nat.perMin / best.perMin)})`);
  check(ctl[2].clams / ctl[0].clams >= 1.4, `the rule is needed (${st.id}): without quiet water the Trophy grind would bring ${(ctl[2].clams / ctl[0].clams).toFixed(1)}× the clams per trip`);
  if (st.id === 'start') {
    check(nat.min >= 1.5 && nat.min <= 3, `first trip: ${f1(nat.min)} min (target 1.5–3)`);
    check(nat.noBig >= 0.4 && nat.noBig <= 0.8, `first trip: ${pc(nat.noBig)} of trips bring home no Prize or bigger (target 40–80%: a big one is a chance, not a promise)`);
    check(nat.nightBite >= 0.5, `first trip: ${pc(nat.nightBite)} of trips get a bite after dark (target ≥ 50%)`);
  }
  if (st.id === '40h') check(nat.min <= 6, `late trips stay short: ${f1(nat.min)} min at hold 8 (target ≤ 6)`);
}

// ---------------------------------------------------------------- 2b. every new water, at its arrival kit
title('2b. Every new water on the tackle it is bought with: the anti-grind, let-go and bait checks, water by water');
{
  const rows = [];
  for (const W of LOOP.waters.slice(4)) {
    const t = W.order < 10 ? 5 : 6, kit = { water: W.id, rod: t, line: t, reel: t, hold: 8, lure: W.lure[0], bait: null, places: full(W.id), oars: 3, keel: 2, lantern: 2 };
    const seed = 1000 + W.order * 17, nat = run(kit, POL.natural(), N, seed);
    const all = [POL.keepAll(), POL.dark(), POL.hop('prize'), POL.giantHunt(), POL.grind('prize'), POL.grind('trophy')].map((p) => run(kit, p, N, seed));
    const patient = Math.max(...all.slice(1).map((x) => x.perMin / nat.perMin)), hunt = all[3].perMin / nat.perMin;
    const CH = 6000, choosy = run(kit, POL.picky(), CH, 11).perMin / run(kit, POL.natural(), CH, 11).perMin;   // the same 6000 trips in quick and full runs: the ratio is noisy
    const nB = Math.max(N, 4000), a = run(kit, POL.natural(), nB, 502), plain = W.plainBait, gainOf = (b) => run({ ...kit, bait: b }, POL.natural(), nB, 502).perMin / a.perMin - 1;
    const gp = gainOf(plain); let worst = -Infinity, worstId = plain;
    for (const b of Object.keys(LOOP.bait).filter((b) => (LOOP.bait[b].at ?? 1) <= W.order && b !== plain)) { const g = gainOf(b) - gp; if (g > worst) { worst = g; worstId = b; } }
    const a1 = run(kit, POL.natural(), nB, 501), b1 = run({ ...kit, bait: plain }, POL.natural(), nB, 501), earn = (b1.gross - a1.gross) / Math.max(1e-9, b1.baitCost);
    rows.push([`${W.order}. ${W.name}`, `T${t}`, pc(patient), pc(hunt), pc(choosy), `${LOOP.bait[plain].name} +${pc(gp)} (${earn.toFixed(1)}×)`, `${LOOP.bait[worstId].name} ${(worst * 100).toFixed(1)}`]);
    check(patient <= 1.05 && hunt <= 0.75, `anti-grind (${W.name}): no patient strategy earns more than 105% of the natural rule (best ${pc(patient)}) and the giant hunt at most 75% (${pc(hunt)})`);
    check(choosy >= 0.85 && choosy <= 1.05, `let go is a choice (${W.name}): choosy play earns ${pc(choosy)} of the natural rule per minute (target 85–105%)`);
    check(gp >= 0.03 && gp <= 0.25 && earn >= 1.3, `bait (${W.name}, ${LOOP.bait[plain].name}): +${pc(gp)} clams a minute net of the tins, a tin earns ${earn.toFixed(1)}× its price (target +3–25% and ≥ 1.3×)`);
    check(worst <= 0.03, `no tin is the one to buy (${W.name}): the best other tin (${LOOP.bait[worstId].name}) beats the plain bait by ${(worst * 100).toFixed(1)} points a minute (target ≤ 3)`);
  }
  table(['water', 'tackle', 'best patient', 'giant hunt', 'choosy', 'plain bait (earns × price)', 'best other tin vs plain (points)'], rows);
}

// ---------------------------------------------------------------- 3. clams per trip by tackle and hold
title('3. Clams per trip (minutes) by tackle tier and hold: the natural rule, each water with its ordinary places');
for (const w of ['mossmere', 'glasswater', 'paleabyss', LOOP.waters[7].id, LOOP.waters[10].id, LOOP.waters[15].id]) {   // slots 1, 3, 4, 8, 11, 16
  const places = placesOf(w, ['day', 'old', 'night', 'extra']), lure = bestLureOf(w, Object.keys(LOOP.familyLures)), rows = [];
  for (const t of [0, 2, 4, 5, 6]) rows.push([`T${t}`, ...[3, 5, 6, 8].map((h) => { const x = run({ water: w, rod: t, line: t, reel: t, hold: h, lure, bait: null, places, oars: 1, keel: 1, lantern: 1 }, POL.natural(), Math.max(500, N >> 3), 77 + t * 10 + h); return `${f0(x.clams)} (${f1(x.min)})`; })]);
  console.log(`-- ${NAME[w]} (${lure ? LURE_NAME[lure] : 'no lure'})`);
  table(['tackle', 'hold 3', 'hold 5', 'hold 6', 'hold 8'], rows);
}

// ---------------------------------------------------------------- 4. bait
title('4. Bait: what a tin is worth (natural rule; net of the tin)');
{
  const rows = [], kitOf = (id) => STAGES.find((s) => s.id === id).kit;
  const G = { water: 'glasswater', rod: 3, line: 3, reel: 3, hold: 7, lure: 'glimmer_spoon', bait: null, places: full('glasswater'), oars: 3, keel: 2, lantern: 2 };
  for (const [stId, bait] of [['1h', 'mireworm'], ['5h', 'spore_cake'], ['10h', 'ember_roe'], ['20h', WATER[W6.id].plainBait], ['40h', WATER[W12.id].plainBait]]) {
    const kit = stId === '10h' ? G : kitOf(stId), nB = Math.max(N * 2, 8000), a = run(kit, POL.natural(), nB, 501), b = run({ ...kit, bait }, POL.natural(), nB, 501);
    const gain = b.gross - a.gross, cost = b.baitCost;
    rows.push([`${stId}: ${LOOP.bait[bait].name} (${NAME[kit.water]})`, f0(baitTin(bait, kit.water)), f1(b.baitUsed), f0(a.clams), f0(b.gross), f0(cost), f0(b.clams), pc(b.perMin / a.perMin - 1), (gain / Math.max(1e-9, cost)).toFixed(1)]);
    const g = b.perMin / a.perMin - 1;
    check(gain / cost >= 1.3 && g >= 0.03 && g <= 0.25, `bait (${stId}, ${bait}): +${pc(g)} clams a minute, net of the tins, and a tin earns ${(gain / cost).toFixed(1)}× its price (target +3–25% and ≥ 1.3×: worth buying, never a must)`);
  }
  table(['stage: bait', 'tin of 10', 'baits/trip', 'no bait', 'gross with', 'bait cost', 'net with', 'net gain/min', 'earns × price'], rows);
  // no tin is the one to buy: at each stage, no tin beats the water's plain bait by more than 3 points of clams a minute
  const trows = [];
  for (const [stId, kit] of [['10h', G], ['20h', kitOf('20h')], ['40h', kitOf('40h')]]) {
    const nB = Math.max(N, 4000), a = run(kit, POL.natural(), nB, 502), plain = WATER[kit.water].plainBait, gainOf = (b) => run({ ...kit, bait: b }, POL.natural(), nB, 502).perMin / a.perMin - 1;
    const gp = gainOf(plain); let worst = -Infinity, worstId = plain;
    for (const b of Object.keys(LOOP.bait).filter((b) => (LOOP.bait[b].at ?? 1) <= WATER[kit.water].order)) { const g = gainOf(b); trows.push([`${stId}: ${NAME[kit.water]}`, LOOP.bait[b].name + (b === plain ? ' (plain)' : ''), pc(g)]); if (g - gp > worst) { worst = g - gp; worstId = b; } }
    check(worst <= 0.03, `no tin is the one to buy (${stId}, ${NAME[kit.water]}): the best tin (${LOOP.bait[worstId].name}) beats the plain bait by ${(worst * 100).toFixed(1)} points a minute (target ≤ 3)`);
  }
  table(['stage', 'tin', 'net gain/min'], trows);
}

// ---------------------------------------------------------------- 4b. giants and legends
title("4b. The giants a map promises: how often they bite and land (the natural rule at the water's arrival tackle, that place alone with open water)");
{
  const ARRIVE = { mossmere: 1, sporewood: 2, glasswater: 3, paleabyss: 4 };
  const rows = [];
  for (const P of PLACES.filter((p) => p.giants.length)) {
    const W = WATER[P.water], t = ARRIVE[W.id] ?? (W.order < 10 ? 5 : 6), g = W.species.find((s) => s.id === P.giants[0]);
    const kit = { water: W.id, rod: t, line: t, reel: t, hold: 6, lure: null, bait: null, places: [P.id], oars: 2, keel: 1, lantern: 1 };
    const a = run(kit, POL.natural(), Math.max(800, N >> 2), 4242), b = run({ ...kit, lure: W.lure[0] }, POL.natural(), Math.max(800, N >> 2), 4242);
    const pPrize = landP(g, 'prize', kit, 'struck', P.kind === 'night');
    rows.push([`${W.order}. ${P.name}`, g.name, `T${t}`, pc(pPrize), pc(a.giantBite), `${(a.giantHome * 100).toFixed(1)}%`, f0(1 / Math.max(1e-9, a.giantKept)), `${(b.giantHome * 100).toFixed(1)}%`, f0(1 / Math.max(1e-9, b.giantKept))]);
    // the hardest fish to land: at Prize, on the arrival tackle, the giant lands less often than any other fish of its water
    const others = W.species.filter((s) => !s.giant && !s.never && !s.legend).map((s) => landP(s, 'prize', kit, 'struck', P.kind === 'night'));
    if (W.fight != null && (pPrize < 0.3 || pPrize > 0.505)) check(false, `a new water's giant lands a Prize 30–50% of the time on arrival tackle: ${g.name} lands ${pc(pPrize)}`);
    if (pPrize >= Math.min(...others)) check(false, `the giant is the hardest fish of its water: ${g.name} at Prize lands ${pc(pPrize)}, another fish of ${W.name} lands ${pc(Math.min(...others))}`);
  }
  table(['place', 'its giant', 'tackle', 'a Prize lands', 'it bites on', 'comes home on', 'trips per giant', "with the giants' lure", 'trips'], rows);
  check(true, 'every giant is the hardest fish of its water to land at Prize, on that water\'s arrival tackle (any exception is listed above as a FAIL)');
  check(true, "every new water's giant lands a Prize 30–50% of the time on that water's arrival tackle (any exception is listed above as a FAIL)");
  const lrows = [];
  for (const W of LOOP.waters) {
    const t = { mossmere: 1, sporewood: 2, glasswater: 3, paleabyss: 4 }[W.id] ?? (W.order < 10 ? 5 : 6), kit = { rod: t, line: t, reel: t };
    let alive = 1, tries = 0, maxP = 0;
    for (let k = 0; k < 12 && alive > 0.02; k++) { const p = legendP(W.legend, kit, k); maxP = Math.max(maxP, p); tries += alive; alive *= 1 - p; }
    maxP = Math.max(maxP, legendP(W.legend, { rod: 6, line: 6, reel: 6 }, 3));
    const crown = W.places.find((p) => p.legend), sp = SPECIES.find((s) => s.id === W.legend);
    lrows.push([`${W.order}. ${sp.name}`, `T${t}`, pc(legendP(W.legend, kit, 0)), tries.toFixed(1), f0(W.legendBait[1]), f0(tries * W.legendBait[1]), f0(crown.price), f0(crown.price * LOOP.value.legendRematch)]);
    check(maxP <= C.cap.legend + 1e-9, `${sp.name}: never better than a coin flip, whatever you bring (best ${pc(maxP)})`);
  }
  table(['legend', 'tackle', 'first try lands', 'tries expected', 'bait per try', 'bait in all', 'first landing pays', 'later landings pay'], lrows);
  // a giants' lure never costs you clams: fitted on the tackle you settle with, it earns at least 97% of the best family lure
  const grows = []; let worstL = Infinity, worstLAt = '';
  for (const W of LOOP.waters.slice(4)) {
    const t = settleT(W), base = kitAt(W, t, 8, ordinaryPlaces(W), false), fam = run(base, POL.natural(), Math.max(1500, N >> 1), 707).perMin;
    const own = run({ ...base, lure: W.lure[0] }, POL.natural(), Math.max(1500, N >> 1), 707).perMin, r = own / fam;
    grows.push([`${W.order}. ${W.name}`, LURE_NAME[W.lure[0]], LOOP.giantsLures[W.lure[0]].map((id) => SPECIES.find((s) => s.id === id).name).join(', '), LURE_NAME[base.lure] || 'none', pc(r - 1)]);
    if (r < worstL) { worstL = r; worstLAt = `${LURE_NAME[W.lure[0]]} in ${W.name}`; }
  }
  table(["water", "its giants' lure", 'draws', 'best family lure', 'giants\' lure vs family (clams a minute)'], grows);
  check(worstL >= 0.97, `a giants' lure never costs clams: fitted, it earns at least 97% of the best family lure (worst ${pc(worstL)}: ${worstLAt})`);
}

// ---------------------------------------------------------------- 5. the pacing run
title('5. Pacing: an average player along a sensible buying order, all 16 waters, each opened by its three keys');
const MAIN = pacing();                                     // the no-passive player (the reference row of --wicks)
const KEYS = MAIN.KEYS;                                    // what section 7 reads back
pacingReport(MAIN);

// ---------------------------------------------------------------- 6. the next map is always worth having
title('6. The next map is always worth having (clams per minute, the natural rule)');
{
  const n = 3000, rate = (k, seed) => run(k, POL.natural(), n, seed).perMin;
  // (a) a lake map is never a downgrade: on the day you buy it (that day's tackle and hold), its open water and old water pay at least
  //     1.05× the water before it fully mapped; (b) fully mapped, on the tackle you then fish it with, 1.2× the water before it
  const lrows = []; let worstOpen = Infinity, worstOpenAt = '', worstFull = Infinity, worstFullAt = '';
  for (const [i, W] of LOOP.waters.entries()) {
    if (i === 0) continue;
    const Pw = LOOP.waters[i - 1], [bt, bh] = buyAt(W), st = settleT(W);
    const a = rate(kitAt(W, bt, bh, lakePlaces(W), false), 31 + W.order) / rate(kitAt(Pw, bt, bh, ordinaryPlaces(Pw)), 31 + Pw.order);
    const b = rate(kitAt(W, st, 8, ordinaryPlaces(W)), 31 + W.order) / rate(kitAt(Pw, st, 8, ordinaryPlaces(Pw)), 31 + Pw.order);
    if (a < worstOpen) { worstOpen = a; worstOpenAt = W.name; } if (b < worstFull) { worstFull = b; worstFullAt = W.name; }
    lrows.push([`${W.order}. ${W.name}`, `T${bt}, hold ${bh}`, a.toFixed(2), `T${st}`, b.toFixed(2)]);
  }
  table(['lake map', 'on the day you buy it', 'its open and old water ÷ the water before, fully mapped', 'settled', 'fully mapped ÷ the water before, fully mapped'], lrows);
  check(worstOpen >= LADDER.open - 0.005, `no lake map is a downgrade: on the day you buy it, its open water and old water pay at least ${LADDER.open}× the water before it fully mapped (worst ${worstOpen.toFixed(2)}, ${worstOpenAt})`);
  check(worstFull >= LADDER.growth - 0.005, `every water, fully mapped, pays at least ${LADDER.growth}× the water before it (worst ${worstFull.toFixed(2)}, ${worstFullAt})`);
  // (c) every place map, bought in price order, raises clams a minute by at least 5%
  const prows = []; let worstPlace = Infinity, worstPlaceAt = '';
  for (const W of LOOP.waters) {
    const t = settleT(W), h = settleHold(W); let cur = lakePlaces(W), prev = rate(kitAt(W, t, h, cur), 3); const steps = [];
    for (const P of W.places.filter((p) => !p.legend && !p.inLake).sort((x, y) => x.price - y.price)) {
      cur = [...cur, P.id]; const r = rate(kitAt(W, t, h, cur), 3), g = r / prev - 1; prev = r;
      steps.push(`${P.name} ${g >= 0 ? '+' : ''}${Math.round(g * 100)}%`); if (g < worstPlace) { worstPlace = g; worstPlaceAt = `${P.name} (${W.name})`; }
    }
    prows.push([`${W.order}. ${W.name}`, `T${t}, hold ${h}`, steps.join(' · ')]);
  }
  table(['water', 'kit', 'each place map in price order (clams a minute)'], prows);
  check(worstPlace >= LADDER.place - 0.005, `every place map, bought in price order, raises clams a minute by at least ${Math.round(LADDER.place * 100)}% (worst ${pc(worstPlace)}: ${worstPlaceAt})`);
  // (d) no stopping short: no set of a water's places pays more than the next water fully mapped (both on the next water's tackle)
  let worstSub = 0, worstSubAt = '';
  for (const [i, W] of LOOP.waters.entries()) {
    if (i === LOOP.waters.length - 1) continue;
    const Nw = LOOP.waters[i + 1], t = settleT(Nw), next = rate(kitAt(Nw, t, 8, ordinaryPlaces(Nw)), 41), opt = W.places.filter((p) => !p.legend && !p.inLake);
    for (let m = 0; m < 1 << opt.length; m++) {
      const pl = [...lakePlaces(W), ...opt.filter((_, k) => m & (1 << k)).map((p) => p.id)], r = rate(kitAt(W, t, 8, pl), 41) / next;
      if (r > worstSub) { worstSub = r; worstSubAt = `${W.name} with ${pl.map((id) => PLACE[id].name).join(', ') || 'open water'}`; }
    }
  }
  check(worstSub < 1, `no stopping short: no set of a water's places pays more than the next water fully mapped (closest ${worstSub.toFixed(2)}: ${worstSubAt})`);
}

// ---------------------------------------------------------------- 7. the three keys
title('7. The three keys: the map, the gear and one of each fish of the water before (SPEC §5.5)');
{
  const T = LOOP.access.target, PU = LOOP.access.pull, Ws = LOOP.waters;
  // (a) the gear key of every lake map
  const grows = Ws.slice(1).map((W) => {
    const g = gearKey(W.id);
    return [`${W.order}. ${W.name}`, g.id, f0(g.price), g.shelfAt === 1 ? 'start' : `the ${NAME[Ws[g.shelfAt - 1].id].replace(/^The /, '')} map`, `${KEYS.gearAt[W.id].toFixed(1)} h`, `${KEYS.boughtAt[W.id].toFixed(1)} h`, `${KEYS.openedAt[W.id].toFixed(1)} h`, f0(KEYS.sealed[W.id])];
  });
  console.log('-- (a) the gear key of every lake map, and when the pacing run holds each key');
  table(['water', 'gear key', 'price', 'on the shelf with', 'the pacing run owns it at', 'its map bought at', 'it opens at', 'sealed (min)'], grows);
  if (KEYS.movedKeys.length) console.log(`   bought before its map, ahead of the v7.1 order: ${KEYS.movedKeys.join('; ')}\n`);
  const lateShelf = Ws.slice(1).filter((W) => gearKey(W.id).shelfAt > W.order - 1).map((W) => W.name);
  check(!lateShelf.length, `every gear key is on the shelf before its map is offered${lateShelf.length ? ': not ' + lateShelf.join(', ') : ''}`);
  check(KEYS.gearOwned === true, 'the pacing run owns every gear key when it buys the map (a key is bought before its map)');
  // (b) the lists
  console.log('-- (b) the list of every water (computed from the fish: open water, and the day and old water its lake map opens, on its plain bait)');
  table(['water', 'count', 'its list (the next water\'s catch key)', 'needs a tin (off the list)'], Ws.map((W) => [`${W.order}. ${W.name}`, listFor(W.id).length,
    listFor(W.id).map((id) => SP[id + '@' + W.id].name).join(', '), W.species.filter((x) => listMark(x) === 'tin').map((x) => x.name).join(', ') || '—']));
  const shortest = Ws.reduce((a, W) => (listFor(W.id).length < listFor(a.id).length ? W : a));
  check(listFor(shortest.id).length >= T.minList, `every list has at least ${T.minList} fish (shortest: ${shortest.name}, ${listFor(shortest.id).length})`);
  const noBite = [];
  for (const W of Ws) for (const id of listFor(W.id)) {
    const stops = [null, ...lakePlaces(W)];
    if (!stops.some((pid) => LIGHT.some((ph) => { const x = poolFor(W.id, pid, ph, null, W.plainBait).list.find(([sp]) => sp.id === id); return x && SP[id + '@' + W.id].hours.includes(ph); }))) noBite.push(`${SP[id + '@' + W.id].name} (${W.name})`);
  }
  check(!noBite.length, `every listed fish bites on its water's plain bait, in its hours, in open water or at a place its lake map opens${noBite.length ? ': not ' + noBite.join(', ') : ''}`);
  // (c) how long a list takes, at the kit the water opens with in the pacing run
  const nC = QUICK ? 100 : 200, rows = [], stat = {};
  for (const W of Ws) {
    const kit = KEYS.kit[W.id], L = KEYS.list[W.id], nat = run(kit, POL.natural(), Math.max(N, 4000), 7100 + W.order).perMin;
    const noPull = listStudy(W, kit, nC, { journal: true, pull: false }, 7200 + W.order, 150), plain = listStudy(W, kit, nC, { journal: false }, 7300 + W.order, 150);
    const era = KEYS.era[W.id], next = Ws[W.order], ratio = L.perMin / nat, windfall = L.mean * (ratio - 1);
    const still = next ? L.times.filter((t) => t > era).length / L.players : null, extra = next ? L.times.reduce((a, t) => a + Math.max(0, t - era), 0) / L.players : null;
    stat[W.id] = { L, era, still, extra, ratio, windfall, next };
    const big = (x) => `${f0(x.p50)} / ${x.open > 0.05 ? `over ${f0(x.p95)}` : f0(x.p95)}`;
    rows.push([`${W.order}. ${W.name}`, `T${kit.rod}/${kit.line}/${kit.reel}, hold ${kit.hold}`, `${L.toLand} of ${listFor(W.id).length}`, `${f0(L.mean)} / ${f0(L.p50)}`, `${f0(L.p95)} / ${f0(L.p99)}`, `${f1(L.ev)} / ${L.ev95}`, big(noPull), big(plain), f0(era),
      next ? `${(still * 100).toFixed(1)}%` : '—', next ? f1(extra) : '—', pc(ratio), `${windfall >= 0 ? '+' : ''}${f1(windfall)}`]);
    check(L.p95 <= T.p95 && L.p99 <= T.p99 && L.open === 0, `the list of ${W.name} (${L.toLand} to land): the slow player in twenty lands it in ${f0(L.p95)} min, the slowest in a hundred in ${f0(L.p99)} (target ≤ ${T.p95} and ≤ ${T.p99}; the Journal route with the pull, ${L.players} players)`);
  }
  console.log(`-- (c) the time to land a whole list: ${NL} players a water, each on the kit the pacing run opens it with, the natural rule on the Journal route, with the pull`);
  console.log(`   (×min(${PU.cap}, 1 + ${PU.perEvening} × evenings), never Small from evening ${PU.floorFrom + 1}, the sure bite from evening ${PU.sureFrom + 1}); pacing minutes, the visit home included; contrasts: ${nC} players\n`);
  table(['water', 'kit', 'to land', 'mean / median min', 'p95 / p99 min', 'evenings (mean / p95)', 'without the pull: median / p95', 'the plain natural route (with the pull): median / p95', 'its era: fished there before the next map (min)',
    'still open then', 'expected extra wait (min)', 'clams a minute while it is open ÷ natural', 'windfall (min of income)'], rows);
  const gated = Ws.slice(0, 15), wStill = gated.reduce((a, W) => (stat[W.id].still > stat[a.id].still ? W : a)), wExtra = gated.reduce((a, W) => (stat[W.id].extra > stat[a.id].extra ? W : a));
  check(stat[wStill.id].still < T.stillOpen, `fewer than ${pc(T.stillOpen)} of players still have a list open when the pacing run owns the next map and its gear (${stat[wStill.id].still > 0 ? `most: ${wStill.name}, ${(stat[wStill.id].still * 100).toFixed(1)}%` : `none of ${NL} at any water; the shortest era is ${f0(Math.min(...gated.map((W) => stat[W.id].era)))} min of fishing, the longest list's slowest player in a hundred ${f0(Math.max(...gated.map((W) => stat[W.id].L.p99)))} min`})`);
  check(stat[wExtra.id].extra <= T.extraWait, `the catch key's extra wait is at most ${T.extraWait} min for the average player (${stat[wExtra.id].extra > 0 ? `longest: ${wExtra.name}, ${f1(stat[wExtra.id].extra)} min` : 'none at any water'})`);
  const wWind = Ws.reduce((a, W) => (stat[W.id].windfall > stat[a.id].windfall ? W : a)), net = Ws.reduce((a, W) => a + stat[W.id].windfall, 0);
  check(stat[wWind.id].windfall <= T.windfall, `the pull's windfall is at most ${T.windfall} min of income an era (largest: ${wWind.name}, ${f1(stat[wWind.id].windfall)} min; all 16 eras together ${net >= 0 ? '+' : ''}${f1(net)} min, which the pacing run leaves out)`);
  const wSeal = Ws.slice(1).reduce((a, W) => (KEYS.sealed[W.id] > KEYS.sealed[a.id] ? W : a));
  check(KEYS.sealed[wSeal.id] <= T.sealed, `no bought lake map waits sealed more than ${T.sealed} min (${KEYS.sealed[wSeal.id] > 0 ? `longest: ${wSeal.name}, ${f0(KEYS.sealed[wSeal.id])} min` : 'every water opens the moment its map is bought: its gear is owned and the list of the water before is landed'})`);
  check(KEYS.doneH >= T.hours[0] && KEYS.doneH <= T.hours[1], `the long game with the three keys: everything bought at ${KEYS.doneH.toFixed(1)} h (target ${T.hours[0]}–${T.hours[1]}: about 48)`);
  // the first trip of a fresh save is fished with the whole of the Mossmere's list missing: the mercy must leave it as section 2 found it
  // (a floor from the first evening fills the hold early: 48 clams in 1.9 min, and only 39% of first trips get a bite after dark)
  const st = STAGES[0].kit, a = run(st, POL.natural(), N, 1000), b = run(st, POL.natural(), N, 1000, { missing: new Set(listFor('mossmere')), n: 0, journal: true });
  check(b.min >= 1.5 && b.min <= 3 && b.noBig >= 0.4 && b.noBig <= 0.8 && b.nightBite >= 0.5, `the first trip of a fresh save, every fish of the Mossmere's list still missing, with the pull as it stands that evening: ${f0(b.clams)} clams in ${f1(b.min)} min, ${pc(b.noBig)} bring home no Prize or bigger, ${pc(b.nightBite)} get a bite after dark (the natural rule alone: ${f0(a.clams)} in ${f1(a.min)}, ${pc(a.noBig)}, ${pc(a.nightBite)}; targets as section 2: 1.5–3 min, 40–80%, ≥ 50%)`);
}

console.log(failures.length ? `\n${failures.length} check(s) FAILED` : '\nall checks passed');
return failures.length ? 1 : 0;
}
if (IS_MAIN) process.exit(report());
