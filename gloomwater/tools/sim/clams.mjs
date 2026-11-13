#!/usr/bin/env node
// tools/sim/clams.mjs — the clam economy of the Full Hold (docs/loop/SPEC.md, DESIGN §26).
//
// What it proves:
//   1. fish values by lake, rarity and size class under the new value rule;
//   2. the anti-grind rule: with "the water goes quiet", waiting for giants never beats fishing naturally;
//   3. clams per trip by tackle tier and hold size;
//   4. bait: a tin earns 1.3–4× its price (worth buying, never a must);
//   4b. Elders and legends: how often the big one bites, and what a legend hunt costs and pays;
//   5. the pacing targets: time to every purchase along a sensible buying order (10 min, 1 h, 5 h, 20 h).
//
// What the model leaves out (so read it as ±10%): the depth of the cast (every species of the hour can bite), signs and clean
// casts (folded into `favour.setup`), the Wanderers, weather, Murk's orders (a flat +6% per board level in the pacing run),
// the twists of single places (a place's own species is live half the time).
//
// What comes from src/data.js (never copied here): the species and their values, the size model and class odds
// (BALANCE_V3.size, sizeClassOf), the land chance (catchChance: CATCH_V3, TACKLE holds, lure and bait Hold),
// the lure and bait attract lists (LURES, BAITS), the time model of a cast (AUTOFISH.time, AUTOFISH.play).
// What is a draft table here (it moves into data.js as `LOOP` when slice 1 is built): the value rule, the hold
// ladder, "the water goes quiet", the evening clock, the map catalogue and every price.
//
// Run from gloomwater/:
//   node tools/sim/clams.mjs            everything (about 15 s)
//   node tools/sim/clams.mjs --quick    fewer trips per row (about 6 s; numbers move by a few percent)
//   node tools/sim/clams.mjs --md       the tables as markdown (for SPEC.md)
//   node tools/sim/clams.mjs --json     the LOOP draft tables as JSON
// Deterministic: every row has its own fixed seed. Exits 1 if a pacing target or the anti-grind check fails.
import { pathToFileURL } from 'node:url';
globalThis.GW_V3 = true;                                  // the v3 tables (data.js reads the flag once, at import)
const D = await import('../../src/data.js');
const IS_MAIN = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;   // import { LOOP, trip, run, POL, clamsFor } from other tools without printing

const A = D.AUTOFISH, SZ = D.BALANCE_V3.size, RW = D.RARITY_WEIGHTS;
const args = process.argv.slice(2), QUICK = args.includes('--quick'), MD = args.includes('--md');
const N = QUICK ? 1500 : 6000;                            // trips per row
const LAKES = ['mossmere', 'sporewood', 'glasswater', 'paleabyss'];
const LAKE_NAME = { mossmere: 'The Mossmere', sporewood: 'Sporewood Pools', glasswater: 'Glasswater Vault', paleabyss: 'The Pallid Deep' };
const CLASSES = ['small', 'keeper', 'prize', 'trophy', 'elder', 'ancient'];
const CI = Object.fromEntries(CLASSES.map((c, i) => [c, i]));

