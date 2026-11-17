// M1 step 5a, the home barge and its mooring (docs/loop/M1.md §4 step 5a; SPEC §6.1, §6.5; PLAN revision 9's T29), in node:
//   the mooring    data.loopMooring on the Mossmere's docks; the keel circles in the lake's obstacles (world.js under the loop, none
//                  off it); loop-rules' mooringChecks against the lake and a fixture of M1 §2.4's four places (and LOOP.places
//                  once step 3a ships them); the glide in (glideInPath) from the spawn and from far away
//   Murk moored    actors-merchant's moored mode: his lamp's PointLight at 0 through 300 s of a raft sailing round him, no turning
//                  to it (the built arrive mode does turn: the check means something), leave() keeps him; loop-home's startTrip
//                  never calls merchant.leave; enterHome, startTrip and Continue moor him at the slot; no merchant:arrive on a trip
//   the save       meta.loop.barge = {water, towed}, its own field; LOOP_SCHEMA 4; migrateLoop gives an older save the Mossmere,
//                  towed; towBarge
//   the targets    home-targets' frame at 358 px (and the other sizes), the buttons ≥ 44 px and never overlapping; ui-loop's ids
//   the barge      actors-home: three draw calls (two in the mirror, one in the shadow), no light, the variants in the same meshes
//   node tools/tests/loop-5a.test.mjs
import * as THREE from 'three';

// a canvas for the merchant's pad texture (node has none)
const fakeCtx2d = () => new Proxy({}, { get: (t, k) => (k in t ? t[k] : k === 'createRadialGradient' || k === 'createLinearGradient' ? () => ({ addColorStop() {} }) : k === 'createImageData' ? (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }) : () => {}), set: () => true });
globalThis.document = globalThis.document || { createElement: () => ({ width: 0, height: 0, getContext: fakeCtx2d }) };

