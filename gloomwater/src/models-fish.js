// models-fish.js — procedural fish for all 13 shapes (helper of models.js).
// Bodies are elliptical "lathe" tubes from per-shape profiles with hand-painted canvas
// skins (countershading, gills, patterns, glowing photophores); fins are ink-rimmed
// cards from one painted atlas; everything bends in the vertex shader (swim / struggle /
// flop) so a whole fish is ~5–7 draw calls. Geometry & textures are cached per species.
import * as THREE from 'three';
import { INK, PALE, glowSprite } from './toon.js';
import {
  TAU, deformToon, deformGlow, deformOutline, outlineMesh, xf, paint, mergeGeos, tube, bezierPts,
  curve1, spike, blob, hexColor, lumpy,
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
function finTail(f, type, { s = 0.97, len = 0.22, h = 0.3, y = 0, sweep = 0, root = 1 }) {
  const z0 = 0.5 - s + 0.012, yc = f.yc(Math.min(1, s)) + y;
  // (LAKE 2, lane F: a crescent or a scythe, the loop's plans only: the lobes' tips swept back past the middle (`sweep`), the fin narrow
  // at its root (`root`, its height there as a share); with neither the card is the built one, exactly)
  if (sweep || root !== 1) return card(type, 6, 6, (u, v) => { const e = (2 * v - 1) ** 2; return [0, yc + (v - 0.5) * h * (root + (1 - root) * u), z0 - u * len * (1 - sweep + sweep * e)]; });
  return card(type, 6, 4, (u, v) => [0, yc + (v - 0.5) * h, z0 - u * len]);
}
function finDorsal(f, type, { a, b, h, rake = 0.35, segV = 8, down = false, taper = 0 }) {
  return card(type, 2, segV, (u, v) => {
    // (LAKE 2, lane F: `taper` narrows the fin toward its tip, a shark's or a sickle's point; 0 is the built fin, exactly)
    const s = taper ? (a + b) / 2 + (v - 0.5) * (a - b) * (1 - u * taper) : b + (a - b) * v;
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
      fins: [['tail', 'fork', { s: 0.97, len: 0.21, h: 0.27 }], ['dorsal', 'soft', M.sail ? { a: 0.3, b: 0.6, h: 0.24 } : { a: 0.36, b: 0.52, h: 0.1 }],
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
    if (M.spots === 'rose') r.opts.rose = true;   // (LOST-TACKLE §4.2: the Rosefleck's rose flecks)
    if (M.scar) r.opts.scar = true;
    return r;
  },
};

// >>> M1 step 4 (lane 4, ROSTER §4's catfish row; M1.md §2.3, §2.4): the catfish plan, from the pike's profile with a flattened head:
// a broad flat head over a wide mouth, two long whiskers (bell-ropes, the Belled Matriarch's `whiskers: 2`) and four short chin barbels,
// small eyes, a low body tapering to an eel tail with a long belly fin and a small rounded tail, a small dorsal; her `bell`: a tarnished
// harbour bell sunk in the skull. Read only under the loop (LOOP_SHAPES); only the Matriarch rides on it in M1.
LOOP_SHAPES.catfish = function catfish(M) {
  if (M.head === 'bullet' || M.head === 'bullet_round') return catfishBullet(M);   // (LAKE 2, lane F: Sporewood's two; the Matriarch's below)
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
  if (n >= 2) {   // the two long whiskers from the mouth's corners, swept out and trailing back along her flanks like bell-ropes
    const wc = C(hexColor(M.fin, 0x333333)).multiplyScalar(0.85);
    for (const side of [1, -1]) {
      const s0 = 0.025, x0 = side * f.w(s0) * 0.92, y0 = f.yc(s0) - f.hb(s0) * 0.25, z0 = 0.5 - s0;
      const pts = bezierPts([[x0, y0, z0], [x0 + side * 0.07, y0 - 0.02, z0 - 0.06], [x0 + side * 0.11, y0 - 0.06, z0 - 0.2], [x0 + side * 0.09, y0 - 0.1, z0 - 0.4]], 14);
      r.extras.push(paint(tube(pts, (u) => 0.007 * (1 - u * 0.85) + 0.0012, 4), wc));
    }
  }
  r.extras.push(...barbels(f, M, 0.06, 0.03), ...barbels(f, M, 0.05, 0.045));   // four short chin barbels
  // the mouth: a wide dark seam across the flat snout
  r.extras.push(paint(tube(bezierPts([[-f.w(0.02) * 0.95, f.yc(0.02) - 0.004, 0.49], [0, f.yc(0.0) - 0.012, 0.503], [f.w(0.02) * 0.95, f.yc(0.02) - 0.004, 0.49]], 10), 0.0035, 4), 0x0a0806));
  if (M.bell) {   // the bell in her skull: a bronze dome breaking the skin behind the eyes, a dark mouth-rim and a verdigris lip
    const s = 0.11, top = f.top(s);
    const bell = new THREE.LatheGeometry([[0, 0.028], [0.012, 0.027], [0.02, 0.02], [0.024, 0.008], [0.028, 0], [0.03, -0.004]].map(([x, y]) => new THREE.Vector2(x, y)), 12);
    r.extras.push(paint(xf(bell, { p: [0, top - 0.004, 0.5 - s], r: [-0.25, 0, 0] }), 0x9a7a44));
    r.extras.push(paint(xf(new THREE.TorusGeometry(0.029, 0.003, 4, 14), { p: [0, top - 0.007, 0.5 - s], r: [Math.PI / 2 - 0.25, 0, 0] }), 0x5f7a66));
  }
  r.opts.broadHead = true;
  return r;
};
// <<< M1 step 4 (lane 4)

// >>> LAKE 2, lane F (docs/loop/LAKE2.md §2.3, ROSTER §4): Sporewood's fourteen looks, each a modeller's brief. Three new plans join
// LOOP_SHAPES (disc, bream, finlet); five built plans take the brief's words (eel, carp, minnow, crayfish and puffer: loopVariant, below;
// the catfish's two bullet heads: catfishBullet). All of it is read only under the loop, and only when a species' model carries the
// words, so a built fish (every Mossmere fish, the flag-off game's Sporewood) is drawn exactly as before.
const nf = (v, d) => (v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v)) ? Number(v) : d);
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const scaleK = (keys, k) => keys.map(([s, v]) => [s, v * (typeof k === 'function' ? k(s) : k)]);
const UPV = new THREE.Vector3(0, 1, 0), ZV = new THREE.Vector3(0, 0, 1), _ln = new THREE.Vector3(), _lq = new THREE.Quaternion();
/** A point on a profiled body's skin: station s, angle th round it (0 = the +x flank, π/2 = the back), ex its section's superellipse. */
function skinAt(f, s, th, ex = 2) {
  let c = Math.cos(th), sn = Math.sin(th);
  if (ex !== 2) { c = Math.sign(c) * Math.pow(Math.abs(c), 2 / ex); sn = Math.sign(sn) * Math.pow(Math.abs(sn), 2 / ex); }
  return [f.w(s) * c, f.yc(s) + (sn >= 0 ? f.ht(s) : f.hb(s)) * sn, 0.5 - s];
}
/** The top of a flat body (a disc) at station s and a share q of its half-width there (−1…1), and the surface's normal. */
function backAt(f, s, q, ex) {
  const yAt = (ss, qq) => { const c = Math.min(1, Math.abs(qq)) ** (ex / 2), sn = Math.sqrt(Math.max(0, 1 - c * c)); return f.yc(ss) + f.ht(ss) * sn ** (2 / ex); };
  const x = q * f.w(s), y = yAt(s, q), d = 0.01;
  const dydx = (yAt(s, q + d) - yAt(s, q - d)) / (2 * d * Math.max(1e-3, f.w(s))), dyds = (yAt(s + d, q) - yAt(s - d, q)) / (2 * d);
  return { p: [x, y, 0.5 - s], n: _ln.set(-dydx, 1, dyds).normalize().toArray() };
}
/** Turn a geometry built about +Y (or +Z with fromZ) to a normal n and set it at p. */
function onNormal(geo, p, n, fromZ = false, spin = 0) {
  if (spin) geo.rotateY(spin);
  _lq.setFromUnitVectors(fromZ ? ZV : UPV, _ln.set(n[0], n[1], n[2]).normalize());
  return xf(geo, { p, q: _lq });
}
let _seed = 1;
const lrnd = () => { _seed = (_seed * 16807) % 2147483647; return _seed / 2147483647; };

// ---- disc: a river ray, a near-round disc with its eyes on two small turrets, a stout tail with one sting or a whip with one barb
// (the Velvet Ray, the Drifting Grove). The built ray's lathe, rounder; its parameters: round, tail ('sting' | 'whip_barb'), snout
// ('point'), turrets, eyeRings (n: cream rings, each with a dark centre, on the back), meadow (the Grove's: moss tufts, ferns and tiny
// caps whose gills glow).
LOOP_SHAPES.disc = function disc(M) {
  const meadow = M.meadow === true, tip = M.snout === 'point' ? 0.035 : 0, Ld = meadow ? 0.5 : 0.56, R0 = (Ld - tip) / 2, round = nf(M.round, 1), ex = 2.6;
  const W = [], HT = [], HB = [];
  for (const t of [0, 0.015, 0.04, 0.08, 0.14, 0.22, 0.32, 0.42, 0.52, 0.62, 0.72, 0.8, 0.87, 0.93, 0.97, 1]) {
    const s = t * Ld;
    let wv;
    if (s < tip) wv = 0.004 + (s / tip) * 0.03;   // (the Grove's pointed snout tip)
    else { const q = (s - tip - R0) / R0; wv = Math.max(0.03 * (tip ? 1 : 0), R0 * Math.sqrt(Math.max(0, 1 - q * q)) * round); }
    W.push([s, Math.max(0.008, wv)]);
    const th = 0.062 * Math.sqrt(Math.max(0, 1 - ((s - Ld * 0.42) / (Ld * 0.62)) ** 2));   // (thickest a little ahead of the middle)
    HT.push([s, Math.max(0.006, th)]); HB.push([s, Math.max(0.005, th * 0.5)]);
  }
  const f = prof({ w: W, ht: HT, hb: HB });
  const body = bodyGeo(f, { R: 30, A: 30, ex, s1: Ld });
  const bodyC = C(hexColor(M.body, 0x3e2944)), dark = bodyC.clone().multiplyScalar(0.45), bone = C(0xe6dcc4);
  const extras = [], glows = [];
  // the tail: a stout sting (the Velvet Ray) or a long whip with one barb near its root (the Grove)
  const whip = M.tail === 'whip_barb', tl = whip ? 0.62 : 0.5, tailPts = [];   // (the Grove's whip short enough that her disc is nearly the raft's width)
  for (let i = 0; i <= 16; i++) { const s = Ld - 0.04 + (i / 16) * tl; tailPts.push(new THREE.Vector3(0, 0.004 + Math.sin(i * 0.45) * 0.003, 0.5 - s)); }
  extras.push(paint(tube(tailPts, whip ? (u) => 0.016 * (1 - u) ** 1.5 + 0.0014 : (u) => 0.03 * (1 - u * 0.86) + 0.0018, 6), bodyC.clone().multiplyScalar(0.8)));
  { const u = whip ? 0.16 : 0.42, s = Ld - 0.04 + u * tl, r0 = whip ? 0.016 * (1 - u) ** 1.5 : 0.03 * (1 - u * 0.86);
    extras.push(paint(spike([0, 0.004 + r0 * 0.9, 0.5 - s], [0, 0.3, -1], 0.0055, whip ? 0.07 : 0.085, 4), bone)); }
  // the eyes on two small turrets, a spiracle behind each
  const es = tip + R0 * 0.42, ex0 = R0 * 0.24, top = f.top(es), tur = M.turrets === false ? 0 : 0.014 * (meadow ? 0.7 : 1);
  const eyes = { pos: [[ex0, top + tur, 0.5 - es], [-ex0, top + tur, 0.5 - es]], r: meadow ? 0.009 : 0.0125 };
  if (tur) for (const sd of [1, -1]) {
    extras.push(paint(blob(0.017, tur, 0.019, [sd * ex0, top + tur * 0.3, 0.5 - es], 10, 6), bodyC.clone().multiplyScalar(0.92)));
    extras.push(paint(blob(0.009, 0.004, 0.012, [sd * ex0 * 1.05, f.top(es + 0.05) + 0.001, 0.5 - es - 0.05], 8, 4), dark));
  }
  // the back: a dozen cream eye-rings, each with a dark centre (the Velvet Ray), laid on the skin
  const nRing = Math.max(0, Math.round(nf(M.eyeRings, 0)));
  if (nRing) {
    const rc = C(hexColor(M.ring, 0xe8d4a8)), spots = [[0.44, 0], [0.56, -0.44], [0.56, 0.44], [0.69, 0], [0.75, -0.62], [0.75, 0.62], [0.87, -0.3], [0.87, 0.3],
      [0.36, -0.64], [0.36, 0.64], [0.22, -0.7], [0.22, 0.7], [0.62, -0.78], [0.62, 0.78]].slice(0, nRing);
    const rings = [], cores = [];
    for (const [t, q] of spots) {
      const s = tip + t * (Ld - tip), { p, n } = backAt(f, s, q, ex), rr = 0.024 * (1 - Math.abs(q) * 0.25);
      const lift = [p[0] + n[0] * 0.0025, p[1] + n[1] * 0.0025, p[2] + n[2] * 0.0025];
      rings.push(onNormal(new THREE.TorusGeometry(rr, rr * 0.24, 4, 16), lift, n, true));
      cores.push(onNormal(blob(rr * 0.52, 0.0028, rr * 0.52, [0, 0, 0], 8, 4), lift, n));
    }
    extras.push(paint(mergeGeos(rings), rc), paint(mergeGeos(cores), dark));
  }
  // the Grove's meadow: moss tufts, curled ferns and tiny caps whose gills glow (LAKE2 §2.3)
  if (meadow) {
    _seed = 271;
    const moss = [0x5c6834, 0x4e5c2c, 0x6c7440, 0x76703c].map(C), fern = C(0x667a3a), stalk = C(0xd6c8a8), capC = [C(0xc8905a), C(0x9a6a6e), C(0xd8b47a)];
    const tufts = [], ferns = [], stalks = [], caps = [], gills = [];
    const spot = () => { const t = 0.14 + lrnd() * 0.76, q = (lrnd() * 2 - 1) * 0.72 * Math.sqrt(1 - ((t - 0.5) / 0.6) ** 2); return backAt(f, tip + t * (Ld - tip), q, ex); };
    for (let k = 0; k < 20; k++) {
      const { p, n } = spot(), r = 0.018 + lrnd() * 0.018;
      const g = lumpy(blob(r, r * 0.5, r * 1.15, [0, 0, 0], 9, 5), r * 0.28, 90 + k * 7, k);
      tufts.push(paint(onNormal(g, [p[0], p[1] + r * 0.12, p[2]], n, false, lrnd() * TAU), moss[k % moss.length]));
    }
    for (let k = 0; k < 7; k++) {
      const { p, n } = spot(), h = 0.04 + lrnd() * 0.022, d = 0.026 + lrnd() * 0.012, yaw = lrnd() * TAU;
      const pts = bezierPts([[0, 0, 0], [0, h * 0.85, d * 0.1], [0, h, d * 0.75], [0, h * 0.62, d]], 9);
      const leaf = [tube(pts, (u) => 0.0032 * (1 - u * 0.7), 4)];
      for (let i = 2; i < pts.length - 1; i++) for (const sd of [1, -1]) leaf.push(spike(pts[i].toArray(), [sd, 0.55, 0.2], 0.0034, 0.015 * (1 - i / 12), 3));
      const g = mergeGeos(leaf); g.rotateY(yaw);
      ferns.push(paint(onNormal(g, p, n), fern));
    }
    for (let k = 0; k < 9; k++) {
      const { p, n } = spot(), hS = 0.016 + lrnd() * 0.022, rc = 0.009 + lrnd() * 0.009;
      stalks.push(paint(onNormal(tube([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.002, hS * 0.6, 0), new THREE.Vector3(0, hS, 0)], 0.0032, 5), p, n), stalk));
      const cap = new THREE.SphereGeometry(1, 10, 4, 0, TAU, 0, Math.PI / 2); cap.scale(rc, rc * 0.62, rc); cap.translate(0, hS, 0);
      caps.push(paint(onNormal(cap, p, n), capC[k % capC.length]));
      const gl = new THREE.CylinderGeometry(rc * 0.86, rc * 0.4, 0.0022, 10, 1, true); gl.translate(0, hS - 0.0012, 0);
      gills.push(onNormal(gl, p, n));
    }
    extras.push(mergeGeos(tufts), mergeGeos(ferns), mergeGeos(stalks), mergeGeos(caps));
    glows.push(mergeGeos(gills));
  }
  if (tip) extras.push(paint(spike([0, f.yc(0), 0.5 + 0.002], [0, -0.05, 1], 0.009, 0.022, 5), bodyC.clone().multiplyScalar(0.85)));
  return { f, body, fins: [], extras, glows, bones: [], eyes, anim: { waveK: 2, amp: 0.03, freq: meadow ? 3.4 : 4.5, ray: meadow ? 0.09 : 0.13 }, gill: -1, s1: Ld,
    opts: { ray: true, noPhotophores: true, noLateral: true } };
};

