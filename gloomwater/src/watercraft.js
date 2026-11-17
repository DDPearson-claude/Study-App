// watercraft.js — the Mossmere's watercraft (docs/loop/WATERCRAFT.md revision 2, §2–§4 and §6; SPEC v8.7, M1 revision 8): where you
// cast decides who is there (ten open-water areas), what is on the hook decides who takes it (the hook table: a fish that will not take
// the hook is a stray, at most 1 cast in 100, whatever else the cast carries), and the one function the game draws a cast from
// (castOdds). Pure: no three.js and no import of data.js. The data module `D` is passed in where a rule needs it (placePool, giantShare,
// LOOP), so the node tests, the sim and the game call the same code.
//
//   WATERCRAFT.mossmere          geometry (§2.2), shares and factors (baked, §2.4), raw, night, tilts, hook (§3.2), take, waits,
//                                tells (§5.3), sight (§6)
//   lightOf(phase)               'day' | 'dusk' | 'night' (calm, day, dawn → day; dusk; gloomtide, night → night)
//   areaAt(x, z, probe, opts)    the area of an open-water point (§2.2's order), or null where it is not water
//   laneFor(evening, phase?)     this evening's wind lane {x, z, h, w, len, evening} (seeded), null at night
//   probeOf(world)               {depth(x, z), fromShore(x, z)} from a world's getDepth and getShoreRadius
//   areaShares(probe, opts)      offline: each area's share of open water by light (the test's recompute and --bake)
//   fitFactors(D, shares)        offline: the per-light, per-fish factors that keep the blind pre-hook mix the tilted target
//   areaWeight · tilt · gradeOf · takeChance · gradeTargets
//   hookWeights(list, o)         §4 steps 4–6 on a placePool list → [{sp, w, g}]
//   finishPool(entries, o)       §4 steps 10–11: the giant's share (LANE 4's giants' lure rule inside), then the strays' cap
//   castOdds(D, o)               §4 whole: {entries: [{sp, p, from, z?}], S, taper}; p sums to 1
//   drawOdds(odds, r)            one draw over castOdds' entries with r in [0, 1)
//   openMix(D, {light, …, rb})   the blind caster's open-water mix at one hour, with the rarity bonus (the sheet's Odds, SHEET.md §7.3)
//   bitesTable(D, {lure, bait})  the gear log's Who bites: each fish's share of the blind open-water bites over an evening, beside the bare hook's
//   gearCap(D, fishId, kit)      GEAR-GATES.md §4.1: the largest class this hook and line land of a fish ({cls, z, by}, or null: no cap)
//   noteTerms(D, notes, o)       LOST-TACKLE.md §4: the owned notebooks' boosts (hookWeights' `boost`) and guests (finishPool's `guests`)

const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const arr = (v) => (Array.isArray(v) ? v : []);
const LIGHTS = ['day', 'dusk', 'night'];
export const AREAS = ['margin', 'reeds', 'pads', 'stones', 'dropoff', 'lane', 'open', 'deep', 'inflow', 'outflow'];
/** The five hunters: never a bare hook past 1 in 100 (§3.3); Cut Strip is the right bait for the first three (the giants need a bought
 *  lure since GEAR-GATES.md §3). */
export const HUNTERS = ['reedjaw_pike', 'milkeye_perch', 'kissmark_trout', 'thousandcast_pike', 'hullkiss_lamprey'];
/** The hook's items, in the gear log's order (the bare hook first; the start kit's Bent Spoon, GEAR-GATES.md §2.1, last). */
export const HOOK_ITEMS = ['bare', 'mireworm', 'lumen_moss', 'cut_strip', 'feather_fly', 'glimmer_spoon', 'bone_jig', 'bell_spinner', 'bent_spoon', 'guard_button'];
export const LURE_IDS = ['feather_fly', 'glimmer_spoon', 'bone_jig', 'bell_spinner', 'bent_spoon', 'guard_button'];
export const BAIT_IDS = ['mireworm', 'lumen_moss', 'cut_strip'];

// the raw weights (§2.4), columns in AREAS' order: margin, reeds, pads, stones, dropoff, lane, open, deep, inflow, outflow
const RAW_ROWS = {
  dusk_minnow:     [2, 1.8, 1.8, 0.8, 0.5, 2, 1, 0.3, 1.5, 1],
  mossback_perch:  [0.8, 1.3, 1, 2.5, 2, 0.6, 0.6, 0.5, 1.2, 2],
  gutter_crayfish: [1.2, 0.6, 0.4, 3, 0.5, 0.2, 0.3, 0.2, 1.5, 1.5],
  likely_chub:     [1.3, 1.5, 1.2, 2, 0.4, 1.2, 0.5, 0.2, 2.5, 1.5],
  overbold_bass:   [1, 1.5, 1.5, 2.5, 1.5, 0.5, 0.5, 0.4, 1.2, 1.5],
  rustfin_sucker:  [1, 0.5, 0.4, 1.2, 0.6, 0.6, 1, 0.8, 3.5, 2.5],
  lampsipper:      [1.5, 1.5, 1.8, 0.8, 0.5, 2, 1, 0.4, 1, 0.8],
  weeping_carp:    [2, 2, 2, 0.4, 0.8, 1.8, 1, 0.8, 0.5, 0.5],
  candlefin_koi:   [1.5, 1.2, 3, 0.3, 0.3, 0.8, 0.6, 0.2, 0.5, 0.3],
  milkeye_perch:   [0.3, 0.4, 0.3, 1, 2.5, 0.8, 1.3, 2, 0.8, 1.5],
  kissmark_trout:  [0.2, 0.2, 0.1, 0.5, 2, 1.5, 1.2, 3, 2.5, 1],
  reedjaw_pike:    [0.8, 3, 2, 1.5, 1.5, 0.4, 0.4, 0.5, 0.5, 1.2],
};
const rowOf = (cells) => Object.fromEntries(AREAS.map((a, i) => [a, cells[i]]));

// the hook table (§3.2), columns: bare, mireworm, lumen_moss, cut_strip, feather_fly, glimmer_spoon, bone_jig, bell_spinner, bent_spoon,
// guard_button (LOST-TACKLE.md §3.2: the found Gate-Guard's Button, liked by all but the giants, the legend and the eel).
// Grades: 0 won't take it (a stray) · 1 takes it · 2 likes it · 3 the right bait · null not in the table
// (GEAR-GATES.md §2–§3, the user's ask of 17 Nov 2026: the Bent Spoon's column; the bare hook brings the seven commons only (carp, koi and
// the Bridgechain 1 → 0); both giants need a bought lure (their Cut Strip 3 → 0); the Spinner is the lamprey's right lure (2 → 3); the
// worm is the crayfish's right bait (2 → 3), so its top classes stay earnable under the size caps)
const HOOK_ROWS = {
  dusk_minnow:          [1, 3, 2, 0, 2, 0, 0, 0, 0, 2],
  mossback_perch:       [1, 3, 0, 2, 1, 2, 3, 2, 2, 2],
  gutter_crayfish:      [1, 3, 1, 3, 0, 0, 0, 0, 0, 2],
  likely_chub:          [1, 2, 2, 2, 3, 1, 1, 2, 1, 2],
  overbold_bass:        [1, 2, 0, 2, 2, 2, 3, 2, 2, 2],
  rustfin_sucker:       [1, 3, 1, 0, 0, 0, 0, 0, 0, 2],
  lampsipper:           [1, 1, 2, 0, 3, 0, 0, 0, 0, 2],
  weeping_carp:         [0, 2, 3, 0, 0, 0, 0, 0, 0, 2],
  candlefin_koi:        [0, 1, 3, 0, 1, 0, 0, 0, 0, 2],
  milkeye_perch:        [0, 1, 0, 3, 0, 2, 3, 1, 1, 2],
  kissmark_trout:       [0, 1, 0, 2, 2, 3, 2, 2, 1, 2],
  reedjaw_pike:         [0, 0, 0, 3, 0, 3, 2, 3, 0, 2],
  bridgechain_sturgeon: [0, 3, 0, 3, 0, 0, 0, 0, 0, 2],
  thousandcast_pike:    [0, 0, 0, 0, 0, 2, 2, 3, 0, 0],
  hullkiss_lamprey:     [0, 0, 0, 0, 0, 1, 0, 3, 0, 0],
  gloam_eel:            [null, 0, 3, 0, 0, 0, 0, 0, 0, 0],
  belled_matriarch:     [null, null, null, null, null, null, null, null, null, null],
};
// LOST-TACKLE.md §4.2, §5.1: the guests a found notebook brings from a later water, their rows apart from the water's own (gradeTargets
// and every "the Mossmere's fish" reader keep to HOOK_ROWS; gradeOf and gearCap read both). A guest graded 0 is absent, never a stray
const GUEST_ROWS = {
  rosefleck_trout:      [0, 1, 0, 2, 3, 2, 1, 1, 1, 2],
  rainglass_darter:     [0, 1, 0, 0, 3, 0, 0, 0, 0, 2],
  nightbloom_carp:      [0, 2, 3, 0, 0, 0, 1, 0, 0, 2],
};
/** The guests (LOST-TACKLE §4.2): fish of another water a found notebook brings in, each in one area and light as a fixed share. */
export const GUESTS = Object.freeze(Object.keys(GUEST_ROWS));
const hookRow = (cells) => Object.fromEntries(HOOK_ITEMS.map((id, i) => [id, cells[i]]));