const { loadLoopData, fakeLoop, freshLoopMeta } = await import('./loop-fixture.mjs');
const D = await loadLoopData();
const loopFlag = globalThis.GW_LOOP;
delete globalThis.GW_LOOP; globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
const DOFF = await import('../../src/data.js?loop-5a-v3');   // the v3 build without the loop (no mooring)
globalThis.GW_LOOP = loopFlag;
const WLY = await import('../../src/world-layout.js');
const R = await import('../../src/loop-rules.js');
const HT = await import('../../src/home-targets.js');
const PL = await import('../../src/progression-loop.js');
const { createMerchant } = await import('../../src/actors-merchant.js');
const { createHome, glowLevels, homeVariants } = await import('../../src/actors-home.js');
const { createLoopHome } = await import('../../src/loop-home.js');
const { createBus } = await import('../../src/core.js');
const { homeTargetIds } = await import('../../src/ui-loop.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL:', m); } };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), `${m} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);
const section = (s) => console.log(`- ${s}`);
const flush = () => new Promise((r) => setTimeout(r, 0));

const Z = D.ZONE_BY_ID.mossmere, LAY = WLY.buildLayout(Z), M = D.loopMooring('mossmere', LAY.docks);
const RAFT_R = D.BALANCE.move.raftRadius;
// M1 §2.4's four places as their footprints (the MOSSMERE_V3 records' water): the fixture the mooring is checked against before
// step 3a ships LOOP.places (and beside it after)
export const PLACES_FIXTURE = [
  { id: 'lily_maze', area: { kind: 'disc', x: -40.5, z: 24.5, r: 7.5 } },
  { id: 'under_the_span', area: { kind: 'path', pts: [[-40, -4], [-19, 5]], w: 8 } },
  { id: 'buoy_lights', area: { kind: 'rect', x: -48, z: -2, w: 4, d: 24 } },
  { id: 'bell_pool', area: { kind: 'disc', x: -4, z: -14, r: 6 } },
];

// =====================================================================================
section('the mooring: the Jetty, the hulls as keel circles, clear of the lake, the places and the glides');
{
  ok(!!M, 'data.loopMooring resolves the Mossmere\'s mooring on its docks');
  eq([M.raft.x, M.raft.z], [LAY.docks[0].x, LAY.docks[0].z], 'the raft\'s tie-up at the stern is docks[0] (PLAN CHOICE 44\'s place)');
  eq(M.circles.map((c) => [c.kind, c.r]), [['hull', 1.8], ['hull', 1.8], ['hull', 1.8], ['hull', 1.8], ['hull', 1.8], ['murk', D.LOOP.barge.murkR]], 'five keel circles of r 1.8 m along the Slow Hearth and Murk\'s own');
  const keel = M.circles.filter((c) => c.kind === 'hull');
  ok(Math.abs(Math.hypot(keel[0].x - keel[4].x, keel[0].z - keel[4].z) - 4 * D.LOOP.barge.keel.step) < 1e-9, 'the keel row runs along the hull, one step apart');
  eq(DOFF.LOOP_ENABLED, false, 'the build beside it is the v3 build without the loop (world.js reads a mooring only under LOOP_ENABLED)');
  const out = D.sailPlan(LAY.docks[0], { x: 0, z: 0 }, D.LOOP.tutorial, 'mossmere').path;
  const opts = { obstacles: [...LAY.obstacles, ...LAY.gateObstacles], shoreR: LAY.shoreR, spawn: LAY.spawn, out, raftR: RAFT_R, reach: D.LOOP.barge.reach };
  eq(R.mooringChecks(M, { ...opts, places: PLACES_FIXTURE }), [], 'both hulls and the raft clear of every island, pillar, post, gate stone, the four places and their banks, the shore and the spawn; the glides clear');
  // whatever LOOP.places holds (step 3a's) is checked the same way
  const LPL = D.LOOP.places && typeof D.LOOP.places === 'object' && !Array.isArray(D.LOOP.places) ? D.LOOP.places : {};
  const live = Object.keys(LPL).filter((id) => LPL[id]?.water === 'mossmere').map((id) => ({ id, area: typeof D.loopPlace === 'function' ? D.loopPlace(id)?.area : null })).filter((p) => p.area);
  eq(R.mooringChecks(M, { ...opts, places: live }), [], `… and LOOP.places' own (${live.length} today)`);
  // the checks mean something: a hull in a bank, on the statue, a glide through the barge
  ok(R.mooringChecks(M, { ...opts, places: [{ id: 'near', area: { kind: 'disc', x: M.hull.x + 4, z: M.hull.z, r: 1 } }] }).some((f) => /mist bank/.test(f)), 'self-test: a place beside the hull fails (its bank)');
  ok(R.mooringChecks({ ...M, circles: [...M.circles, { x: 8, z: 36, r: 1.8, kind: 'hull' }] }, opts).some((f) => /statue/.test(f)), 'self-test: a hull on the Jetty\'s statue fails');
  ok(R.mooringChecks(M, { ...opts, out: [[M.raft.x, M.raft.z], [M.hull.x, M.hull.z]] }).some((f) => /glide out passes/.test(f)), 'self-test: a glide out through the barge fails');
  // the glide in
  const fromSpawn = R.glideInPath(LAY.spawn, M, { pad: RAFT_R, obstacles: [...M.circles, ...LAY.obstacles] });
  ok(fromSpawn && !fromSpawn.cut && fromSpawn.clear >= RAFT_R, 'the film\'s hand-off from the spawn reaches the stern clear of the hulls, uncut');
  eq(fromSpawn.path.at(-1), [M.raft.x, M.raft.z], '… ending at the tie-up');
  ok(fromSpawn.len / D.LOOP.tutorial.arrive <= 2 * D.LOOP.time.raftSpeed + 1e-9, `… at most twice the raft's speed over its ${D.LOOP.tutorial.arrive} s (R18: ${(fromSpawn.len / D.LOOP.tutorial.arrive).toFixed(1)} m/s)`);
  for (const [x, z] of [[-48, -2], [-4, -14], [-40.5, 24.5], [12, 52], [5, 44], [40, 10]]) {
    const g = R.glideInPath({ x, z }, M, { reach: D.LOOP.barge.reach, pad: RAFT_R, obstacles: [...M.circles, ...LAY.obstacles] });
    ok(g && g.len <= D.LOOP.barge.reach + 1e-6 && Math.hypot(g.path.at(-1)[0] - M.raft.x, g.path.at(-1)[1] - M.raft.z) < 1e-9 && g.clear >= RAFT_R - 1e-6,
      `the sail home from (${x}, ${z}): ${g?.cut ? 'the last' : 'a'} ${g?.len.toFixed(1)} m into the stern, clear by ${g?.clear.toFixed(2)} m`);
  }
  const near = R.glideInPath({ x: M.raft.x - 3, z: M.raft.z - 4 }, M, { reach: D.LOOP.barge.reach, pad: RAFT_R, obstacles: M.circles });
  ok(near && !near.cut && near.path.length === 2, 'a raft just off the stern glides straight in, no cut');
}

