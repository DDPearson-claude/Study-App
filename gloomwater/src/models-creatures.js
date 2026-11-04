// models-creatures.js — individually animated night creatures (helper of models.js):
// wisp, mite, moth, eel, hand (elite), warden (boss). Ink-dark toon bodies with pale rim
// light and ink outlines, glowing eyes, vertex-shader animation, white hurt flash and a
// noise dissolve with a glowing edge on death.
import * as THREE from 'three';
import { PALE, INK, glowSprite } from './toon.js';
import {
  TAU, deformToon, deformGlow, deformOutline, outlineMesh, fxUniforms, xf, paint, attr, mergeGeos, tube,
  bezierPts, spike, blob, lumpy, smoothNormals, hexColor,
} from './models-kit.js';

export const GLOOM_RIM = 0x8a76bd; // DESIGN §19: gloomlings are rim-lit violet (#6b5b8f), lifted a touch for readability
export const KIND_DEFAULTS = {
  wisp: { tint: 0x07080d, eye: 0xe8f1f2, radius: 0.42, hover: 0.8 },
  mite: { tint: 0x0a0a10, eye: 0xe6e9ff, radius: 0.26, hover: 0.1 },
  moth: { tint: 0x6a5f78, eye: 0xb8ccff, radius: 0.5, hover: 1.5 },
  eel: { tint: 0x07080d, eye: 0xe6e9ff, radius: 0.5, hover: -0.05 },
  hand: { tint: 0x07080d, eye: 0xe8f1f2, radius: 1.5, hover: 0 },
  warden: { tint: 0x05070a, eye: 0xdbe2ff, radius: 2.4, hover: 0 },
};

// ------------------------------------------------------------------ shared geometry builders (also used by swarms)
/** Wisp: teardrop of ink + trailing tendrils. Attributes aW (tendril along) and aSeed. */
export function wispGeometry(detail = 1) {
  const prof = [[0.0, 0.44], [0.11, 0.425], [0.2, 0.37], [0.26, 0.27], [0.285, 0.15], [0.27, 0.03], [0.22, -0.1], [0.15, -0.24], [0.08, -0.4], [0.03, -0.56], [0.005, -0.66]];
  const body = new THREE.LatheGeometry(prof.map((p) => new THREE.Vector2(p[0], p[1])), detail > 0.5 ? 18 : 12);
  const pos = body.attributes.position;
  for (let i = 0; i < pos.count; i++) { // curl the tail backward (−Z) and wobble the silhouette
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const low = Math.max(0, -y);
    pos.setXYZ(i, x + Math.sin(y * 9) * 0.012, y, z - Math.pow(low, 1.5) * 0.55);
  }
  body.computeVertexNormals();
  attr(body, 'aW', 1, (x, y) => Math.max(0, -y) * 0.8);
  attr(body, 'aSeed', 1, 0);
  const parts = [body];
  const n = detail > 0.5 ? 5 : 3;
  for (let k = 0; k < n; k++) {
    const a = (k / n) * TAU + 0.4, r = 0.2;
    const x0 = Math.cos(a) * r, z0 = Math.sin(a) * r * 0.8 - 0.04, len = 0.4 + (k % 3) * 0.14;
    const pts = bezierPts([[x0 * 0.9, -0.02, z0 * 0.9], [x0 * 1.45, -0.22, z0 - 0.12], [x0 * 0.9 + Math.sin(k * 2.1) * 0.12, -0.4 - len * 0.3, z0 - 0.3 - len * 0.35]], detail > 0.5 ? 9 : 6);
    const g = tube(pts, (u) => 0.07 * Math.pow(1 - u, 1.3) + 0.003, detail > 0.5 ? 6 : 4);
    attr(g, 'aW', 1, (x, y, z, i) => { const u = g.attributes.uv.getX(i); return 0.3 + u * 1.1; });
    attr(g, 'aSeed', 1, k * 1.7 + 0.5);
    parts.push(g);
  }
  return mergeGeos(parts);
}
export function wispEyes() {
  const parts = [];
  for (const side of [1, -1]) parts.push(blob(0.042, 0.022, 0.03, [side * 0.085, 0.22, 0.25], 8, 6, [0, side * 0.35, side * -0.35]));
  const g = mergeGeos(parts);
  attr(g, 'aW', 1, 0); attr(g, 'aSeed', 1, 0);
  return g;
}
export const WISP_PARS = (phase) => /* glsl */`
uniform float uT, uMove, uAtk;
attribute float aW; attribute float aSeed;
void gwDeform(inout vec3 p, inout vec3 n) {
  float T = uT + ${phase};
  float br = 1.0 + sin(T * 2.4) * 0.045 + uAtk * 0.22;
  p.xz *= br; p.y *= 1.0 + uAtk * 0.08;
  float low = clamp(-p.y * 1.5, 0.0, 1.6) * 0.6 + aW;
  p.x += sin(T * 3.3 + aSeed * 2.1 + p.y * 3.0) * 0.075 * low;
  p.z += sin(T * 2.6 + aSeed + p.y * 2.0) * 0.045 * low - low * low * 0.13 * uMove;
  p.y += sin(T * 1.7 + aSeed) * 0.03 * low;
}`;

