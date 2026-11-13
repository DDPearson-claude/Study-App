// Unit tests for THE SHOW's sequence (docs/v3/show/SPEC.md §2.1, §4 S2 / S3 / S7, §6; DESIGN §25.6.8; CONTRACT §13.7b): the
// REAL src/fishing.js and src/progression.js on a fake ctx whose actors and render implement the show's seam (showFish /
// setShowTime / getShowFocus / endShow; setShowTarget) and record every call. A whole catch is played through the automatic
// play to its landing (fishOutcome('land')), so the reveal runs on the game's clock under its slow-motion beat, as in the game.
//   · the phases in order and once, per class, with the real seconds of data.showPlan (reveal, lift, hold, pause, T0 → card)
//   · the events in order and once per fish: fishing:landing → fishing:caught → fishing:show {lift} → fish:measured →
//     fish:landed → fishing:show {hold} → {pause} → {card}; ctx.cinematic exactly from fishing:caught to the card
//   · the hurry: the reveal never cut, the lift × hurry.liftRate, the card after hurry.hold s of present; the floor of
//     hurry.protectedHold s for a first-ever species or a personal best; a tap in the pause; a tap that changes nothing twice
//   · the swarm window's row; the valve (a stuck show, a stuck reveal); a pause holds the clock; an abort measures once
//   · the seam: what actors and render are told, and when; hidden information (no species, no length on the view in the reveal)
//   node tools/tests/fishing-show.test.mjs   (or node tools/check.mjs)
if (typeof globalThis.document === 'undefined') {
  const ctx2d = new Proxy({}, { get: (t, k) => (k === 'createImageData' ? (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h })
    : k === 'createRadialGradient' || k === 'createLinearGradient' ? () => ({ addColorStop() {} }) : k === 'measureText' ? () => ({ width: 40 }) : () => {}), set: () => true });
  globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx2d, style: {} }) };
}
import * as THREE from 'three';
import * as dataV1 from '../../src/data.js';                 // evaluated first: GW_V3 unset → the flag-off build
import { createBus, defaultMeta } from '../../src/core.js';
import { create as createProgression } from '../../src/progression.js';
import { create as createFishing } from '../../src/fishing.js';

globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; globalThis.GW_WALK = false;
globalThis.GW_DEBUG = true;
const data = await import('../../src/data.js?fishing-show');
delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE; delete globalThis.GW_WALK;

