// LAKE 2, lane D2 (docs/loop/LAKE2.md §5, §8.3, §9; the user's words and answers of 17 Nov 2026): the gear loop across waters. The
// carry's arithmetic (a third, rounded up; the raft's parts unrounded), stacking over two waters, nothing owned lost without the leaving
// card (towTo is the one writer; the card's terms read without writing), a reload mid-tow, the found pieces kept, the lures and tins of
// each water at their own water (back on the way back), each water's shelf (its tiers, creels and raft parts), the tackle's Hold and cast
// with the carry, the line's cap by its total Hold (the Mossmere's caps unchanged), the first evenings' rule (LOOP.arrival), Murk's orders
// by water, and the save fixture (an M1-end save written before this lane → the tow → +2 / +2 / +2).
//   node tools/tests/loop-carry.test.mjs   (or node tools/check.mjs)
import fs from 'node:fs';
import * as THREE from 'three';

// (every module that reads data.js comes in after the loop's flags are set, so the sim's data.js instance is the loop's too)
const { loadLoopData, freshLoopMeta, fakeLoop } = await import('./loop-fixture.mjs');
const D = await loadLoopData({ query: 'loop-carry' });
const { createBus } = await import('../../src/core.js');
const { create } = await import('../../src/progression.js');
const PL = await import('../../src/progression-loop.js');
const LC = await import('../../src/loop-carry.js');
const WC = await import('../../src/watercraft.js');
const { gearItems, raftStats, refillOrders, orderWater } = await import('../../src/loop-gear.js');

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const near = (a, b, msg, e = 1e-6) => ok(Math.abs(a - b) <= e, `${msg} (got ${a}, want ${b})`);
const section = (s) => console.log(`- ${s}`);
const clone = (o) => JSON.parse(JSON.stringify(o));
const FIX = JSON.parse(fs.readFileSync(new URL('./fixtures/loop-save-m1-end.json', import.meta.url), 'utf8'));

/** A real progression on the loop's data (loop-tackle.test.mjs's harness), a fake fishing with the TK seams. */
function makeEnv({ meta = freshLoopMeta(D) } = {}) {
  const bus = createBus(), events = [], calls = { saves: 0 };
  const phase = { phase: 'calm', day: 1, time: 0, duration: 40 };
  const F = { state: 'idle', hookLine: () => ({ state: F.state, out: false, fishOn: false, castBait: null }), reelInQuiet: () => ({ ok: false }), spots: [], signs: [], addSpots() {}, armChum() {} };
  const ctx = {
    THREE, bus, data: D, state: { meta, run: null },
    time: { dt: 0.016, gameDt: 0.016, t: 0, gameT: 0, timeScale: 1, frame: 1 },
    flow: 'playing', paused: false, debug: {}, errors: [], isMobile: false, input: {}, core: { debugEnabled: () => false },
    game: { save() { calls.saves++; } },
    survival: { getPhaseInfo: () => ({ ...phase, k: 0, isNight: false }), addOil() {}, addSatiety() {}, heal() {} },
    actors: { merchant: { present: false, position: new THREE.Vector3(), arrive() {}, leave() {} }, setRaftLevel() {}, setCharacter() {} },
    world: { getMerchantDock: () => ({ position: new THREE.Vector3(24, 0, 38), yaw: 1 }), setGateState() {}, getGate: () => null, getDepth: () => 0.5 },
    player: { position: new THREE.Vector3(0, 0, 0), isNear() { return true; } },
    combat: { addXp() {} },
    ui: { isBlocking: () => false, isShopOpen: () => false, floatText() {} },
    fishing: F,
  };
  const origEmit = bus.emit.bind(bus);
  bus.emit = (evt, payload = {}) => { events.push({ evt, payload }); origEmit(evt, payload); };
  ctx.progression = create(ctx);
  ctx.progression.init();
  return { ctx, events, calls, P: ctx.progression, L: ctx.progression.loop, count: (e) => events.filter((x) => x.evt === e).length };
}
const fixtureMeta = () => clone(FIX.meta);
function startTrip(env, water) {
  const r = env.P.createRun({ startZone: water, nightMode: 'still', outing: 'trip' });
  env.ctx.state.run = r; env.ctx.flow = 'playing';
  return r;
}
function endTrip(env) { const t = env.L.endTrip(); env.ctx.state.run = null; return t; }
/** The Mossmere's end on a bare block: T2 everywhere, Hold 6, Oars II, Keel II, Lantern II (M1's empty shelf). */
const mossEnd = () => {
  const L = freshLoopMeta(D).loop;
  Object.assign(L, { tackle: { rod: 2, line: 2, reel: 2 }, holdSlots: 6, raft: { oars: 2, keel: 2, lantern: 2 }, maps: { lakes: ['mossmere', 'sporewood'], places: [] },
    barge: { water: 'mossmere', towed: ['mossmere'] } });
  return L;
};

