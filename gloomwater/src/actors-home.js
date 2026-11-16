// actors-home.js — the Slow Hearth, the Wick's old barge-house, moored at a water's mooring (docs/loop/SPEC.md §6.1, §6.5;
// docs/loop/M1.md §4 step 5a, §2.6, §2.14). Built only under the loop (actors.js creates it when data.LOOP_ENABLED is true).
//
// One broad, low hull of drowned-kingdom timber (about 12 × 3.6 m) with a cabin of small square windows, a stove pipe, a rail
// round the deck, a flat tarred roof, a patched awning over the stern deck (the chart table under it), the cabin door with its
// stone sill (arc I's four stones) and the lectern beside it. Three draw calls in the main pass, whatever is fitted:
//   timber   one merged toon mesh, vertex-coloured (hull, cabin, roof, awning, rails, iron, rope, stone, moss, the fittings)
//   ink      its outline (the big parts only: the hull, the cabin, the roof and the awning)
//   glow     one merged unlit mesh: the windows, the door's banked stove glow, the pipe's ember and the rail lanterns, each part's
//            brightness a uniform (gwK) so the evening can turn them up without a second material
// The mirror takes the timber and the glow (2), the key light's shadow the timber (1). There is no PointLight: the windows are
// emissive only, so the Wick's candle stays the one warm light on the water; the water's own light list gets one warm streak
// (`waterLight`) under the windows, never a ring or a disc.
//
// The upgrades are variants of the same three meshes (setVariants rebuilds the merged geometry when what is owned changes):
// meta.loop.home (baitBed: the roof's moss planters; lights: the rail lanterns; wall: the gallery's candles warm the doorway),
// meta.loop.looks (hooks for the barge's own looks after M1), the rod on the rack (tackle.rod), and the sill's stones
// (meta.loop.barge.towed inks a water's stone; a legend landed there gilds it). Step 5b fills the art these hooks name (the
// cabin's gallery, the Matriarch's print on the eave, the life aboard); nothing it adds needs a new material.
//
// Local frame: the bow at −z, the stern at +z (the raft ties up there), +x the starboard side, y up from the waterline. The
// object's rotation.y is the mooring's yaw (yaw 0: the bow faces −Z, the heading convention of the raft and the docks).
import * as THREE from 'three';
import { toonMaterial, addOutline } from './toon.js';
import { TAU, xf, paint, mergeGeos, tube, bezierPts, smoothNormals } from './models-kit.js';
import { BARGE_LOCAL, TARGET_BOXES } from './home-targets.js';

const clamp = THREE.MathUtils.clamp, damp = THREE.MathUtils.damp;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// ---- the hull's lines (m)
export const HULL = { L: 12, B: 3.6, deckY: BARGE_LOCAL.deckY, cabin: { z0: -3.5, z1: BARGE_LOCAL.cabinAft, w: 1.3, top: 2.18 } };
/** Half-beam at z (bow −6 … stern +6). */
function halfBeam(z) {
  if (z < 0) { const t = clamp((-z - 2.8) / 3.2, 0, 1); return 1.8 * (1 - 0.52 * Math.pow(t, 2.1)); }
  const t = clamp((z - 3.4) / 2.6, 0, 1); return 1.8 * (1 - 0.2 * t * t);
}
/** The gunwale's height (the sheer rises toward both ends, more at the bow). */
function sheer(z) {
  if (z < 0) { const t = clamp((-z - 1.5) / 4.5, 0, 1); return 0.66 + 0.36 * t * t; }
  const t = clamp((z - 1.5) / 4.5, 0, 1); return 0.66 + 0.18 * t * t;
}
/** The bottom (the swim: the hull's floor rises to the waterline at the bow). */
function bottom(z) {
  if (z < 0) { const t = clamp((-z - 3.2) / 2.8, 0, 1); return -0.44 + 0.42 * Math.pow(t, 1.5); }
  const t = clamp((z - 3.8) / 2.2, 0, 1); return -0.44 + 0.2 * t * t;
}

// ---- colours (sRGB hex, lifted like the raft's timbers: the toon light gives back about half)
const WOOD = 2.0;
const lit = (hex, k = WOOD) => new THREE.Color(hex).multiplyScalar(k);
const C = {
  strakeA: 0x33241f, strakeB: 0x3b2a25, tar: 0x1b1418, wale: 0x5e4a40, cap: 0x7d6858, moss: 0x3c4a2e, mossDeep: 0x2f3c26,
  deckA: 0x4c3a31, deckB: 0x45342c, seam: 0x2a1e1a,
  wallA: 0x5c4436, wallB: 0x523d31, post: 0x2c211d, roof: 0x3a3140, roofEdge: 0x7d7390, frame: 0x2a1f1c,
  canvasA: 0x7d7196, canvasB: 0x93707e, canvasC: 0xa39bac, seamC: 0x4b4360, pole: 0x3a2b24,
  iron: 0x2a2830, rope: 0x8c7552, stone: 0x8a8498, stoneBlank: 0xa7a1b6, stoneInk: 0x2a2436, stoneGilt: 0xc9a25a,
  page: 0xd9d0bf, cover: 0x5a2a31, chart: 0xd0c5ab, chartEdge: 0x8f826a, ink: 0x2a2530, shutter: 0x6b5a7a,
  door: 0x7a5262, doorB: 0x704a5a, fascia: 0x8d8399, pot: 0x6d4a3c, paint: 0x5d5476, paintDark: 0x4a4260,
};
// the glow's parts (gwK[part]): 0 the windows, 1 the door's stove glow, 2 the rail lanterns, 3 the pipe's ember
const GLOW = { window: 0, door: 1, lantern: 2, ember: 3 };
const GLOW_COL = { [GLOW.window]: [0xffb35e, 1.7], [GLOW.door]: [0xff8a3c, 2.0], [GLOW.lantern]: [0xffc47a, 2.1], [GLOW.ember]: [0xff7a30, 1.6] };

// ---------------------------------------------------------------- small geometry helpers (each returns a painted geometry)
function box(w, h, d, p, col, r = null) { return paint(xf(new THREE.BoxGeometry(w, h, d), { p, r }), col); }
function cyl(rt, rb, h, seg, p, col, r = null) { return paint(xf(new THREE.CylinderGeometry(rt, rb, h, seg), { p, r }), col); }
/** A glow quad facing +normal (a unit axis: 'x', '-x', 'z', '-z', 'y'), tagged with its part. */
function glowQuad(w, h, p, face, part) {
  const g = new THREE.PlaneGeometry(w, h);
  const r = face === 'x' ? [0, Math.PI / 2, 0] : face === '-x' ? [0, -Math.PI / 2, 0] : face === '-z' ? [0, Math.PI, 0] : face === 'y' ? [-Math.PI / 2, 0, 0] : [0, 0, 0];
  xf(g, { p, r });
  return tagGlow(g, part);
}
function tagGlow(g, part) {
  const [hex, k] = GLOW_COL[part];
  paint(g, new THREE.Color(hex).multiplyScalar(k));
  const n = g.attributes.position.count;
  g.setAttribute('gwPart', new THREE.BufferAttribute(new Float32Array(n).fill(part), 1));
  return g;
}

