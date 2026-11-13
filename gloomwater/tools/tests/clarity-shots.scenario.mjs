// The CLARITY SET — the fixed frames the "Clear Night" graphics pass is judged on (docs/v3/clarity/SPEC.md), as a re-runnable
// tools/playtest.mjs scenario. Every stage of the pass shoots these same frames (same raft position, phase, camera, shader clock
// and random seed) and feeds them to tools/clarity-report.mjs.
//
//   node build.mjs --dev --out=tools/out/clarity/dev.html
//   node tools/playtest.mjs --html=tools/out/clarity/dev.html --shots=tools/out/clarity/before \
//        --script=tools/tests/clarity-shots.scenario.mjs --width=960 --height=540            # the desktop set (c01 … c17)
//   node tools/playtest.mjs --html=tools/out/clarity/dev.html --shots=tools/out/clarity/before \
//        --script=tools/tests/clarity-shots.scenario.mjs --mobile                             # the phone set (m01 … m03, 390×844)
//   node tools/clarity-report.mjs tools/out/clarity/before --json=tools/out/clarity/before/metrics.json
//   node tools/clarity-report.mjs tools/out/clarity/after --baseline=docs/v3/clarity/baseline-metrics.json --gate   # a later stage
//
// Desktop set (960×540, quality high, UI hidden unless noted; the v3 phase-1 game the user plays, a Still night so no swarm):
//   c01-mossmere-calm  c02-mossmere-dusk  c03-mossmere-night  c04-mossmere-dawn     the Mossmere, sail framing from the spawn
//   c05-raft-lantern        a close view of the raft and the Wick by lantern light (Mossmere night)
//   c06-far-ruins-calm  c07-far-ruins-night   a low view across the lake to the Drowned Gatehouse and the far ruins
//   c08-sporewood-calm  c09-sporewood-night  c10-glasswater-calm  c11-glasswater-night  c12-paleabyss-calm  c13-paleabyss-night
//   c14-signs               fish signs on the water at the sail framing (v3)
//   c15-catch-reveal        the catch close-up at the ceremony's climax, the fish revealed (v3)
//   c16-hud                 the Mossmere at calm with the HUD on (a page screenshot: DOM + canvas)
//   c17-swarm-overview      a Lantern night with the swarm up: the night overview camera, ~24 enemies round the raft (v3;
//                           enemies and telegraphs must read at least as well on the clearer, deeper water)
// Phone set (390×844, quality medium = what a 4-core phone gets from `auto`):
//   m01-mossmere-calm  m02-mossmere-night  m03-raft-lantern
//
// Options (playtest passes every --key=value through):
//   --only=c03,c06        a subset (substring match on frame names)
//   --quality=high        the tier to shoot at (default high on desktop, medium with --mobile)
//   --flagoff             shoot the flag-off game (no ?v3=1 reload; c14 / c15 / c17 are skipped). Its night frames use v1's night
//                         overview camera, so compare them only with a flag-off baseline shot the same way
//   --settle=7            seconds of simulated mood / grade / camera easing before a static frame
//   --perf                also measure draw calls / triangles / programs per tier into perf.json (Mossmere calm and night)
//   --isolate[=c01,c03]   the audit's knob sweep: for each listed frame (default c01,c03,c06,c07) shoot one PNG per entry of
//                         KNOB_SETS into <shots>/iso/<frame>__<knob>.png, all of the same frozen instant (see KNOBS below);
//                         --knobset=base,fog-0 limits the sweep to those sets
//   --knobs='{"fog":0.4}' apply one knob set to every frame of the run (a what-if set; never a baseline)
//
// How a static frame is made repeatable: the page's requestAnimationFrame is held, Math.random is re-seeded from the frame's
// name, ctx.time.t is pinned to the frame's own slot, the look modules (actors, models, world, water, render) are pumped in
// 0.05 s steps so mood, grade, palette and camera settle, the camera is placed from the rig's settled parameters without its
// hand-held sway, and the canvas is rendered and read in the same task (a re-shoot repeats every metric within ±1 %; the film
// grain runs on the renderer's private clock, so frames are not bit-identical). c14 / c15 / c17 are live (signs, the ceremony
// and the swarm run on the game's clocks; their lead-up runs at a reduced render scale to keep software GL moving), so they
// repeat in framing and state but not to the pixel.
//
// KNOBS (audit only; they change nothing in the build): fog (× scene fog density), waterFog:0 (the water's own scene-fog mix
// off), waterSky (× the mist colour the water's fresnel mirrors), waterStars / domeStars (× the mirrored / the vault's stars),
// waterDeep (shallow water colour → deep, 0..1), hemi / key (× the ambient hemisphere / the directional light), albedo (× the
// reflectance of the world's vertex-coloured stone / wood kit), mist:0 (shore mist ring + mist sheets), motes, shafts:0,
// halos:0, ringMist (× the parallax rings' mist / vault tint), bloom (× strength), bloomRadius, bloomThreshold, bloomKnee, lift, saturation, contrast, fringe, paper, grain, vignette,
// tintAmount, tone ('none'|'aces'|'agx'|'neutral'), exposure (×), outline:0, tier ('low'|'medium': the render side of that
// tier — MSAA, bloom buffer, paper / fringe), scale (render below CSS resolution, as a pixel-ratio cap does on a phone; that
// shot is a page screenshot so the browser's upscale is in it).
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const FONT_CACHE = resolve(here, '..', 'out', '.font-cache');
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
function fetchCached(url) {
  const p = resolve(FONT_CACHE, createHash('sha1').update(url).digest('hex'));
  if (existsSync(p)) return readFileSync(p);
  try {
    const buf = execFileSync('curl', ['-sSfL', '-m', '20', '-A', UA, url], { maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] });
    mkdirSync(FONT_CACHE, { recursive: true }); writeFileSync(p, buf); return buf;
  } catch { return null; }
}

