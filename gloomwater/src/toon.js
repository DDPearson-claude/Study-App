// toon.js — shared "hand-inked" material toolkit. Stateless; import directly.
// Art direction: banded toon shading, pale rim light, thick dark ink outlines,
// soft additive glows. Every visual module should build its look from here so
// the whole game reads as one illustrated world.
import * as THREE from 'three';

export const INK = 0x07080d;          // outline / silhouette ink colour
export const PALE = 0xecf0f6;          // cold moon-white highlight colour (no cyan cast)

/** The three.js layer the lake's planar reflection camera sees (water.js): set by setupSurface on what is mirrored. */
export const REFLECT_LAYER = 1;

const gradientCache = new Map();
/**
 * Banded gradient map for MeshToonMaterial (Clear Night): the bands stay flat, but there is one more of them
 * (steps + 1 tones: shadow / core / half / lit) and each edge is a narrow soft step, the shadow edge (the
 * terminator) a little wider, so a form turns like a lit thing and a band edge never stair-steps.
 */
export function gradientTexture(steps = 3) {
  if (gradientCache.has(steps)) return gradientCache.get(steps);
  const N = 128, n = steps + 1;
  const tone = [], edge = [];
  for (let i = 0; i < n; i++) tone.push(steps === 3 ? [0.068, 0.3, 0.54, 0.78][i] : Math.pow((i + 0.35) / n, 1.25));
  // band edges in N·L·0.5+0.5: the shadow edge sits past the geometric terminator, the lit band starts early
  for (let i = 1; i < n; i++) edge.push(steps === 3 ? [0.25, 0.53, 0.75][i - 1] : i / n);
  const data = new Uint8Array(N * 4);
  for (let x = 0; x < N; x++) {
    const c = (x + 0.5) / N;
    let v = tone[0];
    for (let i = 0; i < edge.length; i++) {
      const w = i === 0 ? 0.045 : 0.02;
      const k = Math.min(1, Math.max(0, (c - (edge[i] - w)) / (2 * w)));
      v += (tone[i + 1] - tone[i]) * k * k * (3 - 2 * k);
    }
    const b = Math.round(v * 255);
    data.set([b, b, b, 255], x * 4);
  }
  const tex = new THREE.DataTexture(data, N, 1, THREE.RGBAFormat);
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  gradientCache.set(steps, tex);
  return tex;
}

