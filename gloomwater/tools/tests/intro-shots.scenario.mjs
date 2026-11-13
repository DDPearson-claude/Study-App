// The opening cut scene's FRAME STRIP (docs/v3/intro/SPEC.md §10; lane A owns this file from the seam commit on).
// The film is a pure function of its timeline time, so every moment is shot exactly with the debug hook's seek, never by
// recording real-time playback (software GL runs at 1–10 fps here).
//
//   node build.mjs --dev --out=tools/out/intro/dev.html
//   node tools/playtest.mjs --html=tools/out/intro/dev.html --shots=tools/out/intro/strip --script=tools/tests/intro-shots.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/intro/dev.html --shots=tools/out/intro/strip-phone --script=tools/tests/intro-shots.scenario.mjs --mobile
//
// Options: --at=3.6,7.2,17.9 (the timeline times to shoot; default: the strip below) · --quality=low|medium|high (default high on
// desktop, medium with --mobile) · --settle=1.5 (seconds of look-module pumping before each frame) · --reduced (the reduced-motion
// stills) · --ui (leave the DOM on: the words and the Skip word, once lane B's view exists; a page screenshot)
//
// How a frame is made: the page's requestAnimationFrame is held, the film is sought to t (window.__gw.debug.intro('seek', t): the
// director holds its clock there and the stage shows exactly that moment), the look modules are pumped so mood, grade and the rig
// settle, and the canvas is rendered and read in the same task. Each frame logs the whole frame's draw calls and triangles and the
// stage's own stats; the scenario fails on any page / console / ctx error, on a frame the stage did not reach, and on a set over
// INTRO.set.budget.
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const STRIP = [0.2, 1.0, 2.4, 3.6, 5.0, 5.8, 6.6, 7.2, 7.8, 8.05, 8.6, 9.6, 10.5, 11.4, 12.3, 12.7, 13.1, 13.6, 14.2, 15.2, 16.0, 16.8, 17.9];

