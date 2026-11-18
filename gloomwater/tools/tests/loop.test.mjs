// Unit tests for the Full Hold's seam (docs/loop/slice-1a/PLAN.md §2.0, §3.1–§3.3; WICKS.md §5): data.js's LOOP tables and pure
// helpers, core.js's switch and fmtClams, progression-loop.js's pure exports and createLoop's method set, and the shared fixture.
// Lane A grows this file with the rest of slice 1a.   node tools/tests/loop.test.mjs
import * as core from '../../src/core.js';
import * as PL from '../../src/progression-loop.js';
import { loadLoopData, freshLoopMeta, tripRun, fakeLoop } from './loop-fixture.mjs';

let pass = 0, fail = 0;
const failures = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; failures.push(msg); console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const near = (a, b, msg, eps = 1e-9) => ok(Math.abs(a - b) <= eps, `${msg} (got ${a}, want ${b})`);
const section = (s) => console.log(`- ${s}`);

// the three builds, each its own module instance, imported before the loop's flags are set (data.js reads them once)
eq(core.LOOP_FLAGS.apply, false, 'node import: the loop switch writes nothing');
eq(globalThis.GW_LOOP, undefined, 'node import: GW_LOOP untouched');
const V1 = await import('../../src/data.js?loop-test-v1');
globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
const V3 = await import('../../src/data.js?loop-test-v3');
delete globalThis.GW_V3_PHASE;
globalThis.GW_LOOP = true;
const LP4 = await import('../../src/data.js?loop-test-phase4');   // GW_LOOP without GW_V3_PHASE: still the phase-1 data
const D = await loadLoopData();

// ------------------------------------------------------------------ the switch (T40) and fmtClams (T20)
section('core: the loop switch (PLAN §3.2, CHOICE 18) and fmtClams');
{
  const R = core.resolveLoopFlags;
  eq(core.LOOP_ROLLOUT.on, false, 'shipped default: the loop is off');
  eq(core.LOOP_FLAG_KEY, 'gloomwater.loop', 'the storage key');
  eq(R({}), { on: false, source: 'default', apply: false }, 'no URL, no storage → off');
  eq(R({ search: '?loop=1' }), { on: true, source: 'url', apply: true }, '?loop=1 → on');
  eq(R({ search: '?loop' }).on, true, 'a bare ?loop → on');
  eq(R({ search: '?loop=0', stored: { on: true } }).on, false, 'the URL beats localStorage (off)');
  eq(R({ search: '?loop=1', stored: { on: false } }).on, true, 'the URL beats localStorage (on)');
  eq(R({ stored: { on: true } }), { on: true, source: 'storage', apply: true }, 'localStorage {on}');
  eq(R({ stored: 1 }).on, true, 'localStorage "1"');
  eq(R({ preset: { loop: false }, search: '?loop=1' }), { on: false, source: 'preset', apply: false }, 'a preset GW_LOOP wins');
  eq(R({ preset: { loop: true } }), { on: true, source: 'preset', apply: false }, 'a preset on is left alone');
  eq(R({ preset: { v3: false }, search: '?loop=1' }).on, false, 'a preset GW_V3 === false keeps the loop off (a v1 template)');
  eq(R({ rollout: { on: true } }).apply, true, 'the gate commit flips LOOP_ROLLOUT.on');
  // M1 step 3a (PLAN CHOICE 13): the re-dress's dev switch, read once beside ?loop; on by default since the user's yes (17 Nov 2026)
  const RR = core.resolveRedressFlag;
  eq([RR({}).on, RR({ search: '?loop=1' }).on, RR({ search: '?redress=0' }).on], [true, true, false], '?redress: on by default, off with ?redress=0');
  eq(RR({ search: '?loop=1&redress=1' }), { on: true, source: 'url', apply: true }, '?redress=1 → on');
  eq(RR({ search: '?loop=1&redress=0' }), { on: false, source: 'url', apply: true }, '?redress=0 → off');
  eq(RR({ preset: false, search: '?redress=1' }), { on: false, source: 'preset', apply: false }, 'a preset GW_REDRESS wins');
  ok(core.REDRESS_FLAGS.apply === false && globalThis.GW_REDRESS === undefined, 'node import: the re-dress switch writes nothing');
  const rp = { document: {}, location: { search: '?loop=1&redress=0' } }, rq = { document: {}, location: { search: '?loop=1' } };
  core.applyRedressFlag(rp); core.applyRedressFlag(rq);
  ok(rp.GW_REDRESS === false && rq.GW_REDRESS === undefined, 'a fake page: GW_REDRESS written only when the URL names it (?redress=0 → false)');
  const page = { document: {}, location: { search: '?loop=1&v3=0&v3phase=4' } };
  eq(core.applyLoopFlags(page).on, true, 'a fake page with ?loop=1 → on');
  ok(page.GW_LOOP === true && page.GW_V3 === true && page.GW_V3_PHASE === 1, 'a fake page: GW_LOOP, GW_V3 and GW_V3_PHASE = 1 written');
  eq(core.applyV3Flags(page), { on: true, phase: 1, source: 'preset', apply: false }, 'then v3\'s switch sees presets: ?v3=0 and ?v3phase=4 lose to the loop');
  const node = { GW_LOOP: undefined };
  eq(core.applyLoopFlags(node).apply, false, 'node (no document): nothing applied');
  ok(!('GW_V3' in node) && node.GW_LOOP === undefined, 'node: nothing written');
  ok(core.HIDDEN_DEBUG_HOOKS.includes('loop') && core.HIDDEN_DEBUG_HOOKS.includes('intro'), "'loop' is a hidden debug hook");
  const F = core.fmtClams;
  eq([F(0), F(7), F(9999), F(10000), F(12400), F(12499), F(999999), F(1000000), F(1234567)],
    ['0', '7', '9,999', '10.0k', '12.4k', '12.4k', '999.9k', '1.0m', '1.2m'], 'fmtClams: 9,999 · 12.4k · 1.2m (never rounded up)');
}

