// Unit tests for M1 step 2 (docs/loop/M1.md §4 step 2, SPEC §13): the roster converter (src/roster-species.js), the allow-list export
// (src/roster-shipped.js), SPECIES_LOOP for the Mossmere's 11, LOOP.shipped, the worked values on roster sizes, the phase pin's one
// lift, weights in pounds within ±30% of each cousin, and nothing of it off the loop.   node tools/tests/roster-species.test.mjs
import fs from 'node:fs';
import * as RS from '../../src/roster-species.js';
import * as PL from '../../src/progression-loop.js';
import { exportText, SHIPPED } from '../roster-export.mjs';

let pass = 0, fail = 0;
const failures = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; failures.push(msg); console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const section = (s) => console.log(`- ${s}`);

const ROSTER = JSON.parse(fs.readFileSync(new URL('../../docs/loop/roster.json', import.meta.url), 'utf8'));
// the builds, each its own module instance (data.js reads the flags once, at import)
const V1 = await import('../../src/data.js?rs-v1');
globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
const V3 = await import('../../src/data.js?rs-v3');
globalThis.GW_LOOP = true;
const D = await import('../../src/data.js?rs-loop');
delete globalThis.GW_LOOP; globalThis.GW_V3_PHASE = 4;
const V3P4 = await import('../../src/data.js?rs-v3p4');
delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE;
// M1 step 3a: the open water's twelve (the list, with the Kissmark Trout), then the places' own fish and giants (Under the Span's
// Bridgechain and Thousandcast, the Buoy Lights' Hullkiss)
const MOSS = ['dusk_minnow', 'mossback_perch', 'gutter_crayfish', 'likely_chub', 'overbold_bass', 'rustfin_sucker', 'lampsipper', 'weeping_carp',
  'candlefin_koi', 'milkeye_perch', 'kissmark_trout', 'reedjaw_pike'];
const PLACE_FISH = ['bridgechain_sturgeon', 'thousandcast_pike', 'hullkiss_lamprey'];

section('the converter\'s rules (SPEC §13)');
{
  eq(['day', 'dusk', 'night', 'day, dusk', 'dusk, night', 'any', 'any, best at night'].map(RS.hourKey), ['day', 'dusk', 'night', 'day,dusk', 'dusk,night', 'any', 'any'], 'hours → the LOOP.hours keys');
  eq(RS.HOUR_WINDOWS.day, ['day', 'dusk'], '"day" → day, dusk'); eq(RS.HOUR_WINDOWS.dusk, ['dusk', 'night'], '"dusk" → dusk, night'); eq(RS.HOUR_WINDOWS.any, ['day', 'dusk', 'night'], '"any" → all');
  ok(Object.keys(RS.HOUR_WINDOWS).every((k) => k in D.LOOP.hours), 'every hour key is a LOOP.hours key (fishing.js reads them)');
  eq(RS.styleOf({ play: 'Sulker. No runs: it latches.' }), 'sulker', 'play → its first word, lower case');
  eq(RS.styleOf({ id: 'belled_matriarch', rarity: 'legendary', play: 'Steady. Authored.' }, { belled_matriarch: 'steady' }), 'steady', 'a legend keeps CATCH_V3.legend.style');
  const items = RS.rosterItemNames(D);
  eq(RS.baitsOf('Glow: bites on Lumen Moss only.', items), { baits: ['lumen_moss'], only: 'lumen_moss' }, '"bites on X only" makes X its only bait');
  ok(RS.baitsOf('Bottom: Mire Worms, Bone Jig.', items).baits.length >= 2 && RS.baitsOf('Bottom: Mire Worms, Bone Jig.', items).only === null, 'a tin named in favours is a Hold bait, not the only one');
  const f = ROSTER.fish.find((x) => x.id === 'milkeye_perch'), cut = RS.allowList(f);
  ok(Object.keys(cut).every((k) => RS.ROSTER_KEYS.includes(k)) && !('inspiredBy' in cut) && !('giantOf' in cut) && !('refWeight' in cut) && !('draft' in cut) && !('look' in cut),
    'the allow-list keeps only its fields: no research field reaches src/', Object.keys(cut));
  ok(f.refWeight && f.inspiredBy, '(the research fields stay in docs/loop/roster.json)');
}

