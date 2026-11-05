// Unit tests for the world's v3 Phase-1 pieces (DESIGN §25.14.2 W1; CONTRACT §13.7 world) and combat's C2 presentation
// table (DESIGN §25.5.7; combat-modes presentation()). Pure logic with the real world module and data, no browser.
//   node tools/tests/world-v3.test.mjs        (or node tools/check.mjs)
// The file re-runs itself in child processes for the other builds (data.js reads its flags at import):
//   GW_WT_MODE=v1     the flag-off build: no watch-lamps, no giant spots, no v3 visuals, v1 presentation
//   GW_WT_MODE=p2     phase 2: the Mossmere's places replace its stopgap giant water (0 there, 3 elsewhere)
//   GW_WT_MODE=walk   §24's walking build: the other lakes' watch-lamps are the sister-candles flagged `watch`, lit only
//                     while progression says so
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const MODE = process.env.GW_WT_MODE || 'p1';
if (MODE === 'v1') { globalThis.GW_V3 = false; }
else { globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = MODE === 'p2' ? 2 : 1; }
if (MODE === 'walk') globalThis.GW_WALK = true;

const THREE = await import('three');
const data = await import('../../src/data.js');
const { createBus } = await import('../../src/core.js');
const { create } = await import('../../src/world.js');
const { buildLayout } = await import('../../src/world-layout.js');
const { watchLampsFor, giantSpotsFor, buildWorldV3 } = await import('../../src/world-v3.js');
const { createHalos } = await import('../../src/world-fx.js');
const M = await import('../../src/combat-modes.js');

let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('  FAIL:', msg); } };
const section = (s) => console.log(`- [${MODE}] ${s}`);

function makeWorld(extra = {}) {
  const ctx = { data, bus: createBus(), state: { meta: { settings: {} }, run: null }, flow: 'title', isMobile: false, errors: [], debug: {}, ...extra };
  const world = create(ctx);
  world.init();
  return { ctx, world };
}

