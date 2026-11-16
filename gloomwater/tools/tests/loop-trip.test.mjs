// The Full Hold's trip harness (slice-1a PLAN §1.2, lane A; SPEC §13 slice 1a; WICKS.md §5's T76–T80): a real progression module
// (progression.js with progression-loop.js wired in) on the loop's data, a fake ctx, and the bus events fishing and main would send.
// A trip is started as main's startTrip starts it (createRun → zone:change {sail} → run:start); a bite is fishing:bite {waterKey};
// a landing is makeFish + measure (main saves on fish:measured); a reload is a new ctx built from the last save.
//   node tools/tests/loop-trip.test.mjs   (or node tools/check.mjs)
import * as THREE from 'three';
import * as dataV1 from '../../src/data.js';               // evaluated first: no flags → the flag-off build
import { createBus, defaultMeta, normalizeSave } from '../../src/core.js';
import { create, migrateSave as migrateSaveModule, sellStrandedTrip } from '../../src/progression.js';
import * as PL from '../../src/progression-loop.js';

globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
const dataV3 = await import('../../src/data.js?loop-trip-v3');   // v3 without the loop
const { loadLoopData, freshLoopMeta } = await import('./loop-fixture.mjs');
const D = await loadLoopData({ query: 'loop-trip' });

let pass = 0, fail = 0;
const failures = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; failures.push(msg); console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const near = (a, b, msg, eps = 1e-9) => ok(Math.abs(a - b) <= eps, `${msg} (got ${a}, want ${b})`);
const section = (s) => console.log(`- ${s}`);
const clone = (o) => JSON.parse(JSON.stringify(o));
const tick = () => new Promise((res) => setTimeout(res, 0));
const OPEN = 'open:mossmere';

/** A progression with a fake ctx (the progression-af test's shape) on `data`, its meta, and an event log. */
function makeEnv({ data = D, meta = freshLoopMeta(D), run = null, debug = false } = {}) {
  const bus = createBus();
  const events = [];
  const phase = { phase: 'calm', day: 1, time: 0, duration: 40 };
  const calls = { xp: [], saves: [], setCharacter: [], gate: [] };
  const ctx = {
    THREE, bus, data,
    state: { meta, run: null },
    time: { dt: 0.016, gameDt: 0.016, t: 0, gameT: 0, timeScale: 1, frame: 1 },
    flow: 'playing', paused: false, debug: {}, errors: [], isMobile: false, input: {},
    core: { debugEnabled: () => debug },
    game: { save() { const r = ctx.state.run; calls.saves.push(clone({ meta: ctx.state.meta, run: r && r.active ? r : null })); } },
    survival: { getPhaseInfo: () => ({ ...phase, k: phase.time / phase.duration, isNight: phase.phase === 'gloomtide' }), addOil() {}, addSatiety() {}, heal() {} },
    actors: { merchant: { present: false, position: new THREE.Vector3(), arrive() { this.present = true; }, leave() { this.present = false; } },
      setRaftLevel() {}, setCharacter(c) { calls.setCharacter.push(c?.id ?? c); } },
    world: { getMerchantDock: () => ({ position: new THREE.Vector3(24, 0, 38), yaw: 1 }), setGateState(s) { calls.gate.push(s); }, getGate: () => null, getDepth: () => 0.5 },
    player: { position: new THREE.Vector3(0, 0, 0), isNear() { return true; } },
    combat: { addXp(n, info) { calls.xp.push({ n, info }); } },
    fishing: { state: 'idle', spots: [], signs: [], addSpots() {}, armChum() {} },
    ui: { isBlocking: () => false, isShopOpen: () => false, floatText() {} },
  };
  const origEmit = bus.emit.bind(bus);
  bus.emit = (evt, payload = {}) => { events.push({ evt, payload }); origEmit(evt, payload); };
  ctx.progression = create(ctx);
  ctx.progression.init();
  // main's save points (CONTRACT §13.1): fish:measured while playing; a requestSave's microtask calls game.save itself
  bus.on('fish:measured', () => { if (ctx.flow === 'playing') ctx.game.save(); });
  const env = { ctx, events, phase, calls, P: ctx.progression, L: ctx.progression.loop,
    count: (e) => events.filter((x) => x.evt === e).length, last: (e) => [...events].reverse().find((x) => x.evt === e)?.payload,
    lastSave: () => calls.saves[calls.saves.length - 1] };
  if (run) { ctx.state.run = run; bus.emit('zone:change', { zone: run.zone, prev: null }); bus.emit('run:start', { continued: true }); }
  return env;
}
/** main's startTrip (PLAN §2.2 item 3): createRun → the run → zone:change {sail} → run:start, no write to meta.runs. */
function startTrip(env, opts = {}) {
  const { ctx, P } = env;
  const r = P.createRun({ startZone: opts.water || 'mossmere', character: opts.character ?? null, nightMode: 'still', outing: 'trip' });
  ctx.state.run = r; ctx.flow = 'playing';
  ctx.bus.emit('zone:change', { zone: r.zone, prev: null, sail: true });
  ctx.bus.emit('run:start', { continued: false });
  return r;
}
const bite = (env, key = OPEN, extra = {}) => env.ctx.bus.emit('fishing:bite', { sizeClass: 'keeper', biteTell: 'steady', waterKey: key, ...extra });
/** A bite and a landing through progression's real path: fishing:bite {waterKey}, makeFish(id, z), measure (the card opens). */
function land(env, id, z, { key = OPEN, place = null, extra = {} } = {}) {
  bite(env, key, extra);
  const fish = env.P.makeFish(id, z, 'normal', { place });
  env.P.measure(fish);
  return fish;
}
/** A reload: a new ctx from the last save (migrateSave, normalizeSave), then main's Continue (run:start {continued: true}). */
function reload(env, { data = D } = {}) {
  const raw = clone(env.lastSave());
  migrateSaveModule(raw, data);
  const { meta, run } = normalizeSave(raw);
  return makeEnv({ data, meta, run });
}
const endTrip = (env) => { const t = env.L.endTrip(); env.ctx.state.run = null; env.ctx.flow = 'home'; return t; };
const sp = (id) => D.SPECIES_BY_ID[id];
const price = (id, z) => D.fishClams(sp(id), z);

// =====================================================================================
section('the switch: the loop exists only in the loop build (T39)');
{
  for (const [name, data] of [['v1', dataV1], ['v3 without the loop', dataV3]]) {
    const env = makeEnv({ data, meta: defaultMeta() });
    ok(env.P.loop === null && env.P.getBitesLeft('open:mossmere') === null, `${name}: progression.loop is null and getBitesLeft null`);
    const r = env.P.createRun({});
    ok(r.outing !== 'trip' && !('bites' in r) && !('evening' in r), `${name}: createRun never builds a trip`);
    eq(env.ctx.state.meta.loop, undefined, `${name}: no meta.loop is written`);
  }
  const env = makeEnv();
  ok(env.L && PL.LOOP_METHODS.every((k) => typeof env.L[k] === 'function'), 'the loop build: progression.loop carries every LOOP_METHODS method');
  eq(Object.keys(env.L).sort(), PL.LOOP_METHODS.slice().sort(), 'progression.loop is exactly LOOP_METHODS');
  ok(typeof sellStrandedTrip === 'function', 'sellStrandedTrip is a module export of progression.js (main finds it with moduleExport)');
  eq(env.L.isOpen('mossmere') && !env.L.isOpen('sporewood'), true, "T81: isOpen('mossmere'), not 'sporewood', on a fresh meta.loop");
}

// =====================================================================================
section('createTrip (§2.1 item 6, T34, T45, T60) and a trip\'s stats (T1, T61)');
{
  const meta = freshLoopMeta(D);
  meta.relics = { drifters_bundle: 2, old_debt: 4 };                 // an old save's start-kit and start-Shells relics
  meta.challenges = Object.fromEntries((D.CHALLENGES || []).map((c) => [c.id, true]));
  meta.lastCharacter = 'tallow'; meta.runs = 7;
  meta.loop.wick = 'stub';
  const env = makeEnv({ meta });
  const r = startTrip(env, { water: 'sporewood', character: 'taper' });
  ok(r.outing === 'trip' && r.nightMode === 'still' && r.zone === 'mossmere', "T45: a water not open falls back to the Mossmere; outing 'trip', night 'still'");
  eq(r.character, 'stub', "T60: the trip's Wick is meta.loop.wick");
  eq([r.shells, r.bait, r.boons, r.upgrades, r.lures, r.equippedBait, r.equipped], [0, {}, {}, {}, {}, null, null], 'T34: no Shells, no free bait, no start boon, no kit');
  eq([r.creel, r.bites, r.mercy, r.evening, r.comeback, r.flags.openBite, r.flags.taperFirst], [[], {}, {}, 1, null, null, false], 'a fresh trip: an empty hold, no bites, evening 1');
  ok(meta.runs === 7 && meta.lastCharacter === 'tallow', 'CHOICE 3: meta.runs and meta.lastCharacter are never written');
  const st = env.P.getStats();
  eq(st.creelSize, 3, 'T1: 3 slots on a fresh meta.loop');
  ok(st.lightRadius === D.STATS.lightRadius.base + 1.5 && st.moveSpeed === D.STATS.moveSpeed.base && st.maxHp === D.STATS.maxHp.base, "T61: Stub's only stat is its light (+1.5); none of the built Stub's effects");
  eq([st.castMax, st.hookWindow], [D.TACKLE.rod[0].castMax, D.TACKLE.rod[0].hookWindow], "T61: castMax and hookWindow are the rod's absolute values");
  r.upgrades = { mended_creel: 2 }; env.P.invalidateStats();
  eq(env.P.getStats().creelSize, 3, 'T1: a Mended Creel changes nothing on a trip');
  // every Wick's stats (T61, WICKS §5)
  for (const w of D.LOOP.wicks.order) {
    const run = { ...r, character: w, upgrades: {} };
    const s = env.P.getStats(run);
    const want = {};
    for (const k of Object.keys(D.STATS)) want[k] = D.STATS[k].base;
    want.castMax = D.TACKLE.rod[0].castMax; want.hookWindow = D.TACKLE.rod[0].hookWindow;
    for (const [k, v] of Object.entries(D.LOOP.wicks[w].stats)) want[k] += v;
    want.creelSize = D.loopSlots(meta.loop, w);
    const got = Object.fromEntries(Object.keys(D.STATS).map((k) => [k, s[k]]));
    eq(got, want, `T61: ${w}'s trip stats are the bases, the rod's, its LOOP.wicks stats and loopSlots`);
  }
  eq(env.P.getStats({ ...r, character: 'tallow' }).creelSize, 4, "T61/T79: Tallow's creel is one slot bigger");
  eq(env.P.getStats().hold, { rod: 0, line: 0, reel: 0 }, 'the trip stats carry the loop tackle\'s Hold');
  meta.loop.tackle.rod = 6;
  eq([env.P.getStats({ ...r }).castMax], [D.TACKLE.rod[4].castMax], 'CHOICE 13: a T6 rod reads TACKLE.rod[4]\'s absolute values');
  meta.loop.tackle.rod = 0;
  eq(env.ctx.errors, [], 'no errors');
}

