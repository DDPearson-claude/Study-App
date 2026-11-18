// LAKE 2, lane W2 (docs/loop/LAKE2.md §1A, §3.3–§3.6, §9): Sporewood's art, the ember garden made green. Pure checks and one arena build.
//   node tools/tests/lake2-w2.test.mjs            (or node tools/check.mjs)
// The look's keys inside WATERS' caps; the kit's plan (its counts by tier, every plant where its kind grows, the lens's side kept low,
// the places, the mooring and the glides clear, fireflies never over open water, deterministic); the water's masks; the lens's profile;
// the frogs' beats and the flakes' lines on the water; Sporewood's arena built with its kit and landmarks, in budget; the Mossmere and
// the flag-off game never reach any of it (outline-shore.test.mjs part 1 pins the Mossmere's geometry as it was).
const sink = () => new Proxy(function () {}, { get: (t, k) => (k === 'data' ? new Uint8ClampedArray(4) : k === 'width' || k === 'height' ? 1 : k === Symbol.toPrimitive ? () => 0 : sink()), apply: () => sink(), set: () => true });
globalThis.Path2D = globalThis.Path2D || class { constructor() {} };
globalThis.document = globalThis.document || { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => sink(), toDataURL: () => '' }) };

const D_OFF = await import('../../src/data.js?w2Off');
globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; globalThis.GW_LOOP = true;
const D = await import('../../src/data.js?w2Loop');
const WL = await import('../../src/world-layout.js');
const WO = await import('../../src/world-outline.js');
const FL = await import('../../src/world-flora.js');
const SW = await import('../../src/world-sporewood.js');
const WF = await import('../../src/watercraft-face.js');
const WC = await import('../../src/watercraft.js');
const RC = await import('../../src/render-camera.js');
const AW = await import('../../src/actors-wildlife.js');
const AM = await import('../../src/world-ambient.js');
const { buildArena } = await import('../../src/world-art.js');

