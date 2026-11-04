// world.js — BASELINE (integrator). Flat arena with a few pillar obstacles; the world author replaces it.
import * as THREE from 'three';
import { toonMaterial, addOutline } from './toon.js';

export function create(ctx) {
  const group = new THREE.Group(); group.name = 'world';
  const hemi = new THREE.HemisphereLight(0x8fb8c0, 0x0a1012, 1.0);
  const dir = new THREE.DirectionalLight(0xbfe6ff, 1.2); dir.position.set(-6, 20, -10);
  group.add(hemi, dir);
  let zone = null, radius = 60, obstacles = [], props = new THREE.Group();
  group.add(props);
  const gate = { position: new THREE.Vector3(0, 0, -45), radius: 4 };
  function setZone(id) {
    zone = (ctx.data.ZONES || []).find((z) => z.id === id) || (ctx.data.ZONES || [])[0] || null;
    radius = zone?.arena?.radius || 60;
    const fog = ctx.render.scene.fog;
    if (zone?.palette && fog) { if (zone.palette.fog !== undefined) fog.color.setHex(zone.palette.fog); if (zone.palette.fogDensity) fog.density = zone.palette.fogDensity; }
    ctx.water.setPalette?.({ deep: zone?.palette?.waterDeep ?? 0x0a1a1d });
    props.clear(); obstacles = [];
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2 + 0.3, d = 18 + (i % 3) * 12;
      const o = { x: Math.cos(a) * d, z: Math.sin(a) * d, r: 1.5 + (i % 4) };
      obstacles.push(o);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(o.r * 0.8, o.r, 6, 10), toonMaterial({ color: 0x1c2a2e }));
      m.position.set(o.x, 2, o.z); addOutline(m, { thickness: 0.06 }); props.add(m);
    }
  }
  const tmp = new THREE.Vector3();
  return {
    group,
    get bounds() { return { radius }; },
    init() { ctx.render.scene.add(group); ctx.bus.on('zone:change', ({ zone: z }) => setZone(z)); setZone(ctx.state.run?.zone || 'mossmere'); },
    update() {},
    setZone, getZone: () => zone,
    getSpawn: () => ({ position: new THREE.Vector3(0, 0, 8), yaw: 0 }),
    getDepth(x, z) { return Math.max(0, Math.min(1, 1 - Math.hypot(x, z) / radius)); },
    collide(p, r = 1) {
      for (const o of obstacles) { const dx = p.x - o.x, dz = p.z - o.z, d = Math.hypot(dx, dz), m = o.r + r; if (d < m && d > 1e-6) { p.x = o.x + dx / d * m; p.z = o.z + dz / d * m; } }
      const d = Math.hypot(p.x, p.z), lim = radius - r; if (d > lim) { p.x *= lim / d; p.z *= lim / d; }
      return p;
    },
    isOpenWater(x, z, r = 1) { if (Math.hypot(x, z) > radius - r) return false; return !obstacles.some((o) => Math.hypot(x - o.x, z - o.z) < o.r + r); },
    randomWaterPoint({ from = null, minDist = 0, maxDist = Infinity, clearance = 1 } = {}) {
      for (let i = 0; i < 60; i++) {
        const a = Math.random() * Math.PI * 2;
        let x, z;
        if (from) { const d = minDist + Math.random() * (Math.min(maxDist, radius * 2) - minDist); x = from.x + Math.cos(a) * d; z = from.z + Math.sin(a) * d; }
        else { const d = Math.sqrt(Math.random()) * (radius - clearance); x = Math.cos(a) * d; z = Math.sin(a) * d; }
        if (this.isOpenWater(x, z, clearance)) return tmp.set(x, 0, z).clone();
      }
      return new THREE.Vector3(0, 0, 0);
    },
    getMerchantDock: (day = 1) => { const a = day * 2.1; return { position: new THREE.Vector3(Math.cos(a) * 25, 0, Math.sin(a) * 25), yaw: -a }; },
    getGate: () => gate,
    setGateState() {},
    getObstacles: () => obstacles,
  };
}