section('the export (src/roster-shipped.js) and the converter on it');
{
  eq(fs.readFileSync(new URL('../../src/roster-shipped.js', import.meta.url), 'utf8'), exportText(ROSTER), 'src/roster-shipped.js is a fresh export (node tools/roster-export.mjs)');
  eq(SHIPPED, ['dusk_minnow', 'mossback_perch', 'likely_chub', 'overbold_bass', 'rustfin_sucker', 'milkeye_perch', 'weeping_carp', 'reedjaw_pike',
    'kissmark_trout', 'thousandcast_pike', 'hullkiss_lamprey'], 'the eight roster fish on built plans, and M1 step 3a\'s three on theirs');
  const text = fs.readFileSync(new URL('../../src/roster-shipped.js', import.meta.url), 'utf8');
  ok(!/inspiredBy|giantOf|gotAwayOf|refWeight|scientific|episodes|Sander|Esox|Perca|Cyprinus/.test(text), 'the export holds no research field or research name');
}

section('SPECIES_LOOP: the Mossmere\'s 15 under the loop (M1.md §2.3; M1 step 3a)');
{
  eq(D.SPECIES_LOOP.map((s) => s.id), [...MOSS, ...PLACE_FISH], 'the twelve in the Journal\'s order, then the places\' own fish and giants');
  eq(D.SPECIES.filter((s) => s.zone === 'mossmere').map((s) => s.id), [...MOSS, ...PLACE_FISH, 'gloam_eel', 'belled_matriarch'], 'the Mossmere\'s SPECIES: the fifteen, then the Gloam Eel and the Matriarch (17)');
  eq(PL.listFor(D, 'mossmere'), MOSS, 'the list page counts 12 from step 3a');
  eq(PL.listCount({ journal: {} }, D, 'mossmere'), { have: 0, need: 12 }, 'a fresh save: 0 of 12');
  ok(!V3.SPECIES.some((s) => ['kissmark_trout', 'thousandcast_pike', 'hullkiss_lamprey'].includes(s.id)) && !V3P4.SPECIES.some((s) => ['kissmark_trout', 'thousandcast_pike', 'hullkiss_lamprey'].includes(s.id)), 'off the loop: no Kissmark Trout and no giant');
  for (const id of ['thousandcast_pike', 'hullkiss_lamprey']) {
    const g = D.SPECIES_BY_ID[id], f = ROSTER.fish.find((x) => x.id === id);
    ok(g.rarity === 'epic' && g.giant === true && g.place === RS.placeIdOf(f.placeName) && g.kind === f.place, `${id}: an epic giant whose place is its placeName's (${g.place})`);
  }
  ok(RS.placeIdOf('Under the Span') === 'under_the_span' && RS.placeIdOf('the Buoy Lights') === 'buoy_lights', 'placeIdOf: a roster place name as its place id');
  ok(D.SPECIES_BY_ID.gloam_eel.bait === 'lumen_moss' && D.SPECIES_BY_ID.gloam_eel.size.L50 === 72 && D.SPECIES_BY_ID.gloam_eel.kind === 'night' && !('kind' in D.SPECIES_V3_BY_ID.gloam_eel),
    'the Gloam Eel stays its built record, on its one tin, in night water (step 3a\'s water, step 4\'s bait)');
  const R = Object.fromEntries(ROSTER.fish.map((f) => [f.id, f]));
  for (const s of D.SPECIES_LOOP) {
    const f = R[s.id];
    if (f) {
      ok(s.size.L50 === f.sizeModel.L50 && s.size.sigma === f.sizeModel.sigma && s.rarity === f.rarity && s.family === f.family && s.time === RS.hourKey(f.hours) && s.style === RS.styleOf(f), `${s.id}: the roster's size, rarity, family, hours and style`);
      ok(D.FISH_SHAPES.includes(s.model.shape) && s.model.shape === (D.SPECIES_V3_BY_ID[s.id]?.model.shape ?? f.bodyPlan), `${s.id}: drawn on its plan (${s.model.shape})`);
    } else ok(D.LOOP.kept.includes(s.id) && s.size.L50 === D.SPECIES_V3_BY_ID[s.id].size.L50, `${s.id}: a built species the roster keeps, at its built size`);
    ok(s.size.k === D.BALANCE_V3.size.k[s.size.body], `${s.id}: k is its body's (${s.size.body})`);
    eq(s.depth, [0, 1], `${s.id}: any depth under the loop (the converter's rule; the sim has no cast depth)`);
  }
  for (const id of ['likely_chub', 'overbold_bass', 'rustfin_sucker', 'milkeye_perch']) {
    const s = D.SPECIES_BY_ID[id];
    ok(s.lore === R[id].journal && s.hint === R[id].haunt && s.src === 'roster' && s.model === s.model && D.ROSTER_ART[id], `${id}: a new fish: its Journal line and haunt from the roster, its drawing from ROSTER_ART`);
  }
  ok(D.SPECIES_BY_ID.dusk_minnow.lore === D.SPECIES_V3_BY_ID.dusk_minnow.lore && JSON.stringify(D.SPECIES_BY_ID.reedjaw_pike.model) === JSON.stringify(D.SPECIES_V3_BY_ID.reedjaw_pike.model), 'a re-founded species keeps its built model and lore (SPEC §13 rule 1)');
  eq(D.ROSTER_ART.rustfin_sucker.model.barbels, 'none', 'the Rustfin Sucker has no barbels (ROSTER: "No barbels")');
}

