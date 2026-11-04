// Unit tests for src/progression.js with a fake ctx (progression author's suite, kept in sync with
// data.js by the integrator).  node tools/tests/progression.test.mjs  (or node tools/check.mjs)
import * as THREE from 'three';
import * as data from '../../src/data.js';
import { createBus, defaultMeta } from '../../src/core.js';
import { create } from '../../src/progression.js';

let pass = 0, fail = 0;
const failures = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; failures.push(msg); console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
function near(a, b, msg, eps = 1e-6) { ok(Math.abs(a - b) < eps, `${msg} (got ${a}, want ${b})`); }
const section = (s) => console.log(`- ${s}`);

function makeCtx() {
  const bus = createBus();
  const events = [];
  const phase = { phase: 'calm', day: 1, time: 0, duration: 120 };
  const calls = { addOil: [], addSatiety: [], heal: [], raft: [], gate: [], arrive: [], leave: 0, xp: [], float: [], save: 0, character: [], spots: [] };
  const ctx = {
    THREE, bus, data,
    state: { meta: defaultMeta(), run: null },
    time: { dt: 0.016, gameDt: 0.016, t: 0, gameT: 0, timeScale: 1, frame: 1 },
    flow: 'playing', paused: false, debug: {}, errors: [], isMobile: false,
    input: {},
    game: { save() { calls.save++; } },
    survival: {
      getPhaseInfo: () => ({ ...phase, k: phase.time / phase.duration, isNight: phase.phase === 'gloomtide' }),
      addOil(n) { calls.addOil.push(n); const r = ctx.state.run; if (r) r.oil = Math.min(ctx.progression.getStats().maxOil, r.oil + n); },
      addSatiety(n) { calls.addSatiety.push(n); const r = ctx.state.run; if (r) r.satiety = Math.min(ctx.progression.getStats().maxSatiety, r.satiety + n); },
      heal(n) { calls.heal.push(n); const r = ctx.state.run; if (r) r.hp = Math.min(ctx.progression.getStats().maxHp, r.hp + n); },
    },
    actors: {
      merchant: { present: false, position: new THREE.Vector3(), arrive(p, yaw) { this.present = true; if (p) this.position.copy(p); calls.arrive.push({ p, yaw }); }, leave() { this.present = false; calls.leave++; } },
      setRaftLevel(n) { calls.raft.push(n); }, setCharacter(c) { calls.character.push(c?.id); },
    },
    world: {
      getMerchantDock: (day) => ({ position: new THREE.Vector3(24, 0, 38 - day), yaw: 1 }),
      setGateState(s, instant) { calls.gate.push(s); }, getGate: () => ({ position: new THREE.Vector3(0, 0, -49), radius: 4.5 }),
      getDepth: (x, z) => Math.min(1, Math.hypot(x, z) < 20 ? 0.9 : 0.3),
    },
    player: { position: new THREE.Vector3(0, 0, 0), near: null, isNear(id) { return this.near === id; } },
    combat: { addXp(n) { calls.xp.push(n); } },
    fishing: { spots: [], addSpots(n, o) { calls.spots.push(n); } },
    ui: { isBlocking: () => false, isShopOpen: () => false, floatText(p, t) { calls.float.push(t); } },
  };
  const origEmit = bus.emit.bind(bus);
  bus.emit = (evt, payload = {}) => { events.push({ evt, payload }); origEmit(evt, payload); };
  ctx.progression = create(ctx);
  ctx.progression.init();
  return { ctx, events, phase, calls, P: ctx.progression, count: (e) => events.filter((x) => x.evt === e).length, last: (e) => [...events].reverse().find((x) => x.evt === e)?.payload };
}
function startRun(env, opts = {}) {
  const { ctx, P } = env;
  const run = P.createRun(opts);
  ctx.state.run = run;
  ctx.state.meta.runs = (ctx.state.meta.runs || 0) + 1;
  ctx.bus.emit('zone:change', { zone: run.zone, prev: null });
  ctx.bus.emit('run:start', { continued: false });
  return run;
}
const tick = (env, dt = 0.016) => { env.ctx.time.frame++; env.P.update(dt); };
const catchFish = (env, speciesId, weight, quality = 'normal') => env.ctx.bus.emit('fishing:caught', { speciesId, weight, quality });
const pendingFish = (env) => env.P.getPendingCatch?.() || [];

// =====================================================================================
section('run null between runs: every API is safe');
{
  const env = makeCtx();
  const { P } = env;
  const s = P.getStats();
  eq(s.maxHp, 5, 'base maxHp with no run'); eq(s.creelSize, 4, 'base creel');
  eq(P.addToCreel({ uid: 'x' }), false, 'addToCreel null run');
  eq(P.removeFromCreel(), null, 'removeFromCreel null run');
  eq(P.fishAction('x', 'eat').ok, false, 'fishAction null run');
  eq(P.canShop(), false, 'canShop null run');
  eq(P.shop.getItems().length, 0, 'no items null run');
  eq(P.shop.buy('gear:rod_ashwood').ok, false, 'buy null run');
  eq(P.travel('sporewood').ok, false, 'travel null run');
  eq(P.getGateInfo().open, false, 'gate info null run');
  eq(P.getZones().length, data.ZONES.length, 'zones listed null run');
  eq(P.getBounties().length, 0, 'bounties null run');
  eq(P.consumeBait(), null, 'consumeBait null run');
  eq(P.getEquippedBait(), null, 'equipped null run');
  eq(P.equipBait('mireworm').ok, false, 'equip null run');
  ok(Array.isArray(P.getJournal()) && P.getJournal().length === data.SPECIES.length, 'journal null run');
  eq(P.getWaystones(), ['mossmere'], 'waystones default');
  ok(P.getCharacters().find((c) => c.id === 'wick').unlocked && !P.getCharacters().find((c) => c.id === 'taper').unlocked, 'characters lock state');
  ok(P.getCharacters().find((c) => c.id === 'taper').reason.includes('Steady Hands'), 'locked Wick names its trial');
  eq(P.getChallenges().length, 30, 'challenges listed');
  ok(P.getLockReason('boon:tolling_bell').startsWith('Unlocked by: First Dawn'), 'boon lock reason');
  ok(P.getLockReason('bait:shimmerfly').includes('Heavyweight'), 'bait lock reason');
  ok(P.getLockReason('relic:steady_hook').includes('Clockwork Wrist'), 'relic reveal reason');
  eq(P.getLockReason('boon:drifting_motes'), '', 'unlocked → empty reason');
  eq(P.summarizeRun('gloom').memories, 0, 'summarize null run');
  env.ctx.bus.emit('fishing:caught', { speciesId: 'dusk_minnow', weight: 0.1 });
  env.ctx.bus.emit('enemy:slain', { enemy: { elite: true } });
  env.ctx.bus.emit('phase:change', { phase: 'dawn' });
  P.update(0.1);
  eq(env.ctx.errors.length, 0, 'no errors with null run');
}