/** Mite: lumpy tick with six skittering legs. aLeg = (phase, along). */
export function miteGeometry(detail = 1) {
  const ab = lumpy(blob(0.15, 0.115, 0.19, [0, 0.11, -0.05], detail > 0.5 ? 12 : 9, detail > 0.5 ? 9 : 7), 0.012, 18, 2);
  const head = blob(0.075, 0.065, 0.075, [0, 0.09, 0.15], 8, 6);
  const parts = [ab, head];
  for (const g of parts) attr(g, 'aLeg', 2, [0, 0]);
  for (const side of [1, -1]) {
    const m1 = spike([side * 0.035, 0.07, 0.21], [side * 0.3, -0.2, 1], 0.014, 0.07, 4);
    attr(m1, 'aLeg', 2, [0, 0]); parts.push(m1);
    for (let k = 0; k < 3; k++) {
      const z = 0.08 - k * 0.09;
      const pts = bezierPts([[side * 0.1, 0.1, z], [side * 0.24, 0.22, z + 0.03 - k * 0.02], [side * 0.32, 0.0, z + 0.06 - k * 0.07]], 6);
      const g = tube(pts, (u) => 0.016 * (1 - u * 0.6), 4);
      const ph = (k + (side > 0 ? 0 : 1.5)) * 2.1;
      attr(g, 'aLeg', 2, (x, y, zz, i) => [ph, g.attributes.uv.getX(i)]);
      parts.push(g);
    }
  }
  return mergeGeos(parts);
}
export function miteEyes() {
  const parts = [];
  parts.push(blob(0.03, 0.026, 0.02, [0.02, 0.125, 0.215], 7, 5));
  parts.push(blob(0.012, 0.012, 0.01, [-0.04, 0.13, 0.205], 5, 4));
  const g = mergeGeos(parts); attr(g, 'aLeg', 2, [0, 0]);
  return g;
}
export const MITE_PARS = (phase) => /* glsl */`
uniform float uT, uMove, uAtk;
attribute vec2 aLeg;
void gwDeform(inout vec3 p, inout vec3 n) {
  float T = uT * (8.0 + uMove * 12.0) + ${phase};
  float a = aLeg.y;
  p.y += max(0.0, sin(T + aLeg.x)) * 0.07 * a;
  p.z += cos(T + aLeg.x) * 0.055 * a;
  p.y += abs(sin(T * 0.5)) * 0.015 * (1.0 - a) + uAtk * 0.06 * (1.0 - a);
  p.z += uAtk * 0.05 * (1.0 - a);
}`;

/** Moth wings texture (cell 0 forewing, cell 1 hindwing, cell 2 plain dusty). Grayscale × tint, eye-spots in the emissive map. */
let mothTex = null;
export function mothTextures() {
  if (mothTex) return mothTex;
  const W = 384, H = 128;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const e = document.createElement('canvas'); e.width = W; e.height = H;
  const g = c.getContext('2d'), ge = e.getContext('2d');
  ge.fillStyle = '#000'; ge.fillRect(0, 0, W, H);
  const paths = [
    'M0,44 C30,22 90,8 124,18 C128,38 118,70 96,86 C70,96 30,92 0,74 Z',
    'M0,34 C40,32 100,50 112,80 C114,104 82,124 50,118 C24,110 8,92 0,74 Z',
  ];
  let seed = 3; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let k = 0; k < 2; k++) {
    g.save(); ge.save(); g.translate(k * 128, 0); ge.translate(k * 128, 0);
    const p = new Path2D(paths[k]);
    const grd = g.createLinearGradient(0, 0, 128, 0);
    grd.addColorStop(0, '#9a9a9a'); grd.addColorStop(0.5, '#e8e8e8'); grd.addColorStop(1, '#bdbdbd');
    g.fillStyle = grd; g.fill(p);
    g.save(); g.clip(p);
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(${rnd() < 0.5 ? '0,0,0' : '255,255,255'},${0.06 + rnd() * 0.08})`; g.beginPath(); g.arc(rnd() * 128, rnd() * 128, 2 + rnd() * 7, 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 1.5;
    for (let a = -0.9; a <= 0.9; a += 0.3) { g.beginPath(); g.moveTo(0, 60); g.quadraticCurveTo(50, 60 + a * 30, 130, 60 + a * 90); g.stroke(); }
    // dark band near the edge
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 9; g.stroke(p);
    g.restore();
    // eye spot
    const ex = k === 0 ? 74 : 62, ey = k === 0 ? 48 : 86, er = k === 0 ? 17 : 12;
    g.fillStyle = '#111'; g.beginPath(); g.arc(ex, ey, er, 0, TAU); g.fill();
    g.fillStyle = '#f4f4f4'; g.beginPath(); g.arc(ex, ey, er * 0.68, 0, TAU); g.fill();
    g.fillStyle = '#222'; g.beginPath(); g.arc(ex, ey, er * 0.35, 0, TAU); g.fill();
    ge.fillStyle = '#fff'; ge.beginPath(); ge.arc(ex, ey, er * 0.68, 0, TAU); ge.fill();
    ge.fillStyle = '#000'; ge.beginPath(); ge.arc(ex, ey, er * 0.3, 0, TAU); ge.fill();
    g.lineJoin = 'round'; g.strokeStyle = '#000'; g.lineWidth = 4; g.stroke(p);
    g.restore(); ge.restore();
  }
  // plain dusty cell for the body
  g.fillStyle = '#d0d0d0'; g.fillRect(256, 0, 128, 128);
  for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(0,0,0,${0.05 + rnd() * 0.1})`; g.fillRect(256 + rnd() * 128, rnd() * 128, 2, 2); }
  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace; map.userData.shared = true;
  const ems = new THREE.CanvasTexture(e); ems.colorSpace = THREE.SRGBColorSpace; ems.userData.shared = true;
  mothTex = { map, ems };
  return mothTex;
}
function setUvCell(g, cellX, cells = 3) { // remap a geometry's uvs into cell 2 (plain) or a wing cell
  const uv = g.attributes.uv;
  if (!uv) { attr(g, 'uv', 2, [(cellX + 0.5) / cells, 0.5]); return g; }
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (cellX + 0.1 + uv.getX(i) * 0.8) / cells, 0.1 + uv.getY(i) * 0.8);
  return g;
}
function wingCard(cell, side, len, h, z0, y0, sweep, segs = 4) {
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= segs; j++) for (let i = 0; i <= segs; i++) {
    const u = i / segs, v = j / segs;
    pos.push(side * (0.04 + u * len), y0 + u * 0.06, z0 + (v - 0.5) * h - u * sweep);
    uv.push((cell + 0.01 + u * 0.98) / 3, 0.01 + (side > 0 ? v : v) * 0.98);
  }
  for (let j = 0; j < segs; j++) for (let i = 0; i < segs; i++) { const a = j * (segs + 1) + i, b = a + segs + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}
