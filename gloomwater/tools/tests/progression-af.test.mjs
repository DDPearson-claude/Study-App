// Unit tests for automatic fishing's progression items (DESIGN §25.14.2a Pg13, Pg14, S7; §25.14.2b FE-Pg1; CONTRACT §13.2,
// §13.7, §13.7a, §13.12) with a fake ctx, the v3 data at phase 1 (raft build) and, for parity, the flag-off data.
//   node tools/tests/progression-af.test.mjs   (or node tools/check.mjs)
import * as THREE from 'three';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as dataV1 from '../../src/data.js';                 // evaluated first: GW_V3 unset → the flag-off build
import { createBus, defaultMeta } from '../../src/core.js';
import { create, migrateSave as migrateSaveModule } from '../../src/progression.js';
import * as V3H from '../../src/progression-v3.js';
import { approxText, slotEmphasis } from '../../src/progression-af.js';

globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; globalThis.GW_WALK = false;
const data = await import('../../src/data.js?v3p1af');
delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE;

const here = dirname(fileURLToPath(import.meta.url));
let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
function near(a, b, msg, eps = 1e-9) { ok(Math.abs(a - b) <= eps, `${msg} (got ${a}, want ${b} ± ${eps})`); }
const section = (s) => console.log(`- ${s}`);
const clone = (o) => JSON.parse(JSON.stringify(o));