// ------------------------------------------------------------------ the flags in data.js (§2.1 items 1–3)
section('data.js: LOOP_ENABLED, PARKED, V3_PHASE, the apply block');
{
  const KEYS = 'swarm combat levels embers hunger oilAsLife nightModes death days farWater liveWell meta tolls longDescent challenges quality mercy passFavour baitAttract murkInLake runShop residents weather walking giantSpots watchLamps arrivalHush eatRender bounties firstCatchShells proofs'.split(' ');
  ok(V1.LOOP_ENABLED === false && Object.keys(V1.PARKED).length === 0 && !('loop' in V1.TEXT), 'v1: the loop is off, nothing parked');
  ok(V3.LOOP_ENABLED === false && Object.keys(V3.PARKED).length === 0 && !('loop' in V3.TEXT), 'v3 without the loop: off, nothing parked');
  ok(Object.isFrozen(V1.PARKED) && Object.isFrozen(D.PARKED), 'PARKED is frozen');
  ok(D.LOOP_ENABLED === true && D.V3_ENABLED === true && D.V3_PHASE === 1 && D.WALK_ENABLED === false, 'the loop build: v3 at phase 1, no walking');
  eq(Object.keys(D.PARKED).sort(), KEYS.slice().sort(), 'PARKED: exactly the 31 keys of §3.1');
  ok(Object.values(D.PARKED).every((v) => v === true), 'PARKED: every key true');
  ok(LP4.LOOP_ENABLED === true && LP4.V3_PHASE === 1, 'GW_LOOP without GW_V3_PHASE still gets phase 1');
  eq(V3.V3_PHASE, 1, 'v3 without the loop keeps the phase it was given');
  ok(D.ZONES.every((z) => !(z.arena.watchLamps || []).length && !(z.arena.giantSpots || []).length), 'the loop: no watch lamps and no stopgap giant water in any lake');
  ok((V3.ZONES[0].arena.giantSpots || []).length > 0 && (V3.ZONES[0].arena.watchLamps || []).length > 0, 'v3 without the loop keeps them (unchanged)');
  ok(D.TEXT.loop === D.TEXT_LOOP, 'TEXT.loop is TEXT_LOOP under the loop');
  eq(D.CATCH_V3.buffs.wicks.ashwick, { hold: 4 }, "the loop: Ashwick's comeback buff, +4 and no `on`");
  eq(V3.CATCH_V3.buffs.wicks.ashwick, { hold: 3, on: 'firstHookEachNight' }, "v3 without the loop: Ashwick's built quirk");
  eq([D.INTRO.text[2], D.INTRO.cove.text[2]], ['Its last candles fish from lamp to lamp.', 'Its last candles fish from lamp to lamp.'], "the film's line 3 under the loop");
  eq(V3.INTRO.text[2], 'Its last candles fish to stay lit.', "v3's film keeps its line 3");
  ok('LOOP' in V1 && V1.LOOP.hold.start === 3 && typeof V1.fishClams === 'function', 'LOOP and the helpers are exported in every build');
}

