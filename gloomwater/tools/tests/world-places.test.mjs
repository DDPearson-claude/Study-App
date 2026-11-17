// T145 and T146 (docs/loop/m1-step3a/PLAN.md): the loop's places in the world (world-places.js), with the real world module, world-art
// and the loop's data in node (three.js, no renderer; canvases are a sink).
//   node tools/tests/world-places.test.mjs        (or node tools/check.mjs)
// T145: one bank per place not yet lifted, inside its water's footprint plus 1.5 m, none over a dock, the spawn or the glide-out path;
// liftMist(id, s) takes its opacity to 0 over s; the raft inside a bank's footprint eases that whole bank's opacity to LOOP.mist.inside
// (one per-bank uniform; the alpha a function of the footprint's own feather only: no camera or raft distance term in the shader, a
// source check and a probe); the dressing built once, its emissive terms off until lifted; the banks one merged mesh; the giant's back
// only in a standing bank and only at the gloomtide.
// T146: the Mossmere's built geometry hashes the same with the loop off and with the loop on (the places' meshes aside); LOOP.redress
// off builds no W9 mesh and keeps the lamp-posts; on, the bollards replace them and the toll-tower and the Sluice Veil appear.
import * as THREE from 'three';
import { createHash } from 'node:crypto';

const sink = () => new Proxy(function () {}, { get: (t, k) => (k === 'data' ? new Uint8ClampedArray(4) : k === 'width' || k === 'height' ? 1 : k === Symbol.toPrimitive ? () => 0 : sink()), apply: () => sink(), set: () => true });
globalThis.Path2D = globalThis.Path2D || class { constructor() {} };
globalThis.document = globalThis.document || { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => sink(), toDataURL: () => '' }) };

// three data builds in one process (data.js reads its flags at import; each import has its own query)
globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
const D_P1 = await import('../../src/data.js?wpP1');
globalThis.GW_LOOP = true;
// (the re-dress is on by default in the loop since the user's yes, 17 Nov 2026: D_LOOP is the ?redress=0 harbour, D_RED the default)
globalThis.GW_REDRESS = false;
const D_LOOP = await import('../../src/data.js?wpLoop');
delete globalThis.GW_REDRESS;
const D_RED = await import('../../src/data.js?wpRedress');

const { createBus } = await import('../../src/core.js');
const { create } = await import('../../src/world.js');
const { buildLayout } = await import('../../src/world-layout.js');
const { buildArena } = await import('../../src/world-art.js');
const WP = await import('../../src/world-places.js');
const { footprintSdf, bankCover, insideFootprint, easeOpacity, bankTarget, BANK, BANK_VS, BANK_FS, buildPlaces } = WP;

let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('  FAIL:', msg); } };
const section = (s) => console.log(`- ${s}`);
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;

function makeWorld(data, extra = {}) {
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(46, 16 / 9, 0.1, 500);
  const bus = createBus(), events = [];
  bus.on('world:giantBack', (p) => events.push(p));
  const ctx = { data, bus, state: { meta: { settings: {} }, run: null }, flow: 'title', isMobile: false, errors: [], debug: {}, render: { scene, camera, isStub: false }, ...extra };
  const world = create(ctx);
  world.init();
  return { ctx, world, events, scene };
}

