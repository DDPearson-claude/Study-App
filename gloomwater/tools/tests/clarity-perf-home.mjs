// clarity-perf --home (M1 §2.14, §4 step 5a; risk 2): what the home barge costs, measured as clarity-perf measures (draw calls of
// whole frames the scenario renders itself with the page's frames held, the CPU the GPU and renderer processes spent on them), in
// two cases per tier (low, medium, high):
//   first-light   flow home at the barge, the home camera, every M1 home object fitted (the Bait Bed's two planters, Barge lights
//                 I's rail lanterns, wing I, the rod on its rack, the sill's stones, the Mossmere's gilded), Murk moored
//   night-water   a trip at night from open water (the raft at (-6, 8)), the lens on the Jetty with the barge in frame
// For each: the frame's calls (all passes), the barge's own share by pass (the frame drawn again with the barge hidden: main pass,
// mirror (water.reflection.calls) and shadow (the shadow refresh's difference)), the PointLights lit (none of them the barge's,
// Murk's at 0), cpuMs with and without the barge, and the barge's share of the frame. The gates: the barge ≤ 6 main-pass, ≤ 2 mirror,
// ≤ 2 shadow calls; the frame ≤ 200 (high, medium) / ≤ 150 (low); no PointLight of the barge's and Murk's lamp at 0.
// Written to <shots>/perf-home.json (perf-home-phone.json with --mobile). Run through clarity-perf.scenario.mjs --home:
//   node tools/playtest.mjs --html=tools/out/m1-s5a/dev.html --shots=tools/out/m1-s5a/perf --script=tools/tests/clarity-perf.scenario.mjs --home --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/m1-s5a/dev.html --shots=tools/out/m1-s5a/perf --script=tools/tests/clarity-perf.scenario.mjs --home --mobile
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const LINES = { high: { frame: 200 }, medium: { frame: 200 }, low: { frame: 150 } };
const BARGE = { main: 6, mirror: 2, shadow: 2 };

