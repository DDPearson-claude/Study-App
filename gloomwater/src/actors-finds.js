// actors-finds.js — M1 step 5c (lane 5C): the finds seen where they go (docs/loop/FINDS.md §5.1, §7; M1.md §2.16). Built only under
// the loop.
//
//   findHomeParts(metaLoop, A, parts) — the Slow Hearth's three parts and its look, merged into the barge's own timber and glow
//     geometries (actors-home.js's setVariants calls it after its variantParts: no new draw call, no new material, no PointLight):
//       the Rust Buoy-Bell     on a bow-quarter post of the starboard rail (the home camera's side), a rust bell under an iron arm
//       the Gate Lamp-Glass    amber panes in the cabin's side windows (an emissive variant of the windows: the glow mesh's window part)
//       the Moat Bollard       a squat carved stone bollard on the stern deck, a turn of line round its neck running aft to the raft
//       the Night-Lily Boxes   two stone boxes under the starboard windows, pale night lilies (green only as a trace)
//   the lost tackle (LOST-TACKLE.md §2.1): the rod, line, reel and lure owned hang on the gear rack on the cabin's aft wall beside the
//     bought rod (the Lamplighter's Pole standing to port of it, its lamp-hook over the rack; the Belfry Winch and the Ferrywife's
//     Thread on pegs; the Gate-Guard's Button on a nail); the notebooks lie on the chart table (the Veil Angler's open at its map)
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
const WOOD_DK = 0x3a2c24, BRASS = 0xb8893a, LEATHER = 0x3c2a20, PAGE = 0xd4cab4, MAPC = 0xc8b48c, STRING = 0x9a8462, CLOTH = 0x56506e;
const TACKLE_IDS = ['lamp_pole', 'belfry_winch', 'ferry_thread', 'guard_button', 'veil_notebook', 'lily_notebook'];
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
  const parts = ['buoy_bell', 'gate_glass', 'moat_bollard', 'lily_boxes'].map((id) => (owned(metaLoop, id) ? 1 : 0)).join('');
  const tk = TACKLE_IDS.map((id) => (owned(metaLoop, id) ? 1 : 0)).join('');
  return tk.includes('1') ? `${parts}:${tk}` : parts;   // (the lost tackle's six after a colon, only once one is owned)
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
  tackleHomeParts(metaLoop, A, parts);
  return parts;
}

/**
 * The lost tackle at home (LOST-TACKLE §2.1): merged into the timber like the parts (no draw call, no material). The rack is the
 * cabin's aft wall port of the door (actors-home's rod rack: x −1.0, its face at z ≈ 2.32; the rack target's box); the chart table's
 * top is A.chart.top (5b's Chart is drawn on it: the notebooks lie on its port and aft edges, clear of the middle of the sheet).
 */
