// render.js — GLOOMWATER renderer, camera rig and post-processing (render author).
// CONTRACT §7 render. Owns: WebGLRenderer, scene, camera, scene.fog (FogExp2) + clear
// colour, the post chain RenderPass → UnrealBloomPass → grade → OutputPass, the camera
// rig (title / sail / fish / reel / night / shop / death, and with v3 on the trophy shot), screen shake, flashes and
// quality tiers.
//
// v3 (CONTRACT §13.7 render, DESIGN §25.14.2 R1 / R2; only while data.V3_ENABLED): sail / fish / reel take every number
// from BALANCE.cameras (render's convention, render-camera.js); the reel distance follows the line distance only, never
// the size class; the night overview blends in only while combat.swarmActive (a Stillnight, Lantern's quiet nights and
// tail and a lamp-watch keep the sail / fish framings). setTrophyTarget({length, landmark, position}) starts the `trophy`
// shot (distance clamp(1.2 + 1.6·L, 1.6, 16) m around actors' measuring focus, the crane to 50° above 4 m, the yaw toward
// the landmark by at most ±35° from north, none without one); setTrophyTarget(null) holds it while the catch card is up
// and then eases back. fishing:reveal (the leap reveal) plays a short push-in on the breach and goes through
// ctx.game.slowmo (0.25 s at 0.35; main owns ctx.time.timeScale). With the flag off the rig is v1's, number for number.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { clamp, damp, lerp, smoothstep, easeInOutSine } from './core.js';
import { GradeShader } from './render-grade.js';
import { setToonTier } from './toon.js';   // CLARITY LANE B: tier settings
import {
  v3Presets, trophyRule, trophyDistance, trophyCranes, trophyElev, trophyYaw, trophyLift, trophyFit, trophyUp, trophyAcross,
  fishDistance, fishElev, reelDistance, nightTarget, pitchOf,
} from './render-camera.js';

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
// >>> CLARITY LANE B: tier settings
// shadow = the key light's shadow-map size (0 = none), shadowEvery = refresh every n-th frame, shadowBox = half-size (m)
// of its box round the raft, reflect = the lake's planar-reflection target as a share of the drawing buffer (0 = the
// analytic water). Low pays for none of it (docs/v3/clarity/SPEC.md §10).
const TIERS_B = {
  low:    { shadow: 0,    shadowEvery: 1, shadowBox: 0,  reflect: 0 },
  medium: { shadow: 1024, shadowEvery: 2, shadowBox: 34, reflect: 1 / 3 },
  high:   { shadow: 2048, shadowEvery: 1, shadowBox: 42, reflect: 0.5 },
};
// <<< CLARITY LANE B
const TIER_ORDER = ['low', 'medium', 'high'];

// Camera presets. elev = camera elevation above the focus (deg), dist = focus→camera (m),
// aim = look-target lead along the view direction (m), aimY = look-target height (m),
// fov = vertical fov on landscape (deg), ahead = velocity look-ahead (s), stiff = focus spring ω.
export const MODES = {
  title: { elev: 15, dist: 15.5, aim: 0, aimY: 2.9, fov: 42, ahead: 0, stiff: 2.2 },
  sail:  { elev: 32, dist: 16.5, aim: 6.5, aimY: 0.6, fov: 50, ahead: 0.55, stiff: 3.6 },
  fish:  { elev: 34, dist: 14.0, aim: 0.8, aimY: 0.4, fov: 48, ahead: 0.1, stiff: 3.0 },
  reel:  { elev: 25, dist: 10.0, aim: 0.4, aimY: 0.7, fov: 44, ahead: 0, stiff: 3.4 },
  night: { elev: 53, dist: 24.0, aim: 2.0, aimY: 0.0, fov: 52, ahead: 0.35, stiff: 4.2 },
  shop:  { elev: 18, dist: 10.0, aim: 0, aimY: 1.5, fov: 44, ahead: 0, stiff: 2.4 },
  death: { elev: 36, dist: 12.5, aim: 0, aimY: 0.6, fov: 46, ahead: 0, stiff: 1.4 },
  // the measuring ceremony's close-up (v3 R2; only while a trophy target is set): dist / elev / fov / aimY are computed
  trophy: { elev: 18, dist: 1.6, aim: 0, aimY: 0.6, fov: 44, ahead: 0, stiff: 2.4 },
};
// v3 automatic fishing: how much of AUTOFISH.play[class].shake each beat of the play gives the camera, and the class ladder.
const REEL_SHAKE = { take: 0.8, run: 0.6, surge: 1, lastStand: 1.2, loss: 0.7, hold: 0.25 };
const CLASS_RANK = { small: 0, keeper: 1, prize: 2, trophy: 3, elder: 4, ancient: 5, legend: 6 };
// v3: after the card's turn the trophy framing holds while a blocking modal (the catch card) is up, then eases back.
const TROPHY_HOLD_GRACE = 0.6;
const TROPHY_HOLD_MAX = 90;
const PARAM_KEYS = ['elev', 'dist', 'aim', 'aimY', 'fov', 'ahead', 'stiff'];
// When the line runs up-screen (away from the camera) the fish / reel framing looks a little behind
// the raft and leans less toward the bobber, so the raft sits above the reel gauge (≈62%) and the
// bottom-centre lantern cluster with the bobber still below the clock. Casts toward the camera keep
// the plain framing (the bobber is then below the raft on screen).
const UPCAST = { fish: { aim: -2.5, w: 0.3 }, reel: { aim: -4.0, w: 0.25 } };
const BASE_W = { fish: 0.44, reel: 0.4 };

