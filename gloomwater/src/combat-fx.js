// combat-fx.js — pooled, allocation-free VFX layers for combat (helper of combat.js).
// Everything here costs one draw call per layer regardless of how many effects are live:
//   sparks   additive Points (embers, burn flecks, zap/flare sparks, trails)
//   smoke    normal-blend Points (ink puffs, dissolve smoke, splats)
//   glows    additive Points rebuilt every frame (coals, motes, cinders, eye flares, mine lamps)
//   decalsG  additive instanced water decals (rings, light pools, spirals, sectors, flames)
//   decalsI  normal-blend instanced water decals (ink stains, slicks, dark telegraph rings)
//   ribbons  camera-facing additive ribbons (lightning bolts, beams, threads)
//   orbs     instanced unlit glowing icosahedra (coals, motes, hook head, shards)
// A frame is: fx.begin() → systems add() into the dynamic layers → fx.end(dt).
import * as THREE from 'three';
import { glowTexture } from './toon.js';

export const DECAL = { RING: 0, STAIN: 1, SPIRAL: 2, SECTOR: 3, RECT: 4, STREAKS: 5, FLAME: 6, CLOUD: 7, GLOW: 8, DASHRING: 9 };

const TAU = Math.PI * 2;

// ------------------------------------------------------------------ shaders
const PARTICLE_VS = /* glsl */`
attribute vec3 aColor; attribute float aAlpha; attribute float aSize;
uniform float uScale; uniform float uFogDensity; uniform float uFogKeep;
varying vec3 vColor; varying float vAlpha;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float d = max(0.1, -mv.z);
  float fog = exp(-uFogDensity * uFogDensity * d * d);
  vAlpha = aAlpha * mix(uFogKeep, 1.0, fog);
  vColor = aColor;
  gl_PointSize = aAlpha > 0.002 ? clamp(aSize * uScale / d, 0.0, 320.0) : 0.0;
}`;
const PARTICLE_FS = /* glsl */`
uniform sampler2D uMap;
varying vec3 vColor; varying float vAlpha;
void main() {
  float a = texture2D(uMap, gl_PointCoord).a * vAlpha;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vColor, a);
  #include <colorspace_fragment>
}`;