// =====================================================================================
section('the world under the loop: the hulls in layout.obstacles, the mooring readable; nothing off it');
{
  const { create: createWorld } = await import('../../src/world.js');
  const mk = (data) => createWorld({ data, state: { meta: { deepestZone: 0 }, run: null }, bus: createBus(), flow: 'title', errors: [] });
  const W = mk(D), off = mk(DOFF);
  const kinds = (w) => w.getObstacles().map((o) => o.kind);
  eq(kinds(W).filter((k) => k === 'hull').length, 5, 'under the loop the five keel circles are among the lake\'s obstacles');
  eq(kinds(W).filter((k) => k === 'murk').length, 1, '… and Murk\'s barge\'s');
  eq(kinds(off).filter((k) => k === 'hull' || k === 'murk').length, 0, 'off the loop none (the built lake unchanged)');
  eq(W.getObstacles().length - off.getObstacles().length, 6 - 2, '… and nothing else differs in the obstacles but the Jetty\'s two posts (Murk\'s old berth), gone');
  const d0 = LAY.docks[0];
  ok(d0.posts.every((p) => !W.getObstacles().some((o) => o.kind === 'post' && Math.abs(o.x - p.x) < 1e-9 && Math.abs(o.z - p.z) < 1e-9)) && off.getObstacles().filter((o) => o.kind === 'post').length === W.getObstacles().filter((o) => o.kind === 'post').length + 2,
    '… the posts of docks[0] only; every other dock keeps its own');
  ok(!!W.getMooring() && W.getMooring().cam && off.getMooring() === null, 'world.getMooring(): the mooring under the loop, null off it');
  const p = { x: M.raft.x, z: M.raft.z };
  W.collide(p, RAFT_R);
  ok(Math.hypot(p.x - M.raft.x, p.z - M.raft.z) < 1e-9, 'the raft tied at the stern is clear of the keel circles (collide leaves it there)');
  const q = { x: M.hull.x, z: M.hull.z };
  W.collide(q, RAFT_R);
  ok(Math.hypot(q.x - M.hull.x, q.z - M.hull.z) > 3, 'a raft steered into the hull is pushed out of it');
}

// =====================================================================================
section('Murk moored: his lamp dark, no turning to the raft, leave() keeps him (M1 §4 step 5a; T29 rev. 9)');
{
  const mkCtx = () => ({ data: D, player: { position: new THREE.Vector3(), isStub: false }, models: { emitSmoke() {} } });
  const ctx = mkCtx(), m = createMerchant(ctx);
  m.moor(new THREE.Vector3(M.murk.x, 0, M.murk.z), M.murk.yaw);
  eq(m.mode, 'moored', 'moor(): the moored mode');
  ok(m.present && m.object3d.visible, '… present and seen at once');
  let lit = 0, maxTurn = 0, maxLook = 0, yawDrift = 0;
  const yaw0 = m.object3d.rotation.y;
  for (let i = 0; i < 6000; i++) {   // 300 s, the raft sailing round him at 6–20 m
    const a = i * 0.004, r = 6 + 14 * (0.5 + 0.5 * Math.sin(i * 0.0013));
    ctx.player.position.set(M.murk.x + Math.cos(a) * r, 0, M.murk.z + Math.sin(a) * r);
    m.update(0.05, () => 0);
    lit = Math.max(lit, m.light.intensity, m.lampLit);
    maxTurn = Math.max(maxTurn, Math.abs(m.facing.bodyYaw));
    maxLook = Math.max(maxLook, Math.abs(m.facing.lookYaw));
    yawDrift = Math.max(yawDrift, Math.abs(m.object3d.rotation.y - yaw0));
  }
  eq(lit, 0, 'his lamp\'s PointLight held at 0 through 300 s (its glow mesh and halo only)');
  ok(maxTurn < 1e-9 && maxLook <= 0.22 && yawDrift <= 0.05, `no turning toward the raft (body ${maxTurn.toFixed(3)}, head ${maxLook.toFixed(3)} rad at most: his idle only)`);
  const passes = (o3) => { let cast = 0, refl = 0; o3.traverse((o) => { if ((o.isMesh || o.isSprite) && !o.userData?.isOutline) { if (o.castShadow) cast++; if (o.layers.isEnabled(1)) refl++; } }); return { cast, refl }; };
  const builtM = createMerchant(mkCtx());
  const { setupSurface } = await import('../../src/toon.js');
  setupSurface(builtM.object3d, { minReflect: 0.4 });
  const before = passes(builtM.object3d);
  builtM.moor(new THREE.Vector3(M.murk.x, 0, M.murk.z), M.murk.yaw);
  const moored = passes(builtM.object3d);
  ok(moored.cast <= 8 && moored.cast < before.cast && moored.refl < before.refl, `moored, his small parts leave the shadow and mirror passes (casters ${before.cast} → ${moored.cast}, mirrored ${before.refl} → ${moored.refl})`);
  builtM.leave({ instant: true, unmoor: true });
  eq(passes(builtM.object3d), before, '… and are put back as built when he is unmoored');
  m.leave({ instant: true });
  ok(m.mode === 'moored' && m.present, 'leave() keeps him moored (the market\'s reset, the title)');
  m.leave({ instant: true, unmoor: true });
  ok(m.mode === 'hidden' && !m.present, 'leave({unmoor: true}) unmoors him (another water)');
  // the built mode turns to the raft: the moored check means something
  const c2 = mkCtx(), b = createMerchant(c2);
  b.arrive(new THREE.Vector3(0, 0, 0), 0, { instant: true });
  c2.player.position.set(8, 0, 0);
  for (let i = 0; i < 200; i++) b.update(0.05, () => 0);
  ok(Math.abs(b.facing.bodyYaw) > 0.5 && b.light.intensity > 0, 'the built arrive mode turns to the raft and lights its lamp (the contrast)');
}