// =====================================================================================
section('the hold: keep, the refused keep, let go, the measure (T1, T2, T4, T5, T6, T28)');
{
  const meta = freshLoopMeta(D);
  const env = makeEnv({ meta });
  const r = startTrip(env);
  const mem0 = [meta.memories, meta.memoriesEarnedTotal];
  const f1 = land(env, 'dusk_minnow', 0.4);
  ok(r.creel.length === 0 && env.P.getPendingCatch().some((f) => f.uid === f1.uid), 'T5: measure leaves the hold unchanged; the fish waits on the card');
  ok(r.shells === 0 && meta.memories === mem0[0] && meta.memoriesEarnedTotal === mem0[1] && env.calls.xp.length === 0, 'T5/T28: the measure pays nothing (no Shells, no Memories, no XP)');
  const landed = env.last('fish:landed');
  ok(landed.clams === 7 && landed.holdFull === false && landed.firstShells === 0 && landed.xp === 0, 'fish:landed carries clams (7: T18) and holdFull; firstShells and xp 0');
  ok(f1.measured === true && f1.waterKey === OPEN, 'the fish carries measured and its waterKey');
  ok(meta.journal.dusk_minnow.caught === 1 && meta.journal.dusk_minnow.firstEvening === 1 && meta.journal.dusk_minnow.lastLengths.length === 1, 'T4: the record is written at the measure (count, firstEvening, last lengths)');
  ok(r.flags.pendingCatch?.length === 1 && env.lastSave().run.flags.pendingCatch[0].uid === f1.uid, "main's save on fish:measured carries the card's fish");
  ok(!env.events.some((e) => e.evt === 'toast'), 'no toast on a trip (no Memories, Shells or Journal lines)');
  const k1 = env.P.fishAction(f1, 'keep');
  ok(k1.ok && k1.gained.clams === 7 && f1.clams === 7 && r.creel.length === 1, 'Keep: the stamped price, into the hold');
  eq(env.last('fish:action'), { action: 'keep', fish: f1, gained: { clams: 7 } }, 'fish:action {keep, gained: {clams}}');
  ok(!r.flags.pendingCatch, 'the card is closed (pendingCatch cleared)');
  // let go (T6)
  const before = env.L.bitesSpent(OPEN);
  const f2 = land(env, 'mossback_perch', 0.1);
  eq(env.L.bitesSpent(OPEN), before + 1, 'a bite spends one');
  const g = env.P.fishAction(f2, 'letgo');
  ok(g.ok && env.L.bitesSpent(OPEN) === before && r.mercy[OPEN] === 0.2 && g.gained.favour === 0.2 && g.gained.bite === 1, 'T6: let go gives the bite back and +0.2 there');
  eq(env.last('fish:action').action === 'release' && env.last('fish:action').letgo === true, true, "Let go is fish:action {action: 'release', letgo: true}");
  ok(meta.journal.mossback_perch.caught === 1, 'T4: a fish let go keeps its record');
  for (const z of [0, 0.1]) env.P.fishAction(land(env, 'gutter_crayfish', z), 'letgo');
  ok(r.mercy[OPEN] === 0.4 && (r.mercy.lily_maze ?? 0) === 0, 'T6: to +0.4 at most; another water\'s mercy stays 0');
  eq(env.P.fishAction(f1, 'letgo').ok, false, 'kept stays kept: a fish in the hold cannot be let go');
  ok(['eat', 'render', 'burn', 'sell'].every((a) => env.P.fishAction(land(env, 'dusk_minnow', 0), a).ok === false), "Eat, Render, Burn and Sell do nothing on a trip");
  // fill the hold (T2)
  const cards = env.P.getPendingCatch();
  env.P.fishAction(cards[0], 'keep');
  env.P.fishAction(land(env, 'weeping_carp', 0.3), 'keep');
  ok(r.creel.length === 3 && env.L.holdFull() === true && env.L.hold().full === true, 'three kept: the hold is full');
  const f4 = land(env, 'reedjaw_pike', 1.0);
  ok(env.last('fish:landed').holdFull === true, "the 4th card says the hold is full (Keep dimmed)");
  const n0 = env.count('loop:holdFull');
  const k4 = env.P.fishAction(f4, 'keep');
  ok(k4.ok === false && k4.full === true && r.creel.length === 3 && env.count('loop:holdFull') === n0 + 1 && env.last('loop:holdFull').via === 'keep', 'T2: the 4th keep is refused, loop:holdFull {via: keep}');
  ok(env.P.fishAction(f4, 'letgo').ok, 'it can still be let go');
  ok(meta.memories === mem0[0] && meta.memoriesEarnedTotal === mem0[1] && r.shells === 0, 'T28: no Memories or Shells through keep and let go');
  eq(env.ctx.errors, [], 'no errors');
}

// =====================================================================================
section('quiet water (T8, T10, T11, T12) and the counters (T55)');
{
  const env = makeEnv();
  const r = startTrip(env);
  const bus = env.ctx.bus;
  bite(env); bus.emit('fishing:miss', { reason: 'passed' });           // passed
  bite(env); bus.emit('fishing:escaped', { reason: 'thrown' });        // lost
  env.P.measure(env.P.makeFish('dusk_minnow', 0, 'normal', {}));       // (a measure without a bite spends nothing)
  bus.emit('fishing:miss', { reason: 'spooked', waterKey: OPEN });     // spooked: counted from the miss
  bus.emit('fishing:miss', { reason: 'moved' });                       // a cancelled line spends nothing
  eq(env.L.bitesSpent(OPEN), 3, 'T8: passed, lost and spooked each spend one; a measure and a cancel do not');
  ok(r.flags.openBite === null, 'the open bite closes on a miss or a loss');
  const F = env.L.favour(OPEN);
  eq(Object.keys(F).sort(), ['favour', 'good', 'mercy', 'over', 'quiet', 'spent', 'waitMult'], "T11: favour(key)'s field names are exactly §3.3's");
  eq([F.good, F.spent, F.over, F.quiet, env.L.bitesLeft(OPEN), env.P.getBitesLeft(OPEN)], [4, 3, 0, false, 1, 1], 'T10: 4 good bites at hold 3; one left');
  bite(env);
  const Q = env.L.favour(OPEN);
  ok(Q.quiet === true && Q.over === 1 && Q.favour === -0.15 && Q.waitMult === 1.3 && env.L.bitesLeft(OPEN) === 0, 'T10/T11, CHOICE 17: quiet after 4; the 5th bite is already −0.15, ×1.3');
  for (let i = 0; i < 12; i++) bite(env);
  eq([env.L.favour(OPEN).favour, env.L.favour(OPEN).waitMult], [-1.2, 2.2], 'T11: floors at −1.2, ×2.2');
  for (const ph of ['dusk', 'gloomtide']) bus.emit('phase:change', { phase: ph });
  eq(env.L.bitesSpent(OPEN), 16, 'T12: dusk and night leave run.bites');
  const c1 = env.P.getFishingCounters();
  ok(c1.evening === 1 && c1.expedition === 1 && c1.firstExpedition === true && c1.hurry === false && c1.strikeRing === true, 'T55: evening 1 shows the ring and refuses the hurry');
  endTrip(env);
  const r2 = startTrip(env);
  eq([r2.bites, env.L.bitesSpent(OPEN), r2.evening], [{}, 0, 2], 'T12: home resets the bites; the next trip is evening 2');
  const c2 = env.P.getFishingCounters();
  ok(c2.evening === 2 && c2.hurry === true && c2.firstExpedition === false, 'T55: evening 2 allows the hurry');
  env.ctx.state.meta.loop.holdSlots = 4; env.P.invalidateStats();
  eq(env.L.favour(OPEN).good, 5, 'T10: 5 good bites at hold 4');
  eq(env.P.getPressure('lily_maze'), 0, 'pressure is 0 on a trip (quiet water replaces it)');
  bus.emit('fishing:caught', { speciesId: 'dusk_minnow', pressureKey: 'lily_maze', fish: {} });
  ok(!r2.pressure, 'no pressure is written on a trip');
  eq(env.ctx.errors, [], 'no errors');
}