// ------------------------------------------------------------------ Clear Night surface shading
// Every toon material shares this: the key light's cast shadow is caught once (gwSh) so the rim and the glints can
// leave a shadow, the shadow map fades out at the edge of its box, the pale rim leans to the side the key light is
// on, wet stone and wood glint, and stone / wood carry a little procedural detail (off on the low tier).
const SURF_VERT_PARS = /* glsl */`
varying vec3 vGwW;
varying vec3 vGwObj;`;
const SURF_VERT = /* glsl */`
{
  vec4 gwWp = vec4( transformed, 1.0 );
  #ifdef USE_INSTANCING
    gwWp = instanceMatrix * gwWp;
  #endif
  vGwW = ( modelMatrix * gwWp ).xyz;
  vGwObj = position;
}`;
const SURF_FRAG_PARS = /* glsl */`
uniform vec3 gwRimColor; uniform float gwRimStrength; uniform float gwRimThreshold;
uniform vec4 gwSurf;      // x: glint strength, y: glint exponent, z: wet band top (m above the water), w: detail amount
uniform vec4 gwGrain;     // xyz: the wood's grain axis (object space), w: plank pitch across x (0 = none)
uniform vec3 gwFloor;     // the vault's glow on every surface (shared; world sets it from the mood)
uniform float gwFloorK;   // this material's share of it
varying vec3 vGwW;
varying vec3 vGwObj;
float gwSh = 1.0;         // the key light's cast shadow on this fragment (1 = lit)
float gwWet = 0.0;
float gwGlossMod = 1.0;   // the surface detail breaks the glints up (grain, grit)
#if GW_DETAIL > 0
float gwH3( vec3 p ) { p = fract( p * 0.3183099 + vec3( 0.71, 0.113, 0.419 ) ); p *= 17.0; return fract( p.x * p.y * p.z * ( p.x + p.y + p.z ) ); }
float gwN3( vec3 x ) {
  vec3 i = floor( x ); vec3 f = fract( x ); f = f * f * ( 3.0 - 2.0 * f );
  return mix( mix( mix( gwH3( i ), gwH3( i + vec3( 1, 0, 0 ) ), f.x ), mix( gwH3( i + vec3( 0, 1, 0 ) ), gwH3( i + vec3( 1, 1, 0 ) ), f.x ), f.y ),
              mix( mix( gwH3( i + vec3( 0, 0, 1 ) ), gwH3( i + vec3( 1, 0, 1 ) ), f.x ), mix( gwH3( i + vec3( 0, 1, 1 ) ), gwH3( i + vec3( 1, 1, 1 ) ), f.x ), f.y ), f.z );
}
#endif`;
// the shadow lookup the toon materials use in place of three's: the same map and bias, a 4-tap bilinear filter on
// the cheaper tier (three's own soft filter on high), and a fade to "lit" at the edge of the shadow box
const SURF_SHADOW = /* glsl */`
#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
float gwShadow( sampler2D map, DirectionalLightShadow s, vec4 c ) {
  vec3 p = c.xyz / c.w;
  vec2 e = abs( p.xy * 2.0 - 1.0 );
  float inBox = 1.0 - smoothstep( 0.84, 0.99, max( e.x, e.y ) );
  if ( inBox <= 0.0 || p.z > 1.0 ) return 1.0;
  float sh;
  #if defined( SHADOWMAP_TYPE_PCF_SOFT )
    sh = getShadow( map, s.shadowMapSize, 1.0, s.shadowBias, s.shadowRadius, c );
  #else
    float z = p.z + s.shadowBias;
    vec2 st = p.xy * s.shadowMapSize - 0.5;
    vec2 f = fract( st );
    vec2 t = 1.0 / s.shadowMapSize;
    vec2 b = ( floor( st ) + 0.5 ) * t;
    sh = mix( mix( texture2DCompare( map, b, z ), texture2DCompare( map, b + vec2( t.x, 0.0 ), z ), f.x ),
              mix( texture2DCompare( map, b + vec2( 0.0, t.y ), z ), texture2DCompare( map, b + t, z ), f.x ), f.y );
  #endif
  return mix( 1.0, sh, s.shadowIntensity * inBox );
}
#endif`;
const SHADOW_CALL = 'directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;';
const SHADOW_CALL_GW = 'gwSh = ( directLight.visible && receiveShadow ) ? gwShadow( directionalShadowMap[ i ], directionalLightShadow, vDirectionalShadowCoord[ i ] ) : 1.0; directLight.color *= gwSh;';
let lightsBegin = null;
function lightsFragmentBegin() {
  if (lightsBegin === null) {
    const src = THREE.ShaderChunk.lights_fragment_begin;
    lightsBegin = src.includes(SHADOW_CALL) ? src.replace(SHADOW_CALL, SHADOW_CALL_GW) : '#include <lights_fragment_begin>';
  }
  return lightsBegin;
}
// surface detail, written into the albedo before the lights (so it is lit, shadowed and fogged like paint would be)
const SURF_DETAIL = /* glsl */`
{
  vec3 gwNw = inverseTransformDirection( normal, viewMatrix );
  #if GW_WET > 0
    // the waterline: stone and wood standing in the lake are wet, darker and glossier for a hand's height above it
    gwWet = 1.0 - smoothstep( gwSurf.z * 0.3, gwSurf.z, vGwW.y );
    diffuseColor.rgb *= 1.0 - 0.34 * gwWet;
  #endif
  #if GW_DETAIL > 0
    float gwPx = length( fwidth( vGwObj ) );
    float gwAmt = gwSurf.w;
    #if GW_DETAIL == 1
      // stone: bedding strata, a few dark cracks, pale lichen on the faces turned to the sky
      float gwN1 = gwN3( vGwObj * 0.55 );
      float gwBed = sin( ( vGwObj.y * 1.15 + gwN1 * 1.9 + vGwObj.x * 0.07 ) * 6.2832 );
      float gwBedF = clamp( 1.6 - gwPx * 3.5, 0.0, 1.0 );
      diffuseColor.rgb *= 1.0 + ( smoothstep( -0.35, 0.35, gwBed ) - 0.5 ) * 0.26 * gwBedF * gwAmt;
      float gwCrF = clamp( 1.5 - gwPx * 26.0, 0.0, 1.0 );
      if ( gwCrF > 0.0 ) {
        float gwCr = abs( gwN3( vGwObj * vec3( 1.3, 0.55, 1.3 ) + 11.0 ) - 0.5 );
        float gwCrM = smoothstep( 0.52, 0.7, gwN3( vGwObj * 0.33 + 3.0 ) );
        diffuseColor.rgb *= 1.0 - ( 1.0 - smoothstep( 0.004, 0.02 + gwPx * 0.25, gwCr ) ) * gwCrM * 0.5 * gwCrF * gwAmt;
        float gwGr = gwN3( vGwObj * 7.0 );
        diffuseColor.rgb *= 1.0 + ( gwGr - 0.5 ) * 0.2 * clamp( 1.5 - gwPx * 12.0, 0.0, 1.0 ) * gwAmt;
        gwGlossMod = 0.55 + 0.9 * gwGr;
      }
      float gwLi = smoothstep( 0.6, 0.72, gwN3( vGwObj * 1.9 + 23.0 ) ) * smoothstep( 0.25, 0.75, gwNw.y ) * clamp( 1.5 - gwPx * 6.0, 0.0, 1.0 ) * ( 1.0 - gwWet );
      diffuseColor.rgb = mix( diffuseColor.rgb, diffuseColor.rgb * 1.5 + vec3( 0.016, 0.014, 0.026 ), gwLi * 0.55 * gwAmt );
    #elif GW_DETAIL == 2
      // wood: long grain along the timber, darker edges where planks meet, each plank its own value
      vec3 gwAx = gwGrain.xyz;
      float gwAl = dot( vGwObj, gwAx );
      vec3 gwAc = vGwObj - gwAx * gwAl;
      float gwF1 = clamp( 1.5 - gwPx * 34.0, 0.0, 1.0 );
      float gwG1 = gwN3( gwAc * 38.0 + gwAx * ( gwAl * 2.4 ) );
      float gwG2 = gwN3( gwAc * 11.0 + gwAx * ( gwAl * 0.8 ) + 5.0 );
      diffuseColor.rgb *= 1.0 + ( ( gwG1 - 0.5 ) * 0.34 * gwF1 + ( gwG2 - 0.5 ) * 0.22 * clamp( 1.5 - gwPx * 10.0, 0.0, 1.0 ) ) * gwAmt;
      gwGlossMod = mix( 1.0, 0.35 + 1.3 * gwG1, gwF1 );
      if ( gwGrain.w > 0.0 ) {
        float gwPl = vGwObj.x / gwGrain.w;   // (plank joints sit on whole pitches: the raft's six planks are centred on half pitches)
        float gwPe = abs( fract( gwPl ) - 0.5 );
        float gwUp = smoothstep( 0.5, 0.9, abs( normalize( cross( dFdx( vGwObj ), dFdy( vGwObj ) ) ).y ) );
        diffuseColor.rgb *= 1.0 - smoothstep( 0.36, 0.5, gwPe ) * 0.4 * gwUp * clamp( 1.5 - gwPx * 20.0, 0.0, 1.0 ) * gwAmt;
        diffuseColor.rgb *= 1.0 + ( gwH3( vec3( floor( gwPl ), 3.0, 7.0 ) ) - 0.5 ) * 0.16 * gwUp;
      }
    #endif
  #endif
}`;
// the rim (on the key light's side, dimmer in its shadow) and the one-step glints, added to the lit colour
const SURF_LIGHT = /* glsl */`{
  vec3 gwV = normalize( vViewPosition );
  float gwFacing = 1.0 - clamp( dot( normal, gwV ), 0.0, 1.0 );
  float gwRim = smoothstep( gwRimThreshold, gwRimThreshold + 0.08, gwFacing );
  float gwSide = 1.0;
  float gwGloss = gwSurf.x * ( 1.0 + 2.2 * gwWet ) * gwGlossMod;
  vec3 gwSpec = vec3( 0.0 );
  #if NUM_DIR_LIGHTS > 0
    vec3 gwL = directionalLights[ 0 ].direction;
    gwSide = mix( 0.3, 1.0, smoothstep( -0.2, 0.6, dot( normal, gwL ) ) ) * mix( 0.45, 1.0, gwSh );
  #endif
  #if NUM_DIR_LIGHTS > 0 && GW_SPEC > 0
    if ( gwGloss > 0.0 ) {
      float gwNH = max( dot( normal, normalize( gwL + gwV ) ), 0.0 );
      gwSpec += directionalLights[ 0 ].color * ( smoothstep( 0.45, 0.75, pow( gwNH, gwSurf.y ) ) * gwSh * step( 0.0, dot( normal, gwL ) ) );
    }
  #endif
  #if NUM_POINT_LIGHTS > 0 && GW_SPEC > 0
    if ( gwGloss > 0.0 ) {
      for ( int gwI = 0; gwI < NUM_POINT_LIGHTS; gwI ++ ) {
        vec3 gwD = pointLights[ gwI ].position + vViewPosition;
        float gwDist = length( gwD );
        float gwAtt = getDistanceAttenuation( gwDist, pointLights[ gwI ].distance, pointLights[ gwI ].decay );
        float gwNH = max( dot( normal, normalize( gwD / max( gwDist, 1e-4 ) + gwV ) ), 0.0 );
        gwSpec += pointLights[ gwI ].color * ( gwAtt * 0.45 * smoothstep( 0.45, 0.75, pow( gwNH, gwSurf.y ) ) );
      }
    }
  #endif
  outgoingLight += gwRimColor * gwRim * gwRimStrength * gwSide;
  outgoingLight += gwSpec * gwGloss * RECIPROCAL_PI;
  // the vault's glow: a violet sheen the starlit sky lays on a surface whatever its paint, a little more on faces
  // turned up and at grazing angles. It fills only what the lights left dark (a soft floor, fading out as the surface
  // gets its own light), so lit faces keep their contrast and a shadow is violet, never black: the air's old job, done by light.
  vec3 gwFl = gwFloor * ( gwFloorK * ( 0.75 + 0.25 * inverseTransformDirection( normal, viewMatrix ).y ) * ( 0.85 + 0.6 * gwFacing * gwFacing ) );
  float gwFlL = dot( gwFl, vec3( 0.2126, 0.7152, 0.0722 ) );
  outgoingLight += gwFl * ( 1.0 - smoothstep( 0.0, 4.0 * gwFlL + 1e-5, dot( outgoingLight, vec3( 0.2126, 0.7152, 0.0722 ) ) ) );
}
#include <opaque_fragment>`;

