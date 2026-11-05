// models.js — procedural fish, night creatures and instanced swarms (actors author).
// CONTRACT §7 models. Everything is generated at runtime: lathe-profile fish bodies with
// painted canvas skins, ink-rimmed fin cards, vertex-shader swim/struggle/flop; inky
// creatures with glowing eyes, white hurt flash and glowing-edge dissolve; ≤4-draw-call
// instanced swarms for up to ~150+ members.
//
// Extras beyond the contract (optional, guard with ?.):
//   createCreature(kindOrEnemyId, {tint, eyeColor, scale})   enemy ids resolve to model + tint
//   createSwarm(kindOrEnemyId, max, {tint, eyeColor}); swarm.setTint(i, bodyHex, eyeHex)
//   puff(position, {color, count, size})   one-shot smoke + ember burst (death smoke etc.)
//   shapes -> fish shape list
// Swarm.set(i, position, yaw, …): yaw uses the game heading convention (yaw 0 faces −Z,
// i.e. yaw = atan2(-dx, -dz) for a direction (dx, dz)); position.y is added on top of the
// kind's natural hover height (wisp ~0.8 m, mite 0.1, moth 1.5, eel just under water —
// lift an eel's y to make it arc out of the water).
import * as THREE from 'three';
import { createFishFactory } from './models-fish.js';
import { createCreatureFactory } from './models-creatures.js';
import { createSwarmFactory } from './models-swarm.js';
import { dotTexture } from './models-kit.js';

const PUFF_VS = /* glsl */`
attribute vec3 aCol; attribute float aA; attribute float aS;
uniform float uScale;
varying vec3 vCol; varying float vA;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aA > 0.001 ? aS * uScale / max(0.1, -mv.z) : 0.0;
  vCol = aCol; vA = aA;
}`;
const PUFF_FS = /* glsl */`
uniform sampler2D uMap;
varying vec3 vCol; varying float vA;
void main() {
  float a = texture2D(uMap, gl_PointCoord).a * vA;
  if (a < 0.004) discard;
  gl_FragColor = vec4(vCol, a);
  #include <colorspace_fragment>
}`;

function createPuffPool(ctx, n, additive) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), a = new Float32Array(n), sz = new Float32Array(n);
  const vel = new Float32Array(n * 3), life = new Float32Array(n), max = new Float32Array(n), grow = new Float32Array(n), base = new Float32Array(n);
  const geo = new THREE.BufferGeometry();
  const pa = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage);
  const ca = new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage);
  const aa = new THREE.BufferAttribute(a, 1).setUsage(THREE.DynamicDrawUsage);
  const sa = new THREE.BufferAttribute(sz, 1).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('position', pa); geo.setAttribute('aCol', ca); geo.setAttribute('aA', aa); geo.setAttribute('aS', sa);
  const mat = new THREE.ShaderMaterial({
    vertexShader: PUFF_VS, fragmentShader: PUFF_FS, transparent: true, depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: { uScale: { value: 400 }, uMap: { value: dotTexture() } },
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false; points.renderOrder = 5; points.name = additive ? 'puffEmbers' : 'puffSmoke';
  let cursor = 0, alive = 0;
  const c = new THREE.Color();
  return {
    points, mat,
    emit(p, { color = 0x101018, vx = 0, vy = 1, vz = 0, spread = 0.6, size = 0.5, sizeGrow = 1, lifeT = 1.2, alpha = 0.7, jitter = 0.3 } = {}) {
      const i = cursor; cursor = (cursor + 1) % n;
      pos[i * 3] = p.x + (Math.random() - 0.5) * jitter; pos[i * 3 + 1] = p.y + (Math.random() - 0.5) * jitter; pos[i * 3 + 2] = p.z + (Math.random() - 0.5) * jitter;
      vel[i * 3] = vx + (Math.random() - 0.5) * spread; vel[i * 3 + 1] = vy * (0.6 + Math.random() * 0.8); vel[i * 3 + 2] = vz + (Math.random() - 0.5) * spread;
      c.set(color); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      life[i] = lifeT * (0.7 + Math.random() * 0.6); max[i] = life[i]; base[i] = alpha; sz[i] = size * (0.7 + Math.random() * 0.6); grow[i] = sizeGrow;
      a[i] = alpha;
      alive = n;
    },
    update(dt, cam, renderer) {
      if (!alive) return;
      if (cam && renderer) mat.uniforms.uScale.value = renderer.domElement.height / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov || 50) / 2));
      let any = 0;
      for (let i = 0; i < n; i++) {
        if (life[i] <= 0) { if (a[i] !== 0) a[i] = 0; continue; }
        any++;
        life[i] -= dt;
        const k = Math.max(0, life[i] / max[i]);
        pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
        vel[i * 3] *= 1 - dt * 0.8; vel[i * 3 + 2] *= 1 - dt * 0.8; vel[i * 3 + 1] *= 1 - dt * 0.4;
        sz[i] += grow[i] * dt;
        a[i] = base[i] * Math.min(1, k * 2.2) * Math.min(1, (1 - k) * 8 + 0.2);
      }
      if (!any) alive = 0;
      pa.needsUpdate = true; ca.needsUpdate = true; aa.needsUpdate = true; sa.needsUpdate = true;
    },
    dispose() { geo.dispose(); mat.dispose(); },
  };
}

