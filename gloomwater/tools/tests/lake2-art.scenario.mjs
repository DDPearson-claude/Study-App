// LAKE 2, the art pass (docs/loop/LAKE2.md §9.11): Sporewood greener, its three lights apart, its leaves soft, its water clean of gold, its
// landmarks read. A loop dev build from a fresh save; on the water the world is put on Sporewood (zone:change, as lane W2's scenario does)
// and the raft set at its set pieces, the UI hidden for the look frames.
//   --sheet    the user's look sheet: Sporewood (the first evening's pose and the East Pool toward the neck) and the Mossmere, day, dusk, night
//   --frames   the set pieces by day (the neck and the Gill Harp, the West Pool by Mossback Isle, the Reed Flats, the Veil and its lift shot,
//              the Mother Cap, the isles from above) and the East Pool at dusk and night
//   --hue      the hue-report's frames (W2's three poses × day, dusk, night)
//   --tier=medium|low   the render tier before the world goes to Sporewood
//
//   node build.mjs --dev --out=tools/out/art/dev.html
//   nice -n 10 node tools/playtest.mjs --html=tools/out/art/dev.html --shots=<dir> --script=tools/tests/lake2-art.scenario.mjs --width=1280 --height=800 --sheet --frames
//   nice -n 10 node tools/playtest.mjs --html=tools/out/art/dev.html --shots=<dir> --script=tools/tests/lake2-art.scenario.mjs --mobile --sheet
//   nice -n 10 node tools/playtest.mjs --html=tools/out/art/dev.html --shots=<dir> --script=tools/tests/lake2-art.scenario.mjs --width=960 --height=540 --hue --tier=medium
// Prints `LAKE2_ART {size, failures, notes, info}`; returns its failures.
import { makeKit, Abort } from './loop-1a.scenario.mjs';