// =====================================================================================================================
// LOOP — the draft tables (the binding copy is docs/loop/SPEC.md; tune here, then copy there)
// =====================================================================================================================
export const LOOP = {
  // ---- sale value: clams = max(1, round(species.value × clamp(e^(perZ·z)) × classBonus)). No lake normaliser, no quality, no streak.
  value: { perZ: 0.9, clamp: [0.4, 30], classBonus: { trophy: 1.25, elder: 1.6 } },
  // ---- the hold: 3 slots at the start; each step is bought once, in order
  hold: { start: 3, ladder: [{ slots: 4, price: 30 }, { slots: 5, price: 120 }, { slots: 6, price: 450 }, { slots: 7, price: 2000 }, { slots: 8, price: 10000 }] },
  // ---- the water goes quiet: every water has a few good bites per trip, by its kind (open water: + `perHull` per Quiet Hull
  // level). EVERY bite spends one: struck or let pass, landed or lost, kept or let go. After that each bite there costs favour
  // and comes slower. Only going home brings the water back.
  water: { good: { open: 4, day: 2, old: 4, night: 3, crown: 2 }, perHull: 1, stale: { favour: -0.15, floor: -1.2, wait: 0.3, waitMax: 2.2 } },
  // ---- the evening: every trip leaves late in the day. `day` s of water time until dusk, `dusk` s of dusk, then night
  // until you turn for home (the clock stands still during a catch's ceremony and card).
  evening: { day: 40, dusk: 20 },
  favour: { place: 0.15, window: { day: 0.2, old: 0.4, night: 0.3, crown: 0.2 }, dusk: 0.2, night: 0.25, perLantern: 0.05, setup: 0.15 },   // setup: an ordinary player's signs, clean casts and depth
  kept: { weight: 3, live: 0.5 },                         // a place's own species: a rare's roll weight × 3 while its twist is live (half the time)
  // ---- tackle: one price per tier for Rod, Line and Reel (each slot bought separately); no proof catches
  tackle: { price: [0, 50, 300, 1200, 7500], needsMap: [null, null, null, 'sporewood', 'glasswater'] },
  // ---- maps: 3 lake maps (the Mossmere is yours) + 16 place maps (4 per lake: day water, old water, night water, crown)
  lakeMaps: { sporewood: 800, glasswater: 6000, paleabyss: 18000 },
  places: [
    { id: 'lily_maze',         lake: 'mossmere',   kind: 'day',   price: 60,    name: 'The Lily Maze',         attract: { candlefin_koi: 3, weeping_carp: 1.5 }, kept: [] },
    { id: 'under_the_span',    lake: 'mossmere',   kind: 'old',   price: 150,   name: 'Under the Span',        attract: { mossback_perch: 2, reedjaw_pike: 2 }, kept: ['bridgechain_sturgeon'] },
    { id: 'buoy_lights',       lake: 'mossmere',   kind: 'night', price: 260,   name: 'The Buoy Lights',       attract: { gloam_eel: 2, lampsipper: 2 }, kept: [] },
    { id: 'bell_pool',         lake: 'mossmere',   kind: 'crown', price: 500,   name: 'The Bell Pool',         attract: { weeping_carp: 2 }, kept: [], legend: 'belled_matriarch' },
    { id: 'lullaby',           lake: 'sporewood',  kind: 'day',   price: 500,   name: 'The Lullaby',           attract: { sleepspore_jelly: 2, velvet_ray: 1.5 }, kept: [] },
    { id: 'gill_harp',         lake: 'sporewood',  kind: 'old',   price: 900,   name: 'The Gill Harp',         attract: { velvet_ray: 2.5, threadling_eel: 2 }, kept: ['harpstring_eel'] },
    { id: 'veilwater',         lake: 'sporewood',  kind: 'night', price: 1200,  name: 'The Veilwater',         attract: { mildew_angler: 2 }, kept: ['hushcap_koi'] },
    { id: 'mothers_cup',       lake: 'sporewood',  kind: 'crown', price: 2200,  name: "The Mother's Cup",      attract: { velvet_ray: 2, plumgill_perch: 1.5 }, kept: [], legend: 'drifting_grove' },
    { id: 'stilled_cascade',   lake: 'glasswater', kind: 'day',   price: 3000,  name: 'The Stilled Cascade',   attract: { glassgill_perch: 2, prism_minnow: 1.5 }, kept: ['rainglass_darter'] },
    { id: 'mirror_nave',       lake: 'glasswater', kind: 'old',   price: 5000,  name: 'The Mirror Nave',       attract: { mirror_pike: 3 }, kept: ['the_unreflected'] },
    { id: 'broken_hymnal',     lake: 'glasswater', kind: 'night', price: 7000,  name: 'The Broken Hymnal',     attract: { vesper_gar: 3, shardspine_eel: 2 }, kept: [] },
    { id: 'fallen_chandelier', lake: 'glasswater', kind: 'crown', price: 10000, name: 'The Fallen Chandelier', attract: { mirror_pike: 1.5, shardspine_eel: 1.5 }, kept: [], legend: 'glass_sovereign' },
    { id: 'bier_barge',        lake: 'paleabyss',  kind: 'day',   price: 12000, name: 'The Bier Barge',        attract: { pallid_wraithfin: 1.5, shroud_ray: 1.5 }, kept: ['wax_bearer'] },
    { id: 'chain_garden',      lake: 'paleabyss',  kind: 'old',   price: 18000, name: 'The Chain Garden',      attract: { gilt_eyed_eel: 1.5 }, kept: ['candlewake_sturgeon'] },
    { id: 'sunken_belfry',     lake: 'paleabyss',  kind: 'night', price: 24000, name: 'The Sunken Belfry',     attract: { lampwarden_angler: 2, gilt_eyed_eel: 1.5 }, kept: ['the_clapper'] },
    { id: 'the_bottomless',    lake: 'paleabyss',  kind: 'crown', price: 28000, name: 'The Bottomless',        attract: { lampwarden_angler: 1.5, shroud_ray: 1.5 }, kept: [], legend: 'lantern_swallower' },
  ],
  // ---- lures (permanent, one fitted) and bait (a tin of 10; one spent per hooked fish; fitted beside the lure)
  lures: { feather_fly: 50, glimmer_spoon: 90, bone_jig: 110, bell_spinner: 180, moth_popper: 400, sporelamp_fly: 500, mirror_shard: 2400, lantern_lure: 4000, ferry_coin: 12000 },
  lureNeedsMap: { moth_popper: 'sporewood', sporelamp_fly: 'sporewood', mirror_shard: 'glasswater', lantern_lure: 'glasswater', ferry_coin: 'paleabyss' },
  bait: {                                                 // favour: every fish runs bigger; attract and Hold as BAITS / CATCH_V3.items say
    mireworm:    { tin: 10,  favour: 0.3,  needsMap: 'mossmere' },     // the Mossmere's plain bait
    lumen_moss:  { tin: 20,  favour: 0.2,  needsMap: 'mossmere' },     // the Gloam Eel and the Sleepspore Jelly bite on nothing else
    spore_cake:  { tin: 45,  favour: 0.25, needsMap: 'sporewood' },    // Sporewood's plain bait; the Threadling Eel bites on nothing else
    ember_roe:   { tin: 150, favour: 0.35, needsMap: 'sporewood' },    // the predators' bait: the plain bait of Glasswater and the Pallid Deep
    glass_larva: { tin: 40,  favour: 0.4,  needsMap: 'glasswater' },   // a key, not an earner: the Chime Jelly bites on nothing else
    shimmerfly:  { tin: 200, favour: 0.4,  needsMap: 'paleabyss' },    // every fish runs bigger and holds a little better (+2 Hold)
  },
  tinSize: 10,
  // ---- legends: a legend bait per try; the first landing pays her pool's map back, later landings 40% of it
  legend: { bait: { belled_matriarch: 60, drifting_grove: 250, glass_sovereign: 1000, lantern_swallower: 3500 }, rematch: 0.4 },
  // ---- the raft, besides the hold (three levels each)
  raft: {
    oars:    { prices: [60, 300, 1500],  speed: 1, perLevel: 'raft speed +1 m/s (6 → 9)' },
    hull:    { prices: [100, 600, 8000], perLevel: 'one more good bite in open water' },
    lantern: { prices: [100, 500, 3500], perLevel: 'Night Rise +0.05; a wider pool of light' },
  },
  // ---- home (the Landing): what clams build there
  home: {
    orders:  { prices: [70, 400, 4000],          perLevel: 'one more of Murk\'s orders on the board (an order pays double for one named fish)' },
    baitBed: { prices: [120, 700, 9000],         perLevel: 'free bait each trip: 3 / 6 / 10 of the lake\'s plain bait' },
    wall:    { prices: [250, 1500, 9000, 22000], perLevel: 'one lake\'s wing of the Long Wall: your best ink print of every species there' },
    lights:  { prices: [200, 1200, 14000],        perLevel: 'jetty lanterns, quay lanterns, the sea-gate beacon (looks only)' },
  },
  // ---- looks (they never touch fishing): the first three are COSMETICS_V3's
  looks: { slate_dye: 300, oxblood_pennant: 400, amber_glass: 600, painted_prow: 2500, bell_buoy: 6000, gilt_lantern: 14000 },
  // ---- seconds that are not a cast
  time: { out: 14, between: 14, raftSpeed: 6, home: 6, sale: 8, shop: 16, pass: 0.9, show: 1.5 },   // out / between: at the starting raft speed
  // ---- the average player of the pacing run
  player: { clams: 0.9, time: 1.25, orderGain: 0.06 },   // earns 90% of the natural rule's clams, takes 25% longer (the Journal, the shop, looking around); each order slot +6%
};

// =====================================================================================================================
// helpers
// =====================================================================================================================
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const gauss = (r) => { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); };
const truncZ = (r, mu, max) => { for (let i = 0; i < 200; i++) { const z = mu + gauss(r); if (z >= SZ.z.min && z <= max) return z; } return Math.min(max, Math.max(SZ.z.min, mu)); };
const PLACE = Object.fromEntries(LOOP.places.map((p) => [p.id, p]));
const ALL_BAITS = [...D.BAITS, ...(D.WALK_BAITS || [])];
const lureDef = (id) => D.LURES.find((l) => l.id === id) || null;
const baitDef = (id) => ALL_BAITS.find((b) => b.id === id) || null;

