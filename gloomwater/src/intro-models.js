// intro-models.js — what the opening cut scene draws (LANE A "set and picture"; docs/v3/intro/SPEC.md §4). v3 only: imported by
// src/intro-stage.js, which builds these under the title and frees them when the film ends.
//
// Builders only: each returns three.js objects in their rest pose and never touches the scene, the camera, the clock or the
// game. Everything that changes over the film is set by the stage from timeline time. Low-poly, flat-lit, silhouette first: the
// great lantern is a dark iron cage round one block of amber, the kingdom is 54 amber slits, the dark below is one card of ink
// with three things in front of it. No light, no shadow map, no render target, no texture of its own (the sprites share
// toon.glowTexture(128, 2.2), which the raft already holds).
import * as THREE from 'three';
import { toonMaterial, glowSprite, REFLECT_LAYER } from './toon.js';
import { mergeGeos, paint, tube, curve1, TAU } from './models-kit.js';
import { createHalos } from './world-fx.js';

const lerp = (a, b, k) => a + (b - a) * k;
/** A deterministic 0 … 1 hash of an integer (seed tables are made at build: nothing in the film calls Math.random). */
export function seed01(i, salt = 0) {
  const s = Math.sin((i + 1) * 127.1 + salt * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}
const linear = (hex, k = 1) => { const c = new THREE.Color(hex); return [c.r * k, c.g * k, c.b * k]; };

// ------------------------------------------------------------------ the great lantern
// Local frame: the origin is the middle of the lantern (height H from the foot of its base to the top of its cap), +y up.
export const LANTERN_SHAPE = {
  sides: 8,
  base: [-0.5, -0.4],        // the base ring, as fractions of H from the middle (bottom, top)
  glass: [-0.4, 0.22],       // the glass block
  cap: [0.22, 0.5],          // the roof, eave to knob
  taper: 0.74,               // the glass's foot radius / its head radius
  eave: 1.28,                // the roof's eave radius / the lantern's radius
  chainAt: 0.3,              // where the chains leave the roof (fraction of H above the middle)
  chainR: 0.92,              // … and how far from the axis (× radius)
};

/**
 * The great lantern: {group, cage, glass, halo, uppers: [chainA, chainBC], chainLocal: [[x, y, z] × 3], breakY: [a, b, c], dispose}.
 * group holds the cage (iron, with the three chain stubs that stay on it), the glass block and the halo. `uppers` are the chains
 * above their break points (the first to part, then the other two); the stage parents them to the lantern's hanging place, so
 * they stay behind when it drops. chainTopLocal: how far above the lantern's middle the chains run.
 */
export function buildLantern({ height = 6.5, radius = 2.4, colors = {}, glow = 2.6, halo = { size: 26, opacity: 0.55 }, chainTopLocal = 30 } = {}) {
  const S = LANTERN_SHAPE, H = height, R = radius, n = S.sides;
  const yBase0 = S.base[0] * H, yBase1 = S.base[1] * H, yG0 = S.glass[0] * H, yG1 = S.glass[1] * H, yCap1 = S.cap[1] * H;
  const rFoot = R * S.taper, rHead = R;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const iron = [];
  // base: a chunky ring under the glass and a drop finial
  iron.push(new THREE.CylinderGeometry(rFoot * 1.12, rFoot * 0.86, yBase1 - yBase0, n, 1).translate(0, (yBase0 + yBase1) / 2, 0));
  iron.push(new THREE.ConeGeometry(rFoot * 0.34, H * 0.1, n).rotateX(Math.PI).translate(0, yBase0 - H * 0.05, 0));
  // eight corner bars following the taper, and one band across the panes
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU, s = Math.sin(a), c = Math.cos(a);
    iron.push(tube([V(s * rFoot * 1.02, yG0, c * rFoot * 1.02), V(s * rHead * 1.02, yG1, c * rHead * 1.02)], R * 0.058, 4, { capEnd: false }));
  }
  const yBand = lerp(yG0, yG1, 0.4), rBand = lerp(rFoot, rHead, 0.4) * 1.03;
  iron.push(new THREE.CylinderGeometry(rBand * 1.005, rBand * 0.995, H * 0.035, n, 1, true).translate(0, yBand, 0));
  // collar and roof: a wide eave, a waist, a knob (a lathe on eight sides)
  iron.push(new THREE.CylinderGeometry(rHead * 1.08, rHead * 1.06, H * 0.04, n, 1).translate(0, yG1 + H * 0.02, 0));
  const capH = yCap1 - yG1 - H * 0.04, y0 = yG1 + H * 0.04;
  const roof = [[R * S.eave, y0 - capH * 0.06], [R * S.eave * 1.02, y0 + capH * 0.04], [R * 0.72, y0 + capH * 0.42], [R * 0.3, y0 + capH * 0.78], [R * 0.2, y0 + capH * 0.98], [R * 0.3, y0 + capH * 1.12], [0.001, y0 + capH * 1.3]];
  iron.push(new THREE.LatheGeometry(roof.map(([r, y]) => new THREE.Vector2(r, y)), n));
  // the chains: three, one link a metre, every other link turned (so a chain reads as links, not as a rod, at 60 m). Each is
  // two parts: the stub that stays on the lantern when it parts, and the run above the break, which whips up and away
  const chainY0 = S.chainAt * H, chainLocal = [], breakY = [7, 5, 8.5].map((d) => chainY0 + d);
  const link = (x, y, z, i, len) => {
    const wide = len * 0.3, thin = len * 0.1;
    return new THREE.BoxGeometry(i % 2 ? thin : wide, len * 0.94, i % 2 ? wide : thin).translate(x, y + len / 2, z);
  };
  const stubList = [], upperA = [], upperBC = [];
  for (let k = 0; k < 3; k++) {
    // seen from the south (the film's side): one chain on the left, one behind the axis, one on the right
    const a = [-TAU / 4 - 0.25, TAU / 2, TAU / 4 + 0.25][k], x = Math.sin(a) * R * S.chainR, z = Math.cos(a) * R * S.chainR * 0.6;
    chainLocal.push([x, chainY0, z]);
    for (let i = 0, y = chainY0; y < chainTopLocal; i++, y += 1) {
      const g = link(x, y, z, i, 1);
      if (y + 1 <= breakY[k] + 1e-6) stubList.push(g); else (k === 0 ? upperA : upperBC).push(g);
    }
  }
  const strip = (list) => { const geo = mergeGeos(list.map((g) => { g.deleteAttribute('uv'); return g; })); list.forEach((g) => g.dispose()); return geo; };
  const cageGeo = strip(iron);
  const ironMat = toonMaterial({ color: colors.iron ?? 0x0a0818, flatShading: true, rim: 0.4, rimColor: 0xb8b0ea, gloss: 0, floor: 0.7 });
  const mkIron = (geo, name) => { const m = new THREE.Mesh(geo, ironMat); m.name = name; m.castShadow = false; m.receiveShadow = false; return m; };
  const cage = mkIron(cageGeo, 'intro:lantern-cage');
  // the stubs keep hanging true when the lantern tilts: the stage shears this mesh about the chains' foot (stubY)
  const stubs = mkIron(strip(stubList), 'intro:chain-stubs');
  stubs.matrixAutoUpdate = false; stubs.frustumCulled = false;

  // the glass: one eight-sided block of amber, hottest a little under the middle (where the flame would sit), and the roof's
  // underside catching its light
  const gc = linear(colors.glass ?? 0xed9e3b), hot = linear(0xffd9a0);
  const glassGeo = new THREE.CylinderGeometry(rHead * 0.98, rFoot * 0.98, yG1 - yG0, n, 4, true).translate(0, (yG0 + yG1) / 2, 0);
  paint(glassGeo, (x, y) => {
    const u = (y - yG0) / (yG1 - yG0), core = Math.exp(-((u - 0.38) ** 2) / 0.05);
    const k = 0.4 + 0.62 * core;
    return new THREE.Color(lerp(gc[0], hot[0], core * 0.45) * k, lerp(gc[1], hot[1], core * 0.45) * k, lerp(gc[2], hot[2], core * 0.45) * k);
  });
  const under = new THREE.RingGeometry(rHead * 1.0, R * S.eave, n, 1).rotateX(Math.PI / 2).translate(0, y0 - capH * 0.07, 0);
  paint(under, (x, y, z) => { const k = 0.42 * (1 - (Math.hypot(x, z) - rHead) / (R * S.eave - rHead)) + 0.06; return new THREE.Color(gc[0] * k, gc[1] * k, gc[2] * k); });
  const glowGeo = mergeGeos([glassGeo, under].map((g) => { g.deleteAttribute('uv'); return g; }));
  glassGeo.dispose(); under.dispose();
  const glassMat = new THREE.MeshBasicMaterial({ name: 'intro:glass', color: new THREE.Color(glow, glow, glow), vertexColors: true, side: THREE.DoubleSide, fog: true, toneMapped: false });
  const glass = new THREE.Mesh(glowGeo, glassMat);
  glass.name = 'intro:lantern-glass';

  const haloS = glowSprite({ color: colors.halo ?? 0xed9e3b, size: halo.size, opacity: halo.opacity });
  haloS.name = 'intro:lantern-halo'; haloS.position.y = lerp(yG0, yG1, 0.4); haloS.renderOrder = 4;

  const group = new THREE.Group(); group.name = 'intro:lantern';
  group.add(cage, stubs, glass, haloS);
  const uppers = [mkIron(strip(upperA), 'intro:chain-a'), mkIron(strip(upperBC), 'intro:chains-bc')];
  for (const u of uppers) u.frustumCulled = false;
  for (const o of [cage, stubs, glass, haloS, ...uppers]) o.layers.enable(REFLECT_LAYER);
  return {
    group, cage, stubs, stubY: chainY0, glass, halo: haloS, uppers, chainLocal, breakY, glow,
    geometries: [cageGeo, stubs.geometry, glowGeo, uppers[0].geometry, uppers[1].geometry], materials: [ironMat, glassMat, haloS.material],
  };
}

