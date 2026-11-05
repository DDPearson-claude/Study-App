// models-fish.js — procedural fish for all 13 shapes (helper of models.js).
// Bodies are elliptical "lathe" tubes from per-shape profiles with hand-painted canvas
// skins (countershading, gills, patterns, glowing photophores); fins are ink-rimmed
// cards from one painted atlas; everything bends in the vertex shader (swim / struggle /
// flop) so a whole fish is ~5–7 draw calls. Geometry & textures are cached per species.
import * as THREE from 'three';
import { INK, PALE, glowSprite } from './toon.js';
import {
  TAU, deformToon, deformGlow, deformOutline, outlineMesh, xf, paint, mergeGeos, tube, bezierPts,
  curve1, spike, blob, hexColor,
} from './models-kit.js';
import { trueLengthM, MIN_LENGTH_M } from './models-size.js';

// ------------------------------------------------------------------ bend shader
const FISH_PARS = /* glsl */`
uniform float uT, uT2, uSwim, uStruggle, uFlop, uAmp, uWaveK, uRay, uPuff, uPulse;
uniform vec2 uAxis;
float gwLat(float s) {
  float w = s * s;
  float l = sin(s * uWaveK - uT) * w * uAmp * uSwim;
  l += sin(s * uWaveK * 1.35 - uT2 * 2.2) * w * uAmp * 1.9 * uStruggle;
  l += uFlop * w * 0.42 * sin(uT2 * 0.9);
  return l;
}
void gwDeform(inout vec3 p, inout vec3 n) {
  float s = clamp(0.5 - p.z, 0.0, 1.7);
  p.xy *= 1.0 + uPuff * 0.55 * (1.0 - smoothstep(0.78, 1.0, s));
  float bell = 1.0 - smoothstep(0.05, 0.34, s);
  p.xy *= 1.0 - bell * uPulse * (0.5 + 0.5 * sin(uT * 0.8));
  float l0 = gwLat(s);
  float d = (gwLat(s + 0.01) - l0) / 0.01;
  p.x += l0 * uAxis.x; p.y += l0 * uAxis.y;
  n.z += d * (n.x * uAxis.x + n.y * uAxis.y);
  n = normalize(n);
  float ax = abs(p.x);
  p.y += sin(ax * 7.0 + s * 4.5 - uT * 1.25) * ax * uRay * (0.35 + uSwim * 0.65 + uStruggle * 1.6);
}`;

// ------------------------------------------------------------------ fin atlas
const CELLS = { fork: 0, round: 1, veil: 2, spiny: 3, soft: 4, pect: 5, ribbon: 6, frill: 7 };
const FIN_PATHS = {
  fork: 'M0,46 Q50,34 124,4 Q104,38 76,64 Q104,90 124,124 Q50,94 0,82 Z',
  round: 'M0,44 C70,-2 128,22 124,64 C128,106 70,130 0,84 Z',
  veil: 'M0,42 C40,12 96,-2 126,10 C110,32 126,52 106,62 C126,74 110,96 126,116 C96,130 40,118 0,86 Z',
  spiny: 'M0,2 L104,6 Q82,22 120,30 Q86,44 122,56 Q88,68 116,82 Q84,94 100,108 Q60,118 0,126 Z',
  soft: 'M0,4 C70,-2 124,30 116,64 C110,98 70,128 0,124 Z',
  pect: 'M0,48 C60,8 126,22 124,60 C122,98 64,112 0,80 Z',
  ribbon: 'M0,0 L86,0 C104,14 78,30 94,46 C110,62 78,80 94,96 C108,110 92,122 84,128 L0,128 Z',
  frill: 'M0,0 L118,10 L70,26 L124,42 L70,58 L124,74 L70,90 L124,106 L70,120 L0,128 Z',
};
const FAN = new Set(['fork', 'round', 'veil', 'pect']);
let finAtlas = null;
function getFinAtlas() {
  if (finAtlas) return finAtlas;
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  for (const [type, cell] of Object.entries(CELLS)) {
    g.save();
    g.translate((cell % 4) * 128, ((cell / 4) | 0) * 128);
    const path = new Path2D(FIN_PATHS[type]);
    const grd = g.createLinearGradient(0, 0, 128, 0);
    grd.addColorStop(0, '#8c8c8c'); grd.addColorStop(0.55, '#dcdcdc'); grd.addColorStop(1, '#ffffff');
    g.fillStyle = grd; g.fill(path);
    g.save(); g.clip(path);
    g.strokeStyle = 'rgba(10,10,14,0.42)';
    if (FAN.has(type)) {
      g.lineWidth = 1.7;
      for (let a = -1.25; a <= 1.25; a += 0.13) { g.beginPath(); g.moveTo(-6, 64); g.lineTo(-6 + Math.cos(a) * 170, 64 + Math.sin(a) * 170); g.stroke(); }
    } else {
      g.lineWidth = type === 'spiny' ? 3 : 1.5;
      const step = type === 'spiny' ? 25 : type === 'frill' ? 16 : 9;
      for (let y = type === 'spiny' ? 6 : 4; y < 128; y += step) { g.beginPath(); g.moveTo(0, y); g.lineTo(130, y + (64 - y) * 0.12 - (type === 'spiny' ? 0 : 0)); g.stroke(); }
    }
    // soft translucent veins toward the tip
    const tip = g.createLinearGradient(70, 0, 128, 0);
    tip.addColorStop(0, 'rgba(255,255,255,0)'); tip.addColorStop(1, 'rgba(255,255,255,0.35)');
    g.fillStyle = tip; g.fillRect(0, 0, 128, 128);
    g.restore();
    g.lineJoin = 'round'; g.lineWidth = 5; g.strokeStyle = '#000'; g.stroke(path);
    g.restore();
  }
  finAtlas = new THREE.CanvasTexture(c);
  finAtlas.colorSpace = THREE.SRGBColorSpace;
  finAtlas.anisotropy = 2;
  finAtlas.userData.shared = true;
  return finAtlas;
}

/** Fin card: grid over the atlas cell, vertices mapped by map(u,v)->[x,y,z]. u: base→tip, v: span. */
function card(type, segU, segV, map) {
  const cell = CELLS[type] ?? 4, col = cell % 4, row = (cell / 4) | 0;
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= segV; j++) for (let i = 0; i <= segU; i++) {
    const u = i / segU, v = j / segV, p = map(u, v);
    pos.push(p[0], p[1], p[2]);
    const ul = 0.008 + u * 0.984, vl = 0.008 + v * 0.984;
    uv.push((col + ul) / 4, 1 - row / 2 - (1 - vl) / 2);
  }
  for (let j = 0; j < segV; j++) for (let i = 0; i < segU; i++) {
    const a = j * (segU + 1) + i, b = a + segU + 1;
    idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// ------------------------------------------------------------------ profiles & body
function prof(P) {
  const f = { w: curve1(P.w), ht: curve1(P.ht), hb: curve1(P.hb || P.ht), yc: P.yc ? curve1(P.yc) : () => 0 };
  f.top = (s) => f.yc(s) + f.ht(s);
  f.bot = (s) => f.yc(s) - f.hb(s);
  return f;
}

function bodyGeo(f, { R = 32, A = 18, ex = 2, s1 = 1 } = {}) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= R; i++) {
    const s = (i / R) * s1;
    const w = Math.max(0.0015, f.w(s)), ht = Math.max(0.0015, f.ht(s)), hb = Math.max(0.0015, f.hb(s)), yc = f.yc(s);
    for (let j = 0; j <= A; j++) {
      const v = j / A, th = -Math.PI / 2 + v * TAU;
      let c = Math.cos(th), sn = Math.sin(th);
      if (ex !== 2) { c = Math.sign(c) * Math.pow(Math.abs(c), 2 / ex); sn = Math.sign(sn) * Math.pow(Math.abs(sn), 2 / ex); }
      pos.push(w * c, yc + (sn >= 0 ? ht : hb) * sn, 0.5 - s);
      uv.push(i / R, v);
    }
  }
  const ring = A + 1;
  for (let i = 0; i < R; i++) for (let j = 0; j < A; j++) {
    const a = i * ring + j, b = a + ring;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  // caps
  const F = pos.length / 3; pos.push(0, f.yc(0), 0.5 + 0.002); uv.push(0, 0.5);
  for (let j = 0; j < A; j++) idx.push(F, j, j + 1);
  const Bk = pos.length / 3; pos.push(0, f.yc(s1), 0.5 - s1 - 0.003); uv.push(1, 0.5);
  const last = R * ring;
  for (let j = 0; j < A; j++) idx.push(Bk, last + j + 1, last + j);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const n = g.attributes.normal;
  for (let i = 0; i <= R; i++) { // weld the belly seam
    const a = i * ring, b = a + A;
    const x = n.getX(a) + n.getX(b), y = n.getY(a) + n.getY(b), z = n.getZ(a) + n.getZ(b), l = Math.hypot(x, y, z) || 1;
    n.setXYZ(a, x / l, y / l, z / l); n.setXYZ(b, x / l, y / l, z / l);
  }
  return g;
}