const DECAL_VS = /* glsl */`
attribute vec3 aColor; attribute vec4 aP; attribute vec4 aQ;
uniform float uFogDensity;
varying vec2 vUv; varying vec3 vColor; varying vec4 vP; varying vec4 vQ; varying float vFog;
void main() {
  vUv = uv; vColor = aColor; vP = aP; vQ = aQ;
  vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  float d = -mv.z;
  vFog = mix(0.2, 1.0, exp(-uFogDensity * uFogDensity * d * d));
  gl_Position = projectionMatrix * mv;
}`;
const DECAL_FS = /* glsl */`
uniform float uTime;
varying vec2 vUv; varying vec3 vColor; varying vec4 vP; varying vec4 vQ; varying float vFog;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  float type = vP.x, alpha = vP.y, p1 = vP.z, p2 = vP.w, p3 = vQ.x, seed = vQ.y;
  float a = 0.0;
  vec3 col = vColor;
  if (type < 0.5) {                       // RING: p1 thickness, p2 inner fill
    if (r > 1.0) discard;
    float t = max(0.02, p1);
    float d = abs(r - (1.0 - t * 0.5)) / (t * 0.5);
    float band = 1.0 - smoothstep(0.45, 1.0, d);
    float fill = p2 * smoothstep(0.0, 1.0, r) * (1.0 - smoothstep(0.92, 1.0, r));
    a = max(band, fill);
    col *= 0.75 + band * 0.6;
  } else if (type < 1.5) {                // STAIN: p1 spread 0..1, noisy ink edge
    float ang = atan(p.y, p.x);
    float n = noise(vec2(ang * 2.2 + seed * 7.0, seed)) * 0.6 + noise(p * 4.0 + seed * 3.0) * 0.4;
    float edge = p1 * (0.82 + 0.18 * n);
    a = 1.0 - smoothstep(edge - 0.1, edge, r);
    a *= 0.78 + 0.22 * noise(p * 7.0 + seed * 11.0 + uTime * 0.3);
  } else if (type < 2.5) {                // SPIRAL: p1 phase
    if (r > 1.0) discard;
    float ang = atan(p.y, p.x);
    float arms = sin(ang * 3.0 + r * 9.0 - p1) * 0.5 + 0.5;
    arms = pow(arms, 3.0);
    a = arms * smoothstep(1.0, 0.55, r) * smoothstep(0.05, 0.3, r) + (1.0 - smoothstep(0.0, 0.35, r)) * 0.55;
    col *= 0.7 + arms * 0.8;
  } else if (type < 3.5) {                // SECTOR: p1 half-angle, p2 fill progress (radial)
    if (r > 1.0) discard;
    float ang = abs(atan(p.x, p.y));
    float inside = 1.0 - smoothstep(p1 - 0.02, p1, ang);
    float rim = (1.0 - smoothstep(0.0, 0.035, abs(ang - p1 + 0.01))) * step(0.12, r);
    float outer = 1.0 - smoothstep(0.0, 0.04, abs(r - 0.98));
    float fill = step(r, p2) * 0.55 + 0.18;
    a = inside * max(fill, outer) + rim * 0.9 * step(r, 1.0);
  } else if (type < 4.5) {                // RECT: width = local x, length = local z; p1 fill along
    float across = abs(p.x);
    float along = vUv.y;
    float body = 1.0 - smoothstep(0.55, 1.0, across);
    float core = 1.0 - smoothstep(0.0, 0.35, across);
    float filled = step(along, p1);
    float ends = smoothstep(0.0, 0.04, along) * (1.0 - smoothstep(0.96, 1.0, along));
    a = body * ends * (0.22 + 0.78 * filled) + core * ends * filled * 0.5;
    col *= 0.8 + core * 0.6;
  } else if (type < 5.5) {                // STREAKS: thin dashes flowing inward along radial lanes, p1 phase
    if (r > 1.0) discard;
    float ang = atan(p.y, p.x);
    float lanes = (ang / 6.28318 + 0.5) * 26.0;
    float lane = floor(lanes), fl = fract(lanes);
    float h = hash(vec2(lane, seed * 17.0));
    float rr = r * 2.2 + p1 * (0.8 + h * 0.6) + h * 7.0;
    float f = fract(rr);
    float dash = smoothstep(0.0, 0.12, f) * (1.0 - smoothstep(0.28, 0.55, f));
    float thin = 1.0 - smoothstep(0.06, 0.32, abs(fl - 0.5));
    a = dash * thin * step(0.25, h) * smoothstep(1.0, 0.72, r) * smoothstep(0.08, 0.3, r);
  } else if (type < 6.5) {                // FLAME: flickering fire patch
    if (r > 1.0) discard;
    float n = noise(vec2(p.x * 2.3 + seed * 13.0, p.y * 2.3 - uTime * 2.6));
    float n2 = noise(vec2(p.x * 5.0 - uTime * 1.3, p.y * 5.0 + seed * 7.0));
    float body = smoothstep(1.0, 0.25, r + (n - 0.5) * 0.45);
    a = body * (0.45 + 0.75 * n2);
    col = mix(col * vec3(1.0, 0.45, 0.2), col * vec3(1.15, 1.0, 0.75), n * n2 * 1.4);
  } else if (type < 7.5) {                // CLOUD: soft blobby noise disc
    float n = noise(p * 2.2 + seed * 5.0 + vec2(uTime * 0.15, -uTime * 0.1));
    float n2 = noise(p * 5.0 - seed * 3.0 + uTime * 0.25);
    a = smoothstep(1.0, 0.45, r + (n - 0.5) * 0.55) * (0.65 + 0.35 * n2);
  } else if (type < 8.5) {                // GLOW: radial light pool, p1 falloff power
    if (r > 1.0) discard;
    a = pow(1.0 - r, max(0.5, p1));
  } else {                                // DASHRING: dashed ring, p1 thickness, p2 dash count, p3 spin
    if (r > 1.0) discard;
    float t = max(0.02, p1);
    float d = abs(r - (1.0 - t * 0.5)) / (t * 0.5);
    float band = 1.0 - smoothstep(0.45, 1.0, d);
    float ang = atan(p.y, p.x) + p3;
    float dash = step(0.45, fract(ang / 6.28318 * max(1.0, p2)));
    a = band * dash;
  }
  a *= alpha * vFog;
  if (a < 0.004) discard;
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}`;