// ------------------------------------------------------------------ the kingdom's windows ("then")
/**
 * Where the 54 slits sit on the Sunken Gate's two towers, by world-art's own formulas (the towers stand ±13 m either side of the
 * gate's anchor, eight-sided, a corner toward the lake, leaning 0.03 rad): [{x, y, z, yaw, row, col, tower, seed}]. Pure.
 */
export function windowLayout(anchor, W = {}) {
  const { cols = 3, rows = 9, y0 = 4, dy = 3.4 } = W;
  const face = anchor.face ?? Math.atan2(-anchor.x, -anchor.z);
  const fx = Math.cos(face), fz = -Math.sin(face), wx = Math.sin(face), wz = Math.cos(face);
  const out = [];
  for (const sd of [-1, 1]) {
    const tx = anchor.x + fx * sd * 13, tz = anchor.z + fz * sd * 13;
    for (let col = 0; col < cols; col++) for (let row = 0; row < rows; row++) {
      const y = y0 + row * dy + (col % 2 ? dy * 0.5 : 0), off = (col - (cols - 1) / 2) * 1.9;   // the middle column sits half a row up: masonry, not a grid
      const r0 = 5.2 - (y / 38) * 1.0 + 0.15;                  // world-art's slit radius at this height
      const wd = r0 - 0.414 * Math.abs(off) - 0.06;              // hugging the octagon's two lake faces, a hand behind the lake's own slits
      const lean = -(y - 15) * Math.sin(sd * 0.03) + off;
      out.push({ x: tx + wx * wd + fx * lean, y, z: tz + wz * wd + fz * lean, yaw: face + Math.sign(off) * (Math.PI / 8), nx: wx, nz: wz, row, col, tower: sd, seed: seed01(out.length, 3), sx: 0.85 + 0.3 * seed01(out.length, 5), sy: 0.7 + 0.6 * seed01(out.length, 7) });
    }
  }
  return out;
}

