// Unit tests for the v3 Phase 1 visual half of fishing (DESIGN §25.14.2 F3, F5, F6 and the pressure hand-over; CONTRACT §13.7
// fishing / progression, §13.5 sign:*, fishing:reveal) on the v3 data at phase 1 (raft build), plus flag-off parity.
// The pure sign rules from src/fishing-signs.js, then the REAL src/fishing.js and src/progression.js together on a fake ctx
// (fake world / water / actors / models / render, with spies), seeded through fishing's fishSeed debug hook.
//   node tools/tests/fishing-p1b.test.mjs   (or node tools/check.mjs)
if (typeof globalThis.document === 'undefined') {
  const ctx2d = new Proxy({}, { get: (t, k) => (k === 'createImageData' ? (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h })
    : k === 'createRadialGradient' || k === 'createLinearGradient' ? () => ({ addColorStop() {} }) : k === 'measureText' ? () => ({ width: 40 }) : () => {}), set: () => true });
  globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx2d, style: {} }) };
}
import * as THREE from 'three';
import * as dataV1 from '../../src/data.js';                 // evaluated first: GW_V3 unset → the flag-off build
import { createBus, defaultMeta } from '../../src/core.js';
import * as SG from '../../src/fishing-signs.js';
import { create as createProgression } from '../../src/progression.js';
import { create as createFishing } from '../../src/fishing.js';

globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; globalThis.GW_WALK = false;
globalThis.GW_DEBUG = true;   // the scenario runner's debug switch: fishing's hidden-state hooks register in v3 builds (CONTRACT §13.1)
const data = await import('../../src/data.js?fishing-p1b');
delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE; delete globalThis.GW_WALK;

