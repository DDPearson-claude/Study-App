// tools/tests/ambient-look.scenario.mjs — the Mossmere's ambient looked at (LOOP.ambient: the candle-boats, the gate's candle slits, the
// drowned debris), at dusk and at night, each from the play camera and through a close lens, and the draw calls with the boats and without.
//   node tools/playtest.mjs --html=<dev.html> --shots=<dir> --script=tools/tests/ambient-look.scenario.mjs --width=1280 --height=720
//   node tools/playtest.mjs --html=<dev.html> --shots=<dir> --script=tools/tests/ambient-look.scenario.mjs --mobile --width=820 --height=900
import { makeKit3a, seededSave } from './loop-3a.scenario.mjs';

export default async function (api) {
  const { page, evalGame: g, log } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit3a(api, { label: 'amb' });
  const safe = async (what, fn) => { try { await fn(); } catch (e) { K.note(`${what} failed: ${String(e?.message || e).split('\n')[0]}`); } };
  const shot = async (name, sec = 2) => { await K.secs(sec); await K.shoot(name); };
  const cam = (p) => K.places.camera(p);
  const amb = (o) => g((o) => { const c = window.__gw; return { a: c.debug.ambient?.() ?? null, slits: c.world.ambient?.(o) ?? null, q: c.render.quality, flow: c.flow }; }, o || null);
  const info = async (tag, o) => { const s = await amb(o); log('amb', tag, JSON.stringify(s).slice(0, 900)); return s; };
  // a lens on a point from the south-east (the play camera's side), dist m off and h m up
  const lens = (p, dist = 3, h = 1, fov = 40) => cam({ pos: [p.x + dist * 0.55, (p.y || 0) + h, p.z + dist * 0.84], look: [p.x, (p.y || 0) + 0.1, p.z], fov });
  const litBoat = (s) => (s.a?.boats || []).filter((b) => b.mode === 'drift' && b.k > 0.5).sort((a, b) => a.line - b.line)[0] || null;
  const round = async (tag) => {
    await safe(`${tag} boats`, async () => {
      await K.places.pose(14, -27); await shot(`${tag}-boats-play`, 2.5);
      const s = await info(`${tag}-boats`);
      const b = litBoat(s);
      if (b) { await lens(b, 2.4, 0.7, 36); await shot(`${tag}-boat-close`, 0.6); await cam(null); } else K.note(`${tag}: no lit boat drifting`);
      await K.places.pose(-14, -32); await shot(`${tag}-boats-west`, 2);
    });
    await safe(`${tag} debris`, async () => {
      await K.places.pose(24, 11); await shot(`${tag}-debris-play`, 2.5);
      await lens({ x: 46, z: -7 }, 6.5, 2.2, 40); await shot(`${tag}-rowboat-close`, 1);
      await cam({ pos: [28, 2.8, 9], look: [39, 0.2, -1], fov: 50 }); await shot(`${tag}-roofs-close`, 1);
      await cam(null);
    });
    await safe(`${tag} slits`, async () => {
      await K.places.pose(0, -36);
      await cam({ pos: [0, 3.2, -40], look: [0, 15, -76], fov: 42 }); await shot(`${tag}-slits`, 1);
      await info(`${tag}-slits-out`, { out: true });
      await shot(`${tag}-slit-out`, 1.6);
      const s = await info(`${tag}-slits-after`);
      await cam(null);
      K.need(s.slits && (s.slits.out >= 0 || s.slits.outs > 0), `${tag}: a slit went out`, s.slits);
    });
  };
  try {
    K.step('boot');
    await K.boot(seededSave({ clams: 3000, holdSlots: 6 }));
    await K.toJetty();
    await K.tap('[data-loop=jetty] .gw-x').catch(() => {});
    await K.sail(null);
    await K.places.unlift();
    let s = await info('trip');
    K.need(s.a && s.a.on === true && s.a.boats.length >= 4, 'the candle-boats are on', s.a);
    K.step('dusk');
    await K.places.light('dusk', 0.75);
    await round('dusk');
    K.step('night');
    await K.places.light('gloomtide', 0.5);
    await round('night');
    await info('night-end');
    K.step('cost: the draw calls with the boats and without');
    await K.places.pose(14, -27); await K.secs(1);
    const calls = await g(() => {
      const c = window.__gw, R = c.render, rr = R.renderer, out = {};
      for (const vis of [true, false]) {
        for (const nm of ['candleBoats', 'candleBoatFlames']) { const o = R.scene.getObjectByName(nm); if (o) o.visible = vis; }
        R.render();
        out[vis ? 'with' : 'without'] = { calls: rr.info.render.calls, tris: rr.info.render.triangles };
      }
      return { ...out, q: R.quality };
    });
    log('perf', JSON.stringify(calls));
    K.note(`calls ${JSON.stringify(calls)}`);
  } catch (e) {
    K.note(`scenario stopped: ${String(e?.message || e).split('\n')[0]}`);
  }
  return K.finish ? K.finish() : undefined;
}
