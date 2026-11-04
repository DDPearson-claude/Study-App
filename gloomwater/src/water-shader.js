// water-shader.js — GLSL for the Gloomwater lake surface (render author; used by water.js only).
// Vertex: world-space swell from 4 sines (water.js getHeight() evaluates the identical sum).
// Fragment: ink-dark base, banded fresnel toward the mist, painterly dashed streak
// reflections of up to 6 lights, light pools with caustic shimmer, ripple rings,
// V-wakes, foam rings around obstacles & the shore, bioluminescent glints, scene fog.

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
uniform vec4 uRaft;           // x, z, radius, speed
uniform sampler2D uDepthTex;  // world.getDepth baked over the arena (0 shallow .. 1 deep)
uniform float uDepthScale;    // 1 / (2 · half-extent)
uniform float uDepthOn;
uniform float uWaveT;
uniform vec4 uWaveA[4];   // same swell as the vertex shader
uniform vec2 uWaveB[4];
varying vec3 vWorld;
varying vec3 vGradH;

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
float toon3(float x) {
  return smoothstep(0.02, 0.08, x) * 0.1 + smoothstep(0.14, 0.24, x) * 0.3 + smoothstep(0.42, 0.55, x) * 0.6;
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
#ifndef GW_LOW
  g += chopGrad(xz, uTime) * (0.25 + 0.75 * near);
#else
  g += chopGrad(xz, uTime) * near * 0.7;
#endif

  float foam = 0.0;
  float lines = 0.0;
  float shallow = 0.0;

  // ---- shore (arena rim) and the lake's depth field (shallows read lighter: read the lake)
  float dShore = uArenaR - length(xz);
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
    if (dd > (o.z + 5.0) * (o.z + 5.0)) continue;
    float d = sqrt(dd) - o.z;
    shallow = max(shallow, 1.0 - smoothstep(-0.5, 4.5, d));
    foam += edgeFoam(d, xz, float(i) * 1.37 + 2.0) * smoothstep(-1.6, -0.4, d);
  }
  // the cliffs ringing the lake mirror as a dark band along the far shore
  refl = max(refl, (1.0 - smoothstep(0.0, 9.0, dShore)) * 0.7);

  // ---- raft contact: lapping foam hugging the hull, a soft bow wave when moving
  if (uRaft.z > 0.0) {
    vec2 dv = xz - uRaft.xy;
    float d = length(dv) - uRaft.z;
    if (d < 2.5) {
      float n = wNoise(xz * 2.2 + uTime * 0.6);
      foam += (1.0 - smoothstep(-0.2, 0.35 + n * 0.4, d)) * (0.35 + 0.25 * n) * smoothstep(-1.2, -0.2, d);
      foam += (1.0 - smoothstep(0.0, 1.6, d)) * smoothstep(0.55, 0.75, n) * 0.25 * (0.4 + uRaft.w);
    }
  }

  // ---- ripple rings
  for (int i = 0; i < MAX_RIP; i++) {
    if (i >= uRipN) break;
    vec4 r = uRip[i];
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
    float w = 0.06 + age * 0.08;
    float x1 = (d - rad) / w;
    float ring1 = exp(-x1 * x1);
    float x2 = (d - rad * 0.6) / (w * 0.85);
    float ring2 = exp(-x2 * x2) * 0.5 * (1.0 - k);
    float s = min(r.w, 2.5);
    float brk = 0.65 + 0.35 * wNoise(dv * 3.0 + r.z * 7.0);
    lines += (ring1 + ring2) * fade * min(s, 1.4) * brk;
    g += (dv / max(d, 1e-3)) * (-2.0 * x1 / w * ring1) * fade * s * 0.035;
    // splash heart: a brief foam disc at the centre of strong ripples
    foam += (1.0 - smoothstep(0.0, 0.25 + 0.35 * s, d)) * max(0.0, 1.0 - age * 2.5) * clamp(s - 0.6, 0.0, 1.0);
  }

  // ---- wakes (pooled trail marks)
  float wake = 0.0;
  if (uWakeN > 0) {
    vec2 bd = xz - uWakeB.xy;
    if (dot(bd, bd) < uWakeB.z * uWakeB.z) {
      for (int i = 0; i < MAX_WAKE; i++) {
        if (i >= uWakeN) break;
        vec4 m = uWake[i];
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
        wake += (arm * armBrk * 0.6 + core * (0.35 + 0.75 * brk)) * la * fade;
        g += vec2(-dir.y, dir.x) * sign(across) * (-2.0 * xa / aw * arm) * la * fade * 0.012;
      }
    }
  }
  foam += wake * 0.85;

  vec3 N = normalize(vec3(-g.x, 1.0, -g.y));
  vec3 V = normalize(cameraPosition - P);
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  float fres = pow(1.0 - ndv, 4.0);
  float fb = softBands(fres, 4.0);

  // ---- base: ink-dark, shallows lifted, painterly blotches, banded fresnel to the mist
  vec3 base = mix(uDeep, uShallow, shallow * 0.7);
  float blot = wNoise(xz * 0.045 + vec2(uTime * 0.004, 0.0)) * 0.6 + wNoise(xz * 0.13 - uTime * 0.01) * 0.4;
  base *= 0.8 + 0.4 * blot;
  vec3 col = mix(base, uSky, clamp(0.1 + fb * 0.85, 0.0, 0.92));
  // mirrored silhouettes show where the surface reflects most (grazing, far water)
  col = mix(col, uDeep * 0.25, refl * clamp(0.18 + fb * 1.4, 0.0, 0.88));
  // painterly mist strokes: long view-perpendicular brush marks where the fresnel lifts
  vec2 vd = normalize(xz - cameraPosition.xz + vec2(1e-4));
  vec2 vp = vec2(-vd.y, vd.x);
  float stroke = wNoise(vec2(dot(xz, vp) * 0.09, dot(xz, vd) * 0.75 + uTime * 0.03));
  stroke = smoothstep(0.62, 0.82, stroke) * smoothstep(0.02, 0.25, fres) * (1.0 - smoothstep(60.0, 140.0, camD));
  col += uSky * stroke * 0.45;
  // swell crests catch the mist: thin pale ink strokes on the faces turned to the eye
  float crest = smoothstep(0.62, 0.88, wNoise(xz * vec2(0.35, 0.9) + vGradH.z * 6.0 + uTime * 0.05));
  col += uSky * crest * smoothstep(0.0, 0.25, vGradH.z + 0.08) * 0.22 * near * (1.0 - refl);

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
    pk = mix(pk, toon3(pk), 0.45);
    // optional rim: a faint warm ring marking the light's reach (the lantern's safe circle)
    float ringK = fract(lc.w);
    if (ringK > 0.001) {
      float rx = (d - R * 0.93) / (0.28 + R * 0.02);
      pk += exp(-rx * rx) * ringK * 0.65 * (0.6 + 0.4 * wNoise(xz * 1.5 + uTime * 0.4));
    }
    vec3 L = normalize(lp.xyz - P);
    float diff = 0.3 + 0.7 * max(dot(N, L), 0.0);
    pool += lc.rgb * pk * diff * 0.42;

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
      streak += lc.rgb * (floor(lc.w) * 0.01) * prof * (dash * 0.8 + core * 0.75 * dash + 0.08) * (1.0 - 0.5 * fb);
    }
  }

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
    col += mix(uGlow * 0.55, pool * 6.0 + uGlow * 0.2, clamp(pl * 4.0, 0.0, 1.0)) * gl;
  }

  // ---- foam & ink-pale lines, lit by the nearby lights
  float poolLum = clamp(dot(pool, vec3(0.2126, 0.7152, 0.0722)) * 3.0, 0.0, 1.5);
  vec3 foamCol = uFoam * (0.11 + 0.35 * poolLum) + pool * 0.8;
  float fa = clamp(foam, 0.0, 1.0);
  col = mix(col, foamCol, fa * 0.85);
  col += (uFoam * (0.09 + 0.4 * poolLum) + pool * 0.6) * clamp(lines, 0.0, 1.6);

  gl_FragColor = vec4(max(col, 0.0), 1.0);
  #include <fog_fragment>
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