function tackleHomeParts(metaLoop, A, parts) {
  const deckY = 0.42, zW = 2.31;   // the aft wall's face (HULL.cabin.z1 2.25 + its planks)
  const peg = (x, y, len = 0.09) => parts.timber.push(cyl(0.008, 0.008, len, 4, [x, y, zW + len / 2], lit(IRON), [Math.PI / 2, 0, 0]));
  // the Lamplighter's Pole: standing to port of the bought rod, its butt on the deck, the lamp-hook bent out over the rack at the top
  // (cut to stand under the awning's forward edge, 2.24 m up at the wall: its hook tops out at 2.13)
  if (owned(metaLoop, 'lamp_pole')) {
    const x = -1.19, z = zW + 0.06, y0 = deckY + 0.06, h = 1.58;
    parts.timber.push(cyl(0.015, 0.024, h, 6, [x, y0 + h / 2, z], lit(WOOD_DK, 2.0)));
    parts.timber.push(cyl(0.028, 0.028, 0.1, 6, [x, y0 + 0.05, z], lit(BRASS, 1.5)));
    for (const y of [0.62, 1.2]) parts.timber.push(cyl(0.022, 0.022, 0.03, 6, [x, y0 + y, z], lit(IRON, 1.8)));
    parts.timber.push(box(0.05, 0.05, 0.08, [x, deckY + 1.3, zW + 0.03], lit(POST)));   // its bracket
    parts.timber.push(paint(xf(new THREE.TorusGeometry(0.07, 0.009, 4, 10, Math.PI * 1.25), { r: [0, Math.PI / 2, 0], p: [x, y0 + h + 0.0, z + 0.07] }), lit(BRASS, 1.5)));
    parts.timber.push(paint(xf(new THREE.TorusGeometry(0.03, 0.007, 4, 10), { r: [0, Math.PI / 2, 0], p: [x, y0 + h - 0.07, z + 0.12] }), lit(BRASS, 1.5)));
  }
  // the Belfry Winch on a peg in the rack's upper half (its wheel to the stern), the Ferrywife's Thread on a peg below it
  if (owned(metaLoop, 'belfry_winch')) { peg(-1.08, deckY + 1.24); parts.timber.push(placed('belfry_winch', { p: [-1.08, deckY + 1.24, zW + 0.1], r: [0, -Math.PI / 2, 0], len: 0.2 })); }
  if (owned(metaLoop, 'ferry_thread')) { peg(-1.08, deckY + 0.86); parts.timber.push(placed('ferry_thread', { p: [-1.08, deckY + 0.86, zW + 0.09], r: [0, 0, 0], len: 0.13 })); }
  // the Gate-Guard's Button on a nail at the rack's top, its brass to the stern
  if (owned(metaLoop, 'guard_button')) { peg(-1.08, deckY + 1.7, 0.05); parts.timber.push(placed('guard_button', { p: [-1.08, deckY + 1.66, zW + 0.06], r: [0, -Math.PI / 2, 0], len: 0.085 })); }
  // the notebooks on the chart table (the Veil Angler's open at its map on the port edge; the Lily Gardener's shut at the aft edge)
  const T = A?.chart?.top;
  if (!T) return parts;
  const y = T.y + 0.012;
  if (owned(metaLoop, 'veil_notebook')) {
    const x = T.x - T.w / 2 + 0.17, z = T.z - 0.04, open = [];
    open.push(box(0.34, 0.012, 0.23, [0, 0, 0], lit(LEATHER, 1.8)));
    for (const s of [-1, 1]) open.push(paint(xf(new THREE.BoxGeometry(0.155, 0.022, 0.21), { p: [s * 0.08, 0.016, 0], r: [0, 0, -s * 0.06] }), lit(PAGE, 1.25)));
    open.push(paint(xf(new THREE.BoxGeometry(0.15, 0.004, 0.13), { p: [0.1, 0.036, 0.03], r: [0, 0.22, 0.05] }), lit(MAPC, 1.3)));   // the map, unfolded over the page
    open.push(box(0.006, 0.004, 0.2, [0.03, 0.04, -0.02], lit(STRING, 1.6), [0, 0.5, 0]));   // the string, untied
    parts.timber.push(xf(mergeGeos(open), { p: [x, y, z], r: [0, 0.18, 0] }));
  }
  if (owned(metaLoop, 'lily_notebook')) {
    const x = T.x + 0.12, z = T.z + T.d / 2 - 0.1, shut = [];
    shut.push(box(0.15, 0.028, 0.19, [0, 0, 0], lit(CLOTH, 1.9)));
    shut.push(box(0.142, 0.022, 0.006, [0, 0, 0.094], lit(PAGE, 1.2)));
    for (const a of [-0.7, 0, 0.7]) shut.push(paint(xf(new THREE.SphereGeometry(0.016, 6, 4), { s: [1.7, 0.2, 0.7], r: [0, a, 0], p: [Math.sin(a) * 0.018, 0.016, Math.cos(a) * 0.018 - 0.01] }), lit(LILY, 1.5)));
    parts.timber.push(xf(mergeGeos(shut), { p: [x, y + 0.002, z], r: [0, -0.32, 0] }));
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
