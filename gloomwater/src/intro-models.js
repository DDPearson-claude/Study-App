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
  // (the stubs that stay on it are two links or less: longer, they stood above a falling lantern like poles)
  const chainY0 = S.chainAt * H, chainLocal = [], breakY = [2, 1.5, 2.5].map((d) => chainY0 + d);
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
  // a broad soft band behind a bright crest (seen edge-on from the lens a thin crest read as one pale streak)
  const seg = 56, radii = [0.22, 0.52, 0.76, 0.88, 1.0], k = [0, 0.42, 1, 0.38, 0], pos = [], col = [], idx = [], c = linear(color);
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
    uT: { value: 0 },   // the film's time: the surface overhead ripples
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
      uniform vec3 uInk; uniform vec3 uInkTop; uniform float uOpacity; uniform vec4 uOpen; uniform float uAspect; uniform float uSurface; uniform float uT;
      varying vec2 vUv;
      void main() {
        float up = smoothstep( 0.0, 1.0, vUv.y );
        vec3 col = mix( uInk, uInkTop, up * up * 0.5 );
        // the surface, far above: a soft lighter reach of water at the head of the picture, where the lantern went under
        vec2 s = ( vUv - vec2( 0.5, 1.15 ) ) * vec2( uAspect * 0.5, 1.0 );
        col += uInkTop * ( 0.3 * uSurface * exp( - dot( s, s ) * 3.6 ) );
        // … and the underside of the lake itself along the top of the picture: a band of moving light, its ripples crossing, and
        // a brighter wavering hole where the lantern broke through (so the dark reads as under water, not as a night sky)
        float x = vUv.x * uAspect, band = smoothstep( 0.8, 0.985, vUv.y );
        float w1 = sin( x * 13.0 + uT * 1.25 + sin( vUv.y * 34.0 - uT * 0.8 ) * 1.4 );
        float w2 = sin( x * 21.0 - uT * 1.6 + vUv.y * 47.0 + sin( x * 3.1 + uT * 0.5 ) );
        float rip = 0.5 + 0.25 * w1 + 0.25 * w2;
        vec2 h = vec2( ( vUv.x - 0.5 - 0.012 * sin( uT * 1.1 ) ) * uAspect, ( vUv.y - 1.02 ) * 2.4 );
        float hole = exp( - dot( h, h ) * 7.0 ) * ( 0.8 + 0.2 * sin( uT * 2.3 + x * 11.0 ) * sin( uT * 1.7 - vUv.y * 30.0 ) );
        col += ( uInkTop * 0.5 + vec3( 0.05, 0.045, 0.1 ) ) * band * ( 0.3 + 0.7 * rip * rip * rip ) * uSurface;
        col += vec3( 0.42, 0.38, 0.62 ) * hole * ( 0.45 + 0.35 * rip ) * uSurface;
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

// ------------------------------------------------------------------ silt and bubbles
/**
 * Silt in the dark, in picture space (y in picture heights, x × the aspect): few, soft and slow, a little out of focus, drifting
 * up past the lens as it sinks (they rise as a function of uT alone, so they never read as a sky of stars). The last `bubbles`
 * points are a short trail of bubbles rising from the ember (uEmber: its x, y in the picture, z how strongly).
 */
export function buildMotes(count = 34, color = 0xb8b0ea, bubbles = 14) {
  const n = count + bubbles, pos = new Float32Array(n * 3), sd = new Float32Array(n * 3), kind = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = seed01(i, 11) * 2 - 1; pos[i * 3 + 1] = seed01(i, 12); pos[i * 3 + 2] = seed01(i, 13);
    sd[i * 3] = seed01(i, 14); sd[i * 3 + 1] = seed01(i, 15); sd[i * 3 + 2] = seed01(i, 16);
    kind[i] = i >= count ? 1 : 0;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(sd, 3));
  geo.setAttribute('aKind', new THREE.BufferAttribute(kind, 1));
  const uniforms = { uT: { value: 0 }, uK: { value: 0 }, uAspect: { value: 16 / 9 }, uViewH: { value: 720 }, uColor: { value: new THREE.Color(color) },
    uEmber: { value: new THREE.Vector3(0, 0, 0) }, uWarm: { value: new THREE.Color(0xf0c8a0) } };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      attribute vec3 aSeed; attribute float aKind;
      uniform float uT, uAspect, uViewH; uniform vec3 uEmber;
      varying float vA; varying float vKind;
      void main() {
        vKind = aKind;
        if ( aKind > 0.5 ) {
          // a bubble: born at the ember, rising and wobbling, gone within a second or so
          float life = 0.9 + aSeed.y * 0.7, p = fract( aSeed.x + uT / life );
          float y = uEmber.y + 0.015 + p * ( 0.16 + 0.1 * aSeed.z );
          float x = uEmber.x + ( aSeed.z - 0.5 ) * 0.035 + sin( p * 8.0 + aSeed.x * 6.2832 ) * 0.01 * p;
          vec4 mb = modelViewMatrix * vec4( x, y, 0.03, 1.0 );
          vA = uEmber.z * ( 1.0 - p ) * smoothstep( 0.0, 0.1, p );
          gl_PointSize = max( 2.5, uViewH * ( 0.006 + 0.005 * aSeed.y ) * ( 0.7 + 0.6 * p ) );
          gl_Position = projectionMatrix * mb;
          return;
        }
        float depth = position.z;                                  // 0 near … 1 far
        float rise = 0.008 + 0.02 * ( 1.0 - depth ) * ( 0.5 + aSeed.x );
        float y = fract( position.y + rise * uT ) - 0.5;
        float x = position.x * 0.5 * uAspect * 1.15 + sin( uT * ( 0.18 + aSeed.y * 0.3 ) + aSeed.z * 6.2832 ) * 0.02;
        vec4 mv = modelViewMatrix * vec4( x * 1.1, y * 1.1, ( 0.5 - depth ) * 0.7, 1.0 );
        vA = ( 0.25 + 0.45 * ( 1.0 - depth ) ) * ( 0.7 + 0.3 * sin( uT * ( 0.5 + aSeed.z * 0.5 ) + aSeed.x * 6.2832 ) ) * smoothstep( 0.5, 0.36, abs( y ) );
        gl_PointSize = max( 3.0, uViewH * ( 0.007 + 0.02 * ( 1.0 - depth ) * ( 0.3 + aSeed.y ) ) );
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform vec3 uWarm; uniform float uK;
      varying float vA; varying float vKind;
      void main() {
        float d = length( gl_PointCoord - 0.5 ) * 2.0;
        if ( vKind > 0.5 ) {
          // a bubble: a thin bright rim round a clear middle, lit warm by the ember below it
          float a = ( smoothstep( 0.45, 0.78, d ) * ( 1.0 - smoothstep( 0.8, 1.0, d ) ) + 0.12 * ( 1.0 - d ) ) * vA;
          if ( a < 0.004 ) discard;
          gl_FragColor = vec4( uWarm * a, 1.0 );
          return;
        }
        // silt: a soft, defocused speck (never a star's hard point)
        float a = ( 1.0 - smoothstep( 0.0, 1.0, d ) ) * ( 1.0 - smoothstep( 0.0, 1.0, d ) ) * vA * uK;
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
 * lens. One lathed body with its tail, a pectoral fin and a low dorsal ridge merged in (the fins break the outline: it reads as
 * a fish, not a hull), and one eye. Its own small shader: flat bands of light from above (pale stone on the back, violet dusk on
 * the belly), a faint mottle and scale, one seam for the mouth and one for the gill (which breathes), a dotted side line; the
 * body flexes in a slow wave from behind the gill to the tail and the fin sculls (uT, the film's own time: a pure function of
 * t); the dark water closes over what is far by thinning it into the ink (alpha, not only colour, so it never leaves an edge
 * standing); the ember's glow comes through the belly and the fin (uEmber: xyz where the ember is in the flank's own metres,
 * w how strongly).
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
  const shell = new THREE.BufferGeometry();
  shell.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  shell.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  shell.setAttribute('aFin', new THREE.Float32BufferAttribute(new Float32Array((pos.length / 3) * 3), 3));
  shell.setIndex(idx);
  // the fins: flat membranes, one winding toward the lens (+z), aFin = [kind (1 pectoral, 2 dorsal, 3 tail), ray, root 0 … tip 1]
  const fp = [], fa = [];
  const V3 = (p) => new THREE.Vector3(p[0], p[1], p[2]);
  const tri = (a, b, c, fa0, fa1, fa2) => {
    const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a));
    if (n.z < 0) { [b, c] = [c, b]; [fa1, fa2] = [fa2, fa1]; }
    fp.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z); fa.push(...fa0, ...fa1, ...fa2);
  };
  { // the tail: two long lobes from the wrist (never in frame with the head)
    const w = flankPoint(1, 0, D, []), x1 = w[0] - length * 0.13;
    tri(V3([w[0] + 0.5, w[1] + 0.3, 0]), V3([w[0] + 0.5, w[1] - 0.05, 0]), V3([x1, w[1] + hg * 1.05, 0]), [3, 0, 0], [3, 0, 0], [3, 2, 1]);
    tri(V3([w[0] + 0.5, w[1] + 0.05, 0]), V3([w[0] + 0.5, w[1] - 0.3, 0]), V3([x1 + length * 0.02, w[1] - hg * 0.85, 0]), [3, 0, 0], [3, 0, 0], [3, 2, 1]);
  }
  { // the pectoral fin: a fan of seven rays behind the gill, low on the flank, swept back and down and a little out from the body
    const A = V3(flankPoint(0.15, -0.46, D, [])), B = V3(flankPoint(0.178, -0.6, D, [])), N = 7, roots = [], tips = [];
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1), root = A.clone().lerp(B, u);
      const ang = lerp(-0.35, -1.0, u), len = hg * lerp(0.95, 0.62, u) * (1 - 0.15 * Math.abs(u - 0.3));
      root.z += 0.02;
      roots.push(root); tips.push(new THREE.Vector3(root.x - Math.cos(ang) * len, root.y + Math.sin(ang) * len, root.z + 0.3 * len));
    }
    for (let i = 0; i < N - 1; i++) {
      const mid = tips[i].clone().add(tips[i + 1]).multiplyScalar(0.5).lerp(roots[i].clone().add(roots[i + 1]).multiplyScalar(0.5), 0.12);   // the membrane's edge falls short of the rays
      tri(roots[i], roots[i + 1], mid, [1, i, 0], [1, i + 1, 0], [1, i + 0.5, 0.88]);
      tri(roots[i], mid, tips[i], [1, i, 0], [1, i + 0.5, 0.88], [1, i, 1]);
      tri(roots[i + 1], tips[i + 1], mid, [1, i + 1, 0], [1, i + 1, 1], [1, i + 0.5, 0.88]);
    }
  }
  { // the dorsal ridge: low soft spines along the back, rising behind the head and falling away toward the wrist
    const s0 = 0.17, s1 = 0.62, N = 22;
    for (let i = 0; i < N; i++) {
      const u0 = i / N, u1 = (i + 1) / N, sa = lerp(s0, s1, u0), sb = lerp(s0, s1, u1);
      const ba = V3(flankPoint(sa, 0.97, D, [])), bb = V3(flankPoint(sb, 0.97, D, []));
      ba.z = bb.z = 0;
      const h = (u) => hg * 0.34 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.25)), 0.8) * (u > 0.8 ? 1 - (u - 0.8) * 2.5 : 1);
      const ta = ba.clone().add(new THREE.Vector3(-0.35, h(u0), 0)), tb = bb.clone().add(new THREE.Vector3(-0.35, h(u1) * 0.82, 0));   // each spine stands a little proud of the membrane behind it
      tri(ba, bb, tb, [2, i, 0], [2, i + 1, 0], [2, i + 0.92, 0.82]);
      tri(ba, tb, ta, [2, i, 0], [2, i + 0.92, 0.82], [2, i, 1]);
    }
  }
  const fins = new THREE.BufferGeometry();
  fins.setAttribute('position', new THREE.Float32BufferAttribute(fp, 3));
  fins.setAttribute('normal', new THREE.Float32BufferAttribute(new Array(fp.length).fill(0).map((_, k) => (k % 3 === 2 ? 1 : 0)), 3));
  fins.setAttribute('aFin', new THREE.Float32BufferAttribute(fa, 3));
  const bodyGeo = mergeGeos([shell, fins]);   // (body first, then the fins: the fin over the flank blends after it in the one draw)
  shell.dispose(); fins.dispose();

  const uniforms = {
    uPale: { value: new THREE.Color(colors.flank ?? 0xd6d6e4) }, uShade: { value: new THREE.Color(colors.flankShade ?? 0x433e74) },
    uInk: { value: new THREE.Color(colors.ink ?? 0x0a0c19) }, uEmberCol: { value: new THREE.Color(colors.ember ?? 0xe8862e) },
    uEmber: { value: new THREE.Vector4(0, 0, 0, 0) }, uAlpha: { value: 1 }, uLight: { value: new THREE.Vector3(-0.18, 0.9, 0.4).normalize() },
    uMurk: { value: new THREE.Vector2(0.2, 0.1) },   // x: where along the body (from the nose, as a fraction) the dark starts to close, y: how fast across the depth
    uSink: { value: 0 },                              // 0 … 1: the dark takes the whole body as it leaves (the glow inside is added after it)
    uHalf: { value: new THREE.Vector2(length / 2, hg) },
    uT: { value: 0 },                                 // the film's time: the body's wave, the fin's sculling, the gill's breath
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      attribute vec3 aFin;
      uniform vec2 uHalf; uniform float uT;
      varying vec3 vN; varying vec3 vLocal; varying vec3 vFin;
      void main() {
        vLocal = position; vFin = aFin;
        vec3 p = position, n = normal;
        float s = ( uHalf.x - p.x ) / ( 2.0 * uHalf.x );
        // a slow wave down the body (the head is rigid; it grows toward the tail): mostly across, a little up and down
        float ph = 6.2832 * 1.1 * s - uT * 1.9;
        float amp = 0.05 * uHalf.y * ( 0.35 + 2.0 * s * s ) * smoothstep( 0.08, 0.22, s );
        p.z += amp * sin( ph ); p.y += 0.45 * amp * sin( ph + 1.3 );
        float slope = - amp * 6.9 * cos( ph ) / ( 2.0 * uHalf.x );
        n = normalize( vec3( n.x - slope * n.z, n.y, n.z + slope * n.x ) );
        // the pectoral fin sculls about its root; the dorsal ridge stirs
        if ( aFin.x > 0.5 && aFin.x < 1.5 ) { float w = aFin.z * aFin.z; p.z += w * 0.45 * sin( uT * 2.6 + aFin.y * 0.35 ); p.y += w * 0.18 * sin( uT * 2.6 + 0.9 + aFin.y * 0.35 ); }
        else if ( aFin.x > 1.5 && aFin.x < 2.5 ) p.x += aFin.z * 0.12 * sin( uT * 1.7 + aFin.y * 0.5 );
        vN = normalMatrix * n;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uPale; uniform vec3 uShade; uniform vec3 uInk; uniform vec3 uEmberCol; uniform vec4 uEmber; uniform float uAlpha;
      uniform vec3 uLight; uniform vec2 uMurk; uniform vec2 uHalf; uniform float uSink; uniform float uT;
      varying vec3 vN; varying vec3 vLocal; varying vec3 vFin;
      float hash( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 ); }
      float vnoise( vec2 p ) {
        vec2 i = floor( p ), f = fract( p ); f = f * f * ( 3.0 - 2.0 * f );
        return mix( mix( hash( i ), hash( i + vec2( 1.0, 0.0 ) ), f.x ), mix( hash( i + vec2( 0.0, 1.0 ) ), hash( i + 1.0 ), f.x ), f.y );
      }
      void main() {
        vec3 n = normalize( vN );
        float s = ( uHalf.x - vLocal.x ) / ( 2.0 * uHalf.x );     // 0 at the nose … 1 at the root of the tail
        float v = vLocal.y / uHalf.y;                               // height, in half-girths
        vec3 col; float a = uAlpha;
        // the ember, inside: its glow comes through the belly (and, wider and softer, through the whole flank around it)
        vec3 e = vLocal - uEmber.xyz; e.z *= 0.25;
        float g = exp( - dot( e, e ) / ( uHalf.y * uHalf.y * 0.11 ) ), g2 = exp( - dot( e, e ) / ( uHalf.y * uHalf.y * 0.7 ) );
        vec3 glow = uEmberCol * ( ( g * 0.5 + g * g * g * 0.7 ) * uEmber.w ) + mix( uEmberCol, vec3( 0.9, 0.45, 0.6 ), 0.4 ) * ( g2 * 0.16 * uEmber.w );
        if ( vFin.x > 0.5 ) {
          // a fin: a thin membrane between pale rays, clearer toward its edge; the ember lights it from inside the body
          float d = abs( fract( vFin.y + 0.5 ) - 0.5 );
          float ray = 1.0 - smoothstep( 0.05, 0.14, d );
          col = mix( mix( uShade, uPale, 0.35 ) * 0.13, mix( uShade, uPale, 0.7 ) * 0.2, ray * 0.8 );
          a *= ( 0.5 + 0.3 * ray ) * ( 1.0 - 0.55 * smoothstep( 0.45, 1.0, vFin.z ) );
          glow *= 0.45 * ( 1.0 - uSink );
        } else {
          float ndl = dot( n, uLight ) * 0.5 + 0.5;
          // flat bands with narrow soft edges (the game's toon ramp): belly, lower flank, flank, back. Pale stone seen through
          // dark water: the back is a moonlit grey-lavender, never white, and the belly goes to violet dusk
          col = uShade * 0.26;
          col = mix( col, mix( uShade, uPale, 0.3 ) * 0.2, smoothstep( 0.3, 0.335, ndl ) );
          col = mix( col, mix( uShade, uPale, 0.66 ) * 0.2, smoothstep( 0.52, 0.55, ndl ) );
          col = mix( col, mix( uShade, uPale, 0.9 ) * 0.29, smoothstep( 0.8, 0.83, ndl ) );
          if ( vLocal.z > 0.0 ) {
            // skin: an old fish's mottle, darker and denser along the back, and large faint scales behind the gill
            float m = vnoise( vec2( s * 46.0, v * 5.5 ) ) * 0.65 + vnoise( vec2( s * 130.0, v * 15.0 ) ) * 0.35;
            col *= 1.0 - 0.22 * smoothstep( 0.5, 0.78, m ) * smoothstep( -0.35, 0.6, v );
            col *= 1.0 + 0.08 * ( vnoise( vec2( s * 18.0, v * 2.4 + 3.0 ) ) - 0.5 );
            vec2 sc = vec2( s / 0.019, v / 0.15 );
            sc.x += 0.5 * mod( floor( sc.y ), 2.0 );
            vec2 f = fract( sc ) - vec2( 0.0, 0.5 );
            float nz = vnoise( sc * 0.7 + 7.0 );
            float edge = smoothstep( 0.05, 0.0, abs( length( f * vec2( 1.0, 0.85 ) ) - 0.62 + 0.1 * ( nz - 0.5 ) ) ) * smoothstep( 0.25, 0.7, vnoise( sc * 0.23 + 3.0 ) );
            col *= 1.0 - 0.06 * edge * smoothstep( 0.13, 0.2, s ) * ( 1.0 - smoothstep( 0.6, 0.9, s ) ) * smoothstep( -0.95, -0.5, v );
            // a faint silver sheen along the flank, which the body's wave moves
            col += uPale * 0.035 * exp( - pow( ( v - 0.08 ) / 0.3, 2.0 ) ) * ( 0.6 + 0.4 * n.x ) * smoothstep( 0.1, 0.18, s );
            // the mouth: one seam from the snout, back and down, thinning out; the gill: one crescent behind the eye, breathing
            float mouth = ( 1.0 - smoothstep( 0.01, 0.026, abs( v + 3.1 * s + 6.0 * s * s - 0.03 ) ) ) * ( 1.0 - smoothstep( 0.045, 0.085, s ) );
            float breath = 0.5 + 0.5 * sin( uT * 1.7 );
            float gx = s - ( 0.108 + 0.11 * ( v + 0.08 ) * ( v + 0.08 ) ) - 0.0015 * breath;
            float gill = ( 1.0 - smoothstep( 0.001, 0.0024 + 0.0018 * breath, abs( gx ) ) ) * smoothstep( -0.55, -0.3, v ) * ( 1.0 - smoothstep( 0.12, 0.34, v ) );
            float lid = smoothstep( 0.0, 0.012, - gx ) * ( 1.0 - smoothstep( 0.0, 0.03, - gx ) ) * smoothstep( -0.5, -0.2, v ) * ( 1.0 - smoothstep( 0.1, 0.3, v ) );
            // … and the side line: a row of pale-edged pores from the gill toward the tail, not a drawn stroke
            float sv = v - ( 0.05 - 0.22 * s + 0.02 * sin( s * 40.0 ) );
            float side = ( 1.0 - smoothstep( 0.006, 0.016, abs( sv ) ) ) * smoothstep( 0.118, 0.15, s ) * ( 0.45 + 0.55 * smoothstep( 0.3, 0.6, abs( fract( s * 140.0 ) - 0.5 ) * 2.0 ) );
            col = mix( col, uShade * 0.12, max( 0.7 * max( mouth, gill ), 0.3 * side ) );
            col *= 1.0 - 0.1 * lid;
          }
        }
        // the dark water: it closes over the far end of it and over what leans away from the lens by thinning it into the ink
        // (so the ink card's own gradient shows through, and no hard edge stands), and the outline itself is soft with water
        float murk = clamp( smoothstep( uMurk.x, 0.72, s ) * 0.97 + clamp( - vLocal.z * uMurk.y, 0.0, 0.5 ), 0.0, 1.0 );
        float fog = clamp( max( murk, uSink ), 0.0, 1.0 );
        col = mix( col, uInk, fog * 0.6 );
        a *= ( 1.0 - fog ) * smoothstep( 0.0, 0.16 + 0.6 * uSink, abs( n.z ) + ( vFin.x > 0.5 ? 1.0 : 0.0 ) );
        // the ember last: it outlasts the body that carries it
        col = col * a + glow * uAlpha;
        a = clamp( a + min( 1.0, dot( glow, vec3( 0.6 ) ) ) * uAlpha, 0.0, 1.0 );
        gl_FragColor = vec4( a > 0.001 ? col / a : col, a );
      }`,
    transparent: true, depthTest: true, depthWrite: true, side: THREE.FrontSide, fog: false, toneMapped: false,
  });
  const body = new THREE.Mesh(bodyGeo, mat);
  body.name = 'intro:flank'; body.renderOrder = 902; body.frustumCulled = false;

  // the eye: set into the head under a soft socket, a lavender iris round a milky pupil, one small dim glint (an old, filmy
  // eye: it sees the ember, not the lens)
  const [es, ev] = FLANK_MARKS.eye;
  const p = flankPoint(es, ev, D, []), pu = flankPoint(es, ev + 0.08, D, []), ps = flankPoint(es + 0.01, ev, D, []);
  const tu = new THREE.Vector3(pu[0] - p[0], pu[1] - p[1], pu[2] - p[2]), ts = new THREE.Vector3(ps[0] - p[0], ps[1] - p[1], ps[2] - p[2]);
  const nrm = new THREE.Vector3().crossVectors(tu, ts).normalize(); if (nrm.z < 0) nrm.negate();
  const er = girth * 0.04;
  const shade = linear(colors.flankShade ?? 0x433e74), inkC = linear(colors.ink ?? 0x0a0c19), paleC = linear(colors.flank ?? 0xd6d6e4);
  const mixc = (x, y, k, m = 1) => [lerp(x[0], y[0], k) * m, lerp(x[1], y[1], k) * m, lerp(x[2], y[2], k) * m];
  // rings from the middle out: [radius × er, rgb, alpha]
  const rings = [
    [0, mixc(inkC, shade, 0.55, 1.2), 1], [0.34, mixc(inkC, shade, 0.5, 1.15), 1],        // the pupil: deep violet under a milky film, never black
    [0.46, mixc(shade, paleC, 0.25, 0.42), 1], [0.82, mixc(shade, paleC, 0.42, 0.34), 1],   // the iris: lavender, paler toward its rim
    [0.96, mixc(shade, paleC, 0.3, 0.16), 1], [1.08, mixc(shade, inkC, 0.4, 0.2), 0.9],    // its dark rim
    [1.5, mixc(shade, paleC, 0.3, 0.14), 0],                                                 // the socket, fading into the skin
  ];
  const seg = 28, ep = [], ec = [], ei = [];
  for (const [r, c, al] of rings) for (let i = 0; i < seg; i++) { const a = (i / seg) * TAU; ep.push(Math.cos(a) * r * er, Math.sin(a) * r * er, 0); ec.push(c[0], c[1], c[2], al); }
  for (let j = 0; j < rings.length - 1; j++) for (let i = 0; i < seg; i++) { const a = j * seg + i, b = j * seg + ((i + 1) % seg), c2 = a + seg, d = b + seg; ei.push(a, d, b, a, c2, d); }   // (wound toward the lens)
  // the glint: small and dim, up and forward
  const gb = ep.length / 3, gc = linear(colors.glint ?? 0xe8be77, 0.55), gr = er * 0.12, gx = er * 0.3, gy = er * 0.3;
  ep.push(gx, gy, 0.004); ec.push(gc[0] * 1.3, gc[1] * 1.3, gc[2] * 1.4, 0.85);
  for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; ep.push(gx + Math.cos(a) * gr, gy + Math.sin(a) * gr * 0.8, 0.004); ec.push(gc[0], gc[1], gc[2] * 1.2, 0); }
  for (let i = 0; i < 10; i++) ei.push(gb, gb + 1 + i, gb + 1 + ((i + 1) % 10));
  const eyeGeo = new THREE.BufferGeometry();
  eyeGeo.setAttribute('position', new THREE.Float32BufferAttribute(ep, 3));
  eyeGeo.setAttribute('color', new THREE.Float32BufferAttribute(ec, 4));
  eyeGeo.setIndex(ei);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true, transparent: true, opacity: 1, depthTest: true, depthWrite: false, fog: false, toneMapped: false });
  const eye = new THREE.Mesh(eyeGeo, eyeMat);
  eye.name = 'intro:flank-eye'; eye.renderOrder = 902.5; eye.frustumCulled = false;
  eye.position.set(p[0] + nrm.x * 0.05, p[1] + nrm.y * 0.05, p[2] + nrm.z * 0.05);
  eye.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), nrm);

  const group = new THREE.Group(); group.name = 'intro:flank-root';
  group.add(body, eye);
  return { group, body, eye, uniforms, eyeMat, dims: D, geometries: [bodyGeo, eyeGeo], materials: [mat, eyeMat] };
}

// ------------------------------------------------------------------ the splash crown
/**
 * The contact's crown: drops thrown up and out round the lantern's foot, one Points draw, every drop's flight computed in the
 * vertex shader from its seed and uTau (seconds since the contact), so a seek shows exactly what a play does. Local frame: the
 * waterline at the lantern's foot. Pale gold, additive; it is mirrored by the lake.
 */
export function buildCrown(n = 40, color = 0xf0d49c) {
  const pos = new Float32Array(n * 3), sd = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) { sd[i * 4] = (i / n) * TAU + (seed01(i, 21) - 0.5) * 0.5; sd[i * 4 + 1] = seed01(i, 22); sd[i * 4 + 2] = seed01(i, 23); sd[i * 4 + 3] = seed01(i, 24); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(sd, 4));
  const uniforms = { uTau: { value: -1 }, uLife: { value: 1.2 }, uK: { value: 0 }, uReach: { value: new THREE.Vector2(2.5, 7) }, uHeight: { value: new THREE.Vector2(3.5, 8) },
    uR0: { value: 2.2 }, uScale: { value: 600 }, uColor: { value: new THREE.Color(color) } };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      attribute vec4 aSeed;
      uniform float uTau, uLife, uK, uR0, uScale; uniform vec2 uReach, uHeight;
      varying float vA;
      void main() {
        float T = uLife * ( 0.65 + 0.35 * aSeed.w ), u = uTau / T;
        // most drops fly out low and wide; the ones that go out least go highest (a crown round a thrown-up column)
        float reach = mix( uReach.x, uReach.y, aSeed.y ), h = mix( uHeight.x, uHeight.y, ( 1.0 - aSeed.y ) * 0.7 + aSeed.z * 0.3 );
        float r = uR0 * ( 0.6 + 0.4 * aSeed.z ) + reach * u;
        vec3 p = vec3( cos( aSeed.x ) * r, 4.0 * h * u * ( 1.0 - u ), sin( aSeed.x ) * r );
        vA = uK * step( 0.0, u ) * ( 1.0 - smoothstep( 0.7, 1.0, u ) ) * ( 0.55 + 0.45 * aSeed.z );
        vec4 mv = modelViewMatrix * vec4( p, 1.0 );
        gl_PointSize = clamp( uScale * ( 0.5 + 0.5 * aSeed.w ) / max( 1.0, - mv.z ), 2.0, 28.0 );
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor;
      varying float vA;
      void main() {
        float d = length( gl_PointCoord - 0.5 ) * 2.0, a = ( 1.0 - smoothstep( 0.2, 1.0, d ) ) * vA;
        if ( a < 0.004 ) discard;
        gl_FragColor = vec4( uColor * a, 1.0 );
      }`,
    transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending, fog: false, toneMapped: false,
  });
  const points = new THREE.Points(geo, mat);
  points.name = 'intro:splash-crown'; points.frustumCulled = false; points.renderOrder = 3; points.visible = false;
  points.layers.enable(REFLECT_LAYER);
  return { points, uniforms, geometries: [geo], materials: [mat] };
}

