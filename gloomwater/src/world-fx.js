// world-fx.js — shaders & GPU effect builders for the world module (world author):
// ink-toon with controllable fog, parallax ring + vault dome materials, soft-sprite
// particles, glow halos, light shafts + pools, shore mist, gate vortex/column/spiral.
// All effects animate in shaders from a shared uniform clock (no per-frame allocations).
import * as THREE from 'three';
import { toonMaterial } from './toon.js';

const NOISE_GLSL = /* glsl */`
float gwH(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float gwN(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(gwH(i), gwH(i + vec3(1,0,0)), f.x), mix(gwH(i + vec3(0,1,0)), gwH(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(gwH(i + vec3(0,0,1)), gwH(i + vec3(1,0,1)), f.x), mix(gwH(i + vec3(0,1,1)), gwH(i + vec3(1,1,1)), f.x), f.y), f.z); }
float gwH2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
`;

// ------------------------------------------------------------------ toon with tamed fog
const FOG_FRAG = /* glsl */`
#ifdef USE_FOG
  float gwFd = vFogDepth * gwFogScale;
  #ifdef FOG_EXP2
    float gwFogF = 1.0 - exp( - fogDensity * fogDensity * gwFd * gwFd );
  #else
    float gwFogF = smoothstep( fogNear, fogFar, gwFd );
  #endif
  gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, gwFogF * gwFogMax );
#endif`;

/** toon.toonMaterial + per-material fog scale/cap (keeps distant ink silhouettes dark). */
export function inkToon(opts = {}, { fogScale = 1, fogMax = 1 } = {}) {
  const mat = toonMaterial({ ...opts, rim: Math.max(0.001, opts.rim ?? 0.35) });
  const u = { gwFogScale: { value: fogScale }, gwFogMax: { value: fogMax } };
  mat.userData.fog = u;
  const base = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader, r) => {
    base?.call(mat, shader, r);
    Object.assign(shader.uniforms, u);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float gwFogScale; uniform float gwFogMax;')
      .replace('#include <fog_fragment>', FOG_FRAG);
  };
  mat.customProgramCacheKey = () => 'gwInkToonFog';
  return mat;
}

/** Outline (inverted hull) material usable on InstancedMesh and merged geometry. */
export function outlineMat(thickness = 0.08, color = 0x07080d) {
  const mat = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide, fog: true });
  const u = { gwThick: { value: thickness } };
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.gwThick = u.gwThick;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float gwThick;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normalize(normal) * gwThick;');
  };
  mat.customProgramCacheKey = () => 'gwWorldOutline';
  mat.userData.u = u;
  return mat;
}

