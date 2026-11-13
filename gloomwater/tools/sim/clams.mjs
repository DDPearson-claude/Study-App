#!/usr/bin/env node
// tools/sim/clams.mjs — the clam economy of the Full Hold (docs/loop/SPEC.md, DESIGN §26), rebuilt on the roster.
//
// What it proves (89 checks; exits 1 if any fails):
//   0. every roster fish lives on at least one map; one legend per water; one giant per place;
//   1. fish values by water, rarity and size class under the value rule, and that the rare giants top every water's ladder;
//   2. the anti-grind rule: with "the water goes quiet", waiting for giants never beats fishing naturally; and "let go" is a real
//      choice: choosy play (let the small ones go while the water is fresh) earns 85–105% of the natural rule per minute;
//   3. clams per trip by tackle tier and hold size;
//   4. bait: +3–25% clams a minute net of the tins, a tin earns at least 1.3× its price, and no tin beats its water's plain bait;
//   4b. giants and legends: how often the giant a map promises bites and lands, and what a legend hunt costs and pays;
//   5. the pacing targets along a sensible buying order across all 16 waters (10 min, 1 h, 5 h, 20 h, 40 h, the end), every hold
//      step and raft part pays its way, and a new water is the best water from the day its map is bought;
//   6. the next map is always worth having: no lake map is a downgrade on the day you buy it (its open, day and old water pay
//      ≥ 1.05× the water before it fully mapped), every water fully mapped pays ≥ 1.2× the one before, every place map raises
//      clams a minute by ≥ 5%, and no set of a water's places pays more than the next water fully mapped.
//
// Where the fish come from: docs/loop/roster.json (164 fish: rarity, water, place kind or a giant's own place, hours, family,
// play style, size model) plus the built species the roster keeps beside them (src/data.js SPECIES_V3, roster §5 "kept as they
// are"). Curiosities and the never-hooked Gill Lodger are outside the economy.
// What comes from src/data.js (never copied here): the size classes and the size model (BALANCE_V3.size, sizeClassOf, isAncient,
// maxZFor), the land chance (catchParts: the Wick, TACKLE Hold T0–T4, the strike, the Fight terms of the built lakes, class and
// rarity, CATCH_V3.items' Hold, the caps, the legend rule), the lures and baits (LURES, BAITS), the time model (AUTOFISH).
// What is a draft table here (it moves into data.js as `LOOP` with slice 1, and grows per slice): the value rule, the hold
// ladder, quiet water, the evening, the 16 waters' value tiers and Fight terms, tackle T5–T6, the map catalogue and every price.
//
// Run from gloomwater/:
//   node tools/sim/clams.mjs            everything (about 25 s)
//   node tools/sim/clams.mjs --quick    fewer trips per row (numbers move by a few percent; about 20 s)
//   node tools/sim/clams.mjs --md       the tables as markdown (for SPEC.md)
//   node tools/sim/clams.mjs --fish     Appendix A: every fish of every water with its values (markdown)
//   node tools/sim/clams.mjs --json     the LOOP draft tables as JSON
//   node tools/sim/clams.mjs --calibrate  the value tiers that satisfy section 6's two ladder rules (with a 2-point margin)
// Deterministic: every row has its own fixed seed. Exits 1 if a pacing target, a ladder rule or the anti-grind check fails.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; globalThis.GW_LOOP = true;   // the loop's data: v3 at phase 1 (data.js reads the flags once, at import)
const D = await import('../../src/data.js');
const ROSTER = JSON.parse(fs.readFileSync(new URL('../../docs/loop/roster.json', import.meta.url), 'utf8'));
const IS_MAIN = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

const A = D.AUTOFISH, SZ = D.BALANCE_V3.size, RW = D.RARITY_WEIGHTS, C = D.CATCH_V3;
const args = process.argv.slice(2), QUICK = args.includes('--quick'), MD = args.includes('--md') || args.includes('--fish');
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
// The twelve new waters. `base` is the value tier (tuned with --calibrate: section 6's two ladder rules); `lake` is the lake map's
// price (about 42 minutes of the water's own income fully mapped; it opens the water's open, day and old water). Fight term: GEN.fight (28–32 on
// T5 waters, 38–44 on T6 waters, so a giant at Prize lands about as often on arrival tackle as the built lakes' giants do). The place maps are shares of the lake map (PLACE_SHARE).
const NEW_WATER = {
  rushlight_fen:      { name: 'Rushlight Fen',      base: 86,  lake: 33300,   lure: ['rushlight_spinner', 'Rushlight Spinner'], legendBait: ['storm_candle', 'Storm Candle'] },
  thin_water:         { name: 'The Thin Water',     base: 74,  lake: 40700,   lure: ['weir_spoon', 'Weir Spoon'],               legendBait: ['lamp_snail', 'Lamp Snail'] },
  lampmoss_slough:    { name: 'Lampmoss Slough',    base: 103,  lake: 58400,   lure: ['mosslamp_jig', 'Moss-Lamp Jig'],          legendBait: ['carp_cutlet', 'Carp Cutlet'] },
  pyrefall_gorge:     { name: 'Pyrefall Gorge',     base: 223,  lake: 71800,   lure: ['ember_wobbler', 'Ember Wobbler'],         legendBait: ['charred_offering', 'Charred Offering'] },
  thunder_stair:      { name: 'The Thunder Stair',  base: 166,  lake: 88100,   lure: ['thunder_plug', 'Thunder Plug'],           legendBait: ['wired_bream', 'Wired Bream'] },
  inkwood:            { name: 'The Inkwood',        base: 245,  lake: 145000,   lure: ['ink_fly', 'Ink Fly'],                     legendBait: ['blossom_fly', 'Blossom Fly'] },
  siltway:            { name: 'The Siltway',        base: 309,  lake: 178000,   lure: ['silt_rattle', 'Silt Rattle'],             legendBait: ['bargemans_supper', "Bargeman's Supper"] },
  salt_gate:          { name: 'The Salt Gate',      base: 238,  lake: 241000,   lure: ['tide_spoon', 'Tide Spoon'],               legendBait: ['tide_mullet', 'Tide Mullet'] },
  lanternroot_lagoon: { name: 'Lanternroot Lagoon', base: 454,  lake: 373000,   lure: ['rootlamp_popper', 'Root-Lamp Popper'],    legendBait: ['mothwing_fly', 'Moth-Wing Fly'] },
  waxen_reef:         { name: 'The Waxen Reef',     base: 1060, lake: 496000,   lure: ['wax_jig', 'Wax Jig'],                     legendBait: ['lantern_fry', 'Lantern-Fry'] },
  last_light:         { name: 'The Last Light',     base: 920,  lake: 605000,  lure: ['lighthouse_feather', 'Lighthouse Feather'], legendBait: ['lighthouse_ration', 'Lighthouse Ration'] },
  rime_sound:         { name: 'The Rime Sound',     base: 1247, lake: 738000,  lure: ['rime_pirk', 'Rime Pirk'],                 legendBait: ['old_ration', 'Old Ration'] },
};
// A place may draw fish of its water's open pool (× weight); the two day waters with no fish of their own are drawn this way.
const PLACE_DRAWS = { lily_maze: { candlefin_koi: 3, weeping_carp: 1.5 }, lullaby: { sleepspore_jelly: 2, velvet_ray: 1.5 } };
// Where a roster fish bites in play, where this spec moves it (SPEC §5.2: every place map promises a fish of its own, never a
// common): the roster's kind of place is kept for every other fish.
export const KIND_MOVE = { ambersickle_tuna: 'night', grumbleplate: 'day', cocoon_sleeper: 'day', kitewing_ray: 'day', bouldermouth: 'day', coalwing_skate: 'night',
  starbar_lancer: 'day', lampspot_snakehead: 'day', cabin_grouper: 'night', tailwatch_mudfish: 'night' };
