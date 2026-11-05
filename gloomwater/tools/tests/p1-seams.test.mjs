// Unit tests for the seams the P1 stager wired between the v3 Phase 1 modules (DESIGN §25.14.2; CONTRACT §13.4–§13.7):
//   S6  lamp-watch detection at dusk end (survival) and fishing's 10 m cast limit during a watch;
//   C3  progression counts a banked level-up (levelup:banked) for meta.bestLevel;
//   F4  a let-it-pass ('passed') keeps the perfect-hook streak (progression);
//   F7  player.js leaves the waiting-line rule to fishing.lineBroken() (one owner of the hard rule);
//   Night Eyes / Quiet Hands procs (combat.boonProcs) reach fishing's bite wait and Clean Cast threshold;
//   fishing:tell carries `dur` (audio's tell timing).
// Each seam also runs on the flag-off data, where nothing may change.
//   node tools/tests/p1-seams.test.mjs   (or node tools/check.mjs)
if (typeof globalThis.document === 'undefined') {
  const ctx2d = new Proxy({}, { get: (t, k) => (k === 'createImageData' ? (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h })
    : k === 'createRadialGradient' || k === 'createLinearGradient' ? () => ({ addColorStop() {} }) : k === 'measureText' ? () => ({ width: 40 }) : () => {}), set: () => true });
  globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx2d, style: {} }) };
}
import * as THREE from 'three';
import * as dataV1 from '../../src/data.js';                 // evaluated first: GW_V3 unset → the flag-off build
import { createBus, defaultMeta } from '../../src/core.js';
import { create as createSurvival } from '../../src/survival.js';
import { create as createProgression } from '../../src/progression.js';
import { create as createPlayer } from '../../src/player.js';

globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; globalThis.GW_WALK = false;
const data = await import('../../src/data.js?p1-seams');
delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE; delete globalThis.GW_WALK;
const { makeFishingEnv } = await import('./fishing-env.mjs');

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg); } }
const section = (s) => console.log(`- ${s}`);
const DT = 0.05;

// ------------------------------------------------------------------ survival on a fake ctx
function survivalEnv({ D = data, world = {}, pos = [10, 20] } = {}) {
  const bus = createBus();
  const events = [];
  const ctx = {
    THREE, bus, data: D, state: { meta: defaultMeta(), run: null },
    time: { dt: DT, gameDt: DT, t: 0, gameT: 0, timeScale: 1, frame: 1 },
    flow: 'playing', paused: false, debug: {}, errors: [], isMobile: false, input: {}, game: { save() {} },
    progression: { getStats: () => { const o = {}; for (const [k, v] of Object.entries(D.STATS)) o[k] = v.base; return o; } },
    player: { position: new THREE.Vector3(pos[0], 0, pos[1]) },
    fishing: { state: 'idle', view: {} }, actors: {}, world, combat: {}, ui: {}, render: {},
  };
  const orig = bus.emit.bind(bus);
  bus.emit = (e, p = {}) => { events.push({ e, p }); orig(e, p); };
  const S = createSurvival(ctx);
  ctx.survival = S;
  S.init();
  const startRun = ({ nightMode = 'lantern', outing = 'normal', day = 2, zone = 'mossmere' } = {}) => {
    const st = D.STATS;
    const run = { active: true, zone, day, phase: 'calm', phaseTime: 0, character: 'wick', upgrades: {}, boons: {}, relics: {}, flags: {}, creel: [],
      hp: st.maxHp.base, oil: st.maxOil.base, satiety: st.maxSatiety.base, stats: {} };
    if (D.V3_ENABLED) { run.nightMode = nightMode; run.outing = outing; }
    ctx.state.run = run;
    bus.emit('zone:change', { zone, prev: null });
    bus.emit('run:start', { continued: false });
    ctx.debug.god?.(true);   // clock and lamp-watch only: no drains
    return run;
  };
  const tick = (sec, until) => { const n = Math.round(sec / DT); for (let i = 0; i < n; i++) { ctx.time.frame++; S.update(DT, ctx.time.t += DT); if (until?.()) return; } };
  const tickTo = (phase) => tick(1000, () => ctx.state.run.phase === phase);
  return { ctx, S, events, startRun, tick, tickTo, count: (e) => events.filter((x) => x.e === e).length, last: (e) => [...events].reverse().find((x) => x.e === e)?.p };
}

