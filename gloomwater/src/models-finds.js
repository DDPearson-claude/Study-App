// models-finds.js — M1 step 5c (lane 5C): the Mossmere's eleven finds as props (docs/loop/FINDS.md §5.1, §7). Each find is one merged
// mesh in the toon material (vertex colours, ≤ 400 triangles; the bollard ≤ 800), in the Starlit palette with metal as warm accents
// (rust, brass, a little gold), never neon. Laid along local +z (its "nose") with its face to local ±x (the show holds a catch flank
// to the lens), centred on its middle, at its own size (LOOP.finds.items[i].size metres long).
//
//   findPropParts(id) → painted geometries (local metres)  · findPropGeometry(id) → one merged BufferGeometry
//   createFindProp(id, D) → a FishVisual-shaped prop for the reveal and the show (object3d, length, shape 'find', bounds, section,
//     update (the turn to the lens and the drips: no flaps, no life), setSilhouette, setBend / bendPoint / setWet / setShown /
//     setWarm / setGlow no-ops, dispose)
import * as THREE from 'three';
import { toonMaterial, addOutline, INK } from './toon.js';
import { xf, paint, mergeGeos } from './models-kit.js';

const TIN = 0xa8a6b4, BRASS = 0xb8893a, BRASS_DK = 0x5c5a3c, GOLD = 0xd9b24a, RUST = 0x8a4a2e, IRON = 0x3c3844, LEATHER = 0x4e3322,
  GLASS = 0xd8dcea, AMBER = 0xd8963c, STONE = 0x8e8a98, STONE_DK = 0x6a6676, MOSS = 0x4f6e46, LILY = 0xece4f4, CORD = 0x8a3a3c, CORD2 = 0xc89a5a,
  LEAD = 0x2c2832, ROPE = 0x8c7552;
const lit = (hex, k = 1.8) => new THREE.Color(hex).multiplyScalar(k);
const P = (g, c, o) => paint(xf(g, o || {}), lit(c));
const RX = [0, 0, Math.PI / 2];   // a cylinder's axis along x (a disc facing the lens)
const RZ = [Math.PI / 2, 0, 0];   // a cylinder's axis along z

