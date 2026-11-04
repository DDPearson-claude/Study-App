// models.js — BASELINE (integrator). Capsule fish & sphere creatures; the actors author replaces it.
import * as THREE from 'three';
import { toonMaterial, addOutline, glowMaterial } from './toon.js';

export function create(ctx) {
  function speciesOf(s) { return typeof s === 'string' ? (ctx.data.SPECIES || []).find((x) => x.id === s) : s; }
  return {
    init() {},
    update() {},
    createFish(speciesOrId, weightKg = 1) {
      const sp = speciesOf(speciesOrId) || {};
      const len = 0.25 + Math.cbrt(weightKg) * 0.25;
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(len * 0.18, len * 0.6, 4, 10), toonMaterial({ color: sp.model?.body ?? 0x6a8a90 }));
      body.rotation.x = Math.PI / 2;
      addOutline(body, { thickness: 0.01 });
      g.add(body);
      return {
        object3d: g, length: len,
        update(dt, t, o = {}) { g.rotation.y = Math.sin(t * 8) * 0.15 * (o.swim ?? 1) + Math.sin(t * 20) * 0.3 * (o.struggle ?? 0); },
        setGlow() {},
        dispose() { g.parent?.remove(g); },
      };
    },
    createCreature(kind = 'wisp') {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(kind === 'hand' ? 1.2 : 0.4, 12, 10), toonMaterial({ color: 0x0b0b12, rim: 0.5 }));
      g.add(body);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), glowMaterial(0xffffff, 2));
      eye.position.set(0.12, 0.1, 0.35); g.add(eye);
      const eye2 = eye.clone(); eye2.position.x = -0.12; g.add(eye2);
      return {
        object3d: g, radius: kind === 'hand' ? 1.2 : 0.4,
        update(dt, t) { body.scale.setScalar(1 + Math.sin(t * 5) * 0.05); },
        hit() {},
        dispose() { g.parent?.remove(g); },
      };
    },
  };
}
