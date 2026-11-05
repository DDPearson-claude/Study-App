// Unit tests for the v3 Phase 1 survival items (DESIGN §25.14.2 S1, S2, S3; CONTRACT §13.4, §13.7 survival) with a
// fake ctx, the v3 data at phase 1 (raft build, the P1 gate build) and, for parity, the flag-off data.
//   node tools/tests/survival-v3.test.mjs   (or node tools/check.mjs)
// Deterministic: survival rolls only for armor wards (armor 0 here), so nothing below depends on a seed.
// survival-fx bakes a glow texture on a 2D canvas (toon.js): a minimal canvas shim stands in for the DOM.
if (typeof globalThis.document === 'undefined') {
  const ctx2d = new Proxy({}, { get: (t, k) => (k === 'createImageData' ? (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h })
    : k === 'createRadialGradient' || k === 'createLinearGradient' ? () => ({ addColorStop() {} }) : () => {}), set: () => true });
  globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx2d, style: {} }) };
}
import * as THREE from 'three';
import * as dataV1 from '../../src/data.js';                 // evaluated first: GW_V3 unset → the flag-off build
import { createBus, defaultMeta } from '../../src/core.js';
import { create } from '../../src/survival.js';
import { create as createPlayer } from '../../src/player.js';

globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; globalThis.GW_WALK = false;
const data = await import('../../src/data.js?v3p1');
delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE; delete globalThis.GW_WALK;

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
function near(a, b, msg, eps = 1e-6) { ok(Math.abs(a - b) <= eps, `${msg} (got ${a}, want ${b} ± ${eps})`); }
const section = (s) => console.log(`- ${s}`);

const DT = 0.05;

/** STATS base values + the character's effects (+ Well-fed effects when `wellFedStats`, like P1 progression's getStats). */
function statsFor(D, run, { wellFedStats = false } = {}) {
  const out = {};
  for (const [k, v] of Object.entries(D.STATS)) out[k] = v.base;
  const ch = D.CHARACTER_BY_ID?.[run?.character];
  for (const [k, v] of Object.entries(ch?.effects || {})) if (k in out) out[k] += v;
  if (wellFedStats && run && D.BALANCE.wellFed && run.satiety >= D.BALANCE.wellFed.at * out.maxSatiety) {
    for (const [k, v] of Object.entries(D.BALANCE.wellFed.effects)) out[k] += v;
  }
  return out;
}

function makeEnv({ D = data, revive = false, wellFedStats = false, player = {} } = {}) {
  const bus = createBus();
  const events = [];
  const fishing = { state: 'idle', view: {} };
  const ctx = {
    THREE, bus, data: D,
    state: { meta: defaultMeta(), run: null },
    time: { dt: DT, gameDt: DT, t: 0, gameT: 0, timeScale: 1, frame: 1 },
    flow: 'playing', paused: false, debug: {}, errors: [], isMobile: false, input: {},
    game: { save() {} },
    progression: {
      getStats: (r) => statsFor(D, r ?? ctx.state.run, { wellFedStats }),
      tryRevive: () => { if (!revive) return false; revive = false; return true; },
    },
    player: { position: new THREE.Vector3(10, 0, 20), ...player },
    fishing,
    actors: {}, world: {}, combat: {}, ui: {}, render: {},
  };
  const origEmit = bus.emit.bind(bus);
  bus.emit = (evt, payload = {}) => { events.push({ evt, payload }); origEmit(evt, payload); };
  const S = create(ctx);
  ctx.survival = S;
  S.init();
  return {
    ctx, S, fishing, events,
    count: (e) => events.filter((x) => x.evt === e).length,
    last: (e) => [...events].reverse().find((x) => x.evt === e)?.payload,
    clear: () => { events.length = 0; },
  };
}

