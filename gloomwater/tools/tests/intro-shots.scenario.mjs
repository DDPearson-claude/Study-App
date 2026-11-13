// The opening cut scene's FRAME STRIP and the set's own acceptance (docs/v3/intro/SPEC.md §4, §5, §9, §10 A6 / A9; lane A).
// The film is a pure function of its timeline time, so every moment is shot exactly with a seek, never by recording real-time
// playback (software GL runs at 1–10 fps here).
//
//   node build.mjs --dev --out=tools/out/intro/dev.html
//   node tools/playtest.mjs --html=tools/out/intro/dev.html --shots=tools/out/intro/strip       --script=tools/tests/intro-shots.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/intro/dev.html --shots=tools/out/intro/strip-low   --script=tools/tests/intro-shots.scenario.mjs --width=960 --height=540 --quality=low
//   node tools/playtest.mjs --html=tools/out/intro/dev.html --shots=tools/out/intro/strip-phone --script=tools/tests/intro-shots.scenario.mjs --mobile
//   node tools/playtest.mjs --html=tools/out/intro/dev.html --shots=tools/out/intro/strip-phone-low --script=tools/tests/intro-shots.scenario.mjs --mobile --quality=low
//
// Options: --at=3.6,7.2,17.9 (the timeline times to shoot; default: every second, each beat's start, middle and end, the stills
// and the marks) · --quality=low|medium|high (default high on desktop, medium with --mobile) · --settle=1.0 (seconds of
// look-module pumping before each frame) · --reduced (the stage's reduced-motion variant: a softer flash, the cut as a dip) ·
// --via=director (seek through window.__gw.debug.intro instead of driving the stage: the whole film as the game plays it, for
// the merge) · --ui (leave the DOM on: the words and the Skip word, with --via=director) · --noverify (skip the cost cross-check)
//
// How a frame is made: the page's requestAnimationFrame is held; the stage (ctx.intro.stage, entered by this scenario: under
// GW_DEBUG the film never plays by itself) is put at t with setTime(t, {seek: true}); the look modules are pumped so mood, grade
// and the rig settle; the canvas is rendered and read in the same task.
//
// What it checks (failures fail the run):
//   - no page / console / ctx error; every frame at the time asked for
//   - A9 cost: stage.stats() within INTRO.set.budget at every frame, and (unless --noverify) equal to what renderer.info says
//     the set really costs (the frame drawn with and without it); no light, no shadow map, no render target added
//   - A9 prebuild: every prebuild() slice is timed (reported; on this machine's software GL the numbers are an upper bound);
//     no program is compiled once the film runs (renderer.info.programs after the warm-up == after the strip)
//   - A9 memory: after dispose() renderer.info.memory.geometries / .textures are back at their values before prebuild(),
//     and again after a second build-and-dispose (a replay)
//   - purity: the set's whole state (every transform, colour, opacity and visibility) at a time is identical after seeking away
//     and back
//   - §5 composition, measured by projection in every frame: (a) from 1.4 s to the contact the lantern and its mirror image
//     wholly in frame and the waterline at 46–56 %; (b) the lantern's mirror image, the ember and the Wick's flame out of the
//     words band; (c) the raft out of the gate take; (d) the Wick's flame in the lower-left third and both towers in frame in `wick`
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