section('S6 lamp-watch: in Lantern, standing in a watch-lamp pool when dusk ends cancels that swarm night; leaving it by > 10 m ends it');
{
  const lamps = data.ZONE_BY_ID.mossmere.arena.watchLamps;
  ok(Array.isArray(lamps) && lamps.length === 2 && lamps[0].id === 'se_buoy', `the Mossmere has its two buoy watch-lamps (${lamps?.map((l) => l.id)})`);
  ok(data.swarmTonight('lantern', 2, 'normal') === true && data.swarmTonight('lantern', 1, 'normal') === false, 'Lantern swarms on night 2, not night 1');
  const se = lamps[0];
  const env = survivalEnv({ pos: [se.x + 3, se.z] });
  const run = env.startRun({ nightMode: 'lantern', day: 2 });
  env.tickTo('dusk');
  ok(env.count('lampwatch:start') === 0 && !run.lampWatch, 'no watch before dusk ends');
  env.tickTo('gloomtide');
  const st = env.last('lampwatch:start'), pc = env.last('phase:change');
  ok(st?.lampId === 'se_buoy' && st.forced === false && st.zone === 'mossmere', `lampwatch:start ${JSON.stringify(st)}`);
  ok(run.lampWatch?.lampId === 'se_buoy' && run.lampWatch.forced === false && env.S.lampWatch?.lampId === 'se_buoy', 'run.lampWatch / survival.lampWatch hold the watch');
  ok(pc?.phase === 'gloomtide' && pc.swarm === false, `the night's phase:change already reads swarm ${pc?.swarm}`);
  const i0 = env.events.findIndex((x) => x.e === 'lampwatch:start'), i1 = env.events.findIndex((x) => x.e === 'phase:change' && x.p.phase === 'gloomtide');
  ok(i0 >= 0 && i0 < i1, 'lampwatch:start comes before the night\'s phase:change');
  env.ctx.player.position.set(se.x + 15, 0, se.z); env.tick(1);
  ok(!!run.lampWatch && env.count('lampwatch:end') === 0, '15 m from the lamp (9 m out of the pool) keeps the watch');
  env.ctx.player.position.set(se.x + 17, 0, se.z); env.tick(0.1);
  ok(!run.lampWatch && env.last('lampwatch:end')?.lampId === 'se_buoy' && env.last('lampwatch:end')?.forced === false, 'sailing 11 m out of the pool ends it (lampwatch:end)');
  env.ctx.player.position.set(se.x, 0, se.z); env.tick(1);
  ok(!run.lampWatch && env.count('lampwatch:start') === 1, 'coming back mid-night does not restart it (only at dusk end)');

  const stay = survivalEnv({ pos: [se.x, se.z + 2] });
  const r2 = stay.startRun({ nightMode: 'lantern', day: 2 });
  stay.tickTo('gloomtide');
  ok(!!r2.lampWatch, 'a second run: watch held');
  stay.tickTo('dawn');
  ok(!r2.lampWatch && stay.last('lampwatch:end')?.lampId === 'se_buoy', 'dawn ends the watch');
}
{
  const se = data.ZONE_BY_ID.mossmere.arena.watchLamps[0];
  const cases = [
    { name: 'a quiet Lantern night (night 1)', mode: 'lantern', day: 1, pos: [se.x, se.z] },
    { name: 'Gloomtide ignores lamp-watch', mode: 'gloomtide', day: 2, pos: [se.x, se.z] },
    { name: 'Still has no swarm to keep off', mode: 'still', day: 2, pos: [se.x, se.z] },
    { name: 'outside the pool (7 m from the lamp)', mode: 'lantern', day: 2, pos: [se.x + 7, se.z] },
  ];
  for (const c of cases) {
    const env = survivalEnv({ pos: c.pos });
    const run = env.startRun({ nightMode: c.mode, day: c.day });
    env.tickTo('gloomtide');
    ok(!run.lampWatch && env.count('lampwatch:start') === 0, `${c.name}: no watch`);
  }
  const w = survivalEnv({ pos: [100, 100], world: { getWatchLamps: () => [{ id: 'test_lamp', position: { x: 100, z: 101 }, radius: 6 }] } });
  const rw = w.startRun({ nightMode: 'lantern', day: 2 });
  w.tickTo('gloomtide');
  ok(rw.lampWatch?.lampId === 'test_lamp', 'world.getWatchLamps() (W1) wins over the data fallback');
  const dbg = survivalEnv({ pos: [0, 0] });
  dbg.startRun({ nightMode: 'lantern', day: 2 });
  const forced = dbg.ctx.debug.lampWatch('w_buoy');
  ok(forced?.lampId === 'w_buoy' && dbg.last('lampwatch:start')?.lampId === 'w_buoy', 'debug.lampWatch(lampId) starts a watch at that lamp');
  ok(dbg.ctx.debug.lampWatch(null) === null && !dbg.ctx.state.run.lampWatch && dbg.last('lampwatch:end')?.lampId === 'w_buoy', 'debug.lampWatch(null) ends it');
  const off = survivalEnv({ D: dataV1, pos: [se.x, se.z] });
  const ro = off.startRun({ day: 2 });
  off.tickTo('gloomtide');
  ok(!ro.lampWatch && off.count('lampwatch:start') === 0, 'flag off: no lamp-watch');
}

