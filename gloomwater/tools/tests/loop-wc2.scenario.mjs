// WC-2 (WATERCRAFT §5–§6, §9.3's browser gate): one short look at the tells and the silhouettes on the Mossmere under the loop, from
// the step-2 save (the Buoy Lights and the Lily Maze owned and lifted, Mire Worms fitted). The silhouettes and tells are put down with
// the debug hooks (ctx.debug.sight, sign, castAt) at points read from the real layout, so every frame is the same on each run.
//   node build.mjs --dev --out=tools/out/mvp-wc2/dev.html
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-wc2/dev.html --shots=tools/out/mvp-wc2/shots --script=tools/tests/loop-wc2.scenario.mjs --width=960 --height=540
//   (and the same with --mobile)
// Prints `LOOP_WC2 {size, failures, notes}`.
import { makeKit3a, seededSave } from './loop-3a.scenario.mjs';
import { Abort } from './loop-1a.scenario.mjs';

// points on the real layout (tools/tests/fishing-wc2.test.mjs reads the same world): the play camera looks north (−z)
const MARGIN = { raft: [-13, -41], fish: [-11.3, -36.3], still: [-18, -41], fizz: [-11.3, -36.3] };   // a margin strip in front of the raft
const REEDS = { raft: [-33, -38], fish: [-33, -44] };       // a reed line's outer edge, 6 m north
const STONES = { raft: [-45, -3], fish: [-45, -19] };      // a margin 16 m straight out (a Keeper near its farthest band)
const BUOY = { raft: [-48, 10], lamp: [-46.8, -1] };        // at the south end of the Buoy Lights' two rows of drowned lamps

