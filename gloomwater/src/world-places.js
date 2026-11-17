// world-places.js — the loop's places on the Mossmere (M1 step 3a; docs/loop/m1-step3a/PLAN.md §2.4 items 1–3) (world author).
//
// Built only when LOOP_ENABLED (world.js calls buildPlaces for a lake that has loop places), so a flag-off or v3 build never creates
// any of it. What it draws:
//
//   the banks        the standing mist over each place not yet lifted: one merged mesh, a few low feathered layers on the place's own
//                    footprint (its water's disc, path or rect, feathered 1.5 m along its own shape), the built mist's lavender. One
//                    opacity per bank (uOp): it eases to LOOP.mist.inside while the raft is inside that bank's footprint and back on
//                    leaving, and to 0 when its mist lifts. The bank's alpha is a function of the footprint's own feather and its noise
//                    only: no camera or raft distance term anywhere in its shader, so a bank never opens a clearing round the raft
//                    (PLAN CHOICE 29; T145)
//   the dressing     each place's own look, built for all four at once under their banks (the landmark's "dark shape" is the dressing
//                    seen through the bank; PLAN CHOICE 9), its emissive terms off until the lift: Under the Span's three arch spans,
//                    broken deck and hanging chains over the Toppled Bridge's piers (one merged mesh and its ink line); the Lily
//                    Maze's pads at twice the local density (their own seeded stream, after every builder: the built pads are untouched,
//                    PLAN CHOICE 26) with glow-buds under them; the Buoy Lights' 24 float caps (one InstancedMesh) over two rows of
//                    depth-tinted glow decals; the Bell Pool's drowned bell, an ink decal on its floor with its crack's verdigris (a trace)
//                    and the moon's glint on it. The decals are this file's own premultiplied surface-decal material (ink darkens
//                    through alpha, glow adds through rgb), one InstancedMesh for every decal of every place
//   the giant's back the built night-ink silhouette's family (a smooth dark back, no species shape) turning in Under the Span's and the
//                    Buoy Lights' standing banks at the gloomtide only, every 25–45 s for 2 s (LOOP.giantBack; PLAN CHOICE 10); it
//                    emits world:giantBack {placeId, x, z}
//   W9's rest        behind LOOP.redress (on in the loop): the leaning toll-tower on the Sunken Gate (+1), the Sluice Veil's scrolling
//                    card and two aqueduct segments with no spout (+2); the bollards that replace the lamp-posts are world-art's (0 net)
//
// No gameplay state lives here: world.js feeds update() with the raft, the phase and the air, and keeps {owned, lifted} (setPlaces).
// Colours are the Starlit palette's: lavender, pale stone, candle amber, rust; green only as the bell's verdigris trace.
import * as THREE from 'three';
import { INK, setupSurface, evenOutline } from './toon.js';
import { makeRng } from './core.js';
import { TAU, prep, merge, mat, taperTube, latheGeo, wobble, lin, mixArr, scaleArr, vnoise3 } from './world-geo.js';
import { inkToon, outlineMat } from './world-fx.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const sstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

/** The banks' shape: the feather beyond the footprint (m; T145's "plus 1.5 m"), how far inside it the bank starts to thin. */
/** The giant's back's size against its built shape (0.72 m across, 2.7 m long at 1). */
export const BACK_SCALE = 1.5;
export const BANK = Object.freeze({ feather: 1.5, inner: 1.0, maxBanks: 5,   // (the Mossmere's four and Veilback Brook, LOST-TACKLE §5.3)
  // the curtains: soft rings of rising mist inside the bank's edge, [inset (m), height (m), alpha weight]: volume, never a wall
  // (one curtain, faint: from the play camera's height a closed ring of standing mist read as a pale rim round a darker plate; the fix pass)
  curtains: [[0.9, 2.2, 0.14]] });
/** The layers of a bank, low to high: height (m), alpha weight, how far the layer is drawn in from the footprint (m: a low dome). */
export const BANK_LAYERS = Object.freeze({
  high: [[0.08, 0.3, 0], [0.45, 0.3, 0.3], [0.9, 0.26, 0.7], [1.4, 0.2, 1.2], [2.0, 0.14, 1.8]],
  low: [[0.1, 0.4, 0], [0.85, 0.36, 0.6], [1.75, 0.22, 1.6]],
});

// ------------------------------------------------------------------ footprints (pure; the tests and the game share them)
/** Signed distance (m) from (x, z) to a place's footprint (its `water` geometry: disc, path or rect); negative inside. */
export function footprintSdf(area, x, z) {
  if (!area || typeof area !== 'object') return Infinity;
  if (area.kind === 'disc') return Math.hypot(x - area.x, z - area.z) - num(area.r, 0);
  if (area.kind === 'path' && Array.isArray(area.pts) && area.pts.length >= 2) {
    let best = Infinity;
    for (let i = 0; i + 1 < area.pts.length; i++) {
      const [ax, az] = area.pts[i], [bx, bz] = area.pts[i + 1];
      const px = x - ax, pz = z - az, ux = bx - ax, uz = bz - az, L2 = ux * ux + uz * uz || 1;
      const h = clamp01((px * ux + pz * uz) / L2);
      best = Math.min(best, Math.hypot(px - ux * h, pz - uz * h));
    }
    return best - num(area.w, 0) / 2;
  }
  if (area.kind === 'rect') {
    const dx = Math.abs(x - area.x) - num(area.w, 0) / 2, dz = Math.abs(z - area.z) - num(area.d, 0) / 2;
    return Math.hypot(Math.max(dx, 0), Math.max(dz, 0)) + Math.min(Math.max(dx, dz), 0);
  }
  return Infinity;
}
/** A point inside the footprint itself (no feather): the raft "inside a bank". */
export const insideFootprint = (area, x, z) => footprintSdf(area, x, z) < 0;
/** The footprint's bounding box grown by `pad` m: {x0, x1, z0, z1}. */
export function footprintBox(area, pad = 0) {
  if (area?.kind === 'disc') return { x0: area.x - area.r - pad, x1: area.x + area.r + pad, z0: area.z - area.r - pad, z1: area.z + area.r + pad };
  if (area?.kind === 'rect') return { x0: area.x - area.w / 2 - pad, x1: area.x + area.w / 2 + pad, z0: area.z - area.d / 2 - pad, z1: area.z + area.d / 2 + pad };
  if (area?.kind === 'path') {
    const xs = area.pts.map((p) => p[0]), zs = area.pts.map((p) => p[1]), h = area.w / 2 + pad;
    return { x0: Math.min(...xs) - h, x1: Math.max(...xs) + h, z0: Math.min(...zs) - h, z1: Math.max(...zs) + h };
  }
  return null;
}
/** The footprint's outline drawn `inset` m inside it, as a closed loop of points about `step` m apart ([[x, z], …]): the bank's curtain. */
export function footprintLoop(area, inset = 0.8, step = 1.2) {
  const out = [];
  if (area?.kind === 'disc') {
    const r = Math.max(0.5, area.r - inset), n = Math.max(12, Math.ceil(TAU * r / step));
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU; out.push([area.x + Math.cos(a) * r, area.z + Math.sin(a) * r]); }
  } else if (area?.kind === 'rect') {
    const hw = Math.max(0.3, area.w / 2 - inset), hd = Math.max(0.3, area.d / 2 - inset);
    const corners = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]];
    for (let k = 0; k < 4; k++) {
      const [ax, az] = corners[k], [bx, bz] = corners[(k + 1) % 4], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / step));
      for (let i = 0; i < n; i++) out.push([area.x + ax + (bx - ax) * (i / n), area.z + az + (bz - az) * (i / n)]);
    }
  } else if (area?.kind === 'path') {
    const [a, b] = [area.pts[0], area.pts[area.pts.length - 1]], r = Math.max(0.3, area.w / 2 - inset);
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const nL = Math.max(2, Math.ceil(L / step)), nC = Math.max(6, Math.ceil(Math.PI * r / step));
    const P = (cx, cz, t) => [cx + Math.cos(t) * r, cz + Math.sin(t) * r];
    for (let i = 0; i < nL; i++) { const f = i / nL; out.push(P(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, ang - Math.PI / 2)); }
    for (let i = 0; i < nC; i++) out.push(P(b[0], b[1], ang - Math.PI / 2 + Math.PI * (i / nC)));
    for (let i = 0; i < nL; i++) { const f = i / nL; out.push(P(b[0] + (a[0] - b[0]) * f, b[1] + (a[1] - b[1]) * f, ang + Math.PI / 2)); }
    for (let i = 0; i < nC; i++) out.push(P(a[0], a[1], ang + Math.PI / 2 + Math.PI * (i / nC)));
  }
  return out;
}
/** The footprint's centre (a path's middle). */
export function footprintCentre(area) {
  if (area?.kind === 'path') { const a = area.pts[0], b = area.pts[area.pts.length - 1]; return { x: (a[0] + b[0]) / 2, z: (a[1] + b[1]) / 2 }; }
  return area ? { x: num(area.x), z: num(area.z) } : null;
}
/**
 * The bank's coverage at a point, as its shader computes it before the noise: 1 well inside, falling along the footprint's own feather
 * to 0 at `feather` m outside it, times the bank's one opacity. It reads the footprint and the opacity only (no raft, no camera).
 */
export function bankCover(area, x, z, op = 1, { feather = BANK.feather, inner = BANK.inner, shrink = 0, keep = null } = {}) {
  let d = footprintSdf(area, x, z) + shrink;
  if (keep && keep.r > 0) d = Math.max(d, keep.r - Math.hypot(x - keep.x, z - keep.z));
  return (1 - sstep(-inner, feather, d)) * clamp01(op);
}
/**
 * A bank's keep-out round a dock that touches its place (the Buoy Lights' north end meets the west dock's buoy-lamp): {x, z, r} such that
 * the bank's coverage is 0 within `clear` m of every dock point (its mooring, posts and buoy) near the footprint; null when none is near.
 * The bank's shape is the footprint less this disc (its feather kept), so no bank ever lies over a dock (T145).
 */
export function bankKeep(area, docks = [], { feather = BANK.feather, clear = 0.9 } = {}) {
  const pts = [];
  for (const d of Array.isArray(docks) ? docks : []) for (const q of [d, ...(d.posts || []), ...(d.buoy ? [d.buoy] : [])]) if (q && footprintSdf(area, q.x, q.z) < feather + clear + 0.5) pts.push(q);
  if (!pts.length) return null;
  const x = pts.reduce((a, q) => a + q.x, 0) / pts.length, z = pts.reduce((a, q) => a + q.z, 0) / pts.length;
  const far = Math.max(...pts.map((q) => Math.hypot(q.x - x, q.z - z) + (q.r || 0)));
  return { x, z, r: far + clear + feather };
}
/** The Bell Pool's drowned bell: where it lies in the pool `a` (its centre, its rotation, its mouth), shared by the decal and the lift's shot. */
export function bellSpot(a) {
  // (its crown just under the two posts it hung between, its lip 2.1 m short of the pool's middle: a raft fishing the pool, its
  // middle included, is never laid over it, nor its show framed across it; the fix pass's second and third looks)
  const x = num(a?.x) + 0.2, z = num(a?.z) - 3.7, dx = 0.4, dz = 0.92, l = Math.hypot(dx, dz);
  return { x, z, rot: Math.atan2(dz / l, dx / l), mx: x + (dx / l) * 1.6, mz: z + (dz / l) * 1.6, dir: [dx / l, dz / l], sx: 3.6, sz: 2.6 };
}
/** The bank's opacity after one step (s): toward `target` at a whole range per `ease` s (LOOP.mist.ease), never past it. */
export function easeOpacity(op, target, dt, ease = 0.8) {
  const step = Math.max(0, dt) / Math.max(1e-3, ease);
  return op < target ? Math.min(target, op + step) : Math.max(target, op - step);
}
/** What one bank's opacity should be now: 0 once lifted; LOOP.mist.inside while the raft is inside its footprint; else 1. */
export function bankTarget({ lifted = false, inside = false, insideK = 0.35 } = {}) { return lifted ? 0 : inside ? insideK : 1; }

