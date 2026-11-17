// LAKE 2, lane W1 in the browser (docs/loop/LAKE2.md §3.1, §9): Sporewood's outline shore, grey-box. A loop dev build from a fresh save;
// on the water the world is put on Sporewood (LOOP.shipped stays the Mossmere: no Sail reaches it yet, so the scenario sends zone:change
// itself) and the raft is driven at its banks: the neck, the West Pool and Mossback Isle, the Veil inlet, the East Pool and the Mother's
// Cup, Rootfoot cove; an overhead frame of the whole basin; day, dusk and night; then back to the Mossmere, as built.
//
//   node build.mjs --dev --out=tools/out/w1/dev.html
//   node tools/playtest.mjs --html=tools/out/w1/dev.html --shots=tools/out/w1/desk --script=tools/tests/lake2-w1.scenario.mjs --width=1280 --height=720
//   node tools/playtest.mjs --html=tools/out/w1/dev.html --shots=tools/out/w1/phone --script=tools/tests/lake2-w1.scenario.mjs --mobile --width=390 --height=844
//
// Prints `LAKE2_W1 {size, failures, notes, info}`; returns its failures.
import { makeKit, Abort } from './loop-1a.scenario.mjs';

export default async function (api) {
  const { page, evalGame: g, log } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: 'w1' });
  const info = {};
  const cam = (pos, look, fov) => g(({ pos, look, fov }) => window.__gw.render.setIntroCamera({ pos, look, fov, w: 1 }), { pos, look, fov });
  const uncam = () => g(() => window.__gw.render.setIntroCamera(null));
  const put = (x, z, yawDeg) => g(([x, z, y]) => { window.__gw.player.teleport({ x, z }, (y * Math.PI) / 180); window.__gw.render.snapCamera?.(); }, [x, z, yawDeg]);
  const phase = (p) => g((ph) => window.__gw.survival.setPhase(ph), p);
  try {
    K.step('w1: a fresh save, home, Sail onto the Mossmere');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => { window.__lp.ev.length = 0; window.__gw.game.beginIntro({ character: 'wick' }); });
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    await g(() => { const c = window.__gw; c.debug.loop.tow?.('cut'); c.debug.loop.tutorial('done'); c.ui.closeAll?.(); });
    K.need(await g(() => window.__gw.game.sail({ water: 'mossmere' })), 'Sail');
    K.need((await K.until("c.flow === 'playing' && c.fishing.state === 'idle'", 12)).ok, 'on the water');

    K.step('w1: the world on Sporewood (zone:change; the run stays the Mossmere\'s)');
    const t0 = await g(() => { const c = window.__gw, t = performance.now(); c.bus.emit('zone:change', { zone: 'sporewood', prev: 'mossmere' }); return { ms: performance.now() - t, zone: c.world.getZone()?.id, outline: !!c.world.getOutline(), errs: c.errors.slice(), arena: c.world.debugInfo?.()?.arena ?? null }; });
    info.build = t0;
    K.check(t0.zone === 'sporewood' && t0.outline && t0.errs.length === 0, `Sporewood built on its outline in ${t0.ms.toFixed(0)} ms, no error`, t0);
    await put(14, 8, 90); await K.secs(2.5); await K.settle(400);
    const near = await g(() => { const c = window.__gw, p = c.player.position; return { x: +p.x.toFixed(2), z: +p.z.toFixed(2), shore: +c.world.getShoreDist(p.x, p.z).toFixed(2), open: c.world.isOpenWater(p.x, p.z, 1.6) }; });
    K.check(near.shore >= 1.5, 'the raft put into the East Pool by the neck stands in open water', near);
    await K.shoot('neck-from-east-day');

    K.step('w1: the raft driven at the banks (the play\'s own movement, collided every frame)');
    const drive = await g(() => {
      const c = window.__gw, W = c.world, out = [];
      for (const [x, z, a] of [[14, 8, Math.PI], [-20, 0, Math.PI * 0.9], [44, 2, -Math.PI / 2], [30, 20, Math.PI * 0.75], [-40, 20, Math.PI / 2], [-70, 10, Math.PI]]) {
        const p = { x, z }; let worst = Infinity;
        for (let i = 0; i < 400; i++) { p.x += Math.cos(a) * 0.25; p.z += Math.sin(a) * 0.25; W.collide(p, 1.6); worst = Math.min(worst, W.getShoreDist(p.x, p.z)); }
        out.push({ from: [x, z], to: [+p.x.toFixed(1), +p.z.toFixed(1)], worst: +worst.toFixed(2) });
      }
      return out;
    });
    info.drive = drive;
    K.check(drive.every((d) => d.worst >= 1.5), 'the raft stays off every bank it was driven at (≥ 1.5 m: its radius)', drive);

    K.step('w1: frames at day');
    await put(-30, 12, -70); await K.secs(2); await K.settle(400);
    await K.shoot('west-pool-mossback-day');
    await put(-70, 30, -150); await K.secs(2); await K.settle(400);
    await K.shoot('veil-inlet-day');
    await put(36, 14, -40); await K.secs(2); await K.settle(400);
    await K.shoot('east-pool-cup-day');
    await put(-4, 8, 90); await K.secs(2); await K.settle(400);
    await K.shoot('neck-day');
    // the whole basin from above (a grey-box frame: the banks, the islands, the water's shore foam)
    await cam([-6, 150, 120], [-6, 0, 0], 50); await K.secs(0.5); await K.settle(400);
    await K.shoot('overhead-day');
    await cam([62, 22, 58], [10, 0, 0], 55); await K.secs(0.4); await K.settle(300);
    await K.shoot('rootfoot-over-east-pool');
    await uncam();

    K.step('w1: dusk and night');
    await put(36, 14, -40);
    await phase('dusk'); await K.secs(4); await K.settle(400);
    await K.shoot('east-pool-dusk');
    await phase('gloomtide'); await K.secs(5); await K.settle(400);
    await K.shoot('east-pool-night');
    await put(-30, 12, -70); await K.secs(2); await K.settle(400);
    await K.shoot('west-pool-night');
    const perf = await g(() => { const r = window.__gw.render?.renderer; return r ? { calls: r.info.render.calls, tris: r.info.render.triangles } : null; });
    info.perf = perf;
    K.note('renderer info at night on the West Pool', perf);
    K.check((await g(() => window.__gw.errors.slice())).length === 0, 'no ctx.errors on Sporewood');

    K.step('w1: back to the Mossmere');
    await g(() => window.__gw.bus.emit('zone:change', { zone: 'mossmere', prev: 'sporewood' }));
    await phase('calm');
    await put(0, 30, 0); await K.secs(2.5); await K.settle(400);
    const back = await g(() => ({ zone: window.__gw.world.getZone()?.id, outline: !!window.__gw.world.getOutline(), errs: window.__gw.errors.slice() }));
    K.check(back.zone === 'mossmere' && !back.outline && back.errs.length === 0, 'back on the Mossmere: its polar shore, no error', back);
    await K.shoot('mossmere-again');
  } catch (e) {
    if (e instanceof Abort) K.note('the walk stopped', e.message);
    else K.check(false, 'the walk threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
  }
  await K.release().catch(() => {});
  log('LAKE2_W1', JSON.stringify({ size: K.tag, failures: K.failures, notes: K.notes, info }));
  return { failures: K.failures };
}
