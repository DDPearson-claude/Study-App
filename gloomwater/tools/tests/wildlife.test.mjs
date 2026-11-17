// tools/tests/wildlife.test.mjs — the Mossmere's wildlife (LOOP.wildlife; src/actors-wildlife.js, src/actors-heron.js made to count): the
// counts per tier, the ?wild=0 switch, the seeded birds staying in their areas (clear of the mooring, the places, the islands and the
// raft), the moths' wake and lamp slots, the heron's northern and island spots and its night roost, and that none of it reads a fish.
//   node tools/tests/wildlife.test.mjs
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sink = () => new Proxy(function () {}, { get: (t, k) => (k === 'data' ? new Uint8ClampedArray(4) : k === 'width' || k === 'height' ? 1 : k === Symbol.toPrimitive ? () => 0 : sink()), apply: () => sink(), set: () => true });
globalThis.Path2D = globalThis.Path2D || class { constructor() {} };
globalThis.document = globalThis.document || { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => sink(), toDataURL: () => '' }) };

const { loadLoopData } = await import('./loop-fixture.mjs');
const D = await loadLoopData({ query: 'wild-on' });
globalThis.GW_WILD = false;
const Doff = await loadLoopData({ query: 'wild-off' });
delete globalThis.GW_WILD;
const W = await import('../../src/actors-wildlife.js');
const HM = await import('../../src/actors-heron.js');
const F = await import('../../src/watercraft-face.js');
const { buildLayout, depthAt } = await import('../../src/world-layout.js');
const { buildArena } = await import('../../src/world-art.js');
const here = dirname(fileURLToPath(import.meta.url));
const src = (f) => readFileSync(resolve(here, '../../src', f), 'utf8');

let pass = 0, fail = 0;
const ok = (c, m, extra) => { if (c) pass++; else { fail++; console.log(`  FAIL: ${m}`, extra !== undefined ? JSON.stringify(extra).slice(0, 400) : ''); } };
const section = (t) => console.log(`- ${t}`);

const Z = D.ZONES.find((z) => z.id === 'mossmere');
const L = buildLayout(Z);
const probe = { depth: (x, z) => depthAt(L, x, z), fromShore: (x, z) => L.shoreR(Math.atan2(z, x)) - Math.hypot(x, z) };
const avoid = F.avoidList(L, D);
const landmarks = D.loopPlaceIds('mossmere').map((id) => D.loopPlace(id)?.landmark).filter((q) => q && Number.isFinite(q.x));
const gateLane = { ax: 0, az: -49, bx: 0, bz: -27 };   // (the gate's lane: the Sluice Run, 4 m wide, from the gate south)
const segD = (s, x, z) => { const vx = s.bx - s.ax, vz = s.bz - s.az, t = Math.max(0, Math.min(1, ((x - s.ax) * vx + (z - s.az) * vz) / (vx * vx + vz * vz))); return Math.hypot(x - s.ax - vx * t, z - s.az - vz * t); };

section('data, tiers and the switch');
{
  const C = D.LOOP.wildlife;
  ok(C && C.on === true && W.wildOn(D) === C, 'LOOP.wildlife.on under the loop by default');
  ok(W.wildCount(D, 'moths', 'high') === 48 && W.wildCount(D, 'moths', 'medium') === 24 && W.wildCount(D, 'moths', 'low') === 0, 'moths: 48 on high, 24 on medium, none on low');
  ok(W.wildCount(D, 'lampbills', 'high') === 8 && W.wildCount(D, 'lampbills', 'medium') === 8 && W.wildCount(D, 'lampbills', 'low') === 0, 'lampbills: 8 on high and medium, none on low');
  ok(C.lampbills.groups.every((g) => g.n >= 2 && g.n <= 3) && C.lampbills.groups.reduce((s, g) => s + g.n, 0) === 8, 'in pairs and threes, 8 in all');
  ok(Doff.LOOP.wildlife.on === false && W.wildOn(Doff) === null && W.wildCount(Doff, 'moths', 'high') === 0, 'GW_WILD = false (?wild=0): off');
  ok(W.createLampbills(Doff, F.faceRng(1)).birds.length === 0, 'off: no birds');
  const fakeCtx = (data) => ({ data, render: { scene: { add() {}, remove() {} }, isStub: false } });
  ok(W.attachWildlife(fakeCtx(Doff)) === null, 'off: attachWildlife builds nothing');
  ok(HM.heronRoost(Doff) === null && HM.heronSpots(L, Doff, { phase: 'dusk', probe }).every((s) => !s.isle), 'off: the heron as built (no roost, no island spots)');
  ok(/WILD_FLAGS/.test(src('core.js')) && /q\.has\('wild'\)/.test(src('core.js')) && /GW_WILD !== false/.test(src('data.js')), 'core.js reads ?wild= before data.js, as ?redress');
}