// =====================================================================================
section('the home flow: Murk moored at home and through a trip, the glide in ends at the stern (loop-home)');
{
  function env({ continueTrip = false } = {}) {
    const bus = createBus(), calls = [], ev = [];
    const emit = bus.emit.bind(bus);
    bus.emit = (e, p = {}) => { ev.push({ e, p }); emit(e, p); };
    const loop = fakeLoop({ D, onTrip: false });
    const player = {
      position: { x: 0, z: 0 }, glides: [], g: null,
      glide(path, o = {}) { const pts = path.map((p) => (Array.isArray(p) ? { x: p[0], z: p[1] } : p)); this.position = { ...pts[0] }; let res; const pr = new Promise((r) => { res = r; }); this.g = { pts, o, res }; this.glides.push({ pts, o }); return pr; },
      end() { const g = this.g; if (!g) return; this.g = null; this.position = { ...g.pts.at(-1) }; g.res(false); },
      teleport(p, yaw) { this.end(); this.position = { x: p.x, z: p.z }; this.yaw = yaw; calls.push('teleport'); },
    };
    const merchant = {
      moor(pos, yaw, o) { calls.push('merchant.moor'); this.at = { x: pos.x, z: pos.z, yaw, zone: o?.zone }; },
      arrive() { calls.push('merchant.arrive'); }, leave() { calls.push('merchant.leave'); },
    };
    const ctx = {
      THREE, bus, data: D, flow: 'title', paused: false, cinematic: false, state: { meta: freshLoopMeta(D), run: null }, player,
      ui: { closeAll() {}, isBlocking: () => false, isCatchOpen: () => false },
      progression: { createRun: (o) => loop.createTrip(o), loop },
      actors: { merchant, setCharacter() {} },
      world: { getDocks: () => LAY.docks.map((d) => ({ position: new THREE.Vector3(d.x, 0, d.z), yaw: d.yaw })), getMooring: () => M, getObstacles: () => [...LAY.obstacles, ...M.circles] },
      render: { snapCamera() { calls.push('snapCamera'); } },
      fishing: { state: 'idle', inShow: false, cancel() {}, isAnchored: () => false },
    };
    let saved = continueTrip ? { active: true, outing: 'trip' } : null;
    const H = createLoopHome({ ctx, data: D, lake: 'mossmere', setFlow: (f) => { ctx.flow = f; }, savedRun: { get: () => saved, set: (r) => { saved = r; } },
      hasSavedRun: () => !!(saved && saved.active && saved.outing === 'trip'), showLake() {}, save() {}, startIntro: () => false, introOn: () => ({ intro: false, debug: false, optIn: false }) });
    return { ctx, H, loop, player, merchant, calls, ev };
  }
  const E = env();
  E.H.beginIntro({ character: 'wick' });
  eq(E.ctx.flow, 'home', 'Start with no film: home');
  ok(E.calls.includes('merchant.moor') && !E.calls.includes('merchant.arrive'), 'enterHome moors Murk (moored mode), never the built arrive');
  eq([E.merchant.at.x, E.merchant.at.z, E.merchant.at.yaw, E.merchant.at.zone], [M.murk.x, M.murk.z, M.murk.yaw, 'mossmere'], '… at the mooring\'s murk slot');
  eq(E.loop.s.barge, { water: 'mossmere', towed: ['mossmere'] }, 'the opening\'s hand-off writes the barge\'s tow (as 5b\'s will)');
  eq(E.player.position, { x: M.raft.x, z: M.raft.z }, 'the raft at the stern\'s tie-up');
  E.calls.length = 0; E.ev.length = 0;
  E.H.sail({ water: 'mossmere' });
  E.player.end(); await flush();
  eq(E.ctx.flow, 'playing', 'Sail: the glide out, then the trip');
  ok(!E.calls.includes('merchant.leave'), 'startTrip no longer calls merchant.leave (M1 §4 step 5a)');
  ok(E.calls.includes('merchant.moor'), '… it moors him again before the Sail\'s zone:change');
  ok(!E.ev.some((x) => x.e === 'merchant:arrive'), 'T29 (rev. 9): no merchant:arrive on a trip');
  // the sail home from far out: the glide ends at the stern
  E.player.position = { x: -40, z: 0 };
  E.calls.length = 0;
  E.H.endTripHome('home');
  const g = E.player.glides.at(-1);
  ok(g.o.kind === 'home' && g.o.duration === D.LOOP.time.home, `the sail home: a ${D.LOOP.time.home} s glide, kind home`);
  eq(g.pts.at(-1), { x: M.raft.x, z: M.raft.z }, '… that ends at the stern (the raft\'s tie-up)');
  ok(E.calls.includes('teleport') && E.calls.includes('snapCamera'), '… from the last LOOP.barge.reach m of the way in (the raft and the camera put there first)');
  ok(Math.hypot(g.pts[0].x - M.raft.x, g.pts[0].z - M.raft.z) <= D.LOOP.barge.reach + 1e-6, '… never more than reach m from the stern');
  E.player.end(); await flush();
  ok(E.ev.some((x) => x.e === 'home:enter' && x.p.from === 'trip'), 'then home:enter {from: trip}: the tally opens as the raft ties up');
  eq(E.player.position, { x: M.raft.x, z: M.raft.z }, '… tied at the stern');
}