export default async function (api) {
  const { page, evalGame: g, log } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit3a(api, { label: 'wc2' });
  const pose = async (p, sec = 1.2) => { await K.places.pose(p[0], p[1], 0); await K.secs(sec); };
  const sight = (id, o) => g(([id, o]) => window.__gw.debug.sight(id, o), [id, o]);
  const sights = () => g(() => window.__gw.debug.fishSights());
  const dbg = () => g(() => { const d = window.__gw.debug.fishing(); return { state: d.state, sign: d.sign, took: d.prerollTook, species: d.species }; });
  const castAt = (x, z) => g(([x, z]) => window.__gw.debug.castAt(x, z), [x, z]);
  const cancel = () => g(() => { try { window.__gw.fishing.cancel?.('debug'); } catch { /* optional */ } });
  const clearAll = () => g(() => { const c = window.__gw; try { c.fishing.cancel?.('debug'); } catch { /* optional */ } for (const s of c.fishing.signs.slice()) s.ttl = 0; });
  const scr = (p) => g((p) => { const c = window.__gw; if (!c.THREE?.Vector3 || !c.render?.camera) return null; const v = new c.THREE.Vector3(p[0], 0, p[1]).project(c.render.camera); return [Math.round((v.x + 1) / 2 * innerWidth), Math.round((1 - v.y) / 2 * innerHeight)]; }, p);
  const landed = async () => { for (let i = 0; i < 40; i++) { const d = await dbg(); if (d.state !== 'casting') return d; await K.secs(0.1); } return dbg(); };
  try {
    K.step('boot: the step-2 save, the Buoy Lights and the Lily Maze owned and lifted, Mire Worms fitted');
    const own = ['lily_maze', 'buoy_lights'];
    await K.boot(seededSave({ clams: 999, holdSlots: 6, own, lifted: own, over: { fitted: { lure: null, bait: 'mireworm' } } }));
    await g(() => { const L = window.__gw.state.meta.loop; L.bait = { ...(L.bait || {}), mossmere: { ...(L.bait?.mossmere || {}), mireworm: 40 } }; });
    await K.toJetty();
    await K.sail(null);
    await g(() => window.__gw.debug.fishSeed(20261116));
    await K.places.light('dusk', 0.45);

    K.step('dusk, the margin: the water as it is (the dressing-only frame), then a carp cruising with its shadow');
    await pose(MARGIN.raft, 2);
    await clearAll(); await K.secs(0.6);
    await K.shoot('margin-dusk-empty');
    const carp = await sight('weeping_carp', { x: MARGIN.fish[0], z: MARGIN.fish[1], heading: -Math.PI / 2, mode: 'cruise', speed: 0.25, life: 200, size: 0.6 });
    K.need(!!carp && carp.outline === 'deep', 'a carp silhouette in the margin', carp);
    log('carp at', JSON.stringify(await scr(MARGIN.fish)));
    await K.secs(2.4);
    await K.shoot('carp-dusk');
    const s1 = (await sights()).find((q) => q.id === carp.id);
    K.check(s1 && s1.vis > 0.5 && s1.alpha > 0.9 && s1.depth < 0.45, 'it shows (dusk, shallow)', s1);
    await K.places.camera({ pos: [s1.x + 0.4, 5.5, s1.z + 3.4], look: [s1.x, 0, s1.z], fov: 36 });
    await K.secs(0.3);
    await K.shoot('carp-close');
    await K.places.camera(null); await K.secs(0.3);

    K.step('a cast just ahead of a still carp: it turns to the bait (a take or a refusal, seeded)');
    let took = null, nosed = null;
    for (let k = 0; k < 5 && (!took || !nosed); k++) {
      await cancel(); await K.until("c.fishing.state === 'idle'", 8); await K.secs(0.3);
      await g((n) => window.__gw.debug.fishSeed(20261116 + n), k);
      const f = await sight('weeping_carp', { x: MARGIN.still[0] - k * 1.3, z: MARGIN.still[1] + (k % 2) * 0.8, heading: Math.PI, mode: 'hold', life: 200, size: 0.6 });
      if (!f) { K.note('no still carp'); break; }
      await K.secs(1.4);
      const hx = f.x + Math.sin(f.heading) * f.length / 2, hz = f.z + Math.cos(f.heading) * f.length / 2;
      await castAt(hx + Math.cos(f.heading) * 1.3, hz - Math.sin(f.heading) * 1.3);
      const d = await landed();
      if (d.sign?.kind !== 'sight') { K.note('the still window missed', d); continue; }
      await K.secs(1.9);
      const h = (await sights()).find((q) => q.id === f.id);
      if (d.took && !took) { took = { d, h }; await K.shoot('carp-takes'); }
      else if (!d.took && !nosed) { nosed = { d, h }; await K.shoot('carp-noses'); }
      await K.secs(2.5);
      await g((id) => { const L = window.__gw.debug.fishSights().find((q) => q.id === id); return L; }, f.id);
    }
    K.check(!!took && (took.h?.mode === 'take' || !took.h) && took.d.species === 'weeping_carp', 'a seeded cast just ahead brings it: it swims to the bait, the bite is that fish', took);
    if (nosed) K.check(nosed.h?.mode === 'nose' || nosed.h?.mode === 'turn', 'a refusal: it noses the bait and turns away', nosed.h);
    await cancel(); await K.until("c.fishing.state === 'idle'", 8);

    K.step('a cast on a silhouette: it bolts with a V-wake and the spot goes quiet');
    const f2 = (await sights()).find((q) => q.id === carp.id) || await sight('weeping_carp', { x: MARGIN.fish[0], z: MARGIN.fish[1], heading: -Math.PI / 2, mode: 'cruise', speed: 0.25, life: 200 });
    await castAt(f2.x, f2.z);
    await landed();
    await K.secs(0.35);
    await K.shoot('carp-bolts');
    const bolted = await g(() => window.__gw.debug.fishSights().filter((q) => q.mode === 'bolt').length);
    K.check(bolted >= 1 && (await dbg()).sign?.spook === true, 'it bolts; the cast keeps a spook rule (its wait × 1.5)');
    const again = await sight('weeping_carp', { x: f2.x + 3, z: f2.z, force: false });
    K.check(!again, 'no new silhouette within 10 m for 30 s');
    await K.secs(1.2);
    await K.shoot('spot-quiet');
    await cancel(); await K.until("c.fishing.state === 'idle'", 8);

    K.step('carp fizz: a cast at the trail\'s head turns the fizz onto the float');
    await clearAll();
    const fz = await g(([x, z]) => window.__gw.debug.sign('bubbles', { x, z, heading: -Math.PI / 2, ttl: 60 }), MARGIN.fizz);
    K.check(fz?.form === 'fizz' && ['margin', 'pads', 'reeds'].includes(fz?.area), 'carp fizz in the margins', fz);
    await K.secs(3);
    await K.shoot('fizz');
    const live = await g((id) => { const s = window.__gw.fishing.signs.find((q) => q.id === id); return s ? { x: s.head.x, z: s.head.z, h: s.heading } : null; }, fz?.id);
    if (live) {
      await castAt(live.x + Math.sin(live.h) * 0.8, live.z + Math.cos(live.h) * 0.8);
      const d = await landed();
      K.check(d.sign?.kind === 'bubbles', 'the cast meets the fizz\'s rule', d.sign);
      let a = null;
      for (let i = 0; i < 20 && !a; i++) { await K.secs(0.1); a = (await g(() => window.__gw.debug.mossAnswers())).find((q) => q.type === 'fizz' && q.started); }
      K.check(!!a, 'the trail turns onto the float', a);
      await K.secs(0.3);
      await K.shoot('fizz-answer');
    }
    await cancel(); await K.until("c.fishing.state === 'idle'", 8);

    K.step('a silhouetted pike at a reed edge noses a worm and turns away');
    await pose(REEDS.raft, 1.5);
    await clearAll();
    let refused = null;
    for (let k = 0; k < 4 && !refused; k++) {
      await cancel(); await K.secs(0.3); await K.until("c.fishing.state === 'idle'", 6);
      const pk = await sight('reedjaw_pike', { x: REEDS.fish[0] - (k % 2) * 1.0, z: REEDS.fish[1], heading: Math.PI, mode: 'hold', life: 200, size: 0.4 });
      if (!pk) { K.note('no pike silhouette here'); break; }
      await K.secs(2.2);
      const f = (await sights()).find((q) => q.id === pk.id);
      const hx = f.x + Math.sin(f.heading) * f.length / 2, hz = f.z + Math.cos(f.heading) * f.length / 2;
      await castAt(hx + 1.3, hz - 0.2);
      const d = await landed();
      if (d.sign?.kind !== 'sight') { K.note('the still window missed', d); continue; }
      await K.secs(2.4);
      const h = (await sights()).find((q) => q.id === pk.id);
      if (!d.took) { refused = { d, h }; await K.shoot('pike-noses-worm'); }
      else K.note('the pike took the worm (the built 45% take until WC-1\'s castOdds is merged: 1% on a stray)', d);
      await K.secs(2);
    }
    K.check(!!refused, 'a worm cast beside a silhouetted pike is nosed and refused', refused);
    await cancel(); await K.secs(0.5);

    K.step('a Keeper common near its farthest distance (16 m out)');
    await pose(STONES.raft, 1.5);
    await clearAll();
    const pr = await sight('mossback_perch', { x: STONES.fish[0], z: STONES.fish[1], heading: Math.PI / 2, mode: 'cruise', speed: 0.45, life: 200, size: 0.3 });
    log('perch at', JSON.stringify(await scr(STONES.fish)));
    K.check(!!pr && pr.length >= 0.25 && pr.length <= 0.6, 'a Keeper perch', pr);
    await K.secs(2.4);
    await K.shoot('keeper-far');

    K.step('night: a shape crossing a drowned lamp at the Buoy Lights; the lantern\'s light on the margin');
    await K.places.light('gloomtide', 0.4);
    await pose(BUOY.raft, 2);
    await clearAll();
    const bz = await sight('reedjaw_pike', { x: BUOY.lamp[0], z: BUOY.lamp[1] + 1.5, heading: Math.PI, mode: 'cruise', speed: 0.5, life: 200 });
    K.check(!!bz && bz.area === 'buoy_lights', 'a shape over the lamps', bz);
    await K.secs(2.6);
    const b1 = (await sights()).find((q) => q.id === bz?.id);
    K.check(b1 && b1.vis > 0.2, 'it shows over a lamp at night', b1);
    await K.shoot('buoy-night');
    await pose(MARGIN.raft, 2);
    await clearAll();
    for (const p of [[-11.3, -36.3], [-10.9, -35.4], [-24.3, -36.9]]) await sight('weeping_carp', { x: p[0], z: p[1], heading: -Math.PI / 2, mode: 'cruise', speed: 0.2, life: 200 });
    await K.secs(2.6);
    const ns = await sights();
    const mar = ns.filter((q) => q.area !== 'buoy_lights');
    K.check(mar.some((q) => q.vis > 0.3) && mar.every((q) => q.vis <= 0.75 + 1e-6), 'night: shapes fade with the lantern\'s light', mar.map((q) => +q.vis.toFixed(2)));
    await K.shoot('night-lantern');
    await K.noErrors('the look');
  } catch (e) {
    if (e instanceof Abort) K.note('the look stopped', e.message);
    else K.check(false, 'the look threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
  }
  await K.release().catch(() => {});
  log('LOOP_WC2', JSON.stringify({ size: K.tag, failures: K.failures, notes: K.notes }));
  return { failures: K.failures };
}
