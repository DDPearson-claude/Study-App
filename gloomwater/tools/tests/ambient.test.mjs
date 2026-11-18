// tools/tests/ambient.test.mjs — the Mossmere's ambient (LOOP.ambient; src/world-ambient.js): the candle-boats' counts per tier, their
// seeded paths along the outflow to the Moss Sluice (clear of the places, the mooring, the glide-in, the gate's lane and the rock), their
// gutter, sink and relaunch, the raft pushing them aside; the gate slits' flicker and their going out and relighting; the drowned
// debris in the lake's obstacles, clear of every place, lane and passage; and the ?wild=0 switch (the moving ones off, the debris kept).
//   node tools/tests/ambient.test.mjs
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sink = () => new Proxy(function () {}, { get: (t, k) => (k === 'data' ? new Uint8ClampedArray(4) : k === 'width' || k === 'height' ? 1 : k === Symbol.toPrimitive ? () => 0 : sink()), apply: () => sink(), set: () => true });
globalThis.Path2D = globalThis.Path2D || class { constructor() {} };
globalThis.document = globalThis.document || { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => sink(), toDataURL: () => '' }) };

const { loadLoopData } = await import('./loop-fixture.mjs');
const D = await loadLoopData({ query: 'amb-on' });
globalThis.GW_WILD = false;
const Doff = await loadLoopData({ query: 'amb-off' });
delete globalThis.GW_WILD;
const A = await import('../../src/world-ambient.js');
const F = await import('../../src/watercraft-face.js');
const { buildLayout } = await import('../../src/world-layout.js');
const { buildArena } = await import('../../src/world-art.js');
const here = dirname(fileURLToPath(import.meta.url));
const src = (f) => readFileSync(resolve(here, '../../src', f), 'utf8');

let pass = 0, fail = 0;
const ok = (c, m, extra) => { if (c) pass++; else { fail++; console.log(`  FAIL: ${m}`, extra !== undefined ? JSON.stringify(extra).slice(0, 400) : ''); } };
const section = (t) => console.log(`- ${t}`);

const Z = D.ZONES.find((z) => z.id === 'mossmere');
const L = buildLayout(Z);
const fromShore = (x, z) => L.shoreR(Math.atan2(z, x)) - Math.hypot(x, z);
const avoid = F.avoidList(L, D);
const segD = (ax, az, bx, bz, x, z) => { const vx = bx - ax, vz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz))); return Math.hypot(x - ax - vx * t, z - az - vz * t); };
const gateLane = (x, z) => segD(0, -49, 0, -27, x, z);   // (the gate's lane: the Sluice Run, from the gate south)
// every Mossmere place's water (the four the loop sells and the rest of MOSSMERE_V3's): the clearance from its edge
const placeEdge = (p, x, z) => { const w = p.water; if (w.kind === 'disc') return Math.hypot(x - w.x, z - w.z) - w.r; if (w.kind === 'rect') return Math.max(Math.abs(x - w.x) - w.w / 2, Math.abs(z - w.z) - w.d / 2); return segD(w.pts[0][0], w.pts[0][1], w.pts[1][0], w.pts[1][1], x, z) - w.w / 2; };
const places = D.MOSSMERE_V3.places;
const nearestPlace = (x, z) => Math.min(...places.map((p) => placeEdge(p, x, z)));
const rock = (x, z) => Math.min(...L.obstacles.map((o) => Math.hypot(x - o.x, z - o.z) - o.r), ...L.gateObstacles.map((o) => Math.hypot(x - o.x, z - o.z) - o.r));