// ------------------------------------------------------------------ fishing: the watch's cast limit, Quiet Hands, Night Eyes, tell dur
/** A real cast on the fake env: hold for `holdTicks` frames (the meter rises 1.25 per s from the first frame), then release. */
function cast(env, holdTicks) {
  env.F.onPointerDown(); env.tick(holdTicks); env.F.onPointerUp(); env.tick(1);
}
section('S6 / F: during a lamp-watch the bobber must land within 10 m of the lamp; a forced (Scorched) watch has no cast limit');
{
  const env = makeFishingEnv({ data, mode: 'lantern', phase: 'gloomtide', raft: [30, 30] });
  env.ctx.survival.lampWatch = { lampId: 'se_buoy', x: 30, z: 30, forced: false, radius: 6 };
  const toasts = [];
  env.ctx.bus.on('toast', (p) => toasts.push(p.text));
  cast(env, 22);   // charge ≈ 0.9 → ≈ 14 m
  ok(env.F.state === 'idle' && toasts.some((t) => /lamp-watch/.test(t)), `a 14 m cast is refused (${env.F.state}; ${toasts.at(-1)})`);
  env.tick(10);
  cast(env, 9);    // charge ≈ 0.4 → ≈ 6 m
  ok(env.F.state === 'casting' || env.F.state === 'waiting', `a 6 m cast is allowed (${env.F.state})`);
  const f = makeFishingEnv({ data, mode: 'lantern', phase: 'gloomtide', raft: [30, 30] });
  f.ctx.survival.lampWatch = { lampId: null, x: 30, z: 30, forced: true, radius: 10 };
  cast(f, 22);
  ok(f.F.state === 'casting' || f.F.state === 'waiting', `forced watch: a 14 m cast is allowed (${f.F.state})`);
  const off = makeFishingEnv({ data: dataV1, mode: 'lantern', phase: 'gloomtide', raft: [30, 30] });
  off.ctx.survival.lampWatch = { lampId: 'x', x: 30, z: 30, forced: false, radius: 6 };
  cast(off, 22);
  ok(off.F.state === 'casting' || off.F.state === 'waiting', `flag off: no cast limit (${off.F.state})`);
}
section('Quiet Hands (combat.boonProcs(\'cast\').cleanAt 0.88) widens the Clean Cast; Night Eyes (nightBiteSpeed +0.1) shortens night waits');
{
  const charge = 0.9;   // between 0.88 and 0.92
  const ticks = Math.ceil(charge / 1.25 * 30) + 1;   // the meter starts at 0 on the first held frame, then rises 1.25 per s
  const plain = makeFishingEnv({ data, mode: 'lantern', phase: 'calm', raft: [30, 30] });
  plain.ctx.combat = { boonProcs: () => ({}) };
  cast(plain, ticks);
  const pw = plain.events.find((x) => x.e === 'fishing:cast')?.p.power;
  plain.tick(40);
  const qh = makeFishingEnv({ data, mode: 'lantern', phase: 'calm', raft: [30, 30] });
  qh.ctx.combat = { boonProcs: (on) => (on === 'cast' ? { cleanAt: 0.88 } : {}) };
  cast(qh, ticks);
  qh.tick(40);
  ok(pw > 0.88 && pw < 0.92, `test cast power ${pw?.toFixed(3)} sits between 0.88 and 0.92`);
  ok(plain.dbg().clean === false && qh.dbg().clean === true, `Clean Cast: plain ${plain.dbg().clean}, Quiet Hands ${qh.dbg().clean}`);
  ok(qh.F.view.cleanAt === 0.88, `view.cleanAt ${qh.F.view.cleanAt} (audio's charge ping and the reticle read it)`);

  const waitWith = (D, procs, phase) => {
    const env = makeFishingEnv({ data: D, mode: 'lantern', phase, raft: [30, 30] });
    env.ctx.combat = { boonProcs: (on) => procs[on] || {} };
    const rnd = Math.random; Math.random = () => 0.5;
    try { cast(env, 12); env.tick(40); } finally { Math.random = rnd; }
    return env.dbg().wait;
  };
  const NE = { night: { nightBiteSpeed: 0.1, glowTrailRangeMult: 1.5 } };
  const w0 = waitWith(data, {}, 'gloomtide'), w1 = waitWith(data, NE, 'gloomtide');
  const bs = 1 + (data.BAIT_BY_ID.mireworm?.bonus?.biteSpeed || 0);   // the env's bait (mireworm) adds its own bite speed
  ok(w0 > 0 && Math.abs(w1 - w0 * bs / (bs + 0.1)) < 1e-6, `night wait ${w0?.toFixed(3)} s → ${w1?.toFixed(3)} s with Night Eyes (bite speed ${bs} → ${bs + 0.1})`);
  const d0 = waitWith(data, {}, 'calm'), d1 = waitWith(data, NE, 'calm');
  ok(Math.abs(d0 - d1) < 1e-9, `day wait unchanged by Night Eyes (${d0?.toFixed(3)} / ${d1?.toFixed(3)})`);
  const v0 = waitWith(dataV1, {}, 'gloomtide'), v1 = waitWith(dataV1, NE, 'gloomtide');
  ok(Math.abs(v0 - v1) < 1e-9, 'flag off: procs are never read');
}
section('fishing:tell carries dur (the float animation\'s length) for audio');
{
  const env = makeFishingEnv({ data, raft: [4, 14.8] });
  const want = { doublePop: 0.36, plunge: 0, dragUnder: data.BALANCE.bite.dragUnder ?? 0.4, flatSlide: 0.5, dome: 0.6 };
  const seen = {};
  for (const z of [-1.2, 0.2, 1.4, 2.2, 2.9]) {
    env.reset(); env.tick(30);
    env.ctx.debug.forceBite({ speciesId: 'reedjaw_pike', z, wait: 3 });
    env.tick(100);
    const t = [...env.events].reverse().find((x) => x.e === 'fishing:tell')?.p;
    if (t) seen[t.biteTell] = t.dur;
  }
  ok(Object.keys(seen).length >= 4 && Object.entries(seen).every(([k, v]) => Math.abs(v - want[k]) < 1e-9), `tell durations ${JSON.stringify(seen)}`);
}