export const WATERCRAFT = {
  mossmere: {
    // WATERCRAFT.mossmere.geometry — the Mossmere's areas (world metres; angles in degrees from +X toward +Z, as Math.atan2(z, x),
    // taken in [0, 360)). Revision 2: two reed arcs and one lily bed moved clear of the Lily Maze and dock 3 (measured, §14 B2).
    geometry: {
      inflow:  { x: 54, z: 4, r: 9 },                          // under the Sluice Veil (58, 4); the seam runs west from (56.5, 4)
      outflow: { x: 0, z: -49, r0: 4.5, r1: 11 },              // the Moss Sluice's lip, outside its stone ring
      rim:     { x: -4, z: -14, r0: 6, r1: 12 },               // the Bell Pool's drop-off, outside the place's 6 m disc
      lip:     { depth: [0.35, 0.45], shore: 14, island: 6 },  // the shelf's drop-off all round (tested after stones and reeds)
      beds: [                                                   // the lily beds (pads added by WC-3 in the pads' InstancedMesh)
        { x: -26, z: 34, r: 5 }, { x: 40, z: 28, r: 5 }, { x: -20, z: -50, r: 4.5 }, { x: -6, z: 52, r: 4.5 } ],
      reedArcs: [[100, 112], [120, 135], [232, 244], [318, 332]],   // shore reed beds, reedOff m off the shore
      reedOff: [0.5, 6],
      reedIslands: ['rock'], stoneIslands: ['tower', 'stair', 'roots'],
      stones: { pillar: 4, dock: 4, hull: 4, island: 3.5 },
      reedReach: { k: 1.35, plus: 1.5 },                        // a rock island's reeds: to k·r + plus from its centre
      margin: 0.35, deep: 0.75,
      lane: { w: 4, len: 50, within: 25, cx: 0, cz: -5, phases: ['day', 'dusk'] },   // laneFor(evening): a seeded point within 25 m of (0, −5) and a heading
    },
    // areaAt's order (first match wins; a point inside an owned, lifted place is that place, decided before areaAt is called):
    // inflow → outflow → rim (dropoff) → pads → stones → reeds → lip (dropoff) → margin → lane → deep → open
    // laneFor's centre keeps to deep or open water (WC-3's lane lies there): off the islands, their stones and their lip (ZONES[0].arena.
    // islands, r + 7), the Bell Pool and its rim (12 m + 2), the pillars and their stones (r + 5) and Under the Span's channel (its path,
    // 8 m wide: four discs of r 6); the test checks the copy against the arena. laneFallback: a deep point, if 24 tries all fall inside
    laneAvoid: [[22, -12, 15], [-30, 14, 13], [34, 20, 12], [-14, 28, 11], [-30, -24, 12], [-18, -34, 11], [-4, -14, 14],
      [-40, -4, 6.4], [-33, -1, 6.4], [-26, 2, 6.4], [-19, 5, 6.4], [12, -5, 6.2], [10, -18, 6.2], [30, -25, 6.2], [40, -20, 6.5], [-46, 22, 6.5], [8, 36, 6.2],
      [-40, -4, 6], [-33, -1, 6], [-26, 2, 6], [-19, 5, 6]],
    laneFallback: { x: 0, z: 10 },
    // >>> baked by `node tools/tests/watercraft.test.mjs --bake` (the layout of ZONES[0], data.loopMooring's hulls, 100 seeded evenings)
    shares: {
      day: { margin: 0.2417, reeds: 0.0621, pads: 0.0302, stones: 0.1339, dropoff: 0.1001, lane: 0.0147, open: 0.1955, deep: 0.1717, inflow: 0.0188, outflow: 0.0312 },
      dusk: { margin: 0.2417, reeds: 0.0621, pads: 0.0302, stones: 0.1339, dropoff: 0.1001, lane: 0.0147, open: 0.1955, deep: 0.1717, inflow: 0.0188, outflow: 0.0312 },
      night: { margin: 0.2417, reeds: 0.0621, pads: 0.0302, stones: 0.1339, dropoff: 0.1001, lane: 0, open: 0.1969, deep: 0.185, inflow: 0.0188, outflow: 0.0312 },
    },
    factors: {
      day: { candlefin_koi: 1.3645, dusk_minnow: 0.8354, gutter_crayfish: 0.8102, kissmark_trout: 0.5098, likely_chub: 1.2171, mossback_perch: 0.9629, overbold_bass: 1.0307, reedjaw_pike: 1.2823, rustfin_sucker: 0.9664, weeping_carp: 0.7213 },
      dusk: { candlefin_koi: 1.0955, dusk_minnow: 1.0452, gutter_crayfish: 1.0817, kissmark_trout: 0.6127, likely_chub: 1.1691, milkeye_perch: 0.5337, mossback_perch: 0.7759, overbold_bass: 1.0772, reedjaw_pike: 0.9461, rustfin_sucker: 0.7853, weeping_carp: 0.9104 },
      night: { dusk_minnow: 0.6185, gutter_crayfish: 1.6142, kissmark_trout: 0.4469, lampsipper: 0.8341, milkeye_perch: 0.6635, mossback_perch: 0.77, reedjaw_pike: 0.4911, rustfin_sucker: 0.7869, weeping_carp: 0.6535 },
    },
    // <<< baked
    raw: Object.fromEntries(Object.entries(RAW_ROWS).map(([id, c]) => [id, rowOf(c)])),
    night: { milkeye_perch: { margin: 2.5, deep: 1 }, gutter_crayfish: { margin: 1.8, stones: 4.5 } },   // after dark (gloomtide)
    tilts: {   // within a fish's built hour window; every other fish 1 (§2.4)
      gutter_crayfish: { day: 0.6, dusk: 1, night: 1.8 },
      weeping_carp: { day: 0.9, dusk: 1.4, night: 1 },
      dusk_minnow: { day: 0.9, dusk: 1.4, night: 0.8 },
      reedjaw_pike: { day: 1.2, dusk: 1.1, night: 0.6 },
      milkeye_perch: { dusk: 1, night: 1.3 },
      kissmark_trout: { day: 0.9, dusk: 1.3, night: 1 },
      likely_chub: { day: 1, dusk: 1.2 },
      overbold_bass: { day: 1, dusk: 1.3 },
    },
    hook: {
      table: Object.fromEntries(Object.entries(HOOK_ROWS).map(([id, c]) => [id, hookRow(c)])),
      guests: Object.fromEntries(Object.entries(GUEST_ROWS).map(([id, c]) => [id, hookRow(c)])),   // LOST-TACKLE §4.2
      mult: [0.1, 1, 1.6, 2.5],   // grade 0 ×0.1 (then capped) · 1 takes it · 2 likes it · 3 the right bait
      cap: 0.01,                  // a stray's weight: min(w, cap × S), S the takers' summed weight (the last word on the pool)
      spinner: ['thousandcast_pike', 'hullkiss_lamprey', 'reedjaw_pike'],   // LANE 4's giants list (LOOP.lures.bell_spinner.giants) when D is not passed
    },
    take: { rise: 1, swirl: 0.6, sight: 0.45, stray: 0.01 },
    waits: { rise: 0.5, tell: 0.65, sightTake: 0.3, spook: 1.5 },
    // the tells (§5.2–§5.3): areas, hours (late day / dusk / night), makers, the cast rule (m, s), the water's answer, the effect, caps
    tells: {
      rise: {
        hours: { day: 3, dusk: 3.2, night: 1.6 }, cap: 3, take: 'rise', waitMult: 0.5,
        forms: {
          sip: { makers: ['dusk_minnow', 'lampsipper', 'candlefin_koi', 'weeping_carp'], areas: ['margin', 'reeds', 'pads', 'lane', 'open', 'lily_maze'], within: 2.5, after: 3, respond: 'riseAgain' },
          splash: { makers: ['likely_chub', 'overbold_bass', 'kissmark_trout'], areas: ['stones', 'reeds', 'pads', 'inflow', 'outflow'], within: 3, after: 2, respond: 'slapAgain' },
          roll: { should: true, phases: ['dusk'], makers: ['weeping_carp', 'rustfin_sucker'], areas: ['margin', 'pads', 'open'], within: 2.5, after: 3, respond: 'riseAgain' },
        },
      },
      boil: {   // the swirl: Prize+ only (as built)
        hours: { day: 1.3, dusk: 1.6, night: 1.1 }, cap: 2, take: 'swirl', waitMult: 0.65, prizePlus: true,
        makers: ['reedjaw_pike', 'milkeye_perch', 'kissmark_trout', 'overbold_bass', 'weeping_carp', 'likely_chub'],
        areas: ['reeds', 'pads', 'stones', 'dropoff', 'deep', 'lily_maze', 'under_the_span', 'buoy_lights', 'bell_pool'], within: 3, after: 8, respond: 'bowWave',
      },
      nervous: {
        cap: 2, waitMult: 0.65, tilt: 3,
        forms: {
          ruffle: { hours: { day: 1.2, dusk: 1.4, night: 0.8 }, makers: { day: ['dusk_minnow'], dusk: ['dusk_minnow'], night: ['lampsipper'] },
            areas: ['margin', 'reeds', 'pads', 'lane', 'open'], edge: true, after: 10, spookInside: true, respond: 'ruffleDrift' },
          spray: { hours: { day: 1.8, dusk: 1.4, night: 0.4 }, makers: ['reedjaw_pike', 'milkeye_perch', 'overbold_bass', 'mossback_perch', 'kissmark_trout'],
            areas: ['margin', 'reeds', 'pads', 'lane', 'open', 'inflow', 'outflow', 'under_the_span'], minnowRaw: 1, ring: [0.55, 1.6], spookInside: true, favour: 0.3, respond: 'sprayAgain' },
        },
      },
      strike: { hours: { day: 1, dusk: 1.2, night: 0.8 }, cap: 1, waitMult: 0.65, tilt: 3, favour: 0.6, makers: ['reedjaw_pike', 'overbold_bass', 'milkeye_perch', 'mossback_perch'],
        areas: ['reeds', 'pads', 'stones', 'dropoff', 'outflow', 'under_the_span'], within: 4, after: 10, respond: 'bowWave' },
      bubbles: { hours: { day: 1.6, dusk: 1.2, night: 0.6 }, cap: 2, waitMult: 0.65, tilt: 3, favour: 0.2, makers: ['weeping_carp'],
        areas: ['margin', 'reeds', 'pads', 'lane', 'open', 'lily_maze'], head: 2, respond: 'fizzTurn' },
      pinprick: { hours: { day: 1.2, dusk: 1.4, night: 0 }, cap: 2, waitMult: 0.65, tilt: 3, favour: 0.2, makers: ['candlefin_koi'],
        areas: ['pads', 'lily_maze'], within: 1.5, respond: 'thicken' },
      cloud: { hours: { day: 1.2, dusk: 1, night: 0 }, cap: 2, waitMult: 0.65, tilt: 3, favour: 0.2, makers: ['weeping_carp', 'rustfin_sucker', 'bridgechain_sturgeon'],
        areas: ['margin', 'open', 'inflow', 'under_the_span'], edge: 2, after: 15, spookInside: true, respond: 'puff' },
      stems: { hours: { day: 1, dusk: 1.2, night: 0.3 }, cap: 2, waitMult: 0.65, tilt: 3, makers: ['weeping_carp', 'candlefin_koi'],
        areas: ['pads', 'reeds', 'lily_maze'], edge: 2.5, after: 8, spookInside: true, respond: 'knock' },
      gas: { hours: { day: 0.5, dusk: 0.4, night: 0.3 }, cap: 1, makers: [], areas: ['margin', 'open', 'deep'], noRule: true },   // the false tell
      glow: { retired: true },   // never spawned on the Mossmere under the loop (kept for the flag-off game)
      alive: { day: [2, 4], dusk: [2, 4], night: [2, 3], max: 6 },
    },
    // the silhouettes (§6)
    sight: {
      depth: 0.45, areas: ['margin', 'pads', 'inflow', 'stones', 'reeds', 'lily_maze'], never: ['deep', 'open', 'dropoff', 'lane', 'under_the_span'],
      count: { high: 4, medium: 4, low: 3 }, spawn: [12, 30], life: [40, 90],
      bands: [{ under: 25, d: [6, 12] }, { under: 60, d: [8, 20] }, { under: Infinity, d: [10, 28] }],   // cm → m off the raft (day and dusk)
      raft: [3, 5],
      lead: { moving: { from: [1, 1.6], to: [3, 2.5], side: 1.2 }, still: [0.8, 2] },   // ahead: from a + b·speed to c + d·speed along its heading
      settle: [0.5, 1.5],
      spook: { body: 0.6, splash: 2, quietR: 10, quietT: 30, wake: 1.2 },
      lantern: { r: 8, stub: 1.5, perLevel: 0.15, min: 0.25 },
      bodies: { deep: ['weeping_carp', 'candlefin_koi', 'rustfin_sucker'], torpedo: ['mossback_perch', 'overbold_bass', 'likely_chub', 'milkeye_perch'],
        long: ['reedjaw_pike'], shoal: ['dusk_minnow', 'lampsipper'], claw: ['gutter_crayfish'] },
      nightOnly: ['milkeye_perch', 'lampsipper', 'gutter_crayfish'],
      show: { deep: 1.5, long: 1.5 },   // weighted ×1.5 in the pick: they show better
      exclude: ['thousandcast_pike', 'hullkiss_lamprey', 'belled_matriarch', 'bridgechain_sturgeon', 'kissmark_trout', 'gloam_eel'],
      speed: { deep: [0.25, 0.45], torpedo: [0.4, 0.8], long: { still: 0.7, dart: 1.5, for: [1, 2] }, shoal: 0.5, claw: 0.1 },
      inRange: null,   // the fit's last knob (§8.4): at most this many silhouettes inside cast range (null: no limit)
    },
  },
};
const W = WATERCRAFT.mossmere;