// A roster fish this spec gives a place of its own (it bites only there; SPEC §5.2)
export const OWN_MOVE = { picket_pike: 'drowned_spire' };
export const LAKE_OPENS = ['old', 'day'];   // a lake map opens its open water, its day water and its old water
const PLACE_SHARE = { day: 0, old: 0, extra: 0.39, night: 0.43, crown: 0.59 };   // a new water's place maps, as a share of its lake map (which opens its day and old water)
const GEN = { fight: [28, 29, 30, 31, 32, 38, 39, 40, 41, 42, 43, 44], legendFight: 26, legendBait: 0.12, lure: 0.3 };

function makeWaters() {
  const built = [
    { id: 'mossmere', name: 'The Mossmere', base: 7, lake: 0, prices: { day: 60, old: 150, night: 260, crown: 500 },
      legend: 'belled_matriarch', legendBait: ['heartmoss', 60], lure: ['bell_spinner', 180] },
    { id: 'sporewood', name: 'Sporewood Pools', base: 11, lake: 2000, prices: { day: 400, old: 800, extra: 1100, night: 1200, crown: 2200 },
      legend: 'drifting_grove', legendBait: ['glowcap_bulb', 250], lure: ['sporelamp_fly', 500] },
    { id: 'glasswater', name: 'Glasswater Vault', base: 16, lake: 10200, prices: { day: 2000, old: 3200, extra: 4000, night: 4800, crown: 7500 },
      legend: 'glass_sovereign', legendBait: ['prism_moth', 1000], lure: ['mirror_shard', 2400] },
    { id: 'paleabyss', name: 'The Pallid Deep', base: 35, lake: 26000, prices: { day: 7000, old: 11000, night: 14000, crown: 19000 },
      legend: 'lantern_swallower', legendBait: ['last_candle', 3000], lure: ['ferry_coin', 9000] },
  ].map((w, i) => ({ ...w, order: i + 1, reach: 1, fight: null }));
  const fresh = Object.entries(NEW_WATER).map(([id, w], k) => {
    const i = k + 5, lake = w.lake;
    const prices = Object.fromEntries(Object.entries(PLACE_SHARE).map(([kind, s]) => [kind, Math.round(lake * s / 100) * 100]));
    const legend = ROSTER.fish.find((f) => f.rarity === 'legendary' && f.water.includes(w.name)).id;
    return { id, name: w.name, order: i, reach: 1 + Math.floor((i - 1) / 4), base: w.base,
      fight: GEN.fight[k], lake, prices, legend, legendBait: [w.legendBait[0], Math.round(prices.crown * GEN.legendBait / 10) * 10, w.legendBait[1]],
      lure: [w.lure[0], Math.round(lake * GEN.lure / 100) * 100, w.lure[1]] };
  });
  return [...built, ...fresh];
}