// ---- bream: a plate on edge, as deep as it is long (`depth`, its height a share of its standard length), a blunt rounded head, a
// sawtooth belly keel, a long spiny dorsal, a scythe tail; `jaw: 'square_teeth'`: a mouth of square, human-looking teeth, a little open
// (the Falsesmile Barb's smile). The perch with a depth and a jaw.
LOOP_SHAPES.bream = function bream(M) {
  const D = nf(M.depth, 0.95), scythe = M.tail === 'scythe';
  const r = standard({
    w: [[0, 0.006], [0.03, 0.026], [0.1, 0.044], [0.28, 0.056], [0.48, 0.05], [0.66, 0.034], [0.8, 0.017], [0.9, 0.011], [1, 0.01]],
    ht: scaleK([[0, 0.012], [0.02, 0.08], [0.06, 0.2], [0.14, 0.34], [0.26, 0.44], [0.4, 0.47], [0.54, 0.42], [0.66, 0.3], [0.76, 0.16], [0.84, 0.07], [0.92, 0.042], [1, 0.04]], D),
    hb: scaleK([[0, 0.014], [0.02, 0.07], [0.06, 0.18], [0.16, 0.33], [0.3, 0.42], [0.44, 0.43], [0.58, 0.35], [0.7, 0.22], [0.8, 0.1], [0.88, 0.05], [1, 0.035]], D),
    yc: [[0, -0.07 * D], [0.08, -0.035 * D], [0.3, 0], [1, 0]],
    fins: [['tail', 'fork', scythe ? { s: 0.97, len: 0.28, h: 0.66 * D, sweep: 0.6, root: 0.28 } : { s: 0.97, len: 0.24, h: 0.5 * D }],
      ['dorsal', 'spiny', { a: 0.3, b: 0.68, h: 0.15 * D, rake: 0.45, segV: 12 }], ['ventral', 'soft', { a: 0.5, b: 0.8, h: 0.12 * D, rake: 0.45, segV: 10 }],
      ['ventral', 'frill', { a: 0.16, b: 0.46, h: 0.028 * D, rake: 0.1, segV: 10 }],
      ['pect', 'pect', { s: 0.2, len: 0.12, h: 0.06 }], ['pelvic', 'pect', { s: 0.34, len: 0.08, h: 0.05 }]],
    eye: { s: 0.085, r: 0.032, up: 0.3 }, gill: 0.21, R: 36, A: 20, anim: { waveK: 3, amp: 0.055, freq: 7 },
  }, M);
  const f = r.f;
  if (M.jaw === 'square_teeth') {   // the smile: four square teeth above, four below, cream, in a dark mouth held a little open
    const y0 = f.yc(0) - 0.002, teeth = [];
    for (const [yy, sg] of [[y0 + 0.012, 1], [y0 - 0.012, -1]]) for (const x of [-0.019, -0.0064, 0.0064, 0.019]) {
      teeth.push(xf(new THREE.BoxGeometry(0.0115, 0.014, 0.008), { p: [x, yy, 0.5 + 0.006 - Math.abs(x) * 0.42], r: [0, x * 7, sg * 0.05] }));
    }
    r.extras.push(paint(blob(0.032, 0.013, 0.01, [0, y0, 0.5 - 0.001], 10, 6), 0x0c0608));
    r.extras.push(paint(mergeGeos(teeth), 0xf0e8d4));
    r.extras.push(paint(tube(bezierPts([[-0.03, y0 + 0.004, 0.486], [0, y0 + 0.024, 0.503], [0.03, y0 + 0.004, 0.486]], 9), 0.004, 5), C(hexColor(M.body, 0x9a6450)).multiplyScalar(0.7)));
  }
  r.opts.noPhotophores = true;
  return r;
};