// ------------------------------------------------------------------ parallax ring
export function ringMaterial(tex, { repeat = 1, offset = 0, texelY = 1 / 512 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: tex }, uRepeat: { value: repeat }, uOffset: { value: offset }, uTexelY: { value: texelY },
      uColor: { value: new THREE.Color() }, uRim: { value: new THREE.Color() }, uRimAmt: { value: 0.6 },
      uGlow: { value: new THREE.Color() }, uGlowAmt: { value: 1 }, uMist: { value: new THREE.Color() },
      uMistBot: { value: -4 }, uMistTop: { value: 20 }, uMistAmt: { value: 0.5 }, uTopDark: { value: 0.75 },
      uVault: { value: new THREE.Color() }, uVaultLo: { value: 30 }, uVaultHi: { value: 90 }, uVaultAmt: { value: 0.5 },
      uTime: { value: 0 }, uOpacity: { value: 1 },
    },
    vertexShader: /* glsl */`
      varying vec2 vUv; varying float vY;
      void main(){ vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.0); vY = wp.y; gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uMap; uniform float uRepeat, uOffset, uTexelY, uRimAmt, uGlowAmt, uMistBot, uMistTop, uMistAmt, uTopDark, uTime, uOpacity;
      uniform float uVaultLo, uVaultHi, uVaultAmt;
      uniform vec3 uColor, uRim, uGlow, uMist, uVault;
      varying vec2 vUv; varying float vY;
      void main(){
        vec2 uv = vec2(vUv.x * uRepeat + uOffset, vUv.y);
        vec2 s = texture2D(uMap, uv).rg;
        float a = max(s.r, s.g);
        if (a < 0.01) discard;
        float topness = smoothstep(0.45, 0.6, vUv.y);
        float nb = texture2D(uMap, uv + vec2(0.0, uTexelY * mix(2.5, -2.5, topness))).r;
        float rim = clamp(s.r - nb, 0.0, 1.0);
        vec3 col = uColor * mix(1.0, uTopDark, smoothstep(0.5, 0.95, vUv.y));
        col = mix(col, uVault, smoothstep(uVaultLo, uVaultHi, vY) * uVaultAmt);
        float m = (1.0 - smoothstep(uMistBot, uMistTop, vY)) * uMistAmt;
        col = mix(col, uMist, m);
        col += uRim * rim * uRimAmt * (1.0 - m * 0.6) * mix(1.0, 0.55, topness);
        float tw = 0.7 + 0.3 * sin(uTime * 1.7 + floor(uv.x * 400.0) * 12.9898 + floor(uv.y * 90.0) * 4.1);
        float gl = s.g / max(a, 0.001);
        col = mix(col, uGlow * tw * uGlowAmt, clamp(gl, 0.0, 1.0));
        gl_FragColor = vec4(col, a * uOpacity);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, side: THREE.BackSide, fog: false,
  });
}

// ------------------------------------------------------------------ vault dome
export function domeMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uHorizon: { value: new THREE.Color() }, uMid: { value: new THREE.Color() }, uZenith: { value: new THREE.Color() },
      uWorm: { value: new THREE.Color() }, uWormAmt: { value: 1 }, uCrack: { value: new THREE.Color() },
      uCracks: { value: [new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4()] },
      uTime: { value: 0 }, uBand: { value: 0.42 },
    },
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform vec3 uHorizon, uMid, uZenith, uWorm, uCrack; uniform vec4 uCracks[4]; uniform float uTime, uWormAmt, uBand;
      varying vec3 vDir;
      ${NOISE_GLSL}
      void main(){
        vec3 d = normalize(vDir);
        float e = d.y;
        vec3 col = mix(uHorizon, uMid, smoothstep(0.0, uBand, e));
        col = mix(col, uZenith, smoothstep(uBand * 0.8, 0.85, e));
        float n = gwN(d * 9.0) * 0.6 + gwN(d * 31.0) * 0.4;
        float rock = smoothstep(0.12, 0.5, e);
        col *= 1.0 + (n - 0.5) * 0.7 * rock;
        // drip-streaks
        float az = atan(d.z, d.x);
        col *= 1.0 - 0.18 * rock * smoothstep(0.55, 0.95, gwN(vec3(az * 30.0, e * 3.0, 1.7)));
        // glow-worms
        vec2 g = vec2(az * 38.0, e * 46.0);
        vec2 id = floor(g); vec2 f = fract(g) - 0.5;
        float h = gwH2(id);
        vec2 o = vec2(gwH2(id + 3.1), gwH2(id + 7.7)) - 0.5;
        float dd = length(f - o * 0.6);
        float worm = smoothstep(0.1, 0.0, dd) * step(0.86, h) * smoothstep(0.22, 0.45, e);
        worm *= 0.55 + 0.45 * sin(uTime * (0.6 + h * 1.5) + h * 40.0);
        col += uWorm * worm * uWormAmt * (0.6 + h);
        // ceiling cracks: hot core + soft halo
        for (int i = 0; i < 4; i++) {
          vec4 c = uCracks[i];
          if (c.w <= 0.0) continue;
          float k = distance(d, normalize(c.xyz));
          float jag = gwN(vec3(d.xz * 60.0, float(i))) * 0.012;
          col += uCrack * c.w * (exp(-k * k * 900.0) * 1.6 + smoothstep(0.022, 0.0, k + jag) * 2.5 + exp(-k * k * 60.0) * 0.18);
        }
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    side: THREE.BackSide, depthWrite: true, fog: false,
  });
}

// ------------------------------------------------------------------ drifting particles
/**
 * Soft-sprite particles wrapping in a box that follows `center`. Positions animate on the GPU.
 * cfg: count, box[x,y,z], yMin, size, vel[x,y,z], sway, twinkle, colorA, colorB, additive, opacity, flake
 */
export function createParticles(cfg, rng) {
  const n = cfg.count | 0;
  const pos = new Float32Array(n * 3), rnd = new Float32Array(n);
  for (let i = 0; i < n; i++) { pos[i * 3] = rng(); pos[i * 3 + 1] = rng(); pos[i * 3 + 2] = rng(); rnd[i] = rng(); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
  const uniforms = {
    uCenter: { value: new THREE.Vector3() }, uBox: { value: new THREE.Vector3(...cfg.box) }, uYMin: { value: cfg.yMin ?? 0 },
    uTime: { value: 0 }, uVel: { value: new THREE.Vector3(...(cfg.vel || [0, 0, 0])) }, uSway: { value: cfg.sway ?? 0.6 },
    uSize: { value: cfg.size ?? 0.15 }, uViewH: { value: 720 }, uTwinkle: { value: cfg.twinkle ?? 1.5 },
    uColorA: { value: new THREE.Color(cfg.colorA ?? 0xffffff) }, uColorB: { value: new THREE.Color(cfg.colorB ?? 0xffffff) },
    uBright: { value: 1 }, uFogD: { value: 0.02 }, uOpacity: { value: cfg.opacity ?? 1 }, uFlake: { value: cfg.flake ? 1 : 0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      attribute float aRand;
      uniform vec3 uCenter, uBox, uVel; uniform float uYMin, uTime, uSway, uSize, uViewH, uTwinkle, uFogD, uFlake;
      varying float vA; varying float vMix; varying float vRot;
      void main(){
        vec3 w = position * uBox + uVel * uTime * (0.55 + 0.9 * aRand);
        w.x += sin(uTime * (0.35 + aRand * 0.5) + aRand * 61.0) * uSway;
        w.z += cos(uTime * (0.3 + aRand * 0.4) + aRand * 37.0) * uSway;
        w.y += sin(uTime * (0.5 + aRand) + aRand * 13.0) * uSway * 0.35;
        vec3 o = vec3(uCenter.x - uBox.x * 0.5, uYMin, uCenter.z - uBox.z * 0.5);
        vec3 l = mod(w - o, uBox);
        vec3 f = l / uBox;
        vec3 p = o + l;
        float edge = smoothstep(0.0, 0.12, f.x) * smoothstep(1.0, 0.88, f.x) * smoothstep(0.0, 0.12, f.z) * smoothstep(1.0, 0.88, f.z)
                   * smoothstep(0.0, 0.08, f.y) * smoothstep(1.0, 0.85, f.y);
        vec4 mv = viewMatrix * vec4(p, 1.0);
        float z = max(0.1, -mv.z);
        float fog = exp(-uFogD * uFogD * z * z * 0.6);
        float tw = mix(1.0, 0.35 + 0.65 * abs(sin(uTime * uTwinkle * (0.6 + aRand) + aRand * 90.0)), step(0.01, uTwinkle));
        vA = edge * fog * tw * smoothstep(0.6, 2.5, z);
        vMix = fract(aRand * 7.31);
        vRot = aRand * 6.28 + uTime * (aRand - 0.5) * 2.0 * uFlake;
        gl_PointSize = min(64.0, uSize * (0.55 + aRand) * projectionMatrix[1][1] * uViewH * 0.5 / z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColorA, uColorB; uniform float uBright, uOpacity, uFlake;
      varying float vA; varying float vMix; varying float vRot;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float a;
        if (uFlake > 0.5) {
          float cs = cos(vRot), sn = sin(vRot);
          vec2 r = vec2(c.x * cs - c.y * sn, c.x * sn + c.y * cs);
          r.y *= 2.4;
          a = smoothstep(0.5, 0.3, length(r));
        } else {
          float d = length(c);
          a = pow(smoothstep(0.5, 0.0, d), 1.6) + smoothstep(0.12, 0.0, d) * 0.6;
        }
        a *= vA;
        if (a < 0.004) discard;
        vec3 col = mix(uColorA, uColorB, vMix) * uBright;
        gl_FragColor = vec4(col, a * uOpacity);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, fog: false, toneMapped: false,
    blending: cfg.additive === false ? THREE.NormalBlending : THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 2;
  return { points, uniforms, geo, mat };
}

// ------------------------------------------------------------------ glow halos (static + dynamic)
export function createHalos(capacity) {
  const pos = new Float32Array(capacity * 3), col = new Float32Array(capacity * 3), siz = new Float32Array(capacity), ph = new Float32Array(capacity);
  const geo = new THREE.BufferGeometry();
  const aPos = new THREE.BufferAttribute(pos, 3); aPos.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('position', aPos);
  geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(siz, 1));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
  geo.setDrawRange(0, 0);
  const uniforms = { uTime: { value: 0 }, uViewH: { value: 720 }, uBright: { value: 1 }, uFogD: { value: 0.02 } };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      attribute vec3 aColor; attribute float aSize; attribute float aPhase;
      uniform float uTime, uViewH, uFogD;
      varying vec3 vCol;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float z = max(0.2, -mv.z);
        float fl = 0.82 + 0.18 * sin(uTime * (1.3 + fract(aPhase) * 2.0) + aPhase * 17.0) * sin(uTime * 2.9 + aPhase * 5.0);
        float fog = exp(-uFogD * uFogD * z * z * 0.45);
        vCol = aColor * fl * fog * smoothstep(0.8, 3.0, z);
        gl_PointSize = min(256.0, aSize * projectionMatrix[1][1] * uViewH * 0.5 / z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform float uBright;
      varying vec3 vCol;
      void main(){
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float a = pow(max(0.0, 1.0 - d), 2.4) + exp(-d * d * 30.0) * 0.8;
        if (a < 0.003) discard;
        gl_FragColor = vec4(vCol * uBright * a, 1.0);
      }`,
    transparent: true, depthWrite: false, fog: false, toneMapped: false, blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 3;
  let count = 0;
  const api = {
    points, uniforms, geo, mat, capacity,
    get count() { return count; },
    add(x, y, z, color, size, phase = Math.random() * 10) {
      if (count >= capacity) return -1;
      const i = count++;
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      col[i * 3] = color[0]; col[i * 3 + 1] = color[1]; col[i * 3 + 2] = color[2];
      siz[i] = size; ph[i] = phase;
      geo.setDrawRange(0, count);
      return i;
    },
    setPos(i, x, y, z) { pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; },
    setColor(i, r, g, b) { col[i * 3] = r; col[i * 3 + 1] = g; col[i * 3 + 2] = b; },
    getPos(i, out) { return out.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]); },
    commit() { aPos.needsUpdate = true; geo.attributes.aColor.needsUpdate = true; geo.attributes.aSize.needsUpdate = true; geo.attributes.aPhase.needsUpdate = true; },
    touchPositions() { aPos.needsUpdate = true; },
    touchColors() { geo.attributes.aColor.needsUpdate = true; },
  };
  return api;
}

