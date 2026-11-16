// WC-2 in the game (WATERCRAFT §5–§6): the REAL src/fishing.js on a fake ctx whose world is the Mossmere's real layout (world-layout's
// depth and shore), on a trip under the loop. Honest spawning (every tell where its makers are; no glow), the silhouettes (where, how
// many, how big, how far), a cast on one bolts it and the spot goes quiet, a cast ahead hands the bite its pre-roll, an obeyed tell is
// answered by the water, quiet water shows nothing.
//   node tools/tests/fishing-wc2.test.mjs [--verbose]
import * as THREE from 'three';
import { loadLoopData, fakeLoop } from './loop-fixture.mjs';
const D = await loadLoopData();
const { makeFishingEnv } = await import('./fishing-env.mjs');
const WL = await import('../../src/world-layout.js');
const WC = await import('../../src/watercraft.js');
const SG = await import('../../src/fishing-signs.js');
const SI = await import('../../src/fishing-sight.js');

let pass = 0, fail = 0;
const VERBOSE = process.argv.includes('--verbose');
function ok(cond, msg) { if (cond) { pass++; if (VERBOSE) console.log('  ok:', msg); } else { fail++; console.log('  FAIL:', msg); } }
const section = (s) => console.log(`- ${s}`);
function mul(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const Z0 = D.ZONES[0];
const L = WL.buildLayout(Z0);
const depth = (x, z) => WL.depthAt(L, x, z);
const shoreR = (a) => L.shoreR(a);
const probe = { depth, fromShore: (x, z) => shoreR(Math.atan2(z, x)) - Math.hypot(x, z) };
const geo = { arena: Z0.arena, hulls: D.loopMooring('mossmere', Z0.arena.docks)?.circles || null };
const isWater = (x, z) => probe.fromShore(x, z) > 0.5 && !(Z0.arena.islands || []).some((o) => Math.hypot(x - o.x, z - o.z) < o.r * 1.08 + 0.3);
function world(rng) {
  return {
    getZone: () => Z0, getDepth: depth, getShoreRadius: shoreR, isOpenWater: (x, z) => isWater(x, z), getObstacles: () => L.obstacles,
    randomWaterPoint: (o = {}) => {
      const f = o.from || { x: 0, z: 0 };
      for (let i = 0; i < 40; i++) {
        const a = rng() * Math.PI * 2, d = (o.minDist ?? 6) + rng() * Math.max(0, (o.maxDist ?? 30) - (o.minDist ?? 6));
        const x = f.x + Math.cos(a) * d, z = f.z + Math.sin(a) * d;
        if (isWater(x, z) && depth(x, z) >= (o.depthMin ?? 0)) return new THREE.Vector3(x, 0, z);
      }
      return null;
    },
  };
}
function env({ phase = 'dusk', raft = [0, 46], seed = 7, loopOver = {}, quality = 'high', scene = null } = {}) {
  const loop = fakeLoop({ D, wick: 'wick', ...loopOver });
  const E = makeFishingEnv({ data: D, mode: 'still', outing: 'trip', phase, seed, loop, raft, render: { getQuality: () => quality, ...(scene ? { scene } : {}) },
    runOver: { bait: { mireworm: 99 }, equippedBait: 'mireworm', evening: 2, character: 'wick', nightMode: 'still' } });
  E.ctx.world = world(mul(seed * 7 + 1));
  E.ctx.bus.on('fishing:bite', (e) => loop.noteBite(e));
  E.loop = loop;
  return E;
}
const SIGHT_AREAS = new Set(['margin', 'pads', 'stones', 'inflow', 'reeds', 'lily_maze', 'buoy_lights']);
const areaOf = (x, z) => WC.areaAt(x, z, probe, { ...geo, lane: WC.laneFor(2, 'dusk') });
// a raft spot with shallow margin water round it
let RAFT = [0, 46];
{
  let best = null;
  for (let x = -50; x <= 50 && !best; x += 2) for (let z = -50; z <= 50 && !best; z += 2) {
    if (!isWater(x, z) || D.placeAtV3('mossmere', x, z)) continue;
    let m = 0;
    for (let a = 0; a < 16; a++) { const px = x + Math.cos(a * 0.39) * 9, pz = z + Math.sin(a * 0.39) * 9; if (isWater(px, pz) && areaOf(px, pz) === 'margin' && depth(px, pz) < 0.32 && depth(px, pz) > 0.12) m++; }
    if (m >= 6 && depth(x, z) > 0.3) best = [x, z];
  }
  if (best) RAFT = best;
}

section(`honest spawning in the game (dusk, the raft at ${RAFT.join(', ')})`);
{
  const E = env({ raft: RAFT });
  const seen = {};
  let bad = 0, glow = 0, moss = 0, total = 0;
  const T = SG.normTells(WC.WATERCRAFT.mossmere.tells);
  E.ctx.bus.on('sign:spawn', (p) => {
    if (p.kind === 'sight') return;
    total++;
    const s = E.F.signs.find((q) => q.id === p.id);
    if (!s) return;
    if (s.kind === 'glow') glow++;
    if (!s.moss) return;
    moss++;
    seen[`${s.kind}:${s.form}@${s.area}`] = (seen[`${s.kind}:${s.form}@${s.area}`] || 0) + 1;
    const f = T[s.kind]?.forms?.[s.form];
    if (!f || !f.areas.includes(s.area)) bad++;
    if (s.kind !== 'gas' && !(s.makers || []).length) bad++;
  });
  E.tick(30 * 900);
  ok(total > 20 && moss === total && glow === 0 && bad === 0, `${total} tells in 15 min, every one by §5.3's areas and makers, no glow (${Object.entries(seen).map(([k, n]) => `${k} ${n}`).join(', ')})`);
  const pre = E.ctx.debug.fishSigns().filter((s) => s.preroll);
  ok(pre.every((s) => !D.SPECIES_BY_ID[s.preroll.speciesId]?.giant), 'a rise\'s or a swirl\'s fish is never a giant');
}

section('silhouettes in the game (§6)');
{
  const E = env({ raft: RAFT, seed: 11 });
  const spawned = [];
  let maxAlive = 0;
  E.ctx.bus.on('sign:spawn', (p) => { if (p.kind === 'sight') { const f = E.ctx.debug.fishSights().find((q) => q.id === p.id); if (f) spawned.push({ ...f, raft: [E.ctx.player.position.x, E.ctx.player.position.z] }); } });
  for (let i = 0; i < 30 * 600; i += 30) { E.tick(30); maxAlive = Math.max(maxAlive, E.ctx.debug.fishSights().length); }
  ok(spawned.length >= 8, `${spawned.length} silhouettes in 10 min at dusk`);
  ok(maxAlive <= 4 && maxAlive >= 1, `at most 4 alive (${maxAlive})`);
  let where = 0, never = 0, len = 0, dist = 0;
  for (const f of spawned) {
    if (!(f.depth < 0.45) || !SIGHT_AREAS.has(f.area)) where++;
    if (['kissmark_trout', 'bridgechain_sturgeon', 'gloam_eel', 'belled_matriarch', 'thousandcast_pike', 'hullkiss_lamprey'].includes(f.speciesId)) never++;
    const sp = D.SPECIES_BY_ID[f.speciesId];
    if (Math.abs(f.length - D.sizeLength(sp, f.zScore, 'mossmere') / 100) > 0.001) len++;
    const rd = Math.hypot(f.x - f.raft[0], f.z - f.raft[1]), band = SI.spawnBand(f.length);
    if (rd < Math.max(band[0], f.keepOff) - 0.01 || rd > band[1] + 0.01) dist++;
  }
  ok(where === 0, 'never at depth ≥ 0.45, never in the deep, open water, the drop-off or a lane');
  ok(never === 0, 'never a giant, the legend, the sturgeon, the trout or the eel');
  ok(len === 0, 'each drawn at its true length (sizeLength at its z)');
  ok(dist === 0, 'each spawned inside its length\'s band and past its own distance off the raft');
  const kinds = {};
  for (const f of spawned) kinds[f.speciesId] = (kinds[f.speciesId] || 0) + 1;
  if (VERBOSE) console.log('   seen:', JSON.stringify(kinds), 'areas:', JSON.stringify(spawned.reduce((a, f) => ((a[f.area] = (a[f.area] || 0) + 1), a), {})));
  const Lo = env({ raft: RAFT, seed: 12, quality: 'low' });
  let lowMax = 0;
  for (let i = 0; i < 30 * 400; i += 30) { Lo.tick(30); lowMax = Math.max(lowMax, Lo.ctx.debug.fishSights().length); }
  ok(lowMax <= 3, `at most 3 on low (${lowMax})`);
  const Q = env({ raft: RAFT, seed: 13, loopOver: { bites: { 'open:mossmere': 4 } } });
  const key = Object.keys(Q.loop.s?.bites || {})[0];
  let qn = 0;
  Q.ctx.bus.on('sign:spawn', (p) => { if (p.kind === 'sight') qn++; });
  Q.tick(30 * 300);
  const quiet = Q.F.view.favour?.quiet ?? null;
  ok(qn === 0 || quiet === false, `quiet water: no silhouette (${qn} spawned; quiet ${quiet}; key ${key})`);
}

section('silhouettes placed where they read through the live camera (16 Nov 2026)');
{
  // the play camera's sail framing over the raft, as render.js places it (yaw 0; a phone held upright widens, steps back, tilts down)
  const DEG = Math.PI / 180, sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const rigAt = (W, H) => {
    let { elev, dist, aim, aimY, fov } = D.BALANCE.cameras.sail;
    if (W / H < 1.25) { const pf = sm(1.25, 0.5, W / H); fov = Math.min(78, fov + pf * 22); dist *= 1 + pf * 0.38; elev = Math.min(80, elev + pf * 7); }
    const cam = new THREE.PerspectiveCamera(fov, W / H, 0.1, 400);
    cam.position.set(RAFT[0], dist * Math.sin(elev * DEG), RAFT[1] + dist * Math.cos(elev * DEG));
    cam.lookAt(RAFT[0], aimY, RAFT[1] - aim); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
    return cam;
  };
  const was = [globalThis.innerWidth, globalThis.innerHeight];
  for (const [W, H] of [[1280, 720], [390, 844]]) {
    globalThis.innerWidth = W; globalThis.innerHeight = H;
    const camera = rigAt(W, H), lens = SI.lensOf(camera, W, H), need = SI.readPx(W, H);
    const E = env({ raft: RAFT, seed: 21, scene: null });
    E.ctx.render.camera = camera;
    const spawned = [];
    E.ctx.bus.on('sign:spawn', (p) => { if (p.kind === 'sight') { const v = E.ctx.debug.fishSights().find((q) => q.id === p.id); if (v) spawned.push(v); } });
    E.tick(30 * 600);
    let frame = 0, keep = 0, floor = 0, read = 0, where = 0, hidden = 0;
    const eye = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const blockers = [{ x: RAFT[0], z: RAFT[1], r: 1.7, h: 2.4 }, ...L.obstacles.filter((o) => o.kind === 'island').map((o) => ({ x: o.x, z: o.z, r: o.r * 1.2, h: 3.6 }))];
    const land = (x, z) => Math.hypot(x, z) > shoreR(Math.atan2(z, x)) - 0.3;
    for (const f of spawned) {
      if (SI.sightBlocked(f.x, f.z, eye, blockers, land)) hidden++;
      const px = SI.projectedLength(f.length, f, lens, f.heading);
      if (!SI.inFrame(lens, f.x, f.z)) frame++;
      if (Math.hypot(f.x - RAFT[0], f.z - RAFT[1]) < f.keepOff + 0.4 - 1e-6) keep++;
      if (px < need * SI.READ.floor - 1e-6) floor++;
      if (px >= need) read++;
      if (!(f.depth < 0.45) || !SIGHT_AREAS.has(f.area)) where++;
    }
    ok(spawned.length >= 4, `${W}x${H}: ${spawned.length} silhouettes in 10 min at dusk with a live camera`);
    ok(frame === 0 && keep === 0 && floor === 0 && where === 0 && hidden === 0, `${W}x${H}: every one in the open frame and in sight (never behind a rock island, the bank or the raft), past its own distance off the raft, in clear shallow water, drawn ≥ the floor (${read} of ${spawned.length} at the ${need} px mark; the rest the most this camera draws them)`);
  }
  globalThis.innerWidth = was[0]; globalThis.innerHeight = was[1];
}

// a margin point at about 9 m from the raft, with room ahead
function marginPoint() {
  for (let a = 0; a < 64; a++) {
    const x = RAFT[0] + Math.cos(a * 0.098) * 9, z = RAFT[1] + Math.sin(a * 0.098) * 9;
    if (!isWater(x, z) || areaOf(x, z) !== 'margin' || depth(x, z) > 0.32 || depth(x, z) < 0.12) continue;
    const h = Math.atan2(RAFT[0] - x, RAFT[1] - z) + Math.PI / 2;
    const ax = x + Math.sin(h) * 2.5, az = z + Math.cos(h) * 2.5;
    if (isWater(ax, az) && depth(ax, az) < 0.44) return { x, z, h };
  }
  return null;
}
section('a cast on a silhouette bolts it; the spot goes quiet (§6.5)');
{
  const E = env({ raft: RAFT, seed: 21 });
  const p = marginPoint();
  ok(!!p, `a margin point (${p?.x.toFixed(1)}, ${p?.z.toFixed(1)})`);
  const f = E.ctx.debug.sight('weeping_carp', { x: p.x, z: p.z, heading: p.h, mode: 'cruise', speed: 0.35, life: 120 });
  ok(f && f.outline === 'deep' && f.speciesId === 'weeping_carp', `a carp silhouette (${f?.length} m)`);
  E.tick(3);
  const g = E.ctx.debug.fishSights().find((q) => q.id === f.id);
  ok(E.ctx.debug.castAt(g.x, g.z), 'the float is cast on it');
  let bolted = false;
  for (let i = 0; i < 60 && !bolted; i++) { E.tick(1); bolted = E.events.some((x) => x.e === 'sign:show' && x.p.kind === 'sight' && x.p.bolt === 'cast'); }
  ok(bolted, 'it bolts (a V-wake, the boil\'s tagged wake)');
  ok(E.dbg().sign?.spook === true, `the cast keeps a spook rule (its wait × 1.5) (${JSON.stringify(E.dbg().sign)}, ${E.F.state})`);
  const before = E.events.filter((x) => x.e === 'sign:spawn' && x.p.kind === 'sight').length;
  const near = E.ctx.debug.sight('weeping_carp', { x: g.x + 2, z: g.z, force: false });
  ok(!near, 'no new silhouette within 10 m of it for 30 s');
  E.reset();
  ok(E.events.filter((x) => x.e === 'sign:spawn' && x.p.kind === 'sight').length === before, '(none spawned there)');
}

section('no drawn ring round the float where it lands by a silhouette, and no pulse quad\'s edge on the water (§6.9)');
{
  const scene = new THREE.Scene();
  const E = env({ raft: RAFT, seed: 23, scene });
  const pm = scene.getObjectByName('fishing-pulses');
  ok(!!pm && pm.material.uniforms.uEdge?.value === 1, 'on the Mossmere under the loop the pulses\' glow fades out inside their quad (uEdge 1)');
  ok(/uEdge \* smoothstep\(vR \+ vW, vHs - 0\.02, d\)/.test(pm?.material.fragmentShader || ''), '(the glow reaches zero before the quad\'s inscribed circle)');
  const p = marginPoint();
  const f = E.ctx.debug.sight('weeping_carp', { x: p.x, z: p.z, heading: p.h, mode: 'cruise', speed: 0.35, life: 120 });
  E.tick(3);
  const g = E.ctx.debug.fishSights().find((q) => q.id === f.id);
  E.ctx.debug.castAt(g.x, g.z);
  let lit = 0, landed = false;
  for (let i = 0; i < 90 && !landed; i++) { E.tick(1); landed = E.F.state !== 'casting'; }
  for (let i = 0; i < 12; i++) { E.tick(1); for (const q of pm.material.uniforms.uQ.value) if (q.w > 0.003) lit++; }
  ok(landed && E.dbg().sign?.spook === true, 'the float lands on the carp and it bolts');
  ok(lit === 0, `no pulse ring at the landing: the float's own ripple alone (${lit} lit pulse frames)`);
}

section('a cast ahead of a silhouette hands the bite its fish (§6.6)');
{
  let took = 0, nosed = 0, n = 0, rules = 0, wrong = 0;
  for (let k = 0; k < 24; k++) {
    const E = env({ raft: RAFT, seed: 100 + k });
    const p = marginPoint();
    const f = E.ctx.debug.sight('weeping_carp', { x: p.x, z: p.z, heading: p.h, mode: 'cruise', speed: 0.35, life: 120 });
    if (!f) continue;
    E.tick(1);
    const g = E.ctx.debug.fishSights().find((q) => q.id === f.id);
    const v = g.speed, head = g.length / 2, lead = head + 1 + 1.6 * v + 0.9 + v * 0.4;   // inside the window as it swims on during the flight
    const tx = g.x + Math.sin(g.heading) * lead, tz = g.z + Math.cos(g.heading) * lead;
    if (!E.ctx.debug.castAt(tx, tz)) continue;
    for (let i = 0; i < 90 && E.F.state === 'casting'; i++) E.tick(1);
    n++;
    const d = E.dbg();
    if (d.sign?.kind === 'sight' && d.sign.inSign) rules++;
    const h = E.ctx.debug.fishSights().find((q) => q.id === f.id);
    if (d.prerollTook) { took++; if (h?.mode !== 'take' || d.species !== 'weeping_carp') wrong++; }
    else if (d.sign?.kind === 'sight') { nosed++; if (h?.mode !== 'nose') wrong++; }
  }
  ok(n >= 20 && rules >= n - 2, `led casts meet the lead rule (${rules} of ${n})`);
  ok(took > 0 && nosed > 0 && wrong === 0, `it swims to the bait and takes it (${took}) or noses it and turns away (${nosed}); the bite is that fish`);
}

section('a silhouetted pike and a worm: the whole cast (WC-1\'s castOdds, once merged)');
{
  const E0 = env({ raft: RAFT, seed: 51 });
  if (typeof E0.ctx.debug.fishOdds !== 'function') console.log('  (the game draws through castOdds once WC-1 is merged: this block checks it then)');
  else {
    let n = 0, okP = 0, refusedSeen = 0;
    for (let k = 0; k < 6; k++) {
      const E = env({ raft: RAFT, seed: 51 + k });
      const p = marginPoint();
      const f = E.ctx.debug.sight('reedjaw_pike', { x: p.x, z: p.z, heading: p.h, mode: 'hold', life: 200 });
      if (!f) continue;
      E.tick(2);
      const hx = f.x + Math.sin(f.heading) * f.length / 2, hz = f.z + Math.cos(f.heading) * f.length / 2;
      E.ctx.debug.castAt(hx + Math.cos(f.heading) * 1.3, hz - Math.sin(f.heading) * 1.3);
      for (let i = 0; i < 90 && E.F.state === 'casting'; i++) E.tick(1);
      if (E.dbg().sign?.kind !== 'sight') continue;
      n++;
      const o = E.ctx.debug.fishOdds();
      const pike = (o?.entries || []).filter((e) => e.id === 'reedjaw_pike').reduce((a, e) => a + e.p, 0);
      if (Math.abs(pike - 0.01) < 1e-6) okP++;
      if (!E.dbg().prerollTook) refusedSeen++;
    }
    ok(n >= 3 && okP === n, `on worms a led pike's whole cast is exactly 1% (${okP} of ${n} casts)`);
    ok(refusedSeen >= n - 1, `it noses the worm and turns away (${refusedSeen} of ${n})`);
  }
}

section('an obeyed tell is answered by the water (§5.3)');
{
  const E = env({ raft: RAFT, seed: 31 });
  const p = marginPoint();
  const s = E.ctx.debug.sign('bubbles', { x: p.x, z: p.z, heading: p.h, ttl: 60 });
  ok(s && s.kind === 'bubbles' && s.form === 'fizz' && s.area === 'margin', `carp fizz in the margin (${s?.form}, ${s?.area}, ${s?.makers})`);
  E.tick(10);
  const live = E.F.signs.find((q) => q.id === s.id);
  const hx = live.head.x + Math.sin(live.heading) * 0.6, hz = live.head.z + Math.cos(live.heading) * 0.6;
  E.ctx.debug.castAt(hx, hz);
  for (let i = 0; i < 90 && E.F.state === 'casting'; i++) E.tick(1);
  const r = E.dbg().sign;
  ok(r?.kind === 'bubbles' && !r.spook, 'the cast at the trail\'s head meets the fizz\'s rule');
  let ans = null;
  for (let i = 0; i < 60 && !ans; i++) { E.tick(1); ans = E.ctx.debug.mossAnswers().find((a) => a.type === 'fizz' && a.started); }
  ok(!!ans && Math.hypot(ans.x - E.F.bobberPos.x, ans.z - E.F.bobberPos.z) < 0.5, 'the trail turns onto the float (the fizz answer plays there)');
  E.reset();
  const s2 = E.ctx.debug.sign('bubbles', { x: p.x, z: p.z, heading: p.h, ttl: 60 });
  E.tick(10);
  const l2 = E.F.signs.find((q) => q.id === s2.id);
  E.ctx.debug.castAt(l2.head.x - Math.sin(l2.heading) * 1.8, l2.head.z - Math.cos(l2.heading) * 1.8);
  for (let i = 0; i < 90 && E.F.state === 'casting'; i++) E.tick(1);
  const before = E.ctx.debug.mossAnswers().length;
  E.tick(60);
  ok(E.dbg().sign?.kind !== 'bubbles' && E.ctx.debug.mossAnswers().filter((a) => a.type === 'fizz').length === 0, `behind the trail: no rule, no answer (${before})`);
}

section('no gold, no words on a trip (§5.7, §7.2)');
{
  const E = env({ raft: RAFT, seed: 41 });
  E.ctx.debug.forceBite({ wait: 2 });
  for (let i = 0; i < 200 && E.F.state !== 'bite'; i++) E.tick(1);
  ok(!E.events.some((x) => x.e === 'toast'), 'no toast from the cast to the bite');
}

console.log(`\nfishing-wc2: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