section('data, tiers and the switch');
{
  const C = D.LOOP.ambient;
  ok(C && C.on === true && A.ambientOn(D) === C, 'LOOP.ambient.on under the loop by default');
  ok(A.boatCount(D, 'high') === 6 && A.boatCount(D, 'medium') === 4 && A.boatCount(D, 'low') === 0, 'candle-boats: 6 on high, 4 on medium, none on low');
  ok(Doff.LOOP.ambient.on === false && A.ambientOn(Doff) === null && A.boatCount(Doff, 'high') === 0 && A.createBoats(Doff, F.faceRng(1)).boats.length === 0, 'GW_WILD = false (?wild=0): no boats');
  const fakeCtx = (data) => ({ data, render: { scene: { add() {}, remove() {} }, isStub: false } });
  ok(A.attachAmbient(fakeCtx(Doff)) === null, 'off: attachAmbient builds nothing');
  const offArena = buildArena({ data: Doff, render: { isStub: true }, state: { meta: { settings: {} } } }, buildLayout(Z), { quality: 'high', far: 500, redress: true, loop: true });
  const onArena = buildArena({ data: D, render: { isStub: true }, state: { meta: { settings: {} } } }, buildLayout(Z), { quality: 'high', far: 500, redress: true, loop: true });
  ok(offArena.slitFx === null && onArena.slitFx && onArena.slitFx.S.n === 8, `the gate's eight slits flicker with it on, are steady off (${onArena.slitFx?.S.n} slits)`);
  ok(A.debrisObstacles(Doff, 'mossmere').length === 5 && A.debrisObstacles(D, 'glasswater').length === 0, 'off: the debris stays (it is the lake\'s own); on the Mossmere only');
  offArena.dispose?.(); onArena.dispose?.();
  const ws = src('world.js'), ms = src('main.js');
  ok(/for \(const o of debrisObstacles\(ctx\.data, z\.id\)\) layout\.obstacles\.push\(o\);/.test(ws), 'world.js adds the debris to the lake\'s obstacles (the raft\'s collision reads them)');
  ok(/if \(o\.kind === 'debris'\) continue;/.test(src('water.js')), 'and the water draws no foam ring or pale shallows round it');
  ok(/ambW = attachAmbient\(ctx\)/.test(ms) && /ambW\.update\(running \? realDt : 0, \{ show: wildShow \}\)/.test(ms), 'main attaches the boats under the loop and hands them the catch show');
}