// ---------------------------------------------------------------- the hull
/** The outer skin, the inner bulwark, the deck, the stem and the transom: one geometry, faces wound outward. */
function hullGeo() {
  const N = 40, pos = [], col = [], cA = lit(C.strakeA), cB = lit(C.strakeB), cT = lit(C.tar), cM = lit(C.moss, 1.6), cMd = lit(C.mossDeep, 1.6);
  const cDA = lit(C.deckA), cDB = lit(C.deckB), cS = lit(C.seam), cIn = lit(C.wallB, 1.7);
  const tri = (a, b, c, ca, cb, cc, out) => {
    // wind so the face looks along `out` (a rough outward direction)
    const ab = new THREE.Vector3().subVectors(b, a), ac = new THREE.Vector3().subVectors(c, a), n = new THREE.Vector3().crossVectors(ab, ac);
    if (n.dot(out) < 0) { const t = b; b = c; c = t; const tc = cb; cb = cc; cc = tc; }
    for (const [v, k] of [[a, ca], [b, cb], [c, cc]]) { pos.push(v.x, v.y, v.z); col.push(k.r, k.g, k.b); }
  };
  const quad = (a, b, c, d, ka, kb, kc, kd, out) => { tri(a, b, c, ka, kb, kc, out); tri(a, c, d, ka, kc, kd, out); };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const zs = []; for (let i = 0; i <= N; i++) zs.push(-6 + 12 * (i / N));
  // a section's points from port to starboard (outer skin)
  const section = (z) => {
    const w = halfBeam(z), g = sheer(z), b = bottom(z);
    const ys = [g, g - 0.06, g - 0.19, g * 0.42, g * 0.2, 0.03, b * 0.55, b];
    const xs = [w, w * 0.999, w * 0.997, w * 0.992, w * 0.985, w * 0.965, w * 0.88, w * 0.66];
    const pts = [];
    for (let k = 0; k < ys.length; k++) pts.push(V(-xs[k], ys[k], z));
    for (let k = ys.length - 1; k >= 0; k--) pts.push(V(xs[k], ys[k], z));
    return pts;
  };
  // strakes: planks banded by height, a tarred band at the waterline, moss in patches just above it (the one living green)
  // (a face's colour from its middle: crisp bands) the old barge-road's paint, a faded lavender band under the gunwale
  const cP = lit(C.paint, 1.8), cPd = lit(C.paintDark, 1.8);
  const plankCol = (p) => {
    const y = p.y, n = Math.sin(p.z * 1.7 + p.x * 3.1) * Math.sin(p.z * 0.63 + 1.7), g = sheer(p.z);
    if (y < 0.06) return cT;
    if (y < 0.2 && n > 0.25) return n > 0.55 ? cMd : cM;
    if (y > g - 0.2 && y < g - 0.05) return Math.sin(p.z * 2.3 + 0.5) > 0.82 ? cPd : cP;
    return Math.floor((y + 0.04) / 0.13) % 2 ? cA : cB;
  };
  const S = zs.map(section);
  for (let i = 0; i < N; i++) {
    const A = S[i], B = S[i + 1];
    for (let k = 0; k + 1 < A.length; k++) {
      const a = A[k], b = A[k + 1], c = B[k + 1], d = B[k];
      const mid = new THREE.Vector3().add(a).add(b).add(c).add(d).multiplyScalar(0.25);
      const out = V(mid.x, mid.y + 0.25, 0);
      if (Math.abs(mid.x) < 0.3) out.set(0, -1, 0);
      const fc = plankCol(mid);
      quad(a, b, c, d, fc, fc, fc, fc, out);
    }
  }
  // the inner bulwark (gunwale down to the deck) and the deck
  const IN = 0.07, dy = HULL.deckY;
  for (let i = 0; i < N; i++) {
    const z0 = zs[i], z1 = zs[i + 1], w0 = halfBeam(z0) - IN, w1 = halfBeam(z1) - IN, g0 = sheer(z0), g1 = sheer(z1);
    for (const s of [-1, 1]) {
      quad(V(s * w0, g0, z0), V(s * w0, dy, z0), V(s * w1, dy, z1), V(s * w1, g1, z1), cIn, cIn, cIn, cIn, V(-s, 0, 0));
      // the gunwale's top (between the skin and the bulwark)
      const o0 = halfBeam(z0), o1 = halfBeam(z1);
      quad(V(s * w0, g0, z0), V(s * o0, g0, z0), V(s * o1, g1, z1), V(s * w1, g1, z1), cIn, cIn, cIn, cIn, V(0, 1, 0));
    }
    // deck planks run fore and aft (six across), a dark seam between
    const P = 8;
    for (let k = 0; k < P; k++) {
      const u0 = -1 + 2 * (k / P), u1 = -1 + 2 * ((k + 1) / P), kk = (k + Math.floor(z0 * 0.7)) % 2 ? cDA : cDB, sm = 0.025;
      quad(V(u0 * w0 + sm, dy, z0), V(u1 * w0 - sm, dy, z0), V(u1 * w1 - sm, dy, z1), V(u0 * w1 + sm, dy, z1), kk, kk, kk, kk, V(0, 1, 0));
      quad(V(u1 * w0 - sm, dy - 0.004, z0), V(u1 * w0 + sm, dy - 0.004, z0), V(u1 * w1 + sm, dy - 0.004, z1), V(u1 * w1 - sm, dy - 0.004, z1), cS, cS, cS, cS, V(0, 1, 0));
    }
  }
  // the stem (bow) and the transom (stern): fans across each end section
  for (const [zEnd, dir] of [[-6, -1], [6, 1]]) {
    const sec = section(zEnd), c = V(0, (sheer(zEnd) + bottom(zEnd)) * 0.5, zEnd);
    for (let k = 0; k + 1 < sec.length; k++) { const fc = plankCol(new THREE.Vector3().addVectors(sec[k], sec[k + 1]).multiplyScalar(0.5)); tri(c, sec[k], sec[k + 1], fc, fc, fc, V(0, 0, dir)); }
    // close the deck at the ends
    const w = halfBeam(zEnd) - IN, g = sheer(zEnd);
    quad(V(-w, g, zEnd), V(w, g, zEnd), V(w, dy, zEnd), V(-w, dy, zEnd), cIn, cIn, cIn, cIn, V(0, 0, -dir));
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  return geo;
}

/** Points along the gunwale on one side (s = ±1), inset `inset` m, from z0 to z1. */
function gunwalePts(s, z0, z1, n, inset = 0.04, lift = 0) {
  const out = [];
  for (let i = 0; i <= n; i++) { const z = z0 + (z1 - z0) * (i / n); out.push([s * (halfBeam(z) - inset), sheer(z) + lift, z]); }
  return out;
}

// ---------------------------------------------------------------- the barge's parts
/** The base: everything every Slow Hearth has. → {timber: [geo], ink: [geo] (outlined), glow: [geo], anchors} */
function baseParts() {
  const timber = [], ink = [], glow = [], A = {};
  const dy = HULL.deckY, CB = HULL.cabin;
  // ---- the hull and its fittings
  const hull = hullGeo(); timber.push(hull); ink.push(hull);
  // the wale (a rubbing strake) and the gunwale's worn cap, both sides
  for (const s of [-1, 1]) {
    timber.push(paint(tube(gunwalePts(s, -5.92, 5.92, 40, -0.035, -0.2).map((p) => new THREE.Vector3(...p)), 0.05, 5, { capStart: true }), lit(C.wale)));
    timber.push(paint(tube(gunwalePts(s, -5.95, 5.95, 40, 0.035, 0.015).map((p) => new THREE.Vector3(...p)), 0.045, 5, { capStart: true }), lit(C.cap)));
  }
  // the stem post rising over the bow, the rudder and its tiller at the stern
  timber.push(paint(tube(bezierPts([[0, -0.1, -6.02], [0, 0.6, -6.12], [0, 1.15, -6.0]], 8).map((p) => new THREE.Vector3(...p)), 0.08, 6, { capStart: true }), lit(C.post)));
  timber.push(box(0.08, 1.0, 0.7, [0, -0.05, 6.32], lit(C.post)));
  timber.push(paint(tube(bezierPts([[0, 0.45, 6.05], [0, 0.98, 6.0], [0, 1.08, 5.4], [0.05, 1.0, 4.9]], 10).map((p) => new THREE.Vector3(...p)), (u) => 0.05 - u * 0.015, 6, { capStart: true }), lit(C.post)));
  // ---- the cabin: planked walls, corner posts, a cambered tarred roof
  const cw = CB.w, z0 = CB.z0, z1 = CB.z1, top = CB.top, h = top - dy, len = z1 - z0;
  const walls = [];
  const boards = (n, w, hh, p, face) => {
    // vertical boards across a wall, alternating tones
    for (let i = 0; i < n; i++) {
      const u = -w / 2 + (i + 0.5) * (w / n), c = lit(i % 2 ? C.wallA : C.wallB);
      if (face === 'x') walls.push(box(0.06, hh, w / n - 0.012, [p[0], p[1], p[2] + u], c));
      else walls.push(box(w / n - 0.012, hh, 0.06, [p[0] + u, p[1], p[2]], c));
    }
  };
  const bh = h - 0.02, by = dy + bh / 2;
  boards(14, len, bh, [cw, by, (z0 + z1) / 2], 'x');
  boards(14, len, bh, [-cw, by, (z0 + z1) / 2], 'x');
  boards(7, cw * 2, bh, [0, by, z0], 'z');
  // the aft wall, with the doorway (x 0.06 … 0.86) left open
  const DW = BARGE_LOCAL.door.w, DX = BARGE_LOCAL.door.x, DH = BARGE_LOCAL.door.h;
  for (let i = 0; i < 7; i++) {
    const u0 = -cw + i * (2 * cw / 7), u1 = u0 + 2 * cw / 7, c = lit(i % 2 ? C.wallA : C.wallB);
    const a = Math.max(u0, DX - DW / 2), b = Math.min(u1, DX + DW / 2);
    if (b <= a) { walls.push(box(u1 - u0 - 0.012, bh, 0.06, [(u0 + u1) / 2, by, z1], c)); continue; }
    if (a > u0 + 0.01) walls.push(box(a - u0, bh, 0.06, [(u0 + a) / 2, by, z1], c));
    if (u1 > b + 0.01) walls.push(box(u1 - b, bh, 0.06, [(b + u1) / 2, by, z1], c));
    const over = bh - DH; walls.push(box(b - a, over, 0.06, [(a + b) / 2, dy + DH + over / 2, z1], c));
  }
  timber.push(...walls);
  // a dark interior box behind the doorway (the gap shows the stove's glow, not the sky)
  timber.push(box(DW - 0.02, DH - 0.02, 0.5, [DX, dy + DH / 2, z1 - 0.3], lit(C.seam, 1)));
  // corner posts and the roof
  for (const [x, z] of [[cw, z0], [-cw, z0], [cw, z1], [-cw, z1]]) timber.push(box(0.12, h + 0.04, 0.12, [x, dy + h / 2, z], lit(C.post)));
  {
    const rg = new THREE.BoxGeometry(cw * 2 + 0.34, 0.1, len + 0.34, 6, 1, 6), rp = rg.attributes.position;
    for (let i = 0; i < rp.count; i++) { const x = rp.getX(i); rp.setY(i, rp.getY(i) + 0.09 * (1 - (x / (cw + 0.17)) ** 2)); }
    rg.computeVertexNormals();
    const roof = paint(xf(rg, { p: [0, top + 0.05, (z0 + z1) / 2] }), (x, y, z) => (y < top + 0.04 ? lit(C.roofEdge) : lit(C.roof, 1.8)));
    timber.push(roof); ink.push(roof);
    const cabinShell = box(cw * 2 + 0.1, h, len + 0.1, [0, dy + h / 2, (z0 + z1) / 2], lit(C.wallB));
    ink.push(cabinShell);   // (outline only: the boards above are what is seen)
  }
  // the windows: three each side, one in the fore wall, one in the aft wall beside the door; a frame and a cross of mullions
  const WS = 0.44, WY = dy + 1.02;
  const frameAt = (p, face) => {
    const k = lit(C.frame), t = 0.05, o = 0.035;
    if (face === 'x' || face === '-x') {
      const sx = face === 'x' ? 1 : -1, x = p[0] + sx * o;
      timber.push(box(t, t, WS + t, [x, p[1] + WS / 2, p[2]], k), box(t, t, WS + t, [x, p[1] - WS / 2, p[2]], k));
      timber.push(box(t, WS, t, [x, p[1], p[2] + WS / 2], k), box(t, WS, t, [x, p[1], p[2] - WS / 2], k));
      timber.push(box(0.03, WS, 0.03, [x + sx * 0.005, p[1], p[2]], k), box(0.03, 0.03, WS, [x + sx * 0.005, p[1], p[2]], k));
      timber.push(box(0.07, 0.05, WS + 0.12, [p[0] + sx * 0.05, p[1] - WS / 2 - 0.05, p[2]], lit(C.cap)));   // the sill
    } else {
      const sz = face === 'z' ? 1 : -1, z = p[2] + sz * o;
      timber.push(box(WS + t, t, t, [p[0], p[1] + WS / 2, z], k), box(WS + t, t, t, [p[0], p[1] - WS / 2, z], k));
      timber.push(box(t, WS, t, [p[0] + WS / 2, p[1], z], k), box(t, WS, t, [p[0] - WS / 2, p[1], z], k));
      timber.push(box(0.03, WS, 0.03, [p[0], p[1], z + sz * 0.005], k), box(WS, 0.03, 0.03, [p[0], p[1], z + sz * 0.005], k));
      timber.push(box(WS + 0.12, 0.05, 0.07, [p[0], p[1] - WS / 2 - 0.05, p[2] + sz * 0.05], lit(C.cap)));
    }
  };
  A.windows = [];
  for (const s of [-1, 1]) for (const z of [-2.55, -0.85, 0.95]) {
    const p = [s * (cw + 0.035), WY, z];
    glow.push(glowQuad(WS, WS, [s * (cw + 0.034), WY, z], s > 0 ? 'x' : '-x', GLOW.window));
    frameAt(p, s > 0 ? 'x' : '-x');
    A.windows.push(p);
  }
  glow.push(glowQuad(WS, WS, [0, WY, z0 - 0.034], '-z', GLOW.window)); frameAt([0, WY, z0 - 0.035], '-z');
  glow.push(glowQuad(WS, WS, [0.78, WY, z1 + 0.034], 'z', GLOW.window)); frameAt([0.78, WY, z1 + 0.035], 'z');
  // one weathered shutter hung open beside a port window (the barge has been lived in)
  timber.push(paint(xf(new THREE.BoxGeometry(0.04, WS + 0.04, 0.26), { p: [-cw - 0.16, WY, 0.95 + WS / 2 + 0.12], r: [0, 0.5, 0] }), lit(C.shutter)));
  // ---- the door, ajar, its frame, the banked glow in the gap, and the sill with arc I's four stones
  const k = lit(C.frame);
  timber.push(box(0.09, DH + 0.06, 0.1, [DX - DW / 2 - 0.04, dy + DH / 2, z1 + 0.02], k), box(0.09, DH + 0.06, 0.1, [DX + DW / 2 + 0.04, dy + DH / 2, z1 + 0.02], k));
  timber.push(box(DW + 0.2, 0.1, 0.12, [DX, dy + DH + 0.04, z1 + 0.02], k));
  {
    // the leaf: planks hinged at the starboard post, swung out 36°, its old paint a faded rose
    const leaf = [];
    for (let i = 0; i < 4; i++) leaf.push(box(DW / 4 - 0.012, DH - 0.04, 0.05, [-(i + 0.5) * (DW / 4), DH / 2, 0], lit(i % 2 ? C.door : C.doorB)));
    leaf.push(box(DW - 0.04, 0.08, 0.06, [-DW / 2, DH * 0.25, 0.02], k), box(DW - 0.04, 0.08, 0.06, [-DW / 2, DH * 0.75, 0.02], k));
    leaf.push(cyl(0.025, 0.025, 0.04, 6, [-DW + 0.12, DH * 0.5, 0.05], lit(C.iron), [Math.PI / 2, 0, 0]));
    const lg = mergeGeos(leaf);
    xf(lg, { r: [0, -0.63, 0] }); xf(lg, { p: [DX + DW / 2, dy + 0.02, z1 + 0.04] });
    timber.push(lg);
  }
  {
    // the banked glow in the doorway: warmest low down, where the stove is, fading up into the cabin's dark
    const g = new THREE.PlaneGeometry(DW - 0.04, DH - 0.06, 1, 6);
    xf(g, { p: [DX, dy + DH / 2 - 0.01, z1 - 0.02] });
    tagGlow(g, GLOW.door);
    const p = g.attributes.position, c = g.attributes.color;
    for (let i = 0; i < p.count; i++) { const u = clamp((p.getY(i) - dy) / DH, 0, 1), k = 1.25 - 0.95 * u; c.setXYZ(i, c.getX(i) * k, c.getY(i) * (k * 0.92), c.getZ(i) * (k * 0.8)); }
    glow.push(g);
    // the stove's mouth, a brighter ember low in the gap
    glow.push(tagGlow(xf(new THREE.PlaneGeometry(0.22, 0.13), { p: [DX - 0.12, dy + 0.24, z1 - 0.012] }), GLOW.ember));
  }
  {
    const sillY = dy + 0.04, sillZ = z1 + 0.22;
    timber.push(box(DW + 0.34, 0.09, 0.32, [DX, sillY, sillZ], lit(C.stone, 1.5)));
    A.sill = { x: DX, y: sillY + 0.05, z: sillZ };
  }
  // ---- the stove pipe through the roof (aft, over the stove), its collar and rain cap; the ember glow at its mouth
  {
    const px = DX - 0.1, pz = z1 - 0.55, py = top + 0.12, ph = 1.05;
    timber.push(cyl(0.095, 0.095, ph, 10, [px, py + ph / 2, pz], lit(C.iron)));
    timber.push(cyl(0.15, 0.17, 0.08, 10, [px, py + 0.02, pz], lit(C.iron)));
    timber.push(cyl(0.11, 0.11, 0.05, 10, [px, py + ph * 0.62, pz], lit(C.iron, 2.4)));
    timber.push(paint(xf(new THREE.ConeGeometry(0.22, 0.16, 10, 1, true), { p: [px, py + ph + 0.16, pz] }), lit(C.iron)));
    timber.push(paint(xf(new THREE.ConeGeometry(0.22, 0.05, 10), { p: [px, py + ph + 0.06, pz], r: [Math.PI, 0, 0] }), lit(C.iron)));
    for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; timber.push(box(0.015, 0.12, 0.015, [px + Math.cos(a) * 0.14, py + ph + 0.07, pz + Math.sin(a) * 0.14], lit(C.iron))); }
    glow.push(tagGlow(xf(new THREE.CircleGeometry(0.08, 10), { p: [px, py + ph + 0.005, pz], r: [-Math.PI / 2, 0, 0] }), GLOW.ember));
    A.pipe = { x: px, y: py + ph + 0.2, z: pz };
  }
  // ---- the awning over the stern deck: poles, a sagging canvas sheet of patches, its ties
  {
    const az0 = z1 + 0.08, az1 = 5.35, yA = top + 0.06, yB = 1.92, W = 1.62;
    for (const s of [-1, 1]) {
      timber.push(cyl(0.045, 0.055, yB - dy + 0.06, 6, [s * W, (yB + dy) / 2, az1], lit(C.pole)));
      timber.push(paint(tube([new THREE.Vector3(s * W, yB + 0.03, az1), new THREE.Vector3(s * (W + 0.02), (yB + sheer(5.7)) / 2, 5.62), new THREE.Vector3(s * (halfBeam(5.8) - 0.1), sheer(5.8) + 0.05, 5.8)], 0.012, 3), lit(C.rope)));
    }
    const NX = 8, NZ = 7, cells = [];
    const sag = (u, v) => -0.14 * Math.sin(Math.PI * u) * Math.sin(Math.PI * v);
    const at = (u, v) => new THREE.Vector3(-W - 0.05 + (2 * W + 0.1) * u, yA + (yB - yA) * v + sag(u, v), az0 + (az1 + 0.08 - az0) * v);
    const pick = (i, j) => { const h = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; const f = h - Math.floor(h); return f < 0.55 ? C.canvasA : f < 0.8 ? C.canvasB : C.canvasC; };
    for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
      const a = at(i / NX, j / NZ), b = at((i + 1) / NX, j / NZ), c = at((i + 1) / NX, (j + 1) / NZ), d = at(i / NX, (j + 1) / NZ);
      const g = new THREE.BufferGeometry(), t = 0.028;
      const top = [a, b, c, d].map((v) => v.clone().add(new THREE.Vector3(0, t, 0)));
      const P = [];
      for (const [p, q, r] of [[top[0], top[2], top[1]], [top[0], top[3], top[2]], [a, b, c], [a, c, d]]) P.push(p.x, p.y, p.z, q.x, q.y, q.z, r.x, r.y, r.z);
      g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.computeVertexNormals();
      cells.push(paint(g, lit(pick(i, j), 1.7)));
    }
    // seams along the patch lines and a hem along the low edge
    const awning = mergeGeos(cells);
    timber.push(awning);
    for (let i = 1; i < NX; i++) { const pts = []; for (let j = 0; j <= NZ; j++) pts.push(at(i / NX, j / NZ).add(new THREE.Vector3(0, 0.03, 0))); timber.push(paint(tube(pts, 0.008, 3), lit(C.seamC, 1.5))); }
    { const pts = []; for (let i = 0; i <= NX; i++) pts.push(at(i / NX, 1).add(new THREE.Vector3(0, 0.0, 0.04))); timber.push(paint(tube(pts, 0.025, 4), lit(C.canvasB, 1.5))); }
    ink.push(awning);
  }
  // ---- the chart table under the awning: four legs, a frame and a pale sheet on top (5b draws the Chart on it)
  {
    const T0 = BARGE_LOCAL.chart, tx = T0.x, tz = T0.z, ty = dy + 0.78, TW = T0.w, TD = T0.d;
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) timber.push(box(0.06, ty - dy, 0.06, [tx + sx * (TW / 2 - 0.06), (ty + dy) / 2, tz + sz * (TD / 2 - 0.06)], lit(C.post)));
    timber.push(box(TW, 0.05, TD, [tx, ty, tz], lit(C.wallA)));
    timber.push(box(TW - 0.12, 0.012, TD - 0.12, [tx, ty + 0.03, tz], lit(C.chartEdge, 1.6)));
    timber.push(box(TW - 0.2, 0.014, TD - 0.2, [tx, ty + 0.034, tz], lit(C.chart, 1.6)));
    // a weight on the sheet and a rolled sheet beside it
    timber.push(cyl(0.05, 0.06, 0.07, 8, [tx + 0.3, ty + 0.07, tz - 0.18], lit(C.iron)));
    timber.push(cyl(0.035, 0.035, 0.62, 8, [tx - 0.05, ty + 0.06, tz + 0.27], lit(C.chart, 1.5), [0, 0, Math.PI / 2]));
    A.chart = { x: tx, y: ty, z: tz, w: TW, d: TD, top: { x: tx, y: ty + 0.042, z: tz, w: TW - 0.2, d: TD - 0.2 } };
  }
  // ---- the lectern by the door: a post, a slanted desk and the Journal open on it
  {
    const lx = BARGE_LOCAL.lectern.x, lz = BARGE_LOCAL.lectern.z, ly = dy;
    timber.push(cyl(0.05, 0.07, 0.95, 6, [lx, ly + 0.47, lz], lit(C.post)));
    timber.push(box(0.36, 0.05, 0.3, [lx, ly + 0.02, lz], lit(C.post)));
    const desk = mergeGeos([box(0.5, 0.04, 0.38, [0, 0, 0], lit(C.wallA)), box(0.5, 0.05, 0.03, [0, 0.03, 0.18], lit(C.frame))]);
    xf(desk, { r: [0.42, 0, 0] }); xf(desk, { p: [lx, ly + 1.0, lz] }); timber.push(desk);
    const book = mergeGeos([box(0.46, 0.03, 0.32, [0, 0, 0], lit(C.cover, 1.6)), box(0.2, 0.025, 0.29, [-0.11, 0.025, 0], lit(C.page, 1.5)), box(0.2, 0.025, 0.29, [0.11, 0.025, 0], lit(C.page, 1.5)), box(0.012, 0.02, 0.3, [0, 0.03, 0], lit(C.cover, 1.2))]);
    xf(book, { r: [0.42, 0, 0] }); xf(book, { p: [lx, ly + 1.04, lz] }); timber.push(book);
    A.journal = { x: lx, y: ly + 0.55, z: lz };
  }
  // ---- the rails: posts along both gunwales and round the bow, a top rail; the stern left open for the raft
  {
    const RH = 0.52;
    for (const s of [-1, 1]) {
      const pts = gunwalePts(s, -5.55, 5.25, 9, 0.07, 0);
      for (const p of pts) timber.push(box(0.05, RH, 0.05, [p[0], p[1] + RH / 2, p[2]], lit(C.post)));
      timber.push(paint(tube(gunwalePts(s, -5.55, 5.25, 30, 0.07, RH).map((p) => new THREE.Vector3(...p)), 0.03, 5, { capStart: true }), lit(C.cap)));
      timber.push(paint(tube(gunwalePts(s, -5.55, 5.25, 30, 0.07, RH * 0.5).map((p) => new THREE.Vector3(...p)), 0.014, 4, { capStart: true }), lit(C.rope)));
    }
    // round the bow: from one bow quarter to the other through the stem
    const bowPts = [];
    for (let i = 0; i <= 10; i++) { const a = Math.PI * (i / 10); const z = -5.55 - Math.sin(a) * 0.35; bowPts.push(new THREE.Vector3(Math.cos(a) * (halfBeam(-5.55) - 0.07), sheer(z) + RH, z)); }
    timber.push(paint(tube(bowPts, 0.03, 5, { capStart: true }), lit(C.cap)));
    timber.push(box(0.05, RH, 0.05, [0, sheer(-5.9) + RH / 2, -5.9], lit(C.post)));
    A.rails = { RH };
  }
  // ---- the stern's bollard (the raft's rope) and the bow's samson post and coiled chain
  timber.push(cyl(0.1, 0.12, 0.42, 8, [0.95, sheer(5.5) + 0.05, 5.5], lit(C.post)), cyl(0.14, 0.14, 0.05, 8, [0.95, sheer(5.5) + 0.27, 5.5], lit(C.post)));
  timber.push(cyl(0.11, 0.13, 0.5, 8, [0, sheer(-5.2) - 0.05, -5.2], lit(C.post)));
  for (let i = 0; i < 3; i++) timber.push(paint(xf(new THREE.TorusGeometry(0.2 - i * 0.03, 0.03, 4, 12), { p: [0.55, dy + 0.04 + i * 0.05, -4.6], r: [Math.PI / 2, 0, 0] }), lit(C.iron, 2.2)));
  A.bollard = { x: 0.95, y: sheer(5.5) + 0.25, z: 5.5 };
  // ---- a pale stone fascia under the roof's edge, all round (the barge-road's paint, worn), and moss along the roof's lip
  {
    const fy = top - 0.07;
    timber.push(box(0.03, 0.12, len + 0.08, [cw + 0.05, fy, (z0 + z1) / 2], lit(C.fascia, 1.6)), box(0.03, 0.12, len + 0.08, [-cw - 0.05, fy, (z0 + z1) / 2], lit(C.fascia, 1.6)));
    timber.push(box(cw * 2 + 0.08, 0.12, 0.03, [0, fy, z0 - 0.05], lit(C.fascia, 1.6)), box(cw * 2 + 0.08, 0.12, 0.03, [0, fy, z1 + 0.05], lit(C.fascia, 1.6)));
    let sd = 3; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
    for (let i = 0; i < 16; i++) {
      const side = i % 2 ? 1 : -1, z = z0 + 0.3 + rnd() * (len - 0.6), g = new THREE.SphereGeometry(0.07 + rnd() * 0.06, 6, 4); g.scale(1.6, 0.5, 1.1);
      timber.push(paint(xf(g, { p: [side * (cw + 0.12), top + 0.08, z] }), lit(rnd() > 0.5 ? C.moss : C.mossDeep, 2.0)));
    }
  }
  // ---- by the door: a pot of moss and a low stool at the chart table; the raft's rope from the stern bollard
  {
    const DXp = BARGE_LOCAL.door.x - BARGE_LOCAL.door.w / 2 - 0.25;
    timber.push(cyl(0.13, 0.1, 0.22, 8, [0.5, dy + 0.11, z1 + 0.25], lit(C.pot, 1.7)));
    for (let i = 0; i < 5; i++) { const g = new THREE.SphereGeometry(0.07, 6, 4); g.scale(1, 0.7, 1); timber.push(paint(xf(g, { p: [0.5 + Math.cos(i * 1.3) * 0.06, dy + 0.25 + (i % 2) * 0.03, z1 + 0.25 + Math.sin(i * 1.3) * 0.06] }), lit(i % 2 ? C.moss : C.mossDeep, 2.2))); }
    void DXp;
    const T0 = BARGE_LOCAL.chart;
    timber.push(cyl(0.16, 0.16, 0.05, 8, [T0.x + 0.15, dy + 0.46, T0.z - 0.62], lit(C.wallA)));
    for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; timber.push(box(0.035, 0.44, 0.035, [T0.x + 0.15 + Math.cos(a) * 0.1, dy + 0.22, T0.z - 0.62 + Math.sin(a) * 0.1], lit(C.post))); }
    // a cup on the table, beside the sheet
    timber.push(cyl(0.04, 0.035, 0.08, 8, [T0.x - 0.38, dy + 0.84, T0.z - 0.2], lit(C.stoneBlank, 1.4)));
  }
  {
    const b = [0.95, sheer(5.5) + 0.27, 5.5], r = [0.35, 0.28, 7.5];
    timber.push(paint(tube(bezierPts([b, [(b[0] + r[0]) / 2, 0.22, (b[2] + r[2]) / 2], r], 10).map((p) => new THREE.Vector3(...p)), 0.018, 4), lit(C.rope, 1.6)));
  }
  // ---- the bow's rope button (a stout fender on the stem) and a skylight on the roof, its little panes lit from the cabin below
  timber.push(paint(xf(new THREE.SphereGeometry(0.26, 10, 7), { p: [0, 0.38, -6.12], s: [1.1, 0.75, 0.8] }), lit(C.rope, 1.4)));
  {
    const sz = -1.0, sw = 0.62, sl = 1.1, sh = 0.34, sy = top + 0.12;
    timber.push(box(sw + 0.08, 0.06, sl + 0.08, [0, sy + 0.03, sz], lit(C.post)));
    for (const s2 of [-1, 1]) {
      timber.push(box(0.05, sh, sl, [s2 * sw / 2, sy + sh / 2 + 0.06, sz], lit(C.wallA)));
      glow.push(glowQuad(0.26, 0.17, [s2 * (sw / 2 + 0.028), sy + 0.24, sz - 0.27], s2 > 0 ? 'x' : '-x', GLOW.window));
      glow.push(glowQuad(0.26, 0.17, [s2 * (sw / 2 + 0.028), sy + 0.24, sz + 0.27], s2 > 0 ? 'x' : '-x', GLOW.window));
      for (const dz of [-0.27, 0.27]) timber.push(box(0.03, 0.03, 0.3, [s2 * (sw / 2 + 0.04), sy + 0.24, sz + dz], lit(C.frame)), box(0.03, 0.21, 0.03, [s2 * (sw / 2 + 0.04), sy + 0.24, sz + dz], lit(C.frame)));
    }
    timber.push(box(sw, sh, 0.05, [0, sy + sh / 2 + 0.06, sz - sl / 2], lit(C.wallB)), box(sw, sh, 0.05, [0, sy + sh / 2 + 0.06, sz + sl / 2], lit(C.wallB)));
    // its little pitched cap
    const cap = new THREE.CylinderGeometry(0.42, 0.42, sl + 0.14, 3, 1); cap.rotateX(Math.PI / 2); cap.rotateZ(Math.PI / 2);
    cap.scale(1, 0.38, 1);
    timber.push(paint(xf(cap, { p: [0, sy + sh + 0.12, sz] }), lit(C.roof, 1.8)));
    ink.push(box(sw, sh + 0.2, sl, [0, sy + 0.25, sz], 0xffffff));
  }
  // ---- fenders hung over both sides: old rope bundles
  for (const [s, z] of [[1, -1.6], [1, 1.9], [-1, 0.2], [1, -4.2]]) {
    const x = s * (halfBeam(z) + 0.1), y = sheer(z) - 0.42;
    timber.push(paint(xf(new THREE.CapsuleGeometry(0.11, 0.24, 3, 8), { p: [x, y, z] }), lit(C.rope, 1.5)));
    timber.push(paint(tube([new THREE.Vector3(x, y + 0.2, z), new THREE.Vector3(s * (halfBeam(z) + 0.02), sheer(z) + 0.05, z)], 0.012, 3), lit(C.rope)));
  }
  // ---- roof clutter: a coil of rope, a crate, an old oar laid along the roof's edge
  for (let i = 0; i < 3; i++) timber.push(paint(xf(new THREE.TorusGeometry(0.22 - i * 0.04, 0.035, 4, 14), { p: [0.6, top + 0.17 + i * 0.05, -2.9], r: [Math.PI / 2, 0, 0] }), lit(C.rope, 1.6)));
  timber.push(box(0.45, 0.32, 0.4, [0.55, top + 0.28, 1.35], lit(C.wallA)), box(0.47, 0.04, 0.42, [0.55, top + 0.44, 1.35], lit(C.frame)));
  timber.push(paint(xf(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 6), { p: [1.12, top + 0.16, -0.6], r: [Math.PI / 2, 0, 0] }), lit(C.pole)), box(0.16, 0.035, 0.5, [1.12, top + 0.16, 0.85], lit(C.pole)));
  return { timber, ink, glow, anchors: A };
}