// >>> LAKE 2, lane D1 (docs/loop/LAKE2.md §2.4, §5.5, §5.7, §9): Sporewood Pools' hook columns, its hook table, its raw area weights and
// the stubs the later lanes fill. Data only: every reader above keeps to the Mossmere's tables (W), so nothing the Mossmere draws moves;
// lane D2 threads the water through gradeOf, hookWeights, finishPool, castOdds and gearCap (HOOK_ITEMS_AT, WATERCRAFT[water]).
/** Sporewood's hook columns (§2.4), in the gear log's order: its own baits and lures, Cut Strip (the one hook of every water, §5.7), the
 *  free Seedpod Twirl, and the found Gate-Guard's Button last (its column made from `hook.button`'s rule, never authored). */
const SW_HOOK_ITEMS = ['bare', 'spore_cake', 'amber_larvae', 'cut_strip', 'spore_moth', 'ember_minnow', 'root_jig', 'sporelamp_fly', 'seedpod_twirl', 'guard_button'];
const SW_LURE_IDS = ['spore_moth', 'ember_minnow', 'root_jig', 'sporelamp_fly', 'seedpod_twirl', 'guard_button'];
const SW_BAIT_IDS = ['spore_cake', 'amber_larvae', 'cut_strip'];
/** Each water's hook columns, lures and baits (the Mossmere's are the exports above). */
export const HOOK_ITEMS_AT = Object.freeze({ mossmere: HOOK_ITEMS, sporewood: SW_HOOK_ITEMS });
export const LURE_IDS_AT = Object.freeze({ mossmere: LURE_IDS, sporewood: SW_LURE_IDS });
export const BAIT_IDS_AT = Object.freeze({ mossmere: BAIT_IDS, sporewood: SW_BAIT_IDS });
// the raw weights (§2.4), columns in AREAS' order (`stones` is shown as "the roots" here: root snags, cap stumps, the Tongue, Rootknot;
// `lane` is the drifting line of spores across the open water at dusk): margin, reeds, pads, stones, dropoff, lane, open, deep, inflow, outflow
const SW_RAW_ROWS = {
  netcloud_fry:       [2, 1.5, 1.8, 0.6, 0.4, 2.2, 1.2, 0.3, 1.5, 1],
  falsesmile_barb:    [1.5, 1.2, 2.5, 1, 0.5, 1.5, 0.8, 0.3, 2, 1],
  capshell_crayfish:  [1.2, 0.6, 0.5, 3, 0.6, 0.2, 0.3, 0.2, 1.2, 1.8],
  threadling_eel:     [2.2, 2, 1, 2, 0.4, 0.2, 0.3, 0.3, 0.8, 1],
  cindertail_catfish: [0.6, 0.8, 0.6, 2.2, 2, 0.6, 1, 1.2, 1, 2],
  velvet_ray:         [1.8, 0.4, 0.8, 0.6, 1.2, 0.6, 1.6, 0.8, 0.6, 0.8],
  lostsea_mackerel:   [0.2, 0.2, 0.2, 0.4, 1.5, 2.5, 2.2, 1.6, 1, 0.8],
  downcast_catfish:   [0.3, 0.3, 0.3, 0.8, 2.2, 0.6, 1.2, 3, 0.6, 1],
  mildew_angler:      [0.6, 0.8, 1.2, 2.5, 1.2, 0.2, 0.4, 1.2, 0.4, 0.6],
};
// the hook table (§2.4), the nine authored columns: bare, spore_cake, amber_larvae, cut_strip, spore_moth, ember_minnow, root_jig,
// sporelamp_fly, seedpod_twirl. Grades as the Mossmere's (0 a stray · 1 takes it · 2 likes it · 3 the right bait · null the legend's).
// The bare hook brings the three commons alone; the hunter (the Lostsea Mackerel) never takes the bare hook or the free Twirl; both
// giants need a bought lure; the Threadling takes Spore Cake only and the Sleepspore Jelly Amber Larvae only
const SW_HOOK_ROWS = {
  netcloud_fry:       [1, 2, 1, 0, 3, 0, 0, 0, 1],
  falsesmile_barb:    [1, 3, 1, 0, 2, 0, 1, 0, 1],
  capshell_crayfish:  [1, 3, 1, 2, 0, 0, 2, 0, 0],
  threadling_eel:     [0, 3, 0, 0, 0, 0, 0, 0, 0],
  velvet_ray:         [0, 2, 1, 2, 0, 0, 3, 0, 0],
  cindertail_catfish: [0, 1, 0, 3, 0, 3, 2, 1, 0],
  lostsea_mackerel:   [0, 0, 0, 2, 1, 3, 0, 2, 0],
  downcast_catfish:   [0, 3, 1, 1, 0, 0, 2, 2, 0],
  mildew_angler:      [0, 1, 3, 2, 0, 1, 0, 0, 0],
  sleepspore_jelly:   [0, 0, 3, 0, 0, 0, 0, 0, 0],
  nightbloom_carp:    [0, 2, 3, 0, 0, 0, 1, 2, 0],
  harpstring_eel:     [0, 0, 0, 0, 0, 2, 1, 3, 0],
  festival_puffer:    [0, 0, 0, 0, 0, 1, 2, 3, 0],
  drifting_grove:     [null, null, null, null, null, null, null, null, null],
};
/** The found Gate-Guard's Button at Sporewood (§2.4, LOST-TACKLE §3.2's rule at every water): grade 2 for every fish but the giants, the
 *  legend and the two bait-only fish (0: never a stray past 1 in 100; null for the legend, whose row is all null). */