// =====================================================================================
section('the tally: pays once, a reload during it, clams persist (T19, T21, T22, T28, T38)');
{
  const meta = freshLoopMeta(D);
  meta.loop.wick = 'taper';                                          // a Wick that sells at the base (the Wick's firsts: T76)
  const env = makeEnv({ meta });
  const r = startTrip(env);
  const keepIt = (id, z) => { const f = land(env, id, z); env.P.fishAction(f, 'keep'); return f; };
  const a = keepIt('weeping_carp', 0.4), b = keepIt('dusk_minnow', 0.4);
  const m1 = keepIt('belled_matriarch', 0);
  ok(m1.clams === 500, 'T38: a kept Matriarch is stamped at her crown, 500');
  meta.loop.holdSlots = 4; env.P.invalidateStats();
  const m2 = keepIt('belled_matriarch', 0.2);
  ok(m2.clams === 200, 'T38: a second one in the same trip 200 (×0.4)');
  const hold = clone(r.creel);
  ok(JSON.parse(JSON.stringify(a)).clams === a.clams, "T19: a kept fish's clams survive a JSON round-trip");
  const nSave = env.calls.saves.length;
  const t = env.L.endTrip();
  ok(env.calls.saves.length === nSave + 1, 'endTrip saves at once (synchronously)');
  const saved = env.lastSave();
  ok(saved.run === null && saved.meta.loop.clams === t.total && saved.meta.loop.lastTrip.id === r.id, 'T22: the save endTrip writes has run null and the paid clams');
  const total = a.clams + b.clams + 500 + 200;
  ok(t.total === total && meta.loop.clams === total && meta.loop.evenings === 1, `T21: the tally pays ${total} once`);
  eq(t.lines.map((l) => l.uid), [b.uid, a.uid, m1.uid, m2.uid], 'the rows: lightest first, legends after');
  ok(t.lines.every((l) => !('weight' in l) && l.length > 0), 'a row stores the length, never a weight (pounds)');
  eq([meta.loop.legends, t.seen, t.zone, r.creel, r.active], [{ belled_matriarch: 2 }, false, 'mossmere', [], false], 'the tally: legends counted, unseen, the hold empty, the run over');
  eq(env.last('loop:tally').total, total, 'loop:tally carries the result');
  const again = env.L.endTrip();
  ok(again.already === true && again.total === total && meta.loop.clams === total, 'T21: a second endTrip returns {already: true} and pays nothing');
  ok(meta.memories === 0 && meta.memoriesEarnedTotal === 0, 'T28: no Memories at the tally');
  // a reload during the tally: the boot sees the paid meta and no run
  const env2 = makeEnv({ meta: normalizeSave(migrateSaveModule(clone(saved), D)).meta });
  ok(env2.ctx.state.run === null && env2.L.endTrip() === null && env2.L.state().clams === total, 'T22: a boot from it pays nothing more');
  ok(env2.L.lastTrip().id === r.id && env2.L.lastTrip().seen === false, 'T22: the replayed tally reads lastTrip');
  env2.L.markTallySeen(r.id);
  ok(env2.L.lastTrip().seen === true, 'Sold marks the tally seen');
  const n = normalizeSave({ meta: clone(env2.ctx.state.meta), run: null });
  eq(n.meta.loop.clams, total, 'T19: meta.loop.clams survives normalizeSave');
  void hold;
  // an empty hold
  const env3 = makeEnv();
  startTrip(env3);
  const e = env3.L.endTrip();
  ok(e.total === 0 && e.lines.length === 0 && env3.L.state().evenings === 1, 'an empty hold: a tally of nothing, the evening still counted');
  eq(env.ctx.errors, [], 'no errors');
}

// =====================================================================================
section('Continue: the card reopens (T7), the open bite (T48), the trip\'s state (T32)');
{
  const env = makeEnv();
  const r = startTrip(env);
  env.P.fishAction(land(env, 'dusk_minnow', 0.4), 'keep');
  const card = land(env, 'weeping_carp', 0.6);
  const spent = env.L.bitesSpent(OPEN), j = env.ctx.state.meta.journal.weeping_carp.caught;
  r.phase = 'dusk'; r.phaseTime = 7.5; r.pos = { x: 3, z: 4, yaw: 1 }; r.mercy[OPEN] = 0.2;
  env.ctx.game.save();
  const back = reload(env);
  const r2 = back.ctx.state.run;
  ok(back.P.getPendingCatch().some((f) => f.uid === card.uid) && r2.creel.length === 1, 'T7: the card fish is back on the card, the hold unchanged');
  ok(!back.events.some((e) => e.evt === 'fish:landed'), 'fish:landed waits for a microtask (after every run:start listener)');
  await tick();
  const re = back.last('fish:landed');
  ok(re?.restored === true && re.fish.uid === card.uid && re.clams === price('weeping_carp', 0.6) && re.measured === true, 'T7: fish:landed {restored: true, clams} reopens it');
  const iStart = back.events.findIndex((e) => e.evt === 'run:start'), iLanded = back.events.findIndex((e) => e.evt === 'fish:landed');
  ok(iStart >= 0 && iLanded > iStart, 'T7: after run:start');
  back.P.measure(back.P.getPendingCatch()[0]);
  ok(back.count('fish:measured') === 0 && back.ctx.state.meta.journal.weeping_carp.caught === j, 'T7: measure is not called again (the fish carries measured)');
  eq([back.L.bitesSpent(OPEN), r2.mercy[OPEN], r2.phase, r2.phaseTime, r2.pos], [spent, 0.2, 'dusk', 7.5, { x: 3, z: 4, yaw: 1 }], 'T32: the bites, the mercy, the clock and the place survive');
  ok(back.P.fishAction(back.P.getPendingCatch()[0], 'keep').ok && r2.creel.length === 2, 'the restored card keeps');
  // T48: a reload in the reveal (a bite spent, no card yet) refunds it; with the card open it refunds nothing
  const env3 = makeEnv();
  startTrip(env3);
  bite(env3);
  ok(env3.L.bitesSpent(OPEN) === 1 && env3.ctx.state.run.flags.openBite === OPEN, 'T48: noteBite opens run.flags.openBite');
  await tick();
  ok(env3.lastSave().run.flags.openBite === OPEN, 'T48: the bite is saved open (requestSave)');
  const back3 = reload(env3);
  eq([back3.L.bitesSpent(OPEN), back3.ctx.state.run.flags.openBite], [0, null], 'T48: reloaded in the reveal, the bite is refunded');
  const env4 = makeEnv();
  startTrip(env4);
  const c4 = land(env4, 'dusk_minnow', 0);
  const back4 = reload(env4);
  ok(back4.L.bitesSpent(OPEN) === 1 && back4.P.getPendingCatch()[0]?.uid === c4.uid, 'T48: reloaded with the card open: the card, no refund');
  // the open bite and the card in one save (main saved on fish:measured before closeBite ran): still no refund
  const env5 = makeEnv();
  const r5 = startTrip(env5);
  bite(env5);
  const f5 = env5.P.makeFish('dusk_minnow', 0, 'normal', {});
  r5.flags.openBite = OPEN;
  env5.P.measure(f5); r5.flags.openBite = OPEN; env5.ctx.game.save();
  eq(reload(env5).L.bitesSpent(OPEN), 1, 'CHOICE 27: a card fish carrying the open bite\'s key keeps it spent');
  eq([env.ctx.errors, back.ctx.errors, back3.ctx.errors], [[], [], []], 'no errors');
}