// ------------------------------------------------------------------ LOOP's tables (§3.1, WICKS §5)
section('data.js: the LOOP tables');
{
  const L = D.LOOP;
  eq(L.hold.ladder.map((s) => [s.slots, s.price]), [[4, 200], [5, 500], [6, 1000], [7, 2000], [8, 3500]], 'the hold ladder (SPEC §4.2; the user, 17 Nov 2026: "Make it 400 to start")');
  ok(L.hold.start === 3 && L.hold.max === 8 && L.hold.shelfMax === 6, 'the hold: 3 to 8, the shelf to Hold 6 (M1 step 3a; 1a stopped at 5)');
  eq(L.tackle.price, [0, 50, 300, 1200, 6000, 32000, 100000], 'tackle prices');
  eq(L.tackle.shelfAt, [1, 1, 1, 2, 3, 4, 9], 'v8: shelfAt[6] = 9');
  eq(L.access.gear, { sporewood: 'rod:1' }, 'v8: the one gear key 1a carries');
  eq(Object.keys(L.access.pull).sort(), ['cap', 'floorFrom', 'keeperFloor', 'perEvening', 'sureFrom'], 'v8: the pull rule');
  eq(L.evening, { day: 40, dusk: 20, night: null, nightLook: 90 }, 'the evening');
  ok(L.time.show === 0 && L.priceFactor === 1, 'time.show 0 (CHOICE 15), priceFactor 1');
  eq(L.wicks.order, D.CHARACTERS.map((c) => c.id).filter((id) => L.wicks.order.includes(id)), 'LOOP.wicks.order is the five CHARACTERS ids, in order');
  ok(L.wicks.order.length === 5 && L.wicks.order.every((id) => D.CHARACTER_BY_ID[id]), 'five Wicks, each a CHARACTERS id');
  ok(L.wicks.wick.firstMult === 1.4 && L.wicks.taper.perWater === false && L.wicks.stub.waitMul === 0.78 && L.wicks.tallow.everyWater === true && L.wicks.ashwick.hold === 4,
    'the balancing run as the lead ruled it (WICKS §3.5)');
  ok(L.wicks.order.every((id) => Object.keys(L.wicks[id].stats).every((k) => k in D.STATS)), 'every Wick stat is a STATS key');
  eq(L.tutorial.outPath.mossmere, [[24, 38], [16, 25.3]], "the Mossmere's glide out");
  for (const [id, line] of Object.entries(D.TEXT_LOOP.wicks)) {
    ok(L.wicks.order.includes(id), `TEXT_LOOP.wicks.${id} is a Wick`);
    ok(line.split(/\s+/).length <= 8 && line.length <= 36, `TEXT_LOOP.wicks.${id}: ≤ 8 words and ≤ 36 characters ("${line}")`);
  }
  ok(Object.keys(D.TEXT_LOOP.murk.firstChartBy).every((id) => L.wicks.order.includes(id)), 'firstChartBy keys are Wick ids');
  const words = [];
  const walk = (v, path) => { if (typeof v === 'string') words.push([path, v]); else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, `${path}.${k}`); };
  walk(D.TEXT_LOOP, 'TEXT_LOOP');
  for (const [path, w] of words) ok(path === 'TEXT_LOOP.newDescent' || !/shells?|memories|descent/i.test(w), `${path} names no Shells, Memories or Descent`);
}

