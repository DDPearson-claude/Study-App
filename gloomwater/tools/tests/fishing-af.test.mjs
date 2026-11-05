// Acceptance tests of automatic fishing's fishing items (DESIGN §25.14.2a F4′, F2′, F17; CONTRACT §13.7a) on the v3 data at phase 1
// (raft build): the REAL src/fishing.js on a fake ctx that records every bus event, fishing.view, every fx / actors / water / render
// / models / audio call and the raft, so traces can be compared frame by frame.
//   node tools/tests/fishing-af.test.mjs   (or node tools/check.mjs; --verbose prints every passing check; --quick: fewer plays)
import * as THREE from 'three';
import { readFileSync } from 'node:fs';
if (typeof globalThis.document === 'undefined') {
  const ctx2d = new Proxy({}, { get: (t, k) => (k === 'createImageData' ? (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h })
    : k === 'createRadialGradient' || k === 'createLinearGradient' ? () => ({ addColorStop() {} }) : k === 'measureText' ? () => ({ width: 40 }) : () => {}), set: () => true });
  globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx2d, style: {} }) };
}
await import('../../src/data.js');   // the flag-off build first (other suites rely on the plain import being flag-off)
globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; globalThis.GW_WALK = false;
globalThis.GW_DEBUG = true;           // the scenario runner's switch: fishing's hidden-state debug hooks register
const D = await import('../../src/data.js?fishing-af');
delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE; delete globalThis.GW_WALK;
const { createBus } = await import('../../src/core.js');
const { create: createFishing } = await import('../../src/fishing.js');
const { planPlay, drawStrike, mulberry32 } = await import('../../src/fishing-play.js');

const QUICK = process.argv.includes('--quick');
const VERBOSE = process.argv.includes('--verbose');
let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; if (VERBOSE) console.log('  ok:', msg); } else { fail++; console.log('  FAIL:', msg); } }
const section = (s) => console.log(`- ${s}`);
const near = (a, b, eps) => Math.abs(a - b) <= eps;
const DT = 1 / 30;
const A = D.AUTOFISH, C = D.CATCH_V3;
const SP = (id) => D.SPECIES_BY_ID[id];
const realRandom = Math.random;
const f5 = (v) => (typeof v === 'number' ? (Number.isFinite(v) ? Math.round(v * 1e5) / 1e5 : String(v)) : v);
function plain(v, depth = 0) {
  if (v == null || typeof v === 'boolean' || typeof v === 'string') return v ?? null;
  if (typeof v === 'number') return f5(v);
  if (typeof v === 'function' || depth > 5) return undefined;
  if (Array.isArray(v)) return v.map((x) => plain(x, depth + 1));
  if (v.isVector3 || (typeof v.x === 'number' && typeof v.y === 'number' && typeof v.z === 'number' && Object.keys(v).length <= 3)) return [f5(v.x), f5(v.y), f5(v.z)];
  if (v.isObject3D || v.isMaterial || v.isBufferGeometry) return '[three]';
  const o = {};
  for (const k of Object.keys(v).sort()) { const x = plain(v[k], depth + 1); if (x !== undefined) o[k] = x; }
  return o;
}
const J = (v) => JSON.stringify(plain(v));
/** The first line two recorded frames differ in (state, view, raft or a call). */
function frameDiff(a, b) {
  if (!a || !b) return `missing frame (${!!a} / ${!!b})`;
  if (a.state !== b.state) return `state ${a.state} / ${b.state}`;
  if (a.raft.join() !== b.raft.join()) return `raft ${a.raft} / ${b.raft}`;
  if (a.view !== b.view) { const x = JSON.parse(a.view), y = JSON.parse(b.view); const k = Object.keys(x).find((q) => JSON.stringify(x[q]) !== JSON.stringify(y[q])); return `view.${k} ${JSON.stringify(x[k])} / ${JSON.stringify(y[k])}`; }
  const n = Math.max(a.calls.length, b.calls.length);
  for (let i = 0; i < n; i++) if (a.calls[i] !== b.calls[i]) return `${String(a.calls[i]).slice(0, 110)} ≠ ${String(b.calls[i]).slice(0, 110)}`;
  return null;
}