// ---- finlet: a rigid teardrop with a pointed head, two dorsals, a row of finlets above and below a thin keeled tail stalk and a stiff
// crescent tail (the Lostsea Mackerel); `scribbles`: dark marks over the back. The minnow's profile with finlets and a crescent.
LOOP_SHAPES.finlet = function finlet(M) {
  const g = nf(M.girth, 1), tk = nf(M.tailK, 1);
  const r = standard({
    w: scaleK([[0, 0.004], [0.04, 0.032], [0.13, 0.062], [0.28, 0.074], [0.46, 0.066], [0.64, 0.044], [0.78, 0.022], [0.88, 0.011], [0.95, 0.009], [1, 0.012]], g),
    ht: scaleK([[0, 0.004], [0.04, 0.034], [0.13, 0.07], [0.28, 0.084], [0.46, 0.074], [0.64, 0.048], [0.78, 0.022], [0.88, 0.011], [0.95, 0.009], [1, 0.016]], g),
    hb: scaleK([[0, 0.004], [0.04, 0.028], [0.15, 0.06], [0.3, 0.072], [0.48, 0.062], [0.66, 0.04], [0.8, 0.018], [0.9, 0.009], [1, 0.014]], g),
    yc: [[0, -0.008], [0.2, 0], [1, 0]],
    fins: [['tail', 'fork', { s: 0.965, len: 0.2 * tk, h: 0.48 * tk, sweep: 0.72, root: 0.2 }],
      ['dorsal', 'spiny', { a: 0.2, b: 0.4, h: 0.1, rake: 0.45, taper: 0.5, segV: 10 }], ['dorsal', 'soft', { a: 0.5, b: 0.6, h: 0.08, rake: 0.7, taper: 0.7 }],
      ['ventral', 'soft', { a: 0.52, b: 0.62, h: 0.07, rake: 0.7, taper: 0.7 }],
      ['pect', 'pect', { s: 0.17, len: 0.15, h: 0.034, out: 0.5, down: 0.25, back: 0.9 }], ['pelvic', 'pect', { s: 0.3, len: 0.05, h: 0.03 }]],
    eye: { s: 0.075, r: 0.021, up: 0.32 }, gill: 0.18, R: 40, anim: { waveK: 4.2, amp: 0.05, freq: 11 },
  }, M);
  const f = r.f, fin = C(hexColor(M.fin, 0x2c3246)).lerp(C(0xc8a060), 0.35), bits = [];
  if (M.finlets !== false) for (let k = 0; k < 6; k++) {   // six finlets above and six below the stalk, smaller toward the tail
    const s = 0.645 + k * 0.047, hh = 0.022 - k * 0.0016;
    bits.push(spike([0, f.top(s) - 0.002, 0.5 - s], [0, 1, -1.15], 0.0048, hh, 3), spike([0, f.bot(s) + 0.002, 0.5 - s], [0, -1, -1.15], 0.0048, hh * 0.9, 3));
  }
  r.extras.push(paint(mergeGeos(bits), fin));
  // the keels: a low ridge on each side of the thin stalk; the jaw's line, long and pointed
  const ks = 0.9, kd = [];
  for (const sd of [1, -1]) kd.push(blob(0.0045, 0.0042, 0.034, [sd * (f.w(ks) + 0.0025), f.yc(ks), 0.5 - ks], 6, 4));
  r.extras.push(paint(mergeGeos(kd), C(hexColor(M.body, 0x44506c)).multiplyScalar(0.7)));
  for (const sd of [1, -1]) r.extras.push(paint(tube(bezierPts([[sd * f.w(0.006) * 0.9, f.yc(0.02) - 0.004, 0.497], [sd * f.w(0.05), f.yc(0.05) - f.hb(0.05) * 0.3, 0.45], [sd * f.w(0.1) * 0.98, f.yc(0.1) - f.hb(0.1) * 0.25, 0.4]], 8), 0.0028, 4), 0x0a0806));
  r.opts.noPhotophores = true;
  if (M.scribbles !== undefined && M.scribbles !== null && M.scribbles !== false) r.opts.scribbles = cssColor(C(hexColor(M.scribbles === true ? 0x4a2a4e : M.scribbles, 0x4a2a4e)));
  if (Number.isFinite(Number(M.counterLine))) { r.opts.counterLine = Number(M.counterLine); r.opts.counterSoft = nf(M.counterSoft, 0.05); }
  return r;
};