// =====================================================================================
section('createRun: The Wick, defaults');
{
  const env = makeCtx();
  const { P, ctx } = env;
  const run = startRun(env, {});
  eq(run.character, 'wick', 'default Wick'); eq(run.zone, 'mossmere', 'start zone');
  eq(run.shells, data.BALANCE.economy.startShells, 'start shells'); eq(run.bait, { mireworm: 4 }, 'kit bait');
  eq(run.equippedBait, 'mireworm', 'worms equipped'); eq(run.boons, { drifting_motes: 1 }, 'start boon in run.boons');
  eq(run.xpNext, data.xpForLevel(1), 'xpNext'); eq([run.hp, run.oil, run.satiety], [5, 100, 100], 'full gauges');
  eq(run.zonesUnlocked, ['mossmere'], 'zonesUnlocked'); eq(run.flags.zoneEnteredDay, 1, 'zoneEnteredDay');
  ok(env.calls.gate.includes('sealed'), 'gate sealed on run start'); ok(env.calls.character.includes('wick'), 'actors.setCharacter');
  eq(String(P.getEquippedBait()), 'mireworm', 'getEquippedBait stringifies to id');
  eq(P.getEquippedBait().count, 4, 'equipped bait count');
  ok(data.BAIT_BY_ID[P.getEquippedBait()] === data.BAIT_BY_ID.mireworm, 'equipped bait works as a key');
  // a locked Wick falls back to The Wick
  eq(P.createRun({ character: 'taper' }).character, 'wick', 'locked Taper falls back');
  eq(P.createRun({ character: 'nobody' }).character, 'wick', 'unknown character falls back');
  eq(P.createRun({ startZone: 'glasswater' }).zone, 'mossmere', 'no waystone → Mossmere');
}

// =====================================================================================
section('createRun: characters, relic start bonuses, Waystones');
{
  const env = makeCtx();
  const { P, ctx } = env;
  const m = ctx.state.meta;
  P.getChallenges(); // warm
  ctx.debug.completeChallenge('steady_hands');
  ok(P.isUnlocked('character:taper'), 'Taper unlocked by Steady Hands');
  eq(m.unlocks['character:taper'], true, 'meta.unlocks key set');
  const t = P.createRun({ character: 'taper' });
  eq(t.character, 'taper', 'Taper run'); eq(t.bait, { mireworm: 8, lumen_moss: 2 }, 'Taper kit');
  eq(t.boons, { prodigal_hook: 1 }, 'Taper start boon'); eq(t.oil, 90, 'Taper maxOil −10 applied to start oil');
  near(P.getStats(t).castMax, 20, 'Taper castMax'); near(P.getStats(t).auraDps, 1.6, 'Taper auraDps');
  m.relics.old_debt = 2; m.relics.drifters_bundle = 2; m.relics.oilskin_flask = 1;
  const r2 = P.createRun({});
  eq(r2.shells, 20 + 60, 'Old Debt II adds 60 Shells');
  eq(r2.bait, { mireworm: 12, lumen_moss: 3, heartmoss: 1 }, "Drifter's Bundle II kit (+ legend bait)");
  eq(r2.oil, 115, 'Oilskin raises start oil');
  // waystones
  m.deepestZone = 1;
  eq(P.getWaystones(), ['mossmere'], 'no waystone relic yet');
  m.relics.waystone_sporewood = 1;
  eq(P.getWaystones(), ['mossmere', 'sporewood'], 'Waystone: Sporewood');
  const w = P.createRun({ startZone: 'sporewood' });
  eq(w.zone, 'sporewood', 'Waystone start zone'); eq(w.zonesUnlocked, ['mossmere', 'sporewood'], 'lakes above pre-unlocked');
  eq(w.shells, 20 + 60 + data.BALANCE.economy.waystonePurse.sporewood, 'Descent Purse');
  eq(w.flags.bankedLevels, data.BALANCE.economy.waystoneLevels.sporewood, 'banked levels for the Kindling Draft');
  eq(w.bait.glowcap_bulb, 1, "Drifter's Bundle II gives the start lake's legend bait");
  m.relics.waystone_glasswater = 1;
  eq(P.getWaystones(), ['mossmere', 'sporewood'], 'Waystone needs deepestZone too');
}

// =====================================================================================
section('getStats: stacking, clamps, cache invalidation');
{
  const env = makeCtx();
  const { P, ctx } = env;
  const run = startRun(env, {});
  const s0 = P.getStats();
  eq(s0, P.getStats(), 'same object within a frame');
  run.upgrades.rod_ashwood = 2; P.invalidateStats();
  near(P.getStats().castMax, 22, 'upgrade ×2');
  run.boons.brighter_wick = 3; ctx.bus.emit('boon:chosen', { boonId: 'brighter_wick', level: 3 });
  near(P.getStats().lightRadius, 8 + 2.1, 'stat boon ×3');
  run.upgrades.raft_hull = 3; run.boons.hardened_wax = 4; ctx.state.meta.relics.barnacle_cloak = 3; P.invalidateStats();
  near(P.getStats().armor, 0.6, 'armor clamped to 0.6');
  run.flags.heartwax = 2; P.invalidateStats();
  eq(P.getStats().maxHp, 7, 'Heartwax raises maxHp');
  ctx.state.meta.unlocks['perk:mossmere'] = true; P.invalidateStats();
  near(P.getStats().hookWindow, 1.08, 'Journal perk Moss-Reader');
  ctx.state.meta.relics.mended_creel = 2; run.upgrades.creel_wicker = 4; P.invalidateStats();
  eq(P.getStats().creelSize, 10, 'creel clamp 10');
  const other = P.createRun({});
  ok(P.getStats(other) !== P.getStats(), 'other run gets its own object');
}

// =====================================================================================
section('makeFish: value / food / oil per DESIGN §9.1');
{
  const env = makeCtx();
  const { P } = env;
  const run = startRun(env, {});
  const sp = data.SPECIES_BY_ID.reedjaw_pike;
  const mid = (sp.weight[0] + sp.weight[1]) / 2;
  const f = P.makeFish('reedjaw_pike', mid, 'normal');
  eq([f.value, f.food, f.oil], [sp.value, sp.food, sp.oil], 'mean weight normal = table values');
  const big = P.makeFish('reedjaw_pike', sp.weight[1], 'perfect');
  eq(big.value, Math.round(sp.value * 1.25 * 2.5), 'max weight shimmering value');
  eq(big.oil, Math.round(sp.oil * 1.25 * 1.25), 'max weight shimmering oil');
  run.flags.streak = 7;
  eq(P.makeFish('reedjaw_pike', mid, 'normal').value, Math.round(sp.value * 1.5), 'streak capped at 5 → ×1.5');
  run.flags.streak = 0;
  ok(P.makeFish('nope', 1).value > 0, 'unknown species tolerated');
  ok(typeof f.uid === 'string' && f.caughtDay === 1 && f.quality === 'normal', 'Fish shape');
}