export default async function (api) {
  const { page, wait, evalGame: g, log, args, width, height } = api;
  page.setDefaultTimeout(300000);
  const failures = [];
  const phone = !!args.mobile || width < height;
  const quality = typeof args.quality === 'string' ? args.quality : phone ? 'medium' : 'high';
  const settle = Number(args.settle) > 0 ? Number(args.settle) : 1.5;
  const times = typeof args.at === 'string' ? args.at.split(',').map(Number).filter((x) => Number.isFinite(x)) : STRIP;
  const shotsDir = resolve(process.cwd(), String(args.shots || 'tools/out/intro/strip'));
  mkdirSync(shotsDir, { recursive: true });

  // ------------------------------------------------------------------ boot: the v3 phase-1 game on a fresh save, at the title
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 300000 });
  await g(() => window.__gw.game.wipeAll());
  await page.goto(page.url().split('?')[0] + '?v3=1&v3phase=1', { waitUntil: 'load', timeout: 300000 });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title' && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 });
  const build = await g(({ quality, ui }) => {
    const c = window.__gw;
    c.state.meta.settings = c.state.meta.settings || {}; c.state.meta.settings.quality = quality;
    c.render.setQuality(quality);
    const T = (window.__is = {});
    const raf = window.requestAnimationFrame.bind(window);
    let held = null;
    window.requestAnimationFrame = (cb) => { if (held) { held.push(cb); return 0; } return raf(cb); };
    T.hold = () => { held = held || []; };
    T.release = () => { const q = held || []; held = null; for (const cb of q) raf(cb); };
    T.pump = (sec) => {
      let t = c.time.t;
      for (let i = 0, n = Math.max(1, Math.round(sec / 0.05)); i < n; i++) {
        t += 0.05; c.time.t = t; c.time.dt = 0.05;
        for (const name of ['actors', 'models', 'world', 'water', 'render']) { const m = c[name]; if (!m || m.isStub || typeof m.update !== 'function') continue; try { m.update(0.05, t); } catch { /* keep pumping */ } }
      }
    };
    if (!ui) { const s = document.createElement('style'); s.textContent = '#ui { opacity: 0 !important; }'; document.head.appendChild(s); }
    T.render = () => { c.render.render(); return c.render.renderer.domElement.toDataURL('image/png'); };
    return { v3: c.data.V3_ENABLED === true, hook: typeof c.debug.intro === 'function', tier: c.render.quality, intro: !!c.intro, budget: c.data.INTRO?.set?.budget || null };
  }, { quality, ui: !!args.ui });
  log(`build: v3=${build.v3} intro=${build.intro} hook=${build.hook} tier=${build.tier} ${width}x${height}`);
  if (!build.v3 || !build.intro || !build.hook) { failures.push('the v3 build does not carry the cut scene (ctx.intro) or its debug hook (debug.intro)'); return { failures }; }

  await g(() => window.__is.hold());
  await wait(400);
  const rows = [];
  for (const t of times) {
    const r = await g(({ t, settle, reduced }) => {
      const c = window.__gw, T = window.__is;
      if (reduced && !c.intro.isActive()) c.debug.intro('play', { reduced: true });
      const s0 = c.debug.intro('seek', t);
      T.pump(settle);
      c.debug.intro('seek', t);   // (the pump moved the rig and the mood: the same moment again, settled)
      const url = T.render();
      const info = c.render.renderer.info, s = c.debug.intro(), cam = c.render.camera;
      return { url, t: s.t, beat: s.beat, line: s.line, phase: s.phase, hold: s.hold, stage: s.stage, sought: s0.t,
        calls: info.render.calls, triangles: info.render.triangles, mode: c.render.getCameraMode?.(),
        cam: [cam.position.x, cam.position.y, cam.position.z].map((x) => +x.toFixed(2)), fov: +cam.fov.toFixed(1), errors: c.errors.length };
    }, { t, settle, reduced: !!args.reduced });
    const name = `i-${t.toFixed(2).padStart(5, '0')}-${r.beat || 'none'}`;
    writeFileSync(resolve(shotsDir, `${name}.png`), Buffer.from(r.url.split(',')[1], 'base64'));
    rows.push({ name, t: r.t, beat: r.beat, line: r.line, calls: r.calls, triangles: r.triangles, cam: r.cam, fov: r.fov, mode: r.mode, stage: r.stage });
    log(`${name} line=${r.line} cam=${JSON.stringify(r.cam)} fov=${r.fov} rig=${r.mode} frame=${r.calls} calls / ${r.triangles} tris stage=${JSON.stringify(r.stage)}`);
    if (Math.abs(r.t - t) > 1e-3 || r.phase !== 'playing' || !r.hold) failures.push(`seek(${t}) did not hold the film there (t ${r.t}, ${r.phase})`);
    if (build.budget && r.stage && (r.stage.calls > build.budget.calls || r.stage.triangles > build.budget.triangles)) failures.push(`t ${t}: the set costs ${r.stage.calls} calls / ${r.stage.triangles} triangles (budget ${build.budget.calls} / ${build.budget.triangles})`);
    if (r.errors) failures.push(`t ${t}: ctx.errors is not empty`);
  }
  const end = await g(() => { const c = window.__gw; c.debug.intro('stop'); window.__is.pump(0.2); const s = c.debug.intro(); window.__is.release(); return { phase: s.phase, cam: c.render.getIntroCamera?.() ?? null, errors: c.errors.slice() }; });
  if (end.phase !== 'idle' || end.cam !== null) failures.push('stop() must leave the director idle and the camera with the rig');
  for (const e of end.errors) failures.push('ctx.errors: ' + e);
  writeFileSync(resolve(shotsDir, 'strip.json'), JSON.stringify({ width, height, quality, rows }, null, 1));
  return { failures };
}