export function create(ctx) {
  const swarms = new Set();
  const api = {
    swarmTime: { value: 0 },
    _registerSwarm(s) { swarms.add(s); },
    _unregisterSwarm(s) { swarms.delete(s); },
  };
  const fish = createFishFactory(ctx);
  const creatures = createCreatureFactory(ctx, api);
  const swarmF = createSwarmFactory(ctx, api, creatures.resolve);
  let smoke = null, embers = null, puffGroup = null;
  const ensurePuffs = () => {
    if (smoke) return true;
    const scene = ctx.render?.scene;
    if (!scene || ctx.render.isStub) return false;
    smoke = createPuffPool(ctx, 96, false);
    embers = createPuffPool(ctx, 96, true);
    puffGroup = new THREE.Group(); puffGroup.name = 'models:puffs';
    puffGroup.add(smoke.points, embers.points);
    scene.add(puffGroup);
    return true;
  };
  const tmp = new THREE.Vector3();

  Object.assign(api, {
    shapes: fish.shapes,
    init() {},
    update(dt = 0.016) {
      api.swarmTime.value += Math.min(dt || 0, 0.1);
      for (const s of swarms) s.flush?.();
      if (smoke) {
        const cam = ctx.render?.camera, r = ctx.render?.renderer;
        smoke.update(dt, cam, r); embers.update(dt, cam, r);
      }
    },
    /** A FishVisual. v3 species (with `size`): `{z}` (or `{lengthCm}`, or a v3 weight) → the true length in metres
     *  (L50 · e^(σz + tail·max(0, z − 1.04)²), floor 0.04 m, no ±22% scaling; CONTRACT §13.7). v1 / v2: weightKg as before. */
    createFish(speciesOrId, weightKg = 1) { return fish.createFish(speciesOrId, weightKg); },
    createCreature(kind = 'wisp', opts = {}) { return creatures.createCreature(kind, opts); },
    createSwarm(kind = 'wisp', max = 100, opts = {}) { return swarmF.createSwarm(kind, max, opts); },
    /** One-shot smoke + ember burst at a world position. */
    puff(position, { color = 0xffc070, count = 10, size = 1, smokeColor = 0x14121c } = {}) {
      if (!position || !ensurePuffs()) return;
      tmp.copy(position);
      const ns = Math.ceil(count * 0.6), ne = Math.ceil(count * 0.5);
      for (let i = 0; i < ns; i++) smoke.emit(tmp, { color: smokeColor, vy: 0.7 * size, spread: 0.9 * size, size: 0.55 * size, sizeGrow: 0.9 * size, lifeT: 1.3, alpha: 0.55, jitter: 0.35 * size });
      for (let i = 0; i < ne; i++) embers.emit(tmp, { color, vy: 1.6 * size, spread: 2.2 * size, size: 0.14 * size, sizeGrow: -0.05, lifeT: 0.9, alpha: 1, jitter: 0.2 * size });
    },
    /** Low-level emitters for other effects (actors uses these for smoke wisps). */
    emitSmoke(position, o) { if (position && ensurePuffs()) smoke.emit(position, o); },
    emitEmber(position, o) { if (position && ensurePuffs()) embers.emit(position, o); },
  });
  return api;
}
