// The show's pose viewer (docs/v3/show/SPEC.md §6.7, lane A): forces any class / species / Wick body / raft heading, plays the
// show on a deterministic 30 fps stepper (the game's clock is taken over: a slow software-GL machine shoots the same frames a
// fast one does) and shoots it at chosen pose times, from a close presenting camera (the spec's fit of actors.getShowFocus():
// SPEC §2.6) or from the play camera. Beside the frames, notes.json holds actors' own numbers for every shot (S5 / S6:
// clearances, hand gaps, the overshoot, flaps, drips, the raft's dip) and what the frame holds (S1: the fish's and the Wick's
// share of it, where the Wick faces), and one contact sheet per set is montaged (ImageMagick).
//
//   node build.mjs --dev --out=tools/out/show/dev.html
//   node tools/playtest.mjs --html=tools/out/show/dev.html --shots=tools/out/show/poses/desktop --script=tools/tests/show-poses.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/show/dev.html --shots=tools/out/show/poses/phone --script=tools/tests/show-poses.scenario.mjs --mobile
//
//   --mode=grid      (default) every class × three shapes and the extremes, the hold frame        → grid.jpg
//   --mode=strips    the motion of small, prize, trophy, elder and a legend, T+0 → the pause      → strip-<case>.jpg
//   --mode=bodies    the five Wick bodies × the five poses, the pause frame                        → bodies.jpg
//   --mode=headings  the raft at 0 / 90 / 180 / 270 / 45° for a hug, a hang and an alongside       → headings.jpg
//   --mode=one       one case: --species=reedjaw_pike --z=2.4 [--cls=trophy --pose=hug --body=taper --heading=90 --t=1.2 --cam=play]
//   --only=eel,ray   a subset by case name · --cam=play shoots from the play camera · --phase=gloomtide a night
//   --out=<name>     the sheet's name · --frames=N a strip's tile count
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, join } from 'node:path';

// name, species, z, extra showPose options
export const GRID = [
  ['tiny · quayling', 'quayling', -2, {}], ['small · perch', 'mossback_perch', -0.7, {}], ['small · crayfish', 'gutter_crayfish', -0.7, {}], ['small · puffer', 'sporebelly_puffer', -0.7, {}], ['small · jelly', 'sleepspore_jelly', -0.7, {}],
  ['keeper · carp', 'weeping_carp', 0.5, {}], ['keeper · eel', 'gloam_eel', 0.5, {}], ['keeper · ray', 'velvet_ray', 0.5, {}], ['keeper · koi', 'candlefin_koi', 0.5, {}],
  ['prize · pike', 'reedjaw_pike', 1.5, {}], ['prize · eel', 'gloam_eel', 1.5, {}], ['prize · ray', 'velvet_ray', 1.5, {}], ['prize · angler', 'mildew_angler', 1.5, {}], ['prize · jelly', 'chime_jelly', 1.5, {}],
  ['trophy · pike', 'reedjaw_pike', 2.4, {}], ['trophy · eel', 'gloam_eel', 2.4, {}], ['trophy · ray', 'velvet_ray', 2.4, {}], ['trophy · carp', 'weeping_carp', 2.4, {}], ['trophy · minnow', 'dusk_minnow', 2.4, {}], ['trophy · crayfish', 'gutter_crayfish', 2.4, {}],
  ['elder · pike', 'reedjaw_pike', 3.0, {}], ['elder · eel', 'gloam_eel', 3.0, {}], ['elder · ray', 'velvet_ray', 3.0, {}], ['elder · perch', 'mossback_perch', 3.0, {}],
  ['ancient · pike', 'reedjaw_pike', 3.45, {}], ['ancient · eel', 'threadling_eel', 3.45, {}], ['ancient · mirror pike', 'mirror_pike', 3.45, {}], ['ancient · gilt eel', 'gilt_eyed_eel', 3.45, {}],
  ['legend · matriarch', 'belled_matriarch', 1.0, {}], ['legend · grove ray', 'drifting_grove', 1.0, {}], ['legend · leviathan', 'lantern_swallower', 1.0, {}],
];
const STRIPS = [['small', 'mossback_perch', -0.7], ['prize', 'reedjaw_pike', 1.5], ['trophy', 'reedjaw_pike', 2.4], ['elder', 'reedjaw_pike', 3.0], ['legend', 'belled_matriarch', 1.0], ['tiny', 'quayling', -2], ['keeper-ray', 'velvet_ray', 0.5]];
const BODIES = ['wick', 'taper', 'stub', 'tallow', 'ashwick'];
const BODY_CASES = [['pinch', 'mossback_perch', -0.7], ['both', 'weeping_carp', 0.5], ['hug', 'reedjaw_pike', 2.4], ['hang', 'reedjaw_pike', 3.0], ['alongside', 'belled_matriarch', 1.0]];
const HEADINGS = [0, 90, 180, 270, 45];
const HEADING_CASES = [['hug', 'reedjaw_pike', 2.4], ['hang', 'reedjaw_pike', 3.0], ['alongside', 'belled_matriarch', 1.0]];
const STEP_MS = 1000 / 30;

