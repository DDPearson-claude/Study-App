// actors-raft-gear.js — M1 step 4 (lane 4): the raft's parts seen on the raft (SPEC §7 "what you see", M1.md §2.6): Oars I a pair of
// longer oars shipped along the sides, Oars II a second pair crossed at the stern; Keel I a deeper keel, its post rising at the stern,
// Keel II a weighted one with a brass shoe; Lantern I and II a taller lantern with clearer glass. Built only under the loop
// (actors.js calls createRaftGear once and sync() each frame: a level change rebuilds one merged mesh, so the parts cost at most one
// draw call and its outline). Emissive nothing, no light added, never a ring or disc on the water.
import * as THREE from 'three';
import { toonMaterial, addOutline } from './toon.js';
import { xf, paint, mergeGeos, smoothNormals } from './models-kit.js';
import { DECK_Y } from './actors-raft.js';

const WOOD = 0x3a2918, DARK = 0x2a1d13, BLADE = 0x4a3420, BRASS = 0xb8893a, ROPE = 0x8c7552;
const STALK = 0x9a8e74, CAP = 0x8a6a52, GILL = 0xc8b494, ROOT = 0x2c221c, MOSS = 0x4a5a3a;   // (LAKE 2, lane S: Sporewood's make)
const lit = (hex, k = 2.0) => new THREE.Color(hex).multiplyScalar(k);

/** The geometry of the parts at these levels (pure but for THREE): an array of painted geometries in the raft's deck space. */
export function raftGearParts({ oars = 0, keel = 0, water = null } = {}) {
  const out = [];
  // (LAKE 2, lane S: the parts bought at Sporewood are its own make, LAKE2.md §7.1: pale stalk looms and blades pressed from a cap, a
  // root keel trailing its tendrils, a mossy stone lashed under it for Root Keel II; the Mossmere's as built)
  const spore = water === 'sporewood';
  const oar = (x, z, yaw, len) => {
    const g = [];
    g.push(paint(xf(new THREE.CylinderGeometry(0.022, 0.026, len, 6), { r: [Math.PI / 2, 0, 0] }), spore ? lit(STALK, 1.5) : lit(WOOD)));
    if (spore) {   // a round blade pressed from a cap, its gill ridges along it
      g.push(paint(xf(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 10), { s: [1, 1, 1.5], p: [0, 0, len / 2 + 0.17] }), lit(CAP, 1.5)));
      for (const dx of [-0.05, 0, 0.05]) g.push(paint(xf(new THREE.BoxGeometry(0.012, 0.03, 0.3), { p: [dx, 0.004, len / 2 + 0.17] }), lit(GILL, 1.5)));
      for (const dz of [-0.3, 0, 0.3]) g.push(paint(xf(new THREE.CylinderGeometry(0.029, 0.029, 0.02, 6), { r: [Math.PI / 2, 0, 0], p: [0, 0, dz] }), lit(GILL, 1.5)));   // its stalk rings
    } else g.push(paint(xf(new THREE.BoxGeometry(0.15, 0.02, 0.42), { p: [0, 0, len / 2 + 0.16] }), lit(BLADE)));
    g.push(paint(xf(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 6), { r: [Math.PI / 2, 0, 0], p: [0, 0, -len / 2 + 0.06] }), lit(spore ? MOSS : ROPE, 1.4)));
    return g.map((x0) => xf(x0, { p: [x, DECK_Y + 0.06, z], r: [0.05, yaw, 0] }));
  };
  if (oars >= 1) {   // a pair of long oars shipped along each side, their blades past the stern, their looms lashed by the thole pins
    out.push(...oar(1.02, 0.15, 0.04, 2.5), ...oar(-1.02, 0.15, -0.04, 2.5));
    for (const x of [1.0, -1.0]) for (const z of [-0.45, 0.6]) out.push(paint(xf(new THREE.CylinderGeometry(0.018, 0.022, 0.2, 5), { p: [x, DECK_Y + 0.06, z] }), lit(DARK)));
  }
  if (oars >= 2) {   // a second pair, crossed over the stern deck
    out.push(...oar(0.2, -0.95, Math.PI / 2 + 0.32, 2.2).map((g) => xf(g, { p: [0, 0.05, 0] })), ...oar(-0.2, -0.95, Math.PI / 2 - 0.32, 2.2).map((g) => xf(g, { p: [0, 0.09, 0] })));
  }
  if (keel >= 1 && spore) {   // a root keel: a dark twisted root along the middle log, its stern post a root knee, tendrils trailing
    out.push(paint(xf(new THREE.BoxGeometry(0.1, 0.32, 2.5), { p: [0, -0.12, 0], r: [0, 0, 0.06] }), lit(ROOT)));
    out.push(paint(xf(new THREE.CylinderGeometry(0.05, 0.07, 0.62, 6), { p: [0, DECK_Y + 0.14, -1.34], r: [-0.22, 0, 0.1] }), lit(ROOT)));
    for (const [z, a] of [[-0.9, 0.5], [0.1, -0.4], [0.9, 0.6]]) out.push(paint(xf(new THREE.CylinderGeometry(0.012, 0.024, 0.42, 4), { p: [0.02, -0.38, z], r: [a, 0, 0.3] }), lit(ROOT)));
    if (keel >= 2) out.push(paint(xf(new THREE.SphereGeometry(0.13, 7, 5), { s: [1, 0.7, 1.3], p: [0, -0.34, 0.2] }), lit(MOSS, 1.5)));
  }
  if (keel >= 1 && !spore) {   // a deeper keel along the middle log, its post standing at the stern; a fin below the floats
    out.push(paint(xf(new THREE.BoxGeometry(0.09, 0.34, 2.6), { p: [0, -0.12, 0] }), lit(DARK)));
    out.push(paint(xf(new THREE.BoxGeometry(0.1, 0.62, 0.12), { p: [0, DECK_Y + 0.14, -1.36], r: [-0.12, 0, 0] }), lit(WOOD)));
    out.push(paint(xf(new THREE.BoxGeometry(0.1, 0.4, 0.12), { p: [0, DECK_Y + 0.04, 1.36], r: [0.12, 0, 0] }), lit(WOOD)));
  }
  if (keel >= 2 && !spore) {   // weighted: a brass shoe on the keel's foot and brass caps on its posts
    out.push(paint(xf(new THREE.BoxGeometry(0.13, 0.08, 2.7), { p: [0, -0.3, 0] }), lit(BRASS, 1.3)));
    out.push(paint(xf(new THREE.CylinderGeometry(0.075, 0.075, 0.07, 8), { p: [0, DECK_Y + 0.48, -1.4] }), lit(BRASS, 1.3)));
    out.push(paint(xf(new THREE.CylinderGeometry(0.075, 0.075, 0.07, 8), { p: [0, DECK_Y + 0.26, 1.39] }), lit(BRASS, 1.3)));
  }
  return out;
}