// =====================================================================================
section('the save: meta.loop.barge = {water, towed}, LOOP_SCHEMA 4, migrateLoop (M1 §2.11)');
{
  eq(PL.LOOP_SCHEMA, 4, 'LOOP_SCHEMA 4 (the barge\'s field)');
  const f = PL.freshLoop(D);
  eq(f.barge, { water: 'mossmere', towed: [] }, 'a fresh save: the barge at the first water, its tow not yet played (the opening plays it)');
  ok(!('barge' in f.home), '… its own field, not inside home (which keeps the upgrades)');
  // a step-4 save (schema 3): it opens at the barge, towed, with nothing else moved
  const old = { loop: { v: 3, clams: 512, evenings: 9, holdSlots: 5, tackle: { rod: 2, line: 1, reel: 1 }, maps: { lakes: ['mossmere'], places: ['lily_maze'] },
    raft: { oars: 1, keel: 1, lantern: 0 }, home: { orders: 1, baitBed: 1, wall: 0, lights: 0 }, looks: ['slate_cloak'], wick: 'tallow', tutorial: { done: true, step: null } } };
  const before = JSON.parse(JSON.stringify(old.loop));
  PL.migrateLoop(old, D);
  eq(old.loop.barge, { water: 'mossmere', towed: ['mossmere'] }, 'migrateLoop: a save from steps 1–4 gets {water: mossmere, towed: [mossmere]} (as if the opening\'s tow had played)');
  eq(old.loop.v, 4, '… and steps meta.loop.v to 4');
  eq([old.loop.clams, old.loop.evenings, old.loop.holdSlots, old.loop.tackle, old.loop.maps, old.loop.raft, old.loop.home, old.loop.looks, old.loop.wick, old.loop.tutorial],
    [before.clams, before.evenings, before.holdSlots, before.tackle, before.maps, before.raft, before.home, before.looks, before.wick, before.tutorial], '… its clams, maps, raft, upgrades, looks, Wick and tutorial unchanged');
  const again = JSON.parse(JSON.stringify(old)); PL.migrateLoop(again, D);
  eq(again.loop, old.loop, 'migrateLoop is idempotent');
  const v4 = { loop: { ...PL.freshLoop(D), barge: { water: 'mossmere', towed: [] } } }; PL.migrateLoop(v4, D);
  eq(v4.loop.barge, { water: 'mossmere', towed: [] }, 'a schema-4 save keeps its barge as it is (a fresh save\'s untowed barge is not marked)');
  const bad = { loop: { v: 4, barge: { water: 'nowhere', towed: ['mossmere', 'mossmere', 7, 'nowhere'] } } }; PL.migrateLoop(bad, D);
  eq(bad.loop.barge, { water: 'mossmere', towed: ['mossmere'] }, 'a bad barge is made whole (a known water, each water once)');
  const none = {}; PL.migrateLoop(none, D);
  eq(none.loop.barge, { water: 'mossmere', towed: [] }, 'an old v3 save with no loop block opens a fresh loop (the opening to come)');
  // the ledger's writer (5a's hand-off, 5b's tow)
  const fl = fakeLoop({ D });
  eq(fl.towBarge('mossmere'), { water: 'mossmere', towed: ['mossmere'] }, 'towBarge: the water towed to, once');
  ok(PL.LOOP_METHODS.includes('barge') && PL.LOOP_METHODS.includes('towBarge'), 'the loop API names barge and towBarge (CONTRACT §14)');
}

