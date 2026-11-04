// actors-merchant.js — Old Murk: a hunched, mossy toad under a towering pack, a dim green
// lamp and a bronze bell, riding a lily-barge. Glides in from the fog, idles (breathing,
// throat sac, blinks, pipe smoke, watches the raft), glides away.
import * as THREE from 'three';
import { toonMaterial, addOutline, glowSprite, glowMaterial, canvasTexture } from './toon.js';
import { TAU, xf, paint, mergeGeos, tube, bezierPts, blob, spike, lumpy, smoothNormals, shadowTexture } from './models-kit.js';

const damp = THREE.MathUtils.damp;
function outlineSmooth(mesh, thickness) {
  const tmp = new THREE.Mesh(smoothNormals(mesh.geometry));
  const ol = addOutline(tmp, { thickness });
  tmp.remove(ol); mesh.add(ol);
  return mesh;
}

export function createMerchant(ctx) {
  const mats = [];
  const M = (m) => { mats.push(m); return m; };
  const object3d = new THREE.Group(); object3d.name = 'merchant'; object3d.visible = false;
  const bob = new THREE.Group(); object3d.add(bob);

  // ---------------------------------------------------------------- lily-barge
  const padTex = canvasTexture(256, 256, (g, w, h) => {
    const grd = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    grd.addColorStop(0, '#4f7a3e'); grd.addColorStop(0.7, '#355a2c'); grd.addColorStop(1, '#22401f');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(160,200,120,0.35)'; g.lineWidth = 2;
    for (let i = 0; i < 22; i++) { const a = i / 22 * TAU; g.beginPath(); g.moveTo(128, 128); g.quadraticCurveTo(128 + Math.cos(a + 0.15) * 70, 128 + Math.sin(a + 0.15) * 70, 128 + Math.cos(a) * 126, 128 + Math.sin(a) * 126); g.stroke(); }
    g.fillStyle = 'rgba(20,30,15,0.25)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 2 + Math.random() * 6, 0, TAU); g.fill(); }
  });
  mats.push({ dispose: () => padTex.dispose() });
  const padG = new THREE.CircleGeometry(2.3, 40, 0.32, TAU - 0.64);
  padG.rotateX(-Math.PI / 2);
  { const p = padG.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z); p.setY(i, 0.1 + Math.pow(r / 2.3, 3) * 0.12 + Math.sin(Math.atan2(z, x) * 9) * 0.015 * (r / 2.3)); } padG.computeVertexNormals(); }
  padG.rotateY(Math.PI / 2); // notch faces backward (−Z)
  const pad = new THREE.Mesh(padG, M(toonMaterial({ color: 0xffffff, map: padTex, rim: 0.12, rimPower: 0.8, side: THREE.DoubleSide })));
  bob.add(pad);
  const rimPts = []; for (let i = 0; i <= 40; i++) { const a = 0.32 + (i / 40) * (TAU - 0.64) + Math.PI / 2; rimPts.push(new THREE.Vector3(Math.cos(a) * 2.3, 0.22 + Math.sin(a * 9) * 0.015, -Math.sin(a) * 2.3)); }
  const planks = [paint(tube(rimPts, 0.05, 5, { capEnd: true, capStart: true }), 0x2a4a24)];
  for (let i = 0; i < 5; i++) planks.push(paint(xf(new THREE.BoxGeometry(0.3, 0.07, 1.5), { p: [-0.62 + i * 0.31, 0.2, -0.35], r: [0, (i - 2) * 0.02, 0] }), [0x3a2a1c, 0x33251a, 0x3e2d1e][i % 3]));
  const plat = new THREE.Mesh(mergeGeos(planks), M(toonMaterial({ color: 0xffffff, vertexColors: true, rim: 0.12, rimPower: 0.8 })));
  outlineSmooth(plat, 0.02); bob.add(plat);
  // lotus lamps at the bow
  const lotusMat = M(toonMaterial({ color: 0xf0d8e0, rim: 0.5, emissive: 0xff9fc4, emissiveIntensity: 0.25 }));
  const lotusGlowMat = M(glowMaterial(0xffc6a0, 2.0));
  const lotusSprites = [], petals = [], cores = [];
  for (const [x, z] of [[-1.35, 1.55], [1.4, 1.45], [0.2, 2.05]]) {
    for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; petals.push(blob(0.05, 0.13, 0.03, [x + Math.cos(a) * 0.07, 0.28, z + Math.sin(a) * 0.07], 6, 5, [Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5])); }
    cores.push(blob(0.045, 0.05, 0.045, [x, 0.3, z], 8, 6));
    const s = glowSprite({ color: 0xffb08a, size: 0.8, opacity: 0.45 }); s.position.set(x, 0.34, z); bob.add(s); lotusSprites.push(s); mats.push(s.material);
  }
  bob.add(new THREE.Mesh(mergeGeos(petals), lotusMat));
  bob.add(new THREE.Mesh(mergeGeos(cores), lotusGlowMat));

  // ---------------------------------------------------------------- Old Murk (toad)
  const skin = 0x45552f, belly = 0x8f8a58, moss = 0x5f7d36;
  const murk = new THREE.Group(); murk.position.set(0, 0.22, -0.3); bob.add(murk);
  const skinMat = M(toonMaterial({ color: 0xffffff, vertexColors: true, rim: 0.38, rimPower: 0.6 }));
  const bodyG = lumpy(blob(0.72, 0.62, 0.66, [0, 0.62, -0.05], 18, 14), 0.04, 6, 2);
  const tint = (g, top, bot) => paint(g, (x, y) => (y < 0.55 && Math.abs(x) < 0.45 && g === bodyG ? bot : top));
  tint(bodyG, skin, belly);
  const feet = [];
  for (const side of [1, -1]) {
    feet.push(paint(blob(0.22, 0.08, 0.28, [side * 0.45, 0.06, 0.38], 10, 6), skin));
    for (let k = -1; k <= 1; k++) feet.push(paint(blob(0.05, 0.035, 0.09, [side * 0.45 + k * 0.1, 0.05, 0.62], 6, 4), skin));
  }
  const armsG = [];
  for (const side of [1, -1]) armsG.push(paint(tube(bezierPts([[side * 0.55, 0.8, 0.25], [side * 0.7, 0.45, 0.45], [side * 0.52, 0.18, 0.62]], 8), (u) => 0.14 - u * 0.04, 8), skin));
  const bodyParts = [bodyG, ...feet, ...armsG];
  // head (separate so it can turn)
  const head = new THREE.Group(); head.position.set(0, 1.0, 0.32); murk.add(head);
  const headG = lumpy(blob(0.55, 0.36, 0.46, [0, 0.0, 0.05], 18, 12), 0.025, 7, 4);
  paint(headG, (x, y) => (y < -0.12 ? belly : skin));
  const browL = blob(0.17, 0.13, 0.15, [0.27, 0.27, 0.12], 10, 8), browR = blob(0.17, 0.13, 0.15, [-0.27, 0.27, 0.12], 10, 8);
  paint(browL, skin); paint(browR, skin);
  const mouthG = paint(tube(bezierPts([[-0.5, -0.04, 0.2], [-0.2, -0.12, 0.52], [0.2, -0.12, 0.52], [0.5, -0.04, 0.2]], 16), 0.022, 5), 0x0b0d08);
  const pipeG = paint(mergeGeos([tube(bezierPts([[0.35, -0.1, 0.42], [0.55, -0.16, 0.6], [0.62, -0.05, 0.72]], 6), 0.018, 5), xf(new THREE.CylinderGeometry(0.045, 0.035, 0.09, 8), { p: [0.63, -0.02, 0.74] })]), 0x2a1a10);
  const headMesh = new THREE.Mesh(mergeGeos([headG, browL, browR, mouthG, pipeG]), skinMat); outlineSmooth(headMesh, 0.025); head.add(headMesh);
  // eyes: pale-gold glowing orbs under heavy lids
  const eyeMat = M(glowMaterial(0xd9c46a, 1.6));
  const pupilMat = M(new THREE.MeshBasicMaterial({ color: 0x0a0806, fog: true }));
  const lidMat = M(toonMaterial({ color: skin, rim: 0.35 }));
  const lids = [], balls = [], pupils = [];
  for (const side of [1, -1]) {
    const e = new THREE.Group(); e.position.set(side * 0.27, 0.3, 0.2); head.add(e);
    balls.push(xf(new THREE.SphereGeometry(0.1, 12, 10), { p: [side * 0.27, 0.3, 0.2] }));
    pupils.push(xf(new THREE.SphereGeometry(0.05, 8, 6), { s: [1.4, 0.35, 0.5], p: [side * 0.27, 0.3, 0.285] }));
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.112, 12, 8, 0, TAU, 0, Math.PI / 2), lidMat);
    lid.rotation.x = 0.55; e.add(lid);
    lids.push(lid);
  }
  head.add(new THREE.Mesh(mergeGeos(balls), eyeMat), new THREE.Mesh(mergeGeos(pupils), pupilMat));
  // throat sac
  const sac = new THREE.Mesh(blob(0.26, 0.17, 0.22, [0, 0, 0], 12, 8), M(toonMaterial({ color: 0xb0a874, rim: 0.4 })));
  sac.position.set(0, -0.25, 0.32); head.add(sac);
  const ember = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5), M(glowMaterial(0xff7a30, 2.2))); ember.position.set(0.63, 0.03, 0.74); head.add(ember);
  // moss tufts + hanging strands
  const mossG = [];
  let sd = 5; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  for (let i = 0; i < 18; i++) {
    const a = rnd() * TAU, up = 0.35 + rnd() * 0.55;
    const x = Math.cos(a) * 0.62 * Math.sqrt(1 - up * up), z = Math.sin(a) * 0.55 * Math.sqrt(1 - up * up) - 0.05, y = 0.62 + up * 0.6;
    mossG.push(lumpy(blob(0.09 + rnd() * 0.06, 0.06, 0.09 + rnd() * 0.05, [x, y, z], 7, 5), 0.02, 20, i));
  }
  for (let i = 0; i < 5; i++) mossG.push(lumpy(blob(0.07, 0.05, 0.07, [(rnd() - 0.5) * 0.5, 1.32, 0.25 + rnd() * 0.15], 6, 5), 0.015, 22, i + 30));
  const mossMat = M(toonMaterial({ color: moss, rim: 0.4 }));
  const bodyMesh = new THREE.Mesh(mergeGeos([...bodyParts, ...mossG.map((g) => paint(g, moss))]), skinMat); outlineSmooth(bodyMesh, 0.03); murk.add(bodyMesh);

  // ---------------------------------------------------------------- towering pack
  const pack = new THREE.Group(); pack.position.set(0, 0, -0.55); murk.add(pack);
  const packParts = [];
  packParts.push(paint(lumpy(blob(0.62, 0.62, 0.48, [0, 1.35, 0], 14, 10), 0.04, 5, 9), 0x5a4a32));
  packParts.push(paint(xf(new THREE.BoxGeometry(0.85, 0.5, 0.6), { p: [0.02, 2.1, -0.05], r: [0, 0.12, 0.04] }), 0x4a3522));
  packParts.push(paint(xf(new THREE.BoxGeometry(0.62, 0.42, 0.5), { p: [-0.05, 2.55, 0.0], r: [0, -0.2, -0.06] }), 0x3e2c1c));
  packParts.push(paint(xf(new THREE.CylinderGeometry(0.17, 0.17, 1.15, 10), { p: [0.05, 2.9, -0.02], r: [0, 0.3, Math.PI / 2] }), 0x6a3a3a));
  packParts.push(paint(xf(new THREE.LatheGeometry([[0.01, -0.13], [0.15, -0.12], [0.2, 0.02], [0.17, 0.12], [0.19, 0.15]].map((p) => new THREE.Vector2(p[0], p[1])), 10), { p: [-0.62, 1.75, 0.05] }), 0x2a2a2c));
  packParts.push(paint(xf(new THREE.CylinderGeometry(0.1, 0.12, 0.3, 8), { p: [0.6, 2.05, 0.15] }), 0x7a6a4a));
  packParts.push(paint(xf(new THREE.CylinderGeometry(0.08, 0.08, 0.22, 8), { p: [0.4, 3.12, 0.05] }), 0x4a5a6a));
  for (const y of [1.55, 2.1, 2.55]) packParts.push(paint(xf(new THREE.TorusGeometry(0.47, 0.022, 4, 16), { p: [0, y, -0.03], r: [Math.PI / 2, 0, 0], s: [1, 0.75, 1] }), 0x8c7552));
  for (let i = 0; i < 7; i++) { const x = -0.4 + i * 0.13, len = 0.3 + rnd() * 0.4; packParts.push(paint(tube(bezierPts([[x, 2.33, 0.3], [x + 0.03, 2.33 - len * 0.5, 0.33], [x - 0.02, 2.33 - len, 0.31]], 5), (u) => 0.018 * (1 - u * 0.7), 3), moss)); }
  // lamp pole (merged into the pack) + green lamp + bell
  packParts.push(paint(tube(bezierPts([[0.35, 2.4, -0.1], [0.5, 3.4, -0.05], [0.7, 3.75, 0.3], [1.05, 3.62, 0.62]], 14), (u) => 0.04 - u * 0.015, 6), 0x2b1e14));
  const packMesh = new THREE.Mesh(mergeGeos(packParts), M(toonMaterial({ color: 0xffffff, vertexColors: true, rim: 0.16, rimPower: 0.75 })));
  outlineSmooth(packMesh, 0.022); pack.add(packMesh);
  const lampPivot = new THREE.Group(); lampPivot.position.set(1.05, 3.6, 0.62); pack.add(lampPivot);
  const ironMat = M(toonMaterial({ color: 0x2b302c, rim: 0.5 }));
  const lampIron = new THREE.Mesh(mergeGeos([
    xf(new THREE.TorusGeometry(0.03, 0.007, 4, 8), { p: [0, -0.04, 0] }), xf(new THREE.ConeGeometry(0.1, 0.09, 6), { p: [0, -0.12, 0] }),
    xf(new THREE.CylinderGeometry(0.08, 0.09, 0.03, 6), { p: [0, -0.38, 0] }),
    ...[0, 1, 2, 3, 4, 5].map((i) => xf(new THREE.BoxGeometry(0.01, 0.22, 0.01), { p: [Math.cos(i / 6 * TAU) * 0.08, -0.26, Math.sin(i / 6 * TAU) * 0.08] })),
  ]), ironMat);
  lampPivot.add(lampIron);
  const lampGlow = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), M(glowMaterial(0x7dffa0, 1.8))); lampGlow.position.y = -0.26; lampPivot.add(lampGlow);
  const lampHalo = glowSprite({ color: 0x7dffa0, size: 2.0, opacity: 0.35 }); lampHalo.position.y = -0.26; lampPivot.add(lampHalo); mats.push(lampHalo.material);
  const light = new THREE.PointLight(0x7dffa0, 0, 11, 1.6); light.position.y = -0.26; light.name = 'merchantLamp'; lampPivot.add(light);
  const bellPivot = new THREE.Group(); bellPivot.position.set(0.55, 3.58, 0.02); pack.add(bellPivot);
  const bellMat = M(toonMaterial({ color: 0xa8803a, rim: 0.6, emissive: 0x2a1a05 }));
  const bell = new THREE.Mesh(mergeGeos([xf(new THREE.LatheGeometry([[0.0, 0.0], [0.05, -0.01], [0.07, -0.06], [0.085, -0.13], [0.11, -0.17], [0.1, -0.18]].map((p) => new THREE.Vector2(p[0], p[1])), 12), { p: [0, -0.05, 0] }), xf(new THREE.CylinderGeometry(0.004, 0.004, 0.06, 4), { p: [0, -0.02, 0] })]), bellMat);
  addOutline(bell, { thickness: 0.01 }); bellPivot.add(bell);

  // ---------------------------------------------------------------- shadow + pick proxy
  const shMat = M(new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, opacity: 0.45, depthWrite: false, fog: true }));
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 5.4), shMat); shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.03; object3d.add(shadow);
  const proxy = new THREE.Mesh(xf(new THREE.CylinderGeometry(2.4, 2.4, 4.4, 10), { p: [0, 2.0, 0] }), new THREE.MeshBasicMaterial({ visible: false }));
  proxy.name = 'merchantPick'; object3d.add(proxy); mats.push(proxy.material);

  // ---------------------------------------------------------------- behaviour
  const position = new THREE.Vector3();          // mooring spot (truth for gameplay)
  const from = new THREE.Vector3(), to = new THREE.Vector3(), tmp = new THREE.Vector3();
  let bodyYaw = 0, present = false, mode = 'hidden', modeT = 0, modeDur = 1, yaw = 0, yawFrom = 0, ring = 0, blinkT = 3, blink = 0, sacT = 2, sacK = 0, smokeT = 0, lookYaw = 0, t = 0, fade = 0;
  const ease = (x) => 1 - Math.pow(1 - x, 3), easeIn = (x) => x * x * x;
  function awayDir(out, p, y) {
    const pl = ctx.player?.position;
    if (pl && !ctx.player.isStub) { out.set(p.x - pl.x, 0, p.z - pl.z); }
    else out.set(-Math.sin(y), 0, -Math.cos(y));
    if (out.lengthSq() < 0.01) out.set(Math.sin(y), 0, Math.cos(y));
    return out.normalize();
  }
  const api = {
    object3d, light, proxy, mats,
    get present() { return present; },
    get position() { return position; },
    get mode() { return mode; },
    arrive(pos, y = 0, { instant = false } = {}) {
      if (pos) position.set(pos.x || 0, 0, pos.z || 0);
      yaw = Number.isFinite(y) ? y + Math.PI : Math.PI;
      present = true;
      to.copy(position);
      awayDir(tmp, position, y);
      from.copy(position).addScaledVector(tmp, instant ? 0 : 20);
      yawFrom = yaw + 0.6;
      mode = instant ? 'idle' : 'arriving'; modeT = 0; modeDur = 6.5;
      object3d.visible = true;
      object3d.position.copy(instant ? to : from);
      const pl = ctx.player?.position; // start already turned toward the raft
      if (pl && !ctx.player.isStub) { const dx = pl.x - to.x, dz = pl.z - to.z; bodyYaw = Math.atan2(Math.sin(Math.atan2(dx, dz) - yaw), Math.cos(Math.atan2(dx, dz) - yaw)); murk.rotation.y = bodyYaw; }
      if (instant) { ring = 1.5; fade = 1; }
    },
    leave({ instant = false } = {}) {
      present = false;
      if (!object3d.visible) { mode = 'hidden'; return; }
      if (instant) { object3d.visible = false; mode = 'hidden'; light.intensity = 0; return; }
      from.copy(object3d.position);
      awayDir(tmp, from, yaw - Math.PI);
      to.copy(from).addScaledVector(tmp, 22);
      yawFrom = object3d.rotation.y;
      mode = 'leaving'; modeT = 0; modeDur = 5.5; ring = 1.2;
    },
    update(dt, heightFn) {
      t += dt; modeT += dt;
      if (mode === 'hidden') { light.intensity = 0; return; }
      const k = Math.min(1, modeT / modeDur);
      if (mode === 'arriving') {
        object3d.position.lerpVectors(from, to, ease(k));
        object3d.rotation.y = yaw + (yawFrom - yaw) * (1 - ease(k)) + Math.sin(t * 0.7) * 0.05 * (1 - k);
        fade = Math.min(1, k * 2);
        if (k >= 1) { mode = 'idle'; modeT = 0; ring = 2.2; }
      } else if (mode === 'leaving') {
        object3d.position.lerpVectors(from, to, easeIn(k));
        object3d.rotation.y = yawFrom + Math.sin(k * Math.PI) * 0.4;
        fade = 1 - Math.max(0, (k - 0.6) / 0.4);
        if (k >= 1) { mode = 'hidden'; object3d.visible = false; light.intensity = 0; return; }
      } else {
        object3d.rotation.y = damp(object3d.rotation.y, yaw + Math.sin(t * 0.21) * 0.05, 2, dt);
        fade = 1;
      }
      const px = object3d.position.x, pz = object3d.position.z;
      const wy = heightFn ? heightFn(px, pz) : 0;
      const hx = heightFn ? heightFn(px + 1.5, pz) - heightFn(px - 1.5, pz) : 0, hz = heightFn ? heightFn(px, pz + 1.5) - heightFn(px, pz - 1.5) : 0;
      object3d.position.y = wy * 0.8 - 0.06;
      bob.rotation.set(-hz * 0.18 + Math.sin(t * 0.9) * 0.012, 0, hx * 0.18 + Math.sin(t * 0.7) * 0.01);
      // Murk: breath, throat sac, blink, watch the raft
      const breath = 1 + Math.sin(t * 1.3) * 0.018;
      bodyMesh.scale.set(breath, 1 + (breath - 1) * 1.4, breath);
      sacT -= dt; if (sacT <= 0) { sacT = 2.5 + Math.random() * 3; sacK = 1; }
      sacK = Math.max(0, sacK - dt * 0.9);
      const s = 1 + Math.sin(Math.min(1, 1 - sacK) * Math.PI) * 0.55;
      sac.scale.set(s, s, s);
      blinkT -= dt; if (blinkT <= 0) { blinkT = 2.5 + Math.random() * 4; blink = 0.18; }
      blink = Math.max(0, blink - dt);
      for (const l of lids) l.rotation.x = blink > 0 ? 1.45 : 0.55 + Math.sin(t * 0.4) * 0.06;
      const pl = ctx.player?.position;
      let ly = Math.sin(t * 0.25) * 0.3;
      if (pl && !ctx.player.isStub) {
        object3d.updateMatrixWorld();
        tmp.copy(pl); murk.worldToLocal(tmp);
        const d = Math.hypot(tmp.x, tmp.z);
        if (d < 22) ly = THREE.MathUtils.clamp(Math.atan2(tmp.x, tmp.z), -0.7, 0.7);
      }
      // Murk shuffles round on his pad to face the raft; the head does the last bit
      if (pl && !ctx.player.isStub) {
        tmp.copy(pl); bob.worldToLocal(tmp);
        const want = Math.atan2(tmp.x, tmp.z);
        bodyYaw += Math.atan2(Math.sin(want - bodyYaw), Math.cos(want - bodyYaw)) * (1 - Math.exp(-1.2 * dt));
      }
      murk.rotation.y = bodyYaw;
      lookYaw = damp(lookYaw, ly, 2.5, dt);
      head.rotation.set(Math.sin(t * 0.6) * 0.03, lookYaw, Math.sin(t * 0.5) * 0.03);
      // lamp sway, bell ring
      lampPivot.rotation.set(Math.sin(t * 1.1) * 0.08 + bob.rotation.x * 2, 0, Math.sin(t * 0.83) * 0.1 + bob.rotation.z * 2);
      ring = Math.max(0, ring - dt * 0.5);
      bellPivot.rotation.z = Math.sin(t * 11) * 0.5 * Math.min(1, ring);
      bellPivot.rotation.x = Math.sin(t * 7) * 0.08 * Math.min(1, ring);
      const flick = 0.85 + Math.sin(t * 7.3) * 0.06 + Math.sin(t * 13.1) * 0.04;
      light.intensity = 3.2 * fade * flick;
      lampHalo.material.opacity = 0.35 * fade * flick;
      ember.scale.setScalar(0.8 + Math.sin(t * 2.3) * 0.25);
      lotusSprites.forEach((sp, i) => { sp.material.opacity = 0.4 * fade * (0.8 + Math.sin(t * 1.4 + i) * 0.2); });
      if (light.parent !== lampPivot) { lampGlow.getWorldPosition(light.position); light.parent?.worldToLocal(light.position); }
      smokeT -= dt;
      if (smokeT <= 0 && fade > 0.5) {
        smokeT = 0.45 + Math.random() * 0.5;
        ember.getWorldPosition(tmp); tmp.y += 0.05;
        ctx.models?.emitSmoke?.(tmp, { color: 0x6a7068, vy: 0.4, spread: 0.15, size: 0.22, sizeGrow: 0.5, lifeT: 2.4, alpha: 0.28, jitter: 0.03 });
      }
    },
    ringBell(s = 2) { ring = Math.max(ring, s); },
    dispose() { object3d.parent?.remove(object3d); },
  };
  return api;
}