/**
 * createRaftGear(ctx, raft): the parts on the raft's deck, from meta.loop.raft (read each frame through sync(): cheap; a change of a
 * level rebuilds the one mesh). The Lantern's levels change the built lantern itself (its glass taller and clearer, its halo a little
 * wider): no new light. → {sync(levels?), levels, mesh, debug()} or null off the loop.
 */
export function createRaftGear(ctx, raft) {
  if (ctx?.data?.LOOP_ENABLED !== true || !raft?.deck) return null;
  const mat = toonMaterial({ color: 0xffffff, vertexColors: true, rim: 0.16, rimPower: 0.78, detail: 'wood', detailAmount: 1.2, grain: [0, 0, 1], gloss: 0.25, shine: 14 });
  const holder = new THREE.Group(); holder.name = 'raftGear'; raft.deck.add(holder);
  let mesh = null, key = '';
  const levels = { oars: 0, keel: 0, lantern: 0, water: null };
  const glassMesh = raft.lantern?.children?.find?.((c) => c.material === raft.glassMat) || null;
  function build() {
    if (mesh) { holder.remove(mesh); mesh.geometry.dispose(); mesh.traverse((o) => { if (o !== mesh && o.geometry) o.geometry.dispose(); }); mesh = null; }
    const parts = raftGearParts(levels);
    if (!parts.length) return;
    mesh = new THREE.Mesh(mergeGeos(parts), mat);
    mesh.name = 'raftGearParts';
    const tmp = new THREE.Mesh(smoothNormals(mesh.geometry));
    const ol = addOutline(tmp, { thickness: 0.016 }); tmp.remove(ol); mesh.add(ol);
    holder.add(mesh);
  }
  // (the glass's opacity and the halo's size are actors' per frame: it lays the Lantern's level over them, raftGear.levels.lantern)
  function lantern(lv) { if (glassMesh) glassMesh.scale.set(1 + 0.08 * lv, 1 + 0.22 * lv, 1 + 0.08 * lv); }
  function sync(lv = null) {
    const src = lv || ctx.state?.meta?.loop?.raft || {};
    const next = { oars: Math.max(0, Math.min(2, Math.trunc(Number(src.oars) || 0))), keel: Math.max(0, Math.min(3, Math.trunc(Number(src.keel) || 0))),
      lantern: Math.max(0, Math.min(2, Math.trunc(Number(src.lantern) || 0))) };
    // (LAKE 2, lane S: whose make the parts are: the gear water's, read from the save)
    const gw = ctx.state?.meta?.loop?.gearWater;
    next.water = typeof gw === 'string' && gw !== 'mossmere' ? gw : null;
    const k = `${next.oars}|${next.keel}|${next.lantern}${next.water ? `|${next.water}` : ''}`;
    if (k === key) return false;
    const rebuild = next.oars !== levels.oars || next.keel !== levels.keel || next.water !== levels.water || !key;
    Object.assign(levels, next); key = k;
    if (rebuild) build();
    lantern(levels.lantern);
    return true;
  }
  return { sync, levels, get mesh() { return mesh; }, debug: () => ({ ...levels, parts: mesh ? 1 : 0, glass: raft.glassMat?.opacity ?? null }) };
}