let pass = 0, fail = 0;
const VERBOSE = process.argv.includes('--verbose');
function ok(cond, msg) { if (cond) { pass++; if (VERBOSE) console.log('  ok:', msg); } else { fail++; console.log('  FAIL:', msg); } }
const section = (s) => console.log(`- ${s}`);
const near = (a, b, eps) => Math.abs(a - b) <= eps;
function mul(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const DT = 1 / 30;
// every roll seeded (fishing's own seeded draws come from debug.fishSeed; the v1 rolls it keeps unseeded use Math.random)
Math.random = mul(20261105);

// =====================================================================================================================
// the env: real progression + real fishing on one fake ctx
// =====================================================================================================================
function makeEnv({ D = data, mode = 'lantern', phase = 'calm', raft = [0, 46], a2 = true, swarm = false, seed = 7, runs = 1, paints = false, sil = false } = {}) {
  const bus = createBus();
  const events = [];
  const origEmit = bus.emit.bind(bus);
  bus.emit = (e, p = {}) => { events.push({ e, p, t: ctx.time.t }); origEmit(e, p); };
  const ph = { phase, day: 1 };
  const calls = { splash: [], ripple: [], wake: [], slowmo: [], cord: [], pose: [], showCatch: [], trophy: [], glow: [], cine: [], save: 0, createFish: [], sil: [] };
  let cine = false;
  const zone = D.ZONES.find((z) => z.id === 'mossmere');
  const wrng = mul(seed * 31 + 5);
  const ctx = {
    THREE, bus, data: D, flow: 'playing', paused: false, errors: [], debug: {}, isMobile: false,
    state: { meta: defaultMeta(), run: null },
    time: { dt: DT, gameDt: DT, t: 0, gameT: 0, timeScale: 1, frame: 1 },
    input: { move: { x: 0, y: 0 }, joy: { x: 0, y: 0 } },
    get cinematic() { return cine; },
    set cinematic(v) { if (!!v !== cine) calls.cine.push({ on: !!v, t: ctx.time.t }); cine = !!v; },
    game: { save() { calls.save++; }, slowmo(s, k) { calls.slowmo.push([s, k]); } },
    world: {
      getZone: () => zone, getDepth: () => ctx._depth ?? 0.7, isOpenWater: () => true,
      randomWaterPoint: (o = {}) => {
        const f = o.from || { x: 0, z: 0 }, a = wrng() * Math.PI * 2, d = (o.minDist ?? 6) + wrng() * ((o.maxDist ?? 30) - (o.minDist ?? 6));
        return { x: f.x + Math.cos(a) * d, z: f.z + Math.sin(a) * d };
      },
      getMerchantDock: (day) => ({ position: new THREE.Vector3(24, 0, 38 - day), yaw: 1 }), setGateState() {}, getGate: () => null,
    },
    water: {
      getHeight: () => 0,
      splash(x, z, o = {}) { calls.splash.push({ x, z, size: o.size }); },
      addRipple(x, z, s, o) { calls.ripple.push({ x, z, s, o: o && typeof o === 'object' ? o : null }); },
      addWake(x, z, dx, dz, s, o) { calls.wake.push({ x, z, s, o: o || null }); },
      setGlowtide() {},   // every build has it (CONTRACT §13.7 water); only a v3 water that paints signs has signKinds
      ...(paints ? { signKinds: ['rise', 'boil', 'nervous', 'strike', 'bubbles', 'glow'] } : {}),
    },
    actors: {
      setLine() {}, setBobber() {}, setPose(n) { calls.pose.push(n); }, setAim() {}, setCharge() {}, setReel() {}, getRodTip: () => null,
      showCatch(fv) { calls.showCatch.push(!!fv); }, getHeadPos: (o) => o.set(raft[0], 1.4, raft[1]),
      ...(a2 ? { showCord(L, k) { calls.cord.push([L, k]); } } : {}),
      merchant: { present: false, position: new THREE.Vector3(), arrive() { this.present = true; }, leave() { this.present = false; } }, setRaftLevel() {}, setCharacter() {},
    },
    models: {
      // A1's createFish(species, {z}) → the honest length in metres (a weight gets the v1 mid size)
      createFish(id, w) {
        const sp = D.SPECIES_BY_ID[id];
        const L = w && typeof w === 'object' && sp?.size ? D.sizeLength(sp, w.z, w.zone) / 100 : 0.5;
        calls.createFish.push({ id, arg: w, L });
        const fv = { object3d: new THREE.Group(), length: L, update() {}, setGlow(k) { calls.glow.push(k); }, dispose() {} };
        if (sil) { fv.silhouette = 0; fv.setSilhouette = (k) => { fv.silhouette = k; calls.sil.push(k); }; }   // models' FishVisual.setSilhouette
        return fv;
      },
    },
    render: { setTrophyTarget(t) { calls.trophy.push(t); }, getYaw: () => 0 },
    survival: { getPhaseInfo: () => ({ phase: ph.phase, day: ph.day, isNight: ph.phase === 'gloomtide' }), addOil() {}, addSatiety() {}, heal() {} },
    combat: { addXp() {}, get swarmActive() { return swarm; } },
    ui: { isBlocking: () => false, isShopOpen: () => false, floatText() {} },
    player: { position: new THREE.Vector3(raft[0], 0, raft[1]), speed: 0, near: null, isNear() { return false; } },
  };
  ctx.progression = createProgression(ctx);
  ctx.progression.init();
  const F = createFishing(ctx);
  ctx.fishing = F;
  F.init();
  ctx.state.meta.runs = runs;
  const run = ctx.progression.createRun({ character: 'wick', nightMode: mode });
  run.phase = phase;
  ctx.state.run = run;
  bus.emit('zone:change', { zone: run.zone, prev: null });
  bus.emit('run:start', { continued: false });
  ctx.debug.fishSeed(seed);
  const tick = (n = 1, dt = DT) => { for (let i = 0; i < n; i++) { ctx.time.dt = dt; ctx.time.gameDt = dt; ctx.time.t += dt; ctx.time.frame++; F.update(dt, ctx.time.t); } };
  tick(15);   // the zone settle (0.35 s) seeds the signs
  const setPhase = (p) => { ph.phase = p; run.phase = p; bus.emit('phase:change', { phase: p, prev: null }); };
  const reset = () => { F.cancel('reset'); tick(1); };
  const count = (e) => events.filter((x) => x.e === e).length;
  const last = (e) => [...events].reverse().find((x) => x.e === e)?.p;
  return { ctx, F, P: ctx.progression, run, events, calls, tick, setPhase, reset, count, last, dbg: () => ctx.debug.fishing(), raft: ctx.player.position };
}
/** Where debug.forceBite's cast lands from the raft (aim up-screen, d = max(6, castMax × 0.55)). */
const castPoint = (env) => { const d = Math.max(6, (env.P.getStats().castMax ?? 16) * 0.55); return { x: env.raft.x, z: env.raft.z - d }; };
/** A sign of `kind` placed so its rule meets that cast point; the sign is stepped until it has shown once. */
function signAt(env, kind, opts = {}) {
  const c = castPoint(env);
  let at = { x: c.x + (opts.dx ?? 0), z: c.z + (opts.dz ?? 0) };
  if (kind === 'glow') at = { x: c.x, z: c.z + 2 };   // heading north (−z) toward the bobber, 2 m short of it
  if (kind === 'nervous' && opts.edge !== false) at = { x: c.x + 2.0, z: c.z };   // the cast lands at its edge
  const s = env.ctx.debug.sign(kind, { x: at.x, z: at.z, heading: kind === 'glow' ? Math.PI : opts.heading, speciesId: opts.speciesId, size: opts.size, ttl: opts.ttl });
  return s;
}
function clearSigns(env) { for (const s of env.ctx.debug.fishSigns()) { /* ended by a zone settle */ } env.F.signs.length = 0; }
const signOf = (env, id) => env.ctx.debug.fishSigns().find((s) => s.id === id);

// =====================================================================================================================
section('F6 pure rules: each sign kind\'s cast rule and its effect (DESIGN §25.6.1)');
{
  const B = data.BALANCE.signs;
  const rng = mul(3);
  const rise = SG.createSign('rise', 0, 0, 0, { rng, B, ttl: 60 });
  rise.age = 2; rise.strength = 1;
  for (let t = 0; t < 2 && rise.shows === 0; t += 0.05) SG.stepSign(rise, 0.05, t, rng, B);
  ok(rise.shows === 1 && rise.lastAt >= 0, 'a rise shows its first ring within 2 s of appearing');
  const r0 = rise.lastAt;
  ok(!!SG.castRule(rise, rise.lastX + 2.4, rise.lastZ, r0 + 2.9, B)?.preroll, 'rise: 2.4 m, 2.9 s after the ring → its pre-rolled fish');
  ok(SG.castRule(rise, rise.lastX + 2.4, rise.lastZ, r0 + 2.9, B).waitMult === 0.5, 'rise: wait × 0.5');
  ok(!SG.castRule(rise, rise.lastX + 2.6, rise.lastZ, r0 + 1, B), 'rise: 2.6 m away → nothing');
  ok(!SG.castRule(rise, rise.lastX, rise.lastZ, r0 + 3.1, B), 'rise: 3.1 s after the ring → nothing');
  const boil = SG.createSign('boil', 10, 0, 0, { rng, B, ttl: 60 });
  boil.strength = 1; for (let t = 0; t < 2 && !boil.shows; t += 0.05) SG.stepSign(boil, 0.05, t, rng, B);
  ok(SG.castRule(boil, boil.lastX + 2.9, boil.lastZ, boil.lastAt + 7.9, B)?.preroll?.chance === 0.6, 'boil: 2.9 m, 7.9 s → the boil fish bites 60%');
  ok(!SG.castRule(boil, boil.lastX + 3.1, boil.lastZ, boil.lastAt + 1, B) && !SG.castRule(boil, boil.lastX, boil.lastZ, boil.lastAt + 8.1, B), 'boil: 3.1 m or 8.1 s → nothing');
  const nerv = SG.createSign('nervous', 20, 0, 0, { rng, B, ttl: 60 }); nerv.strength = 1;
  const edge = SG.castRule(nerv, 20 + nerv.radius, 0, 1, B);
  ok(edge?.predators === 3 && edge.favour === 0.3 && edge.inSign, 'nervous: at the patch edge → predators × 3, favour +0.3');
  const centre = SG.castRule(nerv, 20.2, 0, 1, B);
  ok(centre?.spook === true && centre.inSign === false, 'nervous: into the bait ball → the fry scatter (no effect, not "inside a sign")');
  ok(!SG.castRule(nerv, 20 + nerv.radius + 1.7, 0, 1, B), 'nervous: beyond the edge band → nothing');
  const chum = SG.createSign('nervous', 30, 0, 0, { rng, B, ttl: 30, chum: true }); chum.strength = 1;
  ok(SG.castRule(chum, 30, 0, 1, B)?.predators === 3, 'a chum patch takes the cast at its centre (the chum is where the bait is)');
  const strike = SG.createSign('strike', 40, 0, 0, { rng, B, ttl: 14 }); strike.strength = 1;
  SG.stepSign(strike, 0.1, 0.1, rng, B);
  ok(strike.shows === 1 && SG.castRule(strike, 43.9, 0, strike.lastAt + 9.9, B)?.favour === 0.6, 'strike: 3.9 m, 9.9 s → favour +0.6, predators × 3');
  ok(!SG.castRule(strike, 40, 0, strike.lastAt + 10.1, B) && !SG.castRule(strike, 44.2, 0, strike.lastAt + 1, B), 'strike: 10.1 s or 4.2 m → nothing');
  const bub = SG.createSign('bubbles', 50, 0, 0, { rng, B, ttl: 60 }); bub.strength = 1;
  for (let t = 0; t < 4; t += 0.1) SG.stepSign(bub, 0.1, t, rng, B);
  const hb = SG.castRule(bub, bub.head.x + 1.9, bub.head.z, 4, B);
  ok(hb?.bottom === 2 && hb.favour === 0.2 && !SG.castRule(bub, bub.head.x + 2.2, bub.head.z, 4, B), 'bubbles: at the head (1.9 m) → bottom feeders × 2, favour +0.2; 2.2 m → nothing');
  ok(Math.hypot(bub.head.x - 50, bub.head.z) > 0.8, 'a bubble trail creeps along (its head moved)');
  const glow = SG.createSign('glow', 60, 0, 0, { rng, B, ttl: 60, heading: 0 }); glow.strength = 1;
  const gx = glow.position.x + Math.sin(glow.heading) * 2, gz = glow.position.z + Math.cos(glow.heading) * 2;
  ok(SG.castRule(glow, gx, gz, 1, B)?.preroll?.chance === 0.7, 'glow: led by 2 m → its night fish bites 70%');
  ok(!SG.castRule(glow, glow.position.x - Math.sin(glow.heading) * 2, glow.position.z - Math.cos(glow.heading) * 2, 1, B), 'glow: behind it → nothing');
  ok(!SG.castRule(glow, glow.position.x + Math.sin(glow.heading) * 3.5, glow.position.z + Math.cos(glow.heading) * 3.5, 1, B), 'glow: led by 3.5 m → nothing');
  const n = { calm: {}, gloomtide: {} };
  for (const p of ['calm', 'gloomtide']) for (let i = 0; i < 2000; i++) { const k = SG.pickKind(p, rng, []); n[p][k] = (n[p][k] || 0) + 1; }
  ok(!n.calm.glow && n.gloomtide.glow > 600, `glow trails are night only and lead the night (${JSON.stringify(n.gloomtide)})`);
  ok(SG.pickKind('calm', () => 0.999, ['strike']) !== 'strike', 'one strike at a time');
  ok(SG.riseRadius(0.2) < SG.riseRadius(0.6) && SG.riseRadius(0.6) < SG.riseRadius(1.5), 'the ring radius grows with the fish\'s length');
  ok(SG.boilSize(0.6).a < SG.boilSize(2).a, 'the boil ellipse grows with the class');
  const best = SG.bestRule([nerv, Object.assign(SG.createSign('rise', 20 + nerv.radius, 0, 0, { rng, B, ttl: 60 }), { strength: 1, lastAt: 0.5, lastX: 20 + nerv.radius, lastZ: 0 })], 20 + nerv.radius, 0, 1, B);
  ok(best?.rule.kind === 'rise', 'where two signs overlap, a pre-rolled fish wins');
}

// =====================================================================================================================
section('F6 in game: 2–4 signs alive in calm within castMax + 15 m (sailing about for 6 minutes)');
{
  const env = makeEnv({ seed: 11 });
  const range = (env.P.getStats().castMax ?? 16) + 15;
  let mn = 99, mx = 0, outside = 0, samples = 0;
  const kinds = {};
  for (let s = 0; s < 360; s++) {
    if (s % 40 === 20) env.raft.set(env.raft.x + 12, 0, env.raft.z - 6);   // the raft moves on now and then
    env.tick(30);
    const sg = env.F.signs.filter((x) => !x.chum);
    const inR = sg.filter((x) => Math.hypot(x.position.x - env.raft.x, x.position.z - env.raft.z) <= range + 0.01).length;
    if (s > 5) { mn = Math.min(mn, sg.length); mx = Math.max(mx, sg.length); samples++; if (inR < 2) outside++; }
    for (const x of sg) kinds[x.kind] = (kinds[x.kind] || 0) + 1;
  }
  ok(mn >= 2 && mx <= 4, `alive in calm: min ${mn}, max ${mx}`);
  ok(outside <= samples * 0.03, `at least two of them within castMax + 15 m nearly always (${outside} of ${samples} samples short, right after sailing away)`);
  ok(!kinds.glow && Object.keys(kinds).length >= 4, `the day's kinds (no glow trails): ${JSON.stringify(kinds)}`);
  ok(env.F.spots === env.F.signs, 'fishing.spots is the signs\' alias in v3 (CONTRACT §13.7)');
  const sp = env.events.filter((x) => x.e === 'sign:spawn');
  const riseSp = sp.filter((x) => x.p.kind === 'rise');
  ok(sp.length > 10 && sp.every((x) => Number.isFinite(x.p.x) && Number.isFinite(x.p.z) && typeof x.p.id === 'number'), `sign:spawn carries id, kind, x, z (${sp.length})`);
  ok(riseSp.length > 0 && riseSp.every((x) => typeof x.p.sizeClass === 'string'), 'a rise\'s sign:spawn carries its sizeClass');
  const rings = env.events.filter((x) => x.e === 'sign:rise');
  ok(rings.length > 20 && rings.every((x) => Number.isFinite(x.p.x) && Number.isFinite(x.p.z) && typeof x.p.sizeClass === 'string' && x.p.kind === 'rise'), `sign:rise on every ring with x, z, sizeClass (${rings.length})`);
  ok(env.count('sign:end') > 5, 'signs end (sign:end)');
  ok(env.F.signs.every((s) => !('speciesId' in (s.prerolled || {}))), 'a sign never shows its fish\'s species (only its class and length)');
  env.setPhase('gloomtide');
  const nk = {};
  for (let s = 0; s < 120; s++) { env.tick(30); for (const x of env.F.signs) nk[x.kind] = (nk[x.kind] || 0) + 1; }
  ok(nk.glow > 0, `glow trails at night (${JSON.stringify(nk)})`);
  env.setPhase('dawn');
  env.tick(30 * 5);
  ok(!env.F.signs.some((s) => s.kind === 'glow'), 'dawn ends the glow trails');
}

// =====================================================================================================================
section('F6 water gets the signs only as tagged ripples / wakes (fishing-fx owns the drawing)');
{
  const env = makeEnv({ seed: 5, paints: true });
  env.tick(30 * 30);
  const tagged = env.calls.ripple.filter((r) => r.o?.kind);
  ok(tagged.length > 5 && tagged.every((r) => SG.SIGN_KINDS.includes(r.o.kind) && r.o.size > 0 && r.s <= 1), `water.addRipple(x, z, k, {kind, size}) for the painted signs (${tagged.length})`);
  const plainEnv = makeEnv({ seed: 5, paints: false });
  plainEnv.tick(30 * 30);
  ok(plainEnv.calls.ripple.length > 5 && plainEnv.calls.ripple.every((r) => !r.o), 'today\'s water (no sign painting): plain ripples only');
}

// =====================================================================================================================
section('F6 boil: a cast within 3 m in the 8 s after a boil bites the boil\'s fish 60% (500 seeded casts)');
{
  const env = makeEnv({ seed: 21 });
  let took = 0, n = 0, prizePlus = 0;
  for (let i = 0; i < 500; i++) {
    env.F.signs.length = 0;
    const s = signAt(env, 'boil', { dx: 1.5, dz: -1 });
    if (!s) continue;
    for (let k = 0; k < 60 && !(signOf(env, s.id)?.shows >= 1); k++) env.tick(1);
    env.tick(30);   // 1 s later (inside the 8 s window)
    env.ctx.debug.forceBite();
    const d = env.dbg();
    if (d.sign?.kind === 'boil') { n++; if (d.prerollTook) { took++; if (['prize', 'trophy', 'elder'].includes(d.sizeClass)) prizePlus++; } }
    env.reset();
  }
  ok(n >= 490, `the casts met the boil's rule (${n} of 500)`);
  ok(near(took / n, 0.6, 0.065), `the boil's fish bit ${(100 * took / n).toFixed(1)}% (60% ± 6.5)`);
  ok(prizePlus === took, `every boil fish is a Prize or better (${prizePlus} / ${took})`);
}

// =====================================================================================================================
section('F6 rise: within 2.5 m, ≤ 3 s after a ring → wait × 0.5 and that fish bites; glow: led by 1–3 m → 70%');
{
  const env = makeEnv({ seed: 31 });
  const waits = { rise: [], open: [] };
  let took = 0, n = 0, honest = 0;
  for (let i = 0; i < 300; i++) {
    env.F.signs.length = 0;
    const s = signAt(env, 'rise', { dx: 1 });
    for (let k = 0; k < 90 && !(signOf(env, s.id)?.shows >= 1); k++) env.tick(1);
    env.tick(10);
    env.ctx.debug.forceBite();   // the rolled wait is kept on the bite (forceBite only skips it)
    const d = env.dbg();
    if (d.sign?.kind === 'rise') { n++; waits.rise.push(d.wait); if (d.prerollTook) took++; }
    env.reset();
    env.F.signs.length = 0;
    env.ctx.debug.forceBite();
    if (!env.dbg().sign) waits.open.push(env.dbg().wait);
    env.reset();
    // the bite itself: the pre-rolled fish at the size its ring showed
    env.F.signs.length = 0;
    const s2 = signAt(env, 'rise', { dx: 0.5 });
    for (let k = 0; k < 90 && !(signOf(env, s2.id)?.shows >= 1); k++) env.tick(1);
    const p2 = signOf(env, s2.id)?.preroll;
    env.ctx.debug.forceBite();
    const d2 = env.dbg();
    if (d2.prerollTook && p2 && d2.species === p2.speciesId && d2.z === p2.z) honest++;
    env.reset();
  }
  ok(n >= 295 && took === n, `the rise's fish always takes (${took} / ${n})`);
  const mean = (a) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
  ok(near(mean(waits.rise) / mean(waits.open), 0.5, 0.06), `wait × 0.5 (mean ${mean(waits.rise).toFixed(2)} s vs ${mean(waits.open).toFixed(2)} s)`);
  ok(honest >= 290, `the fish that bites is the one the ring showed: same species and size score (${honest} / 300)`);
  // glow: a night fish led by 2 m
  env.setPhase('gloomtide');
  let gt = 0, gn = 0;
  for (let i = 0; i < 500; i++) {
    env.F.signs.length = 0;
    const s = signAt(env, 'glow');
    if (!s) continue;
    env.tick(2);
    env.ctx.debug.forceBite();
    const d = env.dbg();
    if (d.sign?.kind === 'glow') { gn++; if (d.prerollTook) gt++; }
    env.reset();
  }
  ok(gn >= 480 && near(gt / gn, 0.7, 0.065), `glow: led by 1–3 m, its fish bit ${(100 * gt / Math.max(1, gn)).toFixed(1)}% of ${gn} (70% ± 6.5)`);
}

// =====================================================================================================================
section('F6 nervous water, strike and bubbles: predators × 3 / bottom feeders × 2 and their favour on the float');
{
  const env = makeEnv({ seed: 41 });
  env.ctx._depth = 0.8;   // deep enough for the Reedjaw (the lake's predator)
  const share = (fam, setup) => {
    let hit = 0, n = 0, favour = null;
    for (let i = 0; i < 400; i++) {
      env.F.signs.length = 0;
      if (setup) setup();
      env.ctx.debug.forceBite();
      const d = env.dbg();
      if (!setup || d.sign) { n++; if (data.SPECIES_BY_ID[d.species]?.family === fam) hit++; }
      favour = favour ?? (env.F.view.favour?.terms || []).find((t) => t.family === 'signs')?.value ?? null;
      env.reset();
    }
    return { p: hit / Math.max(1, n), n, favour };
  };
  const base = share('predator', null);
  const nerv = share('predator', () => { signAt(env, 'nervous'); env.tick(2); });
  // the expected share with predators × 3, from the open-water share: 3p / (3p + 1 − p)
  const want = (3 * base.p) / (3 * base.p + 1 - base.p);
  ok(nerv.n >= 390 && near(nerv.p, want, 0.07), `nervous edge: predator share ${(100 * base.p).toFixed(1)}% → ${(100 * nerv.p).toFixed(1)}% (want ≈ ${(100 * want).toFixed(1)}%)`);
  ok(nerv.favour === 0.3, `nervous: favour +0.3 on the float (${nerv.favour})`);
  const strike = share('predator', () => { const s = signAt(env, 'strike', { dx: 2 }); env.tick(3); return s; });
  ok(strike.n >= 390 && near(strike.p, want, 0.07) && strike.favour === 0.6, `strike within 4 m, 10 s: predators × 3 (${(100 * strike.p).toFixed(1)}% of ${strike.n}, want ≈ ${(100 * want).toFixed(1)}%), favour +0.6 (${strike.favour})`);
  const bb = share('bottom', null);
  const bub = share('bottom', () => { signAt(env, 'bubbles', { dx: 1 }); env.tick(2); });
  const wantB = (2 * bb.p) / (2 * bb.p + 1 - bb.p);
  ok(bub.n >= 390 && near(bub.p, wantB, 0.07) && bub.favour === 0.2, `bubbles at the head: bottom share ${(100 * bb.p).toFixed(1)}% → ${(100 * bub.p).toFixed(1)}% (want ≈ ${(100 * wantB).toFixed(1)}%), favour +0.2`);
  // a cast into the bait ball's centre spooks it
  env.F.signs.length = 0;
  const c = castPoint(env);
  const s = env.ctx.debug.sign('nervous', { x: c.x + 0.3, z: c.z });
  env.tick(2);
  env.ctx.debug.forceBite({ wait: 5 });
  ok(env.dbg().sign?.spook === true && env.F.view.inSpot === false, 'a cast into the centre scatters the fry (no effect, not inside a sign)');
  env.tick(40);
  ok(!signOf(env, s.id), 'the scattered patch is gone');
  env.reset();
}

// =====================================================================================================================
section('F6 Murk\'s Chum: buying it makes the next cast spawn a 30 s nervous sign at the bobber');
{
  const env = makeEnv({ seed: 51 });
  const P = env.P;
  env.run.shells = 500;
  // Old Murk moored and the shop open: buy the supply through progression's shop (buySupply calls fishing.armChum())
  env.ctx.state.meta.shells = 500;
  env.ctx.debug.summonMerchant?.();
  env.ctx.ui.isShopOpen = () => true;
  ok(env.F.chumArmed !== true, 'not armed before the purchase');
  const bought = P.shop?.buy?.('supply:murks_chum');
  env.ctx.ui.isShopOpen = () => false;
  ok(bought?.ok === true && env.F.chumArmed === true, `buying Murk's Chum arms the next cast (${bought?.msg})`);
  const before = env.F.signs.length;
  env.ctx.debug.forceBite({ wait: 10 });
  const chum = env.F.signs.find((s) => s.chum);
  const b = env.F.bobberPos;
  ok(!!chum && chum.kind === 'nervous' && near(chum.ttl, 30, 0.2) && b && Math.hypot(chum.position.x - b.x, chum.position.z - b.z) < 0.01, `a nervous sign at the bobber for 30 s (ttl ${chum?.ttl?.toFixed(2)})`);
  ok(env.dbg().sign?.kind === 'nervous' && env.dbg().sign.inSign && (env.F.view.favour?.terms || []).some((t) => t.id === 'nervous' && t.value === 0.3), 'that cast gets the nervous effect (predators × 3, favour +0.3)');
  ok(env.F.chumArmed === false && env.F.signs.length <= 6 && env.F.signs.length >= Math.min(6, before), 'one chum, one sign; never more than six alive');
  env.reset();
  env.ctx.debug.forceBite({ wait: 10 });
  ok(env.F.signs.filter((s) => s.chum).length === 1, 'the next cast does not spawn another');
  env.reset();
  env.tick(31 * 30);
  ok(!env.F.signs.some((s) => s.chum), 'the chum patch is gone after 30 s');
}

// =====================================================================================================================
section('F6 quality: "cast inside a live sign" replaces the feeding-spot bonus');
{
  const env = makeEnv({ seed: 61 });
  const q = (setup) => {
    env.F.signs.length = 0;
    if (setup) setup();
    env.ctx.debug.fishHook('mossback_perch', { z: 0.2 });
    env.ctx.debug.instantCatch();
    const v = env.dbg().q;
    env.reset();
    return v;
  };
  const open = q(null);
  const inSign = q(() => { signAt(env, 'bubbles', { dx: 0.5 }); env.tick(2); });
  ok(near(inSign - open, data.AUTOFISH.quality.sign, 1e-6), `inside a sign: quality +${data.AUTOFISH.quality.sign} (AUTOFISH.quality; ${open.toFixed(3)} → ${inSign.toFixed(3)})`);
  const c0 = env.events.filter((x) => x.e === 'fishing:caught').slice(-2);
  ok(c0[0].p.inSign === false && c0[1].p.inSign === true && c0[1].p.sign === 'bubbles' && c0[1].p.inSpot === true, 'fishing:caught carries inSign / sign (and inSpot for v1 listeners)');
  const lands = env.events.filter((x) => x.e === 'fishing:land').slice(-2);
  ok(lands[1].p.inSign === true && lands[1].p.sign === 'bubbles', 'fishing:land carries the sign verdict (progression\'s signCatch bounty reads it)');
}

// =====================================================================================================================
section('F6 Night Eyes: glow trails show from 50% farther (glowTrailRangeMult)');
{
  const env = makeEnv({ seed: 71, phase: 'gloomtide' });
  const far = (env.P.getStats().castMax ?? 16) + 15 + 9;   // beyond the base range, inside × 1.5
  env.F.signs.length = 0;
  env.ctx.debug.sign('glow', { x: env.raft.x + far, z: env.raft.z });
  env.tick(60);
  const k0 = env.F.signs.find((s) => s.kind === 'glow');
  ok(!!k0, 'a glow trail out there');
  env.ctx.combat.boonProcs = (on) => (on === 'night' ? { glowTrailRangeMult: 1.5, nightBiteSpeed: 0.1 } : null);
  env.F.signs.length = 0;
  env.ctx.debug.sign('glow', { x: env.raft.x + far, z: env.raft.z });
  env.tick(60);
  ok(!!env.F.signs.find((s) => s.kind === 'glow' && s.ttl > 5), 'with Night Eyes a glow trail that far is not culled as out of reach');
}

// =====================================================================================================================
section('F3 → AF (F17): before the reveal the hooked fish is the night-ink proxy at its class length; no species model exists; a legend is itself');
{
  const env = makeEnv({ seed: 81 });
  const n0 = env.calls.createFish.length;
  env.calls.splash.length = 0;
  env.ctx.debug.fishHook('dusk_minnow', { z: -1.5 });
  let d = env.dbg();
  const pl = data.presentLength('mossmere', -1.5);
  ok(env.calls.createFish.length === n0, 'no createFish at the strike (it is first called at the reveal)');
  ok(near(d.fishLen, pl, 1e-9) && !near(pl, data.sizeLength(data.SPECIES_BY_ID.dusk_minnow, -1.5, 'mossmere') / 100, 0.01), `the proxy is ${(pl * 100).toFixed(1)} cm (presentLength), not the minnow's own length`);
  const hs = env.calls.splash.at(-1);
  ok(hs && near(hs.size, 0.45 + 0.25 * pl, 1e-6), `the strike's splash uses the class length (size ${hs?.size?.toFixed(3)})`);
  let none = true;
  for (let i = 0; i < 150 && env.F.state === 'reeling'; i++) { env.tick(1); if (env.F.state === 'reeling' && (env.calls.createFish.length !== n0 || env.F.view.speciesId !== null)) none = false; }
  ok(none, 'no species model and no species id at any moment of the play');
  env.reset();
  // a legend (named by its pool and bait): its own model at its true length, no 6 m cap
  env.calls.splash.length = 0;
  env.ctx.debug.fishHook('lantern_swallower', { z: 0 });
  d = env.dbg();
  const Lsw = data.sizeLength(data.SPECIES_BY_ID.lantern_swallower, 0, 'mossmere') / 100;
  ok(near(Lsw, 8.5, 0.05) && near(d.fishLen, Lsw, 1e-9) && d.meshScale === 1 && env.F.view.speciesId === 'lantern_swallower', `the Lantern-Swallower is itself, ${Lsw.toFixed(2)} m on the line (no 6 m cap)`);
  env.calls.splash.length = 0;
  env.ctx.debug.instantCatch(null, { ceremony: true });
  const sc = env.calls.splash.find((x) => near(x.size, 0.6 + Lsw * 0.6, 1e-6));
  ok(!!sc, `the scoop splashes at true scale (0.6 + 0.6 × ${Lsw.toFixed(2)} m)`);
  env.F.skipCeremony(); env.tick(40);
  env.reset();
}

// =====================================================================================================================
section('AF leaps (F2′): the first Prize+ leap slows time once (0.25 s at 0.35); the class estimate stamps at the first glimpse; no fishing:reveal');
{
  const env = makeEnv({ seed: 91 });
  const keep = data.AUTOFISH.leaps.gloam_eel;
  data.AUTOFISH.leaps.gloam_eel = 1;   // this play surely leaps
  env.ctx.debug.fishOutcome('land');
  env.ctx.debug.fishHook('gloam_eel', { z: 1.6 });   // a Prize
  ok(env.F.view.sizeClass === null, 'the class is not stamped at the strike');
  const plan = env.ctx.debug.fishPlan();
  const g0 = plan.events.find((e) => e.phase === 'glimpse' && e.first);
  let stampedAt = null, sawLeap = false;
  for (let i = 0; i < 30 * 12 && env.F.state === 'reeling'; i++) {
    env.tick(1);
    if (stampedAt === null && env.F.view.sizeClass) stampedAt = env.ctx.debug.fishPlay()?.t ?? null;
    if (env.F.view.play?.leap) sawLeap = true;
  }
  ok(env.calls.slowmo.length === 1 && env.calls.slowmo[0][0] === 0.25 && env.calls.slowmo[0][1] === 0.35, `ctx.game.slowmo(0.25, 0.35) once on the first leap (${JSON.stringify(env.calls.slowmo)}; ${plan.leapCount} leaps)`);
  ok(sawLeap && env.count('fishing:reveal') === 0, 'leaps play as the proxy; fishing:reveal is dropped (the reveal is fishing:caught)');
  ok(stampedAt !== null && g0 && Math.abs(stampedAt - g0.at) < 0.1, `view.sizeClass stamps at the first glimpse (${stampedAt?.toFixed(2)} s; plan ${g0?.at})`);
  for (let i = 0; i < 300 && env.F.state !== 'idle'; i++) { env.F.skipCeremony(); env.tick(1); }
  env.reset();
  env.ctx.debug.fishHook('gloam_eel', { z: 0.2 });   // a Keeper
  for (let i = 0; i < 30 * 8 && env.F.state === 'reeling'; i++) env.tick(1);
  ok(env.calls.slowmo.length === 1, 'a Keeper\'s skip slows nothing');
  data.AUTOFISH.leaps.gloam_eel = keep;
  env.ctx.debug.fishOutcome(null);
  for (let i = 0; i < 300 && env.F.state !== 'idle'; i++) { env.F.skipCeremony(); env.tick(1); }
  env.reset();
}

// =====================================================================================================================
section('the species stays unknown until the reveal: no name, no rarity, no model, no true length in the play; the reveal inks it back');
{
  const env = makeEnv({ seed: 95, sil: true });
  env.ctx.debug.fishOutcome('land');
  env.ctx.debug.fishHook('gloam_eel', { z: 1.6 });
  let hidden = true, n = 0;
  for (let i = 0; i < 30 * 12 && env.F.state === 'reeling'; i++) {
    env.tick(1); n++;
    if (env.F.state === 'reeling' && (env.F.view.speciesId !== null || env.F.view.rarity !== null || env.calls.createFish.some((c) => c.id === 'gloam_eel'))) hidden = false;
  }
  ok(n > 60 && hidden, `no species id, no rarity and no species model at any moment of the play (${n} frames)`);
  ok(env.events.filter((x) => x.e === 'toast').every((x) => !/eel/i.test(x.p.text || '')), 'no toast names it');
  for (let i = 0; i < 30 && env.F.state === 'landing' && !env.count('fishing:caught'); i++) env.tick(1);
  const cf = env.calls.createFish.filter((c) => c.id === 'gloam_eel');
  ok(cf.length === 1 && env.calls.sil[0] === 1 && env.calls.sil[env.calls.sil.length - 1] === 0, `the reveal: createFish once (${cf.length}), inked 1 → 0 over the wipe (${env.calls.sil.length} steps)`);
  ok(env.count('fishing:caught') === 1, 'fishing:caught as the wipe ends');
  env.F.skipCeremony(); env.tick(40);
  env.reset();
  env.ctx.debug.fishHook('lantern_swallower', { z: 0 });
  ok(env.F.view.speciesId === 'lantern_swallower' && env.dbg().meshVisible === true && !env.calls.sil.slice(-3).includes(1), 'a legend (named by its pool and bait) is shown as it is, never inked');
  env.ctx.debug.fishOutcome(null);
  env.reset();
}

// =====================================================================================================================
section('F5 the catch hand-off: makeFish at the landing, fishing:caught {fish}, the ceremony, measure at the stamp (once)');
{
  const env = makeEnv({ seed: 101 });
  // a listener registered AFTER progression: it hears fishing:caught before fish:measured (the P1 caveat, fixed)
  const order = [];
  env.ctx.bus.on('fishing:caught', () => order.push('caught'));
  env.ctx.bus.on('fish:measured', () => order.push('measured'));
  env.ctx.bus.on('fish:landed', () => order.push('landed'));
  const times = {};
  for (const [cls, sp, z, want] of [['keeper', 'mossback_perch', 0.4, 1.2], ['prize', 'mossback_perch', 1.5, 2.4], ['trophy', 'reedjaw_pike', 2.2, 3.5], ['elder', 'reedjaw_pike', 2.95, 5.0], ['small', 'dusk_minnow', -1, 1.2]]) {
    order.length = 0;
    const n0 = env.count('fish:measured');
    env.ctx.debug.fishHook(sp, { z });
    env.ctx.debug.instantCatch(null, { ceremony: true });
    const caught = env.last('fishing:caught');
    ok(caught?.fish?.uid && caught.fish.z === z && caught.sizeClass === cls, `${cls}: fishing:caught carries the Fish from progression.makeFish (uid ${caught?.fish?.uid})`);
    ok(env.ctx.cinematic === true && env.count('fish:measured') === n0, `${cls}: the ceremony is a cinematic state; nothing measured yet`);
    const m0 = env.F.view.measure;
    ok(m0?.phase === 'scoop' && m0.length === caught.fish.length && near(m0.cordDur, want * 1.4 / 3.6, 0.011), `${cls}: view.measure {phase scoop, length ${m0?.length} cm (final), cordDur ${m0?.cordDur}}`);
    const phases = [];
    let tStamp = null, tEnd = null;
    const t0 = env.ctx.time.t;
    for (let i = 0; i < 400 && env.F.inCeremony; i++) {
      env.tick(1);
      const m = env.F.view.measure;
      if (m && phases[phases.length - 1] !== m.phase) phases.push(m.phase);
      if (tStamp == null && env.count('fish:measured') > n0) tStamp = env.ctx.time.t - t0;
    }
    tEnd = env.ctx.time.t - t0;
    times[cls] = tEnd;
    ok(near(tEnd, want, 0.05), `${cls}: the ceremony lasts ${tEnd.toFixed(2)} s (§25.6.8: ${want} s)`);
    ok(tStamp != null && near(tStamp, want * 2.8 / 3.6, 0.05), `${cls}: the seal stamps at ${tStamp?.toFixed(2)} s (the cord's end, ${(want * 2.8 / 3.6).toFixed(2)} s)`);
    ok(JSON.stringify(phases) === JSON.stringify(['scoop', 'pose', 'cord', 'banners', 'card']), `${cls}: scoop → pose → cord → banners → card (${phases.join(' → ')})`);
    ok(env.count('fish:measured') === n0 + 1, `${cls}: fish:measured exactly once`);
    ok(JSON.stringify(order) === JSON.stringify(['caught', 'measured', 'landed']), `${cls}: fishing:caught → fish:measured → fish:landed (${order.join(' → ')})`);
    ok(env.ctx.cinematic === false && env.F.state === 'idle', `${cls}: the card's turn ends the cinematic state`);
    const fl = env.last('fish:landed');
    ok(fl?.measured === true && Array.isArray(fl.favours) && fl.fish?.uid === caught.fish.uid, `${cls}: fish:landed {measured: true, favours} opens the card`);
    env.reset();
  }
  // the measuring pose by length (the Wick is 0.85 m) and the cord spanning the fish
  const poseFor = (L) => (L < 0.25 ? 'measurePalm' : L < 0.85 ? 'measureArms' : L < 2 ? 'measureHang' : 'measureAlongside');
  for (const [sp, z] of [['dusk_minnow', -1.2], ['mossback_perch', 0.4], ['reedjaw_pike', 2.95], ['lantern_swallower', 0]]) {
    env.calls.pose.length = 0; env.calls.cord.length = 0;
    env.ctx.debug.fishHook(sp, { z });
    env.ctx.debug.instantCatch(null, { ceremony: true });
    const L = env.last('fishing:caught').fish.length / 100;
    for (let i = 0; i < 400 && env.F.inCeremony; i++) env.tick(1);
    const ks = env.calls.cord.filter((c) => c[1] > 0).map((c) => c[1]);
    ok(env.calls.pose.includes(poseFor(L)), `${sp} at ${(L * 100).toFixed(0)} cm: actors.setPose('${poseFor(L)}')`);
    ok(ks.length > 5 && ks.every((k, i) => i === 0 || k >= ks[i - 1]) && ks.at(-1) === 1 && env.calls.cord.every((c) => c[0] === L || c[0] === 0) && env.calls.cord.at(-1)[1] === 0,
      `${sp}: showCord(${L.toFixed(2)} m, k) unrolls 0 → 1, then is put away`);
    env.reset();
  }
  // without actors' A2 (no showCord): the v1 catch hold
  const v1a = makeEnv({ seed: 102, a2: false });
  v1a.ctx.debug.fishHook('mossback_perch', { z: 0.4 });
  v1a.ctx.debug.instantCatch(null, { ceremony: true });
  for (let i = 0; i < 200 && v1a.F.inCeremony; i++) v1a.tick(1);
  ok(v1a.calls.pose.includes('catch') && !v1a.calls.pose.some((p) => p.startsWith('measure')) && v1a.count('fish:measured') === 1, 'actors without the cord prop: the catch pose, still measured once');
}

// =====================================================================================================================
section('F5 skippable: a tap skips to the card (an Elder only after 0.6 s); a swarm window plays every class short; a reset still measures once');
{
  const env = makeEnv({ seed: 111 });
  env.ctx.debug.fishHook('mossback_perch', { z: 0.4 });
  env.ctx.debug.instantCatch(null, { ceremony: true });
  env.tick(3);
  env.ctx.fishing.onPointerDown();
  ok(!env.F.inCeremony && env.ctx.cinematic === false && env.count('fish:measured') === 1 && env.F.view.measure?.phase === 'card', 'a Keeper: a tap at 0.1 s skips (stamped once, the card next)');
  env.reset();
  env.ctx.debug.fishHook('reedjaw_pike', { z: 2.95 });
  env.ctx.debug.instantCatch(null, { ceremony: true });
  env.tick(9);
  env.ctx.fishing.onPointerDown();
  ok(env.F.inCeremony && env.count('fish:measured') === 1, 'an Elder: a tap at 0.3 s does nothing');
  env.tick(10);
  env.ctx.fishing.onPointerDown();
  ok(!env.F.inCeremony && env.count('fish:measured') === 2 && env.ctx.cinematic === false, 'an Elder: a tap at 0.63 s skips');
  env.reset();
  const sw = makeEnv({ seed: 112, swarm: true });
  sw.ctx.debug.fishHook('reedjaw_pike', { z: 2.95 });
  sw.ctx.debug.instantCatch(null, { ceremony: true });
  let t = 0;
  for (let i = 0; i < 400 && sw.F.inCeremony; i++) { sw.tick(1); t += DT; }
  ok(near(t, 1.2, 0.05) && sw.count('fish:measured') === 1, `in a swarm window an Elder plays the 1.2 s variant (${t.toFixed(2)} s)`);
  const ab = makeEnv({ seed: 113 });
  ab.ctx.debug.fishHook('mossback_perch', { z: 1.4 });
  ab.ctx.debug.instantCatch(null, { ceremony: true });
  ab.tick(5);
  ab.F.cancel('reset');
  ok(ab.count('fish:measured') === 1 && ab.ctx.cinematic === false && !ab.F.inCeremony, 'a reset mid-ceremony still measures the landed fish (once) and clears the cinematic state');
  ab.F.cancel('snap');
  ok(ab.count('fishing:escaped') === 0, 'nothing escapes a landed fish');
  // twenty catches: fish:measured once per landed fish
  const many = makeEnv({ seed: 114 });
  for (let i = 0; i < 20; i++) {
    many.ctx.debug.fishHook(i % 2 ? 'mossback_perch' : 'dusk_minnow', { z: (i % 5) * 0.5 - 0.8 });
    many.ctx.debug.instantCatch(null, { ceremony: i % 3 !== 0 });
    for (let k = 0; k < 200 && many.F.inCeremony; k++) { if (k === 7 && i % 4 === 1) many.ctx.fishing.onPointerDown(); many.tick(1); }
  }
  const caughtFish = many.events.filter((x) => x.e === 'fishing:caught' && x.p.fish).length;
  ok(caughtFish === 20 && many.count('fish:measured') === 20 && many.count('fish:landed') === 20, `20 landed fish → 20 fish:measured, 20 fish:landed (${many.count('fish:measured')})`);
  ok(many.ctx.state.run.creel.length + 0 >= 1, 'the fish went to the creel (progression.measure)');
  // the trophy camera
  const tr = many.calls.trophy.filter((x) => x);
  ok(tr.length > 5 && tr.every((x) => x.length > 0 && 'landmark' in x) && many.calls.trophy.at(-1) === null, 'render.setTrophyTarget({length, landmark, position}) for each ceremony, then null');
}

// =====================================================================================================================
section('F5 the card lists the favours that applied; best setup per species at the PB');
{
  const env = makeEnv({ seed: 121, phase: 'dusk' });
  env.ctx.debug.fishHook('weeping_carp', { z: 1.2 });
  env.ctx.debug.instantCatch(null, { ceremony: true });
  for (let i = 0; i < 200 && env.F.inCeremony; i++) env.tick(1);
  const fl = env.last('fish:landed');
  ok(fl.favours.some((t) => t.family === 'hour' && t.id === 'dusk' && t.value === 0.2), `the card's favours include the dusk hour (${JSON.stringify(fl.favours)})`);
  const j = env.ctx.state.meta.journal.weeping_carp;
  ok(j && JSON.stringify(j.bestSetup) === JSON.stringify(fl.favours) && j.pbLength === fl.fish.length, 'the Journal keeps the best setup (the favours of the PB)');
}

// =====================================================================================================================
section('pressure: progression owns the count (run.pressure by fishing:caught.pressureKey, saved); fishing reads it back');
{
  const env = makeEnv({ seed: 131, raft: [4, 14.8] });   // the stopgap's deep-centre giant water
  for (let i = 0; i < 3; i++) {
    env.ctx.debug.forceBite({ speciesId: 'mossback_perch' });
    env.ctx.debug.instantCatch();
    env.reset();
  }
  const key = env.last('fishing:caught').pressureKey;
  ok(key === 'mm_deep_centre' && env.run.pressure?.[key] === 3, `run.pressure counts the catches (${JSON.stringify(env.run.pressure)})`);
  ok(env.P.getPressure(key) === -0.36, `getPressure(${key}) = −0.36`);
  env.ctx.debug.forceBite({ speciesId: 'mossback_perch' });
  ok(env.F.view.favour?.quiet === true && (env.F.view.favour.terms || []).find((t) => t.family === 'pressure')?.value === -0.36, 'the float: gone quiet, pressure −0.36');
  env.reset();
  // a reload: a fresh fishing (its own count lost) reading the saved run
  const saved = JSON.parse(JSON.stringify(env.run));
  const env2 = makeEnv({ seed: 132, raft: [4, 14.8] });
  env2.ctx.state.run.pressure = saved.pressure;
  env2.ctx.debug.forceBite({ speciesId: 'mossback_perch' });
  ok(env2.F.view.favour?.quiet === true && env2.dbg().pressureKey === key, 'after a reload the place is still quiet (progression\'s saved count)');
  env2.reset();
  env2.setPhase('dawn');
  ok(!env2.run.pressure || !Object.keys(env2.run.pressure).length, 'dawn clears it');
  for (let i = 0; i < 6; i++) { env2.ctx.debug.forceBite({ speciesId: 'mossback_perch' }); env2.ctx.debug.instantCatch(); env2.reset(); }
  ok(env2.P.getPressure(key) === -0.6, 'floor −0.6');
  env2.ctx.debug.forceBite({ speciesId: 'lantern_swallower' }); env2.ctx.debug.instantCatch(); env2.reset();
  ok(env2.run.pressure[key] === 6, 'a legend does not count');
}

// =====================================================================================================================
section('flag off: feeding spots, the v1 boost, no ceremony, no signs, v1 payloads');
{
  const env = makeEnv({ D: dataV1, seed: 141 });
  ok(env.F.spots !== env.F.signs && env.F.spots.length >= 2 && env.F.signs.length === 0, `feeding spots (${env.F.spots.length}), no signs`);
  env.ctx.debug.fishHook('dusk_minnow');
  const d = env.dbg();
  ok(d.meshScale > 1 && d.meshScale <= 1.45, `the v1 mid-fight boost stays (${d.meshScale.toFixed(3)})`);
  ok(typeof env.calls.createFish.at(-1).arg === 'number', 'createFish gets the v1 weight');
  env.ctx.debug.instantCatch(null, { ceremony: true });
  ok(!env.F.inCeremony && env.ctx.cinematic === false, 'no ceremony');
  const c = env.last('fishing:caught');
  ok(c && !('fish' in c) && !('inSign' in c) && !('z' in c), 'fishing:caught is the v1 payload');
  const l = env.events.filter((x) => x.e === 'fishing:land').at(-1)?.p;
  ok(l && Object.keys(l).join() === 'position', 'fishing:land is the v1 payload');
  ok(env.F.armChum() === false && !env.events.some((x) => x.e.startsWith('sign:')), 'no armChum, no sign events');
  ok(env.calls.slowmo.length === 0 && env.count('fishing:reveal') === 0, 'no leap reveal');
  ok(env.P.getPressure('anything') === 0 && !env.run.pressure, 'no pressure');
}

console.log(`\nfishing-p1b: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