/** Sale value in clams of a fish of species `sp` at size score z (LOOP.value). */
export function clamsFor(sp, z, V = LOOP.value) {
  const cls = D.sizeClassOf(z);
  const m = Math.min(V.clamp[1], Math.max(V.clamp[0], Math.exp(V.perZ * z)));
  return Math.max(1, Math.round(sp.value * m * (V.classBonus[cls] ?? 1)));
}

const POOLS = new Map();
/** The fish that can bite in a water: the lake's open pool (time of day, bait-only species need their bait), tilted by the place,
 *  the lure and the bait, plus the place's own species while its twist is live. */
function poolFor(lake, placeId, night, lure, bait) {
  const key = `${lake}|${placeId}|${night}|${lure}|${bait}`;
  if (POOLS.has(key)) return POOLS.get(key);
  const P = placeId ? PLACE[placeId] : null, lu = lureDef(lure), ba = baitDef(bait), list = [];
  for (const s of D.SPECIES_V3) {
    if (s.zone !== lake || s.rarity === 'legendary' || s.cove) continue;
    const own = !!s.place && !!P && P.kept.includes(s.id);
    if (s.place && !own) continue;
    if (!(own && P.kind === 'night') && (s.time === 'gloom' ? !night : s.time === 'calm' ? night : s.time === 'dawn')) continue;   // a night water's own fish keeps the water's hour
    if (s.bait && s.bait !== bait) continue;
    let w = RW[s.rarity] ?? 10;
    if (own) w = (RW.rare ?? 6) * LOOP.kept.weight * LOOP.kept.live;
    else if (P?.attract?.[s.id]) w *= P.attract[s.id];
    if (ba?.bonus?.attract?.includes(s.id)) w *= 2.5;
    if (s.bait && s.bait === bait) w *= 1.5;
    if (lu && ((lu.family && s.family === lu.family) || (lu.night && s.night) || lu.species?.includes(s.id))) w *= lu.attract;
    list.push([s, w]);
  }
  const pool = { list, tot: list.reduce((a, [, w]) => a + w, 0) };
  POOLS.set(key, pool);
  return pool;
}
const pick = (r, pool) => { let x = r() * pool.tot; for (const [s, w] of pool.list) { x -= w; if (x <= 0) return s; } return pool.list[pool.list.length - 1][0]; };
const STRIKES = Object.entries(A.player.strike);
const pickStrike = (r) => { let x = r(); for (const [g, f] of STRIKES) { x -= f; if (x <= 0) return g; } return 'struck'; };
const playMid = (c) => (A.play[c].dur[0] + A.play[c].dur[1]) / 2;
const KIND_ORDER = { day: 0, old: 1, night: 2, crown: 3, open: 4 };   // the natural route: your places first, following the light (day water, old water at dusk, night water after dark), open water to top up

// =====================================================================================================================
// one trip
// kit: {lake, rod, line, reel, hold, lure, bait, places: [ids], oars, hull, lantern}
// policy: {strike(cls, ctx), keep(fish, ctx), leave(ctx), waitDark}
// =====================================================================================================================
export function trip(kit, policy, r, opts = {}) {
  const L = opts.L ?? LOOP, T = A.time, S = L.water.stale, E = L.evening, F = L.favour;
  const freshOf = (W) => (opts.noQuiet ? Infinity : L.water.good[W.kind] + (W.kind === 'open' ? L.water.perHull * (kit.hull | 0) : 0));
  const sail = (base) => base * L.time.raftSpeed / (L.time.raftSpeed + L.raft.oars.speed * (kit.oars | 0));   // Oars: +1 m/s per level on a 6 m/s raft
  const waters = [{ id: null, kind: 'open' }, ...kit.places.map((id) => ({ id, kind: PLACE[id].kind }))].sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
  const lu = lureDef(kit.lure), baitFav = kit.bait ? (L.bait[kit.bait]?.favour ?? 0) : 0;
  let clock = 0, real = 0;                                 // clock: the evening's water time; real: seconds played
  const adv = (s, frozen = false) => { real += s; if (!frozen) clock += s; };
  const phase = () => (clock < E.day ? 'day' : clock < E.day + E.dusk ? 'dusk' : 'night');
  const toDark = () => { const w = E.day + E.dusk - clock; if (w > 0) adv(w); };
  const out = { clams: 0, kept: 0, bites: 0, hooks: 0, landed: 0, letGo: 0, lost: 0, prize: 0, trophy: 0, elder: 0, elderBites: 0, nightBites: 0, baitUsed: 0, stale: 0 };
  const hold = [];
  adv(sail(L.time.out));
  if (policy.waitDark) toDark();
  outer: for (let wi = 0; wi < waters.length; wi++) {
    const W = waters[wi], last = wi === waters.length - 1;
    if (wi > 0) adv(sail(L.time.between));
    if (W.kind === 'night') toDark();                     // a night water only fishes after dark: you wait for it
    let here = 0; const fresh = freshOf(W);
    for (;;) {
      if (hold.length >= kit.hold || out.bites >= 400) break outer;
      const over = Math.max(0, here - fresh);
      const ctx = { slots: kit.hold - hold.length, hold: kit.hold, freshHere: Math.max(0, fresh - here), over, last, watersLeft: waters.length - 1 - wi, phase: phase(), staleAll: out.stale };
      if (policy.leave(ctx)) { if (last) break outer; break; }
      const ph = phase(), night = ph === 'night';
      const sp = pick(r, poolFor(kit.lake, W.id, night, kit.lure, kit.bait));
      let mu = (W.id ? F.place + F.window[W.kind] : 0) + F.setup + (ph === 'dusk' ? F.dusk : night ? F.night + F.perLantern * (kit.lantern | 0) : 0)
        + baitFav + (lu?.favour && ((lu.family && sp.family === lu.family) || (lu.night && sp.night)) ? lu.favour : 0)
        + Math.max(S.floor, S.favour * over);
      mu = Math.min(D.BALANCE_V3.favour.cap, mu);
      adv(T.cast + T.wait * Math.min(S.waitMax, 1 + S.wait * over));
      const z = truncZ(r, mu, Math.min(D.maxZFor(sp), W.kind === 'old' ? SZ.z.max : SZ.elsewhereMaxZ));   // Elders only in old water
      const cls = D.isAncient(z) ? 'ancient' : D.sizeClassOf(z);
      here++; out.bites++; if (over > 0) out.stale++; if (night) out.nightBites++; if (CI[cls] >= 4) out.elderBites++;
      if (!policy.strike(cls, ctx)) { adv(L.time.pass); continue; }
      out.hooks++; if (kit.bait) out.baitUsed++;
      const p = D.catchChance(sp, cls, { rod: kit.rod, line: kit.line, reel: kit.reel, item: kit.lure, upgrade: kit.bait ? { id: kit.bait, level: 1 } : null }, { strike: pickStrike(r), lake: kit.lake, night });
      const quick = cls === 'small' || cls === 'keeper' ? 1 - A.player.hurry + A.player.hurry / A.play.inputs.hurry.mult : 1;
      adv(T.strike);
      if (r() < p) {
        out.landed++;
        adv(playMid(cls) * quick);
        adv(T.ceremony[cls] + L.time.show + T.card, true);
        const fish = { sp, z, cls, value: clamsFor(sp, z, L.value) };
        if (policy.keep(fish, ctx)) { hold.push(fish); if (CI[cls] >= 2) out.prize++; if (CI[cls] >= 3) out.trophy++; if (CI[cls] >= 4) out.elder++; } else out.letGo++;
      } else { out.lost++; adv(playMid(cls) * quick * 0.72 + T.lostNote); }
    }
  }
  adv(L.time.home + L.time.sale + L.time.shop, true);
  out.kept = hold.length; out.gross = hold.reduce((a, f) => a + f.value, 0);
  out.baitCost = kit.bait ? out.baitUsed * (L.bait[kit.bait].tin / L.tinSize) : 0;
  out.clams = out.gross - out.baitCost; out.sec = real; out.sawNight = clock >= E.day + E.dusk;
  return out;
}