// =====================================================================================
section('creel: size, theft, catch actions');
{
  const env = makeCtx();
  const { P, ctx, calls } = env;
  const run = startRun(env, {});
  const fish = () => P.makeFish('mossback_perch', 0.8, 'normal');
  for (let i = 0; i < 4; i++) ok(P.addToCreel(fish()), `add ${i}`);
  eq(P.addToCreel(fish()), false, 'creel full at 4');
  const leg = P.makeFish('belled_matriarch', 20);
  run.creel = [leg];
  eq(P.removeFromCreel(), null, 'legendaries are theft-proof');
  const a = fish(); run.creel.push(a);
  eq(P.removeFromCreel()?.uid, a.uid, 'random theft takes the non-legendary');
  eq(P.removeFromCreel(leg.uid)?.uid, leg.uid, 'by uid works for legendaries');
  // catch → pending → actions
  catchFish(env, 'mossback_perch', 0.85);
  const landed = env.last('fish:landed');
  ok(landed && landed.isNew && landed.species.id === 'mossback_perch', 'fish:landed isNew');
  const p = pendingFish(env)[0];
  eq(p?.uid, landed.fish.uid, 'landed fish is pending');
  const stats = P.getStats();
  let res = P.fishAction(p, 'eat');
  ok(res.ok && res.gained.satiety === Math.round(p.food * stats.foodMult), 'eat gives food × foodMult');
  eq(calls.addSatiety.at(-1), res.gained.satiety, 'survival.addSatiety called');
  eq(pendingFish(env).length, 0, 'eaten fish no longer pending');
  eq(env.last('fish:action').action, 'eat', 'fish:action eat');
  // render with brazier
  run.upgrades.raft_brazier = 1; P.invalidateStats();
  const rf = fish(); P.addToCreel(rf);
  res = P.fishAction(rf.uid, 'render');
  eq(res.gained.oil, Math.round(rf.oil * 1.2), 'render × oilYieldMult');
  ok(!run.creel.some((x) => x.uid === rf.uid), 'rendered fish left the creel');
  eq(P.fishAction(rf.uid, 'render').ok, false, 'gone fish cannot be acted on');
  eq(P.fishAction(rf, 'eat').ok, false, 'gone fish object cannot be eaten twice');
  const st = fish(); P.addToCreel(st); const stolen = P.removeFromCreel(st.uid);
  eq(P.fishAction(stolen, 'render').ok, false, 'stolen fish cannot be rendered from a stale view');
  ok(P.addToCreel(stolen) && P.fishAction(stolen.uid, 'render').ok, 'recovered fish usable again');
  // keep when full
  run.creel = [fish(), fish(), fish(), fish()];
  catchFish(env, 'mossback_perch', 0.9);
  const p2 = pendingFish(env)[0];
  res = P.fishAction(p2, 'keep');
  ok(!res.ok && res.full, 'keep when full fails with full flag');
  P.fishAction(run.creel[0].uid, 'release');
  res = P.fishAction(p2, 'keep');
  ok(res.ok && run.creel.some((x) => x.uid === p2.uid), 'keep after making room');
  // release → mercy, capped, reset at day start
  for (let i = 0; i < 7; i++) { const x = fish(); P.addToCreel(x) || run.creel.shift(); P.addToCreel(x); P.fishAction(x.uid, 'release'); }
  near(run.flags.mercy, 0.1, 'mercy capped at +0.10');
  near(P.getStats().rarityBonus, 0.1, 'mercy in rarityBonus');
  ctx.bus.emit('day:start', { day: 2 });
  near(P.getStats().rarityBonus, 0, 'mercy resets on day:start');
  eq(P.fishAction(run.creel[0].uid, 'dance').ok, false, 'unknown action rejected');
  // sell needs Murk
  res = P.fishAction(run.creel[0].uid, 'sell');
  ok(!res.ok, 'cannot sell without Murk');
  // auto-keep fallback when no catch card answers
  run.creel = [];
  catchFish(env, 'gutter_crayfish', 0.3);
  for (let i = 0; i < 400; i++) tick(env, 0.02);
  eq(run.creel.length, 1, 'unanswered catch auto-kept after 6 s of game time');
}

// =====================================================================================
section('journal: first catches, records, half lake, perk, mastery, XP');
{
  const env = makeCtx();
  const { P, ctx, calls } = env;
  const run = startRun(env, {});
  const m = ctx.state.meta;
  const sh0 = run.shells;
  catchFish(env, 'dusk_minnow', 0.1);
  const exp = Math.round((data.BALANCE.economy.newSpeciesShells ?? 1.5) * data.SPECIES_BY_ID.dusk_minnow.value);
  eq(run.shells, sh0 + exp, 'first-catch Shells');
  eq(env.count('journal:new'), 1, 'journal:new');
  eq(m.journal.dusk_minnow.caught, 1, 'journal entry'); eq(m.journal.dusk_minnow.firstRun, 1, 'firstRun');
  ok(m.challenges.first_light, 'First Light completes'); eq(m.memories, 5, 'First Light +5 Memories');
  eq(calls.xp.at(-1), data.fishXpFor('common', 0), 'fish cinders → combat.addXp');
  catchFish(env, 'dusk_minnow', 0.2);
  ok(env.last('fish:landed').isRecord && !env.last('fish:landed').isNew, 'heavier repeat = record');
  catchFish(env, 'dusk_minnow', 0.15);
  ok(!env.last('fish:landed').isRecord, 'lighter repeat = no record');
  eq(run.stats.newSpecies, 1, 'newSpecies counted once');
  const memBefore = m.memories;
  ['mossback_perch', 'gutter_crayfish'].forEach((id) => catchFish(env, id, 0.4));
  eq(m.memories, memBefore, 'no half-lake bonus at 3');
  catchFish(env, 'weeping_carp', 2);
  eq(m.memories, memBefore + 10, 'half the lake named: +10 Memories');
  ['candlefin_koi', 'reedjaw_pike', 'gloam_eel'].forEach((id) => catchFish(env, id, 3));
  ok(!m.unlocks['perk:mossmere'], 'no perk at 7/8');
  catchFish(env, 'belled_matriarch', 20);
  ok(m.unlocks['perk:mossmere'], 'whole lake → Moss-Reader perk');
  near(P.getStats().hookWindow, 1.08, 'perk applied to stats');
  eq(Object.keys(m.journal).length, 8, '8 species named');
  // naturalist completes at 8 (evaluated on the 8th catch)
  ok(m.challenges.naturalist, 'Naturalist at 8 names');
  ok(P.isUnlocked('boon:lucky_knot'), 'Lucky Knot unlocked');
  const memB = m.memories;
  for (let i = 0; i < 6; i++) catchFish(env, 'dusk_minnow', 0.1);
  eq(m.journal.dusk_minnow.caught, 9, '9 minnows');
  catchFish(env, 'dusk_minnow', 0.1);
  eq(m.memories, memB + 2, 'mastery at 10: +2 Memories');
  const j = P.getJournal();
  ok(j.find((x) => x.id === 'dusk_minnow').mastered, 'journal mastered flag');
  ok(j.find((x) => x.id === 'sporebelly_puffer').hint.length > 0, 'undiscovered entry has a hint');
  eq(j.find((x) => x.id === 'gloam_eel').hint, '', 'discovered entry: no hint');
  eq(P.getJournalSummary()[0].named, 8, 'journal summary');
}