let pass = 0, fail = 0;
const ok = (c, msg, extra) => { if (c) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra).slice(0, 600) : ''); } };
const section = (s) => console.log(`- ${s}`);
const hsv = (hex) => { const r = ((hex >> 16) & 255) / 255, g = ((hex >> 8) & 255) / 255, b = (hex & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0; if (d > 0) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = ((h * 60) + 360) % 360; return { h, s: mx > 0 ? d / mx : 0, v: mx }; };

// ------------------------------------------------------------------ the look
section('the look: ZONE_LOOKS.sporewood inside WATERS\' caps, read only under the loop');
const LK = D.ZONE_LOOKS.sporewood;
ok(FL.lushLook(D, 'sporewood') === LK && FL.lushLook(D, 'mossmere') === null && FL.lushLook(D_OFF, 'sporewood') === null, 'the kit is on for Sporewood under the loop only: never the Mossmere, never off the loop');
ok(Math.abs(LK.lush - 0.33) < 1e-9 && LK.step === 5, 'lush 0.33, step 5 (LAKE2 §1A: the one exception to the ramp\'s step rule, WATERS §7)');
{
  const cap = Math.min(0.62, 0.25 + 0.04 * LK.step);
  for (const k of ['leafDark', 'leaf', 'leafHi', 'moss2', 'mossG', 'mossGHi']) { const c = hsv(LK[k]); ok(c.s <= cap + 0.005 && c.v <= 0.7 && c.h >= 65 && c.h < 160, `${k} #${LK[k].toString(16)} a leaf key inside the step-5 cap (s ${c.s.toFixed(2)} ≤ ${cap.toFixed(2)}, v ${c.v.toFixed(2)} ≤ 0.70, green)`); }
  const mid = hsv(LK.leaf); ok(mid.h >= 82 && mid.h <= 135, `the mid leaf's hue ${mid.h.toFixed(0)} in 82–135`);
  const ff = hsv(LK.fireflies); ok(ff.h >= 55 && ff.h <= 80 && ff.s <= 0.4, `the fireflies pale lime (hue ${ff.h.toFixed(0)}, s ${ff.s.toFixed(2)})`);
  const P = D.ZONES.find((z) => z.id === 'sporewood').palette, Poff = D_OFF.ZONES.find((z) => z.id === 'sporewood').palette;
  // (LAKE 2, the art pass: under the loop Sporewood wears its own air, pulled to green by the user's words; off the loop the ember garden's)
  ok(JSON.stringify(P) === JSON.stringify({ ...Poff, ...LK.air.palette }) && JSON.stringify(P) !== JSON.stringify(Poff), 'under the loop the palette is the ember garden\'s with Sporewood\'s own air laid over it; off the loop as built');
  for (const k of ['fog', 'water', 'waterDeep', 'ink', 'ambient']) { const c = hsv(P[k]); ok(c.v <= 0.4 && (c.v < 0.1 || c.s <= 0.6), `the air's ${k} keeps Clear Night's darkness (v ${c.v.toFixed(2)}, s ${c.s.toFixed(2)})`); }
  ok(P.glow === Poff.glow && P.candle === Poff.candle && P.accent === Poff.accent, 'its amber glow, its candle and its rose accent as built');
  ok(Object.values(LK.flora).every((n) => Number.isInteger(n) && n >= 0) && LK.tiers.medium === 0.7 && LK.tiers.low === 0.4, 'the kit\'s counts on high; medium 0.7×, low 0.4×');
}

// ------------------------------------------------------------------ the plan
section('the kit\'s plan on Sporewood\'s outline (pure, seeded)');
const Z = D.ZONES.find((z) => z.id === 'sporewood'), L = WL.buildLayout(Z), O = L.outline;
const avoid = WF.avoidList(L, D, 'sporewood');
const glides = Object.values(D.LOOP.places).filter((p) => p.water === 'sporewood').map((p) => p.out).concat([D.LOOP.tutorial.outPath.sporewood]);
const cam = D.LOOP.mooring.sporewood.cam, lens = [{ x: cam.pos[0], z: cam.pos[2], r: 3 }];
const opts = (tier) => ({ tier, avoid, glides, geo: WC.WATERCRAFT.sporewood.geometry, lens, caps: [], extra: [], rafts: D.LOOP.wildlife.sporewood.frogs.groups });
const P = FL.floraPlan(L, LK, opts('high')), P2 = FL.floraPlan(L, LK, opts('high'));
ok(JSON.stringify(P) === JSON.stringify(P2), 'deterministic: the same plan twice (its own stream, L.artSeed ^ 0xF10A)');
const n = (k) => P.counts[k] || 0;
ok(n('cushion') >= LK.flora.moss * 0.95, `moss cushions and carpets (${n('cushion')} of ${LK.flora.moss})`);
ok(n('fern') + n('fernUp') + n('tfern') >= LK.flora.ferns * 0.9, `ferns (${n('fern') + n('fernUp') + n('tfern')} of ${LK.flora.ferns})`);
ok(n('reed') + n('sedge') >= LK.flora.reeds * 0.9, `reeds and sedge (${n('reed') + n('sedge')} of ${LK.flora.reeds})`);
ok(n('pad') + n('capleaf') >= LK.flora.pads * 0.85 && P.flowers.length >= LK.flora.flowers * 0.8, `lily and leaf rafts (${n('pad') + n('capleaf')} of ${LK.flora.pads}), flowers (${P.flowers.length})`);
ok(n('bush') >= LK.flora.bushes * 0.85 && n('tree') === LK.flora.trees && n('crown') >= LK.flora.crowns * 0.85, `shrubs ${n('bush')}, broadleaf ${n('tree')}, far crowns ${n('crown')}`);
ok(P.fireflies.length === LK.flora.fireflies, `fireflies (${P.fireflies.length})`);
{
  const M = FL.floraPlan(L, LK, opts('medium')), Lo = FL.floraPlan(L, LK, opts('low'));
  ok(Math.abs(M.items.length / P.items.length - 0.7) < 0.08 && Math.abs(Lo.items.length / P.items.length - 0.4) < 0.08, `medium ≈ 0.7×, low ≈ 0.4× (${P.items.length} · ${M.items.length} · ${Lo.items.length})`);
}
{
  const land = ['cushion', 'fern', 'fernUp', 'tfern', 'sedge', 'bush', 'tree', 'crown'], water = ['reed', 'pad', 'capleaf'], tall = ['tree', 'bush', 'tfern'];
  const g = { x: 0, z: 0 };
  let wet = 0, dry = 0, clear = 0, lensSide = 0, groundBad = 0;
  for (const it of P.items) {
    const s = WO.sdfAt(O, it.x, it.z);
    if (land.includes(it.k) && s > -0.1) wet++;
    if (water.includes(it.k) && s < 0.2) dry++;
    if (water.includes(it.k) && WF.clearanceOf({ circles: avoid.circles, segs: avoid.segs.concat(glides.flatMap((q) => q.slice(1).map((b, i) => ({ ax: q[i][0], az: q[i][1], bx: b[0], bz: b[1], r: 1.6 })))) }, it.x, it.z) < FL.FLORA.keepWater - 1e-6) clear++;
    if (tall.includes(it.k)) { WO.sdfGrad(O, it.x, it.z, g); if (-g.z > FL.FLORA.camSide && -s < FL.FLORA.camSideBack - 2) lensSide++; }
    if (land.includes(it.k) && Math.abs(it.y - Math.max(0, WO.groundAt(O, it.x, it.z))) > 0.6) groundBad++;
  }
  ok(wet === 0, `every land plant on land (${wet} in the water)`);
  ok(dry === 0, `every reed and pad in the water (${dry} on land)`);
  ok(clear === 0, `reeds and pads keep ${FL.FLORA.keepWater} m off the places, the mooring and every glide (${clear} inside)`);
  ok(lensSide === 0, `no tree, shrub or tree-fern on the lens's side of the water near it (${lensSide})`);
  ok(groundBad === 0, `every land plant stands on the ground (${groundBad} off it)`);
  // (each over a reed, a sedge, a fern or a shrub: within 1.2 m of its foot and 0.3–3 m over it; so never over open water)
  const hosts = P.items.filter((it) => ['reed', 'sedge', 'fern', 'fernUp', 'bush'].includes(it.k));
  const ffBad = P.fireflies.filter((f) => !hosts.some((h) => Math.hypot(h.x - f.x, h.z - f.z) <= 1.2 && f.y - h.y >= 0.3 && f.y - h.y <= 3));
  ok(ffBad.length === 0, `fireflies over the reeds, ferns and shrubs, 0.4–3 m up, never over open water (${ffBad.length} not)`);
  // the reeds lie where the water's reed areas are (the art is where the fishing reads it)
  const reeds = P.items.filter((it) => it.k === 'reed');
  let inRuns = 0;
  for (const it of reeds) { const u = WO.alongAt(O, it.x, it.z); const onRun = WC.WATERCRAFT.sporewood.geometry.reedRuns.some(([a, b]) => u >= a - 0.05 && u <= b + 0.05); const isle = u < 0; if (onRun || isle) inRuns++; }
  ok(inRuns === reeds.length, `every reed on a reed run or round a reed isle (${inRuns} of ${reeds.length})`);
}

// ------------------------------------------------------------------ the water's masks and the lens
section('the water\'s masks (the moon coins\' dapple, the weed film) and the lens\'s profile');
{
  const far = FL.lushMasks(LK, -40, 5, 30, 0.8), near = [], deep = FL.lushMasks(LK, -40, 5, 4, 0.9);
  for (let i = 0; i < 200; i++) near.push(FL.lushMasks(LK, -60 + i * 0.37, 30 + (i % 7), 2 + (i % 9), 0.15));
  ok(far.dapple === 1 && far.weed === 0, 'open water far from the banks: the moon whole, no weed');
  ok(near.every((m) => m.dapple >= 0 && m.dapple <= 1 && m.weed >= 0 && m.weed <= 1) && near.some((m) => m.dapple < 0.6) && near.some((m) => m.dapple > 0.9) && near.some((m) => m.weed > 0.3), 'by the banks: shade with moon coins in it, a weed film in patches');
  ok(deep.weed === 0, 'no weed over deep water');
}
{
  const t0 = { elev: 24, dist: 15, aim: 6.5, aimY: 1.4, fov: 52 }, a = { ...t0 }, b = { ...t0 }, c = { ...t0 };
  RC.waterLens(a, null, { x: 0, z: 0 });
  ok(JSON.stringify(a) === JSON.stringify(t0), 'a water with no profile (the Mossmere): the lens exactly as it was');
  const prof = D.LOOP.camera.sporewood;
  RC.waterLens(b, prof, { x: 40, z: 20 });
  ok(Math.abs(b.dist - 15 * prof.eye) < 1e-9 && b.fov === 52 + prof.fov && b.elev === 24, `Sporewood's open water: the distance × ${prof.eye}, the fov + ${prof.fov}°`);
  RC.waterLens(c, prof, { x: prof.neck.x, z: prof.neck.z });
  ok(Math.abs(c.dist - 15 * prof.eye * prof.neck.eye) < 1e-9 && Math.abs(c.elev - (24 - prof.neck.elev)) < 1e-9, 'in the neck: closer still, and a little steeper (its south bank out of the frame\'s foot)');
  ok(D_OFF.LOOP.camera?.mossmere === undefined && D.LOOP.camera.mossmere === undefined, 'the Mossmere has no profile');
}

// ------------------------------------------------------------------ the life
section('the frogs\' beats and the gill-flakes\' lines lie on the water, clear of the glides');
{
  const segD = (x, z, a, b) => { const vx = b[0] - a[0], vz = b[1] - a[1], L2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((x - a[0]) * vx + (z - a[1]) * vz) / L2)); return Math.hypot(x - a[0] - vx * t, z - a[1] - vz * t); };
  const glideD = (x, z) => Math.min(...glides.flatMap((g) => g.slice(1).map((q, i) => segD(x, z, g[i], q))));
  const F = D.LOOP.wildlife.sporewood.frogs;
  ok(F.groups.every((g) => WL.shoreDist(L, g.x, g.z) > 2 && glideD(g.x, g.z) >= 6 && WF.clearanceOf(avoid, g.x, g.z) >= 6), 'the frogs\' beats: on the water, 6 m and more off the glides, the places and the mooring', F.groups.map((g) => [glideD(g.x, g.z).toFixed(1), WF.clearanceOf(avoid, g.x, g.z).toFixed(1)]));
  const B = AW.createLampbills(D, WF.faceRng(7), null, F);
  ok(B.birds.length === F.groups.reduce((a, g) => a + g.n, 0) && B.C === F, 'the frogs keep the lampbills\' ways (createLampbills on their own data)');
  for (let i = 0; i < 400; i++) AW.stepLampbills(B, { dt: 0.1, raft: { x: -54, z: 27 }, phase: 'calm', rng: WF.faceRng(i + 3) });
  ok(B.birds.every((b) => WL.shoreDist(L, b.x, b.z) > 0.5) && B.birds.some((b) => b.flees > 0), 'they stay on the water, and plop in as the raft comes near');
  const FC = D.LOOP.ambient.sporewood.flakes;
  ok(FC.lines.every((ln) => ln.every(([x, z]) => WL.shoreDist(L, x, z) > 0.3 && glideD(x, z) >= 5)), 'the flakes\' lines on the water to the Root Weir, 5 m and more off the glides');
  const Bf = AM.createBoats(D, WF.faceRng(5), null, FC);
  ok(Bf.boats.length === FC.count.high && Bf.C === FC, 'the flakes drift as the candle-boats do (createBoats on their own data)');
}