// ---- the catfish's bullet heads (Sporewood's two; the Belled Matriarch keeps her shovel above). 'bullet_round': a blunt rounded snout
// on a deep, high-shouldered body, a tall pointed back fin like a shark's, a deeply forked tall tail, no whiskers, the eyes set below the
// mouth line (`eyeSet: 'low'`; the Downcast). 'bullet': a narrow rounded head with four pairs of long whiskers fanned forward, a tall
// back fin, a small fatty fin, a forked tail painted its own colour (`tailCol`: ember to amber; the Cindertail), a cream side line.
function catfishBullet(M) {
  const round = M.head === 'bullet_round', deep = M.deep === true, tallTail = M.tail === 'fork_tall';
  // (LAKE 2, the art pass: `shoulder` raises a hump behind the head, the Downcast's high shoulders over a deep body)
  const sh = nf(M.shoulder, 0), hump = (s) => 1 + sh * Math.exp(-(((s - 0.24) / 0.13) ** 2));
  const P = round ? {
    w: [[0, 0.02], [0.03, 0.05], [0.09, 0.07], [0.22, 0.08], [0.42, 0.07], [0.66, 0.045], [0.84, 0.022], [0.93, 0.013], [1, 0.012]],
    ht: scaleK([[0, 0.016], [0.03, 0.045], [0.1, 0.09], [0.16, 0.11], [0.22, 0.125], [0.3, 0.124], [0.36, 0.12], [0.55, 0.085], [0.75, 0.045], [0.88, 0.022], [1, 0.02]], (s) => (deep ? 1 : 0.78) * hump(s)),
    hb: scaleK([[0, 0.016], [0.03, 0.04], [0.1, 0.07], [0.25, 0.09], [0.42, 0.085], [0.62, 0.06], [0.8, 0.03], [0.9, 0.018], [1, 0.016]], deep ? 1 : 0.8),
    yc: [[0, -0.012], [0.15, 0], [1, 0]],
  } : {
    w: [[0, 0.014], [0.03, 0.042], [0.09, 0.06], [0.2, 0.066], [0.42, 0.056], [0.66, 0.038], [0.84, 0.018], [0.93, 0.011], [1, 0.01]],
    ht: [[0, 0.012], [0.03, 0.03], [0.09, 0.05], [0.2, 0.072], [0.38, 0.07], [0.6, 0.05], [0.8, 0.026], [0.92, 0.014], [1, 0.016]],
    hb: [[0, 0.012], [0.03, 0.03], [0.09, 0.045], [0.2, 0.06], [0.4, 0.058], [0.62, 0.042], [0.82, 0.02], [1, 0.014]],
    yc: [[0, -0.008], [0.15, 0], [1, 0]],
  };
  const tailO = { s: 0.965, len: tallTail ? 0.23 : 0.21, h: tallTail ? 0.44 : 0.34, sweep: tallTail ? 0.3 : 0.18 };
  const tint = M.tailCol !== undefined && M.tailCol !== null;
  const fins = [
    ...(tint ? [] : [['tail', 'fork', tailO]]),
    M.dorsal === 'sail' ? ['dorsal', 'soft', { a: 0.2, b: 0.4, h: 0.27, rake: 0.5, taper: 0.7, segV: 10 }] :
    M.dorsal === 'shark' ? ['dorsal', 'soft', { a: 0.22, b: 0.35, h: 0.18, rake: 0.55, taper: 0.82, segV: 8 }] : M.dorsal === 'tall' ? ['dorsal', 'soft', { a: 0.2, b: 0.31, h: 0.14, rake: 0.32, taper: 0.45 }] : ['dorsal', 'soft', { a: 0.24, b: 0.32, h: 0.07, rake: 0.3 }],
    ['ventral', 'soft', { a: 0.62, b: 0.78, h: 0.06, rake: 0.3 }],
    ['pect', 'pect', { s: 0.13, len: round ? 0.14 : 0.11, h: 0.05, yOff: -0.45 }], ['pelvic', 'pect', { s: 0.43, len: 0.06, h: 0.035 }],
    ...(M.fattyFin ? [['dorsal', 'soft', { a: 0.64, b: 0.8, h: 0.03, rake: 0.15 }]] : []),
  ];
  const low = M.eyeSet === 'low';
  const r = standard({ ...P, fins, eye: low ? { s: 0.055, r: 0.0105, up: -0.42, out: 0.93 } : { s: 0.06, r: 0.0095, up: 0.45, out: 0.88 }, gill: 0.17, R: 44,
    anim: { waveK: round ? 5.5 : 6.5, amp: 0.07, freq: round ? 4.2 : 5.4 } }, M);
  const f = r.f;
  if (tint) {   // the tail its own colour, ember at its root to amber at its tips (a second fin mesh: the other fins keep the fin colour)
    const a = C(hexColor(M.tailCol, 0xc4402a)), b = C(hexColor(M.tailTip, 0xf0a050)), z0 = 0.5 - tailO.s + 0.012, t = new THREE.Color();
    r.finsTint = [paint(finTail(f, 'fork', tailO), (x, y, z) => t.copy(a).lerp(b, Math.min(1, Math.max(0, (z0 - z) / tailO.len)) ** 0.8))];
  }
  // the mouth: a wide dark seam across the blunt snout, above the eyes when they are set low
  const my = f.yc(0.01) + (low ? 0.012 : -0.004);
  r.extras.push(paint(tube(bezierPts([[-f.w(0.02) * 0.95, my, 0.49], [0, my - 0.006, 0.503], [f.w(0.02) * 0.95, my, 0.49]], 10), 0.0032, 4), 0x0a0806));
  const n = Math.round(nf(M.whiskers, 0));
  if (n >= 2) {   // whiskers fanned forward (pairs: the long ones from the mouth's corners, then the nose's, then the chin's)
    const wc = C(hexColor(M.whiskerCol, 0xd8ccb8)), list = [];
    const pairs = [{ s: 0.02, y: 0.1, len: 0.36, fwd: 0.55, out: 0.62 }, { s: 0.004, y: 0.62, len: 0.2, fwd: 0.85, out: 0.34 },
      { s: 0.03, y: -0.78, len: 0.17, fwd: 0.66, out: 0.4 }, { s: 0.036, y: -0.96, len: 0.12, fwd: 0.72, out: 0.18 }].slice(0, Math.min(4, Math.floor(n / 2)));
    for (const q of pairs) for (const sd of [1, -1]) {
      const x0 = sd * f.w(q.s) * 0.82, y0 = f.yc(q.s) + (q.y >= 0 ? f.ht(q.s) : f.hb(q.s)) * q.y, z0 = 0.5 - q.s, L = q.len;
      const pts = bezierPts([[x0, y0, z0], [x0 + sd * q.out * L * 0.35, y0 - L * 0.04, z0 + q.fwd * L * 0.55], [x0 + sd * q.out * L * 0.8, y0 - L * 0.12, z0 + q.fwd * L * 0.62], [x0 + sd * q.out * L * 1.05, y0 - L * 0.22, z0 + q.fwd * L * 0.3]], 14);
      list.push(tube(pts, (u) => 0.0026 * (1 - u * 0.8) + 0.0006, 4));
    }
    r.extras.push(paint(mergeGeos(list), wc));
  }
  r.opts.noPhotophores = true;
  if (M.sideLine) r.opts.sideLine = cssColor(C(hexColor(M.sideLine === true ? 0xe8dcc4 : M.sideLine, 0xe8dcc4)));
  if (Number.isFinite(Number(M.counterLine))) { r.opts.counterLine = Number(M.counterLine); r.opts.counterSoft = nf(M.counterSoft, 0.05); }
  return r;
}

/** A model's loop parts (its loop plan, or its built plan's loop build), else null: the tests' seam (models-plans.test.mjs). */
export const loopPlanParts = (M) => (LOOP_SHAPES[M?.shape] ? LOOP_SHAPES[M.shape]({ ...M }) : loopVariant(M?.shape, { ...M }));
/** A built plan's loop build, when the species' model carries the brief's words for it (LAKE2 §2.3); null: the built plan. */
function loopVariant(shape, M) {
  if (shape === 'eel' && (M.girth !== undefined || M.strings || M.head === 'paddle' || M.dorsal === 'none' || M.ventral || M.pects === false || M.tail === 'point')) return loopEel(M);
  if (shape === 'carp' && (M.head !== undefined || M.back === 'arched' || M.scales === 'giant' || M.mouth === 'up')) return loopCarp(M);
  if (shape === 'minnow' && M.skin === 'glass') return loopFry(M);
  if (shape === 'crayfish' && M.carapace === 'dome') return loopCrayfish(M);
  if (shape === 'puffer' && (M.beak || M.eyeSpots || M.prickles)) return loopPuffer(M);
  return null;
}