// =====================================================================================
section('gate, getGateInfo, travel, zone challenges');
{
  const env = makeCtx();
  const { P, ctx, phase, calls } = env;
  const run = startRun(env, {});
  let gi = P.getGateInfo();
  eq(gi.open, false, 'gate sealed'); eq(gi.nextZone.id, 'sporewood', 'next zone');
  eq(gi.requirements.length, 1, 'one requirement'); eq(gi.requirements[0].done, false, 'not done');
  eq(P.travel('sporewood').ok, false, 'travel blocked while sealed');
  catchFish(env, 'belled_matriarch', 18);
  ok(run.legendaries.belled_matriarch, 'run.legendaries');
  ok(run.gateOpen, 'gate opens on landing the legendary'); eq(env.count('gate:open'), 1, 'gate:open once');
  eq(calls.gate.at(-1), 'open', 'world.setGateState open');
  tick(env); tick(env);
  eq(env.count('gate:open'), 1, 'gate:open not repeated');
  gi = P.getGateInfo();
  ok(gi.requirements[0].done && gi.open, 'requirement done');
  const toll = data.ZONE_BY_ID.sporewood.unlock.shells;
  run.shells = toll - 1;
  ok(!P.travel('sporewood').ok && P.getGateInfo().reason.includes('short'), 'short of the toll');
  run.shells = toll + 5;
  phase.phase = 'gloomtide';
  ok(!P.travel('sporewood').ok, 'gate sleeps in the gloomtide');
  phase.phase = 'calm';
  eq(P.travel('glasswater').ok, false, 'cannot skip a lake');
  eq(P.travel('mossmere').ok, false, 'cannot travel to the current lake');
  const res = P.travel(gi.nextZone);
  ok(res.ok, 'travel ok (zone object accepted)');
  eq(run.zone, 'sporewood', 'run.zone'); eq(run.shells, 5, 'toll paid');
  ok(run.zonesUnlocked.includes('sporewood'), 'zonesUnlocked'); eq(run.gateOpen, false, 'gate reset');
  eq(env.count('zone:unlock'), 1, 'zone:unlock'); eq(env.last('zone:change').prev, 'mossmere', 'zone:change prev');
  eq(ctx.state.meta.deepestZone, 1, 'meta.deepestZone');
  ok(ctx.state.meta.challenges.down_the_sluice && P.isUnlocked('character:stub'), 'Down the Sluice → Stub');
  eq(env.last('unlock').key, 'character:stub', 'unlock event'); eq(env.last('unlock').label, 'Stub', 'unlock label');
  eq(P.travel('mossmere').ok, false, 'one-way');
  eq(P.getZones().find((z) => z.id === 'sporewood').current, true, 'getZones current');
  // dawn descent: the first night in the new lake is the next day
  ctx.debug.openGate();
  ok(run.gateOpen, 'debug openGate'); run.shells = 9999;
  phase.phase = 'dawn'; run.day = 4;
  ok(P.travel('glasswater').ok, 'travel at dawn');
  eq(run.flags.zoneEnteredDay, 5, 'dawn descent: zone night count starts tomorrow');
  ctx.debug.openGate(); phase.phase = 'calm';
  ok(P.travel('paleabyss').ok, 'into the final lake');
  eq(P.getGateInfo().nextZone, null, 'final lake has no gate');
  eq(calls.gate.at(-1), 'hidden', 'final lake gate hidden');
  ok(ctx.state.meta.challenges.into_the_vault && ctx.state.meta.challenges.pallid_arrival, 'reachZone trials');
  ok(P.getRelics().find((r) => r.id === 'second_wick').revealed, 'Second Wick revealed');
}

