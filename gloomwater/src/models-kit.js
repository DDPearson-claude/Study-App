// models-kit.js — shared helpers for the actors author (models.js, actors.js and their
// helpers): procedural geometry builders, a tiny geometry merger, deformable toon /
// basic / ink-outline materials with hurt-flash + dissolve FX, and value noise GLSL.
import * as THREE from 'three';
import { toonMaterial, INK } from './toon.js';

export const TAU = Math.PI * 2;

// ------------------------------------------------------------------ GLSL
export const NOISE_GLSL = /* glsl */`
float gwHash(vec3 p) { p = fract(p * 0.3183099 + vec3(0.11, 0.17, 0.13)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float gwNoise(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(gwHash(i), gwHash(i + vec3(1,0,0)), f.x), mix(gwHash(i + vec3(0,1,0)), gwHash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(gwHash(i + vec3(0,0,1)), gwHash(i + vec3(1,0,1)), f.x), mix(gwHash(i + vec3(0,1,1)), gwHash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
`;
const NO_DEFORM = 'void gwDeform(inout vec3 p, inout vec3 n) {}';

/** Shared FX uniforms (hurt flash + dissolve). Pass the same object to body + outline. */
export function fxUniforms({ edge = 0xffc98a, flash = 0xffffff, scale = 6 } = {}) {
  return {
    uGwFlash: { value: 0 }, uGwDissolve: { value: 0 },
    uGwEdge: { value: new THREE.Color(edge) }, uGwFlashColor: { value: new THREE.Color(flash) },
    uGwDisScale: { value: scale },
  };
}

/**
 * Inject deformation + FX into a built-in material.
 * spec = { key, uniforms, pars /* GLSL: uniforms/attributes + gwDeform(inout vec3 p, inout vec3 n) *\/,
 *          fx: 'none'|'uniform'|'instanced' }
 * kind = 'toon' | 'basic' | 'outline'
 */
function inject(mat, spec, kind) {
  const prev = mat.onBeforeCompile;
  const fx = spec.fx || 'none';
  const pars = spec.pars || NO_DEFORM;
  const uniforms = spec.uniforms || {};
  mat.onBeforeCompile = (shader, renderer) => {
    prev.call(mat, shader, renderer);
    Object.assign(shader.uniforms, uniforms);
    if (kind === 'outline') shader.uniforms.uGwThick = mat.userData.thick;
    const inst = fx === 'instanced';
    let vs = shader.vertexShader;
    vs = vs.replace('#include <common>', `#include <common>
${inst ? 'attribute vec3 aFx; varying vec3 vGwFx;' : ''}
${kind === 'outline' ? 'uniform float uGwThick;' : ''}
varying vec3 vGwLocal;
${pars}`);
    if (kind === 'toon') {
      vs = vs.replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
vec3 gwP = vec3(position); gwDeform(gwP, objectNormal);`);
      vs = vs.replace('#include <begin_vertex>', `#include <begin_vertex>
transformed = gwP; vGwLocal = position; ${inst ? 'vGwFx = aFx;' : ''}`);
    } else {
      vs = vs.replace('#include <begin_vertex>', `#include <begin_vertex>
vec3 gwP = vec3(position); vec3 gwN = vec3(normal); gwDeform(gwP, gwN);
transformed = gwP${kind === 'outline' ? ' + normalize(gwN) * uGwThick' : ''}; vGwLocal = position; ${inst ? 'vGwFx = aFx;' : ''}`);
    }
    shader.vertexShader = vs;
    if (fx !== 'none') {
      let fs = shader.fragmentShader;
      fs = fs.replace('#include <common>', `#include <common>
${NOISE_GLSL}
varying vec3 vGwLocal;
${inst ? 'varying vec3 vGwFx;' : 'uniform float uGwFlash; uniform float uGwDissolve;'}
uniform vec3 uGwEdge; uniform vec3 uGwFlashColor; uniform float uGwDisScale;`);
      fs = fs.replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
float gwFlash = ${inst ? 'vGwFx.x' : 'uGwFlash'};
float gwFade = ${inst ? 'vGwFx.y' : 'uGwDissolve'};
float gwEdgeK = 0.0;
if (gwFade > 0.001) {
  vec3 gq = vGwLocal * uGwDisScale + ${inst ? 'vGwFx.z * 13.7' : '0.0'};
  float gn = gwNoise(gq) * 0.7 + gwNoise(gq * 3.3) * 0.3;
  gn = gn * 0.9 + 0.1 * clamp(vGwLocal.y * 0.5 + 0.5, 0.0, 1.0);
  if (gn < gwFade * 1.08) discard;
  gwEdgeK = 1.0 - smoothstep(gwFade * 1.08, gwFade * 1.08 + 0.09, gn);
}`);
      fs = fs.replace('#include <opaque_fragment>', `outgoingLight = mix(outgoingLight, uGwFlashColor, clamp(gwFlash, 0.0, 1.0));
outgoingLight += uGwEdge * gwEdgeK * 2.5;
#include <opaque_fragment>`);
      shader.fragmentShader = fs;
    }
  };
  const base = mat.customProgramCacheKey?.() || '';
  const key = `gw|${kind}|${spec.key || 'nodeform'}|${fx}`;
  mat.customProgramCacheKey = () => base + key;
  return mat;
}

