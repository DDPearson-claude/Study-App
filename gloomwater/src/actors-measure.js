// actors-measure.js — the knotted cord of the measuring ceremony (DESIGN §25.6.8, CONTRACT §13.7 actors showCord).
//
// One thin hemp cord, laid along the fish's flank from the snout (through a small brass ring) to the tail tip, unrolled by
// a single uniform: every vertex past the cord's head folds onto the head, and the whipped, frayed end rides it, so `k`
// (0 → 1) lays the cord knot by knot along the fish. Knots fall every 2 cm … 1 m (models-size cordKnots: ≤ 10 knots):
// small overhand lumps with a crossing wrap, the "great knots" a little bigger with an oxblood whipping beside them, the way
// a sounding line is marked. The strand is a three-strand lay drawn per pixel (helical grooves, so it reads as twisted
// rope at any tessellation), it bows off the skin in a soft arch (on the skin mid-body, close to the snout and the tail
// fork) and sags a little under its own weight where gravity crosses it (a fish held level: the cord dips toward the belly;
// a hanging fish: taut). Its thickness follows the ceremony camera's distance (≈ constant, thin, on screen). A warm glint
// rides the head and flares at each knot, and a couple of embers rise from every knot as it is laid.
// Cost while shown: the cord, its ink outline and the glint (3 calls).
import * as THREE from 'three';
import { glowSprite } from './toon.js';
import { deformToon, deformOutline, outlineMesh, mergeGeos, attr } from './models-kit.js';
import { cordKnots } from './models-size.js';

const HEMP = new THREE.Color(0xd9c49a), KNOT = new THREE.Color(0xc4a878), KNOT_GREAT = new THREE.Color(0xa88a5e), WRAP = new THREE.Color(0x9a7c52);
const TAG = 0x7a2e2a, WHIP = 0x4a2622, BRASS = 0xb48c4c, GLINT = 0xffc87a;
const LAY = 10.5;   // lay length (one full turn of a strand) in cord radii: a ≈ 30° rope lay

// d(u): how far the cord sits off the fish's axis toward the camera (× halfW), ≈ 0 at the snout and the tail fork
const ARCH_GLSL = /* glsl */`
float gwArch(float u) { return pow(max(sin(3.14159265 * clamp(u / 0.94, 0.0, 1.0)), 0.0), 0.6); }
float gwSagK(float u) { return sin(3.14159265 * clamp(u, 0.0, 1.0)); }`;
const CORD_PARS = /* glsl */`
attribute float aU; attribute float aBead; attribute vec3 aLay;
uniform float uHead; uniform float uLen; uniform float uHalfW; uniform float uR; uniform vec2 uSag;
varying vec3 vCordLay;
${ARCH_GLSL}
vec3 gwCordAt(float x) {
  float u = x / max(uLen, 1e-4), s = gwSagK(u);
  return vec3(x, uSag.x * s, uHalfW * gwArch(u) + 1.25 * uR + uSag.y * s);
}
void gwDeform(inout vec3 p, inout vec3 n) {
  vCordLay = aLay;
  vec3 head = gwCordAt(uHead);
  if (aBead > 0.5) { p += head; return; }
  if (aU > uHead + 1e-5) { p = head; n = vec3(0.0, 1.0, 0.0); return; }
  float s = gwSagK(max(aU, 0.0) / max(uLen, 1e-4));
  p.y += uSag.x * s; p.z += uSag.y * s;
}`;
// the lay, per pixel: three strands winding along the cord, a dark groove between them and a soft highlight across each
const LAY_FRAG = /* glsl */`
{
  float gwPh = fract(vCordLay.x * 3.0 - vCordLay.y * 3.0 / ${LAY.toFixed(1)});
  float gwBody = smoothstep(0.0, 0.2, gwPh) * (1.0 - smoothstep(0.78, 1.0, gwPh));
  float gwShade = mix(0.52, 1.0, gwBody) * (0.9 + 0.12 * sin(gwPh * 3.14159265));
  diffuseColor.rgb *= mix(1.0, gwShade, vCordLay.z);
}`;
const archJS = (u) => Math.pow(Math.max(Math.sin(Math.PI * Math.min(1, Math.max(0, u / 0.94))), 0), 0.6);
const sagJS = (u) => Math.sin(Math.PI * Math.min(1, Math.max(0, u)));

/** Cord radius (m) for a fish of length L: thin and ≈ constant on screen at the trophy camera's clamp(1.2 + 1.6L, 1.6, 16) m. */
export function cordRadius(L) { return 0.003 * Math.min(16, Math.max(1.6, 1.2 + 1.6 * L)) / 1.6; }

