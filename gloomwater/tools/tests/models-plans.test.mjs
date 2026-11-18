// T147 (docs/loop/m1-step3a/PLAN.md): the loop's three new fish plans in models-fish.js, built in node with the real factory; and LAKE 2
// lane F's (docs/loop/LAKE2.md §2.3): Sporewood's fourteen looks, each unlike its Mossmere relative, the Mossmere's fish pinned as before.
//   node tools/tests/models-plans.test.mjs        (or node tools/check.mjs)
// Under the loop createFish builds `lamprey` (no jaw or paired fins, a toothed disc mouth, seven gill holes lit lavender), `sturgeon`
// (scutes, a shovel snout) and `trout` (a fatty fin, a jaw); each species' true length is within 2% of its size model; the show holds the
// lamprey as an eel (poseRules.thin). Off the loop a species with one of those shapes draws as today's fallback (PLAN CHOICE 14).
// The file re-runs itself in a child process for the flag-off build (GW_MP_MODE=off): data.js reads its flags at import.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';

const MODE = process.env.GW_MP_MODE || 'loop';
const sink = () => new Proxy(function () {}, { get: (t, k) => (k === 'data' ? new Uint8ClampedArray(4) : k === 'width' || k === 'height' ? 1 : k === Symbol.toPrimitive ? () => 0 : sink()), apply: () => sink(), set: () => true });
globalThis.Path2D = globalThis.Path2D || class { constructor() {} };
globalThis.document = globalThis.document || { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => sink(), toDataURL: () => '' }) };
globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = MODE === 'p2' ? 2 : 1;
if (MODE === 'loop') globalThis.GW_LOOP = true;
const data = await import(`../../src/data.js?mp${MODE}`);
const { createFishFactory, LOOP_SHAPES, loopPlanParts } = await import('../../src/models-fish.js');
const { trueLengthM } = await import('../../src/models-size.js');

let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log('  FAIL:', msg); } };
const section = (s) => console.log(`- [${MODE}] ${s}`);
const ctx = { data, state: { meta: {}, run: { zone: 'mossmere' } } };
const F = createFishFactory(ctx);
/** The fish's drawn length along its axis (m): the object's box over body, fins and every extra. */
function drawnLength(fish) {
  fish.object3d.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(fish.object3d);
  return b.max.z - b.min.z;
}
const meshes = (fish) => { const out = {}; fish.object3d.traverse((o) => { if (o.isMesh) out[o.name || 'anon'] = o; }); return out; };
/** LAKE 2, lane F: a fish's geometry as one number (every mesh's positions, sampled), its triangles and whether any position is NaN. */
function geoHash(o) { let h = 0; o.traverse((m) => { if (m.isMesh) { const a = m.geometry.attributes.position.array; for (let i = 0; i < a.length; i += 7) h = (h * 31 + Math.round(a[i] * 1e5)) | 0; h = (h * 31 + a.length) | 0; } }); return h; }
function triStats(o) { let t = 0, n = 0, nan = false; o.traverse((m) => { if (!m.isMesh) return; n++; const g = m.geometry; t += (g.index ? g.index.count : g.attributes.position.count) / 3; for (const v of g.attributes.position.array) if (!Number.isFinite(v)) { nan = true; break; } }); return { tris: Math.round(t), meshes: n, nan }; }
/** The drawn length over what the size model calls length: the body and its fins (a disc: and its tail, an extra), never whiskers or antennae. */
function bodyLength(fish) {
  fish.object3d.updateMatrixWorld(true);
  const b = new THREE.Box3(), keep = new Set(['body', 'fins', 'fins_tint', ...(fish.shape === 'disc' ? ['extras'] : [])]);
  fish.object3d.traverse((o) => { if (o.isMesh && keep.has(o.name)) b.expandByObject(o); });
  return b.max.z - b.min.z;
}