/** A fresh run as main + progression make it (v1 fields + v3 outing / nightMode). */
function startRun(env, { zone = 'mossmere', nightMode = 'still', outing = 'normal', character = 'wick' } = {}) {
  const D = env.ctx.data;
  const st = D.STATS;
  const run = {
    active: true, zone, day: 1, phase: 'calm', phaseTime: 0, character, upgrades: {}, boons: {}, relics: {}, flags: {}, creel: [],
    hp: st.maxHp.base, oil: st.maxOil.base, satiety: st.maxSatiety.base, stats: {},
  };
  if (D.V3_ENABLED) { run.nightMode = nightMode; run.outing = outing; }
  env.ctx.state.run = run;
  env.ctx.bus.emit('zone:change', { zone, prev: null });
  env.ctx.bus.emit('run:start', { continued: false });
  return run;
}
/** Advance game time by `seconds` in DT steps (survival's update gets the game dt, as main gives it). */
function tick(env, seconds, { until = null } = {}) {
  const n = Math.round(seconds / DT);
  for (let i = 0; i < n; i++) {
    env.ctx.time.frame++;
    env.S.update(DT, env.ctx.time.t += DT);
    if (until && until()) return i + 1;
  }
  return n;
}
/** Run until the phase becomes `phase` (and, optionally, a given day). */
function tickTo(env, phase, day = null, max = 1000) {
  const r = env.ctx.state.run;
  return tick(env, max, { until: () => r.phase === phase && (day == null || r.day === day) });
}

// =====================================================================================
section('the builds this suite tests');
{
  eq(data.V3_ENABLED, true, 'data?v3p1 is the v3 build'); eq(data.V3_PHASE, 1, 'phase 1');
  eq(dataV1.V3_ENABLED, false, 'plain data.js is the flag-off build');
  ok(!!data.BALANCE.oil?.context && !!data.BALANCE.wellFed && !!data.BALANCE.nightModes, 'v3 build carries oil / wellFed / nightModes');
  ok(!dataV1.BALANCE.oil && !dataV1.BALANCE.wellFed, 'flag-off BALANCE has no v3 blocks (survival feature-detects them)');
  ok(!data.BALANCE.farWater, 'P1 has no Far Water block (night factor 1)');
}