// ------------------------------------------------------------------ light shafts + pools
export function createShafts(list) {
  const base = new THREE.BufferGeometry();
  base.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, 0, 0, 0.5, 0, 0, 0.5, 1, 0, -0.5, 1, 0], 3));
  base.setIndex([0, 1, 2, 0, 2, 3]);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = base.index;
  geo.setAttribute('position', base.attributes.position);
  const n = list.length;
  const top = new Float32Array(n * 3), bot = new Float32Array(n * 3), wid = new Float32Array(n * 2), ph = new Float32Array(n), pw = new Float32Array(n);
  list.forEach((s, i) => {
    top.set([s.top.x, s.top.y, s.top.z], i * 3); bot.set([s.bottom.x, s.bottom.y, s.bottom.z], i * 3);
    wid.set([s.wTop, s.wBottom], i * 2); ph[i] = s.phase; pw[i] = s.power;
  });
  geo.setAttribute('aTop', new THREE.InstancedBufferAttribute(top, 3));
  geo.setAttribute('aBottom', new THREE.InstancedBufferAttribute(bot, 3));
  geo.setAttribute('aWidth', new THREE.InstancedBufferAttribute(wid, 2));
  geo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(ph, 1));
  geo.setAttribute('aPower', new THREE.InstancedBufferAttribute(pw, 1));
  geo.instanceCount = n;
  const uniforms = { uTime: { value: 0 }, uColor: { value: new THREE.Color() }, uIntensity: { value: 1 } };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      attribute vec3 aTop; attribute vec3 aBottom; attribute vec2 aWidth; attribute float aPhase; attribute float aPower;
      uniform float uTime;
      varying vec2 vUv; varying float vFade; varying float vPow;
      void main(){
        vec3 bot = aBottom + vec3(sin(uTime * 0.21 + aPhase), 0.0, cos(uTime * 0.17 + aPhase * 1.3)) * 1.4;
        vec3 axis = aTop - bot;
        vec3 p = mix(bot, aTop, position.y);
        vec3 toCam = normalize(cameraPosition - p);
        vec3 side = normalize(cross(normalize(axis), toCam) + vec3(1e-4, 0.0, 0.0));
        p += side * position.x * mix(aWidth.y, aWidth.x, position.y);
        vUv = vec2(position.x + 0.5, position.y);
        float t = clamp(dot(cameraPosition - bot, axis) / dot(axis, axis), 0.0, 1.0);
        float dAxis = length(cameraPosition - (bot + axis * t));
        vFade = smoothstep(2.5, 12.0, dAxis);
        vPow = aPower * (0.8 + 0.2 * sin(uTime * 0.5 + aPhase * 3.0));
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform float uIntensity, uTime;
      varying vec2 vUv; varying float vFade; varying float vPow;
      void main(){
        float x = abs(vUv.x * 2.0 - 1.0);
        float edge = pow(max(0.0, 1.0 - x), 1.7);
        float vert = smoothstep(0.0, 0.22, vUv.y) * (0.6 + 0.4 * smoothstep(0.98, 0.7, vUv.y));
        float streak = 0.62 + 0.38 * sin(vUv.x * 21.0 + uTime * 0.35 + vUv.y * 4.0) * sin(vUv.x * 8.0 - uTime * 0.23 + 1.3);
        float dust = 0.85 + 0.15 * sin(vUv.y * 90.0 - uTime * 1.3 + vUv.x * 12.0);
        float a = edge * vert * streak * dust * vFade * vPow * uIntensity * 0.32;
        gl_FragColor = vec4(uColor, a);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false, toneMapped: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 4;
  // pools of light where the shafts touch the water
  const pgeo = new THREE.InstancedBufferGeometry();
  const pb = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  pgeo.index = pb.index;
  pgeo.setAttribute('position', pb.attributes.position);
  pgeo.setAttribute('uv', pb.attributes.uv);
  const pc = new Float32Array(n * 4);
  list.forEach((s, i) => pc.set([s.bottom.x, 0.06, s.bottom.z, s.wBottom * 1.6], i * 4));
  pgeo.setAttribute('aC', new THREE.InstancedBufferAttribute(pc, 4));
  pgeo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(ph, 1));
  pgeo.instanceCount = n;
  const pmat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      attribute vec4 aC; attribute float aPhase; uniform float uTime;
      varying vec2 vUv; varying float vPh;
      void main(){
        vUv = uv; vPh = aPhase;
        vec3 c = aC.xyz + vec3(sin(uTime * 0.21 + aPhase), 0.0, cos(uTime * 0.17 + aPhase * 1.3)) * 1.4;
        vec3 p = c + vec3(position.x, 0.0, position.z) * aC.w * 2.0;
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform float uIntensity, uTime;
      varying vec2 vUv; varying float vPh;
      void main(){
        float d = length(vUv - 0.5) * 2.0;
        float a = pow(max(0.0, 1.0 - d), 2.2);
        float ring = 0.75 + 0.25 * sin(d * 18.0 - uTime * 1.2 + vPh);
        gl_FragColor = vec4(uColor, a * ring * uIntensity * 0.32);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false,
  });
  const pools = new THREE.Mesh(pgeo, pmat);
  pools.frustumCulled = false;
  pools.renderOrder = 1;
  base.dispose(); pb.dispose();
  return { mesh, pools, uniforms, geos: [geo, pgeo], mats: [mat, pmat] };
}