// =====================================================================================
section('the targets: the home camera\'s frame at 358 px and every size, each button ≥ 44 px, none overlapping');
{
  const cam = M.cam;
  // (the portrait pose upright, the landscape wide, the two eased into each other between: a tablet held sideways, 4:3, square)
  for (const [vw, vh] of [[358, 664], [358, 775], [390, 844], [390, 664], [690, 760], [700, 760], [800, 800], [900, 900], [900, 1000], [1024, 768], [1180, 820], [960, 540], [1280, 720], [844, 390]]) {
    const r = HT.frameCheck(M, D.homeCamAt(cam, vw / vh), { vw, vh });
    ok(r.ok, `${vw} × ${vh}: the barge, the raft and the four targets in frame, each ≥ 44 px, none overlapping, every word ≥ 16 px from the others and the Wick${r.ok ? '' : `: ${r.faults.join('; ')}`}`);
    ok(r.layout.items.every((it) => it.w >= 44 && it.box.b - it.box.t >= 44), `${vw} × ${vh}: every button at least 44 × 44 px`);
    // the words themselves (the owner's play-test on a near-square phone: CHART across the Wick, its hook into JOURNAL's J)
    const W = r.layout.items.filter((it) => it.wordBox), wick = HT.rectOf(HT.wickCorners(M), (p) => HT.project(p, D.homeCamAt(cam, vw / vh), vw, vh));
    let gapW = Infinity, gapWick = Infinity;
    for (let i = 0; i < W.length; i++) { gapWick = Math.min(gapWick, HT.apart(W[i].wordBox, wick)); for (let j = i + 1; j < W.length; j++) gapW = Math.min(gapW, HT.apart(W[i].wordBox, W[j].wordBox)); }
    // CHART's word under the raft (the user, 17 Nov 2026: "below the raft not to the right of the raft"): its centre below the raft's
    // lowest projected point, inside the raft's width
    const raft = HT.rectOf(HT.raftCorners(M), (p) => HT.project(p, D.homeCamAt(cam, vw / vh), vw, vh)), cw = r.layout.items.find((it) => it.id === 'chart')?.wordBox;
    ok(raft && cw && (cw.t + cw.b) / 2 > raft.b && (cw.l + cw.r) / 2 >= raft.l && (cw.l + cw.r) / 2 <= raft.r, `${vw} × ${vh}: CHART's word centred under the raft (its centre ${cw ? ((cw.t + cw.b) / 2).toFixed(0) : '-'} px down, the raft's foot ${raft ? raft.b.toFixed(0) : '-'})`);
    ok(W.length === 3 && gapW >= 15.5 && gapWick >= 15.5, `${vw} × ${vh}: Murk, Chart and Journal each ≥ 16 px apart (${gapW.toFixed(0)} px) and off the Wick (${gapWick.toFixed(0)} px), the hooks counted where shown`);
  }
  // the words measured as drawn: a wide word is kept apart all the same, its hooks dropped first, then nudged along its band
  { const pose = D.homeCamAt(cam, 900 / 900), wide = { murk: { w: 150, h: 22, hook: 42 }, chart: { w: 150, h: 22, hook: 42 }, journal: { w: 190, h: 22, hook: 42 } };
    const r = HT.frameCheck(M, pose, { vw: 900, vh: 900, wordSize: wide });
    ok(r.ok && r.layout.items.filter((it) => it.wordBox).every((it) => !it.hooks || it.id === 'murk' || it.id === 'chart'), 'frameCheck with wider measured words: still apart, the close ones without their hooks (CHART under the raft, clear, keeps its own)', r.faults);
    // self-test: the words laid over each other fail the check
    const lay = HT.layoutTargets({ chart: { l: 100, t: 100, r: 160, b: 160 }, journal: { l: 172, t: 100, r: 232, b: 160 } }, { vw: 900, vh: 900, word: 34, wordSize: { chart: { w: 120, h: 22, hook: 0 }, journal: { w: 120, h: 22, hook: 0 } } });
    const wa = lay.items.find((it) => it.id === 'chart').wordBox, wb = lay.items.find((it) => it.id === 'journal').wordBox;
    ok(lay.ok && HT.apart(wa, wb) >= 15.5, 'layoutTargets: two wide words under close buttons are nudged ≥ 16 px apart', { wa, wb });
    const wick = { l: 110, t: 140, r: 150, b: 200 }, lw = HT.layoutTargets({ chart: { l: 100, t: 100, r: 160, b: 160 } }, { vw: 900, vh: 900, word: 34, avoid: [wick] });
    ok(lw.ok && HT.apart(lw.items[0].wordBox, wick) >= 15.5, 'layoutTargets: a word nudged off the Wick\'s figure', lw.items[0]); }
  // the integration's fix (the 5a review's must): every shape of screen between a phone held upright and a wide one keeps the
  // raft, the Wick, the barge and Murk in frame (the poses eased into each other between cam.blend's aspects, never a jump)
  { const bad = [];
    let last = null, jump = 0;
    for (let a = 0.5; a <= 2.2001; a += 0.025) for (const vh of [600, 768, 1024]) {
      const vw = Math.round(vh * a), pose = D.homeCamAt(cam, vw / vh), r = HT.frameCheck(M, pose, { vw, vh });
      if (!r.ok) bad.push(`${vw} × ${vh}: ${r.faults[0]}`);
      if (vh === 768) { if (last) jump = Math.max(jump, Math.hypot(...pose.pos.map((v, i) => v - last.pos[i])), Math.abs(pose.fov - last.fov)); last = pose; }
    }
    ok(bad.length === 0, `every aspect from 0.5 to 2.2: the frame holds${bad.length ? `: ${bad.slice(0, 3).join('; ')}` : ''}`);
    ok(jump < 2, `… and the pose moves smoothly with the aspect (at most ${jump.toFixed(2)} m or ° a 0.025 step)`);
    eq([D.homeCamAt(cam, 0.6).k, D.homeCamAt(cam, 1.8).k], [0, 1], 'homeCamAt: the portrait pose upright, the landscape pose wide'); }
  // the layout pushes two objects that overlap on screen apart and keeps them ≥ 44 px, clear of a reserved rect
  const lay = HT.layoutTargets({ murk: { l: 100, t: 100, r: 130, b: 130 }, chart: { l: 110, t: 110, r: 150, b: 150 } }, { vw: 358, vh: 664, reserve: [{ l: 0, t: 0, r: 358, b: 60 }] });
  ok(lay.ok && lay.items.every((it) => it.w >= 44 && it.box.b - it.box.t >= 44 && it.t >= 60), 'layoutTargets: overlapping objects become two ≥ 44 px buttons, apart, off the reserved band');
  ok(!HT.frameCheck(M, { pos: [M.hull.x, 40, M.hull.z], look: [M.hull.x, 0, M.hull.z - 60], fov: 30 }, { vw: 358, vh: 664 }).ok, 'self-test: a frame that loses the barge fails');
  eq(homeTargetIds({ home: { wall: 0 } }), ['murk', 'chart', 'journal', 'rack'], 'the tiles\' order: Murk, Chart, Journal, the rod rack (the Wick\'s sheet, SHEET.md §2.3)');
  eq(homeTargetIds({ home: { wall: 1 } }), ['murk', 'chart', 'journal', 'rack', 'wall'], '… and the doorway from wing I');
}