// =====================================================================================
section('S1: phases 180 (185) / 20 / 90 / 10, +30 s Arrival Hush on day 1 and after a gate');
{
  const env = makeEnv();
  startRun(env, { nightMode: 'still', outing: 'first' });
  env.ctx.debug.god(true);   // a clock-only test: no drains, so five days pass without a snuff
  const seen = {};
  for (const p of ['calm', 'dusk', 'gloomtide', 'dawn']) {
    tickTo(env, p, 1);
    seen[p] = env.S.getPhaseInfo().duration;
  }
  eq(seen, { calm: 210, dusk: 20, gloomtide: 90, dawn: 10 }, 'Mossmere day 1 reads 210 / 20 / 90 / 10');
  tickTo(env, 'calm', 2);
  eq(env.S.getPhaseInfo().duration, 180, 'Mossmere day 2 calm is 180 (no hush)');
  eq(env.S.getPhaseInfo().hush, 0, 'no hush on day 2');
  eq(env.S.getPhaseDurations(1), { calm: 210, dusk: 20, gloomtide: 90, dawn: 10, total: 330, hush: 30 }, 'getPhaseDurations(1): the 5.5-minute day 1');
  eq(env.S.getPhaseDurations(2).total, 300, 'a later day is 5 minutes');

  // a gate passage during calm: the new lake's current calm gets the hush; Glasswater (a foot lake) is 185
  const r = env.ctx.state.run;
  r.zone = 'glasswater';
  env.ctx.bus.emit('zone:change', { zone: 'glasswater', prev: 'mossmere' });
  eq(env.S.getPhaseInfo().duration, 215, 'Glasswater: a calm entered through a gate is 185 + 30');
  eq(env.S.getPhaseInfo().hush, 30, 'getPhaseInfo().hush = 30 on that calm');
  tickTo(env, 'calm', 3);
  eq(env.S.getPhaseInfo().duration, 185, 'Glasswater: a later calm is 185');
  // a gate passage at dawn: the hush lands on the next calm
  tickTo(env, 'dawn', 3);
  r.zone = 'paleabyss';
  env.ctx.bus.emit('zone:change', { zone: 'paleabyss', prev: 'glasswater' });
  eq(env.S.getPhaseInfo().duration, 10, 'the dawn of the passage is unchanged');
  tickTo(env, 'calm', 4);
  eq(env.S.getPhaseInfo().duration, 215, 'the Pallid Deep: the first calm after a dawn passage is 185 + 30');
  tickTo(env, 'calm', 5);
  eq(env.S.getPhaseInfo().duration, 185, 'the Pallid Deep: its later calm is 185');
  // Sporewood (mixed) is 180
  r.zone = 'sporewood';
  eq(env.S.getPhaseInfo().duration, 180, 'Sporewood (mixed) calm is 180');
  // continue (zone:change with prev null / continued) never re-arms the hush
  env.ctx.bus.emit('zone:change', { zone: 'sporewood', prev: null, continued: true });
  eq(env.S.getPhaseInfo().hush, 0, 'a continue does not add a hush');
}
{
  // nights by mode: Still and Lantern 90 every night; Gloomtide 90 + 6 per day, max 120
  for (const [mode, want] of [['still', [90, 90, 90]], ['lantern', [90, 90, 90]], ['gloomtide', [90, 102, 120]]]) {
    const env = makeEnv();
    startRun(env, { nightMode: mode });
    const got = [1, 3, 10].map((d) => env.S.getPhaseDurations(d).gloomtide);
    eq(got, want, `${mode} night lengths on days 1 / 3 / 10`);
  }
  // phase:change carries nightMode, and swarm on the night (Lantern: even nights)
  const env = makeEnv();
  startRun(env, { nightMode: 'lantern' });
  tickTo(env, 'gloomtide', 1);
  eq([env.last('phase:change').nightMode, env.last('phase:change').swarm], ['lantern', false], 'Lantern night 1: no swarm');
  tickTo(env, 'gloomtide', 2);
  eq([env.last('phase:change').nightMode, env.last('phase:change').swarm], ['lantern', true], 'Lantern night 2: the swarm comes');
  eq(env.S.getPhaseInfo().swarm, true, 'getPhaseInfo().swarm agrees');
  const f = makeEnv();
  startRun(f, { nightMode: 'still', outing: 'first' });
  tickTo(f, 'gloomtide', 2);
  eq(f.last('phase:change').swarm, false, 'the First Outing never swarms');
}
{
  // The Long Descent and the flag-off build keep today's phases (BALANCE.phases)
  const d = makeEnv();
  startRun(d, { nightMode: 'gloomtide', outing: 'descent' });
  eq([d.S.getPhaseInfo().duration, d.S.getPhaseDurations(1).dusk, d.S.getPhaseDurations(1).dawn], [120, 14, 8], 'The Long Descent: 120 / 14 / … / 8');
  eq(d.S.getPhaseInfo().hush, undefined, 'The Long Descent has no v3 fields on getPhaseInfo');
  const v1 = makeEnv({ D: dataV1 });
  startRun(v1);
  eq(v1.S.getPhaseDurations(1), { calm: 120, dusk: 14, gloomtide: 90, dawn: 8, total: 232, hush: 0 }, 'flag off: 120 / 14 / 90 / 8');
  eq(Object.keys(v1.S.getPhaseInfo()).sort(), ['day', 'duration', 'isDark', 'isNight', 'k', 'nextPhase', 'phase', 'remaining', 'time'], 'flag off: getPhaseInfo has exactly the v1 keys');
}