// fin placement helpers ---------------------------------------------------------
function finTail(f, type, { s = 0.97, len = 0.22, h = 0.3, y = 0 }) {
  const z0 = 0.5 - s + 0.012, yc = f.yc(Math.min(1, s)) + y;
  return card(type, 6, 4, (u, v) => [0, yc + (v - 0.5) * h, z0 - u * len]);
}
function finDorsal(f, type, { a, b, h, rake = 0.35, segV = 8, down = false }) {
  return card(type, 2, segV, (u, v) => {
    const s = b + (a - b) * v;
    const base = down ? f.bot(Math.min(1, s)) + 0.004 : f.top(Math.min(1, s)) - 0.004;
    return [0, base + (down ? -1 : 1) * u * h, 0.5 - s - u * h * rake];
  });
}
function finPect(f, type, { s, len, h, out = 0.75, down = 0.45, back = 0.75, yOff = -0.3, wf = 0.82 }) {
  const parts = [];
  for (const side of [1, -1]) {
    const base = [side * f.w(s) * wf, f.yc(s) + yOff * f.hb(s), 0.5 - s];
    const d = new THREE.Vector3(side * out, -down, -back).normalize();
    const sp = new THREE.Vector3(0, 0.3, 1).normalize();
    parts.push(card(type, 3, 3, (u, v) => [
      base[0] + sp.x * (v - 0.5) * h + d.x * u * len,
      base[1] + sp.y * (v - 0.5) * h + d.y * u * len,
      base[2] + sp.z * (v - 0.5) * h + d.z * u * len,
    ]));
  }
  return parts;
}
function makeFins(f, list) {
  const out = [];
  for (const [kind, type, o] of list) {
    if (kind === 'tail') out.push(finTail(f, type, o));
    else if (kind === 'dorsal') out.push(finDorsal(f, type, o));
    else if (kind === 'ventral') out.push(finDorsal(f, type, { ...o, down: true }));
    else if (kind === 'pect') out.push(...finPect(f, type, o));
    else if (kind === 'pelvic') out.push(...finPect(f, type, { out: 0.35, down: 0.9, back: 0.6, yOff: -0.85, wf: 0.4, ...o }));
  }
  return out;
}

// ------------------------------------------------------------------ shapes
// Each returns { f, body, fins[], extras[] (vertex-coloured), glows[] (glow colour), bones[],
//               eyes:{pos:[[x,y,z]...], r}, anim:{waveK, amp, freq, ray, axis}, extent, opts }
const C = (h) => new THREE.Color(h);

function standard(P, M) {
  const f = prof(P);
  const body = bodyGeo(f, { R: P.R || 32, A: P.A || 18, ex: P.ex || 2, s1: P.s1 || 1 });
  const fins = makeFins(f, P.fins || []);
  const e = P.eye || { s: 0.1, r: 0.025, up: 0.3 };
  const ex = f.w(e.s) * (e.out ?? 0.9), ey = f.yc(e.s) + f.ht(e.s) * e.up;
  return { f, body, fins, extras: [], glows: [], bones: [], eyes: { pos: [[ex, ey, 0.5 - e.s], [-ex, ey, 0.5 - e.s]], r: e.r }, anim: P.anim, gill: P.gill ?? 0.21, opts: {} };
}

function barbels(f, M, len = 0.12, s = 0.03) {
  const col = C(hexColor(M.fin, 0x333333)).multiplyScalar(0.8);
  const out = [];
  for (const side of [1, -1]) {
    const x = side * f.w(s) * 0.85, y = f.yc(s) - f.hb(s) * 0.4, z = 0.5 - s;
    const g = tube(bezierPts([[x, y, z], [x * 1.8, y - len * 0.35, z + len * 0.15], [x * 2.6, y - len * 0.75, z - len * 0.35]], 10), (u) => 0.006 * (1 - u * 0.8) + 0.001, 4);
    out.push(paint(g, col));
  }
  return out;
}

