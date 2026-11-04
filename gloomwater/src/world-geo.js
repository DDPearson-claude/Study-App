// world-geo.js — noise + procedural geometry helpers for the world module (world author).
// Everything here is deterministic (seeded) and allocation-heavy only at build time.
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export const TAU = Math.PI * 2;

// ------------------------------------------------------------------ noise
function h3(x, y, z) {
  // integer lattice hash -> [0,1)
  let n = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}
/** Smooth 3D value noise in [0,1]. */
export function vnoise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  let xf = x - xi, yf = y - yi, zf = z - zi;
  xf = xf * xf * (3 - 2 * xf); yf = yf * yf * (3 - 2 * yf); zf = zf * zf * (3 - 2 * zf);
  const a = h3(xi, yi, zi), b = h3(xi + 1, yi, zi), c = h3(xi, yi + 1, zi), d = h3(xi + 1, yi + 1, zi);
  const e = h3(xi, yi, zi + 1), f = h3(xi + 1, yi, zi + 1), g = h3(xi, yi + 1, zi + 1), h = h3(xi + 1, yi + 1, zi + 1);
  const x1 = a + (b - a) * xf, x2 = c + (d - c) * xf, x3 = e + (f - e) * xf, x4 = g + (h - g) * xf;
  const y1 = x1 + (x2 - x1) * yf, y2 = x3 + (x4 - x3) * yf;
  return y1 + (y2 - y1) * zf;
}
/** Fractal value noise in [0,1]. */
export function fbm3(x, y, z, oct = 3) {
  let s = 0, a = 0.5, n = 0;
  for (let i = 0; i < oct; i++) { s += vnoise3(x, y, z) * a; n += a; x *= 2.03; y *= 2.03; z *= 2.03; a *= 0.5; }
  return s / n;
}
/** Periodic angular noise: terms [{k, amp, ph}] -> value ~[-sum(amp), sum(amp)]. */
export function makeRingNoise(rng, ks, ampFn) {
  return ks.map((k, i) => ({ k, amp: ampFn(k, i) * (0.55 + 0.45 * rng()), ph: rng() * TAU }));
}
export function ringNoise(terms, a) {
  let s = 0;
  for (let i = 0; i < terms.length; i++) { const t = terms[i]; s += t.amp * Math.cos(t.k * a + t.ph); }
  return s;
}