// =====================================================================================
section('S2: the oil context table (a Mossmere raft day burns 28.3, day 1 30.1, with no casts)');
{
  for (const mode of ['still', 'lantern', 'gloomtide']) {
    const env = makeEnv();
    const r = startRun(env, { nightMode: mode, outing: mode === 'still' ? 'first' : 'normal' });
    const o0 = r.oil;
    tickTo(env, 'calm', 2);
    near(o0 - r.oil, 30.1, `${mode}: Mossmere day 1 (calm 210 s) burns 30.1`, 0.5);
    const o1 = r.oil = 100;
    tickTo(env, 'calm', 3);
    if (mode !== 'gloomtide') near(o1 - r.oil, 28.3, `${mode}: a later Mossmere raft day burns 28.3`, 0.5);
    else near(o1 - r.oil, 28.3 + 0.17 * 6, 'gloomtide: day 2 burns 28.3 + its 6 s longer night at the raft rate 1.0', 0.5);
    eq(env.S.oilContext, 'raft', `${mode}: the context on the raft is 'raft'`);
    eq(env.count('player:died'), 0, `${mode}: nobody died`);
  }
  // per-phase rates: 0.17 × context × zone (no Heat factor)
  const env = makeEnv();
  const r = startRun(env, { nightMode: 'lantern' });
  r.day = 6;
  tick(env, 1);
  near(env.S.getVitals().oilRate, 0.17 * 0.35, 'raft calm 0.0595/s on day 6 (no Heat factor)');
  tickTo(env, 'gloomtide');
  tick(env, 1);
  near(env.S.getVitals().oilRate, 0.17 * 1.0, 'raft night 0.17/s');
  // on foot, inside a lit lamp, at the moored raft
  const foot = makeEnv({ player: { mode: 'foot', raft: { moored: true, position: new THREE.Vector3(0, 0, 0) } } });
  foot.ctx.world.getLamps = () => [{ id: 'l1', position: new THREE.Vector3(40, 0, 40), radius: 6, lit: true }];
  const fr = startRun(foot, { zone: 'glasswater', nightMode: 'still' });
  foot.ctx.player.position.set(20, 0, 20);
  tick(foot, 1);
  eq(foot.S.oilContext, 'foot', 'on foot in the open: foot');
  near(foot.S.getVitals().oilRate, 0.17 * 1.0 * 1.4, 'foot calm: 0.17 × 1.0 × Glasswater 1.4');
  foot.ctx.player.position.set(43, 0, 41);
  tick(foot, 1);
  eq(foot.S.oilContext, 'lamp', 'inside a lit lamp pool: lamp');
  near(foot.S.getVitals().oilRate, 0.17 * 0.35 * 1.4, 'lamp calm 0.35');
  foot.ctx.player.position.set(3, 0, 1.5);
  tick(foot, 1);
  eq(foot.S.oilContext, 'lamp', 'standing at the moored raft: lamp');
  fr.character = 'tallow';
  foot.ctx.player.position.set(20, 0, 20);
  tick(foot, 1);
  near(foot.S.getVitals().oilRate, 0.17 * 1.4 * 0.8, "Tallow's Slow Melt: foot oil × 0.8");
}

section('S2: 0 oil → Last Flicker (+12, once a day) → 25 s guttering (no casting) → Snuffed');
{
  const env = makeEnv();
  const r = startRun(env, { nightMode: 'lantern' });
  tick(env, 5);
  r.oil = 0.01;
  tick(env, 0.5);
  eq(env.count('lantern:flicker'), 1, 'the Last Flicker fires');
  near(r.oil, 12, 'it gives 12 oil', 0.1);
  eq(env.S.guttering, false, 'not guttering yet');
  // burn the flicker away: calm raft 0.0595/s → ≈ 202 s; jump it instead
  r.oil = 0.01;
  tick(env, 0.5);
  eq(env.count('lantern:flicker'), 1, 'only one Last Flicker per day');
  eq(env.count('lantern:out'), 1, 'lantern:out at the start of guttering');
  eq([env.S.guttering, env.S.getPhaseInfo().guttering, env.S.getVitals().guttering], [true, true, true], 'guttering on every readout');
  near(env.S.gutterLeft, 25 - (0.5 - 0.01 / (0.17 * 0.35)), 'gutterLeft counts down from 25 (from the moment oil hit 0)', 0.06);
  tick(env, 1);
  near(env.S.lightRadius, 2.5, 'the guttering light is 2.5 m', 0.05);
  // render a fish to relight mid-gutter
  tick(env, 10);
  env.S.addOil(17);
  tick(env, 0.1);
  eq([env.S.guttering, env.count('lantern:lit')], [false, 1], 'a rendered fish relights the lantern');
  near(env.S.gutterLeft, 0, 'gutterLeft resets');
  // out again the same day: no flicker, straight to guttering, then Snuffed after 25 s
  r.oil = 0.01;
  tick(env, 0.2);
  eq([env.count('lantern:flicker'), env.S.guttering], [1, true], 'out again the same day: guttering at once');
  tick(env, 24.5);
  eq(env.count('player:died'), 0, 'still alive at 24.7 s');
  tick(env, 0.5);
  eq(env.count('player:died'), 1, 'Snuffed at 25 s');
  eq(env.last('player:died')?.cause, 'snuffed', "player:died {cause: 'snuffed'}");
  eq(r.hp, data.STATS.maxHp.base, 'a snuff is the oil: the Embers are untouched');
  eq(env.count('player:damage'), 0, 'no darkness damage ticks in v3');
  // the next day gets a new Last Flicker
  const env2 = makeEnv();
  const r2 = startRun(env2, { nightMode: 'still' });
  r2.oil = 0.01; tick(env2, 0.2);
  r2.oil = 100;
  tickTo(env2, 'calm', 2);
  r2.oil = 0.01; tick(env2, 0.2);
  eq(env2.count('lantern:flicker'), 2, 'one Last Flicker per day, every day');
}
{
  // the Second Wick (progression.tryRevive) relights a snuff; the Embers stay as they were
  const env = makeEnv({ revive: true });
  const r = startRun(env, { nightMode: 'still' });
  r.hp = 3;
  env.ctx.debug.gutter();
  tick(env, 25.2);
  eq(env.count('player:died'), 0, 'the Second Wick stops the snuff');
  eq(env.count('player:revive'), 1, 'player:revive');
  ok(r.oil >= 39.9 && !env.S.guttering, 'relit with 40 oil');
  eq(r.hp, 3, 'the Embers are kept');
  // the debug hook snuffs straight away
  const e2 = makeEnv();
  startRun(e2, { nightMode: 'gloomtide' });
  e2.ctx.debug.snuff();
  eq(e2.last('player:died')?.cause, 'snuffed', 'debug.snuff() snuffs');
}

