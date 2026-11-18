// models-finds.js — M1 step 5c (lane 5C): the Mossmere's eleven finds, its six lost-tackle pieces (LOST-TACKLE.md §3, §4) and (LAKE 2,
// lane S) Sporewood's five treasures (LAKE2.md §7.3), as
// props (docs/loop/FINDS.md §5.1, §7). Each find is one merged
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

const TIN = 0xa8a6b4, BRASS = 0xb8893a, BRASS_DK = 0x5c5a3c, GOLD = 0xd9b24a, RUST = 0x6a3f2e, IRON = 0x3c3844, LEATHER = 0x3c2a20,
  GLASS = 0xd8dcea, AMBER = 0xd8963c, STONE = 0x8e8a98, STONE_DK = 0x6a6676, MOSS = 0x4f6e46, LILY = 0xece4f4, CORD = 0x8a3a3c, CORD2 = 0xc89a5a,
  LEAD = 0x2c2832, ROPE = 0x8c7552,
  // lost tackle: the pole's dark old wood, pages, a folded map, the thread, the string, the Lily Gardener's lavender-grey cloth
  WOOD_DK = 0x3a2c24, PAPER = 0xd4cab4, MAP = 0xc8b48c, THREAD = 0xd8d2c6, STRING = 0x9a8462, CLOTH = 0x56506e,
  // LAKE 2, lane S (Sporewood's treasures, LAKE2.md §7.3): the gardens' things in the Pools' own colours: cream stoneware, plum wax,
  // straw, garden brass, bell glass, a seed-keeper's dark wood; amber and moss as accents, never neon
  CREAM = 0xd6cab0, PLUM = 0x5e3450, STRAW = 0xb89a5c, STRAW_DK = 0x7e6638, WOOD = 0x6a4a32, SEED = 0x8a5a36;