/** Moth: { body (incl. wings, textured), outline (body only), eyes (head eyes + wing eye-spots glow) }. aWing = signed span. */
export function mothGeometry(detail = 1) {
  const seg = detail > 0.5 ? 10 : 7;
  const bodyParts = [
    blob(0.07, 0.07, 0.08, [0, 0, 0.05], seg, seg - 2),
    blob(0.055, 0.05, 0.16, [0, -0.01, -0.16], seg, seg - 2),
    blob(0.05, 0.05, 0.05, [0, 0.01, 0.15], 8, 6),
  ];
  for (const side of [1, -1]) {
    bodyParts.push(tube(bezierPts([[side * 0.025, 0.04, 0.18], [side * 0.08, 0.16, 0.3], [side * 0.16, 0.2, 0.34]], 6), (u) => 0.008 * (1 - u * 0.5), 3));
    for (let k = 1; k < 5; k++) bodyParts.push(spike([side * (0.04 + k * 0.025), 0.1 + k * 0.022, 0.24 + k * 0.022], [side * 0.6, 0.6, 0.5], 0.004, 0.035, 3));
  }
  bodyParts.forEach((g) => { setUvCell(g, 2); attr(g, 'aWing', 1, 0); });
  const outline = mergeGeos(bodyParts.map((g) => g.clone()));
  const wings = [];
  for (const side of [1, -1]) {
    const fw = wingCard(0, side, 0.5, 0.36, 0.06, 0.02, 0.12);
    const hw = wingCard(1, side, 0.36, 0.3, -0.12, 0.0, 0.1);
    for (const w of [fw, hw]) { attr(w, 'aWing', 1, (x) => x); wings.push(w); }
  }
  const body = mergeGeos([...bodyParts, ...wings]);
  // glowing bits: head eyes + wing eye-spot discs (follow the flap via aWing)
  const eyes = [];
  for (const side of [1, -1]) {
    const e1 = blob(0.022, 0.022, 0.016, [side * 0.03, 0.025, 0.19], 6, 5); attr(e1, 'aWing', 1, 0); eyes.push(e1);
    const spot = (cx, cz, r) => { const d = new THREE.CircleGeometry(r, 10); d.rotateX(-Math.PI / 2); d.translate(side * cx, 0.0, cz); return d; };
    const s1 = spot(0.04 + 0.578 * 0.5, 0.06 + (0.625 - 0.5) * 0.36 - 0.578 * 0.12, 0.045);
    const s2 = spot(0.04 + 0.484 * 0.36, -0.12 + (0.328 - 0.5) * 0.3 - 0.484 * 0.1, 0.024);
    for (const s of [s1, s2]) {
      const p = s.attributes.position;
      for (let i = 0; i < p.count; i++) { const u = (Math.abs(p.getX(i)) - 0.04) / (s === s1 ? 0.5 : 0.36); p.setY(i, (s === s1 ? 0.02 : 0) + u * 0.06 + 0.012); }
      s.deleteAttribute('uv');
      attr(s, 'aWing', 1, (x) => x); eyes.push(s);
    }
  }
  return { body, outline: smoothNormals(outline), eyes: mergeGeos(eyes) };
}
export const MOTH_PARS = (phase) => /* glsl */`
uniform float uT, uMove, uAtk;
attribute float aWing;
void gwDeform(inout vec3 p, inout vec3 n) {
  float T = uT + ${phase};
  float flap = sin(T * (9.0 + uMove * 5.0)) * (0.85 + uAtk * 0.3) + 0.15;
  float sd = sign(aWing);
  float a = flap * sd * step(0.001, abs(aWing));
  float c = cos(a), s = sin(a);
  vec2 xy = vec2(p.x * c - p.y * s, p.x * s + p.y * c);
  p.xy = xy;
  vec2 nn = vec2(n.x * c - n.y * s, n.x * s + n.y * c); n.xy = nn;
  p.y -= flap * 0.03 * (1.0 - step(0.001, abs(aWing)));
}`;