section('the worked values on roster sizes (SPEC §4.1)');
{
  const S = D.SPECIES_BY_ID;
  eq(D.fishClams(S.dusk_minnow, 0.4), 7, 'a Keeper Dusk Minnow (z 0.4): 7');
  eq(D.fishClams(S.weeping_carp, 0.4), 26, 'a Keeper Weeping Carp: 26');
  eq([1.4, 2.2, 2.95].map((z) => D.fishClams(S.reedjaw_pike, z)), [158, 406, 1022], 'a Reedjaw Pike at Prize, Trophy, Elder: 158 / 406 / 1,022');
}

section('the phase pin: the Lampsipper lifted, no other phase-2 record (M1.md §2.3)');
{
  eq(D.V3_PHASE, 1, 'the loop pins GW_V3_PHASE 1');
  eq(D.SPECIES.filter((s) => (s.phase ?? 1) > 1).map((s) => s.id), ['lampsipper', 'bridgechain_sturgeon'], 'the Lampsipper and (M1 step 3a) the Bridgechain are the phase-2 records in loop SPECIES');
  const bc = D.SPECIES_BY_ID.bridgechain_sturgeon;
  ok(bc.loopLift === true && !('weather' in bc) && bc.place === 'under_the_span' && bc.model.shape === 'sturgeon' && bc.model.scutes === 'rust' && bc.model.snout === 'shovel' && !('scutes' in D.SPECIES_V3_BY_ID.bridgechain_sturgeon.model),
    'the Bridgechain lifted: its place, no weather, its sturgeon plan\'s scutes and snout (the built record untouched)');
  ok(D.SPECIES_BY_ID.lampsipper.loopLift === true && D.SPECIES_BY_ID.lampsipper.time === 'gloom', 'its record lifted as built (night only)');
  ok(!V3.SPECIES.some((s) => s.id === 'lampsipper'), 'v3 phase 1 without the loop: no Lampsipper (unchanged)');
}