section('S2: only oil snuffs in Still and Lantern (Embers at 0 → Scorched / out until dawn); Gloomtide keeps the Embers death');
{
  // Still
  const env = makeEnv();
  const r = startRun(env, { nightMode: 'still' });
  tickTo(env, 'gloomtide', 1);
  env.S.damage(99, 'debug');
  eq([env.count('player:died'), r.hp, env.count('player:scorched')], [0, 0, 0], 'Still: Embers at 0 neither snuff nor scorch');
  env.S.damage(1, 'debug');
  eq(env.count('player:died'), 0, 'Still: further hits do nothing');
  tickTo(env, 'dawn', 1);
  eq(r.hp, data.STATS.maxHp.base, 'Still: the Embers mend at dawn');
  eq(env.count('player:died'), 0, 'Still: the run continues');
}
{
  // Lantern → Scorched (CONTRACT §13.4)
  const env = makeEnv();
  const r = startRun(env, { nightMode: 'lantern' });
  tickTo(env, 'gloomtide', 2);
  tick(env, 10);
  r.oil = 80;
  env.ctx.player.position.set(12, 0, -7);
  env.S.damage(99, 'hand_slam');
  eq(env.count('player:died'), 0, 'Lantern: Embers at 0 never snuff');
  eq(env.count('player:scorched'), 1, 'player:scorched instead');
  eq(env.last('player:scorched'), { night: 2, x: 12, z: -7 }, 'player:scorched {night, x, z}');
  near(r.oil, 50, 'the lantern loses 30 oil at once', 0.05);
  eq(env.S.lampWatch, { lampId: null, x: 12, z: -7, forced: true, radius: 10 }, 'a forced lamp-watch anchored where the Wick stands (r 10)');
  eq(env.last('lampwatch:start'), { lampId: null, zone: 'mossmere', forced: true }, 'lampwatch:start {forced: true}');
  eq([env.S.getPhaseInfo().swarm, !!env.S.scorched], [false, true], 'no swarm tonight once Scorched');
  env.S.damage(1, 'gloomling', { oil: 2 });
  near(r.oil, 48, 'hits while Scorched cost only their oil', 0.1);
  eq(env.count('player:scorched'), 1, 'Scorched once a night');
  tickTo(env, 'dawn', 2);
  eq(env.count('lampwatch:end'), 1, 'lampwatch:end at dawn');
  eq([r.hp, r.scorched, r.lampWatch], [data.STATS.maxHp.base, null, null], 'Embers mend in full; run.scorched / lampWatch cleared');
  eq(env.count('player:died'), 0, 'the run continues');
}
{
  // Lantern, a fish hooked when the Embers hit 0: the oil goes at once, the anchor waits for the fight to end
  const env = makeEnv();
  const r = startRun(env, { nightMode: 'lantern' });
  tickTo(env, 'gloomtide', 2);
  r.oil = 90;
  env.fishing.state = 'reeling';
  env.ctx.player.position.set(0, 0, 0);
  env.S.damage(99, 'hand_slam');
  eq(env.count('player:scorched'), 1, 'Scorched while reeling');
  near(r.oil, 60, 'the oil is spent at once', 0.05);
  eq([env.S.lampWatch, env.count('lampwatch:start'), !!r.scorched?.pending], [null, 0, true], 'the anchor waits for the fight');
  env.ctx.player.position.set(9, 0, 4);
  env.fishing.state = 'landing';
  tick(env, 1);
  eq(env.S.lampWatch, null, 'still waiting through the landing');
  env.fishing.state = 'idle';
  env.ctx.player.position.set(14, 0, 6);
  tick(env, 0.1);
  eq([env.S.lampWatch?.x, env.S.lampWatch?.z, env.count('lampwatch:start')], [14, 6, 1], 'anchored where the Wick stands when the fight ends');
}
{
  // the forced lamp-watch holds the raft within 10 m of the anchor (player.js leash): paddling and a shove both stop at the edge
  const env = makeEnv();
  const player = createPlayer(env.ctx);
  player.position.set(0, 0, 0);
  env.ctx.player = player;
  env.ctx.world = { collide() {} };
  const r = startRun(env, { nightMode: 'lantern' });
  player.init?.();
  player.position.set(5, 0, 5);
  tickTo(env, 'gloomtide', 2);
  env.S.damage(99, 'hand_slam');
  eq([env.S.lampWatch?.x, env.S.lampWatch?.z, env.S.lampWatch?.radius], [5, 5, 10], 'anchored at the raft (5, 5), r 10');
  env.ctx.input.move = { x: 1, y: 0 };
  for (let i = 0; i < 200; i++) { player.update(DT); env.S.update(DT, 0); }
  const d = Math.hypot(player.position.x - 5, player.position.z - 5);
  ok(d <= 10 + 1e-6 && d > 9, `paddling stops at the anchor's 10 m edge (d ${d.toFixed(3)})`);
  env.ctx.input.move = { x: 0, y: 0 };
  player.knock?.(player.position.x - 1, player.position.z, 30);
  for (let i = 0; i < 40; i++) player.update(DT);
  ok(Math.hypot(player.position.x - 5, player.position.z - 5) <= 10 + 1e-6, 'a shove cannot carry the raft past the anchor');
  tickTo(env, 'dawn', 2);
  eq(env.S.lampWatch, null, 'dawn releases the watch');
  env.ctx.input.move = { x: 1, y: 0 };
  for (let i = 0; i < 100; i++) player.update(DT);
  ok(Math.hypot(player.position.x - 5, player.position.z - 5) > 11, 'free to sail again at dawn');
  eq(r.hp, data.STATS.maxHp.base, 'Embers mended');
}
{
  // Gloomtide: Embers at 0 is today's death
  const env = makeEnv();
  startRun(env, { nightMode: 'gloomtide' });
  env.S.damage(99, 'hand_slam');
  eq([env.count('player:died'), env.last('player:died')?.cause, env.count('player:scorched')], [1, 'gloom', 0], "Gloomtide: Embers at 0 → player:died {cause: 'gloom'}");
}