function makeCtx({ D = data, meta = defaultMeta() } = {}) {
  const bus = createBus();
  const events = [];
  const phase = { phase: 'calm', day: 1, time: 0, duration: 180 };
  const calls = { xp: [], save: 0 };
  const ctx = {
    THREE, bus, data: D,
    state: { meta, run: null },
    time: { dt: 0.016, gameDt: 0.016, t: 0, gameT: 0, timeScale: 1, frame: 1 },
    flow: 'playing', paused: false, debug: {}, errors: [], isMobile: false, input: {},
    game: { save() { calls.save++; } },
    survival: {
      getPhaseInfo: () => ({ ...phase, k: phase.time / phase.duration, isNight: phase.phase === 'gloomtide' }),
      addOil() {}, addSatiety() {}, heal() {},
    },
    actors: { merchant: { present: false, position: new THREE.Vector3(), arrive() { this.present = true; }, leave() { this.present = false; } }, setRaftLevel() {}, setCharacter() {} },
    world: { getMerchantDock: (day) => ({ position: new THREE.Vector3(24, 0, 38 - day), yaw: 1 }), setGateState() {}, getGate: () => null, getDepth: () => 0.5 },
    player: { position: new THREE.Vector3(0, 0, 0), isNear() { return true; } },
    combat: { addXp(n, info) { calls.xp.push({ n, info }); } },
    fishing: { state: 'idle', spots: [], signs: [], addSpots() {}, armChum() {} },
    ui: { isBlocking: () => false, isShopOpen: () => true, floatText() {} },
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
  ctx.state.meta.runs = (ctx.state.meta.runs || 0) + 1;
  ctx.bus.emit('zone:change', { zone: run.zone, prev: null });
  ctx.bus.emit('run:start', { continued: false });
  return run;
}
/** Murk moored (the shop is open) and a full purse. */
function murk(env, shells = 99999) {
  env.ctx.state.run.shells = shells;
  env.ctx.bus.emit('phase:change', { phase: 'calm' });
  env.phase.time = 30; env.P.update(0.016);
}
const known = (env, id, extra = {}) => { env.ctx.state.meta.journal[id] = { caught: 1, biggest: 1, ...extra }; };
const ONE_LURE_ONSALE = (P) => P.shop.getItems().filter((i) => i.kind === 'lure');

// =====================================================================================
section('the v3 build at phase 1 is what this suite tests; the flag-off build has no AF surface');
{
  eq([data.V3_ENABLED, data.V3_PHASE], [true, 1], 'data?v3p1af is the v3 phase-1 build');
  eq(dataV1.V3_ENABLED, false, 'plain data.js is the flag-off build');
  const env = makeCtx({ D: dataV1 });
  const run = startRun(env, {});
  const P = env.P;
  eq([P.getLoadout(), P.getCatchBuffs(), P.getOdds('dusk_minnow'), P.getGearLog(), P.getFirstEvening()], [null, null, null, null, null], 'flag off: the AF getters return null');
  eq([run.lures, run.equipped, 'hold' in P.getStats()], [undefined, undefined, false], 'flag off: no run.lures, no run.equipped, no stats.hold');
  eq(env.ctx.state.meta.firstEvening, undefined, 'flag off: no meta.firstEvening');
  const fish = P.makeFish('dusk_minnow', 0.3, 'normal');
  ok(fish.z === undefined && fish.value > 0, 'flag off: makeFish stays v1 (no normaliser, no z)');
  eq(env.ctx.errors, [], 'no errors');
}

// =====================================================================================
section('Pg13: getLoadout — upgradeHold, the item AT THE CAST, the per-run Glimmer Spoon, run-less T0');
{
  const env = makeCtx();
  const { P, ctx } = env;
  eq(P.getLoadout(), { rod: 0, line: 0, reel: 0, item: null, itemLevel: 1, perRun: true, runless: true }, 'run-less (the cove): T0, no item');
  const run = startRun(env, {});
  run.upgrades = { rod_ashwood: 2, line_gut: 1, reel_brass: 3, lure_glimmer: 2 };
  P.invalidateStats();
  const lo = P.getLoadout();
  eq(lo.hold, data.upgradeHold(run.upgrades), 'P1 run: hold = data.upgradeHold(run.upgrades)');
  eq([lo.rod, lo.line, lo.reel], [data.upgradeTiers(run.upgrades).rod, data.upgradeTiers(run.upgrades).line, data.upgradeTiers(run.upgrades).reel], 'tiers = upgradeTiers (words only)');
  eq(lo.upgrade, { id: 'lure_glimmer', level: 2 }, 'the per-run Glimmer Spoon rides as loadout.upgrade');
  eq(lo.perRun, true, 'P1–P2: perRun (legends use CATCH_V3.legend.fightRun)');
  eq(P.getStats().hold, data.upgradeHold(run.upgrades), 'getStats().hold carries the same Hold (CONTRACT §13.7 getStats)');
  // the item that counts is the one on the line AT THE CAST
  run.bait = { mireworm: 2 };
  P.equipBait('mireworm');
  eq(lo.item === undefined ? null : P.getLoadout().item, 'mireworm', 'the equipped bait is the item');
  ctx.fishing.state = 'casting';
  P.consumeBait();                                   // fishing spends the cast's bait at the cast
  ctx.bus.emit('fishing:cast', { power: 0.8 });
  run.lures = { bell_spinner: true };
  P.equipLure('bell_spinner');                       // a swap after the cast …
  ctx.fishing.state = 'bite';
  eq(P.getLoadout().item, 'mireworm', '… changes nothing until the next cast (the strike reads the cast item)');
  ctx.fishing.state = 'idle';
  eq(P.getLoadout().item, 'bell_spinner', 'with the line back the log reads the item on the line now');
  // the last worm: the snapshot is taken before the bag empties
  P.equipBait('mireworm');
  run.bait.mireworm = 1;
  ctx.time.frame += 5; ctx.fishing.state = 'casting';
  P.consumeBait();
  ctx.bus.emit('fishing:cast', {});
  ctx.fishing.state = 'reeling';
  eq([P.getLoadout().item, run.bait.mireworm ?? 0], ['mireworm', 0], 'the last worm is spent at the cast and still counts for that cast');
  ctx.fishing.state = 'idle';
  // the per-run Glimmer Spoon never stacks with the item: catchParts takes the larger
  const pred = data.SPECIES.find((s) => s.family === 'predator' && s.rarity !== 'legendary').id;
  const loA = { ...P.getLoadout(), item: 'glimmer_spoon', upgrade: { id: 'lure_glimmer', level: 3 } };
  const loB = { ...P.getLoadout(), item: 'glimmer_spoon' }; delete loB.upgrade;
  eq(data.catchChance(pred, 'prize', loA), data.catchChance(pred, 'prize', loB), `never stacked: Glimmer Spoon lure + upgrade 3 = the lure alone on a predator (${pred})`);
  eq(ctx.errors, [], 'no errors');
}

// =====================================================================================
section('Pg13: getCatchBuffs (relics ≤ 3, run ≤ 4, ≤ 6) and S7: Well-fed is exactly +2 Hold');
{
  const env = makeCtx();
  const { P, ctx } = env;
  const run = startRun(env, {});
  const sp = 'dusk_minnow';
  const H = () => data.catchBuffHold(sp, 'keeper', P.getCatchBuffs());
  run.satiety = 0; ctx.time.frame++;
  eq(P.getCatchBuffs(), { wellFed: false, boons: {}, relics: {}, character: 'wick', firstHookTonight: false }, 'a fresh run: no buffs');
  eq(H(), 0, 'no buff Hold');
  run.satiety = 100; ctx.time.frame++;
  eq(P.getCatchBuffs().wellFed, true, 'Well-fed at a full belly');
  eq(H(), 2, 'S7: Well-fed adds exactly 2 to the run buffs');
  run.boons = { steady_reel: 5 };
  eq(H(), 4, 'Well-fed + Steady Reel 5 → the run buffs cap at 4');
  ctx.state.meta.relics = { seven_knots: 1, steady_hook: 1 };
  eq(P.getCatchBuffs().relics, { seven_knots: 1, steady_hook: 1 }, 'owned relics in the buff context');
  eq(H(), 6, 'S7: with Well-fed, Steady Reel 5 and two relics the total is capped at 6');
  ctx.state.meta.relics = { seven_knots: 3, steady_hook: 3 };
  run.boons = {}; run.satiety = 0; ctx.time.frame++;
  eq(H(), 3, 'relics alone cap at 3');
  ok(!('reelSpeed' in (data.BALANCE.wellFed.effects || {})) && !('sweetZone' in (data.BALANCE.wellFed.effects || {})), 'Well-fed names no reel stat (data)');
  run.satiety = 100; ctx.time.frame++;
  const fed = P.getStats().reelSpeed;
  run.satiety = 0; ctx.time.frame++;
  near(P.getStats().reelSpeed, fed, 'S7: Well-fed never adds reelSpeed on the v3 path');
  // Ashwick's Burned Once: the first fish hooked each night (the hook of this very frame still counts as the first)
  const env2 = makeCtx();
  env2.ctx.state.meta.unlocks['character:ashwick'] = true;
  env2.ctx.state.meta.runs = 1;                          // not the First Outing (which is always The Wick)
  const r2 = startRun(env2, { character: 'ashwick' });
  r2.satiety = 0;
  ok(r2.character === 'ashwick', 'an Ashwick run');
  eq(env2.P.getCatchBuffs().firstHookTonight, false, 'by day: no Burned Once');
  env2.setPhase('gloomtide', { day: 2 });
  eq(env2.P.getCatchBuffs().firstHookTonight, true, 'the first hook tonight');
  env2.ctx.bus.emit('fishing:hook', { grade: 'clean', perfect: true, sizeClass: 'keeper' });
  eq(env2.P.getCatchBuffs().firstHookTonight, true, 'fishing:hook in the same frame as the roll: still the first');
  near(data.catchBuffHold('dusk_minnow', 'keeper', env2.P.getCatchBuffs()), 3, '+3 Hold (CATCH_V3.buffs.wicks.ashwick)');
  env2.ctx.time.frame += 30;
  eq(env2.P.getCatchBuffs().firstHookTonight, false, 'the next fish tonight is not the first');
  env2.ctx.bus.emit('fishing:hook', {});
  env2.setPhase('gloomtide', { day: 3 });
  eq(env2.P.getCatchBuffs().firstHookTonight, true, 'a new night: first again');
  eq([ctx.errors, env2.ctx.errors], [[], []], 'no errors');
}

// =====================================================================================
section('Pg13: getOdds — equals catchOdds with the owned relics; "?" until landed or lost; withBest; legends');
{
  const env = makeCtx();
  const { P, ctx } = env;
  const run = startRun(env, {});
  const m = ctx.state.meta;
  run.upgrades = { rod_ashwood: 2, line_gut: 2, reel_brass: 1 };
  run.bait = { mireworm: 3 }; P.equipBait('mireworm');
  m.relics = { seven_knots: 2, steady_hook: 1, oilskin_flask: 2 };
  run.satiety = 100; run.boons = { steady_reel: 3 }; P.invalidateStats(); ctx.time.frame++;   // run buffs: never in the log
  const unseen = P.getOdds('reedjaw_pike');
  eq([unseen.known, unseen.odds, unseen.withBest], ['unseen', null, null], 'a species neither landed nor lost: "?" (odds null)');
  known(env, 'reedjaw_pike');
  const o = P.getOdds('reedjaw_pike');
  const lo = { ...P.getLoadout(), item: 'mireworm' };
  const want = data.catchOdds('reedjaw_pike', lo, { strike: 'struck', buffs: { relics: { seven_knots: 2, steady_hook: 1 } } });
  eq(o.odds, want, 'Pg13: getOdds equals catchOdds with the owned relics (Struck, no run buffs)');
  ok(o.odds.trophy > data.catchOdds('reedjaw_pike', lo, { strike: 'struck' }).trophy, 'the owned relics raise the logged odds');
  ok(o.odds.trophy < data.catchOdds('reedjaw_pike', lo, { strike: 'struck', buffs: { relics: { seven_knots: 2, steady_hook: 1 }, wellFed: true, boons: { steady_reel: 3 } } }).trophy, 'Well-fed and Boons stay out of the log');
  eq(o.pct.trophy, data.catchDisplay(o.odds.trophy), 'pct = data.catchDisplay (rounded down)');
  ok(Object.values(o.odds).every((p) => p == null || (p > 0 && p < 1)), 'never 100%');
  // withBest: the best item the player holds for this fish
  run.lures = { bell_spinner: true };
  const o2 = P.getOdds('reedjaw_pike');
  eq(o2.withBest?.item, 'bell_spinner', 'withBest: the Harbour-Bell Spinner held for this run');
  eq(o2.withBest.odds, data.catchOdds('reedjaw_pike', { ...lo, item: 'bell_spinner' }, { strike: 'struck', buffs: { relics: { seven_knots: 2, steady_hook: 1 } } }), 'withBest odds at the same reference');
  P.equipLure('bell_spinner');
  eq(P.getOdds('reedjaw_pike').withBest, null, 'no withBest when the best item is already on the line');
  eq(P.getOdds('reedjaw_pike', { item: null }).odds, data.catchOdds('reedjaw_pike', { ...lo, item: null }, { strike: 'struck', buffs: { relics: { seven_knots: 2, steady_hook: 1 } } }), 'getOdds(id, {item}) overrides the item');
  // unreachable classes: null ("—")
  known(env, 'quayling');
  const q = P.getOdds('quayling');
  eq([q.odds.prize, q.odds.trophy, q.odds.elder], [null, null, null], 'the Quayling\'s Prize and above are unreachable ("—")');
  // legends: the attempt % with its wounds, on per-run Fight
  known(env, 'belled_matriarch');
  const L0 = P.getOdds('belled_matriarch');
  eq(Object.keys(L0.odds), ['legend'], 'a legend\'s row is {legend: p}');
  eq(L0.odds.legend, data.catchChance('belled_matriarch', 'legend', P.getLoadout(), { strike: 'struck', buffs: { relics: { seven_knots: 2, steady_hook: 1 } }, perRun: true }), 'P1–P2: legends on CATCH_V3.legend.fightRun (mods.perRun)');
  ok(L0.odds.legend > data.catchChance('belled_matriarch', 'legend', P.getLoadout(), { strike: 'struck', buffs: { relics: { seven_knots: 2, steady_hook: 1 } } }), 'the per-run Fight is the lower one');
  eq(P.getCatchMods('belled_matriarch').perRun, true, 'getCatchMods hands fishing perRun for the roll');
  eq(ctx.errors, [], 'no errors');
}

// =====================================================================================
section('Pg13: every per-run rod, line and reel level raises the logged odds of the Reedjaw\'s Trophy');
{
  const env = makeCtx();
  const { P, ctx } = env;
  const run = startRun(env, {});
  known(env, 'reedjaw_pike');
  run.equippedBait = null; run.equipped = null;
  for (const [slot, ids] of Object.entries(data.BALANCE.upgradeTiers.slots)) {
    if (slot === 'creel') continue;
    run.upgrades = {};
    let prev = P.getOdds('reedjaw_pike').odds.trophy;
    for (const id of ids) {
      const u = data.UPGRADE_BY_ID[id];
      for (let lv = 1; lv <= u.maxLevel; lv++) {
        run.upgrades[id] = lv;
        const p = P.getOdds('reedjaw_pike').odds.trophy;
        ok(p - prev >= 0.01 - 1e-9, `${slot}: ${id} level ${lv} raises the Reedjaw's Trophy by ≥ 1 point (${(prev * 100).toFixed(1)} → ${(p * 100).toFixed(1)})`);
        prev = p;
      }
    }
  }
  eq(ctx.errors, [], 'no errors');
}

// =====================================================================================
section('Pg13 / F15: fish:escaped — a Glimpsed page with odds and no Memories, the Got away list, the pin, the Elder Log');
{
  const env = makeCtx();
  const { P, ctx } = env;
  const run = startRun(env, {});
  const m = ctx.state.meta;
  const mem0 = m.memories;
  ctx.bus.emit('fish:escaped', { speciesId: 'gloam_eel', sizeClass: 'trophy', z: 2.1, approxLength: 95, reason: 'thrown', place: null, x: 3, zPos: -4, markedFish: false, grade: 'struck', legendary: false });
  const e = m.journal.gloam_eel;
  eq([e.caught, e.seen], [0, true], 'a lost unseen species gets a Glimpsed page (known, not caught)');
  eq(env.count('journal:seen'), 1, 'journal:seen fires once');
  eq(m.memories, mem0, 'losses give nothing to farm: no Memories');
  const g = P.getOdds('gloam_eel');
  ok(g.known === 'glimpsed' && g.odds && g.odds.trophy > 0, 'getOdds shows its odds (Glimpsed)');
  const jr = P.getJournal().find((x) => x.id === 'gloam_eel');
  eq([jr.discovered, jr.glimpsed, jr.name], [false, true, data.SPECIES_BY_ID.gloam_eel.name], 'the Journal: not discovered, glimpsed, named');
  eq(e.gotAway, [{ sizeClass: 'trophy', length: 95, place: null, zone: 'mossmere', day: 1, reason: 'thrown' }], 'the Got away list');
  eq(e.escape, { length: 95, sizeClass: 'trophy' }, 'the one that got away');
  eq(P.getGearLog().pinned, { speciesId: 'gloam_eel', sizeClass: 'trophy', reason: 'thrown', name: null, approxLength: 95, auto: true }, 'the gear log pins the last fish that got away');
  for (let i = 0; i < 6; i++) ctx.bus.emit('fish:escaped', { speciesId: 'gloam_eel', sizeClass: 'keeper', approxLength: 40 + i, reason: 'spat' });
  eq(m.journal.gloam_eel.gotAway.length, 5, 'the Got away list keeps the last 5');
  eq(m.journal.gloam_eel.escape.length, 95, 'the one that got away keeps the biggest');
  eq(env.count('journal:seen'), 1, 'journal:seen only for the first glimpse');
  // an Elder: named at the loss, the Elder Log's "still out there", a Marked Fish (open water, Elder+)
  ctx.bus.emit('fish:escaped', { speciesId: 'reedjaw_pike', sizeClass: 'elder', z: 2.8, approxLength: 160, reason: 'snapped', place: null, x: 10, zPos: 12, markedFish: true, grade: 'clean' });
  const lostLine = m.elderLog.at(-1);
  ok(typeof lostLine.name === 'string' && lostLine.lost === 'snapped' && lostLine.speciesId === 'reedjaw_pike', `an Elder is named at the loss and joins the Elder Log (${lostLine.name}, lost: snapped)`);
  const mf = P.getMarkedFish('mossmere');
  eq(mf.length, 1, 'a phase-1 Elder escape leaves a Marked Fish');
  eq([mf[0].x, mf[0].z0, mf[0].name, mf[0].bonus], [10, 12, lostLine.name, true], 'anchored at the escape point, named, its +6 still to come');
  // a re-hooked Marked Fish: +6 once (catchChance(…, {marked: true}))
  const lo = P.getLoadout();
  const pOdds = P.getOdds('reedjaw_pike');
  ok(pOdds.marked.length === 1 && pOdds.marked[0].p === data.catchChance('reedjaw_pike', 'elder', { ...lo, item: P.getEquippedItem() }, { strike: 'struck', buffs: { relics: {} }, perRun: true, marked: true }), 'its log line: catchChance(…, {marked: true})');
  eq(P.markedFishHooked(mf[0].id), { marked: true }, 're-hooked: the +6 applies');
  eq(P.markedFishHooked(mf[0].id), { marked: false }, 'only once');
  const caught = P.makeFish('reedjaw_pike', 2.8, 'normal', { markedFishId: mf[0].id });
  eq(caught.name, lostLine.name, 'a landed Marked Fish keeps its name');
  P.measure(caught);
  eq(P.getMarkedFish().length, 0, 'landed: no longer out there');
  // ≤ 2 per lake: a third replaces that lake's oldest
  for (const [i, sp] of ['mossback_perch', 'weeping_carp', 'gloam_eel'].entries()) ctx.bus.emit('fish:escaped', { speciesId: sp, sizeClass: 'elder', z: 2.7, approxLength: 50, reason: 'spat', x: i, zPos: i, markedFish: true });
  eq(P.getMarkedFish('mossmere').map((x) => x.speciesId), ['weeping_carp', 'gloam_eel'], 'a third Marked Fish in one lake replaces that lake\'s oldest');
  ok(run.flags.markedFishCreated.length === 4, 'the run lists the Marked Fish it created');
  // summary lines
  const sum = P.summarizeRun('victory-preview');
  ok(Array.isArray(sum.gotAway) && sum.gotAway.some((l) => /Trophy Gloam Eel, near 95 cm, threw the hook, day 1\./.test(l)), `the death screen lists got-away lines (${sum.gotAway[0]})`);
  eq(approxText(160, data.AUTOFISH), '1.6 m', 'size words: 0.1 m above 1 m'); eq(approxText(47, data.AUTOFISH), '45 cm', '5 cm under 1 m'); eq(approxText(13.4, data.AUTOFISH), '13 cm', '1 cm under 20 cm');
  eq(ctx.errors, [], 'no errors');
}

// =====================================================================================
section('Pg13: legend wounds (+6 per escape, ≤ 3 counted, healed on landing); per descent inside The Long Descent');
{
  const env = makeCtx();
  const { P, ctx } = env;
  startRun(env, {});
  const m = ctx.state.meta;
  known(env, 'belled_matriarch');
  const p0 = P.getOdds('belled_matriarch').odds.legend;
  for (let i = 0; i < 5; i++) ctx.bus.emit('fish:escaped', { speciesId: 'belled_matriarch', legendary: true, reason: 'thrown' });
  eq(m.legendWounds, { belled_matriarch: 3 }, 'meta.legendWounds counts escapes, ≤ 3 (+18 Hold)');
  eq(P.getCatchMods('belled_matriarch').wounds, 3, 'getCatchMods hands fishing the wounds');
  const o = P.getOdds('belled_matriarch');
  eq(o.wounds, 3, 'the log shows the wounds');
  ok(o.odds.legend > p0 && o.odds.legend < 0.5, `the attempt % rises with the wounds and stays below 50% (${(p0 * 100).toFixed(1)} → ${(o.odds.legend * 100).toFixed(1)})`);
  eq(o.odds.legend, data.catchChance('belled_matriarch', 'legend', P.getLoadout(), { strike: 'struck', buffs: { relics: {} }, perRun: true, wounds: 3 }), 'wounded odds = catchChance(…, {wounds: 3})');
  P.measure(P.makeFish('belled_matriarch', 0));
  eq(m.legendWounds.belled_matriarch, undefined, 'landed: the wounds heal');
  // The Long Descent: wounds per descent (run.legendWounds), meta untouched
  const env2 = makeCtx();
  env2.ctx.state.meta.runs = 3;
  const r2 = env2.P.createRun({ outing: 'descent' });
  env2.ctx.state.run = r2; env2.ctx.bus.emit('run:start', { continued: false });
  eq(r2.outing, 'descent', 'a Long Descent run');
  env2.ctx.bus.emit('fish:escaped', { speciesId: 'lantern_swallower', legendary: true, reason: 'snapped' });
  eq([r2.legendWounds, env2.ctx.state.meta.legendWounds], [{ lantern_swallower: 1 }, undefined], 'inside The Long Descent wounds count per descent (run.legendWounds)');
  eq(env2.P.getCatchMods('lantern_swallower').perRun, true, 'and its legends use the per-run Fight');
  eq([ctx.errors, env2.ctx.errors], [[], []], 'no errors');
}

// =====================================================================================
section('Pg13: getGearLog — Hold per row, emphasis, targets met, compare to the pinned fish; getTackleRating in words');
{
  const env = makeCtx();
  const { P, ctx } = env;
  const run = startRun(env, {});
  murk(env);
  known(env, 'reedjaw_pike'); known(env, 'dusk_minnow');
  ctx.bus.emit('fish:escaped', { speciesId: 'reedjaw_pike', sizeClass: 'trophy', approxLength: 110, reason: 'thrown' });
  const log = P.getGearLog();
  eq(log.pinned.speciesId, 'reedjaw_pike', 'pinned: the Reedjaw that threw the hook');
  const rod = log.find((r) => r.id === 'rod_ashwood');
  eq([rod.kind, rod.level, rod.hold, rod.targets], ['rod', 0, 0, 'all'], 'a per-run rod row (+0 Hold now, on every fish)');
  eq(rod.emphasis, { mult: 1.6, styles: ['leaper'] }, 'counts ×1.6 against leapers');
  eq(log.find((r) => r.id === 'line_gut').emphasis.styles, ['thrasher', 'sinker', 'sulker'], 'the line ×1.6 against thrashers, sinkers and sulkers');
  ok(rod.gain > 0 && rod.compare && rod.compare.b > rod.compare.a, `buying the next Ashwood level raises the pinned Reedjaw Trophy (${(rod.compare.a * 100).toFixed(0)}% → ${(rod.compare.b * 100).toFixed(0)}%)`);
  eq(rod.compare.a, data.catchChance('reedjaw_pike', 'trophy', { ...P.getLoadout(), item: P.getEquippedItem() }, { strike: 'struck', buffs: { relics: {} }, perRun: true }), 'compare.a = the logged figure');
  const spin = log.find((r) => r.id === 'bell_spinner');
  eq([spin.kind, spin.hold, spin.price, spin.owned, spin.giants], ['lure', 10, Math.round(220 * 0.4), false, true], 'the Harbour-Bell Spinner row: +10, 88 Shells this run, a giants\' lure');
  ok(spin.targets.includes('reedjaw_pike') && spin.compare.b > spin.compare.a, 'it names the Reedjaw and the compare shows the gain');
  const worm = log.find((r) => r.id === 'mireworm');
  ok(worm.kind === 'bait' && worm.hold === 5 && Array.isArray(worm.targets), 'a bait row: +5 Hold on the species it attracts (the ones met)');
  const spoon = log.find((r) => r.id === 'glimmer_spoon');
  eq(spoon.targets.family, 'predator', 'a family lure: {family}');
  ok(spoon.targets.met.every((id) => data.SPECIES_BY_ID[id]?.family === 'predator' && ctx.state.meta.journal[id]), 'met: predators in the Journal only');
  const shim = log.find((r) => r.id === 'shimmerfly');
  ok(!shim || shim.targets === 'all', 'Shimmerfly helps all');
  const gl = log.find((r) => r.id === 'lure_glimmer');
  ok(gl && gl.upgrade && gl.hold === 0 && gl.next === 2, 'the per-run Glimmer Spoon upgrade row (+2 per level)');
  ok(log.every((r) => !('pct' in r)), 'rows carry probabilities for the log to print; the shop rows carry none');
  ok(P.shop.getItems().filter((i) => i.kind === 'lure').every((i) => !/%/.test(`${i.name} ${i.desc} ${i.effectText || ''} ${i.reason || ''}`)), 'no "%" in Murk\'s lure rows (the odds live in the log)');
  const wormRow = P.shop.getItems().find((i) => i.id === 'bait:mireworm');
  ok(wormRow.hold === 5 && Array.isArray(wormRow.targets), 'Murk\'s bait rows carry their Hold and whom they help (the gear log\'s line)');
  P.pinGear('dusk_minnow', 'keeper');
  eq(P.getGearLog().pinned, { speciesId: 'dusk_minnow', sizeClass: 'keeper', auto: false }, 'a player pin wins over the auto pin');
  P.pinGear(null);
  eq(P.getGearLog().pinned.speciesId, 'reedjaw_pike', 'unpinned: back to the last fish that got away');
  const rate = P.getTackleRating('mossmere');
  eq(rate, data.catchRating('mossmere', { rod: 0, line: 0, reel: 0, item: P.getEquippedItem(), itemLevel: 1, perRun: true }, { buffs: { relics: {} } }), 'the tackle rating = data.catchRating on the rounded tiers');
  ok(typeof rate.word === 'string' && !/\d/.test(rate.word), `the rating is words (${rate.held}s held, ${rate.next}s are ${rate.word})`);
  run.upgrades = { rod_ashwood: 3, rod_whalebone: 3, line_gut: 4, line_silver: 2, reel_brass: 4, reel_drag: 3 };
  ok(['trophy', 'elder'].includes(P.getTackleRating('mossmere').held), `full per-run kit: ${P.getTackleRating('mossmere').held}s held`);
  eq(ctx.errors, [], 'no errors');
}

// =====================================================================================
section('Pg14: per-run lures at 40% from each lake\'s lighting; one bait OR one lure; a snap never loses it; gone after the run');
{
  const env = makeCtx();
  const { P, ctx } = env;
  const run = startRun(env, {});
  murk(env);
  const rows = ONE_LURE_ONSALE(P);
  const start = data.LURES.filter((l) => l.onSale === 'start');
  eq(rows.map((r) => r.lureId).sort(), start.map((l) => l.id).sort(), 'the Mossmere run: every "start" lure is on sale, the deeper lakes\' are absent');
  for (const r of rows) eq(r.price, Math.round(data.LURES.find((l) => l.id === r.lureId).price * 0.4), `${r.lureId} at round(price × 0.4) = ${r.price}`);
  ok(rows.every((r) => r.tab === 'lure' && r.kind === 'lure' && r.hold > 0), 'the lure tab (kind lure, its Hold)');
  // lit: reaching Sporewood (this run) lights its lures
  run.zonesUnlocked = ['mossmere', 'sporewood'];
  ok(['moth_popper', 'sporelamp_fly'].every((id) => ONE_LURE_ONSALE(P).some((r) => r.lureId === id)), 'Sporewood reached this run: its lures appear');
  ok(!ONE_LURE_ONSALE(P).some((r) => r.lureId === 'mirror_shard'), 'Glasswater\'s still absent');
  run.zonesUnlocked = ['mossmere'];
  ctx.state.meta.deepestZone = 2;
  ok(['mirror_shard', 'lantern_lure'].every((id) => ONE_LURE_ONSALE(P).some((r) => r.lureId === id)), 'a lake reached in an earlier run stays lit');
  ctx.state.meta.deepestZone = 0;
  // buy: spends the 40% price, kept in run.lures, goes on the line, the bait comes off
  run.bait = { mireworm: 4 }; P.equipBait('mireworm');
  const before = run.shells;
  const res = P.shop.buy('lure:bell_spinner');
  ok(res.ok, `bought the Harbour-Bell Spinner (${res.msg})`);
  eq(before - run.shells, 88, 'for 88 Shells');
  eq([run.lures, run.equipped, run.equippedBait], [{ bell_spinner: true }, 'bell_spinner', null], 'kept in run.lures; on the line; the bait off (one item)');
  eq(env.last('lure:buy'), { lureId: 'bell_spinner', run: true }, 'lure:buy {lureId}');
  ok(!P.shop.buy('lure:bell_spinner').ok, 'one per run');
  ok(!P.shop.buy('lure:mirror_shard').ok, 'an unlit lake\'s lure cannot be bought');
  // a cast with a lure spends no bait
  ctx.fishing.state = 'casting';
  eq(P.consumeBait(), null, 'a cast with a lure on spends no bait');
  eq(run.bait.mireworm, 4, 'the worms stay in the bag');
  ctx.bus.emit('fishing:cast', {});
  // a snapped line never loses it
  ctx.fishing.state = 'lost';
  ctx.bus.emit('fishing:escaped', { reason: 'snapped', sizeClass: 'trophy' });
  ctx.bus.emit('fish:escaped', { speciesId: 'reedjaw_pike', sizeClass: 'trophy', approxLength: 100, reason: 'snapped' });
  ctx.fishing.state = 'idle';
  eq([run.lures.bell_spinner, P.getEquippedItem()], [true, 'bell_spinner'], 'a snapped line never loses the lure');
  // swap back to a bait: the lure comes off the line but stays owned
  P.equipBait('mireworm');
  eq([run.equipped, run.equippedBait, run.lures.bell_spinner], ['mireworm', 'mireworm', true], 'a bait on the hook takes the lure off (still owned)');
  P.equipBait('bell_spinner');
  eq(P.getEquippedItem(), 'bell_spinner', 'equipBait with a lure id equips the lure');
  eq(P.getEquippedBait(), null, 'and fishing sees no bait');
  eq(P.getEquippedLure()?.id, 'bell_spinner', 'getEquippedLure for fishing\'s attract and favour');
  eq(P.cycleBait(), null, 'cycling: lure → bare hook …');
  eq(P.cycleBait(), 'mireworm', '… → worms');
  eq(P.cycleBait(), 'bell_spinner', '… → the lure');
  // a legend bait on top of a lure: the lure comes back when the legend is hooked
  run.bait.heartmoss = 1;
  P.equipBait('heartmoss');
  eq([P.getEquippedItem(), run.flags.prevItem], ['heartmoss', 'bell_spinner'], 'the legend bait on the line (the lure remembered)');
  ctx.bus.emit('fishing:hook', { legendary: true, speciesId: 'belled_matriarch', grade: 'struck', sizeClass: 'legend' });
  eq(P.getEquippedItem(), 'bell_spinner', 'the legend bait spent → the lure goes back on');
  // buying a bait never knocks a lure off
  P.shop.buy('bait:lumen_moss');
  eq(P.getEquippedItem(), 'bell_spinner', 'buying a bait leaves the lure on the line');
  // gone after the run
  const r2 = startRun(env, {});
  eq([r2.lures, r2.equipped === 'bell_spinner'], [{}, false], 'a new run starts with no lures');
  // The Long Descent sells none
  const env3 = makeCtx();
  env3.ctx.state.meta.runs = 2;
  const r3 = env3.P.createRun({ outing: 'descent' });
  env3.ctx.state.run = r3; env3.ctx.bus.emit('run:start', { continued: false });
  murk(env3);
  eq(ONE_LURE_ONSALE(env3.P).length, 0, 'The Long Descent: no per-run lures (today\'s UPGRADES)');
  eq([ctx.errors, env3.ctx.errors], [[], []], 'no errors');
}

// =====================================================================================
section('FE-Pg1: meta.firstEvening — added lazily, the legacy rule as a separate idempotent step');
{
  const fresh = migrateSaveModule({ version: 0, meta: {}, run: null }, data);
  eq(fresh.meta.firstEvening, { done: false, step: null, skipped: false, legacy: false }, 'a fresh save: {done: false, step: null}');
  ok(!('firstEvening' in defaultMeta()), 'core.defaultMeta untouched');
  const v1 = { version: 2, meta: { runs: 4, journal: { pale_leviathan: { caught: 1 }, dusk_minnow: { caught: 3 } }, relics: {}, unlocks: {} }, run: null };
  migrateSaveModule(v1, data);
  eq(v1.meta.firstEvening, { done: true, step: null, skipped: false, legacy: true }, 'a v1 save: {done: true, legacy: true}');
  ok(v1.meta.v3ids && v1.meta.journal.lantern_swallower, 'Pg0 ran first (ids renamed)');
  const p1 = { version: 2, meta: { runs: 2, v3ids: true, journal: { dusk_minnow: { caught: 1 } } }, run: null };
  migrateSaveModule(p1, data);
  eq(p1.meta.firstEvening, { done: true, step: null, skipped: false, legacy: true }, 'a P1-era v3 save (v3ids, Pg0 skipped): legacy');
  const noRuns = { version: 2, meta: { runs: 0, v3ids: true, journal: { dusk_minnow: { caught: 1 } } }, run: null };
  migrateSaveModule(noRuns, data);
  eq(noRuns.meta.firstEvening.legacy, true, 'no runs but a non-cove journal entry: legacy');
  const midFE = { version: 2, meta: { runs: 0, v3ids: true, journal: { quayling: { caught: 1 } }, firstEvening: { done: false, step: 'gate', skipped: false, legacy: false } }, run: null };
  const before = clone(midFE.meta);
  migrateSaveModule(midFE, data);
  eq(midFE.meta, before, 'a mid-FE save after the catch: untouched (the Quayling is not legacy)');
  const quay = { version: 2, meta: { runs: 0, v3ids: true, journal: { quayling: { caught: 1 } } }, run: null };
  migrateSaveModule(quay, data);
  eq(quay.meta.firstEvening.legacy, false, 'only a Quayling in the Journal, no runs: not legacy');
  const again = clone(v1.meta);
  migrateSaveModule(v1, data);
  eq(v1.meta, again, 'idempotent: a second migration changes nothing');
  const off = migrateSaveModule({ version: 0, meta: {}, run: null }, dataV1);
  eq(off.meta.firstEvening, undefined, 'flag off: nothing added');
  // the defensive extension: a never-started record from a build without the First Evening, on a save that has runs
  const pre = { version: 2, meta: { runs: 3, v3ids: true, journal: {}, firstEvening: { done: false, step: null, skipped: false, legacy: false } }, run: null };
  migrateSaveModule(pre, data);
  eq(pre.meta.firstEvening.legacy, true, 'a never-started record on a played save (a build without FE) counts as undefined');
  ok(V3H.coveSpecies(data).has('quayling') && V3H.coveSpecies(data).size === 1, 'the cove has one species: the Quayling');
}
{
  // the live meta (progression.init runs the same step) and the director's events
  const env = makeCtx();
  const { P, ctx } = env;
  const m = ctx.state.meta;
  eq(m.firstEvening, { done: false, step: null, skipped: false, legacy: false }, 'init: a fresh live meta gets the record');
  ctx.bus.emit('firstEvening:step', { id: 'framing', prev: null, replay: false });
  ctx.bus.emit('firstEvening:step', { id: 'cast', prev: 'wake', replay: false });
  eq(m.firstEvening.step, 'cast', 'firstEvening:step checkpoints meta.firstEvening.step');
  eq(P.getFirstEvening(), { done: false, step: 'cast', skipped: false, legacy: false, offerSeen: false, offer: false, replay: false }, 'getFirstEvening');
  ok(P.setFirstEvening({ skipped: true }), 'the director\'s skip: setFirstEvening({skipped: true})');
  ctx.bus.emit('firstEvening:done', { skipped: true, replay: false, losses: 0 });
  eq(m.firstEvening, { done: true, step: null, skipped: true, legacy: false }, 'firstEvening:done: done, skipped');
  ok(data.FIRST_EVENING.marksSeen.every((t) => m.seenTips[t]), 'the First Evening\'s tips count as seen (cast_basics, nibble_wait, …)');
  // a legacy save: the offer ribbon, and the af_changed line at the first v3 bite (once)
  const env2 = makeCtx({ meta: Object.assign(defaultMeta(), { runs: 5, journal: { dusk_minnow: { caught: 2 } } }) });
  eq(env2.P.getFirstEvening().offer, true, 'a legacy save: the "A new first evening" ribbon is offered');
  ok(env2.P.setFirstEvening({ offerSeen: true }) && env2.P.getFirstEvening().offer === false, 'used or dismissed: gone for good');
  startRun(env2, {});
  env2.ctx.bus.emit('fishing:bite', { sizeClass: 'keeper', biteTell: 'plunge' });
  env2.ctx.bus.emit('fishing:bite', { sizeClass: 'keeper', biteTell: 'plunge' });
  eq(env2.events.filter((e) => e.evt === 'tip:show').map((e) => e.payload.id), ['af_changed'], 'a legacy save\'s first v3 bite: tip:show af_changed, once');
  eq([ctx.errors, env2.ctx.errors], [[], []], 'no errors');
}

// =====================================================================================
section('FE-Pg1: the run-less measure of the Quayling (Memories once, First Light); Release only; a replay writes nothing');
{
  const env = makeCtx();
  const { P, ctx } = env;
  const m = ctx.state.meta;
  ctx.flow = 'hub';
  ctx.bus.emit('zone:change', { zone: 'cove', hub: true, prev: null, from: 'boot' });
  eq(P.getCatchMods('quayling').lake, 'cove', 'run-less in the hub: the cove\'s lake (−12 Fight)');
  const tut = data.catchChance('quayling', 'small', P.getLoadout(), { strike: 'struck', buffs: P.getCatchBuffs(), lake: P.getCatchMods('quayling').lake });
  ok(tut > 0.85 && tut < 0.95, `the tutorial Quayling on the run-less T0 loadout: ${(tut * 100).toFixed(1)}% (85–95%)`);
  ctx.bus.emit('firstEvening:step', { id: 'measure', prev: 'play', replay: false });
  const mem0 = m.memories;
  const f1 = P.makeFish('quayling', -0.5, 'normal');
  eq([f1.sizeClass, f1.value >= 1], ['small', true], 'a Small Quayling (the cove: normaliser 1)');
  const r1 = P.measure(f1);
  eq(m.journal.quayling.caught, 1, 'the Journal holds the Quayling');
  const memBy = (src) => env.events.filter((e) => e.evt === 'memories:change' && e.payload.source === src).reduce((a, e) => a + e.payload.delta, 0);
  eq(memBy('journal'), data.MEMORIES_V3.newSpecies, 'its first catch banks the new-species Memories');
  ok(m.challenges.first_light === true, 'and it counts for First Light (FIRST_EVENING.firstLight)');
  eq(m.totalFish, 1, 'a landed fish (meta.totalFish)');
  eq([env.last('fish:measured').cove, env.last('fish:landed').cove], [true, true], 'fish:measured / fish:landed {cove: true}');
  ok(r1.records.length === 0 || r1.records.every((x) => x.kind !== 'classFirst'), 'no class seal for a cove fish');
  const memAfter = m.memories;
  for (let i = 0; i < 12; i++) P.measure(P.makeFish('quayling', 0.3, 'normal'));
  eq(m.memories - memAfter, 0, 'a Quayling banks its Memories once (no mastery Memories at 10: memoriesFirstOnly)');
  ok(memAfter - mem0 >= data.MEMORIES_V3.newSpecies, 'Memories rose only for the first');
  const rel = P.fishAction(f1, 'release');
  ok(rel.ok && env.last('fish:action').action === 'release', 'the card offers Release only: fish:action {action: release}');
  ok(!P.fishAction(P.makeFish('quayling', 0), 'sell').ok && !P.fishAction(P.makeFish('quayling', 0), 'keep').ok, 'keep / sell refused at the Landing');
  // a replay: meta byte-identical
  ctx.bus.emit('firstEvening:done', { skipped: false, replay: false });
  const snap = JSON.stringify(m);
  ctx.bus.emit('firstEvening:step', { id: 'framing', prev: null, replay: true });
  ok(P.getFirstEvening().replay === true, 'the replay is a sandbox');
  ok(!P.setFirstEvening({ step: 'cast' }), 'setFirstEvening refused inside a replay');
  for (const id of ['wake', 'cast', 'wait', 'strike', 'play']) ctx.bus.emit('firstEvening:step', { id, prev: null, replay: true });
  ctx.bus.emit('fish:escaped', { speciesId: 'quayling', sizeClass: 'small', approxLength: 12, reason: 'spat' });
  const rf = P.makeFish('quayling', 0.2, 'normal');
  const res = P.measure(rf);
  eq([res.replay, env.last('fish:measured').replay, env.last('fish:landed').replay], [true, true, true], 'the replay\'s catch still runs the ceremony and the card ({replay: true})');
  P.fishAction(rf, 'release');
  ctx.bus.emit('fishing:bite', {});
  for (const id of ['measure', 'odds', 'gate']) ctx.bus.emit('firstEvening:step', { id, prev: null, replay: true });
  ctx.bus.emit('firstEvening:done', { skipped: false, replay: true, losses: 1 });
  eq(JSON.stringify(m), snap, 'FE-Pg1: meta is byte-identical after a replay');
  ok(P.getFirstEvening().replay === false, 'the sandbox ends with the replay');
  eq(ctx.errors, [], 'no errors');
}

// =====================================================================================
section('Pg13: counters (P1–P2: the hurry from meta.runs ≥ 2, the strike ring on run.outing === "first"); D1′ readers gone');
{
  const env = makeCtx();
  const { P, ctx } = env;
  eq(P.getFishingCounters().firstExpedition, true, 'no runs yet: the first expedition');
  const r1 = startRun(env, {});
  eq([r1.outing, P.getFishingCounters().hurry, P.getFishingCounters().strikeRing], ['first', false, true], 'run 1 (the First Outing): no hurry, the strike ring on');
  startRun(env, {});
  eq([P.getFishingCounters().hurry, P.getFishingCounters().strikeRing], [true, false], 'run 2: the hurry, no ring (firstExpedition)');
  ctx.state.meta.settings.strikeRing = 'always';
  eq(P.getFishingCounters().strikeRing, true, 'Settings: always');
  const src = ['progression.js', 'progression-af.js', 'progression-market.js', 'progression-v3.js', 'progression-challenges.js'].map((f) => readFileSync(resolve(here, '../../src', f), 'utf8')).join('\n');
  const code = src.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*\*)/.test(l)).join('\n');
  for (const k of ['FIGHT_STATS', 'shock', 'pipBonus', 'absorb', 'dragAt', 'tackleRating', 'ceremony.nearMiss', 'TEXT_V3?.nearMiss', 'TEXT_V3.nearMiss', 'oldTrick', '.pips', 'size.fight', 'size?.fight']) ok(!code.includes(k), `progression reads no key D1′ retired (${k})`);
  eq(slotEmphasis(data.CATCH_V3, 'reel'), { mult: 1.6, styles: ['runner'] }, 'slotEmphasis');
  eq(ctx.errors, [], 'no errors');
}

console.log(`\nprogression-af: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