// =====================================================================================
section("Old Murk: schedule, pity, shop, raft cosmetics");
{
  const env = makeCtx();
  const { P, ctx, phase, calls } = env;
  const run = startRun(env, {});
  phase.time = 10; tick(env);
  eq(calls.arrive.length, 0, 'day 1: not before 20 s');
  phase.time = 21; tick(env);
  eq(calls.arrive.length, 1, 'day 1: moors at 20 s'); eq(env.count('merchant:arrive'), 1, 'merchant:arrive');
  ok(calls.arrive[0].p.z === 37 && calls.arrive[0].yaw === 1, 'moored at world.getMerchantDock(day)');
  ok(run.bounties.length >= 1 && run.bounties.length <= 2, 'bounties offered on mooring');
  eq(env.count('bounty:new'), run.bounties.length, 'bounty:new per bounty');
  ok(env.events.some((e) => e.evt === 'toast' && e.payload.text.startsWith('Old Murk')), 'Murk speaks');
  eq(P.canShop(), false, 'not near → cannot shop');
  ctx.player.near = 'merchant';
  eq(P.canShop(), true, 'near → canShop');
  const items = P.shop.getItems();
  const tabs = new Set(items.map((i) => i.category));
  ok(['gear', 'bait', 'supplies', 'ledger'].every((t) => tabs.has(t)), 'shop tabs present');
  ok(!items.some((i) => i.id === 'gear:lantern_lens'), 'zone-gated gear hidden in Mossmere');
  ok(items.some((i) => i.id === 'bait:heartmoss') && !items.some((i) => i.id === 'bait:glowcap_bulb'), 'only this lake\'s legend bait');
  ok(!items.some((i) => i.id === 'bait:shimmerfly'), 'locked bait hidden');
  // can't afford
  run.shells = 10;
  let r = P.shop.buy('gear:rod_ashwood');
  ok(!r.ok, 'cannot afford'); eq(run.shells, 10, 'no charge on failure');
  run.shells = 1000;
  r = P.shop.buy('gear:rod_ashwood');
  ok(r.ok && run.upgrades.rod_ashwood === 1, 'bought level 1'); eq(run.shells, 960, 'charged 40');
  near(P.getStats().castMax, 19, 'stats updated immediately');
  eq(env.last('shop:buy').itemId, 'gear:rod_ashwood', 'shop:buy');
  P.shop.buy('rod_ashwood'); P.shop.buy('gear:rod_ashwood');
  eq(run.upgrades.rod_ashwood, 3, 'bare id accepted, maxed at 3'); eq(run.shells, 1000 - 40 - 120 - 300, 'costs per level');
  r = P.shop.buy('gear:rod_ashwood');
  ok(!r.ok, 'maxed cannot buy'); eq(P.shop.getItems().find((i) => i.id === 'gear:rod_ashwood').reason, 'Fully upgraded', 'maxed reason');
  // raft cosmetics
  P.shop.buy('gear:raft_brazier'); P.shop.buy('gear:raft_oars');
  eq(calls.raft.at(-1), 1, 'two raft upgrades → raft level 1');
  // bait
  r = P.shop.buy('bait:lumen_moss'); ok(r.ok && run.bait.lumen_moss === 5, 'bait bought');
  r = P.shop.buy('bait:heartmoss'); ok(r.ok && run.bait.heartmoss === 1, 'legend bait bought');
  ok(!P.shop.buy('bait:heartmoss').ok, 'one legend bait at a time');
  // supplies & limits
  r = P.shop.buy('supply:wax_patch');
  ok(!r.ok, 'wax patch blocked at full Embers');
  run.hp = 3;
  ok(P.shop.buy('supply:wax_patch').ok && run.hp === 4, 'wax patch heals');
  run.hp = 2;
  ok(!P.shop.buy('supply:wax_patch').ok, 'wax patch: one per visit');
  run.oil = 50; ok(P.shop.buy('supply:oil_flask').ok && run.oil === 80, 'oil flask');
  ok(P.shop.buy('supply:flare_powder').ok && run.flags.flareCharges === 2, 'flare powder → run.flags.flareCharges');
  ok(P.shop.buy('supply:tide_chart').ok && calls.spots.at(-1) === 2, 'tide chart → fishing.addSpots');
  ok(!P.shop.buy('supply:oil_cask').ok, 'Sporewood supplies not stocked in the Mossmere');
  // selling
  const sm = P.makeFish('reedjaw_pike', 5, 'fine'); P.addToCreel(sm);
  const leg = P.makeFish('belled_matriarch', 20); P.addToCreel(leg);
  const sh = run.shells;
  r = P.shop.buy(`sell:${sm.uid}`);
  ok(r.ok && run.shells === sh + Math.round(sm.value * P.getStats().sellMult), 'sell via shop');
  ok(P.shop.getItems().find((i) => i.id === `sell:${leg.uid}`).desc.includes('Trophy'), 'legendary shows Trophy or Toll');
  P.addToCreel(P.makeFish('dusk_minnow', 0.1)); P.addToCreel(P.makeFish('dusk_minnow', 0.1));
  r = P.shop.buy('sell:all');
  ok(r.ok && run.creel.length === 1 && run.creel[0].uid === leg.uid, 'sell all keeps the legendary');
  // warn & leave
  phase.time = 110; tick(env);
  ok(env.events.some((e) => e.evt === 'toast' && /Murk casts off|Last call/.test(e.payload.text)), 'last-call warning');
  phase.phase = 'dusk'; phase.time = 0; ctx.bus.emit('phase:change', { phase: 'dusk', prev: 'calm', day: 1 });
  eq(env.count('merchant:leave'), 1, 'merchant:leave at dusk'); eq(P.canShop(), false, 'shop closed');
  ok(!P.shop.buy('supply:oil_flask').ok, 'cannot buy after he leaves');
  // next day: arrives at 0 s, new dock
  phase.phase = 'calm'; phase.time = 0; run.day = 2; ctx.bus.emit('day:start', { day: 2 }); tick(env);
  eq(calls.arrive.length, 2, 'day 2 moors at calm start'); eq(calls.arrive[1].p.z, 36, 'new dock');
  // pity
  const env2 = makeCtx();
  const run2 = startRun(env2, {});
  run2.shells = 5; run2.oil = 10; env2.phase.time = 25; tick(env2);
  eq(env2.calls.addOil.at(-1), 30, "Murk's Pity oil"); eq(env2.calls.addSatiety.at(-1), 30, "Murk's Pity satiety");
  ok(run2.flags.pityUsed, 'pity used once per run');
}

// =====================================================================================
section('bait: consume per cast, run out, legend bait spent on hook');
{
  const env = makeCtx();
  const { P, ctx } = env;
  const run = startRun(env, {});
  run.bait = { mireworm: 2, lumen_moss: 1, heartmoss: 1 }; run.equippedBait = 'mireworm';
  eq(P.consumeBait(), 'mireworm', 'consume 1'); eq(run.bait.mireworm, 1, 'count');
  eq(P.consumeBait(), 'mireworm', 'consume last'); eq(run.bait.mireworm, undefined, 'removed');
  eq(run.equippedBait, 'lumen_moss', 'auto-equips the next bait');
  eq(P.consumeBait(), 'lumen_moss', 'moss'); eq(run.equippedBait, null, 'bare hook after');
  eq(P.consumeBait(), null, 'bare hook consumes nothing');
  ok(!P.equipBait('mireworm').ok, 'cannot equip what you lack');
  run.bait.mireworm = 3; P.equipBait('mireworm');
  ok(P.equipBait('heartmoss').ok, 'equip legend bait');
  eq(P.consumeBait(), 'heartmoss', 'legend cast'); eq(run.bait.heartmoss, 1, 'not spent on cast');
  ctx.bus.emit('fishing:hook', { speciesId: 'belled_matriarch', perfect: false });
  eq(run.bait.heartmoss, undefined, 'spent on hook'); eq(run.equippedBait, 'mireworm', 'reverts to the previous bait');
  eq(P.cycleBait(), null, 'cycle → bare hook'); eq(P.cycleBait(), 'mireworm', 'cycle → worms');
}