// ------------------------------------------------------------------ progression: the streak on a pass; banked level-ups
function progressionEnv(D = data) {
  const bus = createBus();
  const events = [];
  const ctx = {
    THREE, bus, data: D, state: { meta: defaultMeta(), run: null },
    time: { dt: 0.016, gameDt: 0.016, t: 0, gameT: 0, timeScale: 1, frame: 1 },
    flow: 'playing', paused: false, debug: {}, errors: [], isMobile: false, input: {}, game: { save() {} },
    survival: { getPhaseInfo: () => ({ phase: 'calm', day: 1, time: 0, duration: 180, k: 0, isNight: false }), addOil() {}, addSatiety() {}, heal() {} },
    actors: { merchant: { present: false, position: new THREE.Vector3(), arrive() {}, leave() {} }, setRaftLevel() {}, setCharacter() {} },
    world: { getMerchantDock: () => ({ position: new THREE.Vector3(24, 0, 30), yaw: 1 }), setGateState() {}, getGate: () => null, getDepth: () => 0.5 },
    player: { position: new THREE.Vector3(), near: null, isNear() { return false; } },
    combat: { addXp() {} }, fishing: { spots: [], signs: [], addSpots() {}, armChum() {} },
    ui: { isBlocking: () => false, isShopOpen: () => false, floatText() {} },
  };
  const orig = bus.emit.bind(bus);
  bus.emit = (e, p = {}) => { events.push({ e, p }); orig(e, p); };
  ctx.progression = createProgression(ctx);
  ctx.progression.init();
  const run = ctx.progression.createRun({});
  ctx.state.run = run;
  ctx.state.meta.runs = 1;
  bus.emit('zone:change', { zone: run.zone, prev: null });
  bus.emit('run:start', { continued: false });
  return { ctx, run, bus };
}
section('progression: a let-it-pass keeps the perfect-hook streak; a banked level-up counts for meta.bestLevel');
for (const [name, D] of [['v3', data], ['flag off', dataV1]]) {
  const { ctx, run, bus } = progressionEnv(D);
  bus.emit('fishing:hook', { speciesId: 'mossback_perch', perfect: true });
  bus.emit('fishing:hook', { speciesId: 'mossback_perch', perfect: true });
  bus.emit('fishing:miss', { reason: 'passed' });
  ok(run.flags.streak === 2, `${name}: streak ${run.flags.streak} after a pass`);
  bus.emit('fishing:miss', { reason: 'early' });
  ok(run.flags.streak === 0, `${name}: an early tap still resets it (${run.flags.streak})`);
  bus.emit('levelup:banked', { count: 1, level: 7, added: 1 });
  ok(ctx.state.meta.bestLevel >= 7 && run.flags.maxLevel >= 7, `${name}: levelup:banked level 7 → bestLevel ${ctx.state.meta.bestLevel}`);
}