section('candle-boats: seeded lines to the Sluice, clear of everything');
{
  const C = D.LOOP.ambient.boats;
  const lines = C.lines.map(A.lineOf);
  let wClear = Infinity, wPlace = Infinity, wLane = Infinity, wRock = Infinity, wShore = Infinity;
  for (const Lh of lines) for (let s = 0; s <= Lh.len; s += 0.25) for (const side of [-1, 0, 1]) {
    const p = A.alongLine(Lh, s), off = side * C.off * (1 - 0.5 * Math.max(0, Math.min(1, (s - (Lh.len - 6)) / 6))) + side * 0.2;
    const x = p.x - p.tz * off, z = p.z + p.tx * off;
    wClear = Math.min(wClear, F.clearanceOf(avoid, x, z)); wPlace = Math.min(wPlace, nearestPlace(x, z)); wLane = Math.min(wLane, gateLane(x, z));
    wRock = Math.min(wRock, rock(x, z)); wShore = Math.min(wShore, fromShore(x, z));
  }
  ok(wClear >= 6 && wPlace >= 6, `every drift point ≥ 6 m from the mooring, the glide-in and every place (${wClear.toFixed(1)}, ${wPlace.toFixed(1)} m)`);
  ok(wLane >= 6, `and from the gate's lane (${wLane.toFixed(1)} m)`);
  ok(wRock >= 0.25 && wShore >= 3, `on open water: off the rock and the gate's stones (${wRock.toFixed(2)} m) and the shore (${wShore.toFixed(1)} m)`);
  ok(lines.every((Lh) => { const e = Lh.pts[Lh.pts.length - 1]; const r = Math.hypot(e[0], e[1] + 49); return r >= 7 && r <= 9.5; }), 'each line ends at the gate\'s broken stone ring, its lip (7–9.5 m from the gate)');
  ok(lines.every((Lh) => Math.hypot(Lh.pts[0][0], Lh.pts[0][1] + 49) > Math.hypot(Lh.pts[Lh.pts.length - 1][0], Lh.pts[Lh.pts.length - 1][1] + 49) + 8), 'each drifts toward the Sluice (its head 8 m and more farther out)');
  const run = (seed, raftAt, secs = 900) => {
    const rng = F.faceRng(seed), B = A.createBoats(D, rng);
    const trace = [], ev = { launch: 0, gutter: 0, out: 0, sunk: 0 };
    let worst = Infinity, kEnd = 0, maxStep = 0, lastXZ = B.boats.map((b) => [b.x, b.z]);
    for (let i = 0, n = secs * 30; i < n; i++) {
      const t = i / 30, raft = raftAt(t);
      A.stepBoats(B, { dt: 1 / 30, raft, rng });
      B.boats.forEach((b, j) => {
        for (const e of b.events) ev[e] = (ev[e] || 0) + 1;
        if (b.events.includes('out')) kEnd = Math.max(kEnd, b.k);
        if (raft && b.mode !== 'wait') worst = Math.min(worst, Math.hypot(b.x - raft.x, b.z - raft.z));
        if (!b.events.includes('launch')) maxStep = Math.max(maxStep, Math.hypot(b.x - lastXZ[j][0], b.z - lastXZ[j][1]));
        lastXZ[j] = [b.x, b.z];
      });
      if (i % 30 === 0) trace.push(B.boats.map((b) => [+b.x.toFixed(3), +b.z.toFixed(3), b.mode]));
    }
    return { B, trace, worst, ev, kEnd, maxStep };
  };
  const far = () => ({ x: 0, z: 30 });
  const a = run(7, far), b = run(7, far), c = run(8, far);
  ok(a.B.boats.length === 6 && new Set(a.B.boats.map((q) => q.line)).size === 3, 'six boats on three lines');
  ok(JSON.stringify(a.trace) === JSON.stringify(b.trace) && JSON.stringify(a.trace) !== JSON.stringify(c.trace), 'seeded: the same seed drifts the same paths, another seed others');
  ok(a.ev.out >= 6 && a.ev.sunk >= 5 && a.ev.launch >= 5 && a.ev.gutter >= a.ev.out, `each gutters at the lip, sinks and another is launched (${JSON.stringify(a.ev)} in 15 min)`);
  ok(a.kEnd === 0, 'out at the line\'s end');
  ok(a.maxStep < 0.05, `slowly: never more than ${a.maxStep.toFixed(3)} m a frame`);
  {
    const rng = F.faceRng(3), B = A.createBoats(D, rng), bt = B.boats[0], Lh = B.lines[bt.line];
    bt.s = Lh.len - C.gutter - 0.01; bt.mode = 'drift';
    const ks = [];
    for (let i = 0; i < 30 * 30 && bt.mode !== 'sink'; i++) { A.stepBoats(B, { dt: 1 / 30, rng }); if (bt.mode === 'gutter') ks.push(bt.k); }
    ok(ks.length > 30 && ks[ks.length - 1] < 0.1 && Math.max(...ks.slice(-20)) < Math.max(...ks.slice(0, 20)), 'its flame wavers and dims as it gutters');
    ok(bt.mode === 'sink', 'then it sinks');
  }
  // the raft sails along each line, back and forth
  const sweep = (t) => { const Lh = lines[Math.floor(t / 60) % lines.length], u = (t % 60) / 60, s = (u < 0.5 ? u * 2 : 2 - u * 2) * Lh.len; const p = A.alongLine(Lh, s); return { x: p.x, z: p.z }; };
  const s = run(11, sweep, 540);
  ok(s.worst >= C.keep - 1e-6, `the raft pushes them aside: never within ${C.keep} m of it (closest ${s.worst.toFixed(2)} m)`);
  ok(A.createBoats(D, F.faceRng(1), 4).boats.length === 4, 'a tier can draw fewer');
  ok(A.flameLight('calm', 0.3) < A.flameLight('dusk', 0.5) && A.flameLight('dusk', 0.5) < A.flameLight('gloomtide', 0.5), 'their candles read faint by day, warm at dusk, full at night');
}