// =====================================================================================
section('bounties: generation, tracking, rewards, expiry');
{
  const env = makeCtx();
  const { P, ctx, phase } = env;
  const run = startRun(env, {});
  for (let i = 0; i < 40; i++) { run.bounties = []; ctx.debug.offerBounties(); }
  ok(run.bounties.length === 2, '2 offered');
  ok(run.bounties.every((b) => b.reward.shells > 0 && b.expiresDay === 3 || b.type === 'boss'), 'reward and due day');
  ok(run.bounties.every((b) => !/\{\w+\}/.test(b.text)), 'text placeholders filled');
  // deterministic: craft a species bounty
  const t = data.BOUNTY_BY_ID.catch_species;
  run.bounties = [{ id: 'b1', templateId: t.id, type: t.type, text: 'Bring me 2 Dusk Minnow.', zone: 'mossmere', target: 'dusk_minnow', count: 2, progress: 0, reward: { shells: 30 }, expiresDay: 3 }];
  const s0 = run.shells;
  catchFish(env, 'dusk_minnow', 0.1);
  eq(run.bounties[0].progress, 1, 'progress 1/2');
  catchFish(env, 'dusk_minnow', 0.1);
  eq(run.bounties.length, 0, 'completed bounty removed'); eq(run.flags.bountiesDone, 1, 'bountiesDone');
  eq(env.count('bounty:complete'), 1, 'bounty:complete');
  ok(run.shells >= s0 + 30, 'reward paid');
  // night bounties
  run.bounties = [
    { id: 'u', type: 'unscathed', count: 1, progress: 0, reward: { shells: 50 }, expiresDay: 9, text: 'u' },
    { id: 'n', type: 'noFlare', count: 1, progress: 0, reward: { shells: 40 }, expiresDay: 9, text: 'n' },
    { id: 'd', type: 'slayNight', count: 3, progress: 0, reward: { shells: 30 }, expiresDay: 9, text: 'd' },
  ];
  phase.phase = 'gloomtide'; ctx.bus.emit('phase:change', { phase: 'gloomtide' });
  ctx.bus.emit('player:damage', { amount: 1, source: 'gloom' });
  ctx.bus.emit('flare', {});
  for (let i = 0; i < 3; i++) ctx.bus.emit('enemy:slain', { enemy: { id: i, enemyId: 'gloomling' } });
  eq(run.bounties.map((b) => b.id), ['u', 'n'], 'slayNight completes mid-night');
  phase.phase = 'dawn'; ctx.bus.emit('phase:change', { phase: 'dawn' });
  eq(run.bounties.map((b) => b.id), ['u', 'n'], 'hurt & flared: unscathed/noFlare stay open');
  phase.phase = 'gloomtide'; ctx.bus.emit('phase:change', { phase: 'gloomtide' });
  phase.phase = 'dawn'; ctx.bus.emit('phase:change', { phase: 'dawn' });
  eq(run.bounties.length, 0, 'clean night honours both');
  // expiry
  run.bounties = [{ id: 'old', type: 'quality', target: 'fine', count: 1, progress: 0, reward: { shells: 1 }, expiresDay: 3, text: 'q' }];
  run.day = 4; ctx.bus.emit('day:start', { day: 4 });
  eq(run.bounties.length, 0, 'expired at the end of day + 2');
  // memories for bounties at the end
  run.flags.bountyMemories = 6;
  const sum = P.summarizeRun('victory-preview');
  const perBounty = data.BALANCE.bounty?.memoriesEach ?? 2;   // tuned by the balance pass (was 4)
  ok(sum.breakdown.find((x) => x.label === data.TEXT.memoryLabels.bounties).value === perBounty * run.flags.bountiesDone + 6, 'bounty memories (+ legend hunt extra)');
}

