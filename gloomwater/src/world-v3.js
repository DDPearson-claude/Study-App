// world-v3.js — the world's v3 Phase-1 pieces (W1: DESIGN §25.5.2, §25.6.1, §25.14.2; CONTRACT §13.7 world) (world author).
//
//   watchLampsFor(zone, layout, opts)  the lake's two watch-lamps [{id, name, position, x, z, radius, lit, dock, kind}]: the
//                                      Mossmere's dock buoy-lamps (MOSSMERE_V3.watchLamps), RAFT_FALLBACK_V3's for §24's lakes
//                                      in builds without §24 (both on ZONES[].arena.watchLamps), or §24 sister-candles flagged
//                                      `watch` (arena.lamps). A buoy-lamp is snapped onto the buoy world-layout actually draws.
//   giantSpotsFor(zone)                the stopgap's holdsGiants water [{id, kind, x, z, r}] (ZONES[].arena.giantSpots)
//   buildWorldV3(ctx, L, arena, opts)  the v3 visuals: a faint candle-amber pool (r 6) on the water under each watch-lamp, the
//                                      lamps as warm accent anchors, and the legend pool's low gold glimmer (the tall golden
//                                      column is cut: a few motes hovering just above the still water, a low gold breath and
//                                      a faint beacon halo). Two to three draw calls; built only from v3 data, so a flag-off
//                                      build never creates any of it.
//
// No gameplay state lives here: world.js feeds update() with what it reads (night mode, phase, the lamp-watch, the legend
// pool's state from fishing) and the visuals follow. Colours stay in the Starlit warm band (candle amber, pale gold) against
// the indigo night (DESIGN §19.1); nothing here draws a ring around the raft.
import * as THREE from 'three';

const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const isPt = (o) => !!o && Number.isFinite(o.x) && Number.isFinite(o.z);

/** The lake's watch-lamps (2 per lake in every v3 build). `lit` is refreshed by the caller for §24 candles. */
export function watchLampsFor(zone, L, { radius = 6 } = {}) {
  const A = zone?.arena || {};
  const out = [];
  const docks = Array.isArray(L?.docks) ? L.docks : [];
  for (const l of Array.isArray(A.watchLamps) ? A.watchLamps : []) {
    if (!isPt(l)) continue;
    // the buoy world-layout draws for that dock (dock + buoy offset); the data is authored on the same layout (≤ 0.1 m)
    let x = l.x, z = l.z, dock = null;
    const cand = Number.isInteger(l.dock) && docks[l.dock]?.buoy ? [l.dock] : docks.map((_, i) => i);
    let best = 1.0;
    for (const i of cand) {
      const b = docks[i]?.buoy;
      if (!b) continue;
      const d = Math.hypot(b.x - l.x, b.z - l.z);
      if (d <= best) { best = d; dock = i; x = b.x; z = b.z; }
    }
    out.push({ id: l.id ?? `lamp${out.length}`, name: l.name ?? 'Buoy-Lamp', x, z, position: new THREE.Vector3(x, 0, z), radius: num(l.radius, radius), lit: true, dock, kind: 'buoy' });
  }
  // §24's sister-candles flagged `watch` (walking builds): a pool only while lit (the caller refreshes `lit`)
  for (const l of Array.isArray(A.lamps) ? A.lamps : []) {
    if (!l?.watch || !isPt(l) || out.some((o) => o.id === l.id)) continue;
    out.push({ id: l.id, name: l.name ?? null, x: l.x, z: l.z, position: new THREE.Vector3(l.x, 0, l.z), radius: num(l.radius, radius), lit: l.lit === true, dock: null, kind: 'candle' });
  }
  return out;
}

/** The stopgap giant water of a lake whose places are not in the build (3 per lake), as copies. */
export function giantSpotsFor(zone) {
  const G = zone?.arena?.giantSpots;
  if (!Array.isArray(G)) return [];
  return G.filter(isPt).map((g) => ({ id: g.id, kind: g.kind || (Array.isArray(g.r) ? 'ring' : 'disc'), x: g.x, z: g.z, r: Array.isArray(g.r) ? g.r.slice() : num(g.r, 6) }));
}

// ------------------------------------------------------------------ shaders
const NOISE = /* glsl */`
float wvH(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float wvN(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(wvH(i), wvH(i + vec2(1.0, 0.0)), f.x), mix(wvH(i + vec2(0.0, 1.0)), wvH(i + vec2(1.0, 1.0)), f.x), f.y); }
`;