/**
 * The windows: {mesh (InstancedMesh, one colour per slit), memory (its mirror-only twin, or null), halos (world-fx halos, one each
 * second slit), layout, haloOf: [layout index → halo index | -1]}. With a twin the lake's reflection of the windows is the twin's
 * alone (it stays lit a beat longer than the towers and sinks); without one (the low tier has no mirror) the mesh reflects itself.
 */
export function buildWindows(anchor, W = {}, { colors = {}, memory = true } = {}) {
  const layout = windowLayout(anchor, W), n = layout.length;
  const [w, h] = W.size || [0.8, 1.8];
  const geo = new THREE.BoxGeometry(w, h, 0.34);
  geo.deleteAttribute('uv');
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: true, toneMapped: false });
  const mk = (name) => {
    const im = new THREE.InstancedMesh(geo, mat, n);
    im.name = name; im.frustumCulled = false; im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1), c = new THREE.Color(0, 0, 0);
    for (let i = 0; i < n; i++) { const L = layout[i]; m4.compose(p.set(L.x, L.y, L.z), q.setFromEuler(e.set(0, L.yaw, 0)), s.set(L.sx, L.sy, 1)); im.setMatrixAt(i, m4); im.setColorAt(i, c); }
    im.instanceColor.setUsage(THREE.DynamicDrawUsage);
    return im;
  };
  const mesh = mk('intro:windows');
  let twin = null;
  if (memory) { twin = mk('intro:windows-memory'); twin.layers.set(REFLECT_LAYER); } else mesh.layers.enable(REFLECT_LAYER);
  const halos = createHalos(64), haloOf = new Array(n).fill(-1);
  const hc = linear(colors.window ?? 0xed9e3b, 0.55);
  for (let i = 0; i < n; i += 2) { const L = layout[i]; haloOf[i] = halos.add(L.x + L.nx * 0.6, L.y, L.z + L.nz * 0.6, hc, 4.5, L.seed * 10); }
  halos.commit();
  halos.points.name = 'intro:window-halos';
  halos.points.layers.enable(REFLECT_LAYER);
  return { mesh, memory: twin, halos, layout, haloOf, haloColor: hc, geometries: [geo, halos.geo], materials: [mat, halos.mat] };
}