/** Shadow eel: long ink ribbon with dorsal fin; glowing hook-teeth (eyes geometry). */
export function eelGeometry(detail = 1) {
  const R = detail > 0.5 ? 40 : 26, A = detail > 0.5 ? 10 : 7, L = 2.0;
  const pos = [], uv = [], idx = [];
  const wf = (s) => (s < 0.06 ? 0.02 + s * 1.4 : s < 0.15 ? 0.1 : 0.1 * (1 - (s - 0.15) / 0.85) + 0.01);
  for (let i = 0; i <= R; i++) {
    const s = i / R, w = wf(s);
    for (let j = 0; j <= A; j++) { const th = -Math.PI / 2 + (j / A) * TAU; pos.push(Math.cos(th) * w * 0.85, Math.sin(th) * w, L / 2 - s * L); uv.push(s, j / A); }
  }
  for (let i = 0; i < R; i++) for (let j = 0; j < A; j++) { const a = i * (A + 1) + j, b = a + A + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const body = new THREE.BufferGeometry();
  body.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  body.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  body.setIndex(idx); body.computeVertexNormals();
  // jagged dorsal fin
  const fin = [];
  for (let k = 0; k < 9; k++) {
    const s = 0.2 + k * 0.085, z = L / 2 - s * L, w = wf(s);
    fin.push(spike([0, w * 0.8, z], [0, 1, -0.8], 0.03, 0.14 * (1 - k * 0.07), 3));
  }
  const parts = [body, ...fin];
  const g = mergeGeos(parts);
  const eyes = [];
  for (const side of [1, -1]) {
    eyes.push(blob(0.028, 0.02, 0.03, [side * 0.07, 0.05, L / 2 - 0.12], 6, 5));
    for (let k = 0; k < 4; k++) eyes.push(spike([side * (0.02 + k * 0.015), -0.025, L / 2 - 0.03 - k * 0.035], [0, -1, 0.5], 0.008, 0.05, 3));
  }
  return { body: g, eyes: mergeGeos(eyes), length: L };
}
export const EEL_PARS = (phase, arch = 'uArch') => /* glsl */`
uniform float uT, uMove, uAtk, uArch;
void gwDeform(inout vec3 p, inout vec3 n) {
  float T = uT * (1.0 + uMove) + ${phase};
  float s = clamp(1.0 - p.z, 0.0, 2.0) * 0.5;
  float w = 0.25 + s;
  float gA = ${arch};
  float l = sin(s * 9.0 - T * 6.0) * 0.12 * w * (1.0 - gA * 0.7);
  p.x += l;
  float d = cos(s * 9.0 - T * 6.0) * 9.0 * 0.12 * w * 0.5;
  n.z += d * n.x; n = normalize(n);
  p.y += gA * (1.0 - pow(2.0 * s - 1.0, 2.0)) * 0.55;
  p.y += uAtk * 0.05 * (1.0 - s);
}`;

// ------------------------------------------------------------------ hand (elite)
function handGeometry() {
  const parts = [], accent = [], rings = [];
  const fmats = [];
  const tag = (g, finger, len) => { attr(g, 'aFinger', 1, finger); attr(g, 'aLen', 1, len); attr(g, 'aDrip', 2, [0, 0]); return g; };
  const arm = tube(bezierPts([[0, -2.2, -0.1], [0, -0.6, -0.12], [0, 0.95, 0]], 10), (u) => 0.42 - u * 0.1, 10, { capEnd: false });
  parts.push(tag(lumpy(arm.toNonIndexed ? arm : arm, 0.03, 5, 3), -1, 0));
  const palm = lumpy(blob(0.5, 0.56, 0.2, [0, 1.36, 0], 16, 12), 0.03, 6, 1);
  parts.push(tag(palm, -1, 0));
  const defs = [ // x, y, splay(z-rot), length, radius
    [-0.31, 1.76, 0.2, 0.9, 0.11], [-0.11, 1.84, 0.06, 1.02, 0.118], [0.11, 1.83, -0.06, 0.97, 0.115], [0.31, 1.74, -0.19, 0.78, 0.1],
    [0.46, 1.2, -0.72, 0.68, 0.12],
  ];
  defs.forEach(([x, y, rz, L, r], i) => {
    const f = tube(bezierPts([[0, -0.05, 0], [0, L * 0.5, 0.0], [0, L, -0.01]], 12), (u) => r * (1 - u * 0.45) * (1 + 0.12 * Math.sin(u * TAU * 1.5)), 7);
    parts.push(tag(f, i, L));
    accent.push(tag(spike([0, L - 0.03, 0.0], [0, 1, 0.35], r * 0.5, 0.2, 5), i, L));
    if (i === 1 || i === 3) { // tarnished brass rings on two fingers (DESIGN §19.7)
      const ring = new THREE.TorusGeometry(r * 1.05, 0.03, 6, 14); ring.rotateX(Math.PI / 2); ring.translate(0, L * 0.32, 0);
      rings.push(tag(ring, i, L));
    }
    const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, 0.02), new THREE.Quaternion().setFromEuler(new THREE.Euler(i === 4 ? 0.35 : 0, 0, rz)), new THREE.Vector3(1, 1, 1));
    fmats.push(m);
  });
  // ink drips
  for (let k = 0; k < 10; k++) {
    const d = blob(0.035, 0.06, 0.035, [-0.4 + (k % 5) * 0.2, 1.0 + (k * 0.37 % 0.6), 0.12 * ((k % 2) ? 1 : -1)], 5, 4);
    attr(d, 'aFinger', 1, -1); attr(d, 'aLen', 1, 0); attr(d, 'aDrip', 2, [k * 0.137, 1.4 + (k % 3) * 0.6]);
    parts.push(d);
  }
  const geo = mergeGeos(parts);
  return { geo, fmats, accent: mergeGeos(accent), rings: mergeGeos(rings) };
}
const HAND_PARS = /* glsl */`
uniform float uT, uCurl[5]; uniform mat4 uFM[5];
attribute float aFinger; attribute float aLen; attribute vec2 aDrip;
void gwDeform(inout vec3 p, inout vec3 n) {
  if (aFinger > -0.5) {
    int fi = int(aFinger + 0.5);
    float th = uCurl[fi] + sin(uT * 1.3 + aFinger * 1.7) * 0.08;
    float L = max(aLen, 0.01);
    if (abs(th) > 0.002) {
      float r = L / th;
      float d = clamp(p.y, 0.0, L), ex = p.y - d;
      float phi = d / L * th;
      float c = cos(phi), s = sin(phi);
      float rz = r - p.z;
      vec3 q = vec3(p.x, rz * s + ex * c, r - rz * c + ex * s);
      n = vec3(n.x, n.y * c - n.z * s, n.y * s + n.z * c);
      p = q;
    }
    p = (uFM[fi] * vec4(p, 1.0)).xyz;
    n = mat3(uFM[fi]) * n;
  }
  if (aDrip.y > 0.0) {
    float ph = fract(uT * 0.45 + aDrip.x);
    p.y -= ph * ph * aDrip.y;
    p.xz *= 1.0 - ph * 0.3;
  }
}`;

