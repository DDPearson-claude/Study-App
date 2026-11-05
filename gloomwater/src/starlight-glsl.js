// starlight-glsl.js — the shared "Starlit" sky functions (world author; DESIGN §19.1 Starlight).
// Used by the vault dome (world-fx.js domeMaterial: the cave ceiling reads as a starry night sky)
// and by the water (water-shader.js: the same stars mirrored in the lake, broken up by the chop).
// Pure functions of a unit direction, so both draw the same sky with zero extra draw calls.
//
//   slStars(d, px, t, den, tint, band)  -> rgb   up to three lattice layers of point stars;
//        d unit direction, px angular size of one pixel (radians, from fwidth), t time (twinkle),
//        den density multiplier (~0.5..2), tint the base star colour, band 0..1 milky-way weight
//        (denser fine stars inside the band). Define SL_LAYERS 1..3 before including (default 3).
//   slNebula(d, n1, n2, pink, violet) -> rgb   two soft nebula blobs (xyz direction, w strength)
//        with cloudy noise and dark dust lanes, a pink core on a violet veil (SL_NEB_CHEAP: no warp).
//   slNebMask(d, n1, n2) -> weight of the two nebula blobs at d (stars crowd in there).
//   SL_DV (vec3, default 1): per-axis weight of the star distance; < 1 stretches stars on that axis.
//   slBand(d, bandN) -> 0..1   weight of the milky-way band (a great circle with normal bandN).
export const STARLIGHT_GLSL = /* glsl */`
#ifndef SL_LAYERS
#define SL_LAYERS 3
#endif
#ifndef SL_DV
#define SL_DV vec3(1.0)
#endif
float slH(vec3 p) { p = fract(p * vec3(0.1031, 0.1030, 0.0973)); p += dot(p, p.yxz + 33.33); return fract((p.x + p.y) * p.z); }
float slN(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(slH(i), slH(i + vec3(1.0, 0.0, 0.0)), f.x), mix(slH(i + vec3(0.0, 1.0, 0.0)), slH(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(slH(i + vec3(0.0, 0.0, 1.0)), slH(i + vec3(1.0, 0.0, 1.0)), f.x), mix(slH(i + vec3(0.0, 1.0, 1.0)), slH(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}
// one layer: at most one star per lattice cell, projected onto the sky sphere; a star is never
// drawn thinner than a pixel (it widens and dims instead, so nothing shimmers or aliases)
vec3 slLayer(vec3 d, float scale, float den, float px, float seed, float t, vec3 tint) {
  vec3 p = d * scale + seed;
  vec3 id = floor(p);
  float h = slH(id);
  if (h > den) return vec3(0.0);
  vec3 q = id + 0.5 + (vec3(slH(id + 17.1), slH(id + 31.7), slH(id + 47.3)) - 0.5) * 0.7;
  vec3 sd = normalize(q - seed);
  vec3 dv = (d - sd) * SL_DV;   // SL_DV < 1 on an axis stretches the stars along it (water: vertical)
  float dd2 = dot(dv, dv);
  float hb = fract(h * 113.7);
  float r0 = 0.0005 + 0.0013 * hb * hb;
  float r = max(r0, px * 0.75);
  float s = exp(-dd2 / (r * r)) * (r0 * r0) / (r * r);
  float tw = 0.62 + 0.38 * sin(t * (0.7 + 2.8 * fract(h * 57.3)) + h * 91.0);
  float hc = fract(h * 23.9);
  vec3 c = mix(tint, vec3(1.0, 0.86, 0.62), step(0.84, hc));   // a few pale-gold stars
  c = mix(c, vec3(1.0, 0.74, 0.86), step(0.94, hc));          // fewer pink ones
  return c * (s * tw * (0.22 + 1.7 * hb * hb * hb));
}
float slBand(vec3 d, vec3 bandN) { float x = dot(d, bandN) / 0.2; return exp(-x * x); }
vec3 slStars(vec3 d, float px, float t, float den, vec3 tint, float band) {
  vec3 s = slLayer(d, 64.0, 0.2 * den, px, 3.7, t, tint);
#if SL_LAYERS > 1
  s += slLayer(d, 140.0, (0.2 + 0.35 * band) * den, px, 11.3, t, tint) * 0.8;
#endif
#if SL_LAYERS > 2
  if (band > 0.08) s += slLayer(d, 290.0, 0.45 * band * den, px, 29.9, t, tint) * 0.65;
#endif
  return s;
}
float slNebMask(vec3 d, vec4 n1, vec4 n2) {
  return pow(max(dot(d, n1.xyz), 0.0), 8.0) * n1.w + pow(max(dot(d, n2.xyz), 0.0), 14.0) * n2.w;
}
vec3 slNebula(vec3 d, vec4 n1, vec4 n2, vec3 pink, vec3 violet) {
  float m = slNebMask(d, n1, n2);
  if (m < 0.01) return vec3(0.0);
  // billowing clouds (domain-warped value noise) cut by dark dust lanes, a violet veil around a
  // pink core that brightens to a pale rose heart where the cloud is densest. SL_NEB_CHEAP (the
  // water's reflection, already broken up by ripples) skips the domain warp.
#ifdef SL_NEB_CHEAP
  vec3 w = d * 3.0;
#else
  vec3 w = d * 3.0 + vec3(slN(d * 5.0), slN(d * 5.0 + 9.2), slN(d * 5.0 + 4.4)) * 0.9;
#endif
  float n = slN(w) * 0.5 + slN(w * 2.3 + 3.1) * 0.3 + slN(w * 5.1 + 7.7) * 0.2;
  float lane = smoothstep(0.52, 0.72, slN(d * 9.0 + 11.0)) * smoothstep(0.35, 0.6, n);
  float dens = smoothstep(0.24, 0.74, n) * (1.0 - 0.7 * lane);
  float core = smoothstep(0.55, 0.9, n * (0.55 + 0.6 * min(m, 1.2)));
  vec3 c = mix(violet, pink, smoothstep(0.15, 0.55, dens * min(m * 1.4, 1.0)));
  c = mix(c, pink * vec3(1.25, 1.12, 1.15) + 0.08, core * 0.6);
  return c * (dens * m * 1.8);
}
`;
