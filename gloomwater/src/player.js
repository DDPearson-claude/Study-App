// player.js — BASELINE (integrator). Simple raft movement; the survival author replaces it.
import * as THREE from 'three';

export function create(ctx) {
  const position = new THREE.Vector3(0, 0, 8);
  const velocity = new THREE.Vector3();
  const dir = new THREE.Vector3();
  let interactable = null;
  const api = {
    position, velocity, heading: 0, speed: 0, anchored: false,
    get interactable() { return interactable; },
    init() {
      ctx.bus.on('zone:change', () => { const s = ctx.world.getSpawn?.(); if (s?.position) api.teleport(s.position, s.yaw); });
    },
    update(dt) {
      if (!dt) return;
      const inp = ctx.input;
      const mx = inp.move.x + inp.joy.x, my = inp.move.y + inp.joy.y;
      dir.set(mx, 0, -my); if (dir.lengthSq() > 1) dir.normalize();
      const busy = ['bite', 'reeling', 'landing'].includes(ctx.fishing?.state);
      if (busy) dir.set(0, 0, 0);
      if (dir.lengthSq() > 0.01 && ['charging', 'casting', 'waiting'].includes(ctx.fishing?.state)) ctx.fishing.cancel?.('moved');
      const max = ctx.progression.getStats?.()?.moveSpeed || 6;
      velocity.x += (dir.x * max - velocity.x) * Math.min(1, dt * 2.5);
      velocity.z += (dir.z * max - velocity.z) * Math.min(1, dt * 2.5);
      position.addScaledVector(velocity, dt);
      ctx.world.collide?.(position, 1.6);
      api.speed = Math.hypot(velocity.x, velocity.z);
      if (api.speed > 0.3) api.heading = Math.atan2(-velocity.x, -velocity.z);
      const m = ctx.actors.merchant;
      const near = m?.present && m.position && Math.hypot(m.position.x - position.x, m.position.z - position.z) < 5;
      const next = near ? { id: 'merchant', label: 'Trade' } : null;
      if ((next?.id || null) !== (interactable?.id || null)) { interactable = next; ctx.bus.emit('interact:change', { id: next?.id || null, label: next?.label || '' }); }
    },
    getForward() { return new THREE.Vector3(-Math.sin(api.heading), 0, -Math.cos(api.heading)); },
    teleport(p, yaw = 0) { position.set(p.x, 0, p.z); velocity.set(0, 0, 0); api.heading = yaw; },
    interact() { if (interactable?.id === 'merchant') { ctx.ui.openShop?.(); return true; } if (interactable?.id === 'gate') { ctx.ui.openDescend?.(); return true; } return false; },
    isNear(id) { return interactable?.id === id; },
  };
  return api;
}
