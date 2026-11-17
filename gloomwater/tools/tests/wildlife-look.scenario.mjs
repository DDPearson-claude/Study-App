// tools/tests/wildlife-look.scenario.mjs — the Mossmere's wildlife looked at (LOOP.wildlife: the wick-moths, the lampbills, the heron made
// to count), at home and on a trip, by day, at dusk and at night: each creature from the play camera and through a close lens, and the
// frame's cost with them and without them (CPU ms of the GPU and renderer processes over N synchronous frames, as clarity-perf).
//   node tools/playtest.mjs --html=<dev.html> --shots=<dir> --script=tools/tests/wildlife-look.scenario.mjs --width=1280 --height=720
//   node tools/playtest.mjs --html=<dev.html> --shots=<dir> --script=tools/tests/wildlife-look.scenario.mjs --mobile --width=820 --height=900
//   options: --frames=3 (frames per cost measurement), --noperf
import { makeKit3a, seededSave } from './loop-3a.scenario.mjs';

export default async function (api) {
  const { page, evalGame: g, log, args } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit3a(api, { label: 'wild' });
  const safe = async (what, fn) => { try { await fn(); } catch (e) { K.note(`${what} failed: ${String(e?.message || e).split('\n')[0]}`); } };
  const shot = async (name, sec = 2) => { await K.secs(sec); await K.shoot(name); };
  const cam = (p) => K.places.camera(p);
  const wild = () => g(() => { const c = window.__gw; return { w: c.debug.wildlife?.() ?? null, heron: c.debug.heron?.() ?? null, q: c.render.quality, flow: c.flow, phase: c.state.run?.phase ?? null }; });
  const info = async (tag) => { const s = await wild(); log('wild', tag, JSON.stringify(s).slice(0, 900)); return s; };
  // a lens on a point from the south-east (the play camera's side), dist m off and h m up
  const lens = (p, dist = 3.2, h = 1.1, fov = 40) => cam({ pos: [p.x + dist * 0.55, (p.y || 0) + h, p.z + dist * 0.84], look: [p.x, (p.y || 0) + 0.15, p.z], fov });
  const groupAt = (s, gi) => { const b = (s.w?.lampbills || []).filter((q) => q.g === gi); if (!b.length) return null; return { x: b.reduce((a, q) => a + q.x, 0) / b.length, z: b.reduce((a, q) => a + q.z, 0) / b.length }; };
  try {
    K.step('boot');
    await K.boot(seededSave({ clams: 3000, holdSlots: 6 }));
    await K.toJetty();
    await K.tap('[data-loop=jetty] .gw-x').catch(() => {});
    let s = await info('home');
    K.need(s.w && s.w.on === true, 'the wildlife is on at home', s.w);
    await shot('home', 3);
    await safe('home lenses', async () => {
      const lamp = await g(() => { const h = window.__gw.actors?.home?.lamps?.(); return h?.pts?.[0] ? { x: h.pts[0][0], y: h.pts[0][1], z: h.pts[0][2] } : null; });
      if (lamp) { await lens(lamp, 1.6, 0.35, 38); await shot('home-moths-barge', 1.5); }
      const lantern = await g(() => { const v = window.__gw.actors?.lanternLight?.getWorldPosition?.(new window.__gw.render.camera.position.constructor()); return v ? { x: v.x, y: v.y, z: v.z } : null; });
      if (lantern) { await lens(lantern, 2.0, 0.5, 40); await shot('home-moths-raft', 1.5); }
      s = await info('home2');
      const gB = groupAt(s, 1);
      if (gB) { await lens(gB, 4.5, 1.4, 38); await shot('home-lampbills', 1.5); }
      await cam(null);
    });

    K.step('trip by day: the lampbills and the heron');
    await K.sail(null);
    await K.places.unlift();
    await K.places.light('calm', 0.4);
    s = await info('trip');
    const gA = groupAt(s, 0) || { x: -19.5, z: 20 };
    await K.places.pose(gA.x - 3, gA.z + 12); await shot('day-lampbills-play', 4);
    await lens(gA, 4.2, 1.3, 38); await shot('day-lampbills-close', 2.5); await shot('day-lampbills-close2', 2.5);
    await cam(null);
    await safe('heron', async () => {
      await K.places.light('dusk', 0.3);
      await K.places.pose(0, 12); await K.secs(2);
      const h = (await info('heron'))?.heron;
      if (h && h.mode !== 'gone') {
        await K.places.pose(h.x, h.z + 13); await shot('dusk-heron-play', 2);
        const h2 = (await info('heron2'))?.heron || h;
        await lens(h2, 4.5, 1.4, 40); await shot('dusk-heron-close', 0.8); await cam(null);
      } else K.note('no heron standing');
    });

    K.step('dusk: the moths wake at the lamps');
    await K.places.light('dusk', 0.8);
    const post = await g(() => { const c = window.__gw, L = c.world.getLampSpots?.() || []; const p = L.filter((l) => l.kind === 'post' && Math.hypot(l.x, l.z) < 45).sort((a, b) => Math.hypot(a.x + 20, a.z - 10) - Math.hypot(b.x + 20, b.z - 10))[0]; return p ? { x: p.x, y: p.y, z: p.z } : null; });
    if (post) {
      await K.places.pose(post.x + 1.5, post.z + 7); await shot('dusk-post-play', 3);
      await lens(post, 1.8, 0.4, 38); await shot('dusk-post-close', 1.5); await cam(null);
    }
    const lantern = await g(() => { const v = window.__gw.actors?.lanternLight?.getWorldPosition?.(new window.__gw.render.camera.position.constructor()); return v ? { x: v.x, y: v.y, z: v.z } : null; });
    if (lantern) { await lens(lantern, 2.2, 0.6, 42); await shot('dusk-raft-lantern', 1.5); await cam(null); }
    await info('dusk');

    K.step('night: the moths thick at the lamps, the birds asleep, the heron on its roost');
    await K.places.lift('buoy_lights', { play: false }).catch(() => {});
    await K.places.light('gloomtide', 0.5);
    await K.places.pose(-45, 13); await shot('night-buoy-lights', 4);
    await info('night');
    await cam({ pos: [-44, 3.2, 4], look: [-48, 0.8, -4], fov: 44 }); await shot('night-buoy-close', 1.5); await cam(null);
    s = await info('night2');
    const gC = groupAt(s, 2) || { x: 13.4, z: -24.6 };
    await K.places.pose(gC.x - 1, gC.z + 12); await shot('night-lampbills-play', 4);
    await lens(gC, 3.8, 1.2, 38); await shot('night-lampbills-close', 1);
    await cam(null);
    const h = (await info('night-heron'))?.heron;
    if (h) { await K.places.pose(h.x + 1, h.z + 13); await shot('night-heron-play', 3); await lens(h, 4.5, 1.3, 40); await shot('night-heron-close', 0.8); await cam(null); }

    if (!args.noperf) {
      K.step('cost: the frame with and without the wildlife');
      await K.places.pose(-45, 13); await K.secs(2);
      const N = Math.max(2, Number(args.frames) || 3);
      const cdp = await page.context().browser().newBrowserCDPSession();
      const cpu = async () => { const { processInfo } = await cdp.send('SystemInfo.getProcessInfo'); return processInfo.filter((p) => /^(gpu|renderer)$/i.test(String(p.type))).reduce((a, p) => a + (p.cpuTime || 0), 0); };
      const measure = (vis, n) => g(([vis, N]) => {
        const c = window.__gw, R = c.render, rr = R.renderer, gl = rr.getContext(), px = new Uint8Array(4);
        for (const nm of ['wickMoths', 'lampbills', 'heron']) { const o = R.scene.getObjectByName(nm); if (o) o.visible = vis.includes(nm); }
        let calls = 0, tris = 0;
        for (let i = 0; i < N; i++) { R.render(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); calls = Math.max(calls, rr.info.render.calls); tris = Math.max(tris, rr.info.render.triangles); }
        return { calls, tris, q: R.quality };
      }, [vis, n]);
      const ALL = ['wickMoths', 'lampbills', 'heron'];
      await measure(ALL, 1);   // (a warm frame: every program compiled)
      const out = {};
      for (const [name, vis] of [['base', ['heron']], ['wild', ALL], ['base2', ['heron']], ['wild2', ALL], ['none', []]]) {
        const c0 = await cpu(); const r = await measure(vis, N); const c1 = await cpu();
        out[name] = { ...r, cpuMs: Math.round(((c1 - c0) * 1000) / N) };
      }
      log('perf', JSON.stringify(out));
      K.note(`perf ${JSON.stringify(out)}`);
    }
  } catch (e) {
    K.note(`scenario stopped: ${String(e?.message || e).split('\n')[0]}`);
  }
  return K.finish ? K.finish() : undefined;
}