export function createCord(ctx) {
  const U = { uHead: { value: 0 }, uLen: { value: 1 }, uHalfW: { value: 0.02 }, uR: { value: 0.003 }, uSag: { value: new THREE.Vector2() } };
  const spec = { key: 'gwCord2', uniforms: U, pars: CORD_PARS };
  const mat = deformToon({ color: 0xffffff, vertexColors: true, rim: 0.4, rimPower: 0.55, rimColor: 0xffd9a8 }, spec);
  { // chain the per-pixel lay onto the toon shader (after the vertex colours are applied)
    const prev = mat.onBeforeCompile;
    mat.onBeforeCompile = (shader, renderer) => {
      prev.call(mat, shader, renderer);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vCordLay;')
        .replace('#include <color_fragment>', `#include <color_fragment>\n${LAY_FRAG}`);
    };
    const base = mat.customProgramCacheKey;
    mat.customProgramCacheKey = () => base.call(mat) + '|lay';
  }
  const outlineMat = deformOutline({ thickness: 0.003 }, spec);
  const group = new THREE.Group(); group.name = 'measureCord'; group.visible = false;
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat); mesh.name = 'cord';
  const outline = outlineMesh(new THREE.BufferGeometry(), outlineMat);
  mesh.add(outline); group.add(mesh);
  const glint = glowSprite({ color: GLINT, size: 0.1, opacity: 0 }); glint.renderOrder = 6; group.add(glint);
  const st = { L: 0, halfW: 0, r: 0, knots: [], k: 0, shown: 0, lastKnot: -1, flare: 0, t: 0, sagA: 0 };
  const tmp = new THREE.Vector3();

  function build(L, halfW) {
    const r = cordRadius(L);
    st.L = L; st.halfW = halfW; st.r = r;
    st.sagA = Math.min(0.09, Math.max(0.002, L * 0.024));
    const parts = [];
    const depth = (u) => halfW * archJS(u) + 1.25 * r;
    // the strand: a thin tube bent into the arch; aLay = (angle around / 2π, distance along in radii, 1) for the lay
    const seg = Math.max(32, Math.min(320, Math.ceil(L / (r * 3)))), rad = 7;
    const pos = [], col = [], au = [], lay = [], idx = [];
    for (let i = 0; i <= seg; i++) {
      const u = i / seg, x = u * L, z = depth(u);
      for (let j = 0; j <= rad; j++) {
        const a = (j / rad) * Math.PI * 2;
        pos.push(x, Math.cos(a) * r, z + Math.sin(a) * r);
        col.push(HEMP.r, HEMP.g, HEMP.b);
        au.push(x); lay.push(j / rad, x / r, 1);
      }
    }
    for (let i = 0; i < seg; i++) for (let j = 0; j < rad; j++) {
      const a = i * (rad + 1) + j, b = a + rad + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const strand = new THREE.BufferGeometry();
    strand.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    strand.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    strand.setAttribute('aU', new THREE.Float32BufferAttribute(au, 1));
    strand.setAttribute('aLay', new THREE.Float32BufferAttribute(lay, 3));
    strand.setIndex(idx); strand.computeVertexNormals();
    parts.push(strand);
    const at = (g, x, bead = 0) => { attr(g, 'aU', 1, () => x); attr(g, 'aBead', 1, () => bead); return g; };
    // knots: a small overhand lump (elongated along the cord) with a crossing wrap over it; the great knots a little
    // bigger and darker, with an oxblood whipping just past them
    const plan = cordKnots(L);
    st.knots = plan.knots.map((k) => ({ ...k }));
    for (const k of plan.knots) {
      const s = k.great ? 1.95 : 1.6, z = depth(k.u);
      const core = new THREE.SphereGeometry(r, 8, 6); core.scale(s * 1.25, s, s); core.translate(k.at, 0, z);
      paintCol(core, k.great ? KNOT_GREAT : KNOT); parts.push(at(core, k.at));
      const wrap = new THREE.TorusGeometry(r * s * 0.86, r * 0.36, 4, 10);
      wrap.rotateY(Math.PI / 2 - 0.95); wrap.rotateX(0.35); wrap.translate(k.at, 0, z);
      paintCol(wrap, WRAP); parts.push(at(wrap, k.at));
      if (k.great) {
        const bx = Math.min(L, k.at + r * 4.2);
        const t = new THREE.CylinderGeometry(r * 1.2, r * 1.2, r * 2.6, 8, 1); t.rotateZ(Math.PI / 2); t.translate(bx, 0, depth(bx / L));
        paintCol(t, new THREE.Color(TAG)); parts.push(at(t, bx));
      }
    }
    // a small brass ring at the snout (always shown) the cord runs through
    const ring = new THREE.TorusGeometry(r * 2.2, r * 0.5, 5, 14); ring.rotateY(Math.PI / 2); ring.translate(0, 0, depth(0));
    paintCol(ring, new THREE.Color(BRASS)); parts.push(at(ring, -1));
    // the end rides the head: a dark whipping and a little frayed tuft of loose fibres beyond it
    const whip = new THREE.CylinderGeometry(r * 1.12, r * 1.12, r * 3.0, 8, 1); whip.rotateZ(Math.PI / 2); whip.translate(-r * 1.6, 0, 0);
    paintCol(whip, new THREE.Color(WHIP)); parts.push(at(whip, -1, 1));
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.4, spread = 0.38 + (i % 2) * 0.16;
      const f = new THREE.ConeGeometry(r * 0.42, r * (2.2 + (i % 3) * 0.5), 4, 1);
      f.translate(0, r * (1.1 + (i % 3) * 0.25), 0); f.rotateZ(-Math.PI / 2 + spread * Math.cos(a)); f.rotateY(spread * Math.sin(a));
      paintCol(f, HEMP); parts.push(at(f, -1, 1));
    }
    const geo = mergeGeos(parts);
    mesh.geometry.dispose(); mesh.geometry = geo; outline.geometry = geo;
    outlineMat.userData.thick.value = r * 0.5;
    U.uLen.value = L; U.uHalfW.value = halfW; U.uR.value = r;
    glint.scale.setScalar(r * 22);
    st.lastKnot = -1;
  }
  function paintCol(g, c) {
    const n = g.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  }
  const local = (u) => {   // a point u (0 → 1) along the laid cord, cord-local
    const s = sagJS(u);
    return tmp.set(u * st.L, U.uSag.value.x * s, st.halfW * archJS(u) + 1.25 * st.r + U.uSag.value.y * s);
  };

  return {
    group, mesh, mats: [mat, outlineMat, glint.material],
    get length() { return st.L; },
    get k() { return st.k; },
    get visible() { return group.visible; },
    /** Size the cord for a fish of L metres and flank half-width halfW (rebuilds only when either changes). */
    ensure(L, halfW = 0.03) {
      if (!(L > 0)) return;
      const hw = Math.max(0, halfW);
      if (Math.abs(L - st.L) > st.L * 0.01 || Math.abs(hw - st.halfW) > Math.max(1e-3, st.halfW * 0.05)) build(L, hw);
    },
    /** World pose of the cord: start at `origin` (the snout line), local +X toward the tail, +Y the fish's back, +Z toward
     *  the camera (off the flank). Gravity crossing the cord gives its soft sag (never into the fish). */
    place(origin, xAxis, yAxis, zAxis, sagScale = 1) {
      const m = group.matrix;
      m.makeBasis(xAxis, yAxis, zAxis); m.setPosition(origin);
      group.matrixAutoUpdate = false; group.matrixWorldNeedsUpdate = true;
      const a = st.sagA * Math.max(0, sagScale);
      U.uSag.value.set(-yAxis.y * a, Math.max(0, -zAxis.y) * a * 0.5);
    },
    /** Unroll to k (0 → 1) this frame; `show` false fades it away. Returns knots newly passed (for embers / chimes). */
    update(dt, { k = 0, show = false } = {}) {
      st.t += dt;
      st.shown = THREE.MathUtils.damp(st.shown, show ? 1 : 0, show ? 30 : 9, dt);
      group.visible = st.shown > 0.02 && st.L > 0;
      if (!group.visible) { st.k = 0; st.lastKnot = -1; glint.material.opacity = 0; return []; }
      const kk = Math.min(1, Math.max(0, k));
      st.k = kk;
      U.uHead.value = kk * st.L * Math.min(1, st.shown * 1.4);
      // knots passed since the last frame
      const passed = [];
      for (let i = st.lastKnot + 1; i < st.knots.length; i++) { if (st.knots[i].at <= U.uHead.value) { passed.push(st.knots[i]); st.lastKnot = i; } else break; }
      if (passed.length) st.flare = Math.min(1.6, st.flare + (passed.some((p) => p.great) ? 1.3 : 0.8));
      st.flare = Math.max(0, st.flare - dt * 3.2);
      const laying = kk > 0.001 && kk < 0.999;
      glint.position.copy(local(st.L > 0 ? U.uHead.value / st.L : 0));
      glint.material.opacity = st.shown * ((laying ? 0.4 : kk >= 0.999 ? 0.14 + 0.07 * Math.sin(st.t * 2.3) : 0) + st.flare * 0.42);
      glint.scale.setScalar(st.r * (20 + st.flare * 14));
      return passed;
    },
    /** World position of a point u (0 → 1) along the laid cord. */
    pointAt(u, out = new THREE.Vector3()) {
      group.updateMatrixWorld();
      return out.copy(local(u)).applyMatrix4(group.matrixWorld);
    },
    get radius() { return st.r; },
    dispose() { mesh.geometry.dispose(); mat.dispose(); outlineMat.dispose(); glint.material.dispose(); },
  };
}
