// actors-raft.js — the Wick's raft: lashed dark planks on log floats, a crooked pole with
// a hanging iron lantern (the main PointLight, swinging on a damped pendulum), a little
// brazier, a wicker creel that shows its catch, and per-level upgrade details (0–3).
import * as THREE from 'three';
import { toonMaterial, addOutline, glowSprite, glowMaterial, canvasTexture } from './toon.js';
import { TAU, xf, paint, mergeGeos, tube, bezierPts, blob, spike, smoothNormals, shadowTexture } from './models-kit.js';
import { makeFlame } from './actors-fx.js';

export const DECK_Y = 0.24;
export const HOOK = new THREE.Vector3(-0.4, 2.36, -0.55);

function outlineSmooth(mesh, thickness) {
  const tmp = new THREE.Mesh(smoothNormals(mesh.geometry));
  const ol = addOutline(tmp, { thickness });
  tmp.remove(ol); mesh.add(ol);
  return mesh;
}

export function createRaft(ctx) {
  const mats = [];
  const M = (m) => { mats.push(m); return m; };
  const yawGroup = new THREE.Group(); yawGroup.name = 'raft';
  const tilt = new THREE.Group(); yawGroup.add(tilt);
  const deck = new THREE.Group(); tilt.add(deck);
  let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  const woodMat = M(toonMaterial({ color: 0xffffff, vertexColors: true, rim: 0.14, rimPower: 0.78 }));
  const darkWood = M(toonMaterial({ color: 0x2b1e14, rim: 0.32 }));
  const ironMat = M(toonMaterial({ color: 0x2e3034, rim: 0.5 }));
  const ropeMat = M(toonMaterial({ color: 0x8c7552, rim: 0.3 }));

  // ---------------------------------------------------------------- hull: planks + floats + lashings
  const planks = [], woods = [0x3d2b1d, 0x352517, 0x2e2014, 0x41301f, 0x37281a, 0x30231a];
  for (let i = 0; i < 6; i++) {
    const x = -0.82 + i * 0.328, len = 2.45 + rnd() * 0.35;
    const g = new THREE.BoxGeometry(0.3, 0.09, len, 1, 1, 4);
    const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) { const z = p.getZ(k); if (Math.abs(z) > len / 2 - 0.01) p.setX(k, p.getX(k) + (rnd() - 0.5) * 0.04); p.setY(k, p.getY(k) + Math.sin(z * 2 + i) * 0.006); }
    xf(g, { p: [x + (rnd() - 0.5) * 0.02, DECK_Y - 0.045, (rnd() - 0.5) * 0.16], r: [0, (rnd() - 0.5) * 0.04, 0] });
    planks.push(paint(g, woods[i]));
  }
  const staticParts = [...planks], ropeParts = []; // merged into two meshes below (few draw calls)
  const logs = [];
  for (const z of [-0.85, 0.85]) logs.push(paint(xf(new THREE.CylinderGeometry(0.1, 0.1, 2.25, 10), { r: [0, 0, Math.PI / 2], p: [0, 0.09, z] }), 0x241911));
  logs.push(paint(xf(new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8), { r: [Math.PI / 2, 0, 0], p: [0, 0.07, 0] }), 0x241911));
  staticParts.push(...logs);
  const lash = ropeParts;
  for (const z of [-0.85, 0.85]) for (let i = 0; i < 6; i++) {
    const x = -0.82 + i * 0.328;
    lash.push(xf(new THREE.TorusGeometry(0.07, 0.016, 4, 10), { p: [x + 0.12, 0.17, z], r: [0, Math.PI / 2, 0], s: [1, 1.35, 1] }));
  }

  // ---------------------------------------------------------------- crooked pole + hook arm
  const polePts = bezierPts([[-0.8, DECK_Y - 0.05, -1.02], [-0.92, 1.2, -1.05], [-0.62, 2.0, -0.98], [-0.72, 2.5, -0.85]], 16);
  const armPts = bezierPts([[-0.72, 2.46, -0.86], [-0.5, 2.62, -0.62], [HOOK.x, HOOK.y + 0.06, HOOK.z]], 10);
  const poleG = mergeGeos([tube(polePts, (u) => 0.05 - u * 0.018, 7), tube(armPts, (u) => 0.03 - u * 0.012, 6)]);
  staticParts.push(paint(poleG, 0x2b1e14));
  const wraps = ropeParts;
  for (const y of [0.55, 0.62, 2.35, 2.42]) wraps.push(xf(new THREE.TorusGeometry(0.052, 0.012, 4, 10), { p: [-0.86 + (y > 2 ? 0.18 : 0), y, -1.04 + (y > 2 ? 0.15 : 0)], r: [Math.PI / 2, 0, 0] }));

  // ---------------------------------------------------------------- lantern (pendulum)
  const lanternPivot = new THREE.Group(); lanternPivot.position.copy(HOOK); deck.add(lanternPivot);
  const lantern = new THREE.Group(); lanternPivot.add(lantern);
  const chain = [];
  for (let i = 0; i < 3; i++) chain.push(xf(new THREE.TorusGeometry(0.022, 0.006, 4, 8), { p: [0, -0.03 - i * 0.05, 0], r: [0, i % 2 ? Math.PI / 2 : 0, 0] }));
  chain.push(xf(new THREE.TorusGeometry(0.04, 0.008, 4, 10), { p: [0, -0.19, 0] }));
  const cap = xf(new THREE.ConeGeometry(0.13, 0.11, 8), { p: [0, -0.26, 0] });
  const capRim = xf(new THREE.CylinderGeometry(0.115, 0.12, 0.025, 8), { p: [0, -0.32, 0] });
  const base = xf(new THREE.CylinderGeometry(0.1, 0.115, 0.05, 8), { p: [0, -0.6, 0] });
  const bars = [];
  for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + Math.PI / 4; bars.push(xf(new THREE.BoxGeometry(0.014, 0.27, 0.014), { p: [Math.cos(a) * 0.098, -0.46, Math.sin(a) * 0.098] })); }
  bars.push(xf(new THREE.TorusGeometry(0.1, 0.008, 4, 12), { p: [0, -0.46, 0], r: [Math.PI / 2, 0, 0] }));
  const ironG = mergeGeos([...chain, cap, capRim, base, ...bars]);
  const iron = new THREE.Mesh(ironG, ironMat); outlineSmooth(iron, 0.012); lantern.add(iron);
  const glassMat = M(new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffa040).multiplyScalar(1.6), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: true }));
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.24, 12, 1, true), glassMat); glass.position.y = -0.46; glass.renderOrder = 4; lantern.add(glass);
  const lflame = makeFlame({ color: 0xffa64a, size: 0.75, glow: 0.5 }); lflame.group.position.y = -0.56; lantern.add(lflame.group); mats.push(...lflame.mats);
  const halo = glowSprite({ color: 0xffa64a, size: 2.2, opacity: 0.26, falloff: 3.2 }); halo.position.y = -0.46; halo.renderOrder = 3; lantern.add(halo); mats.push(halo.material);
  const light = new THREE.PointLight(0xffb05a, 9, 18, 1.45); light.position.y = -0.46; light.name = 'lanternLight'; lantern.add(light);

  // ---------------------------------------------------------------- brazier
  const brazier = new THREE.Group(); brazier.position.set(-0.64, DECK_Y, 0.84); deck.add(brazier);
  const bLegs = [];
  for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; bLegs.push(tube([new THREE.Vector3(Math.cos(a) * 0.14, 0, Math.sin(a) * 0.14), new THREE.Vector3(Math.cos(a) * 0.09, 0.2, Math.sin(a) * 0.09)], 0.012, 4)); }
  const bowl = new THREE.LatheGeometry([[0.02, 0.18], [0.12, 0.2], [0.17, 0.27], [0.18, 0.31], [0.165, 0.31]].map((p) => new THREE.Vector2(p[0], p[1])), 14);
  staticParts.push(paint(xf(mergeGeos([...bLegs, bowl]), { p: [-0.64, DECK_Y, 0.84] }), 0x2e3034));
  const coalsMat = M(glowMaterial(0xff5a20, 1.8));
  const coals = new THREE.Mesh(mergeGeos([blob(0.06, 0.035, 0.05, [0.03, 0.29, 0.02], 6, 5), blob(0.05, 0.03, 0.06, [-0.05, 0.285, -0.02], 6, 5), blob(0.045, 0.03, 0.045, [0.0, 0.3, -0.06], 6, 5), blob(0.05, 0.032, 0.05, [-0.03, 0.29, 0.06], 6, 5)]), coalsMat);
  brazier.add(coals);
  const bFlame = makeFlame({ color: 0xff7a30, size: 0.65, glow: 0.7 }); bFlame.group.position.y = 0.3; brazier.add(bFlame.group); mats.push(...bFlame.mats);
  bFlame.inner.visible = false; // two layers are plenty at this size

  // ---------------------------------------------------------------- wicker creel
  const wicker = canvasTexture(128, 64, (g, w, h) => {
    g.fillStyle = '#5a4026'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 8) for (let x = 0; x < w; x += 16) {
      const off = ((y / 8) % 2) * 8;
      g.fillStyle = '#8a6a40'; g.beginPath(); g.ellipse(x + off + 6, y + 4, 7, 3.2, 0, 0, TAU); g.fill();
      g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(x + off + 13, y, 2, 8);
    }
    g.fillStyle = 'rgba(0,0,0,0.35)'; for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 1);
  }, { repeat: true });
  wicker.repeat.set(3, 1.5);
  mats.push({ dispose: () => wicker.dispose() });
  const creel = new THREE.Group(); creel.position.set(0.62, DECK_Y, -0.8); creel.rotation.y = 0.4; deck.add(creel);
  const basket = new THREE.Mesh(xf(new THREE.CylinderGeometry(0.21, 0.165, 0.34, 14, 1, false), { p: [0, 0.17, 0] }), M(toonMaterial({ color: 0xffffff, map: wicker, rim: 0.3 })));
  addOutline(basket, { thickness: 0.014 }); creel.add(basket);
  creel.updateMatrix();
  staticParts.push(paint(xf(new THREE.CylinderGeometry(0.22, 0.22, 0.035, 14), { p: [0, 0.355, 0], r: [0.12, 0, 0] }), 0x6a4c2c).applyMatrix4(creel.matrix));
  ropeParts.push(xf(new THREE.TorusGeometry(0.2, 0.012, 4, 14, Math.PI), { p: [0, 0.34, 0] }).applyMatrix4(creel.matrix));
  const tailMat = M(toonMaterial({ color: 0x8e96a0, rim: 0.4, side: THREE.DoubleSide }));
  const tailShape = new THREE.Shape(); tailShape.moveTo(0, 0); tailShape.lineTo(0.05, 0.12); tailShape.quadraticCurveTo(0, 0.09, -0.05, 0.12); tailShape.lineTo(0, 0);
  const tails = [];
  for (let i = 0; i < 3; i++) {
    const tm = new THREE.Mesh(new THREE.ShapeGeometry(tailShape), tailMat);
    tm.position.set(-0.08 + i * 0.08, 0.34, (i - 1) * 0.04); tm.rotation.set(0, i * 0.9, (i - 1) * 0.35); tm.visible = false;
    creel.add(tm); tails.push(tm);
  }

  // ---------------------------------------------------------------- rod holder (bow-right)
  staticParts.push(paint(mergeGeos([xf(new THREE.CylinderGeometry(0.028, 0.04, 0.32, 6), { p: [0.78, DECK_Y + 0.16, 0.98] }), xf(new THREE.TorusGeometry(0.035, 0.011, 4, 8), { p: [0.78, DECK_Y + 0.32, 0.98], r: [Math.PI / 2, 0, 0] }), spike([0.78, DECK_Y + 0.3, 0.98], [0.4, 1, 0.2], 0.012, 0.12, 4)]), 0xd8d0b8)); // bone rod-rest
  const hull = new THREE.Mesh(mergeGeos(staticParts), woodMat); hull.name = 'raftHull';
  outlineSmooth(hull, 0.02); deck.add(hull);
  deck.add(new THREE.Mesh(mergeGeos(ropeParts), ropeMat));

  // ---------------------------------------------------------------- base details: oxblood pennant + bone chime
  const clothMat = M(toonMaterial({ color: 0x6e2020, rim: 0.3, side: THREE.DoubleSide }));
  const penGrid = new THREE.PlaneGeometry(0.5, 0.22, 8, 2); penGrid.translate(0.25, 0, 0);
  { const pp = penGrid.attributes.position; for (let i = 0; i < pp.count; i++) { const x = pp.getX(i), y = pp.getY(i); if (x > 0.36 && Math.abs(y) < 0.02) pp.setX(i, x - 0.14 * ((x - 0.36) / 0.14)); } } // swallowtail
  const penBase = Float32Array.from(penGrid.attributes.position.array);
  const pennant = new THREE.Mesh(penGrid, clothMat); pennant.position.set(-0.7, 2.66, -0.86); pennant.rotation.y = Math.PI * 0.85; deck.add(pennant);
  deck.add(new THREE.Mesh(xf(new THREE.CylinderGeometry(0.012, 0.012, 0.34, 5), { p: [-0.7, 2.6, -0.86] }), darkWood));
  const boneMat = M(toonMaterial({ color: 0xd8d0b8, rim: 0.4 }));
  const chime = new THREE.Group(); chime.position.set(-0.5, 2.55, -0.66); deck.add(chime);
  for (let i = 0; i < 3; i++) {
    const b = new THREE.Mesh(xf(new THREE.CapsuleGeometry(0.013, 0.11 + i * 0.02, 3, 5), { p: [0, -0.15 - i * 0.01, 0] }), boneMat);
    b.position.set((i - 1) * 0.045, 0, 0); chime.add(b);
  }
  // trophies: a bone charm on the pole for every legendary landed this run
  const trophyShape = new THREE.Shape(); trophyShape.moveTo(-0.1, 0); trophyShape.quadraticCurveTo(-0.02, 0.06, 0.07, 0.015); trophyShape.lineTo(0.11, 0.05); trophyShape.lineTo(0.1, -0.05); trophyShape.lineTo(0.07, -0.015); trophyShape.quadraticCurveTo(-0.02, -0.06, -0.1, 0);
  const trophyGeo = new THREE.ShapeGeometry(trophyShape, 4);
  const trophyMat = M(toonMaterial({ color: 0xe0d6bc, rim: 0.45, side: THREE.DoubleSide, emissive: 0x3a3020 }));
  const trophies = [];
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Group(); g.position.set(-0.62 + i * 0.1, 2.45 - (i % 2) * 0.05, -0.8 + i * 0.09); g.visible = false; deck.add(g);
    g.add(new THREE.Mesh(xf(new THREE.CylinderGeometry(0.004, 0.004, 0.18, 3), { p: [0, -0.09, 0] }), ropeMat));
    const fish = new THREE.Mesh(trophyGeo, trophyMat); fish.position.y = -0.2; fish.rotation.z = Math.PI / 2; g.add(fish);
    trophies.push(g);
  }

  // ---------------------------------------------------------------- upgrade details (DESIGN §19.7: outrigger, second lantern hook, canvas awning)
  const details = [new THREE.Group(), new THREE.Group(), new THREE.Group()];
  details.forEach((d, i) => { d.name = 'raftLevel' + (i + 1); d.visible = false; deck.add(d); });
  { // L1: right outrigger + a coil of rope
    const out = [paint(xf(new THREE.CylinderGeometry(0.12, 0.12, 2.3, 10), { r: [Math.PI / 2, 0, 0], p: [1.48, 0.06, 0] }), 0x2a1d13)];
    for (const z of [-0.7, 0.7]) out.push(paint(xf(new THREE.CylinderGeometry(0.03, 0.03, 0.75, 6), { r: [0, 0, Math.PI / 2 - 0.12], p: [1.12, 0.15, z] }), 0x2a1d13));
    for (let i = 0; i < 3; i++) out.push(paint(xf(new THREE.TorusGeometry(0.15 - i * 0.012, 0.022, 5, 16), { p: [-0.6, DECK_Y + 0.02 + i * 0.035, 0.2], r: [Math.PI / 2, 0, 0] }), 0x8c7552));
    const o = new THREE.Mesh(mergeGeos(out), woodMat); outlineSmooth(o, 0.018); details[0].add(o);
  }
  { // L2: second lantern hook (a dim little lantern, no extra light) + crate
    const arm = tube(bezierPts([[-0.86, 1.55, -1.03], [-1.1, 1.72, -0.95], [-1.28, 1.66, -0.8]], 8), (u) => 0.025 - u * 0.008, 5);
    const lan = [xf(new THREE.ConeGeometry(0.07, 0.06, 6), { p: [-1.28, 1.5, -0.8] }), xf(new THREE.CylinderGeometry(0.055, 0.065, 0.03, 6), { p: [-1.28, 1.32, -0.8] }),
      ...[0, 1, 2, 3].map((i) => xf(new THREE.BoxGeometry(0.01, 0.16, 0.01), { p: [-1.28 + Math.cos(i / 4 * TAU + 0.78) * 0.055, 1.4, -0.8 + Math.sin(i / 4 * TAU + 0.78) * 0.055] })),
      xf(new THREE.CylinderGeometry(0.004, 0.004, 0.12, 3), { p: [-1.28, 1.6, -0.8] })];
    const m = new THREE.Mesh(mergeGeos([paint(arm, 0x2b1e14), ...lan.map((g) => paint(g, 0x2e3034))]), woodMat); outlineSmooth(m, 0.012); details[1].add(m);
    const lg = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 6), M(glowMaterial(0xffb860, 2.2))); lg.position.set(-1.28, 1.41, -0.8); details[1].add(lg);
    const ls = glowSprite({ color: 0xffa64a, size: 1.1, opacity: 0.35 }); ls.position.copy(lg.position); details[1].add(ls); mats.push(ls.material);
    const crate = new THREE.Mesh(xf(new THREE.BoxGeometry(0.34, 0.3, 0.34), { p: [-0.6, DECK_Y + 0.15, -0.6], r: [0, 0.3, 0] }), M(toonMaterial({ color: 0x4a3622, rim: 0.12, rimPower: 0.8 })));
    outlineSmooth(crate, 0.014); details[1].add(crate);
  }
  { // L3: canvas awning over the stern, left outrigger, string of glow bulbs
    const out = [paint(xf(new THREE.CylinderGeometry(0.12, 0.12, 2.3, 10), { r: [Math.PI / 2, 0, 0], p: [-1.48, 0.06, 0] }), 0x2a1d13)];
    for (const z of [-0.7, 0.7]) out.push(paint(xf(new THREE.CylinderGeometry(0.03, 0.03, 0.75, 6), { r: [0, 0, -Math.PI / 2 + 0.12], p: [-1.12, 0.15, z] }), 0x2a1d13));
    for (const [x, z] of [[-1.02, -0.3], [-0.12, -1.12]]) out.push(paint(xf(new THREE.CylinderGeometry(0.025, 0.03, 1.5, 6), { p: [x, DECK_Y + 0.72, z] }), 0x2b1e14));
    const o = new THREE.Mesh(mergeGeos(out), woodMat); outlineSmooth(o, 0.018); details[2].add(o);
    // kept over the left-stern corner so it never hides the Wick from the chase camera
    const canvas = new THREE.PlaneGeometry(1, 0.9, 6, 5);
    const cp = canvas.attributes.position;
    for (let i = 0; i < cp.count; i++) { // drape between the pole and two posts, sagging, slightly ragged
      const u = (cp.getX(i) + 0.5) / 1, v = (cp.getY(i) + 0.45) / 0.9;
      const x = -1.08 + u * 0.98, z = -1.18 + v * 0.9;
      const y = 1.98 - v * 0.2 - Math.sin(u * Math.PI) * 0.1 - Math.sin(v * Math.PI) * 0.07 + ((i * 7919) % 13) * 0.002;
      cp.setXYZ(i, x, y, z);
    }
    canvas.computeVertexNormals();
    const awning = new THREE.Mesh(canvas, M(toonMaterial({ color: 0x6e4e3a, rim: 0.15, side: THREE.DoubleSide })));
    details[2].add(awning); details[2].userData.awning = awning;
    const a = new THREE.Vector3(-0.72, 2.45, -0.85), b = new THREE.Vector3(0.78, DECK_Y + 0.34, 0.98);
    const string = []; for (let i = 0; i <= 14; i++) { const u = i / 14; string.push(new THREE.Vector3().lerpVectors(a, b, u).add(new THREE.Vector3(0, -Math.sin(u * Math.PI) * 0.3, 0))); }
    details[2].add(new THREE.Mesh(tube(string, 0.006, 3), ropeMat));
    const bulbMat = M(glowMaterial(0xffc36a, 2.4));
    const bulbs = [];
    for (const u of [0.3, 0.52, 0.74]) { const p = new THREE.Vector3().lerpVectors(a, b, u).add(new THREE.Vector3(0, -Math.sin(u * Math.PI) * 0.3 - 0.035, 0)); bulbs.push(blob(0.028, 0.036, 0.028, [p.x, p.y, p.z], 8, 6)); }
    details[2].add(new THREE.Mesh(mergeGeos(bulbs), bulbMat));
    details[2].userData.bulbMat = bulbMat;
  }

  // ---------------------------------------------------------------- soft contact shadow on the water (not tilted)
  const shMat = M(new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, opacity: 0.5, depthWrite: false, fog: true }));
  const waterShadow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.9), shMat);
  waterShadow.rotation.x = -Math.PI / 2; waterShadow.renderOrder = 0; yawGroup.add(waterShadow);

  // ---------------------------------------------------------------- state
  let level = 0;
  const pend = { ax: 0, az: 0, vx: 0, vz: 0 };
  function setLevel(n) {
    level = Math.max(0, Math.min(3, Math.round(Number(n) || 0)));
    details.forEach((d, i) => { d.visible = level > i; });
  }
  /** Lantern pendulum driven by local acceleration (ax forward(+z) / sideways(+x)) and tilt. */
  function swing(dt, accX, accZ, tiltX, tiltZ) {
    if (dt <= 0) return;
    const k = 14, c = 1.6;
    const steps = Math.max(1, Math.ceil(dt / 0.02)), h = dt / steps;
    for (let i = 0; i < steps; i++) {
      pend.vx += (-k * pend.ax - c * pend.vx - accZ * 0.9 - tiltX * 6) * h;
      pend.vz += (-k * pend.az - c * pend.vz + accX * 0.9 - tiltZ * 6) * h;
      pend.ax += pend.vx * h; pend.az += pend.vz * h;
    }
    pend.ax = THREE.MathUtils.clamp(pend.ax, -0.7, 0.7); pend.az = THREE.MathUtils.clamp(pend.az, -0.7, 0.7);
    lanternPivot.rotation.set(pend.ax, 0, pend.az);
  }
  function setCreelCount(n) { tails.forEach((t, i) => { t.visible = n > i; }); }
  function setTrophies(n) { trophies.forEach((t, i) => { t.visible = n > i; }); }
  /** Pennant ripples in the apparent wind (wx, wz raft-local m/s); chime & trophies sway with the lantern. */
  function animate(t, wx, wz) {
    const pp = penGrid.attributes.position, wind = Math.min(1, 0.25 + Math.hypot(wx, wz) * 0.15);
    for (let i = 0; i < pp.count; i++) {
      const bx = penBase[i * 3], by = penBase[i * 3 + 1];
      pp.setXYZ(i, bx, by - bx * bx * 0.4 * (1 - wind), Math.sin(t * (5 + wind * 4) - bx * 9) * 0.1 * bx * wind);
    }
    pp.needsUpdate = true;
    chime.rotation.set(lanternPivot.rotation.x * 0.8 + Math.sin(t * 1.3) * 0.05, 0, lanternPivot.rotation.z * 0.8 + Math.sin(t * 1.7) * 0.04);
    for (let i = 0; i < trophies.length; i++) if (trophies[i].visible) trophies[i].rotation.set(lanternPivot.rotation.x * 0.7, Math.sin(t * 0.8 + i) * 0.4, lanternPivot.rotation.z * 0.7 + Math.sin(t * 1.1 + i) * 0.05);
  }

  return {
    yawGroup, tilt, deck, lantern, lanternPivot, light, glassMat, halo, lflame, brazier: { group: brazier, coalsMat, flame: bFlame },
    details, waterShadow, mats, tailMat,
    setLevel, swing, setCreelCount, setTrophies, animate, nudge(x, z) { pend.vx += x; pend.vz += z; },
    get level() { return level; },
  };
}
