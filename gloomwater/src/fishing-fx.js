// fishing-fx.js — every visual the fishing module owns (imported only by fishing.js):
// the depth reticle + label, the dotted castMax range ring, the dotted cast-arc preview,
// feeding-spot mote columns / light shafts / surface rings / circling fish silhouettes,
// the legend pool's ring of still water, event pulse rings, a small particle pool
// (spores, glints, droplets) and the hooked fish's shadow.
//
// Budget: ~12 draw calls total. Everything spot-related is GPU-animated from small
// uniform arrays (no per-frame buffer uploads); the only per-frame CPU buffers are the
// 18-dot cast arc and the live particles. Nothing allocates per frame.
import * as THREE from 'three';

export const MAX_SLOTS = 10;          // spot slots (8 feeding spots + legend column + spare)
const ARC_DOTS = 18;
const PULSES = 8;
const PARTICLES = 192;

const COL = {
  bone: 0xe9e2cf,
  shallow: 0xa8c8f0, mid: 0xffc27a, deep: 0xb48cff, deepRim: 0xe8c66a,
  rareA: 0xb48cff, rareB: 0xffd98a, legend: 0xffd27a, legendB: 0xfff0c0,
  ink: 0x05080a, blocked: 0xff7a6a, anchor: 0x8e96a4,
};

// ------------------------------------------------------------------ shared GLSL bits
const SPOT_UNIFORMS = /* glsl */`
uniform vec4 uSpot[${MAX_SLOTS}];   // x, z, strength, kind (0 normal, 1 rare, 2 legend)
uniform vec4 uSpotB[${MAX_SLOTS}];  // highlight, radius, column height, water y
uniform float uTime;
uniform vec3 uColA; uniform vec3 uColB; uniform vec3 uColRareA; uniform vec3 uColRareB; uniform vec3 uColLegend; uniform vec3 uColLegendB;
vec3 kindColor(float kind, float s) {
  if (kind > 1.5) return mix(uColLegend, uColLegendB, s);
  if (kind > 0.5) return mix(uColRareA, uColRareB, s);
  return mix(uColA, uColB, s);
}`;

const MOTE_VS = /* glsl */`
${SPOT_UNIFORMS}
uniform float uScale;
attribute float aSlot;
varying vec3 vCol; varying float vA;
void main() {
  int i = int(aSlot + 0.5);
  vec4 S = uSpot[i]; vec4 B = uSpotB[i];
  if (S.z < 0.002) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0; vA = 0.0; vCol = vec3(0.0); return; }
  vec3 sd = position;                         // three 0..1 seeds per mote
  float kind = S.w;
  float speed = kind > 1.5 ? 0.05 + sd.y * 0.03 : 0.10 + sd.y * 0.09;
  float h = fract(sd.x + uTime * speed);
  float dir = sd.x > 0.5 ? 1.0 : -1.0;
  float ang = sd.y * 6.2831 + uTime * (0.25 + sd.z * 0.45) * dir;
  float rad = B.y * (0.12 + 0.88 * sd.z) * (1.0 - 0.45 * h) * (0.85 + 0.3 * B.x);
  vec3 p = vec3(S.x + cos(ang) * rad, B.w + 0.08 + h * B.z * (0.7 + 0.3 * sd.z), S.y + sin(ang) * rad);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float a = smoothstep(0.0, 0.08, h) * (1.0 - smoothstep(0.6, 1.0, h));
  float tw = 0.55 + 0.45 * sin(uTime * (2.5 + sd.z * 5.0) + sd.x * 40.0);
  vA = a * tw * S.z * (0.8 + 0.7 * B.x);
  float size = (0.10 + 0.16 * sd.z) * (kind > 1.5 ? 1.4 : 1.0) * (1.0 + 0.4 * B.x);
  gl_PointSize = max(size * uScale / max(0.5, -mv.z), 3.0 * min(1.0, S.z * 2.0));
  vCol = kindColor(kind, sd.z) * (kind > 1.5 ? 2.6 : 2.2);
}`;
const MOTE_FS = /* glsl */`
varying vec3 vCol; varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = (pow(max(0.0, 1.0 - d), 2.2) + 0.5 * smoothstep(0.35, 0.0, d)) * vA;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vCol * (0.55 + 1.1 * smoothstep(0.5, 0.0, d)), min(1.0, a));
  #include <colorspace_fragment>
}`;

const SHAFT_VS = /* glsl */`
${SPOT_UNIFORMS}
attribute float aSlot; attribute vec2 aCorner;
varying vec2 vUv; varying vec3 vCol; varying float vA;
void main() {
  int i = int(aSlot + 0.5);
  vec4 S = uSpot[i]; vec4 B = uSpotB[i];
  vec3 c = vec3(S.x, B.w, S.y);
  vec3 toCam = cameraPosition - c; toCam.y = 0.0;
  vec3 right = normalize(vec3(-toCam.z, 0.0, toCam.x) + vec3(1e-4, 0.0, 0.0));
  float width = B.y * (S.w > 1.5 ? 0.75 : 0.6);
  vec3 p = c + right * aCorner.x * width + vec3(0.0, aCorner.y * B.z * 1.25, 0.0);
  if (S.z < 0.002) p = vec3(0.0, -50.0, 0.0);
  vUv = aCorner; vCol = kindColor(S.w, 0.35); vA = S.z * (0.75 + 0.5 * B.x);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const SHAFT_FS = /* glsl */`
