// actors-finds.js — M1 step 5c (lane 5C): the finds seen where they go (docs/loop/FINDS.md §5.1, §7; M1.md §2.16). Built only under
// the loop.
//
//   findHomeParts(metaLoop, A, parts) — the Slow Hearth's three parts and its look, merged into the barge's own timber and glow
//     geometries (actors-home.js's setVariants calls it after its variantParts: no new draw call, no new material, no PointLight):
//       the Rust Buoy-Bell     on a bow-quarter post of the starboard rail (the home camera's side), a rust bell under an iron arm
//       the Gate Lamp-Glass    amber panes in the cabin's side windows (an emissive variant of the windows: the glow mesh's window part)
//       the Moat Bollard       a squat carved stone bollard on the stern deck, a turn of line round its neck running aft to the raft
//       the Night-Lily Boxes   two stone boxes under the starboard windows, pale night lilies (green only as a trace)
//   findHomeSig(metaLoop) — what of those is owned, for setVariants' signature
//   createFindLooks(ctx, {raft, wick}) — the raft's Toll-Tower Vane (on a stern post) and the Wick's Knotted Rod Tassel (at the rod's
//     butt, in hand and stowed): one merged mesh each, built when owned (sync() reads meta.loop.finds twice a second)
import * as THREE from 'three';
import { toonMaterial } from './toon.js';
import { xf, paint, mergeGeos } from './models-kit.js';
import { findPropParts } from './models-finds.js';

const lit = (hex, k = 2.0) => new THREE.Color(hex).multiplyScalar(k);
const owned = (L, id) => Number(L?.finds?.got?.[id]) >= 1;
const box = (w, h, d, p, col, r = null) => paint(xf(new THREE.BoxGeometry(w, h, d), { p, r }), col);
const cyl = (rt, rb, h, seg, p, col, r = null) => paint(xf(new THREE.CylinderGeometry(rt, rb, h, seg), { p, r }), col);
const IRON = 0x2a2830, RUST = 0x8a4a2e, STONE = 0x8a8498, STONE_DK = 0x6a6676, ROPE = 0x8c7552, MOSS = 0x3c4a2e, LILY = 0xe8e0f0, POST = 0x2c211d;
// the glow mesh's window part (actors-home GLOW.window = 0): amber, a little warmer and brighter than the built panes
const WINDOW_PART = 0, AMBER = [0xff9a3a, 2.35];
function amberPane(w, h, p, face) {
  const g = new THREE.PlaneGeometry(w, h);
  xf(g, { p, r: face === 'x' ? [0, Math.PI / 2, 0] : [0, -Math.PI / 2, 0] });
  paint(g, new THREE.Color(AMBER[0]).multiplyScalar(AMBER[1]));
  g.setAttribute('gwPart', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill(WINDOW_PART), 1));
  return g;
}
/** A find's prop geometry placed in the barge's frame (scaled to `len` metres along its own z). */
function placed(id, { p = [0, 0, 0], r = null, len = null } = {}) {
  const g = mergeGeos(findPropParts(id));
  g.computeBoundingBox();
  if (len) { const L = g.boundingBox.max.z - g.boundingBox.min.z; const k = len / Math.max(0.01, L); g.scale(k, k, k); }
  return xf(g, { p, r });
}

/** What of the barge's finds is owned (the signature setVariants keys on). */
export function findHomeSig(metaLoop) {
  return ['buoy_bell', 'gate_glass', 'moat_bollard', 'lily_boxes'].map((id) => (owned(metaLoop, id) ? 1 : 0)).join('');
}
/**
 * The barge's finds as variant geometry (in place on parts: {timber: [geo], glow: [geo]}). A is the barge's anchors (A.windows, the six
 * side windows [x, y, z]; A.rails.RH). Everything is the barge's local frame (the bow at −z, the stern at +z, +x starboard).
 */
