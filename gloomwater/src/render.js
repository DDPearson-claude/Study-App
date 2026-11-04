// render.js — GLOOMWATER renderer, camera rig and post-processing (render author).
// CONTRACT §7 render. Owns: WebGLRenderer, scene, camera, scene.fog (FogExp2) + clear
// colour, the post chain RenderPass → UnrealBloomPass → grade → OutputPass, the camera
// rig (title / sail / fish / reel / night / shop / death), screen shake, flashes and
// quality tiers.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { clamp, damp, lerp, smoothstep, easeInOutSine } from './core.js';
import { GradeShader } from './render-grade.js';

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
/** ACES darkens the toe; this keeps a zone's authored palette near its hex values at exposure 1. */
const BASE_EXPOSURE = 1.32;

// pr = max pixel ratio, samples = MSAA on the HDR target, bloomScale = bloom buffer scale,
// maxPx = cap on drawing-buffer pixels (keeps retina laptops sane).
const TIERS = {
  low:    { pr: 1.0, samples: 0, bloomScale: 0.5,  paper: 0, fringe: 0, maxPx: 1.0e6 },
  medium: { pr: 1.5, samples: 2, bloomScale: 0.75, paper: 1, fringe: 1, maxPx: 1.9e6 },
  high:   { pr: 2.0, samples: 4, bloomScale: 1.0,  paper: 1, fringe: 1, maxPx: 2.8e6 },
};
const TIER_ORDER = ['low', 'medium', 'high'];

// Camera presets. elev = camera elevation above the focus (deg), dist = focus→camera (m),
// aim = look-target lead along the view direction (m), aimY = look-target height (m),
// fov = vertical fov on landscape (deg), ahead = velocity look-ahead (s), stiff = focus spring ω.
const MODES = {
  title: { elev: 15, dist: 15.5, aim: 0, aimY: 2.9, fov: 42, ahead: 0, stiff: 2.2 },
  sail:  { elev: 32, dist: 16.5, aim: 6.5, aimY: 0.6, fov: 50, ahead: 0.55, stiff: 3.6 },
  fish:  { elev: 34, dist: 14.0, aim: 0.8, aimY: 0.4, fov: 48, ahead: 0.1, stiff: 3.0 },
  reel:  { elev: 25, dist: 10.0, aim: 0.4, aimY: 0.7, fov: 44, ahead: 0, stiff: 3.4 },
  night: { elev: 53, dist: 24.0, aim: 2.0, aimY: 0.0, fov: 52, ahead: 0.35, stiff: 4.2 },
  shop:  { elev: 18, dist: 10.0, aim: 0, aimY: 1.5, fov: 44, ahead: 0, stiff: 2.4 },
  death: { elev: 36, dist: 12.5, aim: 0, aimY: 0.6, fov: 46, ahead: 0, stiff: 1.4 },
};
const PARAM_KEYS = ['elev', 'dist', 'aim', 'aimY', 'fov', 'ahead', 'stiff'];

const GRADE_NUM = ['exposure', 'bloomStrength', 'bloomRadius', 'bloomThreshold', 'tintAmount', 'vignette',
  'saturation', 'grain', 'contrast', 'fringe', 'paper', 'warmAmount', 'lift'];
const GRADE_COL = ['tint', 'warm'];
const GRADE_DEFAULT = {
  exposure: 1.0, bloomStrength: 0.85, bloomRadius: 0.6, bloomThreshold: 0.72, tintAmount: 0.18,
  vignette: 0.38, saturation: 0.85, grain: 0.05, contrast: 1.04, fringe: 0.4, paper: 0.5, warmAmount: 0.14, lift: 0.6,
  tint: 0x48526e, warm: 0xffc58c,
};

const isReal = (m) => !!m && !m.isStub;
const wrapAngle = (a) => { a = (a + Math.PI) % TAU; if (a < 0) a += TAU; return a - Math.PI; };
/** Smooth 1-D noise in ~[-1, 1] from incommensurate sines (cheap, allocation-free). */
const snoise = (t, s) => (Math.sin(t * 1.0 + s) * 0.5 + Math.sin(t * 2.31 + s * 1.7) * 0.3 + Math.sin(t * 4.79 + s * 2.9) * 0.2);
/** Critically damped spring step (SmoothDamp). Returns new value; writes velocity into st.v. */
function springStep(st, target, omega, dt) {
  const x = omega * dt;
  const e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = st.x - target;
  const temp = (st.v + omega * change) * dt;
  st.v = (st.v - omega * temp) * e;
  st.x = target + (change + temp) * e;
  return st.x;
}

