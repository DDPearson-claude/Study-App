// actors-measure.js — the knotted cord of the measuring ceremony (DESIGN §25.6.8, CONTRACT §13.7 actors showCord).
//
// One hemp cord, laid along the fish's flank from the snout (a brass ring) to the tail tip, unrolled by a single
// uniform: every vertex past the cord's head folds onto the head, and the ivory end bead rides it, so `k` (0 → 1)
// lays the cord knot by knot along the fish. Knots fall every 2 cm … 1 m (models-size cordKnots: ≤ 10 knots), the
// "great knots" are bigger and carry an oxblood-dyed band, the way a sounding line is marked. The cord hugs the flank (its
// depth follows a soft arch: on the skin mid-body, close to the snout and the tail fork) and is as thick as the
// ceremony camera's distance asks (≈ constant on screen). A warm glint rides the bead and flares at each knot, and a
// couple of embers rise from every knot as it is laid. Cost while shown: the cord, its ink outline and the glint.
import * as THREE from 'three';
import { glowSprite } from './toon.js';
import { deformToon, deformOutline, outlineMesh, mergeGeos, attr } from './models-kit.js';
import { cordKnots } from './models-size.js';

const HEMP = new THREE.Color(0xd8c59a), HEMP_DARK = new THREE.Color(0x9c8358), KNOT = new THREE.Color(0xb59766), KNOT_GREAT = new THREE.Color(0x8f6f45);
const TAG = 0x7a2e2a, BRASS = 0xb48c4c, BEAD = 0xece4cf, GLINT = 0xffc87a;

// d(u): how far the cord sits off the fish's axis toward the camera (× halfW), ≈ 0 at the snout and the tail fork
const ARCH_GLSL = /* glsl */`
float gwArch(float u) { return pow(max(sin(3.14159265 * clamp(u / 0.94, 0.0, 1.0)), 0.0), 0.6); }`;
const CORD_PARS = /* glsl */`
attribute float aU; attribute float aBead;
uniform float uHead; uniform float uLen; uniform float uHalfW; uniform float uR;
${ARCH_GLSL}
void gwDeform(inout vec3 p, inout vec3 n) {
  float hu = uHead / max(uLen, 1e-4);
  vec3 head = vec3(uHead, 0.0, uHalfW * gwArch(hu) + 1.25 * uR);
  if (aBead > 0.5) { p += head; return; }
  if (aU > uHead + 1e-5) { p = head; n = vec3(0.0, 1.0, 0.0); }
}`;
const archJS = (u) => Math.pow(Math.max(Math.sin(Math.PI * Math.min(1, Math.max(0, u / 0.94))), 0), 0.6);

/** Cord radius (m) for a fish of length L: ≈ constant thickness on screen at the trophy camera's clamp(1.2 + 1.6L, 1.6, 16) m. */
export function cordRadius(L) { return 0.0042 * Math.min(16, Math.max(1.6, 1.2 + 1.6 * L)) / 1.6; }