// =====================================================================================
section('the barge: three draw calls, the glow by the hour, the variants in the same meshes, no light');
{
  const home = createHome({ data: D, world: { getMood: () => ({ night: 0.37, warm: 0.6 }) }, flow: 'home', state: { meta: { loop: PL.freshLoop(D) } }, models: { emitSmoke() {} } });
  home.moor(M.hull);
  home.show(true);
  const meshes = [], lights = [];
  home.object3d.traverse((o) => { if (o.isMesh && o.visible && o.material?.visible !== false) meshes.push(o); if (o.isLight) lights.push(o); });
  const top5b = home.object3d.getObjectByName('home:chartTop') ? 1 : 0;   // M1 step 5b: the chart table's top (its own textured plane)
  eq(meshes.length, 3 + top5b, 'three meshes drawn: the timber, its outline and the glow (≤ 6 main-pass calls; 5b: + the chart table\'s top)');
  eq(home.calls(), { main: 3 + top5b, mirror: 2, shadow: 1 }, 'its budget: 3 main-pass (5b: 4), 2 mirror, 1 shadow (M1 §2.14: ≤ 6, ≤ 2, ≤ 2)');
  eq(lights.length, 0, 'no PointLight (the windows and the stove are emissive only)');
  const g0 = home.glow.geometry.attributes.position.count, t0 = home.timber.geometry.attributes.position.count;
  const all = PL.freshLoop(D); all.home = { orders: 2, baitBed: 2, wall: 1, lights: 1 }; all.tackle.rod = 2; all.barge = { water: 'mossmere', towed: ['mossmere'] }; all.legends = { belled_matriarch: true };
  ok(home.setVariants(homeVariants(all)) === true, 'every M1 home object fitted (the Bait Bed\'s two planters, the rail lanterns, wing I, the rod, the sill\'s gilt stone)');
  let after = 0; home.object3d.traverse((o) => { if (o.isMesh && o.visible && o.material?.visible !== false) after++; });
  ok(after === 3 + top5b && home.glow.geometry.attributes.position.count > g0 && home.timber.geometry.attributes.position.count > t0, '… still three meshes, the objects merged into them');
  eq(homeVariants(all).stones, ['gilt', 'blank', 'blank', 'blank'], 'the sill\'s four stones of arc I: the Mossmere\'s gilded (towed, its legend home), the other three blank');
  eq(homeVariants({ barge: { towed: ['mossmere'] } }).stones[0], 'ink', '… inked by the tow alone');
  ok(home.setVariants(homeVariants(all)) === false, 'the same objects: no rebuild');
  const day = glowLevels({ night: 0.05, warm: 0 }), dusk = glowLevels({ night: 0.4, warm: 0 }), night = glowLevels({ night: 0.9, warm: 0 }), dawn = glowLevels({ night: 0.37, warm: 0.6 }, { home: true });
  ok(day.window < dusk.window && dusk.window < night.window && night.window === 1, `the windows come up through the first lights (day ${day.window.toFixed(2)}, dusk ${dusk.window.toFixed(2)}, night ${night.window})`);
  ok(dawn.window > 0.8 && dawn.door > 0.75, 'at first light the windows and the stove are lit (home\'s warmest light)');
  ok(day.lantern < 0.05 && night.lantern > 0.9 && dawn.lantern < night.lantern, 'the rail lanterns burn through the night and fade as the sky pales');
  home.update(0.1, () => 0);
  ok(home.waterLight.intensity > 0 && home.waterLight.streak <= 1, 'the warm windows on the water: one streak in the water\'s light list (no PointLight)');
}

console.log(`\nloop-5a: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