// ------------------------------------------------------------------ the contact ring
/** One flat feathered ring on the water (unit radius; the stage scales it): additive pale gold, brightest at its crest. */
export function buildRing(color = 0xf0d49c) {
  const seg = 56, radii = [0.4, 0.82, 1.0], k = [0, 1, 0], pos = [], col = [], idx = [], c = linear(color);
  for (let j = 0; j < radii.length; j++) for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * TAU;
    pos.push(Math.cos(a) * radii[j], 0, Math.sin(a) * radii[j]); col.push(c[0] * k[j], c[1] * k[j], c[2] * k[j]);
  }
  for (let j = 0; j < radii.length - 1; j++) for (let i = 0; i < seg; i++) { const a = j * (seg + 1) + i, b = a + seg + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(idx);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: true, toneMapped: false });
  mat.forceSinglePass = true;   // (additive: one draw, not three's back-then-front pair)
  mat.polygonOffset = true; mat.polygonOffsetFactor = -2; mat.polygonOffsetUnits = -2;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'intro:contact-ring'; mesh.renderOrder = 2; mesh.frustumCulled = false;
  return { mesh, geometries: [geo], materials: [mat] };
}

// ------------------------------------------------------------------ the ink card
/**
 * The dark below: one quad that fills the picture whatever the lens, drawn after the whole world (renderOrder 900, in the
 * transparent pass) with the depth test off and the depth write on, so it covers the world and resets the depth under it: what
 * stands in front of it sorts among itself and the world cannot cut in. Night ink at the foot up to deep indigo at the head,
 * with a breath of light where the surface is. It opens from a point (uOpen: x, y the Wick's flame in the picture, z the clear
 * radius in picture heights, w the feather).
 */
