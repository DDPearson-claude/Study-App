// M1 step 3a's places, giants and legend in the data and the ledger's pure half (docs/loop/m1-step3a/PLAN.md §1.2, lane A): T101 the
// four places, T102 the Mossmere's 17, T103 the list's twelve, T105 the giants' share, T106 the giants' land chance, T107 the
// Matriarch's, T108 the shelf through every buying order, T109 mapCards is the one rule, T115 the catalogue, T116 the seals, T120 the
// flag-off build. (T104, the game's pool against the sim's, is a printed check of tools/sim/clams.mjs; T110–T114 and T117 are
// loop-trip.test.mjs's, through the real progression.)
//   node tools/tests/loop-places.test.mjs   (or node tools/check.mjs)
import * as dataV1 from '../../src/data.js';               // evaluated first: no flags → the flag-off build
import * as PL from '../../src/progression-loop.js';

globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
const dataV3 = await import('../../src/data.js?places-v3');          // v3 at phase 1, no loop
globalThis.GW_V3_PHASE = 2;
const dataV3p2 = await import('../../src/data.js?places-v3p2');      // v3 at phase 2, no loop (the Mossmere's v3 places as built)
const { loadLoopData, freshLoopMeta, placesMeta, fakeLoop } = await import('./loop-fixture.mjs');
const D = await loadLoopData({ query: 'loop-places' });