// frame name → its fixed slot (the shader clock and the random seed come from it, whatever subset or order is shot)
const DESKTOP = ['c01-mossmere-calm', 'c02-mossmere-dusk', 'c03-mossmere-night', 'c04-mossmere-dawn', 'c05-raft-lantern',
  'c06-far-ruins-calm', 'c07-far-ruins-night', 'c08-sporewood-calm', 'c09-sporewood-night', 'c10-glasswater-calm',
  'c11-glasswater-night', 'c12-paleabyss-calm', 'c13-paleabyss-night', 'c14-signs', 'c15-catch-reveal', 'c16-hud', 'c17-swarm-overview'];
const PHONE = ['m01-mossmere-calm', 'm02-mossmere-night', 'm03-raft-lantern'];
// (slots are append-only: a frame keeps its clock and seed for good; c17 was added after the phone set)
const SLOT = Object.fromEntries([...DESKTOP.slice(0, 16), ...PHONE, ...DESKTOP.slice(16)].map((n, i) => [n, i]));
const PHASE_K = { calm: 0.35, dusk: 0.6, gloomtide: 0.35, dawn: 0.45 };

// the audit's sweep: one PNG per entry, each against the same frozen frame (`night: true` = only on night frames)
export const KNOB_SETS = [
  ['base', {}],
  ['fog-0', { fog: 0 }],
  ['fog-50', { fog: 0.5 }],
  ['fog-nonight', { fog: 1 / 1.5 }, { night: true }],
  ['waterfog-0', { waterFog: 0 }],
  ['watersky-50', { waterSky: 0.5 }],
  ['waterstars-0', { waterStars: 0 }],
  ['domestars-0', { domeStars: 0 }],
  ['waterdeep-50', { waterDeep: 0.5 }],
  ['hemi-60', { hemi: 0.6 }],
  ['hemi-60-key-150', { hemi: 0.6, key: 1.5 }],
  ['albedo-220', { albedo: 2.2 }],
  ['albedo-220-key-150', { albedo: 2.2, key: 1.5 }],
  ['mist-0', { mist: 0 }],
  ['motes-0', { motes: 0 }],
  ['shafts-0', { shafts: 0 }],
  ['ringmist-0', { ringMist: 0 }],
  ['bloom-0', { bloom: 0 }],
  ['bloom-radius-02', { bloomRadius: 0.2 }],
  ['bloom-threshold-1', { bloomThreshold: 1.0 }],
  ['bloom-knee-005', { bloomKnee: 0.05 }],
  ['lift-0', { lift: 0 }],
  ['sat-115', { saturation: 1.15 }],
  ['fringe-0', { fringe: 0 }],
  ['paper-0', { paper: 0 }],
  ['grain-0', { grain: 0 }],
  ['vignette-0', { vignette: 0 }],
  ['lens-0', { fringe: 0, paper: 0, grain: 0, vignette: 0 }],
  ['tone-neutral', { tone: 'neutral' }],
  ['tone-agx', { tone: 'agx' }],
  ['outline-0', { outline: 0 }],
  ['tier-medium', { tier: 'medium' }],
  ['tier-low', { tier: 'low' }],
  ['scale-50', { scale: 0.5 }],
  ['scale-33', { scale: 1 / 3 }],
  // lane A alone, roughly: thin clear air, a tight small bloom, no lens dirt (a feasibility probe for the spec's targets)
  ['clear-air', { fog: 0.3, waterFog: 0, mist: 0, motes: 0.5, ringMist: 0.35, bloom: 0.45, bloomRadius: 0.3, bloomThreshold: 0.9, lift: 0, fringe: 0, paper: 0, grain: 0.015, vignette: 0.7, vignetteMul: 1 }],
  // lane A + a crude stand-in for lane B's light: less ambient fill, a stronger key, deeper near water, the mirrored stars
  // kept only as a trace (the planar reflection will put them where a mirror would: far, grazing water)
  ['clear-night', { fog: 0.3, waterFog: 0, mist: 0, motes: 0.5, ringMist: 0.35, bloom: 0.45, bloomRadius: 0.3, bloomThreshold: 0.9, lift: 0, fringe: 0, paper: 0, grain: 0.015, vignette: 0.7, vignetteMul: 1,
    hemi: 0.62, key: 1.6, waterDeep: 0.45, waterStars: 0.3, contrast: 1.1 }],
  // the same with the stone's reflectance lifted so the light, not the fog, carries the mid and far layers
  ['clear-night-lit', { fog: 0.34, waterFog: 0, mist: 0.3, motes: 0.5, ringMist: 0.5, bloom: 0.45, bloomRadius: 0.3, bloomThreshold: 0.92, lift: 0, fringe: 0, paper: 0, grain: 0.012, vignette: 0.65, vignetteMul: 1,
    albedo: 2.4, hemi: 0.7, key: 1.6, waterDeep: 0.35, waterStars: 0.3, contrast: 1.08 }],
];