export function buildInkCard(colors = {}) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  const uniforms = {
    uInk: { value: new THREE.Color(colors.ink ?? 0x0a0c19) }, uInkTop: { value: new THREE.Color(colors.inkTop ?? 0x1d245d) },
    uOpacity: { value: 1 }, uOpen: { value: new THREE.Vector4(0.5, 0.5, 0, 0.3) }, uAspect: { value: 16 / 9 }, uDist: { value: 60 }, uSurface: { value: 1 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      uniform float uDist;
      varying vec2 vUv;
      void main() {
        vUv = position.xy * 0.5 + 0.5;
        vec4 c = projectionMatrix * vec4( 0.0, 0.0, -uDist, 1.0 );
        gl_Position = vec4( position.xy * c.w, c.z, c.w );
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uInk; uniform vec3 uInkTop; uniform float uOpacity; uniform vec4 uOpen; uniform float uAspect; uniform float uSurface;
      varying vec2 vUv;
      void main() {
        float up = smoothstep( 0.0, 1.0, vUv.y );
        vec3 col = mix( uInk, uInkTop, up * up * 0.5 );
        // the surface, far above: a soft lighter reach of water at the head of the picture, where the lantern went under
        vec2 s = ( vUv - vec2( 0.5, 1.15 ) ) * vec2( uAspect * 0.5, 1.0 );
        col += uInkTop * ( 0.3 * uSurface * exp( - dot( s, s ) * 3.6 ) );
        vec2 d = ( vUv - uOpen.xy ) * vec2( uAspect, 1.0 );
        float a = uOpacity * smoothstep( uOpen.z - uOpen.w, uOpen.z, length( d ) );
        if ( a < 0.002 ) discard;
        gl_FragColor = vec4( col, a );
      }`,
    transparent: true, depthTest: true, depthFunc: THREE.AlwaysDepth, depthWrite: true, fog: false, toneMapped: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'intro:ink-card'; mesh.frustumCulled = false; mesh.renderOrder = 900;
  return { mesh, uniforms, geometries: [geo], materials: [mat] };
}

// ------------------------------------------------------------------ motes
/** Slow motes in the dark, in picture space (y in picture heights, x × the aspect): they rise as a function of uT alone. */
export function buildMotes(count = 60, color = 0xb8b0ea) {
  const pos = new Float32Array(count * 3), sd = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = seed01(i, 11) * 2 - 1; pos[i * 3 + 1] = seed01(i, 12); pos[i * 3 + 2] = seed01(i, 13);
    sd[i * 3] = seed01(i, 14); sd[i * 3 + 1] = seed01(i, 15); sd[i * 3 + 2] = seed01(i, 16);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(sd, 3));
  const uniforms = { uT: { value: 0 }, uK: { value: 0 }, uAspect: { value: 16 / 9 }, uViewH: { value: 720 }, uColor: { value: new THREE.Color(color) } };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      attribute vec3 aSeed;
      uniform float uT, uAspect, uViewH;
      varying float vA;
      void main() {
        float depth = position.z;                                  // 0 near … 1 far
        float rise = 0.022 + 0.05 * ( 1.0 - depth ) * ( 0.5 + aSeed.x );
        float y = fract( position.y + rise * uT ) - 0.5;
        float x = position.x * 0.5 * uAspect * 1.15 + sin( uT * ( 0.3 + aSeed.y * 0.5 ) + aSeed.z * 6.2832 ) * 0.012;
        vec4 mv = modelViewMatrix * vec4( x * 1.1, y * 1.1, ( 0.5 - depth ) * 0.7, 1.0 );
        vA = ( 0.35 + 0.65 * ( 1.0 - depth ) ) * ( 0.6 + 0.4 * sin( uT * ( 0.7 + aSeed.z ) + aSeed.x * 6.2832 ) ) * smoothstep( 0.5, 0.36, abs( y ) );
        gl_PointSize = max( 1.5, uViewH * ( 0.004 + 0.009 * ( 1.0 - depth ) * ( 0.4 + aSeed.y ) ) );
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform float uK;
      varying float vA;
      void main() {
        float d = length( gl_PointCoord - 0.5 ) * 2.0;
        float a = pow( max( 0.0, 1.0 - d ), 2.0 ) * vA * uK;
        if ( a < 0.004 ) discard;
        gl_FragColor = vec4( uColor * a, 1.0 );
      }`,
    transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending, fog: false, toneMapped: false,
  });
  const points = new THREE.Points(geo, mat);
  points.name = 'intro:motes'; points.frustumCulled = false; points.renderOrder = 901;
  return { points, uniforms, geometries: [geo], materials: [mat] };
}