/**
 * The variant parts for what is owned (each merged into the same three materials, so no fitting adds a draw call):
 * V = {bed: Bait Bed level, lights: Barge lights level, rod: the rod's tier, wall: Long Wall wings, stones: [state × 4] ('blank' |
 * 'ink' | 'gilt'), looks: [ids]}. → {timber: [geo], glow: [geo]}
 */
function variantParts(V, A) {
  const timber = [], glow = [], lamps = [];
  const CB = HULL.cabin, top = CB.top;
  // the sill's four stones of arc I (one per water of the reach, in road order): blank, inked by the tow, gilded by its legend
  {
    const s = A.sill, stones = Array.isArray(V.stones) ? V.stones : [];
    for (let i = 0; i < 4; i++) {
      const st = stones[i] || 'blank', col = st === 'gilt' ? lit(C.stoneGilt, 1.6) : st === 'ink' ? lit(C.stoneInk, 1.4) : lit(C.stoneBlank, 1.5);
      timber.push(box(0.15, 0.03, 0.15, [s.x - 0.27 + i * 0.18, s.y, s.z + 0.02], col));
      if (st === 'ink' || st === 'gilt') timber.push(box(0.08, 0.034, 0.025, [s.x - 0.27 + i * 0.18, s.y + 0.002, s.z + 0.02], st === 'gilt' ? lit(0xfff0c0, 1.6) : lit(C.stoneBlank, 1.3)));
    }
  }
  // Bait Bed I–II (SPEC §6.3): a moss planter on the roof, a second at II (the moss is the barge's living green)
  const planter = (z) => {
    timber.push(box(1.25, 0.24, 0.46, [0.05, top + 0.26, z], lit(C.wallB)));
    timber.push(box(1.29, 0.04, 0.5, [0.05, top + 0.39, z], lit(C.cap)));
    for (let i = 0; i < 7; i++) {
      const g = new THREE.SphereGeometry(0.11 + (i % 3) * 0.025, 7, 5); g.scale(1.3, 0.55, 1);
      timber.push(paint(xf(g, { p: [-0.48 + i * 0.17, top + 0.42, z + ((i * 37) % 5 - 2) * 0.03] }), lit(i % 2 ? C.moss : C.mossDeep, 2.1)));
    }
  };
  if (V.bed >= 1) planter(-2.3);
  if (V.bed >= 2) planter(0.45);
  // Barge lights I: lanterns on the rail at the four quarters (II: the roof's edge, III: a beacon on the bow; after M1, hooks only)
  if (V.lights >= 1) {
    const RH = A.rails.RH;
    for (const [s, z] of [[1, 5.2], [-1, 5.2], [1, -4.9], [-1, -4.9]]) {
      const x = s * (halfBeam(z) - 0.07), y = sheer(z) + RH + 0.02;
      timber.push(paint(tube(bezierPts([[x, y, z], [x + s * 0.02, y + 0.22, z], [x + s * 0.2, y + 0.28, z]], 6).map((p) => new THREE.Vector3(...p)), 0.016, 4), lit(C.iron)));
      const lx = x + s * 0.2, ly = y + 0.1;
      timber.push(cyl(0.06, 0.08, 0.03, 6, [lx, ly + 0.11, z], lit(C.iron)), cyl(0.08, 0.07, 0.025, 6, [lx, ly - 0.1, z], lit(C.iron)));
      for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.4; timber.push(box(0.012, 0.2, 0.012, [lx + Math.cos(a) * 0.065, ly, z + Math.sin(a) * 0.065], lit(C.iron))); }
      glow.push(tagGlow(xf(new THREE.CylinderGeometry(0.05, 0.055, 0.17, 8), { p: [lx, ly, z] }), GLOW.lantern));
      lamps.push([lx, ly, z]);
    }
  }
  // the rod you own, on its rack on the cabin's aft wall (port side of the door)
  {
    const z = CB.z1 + 0.07, x = -1.0, y0 = HULL.deckY;
    timber.push(box(0.05, 0.1, 0.1, [x - 0.02, y0 + 1.45, z], lit(C.post)), box(0.05, 0.1, 0.1, [x - 0.02, y0 + 0.55, z], lit(C.post)));
    const tierCol = [0x5a4430, 0x6a4a2a, 0x4a3a52, 0x7a5a2a, 0x3a4a5a, 0x8a6a3a, 0xa08040][clamp(V.rod | 0, 0, 6)];
    timber.push(paint(tube([new THREE.Vector3(x + 0.06, y0 + 0.2, z + 0.05), new THREE.Vector3(x + 0.04, y0 + 1.0, z + 0.06), new THREE.Vector3(x + 0.01, y0 + 2.0, z + 0.05)], (u) => 0.022 - u * 0.014, 5, { capStart: true }), lit(tierCol, 1.8)));
    timber.push(cyl(0.035, 0.035, 0.09, 8, [x + 0.07, y0 + 0.62, z + 0.08], lit(C.iron), [0, 0, Math.PI / 2]));
  }
  return { timber, glow, lamps };
}