const RIBBON_VS = /* glsl */`
attribute vec3 aColor; attribute float aAlpha;
uniform float uFogDensity;
varying vec2 vUv; varying vec3 vColor; varying float vAlpha;
void main() {
  vUv = uv; vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float d = -mv.z;
  vAlpha = aAlpha * mix(0.3, 1.0, exp(-uFogDensity * uFogDensity * d * d));
  gl_Position = projectionMatrix * mv;
}`;
const RIBBON_FS = /* glsl */`
varying vec2 vUv; varying vec3 vColor; varying float vAlpha;
void main() {
  float core = 1.0 - abs(vUv.y * 2.0 - 1.0);
  float a = (pow(core, 1.6) * 0.75 + pow(core, 7.0) * 0.6) * vAlpha;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vColor * (0.65 + pow(core, 5.0) * 1.2), a);
  #include <colorspace_fragment>
}`;

// ------------------------------------------------------------------ layers
function particlePool(n, { additive = true, falloff = 2.0, fogKeep = 0.25, name = 'fx' } = {}) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), alp = new Float32Array(n), siz = new Float32Array(n);
  const vel = new Float32Array(n * 3), life = new Float32Array(n), max = new Float32Array(n), base = new Float32Array(n);
  const grow = new Float32Array(n), drag = new Float32Array(n), grav = new Float32Array(n);
  const geo = new THREE.BufferGeometry();
  const pa = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage);
  const ca = new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage);
  const aa = new THREE.BufferAttribute(alp, 1).setUsage(THREE.DynamicDrawUsage);
  const sa = new THREE.BufferAttribute(siz, 1).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('position', pa); geo.setAttribute('aColor', ca); geo.setAttribute('aAlpha', aa); geo.setAttribute('aSize', sa);
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  const mat = new THREE.ShaderMaterial({
    vertexShader: PARTICLE_VS, fragmentShader: PARTICLE_FS, transparent: true, depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: { uScale: { value: 400 }, uMap: { value: glowTexture(64, falloff) }, uFogDensity: { value: 0.02 }, uFogKeep: { value: fogKeep } },
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false; points.name = name; points.renderOrder = additive ? 6 : 4;
  let cursor = 0, alive = 0;
  return {
    points, mat,
    emit(x, y, z, vx, vy, vz, r, g, b, size, lifeT, alpha = 1, gr = 0, dr = 1.5, gv = 0) {
      const i = cursor; cursor = (cursor + 1) % n;
      const i3 = i * 3;
      pos[i3] = x; pos[i3 + 1] = y; pos[i3 + 2] = z;
      vel[i3] = vx; vel[i3 + 1] = vy; vel[i3 + 2] = vz;
      col[i3] = r; col[i3 + 1] = g; col[i3 + 2] = b;
      life[i] = lifeT; max[i] = lifeT; base[i] = alpha; siz[i] = size; grow[i] = gr; drag[i] = dr; grav[i] = gv;
      alp[i] = 0.001;
      alive = n;
    },
    update(dt) {
      if (!alive) { points.visible = false; return; }
      points.visible = true;
      let any = 0;
      for (let i = 0; i < n; i++) {
        if (life[i] <= 0) { if (alp[i] !== 0) alp[i] = 0; continue; }
        any++;
        life[i] -= dt;
        const k = life[i] / max[i];
        const i3 = i * 3;
        const dk = Math.max(0, 1 - drag[i] * dt);
        vel[i3] *= dk; vel[i3 + 2] *= dk; vel[i3 + 1] = vel[i3 + 1] * dk + grav[i] * dt;
        pos[i3] += vel[i3] * dt; pos[i3 + 1] += vel[i3 + 1] * dt; pos[i3 + 2] += vel[i3 + 2] * dt;
        siz[i] = Math.max(0, siz[i] + grow[i] * dt);
        alp[i] = k <= 0 ? 0 : base[i] * Math.min(1, k * 2.4) * Math.min(1, (1 - k) * 14 + 0.15);
      }
      if (!any) alive = 0;
      pa.needsUpdate = ca.needsUpdate = aa.needsUpdate = sa.needsUpdate = true;
    },
    clear() { life.fill(0); alp.fill(0); alive = 0; aa.needsUpdate = true; points.visible = false; },
    dispose() { geo.dispose(); mat.dispose(); },
  };
}

function glowLayer(n, { falloff = 2.0, fogKeep = 0.35, name = 'fx:glows' } = {}) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), alp = new Float32Array(n), siz = new Float32Array(n);
  const geo = new THREE.BufferGeometry();
  const pa = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage);
  const ca = new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage);
  const aa = new THREE.BufferAttribute(alp, 1).setUsage(THREE.DynamicDrawUsage);
  const sa = new THREE.BufferAttribute(siz, 1).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('position', pa); geo.setAttribute('aColor', ca); geo.setAttribute('aAlpha', aa); geo.setAttribute('aSize', sa);
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  geo.setDrawRange(0, 0);
  const mat = new THREE.ShaderMaterial({
    vertexShader: PARTICLE_VS, fragmentShader: PARTICLE_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uScale: { value: 400 }, uMap: { value: glowTexture(64, falloff) }, uFogDensity: { value: 0.02 }, uFogKeep: { value: fogKeep } },
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false; points.name = name; points.renderOrder = 7;
  let count = 0;
  return {
    points, mat,
    get count() { return count; },
    begin() { count = 0; },
    add(x, y, z, r, g, b, size, alpha = 1) {
      if (count >= n) return;
      const i3 = count * 3;
      pos[i3] = x; pos[i3 + 1] = y; pos[i3 + 2] = z;
      col[i3] = r; col[i3 + 1] = g; col[i3 + 2] = b;
      siz[count] = size; alp[count] = alpha;
      count++;
    },
    end() {
      geo.setDrawRange(0, count);
      points.visible = count > 0;
      if (count) { pa.needsUpdate = ca.needsUpdate = aa.needsUpdate = sa.needsUpdate = true; }
    },
    dispose() { geo.dispose(); mat.dispose(); },
  };
}