// ------------------------------------------------------------------ the pure helpers (§3.1, WICKS §5)
section('data.js: fishClams, loopWaterKey, loopWickId, the Wick helpers, sailPlan');
{
  const sp = (id) => D.SPECIES_BY_ID[id];
  eq(D.fishClams(sp('dusk_minnow'), 0.4), 7, 'T18: a Keeper Dusk Minnow (z 0.4) is 7 on the built L50');
  eq(D.fishClams(sp('belled_matriarch'), 0), null, 'a legend is not priced by size');
  ok(D.fishClams(sp('reedjaw_pike'), 2.2) > D.fishClams(sp('reedjaw_pike'), 1.4) && D.fishClams(sp('gutter_crayfish'), -2) >= 1, 'bigger sells for more; never below 1');
  eq([D.loopWaterKey(null, 'mossmere'), D.loopWaterKey('lily_maze', 'mossmere')], ['open:mossmere', 'lily_maze'], 'the bite-count key');
  eq(['taper', 'bogus', null, undefined, 'order'].map(D.loopWickId), ['taper', 'wick', 'wick', 'wick', 'wick'], 'loopWickId');
  // Tallow (WICKS §2.4, proposed T79)
  for (const h of [3, 4, 5, 6, 7, 8]) {
    eq(D.wickSlots(h, 'tallow'), h + 1, `Tallow's slots at Hold ${h}`);
    for (const w of ['wick', 'taper', 'stub', 'ashwick']) ok(D.wickSlots(h, w) === h, `${w}'s slots at Hold ${h}`);
    eq(D.goodBitesFor({ kind: 'open', holdSlots: h, wickId: 'tallow' }), h + 3, `Tallow's open water at Hold ${h}: holdSlots + 3`);
    eq(D.goodBitesFor({ kind: 'open', holdSlots: h, wickId: 'stub' }), h + 1, `another Wick's open water at Hold ${h}: holdSlots + 1`);
  }
  eq(['day', 'old', 'night', 'crown'].map((k) => D.goodBitesFor({ kind: k, holdSlots: 3, wickId: 'tallow' })), [3, 4, 3, 3], "Tallow's places: one more (everyWater)");
  eq(['day', 'old', 'night', 'crown'].map((k) => D.goodBitesFor({ kind: k, holdSlots: 3, wickId: 'wick' })), [2, 3, 2, 2], 'the built places for the others');
  eq(D.goodBitesFor({ kind: 'open', holdSlots: 3 }), 4, 'T10: quiet after 4 at hold 3');
  eq(D.loopSlots({ holdSlots: 8 }, 'tallow'), 9, "a save with holdSlots 8 gives Tallow 9");
  eq(D.loopSlots({ holdSlots: 4, wick: 'tallow' }), 5, "loopSlots reads the save's Wick by default");
  // quiet water (T11; Stub WICKS §2.3)
  eq(D.quietTerms(1), { over: 1, favour: -0.15, waitMult: 1.3 }, 'the first quiet bite: −0.15, ×1.3');
  eq(D.quietTerms(8), { over: 8, favour: -1.2, waitMult: 2.2 }, 'floors at −1.2 and ×2.2');
  eq(D.quietTerms(0), { over: 0, favour: 0, waitMult: 1 }, 'not quiet: no term');
  near(D.quietTerms(3, 'stub').favour, -0.24, "Stub: −0.08 a bite", 1e-12);
  eq([D.quietTerms(3, 'stub').waitMult, D.quietTerms(30, 'stub').favour], [1, -1.2], 'Stub: the fresh wait, the same floor');
  // Taper's first bite (WICKS §2.2)
  const day = ['dusk_minnow', 'mossback_perch', 'gutter_crayfish', 'weeping_carp', 'candlefin_koi', 'reedjaw_pike'].map(sp);
  const w = day.map((s) => D.RARITY_WEIGHTS[s.rarity]);
  const t = D.wickPoolWeights('taper', day, w, { firstBite: true });
  eq(t, [0, 0, 0, 24, 24, 6], "Taper's first bite: the commons zeroed where the rest passes the sign rule");
  ok(D.wickPoolWeights('taper', day, w, { firstBite: false }) === w && D.wickPoolWeights('stub', day, w, { firstBite: true }) === w, 'no first bite, or another Wick: the same weights');
  const night = [sp('dusk_minnow'), sp('weeping_carp')], nw = [70, 24];
  ok(D.wickPoolWeights('taper', night, nw, { firstBite: true }) === nw, 'one kind left (the carp alone): the rule waits');
  // the glide out (T66's pure part)
  const g = D.sailPlan({ x: 24, z: 38 }, { x: 0, z: 0 }, D.LOOP.tutorial, 'mossmere');
  eq([g.from, g.to], [{ x: 24, z: 38 }, { x: 16, z: 25.3 }], "the Mossmere's outPath");
  near(g.yaw, Math.atan2(8, 12.7), 'yaw faces the way the raft travels (player.heading)');
  // (a water with no outPath of its own: Glasswater; Sporewood has its own since LAKE 2 lane W1, below)
  const r = D.sailPlan({ x: 24, z: 38 }, { x: 0, z: 0 }, D.LOOP.tutorial, 'glasswater');
  near(Math.hypot(r.to.x - 24, r.to.z - 38), 15, 'no outPath: outDist m toward the centre', 1e-9);
  near(Math.atan2(r.to.x, r.to.z), Math.atan2(24, 38), '… along the line to the centre', 1e-9);
  const sw = D.sailPlan({ x: 36.59, z: 32.5 }, { x: 0, z: 0 }, D.LOOP.tutorial, 'sporewood'), P = D.LOOP.tutorial.outPath.sporewood;
  eq([sw.from, sw.to], [{ x: 36.59, z: 32.5 }, { x: P[P.length - 1][0], z: P[P.length - 1][1] }], "Sporewood's outPath (LAKE2 W1: out along the mooring's lane, round Murk's barge)");
}