// ------------------------------------------------------------------ the ember
/** The lantern's last ember: a core and a soft halo (two sprites of the shared glow texture), drawn over the flank. */
export function buildEmber(colors = {}) {
  const mk = (name, order) => {
    const s = glowSprite({ color: colors.ember ?? 0xe8862e, size: 1, opacity: 1 });
    s.material.depthTest = false; s.material.fog = false; s.name = name; s.renderOrder = order; s.frustumCulled = false;
    return s;
  };
  const halo = mk('intro:ember-halo', 903), core = mk('intro:ember-core', 904);
  return { core, halo, materials: [core.material, halo.material], geometries: [] };
}

// ------------------------------------------------------------------ the pale flank
// Its profile, nose (s = 0) to the root of the tail (s = 1): [s, half-height, middle-line] in half-girths. A deep head, the
// belly a little lower than the back is high, a long run down to a narrow wrist. Never seen whole.
export const FLANK_PROFILE = [
  [0.0, 0.0, 0.02], [0.004, 0.14, 0.02], [0.014, 0.3, 0.015], [0.04, 0.52, 0.0], [0.085, 0.72, -0.03], [0.15, 0.88, -0.06], [0.24, 0.98, -0.08], [0.34, 1.0, -0.08],
  [0.46, 0.95, -0.06], [0.58, 0.82, -0.03], [0.7, 0.62, 0.0], [0.8, 0.42, 0.03], [0.89, 0.25, 0.05], [0.96, 0.15, 0.06], [1.0, 0.12, 0.06],
];
export const FLANK_MARKS = { eye: [0.06, 0.2], belly: [0.26, -0.5], thick: 0.56 };   // [s, height in half-heights of that station]; thick: its depth / its height
const profR = curve1(FLANK_PROFILE.map((p) => [p[0], p[1]])), profC = curve1(FLANK_PROFILE.map((p) => [p[0], p[2]]));
/** The profile at s: [half-height, middle-line], a smooth curve through the table (so the outline never shows its keys). */
function profileAt(s) {
  const u = Math.min(1, Math.max(0, s));
  return [Math.max(0, profR(u)), profC(u)];
}
/** A point of the flank's surface in its own metres: s along (0 nose … 1 tail root), v in half-heights of that station (the side toward the lens). */
export function flankPoint(s, v, { length = 22, girth = 5.2 } = {}, out = [0, 0, 0]) {
  const [r, c] = profileAt(s), hg = girth / 2;
  const vv = Math.max(-1, Math.min(1, v));
  out[0] = length * (0.5 - s); out[1] = (c + r * vv) * hg; out[2] = r * hg * FLANK_MARKS.thick * Math.sqrt(1 - vv * vv);
  return out;
}

/**
 * The pale flank: {group, body, eye, uniforms}. Local frame: metres, the nose at +x (it swims toward +x), +y up, +z toward the
 * lens. One smooth lathed body with its tail merged in, and one eye. Its own small shader: flat bands of light from above (pale
 * stone on the back, violet dusk on the belly), one seam for the mouth and one for the gill, the dark closing over what is far,
 * and the ember's glow coming through the belly (uEmber: xyz where the ember is in the flank's own metres, w how strongly).
 */