section('the gate\'s slits: flicker, and now and then one goes out and is lit again');
{
  const C = D.LOOP.ambient.slits;
  const run = (seed, secs = 600) => {
    const rng = F.faceRng(seed), S = A.createSlits(8, rng, C);
    let minK = 1, maxK = 0, multi = 0, outs = [], cur = null, steadyMin = 1, trace = [];
    for (let i = 0, n = secs * 30; i < n; i++) {
      A.stepSlits(S, 1 / 30, rng, C);
      const dark = Array.from(S.k).filter((k) => k < 0.05).length;
      if (dark > 1) multi++;
      for (let j = 0; j < 8; j++) { minK = Math.min(minK, S.k[j]); maxK = Math.max(maxK, S.k[j]); if (j !== S.out) steadyMin = Math.min(steadyMin, S.k[j]); }
      if (S.out >= 0 && (!cur || cur.i !== S.out)) { cur = { i: S.out, t0: i / 30, dark: 0 }; outs.push(cur); }
      if (S.out < 0) cur = null;
      if (cur && S.k[cur.i] < 0.02) cur.dark += 1 / 30;
      if (i % 15 === 0) trace.push(Array.from(S.k, (k) => +k.toFixed(3)));
    }
    return { minK, maxK, multi, outs, steadyMin, trace, S };
  };
  const a = run(5), b = run(5), c = run(6);
  ok(JSON.stringify(a.trace) === JSON.stringify(b.trace) && JSON.stringify(a.trace) !== JSON.stringify(c.trace), 'seeded');
  ok(a.steadyMin >= 1 - C.flicker - 1e-6 && a.steadyMin < 0.9 && a.maxK <= 1, `the lit ones flicker (${a.steadyMin.toFixed(2)}–${a.maxK.toFixed(2)})`);
  ok(a.outs.length >= 12 && a.outs.length <= 40, `one goes out now and then (${a.outs.length} in 10 min)`);
  ok(a.multi === 0, 'never two out at once');
  ok(a.outs.slice(0, -1).every((o) => o.dark >= C.out[0] - 0.05 && o.dark <= C.out[1] + 0.3), `out for ${C.out[0]}–${C.out[1]} s, then lit again`, a.outs.slice(0, 5));
  ok(a.outs.slice(1).every((o, i) => o.i !== a.outs[i].i), 'not the same one twice running');
  ok(new Set(a.outs.map((o) => o.i)).size >= 6, 'each in its turn');
  ok(A.slitOut(0, 4) === 1 && A.slitOut(A.SLIT_DOWN, 4) === 0 && A.slitOut(A.SLIT_DOWN + 3.9, 4) === 0 && A.slitOut(A.SLIT_DOWN + 4 + A.SLIT_RELIGHT, 4) === 1, 'it gutters out, is dark, catches and steadies');
  const wa = src('world-art.js');
  ok(/slitFx\.step\(dt\)/.test(wa) && /addUpdateRange/.test(wa) && /low \? 1 \/ 12 : 1 \/ 24/.test(wa), 'written into the landmark glows and their halos (no new call, a part-buffer upload, 12 a second on a phone)');
  ok(/if \(l\.slit\) l\.k = /.test(src('world.js')), 'a slit gone out: the moths\' lamp dims with it');
}