export async function homePerf(api) {
  const { page, wait, evalGame: g, log, args, width, height } = api;
  page.setDefaultTimeout(300000);
  const failures = [];
  const phone = !!args.mobile || width < height;
  const N = Math.max(2, Number(args.frames) || 6);
  const tiers = typeof args.tiers === 'string' ? args.tiers.split(',') : ['low', 'medium', 'high'];
  const shotsDir = resolve(process.cwd(), String(args.shots || 'tools/out/m1-s5a/perf'));
  mkdirSync(shotsDir, { recursive: true });
  const base = page.url().split('?')[0];
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 300000 });
  await g(() => { const c = window.__gw; c.game.save = () => {}; localStorage.clear(); });
  await page.goto(base + '?loop=1', { waitUntil: 'load', timeout: 300000 });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title' && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 });
  // home at the barge with every M1 home object
  await g(() => {
    const c = window.__gw;
    c.game.beginIntro({ character: 'wick' });
    c.debug.loop.tutorial('done');
    const L = c.state.meta.loop;
    L.home.baitBed = 2; L.home.lights = 1; L.home.wall = 1; L.home.orders = 2; L.tackle.rod = 2;
    L.barge = { water: 'mossmere', towed: ['mossmere'] }; L.legends = { ...(L.legends || {}), belled_matriarch: true };
    c.ui.closeAll?.();
  });
  await page.waitForFunction(() => window.__gw.flow === 'home' && !window.__gw.game.homeGlide?.(), null, { timeout: 120000, polling: 300 });
  await api.frames(3);
  const cdp = await page.context().browser().newBrowserCDPSession();
  const cpu = async () => { const { processInfo } = await cdp.send('SystemInfo.getProcessInfo'); return processInfo.filter((p) => /^(gpu|renderer)$/i.test(String(p.type))).reduce((s, p) => s + (p.cpuTime || 0), 0); };
  await g(() => {
    const c = window.__gw, raf = window.requestAnimationFrame.bind(window);
    let held = null;
    window.requestAnimationFrame = (cb) => { if (held) { held.push(cb); return 0; } return raf(cb); };
    window.__ph = {
      hold(on) { if (on) { held = held || []; return; } if (held) { const q = held; held = null; for (const cb of q) raf(cb); } },
      pump(sec) { let t = c.time.t; for (let i = 0, n = Math.max(1, Math.round(sec / 0.05)); i < n; i++) { t += 0.05; c.time.t = t; c.time.dt = 0.05; for (const name of ['actors', 'models', 'world', 'water', 'render']) { const m = c[name]; if (!m || m.isStub || typeof m.update !== 'function') continue; try { m.update(0.05, t); } catch { /* keep pumping */ } } } },
      /** n frames with (or without) the shadow's refresh: the most calls of any, the mirror's of the last */
      frames(n, refresh) {
        const R = c.render, rr = R.renderer, gl = rr.getContext(), px = new Uint8Array(4), t = [];
        let key = null; R.scene.traverse((o) => { if (o.isDirectionalLight && o.castShadow && o.shadow) key = o; });
        let calls = 0;
        for (let i = 0; i < n; i++) { if (key) key.shadow.needsUpdate = !!refresh; const a = performance.now(); R.render(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); t.push(performance.now() - a); calls = Math.max(calls, rr.info.render.calls); }
        return { calls, mirror: c.water?.reflection?.on ? c.water.reflection.calls : 0, shadowMap: !!key && rr.shadowMap.enabled, wallMs: Math.round(Math.min(...t)) };
      },
      lights() {
        const h = c.actors.home?.object3d, out = { lit: 0, barge: 0, murk: c.actors.merchantLight.intensity, murkMode: c.actors.merchant.mode, names: [] };
        c.render.scene.traverse((o) => { if (!o.isPointLight || !(o.intensity > 0)) return; out.lit++; out.names.push(o.name || o.parent?.name || '?'); for (let p = o; p; p = p.parent) if (p === h) out.barge++; });
        return out;
      },
      barge(on) { const h = c.actors.home; if (h) h.object3d.visible = !!on; },
    };
  });
  // one case: the frame as it is, then with the barge hidden; the barge's share by pass
  const measure = async (name, tier) => {
    const on = await g((N) => { const P = window.__ph; P.barge(true); return { n: P.frames(N, false), s: P.frames(2, true), lights: P.lights() }; }, N);
    const c0 = await cpu();
    await g((N) => window.__ph.frames(N, false), N);
    const cpuOn = (await cpu() - c0) * 1000 / N;
    const off = await g((N) => { const P = window.__ph; P.barge(false); const r = { n: P.frames(N, false), s: P.frames(2, true) }; return r; }, N);
    const c1 = await cpu();
    await g((N) => window.__ph.frames(N, false), N);
    const cpuOff = (await cpu() - c1) * 1000 / N;
    await g(() => window.__ph.barge(true));
    const mirror = on.n.mirror - off.n.mirror;
    const shadow = Math.max(0, (on.s.calls - on.n.calls) - (off.s.calls - off.n.calls));
    const main = (on.n.calls - off.n.calls) - mirror;
    const frame = Math.max(on.n.calls, on.s.calls);
    const r = {
      frame, frameNoShadowRefresh: on.n.calls, barge: { main, mirror, shadow, all: frame - Math.max(off.n.calls, off.s.calls) },
      share: +((frame - Math.max(off.n.calls, off.s.calls)) / frame).toFixed(3), cpuMs: Math.round(cpuOn), cpuMsWithout: Math.round(cpuOff),
      cpuShare: cpuOn > 0 ? +(Math.max(0, cpuOn - cpuOff) / cpuOn).toFixed(3) : null, lights: on.lights, wallMs: on.n.wallMs, shadowMap: on.s.shadowMap,
    };
    const line = LINES[tier] || LINES.high;
    if (r.barge.main > BARGE.main) failures.push(`home ${tier}-${name}: the barge's ${r.barge.main} main-pass calls over ${BARGE.main}`);
    if (r.barge.mirror > BARGE.mirror) failures.push(`home ${tier}-${name}: the barge's ${r.barge.mirror} mirror calls over ${BARGE.mirror}`);
    if (r.barge.shadow > BARGE.shadow) failures.push(`home ${tier}-${name}: the barge's ${r.barge.shadow} shadow calls over ${BARGE.shadow}`);
    if (r.frame > line.frame) failures.push(`home ${tier}-${name}: the frame's ${r.frame} calls over ${line.frame}`);
    if (r.lights.barge > 0) failures.push(`home ${tier}-${name}: the barge lights ${r.lights.barge} PointLight(s)`);
    if (r.lights.murk !== 0) failures.push(`home ${tier}-${name}: Murk's lamp's PointLight at ${r.lights.murk} (moored: 0)`);
    return r;
  };
  const perf = {};
  for (const tier of tiers) {
    // (the arena is built for the tier in force when its lake is entered: a fresh zone build at this tier)
    await g((tier) => { const c = window.__gw; window.__ph.hold(false); c.state.meta.settings.quality = tier; c.render.setQuality(tier); c.world.setZone?.('sporewood', { instant: true }); c.world.setZone?.('mossmere', { instant: true }); }, tier);
    await api.frames(3);
    // first light at home, the home camera
    try {
      await g(() => { const c = window.__gw, P = window.__ph; if (c.flow !== 'home') c.game.toHome?.(); c.ui.closeAll?.(); P.hold(true); P.pump(4); c.render.snapCamera?.(); P.pump(0.5); c.render.render(); });
      const r = await measure('first-light', tier);
      perf[`${tier}-first-light`] = r;
      log(`perf-home ${tier}-first-light ${JSON.stringify(r)}`);
      if (args.shots && !args.noshots) await api.shot(`perf-${phone ? 'phone' : 'desk'}-${tier}-first-light`);
    } catch (e) { failures.push(`perf-home ${tier}-first-light: ${e?.message || e}`); }
    await g(() => window.__ph.hold(false)).catch(() => {});
    await api.frames(1);
  }
  // the evening from open water at night: a trip, the raft out, the lens on the Jetty (the barge in frame)
  await g(() => { const c = window.__gw; window.__ph.hold(false); c.ui.closeAll?.(); c.game.sail({ water: 'mossmere' }); });
  await page.waitForFunction(() => window.__gw.flow === 'playing' && !window.__gw.game.homeGlide?.(), null, { timeout: 300000, polling: 300 });
  await api.frames(2);
  for (const tier of tiers) {
    await g((tier) => { const c = window.__gw; window.__ph.hold(false); c.state.meta.settings.quality = tier; c.render.setQuality(tier); c.world.setZone?.('sporewood', { instant: true }); c.world.setZone?.('mossmere', { instant: true }); }, tier);
    await api.frames(3);
    try {
      await g(() => {
        const c = window.__gw, P = window.__ph, r = c.state.run;
        if (r.phase !== 'gloomtide') c.debug.setPhase?.('gloomtide');
        const i = c.survival.getPhaseInfo?.(); if (i && i.duration > 0) r.phaseTime = i.duration * 0.35;
        c.player.teleport({ x: -6, z: 8 }, 0);
        c.render.setIntroCamera({ pos: [-8, 6, 4], look: [18, 1.5, 42], fov: 40, w: 1 });
        P.hold(true); P.pump(5); c.render.snapCamera?.(); P.pump(0.5); c.render.render();
      });
      const r = await measure('night-water', tier);
      perf[`${tier}-night-water`] = r;
      log(`perf-home ${tier}-night-water ${JSON.stringify(r)}`);
      if (args.shots && !args.noshots) await api.shot(`perf-${phone ? 'phone' : 'desk'}-${tier}-night-water`);
    } catch (e) { failures.push(`perf-home ${tier}-night-water: ${e?.message || e}`); }
    await g(() => { window.__ph.hold(false); window.__gw.render.setIntroCamera(null); }).catch(() => {});
    await api.frames(1);
  }
  writeFileSync(resolve(shotsDir, phone ? 'perf-home-phone.json' : 'perf-home.json'), JSON.stringify({ width, height, frames: N, budget: { barge: BARGE, frame: LINES }, perf }, null, 1));
  await wait(100);
  return { failures };
}