if (MODE === 'loop') {
  section('the loop\'s three plans join the factory');
  ok(data.LOOP_ENABLED === true, 'a loop build');
  for (const s of ['lamprey', 'sturgeon', 'trout']) ok(F.shapes.includes(s), `the factory knows ${s}`);
  ok(Object.keys(LOOP_SHAPES).sort().join() === 'bream,catfish,disc,finlet,lamprey,sturgeon,trout', 'LOOP_SHAPES holds the three plans (M1 step 4: and the catfish; LAKE 2 lane F: the bream, the disc and the finlet)');

  const cases = [['hullkiss_lamprey', 'lamprey'], ['bridgechain_sturgeon', 'sturgeon'], ['kissmark_trout', 'trout'], ['thousandcast_pike', 'pike']];
  for (const [id, shape] of cases) {
    section(`${id}: its plan, its true length`);
    const sp = data.SPECIES_BY_ID[id];
    ok(!!sp, `${id} is a loop species`);
    if (!sp) continue;
    ok(sp.model?.shape === shape, `${id} is drawn on the ${shape} plan`);
    for (const z of [-1, 0, 1.5]) {
      const fish = F.createFish(sp, { z });
      ok(fish.shape === shape, `${id} z ${z}: createFish builds the ${shape} plan (got ${fish.shape})`);
      const L = trueLengthM(sp, { z }, { data, zone: 'mossmere' });
      ok(L > 0 && Math.abs(fish.length - L) / L < 1e-9, `${id} z ${z}: its length is the size model's (${fish.length} vs ${L})`);
      const d = drawnLength(fish);
      ok(Math.abs(d - L) / L <= 0.02, `${id} z ${z}: the drawn length within 2% of the size model (${d.toFixed(4)} vs ${L.toFixed(4)})`);
    }
  }

  // M1 step 4 (lane 4): the Belled Matriarch on the catfish plan (a flat head, two long whiskers, the bell in her skull), at her size
  section('the Matriarch: the catfish plan, her true length');
  { const sp = data.SPECIES_BY_ID.belled_matriarch;
    ok(sp?.model?.shape === 'catfish' && F.shapes.includes('catfish'), 'the Belled Matriarch is drawn on the catfish plan');
    const cf = LOOP_SHAPES.catfish({ ...sp.model });
    ok(cf.f.w(0.05) / Math.max(1e-6, cf.f.ht(0.05)) > 1.6, 'a broad flat head');
    ok(cf.extras.length >= 8, 'whiskers, chin barbels, the mouth and the bell');
    for (const z of [0, 1]) {
      const fish = F.createFish(sp, { z });
      ok(fish.shape === 'catfish', `z ${z}: createFish builds the catfish (got ${fish.shape})`);
      const L = trueLengthM(sp, { z }, { data, zone: 'mossmere' });
      const d = drawnLength(fish);
      ok(L > 1 && Math.abs(d - L) / L <= 0.02, `z ${z}: the drawn length within 2% of the size model (${d.toFixed(3)} vs ${L.toFixed(3)})`);
    } }

  section('the lamprey: a disc mouth, no jaw, no paired fins, seven gill holes lit lavender');
  const M = { ...data.SPECIES_BY_ID.hullkiss_lamprey.model };
  const lp = LOOP_SHAPES.lamprey(M);
  ok(lp.gill === -1, 'no gill arcs and no mouth line painted (no jaw)');
  ok(lp.glows.length === 14, `seven lit gill holes a side (got ${lp.glows.length})`);
  ok(lp.opts.glowCol === 0xb8b0ee, 'the gill holes light lavender (gillGlow)');
  const lamprey = F.createFish('hullkiss_lamprey', { z: 0 });
  const lm = meshes(lamprey);
  ok(!!lm.glow && lm.glow.material.color.getHex() !== 0, 'the gill holes are a glow mesh');
  const gc = new THREE.Color(0xb8b0ee).multiplyScalar(2.6), lc = lm.glow?.material.color;
  ok(lc && Math.abs(lc.r - gc.r) < 1e-3 && Math.abs(lc.b - gc.b) < 1e-3, 'lit in the gill colour, not the default amber');
  ok(!!lm.extras, 'the disc, its teeth and the pits are drawn');
  // no paired fins: every fin card sits on the body's midline (x = 0)
  const fx = lm.fins?.geometry.attributes.position;
  let maxX = 0; if (fx) for (let i = 0; i < fx.count; i++) maxX = Math.max(maxX, Math.abs(fx.getX(i)));
  ok(fx && maxX < 1e-6, `no paired fins: every fin on the midline (max |x| ${maxX})`);
  ok(data.SPECIES_BY_ID.hullkiss_lamprey.model.glow === null, 'no glow on its body');
  ok((data.AUTOFISH.show.poseRules.thin || []).includes('lamprey'), 'the show holds it as a thin fish (poseRules.thin)');

  section('the sturgeon: scutes, a shovel snout');
  const st = LOOP_SHAPES.sturgeon({ ...data.SPECIES_BY_ID.bridgechain_sturgeon.model });
  ok(st.opts.shovel === true, 'the shovel snout (snout: shovel)');
  ok(st.f.w(0.02) / Math.max(1e-6, st.f.ht(0.02)) > 3, 'the snout is wide and flat');
  ok(st.extras.length >= 6, 'barbels, scutes and the mouth line');
  const bs = data.SPECIES_BY_ID.bridgechain_sturgeon;
  ok(bs.model.scutes === 'rust' && bs.model.snout === 'shovel', 'the Bridgechain\'s plan parameters (ROSTER_ART, merged under the loop)');

  section('the trout: a fatty fin, a jaw, star-spots and one scar');
  const tr = LOOP_SHAPES.trout({ ...data.SPECIES_BY_ID.kissmark_trout.model });
  ok(tr.opts.stars === true && tr.opts.scar === true, 'star-spots and the scar painted');
  ok(tr.extras.length === 3, 'the fatty fin and the jaw\'s line on each side');
  ok(tr.gill > 0, 'a gill arc and a mouth (a plain jaw)');

  section('the pike\'s loop parameters (the Thousandcast)');
  const pk = F.createFish('thousandcast_pike', { z: 0 });
  ok(!!meshes(pk).extras, 'the amber eye rims are drawn');
  const reed = F.createFish('reedjaw_pike', { z: 0 });
  ok(!meshes(reed).extras, 'a pike with no loop parameters is drawn as built');


  // ---- LAKE 2, lane F (docs/loop/LAKE2.md §2.3): Sporewood's fourteen looks, each built, in budget, at its true length, and each unlike
  // its Mossmere relative; the Mossmere's own fish byte-for-byte as before the lane (their geometry pinned at gw-lake2 85e6fb6)
  section('LAKE 2 lane F: the fourteen build, in budget, at their true length');
  const SW = ['drifting_grove', 'harpstring_eel', 'festival_puffer', 'lostsea_mackerel', 'downcast_catfish', 'nightbloom_carp', 'mildew_angler', 'sleepspore_jelly',
    'threadling_eel', 'cindertail_catfish', 'velvet_ray', 'falsesmile_barb', 'netcloud_fry', 'capshell_crayfish'];
  const PLAN = { drifting_grove: 'disc', velvet_ray: 'disc', falsesmile_barb: 'bream', lostsea_mackerel: 'finlet', harpstring_eel: 'eel', threadling_eel: 'eel',
    downcast_catfish: 'catfish', cindertail_catfish: 'catfish', nightbloom_carp: 'carp', netcloud_fry: 'minnow', capshell_crayfish: 'crayfish', festival_puffer: 'puffer',
    mildew_angler: 'angler', sleepspore_jelly: 'jelly' };
  const built = {};
  for (const id of SW) {
    const sp = data.SPECIES_BY_ID[id];
    if (!ok(!!sp && sp.zone === 'sporewood', `${id}: a loop record of Sporewood`)) continue;
    ok(sp.model.shape === PLAN[id] && F.shapes.includes(PLAN[id]), `${id}: drawn on the ${PLAN[id]} plan (got ${sp.model.shape})`);
    for (const z of sp.rarity === 'legendary' ? [0] : [-1, 0, 1.5]) {
      const fish = F.createFish(sp, { z }), T = triStats(fish.object3d);
      ok(fish.shape === PLAN[id], `${id} z ${z}: createFish builds the ${PLAN[id]} (got ${fish.shape})`);
      ok(!T.nan, `${id}: no NaN in any mesh`);
      const cap = sp.rarity === 'legendary' ? 14000 : 10000;
      if (z === 0) ok(T.tris <= cap && T.meshes <= 8, `${id}: ${T.tris} triangles in ${T.meshes} meshes (≤ ${cap} and ≤ 8, the show's one fish)`);
      const L = trueLengthM(sp, { z }, { data, zone: 'sporewood' }), d = bodyLength(fish);
      ok(L > 0 && Math.abs(fish.length - L) / L < 1e-9 && Math.abs(d - L) / L <= 0.02, `${id} z ${z}: the drawn length within 2% of the size model (${d.toFixed(4)} vs ${L.toFixed(4)})`);
      if (z === 0) built[id] = fish;
    }
  }
  // glow only where the brief names it: the Harpstring's strings, the Festival Puffer's lantern, the Grove's gills, the Nightbloom's bloom
  // (and the kept Angler's and Jelly's, as built)
  const lit = SW.filter((id) => data.SPECIES_BY_ID[id]?.model?.glow != null).sort();
  ok(lit.join() === 'drifting_grove,festival_puffer,harpstring_eel,mildew_angler,nightbloom_carp,sleepspore_jelly', `glow only where the brief names it (${lit.join(', ')})`);

  section('LAKE 2 lane F: each unlike its Mossmere relative (LAKE2 §2.3, the user\'s rule)');
  const parts = (id) => loopPlanParts(data.SPECIES_BY_ID[id].model);
  const fishOf = (id) => built[id] || F.createFish(data.SPECIES_BY_ID[id], { z: 0 });
  const girth = (id) => { const fv = fishOf(id), s = fv.section(0.5); return (2 * s.halfW) / fv.length; };
  { // eels: the Harpstring a rope (1.5× the Gloam's girth, no back fin, a paddle head wider than its neck, lit strings); the Threadling a cord
    ok(girth('harpstring_eel') > girth('gloam_eel') * 1.35, `the Harpstring is a rope: girth ${girth('harpstring_eel').toFixed(3)} against the Gloam's ${girth('gloam_eel').toFixed(3)}`);
    ok(girth('threadling_eel') < girth('gloam_eel') * 0.6, `the Threadling is a cord: girth ${girth('threadling_eel').toFixed(3)} against the Gloam's ${girth('gloam_eel').toFixed(3)}`);
    const h = fishOf('harpstring_eel'), hs = h.section(0.03), hn = h.section(0.1);
    ok(hs.halfW > hn.halfW && hs.top - hs.bottom < (hs.halfW * 2), 'the Harpstring\'s head: a flat paddle, wider than its neck');
    const fy = meshes(h).fins?.geometry.attributes.position;
    let above = 0; if (fy) for (let i = 0; i < fy.count; i++) if (fy.getY(i) > 0.03) above++;
    ok(fy && above === 0, 'the Harpstring has no back fin at all: its one ribbon fin is under the belly');
    const t = fishOf('threadling_eel'), tf = meshes(t).fins?.geometry.attributes.position;
    let fore = 0; if (tf) for (let i = 0; i < tf.count; i++) if (tf.getZ(i) > -0.3) fore++;
    ok(tf && fore === 0 && !meshes(t).glow, 'the Threadling: no fin but a skin fold at the tail, and no glow');
  }
  { // catfish: neither has the Matriarch's flat shovel or her bell-rope whiskers
    const m = fishOf('belled_matriarch'), d = fishOf('downcast_catfish'), c = fishOf('cindertail_catfish');
    const flat = (fv) => { const s = fv.section(0.06); return (2 * s.halfW) / (s.top - s.bottom); };
    ok(flat(m) > 1.4 && flat(d) < 1.2 && flat(c) < 1.4, `the Matriarch's head is a shovel (${flat(m).toFixed(2)}); the Downcast's (${flat(d).toFixed(2)}) and the Cindertail's (${flat(c).toFixed(2)}) are not`);
    const deep = (fv) => { const s = fv.section(0.25); return (s.top - s.bottom) / fv.length; };
    ok(deep(d) > deep(m) * 1.25, `the Downcast is deep and high-shouldered (${deep(d).toFixed(3)} against the Matriarch's ${deep(m).toFixed(3)})`);
    const dp = data.SPECIES_BY_ID.downcast_catfish.model;
    const dx = LOOP_SHAPES.catfish({ ...dp }), cx = LOOP_SHAPES.catfish({ ...data.SPECIES_BY_ID.cindertail_catfish.model });
    ok(dx.extras.length === 1 && dx.eyes.pos[0][1] < dx.f.yc(0.055), 'the Downcast: no whiskers at all (its mouth the one extra), its eyes set below the middle');
    ok(cx.extras.length === 2 && !!meshes(c).fins_tint, 'the Cindertail: its whiskers fanned forward (one extra of eight) and its tail painted its own colour');
    const tc = meshes(c).fins_tint?.geometry.attributes.color;
    ok(tc && tc.getX(0) > 0.5 && tc.getZ(0) < 0.4, 'the Cindertail\'s tail is ember to amber');
  }
  { // the Nightbloom: a head a third of its length, a high arched back, no barbels; the Weeping Carp a standard carp
    const nb = parts('nightbloom_carp'), deepAt = (id, fr) => { const fv = fishOf(id), q = fv.section(fr); return (q.top - q.bottom) / fv.length; };
    ok(nb.gill >= 0.32 && deepAt('nightbloom_carp', 0.3) > deepAt('weeping_carp', 0.3) * 1.25,
      `the Nightbloom: a big head (gill at ${nb.gill}) and a high arched back (${deepAt('nightbloom_carp', 0.3).toFixed(3)} deep against the Weeping Carp's ${deepAt('weeping_carp', 0.3).toFixed(3)})`);
    ok(meshes(fishOf('nightbloom_carp')).extras && nb.extras.length === 1, 'the Nightbloom: no barbels (its upturned mouth the one extra)');
  }
  { // the Fry: a glass fish a third of the Dusk Minnow, its cloud of five only in the show
    const fry = fishOf('netcloud_fry'), M2 = meshes(fry);
    ok(M2.body.material.transparent === true && M2.body.material.opacity < 0.7, 'the Netcloud Fry is glass (a translucent body)');
    ok(data.SPECIES_BY_ID.netcloud_fry.size.L50 < data.SPECIES_BY_ID.dusk_minnow.size.L50 * 0.4, 'the Fry is a third of the Dusk Minnow');
    const cl = () => { let n = 0; fry.object3d.traverse((o) => { if (o.name === 'cloud') n++; }); return n; };
    ok(cl() === 0, 'no cloud outside the show');
    fry.setWet(1); const inShow = cl(); let copies = 0; fry.object3d.traverse((o) => { if (o.name === 'cloud') copies = o.children.length; });
    fry.setWet(0);
    ok(inShow === 1 && copies === 4 && cl() === 0, `the show holds one and four more of the same mesh (${copies}); gone again after it`);
  }
  { // the Capshell: a dome over its body, tiny claws, long antennae; the Gutter a classic crayfish
    const cs = fishOf('capshell_crayfish'), gc = fishOf('gutter_crayfish');
    const hi = (fv) => (fv.bounds.top - fv.bounds.bottom) / fv.length;
    ok(hi(cs) > hi(gc) * 1.2, `the Capshell is a cap with legs: ${hi(cs).toFixed(3)} tall for its length against the Gutter's ${hi(gc).toFixed(3)}`);
  }
  { // the Festival Puffer: its lantern rests low and lights as it puffs
    const fp = fishOf('festival_puffer'), bm = meshes(fp).body.material;
    fp.update(0.1, 0, { struggle: 0 }); const rest = bm.emissiveIntensity;
    for (let i = 0; i < 40; i++) fp.update(0.1, i * 0.1, { struggle: 1.2 });
    ok(rest < 0.3 && bm.emissiveIntensity > rest * 4, `the Festival Puffer glows like a paper lantern when it puffs (${rest.toFixed(2)} → ${bm.emissiveIntensity.toFixed(2)})`);
  }
  { // the disc: the Velvet Ray's dozen eye-rings, the Grove's meadow with its glowing gills; both held as a ray is
    const vr = parts('velvet_ray'), gr = parts('drifting_grove');
    ok(vr.opts.ray && vr.s1 > 0.4 && vr.f.w(vr.s1 / 2) / vr.s1 > 0.45, 'the Velvet Ray: a near-round disc (as wide as it is long)');
    ok(gr.glows.length === 1 && gr.extras.length >= 6, 'the Drifting Grove: a meadow on her back (moss, ferns, caps) and the caps\' gills lit');
    ok((data.AUTOFISH?.show?.poseRules?.thin || []).includes('eel'), 'the eels hang as thin fish (poseRules.thin)');
  }
  { // the bream and the finlet: nothing in the Mossmere is shaped like them
    const br = parts('falsesmile_barb'), fl = parts('lostsea_mackerel');
    const depth = (id) => { const fv = fishOf(id); return Math.max(...[0.2, 0.3, 0.4].map((fr) => { const q = fv.section(fr); return (q.top - q.bottom) / fv.length; })); };
    ok(depth('falsesmile_barb') > 0.6 && depth('falsesmile_barb') > depth('mossback_perch') * 2.5, `the Falsesmile Barb is a plate on edge (${depth('falsesmile_barb').toFixed(2)} of its length deep; the Mossback Perch ${depth('mossback_perch').toFixed(2)})`);
    ok(br.extras.length >= 3, 'the Barb\'s smile: its square teeth in an open mouth');
    ok(fl.extras.length >= 4 && fl.opts.scribbles, 'the Lostsea Mackerel: finlets, keels, a long jaw, scribbles over its back');
  }

  section('LAKE 2 lane F: the Mossmere\'s fish exactly as before the lane (pinned at gw-lake2 85e6fb6)');
  const PIN = { gloam_eel: -2129220477, hullkiss_lamprey: -346993451, belled_matriarch: -1367596449, weeping_carp: 2110282670, rustfin_sucker: 1347359630,
    candlefin_koi: 287509395, dusk_minnow: -56235210, likely_chub: -56235210, gutter_crayfish: 846128680, overbold_bass: -1801926226, mossback_perch: -1801926226,
    kissmark_trout: -1041230037, reedjaw_pike: -1763869893, thousandcast_pike: -1413793413, lampsipper: -56235210, bridgechain_sturgeon: 2098699232 };
  for (const [id, h] of Object.entries(PIN)) {
    const fish = F.createFish(data.SPECIES_BY_ID[id], { z: 0 });
    ok(geoHash(fish.object3d) === h, `${id}: its geometry as before (${geoHash(fish.object3d)})`);
  }

  // the flag-off build in its own processes
  for (const mode of ['off', 'p2']) {
    const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url)], { env: { ...process.env, GW_MP_MODE: mode }, encoding: 'utf8' });
    process.stdout.write(r.stdout || '');
    if (r.status !== 0) { fail++; console.log(`  FAIL: the ${mode} pass exited ${r.status}`, r.stderr?.slice(0, 800)); } else pass++;
  }
} else {
  section('off the loop: no new plan, today\'s fallback');
  ok(data.LOOP_ENABLED !== true, 'not a loop build');
  for (const s of ['lamprey', 'sturgeon', 'trout']) ok(!F.shapes.includes(s), `the factory has no ${s}`);
  for (const shape of ['lamprey', 'sturgeon', 'trout']) {
    const fish = F.createFish({ id: `probe_${shape}`, model: { shape, body: 0x4a4e58, belly: 0xcfcabd, fin: 0x8a4b3a, glow: null, pattern: 'bands', eyes: 'normal', scale: 1.3 } }, 2);
    ok(fish.shape === 'minnow', `a ${shape}-shaped species draws as the minnow fallback (got ${fish.shape})`);
  }
  if (MODE === 'p2') {
    const b = data.SPECIES_BY_ID?.bridgechain_sturgeon;
    ok(!!b && b.model.shape === 'sturgeon' && b.model.scutes === undefined, 'v3 phase 2: the Bridgechain\'s record as built (no plan parameters)');
    if (b) ok(F.createFish(b, 2).shape === 'minnow', 'v3 phase 2: the Bridgechain draws as today (the minnow fallback)');
  }
  const pk = F.createFish('reedjaw_pike', { z: 0 });
  ok(pk.shape === 'pike', 'the built plans are untouched');
  // LAKE 2, lane F: off the loop no new plan and no brief's word is read: a model carrying them draws as its built plan, exactly
  for (const s of ['disc', 'bream', 'finlet']) ok(!F.shapes.includes(s), `off the loop the factory has no ${s}`);
  const base = { body: 0x3a2a40, belly: 0xd8c8d0, fin: 0x5a3a5c, glow: null, pattern: 'none', eyes: 'normal', scale: 1 };
  for (const [shape, words] of [['eel', { girth: 1.5, head: 'paddle', dorsal: 'none', ventral: 'ribbon_full', strings: 3 }], ['carp', { head: 1.35, back: 'arched', scales: 'giant' }],
    ['minnow', { skin: 'glass', eye: 1.6, cloud: 5 }], ['crayfish', { carapace: 'dome', claws: 0.4, antennae: 1.8 }], ['puffer', { beak: 4, eyeSpots: 'amber', prickles: 'short' }]]) {
    const a = F.createFish({ id: `probe_${shape}_a`, model: { ...base, shape } }, 2), b = F.createFish({ id: `probe_${shape}_b`, model: { ...base, shape, ...words } }, 2);
    ok(geoHash(a.object3d) === geoHash(b.object3d), `off the loop the ${shape}'s Sporewood words are not read (the built plan, exactly)`);
  }
}

console.log(`models-plans [${MODE}]: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