let pass = 0, fail = 0;
const failures = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; failures.push(msg); console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const section = (s) => console.log(`- ${s}`);
const clone = (o) => JSON.parse(JSON.stringify(o));
const SP = (id) => D.SPECIES_BY_ID[id];
const FOUR = ['lily_maze', 'under_the_span', 'buoy_lights', 'bell_pool'];
const DROPPED = ['rule', 'attract', 'maxClass', 'giantsKept', 'holdsGiants', 'giantsWhile', 'giantsDuring', 'reveal', 'tally', 'tallyAt', 'legend', 'night', 'phase'];
/** A seeded generator (mulberry32), the sim's. */
const rng = (seed) => { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
/** n seeded draws from a placePool result: the share of each species id. */
function draws(pool, n, seed) {
  const r = rng(seed), list = [...pool.list, ...(pool.giant ? [[pool.giant.sp, pool.giant.weight]] : [])], out = new Map();
  for (let i = 0; i < n; i++) {
    let x = r() * pool.tot, got = list[list.length - 1][0];
    for (const [s, w] of list) { x -= w; if (x <= 0) { got = s; break; } }
    out.set(got.id, (out.get(got.id) || 0) + 1);
  }
  return (id) => (out.get(id) || 0) / n;
}
const T1 = { rod: 1, line: 1, reel: 1 };

// =====================================================================================
section('T101: the four places (LOOP.places, loopPlace, the arena\'s keep list, PLACES)');
{
  // (LOST-TACKLE §5: the four, then Veilback Brook, a secret place shown by a lost notebook: never a map, never priced)
  eq(D.loopPlaceIds('mossmere'), [...FOUR, 'veilback_brook'], 'LOOP.places holds exactly the four, in the Chart\'s order, then the secret brook');
  eq(Object.keys(D.LOOP.places).filter((id) => D.LOOP.places[id].water !== 'mossmere'), ['lullaby', 'gill_harp', 'veilwater', 'mothers_cup'], 'LAKE 2 (lane D1): every other place is Sporewood\'s four, in its Chart\'s order');
  eq(D.loopPlaceIds('mossmere'), [...FOUR, 'veilback_brook'], 'loopPlaceIds(mossmere): the Chart\'s order');
  ok(D.LOOP.places.veilback_brook.secret === true && D.LOOP.places.veilback_brook.price === 0 && D.LOOP.places.veilback_brook.revealedBy === 'veil_notebook' && D.LOOP.lostTackle.veil_notebook.reveals === 'veilback_brook', 'the brook: secret, free, shown by the Veil Angler\'s Notebook');
  eq(D.loopPlaceIds('glasswater'), [], 'loopPlaceIds of a water with no place map: none');
  eq(FOUR.map((id) => D.LOOP.places[id].kind), ['day', 'old', 'night', 'crown'], 'their kinds: day, old, night, crown');
  eq(FOUR.map((id) => D.LOOP.places[id].price), FOUR.map((id) => D.LOOP.waters.mossmere.prices[D.LOOP.places[id].kind]), "each price is LOOP.waters.mossmere.prices[kind]");
  eq(FOUR.map((id) => D.LOOP.places[id].price), [60, 150, 260, 500], '60, 150, 260, 500');
  for (const id of FOUR) {
    const p = D.loopPlace(id), src = D.MOSSMERE_V3.places.find((q) => q.id === id);
    ok(p && p.id === id && p.name === src.name && p.x === src.x && p.z === src.z && JSON.stringify(p.area) === JSON.stringify(src.water) && JSON.stringify(p.landmark) === JSON.stringify(src.landmark)
      && p.look === src.look && p.build === src.build && p.water === 'mossmere' && p.zone === 'mossmere' && p.kind === D.LOOP.places[id].kind && p.price === D.LOOP.places[id].price,
    `loopPlace(${id}): MOSSMERE_V3's geometry, name, landmark, look and build under LOOP.places' fields`);
    ok(DROPPED.filter((k) => !(k in D.LOOP.places[id])).every((k) => !(k in p)), `loopPlace(${id}) carries no v3 rule (only LOOP.places' own fields: the crown's legend)`);
    const a = D.loopPlace(id); a.area.x = 999; a.landmark.x = 999;
    ok(D.loopPlace(id).area.x !== 999 && D.MOSSMERE_V3.places.find((q) => q.id === id).water.x !== 999, `loopPlace(${id}) is a fresh object (the record is never touched)`);
  }
  ok(D.loopPlace('nowhere') === null && D.loopPlace(null) === null && D.loopPlace('cupped_hands') === null, 'loopPlace of an id LOOP.places does not hold: null');
  const arena = D.ZONES[0].arena.places;
  eq(arena.map((p) => p.id), [...FOUR, 'veilback_brook'], 'under the loop the Mossmere\'s arena places are the four and the brook');
  eq(D.PLACES.map((p) => p.id), [...FOUR, 'veilback_brook'], '… and so are PLACES');
  ok(FOUR.every((id) => D.PLACE_BY_ID[id]?.kind === D.LOOP.places[id].kind && D.PLACE_BY_ID[id].zone === 'mossmere'), 'PLACE_BY_ID: each with its loop kind and its zone');
  for (const p of arena) ok(DROPPED.every((k) => !(k in p)) && Object.keys(p).every((k) => [...D.LOOP_PLACE_KEYS, 'kind', 'zone'].includes(k)), `the arena's ${p.id}: the keep list only (${DROPPED.length} v3 fields dropped)`);
  ok(!('places' in D.LOOP.waters.mossmere), 'LOOP.waters.mossmere has no places (a lake map opens none of them)');
  const v2 = { loop: { v: 2, clams: 5, maps: ['mossmere'] } };
  PL.migrateLoop(v2, D);
  eq(v2.loop.maps.places, [], 'migrateLoop on a v2 block owning the Mossmere gives no place (rule 5 stays a no-op)');
  ok(D.placeAtV3('mossmere', -40.5, 24.5)?.id === 'lily_maze' && D.placeAtV3('mossmere', -4, -14)?.id === 'bell_pool', 'placeAtV3 finds the loop\'s places in the arena');
}

// =====================================================================================
section('T102: the Mossmere\'s 17 under the loop (SPECIES, the converter, the Bridgechain lifted, the Gloam Eel\'s night water)');
{
  const MS = D.SPECIES.filter((s) => s.zone === 'mossmere');
  eq(MS.length, 17, 'loop SPECIES holds 17 Mossmere fish');
  eq(new Set(MS.map((s) => s.id)).size, 17, '… each once');
  const want = [...D.LOOP.species.mossmere, 'bridgechain_sturgeon', 'thousandcast_pike', 'hullkiss_lamprey', 'gloam_eel', 'belled_matriarch'];
  eq(MS.map((s) => s.id).sort(), want.slice().sort(), 'the twelve, the Bridgechain, the two giants, the Gloam Eel and the Matriarch');
  const tp = SP('thousandcast_pike'), hl = SP('hullkiss_lamprey'), kt = SP('kissmark_trout');
  eq([tp.rarity, hl.rarity, kt.rarity], ['epic', 'epic', 'uncommon'], 'the converter\'s three: epic, epic, uncommon');
  eq([tp.model.shape, hl.model.shape, kt.model.shape], ['pike', 'lamprey', 'trout'], 'on the pike, lamprey and trout plans');
  ok(tp.giant === true && tp.place === 'under_the_span' && hl.giant === true && hl.place === 'buoy_lights' && !kt.giant && !kt.place && (kt.kind ?? 'open') === 'open',
    'the giants carry giant and their place; the Kissmark Trout is open water\'s');
  eq([D.loopHours(tp), D.loopHours(hl), D.loopHours(kt)], [['dusk', 'night'], ['night'], ['day', 'dusk', 'night']], "the Thousandcast's dusk and night, the Hullkiss's night, the Kissmark Trout's every light");
  const bc = SP('bridgechain_sturgeon'), bcV3 = D.SPECIES_V3_BY_ID.bridgechain_sturgeon;
  ok(bc.loopLift === true && !('weather' in bc) && bc.place === 'under_the_span' && bc.model.shape === 'sturgeon' && bc.model.scutes === 'rust' && bc.model.snout === 'shovel' && bc.rarity === bcV3.rarity
    && JSON.stringify(bc.size) === JSON.stringify(bcV3.size) && 'weather' in bcV3 && !('scutes' in bcV3.model), 'the Bridgechain: lifted past the phase pin, no weather, its plan parameters; the built record untouched');
  const ge = SP('gloam_eel'), geV3 = D.SPECIES_V3_BY_ID.gloam_eel;
  ok(ge.kind === 'night' && ge.bait === geV3.bait && ge.bait === 'lumen_moss' && ge.time === geV3.time && JSON.stringify(ge.size) === JSON.stringify(geV3.size) && !('kind' in geV3) && !ge.place,
    "the Gloam Eel as built but for kind 'night' (its bait, hour and size as built)");
  const bm = SP('belled_matriarch');
  // (M1 step 4: her plan is the catfish, loop-4.test.mjs's; every other field as built)
  ok(bm.rarity === 'legendary' && bm.bait === 'heartmoss' && JSON.stringify({ ...bm, model: null }) === JSON.stringify({ ...D.SPECIES_V3_BY_ID.belled_matriarch, model: null }), 'the Matriarch as built (but her plan)');
  eq(D.SPECIES.filter((s) => (s.phase ?? 1) > 1).map((s) => s.id), ['lampsipper', 'bridgechain_sturgeon'], 'no other phase-2 record (the Lampsipper and the Bridgechain lifted)');
  eq(D.SPECIES_LOOP.map((s) => s.id), [...D.LOOP.species.mossmere, 'bridgechain_sturgeon', 'thousandcast_pike', 'hullkiss_lamprey'], 'SPECIES_LOOP: the twelve, then the places\' own fish and giants in the Chart\'s order');
  ok(D.FISH_SHAPES.includes('lamprey') && D.FISH_SHAPES.includes('sturgeon') && D.FISH_SHAPES.includes('trout'), 'FISH_SHAPES: the three new plans under the loop');
  ok(D.AUTOFISH.show.poseRules.thin.includes('lamprey') && D.AUTOFISH.show.poseRules.thin.includes('eel'), 'the lamprey hangs as the eel does (poseRules.thin)');
  for (const id of ['thousandcast_pike', 'hullkiss_lamprey', 'kissmark_trout']) ok(D.ROSTER_ART[id]?.model?.glow === null, `${id}: no glow on its body (ROSTER §3.1)`);
  ok(D.ROSTER_ART.hullkiss_lamprey.model.gills === 7 && D.ROSTER_ART.hullkiss_lamprey.model.mouth === 'disc' && D.ROSTER_ART.kissmark_trout.model.fattyFin === true && D.ROSTER_ART.thousandcast_pike.model.bars === 'upright',
    'the plan parameters D builds against (the lamprey\'s seven gills and disc mouth, the trout\'s fatty fin, the pike\'s upright bars)');
}

// =====================================================================================
section('T103: the list is the twelve, with the places in PLACES');
{
  const list = PL.listFor(D, 'mossmere');
  eq(list, D.LOOP.species.mossmere, "listFor(mossmere): SPEC §5.5 (c)'s twelve, in order");
  ok(list.length === 12 && list.includes('kissmark_trout'), 'twelve, the Kissmark Trout among them');
  for (const id of ['thousandcast_pike', 'hullkiss_lamprey', 'belled_matriarch', 'bridgechain_sturgeon', 'gloam_eel']) ok(!list.includes(id), `never ${id}`);
  ok(D.PLACES.length === 5, '… with the four places and the brook in PLACES');
  eq(PL.listCount({ journal: {} }, D, 'mossmere'), { have: 0, need: 12 }, 'listCount needs 12');
  const opened = { ...D, LOOP: { ...D.LOOP, waters: { ...D.LOOP.waters, mossmere: { ...D.LOOP.waters.mossmere, places: [{ id: 'under_the_span', kind: 'old' }] } } } };
  const l2 = PL.listFor(opened, 'mossmere');
  ok(l2.length === 13 && l2.includes('bridgechain_sturgeon') && !l2.includes('thousandcast_pike') && !l2.includes('gloam_eel'), 'a water whose lake map opens an old place counts that place\'s own fish (never its giant)', l2);
  const night = { ...D, LOOP: { ...D.LOOP, waters: { ...D.LOOP.waters, mossmere: { ...D.LOOP.waters.mossmere, places: [{ id: 'buoy_lights', kind: 'night' }] } } } };
  ok(!PL.listFor(night, 'mossmere').includes('gloam_eel'), 'night water is never a list kind (the Gloam Eel stays off)');
}

// =====================================================================================
section('T105: a giant\'s share of the bites at its place (20,000 seeded draws of placePool)');
{
  const N = 20000;
  const at = (placeId, phase, wickId = null, seed = 7) => draws(D.placePool(D.SPECIES, { placeId, phase, wickId }), N, seed);
  for (const ph of ['dusk', 'gloomtide']) {
    const s = at('under_the_span', ph, null, ph === 'dusk' ? 11 : 12)('thousandcast_pike');
    ok(Math.abs(s - 0.06) <= 0.01, `the Thousandcast at Under the Span at ${ph}: ${(s * 100).toFixed(2)}% (6% ± 1)`);
  }
  const day = at('under_the_span', 'calm', null, 13)('thousandcast_pike');
  ok(Math.abs(day - 0.025) <= 0.007, `the Thousandcast by day (its offHour share, SPEC decision 7): ${(day * 100).toFixed(2)}% (2.5% ± 0.7)`);
  const hn = at('buoy_lights', 'gloomtide', null, 14)('hullkiss_lamprey');
  ok(Math.abs(hn - 0.06) <= 0.01, `the Hullkiss at the Buoy Lights at night: ${(hn * 100).toFixed(2)}% (6% ± 1)`);
  for (const ph of ['calm', 'dusk']) ok(at('buoy_lights', ph, null, 15)('hullkiss_lamprey') === 0 && !D.placePool(D.SPECIES, { placeId: 'buoy_lights', phase: ph }).giant, `the Hullkiss absent before dark (${ph}: night water is open water)`);
  const tap = at('under_the_span', 'dusk', 'taper', 16)('thousandcast_pike');
  ok(Math.abs(tap - 0.078) <= 0.01, `Taper meets the Thousandcast ×1.3: ${(tap * 100).toFixed(2)}% (7.8% ± 1)`);
  for (const ph of ['calm', 'dusk', 'gloomtide']) for (const id of FOUR) {
    const g = D.placePool(D.SPECIES, { placeId: id, phase: ph, wickId: 'taper' }).giant;
    if (g) ok(g.share <= D.LOOP.wicks.taper.giantCap + 1e-12, `Taper's giant share at ${id} ${ph} never above ${D.LOOP.wicks.taper.giantCap * 100}%`);
  }
  eq(D.giantShare(SP('thousandcast_pike'), 'dusk', 'taper'), Math.min(D.LOOP.wicks.taper.giantCap, 0.06 * D.LOOP.wicks.taper.giantShare), 'giantShare: Taper ×giantShare, capped');
  const capped = { ...D.LOOP.wicks.taper }; D.LOOP.wicks.taper.giantShare = 9;
  ok(D.giantShare(SP('thousandcast_pike'), 'dusk', 'taper') === D.LOOP.wicks.taper.giantCap, 'a Taper share past the cap reads the cap');
  Object.assign(D.LOOP.wicks.taper, capped);
  for (const ph of ['calm', 'dusk', 'gloomtide']) {
    const open = D.placePool(D.SPECIES, { placeId: null, phase: ph });
    ok(!open.giant && !open.list.some(([s]) => s.giant || s.place || (s.kind && s.kind !== 'open')), `open water at ${ph}: no giant, nothing of a place or a kind of place`);
    for (const id of ['lily_maze', 'bell_pool']) ok(!D.placePool(D.SPECIES, { placeId: id, phase: ph }).giant, `no giant at ${id} (${ph})`);
    ok(D.placePool(D.SPECIES, { placeId: 'under_the_span', phase: ph }).giant?.sp.id === 'thousandcast_pike' && !D.placePool(D.SPECIES, { placeId: 'under_the_span', phase: ph }).list.some(([s]) => s.id === 'hullkiss_lamprey'), `Under the Span at ${ph}: its own giant only`);
  }
  const lily = D.placePool(D.SPECIES, { placeId: 'lily_maze', phase: 'calm' }), openDay = D.placePool(D.SPECIES, { placeId: null, phase: 'calm' });
  const w = (pool, id) => pool.list.find(([s]) => s.id === id)?.[1] ?? 0;
  ok(Math.abs(w(lily, 'candlefin_koi') / w(openDay, 'candlefin_koi') - 3) < 1e-9 && Math.abs(w(lily, 'weeping_carp') / w(openDay, 'weeping_carp') - 1.5) < 1e-9 && Math.abs(w(lily, 'dusk_minnow') / w(openDay, 'dusk_minnow') - 0.5) < 1e-9,
    "the Lily Maze's draws: the koi ×3, the carp ×1.5, a common ×0.5");
  const span = D.placePool(D.SPECIES, { placeId: 'under_the_span', phase: 'dusk' });
  ok(Math.abs(w(span, 'bridgechain_sturgeon') - (D.RARITY_WEIGHTS.rare * D.LOOP.place.kept.weight * D.LOOP.place.kept.live)) < 1e-9 && !w(openDay, 'bridgechain_sturgeon'), "the Bridgechain bites only under the Span (a rare's weight × kept)");
  const eel = (o) => D.placePool(D.SPECIES, o).list.some(([s]) => s.id === 'gloam_eel');
  ok(eel({ placeId: 'buoy_lights', phase: 'gloomtide', bait: 'lumen_moss' }) && !eel({ placeId: 'buoy_lights', phase: 'gloomtide' }) && !eel({ placeId: null, phase: 'gloomtide', bait: 'lumen_moss' })
    && !eel({ placeId: 'buoy_lights', phase: 'dusk', bait: 'lumen_moss' }), 'the Gloam Eel: the Buoy Lights after dark on Lumen Moss only');
  ok(!D.SPECIES.filter((s) => s.zone === 'mossmere').some((s) => s.rarity === 'legendary' && ['calm', 'dusk', 'gloomtide'].some((ph) => D.placePool(D.SPECIES, { placeId: 'bell_pool', phase: ph, bait: 'heartmoss' }).list.some(([x]) => x.id === s.id))),
    'the legend is never in a pool (her sure bite is her own)');
}

// =====================================================================================
section('T106: the giants\' land chance (T1, Prize; Elders; their price)');
{
  const pPrize = (id) => D.catchChance(id, 'prize', T1);
  for (const id of ['thousandcast_pike', 'hullkiss_lamprey']) {
    const p = pPrize(id);
    ok(p >= 0.265 && p <= 0.275, `${id} at Prize on T1: ${(p * 100).toFixed(2)}% (the sim's 27% ± 0.5)`);
    const others = D.SPECIES.filter((s) => s.zone === 'mossmere' && s.id !== id && !s.giant && s.rarity !== 'legendary');
    const lower = others.filter((s) => (pPrize(s.id) ?? 1) <= p).map((s) => s.id);
    ok(!lower.length, `${id} lands less often than every other Mossmere fish at Prize on T1`, lower);
    const e = D.catchParts(id, 'elder', T1), pr = D.catchParts(id, 'prize', T1), rare = { ...SP(id), rarity: 'rare', id: `${id}_as_rare` };
    const re = D.catchParts(rare, 'elder', T1), rp = D.catchParts(rare, 'prize', T1);
    ok(e && pr && re && rp && Math.abs((e.fight - pr.fight) - (re.fight - rp.fight) - D.LOOP.giant.elderFight) < 1e-9, `${id}: an Elder giant +${D.LOOP.giant.elderFight} Fight over a rare's Elder step`);
    ok(Math.abs(pr.fight - rp.fight - (D.LOOP.giant.fight - D.CATCH_V3.kept)) < 1e-9, `${id}: its Fight is a rare's + LOOP.giant.fight, net of the place-kept term`);
  }
  eq([0.4, 2.2].map((zz) => D.fishClams(SP('thousandcast_pike'), zz)), [150, 944], 'a Keeper Thousandcast sells 150, a Trophy 944 (M1.md §2.4)');
}

// =====================================================================================
section('T107: the Matriarch\'s try (T1, wounds)');
{
  const p0 = D.catchChance('belled_matriarch', 'legend', T1);
  ok(p0 >= 0.265 && p0 <= 0.275, `the Matriarch on T1: ${(p0 * 100).toFixed(2)}% (the sim's 27% ± 0.5)`);
  const ws = [0, 1, 2, 3, 4, 9].map((w) => D.catchChance('belled_matriarch', 'legend', T1, { wounds: w }));
  ok(ws.every((p, i) => i === 0 || p >= ws[i - 1]) && ws.every((p) => p <= 0.5) && ws[3] === ws[4] && ws[4] === ws[5], 'each escape +6 Hold to +18 (three counted), never above 50%', ws.map((p) => p.toFixed(3)));
  const ml = PL.freshLoop(D);
  ok(PL.shelfItems(D, ml).find((i) => i.id === 'bait:heartmoss')?.price === 60 && D.BAITS.find((b) => b.id === 'heartmoss').price === 40, 'the ball is 60 on the loop\'s shelf; the built BAITS row keeps its 40');
}

// =====================================================================================
section('T108: the shelf, walked through every buying order of the maps (≤ 3 map cards, the Bell Pool last of the four to appear, Hold 6, the ball)');
{
  const tabOf = (items, t) => items.filter((i) => i.tab === t);
  let orders = 0, refused = 0;
  const perm = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) => perm([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p])));
  for (const order of perm(FOUR)) {
    const m = placesMeta(D, { holdSlots: 5 }); m.loop.clams = 99999;
    const L = fakeLoop({ D, state: { clams: 99999, holdSlots: 5, journal: m.journal } });
    let allowed = true;
    for (const id of order) {
      const items = L.shelf().tabs.flatMap((t) => t.items), maps = tabOf(items, 'maps');
      ok(maps.length <= 3 && maps[maps.length - 1]?.id === 'lake:sporewood', `${order.join('>')}: ≤ 3 map cards, Sporewood's last`);
      const owned = L.s.maps.places;
      if (maps.some((c) => c.id === 'place:bell_pool')) ok(owned.filter((p) => p !== 'bell_pool').length >= 2, `${order.join('>')}: the Bell Pool's card only once two cheaper maps are owned`);
      if (!maps.some((c) => c.id === `place:${id}` && !c.bought)) { allowed = false; refused++; ok(L.buy(`place:${id}`).ok === false, `${order.join('>')}: ${id} not offered yet, refused`); break; }
      const before = L.s.clams;
      ok(L.buy(`place:${id}`).ok === true && L.s.clams === before - D.LOOP.places[id].price && L.s.maps.places.filter((p) => p === id).length === 1, `${order.join('>')}: buy place:${id} owns it once, for its price`);
      ok(L.buy(`place:${id}`).ok === false, `${order.join('>')}: a second buy of ${id} is refused`);
      const after = tabOf(L.shelf().tabs.flatMap((t) => t.items), 'maps');
      ok(after.length <= 3 && after.some((c) => c.id === `place:${id}` && c.bought), `${order.join('>')}: the bought map keeps its slot as Yours. while the shelf is open`);
      L.s.session = [];   // the shelf closes
    }
    if (allowed) {
      orders++;
      eq(tabOf(L.shelf().tabs.flatMap((t) => t.items), 'maps').map((c) => c.id), ['lake:sporewood'], `${order.join('>')}: all four owned, only the sealed card is left`);
    }
  }
  console.log(`  the walk: ${orders} buying orders of the four maps allowed, ${refused} refused`);
  ok(orders >= 2 && refused >= 1, `the walk: ${orders} buying orders allowed, ${refused} refused (a dearer map before it is offered)`);
  // Hold 6 after Hold 5; the ball; the sealed card
  const L = fakeLoop({ D, state: { clams: 1550, holdSlots: 5 } });
  const no4 = (items) => items.filter((i) => !(/^(lure|tin|cut|oars|keel|lantern|orders):/.test(i.id)));   // (M1 step 4's cards: loop-4.test.mjs's)
  const raft = () => no4(L.shelf().tabs.find((t) => t.id === 'raft').items);
  eq(raft().map((i) => [i.id, i.price, i.name]), [['hold:6', 1000, 'Wellbox']], 'Hold 6, the Wellbox, at 1,000 after Hold 5');
  ok(L.buy('hold:6').ok && L.s.holdSlots === 6 && L.s.clams === 550, 'buy Hold 6');
  L.s.session = [];
  eq(raft().map((i) => [i.id, i.bought]), [['hold:6', true]], 'Hold 6 is the shelf\'s last hold step: a permanent Yours. (shelfMax 6)');
  const bait = () => no4(L.shelf().tabs.find((t) => t.id === 'bait').items);
  eq(bait().map((i) => [i.id, i.price, i.name, i.line, i.count, i.consumable, i.bought]), [['bait:heartmoss', 60, 'Heartmoss Ball', D.TEXT_LOOP.shelf.heartmoss, 0, true, false]], 'the Bait tab: the Heartmoss Ball, 60, its line, a consumable with its count');
  ok(L.buy('bait:heartmoss').ok && L.buy('bait:heartmoss').ok && L.s.bag.heartmoss === 2, 'two balls bought: two in the bag');
  ok(bait()[0].bought === false && bait()[0].count === 2 && !L.s.session.includes('bait:heartmoss'), 'a consumable never reads Yours. (its count grows)');
  ok(L.buy('lake:sporewood').ok === false && L.s.clams === 430, "Sporewood's sealed card is refused (no price, no buy)");
  const g = L.goal();
  ok(g && g.id !== 'bait:heartmoss' && g.id !== 'lake:sporewood', 'the goal line never names the ball or the sealed card', g);
  const all = placesMeta(D, { own: FOUR, holdSlots: 6, tackle: { rod: 2, line: 2, reel: 2 } });
  eq(PL.goalOf(no4(PL.shelfItems(D, all.loop)).filter((i) => i.tab !== 'home')), null, 'the empty shelf (step 3\'s): no goal line, though the ball and the sealed card are still there (M1 step 5b: the Home tab aside)');
  ok(PL.shelfItems(D, all.loop).some((i) => i.id === 'bait:heartmoss') && PL.shelfItems(D, all.loop).some((i) => i.id === 'lake:sporewood'), '… the ball is always on the shelf, and Sporewood\'s card reads "Coming soon"');
  // the shelf's ids for 3b's priced blots: a place card names its place and its fish
  const fresh = PL.shelfItems(D, PL.freshLoop(D)).filter((i) => i.slot === 'place');
  eq(fresh.map((i) => [i.placeId, i.name, i.fish, i.line, i.kind]), [['lily_maze', 'The Lily Maze', 'candlefin_koi', D.TEXT_LOOP.maps.lily_maze, 'day'], ['under_the_span', 'Under the Span', 'thousandcast_pike', D.TEXT_LOOP.maps.under_the_span, 'old']], 'a place card: its place, name, fish, line and kind');
}