// =====================================================================================================================
section('the data D2 reads: LOOP.carry, LOOP.gear, LOOP.arrival, lineAt (lane D1\'s keys)');
{
  near(D.LOOP.carry.share, 1 / 3, 'a third is carried (the user\'s answer 3: the design\'s default stands)');
  eq([D.LOOP.carry.round, D.LOOP.carry.castFrom], ['up', 16], 'rounded up; the cast beyond the Willow Switch\'s 16 m');
  eq(D.LOOP.gear.mossmere.line.map((t) => t.hold), [0, 2, 5], 'the Mossmere\'s lines are TACKLE\'s Twine · Braided Gut · Waxed Silk');
  eq(D.LOOP.gear.sporewood.line.map((t) => t.id), ['twine', 'rootthread', 'mothsilk'], 'Sporewood\'s lines: the start Twine travels, then its own two');
  eq(D.LOOP.arrival, { evenings: 3, cap: 'cap', fight: [-10, -6, -3] }, 'the first evenings\' rule (§8.3)');
  eq(D.LOOP.gearCap.lineAt, { mossmere: { trophy: 2, elder: 5 }, sporewood: { trophy: 4, elder: 7 } }, 'the line\'s cap by its total Hold');
  ok(PL.LOOP_METHODS.includes('towTo') && PL.LOOP_METHODS.includes('leaveTerms') && PL.LOOP_METHODS.includes('holdOf') && PL.LOOP_METHODS.includes('fitTackle'),
    'LOOP_METHODS names towTo, leaveTerms, carried, holdOf, fitTackle');
  const fl = fakeLoop({ D });
  ok(['towTo', 'leaveTerms', 'carried', 'holdOf', 'fitTackle'].every((m) => typeof fl[m] === 'function'), 'the fixture\'s fakeLoop carries each');
}

section('the carry\'s arithmetic (LAKE2 §5.3): ceil(H × ⅓) a slot from the best bought, the cast, the hold\'s slots, the raft unrounded');
{
  const add = LC.carryAdd(D, mossEnd());
  eq([add.rod, add.line, add.reel], [2, 2, 2], 'the Mossmere\'s end (T2: 5 / 5 / 5): +2 / +2 / +2 Hold');
  eq(add.cast, 1, 'the Whalebone\'s 19 m: +1 m cast (ceil(3 × ⅓))');
  eq(add.slots, 1, 'Hold 6 (3 bought): +1 slot, so Sporewood opens on Hold 4');
  for (const p of LC.RAFT_PARTS) near(add.raft[p], 0.667, `${p} II: 0.667 of a level, unrounded`, 1e-3);
  const t1 = mossEnd(); Object.assign(t1, { tackle: { rod: 1, line: 1, reel: 1 }, holdSlots: 4, raft: { oars: 1, keel: 0, lantern: 0 } });
  const a1 = LC.carryAdd(D, t1);
  eq([a1.rod, a1.line, a1.reel, a1.cast, a1.slots], [1, 1, 1, 1, 1], 'T1 only (2 / 2 / 2, the Ashwood\'s 17.5 m, Hold 4): +1 each');
  near(a1.raft.oars, 0.333, 'Oars I: a third of a level', 1e-3);
  const none = LC.carryAdd(D, freshLoopMeta(D).loop);
  eq([none.rod, none.line, none.reel, none.cast, none.slots, none.raft.oars], [0, 0, 0, 0, 0, 0], 'nothing bought carries nothing');
  const half = mossEnd(); half.tackle = { rod: 2, line: 0, reel: 1 };
  eq([LC.carryAdd(D, half).rod, LC.carryAdd(D, half).line, LC.carryAdd(D, half).reel], [2, 0, 1], 'each slot alone; a slot never bought carries nothing new');
  const found = mossEnd(); found.found = { rod: 'lamp_pole', line: null, reel: null }; found.finds.got.lamp_pole = 1;
  eq(LC.carryAdd(D, found).rod, 2, 'a fitted found rod is never counted: the best bought tier is (T2 → +2)');
}