// a lamp's pool: warm lamplight laid on the water, brightest under the lamp and lapping outward; at the pool's edge (r 6)
// the light breaks into a few glints on the ripples, so the safe water reads without a drawn ring
const POOL_VS = /* glsl */`
attribute vec4 aC;      // x, y, z, radius
attribute vec2 aK;      // strength, seed
uniform float uFogD;
varying vec2 vP; varying float vK; varying float vSeed; varying float vFog;
void main() {
  vP = position.xz; vK = aK.x; vSeed = aK.y;
  vec4 wp = vec4(aC.xyz + vec3(position.x, 0.0, position.z) * aC.w, 1.0);
  vec4 mv = viewMatrix * wp;
  float d = -mv.z;
  vFog = exp(-uFogD * uFogD * d * d * 0.5);
  gl_Position = projectionMatrix * mv;
}`;
const POOL_FS = /* glsl */`
uniform vec3 uCore; uniform vec3 uEdge; uniform float uTime;
varying vec2 vP; varying float vK; varying float vSeed; varying float vFog;
${NOISE}
void main() {
  float d = length(vP);
  if (d > 1.0 || vK < 0.002) discard;
  float wash = pow(1.0 - d, 1.5);
  // lamplight on a gentle swell: a soft round pool that breathes with slow, faint patches (no bands, no blotches)
  float n = wvN(vP * 1.7 + vec2(uTime * 0.09, -uTime * 0.07) + vSeed) * 0.65 + wvN(vP * 4.2 - vec2(uTime * 0.13, uTime * 0.05) + vSeed * 3.0) * 0.35;
  float lap = 0.84 + 0.2 * n;
  // the pool's edge (r 6): sparse glints catching the ripples, so the safe water reads with no drawn ring
  float ang = atan(vP.y, vP.x);
  float band = exp(-pow((d - 0.9) / 0.075, 2.0));
  float arcs = smoothstep(0.45, 0.85, wvN(vec2(ang * 9.0 + vSeed * 13.0, uTime * 0.2 + d * 3.0)));
  float sparkle = smoothstep(0.66, 1.0, wvN(vP * 19.0 + vec2(uTime * 0.7, -uTime * 0.25)));
  float glints = band * arcs * (0.25 + 1.1 * sparkle);
  float a = (wash * 0.6 * lap + glints * 0.3) * vK * vFog;
  if (a < 0.003) discard;
  gl_FragColor = vec4(mix(uEdge, uCore, clamp(wash * 1.4, 0.0, 1.0)), a);
}`;

