// P1 water (DESIGN §25.14.2 Wa1, Wa2; CONTRACT §13.7 water, §13.9) with v3 on at phase 1, in a browser:
//
//   node build.mjs --dev --out=tools/out/p1b-water.html
//   node tools/playtest.mjs --html=tools/out/p1b-water.html --shots=tools/out/p1b-water/desk --script=tools/tests/p1-water.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/p1b-water.html --shots=tools/out/p1b-water/phone --script=tools/tests/p1-water.scenario.mjs --mobile
//   (--only=signs,glow runs a part; --noshots skips the screenshots)
//
// Wa2 "signs": six sign kinds driven the way fishing-fx (F6, the signs' one owner) will drive them — tagged
//   water.addRipple / addWake calls only — all render at once (each one changes the pixels where it sits:
//   knocked out alone, its patch of water changes), ≤ 6 signs alive; the water's uniform list and its array
//   sizes are unchanged by them; the frame's draw calls grow by ≤ 2 (the pooled splash points may wake up for
//   a strike's droplets); plain ripples and the raft's wake still render beside them. Screenshots by day and
//   at night at the sail framing (desktop 960×540 and a 390 px phone).
// Wa1 "glow": at night (Gloomtide) the Glowtide eases in by itself (v3 build); on high the raft's wake and a
//   hooked fish sparkle (rendering with uGlowtide 1 vs 0 changes pixels on the wake and around the fish); the
//   frame's draw calls are identical with the term on and off; on low the shader carries no term (the same
//   render with uGlowtide 1 and 0 is bit-identical, and the water reports the GW_LOW define).
// Every step: 0 ctx.errors (playtest adds page and console errors).
export default async function (api) {
  const { page, frames, evalGame: g, log, shot } = api;
  const failures = [];
  const only = api.args?.only ? String(api.args.only).toLowerCase().split(',') : null;
  const want = (x) => !only || only.includes(x);
  const noShots = !!api.args?.noshots;
  let stepName = 'boot';
  const t0 = Date.now();
  const step = (s) => { stepName = s; log(`---- ${s}  (+${((Date.now() - t0) / 1000).toFixed(0)} s)`); };
  const check = (cond, msg, extra) => {
    if (cond) { log('ok  ', msg, extra !== undefined ? JSON.stringify(extra) : ''); return true; }
    failures.push(`[${stepName}] ${msg}${extra !== undefined ? ` :: ${JSON.stringify(extra)}` : ''}`);
    log('FAIL', msg, extra !== undefined ? JSON.stringify(extra) : '');
    return false;
  };
  const waitFor = async (fn, arg, maxFrames = 120) => { for (let i = 0; i < maxFrames; i++) { if (await g(fn, arg)) return true; await frames(1); } return false; };
  // the WebGL frame straight from the canvas right after the game renders it (fast and reliable on a loaded
  // software-GL machine, where page.screenshot times out), then the full page with the HUD when it can
  // crop: [x0, y0, x1, y1] in canvas pixels → also writes `${name}-crop.png`, that box scaled to ~760 px wide
  const grab = async (name, crop = null) => {
    try {
      const out = await g((crop) => new Promise((res) => requestAnimationFrame(() => {
        const el = window.__gw.render.renderer.domElement;
        const full = el.toDataURL('image/png').split(',')[1];
        let cut = null;
        if (crop) {
          const x0 = Math.max(0, Math.floor(crop[0])), y0 = Math.max(0, Math.floor(crop[1]));
          const w = Math.min(el.width, Math.ceil(crop[2])) - x0, h = Math.min(el.height, Math.ceil(crop[3])) - y0;
          if (w > 8 && h > 8) {
            const sc = Math.min(4, 760 / w);
            const c = document.createElement('canvas'); c.width = Math.round(w * sc); c.height = Math.round(h * sc);
            const cx = c.getContext('2d'); cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high';
            cx.drawImage(el, x0, y0, w, h, 0, 0, c.width, c.height);
            cut = c.toDataURL('image/png').split(',')[1];
          }
        }
        res({ full, cut });
      })), crop);
      const { writeFileSync, mkdirSync } = await import('node:fs');
      const { resolve } = await import('node:path');
      const dir = resolve(process.cwd(), String(api.args?.shots || 'tools/out/shots'));
      mkdirSync(dir, { recursive: true });
      writeFileSync(resolve(dir, `${name}.png`), Buffer.from(out.full, 'base64'));
      if (out.cut) writeFileSync(resolve(dir, `${name}-crop.png`), Buffer.from(out.cut, 'base64'));
      log('grab', resolve(dir, `${name}.png`), out.cut ? '(+crop)' : '');
    } catch (e) { log('grab failed', name, String(e?.message || e).slice(0, 80)); }
  };
  const safeShot = async (name, cropAround = 'signs') => {
    if (noShots) return;
    await full();
    const box = cropAround === 'signs' ? await where(name) : cropAround === 'raft' ? await raftBox() : null;
    await grab(name, box);
    if (api.args?.pageshots) { try { await shot(`${name}-page`); } catch { /* logged by playtest */ } }
  };
  const noErrors = async () => { const e = await g(() => window.__gw.errors.slice()); check(e.length === 0, 'ctx.errors stays empty', e); };
  const clearModals = async () => {
    for (let i = 0; i < 10; i++) {
      await frames(2);
      const m = await g(() => ({ m: window.__gw.debug.ui?.()?.openModal ?? null, b: !!window.__gw.ui.isBlocking?.(), p: !!window.__gw.paused }));
      if (!m.b && !m.p) return;
      await g(() => { const c = window.__gw; try { const o = c.combat.pendingOptions; if (o?.length) c.combat.chooseBoon(o[0].boonId); c.ui.closeAll?.(); if (c.paused) c.game.resume?.(); } catch { /* optional */ } });
    }
  };
  const W = () => g(() => window.__gw.debug.water());
  let layoutRef = null;
  // where each sign sits in the grab (canvas pixels, y down), to tell them apart in the picture
  const where = async (name) => {
    if (!layoutRef) return null;
    const at = await g((L) => {
      const c = window.__gw, T = c.THREE, cam = c.render.camera, el = c.render.renderer.domElement, v = new T.Vector3(), out = {};
      for (const [k, p] of Object.entries(L)) { v.set(p.x, 0, p.z).project(cam); out[k] = [Math.round((v.x * 0.5 + 0.5) * el.width), Math.round((0.5 - v.y * 0.5) * el.height)]; }
      return { out, W: el.width, H: el.height };
    }, layoutRef);
    log('where', name, JSON.stringify(at.out));
    const xs = Object.values(at.out).map((p) => p[0]), ys = Object.values(at.out).map((p) => p[1]);
    const m = Math.round(at.W * 0.08);
    return [Math.min(...xs) - m, Math.min(...ys) - m, Math.max(...xs) + m, Math.max(...ys) + m];
  };
  // the raft and the water just behind it, in canvas pixels
  const raftBox = () => g(() => {
    const c = window.__gw, T = c.THREE, cam = c.render.camera, el = c.render.renderer.domElement, p = c.player.position, v = new T.Vector3();
    const pts = [[-7, -7], [7, -7], [-7, 9], [7, 9]].map(([dx, dz]) => { v.set(p.x + dx, 0, p.z + dz).project(cam); return [(v.x * 0.5 + 0.5) * el.width, (0.5 - v.y * 0.5) * el.height]; });
    return [Math.min(...pts.map((q) => q[0])), Math.min(...pts.map((q) => q[1])), Math.max(...pts.map((q) => q[0])), Math.max(...pts.map((q) => q[1]))];
  });
  // in-page helpers: an off-screen render of the scene from the game camera (no post) to diff two states
  const installDiff = () => g(() => {
    const c = window.__gw, T = c.THREE, r = c.render.renderer;
    const cw = r.domElement.width || 960, ch = r.domElement.height || 540;
    const Wd = 480, Hd = Math.max(120, Math.round(480 * ch / cw));
    const rt = new T.WebGLRenderTarget(Wd, Hd, { type: T.UnsignedByteType });
    const v = new T.Vector3();
    window.__wd = {
      Wd, Hd,
      read() {
        const prev = r.getRenderTarget();
        const calls = r.info.render.calls;
        r.setRenderTarget(rt); r.clear(); r.render(c.render.scene, c.render.camera);
        const buf = new Uint8Array(Wd * Hd * 4);
        r.readRenderTargetPixels(rt, 0, 0, Wd, Hd, buf);
        r.setRenderTarget(prev);
        r.info.render.calls = calls;
        return buf;
      },
      /** pixels whose largest channel moved by more than thr (in 0..255), inside box [x0, y0, x1, y1] (RT pixels, y up) */
      diff(a, b, thr = 3, box = null) {
        let n = 0, sum = 0;
        const [x0, y0, x1, y1] = box || [0, 0, Wd, Hd];
        for (let y = Math.max(0, y0 | 0); y < Math.min(Hd, y1 | 0); y++) {
          for (let x = Math.max(0, x0 | 0); x < Math.min(Wd, x1 | 0); x++) {
            const i = (y * Wd + x) * 4;
            const d = Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2]));
            if (d > thr) { n++; sum += d; }
          }
        }
        return { n, sum };
      },
      project(x, z) {
        v.set(x, c.water.getHeight(x, z), z).project(c.render.camera);
        return [(v.x * 0.5 + 0.5) * Wd, (v.y * 0.5 + 0.5) * Hd, v.z];
      },
      box(x, z, rPx) { const p = this.project(x, z); return [p[0] - rPx, p[1] - rPx * 0.6, p[0] + rPx, p[1] + rPx * 0.6]; },
    };
    return { Wd, Hd };
  });
  // the camera's forward and right on the water, and the Wick's position
  const frame = () => g(() => {
    const c = window.__gw, yaw = c.render.getYaw(), p = c.player.position;
    return { x: p.x, z: p.z, fx: -Math.sin(yaw), fz: -Math.cos(yaw), rx: Math.cos(yaw), rz: -Math.sin(yaw) };
  });
  const open = (x, z, r = 2) => g(([x, z, r]) => { try { return window.__gw.world.isOpenWater(x, z, r) === true; } catch { return true; } }, [x, z, r]);
  const frameCalls = async () => { await frames(2); return g(() => window.__gw.render.renderer.info.render.calls); };

  // ------------------------------------------------------------------ boot: v3 on at phase 1, a fresh save
  step('boot (?v3=1&v3phase=1)');
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 240000 });
  await g(() => window.__gw.game.wipeAll());
  await page.goto(page.url().split('?')[0] + '?v3=1&v3phase=1', { waitUntil: 'commit', timeout: 240000 });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 240000 });
  await g(() => window.__gw.debug.renderScale?.(0.4));
  await frames(2);
  let s = await g(() => { const d = window.__gw.data; return { en: d.V3_ENABLED, ph: d.V3_PHASE, nm: !!d.BALANCE.nightModes }; });
  check(s.en === true && s.ph === 1 && s.nm, 'v3 phase-1 build', s);
  const uniforms0 = (await W()).uniforms;
  check(uniforms0.includes('uGlowtide') && uniforms0.length === 39, 'the water material: the base uniforms + uGlowtide (39)', uniforms0.length);
  await g(() => window.__gw.game.startNewRun({ character: 'wick' }));
  await waitFor(() => window.__gw.flow === 'playing', null, 120);
  await frames(4);
  await clearModals();
  await g(() => { const c = window.__gw; c.render.setQuality('high'); c.debug.setOil?.(100); });
  // a wide stretch of open water south of the gate with the camera looking north
  await g(() => { const c = window.__gw; c.player.teleport(new c.THREE.Vector3(0, 0, 40), 0); c.player.velocity?.set?.(0, 0, 0); });
  await g(() => window.__gw.debug.renderScale?.(0.4));
  await frames(4);
  const fps = await g(() => new Promise((res) => { const w0 = performance.now(); let n = 0; const f = () => (++n >= 5 ? res(5000 / (performance.now() - w0)) : requestAnimationFrame(f)); requestAnimationFrame(f); }));
  log('fps', fps.toFixed(2));
  await installDiff();
  s = await W();
  check(s.tier === 'high' && !s.lowDefine && s.glowtide === 0, 'high tier, calm: no Glowtide', { tier: s.tier, glow: s.glowtide });

  // sign layout ahead of the camera (DESIGN §25.6.1: within castMax + 15 m of the Wick)
  const F = await frame();
  const at = (d, lat) => ({ x: F.x + F.fx * d + F.rx * lat, z: F.z + F.fz * d + F.rz * lat });
  const layout = {
    rise: { ...at(11, -4.5), size: 0.45 },
    boil: { ...at(17, 4.5), size: 1.4 },
    nervous: { ...at(22, -7.5), size: 0.8 },
    strike: { ...at(26, 8), size: 1.2 },
    bubbles: { ...at(9, 2), size: 0.5, dir: [F.rx, F.rz] },
    glow: { ...at(14, -0.5), size: 1.0, dir: [-F.rx * 0.6 + F.fx * 0.8, -F.rz * 0.6 + F.fz * 0.8] },
  };
  layoutRef = layout;
  for (const [k, p] of Object.entries(layout)) check(await open(p.x, p.z, 1.5), `${k} sits on open water`, { x: +p.x.toFixed(1), z: +p.z.toFixed(1) });
  // the driver: what fishing-fx does for each live sign, through water.addRipple / addWake only
  const startDriver = (kinds) => g(([layout, kinds]) => {
    const c = window.__gw;
    const S = window.__sd = { on: true, signs: {} };
    for (const k of kinds) S.signs[k] = { ...layout[k], next: 0, n: 0 };
    const tick = () => {
      if (!S.on) return;
      const t = c.time.t;
      for (const [k, s] of Object.entries(S.signs)) {
        if (t < s.next) continue;
        s.n++;
        // the cadences of fishing-signs.js (F6), except that a rise, a boil and a strike repeat sooner (4–9 s, 8–13 s,
        // once) so every screenshot holds all of them; the bubble head creeps 0.32 m/s, a glow trail swims 0.7 m/s
        if (k === 'rise') { c.water.addRipple(s.x, s.z, 1, { kind: 'rise', size: s.size }); s.next = t + 3.4; }
        else if (k === 'boil') { c.water.addRipple(s.x, s.z, 1, { kind: 'boil', size: s.size }); s.next = t + 4.4; }
        else if (k === 'nervous') { c.water.addRipple(s.x, s.z, 1, { kind: 'nervous', size: s.size }); s.next = t + 2.0; }
        else if (k === 'strike') { c.water.addRipple(s.x, s.z, 1, { kind: 'strike', size: s.size }); s.next = t + 7.6; }
        else if (k === 'bubbles') {
          const d = ((s.n * 1.8 * 0.32) % 3.2);
          c.water.addRipple(s.x + s.dir[0] * d, s.z + s.dir[1] * d, 1, { kind: 'bubbles', size: s.size });
          s.next = t + 1.8;
        } else if (k === 'glow') {
          const d = (s.n % 24) * 0.3;
          const x = s.x + s.dir[0] * d, z = s.z + s.dir[1] * d;
          c.water.addWake(x, z, s.dir[0], s.dir[1], 0.35 + 0.4 * Math.min(1.2, 0.3 + 0.55 * s.size), { kind: 'glow' });
          c.water.addRipple(x, z, 1, { kind: 'glow', size: s.size });
          s.next = t + 0.42;
        }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return Object.keys(S.signs);
  }, [layout, kinds]);
  const stopDriver = () => g(() => { if (window.__sd) window.__sd.on = false; });
  // Software GL on a shared 4-core box runs this at ~0.1 fps at full size, and the game clock advances at most
  // 0.05 s a frame: waits render small (debug.renderScale) and warp the clock (each frame adds `warp` × 0.05 s
  // to ctx.time.t, which drives the water's rings, and ×warp to the game's dt), grabs render full size.
  const WARP = Number(api.args?.warp || 8);
  const runFor = (sec, warp = WARP) => g(([sec, warp]) => new Promise((res) => {
    const c = window.__gw, t0 = c.time.t, w0 = performance.now();
    c.debug.renderScale?.(0.4);
    c.debug.timeScale?.(warp);
    const f = () => {
      if (c.time.t - t0 >= sec || performance.now() - w0 > 400000) { c.debug.timeScale?.(1); res(c.time.t - t0); return; }
      c.time.t += 0.05 * (warp - 1);
      requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }), [sec, warp]);
  // every mark on the water ages out at once: the water's clock (ctx.time.t) jumps 10 s (game logic runs on gameDt)
  const expire = async () => { await g(() => { window.__gw.time.t += 10; }); await frames(2); };
  const full = async () => { await g(() => window.__gw.debug.renderScale?.(1)); await frames(1); };

  // ------------------------------------------------------------------ Wa2: the six signs
  if (want('signs')) {
    step('Wa2: day, five signs (the glow trail is night-only)');
    const calls0 = await frameCalls();
    await startDriver(['rise', 'boil', 'nervous', 'strike', 'bubbles']);
    await runFor(0.7);
    await safeShot('signs-day-a');
    await runFor(1.2);
    await safeShot('signs-day-b');
    s = await W();
    check(['rise', 'boil', 'nervous', 'strike', 'bubbles'].every((k) => s.signMarks[k] >= 1), 'every day sign has a live mark', s.signMarks);
    await runFor(1.6);
    await safeShot('signs-day-c');
    await stopDriver();
    await expire();

    step('Wa2: night, all six signs at once');
    await g(() => { const c = window.__gw; c.debug.setPhase('dusk'); c.debug.setPhase('gloomtide'); const r = c.state.run, d = c.survival.getPhaseInfo().duration; r.phaseTime = 0.3 * d; });
    await runFor(3.5);
    const callsN0 = await frameCalls();
    const before = await W();
    await startDriver(['rise', 'boil', 'nervous', 'strike', 'bubbles', 'glow']);
    await runFor(1.3);
    s = await W();
    const kinds = Object.keys(s.signMarks);
    check(kinds.length === 6, 'six sign kinds alive at once', s.signMarks);
    check(s.signRipN <= 16 && s.signWakeN <= 8, 'sign marks inside their reserved slots (≤ 16 ripples, ≤ 8 wakes)', { rip: s.signRipN, wake: s.signWakeN });
    check(JSON.stringify(s.uniforms) === JSON.stringify(uniforms0) && s.maxRip === before.maxRip && s.maxWake === before.maxWake,
      'uniform list and array sizes unchanged with six signs', { n: s.uniforms.length, rip: s.maxRip, wake: s.maxWake });
    const callsN1 = await frameCalls();
    check(callsN1 - callsN0 <= 2, 'six signs add ≤ 2 draw calls', { before: callsN0, after: callsN1, day: calls0 });
    // each sign renders: knocking it alone out of the uniform array changes the water where it sits
    const per = await g((layout) => {
      const c = window.__gw, U = c.water.material.uniforms, rip = U.uRip.value, wk = U.uWake.value, wd = window.__wd;
      const A = wd.read();
      const out = {};
      const ids = { rise: 1, boil: 2, nervous: 3, strike: 4, bubbles: 5, glow: 6 };
      for (const [k, id] of Object.entries(ids)) {
        const saved = [];
        for (let i = 0; i < U.uRipN.value; i++) if (Math.floor(rip[i * 4 + 3] / 64) === id) { saved.push([i, rip[i * 4 + 2]]); rip[i * 4 + 2] = -999; }
        const savedW = [];
        if (k === 'glow') for (let i = 0; i < U.uWakeN.value; i++) if (Math.floor(wk[i * 4 + 3] / 4) === 6) { savedW.push([i, wk[i * 4 + 2]]); wk[i * 4 + 2] = -999; }
        const B = wd.read();
        for (const [i, t] of saved) rip[i * 4 + 2] = t;
        for (const [i, t] of savedW) wk[i * 4 + 2] = t;
        const p = layout[k];
        const box = wd.box(p.x, p.z, k === 'glow' || k === 'bubbles' ? 70 : 60);
        out[k] = { marks: saved.length, ...wd.diff(A, B, 3, box), at: wd.project(p.x, p.z).map((v) => +v.toFixed(1)) };
      }
      return out;
    }, layout);
    for (const [k, r] of Object.entries(per)) check(r.marks >= 1 && r.n >= 12, `the ${k} sign changes its patch of water`, r);
    await safeShot('signs-night-a');
    await runFor(1.4);
    await safeShot('signs-night-b');
    await g(() => { const c = window.__gw, p = c.player.position; for (let i = 0; i < 4; i++) c.water.addRipple(p.x + 3 + i, p.z - 4, 0.6); c.water.addWake(p.x, p.z + 2, 0, -1, 0.8); });
    await frames(2);
    s = await W();
    check(s.ripN - s.signRipN >= 4 && s.wakeN - s.signWakeN >= 1, 'plain ripples and wakes still packed beside the signs', { ripN: s.ripN, signRipN: s.signRipN, wakeN: s.wakeN, signWakeN: s.signWakeN });
    await stopDriver();
    await noErrors();
  }

  // ------------------------------------------------------------------ Wa1: the Glowtide
  if (want('glow')) {
    step('Wa1: Gloomtide → the Glowtide eases in');
    await g(() => { const c = window.__gw; if (c.state.run.phase !== 'gloomtide') { c.debug.setPhase('dusk'); c.debug.setPhase('gloomtide'); } const r = c.state.run, d = c.survival.getPhaseInfo().duration; r.phaseTime = 0.3 * d; c.player.teleport(new c.THREE.Vector3(0, 0, 40), 0); });
    await expire();     // the signs' last marks run out: only the raft and the fish stir the water now
    check((await W()).signRipN === 0, 'no sign marks left before the Glowtide checks');
    const g0 = (await W()).glowtide;
    await frames(6);
    s = await W();
    check(s.glowTarget === 1 && s.glowtide > g0 && s.glowManual === null, 'the Glowtide follows the night by itself (v3 build): target 1, easing up', { target: s.glowTarget, from: +g0.toFixed(3), now: +s.glowtide.toFixed(3) });
    await g(() => { window.__gw.water.material.uniforms.uGlowtide.value = 1; });   // skip the ease (≈ 2 s of frames)
    // sail: the raft's wake
    await page.keyboard.down('KeyW');
    await runFor(2.2);
    const wakeTest = await g(() => {
      const c = window.__gw, U = c.water.material.uniforms, wd = window.__wd, p = c.player.position;
      const k0 = U.uGlowtide.value;
      U.uGlowtide.value = 0; const A = wd.read();
      U.uGlowtide.value = 1; const B = wd.read();
      U.uGlowtide.value = k0;
      // the trail behind the raft (wake marks), not around it: changed pixels inside the union of the marks' boxes
      const mask = new Uint8Array(wd.Wd * wd.Hd);
      let marks = 0;
      const wk = U.uWake.value;
      for (let i = 0; i < U.uWakeN.value; i++) {
        const x = wk[i * 4], z = wk[i * 4 + 1];
        if (Math.hypot(x - p.x, z - p.z) < 2.5) continue;
        marks++;
        const [x0, y0, x1, y1] = wd.box(x, z, 14);
        for (let y = Math.max(0, y0 | 0); y < Math.min(wd.Hd, y1 | 0); y++) for (let xx = Math.max(0, x0 | 0); xx < Math.min(wd.Wd, x1 | 0); xx++) mask[y * wd.Wd + xx] = 1;
      }
      let n = 0, sum = 0;
      for (let i = 0; i < mask.length; i++) {
        if (!mask[i]) continue;
        const d = Math.max(Math.abs(A[i * 4] - B[i * 4]), Math.abs(A[i * 4 + 1] - B[i * 4 + 1]), Math.abs(A[i * 4 + 2] - B[i * 4 + 2]));
        if (d > 3) { n++; sum += d; }
      }
      return { marks, n, sum, total: wd.diff(A, B, 3).n, wakeN: U.uWakeN.value };
    });
    check(wakeTest.marks >= 2 && wakeTest.n >= 20, 'high: the raft\'s wake sparkles at night (uGlowtide 1 vs 0 on the trail)', wakeTest);
    await safeShot('glow-wake', 'raft');
    const callsOn = await frameCalls();
    await g(() => window.__gw.water.setGlowtide(0));
    await frames(40);
    const callsOff = await frameCalls();
    check(callsOn === callsOff, 'the Glowtide adds 0 draw calls', { on: callsOn, off: callsOff });
    await g(() => window.__gw.water.setGlowtide(null));
    await page.keyboard.up('KeyW');
    await runFor(1.5);
    // the rule of the lantern's reach (DESIGN §19.1): nothing glows in a ring around the raft. Paddle strokes and bumps
    // ring the water at the hull; the Glowtide leaves those dark and lights the same ring 7 m out.
    step('Wa1: no ring of light at the hull');
    await g(() => { const c = window.__gw; c.player.teleport(new c.THREE.Vector3(0, 0, 40), 0); c.player.velocity?.set?.(0, 0, 0); });
    await expire();
    const hullTest = await g(() => {
      const c = window.__gw, U = c.water.material.uniforms, wd = window.__wd, p = c.player.position, F = c.render.getYaw();
      const rx = Math.cos(F), rz = -Math.sin(F), fx = -Math.sin(F), fz = -Math.cos(F);
      const t = c.time.t;
      c.time.t -= 0.45;   // rings born 0.45 s ago: grown to ~1 m, the age a paddle ring has as the next stroke lands
      c.water.addRipple(p.x + rx * 1.25, p.z + rz * 1.25, 0.55); c.water.addRipple(p.x - rx * 1.25, p.z - rz * 1.25, 0.55);
      c.water.addRipple(p.x, p.z, 0.35);
      const far = { x: p.x + fx * 7, z: p.z + fz * 7 };
      c.water.addRipple(far.x, far.z, 0.55);
      c.time.t = t;
      c.water.update(0); U.uTime.value = c.time.t % 3600;
      const boxAt = (x, z, r) => { const q = [[-r, -r], [r, -r], [-r, r], [r, r]].map(([a, b]) => wd.project(x + a, z + b)); return [Math.min(...q.map((v) => v[0])), Math.min(...q.map((v) => v[1])), Math.max(...q.map((v) => v[0])), Math.max(...q.map((v) => v[1]))]; };
      const k0 = U.uGlowtide.value;
      U.uGlowtide.value = 0; const A = wd.read();
      U.uGlowtide.value = 1; const B = wd.read();
      U.uGlowtide.value = k0;
      return { hull: wd.diff(A, B, 3, boxAt(p.x, p.z, 2.8)), far: wd.diff(A, B, 3, boxAt(far.x, far.z, 2.2)), ripN: U.uRipN.value };
    });
    check(hullTest.far.n >= 20 && hullTest.hull.n <= 4, 'the Glowtide never lights the rings born at the hull (it lights the same ring 7 m out)', hullTest);
    // a hooked fish thrashing
    step('Wa1: a hooked fish at night');
    await g(() => { const c = window.__gw; c.player.teleport(new c.THREE.Vector3(0, 0, 40), 0); c.player.velocity?.set?.(0, 0, 0); c.debug.setOil?.(100); });
    await frames(3);
    const hookTry = () => g(() => {
      const c = window.__gw;
      c.player.velocity?.set?.(0, 0, 0);
      const ids = ['reedjaw_pike', ...(c.data.SPECIES || []).filter((s) => s.rarity !== 'legendary').map((s) => s.id)];
      for (const id of ids.slice(0, 6)) { if (c.debug.fishHook(id, { z: 1.6 })) return { ok: true, id }; }
      return { ok: false, state: c.fishing.state, flow: c.flow, fishing: c.debug.fishing?.(), surv: { oil: c.state.run?.oil, gut: c.survival.getPhaseInfo().guttering } };
    });
    let hooked = await hookTry();
    if (!hooked.ok) { log('hook retry', JSON.stringify(hooked).slice(0, 400)); await frames(6); hooked = await hookTry(); }
    check(hooked.ok, 'a fish is hooked', hooked.ok ? hooked.id : hooked);
    await runFor(1.8);
    const fishTest = await g(() => {
      const c = window.__gw, U = c.water.material.uniforms, wd = window.__wd;
      const f = c.fishing.bobberPos || null;
      const fp = f && Number.isFinite(f.x) ? f : null;
      const k0 = U.uGlowtide.value;
      U.uGlowtide.value = 0; const A = wd.read();
      U.uGlowtide.value = 1; const B = wd.read();
      U.uGlowtide.value = k0;
      return { state: c.fishing.state, fish: fp ? { x: +fp.x.toFixed(1), z: +fp.z.toFixed(1) } : null, near: fp ? wd.diff(A, B, 3, wd.box(fp.x, fp.z, 40)) : null, total: wd.diff(A, B, 3).n };
    });
    check(fishTest.state === 'reeling' && fishTest.near && fishTest.near.n >= 20, 'high: the hooked fish\'s thrash sparkles', fishTest);
    await safeShot('glow-fish', 'raft');
    await runFor(1.2);
    await safeShot('glow-fish-b', 'raft');
    // low: the term is compiled out
    step('Wa1: low tier');
    await g(() => window.__gw.render.setQuality('low'));
    await frames(8);
    s = await W();
    const lowTest = await g(() => {
      const c = window.__gw, U = c.water.material.uniforms, wd = window.__wd;
      const k0 = U.uGlowtide.value;
      U.uGlowtide.value = 0; const A = wd.read();
      U.uGlowtide.value = 1; const B = wd.read();
      U.uGlowtide.value = k0;
      return { ...wd.diff(A, B, 0), state: c.fishing.state, wakeN: U.uWakeN.value, ripN: U.uRipN.value };
    });
    check(s.tier === 'low' && s.lowDefine && s.glowLive === 0, 'low: GW_LOW defined, the Glowtide reads 0', { tier: s.tier, low: s.lowDefine, live: s.glowLive });
    check(lowTest.n === 0 && (lowTest.wakeN + lowTest.ripN) > 0, 'low: rendering with uGlowtide 1 and 0 is identical (the term is absent)', lowTest);
    await safeShot('glow-low', 'raft');
    await g(() => { const c = window.__gw; c.render.setQuality('high'); try { c.fishing.cancel?.('test'); } catch { /* optional */ } });
    await noErrors();
  }

  const e = await g(() => window.__gw.errors.slice());
  check(e.length === 0, 'no ctx errors at the end', e);
  log(failures.length ? `${failures.length} failure(s)` : 'ALL WATER CHECKS PASS');
  return { failures };
}