// =====================================================================================
section('challenges: every type from bus events');
{
  const env = makeCtx();
  const { P, ctx, phase } = env;
  const m = ctx.state.meta;
  const run = startRun(env, {});
  const dawnCycle = (hurt = false) => {
    phase.phase = 'gloomtide'; ctx.bus.emit('phase:change', { phase: 'gloomtide' });
    if (hurt) ctx.bus.emit('player:damage', { amount: 1, source: 'gloom' });
    phase.phase = 'dawn'; ctx.bus.emit('phase:change', { phase: 'dawn' });
    run.day++; phase.phase = 'calm'; ctx.bus.emit('phase:change', { phase: 'calm' });
  };
  dawnCycle(true);
  ok(m.challenges.first_dawn && P.isUnlocked('boon:tolling_bell'), 'First Dawn → Tolling Bell');
  eq(env.last('challenge:complete').challenge.id, 'first_dawn', 'challenge:complete payload');
  ok(!m.challenges.untouched, 'night 1 never counts for Untouched');
  dawnCycle(true);
  ok(!m.challenges.untouched, 'hurt night → no Untouched');
  dawnCycle(false);
  ok(m.challenges.three_nights && m.challenges.untouched, 'Three Long Nights + Untouched (day ≥ 2, unhurt)');
  ok(P.getRelics().find((r) => r.id === 'barnacle_cloak').revealed, 'Barnacle Cloak revealed');
  dawnCycle(); dawnCycle();
  ok(m.challenges.long_vigil && P.isUnlocked('character:tallow'), 'Long Vigil → Tallow');
  // level
  run.level = 8; ctx.bus.emit('levelup', { level: 8, options: [] });
  ok(m.challenges.ember_hoard && P.isUnlocked('boon:gutsfire'), 'Kindling at level 8');
  eq(m.bestLevel, 8, 'bestLevel live');
  run.level = 15; ctx.bus.emit('levelup', { level: 15 });
  ok(m.challenges.kindled, 'Kindled at 15');
  // slay
  phase.phase = 'gloomtide'; ctx.bus.emit('phase:change', { phase: 'gloomtide' });
  for (let i = 0; i < 499; i++) ctx.bus.emit('enemy:slain', { enemy: { enemyId: 'gloomling' } });
  ok(!m.challenges.gloombreaker, '499 not enough');
  ok(m.challenges.bonfire_night, 'Bonfire Night at 200 in one night');
  ctx.bus.emit('enemy:slain', { enemy: { enemyId: 'gloomling' } });
  ok(m.challenges.gloombreaker && m.totalSlain === 500, 'Gloombreaker at 500');
  // elite pays shells and Unclenched
  const sh = run.shells;
  ctx.bus.emit('enemy:slain', { enemy: { enemyId: 'drowned_hand', elite: true, position: new THREE.Vector3(1, 0, 1) } });
  eq(run.shells, sh, 'elite Shells wait a moment for combat to pay them');
  tick(env); tick(env);
  eq(run.shells, sh + 6, 'fallback: progression pays elite Shells (6 × valueMult)');
  ok(m.challenges.break_a_hand && P.isUnlocked('boon:smouldering_floats'), 'Unclenched');
  ok(env.calls.float.includes('+6 Shells'), 'elite shells float text');
  // combat pays elite Shells itself (after the event): paid exactly once
  let sh2 = run.shells;
  ctx.bus.emit('enemy:slain', { enemy: { enemyId: 'drowned_hand', elite: true } }); P.addShells(6, 'combat');
  tick(env); tick(env); tick(env);
  eq(run.shells, sh2 + 6, 'combat-paid elite Shells not doubled');
  // combat counts meta.totalSlain itself (before emitting): counted once
  const ts = ctx.state.meta.totalSlain;
  ctx.state.meta.totalSlain++; ctx.bus.emit('enemy:slain', { enemy: { enemyId: 'gloomling' } });
  eq(ctx.state.meta.totalSlain, ts + 1, 'totalSlain not double-counted');
  ctx.bus.emit('enemy:slain', { enemy: { enemyId: 'gloomling' } });
  eq(ctx.state.meta.totalSlain, ts + 2, 'totalSlain counted when nobody else does');
  // boss: shells, heartwax once, Unwarded, Four Silences
  run.hp = 3;
  sh2 = run.shells;
  ctx.bus.emit('boss:slain', { enemy: { enemyId: 'the_wickeater', boss: true } });
  tick(env); tick(env);
  eq(run.shells, sh2 + 40, 'fallback Warden Shells');
  eq(run.flags.heartwax, 1, 'Heartwax'); eq(P.getStats().maxHp, 6, 'Heartwax +1 max Ember'); eq(run.hp, 4, 'Heartwax mends 1');
  ok(m.challenges.unwarded && P.isUnlocked('character:ashwick'), 'Unwarded → Ashwick');
  sh2 = run.shells;
  P.addShells(40, 'combat'); ctx.bus.emit('boss:slain', { enemy: { enemyId: 'the_wickeater', boss: true } });
  tick(env); tick(env);
  eq(run.shells, sh2 + 40, 'combat-paid Warden Shells (paid before the event) not doubled');
  eq(run.flags.heartwax, 1, 'second kill of the same Warden: no Heartwax');
  // combat claims Heartwax through grantHeartwax(): progression must not add another
  ok(P.grantHeartwax(), 'grantHeartwax handled'); eq(run.flags.heartwax, 1, 'zone Warden (Wickeater) already gave its Heartwax');
  const hw = run.flags.heartwax, healN = env.calls.heal.length;
  P.grantHeartwax('the_veiled_gardener'); ctx.bus.emit('boss:slain', { enemy: { enemyId: 'the_veiled_gardener', boss: true } });
  eq(run.flags.heartwax, hw + 1, 'claimed Heartwax not doubled by boss:slain'); eq(env.calls.heal.length, healN, 'claimer heals, not progression');
  ctx.bus.emit('boss:slain', { enemy: { enemyId: 'the_shard_abbot', boss: true } });
  ok(!m.challenges.four_silences, '3 of 4 Wardens');
  ctx.bus.emit('boss:slain', { enemy: { enemyId: 'the_lightless_ferryman', boss: true } });
  ok(m.challenges.four_silences && P.isUnlocked('boon:moonless_calm'), 'Four Silences');
  // night catch
  catchFish(env, 'gloam_eel', 2); catchFish(env, 'gloam_eel', 2); catchFish(env, 'gloam_eel', 2);
  ok(m.challenges.night_angler, 'Night Angler (3 in one Gloomtide)');
  // perfect hooks (10 in a run) + streak record
  for (let i = 0; i < 10; i++) ctx.bus.emit('fishing:hook', { speciesId: 'dusk_minnow', perfect: true });
  ok(m.challenges.perfect_10_run, 'Clockwork Wrist'); eq(run.flags.bestStreak, 10, 'streak');
  ctx.bus.emit('fishing:miss', { reason: 'late' });
  eq(run.flags.streak, 0, 'miss breaks the streak');
  // quality / weight
  catchFish(env, 'reedjaw_pike', 8.5, 'perfect');
  ok(m.challenges.shimmering && m.challenges.heavy_catch, 'Shimmering + Heavyweight');
  ok(P.isUnlocked('bait:shimmerfly'), 'Shimmerfly bait unlocked');
  // boon levels / kindle
  run.boons.circling_cinders = 5; ctx.bus.emit('boon:chosen', { boonId: 'circling_cinders', level: 5 });
  ok(m.challenges.full_flame, 'Full Flame at weapon L5');
  run.boons.circling_cinders = 6; ctx.bus.emit('boon:chosen', { boonId: 'circling_cinders', level: 6 });
  ok(m.challenges.kindle_one, 'Kindle a weapon');
  // shells this run
  ctx.debug.addShells(1000);
  ok(m.challenges.shells_1000_run, "Murk's Favourite");
  // catch totals
  m.totalFish = 98; catchFish(env, 'dusk_minnow', 0.1);
  ok(!m.challenges.catch_100, '99'); catchFish(env, 'dusk_minnow', 0.1);
  ok(m.challenges.catch_100 && m.challenges.steady_hands, 'Old Hand at 100');
  // reachZoneCharacters: 3 Wicks reach Glasswater
  ['wick', 'taper', 'stub'].forEach((c) => { run.character = c; ctx.bus.emit('zone:change', { zone: 'glasswater', prev: 'sporewood' }); });
  ok(m.challenges.many_flames, 'Many Flames');
  // victory (only in the final lake: the run must actually be in the Pallid Deep)
  run.zone = 'glasswater';
  catchFish(env, 'pale_leviathan', 200);
  eq(env.count('victory'), 0, 'no victory outside the final lake');
  run.zone = 'paleabyss';
  catchFish(env, 'pale_leviathan', 200);
  eq(env.count('victory'), 1, 'victory emitted'); ok(m.challenges.light_comes_up, 'The Light Comes Up');
  catchFish(env, 'pale_leviathan', 200);
  eq(env.count('victory'), 1, 'victory only once per run');
  // getChallenges shape
  const list = P.getChallenges();
  ok(list.every((c) => typeof c.progress === 'number' && c.target >= 1 && 'done' in c), 'getChallenges shape');
  const cc = list.find((c) => c.id === 'complete_chronicle');
  ok(!cc.done && cc.progress < 32, 'chronicle progress');
  // completeChallenge debug & idempotence
  const before = m.memories;
  ok(ctx.debug.completeChallenge('complete_chronicle'), 'debug complete'); eq(m.memories, before + 200, '+200 Memories');
  ok(!ctx.debug.completeChallenge('complete_chronicle'), 'idempotent');
  eq(ctx.errors.length, 0, 'no errors');
}

// =====================================================================================
section('relics: reveal, cost, buy, maxed');
{
  const env = makeCtx();
  const { P, ctx } = env;
  const m = ctx.state.meta;
  let r = P.buyRelic('oilskin_flask');
  ok(!r.ok, 'cannot afford');
  ctx.debug.addMemories(1000);
  eq(m.memories, 1000, 'debug memories (no run)');
  r = P.buyRelic('oilskin_flask');
  const oc = data.RELIC_BY_ID.oilskin_flask.costs;
  ok(r.ok && m.relics.oilskin_flask === 1 && m.memories === 1000 - oc[0], 'bought level I');
  eq(env.last('relic:buy'), { relicId: 'oilskin_flask', level: 1, relic: data.RELIC_BY_ID.oilskin_flask }, 'relic:buy');
  P.buyRelic('oilskin_flask'); P.buyRelic('oilskin_flask');
  eq(m.relics.oilskin_flask, 3, 'maxed at 3'); eq(m.memories, 1000 - oc[0] - oc[1] - oc[2], 'costs per level');
  ok(!P.buyRelic('oilskin_flask').ok, 'maxed');
  eq(P.getStats().maxOil, 145, 'relic stats with no run');
  ok(!P.buyRelic('first_wick_stub').ok, 'hidden until bestDay ≥ 3');
  ok(P.getRelics().find((x) => x.id === 'first_wick_stub').reason.includes('Day 3'), 'reveal condition text');
  m.bestDay = 3;
  ok(P.buyRelic('first_wick_stub').ok, 'revealed → buyable');
  ok(!P.buyRelic('steady_hook').ok, 'challenge-revealed relic hidden');
  ctx.debug.completeChallenge('perfect_10_run');
  ok(P.buyRelic('steady_hook').ok, 'revealed by its trial');
  ok(!P.buyRelic('nope').ok, 'unknown relic');
  const rel = P.getRelics();
  ok(rel.every((x) => 'canBuy' in x && 'nextCost' in x && 'revealed' in x), 'getRelics shape');
}