// =====================================================================================================================
// policies
// =====================================================================================================================
const anyFresh = (x) => x.freshHere > 0 || x.watersLeft > 0;
export const POL = {
  /** strike everything, keep everything; when the last water is quiet give it `fill` more bites, then go home */
  keepAll: (fill = 4) => ({ name: 'keep what bites', strike: () => true, keep: () => true, leave: (x) => x.freshHere === 0 && (!x.last || x.over >= fill) }),
  /** THE NATURAL RULE: let Smalls pass while good water is left, keep the rest, move on when a water goes quiet, top up a little, go home */
  natural: (fill = 4) => ({ name: 'natural: let Smalls pass, keep the rest', strike: (c, x) => c !== 'small' || !anyFresh(x), keep: () => true, leave: (x) => x.freshHere === 0 && (!x.last || x.over >= fill) }),
  /** keep Prize+ (and any rare) while good water is left, then fill the hold with whatever bites */
  picky: (fill = 6) => ({ name: 'picky: Prize+ while fresh, then fill', strike: () => true, keep: (f, x) => CI[f.cls] >= 2 || f.sp.rarity === 'rare' || !anyFresh(x), leave: (x) => x.freshHere === 0 && (!x.last || x.over >= fill) }),
  /** THE GRIND: only `min` or bigger, and sit on the last water until the hold is full (or `cap` quiet bites have gone by) */
  grind: (min, cap = 40) => ({ name: `GRIND: only ${min}+, stay till full`, strike: (c) => CI[c] >= CI[min], keep: () => true, leave: (x) => x.freshHere === 0 && (!x.last || x.over >= cap) }),
  /** only `min` or bigger, home as soon as the good water is spent (many short trips) */
  hop: (min) => ({ name: `only ${min}+, home when quiet`, strike: (c) => CI[c] >= CI[min], keep: () => true, leave: (x) => x.freshHere === 0 }),
  /** sit until dark, then the natural rule */
  dark: () => ({ ...POL.natural(), name: 'wait for dark, then natural', waitDark: true }),
  /** a threshold family for the "best found" search */
  grid: (sMin, kLast, fill) => ({ name: `grid ${sMin}/${kLast}/${fill}`, strike: (c, x) => CI[c] >= sMin || !anyFresh(x), keep: (f, x) => x.slots > 1 || CI[f.cls] >= kLast || !anyFresh(x), leave: (x) => x.freshHere === 0 && (!x.last || x.over >= fill) }),
};

export function run(kit, policy, n = N, seed = 1, opts = {}) {
  const r = rng(seed), acc = {}, all = []; let noBig = 0, anyTrophy = 0, anyElder = 0, full = 0, night = 0, nightBite = 0;
  for (let i = 0; i < n; i++) {
    const x = trip(kit, policy, r, opts);
    for (const k of Object.keys(x)) if (typeof x[k] === 'number') acc[k] = (acc[k] || 0) + x[k];
    if (!x.prize) noBig++; if (x.trophy) anyTrophy++; if (x.elder) anyElder++; if (x.kept >= kit.hold) full++; if (x.sawNight) night++; if (x.nightBites) nightBite++;
    all.push(x.clams);
  }
  for (const k of Object.keys(acc)) acc[k] /= n;
  all.sort((a, b) => a - b);
  return { ...acc, min: acc.sec / 60, perMin: acc.clams / (acc.sec / 60), p10: all[(n * 0.1) | 0], p50: all[(n * 0.5) | 0], p90: all[(n * 0.9) | 0],
    noBig: noBig / n, anyTrophy: anyTrophy / n, anyElder: anyElder / n, full: full / n, night: night / n, nightBite: nightBite / n, name: policy.name };
}
/** The best of a threshold family, by clams per minute (a stand-in for exact best play). */
function bestFound(kit, seed) {
  let best = null;
  for (const sMin of [0, 1, 2]) for (const kLast of [0, 1, 2]) for (const fill of [0, 2, 4, 8]) {
    const x = run(kit, POL.grid(sMin, kLast, fill), Math.max(800, N >> 2), seed);
    if (!best || x.perMin > best.perMin) best = { ...x, name: `best found (strike ${CLASSES[sMin]}+, last slot ${CLASSES[kLast]}+, ${fill} quiet bites)` };
  }
  return best;
}

// =====================================================================================================================
// the report (only when run as a script)
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

if (args.includes('--json')) { console.log(JSON.stringify(LOOP, null, 2)); return 0; }