function decalLayer(n, { additive = true, name = 'fx:decals', y = 0.16 } = {}) {
  const geo = new THREE.PlaneGeometry(1, 1);
  geo.rotateX(-Math.PI / 2);
  const colArr = new Float32Array(n * 3), pArr = new Float32Array(n * 4), qArr = new Float32Array(n * 4);
  const aCol = new THREE.InstancedBufferAttribute(colArr, 3).setUsage(THREE.DynamicDrawUsage);
  const aP = new THREE.InstancedBufferAttribute(pArr, 4).setUsage(THREE.DynamicDrawUsage);
  const aQ = new THREE.InstancedBufferAttribute(qArr, 4).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('aColor', aCol); geo.setAttribute('aP', aP); geo.setAttribute('aQ', aQ);
  const mat = new THREE.ShaderMaterial({
    vertexShader: DECAL_VS, fragmentShader: DECAL_FS, transparent: true, depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -6,
    uniforms: { uTime: { value: 0 }, uFogDensity: { value: 0.02 } },
  });
  const mesh = new THREE.InstancedMesh(geo, mat, n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false; mesh.name = name; mesh.count = 0; mesh.renderOrder = additive ? 3 : 2;
  if (!additive) mat.polygonOffsetFactor = -3;
  const m = mesh.instanceMatrix.array;
  let count = 0;
  return {
    mesh, mat,
    begin() { count = 0; },
    /** rx/rz = half extents (radius) along local x / z; rot = yaw (heading convention: local −z faces it). */
    add(x, z, rx, rz, rot, type, r, g, b, alpha, p1 = 0, p2 = 0, p3 = 0, seed = 0, yy = y) {
      if (count >= n || alpha <= 0.002) return;
      const c = Math.cos(rot), s = Math.sin(rot), o = count * 16;
      const sx = rx * 2, sz = rz * 2;
      m[o] = c * sx; m[o + 1] = 0; m[o + 2] = -s * sx; m[o + 3] = 0;
      m[o + 4] = 0; m[o + 5] = 1; m[o + 6] = 0; m[o + 7] = 0;
      m[o + 8] = s * sz; m[o + 9] = 0; m[o + 10] = c * sz; m[o + 11] = 0;
      m[o + 12] = x; m[o + 13] = yy; m[o + 14] = z; m[o + 15] = 1;
      const c3 = count * 3, c4 = count * 4;
      colArr[c3] = r; colArr[c3 + 1] = g; colArr[c3 + 2] = b;
      pArr[c4] = type; pArr[c4 + 1] = alpha; pArr[c4 + 2] = p1; pArr[c4 + 3] = p2;
      qArr[c4] = p3; qArr[c4 + 1] = seed;
      count++;
    },
    end(t) {
      mat.uniforms.uTime.value = t;
      mesh.count = count;
      mesh.visible = count > 0;
      if (count) { mesh.instanceMatrix.needsUpdate = true; aCol.needsUpdate = aP.needsUpdate = aQ.needsUpdate = true; }
    },
    dispose() { geo.dispose(); mat.dispose(); mesh.dispose?.(); },
  };
}

function ribbonLayer(nQuads, camera) {
  const pos = new Float32Array(nQuads * 12), uv = new Float32Array(nQuads * 8), col = new Float32Array(nQuads * 12), alp = new Float32Array(nQuads * 4);
  const idx = new Uint16Array(nQuads * 6);
  for (let q = 0; q < nQuads; q++) {
    const v = q * 4, o = q * 6;
    idx[o] = v; idx[o + 1] = v + 1; idx[o + 2] = v + 2; idx[o + 3] = v + 2; idx[o + 4] = v + 1; idx[o + 5] = v + 3;
    uv.set([0, 0, 0, 1, 1, 0, 1, 1], q * 8);
  }
  const geo = new THREE.BufferGeometry();
  const pa = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage);
  const ca = new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage);
  const aa = new THREE.BufferAttribute(alp, 1).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('position', pa); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setAttribute('aColor', ca); geo.setAttribute('aAlpha', aa);
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  geo.setDrawRange(0, 0);
  const mat = new THREE.ShaderMaterial({
    vertexShader: RIBBON_VS, fragmentShader: RIBBON_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide, uniforms: { uFogDensity: { value: 0.02 } },
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false; mesh.name = 'fx:ribbons'; mesh.renderOrder = 8;
  let count = 0;
  const cam = new THREE.Vector3();
  return {
    mesh, mat,
    begin(camera0) { count = 0; if (camera0) cam.copy(camera0.position); },
    /** One camera-facing quad from A to B; widths wa/wb, alphas aa/ab. */
    seg(ax, ay, az, bx, by, bz, wa, wb, r, g, b, a0, a1 = a0) {
      if (count >= nQuads) return;
      const dx = bx - ax, dy = by - ay, dz = bz - az;
      const mx = (ax + bx) * 0.5 - cam.x, my = (ay + by) * 0.5 - cam.y, mz = (az + bz) * 0.5 - cam.z;
      let sx = dy * mz - dz * my, sy = dz * mx - dx * mz, sz = dx * my - dy * mx;
      const l = Math.hypot(sx, sy, sz) || 1;
      sx /= l; sy /= l; sz /= l;
      const o = count * 12, ha = wa * 0.5, hb = wb * 0.5;
      pos[o] = ax - sx * ha; pos[o + 1] = ay - sy * ha; pos[o + 2] = az - sz * ha;
      pos[o + 3] = ax + sx * ha; pos[o + 4] = ay + sy * ha; pos[o + 5] = az + sz * ha;
      pos[o + 6] = bx - sx * hb; pos[o + 7] = by - sy * hb; pos[o + 8] = bz - sz * hb;
      pos[o + 9] = bx + sx * hb; pos[o + 10] = by + sy * hb; pos[o + 11] = bz + sz * hb;
      for (let k = 0; k < 4; k++) { col[o + k * 3] = r; col[o + k * 3 + 1] = g; col[o + k * 3 + 2] = b; }
      const q = count * 4;
      alp[q] = a0; alp[q + 1] = a0; alp[q + 2] = a1; alp[q + 3] = a1;
      count++;
    },
    end() {
      geo.setDrawRange(0, count * 6);
      mesh.visible = count > 0;
      if (count) { pa.needsUpdate = ca.needsUpdate = aa.needsUpdate = true; }
    },
    dispose() { geo.dispose(); mat.dispose(); },
  };
}

function orbLayer(n) {
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, fog: true });
  const mesh = new THREE.InstancedMesh(geo, mat, n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const colArr = new Float32Array(n * 3);
  mesh.instanceColor = new THREE.InstancedBufferAttribute(colArr, 3).setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false; mesh.count = 0; mesh.name = 'fx:orbs'; mesh.renderOrder = 5;
  const m = mesh.instanceMatrix.array;
  let count = 0;
  return {
    mesh,
    begin() { count = 0; },
    /** sx/sy/sz scale, yaw rotation about Y. */
    add(x, y, z, sx, sy, sz, yaw, r, g, b) {
      if (count >= n) return;
      const c = Math.cos(yaw), s = Math.sin(yaw), o = count * 16;
      m[o] = c * sx; m[o + 1] = 0; m[o + 2] = -s * sx; m[o + 3] = 0;
      m[o + 4] = 0; m[o + 5] = sy; m[o + 6] = 0; m[o + 7] = 0;
      m[o + 8] = s * sz; m[o + 9] = 0; m[o + 10] = c * sz; m[o + 11] = 0;
      m[o + 12] = x; m[o + 13] = y; m[o + 14] = z; m[o + 15] = 1;
      const c3 = count * 3;
      colArr[c3] = r; colArr[c3 + 1] = g; colArr[c3 + 2] = b;
      count++;
    },
    end() {
      mesh.count = count; mesh.visible = count > 0;
      if (count) { mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor.needsUpdate = true; }
    },
    dispose() { geo.dispose(); mat.dispose(); mesh.dispose?.(); },
  };
}

