// actors.js — BASELINE (integrator). Box raft, capsule Wick, line & bobber; the actors author replaces it.
import * as THREE from 'three';
import { toonMaterial, glowSprite } from './toon.js';

export function create(ctx) {
  const group = new THREE.Group(); group.name = 'actors';
  const raft = new THREE.Mesh(new THREE.BoxGeometry(3, 0.25, 3), toonMaterial({ color: 0x2a2018 }));
  group.add(raft);
  const wick = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.35, 4, 10), toonMaterial({ color: 0x14161c }));
  wick.position.set(0, 0.55, 0.2); group.add(wick);
  const lanternLight = new THREE.PointLight(0xffb560, 6, 14, 1.6);
  lanternLight.position.set(-1.1, 2.1, 0.9); group.add(lanternLight);
  const flame = glowSprite({ color: 0xffb560, size: 0.8 }); flame.position.copy(lanternLight.position); group.add(flame);
  const rodTip = new THREE.Object3D(); rodTip.position.set(0.5, 2.0, -1.2); group.add(rodTip);
  const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xdfe8ea })); line.visible = false; group.add(line);
  const bobber = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), toonMaterial({ color: 0xd04030 })); bobber.visible = false; group.add(bobber);
  const merchantObj = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 10), toonMaterial({ color: 0x3a5a30 }));
  merchantObj.position.set(4.2, 0.5, -1.5); merchantObj.visible = false; group.add(merchantObj);
  const merchant = { present: false, position: merchantObj.position, object3d: merchantObj,
    arrive() { merchant.present = true; merchantObj.visible = true; }, leave() { merchant.present = false; merchantObj.visible = false; } };
  const tmp = new THREE.Vector3();
  return {
    group, raft, wick, lanternLight, merchant,
    init() { ctx.render.scene.add(group); },
    update(dt, t) { raft.position.y = (ctx.water.getHeight?.(0, 0) || 0); wick.position.y = 0.55 + raft.position.y; },
    getRodTip() { return rodTip.getWorldPosition(new THREE.Vector3()); },
    setLine({ visible = false, end = null } = {}) {
      line.visible = !!visible && !!end;
      if (line.visible) { const p = lineGeo.attributes.position; rodTip.getWorldPosition(tmp); p.setXYZ(0, tmp.x, tmp.y, tmp.z); p.setXYZ(1, end.x, end.y, end.z); p.needsUpdate = true; }
    },
    setBobber({ visible = false, position = null } = {}) { bobber.visible = !!visible; if (position) bobber.position.copy(position); },
    setPose() {}, setCharge() {}, setReel() {}, setAim() {},
    setLanternLevel(k) { lanternLight.intensity = 6 * k; flame.material.opacity = 0.2 + 0.6 * k; },
    setLightRadius(m) { lanternLight.distance = m * 1.6; },
    setVitality() {},
    showCatch() {},
    pickMerchant(ndc) { return merchant.present && ctx.render.raycast(ndc, [merchantObj]).length > 0; },
    setRaftLevel() {},
  };
}