// =====================================================================================================================
// the env: real fishing, a recording ctx
// =====================================================================================================================
function makeEnv({ mode = 'lantern', outing = 'normal', phase = 'calm', raft = [30, 30], zoneId = 'mossmere', seed = 42, rseed = 7, runs = 1,
  loadout = null, buffs = null, depth = 0.7, record = true, relics = {}, sil = true } = {}) {
  let rand = mulberry32(rseed);   // each env its own Math.random (two envs played side by side never share draws)
  const prevRandom = Math.random;
  Math.random = rand;
  const bus = createBus();
  const events = [], frames = [];
  let fr = [];
  const rec = (s) => { if (record) fr.push(s); };
  const origEmit = bus.emit.bind(bus);
  bus.emit = (e, p = {}) => { events.push({ e, p, f: frames.length }); rec(`ev ${e} ${J(p)}`); origEmit(e, p); };
  const zone = D.ZONES.find((z) => z.id === zoneId);
  const calls = { refund: [], createFish: [], slowmo: [], pan: [], tow: [], audio: [], banner: [], spawn: [] };
  const ph = { phase };
  const run = { active: true, zone: zoneId, day: 1, phase, nightMode: mode, outing, upgrades: {}, bait: { mireworm: 99 }, equippedBait: 'mireworm', flags: {}, hp: 3, oil: 80, satiety: 50, boons: {}, character: 'wick' };
  const prog = {
    getStats: () => ({ castMax: 16, hookWindow: 1, biteSpeed: 1, rarityBonus: 0, nibbleTells: 0, maxOil: 100 }),
    consumeBait: () => run.equippedBait, getEquippedBait: () => run.equippedBait,
    refundBait: (id) => { calls.refund.push(id); return true; }, measure: () => ({ records: [] }),
    makeFish: (id, z, quality, o = {}) => { const s = SP(id); const L = D.sizeLength(s, z, zoneId); return { uid: 1, speciesId: id, z, sizeClass: D.sizeClassOf(z), ancient: D.isAncient(z), length: Math.round(L * 10) / 10, weight: D.sizeWeight(s, L), quality, favours: o.favours || [], place: o.place ?? null }; },
  };
  if (loadout) prog.getLoadout = () => JSON.parse(JSON.stringify(loadout));
  if (buffs) prog.getCatchBuffs = () => JSON.parse(JSON.stringify(buffs));
  const ctx = {
    THREE, bus, data: D, flow: 'playing', paused: false, errors: [], debug: {}, isMobile: false, cinematic: false,
    state: { meta: { settings: {}, relics: { ...relics }, runs }, run },
    time: { dt: DT, gameDt: DT, t: 0 }, input: { move: { x: 0, y: 0 }, joy: { x: 0, y: 0 }, ndc: { x: 0, y: 0 } },
    game: { slowmo: (s, k) => { calls.slowmo.push([s, k]); rec(`slowmo ${s} ${k}`); } },
    world: { getZone: () => zone, getDepth: () => ctx._depth ?? depth, isOpenWater: () => true, randomWaterPoint: () => null },
    water: {
      getHeight: () => 0,
      splash: (x, z, o = {}) => rec(`sp ${f5(x)} ${f5(z)} ${f5(o.size)} ${o.count}`),
      addRipple: (x, z, s, o) => rec(`rp ${f5(x)} ${f5(z)} ${f5(s)} ${J(o || null)}`),
      addWake: (x, z, dx, dz, s, o) => rec(`wk ${f5(x)} ${f5(z)} ${f5(dx)} ${f5(dz)} ${f5(s)} ${J(o || null)}`),
    },
    actors: {
      setLine: (l) => rec(`ln ${l.visible ? 1 : 0} ${J(l.end)} ${f5(l.tension)} ${f5(l.slack)}`),
      setBobber: (b) => rec(`bb ${b.visible ? 1 : 0} ${b.state} ${J(b.position)}`),
      setPose: (n) => rec(`po ${n}`), setAim: (y) => rec(`am ${f5(y)}`), setCharge: (c) => rec(`ch ${f5(c)}`), setReel: (a, b) => rec(`re ${f5(a)} ${f5(b)}`),
      setEffort: (c, b) => rec(`ef ${c} ${b}`), getRodTip: () => null, showCatch: (fv) => rec(`sc ${fv ? 1 : 0}`), getHeadPos: (o) => o.set(raft[0], 1.4, raft[1]),
    },
    models: {
      createFish(id, w) {
        calls.createFish.push({ id, w }); rec(`cf ${id}`);
        const s = SP(id), L = w && typeof w === 'object' && s?.size ? D.sizeLength(s, w.z, w.zone) / 100 : 0.5;
        const fv = { object3d: new THREE.Group(), length: L, update() {}, setGlow() {}, dispose() {} };
        if (sil) { fv.silhouette = 0; fv.setSilhouette = (k) => { fv.silhouette = k; }; }
        return fv;
      },
    },
    render: { getYaw: () => 0, setPan: (d) => { calls.pan.push(d); rec(`pan ${f5(d)}`); }, setTrophyTarget: (t) => rec(`trophy ${J(t)}`), shake: (a, b) => rec(`shake ${a} ${b}`) },
    audio: { play: (n, o) => { calls.audio.push(n); rec(`au ${n} ${J(o || null)}`); } },
    survival: { getPhaseInfo: () => ({ phase: ph.phase, day: run.day, isNight: ph.phase === 'gloomtide' }) },
    combat: { spawnEnemy: (id) => { calls.spawn.push(id); return { id }; } },
    ui: { isBlocking: () => false, floatText() {}, banner: (a, b) => calls.banner.push([a, b]) },
    progression: prog,
    player: { position: new THREE.Vector3(raft[0], 0, raft[1]), speed: 0, tow(dx, dz) { calls.tow.push([dx, dz]); this.position.x += dx; this.position.z += dz; } },
  };
  const F = createFishing(ctx);
  ctx.fishing = F;
  F.init();
  ctx.debug.fishSeed?.(seed);
  // trace every fx call (the fx object is fishing's; its methods are looked up at call time)
  const fx = ctx.debug.fishFx();
  for (const k of Object.keys(fx)) {
    const desc = Object.getOwnPropertyDescriptor(fx, k);
    if (!desc || typeof desc.value !== 'function' || k === 'update' || k === 'dispose') continue;
    const fn = desc.value;
    fx[k] = (...a) => { rec(`fx.${k} ${J(a)}`); return fn.apply(fx, a); };
  }
  const tick = (n = 1, dt = DT) => {
    for (let i = 0; i < n; i++) {
      ctx.time.dt = dt; ctx.time.t += dt; F.update(dt, ctx.time.t);
      if (record) { const v = { ...F.view }; delete v.measure; frames.push({ state: F.state, view: J(v), calls: fr, raft: [f5(ctx.player.position.x), f5(ctx.player.position.z)] }); }
      fr = [];
    }
  };
  // every call into fishing runs on this env's own random stream
  const withRand = (fn) => function (...a) { const prev = Math.random; Math.random = rand; try { return fn.apply(this, a); } finally { Math.random = prev; } };
  for (const k of ['onPointerDown', 'onPointerUp', 'onPointerMove', 'update', 'cancel', 'slam', 'partLine', 'skipCeremony', 'setTutorial']) if (typeof F[k] === 'function') F[k] = withRand(F[k]);
  for (const k of Object.keys(ctx.debug)) if (typeof ctx.debug[k] === 'function' && k !== 'fishFx') ctx.debug[k] = withRand(ctx.debug[k]);
  Math.random = prevRandom;
  tick(12);   // the zone settle
  const setPhase = (p) => { ph.phase = p; run.phase = p; };
  const reset = () => { F.cancel('reset'); tick(1); };
  const last = (e) => [...events].reverse().find((x) => x.e === e)?.p;
  const reseed = (n) => { rand = mulberry32(n); };
  return { ctx, F, run, events, frames, calls, tick, setPhase, reset, reseed, last, dbg: () => ctx.debug.fishing() };
}
/** Force a bite of a species at z (the short wait and the class tell play out), then return when the bite is live. */
function toBite(env, speciesId, z, wait = 2) {
  env.ctx.debug.forceBite({ speciesId, z, wait });
  for (let i = 0; i < 300 && env.F.state === 'waiting'; i++) env.tick(1);
  return env.F.state === 'bite';
}
/** Play one whole cast: bite, a strike at `at` s after the "!", the play, to idle (the ceremony skipped). */
function playOnce(env, speciesId, z, { at = 0.2, input = 'mouse', outcome = null, cause = null, maxFrames = 3000 } = {}) {
  env.ctx.debug.fishOutcome(outcome, cause);
  if (!toBite(env, speciesId, z)) return null;
  const n = Math.max(0, Math.round(at / DT));
  env.tick(n);
  env.F.onPointerDown({ input }); env.F.onPointerUp();
  for (let i = 0; i < maxFrames && env.F.state !== 'idle'; i++) { env.F.skipCeremony(); env.tick(1); }
  env.ctx.debug.fishOutcome(null);
  return env.F.state;
}
const zFor = { small: -1.0, keeper: 0.4, prize: 1.45, trophy: 2.25, elder: 2.9, ancient: 3.4 };