// ---- the eel's words: girth (×, its whole length), head ('paddle': flat, blunt and wider than the neck; a girth under 1 gets a tiny
// pointed one), dorsal 'none', ventral ('ribbon_full': throat to tail tip; 'fold': a skin fold at the tail and no other fin), pects
// false, tail 'point', eye (×), section 'square', strings (n lit lines down each flank, the whole length: the Harpstring), mottle (the
// Threadling's bark), bellyLine
function loopEel(M) {
  const g = nf(M.girth, 1), paddle = M.head === 'paddle', pin = !paddle && g < 1, ex = M.section === 'square' ? 3.4 : 2;
  const W = paddle ? [[0, 0.03], [0.015, 0.042], [0.04, 0.048], [0.07, 0.04], [0.11, 0.035], [0.5, 0.034], [0.8, 0.024], [0.95, 0.01], [1, 0.003]]
    : pin ? [[0, 0.003], [0.025, 0.016], [0.06, 0.028], [0.12, 0.033], [0.5, 0.032], [0.8, 0.022], [0.93, 0.01], [0.985, 0.003], [1, 0.0012]]
      : [[0, 0.006], [0.02, 0.025], [0.06, 0.034], [0.12, 0.034], [0.5, 0.032], [0.8, 0.022], [0.95, 0.008], [1, 0.003]];
  const HT = paddle ? [[0, 0.009], [0.015, 0.014], [0.04, 0.018], [0.07, 0.025], [0.11, 0.032], [0.5, 0.034], [0.8, 0.024], [0.95, 0.01], [1, 0.003]]
    : pin ? [[0, 0.003], [0.025, 0.016], [0.06, 0.03], [0.5, 0.033], [0.8, 0.023], [0.93, 0.01], [0.985, 0.003], [1, 0.0012]]
      : [[0, 0.006], [0.02, 0.024], [0.06, 0.036], [0.5, 0.034], [0.8, 0.024], [0.95, 0.01], [1, 0.003]];
  const HB = paddle ? [[0, 0.011], [0.015, 0.016], [0.04, 0.02], [0.07, 0.025], [0.11, 0.03], [0.5, 0.032], [0.8, 0.022], [0.95, 0.009], [1, 0.003]]
    : scaleK(HT, 0.9);
  const fins = [];
  if (M.dorsal !== 'none') fins.push(['dorsal', 'ribbon', { a: 0.3, b: 1.0, h: 0.04, rake: 0, segV: 30 }]);
  if (M.ventral === 'ribbon_full') fins.push(['ventral', 'ribbon', { a: 0.1, b: 0.995, h: 0.034 * g, rake: 0, segV: 46 }]);
  else if (M.ventral === 'fold') fins.push(['ventral', 'ribbon', { a: 0.84, b: 1.0, h: 0.011, rake: 0, segV: 8 }], ['dorsal', 'ribbon', { a: 0.87, b: 1.0, h: 0.009, rake: 0, segV: 8 }]);
  else fins.push(['ventral', 'ribbon', { a: 0.5, b: 1.0, h: 0.03, rake: 0, segV: 24 }]);
  if (M.pects !== false) fins.push(['pect', 'pect', { s: paddle ? 0.12 : 0.08, len: 0.035 * Math.min(g, 1.2), h: 0.025 * Math.min(g, 1.2) }]);
  const r = standard({ w: scaleK(W, g), ht: scaleK(HT, g), hb: scaleK(HB, g), fins, ex, R: 64, A: ex > 2 ? 16 : 12,
    eye: { s: paddle ? 0.03 : pin ? 0.028 : 0.035, r: 0.012 * nf(M.eye, 1) * (g < 1 ? g : 1), up: paddle ? 0.62 : 0.45 }, gill: 0.07,
    anim: paddle ? { waveK: 10, amp: 0.06, freq: 7 } : pin ? { waveK: 15, amp: 0.085, freq: 10 } : { waveK: 13, amp: 0.07, freq: 9 } }, M);
  const f = r.f, n = Math.round(nf(M.strings, 0));
  // the strings: lit lines down each flank, the whole length, painted into the skin and its glow (the body's own light, never a neon
  // tube): their angles round the body, each flank's mirrored
  if (n > 0) { const th = []; for (let k = 0; k < n; k++) { const a = (k - (n - 1) / 2) * 0.5; th.push(a, Math.PI - a); } r.opts.strings = th; r.opts.glowScale = 0.75; }
  r.opts.noPhotophores = true;
  if (M.mottle) { const rad = (f.w(0.5) + f.ht(0.5)) / 2; r.opts.mottle = { tall: Math.max(1, (128 / (TAU * rad)) / 256) }; }
  if (M.bellyLine) r.opts.bellyLine = cssColor(C(hexColor(M.bellyLine === true ? 0xe8dcbc : M.bellyLine, 0xe8dcbc)));
  return r;
}

// ---- the carp's words: head (× at the head, the head a third of the length past 1.3), back 'arched', barbels 'none', mouth 'up' (a small
// upturned mouth), scales 'giant' (coin-sized scales, each outlined; `scaleEdge` their petal-cream edges, lit faint at night by the glow)
// with a short deep tail stalk and a broad forked tail: the Nightbloom, a huge barb
function loopCarp(M) {
  // (LAKE 2, the art pass: `headLen` where the head ends (its share of the length: the Nightbloom's a third) and `archK` the arch's height)
  const H = nf(M.head, 1), arch = M.back === 'arched', up = M.mouth === 'up', hl = nf(M.headLen, 0.42), ar = nf(M.archK, 0.46);
  const cw = curve1([[0, 0.01], [0.03, 0.05], [0.12, 0.09], [0.38, 0.12], [0.62, 0.095], [0.84, 0.04], [0.93, 0.024], [1, 0.018]]);
  const ch = curve1([[0, 0.01], [0.03, 0.05], [0.14, 0.12], [0.36, 0.18], [0.6, 0.14], [0.84, 0.05], [0.93, 0.03], [1, 0.026]]);
  const cb = curve1([[0, 0.01], [0.03, 0.045], [0.15, 0.11], [0.4, 0.15], [0.62, 0.11], [0.84, 0.04], [1, 0.022]]);
  const hk = (s) => 1 + (H - 1) * (1 - sstep(hl * 0.38, hl, s)), ak = (s) => (arch ? 1 + ar * Math.exp(-(((s - 0.33) / 0.18) ** 2)) : 1), sk = (s) => 1 + 0.45 * sstep(0.66, 0.92, s);
  const S = [0, 0.03, 0.08, 0.14, 0.22, 0.3, 0.38, 0.48, 0.6, 0.72, 0.84, 0.93, 1];
  const r = standard({
    w: S.map((s) => [s, cw(s) * (1 + (H - 1) * 0.55 * (1 - sstep(hl * 0.38, hl, s))) * sk(s) * 0.94]),
    ht: S.map((s) => [s, ch(s) * hk(s) * ak(s) * sk(s)]), hb: S.map((s) => [s, cb(s) * hk(s) * sk(s)]),
    yc: up ? [[0, 0.026], [0.06, 0.008], [0.2, 0], [1, 0]] : [[0, -0.02], [0.2, 0], [1, 0]],
    fins: [['tail', 'fork', { s: 0.97, len: 0.27, h: 0.5 }], ['dorsal', 'soft', { a: 0.34, b: 0.58, h: 0.16, rake: 0.3, segV: 10 }],
      ['ventral', 'soft', { a: 0.66, b: 0.77, h: 0.08 }], ['pect', 'pect', { s: 0.34, len: 0.15, h: 0.07 }], ['pelvic', 'pect', { s: 0.5, len: 0.09, h: 0.05 }]],
    eye: { s: 0.1, r: 0.026, up: 0.18 }, gill: H > 1.2 ? Math.max(0.33, hl * 0.72) : 0.22, R: 36, anim: { waveK: 3.2, amp: 0.06, freq: 5.2 },
  }, M);
  const f = r.f;
  if (up) { const y0 = f.yc(0); r.extras.push(paint(tube(bezierPts([[-0.016, y0 + 0.004, 0.495], [0, y0 + 0.014, 0.503], [0.016, y0 + 0.004, 0.495]], 8), 0.0036, 4), 0x0a0608)); }
  if (M.barbels !== 'none') r.extras.push(...barbels(f, M, 0.09));
  if (M.scales === 'giant') { r.opts.giantScales = cssColor(C(hexColor(M.scaleEdge, 0xe8d6b6))); r.opts.glowScale = 0.45; }   // (the bloom: faint)
  r.opts.noPhotophores = true;
  return r;
}

// ---- the minnow's `skin: 'glass'`: the Netcloud Fry (the integration's fix: it read as a small Dusk Minnow). Its own build, never the
// minnow's: a blunt round head with a big eye ringed dark, a short body deepest just behind the head, a thin stalk and a rounded fan of a
// tail (the minnow's is a fork); a clear, cool, milky body (low opacity, a fresnel edge, no scales, no lateral line) through which the dark
// spine and its comb, the silvered gut and the eye show crisp (drawn after the glass: `glass`), and one warm accent, the amber tail spot.
// eye (×); `cloud` (5: the show holds one, four more of the same mesh beside it)
function loopFry(M) {
  const r = standard({
    w: [[0, 0.026], [0.03, 0.05], [0.1, 0.062], [0.26, 0.06], [0.5, 0.044], [0.74, 0.022], [0.86, 0.011], [1, 0.008]],
    ht: [[0, 0.03], [0.03, 0.06], [0.12, 0.088], [0.28, 0.094], [0.52, 0.07], [0.74, 0.034], [0.86, 0.016], [1, 0.014]],
    hb: [[0, 0.03], [0.03, 0.056], [0.14, 0.082], [0.32, 0.086], [0.56, 0.058], [0.76, 0.024], [1, 0.012]],
    fins: [['tail', 'round', { s: 0.95, len: 0.2, h: 0.3 }], ['dorsal', 'soft', { a: 0.44, b: 0.7, h: 0.07 }],
      ['ventral', 'soft', { a: 0.48, b: 0.74, h: 0.05 }], ['pect', 'pect', { s: 0.17, len: 0.11, h: 0.06 }]],
    eye: { s: 0.1, r: 0.03, up: 0.22, out: 0.86 }, anim: { waveK: 5, amp: 0.1, freq: 10 },
  }, M);
  const f = r.f, k = nf(M.eye, 1);
  r.eyes.r *= k;
  const ink = C(0x221a2a), bones = [], spine = [];
  for (let i = 0; i <= 16; i++) { const s = 0.16 + (i / 16) * 0.78; spine.push(new THREE.Vector3(0, f.yc(s) + f.ht(s) * 0.1, 0.5 - s)); }
  bones.push(tube(spine, (u) => 0.0075 * (1 - u * 0.5), 5));
  for (let i = 0; i < 10; i++) {   // short spines up and down off it, a glass fish's comb
    const s = 0.24 + i * 0.056, y = f.yc(s) + f.ht(s) * 0.1;
    bones.push(spike([0, y, 0.5 - s], [0, 1, -0.45], 0.0019, f.ht(s) * 0.55, 3), spike([0, y, 0.5 - s], [0, -1, -0.45], 0.0019, f.hb(s) * 0.5, 3));
  }
  // the eye's dark ring (the iris's rim, a fry's huge eye), round each eye
  for (const [x, y, z] of r.eyes.pos) bones.push(xf(new THREE.TorusGeometry(r.eyes.r * 1.18, r.eyes.r * 0.26, 5, 16), { p: [x, y, z], r: [0, Math.PI / 2, 0] }));
  r.extras.push(paint(mergeGeos(bones), ink));
  r.extras.push(paint(blob(0.02, 0.026, 0.07, [0, f.yc(0.3) - f.hb(0.3) * 0.3, 0.5 - 0.3], 10, 7), 0x9ea6b4));   // (the silvered gut)
  if (M.tailSpot) {
    const sp = [], s = 0.9;
    for (const sd of [1, -1]) sp.push(blob(0.006, 0.017, 0.019, [sd * f.w(s) * 0.95, f.yc(s), 0.5 - s], 8, 6));
    r.extras.push(paint(mergeGeos(sp), C(hexColor(M.tailSpot === 'amber' ? 0xe8a246 : M.tailSpot, 0xe8a246))));
  }
  Object.assign(r.opts, { translucent: true, glass: true, opacity: 0.3, glowCol: 0xdce8f0, noPhotophores: true, noLateral: true });
  return r;
}

