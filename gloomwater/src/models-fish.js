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
// the show's posture (setBend; all zero outside it, and then nothing below runs): a held fish droops off the hands, a hung one
// trails its tail on the planks. uBendT / uBendH = (hinge s, arc length, angle in rad: + toward the belly, 0 = straight) for the
// part behind the hinge (toward the tail) and the part ahead of it (toward the snout); uBendS = (sag between the two hinges, on)
uniform vec3 uBendT, uBendH, uBendL; uniform vec2 uBendS;
float gwLat(float s) {
  float w = s * s;
  float l = sin(s * uWaveK - uT) * w * uAmp * uSwim;
  l += sin(s * uWaveK * 1.35 - uT2 * 2.2) * w * uAmp * 1.9 * uStruggle;
  l += uFlop * w * 0.42 * sin(uT2 * 0.9);
  return l;
}
// bend the part of the body past the hinge z0 (sgn +1: toward the tail, −1: toward the snout) about the fish's side-to-side
// axis along a true arc (the length is kept), so a tail can lie on the planks under a standing fish
void gwBendArc(inout vec3 p, inout vec3 n, float z0, float sgn, vec3 B) {
  float d = (z0 - p.z) * sgn;
  if (d <= 0.0 || abs(B.z) < 1e-4) return;
  float w = max(B.y, 1e-3), phi = B.z * clamp(d / w, 0.0, 1.0), R = w / B.z, rest = max(d - w, 0.0);
  float c = cos(phi), s = sin(phi);
  float a = R * s + rest * c + p.y * s;
  float y = -R * (1.0 - c) - rest * s + p.y * c;
  float na = -sgn * n.z;
  float na2 = na * c + n.y * s, ny2 = -na * s + n.y * c;
  p.z = z0 - sgn * a; p.y = y;
  n.z = -sgn * na2; n.y = ny2;
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
  if (uBendS.y > 0.5) {
    float zh = 0.5 - uBendH.x, zt = 0.5 - uBendT.x;
    float m = clamp((zh - p.z) / max(1e-3, zh - zt), 0.0, 1.0);
    p.y -= uBendS.x * 4.0 * m * (1.0 - m);
    gwBendArc(p, n, zt, 1.0, uBendT);
    gwBendArc(p, n, zh, -1.0, uBendH);
    // (and the tail may hang SIDEWAYS: a ray held up by its wing, its back to us, trails its whip down off its own side)
    if (abs(uBendL.z) > 1e-4) { vec3 q = p.yxz, m = n.yxz; gwBendArc(q, m, 0.5 - uBendL.x, 1.0, uBendL); p = q.yxz; n = m.yxz; }
  }
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
    if (M.barbels !== 'none') r.extras.push(...barbels(r.f, M, 0.09));   // (a carp-plan fish with no barbels: the Rustfin Sucker)
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
  pike(M, o = {}) {
    const r = standard({
      w: [[0, 0.006], [0.04, 0.03], [0.1, 0.042], [0.2, 0.055], [0.45, 0.07], [0.7, 0.058], [0.88, 0.03], [1, 0.018]],
      ht: [[0, 0.004], [0.04, 0.016], [0.1, 0.028], [0.2, 0.055], [0.45, 0.078], [0.7, 0.07], [0.88, 0.04], [1, 0.024]],
      hb: [[0, 0.004], [0.04, 0.012], [0.12, 0.03], [0.25, 0.06], [0.5, 0.07], [0.72, 0.06], [0.88, 0.035], [1, 0.02]],
      fins: [['tail', 'fork', { s: 0.97, len: 0.18, h: 0.24 }], ['dorsal', 'soft', { a: 0.64, b: 0.82, h: 0.09 }],
        ['ventral', 'soft', { a: 0.66, b: 0.84, h: 0.075 }], ['pect', 'pect', { s: 0.24, len: 0.1, h: 0.05 }],
        ['pelvic', 'pect', { s: 0.5, len: 0.07, h: 0.04 }]],
      eye: { s: 0.15, r: 0.02, up: 0.55 }, gill: 0.26, R: 36, anim: { waveK: 4, amp: 0.07, freq: 7 },
    }, M);
    // the loop's plan parameters (M1 step 3a, ROSTER §4: the Thousandcast's upright bars and amber eye rim; read only under the loop)
    if (o.loop) {
      if (M.bars === 'upright') r.opts.bars = 'upright';
      if (M.eyeRim === 'amber') r.extras.push(...eyeRims(r.eyes, 0xd9963a));
    }
    return r;
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

// ------------------------------------------------------------------ the loop's plans (M1 step 3a; PLAN §2.4 item 5, ROSTER §4)
// Read only under the loop (PLAN CHOICE 14): off the loop a species of one of these shapes draws as today's fallback (the minnow), so a
// v3 phase-2 build's Bridgechain Sturgeon is unchanged. Each is a built plan with its parameters: the lamprey from the eel (a mouth
// parameter: a toothed disc, no jaw, no paired fins, seven gill holes lit), the sturgeon from the leviathan's long profile (scutes, a
// shovel snout, barbels, a tail with a long upper lobe), the trout from the minnow (a fatty fin, a plain jaw, star-spots, one scar).
function eyeRims(eyes, col) {
  const out = [];
  if (!eyes) return out;
  for (const [x, y, z] of eyes.pos) {
    const side = Math.sign(x) || 1;
    const g = new THREE.TorusGeometry(eyes.r * 1.05, eyes.r * 0.22, 5, 14);
    out.push(paint(xf(g, { p: [x + side * eyes.r * 0.18, y, z], r: [0, side * Math.PI / 2, 0] }), col));
  }
  return out;
}
export const LOOP_SHAPES = {
  lamprey(M) {
    const r = standard({
      w: [[0, 0.03], [0.015, 0.036], [0.05, 0.037], [0.12, 0.036], [0.5, 0.034], [0.78, 0.026], [0.93, 0.012], [1, 0.004]],
      ht: [[0, 0.028], [0.015, 0.035], [0.05, 0.038], [0.5, 0.037], [0.8, 0.028], [0.93, 0.014], [1, 0.004]],
      hb: [[0, 0.028], [0.015, 0.033], [0.05, 0.034], [0.5, 0.033], [0.8, 0.025], [0.93, 0.012], [1, 0.004]],
      fins: [['dorsal', 'ribbon', { a: 0.55, b: 0.69, h: 0.032, rake: 0.1, segV: 10 }], ['dorsal', 'ribbon', { a: 0.73, b: 1.0, h: 0.042, rake: 0, segV: 18 }],
        ['ventral', 'ribbon', { a: 0.86, b: 1.0, h: 0.026, rake: 0, segV: 10 }]],
      eye: { s: 0.055, r: 0.0095, up: 0.5 }, gill: -1, R: 64, A: 14, anim: { waveK: 12, amp: 0.07, freq: 8 },
    }, M);
    const f = r.f, y0 = f.yc(0);
    // the mouth: a round sucking disc on the snout, its rim, its throat, and two rings of amber teeth facing out
    r.extras.push(paint(blob(0.034, 0.033, 0.006, [0, y0 - 0.004, 0.5 + 0.001], 18, 6), C(hexColor(M.belly, 0xd8d2c4)).lerp(C(hexColor(M.body, 0x1c1a2a)), 0.35)));
    r.extras.push(paint(blob(0.012, 0.012, 0.004, [0, y0 - 0.004, 0.5 + 0.005], 10, 5), 0x0a0507));
    const teeth = [], amber = M.teeth === 'amber' ? 0xd9963a : 0xe8e0c8;
    for (const [rr, n, len] of [[0.026, 14, 0.006], [0.017, 9, 0.0045]]) {
      for (let k = 0; k < n; k++) {
        const a = (k / n) * TAU + (rr < 0.02 ? 0.2 : 0);
        teeth.push(spike([Math.cos(a) * rr, y0 - 0.004 + Math.sin(a) * rr, 0.5 + 0.005], [-Math.cos(a) * 0.4, -Math.sin(a) * 0.4, 1], 0.0022, len, 4));
      }
    }
    r.extras.push(paint(mergeGeos(teeth), amber));
    // seven gill holes in a row behind each eye: dark pits with a lit point in each (the bite's "seven lavender points in a row")
    const nG = Number.isFinite(M.gills) ? M.gills : 7, pits = [];
    for (const side of [1, -1]) {
      for (let k = 0; k < nG; k++) {
        const s = 0.085 + k * 0.013, x = side * f.w(s) * 0.97, y = f.yc(s) + f.ht(s) * 0.12, z = 0.5 - s;
        pits.push(blob(0.0042, 0.0048, 0.0042, [x, y, z], 6, 5));
        r.glows.push(blob(0.0026, 0.003, 0.0026, [x + side * 0.0016, y, z], 6, 5));
      }
    }
    r.extras.push(paint(mergeGeos(pits), 0x0c0a14));
    if (M.gillGlow !== undefined && M.gillGlow !== null) r.opts.glowCol = M.gillGlow;
    return r;
  },
  sturgeon(M) {
    const r = standard({
      w: [[0, 0.034], [0.02, 0.046], [0.05, 0.05], [0.1, 0.054], [0.2, 0.062], [0.5, 0.06], [0.78, 0.04], [0.9, 0.022], [1, 0.012]],
      ht: [[0, 0.005], [0.02, 0.011], [0.05, 0.02], [0.1, 0.038], [0.2, 0.058], [0.5, 0.06], [0.78, 0.042], [0.9, 0.024], [1, 0.016]],
      hb: [[0, 0.005], [0.02, 0.011], [0.05, 0.02], [0.1, 0.03], [0.2, 0.046], [0.5, 0.05], [0.78, 0.034], [0.9, 0.02], [1, 0.012]],
      yc: [[0, -0.022], [0.1, -0.008], [0.3, 0], [1, 0.008]],
      fins: [['tail', 'fork', { s: 0.965, len: 0.17, h: 0.24, y: 0.035 }], ['dorsal', 'soft', { a: 0.68, b: 0.79, h: 0.07, rake: 0.45 }],
        ['ventral', 'soft', { a: 0.72, b: 0.81, h: 0.05 }], ['pect', 'pect', { s: 0.17, len: 0.13, h: 0.06, yOff: -0.6, down: 0.6 }],
        ['pelvic', 'pect', { s: 0.56, len: 0.07, h: 0.04 }]],
      eye: { s: 0.115, r: 0.011, up: 0.58, out: 0.92 }, gill: 0.16, R: 48, anim: { waveK: 6, amp: 0.05, freq: 4.5 },
    }, M);
    const f = r.f;
    // the shovel snout's underside: four barbels hanging in a row before the mouth
    const bc = C(hexColor(M.belly, 0xcfcabd)).lerp(C(hexColor(M.fin, 0x8a4b3a)), 0.35);
    for (const x of [-0.016, -0.006, 0.006, 0.016]) {
      const s = 0.045, y = f.yc(s) - f.hb(s) * 0.9, z = 0.5 - s;
      r.extras.push(paint(tube(bezierPts([[x, y, z], [x * 1.2, y - 0.018, z - 0.004], [x * 1.3, y - 0.032, z - 0.012]], 8), (u) => 0.0028 * (1 - u * 0.7) + 0.0006, 4), bc));
    }
    // the scutes: rust bony plates in five rows (the back and each flank twice), every other one turned like the links of a chain
    const sc = M.scutes === 'rust' ? C(0x8a4b3a) : C(hexColor(M.fin, 0x8a4b3a)), plates = [];
    for (let k = 0; k < 13; k++) {
      const s = 0.2 + k * 0.042, top = f.top(s);
      plates.push(blob(0.009, 0.007, 0.016, [0, top - 0.001, 0.5 - s], 8, 5, [-0.2, k % 2 ? Math.PI / 2 * 0.35 : 0, 0]));
    }
    for (const side of [1, -1]) for (const up of [0.45, -0.2]) {
      for (let k = 0; k < 20; k++) {
        const s = 0.19 + k * 0.034, w = f.w(s), y = f.yc(s) + (up > 0 ? f.ht(s) : f.hb(s)) * up;
        plates.push(blob(0.004, 0.0085, 0.012, [side * w * 0.97, y, 0.5 - s], 7, 5, [0, side * 0.25, k % 2 ? 0.9 : 0]));
      }
    }
    r.extras.push(paint(mergeGeos(plates), sc));
    // the jaw's line under the snout (a sturgeon's mouth sits below, behind the barbels)
    r.extras.push(paint(tube(bezierPts([[-0.018, f.yc(0.06) - f.hb(0.06) * 0.95, 0.5 - 0.06], [0, f.yc(0.065) - f.hb(0.065) * 1.02, 0.5 - 0.064], [0.018, f.yc(0.06) - f.hb(0.06) * 0.95, 0.5 - 0.06]], 8), 0.0026, 4), 0x0a0806));
    if (M.snout === 'shovel') r.opts.shovel = true;
    return r;
  },
  trout(M) {
    const r = standard({
      w: [[0, 0.006], [0.03, 0.03], [0.12, 0.054], [0.32, 0.064], [0.58, 0.05], [0.82, 0.024], [0.93, 0.014], [1, 0.011]],
      ht: [[0, 0.006], [0.03, 0.034], [0.14, 0.08], [0.34, 0.1], [0.6, 0.076], [0.84, 0.034], [0.94, 0.022], [1, 0.018]],
      hb: [[0, 0.006], [0.03, 0.03], [0.16, 0.066], [0.38, 0.082], [0.62, 0.056], [0.84, 0.026], [1, 0.015]],
      yc: [[0, -0.008], [0.25, 0], [1, 0]],
      fins: [['tail', 'fork', { s: 0.97, len: 0.21, h: 0.27 }], ['dorsal', 'soft', { a: 0.36, b: 0.52, h: 0.1 }],
        ['ventral', 'soft', { a: 0.64, b: 0.75, h: 0.06 }], ['pect', 'pect', { s: 0.2, len: 0.12, h: 0.06 }],
        ['pelvic', 'pect', { s: 0.47, len: 0.075, h: 0.045 }]],
      eye: { s: 0.085, r: 0.023, up: 0.32 }, gill: 0.22, anim: { waveK: 5, amp: 0.09, freq: 9 },
    }, M);
    const f = r.f;
    // the fatty fin: a small rounded flap on the back between the dorsal and the tail (no rays)
    if (M.fattyFin !== false) {
      const s = 0.78, top = f.top(s);
      r.extras.push(paint(blob(0.004, 0.018, 0.026, [0, top + 0.012, 0.5 - s], 8, 6, [0.3, 0, 0]), C(hexColor(M.fin, 0x8a4b3a)).lerp(C(hexColor(M.body, 0x5a6270)), 0.5)));
    }
    // the jaw: the long upper jaw's line from the snout back past the eye, on each side
    for (const side of [1, -1]) {
      r.extras.push(paint(tube(bezierPts([[side * f.w(0.006) * 0.9, f.yc(0.02) - 0.006, 0.497], [side * f.w(0.05) * 1.0, f.yc(0.05) - f.hb(0.05) * 0.32, 0.45], [side * f.w(0.11) * 0.98, f.yc(0.11) - f.hb(0.11) * 0.28, 0.39]], 8), 0.0032, 4), 0x0a0806));
    }
    if (M.spots === 'stars') r.opts.stars = true;
    if (M.scar) r.opts.scar = true;
    return r;
  },
};

// >>> M1 step 4 (lane 4, ROSTER §4's catfish row; M1.md §2.3, §2.4): the catfish plan, from the pike's profile with a flattened head:
// a broad flat head over a wide mouth, two long whiskers (bell-ropes, the Belled Matriarch's `whiskers: 2`) and four short chin barbels,
// small eyes, a low body tapering to an eel tail with a long belly fin and a small rounded tail, a small dorsal; her `bell`: a tarnished
// harbour bell sunk in the skull. Read only under the loop (LOOP_SHAPES); only the Matriarch rides on it in M1.
LOOP_SHAPES.catfish = function catfish(M) {
  const r = standard({
    w: [[0, 0.034], [0.03, 0.062], [0.09, 0.078], [0.2, 0.074], [0.42, 0.06], [0.66, 0.042], [0.86, 0.022], [1, 0.008]],
    ht: [[0, 0.012], [0.03, 0.026], [0.09, 0.042], [0.2, 0.058], [0.42, 0.06], [0.66, 0.048], [0.86, 0.03], [1, 0.012]],
    hb: [[0, 0.014], [0.03, 0.03], [0.09, 0.046], [0.2, 0.062], [0.42, 0.064], [0.66, 0.05], [0.86, 0.03], [1, 0.012]],
    yc: [[0, -0.012], [0.15, 0], [1, 0.004]],
    fins: [['tail', 'round', { s: 0.975, len: 0.08, h: 0.11 }], ['dorsal', 'soft', { a: 0.26, b: 0.32, h: 0.05, rake: 0.3 }],
      ['ventral', 'ribbon', { a: 0.4, b: 0.97, h: 0.05, rake: 0, segV: 26 }], ['pect', 'pect', { s: 0.13, len: 0.1, h: 0.05, yOff: -0.4 }],
      ['pelvic', 'pect', { s: 0.38, len: 0.05, h: 0.03 }]],
    eye: { s: 0.055, r: 0.007, up: 0.48, out: 0.86 }, gill: 0.15, R: 48, anim: { waveK: 7, amp: 0.075, freq: 4.6 },
  }, M);
  const f = r.f;
  const n = Number.isFinite(M.whiskers) ? M.whiskers : 2;
  if (n >= 2) r.extras.push(...barbels(f, M, 0.42, 0.012));   // the two long whiskers from the mouth's corners, trailing back
  r.extras.push(...barbels(f, M, 0.06, 0.03), ...barbels(f, M, 0.05, 0.045));   // four short chin barbels
  // the mouth: a wide dark seam across the flat snout
  r.extras.push(paint(tube(bezierPts([[-f.w(0.02) * 0.95, f.yc(0.02) - 0.004, 0.49], [0, f.yc(0.0) - 0.012, 0.503], [f.w(0.02) * 0.95, f.yc(0.02) - 0.004, 0.49]], 10), 0.0035, 4), 0x0a0806));
  if (M.bell) {   // the bell in her skull: a bronze dome breaking the skin behind the eyes, a dark mouth-rim and a verdigris lip
    const s = 0.11, top = f.top(s);
    const bell = new THREE.LatheGeometry([[0, 0.028], [0.012, 0.027], [0.02, 0.02], [0.024, 0.008], [0.028, 0], [0.03, -0.004]].map(([x, y]) => new THREE.Vector2(x, y)), 12);
    r.extras.push(paint(xf(bell, { p: [0, top - 0.004, 0.5 - s], r: [-0.25, 0, 0] }), 0x9a7a44));
    r.extras.push(paint(xf(new THREE.TorusGeometry(0.029, 0.003, 4, 14), { p: [0, top - 0.007, 0.5 - s], r: [Math.PI / 2 - 0.25, 0, 0] }), 0x5f7a66));
  }
  r.opts.flatHead = true;
  return r;
};
// <<< M1 step 4 (lane 4)

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
    // (the loop's lamprey keeps its ink over the whole flank: only the belly's last band pales)
    const t = shape === 'lamprey' ? THREE.MathUtils.smoothstep(up, -0.85, -0.35) : THREE.MathUtils.smoothstep(up, -0.5, 0.45);
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
  if (pat === 'stripes' && parts.opts.bars === 'upright') {
    // (the loop's Thousandcast: dark upright bars, straight and close, on a stone-white flank)
    const ink = body.clone().multiplyScalar(0.28), inkCss = `rgba(${ink.r * 255 | 0},${ink.g * 255 | 0},${ink.b * 255 | 0},0.8)`;
    for (let k = 0; k < 9; k++) {
      const x = W * (0.25 + k * 0.075), wdt = 4.5 + rnd() * 3;
      for (const [y0, y1] of [[yM(-0.08), yM(0.22)], [yP(0.22), yP(-0.08)]]) { g.fillStyle = inkCss; g.beginPath(); g.moveTo(x - wdt / 2, y0); g.lineTo(x + wdt / 2 + 1, y0); g.lineTo(x + wdt / 2, y1); g.lineTo(x - wdt / 2 - 1, y1); g.closePath(); g.fill(); }
    }
  } else if (pat === 'stripes') {
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
  } else if (pat === 'spots' && parts.opts.stars) {
    // (the loop's Kissmark Trout: ivory star-spots on slate, thicker on the back)
    const star = (x, y, r) => { g.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - Math.PI / 2, rr = i % 2 ? r * 0.42 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); };
    g.fillStyle = 'rgba(236,230,214,0.85)';
    for (let k = 0; k < 34; k++) { const x = W * (0.14 + rnd() * 0.8), a = 0.02 + rnd() * 0.23, r = 1.6 + rnd() * 2.2; star(x, yP(a), r); star(x, yM(a), r); }
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
  // (the loop's Kissmark Trout: one pale round scar on each flank, where something let go)
  if (parts.opts.scar) {
    for (const y of [yP(0.07), yM(0.07)]) {
      g.fillStyle = 'rgba(236,230,214,0.32)'; g.beginPath(); g.ellipse(W * 0.47, y, 7, 5.5, 0, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(236,230,214,0.7)'; g.lineWidth = 1.4; g.beginPath(); g.ellipse(W * 0.47, y, 7, 5.5, 0, 0, TAU); g.stroke();
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
const FIN_LIT = new THREE.Color(0xb98352);   // a fin with the lantern through it (the show's close-up: setShown)
// setSilhouette: the unidentified fish of the bite and the fight (v3 auto-fishing): a dark shape at its true size, nothing of
// its species (colours, pattern, glows, eyes) showing until it is landed
const SIL_INK = new THREE.Color(0x0c0b14), SIL_RIM = new THREE.Color(0x6e7396);
const DEFAULT_MODEL = { shape: 'minnow', body: 0x7a8494, belly: 0xdde2e8, fin: 0x3c4452, glow: null, pattern: 'scales', eyes: 'normal', scale: 0.6 };

export function createFishFactory(ctx) {
  const cache = new Map();
  // the loop's plans join the built shapes only under the loop (PLAN CHOICE 14): read once, as every flag is
  const LOOP_ON = ctx.data?.LOOP_ENABLED === true;
  const SH = LOOP_ON ? { ...SHAPES, ...LOOP_SHAPES } : SHAPES;
  const speciesOf = (x) => {
    if (x && typeof x === 'object') return x;
    const D = ctx.data || {};
    return D.SPECIES_BY_ID?.[x] || (D.SPECIES || []).find((s) => s.id === x) || null;
  };

  function build(sp) {
    const M = { ...DEFAULT_MODEL, ...(sp?.model || {}) };
    const shape = SH[M.shape] ? M.shape : (typeof sp === 'string' && SH[sp] ? sp : 'minnow');
    const key = (sp?.id || 'anon') + '|' + shape + '|' + [M.body, M.belly, M.fin, M.glow, M.pattern, M.eyes].join(',');
    if (cache.has(key)) return cache.get(key);
    const parts = SH[shape](M, { loop: LOOP_ON });
    const glowCol = hexColor(parts.opts.glowCol ?? M.glow, 0xffd9a0);   // (the lamprey's gill holes light lavender with no glow on its body)
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
    const sp = speciesOf(speciesOrId) || (typeof speciesOrId === 'string' && SH[speciesOrId] ? { id: 'shape_' + speciesOrId, model: { ...DEFAULT_MODEL, shape: speciesOrId } } : null);
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
      uBendT: { value: new THREE.Vector3(0.8, 0.1, 0) }, uBendH: { value: new THREE.Vector3(0.2, 0.1, 0) }, uBendS: { value: new THREE.Vector2(0, 0) }, uBendL: { value: new THREE.Vector3(0.8, 0.1, 0) },
      // the landing's reveal sweep (models-kit fx 'reveal'; off until setReveal)
      uGwRev: { value: new THREE.Vector4(0, 0, 0.22, 1.4) }, uGwRevZ: { value: new THREE.Vector2(E.ext.maxZ, E.ext.minZ) },
      uGwRevInk: { value: SIL_INK.clone() }, uGwRevCol: { value: new THREE.Color(0xf3dca4) }, uGwRevFlood: { value: 0 }, uGwShown: { value: 0 },
    };
    const spec = { key: 'fish', uniforms: U, pars: FISH_PARS, fx: 'reveal' };
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
    let finMat = null;
    if (E.fins) {
      const fm = deformToon({ color: translucent ? new THREE.Color(hexColor(M.fin, 0x333840)).lerp(new THREE.Color(PALE), 0.55) : hexColor(M.fin, 0x333840), map: getFinAtlas(), side: THREE.DoubleSide, rim: 0.25, transparent: translucent, opacity: translucent ? 0.45 : 1,
        emissive: (P.opts.glowFins || translucent) && E.hasGlow ? E.glowCol : 0x000000, emissiveIntensity: (P.opts.glowFins || translucent) && E.hasGlow ? 0.45 : 0 }, spec);
      fm.alphaTest = 0.45;
      if (translucent) fm.depthWrite = false;
      mats.push(fm);
      const fins = new THREE.Mesh(E.fins, fm); fins.name = 'fins'; if (translucent) fins.renderOrder = 3;
      scaler.add(fins);
      finMat = fm;
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
    let shownK = 0;
    const finBase = finMat ? finMat.color.clone() : null;
    // the measuring ceremony's "lantern kiss" (setWarm): a warm rim on every lit part, a breath of warm light on a dark skin
    const rimMats = mats.filter((m) => m.userData?.rim).map((m) => ({ m, col: m.userData.rim.gwRimColor.value.clone(), str: m.userData.rim.gwRimStrength.value, thr: m.userData.rim.gwRimThreshold.value }));
    const warmEm = !E.hasGlow && !P.opts.jelly && !E.skin.emissiveMap;
    // the show's wet skin (setWet): the glint of every lit part
    let wetK = 0;
    const wetMats = mats.filter((m) => m.userData?.surf?.gwSurf).map((m) => ({ u: m.userData.surf, g: m.userData.surf.gwSurf.value.x, e: m.userData.surf.gwSurf.value.y }));
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
      /** 0 → 1: held up in the show, a metre from the lens and half a metre from the lantern: the light on its skin is eased
       *  under a knee (its back, belly and pattern keep their contrast instead of burning out to one cream), and its fins, ink
       *  dark from afar, take the lantern through them (a warm brown membrane, their rays showing). 0 restores it exactly. */
      setShown(kk = 0) {
        const w = THREE.MathUtils.clamp(Number(kk) || 0, 0, 1);
        if (Math.abs(w - shownK) < 1e-3) return;
        shownK = w;
        U.uGwShown.value = w;
        if (finMat && finBase && !translucent && !(P.opts.glowFins && E.hasGlow)) finMat.color.copy(finBase).lerp(FIN_LIT, 0.42 * w * (1 - silK));
      },
      /** The show's posture (docs/v3/show/SPEC.md §2.3): the body bends about its side-to-side axis on true arcs. tail / head =
       *  [hinge, arc length, angle (rad; + toward the belly)] for the part behind / ahead of the hinge, the hinge and the arc as
       *  shares of the fish's true length (0 = the snout, 1 = the tail tip); sag = how far the middle hangs between the two
       *  hinges (share of the length); side = [hinge, arc, angle]: the tail behind that hinge hangs sideways (about the back-to-belly
       *  axis; + toward the fish's own −x). setBend(null) straightens it (and the shader then skips the lot). */
      setBend(o = null) {
        const T = U.uBendT.value, H = U.uBendH.value, S = U.uBendS.value, Ls = U.uBendL.value;
        if (!o) { T.z = 0; H.z = 0; Ls.z = 0; S.set(0, 0); return; }
        const X = E.extentTrue, s0 = 0.5 - E.ext.maxZ, t = o.tail, h = o.head;
        if (t) T.set(s0 + THREE.MathUtils.clamp(+t[0] || 0, 0, 1) * X, Math.max(0.01, (+t[1] || 0.1) * X), +t[2] || 0); else T.set(s0 + 0.8 * X, 0.1, 0);
        if (h) H.set(s0 + THREE.MathUtils.clamp(+h[0] || 0, 0, 1) * X, Math.max(0.01, (+h[1] || 0.1) * X), +h[2] || 0); else H.set(s0 + 0.2 * X, 0.1, 0);
        const sag = (+o.sag || 0) * X, sd = o.side;   // side = [hinge, arc, angle]: the tail behind the hinge hangs toward the fish's own −x (angle > 0) or +x
        if (sd) Ls.set(s0 + THREE.MathUtils.clamp(+sd[0] || 0, 0, 1) * X, Math.max(0.01, (+sd[1] || 0.1) * X), +sd[2] || 0); else Ls.set(s0 + 0.8 * X, 0.1, 0);
        S.set(sag, Math.abs(T.z) > 1e-4 || Math.abs(H.z) > 1e-4 || Math.abs(Ls.z) > 1e-4 || Math.abs(sag) > 1e-5 ? 1 : 0);
      },
      /** The body's cross-section at a share of the true length (0 = the snout tip, 1 = the tail tip), in object3d-local metres
       *  before any bend: {z, halfW, top, bottom} (the body itself: fins, spines and claws reach past it). */
      section(frac, out = {}) {
        const fr = THREE.MathUtils.clamp(Number(frac) || 0, 0, 1), zM = E.ext.maxZ - fr * E.extentTrue, f = P.f;
        out.z = zM * k;
        const sM = 0.5 - zM;
        if (f && sM >= 0 && sM <= (E.shape === 'ray' ? 0.8 : 1)) {
          out.halfW = Math.max(0.003, f.w(sM)) * k; out.top = (f.yc(sM) + Math.max(0.003, f.ht(sM))) * k; out.bottom = (f.yc(sM) - Math.max(0.003, f.hb(sM))) * k;
        } else if (f) { out.halfW = 0.012 * k; out.top = 0.014 * k; out.bottom = -0.012 * k; }   // past the body: a tail stalk
        else {   // no profile (crayfish, jelly): the box, rounded off toward both ends
          const m = Math.sqrt(Math.max(0.04, 1 - Math.pow(Math.abs(fr * 2 - 0.9), 2.4)));
          out.halfW = E.ext.halfW * k * m * 0.8; out.top = E.ext.maxY * k * m * 0.8; out.bottom = E.ext.minY * k * m * 0.8;
        }
        return out;
      },
      /** Where a point of the straight body (object3d-local metres) is once setBend's posture is applied: the shader's own
       *  arithmetic, for whoever must put a hand on a bent fish or rest its tail on the planks. Returns v. */
      bendPoint(v) {
        const S = U.uBendS.value;
        if (S.y < 0.5) return v;
        const T = U.uBendT.value, H = U.uBendH.value;
        let y = v.y / k, z = v.z / k;
        const zh = 0.5 - H.x, zt = 0.5 - T.x, m = THREE.MathUtils.clamp((zh - z) / Math.max(1e-3, zh - zt), 0, 1);
        y -= S.x * 4 * m * (1 - m);
        for (const [z0, sgn, B] of [[zt, 1, T], [zh, -1, H]]) {
          const d = (z0 - z) * sgn;
          if (d <= 0 || Math.abs(B.z) < 1e-4) continue;
          const w = Math.max(B.y, 1e-3), phi = B.z * Math.min(1, d / w), R = w / B.z, rest = Math.max(d - w, 0), c = Math.cos(phi), sn = Math.sin(phi);
          const a = R * sn + rest * c + y * sn;
          y = -R * (1 - c) - rest * sn + y * c; z = z0 - sgn * a;
        }
        v.y = y * k; v.z = z * k;
        const Ls = U.uBendL.value;
        if (Math.abs(Ls.z) > 1e-4) {   // the sideways hang of the tail: the same arc, in the x–z plane
          let x = v.x / k; z = v.z / k;
          const z0 = 0.5 - Ls.x, d = z0 - z;
          if (d > 0) {
            const w = Math.max(Ls.y, 1e-3), phi = Ls.z * Math.min(1, d / w), R = w / Ls.z, rest = Math.max(d - w, 0), c = Math.cos(phi), sn = Math.sin(phi);
            const a = R * sn + rest * c + x * sn;
            x = -R * (1 - c) - rest * sn + x * c; z = z0 - a;
            v.x = x * k; v.z = z * k;
          }
        }
        return v;
      },
      /** 0 → 1: just out of the water: the skin glints (the lantern and the moon key catch it). 0 gives the dry skin back. */
      setWet(kk = 1) {
        const w = THREE.MathUtils.clamp(Number(kk) || 0, 0, 1);
        if (Math.abs(w - wetK) < 1e-3) return;
        wetK = w;
        for (const r of wetMats) { r.u.gwSurf.value.x = r.g + (0.55 - r.g) * w; r.u.gwSurf.value.y = r.e + (26 - r.e) * w; }
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
      /** The light a just-revealed fish holds for a moment (0 = none): a pale-gold lift over the whole body (the landing). */
      setRevealLight(k = 0) { U.uGwRevFlood.value = Math.max(0, Math.min(1, Number(k) || 0)); },
      /** The landing's reveal (v3): k 0 → 1 floods the true colours along the body nose to tail behind a band of light (the part
       *  not yet reached stays night ink); on 0 turns it off. colour: the band's light (default pale gold). */
      setReveal(kk = 0, on = 1, colour = null) {
        const r = U.uGwRev.value;
        if (on <= 0 && kk >= 1) U.uGwRevFlood.value = 0;
        r.x = THREE.MathUtils.clamp(Number(kk) || 0, -0.3, 1.3) * 1.3 - 0.15; r.y = THREE.MathUtils.clamp(Number(on) || 0, 0, 1);
        if (colour != null) { try { U.uGwRevCol.value.set(colour); } catch { /* ignore */ } }
      },
      dispose() {
        object3d.parent?.remove(object3d);
        for (const m of mats) m.dispose();
        for (const s of sprites) s.material.dispose();
      },
    };
    visual.update(0, 0, {});
    return visual;
  }

  return { createFish, speciesOf, shapes: Object.keys(SH) };
}