section('lampbills: seeded, in their areas, clear of everything, never at the raft');
{
  const C = D.LOOP.wildlife.lampbills;
  const run = (seed, raftAt, secs = 600, phaseAt = () => 'calm') => {
    const rng = F.faceRng(seed), B = W.createLampbills(D, rng);
    const trace = [];
    let worst = Infinity, outR = 0, events = { dive: 0, flee: 0, surface: 0, dip: 0, sleep: 0, wake: 0 };
    for (let i = 0, n = secs * 30; i < n; i++) {
      const t = i / 30, raft = raftAt(t), phase = phaseAt(t);
      W.stepLampbills(B, { dt: 1 / 30, raft, phase, rng });
      for (const b of B.birds) {
        const g = B.groups[b.g];
        outR = Math.max(outR, Math.hypot(b.x - g.x, b.z - g.z) - g.R);
        if (raft && (b.mode !== 'dive' || b.dive < 0.5)) worst = Math.min(worst, Math.hypot(b.x - raft.x, b.z - raft.z));
        for (const e of b.events) events[e] = (events[e] || 0) + 1;
      }
      if (i % 30 === 0) trace.push(B.birds.map((b) => [+b.x.toFixed(3), +b.z.toFixed(3), b.mode]));
    }
    return { B, trace, worst, outR, events };
  };
  const far = () => ({ x: 0, z: 0 });
  const a = run(7, far), b = run(7, far), c = run(8, far);
  ok(JSON.stringify(a.trace) === JSON.stringify(b.trace) && JSON.stringify(a.trace) !== JSON.stringify(c.trace), 'seeded: the same seed walks the same paths, another seed others');
  ok(a.outR <= 1e-6, `every bird stays within its area (r + range; worst ${a.outR.toFixed(3)} m past it)`);
  ok(a.events.dive >= 8 && a.events.dip >= 8 && a.events.surface >= a.events.dive - 8, `they dip and dive by day (${a.events.dip} dips, ${a.events.dive} dives in 10 min)`, a.events);
  // every point a bird can reach: 6 m off the mooring, the glide-in, the places and their landmarks, off the gate's lane, in water
  const B0 = a.B;
  let worstClear = Infinity, worstLm = Infinity, worstLane = Infinity, worstIsle = Infinity, worstShore = Infinity;
  for (const g of B0.groups) for (let k = 0; k < 64; k++) for (const rr of [0, 0.5, 1]) {
    const x = g.x + Math.cos((k / 64) * Math.PI * 2) * g.R * rr, z = g.z + Math.sin((k / 64) * Math.PI * 2) * g.R * rr;
    worstClear = Math.min(worstClear, F.clearanceOf(avoid, x, z));
    worstLm = Math.min(worstLm, ...landmarks.map((q) => Math.hypot(x - q.x, z - q.z)));
    worstLane = Math.min(worstLane, segD(gateLane, x, z));
    worstIsle = Math.min(worstIsle, ...L.islands.map((o) => Math.hypot(x - o.x, z - o.z) - o.r));
    worstShore = Math.min(worstShore, probe.fromShore(x, z));
  }
  ok(worstClear >= 6, `every reachable point ≥ 6 m from the mooring, the glide-in and the places (${worstClear.toFixed(1)} m)`);
  ok(worstLm >= 6 && worstLane >= 8, `and from the places' landmarks (${worstLm.toFixed(1)} m) and the gate's lane (${worstLane.toFixed(1)} m)`);
  ok(worstIsle >= 0.8 && worstShore >= 2, `on open water: off the islands' rock (${worstIsle.toFixed(1)} m) and the shore (${worstShore.toFixed(1)} m)`);
  ok(B0.groups.every((g) => Math.hypot(g.roost.x - g.x, g.roost.z - g.z) + 1 <= g.R), 'each roost lies inside its area');
  // the raft sails straight through each beat, back and forth at 3 m/s
  const sweep = (t) => { const g = C.groups[Math.floor(t / 40) % C.groups.length], u = ((t % 40) / 40) * 2 - 1; return { x: g.x + u * 30, z: g.z + Math.sin(t * 0.3) * 1.5 }; };
  const s = run(11, sweep, 360);
  ok(s.events.flee >= 6, `the raft within 10 m sends them under (${s.events.flee} flees)`);
  ok(s.worst >= 2, `never within the raft's keep-off while up (closest ${s.worst.toFixed(2)} m)`);
  ok(s.outR <= 1e-6, 'and still within their areas');
  // fleeing: it comes up farther from the raft
  {
    const rng = F.faceRng(3), B = W.createLampbills(D, rng), bird = B.birds[0];
    const raft = { x: bird.x + 8, z: bird.z };
    const d0 = Math.hypot(bird.x - raft.x, bird.z - raft.z);
    W.stepLampbills(B, { dt: 1 / 30, raft, phase: 'calm', rng });
    ok(bird.mode === 'dive' && bird.events.includes('flee'), 'the raft at 8 m: it dives');
    for (let i = 0; i < 300 && bird.mode === 'dive'; i++) W.stepLampbills(B, { dt: 1 / 30, raft, phase: 'calm', rng });
    ok(bird.mode !== 'dive' && Math.hypot(bird.x - raft.x, bird.z - raft.z) > d0, `and comes up farther off (${d0.toFixed(1)} → ${Math.hypot(bird.x - raft.x, bird.z - raft.z).toFixed(1)} m)`);
  }
  // the night: asleep at the roost, head tucked; back at first light
  {
    const rng = F.faceRng(5), B = W.createLampbills(D, rng);
    for (let i = 0; i < 90 * 30; i++) W.stepLampbills(B, { dt: 1 / 30, raft: { x: 0, z: 0 }, phase: 'gloomtide', rng });
    ok(B.birds.every((b) => b.mode === 'sleep' && b.tuck > 0.9 && Math.hypot(b.x - B.groups[b.g].roost.x, b.z - B.groups[b.g].roost.z) < 1.2 && b.wake < 0.05), 'gloomtide: all asleep, head-tucked, at their roosts', B.birds.map((b) => b.mode));
    let woke = 0;
    for (let i = 0; i < 30; i++) { W.stepLampbills(B, { dt: 1 / 30, raft: { x: 0, z: 0 }, phase: 'dawn', rng }); woke += B.birds.filter((b) => b.events.includes('wake')).length; }
    ok(woke === B.birds.length && B.birds.every((b) => b.mode !== 'sleep'), 'first light: awake and paddling');
  }
  ok(W.createLampbills(D, F.faceRng(1), 4).birds.length === 4, 'a tier can draw fewer');
}

