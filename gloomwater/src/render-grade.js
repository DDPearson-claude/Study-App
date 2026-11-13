// render-grade.js — the "Clear Night" colour grade (render author; DESIGN §19.1 "The lens").
// Operates on the linear HDR buffer after bloom and is the chain's last pass: it draws to the
// screen, so its two closing includes apply the renderer's tone mapping (ACES at the frame's
// exposure) and the sRGB encode (no separate OutputPass: one full-screen pass and one HDR
// target write fewer on every tier). Order: chromatic fringe (hits and danger only: 0 at rest) →
// clamped sharpen → saturation → split-tone (shadows → zone tint, highlights → warm) →
// tinted ink floor (a toe) → contrast around the scene's middle → vignette → danger edge →
// full-screen flash → dither grain → tone mapping → sRGB.
// The lens is clean at rest: no fringe, no paper (GW_PAPER stays for the audit tools, compiled
// out on every tier), grain only as a dither against banding in the night sky.
import * as THREE from 'three';

export const GradeShader = {
  name: 'GloomwaterGrade',
  defines: { GW_PAPER: 0, GW_FRINGE: 1, GW_SHARPEN: 1 },
  uniforms: {
    tDiffuse: { value: null },
    uRes: { value: new THREE.Vector2(1280, 720) },
    uTime: { value: 0 },
    uSharpen: { value: 0.3 },
    uSaturation: { value: 0.9 },
    uContrast: { value: 1.08 },
    uTint: { value: new THREE.Color(0x40347e) },
    uTintAmount: { value: 0.18 },
    uWarm: { value: new THREE.Color(0xf4cc96) },
    uWarmAmount: { value: 0.12 },
    uLift: { value: 0.3 },
    uVignette: { value: 0.24 },
    uFringe: { value: 0 },
    uPaper: { value: 0 },
    uGrain: { value: 0.012 },
    uFlashColor: { value: new THREE.Color(0xffffff) },
    uFlash: { value: 0 },
    uDanger: { value: 0 },
    uDangerColor: { value: new THREE.Color(0x5a0a14) },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform vec2 uRes;
    uniform float uTime;
    uniform float uSaturation, uContrast, uTintAmount, uWarmAmount, uLift;
    uniform float uVignette, uFringe, uPaper, uGrain, uFlash, uDanger, uSharpen;
    uniform vec3 uTint, uWarm, uFlashColor, uDangerColor;
    varying vec2 vUv;

    const float GW_PIVOT = 0.07;   // the contrast curve's pivot (scene-linear)
    float gwLum(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
    float gwHash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }
    float gwNoise(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      float a = gwHash(i), b = gwHash(i + vec2(1.0, 0.0));
      float c = gwHash(i + vec2(0.0, 1.0)), d = gwHash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    void main() {
      vec2 uv = vUv;
      vec2 cc = uv - 0.5;
      float aspect = uRes.x / max(uRes.y, 1.0);
      // radial distance: 0 centre, ~1 at the corners, aspect-aware but bounded on portrait
      vec2 ca = cc * vec2(min(aspect, 1.8), 1.0) / vec2(0.5 * min(aspect, 1.8), 0.5);
      float r = length(ca) * 0.7071;

      vec3 c0 = texture2D(tDiffuse, uv).rgb;
      vec3 col = c0;
      #if GW_FRINGE
        // chromatic fringe: a hit / danger effect only (uFringe is 0 at rest, so the resting frame pays no taps)
        if (uFringe > 0.003) {
          vec2 off = cc * (r * r) * uFringe * 0.014;
          col.r = texture2D(tDiffuse, uv + off).r;
          col.b = texture2D(tDiffuse, uv - off * 1.2).b;
        }
      #endif
      #if GW_SHARPEN
        // clamped sharpen on the bloomed HDR input, before the grade and the grain: the centre is pushed away from the mean
        // of its cross and then held inside the cross's own range, so edges steepen (MSAA and bloom softening is paid back)
        // and nothing can ring or halo, even round an HDR-hot pixel. A local extremum (a star, a one-pixel line) is left as
        // it is; flat areas have nothing to push.
        vec2 tx = 1.0 / vec2(textureSize(tDiffuse, 0));   // the buffer's own texels (WebGL2), exact at any pixel ratio
        vec3 sN = texture2D(tDiffuse, uv + vec2(0.0, tx.y)).rgb, sS = texture2D(tDiffuse, uv - vec2(0.0, tx.y)).rgb;
        vec3 sE = texture2D(tDiffuse, uv + vec2(tx.x, 0.0)).rgb, sW = texture2D(tDiffuse, uv - vec2(tx.x, 0.0)).rgb;
        vec3 lo = min(c0, min(min(sN, sS), min(sE, sW))), hi5 = max(c0, max(max(sN, sS), max(sE, sW)));
        vec3 sharp = clamp(c0 + (c0 - (sN + sS + sE + sW) * 0.25) * (2.2 * uSharpen), lo, hi5);
        col += sharp - c0;
      #endif
      col = max(col, 0.0);

      // saturation
      float l = gwLum(col);
      col = max(mix(vec3(l), col, uSaturation), 0.0);

      // split tone in perceptual space
      float pl = sqrt(l);
      float sh = 1.0 - smoothstep(0.02, 0.42, pl);
      // warm light owns its pixels: the cold shadow tint stays off clearly warm pixels (the lantern
      // pool's dim rings, embers, Cinders), so amber does not muddy to rose on slate/indigo lakes
      float warmPx = clamp((col.r - col.b) / max(col.r, 1e-4) * 1.4 - 0.4, 0.0, 1.0) * smoothstep(0.0, 0.02, col.r);
      sh *= 1.0 - 0.75 * warmPx;
      float hi = smoothstep(0.38, 0.95, pl);
      vec3 tintN = uTint / max(gwLum(uTint), 1e-4);
      vec3 warmN = uWarm / max(gwLum(uWarm), 1e-4);
      col = mix(col, l * tintN, clamp(sh * uTintAmount * 1.6, 0.0, 1.0));
      col = mix(col, l * warmN, clamp(hi * uWarmAmount, 0.0, 1.0));
      // tinted ink floor: the deepest blacks sit at the zone's ink-violet, never dead black. With the fog veil gone nothing
      // else holds them up (ACES' toe crushes scene values under ~0.002 to 0, and a silhouette that is pure black loses its
      // shape on dark water). A floor, not a veil: black rises to fl, anything at 2·fl or above is untouched (the curve is
      // fl + l²/4fl below that: monotonic, C1), so the frame's dark tones and mid-tones stay where the light put them.
      float fl = uLift * 0.022;
      float toe = max(0.0, 1.0 - l / max(2.0 * fl, 1e-5));
      col += mix(vec3(1.0), tintN, 0.7) * (fl * toe * toe) * (1.0 - 0.75 * warmPx);

      // a gentle contrast curve around the scene's own middle (this game's median sits near scene-linear 0.03-0.06, far under
      // photographic mid grey): lit faces and reflections rise, shadows deepen, and the frame's median stays where it was
      col = pow(col / GW_PIVOT + 1e-6, vec3(uContrast)) * GW_PIVOT;

      // vignette (ink-tinted)
      float vig = smoothstep(0.32, 1.05, r);
      float vk = clamp(vig * uVignette * 1.55, 0.0, 0.97);
      col = mix(col, col * 0.08 + uTint * 0.0012, vk);

      // danger: a slow dark-crimson ink bleeding in from the edges
      float de = smoothstep(0.38, 1.0, r + (gwNoise(uv * 6.0 + uTime * 0.15) - 0.5) * 0.12);
      col = mix(col, uDangerColor * 0.05, clamp(uDanger * de, 0.0, 0.9));

      // full-screen flash (mix, so a black flash is a fade). A light flash mixes in a perceptual
      // (square-root) space: a linear mix of even 10% white lifts night ink to mid grey and flattens
      // the whole frame, while this keeps the darks dark and the frame's contrast intact.
      float fk = clamp(uFlash, 0.0, 1.0);
      if (gwLum(uFlashColor) > 0.02) col = pow(mix(sqrt(col), sqrt(uFlashColor), fk), vec3(2.0));
      else col = mix(col, uFlashColor, fk);

      #if GW_PAPER
        // faint paper: fine fibres in screen pixels + soft watercolour blotches (off on every tier since Clear Night)
        vec2 px = gl_FragCoord.xy;
        float fib = gwNoise(px * vec2(0.55, 0.11)) * 0.5 + gwNoise(px * vec2(0.13, 0.62) + 17.0) * 0.5;
        float blot = gwNoise(uv * vec2(aspect, 1.0) * 3.0 + 4.0) * 0.6 + gwNoise(uv * vec2(aspect, 1.0) * 9.0) * 0.4;
        float paper = (fib - 0.5) * 0.55 + (blot - 0.5) * 0.9;
        col *= 1.0 + paper * uPaper * 0.16;
      #endif

      // animated grain (multiplicative + a touch additive for the inks): at Clear Night's amounts a dither, not a texture
      float n = gwHash(gl_FragCoord.xy + fract(uTime * 7.31) * vec2(311.7, 183.3)) - 0.5;
      col *= 1.0 + n * uGrain * 2.4;
      col += n * uGrain * 0.0035;

      gl_FragColor = vec4(max(col, 0.0), 1.0);
      // the last pass (see the header): active only when this draws to the screen
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
};