/**
 * The light the glow throws on the timber, baked per vertex (gwWarm: x the stove's and the windows', y the rail lanterns'): the door's
 * spill over the stern deck, the awning's underside, the chart table and the lectern; each window's on its frame and the wall round
 * it; each lantern's on the rail. The material adds it as emissive, scaled by the glow's own levels (so the bake follows the hour).
 */
function bakeWarm(geo, A, lamps) {
  const p = geo.attributes.position, n = p.count, w = new Float32Array(n * 2);
  const CB = HULL.cabin, dy = HULL.deckY, D0 = BARGE_LOCAL.door;
  const door = [D0.x, dy + 0.55, CB.z1 + 0.25];
  const fall = (d, r) => (d >= r ? 0 : (1 - d / r) * (1 - d / r));
  for (let i = 0; i < n; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    let a = 0, b = 0;
    if (z > CB.z1 - 0.02) a += 0.95 * fall(Math.hypot(x - door[0], (y - door[1]) * 0.8, z - door[2]), 2.3);
    for (const q of A.windows) {
      const out = Math.sign(q[0]) || 1;
      if ((x - q[0]) * out < -0.02) continue;
      a += 0.6 * fall(Math.hypot(x - q[0], y - q[1], z - q[2]), 0.62);
    }
    for (const q of lamps) b += 0.85 * fall(Math.hypot(x - q[0], y - q[1], z - q[2]), 0.9);
    w[i * 2] = Math.min(1, a); w[i * 2 + 1] = Math.min(1, b);
  }
  geo.setAttribute('gwWarm', new THREE.BufferAttribute(w, 2));
  return geo;
}
/** The timber's toon material with the baked warm light as emissive (gwWarmA the stove's colour × level, gwWarmB the lanterns'). */
function timberMaterial() {
  const mat = toonMaterial({ color: 0xffffff, vertexColors: true, rim: 0.16, rimPower: 0.78, detail: 'wood', detailAmount: 1.2, grain: [0, 0, 1], plank: 0.13, wet: 0.18, gloss: 0.14, shine: 12 });
  const U = { gwWarmA: { value: new THREE.Color(0, 0, 0) }, gwWarmB: { value: new THREE.Color(0, 0, 0) } };
  mat.userData.warm = U;
  const base = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader, r) => {
    base.call(mat, shader, r);
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec2 gwWarm;\nvarying vec2 vGwWarm;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGwWarm = gwWarm;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vGwWarm;\nuniform vec3 gwWarmA;\nuniform vec3 gwWarmB;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += gwWarmA * vGwWarm.x + gwWarmB * vGwWarm.y;');
  };
  const key = mat.customProgramCacheKey?.() || '';
  mat.customProgramCacheKey = () => `${key}|gwHomeWarm`;
  return mat;
}