// ---- the crayfish's `carapace: 'dome'`: a broad domed shell like a mushroom cap, ribbed with gills under its rim, that hides the body from
// above; claws (× their size), antennae (× their length, amber at the tips), a short fan tail; the cap cream-ochre with plum freckles
// (`freckle`). The Capshell
function loopCrayfish(M) {
  const body = C(hexColor(M.body, 0x7a4e36)), capC = C(hexColor(M.cap, 0xd6ae76)), frk = C(hexColor(M.freckle, 0x5a3450)), fin = C(hexColor(M.fin, 0x4a2c3e));
  const kc = nf(M.claws, 1), ka = nf(M.antennae, 1), amber = C(0xe8a04a);
  const parts = [], t = new THREE.Color();
  // the cap: a dome over the front two-thirds, a thick rolled rim, freckled
  const cap = new THREE.SphereGeometry(1, 22, 9, 0, TAU, 0, Math.PI / 2); cap.scale(0.175, 0.11, 0.215); cap.translate(0, -0.004, 0.25);
  const fr = (x, z) => { const h = Math.sin(x * 157.3 + z * 91.7) * 43758.5453; return h - Math.floor(h); };
  parts.push(paint(cap, (x, y, z) => (y > 0.012 && fr(x, z) > 0.84 ? frk : t.copy(capC).multiplyScalar(0.86 + 0.14 * Math.min(1, y / 0.1)))));
  parts.push(paint(xf(new THREE.TorusGeometry(1, 0.06, 5, 26), { p: [0, -0.004, 0.25], r: [Math.PI / 2, 0, 0], s: [0.172, 0.215, 0.6] }), capC.clone().multiplyScalar(0.92)));
  parts.push(paint(blob(0.07, 0.048, 0.13, [0, -0.03, 0.27], 12, 8), body));
  let z = 0.06;
  for (let k = 0; k < 5; k++) {   // the tail's segments behind the cap, narrowing
    const sc = 0.82 - k * 0.09;
    parts.push(paint(blob(0.07 * sc, 0.046 * sc, 0.045, [0, -0.02 - k * 0.005, z], 10, 7), k % 2 ? body.clone().multiplyScalar(0.78) : body));
    z -= 0.056;
  }
  const zt = z + 0.03;
  const fan = card('round', 3, 4, (u, v) => [(v - 0.5) * 0.15 * (0.5 + u * 0.6), -0.04 + u * 0.01, zt - u * 0.08]);
  // under the rim: the gills, thin ribs running in toward the middle
  const gills = [];
  for (let k = 0; k < 30; k++) { const a = (k / 30) * TAU, ca = Math.cos(a), sa = Math.sin(a);
    gills.push(tube([new THREE.Vector3(ca * 0.06, -0.012, 0.25 + sa * 0.08), new THREE.Vector3(ca * 0.165, -0.008, 0.25 + sa * 0.205)], 0.0028, 3, { capEnd: false })); }
  const legs = [], claws = [], tips = [];
  for (const side of [1, -1]) {
    const arm = bezierPts([[side * 0.06, -0.03, 0.4], [side * (0.06 + 0.09 * kc), -0.03, 0.44 + 0.05 * kc], [side * (0.06 + 0.08 * kc), -0.03, 0.46 + 0.14 * kc]], 7);
    claws.push(tube(arm, 0.014 * Math.max(0.6, kc), 5));
    claws.push(blob(0.05 * kc, 0.032 * kc, 0.095 * kc, [side * (0.06 + 0.085 * kc), -0.03, 0.47 + 0.24 * kc], 10, 7, [0, side * -0.12, 0]));
    for (let k = 0; k < 4; k++) {
      const lz = 0.35 - k * 0.055;
      legs.push(tube(bezierPts([[side * 0.06, -0.04, lz], [side * 0.17, -0.05, lz - 0.01], [side * 0.24, -0.13, lz - 0.04]], 6), (u) => 0.0075 * (1 - u * 0.6), 4));
    }
    // the antennae: very long, over the cap and back past the tail, amber at their tips
    const base = [side * 0.03, 0.0, 0.45];
    const ctrl = [[0, 0, 0], [0.09, 0.06, 0.3], [0.27, 0.05, 0.17], [0.4, -0.02, -0.15]].map(([x, y, zz]) => [base[0] + side * x * ka, base[1] + y * ka, base[2] + zz * ka]);
    const pts = bezierPts(ctrl, 22);
    legs.push(tube(pts.slice(0, 18), (u) => 0.0058 * (1 - u * 0.7), 4));
    tips.push(tube(pts.slice(17), (u) => 0.0022 * (1 - u * 0.5), 4), blob(0.0075, 0.0075, 0.0075, pts[pts.length - 1].toArray(), 6, 5));
    legs.push(blob(0.012, 0.012, 0.012, [side * 0.04, 0.0, 0.452], 6, 5));
  }
  const extras = [paint(mergeGeos(claws), capC.clone().multiplyScalar(0.8)), paint(mergeGeos(legs), fin), paint(mergeGeos(tips), amber), paint(mergeGeos(gills), body.clone().multiplyScalar(0.62))];
  return { f: null, body: mergeGeos(parts), fins: [fan], extras, glows: [], bones: [], eyes: { pos: [[0.042, 0.004, 0.462], [-0.042, 0.004, 0.462]], r: 0.012 },
    anim: { waveK: 3, amp: 0.05, freq: 7, axis: [0, 1] }, gill: -1, opts: { vertexBody: true }, extentZ: 0.7 };
}