const SW_BUTTON = Object.freeze({ grade: 2, not: Object.freeze(['harpstring_eel', 'festival_puffer', 'threadling_eel', 'sleepspore_jelly']) });
const swHookRow = (id, cells) => {
  const row = Object.fromEntries(SW_HOOK_ITEMS.slice(0, cells.length).map((it, i) => [it, cells[i]]));
  row.guard_button = cells.every((g) => g === null) ? null : SW_BUTTON.not.includes(id) ? 0 : SW_BUTTON.grade;
  return row;
};
WATERCRAFT.sporewood = {
  hookItems: SW_HOOK_ITEMS,
  // the areas' geometry, their baked shares and the factors that keep the blind mix tilted (§2.4): lane W1 authors the geometry on the
  // outline shore (LAKE2.md §3.1) and `watercraft.test.mjs --bake` bakes the rest on Sporewood's layout, as for the Mossmere
  // (lane W1 authored the geometry, below; the shares and the factors wait for the water's threading through laneFor, areaShares and
  // fitFactors: the integration gate's bake)
  geometry: null, shares: null, factors: null, laneAvoid: [], laneFallback: null,
  raw: Object.fromEntries(Object.entries(SW_RAW_ROWS).map(([id, c]) => [id, rowOf(c)])),
  night: {}, tilts: {},
  hook: {
    table: Object.fromEntries(Object.entries(SW_HOOK_ROWS).map(([id, c]) => [id, swHookRow(id, c)])),
    guests: {},
    mult: W.hook.mult.slice(), cap: W.hook.cap,   // the user's 1% stray rule, as at the Mossmere
    button: SW_BUTTON,
    giants: ['harpstring_eel', 'festival_puffer'],   // the giants' lure's fish (LOOP.lures.sporelamp_fly.giants) when D is not passed
  },
  take: { ...W.take }, waits: { ...W.waits },
  // the tells (WATERCRAFT §5: sip for the Fry and the Barb, splash for the Mackerel and the Cindertail, roll for the Downcast at dusk, the
  // bow wave for the giants) and the silhouettes are the watercraft lanes' to author with Sporewood's makers
  tells: null, sight: null,
};
// <<< LAKE 2, lane D1
// >>> LAKE 2, lane W1 (LAKE2.md §1A, §3.1): Sporewood's areas on its outline shore (world metres; the reed beds are runs of the shore
// curve, [u0, u1] in its control points, SPOREWOOD_ARENA.outline's: the Reed Flats from the Veil inlet's mouth to the neck's south bank,
// Lily Cove's head, the East Pool's south bank west of Rootfoot). The inflow under the Seep's fall, the outflow drawn to the Root Weir
// on the Reed Flats, the drop-off round the Mother's Cup, the lily rafts in the Reed Flats' shallows and the inlet's mouth; reeds round
// the Tussock and the Two Stools, roots and stumps round Rootknot, the Mother's Foot and Mossback Isle (the 'stones' kind)
WATERCRAFT.sporewood.geometry = {
  inflow:  { x: 74.5, z: -24, r: 8 },
  outflow: { x: -66, z: 37, r0: 0, r1: 8 },
  rim:     { x: 48, z: 6, r0: 6, r1: 10 },
  lip:     { depth: [0.35, 0.45], shore: 14, island: 6 },
  beds: [{ x: -54, z: 32, r: 4.5 }, { x: -40, z: 34.5, r: 4 }, { x: -76.5, z: 34, r: 3.5 }],
  reedRuns: [[20.4, 24.6], [5.2, 6.4], [29.1, 30.4]], reedOff: [0.5, 6],
  reedIslands: ['tussock', 'stool'], stoneIslands: ['roots', 'cap', 'moss'],
  stones: { pillar: 4, dock: 4, hull: 4, island: 3.5 },
  reedReach: { k: 1.35, plus: 1.5 },
  margin: 0.35, deep: 0.75,
  lane: { w: 4, len: 40, within: 14, cx: -40, cz: 10, phases: ['day', 'dusk'] },   // the dusk's drifting line of spores, the West Pool's open water
};
WATERCRAFT.sporewood.laneAvoid = [[-50, -6, 13], [-28, 14, 9.5], [-24, 19.5, 8.5], [-62, 22, 8.5], [0, 6.5, 10]];
WATERCRAFT.sporewood.laneFallback = { x: -38, z: 12 };
// <<< LAKE 2, lane W1

/** A game phase (calm, day, dawn, dusk, gloomtide, night) as the light the tables are keyed by. */
export function lightOf(phase) {
  if (phase === 'dusk') return 'dusk';
  if (phase === 'gloomtide' || phase === 'night') return 'night';
  return 'day';
}

// ---------------------------------------------------------------- the areas (§2.1–§2.2)
const hyp = Math.hypot;
const ptOf = (d) => ({ x: num(d?.position?.x ?? d?.x, NaN), z: num(d?.position?.z ?? d?.z, NaN) });
/** A dock's stone points: the dock and its two mooring posts (world-layout's rule: lateral to the barge, from the dock's yaw). */
function dockPts(d) {
  const p = ptOf(d), yaw = Number(d?.yaw);
  if (!Number.isFinite(p.x) || !Number.isFinite(p.z)) return [];
  if (!Number.isFinite(yaw)) return [p];
  const fx = -Math.sin(yaw), fz = -Math.cos(yaw), lx = -fz, lz = fx;
  return [{ x: p.x + lx * 3.1 - fx * 1.2, z: p.z + lz * 3.1 - fz * 1.2 }, { x: p.x + lx * 3.0 + fx * 1.6, z: p.z + lz * 3.0 + fz * 1.6 }];
}
const degOf = (x, z) => { const a = Math.atan2(z, x) * 180 / Math.PI; return a < 0 ? a + 360 : a; };
/** A world's probe: {depth(x, z), fromShore(x, z)} (getDepth; the world's getFromShore when it has one (LAKE2 §3.1: an outline shore's
 *  field, the islands in it), else getShoreRadius(angle) − the distance from the centre, the same figure on a polar shore). */