section('the drowned debris: in the middle-east water, clear of every place, lane and passage');
{
  const P = D.LOOP.ambient.debris, O = A.debrisObstacles(D, 'mossmere');
  ok(P.filter((p) => p.kind === 'roof').length >= 3 && P.filter((p) => p.kind === 'roof').length <= 4 && P.filter((p) => p.kind === 'rowboat').length === 1, 'a half-sunk rowboat and three or four rooftops');
  ok(O.every((o) => o.kind === 'debris' && o.r > 0.5), 'each a collision circle');
  ok(P.every((p) => p.x >= 25 && p.x <= 50 && p.z >= -15 && p.z <= 15), 'in the middle-east open water');
  ok(O.every((o) => nearestPlace(o.x, o.z) - o.r >= 8), `8 m and more off every place's water (${Math.min(...O.map((o) => nearestPlace(o.x, o.z) - o.r)).toFixed(1)} m)`);
  const lanes = { circles: avoid.circles.filter((c) => c.kind !== 'post'), segs: avoid.segs };   // (the dock posts: in the 4 m gaps below)
  ok(O.every((o) => F.clearanceOf(lanes, o.x, o.z) - o.r >= 6 && gateLane(o.x, o.z) - o.r >= 6), `and off the mooring, the glide-in and the gate's lane (${Math.min(...O.map((o) => F.clearanceOf(lanes, o.x, o.z) - o.r)).toFixed(1)} m)`);
  const others = [...L.obstacles, ...L.gateObstacles];
  const gaps = [];
  for (let i = 0; i < O.length; i++) {
    for (let j = i + 1; j < O.length; j++) gaps.push(Math.hypot(O[i].x - O[j].x, O[i].z - O[j].z) - O[i].r - O[j].r);
    for (const q of others) gaps.push(Math.hypot(O[i].x - q.x, O[i].z - q.z) - O[i].r - q.r);
  }
  ok(Math.min(...gaps) >= 4, `every gap between them and the rock, pillars and docks 4 m and more: the raft (3.2 m across) never wedges (${Math.min(...gaps).toFixed(2)} m)`);
  ok(O.every((o) => fromShore(o.x, o.z) - o.r >= 8), 'well off the shore');
  const lines = D.LOOP.ambient.boats.lines.map(A.lineOf);
  ok(O.every((o) => lines.every((Lh) => { for (let s = 0; s <= Lh.len; s += 0.5) { const p = A.alongLine(Lh, s); if (Math.hypot(p.x - o.x, p.z - o.z) < o.r + 4) return false; } return true; })), 'and off the boats\' lines');
  const heronRoost = D.LOOP.wildlife.heron.roost, birds = D.LOOP.wildlife.lampbills.groups;
  ok(O.every((o) => heronRoost.every((r) => Math.hypot(r.x - o.x, r.z - o.z) > o.r + 4) && birds.every((g) => Math.hypot(g.x - o.x, g.z - o.z) > o.r + g.r + 4)), 'and off the heron\'s roosts and the lampbills\' beats');
  const K = { rock: [0.1, 0.1, 0.2], rockHi: [0.2, 0.2, 0.3], stone: [0.5, 0.5, 0.6], moss: [0.2, 0.2, 0.3], wood: [0.1, 0.08, 0.06], woodHi: [0.2, 0.15, 0.1], bone: [0.7, 0.7, 0.8] };
  const G = A.debrisGeos(P, K);
  const tris = [...G.rock, ...G.org].reduce((s, g) => s + (g.index ? g.index.count : g.attributes.position.count) / 3, 0);
  ok(G.rock.length >= 4 && G.org.length >= 1 && tris < 1200, `merged into the stone and timber statics (no call of its own; ${Math.round(tris)} tris)`);
  ok([...G.rock, ...G.org].every((g) => g.attributes.color && g.attributes.normal), 'each with its colours and normals');
  {
    // the roofs' slopes face out and up (wound outward: lit by the key light, their ink line outside), the gables out along the ridge
    const R = A.debrisGeos(P.filter((p) => p.kind === 'roof').map((p) => ({ ...p, x: 0, z: 0, yaw: 0, chimney: false, broken: false })), K).rock;
    let down = 0, slopes = 0, inward = 0;
    for (const g of R) { const N = g.attributes.normal, Q = g.attributes.position; for (let i = 0; i < N.count; i++) { if (Math.abs(N.getY(i)) > 0.2) { slopes++; if (N.getY(i) < 0) down++; if (N.getX(i) * Q.getX(i) < -1e-6) inward++; } } }
    ok(slopes > 0 && down === 0 && inward === 0, `the roofs' slopes face out and up (${slopes} vertices; ${down} down, ${inward} inward)`);
  }
}

section('nothing to do with the catch; drawn cheaply');
{
  const ws = src('world-ambient.js');
  ok(!/fishing|castOdds|rollSpecies|progression|hookWeights|finishPool|bait/i.test(ws.replace(/^\/\/.*$/gm, '')), 'it reads no fishing, odds, bait or progression');
  ok((ws.match(/new THREE\.InstancedMesh\(/g) || []).length === 2 && (ws.match(/createHalos\(/g) || []).length === 1 && (ws.match(/q0 !== 'low'/g) || []).length === 2 && (ws.match(/!ctx\.cinematic && !show;/g) || []).length === 2,
    'one InstancedMesh and one Points (2 calls) on the Mossmere, one InstancedMesh (Sporewood\'s gill-flakes, LAKE 2) on Sporewood; each hidden on low and in a cinematic or the show');
  ok(/setupSurface\(mesh, \{ cast: false, reflect: false \}\)/.test(ws) && !/REFLECT_LAYER/.test(ws), 'no shadow, and nothing of theirs in the mirror (no glitter on the water)');
}

console.log(`\nambient: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