section('stacking without breaking the ladder: two waters\' carries add (Sporewood\'s top on +2 gives 8 / 9 / 8; leaving it +2 / +3 / +2)');
{
  const L = mossEnd();
  LC.applyTow(D, L, 'sporewood');
  Object.assign(L, { tackle: { rod: 2, line: 2, reel: 2 }, holdSlots: 7, raft: { oars: 2, keel: 2, lantern: 2 } });
  eq(LC.tackleHold(D, L, {}), { rod: 8, line: 9, reel: 8 }, 'Sporewood\'s top tiers (+6 / +7 / +6) on the carried +2: the old T3\'s 8 / 9 / 8');
  eq(LC.castMaxOf(D, L), 21, 'Amberheart: 16 + 4 + the carried 1 = 21 m');
  const D3 = { ...D, LOOP: { ...D.LOOP, waters: { ...D.LOOP.waters, glasswater: { order: 3, tier: 16 } }, gear: { ...D.LOOP.gear, glasswater: D.LOOP.gear.sporewood }, start: { ...D.LOOP.start, glasswater: { lures: [], bait: {} } } } };
  L.barge.towed.push('sporewood');
  const { add, carry } = LC.applyTow(D3, L, 'glasswater');
  eq([add.rod, add.line, add.reel, add.cast, add.slots], [2, 3, 2, 2, 1], 'leaving Sporewood\'s top: ceil(6/3) · ceil(7/3) · ceil(6/3), cast ceil(4/3), Hold 7 (3 bought there): +1');
  eq([carry.rod, carry.line, carry.reel, carry.cast, carry.slots], [4, 5, 4, 3, 2], 'so the third water opens on +4 / +5 / +4, cast +3, Hold 5');
  near(carry.raft.keel, 1.333, 'the raft\'s carried parts add too (0.667 + 0.667)', 1e-3);
  eq(L.holdSlots, 5, 'the hold opens on its start plus the carried slots');
  eq(LC.tackleHold(D3, L, {}), { rod: 4, line: 5, reel: 4 }, 'the start pieces on the carry: the carry alone');
}

section('nothing owned is lost without the card: towTo is the one writer; the card\'s terms are read first, and they are what the tow writes');
{
  const env = makeEnv({ meta: fixtureMeta() });
  const { L } = env;
  const before = clone(L.state());
  const t = L.leaveTerms('sporewood');
  eq(L.state().tackle, before.tackle, 'leaveTerms writes nothing (the card is shown before the tow)');
  ok(t.first === true && t.add.rod === 2 && t.add.line === 2 && t.add.reel === 2, 'the card\'s figures: a first tow, +2 / +2 / +2');
  eq(t.line, 'Carried +2 · +2 · +2', 'the card\'s carried line in the carried words (TEXT_LOOP.carry)');
  const saves0 = env.calls.saves;
  const res = L.towTo('sporewood');
  ok(res.ok === true && res.first === true, 'towTo: the first tow to Sporewood');
  ok(env.calls.saves > saves0, 'written and saved at once');
  eq(env.count('loop:tow'), 1, 'loop:tow once');
  const S = L.state();
  eq([S.carry.rod, S.carry.line, S.carry.reel, S.carry.cast, S.carry.slots], [t.carry.rod, t.carry.line, t.carry.reel, t.carry.cast, t.carry.slots], 'the tow writes exactly the card\'s carry');
  eq(S.tackle, { rod: 0, line: 0, reel: 0 }, 'bought tackle stays at the Mossmere: the start pieces on the carry');
  eq([S.holdSlots, S.raft.oars, S.raft.keel, S.raft.lantern], [4, 0, 0, 0], 'the hold to 3 + the carried slot; the raft\'s bought parts stay (the user\'s answer 1)');
  eq(S.gearWater, 'sporewood', 'the gear water is Sporewood\'s');
  eq([S.clams, S.evenings], [before.clams, before.evenings], 'clams and the record untouched');
  ok(before.lures.every((id) => S.lures.includes(id)) && S.lures.includes('seedpod_twirl'), 'every owned lure stays owned (at its water); the Seedpod Twirl is given');
  eq(S.bait.mossmere, before.bait.mossmere, 'the Mossmere\'s tins wait in its bag');
  eq(S.bait.sporewood, { spore_cake: 10 }, 'a tin of Spore Cake, once');
  eq(S.fitted, { lure: null, bait: 'spore_cake' }, 'the start kit fitted');
  eq(S.finds.got, before.finds.got, 'everything found is kept');
  eq(S.found.reel, 'belfry_winch', 'a fitted found reel stays fitted (found things travel)');
  eq(S.home, before.home, 'the barge\'s home items stay with the home');
  eq(S.barge, { water: 'sporewood', towed: ['mossmere', 'sporewood'] }, 'the barge lies at Sporewood');
  const again = L.towTo('sporewood');
  ok(again.ok === true && again.first === false, 'a second towTo to a towed water is the way back: no second carry');
  eq(L.state().carry.rod, 2, 'the carry did not grow twice');
  const fresh = makeEnv();
  fresh.L.state().maps.lakes = ['mossmere'];
  eq(fresh.L.towTo('sporewood'), { ok: false, reason: 'map' }, 'no tow without the lake map (nothing changes)');
  eq(fresh.L.state().tackle, { rod: 0, line: 0, reel: 0 }, 'refused: nothing written');
}