// ------------------------------------------------------------------ shore mist ring
export function mistMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color() }, uAmt: { value: 0.5 }, uTime: { value: 0 }, uRep: { value: 24 } },
    vertexShader: /* glsl */`
      varying vec2 vUv; varying float vDist;
      void main(){ vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.0); vDist = distance(wp.xyz, cameraPosition); gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform float uAmt, uTime, uRep;
      varying vec2 vUv; varying float vDist;
      ${NOISE_GLSL}
      void main(){
        float n = gwN(vec3(vUv.x * uRep * 6.0 + uTime * 0.05, vUv.y * 2.5 - uTime * 0.03, 0.0)) * 0.65 + gwN(vec3(vUv.x * uRep * 17.0 - uTime * 0.08, vUv.y * 5.0, 3.0)) * 0.35;
        float a = pow(1.0 - vUv.y, 2.2) * (0.35 + 0.9 * n) * uAmt * smoothstep(6.0, 22.0, vDist);
        gl_FragColor = vec4(uColor, clamp(a, 0.0, 1.0));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, side: THREE.BackSide, fog: false,
  });
}

// ------------------------------------------------------------------ gate: vortex, column, spiral motes
export function vortexMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }, uOpen: { value: 0 }, uSeal: { value: 1 },
      uGlow: { value: new THREE.Color() }, uFoam: { value: new THREE.Color() }, uDeep: { value: new THREE.Color() },
    },
    vertexShader: /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform float uTime, uOpen, uSeal; uniform vec3 uGlow, uFoam, uDeep;
      varying vec2 vUv;
      ${NOISE_GLSL}
      void main(){
        vec2 p = vUv * 2.0 - 1.0;
        float r = length(p);
        if (r > 1.0) discard;
        float a = atan(p.y, p.x);
        float t = uTime;
        float sw = a * 3.0 + log(r + 0.03) * 5.5 + t * 2.4;
        float arms = pow(0.5 + 0.5 * sin(sw), 3.0);
        float arms2 = pow(0.5 + 0.5 * sin(a * 5.0 + log(r + 0.03) * 9.0 + t * 3.6 + 1.7), 6.0);
        float n = gwN(vec3(cos(a) * r * 4.0, sin(a) * r * 4.0, t * 0.4));
        float hole = smoothstep(0.05, 0.55, r);
        vec3 col = mix(uDeep, uGlow * 1.8, (arms * 0.85 + n * 0.25) * hole);
        col += uFoam * 1.6 * arms2 * hole * (1.0 - r * 0.6);
        col = mix(col, uDeep * 0.4, (1.0 - hole) * 0.85);
        float edge = smoothstep(1.0, 0.82, r);
        float alpha = edge * (0.55 + 0.45 * max(arms, 1.0 - hole)) * uOpen;
        // sealed: a faint slow rune-ripple instead of a vortex
        float rip = 0.5 + 0.5 * sin(r * 22.0 - t * 0.8);
        alpha += uSeal * edge * 0.12 * rip * smoothstep(0.2, 0.9, r);
        col = mix(col, uGlow * 0.6, uSeal * (1.0 - uOpen));
        gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, fog: false, toneMapped: false,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  });
}

export function columnMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uOpen: { value: 0 }, uColor: { value: new THREE.Color() } },
    vertexShader: /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform float uTime, uOpen; uniform vec3 uColor; varying vec2 vUv;
      void main(){
        float s = 0.6 + 0.4 * sin(vUv.x * 6.2831 * 7.0 + vUv.y * 9.0 - uTime * 2.5);
        float a = pow(1.0 - vUv.y, 2.5) * smoothstep(0.0, 0.08, vUv.y) * s * uOpen * 0.32;
        gl_FragColor = vec4(uColor, a);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false, toneMapped: false,
  });
}

export function createSpiral(count, radius, rng) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) { pos[i * 3] = rng() * Math.PI * 2; pos[i * 3 + 1] = rng(); pos[i * 3 + 2] = 0.4 + rng() * 0.8; }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const uniforms = { uTime: { value: 0 }, uOpen: { value: 0 }, uR: { value: radius }, uViewH: { value: 720 }, uColor: { value: new THREE.Color() }, uFoam: { value: new THREE.Color() } };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      uniform float uTime, uOpen, uR, uViewH;
      varying float vA; varying float vK;
      void main(){
        float k = fract(position.y + uTime * 0.16 * position.z);
        float r = uR * (1.15 - k) ;
        float a = position.x + k * 7.0 + uTime * 0.6;
        vec3 p = vec3(cos(a) * r, 0.25 + k * k * 2.5 + sin(position.x * 5.0 + uTime) * 0.15, sin(a) * r);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vA = smoothstep(0.0, 0.15, k) * smoothstep(1.0, 0.75, k) * uOpen;
        vK = k;
        gl_PointSize = min(48.0, 0.22 * (0.6 + position.z) * projectionMatrix[1][1] * uViewH * 0.5 / max(0.3, -mv.z));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor, uFoam; varying float vA; varying float vK;
      void main(){
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float a = pow(max(0.0, 1.0 - d), 2.0) * vA;
        if (a < 0.004) discard;
        gl_FragColor = vec4(mix(uColor, uFoam, vK) * 2.2, a);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 3;
  return { points, uniforms, geo, mat };
}

// ------------------------------------------------------------------ foam/ripple rings where water meets obstacles
export function createShoreRings(list) {
  const pb = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = pb.index;
  geo.setAttribute('position', pb.attributes.position);
  const n = list.length;
  const a = new Float32Array(n * 4);
  list.forEach((o, i) => a.set([o.x, o.z, o.r, o.seed ?? i * 1.7], i * 4));
  geo.setAttribute('aC', new THREE.InstancedBufferAttribute(a, 4));
  geo.instanceCount = n;
  pb.dispose();
  const uniforms = { uTime: { value: 0 }, uColor: { value: new THREE.Color() }, uAmt: { value: 1 } };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      attribute vec4 aC; varying vec2 vL; varying float vR; varying float vS; varying float vDist;
      void main(){
        float ext = aC.z + 3.5;
        vL = position.xz * ext * 2.0; vR = aC.z; vS = aC.w;
        vec3 p = vec3(aC.x + vL.x, 0.035, aC.y + vL.y);
        vDist = distance(p, cameraPosition);
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */`
      uniform float uTime, uAmt; uniform vec3 uColor;
      varying vec2 vL; varying float vR; varying float vS; varying float vDist;
      ${NOISE_GLSL}
      void main(){
        float d = length(vL);
        float ang = atan(vL.y, vL.x);
        float wob = (gwN(vec3(cos(ang) * 2.0 + vS, sin(ang) * 2.0, uTime * 0.15)) - 0.5) * (0.5 + vR * 0.12);
        float e = d - vR * 1.04 - wob;
        float band = exp(-e * e * 2.2) * 0.55;
        float rip = max(0.0, sin((e - uTime * 0.55) * 4.2)) * exp(-max(e, 0.0) * 0.9) * step(-0.2, e) * 0.35;
        float brk = 0.55 + 0.45 * gwN(vec3(cos(ang) * 6.0, sin(ang) * 6.0, vS + uTime * 0.2));
        float a = (band + rip) * brk * smoothstep(3.4, 2.0, e) * uAmt * smoothstep(2.0, 6.0, vDist);
        if (a < 0.004) discard;
        gl_FragColor = vec4(uColor, a);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 1;
  return { mesh, uniforms, geo, mat };
}