export function findHomeParts(metaLoop, A, parts) {
  if (!parts || !Array.isArray(parts.timber) || !Array.isArray(parts.glow)) return parts;
  const deckY = 0.42, RH = A?.rails?.RH ?? 0.52;
  // ---- the Rust Buoy-Bell: on a post at the starboard bow quarter, under an iron arm reaching outboard (it rang the boats home)
  if (owned(metaLoop, 'buoy_bell')) {
    const x = 1.45, z = -3.9, y0 = 0.74;
    parts.timber.push(box(0.09, 1.0, 0.09, [x, y0 + 0.5, z], lit(POST)));
    parts.timber.push(box(0.42, 0.05, 0.05, [x + 0.18, y0 + 0.98, z], lit(IRON)));
    parts.timber.push(cyl(0.008, 0.008, 0.16, 4, [x + 0.34, y0 + 0.9, z], lit(IRON)));
    parts.timber.push(placed('buoy_bell', { p: [x + 0.34, y0 + 0.66, z], len: 0.34 }));
  }
  // ---- the Gate Lamp-Glass: amber panes in the cabin's six side windows (the glow's window part: brighter with the hour, no light)
  if (owned(metaLoop, 'gate_glass')) {
    for (const w of Array.isArray(A?.windows) ? A.windows : []) {
      const s = Math.sign(w[0]) || 1;
      parts.glow.push(amberPane(0.4, 0.4, [w[0] + s * 0.006, w[1], w[2]], s > 0 ? 'x' : '-x'));
    }
  }
  // ---- the Moat Bollard: a squat carved stone on the stern deck, starboard aft; a turn of line round its neck running aft
  if (owned(metaLoop, 'moat_bollard')) {
    const x = 0.95, z = 5.35;
    parts.timber.push(cyl(0.2, 0.24, 0.5, 10, [x, deckY + 0.25, z], lit(STONE, 1.6)));
    parts.timber.push(cyl(0.27, 0.22, 0.12, 10, [x, deckY + 0.55, z], lit(STONE, 1.6)));
    parts.timber.push(cyl(0.17, 0.17, 0.04, 10, [x, deckY + 0.62, z], lit(STONE_DK, 1.6)));
    { const g = new THREE.SphereGeometry(0.16, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2); g.scale(1, 0.45, 1); parts.timber.push(paint(xf(g, { p: [x, deckY + 0.62, z] }), lit(MOSS, 2.2))); }
    parts.timber.push(paint(xf(new THREE.TorusGeometry(0.21, 0.022, 4, 14), { r: [Math.PI / 2, 0, 0], p: [x, deckY + 0.36, z] }), lit(ROPE)));
    const a = new THREE.Vector3(x, deckY + 0.36, z + 0.2), b = new THREE.Vector3(x - 0.2, deckY + 0.1, 6.55);
    const len = a.distanceTo(b), mid = a.clone().add(b).multiplyScalar(0.5);
    const rope = new THREE.CylinderGeometry(0.018, 0.018, len, 5);
    rope.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()));
    rope.translate(mid.x, mid.y, mid.z);
    parts.timber.push(paint(rope, lit(ROPE)));
  }
  // ---- the Night-Lily Window Boxes: under the two aft starboard windows
  if (owned(metaLoop, 'lily_boxes')) {
    for (const w of (Array.isArray(A?.windows) ? A.windows : []).filter((q) => q[0] > 0 && q[2] > -2)) {
      const x = w[0] + 0.1, y = w[1] - 0.32, z = w[2];
      parts.timber.push(box(0.18, 0.13, 0.52, [x, y, z], lit(STONE, 1.5)));
      parts.timber.push(box(0.14, 0.02, 0.46, [x, y + 0.07, z], lit(MOSS, 2.0)));
      for (const dz of [-0.17, -0.05, 0.07, 0.18]) {
        parts.timber.push(paint(xf(new THREE.ConeGeometry(0.05, 0.08, 6, 1, true), { r: [Math.PI, 0, 0], p: [x + 0.01, y + 0.14, z + dz] }), lit(LILY, 1.6)));
        parts.timber.push(cyl(0.006, 0.006, 0.08, 3, [x + 0.01, y + 0.1, z + dz], lit(MOSS, 2.0)));
      }
    }
  }
  return parts;
}