section('the opening\'s tow and loop-tow\'s towBarge: the first water never carries; a later water\'s first towBarge is towTo');
{
  const env = makeEnv();
  env.L.state().tackle = { rod: 1, line: 1, reel: 1 };
  env.L.towBarge('mossmere');
  eq([env.L.state().tackle.rod, env.L.state().carry.rod, env.L.state().gearWater], [1, 0, 'mossmere'], 'the opening\'s tow to the Mossmere: nothing reset, nothing carried');
  const e2 = makeEnv({ meta: fixtureMeta() });
  e2.L.towBarge('sporewood');
  eq([e2.L.state().carry.line, e2.L.state().tackle.line, e2.L.state().gearWater], [2, 0, 'sporewood'], 'loop-tow\'s towBarge(\'sporewood\') makes the same first tow');
}

section('a reload mid-tow: the tow is written in one save (before it: nothing; after it: all of it), and a reload migrates cleanly');
{
  const env = makeEnv({ meta: fixtureMeta() });
  const beforeTow = clone(env.ctx.state.meta);
  env.L.towTo('sporewood');
  const after = clone(env.ctx.state.meta);
  const re = makeEnv({ meta: clone(after) });
  const R = re.L.state();
  eq([R.carry.rod, R.carry.line, R.carry.reel, R.holdSlots, R.gearWater, R.barge.water], [2, 2, 2, 4, 'sporewood', 'sporewood'], 'reloaded after the save: at the new mooring with all of it');
  eq(R.tackle, { rod: 0, line: 0, reel: 0 }, '… the tackle reset survives the reload');
  const back = makeEnv({ meta: clone(beforeTow) });
  eq([back.L.state().tackle.rod, back.L.state().carry.rod, back.L.state().barge.water], [2, 0, 'mossmere'], 'reloaded before the tow\'s save: nothing moved (no way to fail)');
  PL.migrateLoop(re.ctx.state.meta, D);
  eq(re.ctx.state.meta.loop.carry, R.carry, 'migrateLoop again: idempotent');
}

section('the save fixture: an M1-end save written before this lane migrates additively, then the tow → +2 / +2 / +2');
{
  const m = fixtureMeta();
  ok(m.loop.carry === undefined && m.loop.fit === undefined && m.loop.gearWater === undefined, 'the fixture is a block from before lane D2');
  PL.migrateLoop(m, D);
  eq(m.loop.v, PL.LOOP_SCHEMA, 'LOOP_SCHEMA stays (additive keys)');
  eq(m.loop.carry, LC.freshCarry(), 'carry: nothing yet');
  eq(m.loop.gearWater, 'mossmere', 'gearWater: the Mossmere');
  eq(m.loop.fit, { rod: null, line: null, reel: 'belfry_winch' }, 'fit read from `found` once');
  eq(m.loop.eveningsAt, { mossmere: 84 }, 'its evenings were all at the Mossmere');
  const env = makeEnv({ meta: m });
  eq(env.L.holdOf(), { rod: 5, line: 5, reel: 2, cast: 19, carry: { rod: 0, line: 0, reel: 0, cast: 0 } }, 'before the tow: T2 5 / 5, the Belfry Winch\'s 2, the Whalebone\'s 19 m');
  env.L.towTo('sporewood');
  eq(env.L.holdOf(), { rod: 2, line: 2, reel: 4, cast: 17, carry: { rod: 2, line: 2, reel: 2, cast: 1 } }, 'after it: +2 / +2 / +2 carried (the Winch\'s 2 on its +2), 17 m');
  eq(env.L.carried().line, 'Carried +2 · +2 · +2', 'the carried line for the logs');
}

