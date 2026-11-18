// world-flora.js — the vegetation kit (WATERS §5; LAKE2 §1A, §3.3) (world author). Built only for a water whose look has lush > 0 under
// the loop (data.ZONE_LOOKS: Sporewood Pools, lush 0.33); the Mossmere (lush 0, no look) and the flag-off game never reach any of it, so
// their programs, their draws and their geometry are as they were (outline-shore.test.mjs part 1 pins the Mossmere's).
//
//   floraPlan(L, look, o)   pure and seeded (its own stream, L.artSeed ^ 0xF10A): every plant's kind, place, turn, size and lean, from
//                           the outline shore's field (world-outline): moss cushions and carpets on every bank top and isle, ferns up
//                           the high banks and under the caps, reeds and pale sedge where the water's reed runs are (WATERCRAFT's
//                           geometry: the art is where the fishing reads it), lily and leaf rafts on its lily beds and in the coves,
//                           leafy shrubs, broadleaf trees leaning over the water, far crowns behind the banks, hanging strands, the
//                           night's flowers and fireflies. Tall kinds keep off the camera's side of the water (the play lens is always
//                           south of the raft: a south-facing bank keeps to kinds under a metre), off the places, the mooring and the
//                           glides; nothing stands in open water.
//   buildFlora(L, look, o)  the plan stamped from prototypes into merged meshes, by material in culled cells (3 × 2 over the basin):
//                           `flora` (blades, strands, shrubs, trees: mirrored, casting) and `flora.low` (cushions, ferns, pads: neither);
//                           on the low tier the two are one. Opaque (no alpha test), double-sided; sway and the raft's parting in the
//                           vertex stage (blades and strands bend away from the raft), the leaves' backlit translucency (leafHi × 0.3
//                           at edges facing the key) in the fragment stage. The night emitters are their own two draws: the flowers
//                           (they open from dusk, faintly lit) and the fireflies (pale lime points, no light, never near the raft).
//                           → {group, meshes, update(dt, t, focus), applyMood(env), stats(), dispose()}
//   lushLook(D, zoneId)     the look when the kit is on for that water, else null
import * as THREE from 'three';
import { setupSurface } from './toon.js';
import { inkToon } from './world-fx.js';
import { makeRng } from './core.js';
import { lin, mixArr, scaleArr, vnoise3 } from './world-geo.js';
import { sdfAt, sdfGrad, groundAt, bankAt, arcAt, shoreAt } from './world-outline.js';
import { clearanceOf } from './watercraft-face.js';

const TAU = Math.PI * 2;
const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** The water's look when the vegetation kit is on for it (the loop, a look with lush > 0), else null. */
export function lushLook(D, zoneId) {
  if (D?.LOOP_ENABLED !== true) return null;
  const k = D?.ZONE_LOOKS?.[zoneId];
  return k && num(k.lush) > 0 ? k : null;
}
/** A leaf key in linear colour, × the look's albedo and its per-channel gain (the leaf track carried through the night's light). */
export function lushColor(look, hex, a = num(look?.albedo, 1.5)) {
  const c = lin(hex), g = Array.isArray(look?.gain) ? look.gain : [1, 1, 1];
  return [c[0] * a * g[0], c[1] * a * g[1], c[2] * a * g[2]];
}
/** Give an ink-toon material the kit's floor (its own colour × k lifting its shadows: green-violet, never grey) — the banks' moss. */
export function lushFloor(mat, U, name) {
  const base = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => {
    base?.call(mat, sh, r);
    Object.assign(sh.uniforms, U);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float gwFloraFloor;')
      .replace('#include <opaque_fragment>', 'outgoingLight += diffuseColor.rgb * gwFloraFloor;\n#include <opaque_fragment>');
  };
  const key = mat.customProgramCacheKey?.() || 'gwInkToonFog';
  mat.customProgramCacheKey = () => `${key}:lushFloor:${name}`;
  return mat;
}
/**
 * (LAKE 2, the art pass: "the banks' ground reads as a low-res camouflage blotch") The banks' green moss laid in the fragment stage, so its
 * drifts have clean, crisp edges at any distance and never follow the ground's 2 m grid: a vertex attribute `aMoss` (0..1, where moss
 * can lie: the tops and the land behind them) and a few octaves of value noise on the world position, cut with a narrow smooth edge
 * (fwidth-wide), the moss itself mottled between `mossG` and `mossGHi` with a fine speckle. U: {gwMossG, gwMossGHi, gwMossT} (linear rgb,
 * linear rgb, the drift threshold).
 */
