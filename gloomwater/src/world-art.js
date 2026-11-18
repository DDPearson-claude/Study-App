// world-art.js — builds one zone's lake arena visuals from a layout (world author).
// Static geometry is merged per material (rock / organic / glow) with ink outlines;
// repeats are instanced; atmosphere (rings, vault, shafts, mist, particles, halos)
// lives in shaders. Everything created here is tracked in a bin and disposed on swap.
import * as THREE from 'three';
import { glowMaterial, INK, setupSurface, evenOutline, REFLECT_LAYER } from './toon.js';
import { makeRng } from './core.js';
import { TAU, prep, merge, mat, rockGeo, taperTube, latheGeo, crystalGeo, wobble, lin, mixArr, scaleArr, fbm3, vnoise3, makeRingNoise, ringNoise } from './world-geo.js';
import * as WF from './watercraft-face.js';   // WC-3: the Mossmere's reed beds and lily beds (pure plans)
import { notchFrame, notchHalfW, notchSdf, notchBend, fromShore } from './world-layout.js';   // the cut behind the Sluice Veil (LOST-TACKLE §5.3)
import { sdfAt, sdfGrad, groundAt as outlineGround, shoreAt as outlineShoreAt } from './world-outline.js';   // LAKE2 §3.1: an outline shore's banks
import { ambientOn, debrisPieces, debrisGeos, createSlits, stepSlits } from './world-ambient.js';   // the loop's ambient (LOOP.ambient)
import { inkToon, outlineMat, makeSeeCut, cutBlocked, ringMaterial, domeMaterial, createParticles, createHalos, createShafts, mistMaterial, vortexMaterial, columnMaterial, createSpiral, createShoreRings, createMistSheets } from './world-fx.js';
import { paintRing } from './world-paint.js';
import { lushLook, lushColor, lushFloor, lushMoss, floraPlan, buildFlora } from './world-flora.js';   // LAKE 2, lane W2: the vegetation kit (a water with a look: Sporewood under the loop)
import { buildSporewoodArt } from './world-sporewood.js';                // LAKE 2, lane W2: Sporewood's living landmarks
import { WATERCRAFT } from './watercraft.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// Per-theme material colours (linear arrays built at runtime from hex).
// Starlit (DESIGN §19): indigo-slate rock, violet-grey lichen, pale stone ruins; Mossmere reeds and
// lily pads are dun-ochre (autumn), Sporewood caps autumn ochre on violet, the Pallid Deep bone-pale.
const KIT = {
  mossmere: { rock: 0x181a2e, rockHi: 0x30345a, moss: 0x3a3656, mossHi: 0x6a6690, wood: 0x2e241b, woodHi: 0x4a3a2a, stone: 0x8a8ca8, iron: 0x111222, bone: 0xbcbccc, organic: 0x7a5e30 },
  sporewood: { rock: 0x221830, rockHi: 0x3c2a4e, moss: 0x4a2c5e, mossHi: 0x7c4c86, wood: 0x2a1c22, stone: 0x5c4c6a, iron: 0x140e18, bone: 0xc4aebe, organic: 0xb6a0b4, cap: 0x5e3c1e, capHi: 0xb8893a },
  glasswater: { rock: 0x10142e, rockHi: 0x1e2652, moss: 0x262f66, mossHi: 0x3c4a94, wood: 0x1c1d2e, stone: 0x4a5488, iron: 0x0c0e1c, bone: 0x9aa2d2, organic: 0x2a3472 },
  paleabyss: { rock: 0x18161e, rockHi: 0x2c2a34, moss: 0x46424e, mossHi: 0x8a8494, wood: 0x221e22, stone: 0x7c7684, iron: 0x111014, bone: 0xddd4c4, organic: 0xd2c8b6 },
};

// Clear Night (docs/v3/clarity/SPEC.md §8.1): the kit's reflectance, so the key light can register on it. The hues
// above are kept; each is scaled in linear RGB when the kit is built (ink-dark stone only ever showed the fog).
const ALBEDO = { rock: 2.6, rockHi: 2.0, moss: 1.6, mossHi: 1.3, wood: 1.4, woodHi: 1.4 };
// The key light of each lake (the moon / vault glow): azimuth from north (+ = east) and elevation, in degrees. A
// three-quarter back light from the upper left behind the scene: rims on the left and the top, shadows falling
// toward the camera and to the right, the glitter path up-left. world.js lights the lake from arena.keyDir.
const KEY_LIGHT = { mossmere: [-68, 36], sporewood: [-56, 42], glasswater: [-76, 30], paleabyss: [-48, 50] };
/** Unit vector toward a lake's key light. */
export function keyLightDir(theme, out = new THREE.Vector3()) {
  const [az, el] = KEY_LIGHT[theme] || KEY_LIGHT.mossmere;
  const a = az * Math.PI / 180, e = el * Math.PI / 180;
  return out.set(Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e));
}

// Per-lake sky (DESIGN §19.2): nebula 1 low, left of north (the title camera opens looking ~30° west
// of north), so its glow spills behind the hero landmark's left flank and the far water mirrors it
// at the left of the sail view (azimuth from north in radians, + = east; elevation; strength);
// nebula 2 higher on the other side. Glasswater
// has the most sky, the Pallid Deep the least (one dim ash-rose cloud).
const SKY = {
  mossmere: { az1: -0.55, el1: 0.16, w1: 0.95, az2: 0.75, el2: 0.48, w2: 0.4 },
  sporewood: { az1: -0.3, el1: 0.2, w1: 1.25, az2: 0.7, el2: 0.42, w2: 0.7 },
  glasswater: { az1: -0.5, el1: 0.2, w1: 0.95, az2: 0.8, el2: 0.52, w2: 0.85 },
  paleabyss: { az1: -0.45, el1: 0.13, w1: 0.5, az2: 0.9, el2: 0.5, w2: 0.0 },
};

/** A vertical band following an outline shore `off` m back from the waterline (into the land), `h` m tall and centred on y 0, sampled
 *  every `step` m of the shore: the cylinder's u (round the shore) and v (up), open, for the shore's mist. */
