// The v1 golden fishing trace (DESIGN §25.14.2a AF-0; CONTRACT §13.10): with V3_ENABLED off the hold-to-reel game stays
// bit-identical. The REAL src/fishing.js runs on the flag-off data inside a fake ctx (no renderer; a fake progression, world,
// water, actors, render and survival), with Math.random replaced by a seeded shim, and a scripted bot plays 40 casts across
// the four lakes: it aims, charges and releases the cast meter, sometimes spooks a nibble, strikes a bite after a reaction delay
// (some late), and holds / releases the reel against the tension (some greedy holds that snap, a cut by sailing away, a combat
// slam, a moved cancel, two legendary fights). Every bus event (payloads rounded), every fishing → actors / water / progression
// call and a per-frame digest of fishing.view are recorded; the per-cast digests and the whole event list are compared with
// tools/tests/v1-fishing-trace.json, which was recorded on the AF base (gw-af-base f58af48) before any AF code.
//
//   node tools/tests/v1-fishing-trace.test.mjs            assert (also run by node tools/check.mjs)
//   node tools/tests/v1-fishing-trace.test.mjs --record   re-record (only on purpose: the v1 game changed by design)
//
// main's boot → title → New Descent event order (the other half of AF-0's trace) is main's: it is asserted by the core owner's
// flag-off scenario (tools/scenario-run.mjs on a flag-off build), not here.
import * as THREE from 'three';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

if (typeof globalThis.document === 'undefined') {
  const ctx2d = new Proxy({}, { get: (t, k) => (k === 'createImageData' ? (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h })
    : k === 'createRadialGradient' || k === 'createLinearGradient' ? () => ({ addColorStop() {} }) : k === 'measureText' ? () => ({ width: 40 }) : () => {}), set: () => true });
  globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx2d, style: {} }) };
}
delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE; delete globalThis.GW_WALK;
const D = await import('../../src/data.js');                  // the flag-off build
const { createBus } = await import('../../src/core.js');
const { create: createFishing } = await import('../../src/fishing.js');

const here = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(here, 'v1-fishing-trace.json');
const RECORD = process.argv.includes('--record');
const VERBOSE = process.argv.includes('--verbose');

