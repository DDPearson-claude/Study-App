// models-swarm.js — instanced hordes (helper of models.js): wisp, mite, moth, eel.
// Per swarm: body + ink outline + glowing eyes + blob shadows = 4 draw calls for up to
// `max` members. Per-instance attributes (aFx = hurt, fade, phase) drive white hurt
// flashes, the noise dissolve and de-synchronised vertex animation (tendrils, legs,
// wing flaps, eel waves) off one shared time uniform. No per-frame allocations.
import * as THREE from 'three';
import { INK } from './toon.js';
import { deformToon, deformGlow, deformOutline, fxUniforms, smoothNormals } from './models-kit.js';
import {
  KIND_DEFAULTS, wispGeometry, wispEyes, WISP_PARS, miteGeometry, miteEyes, MITE_PARS, mothGeometry, mothTextures,
  MOTH_PARS, eelGeometry, EEL_PARS,
} from './models-creatures.js';

const SWARM_KINDS = ['wisp', 'mite', 'moth', 'eel'];
const PHASE = 'aFx.z * 6.2831';

const SHADOW_VS = /* glsl */`
attribute vec3 aFx;
uniform float uSize, uHover; uniform vec2 uShape;
varying float vA; varying vec2 vUv;
void main() {
  float sc = length(instanceMatrix[0].xyz);
  float h = instanceMatrix[3].y - uHover * sc;
  float grow = 1.0 + max(h, 0.0) * 0.25;
  vec3 local = vec3(position.x * uShape.x, 0.0, position.y * uShape.y) * uSize;
  vec3 p = vec3(instanceMatrix[3].x, 0.0, instanceMatrix[3].z) + (instanceMatrix * vec4(local, 0.0)).xyz * grow;
  p.y = 0.07;
  vA = (1.0 - clamp(aFx.y * 1.6, 0.0, 1.0)) * clamp(1.0 - max(h, 0.0) * 0.3, 0.25, 1.0);
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`;
const SHADOW_FS = /* glsl */`
uniform float uOpacity;
varying float vA; varying vec2 vUv;
void main() {
  float d = length(vUv * 2.0 - 1.0);
  float a = smoothstep(1.0, 0.15, d) * vA * uOpacity;
  if (a < 0.003) discard;
  gl_FragColor = vec4(0.0, 0.0, 0.0, a);
}`;