// =====================================================================================
section('S3: satiety → Well-fed (no starvation)');
{
  const env = makeEnv({ wellFedStats: true });
  const r = startRun(env, { nightMode: 'lantern' });
  const s0 = r.satiety;
  tickTo(env, 'calm', 2);
  near(s0 - r.satiety, 0.1 * 0.5 * 330, 'satiety drains 0.10 × 0.5 × zone (16.5 on the 330 s day 1)', 0.1);
  const s1 = r.satiety;
  tickTo(env, 'calm', 3);
  near(s1 - r.satiety, 15, '15 per later Mossmere day', 0.1);
  // satiety 0 for a full day: no damage, no starvation, no hunger warning
  r.satiety = 0;
  const hp = r.hp;
  env.clear();
  tickTo(env, 'calm', 4);
  eq([r.hp, env.count('player:damage'), env.count('player:died')], [hp, 0, 0], 'satiety 0 for a full day causes no damage');
  eq([env.S.starving, env.S.getVitals().starving], [false, false], 'never starving');
  eq(env.events.filter((e) => e.evt === 'resource:low' && e.payload.resource === 'satiety').length, 0, 'no hunger warning in v3');
  // Well-fed at ≥ 60%
  r.satiety = 59.9;
  eq([env.S.wellFed, env.S.getVitals().wellFed], [false, false], 'satiety 59.9 is not Well-fed');
  r.satiety = 60;
  eq([env.S.wellFed, env.S.getVitals().wellFed], [true, true], 'satiety 60 shows Well-fed');
  // the stat effects (reelSpeed +0.08, sweetZone +0.01) ride getStats (progression folds them; this fake mirrors it)
  const st = env.ctx.progression.getStats(r);
  near(st.reelSpeed - data.STATS.reelSpeed.base, 0.08, 'Well-fed: reelSpeed +0.08');
  near(st.sweetZone - data.STATS.sweetZone.base, 0.01, 'Well-fed: sweetZone +0.01');
  eq(data.BALANCE.wellFed.effects, { reelSpeed: 0.08, sweetZone: 0.01 }, 'the data effects survival reports against');
  // progression's isWellFed() wins when it exists
  env.ctx.progression.isWellFed = () => false;
  eq(env.S.wellFed, false, "progression.isWellFed() is the authority when present");
  delete env.ctx.progression.isWellFed;
}
{
  // dawn mend: +1 when Well-fed in a combat mode only
  for (const [mode, want] of [['lantern', 2], ['still', 1]]) {
    const env = makeEnv();
    const r = startRun(env, { nightMode: mode });
    tickTo(env, 'gloomtide', 1);
    r.hp = 2; r.satiety = 90;
    tickTo(env, 'dawn', 1);
    eq(r.hp - 2, want, `${mode}: a Well-fed dawn mends ${want}`);
  }
}