const SHAPES = {
  minnow(M) {
    return standard({
      w: [[0, 0.004], [0.03, 0.028], [0.12, 0.052], [0.32, 0.062], [0.58, 0.046], [0.82, 0.022], [0.93, 0.013], [1, 0.01]],
      ht: [[0, 0.004], [0.03, 0.03], [0.14, 0.072], [0.34, 0.092], [0.6, 0.068], [0.84, 0.03], [0.94, 0.02], [1, 0.016]],
      hb: [[0, 0.004], [0.03, 0.026], [0.16, 0.06], [0.38, 0.075], [0.62, 0.05], [0.84, 0.024], [1, 0.014]],
      fins: [['tail', 'fork', { s: 0.97, len: 0.24, h: 0.28 }], ['dorsal', 'soft', { a: 0.36, b: 0.54, h: 0.1 }],
        ['ventral', 'soft', { a: 0.6, b: 0.74, h: 0.055 }], ['pect', 'pect', { s: 0.2, len: 0.12, h: 0.06 }],
        ['pelvic', 'pect', { s: 0.45, len: 0.07, h: 0.04 }]],
      eye: { s: 0.085, r: 0.026, up: 0.32 }, anim: { waveK: 5, amp: 0.1, freq: 10 },
    }, M);
  },
  perch(M) {
    return standard({
      w: [[0, 0.004], [0.03, 0.03], [0.12, 0.06], [0.35, 0.082], [0.6, 0.06], [0.82, 0.026], [0.92, 0.016], [1, 0.012]],
      ht: [[0, 0.004], [0.03, 0.035], [0.12, 0.1], [0.32, 0.16], [0.55, 0.12], [0.8, 0.045], [0.92, 0.026], [1, 0.02]],
      hb: [[0, 0.004], [0.03, 0.03], [0.15, 0.09], [0.38, 0.115], [0.6, 0.08], [0.82, 0.03], [1, 0.016]],
      yc: [[0, -0.01], [0.3, 0], [1, 0]],
      fins: [['tail', 'fork', { s: 0.97, len: 0.22, h: 0.32 }], ['dorsal', 'spiny', { a: 0.2, b: 0.46, h: 0.16, rake: 0.25 }],
        ['dorsal', 'soft', { a: 0.5, b: 0.7, h: 0.1 }], ['ventral', 'soft', { a: 0.62, b: 0.76, h: 0.08 }],
        ['pect', 'pect', { s: 0.2, len: 0.14, h: 0.07 }], ['pelvic', 'pect', { s: 0.36, len: 0.09, h: 0.05 }]],
      eye: { s: 0.1, r: 0.032, up: 0.3 }, gill: 0.23, anim: { waveK: 4.2, amp: 0.08, freq: 8 },
    }, M);
  },
  carp(M) {
    const r = standard({
      w: [[0, 0.01], [0.03, 0.05], [0.12, 0.09], [0.38, 0.12], [0.62, 0.095], [0.84, 0.04], [0.93, 0.024], [1, 0.018]],
      ht: [[0, 0.01], [0.03, 0.05], [0.14, 0.12], [0.36, 0.18], [0.6, 0.14], [0.84, 0.05], [0.93, 0.03], [1, 0.026]],
      hb: [[0, 0.01], [0.03, 0.045], [0.15, 0.11], [0.4, 0.15], [0.62, 0.11], [0.84, 0.04], [1, 0.022]],
      yc: [[0, -0.02], [0.2, 0], [1, 0]],
      fins: [['tail', 'fork', { s: 0.97, len: 0.25, h: 0.38 }], ['dorsal', 'soft', { a: 0.3, b: 0.7, h: 0.11, rake: 0.2, segV: 10 }],
        ['ventral', 'soft', { a: 0.66, b: 0.78, h: 0.07 }], ['pect', 'pect', { s: 0.2, len: 0.14, h: 0.07 }],
        ['pelvic', 'pect', { s: 0.45, len: 0.08, h: 0.05 }]],
      eye: { s: 0.1, r: 0.024, up: 0.34 }, gill: 0.22, anim: { waveK: 3.4, amp: 0.065, freq: 6 },
    }, M);
    r.extras.push(...barbels(r.f, M, 0.09));
    return r;
  },
  koi(M) {
    const r = standard({
      w: [[0, 0.008], [0.03, 0.045], [0.12, 0.08], [0.38, 0.1], [0.62, 0.08], [0.84, 0.034], [0.93, 0.02], [1, 0.016]],
      ht: [[0, 0.008], [0.03, 0.045], [0.14, 0.1], [0.36, 0.14], [0.6, 0.11], [0.84, 0.04], [0.93, 0.026], [1, 0.02]],
      hb: [[0, 0.008], [0.03, 0.04], [0.15, 0.09], [0.4, 0.12], [0.62, 0.085], [0.84, 0.034], [1, 0.018]],
      yc: [[0, -0.015], [0.2, 0], [1, 0]],
      fins: [['tail', 'veil', { s: 0.96, len: 0.42, h: 0.5 }], ['dorsal', 'soft', { a: 0.3, b: 0.68, h: 0.12, rake: 0.3, segV: 10 }],
        ['ventral', 'veil', { a: 0.66, b: 0.8, h: 0.1, rake: 0.6 }], ['pect', 'veil', { s: 0.2, len: 0.2, h: 0.1 }],
        ['pelvic', 'veil', { s: 0.44, len: 0.14, h: 0.07 }]],
      eye: { s: 0.1, r: 0.022, up: 0.34 }, gill: 0.22, anim: { waveK: 3.4, amp: 0.07, freq: 5.5 },
    }, M);
    r.extras.push(...barbels(r.f, M, 0.14));
    r.opts.glowFins = true;
    return r;
  },
  pike(M) {
    return standard({
      w: [[0, 0.006], [0.04, 0.03], [0.1, 0.042], [0.2, 0.055], [0.45, 0.07], [0.7, 0.058], [0.88, 0.03], [1, 0.018]],
      ht: [[0, 0.004], [0.04, 0.016], [0.1, 0.028], [0.2, 0.055], [0.45, 0.078], [0.7, 0.07], [0.88, 0.04], [1, 0.024]],
      hb: [[0, 0.004], [0.04, 0.012], [0.12, 0.03], [0.25, 0.06], [0.5, 0.07], [0.72, 0.06], [0.88, 0.035], [1, 0.02]],
      fins: [['tail', 'fork', { s: 0.97, len: 0.18, h: 0.24 }], ['dorsal', 'soft', { a: 0.64, b: 0.82, h: 0.09 }],
        ['ventral', 'soft', { a: 0.66, b: 0.84, h: 0.075 }], ['pect', 'pect', { s: 0.24, len: 0.1, h: 0.05 }],
        ['pelvic', 'pect', { s: 0.5, len: 0.07, h: 0.04 }]],
      eye: { s: 0.15, r: 0.02, up: 0.55 }, gill: 0.26, R: 36, anim: { waveK: 4, amp: 0.07, freq: 7 },
    }, M);
  },
  eel(M) {
    return standard({
      w: [[0, 0.006], [0.02, 0.025], [0.06, 0.034], [0.12, 0.034], [0.5, 0.032], [0.8, 0.022], [0.95, 0.008], [1, 0.003]],
      ht: [[0, 0.006], [0.02, 0.024], [0.06, 0.036], [0.5, 0.034], [0.8, 0.024], [0.95, 0.01], [1, 0.003]],
      hb: [[0, 0.006], [0.02, 0.02], [0.06, 0.03], [0.5, 0.03], [0.8, 0.02], [0.95, 0.008], [1, 0.003]],
      fins: [['dorsal', 'ribbon', { a: 0.3, b: 1.0, h: 0.04, rake: 0, segV: 30 }], ['ventral', 'ribbon', { a: 0.5, b: 1.0, h: 0.03, rake: 0, segV: 24 }],
        ['pect', 'pect', { s: 0.08, len: 0.035, h: 0.025 }]],
      eye: { s: 0.035, r: 0.012, up: 0.45 }, gill: 0.07, R: 64, A: 12, anim: { waveK: 13, amp: 0.07, freq: 9 },
    }, M);
  },
  angler(M) {
    const r = standard({
      w: [[0, 0.12], [0.02, 0.18], [0.1, 0.25], [0.25, 0.26], [0.42, 0.2], [0.62, 0.11], [0.84, 0.05], [1, 0.035]],
      ht: [[0, 0.1], [0.02, 0.16], [0.12, 0.24], [0.28, 0.24], [0.45, 0.18], [0.65, 0.1], [0.85, 0.05], [1, 0.035]],
      hb: [[0, 0.12], [0.02, 0.18], [0.12, 0.22], [0.3, 0.2], [0.5, 0.14], [0.7, 0.07], [1, 0.03]],
      yc: [[0, -0.02], [0.3, 0], [1, 0]],
      fins: [['tail', 'round', { s: 0.97, len: 0.17, h: 0.22 }], ['dorsal', 'soft', { a: 0.55, b: 0.72, h: 0.08 }],
        ['ventral', 'soft', { a: 0.6, b: 0.74, h: 0.06 }], ['pect', 'pect', { s: 0.38, len: 0.13, h: 0.1, yOff: -0.1 }]],
      eye: { s: 0.14, r: 0.02, up: 0.55, out: 0.8 }, gill: 0.32, anim: { waveK: 3, amp: 0.06, freq: 5 },
    }, M);
    const f = r.f, mouthY = f.yc(0) - 0.04, mz = 0.5 + 0.01;
    // gaping maw + needle teeth
    r.extras.push(paint(blob(0.15, 0.1, 0.03, [0, mouthY, mz - 0.01], 14, 8, [-0.25, 0, 0]), 0x0a0507));
    const teeth = [];
    for (let k = 0; k <= 10; k++) {
      const a = -1.2 + (k / 10) * 2.4, x = Math.sin(a) * 0.13;
      teeth.push(spike([x, mouthY - Math.cos(a) * 0.08, mz + 0.012], [0, 1, 0.25], 0.008, 0.05 + (k % 2) * 0.02, 4));
      teeth.push(spike([x * 0.95, mouthY + Math.cos(a) * 0.075, mz + 0.006], [0, -1, 0.3], 0.007, 0.04 + ((k + 1) % 2) * 0.02, 4));
    }
    r.extras.push(paint(mergeGeos(teeth), 0xe8e0c8));
    // lure
    const t0 = f.top(0.12);
    const pts = bezierPts([[0, t0 - 0.01, 0.5 - 0.12], [0, t0 + 0.24, 0.5 - 0.06], [0, t0 + 0.26, 0.5 + 0.14], [0, t0 + 0.13, 0.5 + 0.21]], 14);
    r.extras.push(paint(tube(pts, (u) => 0.009 - u * 0.005, 5), C(hexColor(M.fin, 0x222222))));
    r.lure = [0, t0 + 0.11, 0.5 + 0.215];
    r.glows.push(blob(0.036, 0.04, 0.036, r.lure, 10, 8));
    return r;
  },
  puffer(M) {
    const r = standard({
      w: [[0, 0.04], [0.04, 0.14], [0.15, 0.28], [0.4, 0.34], [0.62, 0.28], [0.8, 0.13], [0.9, 0.06], [1, 0.04]],
      ht: [[0, 0.04], [0.04, 0.14], [0.15, 0.29], [0.4, 0.35], [0.62, 0.28], [0.8, 0.13], [0.9, 0.06], [1, 0.04]],
      hb: [[0, 0.04], [0.04, 0.13], [0.15, 0.27], [0.4, 0.33], [0.62, 0.26], [0.8, 0.12], [0.9, 0.055], [1, 0.04]],
      fins: [['tail', 'round', { s: 0.98, len: 0.13, h: 0.18 }], ['dorsal', 'soft', { a: 0.72, b: 0.86, h: 0.08 }],
        ['ventral', 'soft', { a: 0.72, b: 0.86, h: 0.07 }], ['pect', 'pect', { s: 0.25, len: 0.09, h: 0.08, out: 0.9, back: 0.3, yOff: 0 }]],
      eye: { s: 0.2, r: 0.045, up: 0.38, out: 0.86 }, gill: 0.3, A: 20, anim: { waveK: 2.2, amp: 0.05, freq: 6 },
    }, M);
    const f = r.f, sp = [];
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let k = 0; k < 64; k++) {
      const s = 0.12 + rnd() * 0.66, th = rnd() * TAU, c = Math.cos(th), sn = Math.sin(th);
      if (sn < -0.75) continue;
      const x = f.w(s) * c, y = f.yc(s) + (sn >= 0 ? f.ht(s) : f.hb(s)) * sn;
      sp.push(spike([x * 0.97, y * 0.97, 0.5 - s], [c, sn, -0.35], 0.011, 0.055 + rnd() * 0.025, 4));
    }
    r.extras.push(paint(mergeGeos(sp), C(hexColor(M.fin, 0x888888)).lerp(C(PALE), 0.35)));
    r.extras.push(paint(blob(0.035, 0.028, 0.025, [0, f.yc(0) - 0.01, 0.5 + 0.01]), 0xe8dcc0));
    return r;
  },
  ghost(M) {
    const r = standard({
      w: [[0, 0.006], [0.03, 0.035], [0.12, 0.06], [0.35, 0.072], [0.6, 0.055], [0.82, 0.026], [0.92, 0.015], [1, 0.012]],
      ht: [[0, 0.006], [0.03, 0.04], [0.14, 0.095], [0.34, 0.12], [0.6, 0.09], [0.84, 0.035], [0.93, 0.022], [1, 0.018]],
      hb: [[0, 0.006], [0.03, 0.035], [0.15, 0.08], [0.38, 0.1], [0.6, 0.07], [0.84, 0.028], [1, 0.015]],
      fins: [['tail', 'veil', { s: 0.96, len: 0.32, h: 0.38 }], ['dorsal', 'soft', { a: 0.3, b: 0.6, h: 0.11, segV: 8 }],
        ['ventral', 'soft', { a: 0.6, b: 0.76, h: 0.07 }], ['pect', 'pect', { s: 0.2, len: 0.13, h: 0.07 }]],
      eye: { s: 0.09, r: 0.03, up: 0.3 }, gill: 0.2, anim: { waveK: 4.5, amp: 0.08, freq: 6 },
    }, M);
    const f = r.f, bones = [];
    const spine = []; for (let i = 0; i <= 20; i++) { const s = 0.1 + i / 20 * 0.86; spine.push(new THREE.Vector3(0, f.yc(s) + f.ht(s) * 0.25, 0.5 - s)); }
    bones.push(tube(spine, (u) => 0.009 - u * 0.005, 5));
    for (let k = 0; k < 11; k++) {
      const s = 0.24 + k * 0.045, y0 = f.yc(s) + f.ht(s) * 0.25, w = f.w(s) * 0.8, hb = f.hb(s) * 0.82;
      for (const side of [1, -1]) {
        bones.push(tube(bezierPts([[0, y0, 0.5 - s], [side * w * 1.1, y0 - hb * 0.2, 0.5 - s - 0.02], [side * w * 0.5, y0 - hb * 1.05, 0.5 - s - 0.05]], 7), (u) => 0.0045 * (1 - u * 0.6), 3));
      }
      bones.push(spike([0, y0 + 0.004, 0.5 - s], [0, 1, -0.6], 0.004, f.ht(s) * 0.65, 3));
    }
    const sk = blob(0.05, 0.055, 0.075, [0, f.yc(0.1) + 0.005, 0.5 - 0.1]);
    bones.push(sk);
    bones.push(blob(0.035, 0.012, 0.06, [0, f.yc(0.05) - 0.03, 0.5 - 0.05]));
    r.bones = bones;
    r.opts.translucent = true;
    return r;
  },
  leviathan(M) {
    const r = standard({
      w: [[0, 0.012], [0.012, 0.04], [0.04, 0.068], [0.075, 0.072], [0.11, 0.058], [0.16, 0.06], [0.5, 0.062], [0.78, 0.046], [0.92, 0.024], [1, 0.006]],
      ht: [[0, 0.01], [0.012, 0.034], [0.04, 0.06], [0.08, 0.066], [0.12, 0.06], [0.5, 0.066], [0.78, 0.05], [0.92, 0.026], [1, 0.006]],
      hb: [[0, 0.012], [0.012, 0.036], [0.04, 0.058], [0.075, 0.06], [0.11, 0.05], [0.5, 0.056], [0.78, 0.042], [0.92, 0.022], [1, 0.006]],
      fins: [['pect', 'frill', { s: 0.17, len: 0.09, h: 0.06, yOff: -0.2 }], ['tail', 'frill', { s: 0.97, len: 0.09, h: 0.11 }],
        ['dorsal', 'frill', { a: 0.13, b: 0.92, h: 0.032, rake: 0.2, segV: 48 }], ['ventral', 'ribbon', { a: 0.55, b: 0.95, h: 0.02, rake: 0, segV: 20 }]],
      eye: { s: 0.055, r: 0.013, up: 0.52, out: 0.86 }, gill: 0.1, R: 84, A: 16, anim: { waveK: 10, amp: 0.045, freq: 3.6 },
    }, M);
    const f = r.f, plates = [], fangs = [];
    for (let k = 0; k < 28; k++) {
      const s = 0.1 + k * 0.03, w = f.w(s), top = f.top(s), sc = 1 - Math.abs(s - 0.45) * 0.6;
      plates.push(blob(w * 0.95 * sc, f.ht(s) * 0.42, 0.024, [0, top - f.ht(s) * 0.12, 0.5 - s], 10, 6, [-0.28, 0, 0]));
      if (k % 2 === 0) for (const side of [1, -1]) plates.push(blob(0.012, f.ht(s) * 0.3, 0.018, [side * w * 0.92, f.yc(s) + f.ht(s) * 0.35, 0.5 - s], 6, 5, [-0.2, 0, side * 0.4]));
    }
    r.extras.push(paint(mergeGeos(plates), C(hexColor(M.belly, PALE)).lerp(C(PALE), 0.3)));
    for (let k = 0; k < 7; k++) {
      const s = 0.008 + k * 0.009;
      for (const side of [1, -1]) {
        fangs.push(spike([side * f.w(s) * 0.85, f.yc(s) - f.hb(s) * 0.3, 0.5 - s], [side * 0.15, -1, 0.35], 0.004, 0.022 + (k === 1 ? 0.018 : 0), 4));
        fangs.push(spike([side * f.w(s) * 0.8, f.yc(s) - f.hb(s) * 0.15, 0.5 - s], [0, 1, 0.25], 0.0035, 0.014, 4));
      }
    }
    r.extras.push(paint(mergeGeos(fangs), 0xf2ead2));
    for (const side of [1, -1]) {
      const x = side * f.w(0.02) * 0.7, y = f.yc(0.02) - 0.01, z = 0.5 - 0.02;
      r.extras.push(paint(tube(bezierPts([[x, y, z], [x * 3, y - 0.03, z - 0.05], [x * 4, y - 0.01, z - 0.16], [x * 3, y + 0.02, z - 0.28]], 16), (u) => 0.005 * (1 - u * 0.85), 4), C(hexColor(M.fin, 0x8a8270))));
    }
    // jaw line
    r.extras.push(paint(tube(bezierPts([[f.w(0.005) * 0.9, f.yc(0.02) - 0.006, 0.497], [f.w(0.05), f.yc(0.05) - 0.01, 0.45], [f.w(0.085) * 0.95, f.yc(0.085), 0.41]], 8), 0.004, 4), 0x0a0806));
    r.extras.push(paint(tube(bezierPts([[-f.w(0.005) * 0.9, f.yc(0.02) - 0.006, 0.497], [-f.w(0.05), f.yc(0.05) - 0.01, 0.45], [-f.w(0.085) * 0.95, f.yc(0.085), 0.41]], 8), 0.004, 4), 0x0a0806));
    r.opts.manySpots = true;
    return r;
  },
  ray(M) {
    const P = {
      w: [[0, 0.04], [0.06, 0.18], [0.2, 0.36], [0.36, 0.44], [0.5, 0.38], [0.64, 0.2], [0.74, 0.06], [0.8, 0.025]],
      ht: [[0, 0.012], [0.1, 0.04], [0.3, 0.06], [0.5, 0.05], [0.7, 0.03], [0.8, 0.015]],
      hb: [[0, 0.01], [0.1, 0.025], [0.3, 0.035], [0.5, 0.03], [0.7, 0.02], [0.8, 0.012]],
    };
    const f = prof(P);
    const body = bodyGeo(f, { R: 26, A: 26, ex: 2.6, s1: 0.8 });
    const tailPts = []; for (let i = 0; i <= 14; i++) { const s = 0.76 + i / 14 * 0.8; tailPts.push(new THREE.Vector3(0, 0.008 + Math.sin(i * 0.5) * 0.004, 0.5 - s)); }
    const extras = [paint(tube(tailPts, (u) => 0.014 * (1 - u) + 0.0015, 5), C(hexColor(M.body, 0x333333)).multiplyScalar(0.8))];
    const fins = [card('soft', 2, 3, (u, v) => { const s = 0.92 - v * 0.08; return [0, 0.012 + u * 0.045, 0.5 - s - u * 0.02]; })];
    const ey = f.top(0.16) - 0.004;
    return { f, body, fins, extras, glows: [], bones: [], eyes: { pos: [[0.075, ey, 0.5 - 0.16], [-0.075, ey, 0.5 - 0.16]], r: 0.022 }, anim: { waveK: 2, amp: 0.03, freq: 4.5, ray: 0.14 }, gill: -1, opts: { ray: true } };
  },
  crayfish(M) {
    const body = C(hexColor(M.body, 0x5b4a3e)), belly = C(hexColor(M.belly, 0xb8a07a)), fin = C(hexColor(M.fin, 0x2f2620));
    const shell = (g, base = body) => paint(g, (x, y) => base.clone().lerp(belly, y < -0.01 ? 0.6 : 0));
    const parts = [];
    parts.push(shell(blob(0.09, 0.075, 0.17, [0, 0.01, 0.28], 16, 10)));
    parts.push(paint(spike([0, 0.03, 0.42], [0, 0.05, 1], 0.02, 0.07, 5), body));
    let z = 0.11;
    for (let k = 0; k < 6; k++) {
      const sc = 1 - k * 0.1;
      parts.push(shell(blob(0.082 * sc, 0.058 * sc, 0.05, [0, 0.01 - k * 0.006, z], 12, 8), k % 2 ? body.clone().multiplyScalar(0.72) : body));
      z -= 0.066;
    }
    const zt = z + 0.03;
    const fan = card('round', 3, 4, (u, v) => [(v - 0.5) * 0.2 * (0.5 + u * 0.6), -0.03 + u * 0.01, zt - u * 0.12]);
    const legs = [], claws = [];
    for (const side of [1, -1]) {
      const arm = bezierPts([[side * 0.07, -0.01, 0.37], [side * 0.15, 0.0, 0.44], [side * 0.14, 0.0, 0.56]], 8);
      claws.push(tube(arm, 0.018, 6));
      claws.push(blob(0.05, 0.032, 0.095, [side * 0.155, 0.0, 0.66], 12, 8, [0, side * -0.12, 0]));
      claws.push(blob(0.022, 0.02, 0.075, [side * 0.11, 0.0, 0.69], 8, 6, [0, side * 0.25, 0]));
      for (let k = 0; k < 4; k++) {
        const lz = 0.33 - k * 0.055;
        legs.push(tube(bezierPts([[side * 0.07, -0.03, lz], [side * 0.15, -0.05, lz - 0.01], [side * 0.2, -0.13, lz - 0.04]], 6), (u) => 0.008 * (1 - u * 0.6), 4));
      }
      legs.push(tube(bezierPts([[side * 0.03, 0.03, 0.44], [side * 0.12, 0.09, 0.75], [side * 0.3, 0.07, 0.62], [side * 0.42, 0.0, 0.3]], 18), (u) => 0.006 * (1 - u * 0.8), 4));
      legs.push(blob(0.016, 0.016, 0.016, [side * 0.045, 0.05, 0.44], 6, 5));
    }
    const extras = [paint(mergeGeos(claws), body.clone().multiplyScalar(0.85)), paint(mergeGeos(legs), fin)];
    const bodyG = mergeGeos(parts);
    return { f: null, body: bodyG, fins: [fan], extras, glows: [], bones: [], eyes: { pos: [[0.045, 0.058, 0.452], [-0.045, 0.058, 0.452]], r: 0.012 },
      anim: { waveK: 3, amp: 0.05, freq: 7, axis: [0, 1] }, gill: -1, opts: { vertexBody: true }, extentZ: 0.74 };
  },
  jelly(M) {
    const pts = [[0.0, 0.5], [0.1, 0.49], [0.19, 0.45], [0.26, 0.38], [0.3, 0.3], [0.31, 0.22], [0.295, 0.18], [0.27, 0.17]];
    const bell = new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), 28);
    bell.rotateX(Math.PI / 2);
    const pos = bell.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      if (z < 0.24) { const a = Math.atan2(y, x), k = 1 + Math.sin(a * 8) * 0.06 * (0.24 - z) / 0.07; pos.setXYZ(i, x * k, y * k, z - Math.max(0, Math.sin(a * 8)) * 0.02); }
    }
    bell.computeVertexNormals();
    const tent = [], arms = [];
    for (let k = 0; k < 12; k++) {
      const a = k / 12 * TAU, r = 0.27, x = Math.cos(a) * r, y = Math.sin(a) * r, p = [];
      for (let i = 0; i <= 14; i++) { const u = i / 14; p.push(new THREE.Vector3(x * (1 - u * 0.35) + Math.sin(u * 7 + k) * 0.02, y * (1 - u * 0.35), 0.17 - u * (0.55 + (k % 3) * 0.08))); }
      tent.push(tube(p, (u) => 0.006 * (1 - u * 0.7), 3));
    }
    for (let k = 0; k < 4; k++) {
      const a = k / 4 * TAU + 0.4, p = [];
      for (let i = 0; i <= 16; i++) { const u = i / 16; p.push(new THREE.Vector3(Math.cos(a) * 0.05 * (1 + u) + Math.sin(u * 9 + k) * 0.03, Math.sin(a) * 0.05 * (1 + u), 0.22 - u * 0.5)); }
      arms.push(tube(p, (u) => 0.022 * (1 - u * 0.6) * (0.75 + 0.25 * Math.sin(u * 30)), 5));
    }
    const glows = [blob(0.11, 0.11, 0.07, [0, 0, 0.3], 12, 8)];
    for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + 0.78; glows.push(blob(0.05, 0.03, 0.02, [Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0.27], 8, 6, [0, 0, a])); }
    return { f: null, body: bell, fins: [], extras: [paint(mergeGeos(tent), hexColor(M.fin, 0xff7fb0)), paint(mergeGeos(arms), C(hexColor(M.belly, 0xfff0f6)))], glows, bones: [],
      eyes: null, anim: { waveK: 9, amp: 0.06, freq: 4 }, gill: -1, opts: { translucent: true, jelly: true }, extentZ: 1.0 };
  },
};