export default async function (api) {
  const { page, wait, evalGame: g, log, args, width, height } = api;
  page.setDefaultTimeout(300000);
  const failures = [];
  const phone = !!args.mobile || width < height;
  const names = phone ? PHONE : DESKTOP;
  const only = args.only && args.only !== true ? String(args.only).toLowerCase().split(',').map((s) => s.trim()).filter(Boolean) : null;
  const flagOff = !!args.flagoff;
  const want = (n) => (!only || only.some((o) => n.includes(o))) && !(flagOff && /signs|catch|swarm/.test(n));
  const quality = typeof args.quality === 'string' ? args.quality : phone ? 'medium' : 'high';
  const SETTLE = Number(args.settle) > 0 ? Number(args.settle) : 7;
  const shotsDir = resolve(process.cwd(), String(args.shots || 'tools/out/clarity/shots'));
  mkdirSync(shotsDir, { recursive: true });
  const knobFilter = typeof args.knobset === 'string' ? args.knobset.split(',') : null;   // --knobset=base,clear-night: only these sets
  const isoFrames = args.isolate ? (args.isolate === true ? ['c01', 'c03', 'c06', 'c07'] : String(args.isolate).split(',')) : null;
  let runKnobs = null;
  if (typeof args.knobs === 'string') { try { runKnobs = JSON.parse(args.knobs); } catch (e) { failures.push('bad --knobs JSON: ' + e.message); } }
  const record = {};
  const t0 = Date.now();
  const el = () => ((Date.now() - t0) / 1000).toFixed(0);

  // ------------------------------------------------------------------ boot: the v3 phase-1 game, a returning player
  await page.route(/fonts\.(googleapis|gstatic)\.com/, async (route) => {
    const url = route.request().url();
    const buf = fetchCached(url);
    if (!buf) return route.abort();
    const ct = /googleapis/.test(url) ? 'text/css; charset=utf-8' : /\.woff2(\?|$)/.test(url) ? 'font/woff2' : 'application/octet-stream';
    return route.fulfill({ status: 200, body: buf, headers: { 'content-type': ct, 'access-control-allow-origin': '*' } });
  });
  const atTitle = () => page.waitForFunction(() => window.__gw && (window.__gw.flow === 'title' || window.__gw.flow === 'hub') && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 });
  await page.waitForFunction(() => window.__gw && (window.__gw.flow === 'title' || window.__gw.flow === 'hub'), null, { timeout: 300000 });
  await g(() => window.__gw.game.wipeAll());
  if (!flagOff) await page.goto(page.url().split('?')[0] + '?v3=1&v3phase=1', { waitUntil: 'load', timeout: 300000 });
  await atTitle();
  await g(async () => { try { await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 8000))]); } catch { /* optional */ } });
  const build = await g(() => ({ v3: window.__gw.data.V3_ENABLED === true, phase: window.__gw.data.V3_PHASE ?? null }));
  log(`build: v3=${build.v3} phase=${build.phase} set=${phone ? 'phone' : 'desktop'} ${width}x${height} quality=${quality}`);
  if (!flagOff && !build.v3) failures.push('the v3 switch did not apply (?v3=1&v3phase=1)');

  await g(({ quality }) => {
    const c = window.__gw, m = c.state.meta;
    m.runs = 3; m.deaths = 3; m.bestDay = 3;
    if (m.firstEvening) m.firstEvening.done = true;
    try { c.debug.firstEvening?.('done'); } catch { /* optional */ }
    m.seenTips = m.seenTips || {}; for (const t of c.data.TIPS || []) if (t?.id) m.seenTips[t.id] = true;
    m.settings = m.settings || {}; m.settings.quality = quality;
    try { c.game.save?.(); } catch { /* optional */ }
    try { c.render.setQuality?.(quality); } catch { /* optional */ }

    // ---------------------------------------------------------------- in-page helpers
    const C = (window.__cl = { cam: null, knobUndo: null });
    const raf = window.requestAnimationFrame.bind(window);
    let held = null;
    // (a frame the browser has already scheduled is taken back when the hold starts: left pending, it could fire between a
    // frame's what-if knobs and its render, and world / render would put the fog and the grade back before the shot)
    const caf = window.cancelAnimationFrame.bind(window), pending = new Map();
    const live = (cb) => { const id = raf((t) => { pending.delete(id); cb(t); }); pending.set(id, cb); return id; };
    window.requestAnimationFrame = (cb) => { if (held) { held.push(cb); return 0; } return live(cb); };
    C.hold = (on) => {
      if (on) { held = held || []; for (const [id, cb] of pending) { caf(id); held.push(cb); } pending.clear(); return true; }
      if (held) { const q = held; held = null; for (const cb of q) live(cb); }
      return false;
    };
    // a seeded Math.random (mulberry32): ambient ripples, spots and sparks draw the same numbers for the same frame
    const realRandom = Math.random;
    let seed = 0;
    C.seed = (n) => { seed = (n >>> 0) || 1; Math.random = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
    C.unseed = () => { Math.random = realRandom; };
    // the camera override: { pos: [x,y,z], look: [x,y,z], fov, rel: true = offsets from the raft } (applied after render.update)
    const ru = c.render.update;
    c.render.update = (dt, t) => { ru(dt, t); C.applyCam(); };
    C.applyCam = () => {
      const k = C.cam; if (!k) return;
      const cam = c.render.camera, p = c.player.position;
      const ox = k.rel ? p.x : 0, oz = k.rel ? p.z : 0;
      cam.position.set(ox + k.pos[0], k.pos[1], oz + k.pos[2]);
      cam.up.set(0, 1, 0);
      cam.lookAt(ox + k.look[0], k.look[1], oz + k.look[2]);
      if (k.fov && Math.abs(cam.fov - k.fov) > 1e-3) { cam.fov = k.fov; cam.updateProjectionMatrix(); }
      cam.updateMatrixWorld();
    };
    // the plain rig without its hand-held sway and roll (those run on render's own clock, which no scenario can pin): the
    // camera is placed from the rig's settled focus and parameters (debug.camera()), exactly as render.js does it
    C.rigCam = () => {
      if (C.cam || typeof c.debug.camera !== 'function') return false;
      const d = c.debug.camera(), cam = c.render.camera, DEG = Math.PI / 180;
      if (d.mode === 'trophy') return false;
      const yaw = d.yawDeg * DEG, elev = Math.max(3, Math.min(85, d.cur.elev)) * DEG, dist = d.cur.dist, f = d.focus;
      const sy = Math.sin(yaw), cy = Math.cos(yaw), ce = Math.cos(elev), se = Math.sin(elev);
      let wh = 0; try { wh = Number(c.water.getHeight?.(f.x, f.z)) || 0; } catch { /* optional */ }
      cam.position.set(f.x + sy * ce * dist, Math.max(1.2, f.y + se * dist + wh * 0.25), f.z + cy * ce * dist);
      cam.up.set(0, 1, 0);
      cam.lookAt(f.x - sy * d.cur.aim, f.y + d.cur.aimY + wh * 0.4, f.z - cy * d.cur.aim);
      if (Math.abs(cam.fov - d.cur.fov) > 1e-3) { cam.fov = d.cur.fov; cam.updateProjectionMatrix(); }
      cam.updateMatrixWorld();
      return true;
    };
    C.pump = (sec, t0) => {
      const order = ['actors', 'models', 'world', 'water', 'render'];
      let t = Number.isFinite(t0) ? t0 : c.time.t;
      for (let i = 0, n = Math.max(1, Math.round(sec / 0.05)); i < n; i++) {
        t += 0.05; c.time.t = t; c.time.dt = 0.05;
        for (const name of order) { const m = c[name]; if (!m || m.isStub || typeof m.update !== 'function') continue; try { m.update(0.05, t); } catch { /* keep pumping */ } }
      }
      return t;
    };
    C.hideUi = (on) => {
      let s = document.getElementById('cl-hide-ui');
      if (!s) { s = document.createElement('style'); s.id = 'cl-hide-ui'; document.head.appendChild(s); }
      // (opacity, not display: the DOM keeps its layout, transitions and animation events, which the measuring ceremony waits on)
      s.textContent = (on ? '#ui { opacity: 0 !important; }\n' : '') + '.gw-banner, .gw-banner-layer, .gw-toast { opacity: 0 !important; }';
    };
    C.clearUi = () => {
      for (let i = 0; i < 12 && c.combat?.pendingOptions?.length; i++) { try { c.combat.chooseBoon?.(c.combat.pendingOptions[0].boonId); } catch { break; } }
      try { if (c.ui?.isBlocking?.()) c.ui.closeAll?.(); if (c.paused) c.game.resume?.(); } catch { /* optional */ }
    };
    C.pin = () => { try { c.debug.god?.(true); c.debug.setOil?.(72); c.debug.setSatiety?.(80); c.debug.setHp?.(99); } catch { /* optional */ } if (c.state.run) c.state.run.xpNext = 1e9; };
    C.goZone = (zone) => {
      const r = c.state.run;
      try { c.debug.unlockZone?.(zone); } catch { /* optional */ }
      if (!(r.zonesUnlocked || []).includes(zone)) r.zonesUnlocked = [...(r.zonesUnlocked || []), zone];
      try { c.combat.killAll?.('debug'); } catch { /* optional */ }
      try { c.fishing.cancel?.('debug'); } catch { /* optional */ }
      if (r.zone !== zone) { r.zone = zone; r.gateOpen = false; c.bus.emit('zone:change', { zone, prev: null }); }
      try { const sp = c.world.getSpawn?.(); if (sp?.position) c.player.teleport?.(sp.position, sp.yaw || 0); } catch { /* optional */ }
      return r.zone;
    };
    C.phase = (name, k) => {
      const r = c.state.run;
      if (r.phase !== name) c.debug.setPhase?.(name);
      const info = c.survival.getPhaseInfo?.();
      if (info && info.duration > 0) r.phaseTime = info.duration * k;
      try { c.combat.killAll?.('debug'); } catch { /* optional */ }
      C.pin();
      return c.survival.getPhaseInfo?.();
    };
    C.info = () => {
      const r = c.state.run, pi = c.survival?.getPhaseInfo?.(), R = c.render, f = R.scene.fog, cam = R.camera;
      const gp = R.composer.passes.find((p) => p.uniforms && p.uniforms.uLift);
      const u = gp ? Object.fromEntries(['uSaturation', 'uContrast', 'uTintAmount', 'uWarmAmount', 'uLift', 'uVignette', 'uFringe', 'uPaper', 'uGrain'].map((k) => [k.slice(1).toLowerCase(), +gp.uniforms[k].value.toFixed(4)])) : null;
      const cv = R.renderer.domElement;
      return {
        zone: r?.zone, phase: pi?.phase, k: +(pi?.k ?? 0).toFixed(2), night: +(c.world.getMood?.().night ?? 0).toFixed(3), warm: +(c.world.getMood?.().warm ?? 0).toFixed(3),
        camMode: R.getCameraMode?.(), cam: [cam.position.x, cam.position.y, cam.position.z].map((x) => +x.toFixed(2)), fov: +cam.fov.toFixed(1),
        quality: R.quality, buffer: [cv.width, cv.height], pixelRatio: +R.renderer.getPixelRatio().toFixed(3),
        fog: { hex: '#' + f.color.getHexString(), density: +f.density.toFixed(5) },
        exposure: +R.renderer.toneMappingExposure.toFixed(4),
        bloom: { strength: +R.bloomPass.strength.toFixed(3), radius: +R.bloomPass.radius.toFixed(3), threshold: +R.bloomPass.threshold.toFixed(3) },
        grade: u, tint: gp ? '#' + gp.uniforms.uTint.value.getHexString() : null,
        calls: R.renderer.info.render.calls, triangles: R.renderer.info.render.triangles, points: R.renderer.info.render.points,
        programs: R.renderer.info.programs?.length ?? null, fishing: c.fishing?.state, enemies: c.combat?.enemies?.length ?? 0,
      };
    };
    // ---- the audit's knobs: returns an undo closure
    const TONE = { none: 0, linear: 1, reinhard: 2, cineon: 3, aces: 4, agx: 6, neutral: 7 };
    C.knobs = (K) => {
      const undo = [];
      const set = (o, key, v) => { const old = o[key]; o[key] = v; undo.push(() => { o[key] = old; }); };
      const R = c.render, scene = R.scene, bp = R.bloomPass;
      const gp = R.composer.passes.find((p) => p.uniforms && p.uniforms.uLift);
      const each = (fn) => scene.traverse((o) => { try { fn(o); } catch { /* skip */ } });
      const isMat = (o, test) => { const m = o.material; return !!m && test(m); };
      if (K.tier) { const prev = R.quality; R.setQuality(K.tier); undo.push(() => R.setQuality(prev)); }
      if (K.scale) { c.debug.renderScale(K.scale); undo.push(() => c.debug.renderScale(1)); }
      if (K.fog !== undefined) {
        set(scene.fog, 'density', scene.fog.density * K.fog);
        each((o) => { const u = o.material?.uniforms?.uFogD; if (u) set(u, 'value', u.value * K.fog); });
      }
      if (K.waterFog === 0) each((o) => { if (isMat(o, (m) => m.uniforms?.uWaveA && m.fog)) { o.material.fog = false; o.material.needsUpdate = true; undo.push(() => { o.material.fog = true; o.material.needsUpdate = true; }); } });
      if (K.waterSky !== undefined) each((o) => { const u = o.material?.uniforms; if (u?.uWaveA && u.uSky) { const old = u.uSky.value.clone(); u.uSky.value.multiplyScalar(K.waterSky); undo.push(() => u.uSky.value.copy(old)); } });
      if (K.waterStars !== undefined) each((o) => { const u = o.material?.uniforms; if (u?.uWaveA && u.uStars) set(u.uStars, 'value', u.uStars.value * K.waterStars); });
      if (K.domeStars !== undefined) each((o) => { const u = o.material?.uniforms; if (u?.uZenith && u.uStars) set(u.uStars, 'value', u.uStars.value * K.domeStars); });
      if (K.waterDeep !== undefined) each((o) => { const u = o.material?.uniforms; if (u?.uWaveA && u.uShallow) { const old = u.uShallow.value.clone(); u.uShallow.value.lerp(u.uDeep.value, K.waterDeep); undo.push(() => u.uShallow.value.copy(old)); } });
      // world stone / wood / props (the vertex-coloured ink-toon kit): × their reflectance, hue kept
      if (K.albedo !== undefined) each((o) => { const m = o.material; if (o.isMesh && m?.isMeshToonMaterial && m.vertexColors && m.userData?.fog && !m.userData.__alb) { m.userData.__alb = 1; const old = m.color.clone(); m.color.multiplyScalar(K.albedo); undo.push(() => { m.color.copy(old); delete m.userData.__alb; }); } });
      if (K.hemi !== undefined) each((o) => { if (o.isHemisphereLight) set(o, 'intensity', o.intensity * K.hemi); });
      if (K.key !== undefined) each((o) => { if (o.isDirectionalLight) set(o, 'intensity', o.intensity * K.key); });
      if (K.mist !== undefined) each((o) => { if (o.name === 'shoreMist' || isMat(o, (m) => m.uniforms?.uAmt && o.geometry?.attributes?.aP)) set(o, 'visible', K.mist > 0); });
      if (K.motes !== undefined) each((o) => { const u = o.material?.uniforms; if (o.isPoints && u?.uBox) { if (K.motes <= 0) set(o, 'visible', false); else set(u.uOpacity, 'value', u.uOpacity.value * K.motes); } });
      if (K.shafts !== undefined) each((o) => { const u = o.material?.uniforms; if (u?.uIntensity && (o.geometry?.attributes?.aTop || o.geometry?.attributes?.aC)) set(o, 'visible', K.shafts > 0); });
      if (K.halos !== undefined) each((o) => { if (o.isPoints && o.geometry?.attributes?.aPhase && o.material?.uniforms?.uBright) set(o, 'visible', K.halos > 0); });
      if (K.ringMist !== undefined) each((o) => { const u = o.material?.uniforms; if (u?.uMistAmt && u?.uVaultAmt) { set(u.uMistAmt, 'value', u.uMistAmt.value * K.ringMist); set(u.uVaultAmt, 'value', u.uVaultAmt.value * K.ringMist); } });
      if (K.outline === 0) each((o) => { const key = o.material?.customProgramCacheKey?.(); if (o.userData?.isOutline || /^gw(World)?Outline/.test(key || '')) set(o, 'visible', false); });
      if (K.bloom !== undefined) { if (K.bloom <= 0) set(bp, 'enabled', false); else set(bp, 'strength', bp.strength * K.bloom); }
      if (K.bloomRadius !== undefined) set(bp, 'radius', K.bloomRadius);
      if (K.bloomThreshold !== undefined) set(bp, 'threshold', K.bloomThreshold);
      if (K.bloomKnee !== undefined) set(bp.highPassUniforms.smoothWidth, 'value', K.bloomKnee);
      if (gp) for (const [k, u] of [['lift', 'uLift'], ['saturation', 'uSaturation'], ['contrast', 'uContrast'], ['fringe', 'uFringe'], ['paper', 'uPaper'], ['grain', 'uGrain'], ['tintAmount', 'uTintAmount']]) if (K[k] !== undefined) set(gp.uniforms[u], 'value', K[k]);
      if (gp && K.vignette !== undefined) set(gp.uniforms.uVignette, 'value', K.vignetteMul ? gp.uniforms.uVignette.value * K.vignette : K.vignette);
      if (K.tone && TONE[K.tone] !== undefined) set(R.renderer, 'toneMapping', TONE[K.tone]);
      if (K.exposure !== undefined) set(R.renderer, 'toneMappingExposure', R.renderer.toneMappingExposure * K.exposure);
      return () => { for (let i = undo.length - 1; i >= 0; i--) { try { undo[i](); } catch { /* keep undoing */ } } };
    };
    C.render = () => { c.render.render(); return c.render.renderer.domElement.toDataURL('image/png'); };
  }, { quality });

  const hold = (on) => g((on) => window.__cl.hold(on), on);
  const frameNo = () => g(() => window.__gw.time.frame);
  const frames = async (n, timeoutS = 240) => { const f0 = await frameNo(), s = Date.now(); while (Date.now() - s < timeoutS * 1000) { if ((await frameNo()) >= f0 + n) return true; await wait(120); } return false; };
  const waitFor = async (fn, arg, timeoutS = 90, stepMs = 150) => { const s = Date.now(); while (Date.now() - s < timeoutS * 1000) { if (await g(fn, arg).catch(() => false)) return true; await wait(stepMs); } return false; };
  const savePng = (name, dataUrl, sub = '') => {
    const dir = sub ? resolve(shotsDir, sub) : shotsDir;
    mkdirSync(dir, { recursive: true });
    const p = resolve(dir, `${name}.png`);
    writeFileSync(p, Buffer.from(String(dataUrl).split(',')[1] || '', 'base64'));
    return p;
  };
  // frames.json: the engine state behind each frame (a subset run merges into the record that is already there)
  const recordPath = resolve(shotsDir, phone ? 'frames-phone.json' : 'frames.json');
  let recorded = {};
  try { if (existsSync(recordPath)) recorded = JSON.parse(readFileSync(recordPath, 'utf8')).frames || {}; } catch { recorded = {}; }
  const writeRecord = () => writeFileSync(recordPath, JSON.stringify({ build, quality, width, height, settle: SETTLE, knobs: runKnobs, frames: { ...recorded, ...record } }, null, 1));

  /** Freeze the page, settle the look at the frame's own clock and seed, leave the page frozen. */
  async function freeze(name, { pin = true, settle = SETTLE } = {}) {
    await hold(true);
    await wait(60);
    await g(({ slot, pin, settle }) => {
      const C = window.__cl, c = window.__gw;
      C.clearUi();
      if (pin) {
        C.seed(0x9e3779b1 ^ (slot * 7919 + 17));
        const t = C.pump(settle, 2000 + slot * 100);
        c.render.snapCamera?.(); C.applyCam();
        C.pump(0.5, t);
        c.render.snapCamera?.(); C.applyCam(); C.rigCam();
      }
    }, { slot: SLOT[name] ?? 0, pin, settle });
  }
  async function thaw() { await g(() => { window.__cl.unseed(); window.__cl.hold(false); }); }

  /** One frame of the set: freeze, (the run's what-if knobs), render + read the canvas (or a page screenshot with the DOM). */
  async function shoot(name, { pin = true, dom = false, night = false } = {}) {
    await freeze(name, { pin });
    try {
      await g(() => window.__gw.debug.renderScale?.(1));   // (a live frame's lead-up runs at a reduced scale)
      if (runKnobs) await g((K) => { window.__cl.knobUndo = window.__cl.knobs(K); }, runKnobs);
      let p;
      if (dom) {
        await g(() => { window.__gw.render.render(); });
        await wait(250);
        p = resolve(shotsDir, `${name}.png`);
        await page.screenshot({ path: p, timeout: 240000 });
      } else p = savePng(name, await g(() => window.__cl.render()));
      record[name] = await g(() => window.__cl.info());
      if (runKnobs) await g(() => { window.__cl.knobUndo?.(); window.__cl.knobUndo = null; });
      log(`shot ${name} (+${el()} s) ${JSON.stringify(record[name])}`);
      writeRecord();
      if (isoFrames && isoFrames.some((f) => name.includes(f))) await isolate(name, night);
      return p;
    } catch (e) {
      failures.push(`${name}: ${e?.message || e}`);
      log(`FAIL ${name}: ${e?.stack || e}`);
      return null;
    } finally { await thaw(); }
  }

  /** The audit's sweep on the frozen frame: one PNG per knob set, nothing else changes between them. */
  async function isolate(name, night) {
    for (const [kn, K, o] of KNOB_SETS) {
      if (o?.night && !night) continue;
      if (knobFilter && !knobFilter.includes(kn)) continue;
      try {
        await g((K) => { window.__cl.knobUndo = window.__cl.knobs(K); }, K);
        if (K.scale) {   // the browser's upscale is part of this one: a page screenshot of the canvas
          await g(() => { window.__cl.hideUi(true); window.__gw.render.render(); });
          await wait(250);
          mkdirSync(resolve(shotsDir, 'iso'), { recursive: true });
          await page.screenshot({ path: resolve(shotsDir, 'iso', `${name}__${kn}.png`), timeout: 240000 });
        } else savePng(`${name}__${kn}`, await g(() => window.__cl.render()), 'iso');
        await g(() => { window.__cl.knobUndo?.(); window.__cl.knobUndo = null; });
        log(`  iso ${name}__${kn} (+${el()} s)`);
      } catch (e) { failures.push(`iso ${name}__${kn}: ${e?.message || e}`); await g(() => { try { window.__cl.knobUndo?.(); } catch { /* ignore */ } window.__cl.knobUndo = null; }).catch(() => {}); }
    }
  }

  // ------------------------------------------------------------------ the run
  await g(() => { window.__cl.hideUi(true); });
  await page.mouse.move(2, Math.round(height * 0.5));
  await g((flagOff) => { const c = window.__gw; window.__cl.clearUi(); c.game.startNewRun(flagOff ? {} : { character: 'wick', nightMode: 'still' }); }, flagOff);
  if (!(await waitFor(() => window.__gw.flow === 'playing', null, 180))) { failures.push('the run never started'); return { failures }; }
  await frames(4);
  await g((flagOff) => { const c = window.__gw, C = window.__cl; C.clearUi(); if (!flagOff) { try { c.debug.mode?.('still'); } catch { /* optional */ } } c.state.run.day = 2; C.pin(); c.debug.setPhase?.('calm'); try { c.render.setQuality?.(c.state.meta.settings.quality); } catch { /* optional */ } }, flagOff);
  await frames(3);

  const setCam = (cam) => g((cam) => { window.__cl.cam = cam; }, cam);
  // a live lead-up (signs, the cast, the play, the ceremony) runs at a reduced render scale so software GL keeps a usable frame
  // rate; shoot() restores full resolution inside its freeze, so the frame itself is rendered at full size
  const fast = (on) => g((on) => window.__gw.debug.renderScale?.(on ? 0.35 : 1), on).catch(() => {});
  /** A lake at a phase, the raft at the lake's spawn (or `at`), the plain rig or a camera override. */
  async function stage(zone, phase, { at = null, cam = null } = {}) {
    await g(({ zone, phase, k, at }) => {
      const C = window.__cl, c = window.__gw;
      C.clearUi(); C.goZone(zone);
      if (at) c.player.teleport?.({ x: at[0], y: 0, z: at[1] }, at[2] || 0);
      C.phase(phase, k);
    }, { zone, phase, k: PHASE_K[phase], at });
    await setCam(cam);
    await frames(3);   // the arena rebuild, shader compiles, the lantern and the Wick find their state
    await g(({ phase, k }) => { window.__cl.clearUi(); window.__cl.phase(phase, k); }, { phase, k: PHASE_K[phase] });
  }
  const sail = (name, zone, phase) => (want(name) ? stage(zone, phase).then(() => shoot(name, { night: phase === 'gloomtide' })) : null);
  // the close view: 5.7 m off the raft's bow quarter, a little above deck height, looking back at the Wick's face and lantern
  // (the near cliffs, Stair Isle and the south water behind it)
  const CLOSE = { rel: true, pos: [4.2, 1.9, -3.8], look: [0, 0.95, 0], fov: phone ? 54 : 36 };
  // the far view: low over the water south of the spawn, across ~60–100 m of lake to the Drowned Gatehouse and the far ruins
  const FAR = { rel: false, pos: [-7, 2.6, 57], look: [12, 6.5, -20], fov: 38 };

  if (!phone) {
    await sail('c01-mossmere-calm', 'mossmere', 'calm');
    await sail('c02-mossmere-dusk', 'mossmere', 'dusk');
    await sail('c03-mossmere-night', 'mossmere', 'gloomtide');
    await sail('c04-mossmere-dawn', 'mossmere', 'dawn');
    if (want('c05-raft-lantern')) { await stage('mossmere', 'gloomtide', { cam: CLOSE }); await shoot('c05-raft-lantern', { night: true }); }
    if (want('c06-far-ruins-calm')) { await stage('mossmere', 'calm', { cam: FAR }); await shoot('c06-far-ruins-calm'); }
    if (want('c07-far-ruins-night')) { await stage('mossmere', 'gloomtide', { cam: FAR }); await shoot('c07-far-ruins-night', { night: true }); }
    await setCam(null);
    await sail('c08-sporewood-calm', 'sporewood', 'calm');
    await sail('c09-sporewood-night', 'sporewood', 'gloomtide');
    await sail('c10-glasswater-calm', 'glasswater', 'calm');
    await sail('c11-glasswater-night', 'glasswater', 'gloomtide');
    await sail('c12-paleabyss-calm', 'paleabyss', 'calm');
    await sail('c13-paleabyss-night', 'paleabyss', 'gloomtide');

    // ---- fish signs on the water (v3): five signs laid out ahead of the raft at the sail framing, each shown once
    if (want('c14-signs')) {
      try {
        await stage('mossmere', 'calm');
        await freeze('c14-signs'); await thaw();   // the look settled at the frame's slot; the signs then run live from there
        await fast(true);
        await g(() => { const c = window.__gw; try { c.debug.fishSeed?.(20261113); } catch { /* optional */ } c.render.snapCamera?.(); });
        await frames(4);
        const n = await g(() => {
          const c = window.__gw, p = c.player.position, y = c.render.getYaw?.() ?? 0;
          const fx = -Math.sin(y), fz = -Math.cos(y);
          const at = (side, ahead) => ({ x: p.x + fx * ahead - fz * side, z: p.z + fz * ahead + fx * side });
          try { c.fishing.signs.length = 0; } catch { /* optional */ }
          const sigs = [
            { kind: 'rise', ...at(-5.5, 11), sp: 'candlefin_koi', size: 2.1 }, { kind: 'boil', ...at(5, 15), sp: 'weeping_carp', size: 2.2 },
            { kind: 'nervous', ...at(-2.5, 18) }, { kind: 'bubbles', ...at(2.5, 24), h: y + 1.2 }, { kind: 'rise', ...at(9, 7), sp: 'dusk_minnow', size: -0.6 },
          ];
          let ok = 0;
          for (const s of sigs) if (c.debug.sign?.(s.kind, { x: s.x, z: s.z, speciesId: s.sp, size: s.size, ttl: 120, heading: s.h })) ok++;
          return ok;
        });
        if (!n) throw new Error('debug.sign laid no sign (signs are a v3 feature)');
        await waitFor(() => { const st = window.__gw.debug.fishSigns?.() || []; return st.length > 0 && st.every((x) => x.shows >= 1) && st.filter((x) => x.kind === 'rise').every((x) => x.since > 0.5 && x.since < 1.6); }, null, 150, 100);
        await shoot('c14-signs', { pin: false });
        await fast(false);
        await g(() => { try { window.__gw.fishing.signs.length = 0; } catch { /* optional */ } });
      } catch (e) { failures.push(`c14-signs: ${e?.message || e}`); log(`FAIL c14-signs: ${e?.stack || e}`); await thaw().catch(() => {}); await fast(false); }
    }

    // ---- the catch close-up, the fish revealed (v3): a Prize pike landed, shot at the ceremony's climax (the trophy camera)
    if (want('c15-catch-reveal')) {
      try {
        await stage('mossmere', 'calm');
        await freeze('c15-catch-reveal'); await thaw();
        await fast(true);
        const lap = (m) => log(`  c15 ${m} (+${el()} s)`);
        await g(() => { const c = window.__gw; try { c.fishing.cancel?.('debug'); c.fishing.reset?.(); } catch { /* optional */ } c.debug.timeScale(1); c.render.snapCamera?.(); });
        await frames(3);
        await page.mouse.move(width / 2, height * 0.42);
        await page.mouse.down();
        await waitFor(() => window.__gw.fishing.state === 'charging', null, 30, 80);
        await frames(5);
        await page.mouse.up();
        await page.mouse.move(2, height * 0.5);
        if (!(await waitFor(() => window.__gw.fishing.state === 'waiting', null, 90))) throw new Error('the cast never settled');
        lap('cast');
        await frames(3);
        await g(() => { const c = window.__gw; c.debug.fishOutcome('land'); c.debug.forceBite({ speciesId: 'reedjaw_pike', z: 1.5, wait: 0.2 }); });
        if (!(await waitFor(() => window.__gw.fishing.state === 'bite', null, 90, 60))) throw new Error('no bite');
        lap('bite');
        await g(() => window.__gw.debug.fishStrike('clean'));
        await waitFor(() => window.__gw.fishing.state === 'reeling', null, 40);
        await g(() => window.__gw.debug.fishPlayTo(0.93));
        await waitFor(() => window.__gw.fishing.state === 'landing' || !!window.__gw.debug.fishReveal?.()?.dur, null, 120, 60);
        lap('landing');
        await waitFor(() => !!window.__gw.debug.ceremony?.()?.active, null, 90, 40);
        lap('ceremony');
        // the climax fires at the pose, once the trophy camera has framed the held fish; the frame is taken 0.35 s after it
        await waitFor(() => { const c = window.__gw.debug.ceremony?.(); return !c?.active || (!c.climaxPending && c.t >= (c.climaxAt ?? 0) + 0.35); }, null, 120, 40);
        lap('climax ' + JSON.stringify(await g(() => { const c = window.__gw.debug.ceremony?.(); return c ? { t: +(c.t ?? 0).toFixed(2), climaxAt: c.climaxAt, pending: c.climaxPending, active: c.active, pose: c.pose } : null; })));
        await shoot('c15-catch-reveal', { pin: false });
        await fast(true);
        await waitFor(() => window.__gw.debug.ui?.()?.openModal === 'catch', null, 90, 200);
        await g(() => { document.querySelector('#ui .gw-m-catch [data-action="release"]')?.click() || document.querySelector('#ui .gw-m-catch [data-action="keep"]')?.click(); window.__cl.clearUi(); window.__gw.debug.fishOutcome(null); });
        await wait(800);
        await g(() => window.__cl.clearUi());
        await fast(false);
      } catch (e) { failures.push(`c15-catch-reveal: ${e?.message || e}`); log(`FAIL c15-catch-reveal: ${e?.stack || e}`); await thaw().catch(() => {}); await fast(false); await g(() => { try { window.__gw.debug.fishOutcome?.(null); } catch { /* ignore */ } }).catch(() => {}); }
    }

    // ---- the HUD over the image: the Mossmere at calm, the DOM on (legibility over the sharper frame is judged here)
    if (want('c16-hud')) {
      await stage('mossmere', 'calm');
      await g(() => { window.__cl.hideUi(false); try { window.__gw.ui.update?.(0.25); } catch { /* optional */ } });
      await frames(3);
      await shoot('c16-hud', { dom: true });
      await g(() => window.__cl.hideUi(true));
    }

    // ---- a Lantern night with the swarm up (v3): the night overview, ink silhouettes on the water round the lantern's pool
    if (want('c17-swarm-overview')) {
      try {
        await stage('mossmere', 'gloomtide');
        const sw = await g((slot) => {
          const c = window.__gw, C = window.__cl;
          C.seed(0x51ed270b ^ (slot * 7919));
          try { c.debug.mode?.('lantern'); } catch { /* optional */ }
          C.pin();
          const win = c.debug.swarmNow?.();
          const kinds = ['gloomling', 'gloomling', 'inkmite', 'duskmantle', 'gloomling', 'creelsnatch'];
          const spawn = () => { let i = 0, guard = 0; while ((c.combat.enemies?.length || 0) < 24 && guard++ < 60) { try { c.debug.spawn?.(kinds[i++ % kinds.length], 1, 6 + (i % 4)); } catch { /* keep going */ } } };
          const pump = (sec) => { let t = c.time.t; for (let k = 0, n = Math.round(sec / 0.05); k < n; k++) { t += 0.05; try { c.combat.update(0.05, t); } catch { /* keep pumping */ } } };
          spawn(); pump(2); spawn(); pump(0.6);   // surfaced and closing on the light, on game time, whatever the frame rate
          C.unseed();
          return { enemies: c.combat.enemies?.length || 0, window: !!win, swarmActive: c.combat.swarmActive === true };
        }, SLOT['c17-swarm-overview']);
        log(`  c17 swarm ${JSON.stringify(sw)}`);
        await frames(3);
        await shoot('c17-swarm-overview', { night: true });
      } catch (e) { failures.push(`c17-swarm-overview: ${e?.message || e}`); log(`FAIL c17-swarm-overview: ${e?.stack || e}`); await thaw().catch(() => {}); }
      await g(() => { const c = window.__gw; try { c.combat.killAll?.('debug'); c.debug.mode?.('still'); } catch { /* optional */ } }).catch(() => {});
    }
  } else {
    await sail('m01-mossmere-calm', 'mossmere', 'calm');
    await sail('m02-mossmere-night', 'mossmere', 'gloomtide');
    if (want('m03-raft-lantern')) { await stage('mossmere', 'gloomtide', { cam: CLOSE }); await shoot('m03-raft-lantern', { night: true }); }
    await setCam(null);
  }

  // ------------------------------------------------------------------ --perf: what a frame costs on each tier
  if (args.perf) {
    const perf = {};
    for (const tier of ['low', 'medium', 'high']) {
      try {
        await g((tier) => { const c = window.__gw; c.state.meta.settings.quality = tier; c.render.setQuality(tier); window.__cl.goZone('sporewood'); }, tier);
        await frames(2);
        for (const phase of ['calm', 'gloomtide']) {
          await stage('mossmere', phase);
          await frames(2);
          await freeze(phone ? 'm01-mossmere-calm' : 'c01-mossmere-calm');
          perf[`${tier}-${phase}`] = await g(() => {
            const c = window.__gw, R = c.render, r = R.renderer;
            // (a 1-pixel read-back makes the GL thread finish the frame, so the time is the frame's and not the command queue's)
            const gl = r.getContext(), px1 = new Uint8Array(4);
            const t = []; for (let i = 0; i < 4; i++) { const a = performance.now(); R.render(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px1); t.push(performance.now() - a); }
            const i = r.info, passes = R.composer.passes.filter((p) => p.enabled !== false).map((p) => p.constructor.name);
            const rt = R.composer.renderTarget1;
            return { calls: i.render.calls, triangles: i.render.triangles, points: i.render.points, programs: i.programs?.length ?? null, geometries: i.memory.geometries, textures: i.memory.textures,
              passes, hdrTarget: [rt.width, rt.height, rt.samples], pixelRatio: +r.getPixelRatio().toFixed(3), shadowMaps: r.shadowMap.enabled ? 1 : 0, msSoftwareGL: Math.round(Math.min(...t)) };
          });
          await thaw();
          log(`perf ${tier}-${phase} ${JSON.stringify(perf[`${tier}-${phase}`])}`);
        }
      } catch (e) { failures.push(`perf ${tier}: ${e?.message || e}`); await thaw().catch(() => {}); }
    }
    writeFileSync(resolve(shotsDir, phone ? 'perf-phone.json' : 'perf.json'), JSON.stringify(perf, null, 1));
    await g((q) => { const c = window.__gw; c.state.meta.settings.quality = q; c.render.setQuality(q); }, quality);
  }

  await g(() => { try { window.__gw.debug.timeScale?.(1); } catch { /* ignore */ } }).catch(() => {});
  writeRecord();
  log(`clarity set: ${Object.keys(record).length} frames in ${el()} s, ${failures.length} failures`);
  for (const f of failures) log('  failed', f);
  return { failures };
}
