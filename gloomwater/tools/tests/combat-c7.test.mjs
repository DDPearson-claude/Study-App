// C7 (DESIGN §25.14.2a; CONTRACT §13.7 combat, §13.7a the anchor): combat under automatic fishing, with a fake ctx and the real
// combat module. In Lantern a scripted slam during a play neither parts the line nor moves the raft; in Gloomtide it parts a
// non-legendary line once ('staggered') and a scripted knockback during a play moves nothing (its hits still cost Embers); a
// legend's line is never parted; a tap on an enemy during the bite is not combat's (main routes it to the strike); the legend
// snags are staged beats of the play (no tension); a Mossmere Keeper's fish XP is × 0.78 (CATCH_V3.economy.norm).
//   node tools/tests/combat-c7.test.mjs
// a canvas-less DOM is enough for combat-fx's textures
const noop = new Proxy(function () {}, {
  get: (t, k) => (k === 'createLinearGradient' || k === 'createRadialGradient' ? () => ({ addColorStop() {} })
    : (k === 'getImageData' || k === 'createImageData') ? (w = 1, h = 1) => ({ data: new Uint8ClampedArray(Math.max(1, (w | 0) * (h | 0)) * 4) }) : noop),
  apply: () => undefined, set: () => true,
});
globalThis.document = globalThis.document || { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => noop }) };
globalThis.innerWidth = 960; globalThis.innerHeight = 540;
globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
const V1 = false;

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

const AF = (env, { legendary = false } = {}) => {
  // automatic fishing's seams on the fake fishing module (F2′): partLine, setTutorial; the view hides the species
  const f = env.ctx.fishing;
  f.partLine = (reason) => { env.calls.part = env.calls.part || []; env.calls.part.push([reason, f.state]); f.state = 'lost'; };
  f.setTutorial = () => {};
  f.view = legendary ? { legendary: true, speciesId: 'belled_matriarch', rarity: 'legendary' } : { speciesId: null, rarity: null };
};
const slamNow = (env) => {
  env.ctx.debug.spawn('drowned_hand', 1);
  const hand = env.combat.enemies.find((e) => e.enemyId === 'drowned_hand' && e.alive);
  if (hand) { hand.state = 'slam'; hand.stateT = 0.3; hand.n = 0; hand.position.set(0.3, 0, 0.2); }
  return hand;
};

section('Lantern: a slam during a play neither parts the line nor moves the raft');
{
  seed(701);
  const env = makeEnv({ mode: 'lantern', day: 2 });
  AF(env);
  env.toNight(2); env.runFor(3);
  env.ctx.fishing.state = 'reeling';
  const p0 = env.ctx.player.position.clone();
  ok(!!slamNow(env), 'a hand slams');
  env.runFor(0.3);
  eq((env.calls.part || []).length, 0, 'Lantern: no partLine');
  eq(env.calls.knock.length, 0, 'Lantern: no knockback');
  near(env.ctx.player.position.distanceTo(p0), 0, 'Lantern: the raft did not move', 1e-9);
  eq(env.ctx.fishing.state, 'reeling', 'the play goes on');
}

section('Gloomtide: a slam during a play parts a non-legendary line once; nothing moves the raft');
{
  seed(702);
  const env = makeEnv({ mode: 'gloomtide', day: 2 });
  AF(env);
  env.toNight(2); env.runFor(3);
  env.ctx.debug.killAll?.();
  env.ctx.fishing.state = 'reeling';
  const p0 = env.ctx.player.position.clone();
  const d0 = env.calls.damage.length;
  ok(!!slamNow(env), 'a hand slams');
  env.runFor(0.3);
  eq(env.calls.part, [['staggered', 'reeling']], 'Gloomtide: partLine("staggered") once, during the play');
  ok(env.calls.damage.length > d0, 'Gloomtide: the hit still costs Embers');
  eq(env.calls.knock.length, 0, 'Gloomtide: no knockback during the play (the anchor)');
  near(env.ctx.player.position.distanceTo(p0), 0, 'Gloomtide: the raft did not move', 1e-9);
  ok(!env.calls.cancel.includes('snap'), 'the v1 snap (cancel) is not used under automatic fishing');
  // a second slam in the quiet beat (state lost): nothing more, and still anchored
  slamNow(env); env.runFor(0.3);
  eq(env.calls.part.length, 1, 'once: a second slam in the quiet beat parts nothing');
  eq(env.calls.knock.length, 0, 'still anchored in the quiet beat (lost)');
  // a scripted knockback during a play moves nothing (Bulwark shove, the combat helpers)
  env.ctx.fishing.state = 'reeling';
  env.combat.knockPlayer?.(1, 0, 4);
  near(env.ctx.player.position.distanceTo(p0), 0, 'Gloomtide: a scripted knockback during a play moves nothing', 1e-9);
  // after the note (idle): a slam knocks as before
  env.ctx.fishing.state = 'idle';
  slamNow(env); env.runFor(0.3);
  ok(env.calls.knock.length > 0, 'Gloomtide: with no fish on, a slam knocks the raft as before');
}

