// WC-2 fix round: the frames round a cast's landing on the Mossmere under the loop at dusk (the review's "pale box round a bolting
// silhouette"). A plain cast on open margin water, a cast on a cruising carp (it bolts), the quiet spot after, the carp fizz and its
// answer. Each landing shot 0.35 s after the landing (the pulse rings' lifetime; `pulses(false)` hides them for a comparison).
//   node build.mjs --dev --out=tools/out/mvp-wc2-fix/dev.html
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-wc2-fix/dev.html --shots=tools/out/mvp-wc2-fix/shots --script=tools/tests/loop-wc2-bolt.scenario.mjs --width=960 --height=540
//   (and the same with --mobile)
// Prints `LOOP_WC2_BOLT {size, failures, notes, float}` (float: the float's screen point at each shot, for crops).
import { makeKit3a, seededSave } from './loop-3a.scenario.mjs';
import { Abort } from './loop-1a.scenario.mjs';

const MARGIN = { raft: [-13, -41], fish: [-11.3, -36.3], plain: [-9.5, -35.9] };   // as loop-wc2.scenario.mjs (plain: open margin water in view)

export default async function (api) {
  const { page, evalGame: g, log } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit3a(api, { label: 'wc2b' });
  const sight = (id, o) => g(([id, o]) => window.__gw.debug.sight(id, o), [id, o]);
  const sights = () => g(() => window.__gw.debug.fishSights());
  const dbg = () => g(() => { const d = window.__gw.debug.fishing(); return { state: d.state, sign: d.sign }; });
  const castAt = (x, z) => g(([x, z]) => window.__gw.debug.castAt(x, z), [x, z]);
  const cancel = () => g(() => { try { window.__gw.fishing.cancel?.('debug'); } catch { /* optional */ } });
  const clearAll = () => g(() => { const c = window.__gw; try { c.fishing.cancel?.('debug'); } catch { /* optional */ } for (const s of c.fishing.signs.slice()) s.ttl = 0; });
  const pulses = (on) => g((on) => { const o = window.__gw.render?.scene?.getObjectByName?.('fishing-pulses'); if (o) o.material.visible = on; return !!o; }, on);
  const bobScr = () => g(() => { const c = window.__gw, b = c.fishing.bobberPos; if (!b || !c.THREE?.Vector3) return null; const v = new c.THREE.Vector3(b.x, b.y ?? 0, b.z).project(c.render.camera); return [Math.round((v.x + 1) / 2 * innerWidth), Math.round((1 - v.y) / 2 * innerHeight)]; });
  const landed = async () => { for (let i = 0; i < 40; i++) { const d = await dbg(); if (d.state !== 'casting') return d; await K.secs(0.1); } return dbg(); };
  const idle = async () => { await cancel(); await K.until("c.fishing.state === 'idle'", 8); await K.secs(1.6); };
  const float = {};
  try {
    K.step('boot: the step-2 save, Mire Worms fitted; dusk at the margin');
    const own = ['lily_maze', 'buoy_lights'];
    await K.boot(seededSave({ clams: 999, holdSlots: 6, own, lifted: own, over: { fitted: { lure: null, bait: 'mireworm' } } }));
    await g(() => { const L = window.__gw.state.meta.loop; L.bait = { ...(L.bait || {}), mossmere: { ...(L.bait?.mossmere || {}), mireworm: 40 } }; });
    await K.toJetty();
    await K.sail(null);
    await g(() => window.__gw.debug.fishSeed(20261116));
    await K.places.light('dusk', 0.45);
    await K.places.pose(MARGIN.raft[0], MARGIN.raft[1], 0); await K.secs(2);
    await clearAll(); await K.secs(0.6);

    K.step('a plain cast on open margin water (no silhouette, no tell)');
    K.check(await pulses(true), 'the pulse mesh is in the scene');
    await castAt(MARGIN.plain[0], MARGIN.plain[1]);
    let d = await landed();
    await K.secs(0.35);
    float.plain = await bobScr();
    await K.shoot('plain-cast-035');
    K.check(!d.sign || d.sign.kind !== 'sight', 'the plain cast meets no silhouette', d.sign);
    await idle();

    K.step('a cast on a cruising carp: it bolts');
    const carp = await sight('weeping_carp', { x: MARGIN.fish[0], z: MARGIN.fish[1], heading: -Math.PI / 2, mode: 'cruise', speed: 0.25, life: 200, size: 0.6 });
    K.need(!!carp, 'a carp silhouette in the margin', carp);
    await K.secs(2.4);
    let f = (await sights()).find((q) => q.id === carp.id);
    await castAt(f.x, f.z);
    d = await landed();
    await K.secs(0.35);
    float.bolt = await bobScr();
    await K.shoot('carp-bolt-035');
    K.check(d.sign?.spook === true && (await sights()).some((q) => q.mode === 'bolt'), 'it bolts; the cast keeps a spook rule', d.sign);
    await K.secs(1.2);
    await K.shoot('spot-quiet');
    await idle();

    K.step('carp fizz and its answer (froth, never pin-point glints)');
    await clearAll();
    const fz = await g(([x, z]) => window.__gw.debug.sign('bubbles', { x, z, heading: -Math.PI / 2, ttl: 60 }), MARGIN.fish);
    await K.secs(3);
    await K.shoot('fizz');
    const live = await g((id) => { const s = window.__gw.fishing.signs.find((q) => q.id === id); return s ? { x: s.head.x, z: s.head.z, h: s.heading } : null; }, fz?.id);
    if (live) {
      await castAt(live.x + Math.sin(live.h) * 0.8, live.z + Math.cos(live.h) * 0.8);
      await landed();
      let a = null;
      for (let i = 0; i < 20 && !a; i++) { await K.secs(0.1); a = (await g(() => window.__gw.debug.mossAnswers())).find((q) => q.type === 'fizz' && q.started); }
      K.check(!!a, 'the trail turns onto the float', a);
      await K.secs(0.3);
      float.fizz = await bobScr();
      await K.shoot('fizz-answer');
    } else K.note('no fizz');
    await idle();
    await K.noErrors('the bolt look');
  } catch (e) {
    if (e instanceof Abort) K.note('the look stopped', e.message);
    else K.check(false, 'the look threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
  }
  await K.release().catch(() => {});
  log('LOOP_WC2_BOLT', JSON.stringify({ size: K.tag, failures: K.failures, notes: K.notes, float }));
  return { failures: K.failures };
}