// ---------------------------------------------------------------- 1. values
title('1. What a fish sells for (clams): species value × e^(0.9·z), clamped 0.4–30, Trophy × 1.25, Elder × 1.6');
{
  const z = SZ.simZ, rows = [];
  for (const lake of LAKES) for (const rar of ['common', 'uncommon', 'rare']) {
    const sps = D.SPECIES_V3.filter((s) => s.zone === lake && s.rarity === rar && !s.cove);
    const mean = (c) => sps.reduce((a, s) => a + clamsFor(s, z[c]), 0) / sps.length;
    rows.push([`${LAKE_NAME[lake]} · ${rar} (${sps.length})`, ...['small', 'keeper', 'prize', 'trophy', 'elder'].map((c) => f0(mean(c)))]);
  }
  table(['lake · rarity (species)', 'Small', 'Keeper', 'Prize', 'Trophy', 'Elder'], rows);
  const mult = (c) => { const zz = z[c], m = Math.min(LOOP.value.clamp[1], Math.max(LOOP.value.clamp[0], Math.exp(LOOP.value.perZ * zz))) * (LOOP.value.classBonus[c === 'ancient' ? 'elder' : c] ?? 1); return m.toFixed(1); };
  console.log(`multiplier at a class's typical size: Small ×${mult('small')} · Keeper ×${mult('keeper')} · Prize ×${mult('prize')} · Trophy ×${mult('trophy')} · Elder ×${mult('elder')} · Ancient ×${mult('ancient')}`);
}

// ---------------------------------------------------------------- 2. strategies and the anti-grind check
const STAGES = [
  { id: 'start',  label: 'first trip: T0, hold 3, the Mossmere, open water only',  kit: { lake: 'mossmere', rod: 0, line: 0, reel: 0, hold: 3, lure: null, bait: null, places: [], oars: 0, hull: 0, lantern: 0 } },
  { id: '10min',  label: '10 min: Line T1, hold 4, the Lily Maze',                 kit: { lake: 'mossmere', rod: 0, line: 1, reel: 0, hold: 4, lure: null, bait: null, places: ['lily_maze'], oars: 0, hull: 0, lantern: 0 } },
  { id: '1h',     label: '1 h: T1, hold 5, the Mossmere with 3 places, Bone Jig',  kit: { lake: 'mossmere', rod: 1, line: 1, reel: 1, hold: 5, lure: 'bone_jig', bait: null, places: ['lily_maze', 'under_the_span', 'buoy_lights'], oars: 1, hull: 1, lantern: 0 } },
  { id: '5h',     label: '5 h: T2, hold 6, Sporewood with 3 places, Glimmer Spoon', kit: { lake: 'sporewood', rod: 2, line: 2, reel: 2, hold: 6, lure: 'glimmer_spoon', bait: null, places: ['lullaby', 'gill_harp', 'veilwater'], oars: 2, hull: 1, lantern: 1 } },
  { id: '20h',    label: '20 h: T4, hold 8, the Pallid Deep with 4 places, Bone Jig', kit: { lake: 'paleabyss', rod: 4, line: 4, reel: 4, hold: 8, lure: 'bone_jig', bait: null, places: ['bier_barge', 'chain_garden', 'sunken_belfry', 'the_bottomless'], oars: 3, hull: 3, lantern: 3 } },
];
title('2. Strategies: does waiting for giants pay? (clams per minute against the natural rule)');
const stageNatural = {};
for (const [i, st] of STAGES.entries()) {
  const seed = 1000 + i * 17, nat = run(st.kit, POL.natural(), N, seed); stageNatural[st.id] = nat;
  const rows = [], row = (x, note = '') => rows.push([x.name + note, f0(x.clams), f1(x.min), f1(x.perMin), pc(x.perMin / nat.perMin), f1(x.bites), f1(x.kept), f1(x.letGo)]);
  const best = bestFound(st.kit, seed), all = [POL.keepAll(), POL.picky(), POL.dark(), POL.hop('prize'), POL.grind('prize'), POL.grind('trophy')].map((p) => run(st.kit, p, N, seed));
  row(nat); row(best); for (const x of all) row(x);
  const ctl = [POL.natural(), POL.grind('prize', 1e9), POL.grind('trophy', 1e9)].map((p) => run(st.kit, p, Math.max(400, N >> 3), seed, { noQuiet: true }));
  for (const x of ctl) row(x, '  [if the water never went quiet]');
  const goodBites = LOOP.water.good.open + (st.kit.hull | 0) + st.kit.places.reduce((a, id) => a + LOOP.water.good[PLACE[id].kind], 0);
  console.log(`-- ${st.label}; ${goodBites} good bites for ${st.kit.hold} slots`);
  table(['strategy', 'clams/trip', 'min', 'clams/min', 'vs natural', 'bites', 'kept', 'let go'], rows);
  console.log(`   natural rule: 10th–90th percentile ${f0(nat.p10)}–${f0(nat.p90)} clams (median ${f0(nat.p50)}); ${pc(nat.noBig)} of trips bring home no Prize or bigger; ${pc(nat.anyTrophy)} a Trophy or bigger; ${(nat.anyElder * 100).toFixed(1)}% an Elder (an Elder bites on ${(nat.elderBites * 100).toFixed(0)}% of trips); ${pc(nat.full)} come home full; ${pc(nat.nightBite)} get a bite after dark; ${pc(nat.lost / Math.max(1e-9, nat.hooks))} of hooked fish get away\n`);
  const patient = all.slice(2);                            // wait for dark, hop, the two grinds
  const worst = Math.max(...patient.map((x) => x.perMin / nat.perMin));
  check(worst <= 1.05, `anti-grind (${st.id}): no patient strategy earns more than 105% of the natural rule per minute (best ${pc(worst)})`);
  check(all[5].perMin / nat.perMin <= 0.6, `anti-grind (${st.id}): "only Trophy+, stay till full" earns at most 60% per minute (${pc(all[5].perMin / nat.perMin)})`);
  check(nat.perMin / best.perMin >= 0.88, `natural play (${st.id}): the natural rule earns at least 88% of the best rule found (${pc(nat.perMin / best.perMin)})`);
  check(ctl[2].clams / ctl[0].clams >= 1.5, `the rule is needed (${st.id}): without quiet water the Trophy grind would bring ${(ctl[2].clams / ctl[0].clams).toFixed(1)}× the clams per trip`);
  if (st.id === 'start') {
    check(nat.min >= 1.5 && nat.min <= 3, `first trip: ${f1(nat.min)} min (target 1.5–3)`);
    check(nat.noBig >= 0.4 && nat.noBig <= 0.8, `first trip: ${pc(nat.noBig)} of trips bring home no Prize or bigger (target 40–80%: a big one is a chance, not a promise)`);
    check(nat.nightBite >= 0.5, `first trip: ${pc(nat.nightBite)} of trips get a bite after dark (target ≥ 50%)`);
  }
}