// =====================================================================================
section('the shelf at home: buy, the order, the session, the gear log (T23, T24, T25)');
{
  const meta = freshLoopMeta(D);
  const env = makeEnv({ meta, debug: true });
  env.ctx.flow = 'home';
  eq(env.L.goal(), { id: 'hold:4', name: 'Hold 4', price: 30, slot: 'hold', level: 4 }, 'the goal: Hold 4 · 30');
  eq(env.L.buy('hold').ok, false, 'no clams: refused');
  eq(env.L.debugGive(400), 400, 'debugGive (a debug build)');
  eq(env.L.buy('hold:5').ok, false, 'T24: Hold 5 is refused before Hold 4');
  eq(env.L.buy('rod:2').ok, false, 'T24: T2 is refused before T1');
  const n = env.calls.saves.length;
  const b = env.L.buy('hold:4');
  ok(b.ok && b.clams === 370 && meta.loop.holdSlots === 4 && env.calls.saves.length === n + 1, 'T23: Hold 4 for 30, saved at once');
  eq(env.last('loop:buy'), { item: 'hold:4', price: 30, clams: 370 }, 'loop:buy');
  const sh = env.L.shelf();
  const no4 = (items) => items.filter((i) => !(/^(lure|tin|cut|oars|keel|lantern|orders):/.test(i.id)));   // (M1 step 4's cards: loop-4.test.mjs's)
  eq(sh.tabs.map((t) => t.id), ['tackle', 'raft', 'bait', 'maps', 'home'], 'CHOICE 11 (M1 step 3a): Tackle, Raft, Bait and Maps (M1 step 4: Home, the Order Board)');
  eq(no4(sh.tabs[1].items).map((i) => [i.id, i.bought]), [['hold:4', true]], "CHOICE 26: the bought card reads Yours. while the shelf is open");
  env.ctx.bus.emit('ui:modal', { open: false, id: 'shelf' });
  eq(no4(env.L.shelf().tabs[1].items).map((i) => [i.id, i.price]), [['hold:5', 120]], 'the next open: Hold 5 · 120');
  ok(env.L.buy('rod:1').ok && meta.loop.tackle.rod === 1, 'T23: Rod T1 for 50');
  const lo = env.P.getLoadout();
  ok(lo.rod === 1 && lo.perRun === false && lo.runless === true && lo.item === null && lo.hold.rod === D.TACKLE.rod[1].hold, 'T25: at home, getLoadout reads meta.loop.tackle (perRun false)');
  const row = env.P.getGearLog().find((x) => x.kind === 'rod' && x.tier === 1);
  ok(row?.owned === true && row.fitted === true && row.price === 50 && row.proof === null, 'T25: the gear log shows the T1 rod owned, at its loop price');
  // (M1 step 4: the water's tins have their rows, loop-4.test.mjs's; no other bait has one)
  ok(!env.P.getGearLog().some((x) => x.kind === 'bait' && !['mireworm', 'lumen_moss', 'cut_strip'].includes(x.id)), 'no bait rows on the 1a shelf\'s gear log (but the tins)');
  const r = startTrip(env);
  ok(env.P.getLoadout().rod === 1 && env.P.getLoadout().perRun === false, 'T25: on the trip too');
  const p0 = D.catchChance('reedjaw_pike', 'prize', { rod: 0, line: 0, reel: 0 }, { perRun: false });
  const p1 = D.catchChance('reedjaw_pike', 'prize', env.P.getLoadout(), { perRun: false });
  ok(p1 > p0, `T25: a tier raises catchChance (${p0.toFixed(3)} → ${p1.toFixed(3)})`);
  eq(env.P.getStats().castMax, D.TACKLE.rod[1].castMax, "the T1 rod casts farther (CHOICE 13)");
  eq(r.zone, 'mossmere', 'the trip');
  eq(env.ctx.errors, [], 'no errors');
}

// =====================================================================================
section('parked on a trip: Murk, the gate, the trials, the buffs (T29, T46, T53)');
{
  const meta = freshLoopMeta(D);
  meta.relics = { seven_knots: 3, steady_hook: 2 };
  const env = makeEnv({ meta });
  const r = startTrip(env);
  for (let t = 0; t < 300; t += 0.5) { env.phase.time = t; env.P.update(0.5); }
  // (PLAN rev. 9: from M1 step 5 Murk's barge is moored in view through the evening, the actor's moored mode; the market never
  // brings him, and nothing offers his shelf on the water)
  ok(env.count('merchant:arrive') === 0 && env.P.isMerchantPresent() === false && env.P.canShop?.() !== true, 'T29 (rev. 9): no merchant:arrive and no Trade pill over 300 s of calm on a trip');
  r.legendaries.belled_matriarch = true;
  for (let t = 0; t < 60; t += 0.5) env.P.update(0.5);
  ok(env.count('gate:open') === 0 && env.P.getGateInfo().open === false && !env.calls.gate.includes('open'), 'T46: the gate never opens on a trip, even with a legend landed');
  eq([env.P.travel('sporewood'), env.ctx.debug.openGate()], [{ ok: false, msg: '' }, false], 'T46: travel and openGate are inert');
  ok(env.calls.gate.every((s) => s === 'sealed' || s === 'hidden'), 'syncGateVisual pushes the built sealed state');
  ok(env.ctx.debug.completeChallenge(D.CHALLENGES[0].id) === false && Object.keys(meta.challenges).length === 0, 'the trials are parked');
  const b = env.P.getCatchBuffs('trophy');
  eq([b.wellFed, b.boons, b.relics, b.character], [false, {}, {}, null], 'T53: no Well-fed, Boons or relics; no Wick buff for the Wick');
  r.satiety = 999; r.boons = { steady_reel: 3 };
  eq(env.P.getCatchBuffs('prize').wellFed, false, 'T53: parked even when fed and boosted');
  meta.journal.dusk_minnow = { caught: 1 };
  const o = env.P.getOdds('dusk_minnow');
  near(o.odds.keeper, D.catchChance('dusk_minnow', 'keeper', env.P.getLoadout(), { strike: 'struck', perRun: false }), "T53: the log's odds equal catchChance with no buff terms");
  for (const w of ['taper', 'stub', 'tallow']) { r.character = w; eq(env.P.getCatchBuffs('elder').character, null, `T53: ${w} has no fight buff`); }
  r.character = 'ashwick';
  eq(env.P.getCatchBuffs('prize').character, null, "T53: Ashwick's buff only on a comeback bite");
  bite(env, OPEN, { comeback: true });
  eq(env.P.getCatchBuffs('prize').character, 'ashwick', "T53: … and while it is open");
  eq(D.catchBuffHold(sp('reedjaw_pike'), 'prize', env.P.getCatchBuffs('prize')), 4, 'the tired comeback: +4 Hold (the run cap)');
  env.ctx.bus.emit('fish:measured', {});
  eq(env.P.getCatchBuffs('prize').character, null, 'closed with the play');
  eq(env.ctx.errors, [], 'no errors');
}

// =====================================================================================
section('the Wick: firsts sell higher (T76)');
{
  const meta = freshLoopMeta(D);
  meta.journal = { dusk_minnow: { caught: 9, pbLength: 99 } };     // an old Journal: the ledger is the loop's own, empty
  meta.loop.wick = 'wick';
  const env = makeEnv({ meta });
  startTrip(env);
  ok(meta.loop.firsts.seen.length === 0, "T76: a migrated save's ledger starts empty");
  const f1 = land(env, 'dusk_minnow', 0.4);
  ok(f1.first === true && meta.loop.firsts.seen.includes('dusk_minnow'), 'T76: a new kind (for this New Descent) is a first, written at the measure');
  ok(env.last('fish:landed').clams === 7, "T76: the card's Keep shows the base (7)");
  env.P.fishAction(f1, 'keep');
  const f2 = land(env, 'dusk_minnow', 0.2);
  ok(f2.first !== true, 'a shorter one of the same kind is no first');
  env.P.fishAction(f2, 'keep');
  const f3 = land(env, 'mossback_perch', 0.3);
  ok(f3.first === true, 'a first let go');
  env.P.fishAction(f3, 'letgo');
  const t = endTrip(env);
  const row1 = t.lines.find((l) => l.uid === f1.uid), row2 = t.lines.find((l) => l.uid === f2.uid);
  const tier = D.LOOP.waters.mossmere.tier, bonus = Math.max(Math.round(0.4 * tier), Math.round(0.4 * 7));
  eq([row1.base, row1.clams, row1.first], [7, 7 + bonus, true], `T76: the row's base is the card's, its clams the sale (+${bonus})`);
  eq([row2.base === row2.clams, row2.first], [true, false], 'a repeat sells at its base');
  eq(t.total, row1.clams + row2.clams, 'T76: the first pays once, only on a sale (the let-go first paid nothing)');
  startTrip(env);
  const f4 = land(env, 'mossback_perch', 0.1);
  ok(f4.first !== true, 'the let-go perch was already the first: its record is kept');
  // a reload with the card open keeps the first
  const f5 = land(env, 'weeping_carp', 0.4);
  const back = reload(env);
  await tick();
  const c5 = back.P.getPendingCatch().find((x) => x.uid === f5.uid);
  ok(c5?.first === true, 'T76: the card fish keeps fish.first through a reload');
  back.P.fishAction(c5, 'keep');
  const t2 = back.L.endTrip();
  const r5 = t2.lines.find((l) => l.uid === f5.uid);
  ok(r5.first === true && r5.clams > r5.base && r5.base === price('weeping_carp', 0.4), 'T76: … and pays it once at the tally');
  // only the Wick
  const m2 = freshLoopMeta(D); m2.loop.wick = 'stub';
  const e2 = makeEnv({ meta: m2 });
  startTrip(e2);
  const s1 = land(e2, 'dusk_minnow', 0.4);
  e2.P.fishAction(s1, 'keep');
  const ts = e2.L.endTrip();
  ok(s1.first !== true && ts.lines[0].clams === ts.lines[0].base && m2.loop.firsts.seen.length === 0, 'another Wick sells at the base and keeps no ledger');
  eq(env.ctx.errors.concat(back.ctx.errors, e2.ctx.errors), [], 'no errors');
}

// =====================================================================================
section("Taper's first bite: one flag an evening (T77)");
{
  const meta = freshLoopMeta(D); meta.loop.wick = 'taper';
  const env = makeEnv({ meta });
  const r = startTrip(env);
  ok(env.L.taperFirstOpen() === true, "an evening starts with Taper's first bite open");
  ok(env.L.spendTaperFirst() === true && r.flags.taperFirst === true && env.L.taperFirstOpen() === false, 'served under the rule: the flag is set');
  ok(env.L.spendTaperFirst() === false, 'once an evening');
  const f = land(env, 'weeping_carp', 0);
  env.P.fishAction(f, 'letgo');
  ok(env.L.taperFirstOpen() === false, 'T77: a let-go refund never re-arms it');
  await tick();
  ok(reload(env).L.taperFirstOpen() === false, 'the flag is saved with the trip');
  endTrip(env);
  startTrip(env);
  ok(env.L.taperFirstOpen() === true, "T77: reset at the next evening's start");
  const m2 = freshLoopMeta(D); m2.loop.wick = 'tallow';
  const e2 = makeEnv({ meta: m2 }); startTrip(e2);
  ok(e2.L.taperFirstOpen() === false && e2.L.spendTaperFirst() === false, 'another Wick has no first bite');
  eq(env.ctx.errors, [], 'no errors');
}

