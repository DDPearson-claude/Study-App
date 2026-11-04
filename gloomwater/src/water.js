// water.js — BASELINE (integrator). Flat dark plane; the render author replaces it.
import * as THREE from 'three';

export function create(ctx) {
  const mat = new THREE.MeshStandardMaterial({ color: 0x0a1a1d, roughness: 0.25, metalness: 0.1 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(400, 400, 1, 1), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.name = 'water';
  return {
    mesh,
    init() { ctx.render.scene.add(mesh); },
    update() {},
    getHeight(x, z) { const t = ctx.time.t; return Math.sin(x * 0.4 + t * 0.9) * 0.04 + Math.cos(z * 0.35 + t * 0.7) * 0.04; },
    addRipple() {},
    splash() {},
    setPalette(p = {}) { if (p.deep !== undefined) mat.color.setHex(p.deep); },
    setLights() {},
  };
}