const FLOOR = { value: new THREE.Color(0, 0, 0) };
/** The vault's glow every toon surface takes (linear colour; world's key-light block sets it from the lake's mood). */
export function setToonFloor(color) { FLOOR.value.copy(color); }
const toonRegistry = new Set();
let toonLow = false;
/** The quality tier's share of the surface shading: procedural detail and the glints are compiled out on low (render calls this). */
export function setToonTier(name) {
  const low = name === 'low';
  if (low === toonLow) return;
  toonLow = low;
  for (const mat of toonRegistry) {
    const want = low ? 0 : mat.userData.gwDetail || 0, spec = low ? 0 : 1;
    if (mat.defines.GW_DETAIL !== want || mat.defines.GW_SPEC !== spec) { mat.defines.GW_DETAIL = want; mat.defines.GW_SPEC = spec; mat.needsUpdate = true; }
  }
}
const DETAIL = { none: 0, stone: 1, wood: 2 };

/**
 * Banded toon material with a pale rim light on the key light's side.
 * opts: color, emissive, emissiveIntensity, map, steps(3), rim (0..1 strength, default 0.35),
 *       rimColor, rimPower (0.55 threshold), transparent, opacity, side, flatShading, fog(true),
 *       detail ('stone' | 'wood': procedural surface detail, medium / high tiers), detailAmount (1),
 *       gloss (glint strength 0..1, default 0.06) and shine (its exponent, 64),
 *       wet (m: the height of the wet, darker, glossier band above the water; 0 = none),
 *       grain ([x, y, z] the wood's grain axis in object space, default z) and plank (plank pitch across x, m),
 *       floor (this material's share of the vault's glow, default 0.5; the world's stone takes 1)
 */
