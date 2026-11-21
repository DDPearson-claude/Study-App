// LAKE 2 (the integration's fix; docs/loop/LAKE2.md §2.4, WATERCRAFT §5–§7): fishing at Sporewood Pools under the loop reads as the
// Mossmere's does. The REAL src/fishing.js on a fake ctx whose world is Sporewood's outline layout (world-layout's field, depth, shore
// runs), on a trip under the loop after the tow: no pulse ring, gold ring, spot disc or built sign anywhere in a whole catch (cast, land,
// bite, strike, play), the water's own white; honest spawning by Sporewood's tells and makers; silhouettes of its own fish by its own
// bodies; a cast's area from its own geometry (the castArea guard lifted); a cast in one of its places is that place. The Mossmere runs
// the same flow beside it, unchanged.
//   node tools/tests/lake2-fishing.test.mjs [--verbose]
import * as THREE from 'three';
import { loadLoopData, fakeLoop } from './loop-fixture.mjs';
const D = await loadLoopData({ query: 'lake2-fishing' });
const { makeFishingEnv } = await import('./fishing-env.mjs');
const WL = await import('../../src/world-layout.js');
const WC = await import('../../src/watercraft.js');
const SG = await import('../../src/fishing-signs.js');
const SI = await import('../../src/fishing-sight.js');