// ------------------------------------------------------------------ warden (boss)
function wardenGeometry() {
  const prof = [[1.55, -0.4], [1.5, 0.2], [1.38, 1.0], [1.22, 2.0], [1.15, 2.7], [1.1, 3.1], [0.85, 3.4], [0.55, 3.55], [0.01, 3.6]];
  const robe = new THREE.LatheGeometry(prof.map((p) => new THREE.Vector2(p[0], p[1])), 28);
  const pos = robe.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), a = Math.atan2(z, x);
    let ny = y;
    if (y < 0.3) ny -= (Math.max(0, Math.sin(a * 7)) * 0.5 + Math.max(0, Math.sin(a * 13 + 1)) * 0.3) * (0.3 - y) / 0.7;
    const fold = 1 + Math.sin(a * 9) * 0.05 * Math.min(1, (3.2 - y) / 2);
    pos.setXYZ(i, x * fold, ny, z * fold);
  }
  robe.computeVertexNormals();
  const tagArm = (g, side, along) => attr(g, 'aArm', 2, typeof along === 'function' ? along : [side, along]);
  tagArm(robe, 0, 0);
  const hood = lumpy(blob(0.95, 1.0, 1.0, [0, 4.05, -0.1], 18, 14), 0.05, 3, 5);
  const hp = hood.attributes.position; // carve the cowl opening: push front vertices inward
  for (let i = 0; i < hp.count; i++) {
    const x = hp.getX(i), y = hp.getY(i), z = hp.getZ(i);
    const front = z > 0.35 && Math.abs(x) < 0.62 && y < 4.55 && y > 3.35;
    if (front) { const k = 1 - Math.pow(Math.abs(x) / 0.62, 2) * 0.6; hp.setZ(i, z - 0.55 * k); }
  }
  hood.computeVertexNormals();
  tagArm(hood, 0, 0);
  const peak = tube(bezierPts([[0, 4.8, -0.3], [0, 5.5, -0.7], [0, 5.6, -1.4]], 8), (u) => 0.35 * (1 - u), 7);
  tagArm(peak, 0, 0);
  const collar = [];
  for (let k = 0; k < 14; k++) { const a = k / 14 * TAU; collar.push(spike([Math.cos(a) * 0.95, 3.25, Math.sin(a) * 0.95], [Math.cos(a), 0.55, Math.sin(a)], 0.14, 0.6 + (k % 3) * 0.2, 4)); }
  const col = mergeGeos(collar); tagArm(col, 0, 0);
  const parts = [robe, hood, peak, col], accent = [];
  for (const side of [1, -1]) {
    const pts = bezierPts([[side * 1.05, 3.1, 0], [side * 1.7, 2.2, 0.3], [side * 1.6, 1.0, 0.8]], 12);
    const sleeve = tube(pts, (u) => 0.34 - u * 0.12 + Math.max(0, Math.sin(u * 20)) * 0.03 * u, 8);
    tagArm(sleeve, side, (x, y, z, i) => [side, sleeve.attributes.uv.getX(i)]);
    parts.push(sleeve);
    for (let k = 0; k < 4; k++) {
      const c = spike([side * (1.5 + k * 0.06), 0.95, 0.75 + k * 0.08], [side * 0.15 * (k - 1.5), -1, 0.45], 0.05, 0.75, 4);
      tagArm(c, side, 1.05); accent.push(c);
    }
  }
  for (let k = 0; k < 7; k++) {
    const a = k / 7 * TAU + 0.3;
    const t = tube(bezierPts([[Math.cos(a) * 1.4, -0.2, Math.sin(a) * 1.4], [Math.cos(a) * 2.0, -0.6, Math.sin(a) * 2.0 - 0.6], [Math.cos(a) * 2.4, -0.9, Math.sin(a) * 2.2 - 1.5]], 8), (u) => 0.12 * (1 - u), 5);
    tagArm(t, 0, (x, y, z, i) => [0, -0.5 - t.attributes.uv.getX(i)]);
    parts.push(t);
  }
  const geo = mergeGeos(parts);
  // maw + eyes (glow)
  const maw = new THREE.TorusGeometry(0.3, 0.07, 6, 20); maw.scale(1, 1.5, 1); maw.translate(0, 3.85, 0.5);
  const core = blob(0.24, 0.38, 0.05, [0, 3.85, 0.45], 12, 8);
  const eyes = [maw, core];
  for (const side of [1, -1]) eyes.push(blob(0.09, 0.035, 0.03, [side * 0.22, 4.38, 0.55], 6, 5, [0, 0, side * -0.25]));
  const eg = mergeGeos(eyes); attr(eg, 'aArm', 2, [0, 0]);
  const dark = blob(0.5, 0.62, 0.08, [0, 3.95, 0.4], 14, 10); attr(dark, 'aArm', 2, [0, 0]);
  return { geo, eyes: eg, dark, accent: mergeGeos(accent) };
}
const WARDEN_PARS = /* glsl */`
uniform float uT, uMove, uAtk;
attribute vec2 aArm;
void gwDeform(inout vec3 p, inout vec3 n) {
  float low = clamp((0.6 - p.y) / 1.6, 0.0, 1.0);
  float a = atan(p.z, p.x);
  p.x += sin(uT * 1.6 + a * 5.0 + p.y) * 0.12 * low;
  p.z += cos(uT * 1.3 + a * 4.0) * 0.1 * low - low * uMove * 0.4;
  if (abs(aArm.x) > 0.5) {
    float u = clamp(aArm.y, 0.0, 1.2);
    float lift = uAtk * 1.3 + sin(uT * 1.1 + aArm.x) * 0.12;
    vec3 sh = vec3(aArm.x * 1.05, 3.1, 0.0);
    vec3 q = p - sh;
    float ang = -lift * aArm.x * (0.4 + u * 0.6);
    float c = cos(ang), s = sin(ang);
    q.xy = vec2(q.x * c - q.y * s, q.x * s + q.y * c);
    q.z += uAtk * 0.6 * u;
    p = sh + q;
  }
  if (aArm.y < -0.4) { float u = -aArm.y - 0.5; p.x += sin(uT * 2.0 + u * 4.0 + p.z) * 0.18 * u; p.y += sin(uT * 1.7 + u * 3.0) * 0.08 * u; }
}`;