section('wick-moths: when they fly, which lamps');
{
  const mw = W.mothWake;
  ok(mw('calm', 0.3).wake === 0 && mw('calm', 0.3).doze === 0, 'day: none about');
  ok(mw('calm', 0.7).wake === 0 && mw('calm', 0.7).doze > 0, 'late day: a few doze on the posts');
  ok(mw('dusk', 0.4).wake === 0 && mw('dusk', 0.5).wake >= 0.3, 'they wake at dusk, k 0.5');
  ok(mw('gloomtide', 0.5).wake > mw('dusk', 0.99).wake && mw('gloomtide', 0.5).wake >= 0.95, 'and thicken at gloomtide');
  ok(mw('dawn', 0.9).wake < mw('dawn', 0.1).wake, 'they settle as the dawn comes');
  ok(mw('calm', 0, true).wake > 0, 'at home the last of them are still at the rail lanterns');
  const raft = { key: 'raft', kind: 'raft', x: 0, y: 2, z: 0, k: 1 };
  const lamp = (key, x, z, k = 1) => ({ key, kind: 'post', x, y: 2.4, z, k });
  const cands = [raft, lamp('a', 5, 0), lamp('b', 0, 12), lamp('c', 30, 0), lamp('d', 2, 3, 0), lamp('e', 80, 0)];
  const r1 = W.lampSlots(cands, { x: 0, z: 0 }, [], { n: 4, reach: 45, nextR: 9 });
  ok(r1.slots[0] === raft && r1.slots.slice(1).map((c) => c.key).join() === 'a,b,c', 'slot 0 the raft\'s lantern, then the nearest lit lamps (a dark one and one past reach left out)', r1.slots.map((c) => c?.key));
  ok(r1.next[0] === 1 && r1.next[1] === 0 && r1.next[3] === 3, 'its moths flutter to a lamp within 9 m, else back to their own', r1.next);
  const r2 = W.lampSlots(cands, { x: 4, z: 1 }, r1.slots, { n: 4 });
  ok(r2.slots.map((c) => c.key).join() === r1.slots.map((c) => c.key).join(), 'stable as the raft moves');
  cands[1].k = 0;   // a dims
  const r3 = W.lampSlots(cands, { x: 0, z: 0 }, r2.slots, { n: 4 });
  ok(r3.slots[2].key === 'b' && r3.slots[3].key === 'c' && r3.slots[1].key === 'raft', 'a dimmed lamp\'s slot goes to the nearest lit one (here the raft\'s: its moths drift there)', r3.slots.map((c) => c.key));
  const C = D.LOOP.wildlife.moths;
  ok(Object.values(C.kinds).every((k) => k[0] + k[3] >= -0.3) && C.minY >= 0.6, 'they never come down to the water (an orbit floor of 0.6 m)');
  ok(C.kinds.raft[0] - 0.2 > 0, 'over the raft\'s lantern (above the Wick\'s head), never out over the float');
  const ws = src('actors-wildlife.js');
  ok(/vLit = uLampCol \* \(uLamp\[lamp\]\.w/.test(ws) && !/emissive|glowSprite|halos/.test(ws.replace(/^\/\/.*$/gm, '')), 'lit only by the lamp they circle: no glow of their own');
}

section('the heron, made to count');
{
  const C = D.LOOP.wildlife.heron;
  for (const ph of ['calm', 'dusk']) {
    const spots = HM.heronSpots(L, D, { phase: ph, probe });
    const isle = spots.filter((s) => s.isle), shore = spots.filter((s) => !s.isle);
    ok(shore.length >= 8 && shore.every((s) => s.z <= C.northZ), `${ph}: ${shore.length} margin and reed spots, all in the north half`);
    ok(C.isles.every((n) => isle.some((s) => s.isle === n)), `${ph}: spots on each island's shore (${isle.length})`, isle.map((s) => s.isle));
    ok(isle.every((s) => { const o = L.islands.find((q) => q.name === s.isle); return s.z >= o.z - o.r * 0.25 && Math.hypot(s.x - o.x, s.z - o.z) > o.r; }), `${ph}: on their south faces, off the rock`);
    ok(spots.every((s) => F.clearanceOf(avoid, s.x, s.z) >= 6), `${ph}: every spot ≥ 6 m from the mooring, the glide-in and the places`);
  }
  const A = buildArena({ data: D, render: { isStub: true }, state: { meta: { settings: {} } } }, buildLayout(Z), { quality: 'high', far: 500, redress: true, loop: true });
  ok(A.slits.length >= 2 && A.lampPosts.every((p) => typeof p.light === 'boolean'), `the moths' lamps recorded (${A.slits.length} slits, ${A.lampPosts.length} bollards)`);
  A.dispose?.();
  const roost = HM.heronRoost(D);
  const gh = L.islands.find((o) => o.name === 'Drowned Gatehouse'), door = D.LOOP.places?.gatehouse_door || { x: 22, z: -2.5 };
  ok(roost && roost.length === 2 && roost.every((r) => { const d = Math.hypot(r.x - gh.x, r.z - gh.z); return d > gh.r && d < gh.r + 1 && r.z > gh.z && Math.hypot(r.x - 22, r.z + 2.5) >= 8 && probe.fromShore(r.x, r.z) > 1; }) && Math.hypot(roost[0].x - roost[1].x, roost[0].z - roost[1].z) > 8,
    'two roosts in the shallows at the Drowned Gatehouse\'s south foot, 8 m off its Door and from each other', door);
  ok(roost.every((r) => F.clearanceOf(avoid, r.x, r.z) >= 6), 'clear of the mooring, the glide-in and the places');
  const spots = HM.heronSpots(L, D, { phase: 'dusk', probe }), rng = F.faceRng(9), H = HM.createHeronState(spots, rng), raft = { x: 0, z: 40 };
  const at = (r) => roost.some((q) => q.x === r.x && q.z === r.z);
  HM.stepHeron(H, { dt: 1 / 30, raft, phase: 'gloomtide', spots: [], rng, roost });
  ok(H.mode === 'fly' && H.events.includes('leave'), 'at dark it flies');
  for (let i = 0; i < 400 && H.mode === 'fly'; i++) HM.stepHeron(H, { dt: 1 / 30, raft, phase: 'gloomtide', spots: [], rng, roost });
  ok(H.mode === 'roost' && at(H) && H.y === 0, 'to a roost, and stands there still');
  for (let i = 0; i < 300; i++) HM.stepHeron(H, { dt: 1 / 30, raft: { x: H.x + 9, z: H.z + 3 }, phase: 'gloomtide', spots: [], rng, roost });
  ok(H.mode === 'roost' && H.lifts === 0, 'all night, with the raft 9 m off');
  const was = { x: H.x, z: H.z }, near = { x: H.x + 5, z: H.z + 2 };
  HM.stepHeron(H, { dt: 1 / 30, raft: near, phase: 'gloomtide', spots: [], rng, roost });
  ok(H.mode === 'fly' && H.events.includes('lift'), 'the raft at 5 m: it lifts');
  for (let i = 0; i < 400 && H.mode === 'fly'; i++) HM.stepHeron(H, { dt: 1 / 30, raft: near, phase: 'gloomtide', spots: [], rng, roost });
  ok(H.mode === 'roost' && at(H) && (H.x !== was.x || H.z !== was.z), 'to the other roost');
  HM.stepHeron(H, { dt: 1 / 30, raft, phase: 'calm', spots, rng, roost });
  for (let i = 0; i < 400 && H.mode === 'fly'; i++) HM.stepHeron(H, { dt: 1 / 30, raft, phase: 'calm', spots, rng, roost });
  ok(H.mode === 'stand' && spots.some((s) => s.x === H.x && s.z === H.z), 'with the light it goes to a spot again');
  const H2 = HM.createHeronState([], rng);
  HM.stepHeron(H2, { dt: 1 / 30, raft, phase: 'gloomtide', spots: [], rng, roost });
  ok(H2.mode === 'roost', 'a night begun with no heron about: it is on its roost');
  const hs = src('actors-heron.js');
  ok(/mesh\.scale\.setScalar/.test(hs) && /sleep: body\('sleep'\)/.test(hs) && (hs.match(/new THREE\.Mesh\(/g) || []).length === 1, 'the same one mesh, 1.3x, a sleep pose');
}

section('nothing to do with the catch; drawn cheaply; hooked by main');
{
  const ws = src('actors-wildlife.js');
  ok(!/fishing|castOdds|rollSpecies|progression|hookWeights|finishPool|bait/i.test(ws.replace(/^\/\/.*$/gm, '')), 'it reads no fishing, odds, bait or progression (it changes no odd and takes no bait)');
  ok((ws.match(/new THREE\.InstancedMesh\(/g) || []).length === 2 && /q0 !== 'low'/.test(ws) && /!ctx\.cinematic/.test(ws), 'one InstancedMesh a creature (2 draw calls), hidden on low and in a cinematic (the catch show)');
  ok(/setupSurface\(mesh, \{ cast: false, reflect: false \}\)/.test(ws) && /frustumCulled = false/.test(ws), 'no shadow or mirror pass');
  ok(/attachWildlife\(ctx\)/.test(src('main.js')) && /faceOn\(ctx\.data, zoneId\(\)\)/.test(ws), 'main attaches it under the loop; the Mossmere only');
  ok(/!wildMoths\(\)/.test(src('actors-home.js')), 'the barge\'s smoke-pool specks give way to the moths');
}

console.log(`\nwildlife: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