// =====================================================================================================================
section('F4′ the strike window by class (never by species): window[class] × hookWindow × (1 + bait.hookWindow), clamped; Clean = 40%, ≥ 0.3 s');
{
  const env = makeEnv({ raft: [4, 14.8] });   // giant water: every class is legal
  const baitW = D.BAIT_BY_ID.mireworm?.bonus?.hookWindow || 0;
  for (const [cls, z] of Object.entries(zFor)) {
    const ws = [];
    for (const id of ['reedjaw_pike', 'mossback_perch', 'dusk_minnow']) {
      if (!D.catchClassAllowed(SP(id), cls)) continue;
      env.reset(); env.tick(5);
      toBite(env, id, z);
      const d = env.dbg();
      ws.push([id, d.window, d.cleanPart]);
    }
    const want = Math.min(A.strike.clamp[1], Math.max(A.strike.clamp[0], A.strike.window[cls] * 1 * (1 + baitW)));
    const clean = Math.max(A.strike.cleanMin, A.strike.cleanFrac * want);
    ok(ws.length >= 2 && ws.every(([, w, c]) => near(w, want, 1e-9) && near(c, clean, 1e-9)), `${cls}: window ${want.toFixed(3)} s, Clean ${clean.toFixed(3)} s for ${ws.map((w) => w[0]).join(', ')}`);
  }
  env.reset(); env.tick(5);
  env.ctx.progression.getStats = () => ({ castMax: 16, hookWindow: 1.16, biteSpeed: 1 });
  toBite(env, 'reedjaw_pike', zFor.trophy);
  ok(near(env.dbg().window, A.strike.window.trophy * 1.16 * (1 + baitW), 1e-6), `the Rod's ×1.16 widens it (${env.dbg().window.toFixed(3)} s)`);
}

section('F4′ grades at each timing, per class and per input (latency compensated; ± 1 frame): Early, Clean, Struck, Late, passed');
{
  let good = 0, n = 0;
  const bad = [];
  for (const [cls, z] of Object.entries(zFor)) for (const input of ['touch', 'mouse', 'key']) {
    const comp = A.strike.latencyComp[input];
    const win = A.strike.window[cls] * (1 + (D.BAIT_BY_ID.mireworm?.bonus?.hookWindow || 0)), clean = Math.max(A.strike.cleanMin, A.strike.cleanFrac * win);
    for (const [want, tTrue] of [['clean', clean * 0.5], ['struck', (clean + win) / 2], ['late', win + 0.15], ['early', -0.1]]) {
      const env = makeEnv({ raft: [4, 14.8], record: false });
      if (want === 'early') {   // a tap 0.1 s before the "!" (inside the last dip): registered at (waitDur − 0.1 + comp)
        env.ctx.debug.forceBite({ speciesId: 'reedjaw_pike', z, wait: 2 });
        env.tick(Math.round((env.dbg().waitDur - 0.1 + comp) / DT));
      } else {
        toBite(env, 'reedjaw_pike', z);
        env.tick(Math.round((tTrue + comp) / DT));
      }
      env.F.onPointerDown({ input });
      const got = env.dbg().grade ?? env.last('fishing:strike')?.grade;
      n++; if (got === want) good++; else bad.push(`${cls}/${input}/${want}→${got}`);
    }
  }
  ok(good === n, `${good}/${n} taps graded as timed (${bad.slice(0, 6).join(' ')})`);
  // ± 1 frame at the edges: just inside / just outside the Clean part (mouse)
  const edge = (t) => { const env = makeEnv({ raft: [4, 14.8], record: false }); toBite(env, 'reedjaw_pike', zFor.prize); env.tick(Math.round((t + A.strike.latencyComp.mouse) / DT)); env.F.onPointerDown({ input: 'mouse' }); return env.dbg().grade; };
  const win = A.strike.window.prize * (1 + (D.BAIT_BY_ID.mireworm?.bonus?.hookWindow || 0)), clean = Math.max(A.strike.cleanMin, A.strike.cleanFrac * win);
  ok(edge(clean - 2 * DT) === 'clean' && edge(clean + 2 * DT) === 'struck' && edge(win - 2 * DT) === 'struck' && edge(win + 2 * DT) === 'late', `the Clean / Struck / Late edges hold within ± 1 frame (Prize: ${clean.toFixed(3)} / ${win.toFixed(3)} s)`);
  // no tap → passed, the bait refunded; a tap in the nibbles → spooked
  const env = makeEnv({ raft: [30, 30] });
  toBite(env, 'mossback_perch', 0.2);
  for (let i = 0; i < 90 && env.F.state === 'bite'; i++) env.tick(1);
  const miss = env.last('fishing:miss');
  ok(miss?.reason === 'passed' && miss.refunded === true && env.calls.refund[0] === 'mireworm' && !env.events.some((x) => x.e === 'fishing:strike'), `no tap: passed, refundBait(${env.calls.refund[0]})`);
  env.reset(); env.tick(5);
  env.ctx.debug.forceBite({ speciesId: 'mossback_perch', natural: true });
  env.tick(3);
  env.F.onPointerDown({ input: 'touch' });
  ok(env.last('fishing:miss')?.reason === 'spooked' && env.F.state === 'lost' && !env.events.some((x) => x.e === 'fishing:hook'), `a tap in the nibbles: 'spooked' (${env.last('fishing:miss')?.reason})`);
  // Space / Enter (main routes them here during the bite): a key strike
  const k = makeEnv({ raft: [30, 30] });
  toBite(k, 'mossback_perch', 0.2); k.tick(3);
  ok(k.F.onPointerDown({ input: 'key' }) === true && k.F.state === 'reeling' && k.dbg().grade === 'clean', `a key press during the bite strikes (${k.dbg().grade})`);
}

