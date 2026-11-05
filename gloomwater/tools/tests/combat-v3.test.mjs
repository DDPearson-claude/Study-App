// Unit tests for the v3 night modes in combat (DESIGN §25.5, §25.14.2 C1 / C3 / C4 / C6; CONTRACT §13.7 combat) with a
// fake ctx and the real combat module (enemies, Wardens, levels) running headless. Seeded where randomness matters.
//   node tools/tests/combat-v3.test.mjs        (or node tools/check.mjs)
// The flag-off half runs this same file in a child process with GW_COMBAT_V1=1 (data.js reads the flag at import).
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const V1 = process.env.GW_COMBAT_V1 === '1';
// a canvas-less DOM is enough for combat-fx's textures
const noop = new Proxy(function () {}, {
  get: (t, k) => (k === 'createLinearGradient' || k === 'createRadialGradient' ? () => ({ addColorStop() {} })
    : (k === 'getImageData' || k === 'createImageData') ? (w = 1, h = 1) => ({ data: new Uint8ClampedArray(Math.max(1, (w | 0) * (h | 0)) * 4) }) : noop),
  apply: () => undefined, set: () => true,
});
globalThis.document = globalThis.document || { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => noop }) };
globalThis.innerWidth = 960; globalThis.innerHeight = 540;
if (!V1) { globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; } else { globalThis.GW_V3 = false; }

const THREE = await import('three');
const data = await import('../../src/data.js');
const { createBus, defaultMeta } = await import('../../src/core.js');
const { create } = await import('../../src/combat.js');
const M = await import('../../src/combat-modes.js');

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
function near(a, b, msg, eps = 1e-6) { ok(Math.abs(a - b) <= eps, `${msg} (got ${a}, want ${b} ± ${eps})`); }
const section = (s) => console.log(`- ${s}`);

