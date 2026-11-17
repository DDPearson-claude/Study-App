// What a frame costs per quality tier, measured so that a busy machine does not spoil it (the "Clear Night" pass,
// docs/v3/clarity/SPEC.md §10). clarity-shots.scenario.mjs --perf times frames on the wall clock, which on a shared software-GL
// box swings by ±50 % with whatever else is running. This scenario reads the CPU time the browser's GPU and renderer processes
// actually spent on N synchronous frames (CDP SystemInfo.getProcessInfo), which stays put under load, and the wall-clock
// minimum beside it.
//
//   node tools/playtest.mjs --html=tools/out/clarity/dev.html --shots=tools/out/clarity/perf --script=tools/tests/clarity-perf.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/clarity/dev.html --shots=tools/out/clarity/perf --script=tools/tests/clarity-perf.scenario.mjs --mobile
//   options: --frames=8 (frames per measurement), --tiers=low,medium,high, --flagoff
//   --loop (M1 step 3a, PLAN T148): the loop's Mossmere at night from the step-2 save (?loop=1; --redress adds ?redress=1): per tier,
//   the four banks up with a giant's back turning, every place lifted, and a giant's show where the build can force one; each with
//   the frame's calls and the world's own (the frame's less the frame drawn with the world hidden), checked against DESIGN §25.8.8's
//   lines (frame <= 200 / 150, world <= 54 / 42; high / low, medium held to the high line), and cpuMs. Written to perf-loop[-phone]
//   [-redress].json; with --base=<file> (the step-2 baseline, perf-base*.json) each tier's cpuMs is checked at <= +15% of it.
//
// Per tier and phase (the Mossmere from the spawn, calm and the Gloomtide, the v3 phase-1 game on a Still night): draw calls and
// triangles of the costliest frame (all passes: the shadow map on its own beat, the lake's mirror, the scene, the post chain),
// callsMin, the mirror's own share, points, the pass list, the HDR target, cpuMs (CPU milliseconds per frame, GPU + renderer
// process, averaged over the frames), wallMs (the fastest frame on the wall clock). Written to <shots>/perf-cpu.json (perf-cpu-phone.json with --mobile).
// --home (M1 step 5a, §2.14): the home barge's cost at first light and at night from open water, tools/tests/clarity-perf-home.mjs.
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export default async function (api) {
  if (api.args.loop) return loopPerf(api);
  const { page, wait, evalGame: g, log, args, width, height } = api;
  page.setDefaultTimeout(300000);
  if (args.home) return (await import('./clarity-perf-home.mjs')).homePerf(api);
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
          // the key light's shadow map is refreshed on the world's beat (world.update asks for it: every frame on high, every
          // second frame on medium); these frames are rendered without world.update, so the scenario keeps that beat itself —
          // without it the shadow pass would be missing from the cost
          let key = null; R.scene.traverse((o) => { if (o.isDirectionalLight && o.castShadow && o.shadow) key = o; });
          const every = Math.max(1, (R.clarity && R.clarity.shadowEvery) | 0);
          let calls = 0, triangles = 0, callsMin = Infinity;
          // (a 1-pixel read-back makes the GL thread finish the frame, so the time is the frame's and not the command queue's)
          for (let i = 0; i < N; i++) {
            if (key) key.shadow.needsUpdate = i % every === 0;
            const a = performance.now(); R.render(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px1); t.push(performance.now() - a);
            if (rr.info.render.calls > calls) { calls = rr.info.render.calls; triangles = rr.info.render.triangles; }
            callsMin = Math.min(callsMin, rr.info.render.calls);
          }
          const i = rr.info, rt = R.composer.renderTarget1, mirror = c.water && c.water.reflection;
          return {
            // calls / triangles: the costliest frame of the run (on medium: a frame with the shadow refresh); callsMin: the cheapest
            calls, triangles, callsMin, shadowEvery: key ? every : 0, mirror: mirror && mirror.on ? { calls: mirror.calls, triangles: mirror.triangles, size: [mirror.width, mirror.height] } : null,
            points: i.render.points, programs: i.programs?.length ?? null,
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

// ================================================================== --loop (M1 step 3a, T148)
const LOOP_LINES = { high: { frame: 200, world: 54 }, medium: { frame: 200, world: 54 }, low: { frame: 150, world: 42 } };
export async function loopPerf(api) {
  const { page, wait, evalGame: g, log, args, width, height } = api;
  page.setDefaultTimeout(300000);
  const failures = [];
  const phone = !!args.mobile || width < height;
  const N = Math.max(2, Number(args.frames) || 6);
  const tiers = typeof args.tiers === 'string' ? args.tiers.split(',') : ['low', 'medium', 'high'];
  const shotsDir = resolve(process.cwd(), String(args.shots || 'tools/out/m1-s3a/perf'));
  mkdirSync(shotsDir, { recursive: true });
  const { seededSave } = await import('./loop-3a.scenario.mjs');
  const base = page.url().split('?')[0], q = `?loop=1${args.redress ? '&redress=1' : ''}`;
  const atTitle = () => page.waitForFunction(() => window.__gw && window.__gw.flow === 'title' && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 });
  await page.waitForFunction(() => window.__gw && (window.__gw.flow === 'title' || window.__gw.flow === 'hub'), null, { timeout: 300000 });
  await g((sv) => { const c = window.__gw; c.game.save = () => {}; localStorage.clear(); localStorage.setItem('gloomwater.save.v1', JSON.stringify(sv)); }, seededSave({ clams: 3000, holdSlots: 6 }));
  await page.goto(base + q, { waitUntil: 'load', timeout: 300000 });
  await atTitle();
  await g(() => { const c = window.__gw; c.game.continueRun(); });
  await page.waitForFunction(() => window.__gw.flow === 'home', null, { timeout: 300000, polling: 300 });
  await g(() => { const c = window.__gw; try { c.ui.closeAll?.(); } catch { /* optional */ } c.game.sail({ water: 'mossmere' }); });
  await page.waitForFunction(() => window.__gw.flow === 'playing' && window.__gw.state.run?.outing === 'trip' && !window.__gw.game.homeGlide?.(), null, { timeout: 300000, polling: 300 });
  await api.frames(3);
  const cdp = await page.context().browser().newBrowserCDPSession();
  const cpu = async () => { const { processInfo } = await cdp.send('SystemInfo.getProcessInfo'); return processInfo.filter((p) => /^(gpu|renderer)$/i.test(String(p.type))).reduce((s, p) => s + (p.cpuTime || 0), 0); };
  // the page's own frames held; the scenario pumps the modules and renders the frames it measures
  await g(() => {
    const c = window.__gw, raf = window.requestAnimationFrame.bind(window);
    let held = null;
    window.requestAnimationFrame = (cb) => { if (held) { held.push(cb); return 0; } return raf(cb); };
    window.__pl = {
      hold(on) { if (on) { held = held || []; return; } if (held) { const q = held; held = null; for (const cb of q) raf(cb); } },
      pump(sec) { let t = c.time.t; for (let i = 0, n = Math.max(1, Math.round(sec / 0.05)); i < n; i++) { t += 0.05; c.time.t = t; c.time.dt = 0.05; for (const name of ['actors', 'models', 'world', 'water', 'render']) { const m = c[name]; if (!m || m.isStub || typeof m.update !== 'function') continue; try { m.update(0.05, t); } catch { /* keep pumping */ } } } },
      own(lifted) { const m = c.state.meta.loop; m.maps = m.maps || {}; m.maps.places = c.data.loopPlaceIds ? c.data.loopPlaceIds('mossmere') : Object.keys(c.data.LOOP.places || {});   /* (M, the baseline's build, has no places: the stage) */ m.lifted = lifted ? m.maps.places.slice() : []; c.world.setPlaces?.({ owned: m.maps.places, lifted: m.lifted }); },
      night() { const r = c.state.run; if (r.phase !== 'gloomtide') c.debug.setPhase?.('gloomtide'); const i = c.survival.getPhaseInfo?.(); if (i && i.duration > 0) r.phaseTime = i.duration * 0.35; },
      measure(N) {
        const R = c.render, rr = R.renderer, gl = rr.getContext(), px = new Uint8Array(4), t = [];
        let key = null; R.scene.traverse((o) => { if (o.isDirectionalLight && o.castShadow && o.shadow) key = o; });
        const every = Math.max(1, (R.clarity && R.clarity.shadowEvery) | 0);
        let calls = 0, worldOff = 0;
        for (let i = 0; i < N; i++) { if (key) key.shadow.needsUpdate = i % every === 0; const a = performance.now(); R.render(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); t.push(performance.now() - a); calls = Math.max(calls, rr.info.render.calls); }
        // the world's own calls, as DESIGN §25.8.8 counts them (the in-lake draw calls of the scene pass): the scene drawn once straight
        // through the renderer (no mirror, no shadow refresh, no post), then again with the world's group hidden; and the whole frame's
        // calls with the world hidden (its mirror and shadow draws go with it) for reference
        const wg = c.world.group, ar = rr.info.autoReset; rr.info.autoReset = true;
        if (key) key.shadow.needsUpdate = false;
        rr.render(R.scene, R.camera); const sceneAll = rr.info.render.calls;
        wg.visible = false;
        rr.render(R.scene, R.camera); const sceneOff = rr.info.render.calls;
        rr.info.autoReset = ar;   // (render.js resets the counters once per frame itself: every pass of a frame is counted)
        for (let i = 0; i < every; i++) { if (key) key.shadow.needsUpdate = i % every === 0; R.render(); worldOff = Math.max(worldOff, rr.info.render.calls); }
        wg.visible = true;
        return { calls, world: sceneAll - sceneOff, worldAllPasses: calls - worldOff, wallMs: Math.round(Math.min(...t)), places: c.debug.world?.places?.()?.calls ?? null };
      },
    };
  });
  const perf = {};
  for (const tier of tiers) {
    // (the arena is built for the tier in force when its lake is entered: a fresh zone build at this tier)
    await g((tier) => { const c = window.__gw; window.__pl.hold(false); c.state.meta.settings.quality = tier; c.render.setQuality(tier); c.world.setZone?.('sporewood', { instant: true }); c.world.setZone?.('mossmere', { instant: true }); }, tier);
    await api.frames(3);
    const cases = [['banks', false, true], ['lifted', true, false]];
    for (const [name, lifted, back] of cases) {
      try {
        await g(([lifted, back]) => { const P = window.__pl, c = window.__gw; P.own(lifted); P.night(); c.player.teleport?.({ x: -34, z: 14 }, 0); P.hold(true); P.pump(6); if (back) c.debug.world?.giantBack?.('under_the_span'); P.pump(0.9); c.render.snapCamera?.(); P.pump(0.1); c.render.render(); }, [lifted, back]);
        const c0 = await cpu();
        const r = await g((N) => window.__pl.measure(N), N);
        r.cpuMs = Math.round((await cpu() - c0) * 1000 / (N + 2));
        const line = LOOP_LINES[tier] || LOOP_LINES.high;
        r.okFrame = r.calls <= line.frame; r.okWorld = r.world <= line.world;
        if (!r.okFrame) failures.push(`T148 ${tier}-${name}: the frame's ${r.calls} calls over ${line.frame}`);
        if (!r.okWorld) failures.push(`T148 ${tier}-${name}: the world's ${r.world} calls over ${line.world}`);
        perf[`${tier}-${name}`] = r;
        log(`perf-loop ${tier}-${name} ${JSON.stringify(r)}`);
      } catch (e) { failures.push(`perf-loop ${tier}-${name}: ${e?.message || e}`); }
      await g(() => window.__pl.hold(false)).catch(() => {});
      await api.frames(1);
    }
    // a giant's show at night (the four banks up but Under the Span's, where the Thousandcast is landed): the play's frames run until
    // the fish is presented, then the frame is held and measured as the others
    try {
      const ok = await g(() => {
        const c = window.__gw, P = window.__pl, m = c.state.meta.loop;
        P.own(false); m.lifted = ['under_the_span']; c.world.setPlaces?.({ owned: m.maps.places, lifted: m.lifted });
        P.night(); const p = c.data.loopPlace?.('under_the_span'); if (p) c.player.teleport?.({ x: -29.5, z: 0.5 }, 0);
        try { c.fishing.cancel?.('debug'); c.debug.fishOutcome?.('land'); c.debug.forceBite?.({ speciesId: 'thousandcast_pike', z: 1.2, wait: 0.2 }); return true; } catch { return false; }
      });
      if (!ok) throw new Error('no forced bite');
      await page.waitForFunction(() => window.__gw.fishing.state === 'bite', null, { timeout: 120000, polling: 200 });
      await g(() => { window.__gw.debug.fishStrike?.('struck'); });
      await page.waitForFunction(() => ['reeling', 'landing'].includes(window.__gw.fishing.state), null, { timeout: 60000, polling: 200 });
      await g(() => window.__gw.debug.fishPlayTo?.(0.97));
      await page.waitForFunction(() => window.__gw.fishing.inShow === true, null, { timeout: 240000, polling: 300 });
      await api.frames(12);
      await g(() => { const P = window.__pl; P.hold(true); P.pump(0.2); window.__gw.render.render(); });
      const c0 = await cpu();
      const r = await g((N) => window.__pl.measure(N), N);
      r.cpuMs = Math.round((await cpu() - c0) * 1000 / (N + 2));
      const line = LOOP_LINES[tier] || LOOP_LINES.high;
      r.okFrame = r.calls <= line.frame; r.okWorld = r.world <= line.world;
      if (!r.okFrame) failures.push(`T148 ${tier}-show: the frame's ${r.calls} calls over ${line.frame}`);
      if (!r.okWorld) failures.push(`T148 ${tier}-show: the world's ${r.world} calls over ${line.world}`);
      perf[`${tier}-show`] = r;
      log(`perf-loop ${tier}-show ${JSON.stringify(r)}`);
    } catch (e) { log(`perf-loop ${tier}-show: not measured (${String(e?.message || e).split('\n')[0]})`); }
    await g(() => { const c = window.__gw; window.__pl.hold(false); try { c.ui.closeAll?.(); c.fishing.cancel?.('debug'); } catch { /* optional */ } }).catch(() => {});
    await api.frames(2);
  }
  if (typeof args.base === 'string') {
    try {
      const B = JSON.parse(readFileSync(resolve(process.cwd(), args.base), 'utf8')).perf || {};
      for (const tier of tiers) {
        // (the baseline is this --loop run on a build of M, where there are no places: its `banks` case is the step-2 scene)
        const b = B[`${tier}-banks`]?.cpuMs ?? B[`${tier}-gloomtide`]?.cpuMs, m = perf[`${tier}-banks`]?.cpuMs;
        if (Number.isFinite(b) && Number.isFinite(m) && m > b * 1.15) failures.push(`T148 ${tier}: cpuMs ${m} over +15% of the baseline's ${b}`);
        log(`perf-loop ${tier} cpuMs ${m} against the baseline's ${b}`);
      }
    } catch (e) { failures.push(`the baseline ${args.base}: ${e?.message || e}`); }
  }
  writeFileSync(resolve(shotsDir, `perf-loop${phone ? '-phone' : ''}${args.redress ? '-redress' : ''}.json`), JSON.stringify({ width, height, frames: N, redress: !!args.redress, lines: LOOP_LINES, perf }, null, 1));
  await wait(100);
  return { failures };
}