uniform float uTime;
varying vec2 vUv; varying vec3 vCol; varying float vA;
void main() {
  float x = abs(vUv.x), y = vUv.y;
  float core = pow(max(0.0, 1.0 - x), 3.0) + 0.6 * smoothstep(0.12, 0.0, x);
  float vert = pow(max(0.0, 1.0 - y), 1.4) * smoothstep(0.0, 0.04, y);
  float bands = 0.7 + 0.3 * sin(y * 16.0 - uTime * 2.2 + x * 3.0);
  float a = core * vert * bands * vA * 0.42;
  if (a < 0.002) discard;
  gl_FragColor = vec4(vCol * 1.6, a);
  #include <colorspace_fragment>
}`;

const RING_VS = /* glsl */`
${SPOT_UNIFORMS}
attribute float aSlot; attribute float aRing; attribute vec2 aCorner;
varying vec2 vUv; varying float vR; varying float vPh; varying vec3 vCol; varying float vA; varying float vRing;
void main() {
  int i = int(aSlot + 0.5);
  vec4 S = uSpot[i]; vec4 B = uSpotB[i];
  float rate = S.w > 1.5 ? 0.16 : 0.32;
  float ph = fract(uTime * rate + aRing / 3.0 + aSlot * 0.137);
  float R = aRing < 0.5 ? B.y : mix(0.35, B.y * 1.25, ph);
  float hs = R + 0.4;
  vec3 p = vec3(S.x + aCorner.x * hs, B.w + 0.14, S.y + aCorner.y * hs);
  if (S.z < 0.002) p = vec3(0.0, -50.0, 0.0);
  vUv = aCorner * hs; vR = R; vPh = ph; vRing = aRing;
  vCol = kindColor(S.w, 0.2); vA = S.z * (0.7 + 0.8 * B.x);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const RING_FS = /* glsl */`
uniform float uTime;
varying vec2 vUv; varying float vR; varying float vPh; varying vec3 vCol; varying float vA; varying float vRing;
void main() {
  float d = length(vUv);
  float a;
  if (vRing < 0.5) {
    // base: soft glow pool + a faint fixed boundary ring (spot radius)
    float glow = pow(max(0.0, 1.0 - d / vR), 2.0) * 0.32;
    float edge = smoothstep(0.06, 0.0, abs(d - vR)) * 0.22 * (0.7 + 0.3 * sin(atan(vUv.y, vUv.x) * 12.0 + uTime));
    a = (glow + edge) * vA;
  } else {
    float w = 0.05 + 0.05 * vPh;
    a = smoothstep(w, 0.0, abs(d - vR)) * pow(1.0 - vPh, 1.4) * smoothstep(0.0, 0.15, vPh) * 0.7 * vA;
  }
  if (a < 0.003) discard;
  gl_FragColor = vec4(vCol * 1.5, a);
  #include <colorspace_fragment>
}`;

const SIL_VS = /* glsl */`
${SPOT_UNIFORMS}
attribute float aSlot; attribute float aFish; attribute vec2 aCorner;
varying vec2 vUv; varying float vA; varying float vWig;
void main() {
  int i = int(aSlot + 0.5);
  vec4 S = uSpot[i]; vec4 B = uSpotB[i];
  float dir = mod(aSlot, 2.0) < 1.0 ? 1.0 : -1.0;
  float sp = (0.45 + 0.12 * aFish) * dir;
  float ang = uTime * sp + aFish * 2.094 + aSlot * 1.7;
  float r = B.y * (0.42 + 0.14 * aFish) + 0.25 * sin(uTime * 0.7 + aFish * 3.0);
  vec2 c = vec2(S.x, S.y) + vec2(cos(ang), sin(ang)) * r;
  vec2 fwd = normalize(vec2(-sin(ang), cos(ang)) * dir);
  vec2 side = vec2(-fwd.y, fwd.x);
  float len = (0.85 + 0.25 * aFish) * (S.w > 1.5 ? 2.0 : 1.0);
  vec2 q = c + fwd * aCorner.y * len * 0.5 + side * aCorner.x * len * 0.22;
  vec3 p = vec3(q.x, B.w + 0.12, q.y);
  if (S.z < 0.002) p = vec3(0.0, -50.0, 0.0);
  vUv = aCorner; vA = S.z; vWig = sin(uTime * 7.0 + aFish * 2.0 + aSlot);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const SIL_FS = /* glsl */`
uniform vec3 uInk; uniform vec3 uRim;
varying vec2 vUv; varying float vA; varying float vWig;
void main() {
  // fish silhouette in local space: y = -1 tail … +1 head, x = -1 … 1 across
  vec2 u = vUv;
  u.x += vWig * 0.18 * smoothstep(0.2, -1.0, u.y);
  float body = length(vec2(u.x / 0.55, (u.y - 0.15) / 0.78)) - 1.0;
  vec2 t = vec2(abs(u.x), u.y + 0.9);
  float tail = max(t.y - 0.32 - t.x * 0.4, -t.y + t.x * 0.9 - 0.02);
  float sdf = min(body, tail * 1.6);
  float a = smoothstep(0.06, -0.06, sdf);
  float rim = smoothstep(0.1, 0.0, abs(sdf + 0.02)) * 0.5;
  a *= vA * 0.78;
  if (a < 0.003) discard;
  gl_FragColor = vec4(mix(uInk, uRim, rim * 0.45), max(a, rim * 0.35 * vA));
  #include <colorspace_fragment>
}`;

const RETICLE_VS = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv * 2.0 - 1.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const RETICLE_FS = /* glsl */`
uniform vec3 uColor; uniform vec3 uRim; uniform vec3 uBone; uniform float uAlpha; uniform float uTime; uniform float uClean; uniform float uDeep; uniform float uSpin;
varying vec2 vUv;
void main() {
  float d = length(vUv);
  float ang = atan(vUv.y, vUv.x);
  float ringR = 0.74 + 0.06 * uClean;
  float ring = smoothstep(0.05, 0.012, abs(d - ringR));
  float glow = exp(-abs(d - ringR) * 9.0) * 0.4;
  // four inward ticks, slowly turning
  float a4 = mod(ang + uSpin, 1.5708) - 0.7854;
  float tick = smoothstep(0.05, 0.0, abs(a4) * d) * step(0.44, d) * step(d, 0.62);
  // four outer diamonds between the ticks
  float b4 = mod(ang + uSpin + 0.7854, 1.5708) - 0.7854;
  vec2 dq = vec2(abs(b4) * d * 9.0, abs(d - 0.9) * 9.0);
  float diamond = smoothstep(0.55, 0.35, dq.x + dq.y);
  float dotc = smoothstep(0.075, 0.03, d);
  float fill = (1.0 - smoothstep(0.0, ringR, d)) * 0.16 + smoothstep(ringR - 0.25, ringR, d) * step(d, ringR) * 0.12;
  float rim2 = smoothstep(0.022, 0.0, abs(d - 0.86)) * uDeep;
  vec3 col = uColor * (ring * 2.2 + glow + tick * 1.5 + dotc * 1.6 + fill) + uRim * (rim2 * 1.8 + diamond * 1.3);
  float burst = uClean * smoothstep(0.06, 0.0, abs(d - 0.95)) * (0.6 + 0.4 * sin(uTime * 18.0));
  col = mix(col, vec3(1.0, 0.86, 0.6) * 2.6 * (ring + tick + diamond + dotc), uClean * 0.8) + vec3(1.0, 0.86, 0.6) * burst * 2.0;
  float a = clamp(ring + glow + tick + dotc + fill + rim2 + diamond * 0.8 + burst, 0.0, 1.0) * uAlpha;
  if (a < 0.003) discard;
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}`;

const RANGE_FS = /* glsl */`
uniform vec3 uColor; uniform float uAlpha; uniform float uTime; uniform float uR; uniform float uHalf; uniform vec2 uAim; uniform float uDots;
varying vec2 vUv;
void main() {
  vec2 p = vUv * uHalf;
  float dm = length(p);
  float line = smoothstep(0.09, 0.0, abs(dm - uR));
  float ang = atan(p.y, p.x);
  float cell = fract(ang / 6.28318 * uDots - uTime * 0.02);
  float dotv = smoothstep(0.32, 0.12, abs(cell - 0.5));
  vec2 dir = p / max(dm, 1e-3);
  float aimK = smoothstep(0.93, 1.0, dot(dir, uAim));
  float a = line * (dotv * 0.55 + aimK * 0.9) * uAlpha;
  if (a < 0.003) discard;
  gl_FragColor = vec4(uColor * (1.0 + aimK * 1.2), a);
  #include <colorspace_fragment>
}`;

const ARC_VS = /* glsl */`
uniform float uScale; uniform float uTime;
attribute float aK;
varying float vA;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float travel = smoothstep(0.75, 1.0, fract(aK * 2.5 - uTime * 1.1));
  vA = (0.5 + 0.5 * travel) * smoothstep(0.0, 0.1, aK);
  gl_PointSize = max(3.0, (0.13 + 0.07 * travel) * uScale / max(0.5, -mv.z));
}`;
const ARC_FS = /* glsl */`
uniform vec3 uColor; uniform float uAlpha;
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.45, d) * vA * uAlpha;
  if (a < 0.003) discard;
  gl_FragColor = vec4(uColor * 1.8, a);
  #include <colorspace_fragment>
}`;

const PULSE_VS = /* glsl */`
uniform vec4 uP[${PULSES}];   // x, y, z, radius
uniform vec4 uQ[${PULSES}];   // r, g, b, alpha
uniform float uW[${PULSES}];
attribute float aIdx; attribute vec2 aCorner;
varying vec2 vUv; varying float vR; varying vec4 vQ; varying float vW;
void main() {
  int i = int(aIdx + 0.5);
  vec4 P = uP[i];
  float hs = P.w + uW[i] * 3.0 + 0.1;
  vec3 p = vec3(P.x + aCorner.x * hs, P.y, P.z + aCorner.y * hs);
  if (uQ[i].a < 0.003) p = vec3(0.0, -60.0, 0.0);
  vUv = aCorner * hs; vR = P.w; vQ = uQ[i]; vW = uW[i];
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const PULSE_FS = /* glsl */`
varying vec2 vUv; varying float vR; varying vec4 vQ; varying float vW;
void main() {
  float d = length(vUv);
  float ring = smoothstep(vW, 0.0, abs(d - vR));
  float glow = exp(-abs(d - vR) / max(0.02, vW * 2.5)) * 0.35;
  float a = (ring + glow) * vQ.a;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vQ.rgb * 1.8, min(1.0, a));
  #include <colorspace_fragment>
}`;

const PART_VS = /* glsl */`
uniform float uScale;
attribute vec3 aCol; attribute float aA; attribute float aS;
varying vec3 vCol; varying float vA;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aA > 0.002 ? max(1.5, aS * uScale / max(0.3, -mv.z)) : 0.0;
  vCol = aCol; vA = aA;
}`;
const PART_FS = /* glsl */`
varying vec3 vCol; varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = pow(max(0.0, 1.0 - d), 1.5) * vA;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vCol, a);
  #include <colorspace_fragment>
}`;

const SHADOW_FS = /* glsl */`
uniform vec3 uInk; uniform vec3 uRim; uniform float uAlpha; uniform float uWig; uniform float uRimK;
varying vec2 vUv;
void main() {
  // fish-shaped shadow under the hooked fish: head toward local +z (uv.y = -1 after rotateX)
  vec2 u = vec2(vUv.x, -vUv.y);
  u.x += uWig * 0.22 * smoothstep(0.2, -1.0, u.y);
  float body = length(vec2(u.x / 0.6, (u.y - 0.1) / 0.84)) - 1.0;
  vec2 t = vec2(abs(u.x), u.y + 0.9);
  float tail = max(t.y - 0.2 - t.x * 0.55, -t.y + t.x * 0.8 - 0.04);
  float sdf = min(body, tail * 1.8);
  float a = smoothstep(0.18, -0.3, sdf);
  float rim = smoothstep(0.08, 0.0, abs(sdf - 0.03)) * uRimK;
  float alpha = max(a * uAlpha, rim * 0.5 * uAlpha);
  if (alpha < 0.003) discard;
  gl_FragColor = vec4(mix(uInk, uRim, clamp(rim * 1.4, 0.0, 1.0)), alpha);
  #include <colorspace_fragment>
}`;

const POOL_FS = /* glsl */`
uniform vec3 uInk; uniform vec3 uRing; uniform vec3 uGold; uniform float uR; uniform float uHalf; uniform float uActive; uniform float uDim; uniform float uTime; uniform float uAlpha;
varying vec2 vUv;
void main() {
  vec2 p = vUv * uHalf;
  float d = length(p);
  float disc = smoothstep(uR + 0.4, uR - 0.6, d);
  float rings = 0.0;
  for (int k = 0; k < 3; k++) {
    float ph = fract(uTime * 0.05 + float(k) / 3.0);
    rings += smoothstep(0.05, 0.0, abs(d - ph * uR)) * (1.0 - ph) * 0.35;
  }
  float edge = smoothstep(0.08, 0.0, abs(d - uR));
  float lace = 0.6 + 0.4 * sin(atan(p.y, p.x) * 16.0 + uTime * 0.4);
  vec3 ringCol = mix(uRing, uGold, uActive);
  float glowA = (edge * lace * (0.35 + 0.65 * uActive) + rings * (0.3 + 0.7 * uActive)) * uDim;
  float a = (disc * 0.32 + glowA) * uAlpha;
  if (a < 0.003) discard;
  vec3 col = mix(uInk, ringCol * (1.2 + 1.4 * uActive), clamp(glowA / max(a / max(uAlpha, 1e-3), 1e-3), 0.0, 1.0));
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}`;

// ------------------------------------------------------------------ helpers
function quadIndexGeometry(count, perQuad) {
  // count quads, perQuad(attrs, q, corner) fills attributes for each of 4 corners
  const idx = new Uint16Array(count * 6);
  for (let q = 0; q < count; q++) {
    const v = q * 4, o = q * 6;
    idx[o] = v; idx[o + 1] = v + 2; idx[o + 2] = v + 1; idx[o + 3] = v + 1; idx[o + 4] = v + 2; idx[o + 5] = v + 3;
  }
  const geo = new THREE.BufferGeometry();
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 4 * 3), 3));
  perQuad(geo);
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  return geo;
}
const CORNERS = [[-1, -1], [1, -1], [-1, 1], [1, 1]];