// ------------------------------------------------------------------ T145: the footprints (pure)
section('T145: the footprint, its feather and the bank\'s coverage (pure)');
const places = D_LOOP.loopPlaceIds('mossmere').map((id) => D_LOOP.loopPlace(id));
ok(places.length === 4 && places.every((p) => p.area), 'the Mossmere\'s four places with their footprints');
for (const p of places) {
  const a = p.area, c = WP.footprintCentre(a), b = WP.footprintBox(a, BANK.feather + 2);
  ok(footprintSdf(a, c.x, c.z) < 0 && insideFootprint(a, c.x, c.z), `${p.id}: its middle is inside its footprint`);
  let worst = -Infinity, leak = 0;
  for (let x = b.x0; x <= b.x1; x += 0.25) for (let z = b.z0; z <= b.z1; z += 0.25) {
    const d = footprintSdf(a, x, z), cv = bankCover(a, x, z, 1);
    if (cv > 0) worst = Math.max(worst, d);
    if (d >= BANK.feather && cv > 0) leak++;
  }
  ok(leak === 0 && worst <= BANK.feather + 1e-9, `${p.id}: the bank lies inside its footprint plus ${BANK.feather} m (farthest covered point ${worst.toFixed(2)} m out)`);
}
// none over a dock, the spawn or the glide-out path
const moss = D_LOOP.ZONES.find((z) => z.id === 'mossmere'), L = buildLayout(moss);
const keepOf = Object.fromEntries(places.map((p) => [p.id, WP.bankKeep(p.area, L.docks)]));
const anyCover = (x, z) => places.reduce((m, p) => Math.max(m, bankCover(p.area, x, z, 1, { keep: keepOf[p.id] })), 0);
ok(!!keepOf.buoy_lights && !keepOf.under_the_span && !keepOf.bell_pool, "the Buoy Lights' bank meets the west dock's buoy-lamp and keeps out of it (the Lily Maze's keeps off the same dock's post)");
for (const d of L.docks) {
  const pts = [{ x: d.x, z: d.z }, ...(d.posts || []), ...(d.buoy ? [d.buoy] : [])];
  ok(pts.every((q) => anyCover(q.x, q.z) === 0), `no bank over the dock at (${d.x.toFixed(1)}, ${d.z.toFixed(1)}), its posts or its buoy`);
}
ok(anyCover(L.spawn.x, L.spawn.z) === 0, 'no bank over the spawn');
const out = D_LOOP.LOOP.tutorial.outPath.mossmere;
let pathCover = 0;
for (let i = 0; i + 1 < out.length; i++) for (let t = 0; t <= 1; t += 0.02) pathCover = Math.max(pathCover, anyCover(out[i][0] + (out[i + 1][0] - out[i][0]) * t, out[i][1] + (out[i + 1][1] - out[i][1]) * t));
ok(pathCover === 0, 'no bank over the glide-out path');
// the alpha reads only the footprint and the bank's one opacity: two points of one bank, 1 m and 6 m from the raft, read the same
for (const p of places) {
  const a = p.area, c = WP.footprintCentre(a);
  const deep = [];
  const bb = WP.footprintBox(a, 0);
  for (let x = bb.x0; x <= bb.x1; x += 0.5) for (let z = bb.z0; z <= bb.z1; z += 0.5) if (footprintSdf(a, x, z) <= -BANK.inner - 0.05) deep.push({ x, z });
  const raft = c;
  const p1 = deep.find((q) => near(Math.hypot(q.x - raft.x, q.z - raft.z), 1, 0.36));
  const p6 = deep.find((q) => near(Math.hypot(q.x - raft.x, q.z - raft.z), 6, 0.36)) || deep.find((q) => Math.hypot(q.x - raft.x, q.z - raft.z) > 3.5);
  if (p1 && p6) {
    const op = bankTarget({ inside: insideFootprint(a, raft.x, raft.z), insideK: D_LOOP.LOOP.mist.inside });
    ok(near(bankCover(a, p1.x, p1.z, op), bankCover(a, p6.x, p6.z, op)), `${p.id}: two points 1 m and ${Math.hypot(p6.x - raft.x, p6.z - raft.z).toFixed(1)} m from the raft read the same alpha (no clearing round the raft)`);
    ok(near(op, D_LOOP.LOOP.mist.inside), `${p.id}: the raft inside the footprint thins the whole bank to LOOP.mist.inside`);
  } else ok(false, `${p.id}: a probe pair inside the bank`);
}
section('T145: no camera or raft distance term in the bank\'s shader (a source check)');
for (const [name, src] of [['vertex', BANK_VS], ['fragment', BANK_FS]]) {
  ok(!/cameraPosition|modelViewMatrix|uRaft|uCam|uPlayer|uFocus|distance\s*\(|vDist|mv\.z|gl_FragCoord\.z/.test(src), `the bank's ${name} shader reads no camera, raft or view distance`);
}
ok(/uOp\[/.test(BANK_VS) && !/uOp/.test(BANK_FS.replace(/vOp/g, '')), 'one opacity uniform per bank, read once per vertex');
section('T145: the ease (LOOP.mist.ease) and the lift');
{
  let op = 1, t = 0;
  while (op > D_LOOP.LOOP.mist.inside + 1e-9 && t < 5) { op = easeOpacity(op, D_LOOP.LOOP.mist.inside, 0.05, D_LOOP.LOOP.mist.ease); t += 0.05; }
  ok(t <= D_LOOP.LOOP.mist.ease + 0.05, `the whole bank thins to ${D_LOOP.LOOP.mist.inside} within ${D_LOOP.LOOP.mist.ease} s (took ${t.toFixed(2)} s)`);
  ok(bankTarget({ lifted: true, inside: true }) === 0 && bankTarget({}) === 1, 'a lifted bank is gone; a standing one is whole');
}

// ------------------------------------------------------------------ T145: the built places in a world
section('T145: the banks, the dressing and the lift in a world');
const raftP = new THREE.Vector3(0, 0, 30);
const W = makeWorld(D_LOOP, { player: { isStub: false, position: raftP }, flow: 'playing', state: { meta: { settings: {} }, run: { phase: 'dusk', phaseTime: 10 } } });
const step = (n, dt = 0.05) => { for (let i = 0; i < n; i++) W.world.update(dt, (W.t = (W.t || 0) + dt)); };
step(4);
const grp = W.world.group.getObjectByName('world:places');
ok(!!grp, 'the places are built under the loop');
const named = (n) => { const o = []; grp.traverse((x) => { if (x.name === n) o.push(x); }); return o; };
ok(named('placeBanks').length === 1, 'the banks are one merged mesh');
ok(named('placeDecals').length === 1 && named('placeCaps').length === 1 && named('placePads').length === 1 && named('placeStone').length === 1, 'the dressing: one mesh per material (decals, caps, pads, stone)');
let ro = W.world.places();
ok(ro.banks.length === 4 && ro.banks.every((b) => b.op === 1 && !b.lifted), 'one standing bank per place');
const uOp = named('placeBanks')[0].material.uniforms.uOp.value;
ok(Array.isArray(uOp) && uOp.length === 4 && uOp.every((v) => v === 1), 'one opacity uniform per bank');
const decU = named('placeDecals')[0].material.uniforms.uK.value;
ok(decU.every((k) => k === 0) && named('placeCaps')[0].userData.u.uK.value === 0, 'every emissive term off before the lift');
// the raft into the Buoy Lights: only that bank thins, all of it, then fills again
const bl = D_LOOP.loopPlace('buoy_lights').area;
raftP.set(bl.x, 0, bl.z); step(Math.ceil(D_LOOP.LOOP.mist.ease / 0.05) + 2);
ro = W.world.places();
const bOp = (id) => ro.banks.find((b) => b.id === id)?.op;
ok(near(bOp('buoy_lights'), D_LOOP.LOOP.mist.inside, 1e-3) && ro.banks.find((b) => b.id === 'buoy_lights').inside, 'the raft inside the Buoy Lights\' footprint thins that whole bank to LOOP.mist.inside');
ok(['lily_maze', 'under_the_span', 'bell_pool'].every((id) => bOp(id) === 1), 'the other banks stand whole');
raftP.set(0, 0, 30); step(Math.ceil(D_LOOP.LOOP.mist.ease / 0.05) + 2);
ro = W.world.places();
ok(bOp('buoy_lights') === 1, 'it fills again as the raft leaves');
// liftMist over s
ok(W.world.liftMist('lily_maze', 3) === true, 'liftMist(lily_maze, 3)');
step(30); ro = W.world.places();
const mid = bOp('lily_maze');
ok(mid > 0.05 && mid < 0.95, `halfway through the lift the bank is thinning (op ${mid})`);
step(32); ro = W.world.places();
ok(bOp('lily_maze') === 0 && ro.lifted.includes('lily_maze'), 'after s seconds the bank is gone');
ok(decU[0] > 0.99, 'the Lily Maze\'s glow-buds lit once lifted');
ok(W.world.liftMist('nowhere', 1) === false, 'liftMist of an unknown place does nothing');
// setPlaces
W.world.setPlaces({ owned: ['bell_pool'], lifted: ['bell_pool'] }); step(2); ro = W.world.places();
ok(bOp('bell_pool') === 0 && bOp('lily_maze') === 1, 'setPlaces: the lifted bank gone, the others standing (the Lily Maze back under its bank: not in the list)');
W.world.setPlaces({ owned: [], lifted: [] }); step(2); ro = W.world.places();
ok(ro.banks.every((b) => b.op === 1), 'setPlaces with nothing lifted: every bank stands');
const anc = W.world.placeAnchor('under_the_span');
ok(anc && Number.isFinite(anc.x) && anc.r > 0, 'placeAnchor gives the lift\'s shot a point and a radius');
ok(Array.isArray(anc.face) && Math.abs(Math.hypot(anc.face[0], anc.face[1]) - 1) < 1e-6, '… and a path its broadside (face)');
// each place's own dressing (M1 §2.2; the fix pass: asserted only through the halos before)
{
  const dr = W.world.places().dressing;
  ok(dr.caps === 24, `the Buoy Lights' 24 float caps (${dr.caps})`);
  ok(dr.piers === 4 && dr.chains >= 4, `Under the Span's arches over the Toppled Bridge's 4 piers, the chains hanging from the break (${dr.piers} piers, ${dr.chains} chains)`);
  ok(dr.pads >= 16, `the Lily Maze's own pads (as many again as the built ones inside its disc: ${dr.pads})`);
  // (under the loop the glow-buds under the Lily Maze's pads retire, WC-3, WATERCRAFT §5.7: the koi's own candle fins are the warm light)
  ok(dr.decals === dr.caps + 3, `the decals: no bud under the pads under the loop (WC-3), a glow under each cap, the bell, its glint and the moon's shaft (${dr.decals})`);
}
// the Bell Pool: its bell lies in the pool's north half (the raft's south side is never laid on it); the lift films it from its own crane
{
  const a = D_LOOP.loopPlace('bell_pool').area, B = WP.bellSpot(a);
  ok(B.z < a.z - 1.5 && Math.hypot(B.x - a.x, B.z - a.z) + 2.3 < a.r + 0.5, 'the drowned bell lies in the Bell Pool\'s north half, inside it');
  const ba = W.world.placeAnchor('bell_pool');
  ok(ba && ba.elev >= 35 && ba.elev <= 50 && ba.dist > 8 && Array.isArray(ba.side) && ba.side[1] > 0, 'the Bell Pool\'s anchor: a crane 35–50° up from its open-water side', ba);
  ok(ba && Math.hypot(ba.x - B.x, ba.z - B.z) < 1.2, '… looking at the bell', ba);
}
ok(typeof W.ctx.debug.world?.places === 'function' && W.ctx.debug.world.places()?.banks?.length === 4, 'ctx.debug.world.places() reads the banks');

section('T145: the giant\'s back: only in a standing bank, only at the gloomtide');
W.events.length = 0;
step(Math.ceil(130 / 0.05));
ok(W.events.length === 0, `no back at dusk in 130 s (got ${W.events.length})`);
W.ctx.state.run.phase = 'gloomtide';
step(Math.ceil(130 / 0.05));
ok(W.events.length >= 3, `backs turn at the gloomtide (${W.events.length} in 130 s, every 25–45 s in two banks)`);
ok(W.events.every((e) => ['under_the_span', 'buoy_lights'].includes(e.placeId) && insideFootprint(D_LOOP.loopPlace(e.placeId).area, e.x, e.z)), 'each back turns inside Under the Span\'s or the Buoy Lights\' footprint');
W.world.setPlaces({ owned: ['under_the_span', 'buoy_lights'], lifted: ['under_the_span', 'buoy_lights'] });
W.events.length = 0; step(Math.ceil(130 / 0.05));
ok(W.events.length === 0, 'no back once those banks have lifted');
ok(W.ctx.errors.length === 0, 'no world error', W.ctx.errors);

// ------------------------------------------------------------------ T146: determinism and the switch
section('T146: the built Mossmere is the same with the loop off and on (the places aside)');
function arenaHash(data, opts = {}) {
  const z = data.ZONES.find((q) => q.id === 'mossmere'), Lz = buildLayout(z);
  const ctx = { data, render: { isStub: true }, state: { meta: { settings: {} } } };
  const arena = buildArena(ctx, Lz, { quality: 'high', far: 500, ...opts });
  const h = createHash('sha256'), parts = {};
  for (const m of arena.statics) {
    const g = m.geometry, hh = createHash('sha256');
    for (const k of ['position', 'color']) { const a = g.attributes[k]?.array; if (a) hh.update(Buffer.from(a.buffer, a.byteOffset, a.byteLength)); }
    parts[m.name] = hh.digest('hex').slice(0, 16);
    h.update(m.name + parts[m.name]);
  }
  const fl = []; arena.group.traverse((o) => { if (o.isInstancedMesh) fl.push(`${o.name}:${o.count}`); });
  h.update(fl.join());
  const hs = arena.halos, n = hs.count;
  const pos = hs.geo.attributes.position.array.slice(0, n * 3), col = hs.geo.attributes.aColor.array.slice(0, n * 3);
  h.update(Buffer.from(pos.buffer)); h.update(Buffer.from(col.buffer));
  return { all: h.digest('hex'), parts, arena, layout: Lz, floaters: fl };
}
const off = arenaHash(D_P1), on = arenaHash(D_LOOP, { face: false });
ok(off.all === on.all, `the arena hashes the same off and on the loop (${off.all.slice(0, 12)} / ${on.all.slice(0, 12)})`, JSON.stringify({ off: off.parts, on: on.parts }));
// (WC-3, WATERCRAFT §5.4: under the loop the Mossmere's face adds its reed beds to the 'fine' static and its lily beds' pads to the
// pads' InstancedMesh, and nothing else: every other static and every halo is the built arena's)
const faceH = arenaHash(D_LOOP);
{
  const diff = Object.keys({ ...faceH.parts, ...on.parts }).filter((k) => faceH.parts[k] !== on.parts[k]);
  ok(JSON.stringify(diff) === JSON.stringify(['fine']), 'WC-3: the face changes only the \'fine\' static among the statics', diff);
  ok(faceH.arena.halos.count === on.arena.halos.count && faceH.floaters.length === on.floaters.length, 'WC-3: the face adds no halo and no instanced mesh (the bed pads ride in the pads\' own)', [faceH.floaters, on.floaters]);
  ok(faceH.floaters.filter((f, i) => f !== on.floaters[i]).every((f) => /^lilypads:/.test(f)), 'WC-3: only the pads\' count grows', faceH.floaters);
}
ok(JSON.stringify(off.arena.lampPosts) === JSON.stringify(on.arena.lampPosts) && off.arena.lampPosts.length > 0, `the street lamp-posts as built (${off.arena.lampPosts.length})`);
ok(off.arena.piers.length === 4 && JSON.stringify(off.arena.piers) === JSON.stringify(on.arena.piers), 'the Toppled Bridge\'s four piers as built');
// the places on the loop arena: their own stream, after every builder
const halo0 = on.arena.halos.count;
const vis = buildPlaces({ data: D_LOOP, bus: createBus() }, on.layout, on.arena, { places, quality: 'high', mist: D_LOOP.LOOP.mist, giantBack: D_LOOP.LOOP.giantBack });
const after = arenaHash(D_LOOP);
ok(after.all === faceH.all, 'building the places changes nothing the arena built (a fresh build hashes the same)');
ok(on.arena.halos.count - halo0 === 26, 'the places add only the Buoy Lights\' lamps (24 caps, 2 channel markers) to the shared halos');
let w9 = 0; vis.group.traverse((o) => { if (o.name === 'tollTower' || o.name === 'sluiceVeil') w9++; });
ok(w9 === 0, 'LOOP.redress off: no W9 mesh');
ok(D_LOOP.LOOP.redress === false && on.arena.redress === false, 'LOOP.redress is false with ?redress=0 and the lamp-posts stay');
// the banks' layer sets: five on the high tier on desktop, three on the low and medium tiers and on any phone (liteMist; M1 §6.2)
ok(vis.readout().dressing.layers === 5, 'the high tier on desktop: five bank layers');
{
  const lite = buildPlaces({ data: D_LOOP, bus: createBus() }, on.layout, on.arena, { places, quality: 'high', liteMist: true, mist: D_LOOP.LOOP.mist });
  const lo = buildPlaces({ data: D_LOOP, bus: createBus() }, on.layout, on.arena, { places, quality: 'low', mist: D_LOOP.LOOP.mist });
  ok(lite.readout().dressing.layers === 3 && lo.readout().dressing.layers === 3, 'liteMist (medium tier, any phone) and the low tier: three bank layers');
  ok(lite.banks.geometry.index.count < vis.banks.geometry.index.count, 'the lite banks draw fewer triangles', [lite.banks.geometry.index.count, vis.banks.geometry.index.count]);
  lite.dispose(); lo.dispose();
}

section('T146: LOOP.redress on (the loop\'s default): the bollards replace the posts; the toll-tower and the Sluice Veil appear');
ok(D_RED.LOOP.redress === true, 'LOOP.redress is on by default in the loop (the user\'s yes, 17 Nov 2026)');
const red = arenaHash(D_RED, { redress: true, face: false });
ok(red.parts.rocks === on.parts.rocks && red.parts.landmarks === on.parts.landmarks, 'the rocks and the landmarks unchanged');
ok(red.parts.organics !== on.parts.organics && red.parts.glows !== on.parts.glows, 'the posts\' iron and lanterns give way to the bollards\' (organics and glows changed)');
ok(JSON.stringify(red.arena.lampPosts.map((p) => [p.x, p.z])) === JSON.stringify(on.arena.lampPosts.map((p) => [p.x, p.z])), 'a bollard stands where each lamp-post stood');
ok(red.arena.redress === true && JSON.stringify(red.floaters) === JSON.stringify(on.floaters), 'the floaters as built (0 net calls)');
const visR = buildPlaces({ data: D_RED, bus: createBus() }, red.layout, red.arena, { places, quality: 'high', redress: true, hero: { x: 0, z: -78, face: 0 } });
const names = []; visR.group.traverse((o) => { if (o.isMesh) names.push(o.name); });
ok(names.includes('tollTower') && names.includes('sluiceVeil'), 'the toll-tower and the Sluice Veil appear', names);
ok(visR.readout().dressing.redress === true && !names.some((n) => /spout/i.test(n)), 'the Sluice Veil has no spout (the Cupped Hands are after M1)');
// the world builds them only with the switch
const WR = makeWorld(D_RED);
const wn = []; WR.world.group.traverse((o) => { if (o.isMesh) wn.push(o.name); });
ok(wn.includes('tollTower') && wn.includes('sluiceVeil'), 'world.js builds W9\'s rest when LOOP.redress is on');
const W0 = makeWorld(D_P1);
ok(!W0.world.group.getObjectByName('world:places') && W0.world.places() === null && W0.world.setPlaces({}) === false && W0.world.liftMist('lily_maze', 1) === false, 'off the loop: no places, and their API inert');
ok(W0.ctx.debug.world === undefined, 'off the loop: no ctx.debug.world');

console.log(`world-places: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