// =====================================================================================
section('Stub: lively quiet water (T78)');
{
  const meta = freshLoopMeta(D); meta.loop.wick = 'stub';
  const env = makeEnv({ meta });
  startTrip(env);
  for (let i = 0; i < 7; i++) bite(env);
  const F = env.L.favour(OPEN);
  ok(F.over === 4 && Math.abs(F.favour + 0.32) < 1e-9 && F.waitMult === 1 && F.good === 4, 'T78: past the good bites −0.08 a bite and the fresh wait; the good bites as built');
  for (let i = 0; i < 20; i++) bite(env);
  eq(env.L.favour(OPEN).favour, -1.2, 'T78: the same floor');
  eq(env.ctx.errors, [], 'no errors');
}

// =====================================================================================
section('Tallow: one more slot, two more good bites (T79)');
{
  const meta = freshLoopMeta(D); meta.loop.wick = 'tallow';
  const env = makeEnv({ meta });
  env.ctx.flow = 'home';
  eq(env.L.hold(), { slots: 4, fish: [], full: false }, "T79: at home Tallow's hold has 4 slots (meta.loop.wick)");
  const r = startTrip(env);
  eq([env.P.getStats().creelSize, env.L.hold().slots, env.L.favour(OPEN).good], [4, 4, 6], 'T79: 4 slots and 6 good bites on the first trip');
  for (const [id, z] of [['dusk_minnow', 0], ['mossback_perch', 0], ['gutter_crayfish', 0]]) env.P.fishAction(land(env, id, z), 'keep');
  ok(env.L.holdFull() === false, 'T79: not full at 3');
  env.P.fishAction(land(env, 'weeping_carp', 0), 'keep');
  ok(env.L.holdFull() === true && env.P.fishAction(land(env, 'reedjaw_pike', 0), 'keep').full === true, 'T79: full at 4; the 5th keep refused');
  const t = endTrip(env);
  ok(t.lines.length === 4 && t.total === r.creel.length + t.lines.reduce((a, l) => a + l.clams, 0), 'T79: the tally pays every fish in a 4-fish hold');
  meta.loop.holdSlots = 8;
  eq(env.L.hold().slots, 9, 'T79: Hold 8 gives Tallow 9');
  eq(meta.loop.holdSlots, 8, "holdSlots stays the bought count");
  ok(!env.L.shelf().tabs.some((t) => t.items.some((i) => i.slot === 'hold' && !i.bought)) && env.L.goal()?.slot !== 'hold', 'no hold step past the 1a shelf (Hold 5)');
  eq(env.ctx.errors, [], 'no errors');
}

// =====================================================================================
section("Ashwick: a fish that gets away comes back (T80)");
{
  const meta = freshLoopMeta(D); meta.loop.wick = 'ashwick';
  const env = makeEnv({ meta });
  const r = startTrip(env);
  const bus = env.ctx.bus;
  const escape = (e) => { bus.emit('fishing:escaped', { reason: 'thrown', sizeClass: e.sizeClass }); bus.emit('fish:escaped', { reason: 'thrown', zone: 'mossmere', place: null, markedFish: false, ...e }); };
  bite(env);
  escape({ speciesId: 'reedjaw_pike', z: 2.8, sizeClass: 'elder', markedFish: true });
  ok(r.comeback?.speciesId === 'reedjaw_pike' && r.comeback.z === 2.8 && r.comeback.waterKey === OPEN, 'T80: the same fish (species and z) waits at that water');
  ok(!(meta.markedFish || []).length, 'T80: an Elder lost once leaves no Marked Fish');
  eq(env.L.comeback('lily_maze'), null, 'T80: a cast at another water keeps it waiting (not there)');
  eq(env.L.comeback(OPEN).z, 2.8, '… and it is there at its own water');
  await tick();
  ok(env.lastSave().run.comeback?.z === 2.8, 'the comeback is saved with the trip');
  const before = env.L.bitesSpent(OPEN);
  const c = env.L.consumeComeback();
  bite(env, OPEN, { comeback: true });
  ok(c.z === 2.8 && r.comeback === null && env.L.bitesSpent(OPEN) === before + 1, 'T80: served: consumed, and it spends a bite');
  await tick();
  const back = reload(env);
  eq(back.L.comeback(OPEN), null, 'T80: quit mid-play and Continue: the next bite is not the comeback');
  escape({ speciesId: 'reedjaw_pike', z: 2.8, sizeClass: 'elder', markedFish: true });
  ok(r.comeback === null && (meta.markedFish || []).length === 1, 'T80: lost again it is gone, and lost twice an Elder leaves one Marked Fish');
  bite(env); escape({ speciesId: 'belled_matriarch', z: 0, legendary: true, sizeClass: null });
  ok(r.comeback === null, 'T80: no comeback for a legend');
  bite(env); escape({ speciesId: 'dusk_minnow', z: 0.1, cut: true });
  ok(r.comeback === null, 'T80: a cut line makes none');
  bite(env); escape({ speciesId: 'dusk_minnow', z: 0.1 });
  ok(r.comeback?.speciesId === 'dusk_minnow', 'a later loss comes back');
  bus.emit('zone:change', { zone: 'sporewood', prev: 'mossmere' });
  ok(r.comeback === null, 'T80: a lake change drops it');
  bite(env); escape({ speciesId: 'dusk_minnow', z: 0.1 });
  endTrip(env);
  ok(startTrip(env).comeback === null, 'T80: run:end drops it');
  const m2 = freshLoopMeta(D);
  const e2 = makeEnv({ meta: m2 });
  const r2 = startTrip(e2);
  bite(e2); e2.ctx.bus.emit('fish:escaped', { speciesId: 'reedjaw_pike', z: 2.8, sizeClass: 'elder', markedFish: true, zone: 'mossmere' });
  ok(r2.comeback === null && (m2.markedFish || []).length === 1, 'another Wick: no comeback, the built Marked Fish');
  eq(env.ctx.errors.concat(e2.ctx.errors), [], 'no errors');
}

// =====================================================================================
section('the opening\'s records (T60, T67) and Murk\'s lines (§8.6)');
{
  const meta = freshLoopMeta(D);
  const env = makeEnv({ meta });
  env.ctx.flow = 'title';
  eq([env.L.wick(), env.L.tutorial()], ['wick', null], 'a fresh save: the Wick, no tutorial');
  eq(env.L.setWick('stub'), 'stub', 'Start: setWick');
  env.ctx.bus.emit('flow:change', { flow: 'title' });
  eq(env.calls.setCharacter[env.calls.setCharacter.length - 1], 'stub', "T60: the title shows meta.loop.wick (progression's syncCharacter)");
  eq(meta.lastCharacter, null, 'T60: meta.lastCharacter is never written');
  eq(env.L.setWick(null), null, 'T60: setWick(null) clears it (a first film abandoned)');
  eq(meta.loop.wick, null, '… so a save then writes wick: null');
  env.L.setWick('bogus');
  eq(meta.loop.wick, 'wick', 'an unknown id is the Wick');
  eq(env.L.beginTutorial(), { done: false, step: 'arrive' }, 'beginTutorial');
  env.L.setTutorialStep('chart');
  eq(env.L.beginTutorial(), { done: false, step: 'chart' }, 'beginTutorial leaves a running record unchanged');
  const n = env.calls.saves.length;
  env.L.tutorialDone();
  ok(env.calls.saves.length === n + 1 && meta.loop.tutorial.done === true && meta.loop.said.firstChart === true, 'tutorialDone: done, the Chart line said, saved at once');
  env.L.setTutorialStep('wake');
  eq(meta.loop.tutorial, { done: true, step: null }, 'a done tutorial takes no step');
  eq(env.L.sayOnce('firstChart'), null, "the Chart's line was the tutorial's");
  eq([env.L.sayOnce('firstSale'), env.L.sayOnce('firstSale')], [D.TEXT_LOOP.murk.firstSale, null], 'sayOnce: once');
  eq([0, 1, 2, 3].map(() => env.L.sayOnce('sailOut')), [...D.TEXT_LOOP.murk.sailOut, D.TEXT_LOOP.murk.sailOut[0]], 'sailOut rotates and never runs out');
  { const m3 = freshLoopMeta(D), e3 = makeEnv({ meta: m3 });
    e3.L.beginTutorial(); e3.L.tutorialDone();
    eq([e3.L.resetTutorial(), m3.loop.said.firstChart], [{ done: false, step: 'arrive' }, undefined], "resetTutorial (debug.loop.tutorial('reset')): begun again, the Chart's line the tutorial's"); }
  const m2 = freshLoopMeta(D); m2.loop.wick = 'tallow';
  eq(makeEnv({ meta: m2 }).L.sayOnce('firstChart'), D.TEXT_LOOP.murk.firstChartBy.tallow, "Tallow's own count");
  eq(makeEnv({ meta: freshLoopMeta(D) }).L.sayOnce('nope'), null, 'an unknown line is null');
  // the parked descent (CHOICE 5)
  const descent = { id: 'run_old', active: true, outing: 'normal', zone: 'mossmere' };
  env.L.parkRun(descent);
  ok(meta.loop.parkedRun === descent, 'parkRun keeps a saved descent');
  env.L.parkRun({ id: 'run_t', active: true, outing: 'trip' });
  ok(meta.loop.parkedRun === descent, 'a trip is never parked');
  // T60: the trip's character, and a reload shows the Wick again
  const m3 = freshLoopMeta(D); m3.loop.wick = 'stub';
  const e3 = makeEnv({ meta: m3 });
  ok(startTrip(e3).character === 'stub' && e3.calls.setCharacter.includes('stub'), "T60: the first trip's run.character is the chosen Wick");
  ok(makeEnv({ meta: clone(m3) }).calls.setCharacter.slice(-1)[0] === 'stub', 'T60: a reload shows Stub (init reads meta.loop.wick)');
  // migrateSave under the loop: an old v3 save gains meta.loop and loses nothing (T33); a saved trip marks the tutorial done (T67)
  const old = { meta: { ...defaultMeta(), runs: 4, journal: { dusk_minnow: { caught: 2 } }, relics: { seven_knots: 1 }, v3ids: true, firstEvening: { done: true } }, run: null };
  const keep = clone(old.meta);
  migrateSaveModule(old, D);
  ok(PL.migrateLoop({ loop: clone(old.meta.loop) }, D).loop && old.meta.loop.v === PL.LOOP_SCHEMA, 'T33: an old save gains meta.loop');
  eq(Object.fromEntries(Object.entries(old.meta).filter(([k]) => k !== 'loop')), keep, 'T33: every other meta key is unchanged');
  const trip = { meta: { ...defaultMeta(), loop: { v: 3 } }, run: { id: 'run_t', active: true, outing: 'trip' } };
  migrateSaveModule(trip, D);
  eq([trip.meta.loop.tutorial, trip.meta.loop.wick], [{ done: true, step: null }, 'wick'], 'T67: a saved trip beside it: the tutorial is done');
  const v3 = { meta: defaultMeta(), run: null };
  migrateSaveModule(v3, dataV3);
  eq(v3.meta.loop, undefined, 'v3 without the loop: migrateSave writes no meta.loop');
  eq(env.ctx.errors, [], 'no errors');
}