// ------------------------------------------------------------------ progression-loop's pure exports (§3.3)
section('progression-loop: freshLoop, migrateLoop (T51, T67), the tally (T21 bookkeeping, T35, T38), the shelf (T23, T24), the list (T81, T82)');
{
  const f = PL.freshLoop(D);
  ok(f.v === PL.LOOP_SCHEMA && f.holdSlots === 3 && f.clams === 0 && f.evenings === 0, 'freshLoop: 3 slots, no clams, no evening');
  ok(f.wick === null && f.tutorial === null && f.lastTrip === null, 'freshLoop: no Wick, no tutorial (T67)');
  eq(f.maps, { lakes: ['mossmere'], places: [] }, 'freshLoop: the Mossmere owned');
  eq(f.firsts, { seen: [], seals: [], best: {} }, "freshLoop: the Wick's ledger, empty");
  // T51: a v2 block
  const m2 = { runs: 4, journal: { dusk_minnow: { caught: 2 } }, loop: { v: 2, clams: 5, bait: { mireworm: 4 }, hold: 2, raft: { hull: 2, oars: 1 }, maps: { lakes: ['mossmere'], places: ['lily_maze'] } } };
  PL.migrateLoop(m2, D);
  ok(m2.loop.v === PL.LOOP_SCHEMA && m2.loop.holdSlots === 5 && !('hold' in m2.loop), 'T51: hold 2 → holdSlots 5');
  eq(m2.loop.bait, { mossmere: { mireworm: 4 } }, 'T51: flat bait counts move under the Mossmere');
  ok(m2.loop.clams === 705 && !('hull' in m2.loop.raft) && m2.loop.raft.oars === 1, 'T51: the hull refunded (700) and removed');
  eq(m2.loop.maps.places, ['lily_maze'], 'T51: places kept');
  const once = JSON.stringify(m2); PL.migrateLoop(m2, D);
  eq(JSON.stringify(m2), once, 'T51: a second migrate changes nothing');
  ok(m2.runs === 4 && m2.journal.dusk_minnow.caught === 2, 'migrateLoop touches nothing outside meta.loop');
  // the opening's records (T67)
  const played = { loop: { v: 3, evenings: 2 } }; PL.migrateLoop(played, D);
  eq([played.loop.tutorial, played.loop.wick], [{ done: true, step: null }, 'wick'], 'T67: a block with evenings > 0 → tutorial done, the Wick');
  const tripped = { loop: { v: 3 } }; PL.migrateLoop(tripped, D, { hasTrip: true });
  eq(tripped.loop.tutorial, { done: true, step: null }, 'T67: a saved trip beside it → tutorial done');
  const paid = { loop: { v: 3, lastTrip: { id: 'run_x', total: 9, lines: [], seen: true }, wick: 'stub' } }; PL.migrateLoop(paid, D);
  eq([paid.loop.tutorial, paid.loop.wick], [{ done: true, step: null }, 'stub'], 'T67: a lastTrip → done; a chosen Wick kept');
  const fresh = { loop: { v: 3, wick: 'taper', tutorial: { done: false, step: 'wake' } } }; PL.migrateLoop(fresh, D);
  eq([fresh.loop.tutorial, fresh.loop.wick], [{ done: false, step: 'wake' }, 'taper'], 'a tutorial in progress is kept');
  const clamp = { loop: { v: 3, holdSlots: 12, tackle: { rod: 9, line: -2, reel: 'x' }, wick: 'nobody' } }; PL.migrateLoop(clamp, D);
  eq([clamp.loop.holdSlots, clamp.loop.tackle, clamp.loop.wick], [8, { rod: 6, line: 0, reel: 0 }, 'wick'], 'holdSlots 3–8, tiers 0–6, an unknown Wick → the Wick');
  const none = {}; PL.migrateLoop(none, D); eq(none.loop, PL.freshLoop(D), 'a meta without a block gets a fresh one');
  // the tally: weights lightest first (pounds), a legend last
  const creel = [
    { uid: 'a', speciesId: 'weeping_carp', sizeClass: 'keeper', length: 51.2, clams: 27 },
    { uid: 'b', speciesId: 'dusk_minnow', sizeClass: 'keeper', length: 23.4, clams: 7 },
    { uid: 'm', speciesId: 'belled_matriarch', legendary: true, sizeClass: 'keeper', length: 88, clams: 500 },
    { uid: 'c', speciesId: 'mossback_perch', sizeClass: 'keeper', length: 27, clams: 9 },
  ];
  const lines = PL.tallyLines(creel, { D });
  eq(lines.map((l) => l.uid), ['b', 'c', 'a', 'm'], 'the tally runs lightest first, the legend last');
  eq(lines.map((l) => D.fmtWeight(D.fishWeight(D.SPECIES_BY_ID[l.speciesId], l))).slice(0, 3), ['6 oz', '9 oz', '4 lb 12 oz'], "the rows' weights (PLAN §3.4's example)");
  ok(lines.every((l) => !('weight' in l) && l.length > 0), 'a row keeps the length, never a weight');
  const sale = PL.tallyLines([{ uid: 'x', speciesId: 'dusk_minnow', length: 20, clams: 7 }], { saleOf: (fh) => ({ base: fh.clams, clams: 10, first: true }) });
  eq([sale[0].base, sale[0].clams, sale[0].first], [7, 10, true], "a row from saleOf: base, the sale, first (the Wick's double tick)");
  const ml = PL.freshLoop(D), run = tripRun(D, { metaLoop: ml, creel, bait: { mireworm: 2 } });
  const book = PL.tallyBook(ml, creel, run);
  ok(book.total === 543 && ml.clams === 543 && ml.evenings === 1, 'tallyBook: clams and one evening');
  eq([ml.legends, ml.bait], [{ belled_matriarch: 1 }, { mossmere: { mireworm: 2 } }], 'T38/T35: a kept Matriarch is a landing; bait left goes home');
  // T35: the flag-off boot rule
  const save = { version: 2, meta: { journal: {} }, run: { ...run, active: true } };
  const r1 = PL.sellStrandedTrip(save);
  ok(r1.sold === true && save.run === null && save.meta.loop.clams === 543 && save.meta.loop.lastTrip.boot === true && save.meta.loop.lastTrip.seen === true, 'T35: a trip is sold and dropped');
  eq(save.meta.loop.legends, { belled_matriarch: 1 }, "T35: the tally's own bookkeeping");
  const again = { version: 2, meta: save.meta, run: { ...run, active: true } };
  ok(PL.sellStrandedTrip(again).sold === false && save.meta.loop.clams === 543, 'T35: idempotent by lastTrip.id');
  const descent = { id: 'run_v3', active: true, outing: 'descent', zone: 'mossmere' };
  const parked = { meta: { loop: { parkedRun: descent } }, run: null };
  const r2 = PL.sellStrandedTrip(parked);
  ok(r2.restored === true && parked.run === descent && !('parkedRun' in parked.meta.loop), 'T35: the parked descent is back in save.run');
  const v1save = { meta: { runs: 2 }, run: { id: 'run_1', active: true, outing: 'normal' } }, before = JSON.stringify(v1save);
  ok(PL.sellStrandedTrip(v1save).sold === false && JSON.stringify(v1save) === before, 'T39: a non-trip envelope is returned untouched');
  // T23/T24: the shelf
  const shelf0 = PL.shelfItems(D, PL.freshLoop(D));
  // (M1 step 4's cards, the lures, tins, raft parts and Order Board, are tools/tests/loop-4.test.mjs's: these checks read the rest)
  const step4 = (i) => /^(lure|tin|cut|oars|keel|lantern|orders):/.test(i.id), no4 = (items) => items.filter((i) => !step4(i));
  const kit = (items) => no4(items).filter((i) => i.tab === 'tackle' || i.tab === 'raft');
  eq(kit(shelf0).map((i) => [i.id, i.price, i.bought]), [['rod:1', 50, false], ['line:1', 50, false], ['reel:1', 50, false], ['hold:4', 200, false]], 'T23: the fresh shelf (Tackle and Raft)');
  eq(no4(shelf0).filter((i) => i.tab === 'bait' || i.tab === 'maps').map((i) => [i.id, i.price, i.bought]),
    [['bait:heartmoss', 60, false], ['place:lily_maze', 60, false], ['place:under_the_span', 150, false], ['lake:sporewood', 1400, false]], 'M1 step 3a, the Lake 2 gate: the Bait tab and the Maps tab (two place maps and Sporewood\'s lake map, priced: it ships)');
  // the pre-gate state as a fixture (LOOP.shipped the Mossmere): the same tab with Sporewood's sealed card, no price
  const DM = { ...D, LOOP: { ...D.LOOP, shipped: 'mossmere' } };
  eq(no4(PL.shelfItems(DM, PL.freshLoop(DM))).filter((i) => i.tab === 'bait' || i.tab === 'maps').map((i) => [i.id, i.price, i.bought, i.sealed === true]),
    [['bait:heartmoss', 60, false, false], ['place:lily_maze', 60, false, false], ['place:under_the_span', 150, false, false], ['lake:sporewood', null, false, true]], 'the fixture (LOOP.shipped the Mossmere): the sealed card, no price');
  eq(shelf0.find((i) => i.id === 'hold:4').name, 'Lidded Creel', "a hold card names the ladder's step");
  ok(!shelf0.some((i) => i.id === 'hold:5' || i.id === 'rod:2'), 'T24: Hold 5 and T2 wait for the step below');
  eq(PL.goalOf(shelf0), { id: 'line:1', name: 'Braided Gut', price: 50, slot: 'line', level: 1 }, 'the goal line: Line T1 first (GEAR-GATES §5–6), "Braided Gut · 50"');
  eq(PL.goalOf(shelf0.map((i) => (i.id === 'line:1' ? { ...i, bought: true } : i)))?.id, 'rod:1', 'then the cheapest: Ashwood · 50 (Hold 4 at 200 is dearer)');
  const after = { ...PL.freshLoop(D), holdSlots: 4, tackle: { rod: 1, line: 0, reel: 0 } };
  const ses = PL.shelfItems(D, after, ['hold:4', 'rod:1']);
  eq(ses.filter((i) => i.bought).map((i) => i.id), ['rod:1', 'hold:4'], 'CHOICE 26: bought while open, the card reads Yours. in place');
  eq(PL.shelfItems(D, after).filter((i) => ['rod', 'hold'].includes(i.slot)).map((i) => [i.id, i.price]), [['rod:2', 300], ['hold:5', 500]], 'T23: the next steps on the next open');
  // M1 step 3a: the shelf's last hold step is Hold 6 (LOOP.hold.shelfMax), so Hold 5 is followed by the Wellbox at 1,000
  const five = PL.shelfItems(D, { ...PL.freshLoop(D), holdSlots: 5, tackle: { rod: 2, line: 2, reel: 2 } });
  eq(kit(five).map((i) => [i.id, i.price, i.bought]), [['rod:2', 300, true], ['line:2', 300, true], ['reel:2', 300, true], ['hold:6', 1000, false]], 'M1 step 3a: after Hold 5, Hold 6 at 1,000 (shelfMax 6)');
  const all4 = PL.freshLoop(D); all4.maps.places = ['lily_maze', 'under_the_span', 'buoy_lights', 'bell_pool'];
  const top = PL.shelfItems(D, { ...all4, holdSlots: 6, tackle: { rod: 2, line: 2, reel: 2 } });
  ok(kit(top).length === 4 && kit(top).every((i) => i.bought), 'CHOICE 26: Hold 6 and T2 keep a permanent Yours. card');
  eq(top.filter((i) => i.tab === 'maps').map((i) => [i.id, i.sealed, i.price]), [['lake:sporewood', false, 1400]], 'every place map owned: the Maps tab is Sporewood\'s lake map alone, priced (the Lake 2 gate)');
  eq(PL.goalOf(no4(top).filter((i) => i.tab !== 'home')), { id: 'lake:sporewood', name: 'Sporewood Pools', price: 1400, slot: 'lake', level: null }, 'the Mossmere\'s empty shelf: the goal line is the Sporewood map (the ball is a consumable)');
  // its map bought: before the list is landed its card is sealed again (the map seal pressed); once Sporewood is open the Maps tab is
  // Glasswater's sealed card (past LOOP.shipped: no price); either way the Mossmere's shelf has no goal left
  const swLoop = { ...all4, maps: { ...all4.maps, lakes: ['mossmere', 'sporewood'] }, holdSlots: 6, tackle: { rod: 2, line: 2, reel: 2 } };
  const topSw0 = PL.shelfItems(D, swLoop);
  eq(topSw0.filter((i) => i.tab === 'maps').map((i) => [i.id, i.sealed, i.price, i.seals?.map?.held]), [['lake:sporewood', true, null, true]], 'Sporewood\'s map owned, the list not landed: its card sealed again, the map seal pressed');
  const swMeta = { journal: Object.fromEntries(PL.listFor(D, 'mossmere').map((id) => [id, { caught: 1 }])), loop: swLoop };
  const topSw = PL.shelfItems(D, swLoop, [], { meta: swMeta });
  eq(topSw.filter((i) => i.tab === 'maps').map((i) => [i.id, i.sealed, i.price]), [['lake:glasswater', true, null]], 'Sporewood open (its map and keys held): the Maps tab is Glasswater\'s sealed card alone, no price');
  eq([PL.goalOf(no4(topSw0).filter((i) => i.tab !== 'home')), PL.goalOf(no4(topSw).filter((i) => i.tab !== 'home'))], [null, null], '… and no goal line (the ball is a consumable, a sealed card has no price)');
  // the fixture (LOOP.shipped the Mossmere): the empty shelf as it was before the gate, Sporewood's sealed card and no goal line
  const topM = PL.shelfItems(DM, { ...all4, holdSlots: 6, tackle: { rod: 2, line: 2, reel: 2 } });
  eq(topM.filter((i) => i.tab === 'maps').map((i) => [i.id, i.sealed]), [['lake:sporewood', true]], 'the fixture: every place map owned, the Maps tab is the sealed card alone');
  eq(PL.goalOf(no4(topM).filter((i) => i.tab !== 'home')), null, 'the fixture: an empty shelf, no goal line (the sealed card has no price)');
  // T81/T82: the list
  eq(PL.listFor(D, 'mossmere'), ['dusk_minnow', 'mossback_perch', 'gutter_crayfish', 'likely_chub', 'overbold_bass', 'rustfin_sucker', 'lampsipper', 'weeping_carp', 'candlefin_koi', 'milkeye_perch', 'kissmark_trout', 'reedjaw_pike'], "T81: the Mossmere's list, computed (M1 step 3a: the twelve, with the Kissmark Trout)");
  const jm = { journal: { dusk_minnow: { caught: 1 }, weeping_carp: { seen: true, caught: 0 }, reedjaw_pike: {}, gloam_eel: { caught: 3 }, mossback_perch: { caught: '2' } } };
  eq(PL.listCount(jm, D, 'mossmere'), { have: 2, need: 12 }, 'T82: caught > 0 only (Glimpsed and off-list entries do not count)');
}

