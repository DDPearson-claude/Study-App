// Unit tests for combat's C2 (DESIGN §25.14.2 C2, §25.5.7 "the day screen carries no combat UI"; CONTRACT §13.7 combat): the
// presentation table read from BALANCE.nightModes[mode].hud through the real combat module (aura 0–1, Embers, Flare), the
// Flare refused (and free) where the table hides it, the lantern aura's soft wash fading in by mode, and v1 untouched.
//   node tools/tests/combat-c2.test.mjs        (or node tools/check.mjs)
// The flag-off half re-runs this file in a child process with GW_C2_V1=1 (data.js reads the flag at import).
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const V1 = process.env.GW_C2_V1 === '1';
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
const section = (s) => console.log(`- ${V1 ? '[v1] ' : ''}${s}`);
function seed(s) {
  let a = s >>> 0;
  Math.random = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
seed(20261105);

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

const tryFlare = (env) => { env.combat.update(0, env.ctx.time.t); const oil = env.run.oil; const r = env.combat.flare(); return { ok: r, spent: oil - env.run.oil, cd: env.combat.flareCooldown }; };

if (!V1) {
  section('the Flare by mode: refused (and free) where the table hides it');
  for (const mode of ['still', 'lantern', 'gloomtide']) {
    for (const [phase, day] of [['calm', 2], ['dusk', 2], ['gloomtide', 2], ['gloomtide', 1], ['dawn', 2]]) {
      const env = makeEnv({ mode, day });
      env.clock.day = day; env.run.day = day;
      if (phase !== 'calm') env.setPhase(phase);
      env.runFor(0.3);
      const p = env.combat.presentation;
      const want = M.presentation(mode, data.BALANCE, { phase, phaseK: env.clock.time / env.clock.duration, swarmNight: env.combat.swarmTonight, swarmActive: env.combat.swarmActive });
      ok(p.flare === want.flare && p.embers === want.embers && Math.abs(p.aura - want.aura) < 1e-9, `${mode} ${phase} night ${day}: combat.presentation follows the table (${JSON.stringify(p)})`);
      ok(env.combat.flareShown === p.flare && env.combat.embersShown === p.embers, `${mode} ${phase} night ${day}: flareShown / embersShown agree`);
      const r = tryFlare(env);
      if (p.flare) ok(r.ok === true && r.cd > 0, `${mode} ${phase} night ${day}: the Flare fires where it is shown`);
      else ok(r.ok === false && r.spent === 0 && r.cd === 0 && env.combat.canFlare() === false, `${mode} ${phase} night ${day}: the Flare is refused, no oil, no cooldown`);
    }
  }
  {
    const s = makeEnv({ mode: 'still' }), l = makeEnv({ mode: 'lantern', day: 2 }), g = makeEnv({ mode: 'gloomtide', day: 2 });
    ok(s.combat.presentation.flare === false && s.combat.presentation.embers === false, 'still: no Flare and no Embers in calm');
    ok(l.combat.presentation.flare === false, 'lantern calm (swarm night): no Flare yet');
    ok(g.combat.presentation.flare === true && g.combat.presentation.embers === true, 'gloomtide calm: Flare and Embers always');
  }

  section('the Embers arc in Lantern shows for 4 s after a hit');
  {
    const env = makeEnv({ mode: 'lantern', day: 1 });
    env.runFor(0.2);
    ok(env.combat.embersShown === false, 'lantern calm: Embers hidden');
    env.bus.emit('player:damage', { amount: 1, source: 'test' });
    env.runFor(1);
    ok(env.combat.embersShown === true, 'a hit shows them');
    env.runFor(3.5);
    ok(env.combat.embersShown === false, '4 s later they hide again');
  }

  section('the lantern aura: a soft wash by mode, never in calm or dawn');
  {
    const lan = makeEnv({ mode: 'lantern', day: 2 });
    lan.runFor(3);
    ok(lan.combat.auraShown === 0, 'lantern calm: no aura');
    lan.setPhase('dusk'); lan.runFor(2);
    const midDusk = lan.combat.auraShown;
    lan.runFor(15);
    const lateDusk = lan.combat.auraShown;
    ok(midDusk > 0 && lateDusk > midDusk, `lantern dusk (swarm night): the aura fades in (${midDusk} → ${lateDusk})`);
    lan.setPhase('gloomtide'); lan.runFor(6);
    ok(lan.combat.auraShown > 0.9, `lantern swarm night: the aura is on (${lan.combat.auraShown})`);
    lan.setPhase('dawn'); lan.runFor(5);
    ok(lan.combat.auraShown < 0.05, `dawn: the aura fades out (${lan.combat.auraShown})`);
    const odd = makeEnv({ mode: 'lantern', day: 1 });
    odd.toNight(1); odd.runFor(6);
    ok(odd.combat.auraShown === 0 || odd.combat.auraShown < 0.01, 'lantern quiet night: no aura');
    const still = makeEnv({ mode: 'still', day: 2 });
    still.toNight(2); still.runFor(6);
    ok(still.combat.auraShown < 0.01, 'still night: no aura, ever');
    const gl = makeEnv({ mode: 'gloomtide', day: 2 });
    gl.runFor(3);
    ok(gl.combat.auraShown < 0.01, 'gloomtide calm (no raid): no aura');
    gl.setPhase('dusk'); gl.runFor(8);
    ok(gl.combat.auraShown > 0.6, `gloomtide: on from dusk (${gl.combat.auraShown})`);
  }

  section('the presentation never touches Math.random (seeded runs stay stable)');
  {
    seed(7); const a = makeEnv({ mode: 'lantern', day: 2 }); a.toNight(2); a.runFor(4); const ra = Math.random();
    seed(7); const b = makeEnv({ mode: 'lantern', day: 2 }); b.toNight(2); b.runFor(4); const rb = Math.random();
    ok(ra === rb, 'two seeded Lantern nights draw the same random sequence');
    ok(a.events.filter((e) => e.evt === 'enemy:spawn').length === b.events.filter((e) => e.evt === 'enemy:spawn').length, 'and spawn the same swarm');
  }
}

if (V1) {
  section('flag off: v1 presentation, the Flare in any phase, no aura');
  const env = makeEnv({});
  env.runFor(0.3);
  const p = env.combat.presentation;
  ok(p.aura === 0 && p.embers === true && p.flare === true, 'v1: presentation {aura 0, Embers, Flare}');
  const r = tryFlare(env);
  ok(r.ok === true && r.spent > 0, 'v1: the Flare works in calm and costs oil, as before');
  env.toNight(1); env.runFor(4);
  ok(env.combat.auraShown === 0, 'v1: no aura wash is drawn');
}

if (!V1) {
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url)], { env: { ...process.env, GW_C2_V1: '1' }, encoding: 'utf8' });
  const out = (r.stdout || '') + (r.stderr || '');
  const mm = /(\d+) passed, (\d+) failed/.exec(out.trim().split('\n').pop() || '');
  if (mm) { pass += Number(mm[1]); fail += Number(mm[2]); } else { fail++; console.log('  FAIL: the flag-off child did not report', out.slice(-600)); }
  if (r.status !== 0 && mm && Number(mm[2]) === 0) fail++;
  if (r.status !== 0) console.log(out.split('\n').filter((l) => /FAIL/.test(l)).join('\n'));
}

console.log(`\ncombat-c2${V1 ? ' [v1]' : ''}: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