section('F4′ nibbles and feints never depend on the species or its rarity (10,000 seeded casts per rarity, the same draws)');
{
  const N = QUICK ? 1500 : 10000;
  const env = makeEnv({ zoneId: 'glasswater', raft: [0, 10], record: false, depth: 0.6, phase: 'gloomtide' });   // the third lake: feints are possible
  const pick = (r) => D.SPECIES.find((s) => s.zone === 'glasswater' && s.rarity === r && !s.bait && !s.place && (s.time || 'any') !== 'calm' && s.depth[0] <= 0.6 && s.depth[1] >= 0.6);
  const common = pick('common'), rare = pick('rare');
  const sched = (id, i) => { env.reset(); env.reseed(1000 + i); env.ctx.debug.forceBite({ speciesId: id, natural: true }); const d = env.dbg(); return `${d.events.join(',')}|${d.waitDur.toFixed(6)}`; };
  let same = 0, feints = 0;
  const hist = { c: {}, r: {} };
  for (let i = 0; i < N; i++) {
    const a = sched(common.id, i), b = sched(rare.id, i);
    if (a === b) same++;
    if (a.includes('feint')) feints++;
    const na = a.split('|')[0].split(',').filter(Boolean).length, nb = b.split('|')[0].split(',').filter(Boolean).length;
    hist.c[na] = (hist.c[na] || 0) + 1; hist.r[nb] = (hist.r[nb] || 0) + 1;
  }
  ok(same === N, `${common.id} (common) and ${rare.id} (rare): the same nibble schedule and wait on every seed (${same}/${N})`);
  ok(JSON.stringify(hist.c) === JSON.stringify(hist.r) && feints > N * 0.15, `identical nibble-count distributions ${JSON.stringify(hist.c)}; feints from any rarity (${feints})`);
}

section('F4′ every tell ends in the same 0.25 s last dip (fishing:tell {sizeClass, biteTell, lead, dur, lastDip}); no species field');
{
  const env = makeEnv({ raft: [4, 14.8] });
  let fine = 0;
  for (const [cls, z] of Object.entries(zFor)) {
    env.reset(); env.tick(5);
    toBite(env, 'reedjaw_pike', z);
    const t = env.last('fishing:tell'), b = env.last('fishing:bite');
    if (t?.lastDip === 0.25 && t.dur >= 0.25 && !('speciesId' in t) && !('speciesId' in b) && t.sizeClass === D.sizeClassOf(z) && b.sizeClass === t.sizeClass) fine++;
  }
  ok(fine === 6, `every class: lastDip 0.25, no species on tell or bite (${fine}/6)`);
}

// =====================================================================================================================
section('F2′ the roll: catchChance from the fish that bit, the loadout on the line AT THE CAST, the buffs; never 1 (100,000 seeded strikes on T4 with every buff)');
{
  const T4 = { rod: 4, line: 4, reel: 4, item: 'bell_spinner' };
  const MAXB = { wellFed: true, boons: { steady_reel: 5, gilded_hook: 1, patient_line: 3 }, relics: { seven_knots: 3, steady_hook: 3, measuring_cord: 2 }, character: 'ashwick', firstHookTonight: true };
  const env = makeEnv({ raft: [4, 14.8], loadout: T4, buffs: MAXB });
  toBite(env, 'reedjaw_pike', zFor.trophy);
  env.tick(3); env.F.onPointerDown({ input: 'mouse' });
  const p = env.ctx.debug.fishChance();
  const want = D.catchChance('reedjaw_pike', 'trophy', T4, { lake: 'mossmere', strike: 'clean', buffs: MAXB, marked: false, wounds: 0, landings: 0, night: false, perRun: false });
  ok(near(p, want, 1e-12) && p < C.cap.trophy, `fishChance ${p.toFixed(4)} = catchChance(reedjaw_pike, trophy, T4 + the Harbour-Bell Spinner, Clean, every buff) < the Trophy cap`);
  const plan = env.ctx.debug.fishPlan(), dr = env.ctx.debug.fishPlay().draws;
  ok(JSON.stringify(plan.beats.slice(0, 3)) === JSON.stringify(planPlay('trophy', 2.25, dr.planSeed, { leapChance: A.leaps.reedjaw_pike, tiers: 4 }).beats.slice(0, 3)), 'the plan is planPlay(class, z, planSeed, {leap chance, mean fitted tier}) from the strike\'s draws');
  // the item counts as it was at the cast: a swap after the cast changes nothing
  const env2 = makeEnv({ raft: [4, 14.8] });
  env2.run.equippedBait = 'mireworm';
  toBite(env2, 'weeping_carp', zFor.prize);
  env2.run.equippedBait = 'spore_cake';
  env2.tick(3); env2.F.onPointerDown();
  ok(env2.dbg().castItem === 'mireworm' && near(env2.ctx.debug.fishChance(), D.catchChance('weeping_carp', 'prize', { hold: D.upgradeHold({}), item: 'mireworm', rod: 0, line: 0, reel: 0 }, { lake: 'mossmere', strike: 'clean', buffs: { wellFed: false, boons: {}, relics: {}, character: 'wick', firstHookTonight: false }, perRun: true }), 1e-12),
    'the bait on the line at the cast counts (Mire Worms helps the carp), not the one equipped after');
  // never 1: 100,000 seeded strikes over every species and class, T4, the best item, Clean, every buff, a Marked Fish
  const rng = mulberry32(2026), N = QUICK ? 20000 : 100000, cls = ['small', 'keeper', 'prize', 'trophy', 'elder', 'ancient'];
  const roster = D.SPECIES.filter((s) => s.rarity !== 'legendary');
  let maxRatio = 0, landed = 0;
  const losses = {};
  for (let i = 0; i < N; i++) {
    const s = roster[Math.floor(rng() * roster.length)], c = cls[Math.floor(rng() * cls.length)];
    if (!D.catchClassAllowed(s, c)) continue;
    const best = D.catchBestItem(s).id;
    const pp = D.catchChance(s.id, c, { rod: 4, line: 4, reel: 4, item: best }, { strike: 'clean', buffs: MAXB, marked: true });
    maxRatio = Math.max(maxRatio, pp / C.cap[c]);
    const d = drawStrike(rng);
    if (d.u < pp) landed++; else losses[c] = (losses[c] || 0) + 1;
  }
  ok(maxRatio < 1 && cls.every((c) => losses[c] > 0), `p / cap ≤ ${maxRatio.toFixed(5)} < 1; every class loses some (${JSON.stringify(losses)}; ${landed} landed)`);
}