// =====================================================================================
section('T109: mapCards is the one rule (the shelf\'s Maps tab is exactly its cards)');
{
  for (const own of [[], ['lily_maze'], ['lily_maze', 'under_the_span'], ['under_the_span', 'buoy_lights'], ['lily_maze', 'under_the_span', 'buoy_lights'], FOUR]) {
    const m = placesMeta(D, { own, caught: ['dusk_minnow', 'kissmark_trout'] });
    const cards = PL.mapCards(D, m.loop, { meta: m }), shelf = PL.shelfItems(D, m.loop, [], { meta: m }).filter((i) => i.tab === 'maps');
    eq(shelf.map((i) => [i.id, i.price]), cards.map((c) => [c.id, c.price]), `own [${own.join(', ')}]: the Maps tab is mapCards' cards, prices included`);
    eq(shelf.find((i) => i.sealed)?.seals, cards.find((c) => c.sealed)?.seals, `own [${own.join(', ')}]: the sealed card's seals are mapCards'`);
    ok(cards.length <= 3, `own [${own.join(', ')}]: at most three cards`);
  }
  const m = placesMeta(D, { caught: ['dusk_minnow', 'kissmark_trout'] });
  eq(PL.mapCards(D, m.loop, { meta: m }).find((c) => c.sealed).seals.catch, { held: false, have: 2, need: 12 }, "the sealed card's catch seal counts the journal given in {meta}");
  eq(PL.mapCards(D, m.loop).find((c) => c.sealed).seals.catch.have, 0, '… and none without it');
  const tut = PL.mapCards(D, PL.freshLoop(D));
  eq(tut.map((c) => c.id), ['place:lily_maze', 'place:under_the_span', 'lake:sporewood'], 'a fresh save: the Lily Maze, Under the Span, then Sporewood');
  eq(tut[0].hours, ['sun', 'dusk'], "the Lily Maze's card: the koi's day and dusk glyphs");
  eq(tut[1].hours, ['dusk', 'moon'], "Under the Span's card: the Thousandcast's dusk and moon glyphs");
}