/** The props' parts by id (pure but for THREE): painted geometries in local metres, along +z. */
export function findPropParts(id) {
  const g = [];
  switch (id) {
    case 'tin_spoon': {   // a dented tin spoon, its bowl bent
      g.push(P(new THREE.BoxGeometry(0.006, 0.012, 0.13), TIN, { p: [0, 0, -0.035] }));
      g.push(P(new THREE.SphereGeometry(0.03, 8, 5), TIN, { p: [0, 0.006, 0.062], s: [0.35, 0.7, 1.35], r: [0.35, 0, 0] }));
      g.push(P(new THREE.BoxGeometry(0.008, 0.02, 0.022), TIN, { p: [0, 0, -0.1] }));
      break;
    }
    case 'door_ring': {   // a green-black brass ring the size of the Wick's head, its boss worn smooth
      g.push(P(new THREE.TorusGeometry(0.1, 0.017, 6, 18), BRASS_DK, { r: [0, Math.PI / 2, 0] }));
      g.push(P(new THREE.CylinderGeometry(0.035, 0.04, 0.03, 10), BRASS, { r: RX, p: [0, 0.1, 0] }));
      g.push(P(new THREE.TorusGeometry(0.1, 0.006, 4, 18, 1.2), BRASS, { r: [0, Math.PI / 2, 0.5], p: [0.012, 0, 0] }));
      break;
    }
    case 'salt_lens': {   // a thick round lens, salt-frosted, catching the lantern's light
      g.push(P(new THREE.CylinderGeometry(0.085, 0.085, 0.03, 16), GLASS, { r: RX }));
      g.push(P(new THREE.SphereGeometry(0.085, 12, 6, 0, Math.PI * 2, 0, 0.6), GLASS, { r: [0, 0, -Math.PI / 2], p: [0.0, 0, 0], s: [0.5, 1, 1] }));
      g.push(P(new THREE.TorusGeometry(0.088, 0.008, 4, 16), BRASS, { r: [0, Math.PI / 2, 0] }));
      break;
    }
    case 'two_headed_coin': {   // a heavy gold coin, a head on both faces
      g.push(P(new THREE.CylinderGeometry(0.04, 0.04, 0.008, 14), GOLD, { r: RX }));
      for (const sx of [1, -1]) g.push(P(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { p: [sx * 0.004, 0.004, 0.002], s: [0.4, 1.2, 1] }));
      g.push(P(new THREE.TorusGeometry(0.038, 0.003, 3, 14), BRASS, { r: [0, Math.PI / 2, 0] }));
      break;
    }
    case 'toll_purse': {   // a waterlogged leather purse with a brass clasp, coins showing at its mouth
      g.push(P(new THREE.SphereGeometry(0.1, 10, 7), LEATHER, { s: [0.7, 0.85, 1.35] }));
      g.push(P(new THREE.TorusGeometry(0.07, 0.009, 4, 12, Math.PI), BRASS, { r: [0, Math.PI / 2, 0], p: [0, 0.07, 0] }));
      g.push(P(new THREE.SphereGeometry(0.014, 6, 4), BRASS, { p: [0, 0.14, 0] }));
      for (const [x, y, z] of [[0.025, 0.075, -0.03], [-0.02, 0.08, 0.02], [0.01, 0.082, 0.05]]) g.push(P(new THREE.CylinderGeometry(0.02, 0.02, 0.005, 10), GOLD, { r: [0.4, 0.2, 0.3], p: [x, y, z] }));
      g.push(P(new THREE.BoxGeometry(0.01, 0.03, 0.22), LEATHER, { p: [0, -0.05, 0], r: [0.12, 0, 0] }));
      break;
    }
    case 'buoy_bell': {   // a rust bell off a harbour buoy, its mouth down, a shackle at its crown
      g.push(P(new THREE.CylinderGeometry(0.05, 0.11, 0.2, 12, 1, true), RUST, { p: [0, 0, 0] }));
      g.push(P(new THREE.SphereGeometry(0.05, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2), RUST, { p: [0, 0.1, 0] }));
      g.push(P(new THREE.TorusGeometry(0.11, 0.012, 4, 14), RUST, { r: [Math.PI / 2, 0, 0], p: [0, -0.1, 0] }));
      g.push(P(new THREE.TorusGeometry(0.03, 0.008, 4, 10), IRON, { r: [0, Math.PI / 2, 0], p: [0, 0.165, 0] }));
      g.push(P(new THREE.SphereGeometry(0.025, 6, 4), IRON, { p: [0, -0.12, 0] }));
      break;
    }
    case 'gate_glass': {   // a square pane of amber lamp-glass in a lead frame
      g.push(P(new THREE.BoxGeometry(0.012, 0.2, 0.24), AMBER));
      for (const [y, h] of [[0.1, 0.012], [-0.1, 0.012]]) g.push(P(new THREE.BoxGeometry(0.018, h, 0.25), LEAD, { p: [0, y, 0] }));
      for (const z of [0.12, -0.12, 0]) g.push(P(new THREE.BoxGeometry(0.018, 0.21, 0.012), LEAD, { p: [0, 0, z] }));
      g.push(P(new THREE.BoxGeometry(0.018, 0.01, 0.24), LEAD));
      break;
    }
    case 'moat_bollard': {   // a squat carved stone bollard (laid along the raft: its crown at +z), moss in its crown's hollow
      g.push(P(new THREE.CylinderGeometry(0.15, 0.17, 0.42, 12), STONE, { r: RZ, p: [0, 0, -0.06] }));
      g.push(P(new THREE.CylinderGeometry(0.2, 0.16, 0.12, 12), STONE, { r: RZ, p: [0, 0, 0.2] }));
      g.push(P(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 12), STONE_DK, { r: RZ, p: [0, 0, 0.27] }));
      g.push(P(new THREE.SphereGeometry(0.11, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), MOSS, { r: [Math.PI / 2, 0, 0], p: [0, 0, 0.27], s: [1, 0.45, 1] }));
      g.push(P(new THREE.TorusGeometry(0.155, 0.016, 4, 14), ROPE, { p: [0, 0, 0.06] }));
      g.push(P(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 12), STONE_DK, { r: RZ, p: [0, 0, -0.28] }));
      break;
    }
    case 'rod_tassel': {   // a tassel of knotted cord
      g.push(P(new THREE.SphereGeometry(0.02, 6, 4), CORD2, { p: [0, 0, 0.08] }));
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2, x = Math.cos(a) * 0.01, y = Math.sin(a) * 0.012;
        g.push(P(new THREE.CylinderGeometry(0.0035, 0.0035, 0.15, 4), i % 2 ? CORD : CORD2, { r: RZ, p: [x, y, 0.0] }));
        g.push(P(new THREE.SphereGeometry(0.007, 4, 3), CORD, { p: [x, y, -0.03 + (i % 3) * 0.03] }));
      }
      break;
    }
    case 'toll_vane': {   // a small iron weathervane: a fish, of course, on a spindle
      g.push(P(new THREE.SphereGeometry(0.1, 10, 6), IRON, { s: [0.08, 0.55, 1.3], p: [0, 0.03, 0.04] }));
      g.push(P(new THREE.ConeGeometry(0.06, 0.1, 3), IRON, { r: [Math.PI / 2, 0, 0], s: [0.15, 1, 1], p: [0, 0.03, -0.14] }));
      g.push(P(new THREE.CylinderGeometry(0.006, 0.006, 0.3, 5), RUST, { p: [0, -0.09, 0.02] }));
      g.push(P(new THREE.SphereGeometry(0.01, 5, 3), GOLD, { p: [0.007, 0.05, 0.12] }));
      break;
    }
    case 'lily_boxes': {   // two stone boxes, pale night lilies opening (green only as a trace)
      for (const z of [-0.12, 0.12]) {
        g.push(P(new THREE.BoxGeometry(0.09, 0.08, 0.2), STONE, { p: [0, -0.03, z] }));
        g.push(P(new THREE.BoxGeometry(0.07, 0.01, 0.18), MOSS, { p: [0, 0.015, z] }));
        for (const dz of [-0.06, 0, 0.06]) g.push(P(new THREE.ConeGeometry(0.022, 0.035, 5, 1, true), LILY, { p: [0.005, 0.045, z + dz], r: [Math.PI, 0, 0] }));
      }
      break;
    }
    default: g.push(P(new THREE.BoxGeometry(0.06, 0.06, 0.12), STONE));
  }
  return g;
}
/** One merged geometry of a find (for the barge, the raft and the Wick: merged into their own meshes). */
export function findPropGeometry(id) { return mergeGeos(findPropParts(id)); }

