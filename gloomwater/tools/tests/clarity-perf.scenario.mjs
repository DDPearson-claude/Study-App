// What a frame costs per quality tier, measured so that a busy machine does not spoil it (the "Clear Night" pass,
// docs/v3/clarity/SPEC.md §10). clarity-shots.scenario.mjs --perf times frames on the wall clock, which on a shared software-GL
// box swings by ±50 % with whatever else is running. This scenario reads the CPU time the browser's GPU and renderer processes
// actually spent on N synchronous frames (CDP SystemInfo.getProcessInfo), which stays put under load, and the wall-clock
// minimum beside it.
//
//   node tools/playtest.mjs --html=tools/out/clarity/dev.html --shots=tools/out/clarity/perf --script=tools/tests/clarity-perf.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/clarity/dev.html --shots=tools/out/clarity/perf --script=tools/tests/clarity-perf.scenario.mjs --mobile
//   options: --frames=8 (frames per measurement), --tiers=low,medium,high, --flagoff
//
// Per tier and phase (the Mossmere from the spawn, calm and the Gloomtide, the v3 phase-1 game on a Still night): draw calls,
// triangles, points, the pass list, the HDR target, cpuMs (CPU milliseconds per frame, GPU + renderer process), wallMs (the
// fastest frame on the wall clock). Written to <shots>/perf-cpu.json (perf-cpu-phone.json with --mobile).
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

