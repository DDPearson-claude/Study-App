// render-grade.js — the "hand-inked melancholy" colour grade (render author).
// Operates on the linear HDR buffer after bloom and before OutputPass (which applies
// ACES tone mapping + sRGB). Order: chromatic fringe → saturation → split-tone
// (shadows → zone tint, highlights → warm) → tinted ink lift → contrast → vignette →
// danger edge → full-screen flash → paper texture → animated film grain.
import * as THREE from 'three';

export const GradeShader = {
  name: 'GloomwaterGrade',
  defines: { GW_PAPER: 1, GW_FRINGE: 1 },
  uniforms: {
    tDiffuse: { value: null },
    uRes: { value: new THREE.Vector2(1280, 720) },
    uTime: { value: 0 },
    uSaturation: { value: 0.85 },
    uContrast: { value: 1.0 },
    uTint: { value: new THREE.Color(0x40347e) },
    uTintAmount: { value: 0.18 },
    uWarm: { value: new THREE.Color(0xf4cc96) },
    uWarmAmount: { value: 0.12 },
    uLift: { value: 0.5 },
    uVignette: { value: 0.38 },
    uFringe: { value: 0.5 },
    uPaper: { value: 0.5 },
    uGrain: { value: 0.05 },
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
    uniform float uVignette, uFringe, uPaper, uGrain, uFlash, uDanger;
    uniform vec3 uTint, uWarm, uFlashColor, uDangerColor;
    varying vec2 vUv;

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

      vec3 col;
      #if GW_FRINGE
        vec2 off = cc * (r * r) * uFringe * 0.014;
        col.r = texture2D(tDiffuse, uv + off).r;
        col.g = texture2D(tDiffuse, uv).g;
        col.b = texture2D(tDiffuse, uv - off * 1.2).b;
      #else
        col = texture2D(tDiffuse, uv).rgb;
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
      // tinted ink lift: blacks become the zone's deepest colour, never dead grey
      col += uTint * (uLift * 0.0045) * sh;

      // contrast around linear mid grey
      col = pow(col / 0.18 + 1e-6, vec3(uContrast)) * 0.18;

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
        // faint paper: fine fibres in screen pixels + soft watercolour blotches
        vec2 px = gl_FragCoord.xy;
        float fib = gwNoise(px * vec2(0.55, 0.11)) * 0.5 + gwNoise(px * vec2(0.13, 0.62) + 17.0) * 0.5;
        float blot = gwNoise(uv * vec2(aspect, 1.0) * 3.0 + 4.0) * 0.6 + gwNoise(uv * vec2(aspect, 1.0) * 9.0) * 0.4;
        float paper = (fib - 0.5) * 0.55 + (blot - 0.5) * 0.9;
        col *= 1.0 + paper * uPaper * 0.16;
      #endif

      // animated film grain (multiplicative + a touch additive for the inks)
      float n = gwHash(gl_FragCoord.xy + fract(uTime * 7.31) * vec2(311.7, 183.3)) - 0.5;
      col *= 1.0 + n * uGrain * 2.4;
      col += n * uGrain * 0.0035;

      gl_FragColor = vec4(max(col, 0.0), 1.0);
    }`,
};
