// actors-wick.js — the Wick: a small round candle-creature in a dark cloak with a living
// flame on its head, amber eyes in a shadowed face and stubby legs. Built procedurally;
// every pose is a procedural function blended by critically-damped springs.
import * as THREE from 'three';
import { INK, PALE, toonMaterial, addOutline, glowSprite } from './toon.js';
import { TAU, deformToon, deformOutline, outlineMesh, xf, paint, attr, mergeGeos, tube, bezierPts, blob, spike, smoothNormals, hexColor, shadowTexture } from './models-kit.js';
import { makeFlame } from './actors-fx.js';

const damp = THREE.MathUtils.damp;
const clamp = THREE.MathUtils.clamp;
const smooth = (a, b, x) => THREE.MathUtils.smoothstep(x, a, b);
const wrapPi = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export const ONE_SHOT = { cast: 0.5, hookset: 0.42, eat: 1.7, flare: 0.95, zap: 0.38, hurt: 0.55, celebrate: 1.5, levelup: 1.35, toss: 0.8, die: 1e9 };
const BRAZIER_YAW = Math.atan2(-0.74, 0.68); // raft-local direction from the Wick's spot to the brazier
export const CONTINUOUS = new Set(['idle', 'paddle', 'charge', 'wait', 'reel', 'strain', 'catch', 'measurePalm', 'measureArms', 'measureHang', 'measureAlongside',
  'showPinch', 'showBoth', 'showHug', 'showHang', 'showAlongside']);
// v3 measuring poses (DESIGN §25.6.8; CONTRACT §13.7 actors setPose): chosen by the fish's length, the Wick is 0.85 m
export const MEASURE = new Set(['measurePalm', 'measureArms', 'measureHang', 'measureAlongside']);
// the show (docs/v3/show/SPEC.md §2.2): the Wick turned to the lens, presenting its catch. The body is posed here; the hands are
// locked by IK onto the fish and the rod (actors-show.js gives the world targets), and the rod is planted or set down as a prop
export const SHOW = new Set(['showPinch', 'showBoth', 'showHug', 'showHang', 'showAlongside']);
const SHOULDER_Y = 0.43, SHOULDER_X = 0.19, SHOULDER_Z = 0.03, ARM = 0.17;
const BUILDS = { wick: [1, 1, 1], taper: [0.86, 1.12, 0.86], stub: [1.04, 0.94, 1.04], tallow: [1.12, 0.88, 1.12], ashwick: [0.97, 1.03, 0.97], glimmer: [1, 1, 1] };
// per-character flame shape [width, height] and eye shape [w, h] (DESIGN §11/§19.7)
const FLAMES = { stub: [1.45, 1.55], tallow: [1.15, 0.72], taper: [0.9, 1.1] };
const EYES = { ashwick: [1.25, 0.38] };
const DEFAULT_LOOK = { flame: 0xffb347, cloak: 0x4a2e24, eyes: 0xffb347, hat: 'none', wax: 0xe9dfc6 };

const ROD_PARS = /* glsl */`
uniform vec2 uBend; uniform float uLen;
void gwDeform(inout vec3 p, inout vec3 n) {
  float u = clamp(p.y / uLen, 0.0, 1.0), u2 = u * u;
  p.x += uBend.x * uLen * u2; p.z += uBend.y * uLen * u2;
  p.y -= 0.5 * dot(uBend, uBend) * uLen * u2 * u;
}`;
const CLOAK_PARS = /* glsl */`
uniform float uT; uniform vec2 uWind;
void gwDeform(inout vec3 p, inout vec3 n) {
  float low = clamp((0.3 - p.y) / 0.22, 0.0, 1.0);
  float a = atan(p.z, p.x);
  p.x += (sin(uT * 3.1 + a * 3.0) * 0.012 + uWind.x * 0.06) * low;
  p.z += (cos(uT * 2.7 + a * 4.0) * 0.012 + uWind.y * 0.06) * low;
  p.y += sin(uT * 4.0 + a * 7.0) * 0.006 * low;
}`;

function neutral(o) {
  o.y = 0; o.pitch = 0; o.roll = 0; o.twist = 0; o.sq = 0;
  o.hPitch = 0; o.hYaw = 0; o.hRoll = 0;
  o.rRaise = 0.8; o.rOut = 0.22; o.lRaise = 0.15; o.lOut = 0.28; o.rStretch = 1; o.lStretch = 1;
  o.rod = 0.6; o.rodYaw = 0; o.legL = 0; o.legR = 0;
  o.flame = 0; o.eye = 1; o.eyeLift = 0; o.glow = 1; o.melt = 0; o.paddleRoll = 0; o.paddleYaw = 0;
  return o;
}
const KEYS = Object.keys(neutral({}));