const isObj = (o) => !!o && typeof o === 'object';
/**
 * A find's prop for the reveal and the show, shaped like a FishVisual where the show reads one (CONTRACT §13.7b): the show holds it in
 * its pose by its length and section; its update turns it once to the lens over its held beat (a glint runs over it) and lets water run
 * off it; nothing flaps, struggles or breathes. null for an unknown id.
 */
export function createFindProp(id, D = null) {
  const it = (D?.LOOP?.finds?.items || []).find((x) => x?.id === id) || null;
  const geo = findPropGeometry(id);
  geo.computeBoundingBox();
  const bb = geo.boundingBox, len0 = Math.max(0.02, bb.max.z - bb.min.z);
  const want = Number(it?.size) > 0 ? Number(it.size) : len0;
  const k = want / len0;
  geo.scale(k, k, k);
  geo.computeBoundingBox(); geo.computeVertexNormals();
  const b = geo.boundingBox;
  const mat = toonMaterial({ color: 0xffffff, vertexColors: true, rim: 0.4, rimPower: 0.6, gloss: 0.4, shine: 30 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = `find:${id}`;
  try { addOutline(mesh, { thickness: 0.006 }); } catch { /* the ink line is optional */ }
  const pivot = new THREE.Group(); pivot.add(mesh);
  const object3d = new THREE.Group(); object3d.name = `find-prop:${id}`; object3d.add(pivot);
  const L = b.max.z - b.min.z;
  const white = new THREE.Color(0xffffff), ink = new THREE.Color(INK);
  let t = 0, silK = 0, turned = 0, glowK = 1;
  const jackpot = it?.grade === 'jackpot';
  const visual = {
    object3d, length: L, shape: 'find', find: id, speciesId: null, trueScale: true, legendary: false,
    bounds: { noseZ: b.max.z, tailZ: b.min.z, halfW: Math.max(Math.abs(b.min.x), Math.abs(b.max.x)), top: b.max.y, bottom: b.min.y },
    /** No life: a slow turn once to the lens while it is held still, a small bob; struggle and swim are ignored. */
    update(dt = 0.016) {
      dt = Math.min(Math.max(Number(dt) || 0, 0), 0.1);
      t += dt;
      // the turn: one revolution about its long axis over 1.4 s, once, starting 0.5 s after it is first held up
      if (t > 0.5 && turned < 1) turned = Math.min(1, turned + dt / 1.4);
      const e = turned * turned * (3 - 2 * turned);
      pivot.rotation.z = e * Math.PI * 2;
      pivot.position.y = Math.sin(t * 1.6) * 0.004;
      // the glint: the lantern runs over it as it turns (a brighter emissive for the jackpot's gold)
      const g = Math.sin(Math.PI * turned) * (jackpot ? 0.55 : 0.3) * glowK;
      mat.emissive.setRGB(g * 1.0, g * 0.8, g * 0.45);
    },
    section(frac, out = {}) {
      const f = THREE.MathUtils.clamp(Number(frac) || 0, 0, 1);
      out.z = b.max.z - f * L;
      const m = Math.sqrt(Math.max(0.15, 1 - Math.pow(Math.abs(f * 2 - 1), 2.2)));
      out.halfW = Math.max(0.004, visual.bounds.halfW * m); out.top = Math.max(0.004, b.max.y * m); out.bottom = Math.min(-0.004, b.min.y * m);
      return out;
    },
    setBend() {}, bendPoint(v) { return v; }, setWet() {}, setShown() {}, setWarm() {},
    setGlow(kk = 1) { glowK = Math.max(0, Number(kk) || 0); },
    /** 0 → 1: the dark streaming shape before the lantern lights it (the reveal); 0 gives its colours back. */
    setSilhouette(kk = 1) {
      silK = THREE.MathUtils.clamp(Number(kk) || 0, 0, 1);
      mat.color.copy(white).lerp(ink, silK * 0.92);
    },
    dispose() {
      try { geo.dispose(); mat.dispose(); mesh.traverse((o) => { if (o !== mesh && o.geometry) o.geometry.dispose(); if (o !== mesh && o.material && o.material !== mat) o.material.dispose?.(); }); } catch { /* ignore */ }
      object3d.parent?.remove(object3d);
    },
  };
  void isObj; void silK;
  return visual;
}
