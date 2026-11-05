// Unit tests for the v3 Phase 1 progression items (DESIGN §25.14.2 Pg0, Pg12, Pg1; CONTRACT §13.2, §13.7) with a
// fake ctx, the v3 data at phase 1 (raft build) and, for parity, the flag-off data.
//   node tools/tests/progression-v3.test.mjs   (or node tools/check.mjs)
import * as THREE from 'three';
import * as dataV1 from '../../src/data.js';                 // evaluated first: GW_V3 unset → the flag-off build
import { createBus, defaultMeta, makeRng } from '../../src/core.js';
import { create, migrateSave as migrateSaveModule } from '../../src/progression.js';
import * as V3H from '../../src/progression-v3.js';

globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; globalThis.GW_WALK = false;
const data = await import('../../src/data.js?v3p1');
delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE;

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
function near(a, b, msg, eps = 1e-6) { ok(Math.abs(a - b) <= eps, `${msg} (got ${a}, want ${b} ± ${eps})`); }
const section = (s) => console.log(`- ${s}`);
const clone = (o) => JSON.parse(JSON.stringify(o));

function makeCtx({ D = data, meta = defaultMeta(), combat = {} } = {}) {
  const bus = createBus();
  const events = [];
  const phase = { phase: 'calm', day: 1, time: 0, duration: 180 };
  const calls = { xp: [], addOil: [], addSatiety: [], save: 0, armChum: 0 };
  const ctx = {
    THREE, bus, data: D,
    state: { meta, run: null },
    time: { dt: 0.016, gameDt: 0.016, t: 0, gameT: 0, timeScale: 1, frame: 1 },
    flow: 'playing', paused: false, debug: {}, errors: [], isMobile: false, input: {},
    game: { save() { calls.save++; } },
    survival: {
      getPhaseInfo: () => ({ ...phase, k: phase.time / phase.duration, isNight: phase.phase === 'gloomtide' }),
      addOil(n) { calls.addOil.push(n); }, addSatiety(n) { calls.addSatiety.push(n); }, heal() {},
    },
    actors: { merchant: { present: false, position: new THREE.Vector3(), arrive() { this.present = true; }, leave() { this.present = false; } }, setRaftLevel() {}, setCharacter() {} },
    world: { getMerchantDock: (day) => ({ position: new THREE.Vector3(24, 0, 38 - day), yaw: 1 }), setGateState() {}, getGate: () => null, getDepth: () => 0.5 },
    player: { position: new THREE.Vector3(0, 0, 0), near: null, isNear() { return false; } },
    combat: { addXp(n, info) { calls.xp.push({ n, info }); }, ...combat },
    fishing: { spots: [], signs: [], addSpots() {}, armChum() { calls.armChum++; } },
    ui: { isBlocking: () => false, isShopOpen: () => false, floatText() {} },
  };
  const origEmit = bus.emit.bind(bus);
  bus.emit = (evt, payload = {}) => { events.push({ evt, payload }); origEmit(evt, payload); };
  ctx.progression = create(ctx);
  ctx.progression.init();
  const setPhase = (p, extra = {}) => { Object.assign(phase, { phase: p, time: 0 }, extra); if (ctx.state.run) { ctx.state.run.phase = p; if (extra.day) ctx.state.run.day = extra.day; } ctx.bus.emit('phase:change', { phase: p, prev: null }); };
  return { ctx, events, phase, calls, setPhase, P: ctx.progression, count: (e) => events.filter((x) => x.evt === e).length, last: (e) => [...events].reverse().find((x) => x.evt === e)?.payload };
}
function startRun(env, opts = {}) {
  const { ctx, P } = env;
  const run = P.createRun(opts);
  ctx.state.run = run;
  ctx.state.meta.runs = (ctx.state.meta.runs || 0) + 1;     // main counts the run after createRun (as today)
  ctx.bus.emit('zone:change', { zone: run.zone, prev: null });
  ctx.bus.emit('run:start', { continued: false });
  return run;
}
/** A night: gloomtide → (events) → dawn, on `day`. */
function night(env, day, during = () => {}) {
  env.setPhase('gloomtide', { day });
  during();
  env.setPhase('dawn', { day });
  env.ctx.bus.emit('day:start', { day: day + 1 });
  if (env.ctx.state.run) env.ctx.state.run.day = day + 1;
}

// =====================================================================================
section('the v3 build is what this suite tests');
{
  eq(data.V3_ENABLED, true, 'data?v3p1 is the v3 build'); eq(data.V3_PHASE, 1, 'phase 1');
  eq(dataV1.V3_ENABLED, false, 'plain data.js is the flag-off build');
  ok(!!data.SPECIES_BY_ID.lantern_swallower && !data.SPECIES_BY_ID.pale_leviathan, 'v3 species ids renamed');
  ok(!!data.BAIT_BY_ID.last_candle && !data.BAIT_BY_ID.pale_marrow, 'v3 bait ids renamed');
  ok(!!data.SUPPLY_BY_ID.murks_chum && !data.SUPPLY_BY_ID.tide_chart, 'v3 supply ids renamed');
}