export function createWick(ctx, { raftDeck, deckY = 0.24 }) {
  const mats = [];
  const M = (m) => { mats.push(m); return m; };
  const group = new THREE.Group(); group.name = 'wick';
  const root = new THREE.Group(); group.add(root);
  const squash = new THREE.Group(); root.add(squash);
  const body = new THREE.Group(); squash.add(body);

  // ---------------------------------------------------------------- palette + materials
  // Rigid parts are merged per bone into vertex-coloured meshes (few draw calls); the palette
  // is repainted by setLook() so every character look still works.
  const PAL = { WAX: 0, CLOAK: 1, DARK: 2, FACE: 3, CLASP: 4, HAT: 5, WICK: 6, WOOD: 7, CORK: 8, METAL: 9, PATCH: 10, BONE: 11 };
  const palette = [DEFAULT_LOOK.wax, DEFAULT_LOOK.cloak, 0x1c1512, 0x0b0807, 0xb08a4a, 0x2a1c16, 0x0a0806, 0x4a3a2a, 0x8a6a48, 0x4a4d52, 0x6a4a34, 0xdcd2b8].map((c) => new THREE.Color(c));
  const painted = [];
  const tag = (g, idx) => attr(g, 'aPal', 1, idx);
  function repaint(g) {
    const pal = g.attributes.aPal, n = pal.count;
    let col = g.attributes.color;
    if (!col || col.count !== n) { col = new THREE.BufferAttribute(new Float32Array(n * 3), 3); g.setAttribute('color', col); }
    for (let i = 0; i < n; i++) { const c = palette[pal.getX(i) | 0] || palette[0]; col.setXYZ(i, c.r, c.g, c.b); }
    col.needsUpdate = true;
  }
  const build = (list) => { const g = mergeGeos(list); painted.push(g); repaint(g); return g; };
  const OL = 0.018;
  const outlineOf = (mesh, th = OL) => { const tmp = new THREE.Mesh(smoothNormals(mesh.geometry)); const ol = addOutline(tmp, { thickness: th }); tmp.remove(ol); mesh.add(ol); return mesh; };
  const rigidMat = M(toonMaterial({ color: 0xffffff, vertexColors: true, rim: 0.34, rimPower: 0.6 }));
  const headMat = M(toonMaterial({ color: 0xffffff, vertexColors: true, rim: 0.32, rimPower: 0.6 }));
  const hatMat = M(toonMaterial({ color: 0xffffff, vertexColors: true, rim: 0.4, side: THREE.DoubleSide }));
  const cloakU = { uT: { value: 0 }, uWind: { value: new THREE.Vector2() } };
  const cloakSpec = { key: 'wickCloak', uniforms: cloakU, pars: CLOAK_PARS };
  const cloakMat = M(deformToon({ color: 0xffffff, vertexColors: true, rim: 0.42, rimPower: 0.58 }, cloakSpec));
  const cloakOutline = M(deformOutline({ thickness: 0.02 }, cloakSpec));
  const eyeMat = M(new THREE.MeshBasicMaterial({ color: new THREE.Color(DEFAULT_LOOK.eyes).multiplyScalar(3), toneMapped: false, fog: true }));
  // measuring close-ups (the trophy camera 1.6–5 m away, the lantern hanging right over the Wick): the pale wax under the
  // lantern would read as one white blot, so the Wick's own exposure comes down with the camera's nearness: the wax and the
  // cloth darken toward their lit tones, and the pale toon rims turn lantern-warm and soft (k = how far each one comes down)
  const EXPO = [{ m: headMat, k: 0.52 }, { m: rigidMat, k: 0.45 }, { m: hatMat, k: 0.25 }, { m: cloakMat, k: 0.25 }]
    .map((e) => ({ ...e, rim: e.m.userData.rim, col: e.m.userData.rim.gwRimColor.value.clone(), str: e.m.userData.rim.gwRimStrength.value }));
  const RIM_WARM = new THREE.Color(0xffb878);
  let expo = 0;
  function applyExposure(k) {
    if (k === expo) return;
    expo = k;
    for (const e of EXPO) {
      e.m.color.setScalar(1 - e.k * k);
      e.rim.gwRimColor.value.copy(e.col).lerp(RIM_WARM, k);
      e.rim.gwRimStrength.value = e.str * (1 - 0.6 * k);
    }
  }

  // ---------------------------------------------------------------- legs (leg + wax foot per bone)
  const legs = [];
  for (const side of [1, -1]) {
    const hip = new THREE.Group(); hip.position.set(side * 0.085, 0.14, 0); squash.add(hip);
    const g = build([tag(xf(new THREE.CapsuleGeometry(0.052, 0.06, 4, 8), { p: [0, -0.07, 0] }), PAL.DARK), tag(blob(0.06, 0.035, 0.075, [0, -0.125, 0.02], 10, 6), PAL.WAX)]);
    hip.add(outlineOf(new THREE.Mesh(g, rigidMat)));
    legs.push(hip);
  }

  // ---------------------------------------------------------------- cloak (round body) + collar + clasp
  const prof = [[0.0, 0.07], [0.2, 0.075], [0.262, 0.1], [0.285, 0.18], [0.282, 0.27], [0.25, 0.37], [0.2, 0.45], [0.15, 0.5], [0.13, 0.53], [0.0, 0.535]];
  const cloakGeo = new THREE.LatheGeometry(prof.map((p) => new THREE.Vector2(p[0], p[1])), 28);
  { // ragged hem
    const p = cloakGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      if (y < 0.11) { const a = Math.atan2(z, x); p.setY(i, y - Math.pow(Math.max(0, Math.sin(a * 2 + 0.7)), 6) * 0.06 - Math.pow(Math.max(0, Math.sin(a * 2 - 0.9)), 8) * 0.045 - Math.max(0, Math.sin(a * 9)) * 0.008); }
    }
    cloakGeo.computeVertexNormals();
  }
  attr(cloakGeo, 'aPal', 1, (x, y, z) => { const a = Math.atan2(z, x); return ((a > 2.1 && a < 2.7 && y > 0.17 && y < 0.3) || (a > -0.9 && a < -0.35 && y > 0.28 && y < 0.4)) ? PAL.PATCH : PAL.CLOAK; });
  const bodyGeo = build([cloakGeo, tag(xf(new THREE.TorusGeometry(0.14, 0.036, 6, 20), { r: [Math.PI / 2, 0, 0], p: [0, 0.5, 0] }), PAL.WAX), tag(blob(0.025, 0.025, 0.015, [0, 0.47, 0.17], 8, 6), PAL.CLASP)]);
  const cloak = new THREE.Mesh(bodyGeo, cloakMat); cloak.name = 'cloak';
  cloak.add(outlineMesh(smoothNormals(bodyGeo), cloakOutline));
  body.add(cloak);

  // ---------------------------------------------------------------- arms (sleeve + wax hand per bone)
  const arms = {};
  for (const [key, side] of [['r', -1], ['l', 1]]) {
    const sh = new THREE.Group(); sh.position.set(side * 0.19, 0.43, 0.03); body.add(sh);
    // (the sleeve and the wax hand are two meshes: a sleeve stretches with the arm, and so does the hand, as it always has, except
    // in a show pose, where the hand that holds the fish stays round: update() sets fist.scale.y)
    const g = build([tag(xf(new THREE.CapsuleGeometry(0.045, 0.1, 4, 8), { p: [0, -0.08, 0] }), PAL.CLOAK)]);
    const sleeve = outlineOf(new THREE.Mesh(g, rigidMat)); sh.add(sleeve);
    const hand = new THREE.Group(); hand.position.set(0, -0.17, 0); sh.add(hand);
    const fist = outlineOf(new THREE.Mesh(build([tag(new THREE.SphereGeometry(0.046, 10, 8), PAL.WAX)]), rigidMat)); hand.add(fist);
    arms[key] = { sh, hand, sleeve, fist, side };
  }

  // ---------------------------------------------------------------- head: wax + drips + shadowed face + wick string
  const head = new THREE.Group(); head.position.set(0, 0.5, 0.01); body.add(head);
  const headProf = [[0.0, -0.03], [0.12, -0.01], [0.19, 0.06], [0.212, 0.15], [0.205, 0.24], [0.188, 0.3], [0.175, 0.335], [0.15, 0.345], [0.12, 0.33], [0.05, 0.318], [0.0, 0.316]];
  const headGeo = new THREE.LatheGeometry(headProf.map((p) => new THREE.Vector2(p[0], p[1])), 26);
  { const p = headGeo.attributes.position; // uneven melted rim
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); if (y > 0.28) { const a = Math.atan2(z, x); p.setY(i, y + Math.sin(a * 5 + 1) * 0.007 + Math.sin(a * 9) * 0.004); } }
    headGeo.computeVertexNormals(); }
  const headParts = [tag(headGeo, PAL.WAX)];
  [[0.85, 0.1], [2.45, 0.07], [3.6, 0.12], [5.3, 0.09]].forEach(([a, len]) => {
    const r = 0.196, x = Math.cos(a) * r, z = Math.sin(a) * r;
    headParts.push(tag(blob(0.022, len * 0.65, 0.02, [x, 0.285 - len * 0.55, z], 8, 6, [0, -a, 0]), PAL.WAX));
    headParts.push(tag(blob(0.026, 0.026, 0.024, [x * 1.01, 0.285 - len * 1.12, z * 1.01], 8, 6), PAL.WAX));
  });
  headParts.push(tag(blob(0.15, 0.115, 0.07, [0, 0.135, 0.155], 16, 12), PAL.FACE));
  const wickStrGeo = tag(tube(bezierPts([[0, 0.31, 0], [0.005, 0.345, 0], [-0.01, 0.37, 0.004]], 5), (u) => 0.011 - u * 0.004, 5), PAL.WICK);
  const waxHead = outlineOf(new THREE.Mesh(build(headParts), headMat)); waxHead.name = 'wax';
  head.add(waxHead);
  const wickStr = new THREE.Mesh(build([wickStrGeo]), rigidMat); head.add(wickStr);
  const eyes = new THREE.Group(); eyes.position.set(0, 0.14, 0.212); head.add(eyes);
  eyes.add(new THREE.Mesh(mergeGeos([blob(0.033, 0.045, 0.02, [0.062, 0, 0], 10, 8, [0, 0, -0.12]), blob(0.033, 0.045, 0.02, [-0.062, 0, 0], 10, 8, [0, 0, 0.12])]), eyeMat));

  // hats ------------------------------------------------------------
  const hats = {};
  { // hood: shell around the back of the head, open face & crown hole for the flame
    const g = new THREE.SphereGeometry(0.245, 20, 12, Math.PI * 0.68, Math.PI * 1.64, Math.PI * 0.14, Math.PI * 0.5);
    g.translate(0, 0.14, -0.015);
    const hood = outlineOf(new THREE.Mesh(build([tag(g, PAL.HAT), tag(spike([0, 0.28, -0.2], [0, 0.35, -1], 0.07, 0.2, 8), PAL.HAT)]), hatMat), 0.014);
    hats.hood = { obj: hood, flameY: 0.37 };
  }
  { // tall: crooked chimney hat with an open top
    const pts = [[0.2, 0.25], [0.19, 0.3], [0.17, 0.4], [0.16, 0.5], [0.155, 0.6], [0.15, 0.64], [0.12, 0.655], [0.0, 0.645]];
    const g = new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), 18);
    const pp = g.attributes.position; for (let i = 0; i < pp.count; i++) { const y = pp.getY(i); pp.setX(i, pp.getX(i) + Math.pow(Math.max(0, y - 0.3), 2) * 0.35); if (y > 0.63) { const a = Math.atan2(pp.getZ(i), pp.getX(i)); pp.setY(i, y + Math.sin(a * 5) * 0.008); } }
    g.computeVertexNormals();
    const drip2 = [blob(0.02, 0.05, 0.02, [0.13, 0.5, 0.05], 6, 5), blob(0.024, 0.024, 0.022, [0.135, 0.45, 0.05], 6, 5), blob(0.018, 0.04, 0.018, [-0.06, 0.55, 0.09], 6, 5)];
    const tall = outlineOf(new THREE.Mesh(build([tag(g, PAL.WAX), ...drip2.map((d) => tag(d, PAL.WAX)), tag(xf(new THREE.TorusGeometry(0.2, 0.025, 5, 20), { r: [Math.PI / 2, 0, 0], p: [0, 0.265, 0] }), PAL.WAX)]), headMat), 0.014);
    hats.tall = { obj: tall, flameY: 0.67, flameX: 0.04 };
  }
  { // brim: wide floppy brim + low crown with a hole
    const crown = new THREE.LatheGeometry([[0.19, 0.27], [0.185, 0.33], [0.15, 0.38], [0.07, 0.395]].map((p) => new THREE.Vector2(p[0], p[1])), 20);
    const brimG = new THREE.RingGeometry(0.17, 0.4, 28, 2); brimG.rotateX(-Math.PI / 2); brimG.translate(0, 0.275, 0);
    const bp = brimG.attributes.position; for (let i = 0; i < bp.count; i++) { const x = bp.getX(i), z = bp.getZ(i), r = Math.hypot(x, z); bp.setY(i, bp.getY(i) - Math.max(0, r - 0.2) * (0.25 + 0.15 * Math.sin(Math.atan2(z, x) * 3))); }
    brimG.computeVertexNormals();
    hats.brim = { obj: new THREE.Mesh(build([tag(crown, PAL.HAT), tag(brimG, PAL.HAT)]), hatMat), flameY: 0.4 };
  }
  for (const h of Object.values(hats)) { h.obj.visible = false; head.add(h.obj); }

  // flame ------------------------------------------------------------
  const flameAnchor = new THREE.Group(); flameAnchor.position.set(0, 0.355, 0); head.add(flameAnchor);
  const flame = makeFlame({ color: DEFAULT_LOOK.flame, size: 1, glow: 0.75 });
  flameAnchor.add(flame.group);
  mats.push(...flame.mats);

  // ---------------------------------------------------------------- rod (in hand; rod + cork grip + reel merged) + stowed copy
  const ROD_L = 2.05;
  const rodU = { uBend: { value: new THREE.Vector2() }, uLen: { value: ROD_L } };
  const rodSpec = { key: 'wickRod', uniforms: rodU, pars: ROD_PARS };
  const rodGeo = new THREE.CylinderGeometry(0.0055, 0.017, ROD_L, 6, 18); rodGeo.translate(0, ROD_L / 2, 0);
  { const p = rodGeo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setX(i, p.getX(i) + Math.sin(y * 2.3) * 0.012); } } // crooked
  const rodAll = build([tag(rodGeo, PAL.WOOD), tag(xf(new THREE.CylinderGeometry(0.022, 0.024, 0.3, 8), { p: [0, 0.02, 0] }), PAL.CORK),
    tag(xf(new THREE.CylinderGeometry(0.042, 0.042, 0.035, 12), { r: [0, 0, Math.PI / 2], p: [0, 0.22, 0.045] }), PAL.BONE)]);
  const rodMat = M(deformToon({ color: 0xffffff, vertexColors: true, rim: 0.35 }, rodSpec));
  const rodOutline = M(deformOutline({ thickness: 0.006 }, rodSpec));
  const rodMount = new THREE.Group(); arms.r.hand.add(rodMount);
  const rod = new THREE.Group(); rod.name = 'rod'; rodMount.add(rod);
  const rodMesh = new THREE.Mesh(rodAll, rodMat); rodMesh.add(outlineMesh(smoothNormals(rodAll), rodOutline)); rod.add(rodMesh);
  const crank = new THREE.Group(); crank.position.set(0.025, 0.22, 0.045); rod.add(crank);
  crank.add(new THREE.Mesh(build([tag(xf(new THREE.BoxGeometry(0.012, 0.07, 0.012), { p: [0, 0.03, 0] }), PAL.METAL), tag(xf(new THREE.SphereGeometry(0.014, 6, 5), { p: [0.012, 0.062, 0] }), PAL.CORK)]), rigidMat));
  const rodTipLocal = new THREE.Vector3(0, ROD_L, 0);
  const bellMat = M(toonMaterial({ color: 0xc09048, rim: 0.6, emissive: 0x3a2408 }));
  const rodBell = new THREE.Group(); rod.add(rodBell);
  rodBell.add(new THREE.Mesh(xf(new THREE.LatheGeometry([[0, 0], [0.012, -0.004], [0.018, -0.02], [0.024, -0.036], [0.021, -0.038]].map((p) => new THREE.Vector2(p[0], p[1])), 8), { p: [0, -0.012, 0] }), bellMat));
  const tipGlint = glowSprite({ color: 0xfff0d0, size: 0.09, opacity: 0.6 }); rod.add(tipGlint); mats.push(tipGlint.material);
  // stowed rod in the bow holder (raft space)
  const stowed = new THREE.Group(); stowed.name = 'rodStowed';
  stowed.position.set(0.78, deckY, 0.98); stowed.rotation.set(0.55, 0, -0.25);
  stowed.add(outlineOf(new THREE.Mesh(rodAll, rigidMat), 0.006));
  const stowedTip = new THREE.Object3D(); stowedTip.position.set(0, ROD_L, 0); stowed.add(stowedTip);
  raftDeck.add(stowed);

  // ---------------------------------------------------------------- double-bladed paddle (hands) + stowed copy
  const paddleGeo = build([tag(xf(new THREE.CylinderGeometry(0.016, 0.016, 1.5, 6), { r: [0, 0, Math.PI / 2] }), PAL.WOOD),
    tag(blob(0.13, 0.012, 0.06, [0.8, 0, 0], 10, 6), PAL.WOOD), tag(blob(0.13, 0.012, 0.06, [-0.8, 0, 0], 10, 6), PAL.WOOD)]);
  const paddleRig = new THREE.Group(); paddleRig.position.set(0, 0.34, 0.26); body.add(paddleRig);
  const paddle = outlineOf(new THREE.Mesh(paddleGeo, rigidMat), 0.01); paddleRig.add(paddle);
  const paddleStowed = outlineOf(new THREE.Mesh(paddleGeo, rigidMat), 0.01);
  paddleStowed.position.set(0.74, deckY + 0.03, -0.25); paddleStowed.rotation.set(0, Math.PI / 2 + 0.06, 0);
  raftDeck.add(paddleStowed);

  // ---------------------------------------------------------------- catch anchor (small fish held up in front)
  const holdAnchor = new THREE.Group(); holdAnchor.name = 'holdAnchor'; holdAnchor.position.set(0, 0.4, 0.42); body.add(holdAnchor);

  // ---------------------------------------------------------------- blob shadow on the deck
  const shadowMat = M(new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, opacity: 0.55, depthWrite: false, fog: true }));
  shadowMat.polygonOffset = true; shadowMat.polygonOffsetFactor = -1; shadowMat.polygonOffsetUnits = -1;
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), shadowMat);
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.006; shadow.renderOrder = 1; shadow.userData.noReflect = true;
  group.add(shadow);

  // ---------------------------------------------------------------- state
  const cur = neutral({}), tgt = neutral({});
  let base = 'idle', explicitBase = null, action = null, actionT = 0, dead = false, poseT = 0;
  let charge = 0, reelK = 0, reelLat = 0, aimYaw = null, aimHold = 0, pointYaw = null;
  let vitality = 1, flameK = 1, flameOut = false, blinkT = 2, blink = 0, paddlePhase = 0, crankPhase = 0, facing = 0;
  let look = { ...DEFAULT_LOOK }, buildS = BUILDS.wick, flameBaseY = 0.355, flameBaseX = 0;
  let flareK = 0;   // the landing's flare of the head flame (flareFlame), decaying
  let introKindle = null;   // INTRO LANE A: the opening cut scene's multiplier on the head flame (0 … 1), or null
  let flash = 0, smokeT = 0, catchBig = false, holding = false, flameShape = [1, 1], eyeShape = [1, 1], lastEmber = 0.21, bellSwing = 0, bellV = 0, dripT = 4;
  // measuring: the held fish's length in body units, the alongside side (+1 = the raft's +x), the stamp impulse
  const meas = { lenB: 0.4, side: 1, stamp: 0, faceYaw: null };
  const last = {}, ARM_KEYS = ['rRaise', 'rOut', 'rStretch', 'lRaise', 'lOut', 'lStretch'], STRETCH_KEYS = new Set(['rStretch', 'lStretch']), JOINT_RATE = 9.6, STRETCH_CAP = 2.4, TURN_BACK = 3.2, TURN_WAIT = 0.2;
  let showCool = 0;
  // the show: the spec actors-show.js keeps current every frame (null outside a show), the hands' IK locks (world targets), and the
  // rod as a prop (planted by its butt at a world point, or set down on the bow rest)
  let sh = null;
  const lock = { r: { k: 0, pos: new THREE.Vector3(), max: 2.4 }, l: { k: 0, pos: new THREE.Vector3(), max: 2.4 } };
  const rodDrive = { k: 0, butt: new THREE.Vector3(), dir: new THREE.Vector3(0, 1, 0), scale: 0, stow: 0, driven: false };
  const ikPose = {}, roundK = { r: 0, l: 0 };
  const flameCol = new THREE.Color(DEFAULT_LOOK.flame), baseFlameCol = new THREE.Color(DEFAULT_LOOK.flame);
  const tmpV = new THREE.Vector3(), tmpV2 = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), tmpM = new THREE.Matrix4();

  function setLook(l = {}) {
    look = { ...DEFAULT_LOOK, ...(l || {}) };
    const cloakC = new THREE.Color(hexColor(look.cloak, DEFAULT_LOOK.cloak));
    palette[PAL.WAX].set(hexColor(look.wax, DEFAULT_LOOK.wax));
    palette[PAL.CLOAK].copy(cloakC);
    palette[PAL.DARK].copy(cloakC).multiplyScalar(0.45);
    palette[PAL.HAT].copy(cloakC).multiplyScalar(look.hat === 'hood' ? 0.9 : 0.62);
    for (const g of painted) repaint(g);
    eyeMat.color.set(hexColor(look.eyes, DEFAULT_LOOK.eyes)).multiplyScalar(3);
    flameCol.set(hexColor(look.flame, DEFAULT_LOOK.flame));
    baseFlameCol.copy(flameCol);
    flameShape = look.flameShape || FLAMES[look.id] || [1, 1];
    eyeShape = look.eyeShape || EYES[look.id] || [1, 1];
    applyFlameColor();
    const charred = (look.id === 'ashwick') || new THREE.Color(look.wax).getHSL({}).l < 0.4;
    headMat.userData.charred = charred; headMat.emissiveIntensity = 1;
    for (const [k, h] of Object.entries(hats)) h.obj.visible = k === look.hat;
    const h = hats[look.hat];
    flameBaseY = h?.flameY ?? 0.355; flameBaseX = h?.flameX ?? 0;
    wickStr.visible = !h || look.hat === 'hood';
    const b = Array.isArray(look.build) ? look.build : typeof look.build === 'number' ? [look.build, look.build, look.build] : BUILDS[look.id] || BUILDS.wick;
    const sc = Number.isFinite(look.scale) && look.scale > 0 ? look.scale : 1;
    buildS = [b[0] * sc, b[1] * sc, b[2] * sc];
  }

  function setPose(name) {
    if (!name) { explicitBase = null; return; }
    if (name === 'render') name = 'toss';
    if (ONE_SHOT[name] !== undefined) {
      if (dead && name !== 'die') return;
      if (action === name && actionT < 0.15) return;
      action = name; actionT = 0;
      if (name === 'hurt') flash = 1;
      if (name === 'die') dead = true;
      if (name === 'levelup' || name === 'celebrate') sparks(name === 'levelup' ? 14 : 8);
      return;
    }
    if (CONTINUOUS.has(name)) explicitBase = name;
  }
  function revive() { dead = false; action = null; flameOut = false; explicitBase = null; cur.melt = 0; }
  // Flame colour follows vitality (DESIGN §19.7): the look's colour when healthy, orange-red and
  // shorter below 50%, a guttering pale blue at the last Ember.
  const RED = new THREE.Color(0xff5a2a), BLUE = new THREE.Color(0xa2c8ff), CORE = new THREE.Color(0xfff2c8), CORE_BLUE = new THREE.Color(0xe8f6ff);
  function applyFlameColor() {
    const v = vitality;
    if (v <= lastEmber) flameCol.copy(BLUE);
    else if (v < 0.5) flameCol.copy(baseFlameCol).lerp(RED, Math.min(1, (0.5 - v) / Math.max(0.05, 0.5 - lastEmber) * 1.2));
    else flameCol.copy(baseFlameCol);
    flame.outerMat.uniforms.uColor.value.copy(flameCol);
    flame.innerMat.uniforms.uColor.value.copy(flameCol).lerp(v <= lastEmber ? CORE_BLUE : CORE, 0.6);
    flame.halo.material.color.copy(flameCol);
  }
  function sparks(n) {
    const p = flame.group.getWorldPosition(tmpV);
    for (let i = 0; i < n; i++) ctx.models?.emitEmber?.(p, { color: flameCol.getHex(), vy: 2.2, spread: 1.6, size: 0.1, sizeGrow: -0.04, lifeT: 0.9, alpha: 1, jitter: 0.15 });
  }

  // ---------------------------------------------------------------- pose functions
  /** Arm IK in body space: raise / swing / stretch the arm so its hand reaches (tx, ty, tz). */
  function reach(o, side, tx, ty, tz, maxStretch = 1.9, minStretch = 0.7) {
    const sx = side === 'r' ? -SHOULDER_X : SHOULDER_X;
    let vx = tx - sx, vy = ty - SHOULDER_Y, vz = tz - SHOULDER_Z;
    const len = Math.hypot(vx, vy, vz) || 1e-4;
    vx /= len; vy /= len; vz /= len;
    const out = Math.asin(clamp(side === 'r' ? -vx : vx, -1, 1)), raise = Math.atan2(vz, -vy), st = clamp(len / ARM, minStretch, maxStretch);
    if (side === 'r') { o.rRaise = raise; o.rOut = out; o.rStretch = st; } else { o.lRaise = raise; o.lOut = out; o.lStretch = st; }
  }
  /** The four measuring poses (DESIGN §25.6.8). Hands are placed by IK; actors puts the fish on them. */
  function poseMeasure(name, o, t) {
    const breathe = Math.sin(t * 1.7) * 0.022, L = clamp(meas.lenB, 0.02, 3), pt = poseT;
    const settle = pt < 0.55 ? Math.sin(Math.min(1, pt / 0.55) * Math.PI) : 0;   // a little lift as the pose lands
    switch (name) {
      case 'measurePalm': {   // cupped in both hands at the chest, the head bowed over it; a glance up now and then
        const s = clamp(L * 0.3, 0.035, 0.085);
        const look = Math.sin(pt * 1.25) > 0.55 ? 1 : 0;
        reach(o, 'r', -s, 0.42 + settle * 0.03, 0.38); reach(o, 'l', s, 0.42 + settle * 0.03, 0.38);   // offered up, out in front of the collar
        o.pitch = 0.1; o.sq = breathe * 0.6 + 0.02; o.y = settle * 0.02;
        o.hPitch = look ? -0.06 : 0.22; o.hRoll = Math.sin(pt * 0.7) * 0.07; o.hYaw = look ? 0 : Math.sin(pt * 0.5) * 0.08;
        o.eye = 1.25; o.glow = 1.3; o.flame = 0.18 + settle * 0.2; o.legL = 0.04; o.legR = -0.04;
        break;
      }
      case 'measureArms': {   // held up across the chest, a hand under each end, proud
        const s = clamp(L * 0.31, 0.11, 0.36), lift = 0.47 + settle * 0.06;
        reach(o, 'r', -s, lift, 0.33); reach(o, 'l', s, lift, 0.33);
        o.pitch = -0.07; o.sq = breathe + 0.03; o.y = settle * 0.06;
        o.hPitch = -0.1; o.hRoll = Math.sin(pt * 0.6) * 0.05;
        o.eye = 0.5; o.eyeLift = 0.012; o.glow = 1.35; o.flame = 0.35 + settle * 0.25; o.legL = -0.08; o.legR = 0.1;
        break;
      }
      case 'measureHang': {   // side-on, the rod reaching out and up in both hands, the fish hanging head-up off its tip
        const strain = clamp(0.15 + L * 0.12, 0.15, 0.45);
        o.rod = 0.6 - strain * 0.15; o.rRaise = 1.4; o.rOut = 0.12; o.lRaise = 1.22; o.lOut = -0.05;
        o.pitch = -0.1 - strain * 0.22 + Math.sin(pt * 1.4) * 0.02; o.sq = -0.03 + breathe * 0.5; o.twist = 0.08;
        o.hPitch = -0.34; o.hYaw = -0.32; o.eye = 0.62; o.eyeLift = 0.01; o.glow = 1.3; o.flame = 0.3 + settle * 0.2;   // looks up at it, a glance to us
        o.legL = -0.22 - strain * 0.2; o.legR = 0.26 + strain * 0.2;
        break;
      }
      case 'measureAlongside': {   // kneeling at the deck's edge over the fish, one hand on the cord's ring at its snout
        o.y = -0.065 + breathe * 0.2; o.pitch = 0.32 + Math.sin(pt * 0.9) * 0.02; o.sq = -0.04;
        reach(o, 'r', -0.06, 0.12, 0.43, 2.1);
        o.lRaise = 0.35; o.lOut = 0.32;
        o.hPitch = 0.3; o.hYaw = Math.sin(pt * 0.4) * 0.12; o.eye = 1.15; o.glow = 1.3; o.flame = 0.2;
        o.legL = -1.05; o.legR = -0.35;
        break;
      }
      default: break;
    }
    if (meas.stamp > 0) {   // the seal stamps: a satisfied little bob and the flame flares
      const k = meas.stamp;
      o.sq += Math.sin((1 - k) * Math.PI * 2) * 0.05 * k; o.flame += 0.7 * k; o.glow += 0.5 * k; o.eye = Math.min(o.eye, 0.55 + (1 - k) * 0.5);
    }
  }
  /** One arm's starting pose by its side of the show (the IK locks take over as the hands close). */
  function armTo(o, key, raise, out, stretch = 1) {
    if (key === 'r') { o.rRaise = raise; o.rOut = out; o.rStretch = stretch; } else { o.lRaise = raise; o.lOut = out; o.lStretch = stretch; }
  }
  const REST_SHOW = { side: 1, p: 1, take: 1, calm: 0, flap: 0, dip: 0, bob: 0, weight: 0, life: {}, glance: 0, special: 0, wide: 0, lensYawLocal: null, lensElev: 0, fishYawLocal: null, fishElev: 0, crouch: 0 };
  /**
   * The five show poses (docs/v3/show/SPEC.md §2.2): the Wick turned to the lens, presenting its catch. The body, the head, the legs
   * and the flame are posed here from the show's curves (sh, kept by actors-show.js: take 0..1 the hands closing, dip the squash as
   * they take the weight, p the present 0 → 1 with its overshoot, flap each twitch of the fish, calm the still of the pause); the
   * arms given here are only where the hands start from: the IK locks put them on the fish and on the rod.
   * still = the settled pose (no breath, no tremor): what the ghost rig is asked for.
   */
  function poseShow(name, o, t, still = false, faceNow = facing, twistNow = cur.twist, pitchNow = cur.pitch) {
    const S = sh || REST_SHOW, L = S.life || {}, sd = S.side === -1 ? -1 : 1;
    const near = sd > 0 ? 'l' : 'r', far = sd > 0 ? 'r' : 'l';   // the arm on the fish's side, and the other
    const ps = clamp(S.p ?? 1, 0, 1), over = (S.p ?? 1) - ps;
    const calm = clamp(S.calm || 0, 0, 1), live = 1 - calm, take = clamp(S.take ?? 1, 0, 1);   // (the pause is a still: breath and flame only)
    const breathe = still ? 0 : Math.sin(t * 1.7) * 0.022;
    const w = clamp(S.weight || 0, 0, 1), flap = still ? 0 : (S.flap || 0), dip = S.dip || 0, sp = S.special || 0;
    const strain = (L.strain || 0) * (0.3 + 0.7 * ps) * take;
    const j = still || strain < 0.01 ? 0 : (Math.sin(t * 37) * 0.028 + Math.sin(t * 23.7) * 0.018) * strain * live;   // the strain pose's tremor
    // shared: the squash as the hands take the weight, the stretch into the present, the knees giving with each flap, the proud bob
    o.sq = breathe * (0.6 + 0.4 * calm) - 0.09 * dip * (0.5 + 0.5 * w) + 0.5 * over + 0.04 * ps * (1 - w) - 0.035 * flap - 0.05 * strain;
    o.y = (S.bob || 0) - 0.02 * dip - 0.012 * flap + Math.abs(j) * 0.1;
    o.flame = (L.flame ?? 0.3) * (0.2 + 0.8 * ps) + 0.6 * over + 0.15 * sp + Math.abs(j) * 2;
    o.glow = 1.3 + 0.3 * sp;
    o.eye = (S.wide || 0) > 0.01 ? 0.5 + 0.9 * S.wide : 0.5 - (0.1 * ps + 0.1 * Math.min(1, strain * 1.3)) * live;   // the happy squint, tightest at the present
    o.eyeLift = 0.012 * ps;
    switch (name) {
      case 'showPinch': {   // one hand out to the lens (the fisherman's trick), the rod planted like a staff in the other
        // (it leans back as the arm goes out: the hand gets as far in front of the face as an arm can)
        o.twist = -sd * (0.1 + 0.26 * ps); o.pitch = 0.05 * take * (1 - ps) - 0.07 * ps + 0.3 * over - 0.05 * dip; o.roll = sd * 0.03 * ps;
        armTo(o, near, 0.9 + 0.6 * ps, 0.1, 1 + 0.9 * ps); armTo(o, far, 0.55, 0.55, 1.1);
        o.legL = 0.1 * ps; o.legR = -0.08 * ps; o.hRoll = -sd * (0.08 + (S.tiny ? 0.12 : 0)) * ps;
        break;
      }
      case 'showBoth': {   // both hands under it, pushed forward at chest height; the body leans back a little as counterweight
        o.pitch = -0.09 * dip + (0.05 - 0.13 * w) * ps + 0.25 * over; o.twist = 0;
        armTo(o, 'r', 1.0 + 0.45 * ps, 0.08, 1 + 0.8 * ps); armTo(o, 'l', 1.0 + 0.45 * ps, 0.08, 1 + 0.8 * ps);
        o.legL = -0.08 - 0.12 * w; o.legR = 0.1 + 0.12 * w; o.hRoll = Math.sin((still ? 0 : t) * 0.6) * 0.03 * live;
        break;
      }
      case 'showHug': {   // stood on its tail, heaved against the shoulder: leaning away and back, legs braced, a tremor
        o.roll = sd * (0.07 + 0.09 * strain) + j; o.pitch = -0.07 - 0.09 * strain + j * 0.3 + 0.2 * over; o.twist = sd * (0.2 + (S.hugTwist || 0)) * (0.4 + 0.6 * take);
        armTo(o, near, 1.2, 0.5, 1.3); armTo(o, far, 1.35, -0.3, 1.7);
        o.legL = -0.28 * (0.5 + 0.5 * take); o.legR = 0.3 * (0.5 + 0.5 * take); o.hRoll = -sd * (0.08 + 0.08 * ps);
        break;
      }
      case 'showHang': {   // it cannot be lifted: hung from the planted, bowing rod, the Wick hauling back on it, three-quarter
        o.pitch = -0.06 - 0.13 * strain + j * 0.3 + 0.2 * over; o.roll = sd * 0.05 * strain + j; o.twist = 0;
        armTo(o, 'r', 1.3, 0.05, 1.5); armTo(o, 'l', 1.3, 0.05, 1.5);
        o.legL = -0.2 - 0.2 * strain; o.legR = 0.24 + 0.2 * strain; o.hRoll = -sd * 0.06 * ps;
        break;
      }
      case 'showAlongside': {   // standing at the deck's edge over it, the rod planted in the far hand, the near hand on its brow
        const c = clamp(S.crouch || 0, 0, 1);
        o.y += -0.05 * c; o.pitch = 0.03 + 0.2 * c + 0.15 * over; o.roll = -sd * 0.03;
        armTo(o, near, 0.7 + 0.3 * c, 0.35, 1.6); armTo(o, far, 0.55, 0.5, 1.1);
        o.legL = -0.06 - 0.5 * c; o.legR = 0.06 - 0.15 * c; o.hRoll = -sd * 0.05;
        break;
      }
      default: break;
    }
    // the rod: whipped up as the fish swings in on the line (then it is planted, or set down: actors-show drives it as a prop)
    const sw = clamp(S.swing ?? 1, 0, 1);
    o.rod = 0.8 - 0.75 * sw;
    if (sw < 1) o.rRaise += 0.55 * Math.sin(Math.PI * sw);
    // the head: to the lens whatever the body does (it may stand three-quarter), a glance at the fish and back at us
    const g = clamp(S.glance || 0, 0, 1);
    const tw = still ? o.twist : twistNow, pt = still ? o.pitch : pitchNow;
    const ly = Number.isFinite(S.lensYawLocal) ? wrapPi(S.lensYawLocal - faceNow) - tw : 0, fy = Number.isFinite(S.fishYawLocal) ? wrapPi(S.fishYawLocal - faceNow) - tw : ly;
    o.hYaw = clamp((1 - g) * ly + g * fy, -1.05, 1.05);
    o.hPitch = clamp(-((1 - g) * (S.lensElev || 0) + g * (S.fishElev || 0)) * 0.85 - pt * 0.8, -0.5, 0.55) - 0.04 * sp;
  }
  function poseBase(name, o, t, env) {
    if (SHOW.has(name)) { poseShow(name, o, t); return; }
    if (MEASURE.has(name)) { poseMeasure(name, o, t); return; }
    const breathe = Math.sin(t * 1.7) * 0.022;
    switch (name) {
      case 'paddle': {
        const ph = paddlePhase;
        o.twist = Math.sin(ph) * 0.42; o.pitch = 0.16 + Math.abs(Math.sin(ph)) * 0.04; o.y = Math.abs(Math.sin(ph)) * 0.012;
        o.rRaise = 1.15; o.rOut = 0.3; o.lRaise = 1.15; o.lOut = 0.3;
        o.paddleRoll = Math.sin(ph) * 0.62; o.paddleYaw = -Math.sin(ph) * 0.2;
        o.legL = Math.sin(ph) * 0.1; o.legR = -Math.sin(ph) * 0.1; o.sq = breathe * 0.5;
        o.hYaw = -Math.sin(ph) * 0.25; o.hPitch = -0.05;
        break;
      }
      case 'charge': {
        const k = charge, tr = k * k * Math.sin(t * 46) * 0.012;
        o.rod = 0.55 - 1.75 * k; o.rRaise = 0.95 + 1.05 * k; o.rOut = 0.25 + 0.2 * k;
        o.lRaise = 0.6 + 0.3 * k; o.lOut = 0.1;
        o.pitch = -0.16 * k; o.twist = -0.3 * k; o.sq = -0.07 * k + breathe * 0.3; o.roll = tr;
        o.eye = 1 - 0.35 * k; o.flame = 0.15 * k; o.hPitch = 0.05 * k;
        o.legL = -0.15 * k; o.legR = 0.18 * k;
        break;
      }
      case 'wait': {
        o.rod = 1.0 + Math.sin(t * 0.9) * 0.03; o.rRaise = 0.95; o.rOut = 0.25; o.lRaise = 0.45; o.lOut = 0.3;
        o.pitch = 0.04; o.sq = breathe - 0.02; o.hPitch = 0.12; o.y = -0.075;
        o.legL = -1.2 + Math.sin(t * 1.6) * 0.22; o.legR = -1.2 + Math.sin(t * 1.6 + 2.1) * 0.22; o.hRoll = Math.sin(t * 0.55) * 0.1 + Math.max(0, Math.sin(t * 0.21)) * 0.12;
        o.hYaw = Math.sin(t * 0.3) * 0.08;
        if (env.fishingState === 'bite') { o.y = -0.06 + 0.015 * Math.abs(Math.sin(t * 18)); o.eye = 1.35; o.hPitch = 0.2; o.flame = 0.25; o.legL = -0.6; o.legR = -0.5; }
        break;
      }
      case 'reel': {
        const k = clamp(reelK, 0, 1.5), lat = clamp(reelLat, -1, 1);
        o.rod = 0.95 - (env.tension || 0) * 0.4; o.rRaise = 1.05; o.rOut = 0.22; o.rodYaw = -lat * 0.45;
        o.lRaise = 0.95 + Math.sin(crankPhase) * 0.22; o.lOut = 0.02 + Math.cos(crankPhase) * 0.14;
        o.twist = lat * 0.32; o.roll = lat * 0.1; o.pitch = -0.08 - (env.tension || 0) * 0.08;
        o.y = Math.abs(Math.sin(crankPhase)) * 0.008 * k; o.sq = breathe * 0.5 - 0.02;
        o.eye = 0.9; o.hPitch = 0.08;
        o.legL = -0.1; o.legR = 0.12;
        break;
      }
      case 'strain': {
        const j = Math.sin(t * 37) * 0.028 + Math.sin(t * 23.7) * 0.018, lat = clamp(reelLat, -1, 1);
        o.rod = 0.42; o.rRaise = 1.35; o.rOut = 0.18; o.lRaise = 1.25; o.lOut = 0.08; o.rodYaw = -lat * 0.5;
        o.pitch = -0.34 + j * 0.3; o.sq = -0.08; o.roll = j + lat * 0.12; o.twist = lat * 0.3; o.y = Math.abs(j) * 0.1;
        o.eye = 0.4; o.flame = 0.2 + Math.abs(Math.sin(t * 17)) * 0.25; o.hPitch = -0.12;
        o.legL = -0.28; o.legR = 0.3;
        break;
      }
      case 'catch': {
        if (catchBig) { o.rod = 0.28; o.rRaise = 1.6; o.lRaise = 1.5; o.lOut = 0.05; o.pitch = -0.2; o.sq = -0.04 + breathe; o.eye = 0.55; o.eyeLift = 0.01; o.flame = 0.3; }
        else {
          o.rRaise = 1.25; o.lRaise = 1.25; o.rOut = 0.32; o.lOut = 0.32; o.rStretch = 1.45; o.lStretch = 1.45;
          o.sq = 0.04 + breathe; o.y = poseT < 0.5 ? Math.max(0, Math.sin(poseT * 6.3)) * 0.07 : 0;
          o.eye = 0.5; o.eyeLift = 0.012; o.glow = 1.3; o.flame = 0.35; o.hPitch = -0.12;
        }
        break;
      }
      default: { // idle
        if (env.warm) { o.sq = breathe; o.rRaise = 1.15; o.lRaise = 1.15; o.rOut = 0.08; o.lOut = 0.08; o.rod = -0.5; o.pitch = 0.1; o.hPitch = 0.1; o.hRoll = Math.sin(t * 0.5) * 0.08; o.lStretch = 1.15; o.rStretch = 1.15; o.flame = 0.1; break; }
        o.sq = breathe; o.roll = Math.sin(t * 0.9) * 0.03;
        o.hYaw = Math.sin(t * 0.37) * 0.32 + Math.sin(t * 0.13) * 0.22; o.hRoll = Math.sin(t * 0.5) * 0.06; o.hPitch = Math.sin(t * 0.29) * 0.05;
        o.rod = -0.42 + Math.sin(t * 0.8) * 0.04; o.rRaise = 0.55; o.rOut = 0.18;
        o.lRaise = 0.12 + Math.sin(t * 1.7) * 0.03;
      }
    }
  }
  function poseAction(name, o, a, t) {
    switch (name) {
      case 'cast': {
        const k = a / ONE_SHOT.cast, snap = smooth(0, 0.22, k);
        o.rod = THREE.MathUtils.lerp(-1.1, 1.45, snap) - smooth(0.4, 1, k) * 0.4; o.rRaise = 1.9 - snap * 0.9; o.rOut = 0.25;
        o.lRaise = 0.5; o.pitch = Math.sin(Math.min(1, k * 1.6) * Math.PI) * 0.3; o.twist = 0.32 * (1 - snap);
        o.sq = 0.06 * Math.sin(Math.min(1, k * 2) * Math.PI); o.flame = 0.2; o.eye = 1.2; o.hPitch = 0.1;
        o.legL = 0.15 * snap; o.legR = -0.12 * snap;
        break;
      }
      case 'hookset': {
        const k = a / ONE_SHOT.hookset, snap = smooth(0, 0.18, k), back = 1 - smooth(0.35, 1, k);
        o.rod = 1.0 - snap * 1.25 * back - 0.25 * (1 - back); o.rRaise = 1.0 + 0.6 * snap * back; o.lRaise = 0.9; o.lOut = 0.1;
        o.pitch = -0.28 * snap * back; o.y = Math.sin(Math.min(1, k * 2.2) * Math.PI) * 0.07; o.sq = 0.09 * Math.sin(Math.min(1, k * 2.2) * Math.PI);
        o.eye = 1.45; o.flame = 0.5 * back; o.glow = 1.4;
        break;
      }
      case 'eat': {
        const k = a / ONE_SHOT.eat, chomp = Math.max(0, Math.sin(a * 15)) * smooth(0.12, 0.25, k) * (1 - smooth(0.8, 0.95, k));
        o.rRaise = 1.85; o.rOut = 0.05; o.lRaise = 1.75; o.lOut = 0.05; o.rStretch = 1.15; o.lStretch = 1.15;
        o.hPitch = -0.1 + chomp * 0.25; o.sq = chomp * 0.06 - 0.03; o.y = 0; o.eye = 0.25 + (1 - chomp) * 0.2;
        o.flame = smooth(0.7, 1, k) * 0.4 * (1 - smooth(0.92, 1, k) * 0.5); o.glow = 1 + smooth(0.7, 1, k) * 0.5;
        break;
      }
      case 'toss': {
        const k = a / ONE_SHOT.toss, wind = smooth(0, 0.35, k), fling = smooth(0.35, 0.55, k), back = smooth(0.7, 1, k);
        o.lRaise = 0.3 + wind * 1.1 - fling * 0.3 - back * 0.8; o.lOut = 0.2 + fling * 0.5; o.lStretch = 1 + fling * 0.4 * (1 - back);
        o.twist = -0.3 * wind + 0.5 * fling * (1 - back); o.pitch = 0.12 * fling * (1 - back);
        o.flame = smooth(0.5, 0.65, k) * 0.4 * (1 - back * 0.6); o.eye = 1.1;
        break;
      }
      case 'flare': {
        const k = a / ONE_SHOT.flare, up = smooth(0, 0.15, k) * (1 - smooth(0.7, 1, k));
        o.lRaise = 0.3 + up * 2.75; o.lOut = 0.2 - up * 0.15; o.lStretch = 1 + up * 0.5;
        o.sq = up * 0.1; o.y = up * 0.05; o.pitch = -up * 0.12; o.hPitch = -up * 0.35;
        o.flame = up * (1.4 - k); o.eye = 1.3; o.glow = 1 + up * 1.2;
        break;
      }
      case 'zap': {
        const k = a / ONE_SHOT.zap, jab = smooth(0, 0.2, k) * (1 - smooth(0.6, 1, k));
        o.lRaise = 0.3 + jab * 1.35; o.lOut = 0.15 - jab * 0.12; o.lStretch = 1 + jab * 0.45;
        o.pitch = -Math.sin(Math.min(1, k * 3) * Math.PI) * 0.08 + jab * 0.08; o.flame = jab * 0.6; o.eye = 1.4; o.glow = 1 + jab;
        break;
      }
      case 'hurt': {
        const k = a / ONE_SHOT.hurt, hit = 1 - smooth(0, 1, k);
        o.pitch = -0.36 * hit; o.y = 0.03 * Math.sin(Math.min(1, k * 3) * Math.PI); o.sq = -0.1 * hit;
        o.roll = Math.sin(a * 40) * 0.12 * hit; o.eye = 0.08 + (1 - hit) * 0.9; o.flame = -0.45 * hit; o.hPitch = -0.2 * hit;
        o.rRaise = 0.5 + 0.6 * hit; o.lRaise = 0.3 + 0.9 * hit; o.lOut = 0.6 * hit + 0.2;
        break;
      }
      case 'die': {
        const st = smooth(0, 0.6, a), melt = smooth(0.7, 2.0, a);
        o.roll = Math.sin(a * 11) * 0.14 * (1 - melt) * st; o.flame = -0.35 * st - Math.abs(Math.sin(a * 20)) * 0.2;
        o.melt = melt; o.sq = -0.34 * melt; o.pitch = 0.22 * melt; o.hPitch = 0.38 * melt; o.hRoll = 0.25 * melt; o.roll += 0.12 * melt; o.y = -0.02 * melt;
        o.rRaise = 0.15 * (1 - melt); o.lRaise = 0.1; o.rOut = 0.35; o.lOut = 0.35; o.eye = 1 - smooth(1.0, 1.9, a); o.glow = 1 - smooth(1.0, 1.9, a);
        break;
      }
      case 'celebrate': {
        const k = a / ONE_SHOT.celebrate, hop = Math.max(0, Math.sin(a * Math.PI * 2 / 0.62)) * (1 - smooth(0.8, 1, k));
        o.y = hop * 0.13; o.sq = hop * 0.08 - (1 - hop) * 0.03; o.rRaise = 2.5; o.lRaise = 2.5; o.rOut = 0.35 + Math.sin(a * 18) * 0.2; o.lOut = 0.35 - Math.sin(a * 18) * 0.2;
        o.flame = 0.6; o.eye = 0.45; o.eyeLift = 0.012; o.glow = 1.4; o.twist = Math.sin(a * 5) * 0.25; o.rStretch = 1.2; o.lStretch = 1.2;
        break;
      }
      case 'levelup': {
        const k = a / ONE_SHOT.levelup, burst = smooth(0, 0.12, k) * (1 - smooth(0.45, 1, k));
        o.flame = burst * 2.2; o.sq = burst * 0.12; o.y = burst * 0.05; o.rRaise = 0.7 + burst * 0.6; o.lRaise = 0.7 + burst * 0.6;
        o.rOut = 0.25 + burst * 1.0; o.lOut = 0.25 + burst * 1.0; o.eye = 1.3; o.glow = 1 + burst * 1.8; o.hPitch = -burst * 0.3;
        break;
      }
      default: break;
    }
  }

  // ---------------------------------------------------------------- update
  function update(dt, t, env) {
    poseT += dt;
    // resolve base pose
    let b = (SHOW.has(env.showPose) ? env.showPose : null) || (MEASURE.has(env.measurePose) ? env.measurePose : null) || explicitBase || env.autoBase || 'idle';
    if (holding && !MEASURE.has(b) && !SHOW.has(b)) b = 'catch';
    meas.stamp = Math.max(0, meas.stamp - dt * 1.6);
    if ((b === 'idle' || b === 'paddle') && env.moving) b = 'paddle';
    else if (b === 'paddle' && !env.moving) b = 'idle';
    if (b !== base) { base = b; poseT = 0; }
    if (action) { actionT += dt; if (actionT >= ONE_SHOT[action]) { if (action !== 'die') action = null; } }
    if (env.speed > 0.05) paddlePhase += dt * (2.2 + Math.min(env.speed, 8) * 0.55);
    if (base === 'reel' || base === 'strain') crankPhase += dt * (4 + reelK * 14);
    crank.rotation.x = -crankPhase;

    neutral(tgt);
    poseBase(base, tgt, t, env);
    if (action) poseAction(action, tgt, actionT, t);
    const fast = action === 'cast' || action === 'hookset' || action === 'zap' || action === 'hurt';
    const lam = fast ? 30 : action ? 16 : SHOW.has(base) ? 14 : 11;
    // a show (and the 1.5 s after it) never pops: no joint moves faster than JOINT_RATE (SPEC S5: ≤ 0.35 a frame at 30 fps)
    showCool = SHOW.has(base) ? 1.5 : Math.max(0, showCool - dt);
    const capped = showCool > 0, cap = JOINT_RATE * Math.min(dt, 0.05);
    if (capped) for (const k of KEYS) last[k] = cur[k];
    for (const k of KEYS) cur[k] = damp(cur[k], tgt[k], lam, dt);
    if (capped) {
      // (a sleeve let go of the fish springs back before the arm swings away: its length is not an angle, and its cap is the same hand speed)
      if (lock.r.k <= 0.001 && last.rStretch > tgt.rStretch + 0.15) cur.rStretch = damp(last.rStretch, tgt.rStretch, 30, dt);
      if (lock.l.k <= 0.001 && last.lStretch > tgt.lStretch + 0.15) cur.lStretch = damp(last.lStretch, tgt.lStretch, 30, dt);
      for (const k of KEYS) { const c = STRETCH_KEYS.has(k) ? cap * STRETCH_CAP : cap; cur[k] = last[k] + clamp(cur[k] - last[k], -c, c); }
    }

    // facing: aim / catch-to-camera / forward
    let face = 0;
    if (pointYaw !== null && aimHold > 0) { aimHold -= dt; face = wrapPi(pointYaw - env.heading); if (aimHold <= 0) pointYaw = null; }
    else if (SHOW.has(base) && sh && Number.isFinite(sh.faceYaw)) face = sh.faceYaw;   // to the lens (three-quarter for hang and alongside)
    else if (base === 'measureAlongside' && Number.isFinite(meas.faceYaw)) face = meas.faceYaw;
    else if (base === 'measureHang' && Number.isFinite(env.camYaw)) face = wrapPi(env.camYaw - env.heading + 1.05);   // side-on: rod and fish across the frame
    else if (MEASURE.has(base) && Number.isFinite(env.camYaw)) face = wrapPi(env.camYaw - env.heading);
    else if (base === 'catch' && Number.isFinite(env.camYaw)) face = wrapPi(env.camYaw - env.heading);
    else if (action === 'toss' || (base === 'idle' && env.warm)) face = BRAZIER_YAW;
    else if (Number.isFinite(env.targetYaw) && base !== 'paddle' && base !== 'catch') face = wrapPi(env.targetYaw - env.heading);
    else if (aimYaw !== null && base !== 'paddle' && base !== 'idle') face = wrapPi(aimYaw - env.heading);
    else if (aimYaw !== null && base === 'idle' && env.fishingBusy) face = wrapPi(aimYaw - env.heading);
    // (on the way out the Wick turns back to its play no faster than the show's lens eases back out, ≈ 0.8 s for a half turn: it never
    // spins its back to a lens that is still close)
    // (…and it waits a breath: the lens has begun to draw back, 0.2 s, before the Wick turns from it, then it turns at its ease)
    { const turn = wrapPi(face - facing) * (1 - Math.exp(-(SHOW.has(base) ? (sh?.turnRate || 9) : 7) * dt)), tc = SHOW.has(base) ? cap : (showCool > 1.5 - TURN_WAIT ? 0 : TURN_BACK * Math.min(dt, 0.05)); facing += capped ? clamp(turn, -tc, tc) : turn; }
    group.rotation.y = facing;

    // apply rig
    root.position.y = cur.y;
    root.rotation.set(cur.pitch, cur.twist, cur.roll, 'YXZ');
    const sq = cur.sq;
    squash.scale.set(buildS[0] * (1 - sq * 0.55), buildS[1] * (1 + sq), buildS[2] * (1 - sq * 0.55));
    head.rotation.set(cur.hPitch, cur.hYaw, cur.hRoll, 'YXZ');
    head.position.y = 0.5 - cur.melt * 0.06;
    // the show's hand locks: IK in body space onto the world targets (the fish, the rod), blended in as the hands close
    if (lock.r.k > 0.001 || lock.l.k > 0.001) {
      body.updateWorldMatrix(true, false);
      if (lock.r.k > 0.001) ikLock('r');
      if (lock.l.k > 0.001) ikLock('l');
      if (capped) for (const k of ARM_KEYS) { const c = STRETCH_KEYS.has(k) ? cap * STRETCH_CAP : cap; cur[k] = last[k] + clamp(cur[k] - last[k], -c, c); }   // (the reach to the fish too: quick, never a jump)
    }
    arms.r.sh.rotation.set(-cur.rRaise, 0, -cur.rOut, 'XYZ'); arms.r.sh.scale.set(1, cur.rStretch, 1);
    arms.l.sh.rotation.set(-cur.lRaise, 0, cur.lOut, 'XYZ'); arms.l.sh.scale.set(1, cur.lStretch, 1);
    arms.r.hand.scale.set(1, 1 / cur.rStretch, 1); arms.l.hand.scale.set(1, 1 / cur.lStretch, 1);
    // the wax hands stretch with their sleeves (as ever), but a hand locked onto the show's fish or rod stays round
    roundK.r = damp(roundK.r, lock.r.k > 0.02 ? 1 : 0, 14, dt); roundK.l = damp(roundK.l, lock.l.k > 0.02 ? 1 : 0, 14, dt);
    arms.r.fist.scale.y = cur.rStretch + (1 - cur.rStretch) * roundK.r; arms.l.fist.scale.y = cur.lStretch + (1 - cur.lStretch) * roundK.l;
    legs[0].rotation.x = cur.legL; legs[1].rotation.x = cur.legR;
    // rod orientation: absolute pitch from vertical toward +Z, compensating the arm
    rodMount.rotation.set(cur.rod + cur.rRaise, cur.rodYaw, cur.rOut, 'XYZ');
    driveRod();
    paddleRig.rotation.set(0, cur.paddleYaw, cur.paddleRoll);
    // eyes: blink + expression
    blinkT -= dt;
    if (blinkT <= 0) { blink = 0.13; blinkT = 2.2 + Math.random() * 3.5; }
    if (sh && SHOW.has(base) && (sh.p ?? 0) > 0.3 && (sh.calm ?? 0) < 0.5) { blink = 0; blinkT = Math.max(blinkT, 0.5); }   // (no blink on the present: eyes on us)
    blink = Math.max(0, blink - dt);
    const open = clamp(cur.eye, 0.05, 1.6) * (blink > 0 ? 0.12 : 1);
    eyes.scale.set((1 + (cur.eye > 1 ? (cur.eye - 1) * 0.3 : 0)) * eyeShape[0], open * eyeShape[1], 1);
    eyes.position.y = 0.14 + cur.eyeLift;
    // a measuring close-up (the trophy camera 1.6–5 m away) would bloom the head flame and eyes into a white blot: damp them,
    // and bring the Wick's own exposure down (eased, so the cut to the trophy camera never pops)
    const ckT = MEASURE.has(base) || SHOW.has(base) || env.landingClose === true ? clamp(Number(env.closeK) || 0, 0, 1) : 0;
    let ck = damp(expo, ckT, 6, dt);
    if (Math.abs(ck - ckT) < 1e-3) ck = ckT;
    applyExposure(ck);
    eyeMat.color.set(hexColor(look.eyes, DEFAULT_LOOK.eyes)).multiplyScalar(3 * clamp(cur.glow, 0, 3) * (0.35 + 0.65 * Math.max(0.15, vitality)) * (1 - 0.72 * ck));
    // props
    // (a rod set down by the show lies on the bow rest; while it travels there or back it is still the hand's rod, driven)
    const prop = rodDrive.stow >= 0.999 ? 'none' : rodDrive.stow > 0.001 || rodDrive.k > 0.001 ? 'rod'
      : action === 'eat' || action === 'die' ? 'none' : base === 'paddle' ? 'oar' : base === 'catch' ? (catchBig ? 'rod' : 'none')
        : MEASURE.has(base) ? (base === 'measureHang' ? 'rod' : 'none') : 'rod';
    rod.visible = prop === 'rod'; stowed.visible = !rod.visible;
    paddle.visible = prop === 'oar'; paddleStowed.visible = !paddle.visible;
    // flame
    const target = dead ? (action === 'die' && actionT < 0.75 ? Math.max(0.1, vitality) : 0) : vitality;
    flameK = damp(flameK, target, 4, dt);
    const out = flameK < 0.03;
    if (out && !flameOut) { flameOut = true; ctx.models?.puff?.(flame.group.getWorldPosition(tmpV), { color: flameCol.getHex(), count: 8, size: 0.5 }); }
    if (!out) flameOut = false;
    flame.group.visible = !out;
    flareK = Math.max(0, flareK - dt * 0.8);
    // (in the close-up a flare that doubles the flame is a pale blot over the lantern post: there it stands at most 1.75 × its
    // size, and its white heart is held back so its amber edge keeps the shape)
    const flRaw = Math.max(0, cur.flame) + (dead ? 0 : flareK) * 0.5, fl = flRaw - Math.max(0, flRaw - 0.9) * ck;
    const grow = cur.flame + (dead ? 0 : flareK) * 0.28, growC = grow - Math.max(0, grow - 0.75) * ck;
    const fs = (0.5 + 0.5 * flameK) * Math.max(0.15, 1 + growC) * (1 + Math.sin(t * 11.3) * 0.03 * (2 - flameK) + flareK * Math.sin(t * 17.1) * 0.05);
    const lowH = vitality < 0.5 ? 0.78 + 0.44 * vitality : 1;
    flame.group.scale.set(fs * flameShape[0], fs * flameShape[1] * lowH, fs * flameShape[0]);
    flame.outerMat.uniforms.uT.value = t; flame.innerMat.uniforms.uT.value = t * 1.13;
    const wild = (1 - flameK) * 0.9 + fl * 0.25 + (vitality <= lastEmber ? 0.9 : vitality < 0.5 ? 0.25 : 0);
    flame.outerMat.uniforms.uWild.value = wild; flame.innerMat.uniforms.uWild.value = wild;
    flame.outerMat.uniforms.uI.value = (1.6 + flameK * 0.9 + fl * 0.8) * (1 - 0.7 * ck);
    flame.innerMat.uniforms.uI.value = 2.8 * (1 - 0.62 * ck) * (1 - 0.3 * ck * Math.min(1, flRaw));
    flame.halo.material.opacity = (0.18 + 0.27 * flameK) * Math.min(2, 1 + fl * 0.6) * (1 - 0.88 * ck);
    flame.halo.scale.setScalar(0.75 * (1 + fl * 0.5) * (1 - 0.5 * ck));
    // >>> INTRO LANE A: the opening cut scene's kindling (docs/v3/intro/SPEC.md §4 #13; null = the game's own flame)
    if (introKindle !== null) {
      const kk = introKindle;
      flame.group.visible = flame.group.visible && kk > 0.01;
      flame.group.scale.multiplyScalar(0.25 + 0.75 * kk);
      flame.outerMat.uniforms.uI.value *= kk; flame.innerMat.uniforms.uI.value *= kk;
      flame.halo.material.opacity *= kk;
      eyeMat.color.multiplyScalar(0.06 + 0.94 * kk);
    }
    // <<< INTRO LANE A
    // lean flame against motion
    const lx = clamp(-(env.localVel?.x || 0) * 0.018 - cur.roll * 0.15, -0.3, 0.3), lz = clamp(-(env.localVel?.z || 0) * 0.018 + cur.pitch * 0.1, -0.3, 0.3);
    flame.outerMat.uniforms.uLean.value.set(lx, lz); flame.innerMat.uniforms.uLean.value.set(lx * 0.7, lz * 0.7);
    flameAnchor.position.set(flameBaseX, flameBaseY - cur.melt * 0.08, 0);
    if (out && dead) { smokeT -= dt; if (smokeT <= 0) { smokeT = 0.35; ctx.models?.emitSmoke?.(flame.group.getWorldPosition(tmpV), { color: 0x2a2630, vy: 0.35, spread: 0.12, size: 0.16, sizeGrow: 0.3, lifeT: 2.0, alpha: 0.35, jitter: 0.03 }); } }
    // rod bell swing (spring) + the odd wax drip falling from the head
    bellV += (-30 * bellSwing - 2.5 * bellV) * dt + (base === 'reel' || base === 'strain' ? Math.sin(t * 23) * 3 * dt : 0);
    bellSwing += bellV * dt;
    dripT -= dt;
    if (dripT <= 0 && !dead) {
      dripT = 6 + Math.random() * 8;
      if (base === 'idle' || base === 'wait') { head.updateWorldMatrix(true, false); tmpV.set(0.17 * (Math.random() < 0.5 ? 1 : -1), 0.12, 0.05).applyMatrix4(head.matrixWorld); ctx.models?.emitSmoke?.(tmpV, { color: palette[PAL.WAX].getHex(), vy: -1.5, spread: 0, size: 0.045, sizeGrow: 0, lifeT: 0.32, alpha: 0.95, jitter: 0 }); }
    }
    // cloak flutter
    cloakU.uT.value = t;
    cloakU.uWind.value.set(clamp(-(env.localVel?.x || 0) * 0.08, -0.6, 0.6), clamp(-(env.localVel?.z || 0) * 0.08, -0.6, 0.6));
    // hurt flash
    flash = Math.max(0, flash - dt * 6);
    const fe = flash > 0 ? flash : 0;
    cloakMat.emissive.setRGB(fe, fe, fe); rigidMat.emissive.setRGB(fe * 0.8, fe * 0.8, fe * 0.8); hatMat.emissive.setRGB(fe, fe, fe);
    if (headMat.userData.charred) headMat.emissive.copy(flameCol).multiplyScalar(0.14 + 0.05 * Math.sin(t * 3)).addScalar(fe * 0.8);
    else headMat.emissive.setRGB(fe * 0.8, fe * 0.8, fe * 0.8);
  }

  /** Put a hand on its world target: exact IK in body space (the arm stretches, a cartoon sleeve), blended by the lock's k. */
  function ikLock(key) {
    const K = lock[key], k = Math.min(1, K.k);
    tmpV.copy(K.pos); body.worldToLocal(tmpV);
    reach(ikPose, key, tmpV.x, tmpV.y, tmpV.z, K.max, 0.4);
    if (key === 'r') { cur.rRaise += wrapPi(ikPose.rRaise - cur.rRaise) * k; cur.rOut += (ikPose.rOut - cur.rOut) * k; cur.rStretch += (ikPose.rStretch - cur.rStretch) * k; }
    else { cur.lRaise += wrapPi(ikPose.lRaise - cur.lRaise) * k; cur.lOut += (ikPose.lOut - cur.lOut) * k; cur.lStretch += (ikPose.lStretch - cur.lStretch) * k; }
  }
  /** The rod as a prop of the show: planted by its butt at a world point (k → 1), or set down on the bow rest (stow → 1). In
   *  between, its world transform eases from the hand's to the prop's (a short tossed arc to the rest), so it never jumps. */
  const rdP = new THREE.Vector3(), rdQ = new THREE.Quaternion(), rdS = new THREE.Vector3(), rdP2 = new THREE.Vector3(), rdQ2 = new THREE.Quaternion(), rdS2 = new THREE.Vector3();
  const rdM = new THREE.Matrix4(), UPV = new THREE.Vector3(0, 1, 0), ROD_BUTT = 0.13;
  function driveRod() {
    const k = clamp(rodDrive.k, 0, 1), st = clamp(rodDrive.stow, 0, 1);
    if (k <= 0.001 && st <= 0.001) {
      if (rodDrive.driven) { rod.matrixAutoUpdate = true; rod.position.set(0, 0, 0); rod.quaternion.identity(); rod.scale.set(1, 1, 1); rod.updateMatrix(); rodDrive.driven = false; }
      return;
    }
    rodMount.updateWorldMatrix(true, false);
    rodMount.matrixWorld.decompose(rdP, rdQ, rdS);   // where the hand carries it
    const s0 = (rdS.x + rdS.y + rdS.z) / 3; rdS.setScalar(s0);
    if (k > 0.001) {
      const sc = rodDrive.scale > 0 ? rodDrive.scale : s0;
      rdQ2.setFromUnitVectors(UPV, rodDrive.dir);
      rdP2.copy(rodDrive.butt).addScaledVector(rodDrive.dir, ROD_BUTT * sc);
      rdP.lerp(rdP2, k); rdQ.slerp(rdQ2, k); rdS.setScalar(s0 + (sc - s0) * k);
    }
    if (st > 0.001) {
      stowed.updateWorldMatrix(true, false); stowed.matrixWorld.decompose(rdP2, rdQ2, rdS2);
      const e = st * st * (3 - 2 * st);
      rdP.lerp(rdP2, e); rdP.y += Math.sin(e * Math.PI) * 0.3; rdQ.slerp(rdQ2, e); rdS.lerp(rdS2, e);
    }
    rdM.compose(rdP, rdQ, rdS);
    rod.matrixAutoUpdate = false;
    rod.matrix.copy(rodMount.matrixWorld).invert().multiply(rdM);
    rodDrive.driven = true;
  }
  // a bare copy of the rig's bones (no meshes): where the head, the flame and the shoulders WILL be once a show pose has settled,
  // so the show's layout and the camera's target are known on the pose's first frame (SPEC §2.6, §6.2 getShowFocus)
  const ghost = (() => {
    const g = new THREE.Group(), r = new THREE.Group(), q = new THREE.Group(), b = new THREE.Group(), h = new THREE.Group();
    g.add(r); r.add(q); q.add(b); b.add(h);
    return { g, r, q, b, h, o: neutral({}) };
  })();
  /** The body's volumes (for the show's clearances; S5): the cloak as a capsule a–b of radius r, the wax head as a sphere. */
  function volumesOf(bodyNode, headNode, out) {
    const e = bodyNode.matrixWorld.elements, sx = Math.hypot(e[0], e[1], e[2]);
    out.a = (out.a || new THREE.Vector3()).set(0, 0.17, 0).applyMatrix4(bodyNode.matrixWorld);
    out.b = (out.b || new THREE.Vector3()).set(0, 0.36, 0).applyMatrix4(bodyNode.matrixWorld);
    out.r = 0.272 * sx;
    out.head = (out.head || new THREE.Vector3()).set(0, 0.155, 0).applyMatrix4(headNode.matrixWorld);
    out.headR = 0.215 * sx;
    return out;
  }
  /**
   * Settle a show pose on the ghost rig: spec = the show's spec at rest (p 1, take 1, no flap), at = {x, y, z, faceYaw} the Wick's spot
   * and facing in its parent's (the deck's) space. Returns, in that same space: head {center, radius}, flame (its core), feet,
   * shoulders {r, l}, the body's volumes, and scale (body units → metres). ghostReach() then clamps a hand target to the arm.
   */
  function probeShow(spec, at, out = {}) {
    const G = ghost, o = neutral(G.o), saved = sh;
    sh = spec;
    try { poseShow(spec.pose, o, 0, true, at.faceYaw); } finally { sh = saved; }
    G.g.position.set(at.x, at.y, at.z); G.g.rotation.y = at.faceYaw; G.g.scale.copy(group.scale);
    G.r.position.y = o.y; G.r.rotation.set(o.pitch, o.twist, o.roll, 'YXZ');
    G.q.scale.set(buildS[0] * (1 - o.sq * 0.55), buildS[1] * (1 + o.sq), buildS[2] * (1 - o.sq * 0.55));
    G.h.position.set(0, 0.5, 0.01); G.h.rotation.set(o.hPitch, o.hYaw, o.hRoll, 'YXZ');
    G.g.updateMatrixWorld(true);
    const V = (out.vol = volumesOf(G.b, G.h, out.vol || {}));
    out.head = { center: V.head, radius: V.headR };
    const fs = (0.5 + 0.5 * Math.max(0.2, vitality)) * Math.max(0.15, 1 + o.flame);
    out.flame = (out.flame || new THREE.Vector3()).set(flameBaseX, flameBaseY + 0.16 * fs * flameShape[1], 0).applyMatrix4(G.h.matrixWorld);
    out.flameTop = (out.flameTop || new THREE.Vector3()).set(flameBaseX, flameBaseY + 0.27 * fs * flameShape[1], 0).applyMatrix4(G.h.matrixWorld);
    out.feet = (out.feet || new THREE.Vector3()).set(at.x, at.y, at.z);
    out.shR = (out.shR || new THREE.Vector3()).set(-SHOULDER_X, SHOULDER_Y, SHOULDER_Z).applyMatrix4(G.b.matrixWorld);
    out.shL = (out.shL || new THREE.Vector3()).set(SHOULDER_X, SHOULDER_Y, SHOULDER_Z).applyMatrix4(G.b.matrixWorld);
    out.eyes = (out.eyes || new THREE.Vector3()).set(0, 0.14, 0.212).applyMatrix4(G.h.matrixWorld);
    out.scale = group.scale.x; out.pose = o;
    return out;
  }
  /** Clamp a hand target (the ghost's parent space, after probeShow) to what that arm can reach; returns how far it was moved (m). */
  function ghostReach(key, v, maxStretch = 2.4) {
    const b = ghost.b;
    tmpV.copy(v); b.worldToLocal(tmpV);
    const sx = key === 'r' ? -SHOULDER_X : SHOULDER_X;
    tmpV2.set(tmpV.x - sx, tmpV.y - SHOULDER_Y, tmpV.z - SHOULDER_Z);
    const len = tmpV2.length(), max = ARM * maxStretch;
    if (len <= max) return 0;
    tmpV2.multiplyScalar(max / len); tmpV.set(sx + tmpV2.x, SHOULDER_Y + tmpV2.y, SHOULDER_Z + tmpV2.z).applyMatrix4(b.matrixWorld);
    const moved = tmpV.distanceTo(v);
    v.copy(tmpV);
    return moved;
  }
  // rod bend toward the line / gravity, and tip position
  function bendRod(lineEnd, tension, exact = null) {
    rod.updateWorldMatrix(true, false);
    const bend = rodU.uBend.value;
    if (exact) {   // the show's planted rod: its bow is the show's own (already eased), so the tip is where the layout says
      bend.set(exact.x, exact.z);
      const u = 0.86, L = ROD_L;
      rodBell.position.set(bend.x * L * u * u + 0.012, L * u - 0.5 * (bend.x * bend.x + bend.y * bend.y) * L * u * u * u, bend.y * L * u * u);
      rodBell.rotation.set(bellSwing * 0.6, 0, bellSwing);
      return;
    }
    let bx = 0, bz = 0;
    // gravity droop
    tmpQ.copy(rod.getWorldQuaternion(tmpQ)).invert();
    tmpV.set(0, -1, 0).applyQuaternion(tmpQ);
    bx += tmpV.x * 0.05; bz += tmpV.z * 0.05;
    if (lineEnd) {
      tmpM.copy(rod.matrixWorld).invert();
      tmpV2.copy(lineEnd).applyMatrix4(tmpM).sub(rodTipLocal);
      const l = Math.hypot(tmpV2.x, tmpV2.z);
      if (l > 1e-4) { const k = clamp(0.03 + (tension || 0) * 0.34, 0, 0.42) * clamp(l / (tmpV2.length() + 1e-4), 0, 1); bx += tmpV2.x / l * k; bz += tmpV2.z / l * k; }
    }
    bend.x = damp(bend.x, bx, 14, 1 / 60); bend.y = damp(bend.y, bz, 14, 1 / 60);
    const u = 0.86, L = ROD_L;
    rodBell.position.set(bend.x * L * u * u + 0.012, L * u - 0.5 * (bend.x * bend.x + bend.y * bend.y) * L * u * u * u, bend.y * L * u * u);
    rodBell.rotation.set(bellSwing * 0.6, 0, bellSwing);
  }
  function getRodTip(out = new THREE.Vector3()) {
    if (!rod.visible) { stowed.updateWorldMatrix(true, false); return stowedTip.getWorldPosition(out); }
    const b = rodU.uBend.value, L = ROD_L;
    out.set(b.x * L, L - 0.5 * (b.x * b.x + b.y * b.y) * L, b.y * L);
    rod.updateWorldMatrix(true, false);
    return out.applyMatrix4(rod.matrixWorld);
  }

  setLook(DEFAULT_LOOK);
  return {
    group, head, body, flame, holdAnchor, rod, rodTipLocal, tipGlint, shadowMesh: shadow, mats, stowed,
    setLook, setPose, revive, bendRod, getRodTip, update,
    setCharge(k) { charge = clamp(Number(k) || 0, 0, 1); },
    setReel(k, lat = 0) { reelK = Math.max(0, Number(k) || 0); reelLat = Number(lat) || 0; },
    setAim(y) { aimYaw = (y === null || y === undefined || !Number.isFinite(y)) ? null : y; },
    pointAt(y, hold = 0.5) { pointYaw = y; aimHold = hold; },
    setVitality(k, emberFrac) {
      const v = clamp(Number.isFinite(k) ? k : 1, 0, 1);
      if (Number.isFinite(emberFrac)) lastEmber = emberFrac + 1e-3;
      if (v !== vitality) { vitality = v; applyFlameColor(); }
    },
    setIntroKindle(k) { introKindle = Number.isFinite(k) ? Math.min(1, Math.max(0, k)) : null; },   // INTRO LANE A
    ringBell(s = 1) { bellV += 6 * s; },
    setHolding(on, big = false) { holding = !!on; catchBig = !!big; },
    /** Measuring: the held fish's length in body units, the alongside side and facing (raft-local yaw). */
    setMeasure({ lenB, side, faceYaw } = {}) {
      if (Number.isFinite(lenB)) meas.lenB = lenB;
      if (side === 1 || side === -1) meas.side = side;
      meas.faceYaw = Number.isFinite(faceYaw) ? faceYaw : null;
    },
    // ---- the show (actors-show.js drives these every frame of a show; all of them rest at "off")
    /** The show's spec (kept by reference; null = no show): the pose reads its curves, side and head aims from it. */
    setShow(spec) { sh = spec || null; },
    /** A hand's IK lock: world position, k 0..1 (0 = the pose's own arm), and how far the sleeve may stretch. */
    setHandLock(key, pos, k = 1, max = 2.4) {
      const K = key === 'l' ? lock.l : lock.r;
      if (!pos || !(k > 0)) { K.k = 0; return; }
      K.pos.copy(pos); K.k = Math.min(1, k); K.max = max;
    },
    /** The rod as a prop: planted by its butt at `butt` along `dir` (world; k 0..1, scale = its size, 0 = as carried), and / or on
     *  its way to the bow rest (stow 0..1; at 1 it lies there). */
    setRodDrive({ butt = null, dir = null, k = 0, scale = 0, stow = 0 } = {}) {
      rodDrive.k = butt && dir ? clamp(k, 0, 1) : 0; rodDrive.stow = clamp(stow, 0, 1); rodDrive.scale = scale;
      if (butt) rodDrive.butt.copy(butt);
      if (dir) rodDrive.dir.copy(dir).normalize();
    },
    probeShow, ghostReach,
    /** The body's volumes now, in world space: {a, b, r} the cloak's capsule, {head, headR} the wax head (the show's clearances). */
    getVolumes(out = {}) { body.updateWorldMatrix(true, false); head.updateWorldMatrix(true, false); return volumesOf(body, head, out); },
    get rodLength() { return ROD_L; }, get rodButt() { return ROD_BUTT; },
    get facing() { return facing; },
    get build() { return buildS; },
    get rodStowK() { return rodDrive.stow; },
    /** The rig's joint values this frame (a copy; tests watch them for jumps), and where the rod is. */
    getJoints(out = {}) { for (const k of KEYS) out[k] = cur[k]; out.facing = facing; out.rodDrive = rodDrive.k; out.rodStow = rodDrive.stow; return out; },
    /** The seal stamps (fish:measured): a satisfied bob, a flare of the head flame and a few sparks. */
    stamp() { meas.stamp = 1; if (!dead) sparks(6); },
    /** The landing (v3): the head flame flares up (k 0..1.5) and throws a few sparks, then settles over a second or two. */
    flareFlame(k = 0.6) {
      const v = Math.max(0, Math.min(1.6, Number(k) || 0));
      if (dead || v <= 0) return;
      flareK = Math.max(flareK, v);
      sparks(Math.round(3 + 6 * Math.min(1, v)));
    },
    /** World position of a hand ('r' | 'l'). */
    getHandPos(side = 'r', out = new THREE.Vector3()) { const h = (side === 'l' ? arms.l : arms.r).hand; h.updateWorldMatrix(true, false); return h.getWorldPosition(out); },
    get basePose() { return base; },
    get pose() { return action || base; },
    get dead() { return dead; },
    flameColor: flameCol,
  };
}
