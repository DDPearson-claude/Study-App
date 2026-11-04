// survival-fx.js — small pooled, bloom-friendly VFX owned by survival.js (survival author).
// Imported only by survival.js.
//
//   rings  : brush-stroke shock rings lying on the water (Gutter-burst, Ward, Second Wick,
//            Last Flicker, dawn mending). A tiny pool of meshes sharing one geometry; a
//            ring that is not playing is invisible (zero draw calls).
//   motes  : one additive THREE.Points pool (sparks, embers, rising warm motes) — 1 draw call
//            while anything is alive, hidden otherwise.
//
// Everything is additive + toneMapped:false so it blooms, and tinted from the warm lantern
// family so the Wick's light stays "the only warm light in a cold world" (DESIGN §19.1).
import * as THREE from 'three';
import { glowTexture } from './toon.js';

const RING_POOL = 6;
const MOTE_MAX = 192;

const RING_VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// A hand-inked stroke: the band is broken by low-frequency angular noise so it reads like a
// quick brush ring rather than a perfect CG torus; a faint wash fills the inside early on.
const RING_FRAG = /* glsl */`
uniform float uT;        // 0..1 life
uniform vec3  uColor;
uniform float uOpacity;
uniform float uWidth;    // band half-width (uv units)
uniform float uSeed;
uniform float uBreak;    // 0 = solid ring, 1 = heavily broken stroke
uniform float uWash;     // inner wash strength
varying vec2 vUv;
float h1(float n) { return fract(sin(n) * 43758.5453123); }
float n1(float x) { float i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(h1(i), h1(i + 1.0), f); }
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  if (r > 1.0) discard;
  float a = atan(p.y, p.x);
  float t = clamp(uT, 0.0, 1.0);
  float e = 1.0 - pow(1.0 - t, 3.0);
  float front = mix(0.3, 0.94, e);                         // starts at the raft's edge, not under the Wick
  float w = uWidth * (1.0 - 0.5 * t);
  float ang = (a + 3.14159265) * 2.8647889;                 // 18 cells around the ring
  float n = n1(ang + uSeed * 7.31) * 0.62 + n1(ang * 2.3 - uSeed * 3.7) * 0.38;
  float br = mix(1.0, smoothstep(0.22, 0.62, n), uBreak);
  float d = abs(r - front);
  float band = smoothstep(w, 0.0, d) * br;
  float core = smoothstep(w * 0.32, 0.0, d) * br;
  float trail = smoothstep(front, front - 0.35, r) * smoothstep(front - 0.6, front - 0.35, r) * 0.35 * br;
  float wash = smoothstep(front * 0.45, front, r) * step(r, front) * uWash * (1.0 - t) * (1.0 - t);   // trails the front only
  float fade = pow(1.0 - t, 1.5);
  float alpha = (band * 0.7 + core * 0.9 + trail * 0.5 + wash) * fade * uOpacity;
  if (alpha < 0.003) discard;
  gl_FragColor = vec4(uColor * (1.0 + core * 1.6), alpha);
}`;

const MOTE_VERT = /* glsl */`
attribute float aSize;
attribute float aAlpha;
attribute vec3 aColor;
uniform float uScale;
varying float vAlpha;
varying vec3 vColor;
void main() {
  vAlpha = aAlpha;
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aAlpha > 0.001 ? clamp(aSize * uScale / max(0.1, -mv.z), 1.0, 96.0) : 0.0;
  gl_Position = projectionMatrix * mv;
}`;

const MOTE_FRAG = /* glsl */`
uniform sampler2D uMap;
varying float vAlpha;
varying vec3 vColor;
void main() {
  float a = texture2D(uMap, gl_PointCoord).a * vAlpha;
  if (a < 0.004) discard;
  gl_FragColor = vec4(vColor * 1.45, a);
}`;