export function toonMaterial(opts = {}) {
  const {
    color = 0x5a6b7a, emissive = 0x000000, emissiveIntensity = 1, map = null,
    steps = 3, rim = 0.35, rimColor = PALE, rimPower = 0.55,
    transparent = false, opacity = 1, side = THREE.FrontSide, flatShading = false, fog = true,
    vertexColors = false,
    detail = 'none', detailAmount = 1, gloss = 0.06, shine = 64, wet = 0, grain = null, plank = 0, floor = 0.5,
  } = opts;
  const mat = new THREE.MeshToonMaterial({
    color, emissive, emissiveIntensity, map, gradientMap: gradientTexture(steps),
    transparent, opacity, side, fog, vertexColors,
  });
  mat.flatShading = flatShading;
  const uniforms = {
    gwRimColor: { value: new THREE.Color(rimColor) },
    gwRimStrength: { value: Math.max(0, rim) },
    gwRimThreshold: { value: rimPower },
    gwSurf: { value: new THREE.Vector4(gloss, shine, Math.max(0.01, wet), detailAmount) },
    gwGrain: { value: new THREE.Vector4(grain ? grain[0] : 0, grain ? grain[1] : 0, grain ? grain[2] : 1, plank) },
    gwFloor: FLOOR,
    gwFloorK: { value: floor },
  };
  mat.userData.rim = uniforms;
  mat.userData.surf = uniforms;
  mat.userData.gwDetail = DETAIL[detail] || 0;
  mat.defines = Object.assign(mat.defines || {}, { GW_DETAIL: toonLow ? 0 : mat.userData.gwDetail, GW_WET: wet > 0 ? 1 : 0, GW_SPEC: toonLow ? 0 : 1 });
  toonRegistry.add(mat);
  mat.addEventListener('dispose', () => toonRegistry.delete(mat));
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>${SURF_VERT_PARS}`)
      .replace('#include <project_vertex>', `#include <project_vertex>${SURF_VERT}`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>${SURF_FRAG_PARS}`)
      .replace('#include <shadowmap_pars_fragment>', `#include <shadowmap_pars_fragment>${SURF_SHADOW}`)
      .replace('#include <lights_toon_fragment>', `${SURF_DETAIL}\n#include <lights_toon_fragment>`)
      .replace('#include <lights_fragment_begin>', lightsFragmentBegin())
      .replace('#include <opaque_fragment>', SURF_LIGHT);
  };
  mat.customProgramCacheKey = () => 'gwToonSurf';
  return mat;
}