export default async function (api) {
  const { page, evalGame: g, log, args } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: 'art' });
  const info = {};
  const cam = (pos, look, fov) => g(({ pos, look, fov }) => window.__gw.render.setIntroCamera({ pos, look, fov, w: 1 }), { pos, look, fov });
  const uncam = () => g(() => window.__gw.render.setIntroCamera(null));
  const put = (x, z, yawDeg = 0) => g(([x, z, y]) => { window.__gw.player.teleport({ x, z }, (y * Math.PI) / 180); window.__gw.render.snapCamera?.(); }, [x, z, yawDeg]);
  const phase = (p) => g((ph) => window.__gw.survival.setPhase(ph), p);
  const hideUi = (on) => g((on) => {
    let s = document.getElementById('art-hide-ui');
    if (!s) { s = document.createElement('style'); s.id = 'art-hide-ui'; document.head.appendChild(s); }
    s.textContent = on ? '#ui { opacity: 0 !important; } .gw-banner, .gw-banner-layer, .gw-toast { opacity: 0 !important; }' : '';
  }, on);
  const settle = async (s = 2.2) => { await K.secs(s); await K.settle(400); };
  const LIGHTS = [['calm', 'day'], ['dusk', 'dusk'], ['gloomtide', 'night']];
  const toZone = (zone, prev) => g(([z, p]) => window.__gw.bus.emit('zone:change', { zone: z, prev: p }), [zone, prev]);
  const perf = () => g(() => { const r = window.__gw.render?.renderer; return r ? { calls: r.info.render.calls, tris: r.info.render.triangles } : null; });
  try {
    K.step('art: a fresh save, home, Sail onto the Mossmere');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => { window.__lp.ev.length = 0; window.__gw.game.beginIntro({ character: 'wick' }); });
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    await g(() => { const c = window.__gw; c.debug.loop.tow?.('cut'); c.debug.loop.tutorial('done'); c.ui.closeAll?.(); });
    K.need(await g(() => window.__gw.game.sail({ water: 'mossmere' })), 'Sail');
    K.need((await K.until("c.flow === 'playing' && c.fishing.state === 'idle'", 12)).ok, 'on the water');
    if (typeof args.tier === 'string') await g((t) => { const c = window.__gw; c.state.meta.settings.quality = t === 'low' ? 'low' : 'high'; c.render.setQuality?.(t); }, args.tier);
    // the Mossmere first (its frames before Sporewood is ever built in this page)
    if (args.sheet) {
      await hideUi(true);
      for (const [ph, label] of LIGHTS) {
        await phase(ph); await settle(ph === 'calm' ? 1.5 : 4); await put(0, 30, 0); await settle(2); await K.shoot(`mossmere-${label}`);
        await cam([0, 5, 46], [0, 4, 0], 55); await K.secs(0.4); await K.settle(300); await K.shoot(`mossmere-vista-${label}`); await uncam();
      }
      await hideUi(false);
    }
    K.step('art: the world on Sporewood');
    const t0 = await g(() => {
      const c = window.__gw, t = performance.now();
      c.bus.emit('zone:change', { zone: 'sporewood', prev: 'mossmere' });
      const d = c.world.debugInfo?.() || {};
      return { ms: Math.round(performance.now() - t), zone: c.world.getZone()?.id, errs: c.errors.slice(), lush: d.lush ?? null };
    });
    info.build = { ms: t0.ms, zone: t0.zone };
    K.check(t0.zone === 'sporewood' && t0.errs.length === 0 && !!t0.lush?.flora, `Sporewood built with its kit in ${t0.ms} ms, no error`, { errs: t0.errs });
    await hideUi(true);
    if (args.sheet) {
      for (const [ph, label] of LIGHTS) {
        await phase(ph); await settle(ph === 'calm' ? 1.5 : 4);
        await put(44, 17, 0); await settle(2); await K.shoot(`sporewood-evening-${label}`);
        await put(28, 2, 0); await settle(2); await K.shoot(`sporewood-east-${label}`);
        await cam([42, 5, 26], [16, 4, -2], 55); await K.secs(0.4); await K.settle(300); await K.shoot(`sporewood-vista-${label}`); await uncam();
      }
    }
    if (args.frames) {
      await phase('calm'); await settle(1.5);
      for (const [name, x, z, yaw] of [['neck-gill-harp', 6, 7.5, 0], ['gill-harp-from-west', -16, 6, 0], ['west-pool-mossback', -38, 2, 0], ['reed-flats', -48, 27, 0],
        ['veil-approach', -66, 31, 0], ['veil-inside', -84, 36.5, 0], ['mother-cap', 47, 21, 0], ['lily-cove', -50, -26, 0]]) {
        await put(x, z, yaw); await settle(); await K.shoot(`${name}-day`);
      }
      // the Veilwater's lift shot (render.frameLandmark, the loop's lift), held still for the frame
      // (as the loop's lift frames it: loop-home's landmarkOf is the world's anchor for the place)
      const lift = await g(() => { const c = window.__gw, p = c.world.placeAnchor?.('veilwater'); if (!p) return false; c.render.frameLandmark?.(p, { dur: 30, back: 0.1 }); return true; });
      if (lift) { await put(-66, 31, 0); await K.secs(1.5); await K.settle(300); await K.shoot('veil-lift-shot'); await g(() => window.__gw.render.frameLandmark?.(null, { back: 0.01 })); await K.secs(0.3); }
      // the Gill Harp from the West Pool's side of the neck (its two caps, their undersides and the strings hanging over the water) and
      // Rootknot close (its moss-grown roots under a small cap with its own strings)
      for (const [name, pos, look] of [['gill-harp-vista', [-17, 4.2, 13], [2, 5.5, 5], 55], ['rootknot', [29, 3.2, -3], [22, 1.6, -12], 50]]) { await cam(pos, look, 55); await K.secs(0.5); await K.settle(300); await K.shoot(`${name}-day`); }
      await cam([-6, 150, 120], [-6, 0, 0], 50); await K.secs(0.5); await K.settle(400); await K.shoot('overhead-day');
      for (const [name, pos, look] of [['isles-west', [-40, 40, 40], [-46, 0, 2]], ['isles-east', [40, 30, 26], [40, 0, -2]]]) { await cam(pos, look, 50); await K.secs(0.5); await K.settle(300); await K.shoot(name); }
      await uncam();
      for (const [ph, label] of LIGHTS.slice(1)) {
        await phase(ph); await settle(4);
        for (const [name, x, z] of [['west-pool-mossback', -38, 2], ['mother-cap', 47, 21]]) { await put(x, z, 0); await settle(); await K.shoot(`${name}-${label}`); }
      }
      info.perf = await perf();
      K.note('renderer info at night by the Mother Cap', info.perf);
    }
    if (args.hue) {
      const poses = [['spawn', 44, 17], ['day-water', -51.5, -30], ['old-water', 3, 8]];
      for (const [ph, label] of LIGHTS) {
        await phase(ph); await settle(ph === 'calm' ? 1 : 4);
        for (const [name, x, z] of poses) { await put(x, z, 0); await settle(2); await K.shoot(`hue-${name}-${label}`); }
      }
    }
    await hideUi(false);
    K.check((await g(() => window.__gw.errors.slice())).length === 0, 'no ctx.errors on Sporewood');
    K.step('art: back to the Mossmere');
    await toZone('mossmere', 'sporewood');
    await phase('calm'); await put(0, 30, 0); await settle(2);
    const back = await g(() => ({ zone: window.__gw.world.getZone()?.id, lush: window.__gw.world.debugInfo?.()?.lush ?? null, errs: window.__gw.errors.slice() }));
    K.check(back.zone === 'mossmere' && back.lush === null && back.errs.length === 0, 'back on the Mossmere: no kit, no error', back);
  } catch (e) {
    if (e instanceof Abort) K.note('the walk stopped', e.message);
    else K.check(false, 'the walk threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
  }
  await K.release().catch(() => {});
  log('LAKE2_ART', JSON.stringify({ size: K.tag, failures: K.failures, notes: K.notes, info }));
  return { failures: K.failures };
}