export function create(ctx) {
  // ---------------------------------------------------------------- renderer & scene
  const renderer = new THREE.WebGLRenderer({
    antialias: false, alpha: false, stencil: false, depth: true, powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = BASE_EXPOSURE;
  renderer.info.autoReset = false;       // count every pass of the frame (reset in render())
  const canvas = renderer.domElement;
  canvas.setAttribute('tabindex', '-1');

  const z0 = ctx.data?.ZONES?.[0]?.palette;
  const scene = new THREE.Scene();
  scene.name = 'gloomwater';
  scene.fog = new THREE.FogExp2(z0?.fog ?? 0x222a3a, z0?.fogDensity ?? 0.016);
  const bg = new THREE.Color().copy(scene.fog.color);
  scene.background = bg;

  const camera = new THREE.PerspectiveCamera(50, Math.max(1, innerWidth) / Math.max(1, innerHeight), 0.25, 900);
  camera.position.set(0, 9, 22);
  camera.lookAt(0, 0, 0);
  scene.add(camera);   // lets others parent camera-relative effects

  // ---------------------------------------------------------------- post chain
  const renderPass = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(256, 256), GRADE_DEFAULT.bloomStrength, GRADE_DEFAULT.bloomRadius, GRADE_DEFAULT.bloomThreshold);
  bloomPass.highPassUniforms.smoothWidth.value = 0.22;   // soft knee: no popping glows
  const gradePass = new ShaderPass(GradeShader);
  const gu = gradePass.uniforms;
  const outputPass = new OutputPass();
  let composer = null;
  let composerSamples = -1;

  function buildComposer(samples) {
    samples = Math.max(0, Math.min(samples, renderer.capabilities.maxSamples || 0));
    if (composer && samples === composerSamples) return;
    if (composer) {
      composer.renderTarget1.dispose();
      composer.renderTarget2.dispose();
      composer.copyPass?.material?.dispose?.();
      composer.copyPass?.fsQuad?.dispose?.();
    }
    const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples });
    rt.texture.name = 'gw.hdr';
    composer = new EffectComposer(renderer, rt);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
    composer.addPass(gradePass);
    composer.addPass(outputPass);
    composerSamples = samples;
  }

  // ---------------------------------------------------------------- sizing & quality
  let W = Math.max(1, innerWidth), H = Math.max(1, innerHeight);
  let tierName = 'high';
  let qualitySetting = 'auto';
  let lastMetaQuality;   // meta.settings.quality seen at the last setQuality (detects settings edits)
  let bloomScale = 1;
  const auto = { active: false, frames: 0, time: 0, warm: 1.5, last: 0, drops: 0, checks: 0, bad: 0 };

  function effectivePixelRatio() {
    const t = TIERS[tierName];
    let pr = Math.min(window.devicePixelRatio || 1, t.pr);
    const px = W * H * pr * pr;
    if (px > t.maxPx) pr = Math.sqrt(t.maxPx / (W * H));
    return Math.max(0.5, pr);
  }

  function resize(w = innerWidth, h = innerHeight) {
    W = Math.max(1, Math.floor(w)); H = Math.max(1, Math.floor(h));
    const pr = effectivePixelRatio();
    renderer.setPixelRatio(pr);
    renderer.setSize(W, H, false);
    composer.setPixelRatio(pr);
    composer.setSize(W, H);
    bloomPass.setSize(Math.max(8, Math.round(W * pr * bloomScale)), Math.max(8, Math.round(H * pr * bloomScale)));
    gu.uRes.value.set(W * pr, H * pr);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }

  function applyTier(name) {
    if (!TIERS[name]) name = 'medium';
    tierName = name;
    const t = TIERS[name];
    bloomScale = t.bloomScale;
    buildComposer(ctx.isMobile ? 0 : t.samples);
    const m = gradePass.material;
    if (m.defines.GW_PAPER !== t.paper || m.defines.GW_FRINGE !== t.fringe) {
      m.defines.GW_PAPER = t.paper;
      m.defines.GW_FRINGE = t.fringe;
      m.needsUpdate = true;
    }
    resize(W, H);
    auto.frames = 0; auto.time = 0; auto.warm = 1.5;
  }

  function autoTier() {
    if (!ctx.isMobile) return 'high';
    const cores = navigator.hardwareConcurrency || 4;
    const mem = navigator.deviceMemory || 4;
    return cores <= 2 || mem <= 2 ? 'low' : 'medium';
  }

  function setQuality(q = 'auto') {
    if (q !== 'auto' && !TIERS[q]) q = 'auto';
    qualitySetting = q;
    lastMetaQuality = ctx.state?.meta?.settings?.quality;
    auto.active = q === 'auto';
    auto.drops = 0; auto.checks = 0; auto.bad = 0;
    applyTier(q === 'auto' ? autoTier() : q);
  }

  function sampleFps(now) {
    if (!auto.active) return;
    const gap = auto.last ? (now - auto.last) / 1000 : 0;
    auto.last = now;
    if (!gap || gap > 0.25 || document.hidden) return;   // stalls, tab switches
    if (auto.warm > 0) { auto.warm -= gap; return; }     // shader compiles, first frames
    auto.frames++;
    auto.time += gap;
    if (auto.time >= 4) {
      const fps = auto.frames / auto.time;
      auto.frames = 0; auto.time = 0;
      auto.checks++;
      const i = TIER_ORDER.indexOf(tierName);
      // the first window after start decides at once; later dips must persist for 2 windows
      auto.bad = fps < 40 ? auto.bad + 1 : 0;
      if (i > 0 && (auto.bad >= 2 || (auto.bad === 1 && auto.checks === 1))) {
        auto.drops++;
        auto.bad = 0;
        auto.checks = 0;   // the window right after a drop decides at once again
        applyTier(TIER_ORDER[i - 1]);
        if (TIER_ORDER[i - 1] === 'low') auto.active = false;   // nothing lower to go
      }
    }
  }

  // ---------------------------------------------------------------- grade state
  const gTgt = {}, gCur = {};
  const cTgt = { tint: new THREE.Color(), warm: new THREE.Color() };
  const cCur = { tint: new THREE.Color(), warm: new THREE.Color() };
  for (const k of GRADE_NUM) gTgt[k] = gCur[k] = GRADE_DEFAULT[k];
  for (const k of GRADE_COL) { cTgt[k].setHex(GRADE_DEFAULT[k]); cCur[k].copy(cTgt[k]); }

  function setGrade(g = {}, opts = {}) {
    if (!g || typeof g !== 'object') return;
    for (const k of GRADE_NUM) {
      const v = g[k];
      if (typeof v === 'number' && isFinite(v)) { gTgt[k] = v; if (opts.instant) gCur[k] = v; }
    }
    for (const k of GRADE_COL) {
      const v = g[k];
      if (v === undefined || v === null) continue;
      try { v.isColor ? cTgt[k].copy(v) : cTgt[k].set(v); } catch { continue; }
      if (opts.instant) cCur[k].copy(cTgt[k]);
    }
  }

  // transient effects
  const fx = {
    trauma: 0, traumaDecay: 1, shakeT: 0,
    flash: 0, flashPeak: 0, flashDur: 0.25, flashT: 1, flashColor: new THREE.Color(1, 1, 1),
    bloomPulse: 0, fringePulse: 0, vigPulse: 0, fovKick: 0,
    death: 0, danger: 0, dark: 0,
    attention: null, attentionT: 0, attentionDur: 0, attentionW: 0,
  };
  const flashTmp = new THREE.Color();

  let reducedMotion = false;
  try {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = mq.matches;
    mq.addEventListener?.('change', (e) => { reducedMotion = e.matches; });
  } catch { /* old browsers */ }
  function shakeScale() {
    const s = ctx.state?.meta?.settings?.screenShake;
    if (s === false || s === 0) return 0;
    const k = reducedMotion ? 0.35 : 1;
    if (typeof s === 'number') return clamp(s, 0, 1.5) * k;
    return k;
  }
  function shake(intensity = 0.3, duration = 0.35) {
    const i = clamp(Number(intensity) || 0, 0, 1);
    if (i <= 0) return;
    // max-combine with a little stacking: duplicate calls for one event don't explode
    fx.trauma = clamp(Math.max(fx.trauma, i) + i * 0.2, 0, 1);
    fx.traumaDecay = Math.max(0.6, fx.trauma / Math.max(0.08, Number(duration) || 0.35));
  }
  const reducedFlashing = () => ctx.state?.meta?.settings?.reducedFlashing === true;
  function flash(hex = 0xffffff, strength = 0.5, duration = 0.25) {
    let s = clamp(Number(strength) || 0, 0, 1);
    const remaining = fx.flashT < 1 ? fx.flashPeak * Math.pow(1 - fx.flashT, 2) : 0;
    if (s < remaining * 0.8) return;
    try { flashTmp.set(hex); } catch { flashTmp.setRGB(1, 1, 1); }
    // non-black flashes are pushed a little into HDR so they bloom
    const lum = flashTmp.r * 0.2126 + flashTmp.g * 0.7152 + flashTmp.b * 0.0722;
    if (lum > 0.02 && reducedFlashing()) s *= 0.25;   // accessibility: bright flashes become glows
    fx.flashColor.copy(flashTmp).multiplyScalar(lum > 0.02 ? 1.6 : 1);
    fx.flashPeak = s;
    fx.flashDur = Math.max(0.05, Number(duration) || 0.25);
    fx.flashT = 0;
  }
  function pulse({ bloom = 0, fringe = 0, vignette = 0 } = {}) {
    if (reducedFlashing()) bloom *= 0.35;
    fx.bloomPulse = Math.min(1.5, fx.bloomPulse + bloom);
    fx.fringePulse = Math.min(3, fx.fringePulse + fringe);
    fx.vigPulse = Math.min(0.6, fx.vigPulse + vignette);
  }
  function kick(fovDelta = -3) { fx.fovKick = clamp(fx.fovKick + fovDelta, -12, 12); }
  /** Bias the camera focus toward a world point for a while (boss entrances, gates…). */
  function attention(position, duration = 2, weight = 0.4) {
    if (!position) { fx.attention = null; return; }
    fx.attention = fx.attention || new THREE.Vector3();
    fx.attention.set(position.x || 0, 0, position.z || 0);
    fx.attentionT = 0; fx.attentionDur = Math.max(0.2, duration); fx.attentionW = clamp(weight, 0, 0.8);
  }

  // ---------------------------------------------------------------- camera rig state
  const cur = {}, tgt = {};
  for (const k of PARAM_KEYS) cur[k] = tgt[k] = MODES.title[k];
  let yaw = 0.55, titleYaw = 0.55, deathYaw = 0, deathT0 = 0;
  let mode = 'title', prevMode = 'title';
  let time = 0, modeT = 0;
  const fX = { x: 0, v: 0 }, fY = { x: 0, v: 0 }, fZ = { x: 8, v: 0 };
  let focusInit = false;
  const focusTarget = new THREE.Vector3();
  const lookTarget = new THREE.Vector3();
  const camPos = new THREE.Vector3();
  const fwd = new THREE.Vector3();
  const tmpV = new THREE.Vector3();
  const tmpV2 = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const projV = new THREE.Vector3();
  let nightK = 0;
  let lastStatsAt = -10, maxHp = 5;
  let qualityCheckAt = 0;

  function playerPos() {
    const p = isReal(ctx.player) ? ctx.player.position : null;
    return p && typeof p.x === 'number' ? p : null;
  }
  function phaseInfo() {
    if (!isReal(ctx.survival) || !ctx.state?.run) return null;
    try { const i = ctx.survival.getPhaseInfo?.(); return i && !i.isStub ? i : null; } catch { return null; }
  }
  function fishingState() {
    if (!isReal(ctx.fishing)) return 'idle';
    const s = ctx.fishing.state;
    return typeof s === 'string' ? s : 'idle';
  }
  function bobber() {
    if (!isReal(ctx.fishing)) return null;
    const b = ctx.fishing.bobberPos;
    return b && typeof b.x === 'number' && isFinite(b.x) ? b : null;
  }
  function merchantPos() {
    const m = isReal(ctx.actors) ? ctx.actors.merchant : null;
    if (!m || m.isStub || m.present !== true) return null;
    const p = m.position || m.object3d?.position;
    return p && typeof p.x === 'number' ? p : null;
  }
  function shopOpen() {
    if (!isReal(ctx.ui)) return false;
    try { return ctx.ui.isShopOpen?.() === true; } catch { return false; }
  }

  function pickMode() {
    const flow = ctx.flow;
    if (flow === 'title' || flow === 'boot') return 'title';
    if (flow === 'dead') return 'death';
    if (!ctx.state?.run) return 'title';
    if (shopOpen() && merchantPos()) return 'shop';
    const fs = fishingState();
    if (fs === 'reeling' || fs === 'landing') return 'reel';
    // 'charging' keeps the sail framing: moving the camera under a held pointer would drag the aim
    if (fs === 'casting' || fs === 'waiting' || fs === 'bite' || fs === 'lost') return 'fish';
    return nightK > 0.5 ? 'night' : 'sail';
  }

  function computeNightK(dt) {
    const info = phaseInfo();
    let k = 0;
    if (info) {
      const pk = typeof info.k === 'number' ? info.k : 0;
      if (info.isNight === true || info.phase === 'gloomtide') k = 1;
      else if (info.phase === 'dusk') k = smoothstep(0.35, 1, pk);
      else if (info.phase === 'dawn') k = 1 - smoothstep(0.0, 0.7, pk);
    }
    if (ctx.flow !== 'playing') k = 0;
    nightK = damp(nightK, k, 1.6, dt);
  }

  function fillTargets(p) {
    const base = MODES[mode];
    for (const k of PARAM_KEYS) tgt[k] = base[k];
    const nk = nightK;
    if (mode === 'sail' || mode === 'night') {
      const s = MODES.sail, n = MODES.night;
      for (const k of PARAM_KEYS) tgt[k] = lerp(s[k], n[k], nk);
    } else if (mode === 'fish' || mode === 'reel') {
      const b = bobber();
      let sep = 6;
      if (b && p) sep = Math.hypot(b.x - p.x, b.z - p.z);
      else if (mode === 'fish') sep = (Number(ctx.fishing?.view?.castDist) || 8) * 0.6;
      sep = clamp(sep, 0, 40);
      if (mode === 'fish') {
        tgt.dist = Math.max(base.dist, 8.5 + sep * 0.78);
        tgt.elev = base.elev + clamp(sep - 12, 0, 20) * 0.4;
      } else {
        tgt.dist = Math.max(base.dist, 7.5 + sep * 0.6);
        const tension = Number(ctx.fishing?.view?.tension) || 0;
        tgt.dist -= clamp(tension, 0, 1) * 0.9;
        tgt.fov -= clamp(tension - 0.6, 0, 0.4) * 6;
      }
      // night fishing keeps a little of the swarm overview
      const nn = nk * 0.45;
      tgt.elev = lerp(tgt.elev, MODES.night.elev, nn);
      tgt.dist = lerp(tgt.dist, Math.max(tgt.dist, MODES.night.dist * 0.85), nn);
    } else if (mode === 'shop') {
      const m = merchantPos();
      if (m && p) tgt.dist = clamp(Math.hypot(m.x - p.x, m.z - p.z) * 0.9 + 5.5, 8, 17);
    } else if (mode === 'death') {
      const s = easeInOutSine(clamp((time - deathT0) / 9, 0, 1));
      tgt.elev = lerp(36, 68, s);
      tgt.dist = lerp(11, 25, s);
      tgt.aimY = lerp(0.8, 0, s);
    }
    // portrait screens: widen, pull back and tilt down so the raft and its pool fit
    const a = W / H;
    if (a < 1.25) {
      const pf = smoothstep(1.25, 0.5, a);
      tgt.fov = Math.min(78, tgt.fov + pf * 22);
      tgt.dist *= 1 + pf * 0.38;
      tgt.elev = Math.min(80, tgt.elev + pf * 7);
    }
  }

  function focusFor(p, out) {
    if (!p) return out.set(0, 0, 8);
    out.set(p.x, 0, p.z);
    if (mode === 'fish' || mode === 'reel') {
      const b = bobber();
      if (b) {
        const w = mode === 'reel' ? 0.4 : 0.44;
        out.x = lerp(p.x, b.x, w); out.z = lerp(p.z, b.z, w);
      } else if (mode === 'fish') {
        const aim = Number(ctx.fishing?.view?.aim);
        if (isFinite(aim)) {
          const d = (Number(ctx.fishing?.view?.castDist) || 8) * 0.3;
          out.x += -Math.sin(aim) * d; out.z += -Math.cos(aim) * d;
        }
      }
    } else if (mode === 'shop') {
      const m = merchantPos();
      if (m) { out.x = lerp(p.x, m.x, 0.45); out.z = lerp(p.z, m.z, 0.45); }
    }
    // velocity look-ahead
    const v = isReal(ctx.player) ? ctx.player.velocity : null;
    if (v && typeof v.x === 'number' && cur.ahead > 0.01) {
      let ax = v.x * cur.ahead, az = v.z * cur.ahead;
      const l = Math.hypot(ax, az);
      if (l > 3.5) { ax *= 3.5 / l; az *= 3.5 / l; }
      out.x += ax; out.z += az;
    }
    // attention bias
    if (fx.attention && fx.attentionT < fx.attentionDur) {
      const k = Math.sin(Math.PI * clamp(fx.attentionT / fx.attentionDur, 0, 1));
      const w = fx.attentionW * Math.min(1, k * 1.6);
      out.x = lerp(out.x, fx.attention.x, w); out.z = lerp(out.z, fx.attention.z, w);
    }
    return out;
  }

  function targetYaw(p) {
    if (mode === 'title') return titleYaw;
    if (mode === 'death') return deathYaw + (time - deathT0) * 0.045;
    if (mode === 'shop') {
      const m = merchantPos();
      if (m && p) {
        const dx = m.x - p.x, dz = m.z - p.z;
        if (dx * dx + dz * dz > 0.25) return Math.atan2(-dx, -dz) + 0.42;
      }
      return yaw;
    }
    return 0;   // fixed world yaw: screen-up ≈ world −Z
  }

  function updateCamera(dt) {
    computeNightK(dt);
    const next = pickMode();
    if (next !== mode) {
      prevMode = mode; mode = next; modeT = 0;
      if (mode === 'death') { deathT0 = time; deathYaw = yaw; }
      if (prevMode === 'title') titleYaw = yaw;
    }
    modeT += dt;
    if (mode === 'title') titleYaw += dt * 0.065;

    const p = playerPos();
    fillTargets(p);
    const lam = prevMode === 'title' && modeT < 3 ? 1.5 : mode === 'death' ? 1.2 : 2.6;
    for (const k of PARAM_KEYS) cur[k] = damp(cur[k], tgt[k], lam, dt);

    focusFor(p, focusTarget);
    const jump = Math.hypot(focusTarget.x - fX.x, focusTarget.z - fZ.x);
    if (!focusInit || jump > 30) {   // first frame / teleports (zone change, continue)
      fX.x = focusTarget.x; fY.x = focusTarget.y; fZ.x = focusTarget.z;
      fX.v = fY.v = fZ.v = 0;
      focusInit = true;
    } else {
      const om = cur.stiff;
      springStep(fX, focusTarget.x, om, dt);
      springStep(fY, focusTarget.y, om, dt);
      springStep(fZ, focusTarget.z, om, dt);
    }

    const ty = targetYaw(p);
    yaw += wrapAngle(ty - yaw) * (1 - Math.exp(-(mode === 'title' ? 3 : lam) * dt));
    yaw = wrapAngle(yaw);

    // spherical placement around the focus
    const elev = clamp(cur.elev, 3, 85) * DEG;
    const sy = Math.sin(yaw), cy = Math.cos(yaw);
    const ce = Math.cos(elev), se = Math.sin(elev);
    fwd.set(-sy, 0, -cy);
    camPos.set(fX.x + sy * ce * cur.dist, fY.x + se * cur.dist, fZ.x + cy * ce * cur.dist);
    lookTarget.set(fX.x + fwd.x * cur.aim, fY.x + cur.aimY, fZ.x + fwd.z * cur.aim);

    // subtle hand-held sway + a hint of the swell
    const swayAmt = (mode === 'title' ? 0.22 : mode === 'night' ? 0.08 : 0.12) * (reducedMotion ? 0.2 : 1);
    camPos.x += Math.sin(time * 0.37) * swayAmt;
    camPos.y += Math.sin(time * 0.53 + 1.3) * swayAmt * 0.8;
    const wh = isReal(ctx.water) && ctx.water.getHeight ? Number(ctx.water.getHeight(fX.x, fZ.x)) || 0 : 0;
    camPos.y += wh * 0.25; lookTarget.y += wh * 0.4;
    if (camPos.y < 1.2) camPos.y = 1.2;

    camera.position.copy(camPos);
    camera.up.set(0, 1, 0);
    camera.lookAt(lookTarget);
    camera.rotateZ(Math.sin(time * 0.29 + 0.7) * 0.004 * (mode === 'title' ? 2 : 1));

    // trauma shake (smooth noise, squared falloff)
    fx.trauma = Math.max(0, fx.trauma - fx.traumaDecay * dt);
    const ss = shakeScale();
    if (fx.trauma > 0 && ss > 0) {
      const tr = fx.trauma * fx.trauma * ss;
      fx.shakeT += dt * (14 + 10 * fx.trauma);
      const s = fx.shakeT;
      camera.rotateY(snoise(s, 1.1) * 0.035 * tr);
      camera.rotateX(snoise(s, 7.3) * 0.03 * tr);
      camera.rotateZ(snoise(s, 3.7) * 0.045 * tr);
      tmpV.set(snoise(s, 11.3), snoise(s, 5.9) * 0.6, 0).multiplyScalar(0.28 * tr).applyQuaternion(camera.quaternion);
      camera.position.add(tmpV);
    }

    // fov with kick + slight breathing
    fx.fovKick = damp(fx.fovKick, 0, 5, dt);
    const fov = clamp(cur.fov + fx.fovKick, 20, 95);
    if (Math.abs(camera.fov - fov) > 1e-3 || camera.aspect !== W / H) {
      camera.fov = fov;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    }
    camera.updateMatrixWorld();
    if (fx.attention) { fx.attentionT += dt; if (fx.attentionT > fx.attentionDur) fx.attention = null; }
  }

  // ---------------------------------------------------------------- grade update
  const vit = { hp: Infinity, hpK: 1, dark: 0 };
  function refreshVitals() {
    const run = ctx.state?.run;
    vit.hp = Infinity; vit.hpK = 1; vit.dark = 0;
    if (!run || ctx.flow !== 'playing') return vit;
    if (time - lastStatsAt > 0.5) {
      lastStatsAt = time;
      try { const s = ctx.progression?.getStats?.(); if (s && !s.isStub && s.maxHp > 0) maxHp = s.maxHp; } catch { /* optional */ }
    }
    const hp = Number(run.hp);
    if (isFinite(hp)) { vit.hp = hp; vit.hpK = hp / Math.max(1, maxHp); }
    const oil = Number(run.oil);
    vit.dark = isFinite(oil) && oil <= 0.01 ? 1 : 0;
    return vit;
  }

  function updateGrade(dt) {
    const lam = 2.2;
    for (const k of GRADE_NUM) gCur[k] = damp(gCur[k], gTgt[k], lam, dt);
    const a = 1 - Math.exp(-lam * dt);
    for (const k of GRADE_COL) cCur[k].lerp(cTgt[k], a);

    refreshVitals();
    const danger = ctx.flow === 'playing' && ((vit.hp <= 1 && vit.hp > 0) || (vit.hpK > 0 && vit.hpK <= 0.25)) ? 1 : 0;
    fx.danger = damp(fx.danger, danger, 2, dt);
    fx.dark = damp(fx.dark, vit.dark, 1.5, dt);
    fx.death = damp(fx.death, ctx.flow === 'dead' ? 1 : 0, ctx.flow === 'dead' ? 0.8 : 3, dt);
    fx.bloomPulse = damp(fx.bloomPulse, 0, 3.2, dt);
    fx.fringePulse = damp(fx.fringePulse, 0, 4, dt);
    fx.vigPulse = damp(fx.vigPulse, 0, 2.2, dt);
    if (fx.flashT < 1) fx.flashT = Math.min(1, fx.flashT + dt / fx.flashDur);
    const fk = fx.flashT < 1 ? fx.flashPeak * Math.pow(1 - fx.flashT, 2) : 0;

    const reel = mode === 'reel' ? 1 : 0;
    const heart = reducedFlashing() ? 0.6 : 0.5 + 0.5 * Math.sin(time * TAU * 1.1) * Math.sin(time * TAU * 1.1);
    renderer.toneMappingExposure = BASE_EXPOSURE * Math.max(0.05, gCur.exposure) * (1 - fx.death * 0.18) * (1 - fx.dark * 0.12);
    bloomPass.strength = Math.max(0, gCur.bloomStrength * (1 + fx.bloomPulse));
    bloomPass.radius = clamp(gCur.bloomRadius, 0, 1.5);
    bloomPass.threshold = Math.max(0, gCur.bloomThreshold);

    gu.uTime.value = time % 1000;
    gu.uSaturation.value = Math.max(0, gCur.saturation * (1 - fx.death * 0.55));
    gu.uContrast.value = clamp(gCur.contrast + reel * 0.04 + fx.death * 0.05, 0.6, 1.6);
    gu.uTint.value.copy(cCur.tint);
    gu.uTintAmount.value = clamp(gCur.tintAmount, 0, 1);
    gu.uWarm.value.copy(cCur.warm);
    gu.uWarmAmount.value = clamp(gCur.warmAmount, 0, 1);
    gu.uLift.value = Math.max(0, gCur.lift);
    gu.uVignette.value = clamp(gCur.vignette + reel * 0.08 + fx.vigPulse + fx.death * 0.25 + fx.dark * 0.22 + fx.danger * 0.06 * heart, 0, 1);
    gu.uFringe.value = Math.max(0, gCur.fringe * (1 + fx.fringePulse) + fx.danger * 0.3);
    gu.uPaper.value = Math.max(0, gCur.paper);
    gu.uGrain.value = Math.max(0, gCur.grain * (1 + fx.death * 0.6 + fx.dark * 0.5));
    gu.uFlash.value = fk;
    gu.uFlashColor.value.copy(fx.flashColor);
    gu.uDanger.value = fx.danger * (0.55 + 0.45 * heart);
  }

  // ---------------------------------------------------------------- zone defaults
  function applyZoneDefaults(zoneId, instant) {
    const z = (ctx.data?.ZONES || []).find((x) => x.id === zoneId);
    if (!z) return;
    if (z.palette) {
      if (z.palette.fog !== undefined) scene.fog.color.setHex(z.palette.fog);
      if (z.palette.fogDensity) scene.fog.density = z.palette.fogDensity;
    }
    if (z.grade) setGrade(z.grade, { instant });
  }

  // ---------------------------------------------------------------- init / build
  applyTier('high');

  const api = {
    renderer, scene, camera, canvas,
    get quality() { return tierName; },
    getQuality() { return tierName; },
    getQualitySetting() { return qualitySetting; },

    init() {
      const q = ctx.state?.meta?.settings?.quality;
      setQuality(typeof q === 'string' ? q : 'auto');
      const bus = ctx.bus;
      if (!bus) return;
      const on = (evt, fn) => bus.on(evt, (p) => { try { fn(p || {}); } catch (e) { console.error('[render]', evt, e); } });
      on('zone:change', ({ zone, prev }) => {
        applyZoneDefaults(zone, !prev);
        flash(0x000000, prev ? 1 : 0.9, prev ? 1.4 : 0.9);
      });
      on('run:start', () => { fx.death = 0; fx.danger = 0; });
      on('player:damage', ({ amount }) => {
        const a = clamp(Number(amount) || 1, 0.5, 3);
        shake(0.28 + 0.1 * a, 0.4);
        pulse({ fringe: 1.6, vignette: 0.12 });
      });
      on('player:died', () => { shake(0.55, 0.9); pulse({ fringe: 2, vignette: 0.2 }); });
      on('fishing:hook', ({ perfect }) => { kick(perfect ? -4 : -2.5); shake(0.14, 0.25); if (perfect) pulse({ bloom: 0.35 }); });
      on('fishing:surge', ({ strength }) => { shake(clamp(0.06 + 0.08 * (Number(strength) || 1), 0, 0.3), 0.3); });
      on('fishing:caught', () => { kick(-2); pulse({ bloom: 0.3 }); });
      on('fishing:escaped', ({ reason }) => { if (reason === 'snap') { shake(0.22, 0.3); pulse({ fringe: 1 }); } });
      on('flare', () => { kick(4); pulse({ bloom: 0.7 }); shake(0.18, 0.3); });
      on('levelup', () => { pulse({ bloom: 0.5 }); kick(-1.5); });
      on('boss:spawn', ({ enemy }) => {
        shake(0.6, 1.2); pulse({ vignette: 0.25 });
        if (enemy?.position) attention(enemy.position, 2.6, 0.35);
      });
      on('boss:slain', () => { pulse({ bloom: 0.8 }); shake(0.4, 0.6); });
      on('gate:open', () => { pulse({ bloom: 0.5 }); });
      on('phase:change', ({ phase }) => {
        if (phase === 'gloomtide') { shake(0.16, 0.8); pulse({ vignette: 0.18 }); }
        else if (phase === 'dawn') pulse({ bloom: 0.4 });
      });
      on('lantern:out', () => pulse({ vignette: 0.2, fringe: 0.8 }));
      on('lantern:lit', () => pulse({ bloom: 0.3 }));
      on('victory', () => { flash(0xffe2a8, 0.45, 1.2); pulse({ bloom: 1 }); });
    },

    update(dt, t) {
      dt = Math.min(Math.max(Number(dt) || 0, 0), 0.1);
      time += dt;
      // follow quality setting changes made directly in meta.settings
      if (time > qualityCheckAt) {
        qualityCheckAt = time + 0.5;
        const q = ctx.state?.meta?.settings?.quality;
        if (typeof q === 'string' && q !== lastMetaQuality && (q === 'auto' || TIERS[q])) setQuality(q);
      }
      if (scene.fog) bg.copy(scene.fog.color);
      updateCamera(dt);
      updateGrade(dt);
    },

    render() {
      sampleFps(performance.now());
      renderer.info.reset();
      composer.render(ctx.time?.dt || 0.016);
    },

    resize,
    setQuality,
    setGrade,
    getGrade() {
      const out = {};
      for (const k of GRADE_NUM) out[k] = gTgt[k];
      for (const k of GRADE_COL) out[k] = cTgt[k].getHex();
      return out;
    },
    shake, flash, pulse, kick, attention,
    getCameraMode() { return mode; },
    /** Jump the rig straight to its current target (cuts, tests). */
    snapCamera() {
      const p = playerPos();
      computeNightK(10);
      mode = pickMode();
      fillTargets(p);
      for (const k of PARAM_KEYS) cur[k] = tgt[k];
      focusFor(p, focusTarget);
      fX.x = focusTarget.x; fY.x = focusTarget.y; fZ.x = focusTarget.z;
      fX.v = fY.v = fZ.v = 0;
      yaw = wrapAngle(targetYaw(p));
      focusInit = true;
      updateCamera(0);
    },
    getYaw() { return yaw; },
    getFocus(out = new THREE.Vector3()) { return out.set(fX.x, fY.x, fZ.x); },

    projectToScreen(vec, out) {
      const o = out || {};
      if (!vec) { o.x = 0; o.y = 0; o.visible = false; return o; }
      projV.set(vec.x || 0, vec.y || 0, vec.z || 0).project(camera);
      const behind = projV.z > 1 || projV.z < -1;
      let nx = projV.x, ny = projV.y;
      if (behind) { nx = -nx; ny = -ny; }   // keep direction meaningful for edge markers
      o.x = (nx * 0.5 + 0.5) * W;
      o.y = (-ny * 0.5 + 0.5) * H;
      o.behind = behind;
      o.onScreen = !behind && Math.abs(nx) <= 1 && Math.abs(ny) <= 1;
      o.visible = o.onScreen;
      return o;
    },
    raycast(ndc, objects, recursive = true) {
      if (!ndc || !objects) return [];
      raycaster.setFromCamera(ndc, camera);
      return Array.isArray(objects) ? raycaster.intersectObjects(objects, recursive) : raycaster.intersectObject(objects, recursive);
    },
    groundPoint(ndc, y = 0) {
      if (!ndc) return null;
      raycaster.setFromCamera(ndc, camera);
      plane.constant = -y;
      const out = new THREE.Vector3();
      const hit = raycaster.ray.intersectPlane(plane, out);
      if (!hit) return null;
      if (tmpV2.copy(out).sub(camera.position).lengthSq() > 600 * 600) return null;
      return out;
    },
  };
  Object.defineProperty(api, 'composer', { get: () => composer });
  Object.defineProperty(api, 'bloomPass', { get: () => bloomPass });
  return api;
}