section('F2′ outcome-blind: one seed forced to land and to lose is identical (bus, view, fx, actors, water, render, audio) up to the loss, at ≥ 0.5 of the plan, for every cause');
{
  let good = 0, n = 0;
  const detail = [];
  for (const [cause, cls] of [['snapped', 'trophy'], ['thrown', 'prize'], ['spat', 'keeper'], ['spooled', 'elder'], ['fouled', 'trophy'], ['thrown', 'small'], ['spat', 'ancient']]) {
    for (let k = 0; k < (QUICK ? 1 : 3); k++) {
      const seed = 100 + k * 17 + cls.length;
      const id = cls === 'small' || cls === 'keeper' ? 'mossback_perch' : 'reedjaw_pike';
      const a = makeEnv({ raft: [4, 14.8], seed, rseed: seed }), b = makeEnv({ raft: [4, 14.8], seed, rseed: seed });
      playOnce(a, id, zFor[cls], { outcome: 'land' });
      playOnce(b, id, zFor[cls], { outcome: 'lose', cause });
      const lossF = b.events.find((x) => x.e === 'fishing:escaped')?.f;
      const plan = b.events.find((x) => x.e === 'fishing:reel' && x.p.phase === 'loss');
      const durP = a.events.filter((x) => x.e === 'fishing:reel' && x.p.phase === 'lift')[0];
      let same = lossF != null;
      for (let f = 0; f < (lossF ?? 0) && same; f++) {
        const fa = a.frames[f], fb = b.frames[f];
        const df = frameDiff(fa, fb);
        if (df) { same = false; detail.push(`${cause}/${cls}: frame ${f}: ${df}`); }
      }
      const totalDur = durP ? durP.p.t + durP.p.dur : Infinity;
      const half = plan && plan.p.t >= 0.5 * totalDur - 1e-3;
      n++; if (same && half && b.last('fishing:escaped')?.reason === cause) good++; else if (same) detail.push(`${cause}/${cls}: loss at ${plan?.p.t} of ${totalDur.toFixed(2)} (${b.last('fishing:escaped')?.reason})`);
    }
  }
  ok(good === n, `${good}/${n} land / lose pairs identical up to the loss, the loss past half (${detail.slice(0, 3).join(' · ')})`);
}

section('F2′ durations: in the class band (× jitter), longer with z, −5% per mean fitted tier; the play ends at its planned end');
{
  let good = 0, n = 0;
  for (const [cls, z] of Object.entries(zFor)) {
    const t0 = makeEnv({ raft: [4, 14.8], seed: 5, rseed: 5, loadout: { rod: 0, line: 0, reel: 0 }, record: false });
    const t4 = makeEnv({ raft: [4, 14.8], seed: 5, rseed: 5, loadout: { rod: 4, line: 4, reel: 4 }, record: false });
    for (const e of [t0, t4]) { e.ctx.debug.fishOutcome('land'); toBite(e, 'reedjaw_pike', z); e.tick(3); e.F.onPointerDown(); }
    const p0 = t0.ctx.debug.fishPlan(), p4 = t4.ctx.debug.fishPlan();
    const P = A.play[cls];
    const inBand = p0.dur >= P.dur[0] * A.play.jitter[0] - 1e-6 && p0.dur <= P.dur[1] * A.play.jitter[1] + 1e-6;
    // play it out on the clock: the reveal comes at the planned end (within a frame)
    let f = 0;
    for (; f < 3000 && t0.F.state === 'reeling'; f++) t0.tick(1);
    n++; if (inBand && near(p4.dur, p0.dur * 0.8, 1e-3) && near(f * DT, p0.dur, 2 * DT)) good++;
    else console.log('   ', cls, p0.dur, p4.dur, f * DT);
  }
  ok(good === n, `${good}/${n} classes: duration in band, T4 = 0.8 × T0, the play runs exactly its plan`);
}

section('F2′ the anchor and no cut: the stick, WASD, X and mashed taps through a whole play change nothing (trace and raft ± 0.01 m), in every night mode');
{
  let good = 0, n = 0;
  const why = [];
  for (const mode of ['still', 'lantern', 'gloomtide']) for (const [cls, outcome] of [['trophy', 'land'], ['elder', 'lose'], ['prize', 'land']]) {
    const seed = 300 + cls.length * 7 + (outcome === 'lose' ? 1 : 0);
    const quiet = makeEnv({ mode, phase: 'calm', raft: [4, 14.8], seed, rseed: seed });
    const mash = makeEnv({ mode, phase: 'calm', raft: [4, 14.8], seed, rseed: seed });
    for (const e of [quiet, mash]) { e.ctx.debug.fishOutcome(outcome); toBite(e, 'reedjaw_pike', zFor[cls]); e.tick(3); e.F.onPointerDown({ input: 'mouse' }); e.F.onPointerUp(); }
    const f0 = quiet.frames.length;
    const plan = quiet.ctx.debug.fishPlan();
    const r0 = quiet.ctx.player.position.clone();
    for (let i = 0; i < 1500 && (quiet.F.state !== 'idle' || mash.F.state !== 'idle'); i++) {
      if (quiet.F.state !== 'idle') { quiet.F.skipCeremony(); quiet.tick(1); }
      if (mash.F.state !== 'idle') {
        if (mash.F.isAnchored()) {   // from the strike to the card or the got-away note
          mash.ctx.input.move = { x: (i % 3) - 1, y: 1 };                  // the stick and WASD held / mashed
          mash.F.cancel('moved');                                          // what player.js does with movement input (and its cut hold)
          if (i % 2) mash.F.onPointerDown({ input: 'touch' }); else mash.F.onPointerUp();   // taps mashed (a Prize+: no hurry)
        } else { mash.ctx.input.move = { x: 0, y: 0 }; mash.F.onPointerUp(); }
        mash.F.skipCeremony();
        mash.tick(1);
      }
    }
    let same = true;
    const end = Math.max(quiet.frames.length, mash.frames.length);
    for (let f = f0; f < end && same; f++) {
      const a = quiet.frames[f], b = mash.frames[f];
      const df = frameDiff(a, b);
      if (df) { same = false; why.push(`${mode}/${cls}: frame ${f - f0}: ${df}`); }
    }
    const towed = Math.hypot(quiet.ctx.player.position.x - r0.x, quiet.ctx.player.position.z - r0.z);
    const wantTow = outcome === 'land' ? plan.tow : null;
    const towOk = wantTow == null || near(towed, wantTow, 0.01);
    const ended = quiet.events.find((x) => x.e === 'fishing:caught' || x.e === 'fishing:escaped');
    n++; if (same && towOk && ended) good++; else why.push(`${mode}/${cls}: tow ${towed.toFixed(3)} / ${wantTow}`);
  }
  ok(good === n, `${good}/${n} plays: identical with and without input, the raft moved only by the plan's tow (${why.slice(0, 3).join(' · ')})`);
  const g = makeEnv({ mode: 'gloomtide', phase: 'gloomtide', raft: [4, 14.8] });
  g.ctx.debug.fishOutcome('land'); toBite(g, 'reedjaw_pike', zFor.trophy); g.tick(3); g.F.onPointerDown(); g.tick(30);
  ok(g.F.partLine('staggered') === true && g.last('fishing:escaped')?.reason === 'staggered' && g.F.state === 'lost', 'partLine(\'staggered\') (Gloomtide\'s slam, combat\'s call) is the one outside end of a play');
  const s = makeEnv({ mode: 'still', phase: 'gloomtide', raft: [4, 14.8] });
  s.ctx.debug.fishOutcome('land'); toBite(s, 'reedjaw_pike', zFor.trophy); s.tick(3); s.F.onPointerDown(); s.tick(30);
  s.F.slam(); s.F.cancel('snap'); s.tick(2);
  ok(s.F.state === 'reeling' && !s.events.some((x) => x.e === 'fishing:escaped'), 'in Still a slam never ends a play');
  ok(typeof s.F.isAnchored === 'function' && s.F.isAnchored() === true, 'fishing.isAnchored() while the play runs (player and combat read it)');
}

