// toon.js — shared "hand-inked" material toolkit. Stateless; import directly.
// Art direction: banded toon shading, pale rim light, thick dark ink outlines,
// soft additive glows. Every visual module should build its look from here so
// the whole game reads as one illustrated world.
import * as THREE from 'three';

export const INK = 0x07080d;          // outline / silhouette ink colour
export const PALE = 0xe8f1f2;          // bone-white highlight colour

const gradientCache = new Map();
/** Stepped gradient map for MeshToonMaterial (NearestFilter = hard bands). */
export function gradientTexture(steps = 3) {
  if (gradientCache.has(steps)) return gradientCache.get(steps);
  const data = new Uint8Array(steps * 4);
  for (let i = 0; i < steps; i++) {
    // bias toward darker bands: moody, high-contrast look
    const v = Math.round(Math.pow((i + 0.35) / steps, 1.25) * 255);
    data.set([v, v, v, 255], i * 4);
  }
  const tex = new THREE.DataTexture(data, steps, 1, THREE.RGBAFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  gradientCache.set(steps, tex);
  return tex;
}

/**
 * Banded toon material with optional pale rim light.
 * opts: color, emissive, emissiveIntensity, map, steps(3), rim (0..1 strength, default 0.35),
 *       rimColor, rimPower (0.55 threshold), transparent, opacity, side, flatShading, fog(true)
 */
export function toonMaterial(opts = {}) {
  const {
    color = 0x5a6b7a, emissive = 0x000000, emissiveIntensity = 1, map = null,
    steps = 3, rim = 0.35, rimColor = PALE, rimPower = 0.55,
    transparent = false, opacity = 1, side = THREE.FrontSide, flatShading = false, fog = true,
    vertexColors = false,
  } = opts;
  const mat = new THREE.MeshToonMaterial({
    color, emissive, emissiveIntensity, map, gradientMap: gradientTexture(steps),
    transparent, opacity, side, fog, vertexColors,
  });
  mat.flatShading = flatShading;
  if (rim > 0) {
    const uniforms = {
      gwRimColor: { value: new THREE.Color(rimColor) },
      gwRimStrength: { value: rim },
      gwRimThreshold: { value: rimPower },
    };
    mat.userData.rim = uniforms;
    mat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>
uniform vec3 gwRimColor; uniform float gwRimStrength; uniform float gwRimThreshold;`)
        .replace('#include <opaque_fragment>', `{
  float gwFacing = 1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);
  float gwRim = smoothstep(gwRimThreshold, gwRimThreshold + 0.08, gwFacing);
  outgoingLight += gwRimColor * gwRim * gwRimStrength;
}
#include <opaque_fragment>`);
    };
    mat.customProgramCacheKey = () => 'gwToonRim';
  }
  return mat;
}

const outlineMatCache = new Map();
function outlineMaterial(thickness, color) {
  const key = `${thickness}|${color}`;
  if (outlineMatCache.has(key)) return outlineMatCache.get(key);
  const mat = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide, fog: true });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.gwThickness = { value: thickness };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float gwThickness;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normalize(normal) * gwThickness;');
  };
  mat.customProgramCacheKey = () => 'gwOutline';
  outlineMatCache.set(key, mat);
  return mat;
}

/**
 * Inverted-hull ink outline. Adds a child mesh to `mesh` and returns it.
 * thickness is in the mesh's local units (default 0.025). Works best on smooth geometry.
 */
export function addOutline(mesh, { thickness = 0.025, color = INK } = {}) {
  if (!mesh?.geometry) return null;
  const outline = new THREE.Mesh(mesh.geometry, outlineMaterial(thickness, color));
  outline.name = 'outline';
  outline.renderOrder = (mesh.renderOrder || 0) - 1;
  outline.castShadow = false;
  outline.receiveShadow = false;
  outline.userData.isOutline = true;
  mesh.add(outline);
  return outline;
}

/** Recursively add outlines to every mesh in a group (skips glows/outlines/transparent). */
export function outlineAll(root, opts = {}) {
  const targets = [];
  root.traverse((o) => {
    if (o.isMesh && !o.userData.isOutline && !o.userData.noOutline && !(o.material?.transparent)) targets.push(o);
  });
  targets.forEach((m) => addOutline(m, opts));
  return root;
}

/** Flat ink silhouette material (fogged) for distant background cards. */
export function silhouetteMaterial(color = INK, { transparent = false, opacity = 1, side = THREE.DoubleSide, map = null, alphaTest = 0 } = {}) {
  return new THREE.MeshBasicMaterial({ color, transparent, opacity, side, fog: true, map, alphaTest });
}

const glowTexCache = new Map();
/** Soft radial glow texture (white, alpha falloff). Cached by size+falloff. */
export function glowTexture(size = 128, falloff = 2.2) {
  const key = `${size}|${falloff}`;
  if (glowTexCache.has(key)) return glowTexCache.get(key);
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const img = g.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (x + 0.5) / size * 2 - 1, dy = (y + 0.5) / size * 2 - 1;
    const d = Math.min(1, Math.sqrt(dx * dx + dy * dy));
    const a = Math.pow(1 - d, falloff);
    const i = (y * size + x) * 4;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
    img.data[i + 3] = Math.round(a * 255);
  }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  glowTexCache.set(key, tex);
  return tex;
}

/** Additive glow sprite (bloom-friendly). */
export function glowSprite({ color = 0x9fe8ff, size = 1, opacity = 0.8, falloff = 2.2 } = {}) {
  const mat = new THREE.SpriteMaterial({
    map: glowTexture(128, falloff), color, transparent: true, opacity,
    blending: THREE.AdditiveBlending, depthWrite: false, fog: true,
  });
  const s = new THREE.Sprite(mat);
  s.scale.setScalar(size);
  s.userData.noOutline = true;
  return s;
}

/** Unlit glowing material for bioluminescent bits (eyes, spots, crystals). Pushes into bloom. */
export function glowMaterial(color = 0x9fe8ff, intensity = 2.0, { transparent = false, opacity = 1 } = {}) {
  const c = new THREE.Color(color).multiplyScalar(intensity);
  return new THREE.MeshBasicMaterial({ color: c, transparent, opacity, fog: true, toneMapped: false });
}

/** Utility: canvas texture from a draw callback (ctx2d, w, h) => void. */
export function canvasTexture(w, h, draw, { srgb = true, repeat = false } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  if (repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Cheap hash noise for procedural geometry jitter (deterministic). */
export function hash3(x, y, z) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123;
  return s - Math.floor(s);
}