/** Toon material (toon.toonMaterial look) with vertex deformation + optional FX. */
export function deformToon(opts, spec = {}) { return inject(toonMaterial(opts), spec, 'toon'); }
/** MeshBasicMaterial with deformation + FX (glows, eyes). */
export function deformBasic(params, spec = {}) { return inject(new THREE.MeshBasicMaterial(params), spec, 'basic'); }
/** Unlit glow (bloom-friendly) with deformation + FX. */
export function deformGlow(color, intensity = 2, spec = {}, extra = {}) {
  const c = new THREE.Color(color).multiplyScalar(intensity);
  return deformBasic({ color: c, toneMapped: false, fog: true, ...extra }, spec);
}
/** Inverted-hull ink outline sharing the same deformation (same look as toon.addOutline). */
export function deformOutline({ thickness = 0.025, color = INK } = {}, spec = {}) {
  const mat = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide, fog: true });
  mat.userData.thick = { value: thickness };
  return inject(mat, spec, 'outline');
}
/** Outline child mesh using a deformOutline material. */
export function outlineMesh(geo, mat) {
  const o = new THREE.Mesh(geo, mat);
  o.name = 'outline'; o.userData.isOutline = true; o.renderOrder = -1;
  return o;
}

// ------------------------------------------------------------------ geometry helpers
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _p = new THREE.Vector3();

/** Apply a TRS transform to a geometry. p=[x,y,z], r=[x,y,z] euler (XYZ) or quaternion q, s=number|[x,y,z]. */
export function xf(geo, { p = [0, 0, 0], r = null, q = null, s = 1, order = 'XYZ' } = {}) {
  if (q) _q.copy(q); else if (r) _q.setFromEuler(_e.set(r[0], r[1], r[2], order)); else _q.identity();
  if (typeof s === 'number') _s.setScalar(s); else _s.set(s[0], s[1], s[2]);
  _m.compose(_p.set(p[0], p[1], p[2]), _q, _s);
  geo.applyMatrix4(_m);
  return geo;
}

