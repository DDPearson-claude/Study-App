// T147 (docs/loop/m1-step3a/PLAN.md): the loop's three new fish plans in models-fish.js, built in node with the real factory.
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
const { createFishFactory, LOOP_SHAPES } = await import('../../src/models-fish.js');
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

if (MODE === 'loop') {
  section('the loop\'s three plans join the factory');
  ok(data.LOOP_ENABLED === true, 'a loop build');
  for (const s of ['lamprey', 'sturgeon', 'trout']) ok(F.shapes.includes(s), `the factory knows ${s}`);
  ok(Object.keys(LOOP_SHAPES).sort().join() === 'catfish,lamprey,sturgeon,trout', 'LOOP_SHAPES holds the three plans (M1 step 4: and the catfish)');

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
}

console.log(`models-plans [${MODE}]: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
