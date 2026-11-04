// actors-fx.js — effect pieces for actors.js: living flame shader, the lantern's light
// pool on the water, the fishing line ribbon (slack sag, tension tint) and the bobber.
import * as THREE from 'three';
import { INK, PALE, toonMaterial, glowSprite, glowMaterial, addOutline } from './toon.js';
import { TAU } from './models-kit.js';

// ------------------------------------------------------------------ flame
const FLAME_VS = /* glsl */`
uniform float uT; uniform vec2 uLean; uniform float uWild;
varying float vY; varying float vF;
void main() {
  vec3 p = position; float y = clamp(p.y, 0.0, 1.0); float y2 = y * y;
  float w = 1.0 + uWild;
  p.x += sin(uT * 9.0 * w + y * 5.0) * 0.07 * y2 * w + uLean.x * y2;
  p.z += cos(uT * 7.3 * w + y * 4.0) * 0.06 * y2 * w + uLean.y * y2;
  p.y *= 1.0 + sin(uT * 13.0 + sin(uT * 5.3)) * 0.06 * w;
  vY = y;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vec3 n = normalize(normalMatrix * normal);
  vF = abs(dot(n, normalize(-mv.xyz)));
  gl_Position = projectionMatrix * mv;
}`;
const FLAME_FS = /* glsl */`
uniform vec3 uColor, uCore; uniform float uI;
varying float vY; varying float vF;
void main() {
  vec3 col = mix(uCore, uColor, smoothstep(0.04, 0.5, vY));
  col = mix(col, uColor * vec3(1.0, 0.5, 0.32), smoothstep(0.55, 1.0, vY));
  float a = (1.0 - smoothstep(0.45, 1.0, vY)) * (0.3 + 0.7 * pow(vF, 0.9));
  a *= smoothstep(0.0, 0.1, vY + 0.03);
  gl_FragColor = vec4(col * a * uI, a);
  #include <colorspace_fragment>
}`;
let flameGeo = null;
export function flameGeometry() {
  if (flameGeo) return flameGeo;
  const pts = [[0, 0], [0.3, 0.05], [0.47, 0.17], [0.5, 0.3], [0.42, 0.46], [0.28, 0.64], [0.13, 0.82], [0.0, 1.0]];
  flameGeo = new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), 14);
  return flameGeo;
}
/** Additive living flame. uniforms: uT, uLean, uWild, uColor, uCore, uI. */
export function flameMaterial(color = 0xffb347, core = 0xfff3d0) {
  return new THREE.ShaderMaterial({
    vertexShader: FLAME_VS, fragmentShader: FLAME_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uT: { value: 0 }, uLean: { value: new THREE.Vector2() }, uWild: { value: 0 }, uColor: { value: new THREE.Color(color) }, uCore: { value: new THREE.Color(core) }, uI: { value: 2.2 } },
  });
}
/** Flame = outer + inner lathe + glow sprite, in a group whose origin is the flame base. */
export function makeFlame({ color = 0xffb347, size = 1, glow = 0.9 } = {}) {
  const g = new THREE.Group(); g.name = 'flame';
  const outerMat = flameMaterial(color), innerMat = flameMaterial(0xffe4a0, 0xffffff);
  innerMat.uniforms.uI.value = 2.8;
  const outer = new THREE.Mesh(flameGeometry(), outerMat); outer.scale.set(0.12 * size, 0.27 * size, 0.12 * size); outer.renderOrder = 6;
  const inner = new THREE.Mesh(flameGeometry(), innerMat); inner.scale.set(0.055 * size, 0.14 * size, 0.055 * size); inner.renderOrder = 7;
  const halo = glowSprite({ color, size: glow * size, opacity: 0.55 }); halo.position.y = 0.09 * size; halo.renderOrder = 5;
  g.add(outer, inner, halo);
  return { group: g, outer, inner, halo, outerMat, innerMat, mats: [outerMat, innerMat, halo.material] };
}