/** Fill a vertex colour attribute with one colour (or fn(x,y,z,i)->Color|hex). */
export function paint(geo, c) {
  const n = geo.attributes.position.count, arr = new Float32Array(n * 3), col = new THREE.Color();
  const pos = geo.attributes.position;
  for (let i = 0; i < n; i++) {
    if (typeof c === 'function') { const v = c(pos.getX(i), pos.getY(i), pos.getZ(i), i); col.set(v); } else col.set(c);
    arr[i * 3] = col.r; arr[i * 3 + 1] = col.g; arr[i * 3 + 2] = col.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return geo;
}

/** Add a float/vec attribute computed per vertex: fn(x,y,z,i) -> number | number[]. */
export function attr(geo, name, size, fn) {
  const pos = geo.attributes.position, n = pos.count, arr = new Float32Array(n * size);
  for (let i = 0; i < n; i++) {
    const v = typeof fn === 'function' ? fn(pos.getX(i), pos.getY(i), pos.getZ(i), i) : fn;
    if (size === 1) arr[i] = v; else for (let k = 0; k < size; k++) arr[i * size + k] = v[k];
  }
  geo.setAttribute(name, new THREE.BufferAttribute(arr, size));
  return geo;
}

/** Merge geometries (union of attributes; missing colour = white, other missing = 0). Non-indexed result. */
export function mergeGeos(list) {
  const geos = list.filter(Boolean).map((g) => (g.index ? g.toNonIndexed() : g));
  if (!geos.length) return new THREE.BufferGeometry();
  const names = new Map();
  for (const g of geos) for (const n in g.attributes) if (!names.has(n)) names.set(n, g.attributes[n].itemSize);
  let total = 0;
  for (const g of geos) total += g.attributes.position.count;
  const out = new THREE.BufferGeometry();
  for (const [n, size] of names) {
    const arr = new Float32Array(total * size);
    let off = 0;
    for (const g of geos) {
      const a = g.attributes[n], c = g.attributes.position.count;
      if (a && a.itemSize === size && !a.isInterleavedBufferAttribute) arr.set(a.array.subarray(0, c * size), off * size);
      else if (n === 'color') arr.fill(1, off * size, (off + c) * size);
      off += c;
    }
    out.setAttribute(n, new THREE.BufferAttribute(arr, size));
  }
  out.computeBoundingSphere();
  out.computeBoundingBox();
  return out;
}

/** Copy with normals averaged over coincident positions (for crack-free ink outlines on hard-edged geometry). */
export function smoothNormals(geo) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  g.computeVertexNormals();
  const pos = g.attributes.position, nor = g.attributes.normal, map = new Map();
  const key = (i) => `${Math.round(pos.getX(i) * 1e4)},${Math.round(pos.getY(i) * 1e4)},${Math.round(pos.getZ(i) * 1e4)}`;
  for (let i = 0; i < pos.count; i++) {
    const k = key(i); let v = map.get(k);
    if (!v) { v = [0, 0, 0]; map.set(k, v); }
    v[0] += nor.getX(i); v[1] += nor.getY(i); v[2] += nor.getZ(i);
  }
  for (let i = 0; i < pos.count; i++) {
    const v = map.get(key(i)); const l = Math.hypot(v[0], v[1], v[2]) || 1;
    nor.setXYZ(i, v[0] / l, v[1] / l, v[2] / l);
  }
  return g;
}

/**
 * Tube along a polyline. pts: Vector3[]; radius: number | fn(u 0..1) -> r. Indexed, with uv (u along, v around).
 * Ends close to a point when the radius there is ~0; capStart/capEnd add flat-ish caps.
 */
