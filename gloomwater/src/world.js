// world.js — the four cavern-lake arenas and their atmosphere (world author).
// CONTRACT §7 world. Deterministic layout per zone (world-layout.js), hand-inked arena
// art (world-art.js), and a phase-driven mood that owns fog, lights, grade, water
// palette and water lights. Gameplay queries (depth, collision, open water...) are pure
// functions of the layout and work before init and between runs.
import * as THREE from 'three';
import { clamp, damp, smoothstep, TAU } from './core.js';
import { buildLayout, depthAt, isOpenWaterL } from './world-layout.js';
import { buildArena } from './world-art.js';
import { AIR } from './world-fx.js';
import { watchLampsFor, giantSpotsFor, buildWorldV3 } from './world-v3.js';
import { setToonFloor } from './toon.js';   // CLARITY LANE B: key light

const GATE_STATES = new Set(['hidden', 'sealed', 'open']);
const FALLBACK_ZONE = {
  id: 'mossmere', index: 0, name: 'The Mossmere', arena: { radius: 60, islands: 6, pillars: 10, seed: 1307 },
  palette: { fog: 0x3a3070, fogDensity: 0.0055, water: 0x2e2664, waterDeep: 0x0a081e, foam: 0xd8d6e6, glow: 0xbab2ee, accent: 0xd6d6e4, lamp: 0xb6b0f0, candle: 0xed9e3b, ambient: 0x4a3e88, ink: 0x08061a, far: 0x8c84bc, light: 0xd4d0f2, nebula: 0xd296ae, stars: 1.0 },
  grade: { tint: 0x40347e },
};
// "Clear Night" air (DESIGN §19.1): the scene fog is only a thin lavender aerial tint at far range (data.js fogDensity), the
// night barely thickens it, and mist is a dawn event. NIGHT / DAWN are the fog density's phase terms; the AIR_* rows scale
// what world-art.js sets for each effect (world-fx.js AIR) as base + night·n + warm·w.
const FOG_NIGHT = 0.15, FOG_DAWN = 0.3;  // dawn is the one misty hour: the far shore pales (100 m: 26 % → 40 %), the play area stays clear
const AIR_MIST = [0.30, 0, 0.75];       // shore mist ring: thin by day and night, a real band at dawn
const AIR_SHEETS = [0.25, -0.10, 0.65]; // low mist sheets: wisps at distance, thinner still at night
const AIR_SHAFTS = 0.45, AIR_POOLS = 0.6, AIR_RING_HAZE = 0.5;   // thin moonbeams; half the far rings' bottom haze
const NEBULA_K = 0.62;                  // a subtler nebula: the stars are the sharp thing in the vault
const STAR_DENSITY = 0.72;              // fewer stars, each a crisp point (the brightness law is in starlight-glsl.js)

/** The First Evening's cove (DESIGN §25.14.2b FE-W1): main switches the slice on only when this is true. Not built yet. */
export const SUPPORTS_COVE = false;