// ------------------------------------------------------------------ skins
function cssColor(c) { return '#' + c.getHexString(); }
function bodyTexture(M, shape, parts) {
  const W = 256, H = 128;
  const body = C(hexColor(M.body, 0x6e7684)), belly = C(hexColor(M.belly, 0xd8d8d0)), fin = C(hexColor(M.fin, 0x333840));
  const glow = M.glow !== null && M.glow !== undefined;
  const map = document.createElement('canvas'); map.width = W; map.height = H;
  const g = map.getContext('2d');
  // countershading per row: y=0 belly, 32 -x flank, 64 back, 96 +x flank, 128 belly
  const tmp = new THREE.Color();
  for (let y = 0; y < H; y++) {
    const v = 1 - (y + 0.5) / H, th = -Math.PI / 2 + v * TAU, up = Math.sin(th);
    const t = THREE.MathUtils.smoothstep(up, -0.5, 0.45);
    tmp.copy(belly).lerp(body, t).multiplyScalar(1 - 0.32 * Math.max(0, up) ** 2);
    g.fillStyle = cssColor(tmp); g.fillRect(0, y, W, 1);
  }
  const yP = (a) => H * (0.75 - a), yM = (a) => H * (0.25 + a); // a: -0.25 belly … +0.25 back
  let seed = (shape.length * 977 + Math.round((M.scale || 1) * 100)) | 0;
  const rnd = () => { seed = (seed * 16807 + 11) % 2147483647; return (seed & 0xffff) / 0xffff; };
  const dark = body.clone().multiplyScalar(0.42), darkCss = `rgba(${dark.r * 255 | 0},${dark.g * 255 | 0},${dark.b * 255 | 0},0.75)`;
  const pat = M.pattern || 'none';
  const ems = glow ? document.createElement('canvas') : null;
  let eg = null;
  if (ems) { ems.width = W; ems.height = H; eg = ems.getContext('2d'); eg.fillStyle = '#000'; eg.fillRect(0, 0, W, H); }
  const dot = (ctx2, x, y, r, col) => { ctx2.fillStyle = col; ctx2.beginPath(); ctx2.arc(x, y, r, 0, TAU); ctx2.fill(); };
  if (pat === 'stripes') {
    const n = shape === 'ray' ? 5 : 6;
    for (let k = 0; k < n; k++) {
      const x = W * (0.24 + k * (0.62 / n)), wdt = 6 + rnd() * 4;
      g.fillStyle = darkCss; g.beginPath();
      g.moveTo(x - wdt * 0.2, yM(-0.06)); g.quadraticCurveTo(x - wdt, H / 2, x - wdt * 0.2, yP(-0.06));
      g.lineTo(x + wdt * 0.3, yP(-0.03)); g.quadraticCurveTo(x + wdt * 0.6, H / 2, x + wdt * 0.3, yM(-0.03)); g.closePath(); g.fill();
    }
  } else if (pat === 'bands') {
    const n = shape === 'eel' ? 11 : 7;
    for (let k = 0; k < n; k++) { const x = W * (0.12 + k * (0.84 / n)); g.fillStyle = darkCss; g.fillRect(x, 0, W * 0.035, H); }
  } else if (pat === 'scales') {
    g.lineWidth = 1.1;
    for (let y = 2; y < H; y += 6) for (let x = W * 0.16 + ((y / 6) % 2) * 3; x < W * 0.96; x += 6) {
      g.strokeStyle = 'rgba(0,0,0,0.26)'; g.beginPath(); g.arc(x, y, 3.4, -Math.PI / 2, Math.PI / 2); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.08)'; g.beginPath(); g.arc(x - 1, y, 2.4, -Math.PI / 2, Math.PI / 2); g.stroke();
    }
  } else if (pat === 'spots') {
    if (shape === 'koi') {
      const pc = cssColor(fin.clone().lerp(C(0xff6a30), 0.25));
      for (let k = 0; k < 9; k++) {
        const x = W * (0.12 + rnd() * 0.75), a = -0.02 + rnd() * 0.27, r = 9 + rnd() * 12;
        for (const y of [yP(a), yM(a)]) { g.fillStyle = pc; g.beginPath(); for (let i = 0; i < 9; i++) { const ang = i / 9 * TAU, rr = r * (0.7 + rnd() * 0.5); g.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr * 0.8); } g.closePath(); g.fill(); }
      }
    } else {
      for (let k = 0; k < 46; k++) {
        const x = W * (0.12 + rnd() * 0.82), a = -0.08 + rnd() * 0.33, r = 1.6 + rnd() * 3.2;
        const col = rnd() < 0.5 ? darkCss : 'rgba(255,255,255,0.28)';
        dot(g, x, yP(a), r, col); dot(g, x, yM(a), r, col);
        if (eg && rnd() < 0.55) { dot(eg, x, yP(a), r * 0.9, '#fff'); dot(eg, x, yM(a), r * 0.9, '#fff'); }
      }
    }
  }
  // lateral line
  g.strokeStyle = 'rgba(255,255,255,0.22)'; g.setLineDash([3, 3]); g.lineWidth = 1.2;
  for (const y of [yP(0.02), yM(0.02)]) { g.beginPath(); g.moveTo(W * 0.22, y); g.quadraticCurveTo(W * 0.55, y + (y > 64 ? -3 : 3), W * 0.95, y); g.stroke(); }
  g.setLineDash([]);
  // gill arcs + mouth
  if (parts.gill > 0) {
    g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 2.4;
    const gx = W * parts.gill;
    g.beginPath(); g.moveTo(gx - 4, yP(0.2)); g.quadraticCurveTo(gx + 7, yP(0.02), gx - 3, yP(-0.17)); g.stroke();
    g.beginPath(); g.moveTo(gx - 4, yM(0.2)); g.quadraticCurveTo(gx + 7, yM(0.02), gx - 3, yM(-0.17)); g.stroke();
    g.lineWidth = 2;
    for (const y of [yP(-0.04), yM(-0.04)]) { g.beginPath(); g.moveTo(0, y); g.lineTo(W * 0.045, y + (y > 64 ? 1.5 : -1.5)); g.stroke(); }
  }
  // inked snout & tail darkening
  const ink = g.createLinearGradient(0, 0, W, 0);
  ink.addColorStop(0, 'rgba(0,0,0,0.35)'); ink.addColorStop(0.06, 'rgba(0,0,0,0)'); ink.addColorStop(0.9, 'rgba(0,0,0,0)'); ink.addColorStop(1, 'rgba(0,0,0,0.4)');
  g.fillStyle = ink; g.fillRect(0, 0, W, H);
  // photophores
  if (eg) {
    const n = parts.opts.manySpots ? 26 : 12;
    for (let k = 0; k < n; k++) {
      const x = W * (0.22 + k * (0.7 / n));
      for (const y of [yP(-0.07), yM(-0.07)]) { dot(eg, x, y, 2.4, '#fff'); dot(g, x, y, 2.6, 'rgba(255,255,255,0.5)'); }
      if (parts.opts.manySpots && k % 2) for (const y of [yP(0.1), yM(0.1)]) dot(eg, x, y, 1.8, '#fff');
    }
    if (parts.opts.translucent) { eg.fillStyle = 'rgba(255,255,255,0.55)'; eg.fillRect(0, 0, W, H); }
  }
  const tex = new THREE.CanvasTexture(map); tex.colorSpace = THREE.SRGBColorSpace; tex.userData.shared = true;
  let etex = null;
  if (ems) { etex = new THREE.CanvasTexture(ems); etex.colorSpace = THREE.SRGBColorSpace; etex.userData.shared = true; }
  return { map: tex, emissiveMap: etex };
}