export function tube(pts, radius = 0.02, radial = 6, { capEnd = true, capStart = false } = {}) {
  const n = pts.length, rf = typeof radius === 'function' ? radius : () => radius;
  const T = [], N = [], B = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    T.push(new THREE.Vector3().subVectors(b, a).normalize());
  }
  // parallel transport frames
  const up = Math.abs(T[0].y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  N.push(new THREE.Vector3().crossVectors(T[0], up).normalize());
  B.push(new THREE.Vector3().crossVectors(T[0], N[0]).normalize());
  for (let i = 1; i < n; i++) {
    const nn = N[i - 1].clone().sub(T[i].clone().multiplyScalar(N[i - 1].dot(T[i]))).normalize();
    N.push(nn); B.push(new THREE.Vector3().crossVectors(T[i], nn).normalize());
  }
  const pos = [], nor = [], uv = [], idx = [];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1), r = rf(u);
    for (let j = 0; j <= radial; j++) {
      const th = (j / radial) * TAU, c = Math.cos(th), s = Math.sin(th);
      const nx = N[i].x * c + B[i].x * s, ny = N[i].y * c + B[i].y * s, nz = N[i].z * c + B[i].z * s;
      pos.push(pts[i].x + nx * r, pts[i].y + ny * r, pts[i].z + nz * r);
      nor.push(nx, ny, nz); uv.push(u, j / radial);
    }
  }
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < radial; j++) {
    const a = i * (radial + 1) + j, b = a + radial + 1;
    idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
  const addCap = (i, dir) => {
    const c = pos.length / 3; const p = pts[i];
    pos.push(p.x + T[i].x * dir * rf(i ? 1 : 0) * 0.6, p.y + T[i].y * dir * rf(i ? 1 : 0) * 0.6, p.z + T[i].z * dir * rf(i ? 1 : 0) * 0.6);
    nor.push(T[i].x * dir, T[i].y * dir, T[i].z * dir); uv.push(i ? 1 : 0, 0.5);
    const base = i * (radial + 1);
    for (let j = 0; j < radial; j++) { if (dir > 0) idx.push(base + j + 1, c, base + j); else idx.push(base + j, c, base + j + 1); }
  };
  if (capEnd) addCap(n - 1, 1);
  if (capStart) addCap(0, -1);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

/** Points along a quadratic/cubic bezier given control points (arrays). */
export function bezierPts(ctrl, n = 12) {
  const v = ctrl.map((c) => new THREE.Vector3(c[0], c[1], c[2]));
  const curve = v.length === 3 ? new THREE.QuadraticBezierCurve3(v[0], v[1], v[2]) : v.length === 4 ? new THREE.CubicBezierCurve3(v[0], v[1], v[2], v[3]) : new THREE.CatmullRomCurve3(v);
  return curve.getPoints(n - 1);
}

/** Smooth 1D curve through [x, y] keys (Catmull-Rom, clamped ends). */
export function curve1(keys) {
  const k = keys.slice().sort((a, b) => a[0] - b[0]);
  return (x) => {
    if (x <= k[0][0]) return k[0][1];
    if (x >= k[k.length - 1][0]) return k[k.length - 1][1];
    let i = 0;
    while (i < k.length - 2 && x > k[i + 1][0]) i++;
    const p0 = k[Math.max(0, i - 1)], p1 = k[i], p2 = k[i + 1], p3 = k[Math.min(k.length - 1, i + 2)];
    const t = (x - p1[0]) / (p2[0] - p1[0] || 1);
    const m1 = (p2[1] - p0[1]) / ((p2[0] - p0[0]) || 1) * (p2[0] - p1[0]);
    const m2 = (p3[1] - p1[1]) / ((p3[0] - p1[0]) || 1) * (p2[0] - p1[0]);
    const t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * p1[1] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2[1] + (t3 - t2) * m2;
  };
}

/** Cone pointing from `base` along `dir` (arrays), radius r, length h. */
export function spike(base, dir, r, h, seg = 5) {
  const g = new THREE.ConeGeometry(r, h, seg, 1);
  g.translate(0, h / 2, 0);
  const d = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
  _q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
  return xf(g, { p: base, q: _q });
}

/** Ellipsoid (sphere scaled). */
export function blob(rx, ry, rz, p = [0, 0, 0], ws = 12, hs = 8, r = null) {
  const g = new THREE.SphereGeometry(1, ws, hs);
  g.scale(rx, ry, rz);
  return xf(g, { p, r });
}

/** Hash-jitter vertices along their normals (lumpy organic surfaces). Works on indexed geometry. */
export function lumpy(geo, amt = 0.03, freq = 7, seed = 1) {
  const pos = geo.attributes.position, nor = geo.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const n = Math.sin(x * freq + seed) * Math.sin(y * freq * 1.3 + seed * 2) * Math.sin(z * freq * 0.9 + seed * 3);
    const n2 = Math.sin(x * freq * 2.7 + 1.7) * Math.sin(y * freq * 2.1 + 0.3) * Math.sin(z * freq * 2.4 + 2.1);
    const d = (n * 0.7 + n2 * 0.3) * amt;
    pos.setXYZ(i, x + nor.getX(i) * d, y + nor.getY(i) * d, z + nor.getZ(i) * d);
  }
  geo.computeVertexNormals();
  return geo;
}

// ------------------------------------------------------------------ misc
/** Soft round texture for Points (white, alpha falloff). */
let _dotTex = null;
export function dotTexture() {
  if (_dotTex) return _dotTex;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.35, 'rgba(255,255,255,0.55)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  _dotTex = new THREE.CanvasTexture(c);
  return _dotTex;
}

/** Dark soft blob-shadow texture. */
let _shadowTex = null;
export function shadowTexture() {
  if (_shadowTex) return _shadowTex;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(0,0,0,0.85)'); grd.addColorStop(0.5, 'rgba(0,0,0,0.5)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  _shadowTex = new THREE.CanvasTexture(c);
  return _shadowTex;
}

/** Dispose materials (and their per-instance textures if `textures`) of an object tree, keeping geometry (cached). */
export function disposeMaterials(root, { textures = false } = {}) {
  root?.traverse?.((o) => {
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of mats) {
      if (m.userData?.shared) continue;
      if (textures) for (const k in m) { const v = m[k]; if (v && v.isTexture && !v.userData?.shared) v.dispose(); }
      m.dispose?.();
    }
  });
}

export const hexColor = (c, fallback = 0xffffff) => (c === null || c === undefined || Number.isNaN(Number(c)) ? fallback : c);
