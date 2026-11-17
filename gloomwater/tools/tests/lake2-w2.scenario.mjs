// LAKE 2, lane W2 in the browser (docs/loop/LAKE2.md §1A, §3.3–§3.6, §9): Sporewood's art, the ember garden made green. A loop dev build
// from a fresh save; on the water the world is put on Sporewood (LOOP.shipped stays the Mossmere: no Sail reaches it yet, so the scenario
// sends zone:change itself) and the raft is set at Sporewood's set pieces: the East Pool toward the neck (the colour script's frame), the
// neck under the Gill Harp, the West Pool by Mossback Isle, the Veil, the Mother Cap over its Cup, the Seep, the Reed Flats, Rootfoot
// Landing from the home camera's pose; day, dusk and night; then back to the Mossmere, as built.
//   --hue    the hue-report's frames instead (UI hidden): the three poses (the spawn, the day water, the old water) × day, dusk, night
//   --tier=medium   the render tier (and the arena's) before the world goes to Sporewood (WATERS §7: the gating tier is medium)
//
//   node build.mjs --dev --out=tools/out/w2/dev.html
//   node tools/playtest.mjs --html=tools/out/w2/dev.html --shots=tools/out/w2/desk --script=tools/tests/lake2-w2.scenario.mjs --width=1280 --height=720
//   node tools/playtest.mjs --html=tools/out/w2/dev.html --shots=tools/out/w2/phone --script=tools/tests/lake2-w2.scenario.mjs --mobile --width=390 --height=844
//   node tools/playtest.mjs --html=tools/out/w2/dev.html --shots=tools/out/w2/hue --script=tools/tests/lake2-w2.scenario.mjs --width=960 --height=540 --hue --tier=medium
//   node tools/hue-report.mjs tools/out/w2/hue
//
// Prints `LAKE2_W2 {size, failures, notes, info}`; returns its failures.
import { makeKit, Abort } from './loop-1a.scenario.mjs';