// =====================================================================================
section('Pg0: a v1 save migrates ids only, once (DESIGN §25.14.2 Pg0)');
const V1_SAVE = () => ({
  version: 1, savedAt: 1,
  meta: {
    ...defaultMeta(), runs: 7, memories: 120,
    journal: { pale_leviathan: { caught: 1, biggest: 212.4, firstDay: 11, firstRun: 6 }, dusk_minnow: { caught: 14, biggest: 0.3, firstDay: 1, firstRun: 1 } },
    unlocks: { 'bait:pale_marrow': true, 'trophy:pale_leviathan': true, 'character:taper': true, records: { bestDay: 11 } },
    challengeProgress: { catch_100: 40 },
  },
  run: {
    active: true, id: 'run_x', day: 3, phase: 'calm', zone: 'paleabyss', character: 'wick', shells: 400,
    bait: { pale_marrow: 1, mireworm: 3 }, equippedBait: 'pale_marrow', legendaries: { pale_leviathan: true },
    creel: [{ uid: 'f1', speciesId: 'pale_leviathan', weight: 212.4, value: 2500, food: 100, oil: 150, quality: 'normal' }, { uid: 'f2', speciesId: 'dusk_minnow', weight: 0.2, value: 5, food: 8, oil: 9, quality: 'normal' }],
    upgrades: {}, boons: {}, bounties: [{ id: 'b1', type: 'legend', target: 'pale_leviathan', text: 'Land The Pale Leviathan.', count: 1, progress: 0 }],
    stats: { fishCaught: 3, biggest: { speciesId: 'pale_leviathan', weight: 212.4 } },
    flags: { wounded: { pale_leviathan: 0.3 }, prevBait: 'mireworm', visit: { day: 3, sold: 0, supplies: { tide_chart: 1 } }, records: [{ speciesId: 'pale_leviathan', weight: 212.4, prev: 180 }] },
  },
});
{
  const save = V1_SAVE();
  const out = V3H.migrateSave(data, save);
  ok(out === save, 'migrateSave works in place and returns the save');
  const j = out.meta.journal;
  ok(!!j.lantern_swallower && !j.pale_leviathan, 'the Journal holds the Lantern-Swallower, not the Pale Leviathan');
  eq(j.lantern_swallower, { caught: 1, biggest: 212.4, firstDay: 11, firstRun: 6 }, 'its entry is kept');
  eq(j.dusk_minnow.caught, 14, 'other journal entries untouched');
  ok(out.meta.unlocks['bait:last_candle'] === true && !('bait:pale_marrow' in out.meta.unlocks), 'the bait unlock is kept under its new id');
  ok(out.meta.unlocks['trophy:lantern_swallower'] === true, 'trophy unlock renamed');
  eq(out.meta.unlocks.records, { bestDay: 11 }, 'unlocks.records untouched');
  eq(out.meta.v3ids, true, 'meta.v3ids set');
  eq(out.meta.memories, 120, 'nothing else changes (Memories)');
  eq(out.run.bait, { mireworm: 3, last_candle: 1 }, 'Last Candle in the bag');
  eq(out.run.equippedBait, 'last_candle', 'equipped bait renamed');
  eq(out.run.legendaries, { lantern_swallower: true }, 'run.legendaries renamed');
  eq(out.run.creel.map((f) => f.speciesId), ['lantern_swallower', 'dusk_minnow'], 'creel fish renamed');
  eq(out.run.flags.wounded, { lantern_swallower: 0.3 }, 'wounded legend renamed');
  eq(out.run.flags.visit.supplies, { murks_chum: 1 }, 'per-visit supply count renamed');
  eq(out.run.stats.biggest.speciesId, 'lantern_swallower', 'run biggest renamed');
  eq(out.run.bounties[0].target, 'lantern_swallower', 'bounty target renamed');
  eq(out.run.bounties[0].text, 'Land The Lantern-Swallower.', 'bounty text renamed');
  const before = clone(out);
  V3H.migrateSave(data, out);
  eq(out, before, 'a second load changes nothing');
  // merging when both ids are present (a v3 save that met an old key)
  const both = { meta: { journal: { pale_leviathan: { caught: 1, biggest: 200, firstDay: 3, firstRun: 2 }, lantern_swallower: { caught: 2, biggest: 250, firstDay: 9, firstRun: 5 } } }, run: { bait: { pale_marrow: 1, last_candle: 2 } } };
  V3H.migrateSave(data, both);
  eq(both.meta.journal.lantern_swallower, { caught: 3, biggest: 250, firstDay: 3, firstRun: 2 }, 'journal entries merge');
  eq(both.run.bait.last_candle, 3, 'bait counts merge');
  // flag off: untouched
  const v1 = V1_SAVE(), v1c = clone(v1);
  V3H.migrateSave(dataV1, v1);
  eq(v1, v1c, 'flag off: migrateSave leaves the save untouched');
  // the module export main may call at boot, before any module exists (CONTRACT §13.1)
  const mv = V1_SAVE(), mvc = clone(mv);
  migrateSaveModule(mv);
  eq(mv, mvc, "module migrateSave(save) uses the build's data (here the flag-off build): untouched");
  ok(migrateSaveModule(V1_SAVE(), data).run.bait.last_candle === 1, 'module migrateSave(save, v3 data) renames');
}
{
  // through progression: main calls migrateSave(envelope) at boot (CONTRACT §13.1) …
  const env = makeCtx();
  const save = V1_SAVE();
  const out = env.P.migrateSave(save);
  ok(out.meta.journal.lantern_swallower && out.run.bait.last_candle === 1, 'progression.migrateSave renames the envelope');
  eq(env.ctx.debug.migrate(JSON.stringify(V1_SAVE())).meta.v3ids, true, 'debug.migrate(saveJson) (CONTRACT §13.11)');
  // … and a main that does not call it yet still gets a migrated meta (init) and run (continue)
  const s2 = V1_SAVE();
  const env2 = makeCtx({ meta: s2.meta });
  ok(!!env2.ctx.state.meta.journal.lantern_swallower && env2.ctx.state.meta.v3ids, 'init migrates the live meta');
  const jn = env2.P.getJournal().find((x) => x.id === 'lantern_swallower');
  ok(jn?.discovered && jn.caught === 1, 'the Journal shows the Lantern-Swallower as landed');
  env2.ctx.state.run = s2.run;
  env2.ctx.bus.emit('zone:change', { zone: s2.run.zone, prev: null, continued: true });
  env2.ctx.bus.emit('run:start', { continued: true });
  eq(String(env2.P.getEquippedBait()), 'last_candle', 'the continued run has Last Candle on the hook');
  eq(env2.P.getEquippedBait().count, 1, 'one Last Candle in the bag');
  eq(env2.ctx.state.run.nightMode, 'gloomtide', 'a run started before v3 continues under its own rules (Gloomtide)');
  eq(env2.ctx.state.run.outing, 'normal', 'and is a normal outing');
  ok(env2.P.isUnlocked('character:taper'), 'unlocks kept');
  eq(env2.ctx.errors, [], 'no errors');
}