// =====================================================================================
section('T115: catalogueFor (SPEC §8.8): the head, the list, the places\' groups, glyphs and no number');
{
  const m = placesMeta(D, { own: ['under_the_span'], caught: ['dusk_minnow', 'thousandcast_pike'] });
  const c = PL.catalogueFor(m, D, 'mossmere');
  eq([c.head.waterId, c.head.name, c.head.have, c.head.need], ['mossmere', 'The Mossmere', 1, 12], 'the head: the name and the count (have/need)');
  eq(Object.keys(c.head.seals), ['map', 'gear', 'catch'], 'the head carries the three seals while the Mossmere is the frontier');
  eq(c.list.map((e) => e.id), D.LOOP.species.mossmere, "the list's twelve, in its order");
  eq(c.groups.map((g) => g.placeId), ['under_the_span', 'buoy_lights', 'bell_pool'], 'then Under the Span, the Buoy Lights, the Bell Pool: no Lily Maze group (it has no fish of its own)');
  eq(c.groups.map((g) => g.entries.map((e) => e.id)), [['bridgechain_sturgeon', 'thousandcast_pike'], ['hullkiss_lamprey', 'gloam_eel'], ['belled_matriarch']], 'each group: its own fish, its giant, its kind\'s fish, its legend');
  eq(c.groups.map((g) => [g.kind, g.owned, g.name]), [['old', true, 'Under the Span'], ['night', false, null], ['crown', false, null]], 'an owned place\'s heading names it; an unowned one is its glyph alone (name null)');
  const all = [...c.list, ...c.groups.flatMap((g) => g.entries)];
  eq(all.length, 17, 'all 17 once');
  eq(new Set(all.map((e) => e.id)).size, 17, '… no fish twice');
  const by = Object.fromEntries(all.map((e) => [e.id, e]));
  const G = (id) => [by[id].hours, by[id].place, by[id].bait];
  // SPEC §8.8's table
  for (const id of ['dusk_minnow', 'mossback_perch', 'gutter_crayfish', 'rustfin_sucker', 'weeping_carp', 'kissmark_trout', 'reedjaw_pike']) eq(G(id), [[], 'open', null], `${id}: the open-water glyph alone (any hour)`);
  for (const id of ['likely_chub', 'overbold_bass', 'candlefin_koi']) eq(G(id), [['sun', 'dusk'], 'open', null], `${id}: open water, day and dusk`);
  eq(G('lampsipper'), [['moon'], 'open', null], 'the Lampsipper: open water and the moon');
  eq(G('milkeye_perch'), [['dusk', 'moon'], 'open', null], 'the Milkeye Perch: open water, dusk and moon');
  eq(G('bridgechain_sturgeon'), [[], null, null], 'the Bridgechain: none (any hour; the heading is its place)');
  eq(G('thousandcast_pike'), [['dusk', 'moon'], null, null], '★ the Thousandcast: dusk and moon');
  eq(G('hullkiss_lamprey'), [['moon'], null, null], '★ the Hullkiss: the moon');
  eq(G('gloam_eel'), [['moon'], null, 'lumen_moss'], 'the Gloam Eel: the moon and (M1 step 4) its tin, Lumen Moss');
  eq(G('belled_matriarch'), [['sun', 'dusk'], null, 'heartmoss'], '★ the Matriarch: day, dusk and the Heartmoss Ball');
  ok(by.thousandcast_pike.giant && by.hullkiss_lamprey.giant && by.belled_matriarch.legend && !by.gloam_eel.giant, 'the giants and the legend are marked');
  eq(all.filter((e) => e.caught).map((e) => e.id), ['dusk_minnow', 'thousandcast_pike'], 'caught: journal[id].caught > 0');
  eq(c.finds?.rows?.part?.length, 3, 'finds: the finds half (M1 step 5c)');
  // a deep scan: no number and no % in any entry
  const scan = (v, path, bad) => { if (typeof v === 'number') bad.push(path); else if (typeof v === 'string' && (/\d/.test(v) || v.includes('%'))) bad.push(`${path}: ${v}`); else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) scan(x, `${path}.${k}`, bad); return bad; };
  eq(scan([...c.list, ...c.groups.flatMap((g) => g.entries)], 'entries', []), [], 'no number and no % anywhere in an entry');
  const fresh = PL.catalogueFor(freshLoopMeta(D), D, 'mossmere');
  ok(fresh.groups.every((g) => g.name === null && !g.owned) && fresh.head.have === 0, 'a fresh save: every place\'s heading its glyph alone, 0 of 12');
  ok(PL.catalogueFor(freshLoopMeta(D), D, 'sporewood').head.seals === null, 'a water that is not the frontier: no seals in its head');
}

