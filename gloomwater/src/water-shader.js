// water-shader.js — GLSL for the Gloomwater lake surface (render author; used by water.js only).
// Vertex: world-space swell from 4 sines (water.js getHeight() evaluates the identical sum).
// Fragment: ink-dark base, banded fresnel toward the mist, painterly dashed streak
// reflections of up to 6 lights, light pools with caustic shimmer, ripple rings,
// V-wakes, foam rings around obstacles & the shore, bioluminescent glints, the vault's stars and
// nebula mirrored in the lake (starlight-glsl.js, DESIGN §19.1), scene fog.
// Clear Night (docs/v3/clarity/SPEC.md §8.2; medium / high: GW_REFL): the lake really mirrors the world. water.js renders
// the scene mirrored about the water plane into uReflTex and this shader looks it up projectively at the fragment's
// place on the flat plane, nudged by the ripple slope, under an unbanded Fresnel; the key light lays a broken glitter
// path and the lantern an amber one on the ripples, and the key light's shadow map (GW_SHADOW) lays the islands', the
// ruins' and the raft's shadows on the water. The analytic stand-ins (dark reflection bands, the dashed light streaks,
// the painted mirrored stars, the mist-coloured fresnel and its strokes) stay on the low tier only.
// v3 (DESIGN §25.6.1, §25.8.3): the six surface signs ride the ripple / wake arrays (signMark; packed by
// water-signs.js, no new uniform), and the Glowtide sparkle (uGlowtide; compiled out on low).
import { STARLIGHT_GLSL } from './starlight-glsl.js';

export const WATER_VERT = /* glsl */`
#include <common>
#include <fog_pars_vertex>
uniform float uWaveT;
uniform vec4 uWaveA[4];   // dir.x, dir.z, k, amp
uniform vec2 uWaveB[4];   // omega, phase
varying vec3 vWorld;
varying vec3 vGradH;      // dH/dx, dH/dz, H
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  float h = 0.0;
  vec2 g = vec2(0.0);
  for (int i = 0; i < 4; i++) {
    vec4 a = uWaveA[i];
    float ph = a.z * (a.x * wp.x + a.y * wp.z) + uWaveB[i].x * uWaveT + uWaveB[i].y;
    h += a.w * sin(ph);
    g += a.w * a.z * cos(ph) * a.xy;
  }
  wp.y += h;
  vWorld = wp.xyz;
  vGradH = vec3(g, h);
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

export const WATER_FRAG = /* glsl */`
#include <common>
#include <packing>
#include <fog_pars_fragment>

#ifndef MAX_RIP
#define MAX_RIP 32
#endif
#ifndef MAX_WAKE
#define MAX_WAKE 32
#endif
#ifndef MAX_OBS
#define MAX_OBS 32
#endif
#ifndef MAX_L
#define MAX_L 6
#endif
#define WAKE_LIFE 3.4

uniform float uTime;
uniform vec3 uDeep;
uniform vec3 uShallow;
uniform vec3 uFoam;
uniform vec3 uGlow;
uniform vec3 uSky;
uniform float uArenaR;
uniform vec4 uRip[MAX_RIP];
uniform int uRipN;
uniform vec4 uWake[MAX_WAKE];   // x, z, birth, strength
uniform vec2 uWakeD[MAX_WAKE];  // unit direction of travel
uniform int uWakeN;
uniform vec3 uWakeB;          // bounds: centre xz, radius
uniform vec3 uObs[MAX_OBS];   // x, z, r
uniform int uObsN;
uniform vec4 uLP[MAX_L];      // light pos xyz, pool radius
uniform vec4 uLC[MAX_L];      // light colour * strength, streak gain
uniform int uLN;
uniform vec4 uRaft;           // x, z, radius, speed (v3: a negative w is the landing's hush, 0..1, the raft at rest)
uniform sampler2D uDepthTex;  // world.getDepth baked over the arena (0 shallow .. 1 deep)
uniform float uDepthScale;    // 1 / (2 · half-extent)
uniform float uDepthOn;
uniform float uWaveT;
uniform vec4 uWaveA[4];   // same swell as the vertex shader
uniform vec2 uWaveB[4];
uniform float uStars, uStarDen, uNebK;   // starlight (water.setSky)
uniform vec3 uStarCol, uNeb, uNebV, uBandN;
uniform vec4 uNeb1, uNeb2;
#ifdef GW_V3
uniform float uGlowtide;      // v3 night sparkle 0..1 (water.setGlowtide; the term is compiled out on low)
#endif
#ifdef GW_REFL
uniform sampler2D uReflTex;   // the scene mirrored about the water plane (water.renderReflection)
uniform mat4 uReflMat;        // world → that target's uv (projective)
uniform vec3 uKeyDir;         // toward the key light (world)
uniform vec3 uKeyCol;         // its colour × intensity
uniform vec2 uMood;           // the night 0..1 and the dawn's warmth 0..1 (world's mood)
#ifdef GW_SHADOW
uniform sampler2D uShadowTex; // the key light's shadow map (packed depth)
uniform mat4 uShadowMat;
uniform vec2 uShadowP;        // 1 / map size, strength
// the key light's shadow on the flat water: five soft taps, fading out at the edge of the shadow box
float waterShadow(vec3 wp) {
  vec4 c = uShadowMat * vec4(wp, 1.0);
  vec3 p = c.xyz / c.w;
  vec2 e = abs(p.xy * 2.0 - 1.0);
  float inBox = 1.0 - smoothstep(0.84, 0.99, max(e.x, e.y));
  if (inBox <= 0.0 || p.z > 1.0) return 1.0;
  float z = p.z - 0.0012;
  vec2 t = vec2(uShadowP.x * 1.6);
  float s = step(z, unpackRGBAToDepth(texture2D(uShadowTex, p.xy)));
  s += step(z, unpackRGBAToDepth(texture2D(uShadowTex, p.xy + t * vec2(0.92, 0.38))));
  s += step(z, unpackRGBAToDepth(texture2D(uShadowTex, p.xy + t * vec2(-0.38, 0.92))));
  s += step(z, unpackRGBAToDepth(texture2D(uShadowTex, p.xy + t * vec2(-0.92, -0.38))));
  s += step(z, unpackRGBAToDepth(texture2D(uShadowTex, p.xy + t * vec2(0.38, -0.92))));
  return mix(1.0, s * 0.2, inBox * uShadowP.y);
}
#endif
#endif
varying vec3 vWorld;
varying vec3 vGradH;
#ifdef GW_LOW
#define SL_LAYERS 1
#else
#define SL_LAYERS 2
#endif
#define SL_DV vec3(1.0, 0.68, 1.0)
#define SL_NEB_CHEAP 1
${STARLIGHT_GLSL}

float wHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float wNoise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = wHash(i), b = wHash(i + vec2(1.0, 0.0));
  float c = wHash(i + vec2(0.0, 1.0)), d = wHash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float softBands(float x, float n) {
  float y = x * n; float i = floor(y); float f = y - i;
  return (i + smoothstep(0.3, 0.7, f)) / n;
}
// short wind-chop wavelets with analytic gradient (direction.xy, k, omega)
const vec4 CH0 = vec4(0.894, 0.447, 1.85, 1.35);
const vec4 CH1 = vec4(-0.600, 0.800, 2.60, 1.70);
const vec4 CH2 = vec4(0.242, -0.970, 3.40, 2.05);
const vec4 CH3 = vec4(-0.928, -0.371, 4.70, 2.40);
vec2 chopTerm(vec4 c, vec2 p, float t, float amp) {
  float ph = c.z * dot(c.xy, p) + c.w * t;
  return amp * c.z * cos(ph) * c.xy;
}
vec2 chopGrad(vec2 p, float t) {
  // domain warp breaks up the regularity so it reads as brushwork, not a grid
  vec2 q = p + vec2(wNoise(p * 0.21 + t * 0.05), wNoise(p * 0.21 - 3.7 - t * 0.04)) * 2.2;
  vec2 g = chopTerm(CH0, q, t, 0.016);
  g += chopTerm(CH1, q, t, 0.012);
  g += chopTerm(CH2, q, t, 0.009);
  g += chopTerm(CH3, q, t, 0.006);
  return g;
}
#ifndef GW_LOW
float caustic(vec2 p, float t) {
  vec2 i = p;
  float c = 1.0;
  float inten = 0.005;
  for (int n = 0; n < 3; n++) {
    float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
  }
  c /= 3.0;
  c = 1.17 - pow(c, 1.4);
  return clamp(pow(abs(c), 8.0), 0.0, 1.0);
}
#endif
// foam clinging to an edge; d = metres from the edge into open water
float edgeFoam(float d, vec2 p, float seed) {
  float n = wNoise(p * 1.4 + vec2(uTime * 0.12, seed));
  float cling = 1.0 - smoothstep(0.15, 0.55 + n * 0.6, d);
  float w = fract(d * 0.42 - uTime * 0.18 + seed * 0.37);
  float ring = smoothstep(0.0, 0.06, w) * (1.0 - smoothstep(0.06, 0.16, w));
  ring *= (1.0 - smoothstep(0.4, 3.6, d)) * smoothstep(0.32, 0.6, wNoise(p * 0.7 + seed * 3.1));
  return cling * (0.6 + 0.4 * n) + ring * 0.8;
}