// =====================================================================================
section('Pg12: createRun({…, nightMode, outing}); First Outing all still; stats via upgradeTiers');
{
  const env = makeCtx();
  const { P, ctx } = env;
  eq(ctx.state.meta.runs, 0, 'fresh save');
  const nm0 = P.getNightModes();
  ok(nm0.firstOuting && nm0.modes.length === 0 && nm0.default === 'still', 'a fresh save is offered only the First Outing');
  const r1 = startRun(env, { nightMode: 'gloomtide' });
  eq([r1.outing, r1.nightMode], ['first', 'still'], 'run 1 is the First Outing, still, whatever was asked');
  eq([r1.zone, r1.character], ['mossmere', 'wick'], 'First Outing: the Mossmere with The Wick');
  ok([1, 2, 3, 4, 5, 6, 8, 10].every((n) => !data.swarmTonight(r1.nightMode, n, r1.outing)), 'every night of run 1 is still (data.swarmTonight)');
  eq(P.createRun({}).outing, 'normal', 'run 2 (meta.runs 1) is not the First Outing');
  const nm1 = P.getNightModes();
  eq(nm1.modes.map((m) => m.id), ['still', 'lantern', 'gloomtide'], 'the second run offers three modes');
  eq(nm1.default, 'lantern', 'Lantern preselected');
  for (const mode of ['still', 'lantern', 'gloomtide']) eq(P.createRun({ nightMode: mode }).nightMode, mode, `run 2 starts in the chosen mode (${mode})`);
  eq(P.createRun({}).nightMode, 'lantern', 'no choice → Lantern (the default)');
  eq(P.createRun({ nightMode: 'bogus' }).nightMode, 'lantern', 'an unknown mode → Lantern');
  ok(data.swarmTonight('lantern', 2, 'normal') && !data.swarmTonight('lantern', 1, 'normal'), 'Lantern swarms on even nights (data)');
  // locked for the run
  const r2 = startRun(env, { nightMode: 'still' });
  for (const d of [1, 2, 3]) night(env, d);
  eq(r2.nightMode, 'still', 'nightMode stays locked through nights and dawns');
  ctx.bus.emit('run:start', { continued: true });
  eq(r2.nightMode, 'still', 'and through a Continue');
}
{
  const env = makeCtx();
  const { P, ctx } = env;
  // D1′ retired the manual reel's v3 fight stats (shock, pipBonus, absorb, dragAt): getStats carries none of them in any build
  const s0 = P.getStats();
  eq([s0.shock, s0.pipBonus, s0.absorb, s0.dragAt], [undefined, undefined, undefined, undefined], 'no run: no v3 fight stats (retired by D1′)');
  const run = startRun(env, {});
  const s1 = P.getStats();
  eq([s1.shock, s1.pipBonus, s1.absorb, s1.dragAt], [undefined, undefined, undefined, undefined], 'no upgrades: no v3 fight stats');
  run.upgrades = { rod_ashwood: 3, rod_whalebone: 2, reel_brass: 4, reel_drag: 3, line_gut: 2 };
  run.satiety = 0;                                                  // not Well-fed: base stats only
  P.invalidateStats();
  const tiers = data.upgradeTiers(run.upgrades);
  eq(tiers, { rod: 3, line: 1, reel: 4, creel: 0 }, 'effective tiers from owned levels (rod 5/6 → T3, line 2/6 → T1, reel 7/7 → T4)');
  const s2 = P.getStats();
  eq([s2.shock, s2.pipBonus, s2.absorb, s2.dragAt], [undefined, undefined, undefined, undefined], 'owned upgrades add no v3 fight stats (their Hold is data.upgradeHold)');
  near(s2.castMax, data.STATS.castMax.base + 9 + (data.CHARACTERS[0].effects?.castMax || 0), 'the other stats stay computeStats(UPGRADES) (castMax +3 per Ashwood level)');
  near(s2.reelSpeed, data.STATS.reelSpeed.base, 'Brass Spool levels add no reel speed in v3 (D1′: a dead reel stat; the reel slot gives Hold)', 1e-9);
  ok(data.upgradeHold(run.upgrades).reel === 12 && data.upgradeHold(run.upgrades).rod > data.upgradeHold({}).rod, 'their Hold comes from data.upgradeHold (reel 7/7 → 12)');
  eq(ctx.errors, [], 'no errors');
}
{
  // Well-fed (S3 seam): satiety ≥ 60% of max. D1′: its effect is +2 Hold (a run buff through getCatchBuffs, S7), never a reel stat
  const env = makeCtx();
  const { P } = env;
  const run = startRun(env, {});
  run.satiety = 100; P.invalidateStats(); env.ctx.time.frame++;
  const fed = P.getStats(); const fedReel = fed.reelSpeed, fedSweet = fed.sweetZone;
  ok(P.isWellFed(), 'full belly → Well-fed');
  run.satiety = 59; env.ctx.time.frame++;
  ok(!P.isWellFed(), 'below 60% → not Well-fed');
  near(fedReel - P.getStats().reelSpeed, 0, 'Well-fed adds no reel speed (D1′)', 1e-9);
  near(fedSweet - P.getStats().sweetZone, 0, 'Well-fed adds no sweet band (D1′)', 1e-9);
  eq(data.BALANCE.wellFed.effects, { hold: 2 }, 'Well-fed is +2 Hold in data (BALANCE.wellFed.effects; not a STATS key)');
}