section('the tackle as it works: trip stats and the loadout read the carry and the gear water\'s tiers; the Mossmere\'s as before');
{
  const env0 = makeEnv();
  Object.assign(env0.L.state(), { tackle: { rod: 2, line: 1, reel: 0 } });
  startTrip(env0, 'mossmere');
  env0.P.invalidateStats?.(); const st0 = env0.P.getStats(), lo0 = env0.P.getLoadout();
  eq(st0.castMax, 19, 'the Mossmere, T2 rod: castMax 19 (TACKLE\'s)'); eq(st0.hold, { rod: 5, line: 2, reel: 0 }, '… Hold 5 / 2 / 0 (TACKLE\'s)');
  eq([lo0.rod, lo0.line, lo0.reel, lo0.hold.line], [2, 1, 0, 2], 'the loadout: the tiers and their Hold as before');
  endTrip(env0);
  D.LOOP.shipped = 'sporewood';
  try {
    const env = makeEnv({ meta: fixtureMeta() });
    env.L.towTo('sporewood');
    env.L.buy('line:1');   // (the test's clams: 412, Rootthread at 300)
    const r = startTrip(env, 'sporewood');
    eq(r.zone, 'sporewood', 'a trip at Sporewood (LOOP.shipped raised for the test)');
    env.P.invalidateStats?.(); const st = env.P.getStats(), lo = env.P.getLoadout();
    eq(st.castMax, 17, 'the start rod on the carried metre: 17 m'); eq(st.hold, { rod: 2, line: 5, reel: 4 }, 'Hold: +2 · Rootthread 3 + 2 · the Winch 2 + 2');
    eq([lo.line, lo.hold.line], [1, 5], 'the loadout: Rootthread, its Hold with the carry');
    near(raftStats(D, env.L.state()).speed, 1.0, 'the carried oars: 0.667 × 1.5 m/s', 1e-3);
    endTrip(env);
  } finally { D.LOOP.shipped = 'mossmere'; }
}

section('each water\'s shelf (LAKE2 §5.6, §7.1): its own tiers, creels, raft parts, lures and tins; the Mossmere\'s shelf as before');
{
  const fresh = freshLoopMeta(D).loop;
  const m0 = PL.shelfItems(D, fresh).filter((i) => i.tab === 'tackle' || i.slot === 'hold');
  eq(m0.map((i) => [i.id, i.name, i.price]), [['rod:1', 'Ashwood', 50], ['line:1', 'Braided Gut', 50], ['reel:1', 'Brass Spool', 50], ['hold:4', 'Lidded Creel', 200], ['lure:feather_fly', 'Feather Fly', 50], ['lure:glimmer_spoon', 'Glimmer Spoon', 90], ['lure:bone_jig', 'Bone Jig', 110], ['lure:bell_spinner', 'Harbour-Bell Spinner', 180]],
    'a fresh save\'s shelf: the Mossmere\'s T1s, its four lures, Hold 4');
  const env = makeEnv({ meta: fixtureMeta() });
  const pre = PL.shelfItems(D, env.L.state());
  ok(!pre.some((i) => i.id === 'rod:3'), 'the Sporewood map owned, the barge at the Mossmere: no global T3 (each water\'s tiers are its own)');
  env.L.towTo('sporewood');
  D.LOOP.shipped = 'sporewood';   // (a water's lures and tins are offered once it ships: LOOP.shipped raised for the test)
  const sh = PL.shelfItems(D, env.L.state());
  const by = (id) => sh.find((i) => i.id === id);
  eq(['rod:1', 'line:1', 'reel:1'].map((id) => [by(id)?.name, by(id)?.price, by(id)?.itemId]), [['Stalkwood', 300, 'stalkwood'], ['Rootthread', 300, 'rootthread'], ['Capwheel', 300, 'capwheel']],
    'Sporewood\'s first tiers (×1 in node), each naming its item (for its engraving)');
  ok(PL.shelfItems(D, freshLoopMeta(D).loop).every((i) => i.itemId === undefined && i.gearWater === undefined), 'the Mossmere\'s cards as before (no new fields)');
  eq([by('hold:5')?.name, by('hold:5')?.price, by('hold:4')], ['Rootwoven Creel', 500, undefined], 'Hold 5 its first creel (Hold 4 is carried: never offered)');
  eq(['oars:1', 'keel:1', 'lantern:1'].map((id) => [by(id)?.name, by(id)?.price]), [['Capleaf Oars I', 100], ['Root Keel I', 200], ['Glowcap Lantern I', 200]], 'its own raft parts');
  eq(sh.filter((i) => i.slot === 'lure').map((i) => i.lureId), ['spore_moth', 'ember_minnow', 'root_jig', 'sporelamp_fly'], 'its four lures on the shelf (the Twirl never: the start kit\'s)');
  eq(sh.filter((i) => i.slot === 'tin').map((i) => i.baitId), ['spore_cake', 'amber_larvae'], 'its two tins');
  ok(!sh.some((i) => i.lureId && D.LOOP.lures[i.lureId].water === 'mossmere'), 'no Mossmere lure on Sporewood\'s shelf');
  eq(by('line:1')?.line, D.TEXT_LOOP.shelf.rootthread, 'the card\'s line is the item\'s own');
  ok(gearItems(D, env.L.state()).find((i) => i.id === 'oars:1')?.line === D.TEXT_LOOP.shelfAt.sporewood.oars, 'the raft card\'s line is Sporewood\'s');
  eq(PL.goalOf(sh)?.id, 'line:1', 'the goal line: Rootthread first (GOAL_FIRST)');
  env.L.state().clams = 9999;
  ok(env.L.buy('rod:1').ok && env.L.state().tackle.rod === 1, 'Stalkwood bought: tackle.rod 1 at Sporewood');
  eq(env.L.holdOf().rod, 5, '… Hold 3 + the carried 2');
  ok(env.L.buy('hold:5').ok && env.L.state().holdSlots === 5, 'the Rootwoven Creel: Hold 5');
  ok(env.L.buy('oars:1').ok && env.L.state().raft.oars === 1, 'Capleaf Oars I: a level at Sporewood');
  near(LC.raftLevels(env.L.state()).oars, 1.667, '… on the carried 0.667', 1e-3);
  D.LOOP.shipped = 'mossmere';
}