/** The glow material: vertex colours times a per-part brightness (gwK), unlit, into the bloom. */
function glowMaterial() {
  const mat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, fog: true });
  const gwK = { value: new THREE.Vector4(1, 1, 1, 1) };
  mat.userData.gwK = gwK;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.gwK = gwK;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float gwPart;\nuniform vec4 gwK;\nvarying float vGwK;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGwK = gwPart < 0.5 ? gwK.x : gwPart < 1.5 ? gwK.y : gwPart < 2.5 ? gwK.z : gwK.w;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vGwK;')
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= vGwK;');
  };
  mat.customProgramCacheKey = () => 'gwHomeGlow';
  return mat;
}

/**
 * The window, door, lantern and ember brightness for the light of the hour (pure; node tests read it). mood: world.getMood()
 * {night 0..1, warm 0..1 (dawn)}; home: at home (first light). → {window, door, lantern, ember} multipliers.
 */
export function glowLevels({ night = 0, warm = 0 } = {}, { home = false } = {}) {
  const n = clamp(Number(night) || 0, 0, 1), w = clamp(Number(warm) || 0, 0, 1);
  // the windows: low by day, coming up through the first lights (dusk), full at night; still lit at first light
  const win = clamp(0.32 + 0.68 * smooth(0.05, 0.6, n) + 0.3 * w, 0, 1);
  // the stove is banked all day: home's warmest light, a little brighter in the dark
  const door = clamp(0.72 + 0.28 * smooth(0.1, 0.7, n), 0, 1);
  // the rail lanterns burn through the night and fade as the sky pales
  const lantern = clamp(smooth(0.12, 0.55, n) * (1 - 0.35 * w) + (home ? 0.1 : 0), 0, 1);
  const ember = clamp(0.6 + 0.4 * smooth(0.1, 0.8, n), 0, 1);
  return { window: win, door, lantern, ember };
}