// ---------------------------------------------------------------- 3. clams per trip by tackle and hold
title('3. Clams per trip (minutes) by tackle tier and hold: the natural rule, each lake with its 3 ordinary places');
for (const lake of LAKES) {
  const places = LOOP.places.filter((p) => p.lake === lake && p.kind !== 'crown').map((p) => p.id), lure = lake === 'mossmere' || lake === 'paleabyss' ? 'bone_jig' : 'glimmer_spoon';
  const rows = [];
  for (const t of [0, 1, 2, 3, 4]) rows.push([`T${t}`, ...[3, 4, 5, 6, 7, 8].map((h) => { const x = run({ lake, rod: t, line: t, reel: t, hold: h, lure, bait: null, places, oars: 1, hull: 1, lantern: 1 }, POL.natural(), Math.max(600, N >> 2), 77 + t * 10 + h); return `${f0(x.clams)} (${f1(x.min)})`; })]);
  console.log(`-- ${LAKE_NAME[lake]}`);
  table(['tackle', 'hold 3', 'hold 4', 'hold 5', 'hold 6', 'hold 7', 'hold 8'], rows);
}

// ---------------------------------------------------------------- 4. bait
title('4. Bait: what a tin is worth (natural rule; net of the tin)');
{
  const rows = [];
  const G = { lake: 'glasswater', rod: 3, line: 3, reel: 3, hold: 7, lure: 'glimmer_spoon', bait: null, places: ['stilled_cascade', 'mirror_nave', 'broken_hymnal'], oars: 3, hull: 2, lantern: 2 };
  const kitOf = (id) => (id === '10h' ? G : STAGES.find((s) => s.id === id).kit);
  for (const [stId, bait] of [['1h', 'mireworm'], ['1h', 'lumen_moss'], ['5h', 'spore_cake'], ['5h', 'ember_roe'], ['10h', 'glass_larva'], ['10h', 'ember_roe'], ['20h', 'ember_roe'], ['20h', 'shimmerfly']]) {
    const kit = kitOf(stId), nB = Math.max(N, 8000), a = run(kit, POL.natural(), nB, 501), b = run({ ...kit, bait }, POL.natural(), nB, 501);   // small gains need many trips
    const gain = b.gross - a.gross, cost = b.baitCost;
    rows.push([`${stId}: ${baitDef(bait)?.name || bait}`, f0(LOOP.bait[bait].tin), f1(b.baitUsed), f0(a.clams), f0(b.gross), f0(cost), f0(b.clams), pc(b.perMin / a.perMin - 1), (gain / Math.max(1e-9, cost)).toFixed(1), f0(0.45 * gain / b.baitUsed * 10)]);
    if (!(stId === '5h' && bait === 'ember_roe') && bait !== 'glass_larva') check(gain / cost >= 1.3 && gain / cost <= 4, `bait (${stId}, ${bait}): a tin earns ${(gain / cost).toFixed(1)}× its price (target 1.3–4×: worth buying, never a must)`);
  }
  table(['stage: bait', 'tin of 10', 'baits/trip', 'no bait', 'gross with', 'bait cost', 'net with', 'net gain/min', 'earns × price', '(45% price)'], rows);
}

// ---------------------------------------------------------------- 4b. Elders and legends
title('4b. Elders and legends: how rare is the big one?');
{
  const G = { lake: 'glasswater', rod: 3, line: 3, reel: 3, hold: 7, lure: 'glimmer_spoon', bait: null, places: ['stilled_cascade', 'mirror_nave', 'broken_hymnal'], oars: 3, hull: 2, lantern: 2 };
  const rows = [];
  for (const [label, kit, giants, bait] of [['1 h, the Mossmere', STAGES[2].kit, 'bell_spinner', 'mireworm'], ['5 h, Sporewood', STAGES[3].kit, 'sporelamp_fly', 'ember_roe'], ['10 h, Glasswater', G, 'mirror_shard', 'ember_roe'], ['20 h, the Pallid Deep', STAGES[4].kit, 'ferry_coin', 'ember_roe']]) {
    const a = run(kit, POL.natural(), N, 811), b = run({ ...kit, lure: giants, bait }, POL.natural(), N, 811);
    rows.push([label, pc(a.elderBites), `${(a.anyElder * 100).toFixed(1)}%`, f0(1 / Math.max(1e-9, a.elder)), pc(b.elderBites), `${(b.anyElder * 100).toFixed(1)}%`, f0(1 / Math.max(1e-9, b.elder))]);
    if (label.startsWith('5 h')) check(b.anyElder >= 0.015, `Elders (5 h): with the giants' lure and Ember Roe an Elder comes home on ${(b.anyElder * 100).toFixed(1)}% of trips (target ≥ 1.5%)`);
    if (label.startsWith('20 h')) check(b.anyElder >= 0.04 && b.anyElder <= 0.3, `Elders (20 h): with the giants' lure and Ember Roe an Elder comes home on ${(b.anyElder * 100).toFixed(1)}% of trips (target 4–30%: a story, not a wage)`);
  }
  table(['stage (natural rule)', 'an Elder bites', 'an Elder landed', 'trips per Elder', 'with giants\' lure + bait: bites', 'landed', 'trips per Elder'], rows);
  const lrows = [];
  for (const [id, t] of [['belled_matriarch', 1], ['drifting_grove', 2], ['glass_sovereign', 3], ['lantern_swallower', 4]]) {
    const load = { rod: t, line: t, reel: t }, p0 = D.catchChance(id, 'legend', load, { wounds: 0 }); let alive = 1, tries = 0;
    for (let k = 0; k < 12 && alive > 0.02; k++) { tries += alive; alive *= 1 - D.catchChance(id, 'legend', load, { wounds: k }); }
    const pool = LOOP.places.find((p) => p.legend === id);
    lrows.push([D.SPECIES_V3_BY_ID[id].name, `T${t}`, pc(p0), tries.toFixed(1), f0(LOOP.legend.bait[id]), f0(tries * LOOP.legend.bait[id]), f0(pool.price), f0(pool.price * LOOP.legend.rematch)]);
  }
  table(['legend', 'tackle', 'first try lands', 'tries expected', 'bait per try', 'bait in all', 'first landing pays', 'later landings pay'], lrows);
}