// ------------------------------------------------------------------ the Wick's line and float
/**
 * Fishing, in the last shots: {float (a small two-tone float, mirrored), light (its small pale light, mirrored), line (from the
 * rod's tip to the float, `LINE_PTS` points the stage lays each frame), ring (one slow ripple round the float)}. Rest pose: the
 * float's foot at its local origin; the stage places everything in world space.
 */
export const LINE_PTS = 18;
export function buildFloat(colors = {}) {
  const top = new THREE.SphereGeometry(0.075, 10, 6, 0, TAU, 0, Math.PI / 2).translate(0, 0.17, 0);
  const band = new THREE.CylinderGeometry(0.075, 0.07, 0.07, 10, 1).translate(0, 0.135, 0);
  const body = new THREE.CylinderGeometry(0.07, 0.03, 0.2, 10, 1).translate(0, 0.0, 0);
  const stalk = new THREE.CylinderGeometry(0.012, 0.012, 0.12, 5, 1).translate(0, 0.27, 0);
  paint(top, () => new THREE.Color(...linear(colors.flank ?? 0xd6d6e4, 0.75)));
  paint(band, () => new THREE.Color(...linear(colors.flankShade ?? 0x433e74, 0.9)));
  paint(body, () => new THREE.Color(...linear(colors.iron ?? 0x0a0818, 1.6)));
  paint(stalk, () => new THREE.Color(...linear(colors.flank ?? 0xd6d6e4, 0.6)));
  const geo = mergeGeos([top, band, body, stalk].map((g) => { g.deleteAttribute('uv'); g.deleteAttribute('normal'); return g; }));
  [top, band, body, stalk].forEach((g) => g.dispose());
  const fmat = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true, transparent: true, opacity: 1, fog: true });
  const float = new THREE.Mesh(geo, fmat);
  float.name = 'intro:float'; float.frustumCulled = false; float.visible = false; float.layers.enable(REFLECT_LAYER);
  const light = glowSprite({ color: colors.floatLight ?? 0xe6e0f6, size: 1, opacity: 0.7 });
  light.name = 'intro:float-light'; light.frustumCulled = false; light.visible = false; light.renderOrder = 4; light.layers.enable(REFLECT_LAYER);
  const lgeo = new THREE.BufferGeometry();
  lgeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(LINE_PTS * 3), 3).setUsage(THREE.DynamicDrawUsage));
  const lmat = new THREE.LineBasicMaterial({ color: colors.line ?? 0xc9c4e6, transparent: true, opacity: 0.6, fog: true });
  const line = new THREE.Line(lgeo, lmat);
  line.name = 'intro:line'; line.frustumCulled = false; line.visible = false;
  const ring = buildRing(colors.floatRing ?? 0xcfc8ee);
  ring.mesh.name = 'intro:float-ring'; ring.mesh.visible = false;
  return { float, light, line, ring: ring.mesh, geometries: [geo, lgeo, ...ring.geometries], materials: [fmat, light.material, lmat, ...ring.materials] };
}

// ------------------------------------------------------------------ sparks
/** A pale-gold spark (one sprite of the shared glow texture), drawn over everything of the film's. */
export function buildSpark(color = 0xffd9a0, name = 'intro:spark') {
  const s = glowSprite({ color, size: 1, opacity: 1, falloff: 2.2 });
  s.material.depthTest = false; s.name = name; s.renderOrder = 905; s.frustumCulled = false; s.visible = false;
  return { sprite: s, materials: [s.material], geometries: [] };
}