let pass = 0, fail = 0;
const VERBOSE = process.argv.includes('--verbose');
function ok(cond, msg, extra) { if (cond) { pass++; if (VERBOSE) console.log('  ok:', msg); } else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra).slice(0, 400) : ''); } }
const section = (s) => console.log(`- ${s}`);
function mul(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const SZ = D.ZONES.find((z) => z.id === 'sporewood'), SL = WL.buildLayout(SZ);
const depth = (x, z) => WL.depthAt(SL, x, z), field = (x, z) => WL.fromShore(SL, x, z);
const isWater = (x, z) => field(x, z) > 0.5;
const SWC = WC.WATERCRAFT.sporewood, SWF = new Set(D.SPECIES.filter((s) => s.zone === 'sporewood').map((s) => s.id));
const mooring = D.loopMooring('sporewood', SL.docks);
const SPL = D.loopPlaceIds('sporewood');
function world(rng) {
  return {
    getZone: () => SZ, getDepth: depth, getShoreRadius: (a) => SL.shoreR(a), getFromShore: field, getShoreDist: field,
    getShoreAlong: (x, z) => WL.shoreAlong(SL, x, z), getOutline: () => SL.outline, isOpenWater: (x, z) => isWater(x, z), getObstacles: () => SL.obstacles,
    getDocks: () => SL.docks.map((d) => ({ position: { x: d.x, y: 0, z: d.z }, yaw: d.yaw })), getMooring: () => mooring,
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
const CAST = 16 * 0.55;   // a forced cast lands CAST m up-screen (−z) of the raft (fishing-env's castMax 16)
function env({ phase = 'dusk', raft = [-54, 32 + CAST], seed = 7, scene = null, bait = 'spore_cake', places = SPL.slice(0, 2) } = {}) {
  const loop = fakeLoop({ D, wick: 'wick', state: { zone: 'sporewood', barge: { water: 'sporewood', towed: ['sporewood'] }, gearWater: 'sporewood' },
    maps: { lakes: ['mossmere', 'sporewood'], places: places.slice() }, lifted: places.slice(), bag: bait ? { [bait]: 99 } : {} });
  const E = makeFishingEnv({ data: D, mode: 'still', outing: 'trip', phase, seed, loop, raft, zoneId: 'sporewood', render: { getQuality: () => 'high', ...(scene ? { scene } : {}) },
    runOver: { bait: bait ? { [bait]: 99 } : {}, equippedBait: bait, evening: 2, character: 'wick', nightMode: 'still' } });
  E.ctx.world = world(mul(seed * 7 + 1));
  E.ctx.bus.on('fishing:bite', (e) => loop.noteBite(e));
  E.tick(4);
  E.loop = loop;
  E.castAt = (p, o = {}) => { E.ctx.player.position.set(p.x, 0, p.z + CAST); E.tick(1); return E.ctx.debug.forceBite({ wait: 2, ...o }); };
  E.toBite = () => { for (let i = 0; i < 400 && E.F.state === 'waiting'; i++) E.tick(1); return E.F.state === 'bite'; };
  return E;
}
/** A whole forced catch at (x, z) with fx.pulse traced: [{state, color, r1}] for every pulse fishing asked for. */
function wholeCatch(E, p, o) {
  const fx = E.ctx.debug.fishFx(), calls = [], p0 = fx.pulse;
  fx.pulse = (x, z, opt = {}) => { calls.push({ state: E.F.state, color: opt.color, r1: opt.r1 }); return p0.call(fx, x, z, opt); };
  const cast = E.castAt(p, o), bit = E.toBite();
  E.ctx.debug.fishOutcome('land'); E.tick(3);
  E.F.onPointerDown({ input: 'mouse' }); E.F.onPointerUp();
  let reeled = 0;
  for (let i = 0; i < 6000 && E.F.state === 'reeling'; i++) { E.tick(1); reeled++; }
  for (let i = 0; i < 300 && E.F.state === 'landing'; i++) E.tick(1);
  fx.pulse = p0;
  return { cast, bit, reeled, calls, end: E.F.state };
}

// =====================================================================================
section('a Sporewood trip under the loop is drawn as the Mossmere\'s: water-white, no pulse ring, no gold, no glimmer');
{
  const scene = new THREE.Scene();
  const E = env({ scene });
  E.tick(10);
  ok(E.F.view.waterWhite === true && E.ctx.debug.fishFx().waterWhite === true, 'the water\'s own white (view.waterWhite, fishing-fx\'s uWhite)');
  const pm = scene.getObjectByName('fishing-pulses');
  ok(!!pm && pm.material.uniforms.uEdge?.value === 1, 'the pulses\' glow fades out inside their quad (uEdge 1), as on the Mossmere');
  let glim = null; scene.traverse((o) => { if (o.material?.uniforms?.uGlim) glim = o.material.uniforms.uGlim.value; });
  ok(glim === 0 || glim === null, `the legend pool's glimmer is off (uGlim ${glim})`);
  const r = wholeCatch(E, { x: -54, z: 32 }, { speciesId: 'falsesmile_barb', z: 0.6 });
  ok(r.cast && r.bit && r.reeled > 10, `a whole catch ran (cast ${r.cast}, bite ${r.bit}, ${r.reeled} frames of play, ends ${r.end})`);
  const off = r.calls.filter((c) => c.state !== 'waiting'), gold = r.calls.filter((c) => c.color === 0xffd27a || c.color === 0xf0d79a || c.color === 0xff8a5a || c.color === 0xffc27a);
  ok(off.length === 0, `no pulse ring at the landing, the bite, the strike or the play (${off.length}: ${JSON.stringify(off.slice(0, 4))})`);
  ok(gold.length === 0, `no gold or orange ring at all (${gold.length})`);
  // the same flow on the Mossmere: the same rule (its look unchanged)
  const M = makeFishingEnv({ data: D, mode: 'still', outing: 'trip', phase: 'dusk', seed: 7, loop: fakeLoop({ D, wick: 'wick', bag: { mireworm: 99 } }), raft: [0, 10 + CAST],
    runOver: { bait: { mireworm: 99 }, equippedBait: 'mireworm', evening: 2, character: 'wick', nightMode: 'still' } });
  const L0 = WL.buildLayout(D.ZONES[0]);
  Object.assign(M.ctx.world, { getDepth: (x, z) => WL.depthAt(L0, x, z), getShoreRadius: (a) => L0.shoreR(a) });
  M.castAt = (p, o = {}) => { M.ctx.player.position.set(p.x, 0, p.z + CAST); M.tick(1); return M.ctx.debug.forceBite({ wait: 2, ...o }); };
  M.toBite = () => { for (let i = 0; i < 400 && M.F.state === 'waiting'; i++) M.tick(1); return M.F.state === 'bite'; };
  const rm = wholeCatch(M, { x: 0, z: 10 }, { speciesId: 'mossback_perch', z: 0.6 });
  ok(rm.bit && rm.calls.filter((c) => c.state !== 'waiting').length === 0 && M.F.view.waterWhite === true, 'the Mossmere\'s same catch: no ring outside the wait, water-white (as before)');
}

// =====================================================================================
section('honest spawning at Sporewood: every tell by its own table\'s areas and makers, never a built sign or a glow');
{
  // a raft in the West Pool's margin, the Reed Flats and the lily rafts in range
  const E = env({ raft: [-46, 26], seed: 9 });
  const T = SG.normTells(SWC.tells), seen = {};
  let total = 0, moss = 0, glow = 0, bad = [];
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
    if (!f || !f.areas.includes(s.area)) bad.push(`${s.kind}:${s.form}@${s.area}`);
    if (s.kind !== 'gas' && (!(s.makers || []).length || !(s.makers || []).every((id) => SWF.has(id)))) bad.push(`makers ${s.makers}`);
  });
  E.tick(30 * 900);
  ok(total > 12 && moss === total && glow === 0 && !bad.length, `${total} tells in 15 min, each one by Sporewood's tells (${Object.entries(seen).map(([k, n]) => `${k} ${n}`).join(', ')})`, bad.slice(0, 5));
  ok(Object.keys(seen).some((k) => k.startsWith('rise:sip')), 'the sip is there (the Fry and the Barb)');
  const pre = E.ctx.debug.fishSigns().filter((s) => s.preroll);
  ok(pre.every((s) => SWF.has(s.preroll.speciesId) && !D.SPECIES_BY_ID[s.preroll.speciesId]?.giant), 'a rise\'s or a swirl\'s fish is one of Sporewood\'s, never a giant');
}

// =====================================================================================
section('silhouettes at Sporewood: its own fish by its own bodies, in its clear shallows');
{
  // a raft in the West Pool by the Reed Flats' margins and the lily rafts (its shallows within cast range)
  const RAFT = [-46, 26];
  let shallow = 0;
  for (let a = 0; a < 32; a++) for (const d of [5, 8, 11]) { const x = RAFT[0] + Math.cos(a * 0.196) * d, z = RAFT[1] + Math.sin(a * 0.196) * d; if (isWater(x, z) && depth(x, z) < 0.45) shallow++; }
  ok(shallow >= 12, `clear shallows round the raft (${shallow} of 96 points under 0.45 m)`);
  const E = env({ raft: RAFT, seed: 11 });
  const spawned = [];
  E.ctx.bus.on('sign:spawn', (p) => { if (p.kind === 'sight') { const f = E.ctx.debug.fishSights().find((q) => q.id === p.id); if (f) spawned.push(f); } });
  // (the merge of the soft shadows, 18 Nov 2026: at Sporewood too, two at most, and they glide: no dart, no jump, gentle turns)
  let maxAlive = 0, fast = 0, worstTurn = 0;
  const lastH = new Map();
  for (let i = 0; i < 30 * 600; i += 30) {
    E.tick(30);
    const live = E.ctx.debug.fishSights();
    maxAlive = Math.max(maxAlive, live.length);
    for (const f of live) {
      if (f.mode !== 'bolt' && f.speed > 0.8 + 1e-9) fast++;
      const h0 = lastH.get(f.id);
      if (h0 != null && f.mode !== 'bolt' && f.mode !== 'take' && f.mode !== 'nose') worstTurn = Math.max(worstTurn, Math.abs(Math.atan2(Math.sin(f.heading - h0), Math.cos(f.heading - h0))));
      lastH.set(f.id, f.heading);
    }
  }
  ok(maxAlive >= 1 && maxAlive <= 2, `at most two alive at Sporewood (${maxAlive})`);
  ok(!fast && worstTurn <= SI.SIGHT.glide.turn * 1.05 + 1e-6, `they glide at Sporewood: never over 0.8 m/s unbolted, turning ≤ ${SI.SIGHT.glide.turn} rad a second (worst ${worstTurn.toFixed(2)} rad in 1 s)`);
  const O = SI.OUTLINE_AT.sporewood, N = SI.NEVER_AT.sporewood;
  ok(spawned.length >= 4, `${spawned.length} silhouettes in 10 min at dusk`);
  const wrong = spawned.filter((f) => !SWF.has(f.speciesId) || N.has(f.speciesId) || O[f.speciesId] !== f.outline || !(f.depth < 0.45) || !SI.SIGHT_AREAS.has(f.area));
  ok(!wrong.length, 'each is a Sporewood fish, drawn by its own body, in water shallower than 0.45 m in a sight area', wrong.slice(0, 3));
  const kinds = {}; for (const f of spawned) kinds[f.speciesId] = (kinds[f.speciesId] || 0) + 1;
  if (VERBOSE) console.log('   seen:', JSON.stringify(kinds));
  // the table and the drawing agree (watercraft's WATERCRAFT.sporewood.sight and fishing-sight's OUTLINE_AT)
  const bodies = Object.fromEntries(Object.entries(SWC.sight.bodies).flatMap(([b, ids]) => ids.map((id) => [id, b])));
  ok(JSON.stringify(Object.entries(bodies).sort()) === JSON.stringify(Object.entries(O).sort()) && SWC.sight.exclude.every((id) => N.has(id)) && [...N].every((id) => SWC.sight.exclude.includes(id)),
    'WATERCRAFT.sporewood.sight\'s bodies and never-seen are fishing-sight\'s');
  ok(SI.outlineOf('weeping_carp', 'day', 'margin') === 'deep' && SI.outlineOf('falsesmile_barb', 'day', 'margin') === null && SI.outlineOf('falsesmile_barb', 'day', 'margin', 'sporewood') === 'deep'
    && SI.outlineOf('capshell_crayfish', 'day', 'stones', 'sporewood') === null && SI.outlineOf('capshell_crayfish', 'night', 'stones', 'sporewood') === 'claw', 'outlineOf by water: the Mossmere\'s as before, Sporewood\'s own (its crayfish at night on the roots)');
}

// =====================================================================================
section('a cast\'s area at Sporewood is its own (the castArea guard lifted); a cast in one of its places is that place');
{
  const E = env({ bait: 'spore_cake' });
  const want = [[-54, 32, 'pads'], [74.5, -24, 'inflow'], [-66, 37, 'outflow']];
  for (const [x, z, a] of want) {
    E.castAt({ x, z });
    const o = E.ctx.debug.fishOdds();
    ok(o?.area === a && o.entries.every((e) => SWF.has(e.id)) && o.S > 0, `a cast at (${x}, ${z}) is the ${a}, its odds Sporewood's own (got ${o?.area})`);
    E.reset();
  }
  // the Lullaby, owned and lifted: its own pool (the Jelly on Amber Larvae)
  const J = env({ bait: 'amber_larvae' });
  const lp = D.loopPlace('lullaby');
  J.castAt({ x: lp.x, z: lp.z });
  const oj = J.ctx.debug.fishOdds();
  ok(oj?.place === 'lullaby' && oj.entries.some((e) => e.id === 'sleepspore_jelly'), `a cast in the Lullaby is the Lullaby: its own fish bites there (${oj?.place}; ${oj?.entries?.map((e) => e.id).join(', ')})`);
  // the Veilwater, not owned: a bank (mist), no bite
  const V = env({ places: SPL.slice(0, 2) });
  const vp = D.loopPlace('veilwater');
  V.ctx.player.position.set(vp.x, 0, vp.z + CAST); V.tick(1); V.ctx.debug.forceBite({ wait: 2 });
  for (let i = 0; i < 120 && ['casting', 'waiting'].includes(V.F.state); i++) V.tick(1);
  ok(V.F.state !== 'bite' && V.F.state !== 'reeling', `a cast into the Veilwater, not owned, bites nothing (${V.F.state})`);
}

console.log(`\nlake2-fishing: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