// =====================================================================================
section('Pg1: makeFish from z — value × 0.66, food / oil × 0.784, class, name');
{
  const env = makeCtx();
  const { P } = env;
  startRun(env, {});
  const sp = data.SPECIES_BY_ID.reedjaw_pike;
  const elder = P.makeFish('reedjaw_pike', 2.8, 'normal');
  ok(Math.abs(elder.value - 127) <= 1, `an Elder Reedjaw at z 2.8 sells for 127 ± 1 Shells at normal quality (got ${elder.value})`);
  eq(P.fishYield(elder).shells, elder.value, 'and that is what Murk pays (sellMult 1)');
  eq([elder.sizeClass, elder.ancient], ['elder', false], 'z 2.8 is an Elder, not an Ancient');
  ok(typeof elder.name === 'string' && elder.name.split(' ').length === 2, `an Elder gets a name (${elder.name})`);
  near(elder.length, Math.round(data.sizeLength(sp, 2.8) * 10) / 10, 'length (cm) from the stretched size model', 1e-9);
  near(elder.weight, Math.round(data.sizeWeight(sp, data.sizeLength(sp, 2.8)) * 100) / 100, 'weight (kg) = k·L³', 1e-9);
  eq([elder.marked, elder.place, elder.favours], [false, null, []], 'P1: not marked, no place, no favours given');
  const fine = P.makeFish('reedjaw_pike', 2.8, 'fine');
  eq(fine.value, data.fishValueV3(sp, 2.8, { quality: 1.4 }), 'quality multiplies value');
  eq(P.makeFish('reedjaw_pike', 0.4).sizeClass, 'keeper', 'z 0.4 → Keeper');
  eq(P.makeFish('reedjaw_pike', -1).sizeClass, 'small', 'z −1 → Small');
  eq(P.makeFish('reedjaw_pike', 1.5).sizeClass, 'prize', 'z 1.5 → Prize');
  eq(P.makeFish('reedjaw_pike', 2.2).sizeClass, 'trophy', 'z 2.2 → Trophy');
  eq(P.makeFish('reedjaw_pike', 3.3).ancient, true, 'z 3.3 → Ancient');
  eq(P.makeFish('reedjaw_pike', 0.4).name, undefined, 'only Elders are named');
  const withFav = P.makeFish('reedjaw_pike', 1.2, 'normal', { favours: [{ family: 'hour', id: 'dusk', value: 0.2 }], place: 'bell_pool' });
  eq([withFav.favours, withFav.place], [[{ family: 'hour', id: 'dusk', value: 0.2 }], 'bell_pool'], 'favours and place carried on the Fish');
  env.ctx.state.run.flags.streak = 7;
  eq(P.makeFish('reedjaw_pike', 0).value, data.fishValueV3(sp, 0, { streak: 1.5 }), 'perfect-hook streak kept (capped at 5 → × 1.5)');
  env.ctx.state.run.flags.streak = 0;
  const leg = P.makeFish('belled_matriarch', 0.3, 'normal');
  const lsp = data.SPECIES_BY_ID.belled_matriarch;
  ok(leg.legendary && leg.value === lsp.value && leg.food === lsp.food && leg.oil === lsp.oil, 'a legend sells and renders at its authored species values');
  near(leg.length, Math.round(data.sizeLength(lsp, 0.3) * 10) / 10, 'a legend is measured to its authored size (σ 0.02)', 1e-9);
  ok(P.makeFish('nope', 1).value > 0, 'unknown species tolerated');
}
{
  // a Mossmere common renders ≈ 17 oil on average (the favour mix: BALANCE.size.valueMix; a third in giant water)
  const env = makeCtx();
  const { P } = env;
  startRun(env, {});
  const SZ = data.BALANCE.size, VM = SZ.valueMix;
  const commons = data.SPECIES.filter((s) => s.zone === 'mossmere' && s.rarity === 'common');
  const rng = makeRng(20261104);
  const gauss = () => { let u = 0, v = 0; while (u === 0) u = rng(); while (v === 0) v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const pickMu = () => { let x = rng(); for (const [mu, w] of VM.mu) { x -= w; if (x <= 0) return mu; } return VM.mu.at(-1)[0]; };
  let total = 0, n = 0;
  for (let i = 0; i < 6000; i++) {
    const sp = commons[i % commons.length];
    const cap = rng() < VM.giantShare ? SZ.z.max : SZ.elsewhereMaxZ;
    const mu = pickMu();
    let z; do { z = mu + gauss(); } while (z < SZ.z.min || z > cap);
    const fish = P.makeFish(sp.id, z, 'normal');
    const res = P.fishAction(fish, 'render');
    total += res.gained.oil; n++;
  }
  const avg = total / n;
  ok(avg >= 16.4 && avg <= 17.6, `a Mossmere common renders ≈ 17 oil on average over 6,000 seeded catches (got ${avg.toFixed(2)}; commons ${commons.map((s) => s.id).join(', ')})`);
}

// =====================================================================================
section('Pg1: measure — once, before the card; journal, records, class firsts, instant Memories');
{
  const env = makeCtx();
  const { P, ctx } = env;
  const run = startRun(env, { nightMode: 'still' });
  const m = ctx.state.meta;
  const mem0 = m.memories;
  const fish = P.makeFish('reedjaw_pike', 2.0, 'normal', { favours: [{ family: 'hour', id: 'dusk', value: 0.2 }] });
  const res = P.measure(fish);
  eq(env.count('fish:measured'), 1, 'fish:measured fired once');
  const iM = env.events.findIndex((e) => e.evt === 'fish:measured'), iL = env.events.findIndex((e) => e.evt === 'fish:landed');
  ok(iM >= 0 && iL > iM, 'fish:measured fires before fish:landed (the card)');
  const fm = env.last('fish:measured');
  eq([fm.speciesId, fm.sizeClass, fm.ancient, fm.cove], ['reedjaw_pike', 'trophy', false, false], 'fish:measured payload');
  ok(fm.fish === fish && fm.length === fish.length && fm.weight === fish.weight && fm.z === fish.z, 'fish:measured carries the Fish and its figures');
  eq(env.last('fish:landed').measured, true, 'fish:landed {measured: true}');
  eq(res.records.map((x) => x.kind), ['bestSetup', 'classFirst'], 'records: best setup and the Trophy class first (a first catch is no PB banner)');
  const entry = m.journal.reedjaw_pike;
  eq([entry.caught, entry.pbLength, entry.pbWeight, entry.seals?.trophy], [1, fish.length, fish.weight, true], 'journal: count, PB, Trophy seal');
  eq(entry.bestSetup, [{ family: 'hour', id: 'dusk', value: 0.2 }], 'best setup stored with the PB');
  eq(entry.lastLengths, [fish.length], 'last lengths');
  const memBy = (src, from = 0) => env.events.slice(from).filter((e) => e.evt === 'memories:change' && e.payload.source === src).map((e) => e.payload.delta);
  eq([memBy('journal'), memBy('classFirst')], [[data.MEMORIES_V3.newSpecies], [data.MEMORIES_V3.classFirst.trophy]], 'new species (3) and the Trophy class first (4) bank at once');
  ok(m.memories - mem0 >= 7, 'meta.memories rose at once (plus any trial it completed)');
  ok(run.creel.includes(fish), 'the Fish is in the creel');
  ok(run.active !== false, '… while the run is still going (visible in meta before it ends)');
  // exactly once
  P.measure(fish);
  eq(env.count('fish:measured'), 1, 'a second measure of the same fish does not fire again');
  eq(m.journal.reedjaw_pike.caught, 1, 'nor count it twice');
  // a bigger one: PB record, no new class first at Trophy
  const ev1 = env.events.length;
  const big = P.makeFish('reedjaw_pike', 2.4);
  const r2 = P.measure(big);
  ok(r2.records.some((x) => x.kind === 'pb' && x.prevLength === fish.length && x.length === big.length), 'a longer fish is a PB with the old length');
  ok(!r2.records.some((x) => x.kind === 'classFirst'), 'no second Trophy class first');
  ok(r2.records.some((x) => x.kind === 'oldLedger'), 'z 2.4 beats the Old Ledger (z 2.3)');
  eq(memBy('oldLedger', ev1), [data.MEMORIES_V3.oldLedger], 'Old Ledger +5 at once');
  eq(env.last('fish:landed').isRecord, true, 'fish:landed isRecord for a PB');
  // an Elder: Elder Log with its name, Elder class first
  const ev2 = env.events.length;
  const elder = P.makeFish('reedjaw_pike', 2.9);
  const r3 = P.measure(elder);
  eq(m.elderLog.length, 1, 'the Elder Log has one line');
  eq([m.elderLog[0].name, m.elderLog[0].speciesId, m.elderLog[0].length, m.elderLog[0].zone], [elder.name, 'reedjaw_pike', elder.length, 'mossmere'], 'Elder Log line: name, species, cm, lake');
  ok(r3.records.some((x) => x.kind === 'elderLog') && r3.records.some((x) => x.kind === 'classFirst' && x.sizeClass === 'elder'), 'records: Elder Log and Elder class first');
  eq(memBy('classFirst', ev2), [data.MEMORIES_V3.classFirst.elder], 'Elder class first +12 at once');
  eq(ctx.errors, [], 'no errors');
}
{
  // first-release Memories (Prize 1 / Trophy 3 / Elder 8), once per species and class
  const env = makeCtx();
  const { P, ctx } = env;
  startRun(env, {});
  const m = ctx.state.meta;
  const t = P.makeFish('weeping_carp', 2.0); P.measure(t);
  const mem0 = m.memories;
  const res = P.fishAction(t.uid, 'release');
  ok(res.ok && res.gained.memories === 3, 'the first Trophy Weeping Carp released banks +3 Memories');
  eq(m.memories - mem0, 3, 'banked in meta at once');
  ok(!ctx.state.run.creel.includes(t), 'released fish leaves the creel');
  const t2 = P.makeFish('weeping_carp', 2.1); P.measure(t2);
  const mem1 = m.memories;
  eq(P.fishAction(t2.uid, 'release').gained.memories, undefined, 'a second Trophy release banks nothing');
  eq(m.memories, mem1, 'meta unchanged');
  const p = P.makeFish('weeping_carp', 1.4); P.measure(p);
  eq(P.fishAction(p.uid, 'release').gained.memories, 1, 'a first Prize release +1');
  const k = P.makeFish('weeping_carp', 0.2); P.measure(k);
  eq(P.fishAction(k.uid, 'release').gained.memories, undefined, 'a Keeper release banks no Memories');
  eq(m.journal.weeping_carp.released, { trophy: true, prize: true }, 'journal.released per class');
  await new Promise((r) => setTimeout(r, 0));
  ok(env.calls.save > 0, 'a save is requested after banking');
}
{
  // the hand-off on the bus: fishing:caught with a Fish is informational; a weight-only event (older fishing) is measured here
  const env = makeCtx();
  const { P, ctx } = env;
  const run = startRun(env, {});
  const fish = P.makeFish('dusk_minnow', 0.5);
  ctx.bus.emit('fishing:caught', { speciesId: 'dusk_minnow', fish, z: fish.z, sizeClass: fish.sizeClass, weight: fish.weight, quality: 'normal' });
  eq(env.count('fish:measured'), 0, 'fishing:caught {fish} writes nothing (fishing measures at the stamp)');
  ok(!run.creel.includes(fish), 'and does not add it to the creel');
  P.measure(fish);
  eq(env.count('fish:measured'), 1, 'measure at the stamp');
  ctx.bus.emit('fishing:caught', { speciesId: 'mossback_perch', weight: 0.9, quality: 'fine' });
  eq(env.count('fish:measured'), 2, 'a weight-only fishing:caught is measured (compat)');
  const lp = env.last('fish:landed');
  ok(lp.fish.speciesId === 'mossback_perch' && lp.fish.quality === 'fine' && Math.abs(lp.fish.weight - 0.9) < 0.02, `its size score reproduces the weight (${lp.fish.weight} kg, z ${lp.fish.z})`);
  near(V3H.zFromWeight(data, data.SPECIES_BY_ID.reedjaw_pike, data.sizeWeight(data.SPECIES_BY_ID.reedjaw_pike, data.sizeLength(data.SPECIES_BY_ID.reedjaw_pike, 2.9))), 2.9, 'zFromWeight inverts the size model', 1e-3);
  eq(ctx.errors, [], 'no errors');
}
{
  // XP per mode: Still fish XP × 1.4 with no zone factor; discovery XP (+2 species, +2 class first, ≤ 12 a day)
  const env = makeCtx();
  const { P, ctx } = env;
  ctx.state.meta.runs = 3;
  const run = startRun(env, { nightMode: 'still', startZone: 'mossmere' });
  P.measure(P.makeFish('reedjaw_pike', 1.4));                      // new species + Prize class first
  const base = Math.round(data.fishXpFor('rare', 0) * 1.4);
  eq(env.calls.xp.at(-1).n, base + 2 + 2, `Still: fish XP × 1.4 (${base}) + discovery 4`);
  P.measure(P.makeFish('reedjaw_pike', 0.2));
  eq(env.calls.xp.at(-1).n, base, 'no discovery on a repeat Keeper');
  ok(env.calls.xp.at(-1).info?.source === 'fish' && env.calls.xp.at(-1).info?.modeApplied === true, 'addXp is told the mode multiplier is applied');
  for (const id of ['dusk_minnow', 'mossback_perch', 'gutter_crayfish', 'weeping_carp']) P.measure(P.makeFish(id, 1.5));
  eq(run.flags.discoveryXp.n, 12, 'discovery XP caps at 12 a day');
  const env2 = makeCtx();
  env2.ctx.state.meta.runs = 3;
  startRun(env2, { nightMode: 'gloomtide' });
  env2.P.measure(env2.P.makeFish('reedjaw_pike', 0.2));
  eq(env2.calls.xp.at(-1).n, data.fishXpFor('rare', 0) + 2, 'Gloomtide: fish XP × 1.0 (+ new species discovery)');
}

// =====================================================================================
section('Pg1: refundBait (let it pass)');
{
  const env = makeCtx();
  const { P, ctx } = env;
  const run = startRun(env, {});
  eq(run.bait.mireworm, 4, 'kit bait');
  eq(P.consumeBait(), 'mireworm', 'a cast spends one'); eq(run.bait.mireworm, 3, '3 left');
  eq(P.refundBait('mireworm'), true, 'a lapsed bite refunds it'); eq(run.bait.mireworm, 4, 'back to 4');
  eq(P.refundBait('mireworm'), false, 'only once per cast'); eq(run.bait.mireworm, 4, 'still 4');
  P.consumeBait();
  eq(P.refundBait('lumen_moss'), false, 'only the bait this cast spent');
  run.bait = { mireworm: 1 }; run.equippedBait = 'mireworm';
  P.consumeBait();
  eq(run.equippedBait, null, 'the last worm spent → bare hook');
  eq(P.refundBait('mireworm'), true, 'refunded');
  eq([run.bait.mireworm, run.equippedBait], [1, 'mireworm'], 'and back on the hook');
  run.equippedBait = null;
  P.consumeBait();
  eq(P.refundBait(null), false, 'a bare-hook cast refunds nothing');
  eq(ctx.errors, [], 'no errors');
}

// =====================================================================================
section('Pg1: the death screen — no species row, nights at the tally values (MEMORIES_V3.interim)');
{
  const env = makeCtx();
  const { P, ctx } = env;
  ctx.state.meta.runs = 2;
  const run = startRun(env, { nightMode: 'lantern' });
  P.measure(P.makeFish('dusk_minnow', 0));                          // a new species: paid at the stamp
  P.measure(P.makeFish('mossback_perch', 0));
  night(env, 1);                                                    // odd night: still (1)
  night(env, 2, () => ctx.bus.emit('swarm:window', { state: 'open', night: 2, mode: 'lantern' }));   // swarm (4)
  night(env, 3);                                                    // still (1)
  night(env, 4, () => ctx.bus.emit('lampwatch:start', { lampId: 'l1', zone: 'mossmere', forced: false }));   // lamp-watch: still (1)
  eq(run.flags.nightLog.map((n) => n.kind), ['lanternStill', 'swarm', 'lanternStill', 'lanternStill'], 'night log');
  eq(run.tally, { dawns: 4, stillNights: 3, swarmNights: 1 }, 'run.tally counts');
  const memBefore = ctx.state.meta.memories;
  const s = P.summarizeRun('snuffed');
  const L = data.TEXT.memoryLabels;
  ok(!s.breakdown.some((x) => x.label === L.species), 'the death screen pays no species row');
  eq(s.breakdown.find((x) => x.label === L.nights)?.value, 1 + 4 + 1 + 1, 'the nights row is the per-night tally (1 + 4 + 1 + 1)');
  const v1 = data.memoriesFor({ day: run.day, zoneIndex: 0, fishCaught: 2, newSpecies: 2, legendaries: [], bountiesDone: 0, enemiesSlain: 0, nightsSurvived: 4, deepestEnduredIndex: 0 });
  ok(v1.breakdown.some((x) => x.label === L.species) && v1.breakdown.find((x) => x.label === L.nights).value === 12, 'v1 memoriesFor would have paid species and 4 × 3 nights');
  eq(s.memories, s.breakdown.reduce((a, x) => a + x.value, 0), 'total = rows');
  eq(ctx.state.meta.memories - memBefore, s.memories, 'banked once at the death screen');
  eq([s.title, s.nightMode, s.outing], ['Snuffed', 'lantern', 'normal'], 'titled Snuffed; mode and outing on the summary');
  ok(typeof s.tip === 'string' && s.tip.length > 0, 'a snuff tip');
}
{
  const env = makeCtx({ combat: { swarmTonight: false } });
  const { P, ctx } = env;
  ctx.state.meta.runs = 2;
  const run = startRun(env, { nightMode: 'lantern' });
  night(env, 2);                                                    // combat says no swarm tonight → still even on an even night
  eq(run.flags.nightLog[0].kind, 'lanternStill', "combat.swarmTonight is read when it exists");
  const env2 = makeCtx();
  env2.ctx.state.meta.runs = 2;
  const r2 = startRun(env2, { nightMode: 'lantern' });
  night(env2, 2, () => env2.ctx.bus.emit('player:scorched', { night: 2, x: 0, z: 0 }));
  eq(r2.flags.nightLog[0].kind, 'lanternStill', 'a Scorched night counts as a still night');
}
{
  const env = makeCtx();
  const { P, ctx } = env;
  ctx.state.meta.runs = 2;
  const run = startRun(env, { nightMode: 'gloomtide' });
  night(env, 1); night(env, 2);
  run.zone = 'sporewood';
  night(env, 3);
  const s = P.summarizeRun('gloom');
  const M = data.BALANCE.memories;
  eq(s.breakdown.find((x) => x.label === data.TEXT.memoryLabels.nights)?.value, 2 * (M.nightBase + 0 * M.nightPerZone) + (M.nightBase + 1 * M.nightPerZone), 'Gloomtide nights: v1 base + zone, per night');
  const env2 = makeCtx();
  const r1 = startRun(env2, {});                                    // First Outing
  night(env2, 1); night(env2, 2);
  eq(r1.flags.nightLog.map((n) => n.kind), ['still', 'still'], 'First Outing nights are still');
  ctx.state.meta.relics.remembrance = 1;
}

// =====================================================================================
section('market: Murk\'s Chum arms the next cast; sign bounties');
{
  const env = makeCtx();
  const { P, ctx } = env;
  const run = startRun(env, {});
  ctx.debug.summonMerchant();
  ctx.player.isNear = (id) => id === 'merchant';
  ctx.debug.addShells(200);
  const item = P.shop.getItems().find((x) => x.id === 'supply:murks_chum');
  ok(!!item && item.canBuy, "Murk's Chum is on sale");
  const res = P.shop.buy('supply:murks_chum');
  ok(res.ok && env.calls.armChum === 1, `buying Murk's Chum calls fishing.armChum() (${JSON.stringify(res)} ${env.calls.armChum})`);
  ok(!P.shop.buy('supply:murks_chum').ok, 'one per visit');
  // "heavy" bounties target a top-quarter fish by size score (z 0.674), not a share of the stretched weight range
  near(V3H.zAtPercentile(0.75), 0.6745, 'z at the 75th percentile', 1e-3);
  const sp = data.SPECIES_BY_ID.dusk_minnow;
  near(V3H.heavyTargetKg(data, sp, 0.75), data.sizeWeight(sp, data.sizeLength(sp, 0.6745)), 'heavy target = weight at z 0.674', 1e-3);
  let heavy = null;
  for (let i = 0; i < 300 && !heavy; i++) {
    run.bounties = [];
    heavy = (ctx.debug.offerBounties() || []).find((b) => b.type === 'heavy') || null;
  }
  ok(!!heavy, 'a heavy bounty was offered');
  if (heavy) {
    const hs = data.SPECIES_BY_ID[heavy.target];
    const prizeKg = data.sizeWeight(hs, data.sizeLength(hs, 1.04));
    ok(heavy.kg > 0 && heavy.kg <= prizeKg, `a heavy bounty asks for a Keeper-sized fish or less (${heavy.kg} kg ≤ ${prizeKg.toFixed(2)} kg for ${heavy.target})`);
  }
  eq(ctx.errors, [], 'no errors');
}

// =====================================================================================
section('flag-off parity: nothing v3 leaks into the v1 build');
{
  const env = makeCtx({ D: dataV1 });
  const { P, ctx } = env;
  const run = startRun(env, { nightMode: 'still' });
  ok(!('nightMode' in run) && !('outing' in run) && !('tally' in run), 'createRun: no v3 fields');
  ok(!('shock' in P.getStats()), 'getStats: no v3 stats');
  const sp = dataV1.SPECIES_BY_ID.reedjaw_pike;
  const mid = (sp.weight[0] + sp.weight[1]) / 2;
  const f = P.makeFish('reedjaw_pike', mid, 'normal');
  eq([f.value, f.food, f.oil], [sp.value, sp.food, sp.oil], 'makeFish is v1 (weight → sizeK)');
  ok(!('z' in f) && !('sizeClass' in f), 'no v3 fields on the v1 Fish');
  P.consumeBait();
  eq(P.refundBait('mireworm'), false, 'refundBait is inert');
  ctx.bus.emit('fishing:caught', { speciesId: 'dusk_minnow', weight: 0.2, quality: 'normal' });
  eq(env.count('fish:measured'), 0, 'no fish:measured in v1');
  eq(env.count('fish:landed'), 1, 'v1 landFish on fishing:caught');
  ok(!('measured' in env.last('fish:landed')), 'v1 fish:landed payload');
  eq(P.getNightModes(), null, 'getNightModes inert');
  const s = P.summarizeRun('darkness');
  ok(s.breakdown.some((x) => x.label === dataV1.TEXT.memoryLabels.species), 'v1 death screen keeps the species row');
  ok(!('nightMode' in s), 'no v3 summary fields');
  eq(ctx.errors, [], 'no errors');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