// ---- v3 signs (DESIGN §25.6.1; compiled only in a v3 build: GW_V3). fishing-fx, the signs' one owner, tags its ripples with a kind
// (water.addRipple(x, z, k, {kind, size})); they ride this same uRip array with .w packed as
// 64·kind + size bucket (√length·20) + intensity (water-signs.js), so a sign costs no uniform and a plain
// ripple (.w ≤ 3) never enters here. Each kind paints the surface its own way. A sign is read from the
// sail framing 20–40 m out, where one pixel spans ~0.5 m of water along the view: every line and pin is
// widened to at least a pixel (fw: metres per pixel across it) and keeps most of its brightness, so the
// far ones read as soft strokes instead of vanishing or shimmering.
#ifdef GW_V3
float sgRing(float d, float rad, float w, float fw) {
  float ww = max(w, fw * 0.85);
  float x = (d - rad) / ww;
  return exp(-x * x) * sqrt(w / ww);
}
float signLife(float kind) {
  return kind < 1.5 ? 5.2 : kind < 2.5 ? 4.2 : kind < 3.5 ? 4.2 : kind < 4.5 ? 7.5 : kind < 5.5 ? 4.6 : 2.6;
}
// g: surface slope · foam · sLine: pale ring strokes · sDark: ink · sFlat: glassy slick (chop calmed)
// sGlow: light under the surface · sDot: bright pins (the bubble a rise leaves, fry dimples, bubbles)
void signMark(vec4 r, vec2 xz, vec2 dX, vec2 dY, inout vec2 g, inout float foam, inout float sLine,
              inout float sDark, inout float sFlat, inout float sGlow, inout float sDot) {
  float kind = floor(r.w / 64.0);
  float rem = r.w - kind * 64.0;
  float sb = floor(rem);
  float inten = min(1.0, (rem - sb) * 1.002);
  float L = sb * sb / 400.0;                 // the fish's length (m)
  float age = uTime - r.z;
  float life = signLife(kind);
  if (age < 0.0 || age > life) return;
  float Lc = min(L, 3.0);
  float reach = kind < 1.5 ? 1.3 + 2.4 * Lc
              : kind < 2.5 ? (0.7 + 1.1 * Lc) * 2.6 + 0.8
              : kind < 3.5 ? 1.6 + 0.6 * Lc
              : kind < 4.5 ? (0.8 + 0.5 * Lc) * 3.2 + 1.2
              : kind < 5.5 ? 1.16 + 0.28 * min(L, 2.0)
              : (0.6 + 0.5 * sqrt(Lc)) * 2.8;
  vec2 dv = xz - r.xy;
  float dd = dot(dv, dv);
  if (dd > reach * reach) return;
  float d = sqrt(dd);
  vec2 n = dv / max(d, 1e-3);
  float fw = abs(dot(dX, n)) + abs(dot(dY, n));        // metres per pixel across a ring here
  float fwp = sqrt(abs(dX.x * dY.y - dX.y * dY.x));    // ... and for a round pin (area)
  float k = age / life;
  float seed = fract(r.z * 7.31 + r.x * 0.137 + r.y * 0.071);

  bool rise = kind < 1.5;
  if (rise || (kind > 3.5 && kind < 4.5)) {
    // RISE: the kiss of a surface feeder: a dark dimple, a bubble that glints a while, and three rings
    // spreading slow and wide; the rings' reach follows the fish's length.
    // STRIKE: one heavy slap: white water bursting and collapsing, a heavy ring and two followers with
    // foam flecks riding the first, and a smooth darker slick that lingers where it fed.
    // (one ring-train body for both keeps the shader small: it compiles on every phone)
    float S = 0.8 + 0.5 * Lc;
    float maxR = rise ? 0.45 + 2.4 * Lc : S * 2.6;
    float amp = inten * (rise ? 0.8 + 0.2 * min(L, 2.0) : 1.25);
    float gap = rise ? 0.42 + 0.12 * Lc : 0.3;
    float w0 = rise ? 0.03 + 0.015 * Lc : 0.06 + 0.04 * S;
    float wa = rise ? 0.02 : 0.04;
    for (int j = 0; j < 3; j++) {
      float fj = float(j);
      float a = age - fj * gap;
      if (a <= 0.0) continue;
      float rad = rise ? 0.04 + maxR * (1.0 - exp(-a * 0.95)) * (1.0 - 0.17 * fj)
                       : 0.25 + maxR * (1.0 - exp(-a * (1.3 - 0.25 * fj)));
      float w = w0 + a * wa;
      float ww = max(w, fw * 0.85);
      float x = (d - rad) / ww;
      float ring = exp(-x * x) * sqrt(w / ww);
      float rf = (1.0 - k) * (1.0 - k) * smoothstep(0.0, rise ? 0.15 : 0.08, a) * (1.0 - (rise ? 0.36 : 0.38) * fj) * amp;
      float nz = wNoise(dv * (rise ? 3.0 : 2.4) + r.z * 5.0 + fj * 3.3);
      // a ring on real water is never a clean line: it catches the sky in a few long arcs and goes dark
      // between them (noise read around the circle, so the arcs keep their angles as the ring spreads),
      // with a darker trough just inside each crest
      float arcs = 0.14 + 0.86 * smoothstep(0.32, 0.66, wNoise(n * 1.45 + vec2(seed * 17.0 + fj * 5.3, fj * 3.1 + seed * 9.0)));
      sLine += ring * rf * arcs * (rise ? 0.62 + 0.25 * nz : 0.52 + 0.35 * nz);
      float xt = (d - rad + ww * 1.7) / ww;
      sDark += exp(-xt * xt) * sqrt(w / ww) * rf * (0.6 + 0.4 * arcs) * 0.26;
      g += n * (-2.0 * x / ww * ring) * rf * (rise ? 0.022 : 0.024);
      if (!rise && j == 0) foam += ring * smoothstep(0.55, 0.85, nz) * (1.0 - smoothstep(0.3, 1.6, a)) * 0.9 * inten;
    }
    if (rise) {
      sDark += (1.0 - smoothstep(0.0, 0.12 + 0.1 * Lc, d)) * (1.0 - smoothstep(0.1, 0.8, age)) * 0.55 * amp;
      float pin = max(0.035 + 0.012 * Lc, fwp * 0.75);
      sDot += (1.0 - smoothstep(pin * 0.35, pin, d)) * smoothstep(0.12, 0.35, age) * (1.0 - smoothstep(1.6, 2.8, age)) * amp;
    } else {
      float r0 = (0.35 + 0.35 * S) * (0.6 + 0.6 * smoothstep(0.0, 0.25, age));
      float burst = (1.0 - smoothstep(r0 * 0.45, r0, d)) * (1.0 - smoothstep(0.1, 1.0, age));
      foam += burst * (0.65 + 0.35 * wHash(floor(dv * 9.0) + r.z)) * inten * 1.2;
      float slickK = (1.0 - smoothstep(S * 0.9, S * 1.7, d)) * smoothstep(0.3, 1.2, age) * (1.0 - smoothstep(0.45, 1.0, k));
      sFlat = max(sFlat, slickK * inten);
      sDark += (1.0 - smoothstep(0.0, r0 * 1.4, d)) * smoothstep(0.4, 0.9, age) * (1.0 - smoothstep(1.0, 3.2, age)) * 0.35 * inten;
    }
  } else if (kind < 2.5) {
    // BOIL: a big back turns the surface. First the back itself, a long dark hump with a wet glint along
    // its spine, rolling forward as it sinks (≈ 1.5 s); it leaves an oval of dark water inside a glassy
    // slick that mirrors the stars, and a thick swell rim pushed out, brightest on the side the back
    // rolled toward, with a fainter ring running ahead. All of it grows with the fish (Prize / Trophy /
    // Elder): only a size, never a colour or a pattern, so the fish stays unknown until it is landed.
    float ang = seed * 3.14159;
    vec2 u = vec2(cos(ang), sin(ang));
    float A = 0.7 + 1.1 * Lc;
    vec2 e = vec2(dot(dv, u), dot(dv, vec2(-u.y, u.x)) / 0.62) / A;
    {
      float roll = smoothstep(0.0, 1.4, age);
      float dir = seed > 0.5 ? 1.0 : -1.0;
      vec2 bq = vec2(dot(dv, u) / A - dir * (0.35 * roll - 0.15), dot(dv, vec2(-u.y, u.x)) / A);
      float wide = 0.12 * (1.0 - 0.35 * roll);
      float along = exp(-bq.x * bq.x / 0.11);
      float back = along * exp(-bq.y * bq.y / (wide * wide));
      float backK = smoothstep(0.0, 0.15, age) * (1.0 - smoothstep(0.55, 1.5, age)) * inten;
      sDark += back * backK * 0.9;
      float fwB = fw / A;
      float sw = max(0.018, fwB * 0.85);
      float sy = (bq.y + wide * 0.35) / sw;
      sLine += exp(-sy * sy) * sqrt(0.018 / sw) * along * along * backK * 0.55;
      g += vec2(-u.y, u.x) * (-2.0 * bq.y / (wide * wide)) * back * backK * 0.012;
    }
    float ed = length(e);
    float fwE = fw / (A * 0.8);
    float grow = smoothstep(0.0, 0.45, age);
    float fade = grow * (1.0 - smoothstep(0.55, 1.0, k)) * inten;
    float rimR = 0.55 + 0.45 * grow + age * 0.2;
    float slick = 1.0 - smoothstep(rimR * 0.68, rimR * 1.06, ed);
    sFlat = max(sFlat, slick * fade);
    sDark += (1.0 - smoothstep(0.15, 0.95, ed / rimR)) * 0.7 * (1.0 - smoothstep(0.6, 3.0, age)) * grow * inten;
    float wR = 0.07 + 0.05 * grow;
    float wwR = max(wR, fwE * 0.85);
    float xr = (ed - rimR) / wwR;
    float rim = exp(-xr * xr) * sqrt(wR / wwR);
    float side = 0.55 + 0.45 * (e.x / max(ed, 1e-3)) * (seed > 0.5 ? 1.0 : -1.0);
    vec2 en = e / max(ed, 1e-3);
    float arcs = 0.16 + 0.84 * smoothstep(0.3, 0.66, wNoise(en * 1.6 + seed * 23.0));
    sLine += rim * fade * (0.35 + 0.45 * side) * arcs;
    float r2 = rimR * (1.0 + age * 0.45);
    float out2 = sgRing(ed, r2, 0.05, fwE) * fade * (1.0 - k) * 0.32 * (0.2 + 0.8 * smoothstep(0.3, 0.7, wNoise(en * 1.1 + seed * 31.0 + 4.0)));
    sLine += out2;
    g += n * ((-2.0 * xr / (wwR * A)) * rim * 0.03 + out2 * 0.02) * fade;
  } else if (kind < 3.5) {
    // NERVOUS WATER: fry skittering over a bait ball. On glassy water the patch reads as a darker,
    // ruffled blot (it stops mirroring the sky) that fizzes: bright flecks flicker all over it and tiny
    // rings pop where fry break the surface. It fades in and out so fishing-fx can renew it seamlessly.
    float R = 1.15 + 0.6 * Lc;
    float fade = smoothstep(0.0, 0.6, age) * (1.0 - smoothstep(life - 1.3, life, age)) * inten;
    float edge = R * (0.75 + 0.4 * wNoise(xz * 1.1 + seed * 9.0 + uTime * 0.15));
    float m = (1.0 - smoothstep(edge * 0.4, edge, d)) * fade;
    if (m > 0.001) {
      vec2 q = xz * 6.5;
      g += (vec2(wNoise(q + vec2(uTime * 5.0, 0.0)), wNoise(q.yx - vec2(0.0, uTime * 5.3) + 7.0)) - 0.5) * 0.3 * m;
      sDark = max(sDark, m * 0.5);     // renewed patches overlap: the blot never doubles
      // flecks: a fine grid of sparks, each flickering on its own fast clock
      vec2 fq = xz * 3.2;
      vec2 fi = floor(fq);
      float fh = wHash(fi + seed * 17.0);
      vec2 fp = vec2(wHash(fi + 5.3), wHash(fi + 1.9)) * 0.6 + 0.2;
      float fl = pow(max(0.0, sin(uTime * (7.0 + fh * 9.0) + fh * 40.0)), 4.0) * step(0.3, fh);
      float fpin = max(0.045, fwp * 0.9) * 3.2;
      sDot += (1.0 - smoothstep(fpin * 0.35, fpin, length(fract(fq) - fp))) * fl * m * 1.7;
      // fry dimples: rings popping all over the patch where fry break the surface, quick and many, so the
      // patch fizzes like a shower on one spot of the lake (each ring opens to ~0.7 m: a few pixels at 25 m)
      vec2 ci = floor(xz * 1.8);
      float h = wHash(ci + seed * 31.0);
      float ph = fract(uTime / (0.32 + h * 0.5) + h * 7.0);
      vec2 cp = (ci + 0.3 + 0.4 * vec2(wHash(ci + 3.7), wHash(ci + 9.1))) / 1.8;
      float dc = length(xz - cp);
      float act = step(0.25, h) * m;
      sLine += sgRing(dc, 0.04 + ph * 0.3, 0.025, fw * 0.8) * (1.0 - ph) * (1.0 - ph) * act * 1.9;
    }
  } else if (kind < 5.5) {
    // BUBBLES: a bottom feeder's string of bubbles; each mark is a little cluster surfacing one by one
    // over ~3 s (a blip ring as each breaks the surface, a bright pin with a dark meniscus while it sits,
    // a ring as it pops) on a faint pale fizz. fishing-fx lays a mark at the trail's head every ~2 s, so
    // two or three clusters at once read as a dotted line creeping across the water
    float C = 0.4 + 0.2 * min(L, 2.0);
    float fizz = (1.0 - smoothstep(0.0, C * 1.3, d)) * smoothstep(0.0, 0.3, age) * (1.0 - k);
    sLine += fizz * 0.1 * inten;
    for (int j = 0; j < 6; j++) {
      float fj = float(j);
      float h1 = fract(seed * 13.1 + fj * 0.618);
      float h2 = fract(seed * 7.7 + fj * 0.377 + h1 * 0.5);
      float a = age - (fj * 0.5 + h1 * 0.35);
      float bl = 0.7 + h2 * 0.7;
      if (a < 0.0 || a > bl + 0.5) continue;
      vec2 bp = r.xy + (vec2(h1, h2) - 0.5) * vec2(2.0, 1.6) * C;
      float db = length(xz - bp);
      float rb = 0.04 + 0.035 * h2;
      float pin = max(rb, fwp * 0.9);
      if (a < bl) {
        float on = smoothstep(0.0, 0.08, a) * inten;
        sDot += (1.0 - smoothstep(pin * 0.4, pin, db)) * on * (0.8 + 0.5 * sqrt(rb / pin));
        sDark += sgRing(db, pin * 1.6, pin * 0.5, 0.0) * on * 0.35;
        float ba = a / 0.35;     // the blip as it breaks the surface
        if (ba < 1.0) sLine += sgRing(db, rb + ba * 0.22, 0.02, fw * 0.8) * (1.0 - ba) * inten * 1.1;
      } else {
        float pa = (a - bl) / 0.5;
        sLine += sgRing(db, rb + pa * 0.45, 0.025, fw * 0.8) * (1.0 - pa) * inten * 1.5;
      }
    }
  } else {
    // GLOW TRAIL (night): a night fish's light seen through the moving surface, brighter for a bigger
    // fish; fishing-fx draws the fish, the water carries the glow it leaves behind. The newest mark rides
    // with the fish (water.js moves it), so it holds full strength a while before it falls behind and fades.
    float gr = 0.6 + 0.5 * sqrt(Lc);
    float gk = clamp(0.35 + 0.45 * L, 0.35, 1.3) * inten;
    float fade = smoothstep(0.0, 0.3, age) * (1.0 - smoothstep(0.3, 1.0, k));
    vec2 dw = dv + g * 0.8;
    float dd2 = dot(dw, dw);
    // a soft halo, and while the mark still rides with the fish a brighter heart: the trail's head
    sGlow += (exp(-dd2 / (gr * gr)) + exp(-dd2 / (gr * gr * 0.12)) * 0.55 * (1.0 - smoothstep(0.15, 0.4, k))) * fade * gk;
  }
}
#endif