// (the toon light gives back about half: dark metals and leather are lifted ×1.8, pale stone, glass, tin and lilies only ×1.2, so they
// read as stone and glass under the lantern, never as white)
const lit = (hex, k = null) => { const c = new THREE.Color(hex), L = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b; return c.multiplyScalar(k ?? (L > 0.4 ? 1.2 : 1.8)); };
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
    // ---- lost tackle (LOST-TACKLE.md §3.1, §4): somebody's own gear, worn by the water (≤ 400 triangles; the pole ≤ 600)
    case 'lamp_pole': {   // a long dark lamplighter's pole cut down into a rod, its brass lamp-hook bent into a tip ring (3 m)
      g.push(P(new THREE.CylinderGeometry(0.016, 0.028, 2.84, 6), WOOD_DK, { r: RZ, p: [0, 0, -0.08] }));
      g.push(P(new THREE.CylinderGeometry(0.033, 0.033, 0.12, 6), BRASS_DK, { r: RZ, p: [0, 0, -1.44] }));
      for (const z of [-0.62, 0.34]) g.push(P(new THREE.CylinderGeometry(0.026, 0.026, 0.035, 6), IRON, { r: RZ, p: [0, 0, z] }));
      g.push(P(new THREE.CylinderGeometry(0.02, 0.02, 0.07, 6), BRASS, { r: RZ, p: [0, 0, 1.36] }));
      // (the hook rises from the tip and curls over forward, a crook: its arc starts at the tip, the ring hangs from its end)
      g.push(P(new THREE.TorusGeometry(0.085, 0.011, 4, 10, Math.PI * 1.25), BRASS, { r: [0, Math.PI / 2, 0], p: [0, 0, 1.425] }));
      g.push(P(new THREE.TorusGeometry(0.034, 0.008, 4, 10), BRASS, { r: [0, Math.PI / 2, 0], p: [0, -0.094, 1.485] }));
      break;
    }
    case 'belfry_winch': {   // a brass wheel of clock teeth on an iron crank (its face to the lens)
      g.push(P(new THREE.CylinderGeometry(0.08, 0.08, 0.016, 16), BRASS, { r: RX }));
      for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; g.push(P(new THREE.BoxGeometry(0.014, 0.018, 0.014), BRASS, { p: [0, Math.cos(a) * 0.088, Math.sin(a) * 0.088], r: [a, 0, 0] })); }
      for (const a of [0, Math.PI / 2]) g.push(P(new THREE.BoxGeometry(0.02, 0.012, 0.13), BRASS_DK, { r: [a, 0, 0] }));
      g.push(P(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 8), IRON, { r: RX }));
      g.push(P(new THREE.BoxGeometry(0.008, 0.012, 0.1), IRON, { p: [0.024, 0, 0.05] }));
      g.push(P(new THREE.CylinderGeometry(0.011, 0.011, 0.035, 6), WOOD_DK, { r: RX, p: [0.04, 0, 0.1] }));
      break;
    }
    case 'ferry_thread': {   // a wooden spool of pale fine thread, a ferry token tied on
      for (const z of [-0.056, 0.056]) g.push(P(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 12), ROPE, { r: RZ, p: [0, 0, z] }));
      g.push(P(new THREE.CylinderGeometry(0.031, 0.031, 0.1, 12), THREAD, { r: RZ }));
      g.push(P(new THREE.CylinderGeometry(0.0016, 0.0016, 0.034, 3), THREAD, { p: [0, -0.046, 0.024] }));
      g.push(P(new THREE.CylinderGeometry(0.015, 0.015, 0.003, 10), BRASS, { r: RX, p: [0, -0.068, 0.024] }));
      break;
    }
    case 'guard_button': {   // a heavy brass button, its crest worn away, a hook through its shank
      g.push(P(new THREE.SphereGeometry(0.022, 12, 6), BRASS, { s: [0.38, 1, 1] }));
      g.push(P(new THREE.TorusGeometry(0.021, 0.0028, 3, 12), BRASS_DK, { r: [0, Math.PI / 2, 0] }));
      g.push(P(new THREE.TorusGeometry(0.006, 0.002, 3, 6), BRASS_DK, { r: [0, Math.PI / 2, 0], p: [-0.009, 0, 0.012] }));
      g.push(P(new THREE.TorusGeometry(0.012, 0.0018, 3, 10, Math.PI * 1.3), IRON, { r: [0, Math.PI / 2, 0.6], p: [-0.009, -0.004, 0.026] }));
      break;
    }
    case 'veil_notebook': {   // a swollen leather notebook tied with string, its pages wavy, a folded map sticking out
      for (const x of [-0.022, 0.022]) g.push(P(new THREE.BoxGeometry(0.008, 0.16, 0.22), LEATHER, { p: [x, 0, 0] }));
      g.push(P(new THREE.BoxGeometry(0.052, 0.012, 0.22), LEATHER, { p: [0, -0.08, 0] }));
      g.push(P(new THREE.BoxGeometry(0.036, 0.15, 0.21), PAPER, { p: [0, 0.004, 0] }));
      for (const [z, r] of [[-0.05, 0.08], [0.04, -0.06]]) g.push(P(new THREE.BoxGeometry(0.03, 0.004, 0.09), PAPER, { p: [0, 0.08, z], r: [r, 0, 0] }));
      for (const z of [-0.06, 0.06]) g.push(P(new THREE.BoxGeometry(0.058, 0.168, 0.005), STRING, { p: [0, 0, z] }));
      g.push(P(new THREE.BoxGeometry(0.004, 0.07, 0.08), MAP, { p: [0.004, 0.095, 0.05], r: [0.18, 0, 0] }));
      break;
    }
    case 'lily_notebook': {   // a smaller cloth-bound notebook, a pressed lily on its cover
      for (const x of [-0.016, 0.016]) g.push(P(new THREE.BoxGeometry(0.007, 0.13, 0.18), CLOTH, { p: [x, 0, 0] }));
      g.push(P(new THREE.BoxGeometry(0.04, 0.01, 0.18), CLOTH, { p: [0, -0.065, 0] }));
      g.push(P(new THREE.BoxGeometry(0.026, 0.12, 0.172), PAPER, { p: [0, 0.003, 0] }));
      for (const a of [-0.7, 0, 0.7]) g.push(P(new THREE.SphereGeometry(0.012, 6, 4), LILY, { s: [0.2, 1.7, 0.7], r: [a, 0, 0], p: [0.021, 0.012 + Math.cos(a) * 0.016, Math.sin(a) * 0.016] }));
      g.push(P(new THREE.BoxGeometry(0.003, 0.05, 0.004), MOSS, { p: [0.021, -0.03, 0] }));
      break;
    }
    // ---- Sporewood's treasures (LAKE 2, lane S; LAKE2.md §7.3): one a grade, each ≤ 400 triangles
    case 'seed_jar': {   // a squat cream stoneware jar laid along the hand, its amber glaze band, its neck sealed with plum wax and tied with twine
      g.push(P(new THREE.CylinderGeometry(0.042, 0.046, 0.085, 12), CREAM, { r: RZ, p: [0, 0, -0.02] }));
      g.push(P(new THREE.SphereGeometry(0.046, 12, 4, 0, Math.PI * 2, 0, Math.PI / 2), CREAM, { r: RZ, p: [0, 0, 0.022], s: [1, 0.5, 1] }));
      g.push(P(new THREE.CylinderGeometry(0.0475, 0.0475, 0.016, 12), AMBER, { r: RZ, p: [0, 0, -0.03] }));
      g.push(P(new THREE.CylinderGeometry(0.024, 0.026, 0.026, 10), CREAM, { r: RZ, p: [0, 0, 0.05] }));
      g.push(P(new THREE.CylinderGeometry(0.029, 0.027, 0.016, 10), PLUM, { r: RZ, p: [0, 0, 0.068] }));
      g.push(P(new THREE.TorusGeometry(0.026, 0.0035, 3, 12), CORD2, { p: [0, 0, 0.056] }));
      g.push(P(new THREE.CylinderGeometry(0.0022, 0.0022, 0.03, 3), CORD2, { p: [0.004, -0.04, 0.056], r: [0, 0, 0.3] }));
      break;
    }
    case 'skep_lid': {   // a woven straw dome off a bee-skep, its face to the lens: coil on coil (stepped bands), bound in darker straw, a knob at its crown
      const h = 0.072, R = 0.17, n = 5, rAt = (x) => R * Math.sqrt(Math.max(0, 1 - (x / h) ** 2));
      for (let i = 0; i < n; i++) {
        const xa = (h * 0.92 * i) / n, xb = (h * 0.92 * (i + 1)) / n;
        g.push(P(new THREE.CylinderGeometry(rAt(xb) + 0.004, rAt(xa) + 0.004, xb - xa, 12), i % 2 ? STRAW_DK : STRAW, { r: [0, 0, -Math.PI / 2], p: [(xa + xb) / 2, 0, 0] }));   // (closed: its underside reads as the lid's flat weave as the show turns it)
      }
      g.push(P(new THREE.CylinderGeometry(0.0005, rAt(h * 0.92) + 0.004, h * 0.08, 12), STRAW, { r: [0, 0, -Math.PI / 2], p: [h * 0.96, 0, 0] }));
      g.push(P(new THREE.TorusGeometry(0.168, 0.012, 3, 14), STRAW_DK, { r: [0, Math.PI / 2, 0] }));
      g.push(P(new THREE.SphereGeometry(0.022, 6, 3), STRAW_DK, { p: [h + 0.008, 0, 0], s: [0.8, 1, 1] }));
      // (LAKE 2, the art pass: held square to the lens the dome read as a flat cream disc before the face; tipped back, its crown up
      // and toward the lens, the lens sees it from below its crown, coil over coil, as a straw dome)
      for (const q of g) q.rotateZ(0.95);
      break;
    }
    case 'gardeners_trowel': {   // a garden trowel: a brass scoop worn bright on one side, its shank, a turned wooden handle with a ferrule
      g.push(P(new THREE.SphereGeometry(0.05, 10, 6), BRASS, { s: [0.24, 1, 1.75], p: [0, 0.004, 0.075] }));   // the blade, its face to the lens
      g.push(P(new THREE.SphereGeometry(0.046, 8, 5), GOLD, { s: [0.14, 0.82, 1.55], p: [0.006, 0.012, 0.08] }));   // the bright side, worn
      g.push(P(new THREE.CylinderGeometry(0.006, 0.008, 0.06, 6), BRASS_DK, { r: RZ, p: [0, 0.006, -0.02] }));
      g.push(P(new THREE.CylinderGeometry(0.016, 0.016, 0.014, 8), BRASS, { r: RZ, p: [0, 0.008, -0.052] }));
      g.push(P(new THREE.CylinderGeometry(0.015, 0.019, 0.1, 8), WOOD, { r: RZ, p: [0, 0.008, -0.11] }));
      g.push(P(new THREE.SphereGeometry(0.019, 8, 4), WOOD, { p: [0, 0.008, -0.16], s: [1, 1, 0.6] }));
      break;
    }
    case 'cloche_handle': {   // the glass knob off a garden bell-glass, a ragged collar of the bell still on it (pale glass, never a glint)
      g.push(P(new THREE.SphereGeometry(0.026, 10, 6), GLASS, { p: [0, 0, 0.026] }));
      g.push(P(new THREE.CylinderGeometry(0.012, 0.016, 0.022, 8), GLASS, { r: RZ, p: [0, 0, 0] }));
      for (let i = 0; i < 5; i++) { const a = 0.4 + i * 1.18; g.push(P(new THREE.BoxGeometry(0.004, 0.028 + (i % 2) * 0.012, 0.03), GLASS, { r: [0.9, a, 0], p: [Math.sin(a) * 0.022, Math.cos(a) * 0.022, -0.026] })); }   // shards of the bell
      g.push(P(new THREE.TorusGeometry(0.018, 0.003, 3, 10), MOSS, { p: [0, 0, -0.008] }));   // a thread of moss where it lay
      break;
    }
    case 'seedkeeper_casket': {   // a seed-keeper's dark casket bound in brass, its lid a little open on its seeds, a brass lock-plate
      g.push(P(new THREE.BoxGeometry(0.13, 0.1, 0.28), WOOD_DK, { p: [0, -0.02, 0] }));
      g.push(P(new THREE.CylinderGeometry(0.066, 0.066, 0.28, 10, 1, false, Math.PI / 2, Math.PI), WOOD_DK, { r: [Math.PI / 2, 0, 0], p: [0, 0.03, 0], s: [1, 1, 0.55] }));   // the lid's low dome along it
      for (const z of [-0.12, 0, 0.12]) g.push(P(new THREE.BoxGeometry(0.136, 0.104, 0.014), BRASS, { p: [0, -0.02, z] }));
      g.push(P(new THREE.BoxGeometry(0.008, 0.04, 0.036), BRASS, { p: [0.068, 0.005, 0] }));
      g.push(P(new THREE.SphereGeometry(0.006, 6, 3), GOLD, { p: [0.073, 0.005, 0] }));
      for (const [x, z] of [[0.03, -0.07], [-0.02, -0.02], [0.035, 0.04], [-0.03, 0.08], [0.0, 0.1]]) g.push(P(new THREE.SphereGeometry(0.009, 5, 3), x > 0 ? AMBER : SEED, { s: [0.7, 0.6, 1.2], p: [x, 0.036, z] }));
      g.push(P(new THREE.BoxGeometry(0.06, 0.004, 0.2), MOSS, { p: [0, -0.07, 0] }));   // the moss it lay on
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
  const mat = toonMaterial({ color: 0xffffff, vertexColors: true, rim: 0.25, rimPower: 0.68, gloss: 0.35, shine: 30 });
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
      // (a brief glint at the middle of the turn, never a wash: the object keeps its own colours under the lantern)
      const gk = Math.max(0, Math.sin(Math.PI * turned)) ** 6, g = gk * (jackpot ? 0.2 : 0.1) * Math.min(1.5, glowK);
      mat.emissive.setRGB(g * 1.0, g * 0.78, g * 0.4);
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