/**
 * Mark what a group gives the Clear Night light: its toon meshes receive (and by default cast) the key light's
 * shadow, and everything but outlines joins the lake's reflection (REFLECT_LAYER). Opt out per object with
 * userData.noReflect / userData.noCast; outlines never cast or reflect. minReflect (m): meshes and sprites smaller
 * than this (bounding radius × their own scale) stay out of the mirror — the reflection's draw calls go to what can
 * be seen in it.
 */
export function setupSurface(root, { cast = true, receive = true, reflect = true, minReflect = 0 } = {}) {
  if (!root) return root;
  root.traverse((o) => {
    if (o.userData?.isOutline || o.name === 'outline' || (typeof o.name === 'string' && o.name.endsWith(':outline'))) return;
    if (o.isLight) { o.layers.enable(REFLECT_LAYER); return; }
    const m = o.material;
    if (o.isMesh && m && m.isMeshToonMaterial) {
      o.receiveShadow = receive;
      o.castShadow = cast && !m.transparent && !o.userData.noCast;
    }
    if (reflect && !o.userData.noReflect && (o.isMesh || o.isSprite || o.isPoints || o.isLine)) {
      if (minReflect > 0) {
        let r = Infinity;
        if (o.isSprite) r = Math.max(o.scale.x, o.scale.y) * 0.5;
        else if (o.geometry) { if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); r = (o.geometry.boundingSphere?.radius ?? Infinity) * Math.max(o.scale.x, o.scale.y, o.scale.z); }
        if (r < minReflect) return;
      }
      o.layers.enable(REFLECT_LAYER);
    }
  });
  return root;
}