export default async function (api) {
  const { page, wait, evalGame: g, log, args, width, height } = api;
  page.setDefaultTimeout(300000);
  const failures = [];
  const phone = !!args.mobile || width < height;
  const quality = typeof args.quality === 'string' ? args.quality : phone ? 'medium' : 'high';
  const settle = Number(args.settle) > 0 ? Number(args.settle) : 1.0;
  const via = args.via === 'director' ? 'director' : 'stage';
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
    T.mem = () => { const i = c.render.renderer.info; return { geometries: i.memory.geometries, textures: i.memory.textures, programs: i.programs ? i.programs.length : -1 }; };
    T.programs = () => (c.render.renderer.info.programs || []).map((p) => `${p.name}#${p.id}`);
    T.lights = () => { let n = 0; c.render.scene.traverse((o) => { if (o.isLight) n++; }); return { lights: n, shadows: c.render.renderer.shadowMap.enabled }; };
    T.parts = () => [c.render.scene.getObjectByName('intro:set'), c.render.camera.getObjectByName('intro:below')].filter(Boolean);
    // the set's whole state, as a string: every transform, visibility, colour and opacity the stage owns
    T.digest = () => {
      const out = [], r = (x) => Math.round(x * 1e4) / 1e4;
      const visit = (o, shown) => {
        shown = shown && o.visible;
        if (!shown) { out.push(`${o.name},hidden`); return; }   // (a hidden thing may keep the pose it was last shown in: it is not part of the picture)
        const m = o.material, row = [o.name, ...o.position.toArray().map(r), ...o.quaternion.toArray().map(r), ...o.scale.toArray().map(r)];
        if (o.matrixAutoUpdate === false) row.push(...o.matrix.elements.map(r));
        if (m) { if (m.color) row.push(...m.color.toArray().map(r)); if (m.opacity !== undefined) row.push(r(m.opacity)); if (m.uniforms) for (const k of Object.keys(m.uniforms)) { const v = m.uniforms[k].value; if (k === 'uFogD' || k === 'uViewH') continue; row.push(typeof v === 'number' ? r(v) : v && v.toArray ? v.toArray().map(r).join('/') : ''); } }
        if (o.isInstancedMesh) { let h = 0; const a = o.instanceColor.array, b = o.instanceMatrix.array; for (let i = 0; i < a.length; i++) h = (h * 31 + Math.round(a[i] * 1e3)) | 0; for (let i = 0; i < b.length; i++) h = (h * 31 + Math.round(b[i] * 1e3)) | 0; row.push(h); }
        out.push(row.join(','));
        for (const ch of o.children) visit(ch, shown);
      };
      for (const root of T.parts()) visit(root, true);
      return out.join('|');
    };
    const I = c.data.INTRO;
    return { v3: c.data.V3_ENABLED === true, hook: typeof c.debug.intro === 'function', tier: c.render.quality, intro: !!c.intro, stage: !!c.intro?.stage,
      budget: I?.set?.budget || null, beats: I?.beats || [], stills: I?.stills || [], length: I?.length, swapAt: I?.swapAt, fall: I?.set?.fall, wick: I?.set?.wick, flank: I?.set?.below?.flank,
      band: I?.words?.band, lines: I?.lines || [], mirror: c.water.reflection };
  }, { quality, ui: !!args.ui });
  log(`build: v3=${build.v3} intro=${build.intro} stage=${build.stage} tier=${build.tier} ${width}x${height} via=${via}`);
  if (!build.v3 || !build.intro || !build.stage) { failures.push('the v3 build does not carry the cut scene (ctx.intro and its stage)'); return { failures }; }

  // the strip: every second, each beat's start, middle and end, the reduced-motion stills, and the marks of the set
  let times;
  if (typeof args.at === 'string') times = args.at.split(',').map(Number).filter((x) => Number.isFinite(x));
  else {
    const S = new Set();
    for (let t = 0; t <= build.length; t++) S.add(t);
    for (const b of build.beats) { S.add(Math.max(b.t0, b.t0 === 0 ? build.swapAt + 0.05 : b.t0)); S.add(+((b.t0 + b.t1) / 2).toFixed(2)); S.add(+(b.t1 - 0.05).toFixed(2)); }
    for (const s of build.stills) S.add(s.t);
    for (const t of [0.2, build.fall.part + 0.08, build.fall.contact + 0.05, build.flank.eye, build.flank.cover + 0.1, build.flank.leave - 0.3, build.wick.spark + 0.1, 12.8, 13.05, build.wick.lantern[0] + 0.3]) S.add(+t.toFixed(2));
    times = [...S].sort((a, b) => a - b);
  }

  // ------------------------------------------------------------------ the prebuild, sliced (as the title would do it in idle time)
  await g(() => window.__is.hold());
  await wait(300);
  const pre = await g(() => {
    const c = window.__gw, T = window.__is, st = c.intro.stage;
    // the game builds its smoke and ember pools at the first puff (the Wick's first wax drip, some seconds into any title):
    // have that happen now, so the baseline is the game's steady state and not a title three seconds old
    try { const p = c.player.position; c.models.puff?.(new c.THREE.Vector3(p.x, 1.2, p.z), { count: 2, size: 0.2 }); } catch { /* optional */ }
    T.pump(0.3); T.render();
    const cold = T.mem();
    // a dry pass first: the film's cameras with nothing of the set drawn, so everything of the WORLD they are the first to see
    // (and upload) is in the baseline, and what is counted afterwards is the set's alone
    st.enter({ replay: true });
    for (const t of [0.6, 4.5, 8.0, 9, 13, 14.5, 16, 17.9]) { st.setTime(t, { seek: true }); T.pump(0.1); T.parts().forEach((p) => { p.visible = false; }); T.render(); }
    st.dispose(); T.pump(0.3); T.render();
    const base = T.mem(), lights = T.lights(), slices = [];
    let guard = 40, done = false;
    while (!done && guard-- > 0) { const t0 = performance.now(); done = st.prebuild(); slices.push(+(performance.now() - t0).toFixed(1)); }
    return { cold, base, lights, slices, done, after: T.mem(), stats: st.stats(), programs: T.programs() };
  });
  log(`prebuild: ${pre.slices.length} slices ${JSON.stringify(pre.slices)} ms (sum ${pre.slices.reduce((a, b) => a + b, 0).toFixed(1)}, longest ${Math.max(...pre.slices)}); memory at the cold title ${JSON.stringify(pre.cold)}, after a dry pass of the film's cameras (the baseline) ${JSON.stringify(pre.base)}, programs after the warm-up ${pre.after.programs}`);
  if (!pre.done) failures.push('prebuild() never reported ready');

  // ------------------------------------------------------------------ the strip
  const rows = [];
  let warmPrograms = null;
  for (const t of times) {
    const r = await g(({ t, settle, reduced, via, verify }) => {
      const c = window.__gw, T = window.__is, st = c.intro.stage, I = c.data.INTRO, THREE = c.THREE;
      if (via === 'director') { if (reduced && !c.intro.isActive()) c.debug.intro('play', { reduced: true }); c.debug.intro('seek', t); T.pump(settle); c.debug.intro('seek', t); }
      else { st.enter({ replay: true, reduced }); st.setTime(t, { seek: true, reduced }); T.pump(settle); st.setTime(t, { seek: true, reduced }); T.pump(0.05); }
      const url = T.render();
      const info = c.render.renderer.info, cam = c.render.camera, s = st.stats();
      const out = { url, t: s.t, stage: s, calls: info.render.calls, triangles: info.render.triangles, mode: c.render.getCameraMode?.(),
        cam: [cam.position.x, cam.position.y, cam.position.z].map((x) => +x.toFixed(2)), fov: +cam.fov.toFixed(1), errors: c.errors.length, mem: T.mem(), light: T.lights(), mirror: c.water.reflection.on };
      // the set's real cost: the same frame again, with and without it (the first render of a tick may also redraw the shadow map)
      if (verify) {
        c.render.render(); const withSet = [info.render.calls, info.render.triangles];
        const parts = T.parts(), vis = parts.map((p) => p.visible);
        parts.forEach((p) => { p.visible = false; }); c.render.render();
        out.real = { calls: withSet[0] - info.render.calls, triangles: withSet[1] - info.render.triangles };
        parts.forEach((p, i) => { p.visible = vis[i]; });
      }
      // where the subjects fall in the picture (fractions from the top-left), by projection through the camera as rendered
      cam.updateMatrixWorld(); cam.matrixWorldInverse.copy(cam.matrixWorld).invert();
      const P = (x, y, z) => { const v = new THREE.Vector3(x, y, z).project(cam); return [+(v.x * 0.5 + 0.5).toFixed(4), +(1 - (v.y * 0.5 + 0.5)).toFixed(4), v.z < 1 ? 1 : 0]; };
      const lan = c.render.scene.getObjectByName('intro:lantern'), A = s.anchors, comp = {};
      if (lan && lan.visible && A) {
        const H = I.set.lantern.height, R = I.set.lantern.radius, p = lan.position, top = p.y + H * 0.62, foot = p.y - H * 0.6;
        comp.lantern = { top: P(p.x, top, p.z)[1], foot: P(p.x, Math.max(0, foot), p.z)[1], left: P(p.x - R * 1.3, p.y, p.z)[0], right: P(p.x + R * 1.3, p.y, p.z)[0],
          mTop: P(p.x, -Math.max(0, foot), p.z)[1], mFoot: P(p.x, -top, p.z)[1] };
        comp.water = P(0, 0, A.G.z + 16)[1];
        comp.raft = P(A.S.x, 1, A.S.z);
      }
      const head = c.actors.getHeadPos?.();
      if (head) comp.flame = P(head.x, head.y, head.z);
      if (A) comp.towers = [P(A.G.x - 13, 24, A.G.z), P(A.G.x + 13, 24, A.G.z)];
      const em = c.render.camera.getObjectByName('intro:ember-core');
      if (em && em.visible && em.parent.visible) { const w = em.getWorldPosition(new THREE.Vector3()); comp.ember = P(w.x, w.y, w.z); }
      out.comp = comp;
      return out;
    }, { t, settle, reduced: !!args.reduced, via, verify: !args.noverify });
    const beat = build.beats.find((b) => t >= b.t0 && t < b.t1) || build.beats.at(-1);
    const name = `i-${t.toFixed(2).padStart(5, '0')}-${beat.id}`;
    writeFileSync(resolve(shotsDir, `${name}.png`), Buffer.from(r.url.split(',')[1], 'base64'));
    delete r.url;
    rows.push({ name, beat: beat.id, ...r });
    if (warmPrograms === null) warmPrograms = pre.after.programs;
    const c = r.comp, pc = (x) => (x * 100).toFixed(1);
    log(`${name} cam=${JSON.stringify(r.cam)} fov=${r.fov} rig=${r.mode} take=${r.stage.take} w=${(+r.stage.w).toFixed(2)} | frame ${r.calls} calls / ${r.triangles} tris | set ${r.stage.calls} / ${r.stage.triangles}${r.real ? ` (measured ${r.real.calls} / ${r.real.triangles})` : ''} | programs ${r.mem.programs}`
      + (c.lantern ? ` | lantern ${pc(c.lantern.top)}–${pc(c.lantern.foot)} % mirror ${pc(c.lantern.mTop)}–${pc(c.lantern.mFoot)} % water ${pc(c.water)} %` : '') + (c.ember ? ` | ember ${pc(c.ember[0])}, ${pc(c.ember[1])} %` : '') + (beat.id === 'wick' || beat.id === 'home' ? ` | flame ${pc(c.flame[0])}, ${pc(c.flame[1])} %` : ''));

    // ---- checks
    if (Math.abs(r.t - t) > 1e-3) failures.push(`t ${t}: the stage is at ${r.t}`);
    if (r.errors) failures.push(`t ${t}: ctx.errors is not empty`);
    const B = build.budget;
    if (B && (r.stage.calls > B.calls || r.stage.triangles > B.triangles)) failures.push(`t ${t}: the set costs ${r.stage.calls} calls / ${r.stage.triangles} triangles (budget ${B.calls} / ${B.triangles})`);
    if (r.real && (r.real.calls > r.stage.calls || r.real.triangles > r.stage.triangles + 2)) failures.push(`t ${t}: the set really costs ${r.real.calls} calls / ${r.real.triangles} triangles, more than stats() says (${r.stage.calls} / ${r.stage.triangles})`);
    if (r.light.lights !== pre.lights.lights || r.light.shadows !== pre.lights.shadows) failures.push(`t ${t}: the film changed the scene's lights or shadow maps (${JSON.stringify(r.light)} vs ${JSON.stringify(pre.lights)})`);
    const band = build.band[phone ? 'portrait' : 'landscape'], line = build.lines.some((l) => t >= l.at && t < l.out);
    if (c.lantern && t >= 1.4 && t <= build.fall.contact) {
      const L = c.lantern;
      if (!(L.top > 0.005 && L.mFoot < 0.995 && L.left > 0 && L.right < 1)) failures.push(`t ${t}: §5(a) the lantern (top ${pc(L.top)} %) and its mirror image (foot ${pc(L.mFoot)} %) must be wholly in frame`);
      if (!(c.water >= 0.46 && c.water <= 0.56)) failures.push(`t ${t}: §5(a) the waterline is at ${pc(c.water)} % (46–56 %)`);
      if (r.mirror && line && L.mFoot > band[0]) failures.push(`t ${t}: §5(b) the lantern's mirror image reaches ${pc(L.mFoot)} %, into the words band (from ${pc(band[0])} %)`);
      if (c.raft[2] && c.raft[1] > 0 && c.raft[1] < 1 && c.raft[0] > 0 && c.raft[0] < 1) failures.push(`t ${t}: §5(c) the raft is in the gate take`);
    }
    if (c.ember && c.ember[1] > band[0]) failures.push(`t ${t}: §5(b) the ember is in the words band`);
    if (beat.id === 'wick' && t >= build.wick.spark) {
      const f = c.flame;
      if (!(f[0] > 0.02 && f[0] < 0.42 && f[1] > 0.5 && f[1] < band[0])) failures.push(`t ${t}: §5(d) the Wick's flame is at ${pc(f[0])}, ${pc(f[1])} % (lower-left third, above the words band)`);
      if (!c.towers.every((p) => p[2] && p[0] > 0 && p[0] < 1 && p[1] > 0 && p[1] < 1)) failures.push(`t ${t}: §5(d) both towers must be in frame (${JSON.stringify(c.towers)})`);
    }
  }
  const last = rows.at(-1);


  // ------------------------------------------------------------------ purity, the end state, disposal (twice: a replay builds again)
  const tail = await g(({ via }) => {
    const c = window.__gw, T = window.__is, st = c.intro.stage, I = c.data.INTRO, out = { pure: [] };
    if (via === 'director') { c.debug.intro('stop'); T.pump(0.1); }
    st.enter({ replay: true });
    for (const t of [3.6, 6.9, 7.95, 10.5, 13.1]) {
      st.setTime(t, { seek: true }); const a = T.digest();
      st.setTime(16.2, { seek: true }); st.setTime(9.9, { seek: true }); st.setTime(0.1, { seek: true });
      st.setTime(t, { seek: true }); out.pure.push([t, a === T.digest(), a.length]);
    }
    st.setTime(I.length, { seek: true }); T.pump(0.3);
    const parts = T.parts();
    out.end = { stats: st.stats(), cam: c.render.getIntroCamera?.() ? c.render.getIntroCamera().w : null, shown: parts.some((p) => p.visible) };
    st.dispose(); T.pump(0.2); T.render();
    out.afterDispose = T.mem(); out.camAfter = c.render.getIntroCamera?.() ?? null; out.partsAfter = T.parts().length; out.statsAfter = st.stats();
    // a second life: build, show the costliest moments, dispose
    st.enter({ replay: true }); st.setTime(7.0, { seek: true }); T.pump(0.1); T.render(); st.setTime(10.6, { seek: true }); T.pump(0.1); T.render();
    out.during2 = T.mem();
    st.dispose(); T.pump(0.2); T.render();
    out.afterDispose2 = T.mem(); out.lights = T.lights();
    out.errors = c.errors.slice(); out.programs = T.programs();
    T.release();
    return out;
  }, { via });
  for (const [t, same] of tail.pure) if (!same) failures.push(`purity: the set at t ${t} differs after seeking away and back`);
  if (tail.end.shown || tail.end.cam !== 0 || tail.end.stats.calls !== 0) failures.push(`the end state (t = length) must show nothing of the set and leave the camera with the rig (w 0): ${JSON.stringify(tail.end)}`);
  for (const [label, m] of [['dispose()', tail.afterDispose], ['a second dispose()', tail.afterDispose2]]) {
    if (m.geometries !== pre.base.geometries || m.textures !== pre.base.textures) failures.push(`A9 memory: after ${label} renderer.info.memory is ${JSON.stringify(m)}, not the baseline ${JSON.stringify(pre.base)}`);
  }
  if (tail.camAfter !== null || tail.partsAfter !== 0 || tail.statsAfter.built) failures.push('dispose() must give the camera back, leave nothing in the scene and report not built');
  if (tail.lights.lights !== pre.lights.lights || tail.lights.shadows !== pre.lights.shadows) failures.push('the film left a light or a shadow-map setting behind');
  for (const e of tail.errors) failures.push('ctx.errors: ' + e);
  { const late = tail.programs.filter((p) => !pre.programs.includes(p));
    if (last && warmPrograms >= 0 && last.mem.programs > warmPrograms) failures.push(`A9: the film compiled ${last.mem.programs - warmPrograms} program(s) after the warm-up (${warmPrograms} → ${last.mem.programs}): ${late.join(', ')}`); }
  const worst = rows.reduce((a, r) => (r.stage.calls > a.stage.calls ? r : a), rows[0]), worstT = rows.reduce((a, r) => (r.stage.triangles > a.stage.triangles ? r : a), rows[0]);
  log(`cost: the set's peak is ${worst.stage.calls} calls (t ${worst.t}) and ${worstT.stage.triangles} triangles (t ${worstT.t}); budget ${build.budget.calls} / ${build.budget.triangles}; mirror ${rows.some((r) => r.mirror) ? 'on' : 'off'}`);
  log(`purity: ${tail.pure.map(([t, s]) => `${t}:${s ? 'same' : 'DIFFERENT'}`).join(' ')}`);
  log(`memory: baseline ${JSON.stringify(pre.base)} · while built ${JSON.stringify(tail.during2)} · after dispose ${JSON.stringify(tail.afterDispose)} · after a second build and dispose ${JSON.stringify(tail.afterDispose2)}`);
  log(`programs: ${pre.base.programs} before the warm-up, ${pre.after.programs} after it, ${last ? last.mem.programs : '?'} at the end of the strip`);
  writeFileSync(resolve(shotsDir, 'strip.json'), JSON.stringify({ width, height, quality, via, prebuild: pre, rows, tail }, null, 1));
  return { failures };
}