section('F2′ hurry (Small / Keeper, from the 2nd run): the same outcome, sooner; nothing saved mid-play; the manual reel\'s keys are read nowhere');
{
  const slow = makeEnv({ raft: [30, 30], seed: 9, rseed: 9, runs: 2 }), fast = makeEnv({ raft: [30, 30], seed: 9, rseed: 9, runs: 2 });
  for (const e of [slow, fast]) { toBite(e, 'mossback_perch', 0.4); e.tick(3); e.F.onPointerDown(); e.F.onPointerUp(); }
  const runBefore = JSON.stringify(fast.run);
  fast.F.onPointerDown();   // hold
  let fs = 0, ss = 0, savedMid = false;
  for (; fs < 600 && fast.F.state === 'reeling'; fs++) { fast.tick(1); if (fast.F.state === 'reeling' && JSON.stringify(fast.run) !== runBefore) savedMid = true; }
  for (; ss < 600 && slow.F.state === 'reeling'; ss++) slow.tick(1);
  const oa = fast.ctx.debug.fishing().outcome, ob = slow.ctx.debug.fishing().outcome;
  ok(fs < ss * 0.6 && oa === ob, `a held Keeper play: ${fs} frames against ${ss}, the same outcome (${oa})`);
  ok(!savedMid, 'the run state is not written during a play (a reload re-randomises)');
  const no = makeEnv({ raft: [30, 30], seed: 9, rseed: 9, runs: 1 });
  toBite(no, 'mossback_perch', 0.4); no.tick(3); no.F.onPointerDown(); no.F.onPointerUp(); no.F.onPointerDown();
  let ns = 0; for (; ns < 600 && no.F.state === 'reeling'; ns++) no.tick(1);
  ok(ns === ss, `run 1: a hold hurries nothing (${ns} frames)`);
  const src = readFileSync(new URL('../../src/fishing.js', import.meta.url), 'utf8').replace(/\/\/.*$/gm, '') + readFileSync(new URL('../../src/fishing-reel.js', import.meta.url), 'utf8').replace(/\/\/.*$/gm, '');
  const retired = ['size.fight', 'SZ.fight', "BAL('size').fight", 'size.reel', 'bite.pips', '.pipBonus', 'nearMiss', 'oldTrick', '.absorb', '.dragAt', 'stats.shock', 'scaleDifficultyV3', 'reelOptsV3', "'cut'", 'cutLineHold'];
  const found = retired.filter((k) => src.includes(k));
  ok(found.length === 0, `fishing.js and fishing-reel.js read no key D1′ retired (${found.join(', ') || 'none'})`);
}

// =====================================================================================================================
// species-swap invariance (F17): two species that can bite in one cell, the same seed, class and z (and their leap chance made equal)
// =====================================================================================================================
function trace(speciesId, z, seed, { patch = null, outcome = null, mode = 'lantern', phase = 'calm', at = 0.2 } = {}) {
  const env = makeEnv({ mode, phase, raft: [4, 14.8], seed, rseed: seed });
  const undo = patch ? patch() : null;
  try { playOnce(env, speciesId, z, { at, outcome }); } finally { if (undo) undo(); }
  // the cut: the reveal (state landing) or the loss, whichever comes first
  let cut = env.frames.findIndex((f) => f.state === 'landing' || f.calls.some((c) => c.startsWith('ev fishing:escaped')));
  if (cut < 0) cut = env.frames.length;
  return { env, cut };
}
function sameTrace(a, b) {
  const cut = Math.min(a.cut, b.cut);
  for (let f = 0; f < cut; f++) {
    const x = a.env.frames[f], y = b.env.frames[f];
    if (!x || !y || x.state !== y.state || x.view !== y.view || x.raft.join() !== y.raft.join()) return { ok: false, f, why: 'state/view' };
    const cx = x.calls.join('\n'), cy = y.calls.join('\n');
    if (cx !== cy) return { ok: false, f, why: cx.split('\n').find((l, i) => l !== cy.split('\n')[i]) };
  }
  return { ok: true, cut };
}
const patchEqual = (a, b) => () => {   // L50, σ and the leap chance of b made a's (the test's own patch, undone after)
  const sa = SP(a), sb = SP(b);
  const keep = { size: sb.size, leap: A.leaps[b] };
  sb.size = { ...sb.size, L50: sa.size.L50, sigma: sa.size.sigma };
  if (A.leaps[a] != null) A.leaps[b] = A.leaps[a]; else delete A.leaps[b];
  return () => { sb.size = keep.size; if (keep.leap != null) A.leaps[b] = keep.leap; else delete A.leaps[b]; };
};