// ------------------------------------------------------------------ fx facade
/** Linear colour helper: returns a THREE.Color (sRGB hex converted to working space) × intensity. */
export function lin(hex, k = 1) {
  // HDR intensities are compressed: the post chain blooms anything over ~0.75, and very hot
  // sources turn into boxy bloom on low quality tiers.
  const kk = k <= 1 ? k : 1 + (k - 1) * 0.45;
  return new THREE.Color(hex).multiplyScalar(kk);
}

export function createFx(ctx, root) {
  const camera = () => ctx.render?.camera;
  const sparks = particlePool(1400, { additive: true, falloff: 1.8, fogKeep: 0.3, name: 'fx:sparks' });
  const smoke = particlePool(420, { additive: false, falloff: 1.3, fogKeep: 0.6, name: 'fx:smoke' });
  const glows = glowLayer(1200, { falloff: 2.2 });
  const decalsI = decalLayer(96, { additive: false, name: 'fx:decalsInk', y: 0.15 });
  const decalsG = decalLayer(260, { additive: true, name: 'fx:decalsGlow', y: 0.18 });
  const ribbons = ribbonLayer(900);
  const orbs = orbLayer(160);
  root.add(decalsI.mesh, decalsG.mesh, smoke.points, orbs.mesh, sparks.points, glows.points, ribbons.mesh);

  // ---- timed decal effects (expanding rings, flashes) — pooled
  const MAX_TIMED = 64;
  const timed = [];
  for (let i = 0; i < MAX_TIMED; i++) timed.push({ on: false, additive: true, type: 0, x: 0, z: 0, r0: 0, r1: 1, life: 0, max: 1, r: 1, g: 1, b: 1, alpha: 1, p1: 0.1, p2: 0, p3: 0, ease: 1, rot: 0, seed: 0 });
  let timedCursor = 0;
  function timedDecal(o) {
    let slot = null;
    for (let i = 0; i < MAX_TIMED; i++) { const s = timed[(timedCursor + i) % MAX_TIMED]; if (!s.on) { slot = s; timedCursor = (timedCursor + i + 1) % MAX_TIMED; break; } }
    if (!slot) { slot = timed[timedCursor]; timedCursor = (timedCursor + 1) % MAX_TIMED; }
    slot.on = true;
    slot.additive = o.additive !== false; slot.type = o.type ?? DECAL.RING;
    slot.x = o.x; slot.z = o.z; slot.r0 = o.r0 ?? 0.2; slot.r1 = o.r1 ?? 4; slot.max = slot.life = o.life ?? 0.6;
    const c = o.color; slot.r = c.r; slot.g = c.g; slot.b = c.b;
    slot.alpha = o.alpha ?? 1; slot.p1 = o.p1 ?? 0.12; slot.p2 = o.p2 ?? 0; slot.p3 = o.p3 ?? 0; slot.ease = o.ease ?? 1; slot.rot = o.rot ?? 0; slot.seed = o.seed ?? Math.random();
    return slot;
  }

  // ---- lightning bolts — pooled jagged polylines rendered as ribbons
  const MAXP = 12, MAX_BOLTS = 48;
  const bolts = [];
  for (let i = 0; i < MAX_BOLTS; i++) bolts.push({ on: false, pts: new Float32Array(MAXP * 3), np: 0, a: new Float32Array(3), b: new Float32Array(3), life: 0, max: 0.2, r: 1, g: 1, b2: 1, width: 0.12, jag: 0.4, rejit: 0 });
  let boltCursor = 0;
  function jitterBolt(bt) {
    const ax = bt.a[0], ay = bt.a[1], az = bt.a[2], bx = bt.b[0], by = bt.b[1], bz = bt.b[2];
    const len = Math.hypot(bx - ax, by - ay, bz - az);
    const np = Math.max(3, Math.min(MAXP, Math.round(len / 0.9) + 2));
    bt.np = np;
    for (let i = 0; i < np; i++) {
      const k = i / (np - 1);
      const env = Math.sin(k * Math.PI);
      const j = bt.jag * env * Math.min(1.6, len * 0.18 + 0.4);
      bt.pts[i * 3] = ax + (bx - ax) * k + (Math.random() - 0.5) * j;
      bt.pts[i * 3 + 1] = ay + (by - ay) * k + (Math.random() - 0.5) * j * 0.6;
      bt.pts[i * 3 + 2] = az + (bz - az) * k + (Math.random() - 0.5) * j;
    }
  }
  function bolt(ax, ay, az, bx, by, bz, color, { width = 0.12, life = 0.18, jag = 0.5 } = {}) {
    const bt = bolts[boltCursor]; boltCursor = (boltCursor + 1) % MAX_BOLTS;
    bt.on = true; bt.a[0] = ax; bt.a[1] = ay; bt.a[2] = az; bt.b[0] = bx; bt.b[1] = by; bt.b[2] = bz;
    bt.life = bt.max = life; bt.r = color.r; bt.g = color.g; bt.b2 = color.b; bt.width = width; bt.jag = jag; bt.rejit = 0;
    jitterBolt(bt);
  }

  let started = false;
  const fx = {
    sparks, smoke, glows, decalsI, decalsG, ribbons, orbs, DECAL,
    timedDecal, bolt,
    /** radial spark burst */
    burst(x, y, z, color, count = 10, speed = 4, size = 0.18, life = 0.6, up = 1.5, gravity = -6) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * TAU, s = speed * (0.35 + Math.random() * 0.75);
        sparks.emit(x, y, z, Math.cos(a) * s, up * (0.4 + Math.random()), Math.sin(a) * s, color.r, color.g, color.b, size * (0.6 + Math.random() * 0.8), life * (0.6 + Math.random() * 0.7), 1, -size * 0.4, 1.8, gravity);
      }
    },
    /** ink smoke puff (normal blending) */
    ink(x, y, z, count = 6, size = 0.9, color = null, rise = 0.6) {
      const c = color || INK_SMOKE;
      for (let i = 0; i < count; i++) {
        smoke.emit(x + (Math.random() - 0.5) * size * 0.6, y + Math.random() * size * 0.3, z + (Math.random() - 0.5) * size * 0.6,
          (Math.random() - 0.5) * 1.4, rise * (0.5 + Math.random()), (Math.random() - 0.5) * 1.4, c.r, c.g, c.b,
          size * (0.5 + Math.random() * 0.5), 0.9 + Math.random() * 0.6, 0.75, size * 0.8, 1.6, 0.2);
      }
    },
    begin() {
      started = true;
      glows.begin(); decalsI.begin(); decalsG.begin(); ribbons.begin(camera()); orbs.begin();
    },
    end(dt, t) {
      if (!started) return;
      started = false;
      // timed decals
      for (let i = 0; i < MAX_TIMED; i++) {
        const s = timed[i];
        if (!s.on) continue;
        s.life -= dt;
        if (s.life <= 0) { s.on = false; continue; }
        const k = 1 - s.life / s.max;
        const e = s.ease === 1 ? 1 - Math.pow(1 - k, 3) : s.ease === 2 ? k * k : k;
        const rr = s.r0 + (s.r1 - s.r0) * e;
        const fade = s.ease === 3 ? Math.sin(k * Math.PI) : (1 - k) * Math.min(1, k * 10 + 0.2);
        const layer = s.additive ? decalsG : decalsI;
        layer.add(s.x, s.z, rr, rr, s.rot, s.type, s.r, s.g, s.b, s.alpha * fade, s.p1, s.p2, s.p3, s.seed);
      }
      // bolts
      for (let i = 0; i < MAX_BOLTS; i++) {
        const bt = bolts[i];
        if (!bt.on) continue;
        bt.life -= dt;
        if (bt.life <= 0) { bt.on = false; continue; }
        bt.rejit -= dt;
        if (bt.rejit <= 0) { bt.rejit = 0.045; jitterBolt(bt); }
        const a = Math.min(1, bt.life / bt.max * 1.6);
        const P = bt.pts;
        for (let j = 0; j < bt.np - 1; j++) {
          const o = j * 3;
          ribbons.seg(P[o], P[o + 1], P[o + 2], P[o + 3], P[o + 4], P[o + 5], bt.width * 4, bt.width * 4, bt.r * 0.6, bt.g * 0.6, bt.b2 * 0.6, a * 0.35);
          ribbons.seg(P[o], P[o + 1], P[o + 2], P[o + 3], P[o + 4], P[o + 5], bt.width, bt.width, bt.r, bt.g, bt.b2, a);
        }
      }
      // shared uniforms
      const cam = camera(), renderer = ctx.render?.renderer;
      const dens = ctx.render?.scene?.fog?.density ?? 0.02;
      if (cam && renderer?.domElement) {
        const h = renderer.domElement.height || innerHeight;
        const sc = h / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov || 50) / 2));
        sparks.mat.uniforms.uScale.value = sc; smoke.mat.uniforms.uScale.value = sc; glows.mat.uniforms.uScale.value = sc;
      }
      sparks.mat.uniforms.uFogDensity.value = dens; smoke.mat.uniforms.uFogDensity.value = dens; glows.mat.uniforms.uFogDensity.value = dens;
      decalsG.mat.uniforms.uFogDensity.value = dens; decalsI.mat.uniforms.uFogDensity.value = dens; ribbons.mat.uniforms.uFogDensity.value = dens;
      sparks.update(dt); smoke.update(dt);
      glows.end(); decalsI.end(t); decalsG.end(t); ribbons.end(); orbs.end();
    },
    clear() {
      for (const s of timed) s.on = false;
      for (const b of bolts) b.on = false;
      sparks.clear(); smoke.clear();
      glows.begin(); glows.end(); decalsI.begin(); decalsI.end(0); decalsG.begin(); decalsG.end(0);
      ribbons.begin(); ribbons.end(); orbs.begin(); orbs.end();
      started = false;
    },
    dispose() {
      for (const l of [sparks, smoke, glows, decalsI, decalsG, ribbons, orbs]) l.dispose();
    },
  };
  return fx;
}

const INK_SMOKE = new THREE.Color(0x0b0a12);