// ------------------------------------------------------------------ factory
export function createCreatureFactory(ctx, models) {
  const cache = {};
  const variantCache = {};
  const wardenVariant = (id) => (id === 'the_shard_abbot' ? 'abbot' : id === 'the_lightless_ferryman' ? 'ferryman' : id === 'the_veiled_gardener' || id === 'the_sporeshroud' ? 'gardener' : 'wickeater');
  function wardenExtras(variant) {
    if (variantCache[variant]) return variantCache[variant];
    const glow = [], dark = [];
    const tagA = (g, side = 0, along = 0) => attr(g, 'aArm', 2, [side, along]);
    if (variant === 'wickeater') { // candle stubs set in the hem like teeth
      for (let k = 0; k < 11; k++) { const a = k / 11 * TAU + 0.15, r = 1.47, h = 0.22 + (k % 3) * 0.12; glow.push(tagA(xf(new THREE.CylinderGeometry(0.07, 0.085, h, 6), { p: [Math.cos(a) * r, 0.05 + h / 2, Math.sin(a) * r] }))); }
    } else if (variant === 'abbot') { // shelved crystal on the shoulders and back
      for (let k = 0; k < 9; k++) { const side = k % 2 ? 1 : -1, y = 2.6 + (k % 4) * 0.25; glow.push(tagA(spike([side * (0.6 + (k % 3) * 0.22), y, -0.35 - (k % 2) * 0.2], [side * 0.4, 1, -0.3], 0.1, 0.6 + (k % 3) * 0.25, 4))); }
    } else if (variant === 'ferryman') { // the pole for a boat that isn't there
      dark.push(tagA(xf(new THREE.CylinderGeometry(0.06, 0.06, 6.2, 6), { p: [1.62, 1.2, 0.85], r: [0.15, 0, -0.12] }), 1, 1.05));
    } else { // veiled gardener: hanging veils of mould
      for (let k = 0; k < 8; k++) { const a = -0.9 + k * 0.26; dark.push(tagA(tube(bezierPts([[Math.sin(a) * 0.85, 4.4, Math.cos(a) * 0.6], [Math.sin(a) * 1.0, 3.6, Math.cos(a) * 0.8], [Math.sin(a) * 1.05, 2.7, Math.cos(a) * 0.85]], 6), (u) => 0.06 * (1 - u * 0.6), 4))); }
    }
    return (variantCache[variant] = { glow: glow.length ? mergeGeos(glow) : null, dark: dark.length ? mergeGeos(dark) : null });
  }
  const geoFor = (kind) => {
    if (cache[kind]) return cache[kind];
    let r;
    if (kind === 'wisp') { const g = wispGeometry(1); r = { body: g, outline: smoothNormals(g), eyes: wispEyes() }; }
    else if (kind === 'mite') { const g = miteGeometry(1); r = { body: g, outline: smoothNormals(g), eyes: miteEyes() }; }
    else if (kind === 'moth') { r = mothGeometry(1); }
    else if (kind === 'eel') { const e = eelGeometry(1); r = { body: e.body, outline: smoothNormals(e.body), eyes: e.eyes }; }
    else if (kind === 'hand') { const h = handGeometry(); r = { body: h.geo, outline: smoothNormals(h.geo), eyes: null, fmats: h.fmats, accent: h.accent, rings: h.rings }; }
    else { const w = wardenGeometry(); r = { body: w.geo, outline: smoothNormals(w.geo), eyes: w.eyes, dark: w.dark, accent: w.accent }; }
    cache[kind] = r;
    return r;
  };
  const resolve = (kind, opts) => {
    const D = ctx.data || {};
    const enemy = D.ENEMY_BY_ID?.[kind] || (D.ENEMIES || []).find?.((e) => e.id === kind) || null;
    const k = enemy ? enemy.model : kind;
    const kk = KIND_DEFAULTS[k] ? k : 'wisp';
    const d = KIND_DEFAULTS[kk];
    const zone = opts?.zone ?? ctx.state?.run?.zone;
    const v = (enemy?.variants && zone && enemy.variants[zone]) || {};
    return { kind: kk, id: enemy?.id || null, tint: hexColor(opts?.tint ?? v.tint ?? enemy?.tint, d.tint), eye: hexColor(opts?.eyeColor ?? v.eyeColor ?? enemy?.eyeColor, d.eye), scale: opts?.scale ?? v.scale ?? enemy?.scale ?? 1, d };
  };

  function createCreature(kindIn = 'wisp', opts = {}) {
    const R = resolve(kindIn, opts);
    const kind = R.kind, G = geoFor(kind);
    const phase = '0.0';
    const U = { uT: { value: 0 }, uMove: { value: 0 }, uAtk: { value: 0 }, uArch: { value: 0 } };
    const FX = fxUniforms({ edge: R.eye, scale: kind === 'warden' ? 1.6 : kind === 'hand' ? 2.4 : 7 });
    const uniforms = { ...U, ...FX };
    let pars;
    if (kind === 'wisp') pars = WISP_PARS(phase);
    else if (kind === 'mite') pars = MITE_PARS(phase);
    else if (kind === 'moth') pars = MOTH_PARS(phase);
    else if (kind === 'eel') pars = EEL_PARS(phase);
    else if (kind === 'hand') {
      pars = HAND_PARS;
      uniforms.uCurl = { value: [0.25, 0.2, 0.22, 0.3, 0.2] };
      uniforms.uFM = { value: G.fmats };
    } else pars = WARDEN_PARS;
    const spec = { key: 'cr_' + kind, uniforms, pars, fx: 'uniform' };
    const mats = [];
    const object3d = new THREE.Group(); object3d.name = 'creature:' + kind;
    const rig = new THREE.Group(); object3d.add(rig);
    const scale = R.scale;
    rig.scale.setScalar(scale);
    const tint = new THREE.Color(R.tint);
    const pale = tint.getHSL({}).l > 0.45; // bone-pale variants (pale grasp, pyrewing)
    const bodyMat = deformToon(kind === 'moth'
      ? { color: tint, map: mothTextures().map, rim: 0.55, rimColor: GLOOM_RIM, side: THREE.DoubleSide, emissive: R.eye, emissiveIntensity: 1.15 }
      : { color: tint, rim: pale ? 0.3 : kind === 'warden' ? 0.7 : 0.9, rimColor: pale ? PALE : GLOOM_RIM, rimPower: kind === 'warden' ? 0.6 : 0.5, steps: 3 }, spec);
    if (kind === 'moth') { bodyMat.emissiveMap = mothTextures().ems; bodyMat.alphaTest = 0.45; }
    mats.push(bodyMat);
    const body = new THREE.Mesh(G.body, bodyMat); body.name = 'body';
    rig.add(body);
    const thick = kind === 'warden' ? 0.07 : kind === 'hand' ? 0.045 : kind === 'mite' ? 0.016 : 0.022;
    const om = deformOutline({ thickness: thick, color: pale ? 0x1a1610 : INK }, spec); mats.push(om);
    body.add(outlineMesh(G.outline, om));
    let eyeMat = null, eyes = null;
    if (G.eyes) {
      eyeMat = deformGlow(R.eye, kind === 'warden' ? 2.6 : 1.8, spec); mats.push(eyeMat);
      eyes = new THREE.Mesh(G.eyes, eyeMat); eyes.name = 'eyes'; rig.add(eyes);
    }
    if (G.accent) {
      const am = deformGlow(pale ? 0xc9a65a : 0xd8d2c0, pale ? 1.1 : 0.85, spec); mats.push(am);
      const acc = new THREE.Mesh(G.accent, am); acc.name = 'claws'; rig.add(acc);
      acc.add(outlineMesh(G.accent, om));
    }
    if (G.rings) {
      const rm = deformToon({ color: 0x9a7a3a, rim: 0.6, emissive: 0x24180a }, spec); mats.push(rm);
      rig.add(new THREE.Mesh(G.rings, rm));
    }
    if (kind === 'warden') {
      const X = wardenExtras(wardenVariant(R.id));
      if (X.glow) { const xm = deformGlow(R.id === 'the_shard_abbot' ? R.eye : 0xe9dfc6, R.id === 'the_shard_abbot' ? 1.3 : 0.75, spec); mats.push(xm); const m = new THREE.Mesh(X.glow, xm); m.add(outlineMesh(X.glow, om)); rig.add(m); }
      if (X.dark) { const m = new THREE.Mesh(X.dark, bodyMat); m.add(outlineMesh(X.dark, om)); rig.add(m); }
    }
    let darkMesh = null;
    if (G.dark) { const dm = deformToon({ color: 0x000000, rim: 0 }, spec); mats.push(dm); darkMesh = new THREE.Mesh(G.dark, dm); rig.add(darkMesh); }
    // hand: palm eye (separate so it can open/close)
    let palmEye = null, lid = null;
    if (kind === 'hand') {
      const em = new THREE.MeshBasicMaterial({ color: new THREE.Color(R.eye).multiplyScalar(2.4), toneMapped: false, fog: true }); mats.push(em);
      palmEye = new THREE.Group(); palmEye.position.set(0, 1.34, 0.19); rig.add(palmEye);
      palmEye.add(new THREE.Mesh(xf(new THREE.SphereGeometry(0.13, 14, 10), { s: [1.3, 0.75, 0.45] }), em));
      const pm = new THREE.MeshBasicMaterial({ color: 0x000000, fog: true }); mats.push(pm);
      const pupil = new THREE.Mesh(xf(new THREE.SphereGeometry(0.05, 8, 6), { s: [0.5, 1.4, 0.4], p: [0, 0, 0.05] }), pm); palmEye.add(pupil);
      const lm = deformToon({ color: tint, rim: 0.4 }, { key: 'lid', fx: 'uniform', uniforms: FX }); mats.push(lm);
      lid = new THREE.Mesh(xf(new THREE.SphereGeometry(0.16, 14, 8, 0, TAU, 0, Math.PI / 2), { s: [1.25, 0.9, 0.55], p: [0, 0, 0.0] }), lm);
      palmEye.add(lid);
    }
    // glow halo for warden maw / moth eye-spots
    const sprites = [];
    if (kind === 'warden') { const s = glowSprite({ color: R.eye, size: 2.4, opacity: 0.55 }); s.position.set(0, 3.9, 0.7); rig.add(s); sprites.push(s); }
    if (kind === 'wisp') { const s = glowSprite({ color: R.eye, size: 0.5, opacity: 0.25 }); s.position.set(0, 0.2, 0.3); rig.add(s); sprites.push(s); }
    const hover = R.d.hover;
    rig.position.y = hover;

    let t = Math.random() * 10, flash = 0, state = 'idle', stateT = 0, dieK = 0, curlT = 0, puffed = false, eyeK = 1;
    const curl = uniforms.uCurl?.value;
    const api = {
      object3d, radius: R.d.radius * scale, kind,
      hit() { flash = 1; },
      update(dt = 0.016, _t = 0, o = {}) {
        dt = Math.min(Math.max(dt || 0, 0), 0.1);
        t += dt;
        const st = o.state || 'idle';
        if (st !== state) { state = st; stateT = 0; if (st === 'hurt') flash = 1; if (st !== 'die') { puffed = false; } }
        stateT += dt;
        const k = Number.isFinite(o.k) ? THREE.MathUtils.clamp(o.k, 0, 1) : null;
        U.uT.value = t;
        flash = Math.max(0, flash - dt * 7);
        FX.uGwFlash.value = flash > 0 ? Math.min(1, flash * 1.4) : 0;
        const moving = st === 'move' ? 1 : 0;
        U.uMove.value = THREE.MathUtils.damp(U.uMove.value, moving, 4, dt);
        let atk = 0;
        if (st === 'attack') { const kk = k ?? Math.min(1, stateT / 0.9); atk = kk < 0.65 ? kk / 0.65 : Math.max(0, 1 - (kk - 0.65) / 0.35); }
        U.uAtk.value = THREE.MathUtils.damp(U.uAtk.value, atk, 12, dt);
        // dissolve
        if (st === 'die') {
          dieK = k ?? Math.min(1, stateT / (kind === 'warden' ? 2.4 : kind === 'hand' ? 1.4 : 0.7));
          if (!puffed) { puffed = true; models.puff?.(object3d.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, hover * scale + (kind === 'warden' ? 3 : kind === 'hand' ? 1.2 : 0.2), 0)), { color: R.eye, count: kind === 'warden' ? 26 : kind === 'hand' ? 16 : 8, size: kind === 'warden' ? 2.2 : 1 }); }
        } else dieK = THREE.MathUtils.damp(dieK, 0, 10, dt);
        FX.uGwDissolve.value = dieK;
        eyeK = THREE.MathUtils.damp(eyeK, st === 'die' ? 0 : st === 'attack' ? 1.6 : 1, 8, dt);
        if (eyeMat) eyeMat.color.set(R.eye).multiplyScalar((kind === 'warden' ? 2.6 : 1.8) * eyeK);
        for (const s of sprites) s.material.opacity = (kind === 'warden' ? 0.55 : 0.25) * Math.min(1.5, eyeK);
        // per-kind body motion
        const recoil = st === 'hurt' ? Math.max(0, 1 - stateT / 0.3) : 0;
        if (kind === 'wisp') {
          rig.position.y = hover + Math.sin(t * 2.1) * 0.07;
          rig.rotation.x = U.uMove.value * 0.3 - recoil * 0.4 + (st === 'attack' && atk === 0 && stateT > 0 ? 0.35 : 0);
          rig.position.z = (st === 'attack' ? (1 - atk) * (k ?? 0) * 0.5 : 0) - recoil * 0.2;
        } else if (kind === 'mite') {
          rig.position.y = hover + (st === 'attack' ? Math.sin(Math.min(1, (k ?? stateT)) * Math.PI) * 0.35 : 0);
          rig.rotation.x = -recoil * 0.5;
        } else if (kind === 'moth') {
          rig.position.y = hover + Math.sin(t * 3) * 0.12;
          rig.rotation.x = U.uMove.value * 0.25 + U.uAtk.value * 0.5 - recoil * 0.5;
          rig.rotation.z = Math.sin(t * 1.3) * 0.12;
        } else if (kind === 'eel') {
          let arch = 0, y = hover, pitch = 0;
          if (st === 'attack') { const kk = k ?? Math.min(1, stateT / 1.2); y = hover + Math.sin(kk * Math.PI) * 2.3; pitch = -Math.cos(kk * Math.PI) * 0.9; arch = Math.sin(kk * Math.PI); }
          U.uArch.value = THREE.MathUtils.damp(U.uArch.value, arch, 10, dt);
          rig.position.y = y; rig.rotation.x = pitch - recoil * 0.3;
        } else if (kind === 'hand') {
          let rise = 0, lean = Math.sin(t * 0.7) * 0.06, target = [0.25, 0.2, 0.22, 0.3, 0.2], lidOpen = 0.15;
          if (st === 'move') { const kk = k ?? Math.min(1, stateT / 1.0); rise = -3.2 * (1 - THREE.MathUtils.smootherstep(kk, 0, 1)); target = [0.9, 0.95, 0.95, 1.0, 0.7]; }
          if (st === 'idle') { curlT += dt; const f = 0.35 + Math.sin(curlT * 1.2) * 0.25; target = [f, f * 0.9, f, f * 1.1, 0.3]; lidOpen = 0.4; }
          if (st === 'attack') {
            const kk = k ?? Math.min(1, stateT / 1.1);
            if (kk < 0.65) { const r = kk / 0.65; lean = -0.55 * r; target = [-0.35 * r, -0.4 * r, -0.4 * r, -0.35 * r, -0.2]; lidOpen = 1; }
            else { const r = (kk - 0.65) / 0.35; lean = -0.55 + 1.85 * THREE.MathUtils.smoothstep(r, 0, 0.5); target = [1.4 * r, 1.5 * r, 1.5 * r, 1.4 * r, 1.0 * r]; lidOpen = 1; }
          }
          if (st === 'die') { rise = -3.4 * dieK; target = [1.2, 1.3, 1.3, 1.2, 0.9]; }
          if (st === 'hurt') { lean -= recoil * 0.25; lidOpen = 0; }
          for (let i = 0; i < 5; i++) curl[i] = THREE.MathUtils.damp(curl[i], target[i], st === 'attack' ? 10 : 4, dt);
          rig.position.y = rise + Math.sin(t * 0.9) * 0.05;
          rig.rotation.x = THREE.MathUtils.damp(rig.rotation.x, lean, st === 'attack' ? 12 : 4, dt);
          rig.rotation.z = Math.sin(t * 0.5) * 0.05;
          if (lid) lid.rotation.x = THREE.MathUtils.damp(lid.rotation.x, -lidOpen * 1.5, 8, dt);
        } else if (kind === 'warden') {
          rig.position.y = Math.sin(t * 0.8) * 0.15 - dieK * 1.5;
          rig.rotation.x = U.uMove.value * 0.12 - U.uAtk.value * 0.18 - recoil * 0.1;
          rig.rotation.z = Math.sin(t * 0.45) * 0.03;
          if (sprites[0]) sprites[0].scale.setScalar(2.4 * (1 + U.uAtk.value * 0.6));
        }
      },
      dispose() {
        object3d.parent?.remove(object3d);
        for (const m of mats) m.dispose();
        for (const s of sprites) s.material.dispose();
      },
    };
    api.update(0, 0, { state: 'idle' });
    return api;
  }
  return { createCreature, resolve };
}
