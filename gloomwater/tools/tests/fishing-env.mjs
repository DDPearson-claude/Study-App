// A fake game ctx around the real src/fishing.js (no renderer, no other modules), for the v3 fishing tests. Not a test on its own
// (no .test.mjs suffix): tools/tests/fishing-v3.test.mjs uses it.
//
//   import { makeFishingEnv } from './fishing-env.mjs';
//   const env = makeFishingEnv({ data: D, mode: 'lantern', phase: 'calm', raft: [30, 30], zoneId: 'mossmere', stats: {...} });
//   env.ctx.debug.forceBite({ speciesId: 'reedjaw_pike', z: 2.95 }); env.F.onPointerDown(); env.tick(30);
//
// The fake progression is a P1 one (getStats with the v3 fight stats, refundBait, measure), so fishing reads the stats it is given;
// `progression: 'v1'` drops refundBait / measure (a pre-P1 progression). `lean: true` records neither events nor bobber poses (long runs).
import * as THREE from 'three';
import { createBus } from '../../src/core.js';

// fishing-fx builds canvas label textures at creation: a minimal 2D canvas is enough in node
globalThis.document = globalThis.document || { createElement: () => ({ width: 0, height: 0, getContext: () => new Proxy({}, { get: (t, k) => (k === 'measureText' ? () => ({ width: 40 }) : () => {}) }) }) };
const { create: createFishing } = await import('../../src/fishing.js');

export function makeFishingEnv({ data, mode = 'lantern', outing = 'normal', phase = 'calm', stats = {}, raft = [30, 30], zoneId = 'mossmere',
  seed = 42, lean = false, progression = 'p1', upgrades = {} } = {}) {
  const bus = createBus();
  const events = [];
  const origEmit = bus.emit.bind(bus);
  bus.emit = (e, p = {}) => { if (!lean) events.push({ e, p }); origEmit(e, p); };
  const zone = data.ZONES.find((z) => z.id === zoneId);
  const calls = { refund: [], bobber: [], consume: 0 };
  const ph = { phase };
  const run = { active: true, zone: zoneId, day: 1, phase, nightMode: mode, outing, upgrades, bait: { mireworm: 5 }, equippedBait: 'mireworm', flags: {}, hp: 3, oil: 80, satiety: 50 };
  const prog = {
    getStats: () => ({ castMax: 16, hookWindow: 1, lineStrength: 1, reelSpeed: 1, sweetZone: 0.16, slackTime: 1.6, biteSpeed: 1, rarityBonus: 0, nibbleTells: 0, maxOil: 100, absorb: 0.3, dragAt: 0.8, shock: 0, pipBonus: 0, ...stats }),
    consumeBait: () => { calls.consume++; return run.equippedBait; },
    getEquippedBait: () => run.equippedBait,
  };
  if (progression !== 'v1') Object.assign(prog, { refundBait: (id) => { calls.refund.push(id); return true; }, measure: () => ({ records: [] }) });
  const ctx = {
    THREE, bus, data, flow: 'playing', paused: false, errors: [], debug: {}, isMobile: false,
    state: { meta: { settings: {}, relics: {} }, run },
    time: { dt: 1 / 30, gameDt: 1 / 30, t: 0 }, input: { move: { x: 0, y: 0 }, joy: { x: 0, y: 0 } },
    world: { getZone: () => zone, getDepth: () => ctx._depth ?? 0.9, isOpenWater: () => true, randomWaterPoint: () => null },
    water: { getHeight: () => 0, splash() {}, addRipple() {}, addWake() {} },
    actors: {
      setLine() {}, setPose() {}, setAim() {}, setCharge() {}, setReel() {}, getRodTip: () => null, showCatch() {},
      setBobber(b) { if (!lean) calls.bobber.push({ state: b.state, y: b.position?.y ?? null, x: b.position?.x ?? null, z: b.position?.z ?? null, visible: b.visible }); },
    },
    survival: { getPhaseInfo: () => ({ phase: ph.phase, day: run.day }) },
    progression: prog,
    player: { position: new THREE.Vector3(raft[0], 0, raft[1]), speed: 0 },
  };
  const F = createFishing(ctx);
  ctx.fishing = F;
  F.init();
  ctx.debug.fishSeed(seed);
  const tick = (n = 1, dt = 1 / 30) => { for (let i = 0; i < n; i++) { ctx.time.dt = dt; ctx.time.t += dt; F.update(dt, ctx.time.t); } };
  tick(12);   // the zone settle
  const setPhase = (p) => { ph.phase = p; run.phase = p; };
  const reset = () => { F.cancel('reset'); tick(1); };
  return { ctx, F, run, events, calls, tick, setPhase, reset, dbg: () => ctx.debug.fishing() };
}
