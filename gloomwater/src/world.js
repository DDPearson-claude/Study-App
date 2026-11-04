// world.js — BASELINE (integrator). Basic lights + fog per zone; the world author replaces it.
import * as THREE from 'three';

export function create(ctx) {
  const group = new THREE.Group();
  group.name = 'world';
  const hemi = new THREE.HemisphereLight(0x8fb8c0, 0x0a1012, 0.9);
  const dir = new THREE.DirectionalLight(0xbfe6ff, 1.2);
  dir.position.set(-6, 20, -10);
  group.add(hemi, dir);
  let zone = null;
  function setZone(id) {
    zone = (ctx.data.ZONES || []).find((z) => z.id === id) || (ctx.data.ZONES || [])[0] || null;
    const fog = ctx.render.scene.fog;
    if (zone?.palette && fog) {
      if (zone.palette.fog !== undefined) fog.color.setHex(zone.palette.fog);
      if (zone.palette.fogDensity !== undefined) fog.density = zone.palette.fogDensity;
    }
    ctx.water.setPalette?.({ deep: zone?.palette?.waterDeep ?? 0x0a1a1d });
  }
  return {
    group,
    init() {
      ctx.render.scene.add(group);
      ctx.bus.on('zone:change', ({ zone: z }) => setZone(z));
      setZone(ctx.state.run?.zone || 'mossmere');
    },
    update() {},
    setZone,
    getZone() { return zone; },
  };
}