const GRADE_NUM = ['exposure', 'bloomStrength', 'bloomRadius', 'bloomThreshold', 'tintAmount', 'vignette',
  'saturation', 'grain', 'contrast', 'fringe', 'paper', 'warmAmount', 'lift'];
const GRADE_COL = ['tint', 'warm'];
const GRADE_DEFAULT = {
  exposure: 1.0, bloomStrength: 0.85, bloomRadius: 0.6, bloomThreshold: 0.72, tintAmount: 0.18,
  vignette: 0.38, saturation: 0.85, grain: 0.05, contrast: 1.04, fringe: 0.4, paper: 0.5, warmAmount: 0.14, lift: 0.6,
  tint: 0x40347e, warm: 0xf4cc96,
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
  // v3 camera presets (CONTRACT §13.7 render): read once, like data itself (the flag is fixed for the page load)
  const V3 = ctx.data?.V3_ENABLED === true;
  const CAMS = V3 ? v3Presets(ctx.data?.BALANCE?.cameras, MODES) : null;
  const P = CAMS ? CAMS.modes : MODES;   // the presets in force (v1's own table with the flag off)
  const TROPHY = CAMS ? CAMS.trophy : trophyRule(ctx.data?.BALANCE?.cameras, ctx.data?.BALANCE?.ceremony?.camera);

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
  // >>> CLARITY LANE B: shadow map
  // One shadow map, the key light's (world.js applyKeyLight owns the light, its box and its refresh beat). On high the
  // toon materials read it through three's soft filter, on medium through their own 4-tap one (toon.js), so the
  // renderer's type is Basic there; low has no shadow map at all.
  renderer.shadowMap.enabled = false;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  let tierB = TIERS_B.high;
  function applyTierB(name) {
    tierB = TIERS_B[name] || TIERS_B.medium;
    const on = tierB.shadow > 0, type = name === 'high' ? THREE.PCFSoftShadowMap : THREE.BasicShadowMap;
    if (renderer.shadowMap.enabled !== on || renderer.shadowMap.type !== type) {
      renderer.shadowMap.enabled = on;
      renderer.shadowMap.type = type;
      // lit materials compile the shadow lookup in or out: have them rebuilt on their next draw
      scene?.traverse?.((o) => { const m = o.material; if (m && m.isMeshToonMaterial) m.needsUpdate = true; });
    }
    setToonTier(name);
  }
  // <<< CLARITY LANE B

  const z0 = ctx.data?.ZONES?.[0]?.palette;
  const scene = new THREE.Scene();
  scene.name = 'gloomwater';
  scene.fog = new THREE.FogExp2(z0?.fog ?? 0x3a3070, z0?.fogDensity ?? 0.016);
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
  // Clamp what feeds the bloom: a tiny HDR-hot sprite (eyes, motes, cinders, Warden glow) otherwise
  // pours its whole energy through the half-res mips and blooms into a visible square on low.
  {
    const hp = bloomPass.materialHighPassFilter;
    hp.uniforms.uBloomClamp = { value: 3.0 };
    hp.fragmentShader = hp.fragmentShader
      .replace('uniform float smoothWidth;', 'uniform float smoothWidth;\nuniform float uBloomClamp;')
      .replace('gl_FragColor = mix( outputColor, texel, alpha );',
        'float lum = max(luminance( texel.xyz ), 1e-4);\n\t\t\ttexel.rgb *= min(1.0, uBloomClamp / lum);\n\t\t\tgl_FragColor = mix( outputColor, texel, alpha );');
    hp.needsUpdate = true;
  }
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

  let prScale = 1;   // debug.renderScale(): render below CSS resolution (headless regression runs)
  function effectivePixelRatio() {
    const t = TIERS[tierName];
    let pr = Math.min(window.devicePixelRatio || 1, t.pr);
    const px = W * H * pr * pr;
    if (px > t.maxPx) pr = Math.sqrt(t.maxPx / (W * H));
    return prScale < 1 ? Math.max(0.2, pr * prScale) : Math.max(0.5, pr);
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
    bloomPass.materialHighPassFilter.uniforms.uBloomClamp.value = name === 'low' ? 2.0 : 3.0;
    buildComposer(ctx.isMobile ? 0 : t.samples);
    applyTierB(name);   // CLARITY LANE B: tier settings
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
    push: 0, pushT: 0, pushIn: 0.35, pushHold: 0, pushOut: 0.8,   // a dolly push-in on the current framing (the landing)
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
  /** A dolly push-in on whatever the camera frames now (v3 landing): the distance comes in by `amount` (0..0.6) over `rise` s, holds
   *  `hold` s and eases back over `release` s. Reduced motion halves it. */
  function push(amount = 0.25, hold = 0.5, rise = 0.35, release = 0.8) {
    const a = clamp(Number(amount) || 0, -0.4, 0.6) * (reducedMotion ? 0.5 : 1);   // a negative amount draws the camera back
    if (a === 0) return false;
    fx.push = a; fx.pushT = 0; fx.pushIn = Math.max(0.05, rise); fx.pushHold = Math.max(0, hold); fx.pushOut = Math.max(0.1, release);
    return true;
  }
  function pushK() {
    if (!fx.push) return 0;
    const t = fx.pushT, a = fx.pushIn, h = fx.pushHold, r = fx.pushOut;
    if (t >= a + h + r) { fx.push = 0; return 0; }
    const e = t < a ? smoothstep(0, a, t) : t < a + h ? 1 : 1 - smoothstep(a + h, a + h + r, t);
    return fx.push * e;
  }
  /** Bias the camera focus toward a world point for a while (boss entrances, gates…). */
  function attention(position, duration = 2, weight = 0.4) {
    if (!position) { fx.attention = null; return; }
    fx.attention = fx.attention || new THREE.Vector3();
    fx.attention.set(position.x || 0, 0, position.z || 0);
    fx.attentionT = 0; fx.attentionDur = Math.max(0.2, duration); fx.attentionW = clamp(weight, 0, 0.8);
  }

  // ---------------------------------------------------------------- camera rig state
  const cur = {}, tgt = {};
  for (const k of PARAM_KEYS) cur[k] = tgt[k] = P.title[k];
  let yaw = 0.55, titleYaw = 0.55, deathYaw = 0, deathT0 = 0;
  let upCast = 1;
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
  // the trophy shot (v3 R2): on while fishing's ceremony holds a target; hold after it while the catch card is up
  const trophy = {
    on: false, hold: false, t: 0, holdT: 0, L: 0.5, dist: TROPHY.min ?? 1.6, crane: false, yaw: 0, r: 0.6,
    landmark: null, place: null, from: new THREE.Vector3(), subject: new THREE.Vector3(), measured: false,
    lastFocus: new THREE.Vector3(), lastR: 0,   // actors' last measuring focus: the card's hold keeps the held fish framed
  };
  const subjTmp = new THREE.Vector3();
  let trophyK = 0;   // eased 0..1 weight of the trophy grade
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
  function uiBlocking() {
    if (!isReal(ctx.ui)) return false;
    try { return ctx.ui.isBlocking?.() === true; } catch { return false; }
  }
  /** combat.swarmActive (v3): inside the swarm window now, or a Gloomtide calm raid. Render's night overview follows it. */
  function swarmActive() {
    if (!isReal(ctx.combat)) return false;
    try { return ctx.combat.swarmActive === true; } catch { return false; }
  }
  const trophyLive = () => (trophy.on || trophy.hold) && (ctx.flow === 'playing' || ctx.flow === 'hub');
  /**
   * The trophy shot's subject: actors' measuring focus (the fish and the Wick, weighted toward the fish) when actors
   * provides it, else the Wick's head drawn toward where the fish was landed. Writes trophy.subject / trophy.r.
   */
  function updateTrophySubject() {
    let mf = null;
    if (isReal(ctx.actors) && typeof ctx.actors.getMeasureFocus === 'function') {
      try { mf = ctx.actors.getMeasureFocus(subjTmp); } catch { mf = null; }
    }
    const c = mf && mf.center;
    if (c && Number.isFinite(c.x) && Number.isFinite(c.y) && Number.isFinite(c.z)) {
      trophy.subject.set(c.x, c.y, c.z);
      trophy.r = Math.max(0.35, Number(mf.radius) || trophy.L * 0.5);
      if (trophy.on) { trophy.lastFocus.copy(trophy.subject); trophy.lastR = trophy.r; }
      return;
    }
    // the card's hold: the ceremony is over but the Wick still holds its fish, so the shot keeps the fish and its glory
    // (the card covers the foot of a phone's frame; the head alone would leave the fish under it)
    if (trophy.hold && trophy.lastR > 0) { trophy.subject.copy(trophy.lastFocus); trophy.r = trophy.lastR; return; }
    // fallback: the head (flame) of the Wick, or a point 0.9 m over the deck, toward the landing spot by pose
    let head = null;
    if (isReal(ctx.actors) && typeof ctx.actors.getHeadPos === 'function') {
      try { head = ctx.actors.getHeadPos(subjTmp); } catch { head = null; }
    }
    if (!head || !Number.isFinite(head.x)) {
      const p = playerPos();
      head = subjTmp.set(p ? p.x : trophy.from.x, 0.9, p ? p.z : trophy.from.z);
    }
    const L = trophy.L;
    const w = L < 0.85 ? 0.12 : L < 2 ? 0.3 : 0.55;   // held fish sit by the Wick; an alongside one lies out by the landing spot
    trophy.subject.copy(head).lerp(trophy.from, w);
    // held fish: around the preset's aimY over the Wick's feet (the hands), lifted with a hanging fish; alongside: the water line
    trophy.subject.y = L < 2 ? Math.max(TROPHY.aimY ?? 0.6, head.y - 0.25 - Math.min(L, 2) * 0.2) : Math.max(0.2, head.y * 0.4);
    trophy.r = head.distanceTo(trophy.from) * Math.max(w, 1 - w) * (L < 2 ? 0.4 : 1) + Math.max(L * 0.5, 0.35);
  }

  function pickMode() {
    const flow = ctx.flow;
    if (flow === 'title' || flow === 'boot') return 'title';
    if (flow === 'dead') return 'death';
    if (trophyLive()) return 'trophy';
    if (!ctx.state?.run) return 'title';
    if (shopOpen() && merchantPos()) return 'shop';
    const fs = fishingState();
    if (fs === 'reeling' || fs === 'landing') return 'reel';
    // 'charging' keeps the sail framing: moving the camera under a held pointer would drag the aim
    if (fs === 'casting' || fs === 'waiting' || fs === 'bite' || fs === 'lost') return 'fish';
    return nightK > 0.5 ? 'night' : 'sail';
  }

  function computeNightK(dt) {
    if (V3) {
      // v3: the overview follows the swarm (combat.swarmActive), never the phase alone (BALANCE.cameras.night)
      nightK = damp(nightK, nightTarget({ playing: ctx.flow === 'playing', swarmActive: swarmActive() }), CAMS.nightBlend, dt);
      return;
    }
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
    const base = P[mode];
    for (const k of PARAM_KEYS) tgt[k] = base[k];
    const nk = nightK;
    if (mode === 'trophy') { fillTrophy(); return; }   // its own portrait fit (the distance is the rule's)
    if (mode === 'sail' || mode === 'night') {
      const s = P.sail, n = P.night;
      for (const k of PARAM_KEYS) tgt[k] = lerp(s[k], n[k], nk);
    } else if (mode === 'fish' || mode === 'reel') {
      const b = bobber();
      let sep = 6;
      if (b && p) sep = Math.hypot(b.x - p.x, b.z - p.z);
      else if (mode === 'fish') sep = (Number(ctx.fishing?.view?.castDist) || 8) * 0.6;
      // how far up-screen the line runs: +1 straight away from the camera, -1 toward it
      let along = 1;
      if (b && p && sep > 0.5) along = (-Math.sin(yaw) * (b.x - p.x) - Math.cos(yaw) * (b.z - p.z)) / sep;
      else if (mode === 'fish' && isFinite(Number(ctx.fishing?.view?.aim))) along = Math.cos(Number(ctx.fishing.view.aim) - yaw);
      upCast = smoothstep(-0.1, 0.7, along);
      sep = clamp(sep, 0, 40);
      if (V3) {
        // data's aim frames the common up-screen cast; a cast toward the camera keeps render's plain lean
        tgt.aim = lerp(CAMS.downAim[mode], base.aim, upCast);
        if (mode === 'fish') {
          tgt.dist = fishDistance(sep, base);
          tgt.elev = fishElev(sep, base);
        } else tgt.dist = reelDistance(sep, base);   // line distance only: never the size class (nor the tension it pulls)
      } else if (mode === 'fish') {
        tgt.aim = lerp(base.aim, UPCAST[mode].aim, upCast);
        tgt.dist = Math.max(base.dist, 8.5 + sep * 0.78);
        tgt.elev = base.elev + clamp(sep - 12, 0, 20) * 0.4;
      } else {
        tgt.aim = lerp(base.aim, UPCAST[mode].aim, upCast);
        tgt.dist = Math.max(base.dist, 7.5 + sep * 0.6);
        const tension = Number(ctx.fishing?.view?.tension) || 0;
        tgt.dist -= clamp(tension, 0, 1) * 0.9;
        tgt.fov -= clamp(tension - 0.6, 0, 0.4) * 6;
      }
      // night fishing keeps a little of the swarm overview (v3: only while a swarm is up)
      const nn = nk * 0.45;
      tgt.elev = lerp(tgt.elev, P.night.elev, nn);
      tgt.dist = lerp(tgt.dist, Math.max(tgt.dist, P.night.dist * 0.85), nn);
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

  /**
   * The trophy shot (v3 R2): the rule's distance and crane; the subject raised above the frame's centre (ui's measuring band
   * owns its foot) and the fov widened only as far as the subject needs (a phone held upright: across, then a step back).
   */
  function fillTrophy() {
    const T = TROPHY;
    tgt.elev = trophyElev(trophy.L, T, trophy.t);
    tgt.aim = T.aim ?? 0;
    tgt.ahead = 0;
    tgt.stiff = T.stiff ?? 2.4;
    // a phone held upright: the catch card rises from the foot of the screen, so while it is up the held fish and its glory
    // ride in the open top of the frame
    const up = trophyUp(trophy.L, T) + (trophy.hold && W / H < 0.8 ? 0.24 : 0);
    const fit = trophyFit(T.fov ?? 44, trophy.r, trophy.dist, W / H, { across: trophyAcross(trophy.L), up });
    tgt.dist = fit.dist;   // the rule's distance (a phone held upright may step back, as raft presets do)
    tgt.fov = fit.fov;
    tgt.aimY = trophyLift(tgt.dist, tgt.fov, tgt.elev, up);
  }

  function focusFor(p, out) {
    if (mode === 'trophy') return out.copy(trophy.subject);   // the fish and the Wick, at their own height
    if (!p) return out.set(0, 0, 8);
    out.set(p.x, 0, p.z);
    if (mode === 'fish' || mode === 'reel') {
      const b = bobber();
      if (b) {
        const w = lerp(BASE_W[mode], UPCAST[mode].w, upCast);
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
    if (mode === 'trophy') return trophy.yaw;
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

  /** The trophy shot's clocks (v3 R2): its crane time, and the hold that keeps the framing while the catch card is up. */
  function updateTrophy(dt) {
    if (trophy.on) trophy.t += dt;
    else if (trophy.hold) {
      trophy.t += dt;
      trophy.holdT += dt;
      const fs = fishingState();
      const away = (ctx.flow !== 'playing' && ctx.flow !== 'hub') || (fs !== 'idle' && fs !== 'landing');
      if (away || trophy.holdT > TROPHY_HOLD_MAX || (trophy.holdT > TROPHY_HOLD_GRACE && !uiBlocking())) trophy.hold = false;
    }
    if (trophyLive()) updateTrophySubject();
  }

  // the trophy shot's moves in and out are eased both ways (critically damped springs on the rig's parameters and yaw);
  // every other move keeps v1's exponential ease. curV tracks each parameter's velocity so a spring starts from the
  // motion already under way.
  const curV = {};
  for (const k of PARAM_KEYS) curV[k] = 0;
  const yawS = { x: 0, v: 0 };
  const springPrm = { x: 0, v: 0 };
  const TROPHY_IN = 3.2, TROPHY_OUT = 2.4, TROPHY_OUT_T = 3;

  function updateCamera(dt) {
    computeNightK(dt);
    updateTrophy(dt);
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
    const trophyMove = mode === 'trophy' ? TROPHY_IN : prevMode === 'trophy' && modeT < TROPHY_OUT_T ? TROPHY_OUT : 0;
    for (const k of PARAM_KEYS) {
      const before = cur[k];
      if (trophyMove > 0 && dt > 0) {
        springPrm.x = cur[k]; springPrm.v = curV[k];
        cur[k] = springStep(springPrm, tgt[k], trophyMove, dt);
        curV[k] = springPrm.v;
      } else {
        cur[k] = damp(cur[k], tgt[k], lam, dt);
        curV[k] = dt > 0 ? (cur[k] - before) / dt : 0;
      }
    }

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
    if (trophyMove > 0 && dt > 0) {
      yawS.x = yaw;
      springStep(yawS, yaw + wrapAngle(ty - yaw), trophyMove, dt);
      yaw = yawS.x;
    } else {
      const y0 = yaw;
      yaw += wrapAngle(ty - yaw) * (1 - Math.exp(-(mode === 'title' ? 3 : lam) * dt));
      yawS.v = dt > 0 ? wrapAngle(yaw - y0) / dt : 0;
    }
    yaw = wrapAngle(yaw);

    // spherical placement around the focus (a landing's push-in brings the distance in for a beat)
    if (fx.push) fx.pushT += dt * clamp(Number(ctx.time?.timeScale ?? 1) || 0, 0, 1);   // on the game's clock: a slow-motion beat slows it too
    const dist = cur.dist * (1 - pushK());
    const elev = clamp(cur.elev, 3, 85) * DEG;
    const sy = Math.sin(yaw), cy = Math.cos(yaw);
    const ce = Math.cos(elev), se = Math.sin(elev);
    fwd.set(-sy, 0, -cy);
    camPos.set(fX.x + sy * ce * dist, fY.x + se * dist, fZ.x + cy * ce * dist);
    lookTarget.set(fX.x + fwd.x * cur.aim, fY.x + cur.aimY, fZ.x + fwd.z * cur.aim);

    // subtle hand-held sway + a hint of the swell (a close-up breathes less; the held subject already rides the swell)
    const close = mode === 'trophy' ? clamp(cur.dist / 10, 0.12, 1) : 1;
    const swayAmt = (mode === 'title' ? 0.22 : mode === 'night' ? 0.08 : 0.12) * close * (reducedMotion ? 0.2 : 1);
    camPos.x += Math.sin(time * 0.37) * swayAmt;
    camPos.y += Math.sin(time * 0.53 + 1.3) * swayAmt * 0.8;
    const wh = isReal(ctx.water) && ctx.water.getHeight ? Number(ctx.water.getHeight(fX.x, fZ.x)) || 0 : 0;
    if (mode !== 'trophy') { camPos.y += wh * 0.25; lookTarget.y += wh * 0.4; }
    // the floor: v1's 1.2 m; the trophy close-up may sit lower (a palm-sized catch is filmed from chest height)
    const floorY = mode === 'trophy' ? 0.5 : prevMode === 'trophy' && modeT < TROPHY_OUT_T ? lerp(0.5, 1.2, smoothstep(0, TROPHY_OUT_T, modeT)) : 1.2;
    if (camPos.y < floorY) camPos.y = floorY;

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

  /**
   * setTrophyTarget({length, landmark, position, place}) (CONTRACT §13.7 render; fishing's ceremony calls it at the scoop):
   * length = the fish's true length in metres, landmark = data.landmarkOf(place) | null, position = where it was landed.
   * null = the card's turn: the framing holds while the catch card is up, then eases back to sail.
   */
  function setTrophyTarget(t) {
    if (!t || typeof t !== 'object') {
      if (trophy.on) { trophy.on = false; trophy.hold = true; trophy.holdT = 0; }
      return false;
    }
    const L = Number(t.length);
    if (!(L > 0) || !Number.isFinite(L)) return false;
    trophy.on = true; trophy.hold = false; trophy.t = 0; trophy.holdT = 0; trophy.lastR = 0;
    trophy.L = L;
    trophy.dist = trophyDistance(L, TROPHY);
    trophy.crane = trophyCranes(L, TROPHY);
    const lm = t.landmark;
    trophy.landmark = lm && Number.isFinite(Number(lm.x)) && Number.isFinite(Number(lm.z))
      ? { x: Number(lm.x), y: Number(lm.y) || 0, z: Number(lm.z) } : null;
    trophy.place = t.place ?? null;
    const p = playerPos();
    const pos = t.position;
    if (pos && Number.isFinite(Number(pos.x)) && Number.isFinite(Number(pos.z))) trophy.from.set(Number(pos.x), Number(pos.y) || 0, Number(pos.z));
    else trophy.from.set(p ? p.x : fX.x, 0.5, p ? p.z : fZ.x);
    // the yaw is chosen once, from the Wick (the subject's anchor), so the frame does not wander as the fish is lifted
    trophy.yaw = trophyYaw(p || trophy.from, trophy.landmark, TROPHY.yawMax ?? 35);
    updateTrophySubject();
    return true;
  }

  /**
   * The leap beat (v3): time slows through main (ctx.game.slowmo; a second start inside the same beat changes nothing, so
   * fishing and render may both ask), and the camera leans into the breach with a short push-in, scaled by size only.
   */
  function leapBeat(position, lengthM, seconds, scale) {
    try { ctx.game?.slowmo?.(seconds, scale); } catch (e) { console.error('[render] slowmo', e); }
    const big = clamp((Number(lengthM) || 1) / 3, 0, 1);
    kick(-(2.5 + 2 * big));
    shake(0.08 + 0.1 * big, 0.35);
    if (position && Number.isFinite(Number(position.x))) attention(position, 1.2, 0.22 + 0.1 * big);
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
    trophyK = damp(trophyK, mode === 'trophy' ? 1 : 0, 2.4, dt);
    const heart = reducedFlashing() ? 0.6 : 0.5 + 0.5 * Math.sin(time * TAU * 1.1) * Math.sin(time * TAU * 1.1);
    renderer.toneMappingExposure = BASE_EXPOSURE * Math.max(0.05, gCur.exposure) * (1 - fx.death * 0.18) * (1 - fx.dark * 0.12);
    bloomPass.strength = Math.max(0, gCur.bloomStrength * (1 + fx.bloomPulse));
    bloomPass.radius = clamp(gCur.bloomRadius, 0, 1.5);
    bloomPass.threshold = Math.max(0, gCur.bloomThreshold);

    gu.uTime.value = time % 1000;
    // the trophy shot (v3) is the payoff: a touch richer and a softer frame around the catch (0 with the flag off)
    gu.uSaturation.value = Math.max(0, gCur.saturation * (1 + trophyK * 0.06) * (1 - fx.death * 0.55));
    gu.uContrast.value = clamp(gCur.contrast + reel * 0.04 + trophyK * 0.03 + fx.death * 0.05, 0.6, 1.6);
    gu.uTint.value.copy(cCur.tint);
    gu.uTintAmount.value = clamp(gCur.tintAmount, 0, 1);
    gu.uWarm.value.copy(cCur.warm);
    gu.uWarmAmount.value = clamp(gCur.warmAmount, 0, 1);
    gu.uLift.value = Math.max(0, gCur.lift);
    gu.uVignette.value = clamp(gCur.vignette + reel * 0.08 + trophyK * 0.07 + fx.vigPulse + fx.death * 0.25 + fx.dark * 0.22 + fx.danger * 0.06 * heart, 0, 1);
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
      if (ctx.debug) {
        ctx.debug.renderScale = (x = 1) => { prScale = clamp(Number(x) || 1, 0.2, 1); resize(W, H); return prScale; };
        // the camera rig at a glance (tests, screenshots): the mode, the eased parameters and their targets, the presets in
        // force, the measured pitch, the night weight and the swarm it follows, and the trophy shot
        ctx.debug.camera = () => {
          const r1 = (x) => Math.round(x * 1000) / 1000;
          const prm = (o) => Object.fromEntries(PARAM_KEYS.map((k) => [k, r1(o[k])]));
          camera.getWorldDirection(tmpV2);
          const subj = trophyLive() ? trophy.subject : null;
          return {
            v3: V3, mode, prevMode, modeT: r1(modeT), cur: prm(cur), tgt: prm(tgt), yawDeg: r1(yaw / DEG), fov: r1(camera.fov),
            pitchDeg: r1(Math.asin(clamp(-tmpV2.y, -1, 1)) / DEG), presetPitchDeg: r1(pitchOf(cur)),
            focus: { x: r1(fX.x), y: r1(fY.x), z: r1(fZ.x) }, pos: { x: r1(camera.position.x), y: r1(camera.position.y), z: r1(camera.position.z) },
            camToFocus: r1(Math.hypot(camera.position.x - fX.x, camera.position.y - fY.x, camera.position.z - fZ.x)),
            nightK: r1(nightK), swarmActive: swarmActive(), aspect: r1(W / H),
            presets: { sail: prm(P.sail), fish: prm(P.fish), reel: prm(P.reel), night: prm(P.night) },
            trophy: trophy.on || trophy.hold ? {
              on: trophy.on, hold: trophy.hold, t: r1(trophy.t), length: trophy.L, dist: r1(trophy.dist), crane: trophy.crane,
              yawDeg: r1(trophy.yaw / DEG), landmark: trophy.landmark, place: trophy.place, radius: r1(trophy.r),
              subject: subj ? { x: r1(subj.x), y: r1(subj.y), z: r1(subj.z) } : null,
              camToSubject: subj ? r1(camera.position.distanceTo(subj)) : null,
            } : null,
          };
        };
      }
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
      if (V3) {
        // the leap reveal (DESIGN §25.6.5): the first breach of a Prize+ fish. Time slows through main
        // (ctx.game.slowmo 0.25 s at 0.35; a second start in the same beat changes nothing), and the camera leans into
        // the breach with a short push-in: size-scaled, never species-specific (the species stays unknown until landed)
        on('fishing:reveal', ({ position, lengthM, time: sec, timescale }) => {
          const LR = ctx.data?.BALANCE?.bite?.leapReveal || {};
          leapBeat(position, lengthM, Number.isFinite(Number(sec)) ? Number(sec) : (LR.time ?? 0.25),
            Number.isFinite(Number(timescale)) ? Number(timescale) : (LR.timescale ?? 0.35));
        });
        // automatic fishing (DESIGN §25.6 rewrite, CONTRACT §13.7a `fishing:reel`; inert until fishing emits it): the play's
        // beats shake the camera by size class (AUTOFISH.play[class].shake) and a Prize+ leap slows time through main
        // (AUTOFISH.leap.slowmo). Class, strength and length only: nothing here can tell one species from another.
        on('fishing:reel', ({ phase, sizeClass, strength, dur, length }) => {
          const AF = ctx.data?.AUTOFISH;
          const k = clamp(Number.isFinite(Number(strength)) ? Number(strength) : 1, 0, 1.5);
          const amt = (Number(AF?.play?.[sizeClass]?.shake) || 0) * (REEL_SHAKE[phase] || 0) * k;
          if (amt > 0) shake(amt, clamp(Number(dur) || 0.4, 0.2, 1.2));
          if (phase !== 'leap') return;
          const S = AF?.leap?.slowmo || {};
          if ((CLASS_RANK[sizeClass] ?? -1) < (CLASS_RANK[S.fromClass ?? 'prize'] ?? 2)) return;
          const b = bobber();
          leapBeat(b ? { x: b.x, z: b.z } : null, (Number(length) || 100) / 100, S.seconds ?? 0.25, S.scale ?? 0.35);
        });
        // run over mid-ceremony: no trophy framing outlives its run
        on('run:end', () => { trophy.on = false; trophy.hold = false; });
      }
      on('fishing:escaped', ({ reason }) => { if (reason === 'snap') { shake(0.22, 0.3); pulse({ fringe: 1 }); } });
      on('flare', () => { kick(4); pulse({ bloom: 0.4 }); shake(0.18, 0.3); });   // a softer pulse: the flare must not wash the frame
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
      // >>> CLARITY LANE B: planar-reflection hook (the lake mirrored into water's own target, before the main render)
      ctx.water?.renderReflection?.(renderer, scene, camera, tierB);
      // <<< CLARITY LANE B
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
    shake, flash, pulse, kick, attention, push,
    setTrophyTarget,
    getCameraMode() { return mode; },
    /** Jump the rig straight to its current target (cuts, tests). */
    snapCamera() {
      const p = playerPos();
      computeNightK(10);
      if (trophyLive()) { updateTrophySubject(); if (trophy.on) trophy.t = Math.max(trophy.t, 10); }
      mode = pickMode();
      fillTargets(p);
      for (const k of PARAM_KEYS) { cur[k] = tgt[k]; curV[k] = 0; }
      focusFor(p, focusTarget);
      fX.x = focusTarget.x; fY.x = focusTarget.y; fZ.x = focusTarget.z;
      fX.v = fY.v = fZ.v = 0;
      yaw = wrapAngle(targetYaw(p)); yawS.v = 0;
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
  Object.defineProperty(api, 'clarity', { get: () => tierB });   // CLARITY LANE B: tier settings (world's key light and water read them)
  Object.defineProperty(api, 'bloomPass', { get: () => bloomPass });
  return api;
}