/**
 * The looks on the raft and the Wick (M1 step 5c): the Toll-Tower Vane on a short iron stern post at the raft's starboard aft corner
 * (turning slowly with the evening's air), the Knotted Rod Tassel at the rod's butt (in hand and stowed). One merged mesh each, in one
 * shared toon material, built when owned. → {sync(), update(dt), debug()} or null off the loop.
 */
export function createFindLooks(ctx, { raft = null, wick = null } = {}) {
  if (ctx?.data?.LOOP_ENABLED !== true) return null;
  const mat = toonMaterial({ color: 0xffffff, vertexColors: true, rim: 0.3, rimPower: 0.7, gloss: 0.3, shine: 20 });
  const made = { vane: null, tassel: null, tasselStowed: null };
  let t = 0, syncT = 0;
  const deck = raft?.deck || null;
  function build(id, len) {
    const g = mergeGeos(findPropParts(id));
    g.computeBoundingBox();
    const L = g.boundingBox.max.z - g.boundingBox.min.z, k = len / Math.max(0.01, L);
    g.scale(k, k, k); g.computeVertexNormals();
    return new THREE.Mesh(g, mat);
  }
  function sync() {
    const L = ctx.state?.meta?.loop;
    if (owned(L, 'toll_vane') && !made.vane && deck) {
      const post = new THREE.Group(); post.name = 'find:vanePost';
      post.position.set(0.86, 0.24, 1.02);
      const stick = new THREE.Mesh(paint(new THREE.CylinderGeometry(0.018, 0.024, 0.95, 5).translate(0, 0.475, 0), lit(IRON, 1.6)), mat);
      post.add(stick);
      const vane = build('toll_vane', 0.42);
      vane.name = 'find:vane'; vane.position.set(0, 1.0, 0);
      post.add(vane);
      deck.add(post);
      made.vane = { post, vane };
    }
    if (owned(L, 'rod_tassel') && !made.tassel && wick?.rod) {
      const tas = build('rod_tassel', 0.16);
      tas.name = 'find:tassel'; tas.rotation.set(Math.PI / 2, 0, 0); tas.position.set(0.0, -0.06, 0.0);
      wick.rod.add(tas); made.tassel = tas;
      if (wick.stowed) { const s2 = build('rod_tassel', 0.16); s2.rotation.set(Math.PI / 2, 0, 0); s2.position.set(0, -0.06, 0); wick.stowed.add(s2); made.tasselStowed = s2; }
    }
    // a fresh save or Forget everything in the same session: the old save's looks come off (the shared material stays)
    const drop = (m) => { if (!m) return; m.removeFromParent?.(); m.geometry?.dispose?.(); };
    if (!owned(L, 'toll_vane') && made.vane) { made.vane.post.traverse?.((o) => { if (o.isMesh) o.geometry?.dispose?.(); }); made.vane.post.removeFromParent?.(); made.vane = null; }
    if (!owned(L, 'rod_tassel') && made.tassel) { drop(made.tassel); drop(made.tasselStowed); made.tassel = null; made.tasselStowed = null; }
  }
  return {
    sync,
    update(dt) {
      t += Math.min(0.1, Math.max(0, Number(dt) || 0));
      syncT -= dt;
      if (syncT <= 0) { syncT = 0.5; try { sync(); } catch { /* the looks are optional */ } }
      if (made.vane) made.vane.vane.rotation.y = Math.sin(t * 0.21) * 0.9 + Math.sin(t * 0.07) * 0.6;   // the evening's breeze
      if (made.tassel) made.tassel.rotation.z = Math.sin(t * 2.1) * 0.12;
    },
    debug: () => ({ vane: !!made.vane, tassel: !!made.tassel }),
  };
}