// seeded Math.random (combat rolls packs, kinds, rings and offers with it)
function seed(s) {
  let a = s >>> 0;
  Math.random = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const B = data.BALANCE;
const PHASES = ['calm', 'dusk', 'gloomtide', 'dawn'];
function makeEnv({ mode = 'lantern', outing = 'normal', day = 1, zone = 'mossmere', character = 'wick' } = {}) {
  const bus = createBus();
  const events = [];
  const clock = { phase: 'calm', day, time: 0, duration: 180 };
  const calls = { damage: [], addOil: [], knock: [], cancel: [], snag: [], slam: [], heal: [], pull: [] };
  const durs = { calm: 180, dusk: 20, gloomtide: 90, dawn: 10 };
  let uid = 1;
  const fish = (speciesId, extra = {}) => ({ uid: `f${uid++}`, speciesId, weight: 1, ...extra });
  const run = {
    id: `r${Math.random().toString(36).slice(2, 8)}`, zone, day, phase: 'calm', phaseTime: 0, oil: 100, hp: 5, satiety: 80, creel: [], boons: {}, flags: {},
    level: 1, xp: 0, xpNext: data.xpForLevel(1), character, stats: {}, active: true, legendaries: {},
    ...(V1 ? {} : { nightMode: mode, outing }),
  };
  const stats = Object.fromEntries(Object.entries(data.STATS).map(([k, d]) => [k, d.base]));
  const ui = { blocking: false, isBlocking() { return this.blocking; }, banner() {}, floatText() {}, damageNumber() {} };
  const ctx = {
    THREE, bus, data, state: { meta: defaultMeta(), run }, time: { dt: 0.05, gameDt: 0.05, t: 0, gameT: 0, frame: 0, timeScale: 1 },
    flow: 'playing', paused: false, cinematic: false, debug: {}, errors: [], isMobile: false, input: { move: { x: 0, y: 0 }, joy: { x: 0, y: 0 } },
    render: { scene: { add() {} }, camera: null, shake() {}, flash() {} },
    audio: { play() {} }, water: { addRipple() {}, splash() {}, getHeight: () => 0 },
    world: { isOpenWater: () => true, getDepth: () => 1, collide() {}, getObstacles: () => [], randomWaterPoint: () => null },
    player: {
      position: new THREE.Vector3(0, 0, 0), velocity: new THREE.Vector3(0, 0, 0),
      applyKnock(dx, dz) { calls.knock.push([dx, dz]); this.position.x += dx; this.position.z += dz; },
      pull(x, z, sp) { calls.pull.push([x, z, sp]); },
    },
    survival: {
      getPhaseInfo: () => ({ phase: clock.phase, day: clock.day, time: clock.time, duration: clock.duration, k: clock.time / clock.duration, isNight: clock.phase === 'gloomtide' }),
      damage(n, src) { calls.damage.push([n, src]); run.hp = Math.max(0, run.hp - n); return n; },
      addOil(n) { calls.addOil.push(n); run.oil = Math.max(0, Math.min(100, run.oil + n)); },
      heal(n) { calls.heal.push(n); }, isInvulnerable: () => false, addSatiety() {},
    },
    fishing: {
      state: 'idle', view: {}, bobberPos: null,
      cancel(r) { calls.cancel.push(r); this.state = 'lost'; }, slam() { calls.slam.push(1); },
      // fishing P1's signature: snag({lead, spike}); combat calls it with lead 0 at the moment its own telegraph ends
      snag({ lead = 1, spike = 0.2 } = {}) { calls.snag.push(lead === 0 ? spike : { lead, spike }); bus.emit('fishing:snag', { state: 'warn', lead, spike }); return true; },
    },
    progression: {
      getStats: () => stats, addShells() {}, isUnlocked: () => false, grantHeartwax: () => true,
      removeFromCreel(id) { const i = run.creel.findIndex((f) => f.uid === id); return i >= 0 ? run.creel.splice(i, 1)[0] : null; },
      addToCreel(f) { run.creel.push(f); return true; },
    },
    ui,
  };
  const origEmit = bus.emit.bind(bus);
  bus.emit = (evt, payload = {}) => { events.push({ evt, payload, phase: clock.phase, k: clock.time / clock.duration, day: clock.day }); return origEmit(evt, payload); };
  const combat = create(ctx);
  ctx.combat = combat;
  combat.init();
  bus.emit('run:start', { continued: false });
  const setPhase = (phase) => {
    const prev = clock.phase;
    clock.phase = phase; clock.time = 0; clock.duration = durs[phase]; run.phase = phase;
    bus.emit('phase:change', { phase, prev, day: clock.day });
  };
  const step = (dt = 0.05) => {
    ctx.time.dt = ctx.time.gameDt = dt; ctx.time.t += dt; ctx.time.gameT += dt; ctx.time.frame++;
    if (run.phase === 'gloomtide' || run.phase === clock.phase) clock.time = Math.min(clock.duration - 1e-3, clock.time + dt);
    combat.update(dt, ctx.time.t);
  };
  const runFor = (secs, dt = 0.05, each) => { for (let s = 0; s < secs - 1e-9; s += dt) { step(dt); each?.(); } };
  const toNight = (n) => { clock.day = n; run.day = n; setPhase('dusk'); runFor(1); setPhase('gloomtide'); };
  const count = (e) => events.filter((x) => x.evt === e).length;
  const of = (e) => events.filter((x) => x.evt === e);
  return { ctx, bus, run, clock, calls, events, combat, setPhase, step, runFor, toNight, count, of, fish, ui, stats };
}
const spawnsIn = (env, from = 0) => env.events.slice(from).filter((x) => x.evt === 'enemy:spawn');

if (V1) {
  // ------------------------------------------------------------------ flag off: every v1 rule, untouched
  section('flag off: v1 behaviour (no night modes)');
  seed(7);
  const env = makeEnv({ day: 1 });
  eq(data.V3_ENABLED, false, 'the flag is off');
  eq(env.combat.nightMode, null, 'nightMode getter is null in v1');
  env.toNight(1);
  const e0 = env.events.length;
  env.runFor(80);
  ok(spawnsIn(env, e0).length > 0, 'night 1 spawns a swarm (v1 Gloomtide every night)');
  ok(!env.events.some((x) => x.evt === 'swarm:window' || x.evt === 'levelup:banked'), 'no v3 events in v1');
  // level-ups open at once, also while a line is out
  env.ctx.fishing.state = 'reeling';
  env.combat.addXp(500);
  env.step();
  ok(env.count('levelup') >= 1 && !!env.combat.pendingOptions, 'v1: a level-up opens at once (even with a line out)');
  // knockback and snaps while hooked are v1's
  const k0 = env.calls.knock.length;
  env.ctx.debug.spawn('drowned_hand', 1);
  const hand = env.combat.enemies.find((e) => e.enemyId === 'drowned_hand');
  if (hand) { hand.state = 'slam'; hand.stateT = 0.3; hand.n = 0; hand.position.set(0, 0, 0); }
  env.runFor(0.2);
  ok(env.calls.knock.length > k0, 'v1: a slam knocks the raft while hooked');
  ok(env.calls.cancel.includes('snap'), 'v1: a slam snaps a normal line');
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

// ====================================================================== v3 on (phase 1)
section('data and helpers');
eq(data.V3_ENABLED, true, 'the v3 flag is on'); eq(data.V3_PHASE, 1, 'phase 1');
ok(!!M.nightModes(B), 'BALANCE.nightModes merged');
eq(M.modeOf({ nightMode: 'lantern', outing: 'first' }, B), 'still', 'the First Outing is all still');
eq(M.modeOf({ nightMode: 'lantern', outing: 'descent' }, B), null, 'The Long Descent keeps v1 rules');
eq(M.modeOf({ outing: 'normal' }, B), 'gloomtide', 'a run without a mode plays v1 nights');
eq(M.windowTonight({ mode: 'lantern', night: 1, B, data, nightDur: 90 }), null, 'Lantern: no swarm on odd nights');
eq(M.windowTonight({ mode: 'lantern', night: 2, B, data, nightDur: 90 }), { k0: 0.05, k1: 0.5, start: 0.05, end: 0.5 }, 'Lantern night 2: k 0.05 → 0.50');
eq(M.windowTonight({ mode: 'still', night: 2, B, data, nightDur: 90 }), null, 'Still: never');
eq(M.windowTonight({ mode: 'lantern', night: 2, outing: 'first', B, data, nightDur: 90 }), null, 'First Outing: never');
eq(M.windowTonight({ mode: 'gloomtide', night: 1, B, data, nightDur: 96 }), { k0: 0, k1: 1, start: 0, end: 1 }, 'Gloomtide: the whole night');
near(M.quietTailK('lantern', B, 90), 0.5, 'the last 45 s of a 90 s night are quiet');
eq([2, 4, 6, 8, 10, 12].filter((n) => M.wardenTonight('lantern', n, 'normal', B, data, null)), [4, 8, 12], 'Lantern Wardens: every 2nd swarm night (4, 8, …)');
eq([1, 2, 3, 5].filter((n) => M.wardenTonight('lantern', n, 'normal', B, data, null)), [], 'no Lantern Warden on 1, 2, 3, 5');
eq(M.restartWindow({ k0: 0.05, k1: 0.5, start: 0.05, end: 0.5 }, 0.2, 'lantern', B, 90), { k0: 0.05, k1: 0.5, start: 0.2, end: 0.5 }, 'leaving a lamp-watch at k 0.2: the window runs 0.2 → 0.5 (quiet tail)');
eq(M.restartWindow({ k0: 0.05, k1: 0.5, start: 0.05, end: 0.5 }, 0.6, 'lantern', B, 90), null, 'leaving it in the quiet tail: no swarm tonight');
eq(M.anglerAllowance(1, B), 3, 'Angler cap day 1 = 3 (the Still rate)'); eq(M.anglerAllowance(4, B), 7, 'day 4 = 3+2+1+1');

section('C1 Still spawns nothing (every phase, every night)');
seed(11);
{
  const env = makeEnv({ mode: 'still', day: 1 });
  eq(env.combat.nightMode, 'still', 'nightMode getter');
  for (const n of [1, 2, 3, 4]) {
    env.clock.day = n; env.run.day = n;
    env.setPhase('calm'); env.runFor(20); env.setPhase('dusk'); env.runFor(20); env.setPhase('gloomtide'); env.runFor(89.9); env.setPhase('dawn'); env.runFor(10);
  }
  eq(env.count('enemy:spawn'), 0, 'no enemy spawned over 4 Still days');
  eq(env.count('swarm:window'), 0, 'no swarm window opened');
  eq(env.combat.swarmActive, false, 'swarmActive false');
}

section('C1 the First Outing (run 1) is all still, whatever the mode');
seed(12);
{
  const env = makeEnv({ mode: 'lantern', outing: 'first', day: 2 });
  eq(env.combat.nightMode, 'still', 'reads still');
  env.toNight(2); env.runFor(89.9);
  env.clock.day = 3; env.run.day = 3; env.setPhase('calm'); env.runFor(5); env.toNight(4); env.runFor(89.9);
  eq(env.count('enemy:spawn'), 0, 'nights 2 and 4 of the First Outing spawn nothing');
}

section('C1 Lantern: even nights only, inside k 0.05 → 0.50, at the scaled rates');
seed(13);
{
  const env = makeEnv({ mode: 'lantern', day: 1 });
  env.toNight(1); env.runFor(89.9);
  eq(env.count('enemy:spawn'), 0, 'night 1 (odd): nothing');
  env.clock.day = 2; env.run.day = 2; env.setPhase('dawn'); env.runFor(10); env.setPhase('calm'); env.runFor(10);
  eq(env.count('enemy:spawn'), 0, 'calm: no raids in Lantern');
  env.setPhase('dusk'); env.runFor(20);
  eq(env.count('enemy:spawn'), 0, 'dusk: no scouts in Lantern');
  const e0 = env.events.length;
  env.setPhase('gloomtide');
  let diffSeen = null, aliveAfter = -1, ks = [];
  env.runFor(89.9, 0.05, () => {
    const k = env.clock.time / env.clock.duration;
    if (!diffSeen && env.combat.swarmActive) {
      const v = env.ctx.debug.combatV3();
      const raw = data.difficultyFor(2, 0, M.windowK(v.window, k), { nightInZone: 2 });
      diffSeen = { v: v.diff, raw };
    }
    if (k > 0.52 && aliveAfter < 0) aliveAfter = env.combat.enemies.filter((e) => e.alive).length;
  });
  for (const s of spawnsIn(env, e0)) ks.push(s.k);
  ok(ks.length > 0, `Lantern night 2 spawns (${ks.length} spawn events)`);
  ok(ks.every((k) => k >= 0.05 - 1e-3 && k < 0.5 + 1e-3), `every spawn inside k 0.05 → 0.50 (k ${Math.min(...ks).toFixed(3)} → ${Math.max(...ks).toFixed(3)})`);
  const win = env.of('swarm:window');
  eq(win.map((w) => w.payload.state), ['open', 'close'], 'swarm:window open then close');
  ok(Math.abs(win[0].k - 0.05) < 0.01 && Math.abs(win[1].k - 0.5) < 0.01, `window opened at k ${win[0].k.toFixed(3)} and closed at k ${win[1].k.toFixed(3)}`);
  eq(aliveAfter, 0, 'the swarm withdraws when the window closes (the quiet 45 s)');
  if (diffSeen) {
    const m = B.nightModes.lantern.mult;
    near(diffSeen.v.spawnRate, diffSeen.raw.spawnRate * m.spawnRate, 'spawnRate × 0.55', 1e-3);
    near(diffSeen.v.hpMult, diffSeen.raw.hpMult * m.hpMult, 'hpMult × 0.8', 1e-3);
    eq(diffSeen.v.maxAlive, Math.max(1, Math.round(diffSeen.raw.maxAlive * m.maxAlive)), 'maxAlive × 0.6');
    eq(diffSeen.v.eliteEvery, diffSeen.raw.heat < 3 ? 0 : diffSeen.raw.eliteEvery * 2, 'elites: none below Heat 3, else interval × 2');
    ok((diffSeen.v.formationAt || []).length <= 1, 'one formation per swarm');
  } else ok(false, 'the director ran with a window');
}

section('C1 Lantern Wardens: nights 4 and 8 at hp × 0.75, withdrawing with the window');
for (const n of [4, 6, 8]) {
  seed(20 + n);
  const env = makeEnv({ mode: 'lantern', day: n });
  env.run.flags.zoneEnteredDay = 1;
  env.toNight(n);
  let boss = null, bossHp = 0, withdrew = false;
  env.runFor(89.9, 0.05, () => {
    const b = env.combat.getBoss?.();
    if (b && !boss) { boss = b; bossHp = b.maxHp; }
    if (boss && boss.state === 'withdraw') withdrew = true;
  });
  if (n === 6) { eq(boss, null, 'night 6: no Warden (3rd swarm night)'); continue; }
  ok(!!boss, `night ${n}: a Warden rises`);
  if (boss) {
    const raw = data.difficultyFor(n, 0, 0.5, { nightInZone: n });
    const want = data.ENEMY_BY_ID[boss.enemyId].hp * (raw.bossHpMult ?? raw.hpMult) * B.nightModes.lantern.wardens.hpMult;
    near(bossHp, want, `night ${n}: Warden hp = hp × bossHpMult × 0.75`, 0.5);
    eq(boss.enemyId, data.ZONE_BY_ID.mossmere.warden, 'the lake\'s Warden');
    ok(withdrew || !boss.alive, `night ${n}: it withdraws when the window closes`);
  }
}

section('C1 Gloomtide stays today\'s night (whole night, calm raids, Warden night 3)');
seed(31);
{
  const env = makeEnv({ mode: 'gloomtide', day: 3 });
  env.run.flags.zoneEnteredDay = 1;
  env.toNight(3);
  const e0 = env.events.length;
  let boss = null;
  env.runFor(89, 0.05, () => { boss = boss || env.combat.getBoss?.(); });
  const ks = spawnsIn(env, e0).map((s) => s.k);
  ok(ks.length > 0 && Math.max(...ks) > 0.6, `spawns run past k 0.6 (max ${Math.max(...ks).toFixed(2)})`);
  ok(!!boss, 'night 3: the Warden rises (v1 cadence)');
  eq(env.combat.swarmTonight, true, 'swarmTonight');
}

section('C1 lamp-watch: no swarm while it holds; leaving starts the window at the current k');
seed(41);
{
  const env = makeEnv({ mode: 'lantern', day: 2 });
  env.toNight(2);
  env.run.lampWatch = { lampId: 'se_buoy', x: 19.8, z: 37.8, forced: false };
  env.bus.emit('lampwatch:start', { lampId: 'se_buoy', zone: 'mossmere', forced: false });
  const e0 = env.events.length;
  env.runFor(18);   // k ≈ 0.2
  eq(spawnsIn(env, e0).length, 0, 'no spawn while the lamp-watch holds');
  eq(env.combat.swarmTonight, false, 'swarmTonight false during the watch');
  const kLeave = env.clock.time / env.clock.duration;
  env.run.lampWatch = null;
  env.bus.emit('lampwatch:end', { lampId: 'se_buoy', zone: 'mossmere', forced: false });
  env.runFor(71.9);
  const sp = spawnsIn(env, e0);
  const ks = sp.map((s) => s.k);
  ok(ks.length > 0, `the swarm comes after the watch is left (${ks.length} spawns)`);
  ok(ks.every((k) => k >= kLeave - 1e-3 && k < 0.5 + 1e-3), `spawns from the leave point k ${kLeave.toFixed(3)} to 0.5`);
  const open = env.of('swarm:window').find((w) => w.payload.state === 'open');
  ok(open && Math.abs(open.k - kLeave) < 0.01, 'the window opened at the current k');
}
{
  seed(42);
  const env = makeEnv({ mode: 'lantern', day: 2 });
  env.toNight(2);
  env.run.lampWatch = { lampId: 'w_buoy', x: -46.7, z: 10.1, forced: false };
  env.runFor(89.9);
  eq(env.count('enemy:spawn'), 0, 'a watch kept all night: no swarm');
  // no Cinders during a watch
  env.ctx.debug.spawn('gloomling', 1);
  const g = env.combat.enemies[0];
  if (g) g.hp = 0.01;
  env.ctx.debug.killAll();
  eq(env.ctx.debug.combat().cinders, 0, 'no Cinders drop during a lamp-watch');
}

section('C6 Lantern threat model: fodder → oil, Embers only from telegraphed hits');
seed(51);
{
  const env = makeEnv({ mode: 'lantern', day: 2 });
  env.toNight(2); env.runFor(5);
  const g = env.ctx.debug.spawn('gloomling', 1, 6)[0];
  ok(!!g, 'a gloomling');
  const d0 = env.calls.damage.length, o0 = env.calls.addOil.length;
  if (g) { g.position.set(0.5, 0, 0.3); g.spawnT = 0; g.state = 'move'; }
  env.runFor(0.3);
  eq(env.calls.damage.length - d0, 0, 'fodder contact costs no Embers in Lantern');
  ok(env.calls.addOil.slice(o0).some((n) => n < 0), 'fodder contact drains oil');
  // a hand slam is telegraphed: it costs Embers (but never snaps, see below)
  env.ctx.debug.spawn('drowned_hand', 1);
  const hand = env.combat.enemies.find((e) => e.enemyId === 'drowned_hand');
  if (hand) { hand.state = 'slam'; hand.stateT = 0.3; hand.n = 0; hand.position.set(0, 0, 0); }
  const d1 = env.calls.damage.length;
  env.runFor(0.2);
  ok(env.calls.damage.length > d1, 'a telegraphed hand slam costs Embers');
}
{
  seed(52);
  const env = makeEnv({ mode: 'gloomtide', day: 2 });
  env.toNight(2); env.runFor(5);
  const g = env.ctx.debug.spawn('gloomling', 1, 6)[0];
  const d0 = env.calls.damage.length;
  if (g) { g.position.set(0.5, 0, 0.3); g.spawnT = 0; g.state = 'move'; }
  env.runFor(0.3);
  ok(env.calls.damage.length > d0, 'Gloomtide: contact costs Embers as today');
}

section('C6 the hard rule: a slam / shove while reeling moves nothing and snaps nothing (Still, Lantern); C7 the anchor holds in Gloomtide too');
for (const mode of ['lantern', 'still', 'gloomtide']) {
  seed(61);
  const env = makeEnv({ mode, day: 2 });
  env.toNight(2); env.runFor(3);
  env.ctx.fishing.state = 'reeling'; env.ctx.fishing.view = { speciesId: 'dusk_minnow', rarity: 'common' };
  env.ctx.debug.spawn('drowned_hand', 1);
  const hand = env.combat.enemies.find((e) => e.enemyId === 'drowned_hand');
  if (hand) { hand.state = 'slam'; hand.stateT = 0.3; hand.n = 0; hand.position.set(0.3, 0, 0.2); }
  const p0 = env.ctx.player.position.clone();
  env.runFor(0.2);
  // a lingering hand's push in the same fight
  env.combat.enemies.forEach((e) => { if (e.enemyId === 'drowned_hand') { e.state = 'linger'; e.stateT = 0; e.position.set(0.2, 0, 0.1); } });
  env.runFor(0.3);
  const moved = env.ctx.player.position.distanceTo(p0);
  if (mode === 'gloomtide') {
    // C7 (DESIGN §25.0.2c, the anchor in every mode): the slam costs Embers and (on P1's manual reel, no partLine) snaps the
    // line, but nothing moves the raft while a fish is on
    eq(env.calls.knock.length, 0, 'Gloomtide (C7 the anchor): no knockback while reeling');
    near(moved, 0, 'Gloomtide (C7 the anchor): the raft did not move', 1e-9);
    ok(env.calls.cancel.includes('snap'), 'Gloomtide: the slam snaps a normal line (P1 fishing without partLine)');
  } else {
    eq(env.calls.knock.length, 0, `${mode}: no knockback while reeling`);
    near(moved, 0, `${mode}: the raft did not move (slam knock, linger push)`, 1e-9);
    ok(!env.calls.cancel.includes('snap'), `${mode}: the slam never snaps the line`);
  }
}
for (const mode of ['lantern', 'gloomtide']) {
  // a Bell-Jar Tick (Bulwark) shove while a fish is being landed, then with no fish on the line
  seed(62);
  const env = makeEnv({ mode, day: 8, zone: 'sporewood' });
  env.toNight(8); env.runFor(6);
  env.ctx.debug.killAll();
  env.ctx.fishing.state = 'landing';
  const e = env.ctx.debug.spawn('belljar_tick', 1, 6)[0];
  ok(e?.behavior === 'bulwark', `${mode}: a Bulwark (${e?.enemyId})`);
  const o0 = env.calls.addOil.length;
  if (e) { e.position.set(0.6, 0, 0); e.spawnT = 0; e.contactCd = 0; }
  env.runFor(0.1);
  ok(env.calls.addOil.length > o0, `${mode}: it made contact (oil drained)`);
  eq(env.calls.knock.length, 0, `${mode}: the shove does not move the raft while landing (C7: the anchor in every mode)`);
  env.ctx.fishing.state = 'idle';
  const k0 = env.calls.knock.length;
  env.ctx.player.position.set(0, 0, 0);
  if (e?.alive) { e.position.set(0.6, 0, 0); e.contactCd = 0; }
  env.runFor(0.1);
  ok(env.calls.knock.length > k0, `${mode}: with no fish hooked the shove knocks as today`);
}
{
  seed(63);
  const env = makeEnv({ mode: 'lantern', day: 2 });
  env.toNight(2); env.runFor(3);
  env.ctx.fishing.state = 'reeling';
  eq(env.combat.onPointerDown(new THREE.Vector2(0, 0)), false, 'Lantern: a tap while hooked is not combat\'s (the reel keeps it)');
}

section('C6 creelsnatch: never acts while hooked (Still / Lantern), never takes a marked fish or a legendary');
for (const mode of ['lantern', 'gloomtide']) {
  seed(71);
  const env = makeEnv({ mode, day: 3 });
  env.toNight(4);
  env.run.creel.push(env.fish('dusk_minnow'), env.fish('reed_perch'));
  env.ctx.fishing.state = 'reeling';
  const c = env.ctx.debug.spawn('creelsnatch', 1, 8)[0];
  let surfaced = false;
  env.runFor(20, 0.05, () => { if (c && (c.state === 'surface' || c.state === 'leap')) surfaced = true; });
  if (mode === 'lantern') {
    eq(surfaced, false, 'Lantern: it keeps circling while a fish is hooked');
    eq(env.run.creel.length, 2, 'Lantern: nothing stolen while hooked');
    env.ctx.fishing.state = 'idle';
    let s2 = false;
    env.runFor(20, 0.05, () => { if (c && (c.state === 'surface' || c.state === 'leap')) s2 = true; });
    ok(s2 || !c?.alive, 'Lantern: once the fight is over it may act again');
  } else ok(surfaced || !c?.alive, 'Gloomtide: it acts while hooked (today)');
}
{
  seed(72);
  const env = makeEnv({ mode: 'gloomtide', day: 3 });
  env.run.creel.push(env.fish('dusk_minnow', { marked: true }), env.fish('lantern_swallower'));
  env.run.marked = [{ uid: 'x1' }];
  env.run.creel.push(env.fish('reed_perch', { uid: 'x1' }));
  const taken = [];
  const sp = (id) => data.SPECIES_BY_ID[id];
  for (const f of env.run.creel) taken.push(M.stealable(f, { run: env.run, speciesOf: sp }));
  eq(taken, [false, false, false], 'marked (flag or run.marked) and legendary fish are theft-proof');
  // a creelsnatch leap with only theft-proof fish aboard takes nothing (every mode)
  env.toNight(3); env.runFor(2);
  const c = env.ctx.debug.spawn('creelsnatch', 1, 8)[0];
  let leapt = false;
  env.runFor(25, 0.05, () => { if (c?.state === 'leap') leapt = true; });
  ok(leapt, 'the creelsnatch leapt at the raft');
  eq(env.run.creel.length, 3, 'nothing was taken');
  ok(!env.events.some((x) => x.evt === 'enemy:steal'), 'no enemy:steal');
}

section('C6 Scorched: the swarm withdraws for the night, no Cinders, the run goes on');
seed(81);
{
  const env = makeEnv({ mode: 'lantern', day: 2 });
  env.toNight(2); env.runFor(14);   // k ≈ 0.16, window open
  ok(env.combat.swarmActive, 'the window is open');
  env.ctx.debug.spawn('gloomling', 4, 9);
  const alive0 = env.combat.enemies.filter((e) => e.alive).length;
  ok(alive0 > 0, 'a swarm is up');
  env.run.scorched = { night: 2, x: 0, z: 0 };
  env.run.lampWatch = { lampId: null, x: 0, z: 0, forced: true };
  env.bus.emit('player:scorched', { night: 2, x: 0, z: 0 });
  const e0 = env.events.length;
  env.runFor(3);
  eq(env.combat.enemies.filter((e) => e.alive).length, 0, 'every gloomling withdrew');
  const close = env.of('swarm:window').pop();
  eq(close?.payload?.reason, 'scorched', 'swarm:window close (scorched)');
  env.runFor(30);   // still inside k 0.05 → 0.5
  eq(spawnsIn(env, e0).length, 0, 'nothing spawns again before dawn');
  eq(env.ctx.debug.combat().cinders, 0, 'no Cinders on the water');
  eq(env.ctx.flow, 'playing', 'the run continues');
  eq(env.combat.swarmTonight, false, 'swarmTonight false for the rest of the night');
}

section('C3 banked level-ups: never a modal while moving or with a line out');
seed(91);
{
  const env = makeEnv({ mode: 'lantern', day: 1 });
  env.runFor(1);
  env.ctx.fishing.state = 'waiting';
  env.combat.addXp(60, { modeApplied: true });
  env.runFor(1);
  ok((env.run.levelBank | 0) > 0, `a level-up while fishing is banked (bank ${env.run.levelBank})`);
  eq(env.count('levelup'), 0, 'no levelup modal event');
  eq(env.combat.pendingOptions, null, 'no pending pick');
  ok(env.count('levelup:banked') > 0, 'levelup:banked emitted');
  eq(env.combat.bankedLevels, env.run.levelBank, 'bankedLevels getter');
  // the measuring card: fish:landed, then the next safe frame offers the pick
  env.ctx.fishing.state = 'landing';
  env.bus.emit('fish:landed', { fish: env.fish('dusk_minnow'), species: data.SPECIES_BY_ID.dusk_minnow, xp: 3 });
  env.ui.blocking = true; env.runFor(0.5);
  eq(env.combat.pendingOptions, null, 'nothing opens under the card');
  env.ui.blocking = false; env.ctx.fishing.state = 'idle';
  env.runFor(0.2);
  const lu = env.of('levelup').pop();
  ok(!!env.combat.pendingOptions && lu?.payload?.banked === true, 'after the card the banked pick is offered');
  const bank0 = env.run.levelBank | 0;
  env.combat.chooseBoon(env.combat.pendingOptions[0].boonId);
  eq(env.run.levelBank | 0, bank0 - 1, 'choosing it spends one banked level');
}
{
  seed(92);
  const env = makeEnv({ mode: 'lantern', day: 2 });
  env.toNight(2); env.runFor(10);   // window open
  ok(env.combat.swarmActive, 'inside the swarm');
  env.ctx.fishing.state = 'reeling';
  env.combat.addXp(60, { modeApplied: true });
  env.runFor(2);
  eq(env.count('levelup'), 0, 'a swarm level-up waits while the line is out');
  env.ctx.fishing.state = 'idle';
  env.ctx.player.velocity.set(4, 0, 0); env.ctx.player.position.set(0, 0, 0);
  env.runFor(0.5, 0.05, () => { env.ctx.player.position.x += 0.2; });
  eq(env.count('levelup'), 0, 'and while the raft moves');
  env.ctx.player.velocity.set(0, 0, 0);
  // the measuring ceremony (ctx.cinematic; main gives combat dt 0) never shows a pick either
  env.ctx.cinematic = true;
  env.runFor(0.5);   // (dt > 0 here so the raft speed reads 0: only the ceremony holds the pick)
  for (let i = 0; i < 10; i++) { env.ctx.time.frame++; env.combat.update(0, env.ctx.time.t); }
  eq(env.ctx.debug.combatV3().modalOk, false, 'modalOk is false during the ceremony');
  eq(env.count('levelup'), 0, 'and no pick opens during the ceremony');
  env.ctx.cinematic = false;
  env.runFor(0.5);
  ok(env.count('levelup') > 0 && !!env.combat.pendingOptions, 'still and line in: the swarm pick opens at once');
  while (env.combat.pendingOptions) env.combat.chooseBoon(env.combat.pendingOptions[0].boonId);
  // queued swarm picks that never opened go to the bank when the window closes
  env.ctx.fishing.state = 'reeling';
  env.combat.addXp(200, { modeApplied: true });
  const q = env.ctx.debug.combatV3().queued;
  ok(q > 0, `swarm picks queued while hooked (${q})`);
  env.runFor(40);   // past k 0.5
  eq(env.ctx.debug.combatV3().queued, 0, 'the window closed: nothing left in the queue');
  ok((env.run.levelBank | 0) >= q, 'they wait in the bank');
  // the dawn bell offers them when it is safe
  env.ctx.fishing.state = 'idle';
  env.setPhase('dawn'); env.runFor(0.3);
  ok(!!env.combat.pendingOptions && env.of('levelup').pop()?.payload?.banked === true, 'the dawn bell offers a banked pick');
}
{
  seed(93);
  const env = makeEnv({ mode: 'still', day: 1 });
  env.ctx.fishing.state = 'charging';
  env.combat.addXp(60, { modeApplied: true });
  env.setPhase('dawn'); env.runFor(9);
  eq(env.combat.pendingOptions, null, 'dawn with a line out: no modal');
  // the ui path: offerBanked on the card
  env.ctx.fishing.state = 'landing';
  const opts = env.combat.offerBanked();
  ok(Array.isArray(opts) && opts.length > 0, 'offerBanked() returns the banked offer for the card');
  eq(env.combat.offerBanked(), opts, 'idempotent while that offer is open');
}

section('C3 offer pools: Still = Angler pool only; the Angler cap; Lantern weapons from the first swarm night');
seed(101);
{
  const env = makeEnv({ mode: 'still', day: 1 });
  const seen = new Set();
  let allAngler = true;
  for (let i = 0; i < 80; i++) {
    env.run.levelBank = 1;
    const o = env.combat.offerBanked();
    for (const x of o || []) { seen.add(x.boonId); if (!x.fallback && !M.isAngler(data.BOON_BY_ID[x.boonId], data)) allAngler = false; }
    env.combat.skip();
    env.run.boons = {};
  }
  ok(allAngler, `Still offers only Angler-pool Boons (${seen.size} different seen)`);
  ok([...seen].some((id) => data.BOONS_V3.some((b) => b.id === id)), 'the new Angler boons are offered');
}
{
  seed(102);
  const env = makeEnv({ mode: 'lantern', day: 1 });
  // three Angler picks already on day 1 = the Still rate: no more Angler offers today
  env.run.boons = { steady_reel: 1, lucky_knot: 1, long_cast: 1 };
  let angler = 0, weapons = 0;
  for (let i = 0; i < 60; i++) {
    env.run.levelBank = 1;
    const o = env.combat.offerBanked() || [];
    for (const x of o) { const b = data.BOON_BY_ID[x.boonId]; if (M.isAngler(b, data)) angler++; if (b?.kind === 'weapon') weapons++; }
    env.combat.skip();
  }
  eq(angler, 0, 'Lantern day 1 with 3 Angler picks: Angler offers capped');
  eq(weapons, 0, 'Lantern before its first swarm night: no weapons offered');
  env.clock.day = 2; env.run.day = 2;
  env.run.flags.swarmSeen = true;
  let a2 = 0, w2 = 0;
  for (let i = 0; i < 60; i++) {
    env.run.levelBank = 1;
    const o = env.combat.offerBanked() || [];
    for (const x of o) { const b = data.BOON_BY_ID[x.boonId]; if (M.isAngler(b, data)) a2++; if (b?.kind === 'weapon') w2++; }
    env.combat.skip();
  }
  ok(a2 > 0, `day 2 (cap 5): Angler offers return (${a2})`);
  ok(w2 > 0, `after the first swarm night weapons join (${w2})`);
}

section('C3 XP per mode');
{
  const env = makeEnv({ mode: 'still', day: 1, zone: 'sporewood' });
  env.run.xpNext = 1000;
  const sp = data.SPECIES.find((s) => s.zone === 'sporewood' && s.rarity === 'rare');
  const n = data.fishXpFor(sp.rarity, 1);
  ok(n !== data.fishXpFor(sp.rarity, 0), `the zone factor matters for a Sporewood ${sp.rarity} (${n} vs ${data.fishXpFor(sp.rarity, 0)})`);
  env.bus.emit('fish:landed', { fish: { uid: 'q', speciesId: sp.id }, species: sp, xp: n });
  env.combat.addXp(n);
  // C7 (automatic fishing): fish XP also takes the lake's economy normaliser (CATCH_V3.economy.norm; combat owns it)
  const NORM = data.CATCH_V3.economy.norm;
  eq(env.run.xp, Math.max(1, Math.round(data.fishXpFor(sp.rarity, 0) * 1.4 * NORM.sporewood)), 'Still: fish XP × 1.4 with no zone factor (progression did not apply it), × the Sporewood norm');
  const env2 = makeEnv({ mode: 'still', day: 1 });
  env2.run.xpNext = 1000;
  env2.combat.addXp(7, { source: 'fish', modeApplied: true });
  eq(env2.run.xp, Math.round(7 * NORM.mossmere), 'modeApplied: the mode taken as given (progression applied it); × the Mossmere norm (C7)');
  const env3 = makeEnv({ mode: 'lantern', day: 1, zone: 'sporewood' });
  env3.run.xpNext = 1000;
  env3.bus.emit('fish:landed', { fish: { uid: 'q', speciesId: sp.id }, species: sp, xp: n });
  env3.combat.addXp(n);
  eq(env3.run.xp, Math.max(1, Math.round(n * NORM.sporewood)), 'Lantern: fish XP × 1.0 with the zone factor, × the Sporewood norm');
  // discovery: +4 per new place under the shared 12 a day
  const env4 = makeEnv({ mode: 'lantern', day: 1 });
  env4.run.xpNext = 1000;
  env4.run.flags.discoveryXp = { day: 1, n: 10 };
  env4.bus.emit('place:discover', { id: 'p', first: true });
  eq(env4.run.xp, 2, 'a new place gives +4, capped at 12 a day (10 already banked → +2)');
  env4.bus.emit('place:discover', { id: 'q', first: true });
  eq(env4.run.xp, 2, 'the cap holds');
}

section('C3 the new Angler boons: stats through getStats, procs through boonProcs');
{
  const env = makeEnv({ mode: 'lantern', day: 1 });
  eq(data.BOONS_V3.map((b) => b.id), ['long_cast', 'patient_line', 'feather_touch', 'night_eyes', 'wanderers_stride', 'quiet_hands'], 'the 6 new Angler boons are in the build');
  ok(data.BOONS_V3.every((b) => data.BOON_BY_ID[b.id] && M.isAngler(data.BOON_BY_ID[b.id], data)), 'each is offered as an Angler boon');
  env.run.boons = { night_eyes: 1, quiet_hands: 1, wanderers_stride: 2 };
  eq(env.combat.boonProcs('night'), { glowTrailRangeMult: 1.5, nightBiteSpeed: 0.1 }, 'Night Eyes at night');
  eq(env.combat.boonProcs('cast'), { cleanAt: 0.88 }, 'Quiet Hands on a cast');
  eq(env.combat.boonProcs('foot'), { footOilMult: 0.8 }, "Wanderer's Stride II on foot");
}

section('C4 legend snags in Still / Lantern; Gloomtide unchanged');
for (const mode of ['lantern', 'still']) {
  seed(111);
  const env = makeEnv({ mode, day: 2, zone: 'paleabyss' });
  env.toNight(2); env.runFor(6);   // a Lantern window is open
  env.ctx.fishing.state = 'reeling';
  env.ctx.fishing.view = { speciesId: 'lantern_swallower', rarity: 'legendary' };
  env.ctx.fishing.bobberPos = new THREE.Vector3(0, 0, -14);
  env.bus.emit('fishing:hook', { speciesId: 'lantern_swallower' });
  const e0 = env.events.length;
  const before = env.combat.enemies.length;
  const r1 = env.combat.spawnEnemy('drowned_hand', env.ctx.player.position, { force: true, zoneMod: 'paleabyss', scripted: true, source: 'legendary' });
  ok(r1 && r1.snag === true, `${mode}: Grasping Dark's 1st summon is a snag`);
  env.runFor(0.9);
  eq(env.calls.snag.length, 0, `${mode}: the snag is telegraphed ≥ 0.9 s before it hits`);
  env.runFor(0.2);
  eq(env.calls.snag, [0.2], `${mode}: then a +0.2 tension spike`);
  env.runFor(3);
  const r2 = env.combat.spawnEnemy('drowned_hand', env.ctx.player.position, { force: true, zoneMod: 'paleabyss', scripted: true, source: 'legendary' });
  ok(r2?.snag === true, `${mode}: the 2nd summon is the 2nd snag`);
  env.runFor(1.2);
  eq(env.calls.snag, [0.2, 0.2], `${mode}: two snags`);
  const r3 = env.combat.spawnEnemy('drowned_hand', env.ctx.player.position, { force: true, scripted: true, source: 'legendary' });
  ok(r3?.suppressed === true, `${mode}: no third`);
  eq(env.combat.enemies.length - before, 0, `${mode}: no hand spawned`);
  eq(spawnsIn(env, e0).length, 0, `${mode}: and no swarm spawn while the Swallower is on the line`);
  eq(env.of('legend:snag').map((x) => x.payload.phase), ['warn', 'hit', 'warn', 'hit'], `${mode}: legend:snag warn → hit, twice`);
  const s0 = env.of('legend:snag');
  near(s0[1].payload.x, s0[0].payload.x, 'the snag hits where it was telegraphed', 1e-9);
  // fishing ran the snag itself (its summon rule): combat only draws the hand, it never spikes a second time
  env.runFor(1);   // the 2nd snag's sink has played out
  env.ctx.fishing.state = 'reeling';
  const c0 = env.calls.snag.length;
  env.bus.emit('fishing:snag', { state: 'warn', lead: 1, spike: 0.2 });
  eq(env.ctx.debug.combatV3().snags.length, 1, `${mode}: a fishing-owned snag gets the hand telegraph`);
  env.runFor(1.5);
  eq(env.calls.snag.length - c0, 0, `${mode}: and no second spike from combat`);
}
{
  seed(112);
  const env = makeEnv({ mode: 'gloomtide', day: 2, zone: 'paleabyss' });
  env.toNight(2); env.runFor(2);
  env.ctx.fishing.state = 'reeling';
  env.ctx.fishing.view = { speciesId: 'lantern_swallower', rarity: 'legendary' };
  const n0 = env.combat.enemies.length;
  const r = env.combat.spawnEnemy('drowned_hand', env.ctx.player.position, { force: true, zoneMod: 'paleabyss', scripted: true, source: 'legendary' });
  ok(r && r.enemyId === 'drowned_hand' && !r.snag, 'Gloomtide: Grasping Dark summons a real hand (unchanged)');
  ok(env.combat.enemies.length > n0, 'Gloomtide: it is in the fight');
}
{
  seed(113);
  const env = makeEnv({ mode: 'lantern', day: 2, zone: 'glasswater' });
  env.toNight(2); env.runFor(6);
  env.ctx.fishing.state = 'reeling';
  env.ctx.fishing.view = { speciesId: 'glass_sovereign', rarity: 'legendary' };
  const e0 = env.events.length;
  env.runFor(30);
  eq(spawnsIn(env, e0).length, 0, 'Lantern: no swarm spawns while the Glass Sovereign is hooked');
}

section('ring: no persistent lantern-reach ring in v3');
{
  seed(121);
  const env = makeEnv({ mode: 'lantern', day: 2 });
  env.toNight(2); env.runFor(10);
  const fx = env.combat._fx;
  let ringSeen = false;
  const orig = fx.decalsG.add;
  fx.decalsG.add = function (x, z, sx, sz, rot, type, ...rest) {
    if (type === fx.DECAL.DASHRING && Math.abs(sx - env.combat.auraRadius) < 1e-6 && Math.abs(x - env.ctx.player.position.x) < 1e-6) ringSeen = true;
    return orig.call(this, x, z, sx, sz, rot, type, ...rest);
  };
  env.runFor(2);
  eq(ringSeen, false, 'no dashed ring at the light radius around the raft (even without actors.lightPool)');
}


// ------------------------------------------------------------------ the flag-off half, in a fresh process
section('flag off (child process)');
{
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url)], { env: { ...process.env, GW_COMBAT_V1: '1' }, encoding: 'utf8' });
  const out = (r.stdout || '') + (r.stderr || '');
  process.stdout.write(out.split('\n').map((l) => (l ? '  ' + l : l)).join('\n'));
  ok(r.status === 0, 'the flag-off suite passes');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