// ------------------------------------------------------------------ player: the waiting-line rule lives in fishing.lineBroken()
section('player: a waiting line is reeled in when fishing.lineBroken() says so (and only then)');
{
  const mk = (fishing) => {
    const bus = createBus();
    const ctx = {
      THREE, bus, data, state: { meta: defaultMeta(), run: { active: true, zone: 'mossmere', day: 1, flags: {}, upgrades: {}, boons: {} } },
      time: { dt: 1 / 30, gameDt: 1 / 30, t: 0 }, flow: 'playing', paused: false, debug: {}, errors: [], isMobile: false,
      input: { move: { x: 0, y: 0 }, joy: { x: 0, y: 0 } },
      progression: { getStats: () => ({ moveSpeed: 6, castMax: 16 }) }, fishing,
      world: { collide: () => null, getZone: () => data.ZONE_BY_ID.mossmere, isOpenWater: () => true }, water: {}, actors: {}, combat: {}, survival: {}, render: {}, ui: {},
    };
    const P = createPlayer(ctx);
    ctx.player = P;
    try { P.init?.(); } catch { /* optional in node */ }
    return { ctx, P };
  };
  const calls = [];
  const far = { state: 'waiting', view: { castDist: 8 }, bobberPos: new THREE.Vector3(500, 0, 500), isBusy: () => true, cancel: (r) => calls.push(r), lineBroken: () => false };
  const a = mk(far);
  for (let i = 0; i < 5; i++) a.P.update(1 / 30, i / 30);
  ok(!calls.includes('moved'), 'lineBroken() false: the far bobber stays (fishing owns the rule; Still / Lantern discount combat movement)');
  far.lineBroken = () => true;
  for (let i = 0; i < 2; i++) a.P.update(1 / 30, i / 30);
  ok(calls.includes('moved'), 'lineBroken() true: cancel(\'moved\')');
  const calls2 = [];
  const old = { state: 'waiting', view: { castDist: 8 }, bobberPos: new THREE.Vector3(500, 0, 500), isBusy: () => true, cancel: (r) => calls2.push(r) };
  const b = mk(old);
  for (let i = 0; i < 2; i++) b.P.update(1 / 30, i / 30);
  ok(calls2.includes('moved'), 'a fishing module without lineBroken(): the old distance check still reels in');
}

console.log(`p1-seams: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