// ------------------------------------------------------------------ low mist sheets drifting over the water
export function createMistSheets(list) {
  const pb = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = pb.index;
  geo.setAttribute('position', pb.attributes.position);
  const n = list.length;
  const a = new Float32Array(n * 4), b = new Float32Array(n * 2);
  list.forEach((s, i) => { a.set([s.x, s.y, s.z, s.size], i * 4); b.set([s.phase, s.drift], i * 2); });
  geo.setAttribute('aC', new THREE.InstancedBufferAttribute(a, 4));
  geo.setAttribute('aP', new THREE.InstancedBufferAttribute(b, 2));
  geo.instanceCount = n;
  pb.dispose();
  const uniforms = { uTime: { value: 0 }, uColor: { value: new THREE.Color() }, uAmt: { value: 1 } };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      attribute vec4 aC; attribute vec2 aP; uniform float uTime;
      varying vec2 vUv; varying float vDist; varying float vPh;
      void main(){
        vUv = position.xz + 0.5; vPh = aP.x;
        vec3 c = aC.xyz + vec3(sin(uTime * 0.013 * aP.y + aP.x), 0.0, cos(uTime * 0.011 * aP.y + aP.x * 1.3)) * 7.0;
        vec3 p = c + vec3(position.x, 0.0, position.z) * aC.w;
        vDist = distance(p, cameraPosition);
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */`
      uniform float uTime, uAmt; uniform vec3 uColor;
      varying vec2 vUv; varying float vDist; varying float vPh;
      ${NOISE_GLSL}
      void main(){
        vec2 q = vUv - 0.5;
        float r = length(q) * 2.0;
        float n = gwN(vec3(vUv * 3.0 + vec2(uTime * 0.02, vPh), uTime * 0.03)) * 0.6 + gwN(vec3(vUv * 7.0 - vec2(0.0, uTime * 0.03), vPh + 4.0)) * 0.4;
        float a = smoothstep(1.0, 0.25, r) * smoothstep(0.35, 0.8, n) * uAmt * smoothstep(4.0, 14.0, vDist);
        if (a < 0.003) discard;
        gl_FragColor = vec4(uColor, a * 0.2);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, fog: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 2;
  return { mesh, uniforms, geo, mat };
}