// =====================================================================================
section('flag off and The Long Descent keep v1 survival');
{
  const env = makeEnv({ D: dataV1 });
  const r = startRun(env);
  tick(env, 1);
  near(env.S.getVitals().oilRate, 0.17 * 1.0 * 1.0 * 1.0, 'flag off: oil/s = oilDrain × oilPhase × zone × drainMult (calm, day 1)');
  near(env.S.getVitals().satietyRate, 0.10, 'flag off: satiety 0.10/s (no Well-fed halving)');
  eq([env.S.guttering, env.S.wellFed, env.S.lampWatch, env.S.nightMode, env.S.oilContext], [false, false, null, null, 'raft'], 'flag off: v3 getters are inert');
  ok(!('wellFed' in env.S.getVitals()), 'flag off: getVitals has no v3 keys');
  // Embers at 0 → death; oil 0 → Last Flicker → darkness ticks
  r.oil = 0.01; tick(env, 0.2); r.oil = 0.01; tick(env, 0.2);
  eq(env.count('lantern:out'), 1, 'flag off: lantern out after the flicker');
  tick(env, 3.2);
  eq(env.events.filter((e) => e.evt === 'player:damage' && e.payload.source === 'darkness').length, 1, 'flag off: darkness bites after 3 s');
  r.satiety = 0; tick(env, 5.2);
  eq(env.S.starving, true, 'flag off: starving at satiety 0');
  r.hp = 1; env.S.damage(1, 'gloomling', { ignoreIframes: true });
  eq(env.last('player:died')?.cause, 'gloom', 'flag off: Embers at 0 → player:died');
  eq(Object.keys(env.last('phase:change') || { phase: 0, prev: 0, day: 0 }).sort(), ['day', 'phase', 'prev'], 'flag off: phase:change payload is v1');
}
{
  const env = makeEnv();
  const r = startRun(env, { nightMode: 'gloomtide', outing: 'descent' });
  tick(env, 1);
  near(env.S.getVitals().oilRate, 0.17 * 1.0, 'The Long Descent: v1 oil (calm oilPhase 1.0)');
  r.satiety = 0; tick(env, 5.2);
  eq(env.S.starving, true, 'The Long Descent: v1 starvation');
  eq(env.S.guttering, false, 'The Long Descent: no guttering model');
}

console.log(`\nsurvival-v3: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