export function createSwarmFactory(ctx, models, resolve) {
  function build(kind) {
    if (kind === 'wisp') { const b = wispGeometry(0); return { body: b, outline: smoothNormals(b), eyes: wispEyes(), pars: WISP_PARS(PHASE), shadow: [0.36, 0.36] }; }
    if (kind === 'mite') { const b = miteGeometry(0); return { body: b, outline: smoothNormals(b), eyes: miteEyes(), pars: MITE_PARS(PHASE), shadow: [0.3, 0.32] }; }
    if (kind === 'moth') { const m = mothGeometry(0); return { body: m.body, outline: m.outline, eyes: m.eyes, pars: MOTH_PARS(PHASE), shadow: [0.45, 0.3] }; }
    const e = eelGeometry(0);
    return { body: e.body, outline: smoothNormals(e.body), eyes: e.eyes, pars: EEL_PARS(PHASE, 'clamp((instanceMatrix[3].y + 0.05) / 1.6, 0.0, 1.0)'), shadow: [0.18, 0.95] };
  }

  function createSwarm(kindIn = 'wisp', max = 100, opts = {}) {
    const R = resolve(kindIn, opts);
    const kind = SWARM_KINDS.includes(R.kind) ? R.kind : 'wisp';
    max = Math.max(1, Math.min(2048, Math.floor(max) || 100));
    const G = build(kind);
    const hover = KIND_DEFAULTS[kind].hover;
    const fxArr = new Float32Array(max * 3);
    const aFx = new THREE.InstancedBufferAttribute(fxArr, 3); aFx.setUsage(THREE.DynamicDrawUsage);
    for (const g of [G.body, G.outline, G.eyes]) if (g) g.setAttribute('aFx', aFx);
    const uniforms = { uT: models.swarmTime, uMove: { value: 0.65 }, uAtk: { value: 0 }, uArch: { value: 0 }, ...fxUniforms({ edge: R.eye, scale: 7 }) };
    const spec = { key: 'sw_' + kind, uniforms, pars: G.pars, fx: 'instanced' };
    const mats = [];
    const bodyMat = deformToon(kind === 'moth'
      ? { color: 0xffffff, map: mothTextures().map, rim: 0.4, side: THREE.DoubleSide, emissive: R.eye, emissiveIntensity: 1.5 }
      : { color: 0xffffff, rim: 0.55, rimPower: 0.5 }, spec);
    if (kind === 'moth') { bodyMat.emissiveMap = mothTextures().ems; bodyMat.alphaTest = 0.45; }
    mats.push(bodyMat);
    const object3d = new THREE.Group(); object3d.name = 'swarm:' + kind;
    const body = new THREE.InstancedMesh(G.body, bodyMat, max);
    const im = body.instanceMatrix; im.setUsage(THREE.DynamicDrawUsage);
    const colArr = new Float32Array(max * 3), eyeArr = new Float32Array(max * 3);
    body.instanceColor = new THREE.InstancedBufferAttribute(colArr, 3);
    const tint = new THREE.Color(R.tint), eye = new THREE.Color(R.eye);
    for (let i = 0; i < max; i++) { tint.toArray(colArr, i * 3); eye.toArray(eyeArr, i * 3); fxArr[i * 3 + 2] = (i * 0.618034) % 1; }
    const outlineMat = deformOutline({ thickness: kind === 'mite' ? 0.018 : kind === 'eel' ? 0.03 : 0.024, color: tint.getHSL({}).l > 0.45 ? 0x1a1610 : INK }, spec); mats.push(outlineMat);
    const outline = new THREE.InstancedMesh(G.outline, outlineMat, max); outline.instanceMatrix = im; outline.renderOrder = -1;
    const eyeMat = deformGlow(0xffffff, kind === 'moth' ? 2.2 : 2.6, spec); mats.push(eyeMat);
    const eyes = new THREE.InstancedMesh(G.eyes, eyeMat, max); eyes.instanceMatrix = im;
    eyes.instanceColor = new THREE.InstancedBufferAttribute(eyeArr, 3);
    const shGeo = new THREE.PlaneGeometry(2, 2); shGeo.setAttribute('aFx', aFx);
    const shMat = new THREE.ShaderMaterial({
      vertexShader: SHADOW_VS, fragmentShader: SHADOW_FS, transparent: true, depthWrite: false,
      uniforms: { uSize: { value: 1 }, uHover: { value: hover }, uShape: { value: new THREE.Vector2(G.shadow[0], G.shadow[1]) }, uOpacity: { value: kind === 'eel' ? 0.55 : 0.45 } },
    });
    mats.push(shMat);
    const shadow = new THREE.InstancedMesh(shGeo, shMat, max); shadow.instanceMatrix = im; shadow.renderOrder = -2;
    const meshes = [shadow, body, outline, eyes];
    for (const m of meshes) { m.frustumCulled = false; m.count = 0; object3d.add(m); }
    const ma = im.array;
    let count = 0, dirty = true, colDirty = false;
    const tmpC = new THREE.Color();
    const swarm = {
      object3d, max, kind,
      get count() { return count; },
      setCount(n) { count = Math.max(0, Math.min(max, n | 0)); for (const m of meshes) m.count = count; },
      set(i, position, yaw = 0, scale = 1, hurt = 0, fade = 0, phase = 0) {
        if (i < 0 || i >= max || !position) return;
        const S = scale || 1, yy = yaw + Math.PI, c = Math.cos(yy) * S, s = Math.sin(yy) * S, o = i * 16;
        ma[o] = c; ma[o + 1] = 0; ma[o + 2] = -s; ma[o + 3] = 0;
        ma[o + 4] = 0; ma[o + 5] = S; ma[o + 6] = 0; ma[o + 7] = 0;
        ma[o + 8] = s; ma[o + 9] = 0; ma[o + 10] = c; ma[o + 11] = 0;
        ma[o + 12] = position.x; ma[o + 13] = (position.y || 0) + hover * S; ma[o + 14] = position.z; ma[o + 15] = 1;
        const f = i * 3;
        fxArr[f] = hurt > 0 ? (hurt > 1 ? 1 : hurt) : 0;
        fxArr[f + 1] = fade > 0 ? (fade > 1 ? 1 : fade) : 0;
        fxArr[f + 2] = phase ? phase % 1 : (i * 0.618034) % 1;
        dirty = true;
      },
      /** Optional: per-instance colours (body tint, eye colour). */
      setTint(i, bodyHex, eyeHex) {
        if (i < 0 || i >= max) return;
        if (bodyHex !== undefined && bodyHex !== null) { tmpC.set(bodyHex).toArray(colArr, i * 3); colDirty = true; }
        if (eyeHex !== undefined && eyeHex !== null) { tmpC.set(eyeHex).toArray(eyeArr, i * 3); colDirty = true; }
      },
      flush() {
        if (dirty) { im.needsUpdate = true; aFx.needsUpdate = true; dirty = false; }
        if (colDirty) { body.instanceColor.needsUpdate = true; eyes.instanceColor.needsUpdate = true; colDirty = false; }
      },
      update() { swarm.flush(); },
      dispose() {
        object3d.parent?.remove(object3d);
        models._unregisterSwarm?.(swarm);
        for (const m of meshes) m.dispose();
        for (const g of new Set([G.body, G.outline, G.eyes, shGeo])) g?.dispose();
        for (const m of mats) m.dispose();
      },
    };
    models._registerSwarm?.(swarm);
    return swarm;
  }
  return { createSwarm };
}