export const baitTin = (id, water) => Math.max(5, Math.round(LOOP.baitRule.grade * WATER[water].base / 5) * 5);
export const LOOP = {
  // ---- sale value: clams = max(1, round(base[water] × rarity × body × clamp(e^(perZ·z)) × classBonus)). body = clamp(√(L50 / 45 cm)).
  // A legend is not sold: her first landing pays her crown map's price, later landings 40% of it.
  value: { perZ: 0.9, clamp: [0.4, 30], classBonus: { trophy: 1.25, elder: 1.6 }, rarity: { common: 1, uncommon: 2.4, rare: 5.5, epic: 12 },
    body: { ref: 45, exp: 0.5, clamp: [0.6, 1.6] }, legendRematch: 0.4 },
  // ---- the rare giants (roster: the descendant of each episode's main fish; epic, or legendary for a water's crown)
  giant: { share: { inHour: 0.06, offHour: 0.025 }, favour: 0.3, minZ: -0.25, fight: 10, elderFight: 2 },   // its share of the bites at its own place; never Small; +10 Fight over a rare
  kindWeight: 2.5,                                        // a fish of a kind of place (a "night water" rare) at a place of that kind
  dayDraw: 1.5,                                             // a day water draws its water's open uncommon and rare fish (× weight)
  placeCommon: 0.5,                                         // a common's weight at any place (the place's own fish crowd out the small fry)
  // ---- the hold: 3 slots at the start; each step is bought once, in order
  hold: { start: 3, ladder: [{ slots: 4, price: 30 }, { slots: 5, price: 120 }, { slots: 6, price: 450 }, { slots: 7, price: 2000 }, { slots: 8, price: 3500 }] },
  // ---- the water goes quiet: good bites per evening by kind (open water: one per slot of the hold, plus openExtra). EVERY bite spends one.
  // open water: one good bite per slot of the hold, plus openExtra (a bigger hold is a longer good evening, not a longer quiet one)
  water: { good: { day: 2, old: 3, night: 2, crown: 2 }, openPerSlot: 1, openExtra: 1, stale: { favour: -0.15, floor: -1.2, wait: 0.3, waitMax: 2.2 } },
  // let go: the water forgives. A fish let go at the card gives back the good bite it spent, and the next bites at that water run
  // bigger: +favour each, to cap, for the rest of the evening there
  letGo: { favour: 0.2, cap: 0.4, refund: 1 },
  evening: { day: 40, dusk: 20 },
  favour: { place: 0.15, window: { day: 0.4, old: 0.4, night: 0.3, crown: 0.2 }, dusk: 0.2, night: 0.25, perLantern: 0.1, perKeel: 0.1, setup: 0.15 },
  kept: { weight: 3, live: 0.5 },                         // a built place's own species (not a giant): a rare's weight × 3, half the time
  // ---- tackle: one price per tier per slot (Rod, Line, Reel bought separately); T5 and T6 are new (their Hold below); no proof catches
  tackle: { price: [0, 50, 300, 1200, 6000, 32000, 100000], extraHold: { rod: [15, 18], line: [16, 19], reel: [15, 18] },
    names: { 5: ['Bellwether', 'Starthread', 'Moonwheel'], 6: ['Crown-Reed', 'Kingshair', 'Last Wheel'] }, shelfAt: [1, 1, 1, 2, 3, 4, 10] },   // shelfAt: the water whose map puts it on the shelf
  waters: makeWaters(),
  // ---- the giants' lures: the four built ones are re-aimed at their lake's giants; one new lure per new water (+10 Hold, attract ×1.5)
  giantsLures: {
    bell_spinner: ['thousandcast_pike', 'hullkiss_lamprey', 'reedjaw_pike'],
    sporelamp_fly: ['harpstring_eel', 'festival_puffer', 'emberbrood_snakehead'],
    mirror_shard: ['shardspine_eel', 'wolfwake_trout', 'prismdrop_sturgeon'],
    ferry_coin: ['gilt_eyed_eel', 'candlewake_sturgeon', 'the_clapper'],
  },
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
    windfall_plum: { at: 10, name: 'Windfall Plum', hold: 5 },   // new: the Inkwood's fruit eaters
    tallow_soap:   { at: 9, name: 'Tallow Soap', hold: 5 },      // new: whiskered scavengers
  },
  tinSize: 10,
  // ---- the raft, besides the hold
  raft: {
    oars:    { prices: [60, 300],  speed: 1.5, perLevel: 'raft speed +1.5 m/s (6 → 9)' },
    keel:    { prices: [100, 600, 3000], perLevel: 'every fish runs bigger: favour +0.1 everywhere' },
    lantern: { prices: [100, 500], perLevel: 'night fish run bigger: favour +0.1 after dark; a wider pool of light' },
  },
  // ---- home (the Jetty, then the Landing)
  home: {
    orders:  { prices: [70, 400, 4000], perLevel: "one more of Murk's orders (an order pays double for one named fish)" },
    baitBed: { prices: [120, 700, 9000], perLevel: "free bait each evening: 3 / 6 / 10 of the water's plain bait" },
    wall:    { prices: [250, 30000, 80000, 150000], perLevel: "one wing of the Long Wall per reach of four waters: your best ink print of every fish there" },
    lights:  { prices: [200, 1200, 14000], perLevel: 'jetty lanterns, quay lanterns, the sea-gate beacon (looks only)' },
  },
  looks: { slate_dye: 300, oxblood_pennant: 400, amber_glass: 600, painted_prow: 2500, bell_buoy: 6000, gilt_lantern: 40000, reed_sail: 50000, star_pennant: 100000, moon_lamp: 200000 },
  time: { out: 14, between: 8, raftSpeed: 6, home: 6, sale: 8, shop: 16, pass: 0.9, show: 1.5 },
  player: { clams: 0.9, time: 1.25, orderGain: 0.06 },
};
const WATER = Object.fromEntries(LOOP.waters.map((w) => [w.id, w]));
const WATER_OF_NAME = Object.fromEntries(ROSTER.waters.map((w, i) => [w.name, LOOP.waters[i].id]));
const NAME = Object.fromEntries(LOOP.waters.map((w) => [w.id, w.name]));

// =====================================================================================================================
// the fish of the loop: the roster, plus the built species it keeps
// =====================================================================================================================
const HOURS = { any: ['day', 'dusk', 'night'], 'any, best at night': ['day', 'dusk', 'night'], day: ['day', 'dusk'], dusk: ['dusk', 'night'],
  night: ['night'], 'day, dusk': ['day', 'dusk'], 'dusk, night': ['dusk', 'night'] };   // an hour opens a window that runs into the next phase