export function buildFlank({ length = 22, girth = 5.2, colors = {} } = {}) {
  const hg = girth / 2, D = { length, girth };
  const stations = 60, around = 40, pos = [], nor = [], idx = [];
  for (let i = 0; i <= stations; i++) {
    const s = (i / stations) ** 1.7;                                 // most of the stations in the head and shoulder: that is what fills the frame
    const [r, c] = profileAt(s);
    for (let j = 0; j < around; j++) {
      const a = (j / around) * TAU, ry = Math.max(0.02, r) * hg, rz = ry * FLANK_MARKS.thick;
      pos.push(length * (0.5 - s), c * hg + ry * Math.sin(a), rz * Math.cos(a));
      const ny = Math.sin(a) / ry, nz = Math.cos(a) / rz, l = Math.hypot(ny, nz) || 1;   // the ellipse's own normal: light falls in clean bands along the body
      nor.push(0, ny / l, nz / l);
    }
  }
  for (let i = 0; i < stations; i++) for (let j = 0; j < around; j++) {
    const a = i * around + j, b = i * around + ((j + 1) % around), c2 = a + around, d = b + around;
    idx.push(a, b, c2, b, d, c2);   // (outward faces wound to the front: the body is drawn single-sided, so a fade never blends its far side through)
  }
  // the snout closes on a point; the tail is two long lobes from the wrist
  const tail = [], tailN = [];
  { const w = flankPoint(1, 0, D, []), x1 = w[0] - length * 0.13;
    const tri = (p0, p1, p2) => { tail.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p1); for (let i = 0; i < 6; i++) tailN.push(0, 0, 1); };   // (both windings: the lobes are flat)
    tri([w[0] + 0.5, w[1] + 0.3, 0], [w[0] + 0.5, w[1] - 0.05, 0], [x1, w[1] + hg * 1.05, 0]);
    tri([w[0] + 0.5, w[1] + 0.05, 0], [w[0] + 0.5, w[1] - 0.3, 0], [x1 + length * 0.02, w[1] - hg * 0.85, 0]); }
  const shell = new THREE.BufferGeometry();
  shell.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  shell.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  shell.setIndex(idx);
  const fins = new THREE.BufferGeometry();
  fins.setAttribute('position', new THREE.Float32BufferAttribute(tail, 3));
  fins.setAttribute('normal', new THREE.Float32BufferAttribute(tailN, 3));
  const bodyGeo = mergeGeos([shell, fins]);
  shell.dispose(); fins.dispose();

  const uniforms = {
    uPale: { value: new THREE.Color(colors.flank ?? 0xd6d6e4) }, uShade: { value: new THREE.Color(colors.flankShade ?? 0x433e74) },
    uInk: { value: new THREE.Color(colors.ink ?? 0x0a0c19) }, uEmberCol: { value: new THREE.Color(colors.ember ?? 0xe8862e) },
    uEmber: { value: new THREE.Vector4(0, 0, 0, 0) }, uAlpha: { value: 1 }, uLight: { value: new THREE.Vector3(-0.18, 0.9, 0.4).normalize() },
    uMurk: { value: new THREE.Vector2(0.2, 0.1) },   // x: where along the body (from the nose, as a fraction) the dark starts to close, y: how fast across the depth
    uHalf: { value: new THREE.Vector2(length / 2, hg) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      varying vec3 vN; varying vec3 vLocal;
      void main() {
        vLocal = position;
        vN = normalMatrix * normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uPale; uniform vec3 uShade; uniform vec3 uInk; uniform vec3 uEmberCol; uniform vec4 uEmber; uniform float uAlpha;
      uniform vec3 uLight; uniform vec2 uMurk; uniform vec2 uHalf;
      varying vec3 vN; varying vec3 vLocal;
      void main() {
        vec3 n = normalize( vN );
        float ndl = dot( n, uLight ) * 0.5 + 0.5;
        // flat bands with narrow soft edges (the game's toon ramp): belly, lower flank, flank, back. Pale stone seen through
        // dark water: the back is a moonlit grey-lavender, never white, and the belly goes to violet dusk
        vec3 col = uShade * 0.26;
        col = mix( col, mix( uShade, uPale, 0.3 ) * 0.2, smoothstep( 0.3, 0.335, ndl ) );
        col = mix( col, mix( uShade, uPale, 0.66 ) * 0.2, smoothstep( 0.52, 0.55, ndl ) );
        col = mix( col, mix( uShade, uPale, 0.9 ) * 0.29, smoothstep( 0.8, 0.83, ndl ) );
        float s = ( uHalf.x - vLocal.x ) / ( 2.0 * uHalf.x );     // 0 at the nose … 1 at the root of the tail
        float v = vLocal.y / uHalf.y;                               // height, in half-girths
        if ( vLocal.z > 0.0 ) {
          // the mouth: one seam from the snout, back and down, thinning out; the gill: one short crescent behind the eye
          float mouth = ( 1.0 - smoothstep( 0.01, 0.026, abs( v + 3.1 * s + 6.0 * s * s - 0.03 ) ) ) * ( 1.0 - smoothstep( 0.045, 0.085, s ) );
          float gx = s - ( 0.108 + 0.11 * ( v + 0.08 ) * ( v + 0.08 ) );
          float gill = ( 1.0 - smoothstep( 0.001, 0.0026, abs( gx ) ) ) * smoothstep( -0.55, -0.3, v ) * ( 1.0 - smoothstep( 0.12, 0.34, v ) );
          // … and the long line down its side, from the gill toward the tail
          float side = ( 1.0 - smoothstep( 0.005, 0.014, abs( v - ( 0.05 - 0.22 * s ) ) ) ) * smoothstep( 0.118, 0.15, s );
          col = mix( col, uShade * 0.12, max( 0.7 * max( mouth, gill ), 0.4 * side ) );
        }
        // the dark closes over the far end of it and over what leans away from the lens
        float murk = smoothstep( uMurk.x, 0.72, s ) * 0.97 + clamp( - vLocal.z * uMurk.y, 0.0, 0.5 );
        col = mix( col, uInk, clamp( murk, 0.0, 0.97 ) );
        // the ember, inside: its glow comes through the belly
        vec3 e = vLocal - uEmber.xyz; e.z *= 0.25;
        float g = exp( - dot( e, e ) / ( uHalf.y * uHalf.y * 0.11 ) );
        col += uEmberCol * ( ( g * 0.5 + g * g * g * 0.7 ) * uEmber.w );
        gl_FragColor = vec4( col, uAlpha );
      }`,
    transparent: true, depthTest: true, depthWrite: true, side: THREE.FrontSide, fog: false, toneMapped: false,
  });
  const body = new THREE.Mesh(bodyGeo, mat);
  body.name = 'intro:flank'; body.renderOrder = 902; body.frustumCulled = false;

  // the eye: an ink disc with a pale-gold glint, lying on the head
  const [es, ev] = FLANK_MARKS.eye;
  const p = flankPoint(es, ev, D, []), pu = flankPoint(es, ev + 0.08, D, []), ps = flankPoint(es + 0.01, ev, D, []);
  const tu = new THREE.Vector3(pu[0] - p[0], pu[1] - p[1], pu[2] - p[2]), ts = new THREE.Vector3(ps[0] - p[0], ps[1] - p[1], ps[2] - p[2]);
  const nrm = new THREE.Vector3().crossVectors(tu, ts).normalize(); if (nrm.z < 0) nrm.negate();
  const er = girth * 0.042;
  const disc = new THREE.CircleGeometry(er, 20), lid = new THREE.RingGeometry(er, er * 1.14, 20), glint = new THREE.CircleGeometry(er * 0.2, 10).translate(-er * 0.32, er * 0.36, 0.012);
  const ink = linear(colors.ink ?? 0x0a0c19, 0.4), pale = linear(colors.flankShade ?? 0x433e74, 0.3), gold = linear(colors.glint ?? 0xe8be77, 1.7);
  paint(disc, () => new THREE.Color(...ink)); paint(lid, () => new THREE.Color(...pale)); paint(glint, () => new THREE.Color(...gold));
  const eyeGeo = mergeGeos([disc, lid, glint].map((g) => { g.deleteAttribute('uv'); g.deleteAttribute('normal'); return g; }));
  disc.dispose(); lid.dispose(); glint.dispose();
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true, transparent: true, opacity: 1, depthTest: true, depthWrite: false, fog: false, toneMapped: false });
  const eye = new THREE.Mesh(eyeGeo, eyeMat);
  eye.name = 'intro:flank-eye'; eye.renderOrder = 902.5; eye.frustumCulled = false;
  eye.position.set(p[0] + nrm.x * 0.05, p[1] + nrm.y * 0.05, p[2] + nrm.z * 0.05);
  eye.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), nrm);

  const group = new THREE.Group(); group.name = 'intro:flank-root';
  group.add(body, eye);
  return { group, body, eye, uniforms, eyeMat, dims: D, geometries: [bodyGeo, eyeGeo], materials: [mat, eyeMat] };
}

// ------------------------------------------------------------------ sparks
/** A pale-gold spark (one sprite of the shared glow texture), drawn over everything of the film's. */
export function buildSpark(color = 0xffd9a0, name = 'intro:spark') {
  const s = glowSprite({ color, size: 1, opacity: 1, falloff: 2.2 });
  s.material.depthTest = false; s.name = name; s.renderOrder = 905; s.frustumCulled = false; s.visible = false;
  return { sprite: s, materials: [s.material], geometries: [] };
}