// =====================================================================================
section('T116: sealsOf (SPEC §5.5 (f)): Sporewood\'s three keys');
{
  const s0 = PL.sealsOf(freshLoopMeta(D), D, 'sporewood');
  eq(s0.map, { held: false, price: null, shipped: false }, 'the map seal hollow, no price (not shipped: "Coming soon")');
  eq(s0.gear, { held: false, slot: 'rod', tier: 1, item: 'rod:1' }, 'the gear seal: Rod T1, not held');
  eq(s0.catch, { held: false, have: 0, need: 12 }, 'the catch seal: 0 of 12');
  ok(PL.sealsOf(placesMeta(D, { tackle: { rod: 1, line: 0, reel: 0 } }), D, 'sporewood').gear.held === true && PL.sealsOf(placesMeta(D, { tackle: { rod: 0, line: 2, reel: 2 } }), D, 'sporewood').gear.held === false, 'the gear seal held iff Rod T1 is owned');
  const eleven = placesMeta(D, { caught: D.LOOP.species.mossmere.slice(0, 11) }), twelve = placesMeta(D, { caught: D.LOOP.species.mossmere });
  eq(PL.sealsOf(eleven, D, 'sporewood').catch, { held: false, have: 11, need: 12 }, '11 of 12: not held');
  eq(PL.sealsOf(twelve, D, 'sporewood').catch, { held: true, have: 12, need: 12 }, '12 of 12: held');
  const old = { ...freshLoopMeta(D), journal: Object.fromEntries(D.LOOP.species.mossmere.map((id) => [id, { caught: 3, biggest: 1 }])) };
  delete old.loop;
  PL.migrateLoop(old, D);
  ok(PL.sealsOf(old, D, 'sporewood').catch.held === true, 'an old v3 save that landed the twelve opens with the catch seal held');
  ok(['map', 'gear', 'catch'].every((k) => k in s0) && 'held' in s0.map && ['held', 'slot', 'tier'].every((k) => k in s0.gear) && ['held', 'have', 'need'].every((k) => k in s0.catch), "a superset of 3b's chartNext seals (map.held; gear.held, slot, tier; catch.held, have, need)");
  eq(fakeLoop({ D }).seals(), s0, "the ledger's seals() (the fixture's, on the real function) is sealsOf's");
}