section('lures and tins at their own water; the way back by the lamps (LAKE2 §6.3): the Mossmere\'s wait there, the tackle travels');
{
  const env = makeEnv({ meta: fixtureMeta() });
  const { L } = env;
  L.towTo('sporewood');
  ok(L.fit('lure', 'glimmer_spoon').ok === false, 'at Sporewood a Mossmere lure is refused');
  ok(L.fit('lure', 'guard_button').ok === true, 'the found Gate-Guard\'s Button works at every water');
  ok(L.fit('lure', 'seedpod_twirl').ok === true, 'the Seedpod Twirl fits');
  ok(L.changeHook({ lure: 'bone_jig' }).ok === false, 'changeHook refuses a Mossmere lure at Sporewood');
  ok(LC.lureHere(D, 'spore_moth', 'sporewood') && !LC.lureHere(D, 'spore_moth', 'mossmere') && LC.lureHere(D, 'guard_button', 'sporewood'), 'lureHere: its own water, or found');
  const back = L.towTo('mossmere');
  ok(back.ok && back.first === false, 'the way back: no carry, the barge at the Mossmere');
  eq([L.state().gearWater, L.state().tackle.rod, L.state().carry.rod], ['sporewood', 0, 2], 'the gear travels as it is (Sporewood\'s tiers and the carry)');
  ok(L.fit('lure', 'glimmer_spoon').ok === true, 'the Mossmere\'s lures are back');
  ok(L.fit('lure', 'spore_moth').ok === false || !L.state().lures.includes('spore_moth'), 'Sporewood\'s lures wait at Sporewood');
  const sh = PL.shelfItems(D, L.state());
  ok(sh.some((i) => i.lureId === 'glimmer_spoon') && !sh.some((i) => i.lureId === 'spore_moth'), 'the Mossmere\'s shelf: its own lures');
  eq(sh.find((i) => i.id === 'rod:1')?.name, 'Stalkwood', '… and the gear water\'s tiers (bought gear is the newest water\'s)');
  eq(L.state().bait.mossmere.mireworm, 7, 'the Mossmere\'s tins waited in its bag');
}

section('the line\'s cap by its total Hold (LAKE2 §5.6): the Mossmere\'s caps unchanged for every fish and hook; Sporewood\'s by lineAt');
{
  let same = 0, n = 0;
  const hooks = [{}, ...WC.HOOK_ITEMS.filter((x) => x !== 'bare').map((id) => (WC.LURE_IDS.includes(id) ? { lure: id } : { bait: id }))];
  for (const id of Object.keys(WC.WATERCRAFT.mossmere.hook.table)) for (const h of hooks) for (const t of [0, 1, 2]) {
    const a = WC.gearCap(D, id, { ...h, line: t }), b = WC.gearCap(D, id, { ...h, line: t, lineHold: D.LOOP.gear.mossmere.line[t].hold, water: 'mossmere' });
    n++; if (JSON.stringify(a) === JSON.stringify(b)) same++;
  }
  eq(same, n, `the Mossmere: the cap by the line's Hold equals the cap by its tier (${n} fish × hook × tier)`);
  const cap = (lineHold) => WC.gearCap(D, 'velvet_ray', { lure: 'root_jig', lineHold, water: 'sporewood' })?.cls;
  eq([cap(2), cap(5), cap(9)], ['prize', 'trophy', 'elder'], 'Sporewood (the Ray on its right lure): the carried +2 alone Prize; Rootthread (2 + 3) Trophy; Mothsilk (2 + 7) Elder');
  eq(WC.gearCap(D, 'velvet_ray', { bait: 'spore_cake', lineHold: 9, water: 'sporewood' })?.cls, 'prize', 'a fish that only likes the hook stays at Prize (the grade term)');
  eq([WC.gearCap(D, 'weeping_carp', { bait: 'lumen_moss', line: 0, lineHold: 4, water: 'mossmere' })?.cls, WC.gearCap(D, 'weeping_carp', { bait: 'lumen_moss', line: 0, lineHold: 9, water: 'mossmere' })?.cls],
    ['trophy', 'elder'], 'the way back: the start Twine on the carried +4 reads Trophy at the Mossmere, Sporewood\'s Mothsilk Elder (its figures)');
  eq(WC.gearCap(D, 'netcloud_fry', { lure: 'seedpod_twirl', lineHold: 9, water: 'sporewood' })?.cls, 'keeper', 'the free Twirl lands up to Keeper');
  eq(WC.gearCap(D, 'lostsea_mackerel', { bait: 'cut_strip', lineHold: 9, water: 'sporewood' })?.cls, 'prize', 'Cut Strip at Prize, at every water');
  eq(WC.gradeOf('nightbloom_carp', { bait: 'amber_larvae', water: 'sporewood' }), 3, 'the Nightbloom Carp\'s own row at Sporewood (its guest row is the Mossmere\'s)');
  eq(WC.gradeOf('nightbloom_carp', { bait: 'lumen_moss' }), 3, '… and its guest row at the Mossmere, unchanged');
  eq(WC.gradeTargets('sporelamp_fly', D, 'sporewood'), ['harpstring_eel', 'festival_puffer'], 'the Spore-Lamp Fly helps its giants (as the Spinner its)');
}