// ---- the puffer's words: beak (4: four fused teeth, two above and two below), prickles 'short', eyeSpots 'amber' (an amber-ringed eye-
// spot on each flank); lit through its skin like a paper lantern when it puffs (`lantern`: the show puffs it)
function loopPuffer(M) {
  const r = standard({
    w: [[0, 0.04], [0.04, 0.14], [0.15, 0.28], [0.4, 0.34], [0.62, 0.28], [0.8, 0.13], [0.9, 0.06], [1, 0.04]],
    ht: [[0, 0.04], [0.04, 0.14], [0.15, 0.29], [0.4, 0.35], [0.62, 0.28], [0.8, 0.13], [0.9, 0.06], [1, 0.04]],
    hb: [[0, 0.04], [0.04, 0.13], [0.15, 0.27], [0.4, 0.33], [0.62, 0.26], [0.8, 0.12], [0.9, 0.055], [1, 0.04]],
    fins: [['tail', 'round', { s: 0.98, len: 0.13, h: 0.18 }], ['dorsal', 'soft', { a: 0.72, b: 0.86, h: 0.08 }],
      ['ventral', 'soft', { a: 0.72, b: 0.86, h: 0.07 }], ['pect', 'pect', { s: 0.25, len: 0.09, h: 0.08, out: 0.9, back: 0.3, yOff: 0 }]],
    eye: { s: 0.2, r: 0.04, up: 0.4, out: 0.86 }, gill: 0.3, A: 20, anim: { waveK: 2.2, amp: 0.05, freq: 6 },
  }, M);
  const f = r.f, sp = [], short = M.prickles === 'short';
  _seed = 11;
  for (let k = 0; k < (short ? 110 : 64); k++) {
    const s = 0.12 + lrnd() * 0.66, th = lrnd() * TAU, c = Math.cos(th), sn = Math.sin(th);
    if (sn < -0.75) continue;
    if (M.eyeSpots && Math.abs(s - 0.5) < 0.09 && Math.abs(sn) < 0.3) continue;   // (none through the eye-spots)
    const x = f.w(s) * c, y = f.yc(s) + (sn >= 0 ? f.ht(s) : f.hb(s)) * sn;
    sp.push(spike([x * 0.98, y * 0.98, 0.5 - s], [c, sn, -0.35], short ? 0.008 : 0.011, short ? 0.022 + lrnd() * 0.01 : 0.055 + lrnd() * 0.025, 4));
  }
  r.extras.push(paint(mergeGeos(sp), C(hexColor(M.fin, 0x888888)).lerp(C(PALE), 0.35)));
  const nb = Math.round(nf(M.beak, 0)), y0 = f.yc(0) - 0.012;
  if (nb >= 4) {   // the beak: four fused teeth, a dark seam between the upper pair and the lower
    const teeth = [];
    for (const [yy, sg] of [[y0 + 0.014, 1], [y0 - 0.014, -1]]) for (const sd of [1, -1]) teeth.push(blob(0.02, 0.013, 0.02, [sd * 0.0185, yy, 0.5 + 0.012], 8, 6, [sg * 0.25, 0, sd * 0.18]));
    r.extras.push(paint(mergeGeos(teeth), 0xf2e8d0));
    r.extras.push(paint(blob(0.04, 0.0045, 0.014, [0, y0, 0.5 + 0.012], 10, 4), 0x0c0608));
  } else r.extras.push(paint(blob(0.035, 0.028, 0.025, [0, f.yc(0) - 0.01, 0.5 + 0.01]), 0xe8dcc0));
  if (M.eyeSpots) {   // an amber-ringed eye-spot on each flank, a dark centre
    const s = 0.5, ring = [], core = [];
    for (const sd of [1, -1]) {
      const p = [sd * f.w(s) * 1.0, f.yc(s) + f.ht(s) * 0.05, 0.5 - s], n = [sd, 0.05, 0];
      ring.push(onNormal(new THREE.TorusGeometry(0.062, 0.016, 5, 22), p, n, true));
      core.push(onNormal(blob(0.044, 0.006, 0.044, [0, 0, 0], 12, 5), p, n));
    }
    r.extras.push(paint(mergeGeos(ring), C(hexColor(M.eyeSpotCol, 0xe0a048))), paint(mergeGeos(core), 0x1a0e18));
  }
  r.opts.noPhotophores = true;
  if (M.lantern !== false && M.glow !== null && M.glow !== undefined) r.opts.lantern = true;
  return r;
}
// <<< LAKE 2, lane F

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
    // (LAKE 2, the art pass: a loop plan's `counterLine` (its height round the body, −1 belly … 1 back) draws the countershade as a hard
    // line, `counterSoft` its half-width: the Lostsea Mackerel's near-black back over a pale belly, the Downcast's plum low on its flank)
    const cl = Number.isFinite(parts.opts?.counterLine) ? parts.opts.counterLine : null, cs = Number.isFinite(parts.opts?.counterSoft) ? parts.opts.counterSoft : 0.05;
    const t = cl !== null ? THREE.MathUtils.smoothstep(up, cl - cs, cl + cs) : shape === 'lamprey' ? THREE.MathUtils.smoothstep(up, -0.85, -0.35) : THREE.MathUtils.smoothstep(up, -0.5, 0.45);
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
  } else if (pat === 'scales' && !parts.opts.giantScales) {
    g.lineWidth = 1.1;
    for (let y = 2; y < H; y += 6) for (let x = W * 0.16 + ((y / 6) % 2) * 3; x < W * 0.96; x += 6) {
      g.strokeStyle = 'rgba(0,0,0,0.26)'; g.beginPath(); g.arc(x, y, 3.4, -Math.PI / 2, Math.PI / 2); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.08)'; g.beginPath(); g.arc(x - 1, y, 2.4, -Math.PI / 2, Math.PI / 2); g.stroke();
    }
  } else if (pat === 'spots' && parts.opts.rose) {
    // (the loop's Rosefleck Trout: small rust-rose flecks, thicker along the flank, a few pale ones on the back)
    for (let k = 0; k < 40; k++) { const x = W * (0.14 + rnd() * 0.8), a = -0.04 + rnd() * 0.26, r = 1.3 + rnd() * 2; const col = rnd() < 0.78 ? 'rgba(176,96,104,0.78)' : 'rgba(236,226,220,0.55)'; dot(g, x, yP(a), r, col); dot(g, x, yM(a), r, col); }
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
  // >>> LAKE 2, lane F (LAKE2.md §2.3): Sporewood's skins, each set only by a loop plan's builder (no built fish carries one). The
  // canvas runs snout → tail along x and round the body along y, so a mark that must read round on a thin body is drawn tall
  const O = parts.opts;
  if (O.giantScales) {   // the Nightbloom: coin-sized scales, each a darker cup edged in cream like a petal (the edges lit faint amber)
    const r = 9.5;
    for (let y = -4, row = 0; y < H + r; y += r * 0.92, row++) {
      for (let x = W * 0.3 + (row % 2) * r * 0.85; x < W * 0.97; x += r * 1.7) {
        g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.arc(x, y, r, -Math.PI / 2, Math.PI / 2); g.fill();
        g.strokeStyle = O.giantScales; g.lineWidth = 1.7; g.beginPath(); g.arc(x, y, r, -Math.PI * 0.42, Math.PI * 0.42); g.stroke();
        if (eg) { eg.strokeStyle = 'rgba(255,255,255,0.55)'; eg.lineWidth = 1.5; eg.beginPath(); eg.arc(x, y, r, -Math.PI * 0.42, Math.PI * 0.42); eg.stroke(); }
      }
    }
  }
  if (O.mottle) {   // the Threadling: root-mottled, olive-brown and cream blotches like bark
    const tall = O.mottle.tall || 4;
    for (let k = 0; k < 90; k++) {
      const x = W * (0.04 + rnd() * 0.94), y = rnd() * H, rx = 1.6 + rnd() * 3.6, ry = rx * tall * (0.7 + rnd() * 0.6);
      g.fillStyle = k % 3 === 0 ? 'rgba(226,212,184,0.34)' : 'rgba(30,24,14,0.42)';
      g.beginPath(); g.ellipse(x, y, rx, ry, (rnd() - 0.5) * 0.5, 0, TAU); g.fill();
    }
  }
  if (O.scribbles) {   // the Lostsea Mackerel: dark plum scribbles, wavy bars running down its back to the hard line, none below it
    // (LAKE 2, the art pass: tall wavy bars from the dorsal ridge to the countershade line, thick enough to read in the show's light)
    g.strokeStyle = O.scribbles; g.lineWidth = 2.4; g.lineCap = 'round'; g.lineJoin = 'round';
    const aLow = Number.isFinite(O.counterLine) ? Math.max(-0.2, Math.asin(Math.max(-1, Math.min(1, O.counterLine))) / TAU) + 0.02 : 0.04;
    for (let k = 0; k < 22; k++) {
      const x0 = W * (0.2 + k * 0.032 + rnd() * 0.01);
      for (const side of [1, -1]) {
        const y0 = side > 0 ? yP(0.25) : yM(0.25), y1 = side > 0 ? yP(aLow) : yM(aLow);
        g.beginPath(); g.moveTo(x0, y0);
        for (let i = 1; i <= 7; i++) { const u = i / 7; g.lineTo(x0 + Math.sin(u * 5.2 + k * 1.3) * 3.4 + u * 2, y0 + (y1 - y0) * u); }
        g.stroke();
      }
    }
  }
  if (O.sideLine) {   // the Cindertail: one cream line from the gill to the tail
    g.fillStyle = O.sideLine;
    for (const y of [yP(0.01), yM(0.01)]) { g.beginPath(); g.moveTo(W * (parts.gill || 0.15), y - 1.6); g.lineTo(W * 0.98, y - 1); g.lineTo(W * 0.98, y + 1); g.lineTo(W * (parts.gill || 0.15), y + 1.6); g.closePath(); g.fill(); }
  }
  if (O.strings && eg) {   // the Harpstring's strings: thin lines the whole length at their angles round the body, lit
    for (const th of O.strings) {
      const y = H * (1 - (th + Math.PI / 2) / TAU);
      g.fillStyle = 'rgba(255,214,190,0.55)'; g.fillRect(W * 0.07, y - 1, W * 0.88, 2);
      eg.fillStyle = 'rgba(255,255,255,0.9)'; eg.fillRect(W * 0.07, y - 0.9, W * 0.88, 1.8);
    }
  }
  if (O.bellyLine) { g.fillStyle = O.bellyLine; g.fillRect(W * 0.06, 0, W * 0.9, 3); g.fillRect(W * 0.06, H - 3, W * 0.9, 3); }
  if (O.lantern && eg) {   // the Festival Puffer: a paper lantern's glow, fuller below than on the back, its ribs dark rings round the body
    for (let y = 0; y < H; y++) {
      const v = 1 - (y + 0.5) / H, up = Math.sin(-Math.PI / 2 + v * TAU), k = 0.38 + 0.62 * THREE.MathUtils.smoothstep(-up, -0.6, 0.9);
      eg.fillStyle = `rgba(255,255,255,${k.toFixed(3)})`; eg.fillRect(W * 0.08, y, W * 0.86, 1);
    }
    eg.fillStyle = 'rgba(0,0,0,0.62)'; g.fillStyle = 'rgba(0,0,0,0.12)';
    for (let x = W * 0.14; x < W * 0.92; x += 15) { eg.fillRect(x, 0, 2, H); g.fillRect(x, 0, 1.5, H); }
  }
  // <<< LAKE 2, lane F
  // lateral line
  if (!O.noLateral) {
    g.strokeStyle = 'rgba(255,255,255,0.22)'; g.setLineDash([3, 3]); g.lineWidth = 1.2;
    for (const y of [yP(0.02), yM(0.02)]) { g.beginPath(); g.moveTo(W * 0.22, y); g.quadraticCurveTo(W * 0.55, y + (y > 64 ? -3 : 3), W * 0.95, y); g.stroke(); }
    g.setLineDash([]);
  }
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
  // photophores (none on a loop plan that lights only what its brief names: noPhotophores)
  if (eg && !O.noPhotophores) {
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
// LAKE 2, lane F: the Festival Puffer's lantern (its glow at rest is glowBase's 0.14; + LANTERN_GLOW at a full puff; the show puffs it to
// LANTERN_SHOW_PUFF, short of the shader's full swell so the hands still hold it), and the Netcloud Fry's cloud: where the four beside the
// held one sit (a handful, close round it), in its own lengths [x (toward the lens), y, z (toward its snout), scale, the turn about x, y, z]
const LANTERN_GLOW = 0.95, LANTERN_SHOW_PUFF = 0.55;
// (the integration's fix: the four sit above the held one and out toward the lens, clear of the fist that pinches it, as a little cloud)
const FRY_CLOUD = [[0.22, 0.34, 0.3, 0.92, 0.2, 0.16, 0.22], [0.16, 0.5, -0.18, 0.86, -0.2, -0.2, -0.26], [0.3, 0.2, 0.62, 0.9, 0.1, 0.24, -0.16], [0.26, 0.62, 0.36, 0.84, 0, -0.16, 0.28]];
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
    // (LAKE 2, lane F: a built plan's loop build when the model carries the brief's words; else the plan as built)
    const parts = (LOOP_ON && loopVariant(shape, M)) || SH[shape](M, { loop: LOOP_ON });
    const glowCol = hexColor(parts.opts.glowCol ?? M.glow, 0xffd9a0);   // (the lamprey's gill holes light lavender with no glow on its body)
    const skin = parts.opts.vertexBody ? { map: null, emissiveMap: null } : bodyTexture(M, shape, parts);
    const eyes = eyeGeos(parts.eyes, M.eyes, glowCol);
    const fins = parts.fins.length ? mergeGeos(parts.fins) : null;
    const finsTint = parts.finsTint?.length ? mergeGeos(parts.finsTint) : null;   // (LAKE 2, lane F: a fin painted its own colour)
    const extras = parts.extras.length ? mergeGeos(parts.extras) : null;
    const glows = parts.glows.length ? mergeGeos(parts.glows) : null;
    const bones = parts.bones.length ? mergeGeos(parts.bones) : null;
    // visual extent along z (body + fins) for size normalisation
    let extentZ = parts.extentZ;
    const bb = new THREE.Box3().setFromBufferAttribute(parts.body.attributes.position);
    if (fins) { fins.computeBoundingBox(); bb.union(fins.boundingBox); }
    if (finsTint) { finsTint.computeBoundingBox(); bb.union(finsTint.boundingBox); }
    if (extras && parts.opts.ray) { extras.computeBoundingBox(); bb.union(extras.boundingBox); }
    if (!extentZ) extentZ = Math.max(0.3, bb.max.z - bb.min.z);
    // v3 true scale measures what the size model calls length (CONTRACT §13.7): snout to tail tip over body and fins (a ray
    // with its tail, a jelly bell and trailing arms), never the authored extentZ: claws, barbels and lure stalks reach past it
    if (extras && parts.opts.jelly) { extras.computeBoundingBox(); bb.union(extras.boundingBox); }
    const ext = { maxZ: bb.max.z, minZ: bb.min.z, halfW: Math.max(Math.abs(bb.min.x), Math.abs(bb.max.x)), maxY: bb.max.y, minY: bb.min.y };
    const extentTrue = Math.max(1e-3, bb.max.z - bb.min.z);
    const entry = { M, shape, parts, skin, eyes, fins, finsTint, extras, glows, bones, extentZ, extentTrue, ext, glowCol, hasGlow: M.glow !== null && M.glow !== undefined };
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
    // (LAKE 2, lane F: a paper lantern's glow rests low and rises as it puffs: `lantern`, the Festival Puffer)
    const glowBase = E.hasGlow ? (P.opts.lantern ? 0.14 : (translucent ? 0.9 : 1.6) * (P.opts.glowScale ?? 1)) : 0;
    const thick = THREE.MathUtils.clamp(0.012 / L, 0.006, 0.016) * (E.shape === 'leviathan' ? 0.6 : 1);
    const mats = [];
    const outline = deformOutline({ thickness: thick }, spec); mats.push(outline);
    // body
    const bodyMat = deformToon({
      color: P.opts.vertexBody ? 0xffffff : 0xffffff, map: E.skin.map, vertexColors: !!P.opts.vertexBody,
      emissive: E.hasGlow ? E.glowCol : 0x000000, emissiveIntensity: glowBase, rim: translucent ? 0.7 : 0.42,
      rimColor: translucent ? E.glowCol : PALE, transparent: translucent, opacity: P.opts.opacity ?? (P.opts.jelly ? 0.6 : translucent ? 0.4 : 1),
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
    // (LAKE 2, lane F: a fin painted its own colour, the Cindertail's ember tail: its own mesh, so the other fins keep theirs)
    let tintFins = null;
    if (E.finsTint) {
      const tm = deformToon({ color: 0xffffff, vertexColors: true, map: getFinAtlas(), side: THREE.DoubleSide, rim: 0.25 }, spec);
      tm.alphaTest = 0.45;
      mats.push(tm);
      tintFins = new THREE.Mesh(E.finsTint, tm); tintFins.name = 'fins_tint';
      scaler.add(tintFins);
    }
    // extras (teeth, barbels, spines, plates, lure stalk, tentacles…)
    let extrasMesh = null;
    if (E.extras) {
      // (the integration's fix: a glass fish's spine, gut, eye rings and tail spot are drawn after its glass, so they show crisp through
      // it rather than hazed by it: the transparent pass, after the body's renderOrder)
      const glass = !!P.opts.glass;
      const xm = deformToon({ color: 0xffffff, vertexColors: true, rim: 0.4, transparent: !!P.opts.jelly || glass, opacity: P.opts.jelly ? 0.7 : 1,
        emissive: P.opts.jelly ? E.glowCol : 0x000000, emissiveIntensity: P.opts.jelly ? 0.6 : 0 }, spec);
      if (P.opts.jelly) xm.depthWrite = false;
      mats.push(xm);
      const ex = new THREE.Mesh(E.extras, xm); ex.name = 'extras'; extrasMesh = ex;
      if (glass) ex.renderOrder = 4;
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
    // (LAKE 2, lane F: `cloud` n, the Netcloud Fry's: the show holds one and n − 1 more of the same meshes and materials beside it,
    // in the picture only while it is shown (setWet), so the water, the fight, the bounds and every measure see one fish)
    let cloud = null;
    const nCloud = LOOP_ON ? Math.min(1 + FRY_CLOUD.length, Math.round(Number(M.cloud) || 0)) : 0;
    if (nCloud > 1) {
      cloud = new THREE.Group(); cloud.name = 'cloud';
      const meshes = scaler.children.filter((o) => o.isMesh);
      for (let i = 1; i < nCloud; i++) {
        const [cx, cy, cz, cs, rx, ry, rz] = FRY_CLOUD[i - 1], grp = new THREE.Group();
        grp.scale.setScalar(k * cs); grp.position.set(cx * L, cy * L, cz * L); grp.rotation.set(rx, ry, rz);
        for (const m of meshes) {
          const mm = new THREE.Mesh(m.geometry, m.material); mm.renderOrder = m.renderOrder;
          for (const ch of m.children) if (ch.isMesh) { const o = new THREE.Mesh(ch.geometry, ch.material); o.renderOrder = ch.renderOrder; mm.add(o); }
          grp.add(mm);
        }
        cloud.add(grp);
      }
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
        if (E.shape === 'puffer') {
          const want = Math.min(1, struggle * 0.8 + flop * 0.5);
          // (LAKE 2, lane F: a lantern is puffed in the show, and lit through its skin as it swells)
          puff = THREE.MathUtils.damp(puff, P.opts.lantern && wetK > 0.5 ? Math.max(want, LANTERN_SHOW_PUFF) : want, 4, dt); U.uPuff.value = puff;
          if (P.opts.lantern) bodyMat.emissiveIntensity = (glowBase + LANTERN_GLOW * puff) * glowK * (1 - silK);
        }
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
        if (f && sM >= 0 && sM <= (P.s1 ?? (E.shape === 'ray' ? 0.8 : 1))) {
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
        if (cloud) { if (w > 0 && cloud.parent !== pivot) pivot.add(cloud); else if (w <= 0 && cloud.parent) cloud.parent.remove(cloud); }
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