// ------------------------------------------------------------------ the method set: createLoop (inert in S) and the fixture
section('createLoop and loop-fixture (PLAN §2.0)');
{
  const L = PL.createLoop({ ctx: { data: D, state: { meta: freshLoopMeta(D), run: null } } });
  for (const k of PL.LOOP_METHODS) ok(typeof L[k] === 'function', `createLoop has ${k}`);
  eq(Object.keys(L).sort(), PL.LOOP_METHODS.slice().sort(), 'createLoop carries exactly LOOP_METHODS');
  ok(L.holdFull() === false && L.keep({}).ok === false && L.taperFirstOpen() === false && L.endTrip() === null && L.comeback('open:mossmere') === null,
    'createLoop at home (no run): nothing to keep, no trip to end, no first bite to spend');
  eq([L.hold().slots, L.hold().fish, L.buy('hold').ok, L.state().clams], [3, [], false, 0], 'createLoop at home: 3 slots, an empty hold, no clams for Hold 4');
  const fk = fakeLoop({ D });
  for (const k of PL.LOOP_METHODS) ok(typeof fk[k] === 'function', `fakeLoop has ${k}`);
  eq(Object.keys(fk.favour('open:mossmere')).sort(), ['favour', 'good', 'mercy', 'over', 'quiet', 'spent', 'waitMult'], "fakeLoop.favour: §3.3's field names (T11)");
  for (let i = 0; i < 4; i++) fk.noteBite({ waterKey: 'open:mossmere' });
  const fq = fk.favour('open:mossmere');
  ok(fq.quiet === true && fq.over === 1 && fq.favour === -0.15 && fk.bitesLeft('open:mossmere') === 0, 'fakeLoop: quiet after 4 at hold 3; the next bite −0.15 (CHOICE 17)');
  fk.letGo({ waterKey: 'open:mossmere' });
  ok(fk.bitesLeft('open:mossmere') === 1 && fk.favour('open:mossmere').mercy === 0.2, 'fakeLoop: let go gives the bite back, +0.2');
  ok(fk.wick() === 'wick' && fk.setWick('taper') === 'taper' && fk.taperFirstOpen() === true, 'fakeLoop: Taper\'s first bite is open');
  fk.spendTaperFirst(); ok(fk.taperFirstOpen() === false, "fakeLoop: spent once an evening");
  eq(fk.beginTutorial(), { done: false, step: 'arrive' }, 'fakeLoop: beginTutorial');
  fk.setTutorialStep('chart'); fk.tutorialDone();
  ok(fk.tutorial().done === true && fk.state().said.firstChart === true, 'fakeLoop: tutorialDone also says the Chart line');
  ok(fk.calls.some((c) => c.name === 'tutorialDone'), 'fakeLoop logs its calls');
  const tl = fakeLoop({ D, wick: 'tallow' });
  for (let i = 0; i < 4; i++) tl.keep({ speciesId: 'dusk_minnow', z: 0 });
  ok(tl.holdFull() === true && tl.keep({ speciesId: 'dusk_minnow', z: 0 }).full === true && tl.hold().slots === 4, 'fakeLoop: Tallow keeps four, the fifth refused');
  const t = tl.endTrip();
  const each = D.fishClams(D.SPECIES_BY_ID.dusk_minnow, 0);
  ok(t.lines.length === 4 && t.total === 4 * each && tl.endTrip() === null && tl.state().clams === 4 * each, 'fakeLoop: the tally pays once');
  const over = fakeLoop({ holdFull: () => true });
  ok(over.holdFull() === true && over.hold().full === true, 'fakeLoop: a method can be replaced');
}