// =====================================================================================
section('the list counts the shared Journal (T82)');
{
  const meta = freshLoopMeta(D);
  meta.journal = { candlefin_koi: { caught: 0, seen: true }, reedjaw_pike: { caught: 0 } };
  const env = makeEnv({ meta });
  startTrip(env);
  eq(env.L.listCount('mossmere'), { have: 0, need: 12 }, 'T82: Glimpsed and caught-0 entries do not count');
  env.P.fishAction(land(env, 'dusk_minnow', 0), 'letgo');
  env.P.fishAction(land(env, 'gutter_crayfish', 0), 'keep');
  eq(env.L.listCount('mossmere'), { have: 2, need: 12 }, 'T82: a fish let go counts (its measure writes the entry), as a kept one');
  const old = freshLoopMeta(D);
  old.journal = Object.fromEntries(PL.listFor(D, 'mossmere').map((id) => [id, { caught: 3 }]));
  eq(makeEnv({ meta: old }).L.listCount('mossmere'), { have: 12, need: 12 }, "T82: a save that landed the twelve opens at 12/12 (M1 step 3a)");
  const six = freshLoopMeta(D);
  six.journal = Object.fromEntries(['dusk_minnow', 'mossback_perch', 'gutter_crayfish', 'weeping_carp', 'candlefin_koi', 'reedjaw_pike'].map((id) => [id, { caught: 3 }]));
  eq(makeEnv({ meta: six }).L.listCount('mossmere'), { have: 6, need: 12 }, "T82: a step-1 save that landed the six built fish opens at 6/12 (its catches count)");
  eq(env.ctx.errors, [], 'no errors');
}

// =====================================================================================
section('the flag-off boot rule from a real trip save (T35)');
{
  const env = makeEnv();
  startTrip(env);
  const a = land(env, 'weeping_carp', 0.5); env.P.fishAction(a, 'keep');
  land(env, 'dusk_minnow', 0.3);                                    // a card still open: never kept, never sold
  env.ctx.game.save();
  const save = clone(env.lastSave());
  const res = sellStrandedTrip(save);
  ok(res.sold && save.run === null && save.meta.loop.clams === a.clams && save.meta.loop.lastTrip.lines.length === 1, 'T35: sold at the stamped price; the open card is not sold');
}

// =====================================================================================
section('M1 step 3a\'s seam (PLAN §2.0, §3.2, §3.3): the step-2 save opens, the new keys, the pure helpers through the ledger');
{
  const fs = await import('node:fs');
  const raw = JSON.parse(fs.readFileSync(new URL('./fixtures/loop-save-m1s2.json', import.meta.url), 'utf8'));
  const before = clone(raw.meta.loop);
  migrateSaveModule(raw, D);
  const { meta } = normalizeSave(raw);
  const env = makeEnv({ meta }), L = env.L.state();
  const keep = ['clams', 'tackle', 'holdSlots', 'evenings', 'said', 'firsts', 'lastTrip', 'maps', 'v'];
  // since step 5a's merge the save migrates up to LOOP_SCHEMA (4: meta.loop.barge), everything else as saved
  eq(keep.map((k) => L[k]), keep.map((k) => (k === 'v' ? PL.LOOP_SCHEMA : before[k])), 'T117: the step-2 save opens with its clams, tackle, hold, evenings, said, firsts, lastTrip and maps as saved, v up to LOOP_SCHEMA');
  eq([L.lifted, L.best, L.chartPick], [[], {}, null], 'T117: lifted [], best {}, chartPick null (never an object)');
  ok(L.clams === 412 && L.holdSlots === 5 && env.L.listCount('mossmere').have === 8 && env.L.listCount('mossmere').need === 12, 'T117: 412 clams, Hold 5, eight of the twelve caught');
  const again = clone(meta.loop); PL.migrateLoop(meta, D);
  eq(meta.loop, again, 'T117: a second migrateLoop changes nothing');
  eq(env.L.liftDue(), [], 'no place owned: nothing to lift');
  eq(env.L.mapCards().map((c) => c.id), ['place:lily_maze', 'place:under_the_span', 'lake:sporewood'], 'mapCards: the two cheapest place maps, then Sporewood\'s sealed card');
  const sw = env.L.mapCards()[2];
  ok(sw.sealed === true && sw.price === null && sw.seals.gear.held === true && sw.seals.catch.have === 8 && sw.seals.map.shipped === false, "Sporewood's card: sealed, no price; Rod T1 held, 8 of 12");
  eq(env.L.seals(), sw.seals, 'seals(): the next water\'s three keys');
  const cat = env.L.catalogue('mossmere');
  ok(cat.list.length === 12 && cat.groups.map((g) => g.placeId).join() === 'under_the_span,buoy_lights,bell_pool' && cat.finds?.rows?.look?.length === 3, 'catalogue: the twelve, then the three places with fish');
  ok(env.L.fitted().bait === null && env.L.pick() === null && env.L.lifted().length === 0, 'the reads: nothing fitted, no pick, nothing lifted');
  ok(env.L.fit('bait', 'heartmoss').ok === false && env.L.markLifted('lily_maze') === false
    && env.L.spendBait('heartmoss') === false && env.L.takeGiantMark('thousandcast_pike') === false, 'the writers refuse what the save lacks: no ball to fit, no place to lift, no trip, no mark');
  eq(env.L.setPick({ water: 'mossmere', place: null }), { ok: true, pick: { water: 'mossmere', place: null } }, 'setPick: open water of an owned lake');
  meta.loop.chartPick = { water: 'mossmere', place: 'lily_maze' };   // 3b's direct write of the same shape
  eq(env.L.pick(), { water: 'mossmere', place: 'lily_maze' }, 'pick() reads a chartPick written directly');
  meta.loop.maps.places = ['bell_pool', 'lily_maze'];
  eq(env.L.liftDue(), ['lily_maze', 'bell_pool'], 'liftDue: owned and not lifted, in price order');
}