/** In the page: the 30 fps stepper, the presenting camera (the spec's fit) and the frame's numbers. */
function install() {
  const c = window.__gw, THREE = c.THREE, V3 = THREE.Vector3;
  const raf = window.requestAnimationFrame.bind(window);
  const S = { on: false, q: [], now: null, step: 0, cam: 'play', yaw: null, snap: true, fit: null };
  window.__poses = S;
  window.requestAnimationFrame = (cb) => { if (S.on) { S.q.push(cb); return 0; } return raf(cb); };
  S.begin = () => { S.on = true; S.now = null; };
  S.end = () => { S.on = false; const q = S.q; S.q = []; S.now = null; for (const cb of q) raf(cb); };
  /** n frames of exactly `ms` of the game's clock each (run inside real animation frames, so the last one is composited). */
  S.frames = async (n, ms) => {
    for (let i = 0; i < n; i++) {
      await new Promise((res) => raf(() => {
        const q = S.q; S.q = [];
        S.now = (S.now ?? performance.now()) + ms;
        for (const cb of q) { try { cb(S.now); } catch (e) { (c.errors || []).push(String(e)); } }
        S.step++; res();
      }));
    }
    return S.step;
  };
  // ---- the presenting camera: SPEC §2.6's fit of the points actors.getShowFocus() returns
  S.fitOf = (f) => {
    const A = c.data.AUTOFISH.show.camera, row = A.pose[f.id], portrait = innerHeight > innerWidth;
    let fov = portrait ? row.fovPortrait : row.fov, elev = row.elev;
    if (f.id === 'pinch' && f.fish.length < 0.15 && !portrait) fov = row.tinyFov || fov;
    if (f.id === 'alongside' && f.fish.length > (row.craneAbove || 4)) elev = row.craneElev || 40;
    let yaw = S.yaw;
    if (f.id === 'alongside' && portrait && f.fish.length > (row.rakeAbove || 3.2)) {   // upright: filmed along its length from the head end
      const ax = f.fish.axis; elev = row.craneElev || 40;
      yaw = S.yaw + (row.rake || 55) * Math.PI / 180 * (ax.x * Math.cos(S.yaw) - ax.z * Math.sin(S.yaw) >= 0 ? 1 : -1);   // toward its head end
    }
    const e = elev * Math.PI / 180, m = portrait ? A.margin.portrait : A.margin.landscape;
    const back = new V3(Math.sin(yaw) * Math.cos(e), Math.sin(e), Math.cos(yaw) * Math.cos(e));   // from the picture to the lens
    const fwd = back.clone().negate(), right = new V3(Math.cos(yaw), 0, -Math.sin(yaw)), up = new V3().crossVectors(right, fwd).normalize();
    const pts = [];
    for (const k of row.keep) for (const p of (f.keep[k] || [])) pts.push(new V3(p.x, p.y, p.z));
    const tv = Math.tan(fov * Math.PI / 360), th = tv * (innerWidth / innerHeight), sx = th * (1 - 2 * m), sy = tv * (1 - 2 * m);
    const P = pts.map((p) => ({ x: p.dot(right), y: p.dot(up), z: p.dot(fwd) }));
    const fc = new V3(f.fish.center.x, f.fish.center.y, f.fish.center.z), zc = fc.dot(fwd);
    let cx = (Math.min(...P.map((p) => p.x)) + Math.max(...P.map((p) => p.x))) / 2, cy = (Math.min(...P.map((p) => p.y)) + Math.max(...P.map((p) => p.y))) / 2, d = 0;
    for (let pass = 0; pass < 3; pass++) {
      d = 0;
      for (const p of P) d = Math.max(d, Math.abs(p.x - cx) / sx - (p.z - zc), Math.abs(p.y - cy) / sy - (p.z - zc));
      d = Math.max(d, A.minLens + Math.max(...P.map((p) => zc - p.z)));
      // re-centre on the projected extents
      const u = P.map((p) => ({ u: (p.x - cx) / (d + p.z - zc), v: (p.y - cy) / (d + p.z - zc), w: d + p.z - zc }));
      const u0 = Math.min(...u.map((q) => q.u)), u1 = Math.max(...u.map((q) => q.u)), v0 = Math.min(...u.map((q) => q.v)), v1 = Math.max(...u.map((q) => q.v));
      cx += (u0 + u1) / 2 * d; cy += (v0 + v1) / 2 * d;
    }
    const look = right.clone().multiplyScalar(cx).addScaledVector(up, cy).addScaledVector(fwd, zc);
    const pos = look.clone().addScaledVector(back, d);
    if (pos.y < A.floor) pos.y = A.floor;
    return { pos, look, fov, d, elev, yaw };
  };
  if (!c.render.__posesWrapped) {
    const up = c.render.update.bind(c.render);
    c.render.update = (dt, t) => {
      up(dt, t);
      if (S.cam !== 'show') return;
      let f = null; try { f = c.actors.getShowFocus(); } catch { f = null; }
      if (f) S.fit = S.fitOf(f);
      const F = S.fit; if (!F) return;
      const cam = c.render.camera;
      if (S.snap || !S.cur) { S.cur = { pos: F.pos.clone(), look: F.look.clone(), fov: F.fov }; S.snap = false; }
      else { const k = 1 - Math.exp(-(S.omega || 6) * Math.min(0.1, dt)); S.cur.pos.lerp(F.pos, k); S.cur.look.lerp(F.look, k); S.cur.fov += (F.fov - S.cur.fov) * k; }
      cam.position.copy(S.cur.pos); cam.up.set(0, 1, 0); cam.lookAt(S.cur.look);
      cam.fov = S.cur.fov; cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
    };
    c.render.__posesWrapped = true;
  }
  /** The play camera's heading (from the picture to the lens), kept for the show camera: the Wick turns, the camera does not orbit. */
  S.readYaw = () => { const d = c.render.camera.getWorldDirection(new V3()); S.yaw = Math.atan2(-d.x, -d.z); return S.yaw; };
  // between shots the game steps without drawing (software GL spends its time in the fragment shaders): every update still runs
  const draw = c.render.render.bind(c.render);
  c.render.render = (...a) => (S.mute ? undefined : draw(...a));
  /** One frame straight off the canvas (the world only: the DOM ui is hidden for these). */
  S.grab = (q = 0.9) => { draw(); return c.render.renderer.domElement.toDataURL('image/jpeg', q); };
  // ---- what the frame holds (S1)
  S.metrics = () => {
    const cam = c.render.camera, scene = c.render.scene, W = innerWidth, H = innerHeight;
    scene.updateMatrixWorld(true); cam.updateMatrixWorld(true);
    const px = (v) => { const p = v.clone().project(cam); return { x: (p.x * 0.5 + 0.5) * W, y: (1 - (p.y * 0.5 + 0.5)) * H, z: p.z }; };
    const out = { info: c.debug.showPoseInfo() };
    const f = c.actors.getShowFocus();
    // the fish on screen: its box, bent as the body is (actors' own hull: a geometry bounding box knows nothing of the posture)
    let box = null;
    for (const v of c.debug.showPoseHull?.() || []) {
      const p = px(v); if (p.z >= 1) continue;
      box = box || { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
      box.x0 = Math.min(box.x0, p.x); box.y0 = Math.min(box.y0, p.y); box.x1 = Math.max(box.x1, p.x); box.y1 = Math.max(box.y1, p.y);
    }
    if (box) {
      const w = box.x1 - box.x0, h = box.y1 - box.y0, inW = Math.max(0, Math.min(W, box.x1) - Math.max(0, box.x0)), inH = Math.max(0, Math.min(H, box.y1) - Math.max(0, box.y0));
      out.fish = { wPx: Math.round(w), hPx: Math.round(h), wPct: Math.round(100 * w / W), hPct: Math.round(100 * h / H), diagPct: Math.round(100 * Math.hypot(w, h) / Math.hypot(W, H)), inFrame: Math.round(100 * inW * inH / Math.max(1, w * h)),
        edge: Math.round(100 * Math.min(box.x0 / W, box.y0 / H, 1 - box.x1 / W, 1 - box.y1 / H)) };
    }
    if (f) {
      const feet = px(new V3(f.feet.x, f.feet.y, f.feet.z)), fl = px(new V3(f.head.flame.x, f.head.flame.y, f.head.flame.z)), hc = px(new V3(f.head.center.x, f.head.center.y, f.head.center.z));
      out.wick = { hPct: Math.round(100 * Math.abs(feet.y - fl.y) / H), headIn: hc.x > 0 && hc.x < W && hc.y > 0 && hc.y < H, flameIn: fl.x > 0 && fl.x < W && fl.y > 0 && fl.y < H };
      out.lens = { d: +cam.position.distanceTo(new V3(f.head.center.x, f.head.center.y, f.head.center.z)).toFixed(2), fov: +cam.fov.toFixed(1) };
    }
    try { const I = c.render.renderer.info; out.gl = { calls: I.render.calls, tris: I.render.triangles, geo: I.memory.geometries, tex: I.memory.textures }; } catch { out.gl = null; }
    return out;
  };
  return true;
}

export default async function (api) {
  const { page, wait, evalGame: g, log, args } = api;
  page.setDefaultTimeout(300000);
  const failures = [];
  const mode = String(args.mode || 'grid');
  const only = args.only ? String(args.only).toLowerCase().split(',') : null;
  const shotsDir = resolve(process.cwd(), String(args.shots || 'tools/out/show/poses/desktop'));
  mkdirSync(shotsDir, { recursive: true });
  const notesPath = resolve(shotsDir, `notes-${mode}.json`);
  const notes = {};
  const portrait = api.height > api.width;

  await page.waitForFunction(() => window.__gw && (window.__gw.flow === 'title' || window.__gw.flow === 'hub'), null, { timeout: 300000 });
  await g(() => window.__gw.game.wipeAll());
  await page.goto(page.url().split('?')[0] + '?v3=1&v3phase=1', { waitUntil: 'load', timeout: 300000 });
  await page.waitForFunction(() => window.__gw && (window.__gw.flow === 'title' || window.__gw.flow === 'hub') && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 });
  await g(() => {
    const c = window.__gw, m = c.state.meta;
    m.runs = 3; m.deaths = 3; m.bestDay = 3;
    if (m.firstEvening) m.firstEvening.done = true;
    try { c.debug.firstEvening?.('done'); } catch { /* optional */ }
    m.seenTips = m.seenTips || {}; for (const t of c.data.TIPS || []) m.seenTips[t.id] = true;
    c.game.save?.();
    const el = document.createElement('style'); el.textContent = '#ui { display: none !important; }'; document.head.appendChild(el);
  });
  if (await g(() => window.__gw.flow !== 'title')) { await g(() => window.__gw.game.toTitle?.() ?? window.__gw.game.quitToTitle?.()); await wait(1500); }
  await g((q) => { try { window.__gw.render.setQuality?.(q); } catch { /* optional */ } }, String(args.quality || 'medium'));
  const frameNo = () => g(() => window.__gw.time.frame);
  const framesReal = async (n, timeoutS = 180) => { const f0 = await frameNo(), t0 = Date.now(); while (Date.now() - t0 < timeoutS * 1000) { if ((await frameNo()) >= f0 + n) return true; await wait(100); } return false; };
  const waitFor = async (fn, arg, timeoutS = 120, stepMs = 150) => { const t0 = Date.now(); while (Date.now() - t0 < timeoutS * 1000) { if (await g(fn, arg).catch(() => false)) return true; await wait(stepMs); } return false; };
  const scale = (x) => g((x) => window.__gw.debug.renderScale?.(x), x).catch(() => {});
  await scale(0.4);
  await g(() => window.__gw.game.startNewRun({ character: 'wick', nightMode: 'still' }));
  await waitFor(() => window.__gw.flow === 'playing', null, 240);
  await framesReal(4);
  await g((ph) => {
    const c = window.__gw;
    try { c.ui.closeAll?.(); } catch { /* optional */ }
    c.debug.mode?.('still'); c.state.run.day = 2; c.debug.god?.(true); c.debug.setOil?.(72); c.debug.setSatiety?.(80); c.debug.setPhase?.(ph);
  }, String(args.phase || 'calm'));
  await framesReal(args.phase ? 14 : 4);
  if (!(await g(() => typeof window.__gw.debug.showPose === 'function'))) return { failures: ['ctx.debug.showPose is missing (a debug build with v3 on is needed)'] };
  await g(install);
  await g(() => window.__poses.begin());
  const step = (n, mute = true) => g(([n, ms, mute]) => { window.__poses.mute = mute; return window.__poses.frames(n, ms); }, [n, STEP_MS, mute]);

  /** Shoot one case: returns its record. shots = [{label, t}] pose times (ascending), or {every, until} for a strip. */
  async function runCase(name, sp, z, o = {}, plan = {}) {
    const key = name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    // settle at play: the previous fish gone, the body and the heading as asked, the play camera at rest
    await g(([body, heading]) => {
      const c = window.__gw, P = window.__poses;
      try { c.debug.showPoseEnd?.({}); } catch { /* none up */ }
      P.cam = 'play'; P.cur = null; P.fit = null;
      c.actors.setCharacter(body);
      if (heading != null && c.player) { c.player.heading = heading; try { c.debug.setHeading?.(heading); } catch { /* optional */ } }
    }, [o.body || 'wick', o.headingDeg != null ? o.headingDeg * Math.PI / 180 : (args.heading != null ? Number(args.heading) * Math.PI / 180 : null)]);
    await step(36);
    const started = await g(([sp, z, o]) => {
      const c = window.__gw, P = window.__poses;
      P.readYaw();
      const r = c.debug.showPose({ speciesId: sp, z, cls: o.cls, pose: o.pose, special: !!o.special, fromSide: o.fromSide });
      P.cam = o.cam === 'play' ? 'play' : 'show'; P.snap = true;
      return r;
    }, [sp, z, { ...o, cam: o.cam || args.cam }]);
    if (!started) { failures.push(`${name}: no show`); return null; }
    const B = started.beats, total = B.lift + B.hold + B.pause;
    let shots = plan.shots;
    if (plan.every) { shots = []; for (let t = 0; t <= total + 1e-6; t += plan.every) shots.push({ label: `t${String(Math.round(t * 100)).padStart(3, '0')}`, t }); }
    if (!shots) shots = [{ label: 'hold', t: B.lift + Math.min(B.hold * 0.55, B.hold - 0.08) }];
    shots = shots.map((s) => ({ ...s, t: s.t === 'pause' ? B.lift + B.hold + Math.min(0.4, B.pause * 0.6) : s.t === 'present' ? B.lift : s.t === 'hold' ? B.lift + B.hold * 0.55 : s.t === 'take' ? B.lift * 0.62 : s.t }));
    const rec = { case: name, species: sp, z, ...started, frames: [] };
    let at = 0;
    for (const s of shots) {
      const want = Math.max(1, Math.round(s.t * 30)), n = want - at;
      if (n > 1) { await step(n - 1); at += n - 1; }
      await scale(1);
      if (n >= 1) { await step(1, false); at += 1; }
      const file = `${key}-${s.label}.jpg`;
      try {
        const url = await g(() => window.__poses.grab(0.9));
        writeFileSync(join(shotsDir, file), Buffer.from(url.split(',')[1], 'base64'));
      } catch (e) { log('grab failed', file, String(e?.message || e).split('\n')[0]); }
      const m = await g(() => window.__poses.metrics()).catch((e) => ({ error: String(e) }));
      rec.frames.push({ file, label: s.label, t: +(at / 30).toFixed(3), ...m });
      await scale(0.4);
      const I = m.info || {};
      log('shot', file, JSON.stringify({ t: I.t, phase: I.phase, fish: m.fish && `${m.fish.wPct}x${m.fish.hPct}% in ${m.fish.inFrame}%`, wick: m.wick?.hPct, lens: m.lens, inBody: I.inBody, under: I.underDeck, gap: I.handGap, off: I.wickOffLens, endOn: I.endOn }));
    }
    notes[key] = rec;
    writeFileSync(notesPath, JSON.stringify(notes, null, 1));
    return rec;
  }
  const im = (cmd, a) => { try { execFileSync(cmd, a, { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 28 }); return true; } catch (e) { log(`${cmd} failed`, String(e?.message || e).split('\n')[0]); return false; } };
  /** A contact sheet of frames [{file, label}] (ImageMagick montage). */
  function sheet(out, tiles, perRow, title) {
    const [tw, th] = portrait ? [195, 422] : [384, 216];
    const a = ['-background', '#0c0b14', '-fill', '#ece6d6', '-font', 'DejaVu-Sans', '-pointsize', portrait ? '10' : '12'];
    for (const t of tiles) if (existsSync(join(shotsDir, t.file))) a.push('-label', t.label, join(shotsDir, t.file));
    a.push('-tile', `${perRow}x`, '-geometry', `${tw}x${th}+3+3`);
    if (title) a.push('-title', title);
    a.push('-quality', '86', join(shotsDir, out));
    if (im('montage', a)) log('sheet', join(shotsDir, out));
  }
  const lab = (rec, fr) => {
    const I = fr.info || {}, f = fr.fish;
    return `${rec.case}  ${rec.id} ${Math.round(rec.length * 100)} cm  t ${fr.t.toFixed(2)} ${I.phase || ''}\\nfish ${f ? `${f.wPct}x${f.hPct}%` : '-'}  wick ${fr.wick?.hPct ?? '-'}%  lens ${fr.lens?.d ?? '-'} m  off ${Math.round(I.wickOffLens ?? 0)}° endOn ${Math.round(I.endOn ?? 0)}°`;
  };
  const want = (n) => !only || only.some((x) => n.toLowerCase().includes(x));

  if (mode === 'one') {
    const sp = String(args.species || 'reedjaw_pike'), z = Number(args.z ?? 0.5);
    const tArg = args.t != null ? String(args.t).split(',').map((x) => (Number.isFinite(Number(x)) ? { label: `t${String(Math.round(Number(x) * 100)).padStart(3, '0')}`, t: Number(x) } : { label: x, t: x })) : [{ label: 'take', t: 'take' }, { label: 'present', t: 'present' }, { label: 'hold', t: 'hold' }, { label: 'pause', t: 'pause' }];
    const rec = await runCase(String(args.name || `${sp} z${z}`), sp, z, { cls: args.cls, pose: args.pose, body: args.body, headingDeg: args.heading != null ? Number(args.heading) : null, special: !!args.special }, { shots: tArg });
    if (rec) sheet(String(args.out || 'one') + '.jpg', rec.frames.map((f) => ({ file: f.file, label: lab(rec, f) })), Math.min(4, rec.frames.length));
  } else if (mode === 'strips') {
    for (const [name, sp, z] of STRIPS) {
      if (!want(name)) continue;
      const plan = await g((cls) => window.__gw.data.showPlan(cls), name === 'legend' ? 'ancient' : name === 'tiny' ? 'small' : name === 'keeper-ray' ? 'keeper' : name);
      const total = plan.lift + plan.hold + plan.pause, n = Math.max(8, Math.min(20, Number(args.frames) || (portrait ? 12 : 16)));
      const rec = await runCase(`strip ${name}`, sp, z, {}, { every: Math.max(1 / 30, Math.round(total / (n - 1) * 30) / 30) });
      if (rec) sheet(`strip-${name}.jpg`, rec.frames.map((f) => ({ file: f.file, label: `t ${f.t.toFixed(2)} ${f.info?.phase || ''}  p ${f.info?.p ?? ''}\\nstr ${f.info?.struggle ?? ''}  dip ${f.info?.dip ?? ''}` })), portrait ? 6 : 4, `${rec.case}: ${sp} ${rec.id} ${Math.round(rec.length * 100)} cm`);
    }
  } else if (mode === 'bodies') {
    const tiles = [];
    for (const [pose, sp, z] of BODY_CASES) for (const body of BODIES) {
      const name = `${body} ${pose}`;
      if (!want(name)) continue;
      const rec = await runCase(name, sp, z, { body }, { shots: [{ label: 'pause', t: 'pause' }] });
      if (rec) tiles.push({ file: rec.frames[0].file, label: lab(rec, rec.frames[0]) });
    }
    sheet(String(args.out || 'bodies') + '.jpg', tiles, BODIES.length);
    await g(() => window.__gw.actors.setCharacter('wick'));
  } else if (mode === 'headings') {
    const tiles = [];
    for (const [pose, sp, z] of HEADING_CASES) for (const h of HEADINGS) {
      const name = `${pose} raft ${h}`;
      if (!want(name)) continue;
      const rec = await runCase(name, sp, z, { headingDeg: h }, { shots: [{ label: 'pause', t: 'pause' }] });
      if (rec) tiles.push({ file: rec.frames[0].file, label: lab(rec, rec.frames[0]) });
    }
    sheet(String(args.out || 'headings') + '.jpg', tiles, HEADINGS.length);
  } else {
    const tiles = [];
    for (const [name, sp, z, o] of GRID) {
      if (!want(name)) continue;
      const rec = await runCase(name, sp, z, o, { shots: [{ label: 'hold', t: 'hold' }] });
      if (rec) tiles.push({ file: rec.frames[0].file, label: lab(rec, rec.frames[0]) });
    }
    sheet(String(args.out || 'grid') + '.jpg', tiles, portrait ? 6 : 4);
  }
  await g(() => { try { window.__gw.debug.showPoseEnd?.({}); } catch { /* none */ } window.__poses.cam = 'play'; window.__poses.mute = false; window.__poses.end(); });
  // S5 / S6 on what was shot (the numeric sweep of every pose time is tools/tests/show-poses.test.mjs, in node)
  for (const rec of Object.values(notes)) for (const fr of rec.frames) {
    const I = fr.info || {};
    if (!I.active) continue;
    if (I.phase !== 'lift' && I.inBody > 0.02) failures.push(`${rec.case} ${fr.label}: the fish is ${I.inBody} m inside the Wick`);
    if (I.phase !== 'lift' && I.underDeck > 0.01) failures.push(`${rec.case} ${fr.label}: the fish is ${I.underDeck} m under the planks`);
    for (const k of ['r', 'l']) if (I.phase !== 'lift' && I.handGap?.[k] != null && I.handGap[k] > (rec.id === 'alongside' ? 0.05 : 0.03)) failures.push(`${rec.case} ${fr.label}: the ${k} hand is ${I.handGap[k]} m off the fish`);
    if (fr.fish && I.phase !== 'lift' && fr.fish.inFrame < 100 && (args.cam || 'show') === 'show') failures.push(`${rec.case} ${fr.label}: the fish is cropped (${fr.fish.inFrame} % in frame)`);
  }
  if (existsSync(join(shotsDir, '.tmp'))) rmSync(join(shotsDir, '.tmp'), { recursive: true, force: true });
  void readFileSync;
  return { failures };
}