export function createSurvivalFx(ctx) {
  const group = new THREE.Group();
  group.name = 'survival-fx';

  // ---------------------------------------------------------------- rings
  const ringGeo = new THREE.PlaneGeometry(2, 2, 1, 1);
  ringGeo.rotateX(-Math.PI / 2);
  const rings = [];
  for (let i = 0; i < RING_POOL; i++) {
    const mat = new THREE.ShaderMaterial({
      vertexShader: RING_VERT,
      fragmentShader: RING_FRAG,
      uniforms: {
        uT: { value: 0 }, uColor: { value: new THREE.Color(0xffb347) }, uOpacity: { value: 1 },
        uWidth: { value: 0.12 }, uSeed: { value: Math.random() * 10 }, uBreak: { value: 0.5 }, uWash: { value: 0.2 },
      },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false,
    });
    const mesh = new THREE.Mesh(ringGeo, mat);
    mesh.visible = false;
    mesh.frustumCulled = false;
    mesh.renderOrder = 6;
    mesh.userData.noOutline = true;
    group.add(mesh);
    rings.push({ mesh, mat, t: 0, dur: 0.5, delay: 0, radius: 4, x: 0, z: 0, follow: false, active: false });
  }

  function ring(x, z, { radius = 4, color = 0xffb347, duration = 0.5, width = 0.12, opacity = 1, breakup = 0.5, wash = 0.2, delay = 0, follow = false } = {}) {
    if (!Number.isFinite(x) || !Number.isFinite(z)) return;
    // reuse a free slot, else the oldest (largest t)
    let best = null;
    for (const r of rings) { if (!r.active) { best = r; break; } if (!best || r.t / r.dur > best.t / best.dur) best = r; }
    const r = best;
    r.active = true; r.t = 0; r.dur = Math.max(0.05, duration); r.delay = Math.max(0, delay);
    r.radius = Math.max(0.2, radius); r.x = x; r.z = z; r.follow = !!follow;
    const u = r.mat.uniforms;
    u.uColor.value.set(color); u.uOpacity.value = opacity; u.uWidth.value = width;
    u.uBreak.value = breakup; u.uWash.value = wash; u.uSeed.value = Math.random() * 10; u.uT.value = 0;
    r.mesh.scale.setScalar(r.radius / 0.94);
    r.mesh.visible = false;
  }

  // ---------------------------------------------------------------- motes
  const pos = new Float32Array(MOTE_MAX * 3);
  const col = new Float32Array(MOTE_MAX * 3);
  const size = new Float32Array(MOTE_MAX);
  const alpha = new Float32Array(MOTE_MAX);
  const vel = new Float32Array(MOTE_MAX * 3);
  const life = new Float32Array(MOTE_MAX);
  const maxLife = new Float32Array(MOTE_MAX);
  const baseSize = new Float32Array(MOTE_MAX);
  const grav = new Float32Array(MOTE_MAX);
  const drag = new Float32Array(MOTE_MAX);
  const geo = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage);
  const colAttr = new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage);
  const sizeAttr = new THREE.BufferAttribute(size, 1).setUsage(THREE.DynamicDrawUsage);
  const alphaAttr = new THREE.BufferAttribute(alpha, 1).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('position', posAttr);
  geo.setAttribute('aColor', colAttr);
  geo.setAttribute('aSize', sizeAttr);
  geo.setAttribute('aAlpha', alphaAttr);
  const moteMat = new THREE.ShaderMaterial({
    vertexShader: MOTE_VERT,
    fragmentShader: MOTE_FRAG,
    uniforms: { uMap: { value: glowTexture(64, 1.8) }, uScale: { value: 400 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false,
  });
  const points = new THREE.Points(geo, moteMat);
  points.frustumCulled = false;
  points.visible = false;
  points.renderOrder = 7;
  points.userData.noOutline = true;
  group.add(points);
  let live = 0;
  let cursor = 0;
  const tmpCol = new THREE.Color();

  /**
   * Emit motes. shape: 'burst' (sphere-ish), 'ring' (horizontal outward), 'rise' (soft upward drift
   * around the origin), 'cough' (upward fountain).
   */
  function motes(x, y, z, { count = 12, color = 0xffb347, speed = 4, spread = 0.3, life: lf = 0.8, size: sz = 0.18, gravity = -2, damping = 2.2, shape = 'burst', radius = 0.6, jitter = 0.25, intensity = 1 } = {}) {
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return;
    tmpCol.set(color);
    const n = Math.min(count | 0, MOTE_MAX);
    for (let k = 0; k < n; k++) {
      const i = cursor; cursor = (cursor + 1) % MOTE_MAX;
      const a = Math.random() * Math.PI * 2;
      let vx, vy, vz, ox = 0, oy = 0, oz = 0;
      const s = speed * (0.6 + Math.random() * 0.6);
      if (shape === 'ring') {
        vx = Math.cos(a) * s; vz = Math.sin(a) * s; vy = (Math.random() * 0.6 + 0.2) * speed * 0.25;
        ox = Math.cos(a) * radius * 0.4; oz = Math.sin(a) * radius * 0.4;
      } else if (shape === 'rise') {
        const rr = radius * Math.sqrt(Math.random());
        ox = Math.cos(a) * rr; oz = Math.sin(a) * rr; oy = Math.random() * 0.4;
        vx = Math.cos(a) * 0.25 * s * spread; vz = Math.sin(a) * 0.25 * s * spread; vy = s;
      } else if (shape === 'cough') {
        vx = Math.cos(a) * s * spread; vz = Math.sin(a) * s * spread; vy = s * (0.8 + Math.random() * 0.4);
      } else {
        const u = Math.random() * 2 - 1, q = Math.sqrt(1 - u * u);
        vx = Math.cos(a) * q * s; vz = Math.sin(a) * q * s; vy = Math.abs(u) * s * 0.8 + spread * s;
      }
      pos[i * 3] = x + ox; pos[i * 3 + 1] = y + oy; pos[i * 3 + 2] = z + oz;
      vel[i * 3] = vx; vel[i * 3 + 1] = vy; vel[i * 3 + 2] = vz;
      const lj = lf * (1 - jitter + Math.random() * jitter * 2);
      life[i] = lj; maxLife[i] = lj;
      baseSize[i] = sz * (0.7 + Math.random() * 0.6);
      grav[i] = gravity; drag[i] = damping;
      const tint = (0.85 + Math.random() * 0.3) * intensity;
      col[i * 3] = Math.min(1.6, tmpCol.r * tint); col[i * 3 + 1] = tmpCol.g * tint; col[i * 3 + 2] = tmpCol.b * tint;
      alpha[i] = 0.001; size[i] = baseSize[i];
    }
    colAttr.needsUpdate = true;
    live = Math.max(live, 1);
    points.visible = true;
  }

  // ---------------------------------------------------------------- update
  function waterY(x, z) {
    const w = ctx.water;
    if (!w || w.isStub) return 0;
    try { const y = w.getHeight?.(x, z); return Number.isFinite(y) ? y : 0; } catch { return 0; }
  }

  function update(dt, followPos) {
    dt = Math.min(Math.max(Number(dt) || 0, 0), 0.1);
    // rings
    for (const r of rings) {
      if (!r.active) continue;
      if (r.delay > 0) { r.delay -= dt; r.mesh.visible = false; continue; }
      r.t += dt;
      const k = r.t / r.dur;
      if (k >= 1) { r.active = false; r.mesh.visible = false; continue; }
      if (r.follow && followPos) { r.x = followPos.x; r.z = followPos.z; }
      r.mat.uniforms.uT.value = k;
      r.mesh.position.set(r.x, waterY(r.x, r.z) + 0.14, r.z);
      r.mesh.visible = true;
    }
    // motes
    if (live > 0) {
      let alive = 0;
      for (let i = 0; i < MOTE_MAX; i++) {
        if (life[i] <= 0) { if (alpha[i] !== 0) { alpha[i] = 0; } continue; }
        life[i] -= dt;
        if (life[i] <= 0) { alpha[i] = 0; continue; }
        alive++;
        const j = i * 3;
        const dmp = Math.exp(-drag[i] * dt);
        vel[j] *= dmp; vel[j + 2] *= dmp; vel[j + 1] = vel[j + 1] * dmp + grav[i] * dt;
        pos[j] += vel[j] * dt; pos[j + 1] += vel[j + 1] * dt; pos[j + 2] += vel[j + 2] * dt;
        const k = life[i] / maxLife[i];                 // 1 → 0
        const fadeIn = Math.min(1, (1 - k) * 12);
        alpha[i] = fadeIn * Math.pow(k, 0.7);
        size[i] = baseSize[i] * (0.55 + 0.45 * k);
      }
      posAttr.needsUpdate = true; alphaAttr.needsUpdate = true; sizeAttr.needsUpdate = true;
      live = alive;
      points.visible = alive > 0;
      // pixel scale: drawing-buffer height / (2·tan(fov/2))
      const cam = ctx.render?.camera;
      const cvs = ctx.render?.renderer?.domElement;
      if (cam && cam.isPerspectiveCamera && cvs) {
        moteMat.uniforms.uScale.value = (cvs.height || 720) / (2 * Math.tan((cam.fov * Math.PI) / 360));
      }
    }
  }

  function clear() {
    for (const r of rings) { r.active = false; r.mesh.visible = false; }
    life.fill(0); alpha.fill(0); alphaAttr.needsUpdate = true;
    live = 0; points.visible = false;
  }

  function dispose() {
    clear();
    ringGeo.dispose();
    for (const r of rings) r.mat.dispose();
    geo.dispose();
    moteMat.dispose();
    group.parent?.remove(group);
  }

  return { group, ring, motes, update, clear, dispose };
}