section('F2′ (b) two species with L50, σ and leap chance patched equal, the outcome forced to land: identical traces to the reveal');
{
  let good = 0, n = 0;
  const why = [];
  const pairs = [['reedjaw_pike', 'weeping_carp'], ['mossback_perch', 'dusk_minnow'], ['gloam_eel', 'candlefin_koi']];
  for (const [a, b] of pairs) for (const cls of ['keeper', 'prize', 'trophy', 'elder']) {
    if (!D.catchClassAllowed(SP(a), cls) || !D.catchClassAllowed(SP(b), cls)) continue;
    const seed = 700 + n;
    const ta = trace(a, zFor[cls], seed, { outcome: 'land' });
    const tb = trace(b, zFor[cls], seed, { outcome: 'land', patch: patchEqual(a, b) });
    const r = sameTrace(ta, tb);
    n++; if (r.ok && ta.cut === tb.cut && ta.cut > 30) good++; else why.push(`${a}/${b} ${cls}: f${r.f} ${String(r.why).slice(0, 90)}`);
  }
  ok(good === n, `${good}/${n} pairs × classes identical up to the reveal (bus, view, fx / actors / water / render / audio calls, raft) ${why.slice(0, 2).join(' · ')}`);
}

section('F17 species-swap invariance over 200 seeded plays per pair (leap chance equal; natural outcomes): identical until the reveal or the loss');
{
  const pairs = [['reedjaw_pike', 'weeping_carp'], ['mossback_perch', 'dusk_minnow']];
  const N = QUICK ? 30 : 200;
  for (const [a, b] of pairs) {
    let good = 0, n = 0, losses = 0;
    const why = [];
    const zr = mulberry32(55);
    for (let i = 0; i < N; i++) {
      const cls = ['small', 'keeper', 'prize', 'trophy'][i % 4];
      if (!D.catchClassAllowed(SP(a), cls) || !D.catchClassAllowed(SP(b), cls)) continue;
      const [lo, hi] = cls === 'small' ? [-1.8, -0.3] : cls === 'keeper' ? [-0.2, 1.0] : cls === 'prize' ? [1.08, 1.85] : [1.92, 2.6];
      const z = Math.round((lo + (hi - lo) * zr()) * 1e4) / 1e4;
      const seed = 9000 + i * 13;
      const ta = trace(a, z, seed, { patch: () => { const k = A.leaps[b]; A.leaps[b] = A.leaps[a] ?? 0; return () => { if (k != null) A.leaps[b] = k; else delete A.leaps[b]; }; }, at: 0.15 + (i % 3) * 0.2 });
      const tb = trace(b, z, seed, { patch: () => { const k = A.leaps[b]; A.leaps[b] = A.leaps[a] ?? 0; return () => { if (k != null) A.leaps[b] = k; else delete A.leaps[b]; }; }, at: 0.15 + (i % 3) * 0.2 });
      const r = sameTrace(ta, tb);
      if (ta.env.events.some((x) => x.e === 'fishing:escaped') || tb.env.events.some((x) => x.e === 'fishing:escaped')) losses++;
      n++; if (r.ok) good++; else why.push(`#${i} ${cls}: f${r.f} ${String(r.why).slice(0, 100)}`);
    }
    ok(good === n, `${a} / ${b}: ${good}/${n} plays identical until the reveal or the loss (${losses} with a loss) ${why.slice(0, 2).join(' · ')}`);
  }
}

section('F2′ (c) two real species (their own leap chances): identical up to the first leap or loss');
{
  let good = 0, n = 0;
  for (let i = 0; i < (QUICK ? 6 : 20); i++) {
    const cls = ['prize', 'trophy'][i % 2];
    const ta = trace('reedjaw_pike', zFor[cls], 400 + i), tb = trace('mossback_perch', zFor[cls], 400 + i);
    const firstLeap = (t) => { const k = t.env.frames.findIndex((f) => f.calls.some((c) => c.includes('"phase":"leap"'))); return k < 0 ? Infinity : k; };
    const cut = Math.min(ta.cut, tb.cut, firstLeap(ta), firstLeap(tb));
    const r = sameTrace({ env: ta.env, cut }, { env: tb.env, cut });
    n++; if (r.ok && cut > 30) good++;
  }
  ok(good === n, `${good}/${n} plays of the Reedjaw Pike and the Mossback Perch identical up to the first leap or loss`);
}