section('Gloomtide: a legend\'s line is never parted; the bite is not a play');
{
  seed(703);
  const env = makeEnv({ mode: 'gloomtide', day: 3 });
  AF(env, { legendary: true });
  env.toNight(3); env.runFor(3);
  env.ctx.debug.killAll?.();
  env.ctx.fishing.state = 'reeling';
  slamNow(env); env.runFor(0.3);
  eq((env.calls.part || []).length, 0, 'a legend: no partLine');
  const env2 = makeEnv({ mode: 'gloomtide', day: 3 });
  AF(env2);
  env2.toNight(3); env2.runFor(3);
  env2.ctx.debug.killAll?.();
  env2.ctx.fishing.state = 'bite';
  slamNow(env2); env2.runFor(0.3);
  eq((env2.calls.part || []).length, 0, 'during the bite (no fish on yet) a slam parts nothing');
}

section('a tap on an enemy during the bite is the strike, not a zap');
{
  for (const mode of ['lantern', 'gloomtide']) {
    seed(704);
    const env = makeEnv({ mode, day: 2 });
    AF(env);
    env.toNight(2); env.runFor(3);
    env.ctx.debug.killAll?.();
    const e = env.ctx.debug.spawn('wisp', 1, 4)?.[0] || env.ctx.debug.spawn('gloomling', 1, 4)?.[0];
    env.ctx.fishing.state = 'bite';
    const oil0 = env.run.oil;
    eq(env.combat.onPointerDown(new THREE.Vector2(0, 0)), false, `${mode}: combat does not take a tap during the bite`);
    eq(env.run.oil, oil0, `${mode}: no zap cost`);
    void e;
  }
}

section('the legend snags become staged beats (no tension)');
{
  seed(705);
  const env = makeEnv({ mode: 'lantern', day: 2 });
  AF(env, { legendary: true });
  env.ctx.fishing.view = { legendary: true, speciesId: 'lantern_swallower', rarity: 'legendary' };
  env.toNight(2); env.runFor(1);
  env.ctx.fishing.state = 'reeling';
  const s0 = env.calls.snag.length;
  env.bus.emit('fishing:reel', { phase: 'graspingDark', sizeClass: 'legend', t: 10, dur: 2, strength: 1, tier: 0, legendary: true, speciesId: 'lantern_swallower' });
  env.runFor(2);
  eq(env.calls.snag.length, s0, 'fishing.snag is never called (no tension)');
  const warn = env.of('legend:snag').filter((x) => x.payload.phase === 'warn' && x.payload.staged);
  eq(warn.length, 1, 'the staged beat draws the rising hand once');
  env.bus.emit('fishing:reel', { phase: 'run', sizeClass: 'legend', t: 12, dur: 2, strength: 1, tier: 0, legendary: true, speciesId: 'lantern_swallower' });
  env.runFor(0.5);
  eq(env.of('legend:snag').filter((x) => x.payload.phase === 'warn').length, 1, 'other beats draw nothing');
}

section('fish XP × CATCH_V3.economy.norm (combat owns it)');
{
  const NORM = data.CATCH_V3.economy.norm;
  eq(NORM.mossmere, 0.78, 'the Mossmere norm is 0.78');
  const keeper = data.SPECIES.find((s) => s.zone === 'mossmere' && s.rarity === 'common');
  for (const mode of ['still', 'lantern', 'gloomtide']) {
    const env = makeEnv({ mode, day: 1, zone: 'mossmere' });
    env.run.xpNext = 1000;
    const n = 9;
    env.combat.addXp(n, { source: 'fish', speciesId: keeper.id, fishXp: n, discoveryXp: 0, modeApplied: true });
    eq(env.run.xp, Math.round(n * 0.78), `${mode}: a Mossmere Keeper's fish XP (progression applied the mode) is × 0.78`);
    const env2 = makeEnv({ mode, day: 1, zone: 'mossmere' });
    env2.run.xpNext = 1000;
    env2.combat.addXp(9, { source: 'fish', speciesId: keeper.id, fishXp: 7, discoveryXp: 2, modeApplied: true });
    eq(env2.run.xp, 2 + Math.round(7 * 0.78), `${mode}: discovery XP is not normalised`);
  }
  eq(M.fishXpForMode(10, { mode: 'lantern', B: data.BALANCE, data, rarity: 'common', zoneIndex: 0, lake: 'mossmere' }), Math.round(10 * 0.78), 'fishXpForMode(…, {lake}) applies the norm');
  eq(M.econNorm({ V3_ENABLED: false, CATCH_V3: data.CATCH_V3 }, 'mossmere'), 1, 'flag off: no norm');
  eq(M.econNorm(data, 'cove'), 1, 'the cove: 1');
  ok(M.anchored('lost', data) && M.anchored('reeling', data) && M.anchored('landing', data) && !M.anchored('bite', data) && !M.anchored('waiting', data), 'the anchor states: reeling, landing, lost');
  ok(!M.anchored('reeling', { V3_ENABLED: false }), 'flag off: no anchor');
}

console.log(`combat-c7: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