// ------------------------------------------------------------------ light pool
const POOL_VS = /* glsl */`
attribute vec2 aPolar;
varying vec2 vPolar;
void main() { vPolar = aPolar; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const POOL_FS = /* glsl */`
uniform vec3 uColor, uRing; uniform float uK, uT, uPulse, uDanger, uRadius;
varying vec2 vPolar;
void main() {
  float r = vPolar.x, ang = vPolar.y;
  float fill = pow(clamp(1.0 - r, 0.0, 1.0), 1.6) * 0.13 + (1.0 - smoothstep(0.0, 0.35, r)) * 0.05;
  float lip = smoothstep(0.7, 0.995, r) * (1.0 - smoothstep(0.995, 1.01, r)) * 0.06;
  float wpx = clamp(0.1 / max(uRadius, 1.0), 0.006, 0.03);
  float ring = exp(-pow((r - 1.0) / wpx, 2.0)) * 0.95 + exp(-pow((r - 1.0) / (wpx * 5.0), 2.0)) * 0.22;
  float a2 = ang + uT * 0.035;
  float notch = smoothstep(0.82, 1.0, cos(a2 * 40.0)) * exp(-pow((r - 0.968) / (wpx * 1.2), 2.0)) * 0.55;
  float a3 = ang - uT * 0.05;
  float notch2 = smoothstep(0.93, 1.0, cos(a3 * 8.0)) * exp(-pow((r - 1.035) / (wpx * 1.3), 2.0)) * 0.6;
  float rip = pow(sin((r * 3.0 - uT * 0.22) * 6.2831) * 0.5 + 0.5, 14.0) * smoothstep(0.15, 0.45, r) * (1.0 - smoothstep(0.75, 0.95, r)) * 0.035;
  float spill = (1.0 - smoothstep(1.0, 1.25, r)) * step(1.0, r) * 0.07;
  float k = uK * (0.88 + 0.12 * uPulse);
  vec3 ringCol = mix(uRing, vec3(1.0, 0.25, 0.12), uDanger * (0.55 + 0.45 * sin(uT * 7.0)));
  vec3 col = uColor * (fill + lip + rip + spill) + ringCol * (ring + notch + notch2);
  gl_FragColor = vec4(col * k, 1.0);
  #include <colorspace_fragment>
}`;
export function makeLightPool() {
  const AN = 64;
  const radii = [];
  for (let i = 0; i <= 9; i++) radii.push((i / 9) * 0.84);
  for (let i = 1; i <= 14; i++) radii.push(0.84 + (i / 14) * 0.24);
  for (let i = 1; i <= 4; i++) radii.push(1.08 + (i / 4) * 0.2);
  const RN = radii.length;
  const pos = new Float32Array(RN * (AN + 1) * 3), polar = new Float32Array(RN * (AN + 1) * 2), idx = [];
  for (let i = 0; i < RN; i++) for (let j = 0; j <= AN; j++) {
    const k = i * (AN + 1) + j, a = (j / AN) * TAU;
    polar[k * 2] = radii[i]; polar[k * 2 + 1] = a;
    pos[k * 3] = Math.cos(a) * radii[i]; pos[k * 3 + 2] = Math.sin(a) * radii[i];
  }
  for (let i = 0; i < RN - 1; i++) for (let j = 0; j < AN; j++) { const a = i * (AN + 1) + j, b = a + AN + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const geo = new THREE.BufferGeometry();
  const pa = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('position', pa);
  geo.setAttribute('aPolar', new THREE.BufferAttribute(polar, 2));
  geo.setIndex(idx);
  const mat = new THREE.ShaderMaterial({
    vertexShader: POOL_VS, fragmentShader: POOL_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(0xffb85a) }, uRing: { value: new THREE.Color(0xffc477) }, uK: { value: 1 }, uT: { value: 0 }, uPulse: { value: 0 }, uDanger: { value: 0 }, uRadius: { value: 8 } },
  });
  mat.polygonOffset = true; mat.polygonOffsetFactor = -2; mat.polygonOffsetUnits = -2;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false; mesh.renderOrder = 1; mesh.name = 'lightPool';
  let frame = 0;
  return {
    mesh, mat,
    /** Centre the disc on (cx, cz) with radius R; re-sample water heights every other call (heightFn(x,z) -> y). */
    layout(cx, cz, R, heightFn, lift = 0.07) {
      mesh.position.set(cx, 0, cz);
      mesh.scale.set(R, 1, R);
      if ((frame++ & 1) && frame > 2) return;
      const n = RN * (AN + 1);
      for (let k = 0; k < n; k++) {
        const o = k * 3;
        pos[o + 1] = (heightFn ? heightFn(cx + pos[o] * R, cz + pos[o + 2] * R) : 0) + lift;
      }
      pa.needsUpdate = true;
    },
    dispose() { geo.dispose(); mat.dispose(); },
  };
}

// ------------------------------------------------------------------ fishing line (camera-facing ribbon)
export function makeLine(segments = 40) {
  const N = segments + 1;
  const pos = new Float32Array(N * 2 * 3), idx = [];
  for (let i = 0; i < segments; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const geo = new THREE.BufferGeometry();
  const pa = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('position', pa); geo.setIndex(idx);
  const mat = new THREE.MeshBasicMaterial({ color: 0xe2e5ec, side: THREE.DoubleSide, fog: true, toneMapped: false });
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.name = 'fishingLine'; mesh.visible = false;
  const pts = []; for (let i = 0; i < N; i++) pts.push(new THREE.Vector3());
  const T = new THREE.Vector3(), V = new THREE.Vector3(), S = new THREE.Vector3();
  const base = new THREE.Color(0xe2e5ec), warm = new THREE.Color(0xffd08a), hot = new THREE.Color(0xff5a3c);
  return {
    mesh, mat, pts,
    /** Compute the curve: tip -> end with parabolic slack sag, lying on the water where it touches. */
    shape(tip, end, slack, tension, t, heightFn) {
      const dx = end.x - tip.x, dy = end.y - tip.y, dz = end.z - tip.z;
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const sag = Math.min(3.2, slack * (0.08 + len * 0.16));
      const vib = tension > 0.75 ? (tension - 0.75) * 0.06 : 0;
      for (let i = 0; i < N; i++) {
        const u = i / (N - 1), p = pts[i];
        p.set(tip.x + dx * u, tip.y + dy * u, tip.z + dz * u);
        const m = 4 * u * (1 - u);
        p.y -= sag * m;
        if (vib) { const w = Math.sin(t * 70 + u * 30) * vib * m; p.x += w * 0.7; p.y += w; }
        else if (slack > 0.05) { p.x += Math.sin(t * 1.3 + u * 6) * 0.03 * slack * m; }
        if (heightFn && u > 0.02) { const h = heightFn(p.x, p.z) + 0.01; if (p.y < h) p.y = h; }
      }
      const tt = Math.max(0, Math.min(1, tension));
      if (tt < 0.6) mat.color.copy(base).lerp(warm, tt / 0.6 * 0.3); else mat.color.copy(base).lerp(warm, 0.3).lerp(hot, (tt - 0.6) / 0.4);
      mat.color.multiplyScalar(1 + tt * 0.8);
    },
    /** Expand the curve into a camera-facing strip (~1.6 px wide). */
    ribbon(camPos) {
      for (let i = 0; i < N; i++) {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N - 1, i + 1)], p = pts[i];
        T.subVectors(b, a); V.subVectors(camPos, p);
        const d = V.length();
        S.crossVectors(T, V).normalize().multiplyScalar(Math.max(0.006, d * 0.0011));
        const k = i * 6;
        pos[k] = p.x - S.x; pos[k + 1] = p.y - S.y; pos[k + 2] = p.z - S.z;
        pos[k + 3] = p.x + S.x; pos[k + 4] = p.y + S.y; pos[k + 5] = p.z + S.z;
      }
      pa.needsUpdate = true;
    },
    dispose() { geo.dispose(); mat.dispose(); },
  };
}

// ------------------------------------------------------------------ bobber
export function makeBobber() {
  const g = new THREE.Group(); g.name = 'bobber'; g.visible = false;
  const tilt = new THREE.Group(); g.add(tilt);
  const body = new THREE.SphereGeometry(0.075, 14, 10);
  const col = new Float32Array(body.attributes.position.count * 3);
  const top = new THREE.Color(0xc8402c), bot = new THREE.Color(0xe8dcc0), band = new THREE.Color(0x15100c);
  for (let i = 0; i < body.attributes.position.count; i++) {
    const y = body.attributes.position.getY(i);
    const c = Math.abs(y) < 0.008 ? band : y > 0 ? top : bot;
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  body.setAttribute('color', new THREE.BufferAttribute(col, 3));
  body.scale(1, 1.15, 1);
  const bm = toonMaterial({ color: 0xffffff, vertexColors: true, rim: 0.45 });
  const bodyMesh = new THREE.Mesh(body, bm); tilt.add(bodyMesh);
  addOutline(bodyMesh, { thickness: 0.012 });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.13, 6), toonMaterial({ color: 0x1a1410, rim: 0.3 }));
  stem.position.y = 0.13; tilt.add(stem);
  const tipMat = glowMaterial(0xffb066, 2.4);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), tipMat); tip.position.y = 0.2; tilt.add(tip);
  const halo = glowSprite({ color: 0xffb066, size: 0.55, opacity: 0.6 }); halo.position.y = 0.2; tilt.add(halo);
  return { group: g, tilt, tipMat, halo, mats: [bm, stem.material, tipMat, halo.material], geos: [body, stem.geometry, tip.geometry] };
}