let pass = 0, fail = 0;
const VERBOSE = process.argv.includes('--verbose');
function ok(cond, msg) { if (cond) { pass++; if (VERBOSE) console.log('  ok:', msg); } else { fail++; console.log('  FAIL:', msg); } }
const section = (s) => console.log(`- ${s}`);
const near = (a, b, eps) => Math.abs(a - b) <= eps;
function mul(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const DT = 1 / 60;
Math.random = mul(20261113);
const SH = data.AUTOFISH.show;

// =====================================================================================================================
// the env: real progression + real fishing; actors and render with the show's seam
// =====================================================================================================================
function makeEnv({ D = data, seam = true, cam = true, swarm = false, seed = 7, known = [], blocking = false } = {}) {
  const bus = createBus();
  const events = [];
  const origEmit = bus.emit.bind(bus);
  const ph = { phase: 'calm', day: 1 };
  const calls = { showFish: [], showTime: [], endShow: [], target: [], pose: [], showCatch: [], slowmo: [], cine: [], flare: [], kick: [], push: [], glory: 0, disposed: 0 };
  let cine = false, slow = null, swarmOn = swarm, block = blocking;
  const zone = D.ZONES.find((z) => z.id === 'mossmere');
  const wrng = mul(seed * 31 + 5);
  const show = { on: null, t: 0 };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const ctx = {
    THREE, bus, data: D, flow: 'playing', paused: false, errors: [], debug: {}, isMobile: false,
    state: { meta: defaultMeta(), run: null },
    time: { dt: DT, gameDt: DT, t: 0, gameT: 0, timeScale: 1, frame: 1 },
    input: { move: { x: 0, y: 0 }, joy: { x: 0, y: 0 } },
    get cinematic() { return cine; },
    set cinematic(v) { if (!!v !== cine) calls.cine.push({ on: !!v, t: ctx.time.t }); cine = !!v; },
    game: { save() {}, slowmo(s, k) { calls.slowmo.push([s, k]); if (!slow) slow = { left: s, scale: k }; } },
    world: { getZone: () => zone, getDepth: () => 0.7, isOpenWater: () => true, randomWaterPoint: (o = {}) => { const f = o.from || { x: 0, z: 0 }, a = wrng() * 6.283, d = 6 + wrng() * 24; return { x: f.x + Math.cos(a) * d, z: f.z + Math.sin(a) * d }; },
      getMerchantDock: () => ({ position: V(24, 0, 38), yaw: 1 }), setGateState() {}, getGate: () => null },
    water: { getHeight: () => 0, splash() {}, addRipple() {}, addWake() {}, setGlowtide() {} },
    actors: {
      setLine() {}, setBobber() {}, setPose(n) { calls.pose.push(n); }, setAim() {}, setCharge() {}, setReel() {}, getRodTip: () => null,
      showCatch(fv) { calls.showCatch.push(!!fv); if (!fv) show.on = null; }, showCord() { calls.cord = (calls.cord || 0) + 1; }, getHeadPos: (o = V()) => o.set(0, 1.4, 46), flareFlame(k) { calls.flare.push({ k, t: ctx.time.t }); },
      merchant: { present: false, position: V(), arrive() {}, leave() {} }, setRaftLevel() {}, setCharacter() {},
      ...(seam ? {
        showFish(fv, o) { calls.showFish.push({ ...o, beats: { ...o.beats }, L: fv.length, t: ctx.time.t }); show.on = { fv, id: o.pose || 'both' }; show.t = 0;
          fv.object3d.removeFromParent();   // (actors takes the model, as the real one does)
          return { pose: D.AUTOFISH.show.poseNames[show.on.id], id: show.on.id, hands: 2, side: 1 }; },
        setShowTime(t) { calls.showTime.push(t); show.t = t; },
        getShowFocus() { if (!show.on) return null; const c = V(0.2, 0.9, 46.3); return { pose: 'x', id: show.on.id, t: show.t, lift: 1, fish: { center: c, axis: V(1, 0, 0), up: V(0, 1, 0), length: show.on.fv.length, depth: 0.1 },
          head: { center: V(0, 1.2, 46), radius: 0.21, flame: V(0, 1.5, 46) }, feet: V(0, 0.3, 46), hands: [c, c], rodTip: null, keep: { fish: [c], head: [], flame: [], hands: [], feet: [], rodTip: [] }, center: V(0.1, 1.1, 46.1), radius: 0.7 }; },
        endShow(o = {}) { calls.endShow.push({ action: o.action ?? null, t: ctx.time.t }); show.on = null; },
        get showPose() { return show.on ? D.AUTOFISH.show.poseNames[show.on.id] : null; },
      } : {}),
    },
    models: { createFish(id, w) { const sp = D.SPECIES_BY_ID[id]; const L = w && typeof w === 'object' && sp?.size ? D.sizeLength(sp, w.z, w.zone) / 100 : 0.5;
      const fv = { object3d: new THREE.Group(), length: L, shape: sp?.model?.shape, update() {}, setGlow() {}, setSilhouette() {}, setReveal() {}, setRevealLight() {}, dispose() { calls.disposed++; } }; return fv; } },
    render: { getYaw: () => 0, kick(d) { calls.kick.push({ d, t: ctx.time.t }); }, push(...a) { calls.push.push(a); }, pulse() {}, attention() { calls.attention = (calls.attention || 0) + 1; },
      ...(cam ? { setShowTarget(t, o) { calls.target.push(t ? { ...t, at: ctx.time.t } : (o?.abort ? 'abort' : null)); return t ? { yaw: 0.25 } : false; } } : { setTrophyTarget(t) { calls.target.push(t ? { ...t, trophy: true } : null); } }) },
    survival: { getPhaseInfo: () => ({ phase: ph.phase, day: ph.day, isNight: false }), addOil() {}, addSatiety() {}, heal() {} },
    combat: { addXp() {}, get swarmActive() { return swarmOn; } },
    ui: { isBlocking: () => block, isShopOpen: () => false, floatText() {} },
    player: { position: V(0, 0, 46), speed: 0, near: null, isNear() { return false; } },
  };
  bus.emit = (e, p = {}) => { events.push({ e, p, t: ctx.time.t, cine }); origEmit(e, p); };
  ctx.progression = createProgression(ctx);
  ctx.progression.init();
  const F = createFishing(ctx);
  ctx.fishing = F;
  F.init();
  ctx.state.meta.runs = 3;
  for (const id of known) ctx.state.meta.journal[id] = { caught: 3, biggest: 99, pbLength: 900, seals: {} };
  const run = ctx.progression.createRun({ character: 'wick', nightMode: 'still' });
  ctx.state.run = run;
  bus.emit('zone:change', { zone: run.zone, prev: null });
  bus.emit('run:start', { continued: false });
  ctx.debug.fishSeed(seed);
  /** One frame of `dt` real seconds: main's slow-motion beat scales the game's dt (the reveal runs on it), the show on the real clock. */
  const tick = (n = 1, dt = DT) => { for (let i = 0; i < n; i++) {
    let scale = 1;
    if (slow && !ctx.paused) { scale = slow.scale; slow.left -= dt; if (slow.left <= 0) slow = null; }
    ctx.time.timeScale = scale; ctx.time.dt = dt; ctx.time.gameDt = ctx.paused || block ? 0 : dt * scale; ctx.time.t += dt; ctx.time.frame++;
    F.update(ctx.time.gameDt, ctx.time.t);
  } };
  tick(30);
  const count = (e, f) => events.filter((x) => x.e === e && (!f || f(x.p))).length;
  const last = (e) => [...events].reverse().find((x) => x.e === e)?.p;
  /** Hook `sp` at z and play the automatic play to the frame the fish breaks the surface (T0). Returns T0 (s). */
  const toT0 = (sp, z) => {
    ctx.debug.fishOutcome('land');
    ctx.debug.fishHook(sp, { z });
    for (let i = 0; i < 60 * 90 && F.state === 'reeling'; i++) tick(1);
    return F.state === 'landing' ? ctx.time.t : null;
  };
  return { ctx, F, P: ctx.progression, run, events, calls, tick, count, last, toT0, setSwarm: (on) => { swarmOn = on; }, setBlocking: (on) => { block = on; }, dbg: () => ctx.debug.show() };
}
const KEYS = ['fishing:landing', 'fishing:caught', 'fishing:show', 'fish:measured', 'fish:landed'];
const orderFrom = (env, i0) => env.events.slice(i0).filter((x) => KEYS.includes(x.e)).map((x) => (x.e === 'fishing:show' ? `show:${x.p.phase}` : x.e.replace('fishing:', '').replace('fish:', '')));
const ORDER = ['landing', 'caught', 'show:lift', 'measured', 'landed', 'show:hold', 'show:pause', 'show:card'];
const tOf = (env, i0, key) => { const x = env.events.slice(i0).find((y) => (y.e === 'fishing:show' ? `show:${y.p.phase}` : y.e.replace('fishing:', '').replace('fish:', '')) === key); return x ? x.t : null; };
/** Play from T0 until the show has left the screen (its card's turn), tapping at the given times after T0. */
function play(env, t0, { taps = [], max = 12 } = {}) {
  const pending = [...taps].sort((a, b) => a - b);
  for (let i = 0; i < max / DT && env.F.inShow; i++) {
    while (pending.length && env.ctx.time.t - t0 >= pending[0] - 1e-9) { pending.shift(); env.F.onPointerDown({ input: 'mouse' }); }
    env.tick(1);
  }
  return env.ctx.time.t - t0;
}
const CASES = [['small', 'dusk_minnow', -1], ['keeper', 'mossback_perch', 0.4], ['prize', 'mossback_perch', 1.5], ['trophy', 'reedjaw_pike', 2.4], ['elder', 'reedjaw_pike', 2.95], ['ancient', 'reedjaw_pike', 3.45]];
const ALL = ['dusk_minnow', 'mossback_perch', 'reedjaw_pike', 'weeping_carp', 'gloam_eel', 'belled_matriarch'];

// =====================================================================================================================
section('the clock: per class, reveal → lift → hold → pause → card in the real seconds of data.showPlan (S3)');
{
  for (const [cls, sp, z] of CASES) {
    const env = makeEnv({ seed: 11, known: ALL });
    const i0 = env.events.length;
    const t0 = env.toT0(sp, z);
    const P = data.showPlan(cls);
    ok(t0 != null && env.F.view.show?.phase === 'reveal' && env.F.view.show.cls === cls && env.F.inShow && !env.F.inCeremony, `${cls}: T0: view.show {phase: 'reveal', cls}; inShow`);
    const v0 = env.F.view.show;
    ok(v0.speciesId === null && v0.length === null && v0.uid === null && v0.pose === null && near(v0.dur.total, P.total, 1e-6) && env.ctx.cinematic === false,
      `${cls}: in the reveal the view carries the class and its clock only (no species, no length: F17); the world is not frozen yet`);
    const phases = ['reveal'];
    for (let i = 0; i < 12 / DT && env.F.inShow; i++) { env.tick(1); const p = env.F.view.show?.phase; if (p && phases.at(-1) !== p) phases.push(p); }
    const iT = i0 + env.events.slice(i0).findIndex((x) => x.e === 'fishing:landing');
    const T = (k) => tOf(env, i0, k) - env.events[iT].t;
    const got = { reveal: T('caught'), lift: T('show:hold') - T('caught'), hold: T('show:pause') - T('show:hold'), pause: T('show:card') - T('show:pause'), total: T('show:card') };
    ok(JSON.stringify(phases) === JSON.stringify(['reveal', 'lift', 'hold', 'pause', 'card']), `${cls}: phases ${phases.join(' → ')}`);
    ok(near(got.reveal, P.reveal, 0.04) && near(got.lift, P.lift, 0.02) && near(got.hold, P.hold, 0.02) && near(got.pause, P.pause, 0.02),
      `${cls}: reveal ${got.reveal.toFixed(2)} / lift ${got.lift.toFixed(2)} / hold ${got.hold.toFixed(2)} / pause ${got.pause.toFixed(2)} s (plan ${P.reveal} / ${P.lift} / ${P.hold} / ${P.pause})`);
    ok(near(got.total, P.total, 0.06) && got.total <= SH.max[cls] && near(got.total, SH.about[cls], SH.tolerance + 0.06), `${cls}: T0 → card ${got.total.toFixed(2)} s (plan ${P.total}; about ${SH.about[cls]}, never over ${SH.max[cls]})`);
    ok(got.pause >= SH.minPause - 0.02, `${cls}: the pause is at least ${SH.minPause} s (${got.pause.toFixed(2)})`);
    // ---- S7: the order, once each; the frozen world
    const ord = orderFrom(env, i0);
    ok(JSON.stringify(ord) === JSON.stringify(ORDER), `${cls}: ${ord.join(' → ')}`);
    const cine = env.calls.cine;
    ok(cine.length === 2 && cine[0].on && !cine[1].on && near(cine[0].t, tOf(env, i0, 'caught'), 1e-9) && near(cine[1].t, tOf(env, i0, 'show:card'), 1e-9),
      `${cls}: ctx.cinematic exactly from fishing:caught to the card`);
    ok(env.events.find((x) => x.e === 'fishing:show' && x.p.phase === 'card').cine === false && env.F.state === 'idle' && env.F.view.show?.phase === 'card' && env.F.view.measure === null,
      `${cls}: at the card the world runs again; view.show {phase: 'card'} until the card closes; view.measure stays null`);
    // ---- the seam: actors and render
    const sf = env.calls.showFish;
    const fish = env.last('fishing:caught').fish;
    const wantPose = data.showPoseFor(fish.length / 100, { sizeClass: fish.sizeClass, ancient: fish.ancient, legend: false, shape: data.SPECIES_BY_ID[sp].model?.shape });
    ok(sf.length === 1 && near(sf[0].t, tOf(env, i0, 'caught'), 1e-9) && sf[0].cls === cls && sf[0].pose === wantPose && near(sf[0].beats.lift, P.lift, 1e-9) && near(sf[0].beats.hold, P.hold, 1e-9) && near(sf[0].beats.pause, P.pause, 1e-9) && sf[0].special === false,
      `${cls}: actors.showFish once, at fishing:caught: {cls, pose '${wantPose}', the class's beats}`);
    const st = env.calls.showTime;
    ok(st.length > 10 && st.every((t, i) => i === 0 || t >= st[i - 1]) && near(st.at(-1), P.show, 0.03), `${cls}: setShowTime every frame, never back, to ${st.at(-1).toFixed(2)} s`);
    const tg = env.calls.target;
    ok(tg.length === 4 && tg[0].cls === cls && tg[0].pose === undefined && tg[0].position === undefined && tg[1].position && near(tg[1].at, env.events[iT].t, 1e-9) && tg[2].pose === wantPose && near(tg[2].length, fish.length / 100, 1e-9) && tg[3] === null,
      `${cls}: render.setShowTarget at T0 (class, class length, the reveal's spot), at fishing:caught (pose, true length), null at the card`);
    ok(tg[1].length !== tg[2].length || cls === 'x', `${cls}: the camera gets the class length until the reveal has run (${tg[1].length.toFixed(2)} → ${tg[2].length.toFixed(2)} m)`);
    ok(env.calls.flare.length === 1 && near(env.calls.flare[0].t, tOf(env, i0, 'show:hold'), 1e-9) && !env.calls.attention, `${cls}: the climax (the flame's flare) fires once, at the present; no second zoom at T0`);
    const hold = env.events.find((x) => x.e === 'fishing:show' && x.p.phase === 'hold').p;
    ok(hold.isNew === false && Array.isArray(hold.records) && env.count('fish:measured') === 1 && env.count('fish:landed') === 1, `${cls}: fishing:show {hold} carries isNew and the records; measured once`);
    ok(!env.calls.cord && !env.calls.pose.some((p) => /^measure/.test(p)), `${cls}: no measuring pose and no knotted cord`);
    // ---- the card closes: the exit gesture, then the model goes
    env.setBlocking(true); env.tick(20);
    env.ctx.bus.emit('fish:action', { action: 'keep', fish });
    env.setBlocking(false);
    env.ctx.bus.emit('ui:modal', { open: false, id: 'catch' });
    ok(env.calls.endShow.length === 1 && env.calls.endShow[0].action === 'keep' && env.F.view.show === null && env.calls.disposed === 0, `${cls}: the card closes: actors.endShow({action: 'keep'}); view.show null; the model still there for the gesture`);
    env.tick(Math.round(0.7 / DT));
    ok(env.calls.disposed === 1 && env.dbg() === null, `${cls}: 0.6 s later the model is disposed; nothing left`);
  }
}

// =====================================================================================================================
section('the hurry: a tap from T0 on; the reveal never cut; the lift × liftRate; the floor of 0.8 s for a first-ever species or a personal best');
{
  for (const [cls, sp, z] of CASES) {
    const env = makeEnv({ seed: 21, known: ALL });
    const i0 = env.events.length;
    const t0 = env.toT0(sp, z);
    const total = play(env, t0, { taps: [0] });
    const H = data.showPlan(cls, { hurried: true });
    const iT = env.events.slice(i0).find((x) => x.e === 'fishing:landing').t;
    const reveal = tOf(env, i0, 'caught') - iT, tCard = tOf(env, i0, 'show:card') - iT, shown = tOf(env, i0, 'show:card') - tOf(env, i0, 'measured');
    ok(near(reveal, H.reveal, 0.04) && near(tCard, H.total, 0.07) && tCard < data.showPlan(cls).total - 0.5, `${cls} tapped at T0: the reveal whole (${reveal.toFixed(2)} s), the card at ${tCard.toFixed(2)} s (plan ${H.total}; unhurried ${data.showPlan(cls).total})`);
    ok(near(shown, SH.hurry.hold, 0.035), `${cls}: the fish is presented for ${shown.toFixed(2)} s (hurry.hold ${SH.hurry.hold})`);
    ok(JSON.stringify(orderFrom(env, i0)) === JSON.stringify(ORDER) && env.count('fish:measured') === 1, `${cls}: hurried, the same events in the same order, once each`);
    ok(env.F.view.show.hurried === true && total > 0, `${cls}: view.show.hurried`);
  }
  // a first-ever species (not in the Journal): its present holds 0.8 s however often the player taps
  const fe = makeEnv({ seed: 22, known: ALL.filter((id) => id !== 'gloam_eel') });
  let i0 = fe.events.length, t0 = fe.toT0('gloam_eel', 0.3);
  play(fe, t0, { taps: [0, 0.3, 0.6, 0.9, 1.0, 1.1, 1.2, 1.3] });
  let shown = tOf(fe, i0, 'show:card') - tOf(fe, i0, 'measured');
  const cl = fe.last('fishing:caught').sizeClass;
  ok(fe.events.find((x) => x.e === 'fishing:show' && x.p.phase === 'hold').p.isNew === true && fe.F.view.show.protected === true && near(shown, SH.hurry.protectedHold, 0.035) && shown >= SH.hurry.protectedHold - 1e-6,
    `a first-ever species tapped eight times: ${shown.toFixed(3)} s from fish:measured to the card (never under ${SH.hurry.protectedHold})`);
  ok(near(tOf(fe, i0, 'show:card') - t0, data.showPlan(cl, { hurried: true, protected: true }).total, 0.08), 'its card at showPlan(cls, {hurried, protected}).total');
  ok(fe.calls.showFish[0].special === true, 'actors is told the catch is special (a new species)');
  // a personal best (the species known, the fish bigger than its best)
  const pb = makeEnv({ seed: 23, known: ALL });
  pb.ctx.state.meta.journal.mossback_perch.pbLength = 12;
  i0 = pb.events.length; t0 = pb.toT0('mossback_perch', 0.4);
  play(pb, t0, { taps: [0.05, 0.7, 0.9] });
  shown = tOf(pb, i0, 'show:card') - tOf(pb, i0, 'measured');
  const h = pb.events.find((x) => x.e === 'fishing:show' && x.p.phase === 'hold').p;
  ok(h.isNew === false && h.records.some((r) => r.kind === 'pb') && h.protected === true && shown >= SH.hurry.protectedHold - 1e-6 && near(shown, SH.hurry.protectedHold, 0.035), `a personal best tapped three times: ${shown.toFixed(3)} s presented`);
  // a tap in the pause: the card at once (the floor has passed); a tap in the hold of an ordinary catch after 0.3 s: at once
  const tp = makeEnv({ seed: 24, known: ALL });
  i0 = tp.events.length; t0 = tp.toT0('reedjaw_pike', 2.95);
  for (let i = 0; i < 12 / DT && tp.F.view.show.phase !== 'pause'; i++) tp.tick(1);
  const tTap = tp.ctx.time.t;
  ok(tp.F.hurryShow() === true && !tp.F.inShow && tp.F.view.show.phase === 'card' && tp.ctx.time.t === tTap, 'a tap in the pause opens the card at once');
  const th = makeEnv({ seed: 25, known: ALL });
  i0 = th.events.length; t0 = th.toT0('reedjaw_pike', 2.95);
  for (let i = 0; i < 12 / DT && th.F.view.show.phase !== 'hold'; i++) th.tick(1);
  th.tick(Math.round(0.1 / DT));
  ok(th.F.hurryShow() === true && th.F.inShow, 'a tap 0.1 s into the hold: the card waits for its floor');
  const tA = th.ctx.time.t;
  for (let i = 0; i < 2 / DT && th.F.inShow; i++) th.tick(1);
  ok(near(th.ctx.time.t - tA, SH.hurry.hold - 0.1, 0.04) && JSON.stringify(orderFrom(th, i0)) === JSON.stringify(ORDER), `…and opens ${(th.ctx.time.t - tA).toFixed(2)} s later (0.3 s presented); {pause} still fires before {card}`);
  ok(th.F.hurryShow() === false && th.F.skipCeremony() === false, 'no show: hurryShow (and its old name) answer false');
  // Space / Enter and ui go through the same door; a paused game ignores the tap
  const pz = makeEnv({ seed: 26, known: ALL });
  t0 = pz.toT0('mossback_perch', 0.4);
  pz.ctx.paused = true;
  ok(pz.F.hurryShow() === false && pz.F.view.show.hurried === false, 'paused: a tap does not hurry');
  const tBefore = pz.dbg().t;
  pz.tick(60);
  ok(pz.dbg().t === tBefore && pz.dbg().real === 0 + pz.dbg().real && pz.F.view.show.phase === 'reveal', 'paused: the show\'s clock (and its valve) hold');
  pz.ctx.paused = false;
  play(pz, t0);
  ok(pz.count('fish:measured') === 1 && pz.F.view.show.phase === 'card', 'resumed: the show plays out');
}

// =====================================================================================================================
section('a swarm window: every class plays show.swarm after its reveal (1.2 s: the arena is never hidden for longer than before)');
{
  const sum = SH.swarm.lift + SH.swarm.hold + SH.swarm.pause;
  ok(near(sum, data.BALANCE.ceremony.cinematic.duringSwarm, 1e-9), `show.swarm sums to BALANCE.ceremony.cinematic.duringSwarm (${sum} s)`);
  for (const [cls, sp, z] of [CASES[0], CASES[3], CASES[5]]) {
    const env = makeEnv({ seed: 31, known: ALL, swarm: true });
    const i0 = env.events.length;
    const t0 = env.toT0(sp, z);
    play(env, t0);
    const frozen = env.calls.cine[1].t - env.calls.cine[0].t;
    ok(env.F.view.show.swarm === true && near(frozen, sum, 0.04), `${cls} in a swarm window: the world frozen ${frozen.toFixed(2)} s (${sum})`);
    ok(tOf(env, i0, 'show:card') - tOf(env, i0, 'show:pause') >= SH.minPause - 0.02 && near(env.calls.showFish[0].beats.lift, SH.swarm.lift, 1e-9) && env.calls.target[2].swarm === true, `${cls}: its pause still ${SH.swarm.pause} s; actors and render get the swarm row`);
    ok(JSON.stringify(orderFrom(env, i0)) === JSON.stringify(ORDER), `${cls}: the same events in the same order`);
  }
  const off = makeEnv({ seed: 32, known: ALL });
  off.ctx.debug.showSwarm(true);
  const t0 = off.toT0('reedjaw_pike', 2.95);
  ok(off.F.view.show.swarm === true && near(off.F.view.show.dur.lift, SH.swarm.lift, 1e-9), 'debug.showSwarm(true) forces the row');
  off.ctx.debug.showSwarm(null);
  play(off, t0);
}

// =====================================================================================================================
section('the valve: 8 s of the real clock from T0 opens the card whatever state the show is in; the records written once');
{
  // a stuck show (its clock at 2 %)
  const env = makeEnv({ seed: 41, known: ALL });
  env.ctx.debug.showRate(0.02);
  let i0 = env.events.length, t0 = env.toT0('mossback_perch', 0.4);
  let total = play(env, t0, { max: 14 });
  ok(near(total, SH.valve, 0.06) && env.F.view.show.phase === 'card' && env.ctx.cinematic === false, `a stuck show: the card at ${total.toFixed(2)} s (valve ${SH.valve})`);
  ok(env.count('fish:measured') === 1 && env.count('fish:landed') === 1 && JSON.stringify(orderFrom(env, i0)) === JSON.stringify(ORDER), 'the records written once, first; the events in order');
  env.ctx.debug.showRate(1);
  ok(env.ctx.debug.cerRate(1) === 1, 'cerRate is showRate\'s alias');
  // a stuck reveal (the game's clock all but stopped): fishing:caught still fires, the species still shows, then the card
  const sr = makeEnv({ seed: 42, known: ALL });
  i0 = sr.events.length; t0 = sr.toT0('mossback_perch', 0.4);
  for (let i = 0; i < 14 / DT && sr.F.inShow; i++) { sr.ctx.time.dt = DT; sr.ctx.time.gameDt = DT * 0.001; sr.ctx.time.t += DT; sr.F.update(DT * 0.001, sr.ctx.time.t); }
  total = sr.ctx.time.t - t0;
  ok(near(total, SH.valve, 0.06) && sr.F.view.show?.phase === 'card' && JSON.stringify(orderFrom(sr, i0)) === JSON.stringify(ORDER) && sr.count('fish:measured') === 1, `a stuck reveal: caught, measured and the card at ${total.toFixed(2)} s, in order`);
  ok(SH.valve + 4 < 20, 'main\'s cinematic valve (show.valve + 4 s) is the second line');
}

// =====================================================================================================================
section('abort: a run that ends or a reset mid-show measures the landed fish once, unfreezes the world, releases camera and Wick; no card');
{
  for (const at of ['reveal', 'lift', 'hold', 'pause']) {
    const env = makeEnv({ seed: 51, known: ALL });
    const i0 = env.events.length;
    env.toT0('reedjaw_pike', 2.4);
    for (let i = 0; i < 12 / DT && env.F.view.show.phase !== at; i++) env.tick(1);
    env.F.cancel('reset');
    const measured = env.count('fish:measured');
    ok(env.F.view.show === null && !env.F.inShow && env.ctx.cinematic === false && env.F.state === 'idle' && env.count('fishing:show', (p) => p.phase === 'card') === 0, `reset in the ${at}: no view, no card, the world unfrozen`);
    ok(measured === (at === 'reveal' ? 0 : 1), `reset in the ${at}: ${at === 'reveal' ? 'nothing was landed yet, nothing measured' : 'the landed fish measured once'}`);
    ok(env.calls.target.at(-1) === 'abort' && (at === 'reveal' || env.calls.endShow.length === 1), `reset in the ${at}: render.setShowTarget(null, {abort}); actors.endShow`);
    env.tick(60);
    ok(env.count('fish:measured') === measured && env.dbg() === null, `reset in the ${at}: nothing fires afterwards`);
    void i0;
  }
  const env = makeEnv({ seed: 52, known: ALL });
  env.toT0('reedjaw_pike', 2.4);
  for (let i = 0; i < 12 / DT && env.F.view.show.phase !== 'hold'; i++) env.tick(1);
  env.F.cancel('snap'); env.F.slam?.();
  ok(env.F.inShow && env.count('fishing:escaped') === 0, 'a hand slam or a knock during the show changes nothing');
  env.ctx.bus.emit('run:end', {});
  ok(!env.F.inShow && env.ctx.cinematic === false && env.count('fish:measured') === 1, 'run:end mid-show: released, measured once');
}

// =====================================================================================================================
section('a legend plays the Ancient\'s row and lies alongside; twenty shows in a row leave nothing behind');
{
  const env = makeEnv({ seed: 61, known: ALL });
  const i0 = env.events.length;
  const t0 = env.toT0('belled_matriarch', 0);
  ok(env.F.view.show.cls === 'ancient' && env.F.view.show.legendary === true && env.F.view.show.sizeClass === null, 'a legend: the Ancient\'s row, no size class');
  const total = play(env, t0, { max: 14 });
  ok(near(total, data.showPlan('ancient').total, 0.08) && env.calls.showFish[0].pose === 'alongside' && env.calls.showFish[0].legend === true && env.calls.showFish[0].special === true, `a legend: ${total.toFixed(2)} s, alongside, special`);
  ok(JSON.stringify(orderFrom(env, i0)) === JSON.stringify(ORDER), 'a legend: the same events in the same order');
  const many = makeEnv({ seed: 62, known: ALL });
  for (let i = 0; i < 20; i++) {
    const t = many.toT0(i % 2 ? 'mossback_perch' : 'dusk_minnow', (i % 5) * 0.5 - 0.8);
    play(many, t, { taps: i % 3 === 0 ? [0.2] : [] });
    many.setBlocking(true); many.tick(24);   // (the card is up for 0.4 s before its action)
    many.ctx.bus.emit('fish:action', { action: i % 2 ? 'keep' : 'release' });
    many.setBlocking(false); many.ctx.bus.emit('ui:modal', { open: false, id: 'catch' });
    many.tick(Math.round(0.7 / DT));
  }
  ok(many.count('fishing:caught') === 20 && many.count('fish:measured') === 20 && many.count('fish:landed') === 20 && many.count('fishing:show', (p) => p.phase === 'card') === 20, '20 fish: 20 caught, 20 measured, 20 landed, 20 cards');
  ok(many.calls.showFish.length === 20 && many.calls.endShow.length === 20 && many.calls.disposed === 20 && many.dbg() === null && many.ctx.cinematic === false && many.F.view.show === null, `20 shows: 20 showFish, 20 endShow, 20 models disposed; view.show null; nothing frozen (${many.calls.showFish.length} / ${many.calls.endShow.length} / ${many.calls.disposed} / ${JSON.stringify(many.dbg())})`);
}

// =====================================================================================================================
section('without the seam: actors with no showFish get the measuring stand-ins; a render with no setShowTarget gets the trophy shot');
{
  const env = makeEnv({ seed: 71, known: ALL, seam: false, cam: false });
  const i0 = env.events.length;
  const t0 = env.toT0('mossback_perch', 0.4);
  const total = play(env, t0);
  ok(near(total, data.showPlan('keeper').total, 0.08) && JSON.stringify(orderFrom(env, i0)) === JSON.stringify(ORDER), `the show still runs its clock and its events (${total.toFixed(2)} s)`);
  const fish = env.last('fishing:caught').fish;
  const standIn = { pinch: 'measurePalm', both: 'measureArms', hug: 'measureHang', hang: 'measureHang', alongside: 'measureAlongside' }[data.showPoseFor(fish.length / 100, { sizeClass: fish.sizeClass })];
  ok(env.calls.pose.includes(standIn) && env.calls.showCatch.includes(true) && env.calls.target.some((t) => t && t.trophy) && env.calls.target.at(-1) === null && env.calls.attention >= 1,
    `setPose(${standIn}) + showCatch; setTrophyTarget, then null; the reveal keeps its own push-in`);
}

// =====================================================================================================================
section('flag off: no show');
{
  const env = makeEnv({ D: dataV1, seed: 81 });
  env.ctx.debug.fishHook('dusk_minnow');
  env.ctx.debug.instantCatch(null, { show: true });
  ok(!env.F.inShow && env.F.view.show === null && env.ctx.cinematic === false && env.calls.showFish.length === 0 && env.calls.target.length === 0 && env.count('fishing:show') === 0, 'v1: no show, no view, no seam call');
  ok(env.F.hurryShow() === false, 'v1: nothing to hurry');
}

console.log(`\nfishing-show: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