// ------------------------------------------------------------------ the Wick's ledger (WICKS §2.1) and the fixture's parity with CONTRACT §14.4
section('progression-loop: stampFirst; fakeLoop as a view sees the real ledger');
{
  const F = { seen: [], seals: [], best: {} }, sp = D.SPECIES_BY_ID.reedjaw_pike, seals = D.sealsFor(sp);
  eq(PL.stampFirst(F, sp, { length: 40, sizeClass: 'keeper' }, { seals }), { kind: true, seal: false, best: false, first: true }, 'a new kind is a first');
  eq(PL.stampFirst(F, sp, { length: 30, sizeClass: 'keeper' }, { seals }), { kind: false, seal: false, best: false, first: false }, 'a shorter Keeper of it is not');
  eq(PL.stampFirst(F, sp, { length: 70, sizeClass: 'prize' }, { seals }), { kind: false, seal: true, best: true, first: true }, 'its first Prize (and a longer best): one first');
  eq(PL.stampFirst(F, sp, { length: 69, sizeClass: 'prize' }, { seals }), { kind: false, seal: false, best: false, first: false }, 'a second Prize, shorter: none');
  eq(PL.stampFirst(F, sp, { length: 140, sizeClass: 'elder', ancient: true }, { seals }).first, true, 'an Ancient Elder');
  ok(F.seals.includes('reedjaw_pike|elder') && F.seals.includes('reedjaw_pike|ancient') && F.best.reedjaw_pike === 140, 'the ledger keeps the seals and the best');
  const M = D.SPECIES_BY_ID.belled_matriarch;
  eq(PL.stampFirst(F, M, { length: 90, legendary: true }, { seals: D.sealsFor(M) }).first, false, 'a legend is never a first (her price is her own)');
  ok(F.seen.includes('belled_matriarch'), '… though the ledger notes her');
  const bus = core.createBus();
  const fk = fakeLoop({ D, bus, clams: 500 });
  fk.buy('hold:4');
  ok(fk.shelf().tabs.find((t) => t.id === 'raft').items[0].bought === true, 'fakeLoop: the bought card reads Yours. while the shelf is open');
  bus.emit('ui:modal', { id: 'shelf', open: false });
  eq(fk.shelf().tabs.find((t) => t.id === 'raft').items[0].id, 'hold:5', 'fakeLoop with a bus: the session ends with the shelf (as the real one)');
  ok(fk.endTrip().zone === 'mossmere', "fakeLoop: lastTrip carries the trip's water");
  eq(fakeLoop({ D, wick: 'tallow' }).sayOnce('firstChart'), D.TEXT_LOOP.murk.firstChartBy.tallow, "fakeLoop: the Chart's line is the Wick's own count");
}

console.log(`\nloop: ${pass} passed, ${fail} failed`);
if (fail) { console.log(failures.map((f) => '  - ' + f).join('\n')); process.exit(1); }
