// combat-warden.js — night bosses (DESIGN §7.6): the Wickeater, the Veiled Gardener, the
// Shard Abbot and the Lightless Ferryman. Rise → fight (abilities on timers, each with a
// 1.0–1.5 s telegraph) → phase 2 at ≤ 50% hp → death (rewards in combat.js) or withdraw
// at dawn. Helper of combat.js; every ability reads its numbers from data ENEMIES[].abilities.
import * as THREE from 'three';
import { DECAL, lin } from './combat-fx.js';

const TAU = Math.PI * 2;
const COL = {
  pale: lin(0xe9e2cf, 1.2), paleHot: lin(0xf4efe2, 2.4), ink: lin(0x040508, 1), amber: lin(0xffb04a, 2.4), amberDim: lin(0xff9a3a, 1.1),
  glass: lin(0xa8d4ff, 2.6), glassDim: lin(0x5cbcff, 0.9), gold: lin(0xe8c66a, 2.4), goldDim: lin(0xe8c66a, 0.9), smoke: lin(0x1a1712, 1),
  spore: lin(0xffb46a, 1.3),
};
const tmpC = new THREE.Color();

export function createWarden(C) {
  const { ctx, fx } = C;
  const raft = C.raft;
  const rings = [];      // hymn rings: {on, x, z, r, speed, gaps:[a,w], hit, from}
  for (let i = 0; i < 6; i++) rings.push({ on: false, x: 0, z: 0, r: 0, speed: 7, g1: 0, g2: 0, gw: 0.55, hit: false, max: 24, dmg: 1, src: '' });

  function abilityList(def) { return (def.abilities || []).map((a) => ({ ...a, next: 0 })); }

  function init(e, opts = {}) {
    const def = e.def;
    e.warden = {
      abilities: abilityList(def), phase2: false, cast: null, decoy: null, mirrorNext: 0, mirrorT: 0,
      snuff: null, inhaleEvery: null, veilDuration: null, veilDrift: 0, rise: opts.instant ? 0.01 : 3.2, walk: Math.random() * TAU,
      // Abbot's Mirror: only the image inside the light (or a beam) takes damage
      filter: (o) => e.inLight || !!o?.beam,
    };
    e.state = 'rise'; e.invuln = true; e.targetable = false; e.y = -6;
    for (const a of e.warden.abilities) a.next = (a.every || 10) * (0.45 + Math.random() * 0.35) + 1.5;
    e.radius = 2.4 * e.scale;
    fx.timedDecal({ x: e.position.x, z: e.position.z, r0: 2, r1: 14, life: 2.6, color: tmpC.set(e.eye).multiplyScalar(1.6), p1: 0.06, alpha: 0.9 });
    fx.timedDecal({ x: e.position.x, z: e.position.z, r0: 4, r1: 9, life: 3.2, color: COL.ink, additive: false, type: DECAL.STAIN, p1: 1, ease: 3, alpha: 0.9 });
  }

  function cap(n) { return Math.min(C.B?.damage?.bossHitCap ?? 3, n); }

  function startCast(e, a) {
    const w = e.warden;
    const tell = a.telegraph ?? 0;
    w.cast = { a, id: a.id, t: 0, tell, phase: tell > 0 ? 'tell' : 'act', x: raft.x, z: raft.z, dx: 0, dz: 0, hit: false, done: false };
    const c = w.cast;
    const dx = raft.x - e.position.x, dz = raft.z - e.position.z, d = Math.hypot(dx, dz) || 1;
    c.dx = dx / d; c.dz = dz / d;
    if (a.id === 'hymnRing') ctx.audio?.play?.('charge_ping', { volume: 0.9, pitch: 0.55 });
    else if (a.id === 'inhale') ctx.audio?.play?.('gloom_rise', { volume: 0.35, pitch: 1.6 });
    else if (tell > 0) ctx.audio?.play?.('warn', { volume: 0.6, pitch: 0.7 });
  }

  function brood(e, a) {
    const n = a.count || 6;
    const pack = C.enemiesSys.nextPack();
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * TAU + Math.random() * 0.4;
      const x = e.position.x + Math.cos(ang) * (e.radius + 1.5), z = e.position.z + Math.sin(ang) * (e.radius + 1.5);
      const def = ctx.data.ENEMY_BY_ID?.[a.enemy];
      const o = C.enemiesSys.spawn(a.enemy, x, z, { packId: def?.pack > 1 ? pack : 0, packIdx: i % 3, silent: i > 0 });
      if (o && i === 0) ctx.bus.emit('enemy:spawn', { enemy: o });
    }
    fx.timedDecal({ x: e.position.x, z: e.position.z, r0: e.radius, r1: e.radius + 4, life: 0.8, color: tmpC.set(e.eye).multiplyScalar(1.2), p1: 0.1 });
  }

  function enterPhase2(e) {
    const w = e.warden, p2 = e.def.phase2 || {};
    w.phase2 = true;
    if (Array.isArray(p2.abilities)) for (const a of p2.abilities) {
      if (a.id === 'snuff') w.snuff = { radius: a.radius ?? 6, lightMult: a.lightMult ?? 0.6 };
      else w.abilities.push({ ...a, next: 2.5 });
    }
    if (p2.inhaleEvery) w.inhaleEvery = p2.inhaleEvery;
    if (p2.veilDuration) w.veilDuration = p2.veilDuration;
    if (p2.veilDrift) w.veilDrift = p2.veilDrift;
    if (p2.mirror) { w.mirror = p2.mirror; w.mirrorNext = 2; }
    ctx.audio?.play?.('boss_roar', { volume: 0.8, pitch: 1.15 });
    C.shake(0.35, 0.6);
    if (!ctx.state.meta?.settings?.reducedFlashing) ctx.render?.flash?.(0x000000, 0.35, 0.5);
    fx.timedDecal({ x: e.position.x, z: e.position.z, r0: e.radius, r1: e.radius + 10, life: 1.0, color: tmpC.set(e.eye).multiplyScalar(2), p1: 0.07 });
    ctx.bus.emit('toast', { text: `${e.name} burns hotter.`, kind: 'bad' });
  }

  function update(e, dt, t) {
    const w = e.warden;
    if (!w) return;
    const dR = Math.hypot(raft.x - e.position.x, raft.z - e.position.z);
    if (e.state === 'rise') {
      e.invuln = true; e.targetable = false;
      w.rise -= dt;
      const k = 1 - Math.max(0, w.rise) / 3.2;
      e.y = -6 * (1 - THREE.MathUtils.smootherstep(k, 0, 1));
      if (Math.random() < dt * 10) ctx.water?.addRipple?.(e.position.x + (Math.random() - 0.5) * 6, e.position.z + (Math.random() - 0.5) * 6, 1.2);
      if (Math.random() < dt * 12) fx.ink(e.position.x + (Math.random() - 0.5) * 4, 0.2, e.position.z + (Math.random() - 0.5) * 4, 2, 1.6);
      if (w.rise <= 0) { e.state = 'fight'; e.stateT = 0; e.invuln = false; e.targetable = true; e.y = 0; ctx.water?.splash?.(e.position.x, e.position.z, { size: 3, count: 40 }); }
      return;
    }
    if (e.state === 'withdraw') {
      e.invuln = true; e.targetable = false;
      e.y = -6 * Math.min(1, e.stateT / 2.2);
      if (Math.random() < dt * 10) fx.ink(e.position.x, 0.2, e.position.z, 2, 1.6);
      if (e.stateT >= 2.2) C.enemiesSys.despawn(e);
      return;
    }
    // ---- fight
    if (!w.phase2 && e.hp <= e.maxHp * (e.def.phase2?.at ?? 0.5)) enterPhase2(e);
    const casting = w.cast && w.cast.phase === 'tell' && (w.cast.id === 'inhale' || w.cast.id === 'hymnRing');
    const charging = w.cast && w.cast.id === 'charge' && w.cast.phase === 'act';
    if (!charging) {
      // stalk the raft, never quite resting; slow while telegraphing
      w.walk += dt * 0.35;
      const keep = e.radius + 1.2;
      const tx = raft.x + Math.cos(w.walk) * keep * 0.4, tz = raft.z + Math.sin(w.walk) * keep * 0.4;
      const dx = tx - e.position.x, dz = tz - e.position.z, d = Math.hypot(dx, dz) || 1;
      let sp = e.speed * (casting ? 0.25 : 1) * (C.lanternOut ? 1.15 : 1) * (e.slowT > 0 ? 1 - e.slowK * 0.5 : 1) * (dR > 18 ? 2.2 : 1);
      if (e.rootT > 0) sp = 0;
      const a = 1 - Math.exp(-2.5 * dt);
      e.vel.x += ((dx / d) * sp - e.vel.x) * a; e.vel.z += ((dz / d) * sp - e.vel.z) * a;
      e.position.x += e.vel.x * dt; e.position.z += e.vel.z * dt;
      ctx.world?.collide?.(e.position, e.radius * 0.7);
      const ty = Math.atan2(-(raft.x - e.position.x), -(raft.z - e.position.z));
      let dy = ty - e.yaw; dy -= Math.round(dy / TAU) * TAU; e.yaw += dy * Math.min(1, dt * 2.5);
    }
    // contact
    if (dR < e.radius + C.contactRadius * 0.75 && e.contactCd <= 0 && C.canHurtPlayer()) {
      e.contactCd = 1.5;
      C.damagePlayer(cap(e.damage), e.enemyId, e.oilDrain * (C.diff?.drainMult ?? 1), { boss: true });
      const dx = raft.x - e.position.x, dz = raft.z - e.position.z, d = Math.hypot(dx, dz) || 1;
      C.knockPlayer(dx / d, dz / d, 3.5);
    }
    // ability timers
    for (const a of w.abilities) {
      const every = a.id === 'inhale' && w.inhaleEvery ? w.inhaleEvery : (a.every || 10);
      a.next -= dt;
      if (a.next > 0) continue;
      const instant = !(a.telegraph > 0);
      if (!instant && w.cast) continue;
      // only telegraph what can actually reach the raft
      if ((a.id === 'poleSweep' && dR > (a.length ?? 10) + 3) || (a.id === 'inhale' && dR > (a.radius ?? 10) + 4) || (a.id === 'charge' && dR > (a.length ?? 25) - 2)) { a.next = 0.8; continue; }
      a.next = every;
      if (a.id === 'brood' || a.id === 'reliquary') {
        if (C.enemies.length < (C.diff?.maxAlive ?? 60) + 10) brood(e, a);
        continue;
      }
      startCast(e, a);
    }
    // mirror (Abbot phase 2)
    if (w.mirror) {
      w.mirrorNext -= dt;
      if (!w.decoy && w.mirrorNext <= 0) startMirror(e);
      if (w.decoy) {
        w.mirrorT -= dt;
        updateDecoy(e, dt, t);
        if (w.mirrorT <= 0) endMirror(e);
      }
    }
    e.damageFilter = w.decoy ? w.filter : null;
    updateCast(e, dt, t);
    drawAuras(e, t);
  }

  // ---- mirror images
  function startMirror(e) {
    const w = e.warden;
    w.mirrorT = w.mirror.duration ?? 6; w.mirrorNext = (w.mirror.every ?? 12) + w.mirrorT;
    let cr = null;
    try { cr = ctx.models?.createCreature?.('warden', { tint: e.tint, eyeColor: e.eye, scale: e.scale }); } catch { /* optional */ }
    if (!cr || cr.isStub || !(cr.object3d instanceof THREE.Object3D)) cr = null;
    if (cr) C.enemiesSys.group.add(cr.object3d);
    const ang = Math.atan2(e.position.z - raft.z, e.position.x - raft.x) + Math.PI * (0.6 + Math.random() * 0.8);
    const d = Math.hypot(e.position.x - raft.x, e.position.z - raft.z);
    w.decoy = { cr, x: raft.x + Math.cos(ang) * d, z: raft.z + Math.sin(ang) * d, yaw: e.yaw, t: 0 };
    fx.burst(e.position.x, 3, e.position.z, COL.glass, 30, 6, 0.25, 0.9);
    fx.burst(w.decoy.x, 3, w.decoy.z, COL.glass, 30, 6, 0.25, 0.9);
    ctx.audio?.play?.('charge_ping', { volume: 0.8, pitch: 0.8 });
  }
  function updateDecoy(e, dt, t) {
    const dc = e.warden.decoy;
    dc.t += dt;
    const dx = raft.x - dc.x, dz = raft.z - dc.z, d = Math.hypot(dx, dz) || 1;
    if (d > e.radius + 2) { dc.x += dx / d * e.speed * dt; dc.z += dz / d * e.speed * dt; }
    dc.yaw = Math.atan2(-dx, -dz);
    if (dc.cr) {
      const o = dc.cr.object3d;
      o.position.set(dc.x, ctx.water?.getHeight?.(dc.x, dc.z) ?? 0, dc.z);
      o.rotation.y = dc.yaw + Math.PI;
      try { dc.cr.update?.(dt, t, { state: 'move' }); } catch { /* ignore */ }
    }
    fx.glows.add(dc.x, 3.5 * e.scale, dc.z, COL.glassDim.r, COL.glassDim.g, COL.glassDim.b, 3, 0.25 + 0.1 * Math.sin(t * 6));
  }
  function endMirror(e) {
    const dc = e.warden.decoy;
    if (!dc) return;
    fx.burst(dc.x, 3, dc.z, COL.glass, 24, 5, 0.22, 0.8);
    if (dc.cr) { try { dc.cr.dispose?.(); } catch { /* ignore */ } dc.cr.object3d?.parent?.remove(dc.cr.object3d); }
    e.warden.decoy = null;
  }

  // ---- casts
  function updateCast(e, dt, t) {
    const w = e.warden, c = w.cast;
    if (!c) return;
    c.t += dt;
    const a = c.a;
    const ex = e.position.x, ez = e.position.z;
    switch (c.id) {
      case 'inhale': {
        const R = a.radius ?? 10, maw = e.radius + 0.9;
        if (c.phase === 'tell') {
          const k = Math.min(1, c.t / c.tell);
          tmpC.set(e.eye).multiplyScalar(1.4);
          fx.decalsG.add(ex, ez, R, R, 0, DECAL.STREAKS, tmpC.r, tmpC.g, tmpC.b, 0.2 + 0.35 * k, t * 2.2, 0, 0, e.seed);
          fx.decalsG.add(ex, ez, R, R, 0, DECAL.RING, tmpC.r, tmpC.g, tmpC.b, 0.3 + 0.4 * k, 0.05, 0, 0, 0);
          inwardMotes(ex, ez, R, tmpC, dt * 30 * k);
          if (c.t >= c.tell) { c.phase = 'act'; c.t = 0; ctx.audio?.play?.('gloom_rise', { volume: 0.45, pitch: 2.2 }); }
        } else {
          tmpC.set(e.eye).multiplyScalar(1.8);
          fx.decalsG.add(ex, ez, R, R, 0, DECAL.STREAKS, tmpC.r, tmpC.g, tmpC.b, 0.6, t * 4, 0, 0, e.seed);
          fx.decalsI.add(ex, ez, maw, maw, 0, DECAL.STAIN, COL.ink.r, COL.ink.g, COL.ink.b, 0.8, 1, 0, 0, e.seed);
          inwardMotes(ex, ez, R, tmpC, dt * 60);
          const dx = ex - raft.x, dz = ez - raft.z, d = Math.hypot(dx, dz) || 1;
          if (d < R && C.canHurtPlayer()) C.pullPlayer(dx / d, dz / d, a.pull ?? 3.5, dt);
          if (!c.hit && d < maw && C.canHurtPlayer()) {
            c.hit = true;
            C.damagePlayer(cap(a.mawDamage ?? 2), e.enemyId, a.mawOil ?? 25, { boss: true });
            C.knockPlayer(-dx / d, -dz / d, 5);
          }
          if (c.t >= (a.duration ?? 2)) w.cast = null;
        }
        break;
      }
      case 'veil': {
        if (c.phase === 'tell') {
          const k = Math.min(1, c.t / c.tell);
          const R = a.radius ?? 6;
          fx.decalsG.add(c.x, c.z, R, R, 0, DECAL.DASHRING, COL.spore.r, COL.spore.g, COL.spore.b, 0.4 + 0.5 * k, 0.05, 16, t);
          fx.decalsI.add(c.x, c.z, R * k, R * k, e.seed * 5, DECAL.CLOUD, 0.12, 0.06, 0.1, 0.35 * k, 0, 0, 0, e.seed * 7);
          if (c.t >= c.tell) {
            const dur = w.veilDuration ?? a.duration ?? 4;
            C.enemiesSys.addCloud(c.x, c.z, R, dur, 'veil', a.lightMult ?? 0.6, w.veilDrift || 0, 0);
            fx.burst(c.x, 0.6, c.z, COL.spore, 26, 4, 0.18, 1.2, 1.5, -1);
            w.cast = null;
          }
        }
        break;
      }
      case 'charge': {
        const L = a.length ?? 25;
        if (c.phase === 'tell') {
          const k = Math.min(1, c.t / c.tell);
          const rot = Math.atan2(-c.dx, -c.dz);
          const cx = ex + c.dx * L * 0.5, cz = ez + c.dz * L * 0.5;
          fx.decalsG.add(cx, cz, e.radius * 0.8, L * 0.5, rot, DECAL.RECT, COL.amber.r, COL.amber.g, COL.amber.b, 0.45 + 0.5 * k, k, 0, 0, 0);
          fx.decalsI.add(cx, cz, e.radius * 0.95, L * 0.5, rot, DECAL.RECT, COL.ink.r, COL.ink.g, COL.ink.b, 0.35, 1, 0, 0, 0);
          faceDir(e, c.dx, c.dz, dt);
          if (c.t >= c.tell) { c.phase = 'act'; c.t = 0; c.sx = ex; c.sz = ez; ctx.audio?.play?.('boss_roar', { volume: 0.5, pitch: 1.4 }); }
        } else {
          const sp = a.speed ?? 14;
          const travelled = Math.min(L, c.t * sp);
          e.position.x = c.sx + c.dx * travelled; e.position.z = c.sz + c.dz * travelled;
          ctx.world?.collide?.(e.position, e.radius * 0.7);
          e.vel.set(c.dx * sp, 0, c.dz * sp);
          const rot = Math.atan2(-c.dx, -c.dz);
          const rem = L - travelled;
          if (rem > 0.5) fx.decalsG.add(e.position.x + c.dx * rem * 0.5, e.position.z + c.dz * rem * 0.5, e.radius * 0.8, rem * 0.5, rot, DECAL.RECT, COL.amberDim.r, COL.amberDim.g, COL.amberDim.b, 0.6, 1, 0, 0, 0);
          if (Math.random() < 0.6) ctx.water?.splash?.(e.position.x, e.position.z, { size: 1.2, count: 6 });
          const d = Math.hypot(raft.x - e.position.x, raft.z - e.position.z);
          if (!c.hit && d < e.radius + 1.4 && C.canHurtPlayer()) {
            c.hit = true;
            C.damagePlayer(cap(a.damage ?? 2), e.enemyId, 0, { boss: true });
            const px = -c.dz, pz = c.dx, side = (raft.x - e.position.x) * px + (raft.z - e.position.z) * pz >= 0 ? 1 : -1;
            C.knockPlayer(px * side, pz * side, 5);
          }
          if (travelled >= L) w.cast = null;
        }
        break;
      }
      case 'hymnRing': {
        if (c.phase === 'tell') {
          const k = Math.min(1, c.t / c.tell);
          fx.decalsG.add(ex, ez, e.radius + 1.2 + k, e.radius + 1.2 + k, 0, DECAL.RING, COL.glass.r, COL.glass.g, COL.glass.b, 0.4 + 0.6 * k, 0.12, 0.15 * k, 0, 0);
          if (c.t >= c.tell) {
            castRing(e, ex, ez, a);
            if (w.decoy) castRing(e, w.decoy.x, w.decoy.z, a);
            w.cast = null;
          }
        }
        break;
      }
      case 'poleSweep': {
        const len = a.length ?? 10, half = ((a.arcDeg ?? 120) * Math.PI / 180) / 2;
        const rot = Math.atan2(-c.dx, -c.dz);
        faceDir(e, c.dx, c.dz, dt);
        if (c.phase === 'tell') {
          const k = Math.min(1, c.t / c.tell);
          fx.decalsG.add(ex, ez, len, len, rot, DECAL.SECTOR, COL.gold.r, COL.gold.g, COL.gold.b, 0.35 + 0.45 * k, half, k * 0.9, 0, 0);
          if (c.t >= c.tell) { c.phase = 'act'; c.t = 0; }
        } else {
          const k = Math.min(1, c.t / 0.35);
          fx.decalsG.add(ex, ez, len, len, rot, DECAL.SECTOR, COL.paleHot.r, COL.paleHot.g, COL.paleHot.b, 1 - k * 0.6, half, 1, 0, 0);
          if (!c.hit && c.t > 0.12) {
            c.hit = true;
            const dx = raft.x - ex, dz = raft.z - ez, d = Math.hypot(dx, dz) || 1;
            const ang = Math.acos(THREE.MathUtils.clamp((dx * c.dx + dz * c.dz) / d, -1, 1));
            if (d <= len + 1 && ang <= half + 0.08 && C.canHurtPlayer()) {
              C.damagePlayer(cap(a.damage ?? 2), e.enemyId, 0, { boss: true });
              C.knockPlayer(dx / d, dz / d, 3);
            }
            ctx.water?.splash?.(ex + c.dx * len * 0.6, ez + c.dz * len * 0.6, { size: 2, count: 20 });
            C.shake(0.25, 0.3);
          }
          if (c.t >= 0.5) w.cast = null;
        }
        break;
      }
      case 'eclipse': {
        if (c.phase === 'tell') {
          const k = Math.min(1, c.t / c.tell);
          const R = (C.lightR + 4) * (1.6 - 0.6 * k);
          fx.decalsI.add(raft.x, raft.z, R, R, 0, DECAL.RING, COL.ink.r, COL.ink.g, COL.ink.b, 0.5 + 0.4 * k, 0.35, 0, 0, 0);
          fx.decalsG.add(raft.x, raft.z, R * 1.02, R * 1.02, t, DECAL.DASHRING, COL.goldDim.r, COL.goldDim.g, COL.goldDim.b, 0.5 * k, 0.03, 18, -t);
          if (c.t >= c.tell) {
            C.addDim('eclipse', a.lightMult ?? 0.4, a.duration ?? 4);
            C.eclipse = a.duration ?? 4;
            if (!ctx.state.meta?.settings?.reducedFlashing) ctx.render?.flash?.(0x000000, 0.45, 0.6);
            ctx.bus.emit('toast', { text: 'The light gutters. The choir is coming.', kind: 'bad' });
            w.cast = null;
          }
        }
        break;
      }
      default: w.cast = null;
    }
  }
  function faceDir(e, dx, dz, dt) {
    const ty = Math.atan2(-dx, -dz);
    let dy = ty - e.yaw; dy -= Math.round(dy / TAU) * TAU; e.yaw += dy * Math.min(1, dt * 6);
  }
  function inwardMotes(x, z, R, col, rate) {
    let n = rate | 0; if (Math.random() < rate - n) n++;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, r = R * (0.6 + Math.random() * 0.4);
      const px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
      const sp = 6 + Math.random() * 4;
      fx.sparks.emit(px, 0.3 + Math.random() * 0.6, pz, -Math.cos(a) * sp, 0.4, -Math.sin(a) * sp, col.r, col.g, col.b, 0.13, r / sp * 0.9, 0.9, -0.05, 0, 0);
    }
  }
  function castRing(e, x, z, a) {
    const r = rings.find((q) => !q.on) || rings[0];
    const toRaft = Math.atan2(raft.z - z, raft.x - x);
    r.on = true; r.x = x; r.z = z; r.r = e.radius; r.speed = a.speed ?? 7; r.hit = false; r.dmg = a.damage ?? 1; r.src = e.enemyId;
    r.g1 = toRaft + (Math.random() < 0.5 ? -1 : 1) * (0.4 + Math.random() * 0.7);
    r.g2 = r.g1 + Math.PI * (0.7 + Math.random() * 0.6);
    r.gw = 0.5; r.max = 26;
    r.count = a.count ?? 12;
    ctx.audio?.play?.('charge_ping', { volume: 0.9, pitch: 0.75 });
  }
  function angDiff(a, b) { let d = a - b; d -= Math.round(d / TAU) * TAU; return Math.abs(d); }
  function updateRings(dt, t) {
    for (const r of rings) {
      if (!r.on) continue;
      r.r += r.speed * dt;
      if (r.r > r.max) { r.on = false; continue; }
      const fade = Math.min(1, (r.max - r.r) / 4);
      // glass wall: camera-facing ribbons along the arcs, with crystal shards riding it
      const segs = 40;
      for (let i = 0; i < segs; i++) {
        const a0 = (i / segs) * TAU, a1 = ((i + 1) / segs) * TAU, am = (a0 + a1) / 2;
        if (angDiff(am, r.g1) < r.gw || angDiff(am, r.g2) < r.gw) continue;
        const x0 = r.x + Math.cos(a0) * r.r, z0 = r.z + Math.sin(a0) * r.r, x1 = r.x + Math.cos(a1) * r.r, z1 = r.z + Math.sin(a1) * r.r;
        fx.ribbons.seg(x0, 0.55, z0, x1, 0.55, z1, 1.4, 1.4, COL.glassDim.r, COL.glassDim.g, COL.glassDim.b, 0.55 * fade);
        fx.ribbons.seg(x0, 0.5, z0, x1, 0.5, z1, 0.35, 0.35, COL.glass.r, COL.glass.g, COL.glass.b, 0.9 * fade);
      }
      const n = r.count;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + 0.13;
        if (angDiff(a, r.g1) < r.gw + 0.1 || angDiff(a, r.g2) < r.gw + 0.1) continue;
        fx.orbs.add(r.x + Math.cos(a) * r.r, 0.9 + Math.sin(t * 4 + i) * 0.1, r.z + Math.sin(a) * r.r, 0.16, 0.75, 0.16, a, COL.glass.r, COL.glass.g, COL.glass.b);
      }
      fx.decalsG.add(r.x, r.z, r.r, r.r, 0, DECAL.RING, COL.glassDim.r, COL.glassDim.g, COL.glassDim.b, 0.35 * fade, 0.04, 0, 0, 0);
      if (!r.hit && C.canHurtPlayer()) {
        const dx = raft.x - r.x, dz = raft.z - r.z, d = Math.hypot(dx, dz);
        if (Math.abs(d - r.r) < 0.8) {
          const ang = Math.atan2(dz, dx);
          if (angDiff(ang, r.g1) >= r.gw * 0.85 && angDiff(ang, r.g2) >= r.gw * 0.85) {
            r.hit = true;
            C.damagePlayer(r.dmg, r.src, 0, { boss: true });
            fx.burst(raft.x, 0.8, raft.z, COL.glass, 16, 4, 0.16, 0.5);
          }
        }
      }
    }
  }

  function drawAuras(e, t) {
    const w = e.warden;
    if (w.snuff) {
      const R = w.snuff.radius;
      fx.decalsI.add(e.position.x, e.position.z, R, R, t * 0.1, DECAL.CLOUD, COL.smoke.r * 0.4, COL.smoke.g * 0.4, COL.smoke.b * 0.4, 0.55, 0, 0, 0, e.seed * 3);
      fx.decalsG.add(e.position.x, e.position.z, R, R, 0, DECAL.DASHRING, COL.pale.r * 0.4, COL.pale.g * 0.4, COL.pale.b * 0.4, 0.5, 0.03, 20, t * 0.4);
      if (Math.random() < 0.4) {
        const a = Math.random() * TAU, rr = R * (0.4 + Math.random() * 0.6);
        fx.smoke.emit(e.position.x + Math.cos(a) * rr, 0.4, e.position.z + Math.sin(a) * rr, 0, 0.5, 0, 0.12, 0.11, 0.09, 1.0, 1.6, 0.45, 0.6, 1, 0.1);
      }
      if (Math.hypot(raft.x - e.position.x, raft.z - e.position.z) < R) C.addDim('snuff', w.snuff.lightMult, 0.15);
    }
  }

  const creatureState = (e, o) => {
    const w = e.warden;
    o.k = undefined;
    if (e.state === 'rise' || e.state === 'withdraw') { o.state = 'move'; return o; }
    const c = w?.cast;
    if (c && (c.phase === 'tell' || c.id === 'inhale' || c.id === 'charge')) {
      o.state = 'attack';
      o.k = c.phase === 'tell' ? Math.min(0.62, (c.t / Math.max(0.1, c.tell)) * 0.62) : 0.62 + Math.min(0.38, c.t * 0.5);
      return o;
    }
    o.state = e.hurt > 0.75 ? 'hurt' : 'move';
    return o;
  };

  function withdraw(e) {
    if (!e.warden || e.state === 'withdraw') return;
    endMirror(e);
    e.warden.cast = null;
    e.state = 'withdraw'; e.stateT = 0; e.invuln = true; e.targetable = false;
    ctx.bus.emit('toast', { text: (ctx.data.TEXT?.bossWithdraw || '{name} sinks back into the dark.').replace('{name}', e.name), kind: 'info' });
  }

  return {
    init, update, creatureState, withdraw,
    updateGlobal(dt, t) { updateRings(dt, t); },
    onDeath(e) { endMirror(e); if (e.warden) e.warden.cast = null; },
    clear() { for (const r of rings) r.on = false; for (const e of C.enemies) if (e.warden) endMirror(e); },
  };
}