const BUILT_TIME = { any: HOURS.any, calm: ['day', 'dusk'], gloom: ['night'], dawn: ['day'] };
const ITEM_NAMES = [...D.LURES.map((l) => [l.id, l.name]), ...D.BAITS.map((b) => [b.id, b.name]), ['cut_strip', 'Cut Strip'], ['ferry_coin', "Ferryman"],
  ['windfall_plum', 'Windfall Plum'], ['tallow_soap', 'Tallow Soap'], ['lumen_moss', 'Lumen Moss']];
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
for (const f of ROSTER.fish) {
  for (const wn of f.water) {
    const water = WATER_OF_NAME[wn];
    const style = f.rarity === 'legendary' ? (C.legend.style[f.id] || (f.play.match(/a (steady|darter|sinker|leaper|thrasher|runner|sulker)/i)?.[1] || f.play.split('.')[0]).toLowerCase()) : f.play.split('.')[0].toLowerCase();
    const fav = f.favours || '', baits = new Set();
    for (const [id, n] of ITEM_NAMES) if (fav.includes(n)) baits.add(id);
    const only = fav.match(/bites on ([A-Z][A-Za-z' -]+?) only/);
    const built = builtIds.has(f.id) ? D.SPECIES_V3_BY_ID[f.id] : null;
    const placeId = f.giant && f.rarity !== 'legendary' ? placeIdOf(f.placeName) : null;
    SPECIES.push({ id: f.id, name: f.name, water, rarity: f.rarity, giant: !!f.giant, legend: f.rarity === 'legendary', kind: OWN_MOVE[f.id] ? 'old' : KIND_MOVE[f.id] ?? f.place, ownPlace: OWN_MOVE[f.id] || undefined, moved: !!(KIND_MOVE[f.id] || OWN_MOVE[f.id]), placeId,
      hours: HOURS[f.hours] || HOURS.any, hoursText: f.hours, bestNight: /best at night/.test(f.hours), style, family: f.family, L50: f.sizeModel.L50,
      record: f.lengthCm[2], bait: only ? ITEM_NAMES.find(([, n]) => n === only[1])?.[0] : (built?.bait && !built.bait.includes('heart') ? built.bait : null),
      baits, plan: f.bodyPlan, never: f.family === 'none', roster: true });
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
    const rare = W.species.filter((s) => s.rarity === 'rare' && !s.never).sort((a, b) => b.L50 - a.L50)[0];
    LOOP.giantsLures[W.lure[0]] = [...W.species.filter((s) => s.giant && !s.legend).map((s) => s.id), ...(rare ? [rare.id] : [])];
  }
  const tins = ['mireworm', 'spore_cake', 'ember_roe', 'windfall_plum', 'tallow_soap'].filter((b) => (LOOP.bait[b].at ?? 1) <= W.order);
  const count = (b) => W.species.filter((s) => s.baits.has(b)).length;
  W.plainBait = { mossmere: 'mireworm', sporewood: 'spore_cake', glasswater: 'ember_roe', paleabyss: 'ember_roe' }[W.id] || tins.sort((a, b) => count(b) - count(a))[0];
}
const LURE_NAME = Object.fromEntries([...D.LURES.map((l) => [l.id, l.name]), ...LOOP.waters.filter((w) => w.lure[2]).map((w) => [w.lure[0], w.lure[2]])]);

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
const lureMatch = (id, sp) => {
  if (!id) return false;
  if (LOOP.giantsLures[id]) return LOOP.giantsLures[id].includes(sp.id);
  const l = D.LURES.find((x) => x.id === id); if (!l) return false;
  return (l.family && sp.family === l.family) || (l.night && sp.hours.length === 1 && sp.hours[0] === 'night');
};
const lureAttract = (id) => (LOOP.giantsLures[id] ? 1.5 : D.LURES.find((x) => x.id === id)?.attract ?? 1);
const lureFavour = (id, sp) => { const l = D.LURES.find((x) => x.id === id); return l?.favour && !LOOP.giantsLures[id] && lureMatch(id, sp) ? l.favour : 0; };
const P_CACHE = new Map();
/** Land chance: data.js's catchParts for the Wick, the tackle, the strike, class and rarity and the built lakes' Fight; the draft adds the
 *  new waters' Fight term, a giant's Fight and the item Hold for fish data.js does not know yet. Same formula, same caps, same floor. */
export function landP(sp, cls, kit, strike, night) {
  const key = `${sp.id}|${sp.water}|${cls}|${kit.rod}|${kit.line}|${kit.reel}|${kit.lure}|${kit.bait}|${strike}|${night}`;
  let p = P_CACHE.get(key); if (p !== undefined) return p;
  const builtLake = BUILT.includes(sp.water) ? sp.water : 'mossmere', W = WATER[sp.water];
  const like = { id: sp.id, rarity: sp.rarity === 'epic' ? 'rare' : sp.rarity, style: sp.style, family: sp.family, place: sp.ownPlace || undefined, zone: builtLake, maxClass: sp.maxClass || undefined };
  const hold = { rod: tierHold('rod', kit.rod), line: tierHold('line', kit.line), reel: tierHold('reel', kit.reel) };
  const parts = D.catchParts(like, cls, { hold }, { strike, lake: builtLake, night });
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

const POOLS = new Map();
/** The fish that can bite in a water at a phase: open-water fish everywhere; a place adds the fish of its kind, its giant and its own
 *  built species; the lure and the bait tilt the pool; a fish that bites on one bait only needs it. */
function poolFor(water, placeId, phase, lure, bait) {
  const key = `${water}|${placeId}|${phase}|${lure}|${bait}`;
  if (POOLS.has(key)) return POOLS.get(key);
  const P = placeId ? PLACE[placeId] : null, list = []; let giant = null;
  for (const s of WATER[water].species) {
    if (s.legend || s.never || !s.hours.includes(phase)) continue;
    if (s.bait && s.bait !== bait) continue;
    let w;
    if (s.giant) { if (P && s.placeId === P.id) giant = s; continue; }
    else if (s.ownPlace) { if (!P || s.ownPlace !== P.id) continue; w = (RW.rare ?? 6) * LOOP.kept.weight * LOOP.kept.live; }
    else if (s.kind !== 'open') { if (!P || P.kind !== s.kind) continue; w = (RW[s.rarity] ?? 6) * (s.rarity === 'common' ? LOOP.placeCommon : LOOP.kindWeight); }
    else w = (RW[s.rarity] ?? 6) * (P?.draws?.[s.id] ?? (P?.kind === 'day' && s.rarity !== 'common' ? LOOP.dayDraw : 1)) * (P && s.rarity === 'common' ? LOOP.placeCommon : 1);
    if (s.bestNight && phase === 'night') w *= 1.5;
    if (bait && s.bait === bait) w *= 1.5;               // a bait changes which fish bite only for a fish that bites on nothing else
    if (lureMatch(lure, s)) w *= lureAttract(lure);
    list.push([s, w]);
  }
  let others = list.reduce((a, [, w]) => a + w, 0);
  if (others < (RW.common ?? 70)) for (const s of WATER[water].species) {   // little of this hour here: the water's open fish still bite (nothing ever stops biting)
    if (s.kind !== 'open' || s.giant || s.legend || s.never || s.hours.includes(phase) || (s.bait && s.bait !== bait)) continue;
    const w = (RW[s.rarity] ?? 6) * (lureMatch(lure, s) ? lureAttract(lure) : 1); list.push([s, w]); others += w;
  }
  if (giant && others > 0) {                             // a giant is a fixed share of the bites at its place: more in its hour, never none
    const share = giant.hours.includes(phase) ? LOOP.giant.share.inHour : LOOP.giant.share.offHour, gl = LOOP.giantsLures[lure]?.includes(giant.id) ? lureAttract(lure) : 1;   // only its own giants' lure draws it
    list.push([giant, others * share * gl / (1 - share * gl)]);
  }
  const pool = { list, tot: list.reduce((a, [, w]) => a + w, 0) };
  POOLS.set(key, pool); return pool;
}
const pick = (r, pool) => { let x = r() * pool.tot; for (const [s, w] of pool.list) { x -= w; if (x <= 0) return s; } return pool.list[pool.list.length - 1][0]; };
const STRIKES = Object.entries(A.player.strike);
const pickStrike = (r) => { let x = r(); for (const [g, f] of STRIKES) { x -= f; if (x <= 0) return g; } return 'struck'; };
const playMid = (c) => (A.play[c].dur[0] + A.play[c].dur[1]) / 2;
export const KIND_ORDER = { old: 0, day: 1, late: 2, night: 3, crown: 4, open: 5 };   // the natural route: old water first, day water while it is light,
// an old water whose giant bites only from dusk ("late", the hour glyph on its card) at dusk, night water when dark falls, open water to top up
const routeKind = (P) => (P.kind === 'old' && P.giants.length && !SP[P.giants[0] + '@' + P.water].hours.includes('day') ? 'late' : P.kind);

// =====================================================================================================================
// one trip.  kit: {water, rod, line, reel, hold, lure, bait, places: [ids], oars, keel, lantern}
// policy: {strike(cls, ctx), keep(fish, ctx), leave(ctx), waitDark}
// =====================================================================================================================
export function trip(kit, policy, r, opts = {}) {
  const L = LOOP, T = A.time, S = L.water.stale, E = L.evening, F = L.favour;
  const freshOf = (W) => (opts.noQuiet ? Infinity : W.kind === 'open' ? Math.round(kit.hold * L.water.openPerSlot) + L.water.openExtra : L.water.good[W.kind]);
  const sail = (base) => base * L.time.raftSpeed / (L.time.raftSpeed + L.raft.oars.speed * (kit.oars | 0));
  const waters = [{ id: null, kind: 'open' }, ...kit.places.map((id) => ({ id, kind: PLACE[id].kind, route: routeKind(PLACE[id]) }))].sort((a, b) => KIND_ORDER[a.route || a.kind] - KIND_ORDER[b.route || b.kind]);
  const baitFav = kit.bait && L.bait[kit.bait] ? L.baitRule.favour : 0;
  let clock = 0, real = 0;
  const adv = (s, frozen = false) => { real += s; if (!frozen) clock += s; };
  const phase = () => (clock < E.day ? 'day' : clock < E.day + E.dusk ? 'dusk' : 'night');
  const toDark = () => { const w = E.day + E.dusk - clock; if (w > 0) adv(w); };
  const out = { clams: 0, kept: 0, bites: 0, hooks: 0, landed: 0, letGo: 0, lost: 0, prize: 0, trophy: 0, elder: 0, elderBites: 0, nightBites: 0, baitUsed: 0, stale: 0,
    giantBites: 0, giantLanded: 0, giantKept: 0, giantClams: 0, giantRefused: 0 };
  const hold = [];
  adv(sail(L.time.out));
  if (policy.waitDark) toDark();
  outer: for (let wi = 0; wi < waters.length; wi++) {
    const W = waters[wi], last = wi === waters.length - 1;
    if (wi > 0) adv(sail(L.time.between));
    if (W.kind === 'night') toDark();
    if (W.route === 'late' && clock < E.day) adv(E.day - clock);   // a dusk giant's old water: wait there for the light to turn
    let here = 0, mercy = 0; const fresh = freshOf(W);
    for (;;) {
      if (hold.length >= kit.hold || out.bites >= 400) break outer;
      const over = Math.max(0, here - fresh);
      const ctx = { slots: kit.hold - hold.length, hold: kit.hold, freshHere: Math.max(0, fresh - here), over, last, watersLeft: waters.length - 1 - wi, phase: phase(), kind: W.kind, giantHere: !!(W.id && PLACE[W.id].giants.length) };
      if (policy.leave(ctx)) { if (last) break outer; break; }
      const ph = phase(), night = ph === 'night', pool = poolFor(kit.water, W.id, ph, kit.lure, kit.bait);
      if (!pool.tot) { if (last) break outer; break; }
      const sp = pick(r, pool);
      const atOwn = sp.giant;                              // a giant only bites at its own place
      let mu = (W.id ? F.place + F.window[W.kind] : 0) + F.setup + (ph === 'dusk' ? F.dusk : night ? F.night + F.perLantern * (kit.lantern | 0) : 0)
        + baitFav + lureFavour(kit.lure, sp) + (sp.giant ? LOOP.giant.favour : 0) + Math.max(S.floor, S.favour * over) + F.perKeel * (kit.keel | 0) + mercy;
      mu = Math.min(D.BALANCE_V3.favour.cap, mu);
      adv(T.cast + T.wait * Math.min(S.waitMax, 1 + S.wait * over));
      const maxZ = Math.min(sp.maxClass ? SZ.classMaxZ[sp.maxClass] : SZ.z.max, W.kind === 'old' || atOwn ? SZ.z.max : SZ.elsewhereMaxZ);   // Elders: old water, and a giant at its own place
      const z = truncZ(r, mu, sp.giant ? LOOP.giant.minZ : SZ.z.min, maxZ);
      const cls = D.isAncient(z) ? 'ancient' : D.sizeClassOf(z);
      here++; out.bites++; if (over > 0) out.stale++; if (night) out.nightBites++; if (CI[cls] >= 4) out.elderBites++; if (sp.giant) out.giantBites++;
      if (!policy.strike(cls, ctx)) { adv(L.time.pass); continue; }
      out.hooks++; if (kit.bait) out.baitUsed++;
      const p = landP(sp, cls, kit, pickStrike(r), night);
      const quick = cls === 'small' || cls === 'keeper' ? 1 - A.player.hurry + A.player.hurry / A.play.inputs.hurry.mult : 1;
      adv(T.strike);
      if (r() < p) {
        out.landed++; if (sp.giant) out.giantLanded++;
        adv(playMid(cls) * quick);
        adv(T.ceremony[cls] + L.time.show + T.card, true);
        const fish = { sp, z, cls, value: clamsFor(sp, z) };
        if (policy.keep(fish, ctx)) { hold.push(fish); if (CI[cls] >= 2) out.prize++; if (CI[cls] >= 3) out.trophy++; if (CI[cls] >= 4) out.elder++; if (sp.giant) { out.giantKept++; out.giantClams += fish.value; } } else { out.letGo++; mercy = Math.min(L.letGo.cap, mercy + L.letGo.favour); if (L.letGo.refund) here = Math.max(0, here - 1); }
      } else { out.lost++; adv(playMid(cls) * quick * 0.72 + T.lostNote); }
    }
  }
  adv(L.time.home + L.time.sale + L.time.shop, true);
  out.kept = hold.length; out.gross = hold.reduce((a, f) => a + f.value, 0);
  out.baitCost = kit.bait ? out.baitUsed * (baitTin(kit.bait, kit.water) / L.tinSize) : 0;
  out.clams = out.gross - out.baitCost; out.sec = real; out.sawNight = clock >= E.day + E.dusk;
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
  grid: (sMin, kLast, fill) => ({ name: `grid ${sMin}/${kLast}/${fill}`, strike: (c, x) => CI[c] >= sMin || !anyFresh(x), keep: (f, x) => x.slots > 1 || CI[f.cls] >= kLast || f.sp.giant || !anyFresh(x), leave: (x) => x.freshHere === 0 && (!x.last || x.over >= fill) }),
};

export function run(kit, policy, n = N, seed = 1, opts = {}) {
  const r = rng(seed), acc = {}, all = []; let noBig = 0, anyTrophy = 0, anyElder = 0, full = 0, night = 0, nightBite = 0, giantBite = 0, giantHome = 0;
  for (let i = 0; i < n; i++) {
    const x = trip(kit, policy, r, opts);
    for (const k of Object.keys(x)) if (typeof x[k] === 'number') acc[k] = (acc[k] || 0) + x[k];
    if (!x.prize) noBig++; if (x.trophy) anyTrophy++; if (x.elder) anyElder++; if (x.kept >= kit.hold) full++; if (x.sawNight) night++; if (x.nightBites) nightBite++;
    if (x.giantBites) giantBite++; if (x.giantKept) giantHome++;
    all.push(x.clams);
  }
  for (const k of Object.keys(acc)) acc[k] /= n;
  all.sort((a, b) => a - b);
  return { ...acc, min: acc.sec / 60, perMin: acc.clams / (acc.sec / 60), p10: all[(n * 0.1) | 0], p50: all[(n * 0.5) | 0], p90: all[(n * 0.9) | 0],
    noBig: noBig / n, anyTrophy: anyTrophy / n, anyElder: anyElder / n, full: full / n, night: night / n, nightBite: nightBite / n, giantBite: giantBite / n, giantHome: giantHome / n, name: policy.name };
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
export function calibrate(n = 3000) {
  const rows = [];
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

if (args.includes('--json')) { console.log(JSON.stringify({ ...LOOP, waters: LOOP.waters.map(({ species, places, ...w }) => ({ ...w, places: places.map(({ id, kind, extra, price, giants, own }) => ({ id, kind, extra, price, giants, own })) })) }, null, 2)); return 0; }
if (args.includes('--calibrate')) {
  // the value tier each water needs (SPEC §4.9): the larger of "its open water pays 1.05× the water before, fully mapped, on the day
  // you buy its map" and "fully mapped, it pays 1.2× the water before, fully mapped, on the tackle you then fish it with"
  const rows = calibrate(), out = {};
  for (const r of rows) {
    out[r.W.id] = r.tier;
    console.log(`${r.W.order}. ${r.W.name}: tier ${r.tier}` + (r.byOpen ? ` (open-water rule ${r.byOpen.toFixed(1)}, growth rule ${r.byGrowth.toFixed(1)}; fully mapped ${f0(r.full)} clams/min; 25 min of it ${f0(r.lakeAt25)})` : ''));
  }
  console.log(JSON.stringify(out)); return 0;
}
if (args.includes('--fish')) {
  for (const W of LOOP.waters) {
    console.log(`\n**${W.order}. ${W.name}** (value tier ${W.base})\n`);
    const rows = W.species.filter((s) => !s.never).sort((a, b) => (b.legend - a.legend) || (b.giant - a.giant) || (LOOP.value.rarity[b.rarity] ?? 99) - (LOOP.value.rarity[a.rarity] ?? 99) || a.name.localeCompare(b.name)).map((s) => {
      const where = s.legend ? PLACES.find((p) => p.legend === s.id)?.name : s.giant ? PLACE[s.placeId].name : s.ownPlace ? PLACE[s.ownPlace].name : s.kind === 'open' ? 'open water' : `${s.kind} water`;
      const vals = s.legend ? ['—', '—', '—', '—', `pays ${f0(PLACES.find((p) => p.legend === s.id).price)}`] : CL5.map((c) => ((c === 'small' && s.giant) || (c === 'elder' && !(s.giant || s.kind === 'old' || (s.ownPlace && PLACE[s.ownPlace].kind === 'old') || s.kind === 'open')) ? '—' : f0(clamsFor(s, z[c]))));
      return [`${s.giant ? '★ ' : ''}${s.name}${s.roster ? '' : ' (built)'}`, s.rarity, s.hoursText, where, ...vals];
    });
    table(['fish', 'rarity', 'bites', 'where', 'Small', 'Keeper', 'Prize', 'Trophy', 'Elder'], rows);
  }
  console.log(`Waiting for a later sheet (built, not roster fish): ${WAITING.map((s) => `${s.name} (${s.place})`).join(', ')}.`);
  return 0;
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
  check(worst > 1, `the giants top every water's ladder: at the same size class the cheapest giant sells for ${worst.toFixed(2)}× the dearest other fish (worst: ${where})`);
}

// ---------------------------------------------------------------- 2. strategies and the anti-grind check
const full = (w, extra = []) => [...placesOf(w, ['day', 'old', 'night']), ...extra];
const STAGES = [
  { id: 'start', label: 'first trip: T0, hold 3, the Mossmere, open water only', kit: { water: 'mossmere', rod: 0, line: 0, reel: 0, hold: 3, lure: null, bait: null, places: [], oars: 0, keel: 0, lantern: 0 } },
  { id: '10min', label: '10 min: Line T1, hold 4, the Lily Maze', kit: { water: 'mossmere', rod: 0, line: 1, reel: 0, hold: 4, lure: null, bait: null, places: ['lily_maze'], oars: 0, keel: 0, lantern: 0 } },
  { id: '1h', label: '1 h: T1, hold 5, the Mossmere with 3 places, Glimmer Spoon', kit: { water: 'mossmere', rod: 1, line: 1, reel: 1, hold: 5, lure: 'glimmer_spoon', bait: null, places: full('mossmere'), oars: 1, keel: 1, lantern: 0 } },
  { id: '5h', label: '5 h: T2, hold 6, Sporewood with its 4 ordinary places, Glimmer Spoon', kit: { water: 'sporewood', rod: 2, line: 2, reel: 2, hold: 6, lure: 'glimmer_spoon', bait: null, places: placesOf('sporewood', ['day', 'old', 'night', 'extra']), oars: 2, keel: 1, lantern: 1 } },
  { id: '20h', label: '20 h: T5, hold 8, the Thin Water with 3 places, its giants\' lure', kit: { water: 'thin_water', rod: 5, line: 5, reel: 5, hold: 8, lure: 'weir_spoon', bait: null, places: full('thin_water'), oars: 3, keel: 2, lantern: 2 } },
  { id: '40h', label: '40 h: T6, hold 8, the Salt Gate with 4 places, Glimmer Spoon', kit: { water: 'salt_gate', rod: 6, line: 6, reel: 6, hold: 8, lure: 'glimmer_spoon', bait: null, places: placesOf('salt_gate', ['day', 'old', 'night', 'extra']), oars: 3, keel: 3, lantern: 3 } },
];
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

// ---------------------------------------------------------------- 3. clams per trip by tackle and hold
title('3. Clams per trip (minutes) by tackle tier and hold: the natural rule, each water with its ordinary places');
for (const w of ['mossmere', 'glasswater', 'paleabyss', 'pyrefall_gorge', 'siltway', 'rime_sound']) {
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
  for (const [stId, bait] of [['1h', 'mireworm'], ['5h', 'spore_cake'], ['10h', 'ember_roe'], ['20h', WATER.thin_water.plainBait], ['40h', WATER.salt_gate.plainBait]]) {
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
    if (pPrize >= Math.min(...others)) check(false, `the giant is the hardest fish of its water: ${g.name} at Prize lands ${pc(pPrize)}, another fish of ${W.name} lands ${pc(Math.min(...others))}`);
  }
  table(['place', 'its giant', 'tackle', 'a Prize lands', 'it bites on', 'comes home on', 'trips per giant', "with the giants' lure", 'trips'], rows);
  check(true, 'every giant is the hardest fish of its water to land at Prize, on that water\'s arrival tackle (any exception is listed above as a FAIL)');
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
}

// ---------------------------------------------------------------- 5. the pacing run
title('5. Pacing: an average player along a sensible buying order, all 16 waters');
{
  const P = LOOP.player, state = { clams: 0, sec: 0, trips: 0, earned: 0, spent: 0, rod: 0, line: 0, reel: 0, hold: LOOP.hold.start, maps: ['mossmere'], places: new Set(), lures: new Set(), oars: 0, keel: 0, lantern: 0, orders: 0, baitBed: 0, wall: 0, lights: 0, legends: new Set() };
  const kitFor = (w) => ({ water: w, rod: state.rod, line: state.line, reel: state.reel, hold: state.hold, lure: bestLureOf(w, [...state.lures]),
    bait: state.sec > 1800 ? WATER[w].plainBait : null, places: WATER[w].places.filter((p) => state.places.has(p.id) && !p.legend).map((p) => p.id), oars: state.oars, keel: state.keel, lantern: state.lantern });
  const evalCache = new Map();
  const evalWater = (w) => {
    const kit = kitFor(w), key = JSON.stringify(kit);
    if (!evalCache.has(key)) {
      const x = run(kit, POL.natural(), QUICK ? 1000 : 1500, 9000 + evalCache.size);
      const bedFree = kit.bait ? Math.min(x.baitUsed, [0, 3, 6, 10][state.baitBed]) * (baitTin(kit.bait, w) / LOOP.tinSize) : 0;
      evalCache.set(key, { water: w, clams: (x.clams + bedFree) * P.clams * (1 + P.orderGain * state.orders), min: x.min * P.time, kept: x.kept, elder: x.elder, giant: x.giantKept });
    }
    return evalCache.get(key);
  };
  const bestWater = () => state.maps.slice(-3).map(evalWater).sort((a, b) => b.clams / b.min - a.clams / a.min)[0];
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
  const NAMES = { hold: (a) => `Hold ${a}`, rod: (a) => `Rod T${a}`, line: (a) => `Line T${a}`, reel: (a) => `Reel T${a}`, lake: (a) => `MAP: ${NAME[a]}`, place: (a) => `map: ${PLACE[a].name}`,
    lure: (a) => `lure: ${LURE_NAME[a] || a}`, raft: (a, b) => `raft: ${{ oars: 'Oars', keel: 'Keel', lantern: 'Lantern' }[a]} ${'I'.repeat(+b)}`,
    home: (a, b) => `home: ${{ orders: 'Order Board', baitBed: 'Bait Bed', wall: 'Long Wall wing', lights: 'Landing lights' }[a]} ${b}`, legend: (a) => `legend hunt: ${SPECIES.find((s) => s.id === a).name}`,
    look: (a) => `look: ${a.replace(/_/g, ' ')}` };
  const log = [], marks = [[10 / 60, '10 min'], [1, '1 h'], [5, '5 h'], [20, '20 h'], [40, '40 h']], markRows = []; let mi = 0, lastBuyTrips = 0; const sinceBuy = [];
  let elders = 0, giants = 0, giantAt = null;
  const snapshot = (label) => {
    const e = bestWater(), recent = sinceBuy.slice(-6), tpp = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 1;
    markRows.push({ label, owned: state.maps.length, clams: e.clams, min: e.min, tpp, bought: log.length, water: e.water, state: `T${state.rod}/${state.line}/${state.reel}, hold ${state.hold}, ${state.maps.length} water${state.maps.length > 1 ? 's' : ''}, ${state.places.size} place${state.places.size === 1 ? '' : 's'}`, giants });
  };
  const firstFished = {};
  const playTrip = () => { const e = bestWater(); if (firstFished[e.water] == null) firstFished[e.water] = state.sec / 3600; state.clams += e.clams; state.earned += e.clams; state.sec += e.min * 60; state.trips++; elders += e.elder; giants += e.giant; if (giantAt === null && giants >= 1) giantAt = state.sec / 3600; while (mi < marks.length && state.sec / 3600 >= marks[mi][0]) snapshot(marks[mi++][1]); return e; };
  const gains = [], nG = QUICK ? 3000 : 6000;
  for (const id of ORDER) {
    const cost = price(id); let guard = 0;
    while (state.clams < cost && guard++ < 20000) playTrip();
    const kindOf = id.split(':')[0], measure = kindOf === 'hold' || kindOf === 'raft';
    const w0 = measure ? bestWater().water : null, x0 = measure ? run(kitFor(w0), POL.natural(), nG, 606) : null, trip0 = measure ? evalWater(w0).clams : 0;
    state.clams -= cost; state.spent += cost; apply(id);
    if (measure) { const x1 = run(kitFor(w0), POL.natural(), nG, 606); gains.push({ id, name: NAMES[kindOf](...id.split(':').slice(1)), h: state.sec / 3600, g: x1.perMin / x0.perMin - 1, gt: x1.clams / x0.clams - 1, trips: cost / trip0 }); }
    const e = bestWater(), [kind, a, b] = id.split(':');
    sinceBuy.push(state.trips - lastBuyTrips);
    log.push({ id, name: NAMES[kind](a, b), cost, h: state.sec / 3600, trips: state.trips, waited: state.trips - lastBuyTrips, water: e.water, perTrip: e.clams, min: e.min });
    lastBuyTrips = state.trips;
  }
  const doneH = state.sec / 3600;
  while (mi < marks.length && state.trips < 40000) playTrip();
  table(['#', 'hour', 'trips', 'waited', 'buys', 'clams', 'then fishing', 'clams/trip', 'min/trip'],
    log.map((l, i) => [i + 1, l.h.toFixed(2), l.trips, l.waited, l.name, f0(l.cost), NAME[l.water], f0(l.perTrip), f1(l.min)]));
  console.log(`${log.length} purchases, ${f0(state.spent)} clams spent of ${f0(state.earned)} earned in ${doneH.toFixed(1)} h and ${f0(log[log.length - 1].trips)} trips.`);
  const byKind = {}; for (const l of log) { const k = l.id.split(':')[0]; const g = k === 'lake' || k === 'place' ? 'maps' : k === 'rod' || k === 'line' || k === 'reel' ? 'tackle' : k === 'look' ? 'looks' : k; byKind[g] = (byKind[g] || 0) + l.cost; }
  console.log(`Where the clams go: ${Object.entries(byKind).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${pc(v / state.spent)}`).join(' · ')}\n`);
  title('5b. The pacing marks');
  table(['mark', 'clams/trip', 'min/trip', 'trips per purchase', 'bought', 'fishing', 'state', 'giants landed'], markRows.map((m) => [m.label, f0(m.clams), f1(m.min), f1(m.tpp), m.bought, NAME[m.water], m.state, f1(m.giants)]));
  title('5c. When each water opens');
  const at = (id) => log.find((l) => l.id === id);
  table(['water', 'map bought at', 'the best water to fish from', 'its legend landed at'], LOOP.waters.map((W) => [`${W.order}. ${W.name}`, W.order === 1 ? 'start' : `${at(`lake:${W.id}`).h.toFixed(1)} h`, firstFished[W.id] == null ? 'never' : `${firstFished[W.id].toFixed(1)} h`, `${at(`legend:${W.legend}`).h.toFixed(1)} h`]));
  check(LOOP.waters.every((W) => firstFished[W.id] != null), 'every water becomes the best water to fish for a while');
  const M = Object.fromEntries(markRows.map((m) => [m.label, m]));
  const longest = log.reduce((a, l) => (l.waited * l.min > a.w ? { w: l.waited * l.min, l } : a), { w: 0, l: null });
  console.log(`Longest wait for one purchase: ${f0(longest.w)} min (${longest.l.name}). Giants landed and kept by the last purchase: ${f1(giants)} (the first at about hour ${giantAt === null ? '—' : giantAt.toFixed(1)}); Elders: ${f1(elders)}.\n`);
  const within = (v, lo, hi) => v >= lo && v <= hi;
  check(at('hold:4').trips <= 2, `10 min: the first purchase (Hold 4) comes after trip ${at('hold:4').trips} (target ≤ 2)`);
  check(within(M['10 min'].bought, 2, 5), `10 min: ${M['10 min'].bought} purchases made (target 2–5)`);
  check(within(M['10 min'].clams, 40, 90), `10 min: ${f0(M['10 min'].clams)} clams per trip (target 40–90)`);
  check(within(M['1 h'].clams, 100, 240), `1 h: ${f0(M['1 h'].clams)} clams per trip (target 100–240)`);
  check(within(M['1 h'].tpp, 0.5, 2.6), `1 h: ${f1(M['1 h'].tpp)} trips per purchase (target 0.5–2.6)`);
  check(within(M['1 h'].bought, 11, 19), `1 h: ${M['1 h'].bought} purchases made (target 11–19)`);
  check(within(at('lake:sporewood').h, 1.2, 2.0), `the Sporewood map at ${at('lake:sporewood').h.toFixed(1)} h (target 1.2–2.0)`);
  check(within(M['5 h'].clams, 300, 900), `5 h: ${f0(M['5 h'].clams)} clams per trip (target 300–900)`);
  check(within(M['5 h'].tpp, 1.5, 5), `5 h: ${f1(M['5 h'].tpp)} trips per purchase (target 1.5–5)`);
  check(within(at('lake:glasswater').h, 4.0, 6.5), `the Glasswater map at ${at('lake:glasswater').h.toFixed(1)} h (target 4.0–6.5)`);
  check(within(at('lake:paleabyss').h, 8.5, 13), `the Pallid Deep map at ${at('lake:paleabyss').h.toFixed(1)} h (target 8.5–13)`);
  check(within(at('lake:rushlight_fen').h, 12, 18), `the first new water (Rushlight Fen) at ${at('lake:rushlight_fen').h.toFixed(1)} h (target 12–18)`);
  check(M['20 h'] && within(M['20 h'].tpp, 1.5, 7), `20 h: ${M['20 h'] ? f1(M['20 h'].tpp) : '—'} trips per purchase (target 1.5–7)`);
  check(M['20 h'] && within(M['20 h'].owned, 5, 8), `20 h: ${M['20 h'] ? M['20 h'].owned : '—'} waters owned (target 5–8)`);
  check(within(doneH, 40, 60), `the last purchase at ${doneH.toFixed(1)} h (target 40–60)`);
  check(giantAt !== null && within(giantAt, 0.4, 3), `the first giant comes home at about hour ${giantAt === null ? '—' : giantAt.toFixed(1)} (target 0.4–3)`);
  check(longest.w <= 90, `no purchase is more than 90 min away (longest ${f0(longest.w)} min)`);
  const sg = (v) => `${v >= 0 ? '+' : ''}${(v * 100).toFixed(1)}%`;
  table(['raft and hold', 'bought at', 'clams a minute', 'clams a trip', 'price in trips'], gains.map((x) => [x.name, `${x.h.toFixed(1)} h`, sg(x.g), sg(x.gt), x.trips.toFixed(1)]));
  // every step pays its way: +3% clams a minute when bought, or (a bigger evening, priced as a look) more clams a trip for at most 2 trips' income
  const bad = gains.filter((x) => !(x.g >= 0.03 || (x.g >= -0.03 && x.trips <= 2)));
  check(!bad.length, `every hold step and raft part raises clams a minute by at least 3% when bought, or is priced as a look (at most 2 trips' income, and no more than 3% a minute lost)${bad.length ? ': ' + bad.map((x) => `${x.name} ${sg(x.g)}/min, ${x.trips.toFixed(1)} trips`).join('; ') : ''}`);
  const lag = LOOP.waters.slice(1).map((W) => ({ W, d: (firstFished[W.id] ?? 99) - at(`lake:${W.id}`).h })).reduce((a, x) => (x.d > a.d ? x : a));
  check(lag.d <= 0.5, `a new water is the best water to fish within half an hour of buying its map (longest: ${lag.W.name}, ${(lag.d * 60).toFixed(0)} min)`);
  const longTrip = markRows.reduce((a, m) => Math.max(a, m.min), 0);
  check(longTrip <= 6, `trips stay short: at most ${f1(longTrip)} min per trip at the pacing marks, the visit home included (target ≤ 6)`);
  const mapShare = (byKind.maps || 0) / state.spent;
  check(within(mapShare, 0.5, 0.75), `maps are the big goals: ${pc(mapShare)} of all clams spent (target 50–75%)`);
}

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

console.log(failures.length ? `\n${failures.length} check(s) FAILED` : '\nall checks passed');
return failures.length ? 1 : 0;
}
if (IS_MAIN) process.exit(report());