section('the Journal\'s gate line and hint read the fish\'s own water; a guest (the Nightbloom Carp) is read at its host water, the Mossmere');
{
  const L = freshLoopMeta(D).loop; L.bait.mossmere = { lumen_moss: 5, mireworm: 3 };
  eq(PL.gateLine(D, L, 'nightbloom_carp')?.text, 'Lands up to Prize.', 'the guest at the Mossmere: the Mossmere\'s guest row and its line (as before)');
  eq(PL.gateLine(D, L, 'weeping_carp')?.kind, 'upTo', 'a Mossmere fish: its line, as before');
  const S = clone(L); S.barge = { water: 'sporewood', towed: ['mossmere', 'sporewood'] }; S.gearWater = 'sporewood'; S.carry = { ...LC.freshCarry(), line: 2 };
  S.bait.sporewood = { spore_cake: 10 };
  eq(PL.gateLine(D, S, 'velvet_ray')?.text, 'Lands up to Prize.', 'a Sporewood fish at Sporewood: its own table, its tins, the carried line (Prize)');
}

section('the first evenings at a water reached by a tow (LOOP.arrival; the user\'s answer 2): over-cap fish land at the cap, Fight −10 · −6 · −3');
{
  eq(LC.arrivalOf(D, freshLoopMeta(D).loop, 'mossmere'), null, 'the first water (the opening\'s) has none');
  D.LOOP.shipped = 'sporewood';
  try {
    const env = makeEnv({ meta: fixtureMeta() });
    eq(LC.arrivalOf(D, env.L.state(), 'sporewood'), null, 'a water not yet towed to has none');
    env.L.towTo('sporewood');
    const seen = [];
    for (let k = 0; k < 4; k++) { const r = startTrip(env, 'sporewood'); seen.push(r.arrival ?? null); endTrip(env); }
    eq(seen, [{ k: 1, cap: true, fight: -10 }, { k: 2, cap: true, fight: -6 }, { k: 3, cap: true, fight: -3 }, null], 'evenings 1–3 at Sporewood, then whole');
    eq(env.L.state().eveningsAt.sporewood, 4, 'the evenings counted at their water');
    env.L.towTo('mossmere');
    const r = startTrip(env, 'mossmere');
    ok(r.arrival === undefined, 'never on the way back to the first water');
    endTrip(env);
  } finally { D.LOOP.shipped = 'mossmere'; }
}

section('Murk\'s orders by water (LAKE2 §7.2): the Mossmere\'s open orders wait at the Mossmere; Sporewood rolls its own');
{
  const ml = clone(fixtureMeta().loop);
  PL.migrateLoop({ loop: ml }, D);
  eq(ml.orders.map((o) => orderWater(D, o)), ['mossmere'], 'an order without a water is the first water\'s');
  ml.barge = { water: 'sporewood', towed: ['mossmere', 'sporewood'] };
  const added = refillOrders(D, ml, { listFor: PL.listFor });
  ok(added.length === 2 && added.every((o) => o.water === 'sporewood' && D.SPECIES_BY_ID[o.speciesId]?.zone === 'sporewood'), 'at Sporewood, Order Board II chalks two of Sporewood\'s fish');
  eq(ml.orders.filter((o) => orderWater(D, o) === 'mossmere').length, 1, 'the Mossmere\'s open order waits');
  ml.barge.water = 'mossmere';
  eq(refillOrders(D, ml, { listFor: PL.listFor }).length, 1, 'back at the Mossmere: its board fills to two of its own');
}