// =====================================================================================
section('T120: flag-off: every new export inert or empty off the loop; the built tables as built');
{
  for (const [name, d] of [['v1', dataV1], ['v3 phase 1', dataV3], ['v3 phase 2', dataV3p2]]) {
    ok(d.LOOP_ENABLED === false && d.SPECIES_LOOP.length === 0 && d.LOOP.redress === false, `${name}: no loop, SPECIES_LOOP empty, LOOP.redress false`);
    ok(!d.FISH_SHAPES.includes('lamprey') && !d.FISH_SHAPES.includes('trout') && d.CATCH_V3.rarity.epic === undefined && d.CATCH_V3.elderRarity.epic === undefined, `${name}: FISH_SHAPES and CATCH_V3 as built (no lamprey or trout plan, no epic Fight)`);
    eq(d.AUTOFISH.show.poseRules.thin, ['eel'], `${name}: AUTOFISH.show.poseRules.thin as built`);
    ok(!d.SPECIES.some((s) => s.id === 'thousandcast_pike' || s.id === 'hullkiss_lamprey' || s.id === 'kissmark_trout'), `${name}: none of the three new fish in SPECIES`);
    ok(!d.SPECIES.some((s) => s.id === 'gloam_eel' && 'kind' in s), `${name}: the Gloam Eel has no kind`);
  }
  ok(!(dataV3.ZONES[0].arena.places || []).length && !dataV3.PLACES.some((p) => FOUR.includes(p.id)), 'v3 phase 1: the Mossmere\'s arena places are as built (none)');
  const p2 = dataV3p2.ZONES[0].arena.places;
  ok(p2.length === dataV3p2.MOSSMERE_V3.places.filter((p) => !p.secret).length && p2.some((p) => p.id === 'under_the_span' && p.holdsGiants && p.rule) && p2.some((p) => p.id === 'lily_maze' && p.maxClass === 'trophy' && p.rule) && p2.every((p) => !('kind' in p) || p.kind !== 'crown'),
    'v3 phase 2: the Mossmere\'s v3 places as built, their rules and caps kept', p2.map((p) => p.id));
  ok(dataV3p2.SPECIES.find((s) => s.id === 'bridgechain_sturgeon')?.weather === 'hush' && !dataV3p2.SPECIES.find((s) => s.id === 'bridgechain_sturgeon').model.scutes, 'v3 phase 2: the Bridgechain as built (its weather, no scutes)');
  ok(dataV1.SPECIES.every((s) => !s.giant), 'v1: no giant');
}

console.log(`\nloop-places: ${pass} passed, ${fail} failed`);
if (fail) { console.log(failures.map((f) => '  - ' + f).join('\n')); process.exit(1); }