export default async function (api) {
  const { page, evalGame: g, log, args } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: 'w2' });
  const info = {};
  const cam = (pos, look, fov) => g(({ pos, look, fov }) => window.__gw.render.setIntroCamera({ pos, look, fov, w: 1 }), { pos, look, fov });
  const uncam = () => g(() => window.__gw.render.setIntroCamera(null));
  const put = (x, z, yawDeg = 0) => g(([x, z, y]) => { window.__gw.player.teleport({ x, z }, (y * Math.PI) / 180); window.__gw.render.snapCamera?.(); }, [x, z, yawDeg]);
  const phase = (p) => g((ph) => window.__gw.survival.setPhase(ph), p);
  const hideUi = (on) => g((on) => {
    let s = document.getElementById('w2-hide-ui');
    if (!s) { s = document.createElement('style'); s.id = 'w2-hide-ui'; document.head.appendChild(s); }
    s.textContent = on ? '#ui { opacity: 0 !important; } .gw-banner, .gw-banner-layer, .gw-toast { opacity: 0 !important; }' : '';
  }, on);
  const settle = async (s = 2.2) => { await K.secs(s); await K.settle(400); };
  try {
    K.step('w2: a fresh save, home, Sail onto the Mossmere');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => { window.__lp.ev.length = 0; window.__gw.game.beginIntro({ character: 'wick' }); });
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    await g(() => { const c = window.__gw; c.debug.loop.tow?.('cut'); c.debug.loop.tutorial('done'); c.ui.closeAll?.(); });
    K.need(await g(() => window.__gw.game.sail({ water: 'mossmere' })), 'Sail');
    K.need((await K.until("c.flow === 'playing' && c.fishing.state === 'idle'", 12)).ok, 'on the water');

    if (typeof args.tier === 'string') await g((t) => { const c = window.__gw; c.state.meta.settings.quality = t === 'low' ? 'low' : 'high'; c.render.setQuality?.(t); }, args.tier);
    K.step('w2: the world on Sporewood (zone:change; the run stays the Mossmere\'s)');
    const t0 = await g(() => {
      const c = window.__gw, t = performance.now();
      c.bus.emit('zone:change', { zone: 'sporewood', prev: 'mossmere' });
      const d = c.world.debugInfo?.() || {};
      return { ms: Math.round(performance.now() - t), zone: c.world.getZone()?.id, errs: c.errors.slice(), buildMs: d.arena?.buildMs ?? null, lush: d.lush ?? null, lamps: (c.world.getLampSpots?.() || []).filter((l) => l.kind === 'cap').length };
    });
    info.build = t0;
    K.check(t0.zone === 'sporewood' && t0.errs.length === 0 && !!t0.lush?.flora, `Sporewood built with its kit in ${t0.ms} ms, no error`, { ms: t0.ms, flora: t0.lush?.flora, art: t0.lush?.art, errs: t0.errs });
    K.note('the arena\'s build (ms by part)', t0.buildMs);

    if (args.hue) {
      // the hue-report's frames: three poses (the spawn, the day water, the old water) × day, dusk, night, the UI hidden
      await hideUi(true);
      const poses = [['spawn', 44, 17], ['day-water', -51.5, -30], ['old-water', 3, 8]];
      for (const [ph, label] of [['calm', 'day'], ['dusk', 'dusk'], ['gloomtide', 'night']]) {
        await phase(ph); await settle(ph === 'calm' ? 1 : 4);
        for (const [name, x, z] of poses) { await put(x, z, 0); await settle(2); await K.shoot(`hue-${name}-${label}`); }
      }
      await hideUi(false);
    } else {
      K.step('w2: day');
      await phase('calm'); await settle(1);
      const day = [['east-pool-to-neck', 28, 2], ['neck-gill-harp', 6, 7.5], ['west-pool-mossback', -38, 2], ['veil', -70, 38], ['mother-cap', 47, 21], ['seep', 66, -14], ['reed-flats', -48, 27], ['lily-cove', -50, -26]];
      for (const [name, x, z] of day) { await put(x, z, 0); await settle(); await K.shoot(`${name}-day`); }
      const errs = await g(() => window.__gw.errors.slice());
      K.check(errs.length === 0, 'no ctx.errors on Sporewood by day', errs);
      // the home camera's pose (Rootfoot Landing, LOOP.mooring.sporewood.cam) and the whole basin from above
      const hc = await g(() => window.__gw.data.LOOP.mooring.sporewood.cam);
      await put(36.6, 30.5, 0); await settle(1);
      await cam(hc.pos, hc.look, hc.fov); await K.secs(0.5); await K.settle(300);
      await K.shoot('rootfoot-home-pose');
      await cam([-6, 150, 120], [-6, 0, 0], 50); await K.secs(0.5); await K.settle(400);
      await K.shoot('overhead-day');
      await uncam();

      K.step('w2: dusk and night');
      for (const [ph, label] of [['dusk', 'dusk'], ['gloomtide', 'night']]) {
        await phase(ph); await settle(4);
        for (const [name, x, z] of [['east-pool-to-neck', 28, 2], ['west-pool-mossback', -38, 2], ['reed-flats', -48, 27], ['mother-cap', 47, 21]]) { await put(x, z, 0); await settle(); await K.shoot(`${name}-${label}`); }
      }
      const perf = await g(() => { const r = window.__gw.render?.renderer; return r ? { calls: r.info.render.calls, tris: r.info.render.triangles } : null; });
      info.perf = perf;
      K.note('renderer info at night by the Mother Cap', perf);
      K.check((await g(() => window.__gw.errors.slice())).length === 0, 'no ctx.errors on Sporewood');
    }

    K.step('w2: back to the Mossmere');
    await g(() => window.__gw.bus.emit('zone:change', { zone: 'mossmere', prev: 'sporewood' }));
    await phase('calm');
    await put(0, 30, 0); await settle(2.5);
    const back = await g(() => ({ zone: window.__gw.world.getZone()?.id, lush: window.__gw.world.debugInfo?.()?.lush ?? null, errs: window.__gw.errors.slice() }));
    K.check(back.zone === 'mossmere' && back.lush === null && back.errs.length === 0, 'back on the Mossmere: no kit, no error', back);
    if (!args.hue) await K.shoot('mossmere-again');
  } catch (e) {
    if (e instanceof Abort) K.note('the walk stopped', e.message);
    else K.check(false, 'the walk threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
  }
  await K.release().catch(() => {});
  log('LAKE2_W2', JSON.stringify({ size: K.tag, failures: K.failures, notes: K.notes, info }));
  return { failures: K.failures };
}