section('F17 a scripted scan: no species id, name, rarity or odds on any event or view from the cast to fishing:caught / fish:escaped; legends on their grammar');
{
  const names = new Set(D.SPECIES.flatMap((s) => [s.id, s.name]).filter(Boolean));
  let clean = true, n = 0, bad = '';
  for (let i = 0; i < (QUICK ? 8 : 24); i++) {
    const id = ['reedjaw_pike', 'gloam_eel', 'mossback_perch', 'candlefin_koi'][i % 4], cls = ['keeper', 'prize', 'trophy', 'elder'][i % 4];
    if (!D.catchClassAllowed(SP(id), cls)) continue;
    const env = makeEnv({ raft: [4, 14.8], seed: 50 + i, rseed: 50 + i, phase: id === 'gloam_eel' ? 'gloomtide' : 'calm' });
    const mark = env.events.length;
    playOnce(env, id, zFor[cls]);
    n++;
    for (const ev of env.events.slice(mark)) {
      if (ev.e === 'fishing:caught' || ev.e === 'fish:escaped' || ev.e === 'fish:measured' || ev.e === 'fish:landed') break;
      const s = JSON.stringify(ev.p);
      if (/"(speciesId|rarity|species|name|odds|chance|p)"\s*:/.test(s) || [...names].some((nm) => s.includes(`"${nm}"`))) { clean = false; bad = `${ev.e} ${s.slice(0, 120)}`; }
    }
    for (const f of env.frames) {
      if (f.state === 'landing') break;
      if (/"(speciesId|rarity)":"[a-z]/.test(f.view) || /"(odds|chance)"/.test(f.view)) { clean = false; bad = `view ${f.view.slice(0, 120)}`; }
      if (f.calls.some((c) => c.startsWith('cf '))) { clean = false; bad = 'createFish before the reveal'; }
    }
    // a glow species (the Gloam Eel at night, the Candlefin Koi): its wake is plain and nothing glows
    if (SP(id).model?.glow) { const wakes = env.frames.flatMap((f) => f.calls).filter((c) => c.startsWith('wk ')); if (wakes.some((c) => c.includes('glow'))) { clean = false; bad = 'a glow wake'; } }
  }
  ok(clean, `${n} plays scanned, nothing names or encodes the species before the reveal ${bad}`);
  const env = makeEnv({ zoneId: 'paleabyss', raft: [0, -30], phase: 'gloomtide' });
  env.ctx.debug.fishOutcome('land');
  env.ctx.debug.fishHook('lantern_swallower');
  env.tick(30);
  const hk = env.last('fishing:hook'), st = env.last('fishing:strike'), rl = env.last('fishing:reel');
  ok(hk?.legendary === true && hk.speciesId === 'lantern_swallower' && st?.legendary === true && rl?.legendary === true && env.F.view.speciesId === 'lantern_swallower' && env.calls.banner.length === 1,
    'a legend carries {legendary: true, speciesId} on strike, hook and reel; view names it; its banner shows (the legend bait and swarm quiet key on it)');
}

section('F17 the sign rule: where a sign\'s tilt would name a fish, its pre-roll comes from the blind pool');
{
  // the cells (phase 1 roster): rise = surface feeders, glow = night fish, each lake × hour × depth band (AUTOFISH.signRule)
  const R = A.signRule, W = D.RARITY_WEIGHTS;
  const timeOk = (t, h) => (t === 'calm' ? h !== 'gloomtide' : t === 'gloom' ? h === 'gloomtide' : true);
  const cells = [];
  for (const kind of ['rise', 'glow']) for (const zone of ['mossmere', 'sporewood', 'glasswater', 'paleabyss']) for (const hour of kind === 'glow' ? ['gloomtide'] : ['calm', 'gloomtide']) for (const d of [0.15, 0.5, 0.85]) {
    const open = D.SPECIES.filter((s) => s.zone === zone && s.rarity !== 'legendary' && !s.place && !s.bait && !s.cove && timeOk(s.time || 'any', hour) && d >= (s.depth?.[0] ?? 0) && d <= (s.depth?.[1] ?? 1));
    const tilt = open.filter((s) => (kind === 'rise' ? (s.depth?.[0] ?? 0) <= 0.35 : s.time === 'gloom' || !!s.model?.glow));
    if (!tilt.length || !open.length) continue;
    const tot = tilt.reduce((a, s) => a + (W[s.rarity] ?? 10), 0), top = Math.max(...tilt.map((s) => W[s.rarity] ?? 10));
    cells.push({ kind, zone, hour, d, open: open.map((s) => s.id), tilt: tilt.map((s) => s.id), fails: tilt.length < R.minSpecies || top / tot > R.maxShare });
  }
  const failing = cells.filter((c) => c.fails), passing = cells.filter((c) => !c.fails);
  let good = 0;
  for (const c of [...failing, ...passing.slice(0, 2)]) {
    const env = makeEnv({ raft: [30, 30], phase: c.hour, depth: c.d, record: false, zoneId: c.zone });
    env.run.equippedBait = null; env.ctx.progression.consumeBait = () => null;
    const seen = new Set();
    for (let i = 0; i < 300; i++) { env.F.signs.length = 0; const s = env.ctx.debug.sign(c.kind, { x: 30, z: 20 }); const pre = env.ctx.debug.fishSigns().find((q) => q.id === s?.id)?.preroll; if (pre) seen.add(pre.speciesId); }
    const outside = [...seen].filter((id) => !c.tilt.includes(id));
    const okCell = c.fails ? outside.length > 0 : outside.length === 0;
    if (okCell) good++; else console.log('   ', c.kind, c.hour, c.d, c.fails ? 'fails' : 'passes', [...seen].join(','), 'tilt', c.tilt.join(','));
  }
  ok(failing.length >= 1 && good === failing.length + Math.min(2, passing.length), `${failing.length} failing cells (phase 1, the four lakes) pre-roll from the blind pool; passing cells keep their tilt (${good} checked)`);
  // presentLength on every sign: a pre-rolled fish shows its class length, never its own
  const env = makeEnv({ raft: [30, 30] });
  const s = env.ctx.debug.sign('boil', { x: 30, z: 20, speciesId: 'reedjaw_pike', size: 2.3 });
  ok(s?.prerolled && near(s.prerolled.length, Math.round(D.presentLength('mossmere', 2.3) * 1000) / 10, 0.11), `a boil's fish is drawn at its class length (${s?.prerolled?.length} cm = presentLength)`);
}

section('F17 hidden-state debug hooks register only with core.debugEnabled() in a v3 build');
{
  delete globalThis.GW_DEBUG;
  const env = makeEnv({ record: false });
  const has = ['fishing', 'fishSeed', 'fishSigns', 'preroll', 'fishOutcome', 'fishPlan', 'fishChance', 'fishPlay', 'fishStrike'].filter((k) => typeof env.ctx.debug[k] === 'function');
  globalThis.GW_DEBUG = true;
  ok(has.length === 0 && typeof env.ctx.debug.forceBite === 'function', `a release v3 build exposes none of them (${has.join(', ') || 'none'})`);
}

section('the First Evening\'s seam: setTutorial takes waits and presentation only and throws on any outcome, class, chance, z or species field');
{
  const env = makeEnv({ raft: [30, 30] });
  let threw = 0;
  for (const k of ['outcome', 'sizeClass', 'chance', 'z', 'speciesId']) { try { env.F.setTutorial({ [k]: 1 }); } catch { threw++; } }
  ok(threw === 5, `${threw}/5 forbidden fields throw`);
  env.F.setTutorial({ nibbleAt: [1.2, 1.8], biteAt: [2.5, 3.5], strikeRing: true, estimate: true });
  env.ctx.debug.forceBite({ speciesId: 'mossback_perch', natural: true });
  const d = env.dbg();
  ok(d.waitDur >= 2.5 && d.waitDur <= 3.5 && d.events.length === 1, `the first tutorial cast: the bite at ${d.waitDur.toFixed(2)} s, one nibble`);
  for (let i = 0; i < 200 && env.F.state === 'waiting'; i++) env.tick(1);
  ok(!!env.F.view.strikeRing, 'the strike ring shows during the tutorial');
  env.tick(3); env.F.onPointerDown();
  ok(env.F.view.sizeClass === D.sizeClassOf(env.dbg().z), 'the estimate stamps on a tutorial Small / Keeper');
  env.F.setTutorial(null);
}

Math.random = realRandom;
console.log(`fishing-af: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