/** What is owned, read from meta.loop (pure): → the variant record setVariants takes, and its signature. */
export function homeVariants(metaLoop, waterOrder = ['mossmere']) {
  const L = metaLoop && typeof metaLoop === 'object' ? metaLoop : {};
  const H = L.home && typeof L.home === 'object' ? L.home : {};
  const towed = Array.isArray(L.barge?.towed) ? L.barge.towed : [];
  const legends = L.legends && typeof L.legends === 'object' ? L.legends : {};
  const legendOf = { mossmere: 'belled_matriarch' };
  const stones = [];
  for (let i = 0; i < 4; i++) {
    const w = waterOrder[i];
    stones.push(!w || !towed.includes(w) ? 'blank' : legends[legendOf[w]] ? 'gilt' : 'ink');
  }
  const v = { bed: Math.max(0, Number(H.baitBed) | 0), lights: Math.max(0, Number(H.lights) | 0), wall: Math.max(0, Number(H.wall) | 0),
    rod: Math.max(0, Number(L.tackle?.rod) | 0), stones, looks: Array.isArray(L.looks) ? L.looks.filter((x) => typeof x === 'string').sort() : [] };
  v.sig = JSON.stringify([v.bed, v.lights, v.wall, v.rod, v.stones, v.looks]);
  return v;
}