export function create(ctx) {
  const group = new THREE.Group();
  group.name = 'world';

  // >>> CLARITY LANE B: key light
  // lights: a violet hemisphere + the KEY (the moon / vault glow: a fixed three-quarter back light per lake, the one
  // shadow caster, DESIGN §19 / docs/v3/clarity/SPEC.md §7) + two accent point lights (always present so the light
  // count — and therefore shader programs — never changes)
  const hemi = new THREE.HemisphereLight(0x8a8cc4, 0x0a0b1a, 0.72);
  const dir = new THREE.DirectionalLight(0xcfd0f2, 2.1);
  dir.name = 'keyLight';
  dir.position.set(-71, 59, -38);
  hemi.layers.enable(1); dir.layers.enable(1);   // (toon.REFLECT_LAYER: the lake's reflection is lit like the scene)
  dir.shadow.autoUpdate = false;                 // refreshed on our own beat (every frame on high, every second on medium)
  dir.shadow.bias = -0.00022; dir.shadow.normalBias = 0.045; dir.shadow.intensity = 0.85;
  group.add(hemi, dir, dir.target);
  const KEY = {
    lav: new THREE.Color(0xc4b8ff), toLight: new THREE.Vector3(-0.71, 0.59, -0.38).normalize(),
    x: new THREE.Vector3(), y: new THREE.Vector3(), c: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0),
    size: 0, half: 0, beat: 0, DIST: 150, floor: new THREE.Color(),
  };
  /**
   * The hemisphere and the key light for mood (n night 0..1, w dawn warmth 0..1): colour, intensity, the key's fixed
   * direction (the arena's keyDir) and its shadow box, a square of the tier's half-size around the focus pushed 12 m
   * up-screen and snapped to whole shadow texels (no crawl as the raft moves). The night floors hold: the key never
   * under 0.9, the ambient never under 0.42.
   */
  function applyKeyLight(n, w, zc, focus) {
    // (the night ambient keeps more of the lake's violet than it did: with clear air it is the only fill there is)
    hemi.color.copy(zc.ambient).lerp(zc.light, 0.2).lerp(col.a.copy(zc.ambient).multiplyScalar(0.72).lerp(COLD, 0.15), n).lerp(WARM, w * 0.1);
    hemi.groundColor.copy(zc.waterDeep).lerp(zc.ink, 0.4);
    hemi.intensity = 0.72 * (1 - 0.38 * n) * (1 + 0.05 * w);
    // the vault's glow, the floor under every toon surface's shadow: the lake's own air colour (so it carries the
    // night floors), a fifth of it by day (deep shadows, a full range) and most of it at night, where the fog itself
    // used to be the floor; the dawn's bright mist takes it down again. A shadow is violet, never black (toon.js
    // gwFloor: it fills only what the lights left dark).
    setToonFloor(KEY.floor.copy(env.fog).multiplyScalar((0.18 + 0.56 * n) * (1 - 0.8 * w)));
    dir.color.copy(zc.light).lerp(KEY.lav, 0.25).lerp(WARM, w * 0.55).lerp(COLD, n * 0.3);
    dir.intensity = 2.1 * (1 - 0.55 * n) * (1 + 0.15 * w);
    if (arena?.keyDir) KEY.toLight.copy(arena.keyDir);
    const L = KEY.toLight;
    const tb = ctx.render && !ctx.render.isStub ? ctx.render.clarity : null;
    const size = tb?.shadow | 0, half = tb?.shadowBox || 40;
    const on = size > 0 && ctx.render?.renderer?.shadowMap?.enabled === true;
    if (dir.castShadow !== on) dir.castShadow = on;
    const c = KEY.c.set(focus?.x || 0, 0, focus?.z || 0);
    if (on) {
      const sh = dir.shadow, cam = sh.camera;
      if (KEY.size !== size || KEY.half !== half) {
        KEY.size = size; KEY.half = half;
        if (sh.mapSize.x !== size) { sh.mapSize.set(size, size); sh.map?.dispose(); sh.map = null; }
        cam.left = -half; cam.right = half; cam.top = half; cam.bottom = -half; cam.near = 30; cam.far = 2 * KEY.DIST - 30;
        cam.updateProjectionMatrix();
        sh.needsUpdate = true;
      }
      const yaw = Number(ctx.render.getYaw?.()) || 0;
      c.x -= Math.sin(yaw) * 12; c.z -= Math.cos(yaw) * 12;
      // the shadow camera's own axes (it looks down −L with +Y up): snap the box centre to whole texels along them
      KEY.x.crossVectors(KEY.up, L).normalize(); KEY.y.crossVectors(L, KEY.x);
      const texel = (2 * half) / size, sx = c.dot(KEY.x), sy = c.dot(KEY.y);
      c.addScaledVector(KEY.x, Math.round(sx / texel) * texel - sx).addScaledVector(KEY.y, Math.round(sy / texel) * texel - sy);
      if (++KEY.beat % Math.max(1, tb.shadowEvery | 0) === 0) sh.needsUpdate = true;
    }
    dir.target.position.copy(c);
    dir.position.copy(c).addScaledVector(L, KEY.DIST);
    try { ctx.water?.setKeyLight?.(dir); } catch (e) { /* optional */ }
  }
  // <<< CLARITY LANE B
  const accents = [0, 1].map(() => {
    const l = new THREE.PointLight(0xffffff, 0, 14, 1.6);
    l.position.set(0, -50, 0);
    group.add(l);
    return { light: l, anchor: null, target: null, k: 0 };
  });

  let zone = null, layout = null, arena = null;
  // v3 (W1, CONTRACT §13.7 world): the lake's watch-lamps and stopgap giant water (pure data, cached per lake) and the v3
  // visuals (watch-lamp pools, the legend pool's low glimmer); all empty / null with the flag off
  let watchLamps = [], giantSpots = [], v3vis = null;
  const v3Info = { night: 0, fogDensity: 0.0055, lamps: [], moored: [], legendK: 0 };
  const bounds = { radius: 60 };
  const obstacles = [];                 // stable array (refilled in place)
  const gateInfo = { position: new THREE.Vector3(), radius: 4.5 };
  let gateState = 'sealed';
  let fogPush = 0, gradeTimer = 0, paletteTimer = 0, pickTimer = 0;
  const lastGrade = {};
  const mood = { night: 0.18, warm: 0.1 };
  const env = { night: 0, warm: 0, fog: new THREE.Color(), fogDensity: 0.0055, glowK: 1, shaftK: 1, partK: 1, starK: 1, starDen: 1, nebK: 1 };
  const col = { fog: new THREE.Color(), nightFog: new THREE.Color(), dawnFog: new THREE.Color(), dawnMist: new THREE.Color(), a: new THREE.Color(), b: new THREE.Color() };
  // night floors (linear luminance): the darkest lakes (the Pallid Deep, Sporewood) are lifted to at
  // least this at the Gloomtide, hue kept, so the raft, the swarm's silhouettes and its eyes still read
  const NIGHT_FOG_MIN = 0.014, NIGHT_WATER_MIN = 0.014, NIGHT_DEEP_MIN = 0.002;
  const liftLum = (c, min) => { const l = c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722; if (l > 1e-6 && l < min) c.multiplyScalar(min / l); return c; };
  // Starlit moods (DESIGN §19.1): night sinks to ink-indigo with more stars; dawn is a pale gold
  // light over lavender mist with rose-lavender shadows (never orange-brown)
  const COLD = new THREE.Color(0x0b0d2e), WARM = new THREE.Color(0xf2cfa4), NIGHT_TINT = new THREE.Color(0x1e2466), DAWN_TINT = new THREE.Color(0xb898c0);
  const DAWN_MIST = new THREE.Color(0x9a92c8), GRADE_WARM = new THREE.Color(0xf4cc96), GRADE_WARM_DAWN = new THREE.Color(0xf0c8a8);
  const zc = {}; // zone colours (THREE.Color)

  // ------------------------------------------------------------------ helpers
  const zones = () => { const Z = ctx.data?.ZONES; return Array.isArray(Z) && Z.length ? Z : [FALLBACK_ZONE]; };
  function resolveZone(id) {
    const Z = zones();
    return ctx.data?.ZONE_BY_ID?.[id] || Z.find((z) => z.id === id) || Z[0];
  }
  function titleZone() {
    const Z = zones();
    const run = ctx.state?.run;
    if (run?.zone) return resolveZone(run.zone);
    const i = clamp(ctx.state?.meta?.deepestZone | 0, 0, Z.length - 1);
    return Z[i] || Z[0];
  }
  function quality() {
    const q = ctx.state?.meta?.settings?.quality || 'auto';
    if (q === 'low') return 'low';
    if (q === 'auto') return ctx.isMobile ? 'low' : 'high';
    return 'high';
  }
  const scene = () => { const s = ctx.render?.scene; return s && !s.isStub && s.isScene ? s : null; };
  function focusPos() {
    const p = ctx.player?.position;
    if (p && !ctx.player.isStub && typeof p.x === 'number' && Number.isFinite(p.x)) return p;
    return layout ? _spawnV.set(layout.spawn.x, 0, layout.spawn.z) : _spawnV.set(0, 0, 0);
  }
  const _spawnV = new THREE.Vector3();

  function refillObstacles() {
    obstacles.length = 0;
    if (!layout) return;
    for (const o of layout.obstacles) obstacles.push(o);
    if (gateState !== 'hidden') for (const o of layout.gateObstacles) obstacles.push(o);
  }

  function defaultGateState(z) {
    const Z = zones();
    const final = z && (z.gateName === null || (z.index ?? Z.indexOf(z)) >= Z.length - 1);
    if (final) return 'hidden';
    const run = ctx.state?.run;
    if (run && run.zone === z.id && run.gateOpen) return 'open';
    return 'sealed';
  }

  function setLayout(z) {
    zone = z;
    layout = buildLayout(z);
    bounds.radius = layout.R;
    gateInfo.position.set(layout.gate.x, 0, layout.gate.z);
    gateInfo.radius = layout.gate.radius;
    gateState = defaultGateState(z);
    refillObstacles();
    const p = Object.assign({}, FALLBACK_ZONE.palette, z.palette || {});
    for (const k of ['fog', 'far', 'light', 'glow', 'ambient', 'ink', 'water', 'waterDeep', 'foam', 'accent']) zc[k] = new THREE.Color(p[k]);
    zc.lamp = new THREE.Color((z.palette ? z.palette.lamp : p.lamp) ?? p.glow);   // optional cold lamp colour (island lamps, buoys, statue orbs, lit windows)
    zc.fogDensity = p.fogDensity || 0.0055;
    zc.stars = Number.isFinite(p.stars) ? p.stars : 1;
    zc.nebula = new THREE.Color(p.nebula ?? 0xd296ae);
    zc.candle = new THREE.Color(p.candle ?? p.lamp ?? p.glow);
    watchLamps = watchLampsFor(z, layout, { radius: lampRadius() });
    giantSpots = giantSpotsFor(z);
    v3Info.lamps = watchLamps.map(() => ({ k: 0, watch: 0 }));
    v3Info.moored = watchLamps.map(() => false);
  }
  const lampRadius = () => { const r = Number(ctx.data?.BALANCE?.nightModes?.lampWatch?.radius); return Number.isFinite(r) && r > 0 ? r : 6; };
  // the legend pool's tall golden column is cut in v3: world draws its low gold glimmer (feature-detected from the v3 data)
  const legendGlimmerOn = () => ctx.data?.BALANCE?.signs?.legendPool?.column === 'lowGlimmer';

  function buildVisuals() {
    const s = scene();
    if (!s || !layout) return;
    if (v3vis) { v3vis.dispose(); v3vis = null; }
    if (arena) { arena.dispose(); arena = null; }
    try {
      const watchDocks = new Set(watchLamps.filter((l) => l.kind === 'buoy' && l.dock != null).map((l) => l.dock));
      arena = buildArena(ctx, layout, { quality: quality(), far: ctx.render?.camera?.far || 500, ...(watchDocks.size ? { watchDocks } : {}) });
      group.add(arena.group);
      const v3Lamps = watchLamps.filter((l) => l.kind === 'buoy');
      const v3Legend = legendGlimmerOn() && layout.legendPool ? layout.legendPool : null;
      if (v3Lamps.length || v3Legend) {
        try {
          v3vis = buildWorldV3(ctx, layout, arena, { lamps: v3Lamps, legend: v3Legend, pal: Object.assign({}, FALLBACK_ZONE.palette, zone.palette || {}), quality: quality() });
          group.add(v3vis.group);
        } catch (e) {
          console.error('[world] v3 visuals failed', e);
          ctx.errors?.push?.(`world.v3: ${e?.message || e}`);
          v3vis = null;
        }
      }
      arena.setGate(gateState, true);
      for (const a of accents) { a.anchor = a.target = null; a.k = 0; a.light.intensity = 0; }
      pickTimer = 0; gradeTimer = 0; paletteTimer = 0;
    } catch (e) {
      console.error('[world] arena build failed', e);
      ctx.errors?.push?.(`world.build: ${e?.message || e}`);
      arena = null;
    }
  }

  function setZone(id, { instant = false, flash = true } = {}) {
    const z = typeof id === 'object' && id ? id : resolveZone(id);
    if (!z) return;
    if (zone && z.id === zone.id && arena) {
      setGateState(defaultGateState(z), true);
      return;
    }
    if (!instant && arena) {
      if (flash) ctx.render?.flash?.(0x000000, 1, 0.8);   // render already fades in from black on zone:change
      fogPush = 2.2;
    }
    setLayout(z);
    buildVisuals();
    // snap the mood so the new lake does not fade in from the old palette
    computeMood(1, true);
    applyAtmosphere(0, true);
  }

  // ------------------------------------------------------------------ mood
  function phaseInfo() {
    const s = ctx.survival;
    if (s && !s.isStub) {
      try { const p = s.getPhaseInfo?.(); if (p && typeof p.phase === 'string') return p; } catch { /* fall through */ }
    }
    const run = ctx.state?.run;
    if (!run) return null;
    const dur = ctx.data?.BALANCE?.phases?.[run.phase] || 60;
    return { phase: run.phase || 'calm', day: run.day || 1, k: clamp((run.phaseTime || 0) / dur) };
  }
  function moodTargets(out) {
    let n = 0, w = 0;
    const run = ctx.state?.run;
    if (ctx.flow === 'title' || ctx.flow === 'boot' || !run) { n = 0.16; w = 0.14; }
    else {
      const pi = phaseInfo();
      const k = clamp(Number(pi?.k) || 0);
      switch (pi?.phase) {
        case 'dusk': n = 0.12 + 0.6 * smoothstep(0, 1, k); break;
        case 'gloomtide': n = 0.72 + 0.28 * smoothstep(0, 0.15, k) - 0.12 * smoothstep(0.88, 1, k); break;
        case 'dawn': n = 0.88 * (1 - smoothstep(0, 0.9, k)); w = smoothstep(0, 0.35, k) * (0.6 + 0.35 * Math.sin(Math.PI * k)); break;
        default: n = 0.12 * smoothstep(0.82, 1, k); w = (pi?.day > 1 ? 0.6 : 0.35) * (1 - smoothstep(0, 0.08, k));
      }
      if (ctx.flow === 'dead') n = Math.max(n, 0.5);
    }
    out.night = n; out.warm = w;
    return out;
  }
  const _mt = { night: 0, warm: 0 };
  function computeMood(dt, snap = false) {
    moodTargets(_mt);
    if (snap) { mood.night = _mt.night; mood.warm = _mt.warm; }
    else { mood.night = damp(mood.night, _mt.night, 1.3, dt); mood.warm = damp(mood.warm, _mt.warm, 1.1, dt); }
  }

  function applyAtmosphere(dt, force = false) {
    if (!zone) return;
    const n = mood.night, w = mood.warm;
    // fog
    // night keeps each lake's own hue in its mist (a shared cold target made every Gloomtide the
    // same blue-black) and a little more light, so ink silhouettes still read on the water
    liftLum(col.nightFog.copy(zc.fog).multiplyScalar(0.38).lerp(COLD, 0.22), NIGHT_FOG_MIN);
    // dawn mist leans to each lake's own far colour, so the dawns differ as much as the nights
    col.dawnMist.copy(DAWN_MIST).lerp(zc.far, 0.5);
    col.dawnFog.copy(zc.fog).lerp(col.dawnMist, 0.22).lerp(WARM, 0.06).multiplyScalar(1.1);
    col.fog.copy(zc.fog).lerp(col.nightFog, n).lerp(col.dawnFog, w * 0.55);
    fogPush = Math.max(0, fogPush - dt * 1.4);
    const density = zc.fogDensity * (1 + FOG_NIGHT * n + FOG_DAWN * w) * (1 + fogPush);
    env.night = n; env.warm = w; env.fog.copy(col.fog); env.fogDensity = density;
    // the air: clear by day and night, a low mist only at dawn (world-fx.js AIR scales the art file's own amounts)
    AIR.mist.value = Math.max(0, AIR_MIST[0] + AIR_MIST[1] * n + AIR_MIST[2] * w);
    AIR.sheets.value = Math.max(0, AIR_SHEETS[0] + AIR_SHEETS[1] * n + AIR_SHEETS[2] * w);
    AIR.shafts.value = AIR_SHAFTS; AIR.pools.value = AIR_POOLS; AIR.ringHaze.value = AIR_RING_HAZE;
    const isTitle = ctx.flow === 'title' || !ctx.state?.run;
    env.glowK = (1 - 0.42 * n) * (isTitle ? 1.1 : 1);
    env.shaftK = (1 - 0.9 * n) * (1 + 0.35 * w) * (isTitle ? 1.2 : 1);
    env.partK = 1 - 0.55 * n;   // drifting motes thin out at night: the eyes and the stars own the dark
    // starlight: brighter and denser as the night deepens, fading out into the dawn
    const stars = Number.isFinite(zc.stars) ? zc.stars : 1;
    env.starK = stars * (0.8 + 0.6 * n) * (1 - 0.7 * w) * (isTitle ? 1.1 : 1);
    env.starDen = (0.65 + 0.35 * stars) * (1 + 0.28 * n) * (1 - 0.3 * w) * STAR_DENSITY;
    env.nebK = (0.6 + 0.25 * n) * (1 - 0.55 * w) * NEBULA_K;
    const s = scene();
    if (s) {
      if (!s.fog) s.fog = new THREE.FogExp2(col.fog.getHex(), density);
      s.fog.color?.copy(col.fog);
      if ('density' in s.fog) s.fog.density = density;
    }
    // lights
    applyKeyLight(n, w, zc, focusPos());   // CLARITY LANE B: key light
    arena?.applyMood(env);
    // grade (throttled; render eases between targets)
    gradeTimer -= dt; paletteTimer -= dt;
    if (force || gradeTimer <= 0) { gradeTimer = 0.25; sendGrade(force); }
    if (force || paletteTimer <= 0) { paletteTimer = 0.3; sendPalette(); }
  }

  function sendGrade(force) {
    const g = zone?.grade || {};
    const n = mood.night, w = mood.warm;
    // night keeps most of the lake's own tint (only a third goes to the shared night indigo), so the
    // lakes stay apart by hue at the Gloomtide, not only by brightness
    // dawn warms the highlights (warm split-tone) more than the shadows: shadows that go orange read
    // as mud on slate water, cool shadows under warm light read as a pearl dawn
    col.a.set(g.tint ?? 0x40347e).lerp(NIGHT_TINT, n * 0.35).lerp(DAWN_TINT, w * 0.2);
    // Clear Night (DESIGN §19.1 "The lens"): the night no longer adds bloom (only emitters bloom, at any hour), darkens the
    // exposure and the saturation a little less, and barely deepens the vignette or the grain
    const grade = {
      exposure: (g.exposure ?? 1) * (1 - 0.11 * n + 0.1 * w),
      bloomStrength: (g.bloomStrength ?? 0.42) * (1 + 0.05 * w),
      bloomRadius: g.bloomRadius ?? 0.30,
      bloomThreshold: g.bloomThreshold ?? 0.92,
      tint: col.a.getHex(),
      tintAmount: (g.tintAmount ?? 0.18) + (0.28 - (g.tintAmount ?? 0.18)) * n,
      // night deepens the vignette a little, capped so the darkest lake's frame edges stay open
      vignette: Math.min(Math.max(g.vignette ?? 0.24, 0.40), (g.vignette ?? 0.24) + 0.08 * n),
      saturation: (g.saturation ?? 0.9) * (1 - 0.06 * n + 0.08 * w),
      // the dawn is the one soft hour: a little more contrast holds its darks down, so the pale light is not a veil
      contrast: (g.contrast ?? 1.08) + 0.09 * w,
      grain: (g.grain ?? 0.012) + 0.004 * n,
      // a light warm split-tone: the lantern owns warmth; stars, foam and pale stone stay cool-white
      warmAmount: (g.warmAmount ?? 0.07) + 0.16 * w,
      warm: col.b.copy(GRADE_WARM).lerp(GRADE_WARM_DAWN, w).getHex(),
    };
    let changed = force;
    for (const k in grade) if (!changed && Math.abs((lastGrade[k] ?? -99) - grade[k]) > (k === 'tint' || k === 'warm' ? 0 : 0.004)) changed = true;
    if (!changed) return;
    Object.assign(lastGrade, grade);
    try { ctx.render?.setGrade?.(grade); } catch (e) { /* optional */ }
  }

  const skyCol = { star: new THREE.Color(), neb: new THREE.Color(), nebV: new THREE.Color() };
  function sendPalette() {
    const n = mood.night;
    // night water stays a deep version of the lake's own colour (not one shared blue-black), light
    // enough that an ink-black gloomling still reads as a silhouette on it
    liftLum(col.a.copy(zc.waterDeep).multiplyScalar(1 - 0.42 * n), NIGHT_DEEP_MIN * n);
    liftLum(col.b.copy(zc.water).lerp(COLD, 0.12 * n).multiplyScalar(1 - 0.34 * n), NIGHT_WATER_MIN * n).lerp(col.dawnMist, mood.warm * 0.06);
    try {
      ctx.water?.setPalette?.({ deep: col.a.getHex(), shallow: col.b.getHex(), foam: zc.foam.getHex(), glow: zc.glow.getHex(), fogColor: env.fog.getHex() });
    } catch (e) { /* optional */ }
    // the lake mirrors the vault's stars and nebula (same directions as the dome, DESIGN §19.1)
    try {
      if (arena?.sky && typeof ctx.water?.setSky === 'function') {
        skyCol.star.copy(zc.light).lerp(col.b.setRGB(0.86, 0.87, 1), 0.5);
        skyCol.neb.copy(zc.nebula);
        skyCol.nebV.copy(zc.far).lerp(zc.nebula, 0.25).multiplyScalar(0.55);
        // the water's night stars brighten less than the vault's, so gloomling eyes stay the brightest specks on it
        // and the lakes' water starlight differs less than their skies' (√stars): Glasswater's water does not
        // turn to glitter, the Pallid Deep's still shows a few
        const ws = Math.sqrt(Math.max(0.3, Number.isFinite(zc.stars) ? zc.stars : 1));
        // at night the water's stars thin out (the vault's grow denser): a reflected sky, not a snowfall
        // the eyes of the swarm have to compete with
        ctx.water.setSky({ stars: env.starK / ws * (1 - 0.32 * mood.night), density: env.starDen * (1 - 0.38 * mood.night), color: skyCol.star, nebula: skyCol.neb, nebulaVeil: skyCol.nebV, nebulaK: env.nebK, neb1: arena.sky.neb1, neb2: arena.sky.neb2, band: arena.sky.band });
      }
    } catch (e) { /* optional */ }
  }

  // ------------------------------------------------------------------ accent + water lights
  const _best = [null, null];
  function pickAnchors(focus) {
    _best[0] = _best[1] = null;
    let s0 = 0, s1 = 0;
    for (const a of arena.anchors) {
      if (a.intensity <= 0) continue;
      const dx = a.x - focus.x, dz = a.z - focus.z;
      const sc = (a.intensity * (a.gate ? 2 : 1)) / (1 + (dx * dx + dz * dz) / 260);
      if (sc > s0) { s1 = s0; _best[1] = _best[0]; s0 = sc; _best[0] = a; }
      else if (sc > s1) { s1 = sc; _best[1] = a; }
    }
    // keep anchors in their current slot when still chosen (no needless cross-fades)
    if (accents[0].anchor === _best[1] || accents[1].anchor === _best[0]) { const t = _best[0]; _best[0] = _best[1]; _best[1] = t; }
    accents[0].target = _best[0]; accents[1].target = _best[1];
  }
  function updateAccents(dt) {
    for (const s of accents) {
      if (s.anchor !== s.target) {
        s.k -= dt * 2.6;
        if (s.k <= 0) { s.k = 0; s.anchor = s.target; if (s.anchor) s.light.position.set(s.anchor.x, s.anchor.y, s.anchor.z); }
      } else if (s.anchor) s.k = Math.min(1, s.k + dt * 1.4);
      const a = s.anchor;
      if (a) {
        s.light.color.copy(a.color);
        s.light.distance = a.distance;
        s.light.intensity = a.intensity * a.boost * s.k * env.glowK;
      } else s.light.intensity = 0;
    }
  }

  const wl = [];
  for (let i = 0; i < 6; i++) wl.push({ position: new THREE.Vector3(), color: new THREE.Color(), intensity: 0, distance: 12, radius: undefined, ring: 0, streak: 1 });
  const waterLights = [];
  const MERCHANT_LAMP = new THREE.Color(0xa6d4a0);   // the one deliberate green trace: Murk's sage lamp
  function updateWaterLights() {
    waterLights.length = 0;
    for (const s of wl) { s.streak = 1; s.radius = undefined; s.ring = 0; }   // slots are reused: no stale lantern radius/ring on another light
    let i = 0;
    const lan = ctx.actors?.lanternLight;
    if (lan && !ctx.actors.isStub && lan.isLight) {
      const s = wl[i++];
      lan.getWorldPosition(s.position);
      s.color.copy(lan.color); s.intensity = lan.intensity; s.distance = lan.distance || 14;
      // the water's lit pool follows the gameplay light radius, not the PointLight falloff (no reach ring)
      const lr = ctx.survival && !ctx.survival.isStub ? Number(ctx.survival.lightRadius) : NaN;
      s.radius = Number.isFinite(lr) && lr > 0 ? lr : undefined; s.ring = 0;
      waterLights.push(s);
    }
    const m = ctx.actors?.merchant;
    if (m && !ctx.actors.isStub && m.present === true && m.position && typeof m.position.x === 'number') {
      const s = wl[i++];
      s.position.set(m.position.x, (m.position.y || 0) + 2.2, m.position.z);
      // a pinpoint, not a column: half the reflection streak and a dimmer pool than other lights
      s.color.copy(MERCHANT_LAMP); s.intensity = 1.5 * env.glowK; s.distance = 8; s.streak = 0.45;
      waterLights.push(s);
    }
    if (arena) {
      const g = arena.gateAnchor;
      if (g && g.intensity > 0.05) { const s = wl[i++]; s.position.set(g.x, g.y, g.z); s.color.copy(g.color); s.intensity = g.intensity * env.glowK; s.distance = g.distance; waterLights.push(s); }
      for (const a of accents) {
        if (i >= 6) break;
        if (!a.anchor || a.anchor.gate || a.k <= 0.01) continue;
        const s = wl[i++];
        s.position.set(a.anchor.x, a.anchor.y, a.anchor.z); s.color.copy(a.anchor.color);
        s.intensity = a.anchor.intensity * a.k * env.glowK; s.distance = a.anchor.distance;
        s.streak = 0.7;   // a candle's column on the water stays a gold thread, never a white pillar
        waterLights.push(s);
      }
    }
    try { ctx.water?.setLights?.(waterLights); } catch (e) { /* optional */ }
  }

  // dock buoys brighten when Old Murk is moored there
  function updateDocks() {
    if (!arena?.dockBuoys || !layout) return;
    const m = ctx.actors?.merchant;
    const here = m && !ctx.actors.isStub && m.present === true && m.position;
    for (let i = 0; i < layout.docks.length; i++) {
      const d = layout.docks[i], f = arena.dockBuoys[i];
      if (!f || f.halo < 0) continue;
      const moored = here && Math.hypot(m.position.x - d.x, m.position.z - d.z) < 4;
      if (f.watch) { const li = watchLamps.findIndex((l) => l.dock === i); if (li >= 0) v3Info.moored[li] = !!moored; continue; }   // world-v3 colours the watch-lamps
      const k = moored ? 1.6 : 0.8;
      const c = zc.lamp || zc.glow;
      arena.halos.setColor(f.halo, c.r * k, c.g * k, c.b * k);
    }
    arena.halos.touchColors();
  }

  // ------------------------------------------------------------------ v3 (W1): watch-lamps and the legend pool
  const peek = (fn, fb = null) => { try { const v = fn(); return v === undefined || (v && v.isStub) ? fb : v; } catch { return fb; } };
  /** The lake's watch-lamps; a §24 sister-candle's pool exists only while it is lit (progression.isLampLit). */
  function getWatchLamps() {
    for (const l of watchLamps) {
      if (l.kind !== 'candle') continue;
      const src = (zone?.arena?.lamps || []).find((q) => q.id === l.id);
      l.lit = src?.lit === true || peek(() => ctx.progression?.isLampLit?.(l.id)) === true;
    }
    return watchLamps;
  }
  /** What the v3 visuals show this frame (render-only reads: night mode, phase, the lamp-watch, the legend pool's state). */
  function updateV3(dt, t) {
    const run = ctx.state?.run;
    const pi = phaseInfo();
    const phase = pi?.phase || 'calm', k = clamp(Number(pi?.k) || 0);
    let mode = peek(() => ctx.combat?.nightMode) ?? run?.nightMode ?? null;
    if (run?.outing === 'first') mode = 'still';
    const LW = ctx.data?.BALANCE?.nightModes?.lampWatch;
    const watchMode = !!run && run.outing !== 'descent' && (Array.isArray(LW?.modes) ? LW.modes : ['lantern']).includes(mode);
    const swarm = watchMode && peek(() => ctx.combat?.swarmTonight, false) === true;
    // the lamps call you in a lamp-watch mode on a swarm night: from Murk's 85 % bell, through dusk, and all that night
    const bell = Number.isFinite(LW?.hudFromMurkBell) ? LW.hudFromMurkBell : 0.85;
    const calling = swarm && ((phase === 'calm' && k >= bell) || phase === 'dusk' || phase === 'gloomtide');
    const lw = peek(() => ctx.survival?.lampWatch) ?? run?.lampWatch ?? null;
    const n = env.night;
    for (let i = 0; i < watchLamps.length; i++) {
      const l = watchLamps[i], o = v3Info.lamps[i];
      const watching = !!lw && !lw.forced && lw.lampId != null && lw.lampId === l.id;
      const base = l.lit === false ? 0 : 0.34 + 0.62 * n;
      o.k = Math.min(1.6, base * (calling ? 1.3 : 1) * (watching ? 1.3 : 1));
      o.watch = watching ? 1 : 0;
    }
    // the legend pool: a faint glimmer always; it brightens while the legend is listening (fishing.legendPool.active),
    // dims while spooked and all but goes out once this run has landed the lake's legend
    let legendK = 0;
    if (v3vis?.legend) {
      const lp = peek(() => ctx.fishing?.legendPool);
      const legId = zone?.legendary;
      const landed = !!(legId && run?.legendaries?.[legId]);
      legendK = (landed ? 0.14 : lp?.active ? 1 : lp?.dim ? 0.25 : 0.55) * (0.85 + 0.3 * n);
    }
    v3Info.night = n; v3Info.fogDensity = env.fogDensity; v3Info.legendK = legendK;
    v3vis.update(dt, t, v3Info);
  }

  // ------------------------------------------------------------------ gameplay queries
  const shoreR = (a) => (layout ? layout.shoreR(a) : bounds.radius);
  function isOpenWater(x, z, radius = 1) {
    if (!layout) return Math.hypot(x, z) <= bounds.radius - radius;
    return isOpenWaterL(layout, obstacles, x, z, radius);
  }
  function getDepth(x, z) {
    if (!layout) return clamp(1 - Math.hypot(x, z) / bounds.radius);
    return depthAt(layout, x, z);
  }
  function collide(p, radius = 1) {
    if (!p) return p;
    const r = radius ?? 1;
    for (let it = 0; it < 2; it++) {
      for (let i = 0; i < obstacles.length; i++) {
        const o = obstacles[i];
        const dx = p.x - o.x, dz = p.z - o.z, m = o.r + r;
        const d2 = dx * dx + dz * dz;
        if (d2 < m * m) {
          const d = Math.sqrt(d2);
          if (d > 1e-5) { p.x = o.x + (dx / d) * m; p.z = o.z + (dz / d) * m; }
          else { p.x = o.x + m; }
        }
      }
      const d = Math.hypot(p.x, p.z);
      const lim = shoreR(Math.atan2(p.z, p.x)) - r;
      if (d > lim && d > 1e-5) { const k = Math.max(0, lim) / d; p.x *= k; p.z *= k; }
    }
    return p;
  }
  function randomWaterPoint({ from = null, minDist = 0, maxDist = Infinity, depthMin = 0, depthMax = 1, clearance = 1 } = {}) {
    const R = bounds.radius;
    let best = null, bestPen = Infinity;
    const lo = Math.max(0, minDist || 0);
    for (let i = 0; i < 90; i++) {
      let x, z;
      const a = Math.random() * TAU;
      if (from && typeof from.x === 'number') {
        const hi = Math.max(lo + 0.01, Math.min(maxDist ?? Infinity, R * 2.2));
        const d = Math.sqrt(lo * lo + Math.random() * (hi * hi - lo * lo));
        x = from.x + Math.cos(a) * d; z = from.z + Math.sin(a) * d;
      } else {
        const d = Math.sqrt(Math.random()) * R;
        x = Math.cos(a) * d; z = Math.sin(a) * d;
      }
      if (!isOpenWater(x, z, clearance)) continue;
      const dep = getDepth(x, z);
      let pen = dep < depthMin ? depthMin - dep : dep > depthMax ? dep - depthMax : 0;
      if (from && typeof from.x === 'number') {
        const dd = Math.hypot(x - from.x, z - from.z);
        pen += (dd < lo ? (lo - dd) / 10 : 0) + (dd > maxDist ? (dd - maxDist) / 10 : 0);
      }
      if (pen === 0) return new THREE.Vector3(x, 0, z);
      if (pen < bestPen) { bestPen = pen; best = new THREE.Vector3(x, 0, z); }
    }
    if (best) return best;
    // last resort: walk out from the spawn until open
    const s = layout?.spawn || { x: 0, z: 0 };
    return new THREE.Vector3(s.x, 0, s.z);
  }
  function getSpawn() {
    const s = layout?.spawn || { x: 0, z: 8, yaw: 0 };
    return { position: new THREE.Vector3(s.x, 0, s.z), yaw: s.yaw || 0 };
  }
  function getMerchantDock(day = 1) {
    const docks = layout?.docks;
    if (!docks?.length) { const a = (day | 0) * 2.1; return { position: new THREE.Vector3(Math.cos(a) * 25, 0, Math.sin(a) * 25), yaw: 0 }; }
    // DESIGN §4.6: day 1 = docks[0]; then (seed + 2·day) % n, never yesterday's dock again
    const n = docks.length, seed = (layout.seed | 0) >>> 0;
    let i = 0;
    for (let dd = 2; dd <= Math.max(1, day | 0); dd++) {
      let j = (seed + 2 * dd) % n;
      if (j === i && n > 1) j = (j + 1) % n;
      i = j;
    }
    const d = docks[i];
    return { position: new THREE.Vector3(d.x, 0, d.z), yaw: d.yaw };
  }
  function setGateState(state, instant = false) {
    if (!GATE_STATES.has(state)) return;
    const prev = gateState;
    if (prev === state && !instant) return;
    gateState = state;
    if (prev !== state) refillObstacles();
    if (!arena) return;
    arena.setGate(state, instant);
    if (!instant && prev !== 'open' && state === 'open' && ctx.flow === 'playing') {
      ctx.render?.shake?.(0.22, 0.7);
      ctx.render?.flash?.(zc.glow ? zc.glow.getHex() : 0xffffff, 0.25, 0.7);
    }
  }

  // initial layout (pure data) so queries work before init
  setLayout(titleZone());

  // ------------------------------------------------------------------ module API
  return {
    group,
    get bounds() { return bounds; },
    init() {
      const s = scene();
      if (s) s.add(group);
      ctx.bus.on('zone:change', ({ zone: z } = {}) => { if (z) setZone(z, { instant: !arena, flash: !(ctx.render && !ctx.render.isStub) }); });
      ctx.bus.on('gate:open', () => { if (defaultGateState(zone) !== 'hidden') setGateState('open'); });
      ctx.bus.on('run:start', () => { if (zone) setGateState(defaultGateState(zone), true); });
      buildVisuals();
      computeMood(1, true);
      applyAtmosphere(0, true);
      // v3 debug hooks (CONTRACT §13.11): world giantSpots(), plus the watch-lamps and the v3 visuals at a glance
      if (ctx.debug && typeof ctx.debug === 'object' && ctx.data?.BALANCE?.nightModes) {
        Object.assign(ctx.debug, {
          giantSpots: () => giantSpots.map((g) => ({ ...g, r: Array.isArray(g.r) ? g.r.slice() : g.r })),
          watchLamps: () => getWatchLamps().map((l) => ({ id: l.id, name: l.name, x: +l.x.toFixed(2), z: +l.z.toFixed(2), radius: l.radius, lit: l.lit, dock: l.dock, kind: l.kind })),
          worldV3: () => ({ zone: zone?.id ?? null, lamps: watchLamps.length, giantSpots: giantSpots.length, visuals: v3vis?.stats?.() ?? null,
            lampK: v3vis ? v3vis.lamps.map((s) => +s.k.toFixed(3)) : [], legendK: v3vis?.legend ? +v3vis.legend.k.toFixed(3) : null }),
        });
      }
    },
    update(dt, t) {
      if (!zone) return;
      const d = Math.min(0.1, dt || 0);
      computeMood(d);
      applyAtmosphere(d);
      if (!arena) return;
      const focus = focusPos();
      arena.update(d, t || 0, focus, env);
      pickTimer -= d;
      if (pickTimer <= 0) { pickTimer = 0.3; pickAnchors(focus); updateDocks(); }
      if (v3vis) { try { updateV3(d, t || 0); } catch (e) { ctx.errors?.push?.(`world.v3: ${e?.message || e}`); v3vis?.dispose(); v3vis = null; } }
      updateAccents(d);
      updateWaterLights();
    },
    setZone,
    getZone: () => zone,
    getSpawn,
    getDepth,
    collide,
    isOpenWater,
    randomWaterPoint,
    getMerchantDock,
    getGate: () => gateInfo,
    setGateState,
    getGateState: () => gateState,
    getObstacles: () => obstacles,
    // ---- v3 (CONTRACT §13.7 world; empty arrays in a flag-off build)
    /** The lake's two watch-lamps [{id, name, position, x, z, radius, lit, dock, kind}] (the same array each call). */
    getWatchLamps,
    /** The stopgap's holdsGiants water [{id, kind: 'ring'|'disc', x, z, r}] in a lake whose places are not in the build. */
    getGiantSpots: () => giantSpots,
    // ---- optional extras (not in CONTRACT; safe to ignore)
    getShoreRadius: (angle) => shoreR(angle),
    getDocks: () => (layout?.docks || []).map((d) => ({ position: new THREE.Vector3(d.x, 0, d.z), yaw: d.yaw })),
    getMood: () => mood,
    getLightShafts: () => (layout?.cracks || []).map((c) => ({ x: c.x, z: c.z })),
    debugInfo: () => ({ zone: zone?.id, radius: bounds.radius, obstacles: obstacles.length, gate: gateState, mood: { ...mood }, arena: arena?.stats?.() }),
  };
}