// =====================================================================================
section('summarizeRun: Memories math, banking once, records, preview');
{
  const env = makeCtx();
  const { P, ctx, phase } = env;
  const m = ctx.state.meta;
  m.relics.remembrance = 1;
  const run = startRun(env, {});
  catchFish(env, 'dusk_minnow', 0.1); catchFish(env, 'mossback_perch', 1);
  phase.phase = 'gloomtide'; ctx.bus.emit('phase:change', { phase: 'gloomtide' });
  for (let i = 0; i < 60; i++) ctx.bus.emit('enemy:slain', { enemy: { enemyId: 'gloomling' } });
  phase.phase = 'dawn'; ctx.bus.emit('phase:change', { phase: 'dawn' });
  run.day = 2; run.level = 7;
  catchFish(env, 'belled_matriarch', 20);
  P.fishAction(pendingFish(env).find((f) => f.speciesId === 'belled_matriarch'), 'keep');
  const memBefore = m.memories;
  const preview = P.summarizeRun('victory-preview');
  eq(m.memories, memBefore, 'preview banks nothing');
  const expected = data.memoriesFor({ day: 2, zoneIndex: 0, fishCaught: 3, newSpecies: 3, legendaries: ['belled_matriarch'], bountiesDone: 0,
    enemiesSlain: 60, nightsSurvived: 1, deepestEnduredIndex: 0, elitesSlain: 0, bossesSlain: 0, trophies: [0], memMult: 0.08, victory: false });
  eq(preview.memories, expected.total, 'memories = memoriesFor(summary)');
  ok(preview.breakdown.some((x) => x.label === data.TEXT.memoryLabels.trophies && x.value === data.BALANCE.economy.trophyMemories[0]), 'trophy line');
  ok(preview.breakdown.some((x) => x.label === data.TEXT.memoryLabels.remembrance), 'Remembrance line');
  const s = P.summarizeRun('gloom');
  eq(m.memories, memBefore + s.memories, 'banked once');
  eq(s.memoriesTotal, m.memories, 'memoriesTotal');
  const s2 = P.summarizeRun('gloom');
  eq(m.memories, memBefore + s.memories, 'second call does not bank again'); eq(s2, s, 'same summary');
  ok(['cause', 'day', 'zone', 'character', 'level', 'fishCaught', 'shellsEarned', 'newSpecies', 'enemiesSlain', 'legendaries', 'memories', 'breakdown', 'records', 'challengesCompleted'].every((k) => k in s), 'RunSummary fields');
  ok(s.challengesCompleted.some((c) => c.id === 'first_light'), 'challenges completed this run');
  ok(m.unlocks['trophy:belled_matriarch'], 'trophy mounted');
  eq(P.getTrophies(), ['belled_matriarch'], 'getTrophies');
  ok(s.epitaph && s.title === data.TEXT.deathTitle.gloom, 'epitaph & title');
  ok(Array.isArray(s.nearMiss) && s.nearMiss.length > 0, 'near-miss lines');
  ok(s.tip && s.topDamage === null || s.tip === '', 'no damage → no tip');
  // run 2: records broken
  ctx.state.meta.bestDay = 2;
  const run2 = startRun(env, {});
  catchFish(env, 'dusk_minnow', 0.24);
  run2.day = 4; run2.level = 9;
  const s3 = P.summarizeRun('darkness');
  ok(s3.records.some((x) => x.includes('Dusk Minnow')), 'biggest-catch record'); ok(s3.records.some((x) => x.includes('Day 4')), 'best day record');
  ok(s3.records.some((x) => x.includes('level 9')), 'level record');
  const run3 = startRun(env, {});
  for (let i = 0; i < 4; i++) ctx.bus.emit('player:damage', { amount: 1, source: 'gloomling' });
  ctx.bus.emit('player:damage', { amount: 2, source: 'drowned_hand' });
  ctx.bus.emit('player:damage', { amount: 0, source: 'drowned_hand' });
  const s4 = P.summarizeRun('gloom');
  ok(s4.tip.startsWith('Gloomlings reached you 4 times.'), `damage tip (${s4.tip})`);
}

// =====================================================================================
section('Second Wick, continue-from-save, misc');
{
  const env = makeCtx();
  const { P, ctx, phase } = env;
  const run = startRun(env, {});
  eq(P.tryRevive(), false, 'no relic → no revive');
  ctx.state.meta.relics.second_wick = 1;
  ok(P.tryRevive(), 'revive once'); eq(P.tryRevive(), false, 'only once per run');
  // continue: run object from JSON
  run.gateOpen = true; run.flags.murkDay = 1;
  const saved = JSON.parse(JSON.stringify(run));
  ctx.state.run = null; ctx.bus.emit('flow:change', { flow: 'title' });
  ctx.state.run = saved;
  phase.time = 50;
  env.calls.gate.length = 0;
  ctx.bus.emit('zone:change', { zone: saved.zone, prev: null });
  ctx.bus.emit('run:start', { continued: true });
  eq(env.calls.gate.at(-1), 'open', 'continued run re-opens the gate visual');
  ok(P.isMerchantPresent(), 'Murk re-moors on continue mid-calm');
  const nb = env.count('bounty:new');
  tick(env);
  eq(env.count('bounty:new'), nb, 'no fresh bounties on re-moor');
  eq(P.getNightInZone(), 1, 'night in zone'); eq(P.isBossNight(), false, 'not a boss night');
  saved.day = 3; ok(P.isBossNight(), 'day 3 boss night');
  ok(P.fishYield(P.makeFish('dusk_minnow', 0.1)).oil > 0, 'fishYield');
  saved.creel = [P.makeFish('belled_matriarch', 20), P.makeFish('reedjaw_pike', 5), P.makeFish('dusk_minnow', 0.1)];
  eq(P.getBurnCandidate().speciesId, 'dusk_minnow', 'burn candidate = cheapest non-legendary');
  ok(P.burnFish().ok && saved.creel.length === 2, 'burnFish renders it');
  P.burnFish(); eq(P.burnFish().ok, false, 'legendary never burned');
  ok(P.getMerchantLine('poor').length > 0, 'merchant line');
  eq(ctx.errors.length, 0, 'no errors');
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) { console.log(failures.map((f) => ' - ' + f).join('\n')); process.exit(1); }