section('fitTackle (the Tackle screen\'s, lane G): a lower tier, a found piece, the best bought; refused while a fish is on');
{
  const env = makeEnv({ meta: fixtureMeta() });
  const { L } = env;
  ok(L.fitTackle('line', 'braided_gut').ok, 'a lower Mossmere line fitted');
  eq(L.holdOf().line, 2, '… its Hold in place of the Waxed Silk\'s');
  ok(L.fitTackle('line', 'mothsilk').ok === false, 'a tier of another water (or above the bought one) refused');
  ok(L.fitTackle('reel', null).ok && L.state().found.reel === null && L.holdOf().reel === 5, 'the Winch off: the best bought (Clockwork\'s 5)');
  ok(L.fitTackle('reel', 'belfry_winch').ok && L.state().fit.reel === 'belfry_winch' && L.holdOf().reel === 2, 'the found Winch back on (fitFound): fit and found agree');
  ok(L.fitTackle('line', null).ok && L.holdOf().line === 5, 'the line back to the best bought');
}

section('T104 on Sporewood\'s pools: the game\'s pool (castOdds on data.placePool with water \'sporewood\', as fishing.js builds it) is the sim\'s');
{
  const SIM = await import('../sim/clams.mjs');
  SIM.shipSporewood();
  const HOOKS = [{}, { bait: 'spore_cake' }, { bait: 'amber_larvae' }, { bait: 'cut_strip' }, { bait: 'glowcap_bulb' },
    { lure: 'spore_moth' }, { lure: 'ember_minnow' }, { lure: 'root_jig' }, { lure: 'sporelamp_fly' }, { lure: 'seedpod_twirl' }];
  const LIGHTS = { day: 'calm', dusk: 'dusk', night: 'gloomtide' }, ball = D.LOOP.legendBait.sporewood.id, gb = (b) => (b === ball ? null : b ?? null);
  let n = 0, worst = 0; const bad = [];
  for (const place of [null, ...D.loopPlaceIds('sporewood')]) {
    for (const [ph, gph] of Object.entries(LIGHTS)) for (const h of HOOKS) for (const wick of [null, 'taper']) {
      const pool = D.placePool(D.SPECIES, { placeId: place, phase: gph, bait: gb(h.bait), wickId: wick, water: 'sporewood' });
      const game = WC.castOdds(D, { pool, area: null, phase: gph, lure: h.lure ?? null, bait: gb(h.bait), wickId: wick, water: 'sporewood' });
      const sim = SIM.poolFor('sporewood', pool.place, ph, h.lure ?? null, h.bait ?? null, null, 1, wick, null);
      const a = new Map(), b = new Map();
      for (const [sp, w] of sim.list) a.set(sp.id, (a.get(sp.id) || 0) + w / sim.tot);
      for (const e of game.entries) b.set(e.sp.id, (b.get(e.sp.id) || 0) + e.p);
      for (const id of new Set([...a.keys(), ...b.keys()])) { const d = Math.abs((a.get(id) ?? 0) - (b.get(id) ?? 0)); worst = Math.max(worst, d); if (d > 1e-9) bad.push(`${place ?? "open"} ${ph} ${JSON.stringify(h)} ${wick}: ${id} sim ${(a.get(id) ?? 0).toFixed(3)} game ${(b.get(id) ?? 0).toFixed(3)}`); }
      n++;
    }
  }
  ok(!bad.length && n === 5 * 3 * 10 * 2, `T104 on Sporewood: ${n} pools, every share the same (worst ${worst.toExponential(1)})${bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''}`);
  const bare = WC.castOdds(D, { pool: D.placePool(D.SPECIES, { placeId: null, phase: 'calm', bait: null, water: 'sporewood' }), area: null, phase: 'calm', water: 'sporewood' });
  const strays = bare.entries.filter((e) => e.g === 0), takers = bare.entries.filter((e) => e.g >= 1).map((e) => e.sp.id).sort();
  eq(takers, ['capshell_crayfish', 'falsesmile_barb', 'netcloud_fry'], 'the bare hook at Sporewood brings its three commons');
  ok(strays.length > 0 && strays.every((e) => e.p <= 0.0101), `every other fish a stray, at most 1 cast in 100 (the user's 1% rule; the largest ${(Math.max(...strays.map((e) => e.p)) * 100).toFixed(2)}%)`);
}

console.log(`\nloop-carry: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