// =====================================================================================
// M1 step 3a's ledger (PLAN §2.1 items 4–5, §3.2, §3.3): T107, T110–T114, T117 through the real progression
const { placesMeta } = await import('./loop-fixture.mjs');
const SPAN = 'under_the_span', BUOY = 'buoy_lights', BELL = 'bell_pool', LILY = 'lily_maze';
section('T110: the Heartmoss Ball in the ledger (buy, fit, the trip carries the bag, spent only by her hook, a pass gives it back, the tally)');
{
  const meta = placesMeta(D, { own: [BELL] });
  meta.loop.clams = 200;
  const env = makeEnv({ meta, debug: true });
  env.ctx.flow = 'home';
  eq(env.L.fit('bait', 'heartmoss'), { ok: false }, 'a fit with no ball in the bag is refused');
  eq(env.L.fit('lure', 'bell_spinner'), { ok: false }, 'the lure slot is step 4\'s (refused)');
  eq(env.L.fit('bait', 'lumen_moss'), { ok: false }, 'the bait slot holds only a legend\'s bait in 3a (PLAN CHOICE 16)');
  const b = env.L.buy('bait:heartmoss');
  ok(b.ok && b.clams === 140 && meta.loop.bait.mossmere.heartmoss === 1, 'buy the ball: 60 clams, one in the Mossmere\'s bag');
  eq(env.last('loop:buy'), { item: 'bait:heartmoss', price: 60, clams: 140 }, 'loop:buy {item: bait:heartmoss}');
  ok(env.L.buy('bait:heartmoss').ok && meta.loop.bait.mossmere.heartmoss === 2 && meta.loop.clams === 80, 'a second ball: two in the bag');
  const shelfBall = env.L.shelf().tabs.find((t) => t.id === 'bait').items[0];
  ok(shelfBall.count === 2 && shelfBall.bought === false, 'the Bait tab\'s card: its count, never "Yours."');
  const n = env.calls.saves.length;
  eq(env.L.fit('bait', 'heartmoss'), { ok: true, id: 'heartmoss', count: 2 }, 'fit the ball (two in the bag)');
  ok(meta.loop.fitted.bait === 'heartmoss' && env.calls.saves.length === n + 1, 'saved in fitted.bait at once');
  eq(env.last('loop:fit'), { slot: 'bait', id: 'heartmoss' }, 'loop:fit {slot, id}');
  eq(env.L.fitted(), { lure: null, bait: 'heartmoss' }, 'fitted()');
  const r = startTrip(env);
  ok(r.bait.heartmoss === 2 && r.equippedBait === 'heartmoss' && r.equipped === 'heartmoss', 'the trip carries the bag and the fitted ball rides the line');
  ok(env.L.spendBait('mireworm') === false && r.bait.heartmoss === 2, 'spendBait takes only a legend\'s bait');
  // a cast: the built consumeBait keeps a legend's bait (spent only by her hook)
  env.P.consumeBait?.();
  eq(r.bait.heartmoss, 2, 'the cast keeps the ball');
  // a non-legend bite and its landing never take it
  const f = land(env, 'dusk_minnow', 0.2); env.P.fishAction(f, 'keep');
  eq(r.bait.heartmoss, 2, 'another fish\'s bite and landing keep the ball');
  // her bite: fishing:bite then fishing:hook {speciesId} (progression's onHook spends through spendBait); fishing's own call spends nothing more
  bite(env, BELL);
  env.ctx.bus.emit('fishing:hook', { speciesId: 'belled_matriarch', perfect: false });
  eq(r.bait.heartmoss, 1, 'her hook spends one ball');
  ok(env.L.spendBait('heartmoss') === true && r.bait.heartmoss === 1, 'fishing\'s own spendBait for the same bite spends nothing more');
  ok(env.L.refundBait('heartmoss') === true && r.bait.heartmoss === 2 && env.L.refundBait('heartmoss') === false && r.bait.heartmoss === 2, 'a pass gives back that bite\'s ball, once');
  bite(env, BELL);
  ok(env.L.refundBait('heartmoss') === false, 'a new bite: nothing to give back before a spend');
  ok(env.L.spendBait('heartmoss') && r.bait.heartmoss === 1, 'her next hook spends one');
  env.ctx.bus.emit('fishing:hook', { speciesId: 'belled_matriarch', perfect: false });
  eq(r.bait.heartmoss, 1, 'progression\'s fishing:hook on the same bite spends nothing more');
  bite(env, BELL);
  ok(env.L.spendBait('heartmoss') && r.bait.heartmoss === 0, 'the last ball spent');
  bite(env, BELL);
  ok(env.L.spendBait('heartmoss') === false, 'none left: spendBait false');
  endTrip(env);
  ok(meta.loop.bait.mossmere.heartmoss === undefined || meta.loop.bait.mossmere.heartmoss === 0, 'the tally writes the bag back (none left)');
  eq(meta.loop.fitted.bait, null, 'a fitted ball with none left comes off the slot');
  eq(env.L.fit('bait', 'heartmoss'), { ok: false }, 'a fit with none left is refused');
  // unfit; a reload carries the fit
  env.L.debugGive(200); env.L.buy('bait:heartmoss'); env.L.fit('bait', 'heartmoss');
  eq(env.L.fit('bait', null), { ok: true, id: null, count: 0 }, 'unfit (null)');
  ok(meta.loop.fitted.bait === null && env.last('loop:fit').id === null, 'unfit: saved, loop:fit {id: null}');
  env.L.fit('bait', 'heartmoss');
  const r2 = startTrip(env);
  env.ctx.game.save();
  const env2 = reload(env);
  ok(env2.ctx.state.run.bait.heartmoss === 1 && env2.ctx.state.run.equippedBait === 'heartmoss' && env2.L.fitted().bait === 'heartmoss', 'a trip saved with a ball fitted continues with it');
  ok(r2.id === env2.ctx.state.run.id, '… the same trip');
  // flag-off and v3-without-loop: the built onHook spend is unchanged
  for (const [name, data] of [['v3 without the loop', dataV3]]) {
    const e3 = makeEnv({ data, meta: defaultMeta() });
    const rr = e3.P.createRun({ startZone: 'mossmere' }); e3.ctx.state.run = rr; rr.bait = { heartmoss: 2 };
    e3.ctx.bus.emit('fishing:hook', { speciesId: 'belled_matriarch', perfect: false });
    eq(rr.bait.heartmoss, 1, `${name}: the built hook spends the legend's bait as before`);
  }
  eq(env.ctx.errors, [], 'no errors');
}

section('T107: the Matriarch\'s price (Keep · 500, then 200) and her wounds across trips');
{
  const meta = placesMeta(D, { own: [BELL], balls: 3 });
  const env = makeEnv({ meta });
  env.L.fit('bait', 'heartmoss');
  startTrip(env);
  const her = land(env, 'belled_matriarch', 0, { key: BELL, place: BELL });
  eq(env.L.priceOf(her), 500, 'her first landing: Keep · 500 (the crown map\'s price)');
  ok(env.P.fishAction(her, 'keep').ok && her.clams === 500, 'kept at 500');
  const t = endTrip(env);
  ok(t.total === 500 && meta.loop.legends.belled_matriarch === 1, 'the tally pays 500; legends counted');
  startTrip(env);
  const again = land(env, 'belled_matriarch', 0.4, { key: BELL, place: BELL });
  eq(env.L.priceOf(again), 200, 'after: Keep · 200 (× legendRematch)');
  env.P.fishAction(again, 'letgo');
  // wounds: each escape +1 (×6 Hold), kept across trips, ≤ 3 counted (built)
  for (let i = 0; i < 4; i++) env.ctx.bus.emit('fish:escaped', { speciesId: 'belled_matriarch', legendary: true, place: BELL, zone: 'mossmere', reason: 'thrown' });
  const w = env.P.getCatchMods?.('belled_matriarch')?.wounds ?? null;
  endTrip(env);
  startTrip(env);
  const w2 = env.P.getCatchMods?.('belled_matriarch')?.wounds ?? null;
  ok(w !== null && w >= 3 && w2 === w, `four escapes wound her (+6 each, three counted for Hold); kept into the next trip (${w} then ${w2})`);
  ok(D.catchChance('belled_matriarch', 'legend', { rod: 1, line: 1, reel: 1 }, { wounds: w2 }) <= 0.5, 'never above 50% with wounds');
  eq(env.ctx.errors, [], 'no errors');
}

section('T111: an owned place\'s bite count (its key, its good bites by kind, Tallow +1, quiet terms per place)');
{
  const env = makeEnv({ meta: placesMeta(D, { own: [LILY, SPAN, BUOY, BELL] }) });
  startTrip(env);
  eq([LILY, SPAN, BUOY, BELL].map((k) => env.L.bitesLeft(k)), [2, 3, 2, 2], 'good bites: day 2, old 3, night 2, crown 2');
  for (let i = 0; i < 3; i++) bite(env, SPAN);
  ok(env.L.bitesSpent(SPAN) === 3 && env.L.bitesLeft(SPAN) === 0 && env.L.bitesSpent(OPEN) === 0 && env.L.bitesLeft(LILY) === 2, "a bite under the Span spends there only (its own key)");
  const q = env.L.favour(SPAN);
  ok(q.quiet === true && q.over === 1 && q.favour < 0 && q.waitMult > 1 && env.L.favour(LILY).quiet === false, 'the Span is quiet past its three; the Lily Maze still fresh (1a\'s rule, per place)');
  const tal = placesMeta(D, { own: [SPAN] }); tal.loop.wick = 'tallow';
  const e2 = makeEnv({ meta: tal });
  startTrip(e2);
  eq(e2.L.bitesLeft(SPAN), 4, "Tallow: +1 good bite at a place too (everyWater)");
  eq(env.ctx.errors, [], 'no errors');
}

section('T112: the lift\'s ledger (liftDue in price order, markLifted once and saved, a reload replays it)');
{
  const meta = placesMeta(D, { own: [BELL, LILY, SPAN], lifted: [] });
  const env = makeEnv({ meta });
  eq(env.L.liftDue(), [LILY, SPAN, BELL], 'liftDue: the owned places not yet lifted, in price order');
  startTrip(env);
  env.ctx.game.save();
  const env2 = reload(env);   // a reload before markLifted: the lift plays again on the trip
  eq(env2.L.liftDue(), [LILY, SPAN, BELL], 'a reload before markLifted replays the lift');
  const n = env.calls.saves.length;
  ok(env.L.markLifted(LILY) === true && meta.loop.lifted.join() === LILY && env.calls.saves.length === n + 1, 'markLifted writes lifted once and saves at once');
  ok(env.L.markLifted(LILY) === false && meta.loop.lifted.length === 1, 'a second markLifted of the same place: false, written once');
  ok(env.L.markLifted(BUOY) === false && env.L.markLifted('cupped_hands') === false && env.L.markLifted(null) === false, 'a place not owned, not a loop place, or no id: refused');
  eq(env.L.liftDue(), [SPAN, BELL], 'liftDue drops it');
  eq(env.L.lifted(), [LILY], 'lifted()');
  const env3 = reload(env);
  eq(env3.L.lifted(), [LILY], 'lifted survives a reload');
  eq(env.ctx.errors, [], 'no errors');
}