export function probeOf(world) {
  const fs = typeof world?.getFromShore === 'function' ? world.getFromShore : null;
  return {
    depth: (x, z) => num(world?.getDepth?.(x, z), 0),
    fromShore: fs ? (x, z) => num(fs(x, z), 0) : (x, z) => num(world?.getShoreRadius?.(Math.atan2(z, x)), 0) - hyp(x, z),
    // (an outline shore's reed runs are spans of its curve: where along it the nearest shore point lies, or null on a polar shore)
    along: (x, z) => { const u = world?.getShoreAlong?.(x, z); return Number.isFinite(u) ? u : null; },
  };
}
/** Is (x, z) inside this lane's strip? */
export function inLane(lane, x, z) {
  if (!lane) return false;
  const dx = x - lane.x, dz = z - lane.z, c = Math.cos(lane.h), s = Math.sin(lane.h);
  return Math.abs(dx * c + dz * s) <= lane.len / 2 && Math.abs(-dx * s + dz * c) <= lane.w / 2;
}
/**
 * The area of an open-water point, in §2.2's order: 'inflow' · 'outflow' · 'dropoff' (the Bell Pool's rim) · 'pads' · 'stones' · 'reeds'
 * · 'dropoff' (the shelf's lip) · 'margin' · 'lane' · 'deep' · 'open'; null where the point is not water (past the shore, inside an
 * island). A place is decided before this is called. probe = {depth(x, z), fromShore(x, z)}; opts = {lane (laneFor's, or null), arena
 * (ZONES[0].arena: islands, pillars, docks, gate), hulls (data.loopMooring's circles), docks ([{x, z}] or [{position}]: the world's, else
 * the arena's)}.
 */
export function areaAt(x, z, probe, { lane = null, arena = null, hulls = null, docks = null, geo = null } = {}) {
  const G = geo || W.geometry, A = arena || {};   // (geo: another water's geometry, WATERCRAFT[water].geometry; the Mossmere's by default)
  if (!Number.isFinite(x) || !Number.isFinite(z)) return null;
  const fromShore = num(probe?.fromShore?.(x, z), NaN);
  if (!(fromShore > 0)) return null;
  const isl = arr(A.islands);
  for (const o of isl) if (hyp(x - o.x, z - o.z) < num(o.r)) return null;
  const depth = num(probe?.depth?.(x, z), 0);
  if (hyp(x - G.inflow.x, z - G.inflow.z) <= G.inflow.r) return 'inflow';
  const gate = A.gate && Number.isFinite(A.gate.x) ? A.gate : G.outflow;
  { const d = hyp(x - gate.x, z - gate.z); if (d >= G.outflow.r0 && d <= G.outflow.r1) return 'outflow'; }
  { const d = hyp(x - G.rim.x, z - G.rim.z); if (d >= G.rim.r0 && d <= G.rim.r1) return 'dropoff'; }
  for (const b of G.beds) if (hyp(x - b.x, z - b.z) <= b.r) return 'pads';
  const St = G.stones;
  for (const p of arr(A.pillars)) if (hyp(x - p.x, z - p.z) <= num(p.r) + St.pillar) return 'stones';
  for (const d of arr(docks || A.docks)) for (const q of dockPts(d)) if (hyp(x - q.x, z - q.z) <= St.dock) return 'stones';
  for (const c of arr(hulls)) if (hyp(x - c.x, z - c.z) <= num(c.r) + St.hull) return 'stones';
  for (const o of isl) if (G.stoneIslands.includes(o.kind) && hyp(x - o.x, z - o.z) - num(o.r) <= St.island) return 'stones';
  for (const o of isl) {
    if (!G.reedIslands.includes(o.kind)) continue;
    const d = hyp(x - o.x, z - o.z);
    if (d >= num(o.r) && d <= G.reedReach.k * num(o.r) + G.reedReach.plus) return 'reeds';
  }
  if (fromShore >= G.reedOff[0] && fromShore <= G.reedOff[1]) {
    // (LAKE2 §3.1: an outline shore's reed beds are runs along its curve, [u0, u1] in its control points; a polar one's arcs of bearing)
    if (G.reedRuns) { const u = probe?.along?.(x, z); if (Number.isFinite(u) && G.reedRuns.some(([u0, u1]) => u >= u0 && u <= u1)) return 'reeds'; }
    else { const a = degOf(x, z); for (const [a0, a1] of G.reedArcs) if (a >= a0 && a <= a1) return 'reeds'; }
  }
  if (depth >= G.lip.depth[0] && depth <= G.lip.depth[1]) {
    if (fromShore <= G.lip.shore) return 'dropoff';
    for (const o of isl) if (hyp(x - o.x, z - o.z) - num(o.r) <= G.lip.island) return 'dropoff';
  }
  if (depth < G.margin) return 'margin';
  if (lane && inLane(lane, x, z)) return 'lane';
  if (depth >= G.deep) return 'deep';
  return 'open';
}
const hash01 = (n, k) => {
  let t = (Math.imul((n | 0) + 0x632be5ab, 0x9e3779b1) ^ Math.imul(k + 0x2545f491, 0x85ebca77)) >>> 0;
  t ^= t >>> 16; t = Math.imul(t, 0x7feb352d) >>> 0; t ^= t >>> 15; t = Math.imul(t, 0x846ca68b) >>> 0; t ^= t >>> 16;
  return (t >>> 0) / 4294967296;
};
/** This evening's wind lane (§2.1, §5.4): seeded by the evening's number, deterministic; a centre within 25 m of (0, −5), clear of the
 *  islands and the Bell Pool, a heading in [0, π), the strip 4 × 50 m. null at night (a phase whose light is night). */
export function laneFor(evening, phase = null) {
  const Lg = W.geometry.lane;
  if (phase != null && !Lg.phases.includes(lightOf(phase))) return null;
  const e = Math.trunc(num(evening, 1));
  let x = W.laneFallback.x, z = W.laneFallback.z, h = Math.PI * hash01(e, 999);
  for (let k = 0; k < 24; k++) {
    const r = Lg.within * Math.sqrt(hash01(e, 3 * k)), a = 2 * Math.PI * hash01(e, 3 * k + 1);
    const cx = Lg.cx + r * Math.cos(a), cz = Lg.cz + r * Math.sin(a);
    if (W.laneAvoid.some(([ax, az, ar]) => hyp(cx - ax, cz - az) < ar)) continue;
    x = cx; z = cz; h = Math.PI * hash01(e, 3 * k + 2); break;
  }
  return { x: Math.round(x * 100) / 100, z: Math.round(z * 100) / 100, h: Math.round(h * 1e4) / 1e4, w: Lg.w, len: Lg.len, evening: e };
}

/**
 * Offline (the test's recompute and --bake): each area's share of open water, by light. A grid of `step` m over water outside the islands
 * (r × 1.08 + 0.2, the obstacle), the pillars, the hulls and the places (`inPlace(x, z)`); the wind lane at its mean over `evenings`
 * seeded evenings (day and dusk; none at night). opts: areaAt's {arena, hulls, docks}, plus inPlace, step (1), evenings (100), R (62).
 * → {day: {area: share}, dusk: {…}, night: {…}} (each sums to 1).
 */
export function areaShares(probe, { arena = null, hulls = null, docks = null, inPlace = null, step = 1, evenings = 100, R = 62 } = {}) {
  const A = arena || {}, pts = [];
  const counts = Object.fromEntries(AREAS.map((a) => [a, 0]));
  let n = 0;
  for (let x = -R; x <= R; x += step) for (let z = -R; z <= R; z += step) {
    if (!(num(probe.fromShore(x, z), 0) > 0)) continue;
    if (arr(A.islands).some((o) => hyp(x - o.x, z - o.z) < o.r * 1.08 + 0.2)) continue;
    if (arr(A.pillars).some((p) => hyp(x - p.x, z - p.z) < p.r)) continue;
    if (arr(hulls).some((c) => hyp(x - c.x, z - c.z) < c.r)) continue;
    if (inPlace && inPlace(x, z)) continue;
    const a = areaAt(x, z, probe, { lane: null, arena, hulls, docks });
    if (!a) continue;
    n++; counts[a]++;
    if (a === 'deep' || a === 'open') pts.push([x, z, a]);   // the lane is tested after the margin: only these can become lane
  }
  const night = Object.fromEntries(AREAS.map((a) => [a, n ? counts[a] / n : 0]));
  const lit = { ...night };
  if (evenings > 0 && n) {
    let inL = 0, fromDeep = 0, fromOpen = 0;
    for (let e = 1; e <= evenings; e++) {
      const L = laneFor(e);
      for (const [x, z, a] of pts) if (inLane(L, x, z)) { inL++; if (a === 'deep') fromDeep++; else fromOpen++; }
    }
    lit.lane = inL / evenings / n; lit.deep = (counts.deep - fromDeep / evenings) / n; lit.open = (counts.open - fromOpen / evenings) / n;
  }
  const r4 = (o) => Object.fromEntries(AREAS.map((a) => [a, Math.round(o[a] * 1e4) / 1e4]));
  return { day: r4(lit), dusk: r4(lit), night: r4(night), n };
}

