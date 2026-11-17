// world.js — the four cavern-lake arenas and their atmosphere (world author).
// CONTRACT §7 world. Deterministic layout per zone (world-layout.js), hand-inked arena
// art (world-art.js), and a phase-driven mood that owns fog, lights, grade, water
// palette and water lights. Gameplay queries (depth, collision, open water...) are pure
// functions of the layout and work before init and between runs.
import * as THREE from 'three';
import { clamp, damp, smoothstep, TAU } from './core.js';
import { buildLayout, depthAt, isOpenWaterL, notchFrame, notchHalfW, notchShoreR, shoreDist } from './world-layout.js';
import { buildArena } from './world-art.js';
import { AIR } from './world-fx.js';
import { watchLampsFor, giantSpotsFor, buildWorldV3 } from './world-v3.js';
import { buildPlaces } from './world-places.js';
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
  // the loop (M1 step 3a, PLAN §2.4): the places' banks and dressing (world-places.js), built only when LOOP_ENABLED for a lake that
  // has loop places; placeState is what main last said ({owned, lifted}), re-applied whenever the arena is rebuilt
  let placesVis = null;
  const placeState = { owned: [], lifted: [] };
  const loopOn = () => ctx.data?.LOOP_ENABLED === true;
  function loopPlacesFor(z) {
    if (!loopOn() || typeof ctx.data?.loopPlaceIds !== 'function' || typeof ctx.data?.loopPlace !== 'function') return [];
    try { return ctx.data.loopPlaceIds(z?.id).map((id) => ctx.data.loopPlace(id)).filter((p) => p && p.area); } catch { return []; }
  }
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
  // the mist banks' low layer set: the low and medium render tiers and any phone (the high tier on desktop keeps its five layers)
  function liteMist() {
    if (ctx.isMobile || quality() === 'low') return true;
    let t = null;
    try { t = ctx.render?.getQuality?.(); } catch { t = null; }
    return t === 'low' || t === 'medium';
  }
  const scene = () => { const s = ctx.render?.scene; return s && !s.isStub && s.isScene ? s : null; };
  function focusPos() {
    const p = ctx.player?.position;
    if (p && !ctx.player.isStub && typeof p.x === 'number' && Number.isFinite(p.x)) return p;
    return layout ? _spawnV.set(layout.spawn.x, 0, layout.spawn.z) : _spawnV.set(0, 0, 0);
  }
  const _spawnV = new THREE.Vector3();
  /** The raft's position, or null (no player yet): the banks thin only for a real raft inside them. */
  function raftPos() {
    const p = ctx.player?.position;
    return p && !ctx.player.isStub && typeof p.x === 'number' && Number.isFinite(p.x) ? p : null;
  }

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

  // the loop's home barge (M1 step 5a, SPEC §6.5): the water's mooring on its docks, and the hulls' keel circles in the lake's
  // obstacles (the raft's collision, the water's foam and the validator read them); off the loop there is none
  let mooring = null;
  function setLayout(z) {
    zone = z;
    layout = buildLayout(z);
    if (layout.notch?.place) layout.notch.open = placeState.owned.includes(layout.notch.place);   // (LOST-TACKLE §5.2: the cut opens with its place)
    mooring = ctx.data?.LOOP_ENABLED === true && typeof ctx.data.loopMooring === 'function' ? ctx.data.loopMooring(z.id, layout.docks) : null;
    if (mooring) {
      // the Jetty's two mooring posts were Murk's old berth: with the barge moored there they go (their circles and their art)
      const d = layout.docks[mooring.dock], posts = Array.isArray(d?.posts) ? d.posts : [];
      if (posts.length) {
        const at = (o) => posts.some((p) => Math.abs(p.x - o.x) < 1e-9 && Math.abs(p.z - o.z) < 1e-9);
        for (let i = layout.obstacles.length - 1; i >= 0; i--) if (layout.obstacles[i].kind === 'post' && at(layout.obstacles[i])) layout.obstacles.splice(i, 1);
        d.posts = [];
      }
      for (const c of mooring.circles) layout.obstacles.push({ x: c.x, z: c.z, r: c.r, kind: c.kind });
    }
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
      // (M1 step 3a: W9's rest behind LOOP.redress, on in the loop since the user's yes of 17 Nov 2026: the bollards replace the lamp-posts in the arena's own statics)
      const redress = loopOn() && ctx.data?.LOOP?.redress === true;
      arena = buildArena(ctx, layout, { quality: quality(), far: ctx.render?.camera?.far || 500, ...(watchDocks.size ? { watchDocks } : {}), ...(redress ? { redress: true } : {}), ...(loopOn() ? { loop: true } : {}) });
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
      if (placesVis) { placesVis.dispose(); placesVis = null; }
      const lp = loopPlacesFor(zone);
      if (lp.length) {
        try {
          placesVis = buildPlaces(ctx, layout, arena, { places: lp, pal: Object.assign({}, FALLBACK_ZONE.palette, zone.palette || {}), quality: quality(),
            mist: ctx.data?.LOOP?.mist, giantBack: ctx.data?.LOOP?.giantBack, redress: ctx.data?.LOOP?.redress === true, hero: getHeroAnchor(),
            liteMist: liteMist() });
          group.add(placesVis.group);
          placesVis.setPlaces(placeState);
        } catch (e) {
          console.error('[world] places failed', e);
          ctx.errors?.push?.(`world.places: ${e?.message || e}`);
          placesVis = null;
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
  // >>> INTRO LANE A: stage hooks (the opening cut scene, docs/v3/intro/SPEC.md §6; inert until the stage calls them)
  // setIntroMood(true): the world wears the first run's opening mood (day 1, calm, k 0) whatever the flow, so the film's last
  // shot is lit exactly as the run that follows it. setIntroWaterLight({x, y, z, color, intensity, radius, streak} | null): one
  // more light for the water (the great lantern's pool and gold path, on every tier). getHeroAnchor(): where the lake's hero
  // landmark stands (the Mossmere: the Sunken Gate), as world-art places it.
  let introMood = false, introLight = null;
  const INTRO_MOOD = { night: 0, warm: 0.35 };
  function getHeroAnchor() {
    if (!layout) return null;
    const ga = Math.hypot(layout.gate.x, layout.gate.z) < layout.R * 0.2 ? -Math.PI / 2 : Math.atan2(layout.gate.z, layout.gate.x);
    const r = layout.shoreR(ga) + 16;
    const x = Math.cos(ga) * r, z = Math.sin(ga) * r;
    return { x, z, face: Math.atan2(-x, -z), theme: layout.theme, zone: zone?.id ?? null };
  }
  // <<< INTRO LANE A

  function moodTargets(out) {
    let n = 0, w = 0;
    const run = ctx.state?.run;
    if (introMood) { n = INTRO_MOOD.night; w = INTRO_MOOD.warm; }   // INTRO LANE A
    // the loop's Jetty (slice-1a PLAN §2.2 item 16, CHOICE 7): the built dawn look at its midpoint, "the sky pales to dawn"
    else if (ctx.data?.LOOP_ENABLED === true && ctx.flow === 'home') { n = 0.88 * (1 - smoothstep(0, 0.9, 0.5)); w = 0.6; }
    else if (ctx.flow === 'title' || ctx.flow === 'boot' || !run) { n = 0.16; w = 0.14; }
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
    const isTitle = (ctx.flow === 'title' || !ctx.state?.run) && !introMood && !(ctx.data?.LOOP_ENABLED === true && ctx.flow === 'home');   // (INTRO LANE A: the cut scene wears the run's mood; the loop's home is no title)
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
      // (the integration's fix: on the Mossmere under the loop the lantern lays its warm pool and no glitter path, whose gold flecks
      // strung toward the lens through every haul; its true image stays in the mirror: "no glitter on the water")
      if (ctx.data?.LOOP_ENABLED === true && zone?.id === 'mossmere') s.streak = 0;
      waterLights.push(s);
    }
    // >>> INTRO LANE A: stage hooks (the great lantern's light on the water)
    if (introLight && introLight.intensity > 0.001) {
      const s = wl[i++];
      s.position.set(introLight.x, introLight.y, introLight.z);
      s.color.set(introLight.color ?? 0xed9e3b); s.intensity = introLight.intensity; s.distance = introLight.radius;
      s.radius = introLight.radius; s.streak = introLight.streak ?? 1;
      waterLights.push(s);
    }
    // <<< INTRO LANE A
    const m = ctx.actors?.merchant;
    if (m && !ctx.actors.isStub && m.present === true && m.position && typeof m.position.x === 'number') {
      const s = wl[i++];
      s.position.set(m.position.x, (m.position.y || 0) + 2.2, m.position.z);
      // a pinpoint, not a column: half the reflection streak and a dimmer pool than other lights
      s.color.copy(MERCHANT_LAMP); s.intensity = 1.5 * env.glowK; s.distance = 8; s.streak = 0.45;
      waterLights.push(s);
    }
    // the loop's home barge (M1 step 5a): its windows' warm streak on the water (emissive only: no PointLight, no pool's edge)
    const hl = ctx.actors?.home?.waterLight;
    if (hl && !ctx.actors.isStub && hl.intensity > 0.01 && i < wl.length) {
      const s = wl[i++];
      s.position.copy(hl.position); s.color.copy(hl.color); s.intensity = hl.intensity * env.glowK; s.distance = hl.distance; s.streak = hl.streak; s.radius = hl.radius;
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
  /** The lake's lit things as the wildlife's moths read them (actors-wildlife.js): the bollards' and lamp-posts' lanterns, the dock
   *  buoy-lamps (the watch-lamps at their own level), the gate towers' low slits and the Buoy Lights' caps while they burn.
   *  → [{key, kind, x, y, z, k}] (k 0..1+: how lit; the same objects each call, re-read in place) */
  let lampSpots = null, lampArena = null;
  function getLampSpots() {
    if (!arena) return [];
    if (lampArena !== arena) {
      lampArena = arena; lampSpots = [];
      const red = arena.redress === true;
      (arena.lampPosts || []).forEach((p, i) => { if (p.light !== false) lampSpots.push({ key: `post${i}`, kind: 'post', x: p.x + Math.cos(-p.ry) * (red ? 0.68 : 0.75), y: p.y + (red ? 2.4 : p.h - 0.35), z: p.z + Math.sin(-p.ry) * (red ? 0.68 : 0.75), k: 1 }); });
      (arena.dockBuoys || []).forEach((f, i) => lampSpots.push({ key: `buoy${i}`, kind: 'buoy', x: f.x, y: 1.0 * (f.s || 1), z: f.z, k: 1, dock: i, watch: !!f.watch }));
      (arena.slits || []).forEach((q, i) => lampSpots.push({ key: `slit${i}`, kind: 'slit', x: q.x, y: q.y, z: q.z, k: 1 }));
    }
    for (const l of lampSpots) if (l.watch) { const li = watchLamps.findIndex((w) => w.dock === l.dock); l.k = li >= 0 ? Math.min(1, Number(v3Info.lamps[li]?.k) || 0) : 1; }
    let caps = [];
    try { caps = placesVis?.lamps?.() || []; } catch { caps = []; }
    return caps.length ? lampSpots.concat(caps) : lampSpots;
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
      // the loop (M1 step 3a): her pool's gold glimmer waits under its standing bank and through its lift (the motes washed the bell out of
      // the lift's shot; the fix pass); placesVis is built only under the loop, so the flag-off glimmer is as built
      if (placesVis && layout?.legendPool && !placesVis.openAt(layout.legendPool.x, layout.legendPool.z)) legendK = 0;
    }
    v3Info.night = n; v3Info.fogDensity = env.fogDensity; v3Info.legendK = legendK;
    v3vis.update(dt, t, v3Info);
  }

  // ------------------------------------------------------------------ gameplay queries
  // (an open cut behind the shore, LOST-TACKLE §5.3: the radial readers see its water to its first bank)
  const shoreR = (a) => (layout ? (layout.notch?.open ? notchShoreR(layout.notch, a, layout.shoreR(a)) : layout.shoreR(a)) : bounds.radius);
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
      if (layout?.notch?.open && collideNotch(layout.notch, p, r)) continue;
      const d = Math.hypot(p.x, p.z);
      const lim = (layout ? layout.shoreR(Math.atan2(p.z, p.x)) : bounds.radius) - r;
      if (d > lim && d > 1e-5) { const k = Math.max(0, lim) / d; p.x *= k; p.z *= k; }
    }
    return p;
  }
  /** An open cut's banks (LOST-TACKLE §5.3): a point behind the lake's shore inside the cut is held off its banks and its head; one at its
   *  mouth is held off the mouth's two corners. → true when the cut took the point (the lake's shore is then not applied). */
  function collideNotch(N, p, r) {
    const f = notchFrame(N, p.x, p.z), hw0 = notchHalfW(N, 0);
    if (f.along < N.r0 - r - 0.5 || Math.abs(f.lc) > Math.max(hw0, notchHalfW(N, f.t)) + 0.5) return false;
    if (f.along <= N.r0 && Math.abs(f.lc) > hw0 - 0.05) return false;   // (beside the mouth: the lake's shore)
    let along = f.along, lc = f.lc;
    if (along > N.r0) {
      const lim = Math.max(0, notchHalfW(N, f.t) - r);
      lc = Math.max(-lim, Math.min(lim, lc));
      along = Math.min(along, N.end - r);
    }
    for (const s of [-1, 1]) {   // the mouth's corners
      const dA = along - N.r0, dL = lc - s * hw0, d = Math.hypot(dA, dL);
      if (d < r && d > 1e-6) { along = N.r0 + (dA / d) * r; lc = s * hw0 + (dL / d) * r; }
    }
    const t = Math.max(0, Math.min(1, (along - N.r0) / Math.max(1, N.end - N.r0))), lat = lc + 0.7 * Math.sin(Math.PI * t) * (t > 0 ? 1 : 0);
    p.x = along * N.ca - lat * N.sa; p.z = along * N.sa + lat * N.ca;
    return true;
  }
  /** The camera's yaw down an open cut while the raft is in it (LOST-TACKLE §5.3: a hidden stream is filmed along its length, its banks
   *  either side; the play camera's north view would stand behind its south bank). `approach`: the Sail's glide in (it counts from 18 m
   *  before the mouth). → a yaw, or null (the play's own). */
  let inNotch = false;
  function viewYaw(x, z, approach = false) {
    const N = layout?.notch;
    if (!N?.open || !Number.isFinite(x) || !Number.isFinite(z)) { inNotch = false; return null; }
    const f = notchFrame(N, x, z), wide = Math.abs(f.lc) < notchHalfW(N, f.t) + 1.5;
    inNotch = wide && (f.along > N.r0 + (inNotch ? -3 : 1.5)) || (approach && f.along > N.r0 - 18 && Math.abs(f.lc) < 9);
    return inNotch ? Math.atan2(-N.ca, -N.sa) : null;
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

  function placesReadout() {
    if (!placesVis) return null;
    return { zone: zone?.id ?? null, owned: placeState.owned.slice(), ...placesVis.readout() };
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
      // the loop's places (M1 step 3a, PLAN §3.4): ctx.debug.world.places() for the scenarios and the stage
      if (ctx.debug && typeof ctx.debug === 'object' && loopOn()) {
        ctx.debug.world = Object.assign(ctx.debug.world && typeof ctx.debug.world === 'object' ? ctx.debug.world : {}, {
          places: () => placesReadout(),
          giantBack: (id, near = null) => placesVis?.forceBack?.(id, near) ?? false,
        });
      }
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
      if (placesVis) {
        try { placesVis.update(d, t || 0, { raft: raftPos(), phase: ctx.state?.run ? phaseInfo()?.phase ?? null : null, night: env.night, fog: env.fog, fogDensity: env.fogDensity, glowK: env.glowK }); }
        catch (e) { ctx.errors?.push?.(`world.places: ${e?.message || e}`); placesVis?.dispose(); placesVis = null; }
      }
      updateAccents(d);
      updateWaterLights();
    },
    setZone,
    getZone: () => zone,
    /** WC-3 (WATERCRAFT §5.4): the reeds' and pads' twitch, {nudge(x, z, k)}, on the Mossmere under the loop; null elsewhere. */
    get stems() { return arena?.stems || null; },
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
    getLampSpots,   // (the loop's wildlife: the lamps the moths fly)
    /** The stopgap's holdsGiants water [{id, kind: 'ring'|'disc', x, z, r}] in a lake whose places are not in the build. */
    getGiantSpots: () => giantSpots,
    // ---- the loop's places (M1 step 3a, PLAN §3.4; inert with the loop off or on a lake with no places)
    /** {owned, lifted}: the banks stand over every place not lifted; a lifted place's dressing is lit. */
    setPlaces(p = {}) {
      placeState.owned = Array.isArray(p.owned) ? p.owned.slice() : [];
      placeState.lifted = Array.isArray(p.lifted) ? p.lifted.slice() : [];
      if (layout?.notch?.place) layout.notch.open = placeState.owned.includes(layout.notch.place);   // (the cut's water and banks with its place)
      return placesVis ? placesVis.setPlaces(placeState) : false;
    },
    /** Lift a place's mist over `sec` s (0: at once). → whether the place has a bank here. */
    liftMist(id, sec = 3) {
      const ok = placesVis ? placesVis.liftMist(id, sec) : false;
      if (ok && !placeState.lifted.includes(id)) placeState.lifted.push(id);
      return ok;
    },
    /** Where the lift's shot looks for a place: {x, y, z, r}, or null. */
    placeAnchor: (id) => (placesVis ? placesVis.placeAnchor(id) : null),
    /** The places' readout (banks, opacities, lifted, the back), or null. */
    places: () => placesReadout(),
    // ---- optional extras (not in CONTRACT; safe to ignore)
    getShoreRadius: (angle) => shoreR(angle),
    // ---- the shore notch (LOST-TACKLE §5.3): its water drawn whatever its place (the bake), its view while the raft is in it
    /** The water's signed distance to its shore at (x, z), any cut drawn in (water.js's bake). */
    getShoreDist: (x, z) => (layout ? shoreDist(layout, x, z) : bounds.radius - Math.hypot(x, z)),
    /** The half-size (m) the water's bake must cover: the lake and its cut. */
    getBakeHalf: () => Math.max(bounds.radius + 8, layout?.notch ? layout.notch.end + 3 : 0),
    /** The cut ({a, ca, sa, hw, r0, end, depth, pool, endHw, place, open}) or null. */
    getNotch: () => layout?.notch || null,
    viewYaw,
    getDocks: () => (layout?.docks || []).map((d) => ({ position: new THREE.Vector3(d.x, 0, d.z), yaw: d.yaw })),
    getMood: () => mood,
    /** The loop (M1 step 5a): this water's mooring (data.loopMooring on its docks: raft, hull, murk, lane, cam, circles), or null. */
    getMooring: () => mooring,
    getLightShafts: () => (layout?.cracks || []).map((c) => ({ x: c.x, z: c.z })),
    // >>> INTRO LANE A: stage hooks
    getHeroAnchor,
    setIntroMood(on) { introMood = !!on; },
    setIntroWaterLight(l) {
      introLight = l && Number.isFinite(l.x) && Number.isFinite(l.z) && Number.isFinite(l.intensity)
        ? { x: l.x, y: Number.isFinite(l.y) ? l.y : 2, z: l.z, color: l.color, intensity: l.intensity, radius: Number.isFinite(l.radius) ? l.radius : 20, streak: l.streak } : null;
    },
    // <<< INTRO LANE A
    debugInfo: () => ({ zone: zone?.id, radius: bounds.radius, obstacles: obstacles.length, gate: gateState, mood: { ...mood }, arena: arena?.stats?.() }),
  };
}