// ------------------------------------------------------------------ the arena
section('Sporewood\'s arena under the loop: the kit and the landmarks built, in budget; the Mossmere has none');
{
  const ctx = { data: D, render: { isStub: true }, state: { meta: { settings: {} } } };
  const t0 = performance.now();
  const A = buildArena(ctx, WL.buildLayout(Z), { quality: 'high', far: 500, loop: true, redress: true });
  const ms = performance.now() - t0;
  const fl = A.lush?.flora, art = A.lush?.art;
  ok(!!fl && !!art, 'the kit and the landmarks are built');
  ok(fl.cells <= 12 && fl.meshes <= 14, `the kit in at most 3 × 2 cells × 2 materials, and the flowers and the fireflies (${fl.cells} cells, ${fl.meshes} meshes)`);
  // (LAKE 2, the art pass: the shrubs', the trees' and the far crowns' soft lobed masses (rounder, a leafy edge) and their leaf cards, the
  // user's "blocky shrubs", cost about 36k more on high; medium 0.7×, low 0.4×, and the draws unchanged: clarity-perf --loop --sporewood
  // measures the frame)
  ok(fl.tris < 70000, `the kit's triangles on high (${fl.tris}; the design's about 23k for its plants, the strands, the landmarks' moss and the soft leaf masses on top)`);
  ok(art.rim >= 8 && art.mother && art.harp.length === 2 && art.veil?.strands > 30 && art.seep && art.groves === 5 && art.capTrees >= 10 && art.landing, 'the cap-rim window, the Mother Cap, the Gill Harp\'s two caps, the Veil\'s curtain, the Seep, five Lantern groves, the cap trees, Rootfoot Landing', art);
  ok(A.capLamps.length >= 10 && A.capLamps.every((l) => l.kind === 'cap'), `the glowcaps are the spore moths' lamps (${A.capLamps.length})`);
  ok(art.veil.w < 16, `the Veil hangs across the inlet's mouth (${art.veil.w} m across)`);
  console.log(`  (the arena built in ${ms.toFixed(0)} ms in node, its kit in ${fl.buildMs} ms; the browser's figure is clarity-perf's)`);
  A.dispose();
  const M = buildArena({ data: D, render: { isStub: true }, state: { meta: { settings: {} } } }, WL.buildLayout(D.ZONES.find((z) => z.id === 'mossmere')), { quality: 'high', far: 500, loop: true, redress: true });
  ok(M.lush === null && M.capLamps.length === 0, 'the Mossmere: no kit, no glowcap lamps');
  M.dispose();
  const Off = buildArena({ data: D_OFF, render: { isStub: true }, state: { meta: { settings: {} } } }, WL.buildLayout(D_OFF.ZONES.find((z) => z.id === 'sporewood')), { quality: 'high', far: 500 });
  ok(Off.lush === null, 'Sporewood off the loop (the flag-off game): no kit');
  Off.dispose();
}
{
  const m = SW.narrowest(O, D.LOOP.places.veilwater.out.slice(-3), 0.15, 0.85);
  ok(!!m && m.w > 6 && m.w < 16 && WO.sdfAt(O, m.x, m.z) > 1, 'the Veil\'s mouth found on the Veilwater\'s glide: the inlet\'s narrowest crossing', m && { x: m.x, z: m.z, w: m.w });
}

console.log(`\nlake2-w2: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