/** The raw weight of a fish in an area by light (the night rows after dark); 1 for a fish with no row or an unknown area. */
export function rawWeight(fishId, area, phase) {
  const row = W.raw[fishId];
  if (!row || !(area in row)) return 1;
  const nt = lightOf(phase) === 'night' ? W.night[fishId] : null;
  return num(nt && area in nt ? nt[area] : row[area], 1);
}
/** The hour tilt of a fish in a phase (§2.4; 1 outside the table). */
export function tilt(fishId, phase) { return num(W.tilts[fishId]?.[lightOf(phase)], 1); }
/** A fish's open-water weight in an area: the baked factor (the hour tilt inside it) × its raw weight; 1 for a fish with no row. */
export function areaWeight(fishId, area, phase) {
  if (!W.raw[fishId]) return 1;
  return num(W.factors[lightOf(phase)]?.[fishId], tilt(fishId, phase)) * rawWeight(fishId, area, phase);
}

/** The open-water pool of a light on the bare hook (the fit's and the blind mix's), data.placePool on the game's records. */
function openPool(D, light, bait = null) {
  return D.placePool(arr(D.SPECIES), { placeId: null, phase: light, bait, water: 'mossmere' });
}
/** The blind caster's pre-hook mix in a light under these factors: {id: share}. */
export function blindMix(D, shares, light, factors = W.factors[light], bait = null) {
  const pool = openPool(D, light, bait), out = {};
  for (const a of AREAS) {
    const s = num(shares?.[light]?.[a], 0); if (!(s > 0)) continue;
    let tot = 0; const ws = pool.list.map(([sp, w0]) => { const w = num(w0) * (W.raw[sp.id] ? num(factors?.[sp.id], 1) * rawWeight(sp.id, a, light) : 1); tot += w; return [sp.id, w]; });
    for (const [id, w] of ws) out[id] = (out[id] || 0) + s * w / tot;
  }
  return out;
}
/** The tilted target of a light: the built open-water mix × each fish's hour tilt, renormalised. */
export function tiltedTarget(D, light, bait = null) {
  const pool = openPool(D, light, bait); let tot = 0;
  const ws = pool.list.map(([sp, w0]) => { const w = num(w0) * tilt(sp.id, light); tot += w; return [sp.id, w]; });
  return Object.fromEntries(ws.map(([id, w]) => [id, w / tot]));
}
/** Offline: the per-light, per-fish factors (60 rounds of f ← f × target / blind), scaled so the blind caster's mean total weight is the
 *  built pool's. → {day: {id: f}, dusk: {…}, night: {…}} for every open-water fish with a raw row. */
export function fitFactors(D, shares, rounds = 60) {
  const out = {};
  for (const light of LIGHTS) {
    const pool = openPool(D, light), tgt = tiltedTarget(D, light), f = {};
    for (const [sp] of pool.list) if (W.raw[sp.id]) f[sp.id] = tilt(sp.id, light);
    for (let i = 0; i < rounds; i++) {
      const b = blindMix(D, shares, light, f);
      for (const id of Object.keys(f)) if (b[id] > 0) f[id] *= tgt[id] / b[id];
    }
    // scale: the blind caster's mean total weight equals the built pool's (so a pool's size is as built)
    let mean = 0, base = 0;
    for (const [sp, w0] of pool.list) base += num(w0);
    for (const a of AREAS) {
      const s = num(shares?.[light]?.[a], 0); if (!(s > 0)) continue;
      mean += s * pool.list.reduce((acc, [sp, w0]) => acc + num(w0) * (W.raw[sp.id] ? f[sp.id] * rawWeight(sp.id, a, light) : 1), 0);
    }
    const k = mean > 0 ? base / mean : 1;
    out[light] = Object.fromEntries(Object.keys(f).sort().map((id) => [id, Math.round(f[id] * k * 1e4) / 1e4]));
  }
  return out;
}

// ---------------------------------------------------------------- the hook (§3)
/** A legend's bait id on the line is a bare hook to every fish but her (as built): the table's ids, else 'bare'. */
const baitCol = (row, bait) => (bait && bait !== 'bare' && Object.prototype.hasOwnProperty.call(row, bait) ? bait : 'bare');
/**
 * A fish's grade on this hook (§3.3–§3.4): one thing on the hook (the user, 17 Nov 2026: bait or a lure, never both, no tipping): a lure →
 * the lure's column alone; else the bait's (none: the bare hook's). undefined for a species with no row (the caller keeps the built family
 * rule); null where the table has null (the legend; the eel's bare cell).
 */
export function gradeOf(fishId, { lure = null, bait = null } = {}) {
  const row = W.hook.table[fishId] || W.hook.guests[fishId];
  if (!row) return undefined;
  if (lure && lure !== 'bare' && Object.prototype.hasOwnProperty.call(row, lure)) return row[lure];
  return row[baitCol(row, bait)];
}
const taker = (g) => g !== 0;   // grade ≥ 1, or no row (the built rule), or null
/** A pre-rolled fish's take (§3.6): grade 0 → 0.01; 1 → base; 2 → max(base, min(0.9, base + 0.1)); 3 → max(base, min(0.9, base + 0.2));
 *  no grade (no row) → base. */
export function takeChance(base, g) {
  const b = num(base, 1);
  if (g === 0) return W.take.stray;
  if (g === 2) return Math.max(b, Math.min(0.9, b + 0.1));
  if (g === 3) return Math.max(b, Math.min(0.9, b + 0.2));
  return b;
}
/** The fish an item helps (§3.7): every fish it alone grades 2 or 3, in the table's order; the Harbour-Bell Spinner keeps LANE 4's named
 *  list (D.LOOP.lures.bell_spinner.giants when D is given). */
export function gradeTargets(itemId, D = null) {
  if (itemId === 'bell_spinner') return arr(D?.LOOP?.lures?.bell_spinner?.giants).length ? D.LOOP.lures.bell_spinner.giants.slice() : W.hook.spinner.slice();
  const o = LURE_IDS.includes(itemId) ? { lure: itemId } : { bait: itemId };
  return Object.keys(W.hook.table).filter((id) => { const g = gradeOf(id, o); return g === 2 || g === 3; });
}

/**
 * §4 steps 4–6 on a placePool list ([[sp, w0], …]): in open water (no place) × the area's weight (factor × raw; a fish with no row 1;
 * no area: the hour tilt alone); in a place × the hour tilt; then × hook.mult[grade] (hook: false stops before the hook: "who is there").
 * → [{sp, w, g}] (g undefined for a species with no row, or with hook false).
 */
export function hookWeights(list, { area = null, place = null, phase = 'calm', lure = null, bait = null, hook = true, boost = null } = {}) {
  const M = W.hook.mult;
  return arr(list).map((it) => {
    const sp = Array.isArray(it) ? it[0] : it.sp, w0 = Array.isArray(it) ? it[1] : it.w, id = sp?.id;
    let w = num(w0);
    w *= !place && area ? areaWeight(id, area, phase) : tilt(id, phase);
    if (boost && id && boost[id] > 0) w *= boost[id];   // LOST-TACKLE §4.1: a notebook's fish, where it already lives (0 stays 0)
    const g = hook ? gradeOf(id, { lure, bait }) : undefined;
    if (hook && g != null) w *= M[g];
    return { sp, w, g };
  });
}
/** The takers' summed weight (grade ≥ 1, or no row) of a pool's entries. */
export function takersSum(entries) { return arr(entries).reduce((a, e) => a + (taker(e.g) ? num(e.w) : 0), 0); }
/**
 * §4 steps 10–11. The giant's share is drawn last from the rest (placePool's {sp, share}): its base share in or off its hour, ×LOOP.lures
 * [lure].share (1.5) with a giants' lure that names it, Taper ×giantShare under giantCap (LANE 4's lurePool rule, moved here); a giant
 * graded 0 ×0.1. Then a notebook's guests (LOST-TACKLE §4.2): each {sp, share} a fixed share of the cast, × [0, 0.5, 1, 1.5][its grade]
 * (grade 0: absent, never a stray), the rest scaled by 1 − p. Then the strays' cap: every grade-0 entry, the giant included, min(w, cap ×
 * S), S the takers' summed weight. opts {giant, lure, bait, phase, wickId, D, guests}. → a fresh entries array (the giant, then each guest
 * marked guest: true).
 */