if (MODE === 'p1') {
  section('getWatchLamps(): 2 per lake at the drawn dock buoy-lamps, pool r 6');
  const { ctx, world } = makeWorld();
  const R = data.BALANCE.nightModes.lampWatch.radius;
  ok(R === 6, 'BALANCE.nightModes.lampWatch.radius is 6');
  for (const z of data.ZONES) {
    world.setZone(z.id, { instant: true });
    const L = buildLayout(z);
    const lamps = world.getWatchLamps();
    ok(lamps.length === 2, `${z.id}: 2 watch-lamps (got ${lamps.length})`);
    for (const l of lamps) {
      const d = z.arena.watchLamps.find((q) => q.id === l.id);
      ok(!!d, `${z.id}: ${l.id} comes from arena.watchLamps`);
      ok(d && Math.hypot(d.x - l.position.x, d.z - l.position.z) <= 0.1, `${z.id}: ${l.id} within 0.1 m of its data position`);
      const b = L.docks[l.dock]?.buoy;
      ok(b && Math.abs(b.x - l.position.x) < 1e-9 && Math.abs(b.z - l.position.z) < 1e-9, `${z.id}: ${l.id} sits exactly on dock ${l.dock}'s drawn buoy`);
      ok(l.radius === R && l.lit === true && l.kind === 'buoy' && l.position instanceof THREE.Vector3, `${z.id}: ${l.id} {radius 6, lit, buoy, position}`);
      ok(l.x === l.position.x && l.z === l.position.z, `${z.id}: ${l.id} x / z mirror position`);
    }
    ok(world.getWatchLamps() === lamps, `${z.id}: the same array each call (no per-frame allocation)`);
    // no holdsGiants water within 10 m of a watch lamp (DESIGN §25.5.2)
    const spots = world.getGiantSpots();
    for (const l of lamps) for (const g of spots) {
      const rOut = Array.isArray(g.r) ? g.r[1] : g.r;
      ok(Math.hypot(l.x - g.x, l.z - g.z) - rOut >= 10, `${z.id}: ${l.id} is ≥ 10 m from giant water ${g.id}`);
    }
  }

  section('getGiantSpots(): the 3 stopgap waters per lake, as copies');
  for (const z of data.ZONES) {
    world.setZone(z.id, { instant: true });
    const spots = world.getGiantSpots();
    const F = data.RAFT_FALLBACK_V3[z.id].giants;
    ok((z.arena.places || []).length === 0, `${z.id}: no places in a P1 build`);
    ok(spots.length === 3, `${z.id}: 3 giant spots (got ${spots.length})`);
    ok(spots.map((g) => g.id).join() === F.map((g) => g.id).join(), `${z.id}: ids follow RAFT_FALLBACK_V3`);
    ok(spots.every((g, i) => g.x === F[i].x && g.z === F[i].z && g.kind === F[i].kind && JSON.stringify(g.r) === JSON.stringify(F[i].r)), `${z.id}: kind, x, z, r as authored`);
    spots[0].x += 100; if (Array.isArray(spots[0].r)) spots[0].r[0] = -1;
    ok(z.arena.giantSpots[0].x === F[0].x && (!Array.isArray(F[0].r) || z.arena.giantSpots[0].r[0] === F[0].r[0]), `${z.id}: mutating the result never touches the data`);
    spots[0].x -= 100; if (Array.isArray(spots[0].r)) spots[0].r[0] = F[0].r[0];
  }
  section('debug hooks (CONTRACT §13.11)');
  world.setZone('mossmere', { instant: true });
  ok(typeof ctx.debug.giantSpots === 'function' && ctx.debug.giantSpots().length === 3, 'ctx.debug.giantSpots() lists the Mossmere stopgap');
  ok(typeof ctx.debug.watchLamps === 'function' && ctx.debug.watchLamps().map((l) => l.id).join() === 'se_buoy,w_buoy', 'ctx.debug.watchLamps() lists se_buoy, w_buoy');
  ok(ctx.errors.length === 0, 'no ctx.errors');

  section('watchLampsFor(): a lamp with no dock match keeps its data position');
  {
    const z = { arena: { watchLamps: [{ id: 'far', x: 0, z: 0, radius: 6, dock: 9 }], lamps: [{ id: 'cand', x: 3, z: 4, watch: true }, { id: 'plain', x: 1, z: 1 }] } };
    const L = { docks: [{ buoy: { x: 30, z: 30 } }] };
    const l = watchLampsFor(z, L, { radius: 6 });
    ok(l.length === 2 && l[0].dock === null && l[0].x === 0 && l[0].z === 0, 'unmatched buoy lamp: dock null, data position');
    ok(l[1].id === 'cand' && l[1].kind === 'candle' && l[1].lit === false && l[1].radius === 6, '§24 candle flagged watch: kind candle, unlit by default, r 6');
    ok(giantSpotsFor({}).length === 0 && giantSpotsFor({ arena: { giantSpots: [{ id: 'g', x: 1, z: 2, r: 5 }] } })[0].kind === 'disc', 'giantSpotsFor: empty without data; kind inferred');
  }

  section('buildWorldV3(): pools, anchors and the legend glimmer follow update()');
  {
    const halos = createHalos(16);
    const dockBuoys = [{ halo: halos.add(1, 1, 1, [0, 0, 0], 2) }, { halo: halos.add(5, 1, 5, [0, 0, 0], 2) }];
    const arena = { anchors: [{ x: 0, y: 0, z: 0, intensity: 3 }], halos, dockBuoys };
    const lamps = [{ id: 'a', x: 1, z: 1, radius: 6, dock: 0, kind: 'buoy' }, { id: 'b', x: 5, z: 5, radius: 6, dock: 1, kind: 'buoy' }];
    const v = buildWorldV3({}, {}, arena, { lamps, legend: { x: -4, z: -14, r: 3.2 }, pal: { candle: 0xed9e3b, light: 0xd4d0f2 }, quality: 'high' });
    const st = v.stats();
    ok(st.lamps === 2 && st.legend && st.motes === 26 && st.calls === 3, `2 lamps, the legend glimmer (26 motes), 3 draw calls (got ${JSON.stringify(st)})`);
    ok(arena.anchors.length === 3 && arena.anchors.slice(1).every((a) => a.watchLamp && a.intensity === 0), 'each lamp joins the accent anchors (dark until updated)');
    const pools = v.group.children.find((o) => o.name === 'watchLampPools');
    ok(pools && pools.geometry.instanceCount === 2 && pools.material.blending === THREE.AdditiveBlending && pools.material.depthWrite === false, 'one instanced additive pool decal for both lamps');
    ok(pools.geometry.attributes.aC.array[3] === 6 && pools.geometry.attributes.aC.array[1] > 0 && pools.geometry.attributes.aC.array[1] < 0.1, 'pool radius 6, laid just above the water');
    const motes = v.group.children.find((o) => o.name === 'legendGlimmer');
    ok(motes?.isPoints && Math.abs(motes.material.uniforms.uCenter.value.x + 4) < 1e-9 && Math.abs(motes.material.uniforms.uCenter.value.z + 14) < 1e-9, 'the glimmer sits on the legend pool');
    // the glimmer never climbs into a column: the shader's height is 0.1 + life × lift with lift ≤ 1.2
    const orb = motes.geometry.attributes.aOrb.array;
    let maxLift = 0; for (let i = 0; i < orb.length; i += 4) maxLift = Math.max(maxLift, orb[i + 1]);
    ok(maxLift <= 1.2 && 0.1 + maxLift <= 1.3, `a low glimmer: motes rise at most ${(0.1 + maxLift).toFixed(2)} m (≤ 1.3)`);
    ok(!/column/i.test(v.group.children.map((o) => o.name).join()), 'no column mesh in the v3 visuals');
    for (let i = 0; i < 120; i++) v.update(1 / 30, i / 30, { night: 1, fogDensity: 0.02, lamps: [{ k: 1, watch: 0 }, { k: 0.4, watch: 1 }], legendK: 1 });
    ok(v.lamps[0].k > 0.95 && v.lamps[1].k > 0.35 && v.lamps[1].k < 0.45, 'lamp strengths ease to their targets');
    ok(arena.anchors[1].intensity > arena.anchors[2].intensity && arena.anchors[1].intensity > 2, 'the brighter lamp casts the stronger accent');
    ok(v.legend.k > 0.9 && motes.visible && motes.material.uniforms.uK.value > 0.9, 'a listening legend pool: the glimmer at full');
    const hc = halos.geo.attributes.aColor.array;
    ok(hc[0] > hc[2] && hc[0] > 0.1, 'the watch buoy halo burns candle amber (red > blue)');
    for (let i = 0; i < 240; i++) v.update(1 / 30, 4 + i / 30, { night: 0, lamps: [{ k: 0 }, { k: 0 }], legendK: 0 });
    ok(v.lamps.every((s) => s.k < 0.01) && !motes.visible && arena.anchors[1].intensity === 0, 'k 0 puts the pools, anchors and glimmer out');
    v.dispose();
    ok(arena.anchors.length === 1, 'dispose() removes its anchors');
    const vLow = buildWorldV3({}, {}, { anchors: [], halos: createHalos(4), dockBuoys: [] }, { lamps: [], legend: { x: 0, z: 0, r: 3 }, quality: 'low' });
    ok(vLow.stats().motes === 12 && vLow.stats().calls === 2, 'quality low: 12 motes, no pools without lamps');
    vLow.dispose();
  }
}