function eyeGeos(eyes, type, glowCol) {
  if (!eyes) return { basic: null, glow: null };
  const r = eyes.r, basic = [], glow = [];
  for (const [x, y, z] of eyes.pos) {
    const side = Math.sign(x) || 1;
    if (type === 'glow') {
      glow.push(blob(r * 1.05, r * 1.05, r * 1.05, [x, y, z], 10, 8));
      basic.push(paint(blob(r * 0.22, r * 0.7, r * 0.3, [x + side * r * 0.85, y, z + r * 0.1], 6, 6), 0x050403));
    } else if (type === 'blind') {
      basic.push(paint(blob(r * 1.08, r * 1.08, r * 1.08, [x, y, z], 10, 8), (px, py) => (py > y + r * 0.3 ? 0xf2f0e6 : 0xbcc0c8)));
    } else {
      basic.push(paint(blob(r, r, r, [x, y, z], 10, 8), 0xd8d0b0));
      basic.push(paint(blob(r * 0.7, r * 0.7, r * 0.7, [x + side * r * 0.42, y, z + r * 0.05], 8, 6), 0x050505));
      basic.push(paint(blob(r * 0.2, r * 0.2, r * 0.2, [x + side * r * 0.95, y + r * 0.35, z + r * 0.3], 5, 4), 0xffffff));
    }
  }
  return { basic: basic.length ? mergeGeos(basic) : null, glow: glow.length ? mergeGeos(glow) : null };
}