export function lushMoss(mat, U, name) {
  const base = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => {
    base?.call(mat, sh, r);
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aMoss; varying float vGwMoss; varying vec3 vGwMossP;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGwMoss = aMoss; vGwMossP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
uniform vec3 gwMossG; uniform vec3 gwMossGHi; uniform float gwMossT; varying float vGwMoss; varying vec3 vGwMossP;
float gwMh(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float gwMn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(gwMh(i), gwMh(i + vec2(1.0, 0.0)), f.x), mix(gwMh(i + vec2(0.0, 1.0)), gwMh(i + vec2(1.0, 1.0)), f.x), f.y); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
{
  vec2 q = vGwMossP.xz;
  float n = gwMn(q * 0.3) * 0.55 + gwMn(q * 0.85 + 3.1) * 0.3 + gwMn(q * 2.3 + 7.7) * 0.15;
  float e = fwidth(n) * 1.5 + 0.012;
  float drift = smoothstep(gwMossT - e, gwMossT + e, n) * clamp(vGwMoss, 0.0, 1.0);
  vec3 moss = mix(gwMossG, gwMossGHi, smoothstep(0.35, 0.85, gwMn(q * 1.3 + 11.0)));
  moss *= 0.82 + 0.3 * gwMn(q * 7.0 + 5.0);
  diffuseColor.rgb = mix(diffuseColor.rgb, moss, drift * 0.95);
}`);
  };
  const key = mat.customProgramCacheKey?.() || 'gwInkToonFog';
  mat.customProgramCacheKey = () => `${key}:lushMoss:${name}`;
  return mat;
}
/**
 * The water's baked masks on a lush water (water.js bakes them into its depth texture's spare channels, B and A, which only the Mossmere's
 * face uses): `dapple` 1 where the moon falls on the water, lower in the canopy's shade near the banks with "moon coins" through its
 * gaps (a static, low-frequency pattern: no animation, no glitter); `weed` the shallows' film (depth under about 0.3, near a bank,
 * in patches). sd: the shore's distance (m, + in the water), depth 0..1.
 */
export function lushMasks(look, x, z, sd, depth) {
  if (!look || !(sd > -0.5)) return { dapple: 1, weed: 0 };
  const sc = num(look.dapple?.scale, 0.075);
  const n = vnoise3(x * sc, 1.7, z * sc) * 0.65 + vnoise3(x * sc * 2.3 + 11, 3.1, z * sc * 2.3 - 7) * 0.35;
  const coins = clamp01((n - 0.52) / 0.16), shade = clamp01(1 - sd / 14);
  const weedN = vnoise3(x * 0.21 + 5, 0.4, z * 0.21 - 3);
  const weed = clamp01((0.32 - depth) / 0.2) * clamp01(1 - sd / 9) * clamp01((weedN - 0.35) / 0.25);
  return { dapple: 1 - shade * (1 - coins), weed };
}
/** The kit's fixed figures: the cells, the low tier's single material, the camera-side rule, the clearances. */
export const FLORA = Object.freeze({
  cells: [3, 2], margin: 32,
  camSide: 0.35,          // a bank whose outward normal points this far toward +z (the lens's side) keeps to low kinds near the water
  camSideBack: 14,        // … within this many metres of its waterline
  keepWater: 2.4,         // reeds and pads keep this far off the places, the mooring and every glide (the raft's 1.6 m and a margin)
  keepLand: 3.5,          // shrubs, trees and tall ferns keep this far off the home camera's lens and its line to the barge
  fireflyNear: 6,         // fireflies hide within this of the raft (WATERS §3.2)
});

// ------------------------------------------------------------------ the plan (pure)
/** A random point on any bank (the shore's or an island's), weighted by its length: {x, z, ci (0 the shore), k}. */
function bankPoint(O, rng, onlyShore = false) {
  const C = O.curves;
  let tot = 0; for (let i = 0; i < C.length; i++) if (!onlyShore || i === 0) tot += C[i].n;
  let r = Math.floor(rng() * tot);
  for (let i = 0; i < C.length; i++) {
    if (onlyShore && i > 0) break;
    if (r < C[i].n) return { x: C[i].x[r], z: C[i].z[r], ci: i, k: r };
    r -= C[i].n;
  }
  return { x: C[0].x[0], z: C[0].z[0], ci: 0, k: 0 };
}
const G = { x: 0, z: 0 };
/** From a bank point, `d` m into the land (d < 0: into the water) along the field's slope. → {x, z, s (the field there), nx, nz (outward)} */
function offBank(O, p, d) {
  sdfGrad(O, p.x, p.z, G);
  const x = p.x - G.x * d, z = p.z - G.z * d, nx = -G.x, nz = -G.z;
  sdfGrad(O, x, z, G);   // (inz: the field's own outward slope where the plant stands, as the lens sees the bank it is on)
  return { x, z, s: sdfAt(O, x, z), nx, nz, inz: -G.z };
}
/** The ground's height there (the water's level, 0, on the water). */
const yAt = (O, x, z) => Math.max(0, groundAt(O, x, z));

/**
 * The plan. look: ZONE_LOOKS[zone]; o: {tier ('high' | 'medium' | 'low'), avoid (watercraft-face.avoidList's shape: the places, the
 * mooring, the docks), glides ([[x, z], …] polylines the raft sails), geo (WATERCRAFT[water].geometry: reedRuns, beds, reedIslands),
 * lens ([{x, z, r}] the home camera's keep-clear), caps ([{x, z, r}] cap trees' feet to skirt), extra (items to add), rafts ([{x, z, r}]
 * more lily rafts: the frogs' beats)}.
 * → {items: [{k, x, y, z, ry, s, sy, lean, la, v}], flowers: [{x, y, z, s, c}], fireflies: [{x, y, z}], counts}
 */
export function floraPlan(L, look, { tier = 'high', avoid = null, glides = [], geo = null, lens = [], caps = [], extra = [], rafts = [] } = {}) {
  const O = L?.outline;
  const out = { items: [], flowers: [], fireflies: [], counts: {} };
  if (!O || !look) return out;
  const rng = makeRng(((L.artSeed | 0) ^ 0xf10a) >>> 0);
  const F = look.flora || {}, mult = num(look.tiers?.[tier], tier === 'low' ? 0.4 : tier === 'medium' ? 0.7 : 1);
  const want = (k) => Math.round(num(F[k]) * mult);
  const segs = [];
  for (const g of glides) if (Array.isArray(g)) for (let i = 0; i + 1 < g.length; i++) segs.push({ ax: g[i][0], az: g[i][1], bx: g[i + 1][0], bz: g[i + 1][1], r: 1.6, kind: 'glide' });
  const AV = { circles: (avoid?.circles || []).slice(), segs: (avoid?.segs || []).concat(segs) };
  const waterOk = (x, z) => clearanceOf(AV, x, z) >= FLORA.keepWater;
  const lensOk = (x, z, pad = FLORA.keepLand) => lens.every((c) => Math.hypot(x - c.x, z - c.z) > c.r + pad);
  const capOk = (x, z, pad = 0.6) => caps.every((c) => Math.hypot(x - c.x, z - c.z) > c.r + pad);
  // (the camera's side: the play lens stands south of the raft (+z) on every water, so a bank facing it keeps low near its water)
  const camSide = (nz, d) => nz > FLORA.camSide && d < FLORA.camSideBack;
  const push = (it) => { out.items.push(it); out.counts[it.k] = (out.counts[it.k] || 0) + 1; return it; };
  const tint = () => rng.range(-1, 1);
  // ---- moss: cushions and carpets on every bank top and face, the isles' tops; the two moss isles carpeted whole
  {
    const n = want('moss');
    const carpets = (O.islands || []).filter((o) => o.kind === 'moss' || o.kind === 'cap');
    const nCarpet = Math.round(n * 0.18);
    for (let t = 0, k = 0; t < nCarpet * 30 && k < nCarpet && carpets.length; t++) {
      const o = carpets[k % carpets.length], a = rng() * TAU, d = Math.sqrt(rng()) * 6;
      const x = o.x + Math.cos(a) * d * 1.3, z = o.z + Math.sin(a) * d * 0.8, s0 = sdfAt(O, x, z);
      if (s0 > -0.4) continue;
      push({ k: 'cushion', x, y: yAt(O, x, z) - 0.1, z, ry: rng() * TAU, s: rng.range(0.9, 1.7), sy: rng.range(0.4, 0.65), lean: 0, la: 0, v: tint() });
      k++;
    }
    for (let t = 0, k = 0; t < (n - nCarpet) * 20 && k < n - nCarpet; t++) {
      const p = bankPoint(O, rng), d = Math.pow(rng(), 0.7) * (p.ci ? 3.2 : 6) + 0.4, q = offBank(O, p, d);
      if (q.s > -0.25 || q.s < -d - 2) continue;
      const B = bankAt(O, q.x, q.z), top = clamp01((d - 0.6) / (1.2 + 0.7 * B.h));
      if (rng() > 0.35 + 0.65 * top) continue;   // (thicker over the tops than on the faces)
      push({ k: 'cushion', x: q.x, y: yAt(O, q.x, q.z) - 0.1, z: q.z, ry: rng() * TAU, s: rng.range(0.45, 1.25) * (0.7 + 0.5 * top), sy: rng.range(0.35, 0.75), lean: 0, la: 0, v: tint() });
      k++;
    }
  }
  // ---- broadleaf trees: a few on the high banks, leaning out over the water, never on the lens's side
  const trees = [];
  {
    const n = want('trees');
    for (let t = 0, k = 0; t < n * 400 && k < n; t++) {
      const p = bankPoint(O, rng, true), q = offBank(O, p, rng.range(1.4, 2.8));
      if (q.s > -0.8 || q.nz > 0.1 || q.inz > 0.1) continue;
      const B = bankAt(O, q.x, q.z);
      if (B.h < 2 || !lensOk(q.x, q.z, 8) || !capOk(q.x, q.z, 4) || trees.some((u) => Math.hypot(u.x - q.x, u.z - q.z) < 18)) continue;
      const it = push({ k: 'tree', x: q.x, y: yAt(O, q.x, q.z) - 0.3, z: q.z, ry: rng() * TAU, s: rng.range(0.85, 1.2), sy: rng.range(0.9, 1.15), lean: rng.range(0.17, 0.42), la: Math.atan2(-q.nz, -q.nx), v: tint() });
      trees.push(it); k++;
    }
  }
  // ---- ferns: up the high banks, the bluff, the Seep's ravine, under the caps; a few tree-ferns on the high banks away from the lens
  {
    const n = want('ferns');
    const nTree = Math.max(1, Math.round(n * 0.06));
    for (let t = 0, k = 0; t < nTree * 300 && k < nTree; t++) {
      const p = bankPoint(O, rng, true), d = rng.range(2.5, 7), q = offBank(O, p, d);
      if (q.s > -1.5 || q.nz > 0.2 || q.inz > 0.2 || bankAt(O, q.x, q.z).h < 3.2 || !lensOk(q.x, q.z)) continue;
      push({ k: 'tfern', x: q.x, y: yAt(O, q.x, q.z) - 0.2, z: q.z, ry: rng() * TAU, s: rng.range(0.9, 1.25), sy: rng.range(0.8, 1.2), lean: rng.range(0, 0.2), la: Math.atan2(-q.nz, -q.nx), v: tint() });
      k++;
    }
    // (a share skirts the cap trees' feet: ferns under every cap)
    const nCap = caps.length ? Math.round(n * 0.25) : 0;
    for (let t = 0, k = 0; t < nCap * 20 && k < nCap; t++) {
      const c = caps[k % caps.length], a = rng() * TAU, d = c.r + rng.range(0.4, 2.2), x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d;
      if (sdfAt(O, x, z) > -0.3) continue;
      push({ k: rng() < 0.5 ? 'fern' : 'fernUp', x, y: yAt(O, x, z) - 0.05, z, ry: rng() * TAU, s: rng.range(0.7, 1.25), sy: rng.range(0.85, 1.15), lean: 0, la: 0, v: tint() });
      k++;
    }
    for (let t = 0, k = 0; t < (n - nTree - nCap) * 30 && k < n - nTree - nCap; t++) {
      const p = bankPoint(O, rng), d = rng.range(0.7, p.ci ? 3 : 7), q = offBank(O, p, d);
      if (q.s > -0.5) continue;
      const B = bankAt(O, q.x, q.z), hk = clamp01((B.h - 0.6) / 3.4);
      if (rng() > 0.12 + 0.88 * hk) continue;   // (the high banks are fern banks; the Reed Flats have few)
      const low = camSide(q.nz, d);
      push({ k: rng() < 0.55 ? 'fern' : 'fernUp', x: q.x, y: yAt(O, q.x, q.z) - 0.05, z: q.z, ry: rng() * TAU, s: rng.range(0.6, 1.3) * (low ? 0.75 : 1), sy: rng.range(0.85, 1.2) * (low ? 0.75 : 1), lean: 0, la: 0, v: tint() });
      k++;
    }
  }
  // ---- reeds where the water's reed runs are (and round the reed isles), pale sedge on the low banks behind them
  {
    const n = want('reeds'), nSedge = Math.round(n * 0.3), nReed = n - nSedge;
    const runs = Array.isArray(geo?.reedRuns) ? geo.reedRuns : [];
    const off = Array.isArray(geo?.reedOff) ? geo.reedOff : [0.5, 6];
    const isles = (O.islands || []).filter((o) => (geo?.reedIslands || []).includes(o.kind));
    const spans = runs.map(([u0, u1]) => { const s0 = arcAt(O, u0), s1 = arcAt(O, u1); return { s0, span: s1 >= s0 ? s1 - s0 : s1 + O.len - s0 }; });
    const total = spans.reduce((a, b) => a + b.span, 0) + isles.length * 12;
    const q = {};
    for (let t = 0, k = 0; t < nReed * 30 && k < nReed && total > 0; t++) {
      let x, z, d;
      let r = rng() * total, sp = null;
      for (const S of spans) { if (r < S.span) { sp = S; break; } r -= S.span; }
      if (sp) {
        d = off[0] + Math.pow(rng(), 1.5) * (off[1] - off[0] - 0.3);
        shoreAt(O, sp.s0 + rng() * sp.span, q);
        x = q.x - q.nx * d; z = q.z - q.nz * d;
      } else {
        const o = isles[(rng() * isles.length) | 0], C = O.curves[o.curve], kk = (rng() * C.n) | 0;
        const p = offBank(O, { x: C.x[kk], z: C.z[kk] }, -(0.3 + rng() * 2.2)); x = p.x; z = p.z; d = 1;
      }
      if (sdfAt(O, x, z) < 0.25 || !waterOk(x, z)) continue;
      push({ k: 'reed', x, y: -0.1, z, ry: rng() * TAU, s: rng.range(0.8, 1.15), sy: rng.range(0.75, 1.15) * (1.08 - d / 14), lean: rng.range(0, 0.12), la: rng() * TAU, v: tint() });
      k++;
    }
    for (let t = 0, k = 0; t < nSedge * 40 && k < nSedge; t++) {
      const p = bankPoint(O, rng), dd = rng.range(0.3, 3), qq = offBank(O, p, dd);
      if (qq.s > -0.15 || bankAt(O, qq.x, qq.z).h > 1.6) continue;
      push({ k: 'sedge', x: qq.x, y: yAt(O, qq.x, qq.z) - 0.05, z: qq.z, ry: rng() * TAU, s: rng.range(0.8, 1.2), sy: rng.range(0.6, 0.95), lean: rng.range(0, 0.15), la: rng() * TAU, v: tint() });
      k++;
    }
  }
  // ---- lily and leaf rafts: on the water's lily beds, round the cove of the day water and in the coves, rafts of 6–20; the flowers on them
  {
    const n = want('pads'), nFl = want('flowers');
    const centres = [];
    for (const b of geo?.beds || []) centres.push({ x: b.x, z: b.z, r: b.r, w: 1.6 });
    for (const b of rafts) centres.push({ x: b.x, z: b.z, r: num(b.r, 1.5) + 1, w: 1 });   // (the lily frogs' beats: they sit on rafts)
    // (more rafts in the shallows: shallow water within 9 m of a bank, clear of the places and the glides)
    for (let t = 0; t < 400 && centres.length < 12; t++) {
      const p = bankPoint(O, rng, true), q = offBank(O, p, -rng.range(2.5, 7));
      if (q.s < 2 || bankAt(O, q.x, q.z).h > 2.6 || !waterOk(q.x, q.z) || centres.some((c) => Math.hypot(c.x - q.x, c.z - q.z) < 12)) continue;
      centres.push({ x: q.x, z: q.z, r: rng.range(2.2, 3.4), w: 1 });
    }
    const pads = [];
    const wsum = centres.reduce((a, c) => a + c.w, 0);
    for (let t = 0; t < n * 40 && pads.length < n && centres.length; t++) {
      let r = rng() * wsum, c = centres[0];
      for (const cc of centres) { if (r < cc.w) { c = cc; break; } r -= cc.w; }
      const a = rng() * TAU, d = Math.sqrt(rng()) * c.r, x = c.x + Math.cos(a) * d * 1.25, z = c.z + Math.sin(a) * d * 0.85;
      if (sdfAt(O, x, z) < 0.6 || !waterOk(x, z)) continue;
      // (LAKE 2, the art pass: a fallen cap-leaf is a rare, small, dull thing on the water, never gold litter)
      const big = rng() < 0.06, s = big ? rng.range(0.6, 0.9) : rng.range(0.35, 0.72);
      if (pads.some((q2) => Math.hypot(q2.x - x, q2.z - z) < (q2.s + s) * 0.9)) continue;
      const it = push({ k: big ? 'capleaf' : 'pad', x, y: 0.03, z, ry: rng() * TAU, s, sy: 1, lean: 0, la: 0, v: tint() });
      pads.push(it);
    }
    for (let i = 0; i < nFl && i < pads.length; i++) {
      const pd = pads[(i * 7 + 3) % pads.length];
      if (pd.k !== 'pad' || out.flowers.some((f) => f.p === pd)) continue;
      out.flowers.push({ p: pd, x: pd.x + rng.range(-0.1, 0.1) * pd.s, y: 0.05, z: pd.z + rng.range(-0.1, 0.1) * pd.s, s: rng.range(0.8, 1.15), c: i % 2 });
    }
    for (const f of out.flowers) delete f.p;
    out.counts.flowers = out.flowers.length;
  }
  // ---- shrubs: bank tops between the caps, the Landing; never on the lens's side near the water, never by the home lens
  {
    const n = want('bushes');
    for (let t = 0, k = 0; t < n * 60 && k < n; t++) {
      const p = bankPoint(O, rng, true), d = rng.range(2.5, 11), q = offBank(O, p, d);
      if (q.s > -1.5 || camSide(q.nz, d) || camSide(q.inz, -q.s) || !lensOk(q.x, q.z) || !capOk(q.x, q.z, 1.2)) continue;
      push({ k: 'bush', x: q.x, y: yAt(O, q.x, q.z) - 0.15, z: q.z, ry: rng() * TAU, s: rng.range(0.8, 1.5), sy: rng.range(0.75, 1.1), lean: 0, la: 0, v: tint() });
      k++;
    }
  }
  // ---- far crowns behind the banks (the forest's edge), all round
  {
    const n = want('crowns');
    for (let t = 0, k = 0; t < n * 60 && k < n; t++) {
      const p = bankPoint(O, rng, true), d = rng.range(11, 30), q = offBank(O, p, d);
      if (q.s > -9 || !lensOk(q.x, q.z, 6) || (q.nz > FLORA.camSide && d < 22)) continue;
      push({ k: 'crown', x: q.x, y: yAt(O, q.x, q.z) - 0.4, z: q.z, ry: rng() * TAU, s: rng.range(2.2, 4.2), sy: rng.range(0.8, 1.3), lean: 0, la: 0, v: tint() });
      k++;
    }
  }
  // ---- strands from the broadleaf trees' crowns, out over the water (the landmarks add their own: the Veil, the Gill Harp, the Mother's vines)
  {
    const n = Math.max(0, want('strands') - extra.filter((e) => e.k === 'strand' || e.k === 'gill').length);
    for (let i = 0; i < n && trees.length; i++) {
      const tr = trees[i % trees.length], lx = Math.cos(tr.la), lz = Math.sin(tr.la);
      const reach = (4.4 + rng.range(0, 1.6)) * Math.sin(tr.lean) * tr.sy * 1.8 + rng.range(0.6, 1.8);
      const x = tr.x + lx * reach + rng.range(-1.2, 1.2), z = tr.z + lz * reach + rng.range(-1.2, 1.2);
      const top = tr.y + 6.4 * tr.sy * Math.cos(tr.lean) - rng.range(0.2, 0.9);
      push({ k: 'strand', x, y: top, z, ry: rng() * TAU, s: 1, sy: rng.range(1.6, 3.6), lean: 0, la: 0, v: tint() });
    }
  }
  for (const e of extra) push({ ry: 0, s: 1, sy: 1, lean: 0, la: 0, v: 0, ...e });
  // ---- fireflies: over the reeds, the ferns and the shrubs, 0.4–4 m up; never over open water (WATERS §3.2)
  {
    const n = want('fireflies');
    const hosts = out.items.filter((it) => it.k === 'reed' || it.k === 'sedge' || it.k === 'fern' || it.k === 'fernUp' || it.k === 'bush');
    for (let i = 0; i < n && hosts.length; i++) {
      const h = hosts[(rng() * hosts.length) | 0];
      out.fireflies.push({ x: h.x + rng.range(-0.8, 0.8), y: h.y + rng.range(0.4, h.k === 'bush' || h.k === 'reed' ? 2.6 : 1.6), z: h.z + rng.range(-0.8, 0.8) });
    }
    out.counts.fireflies = out.fireflies.length;
  }
  return out;
}

// ------------------------------------------------------------------ the prototypes (each built once per arena; plain arrays)
/** A vertex soup: p (xyz), n (xyz), c (linear rgb), w (sway m, parting m, leaf 0..1), i. */
function soup() { return { p: [], n: [], c: [], w: [], i: [] }; }
function vtx(S, x, y, z, nx, ny, nz, c, sw = 0, pt = 0, lf = 1) {
  const l = Math.hypot(nx, ny, nz) || 1;
  S.p.push(x, y, z); S.n.push(nx / l, ny / l, nz / l); S.c.push(c[0], c[1], c[2]); S.w.push(sw, pt, lf);
  return S.p.length / 3 - 1;
}
function tri(S, a, b, c) { S.i.push(a, b, c); }
/** Append a three.js geometry (non-indexed or indexed) with a per-vertex colour and sway (x, y, z) → [c, sw, pt, lf]. */
function addGeo(S, g, f) {
  const P = g.attributes.position, N = g.attributes.normal || (g.computeVertexNormals(), g.attributes.normal);
  const base = S.p.length / 3;
  for (let i = 0; i < P.count; i++) {
    const x = P.getX(i), y = P.getY(i), z = P.getZ(i), r = f(x, y, z, i);
    vtx(S, x, y, z, N.getX(i), N.getY(i), N.getZ(i), r[0], r[1], r[2], r[3]);
  }
  if (g.index) for (let i = 0; i < g.index.count; i++) S.i.push(base + g.index.getX(i));
  else for (let i = 0; i < P.count; i++) S.i.push(base + i);
  g.dispose();
}
const hash = (i) => { const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };

/** The kit's prototypes in the look's colours (linear, × its albedo). */
function prototypes(look, K) {
  const A = num(look.albedo, 1.5);
  const C = (hex, a = A) => lushColor(look, hex, a);
  const dark = C(look.leafDark), mid = C(look.leaf), hi = C(look.leafHi), m2 = C(look.moss2), mg = C(look.mossG), mgh = C(look.mossGHi);
  const bloom = (look.bloom || [0xf0e0d0]).map((h) => C(h, 1.1));
  const ink = mixArr(dark, [0.02, 0.02, 0.04], 0.55);
  const bark = mixArr(K.wood, K.rock, 0.35), barkMoss = mixArr(bark, mg, 0.6);
  const reedC = [mixArr(ink, scaleArr(lin(0x6a5a34), A), 0.5), mixArr(mid, scaleArr(lin(0x8a7a48), A), 0.45), mixArr(hi, scaleArr(lin(0xa89a68), A), 0.45)];
  const sedgeC = [mixArr(ink, mid, 0.4), mixArr(mid, scaleArr(lin(0xb8b088), A), 0.4), scaleArr(lin(0xd8d0b0), A * 0.9)];
  const capC = K.cap || mid, capHi = K.capHi || hi;
  const P = {};
  // the moss cushion: a soft low dome, lit at its crown, inked at its foot (21 triangles)
  {
    const S = soup(), n = 7, top = vtx(S, 0, 0.42, 0, 0, 1, 0, scaleArr(mixArr(mg, mgh, 0.45), 0.8));   // (a moss crown, never a lime slab)
    const mid0 = [], out0 = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU, j = 0.85 + 0.3 * hash(i); mid0.push(vtx(S, Math.cos(a) * 0.62 * j, 0.32, Math.sin(a) * 0.62 * j, Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5, scaleArr(mixArr(mixArr(mg, m2, hash(i + 3)), dark, 0.3), 0.8))); }
    for (let i = 0; i < n; i++) { const a = ((i + 0.5) / n) * TAU, j = 0.9 + 0.25 * hash(i + 9); out0.push(vtx(S, Math.cos(a) * j, -0.06, Math.sin(a) * j, Math.cos(a), 0.4, Math.sin(a), mixArr(ink, mg, 0.45))); }
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; tri(S, top, mid0[j], mid0[i]); tri(S, mid0[i], mid0[j], out0[i]); tri(S, mid0[j], out0[j], out0[i]); }
    P.cushion = S;
  }
  // a fern: six fronds arching out and drooping (42 triangles); `up` the shuttlecock, fronds rising steeper
  const fern = (up, S = soup(), sc = 1, oy = 0, ccol = null) => {
    const nf = 6;
    for (let f = 0; f < nf; f++) {
      const a = (f / nf) * TAU + hash(f) * 0.5, ca = Math.cos(a), sa = Math.sin(a), len = (0.75 + 0.35 * hash(f + 4)) * sc;
      const lift = up ? 0.95 : 0.55;
      const st = [];
      for (let k = 0; k <= 3; k++) {
        const t = k / 3, r = len * t, y = oy + len * (lift * Math.sin(t * 2.2) - (up ? 0.1 : 0.32) * t * t);
        const w = 0.13 * sc * Math.pow(1 - t, 0.6) + 0.01;
        const col = ccol || (t < 0.34 ? mixArr(dark, mid, t * 2) : t < 0.7 ? mid : mixArr(mid, hi, (t - 0.6) * 2.2));
        const sw = 0.05 * t * t * sc;
        if (k === 3) st.push([vtx(S, ca * r, y, sa * r, 0, 1, 0, col, sw, 0, 1)]);
        else st.push([vtx(S, ca * r - sa * w, y, sa * r + ca * w, -sa * 0.4, 1, ca * 0.4, col, sw, 0, 1), vtx(S, ca * r + sa * w, y, sa * r - ca * w, sa * 0.4, 1, -ca * 0.4, col, sw, 0, 1)]);
      }
      for (let k = 0; k < 2; k++) { const [a0, b0] = st[k], [a1, b1] = st[k + 1]; tri(S, a0, a1, b0); tri(S, b0, a1, b1); }
      tri(S, st[2][0], st[3][0], st[2][1]);
    }
    return S;
  };
  P.fern = fern(false); P.fernUp = fern(true);
  // a tree-fern: a shaggy trunk 2.2 m and a big crown of fronds
  {
    const S = soup();
    const g = new THREE.CylinderGeometry(0.11, 0.17, 2.3, 5, 2, true); g.translate(0, 1.1, 0);
    addGeo(S, g, (x, y) => [mixArr(barkMoss, bark, clamp01(y / 2.3)), 0.01 * y, 0, 0]);
    fern(false, S, 1.9, 2.25);
    P.tfern = S;
  }
  // reeds: five tapered blades bending at the middle (15) / pale sedge with cream seed heads (21)
  const blades = (cols, heads) => {
    const S = soup();
    for (let b = 0; b < 5; b++) {
      const a = hash(b + 1) * TAU, r0 = 0.06 + 0.12 * hash(b + 7), bx = Math.cos(a) * r0, bz = Math.sin(a) * r0;
      const h = (heads ? 0.9 : 1.6) * (0.75 + 0.4 * hash(b + 2)), dx = Math.cos(a) * 0.14 * h, dz = Math.sin(a) * 0.14 * h, w = 0.035;
      const px = -Math.sin(a) * w, pz = Math.cos(a) * w;
      const v0 = vtx(S, bx - px, 0, bz - pz, Math.cos(a), 0.3, Math.sin(a), cols[0], 0, 0, 0.6);
      const v1 = vtx(S, bx + px, 0, bz + pz, Math.cos(a), 0.3, Math.sin(a), cols[0], 0, 0, 0.6);
      const v2 = vtx(S, bx + dx * 0.4 - px * 0.7, h * 0.55, bz + dz * 0.4 - pz * 0.7, Math.cos(a), 0.3, Math.sin(a), cols[1], 0.04, 0.6, 1);
      const v3 = vtx(S, bx + dx * 0.4 + px * 0.7, h * 0.55, bz + dz * 0.4 + pz * 0.7, Math.cos(a), 0.3, Math.sin(a), cols[1], 0.04, 0.6, 1);
      const v4 = vtx(S, bx + dx, h, bz + dz, Math.cos(a), 0.5, Math.sin(a), cols[2], 0.12, 1.6, 1);
      tri(S, v0, v2, v1); tri(S, v1, v2, v3); tri(S, v2, v4, v3);
      if (heads && b % 2 === 0) {
        const hy = h * 0.92, hx = bx + dx * 0.95, hz = bz + dz * 0.95, hc = scaleArr(bloom[0], 0.85);
        const a1 = vtx(S, hx, hy - 0.09, hz, 1, 0, 0, hc, 0.1, 1.5, 0.3), a2 = vtx(S, hx + 0.03, hy, hz, 1, 0, 0, hc, 0.11, 1.5, 0.3), a3 = vtx(S, hx, hy + 0.1, hz, 0, 1, 0, hc, 0.12, 1.6, 0.3), a4 = vtx(S, hx - 0.03, hy, hz, -1, 0, 0, hc, 0.11, 1.5, 0.3);
        tri(S, a1, a2, a3); tri(S, a1, a3, a4);
      }
    }
    return S;
  };
  P.reed = blades(reedC, false); P.sedge = blades(sedgeC, true);
  // a lily pad: a flat fan with its notch (8 triangles); a fallen cap-leaf: longer, ochre-olive, its rim curled up
  const pad = (cap) => {
    // (LAKE 2, the art pass: the cap-leaf a matte, soft dull ochre-olive, a step darker than the lily pads round it)
    const S = soup(), n = 9, c0 = cap ? scaleArr(mixArr(dark, capC, 0.35), 0.72) : mixArr(mid, hi, 0.25), c1 = cap ? scaleArr(mixArr(ink, capC, 0.3), 0.8) : mixArr(dark, mid, 0.5);
    const ce = vtx(S, 0, cap ? 0.02 : 0.012, 0, 0, 1, 0, c0, 0, 0, 0.5);
    const rim = [];
    for (let i = 0; i < n; i++) { const a = 0.35 + (i / (n - 1)) * (TAU - 0.7); rim.push(vtx(S, Math.cos(a) * (cap ? 1.4 : 1), cap ? 0.05 + 0.04 * Math.abs(Math.sin(a)) : 0.02, Math.sin(a) * (cap ? 0.7 : 1), 0, 1, 0, c1, 0, 0, 0.5)); }
    for (let i = 0; i + 1 < n; i++) tri(S, ce, rim[i + 1], rim[i]);
    return S;
  };
  P.pad = pad(false); P.capleaf = pad(true);
  // a hanging strand from its top (y 0) down 1 m (× its instance's sy): a ribbon swaying as a pendulum, parting round the raft (12)
  const strand = (cols) => {
    const S = soup(), n = 6, st = [];
    for (let k = 0; k <= n; k++) {
      const t = k / n, y = -t, w = 0.09 * (1 - t * 0.6), ox = 0.04 * Math.sin(t * 5);
      const col = t < 0.4 ? mixArr(cols[0], cols[1], t / 0.4) : mixArr(cols[1], cols[2], (t - 0.4) / 0.6);
      st.push([vtx(S, ox - w, y, 0, 0, 0, 1, col, 0.16 * Math.pow(t, 1.3), 2.2 * t, 1), vtx(S, ox + w, y, 0.02, 0, 0, 1, col, 0.16 * Math.pow(t, 1.3), 2.2 * t, 1)]);
    }
    for (let k = 0; k < n; k++) { const [a0, b0] = st[k], [a1, b1] = st[k + 1]; tri(S, a0, a1, b0); tri(S, b0, a1, b1); }
    return S;
  };
  P.strand = strand([dark, m2, mixArr(hi, mgh, 0.5)]);
  P.gill = strand([scaleArr(capC, 0.8), mixArr(capC, capHi, 0.6), scaleArr(capHi, 1.15)]);
  // >>> LAKE 2, the art pass (the user's "blocky shrubs and crowns"): every leafy mass is soft: a lobed mound (a low sphere pushed out into
  // lobes by a few bumps) with smooth normals from its heart, so the toon lights it as one rounded thing, never as facets; leaf cards
  // round its rim and crown break its silhouette into leaves, and they and the mound's lit side carry the light through the leaves
  // (the backlit term). Colours: ink at the foot, the dark key under it, the mid round its sides, the hi on its crown, a leafy dapple.
  const leafMass = (S, cx, cy, cz, r, seed, { squash = 0.82, cards = 10, top = 1, sway = 0.04, bloomK = 0, dim = 1, seg = [8, 6] } = {}) => {
    const g = new THREE.SphereGeometry(r, seg[0], seg[1]);
    const P0 = g.attributes.position, bumps = [];
    for (let k = 0; k < 5; k++) { const u = hash(seed + k * 7.1) * 2 - 1, a = hash(seed + k * 3.3) * TAU, q = Math.sqrt(1 - u * u); bumps.push([q * Math.cos(a), u * 0.6 + 0.25, q * Math.sin(a), 0.1 + 0.16 * hash(seed + k)]); }
    const lobe = (x, y, z) => { const l = Math.hypot(x, y, z) || 1; let k = 0; for (const [bx, by, bz, ba] of bumps) k += ba * Math.pow(Math.max(0, (x * bx + y * by + z * bz) / l), 3); return 1 + k; };
    for (let i = 0; i < P0.count; i++) { const x = P0.getX(i), y = P0.getY(i), z = P0.getZ(i), f = lobe(x, y, z); P0.setXYZ(i, x * f, y * f * squash, z * f); }
    g.translate(cx, cy, cz);
    // (smooth normals from the mass's heart, a little above its centre: the crown faces the sky, the foot the ground)
    const N0 = g.attributes.normal;
    for (let i = 0; i < P0.count; i++) { const x = P0.getX(i) - cx, y = P0.getY(i) - cy + r * 0.25, z = P0.getZ(i) - cz, l = Math.hypot(x, y, z) || 1; N0.setXYZ(i, x / l, y / l, z / l); }
    const yLo = cy - r * squash, span = 2 * r * squash;
    addGeo(S, g, (x, y, z, i) => {
      const t = clamp01((y - yLo) / span), j = hash(i * 1.37 + seed);
      let c = t < 0.3 ? mixArr(ink, dark, t / 0.3) : t < 0.7 ? mixArr(dark, mid, (t - 0.3) / 0.4) : mixArr(mid, hi, ((t - 0.7) / 0.3) * top);
      c = scaleArr(c, (0.9 + 0.2 * j) * dim);
      if (bloomK > 0 && t > 0.45 && j > 1 - bloomK) c = bloom[j > 1 - bloomK * 0.4 ? 1 : 0];
      return [c, sway * t, 0, 0.6 + 0.4 * t];
    });
    // the leaf cards: small pointed leaves on the mound's surface, tilted out, a little lighter toward their tips
    for (let k = 0; k < cards; k++) {
      const u = hash(seed * 3.1 + k * 1.91) * 1.5 - 0.45, a = hash(seed * 5.7 + k * 2.37) * TAU, q = Math.sqrt(Math.max(0, 1 - u * u));
      const dx = q * Math.cos(a), dy = u, dz = q * Math.sin(a), f = lobe(dx, dy, dz);
      const px = cx + dx * r * f * 0.97, py = cy + dy * r * f * squash * 0.97, pz = cz + dz * r * f * 0.97;
      // (a leaf: its spine out from the mound and a little up, its blade across it)
      let ox = dx, oy = dy * 0.5 + 0.35, oz = dz; const ol = Math.hypot(ox, oy, oz) || 1; ox /= ol; oy /= ol; oz /= ol;
      let wx = -dz, wz = dx; const wl = Math.hypot(wx, wz) || 1; wx /= wl; wz /= wl;
      const L = r * (0.32 + 0.18 * hash(k + seed)), W = L * 0.42, t = clamp01((py - yLo) / span);
      const base = t < 0.5 ? mixArr(dark, mid, t * 2) : mixArr(mid, hi, (t - 0.5) * 2 * top), tip = mixArr(base, hi, 0.35);
      const nx = dx, ny = dy + 0.25, nz = dz, sw = sway * (0.6 + t) + 0.02;
      const v0 = vtx(S, px - ox * L * 0.15, py - oy * L * 0.15, pz - oz * L * 0.15, nx, ny, nz, scaleArr(base, 0.9 * dim), sw * 0.5, 0, 1);
      const v1 = vtx(S, px + ox * L * 0.45 + wx * W, py + oy * L * 0.45, pz + oz * L * 0.45 + wz * W, nx, ny, nz, scaleArr(base, dim), sw, 0, 1);
      const v2 = vtx(S, px + ox * L, py + oy * L, pz + oz * L, nx, ny, nz, scaleArr(tip, dim), sw * 1.3, 0, 1);
      const v3 = vtx(S, px + ox * L * 0.45 - wx * W, py + oy * L * 0.45, pz + oz * L * 0.45 - wz * W, nx, ny, nz, scaleArr(base, dim), sw, 0, 1);
      tri(S, v0, v1, v2); tri(S, v0, v2, v3);
    }
  };
  // a shrub: three soft lobed mounds, cream blossom on a few leaves (about 180)
  {
    const S = soup();
    [[0, 0.55, 0, 0.62], [0.45, 0.42, 0.22, 0.46], [-0.38, 0.44, -0.26, 0.5]].forEach(([cx, cy, cz, r], m) => leafMass(S, cx, cy, cz, r, 11 + m * 17, { cards: 6, bloomK: 0.07, seg: [6, 5] }));
    P.bush = S;
  }
  // a broadleaf bank tree, upright (the plan leans it): a trunk with two limbs and a crown of soft lobed masses (~530)
  {
    const S = soup();
    const tr = new THREE.CylinderGeometry(0.14, 0.3, 6.2, 6, 3, true); tr.translate(0, 3.0, 0);
    addGeo(S, tr, (x, y) => [mixArr(barkMoss, bark, clamp01((y - 0.4) / 2)), 0.004 * y, 0, 0]);
    for (const [ax, az] of [[0.9, 0.3], [-0.8, -0.4]]) {
      const lb = new THREE.CylinderGeometry(0.05, 0.11, 2.0, 5, 1, true); lb.rotateZ(-Math.atan2(ax, 1.4)); lb.rotateY(Math.atan2(az, ax) * 0.5); lb.translate(ax * 0.55, 5.0, az * 0.55);
      addGeo(S, lb, (x, y) => [bark, 0.01 * y, 0, 0]);
    }
    const masses = [[0, 6.5, 0, 1.75], [1.35, 6.0, 0.5, 1.25], [-1.25, 6.05, -0.4, 1.3], [0.35, 7.35, -0.55, 1.15], [-0.6, 5.4, 1.05, 1.05], [0.9, 5.2, -1.05, 1.0], [-1.45, 6.85, 0.6, 0.9]];
    masses.forEach(([cx, cy, cz, r], mi) => leafMass(S, cx, cy, cz, r, 101 + mi * 13, { cards: 7, squash: 0.76, sway: 0.05, seg: [7, 5] }));
    P.tree = S;
  }
  // a far crown (the forest's edge behind the banks): two soft dark masses (~90)
  {
    const S = soup();
    [[0, 0.9, 0, 1], [0.62, 0.58, 0.36, 0.72]].forEach(([cx, cy, cz, r], m) => leafMass(S, cx, cy, cz, r, 201 + m * 31, { cards: 4, squash: 0.85, sway: 0.02, top: 0.5, dim: 0.85, seg: [6, 4] }));
    P.crown = S;
  }
  // <<< LAKE 2, the art pass
  return P;
}
/** Which material a kind is drawn with: 'hi' (mirrored, casting) or 'lo'. */
const MAT_OF = { cushion: 'lo', fern: 'lo', fernUp: 'lo', pad: 'lo', capleaf: 'lo', tfern: 'hi', reed: 'hi', sedge: 'hi', strand: 'hi', gill: 'hi', bush: 'hi', tree: 'hi', crown: 'hi' };

// ------------------------------------------------------------------ the shaders' additions (on the kit's ink-toon materials)
const SWAY_VERT = /* glsl */`
attribute vec3 aSw;       // x: sway (m) at this vertex, y: how far it parts round the raft (m), z: leaf (the backlit term)
uniform float gwFT; uniform vec3 gwFR; uniform vec2 gwFWind;
varying float vGwLeaf;
`;
const SWAY_BODY = /* glsl */`
{
  vGwLeaf = aSw.z;
  float ph = transformed.x * 0.31 + transformed.z * 0.23;
  transformed.xz += (vec2(sin(gwFT * 1.3 + ph), cos(gwFT * 1.04 + ph * 1.3)) + gwFWind) * aSw.x;
  if (aSw.y > 0.0 && gwFR.z > 0.5) {
    vec2 rd = transformed.xz - gwFR.xy; float rr = length(rd);
    float k = aSw.y * (1.0 - smoothstep(0.4, 3.0, rr));
    transformed.xz += rd / max(rr, 0.05) * k;
    transformed.y += k * 0.18;
  }
}`;
const TRANS_FRAG = /* glsl */`
outgoingLight += diffuseColor.rgb * gwFloraFloor;
#if NUM_DIR_LIGHTS > 0
{
  vec3 gwFV = normalize( vViewPosition );
  float gwBack = max( 0.0, -dot( gwFV, directionalLights[ 0 ].direction ) );
  float gwEdge = 1.0 - abs( dot( normal, gwFV ) );
  outgoingLight += gwLeafHi * directionalLights[ 0 ].color * ( 0.3 * gwTransK * vGwLeaf ) * ( 0.25 + 0.75 * gwBack ) * ( 0.35 + 0.65 * gwEdge );
}
#endif
#include <opaque_fragment>`;

/** The kit's ink-toon material with the sway, the raft's parting and the leaves' translucency (one program per kind of use). */
function floraMaterial(look, U, rimC, name) {
  // (LAKE 2, the art pass: five tone steps, so a leafy mound turns softly rather than in three hard bands)
  const mat = inkToon({ color: 0xffffff, vertexColors: true, side: THREE.DoubleSide, rim: 0.2, rimColor: rimC, rimPower: 0.6, steps: 5, gloss: 0.02, shine: 24, floor: 1 }, { fogScale: 0.9, fogMax: 1 });
  const base = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => {
    base?.call(mat, sh, r);
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>${SWAY_VERT}`).replace('#include <begin_vertex>', `#include <begin_vertex>${SWAY_BODY}`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 gwLeafHi; uniform float gwTransK; uniform float gwFloraFloor; varying float vGwLeaf;')
      .replace('#include <opaque_fragment>', TRANS_FRAG);
  };
  const key = mat.customProgramCacheKey?.() || 'gwInkToonFog';
  mat.customProgramCacheKey = () => `${key}:flora:${name}`;
  return mat;
}

// the night emitters: flowers that open from dusk (unlit, a faint glow at night) and fireflies (points, no light)
const FLOWER_VS = /* glsl */`
#include <common>
#include <fog_pars_vertex>
attribute vec3 aRoot; attribute vec3 aCol;
uniform float uOpen;
varying vec3 vCol;
void main() {
  vCol = aCol;
  vec3 p = aRoot + (position - aRoot) * mix(0.35, 1.0, uOpen);
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;
const FLOWER_FS = /* glsl */`
#include <common>
#include <fog_pars_fragment>
uniform float uLit;
varying vec3 vCol;
void main() {
  gl_FragColor = vec4(vCol * uLit, 1.0);
  #include <fog_fragment>
}`;
const FIRE_VS = /* glsl */`
#include <common>
#include <fog_pars_vertex>
attribute float aSeed;
uniform float uTime, uViewH, uMaxPx, uK; uniform vec3 uRaft;
varying float vA;
void main() {
  float s = aSeed * 61.0;
  vec3 p = position + vec3(sin(uTime * 0.37 + s) * 0.55, sin(uTime * 0.53 + s * 1.7) * 0.25, cos(uTime * 0.29 + s * 0.9) * 0.55);
  float tw = 0.5 + 0.5 * sin(uTime * (1.1 + fract(s) * 1.4) + s * 3.0);
  float near = smoothstep(${FLORA.fireflyNear.toFixed(1)}, ${(FLORA.fireflyNear + 2).toFixed(1)}, distance(p.xz, uRaft.xy) + (1.0 - uRaft.z) * 99.0);
  vA = uK * tw * tw * near;
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = clamp(0.09 * uViewH / max(0.5, -mvPosition.z), 1.0, uMaxPx) * step(0.01, vA);
  #include <fog_vertex>
}`;
const FIRE_FS = /* glsl */`
#include <common>
#include <fog_pars_fragment>
uniform vec3 uColor;
varying float vA;
void main() {
  vec2 c = gl_PointCoord - 0.5; float d = dot(c, c) * 4.0;
  float a = vA * (1.0 - smoothstep(0.15, 1.0, d));
  if (a < 0.01) discard;
  gl_FragColor = vec4(uColor * a, a);
  #include <fog_fragment>
}`;

// ------------------------------------------------------------------ the build
/**
 * Stamp the plan into its meshes. o: {tier, low, K (world-art's kit, linear), rimC, plan (floraPlan's)}. Every geometry and material is
 * the caller's to dispose through the returned dispose().
 */
export function buildFlora(L, look, { tier = 'high', low = false, K = {}, rimC = 0xd4d0f2, plan = null } = {}) {
  const group = new THREE.Group();
  group.name = 'flora';
  const geos = [], mats = [];
  const t0 = performance.now();
  const PL = plan || { items: [], flowers: [], fireflies: [] };
  const P = prototypes(look, K);
  const U = { gwFT: { value: 0 }, gwFR: { value: new THREE.Vector3(0, 0, 0) }, gwFWind: { value: new THREE.Vector2(0.3, 0.1) },
    gwLeafHi: { value: new THREE.Color().setRGB(...lushColor(look, look.leafHi, 1)) }, gwTransK: { value: 1 }, gwFloraFloor: { value: num(look.floor, 0.2) } };
  const matHi = floraMaterial(look, U, rimC, 'hi'), matLo = low ? matHi : floraMaterial(look, U, rimC, 'lo');
  mats.push(matHi); if (matLo !== matHi) mats.push(matLo);
  // the cells (3 × 2 over the basin and its margin)
  const O = L.outline, bb = O ? O.bbox : { x0: -60, x1: 60, z0: -60, z1: 60 }, M0 = FLORA.margin;
  const gx0 = bb.x0 - M0, gz0 = bb.z0 - M0, cw = (bb.x1 - bb.x0 + 2 * M0) / FLORA.cells[0], ch = (bb.z1 - bb.z0 + 2 * M0) / FLORA.cells[1];
  const cellOf = (x, z) => Math.min(FLORA.cells[0] - 1, Math.max(0, Math.floor((x - gx0) / cw))) + FLORA.cells[0] * Math.min(FLORA.cells[1] - 1, Math.max(0, Math.floor((z - gz0) / ch)));
  const bins = new Map();
  for (const it of PL.items) {
    const S = P[it.k];
    if (!S) continue;
    const key = `${low ? 'hi' : MAT_OF[it.k] || 'lo'}:${cellOf(it.x, it.z)}`;
    let b = bins.get(key);
    if (!b) { b = { mat: low ? 'hi' : MAT_OF[it.k] || 'lo', cell: cellOf(it.x, it.z), list: [], nv: 0, ni: 0 }; bins.set(key, b); }
    b.list.push(it); b.nv += S.p.length / 3; b.ni += S.i.length;
  }
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e4 = new THREE.Euler(), s3 = new THREE.Vector3(), p3 = new THREE.Vector3(), ax = new THREE.Vector3(), qL = new THREE.Quaternion();
  const meshes = [];
  let tris = 0;
  for (const b of [...bins.values()].sort((a, c) => a.cell - c.cell || (a.mat < c.mat ? -1 : 1))) {
    const pos = new Float32Array(b.nv * 3), nor = new Float32Array(b.nv * 3), col = new Float32Array(b.nv * 3), sw = new Float32Array(b.nv * 3);
    const idx = b.nv > 65535 ? new Uint32Array(b.ni) : new Uint16Array(b.ni);
    let v = 0, ii = 0;
    for (const it of b.list) {
      const S = P[it.k];
      // the instance: scale (s across, s·sy up), its turn, then its lean toward la (the top leaning out over the water)
      e4.set(0, it.ry, 0, 'YXZ'); q4.setFromEuler(e4);
      if (it.lean) { ax.set(Math.sin(it.la), 0, -Math.cos(it.la)); qL.setFromAxisAngle(ax, it.lean); q4.premultiply(qL); }
      s3.set(it.s, it.s * it.sy, it.s);
      m4.compose(p3.set(it.x, it.y, it.z), q4, s3);
      const e = m4.elements, vv = num(it.v) * 0.09, tk = 1 + vv, sk = it.s * Math.max(0.6, it.sy);
      for (let k = 0, n = S.p.length / 3; k < n; k++) {
        const x = S.p[k * 3], y = S.p[k * 3 + 1], z = S.p[k * 3 + 2];
        const o = (v + k) * 3;
        pos[o] = e[0] * x + e[4] * y + e[8] * z + e[12]; pos[o + 1] = e[1] * x + e[5] * y + e[9] * z + e[13]; pos[o + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
        const nx = S.n[k * 3], ny = S.n[k * 3 + 1], nz = S.n[k * 3 + 2];
        let a = e[0] * nx + e[4] * ny + e[8] * nz, bq = e[1] * nx + e[5] * ny + e[9] * nz, c = e[2] * nx + e[6] * ny + e[10] * nz;
        const l = Math.hypot(a, bq, c) || 1; nor[o] = a / l; nor[o + 1] = bq / l; nor[o + 2] = c / l;
        col[o] = S.c[k * 3] * tk; col[o + 1] = S.c[k * 3 + 1] * (tk + vv * 0.4); col[o + 2] = S.c[k * 3 + 2] * tk;
        sw[o] = S.w[k * 3] * sk; sw[o + 1] = S.w[k * 3 + 1]; sw[o + 2] = S.w[k * 3 + 2];
      }
      for (let k = 0; k < S.i.length; k++) idx[ii + k] = S.i[k] + v;
      v += S.p.length / 3; ii += S.i.length;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aSw', new THREE.BufferAttribute(sw, 3));
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    g.computeBoundingSphere();
    // (the sway and the parting move a vertex a few metres at most: the cell's sphere grows to keep it culled right)
    g.boundingSphere.radius += 2.5;
    geos.push(g);
    const mesh = new THREE.Mesh(g, b.mat === 'hi' ? matHi : matLo);
    mesh.name = `flora:${b.mat}:${b.cell}`;
    setupSurface(mesh, b.mat === 'hi' && !low ? { cast: true, reflect: true } : { cast: false, reflect: false });
    group.add(mesh); meshes.push(mesh);
    tris += b.ni / 3;
  }
  // ---- the flowers (they open from dusk; unlit, faintly glowing at night)
  let flowers = null;
  if (PL.flowers.length) {
    const cols = (look.bloom || [0xf0e0d0]).map((h) => lin(h));
    const n = PL.flowers.length, per = 7 * 3;   // (a cup of six petals round its heart: 6 triangles, 7 vertices)
    const pos = new Float32Array(n * per), root = new Float32Array(n * per), cc = new Float32Array(n * per), idx = new Uint16Array(n * 18);
    PL.flowers.forEach((f, i) => {
      const c = cols[f.c % cols.length], s = 0.13 * f.s;
      const o = i * 7;
      const put = (k, x, y, z, k2 = 1) => { pos.set([x, y, z], (o + k) * 3); root.set([f.x, f.y, f.z], (o + k) * 3); cc.set([c[0] * k2, c[1] * k2, c[2] * k2], (o + k) * 3); };
      put(0, f.x, f.y + 0.02, f.z, 0.7);
      for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU; put(k + 1, f.x + Math.cos(a) * s, f.y + 0.09 * f.s, f.z + Math.sin(a) * s, 1); }
      for (let k = 0; k < 6; k++) idx.set([o, o + 1 + k, o + 1 + ((k + 1) % 6)], i * 18 + k * 3);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aRoot', new THREE.BufferAttribute(root, 3)); g.setAttribute('aCol', new THREE.BufferAttribute(cc, 3));
    g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeBoundingSphere(); geos.push(g);
    const m = new THREE.ShaderMaterial({ uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uOpen: { value: 0 }, uLit: { value: 0.8 } }]), vertexShader: FLOWER_VS, fragmentShader: FLOWER_FS, fog: true, side: THREE.DoubleSide });
    mats.push(m);
    flowers = new THREE.Mesh(g, m); flowers.name = 'flora:flowers';
    group.add(flowers);
    tris += n * 6;
  }
  // ---- the fireflies (none on low)
  let fire = null;
  if (PL.fireflies.length && !low) {
    const n = PL.fireflies.length, pos = new Float32Array(n * 3), seed = new Float32Array(n);
    PL.fireflies.forEach((f, i) => { pos.set([f.x, f.y, f.z], i * 3); seed[i] = (Math.sin(i * 78.233) * 43758.5453) % 1; });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.computeBoundingSphere(); geos.push(g);
    const m = new THREE.ShaderMaterial({ uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uTime: { value: 0 }, uViewH: { value: 720 }, uMaxPx: { value: 4 }, uK: { value: 0 }, uRaft: { value: new THREE.Vector3(0, 0, 0) }, uColor: { value: new THREE.Color().setRGB(...lin(look.fireflies ?? 0xe0e49c)) } }]),
      vertexShader: FIRE_VS, fragmentShader: FIRE_FS, fog: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    mats.push(m);
    fire = new THREE.Points(g, m); fire.name = 'flora:fireflies'; fire.frustumCulled = false; fire.renderOrder = 4;
    group.add(fire);
  }
  const buildMs = Math.round(performance.now() - t0);
  const _v2 = new THREE.Vector2();
  function update(dt, t, focus, renderer) {
    U.gwFT.value = t;
    U.gwFWind.value.set(0.3 + 0.2 * Math.sin(t * 0.07), 0.1 + 0.15 * Math.cos(t * 0.05));
    if (focus && Number.isFinite(focus.x)) U.gwFR.value.set(focus.x, focus.z, 1);
    if (fire) {
      const u = fire.material.uniforms;
      u.uTime.value = t;
      if (renderer?.getDrawingBufferSize) { renderer.getDrawingBufferSize(_v2); u.uViewH.value = _v2.y || u.uViewH.value; }
      u.uMaxPx.value = Math.max(1.5, u.uViewH.value * 0.006);
      if (focus && Number.isFinite(focus.x)) u.uRaft.value.set(focus.x, focus.z, 1);
    }
  }
  /** env {night 0..1, warm 0..1}: the flowers open and glow from dusk, the fireflies wake (WATERS §3.2: from dusk k ≥ 0.5). */
  function applyMood(env) {
    const n = clamp01(num(env?.night, 0)), d = clamp01(num(env?.dusk, 0));   // (dusk: a water with its own lights, LAKE 2's art pass)
    U.gwTransK.value = (1 + (num(look.night?.trans, 1) - 1) * n) * num(env?.leafK, 1);
    U.gwFloraFloor.value = num(look.floor, 0.2) + (num(look.night?.floor, num(look.floor, 0.2)) - num(look.floor, 0.2)) * n;
    // (the flowers open at dusk and glow faintly at night; the fireflies wake late in the dusk)
    if (flowers) { flowers.material.uniforms.uOpen.value = Math.max(clamp01((n - 0.15) / 0.45), d); flowers.material.uniforms.uLit.value = 0.72 + 0.5 * n + 0.2 * d; }
    if (fire) fire.material.uniforms.uK.value = Math.max(clamp01((n - 0.32) / 0.38), clamp01(d * 1.4 - 0.4)) * 0.95;
  }
  return {
    group, meshes, update, applyMood, uniforms: U,
    stats: () => ({ meshes: meshes.length + (flowers ? 1 : 0) + (fire ? 1 : 0), cells: meshes.length, tris: Math.round(tris), items: PL.items.length, flowers: PL.flowers.length, fireflies: fire ? PL.fireflies.length : 0, buildMs, counts: PL.counts }),
    dispose() { group.parent?.remove(group); for (const g of geos) g.dispose(); for (const m of mats) m.dispose(); },
  };
}