// ------------------------------------------------------------------ colour
const _c = new THREE.Color();
export function lin(hex) { _c.set(hex); return [_c.r, _c.g, _c.b]; }
export function mixArr(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
export function scaleArr(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }

// ------------------------------------------------------------------ geometry prep
/**
 * Normalise a geometry for merging: indexed, position+normal+color only.
 * opts.matrix: Matrix4 applied first. opts.color: [r,g,b] linear, or
 * opts.colorFn(x,y,z,nx,ny,nz) -> [r,g,b] evaluated in final (post-matrix) space.
 */
export function prep(geo, opts = {}) {
  for (const k of Object.keys(geo.attributes)) if (k !== 'position' && k !== 'normal') geo.deleteAttribute(k);
  if (!geo.attributes.normal) geo.computeVertexNormals();
  if (!geo.index) geo = mergeVertices(geo, 1e-4);
  if (opts.matrix) geo.applyMatrix4(opts.matrix);
  const pos = geo.attributes.position, nor = geo.attributes.normal, n = pos.count;
  const col = new Float32Array(n * 3);
  const fixed = opts.color || [1, 1, 1];
  for (let i = 0; i < n; i++) {
    const c = opts.colorFn ? opts.colorFn(pos.getX(i), pos.getY(i), pos.getZ(i), nor.getX(i), nor.getY(i), nor.getZ(i), i) : fixed;
    col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return geo;
}

/** Merge a list of prepped geometries (or return an empty geometry). Disposes the inputs. */
export function merge(list) {
  if (!list.length) return null;
  const g = list.length === 1 ? list[0] : mergeGeometries(list, false);
  if (list.length > 1) for (const x of list) x.dispose();
  g.computeBoundingSphere();
  return g;
}

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _p = new THREE.Vector3();
/** Compose a matrix from position, euler (x,y,z) and scale (number or [x,y,z]). */
export function mat(x, y, z, rx = 0, ry = 0, rz = 0, s = 1) {
  _e.set(rx, ry, rz, 'YXZ');
  _q.setFromEuler(_e);
  if (Array.isArray(s)) _s.set(s[0], s[1], s[2]); else _s.set(s, s, s);
  return new THREE.Matrix4().compose(_p.set(x, y, z), _q, _s);
}

/** Irregular boulder: displaced icosphere, flared/flattened below y=0. Unit-ish size (r,h). */
export function rockGeo(rng, { r = 1, h = 1, detail = 2, rough = 0.32, flare = 0.35, squash = 0.55, top = 0.0 } = {}) {
  let g = new THREE.IcosahedronGeometry(1, detail);
  g.deleteAttribute('normal'); g.deleteAttribute('uv');
  g = mergeVertices(g, 1e-4);
  const p = g.attributes.position;
  const ox = rng() * 50, oy = rng() * 50, oz = rng() * 50;
  const fx = 1.3 + rng() * 0.8;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n = fbm3(x * fx + ox, y * fx + oy, z * fx + oz, 3);
    // ridged component for chiselled faces
    const rdg = 1 - Math.abs(vnoise3(x * 3.1 + oz, y * 3.1 + ox, z * 3.1 + oy) * 2 - 1);
    const s = 1 + (n - 0.5) * 2 * rough + (rdg - 0.5) * rough * 0.35;
    let X = x * s * r, Y = y * s * h, Z = z * s * r;
    if (y < 0) { const f = 1 + flare * Math.min(1, -y * 1.6); X *= f; Z *= f; Y *= squash; }
    else if (top > 0 && y > 0.55) { Y = h * (0.55 + (y - 0.55) * (1 - top)) * s; }
    p.setXYZ(i, X, Y, Z);
  }
  g.computeVertexNormals();
  return g;
}

/** Tapered tube along a list of points (Vector3[]), radius function r(t). Indexed. */
export function taperTube(points, radiusFn, radial = 7, segs = null) {
  const curve = new THREE.CatmullRomCurve3(points);
  const n = segs || Math.max(4, points.length * 4);
  const frames = curve.computeFrenetFrames(n, false);
  const pos = [], nor = [], idx = [];
  const P = new THREE.Vector3(), N = new THREE.Vector3();
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    curve.getPointAt(t, P);
    const r = radiusFn(t);
    const Nn = frames.normals[i], B = frames.binormals[i];
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * TAU;
      const c = Math.cos(a), s = Math.sin(a);
      N.set(c * Nn.x + s * B.x, c * Nn.y + s * B.y, c * Nn.z + s * B.z).normalize();
      pos.push(P.x + N.x * r, P.y + N.y * r, P.z + N.z * r);
      nor.push(N.x, N.y, N.z);
    }
  }
  for (let i = 0; i < n; i++) for (let j = 0; j < radial; j++) {
    const a = i * (radial + 1) + j, b = a + radial + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}

/** Lathe from [ [r,y], ... ] profile. */
export function latheGeo(profile, segs = 16) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(Math.max(0.0001, r), y)), segs);
  return g;
}

/** Hexagonal crystal shard with pointed tip, base at y=0, height h, radius r. */
export function crystalGeo(r = 0.4, h = 2, sides = 6, tip = 0.28) {
  const prof = [[0.0001, -0.6], [r * 0.85, -0.6], [r, 0], [r * 0.92, h * (1 - tip)], [0.0001, h]];
  const g = new THREE.LatheGeometry(prof.map(([a, b]) => new THREE.Vector2(a, b)), sides);
  return g;
}

/** Displace vertices of an indexed geometry by noise along normals (organic wobble). */
export function wobble(geo, amp = 0.1, freq = 1.2, seed = 0) {
  const p = geo.attributes.position, n = geo.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const d = (vnoise3(x * freq + seed, y * freq, z * freq - seed) - 0.5) * 2 * amp;
    p.setXYZ(i, x + n.getX(i) * d, y + n.getY(i) * d, z + n.getZ(i) * d);
  }
  geo.computeVertexNormals();
  return geo;
}