// ------------------------------------------------------------------ factory
const WARM_RIM = new THREE.Color(0xffc98e), WARM_FILL = new THREE.Color(0x2c1a0c);
// setSilhouette: the unidentified fish of the bite and the fight (v3 auto-fishing): a dark shape at its true size, nothing of
// its species (colours, pattern, glows, eyes) showing until it is landed
const SIL_INK = new THREE.Color(0x0c0b14), SIL_RIM = new THREE.Color(0x6e7396);
const DEFAULT_MODEL = { shape: 'minnow', body: 0x7a8494, belly: 0xdde2e8, fin: 0x3c4452, glow: null, pattern: 'scales', eyes: 'normal', scale: 0.6 };

export function createFishFactory(ctx) {
  const cache = new Map();
  const speciesOf = (x) => {
    if (x && typeof x === 'object') return x;
    const D = ctx.data || {};
    return D.SPECIES_BY_ID?.[x] || (D.SPECIES || []).find((s) => s.id === x) || null;
  };

  function build(sp) {
    const M = { ...DEFAULT_MODEL, ...(sp?.model || {}) };
    const shape = SHAPES[M.shape] ? M.shape : (typeof sp === 'string' && SHAPES[sp] ? sp : 'minnow');
    const key = (sp?.id || 'anon') + '|' + shape + '|' + [M.body, M.belly, M.fin, M.glow, M.pattern, M.eyes].join(',');
    if (cache.has(key)) return cache.get(key);
    const parts = SHAPES[shape](M);
    const glowCol = hexColor(M.glow, 0xffd9a0);
    const skin = parts.opts.vertexBody ? { map: null, emissiveMap: null } : bodyTexture(M, shape, parts);
    const eyes = eyeGeos(parts.eyes, M.eyes, glowCol);
    const fins = parts.fins.length ? mergeGeos(parts.fins) : null;
    const extras = parts.extras.length ? mergeGeos(parts.extras) : null;
    const glows = parts.glows.length ? mergeGeos(parts.glows) : null;
    const bones = parts.bones.length ? mergeGeos(parts.bones) : null;
    // visual extent along z (body + fins) for size normalisation
    let extentZ = parts.extentZ;
    const bb = new THREE.Box3().setFromBufferAttribute(parts.body.attributes.position);
    if (fins) { fins.computeBoundingBox(); bb.union(fins.boundingBox); }
    if (extras && parts.opts.ray) { extras.computeBoundingBox(); bb.union(extras.boundingBox); }
    if (!extentZ) extentZ = Math.max(0.3, bb.max.z - bb.min.z);
    // v3 true scale measures what the size model calls length (CONTRACT §13.7): snout to tail tip over body and fins (a ray
    // with its tail, a jelly bell and trailing arms), never the authored extentZ: claws, barbels and lure stalks reach past it
    if (extras && parts.opts.jelly) { extras.computeBoundingBox(); bb.union(extras.boundingBox); }
    const ext = { maxZ: bb.max.z, minZ: bb.min.z, halfW: Math.max(Math.abs(bb.min.x), Math.abs(bb.max.x)), maxY: bb.max.y, minY: bb.min.y };
    const extentTrue = Math.max(1e-3, bb.max.z - bb.min.z);
    const entry = { M, shape, parts, skin, eyes, fins, extras, glows, bones, extentZ, extentTrue, ext, glowCol, hasGlow: M.glow !== null && M.glow !== undefined };
    cache.set(key, entry);
    return entry;
  }

  // v3 honest stretched scale (models-size.js): {z} / {lengthCm} / a v3 weight → true metres; null for v1 / v2 species
  const trueLength = (sp, arg) => trueLengthM(sp, arg, { data: ctx.data, zone: ctx.state?.run?.zone ?? null });

  function createFish(speciesOrId, weightKg = 1) {
    const sp = speciesOf(speciesOrId) || (typeof speciesOrId === 'string' && SHAPES[speciesOrId] ? { id: 'shape_' + speciesOrId, model: { ...DEFAULT_MODEL, shape: speciesOrId } } : null);
    const E = build(sp);
    const M = E.M, P = E.parts;
    let L = trueLength(sp, weightKg);
    // an exact {lengthCm} sizes any model truly (e.g. a nameless shape, createFish('minnow', {lengthCm}), for a silhouette)
    if (L === null && weightKg && typeof weightKg === 'object' && Number(weightKg.lengthCm) > 0) L = Math.max(MIN_LENGTH_M, weightKg.lengthCm / 100);
    const trueScale = L !== null;
    if (L === null) {   // v1 / v2: the weight picks a length within the model's ±22% band (0.12 m floor)
      const range = Array.isArray(sp?.weight) ? sp.weight : [weightKg, weightKg];
      const wt = Number.isFinite(weightKg) ? weightKg : (range[0] + range[1]) / 2;
      const tt = range[1] > range[0] ? THREE.MathUtils.clamp((wt - range[0]) / (range[1] - range[0]), -0.2, 1.3) : 0.5;
      L = Math.max(0.12, (M.scale || 0.6) * (0.78 + 0.44 * tt));
    }
    const anim = P.anim || { waveK: 4, amp: 0.08, freq: 7 };
    const U = {
      uT: { value: 0 }, uT2: { value: 0 }, uSwim: { value: 1 }, uStruggle: { value: 0 }, uFlop: { value: 0 },
      uAmp: { value: anim.amp }, uWaveK: { value: anim.waveK }, uRay: { value: anim.ray || 0 }, uPuff: { value: 0 }, uPulse: { value: P.opts.jelly ? 0.12 : 0 },
      uAxis: { value: new THREE.Vector2(...(anim.axis || [1, 0])) },
    };
    const spec = { key: 'fish', uniforms: U, pars: FISH_PARS, fx: 'none' };
    const object3d = new THREE.Group(); object3d.name = 'fish:' + (sp?.id || E.shape);
    const pivot = new THREE.Group(); object3d.add(pivot);
    const scaler = new THREE.Group(); pivot.add(scaler);
    const k = L / (trueScale ? E.extentTrue : E.extentZ);
    scaler.scale.setScalar(k);
    const translucent = !!P.opts.translucent;
    const glowBase = E.hasGlow ? (translucent ? 0.9 : 1.6) : 0;
    const thick = THREE.MathUtils.clamp(0.012 / L, 0.006, 0.016) * (E.shape === 'leviathan' ? 0.6 : 1);
    const mats = [];
    const outline = deformOutline({ thickness: thick }, spec); mats.push(outline);
    // body
    const bodyMat = deformToon({
      color: P.opts.vertexBody ? 0xffffff : 0xffffff, map: E.skin.map, vertexColors: !!P.opts.vertexBody,
      emissive: E.hasGlow ? E.glowCol : 0x000000, emissiveIntensity: glowBase, rim: translucent ? 0.7 : 0.42,
      rimColor: translucent ? E.glowCol : PALE, transparent: translucent, opacity: P.opts.jelly ? 0.6 : translucent ? 0.4 : 1,
      side: P.opts.jelly ? THREE.DoubleSide : THREE.FrontSide,
    }, spec);
    if (E.skin.emissiveMap) bodyMat.emissiveMap = E.skin.emissiveMap;
    if (translucent) bodyMat.depthWrite = false;
    if (P.opts.jelly) { bodyMat.emissive.set(E.glowCol); bodyMat.emissiveIntensity = 0.55; bodyMat.color.set(hexColor(M.body, 0xe8b3d0)); }
    mats.push(bodyMat);
    const body = new THREE.Mesh(P.body, bodyMat); body.name = 'body';
    if (translucent) body.renderOrder = 2;
    scaler.add(body);
    if (!translucent) body.add(outlineMesh(P.body, outline));
    // fins
    if (E.fins) {
      const fm = deformToon({ color: translucent ? new THREE.Color(hexColor(M.fin, 0x333840)).lerp(new THREE.Color(PALE), 0.55) : hexColor(M.fin, 0x333840), map: getFinAtlas(), side: THREE.DoubleSide, rim: 0.25, transparent: translucent, opacity: translucent ? 0.45 : 1,
        emissive: (P.opts.glowFins || translucent) && E.hasGlow ? E.glowCol : 0x000000, emissiveIntensity: (P.opts.glowFins || translucent) && E.hasGlow ? 0.45 : 0 }, spec);
      fm.alphaTest = 0.45;
      if (translucent) fm.depthWrite = false;
      mats.push(fm);
      const fins = new THREE.Mesh(E.fins, fm); fins.name = 'fins'; if (translucent) fins.renderOrder = 3;
      scaler.add(fins);
    }
    // extras (teeth, barbels, spines, plates, lure stalk, tentacles…)
    if (E.extras) {
      const xm = deformToon({ color: 0xffffff, vertexColors: true, rim: 0.4, transparent: !!P.opts.jelly, opacity: P.opts.jelly ? 0.7 : 1,
        emissive: P.opts.jelly ? E.glowCol : 0x000000, emissiveIntensity: P.opts.jelly ? 0.6 : 0 }, spec);
      if (P.opts.jelly) xm.depthWrite = false;
      mats.push(xm);
      const ex = new THREE.Mesh(E.extras, xm); ex.name = 'extras';
      scaler.add(ex);
      if (!P.opts.jelly) ex.add(outlineMesh(E.extras, outline));
    }
    // glowing bits
    let glowMat = null;
    if (E.glows) {
      glowMat = deformGlow(E.glowCol, 2.6, spec, P.opts.jelly ? { transparent: true, opacity: 0.85, depthWrite: false } : {});
      mats.push(glowMat);
      const gm = new THREE.Mesh(E.glows, glowMat); gm.name = 'glow'; if (P.opts.jelly) gm.renderOrder = 1;
      scaler.add(gm);
    }
    let boneMat = null;
    if (E.bones) {
      boneMat = deformGlow(hexColor(M.glow, 0xeae4d3), 1.05, spec);
      mats.push(boneMat);
      const bm = new THREE.Mesh(E.bones, boneMat); bm.name = 'bones';
      scaler.add(bm);
      bm.add(outlineMesh(E.bones, outline));
    }
    // eyes
    let eyeGlowMat = null, eyeMat = null;
    if (E.eyes.basic) {
      const em = new THREE.MeshBasicMaterial({ vertexColors: true, fog: true }); mats.push(em); eyeMat = em;
      scaler.add(new THREE.Mesh(E.eyes.basic, em));
    }
    if (E.eyes.glow) {
      eyeGlowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(E.glowCol).multiplyScalar(2.8), toneMapped: false, fog: true }); mats.push(eyeGlowMat);
      scaler.add(new THREE.Mesh(E.eyes.glow, eyeGlowMat));
    }
    // halos for lures / jelly cores
    const sprites = [];
    if (P.lure) {
      const s = glowSprite({ color: E.glowCol, size: 0.32, opacity: 0.8 }); s.position.set(...P.lure); scaler.add(s); sprites.push(s);
    }
    if (P.opts.jelly) {
      const s = glowSprite({ color: E.glowCol, size: 0.9, opacity: 0.35 }); s.position.set(0, 0, 0.25); scaler.add(s); sprites.push(s);
    }
    const spriteBase = sprites.map((s) => s.material.opacity);

    let phase = Math.random() * 10, phase2 = Math.random() * 10, roll = 0, hop = 0, puff = 0, glowK = 1, warmK = 0, silK = 0;
    // the measuring ceremony's "lantern kiss" (setWarm): a warm rim on every lit part, a breath of warm light on a dark skin
    const rimMats = mats.filter((m) => m.userData?.rim).map((m) => ({ m, col: m.userData.rim.gwRimColor.value.clone(), str: m.userData.rim.gwRimStrength.value, thr: m.userData.rim.gwRimThreshold.value }));
    const warmEm = !E.hasGlow && !P.opts.jelly && !E.skin.emissiveMap;
    // the silhouette's lit colours (body / fins / extras / plain eyes) as built, so setSilhouette(0) gives them back exactly
    const silMats = mats.filter((m) => m.isMeshToonMaterial || m === eyeMat).map((m) => ({ m, col: m.color.clone(), emI: m === bodyMat ? null : m.emissiveIntensity }));
    const glowMeshes = [];
    scaler.traverse((o) => { if (o.isMesh && (o.material === glowMat || o.material === eyeGlowMat || o.material === boneMat)) glowMeshes.push(o); });
    function applyGlow() {
      const g = glowK * (1 - silK);
      bodyMat.emissiveIntensity = warmEm ? (warmK > 0 ? 1 - silK : 0) : (P.opts.jelly ? 0.55 : glowBase) * g;
      if (glowMat) glowMat.color.set(E.glowCol).multiplyScalar(2.6 * g);
      if (eyeGlowMat) eyeGlowMat.color.set(E.glowCol).multiplyScalar(2.8 * Math.max(0.3, glowK));
      if (boneMat) boneMat.color.set(hexColor(M.glow, 0xeae4d3)).multiplyScalar(1.05 * Math.max(0.5, glowK));
      sprites.forEach((sp2, i) => { sp2.material.opacity = spriteBase[i] * Math.min(1.5, glowK) * (1 - silK); sp2.visible = silK < 0.999; });
      for (const gm of glowMeshes) gm.visible = silK < 0.5;
    }
    function applyRim() {
      for (const r of rimMats) {
        const u = r.m.userData.rim;
        u.gwRimColor.value.copy(r.col).lerp(WARM_RIM, warmK).lerp(SIL_RIM, silK);
        u.gwRimStrength.value = (r.str + 0.2 * warmK) * (1 - 0.7 * silK); u.gwRimThreshold.value = r.thr - 0.04 * warmK;
      }
    }
    const swimFreq = anim.freq;
    const visual = {
      object3d, length: L, speciesId: sp?.id || null, shape: E.shape, trueScale, legendary: sp?.rarity === 'legendary',
      // extents in object3d-local metres (before the swim / struggle pivot): the measuring cord runs noseZ → tailZ
      bounds: { noseZ: E.ext.maxZ * k, tailZ: E.ext.minZ * k, halfW: E.ext.halfW * k, top: E.ext.maxY * k, bottom: E.ext.minY * k },
      update(dt = 0.016, t = 0, o = {}) {
        dt = Math.min(Math.max(dt || 0, 0), 0.1);
        const swim = o.swim ?? 1, struggle = THREE.MathUtils.clamp(o.struggle ?? 0, 0, 2), flop = THREE.MathUtils.clamp(o.flop ?? 0, 0, 1);
        phase += dt * swimFreq * (0.45 + 0.55 * Math.min(swim, 2) + struggle * 0.6);
        phase2 += dt * (swimFreq * 1.5 + 7) * (0.4 + struggle + flop * 0.9);
        U.uT.value = phase; U.uT2.value = phase2;
        U.uSwim.value = swim; U.uStruggle.value = struggle; U.uFlop.value = flop;
        if (E.shape === 'puffer') { puff = THREE.MathUtils.damp(puff, Math.min(1, struggle * 0.8 + flop * 0.5), 4, dt); U.uPuff.value = puff; }
        // whole-body motion: struggle roll-thrash, flop = lying on the side & hopping
        const targetRoll = flop > 0.01 ? Math.PI / 2 * 0.92 : 0;
        roll = THREE.MathUtils.damp(roll, targetRoll, 6, dt);
        pivot.rotation.z = roll + Math.sin(phase2 * 1.3) * 0.22 * struggle;
        pivot.rotation.y = Math.sin(phase2 * 0.7) * 0.12 * struggle;
        hop = flop > 0.01 ? Math.abs(Math.sin(phase2 * 0.45)) * 0.16 * flop * L : THREE.MathUtils.damp(hop, 0, 8, dt);
        pivot.position.y = hop;
      },
      setGlow(kk = 1) {
        glowK = Math.max(0, kk);
        if (silK > 0 || warmEm) { applyGlow(); return; }
        bodyMat.emissiveIntensity = (P.opts.jelly ? 0.55 : glowBase) * glowK;
        if (glowMat) glowMat.color.set(E.glowCol).multiplyScalar(2.6 * glowK);
        if (eyeGlowMat) eyeGlowMat.color.set(E.glowCol).multiplyScalar(2.8 * Math.max(0.3, glowK));
        if (boneMat) boneMat.color.set(hexColor(M.glow, 0xeae4d3)).multiplyScalar(1.05 * Math.max(0.5, glowK));
        sprites.forEach((s, i) => { s.material.opacity = spriteBase[i] * Math.min(1.5, glowK); });
      },
      /** 0 → 1: the warm lantern rim and fill the held fish wears while it is measured (v3 ceremony; 0 restores it). */
      setWarm(kk = 1) {
        const w = THREE.MathUtils.clamp(kk, 0, 1);
        if (Math.abs(w - warmK) < 1e-3) return;
        warmK = w;
        applyRim();
        if (warmEm) { bodyMat.emissive.copy(WARM_FILL).multiplyScalar(w); applyGlow(); }
      },
      /** 0 → 1: the unidentified fish (v3 auto-fishing, the bite and the fight): a dark ink silhouette at its true size, no
       *  colour, pattern, glow or eye of its species showing; 0 gives every part back exactly (the landing reveals it). */
      setSilhouette(kk = 1) {
        const v = THREE.MathUtils.clamp(Number(kk) || 0, 0, 1);
        if (v === silK) return;
        silK = v;
        for (const e of silMats) { e.m.color.copy(e.col).lerp(SIL_INK, v); if (e.emI !== null && e.emI !== undefined) e.m.emissiveIntensity = e.emI * (1 - v); }   // glowing fins too
        applyRim(); applyGlow();
      },
      get silhouette() { return silK; },
      dispose() {
        object3d.parent?.remove(object3d);
        for (const m of mats) m.dispose();
        for (const s of sprites) s.material.dispose();
      },
    };
    visual.update(0, 0, {});
    return visual;
  }

  return { createFish, speciesOf, shapes: Object.keys(SHAPES) };
}