export function finishPool(entries, { giant = null, lure = null, bait = null, phase = 'calm', wickId = null, D = null, guests = null } = {}) {
  const out = arr(entries).map((e) => ({ ...e }));
  const rest = out.reduce((a, e) => a + num(e.w), 0);
  if (giant?.sp && rest > 0) {
    const L = lure ? D?.LOOP?.lures?.[lure] : null, named = arr(L?.giants).includes(giant.sp.id), gl = named ? num(L.share, 1.5) : 1;
    const K = D?.LOOP?.wicks?.[typeof D?.loopWickId === 'function' ? D.loopWickId(wickId) : wickId];
    let share;
    if (typeof D?.giantShare === 'function') {   // its base share in or off its hour; Taper's ×giantShare under giantCap
      const base = D.giantShare(giant.sp, phase, null);
      share = K?.giantShare ? Math.min(num(K.giantCap, 1), base * gl * K.giantShare) : base * gl;
    } else share = Math.min(0.99, num(giant.share, 0) * gl);   // (no data module: placePool's share as given)
    const g = gradeOf(giant.sp.id, { lure, bait });
    let w = share > 0 && share < 1 ? rest * share / (1 - share) : 0;
    if (g === 0) w *= W.hook.mult[0];
    out.push({ sp: giant.sp, w, g, giant: true });
  }
  for (const q of arr(guests)) {
    if (!q?.sp || out.some((e) => e.sp?.id === q.sp.id)) continue;
    const g = gradeOf(q.sp.id, { lure, bait }), p = num(q.share, 0) * (GUEST_F[g] ?? 0), all = out.reduce((a, e) => a + num(e.w), 0);
    if (p > 0 && p < 1 && all > 0) out.push({ sp: q.sp, w: all * p / (1 - p), g, guest: true });
  }
  const S = takersSum(out), cap = W.hook.cap * S;
  for (const e of out) if (e.g === 0) e.w = Math.min(num(e.w), cap);
  return out;
}

/** A guest's share by its grade on the hook (LOST-TACKLE §4.2: the giants' factor; grade 0 never bites). */
const GUEST_F = [0, 0.5, 1, 1.5];
/**
 * A found notebook's terms on one cast (LOST-TACKLE §4; pure): `notes` the owned notebook ids (or one id), read from D.LOOP.lostTackle.
 * → {boost: {fishId: ×} (each notebook's, multiplied) | null, guests: [{sp, share}] (each guest whose area and light this cast is in, in
 * open water only: a place has its own pool; sp from D.SPECIES_BY_ID or D.SPECIES)}.
 */
export function noteTerms(D, notes, { area = null, place = null, phase = 'calm' } = {}) {
  const ids = typeof notes === 'string' ? [notes] : arr(notes), LT = D?.LOOP?.lostTackle || {}, light = lightOf(phase);
  let boost = null; const guests = [];
  for (const id of ids) {
    const n = LT[id];
    if (!n || n.slot !== 'notebook') continue;
    for (const [f, x] of Object.entries(n.boost || {})) if (num(x, 0) > 0) { boost = boost || {}; boost[f] = num(boost[f], 1) * num(x); }
    const q = n.guest;
    if (q && !place && arr(q.areas).includes(area) && arr(q.lights).includes(light)) {
      const sp = D?.SPECIES_BY_ID?.[q.id] || arr(D?.SPECIES).find((x) => x?.id === q.id) || null;
      if (sp && !guests.some((x) => x.sp.id === sp.id)) guests.push({ sp, share: num(q.share, 0) });
    }
  }
  return { boost, guests };
}

/** The built sign rule (AUTOFISH.signRule: ≥ minSpecies kinds, none above maxShare) on [id, w] pairs. */
function signRuleOk(pairs, SR) {
  const by = new Map(); let tot = 0;
  for (const [id, w] of pairs) { if (!(w > 0)) continue; by.set(id, (by.get(id) || 0) + w); tot += w; }
  if (!tot || by.size < num(SR?.minSpecies, 2)) return false;
  return Math.max(...by.values()) / tot <= num(SR?.maxShare, 0.8) + 1e-12;
}
/** Is the Wick Taper (long_reach)? */
const isTaper = (D, wickId) => D?.LOOP?.wicks?.[typeof D?.loopWickId === 'function' ? D.loopWickId(wickId) : wickId]?.passive === 'long_reach';
/** Taper's first bite judged on the takers (§4 step 9): the commons zeroed where ≥ 2 taker kinds that are not commons remain and none is
 *  above 80%. → the weights (a new array) or null (the rule waits). */
function taperOn(entries, SR) {
  const judged = entries.filter((e) => taker(e.g) && e.sp?.rarity !== 'common').map((e) => [e.sp.id, e.w]);
  if (!signRuleOk(judged, SR)) return null;
  return entries.map((e) => (e.sp?.rarity === 'common' ? 0 : e.w));
}

/**
 * The cast's whole distribution (§4), the one the game draws from. opts:
 *   pool       data.placePool's result at the cast's place (null: open water) in this phase on this bait ({list, giant, place})
 *   area       areaAt's (open water), phase, lure, bait, wickId, rb (the rarity bonus)
 *   rule       the sign's rule object the cast met (CONTRACT §14): makers + tilt (or the built predators / bottom family tilt), spook
 *   taperFirst Taper's first bite is open
 *   preroll    {sp, z, base}: a rise's, a swirl's or a silhouette's fish (base: its take before the hook: 1, 0.6, 0.45)
 *   comeback   {sp, z}: Ashwick's fish at this water
 * → {entries: [{sp, p, from: 'comeback' | 'preroll' | 'pool', z?, g}], S (the pool's takers' weight), taper (Taper's rule served by this
 *   cast), waited (a comeback that waits: its grade here is 0)}. The p sum to 1. A grade-0 fish's whole cast is at most 1.00%: a stray
 *   pre-roll takes 1% and is left out of the pool behind it; the pool's strays are capped last.
 */
export function castOdds(D, { pool = null, area = null, phase = 'calm', lure = null, bait = null, wickId = null, rb = 0, rule = null,
  taperFirst = false, preroll = null, comeback = null, notes = null } = {}) {
  const place = pool?.place ?? null, SR = D?.AUTOFISH?.signRule || { minSpecies: 2, maxShare: 0.8 };
  const NT = notes ? noteTerms(D, notes, { area, place, phase }) : null;   // LOST-TACKLE §4: the owned notebooks' boosts and guests
  // 3–6: the pool, the area or the tilt, the hook
  let es = hookWeights(pool?.list, { area, place, phase, lure, bait, boost: NT?.boost });
  // 7: the rarity bonus
  const b = num(rb, 0);
  if (b) for (const e of es) { if (e.sp?.rarity === 'uncommon') e.w *= 1 + 2 * b; else if (e.sp?.rarity === 'rare') e.w *= 1 + 4 * b; }
  // 8: the tell's tilt on its makers that take the hook (the flag-off family tilt for a rule without makers); F17 judged on the takers
  if (rule && !rule.spook) {
    const mk = Array.isArray(rule.makers) ? new Set(rule.makers) : null, t = num(rule.tilt, 3);
    const fam = !mk && (rule.predators || rule.bottom) ? { predator: num(rule.predators, 1) || 1, bottom: num(rule.bottom, 1) || 1 } : null;
    const k = (e) => (!taker(e.g) ? 1 : mk ? (mk.has(e.sp?.id) ? t : 1) : fam ? num(fam[e.sp?.family], 1) : 1);
    if (mk || fam) {
      const tilted = es.map((e) => ({ ...e, w: e.w * k(e) }));
      let judged = tilted;
      if (taperFirst && isTaper(D, wickId)) { const tw = taperOn(tilted, SR); if (tw) judged = tilted.map((e, i) => ({ ...e, w: tw[i] })); }
      if (signRuleOk(judged.filter((e) => taker(e.g)).map((e) => [e.sp.id, e.w]), SR)) es = tilted;
    }
  }
  // 9: Taper's first bite
  let taper = false;
  if (taperFirst && isTaper(D, wickId)) { const tw = taperOn(es, SR); if (tw) { es = es.map((e, i) => ({ ...e, w: tw[i] })); taper = true; } }
  // 10–11: the giant, the strays' cap
  es = finishPool(es, { giant: pool?.giant ?? null, lure, bait, phase, wickId, D, guests: NT?.guests });
  const S = takersSum(es);
  // 1: the comeback (the bait-only gate kept): its grade ≥ 1 → this cast is that fish; 0 → it waits
  let waited = false;
  if (comeback?.sp) {
    const sp = comeback.sp, g = gradeOf(sp.id, { lure, bait });
    if (g !== 0 && (!sp.bait || sp.bait === bait)) return { entries: [{ sp, p: 1, from: 'comeback', z: comeback.z, g }], S, taper: false, waited: false };
    waited = true;
  }
  // 2: the pre-rolled fish: the bait-only gate, Taper's first bite refuses a common, then its take by its grade
  let pre = null;
  if (preroll?.sp) {
    const sp = preroll.sp;
    if ((!sp.bait || sp.bait === bait) && !(taper && sp.rarity === 'common')) {
      const g = gradeOf(sp.id, { lure, bait });
      pre = { sp, p: takeChance(num(preroll.base, 1), g), from: 'preroll', z: preroll.z, g };
    }
  }
  // the pool gets the rest, without a pre-rolled stray's species
  const drop = pre && pre.g === 0 ? pre.sp.id : null;
  const rest = es.filter((e) => e.w > 0 && e.sp?.id !== drop), tot = rest.reduce((a, e) => a + e.w, 0);
  const left = pre ? 1 - pre.p : 1, entries = [];
  if (pre && pre.p > 0) entries.push(pre);
  if (tot > 0) for (const e of rest) entries.push({ sp: e.sp, p: left * e.w / tot, from: 'pool', g: e.g, ...(e.giant ? { giant: true } : {}), ...(e.guest ? { guest: true } : {}) });
  else if (pre) pre.p = 1;
  return { entries, S, taper, waited };
}
/** A lure's strike roll (one a second while it comes back): one draw over castOdds' entries (r1), then that fish takes it at
 *  takeChance(base, its grade) (r2). → the entry that struck, or null (no strike this second). */