if (MODE === 'p2') {
  section('phase 2: the Mossmere places replace its stopgap; the lamps stay');
  const { world } = makeWorld();
  for (const z of data.ZONES) {
    world.setZone(z.id, { instant: true });
    const places = (z.arena.places || []).length;
    ok(world.getGiantSpots().length === (places ? 0 : 3), `${z.id}: ${places ? 'places in the build → no stopgap' : '3 stopgap waters'} (got ${world.getGiantSpots().length})`);
    ok(world.getWatchLamps().length === 2, `${z.id}: still 2 watch-lamps`);
  }
}

if (MODE === 'walk') {
  section('walking build: §24 sister-candles flagged watch, lit only while lit');
  let litIds = new Set();
  const { world } = makeWorld({ progression: { isLampLit: (id) => litIds.has(id) } });
  for (const z of data.ZONES) {
    world.setZone(z.id, { instant: true });
    const lamps = world.getWatchLamps();
    const want = data.WALK_SYNC_V3.watchLamps[z.id];
    ok(lamps.length === 2 && lamps.every((l) => want.includes(l.id)), `${z.id}: the two watch-lamps are ${want.join(', ')} (got ${lamps.map((l) => l.id).join(', ')})`);
    if (z.id === 'mossmere') { ok(lamps.every((l) => l.kind === 'buoy' && l.lit), 'mossmere: buoy-lamps, always lit'); continue; }
    ok(lamps.every((l) => l.kind === 'candle' && l.radius === 6 && l.lit === false), `${z.id}: sister-candles, r 6, unlit at first`);
    litIds = new Set([lamps[0].id]);
    const again = world.getWatchLamps();
    ok(again[0].lit === true && again[1].lit === false, `${z.id}: lighting ${lamps[0].id} lights its pool only`);
    litIds = new Set();
  }
}