export default async function (api) {
  const { page, wait, evalGame: g, log, args, width, height } = api;
  page.setDefaultTimeout(300000);
  const failures = [];
  const phone = !!args.mobile || width < height;
  const N = Math.max(2, Number(args.frames) || 8);
  const tiers = typeof args.tiers === 'string' ? args.tiers.split(',') : ['low', 'medium', 'high'];
  const shotsDir = resolve(process.cwd(), String(args.shots || 'tools/out/clarity/perf'));
  mkdirSync(shotsDir, { recursive: true });

  const atTitle = () => page.waitForFunction(() => window.__gw && (window.__gw.flow === 'title' || window.__gw.flow === 'hub') && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 });
  await page.waitForFunction(() => window.__gw && (window.__gw.flow === 'title' || window.__gw.flow === 'hub'), null, { timeout: 300000 });
  await g(() => window.__gw.game.wipeAll());
  if (!args.flagoff) await page.goto(page.url().split('?')[0] + '?v3=1&v3phase=1', { waitUntil: 'load', timeout: 300000 });
  await atTitle();

  // a returning player on a Still night, the page's own frame loop held (the scenario renders the frames itself)
  await g((flagOff) => {
    const c = window.__gw, m = c.state.meta;
    m.runs = 3; m.deaths = 3; m.bestDay = 3;
    if (m.firstEvening) m.firstEvening.done = true;
    try { c.debug.firstEvening?.('done'); } catch { /* optional */ }
    m.seenTips = m.seenTips || {}; for (const t of c.data.TIPS || []) if (t?.id) m.seenTips[t.id] = true;
    const raf = window.requestAnimationFrame.bind(window);
    let held = null;
    window.requestAnimationFrame = (cb) => { if (held) { held.push(cb); return 0; } return raf(cb); };
    window.__pf = {
      hold(on) { if (on) { held = held || []; return; } if (held) { const q = held; held = null; for (const cb of q) raf(cb); } },
      pump(sec) {
        let t = c.time.t;
        for (let i = 0, n = Math.max(1, Math.round(sec / 0.05)); i < n; i++) {
          t += 0.05; c.time.t = t; c.time.dt = 0.05;
          for (const name of ['actors', 'models', 'world', 'water', 'render']) { const mod = c[name]; if (!mod || mod.isStub || typeof mod.update !== 'function') continue; try { mod.update(0.05, t); } catch { /* keep pumping */ } }
        }
      },
      // the arena is built for the quality in force when its lake is entered: leave and come back
      goZone(zone) {
        const r = c.state.run;
        try { c.debug.unlockZone?.(zone); } catch { /* optional */ }
        if (!(r.zonesUnlocked || []).includes(zone)) r.zonesUnlocked = [...(r.zonesUnlocked || []), zone];
        try { c.combat.killAll?.('debug'); } catch { /* optional */ }
        try { c.fishing.cancel?.('debug'); } catch { /* optional */ }
        if (r.zone !== zone) { r.zone = zone; r.gateOpen = false; c.bus.emit('zone:change', { zone, prev: null }); }
        try { const sp = c.world.getSpawn?.(); if (sp?.position) c.player.teleport?.(sp.position, sp.yaw || 0); } catch { /* optional */ }
      },
      clearUi() {
        for (let i = 0; i < 12 && c.combat?.pendingOptions?.length; i++) { try { c.combat.chooseBoon?.(c.combat.pendingOptions[0].boonId); } catch { break; } }
        try { if (c.ui?.isBlocking?.()) c.ui.closeAll?.(); if (c.paused) c.game.resume?.(); } catch { /* optional */ }
      },
    };
    window.__pf.clearUi();
    c.game.startNewRun(flagOff ? {} : { character: 'wick', nightMode: 'still' });
  }, !!args.flagoff);
  await page.waitForFunction(() => window.__gw.flow === 'playing', null, { timeout: 300000, polling: 300 });
  await api.frames(4);

  // CPU seconds the GPU and renderer processes have used so far
  const cdp = await page.context().browser().newBrowserCDPSession();
  const cpu = async () => {
    const { processInfo } = await cdp.send('SystemInfo.getProcessInfo');
    return processInfo.filter((p) => /^(gpu|renderer)$/i.test(String(p.type))).reduce((s, p) => s + (p.cpuTime || 0), 0);
  };

  const perf = {};
  for (const tier of tiers) {
    await g((tier) => { const c = window.__gw, P = window.__pf; P.hold(false); c.state.meta.settings.quality = tier; c.render.setQuality(tier); P.clearUi(); P.goZone('sporewood'); }, tier);
    await api.frames(2);
    await g(() => { window.__pf.clearUi(); window.__pf.goZone('mossmere'); });
    await api.frames(3);
    for (const phase of ['calm', 'gloomtide']) {
      try {
        await g(({ tier, phase }) => {
          const c = window.__gw, P = window.__pf;
          P.hold(false);
          c.state.meta.settings.quality = tier; c.render.setQuality(tier);
          P.clearUi();
          try { c.debug.god?.(true); c.debug.setOil?.(72); c.debug.setSatiety?.(80); c.debug.setHp?.(99); } catch { /* optional */ }
          if (c.state.run.phase !== phase) c.debug.setPhase?.(phase);
          const info = c.survival.getPhaseInfo?.();
          if (info && info.duration > 0) c.state.run.phaseTime = info.duration * 0.35;
          try { c.combat.killAll?.('debug'); } catch { /* optional */ }
        }, { tier, phase });
        await api.frames(3);   // shader compiles for the tier, the phase's lamps
        const prep = await g(() => { const P = window.__pf, c = window.__gw; P.clearUi(); P.hold(true); P.pump(7); c.render.snapCamera?.(); P.pump(0.5); c.render.render(); c.render.render(); return true; });
        if (!prep) throw new Error('could not settle the frame');
        const c0 = await cpu();
        const r = await g((N) => {
          const c = window.__gw, R = c.render, rr = R.renderer, gl = rr.getContext(), px1 = new Uint8Array(4), t = [];
          // (a 1-pixel read-back makes the GL thread finish the frame, so the time is the frame's and not the command queue's)
          for (let i = 0; i < N; i++) { const a = performance.now(); R.render(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px1); t.push(performance.now() - a); }
          const i = rr.info, rt = R.composer.renderTarget1;
          return {
            calls: i.render.calls, triangles: i.render.triangles, points: i.render.points, programs: i.programs?.length ?? null,
            passes: R.composer.passes.filter((p) => p.enabled !== false).map((p) => p.constructor.name.replace(/^_/, '')),
            hdrTarget: [Math.floor(rt.width), Math.floor(rt.height), rt.samples], pixelRatio: +rr.getPixelRatio().toFixed(3),
            shadowMaps: rr.shadowMap.enabled ? 1 : 0, wallMs: Math.round(Math.min(...t)),
          };
        }, N);
        const c1 = await cpu();
        r.cpuMs = Math.round((c1 - c0) * 1000 / N);
        perf[`${tier}-${phase}`] = r;
        log(`perf ${tier}-${phase} ${JSON.stringify(r)}`);
        await g(() => window.__pf.hold(false));
      } catch (e) { failures.push(`perf ${tier}-${phase}: ${e?.message || e}`); await g(() => window.__pf.hold(false)).catch(() => {}); }
    }
  }
  writeFileSync(resolve(shotsDir, phone ? 'perf-cpu-phone.json' : 'perf-cpu.json'), JSON.stringify({ width, height, frames: N, perf }, null, 1));
  await wait(100);
  return { failures };
}