// ------------------------------------------------------------------ shaders
const NOISE = /* glsl */`
float wpH(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float wpN(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(wpH(i), wpH(i + vec2(1.0, 0.0)), f.x), mix(wpH(i + vec2(0.0, 1.0)), wpH(i + vec2(1.0, 1.0)), f.x), f.y); }
`;
// the bank: a world-space footprint SDF per fragment (the bank's shape rides on each vertex), its feather, the noise and the bank's one
// opacity. (Nothing here reads where the camera or the raft is.)
export const BANK_VS = /* glsl */`
attribute float aBank; attribute vec4 aS1; attribute vec4 aS2; attribute vec3 aL; attribute vec3 aK;
uniform float uOp[5]; uniform float uLift[5]; uniform float uTime;
varying vec2 vXZ; varying vec4 vS1; varying vec4 vS2; varying vec3 vL; varying float vOp; varying vec3 vK; varying float vY; varying float vLift;
${NOISE}
void main() {
  vXZ = position.xz; vS1 = aS1; vS2 = aS2; vL = aL; vK = aK; vY = position.y;
  float op = uOp[0], lf = uLift[0];
  if (aBank > 3.5) { op = uOp[4]; lf = uLift[4]; } else if (aBank > 2.5) { op = uOp[3]; lf = uLift[3]; } else if (aBank > 1.5) { op = uOp[2]; lf = uLift[2]; } else if (aBank > 0.5) { op = uOp[1]; lf = uLift[1]; }
  vOp = op; vLift = lf;
  vec3 pp = position;
  // (an upper layer swells and sags with its own slow billow, so the bank has height and never reads as stacked flat plates; the
  // water-level layer and the curtains stay where they are; the fix pass)
  if (aL.x > 0.3) pp.y += (wpN(position.xz * 0.14 + vec2(aL.x * 3.7, uTime * 0.02)) - 0.35) * (0.35 + 0.5 * aL.x);
  gl_Position = op < 0.002 ? vec4(2.0, 2.0, 2.0, 1.0) : projectionMatrix * viewMatrix * vec4(pp, 1.0);
}`;
export const BANK_FS = /* glsl */`
uniform float uTime, uAmt, uFeather, uInner;
uniform vec3 uLit, uShade;
varying vec2 vXZ; varying vec4 vS1; varying vec4 vS2; varying vec3 vL; varying float vOp; varying vec3 vK; varying float vY; varying float vLift;
${NOISE}
float footSdf(vec2 p) {
  if (vS1.x < 0.5) return length(p - vS1.yz) - vS1.w;
  if (vS1.x < 1.5) { vec2 a = vS1.yz, b = vS2.xy, pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - vS1.w; }
  vec2 q = abs(p - vS1.yz) - vec2(vS1.w, vS2.x);
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}
void main() {
  float d = footSdf(vXZ) + (vL.x < 0.0 ? 0.0 : vL.z);
  if (d > uFeather + 0.05) discard;   // (past the feather before any noise: the noise only draws the edge in)
  // (the bank's edge billows: slow noise draws it in by up to 1.6 m (2.4 m for an upper layer), never out, so it stays inside its
  // footprint plus the feather; each layer billows on its own seed, so the layers' rims never stack as concentric tiers: the fix pass)
  float lseed = vL.x < 0.0 ? 0.0 : vL.x * 2.9 + 1.3;
  d += wpN(vXZ * 0.19 + vec2(vS1.y * 0.07 + lseed, uTime * 0.012 - lseed * 0.6)) * mix(1.6, 2.4, clamp(vL.x, 0.0, 1.0));
  // (a finer billow, scaled to the place's own width, so a far bank's rim is ragged mist and never a clean pale oval; the stage)
  d += wpN(vXZ * 0.62 + vec2(uTime * 0.03, vS1.z * 0.05)) * 0.9 * clamp(vS1.w / 4.0, 0.4, 1.0);
  // (the lift: the bank breaks up from its edges inward in ragged wisps as it thins, rather than fading as one disc; the stage)
  if (vLift > 0.0) d += vLift * (1.5 + 5.0 * wpN(vXZ * 0.33 + vec2(uTime * 0.05, 3.7)));
  if (vK.z > 0.0) d = max(d, vK.z - length(vXZ - vK.xy));   // (a dock's keep-out: no bank over a dock)
  float cover = 1.0 - smoothstep(-uInner, uFeather, d);
  if (cover < 0.002) discard;
  vec2 drift = vec2(uTime * 0.035, -uTime * 0.022);
  if (vL.x < 0.0) {
    // the bank's curtain: a soft wall of mist along its own edge, dense at the water and breaking into a billowed top
    float along = vXZ.x * 0.43 + vXZ.y * 0.37;
    float nc = wpN(vec2(along + uTime * 0.06, vY * 0.8 - uTime * 0.05)) * 0.6 + wpN(vec2(along * 2.3 - uTime * 0.04, vY * 1.9 + 3.0)) * 0.4;
    float top = mix(0.25, 1.0, wpN(vec2(along * 0.7 + 11.0, uTime * 0.03)));
    float hk = clamp(vY / max(0.5, vL.z), 0.0, 1.0);
    // (it drifts in separate wisps with wide gaps along its length: never a solid wall, and never a continuous pale ring round the bank
    // seen from above, which read as the rim of a plate; the fix pass)
    float gaps = smoothstep(0.42, 0.8, nc) * smoothstep(0.25, 0.6, wpN(vec2(along * 0.35 + 7.0, uTime * 0.02)));
    float ac = cover * vL.y * (1.0 - smoothstep(0.0, top, hk)) * pow(1.0 - hk, 0.6) * gaps * 1.4 * vOp * uAmt * (1.0 - vLift) * (1.0 - vLift);   // (the curtains go first in a lift: never a standing wall)
    if (ac < 0.003) discard;
    gl_FragColor = vec4(mix(uShade, uLit, clamp(0.35 + hk * 0.5 + nc * 0.3, 0.0, 1.0)), min(ac, 0.85));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    return;
  }
  float seed = vL.x * 7.3 + vS1.y * 0.13;
  float n = wpN(vXZ * 0.21 + drift + seed) * 0.6 + wpN(vXZ * 0.53 - drift * 1.7 + seed * 1.9) * 0.4;
  // the upper layers break into wisps; the water-level layer too, a little (a solid low sheet read as a pale plate: the fix pass)
  float wisp = mix(1.0, smoothstep(0.24, 0.74, n), mix(0.5, 1.0, smoothstep(0.3, 1.2, vL.x)));
  // (clumps, not a sheet: the mist gathers and thins across the bank, so a bank seen from far is never a flat pale disc)
  float clump = smoothstep(0.18, 0.82, wpN(vXZ * 0.11 - drift * 0.6 + seed * 0.3) * 0.55 + n * 0.45);
  float a = cover * vL.y * mix(0.5, 1.25, clump) * wisp * vOp * uAmt;
  if (a < 0.003) discard;
  // (its foot in shade, its tops lit: a lit pale foot on the water was the plate)
  vec3 col = mix(uShade, uLit, clamp(vL.x * 0.42 + clump * 0.38 + n * 0.2 - 0.12, 0.0, 1.0));
  gl_FragColor = vec4(col, min(a, 0.84));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

// the decals: a flat quad on (or just above) the water per instance; kind 0 a depth-tinted glow (a bud, a drowned lantern), 1 the drowned
// bell (ink, its rust lip, its crack's verdigris trace, the moon's rim on its shoulder), 2 the moon's glint. Premultiplied: rgb is what
// the decal adds (glow), alpha how much it darkens what is under it (ink). k: the place's glow (0 until its mist lifts) and the night.
const DECAL_VS = /* glsl */`
attribute vec4 aC;   // x, y, z, rotation
attribute vec4 aS;   // size x, size z, kind, place
attribute vec3 aG;   // glow colour
attribute vec4 aI;   // ink, depth, seed, night share
uniform float uK[5]; uniform float uNight; uniform float uFogD;
varying vec2 vP; varying vec3 vG; varying vec4 vI; varying float vKind; varying float vK; varying float vFog;
void main() {
  vP = position.xz; vG = aG; vI = aI; vKind = aS.z;
  float k = uK[0];
  if (aS.w > 3.5) k = uK[4]; else if (aS.w > 2.5) k = uK[3]; else if (aS.w > 1.5) k = uK[2]; else if (aS.w > 0.5) k = uK[1];
  vK = k * mix(1.0, uNight, aI.w);
  float c = cos(aC.w), s = sin(aC.w);
  vec2 q = vec2(position.x * aS.x, position.z * aS.y);
  vec3 wp = vec3(aC.x + q.x * c - q.y * s, aC.y, aC.z + q.x * s + q.y * c);
  if (aS.z > 2.5) {
    // kind 3: the moon's shaft standing on the place, turned to face the lens about its own upright (x across, z up)
    vec2 toCam = normalize(cameraPosition.xz - aC.xz + vec2(1e-4, 0.0));
    vec2 rt = vec2(toCam.y, -toCam.x);
    float h = (1.0 - position.z) * 0.5;
    wp = vec3(aC.x + rt.x * q.x, aC.y + h * aS.y * 2.0, aC.z + rt.y * q.x);
  }
  vec4 mv = viewMatrix * vec4(wp, 1.0);
  float dd = -mv.z;
  vFog = exp(-uFogD * uFogD * dd * dd * 0.5);
  gl_Position = projectionMatrix * mv;
}`;
const DECAL_FS = /* glsl */`
uniform float uTime; uniform vec3 uDeep; uniform vec3 uRust; uniform vec3 uVerd; uniform vec3 uMoon;
varying vec2 vP; varying vec3 vG; varying vec4 vI; varying float vKind; varying float vK; varying float vFog;
${NOISE}
void main() {
  vec2 p = vP;
  float r = length(p);
  vec3 glow = vec3(0.0); float ink = 0.0;
  if (vKind < 0.5) {
    if (r > 1.0) discard;
    float depth = vI.y;
    float fl = 0.86 + 0.14 * sin(uTime * (1.1 + vI.z * 1.7) + vI.z * 31.0);
    float core = exp(-r * r * mix(14.0, 6.0, depth));
    float halo = exp(-r * r * 2.6) * (1.0 - r);
    vec3 c = mix(uDeep, vG, clamp(core * 1.4 - depth * 0.35, 0.0, 1.0));
    glow = (c * halo * 0.7 + vG * core * (1.1 - depth * 0.6)) * vK * fl;
    ink = 0.0;
  } else if (vKind < 1.5) {
    // the drowned harbour bell, lying on its side on the pool's floor and seen from above through the water: the bell's own profile (a
    // domed crown with its hanging loop, the waist, the flare to a beaded lip) and its mouth turned to the lens as an ellipse, dark inside
    // with a moonlit rim; two cast bands across it, its crack from the lip with a trace of verdigris. Crown at p.x = -1, mouth at +1;
    // the quad is 3.6 × 2.6 m, so a unit across is 0.72 of a unit along. (The fix pass: the trapezoid it was read as a sunken plank.)
    float u = p.x, v = abs(p.y), sy = p.y;
    float w;
    if (u < -0.5) w = 0.5 * sqrt(max(0.0, 1.0 - pow((u + 0.5) / 0.3, 2.0)));
    else if (u < 0.35) w = 0.5 + 0.05 * (u + 0.5) - 0.035 * sin(3.14159 * (u + 0.5) / 0.85);
    else w = 0.5 + 0.0425 + 0.41 * pow(clamp((u - 0.35) / 0.52, 0.0, 1.0), 2.1);
    w = min(w, 0.95);
    float bodyD = v - w;                                   // < 0 inside the body
    float inBody = smoothstep(0.02, -0.02, bodyD) * step(-0.8, u) * step(u, 0.9);
    // the mouth: an ellipse at the lip (its near half rounds the bell's end), across the whole flare
    vec2 me = vec2((u - 0.88) / 0.11, sy / 0.95);
    float mr = length(me);
    float inMouth = smoothstep(1.02, 0.96, mr);
    // the crown's hanging loop (the canon): a small ring beyond the dome
    vec2 cp = vec2((u + 0.9) * 1.0, sy * 0.74);
    float cr = length(cp);
    float canon = smoothstep(0.035, 0.0, abs(cr - 0.09)) * step(u, -0.78);
    float shape = max(max(inBody, inMouth), canon);
    if (shape < 0.003) discard;
    // the moonlit rim: a fine line round the silhouette (brighter on the lit side), the lip's ring brightest
    float rimB = smoothstep(0.06, 0.0, abs(bodyD)) * step(-0.8, u) * step(u, 0.84);
    float dome = smoothstep(0.05, 0.0, abs(length(vec2((u + 0.5) / 0.3, sy / 0.5)) - 1.0)) * step(u, -0.5);
    float lipRing = smoothstep(0.16, 0.0, abs(mr - 0.98));
    float bands = (smoothstep(0.022, 0.0, abs(u + 0.4)) + smoothstep(0.022, 0.0, abs(u - 0.62)) * 0.8) * inBody;
    // its crack: from the lip up the flare toward the waist, jagged, with the one trace of verdigris along it
    float crack = smoothstep(0.03, 0.0, abs(sy - 0.32 + 0.05 * sin(u * 23.0) + 0.18 * (0.86 - u))) * smoothstep(0.05, 0.3, u) * step(u, 0.84) * inBody;
    // volume: the shoulder toward the moon catches a soft sheen; the mouth is the darkest thing in the pool
    float sheen = smoothstep(0.1, 0.9, sy / max(0.05, w)) * inBody * (1.0 - inMouth);
    ink = vI.x * (inBody * (1.0 - 0.3 * sheen) * (1.0 - inMouth) + inMouth * 1.3 + canon * 0.7);
    ink = min(ink * (1.0 - 0.6 * max(rimB, max(dome, lipRing * inMouth))), 0.95);
    float lit = 0.35 + 0.65 * vK;
    glow = uMoon * (max(rimB, dome) * (sy > 0.0 ? 0.62 : 0.34) + lipRing * 0.75 + canon * 0.4 + bands * 0.22 + sheen * 0.07) * lit
      + uRust * smoothstep(0.7, 0.86, u) * inBody * 0.12 * lit + uVerd * crack * 0.9 * lit;
  } else if (vKind < 2.5) {
    if (r > 1.0) discard;
    float sh = 0.75 + 0.25 * wpN(p * 3.0 + vec2(uTime * 0.25, -uTime * 0.18));
    glow = uMoon * exp(-r * r * 3.2) * sh * 0.5 * vK;
  } else {
    // the moon's shaft: soft across, gone at the water's skin and fading as it rises; motes of light drift down it
    float h = (1.0 - p.y) * 0.5, x = p.x;
    float across = pow(max(0.0, 1.0 - x * x), 2.0);
    float motes = 0.8 + 0.2 * wpN(vec2(x * 4.0, h * 9.0 + uTime * 0.35));
    glow = uMoon * across * smoothstep(0.0, 0.08, h) * pow(1.0 - h, 1.6) * motes * 0.22 * vK;
  }
  float a = ink * vFog;
  gl_FragColor = vec4(glow * vFog, a);
}`;

// the giant's back: a smooth ink back (no species shape), moonlit at its rim
const BACK_COL = 0x14122a;

/**
 * Build the places' banks and dressing for one lake. places: data.loopPlace records ({id, name, area, landmark, kind, giant, …}) in the
 * Chart's order; L: the layout (docks, spawn, obstacles); arena: buildArena's result (piers, halos, anchors). opts: {pal, quality,
 * mist: LOOP.mist, giantBack: LOOP.giantBack, redress: LOOP.redress, hero: world.getHeroAnchor(), shoreR}.
 */
export function buildPlaces(ctx, L, arena, { places = [], pal = {}, quality = 'high', mist = {}, giantBack = {}, redress = false, hero = null, liteMist = false } = {}) {
  const group = new THREE.Group();
  group.name = 'world:places';
  const low = quality === 'low';
  // (the banks' low layer set, 3 layers not 5, on the low and medium tiers and on any phone (liteMist, world.js): the four banks
  // roughly doubled a phone frame's CPU cost, M1 §6.2; the high tier on desktop keeps its five)
  const liteBank = low || liteMist === true;
  const geos = [], mats = [];
  const G = (g) => { if (g) geos.push(g); return g; };
  const M = (m) => { if (m) mats.push(m); return m; };
  const P = places.filter((p) => p && p.area).slice(0, BANK.maxBanks);
  const idx = new Map(P.map((p, i) => [p.id, i]));
  const candle = pal.candle ?? 0xed9e3b, light = pal.light ?? 0xd4d0f2, far = pal.far ?? 0x8c84bc;
  const rng = makeRng(0x51ace5);   // the places' own stream (after every builder: the built art's draws are untouched)

  // per place: the bank's opacity and its target, the lift, the glow (0 until lifted), the raft inside
  const S = P.map((p) => ({ id: p.id, area: p.area, op: 1, target: 1, lift: null, lifted: false, glow: 0, glowT: 0, inside: false,
    giant: !!p.giant, back: { next: 25 + rng() * 20 } }));
  const insideK = num(mist.inside, 0.35), ease = num(mist.ease, 0.8);
  const keeps = P.map((p) => bankKeep(p.area, L?.docks || []));   // (no bank over a dock)

  // ---------------------------------------------------------- the banks (one merged mesh)
  const layers = BANK_LAYERS[liteBank ? 'low' : 'high'];
  const bank = (() => {
    const pos = [], aBank = [], aS1 = [], aS2 = [], aL = [], aK = [], ix = [];
    let base = 0;
    P.forEach((p, bi) => {
      const a = p.area;
      const s1 = a.kind === 'disc' ? [0, a.x, a.z, a.r] : a.kind === 'path' ? [1, a.pts[0][0], a.pts[0][1], a.w / 2] : [2, a.x, a.z, a.w / 2];
      const s2 = a.kind === 'path' ? [a.pts[a.pts.length - 1][0], a.pts[a.pts.length - 1][1], 0, 0] : a.kind === 'rect' ? [a.d / 2, 0, 0, 0] : [0, 0, 0, 0];
      const k = keeps[bi], tall = p.id === 'veilback_brook' ? 3 : 1;   // (LOST-TACKLE §5.2: the brook's bank fills its cut behind the Veil)
      for (const [hy0, wgt, shrink] of layers) {
        const hy = hy0 * tall;
        // (each layer's quad only as large as its own drawn-in footprint can reach: the billow draws in, never out, so a fragment past
        // footprint + feather − shrink is never drawn; the fix pass, for T148's fill on software GL)
        const b = footprintBox(a, Math.max(0.2, BANK.feather + 0.2 - shrink));
        const n = liteBank ? 4 : 8;   // a grid per layer (the fragment does the shape; the finer grid lets an upper layer swell)
        for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
          pos.push(b.x0 + (b.x1 - b.x0) * (i / n), hy, b.z0 + (b.z1 - b.z0) * (j / n));
          aBank.push(bi); aS1.push(...s1); aS2.push(...s2); aL.push(hy0, wgt, shrink); aK.push(k ? k.x : 0, k ? k.z : 0, k ? k.r : 0);
        }
        for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const q = base + j * (n + 1) + i; ix.push(q, q + n + 1, q + 1, q + 1, q + n + 1, q + n + 2); }
        base += (n + 1) * (n + 1);
      }
      // the curtains inside the bank's edge (BANK.curtains: inset, height, weight): quads from the water up
      const cc = footprintCentre(a);
      for (const [inset, H0, wgt] of liteBank ? BANK.curtains.slice(0, 1) : BANK.curtains) {
        const H = H0 * tall;
        // (a curtain wanders inward, never out: its own seeded jitter along the edge)
        const loop0 = footprintLoop(a, inset, liteBank ? 2 : 1.2);
        const loop = loop0.map(([x, z], j) => { const t = 0.55 + 0.45 * Math.sin(j * 0.9 + bi * 2.1 + inset) * Math.sin(j * 0.37 + 1.3); const k2 = Math.min(1.2, 0.9 * t); const dx = cc.x - x, dz = cc.z - z, l = Math.hypot(dx, dz) || 1; return a.kind === 'disc' ? [x + dx / l * k2, z + dz / l * k2] : [x, z]; });
        for (let i = 0; i < loop.length; i++) {
          const [x0, z0] = loop[i], [x1, z1] = loop[(i + 1) % loop.length];
          for (const [x, y, z] of [[x0, 0, z0], [x1, 0, z1], [x1, H, z1], [x0, H, z0]]) {
            pos.push(x, y, z); aBank.push(bi); aS1.push(...s1); aS2.push(...s2); aL.push(-1, wgt, H); aK.push(k ? k.x : 0, k ? k.z : 0, k ? k.r : 0);
          }
          ix.push(base, base + 1, base + 2, base, base + 2, base + 3);
          base += 4;
        }
      }
    });
    const g = G(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aBank', new THREE.Float32BufferAttribute(aBank, 1));
    g.setAttribute('aS1', new THREE.Float32BufferAttribute(aS1, 4));
    g.setAttribute('aS2', new THREE.Float32BufferAttribute(aS2, 4));
    g.setAttribute('aL', new THREE.Float32BufferAttribute(aL, 3));
    g.setAttribute('aK', new THREE.Float32BufferAttribute(aK, 3));
    g.setIndex(ix);
    g.computeBoundingSphere();
    const u = { uOp: { value: P.map(() => 1) }, uLift: { value: P.map(() => 0) }, uTime: { value: 0 }, uAmt: { value: 1 }, uFeather: { value: BANK.feather }, uInner: { value: BANK.inner },
      uLit: { value: new THREE.Color(0xc8c0ec) }, uShade: { value: new THREE.Color(0x6e66a4) } };
    const m = M(new THREE.ShaderMaterial({ uniforms: u, vertexShader: BANK_VS, fragmentShader: BANK_FS, transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide }));
    const mesh = new THREE.Mesh(g, m);
    mesh.name = 'placeBanks'; mesh.renderOrder = 6; mesh.frustumCulled = false;
    group.add(mesh);
    return { mesh, u };
  })();

  // ---------------------------------------------------------- the dressing: decals (one InstancedMesh for every place's decals)
  const decals = [];   // {x, y, z, rot, sx, sz, kind, place, g: [r, g, b], ink, depth, seed, nightShare}
  const addDecal = (o) => decals.push({ y: 0.03, rot: 0, kind: 0, ink: 0, depth: 0.4, seed: rng(), night: 0, g: lin(candle), ...o });

  // ---------------------------------------------------------- Under the Span (and the Bell Pool's frame): one merged stone-and-rust mesh
  const K = { stone: lin(0x8a8ca8), stoneHi: lin(0xb4b4c8), moss: scaleArr(lin(0x3a3656), 1.6), iron: lin(0x111222), rust: lin(0x8a4b3a), wood: scaleArr(lin(0x2e241b), 1.4) };
  const kit = [];
  const colorStone = (y0 = 0) => (x, y, z) => {
    const n = vnoise3(x * 0.9, y * 0.9, z * 0.9);
    let c = mixArr(K.stone, K.stoneHi, n * 0.35);
    if (y - y0 < 0.7) c = mixArr(c, K.moss, 0.55 * (1 - (y - y0) / 0.7));
    if (y < 0.35) c = scaleArr(c, 0.62 + 0.38 * Math.max(0, y / 0.35));
    return c;
  };
  const span = P.find((p) => p.id === 'under_the_span');
  const buoysPlace = () => P.find((p) => p.id === 'buoy_lights');
  const piers = (Array.isArray(arena?.piers) ? arena.piers : []).slice();
  const chainTips = [], chainKit = [];   // where the chains hang from (the break); their strands (no ink line: a chain is too fine for one)
  if (span && piers.length >= 2) {
    // the piers in order along the bridge, then the deck over them: three arch spans, the middle one broken at its crown
    const a0 = span.area.pts[0], a1 = span.area.pts[span.area.pts.length - 1];
    const ux = a1[0] - a0[0], uz = a1[1] - a0[1], ul = Math.hypot(ux, uz) || 1, dirx = ux / ul, dirz = uz / ul;
    piers.sort((p, q) => (p.x - a0[0]) * dirx + (p.z - a0[1]) * dirz - ((q.x - a0[0]) * dirx + (q.z - a0[1]) * dirz));
    const yaw = Math.atan2(-dirz, dirx);   // a shape's +x along the bridge
    const DECK = 3.3, THICK = 0.42, WIDTH = 3.4, SPRING = 0.35;
    for (const p of piers) {
      // a pier head: the pier carried up to the deck (a short one meets it, a tall one rises through as a broken tower)
      const g = new THREE.BoxGeometry(p.r * 2.1, DECK + THICK - 2.2, WIDTH + 0.4, 2, 2, 2);
      wobble(g, 0.04, 2.2, p.x);
      kit.push(prep(g, { matrix: mat(p.x, 2.2 + (DECK + THICK - 2.2) / 2, p.z, 0, yaw, 0), colorFn: colorStone(2.2) }));
    }
    for (let i = 0; i + 1 < piers.length; i++) {
      const A = piers[i], B = piers[i + 1];
      const dx = B.x - A.x, dz = B.z - A.z, D = Math.hypot(dx, dz);
      const gap = Math.max(1.5, D - (A.r + B.r) * 1.0), half = gap / 2, mx = (A.x + B.x) / 2, mz = (A.z + B.z) / 2;
      const sYaw = Math.atan2(-dz, dx);
      const broken = i === Math.floor((piers.length - 2) / 2) && piers.length >= 3;   // the middle span
      const tilt = i === piers.length - 2 ? -0.035 : 0;   // the last span has settled toward its far pier
      const pieces = broken ? [[-half - 0.5, -0.75], [0.6, half + 0.5]] : [[-half - 0.5, half + 0.5]];
      for (const [u0, u1] of pieces) {
        const sh = new THREE.Shape();
        const R = half, cy = SPRING;   // the intrados: a semicircle springing at SPRING, crown at SPRING + half
        const yIn = (u) => (Math.abs(u) >= R ? cy : cy + Math.sqrt(Math.max(0, R * R - u * u)));
        const top = (u) => DECK + THICK + (broken ? -0.25 * Math.max(0, 1 - Math.abs(Math.abs(u) - 0.7) / 1.2) * (Math.abs(u) < 1.4 ? 1 : 0) : 0);
        const steps = 14;
        sh.moveTo(u0, top(u0));
        sh.lineTo(u1, top(u1));
        // the broken end: a jagged face down to the intrados
        if (broken && u1 < half) { sh.lineTo(u1 + 0.18, DECK + 0.1); sh.lineTo(u1 - 0.05, DECK - 0.35); sh.lineTo(u1 + 0.12, yIn(u1) + 0.2); }
        sh.lineTo(u1, Math.min(yIn(u1), DECK - 0.3));
        for (let k = 1; k <= steps; k++) { const u = u1 + (u0 - u1) * (k / steps); sh.lineTo(u, Math.min(yIn(u), DECK - 0.3)); }
        if (broken && u0 > -half) { sh.lineTo(u0 - 0.15, yIn(u0) + 0.25); sh.lineTo(u0 + 0.06, DECK - 0.4); sh.lineTo(u0 - 0.2, DECK + 0.05); }
        const g = new THREE.ExtrudeGeometry(sh, { depth: WIDTH, bevelEnabled: false, curveSegments: 4, steps: 3 });
        g.translate(0, 0, -WIDTH / 2);
        wobble(g, 0.06, 1.8, i * 3.1 + u0);
        kit.push(prep(g, { matrix: mat(mx, 0, mz, 0, sYaw, tilt), colorFn: colorStone(SPRING) }));
        // a low parapet on each edge of the deck
        for (const side of [-1, 1]) {
          const pl = u1 - u0 - (broken ? 0.3 : 0), pc = (u0 + u1) / 2;
          const pg = new THREE.BoxGeometry(pl, 0.42, 0.26, 3, 1, 1);
          wobble(pg, 0.03, 3, side + i);
          const c = Math.cos(sYaw), s = Math.sin(sYaw), vx = s * side * (WIDTH / 2 - 0.13), vz = c * side * (WIDTH / 2 - 0.13);
          kit.push(prep(pg, { matrix: mat(mx + c * pc + vx, top(pc) + 0.2, mz - s * pc + vz, 0, sYaw, tilt), colorFn: colorStone(SPRING) }));
        }
        // the chains hang from the break: three strands from each broken end, down into the water
        if (broken) {
          const endU = u1 < half ? u1 : u0;
          const c = Math.cos(sYaw), s = Math.sin(sYaw);
          // (along the deck's two edges, clear of the passage under the break: a raft fishing there keeps its show's lens clear; the outer
          // strands reach the water, the inner ones stop above a Wick's flame)
          for (const [vOff, len] of [[-1.5, 3.5], [-0.95, 1.2], [0.95, 1.4], [1.5, 3.5]]) {
            const vx = s * vOff, vz = c * vOff;
            chainTips.push({ x: mx + c * endU + vx, y: DECK - 0.1, z: mz - s * endU + vz, len: len * (0.9 + rng() * 0.2), sway: rng() * TAU, side: Math.sign(endU) });
          }
        }
      }
    }
    // rubble: a few fallen blocks on the deck by the break and against the piers' feet (inside the piers' own collision)
    for (const ch of chainTips.filter((_, k) => k % 4 === 1)) {
      for (let k = 0; k < 3; k++) {
        const s2 = 0.25 + rng() * 0.3, ox = (rng() - 0.5) * 1.2, oz = (rng() - 0.5) * 1.6;
        kit.push(prep(rockGeoLite(s2), { matrix: mat(ch.x - ch.side * (0.8 + rng() * 0.8) + ox * 0.3, DECK + THICK + s2 * 0.3, ch.z + oz, rng() * 0.6, rng() * TAU, rng() * 0.6), colorFn: colorStone(0) }));
      }
    }
    for (const p of piers) {
      for (let k = 0; k < 2; k++) {
        const a = rng() * TAU, s2 = 0.35 + rng() * 0.35, d = p.r * (0.7 + rng() * 0.3);
        kit.push(prep(rockGeoLite(s2), { matrix: mat(p.x + Math.cos(a) * d, s2 * 0.15, p.z + Math.sin(a) * d, rng() * 0.5, rng() * TAU, rng() * 0.5), colorFn: colorStone(0) }));
      }
    }
    // the chains: rust links as a beaded strand (a tube with a bead every link), one merged piece each
    for (const ch of chainTips) {
      const pts = [];
      const nL = 9;
      for (let k = 0; k <= nL; k++) {
        const t = k / nL, y = ch.y - Math.min(ch.len, ch.y + 0.4) * t;
        const sway = Math.sin(ch.sway + t * 2.2) * 0.12 * t + ch.side * 0.18 * t * t;
        pts.push(V(ch.x + sway * 0.6, y, ch.z + sway));
      }
      chainKit.push(prep(taperTube(pts, (t) => 0.02 + 0.01 * Math.max(0, Math.cos(t * 70)), 5, 60), { colorFn: (x, y) => mixArr(K.rust, K.iron, y < 0.3 ? 0.6 : 0.3 + 0.2 * Math.max(0, Math.sin(y * 11))) }));
    }
  }

  // ---------------------------------------------------------- the other landmarks' dark shapes (what rises out of their banks)
  // the Buoy Lights: two leaning channel-marker posts at its north end, "showing the way to a harbour mouth that is not there", their
  // lamps lit with the place; the Bell Pool: the two leaning posts its bell hung between, a rust chain sagging from one to the other
  const markerLamps = [];
  const post = (x, z, h, lean, yaw, col) => {
    const g = new THREE.CylinderGeometry(0.09, 0.13, h, 6, 3);
    g.translate(0, h / 2 - 0.6, 0);
    wobble(g, 0.02, 3, x);
    kit.push(prep(g, { matrix: mat(x, 0, z, lean, yaw, 0), colorFn: (px, py) => (py < 0.35 ? mixArr(col, K.moss, 0.4) : col) }));
    const tip = new THREE.Vector3(0, h - 0.6, 0).applyMatrix4(mat(0, 0, 0, lean, yaw, 0));
    return { x: x + tip.x, y: tip.y, z: z + tip.z };
  };
  if (buoysPlace()?.area?.kind === 'rect') {
    const a = buoysPlace().area, zN = a.z - a.d / 2 - 1.1;
    for (const [dx, lean, yaw] of [[-1.5, 0.12, 0.4], [1.5, -0.09, 2.2]]) {
      const tip = post(a.x + dx, zN, 3.4, lean, yaw, mixArr(K.rust, K.iron, 0.5));
      kit.push(prep(new THREE.CylinderGeometry(0.16, 0.12, 0.3, 6), { matrix: mat(tip.x, tip.y + 0.1, tip.z), color: K.iron }));
      markerLamps.push({ ...tip, halo: arena?.halos ? arena.halos.add(tip.x, tip.y + 0.32, tip.z, [0, 0, 0], 1.6, rng() * 10) : -1 });
    }
  }
  const bellP = P.find((p) => p.id === 'bell_pool');
  if (bellP?.area?.kind === 'disc') {
    const a = bellP.area, zN = a.z - a.r - 0.6;
    const t1 = post(a.x - 2.3, zN, 3.6, 0.1, 0.3, K.wood), t2 = post(a.x + 2.1, zN + 0.3, 2.6, -0.16, 1.9, K.wood);
    const sag = [];
    for (let k = 0; k <= 10; k++) { const t = k / 10; sag.push(V(t1.x + (t2.x - t1.x) * t, t1.y + (t2.y - t1.y) * t - Math.sin(Math.PI * t) * 1.1, t1.z + (t2.z - t1.z) * t)); }
    chainKit.push(prep(taperTube(sag, (t) => 0.024 + 0.01 * Math.max(0, Math.cos(t * 90)), 5, 50), { color: scaleArr(K.rust, 1.1) }));
  }

  // ---------------------------------------------------------- W9's rest behind LOOP.redress (on in the loop since the user's yes)
  let tower = null, veil = null;
  const aqueduct = [];
  if (redress) {
    // the Sluice Veil's aqueduct over the east cliff (no spout: the Cupped Hands are after M1). (The fix pass: it ran out from the lake, so
    // only its end showed, a pale box on the face of the spire behind it.) It now runs along the cliff's edge, across the view from the
    // water: two round arches on their piers, and a third broken off above the notch, where the Sluice Veil spills from the open trough.
    // (LOST-TACKLE §5.3: with the cut behind the Veil, L.notch, the aqueduct stands back on the cliff's lip, its broken arch over the cut's
    // mouth and its first pier beside it, so the Veil spills across the whole mouth and the brook runs under the broken arch)
    const NT = L?.notch || null;
    const ang = NT ? NT.a : Math.atan2(4, 58), rS = (a) => (typeof L?.shoreR === 'function' ? L.shoreR(a) : 60);
    const r0 = rS(ang), cx = Math.cos(ang), cz = Math.sin(ang);
    const yA = 16, ySpring = yA - 3.4, TW = 2.1, back = NT ? 1.8 : 0.6, du = NT ? 3.0 : 0;
    const yFoot = NT ? -0.6 : yA - 11;   // (by the cut the piers stand down to the water, never a slab hung on the cliff: the look)
    const bx = cx * (r0 + back), bz = cz * (r0 + back), ryA = Math.atan2(-cx, -cz);   // local +x along the cliff (the tangent)
    const piersU = [0.9 + du, 6.1 + du, 11.3 + du];
    const arch = (u0, u1, broken) => {
      const R = (u1 - u0) / 2, mu = (u0 + u1) / 2, sh = new THREE.Shape();
      const yIn = (u) => ySpring + Math.sqrt(Math.max(0, R * R - (u - mu) * (u - mu)));
      const uS = broken ? u0 + R * 0.55 : u0;   // a broken arch keeps only its far haunch, its end a jagged face
      sh.moveTo(u1, ySpring); sh.lineTo(u1, yA); sh.lineTo(uS, yA);
      if (broken) { sh.lineTo(uS - 0.25, yA - 0.5); sh.lineTo(uS + 0.15, yA - 1.1); sh.lineTo(uS - 0.1, yIn(uS) + 0.3); }
      sh.lineTo(uS, Math.min(yIn(uS), yA - 0.3));
      for (let k = 1; k <= 12; k++) { const u = uS + (u1 - uS) * (k / 12); sh.lineTo(u, Math.min(yIn(u), yA - 0.3)); }
      const g = new THREE.ExtrudeGeometry(sh, { depth: TW, bevelEnabled: false, curveSegments: 4, steps: 2 });
      g.translate(0, 0, -TW / 2);
      wobble(g, 0.05, 1.6, u0 * 3.3);
      aqueduct.push(prep(g, { matrix: mat(bx, 0, bz, 0, ryA, 0), colorFn: colorStone(ySpring) }));
      // the trough's two low walls along its top (an aqueduct, not a bridge)
      for (const side of [-1, 1]) {
        const wg = new THREE.BoxGeometry(u1 - uS, 0.55, 0.22, 3, 1, 1);
        wobble(wg, 0.03, 3, u0 + side);
        const c = Math.cos(ryA), s2 = Math.sin(ryA), um = (uS + u1) / 2, vz = side * (TW / 2 - 0.11);
        aqueduct.push(prep(wg, { matrix: mat(bx + c * um + s2 * vz, yA + 0.27, bz - s2 * um + c * vz, 0, ryA, 0), colorFn: colorStone(yA) }));
      }
      return uS;
    };
    const lip = arch(-4.3 + du, piersU[0], true);
    arch(piersU[0], piersU[1], false);
    arch(piersU[1], piersU[2], false);
    for (const u of piersU) {
      const pg = new THREE.BoxGeometry(1.1, ySpring - yFoot, TW + 0.3, 1, 3, 1);
      wobble(pg, 0.05, 1.6, u);
      const c = Math.cos(ryA), s2 = Math.sin(ryA);
      aqueduct.push(prep(pg, { matrix: mat(bx + c * u, (ySpring + yFoot) / 2, bz - s2 * u, 0, ryA, 0), colorFn: colorStone(0) }));
    }
    const lipX = bx + Math.cos(ryA) * (lip + 0.4), lipZ = bz - Math.sin(ryA) * (lip + 0.4);
    // the veil: a scrolling water curtain from the broken end down to the lake
    // (it falls from the broken trough's lip, just out from the cliff's face; with the cut, 6.4 m wide across the cut's mouth, and a
    // second small one, 1.6 m, spilling from the culvert at its head: one geometry, one call)
    const vh = yA + 0.2, veilCards = [];
    const card = (w, h, x, z, yaw, segX = 1) => { const g = new THREE.PlaneGeometry(w, h, segX, 8); g.translate(0, h / 2, 0); g.applyMatrix4(mat(x, -0.1, z, 0, yaw, 0)); veilCards.push(g); };
    if (NT) {
      const va = NT.r0 + 1.25;
      card(6.4, vh, va * NT.ca, va * NT.sa, Math.atan2(-NT.ca, -NT.sa), 4);
      const ca2 = NT.end - 0.55, h2 = 1.75;
      card(1.6, h2, ca2 * NT.ca, ca2 * NT.sa, Math.atan2(-NT.ca, -NT.sa));
    } else card(2.6, vh, lipX - cx * 1.2, lipZ - cz * 1.2, Math.atan2(-cx, -cz));
    const vg = G(merge(veilCards));
    const vu = { uTime: { value: 0 }, uCol: { value: new THREE.Color(light).lerp(new THREE.Color(0xa8a0e0), 0.6) }, uK: { value: 1 } };
    const vm = M(new THREE.ShaderMaterial({
      uniforms: vu, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false,
      // (vD: the lens's distance, so the curtain thins away as the lens comes through it: never a wash of water across the screen)
      vertexShader: /* glsl */`varying vec2 vUv; varying float vD; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vD = -mv.z; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: /* glsl */`uniform float uTime, uK; uniform vec3 uCol; varying vec2 vUv; varying float vD;
        ${NOISE}
        void main(){
          float x = vUv.x, y = vUv.y;
          float edge = smoothstep(0.0, 0.18, x) * smoothstep(1.0, 0.82, x);
          float s = wpN(vec2(x * 11.0, y * 3.0 + uTime * 1.6)) * 0.6 + wpN(vec2(x * 23.0, y * 6.0 + uTime * 2.3)) * 0.4;
          float a = edge * (0.08 + 0.36 * smoothstep(0.5, 0.88, s)) * (0.45 + 0.55 * y) * uK;
          float foot = smoothstep(0.12, 0.0, y) * 0.3;
          gl_FragColor = vec4(uCol, clamp(a + foot * edge, 0.0, 0.6) * smoothstep(1.2, 4.5, vD));
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }));
    veil = new THREE.Mesh(vg, vm);
    veil.name = 'sluiceVeil'; veil.renderOrder = 5;
    group.add(veil);
    if (NT) {
      // the cut's own stone (merged with the aqueduct): the culvert's arch at its head, where the water spills out of the hill, and an
      // older arch thrown across the cut a third of the way in, broken at its crown, its two haunches still standing on the banks
      const frame = (along, lc) => { const t = Math.max(0, Math.min(1, (along - NT.r0) / Math.max(1, NT.end - NT.r0))), lat = lc + 0.7 * Math.sin(Math.PI * t) * (t > 0 ? 1 : 0); return [along * NT.ca - lat * NT.sa, along * NT.sa + lat * NT.ca]; };
      const yawX = Math.atan2(-NT.ca, -NT.sa);   // a shape's +x across the cut (toward its south bank), its depth down the cut
      // an arch ring of inner radius R and thickness T springing at `spring` m, over [p0, p1] (0 the south spring, π the north): a whole
      // end stands on its leg down to `foot`, a broken end is a ragged face
      const archPiece = (R, T, spring, p0, p1, foot, depth) => {
        const sh = new THREE.Shape(), n = 12, at = (r, ph) => [Math.cos(ph) * r, spring + Math.sin(ph) * r];
        const whole0 = p0 <= 1e-6, whole1 = p1 >= Math.PI - 1e-6;
        if (whole0) { sh.moveTo(R + T, foot); sh.lineTo(...at(R + T, 0)); } else sh.moveTo(...at(R + T, p0));
        for (let k = 1; k <= n; k++) sh.lineTo(...at(R + T, p0 + ((p1 - p0) * k) / n));
        if (whole1) { sh.lineTo(-(R + T), foot); sh.lineTo(-R, foot); }
        else { sh.lineTo(...at(R + T * 0.45, p1 + 0.06)); sh.lineTo(...at(R + T * 0.2, p1 - 0.03)); }
        for (let k = n; k >= 0; k--) sh.lineTo(...at(R, p0 + ((p1 - p0) * k) / n));
        if (whole0) sh.lineTo(R, foot); else { sh.lineTo(...at(R + T * 0.6, p0 - 0.05)); }
        const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 4, steps: 2 });
        g.translate(0, 0, -depth / 2);
        wobble(g, 0.04, 1.8, R * 7.1 + p0);
        return g;
      };
      const put = (g, along, lc = 0) => { const [x, z] = frame(along, lc); aqueduct.push(prep(g, { matrix: mat(x, 0, z, 0, yawX, 0), colorFn: colorStone(0.4) })); };
      // the culvert: a low round arch set in the head, its sill under the water
      put(archPiece(NT.endHw * 0.42, 0.42, 0.55, 0, Math.PI, -1.2, 0.9), NT.end - 0.45);
      // the old arch across the cut a third of the way in, springing from the banks' ledges, broken at its crown (the north haunch shorter)
      // (near the head, so it frames the culvert ahead of a raft fishing the brook and never stands between the lens and the Wick)
      const al1 = NT.r0 + 0.84 * (NT.end - NT.r0), R1 = NT.hw + 0.5;
      put(archPiece(R1, 0.4, 1.2, 0, 1.05, 0.3, 1.0), al1);
      put(archPiece(R1, 0.4, 1.2, 2.25, Math.PI, 0.3, 1.0), al1);
    }
    // the leaning toll-tower on the Sunken Gate (beyond the cliffs, a hero landmark's stone)
    if (hero && Number.isFinite(hero.x)) {
      const face = num(hero.face, 0), fx = Math.cos(face), fz = -Math.sin(face);
      // (clear of the gate's right-hand tower (13 m out, r 5): a separate silhouette, a step nearer the lake)
      const wx = Math.sin(face), wz = Math.cos(face);
      const tx = hero.x + fx * 28 + wx * 3, tz = hero.z + fz * 28 + wz * 3;
      const parts = [];
      const body = new THREE.BoxGeometry(5.2, 30, 5.2, 2, 6, 2);
      wobble(body, 0.12, 0.6, 3);
      const ink = mixArr(lin(0x08061a), mixArr(lin(0x181a2e), lin(0x30345a), 0.45), 0.68);
      parts.push(prep(body, { matrix: mat(0, 15, 0), color: ink }));
      parts.push(prep(new THREE.ConeGeometry(4.6, 7, 4), { matrix: mat(0, 33.5, 0, 0, Math.PI / 4, 0), color: ink }));
      for (const [wy, wh] of [[24, 2.2], [14, 1.6]]) parts.push(prep(new THREE.BoxGeometry(0.8, wh, 0.3), { matrix: mat(0, wy, 2.66), color: scaleArr(lin(candle), 1.8) }));
      const tg = G(merge(parts));
      const tm = M(inkToon({ color: 0xffffff, vertexColors: true, flatShading: true, rim: 0.6, rimColor: far, rimPower: 0.5, steps: 3, detail: 'stone', detailAmount: 0.8, gloss: 0.05, floor: 1.7 }, { fogScale: 0.5, fogMax: 0.72 }));
      tower = new THREE.Mesh(tg, tm);
      tower.position.set(tx, 0, tz); tower.rotation.set(0.05, face, -0.11);   // (it leans away from the gate)
      tower.name = 'tollTower';
      setupSurface(tower, { cast: false });
      group.add(tower);
      arena?.halos?.add(tx + Math.sin(face) * 3.4, 24, tz + Math.cos(face) * 3.4, scaleArr(lin(candle), 0.55), 4.5, 1.7);
    }
  }
  let stone = null;
  const stoneMat = M(inkToon({ color: 0xffffff, vertexColors: true, flatShading: true, rim: 0.32, rimColor: mixHex(far, light, 0.45), rimPower: 0.56, steps: 3, detail: 'stone', wet: 0.6, gloss: 0.1, shine: 48, floor: 1 }, { fogScale: 0.9, fogMax: 1 }));
  const stoneOl = M(evenOutline(outlineMat(0.09, INK)));
  // the cutaway (the fix pass): while the raft fishes under Under the Span's deck, the stone on the line from the lens to the Wick dithers
  // away (gone within 0.9 m of the line, whole past 1.5 m), so the play camera and the show see the float, the tell and the fight through
  // the deck and piers; off everywhere else and during a lift. The focus is set per frame in view space (onBeforeRender).
  const cut = { uCutF: { value: new THREE.Vector3() }, uCutK: { value: 0 } };
  const cutFocus = new THREE.Vector3();
  const CUT_GLSL = `{ if (uCutK > 0.0) { vec3 gwP = -gwCutVP; float gwT = dot(gwP, uCutF) / max(1e-3, dot(uCutF, uCutF));
      if (gwT > 0.04 && gwT < 0.93) { float gwD = length(gwP - uCutF * gwT); float gwH = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
        if (gwH < uCutK * (1.0 - smoothstep(0.9, 1.5, gwD))) discard; } } }`;
  const addCut = (m, viewVar) => {
    const base = m.onBeforeCompile;
    m.onBeforeCompile = (sh, r) => {
      base?.call(m, sh, r);
      Object.assign(sh.uniforms, cut);
      if (viewVar) {
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uCutF; uniform float uCutK;')
          .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>\n#define gwCutVP vViewPosition\n${CUT_GLSL}`);
      } else {
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 gwCutV;')
          .replace('#include <project_vertex>', '#include <project_vertex>\ngwCutV = -mvPosition.xyz;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uCutF; uniform float uCutK; varying vec3 gwCutV;')
          .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>\n#define gwCutVP gwCutV\n${CUT_GLSL}`);
      }
    };
    const key = m.customProgramCacheKey?.bind(m);
    m.customProgramCacheKey = () => `${key ? key() : ''}|gwPlaceCut${viewVar ? 'V' : 'B'}`;
  };
  addCut(stoneMat, true); addCut(stoneOl, false);
  const setCut = (renderer, scene, camera) => { if (cut.uCutK.value > 0) cut.uCutF.value.copy(cutFocus).applyMatrix4(camera.matrixWorldInverse); };
  const allStone = kit.concat(aqueduct);
  if (allStone.length) {
    const g = G(merge(allStone));
    stone = new THREE.Mesh(g, stoneMat);
    stone.name = 'placeStone';
    stone.onBeforeRender = setCut;
    // (its ink line on medium and high; on low the place's stone goes without, inside the low line of DESIGN §25.8.8's 42)
    if (!low) { const o = new THREE.Mesh(g, stoneOl); o.name = 'placeStone:outline'; o.renderOrder = -1; o.onBeforeRender = setCut; stone.add(o); }
    setupSurface(stone, { cast: true });
    group.add(stone);
  }
  if (chainKit.length) {
    // the chains' own material: the stone's, dithered away within a few metres of the lens (gone inside 3.5 m, whole past 7: the stage
    // widened it after a Thousandcast's show under the break was barred by the strands round the raft), so a show filmed there (the
    // lens a step from the Wick) is never barred by a strand in front of it; the play camera, further back, keeps them
    const chainMat = M(inkToon({ color: 0xffffff, vertexColors: true, flatShading: true, rim: 0.32, rimColor: mixHex(far, light, 0.45), rimPower: 0.56, steps: 3, gloss: 0.1, shine: 48, floor: 1 }, { fogScale: 0.9, fogMax: 1 }));
    const base = chainMat.onBeforeCompile;
    chainMat.onBeforeCompile = (sh, r) => {
      base?.call(chainMat, sh, r);
      sh.fragmentShader = sh.fragmentShader.replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
        { float gwD = length(vViewPosition); if (gwD < 7.0) { float gwH = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453); if (gwH > smoothstep(3.5, 7.0, gwD)) discard; } }`);
    };
    chainMat.customProgramCacheKey = () => 'gwPlaceChains';
    const cm = new THREE.Mesh(G(merge(chainKit)), chainMat);
    cm.name = 'placeChains';
    setupSurface(cm, { cast: false });
    group.add(cm);
  }

  // ---------------------------------------------------------- the Lily Maze: pads at twice the local density, glow-buds under them
  let pads = null;
  const padList = [];
  const lily = P.find((p) => p.id === 'lily_maze');
  if (lily && lily.area.kind === 'disc') {
    const a = lily.area, n = low ? 16 : 30;
    const clear = (x, z) => {
      for (const o of L?.obstacles || []) if (Math.hypot(x - o.x, z - o.z) < o.r + 0.5) return false;
      return true;
    };
    for (let t = 0; t < n * 30 && padList.length < n; t++) {
      const ang = rng() * TAU, d = Math.sqrt(rng()) * (a.r - 0.6), x = a.x + Math.cos(ang) * d, z = a.z + Math.sin(ang) * d;
      if (!clear(x, z) || padList.some((q) => Math.hypot(q.x - x, q.z - z) < 0.95)) continue;
      padList.push({ x, z, ry: rng() * TAU, s: 0.7 + rng() * 0.75, ph: rng() * TAU });
    }
    const pad = new THREE.CylinderGeometry(0.55, 0.55, 0.04, 12, 1, false, 0.3, TAU - 0.6);
    const org = lin(0x7a5e30), woodHi = scaleArr(lin(0x4a3a2a), 1.4);
    prep(pad, { colorFn: (x, y, z) => scaleArr(mixArr(org, woodHi, 0.2 + 0.5 * vnoise3(x * 3 + 9, 0, z * 3)), 0.7) });
    G(pad);
    const pm = M(inkToon({ color: 0xffffff, vertexColors: true, rim: 0.18, rimColor: far, steps: 3 }, { fogScale: 0.9 }));
    pads = new THREE.InstancedMesh(pad, pm, padList.length);
    pads.name = 'placePads'; pads.frustumCulled = false;
    setupSurface(pads, { cast: false, reflect: false });
    group.add(pads);
    // (WC-3, WATERCRAFT §5.7: the static candle-amber glow-buds under the pads retire under the loop: the koi's own candle fins on
    // its silhouette are the warm light now, WC-2's. The stream keeps its draws, so every later place's dressing lies where it lay)
    padList.forEach((q, i) => { if (i % 5 === 4) return; rng(); rng(); rng(); rng(); });
  }

  // ---------------------------------------------------------- the Buoy Lights: 24 float caps over two rows of drowned lanterns
  let caps = null;
  const capList = [];
  const buoys = P.find((p) => p.id === 'buoy_lights');
  if (buoys && buoys.area.kind === 'rect') {
    const a = buoys.area, rows = [a.x - a.w * 0.3, a.x + a.w * 0.3], nPer = 12, z0 = a.z - a.d / 2 + 1, dz = (a.d - 2) / (nPer - 1);
    for (const rx of rows) for (let i = 0; i < nPer; i++) capList.push({ x: rx + (rng() - 0.5) * 0.25, z: z0 + i * dz + (rng() - 0.5) * 0.4, ph: rng() * TAU, halo: -1 });
    // the float: an iron cork with a glass head (the glass is what lights)
    const body = latheGeo([[0.01, -0.12], [0.18, -0.1], [0.22, -0.02], [0.19, 0.05], [0.1, 0.08], [0.01, 0.09]], 10);
    const glass = latheGeo([[0.01, 0.07], [0.085, 0.08], [0.09, 0.15], [0.05, 0.21], [0.01, 0.22]], 8);
    prep(body, { color: mixArr(lin(0x8a4b3a), lin(0x111222), 0.55) });
    prep(glass, { color: [1, 1, 1] });
    const glowAttr = (g, v) => g.setAttribute('aGlow', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count).fill(v), 1));
    glowAttr(body, 0); glowAttr(glass, 1);
    const cg = G(merge([body, glass]));
    const cu = { uK: { value: 0 }, uGlowCol: { value: new THREE.Color(mixHex(candle, 0xffd59a, 0.3)).multiplyScalar(2.4) } };
    const cm = M(new THREE.MeshBasicMaterial({ vertexColors: true, fog: true, toneMapped: false }));
    cm.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, cu);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aGlow; varying float vGlowW;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvGlowW = aGlow;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uK; uniform vec3 uGlowCol; varying float vGlowW;')
        .replace('#include <opaque_fragment>', 'outgoingLight = mix(outgoingLight, outgoingLight * 0.35 + uGlowCol * uK, vGlowW);\n#include <opaque_fragment>');
    };
    cm.customProgramCacheKey = () => 'gwPlaceCaps';
    caps = new THREE.InstancedMesh(cg, cm, capList.length);
    caps.name = 'placeCaps'; caps.frustumCulled = false;
    caps.userData.u = cu;
    group.add(caps);
    for (const q of capList) {
      addDecal({ x: q.x, z: q.z, y: 0.025, sx: 1.25, sz: 1.25, kind: 0, place: idx.get('buoy_lights'), g: lin(candle), depth: 0.35 + rng() * 0.45, night: 0.85 });
      if (arena?.halos) q.halo = arena.halos.add(q.x, 0.25, q.z, [0, 0, 0], 0.9, rng() * 10);
    }
  }

  // ---------------------------------------------------------- the Bell Pool: the drowned bell on its floor, and the moon's glint
  const bell = P.find((p) => p.id === 'bell_pool');
  if (bell && bell.area.kind === 'disc') {
    const a = bell.area, B = bellSpot(a);
    // (the fix pass: the bell lies in the pool's north half, fallen from between its two posts, its crown toward them and its mouth
    // turned south-east to the open water the raft comes from; a raft fishing the pool's south side is never laid on it)
    // (laid above the swell's crests (0.15 m; their rare full sum is 0.19): at 0.02 every passing crest hid it, so it came and went in a
    // lift's shot and read as a board; seen from above the height is no parallax at all)
    addDecal({ x: B.x, z: B.z, y: 0.15, rot: B.rot, sx: B.sx, sz: B.sz, kind: 1, place: idx.get('bell_pool'), g: lin(light), ink: 0.66, night: 0.6 });
    addDecal({ x: B.mx + 0.5, z: B.mz + 0.7, y: 0.16, rot: 0.3, sx: 2.6, sz: 1.1, kind: 2, place: idx.get('bell_pool'), g: lin(light), night: 1 });
    // "The moon looks in on the old bell": a pale shaft standing on the bell's lip once its mist has lifted (strongest at night)
    addDecal({ x: B.mx, z: B.mz, y: 0, sx: 3.0, sz: 16, kind: 3, place: idx.get('bell_pool'), g: lin(light), night: 1 });
  }

  let decalMesh = null;
  if (decals.length) {
    const base = new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2);
    const g = G(new THREE.InstancedBufferGeometry());
    g.index = base.index; g.setAttribute('position', base.attributes.position);
    const n = decals.length, aC = new Float32Array(n * 4), aS = new Float32Array(n * 4), aG = new Float32Array(n * 3), aI = new Float32Array(n * 4);
    decals.forEach((d, i) => { aC.set([d.x, d.y, d.z, d.rot], i * 4); aS.set([d.sx / 2, d.sz / 2, d.kind, d.place ?? 0], i * 4); aG.set(d.g, i * 3); aI.set([d.ink, d.depth, d.seed, d.night], i * 4); });
    g.setAttribute('aC', new THREE.InstancedBufferAttribute(aC, 4)); g.setAttribute('aS', new THREE.InstancedBufferAttribute(aS, 4));
    g.setAttribute('aG', new THREE.InstancedBufferAttribute(aG, 3)); g.setAttribute('aI', new THREE.InstancedBufferAttribute(aI, 4));
    g.instanceCount = n;
    G(base);
    const u = { uK: { value: Array.from({ length: BANK.maxBanks }, () => 0) }, uNight: { value: 0 }, uFogD: { value: 0.0055 }, uTime: { value: 0 },
      uDeep: { value: lin3(0x3a3488) }, uRust: { value: lin3(0x8a4b3a) }, uVerd: { value: lin3(0x5f9a86) }, uMoon: { value: lin3(0xdcd8f4) } };
    const m = M(new THREE.ShaderMaterial({ uniforms: u, vertexShader: DECAL_VS, fragmentShader: DECAL_FS, transparent: true, depthWrite: false, fog: false, toneMapped: false,
      blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendEquation: THREE.AddEquation }));
    decalMesh = new THREE.Mesh(g, m);
    decalMesh.name = 'placeDecals'; decalMesh.renderOrder = 1; decalMesh.frustumCulled = false;
    group.add(decalMesh);
  }
  arena?.halos?.commit?.();

  // ---------------------------------------------------------- the giant's back (one mesh, shown a few seconds at a time)
  // a long arched back with a keel along its spine and a swept dorsal fin breaking the water behind its crown (the fix pass: the smooth dome
  // with a rim all round read as a hole in the water, a pit with a pale lip); no species shape, no face. Its rim light catches the fin and
  // the spine from above, never a ring round its outline.
  const backDome = new THREE.SphereGeometry(1, 24, 10, 0, TAU, 0, Math.PI / 2);
  { const pp = backDome.attributes.position; for (let i = 0; i < pp.count; i++) { const x = pp.getX(i), y = pp.getY(i), z = pp.getZ(i); const ridge = Math.exp(-x * x * 30) * 0.3 * y; pp.setXYZ(i, x * 0.3, (y + ridge) * 0.4 * (1 - 0.25 * Math.max(0, -z)), z * 1.4 * (1 - 0.18 * Math.max(0, z))); } }
  const finSh = new THREE.Shape();
  finSh.moveTo(0.28, 0); finSh.quadraticCurveTo(0.1, 0.32, -0.42, 0.62); finSh.quadraticCurveTo(-0.3, 0.3, -0.5, 0);
  const finG = new THREE.ExtrudeGeometry(finSh, { depth: 0.05, bevelEnabled: false, curveSegments: 6 });
  finG.translate(0, 0, -0.025);
  const backG = G(merge([prep(backDome, { color: [1, 1, 1] }), prep(finG, { matrix: mat(0, 0.36, -0.15, 0, -Math.PI / 2, 0), color: [1, 1, 1] })]));
  backG.computeVertexNormals();
  // (drawn after the bank, a little veiled: a dark back seen in the mist, not a stone under it)
  const backM = M(inkToon({ color: BACK_COL, rim: 0.5, rimColor: 0xb4acec, rimPower: 0.9, steps: 3, transparent: true, opacity: 0.88, gloss: 0.55, shine: 24, wet: 0.7 }, { fogScale: 0.9 }));
  backM.depthWrite = false;
  const back = new THREE.Mesh(backG, backM);
  back.name = 'giantBack'; back.visible = false; back.renderOrder = 7;
  group.add(back);
  const BK = { every: Array.isArray(giantBack.every) ? giantBack.every : [25, 45], dur: num(giantBack.dur, 2), phases: Array.isArray(giantBack.phases) ? giantBack.phases : ['gloomtide'],
    places: Array.isArray(giantBack.places) ? giantBack.places : ['under_the_span', 'buoy_lights'], cur: null, count: 0 };

  // ---------------------------------------------------------- per-frame
  const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _p = new THREE.Vector3();
  const tmpC = new THREE.Color(), tmpC2 = new THREE.Color();
  const LAV = new THREE.Color(0xc8bfea), LAV_N = new THREE.Color(0x8d85c4), SHADE = new THREE.Color(0x766cae), SHADE_N = new THREE.Color(0x403a78);
  const CANDLE3 = lin(candle);
  function startBack(i, raft, near = null) {
    const s = S[i], a = s.area, c = footprintCentre(a), b = footprintBox(a, 0);
    let x = c.x, z = c.z, best = Infinity;
    for (let t = 0; t < (near ? 160 : 24); t++) {
      const qx = b.x0 + rng() * (b.x1 - b.x0), qz = b.z0 + rng() * (b.z1 - b.z0);
      if (footprintSdf(a, qx, qz) > -1.2) continue;
      if (raft && Math.hypot(qx - raft.x, qz - raft.z) < 5) continue;
      // (a debug back asked to turn near a point: the nearest spot at least 6 m from it)
      if (near) { const d = Math.hypot(qx - near.x, qz - near.z); if (d < 6 || d >= best) continue; best = d; x = qx; z = qz; continue; }
      x = qx; z = qz; break;
    }
    const heading = a.kind === 'path' ? Math.atan2(a.pts[a.pts.length - 1][0] - a.pts[0][0], a.pts[a.pts.length - 1][1] - a.pts[0][1]) + (rng() < 0.5 ? 0 : Math.PI)
      : a.kind === 'rect' ? (rng() < 0.5 ? 0 : Math.PI) : rng() * TAU;
    BK.cur = { i, id: s.id, x, z, heading, t: 0 };
    BK.count++;
    try { ctx.water?.addRipple?.(x, z, 0.7); } catch { /* optional */ }
    try { ctx.bus?.emit?.('world:giantBack', { placeId: s.id, x: +x.toFixed(2), z: +z.toFixed(2) }); } catch { /* optional */ }
  }
  function updateBack(dt, phase, raft) {
    const night = BK.phases.includes(phase);
    if (!BK.cur) {
      for (let i = 0; i < S.length; i++) {
        const s = S[i];
        if (!BK.places.includes(s.id)) continue;
        if (!night || s.lifted || s.lift || s.op < 0.5) { continue; }
        s.back.next -= dt;
        if (s.back.next <= 0) { s.back.next = BK.every[0] + rng() * (BK.every[1] - BK.every[0]); startBack(i, raft); break; }
      }
    }
    const c = BK.cur;
    if (!c) { back.visible = false; return; }
    c.t += dt;
    const k = c.t / BK.dur;
    if (k >= 1 || S[c.i].op < 0.05) { BK.cur = null; back.visible = false; return; }
    // it rolls up, holds a moment at the top of its turn, and sinks (a slow roll, not a bob)
    const rise = Math.min(1, Math.sin(Math.PI * k) * 1.35);
    const fwd = (k - 0.5) * 3.2;
    back.visible = true;
    // (1.5×: at 1× the back read as a speck from the play camera; the stage's look)
    back.scale.setScalar(BACK_SCALE);
    back.position.set(c.x + Math.sin(c.heading) * fwd, (-0.4 + 0.56 * rise) * BACK_SCALE, c.z + Math.cos(c.heading) * fwd);
    back.rotation.set(0.26 - 0.52 * k, c.heading, 0);
    // a slow V-wake: soft ripples left behind its crown as it moves, and a pair as it sinks (rings on the fish, metres from any raft)
    const wakeEvery = 0.45, wk = Math.floor(c.t / wakeEvery);
    if (rise > 0.3 && wk !== c.wk) {
      c.wk = wk;
      const bx = back.position.x - Math.sin(c.heading) * 1.4 * BACK_SCALE, bz = back.position.z - Math.cos(c.heading) * 1.4 * BACK_SCALE;
      try { ctx.water?.addRipple?.(bx + Math.cos(c.heading) * 0.5, bz - Math.sin(c.heading) * 0.5, 0.32); ctx.water?.addRipple?.(bx - Math.cos(c.heading) * 0.5, bz + Math.sin(c.heading) * 0.5, 0.32); } catch { /* optional */ }
    }
    if (k > 0.72 && !c.rippled) { c.rippled = true; try { ctx.water?.addRipple?.(back.position.x, back.position.z, 0.55); ctx.water?.addRipple?.(back.position.x - Math.sin(c.heading) * 1.2, back.position.z - Math.cos(c.heading) * 1.2, 0.4); } catch { /* optional */ } }
  }

  /** info: {raft: {x, z} | null, phase, night 0..1, fog: Color, fogDensity, glowK} */
  function update(dt, t, info = {}) {
    const raft = info.raft && Number.isFinite(info.raft.x) ? info.raft : null;
    const n = clamp01(num(info.night, 0));
    // the banks: each its own opacity (the lift; the raft inside the footprint thins that whole bank)
    for (let i = 0; i < S.length; i++) {
      const s = S[i];
      s.inside = !!raft && insideFootprint(s.area, raft.x, raft.z);
      if (s.lift) {
        s.lift.t += dt;
        const k = s.lift.dur > 0 ? clamp01(s.lift.t / s.lift.dur) : 1;
        s.op = s.lift.from * (1 - sstep(0, 1, k));
        s.glow = Math.max(s.glow, sstep(0.2, 1, k));
        if (k >= 1) { s.lift = null; s.lifted = true; s.op = 0; s.glow = 1; }
      } else {
        s.target = bankTarget({ lifted: s.lifted, inside: s.inside, insideK });
        s.op = easeOpacity(s.op, s.target, dt, ease);
        s.glow = s.lifted ? Math.min(1, s.glow + dt / 0.6) : 0;
      }
      bank.u.uOp.value[i] = s.op;
      bank.u.uLift.value[i] = s.lift ? clamp01(s.lift.dur > 0 ? s.lift.t / s.lift.dur : 1) : 0;
      if (decalMesh) decalMesh.material.uniforms.uK.value[i] = s.glow;
    }
    bank.mesh.visible = S.some((s) => s.op > 0.002);
    const bu = bank.u;
    bu.uTime.value = t;
    // lavender by day and dusk, a moonlit violet at night; a breath of the air in it
    const fog = info.fog && info.fog.isColor ? info.fog : null;
    tmpC.copy(LAV).lerp(LAV_N, n); if (fog) tmpC.lerp(fog, 0.12);
    tmpC2.copy(SHADE).lerp(SHADE_N, n); if (fog) tmpC2.lerp(fog, 0.2);
    bu.uLit.value.copy(tmpC); bu.uShade.value.copy(tmpC2);
    bu.uAmt.value = 1 - 0.12 * n;
    // the dressing
    if (decalMesh) { const u = decalMesh.material.uniforms; u.uTime.value = t; u.uNight.value = 0.22 + 0.78 * n; u.uFogD.value = num(info.fogDensity, 0.0055); }
    const wh = ctx.water && !ctx.water.isStub && typeof ctx.water.getHeight === 'function' ? ctx.water.getHeight : null;
    if (pads) {
      for (let i = 0; i < padList.length; i++) {
        const q = padList[i];
        let h = 0, tx = 0, tz = 0;
        if (wh) { h = wh(q.x, q.z) || 0; tx = ((wh(q.x + 0.6, q.z) || 0) - h) * 0.5; tz = ((wh(q.x, q.z + 0.6) || 0) - h) * 0.5; }
        _e.set(-tz, q.ry, tx, 'YXZ'); _q.setFromEuler(_e); _s.setScalar(q.s);
        pads.setMatrixAt(i, _m4.compose(_p.set(q.x, h * 0.4 + 0.01, q.z), _q, _s));
      }
      pads.instanceMatrix.needsUpdate = true;
    }
    if (caps) {
      const bi = idx.get('buoy_lights'), g = bi !== undefined ? S[bi].glow : 0;
      const k = g * (0.25 + 0.75 * n);
      caps.userData.u.uK.value = k;
      let touched = false;
      for (let i = 0; i < capList.length; i++) {
        const q = capList[i];
        let h = 0, tx = 0, tz = 0;
        if (wh) { h = wh(q.x, q.z) || 0; tx = ((wh(q.x + 0.4, q.z) || 0) - h) * 1.2; tz = ((wh(q.x, q.z + 0.4) || 0) - h) * 1.2; }
        else h = Math.sin(t * 1.3 + q.ph) * 0.03;
        _e.set(-tz, q.ph, tx, 'YXZ'); _q.setFromEuler(_e); _s.setScalar(1);
        caps.setMatrixAt(i, _m4.compose(_p.set(q.x, h, q.z), _q, _s));
        if (q.halo >= 0 && arena?.halos) { const hk = k * (0.85 + 0.15 * Math.sin(t * 1.7 + q.ph * 3)); arena.halos.setColor(q.halo, CANDLE3[0] * hk, CANDLE3[1] * hk, CANDLE3[2] * hk); touched = true; }
      }
      caps.instanceMatrix.needsUpdate = true;
      for (const m of markerLamps) if (m.halo >= 0) { const hk = k * 1.3; arena.halos.setColor(m.halo, CANDLE3[0] * hk, CANDLE3[1] * hk, CANDLE3[2] * hk); touched = true; }
      if (touched) arena.halos.touchColors();
    }
    // the cutaway: only while the raft is under Under the Span's deck (its footprint plus 2 m) and no lift is playing
    {
      const si = idx.get('under_the_span');
      const under = !!raft && si !== undefined && footprintSdf(S[si].area, raft.x, raft.z) < 2 && !S.some((q) => q.lift);
      cut.uCutK.value = easeOpacity(cut.uCutK.value, under ? 1 : 0, dt, 0.5);
      if (raft) cutFocus.set(raft.x, 0.9, raft.z);
    }
    if (veil) {
      const vu2 = veil.material.uniforms;
      vu2.uTime.value = t;
      // (LOST-TACKLE §5.3: with the raft in the cut behind it, the Veil thins: the lens looks back through falling water, never a wall)
      const Nv = L?.notch, inCut = !!Nv && !!raft && raft.x * Nv.ca + raft.z * Nv.sa > Nv.r0 + 0.5;
      vu2.uK.value = easeOpacity(vu2.uK.value, inCut ? 0.45 : Nv && !Nv.open ? 1.4 : 1, dt, 0.8);   // (denser while the cut is shut)
    }
    if (stone) { const ol = stone.children[0]?.material; if (ol?.color) { ol.color.set(INK); if (fog) ol.color.lerp(fog, 0.1 + 0.2 * n); } }
    updateBack(dt, info.phase || null, raft);
  }

  /** {owned, lifted}: a lifted place's bank is gone and its dressing lit (a running lift plays on); every other place stands in mist. */
  function setPlaces({ owned = [], lifted = [] } = {}) {
    const L2 = new Set(Array.isArray(lifted) ? lifted : []);
    for (const s of S) {
      if (s.lift) continue;
      if (L2.has(s.id)) { s.lifted = true; s.op = 0; s.glow = 1; }
      else if (s.lifted) { s.lifted = false; s.op = 1; s.glow = 0; }
    }
    void owned;
    return true;
  }
  /** Lift a place's mist over `sec` s (0: at once). → false for a place that has no bank. */
  function liftMist(id, sec = 3) {
    const i = idx.get(id);
    if (i === undefined) return false;
    const s = S[i], d = Math.max(0, num(sec, 3));
    if (d <= 0) { s.lift = null; s.lifted = true; s.op = 0; s.glow = 1; bank.u.uOp.value[i] = 0; return true; }
    if (s.lifted && !s.lift) return true;
    s.lift = { t: 0, dur: d, from: s.op };
    return true;
  }
  /** Where the lift's shot looks for a place: {x, y, z, r} (the water it opens, at the height its dressing reads best), or null. */
  function placeAnchor(id) {
    const p = P.find((q) => q.id === id);
    if (!p) return null;
    const c = footprintCentre(p.area), b = footprintBox(p.area, 0);
    const r = Math.max(b.x1 - b.x0, b.z1 - b.z0) / 2;
    const y = id === 'under_the_span' ? 1.8 : id === 'lily_maze' ? 0.3 : 0.4;
    // (the Bell Pool: the shot looks down on its bell from the open water off its mouth's shoulder, 45° off its length (the profile and
    // the mouth both read), high and close, so the bell on the floor reads as a bell and not as a board at a grazing angle; the fix pass)
    // (Veilback Brook: the lift's shot looks down the cut from its mouth, the lens inside the Veil, low, so its banks frame it; LOST-TACKLE §5)
    if (id === 'veilback_brook' && L?.notch) { const N = L.notch, al = N.end - 6.5; return { x: al * N.ca, y: 0.6, z: al * N.sa + 0.5, r: 6, side: [-N.ca, -N.sa], elev: 14, dist: 10.5 }; }
    if (id === 'bell_pool' && p.area?.kind === 'disc') { const B = bellSpot(p.area); const sx = B.dir[0] + B.dir[1], sz = B.dir[1] - B.dir[0], sl = Math.hypot(sx, sz) || 1; return { x: B.x + B.dir[0] * 0.5, y: 0, z: B.z + B.dir[1] * 0.5, r: p.area.r, side: [sx / sl, sz / sl], elev: 46, dist: 8.8 }; }
    // (a path's broadside: the lift's shot films a long place across it, never down its length behind its first pier; the stage)
    const a = p.area, q = a?.kind === 'path' && Array.isArray(a.pts) && a.pts.length >= 2 ? [a.pts[a.pts.length - 1][0] - a.pts[0][0], a.pts[a.pts.length - 1][1] - a.pts[0][1]] : null;
    const ql = q ? Math.hypot(q[0], q[1]) : 0;
    return ql > 0 ? { x: c.x, y, z: c.z, r, face: [-q[1] / ql, q[0] / ql] } : { x: c.x, y, z: c.z, r };
  }
  /** Whether the water at (x, z) is open: no place's footprint holds it, or that place's mist has lifted and its lift is over. */
  function openAt(x, z) {
    for (const s of S) if (insideFootprint(s.area, x, z)) return s.lifted && !s.lift;
    return true;
  }
  function readout() {
    const r3 = (x) => Math.round(x * 1000) / 1000;
    return {
      banks: S.map((s, i) => ({ id: s.id, op: r3(s.op), target: r3(s.target), lifting: !!s.lift, lifted: s.lifted, inside: s.inside, glow: r3(s.glow), keep: keeps[i] })),
      lifted: S.filter((s) => s.lifted).map((s) => s.id),
      back: BK.cur ? { placeId: BK.cur.id, t: r3(BK.cur.t), x: r3(BK.cur.x), z: r3(BK.cur.z) } : null, backs: BK.count,
      dressing: { pads: padList.length, caps: capList.length, decals: decals.length, chains: chainTips.length, piers: piers.length, redress: !!redress, tower: !!tower, veil: !!veil, layers: layers.length },
      cut: r3(cut.uCutK.value),
      calls: stats().calls,
    };
  }
  function stats() {
    let calls = 0;
    group.traverse((o) => { if ((o.isMesh || o.isPoints) && o.visible !== false) calls++; });
    return { calls, banks: S.length, decals: decals.length, pads: padList.length, caps: capList.length };
  }
  /** Debug: turn a giant's back now in a place's bank (the look scenario's frame). */
  function forceBack(id, near = null) {
    const i = idx.get(id);
    if (i === undefined) return false;
    startBack(i, null, near && Number.isFinite(near.x) && Number.isFinite(near.z) ? near : null);
    return true;
  }
  function dispose() {
    group.parent?.remove(group);
    if (pads) pads.dispose(); if (caps) caps.dispose();
    for (const g of geos) g.dispose();
    for (const m of mats) m.dispose();
  }
  // the wildlife's moths (actors-wildlife.js): every third float cap of the Buoy Lights, lit as the caps burn
  const capLamps = capList.filter((q, i) => i % 3 === 1).map((q, i) => ({ key: `cap${i}`, kind: 'cap', x: q.x, y: 0.2, z: q.z, k: 0 }));
  const lamps = () => { const k = caps ? caps.userData.u.uK.value : 0; for (const l of capLamps) l.k = k; return caps ? capLamps : []; };
  return { group, update, setPlaces, liftMist, placeAnchor, openAt, readout, stats, forceBack, dispose, lamps, banks: bank.mesh, ids: P.map((p) => p.id) };
}

/** A small chipped block (a fallen stone): a box with its corners knocked off. */
function rockGeoLite(s) {
  const g = new THREE.BoxGeometry(s * 1.6, s, s * 1.1, 2, 1, 2);
  wobble(g, s * 0.12, 3.1, s * 97);
  return g;
}
function lin3(hex) { const c = lin(hex); return new THREE.Color(c[0], c[1], c[2]); }
function mixHex(a, b, t) { return new THREE.Color(a).lerp(new THREE.Color(b), t).getHex(); }