// the legend pool's low glimmer: motes hovering just above the still water, each rising a little and reborn low (never
// higher than ≈ 1.3 m: a glimmer, not a column), twinkling pale gold to candle amber
const MOTE_VS = /* glsl */`
attribute vec4 aOrb;    // radius fraction, lift, speed, phase
uniform vec3 uCenter; uniform float uR; uniform float uTime; uniform float uK; uniform float uViewH; uniform float uFogD;
varying float vA; varying float vTint;
void main() {
  float ang = aOrb.w + uTime * aOrb.z * 0.35;
  float rr = uR * aOrb.x * (0.9 + 0.1 * sin(uTime * 0.37 + aOrb.w * 3.0));
  float life = fract(uTime * 0.06 * (0.7 + aOrb.z) + aOrb.w * 0.1591);
  vec3 p = uCenter + vec3(cos(ang) * rr, 0.1 + life * aOrb.y, sin(ang) * rr);
  vec4 mv = viewMatrix * vec4(p, 1.0);
  float z = max(0.2, -mv.z);
  float tw = 0.55 + 0.45 * sin(uTime * (1.3 + aOrb.z * 2.1) + aOrb.w * 17.0);
  vA = sin(life * 3.14159) * tw * uK * exp(-uFogD * uFogD * z * z * 0.4) * smoothstep(0.6, 2.5, z);
  vTint = fract(aOrb.w * 0.731);
  gl_PointSize = min(56.0, (0.24 + 0.12 * tw) * projectionMatrix[1][1] * uViewH * 0.5 / z);
  gl_Position = projectionMatrix * mv;
}`;
const MOTE_FS = /* glsl */`
uniform vec3 uGold; uniform vec3 uAmber;
varying float vA; varying float vTint;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = (pow(max(0.0, 1.0 - d), 2.0) + exp(-d * d * 22.0) * 0.7) * vA;
  if (a < 0.004) discard;
  gl_FragColor = vec4(mix(uGold, uAmber, vTint * 0.6), a);
}`;
// a low gold breath on the still water of the legend pool (the ring itself is fishing-fx's)
const BREATH_FS = /* glsl */`
uniform vec3 uGold; uniform float uTime; uniform float uK;
varying vec2 vUv;
${NOISE}
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float d = length(p);
  if (d > 1.0) discard;
  float breath = 0.65 + 0.35 * sin(uTime * 0.8);
  float shimmer = 0.75 + 0.25 * wvN(p * 5.0 + vec2(uTime * 0.2, uTime * 0.13));
  float a = (pow(1.0 - d, 2.0) * 0.42 + pow(1.0 - d, 6.0) * 0.25) * breath * shimmer * uK;
  if (a < 0.003) discard;
  gl_FragColor = vec4(uGold, a);
}`;
const BREATH_VS = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const lin = (hex, k = 1) => new THREE.Color(hex).multiplyScalar(k);
const mixHex = (a, b, t) => new THREE.Color(a).lerp(new THREE.Color(b), t).getHex();
// tiny local PRNG: the visuals never touch Math.random (seeded tests stay stable)
function rngOf(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/**
 * Build the v3 visuals for one lake. opts: { lamps (watchLampsFor), legend: {x, z, r} | null, pal (zone palette), quality }.
 * arena: buildArena's result (anchors, halos, dockBuoys are shared with it).
 */
export function buildWorldV3(ctx, L, arena, { lamps = [], legend = null, pal = {}, quality = 'high' } = {}) {
  const group = new THREE.Group();
  group.name = 'world:v3';
  const geos = [], mats = [];
  const low = quality === 'low';
  const candle = pal.candle ?? pal.lamp ?? 0xed9e3b;
  const light = pal.light ?? 0xd4d0f2;
  const GOLD = mixHex(0xf4d48c, candle, 0.25), AMBER = mixHex(candle, 0xffc070, 0.35);

  // ---------------------------------------------------------- watch-lamps: pools, anchors, halo colours
  const lampState = lamps.map((l, i) => ({ id: l.id, x: l.x, z: l.z, r: l.radius, dock: l.dock, kind: l.kind, k: 0, target: 0, watch: 0, anchor: null, seed: (i * 0.618 + 0.17) % 1 }));
  let poolMesh = null, aK = null;
  if (lampState.length) {
    const base = new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2);
    const geo = new THREE.InstancedBufferGeometry();
    geo.index = base.index;
    geo.setAttribute('position', base.attributes.position);
    const c = new Float32Array(lampState.length * 4), k = new Float32Array(lampState.length * 2);
    lampState.forEach((s, i) => { c.set([s.x, 0.05, s.z, s.r], i * 4); k.set([0, s.seed * 10], i * 2); });
    geo.setAttribute('aC', new THREE.InstancedBufferAttribute(c, 4));
    aK = new THREE.InstancedBufferAttribute(k, 2); aK.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('aK', aK);
    geo.instanceCount = lampState.length;
    const mat = new THREE.ShaderMaterial({
      uniforms: { uCore: { value: lin(mixHex(candle, 0xffe2a8, 0.35), 1.0) }, uEdge: { value: lin(mixHex(candle, 0xffe8c4, 0.4), 1.15) }, uTime: { value: 0 }, uFogD: { value: 0.016 } },
      vertexShader: POOL_VS, fragmentShader: POOL_FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false,
    });
    poolMesh = new THREE.Mesh(geo, mat);
    poolMesh.frustumCulled = false; poolMesh.renderOrder = 1; poolMesh.name = 'watchLampPools';
    group.add(poolMesh);
    geos.push(geo, base); mats.push(mat);
    // each lamp is a warm accent anchor: the nearest lights the raft and lays its gold thread on the water (world.js picks two)
    const lampLight = mixHex(candle, light, 0.15);
    for (const s of lampState) {
      s.anchor = { x: s.x, y: 1.1, z: s.z, color: new THREE.Color(lampLight), intensity: 0, distance: 11, boost: 1, watchLamp: s.id };
      arena.anchors.push(s.anchor);
    }
  }
  const CANDLE = lin(candle);

  // ---------------------------------------------------------- the legend pool's low gold glimmer
  let motes = null, breath = null, legendHalo = -1;
  const leg = legend && isPt(legend) ? { x: legend.x, z: legend.z, r: num(legend.r, 3.2), k: 0, target: 0 } : null;
  if (leg) {
    const n = low ? 12 : 26;
    const rnd = rngOf(0x9e3779b1 ^ Math.round(leg.x * 31 + leg.z * 17));
    const orb = new Float32Array(n * 4), pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) orb.set([0.12 + 0.95 * Math.sqrt(rnd()), 0.35 + 0.85 * rnd(), 0.3 + rnd() * 0.9, rnd() * Math.PI * 2], i * 4);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aOrb', new THREE.BufferAttribute(orb, 4));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(leg.x, 0.6, leg.z), leg.r + 3);
    const m = new THREE.ShaderMaterial({
      uniforms: { uCenter: { value: new THREE.Vector3(leg.x, 0, leg.z) }, uR: { value: leg.r * 0.95 }, uTime: { value: 0 }, uK: { value: 0 }, uViewH: { value: 720 }, uFogD: { value: 0.016 },
        uGold: { value: lin(GOLD, 2.6) }, uAmber: { value: lin(AMBER, 2.2) } },
      vertexShader: MOTE_VS, fragmentShader: MOTE_FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false,
    });
    motes = new THREE.Points(g, m);
    motes.frustumCulled = false; motes.renderOrder = 3; motes.name = 'legendGlimmer';
    group.add(motes);
    geos.push(g); mats.push(m);
    const bg = new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2);
    const bm = new THREE.ShaderMaterial({
      uniforms: { uGold: { value: lin(GOLD, 1.1) }, uTime: { value: 0 }, uK: { value: 0 } },
      vertexShader: BREATH_VS, fragmentShader: BREATH_FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false,
    });
    breath = new THREE.Mesh(bg, bm);
    breath.position.set(leg.x, 0.06, leg.z); breath.scale.setScalar(leg.r * 1.7);
    breath.frustumCulled = false; breath.renderOrder = 3; breath.name = 'legendBreath';
    group.add(breath);
    geos.push(bg); mats.push(bm);
    if (arena.halos) { legendHalo = arena.halos.add(leg.x, 0.5, leg.z, [0, 0, 0], leg.r * 1.15, 3.7); arena.halos.commit(); }
  }
  const GOLDC = lin(GOLD);

  const damp = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-rate * dt));
  const _v2 = new THREE.Vector2();

  /**
   * info: { night 0..1, glowK, fogDensity, lamps: [{k}] (per-lamp target strength, same order), legendK (target) }
   */
  function update(dt, t, info) {
    const fogD = num(info?.fogDensity, 0.016);
    if (poolMesh) {
      const u = poolMesh.material.uniforms;
      u.uTime.value = t; u.uFogD.value = fogD;
      let haloTouched = false;
      for (let i = 0; i < lampState.length; i++) {
        const s = lampState[i];
        s.target = num(info?.lamps?.[i]?.k, 0);
        s.watch = num(info?.lamps?.[i]?.watch, 0);
        s.k = damp(s.k, s.target, 1.6, dt);
        const breathe = s.watch > 0 ? 1 + 0.18 * s.watch * Math.sin(t * 1.4 + s.seed * 9) : 1;
        aK.array[i * 2] = s.k * breathe;
        s.anchor.intensity = (0.9 + 1.9 * Math.min(1.2, s.k)) * (s.k > 0.01 ? 1 : 0);
        // the buoy's halo burns candle amber (world.js leaves watch buoys to us)
        const f = s.dock != null ? arena.dockBuoys?.[s.dock] : null;
        if (f && f.halo >= 0 && arena.halos) {
          const hk = (0.55 + 0.75 * Math.min(1.3, s.k)) * breathe * (info?.moored?.[i] ? 1.25 : 1);
          arena.halos.setColor(f.halo, CANDLE.r * hk, CANDLE.g * hk, CANDLE.b * hk);
          haloTouched = true;
        }
      }
      aK.needsUpdate = true;
      if (haloTouched) arena.halos.touchColors();
    }
    if (leg) {
      leg.target = num(info?.legendK, 0);
      leg.k = damp(leg.k, leg.target, 1.2, dt);
      const mu = motes.material.uniforms;
      mu.uTime.value = t; mu.uK.value = leg.k; mu.uFogD.value = fogD;
      const r = ctx.render?.renderer;
      if (r?.getDrawingBufferSize) { r.getDrawingBufferSize(_v2); if (_v2.y) mu.uViewH.value = _v2.y; }
      motes.visible = leg.k > 0.005;
      breath.material.uniforms.uTime.value = t; breath.material.uniforms.uK.value = leg.k;
      breath.visible = leg.k > 0.005;
      if (legendHalo >= 0) {
        const hk = 0.8 * leg.k * (0.85 + 0.15 * Math.sin(t * 0.8));
        arena.halos.setColor(legendHalo, GOLDC.r * hk, GOLDC.g * hk, GOLDC.b * hk);
        arena.halos.touchColors();
      }
    }
  }

  function dispose() {
    group.parent?.remove(group);
    if (arena?.anchors) for (const s of lampState) { const i = arena.anchors.indexOf(s.anchor); if (i >= 0) arena.anchors.splice(i, 1); }
    for (const g of geos) g.dispose();
    for (const m of mats) m.dispose();
  }

  return {
    group, update, dispose,
    lamps: lampState,
    legend: leg,
    stats: () => ({ lamps: lampState.length, legend: !!leg, motes: motes ? motes.geometry.attributes.aOrb.count : 0, calls: (poolMesh ? 1 : 0) + (leg ? 2 : 0) }),
  };
}