// ---------------------------------------------------------------- 5. the pacing run
title('5. Pacing: an average player along a sensible buying order');
{
  const P = LOOP.player, state = { clams: 0, sec: 0, trips: 0, earned: 0, spent: 0, rod: 0, line: 0, reel: 0, hold: LOOP.hold.start, maps: new Set(['mossmere']), places: new Set(), lures: new Set(), oars: 0, hull: 0, lantern: 0, orders: 0, baitBed: 0, wall: 0, lights: 0, legends: new Set() };
  const BEST_LURE = { mossmere: ['bone_jig', 'glimmer_spoon', 'feather_fly'], sporewood: ['glimmer_spoon', 'bone_jig', 'feather_fly'], glasswater: ['glimmer_spoon', 'bone_jig', 'feather_fly'], paleabyss: ['bone_jig', 'glimmer_spoon', 'feather_fly'] };
  const PLAIN_BAIT = { mossmere: 'mireworm', sporewood: 'spore_cake', glasswater: 'ember_roe', paleabyss: 'ember_roe' };
  const kitFor = (lake) => ({ lake, rod: state.rod, line: state.line, reel: state.reel, hold: state.hold, lure: BEST_LURE[lake].find((l) => state.lures.has(l)) || null,
    bait: state.sec > 1800 ? PLAIN_BAIT[lake] : null, places: LOOP.places.filter((p) => p.lake === lake && state.places.has(p.id)).map((p) => p.id), oars: state.oars, hull: state.hull, lantern: state.lantern });
  const evalCache = new Map();
  const evalLake = (lake) => {
    const kit = kitFor(lake), key = JSON.stringify(kit);
    if (!evalCache.has(key)) {
      const x = run(kit, POL.natural(), Math.max(1500, N >> 2), 9000 + evalCache.size);
      const bedFree = kit.bait ? Math.min(x.baitUsed, [0, 3, 6, 10][state.baitBed]) * (LOOP.bait[kit.bait].tin / LOOP.tinSize) : 0;
      evalCache.set(key, { lake, clams: (x.clams + bedFree) * P.clams * (1 + P.orderGain * state.orders), min: x.min * P.time, kept: x.kept, elder: x.elder, trophy: x.anyTrophy });
    }
    return evalCache.get(key);
  };
  const bestLake = () => [...state.maps].map(evalLake).sort((a, b) => b.clams / b.min - a.clams / a.min)[0];
  const price = (id) => {
    const [kind, a, b] = id.split(':');
    if (kind === 'hold') return LOOP.hold.ladder.find((h) => h.slots === +a).price;
    if (kind === 'rod' || kind === 'line' || kind === 'reel') return LOOP.tackle.price[+a];
    if (kind === 'lake') return LOOP.lakeMaps[a];
    if (kind === 'place') return PLACE[a].price;
    if (kind === 'lure') return LOOP.lures[a];
    if (kind === 'raft') return LOOP.raft[a].prices[+b - 1];
    if (kind === 'home') return LOOP.home[a].prices[+b - 1];
    if (kind === 'look') return LOOP.looks[a];
    if (kind === 'legend') return legendCost(a).cost;
    throw new Error(id);
  };
  /** A legend hunt: tries until she is landed (each escape wounds her: +6 Hold, to +18), the bait bought per try; the first landing pays her pool's map back. */
  function legendCost(id) {
    const load = { rod: state.rod, line: state.line, reel: state.reel }; let alive = 1, tries = 0;
    for (let k = 0; k < 12 && alive > 0.02; k++) { tries += alive; alive *= 1 - D.catchChance(id, 'legend', load, { wounds: k }); }
    return { cost: Math.round(tries * LOOP.legend.bait[id]), tries, prize: LOOP.places.find((p) => p.legend === id).price };
  }
  const apply = (id) => {
    const [kind, a, b] = id.split(':');
    if (kind === 'hold') state.hold = +a; else if (kind === 'rod' || kind === 'line' || kind === 'reel') state[kind] = +a;
    else if (kind === 'lake') state.maps.add(a); else if (kind === 'place') state.places.add(a); else if (kind === 'lure') state.lures.add(a);
    else if (kind === 'raft' || kind === 'home') state[a] = +b; else if (kind === 'legend') { state.legends.add(a); state.clams += legendCost(a).prize; }
  };
  const ORDER = [
    // ---- the Mossmere
    'hold:4', 'line:1', 'place:lily_maze', 'rod:1', 'reel:1', 'raft:oars:1', 'home:orders:1', 'hold:5', 'place:under_the_span', 'lure:bone_jig', 'raft:hull:1',
    'lure:glimmer_spoon', 'place:buoy_lights', 'raft:lantern:1', 'lure:feather_fly', 'home:baitBed:1',
    'lake:sporewood',
    // ---- Sporewood Pools (and what was left in the Mossmere)
    'line:2', 'reel:2', 'rod:2', 'hold:6', 'place:lullaby', 'lure:bell_spinner', 'home:wall:1', 'place:bell_pool', 'legend:belled_matriarch', 'raft:oars:2', 'home:orders:2',
    'place:gill_harp', 'home:lights:1', 'lure:moth_popper', 'place:veilwater', 'raft:lantern:2', 'lure:sporelamp_fly', 'look:slate_dye', 'raft:hull:2', 'line:3', 'look:oxblood_pennant', 'home:baitBed:2', 'reel:3', 'look:amber_glass', 'rod:3',
    'lake:glasswater',
    // ---- Glasswater Vault (and what was left in Sporewood)
    'hold:7', 'place:mothers_cup', 'legend:drifting_grove', 'home:wall:2', 'place:stilled_cascade', 'lure:mirror_shard', 'raft:oars:3', 'home:lights:2', 'place:mirror_nave',
    'home:orders:3', 'line:4', 'lure:lantern_lure', 'place:broken_hymnal', 'raft:lantern:3', 'reel:4', 'look:painted_prow', 'rod:4',
    'lake:paleabyss',
    // ---- the Pallid Deep (and what was left in Glasswater)
    'hold:8', 'place:bier_barge', 'raft:hull:3', 'place:chain_garden', 'home:baitBed:3', 'place:fallen_chandelier', 'legend:glass_sovereign', 'home:wall:3', 'lure:ferry_coin',
    'home:lights:3', 'look:bell_buoy', 'place:sunken_belfry', 'home:wall:4', 'place:the_bottomless', 'legend:lantern_swallower', 'look:gilt_lantern',
  ];

  const NAMES = { hold: (a) => `Hold ${a}`, rod: (a) => `Rod T${a}`, line: (a) => `Line T${a}`, reel: (a) => `Reel T${a}`, lake: (a) => `MAP: ${LAKE_NAME[a]}`, place: (a) => `map: ${PLACE[a].name}`,
    lure: (a) => `lure: ${lureDef(a)?.name || a}`, raft: (a, b) => `raft: ${{ oars: 'Oars', hull: 'Quiet Hull', lantern: 'Lantern' }[a]} ${'I'.repeat(+b)}`,
    home: (a, b) => `home: ${{ orders: 'Order Board', baitBed: 'Bait Bed', wall: 'Long Wall wing', lights: 'Landing lights' }[a]} ${b}`, legend: (a) => `legend hunt: ${D.SPECIES_V3_BY_ID[a].name}`,
    look: (a) => `look: ${{ slate_dye: 'Slate Cloak Dye', oxblood_pennant: 'Oxblood Pennant', amber_glass: 'Amber Lantern Glass', painted_prow: 'Painted Prow', bell_buoy: 'Bell Buoy', gilt_lantern: 'Gilt Lantern' }[a]}` };
  const log = [], marks = [[10 / 60, '10 min'], [1, '1 h'], [5, '5 h'], [20, '20 h']], markRows = []; let mi = 0, lastBuyTrips = 0, sinceBuy = [];
  const snapshot = (label) => {
    const e = bestLake(), recent = sinceBuy.slice(-6), tpp = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 1;
    markRows.push({ label, clams: e.clams, min: e.min, tpp, bought: log.length, lake: e.lake, state: `T${state.rod}/${state.line}/${state.reel}, hold ${state.hold}, ${state.maps.size} lake${state.maps.size > 1 ? 's' : ''}, ${state.places.size} place${state.places.size === 1 ? '' : 's'}` });
  };
  let elders = 0, elderAt = null;
  const playTrip = () => { const e = bestLake(); state.clams += e.clams; state.earned += e.clams; state.sec += e.min * 60; state.trips++; elders += e.elder; if (elderAt === null && elders >= 1) elderAt = state.sec / 3600; while (mi < marks.length && state.sec / 3600 >= marks[mi][0]) snapshot(marks[mi++][1]); return e; };
  for (const id of ORDER) {
    const cost = price(id); let guard = 0;
    while (state.clams < cost && guard++ < 5000) playTrip();
    state.clams -= cost; state.spent += cost; apply(id);
    const e = bestLake(), [kind, a, b] = id.split(':');
    sinceBuy.push(state.trips - lastBuyTrips);
    log.push({ id, name: NAMES[kind](a, b), cost, h: state.sec / 3600, trips: state.trips, waited: state.trips - lastBuyTrips, lake: e.lake, perTrip: e.clams, min: e.min });
    lastBuyTrips = state.trips;
  }
  const doneH = state.sec / 3600;
  while (mi < marks.length && guardOk()) playTrip();
  function guardOk() { return state.trips < 20000; }
  table(['#', 'hour', 'trips', 'waited', 'buys', 'clams', 'then fishing', 'clams/trip', 'min/trip'],
    log.map((l, i) => [i + 1, l.h.toFixed(2), l.trips, l.waited, l.name, f0(l.cost), LAKE_NAME[l.lake], f0(l.perTrip), f1(l.min)]));
  console.log(`${log.length} purchases, ${f0(state.spent)} clams spent of ${f0(state.earned)} earned in ${doneH.toFixed(1)} h and ${f0(log[log.length - 1].trips)} trips.`);
  const byKind = {}; for (const l of log) { const k = l.id.split(':')[0]; const g = k === 'lake' || k === 'place' ? 'maps' : k === 'rod' || k === 'line' || k === 'reel' ? 'tackle' : k === 'look' ? 'looks' : k; byKind[g] = (byKind[g] || 0) + l.cost; }
  console.log(`Where the clams go: ${Object.entries(byKind).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${pc(v / state.spent)}`).join(' · ')}\n`);
  title('5b. The pacing marks');
  table(['mark', 'clams/trip', 'min/trip (with 25% looking around)', 'trips per purchase', 'bought', 'fishing', 'state'], markRows.map((m) => [m.label, f0(m.clams), f1(m.min), f1(m.tpp), m.bought, LAKE_NAME[m.lake], m.state]));
  const at = (id) => log.find((l) => l.id === id), M = Object.fromEntries(markRows.map((m) => [m.label, m]));
  const longest = log.reduce((a, l) => (l.waited * l.min > a.w ? { w: l.waited * l.min, l } : a), { w: 0, l: null });
  console.log(`Longest wait for one purchase: ${f0(longest.w)} min (${longest.l.name}). Elders landed by the last purchase: ${elders.toFixed(1)} (the first is due at about hour ${elderAt === null ? '—' : elderAt.toFixed(1)}).\n`);
  const within = (v, lo, hi) => v >= lo && v <= hi;
  check(at('hold:4').trips <= 2, `10 min: the first purchase (Hold 4) comes after trip ${at('hold:4').trips} (target ≤ 2)`);
  check(within(M['10 min'].bought, 2, 5), `10 min: ${M['10 min'].bought} purchases made (target 2–5)`);
  check(within(M['10 min'].clams, 40, 90), `10 min: ${f0(M['10 min'].clams)} clams per trip (target 40–90)`);
  check(within(M['1 h'].clams, 100, 220), `1 h: ${f0(M['1 h'].clams)} clams per trip (target 100–220)`);
  check(within(M['1 h'].tpp, 0.7, 2.6), `1 h: ${f1(M['1 h'].tpp)} trips per purchase (target 0.7–2.6)`);
  check(within(M['1 h'].bought, 11, 18), `1 h: ${M['1 h'].bought} purchases made (target 11–18)`);
  check(within(at('lake:sporewood').h, 1.2, 2.0), `the Sporewood map at ${at('lake:sporewood').h.toFixed(1)} h (target 1.2–2.0)`);
  check(within(M['5 h'].clams, 300, 700), `5 h: ${f0(M['5 h'].clams)} clams per trip (target 300–700)`);
  check(within(M['5 h'].tpp, 1.5, 5), `5 h: ${f1(M['5 h'].tpp)} trips per purchase (target 1.5–5)`);
  check(within(at('lake:glasswater').h, 4.5, 6.5), `the Glasswater map at ${at('lake:glasswater').h.toFixed(1)} h (target 4.5–6.5)`);
  check(within(at('lake:paleabyss').h, 9.5, 13), `the Pallid Deep map at ${at('lake:paleabyss').h.toFixed(1)} h (target 9.5–13)`);
  check(within(doneH, 17, 24), `the last purchase at ${doneH.toFixed(1)} h (target 17–24)`);
  check(M['20 h'] ? within(M['20 h'].clams, 1400, 3000) : false, `20 h: ${M['20 h'] ? f0(M['20 h'].clams) : '—'} clams per trip (target 1,400–3,000)`);
  check(elderAt !== null && within(elderAt, 2.5, 9), `the first Elder is due at about hour ${elderAt === null ? '—' : elderAt.toFixed(1)} (target 2.5–9)`);
  check(longest.w <= 75, `no purchase is more than 75 min away (longest ${f0(longest.w)} min)`);
  const mapShare = (byKind.maps || 0) / state.spent;
  check(within(mapShare, 0.35, 0.6), `maps are the big goals: ${pc(mapShare)} of all clams spent (target 35–60%)`);
}

console.log(failures.length ? `\n${failures.length} check(s) FAILED` : '\nall checks passed');
return failures.length ? 1 : 0;
}
if (IS_MAIN) process.exit(report());