export function lureStrike(odds, r1, r2, base = 0.1) {
  const e = drawOdds(odds, r1);
  return e && num(r2, 1) < takeChance(base, e.g) ? e : null;
}
/** One draw over castOdds' entries with r in [0, 1) (the game passes its seeded rnd()). → the entry, or null for an empty cast. */
export function drawOdds(odds, r) {
  const es = arr(odds?.entries);
  if (!es.length) return null;
  let x = num(r, 0);
  for (const e of es) { x -= e.p; if (x < 0) return e; }
  return es[es.length - 1];
}
/** A species' whole-cast probability in castOdds' result (every entry of it summed). */
export function castShare(odds, id) { return arr(odds?.entries).reduce((a, e) => a + (e.sp?.id === id ? e.p : 0), 0); }

/** The blind caster's open-water mix at one hour (SHEET.md §7.3; WATERCRAFT §4 on the areas' shares at that light): each area's pool on
 *  this hook, castOdds' step 7 (the rarity bonus: uncommon ×(1 + 2rb), rare ×(1 + 4rb)) before finishPool, weighted by the area's share.
 *  `light` 'day' | 'dusk' | 'night' (or a game phase); a legend's bait is a bare hook here. → {id: share} (sums to 1; {} with no water). */
export function openMix(D, { light = 'day', lure = null, bait = null, wickId = null, rb = 0, notes = null } = {}) {
  const L = lightOf(light), b = num(rb, 0);
  const legend = !!bait && Object.values(D?.LOOP?.legendBait || {}).some((x) => x?.id === bait);
  const pb = legend ? null : bait, acc = {}; let wsum = 0;
  const pool = openPool(D, L, pb);
  for (const a of AREAS) {
    const s = num(W.shares[L]?.[a], 0); if (!(s > 0)) continue;
    const NT = notes ? noteTerms(D, notes, { area: a, place: null, phase: L }) : null;
    const ws = hookWeights(pool.list, { area: a, place: null, phase: L, lure, bait: pb, boost: NT?.boost });
    if (b) for (const e of ws) { if (e.sp?.rarity === 'uncommon') e.w *= 1 + 2 * b; else if (e.sp?.rarity === 'rare') e.w *= 1 + 4 * b; }
    const es = finishPool(ws, { lure, bait: pb, phase: L, wickId, D, guests: NT?.guests });
    const tot = es.reduce((x, e) => x + e.w, 0); if (!(tot > 0)) continue;
    for (const e of es) acc[e.sp.id] = (acc[e.sp.id] || 0) + s * e.w / tot;
    wsum += s;
  }
  for (const id of Object.keys(acc)) acc[id] /= wsum || 1;
  return acc;
}
/** The blind open-water mix on one hook over an evening (the lights weighted by LOOP.evening: day, dusk, night null → 0): {id: share}.
 *  openMix at rb 0, each light weighted by LOOP.evening × its summed area shares (WC-3's Who bites: no rarity bonus). */
function eveningMix(D, { lure = null, bait = null, notes = null } = {}) {
  const E = D?.LOOP?.evening || {}, wts = { day: num(E.day, 1), dusk: num(E.dusk, 1), night: num(E.night, 0) };
  const acc = {}; let wsum = 0;
  for (const light of LIGHTS) {
    const wt = wts[light]; if (!(wt > 0)) continue;
    const s = AREAS.reduce((x, a) => x + num(W.shares[light]?.[a], 0), 0); if (!(s > 0)) continue;
    const mix = openMix(D, { light, lure, bait, notes });
    if (!Object.keys(mix).length) continue;
    for (const [id, p] of Object.entries(mix)) acc[id] = (acc[id] || 0) + wt * s * p;
    wsum += wt * s;
  }
  for (const id of Object.keys(acc)) acc[id] /= wsum || 1;
  return acc;
}
/** The gear log's Who bites (§3.9): each fish's share of open water's bites over an evening on this item alone ({lure} or {bait}), beside
 *  the bare hook's; `notes` the owned notebooks (their boosts and guests, LOST-TACKLE §4). → [{id, share, bare}], the item's largest first. */
export function bitesTable(D, { lure = null, bait = null, notes = null } = {}) {
  const on = eveningMix(D, { lure, bait, notes }), bare = eveningMix(D, { notes });
  const ids = [...new Set([...Object.keys(on), ...Object.keys(bare)])];
  return ids.map((id) => ({ id, share: on[id] || 0, bare: bare[id] || 0 })).sort((a, b) => b.share - a.share || b.bare - a.bare || (a.id < b.id ? -1 : 1));
}

// ---------------------------------------------------------------- the gear's size cap (GEAR-GATES.md §4.1; the user, 17 Nov 2026)
const CAP_ORDER = ['small', 'keeper', 'prize', 'trophy', 'elder'];
/**
 * The largest class this hook and line land of a fish: the lowest of three terms, D.LOOP.gearCap's: by its grade on the hook (a stray
 * 'keeper' · takes it · likes it · the right bait), the free hooks' own ceiling (`item`: the bare hook, the Bent Spoon, Cut Strip) and the
 * line's (`line`, by tier: Twine · Line T1 · T2 and up). kit {lure, bait, line, lineCap} (one thing on the hook, as gradeOf reads it; a
 * bait id the table does not know is a bare hook; lineCap a found line's own class in place of the tier's, LOST-TACKLE §3.2). → {cls, z (BALANCE_V3.size.classMaxZ[cls]), by: 'item' | 'line' | 'grade' (ties in that order)},
 * or null: no D.LOOP.gearCap, a fish with no row (another water's), or a null grade (the legend). capZ still applies on top (Elders stay
 * old water's and a giant's own place's).
 */
export function gearCap(D, fishId, { lure = null, bait = null, line = 0, lineCap = null } = {}) {
  const G = D?.LOOP?.gearCap;
  if (!G) return null;
  const g = gradeOf(fishId, { lure, bait });
  if (g === undefined || g === null) return null;
  const row = W.hook.table[fishId] || W.hook.guests[fishId];
  const item = lure && lure !== 'bare' && Object.prototype.hasOwnProperty.call(row, lure) ? lure : baitCol(row, bait);
  const lines = arr(G.line), t = Math.max(0, Math.min(lines.length - 1, Math.trunc(num(line, 0))));
  const terms = [['item', G.item?.[item] ?? null], ['line', (typeof lineCap === 'string' && lineCap) || (lines[t] ?? null)], ['grade', g === 0 ? 'keeper' : arr(G.grade)[g] ?? null]];
  let best = null;
  for (const [by, cls] of terms) {
    const i = CAP_ORDER.indexOf(cls);
    if (i < 0) continue;
    if (!best || i < best.i) best = { by, cls, i };
  }
  if (!best) return null;
  const top = D?.BALANCE_V3?.size?.classMaxZ || {};
  const z = best.cls === 'elder' ? num(D?.BALANCE_V3?.size?.z?.max, num(top.elder, 3.6)) : num(top[best.cls], Infinity);
  return { cls: best.cls, z, by: best.by };
}