section('T113: a Marked giant (marked at its place for every Wick, at any class; +6 Hold on its next hook, once)');
{
  for (const wick of ['wick', 'ashwick']) {
    const meta = placesMeta(D, { own: [SPAN, BUOY] }); meta.loop.wick = wick;
    const env = makeEnv({ meta });
    startTrip(env);
    bite(env, SPAN);
    env.ctx.bus.emit('fish:escaped', { speciesId: 'thousandcast_pike', sizeClass: 'keeper', z: 0.3, place: SPAN, zone: 'mossmere', reason: 'thrown', markedFish: true });
    eq(meta.loop.giants.thousandcast_pike?.marked, 1, `${wick}: a Keeper Thousandcast lost under the Span is marked (any class)`);
    ok(env.ctx.state.run.comeback === null, `${wick}: no comeback is queued for a giant (Ashwick's never takes a giant)`);
    ok(env.L.takeGiantMark('thousandcast_pike') === true && meta.loop.giants.thousandcast_pike.marked === 0 && env.L.takeGiantMark('thousandcast_pike') === false, `${wick}: its next hook takes the mark once (+${D.LOOP.giant.markedHold} Hold), then it is gone`);
    env.ctx.bus.emit('fish:escaped', { speciesId: 'hullkiss_lamprey', sizeClass: 'elder', z: 2.7, place: SPAN, zone: 'mossmere', reason: 'thrown' });
    ok(!meta.loop.giants.hullkiss_lamprey?.marked, `${wick}: a giant lost away from its own place is not marked`);
    env.ctx.bus.emit('fish:escaped', { speciesId: 'reedjaw_pike', sizeClass: 'trophy', z: 2.2, place: null, zone: 'mossmere', reason: 'thrown' });
    ok(!meta.loop.giants.reedjaw_pike, `${wick}: a fish that is no giant is never a giant's mark`);
    ok(env.L.markGiant('reedjaw_pike') === false && env.L.markGiant('belled_matriarch') === false && env.L.markGiant('hullkiss_lamprey') === true && meta.loop.giants.hullkiss_lamprey.marked === 1, `${wick}: markGiant takes a giant only`);
    endTrip(env);
    ok(meta.loop.giants.hullkiss_lamprey.marked === 1 && meta.loop.giants.thousandcast_pike.landed === 0, `${wick}: a mark is kept across trips`);
    eq(env.ctx.errors, [], `${wick}: no errors`);
  }
  // Ashwick's comeback still works for a fish that is no giant (WICKS §2.5)
  const ash = placesMeta(D, { own: [SPAN] }); ash.loop.wick = 'ashwick';
  const env = makeEnv({ meta: ash });
  startTrip(env);
  bite(env, OPEN);
  env.ctx.bus.emit('fish:escaped', { speciesId: 'reedjaw_pike', sizeClass: 'prize', z: 1.4, place: null, zone: 'mossmere', reason: 'thrown' });
  ok(env.ctx.state.run.comeback?.speciesId === 'reedjaw_pike', 'Ashwick: a Reedjaw Pike still comes back');
}

section('T114: the best fish there (best[placeId] by fishWeight, open water under open:mossmere, a length saved, never a weight); a giant\'s fish');
{
  const meta = placesMeta(D, { own: [SPAN] });
  const env = makeEnv({ meta });
  startTrip(env);
  const a = land(env, 'bridgechain_sturgeon', 0.2, { key: SPAN, place: SPAN });
  eq(meta.loop.best[SPAN], { speciesId: 'bridgechain_sturgeon', length: a.length }, 'a measure under the Span writes best[under_the_span] = {speciesId, length}');
  env.P.fishAction(a, 'letgo');
  const small = land(env, 'mossback_perch', -0.5, { key: SPAN, place: SPAN });
  eq(meta.loop.best[SPAN].speciesId, 'bridgechain_sturgeon', 'a lighter fish there keeps the best');
  env.P.fishAction(small, 'letgo');
  const g = land(env, 'thousandcast_pike', 1.4, { key: SPAN, place: SPAN });
  ok(g.giant === true && meta.loop.best[SPAN].speciesId === 'thousandcast_pike', 'a Prize Thousandcast is heavier: the best there; its fish carries giant');
  ok(D.fishWeight(D.SPECIES_BY_ID.thousandcast_pike, g) > D.fishWeight(D.SPECIES_BY_ID.bridgechain_sturgeon, a), '… by the weight the card shows (fishWeight)');
  env.P.fishAction(g, 'keep');
  const o = land(env, 'dusk_minnow', 0.5);
  ok(meta.loop.best[OPEN]?.speciesId === 'dusk_minnow' && meta.loop.best[OPEN].length === o.length && !(LILY in meta.loop.best), 'open water: best[open:mossmere]');
  ok(Object.values(meta.loop.best).every((b) => Object.keys(b).sort().join() === 'length,speciesId'), 'the save holds a length, never a weight');
  env.P.fishAction(o, 'keep');
  const t = endTrip(env);
  ok(t.lines[t.lines.length - 1].speciesId === 'thousandcast_pike' && t.lines[t.lines.length - 1].giant === true, 'the tally weighs the giant last of all');
  ok(meta.loop.giants.thousandcast_pike.landed === 1, 'giants[id].landed counts it');
  eq(env.ctx.errors, [], 'no errors');
}

section('T117: saves (the step-2 save under 3a, a trip with a place and a ball, setPick and pick)');
{
  const fs = await import('node:fs');
  const raw = JSON.parse(fs.readFileSync(new URL('./fixtures/loop-save-m1s2.json', import.meta.url), 'utf8'));
  const before = clone(raw);
  migrateSaveModule(raw, D);
  const { meta } = normalizeSave(raw);
  const env = makeEnv({ meta });
  const L = env.L.state();
  eq([L.clams, L.tackle, L.holdSlots, L.evenings, L.said, L.firsts, L.v], [before.meta.loop.clams, before.meta.loop.tackle, before.meta.loop.holdSlots, before.meta.loop.evenings, before.meta.loop.said, before.meta.loop.firsts, PL.LOOP_SCHEMA],
    "the step-2 save: its clams, tackle, hold, evenings, said, firsts as saved; v up to LOOP_SCHEMA (step 5a's barge)");
  eq(meta.journal, before.meta.journal, 'its Journal byte-identical');
  ok(L.chartPick === null && typeof L.chartPick !== 'object' || L.chartPick === null, 'chartPick === null (never an object)');
  eq([L.lifted, L.best, L.maps.places], [[], {}, []], 'lifted [], best {}, no place owned');
  // setPick: refused for a place not owned; writes {water, place}; read back through pick()
  eq(env.L.setPick({ water: 'mossmere', place: SPAN }), { ok: false }, 'setPick refuses a place not owned');
  eq(env.L.setPick({ water: 'sporewood', place: null }), { ok: false }, '… and a water not open');
  eq(env.L.setPick(null), { ok: false }, '… and no pick');
  L.clams = 999; env.L.buy(`place:${SPAN}`);
  eq(env.L.setPick({ water: 'mossmere', place: SPAN }), { ok: true, pick: { water: 'mossmere', place: SPAN } }, 'an owned place: picked');
  eq(L.chartPick, { water: 'mossmere', place: SPAN }, 'written as {water, place}');
  eq(env.L.pick(), { water: 'mossmere', place: SPAN }, 'pick() reads it back');
  eq(env.L.setPick({ water: 'mossmere', place: LILY }), { ok: false }, 'a place not owned is refused (the pick stays)');
  eq(env.L.pick().place, SPAN, '… the pick stays');
  L.chartPick = 'tutorial';
  eq(env.L.pick(), null, 'a chartPick that is not an object reads as null');
  // a trip saved with a place owned and a ball fitted continues with both (and the pick)
  L.bait.mossmere = { heartmoss: 1 }; env.L.fit('bait', 'heartmoss'); env.L.setPick({ water: 'mossmere', place: SPAN });
  const r = startTrip(env);
  bite(env, SPAN); env.L.closeBite();   // the bite's play reached its card (an open bite is refunded on Continue: T48)
  env.ctx.game.save();
  const env2 = reload(env), L2 = env2.L.state();
  ok(L2.maps.places.includes(SPAN) && L2.fitted.bait === 'heartmoss' && env2.ctx.state.run.equippedBait === 'heartmoss' && env2.ctx.state.run.id === r.id && env2.L.bitesSpent(SPAN) === 1, 'a trip saved with a place owned and a ball fitted continues with both (its bite there counted)');
  eq(env2.L.pick(), { water: 'mossmere', place: SPAN }, '… and the pick');
  const again = clone(meta.loop); PL.migrateLoop(meta, D);
  eq(meta.loop, again, 'a second migrateLoop changes nothing');
  eq(env.ctx.errors, [], 'no errors');
}

console.log(`\nloop-trip: ${pass} passed, ${fail} failed`);
if (fail) { console.log(failures.map((f) => '  - ' + f).join('\n')); process.exit(1); }