section('weights in pounds within ±30% of each cousin (pounds SPEC §6.4)');
{
  for (const s of D.SPECIES_LOOP) {
    const f = ROSTER.fish.find((x) => x.id === s.id);
    if (!f) continue;
    const w = s.size.k * s.size.L50 ** 3 / 1000, r = f.refWeight.kg * (s.size.L50 / f.refWeight.cm) ** 3;
    ok(Math.abs(w / r - 1) <= 0.3, `${s.id}: ${D.fmtWeight(w)} at its L50 against its cousin's ${D.fmtWeight(r)} (${Math.round((w / r - 1) * 100)}%)`);
  }
  eq(D.BALANCE_V3.size.k.slimperch, 0.0095, 'the Milkeye Perch\'s body key (perch would be +37%)');
  eq(D.BALANCE_V3.size.k.sucker, 0.011, 'the Rustfin Sucker\'s body key (carp would be +45%)');
  ok(!('slimperch' in V3.BALANCE_V3.size.k) && !('sucker' in V3P4.BALANCE_V3.size.k), 'the loop\'s keys are merged under the loop only');
  eq(D.fmtWeight(D.sizeWeight(D.SPECIES_BY_ID.likely_chub, 37.7)), '1 lb 9 oz', 'a weight is told in pounds and ounces (a typical Likely Chub)');
}

section('LOOP.shipped: the Mossmere; Sporewood never offered (decision 39)');
{
  eq(D.LOOP.shipped, 'mossmere', 'LOOP.shipped');
  ok(D.loopShipped('mossmere') && !D.loopShipped('sporewood') && D.loopShippedOrder() === 1, 'loopShipped: the Mossmere ships, Sporewood is sealed');
  // a later LOOP.waters with Sporewood in it (step 3's shape), its map on the shelf: never offered while LOOP.shipped is the Mossmere
  const DD = { ...D, LOOP: { ...D.LOOP, waters: { ...D.LOOP.waters, sporewood: { order: 2, tier: 11, prices: {} } } } };
  ok(PL.waterShipped(DD, 'mossmere') && !PL.waterShipped(DD, 'sporewood'), 'waterShipped: Sporewood (order 2) is past the Mossmere');
  ok(PL.waterShipped({ ...DD, LOOP: { ...DD.LOOP, shipped: 'sporewood' } }, 'sporewood'), '… and ships once LOOP.shipped is Sporewood');
  for (const lakes of [['mossmere'], ['mossmere', 'sporewood']]) {
    const items = PL.shelfItems(DD, { ...PL.freshLoop(DD), clams: 1e9, maps: { lakes, places: [] } });
    ok(!items.some((i) => i.tab === 'maps' || /sporewood/.test(i.id)), `the shelf offers no Sporewood map (lakes ${lakes.join(', ')})`);
  }
  const src = fs.readFileSync(new URL('../../src/progression-loop.js', import.meta.url), 'utf8');
  ok(src.includes("!(it.tab === 'maps' && it.water && !waterShipped(D, it.water))") && src.includes('waterShipped(D(), waterId) && (L.maps?.lakes'), 'the shelf drops a map past LOOP.shipped; no trip opens a water past it');
}

section('off the loop nothing changes (the v3 fingerprint covers SPECIES; SPECIES_LOOP is empty)');
{
  eq(V1.SPECIES_LOOP.length + V3.SPECIES_LOOP.length + V3P4.SPECIES_LOOP.length, 0, 'SPECIES_LOOP is empty in v1, v3 phase 1 and v3 phase 4');
  ok(V3.SPECIES_BY_ID.reedjaw_pike.size.L50 === 70 && V1.SPECIES_BY_ID.reedjaw_pike.weight[1] === 9 && !V3.SPECIES_BY_ID.likely_chub, 'the built sizes stand off the loop; no roster fish there');
  ok(!('overbold_bass' in V3.AUTOFISH.leaps) && D.AUTOFISH.leaps.overbold_bass === 0.3, 'the bass leaps under the loop only');
}

console.log(`roster-species: ${pass} passed, ${fail} failed`);
if (fail) { for (const f of failures) console.log('  - ' + f); process.exit(1); }