function labelTexture(text, color) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 256, 64);
  g.font = '600 26px Cinzel, "Cormorant Garamond", Georgia, serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const spaced = text.split('').join(String.fromCharCode(8202));
  g.lineJoin = 'round';
  g.lineWidth = 6; g.strokeStyle = 'rgba(5,8,12,0.85)';
  g.strokeText(spaced, 128, 34);
  g.fillStyle = '#e9e2cf';
  g.fillText(spaced, 128, 34);
  const w = Math.min(200, g.measureText(spaced).width);
  g.fillStyle = '#' + new THREE.Color(color).getHexString();
  for (const sx of [-1, 1]) {
    const x = 128 + sx * (w / 2 + 14);
    g.beginPath(); g.moveTo(x, 27); g.lineTo(x + 6, 34); g.lineTo(x, 41); g.lineTo(x - 6, 34); g.closePath(); g.fill();
  }
  g.fillRect(128 - w / 2, 52, w, 1.5);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function flatQuad(material, renderOrder = 3) {
  const geo = new THREE.PlaneGeometry(2, 2);
  geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, material);
  m.frustumCulled = false; m.renderOrder = renderOrder; m.visible = false;
  m.userData.noOutline = true;
  return m;
}
const additive = (o) => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, ...o });

// ------------------------------------------------------------------ factory
export function createFishingFx(ctx) {
  const group = new THREE.Group();
  group.name = 'fishing-fx';
  const disposables = [];
  const time = { value: 0 };
  const scale = { value: 600 };

  // ---------------------------------------------------------------- spots (shared uniforms)
  const spotU = {
    uSpot: { value: Array.from({ length: MAX_SLOTS }, () => new THREE.Vector4(0, 0, 0, 0)) },
    uSpotB: { value: Array.from({ length: MAX_SLOTS }, () => new THREE.Vector4(0, 2.6, 6, 0)) },
    uTime: time, uScale: scale,
    uColA: { value: new THREE.Color(0xb2b4ec) }, uColB: { value: new THREE.Color(COL.bone) },
    uColRareA: { value: new THREE.Color(COL.rareA) }, uColRareB: { value: new THREE.Color(COL.rareB) },
    uColLegend: { value: new THREE.Color(COL.legend) }, uColLegendB: { value: new THREE.Color(COL.legendB) },
  };
  // motes
  const MOTES = 56;
  {
    const n = MAX_SLOTS * MOTES;
    const pos = new Float32Array(n * 3), slot = new Float32Array(n);
    let s = 9137;
    const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    for (let i = 0; i < n; i++) { pos[i * 3] = rnd(); pos[i * 3 + 1] = rnd(); pos[i * 3 + 2] = rnd(); slot[i] = Math.floor(i / MOTES); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSlot', new THREE.BufferAttribute(slot, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
    const mat = additive({ uniforms: spotU, vertexShader: MOTE_VS, fragmentShader: MOTE_FS });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false; pts.renderOrder = 6; pts.name = 'spot-motes';
    group.add(pts); disposables.push(geo, mat);
  }
  // shafts
  {
    const geo = quadIndexGeometry(MAX_SLOTS, (g) => {
      const slot = new Float32Array(MAX_SLOTS * 4), corner = new Float32Array(MAX_SLOTS * 8);
      for (let q = 0; q < MAX_SLOTS; q++) for (let k = 0; k < 4; k++) {
        slot[q * 4 + k] = q; corner[(q * 4 + k) * 2] = CORNERS[k][0]; corner[(q * 4 + k) * 2 + 1] = (CORNERS[k][1] + 1) / 2;
      }
      g.setAttribute('aSlot', new THREE.BufferAttribute(slot, 1));
      g.setAttribute('aCorner', new THREE.BufferAttribute(corner, 2));
    });
    const mat = additive({ uniforms: spotU, vertexShader: SHAFT_VS, fragmentShader: SHAFT_FS, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false; mesh.renderOrder = 5; mesh.name = 'spot-shafts';
    group.add(mesh); disposables.push(geo, mat);
  }
  // surface rings (3 per slot)
  {
    const nq = MAX_SLOTS * 3;
    const geo = quadIndexGeometry(nq, (g) => {
      const slot = new Float32Array(nq * 4), ring = new Float32Array(nq * 4), corner = new Float32Array(nq * 8);
      for (let q = 0; q < nq; q++) for (let k = 0; k < 4; k++) {
        slot[q * 4 + k] = Math.floor(q / 3); ring[q * 4 + k] = q % 3;
        corner[(q * 4 + k) * 2] = CORNERS[k][0]; corner[(q * 4 + k) * 2 + 1] = CORNERS[k][1];
      }
      g.setAttribute('aSlot', new THREE.BufferAttribute(slot, 1));
      g.setAttribute('aRing', new THREE.BufferAttribute(ring, 1));
      g.setAttribute('aCorner', new THREE.BufferAttribute(corner, 2));
    });
    const mat = additive({ uniforms: spotU, vertexShader: RING_VS, fragmentShader: RING_FS });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false; mesh.renderOrder = 4; mesh.name = 'spot-rings';
    group.add(mesh); disposables.push(geo, mat);
  }
  // circling fish silhouettes (3 per slot)
  {
    const nq = MAX_SLOTS * 3;
    const geo = quadIndexGeometry(nq, (g) => {
      const slot = new Float32Array(nq * 4), fish = new Float32Array(nq * 4), corner = new Float32Array(nq * 8);
      for (let q = 0; q < nq; q++) for (let k = 0; k < 4; k++) {
        slot[q * 4 + k] = Math.floor(q / 3); fish[q * 4 + k] = q % 3;
        corner[(q * 4 + k) * 2] = CORNERS[k][0]; corner[(q * 4 + k) * 2 + 1] = CORNERS[k][1];
      }
      g.setAttribute('aSlot', new THREE.BufferAttribute(slot, 1));
      g.setAttribute('aFish', new THREE.BufferAttribute(fish, 1));
      g.setAttribute('aCorner', new THREE.BufferAttribute(corner, 2));
    });
    const mat = new THREE.ShaderMaterial({
      uniforms: { ...spotU, uInk: { value: new THREE.Color(COL.ink) }, uRim: { value: new THREE.Color(0xb8c6de) } },
      vertexShader: SIL_VS, fragmentShader: SIL_FS, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false; mesh.renderOrder = 3; mesh.name = 'spot-fish';
    group.add(mesh); disposables.push(geo, mat);
  }

  // ---------------------------------------------------------------- legend pool
  const poolU = {
    uInk: { value: new THREE.Color(0x020405) }, uRing: { value: new THREE.Color(0xd8dce6) }, uGold: { value: new THREE.Color(COL.legend) },
    uR: { value: 3.2 }, uHalf: { value: 5 }, uActive: { value: 0 }, uDim: { value: 1 }, uTime: time, uAlpha: { value: 1 },
  };
  const poolMat = new THREE.ShaderMaterial({ uniforms: poolU, vertexShader: RETICLE_VS, fragmentShader: POOL_FS, transparent: true, depthWrite: false });
  const pool = flatQuad(poolMat, 2); pool.name = 'legend-pool';
  group.add(pool); disposables.push(pool.geometry, poolMat);

  // ---------------------------------------------------------------- reticle + label
  const retU = {
    uColor: { value: new THREE.Color(COL.shallow) }, uRim: { value: new THREE.Color(COL.deepRim) }, uBone: { value: new THREE.Color(COL.bone) },
    uAlpha: { value: 1 }, uTime: time, uClean: { value: 0 }, uDeep: { value: 0 }, uSpin: { value: 0 },
  };
  const retMat = additive({ uniforms: retU, vertexShader: RETICLE_VS, fragmentShader: RETICLE_FS, depthTest: false });
  const reticle = flatQuad(retMat, 8); reticle.name = 'reticle';
  group.add(reticle); disposables.push(reticle.geometry, retMat);
  const labels = {
    shallow: labelTexture('SHALLOW', COL.shallow), mid: labelTexture('MID', COL.mid), deep: labelTexture('DEEP', COL.deep),
    anchoring: labelTexture('ANCHORING', COL.anchor), blocked: labelTexture('NO OPEN WATER', COL.blocked),
  };
  Object.values(labels).forEach((t) => disposables.push(t));
  const labelMat = new THREE.SpriteMaterial({ map: labels.shallow, transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false });
  const label = new THREE.Sprite(labelMat);
  label.center.set(0.5, 1.05); label.renderOrder = 9; label.visible = false; label.name = 'reticle-label';
  group.add(label); disposables.push(labelMat);
  let labelKey = 'shallow';

  // ---------------------------------------------------------------- range ring
  const rangeU = {
    uColor: { value: new THREE.Color(COL.bone) }, uAlpha: { value: 0.5 }, uTime: time, uR: { value: 16 }, uHalf: { value: 17 },
    uAim: { value: new THREE.Vector2(0, -1) }, uDots: { value: 90 },
  };
  const rangeMat = additive({ uniforms: rangeU, vertexShader: RETICLE_VS, fragmentShader: RANGE_FS });
  const range = flatQuad(rangeMat, 4); range.name = 'range-ring';
  group.add(range); disposables.push(range.geometry, rangeMat);

  // ---------------------------------------------------------------- cast arc preview
  const arcPos = new Float32Array(ARC_DOTS * 3);
  const arcGeo = new THREE.BufferGeometry();
  const arcAttr = new THREE.BufferAttribute(arcPos, 3).setUsage(THREE.DynamicDrawUsage);
  arcGeo.setAttribute('position', arcAttr);
  { const k = new Float32Array(ARC_DOTS); for (let i = 0; i < ARC_DOTS; i++) k[i] = (i + 1) / ARC_DOTS; arcGeo.setAttribute('aK', new THREE.BufferAttribute(k, 1)); }
  arcGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  const arcU = { uColor: { value: new THREE.Color(COL.bone) }, uAlpha: { value: 0.8 }, uScale: scale, uTime: time };
  const arcMat = additive({ uniforms: arcU, vertexShader: ARC_VS, fragmentShader: ARC_FS, depthTest: false });
  const arc = new THREE.Points(arcGeo, arcMat);
  arc.frustumCulled = false; arc.renderOrder = 7; arc.visible = false; arc.name = 'cast-arc';
  group.add(arc); disposables.push(arcGeo, arcMat);

  // ---------------------------------------------------------------- pulse rings
  const pulseU = {
    uP: { value: Array.from({ length: PULSES }, () => new THREE.Vector4()) },
    uQ: { value: Array.from({ length: PULSES }, () => new THREE.Vector4()) },
    uW: { value: new Array(PULSES).fill(0.06) },
  };
  {
    const geo = quadIndexGeometry(PULSES, (g) => {
      const idx = new Float32Array(PULSES * 4), corner = new Float32Array(PULSES * 8);
      for (let q = 0; q < PULSES; q++) for (let k = 0; k < 4; k++) { idx[q * 4 + k] = q; corner[(q * 4 + k) * 2] = CORNERS[k][0]; corner[(q * 4 + k) * 2 + 1] = CORNERS[k][1]; }
      g.setAttribute('aIdx', new THREE.BufferAttribute(idx, 1));
      g.setAttribute('aCorner', new THREE.BufferAttribute(corner, 2));
    });
    const mat = additive({ uniforms: pulseU, vertexShader: PULSE_VS, fragmentShader: PULSE_FS });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false; mesh.renderOrder = 6; mesh.name = 'fishing-pulses';
    group.add(mesh); disposables.push(geo, mat);
  }
  const pulses = Array.from({ length: PULSES }, () => ({ on: false, t: 0, dur: 1, r0: 0, r1: 1, w: 0.06, a: 1, x: 0, y: 0, z: 0, col: new THREE.Color(), follow: null }));
  let pulseCursor = 0;

  // ---------------------------------------------------------------- particles
  const pPos = new Float32Array(PARTICLES * 3), pCol = new Float32Array(PARTICLES * 3), pA = new Float32Array(PARTICLES), pS = new Float32Array(PARTICLES);
  const pVel = new Float32Array(PARTICLES * 3), pLife = new Float32Array(PARTICLES), pMax = new Float32Array(PARTICLES), pGrav = new Float32Array(PARTICLES), pSize = new Float32Array(PARTICLES), pDrag = new Float32Array(PARTICLES);
  const pGeo = new THREE.BufferGeometry();
  const pPosA = new THREE.BufferAttribute(pPos, 3).setUsage(THREE.DynamicDrawUsage);
  const pColA = new THREE.BufferAttribute(pCol, 3).setUsage(THREE.DynamicDrawUsage);
  const pAA = new THREE.BufferAttribute(pA, 1).setUsage(THREE.DynamicDrawUsage);
  const pSA = new THREE.BufferAttribute(pS, 1).setUsage(THREE.DynamicDrawUsage);
  pGeo.setAttribute('position', pPosA); pGeo.setAttribute('aCol', pColA); pGeo.setAttribute('aA', pAA); pGeo.setAttribute('aS', pSA);
  pGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  const pMat = additive({ uniforms: { uScale: scale }, vertexShader: PART_VS, fragmentShader: PART_FS });
  const parts = new THREE.Points(pGeo, pMat);
  parts.frustumCulled = false; parts.renderOrder = 7; parts.name = 'fishing-particles';
  group.add(parts); disposables.push(pGeo, pMat);
  let pCursor = 0, pAlive = 0;
  const tmpCol = new THREE.Color();

  // ---------------------------------------------------------------- fish shadow
  const shU = { uInk: { value: new THREE.Color(0x010203) }, uRim: { value: new THREE.Color(0xd2dbe8) }, uAlpha: { value: 0.5 }, uWig: { value: 0 }, uRimK: { value: 0.6 } };
  const shMat = new THREE.ShaderMaterial({ uniforms: shU, vertexShader: RETICLE_VS, fragmentShader: SHADOW_FS, transparent: true, depthWrite: false });
  const shadow = flatQuad(shMat, 2); shadow.name = 'fish-shadow';
  group.add(shadow); disposables.push(shadow.geometry, shMat);

  // ---------------------------------------------------------------- API
  const H = (x, z) => { const v = ctx.water?.getHeight?.(x, z); return typeof v === 'number' && Number.isFinite(v) ? v : 0; };

  const fx = {
    group,
    MAX_SLOTS,
    setZoneColor(hex) { try { spotU.uColA.value.set(hex ?? 0xb2b4ec); } catch { /* bad colour */ } },
    setSlot(i, x, z, strength, kind, highlight = 0, radius = 2.6, height = 6) {
      if (i < 0 || i >= MAX_SLOTS) return;
      spotU.uSpot.value[i].set(x, z, Math.max(0, strength), kind);
      spotU.uSpotB.value[i].set(highlight, radius, height, H(x, z));
    },
    clearSlot(i) { if (i >= 0 && i < MAX_SLOTS) spotU.uSpot.value[i].z = 0; },
    clearSlots() { for (let i = 0; i < MAX_SLOTS; i++) spotU.uSpot.value[i].z = 0; },

    setLegendPool(visible, x = 0, z = 0, r = 3.2, active = 0, dim = 1) {
      pool.visible = !!visible;
      if (!visible) return;
      const half = r + 1.6;
      pool.position.set(x, H(x, z) + 0.13, z);
      pool.scale.set(half, 1, half);
      poolU.uR.value = r; poolU.uHalf.value = half; poolU.uActive.value = active; poolU.uDim.value = dim;
    },

    /** band: 'shallow'|'mid'|'deep'|'anchoring'|'blocked' */
    setReticle(visible, x = 0, z = 0, size = 1, band = 'shallow', clean = 0, alpha = 1, spin = 0) {
      reticle.visible = label.visible = !!visible;
      if (!visible) return;
      const y = H(x, z) + 0.06;
      reticle.position.set(x, y, z);
      reticle.scale.set(size, 1, size);
      const c = band === 'mid' ? COL.mid : band === 'deep' ? COL.deep : band === 'anchoring' ? COL.anchor : band === 'blocked' ? COL.blocked : COL.shallow;
      retU.uColor.value.set(c);
      retU.uDeep.value = band === 'deep' ? 1 : 0;
      retU.uRim.value.set(band === 'deep' ? COL.deepRim : c);
      retU.uClean.value = clean;
      retU.uAlpha.value = alpha;
      retU.uSpin.value = spin;
      if (labels[band] && band !== labelKey) { labelKey = band; labelMat.map = labels[band]; labelMat.needsUpdate = true; }
      const cam = ctx.render?.camera;
      let ox = 0, oz = 1;
      if (cam?.position) { ox = cam.position.x - x; oz = cam.position.z - z; const l = Math.hypot(ox, oz) || 1; ox /= l; oz /= l; }
      label.position.set(x + ox * size * 0.8, y + 0.05, z + oz * size * 0.8);
      const ls = size * 1.25;
      label.scale.set(ls * 2.6, ls * 0.65, 1);
      labelMat.opacity = alpha * 0.95;
    },

    setRange(visible, x = 0, z = 0, r = 16, aimX = 0, aimZ = -1, alpha = 0.5) {
      range.visible = !!visible;
      if (!visible) return;
      const half = r + 0.6;
      range.position.set(x, H(x, z) + 0.05, z);
      range.scale.set(half, 1, half);
      rangeU.uR.value = r; rangeU.uHalf.value = half; rangeU.uAlpha.value = alpha;
      // plane uv.y runs toward -z after rotateX(-PI/2): map world aim (x, z) → (x, -z)
      const l = Math.hypot(aimX, aimZ) || 1;
      rangeU.uAim.value.set(aimX / l, -aimZ / l);
      rangeU.uDots.value = Math.max(24, Math.round((Math.PI * 2 * r) / 0.75));
    },

    /** Dotted ballistic preview from `from` (rod tip) to (tx, tz) on the water. */
    setArc(visible, from = null, tx = 0, tz = 0, height = 2, colorHex = COL.bone, alpha = 0.8) {
      arc.visible = !!visible && !!from;
      if (!arc.visible) return;
      const ty = H(tx, tz) + 0.05;
      for (let i = 0; i < ARC_DOTS; i++) {
        const u = (i + 1) / ARC_DOTS;
        arcPos[i * 3] = from.x + (tx - from.x) * u;
        arcPos[i * 3 + 1] = from.y + (ty - from.y) * u + 4 * height * u * (1 - u);
        arcPos[i * 3 + 2] = from.z + (tz - from.z) * u;
      }
      arcAttr.needsUpdate = true;
      arcU.uColor.value.set(colorHex); arcU.uAlpha.value = alpha;
    },

    /** Expanding ring on the water. follow: optional {x, z} object re-read every frame. */
    pulse(x, z, { color = COL.bone, r0 = 0.2, r1 = 1.6, duration = 0.7, width = 0.06, alpha = 1, y = null, follow = null } = {}) {
      const p = pulses[pulseCursor]; pulseCursor = (pulseCursor + 1) % PULSES;
      p.on = true; p.t = 0; p.dur = Math.max(0.05, duration); p.r0 = r0; p.r1 = r1; p.w = width; p.a = alpha;
      p.x = x; p.z = z; p.y = y; p.follow = follow;
      p.col.set(color);
    },

    /** Particle burst. up: initial upward speed, spread: radial speed, gravity (m/s², negative = rise). */
    burst(x, y, z, { color = COL.bone, color2 = null, count = 12, spread = 1.5, up = 1.5, gravity = 6, size = 0.08, life = 0.8, drag = 1.2, radius = 0.1 } = {}) {
      for (let n = 0; n < count; n++) {
        const i = pCursor; pCursor = (pCursor + 1) % PARTICLES;
        const a = Math.random() * Math.PI * 2, s = spread * (0.35 + Math.random() * 0.65), rr = radius * Math.random();
        pPos[i * 3] = x + Math.cos(a) * rr; pPos[i * 3 + 1] = y; pPos[i * 3 + 2] = z + Math.sin(a) * rr;
        pVel[i * 3] = Math.cos(a) * s; pVel[i * 3 + 1] = up * (0.5 + Math.random() * 0.7); pVel[i * 3 + 2] = Math.sin(a) * s;
        pLife[i] = 0; pMax[i] = life * (0.6 + Math.random() * 0.6); pGrav[i] = gravity; pDrag[i] = drag;
        pSize[i] = size * (0.6 + Math.random() * 0.8);
        tmpCol.set(color2 && Math.random() < 0.5 ? color2 : color).multiplyScalar(2.2);
        pCol[i * 3] = tmpCol.r; pCol[i * 3 + 1] = tmpCol.g; pCol[i * 3 + 2] = tmpCol.b;
        pA[i] = 1;
      }
      pAlive = PARTICLES;
      pColA.needsUpdate = true;
    },

    setShadow(visible, x = 0, z = 0, len = 0.5, yaw = 0, alpha = 0.5, wig = 0, rim = 0.6) {
      shadow.visible = !!visible;
      if (!visible) return;
      shadow.position.set(x, H(x, z) + 0.1, z);
      shadow.rotation.y = yaw;
      shadow.scale.set(len * 0.42, 1, len * 0.62);
      shU.uAlpha.value = alpha; shU.uWig.value = wig; shU.uRimK.value = rim;
    },

    hideTransient() {
      reticle.visible = label.visible = range.visible = arc.visible = shadow.visible = false;
    },

    update(dt, t) {
      time.value = t;
      // point-size scale from the drawing buffer height and the camera fov
      const cam = ctx.render?.camera, canvas = ctx.render?.renderer?.domElement || ctx.render?.canvas;
      if (cam?.isPerspectiveCamera && canvas) {
        const hpx = canvas.height || 720;
        scale.value = hpx / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov || 50) / 2));
      }
      // pulses
      for (let i = 0; i < PULSES; i++) {
        const p = pulses[i], P = pulseU.uP.value[i], Q = pulseU.uQ.value[i];
        if (!p.on) { Q.w = 0; continue; }
        p.t += dt;
        const k = p.t / p.dur;
        if (k >= 1) { p.on = false; Q.w = 0; continue; }
        if (p.follow) { p.x = p.follow.x; p.z = p.follow.z; }
        const e = 1 - Math.pow(1 - k, 2.2);
        P.set(p.x, (p.y ?? H(p.x, p.z)) + 0.13, p.z, p.r0 + (p.r1 - p.r0) * e);
        Q.set(p.col.r, p.col.g, p.col.b, p.a * (1 - k) * (k < 0.08 ? k / 0.08 : 1));
        pulseU.uW.value[i] = p.w * (1 + k * 0.8);
      }
      // particles
      if (pAlive > 0) {
        let any = 0;
        for (let i = 0; i < PARTICLES; i++) {
          if (pA[i] <= 0) continue;
          pLife[i] += dt;
          const k = pLife[i] / pMax[i];
          if (k >= 1) { pA[i] = 0; pS[i] = 0; continue; }
          any++;
          const dr = Math.exp(-pDrag[i] * dt);
          pVel[i * 3] *= dr; pVel[i * 3 + 2] *= dr;
          pVel[i * 3 + 1] -= pGrav[i] * dt;
          pPos[i * 3] += pVel[i * 3] * dt; pPos[i * 3 + 1] += pVel[i * 3 + 1] * dt; pPos[i * 3 + 2] += pVel[i * 3 + 2] * dt;
          pA[i] = (1 - k) * (k < 0.1 ? k / 0.1 : 1);
          pS[i] = pSize[i] * (1 - 0.4 * k);
        }
        pPosA.needsUpdate = true; pAA.needsUpdate = true; pSA.needsUpdate = true;
        if (!any) pAlive = 0;
      }
    },

    dispose() {
      group.parent?.remove(group);
      for (const d of disposables) d?.dispose?.();
    },
  };
  return fx;
}