export function createHome(ctx) {
  const mats = [];
  const object3d = new THREE.Group(); object3d.name = 'home'; object3d.visible = false;
  const bob = new THREE.Group(); object3d.add(bob);
  const timberMat = timberMaterial();
  const glowMat = glowMaterial();
  mats.push(timberMat, glowMat);
  const base = baseParts();
  const A = base.anchors;
  const timber = new THREE.Mesh(new THREE.BufferGeometry(), timberMat); timber.name = 'home:timber';
  const glow = new THREE.Mesh(new THREE.BufferGeometry(), glowMat); glow.name = 'home:glow'; glow.userData.noCast = true;
  bob.add(timber, glow);
  // the ink: the big parts' outline on its own carrier (the carrier draws nothing; its outline child is the one call)
  const inkGeo = smoothNormals(mergeGeos(base.ink.map((g) => { const c = g.clone(); c.deleteAttribute?.('color'); return c; })));
  const inkCarrier = new THREE.Mesh(inkGeo, new THREE.MeshBasicMaterial({ visible: false }));
  inkCarrier.name = 'home:inkCarrier'; inkCarrier.userData.noReflect = true; inkCarrier.userData.noCast = true;
  const outline = addOutline(inkCarrier, { thickness: 0.03 });
  if (outline) { inkCarrier.remove(outline); outline.name = 'home:outline'; bob.add(outline); }
  mats.push(inkCarrier.material);
  let variant = null;
  /** Rebuild the merged timber and glow for what is owned (V from homeVariants). */
  function setVariants(V) {
    const v = V && typeof V === 'object' ? V : homeVariants(null);
    if (variant && variant.sig === v.sig) return false;
    variant = v;
    const parts = variantParts(v, A);
    const tg = bakeWarm(mergeGeos([...base.timber.map((g) => g), ...parts.timber]), A, parts.lamps);
    const gg = mergeGeos([...base.glow, ...parts.glow]);
    timber.geometry.dispose(); glow.geometry.dispose();
    timber.geometry = tg; glow.geometry = gg;
    return true;
  }
  setVariants(homeVariants(null));

  // ---------------------------------------------------------------- placement and life
  const mooring = { x: 0, z: 0, yaw: 0, set: false };
  const tmp = new THREE.Vector3(), q = new THREE.Vector3();
  let t = 0, smokeT = 0, sigT = 0;
  const K = { window: 1, door: 1, lantern: 1, ember: 1 };
  const waterLight = { position: new THREE.Vector3(), color: new THREE.Color(0xffa95a), intensity: 0, distance: 6, streak: 0.75, radius: 4.5 };
  /** World point of a local barge point. */
  const toWorld = (x, y, z, out = new THREE.Vector3()) => { object3d.updateMatrixWorld(); return bob.localToWorld(out.set(x, y, z)); };
  const api = {
    object3d, mats, timber, glow, outline,
    get anchors() { return A; },
    get variant() { return variant; },
    get levels() { return { ...K }; },
    waterLight,
    setVariants,
    /** Moor the barge: its centre (x, z) and yaw (the bow faces (−sin yaw, −cos yaw)). */
    moor({ x = 0, z = 0, yaw = 0 } = {}) {
      mooring.x = Number(x) || 0; mooring.z = Number(z) || 0; mooring.yaw = Number(yaw) || 0; mooring.set = true;
      object3d.position.set(mooring.x, 0, mooring.z); object3d.rotation.set(0, mooring.yaw, 0);
      object3d.updateMatrixWorld(true);
    },
    get moored() { return mooring.set; },
    show(on) { object3d.visible = !!on && mooring.set; },
    /**
     * The targets' world boxes (M1 §4 step 5a: the DOM buttons sit over their projected bounds): chart (the table under the
     * awning), journal (the lectern by the door), wall (the cabin's lit doorway). → {id: THREE.Box3}
     */
    targetBoxes(out = {}) {
      const box3 = (id, pts) => {
        const b = out[id] || (out[id] = new THREE.Box3()); b.makeEmpty();
        for (const p of pts) b.expandByPoint(toWorld(p[0], p[1], p[2], q));
        return b;
      };
      for (const id of ['chart', 'journal', 'wall']) box3(id, [TARGET_BOXES[id].min, TARGET_BOXES[id].max]);
      return out;
    },
    update(dt, heightFn) {
      if (!object3d.visible) { waterLight.intensity = 0; return; }
      t += dt;
      // ride the water: a 12 m hull barely moves; a slow roll and pitch from the swell's slope
      const x = mooring.x, z = mooring.z;
      if (heightFn) {
        const fx = -Math.sin(mooring.yaw), fz = -Math.cos(mooring.yaw);
        const h0 = heightFn(x, z), hb = heightFn(x + fx * 5, z + fz * 5), hs = heightFn(x - fx * 5, z - fz * 5);
        const hl = heightFn(x - fz * 1.6, z + fx * 1.6), hr = heightFn(x + fz * 1.6, z - fx * 1.6);
        object3d.position.y = damp(object3d.position.y, h0 * 0.5 - 0.02, 2, dt);
        bob.rotation.x = damp(bob.rotation.x, clamp((hb - hs) / 10, -0.02, 0.02) + Math.sin(t * 0.37) * 0.004, 2, dt);
        bob.rotation.z = damp(bob.rotation.z, clamp((hl - hr) / 3.2, -0.025, 0.025) + Math.sin(t * 0.29 + 1) * 0.006, 2, dt);
      }
      // the light of the hour (world.getMood()); home is first light
      const mood = ctx.world?.getMood?.() || { night: 0, warm: 0 };
      const home = ctx.flow === 'home';
      const L = glowLevels(mood, { home });
      const flick = 0.94 + Math.sin(t * 3.1) * 0.03 + Math.sin(t * 7.7 + 1.3) * 0.02;
      const wallK = variant?.wall > 0 ? 1.12 : 1;   // wing I's candles warm the doorway (step 5b hangs the gallery)
      for (const k of Object.keys(L)) K[k] = damp(K[k], L[k], 2.5, dt);
      glowMat.userData.gwK.value.set(K.window * (0.97 + 0.03 * flick), K.door * flick * wallK, K.lantern * flick, K.ember * (0.85 + 0.15 * flick));
      // the baked spill: the stove's and the windows' warmth (home's warmest light), the lanterns'
      timberMat.userData.warm.gwWarmA.value.setRGB(0.62, 0.32, 0.12).multiplyScalar(Math.max(K.door, K.window * 0.8) * flick * wallK);
      timberMat.userData.warm.gwWarmB.value.setRGB(0.55, 0.36, 0.16).multiplyScalar(K.lantern * flick);
      // the warm windows on the water: one streak under the cabin's lake-side windows (no PointLight, no pool round the barge)
      toWorld(0, 1.3, -0.8, waterLight.position);
      waterLight.intensity = 1.6 * K.window;
      // the stove's smoke from the pipe (the shared smoke pool: no draw call of its own)
      smokeT -= dt;
      if (smokeT <= 0) {
        smokeT = 0.7 + Math.random() * 0.6;
        toWorld(A.pipe.x, A.pipe.y, A.pipe.z, tmp);
        ctx.models?.emitSmoke?.(tmp, { color: 0x7a7480, vy: 0.4, spread: 0.12, size: 0.34, sizeGrow: 0.9, lifeT: 3.6, alpha: 0.26, jitter: 0.04 });
      }
      // the variant follows what is owned (meta.loop), read twice a second
      sigT -= dt;
      if (sigT <= 0) { sigT = 0.5; try { setVariants(homeVariants(ctx.state?.meta?.loop, api.waterOrder)); } catch { /* keep the last */ } }
    },
    waterOrder: ['mossmere'],
    /** Draw calls this actor adds (main / mirror / shadow): the budget's own count (M1 §2.14). */
    calls() { return { main: 2 + (outline ? 1 : 0), mirror: 2, shadow: 1 }; },
    stats() {
      return { visible: object3d.visible, moored: mooring.set, x: mooring.x, z: mooring.z, yaw: mooring.yaw, variant: variant ? JSON.parse(variant.sig) : null,
        verts: { timber: timber.geometry.attributes.position.count, glow: glow.geometry.attributes.position.count, ink: inkGeo.attributes.position.count },
        levels: { ...K }, calls: api.calls() };
    },
    dispose() {
      object3d.parent?.remove(object3d);
      timber.geometry.dispose(); glow.geometry.dispose(); inkGeo.dispose();
      for (const m of mats) m.dispose?.();
    },
  };
  return api;
}