void main() {
  vec3 P = vWorld;
  vec2 xz = P.xz;
  float camD = length(cameraPosition - P);
  float near = 1.0 - smoothstep(22.0, 95.0, camD);

  // swell slope evaluated per fragment: interpolating it across the (3 m on low) grid cells made
  // piecewise-linear normals whose banded fresnel showed as hard-edged dark polygons
  vec2 g = vec2(0.0);
  for (int i = 0; i < 4; i++) {
    vec4 a = uWaveA[i];
    float ph = a.z * (a.x * xz.x + a.y * xz.y) + uWaveB[i].x * uWaveT + uWaveB[i].y;
    g += a.w * a.z * cos(ph) * a.xy;
  }
#ifdef GW_V3
  vec2 gChop = g;
#endif
#ifndef GW_LOW
  g += chopGrad(xz, uTime) * (0.25 + 0.75 * near);
#else
  g += chopGrad(xz, uTime) * near * 0.7;
#endif
#ifdef GW_V3
  gChop = g - gChop;    // the wind chop alone: a boil's or strike's slick calms it
#endif

  float foam = 0.0;
  float lines = 0.0;
  float shallow = 0.0;
#ifdef GW_V3
  // v3 sign accumulators (signMark) and the metres-per-pixel footprint they widen their strokes by (taken
  // here, in uniform control flow: derivatives are undefined inside the divergent loops below)
  float sLine = 0.0, sDark = 0.0, sFlat = 0.0, sGlow = 0.0, sDot = 0.0;
  vec2 pxX = dFdx(xz), pxY = dFdy(xz);
  float linesG = 0.0;   // the rings the Glowtide may light: every ripple but the ones born at the hull
#endif

  // ---- shore (arena rim) and the lake's depth field (shallows read lighter: read the lake)
  float dShore = uArenaR - length(xz);
  if (uDepthOn > 0.5) {
    vec2 stc = xz * uDepthScale + 0.5;
    if (stc.x > 0.0 && stc.y > 0.0 && stc.x < 1.0 && stc.y < 1.0) dShore = texture2D(uDepthTex, stc).g * 32.0 - 16.0;
  }
  shallow = 1.0 - smoothstep(0.0, 16.0, dShore);
  float depthAt = 1.0;
  if (uDepthOn > 0.5) {
    depthAt = texture2D(uDepthTex, xz * uDepthScale + 0.5).r;
    shallow = max(shallow * 0.6, (1.0 - depthAt) * 0.85);
  }
  if (dShore < 4.0 && dShore > -2.0) foam += edgeFoam(dShore, xz, 0.0) * 0.8 * smoothstep(-2.0, -0.6, dShore);

  // ---- obstacle islands / pillars: foam rings, shallows, and inky mirror reflections
  float refl = 0.0;
  float hc = max(cameraPosition.y - P.y, 0.5);
  for (int i = 0; i < MAX_OBS; i++) {
    if (i >= uObsN) break;
    vec3 o = uObs[i];
    vec2 dv = xz - o.xy;
    float dd = dot(dv, dv);
#ifndef GW_REFL
    vec2 toC = cameraPosition.xz - o.xy;
    float D = length(toC);
    float Hh = clamp(o.z * 1.6, 2.0, 9.0);
    float L = D * Hh / (hc + Hh);
    float rr = max(o.z + 5.0, L + o.z * 1.3);
    if (dd > rr * rr) continue;
    // reflection: a dark band from the base toward the eye (the mirrored silhouette)
    vec2 cd = toC / max(D, 1e-3);
    float al = dot(dv, cd);
    if (al > -o.z && al < L + o.z) {
      float ac = dot(dv, vec2(-cd.y, cd.x)) + dot(g, vec2(-cd.y, cd.x)) * 6.0;
      float wdt = o.z * (0.85 + 0.3 * clamp(al / max(L, 1.0), 0.0, 1.0));
      float prof = 1.0 - smoothstep(wdt * 0.6, wdt * 1.05, abs(ac));
      refl = max(refl, prof * (1.0 - smoothstep(L * 0.45, L + o.z * 0.5, al)));
    }
#endif
    if (dd > (o.z + 5.0) * (o.z + 5.0)) continue;
    float d = sqrt(dd) - o.z;
    shallow = max(shallow, 1.0 - smoothstep(-0.5, 4.5, d));
    foam += edgeFoam(d, xz, float(i) * 1.37 + 2.0) * smoothstep(-1.6, -0.4, d);
  }
#ifndef GW_REFL
  // the cliffs ringing the lake mirror as a dark band along the far shore
  refl = max(refl, (1.0 - smoothstep(0.0, 9.0, dShore)) * 0.7);
#endif

  // ---- raft contact: lapping foam hugging the hull, a soft bow wave when moving
  if (uRaft.z > 0.0) {
    vec2 dv = xz - uRaft.xy;
    float d = length(dv) - uRaft.z;
    if (d < 2.5) {
      float n = wNoise(xz * 2.2 + uTime * 0.6);
      foam += (1.0 - smoothstep(-0.2, 0.35 + n * 0.4, d)) * (0.35 + 0.25 * n) * smoothstep(-1.2, -0.2, d);
      foam += (1.0 - smoothstep(0.0, 1.6, d)) * smoothstep(0.55, 0.75, n) * 0.25 * (0.4 + max(uRaft.w, 0.0));
    }
  }

  // ---- ripple rings
  for (int i = 0; i < MAX_RIP; i++) {
    if (i >= uRipN) break;
    vec4 r = uRip[i];
#ifdef GW_V3
    if (r.w >= 64.0) {
      // a sign never reaches past ~11.5 m (a 3 m fish's boil): far fragments skip it for 4 ALU
      vec2 sd = xz - r.xy;
      if (dot(sd, sd) < 132.0) signMark(r, xz, pxX, pxY, g, foam, sLine, sDark, sFlat, sGlow, sDot);
      continue;
    }
#endif
    float age = uTime - r.z;
    float life = 1.5 + r.w * 1.1;
    if (age < 0.0 || age > life) continue;
    vec2 dv = xz - r.xy;
    float sp = 1.2 + r.w * 0.9;
    float rad = 0.12 + age * sp;
    float dd = dot(dv, dv);
    if (dd > (rad + 1.0) * (rad + 1.0)) continue;
    float d = sqrt(dd);
    float k = age / life;
    float fade = (1.0 - k) * (1.0 - k) * smoothstep(0.0, 0.08, age);
#ifdef GW_V3
    // the landing's close-up (a cinematic): a plain ring near the raft fades out, so none sweeps round the Wick and its fish
    // (art rule: never a ring around the raft or the player); far water keeps its rings
    if (uRaft.w < 0.0) fade *= 1.0 + uRaft.w * (1.0 - smoothstep(5.0, 10.0, length(xz - uRaft.xy)));
#endif
    float w = 0.06 + age * 0.08;
    float x1 = (d - rad) / w;
    float ring1 = exp(-x1 * x1);
    float x2 = (d - rad * 0.6) / (w * 0.85);
    float ring2 = exp(-x2 * x2) * 0.5 * (1.0 - k);
    float s = min(r.w, 2.5);
    float brk = 0.65 + 0.35 * wNoise(dv * 3.0 + r.z * 7.0);
    lines += (ring1 + ring2) * fade * min(s, 1.4) * brk;
#ifdef GW_V3
    // paddle strokes, bumps and the anchor's plop are born at the hull: lit, they would ring the raft in light
    // (DESIGN §19.1: never a ring around the raft), so they stay unlit until the raft has left them behind
    float hullK = uRaft.z > 0.0 ? smoothstep(uRaft.z + 0.25, uRaft.z + 1.4, length(r.xy - uRaft.xy)) : 1.0;
    linesG += (ring1 + ring2) * fade * min(s, 1.4) * brk * hullK;
#endif
    g += (dv / max(d, 1e-3)) * (-2.0 * x1 / w * ring1) * fade * s * 0.035;
    // splash heart: a brief foam disc at the centre of strong ripples
    foam += (1.0 - smoothstep(0.0, 0.25 + 0.35 * s, d)) * max(0.0, 1.0 - age * 2.5) * clamp(s - 0.6, 0.0, 1.0);
  }

  // ---- wakes (pooled trail marks)
  float wake = 0.0;
#ifdef GW_V3
  float wGlow = 0.0;    // v3: a glow-tagged wake (kind 6) is light, not foam
#endif
  if (uWakeN > 0) {
    vec2 bd = xz - uWakeB.xy;
    if (dot(bd, bd) < uWakeB.z * uWakeB.z) {
      for (int i = 0; i < MAX_WAKE; i++) {
        if (i >= uWakeN) break;
        vec4 m = uWake[i];
#ifdef GW_V3
        float wk = floor(m.w * 0.25);          // v3 sign wakes: .w = 4·kind + strength (water-signs.js)
        m.w -= wk * 4.0;
#endif
        float age = uTime - m.z;
        vec2 dv = xz - m.xy;
        float spread = 0.8 + age * 1.05;
        float aw = 0.08 + age * 0.09;
        float reach = spread + aw * 2.5 + 0.6;
        if (age < 0.0 || age > WAKE_LIFE || dot(dv, dv) > reach * reach) continue;
        vec2 dir = uWakeD[i];
        float along = dot(dv, dir);
        float la = exp(-along * along * 1.4);
        if (la < 0.02) continue;
        float across = dot(dv, vec2(-dir.y, dir.x));
        float k = age / WAKE_LIFE;
        float fade = (1.0 - k) * exp(-age * 0.55) * m.w;
        float side = sign(across);
        float xa = (abs(across) - spread) / aw;
        float arm = exp(-xa * xa);
        // arms break into brush dashes as they age (world-space noise, per side); the churn dies fast
        float hr = wNoise(xz * 0.55 + vec2(side * 7.3, m.z * 0.05));
        float armBrk = mix(1.0, 0.12 + 0.88 * smoothstep(0.35, 0.6, hr), smoothstep(0.2, 1.1, age));
        float core = exp(-across * across / (0.08 + age * 0.35)) * exp(-age * 2.2);
        float brk = smoothstep(0.2, 0.75, wNoise(vec2(along * 2.1 + m.z * 9.0, across * 2.8 - age)));
#ifdef GW_V3
        // a glow trail's wake is light under the surface: no foam, no slope
        if (wk > 5.5) { wGlow += (arm * armBrk * 0.6 + core * (0.35 + 0.75 * brk)) * la * fade; continue; }
#endif
        wake += (arm * armBrk * 0.6 + core * (0.35 + 0.75 * brk)) * la * fade;
        g += vec2(-dir.y, dir.x) * sign(across) * (-2.0 * xa / aw * arm) * la * fade * 0.012;
      }
    }
  }
  foam += wake * 0.85;
#ifdef GW_V3
  sGlow += wGlow * 0.7;
  // a boil's or strike's slick calms the wind chop: glassy water that mirrors the stars
  g -= gChop * min(sFlat, 1.0) * 0.9;
#endif

  vec3 N = normalize(vec3(-g.x, 1.0, -g.y));
  vec3 V = normalize(cameraPosition - P);
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  float fres = pow(1.0 - ndv, 4.0);
  float fb = softBands(fres, 4.0);
#ifdef GW_V3
  // the landing's close-up puts the camera beside the Wick, and the banded fresnel's steps (circles round the camera's foot)
  // then ring the Wick and its fish; the landing's hush (a negative uRaft.w) smooths them away (art rule: never a ring
  // around the raft or the player)
  fb = mix(fb, fres, clamp(-uRaft.w, 0.0, 1.0));
#endif

  // ---- base: ink-dark, shallows lifted, painterly blotches
  vec3 base = mix(uDeep, uShallow, shallow * 0.7);
  float blot = wNoise(xz * 0.045 + vec2(uTime * 0.004, 0.0)) * 0.6 + wNoise(xz * 0.13 - uTime * 0.01) * 0.4;
  base *= 0.8 + 0.4 * blot;
  vec2 vd = normalize(xz - cameraPosition.xz + vec2(1e-4));
  vec2 vp = vec2(-vd.y, vd.x);
#ifdef GW_REFL
  // ---- Clear Night: deep water under a true mirror. Near the eye the water shows its own deep colour (by night the
  // lake's floor colour, so ink silhouettes still read on it); toward grazing it mirrors the world: the vault and its
  // stars, the shore, the ruins and their lit windows, the raft and its lantern, stretched and broken by the chop.
  vec3 sheen = uKeyCol * 0.03 + uFoam * dot(uSky, vec3(0.2126, 0.7152, 0.0722)) * 0.35;
#ifdef GW_SHADOW
  float wsh = waterShadow(vec3(xz.x, 0.0, xz.y));
#else
  float wsh = 1.0;
#endif
  // (a breath of the air's colour keeps the deepest water off black; the dawn lays its pale mist on the lake)
  vec3 body = mix(base, uSky * 0.72, 0.07 + 0.15 * uMood.x + 0.3 * uMood.y) * mix(0.72, 1.0, wsh);
#ifdef USE_FOG
  #ifdef FOG_EXP2
  float fogF = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
  #else
  float fogF = smoothstep(fogNear, fogFar, vFogDepth);
  #endif
  body = mix(body, fogColor, fogF);     // the thin scene air lies on the water's own colour; the mirror image carries its own
#endif
  float F = clamp(1.5 * (0.03 + 0.97 * pow(1.0 - ndv, 5.0)) + 0.03, 0.0, 0.9);
  vec4 rc = uReflMat * vec4(xz.x, 0.0, xz.y, 1.0);
  vec2 ruv = rc.xy / max(rc.w, 1e-4);
  // the ripple slope across / along the view nudges the lookup, taller than wide (reflections smear down the water);
  // a second tap rides the fine ripples, so near water breaks its mirror image into strokes and far water stays a mirror
  vec2 fq = xz * 3.1;
  float fineK = clamp(1.5 - (fwidth(xz.x) + fwidth(xz.y)) * 11.0, 0.0, 1.0);
  vec2 gFine = (vec2(wNoise(fq + vec2(uTime * 0.6, -uTime * 0.45)), wNoise(fq.yx + vec2(17.3 - uTime * 0.5, uTime * 0.7))) - 0.5) * (0.3 * fineK);
  vec2 nv = vec2(dot(N.xz, vp), dot(N.xz, vd));
  vec2 nf = nv - vec2(dot(gFine, vp), dot(gFine, vd)) * 0.5;
  float rk = 0.062 * clamp(20.0 / camD, 0.25, 2.2);
  vec3 rcol = texture2D(uReflTex, clamp(ruv + nv * vec2(1.0, -2.2) * rk, 0.002, 0.998)).rgb;
  rcol = mix(rcol, texture2D(uReflTex, clamp(ruv + nf * vec2(1.3, -3.0) * rk, 0.002, 0.998)).rgb, 0.5);
  rcol = min(rcol, vec3(1.1));          // a glow's mirror image is a glow, not a hot sheet on the water
  float reflK = F * (1.0 - 0.8 * clamp(foam, 0.0, 1.0));
#ifdef GW_V3
  // where a fish turned, rose or struck the water is stirred and stops mirroring: a sign is a dark break in the mirror
  reflK *= 1.0 - 0.8 * clamp(sDark, 0.0, 1.0);
#endif
  // (at night the mirror is held back a little and the body carries the lake's floor colour: the near water stays the
  // tone it was, light enough under a dark canopy and never a bright sheet under a bright vault)
  vec3 col = mix(body, rcol * (0.86 - 0.2 * uMood.x), reflK) * mix(0.93, 1.0, wsh);
  // glitter: the fine ripples' own normal, and a sparse drifting mask of the facets that happen to face the eye, so a
  // highlight is always a scatter of small sparks strung toward its light, never a sheet, a blob or a ring
  vec3 Ng = normalize(vec3(N.x - gFine.x * 1.5, N.y, N.z - gFine.y * 1.5));
  float spark = smoothstep(0.6, 0.78, wNoise(xz * 5.3 + vec2(uTime * 1.1, -uTime * 0.8)) * (0.55 + 0.9 * wNoise(xz * 1.3 - vec2(uTime * 0.2, 0.0) + 9.0))) * fineK;
  // (up close a facet is finer than that: a second, finer mask where the pixels can resolve it, so a close-up shows sparks, not flakes)
  float fine2 = clamp(1.5 - (fwidth(xz.x) + fwidth(xz.y)) * 45.0, 0.0, 1.0);
  spark *= mix(1.0, smoothstep(0.5, 0.72, wNoise(xz * 17.0 + vec2(-uTime * 1.7, uTime * 1.3))) * 1.5, fine2);
  // swell crests catch the key light: thin pale strokes on the faces turned to the eye (never in cast shadow)
  float crest = smoothstep(0.62, 0.88, wNoise(xz * vec2(0.35, 0.9) + vGradH.z * 6.0 + uTime * 0.05));
  col += sheen * crest * smoothstep(0.0, 0.25, vGradH.z + 0.08) * 0.22 * near * wsh;
  // the key light's glitter: the ripples that mirror it into the eye, cut hard, gone in cast shadow and under foam
  {
    float sk = pow(max(dot(reflect(-uKeyDir, Ng), V), 0.0), 40.0);
    col += uKeyCol * (smoothstep(0.25, 0.8, sk) * spark * wsh * (1.0 - clamp(foam, 0.0, 1.0)) * (0.3 - 0.1 * uMood.x));
  }
#else
  // banded fresnel toward the mist (the low tier's analytic water)
  // the surface mirrors a night sky: lavender haze (= the fog colour, so far water melts into it)
  // near the horizon, deepening toward the zenith, so the near water reads deep and the stars show
  float skyUp = smoothstep(0.12, 0.75, reflect(-V, N).y);
  vec3 skyC = uSky * mix(1.0, 0.42, skyUp);
  vec3 col = mix(base, skyC, clamp(0.1 + fb * 0.85, 0.0, 0.92));
  // mirrored silhouettes show where the surface reflects most (grazing, far water)
  col = mix(col, uDeep * 0.25, refl * clamp(0.18 + fb * 1.4, 0.0, 0.88));
  // painterly mist strokes: long view-perpendicular brush marks where the fresnel lifts
  float stroke = wNoise(vec2(dot(xz, vp) * 0.09, dot(xz, vd) * 0.75 + uTime * 0.03));
  stroke = smoothstep(0.62, 0.82, stroke) * smoothstep(0.02, 0.25, fres) * (1.0 - smoothstep(60.0, 140.0, camD));
  // sheen: the mist colour lifted toward the lake's foam (silver on slate, ice on indigo), scaled by
  // the mist's own brightness so night water stays ink
  vec3 sheen = mix(uSky, uFoam * dot(uSky, vec3(0.2126, 0.7152, 0.0722)) * 2.6, 0.4);
  col += sheen * stroke * 0.5;
  // swell crests catch the mist: thin pale ink strokes on the faces turned to the eye
  float crest = smoothstep(0.62, 0.88, wNoise(xz * vec2(0.35, 0.9) + vGradH.z * 6.0 + uTime * 0.05));
  col += sheen * crest * smoothstep(0.0, 0.25, vGradH.z + 0.08) * 0.26 * near * (1.0 - refl);
#endif
#ifdef GW_V3
  col += sheen * min(sFlat, 1.0) * 0.07;     // a slick takes a faint silver sheen
#endif

  // ---- lights: warm pools and dashed vertical streaks
  vec3 pool = vec3(0.0);
  vec3 streak = vec3(0.0);
  for (int i = 0; i < MAX_L; i++) {
    if (i >= uLN) break;
    vec4 lp = uLP[i];
    vec4 lc = uLC[i];
    vec2 dv = xz - lp.xz;
    float d2 = dot(dv, dv);
    float h = max(lp.y - P.y, 0.35);
    float R = max(lp.w, 0.5);
    float d = sqrt(d2);
    float att = (h * h) / (d2 + h * h);
    att *= sqrt(att);
    float cut = 1.0 - smoothstep(R * 0.45, R, d);
    float pk = att * cut + cut * 0.035;
    // no reach ring and no band: a light's pool fades smoothly out to where its reach ends (DESIGN §19.1). The old cel
    // banding (a 3-step toon on the pool) drew concentric rings round the raft's lights, which the landing's close-up and
    // the Wick's flare turned into a ring round the player (art rule: never a ring around the raft or the player)
    vec3 L = normalize(lp.xyz - P);
    float diff = 0.3 + 0.7 * max(dot(N, L), 0.0);
    // warm lights lean gold on the water: amber laid over cold blue water otherwise drifts to
    // copper/rose, so the lantern pool would not match the HUD lantern amber
    vec3 lcol = lc.rgb;
    float warmth = clamp((lcol.r - lcol.b) / max(lcol.r, 1e-4) * 1.6 - 0.6, 0.0, 1.0);
    lcol *= mix(vec3(1.0), vec3(0.9, 1.14, 0.7), warmth);
#ifdef GW_REFL
    pool += lcol * pk * diff * 0.5;     // (a little more than the analytic water's: the lens no longer veils the pool in bloom)
#else
    pool += lcol * pk * diff * 0.42;
#endif

#ifdef GW_REFL
    // the light's own glitter on the ripples (its true image is in the mirror): warm sparks strung from under the
    // light toward the eye, only within its reach
    {
      float sl = pow(max(dot(reflect(-L, Ng), V), 0.0), 36.0);
      streak += lcol * (floor(lc.w) * 0.01) * smoothstep(0.3, 0.8, sl) * spark * (1.0 - smoothstep(R * 0.45, R * 1.0, d)) * 1.3;
    }
#else
    // streak: the mirror point sits between the light's foot and the eye
    vec2 toCam = cameraPosition.xz - lp.xz;
    float cd = max(length(toCam), 0.001);
    vec2 sdir = toCam / cd;
    vec2 sperp = vec2(-sdir.y, sdir.x);
    float along = dot(dv, sdir);
    float hc = max(cameraPosition.y - P.y, 0.5);
    float hl = max(lp.y, 0.2);
    float c0 = cd * hl / (hc + hl);
    float halfLen = 1.2 + c0 * 0.85 + hl * 0.5;
    float s = (along - c0) / halfLen;
    if (abs(s) < 1.0) {
      float across = dot(dv, sperp) + dot(N.xz, sperp) * (1.2 + 0.05 * cd);
      float w = 0.13 + 0.016 * cd + 0.12 * abs(s);
      float prof = exp(-across * across / (w * w)) * (1.0 - s * s);
      float dash = wNoise(vec2(along * 3.3 - uTime * 1.1 + float(i) * 17.0, across * 1.1 + uTime * 0.3));
      dash = smoothstep(0.34, 0.6, dash);
      float core = exp(-across * across / (w * w * 0.15));
      streak += lcol * (floor(lc.w) * 0.01) * prof * (dash * 0.8 + core * 0.75 * dash + 0.08) * (1.0 - 0.5 * fb);
    }
#endif
  }

  // ---- warm light owns the water it touches: inside a light pool the lake's cold cast drains
  // to grey before the pool is added, so the lantern reads amber on slate/indigo water
  // (amber + blue would otherwise mix to rose)
  float poolK = clamp(dot(pool, vec3(0.2126, 0.7152, 0.0722)) * 20.0, 0.0, 0.92);
  col = mix(col, vec3(dot(col, vec3(0.2126, 0.7152, 0.0722))) * vec3(1.1, 1.0, 0.72), poolK);

  // ---- starlight: the vault's stars (and its nebula) mirrored in the lake. The lookup mirrors the
  // view in a nearly flat surface (a mirror keeps the stars round and lets them glide with the
  // camera like real reflections); the swell and chop only nudge them a few pixels and a drifting
  // ripple noise breaks them up and makes them flicker. They fade under the lantern's pool, behind
  // mirrored silhouettes and in foam, are strongest toward grazing water (fresnel), and the scene
  // fog takes the far ones.
#ifndef GW_REFL
  vec3 Ns = normalize(vec3(-g.x * 0.035, 1.0, -g.y * 0.035));   // a gentle nudge: more and the chop smears each star into a streak
  vec3 Rs = reflect(-V, Ns);
  float spx = length(fwidth(reflect(-V, vec3(0.0, 1.0, 0.0)))) * 1.25;
  if (uStars > 0.001 || uNebK > 0.001) {
    float starVis = (1.0 - poolK) * (1.0 - refl * 0.85) * (1.0 - clamp(foam + wake, 0.0, 1.0)) * smoothstep(0.0, 0.06, Rs.y);
    float mirror = 0.45 + 0.55 * clamp(fb * 1.8, 0.0, 1.0);
    float rip = wNoise(xz * 1.7 + vec2(uTime * 0.35, -uTime * 0.27)) * wNoise(xz * 0.6 - vec2(uTime * 0.12, 0.0) + 5.0);
    float brk = smoothstep(0.06, 0.32, rip);
    vec3 skyR = slStars(Rs, spx, uTime, uStarDen * 0.6, uStarCol, slBand(Rs, uBandN)) * (uStars * 1.25 * brk);
#ifndef GW_LOW
    // the nebula sits low in the sky, so only the far (grazing) water mirrors it
    float lowSky = 1.0 - smoothstep(0.12, 0.42, Rs.y);
    if (lowSky > 0.01) skyR += slNebula(Rs, uNeb1, uNeb2, uNeb, uNebV) * (uNebK * 0.6 * lowSky);
#endif
    // (Clear Night: a trace, and only where water mirrors at all: the grazing, far water; no snow over the near lake)
    col += skyR * starVis * mirror * (0.4 * smoothstep(0.55, 0.85, 1.0 - ndv));
  }
#endif

  // ---- caustic shimmer (bioluminescent everywhere faintly, golden inside light pools)
#ifndef GW_LOW
  float caus = caustic(xz * 0.32, uTime * 0.55);
  col += uGlow * caus * (0.006 + 0.02 * shallow) * near;
  col += pool * (0.55 + 0.9 * caus);
#else
  col += pool * 0.7;
#endif
  col += streak;

  // ---- glints: sparse twinkling motes of living light on the surface
  vec2 gc = xz * 0.7;
  vec2 gi = floor(gc);
  float gr = wHash(gi + 7.0);
  if (gr > 0.9 && near > 0.0) {
    vec2 gp = vec2(wHash(gi + 1.3), wHash(gi + 4.1)) * 0.7 + 0.15;
    float gd = length(fract(gc) - gp);
    float tw = pow(max(0.0, sin(uTime * (0.5 + gr * 1.5) + gr * 40.0)), 8.0);
    float gl = (1.0 - smoothstep(0.0, 0.06, gd)) * tw * near * 1.6;
    float pl = dot(pool, vec3(0.333));
    vec3 gcol = mix(uStarCol, uGlow, 0.35) * 0.55;   // star-like glints (never a Cinder's amber)
    col += mix(gcol, pool * 6.0 + uGlow * 0.2, clamp(pl * 4.0, 0.0, 1.0)) * gl;
  }

  // ---- foam & ink-pale lines, lit by the nearby lights
  float poolLum = clamp(dot(pool, vec3(0.2126, 0.7152, 0.0722)) * 3.0, 0.0, 1.5);
  vec3 foamCol = uFoam * (0.11 + 0.35 * poolLum) + pool * 0.8;
  float fa = clamp(foam, 0.0, 1.0);
  col = mix(col, foamCol, fa * 0.85);
#ifdef GW_REFL
  // (on the mirror the rings and strokes have a brighter water to stand on: they carry more light to read as they did)
  const float STROKE = 1.5;
#else
  const float STROKE = 1.0;
#endif
  col += (uFoam * (0.09 + 0.4 * poolLum) + pool * 0.6) * clamp(lines, 0.0, 1.6) * STROKE;

#ifdef GW_V3
  // ---- v3 signs: ink where a fish turned, rose or struck (over everything the surface shows, so it
  // reads as dark water even under mist strokes and starlight), then pale starlit strokes, glinting pins
  // and the light a night fish leaves under the surface
  col = mix(col, uDeep * 0.22, clamp(sDark, 0.0, 0.75));
  // strokes take the sky's sheen too, so they hold their contrast on the bright calm water and stay ink-soft at night
  col += (uFoam * (0.2 + 0.45 * poolLum) + pool * 0.6 + sheen * 0.38) * clamp(sLine, 0.0, 1.8) * (STROKE * 1.15);
  col += mix(uStarCol, uFoam, 0.4) * clamp(sDot, 0.0, 1.5) * 0.9;
  col += mix(uStarCol, uGlow, 0.75) * clamp(sGlow, 0.0, 2.0) * 0.4;
#ifndef GW_LOW
  // ---- Glowtide (v3, DESIGN §25.8.3): at night whatever stirs the water sparkles: the raft's wake, a
  // hooked fish's thrash, the bobber's rings, every sign. Pale starlight and the lake's glow, a few pale
  // gold, never a ring of its own: it only lives where ripples and wakes already are. Off on low.
  if (uGlowtide > 0.001) {
    float gE = clamp(linesG * 0.7 + wake * 1.3 + sLine * 0.6 + sGlow * 0.3 + sDot * 0.3, 0.0, 1.6) * uGlowtide;
    if (gE > 0.002) {
      vec2 gq = xz * 3.6;
      vec2 gci = floor(gq);
      float gh = wHash(gci + 17.3);
      vec2 gpp = vec2(wHash(gci + 2.9), wHash(gci + 6.1)) * 0.6 + 0.2;
      float gpin = max(0.1, sqrt(abs(pxX.x * pxY.y - pxX.y * pxY.x)) * 3.6 * 0.6);
      float gtw = 0.5 + 0.5 * sin(uTime * (2.5 + gh * 6.0) + gh * 50.0);
      float glint = (1.0 - smoothstep(gpin * 0.3, gpin, length(fract(gq) - gpp))) * gtw * gtw * gtw * step(0.35, gh);
      float shim = smoothstep(0.6, 0.92, wNoise(xz * 2.6 + vec2(uTime * 0.9, -uTime * 0.7)));
      vec3 gcol = mix(uStarCol, uGlow, 0.45);
      // the stirred water itself breathes a faint living light, the glints ride on it
      col += gcol * (0.1 + shim * 0.35) * gE;
      col += mix(gcol, vec3(0.95, 0.8, 0.52), step(0.86, gh)) * glint * 2.2 * gE;
    }
  }
#endif
#endif

  gl_FragColor = vec4(max(col, 0.0), 1.0);
#ifndef GW_REFL
  #include <fog_fragment>
#endif
}
`;

export const SPLASH_VERT = /* glsl */`
#include <common>
#include <fog_pars_vertex>
attribute float aSize;
attribute float aAlpha;
attribute vec3 aColor;
uniform float uViewH;
varying float vAlpha;
varying vec3 vColor;
void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  float sz = aSize * projectionMatrix[1][1] * uViewH * 0.5 / max(-mvPosition.z, 0.1);
  gl_PointSize = clamp(sz, 0.0, 64.0);
  vAlpha = aAlpha * smoothstep(0.0, 1.5, sz);
  vColor = aColor;
  #include <fog_vertex>
}
`;

export const SPLASH_FRAG = /* glsl */`
#include <common>
#include <fog_pars_fragment>
varying float vAlpha;
varying vec3 vColor;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = (1.0 - smoothstep(0.22, 0.5, d)) * vAlpha;
  if (a < 0.01) discard;
  // a bright pin of light in each droplet's core
  vec3 col = vColor * (0.8 + 0.8 * (1.0 - smoothstep(0.0, 0.22, d)));
  gl_FragColor = vec4(col, a);
  #include <fog_fragment>
}
`;