function mul(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const r6 = (v) => (Number.isFinite(v) ? Math.round(v * 1e6) / 1e6 : v);
/** A payload as plain JSON: numbers rounded to 1e-6, vectors as [x, y, z], functions and THREE objects dropped. */
function plain(v, depth = 0) {
  if (v == null || typeof v === 'boolean' || typeof v === 'string') return v ?? null;
  if (typeof v === 'number') return r6(v);
  if (typeof v === 'function' || depth > 5) return undefined;
  if (Array.isArray(v)) return v.map((x) => plain(x, depth + 1));
  if (typeof v === 'object') {
    if (v.isVector3 || (typeof v.x === 'number' && typeof v.y === 'number' && typeof v.z === 'number' && Object.keys(v).length <= 3)) return [r6(v.x), r6(v.y), r6(v.z)];
    if (v.isObject3D || v.isMaterial || v.isBufferGeometry) return '[three]';
    const o = {};
    for (const k of Object.keys(v).sort()) { const x = plain(v[k], depth + 1); if (x !== undefined) o[k] = x; }
    return o;
  }
  return undefined;
}
function fnv(h, s) { for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
const f5 = (v) => (typeof v === 'number' && Number.isFinite(v) ? v.toFixed(5) : String(v));

// ---------------------------------------------------------------------------------------------------------------- the run
function play() {
  const realRandom = Math.random;
  Math.random = mul(20261105);
  const bot = mul(4242);                                  // the bot's own choices (never Math.random: it must not shift the game's draws)
  const U = (a, b) => a + (b - a) * bot();
  const bus = createBus();
  const events = [];
  let frame = 0, cast = -1;
  const origEmit = bus.emit.bind(bus);
  bus.emit = (e, p = {}) => { events.push({ f: frame, c: cast, e, p: plain(p) }); origEmit(e, p); };
  let fr = [];                                            // this frame's fishing → module calls
  const rec = (s) => fr.push(s);
  const ph = { phase: 'calm', day: 1 };
  let zoneId = 'mossmere';
  const zoneOf = () => D.ZONES.find((z) => z.id === zoneId);
  const wrng = mul(77);
  const run = { active: true, zone: zoneId, day: 1, phase: 'calm', upgrades: {}, bait: { mireworm: 99, lumen_moss: 99, heartmoss: 9, glowcap_bulb: 9 }, equippedBait: 'mireworm', flags: {}, hp: 3, oil: 80, satiety: 50 };
  const stats = {};
  for (const [k, def] of Object.entries(D.STATS)) stats[k] = def.base;
  const raft = new THREE.Vector3(0, 0, 30);
  const ctx = {
    THREE, bus, data: D, flow: 'playing', paused: false, errors: [], debug: {}, isMobile: false,
    state: { meta: { settings: {}, relics: {} }, run },
    time: { dt: 1 / 30, gameDt: 1 / 30, t: 0 }, input: { move: { x: 0, y: 0 }, joy: { x: 0, y: 0 }, ndc: { x: 0, y: 0 } },
    world: {
      getZone: () => zoneOf(),
      getDepth: (x, z) => Math.max(0, Math.min(1, 0.5 + 0.45 * Math.sin(x * 0.13 + z * 0.07))),
      isOpenWater: (x, z) => Math.hypot(x - 12, z - 10) > 3,   // one islet: a few aims are pulled back
      randomWaterPoint: (o = {}) => { const f = o.from || raft, a = wrng() * Math.PI * 2, d = (o.minDist ?? 6) + wrng() * ((o.maxDist ?? 30) - (o.minDist ?? 6)); return { x: f.x + Math.cos(a) * d, z: f.z + Math.sin(a) * d }; },
    },
    water: {
      getHeight: (x, z) => 0.02 * Math.sin(x * 0.5 + z * 0.3),
      splash(x, z, o = {}) { rec(`sp ${f5(x)} ${f5(z)} ${f5(o.size)} ${o.count}`); },
      addRipple(x, z, s) { rec(`rp ${f5(x)} ${f5(z)} ${f5(s)}`); },
      addWake(x, z, dx, dz, s) { rec(`wk ${f5(x)} ${f5(z)} ${f5(dx)} ${f5(dz)} ${f5(s)}`); },
    },
    actors: {
      setLine(l) { rec(`ln ${l.visible ? 1 : 0} ${l.end ? `${f5(l.end.x)},${f5(l.end.y)},${f5(l.end.z)}` : '-'} ${f5(l.tension)} ${f5(l.slack)}`); },
      setBobber(b) { rec(`bb ${b.visible ? 1 : 0} ${b.state} ${b.position ? `${f5(b.position.x)},${f5(b.position.y)},${f5(b.position.z)}` : '-'}`); },
      setPose(n) { rec(`po ${n}`); }, setAim(y) { rec(`am ${f5(y)}`); }, setCharge(c) { rec(`ch ${f5(c)}`); },
      setReel(a, b) { rec(`re ${f5(a)} ${f5(b)}`); }, getRodTip: () => new THREE.Vector3(raft.x, 1.8, raft.z - 0.6),
      showCatch(fv) { rec(`sc ${fv ? 1 : 0}`); },
    },
    models: {
      createFish(id, w) {
        rec(`cf ${id} ${f5(typeof w === 'number' ? w : -1)}`);
        return { object3d: new THREE.Group(), length: 0.3 + (typeof w === 'number' ? Math.cbrt(w) * 0.25 : 0.2), update() {}, setGlow(k) { rec(`gl ${f5(k)}`); }, dispose() {} };
      },
    },
    render: {
      groundPoint: (n) => ({ x: raft.x + n.x * 14, y: 0, z: raft.z - 6 - n.y * 9 }),
      getYaw: () => 0, shake(a, b) { rec(`sh ${f5(a)} ${f5(b)}`); },
    },
    survival: { getPhaseInfo: () => ({ phase: ph.phase, day: ph.day }), setPhase(p) { rec(`setPhase ${p}`); ph.phase = p; run.phase = p; } },
    progression: {
      getStats: () => ({ ...stats }),
      consumeBait: () => { const id = run.equippedBait; const b = D.BAITS.find((x) => x.id === id); rec(`consume ${id}`); if (b?.legend) return null; return id; },
      getEquippedBait: () => run.equippedBait,
    },
    combat: { spawnEnemy(id) { rec(`spawn ${id}`); return { id }; } },
    ui: { isBlocking: () => false, floatText(p, t, k) { rec(`ft ${t} ${k}`); }, banner(a, b) { rec(`bn ${a} ${b}`); } },
    player: { position: raft, speed: 0 },
    audio: { play(n) { rec(`au ${n}`); } },
  };
  const F = createFishing(ctx);
  ctx.fishing = F;
  F.init();
  const casts = [];
  let hash = 2166136261;
  const step = (dt = 1 / 30) => {
    frame++;
    ctx.time.dt = dt; ctx.time.gameDt = dt; ctx.time.t += dt;
    F.update(dt, ctx.time.t);
    const v = F.view;
    const s = `${F.state}|${f5(v.charge)}|${f5(v.castDist)}|${f5(v.aim)}|${f5(v.tension)}|${f5(v.sweetMin)}|${f5(v.sweetMax)}|${f5(v.danger)}|${f5(v.progress)}`
      + `|${v.surge ? 1 : 0}|${f5(v.surgeWarn)}|${f5(v.stamina)}|${f5(v.biteWindow)}|${v.speciesId}|${v.rarity}|${v.hint}|${v.surgeKind}|${v.phaseName}`
      + `|${v.legendary ? 1 : 0}|${v.enraged ? 1 : 0}|${v.tell}|${v.holding ? 1 : 0}|${f5(v.lightMult)}|${f5(v.snapAt)}|${v.inSpot ? 1 : 0}|${f5(v.depth)}`
      + `|${F.bobberPos ? `${f5(F.bobberPos.x)},${f5(F.bobberPos.z)}` : '-'}|${F.spots.length}|${fr.join(';')}`;
    hash = fnv(hash, s);
    fr = [];
  };
  for (let i = 0; i < 12; i++) step();
  const PLAN = (i) => ({
    zone: i < 12 ? 'mossmere' : i < 22 ? 'sporewood' : i < 32 ? 'glasswater' : 'paleabyss',
    phase: i % 10 >= 7 ? 'gloomtide' : i % 10 === 6 ? 'dusk' : 'calm',
    bait: i % 5 === 3 ? 'lumen_moss' : 'mireworm',
    spook: i === 4 || i === 17 || i === 29,
    moved: i === 7, slam: i === 15, sail: i === 21, greedy: i === 11 || i === 26 || i === 36,
    legend: i === 38 ? 'belled_matriarch' : i === 39 ? 'drifting_grove' : null,
    late: i === 9 || i === 24,
  });
  for (cast = 0; cast < 40; cast++) {
    const P = PLAN(cast);
    hash = 2166136261;
    const f0 = frame;
    if (P.zone !== zoneId) { zoneId = P.zone; run.zone = P.zone; bus.emit('zone:change', { zone: P.zone, prev: null }); for (let i = 0; i < 15; i++) step(); }
    if (P.phase !== ph.phase) { ph.phase = P.phase; run.phase = P.phase; bus.emit('phase:change', { phase: P.phase }); }
    run.equippedBait = P.legend ? (P.legend === 'belled_matriarch' ? 'heartmoss' : 'glowcap_bulb') : P.bait;
    if (cast === 30) F.addSpots(2, { rare: true });
    if (P.legend) {
      if (P.legend === 'drifting_grove') { zoneId = 'sporewood'; run.zone = 'sporewood'; bus.emit('zone:change', { zone: 'sporewood', prev: null }); for (let i = 0; i < 15; i++) step(); }
      ctx.debug.forceBite({ speciesId: P.legend });
    } else {
      // aim, charge, release
      ctx.input.ndc = { x: U(-0.8, 0.8), y: U(-0.6, 0.9) };
      F.onPointerDown();
      const hold = U(0.4, 2.6);
      for (let t = 0; t < hold; t += 1 / 30) { if (bot() < 0.15) { ctx.input.ndc = { x: ctx.input.ndc.x + U(-0.05, 0.05), y: ctx.input.ndc.y + U(-0.05, 0.05) }; F.onPointerMove(ctx.input.ndc); } step(); }
      F.onPointerUp();
    }
    let reactAt = -1, holdOn = false, guard = 0, sailT = 0, slammed = false, spooked = false, movedDone = false;
    const spookAt = U(0.6, 2.0);
    while (guard++ < 30 * 150) {
      const st = F.state;
      if (st === 'idle' && guard > 3) break;
      if (st === 'waiting') {
        if (P.spook && !spooked && F.view && guard > spookAt * 30) { spooked = true; F.onPointerDown(); F.onPointerUp(); }
        if (P.moved && !movedDone && guard > 30) { movedDone = true; F.cancel('moved'); }
      }
      if (st === 'bite') {
        if (reactAt < 0) reactAt = guard + Math.round((P.late ? U(1.2, 1.8) : U(0.15, 0.7)) * 30);
        if (guard >= reactAt) { F.onPointerDown(); holdOn = true; reactAt = 1e9; }
      }
      if (st === 'reeling') {
        const v = F.view;
        const target = (v.sweetMin + v.sweetMax) / 2 + U(-0.06, 0.06);
        const want = P.greedy ? true : v.surge ? v.tension < 0.3 : v.tension < target;
        if (want !== holdOn) { holdOn = want; if (want) F.onPointerDown(); else F.onPointerUp(); }
        if (P.slam && !slammed && v.progress > 0.25) { slammed = true; F.slam(); }
        if (P.sail && v.progress > 0.2 && sailT < 1.2) { sailT += 1 / 30; ctx.input.move = { x: 1, y: 0 }; } else ctx.input.move = { x: 0, y: 0 };
      } else if (holdOn && st !== 'reeling') { holdOn = false; F.onPointerUp(); }
      step();
    }
    ctx.input.move = { x: 0, y: 0 };
    if (holdOn) F.onPointerUp();
    if (F.state !== 'idle') { F.cancel('reset'); step(); }
    for (let i = 0; i < 100; i++) step();      // the catch display runs out (3.2 s without a card)
    casts.push({ cast, frames: frame - f0, hash: hash.toString(16), end: F.state });
  }
  cast = 40;
  Math.random = realRandom;
  return { casts, events, errors: ctx.errors.slice() };
}

// ---------------------------------------------------------------------------------------------------------------- assert
const got = play();
const summary = { casts: got.casts.length, events: got.events.length, caught: got.events.filter((x) => x.e === 'fishing:caught').length,
  escaped: got.events.filter((x) => x.e === 'fishing:escaped').length, misses: got.events.filter((x) => x.e === 'fishing:miss').length };
if (RECORD) {
  writeFileSync(FILE, JSON.stringify({ note: 'v1 golden fishing trace (AF-0): recorded on gw-af-base f58af48 before any AF code; flag-off data, Math.random = mulberry32(20261105)', summary, casts: got.casts, events: got.events }) + '\n');
  console.log(`recorded ${FILE}: ${JSON.stringify(summary)}`);
  process.exit(0);
}
let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; if (VERBOSE) console.log('  ok:', msg); } else { fail++; console.log('  FAIL:', msg); } }
if (!existsSync(FILE)) { console.log(`  FAIL: ${FILE} is missing (run with --record on the AF base)`); process.exit(1); }
const want = JSON.parse(readFileSync(FILE, 'utf8'));
console.log(`- the v1 golden fishing trace: ${JSON.stringify(summary)} (recorded ${JSON.stringify(want.summary)})`);
ok(got.errors.length === 0, `no fishing errors in the flag-off run (${got.errors.slice(0, 2).join(' | ')})`);
ok(summary.caught >= 10 && summary.escaped >= 4 && summary.misses >= 3, 'the bot exercises catches, escapes and misses');
for (let i = 0; i < want.casts.length; i++) {
  const a = got.casts[i], b = want.casts[i];
  ok(!!a && a.hash === b.hash && a.frames === b.frames && a.end === b.end, `cast ${i}: frame digest ${a?.hash} / ${a?.frames} frames = ${b.hash} / ${b.frames}`);
}
const n = Math.max(got.events.length, want.events.length);
let first = -1;
for (let i = 0; i < n; i++) { if (JSON.stringify(got.events[i]) !== JSON.stringify(want.events[i])) { first = i; break; } }
ok(first < 0, first < 0 ? `all ${n} bus events identical` : `bus events identical (first difference at #${first}: got ${JSON.stringify(got.events[first])} want ${JSON.stringify(want.events[first])})`);
console.log(`v1-fishing-trace: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