// Even ink lines: an inverted-hull outline is as thick as it was drawn (model units) up close, but never more than
// OUTLINE_FRAC of the picture's height, so a rock 10 m away is not ringed by a line three times a far one's width.
export const OUTLINE_FRAC = 0.0042;
const EVEN_GLSL = /* glsl */`
float gwEven( float t ) {
  #ifdef USE_INSTANCING
    vec4 gwMv = modelViewMatrix * instanceMatrix * vec4( position, 1.0 );
    float gwSc = length( modelMatrix[ 0 ].xyz ) * length( instanceMatrix[ 0 ].xyz );
  #else
    vec4 gwMv = modelViewMatrix * vec4( position, 1.0 );
    float gwSc = length( modelMatrix[ 0 ].xyz );
  #endif
  return min( t, ${(OUTLINE_FRAC * 2).toFixed(5)} * max( - gwMv.z, 0.0 ) / ( projectionMatrix[ 1 ][ 1 ] * max( gwSc, 1e-4 ) ) );
}`;
/** Patch an outline material's vertex shader (after its own onBeforeCompile ran) so the hull offset is evened. */
export function evenOutlineShader(shader) {
  if (shader.vertexShader.includes('gwEven(')) return shader;
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', `#include <common>${EVEN_GLSL}`)
    .replace(/(normalize\(\s*\w+\s*\)\s*\*\s*)(gwThickness|gwThick|uGwThick)\b/, '$1gwEven( $2 )');
  return shader;
}
/** Wrap an inverted-hull outline material built elsewhere (world-fx's outlineMat) so its line is evened. */
export function evenOutline(mat) {
  const base = mat.onBeforeCompile, key = mat.customProgramCacheKey?.() || '';
  mat.onBeforeCompile = (shader, r) => { base?.call(mat, shader, r); evenOutlineShader(shader); };
  mat.customProgramCacheKey = () => key + '|even';
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
    evenOutlineShader(shader);
  };
  mat.customProgramCacheKey = () => 'gwOutlineEven';
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
export function glowSprite({ color = 0xc6d2f0, size = 1, opacity = 0.8, falloff = 2.2 } = {}) {
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
export function glowMaterial(color = 0xc6d2f0, intensity = 2.0, { transparent = false, opacity = 1 } = {}) {
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