export function createCord(ctx) {
  const U = { uHead: { value: 0 }, uLen: { value: 1 }, uHalfW: { value: 0.02 }, uR: { value: 0.004 } };
  const spec = { key: 'gwCord', uniforms: U, pars: CORD_PARS };
  const mat = deformToon({ color: 0xffffff, vertexColors: true, rim: 0.42, rimPower: 0.55 }, spec);
  const outlineMat = deformOutline({ thickness: 0.004 }, spec);
  const group = new THREE.Group(); group.name = 'measureCord'; group.visible = false;
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat); mesh.name = 'cord';
  const outline = outlineMesh(new THREE.BufferGeometry(), outlineMat);
  mesh.add(outline); group.add(mesh);
  const glint = glowSprite({ color: GLINT, size: 0.1, opacity: 0 }); glint.renderOrder = 6; group.add(glint);
  const st = { L: 0, halfW: 0, r: 0, knots: [], k: 0, shown: 0, lastKnot: -1, flare: 0, t: 0 };
  const tmp = new THREE.Vector3();

  function build(L, halfW) {
    const r = cordRadius(L);
    st.L = L; st.halfW = halfW; st.r = r;
    const parts = [];
    const depth = (u) => halfW * archJS(u) + 1.25 * r;
    // the strand: a straight tube bent into the arch, with a twisted two-tone lay (hemp / shadow stripes)
    const seg = Math.max(24, Math.min(200, Math.ceil(L / (r * 2.6)))), rad = 6;
    const pos = [], col = [], au = [], idx = [];
    const c = new THREE.Color();
    for (let i = 0; i <= seg; i++) {
      const u = i / seg, x = u * L, z = depth(u);
      for (let j = 0; j <= rad; j++) {
        const a = (j / rad) * Math.PI * 2, cy = Math.cos(a), cz = Math.sin(a);
        pos.push(x, cy * r, z + cz * r);
        const lay = ((x / (r * 5.2) + j / rad) % 1 + 1) % 1;   // a three-strand lay winding along the cord
        c.copy(HEMP).lerp(HEMP_DARK, lay < 0.34 ? 0.55 : lay < 0.42 ? 0.2 : 0.0);
        col.push(c.r, c.g, c.b);
        au.push(x);
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
    strand.setIndex(idx); strand.computeVertexNormals();
    strand.setAttribute('aBead', new THREE.Float32BufferAttribute(new Float32Array(au.length), 1));
    parts.push(strand);
    // knots (lumps elongated along the cord) and the great knots' oxblood bands
    const plan = cordKnots(L);
    st.knots = plan.knots.map((k) => ({ ...k }));
    for (const k of plan.knots) {
      const s = k.great ? 3.0 : 2.3, z = depth(k.u);
      const g = new THREE.SphereGeometry(r, 8, 6); g.scale(s * 1.3, s, s); g.translate(k.at, 0, z);
      const kc = k.great ? KNOT_GREAT : KNOT;
      paintCol(g, kc); attr(g, 'aU', 1, () => k.at); attr(g, 'aBead', 1, () => 0);
      parts.push(g);
      if (k.great) {   // an oxblood-dyed band just past the great knot, as a sounding line is marked
        const bx = Math.min(L, k.at + r * 5.6);
        const t = new THREE.CylinderGeometry(r * 1.55, r * 1.55, r * 3.2, 8, 1); t.rotateZ(Math.PI / 2); t.translate(bx, 0, depth(bx / L));
        paintCol(t, new THREE.Color(TAG)); attr(t, 'aU', 1, () => bx); attr(t, 'aBead', 1, () => 0);
        parts.push(t);
      }
    }
    // the brass ring at the snout (always shown) and the ivory end bead (rides the head)
    const ring = new THREE.TorusGeometry(r * 2.1, r * 0.75, 6, 12); ring.rotateY(Math.PI / 2); ring.translate(0, 0, depth(0));
    paintCol(ring, new THREE.Color(BRASS)); attr(ring, 'aU', 1, () => -1); attr(ring, 'aBead', 1, () => 0);
    parts.push(ring);
    const bead = new THREE.SphereGeometry(r * 2.5, 10, 8); bead.scale(1.25, 1, 1);
    paintCol(bead, new THREE.Color(BEAD)); attr(bead, 'aU', 1, () => -1); attr(bead, 'aBead', 1, () => 1);
    parts.push(bead);
    const geo = mergeGeos(parts);
    mesh.geometry.dispose(); mesh.geometry = geo; outline.geometry = geo;
    outlineMat.userData.thick.value = r * 0.55;
    U.uLen.value = L; U.uHalfW.value = halfW; U.uR.value = r;
    glint.scale.setScalar(r * 22);
    st.lastKnot = -1;
  }
  function paintCol(g, c) {
    const n = g.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  }

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
    /** World pose of the cord: start at `origin` (the snout line), local +X toward the tail, +Y the fish's back, +Z toward the camera. */
    place(origin, xAxis, yAxis, zAxis) {
      const m = group.matrix;
      m.makeBasis(xAxis, yAxis, zAxis); m.setPosition(origin);
      group.matrixAutoUpdate = false; group.matrixWorldNeedsUpdate = true;
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
      const hu = st.L > 0 ? U.uHead.value / st.L : 0;
      glint.position.set(U.uHead.value, 0, st.halfW * archJS(hu) + 1.25 * st.r);
      glint.material.opacity = st.shown * ((laying ? 0.42 : kk >= 0.999 ? 0.16 + 0.08 * Math.sin(st.t * 2.3) : 0) + st.flare * 0.45);
      glint.scale.setScalar(st.r * (20 + st.flare * 14));
      return passed;
    },
    /** World position of a point u (0 → 1) along the laid cord. */
    pointAt(u, out = tmp) {
      group.updateMatrixWorld();
      return out.set(u * st.L, 0, st.halfW * archJS(u) + 1.25 * st.r).applyMatrix4(group.matrixWorld);
    },
    get radius() { return st.r; },
    dispose() { mesh.geometry.dispose(); mat.dispose(); outlineMat.dispose(); glint.material.dispose(); },
  };
}