if (MODE === 'v1') {
  section('flag off: no watch-lamps, no giant spots, no v3 visuals, no v3 debug hooks');
  const { ctx, world } = makeWorld();
  for (const z of data.ZONES) {
    world.setZone(z.id, { instant: true });
    ok(Array.isArray(world.getWatchLamps()) && world.getWatchLamps().length === 0, `${z.id}: getWatchLamps() is empty`);
    ok(Array.isArray(world.getGiantSpots()) && world.getGiantSpots().length === 0, `${z.id}: getGiantSpots() is empty`);
  }
  ok(!('giantSpots' in ctx.debug) && !('watchLamps' in ctx.debug) && !('worldV3' in ctx.debug), 'no v3 debug hooks in a flag-off build');
  ok(!data.BALANCE.signs && !data.BALANCE.nightModes, 'no v3 BALANCE blocks');
  const p = M.presentation(null, data.BALANCE, { phase: 'calm' });
  ok(p.aura === 0 && p.embers === true && p.flare === true, 'presentation(v1): no aura, Embers and Flare always');
  ok(M.modeOf({ nightMode: 'still', outing: 'normal' }, data.BALANCE) === null, 'modeOf → null (v1 rules) without nightModes');
}

// ------------------------------------------------------------------ C2: the §25.5.7 table (pure, every v3 build)
if (MODE === 'p1') {
  section('C2: combat-modes presentation() — the §25.5.7 table');
  const B = data.BALANCE;
  const P = (mode, o) => M.presentation(mode, B, o);
  for (const phase of ['calm', 'dusk', 'gloomtide', 'dawn']) {
    for (const sw of [false, true]) {
      const p = P('still', { phase, phaseK: 0.5, swarmNight: sw, swarmActive: false, hitT: 0 });
      ok(p.aura === 0 && !p.embers && !p.flare, `still ${phase}${sw ? ' (swarm flag)' : ''}: no aura, no Embers, no Flare, even after a hit`);
    }
  }
  // Lantern: hidden in calm and dawn; fades in through dusk on swarm nights only
  ok(P('lantern', { phase: 'calm', phaseK: 0.9, swarmNight: true }).aura === 0, 'lantern calm (swarm night): no aura');
  ok(P('lantern', { phase: 'dawn', phaseK: 0.2, swarmNight: true }).aura === 0, 'lantern dawn: no aura');
  const d0 = P('lantern', { phase: 'dusk', phaseK: 0.1, swarmNight: true }).aura, d1 = P('lantern', { phase: 'dusk', phaseK: 0.5, swarmNight: true }).aura, d2 = P('lantern', { phase: 'dusk', phaseK: 0.95, swarmNight: true }).aura;
  ok(d0 > 0 && d0 < d1 && d1 < d2 && d2 <= 1 && Math.abs(d1 - 0.5) < 1e-9, `lantern dusk (swarm night): the aura fades in through dusk (${d0.toFixed(2)} → ${d1.toFixed(2)} → ${d2.toFixed(2)})`);
  ok(P('lantern', { phase: 'dusk', phaseK: 0.9, swarmNight: false }).aura === 0, 'lantern dusk (quiet night): no aura');
  ok(P('lantern', { phase: 'gloomtide', phaseK: 0.3, swarmNight: true }).aura === 1, 'lantern swarm night: aura on');
  ok(P('lantern', { phase: 'gloomtide', phaseK: 0.8, swarmNight: false }).aura === 0, 'lantern night after the window (quiet tail): aura off');
  ok(P('lantern', { phase: 'calm', swarmNight: false }).flare === false && P('lantern', { phase: 'dusk', swarmNight: true }).flare === true, 'lantern Flare: hidden by day, shown from dusk on swarm nights');
  ok(P('lantern', { phase: 'gloomtide', swarmNight: false }).flare === false, 'lantern Flare: hidden on a quiet night');
  ok(P('lantern', { phase: 'calm', hitT: 2 }).embers === true && P('lantern', { phase: 'calm', hitT: 5 }).embers === false, 'lantern Embers: shown for 4 s after a hit');
  ok(P('lantern', { phase: 'gloomtide', scorched: true }).embers === true, 'lantern Embers: shown while Scorched');
  ok(P('lantern', { phase: 'dusk', swarmNight: true }).embers === true && P('lantern', { phase: 'calm', swarmNight: true }).embers === false, 'lantern Embers: from dusk on swarm nights');
  // Gloomtide: hidden in calm and dawn except during calm raids; on from dusk; Embers and Flare always
  ok(P('gloomtide', { phase: 'calm' }).aura === 0 && P('gloomtide', { phase: 'calm', swarmActive: true }).aura === 1, 'gloomtide calm: aura only in a calm raid');
  ok(P('gloomtide', { phase: 'dawn' }).aura === 0, 'gloomtide dawn: no aura');
  ok(P('gloomtide', { phase: 'dusk', phaseK: 0.05 }).aura > 0 && P('gloomtide', { phase: 'dusk', phaseK: 0.4 }).aura === 1, 'gloomtide: on from dusk (fades in over its first third)');
  ok(P('gloomtide', { phase: 'gloomtide' }).aura === 1, 'gloomtide night: aura on');
  for (const phase of ['calm', 'dusk', 'gloomtide', 'dawn']) { const p = P('gloomtide', { phase }); ok(p.embers && p.flare, `gloomtide ${phase}: Embers and Flare always`); }
  // the hud keys come from data (the table is BALANCE.nightModes[mode].hud)
  ok(B.nightModes.still.hud.ring === 'never' && B.nightModes.lantern.hud.ring === 'swarmDusk' && B.nightModes.gloomtide.hud.ring === 'calmRaidOrDusk', 'the ring rules are read from BALANCE.nightModes[mode].hud');
}

// ------------------------------------------------------------------ the other builds, in child processes
if (MODE === 'p1') {
  for (const m of ['v1', 'p2', 'walk']) {
    const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url)], { env: { ...process.env, GW_WT_MODE: m }, encoding: 'utf8' });
    const out = (r.stdout || '') + (r.stderr || '');
    const tail = out.trim().split('\n').pop() || '';
    const mm = /(\d+) passed, (\d+) failed/.exec(tail);
    if (mm) { pass += Number(mm[1]); fail += Number(mm[2]); }
    else { fail++; console.log(`  FAIL: child ${m} did not report`, out.slice(-800)); }
    if (r.status !== 0) { if (!mm || Number(mm[2]) === 0) fail++; console.log(out.split('\n').filter((l) => /FAIL/.test(l)).join('\n')); }
  }
}

console.log(`\nworld-v3${MODE === 'p1' ? '' : ` [${MODE}]`}: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