function shoreBand(O, off, h, step) {
  const n = Math.max(8, Math.round(O.len / step)), pos = [], uv = [], idx = [], q = { x: 0, z: 0, nx: 0, nz: 0, h: 0, shelf: 0 };
  const P = [], S = [];
  for (let k = 0; k <= n; k++) {
    outlineShoreAt(O, (k / n) * O.len, q);
    P.push([q.x + q.nx * off, q.z + q.nz * off]); S.push([q.x, q.z]);
  }
  // (where a tight bend folds the band back on itself, its two layers stood as one pale hard-edged slab against the far bank: the band
  // thins to nothing there, through its own v at the foot (the mist's density is (1 − v)^2.2), over a few samples either side)
  const w = new Float32Array(n + 1).fill(1);
  for (let k = 0; k <= n; k++) {
    const a = Math.max(0, k - 1), b = Math.min(n, k + 1);
    const tx = P[b][0] - P[a][0], tz = P[b][1] - P[a][1], sx = S[b][0] - S[a][0], sz = S[b][1] - S[a][1], s2 = sx * sx + sz * sz;
    const r = s2 > 1e-6 ? (tx * sx + tz * sz) / s2 : 1;   // (the band's run along the shore's: 1 straight, ≤ 0 folded back)
    w[k] = r >= 0.6 ? 1 : r <= 0.2 ? 0 : (r - 0.2) / 0.4;
  }
  const fade = Float32Array.from(w);
  for (let k = 0; k <= n; k++) for (let j = -3; j <= 3; j++) {
    const i = k + j; if (i < 0 || i > n || w[i] >= 1) continue;
    fade[k] = Math.min(fade[k], w[i] + (1 - w[i]) * (Math.abs(j) / 4));
  }
  for (let k = 0; k <= n; k++) {
    const [x, z] = P[k];
    pos.push(x, -h / 2, z, x, h / 2, z); uv.push(k / n, 1 - fade[k], k / n, 1);
    if (k < n) { const a = 2 * k; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function domeY(L, r) {
  const A = L.domeA, B = L.domeB;
  const q = Math.min(1, Math.abs(r) / A);
  return L.domeY0 + B * Math.pow(Math.max(0, 1 - q * q * q * q), 0.25);
}

/**
 * Build the visual arena. opts: { quality: 'low'|'medium'|'high', far: camera far plane }
 * Returns { group, update(dt,t,focus,env), applyMood(env), setGate(state, instant), anchors, dispose() }
 */
export function buildArena(ctx, L, opts = {}) {
  const zone = L.zone || {};
  let cutPlug = null, plugN = null;   // (LOST-TACKLE §5.2: the cliff's rock across the cut's mouth while the cut is shut)
  const pal = Object.assign({ fog: 0x3a3070, fogDensity: 0.016, water: 0x2e2664, waterDeep: 0x0a081e, foam: 0xd8d6e6, glow: 0xbab2ee, accent: 0xd6d6e4, lamp: 0xb6b0f0, candle: 0xed9e3b, ambient: 0x4a3e88, ink: 0x08061a, far: 0x8c84bc, light: 0xd4d0f2, nebula: 0xd296ae, stars: 1.0 }, zone.palette || {});
  // optional `lamp` key: cold light for island lamps, buoys, statue orbs and the rings' lit windows
  // (falls back to `glow`), so lamps never compete with the Wick's lantern or the Cinders
  if (zone.palette && zone.palette.lamp == null) pal.lamp = pal.glow;
  // optional `candle` key: the warm amber pinpoints on stone (lit ruin windows in the rings, lamp heads,
  // statue orbs, candles on ruins and landmarks); falls back to `lamp`. Lamps on the water stay cold.
  if (zone.palette && zone.palette.candle == null) pal.candle = pal.lamp;
  const theme = L.theme;
  const K = {}; for (const [k, v] of Object.entries(KIT[theme] || KIT.mossmere)) K[k] = scaleArr(lin(v), ALBEDO[k] || 1);
  // >>> LAKE 2, lane W2: a water built on an outline shore with a look (ZONE_LOOKS, lush > 0: Sporewood under the loop) is dressed by the
  // vegetation kit and its living landmarks; everything below that reads `look` is skipped for any other water (the Mossmere: no look)
  const look = L.outline && opts.face !== false ? lushLook(ctx?.data, zone.id || theme) : null;
  // (LAKE 2, the art pass: a look's own kit tones (its banks' earth and moss, its stalks and roots) in place of the theme's violet ones)
  if (look?.air?.kit) for (const [k, v] of Object.entries(look.air.kit)) K[k] = scaleArr(lin(v), ALBEDO[k] || 1);
  const bankFloorU = { gwFloraFloor: { value: 0 } };   // (the banks' moss floor, by the mood)
  // <<< LAKE 2, lane W2
  const keyDir = keyLightDir(theme);
  const PL = {}; for (const [k, v] of Object.entries(pal)) if (typeof v === 'number' && k !== 'fogDensity' && k !== 'stars') PL[k] = lin(v);
  // the accent lights a candle anchor casts lean pale gold: warm on the stone, never a second lantern
  const candleLight = mixHex(pal.candle, pal.light, 0.18);
  const quality = opts.quality || 'high';
  const low = quality === 'low';
  const rng = makeRng(L.artSeed);
  const R = L.R;

  // ---------------------------------------------------------- bin (disposal tracking)
  const bin = { geos: new Set(), mats: new Set(), texs: new Set() };
  const G = (g) => { if (g) bin.geos.add(g); return g; };
  const M = (m) => { if (m) bin.mats.add(m); return m; };
  const T = (t) => { if (t) bin.texs.add(t); return t; };

  const group = new THREE.Group();
  group.name = 'arena:' + (zone.id || theme);
  const prof = {}; let pt = performance.now();
  const mark = (k) => { const n = performance.now(); prof[k] = Math.round(n - pt); pt = n; };

  // vault geometry (superellipse dome) scaled to fit inside the camera far plane
  const farPlane = opts.far || 500;
  const want = R + 205;
  const fit = Math.max(0.55, Math.min(1, (farPlane * 0.86 - R - 15) / want));
  L.domeA = want * fit; L.domeB = 105; L.domeY0 = -8;
  L.ringScale = fit;

  const halos = createHalos(low ? 260 : 420);
  M(halos.mat); G(halos.geo);
  const anchors = [];  // big glows for accent / water lights: {x,y,z,color:Color,intensity,distance,boost}
  const addAnchor = (x, y, z, hex, intensity = 4, distance = 14) => { const a = { x, y, z, color: new THREE.Color(hex), intensity, distance, boost: 1 }; anchors.push(a); return a; };

  // ---------------------------------------------------------- shared materials
  const rimC = mixHex(pal.far, pal.light, 0.45);
  // (floor: the material's share of the vault's glow under its shadows — the far layers, cliffs and landmarks, take a
  // little more of it than the islands: depth by tone, where the fog used to do it)
  // stone carries strata, cracks and lichen and is wet (darker, glinting) for 0.6 m above the water; timber, bone and
  // stalks carry a grain running up them (toon.js surface shading; the detail is compiled out on low)
  const rockMat = M(inkToon({ color: 0xffffff, vertexColors: true, flatShading: true, rim: 0.32, rimColor: rimC, rimPower: 0.56, steps: 3, detail: 'stone', wet: 0.6, gloss: 0.1, shine: 48, floor: 1 }, { fogScale: 0.9, fogMax: 1 }));
  const orgMat = M(inkToon({ color: 0xffffff, vertexColors: true, rim: 0.3, rimColor: rimC, rimPower: 0.56, steps: 3, detail: 'wood', detailAmount: 0.7, grain: [0, 1, 0], wet: 0.5, gloss: 0.1, shine: 56, floor: 1 }, { fogScale: 0.9, fogMax: 1 }));
  // (LAKE 2, the art pass: on a lush water the stalks, roots and fallen logs take the moss's floor in their shade, as the banks do, so a
  // cream stalk seen from below reads as a stalk, never as a black arch over the water)
  if (look) lushFloor(orgMat, bankFloorU, 'org');
  const glowMat = M(new THREE.MeshBasicMaterial({ vertexColors: true, fog: true, toneMapped: false }));
  // ink lines: a little lighter than before and evened on screen (toon.evenOutline), so near rocks are not ringed heavy
  const olRock = M(evenOutline(outlineMat(0.09, INK)));
  const olOrg = M(evenOutline(outlineMat(0.05, INK)));

  const kit = { rock: [], org: [], glow: [], fine: [] };
  // >>> WC-3 (docs/loop/WATERCRAFT.md §5.4): on the Mossmere under the loop the reeds and pads carry a twitch (up to four points the
  // stems tell nudges, world.stems.nudge) and the four lily beds' pads bob in the shader only. Their own seeded stream: the built art's
  // draws are untouched, and off the loop nothing here is built.
  const wcOn = theme === 'mossmere' && opts.face !== false && WF.faceOn(ctx?.data, zone.id || 'mossmere');   // (opts.face false: the built arena, for tests)
  const twU = wcOn ? {
    gwTw: { value: Array.from({ length: WF.FACE.twitch.max }, () => new THREE.Vector4(0, 0, -99, 0)) }, gwTwT: { value: 0 },
    gwRaft: { value: new THREE.Vector3(0, 0, 0) },   // (Lake 1 polish) the raft's x, z and 1 once it is known: the reeds part round it
    gwWaveA: { value: new Float32Array(16) }, gwWaveB: { value: new Float32Array(8) }, gwWaveT: { value: 0 },
  } : null;
  const twState = { i: 0, t: 0, linked: false };
  // (wave 2, audit #3 and #7: on the Mossmere under the loop the islands', pillars' and posts' stone and timber dither off the lens's line
  // to the Wick while one of the lake's obstacles stands on it (update); the places' stone shares the cut. Off the loop nothing changes)
  const seeCut = wcOn || look ? makeSeeCut() : null;   // (LAKE 2, lane W2: a lush water's stalks on the lens's side take the cut too)
  if (seeCut) { seeCut.add(rockMat, true); seeCut.add(olRock, false); seeCut.add(orgMat, true); seeCut.add(olOrg, false); }
  const cutHook = (mesh) => { if (seeCut && (mesh.material === rockMat || mesh.material === orgMat || mesh.material === olRock || mesh.material === olOrg)) mesh.onBeforeRender = seeCut.setCut; };
  const TW_PARS = `
uniform vec4 gwTw[${WF.FACE.twitch.max}]; uniform float gwTwT; uniform vec3 gwRaft;
vec2 gwTwitch(vec2 p, float hgt) {
  vec2 s = vec2(0.0);
  for (int i = 0; i < ${WF.FACE.twitch.max}; i++) {
    vec4 q = gwTw[i];
    float age = gwTwT - q.z;
    if (age < 0.0 || age > ${WF.FACE.twitch.life.toFixed(2)} || q.w <= 0.0) continue;
    vec2 d = p - q.xy;
    float r = length(d);
    float env = q.w * exp(-age * 1.7) * (1.0 - smoothstep(1.2, ${WF.FACE.twitch.reach.toFixed(2)}, r)) * smoothstep(0.0, 0.06, age);
    s += (d / max(r, 0.3)) * sin(age * 17.0 - r * 2.3) * env * hgt;
  }
  return s;
}`;
  /** inkToon with the twitch in its vertex stage: reeds bend from the foot (y), pads (instanced: aBed 1) bob on the swell. */
  const twitchMat = (opts, fog, kind) => {
    const mat = inkToon(opts, fog);
    const base = mat.onBeforeCompile;
    mat.onBeforeCompile = (shader, r) => {
      base?.call(mat, shader, r);
      Object.assign(shader.uniforms, twU);
      const body = kind === 'reeds'
        ? `{ float hgt = clamp(transformed.y + 0.1, 0.0, 2.4);
  vec2 sway = vec2(sin(gwTwT * 1.1 + transformed.x * 0.37 + transformed.z * 0.21), cos(gwTwT * 0.93 + transformed.z * 0.41 + transformed.x * 0.13)) * 0.016 * hgt;
  transformed.xz += sway + gwTwitch(transformed.xz, hgt) * 0.12;
  // (Lake 1 polish: the reeds part round the raft, bent out from their foot to 1.6 m or more, so none pierces its deck)
  vec2 rd = transformed.xz - gwRaft.xy; float rr = length(rd);
  transformed.xz += rd / max(rr, 0.05) * 2.2 * (1.0 - smoothstep(0.0, 2.2, rr)) * clamp(hgt * 2.5, 0.0, 1.0) * gwRaft.z; }`
        : `#ifdef USE_INSTANCING
  if (aBed > 0.5) {
    vec2 ip = vec2(instanceMatrix[3].x, instanceMatrix[3].z);
    float sc = max(length(instanceMatrix[0].xyz), 0.05);
    float h = 0.0;
    for (int i = 0; i < 4; i++) { vec4 a = gwWaveA[i]; h += a.w * sin(a.z * (a.x * ip.x + a.y * ip.y) + gwWaveB[i].x * gwWaveT + gwWaveB[i].y); }
    vec2 tw = gwTwitch(ip, 1.0);
    transformed.y += (h * 0.4 + length(tw) * 0.05 * sin(gwTwT * 9.0)) / sc;
    transformed.xz += tw * 0.05 / sc;
  }
  // (wave 2, audit #16: a pad within about 3 m of the lens shrinks away into the water: never a big flat blob over the frame)
  transformed *= smoothstep(1.4, 3.0, distance((modelMatrix * vec4(instanceMatrix[3].xyz, 1.0)).xyz, cameraPosition));
#endif`;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>${TW_PARS}${kind === 'pads' ? '\nattribute float aBed; uniform vec4 gwWaveA[4]; uniform vec2 gwWaveB[4]; uniform float gwWaveT;' : ''}`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>\n${body}`);
    };
    const key = mat.customProgramCacheKey?.() || 'gwInkToonFog';
    mat.customProgramCacheKey = () => `${key}:wc:${kind}`;
    return mat;
  };
  // <<< WC-3
  const colorRock = (mossAmt = 1, wet = true) => (x, y, z, nx, ny, nz) => {
    const n = fbm3(x * 0.35, y * 0.35, z * 0.35, 2);
    let c = mixArr(K.rock, K.rockHi, n * 0.9);
    c = scaleArr(c, 0.86 + 0.14 * Math.sin(y * 2.6 + n * 5.0));
    if (mossAmt > 0) {
      const m = Math.max(0, Math.min(1, (ny - 0.45) / 0.35)) * mossAmt * (0.6 + 0.6 * vnoise3(x * 0.8, y * 0.8, z * 0.8));
      c = mixArr(c, mixArr(K.moss, K.mossHi, n), Math.min(1, m));
    }
    if (wet && y < 0.45) c = scaleArr(c, 0.55 + 0.45 * Math.max(0, y / 0.45));
    return c;
  };

  // ==================================================================== CLIFFS
  // (LAKE2 §3.1, lane W1: an outline water's banks are its ground, built from the shore's own distance field in place of the polar ring)
  if (L.outline) buildBanks();
  else {
    const segA = low ? 150 : 210, segY = 13;
    const crest = makeRingNoise(rng, [3, 5, 8, 13, 21, 34, 55], (k) => 1 / Math.pow(k, 0.65));
    const saddles = [];
    for (let i = 0; i < 4; i++) saddles.push({ a: rng() * TAU, w: rng.range(0.1, 0.22), d: rng.range(0.35, 0.6) });
    const ox = rng() * 40, oz = rng() * 40;
    const pos = [], col = [], idx = [];
    const inkL = mixArr(PL.ink, K.rock, 0.55), crestC = mixArr(K.rockHi, PL.far, 0.35);
    const heights = [];
    let sumN = 0; for (const t of crest) sumN += t.amp;
    for (let i = 0; i <= segA; i++) {
      const a = (i / segA) * TAU;
      let hN = 0.5 + 0.5 * ringNoise(crest, a) / sumN;
      let H = 6 + 13 * hN;
      for (const s of saddles) { let da = Math.abs(((a - s.a + Math.PI) % TAU + TAU) % TAU - Math.PI); H *= 1 - s.d * Math.exp(-(da * da) / (s.w * s.w)); }
      heights.push(H);
    }
    // LOST-TACKLE §5.3: the cut behind the Sluice Veil (L.notch, the Mossmere under the loop). The ring's columns inside its mouth are
    // dropped and the two beside it set on the mouth's edges; a U of the same rock runs from one to the other round the cut (its banks,
    // their ledge, the rising walls and their tops, the head where the culvert spills), in this one mesh (0 new calls)
    const N = theme === 'mossmere' && L.notch ? L.notch : null;
    const wrapD = (x) => ((x + Math.PI) % TAU + TAU) % TAU - Math.PI;
    const cutHalf = N ? Math.atan2(N.hw + 0.6, N.r0 + 3) : 0;
    const inCut = (i) => !!N && Math.abs(wrapD((i / segA) * TAU - N.a)) < cutHalf;
    let iL = -1, iR = -1;
    if (N) for (let i = 0; i < segA; i++) { if (!inCut(i) && inCut(i + 1) && iL < 0) iL = i; if (inCut(i) && !inCut(i + 1)) iR = i + 1; }
    const cutOn = N && iL >= 0 && iR > iL;
    const rockCol = (y, v, n1, n2) => {
      let c = mixArr(inkL, K.rockHi, n1 * 0.55);
      if (y > 0.4 && y < 5) c = mixArr(c, K.moss, 0.45 * (1 - Math.abs(y - 2.2) / 2.8) * n2);
      if (y < 0.8) c = scaleArr(c, 0.6);
      return mixArr(c, crestC, Math.pow(v, 3) * 0.8);
    };
    for (let i = 0; i <= segA; i++) {
      const a = (i / segA) * TAU, ca = Math.cos(a), sa = Math.sin(a);
      const H = heights[i];
      const base = L.shoreR(a) + 2.4;
      const edge = cutOn && (i === iL || i === iR) ? (i === iL ? -1 : 1) * (N.hw + 0.6) : 0;
      for (let j = 0; j <= segY; j++) {
        const v = j / segY;
        let y = -4 + (H + 4) * Math.pow(v, 0.92);
        const n1 = fbm3(ca * 6 + ox, y * 0.09, sa * 6 + oz, 3);
        const n2 = vnoise3(ca * 22 + oz, y * 0.25, sa * 22 + ox);
        let r = base + (n1 - 0.5) * 7 + (n2 - 0.5) * 1.6 + 1.5 - Math.pow(v, 2) * H * 0.18;
        if (j === segY) { y += (n2 - 0.4) * 3.5; r += 1.2; }
        if (j === 0) r += 1.5;
        if (cutOn && inCut(i)) r = Math.max(r, N.r0 + 3.4);   // (the plug's columns stand well behind the Veil's fall: below)
        if (edge) { const al = r * Math.cos(a - N.a); pos.push(al * N.ca - edge * N.sa, y, al * N.sa + edge * N.ca); }   // (the mouth's edge)
        else pos.push(ca * r, y, sa * r);
        const c = rockCol(y, v, n1, n2);
        col.push(c[0], c[1], c[2]);
      }
    }
    // (the review, §5.2: before the notebook the cut is hidden; up close its culvert and reeds showed through the Veil. The ring's own
    // rock across the mouth stays drawn as the plug, its own mesh in the cliff's material, shown only while the cut is shut)
    const plugIdx = [];
    for (let i = 0; i < segA; i++) for (let j = 0; j < segY; j++) {
      if (cutOn && (inCut(i) || inCut(i + 1))) { const A = i * (segY + 1) + j, B = (i + 1) * (segY + 1) + j; plugIdx.push(A, B, A + 1, B, B + 1, A + 1); continue; }   // (the mouth)
      const A = i * (segY + 1) + j, B = (i + 1) * (segY + 1) + j, C = A + 1, D = B + 1;
      idx.push(A, B, C, B, D, C);
    }
    if (cutOn) {
      // the U's columns: a bank point (the water's edge, lc = ±half-width) and its outward normal, north bank → head → south bank
      const cols = [], step = low ? 1.6 : 1.15, a0 = N.r0 + 4.6, aH = N.end - N.endHw;
      const at = (along, lc) => { const t = Math.max(0, Math.min(1, (along - N.r0) / Math.max(1, N.end - N.r0))), lat = lc + notchBend(N, t); return [along * N.ca - lat * N.sa, along * N.sa + lat * N.ca]; };
      const nAl = Math.max(4, Math.ceil((aH - a0) / step));
      for (let k = 0; k <= nAl; k++) { const al = a0 + ((aH - a0) * k) / nAl, t = (al - N.r0) / (N.end - N.r0); cols.push({ al, lc: -notchHalfW(N, t), s: -1 }); }
      const nArc = low ? 5 : 8;
      for (let k = 1; k < nArc; k++) { const ph = (Math.PI * k) / nArc; cols.push({ al: aH + N.endHw * Math.sin(ph), lc: -N.endHw * Math.cos(ph), s: 0, ph }); }
      for (let k = nAl; k >= 0; k--) { const al = a0 + ((aH - a0) * k) / nAl, t = (al - N.r0) / (N.end - N.r0); cols.push({ al, lc: notchHalfW(N, t), s: 1 }); }
      // each column's outward normal (from the path's own tangent, the water on its inside) and the crest's height there
      const Hm = Math.max(heights[iL], heights[iR]), Hh = Math.max(Hm + 2.2, 10);
      const ring0 = (i) => { const out = []; for (let j = 0; j <= segY; j++) { const q = (i * (segY + 1) + j) * 3; out.push([pos[q], pos[q + 1], pos[q + 2]]); } return out; };
      const startCol = ring0(iL), endCol = ring0(iR);
      // the profile across a bank, from under the water to the cliff's top: [out from the water's edge (m), height (m, or × the crest)]
      const PROF = [[-0.7, -3], [0.1, -0.2], [0.45, 0.22], [0.95, 0.42], [1.25, 0.14], [1.45, 0.28], [1.6, 0.42], [1.7, 0.56], [1.75, 0.7], [1.7, 0.8], [1.65, 0.9], [1.75, 1], [3.6, 1.04], [6.6, 1.01]];
      const crestRow = (j) => j >= 4;
      const g0 = pos.length / 3;
      const all = [startCol];
      cols.forEach((c, k) => {
        const p0 = at(c.al, c.lc), prev = cols[Math.max(0, k - 1)], next = cols[Math.min(cols.length - 1, k + 1)];
        const pa = at(prev.al, prev.lc), pb = at(next.al, next.lc);
        let tx = pb[0] - pa[0], tz = pb[1] - pa[1]; const tl = Math.hypot(tx, tz) || 1; tx /= tl; tz /= tl;
        const nx = tz, nz = -tx;   // (right of the way travelled: away from the water, which lies on its left as the ring's own winding has it)
        const u = Math.max(0, Math.min(1, (c.al - a0) / Math.max(1, aH - a0))), H = Hm + (Hh - Hm) * u * u * (3 - 2 * u);
        const colV = [];
        // (the review: from the Sail's glide the sky showed over the head's low crest as a pale bar; the hill rises on behind the culvert)
        const hill = c.s === 0 ? 1 : Math.max(0, (u - 0.6) / 0.4);
        for (let j = 0; j <= segY; j++) {
          const o = PROF[j][0] + (j === segY ? 10 * hill : 0), f = PROF[j][1] + (j === segY ? 0.9 * hill : 0), y0 = crestRow(j) ? f * H : f;
          const n1 = fbm3(p0[0] * 0.16 + ox, y0 * 0.11, p0[1] * 0.16 + oz, 3), n2 = vnoise3(p0[0] * 0.55 + oz, y0 * 0.3, p0[1] * 0.55 + ox);
          // (the bank's lip and ledge wander in and out and up and down, so it reads as mud and stone, never a kerb)
          const nl = vnoise3(c.al * 0.42 + (c.s || 0) * 7.3, j * 0.6, c.lc * 0.3);
          let d = o + (crestRow(j) ? (n1 - 0.5) * 1.5 + (n2 - 0.5) * 0.5 : j >= 2 ? (nl - 0.5) * 0.9 : (n2 - 0.5) * 0.22), y = y0 + (j === 2 || j === 3 ? (nl - 0.5) * 0.34 : 0);
          if (j === 11) y += (n2 - 0.4) * 1.6;
          // the culvert: a dark recess in the head under its arch
          if (c.s === 0 && Math.abs(c.lc) < 1.15 && j >= 1 && j <= 4) { d += 1.7; y = Math.min(y, 1.75); }
          colV.push([p0[0] + nx * d, y, p0[1] + nz * d]);
        }
        all.push(colV);
      });
      all.push(endCol);
      // (the first and last two columns ease from the ring's mouth edge into the bank's own profile)
      for (const [k, ref, w] of [[1, 0, 0.35], [2, 0, 0.7], [all.length - 2, all.length - 1, 0.35], [all.length - 3, all.length - 1, 0.7]]) {
        for (let j = 0; j <= segY; j++) { const P = all[k][j], Q = all[ref][j]; for (let q = 0; q < 3; q++) P[q] = Q[q] + (P[q] - Q[q]) * w; }
      }
      const nC = segY + 1;
      all.forEach((colV, k) => colV.forEach(([x, y, z], j) => {
        pos.push(x, y, z);
        const v = j / segY, n1 = fbm3(x * 0.16 + ox, y * 0.11, z * 0.16 + oz, 3), n2 = vnoise3(x * 0.55 + oz, y * 0.3, z * 0.55 + ox);
        let c = rockCol(y, Math.min(1, Math.max(0, y / Math.max(1, Hh))), n1, n2);
        const f = notchFrame(N, x, z);
        if (f.along > N.end - 3 && Math.abs(f.lc) < 1.3 && y < 1.9 && y > -0.5 && Math.hypot(f.along - N.end, 0) < 3.2 && j >= 1 && j <= 4) c = scaleArr(PL.ink, 0.6);   // (the culvert's dark)
        else if (j >= 2 && j <= 3) c = scaleArr(mixArr(c, K.moss, 0.5), 0.5 + 0.2 * n2);   // (the ledge: wet moss and mud under the reeds, dark)
        col.push(c[0], c[1], c[2]);
      }));
      for (let k = 0; k + 1 < all.length; k++) for (let j = 0; j < segY; j++) {
        const A = g0 + k * nC + j, B = g0 + (k + 1) * nC + j, C = A + 1, D = B + 1;
        idx.push(A, B, C, B, D, C);
      }
      prof.cut = all.length;
    }
    const g = G(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    const cliffMat = M(inkToon({ color: 0xffffff, vertexColors: true, flatShading: true, rim: 0.5, rimColor: pal.far, rimPower: 0.5, steps: 3, detail: 'stone', wet: 0.7, gloss: 0.08, shine: 48, floor: 1.7 }, { fogScale: 0.62, fogMax: 0.82 }));
    const cliffs = new THREE.Mesh(g, cliffMat);
    cliffs.name = 'cliffs';
    setupSurface(cliffs);
    group.add(cliffs);
    if (cutOn && plugIdx.length) {
      const pg = G(new THREE.BufferGeometry());
      pg.setAttribute('position', g.getAttribute('position')); pg.setAttribute('color', g.getAttribute('color'));
      pg.setIndex(plugIdx); pg.computeVertexNormals();
      cutPlug = new THREE.Mesh(pg, cliffMat);
      cutPlug.name = 'cutPlug'; cutPlug.visible = !N.open;
      setupSurface(cutPlug);
      group.add(cutPlug);
      plugN = N;
    }
    // boulders along the base + spires on the crest (merged into the rock mesh)
    const nB = Math.round(R * (low ? 0.6 : 0.95));
    // (none in the cut or its mouth: each still draws its numbers, so every other boulder and spire stands where it stood)
    const clearCut = (x, z, pad) => !cutOn || notchSdf(N, x, z) < -pad || notchFrame(N, x, z).along < N.r0 - 4;
    for (let i = 0; i < nB; i++) {
      const a = rng() * TAU, s = rng.range(1.2, 3.4);
      const r = L.shoreR(a) + rng.range(0.2, 1.2) + s * 1.15;
      const g = rockGeo(rng, { r: s, h: s * rng.range(0.6, 1.1), detail: 1, rough: 0.35 }), ry = rng() * TAU;
      if (clearCut(Math.cos(a) * r, Math.sin(a) * r, s * 1.2 + 0.6)) kit.rock.push(prep(g, { matrix: mat(Math.cos(a) * r, s * 0.15, Math.sin(a) * r, 0, ry, 0), colorFn: colorRock(0.8) }));
    }
    const nS = low ? 16 : 30;
    for (let i = 0; i < nS; i++) {
      const ii = (rng() * segA) | 0, a = (ii / segA) * TAU;
      const H = heights[ii], r = L.shoreR(a) + 6 + rng() * 6, s = rng.range(1.6, 3.2);
      const g = rockGeo(rng, { r: s, h: s * rng.range(2.5, 6.5), detail: 1, rough: 0.3, flare: 0.1 }), m = mat(Math.cos(a) * r, H * 0.7, Math.sin(a) * r, rng.range(-0.15, 0.15), rng() * TAU, rng.range(-0.15, 0.15));
      if (clearCut(Math.cos(a) * r, Math.sin(a) * r, s + 2.5)) kit.rock.push(prep(g, { matrix: m, colorFn: colorRock(0.3, false) }));
    }
    // the cut's own stones: a few half-sunk boulders along its banks (its own stream), the pool's north side left to the lilies
    if (cutOn) {
      const cr = makeRng(((L.artSeed | 0) ^ 0xb200c) >>> 0);
      for (let k = 0; k < (low ? 4 : 7); k++) {
        const t = 0.12 + cr() * 0.78, side = cr() < 0.5 ? -1 : 1;
        if (side < 0 && N.pool && t > N.pool.t0 - 0.05 && t < N.pool.t1 + 0.05) continue;
        const al = N.r0 + t * (N.end - N.r0), s = cr.range(0.45, 1.05), lc = side * (notchHalfW(N, t) + 0.35 + s * 0.2);
        const lat = lc + notchBend(N, t), x = al * N.ca - lat * N.sa, z = al * N.sa + lat * N.ca;
        kit.rock.push(prep(rockGeo(cr, { r: s, h: s * cr.range(0.55, 0.9), detail: 1, rough: 0.35 }), { matrix: mat(x, -s * 0.12, z, 0, cr() * TAU, 0), colorFn: colorRock(1) }));
      }
    }
  }

  /**
   * LAKE2 §3.1 (lane W1): an outline water's banks, one mesh: the ground (world-outline.groundAt: each bank's face rising to its top,
   * the land behind it rolling up toward the rim, the islands their own low mounds) on a grid of `c` m over the basin and out under the
   * first ring, the waterline set through the grid's vertices (a vertex within half a cell of the shore is moved onto it), the deep bed
   * left out (the water hides it). Earth, root and moss in the kit's tones (lane W2 greens it); no cut stone. Its own stream.
   */
  function buildBanks() {
    const O = L.outline, c = low ? 3 : 2, Rt = R + 20, n = Math.ceil((2 * Rt) / c) + 1, x0 = -((n - 1) * c) / 2;
    const br = makeRng(((L.artSeed | 0) ^ 0xba4c5) >>> 0), ox = br() * 40, oz = br() * 40;
    const nv = n * n, pos = new Float32Array(nv * 3), col = new Float32Array(nv * 3), sv = new Float32Array(nv), g = { x: 0, z: 0 };
    const mossA = look ? new Float32Array(nv) : null;   // (LAKE 2, the art pass: where the green moss may lie; its drifts are cut per pixel)
    const wetC = scaleArr(mixArr(K.rock, K.wood, 0.4), 0.55), earthC = mixArr(K.wood, K.rockHi, 0.35), rootC = mixArr(K.wood, K.rock, 0.5);
    const LMG = look ? [lushColor(look, look.mossG, 1.45), lushColor(look, look.mossGHi, 1.2), Number(look.mossAmt) || 0.6] : null;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const v = j * n + i;
      let x = x0 + i * c, z = x0 + j * c;
      // (the ground's far edge a clean circle under the first ring: a vertex past it is set on it, so no cell's corner shows as a step)
      const rr = Math.hypot(x, z);
      if (rr > Rt) { x *= Rt / rr; z *= Rt / rr; }
      const s = sdfAt(O, x, z), onShore = Math.abs(s) < c * 0.45;
      if (onShore) { sdfGrad(O, x, z, g); x -= g.x * s; z -= g.z * s; }
      const y = onShore ? 0 : outlineGround(O, x, z);
      pos[v * 3] = x; pos[v * 3 + 1] = y; pos[v * 3 + 2] = z; sv[v] = onShore ? 0 : s;
      const n1 = fbm3(x * 0.12 + ox, y * 0.2, z * 0.12 + oz, 3), n2 = vnoise3(x * 0.45 + oz, y * 0.5, z * 0.45 + ox);
      let cc;
      if (y < 0.35) cc = mixArr(wetC, earthC, Math.max(0, y / 0.35) * 0.4);
      else {
        // (the face of a bank earth and root; the tops and the land behind them moss, in drifts)
        const top = Math.min(1, Math.max(0, -s - 2) / 4);
        if (look) { const f = vnoise3(x * 0.3 + ox, y * 0.3, z * 0.3 + oz); cc = mixArr(mixArr(earthC, rootC, n2), mixArr(K.moss, K.mossHi, f * 0.6), Math.min(1, top * 0.85)); }
        else cc = mixArr(mixArr(earthC, rootC, n2), mixArr(K.moss, K.mossHi, n1 * 0.8), Math.min(1, top * (0.55 + 0.6 * n1)));
      }
      cc = scaleArr(cc, 0.5 + 0.22 * n1);   // (earth under the vault: dark, as the Mossmere's banks; lane W2's moss and ferns light it)
      // (LAKE 2, lane W2: the green moss over the built violet: every bank top and the land behind it in drifts, the faces earth and root)
      // (in drifts that cover about `mossAmt` of the tops, whole where they lie, the earth showing between them: a carpet, not a tint)
      if (LMG) mossA[v] = Math.min(1, Math.max(0, -s - 0.6) / 2.5);   // (the drifts themselves: lushMoss, per pixel)
      col[v * 3] = cc[0]; col[v * 3 + 1] = cc[1]; col[v * 3 + 2] = cc[2];
    }
    const idx = [];
    for (let j = 0; j + 1 < n; j++) for (let i = 0; i + 1 < n; i++) {
      const a = j * n + i, b = a + 1, d = a + n, e = d + 1;
      if (sv[a] > 3 && sv[b] > 3 && sv[d] > 3 && sv[e] > 3) continue;   // (deep bed: under the water)
      const cx = x0 + i * c, cz = x0 + j * c;   // (a cell with any corner inside the circle: its outer corners lie on it)
      if (Math.min(Math.hypot(cx, cz), Math.hypot(cx + c, cz), Math.hypot(cx, cz + c), Math.hypot(cx + c, cz + c)) > Rt) continue;
      // (the diagonal that bends least)
      if (Math.abs(pos[a * 3 + 1] - pos[e * 3 + 1]) <= Math.abs(pos[b * 3 + 1] - pos[d * 3 + 1])) idx.push(a, d, e, a, e, b);
      else idx.push(a, d, b, b, d, e);
    }
    const geo = G(new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    if (mossA) geo.setAttribute('aMoss', new THREE.BufferAttribute(mossA, 1));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    // (smooth normals: the ground rolls; a flat-shaded grid zig-zags in the toon's steps. A low rim: seen at a grazing angle, a wide
    // ground takes the rim all over and reads as snow)
    const bankMat = M(inkToon({ color: 0xffffff, vertexColors: true, rim: look ? 0.05 : 0.14, rimColor: rimC, rimPower: 0.8, steps: 3, detail: 'stone', detailAmount: 0.3, wet: 0.5, gloss: 0.06, shine: 48, floor: 1 }, { fogScale: 0.8, fogMax: 0.95 }));
    if (look) { lushFloor(bankMat, bankFloorU, 'banks'); bankFloorU.gwFloraFloor.value = Number(look.floor) || 0.2; }   // (LAKE 2, lane W2: the moss's floor)
    if (look && LMG) {   // (LAKE 2, the art pass: the moss's drifts cut per pixel, crisp at any distance; its threshold from mossAmt)
      const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
      lushMoss(bankMat, { gwMossG: { value: v3(LMG[0]) }, gwMossGHi: { value: v3(LMG[1]) }, gwMossT: { value: 0.66 - 0.36 * LMG[2] } }, 'banks');
    }
    const mesh = new THREE.Mesh(geo, bankMat);
    mesh.name = 'banks';
    setupSurface(mesh);
    group.add(mesh);
  }

  mark('cliffs');
  // ==================================================================== VAULT DOME
  let domeMat, starK = 1, starDen = 1;
  {
    const prof = [];
    const n = 40;
    prof.push(new THREE.Vector2(L.domeA, L.domeY0 - 30));
    for (let i = 0; i <= n; i++) {
      const q = 1 - i / n; const r = L.domeA * q;
      prof.push(new THREE.Vector2(Math.max(0.01, r), domeY(L, r)));
    }
    const g = G(new THREE.LatheGeometry(prof, low ? 48 : 72));
    domeMat = M(domeMaterial({ low }));
    const dome = new THREE.Mesh(g, domeMat);
    dome.name = 'vault';
    dome.renderOrder = 50; // drawn after other opaques so early-z skips hidden pixels
    dome.frustumCulled = false;
    dome.layers.enable(REFLECT_LAYER);   // the lake mirrors the vault
    // in the lake's smaller reflection target a star covers more of the picture and is drawn dimmer for it (the dome
    // keeps a star's energy, not its brightness): give the mirrored vault that brightness back, so stars show in the water
    // (Lake 1 polish, "no glitter on the water": on the loop's Mossmere the mirror's stars are dimmer and thinner than the vault's (the
    // fine layers drop out), so the high tier's water no longer reads as snow; off the loop as built)
    dome.onBeforeRender = (renderer, scene, camera) => {
      const mir = camera.layers.mask === (1 << REFLECT_LAYER);
      // (LAKE 2, the art pass: on a lush water the mirror's stars fewer and dimmer still: at night they lay a lavender snow over the near
      // water under the low lens)
      domeMat.uniforms.uStars.value = starK * (mir ? (look ? 0.3 : wcOn ? 0.5 : 1.8) : 1);
      domeMat.uniforms.uStarDen.value = starDen * (mir && (wcOn || look) ? (look ? 0.3 : 0.4) : 1);
    };
    group.add(dome);
  }

  // ==================================================================== STARLIT SKY (DESIGN §19.1)
  // The nebulae sit low behind the hero landmark (north of the gate, where the camera looks), the
  // second higher and to the side; the milky-way band rises through the first. The water mirrors the
  // same sky (world passes `sky` to water.setSky), so its stars and nebula match the vault.
  const sky = (() => {
    const ga = -Math.PI / 2;   // north (-Z): the sail camera's fixed view direction
    const S = SKY[theme] || SKY.mossmere;
    const dirAt = (az, el) => new THREE.Vector3(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
    const d1 = dirAt(ga + S.az1, S.el1), d2 = dirAt(ga + S.az2, S.el2);
    const up = dirAt(ga + S.az1 + Math.PI * 0.85, 1.05);
    const bandN = new THREE.Vector3().crossVectors(d1, up).normalize();
    return { neb1: new THREE.Vector4(d1.x, d1.y, d1.z, S.w1), neb2: new THREE.Vector4(d2.x, d2.y, d2.z, S.w2), band: bandN };
  })();
  {
    const du = domeMat.uniforms;
    du.uNeb1.value.copy(sky.neb1); du.uNeb2.value.copy(sky.neb2); du.uBandN.value.copy(sky.band);
    du.uNeb.value.set(pal.nebula ?? 0xd296ae);
    du.uNebV.value.set(mixHex(pal.far, pal.nebula ?? 0xd296ae, 0.25)).multiplyScalar(0.55);
    du.uStarCol.value.set(mixHex(pal.light, 0xdcdeff, 0.5));
  }

  // ==================================================================== PARALLAX RINGS
  const rings = [];
  {
    const dists = low ? [18, 50, 100, 170] : [16, 40, 72, 118, 180];
    const nR = dists.length;
    for (let i = 0; i < nR; i++) {
      const r = R + dists[i] * L.ringScale;
      const yBot = -10, yTop = domeY(L, r) + 8;
      const ringH = yTop - yBot;
      const H = low ? 256 : 512;
      const W = (low ? 1024 : 2048) >> (i >= 3 ? 1 : 0);
      const circ = TAU * r;
      const my = H / ringH;
      const repeat = Math.max(1, Math.round((circ * my) / W));
      const mx = (W * repeat) / circ;
      const t = i / (nR - 1);
      const scale = Math.min(1.25, (ringH * (0.36 + 0.14 * t)) / 40);
      const hangScale = (ringH * (0.4 - 0.22 * t)) / 45;
      const painted = paintRing({ theme, layer: i, layers: nR, W, H, yTop, yBot, mx, scale, hangScale, hang: 1 - 0.6 * t, blur: i >= 3 ? (i - 2) * 0.9 : 0 }, makeRng(L.artSeed + i * 7919));
      prof['ring' + i] = painted.ms;
      const tex = T(new THREE.DataTexture(painted.data, W, H, THREE.RGFormat, THREE.UnsignedByteType));
      tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.generateMipmaps = true; tex.anisotropy = 4;
      tex.needsUpdate = true;
      const m = M(ringMaterial(tex, { repeat, offset: rng(), texelY: 1 / H }));
      m.uniforms.uNeb1.value.copy(sky.neb1); m.uniforms.uNeb2.value.copy(sky.neb2);
      m.uniforms.uMistBot.value = -6; m.uniforms.uMistTop.value = r * (0.2 + 0.08 * t);
      m.uniforms.uMistAmt.value = 0.25 + 0.6 * t;
      m.uniforms.uRimAmt.value = 0.95 - 0.7 * t;
      m.uniforms.uTopDark.value = 0.7;
      m.uniforms.uVaultLo.value = ringH * 0.32; m.uniforms.uVaultHi.value = ringH * 0.8; m.uniforms.uVaultAmt.value = 0.25 + 0.6 * t;
      const g = G(new THREE.CylinderGeometry(r, r, ringH, low ? 72 : 120, 1, true));
      g.translate(0, (yTop + yBot) / 2, 0);
      const mesh = new THREE.Mesh(g, m);
      mesh.name = 'ring' + i;
      mesh.renderOrder = -20 + (nR - 1 - i);
      mesh.frustumCulled = false;
      mesh.layers.enable(REFLECT_LAYER);
      group.add(mesh);
      rings.push({ mesh, mat: m, t });
    }
  }

  mark('rings');
  // ==================================================================== STALACTITES
  {
    const count = low ? 50 : 110;
    const base = new THREE.ConeGeometry(1, 1, 6, 4);
    base.translate(0, -0.5, 0);
    base.rotateX(Math.PI);
    base.translate(0, 0, 0);
    // cone now points down with its base at y=0
    wobble(base, 0.12, 2.2, 3);
    const g = G(base);
    const m = M(inkToon({ color: mixHex(pal.ink, KIT[theme]?.rock ?? 0x1b1e24, 0.6), rim: 0.6, rimColor: pal.far, steps: 3, flatShading: true }, { fogScale: 0.45, fogMax: 0.7 }));
    const im = new THREE.InstancedMesh(g, m, count);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), e = new THREE.Euler();
    for (let i = 0; i < count; i++) {
      const a = rng() * TAU, r = Math.sqrt(rng()) * (R + 70);
      const len = (r > R * 0.8 ? rng.range(10, 34) : rng.range(5, 18)) * (0.6 + rng() * 0.6);
      const w = len * rng.range(0.12, 0.2);
      p.set(Math.cos(a) * r, domeY(L, r) + 1.5, Math.sin(a) * r);
      e.set(rng.range(-0.08, 0.08), rng() * TAU, rng.range(-0.08, 0.08));
      q.setFromEuler(e); s.set(w, len, w);
      im.setMatrixAt(i, m4.compose(p, q, s));
    }
    im.instanceMatrix.needsUpdate = true;
    im.frustumCulled = false;
    im.name = 'stalactites';
    im.layers.enable(REFLECT_LAYER);
    group.add(im);
  }

  // ==================================================================== LIGHT SHAFTS
  const keyAz = new THREE.Vector3(keyDir.x, 0, keyDir.z).normalize();
  const shaftList = L.cracks.map((c) => {
    const r0 = Math.hypot(c.x, c.z);
    const topY = domeY(L, r0) - 3;
    return {
      bottom: V(c.x, 0, c.z),
      // the beams lean toward the key light (the same azimuth the shadows fall from), a little more than they did
      top: V(c.x + keyAz.x * Math.max(c.lean, 0.3) * topY, topY, c.z + keyAz.z * Math.max(c.lean, 0.3) * topY),
      wTop: c.width * 0.45, wBottom: c.width * 1.5, phase: c.phase, power: c.power,
    };
  });
  const shafts = createShafts(shaftList);
  shafts.geos.forEach(G); shafts.mats.forEach(M);
  group.add(shafts.mesh, shafts.pools);
  shaftList.forEach((s, i) => { if (i < 4) domeMat.uniforms.uCracks.value[i].set(s.top.x, s.top.y, s.top.z, s.power); });
  const crackTop = shaftList[0]?.top.clone() || V(0, 80, 0), crackBottom = shaftList[0]?.bottom.clone() || V(0, 0, 0);

  mark('stal+shafts');
  // ==================================================================== ISLANDS
  const islandRock = (o, mossAmt = 1) => {
    const main = prep(rockGeo(rng, { r: o.r, h: o.h, detail: o.r > 5 ? 3 : 2, rough: 0.34 }), { matrix: mat(o.x, o.h * 0.22 - 0.25, o.z, 0, o.rot, 0), colorFn: colorRock(mossAmt) });
    o._pos = main.attributes.position.array.slice();
    kit.rock.push(main);
    // a tilted stacked slab breaks the dome silhouette
    if (o.r > 3.6) {
      const a = o.rot + rng() * TAU, d = o.r * rng.range(0.1, 0.35), sr = o.r * rng.range(0.32, 0.5);
      kit.rock.push(prep(rockGeo(rng, { r: sr, h: sr * rng.range(0.8, 1.5), detail: 1, rough: 0.3, flare: 0.05 }), { matrix: mat(o.x + Math.cos(a) * d, o.h * 0.62, o.z + Math.sin(a) * d, rng.range(-0.35, 0.35), rng() * TAU, rng.range(-0.35, 0.35)), colorFn: colorRock(mossAmt * 0.7, false) }));
    }
    const k = 2 + ((rng() * 3) | 0);
    for (let i = 0; i < k; i++) {
      const a = o.rot + (i / k) * TAU + rng.range(-0.4, 0.4), d = o.r * rng.range(0.55, 0.85), s = o.r * rng.range(0.22, 0.4);
      kit.rock.push(prep(rockGeo(rng, { r: s, h: s * rng.range(0.6, 1.3), detail: 1, rough: 0.35 }), { matrix: mat(o.x + Math.cos(a) * d, s * 0.2, o.z + Math.sin(a) * d, 0, rng() * TAU, 0), colorFn: colorRock(mossAmt * 0.8) }));
    }
  };
  const topOf = (o, f = 0.55) => o.h * f + 0.2; // approximate surface height near island centre
  // actual rock surface height under (x,z): highest main-rock vertex nearby
  const surf = (o, x, z) => {
    if (o.outline && L.outline) return Math.max(0, outlineGround(L.outline, x, z) - 0.1);   // (an outline island is the banks' own ground)
    const a = o._pos; if (!a) return topOf(o);
    const rr = Math.max(0.9, o.r * 0.2), r2 = rr * rr;
    let best = -Infinity;
    for (let i = 0; i < a.length; i += 3) { const dx = a[i] - x, dz = a[i + 2] - z; if (dx * dx + dz * dz < r2 && a[i + 1] > best) best = a[i + 1]; }
    return Number.isFinite(best) ? best - 0.15 : 0;
  };

  // M1 step 3a: what the loop's places read of the built art (pure records, no geometry): the Toppled Bridge's piers as drawn
  // (their height and whether the top is broken) and every street lamp-post; opts.redress (LOOP.redress, W9's rest) swaps the
  // posts for rust bollards and buoy-lanterns
  const piers = [], lampPosts = [], slits = [];   // (slits: the gate towers' low candle slits, for the wildlife's moths)
  const redressOn = opts.redress === true && theme === 'mossmere';
  const RUST = lin(0x8a4b3a);
  function bollard(x, y, z, ry, light) {
    // a rust mooring bollard with a tall iron davit, a buoy-lantern hung on a short chain from its crook (the fix pass: the squat bollard
    // read as a brown lump and hid its low lantern; the lantern now hangs at the old lamp's height, clear of the bollard on every side,
    // and lights the same amber pool the lamp-post did)
    const b = latheGeo([[0.19, -0.3], [0.21, 0.0], [0.17, 0.95], [0.22, 1.0], [0.22, 1.08], [0.13, 1.12], [0.1, 1.17], [0.01, 1.19]], 10);
    kit.org.push(prep(b, { matrix: mat(x, y, z, 0, ry, 0), colorFn: (px, py) => mixArr(RUST, K.iron, py - y < 0.25 ? 0.6 : py - y > 0.94 ? 0.1 : 0.3) }));
    // the davit: up from the bollard's head and over in a shepherd's crook
    kit.org.push(prep(taperTube([V(0, 1.05, 0), V(0.02, 2.2, 0), V(0.08, 2.85, 0), V(0.32, 3.1, 0), V(0.6, 3.02, 0), V(0.68, 2.86, 0)], (t) => 0.055 - 0.02 * t, 5, 14), { matrix: mat(x, y, z, 0, ry, 0), color: K.iron }));
    const lx = x + Math.cos(-ry) * 0.68, lz = z + Math.sin(-ry) * 0.68, ly = y + 2.42;
    kit.org.push(prep(taperTube([V(0, 2.86, 0), V(0, 2.62, 0)], () => 0.018, 4, 3), { matrix: mat(lx, y, lz), color: K.iron }));
    // the buoy-lantern: a rust float-body with its glass cage and a hood
    const body = latheGeo([[0.01, -0.24], [0.16, -0.17], [0.19, -0.02], [0.15, 0.06], [0.06, 0.08], [0.06, 0.3], [0.16, 0.34], [0.03, 0.44], [0.01, 0.45]], 8);
    kit.org.push(prep(body, { matrix: mat(lx, ly - 0.24, lz), colorFn: (px, py) => (py < ly - 0.2 ? mixArr(RUST, K.wood, 0.3) : K.iron) }));
    if (light) {
      kit.glow.push(prep(new THREE.OctahedronGeometry(0.15, 0), { matrix: mat(lx, ly - 0.02, lz, 0, 0, 0, [1, 1.4, 1]), color: scaleArr(PL.candle, 2.4) }));
      halos.add(lx, ly - 0.02, lz, scaleArr(PL.candle, 1.1), 2.4);
      addAnchor(lx, ly, lz, candleLight, 3.0, 12);
    }
  }

  // ---------------- theme prop builders
  const P = {
    column(x, z, r, h, broken = true, baseY = 0) {
      const hh = h;
      const g = new THREE.CylinderGeometry(r * 0.82, r, hh, 12, 6, false);
      const pp = g.attributes.position;
      for (let i = 0; i < pp.count; i++) {
        const y = pp.getY(i), a = Math.atan2(pp.getZ(i), pp.getX(i));
        const flute = 1 - 0.06 * (0.5 + 0.5 * Math.cos(a * 12));
        let yy = y;
        if (broken && y > hh * 0.49) yy = y - vnoise3(Math.cos(a) * 3 + x, 0, Math.sin(a) * 3 + z) * hh * 0.25;
        pp.setXYZ(i, pp.getX(i) * flute, yy, pp.getZ(i) * flute);
      }
      g.computeVertexNormals();
      kit.rock.push(prep(g, { matrix: mat(x, baseY + hh / 2 - 0.4, z, rng.range(-0.05, 0.05), rng() * TAU, rng.range(-0.05, 0.05)), colorFn: (px, py) => mixArr(K.stone, K.moss, py - baseY < 1.6 ? 0.55 : py - baseY > hh * 0.75 ? 0.25 : 0.05) }));
      if (!broken) kit.rock.push(prep(new THREE.BoxGeometry(r * 2.3, r * 0.5, r * 2.3), { matrix: mat(x, baseY + hh - 0.2, z, 0, rng() * TAU, 0), color: K.stone }));
    },
    lamp(x, y, z, h = 3.2, light = true) {
      // M1 step 3a (W9 behind LOOP.redress, PLAN §2.4 item 3): with opts.redress the street lamp-post becomes a rust bollard with a
      // buoy-lantern on its head, merged into the same statics (0 net calls). The rng is drawn exactly as the post draws it, so
      // every other piece of the lake is placed as built; off the switch nothing here changes.
      if (redressOn) { const ry = rng() * TAU; lampPosts.push({ x, y, z, h, ry, light }); bollard(x, y, z, ry, light); return; }
      const post = new THREE.CylinderGeometry(0.07, 0.11, h, 6);
      kit.org.push(prep(post, { matrix: mat(x, y + h / 2, z), color: K.iron }));
      const arm = taperTube([V(0, h - 0.1, 0), V(0.35, h + 0.25, 0), V(0.75, h + 0.1, 0)], () => 0.045, 5, 8);
      const ry = rng() * TAU;
      lampPosts.push({ x, y, z, h, ry, light });
      kit.org.push(prep(arm, { matrix: mat(x, y, z, 0, ry, 0), color: K.iron }));
      const lx = x + Math.cos(-ry) * 0.75, lz = z + Math.sin(-ry) * 0.75, ly = y + h - 0.35;
      kit.org.push(prep(new THREE.ConeGeometry(0.26, 0.22, 6), { matrix: mat(lx, ly + 0.3, lz), color: K.iron }));
      if (light) {
        kit.glow.push(prep(new THREE.OctahedronGeometry(0.17, 0), { matrix: mat(lx, ly, lz, 0, 0, 0, [1, 1.4, 1]), color: scaleArr(PL.candle, 2.4) }));
        halos.add(lx, ly, lz, scaleArr(PL.candle, 1.1), 2.4);
        addAnchor(lx, ly, lz, candleLight, 3.0, 12);
      }
    },
    reeds(x, z, n = 5, h = 1.6) {
      for (let i = 0; i < n; i++) {
        const a = rng() * TAU, d = rng() * 0.7, hh = h * rng.range(0.6, 1.2);
        const g = new THREE.ConeGeometry(0.05, hh, 4);
        kit.fine.push(prep(g, { matrix: mat(x + Math.cos(a) * d, hh / 2 - 0.1, z + Math.sin(a) * d, rng.range(-0.2, 0.2), 0, rng.range(-0.2, 0.2)), color: mixArr(K.organic, K.mossHi, rng() * 0.4) }));
      }
    },
    pilings(x, z, r) {
      const n = 3 + ((rng() * 3) | 0);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + rng() * 0.6, d = r * rng.range(0.25, 0.75), h = rng.range(1.6, 4.4), w = rng.range(0.18, 0.28);
        const g = new THREE.CylinderGeometry(w * 0.85, w, h, 7, 2);
        wobble(g, 0.03, 3, i);
        kit.org.push(prep(g, { matrix: mat(x + Math.cos(a) * d, h / 2 - 0.5, z + Math.sin(a) * d, rng.range(-0.18, 0.18), rng() * TAU, rng.range(-0.18, 0.18)), colorFn: (px, py) => mixArr(K.wood, K.moss, py < 0.5 ? 0.5 : 0) }));
      }
      kit.org.push(prep(new THREE.TorusGeometry(r * 0.55, 0.05, 4, 16), { matrix: mat(x, 1.0, z, Math.PI / 2 + rng.range(-0.1, 0.1), 0, 0), color: mixArr(K.wood, K.bone, 0.3) }));
    },
    wreck(x, z, r, rot) {
      // half-sunken rowboat, bow lifted out of the water, broken mast
      const hull = new THREE.SphereGeometry(1, 12, 6, 0, TAU, Math.PI / 2, Math.PI / 2);
      const hp = hull.attributes.position;
      for (let i = 0; i < hp.count; i++) { const zz = hp.getZ(i); hp.setX(i, hp.getX(i) * (1 - 0.35 * zz * zz)); hp.setY(i, hp.getY(i) * (1 - 0.2 * zz * zz)); }
      hull.computeVertexNormals();
      const rx = -0.42, rz = rng.range(-0.3, 0.3);
      const hm = mat(x, 0.25, z, rx, rot, rz, [r * 0.55, r * 0.5, r * 1.25]);
      const plank = (px, py, pz) => { const k = 0.5 + 0.5 * Math.sin((py - 0.25) * 9.0); return mixArr(mixArr(K.wood, K.woodHi || K.wood, k * 0.8), K.moss, py < 0.25 ? 0.5 : 0.05); };
      kit.org.push(prep(hull, { matrix: hm, colorFn: plank }));
      // dark deck / interior lid just below the gunwale
      const lid = new THREE.CircleGeometry(0.92, 12).rotateX(-Math.PI / 2).translate(0, -0.08, 0);
      const lp = lid.attributes.position;
      for (let i = 0; i < lp.count; i++) { const zz = lp.getZ(i); lp.setX(i, lp.getX(i) * (1 - 0.35 * zz * zz)); }
      kit.org.push(prep(lid, { matrix: hm, color: scaleArr(K.wood, 0.45) }));
      // gunwale ribs
      for (let i = 0; i < 4; i++) {
        const t = (i / 3 - 0.5) * 1.4;
        const rib = taperTube([V(-0.95 * (1 - 0.35 * t * t), 0, t), V(-0.75, -0.6, t), V(0, -0.98, t), V(0.75, -0.6, t), V(0.95 * (1 - 0.35 * t * t), 0, t)], () => 0.06, 4, 10);
        kit.org.push(prep(rib, { matrix: hm, color: scaleArr(K.wood, 1.3) }));
      }
      // snapped mast
      const mh = r * rng.range(1.4, 2.2);
      const mast = new THREE.CylinderGeometry(0.1, 0.14, mh, 6).translate(0, mh / 2, 0);
      kit.org.push(prep(mast, { matrix: mat(x, 0.2, z, rx * 0.4 + rng.range(-0.25, 0.25), rot, rz + rng.range(0.2, 0.5)), color: K.wood }));
    },
    mushroom(x, y, z, h, capR, opts2 = {}) {
      const bend = opts2.bend ?? rng.range(-0.25, 0.25), ry = rng() * TAU;
      const sr = opts2.stalkR ?? capR * 0.16;
      const pts = [V(0, -0.3, 0), V(bend * h * 0.3, h * 0.4, 0), V(bend * h * 0.55, h * 0.8, 0), V(bend * h * 0.6, h, 0)];
      const stalk = taperTube(pts, (t) => sr * (1.35 - t * 0.45 + (t < 0.08 ? 0.4 * (1 - t / 0.08) : 0)), 8, 12);
      kit.org.push(prep(stalk, { matrix: mat(x, y, z, 0, ry, 0), colorFn: (px, py) => mixArr(K.organic, K.bone, 0.2 + 0.25 * Math.sin(py * 2.2)) }));
      const top = pts[3];
      const cx = x + Math.cos(-ry) * top.x, cz = z + Math.sin(-ry) * top.x, cy = y + top.y;
      const ch = capR * rng.range(0.35, 0.55);
      const cap = latheGeo([[0.01, 0], [capR * 0.5, -ch * 0.02], [capR * 0.92, -ch * 0.06], [capR, ch * 0.08], [capR * 0.85, ch * 0.55], [capR * 0.45, ch * 0.92], [0, ch]], 16);
      wobble(cap, capR * 0.04, 1.4, x);
      const tilt = bend * 0.6;
      kit.org.push(prep(cap, { matrix: mat(cx, cy, cz, tilt, ry, 0), colorFn: (px, py) => mixArr(K.cap || K.moss, K.capHi || K.mossHi, Math.max(0, (py - cy) / ch) * 0.8) }));
      // glowing gill underside
      const gill = latheGeo([[capR * 0.2, -ch * 0.05], [capR * 0.6, -ch * 0.08], [capR * 0.94, -ch * 0.03]], 16);
      const gc = opts2.gillColor || PL.glow;
      kit.glow.push(prep(gill, { matrix: mat(cx, cy - 0.02, cz, tilt, ry, 0), color: scaleArr(gc, 1.6) }));
      // cap spots
      const spots = (rng() * 5) | 0;
      for (let i = 0; i < spots; i++) {
        const a = rng() * TAU, d = capR * rng.range(0.2, 0.7);
        kit.glow.push(prep(new THREE.SphereGeometry(capR * 0.05, 5, 4), { matrix: mat(cx + Math.cos(a) * d, cy + ch * (1 - (d / capR) * 0.6) * 0.95, cz + Math.sin(a) * d), color: scaleArr(PL.accent, 2) }));
      }
      halos.add(cx, cy - ch * 0.3, cz, scaleArr(gc, 0.7), capR * 2.6);
      return { x: cx, y: cy, z: cz };
    },
    pod(x, y, z, s) {
      const n = 3 + ((rng() * 3) | 0);
      for (let i = 0; i < n; i++) {
        const a = rng() * TAU, d = s * rng.range(0.2, 0.9), h = s * rng.range(0.8, 2.6), rr = s * rng.range(0.35, 0.6);
        const px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
        kit.org.push(prep(taperTube([V(0, -0.3, 0), V(rng.range(-0.3, 0.3), h * 0.6, 0), V(0, h, 0)], (t) => rr * 0.22 * (1 - t * 0.4), 6, 8), { matrix: mat(px, y, pz, 0, rng() * TAU, 0), color: K.organic }));
        const gc = rng() < 0.5 ? PL.accent : PL.glow;
        const pg = new THREE.SphereGeometry(rr, 8, 6); wobble(pg, rr * 0.08, 3, i);
        kit.glow.push(prep(pg, { matrix: mat(px, y + h + rr * 0.6, pz, 0, 0, 0, [1, 1.25, 1]), colorFn: (qx, qy) => scaleArr(gc, 0.9 + 0.9 * Math.max(0, Math.min(1, (qy - (y + h)) / (rr * 1.6)))) }));
        halos.add(px, y + h + rr * 0.6, pz, scaleArr(gc, 0.6), rr * 5);
      }
    },
    crystals(x, y, z, s, n = 6, colors = [PL.glow, PL.accent], spread = s * 0.5) {
      const tint = colors[(rng() * colors.length) | 0];
      for (let i = 0; i < n; i++) {
        const h = s * rng.range(0.6, 1.8) * (i === 0 ? 1.4 : 1), r = h * rng.range(0.1, 0.16);
        const a = rng() * TAU, d = i === 0 ? 0 : spread * rng.range(0.3, 1);
        const g = crystalGeo(r, h, 6, 0.3);
        const base = mixArr(PL.ink, tint, 0.25);
        kit.glow.push(prep(g, { matrix: mat(x + Math.cos(a) * d, y, z + Math.sin(a) * d, rng.range(-0.45, 0.45) * (i ? 1 : 0.3), rng() * TAU, rng.range(-0.45, 0.45) * (i ? 1 : 0.3)), colorFn: (px, py) => mixArr(base, scaleArr(tint, 2.2), Math.max(0, Math.min(1, (py - y) / (h * 0.95))) ** 1.4) }));
      }
      halos.add(x, y + s * 0.9, z, scaleArr(tint, 0.55), s * 3.2);
      return tint;
    },
    obelisk(x, z, r, h) {
      const g = new THREE.CylinderGeometry(r * 0.55, r, h, 4, 1);
      const ry = rng() * TAU;
      kit.rock.push(prep(g, { matrix: mat(x, h / 2 - 0.4, z, rng.range(-0.06, 0.06), ry, rng.range(-0.06, 0.06)), colorFn: (px, py) => mixArr(K.rock, K.rockHi, 0.3 + 0.2 * Math.sin(py)) }));
      kit.rock.push(prep(new THREE.ConeGeometry(r * 0.62, r * 1.2, 4), { matrix: mat(x, h - 0.4 + r * 0.55, z, 0, ry, 0), color: K.rockHi }));
      // rune lines on each face
      for (let f = 0; f < 4; f++) {
        const a = ry + Math.PI / 4 + (f * Math.PI) / 2;
        for (let k = 0; k < 3; k++) {
          const yy = h * (0.25 + k * 0.2), rr = r * (1 - (yy / h) * 0.45) * 0.72;
          kit.glow.push(prep(new THREE.BoxGeometry(0.06, h * 0.12, 0.02), { matrix: mat(x + Math.cos(a) * rr, yy, z - Math.sin(a) * rr, 0, a + Math.PI / 2, 0), color: scaleArr(PL.glow, 2) }));
        }
      }
      halos.add(x, h * 0.5, z, scaleArr(PL.glow, 0.35), r * 4);
    },
    statue(x, z, s, sunk = 0.3, baseY = 0) {
      const ry = rng() * TAU;
      const body = latheGeo([[s * 0.95, -s * 0.5], [s * 0.9, s * 0.4], [s * 0.7, s * 1.2], [s * 0.45, s * 1.75], [s * 0.42, s * 2.05], [s * 0.01, s * 2.3]], 12);
      wobble(body, s * 0.05, 1.5, x);
      const y0 = baseY - sunk * s * 2;
      kit.rock.push(prep(body, { matrix: mat(x, y0, z, rng.range(-0.08, 0.08), ry, rng.range(-0.1, 0.1)), colorFn: (px, py) => mixArr(K.stone, K.moss, py < 0.6 ? 0.5 : 0.1) }));
      // hood + void face
      kit.rock.push(prep(new THREE.SphereGeometry(s * 0.5, 10, 8, 0, TAU, 0, Math.PI * 0.62), { matrix: mat(x, y0 + s * 2.0, z, 0.25, ry, 0), color: K.stone }));
      // two glowing eyes in the hood shadow
      const fx = Math.sin(ry), fz = Math.cos(ry);
      for (const sd of [-1, 1]) {
        const ex = x + fx * s * 0.42 + Math.cos(ry) * sd * s * 0.12, ez = z + fz * s * 0.42 - Math.sin(ry) * sd * s * 0.12;
        kit.glow.push(prep(new THREE.SphereGeometry(s * 0.05, 5, 4), { matrix: mat(ex, y0 + s * 2.02, ez), color: scaleArr(PL.light, 2.5) }));
      }
      // cradled orb of light
      const ox = x + fx * s * 0.9, oz = z + fz * s * 0.9, oy = y0 + s * 1.2;
      kit.glow.push(prep(new THREE.IcosahedronGeometry(s * 0.2, 1), { matrix: mat(ox, oy, oz), color: scaleArr(PL.candle, 2.4) }));
      halos.add(ox, oy, oz, scaleArr(PL.candle, 0.8), s * 3);
      addAnchor(ox, oy, oz, candleLight, 3.6, 14);
    },
    rib(x, z, r, h, rot) {
      const span = h * rng.range(0.35, 0.6);
      const pts = [V(0, -1, 0), V(span * 0.1, h * 0.45, 0), V(span * 0.45, h * 0.9, 0), V(span * 0.9, h * 1.0, 0), V(span * 1.2, h * 0.86, 0)];
      const g = taperTube(pts, (t) => r * (0.62 - t * 0.42) * (1 + 0.15 * Math.sin(t * 30)), 8, 18);
      kit.org.push(prep(g, { matrix: mat(x, 0, z, 0, rot, 0), colorFn: (px, py) => mixArr(scaleArr(K.bone, 0.75), K.bone, Math.min(1, py / h)) }));
    },
    vertebra(x, z, r, h) {
      const segs = Math.max(4, Math.round(h / (r * 1.1)));
      for (let i = 0; i < segs; i++) {
        const y = (i / segs) * h - 0.3, sh = h / segs;
        const w = r * (1 - (i / segs) * 0.35);
        const disc = new THREE.CylinderGeometry(w * 0.85, w * 0.95, sh * 0.62, 10, 1);
        kit.org.push(prep(disc, { matrix: mat(x, y + sh * 0.31, z, 0, i * 0.4, 0), color: mixArr(K.bone, scaleArr(K.bone, 0.7), (i % 2) * 0.4) }));
        const spur = new THREE.ConeGeometry(w * 0.22, w * 1.5, 5);
        kit.org.push(prep(spur, { matrix: mat(x, y + sh * 0.45, z, 0, i * 0.9, Math.PI / 2 + 0.3), color: K.bone }));
      }
    },
    coral(x, y, z, s, depth = 3) {
      const branch = (p, dir, len, w, depth) => {
        const end = p.clone().addScaledVector(dir, len);
        const mid = p.clone().lerp(end, 0.5).add(V(rng.range(-0.2, 0.2) * len, 0, rng.range(-0.2, 0.2) * len));
        kit.fine.push(prep(taperTube([p, mid, end], (t) => w * (1 - t * 0.45), 4, 3), { colorFn: (px, py) => mixArr(scaleArr(K.organic, 0.6), K.organic, Math.min(1, Math.max(0, py / (s * 2)))) }));
        if (depth > 0) for (let k = 0; k < 2; k++) {
          const d2 = dir.clone().add(V(rng.range(-0.7, 0.7), rng.range(0.2, 0.6), rng.range(-0.7, 0.7))).normalize();
          branch(end, d2, len * 0.7, w * 0.62, depth - 1);
        }
        else if (rng() < 0.4) { kit.glow.push(prep(new THREE.SphereGeometry(w * 1.1, 5, 4), { matrix: mat(end.x, end.y, end.z), color: scaleArr(PL.glow, 1.8) })); }
      };
      const n = 2 + ((rng() * 2) | 0);
      for (let i = 0; i < n; i++) branch(V(x + rng.range(-0.4, 0.4) * s, y - 0.4, z + rng.range(-0.4, 0.4) * s), V(rng.range(-0.3, 0.3), 1, rng.range(-0.3, 0.3)).normalize(), s * rng.range(0.8, 1.2), s * 0.16, depth);
    },
    candle(x, y, z, s = 1, lit = true) {
      const h = 0.25 * s * rng.range(0.6, 1.4);
      kit.org.push(prep(new THREE.CylinderGeometry(0.06 * s, 0.07 * s, h, 6), { matrix: mat(x, y + h / 2, z), color: K.bone }));
      if (lit) {
        kit.glow.push(prep(new THREE.ConeGeometry(0.035 * s, 0.12 * s, 5), { matrix: mat(x, y + h + 0.07 * s, z), color: scaleArr(PL.candle, 3) }));
        halos.add(x, y + h + 0.08 * s, z, scaleArr(PL.candle, 0.5), 0.9 * s);
      }
    },
  };

  // ---------------- islands per theme
  for (const o of L.islands) {
    if (!o.outline) islandRock(o, theme === 'paleabyss' ? 0.6 : 1);
    if (theme === 'mossmere') {
      if (o.big) {
        const c1x = o.x + o.r * 0.25, c1z = o.z - o.r * 0.1, c2x = o.x - o.r * 0.3, c2z = o.z + o.r * 0.2;
        P.column(c1x, c1z, 0.55, 3.2 + rng() * 2, true, surf(o, c1x, c1z));
        const c2y = surf(o, c2x, c2z), c2h = 1.8;
        P.column(c2x, c2z, 0.5, c2h, true, c2y);
        // a few candles left burning on the broken drum (warm pinpoints on pale stone)
        for (let i = 0; i < 3; i++) P.candle(c2x + rng.range(-0.25, 0.25), c2y + c2h * 0.62, c2z + rng.range(-0.25, 0.25), 1.2, true);
      }
      if (o.big || rng() < 0.55) { const lx = o.x + rng.range(-0.3, 0.3) * o.r, lz = o.z + rng.range(-0.3, 0.3) * o.r; P.lamp(lx, surf(o, lx, lz), lz, rng.range(2.8, 3.8)); }
      const nr = 3 + ((rng() * 4) | 0);
      for (let i = 0; i < nr; i++) { const a = rng() * TAU, d = o.r * rng.range(1.05, 1.35); P.reeds(o.x + Math.cos(a) * d, o.z + Math.sin(a) * d, 4 + ((rng() * 4) | 0), rng.range(1.0, 1.9)); }
    } else if (theme === 'sporewood' && look) {
      // (LAKE 2, lane W2: the isles are dressed by kind in world-sporewood.js)
    } else if (theme === 'sporewood') {
      const nm = o.big ? 3 : 1 + ((rng() * 2) | 0);
      for (let i = 0; i < nm; i++) {
        const a = rng() * TAU, d = o.r * rng.range(0, 0.45);
        const cap = rng.range(1.8, 3.6) * (o.big && i === 0 ? 1.6 : 1);
        const mx = o.x + Math.cos(a) * d, mz = o.z + Math.sin(a) * d;
        const m = P.mushroom(mx, surf(o, mx, mz), mz, cap * rng.range(1.6, 2.6), cap, { gillColor: rng() < 0.7 ? PL.glow : PL.accent });
        if (i === 0) addAnchor(m.x, m.y - 0.6, m.z, pal.glow, 3.2, 13);
      }
      const np = (rng() * 3) | 0;
      for (let i = 0; i < np; i++) { const a = rng() * TAU, d = o.r * rng.range(0.4, 0.8); const px = o.x + Math.cos(a) * d, pz = o.z + Math.sin(a) * d; P.pod(px, surf(o, px, pz), pz, rng.range(0.5, 0.9)); }
    } else if (theme === 'glasswater') {
      const nc = o.big ? 3 : 1 + ((rng() * 2) | 0);
      for (let i = 0; i < nc; i++) {
        const a = rng() * TAU, d = o.r * rng.range(0, 0.55);
        const cx = o.x + Math.cos(a) * d, cz = o.z + Math.sin(a) * d, cy = surf(o, cx, cz);
        const tint = P.crystals(cx, cy, cz, rng.range(1.6, 3.4) * (o.big && i === 0 ? 1.6 : 1), 5 + ((rng() * 4) | 0));
        if (i === 0) addAnchor(cx, cy + 2, cz, new THREE.Color().setRGB(tint[0], tint[1], tint[2]).getHex(), 3.5, 13);
      }
      if (o.big) { const sx = o.x - o.r * 0.2, sz = o.z + o.r * 0.15; P.statue(sx, sz, 1.3, 0.05, surf(o, sx, sz)); }
    } else {
      const nc = 1 + ((rng() * 3) | 0);
      for (let i = 0; i < nc; i++) { const a = rng() * TAU, d = o.r * rng.range(0.1, 0.6); const cx = o.x + Math.cos(a) * d, cz = o.z + Math.sin(a) * d; P.coral(cx, surf(o, cx, cz) + 0.2, cz, rng.range(0.9, 1.6), 2); }
      const nb = 1 + ((rng() * 2) | 0);
      for (let i = 0; i < nb; i++) { const a = rng() * TAU, d = o.r * rng.range(0.2, 0.7); P.rib(o.x + Math.cos(a) * d, o.z + Math.sin(a) * d, 0.35, rng.range(2.5, 4.5), rng() * TAU); }
      const nk = 3 + ((rng() * 6) | 0);
      for (let i = 0; i < nk; i++) { const a = rng() * TAU, d = o.r * rng.range(0.15, 0.75); const cx = o.x + Math.cos(a) * d, cz = o.z + Math.sin(a) * d; P.candle(cx, surf(o, cx, cz) + 0.1, cz, 1.3, rng() < 0.6); }
      if (o.big) addAnchor(o.x, surf(o, o.x, o.z) + 1.5, o.z, pal.glow, 3, 12);
    }
  }

  // ---------------- named set pieces on authored islands (data.js arena.islands[].kind)
  for (const o of L.islands) {
    if (o.kind === 'giant') P.statue(o.x, o.z, o.r * 0.42, 0.12, surf(o, o.x, o.z));          // the Kneeling giants
    else if (o.kind === 'monolith') P.obelisk(o.x, o.z, o.r * 0.34, rng.range(9, 13));          // Glasswater's monolith ring
    else if (o.kind === 'wreck') P.wreck(o.x, o.z, o.r * 0.9, o.rot);                         // funeral barges
    else if (o.kind === 'tower') P.column(o.x - o.r * 0.1, o.z + o.r * 0.15, o.r * 0.22, rng.range(7, 10), true, surf(o, o.x, o.z)); // the Drowned Gatehouse
  }

  for (const o of L.islands) delete o._pos;
  // ---------------- pillars / wrecks
  for (const p of L.pillars) {
    const s = p.h;
    switch (p.kind) {
      case 'column': {
        const h = rng.range(4, 9) * s, broken = rng() < 0.7;   // (the same draws, in the same order, as the built call)
        P.column(p.x, p.z, p.r * 0.95, h, broken);
        if (p.dataKind === 'pier') piers.push({ x: p.x, z: p.z, r: p.r * 0.95, h, broken });
        break;
      }
      case 'pilings': P.pilings(p.x, p.z, p.r); break;
      case 'wreck': P.wreck(p.x, p.z, p.r * 0.85, p.rot); break;
      case 'lamp':
        kit.rock.push(prep(rockGeo(rng, { r: p.r * 1.1, h: 0.9, detail: 1, rough: 0.25 }), { matrix: mat(p.x, 0.1, p.z, 0, p.rot, 0), colorFn: colorRock(1) }));
        P.lamp(p.x, 0.5, p.z, rng.range(3.5, 4.8));
        break;
      case 'stalk': {
        const cap = rng.range(3.2, 6.2) * s;
        const m = P.mushroom(p.x, 0, p.z, rng.range(8, 15) * s, cap, { stalkR: p.r * 0.75, bend: rng.range(-0.18, 0.18), gillColor: rng() < 0.65 ? PL.glow : PL.accent });
        addAnchor(m.x, m.y - 0.8, m.z, pal.glow, 4, 16);
        break;
      }
      case 'pod': P.pod(p.x, 0, p.z, p.r * 0.9); break;
      case 'shelf': {
        const h = rng.range(4, 7);
        const trunk = taperTube([V(0, -0.5, 0), V(0.3, h * 0.5, 0), V(-0.2, h, 0)], (t) => p.r * (0.75 - t * 0.35), 8, 10);
        kit.org.push(prep(trunk, { matrix: mat(p.x, 0, p.z, 0, p.rot, 0), color: K.wood }));
        for (let i = 0; i < 4; i++) {
          const yy = h * rng.range(0.2, 0.85), a = rng() * TAU, rr = p.r * rng.range(0.9, 1.6);
          const sh = latheGeo([[rr, 0], [rr * 0.6, 0.18], [0.01, 0.22]], 10);
          kit.org.push(prep(sh, { matrix: mat(p.x + Math.cos(a) * p.r * 0.5, yy, p.z + Math.sin(a) * p.r * 0.5, 0, 0, 0, [1, 1, 0.7]), color: K.cap || K.moss }));
          kit.glow.push(prep(new THREE.CircleGeometry(rr * 0.85, 10).rotateX(Math.PI / 2), { matrix: mat(p.x + Math.cos(a) * p.r * 0.5, yy - 0.02, p.z + Math.sin(a) * p.r * 0.5, 0, 0, 0, [1, 1, 0.7]), color: scaleArr(PL.glow, 1.3) }));
        }
        halos.add(p.x, h * 0.5, p.z, scaleArr(PL.glow, 0.5), 5);
        break;
      }
      case 'spire': {
        const tint = P.crystals(p.x, -0.4, p.z, rng.range(5, 9) * s, 4 + ((rng() * 3) | 0), undefined, p.r * 0.75);
        addAnchor(p.x, 3, p.z, new THREE.Color().setRGB(tint[0], tint[1], tint[2]).getHex(), 4, 15);
        break;
      }
      case 'obelisk': P.obelisk(p.x, p.z, p.r, rng.range(6, 10) * s); break;
      case 'statue': P.statue(p.x, p.z, p.r * 0.85, rng.range(0.15, 0.4)); break;
      case 'rib': P.rib(p.x, p.z, p.r * 0.9, rng.range(8, 14) * s, p.rot); break;
      case 'vertebra': P.vertebra(p.x, p.z, p.r, rng.range(5, 9) * s); break;
      case 'coral': P.coral(p.x, 0, p.z, p.r * 1.4); P.candle(p.x + p.r, 0.25, p.z, 1.6, true); break;
      default: P.column(p.x, p.z, p.r, 5, true);
    }
  }

  // ---------------- dock posts
  for (const d of L.docks) {
    for (const p of d.posts) {
      const h = rng.range(1.8, 2.4);
      const g = new THREE.CylinderGeometry(0.16, 0.2, h + 0.8, 7, 2);
      wobble(g, 0.02, 3, p.x);
      kit.org.push(prep(g, { matrix: mat(p.x, (h + 0.8) / 2 - 0.8, p.z, rng.range(-0.08, 0.08), rng() * TAU, rng.range(-0.08, 0.08)), colorFn: (px, py) => mixArr(K.wood, K.moss, py < 0.4 ? 0.5 : 0) }));
      kit.org.push(prep(new THREE.TorusGeometry(0.2, 0.05, 4, 10), { matrix: mat(p.x, h * 0.6, p.z, Math.PI / 2, 0, 0), color: mixArr(K.wood, K.bone, 0.4) }));
    }
  }

  // ---------------- hero landmarks just beyond the cliffs (real 3D parallax against the rings)
  const hero = { ink: [], glow: [] };
  let lushArt = null;   // (LAKE 2, lane W2: Sporewood's landmarks, a water with a look)
  const gateSlits = [];   // the Sunken Gate's eight candle slits: their glow boxes' vertices and halos (the loop's ambient flickers them)
  {
    // landmarks rise behind the Descent Gate (north, i.e. up-screen, for a gate at the lake centre)
    const ga = Math.hypot(L.gate.x, L.gate.z) < L.R * 0.2 ? -Math.PI / 2 : Math.atan2(L.gate.z, L.gate.x);
    const at = (a, extra) => { const r = L.shoreR(a) + extra; return [Math.cos(a) * r, Math.sin(a) * r]; };
    // (Clear Night: the landmarks are stone the key light can model, lit faces a step over their shadow sides, not flat ink)
    const inkC = mixArr(PL.ink, mixArr(K.rock, K.rockHi, 0.45), 0.68);
    if (theme === 'mossmere') {
      // the Sunken Gate: twin towers and a broken arch
      const [x, z] = at(ga, 16);
      const face = Math.atan2(-x, -z);
      const fx = Math.cos(face), fz = -Math.sin(face);
      // the facing side of each tower, toward the lake (window slits sit just proud of the wall)
      const wx = Math.sin(face), wz = Math.cos(face);
      for (const sd of [-1, 1]) {
        const tx = x + fx * sd * 13, tz = z + fz * sd * 13;
        const body = new THREE.CylinderGeometry(4.2, 5.2, 38, 8, 3);
        hero.ink.push(prep(body, { matrix: mat(tx, 15, tz, 0, face, sd * 0.03), color: inkC }));
        hero.ink.push(prep(new THREE.ConeGeometry(5.6, 14 + (sd > 0 ? 0 : 6), 8), { matrix: mat(tx, 34 + 7 + (sd > 0 ? 0 : 3), tz, 0, face, 0), color: inkC }));
        // candle-lit window slits climbing each tower (warm amber pinpoints on the ink, DESIGN §19.3)
        const wins = [[0, 22, 2.2], [sd * 1.6, 13, 1.6], [-sd * 1.2, 29, 1.4], [sd * 0.4, 6, 1.2]];
        for (const [off, wy, wh] of wins) {
          const r0 = 5.2 - (wy / 38) * 1.0 + 0.15;
          const px = tx + wx * r0 + fx * off, pz = tz + wz * r0 + fz * off;
          const box = prep(new THREE.BoxGeometry(0.7, wh, 0.3), { matrix: mat(px, wy, pz, 0, face, 0), color: scaleArr(PL.candle, 1.8) });
          const v0 = hero.glow.reduce((a, q) => a + q.attributes.position.count, 0);
          hero.glow.push(box);
          const halo = halos.add(px + wx * 0.6, wy, pz + wz * 0.6, scaleArr(PL.candle, 0.55), 4.5);
          const rec = wy <= 13 ? { x: px + wx * 0.6, y: wy, z: pz + wz * 0.6, k: 1 } : null;
          if (rec) slits.push(rec);
          gateSlits.push({ v0, n: box.attributes.position.count, halo, rec });   // (the loop's ambient: each slit's light, world-ambient's stepSlits)
        }
      }
      // braziers on the broken arch's crown
      for (const ax of [-9, -2.5, 4]) {
        const py = 26 + (ax + 13) * 0.55 - Math.abs(ax) * 0.08;
        const px = x + fx * ax + wx * 0.4, pz = z + fz * ax + wz * 0.4;
        halos.add(px, Math.min(36.5, py + 2.2), pz, scaleArr(PL.candle, 0.7), 3.6);
      }
      const arch = taperTube([V(-13, 26, 0), V(-8, 33, 0), V(0, 35.5, 0), V(6, 34, 0)], () => 1.6, 6, 16);
      hero.ink.push(prep(arch, { matrix: mat(x, 0, z, 0, face, 0), color: inkC }));
    } else if (theme === 'sporewood' && look) {
      // (LAKE 2, lane W2: the cap-rim window, the Mother Cap and the rest: world-sporewood.js, below)
      lushArt = buildSporewoodArt({ ctx, L, look, kit, hero, P, K, PL, halos, addAnchor, low, inkC });
    } else if (theme === 'sporewood') {
      for (let i = 0; i < 4; i++) {
        const a = ga + (i - 1.5) * 0.42 + rng.range(-0.08, 0.08);
        const [x, z] = at(a, rng.range(8, 16));
        const h = rng.range(34, 56), cr = rng.range(12, 20), ry = rng() * TAU;
        const st = taperTube([V(0, -2, 0), V(rng.range(-3, 3), h * 0.5, 0), V(rng.range(-5, 5), h, 0)], (t) => 2.6 * (1.3 - t * 0.5), 8, 12);
        hero.ink.push(prep(st, { matrix: mat(x, 0, z, 0, ry, 0), color: inkC }));
        const ch = cr * 0.4;
        const cap = latheGeo([[0.01, 0], [cr * 0.5, -ch * 0.02], [cr * 0.92, -ch * 0.06], [cr, ch * 0.08], [cr * 0.85, ch * 0.55], [cr * 0.45, ch * 0.92], [0, ch]], 18);
        hero.ink.push(prep(cap, { matrix: mat(x, h, z, rng.range(-0.1, 0.1), ry, rng.range(-0.1, 0.1)), color: mixArr(inkC, K.cap, 0.4) }));
        const gill = latheGeo([[cr * 0.2, -ch * 0.05], [cr * 0.6, -ch * 0.08], [cr * 0.94, -ch * 0.03]], 18);
        hero.glow.push(prep(gill, { matrix: mat(x, h - 0.15, z, 0, ry, 0), color: scaleArr(i % 2 ? PL.accent : PL.glow, 0.9) }));
        // gold spore-lights hanging under the cap rim
        for (let k = 0; k < 3; k++) { const a2 = ry + k * 2.1 + rng.range(-0.3, 0.3), rr = cr * rng.range(0.55, 0.85); halos.add(x + Math.cos(a2) * rr, h - ch * 0.25 - rng.range(0, 2), z + Math.sin(a2) * rr, scaleArr(PL.glow, 0.55), 5); }
      }
    } else if (theme === 'glasswater') {
      for (let i = 0; i < 5; i++) {
        const a = ga + (i - 2) * 0.33 + rng.range(-0.06, 0.06);
        const [x, z] = at(a, rng.range(8, 18));
        const h = rng.range(30, 62), r = h * rng.range(0.09, 0.13);
        const g = crystalGeo(r, h, 6, 0.25);
        const tint = i % 2 ? PL.accent : PL.glow;
        hero.glow.push(prep(g, { matrix: mat(x, -2, z, rng.range(-0.18, 0.18), rng() * TAU, rng.range(-0.18, 0.18)), colorFn: (px, py) => mixArr(mixArr(PL.ink, tint, 0.12), scaleArr(tint, 1.1), Math.max(0, Math.min(1, py / h)) ** 2.2) }));
      }
    } else {
      // colossal ribs arching overhead across the northern lake, broken tips, spine beyond the west shore
      const ux = Math.cos(ga), uz = Math.sin(ga);        // toward the gate
      const vx = -uz, vz = ux;                            // across the lake
      const side = rng() < 0.5 ? -1 : 1;
      const ribs = [0.05, 0.3, 0.55, 0.78];
      const roots = [];
      for (let i = 0; i < ribs.length; i++) {
        const d = ribs[i] * R;
        const half = Math.sqrt(Math.max(1, R * R - d * d));
        const peak = rng.range(30, 40) * (1 - ribs[i] * 0.25);
        const cx = ux * d, cz = uz * d;
        const P2 = (t, y) => V(cx + vx * side * t * half, y, cz + vz * side * t * half);
        const tip = rng.range(0.35, 0.75);
        const pts = [P2(-1.25, 16), P2(-1.0, peak * 0.85), P2(-0.45, peak), P2(0.05, peak * 0.97), P2(tip, peak * 0.72)];
        roots.push(pts[0]);
        const rib = taperTube(pts, (t) => 2.6 * (1 - t * 0.62) * (1 + 0.08 * Math.sin(t * 40)), 8, 26);
        hero.ink.push(prep(rib, { colorFn: (px, py) => mixArr(inkC, scaleArr(K.bone, 0.5), Math.min(1, py / peak) * 0.75) }));
      }
      const first = roots[0], last = roots[roots.length - 1];
      const ext0 = first.clone().addScaledVector(first.clone().sub(roots[1]).normalize(), 18);
      const ext1 = last.clone().addScaledVector(last.clone().sub(roots[roots.length - 2]).normalize(), 22);
      ext1.y -= 8;
      const spine = taperTube([ext0, ...roots, ext1], (t) => 3.6 * (1 - t * 0.45), 8, 22);
      hero.ink.push(prep(spine, { color: inkC }));
      // memorial candles still burning at the rib roots (amber pinpoints against bone and ink)
      for (const rp of roots) for (let k = 0; k < 3; k++) halos.add(rp.x + rng.range(-3, 3), rp.y - 13 + rng.range(-1, 1.5), rp.z + rng.range(-3, 3), scaleArr(PL.candle, 0.6), 3.2);
    }
  }
  mark('props');
  // >>> WC-3: the four shore reed beds and the reeds round the islands (thick on the rock isles, thin on the masonry ones), all in
  // the 'fine' static (0 new calls); open-ended cones (their foot is under the water)
  if (wcOn) {
    const wr = WF.faceRng(((L.artSeed | 0) ^ 0x5eed5) >>> 0);
    const plan = WF.reedPlan(L, wr, { low, avoid: WF.avoidList(L, ctx.data, zone.id || 'mossmere') });
    for (const c of plan) {
      for (let i = 0; i < c.n; i++) {
        const a = wr() * TAU, d = wr() * 0.6, hh = c.h * wr.range(0.6, 1.2);
        const g = new THREE.ConeGeometry(0.045, hh, 4, 1, true);
        kit.fine.push(prep(g, { matrix: mat(c.x + Math.cos(a) * d, hh / 2 - 0.12, c.z + Math.sin(a) * d, wr.range(-0.22, 0.22), wr() * TAU, wr.range(-0.22, 0.22)),
          color: mixArr(K.organic, K.mossHi, wr() * 0.45) }));
      }
    }
    prof.wcReeds = plan.length;
    // LOST-TACKLE §5.3: the cut's two reed banks (its own stream): clumps in the shallows along both sides, the mouth and the culvert
    // left open, thinner on the pool's north side where the lily bed lies; leaning out a little over the water
    const N = L.notch;
    if (N && theme === 'mossmere') {
      const br = makeRng(((L.artSeed | 0) ^ 0x4eed5) >>> 0);
      let stems = 0;
      for (let k = 0; k < (low ? 9 : 16); k++) {
        const t = 0.22 + (k / (low ? 9 : 16)) * 0.62 + br() * 0.04, side = k % 2 ? 1 : -1;   // (from 4 m in: none between the Veil and the plug)
        if (side < 0 && N.pool && t > N.pool.t0 && t < N.pool.t1 && br() < 0.7) continue;
        const hw = notchHalfW(N, t), lc = side * (hw - 0.25 - br() * 0.7), al = N.r0 + t * (N.end - N.r0) + br.range(-0.4, 0.4);
        const lat = lc + notchBend(N, t), cx = al * N.ca - lat * N.sa, cz = al * N.sa + lat * N.ca, n = 4 + ((br() * 4) | 0);
        for (let i = 0; i < n; i++) {
          const a = br() * TAU, d = br() * 0.5, hh = br.range(0.9, 1.8);
          const g = new THREE.ConeGeometry(0.04, hh, 4, 1, true);
          // (a reed leans out over the water: away from its bank)
          const lean = side * br.range(0.05, 0.22);
          kit.fine.push(prep(g, { matrix: mat(cx + Math.cos(a) * d, hh / 2 - 0.12, cz + Math.sin(a) * d, lean * N.ca, br() * TAU, -lean * N.sa + br.range(-0.12, 0.12)),
            color: mixArr(K.organic, K.mossHi, br() * 0.45) }));
          stems++;
        }
      }
      prof.cutReeds = stems;
    }
  }
  // <<< WC-3
  // the loop's drowned debris (LOOP.ambient.debris: a half-sunk rowboat, four rooftops; world.js puts them in the lake's obstacles),
  // merged into the stone and timber statics: no draw call of its own
  if (wcOn) { const dg = debrisGeos(debrisPieces(ctx?.data, zone.id || 'mossmere'), K); kit.rock.push(...dg.rock); kit.org.push(...dg.org); }
  // ---------------- merge statics
  const statics = [];
  const addStatic = (list, material, outline, name, cast = true) => {
    const g = merge(list);
    if (!g) return null;
    G(g);
    const mesh = new THREE.Mesh(g, material);
    mesh.name = name;
    if (outline) { const o = new THREE.Mesh(g, outline); o.name = name + ':outline'; o.renderOrder = -1; mesh.add(o); cutHook(o); }
    cutHook(mesh);
    setupSurface(mesh, { cast });   // the key light's shadow and the lake's reflection (outlines take neither)
    group.add(mesh);
    statics.push(mesh);
    return mesh;
  };
  addStatic(kit.rock, rockMat, olRock, 'rocks');
  // (LAKE 2, the art pass: on a lush water the organics take no ink hull, as its vegetation kit and landmarks take none: the tubes' hull
  // drew over the cream cap stalks and the Veil's log as black arches, "a black spider on an islet")
  addStatic(kit.org, orgMat, look ? null : olOrg, 'organics');
  // (WC-3: on the Mossmere under the loop the 'fine' static has its own material, the twitch's)
  const fineMat = wcOn ? M(twitchMat({ color: 0xffffff, vertexColors: true, rim: 0.3, rimColor: rimC, rimPower: 0.56, steps: 3, detail: 'wood', detailAmount: 0.7, grain: [0, 1, 0], wet: 0.5, gloss: 0.1, shine: 56, floor: 1 }, { fogScale: 0.9, fogMax: 1 }, 'reeds')) : orgMat;
  addStatic(kit.fine, fineMat, null, 'fine', false);   // reeds and coral twigs: too fine to cast
  addStatic(kit.glow, glowMat, null, 'glows');
  const heroMat = M(inkToon({ color: 0xffffff, vertexColors: true, flatShading: true, rim: 0.6, rimColor: pal.far, rimPower: 0.5, steps: 3, detail: 'stone', detailAmount: 0.8, gloss: 0.05, floor: 1.7 }, { fogScale: 0.5, fogMax: 0.72 }));
  addStatic(hero.ink, heroMat, null, 'landmarks');
  const heroGlows = addStatic(hero.glow, glowMat, null, 'landmarkGlows');
  // the loop's ambient (with ?wild on): the gate's slits flicker, and now and then one goes out and is lit again; written into the
  // landmark glows' colours and the slits' halos (base colours kept), 24 times a second on desktop, 12 on a phone
  const slitFx = wcOn && ambientOn(ctx?.data) && heroGlows && gateSlits.length ? (() => {
    const col = heroGlows.geometry.attributes.color, hc = halos.geo.attributes.aColor;
    const base = gateSlits.map((q) => ({ box: col.array.slice(q.v0 * 3, (q.v0 + q.n) * 3), halo: hc.array.slice(q.halo * 3, q.halo * 3 + 3) }));
    const v0 = Math.min(...gateSlits.map((q) => q.v0)), v1 = Math.max(...gateSlits.map((q) => q.v0 + q.n));
    const h0 = Math.min(...gateSlits.map((q) => q.halo)), h1 = Math.max(...gateSlits.map((q) => q.halo)) + 1;
    const C = ctx.data.LOOP.ambient.slits || {}, rng = WF.faceRng(0x5117a5);
    const S = createSlits(gateSlits.length, rng, C);
    let acc = 1;
    return {
      S,
      step(dt) {
        stepSlits(S, dt, rng, C);
        acc += dt;
        if (acc < (low ? 1 / 12 : 1 / 24)) return;
        acc = 0;
        for (let i = 0; i < gateSlits.length; i++) {
          const q = gateSlits[i], k = S.k[i], b = base[i];
          for (let j = 0; j < b.box.length; j++) col.array[q.v0 * 3 + j] = b.box[j] * k;
          for (let j = 0; j < 3; j++) hc.array[q.halo * 3 + j] = b.halo[j] * k;
          if (q.rec) q.rec.k = k;
        }
        col.clearUpdateRanges(); col.addUpdateRange(v0 * 3, (v1 - v0) * 3); col.needsUpdate = true;
        hc.clearUpdateRanges(); hc.addUpdateRange(h0 * 3, (h1 - h0) * 3); hc.needsUpdate = true;
      },
    };
  })() : null;

  mark('merge');
  // >>> LAKE 2, lane W2: the vegetation kit, stamped from its plan (its own seeded stream, after every builder), the Seep's fall and the
  // spore-haze (each one draw)
  let flora = null;
  if (look) {
    const D = ctx?.data, zid = zone.id || theme;
    const tierR = (() => { try { return ctx.render?.getQuality?.(); } catch { return null; } })();
    const tier = low ? 'low' : tierR === 'medium' || tierR === 'low' ? 'medium' : 'high';
    const glides = Object.values(D?.LOOP?.places || {}).filter((p) => p?.water === zid && Array.isArray(p.out)).map((p) => p.out);
    if (Array.isArray(D?.LOOP?.tutorial?.outPath?.[zid])) glides.push(D.LOOP.tutorial.outPath[zid]);
    const cam = D?.LOOP?.mooring?.[zid]?.cam, lens = [];
    for (const c of cam ? [cam, cam.portrait].filter(Boolean) : []) {
      lens.push({ x: c.pos[0], z: c.pos[2], r: 3 });
      for (let k = 1; k <= 6; k++) lens.push({ x: c.pos[0] + (c.look[0] - c.pos[0]) * k / 7, z: c.pos[2] + (c.look[2] - c.pos[2]) * k / 7, r: 1.5 });
    }
    const plan = floraPlan(L, look, { tier, avoid: WF.avoidList(L, D, zid), glides, geo: WATERCRAFT[zid]?.geometry || null, lens, caps: lushArt?.caps || [], extra: lushArt?.extra || [], rafts: D?.LOOP?.wildlife?.[zid]?.frogs?.groups || [] });
    flora = buildFlora(L, look, { tier, low, K, rimC, plan });
    group.add(flora.group);
    for (const m of flora.meshes) statics.push(m);
    if (lushArt?.falls) { G(lushArt.falls.geo); M(lushArt.falls.mat); group.add(lushArt.falls.mesh); }
    if (lushArt?.haze) { G(lushArt.haze.geo); M(lushArt.haze.mat); group.add(lushArt.haze.mesh); }
    prof.flora = flora.stats();
  }
  // <<< LAKE 2, lane W2
  // ==================================================================== FLOATERS
  const floaters = [];  // {mesh, i, x, z, y, ry, s, bob, hover, spin, halo, dx, dz, ph}
  const floatMeshes = [];
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e4 = new THREE.Euler(), s4 = new THREE.Vector3(), p4 = new THREE.Vector3();
  const makeFloatType = (geo, material, max, name, sf = {}) => {
    const im = new THREE.InstancedMesh(G(geo), material, max);
    im.count = 0; im.frustumCulled = false; im.name = name;
    // buoys and what stands up out of the water are mirrored and shadowed; what lies flat on it (pads, caps) only
    // takes the shadow
    setupSurface(im, { cast: sf.cast !== false, reflect: sf.reflect !== false });
    group.add(im); floatMeshes.push(im);
    return im;
  };
  const addFloater = (types, x, z, o2 = {}) => {
    const f = { x, z, ry: o2.ry ?? rng() * TAU, s: o2.s ?? 1, hover: o2.hover ?? 0, bob: o2.bob ?? 1, spin: o2.spin ?? 0, ph: rng() * TAU, drift: o2.drift ?? 0, idx: [], halo: -1, haloY: o2.haloY ?? 0.5, ox: x, oz: z };
    for (const im of types) { if (im.count < im.instanceMatrix.count) { f.idx.push([im, im.count]); im.count++; } }
    if (o2.halo) f.halo = halos.add(x, 0.5, z, o2.halo, o2.haloSize ?? 1.5);
    floaters.push(f);
    return f;
  };
  // lantern buoy (all themes; used for docks + decor)
  const buoyBody = latheGeo([[0.01, -0.5], [0.32, -0.35], [0.38, 0.0], [0.3, 0.18], [0.08, 0.25], [0.06, 1.15], [0.01, 1.2]], 8);
  prep(buoyBody, { colorFn: (x, y) => (y < 0.2 ? mixArr(K.wood, K.rockHi, 0.3) : K.iron) });
  const buoyGlass = new THREE.OctahedronGeometry(0.16, 0);
  buoyGlass.scale(1, 1.5, 1); buoyGlass.translate(0, 1.0, 0);
  prep(buoyGlass, { color: [1, 1, 1] });
  const buoyMat = M(inkToon({ color: 0xffffff, vertexColors: true, rim: 0.5, rimColor: pal.light, steps: 3 }, { fogScale: 0.9 }));
  const buoyGlowMat = M(glowMaterial(pal.lamp, 2.2));
  const nDecorBuoys = theme === 'paleabyss' ? 4 : 6;
  const buoyT = makeFloatType(buoyBody, buoyMat, L.docks.length + nDecorBuoys, 'buoys');
  const buoyG = makeFloatType(buoyGlass, buoyGlowMat, L.docks.length + nDecorBuoys, 'buoyLamps');
  // v3 (W1): the lake's two watch-lamps are dock buoys burning candle amber, not the cold buoy lamp (opts.watchDocks:
  // dock indices from world-v3's watchLampsFor; absent in a flag-off build, so nothing below changes there)
  const watchDocks = opts.watchDocks instanceof Set && opts.watchDocks.size ? opts.watchDocks : null;
  const watchG = watchDocks ? makeFloatType(buoyGlass, M(glowMaterial(mixHex(pal.candle, 0xffd59a, 0.35), 3.2)), watchDocks.size, 'watchLampGlass') : null;
  const dockBuoys = [];
  for (let di = 0; di < L.docks.length; di++) {
    const d = L.docks[di], w = !!watchG && watchDocks.has(di);
    const f = addFloater([buoyT, w ? watchG : buoyG], d.buoy.x, d.buoy.z, w ? { s: 1.18, halo: scaleArr(PL.candle, 1.0), haloSize: 3.4, haloY: 1.0, bob: 0.8 } : { halo: scaleArr(PL.lamp, 0.9), haloSize: 2.4, haloY: 1.0, bob: 0.8 });
    if (w) f.watch = true;
    dockBuoys.push(f);
  }
  const openPts = (n, minD, test) => {
    const out = [];
    for (let tries = 0; tries < n * 40 && out.length < n; tries++) {
      const a = rng() * TAU, d = Math.sqrt(rng()) * (R - 4);
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (!test(x, z)) continue;
      if (out.some((p) => Math.hypot(p.x - x, p.z - z) < minD)) continue;
      out.push({ x, z });
    }
    return out;
  };
  const clusterPts = (n, nClusters, spread, minD, test) => {
    const centres = openPts(nClusters, R * 0.35, (x, z) => test(x, z));
    const out = [];
    for (let tries = 0; tries < n * 30 && out.length < n && centres.length; tries++) {
      const c = centres[tries % centres.length];
      const a = rng() * TAU, d = Math.sqrt(rng()) * spread;
      const x = c.x + Math.cos(a) * d * 1.6, z = c.z + Math.sin(a) * d * 0.7;
      if (!test(x, z)) continue;
      if (out.some((p) => Math.hypot(p.x - x, p.z - z) < minD)) continue;
      out.push({ x, z });
    }
    return out;
  };
  const clearOf = (x, z, pad) => {
    if (fromShore(L, x, z) < pad) return false;
    for (const o of L.obstacles) if (Math.hypot(x - o.x, z - o.z) < o.r + pad) return false;
    if (Math.hypot(x - L.gate.x, z - L.gate.z) < L.gate.radius + 3 + pad) return false;
    return true;
  };
  for (const p of openPts(nDecorBuoys, 14, (x, z) => clearOf(x, z, 3) && Math.hypot(x - L.spawn.x, z - L.spawn.z) > 6)) {
    addFloater([buoyT, buoyG], p.x, p.z, { halo: scaleArr(PL.lamp, 0.8), haloSize: 2.2, haloY: 1.0, bob: 0.8 });
  }
  if (theme === 'mossmere') {
    const pad = new THREE.CylinderGeometry(0.55, 0.55, 0.04, 12, 1, false, 0.3, TAU - 0.6);
    prep(pad, { colorFn: (x, y, z) => scaleArr(mixArr(K.organic, K.woodHi, 0.2 + 0.5 * vnoise3(x * 3, 0, z * 3)), 0.7) });
    const padOpts = { color: 0xffffff, vertexColors: true, rim: 0.18, rimColor: pal.far, steps: 3 };
    const padMat = M(wcOn ? twitchMat(padOpts, { fogScale: 0.9 }, 'pads') : inkToon(padOpts, { fogScale: 0.9 }));
    const flowerG = new THREE.ConeGeometry(0.1, 0.16, 6); flowerG.translate(0.1, 0.1, 0.05);
    prep(flowerG, { color: [1, 1, 1] });
    const flowerMat = M(glowMaterial(pal.accent, 2.4));
    const nP = low ? 40 : 75;
    // (WC-3: the four lily beds' pads ride in the same InstancedMesh, after the floaters: static, bobbed in the shader only)
    const bedPads = wcOn ? WF.bedPadPlan(L, WF.faceRng(((L.artSeed | 0) ^ 0xbed5) >>> 0), { low, avoid: WF.avoidList(L, ctx.data, zone.id || 'mossmere') }) : [];
    // (LOST-TACKLE §5.3: the cut's one lily bed, 8 pads where it widens, on its north side: the raft passes along the south)
    if (wcOn && L.notch?.pool) {
      const N = L.notch, pr = makeRng(((L.artSeed | 0) ^ 0x11a5) >>> 0), mine = [];
      for (let tries = 0; tries < 200 && mine.length < 8; tries++) {
        const t = N.pool.t0 + 0.04 + pr() * (N.pool.t1 - N.pool.t0 - 0.08), hw = notchHalfW(N, t), lc = -(0.7 + pr() * (hw - 1.3));
        const al = N.r0 + t * (N.end - N.r0), lat = lc + notchBend(N, t), x = al * N.ca - lat * N.sa, z = al * N.sa + lat * N.ca;
        if (mine.some((q) => Math.hypot(q.x - x, q.z - z) < 0.95)) continue;
        mine.push({ x, z, ry: pr() * TAU, s: pr.range(0.6, 1.15), ph: pr() * TAU, bed: 4 });
      }
      bedPads.push(...mine);
      prof.cutPads = mine.length;
    }
    const padT = makeFloatType(pad, padMat, nP + bedPads.length, 'lilypads', { cast: false, reflect: false });
    const aBed = wcOn ? new THREE.InstancedBufferAttribute(new Float32Array(nP + bedPads.length), 1) : null;
    if (aBed) padT.geometry.setAttribute('aBed', aBed);
    const flT = makeFloatType(flowerG, flowerMat, 18, 'lilyflowers', { reflect: false });
    // lily pads cluster in shallows around islands and the shore
    let placed = 0;
    for (let tries = 0; tries < 800 && placed < nP; tries++) {
      let x, z;
      if (rng() < 0.65 && L.islands.length) { const o = rng.pick(L.islands); const a = rng() * TAU, d = o.r + rng.range(0.6, 4); x = o.x + Math.cos(a) * d; z = o.z + Math.sin(a) * d; }
      else { const a = rng() * TAU, d = L.shoreR(a) - rng.range(1.5, 7); x = Math.cos(a) * d; z = Math.sin(a) * d; }
      if (!clearOf(x, z, 0.6)) continue;
      const withFlower = rng() < 0.22 && flT.count < 18;
      addFloater(withFlower ? [padT, flT] : [padT], x, z, { s: rng.range(0.6, 1.4), bob: 0.4, halo: withFlower ? scaleArr(PL.accent, 0.5) : null, haloSize: 0.8, haloY: 0.15 });
      placed++;
    }
    // >>> WC-3: the bed pads (never in `floaters`: the CPU bob loop does not see them)
    for (const q of bedPads) {
      if (padT.count >= padT.instanceMatrix.count) break;
      const i = padT.count++;
      e4.set(0, q.ry, 0, 'YXZ'); q4.setFromEuler(e4); s4.setScalar(q.s);
      padT.setMatrixAt(i, m4.compose(p4.set(q.x, 0.015, q.z), q4, s4));
      aBed.setX(i, 1);
    }
    if (aBed) { aBed.needsUpdate = true; padT.instanceMatrix.needsUpdate = true; prof.wcPads = bedPads.length; }
    // <<< WC-3
  } else if (theme === 'sporewood' && look) {
    // (LAKE 2, lane W2: the lily caps became the kit's lily and leaf rafts)
  } else if (theme === 'sporewood') {
    const capG = latheGeo([[0.01, 0], [0.2, -0.02], [0.34, 0.02], [0.22, 0.12], [0.01, 0.16]], 10);
    prep(capG, { colorFn: (x, y) => (y < 0.01 ? scaleArr(PL.glow, 1.6) : mixArr(K.cap, K.capHi, y * 4)) });
    const capMat = M(new THREE.MeshBasicMaterial({ vertexColors: true, fog: true, toneMapped: false }));
    const n = low ? 22 : 40;
    const capT = makeFloatType(capG, capMat, n, 'floatcaps', { reflect: false });
    for (const p of clusterPts(n, 5, 8, 2, (x, z) => clearOf(x, z, 1))) addFloater([capT], p.x, p.z, { s: rng.range(0.7, 1.6), bob: 0.5, drift: rng.range(0.6, 1.8), halo: rng() < 0.5 ? scaleArr(rng() < 0.5 ? PL.glow : PL.accent, 0.35) : null, haloSize: 1.1, haloY: 0.05 });
  } else if (theme === 'glasswater') {
    const shG = crystalGeo(0.16, 0.9, 6, 0.35); shG.translate(0, -0.45, 0);
    prep(shG, { colorFn: (x, y) => mixArr(mixArr(PL.ink, PL.glow, 0.3), scaleArr(PL.glow, 2.2), Math.max(0, Math.min(1, (y + 0.45) / 0.9))) });
    const shMat = M(new THREE.MeshBasicMaterial({ vertexColors: true, fog: true, toneMapped: false }));
    const n = low ? 10 : 16;
    const shT = makeFloatType(shG, shMat, n, 'floatshards');
    for (const p of openPts(n, 8, (x, z) => clearOf(x, z, 1.5))) addFloater([shT], p.x, p.z, { s: rng.range(0.8, 1.8), hover: rng.range(0.8, 2.4), spin: rng.range(0.2, 0.6) * (rng() < 0.5 ? -1 : 1), halo: scaleArr(PL.glow, 0.45), haloSize: 2.0, haloY: 0 });
  } else {
    const candG = new THREE.CylinderGeometry(0.06, 0.075, 0.26, 6); candG.translate(0, 0.08, 0);
    prep(candG, { colorFn: (x, y) => (y < -0.02 ? mixArr(K.wood, K.bone, 0.3) : K.bone) });
    const candMat = M(inkToon({ color: 0xffffff, vertexColors: true, rim: 0.4, rimColor: pal.light, steps: 3 }, { fogScale: 0.9 }));
    const flG = new THREE.ConeGeometry(0.035, 0.12, 5); flG.translate(0, 0.28, 0);
    prep(flG, { color: [1, 1, 1] });
    const flMat = M(glowMaterial(pal.glow, 3));
    const n = low ? 45 : 80;
    const cT = makeFloatType(candG, candMat, n, 'candles', { cast: false, reflect: false });
    const fT = makeFloatType(flG, flMat, n, 'candleflames');
    for (const p of clusterPts(n, 6, 9, 1.4, (x, z) => clearOf(x, z, 0.8))) {
      const lit = rng() < 0.42;
      addFloater(lit ? [cT, fT] : [cT], p.x, p.z, { s: rng.range(0.9, 1.6), bob: 0.6, drift: rng.range(0.4, 1.4), halo: lit ? scaleArr(PL.glow, 0.42) : null, haloSize: 0.9, haloY: 0.3 });
    }
  }
  halos.commit();

  mark('floaters');
  // ==================================================================== GATE
  const gate = buildGate();
  function buildGate() {
    const gg = new THREE.Group();
    gg.name = 'descentGate';
    gg.position.set(L.gate.x, 0, L.gate.z);
    const rad = L.gate.radius;
    const stones = [], glyphs = [];
    // flat rune ring at the waterline. The loop (Lake 1 polish: never a ring round the raft): the ring lies broken, a run of uneven
    // worn stones with gaps, some sunk lower, so the gate never reads as a closed circle round a raft that drifts into it
    const stoneCol = (x, y, z) => mixArr(K.stone, K.rock, 0.4 + 0.3 * vnoise3(x, y, z));
    const arcs = [];
    if (L.outline && L.gate.none) { /* (an outline water with no gate draws no ring at all) */ }
    else if (opts.loop === true) {
      let a0 = rng() * TAU;
      for (let n = 0; n < 9; n++) {
        const len = 0.28 + rng() * 0.42, gap = 0.18 + rng() * 0.32;
        if (rng() < 0.82) {
          const tube = 0.32 + rng() * 0.26, seg = new THREE.TorusGeometry(rad + 0.45 + rng() * 0.3, tube, 5, Math.max(3, Math.round(len * 9)), len);
          seg.rotateZ(a0); seg.rotateX(Math.PI / 2); seg.scale(1, 0.35 + rng() * 0.25, 1); seg.translate(0, -0.12 + rng() * 0.12, 0);
          stones.push(prep(seg, { colorFn: stoneCol }));
          arcs.push([a0, a0 + len]);
        }
        a0 += len + gap;
      }
    } else {
      const ring = new THREE.TorusGeometry(rad + 0.55, 0.5, 6, 40);
      ring.rotateX(Math.PI / 2); ring.scale(1, 0.45, 1); ring.translate(0, 0.02, 0);
      stones.push(prep(ring, { colorFn: stoneCol }));
    }
    // (the loop's broken ring carries no lit notches: worn stone only)
    const nG = arcs.length ? 0 : 24;
    for (let i = 0; i < nG; i++) {
      const a = (i / nG) * TAU;
      const g = new THREE.BoxGeometry(0.08, 0.02, i % 3 === 0 ? 0.5 : 0.3);
      glyphs.push(prep(g, { matrix: mat(Math.cos(a) * (rad + 0.55), 0.24, Math.sin(a) * (rad + 0.55), 0, -a + (i % 2 ? 0.5 : -0.4), 0), color: [1, 1, 1] }));
    }
    // standing stones with glyphs on their inner faces
    for (const s of L.gate.stones) {
      const lx = s.x - L.gate.x, lz = s.z - L.gate.z;
      const slab = rockGeo(rng, { r: 0.75, h: s.h * 0.5, detail: 1, rough: 0.22, flare: 0.15 });
      slab.scale(1, 1, 0.6);
      const face = Math.atan2(-lx, -lz);
      stones.push(prep(slab, { matrix: mat(lx, s.h * 0.42 - 0.3, lz, s.lean, face, s.lean * 0.5), colorFn: (x, y, z) => mixArr(K.stone, K.moss, y < 0.5 ? 0.45 : 0.1 * vnoise3(x * 2, y * 2, z * 2)) }));
      const fx = -lx / Math.hypot(lx, lz), fz = -lz / Math.hypot(lx, lz);
      for (let k = 0; k < 3; k++) {
        const yy = s.h * (0.35 + k * 0.17);
        glyphs.push(prep(new THREE.BoxGeometry(k === 1 ? 0.42 : 0.1, k === 1 ? 0.07 : 0.32, 0.03), { matrix: mat(lx + fx * 0.47, yy, lz + fz * 0.47, 0, face, k === 2 ? 0.6 : 0), color: [1, 1, 1] }));
      }
    }
    const none = () => new THREE.BufferGeometry();   // (an outline water with no gate: no stones, no glyphs; the gate stays hidden)
    const stoneMesh = new THREE.Mesh(G(merge(stones) || none()), rockMat);
    stoneMesh.name = 'gateStones';
    const sol = new THREE.Mesh(stoneMesh.geometry, olRock); sol.renderOrder = -1; stoneMesh.add(sol);
    cutHook(stoneMesh); cutHook(sol);
    const glyphHex = mixHex(pal.glow, pal.accent, 0.5);   // gate filigree leans to the lake's accent
    const glyphMat = M(new THREE.MeshBasicMaterial({ color: new THREE.Color(glyphHex), fog: true, toneMapped: false }));
    const glyphMesh = new THREE.Mesh(G(merge(glyphs) || none()), glyphMat);
    const vort = M(vortexMaterial());
    vort.uniforms.uGlow.value.set(pal.glow); vort.uniforms.uFoam.value.set(pal.foam); vort.uniforms.uDeep.value.set(pal.waterDeep);
    const disc = new THREE.Mesh(G(new THREE.CircleGeometry(rad + 0.2, 64).rotateX(-Math.PI / 2)), vort);
    disc.position.y = 0.09; disc.renderOrder = 1;
    const colM = M(columnMaterial()); colM.uniforms.uColor.value.set(pal.glow);
    const column = new THREE.Mesh(G(new THREE.CylinderGeometry(rad * 0.55, rad * 0.95, 30, 32, 1, true).translate(0, 15, 0)), colM);
    column.renderOrder = 5;
    const spiral = createSpiral(low ? 70 : 140, rad, rng);
    G(spiral.geo); M(spiral.mat);
    spiral.uniforms.uColor.value.set(pal.glow); spiral.uniforms.uFoam.value.set(pal.foam);
    setupSurface(stoneMesh); glyphMesh.layers.enable(REFLECT_LAYER); column.layers.enable(REFLECT_LAYER);
    gg.add(stoneMesh, glyphMesh, disc, column, spiral.points);
    group.add(gg);
    const haloI = halos.add(L.gate.x, 1.2, L.gate.z, [0, 0, 0], rad * 4.5);
    halos.commit();
    const anchor = addAnchor(L.gate.x, 1.5, L.gate.z, pal.glow, 0, 22);
    anchor.gate = true;
    const glowC = lin(pal.glow), glyphC = lin(glyphHex), quiet = opts.loop === true;
    const st = { state: 'sealed', open: 0, seal: 1, vis: 1, burst: 0 };
    return {
      group: gg, anchor,
      set(state, instant) {
        const prev = st.state;
        st.state = state;
        if (instant) { st.open = state === 'open' ? 1 : 0; st.vis = state === 'hidden' ? 0 : 1; st.burst = 0; }
        else if (state === 'open' && prev !== 'open') st.burst = 1;
      },
      get state() { return st.state; },
      get openK() { return st.open; },
      update(dt, t, env) {
        const tOpen = st.state === 'open' ? 1 : 0, tVis = st.state === 'hidden' ? 0 : 1;
        st.open += (tOpen - st.open) * Math.min(1, dt * (tOpen ? 0.9 : 2.5));
        st.vis += (tVis - st.vis) * Math.min(1, dt * 3);
        st.burst = Math.max(0, st.burst - dt * 0.6);
        gg.visible = st.vis > 0.02;
        if (!gg.visible) { halos.setColor(haloI, 0, 0, 0); anchor.intensity = 0; return; }
        const o = st.open, glowAmt = (0.18 + 0.82 * o + st.burst * 1.2) * env.glowK;
        glyphMat.color.setRGB(glyphC[0] * (0.4 + 2.2 * o) * glowAmt, glyphC[1] * (0.4 + 2.2 * o) * glowAmt, glyphC[2] * (0.4 + 2.2 * o) * glowAmt);
        vort.uniforms.uTime.value = t; vort.uniforms.uOpen.value = o * st.vis; vort.uniforms.uSeal.value = st.vis * (1 - o);
        // (the loop: the sealed gate is scenery, its lit rune-ripple disc and halo gone: no lighter plate round a raft inside it)
        if (quiet) { vort.uniforms.uSeal.value = 0; disc.visible = o > 0.01; }
        colM.uniforms.uTime.value = t; colM.uniforms.uOpen.value = o * (0.8 + st.burst);
        column.visible = o > 0.01;
        spiral.uniforms.uTime.value = t; spiral.uniforms.uOpen.value = o;
        spiral.points.visible = o > 0.01;
        const hk = ((quiet ? 0 : 0.08) + 1.1 * o + st.burst) * env.glowK;
        halos.setColor(haloI, glowC[0] * hk, glowC[1] * hk, glowC[2] * hk);
        halos.touchColors();
        anchor.intensity = 7 * o + 10 * st.burst;
        gg.scale.setScalar(0.6 + 0.4 * st.vis);
      },
      viewH(h) { spiral.uniforms.uViewH.value = h; },
    };
  }

  // ==================================================================== MIST + PARTICLES
  const mist = M(mistMaterial());
  {
    // (an outline water's mist band follows its shore, 1.5 m back from the waterline, round the curve; a polar one is a ring)
    const g = G(L.outline ? shoreBand(L.outline, 1.5, 11, low ? 4 : 2) : new THREE.CylinderGeometry(R + 1.5, R + 1.5, 11, low ? 64 : 128, 1, true));
    g.translate(0, 4.5, 0);
    const m = new THREE.Mesh(g, mist);
    m.renderOrder = -2; m.frustumCulled = false; m.name = 'shoreMist';
    mist.uniforms.uRep.value = Math.round(R / 3);
    if (L.outline) { mist.side = THREE.DoubleSide; mist.uniforms.uRep.value = Math.round(L.outline.len / 19); }   // (the band's grain as the ring's: about 3 m)
    group.add(m);
  }
  // foam/ripple rings hugging every island, pillar and gate stone
  const ringSrc = [];
  for (const o of L.islands) if (!o.outline) ringSrc.push({ x: o.x, z: o.z, r: o.r * 1.08 + 0.1, seed: o.seed });   // (an outline island's shore is in the water's bake)
  for (const p of L.pillars) ringSrc.push({ x: p.x, z: p.z, r: p.r * 0.9, seed: p.seed });
  if (!L.gate.none) for (const s of L.gate.stones) ringSrc.push({ x: s.x, z: s.z, r: s.r * 0.9, seed: s.a * 10 });   // no foam round the final lake's absent stones
  for (const d of L.docks) for (const p of d.posts) ringSrc.push({ x: p.x, z: p.z, r: 0.25, seed: p.x });
  const foam = createShoreRings(ringSrc);
  G(foam.geo); M(foam.mat);
  group.add(foam.mesh);
  // low mist sheets drifting over the water
  const sheetSrc = [];
  for (let i = 0; i < (low ? 6 : 12); i++) {
    const a = rng() * TAU, d = Math.sqrt(rng()) * R * 0.9;
    sheetSrc.push({ x: Math.cos(a) * d, y: rng.range(0.35, 1.6), z: Math.sin(a) * d, size: rng.range(14, 28), phase: rng() * TAU, drift: rng.range(0.5, 1.5) });
  }
  const sheets = createMistSheets(sheetSrc);
  G(sheets.geo); M(sheets.mat);
  group.add(sheets.mesh);

  const PCFG = {
    mossmere: [
      // silver-grey drift (dimmer and greyer than enemy eyes and the spot pulse), a few lilac/periwinkle big motes
      // (Lake 1 polish: the drift starts a metre up, so seen from the raft's camera no mote lies on the still water as a fleck)
      { count: 380, box: [64, 14, 64], yMin: 1.0, size: 0.1, vel: [0.12, 0.06, 0.05], sway: 0.9, twinkle: 0.8, colorA: mixHex(mixHex(pal.light, pal.far, 0.45), 0x8a8e96, 0.25), colorB: mixHex(pal.light, pal.far, 0.3), opacity: 0.8 },
      { count: 80, box: [76, 5, 76], yMin: 1.2, size: 0.22, vel: [0.05, 0.02, -0.04], sway: 1.8, twinkle: 2.4, colorA: pal.glow, colorB: pal.accent, opacity: 0.85 },
    ],
    sporewood: [
      { count: 440, box: [64, 16, 64], yMin: 0.0, size: 0.13, vel: [0.05, 0.32, 0.03], sway: 1.0, twinkle: 0.6, colorA: pal.glow, colorB: pal.accent },
      { count: 60, box: [80, 18, 80], yMin: 1.5, size: 0.55, vel: [0.04, 0.12, 0.02], sway: 1.6, twinkle: 0, colorA: pal.accent, colorB: pal.glow, opacity: 0.45 },
    ],
    glasswater: [
      { count: 380, box: [64, 16, 64], yMin: 0.0, size: 0.09, vel: [0.02, -0.14, 0.03], sway: 0.5, twinkle: 5.0, colorA: pal.glow, colorB: pal.accent },
      { count: 60, box: [80, 16, 80], yMin: 1.0, size: 0.42, vel: [0.06, 0.03, -0.02], sway: 1.2, twinkle: 0.4, colorA: pal.accent, colorB: pal.light, opacity: 0.5 },
    ],
    paleabyss: [
      { count: 520, box: [64, 16, 64], yMin: 0.0, size: 0.12, vel: [0.12, -0.38, 0.06], sway: 0.6, twinkle: 0, colorA: mixHex(pal.accent, pal.fog, 0.35), colorB: pal.accent, additive: false, opacity: 0.45, flake: true },
      { count: 70, box: [64, 12, 64], yMin: 0.0, size: 0.13, vel: [0.02, 0.45, 0.0], sway: 0.7, twinkle: 3.0, colorA: pal.glow, colorB: 0xffd890 },
    ],
  };
  const particles = (PCFG[theme] || PCFG.mossmere).map((c) => {
    const cfg = { ...c, count: Math.round(c.count * (low ? 0.5 : 1)) };
    const p = createParticles(cfg, rng);
    G(p.geo); M(p.mat);
    p.base = { a: new THREE.Color(cfg.colorA), b: new THREE.Color(cfg.colorB) };
    group.add(p.points);
    return p;
  });

  mark('gate+fx');
  // ==================================================================== mood colours
  const tmpA = new THREE.Color(), tmpB = new THREE.Color(), tmpC = new THREE.Color();
  const C = (hex) => new THREE.Color(hex);
  const base = {
    ink: C(pal.ink), fog: C(pal.fog), far: C(pal.far), light: C(pal.light), glow: C(pal.glow), lamp: C(pal.lamp), candle: C(pal.candle), ambient: C(pal.ambient),
    nebula: C(pal.nebula ?? 0xd296ae),
    // Starlit moods (DESIGN §19.1): night sinks to ink-indigo, dawn is pale gold over lavender mist
    cold: C(0x0b0d2e), warm: C(0xf2cfa4), dawnMist: C(0x9a92c8),
  };
  const farLum = new THREE.Color(), inkNear = new THREE.Color(), mistC = new THREE.Color();

  function applyMood(env) {
    // env: { night 0..1, warm 0..1, fog: Color (final fog colour), glowK, shaftK, partK }
    const n = env.night, w = env.warm;
    farLum.copy(base.far).lerp(base.light, 0.12).multiplyScalar(1.12);
    farLum.lerp(tmpA.copy(base.far).multiplyScalar(0.28).lerp(base.cold, 0.25), n * 0.92);   // the far ruins keep the lake's hue at night
    farLum.lerp(tmpA.copy(farLum).lerp(base.dawnMist, 0.35).lerp(base.warm, 0.22).multiplyScalar(1.22), w * 0.65);
    if (env.horizon) farLum.lerp(env.horizon, 0.7);   // (LAKE 2, the art pass: a water with its own lights: its sky's low band by the hour)
    inkNear.copy(base.ink).lerp(env.fog, 0.14);   // (Clear Night: the nearest ring's ink keeps a breath of the air, never black)
    const nR = rings.length;
    for (let i = 0; i < nR; i++) {
      const r = rings[i], t = r.t, u = r.mat.uniforms;
      const f = 0.04 + 0.84 * Math.pow(t, 1.35);
      u.uColor.value.copy(inkNear).lerp(farLum, f);
      u.uMist.value.copy(inkNear).lerp(env.fog, 0.5 + 0.5 * t).lerp(farLum, 0.15 + 0.65 * t);
      u.uRim.value.copy(farLum).lerp(base.light, 0.45).multiplyScalar((1.25 - 0.6 * t) * (1 - 0.55 * n));
      // lit windows in the far ruins burn candle amber (fainter with distance, dimmer at night)
      u.uGlow.value.copy(base.candle).multiplyScalar((1.5 - 0.7 * t) * env.glowK);
      u.uGlowHi.value.copy(base.lamp).multiplyScalar((0.9 - 0.4 * t) * env.glowK);   // hanging ruins: cold lamps
      u.uVault.value.copy(base.ink).lerp(env.fog, 0.3 + 0.25 * t);
      u.uNeb.value.copy(base.nebula).multiplyScalar((0.08 + 0.3 * t) * env.nebK);
    }
    const du = domeMat.uniforms;
    // night sky: lavender haze at the horizon -> violet dusk -> deep indigo -> night ink overhead
    du.uHorizon.value.copy(farLum).lerp(env.fog, 0.4);
    du.uMid.value.copy(env.fog).lerp(base.ink, 0.35);
    du.uZenith.value.copy(base.ink).lerp(env.fog, 0.18);
    starK = env.starK; du.uStars.value = starK;
    starDen = env.starDen; du.uStarDen.value = starDen;
    du.uNebK.value = env.nebK;
    du.uBandCol.value.copy(env.fog).lerp(farLum, 0.5).multiplyScalar(0.35);
    du.uCrack.value.copy(base.light).lerp(base.warm, w * 0.5).multiplyScalar(0.8 * env.shaftK + 0.1);
    shafts.uniforms.uColor.value.copy(base.light).lerp(base.warm, w * 0.65);
    shafts.uniforms.uIntensity.value = env.shaftK;
    mist.uniforms.uColor.value.copy(env.fog).lerp(farLum, 0.5);
    mist.uniforms.uAmt.value = 0.5 * (1 - 0.35 * n);
    foam.uniforms.uColor.value.set(pal.foam).multiplyScalar(0.22 * (1 - 0.45 * n));
    sheets.uniforms.uColor.value.copy(env.fog).lerp(farLum, 0.22 - 0.12 * n);
    sheets.uniforms.uAmt.value = 0.55 + 0.5 * n;
    halos.uniforms.uBright.value = env.glowK;
    // the world's ink lines keep a breath of the lake's air (violet ink, never a black hole in clear air; the tube props —
    // stalks, ribs, lamp arms — draw as their ink hull, so this is also their body colour)
    olRock.color.set(INK).lerp(env.fog, 0.1 + 0.2 * n); olOrg.color.copy(olRock.color);
    for (const p of particles) p.uniforms.uBright.value = env.partK;
    // ink outlines pick up a hint of fog at distance automatically (fog:true)
    // >>> LAKE 2, lane W2: the kit's night (flowers, fireflies, the leaves' light), the spore-haze from dusk, the Seep's foam
    if (flora) flora.applyMood(env);
    if (look) bankFloorU.gwFloraFloor.value = (Number(look.floor) || 0.2) + ((Number(look.night?.floor) || Number(look.floor) || 0.2) - (Number(look.floor) || 0.2)) * n;
    if (lushArt?.haze) {
      const H = look.haze || {}, hu = lushArt.haze.uniforms, k = Math.min(1, Math.max(0, (Math.max(n, w * 0.8) - (H.from ?? 0.25)) / 0.35));
      hu.uColor.value.set(H.tint ?? 0xe6c6cc).lerp(env.fog, 0.35 + 0.3 * n);
      hu.uAmt.value = (H.amt ?? 0.42) * k;
    }
    if (lushArt?.falls) { lushArt.falls.mat.uniforms.uColor.value.set(pal.foam).lerp(env.fog, 0.15 + 0.35 * n); lushArt.falls.mat.uniforms.uK.value = 1 - 0.35 * n; }
    // <<< LAKE 2, lane W2
  }

  // ==================================================================== per-frame
  const _v = new THREE.Vector3();
  let viewH = 720;
  function update(dt, t, focus, env) {
    if (cutPlug) cutPlug.visible = !plugN.open;
    // >>> WC-3: the twitch's clock and the bed pads' swell (the water's own uniforms, by reference)
    if (twU) {
      twState.t = t; twU.gwTwT.value = t;
      const WU = ctx.water && !ctx.water.isStub ? ctx.water.material?.uniforms : null;
      if (WU?.uWaveA && !twState.linked) { twU.gwWaveA.value = WU.uWaveA.value; twU.gwWaveB.value = WU.uWaveB.value; twState.linked = true; }
      if (WU?.uWaveT) twU.gwWaveT.value = WU.uWaveT.value;
      if (focus && Number.isFinite(focus.x)) twU.gwRaft.value.set(focus.x, focus.z, 1);
    }
    // <<< WC-3
    // (wave 2: the see-through cut eases in while an obstacle stands on the lens's line to the raft, or a place asks (want), and out
    // during a lift (hold); the test runs ten times a second over the lake's obstacle circles, with no allocation)
    if (seeCut && focus && Number.isFinite(focus.x)) {
      seeCut.focus.set(focus.x, 0.9, focus.z);
      const cam = ctx.render && !ctx.render.isStub ? ctx.render.camera : null;
      if ((seeCut.tick -= dt) <= 0) {
        seeCut.tick = 0.1;
        const e = cam?.matrixWorld?.elements;
        seeCut.block = !!e && (cutBlocked(L.obstacles, e[12], e[14], focus.x, focus.z) || cutBlocked(L.gate?.none ? null : L.gateObstacles, e[12], e[14], focus.x, focus.z)
          || (!!lushArt && cutBlocked(lushArt.cuts, e[12], e[14], focus.x, focus.z, 1)));
      }
      const target = seeCut.hold ? 0 : Math.max(seeCut.block ? 1 : 0, seeCut.want || 0), k = seeCut.u.uCutK.value, st = Math.max(0, dt) / 0.35;
      seeCut.u.uCutK.value = k < target ? Math.min(target, k + st) : Math.max(target, k - st);
    }
    const wh = ctx.water?.getHeight;
    const hasWater = typeof wh === 'function' && !ctx.water.isStub;
    domeMat.uniforms.uTime.value = t;
    shafts.uniforms.uTime.value = t;
    mist.uniforms.uTime.value = t;
    foam.uniforms.uTime.value = t;
    sheets.uniforms.uTime.value = t;
    halos.uniforms.uTime.value = t;
    halos.uniforms.uFogD.value = env.fogDensity;
    for (let i = 0; i < rings.length; i++) rings[i].mat.uniforms.uTime.value = t;
    const r = ctx.render?.renderer;
    if (r && r.getDrawingBufferSize) { r.getDrawingBufferSize(_v2); viewH = _v2.y || viewH; }
    halos.uniforms.uViewH.value = viewH;
    for (const p of particles) {
      const u = p.uniforms;
      u.uTime.value = t; u.uViewH.value = viewH; u.uFogD.value = env.fogDensity;
      if (focus) u.uCenter.value.set(focus.x, 0, focus.z);
    }
    gate.viewH(viewH);
    gate.update(dt, t, env);
    if (flora) flora.update(dt, t, focus, r);   // (LAKE 2, lane W2: the kit's sway, the raft's parting, the fireflies)
    if (lushArt?.falls) lushArt.falls.mat.uniforms.uTime.value = t;
    if (lushArt?.haze) lushArt.haze.uniforms.uTime.value = t;
    if (slitFx) slitFx.step(dt);   // the loop's ambient: the gate's candle slits
    // floaters bob on the water
    let touched = false;
    for (let i = 0; i < floaters.length; i++) {
      const f = floaters[i];
      let x = f.ox, z = f.oz;
      if (f.drift) { x += Math.sin(t * 0.05 * f.drift + f.ph) * f.drift * 1.5; z += Math.cos(t * 0.043 * f.drift + f.ph * 1.7) * f.drift * 1.5; }
      f.x = x; f.z = z;
      let h = 0, tx = 0, tz = 0;
      if (hasWater) {
        h = wh(x, z) || 0;
        tx = ((wh(x + 0.6, z) || 0) - h) * 1.2 * f.bob; tz = ((wh(x, z + 0.6) || 0) - h) * 1.2 * f.bob;
      } else { h = Math.sin(t * 1.3 + f.ph) * 0.04; }
      const y = h * f.bob + f.hover + (f.hover ? Math.sin(t * 0.9 + f.ph) * 0.25 : 0);
      const ry = f.ry + t * f.spin;
      e4.set(-tz + (f.hover ? Math.sin(t * 0.7 + f.ph) * 0.15 : 0), ry, tx, 'YXZ');
      q4.setFromEuler(e4);
      s4.setScalar(f.s);
      m4.compose(p4.set(x, y, z), q4, s4);
      for (let k = 0; k < f.idx.length; k++) f.idx[k][0].setMatrixAt(f.idx[k][1], m4);
      if (f.halo >= 0) { halos.setPos(f.halo, x, y + f.haloY * f.s, z); touched = true; }
    }
    for (const im of floatMeshes) im.instanceMatrix.needsUpdate = true;
    if (touched) halos.touchPositions();
  }
  const _v2 = new THREE.Vector2();

  // halos are sized in pixels of whatever they are drawn into: the frame, or the lake's smaller reflection target
  halos.points.layers.enable(REFLECT_LAYER);
  halos.points.onBeforeRender = (renderer) => {
    const rt = renderer.getRenderTarget();
    halos.uniforms.uViewH.value = rt ? rt.height : viewH;
  };
  group.add(halos.points);

  function dispose() {
    group.parent?.remove(group);
    if (flora) flora.dispose();
    group.traverse((o) => { if (o.isInstancedMesh) o.dispose(); });
    for (const g of bin.geos) g.dispose();
    for (const m of bin.mats) m.dispose();
    for (const t of bin.texs) t.dispose();
    bin.geos.clear(); bin.mats.clear(); bin.texs.clear();
  }

  return {
    group, anchors, update, applyMood, dispose, rings, statics, sky, keyDir,
    crackTop, crackBottom, dockBuoys, halos,
    piers, lampPosts, redress: redressOn,   // M1 step 3a: the Toppled Bridge's piers and the street lamp-posts as drawn (records)
    slits,   // the wildlife's moths: the gate towers' low candle slits (records; k how lit, the loop's ambient)
    capLamps: lushArt?.lamps || [],   // (LAKE 2, lane W2) the Lantern Stalks' and the stools' glowcaps: the spore moths' lamps
    lush: look ? { flora: flora?.stats() ?? null, art: lushArt?.info ?? null } : null,   // (LAKE 2, lane W2) the kit and the landmarks as built
    seeCut,   // (wave 2) the see-through cut the places' stone shares; null off the Mossmere's loop
    slitFx,  // the loop's ambient: the gate's eight slits' flicker ({S}: k each, the one out) or null
    // >>> WC-3: the stems tell's nudge (WC-2 calls world.stems.nudge(x, z, k)): the reeds and pads within a few metres twitch, then
    // settle (one of four points, the oldest replaced). null off the Mossmere's loop
    stems: twU ? {
      nudge(x, z, k = 1) {
        if (!Number.isFinite(x) || !Number.isFinite(z)) return false;
        const v = twU.gwTw.value[twState.i]; twState.i = (twState.i + 1) % twU.gwTw.value.length;
        v.set(x, z, twState.t, Math.max(0, Math.min(2, Number.isFinite(k) ? k : 1)));
        return true;
      },
      points: () => twU.gwTw.value.map((v) => ({ x: v.x, z: v.y, t0: v.z, k: v.w })),
    } : null,
    // <<< WC-3
    setGate: (s, instant) => gate.set(s, instant),
    get gateState() { return gate.state; },
    get gateOpenK() { return gate.openK; },
    gateAnchor: gate.anchor,
    stats() { return { rings: rings.length, anchors: anchors.length, halos: halos.count, floaters: floaters.length, buildMs: prof }; },
  };
}

function mixHex(a, b, t) { return new THREE.Color(a).lerp(new THREE.Color(b), t).getHex(); }
