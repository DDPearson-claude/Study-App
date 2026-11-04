// combat-enemies.js — gloomling pool, behaviours, steering, contacts, rendering and the
// small hazards they leave (ink globs, slicks, spore clouds, floating stolen fish).
// Helper of combat.js; reached only through the shared combat core `C`.
// Behaviours (data ENEMIES[].behavior): chase · pack · latch · leap · orbitDive · artillery ·
// bulwark · stalk · slam (Drowned Hand elite). Wardens live in combat-warden.js.
import * as THREE from 'three';
import { DECAL, lin } from './combat-fx.js';
import { toonMaterial, addOutline } from './toon.js';

const TAU = Math.PI * 2;
const MODEL_R = { wisp: 0.42, mite: 0.26, moth: 0.5, eel: 0.5, hand: 1.5, warden: 2.4 };
const MODEL_HOVER = { wisp: 0.8, mite: 0.1, moth: 1.5, eel: -0.05, hand: 0, warden: 0 };
const SWARM_MAX = { wisp: 170, mite: 170, moth: 48, eel: 14 };
const SWARM_KINDS = ['wisp', 'mite', 'moth', 'eel'];

// colours (linear, HDR where >1)
const COL = {
  ember: lin(0xffa040, 2.4), emberDim: lin(0xff7a2a, 1.6), pale: lin(0xe9e2cf, 1.0), paleHot: lin(0xf4efe2, 2.2),
  white: lin(0xffffff, 3.2), ink: lin(0x040508, 1), inkSoft: lin(0x0a0a12, 1), gold: lin(0xe8c66a, 2.6),
  spore: lin(0xffb46a, 1.2), sporeCloud: lin(0x6b3a5e, 0.9), glass: lin(0xc9e8ff, 1.6), slick: lin(0x05060c, 1),
  oil: lin(0xffb347, 2.4), fishGlow: lin(0xd0c8f4, 1.6),
};
const tmpC = new THREE.Color();

export function createEnemies(C) {
  const { ctx, fx } = C;
  const D = () => ctx.data;
  const active = C.enemies;          // alive enemies (contract array)
  const dying = [];                   // dissolving
  const pool = [];
  let nextId = 1, packSeq = 1;

  // ---------------------------------------------------------------- render: swarms + creatures
  const group = new THREE.Group(); group.name = 'combat:enemies';
  C.group.add(group);
  const swarms = {};
  const swarmCount = { wisp: 0, mite: 0, moth: 0, eel: 0 };

  function fallbackSwarm(kind, max) {
    const geo = new THREE.SphereGeometry(MODEL_R[kind] || 0.4, 10, 8);
    const mat = toonMaterial({ color: 0x0b0b12, rim: 0.5 });
    const mesh = new THREE.InstancedMesh(geo, mat, max);
    mesh.count = 0; mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3();
    return {
      object3d: mesh, max,
      setCount(n) { mesh.count = Math.min(n, max); },
      set(i, position, yaw = 0, scale = 1, hurt = 0, fade = 0) {
        e.set(0, yaw, 0); q.setFromEuler(e); s.setScalar(scale * (1 - fade)); p.copy(position); p.y += (MODEL_HOVER[kind] ?? 0.5) * scale;
        m4.compose(p, q, s); mesh.setMatrixAt(i, m4); mesh.instanceMatrix.needsUpdate = true;
      },
      update() {}, dispose() { mesh.parent?.remove(mesh); geo.dispose(); mat.dispose(); },
    };
  }
  function ensureSwarms() {
    if (swarms.wisp) return;
    const models = ctx.models;
    for (const kind of SWARM_KINDS) {
      let sw = null;
      try { if (models && !models.isStub) sw = models.createSwarm?.(kind, SWARM_MAX[kind]); } catch (e) { C.report('createSwarm', e); }
      if (!sw || sw.isStub || !(sw.object3d instanceof THREE.Object3D)) sw = fallbackSwarm(kind, SWARM_MAX[kind]);
      sw.setCount(0);
      group.add(sw.object3d);
      swarms[kind] = sw;
    }
  }
  function createCreature(e) {
    const models = ctx.models;
    let cr = null;
    try { if (models && !models.isStub) cr = models.createCreature?.(e.kind, { tint: e.tint, eyeColor: e.eye, scale: e.scale }); } catch (err) { C.report('createCreature', err); }
    if (!cr || cr.isStub || !(cr.object3d instanceof THREE.Object3D)) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(MODEL_R[e.kind] || 1, 14, 10), toonMaterial({ color: 0x0b0b12, rim: 0.5 }));
      body.position.y = (MODEL_R[e.kind] || 1) * 0.8; addOutline(body, { thickness: 0.04 }); g.add(body);
      cr = { object3d: g, radius: MODEL_R[e.kind] || 1, update() {}, hit() {}, dispose() { g.parent?.remove(g); body.geometry.dispose(); body.material.dispose(); } };
    }
    group.add(cr.object3d);
    return cr;
  }

  // ---------------------------------------------------------------- pool
  function newEnemy() {
    return {
      id: 0, kind: 'wisp', enemyId: '', def: null, name: '', behavior: 'chase',
      position: new THREE.Vector3(), vel: new THREE.Vector3(), knock: new THREE.Vector3(), home: new THREE.Vector3(), aim: new THREE.Vector3(),
      hp: 1, maxHp: 1, elite: false, boss: false, alive: false,
      speed: 1, damage: 1, oilDrain: 0, xp: 1, scale: 1, radius: 0.4, tint: 0, eye: 0, curEye: 0,
      state: 'move', stateT: 0, age: 0, spawnT: 0, dieT: 0, dieDur: 0.5,
      stun: 0, slowT: 0, slowK: 0, rootT: 0, burnT: 0, burnDps: 0, chillT: 0, chargeT: 0, staggerT: 0, staggerMult: 1,
      hurt: 0, flare: 0, yaw: 0, phase: 0, seed: 0, y: 0,
      inLight: false, visible: true, targetable: true, airborne: false, submerged: false, invuln: false,
      contactCd: 0, cdOrbit: 0, cdBeam: 0, cdLine: 0, cdRam: 0, cdTrail: 0, hookStamp: 0, auraAcc: 0, revealT: 0,
      packId: 0, packIdx: 0, a: 0, b: 0, c: 0, n: 0, tx: 0, tz: 0, dirX: 0, dirZ: 0, speedMult: 1, tide: 0,
      sx: 0, sz: 0, leashT: 0, carrying: null, creature: null, latchSlot: -1, auraTaken: 1, zapTaken: 1,
      cracked: false, zaps: 0, slams: 0, mods: null, variant: null, noDrop: false, gift: false, damageFilter: null,
      warden: null, mirrorOf: null,
    };
  }
  function release(e) {
    if (e.creature) { try { e.creature.dispose?.(); } catch { /* ignore */ } e.creature = null; }
    e.alive = false; e.warden = null; e.carrying = null; e.damageFilter = null;
    pool.push(e);
  }

  // ---------------------------------------------------------------- spawn
  function spawn(defId, x, z, opts = {}) {
    const data = D();
    const def = data.ENEMY_BY_ID?.[defId] || (data.ENEMIES || []).find((d) => d.id === defId);
    if (!def) return null;
    const maxLive = data.BALANCE?.combat?.maxLive ?? 150;
    if (active.length >= maxLive && !def.boss && !def.elite && !opts.force) return null;
    ensureSwarms();
    const e = pool.pop() || newEnemy();
    const zoneId = C.zoneId;
    const variant = def.variants?.[zoneId] || null;
    const mods = def.zoneMods?.[zoneId] || null;
    const diff = C.diff;
    e.id = nextId++; e.def = def; e.enemyId = def.id; e.kind = def.model || 'wisp'; e.behavior = def.behavior || 'chase';
    e.variant = variant; e.mods = mods;
    e.name = mods?.name || variant?.name || def.name;
    e.tint = mods?.tint ?? variant?.tint ?? def.tint ?? 0x07080d;
    e.eye = mods?.eyeColor ?? variant?.eyeColor ?? def.eyeColor ?? 0xecf0f6; e.curEye = -1;
    e.scale = (variant?.scale ?? def.scale ?? 1) * (opts.scale || 1);
    e.radius = (MODEL_R[e.kind] || 0.4) * e.scale;
    e.elite = !!def.elite; e.boss = !!def.boss;
    const hpMult = opts.hpMult ?? (def.boss ? (diff?.bossHpMult ?? diff?.hpMult) : diff?.hpMult) ?? 1;
    e.maxHp = e.hp = Math.max(1, def.hp * hpMult);
    e.speedMult = opts.speedMult || 1;
    e.speed = (def.speed || 0) * (diff?.speedMult ?? 1) * e.speedMult;
    e.damage = def.damage || 0; e.oilDrain = def.oilDrain || 0; e.xp = def.xp || 0;
    e.auraTaken = def.auraTaken ?? 1; e.zapTaken = def.zapTaken ?? 1;
    e.position.set(x, 0, z); e.vel.set(0, 0, 0); e.knock.set(0, 0, 0); e.home.set(x, 0, z); e.aim.set(x, 0, z);
    e.alive = true; e.state = 'move'; e.stateT = 0; e.age = 0; e.spawnT = opts.instant ? 0 : (data.BALANCE?.combat?.fadeIn ?? 0.6); e.dieT = 0;
    e.stun = e.slowT = e.slowK = e.rootT = e.burnT = e.burnDps = e.chillT = e.chargeT = e.staggerT = 0; e.staggerMult = 1;
    e.hurt = 0; e.flare = 0; e.phase = Math.random(); e.seed = Math.random(); e.y = 0;
    e.inLight = false; e.visible = true; e.targetable = true; e.airborne = false; e.submerged = false; e.invuln = false;
    e.contactCd = 0; e.cdOrbit = e.cdBeam = e.cdLine = e.cdRam = e.cdTrail = 0; e.hookStamp = 0; e.auraAcc = 0; e.revealT = 0;
    e.packId = opts.packId || 0; e.packIdx = opts.packIdx || 0; e.a = e.b = e.c = e.n = 0; e.tx = x; e.tz = z;
    e.dirX = opts.dirX || 0; e.dirZ = opts.dirZ || 0; e.tide = opts.tide || 0;
    e.sx = e.sz = 0; e.leashT = 0; e.carrying = null; e.latchSlot = -1; e.cracked = false; e.zaps = 0; e.slams = 0;
    e.noDrop = false; e.gift = false; e.damageFilter = null; e.warden = null; e.mirrorOf = null;
    e.yaw = Math.atan2(-(C.raft.x - x), -(C.raft.z - z));
    initBehavior(e, opts);
    if (e.kind === 'hand' || e.kind === 'warden') e.creature = createCreature(e);
    active.push(e);
    if (!opts.silent) {
      ctx.water?.addRipple?.(x, z, e.elite || e.boss ? 2 : 0.6);
      ctx.bus.emit('enemy:spawn', { enemy: e });
    }
    return e;
  }

  function initBehavior(e, opts) {
    const def = e.def;
    switch (e.behavior) {
      case 'leap': {
        e.state = 'approach'; e.submerged = true; e.targetable = false;
        const tel = def.telegraph || {};
        const cr = tel.circleRadius || [6, 9];
        e.a = cr[0] + Math.random() * (cr[1] - cr[0]);                  // circle radius
        e.b = Math.random() < 0.5 ? 1 : -1;                              // circle direction
        e.c = e.variant?.feint ? 1 : 0;                                  // feint pending
        break;
      }
      case 'orbitDive': e.state = 'approach'; e.a = Math.atan2(e.position.z - C.raft.z, e.position.x - C.raft.x); break;
      case 'artillery': e.state = 'move'; e.a = 2 + Math.random() * 1.5; e.b = Math.random() < 0.5 ? 1 : -1; break;
      case 'stalk': e.state = 'gather'; e.b = Math.random() < 0.5 ? 1 : -1; break;
      case 'latch': e.state = 'move'; break;
      case 'slam': {
        e.state = 'stain'; e.invuln = true; e.targetable = false;
        e.position.set(C.raft.x, 0, C.raft.z); e.home.copy(e.position);
        e.speed = 0; e.radius = (MODEL_R.hand) * e.scale;
        if (opts.delay) { e.state = 'wait'; e.a = opts.delay; }
        break;
      }
      case 'warden': C.warden?.init(e, opts); break;
      default: e.state = 'move';
    }
  }

  // ---------------------------------------------------------------- death
  function kill(e, cause = 'slain', { drop = true } = {}) {
    if (!e.alive) return;
    e.alive = false;
    const i = active.indexOf(e);
    if (i >= 0) active.splice(i, 1);
    e.dieT = 0;
    e.dieDur = e.boss ? 2.6 : e.elite ? 1.5 : cause === 'contact' ? 0.22 : 0.36;
    dying.push(e);
    const p = e.position;
    const hy = (MODEL_HOVER[e.kind] ?? 0.5) * e.scale + (e.y || 0);
    if (e.latchSlot >= 0) { C.unlatch?.(e); }
    if (cause === 'contact') {
      fx.ink(p.x, hy, p.z, 5, 0.7);
      fx.burst(p.x, hy, p.z, COL.emberDim, 6, 2.5, 0.14, 0.4);
    } else if (cause !== 'despawn' && cause !== 'escape' && cause !== 'zone') {
      fx.ink(p.x, hy, p.z, e.boss ? 18 : e.elite ? 10 : 4, e.boss ? 2.4 : e.elite ? 1.5 : 0.6);
      tmpC.set(e.eye).multiplyScalar(2.2);
      fx.burst(p.x, hy, p.z, tmpC, e.boss ? 40 : e.elite ? 22 : 7, e.boss ? 7 : 3.5, e.boss ? 0.35 : 0.16, e.boss ? 1.4 : 0.6, 2);
      if (cause !== 'dawn') fx.burst(p.x, hy, p.z, COL.ember, e.boss ? 20 : 4, 2.5, 0.12, 0.7, 2.5);
    }
    if (e.creature) { try { e.creature.hit?.(); } catch { /* ignore */ } }
    C.onEnemyDeath?.(e, cause, drop && !e.noDrop);
  }
  function despawn(e) { kill(e, 'despawn', { drop: false }); e.dieDur = 0.35; }

  // ---------------------------------------------------------------- spatial hash (separation)
  const HS = 1024, CELL = 2.2;
  const head = new Int32Array(HS), nxt = new Int32Array(400);
  const hkey = (cx, cz) => ((cx * 73856093) ^ (cz * 19349663)) & (HS - 1);
  function buildGrid() {
    head.fill(-1);
    const n = Math.min(active.length, 400);
    for (let i = 0; i < n; i++) {
      const e = active[i];
      const k = hkey(Math.floor(e.position.x / CELL), Math.floor(e.position.z / CELL));
      nxt[i] = head[k]; head[k] = i;
    }
  }
  function separation(e, idx) {
    e.sx = 0; e.sz = 0;
    if (e.boss || e.elite || e.latchSlot >= 0 || e.submerged) return;
    const cx = Math.floor(e.position.x / CELL), cz = Math.floor(e.position.z / CELL);
    let sx = 0, sz = 0;
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      let j = head[hkey(cx + dx, cz + dz)];
      while (j >= 0) {
        if (j !== idx) {
          const o = active[j];
          const ox = e.position.x - o.position.x, oz = e.position.z - o.position.z;
          const want = Math.max(C.sepDist, (e.radius + o.radius) * 1.15);
          const d2 = ox * ox + oz * oz;
          if (d2 < want * want && d2 > 1e-6 && !o.boss && !o.elite) {
            const d = Math.sqrt(d2), k = (want - d) / want;
            sx += (ox / d) * k; sz += (oz / d) * k;
          } else if (d2 <= 1e-6) { sx += Math.random() - 0.5; sz += Math.random() - 0.5; }
        }
        j = nxt[j];
      }
    }
    e.sx = sx; e.sz = sz;
  }

  // ---------------------------------------------------------------- steering
  function steerTo(e, dt, tx, tz, spd, { sep = 1.2, avoid = true, accel = 6, weave = 0 } = {}) {
    let dx = tx - e.position.x, dz = tz - e.position.z;
    const d = Math.hypot(dx, dz);
    if (d > 1e-4) { dx /= d; dz /= d; } else { dx = 0; dz = 0; }
    let vx = dx * spd, vz = dz * spd;
    if (weave) { const w = Math.sin(e.age * 2.2 + e.phase * TAU) * weave * spd; vx += -dz * w; vz += dx * w; }
    vx += e.sx * sep * Math.max(1.2, spd); vz += e.sz * sep * Math.max(1.2, spd);
    if (avoid) {
      const obs = C.obstacles;
      for (let i = 0; i < obs.length; i++) {
        const o = obs[i];
        const ox = e.position.x - o.x, oz = e.position.z - o.z;
        const m = o.r + e.radius + 1.3;
        const d2 = ox * ox + oz * oz;
        if (d2 < m * m && d2 > 1e-6) {
          const od = Math.sqrt(d2), k = (m - od) / m;
          const nx = ox / od, nz = oz / od;
          const side = (nx * dz - nz * dx) >= 0 ? 1 : -1;     // flow around toward the target side
          vx += (nx * 1.6 + -nz * side * 1.2) * k * Math.max(1.5, spd);
          vz += (nz * 1.6 + nx * side * 1.2) * k * Math.max(1.5, spd);
        }
      }
    }
    const a = 1 - Math.exp(-accel * dt);
    e.vel.x += (vx - e.vel.x) * a; e.vel.z += (vz - e.vel.z) * a;
    return d;
  }
  function moveFactor(e) {
    if (e.stun > 0 || e.rootT > 0) return 0;
    let f = 1;
    if (e.inLight) f *= e.behavior === 'latch' ? (e.def.lightSpeedMult ?? C.light.mothInside ?? 1.15) : (C.light.insideSlow ?? 0.75);
    if (C.lanternOut) f *= C.B?.damage?.darkness?.enemySpeed ?? 1.3;
    if (e.slowT > 0) f *= 1 - e.slowK;
    return f;
  }
  function integrate(e, dt, f) {
    const p = e.position;
    p.x += (e.vel.x * f + e.knock.x) * dt; p.z += (e.vel.z * f + e.knock.z) * dt;
    const kd = Math.exp(-6 * dt);
    e.knock.x *= kd; e.knock.z *= kd;
    if (e.def.waterBound) ctx.world?.collide?.(p, Math.max(0.3, e.radius * 0.8));
    const sp2 = e.vel.x * e.vel.x + e.vel.z * e.vel.z;
    if (sp2 > 0.04) {
      const ty = Math.atan2(-e.vel.x, -e.vel.z);
      let dy = ty - e.yaw; dy -= Math.round(dy / TAU) * TAU;
      e.yaw += dy * Math.min(1, dt * 8);
    }
  }
  function faceRaft(e, dt, rate = 8) {
    const ty = Math.atan2(-(C.raft.x - e.position.x), -(C.raft.z - e.position.z));
    let dy = ty - e.yaw; dy -= Math.round(dy / TAU) * TAU;
    e.yaw += dy * Math.min(1, dt * rate);
  }
  const distRaft = (e) => Math.hypot(e.position.x - C.raft.x, e.position.z - C.raft.z);

  // ---------------------------------------------------------------- per-pack aggregates
  const PK = 64;
  const pkX = new Float32Array(PK), pkZ = new Float32Array(PK), pkVX = new Float32Array(PK), pkVZ = new Float32Array(PK), pkN = new Int16Array(PK);
  const pkMin = new Int16Array(PK);
  function aggregatePacks() {
    pkX.fill(0); pkZ.fill(0); pkVX.fill(0); pkVZ.fill(0); pkN.fill(0); pkMin.fill(999);
    for (let i = 0; i < active.length; i++) {
      const e = active[i];
      if (!e.packId) continue;
      const k = e.packId % PK;
      pkX[k] += e.position.x; pkZ[k] += e.position.z; pkVX[k] += e.vel.x; pkVZ[k] += e.vel.z; pkN[k]++;
      if (e.behavior === 'orbitDive' && e.state !== 'dive' && e.state !== 'tell') pkMin[k] = Math.min(pkMin[k], e.packIdx);
    }
  }

  // ---------------------------------------------------------------- contact with the raft
  function contactRange(e) { return C.contactRadius + Math.max(0, e.radius - 0.45) * 0.8; }
  function contact(e, opts = {}) {
    if (!C.canHurtPlayer()) return false;
    if (C.ramActive() && !e.elite && !e.boss) {
      if (e.cdRam > 0) return false;
      e.cdRam = 0.6;
      const ram = C.ramParams();
      const dx = e.position.x - C.raft.x, dz = e.position.z - C.raft.z, d = Math.hypot(dx, dz) || 1;
      C.hitEnemy(e, (ram?.damage ?? 30) * C.stats.damageMult, { knockX: dx / d, knockZ: dz / d, knock: ram?.knock ?? 5, source: 'ram' });
      fx.burst(e.position.x, 0.6, e.position.z, COL.ember, 10, 5, 0.2, 0.5);
      return true;
    }
    const emb = opts.embers ?? e.damage;
    const oil = (opts.oil ?? e.oilDrain) * (C.diff?.drainMult ?? 1);
    C.damagePlayer(emb, e.enemyId, oil, { boss: e.boss });
    if (e.def.burstOnContact && !opts.keep) {
      e.noDrop = true;
      if (e.def.contactDim) C.addDim('sporeContact', e.def.contactDim.mult, e.def.contactDim.time);
      kill(e, 'contact', { drop: false });
    }
    return true;
  }

  // ---------------------------------------------------------------- behaviours
  const raft = C.raft;
  function bChase(e, dt) {
    const tel = e.def.telegraph || {};
    const f = moveFactor(e);
    const d = distRaft(e);
    if (e.state === 'move') {
      steerTo(e, dt, raft.x, raft.z, e.speed, { weave: 0.35 });
      integrate(e, dt, f);
      if (d <= (tel.lungeAt ?? 3) && e.spawnT <= 0) { e.state = 'tell'; e.stateT = 0; }
      if (d < contactRange(e)) contact(e);
    } else if (e.state === 'tell') {
      e.vel.multiplyScalar(Math.exp(-10 * dt));
      integrate(e, dt, f);
      faceRaft(e, dt, 14);
      e.flare = Math.min(1, e.stateT / (tel.pause ?? 0.35));
      if (e.stateT >= (tel.pause ?? 0.35) && f > 0) {
        const dx = raft.x - e.position.x, dz = raft.z - e.position.z, dd = Math.hypot(dx, dz) || 1;
        e.dirX = dx / dd; e.dirZ = dz / dd;
        e.state = 'lunge'; e.stateT = 0;
      }
    } else if (e.state === 'lunge') {
      const sp = e.speed * (tel.lungeMult ?? 2.5);
      e.vel.set(e.dirX * sp, 0, e.dirZ * sp);
      integrate(e, dt, Math.max(f, 0.75));
      e.flare = 1;
      if (d < contactRange(e)) { contact(e); return; }
      if (e.stateT >= (tel.lungeTime ?? 0.5)) { e.state = 'recover'; e.stateT = 0; }
    } else if (e.state === 'recover') {
      e.flare = Math.max(0, e.flare - dt * 4);
      steerTo(e, dt, raft.x, raft.z, e.speed * 0.4);
      integrate(e, dt, f);
      if (d < contactRange(e)) contact(e);
      if (e.stateT > 0.45) { e.state = 'move'; e.stateT = 0; }
    } else { e.state = 'move'; }
  }

  function bPack(e, dt) {
    const f = moveFactor(e);
    let tx = raft.x, tz = raft.z;
    if (e.tide > 0) {
      // Mite Tide: sweep along a fixed heading, then fall back to hunting
      e.tide -= dt;
      tx = e.position.x + e.dirX * 20; tz = e.position.z + e.dirZ * 20;
    }
    const k = e.packId % PK, n = pkN[k];
    let spd = e.speed;
    if (n > 1) {
      const cx = pkX[k] / n, cz = pkZ[k] / n;
      tx = tx * 0.75 + cx * 0.25; tz = tz * 0.75 + cz * 0.25;
    }
    steerTo(e, dt, tx, tz, spd, { sep: 1.6 });
    // zig-zag ±zigzag m/s perpendicular to travel
    const zz = (e.def.zigzag ?? 1.2) * Math.sin(e.age * 5.5 + e.phase * TAU);
    const vl = Math.hypot(e.vel.x, e.vel.z) || 1;
    e.vel.x += (-e.vel.z / vl) * zz * dt * 6; e.vel.z += (e.vel.x / vl) * zz * dt * 6;
    if (n > 1) { e.vel.x += (pkVX[k] / n - e.vel.x) * 0.6 * dt; e.vel.z += (pkVZ[k] / n - e.vel.z) * 0.6 * dt; }
    integrate(e, dt, f);
    if (distRaft(e) < contactRange(e)) contact(e);
  }

  function bLatch(e, dt) {
    const L = C.lantern;
    if (e.state === 'latched') {
      if (e.latchSlot < 0) { e.state = 'move'; return; }
      const ang = e.latchSlot * (TAU / 4) + e.age * 0.9 + Math.sin(e.age * 7 + e.seed * 9) * 0.25;
      const r = 0.5 + Math.sin(e.age * 11 + e.phase * 6) * 0.06;
      e.position.set(L.x + Math.cos(ang) * r, L.y - 1.5 * e.scale - 0.15 + Math.sin(e.age * 13) * 0.05, L.z + Math.sin(ang) * r);
      e.yaw = Math.atan2(Math.cos(ang), Math.sin(ang));
      e.vel.set(0, 0, 0);
      const drain = (e.def.oilDrain || 0) * (C.diff?.drainMult ?? 1) * dt;
      if (drain > 0 && C.canHurtPlayer()) C.addOil(-drain);
      return;
    }
    const f = moveFactor(e);
    // erratic flutter toward the lantern
    const wob = 2.4;
    const tx = L.x + Math.sin(e.age * 2.7 + e.seed * 20) * wob, tz = L.z + Math.cos(e.age * 2.1 + e.seed * 11) * wob;
    const d = Math.hypot(L.x - e.position.x, L.z - e.position.z);
    if (e.state === 'circle') {
      const ang = Math.atan2(e.position.z - raft.z, e.position.x - raft.x) + dt * 1.6;
      steerTo(e, dt, raft.x + Math.cos(ang) * 2.6, raft.z + Math.sin(ang) * 2.6, e.speed, { avoid: false, accel: 4 });
      integrate(e, dt, f);
      e.a -= dt;
      if (e.a <= 0) { e.state = 'move'; }
      return;
    }
    steerTo(e, dt, d < 4 ? L.x : tx, d < 4 ? L.z : tz, e.speed, { avoid: false, accel: 3.5, sep: 0.6 });
    integrate(e, dt, f);
    if (d < 1.1 && e.stun <= 0 && e.spawnT <= 0) {
      if (C.tryLatch?.(e)) { e.state = 'latched'; e.stateT = 0; }
      else { e.state = 'circle'; e.a = 1.2; }
    }
  }

  function bLeap(e, dt) {
    const tel = e.def.telegraph || {};
    const f = moveFactor(e) > 0 ? 1 : 0;
    const ringR = e.a;
    if (e.state === 'approach' || e.state === 'circle') {
      e.submerged = true; e.targetable = false; e.airborne = false;
      e.y = -0.42;
      const ang = Math.atan2(e.position.z - raft.z, e.position.x - raft.x);
      const d = distRaft(e);
      const angV = (e.speed / Math.max(3, ringR)) * e.b;
      const na = ang + angV * dt * (e.state === 'circle' ? 1 : 0.4);
      steerTo(e, dt, raft.x + Math.cos(na) * ringR, raft.z + Math.sin(na) * ringR, e.speed, { sep: 0.4 });
      integrate(e, dt, f);
      ctx.world?.collide?.(e.position, 0.5);
      if (e.state === 'approach' && Math.abs(d - ringR) < 1.2) {
        e.state = 'circle'; e.stateT = 0;
        const c = tel.circle || [3, 6];
        e.n = c[0] + Math.random() * (c[1] - c[0]);
      }
      if (e.state === 'circle' && e.stateT >= e.n && e.spawnT <= 0) {
        e.state = e.c ? 'feint' : 'surface'; e.stateT = 0;
        ctx.audio?.play?.('surge_warn', { volume: 0.55, pitch: 1.35 });
      }
      if (Math.random() < dt * 2) ctx.water?.addRipple?.(e.position.x, e.position.z, 0.35);
    } else if (e.state === 'feint') {
      e.submerged = false; e.targetable = true;
      e.y = Math.sin(Math.min(1, e.stateT / 0.8) * Math.PI) * 0.6 - 0.1;
      e.vel.multiplyScalar(Math.exp(-6 * dt)); integrate(e, dt, f);
      if (e.stateT > 0.05 && e.a > 0 && e.n >= 0) { ctx.water?.splash?.(e.position.x, e.position.z, { size: 0.8, count: 10 }); e.n = -1; }
      if (e.stateT >= (e.variant?.feint ?? 0.8)) { e.c = 0; e.state = 'circle'; e.stateT = 0; e.n = 1.4; }
    } else if (e.state === 'surface') {
      e.submerged = false; e.targetable = true; e.airborne = false;
      const T = tel.surface ?? 1.0;
      const k = Math.min(1, e.stateT / T);
      e.y = -0.42 + k * 0.42;
      e.vel.multiplyScalar(Math.exp(-5 * dt)); integrate(e, dt, f);
      faceRaft(e, dt, 10);
      e.flare = k;
      if (Math.random() < dt * 6) ctx.water?.addRipple?.(e.position.x, e.position.z, 0.5);
      if (e.stateT >= T) {
        const dx = raft.x - e.position.x, dz = raft.z - e.position.z, d = Math.hypot(dx, dz) || 1;
        e.dirX = dx / d; e.dirZ = dz / d;
        const span = Math.max(6, d * 2);
        e.home.copy(e.position);
        e.aim.set(e.position.x + e.dirX * span, 0, e.position.z + e.dirZ * span);
        e.state = 'leap'; e.stateT = 0; e.n = 0;
        ctx.water?.splash?.(e.position.x, e.position.z, { size: 1, count: 14 });
      }
    } else if (e.state === 'leap') {
      e.submerged = false; e.targetable = true; e.airborne = true;
      const T = tel.leap ?? 0.6;
      const k = Math.min(1, e.stateT / T);
      e.position.x = e.home.x + (e.aim.x - e.home.x) * k;
      e.position.z = e.home.z + (e.aim.z - e.home.z) * k;
      e.y = Math.sin(k * Math.PI) * 2.3;
      e.yaw = Math.atan2(-e.dirX, -e.dirZ);
      if (!e.n && distRaft(e) < contactRange(e) + 0.5 && e.y > 0.4) {
        e.n = 1;
        if (C.canHurtPlayer()) {
          C.damagePlayer(e.damage, e.enemyId, 0, {});
          if (e.def.steals) { const fish = C.stealFish?.(e); if (fish) e.carrying = fish; }
          ctx.water?.splash?.(raft.x, raft.z, { size: 1.2, count: 16 });
        }
      }
      if (k >= 1) {
        ctx.water?.splash?.(e.position.x, e.position.z, { size: 1.1, count: 14 });
        ctx.world?.collide?.(e.position, 0.5);
        e.airborne = false; e.y = -0.3;
        if (e.carrying) { e.state = 'flee'; e.stateT = 0; }
        else { e.state = 'approach'; e.stateT = 0; }
      }
    } else if (e.state === 'flee') {
      e.submerged = true; e.targetable = false; e.airborne = false; e.y = -0.35;
      const dx = e.position.x - raft.x, dz = e.position.z - raft.z, d = Math.hypot(dx, dz) || 1;
      steerTo(e, dt, e.position.x + dx / d * 10, e.position.z + dz / d * 10, e.speed * 1.4, { sep: 0 });
      integrate(e, dt, f); ctx.world?.collide?.(e.position, 0.5);
      if (e.stateT >= (e.def.fleeTime ?? 3)) {
        C.onFishEscaped?.(e);
        e.carrying = null;
        despawn(e);
      }
    }
  }

  function bOrbitDive(e, dt) {
    const orb = e.def.orbit || {};
    const R = orb.radius ?? 9;
    const f = moveFactor(e);
    const k = e.packId % PK;
    if (e.state === 'approach' || e.state === 'orbit') {
      e.a += dt * (e.speed / R) * 0.9;
      const slot = e.packIdx * (TAU / 3);
      const tx = raft.x + Math.cos(e.a + slot) * R, tz = raft.z + Math.sin(e.a + slot) * R;
      steerTo(e, dt, tx, tz, e.speed * 1.3, { sep: 0.8 });
      integrate(e, dt, Math.max(f, 0.5));
      const d = distRaft(e);
      if (e.state === 'approach' && Math.abs(d - R) < 1.5) { e.state = 'orbit'; e.stateT = 0; }
      if (e.state === 'orbit') {
        const turn = pkMin[k] === e.packIdx || pkN[k] <= 1;
        const wait = (orb.time ?? 2) + (turn ? 0 : 99);
        if (e.stateT >= wait && e.spawnT <= 0) {
          e.state = 'tell'; e.stateT = 0;
          ctx.audio?.play?.('charge_ping', { volume: 0.6, pitch: 1.1 + e.packIdx * 0.18 });
        }
      }
      if (d < contactRange(e)) contact(e);
    } else if (e.state === 'tell') {
      e.vel.multiplyScalar(Math.exp(-8 * dt)); integrate(e, dt, f); faceRaft(e, dt, 12);
      e.flare = Math.min(1, e.stateT / 0.35);
      if (e.stateT >= (orb.diveGap ?? 0.5) * 0.7) {
        const dx = raft.x - e.position.x, dz = raft.z - e.position.z, d = Math.hypot(dx, dz) || 1;
        e.dirX = dx / d; e.dirZ = dz / d; e.state = 'dive'; e.stateT = 0;
        // release the next sibling after diveGap
        for (let i = 0; i < active.length; i++) { const o = active[i]; if (o !== e && o.packId === e.packId && o.state === 'orbit') o.stateT = Math.min(o.stateT, (orb.time ?? 2) - (orb.diveGap ?? 0.5) * 0.3); }
      }
    } else if (e.state === 'dive') {
      const dx = raft.x - e.position.x, dz = raft.z - e.position.z, d = Math.hypot(dx, dz) || 1;
      e.dirX += (dx / d - e.dirX) * Math.min(1, dt * 1.5); e.dirZ += (dz / d - e.dirZ) * Math.min(1, dt * 1.5);
      const sp = e.speed * 2.5;
      e.vel.set(e.dirX * sp, 0, e.dirZ * sp);
      integrate(e, dt, Math.max(f, 0.75));
      e.flare = 1;
      if (d < contactRange(e)) { contact(e); return; }
      if (e.stateT > 2.6) { e.state = 'orbit'; e.stateT = 0; e.packIdx = 9; }
    } else e.state = 'approach';
  }

  function bArtillery(e, dt) {
    const art = e.def.artillery || {};
    const hold = art.hold || [13, 18];
    const f = moveFactor(e);
    const d = distRaft(e);
    const minD = Math.max(hold[0], C.lightR + 4), maxD = Math.max(hold[1], minD + 3);
    let tx, tz;
    const ang = Math.atan2(e.position.z - raft.z, e.position.x - raft.x) + e.b * dt * 0.25;
    const want = d < minD ? minD + 1 : d > maxD ? maxD - 1 : d;
    tx = raft.x + Math.cos(ang) * want; tz = raft.z + Math.sin(ang) * want;
    steerTo(e, dt, tx, tz, e.speed, { sep: 1 });
    integrate(e, dt, f);
    faceRaft(e, dt, 4);
    e.a -= dt * (f > 0 ? 1 : 0);
    if (e.a <= 0.5 && e.a + dt > 0.5) e.flare = 1;
    e.flare = Math.max(0, e.flare - dt * 1.5);
    if (e.a <= 0 && d < maxD + 6 && C.canHurtPlayer()) {
      e.a = art.every ?? 4;
      const lead = art.lead ?? 0.6;
      const pv = C.raftVel;
      lob(e, raft.x + pv.x * lead, raft.z + pv.z * lead, art);
    }
  }

  function bBulwark(e, dt) {
    const f = moveFactor(e);
    if (!e.cracked && e.hp < e.maxHp * (e.def.crackedAt ?? 0.5)) {
      e.cracked = true; e.auraTaken = e.def.auraTakenCracked ?? 0.6;
      fx.burst(e.position.x, 0.8, e.position.z, COL.glass, 14, 3, 0.12, 0.6);
      ctx.audio?.play?.('enemy_hit', { volume: 0.8, pitch: 1.6 });
    }
    const d = steerTo(e, dt, raft.x, raft.z, e.speed, { sep: 1.4 });
    integrate(e, dt, f);
    if (d < contactRange(e) && e.contactCd <= 0) {
      e.contactCd = e.def.rehit ?? 1;
      if (contact(e, { keep: true })) {
        const dx = raft.x - e.position.x, dz = raft.z - e.position.z, dd = Math.hypot(dx, dz) || 1;
        C.knockPlayer(dx / dd, dz / dd, e.def.shove ?? 3);
        fx.burst(e.position.x, 0.6, e.position.z, COL.glass, 8, 3, 0.12, 0.4);
      }
    }
  }

  function bStalk(e, dt) {
    const f = moveFactor(e);
    const d = distRaft(e);
    const oilLow = C.oilFrac < (e.def.rushBelowOil ?? 0.35) || C.eclipse > 0;
    if (oilLow && e.state !== 'rush') { e.state = 'rush'; e.stateT = 0; }
    if (e.state === 'gather') {
      const edge = C.lightR + 1.4;
      const ang = Math.atan2(e.position.z - raft.z, e.position.x - raft.x) + e.b * dt * 0.12;
      steerTo(e, dt, raft.x + Math.cos(ang) * edge, raft.z + Math.sin(ang) * edge, e.speed, { sep: 1.4 });
      integrate(e, dt, f);
      if (Math.abs(d - edge) < 2.2) e.n = 1;
      if (C.choirReady >= (e.def.gatherCount ?? 3)) { e.state = 'advance'; e.stateT = 0; }
    } else {
      const sp = e.speed * (e.state === 'rush' ? (e.def.rushMult ?? 1.6) : 1);
      steerTo(e, dt, raft.x, raft.z, sp, { sep: 1 });
      integrate(e, dt, e.state === 'rush' ? Math.max(f, 0.9) : f);
      if (d < contactRange(e)) contact(e);
      if (e.state === 'rush' && !oilLow && e.stateT > 3) { e.state = 'advance'; }
    }
  }

  // ---- Drowned Hand (elite) — stain → breach → slam → linger → (sink → stain)… → escape
  function bSlam(e, dt) {
    const tel = e.def.telegraph || {};
    const stainT = tel.stain ?? 1.4, breachT = tel.breach ?? 0.6, linger = tel.linger ?? 3;
    const R = tel.stainRadius ?? 3.2;
    e.vel.set(0, 0, 0);
    switch (e.state) {
      case 'wait':
        e.invuln = true; e.targetable = false;
        e.a -= dt;
        if (e.a <= 0) { e.state = 'stain'; e.stateT = 0; e.position.set(raft.x, 0, raft.z); e.home.copy(e.position); }
        break;
      case 'stain':
        e.invuln = true; e.targetable = false;
        if (e.stateT < 0.02) { ctx.audio?.play?.('warn', { volume: 0.7, pitch: 0.6 }); }
        if (e.stateT >= stainT) { e.state = 'breach'; e.stateT = 0; e.zaps = 0; ctx.water?.splash?.(e.position.x, e.position.z, { size: 2.2, count: 26 }); C.shake(0.12, 0.3); }
        break;
      case 'breach':
        e.invuln = false; e.targetable = true;
        if (e.stateT >= breachT) { e.state = 'slam'; e.stateT = 0; }
        break;
      case 'slam': {
        e.invuln = false; e.targetable = true;
        if (e.stateT >= 0.32 && !e.n) {
          e.n = 1; e.slams++;
          slamImpact(e, R);
        }
        if (e.stateT >= 0.55) { e.state = 'linger'; e.stateT = 0; e.n = 0; }
        break;
      }
      case 'stagger':
        e.invuln = false; e.targetable = true;
        if (e.stateT >= e.a) { e.state = 'linger'; e.stateT = 0; e.staggerMult = 1; }
        break;
      case 'linger':
        e.invuln = false; e.targetable = true;
        C.pushPlayerOut(e.position.x, e.position.z, e.radius * 0.9);
        if (e.stateT >= linger) {
          const tooLong = e.age >= (tel.maxTime ?? 16) || e.slams >= (tel.slams ?? 3);
          e.state = tooLong ? 'escape' : 'sink'; e.stateT = 0;
        }
        break;
      case 'sink':
        e.invuln = true; e.targetable = false;
        if (e.stateT >= 0.7) { e.state = 'stain'; e.stateT = 0; e.position.set(raft.x, 0, raft.z); e.home.copy(e.position); }
        break;
      case 'escape':
        e.invuln = true; e.targetable = false;
        if (e.stateT >= 1.0) { C.onEliteEscaped?.(e); despawn(e); }
        break;
      default: e.state = 'stain';
    }
  }
  function slamImpact(e, R) {
    const p = e.position;
    const d = Math.hypot(raft.x - p.x, raft.z - p.z);
    ctx.water?.splash?.(p.x, p.z, { size: 2.6, count: 34 });
    fx.ink(p.x, 0.3, p.z, 10, 2.2);
    fx.timedDecal({ x: p.x, z: p.z, r0: 1, r1: R + 2.5, life: 0.6, color: COL.paleHot, p1: 0.08, alpha: 0.9 });
    fx.timedDecal({ x: p.x, z: p.z, r0: R * 0.6, r1: R * 1.25, life: 1.2, color: COL.ink, p1: 0.4, additive: false, type: DECAL.STAIN, ease: 3, alpha: 0.85 });
    C.shake(0.42, 0.45);
    if (d <= R + 0.6 && C.canHurtPlayer()) {
      const dx = raft.x - p.x, dz = raft.z - p.z, dd = Math.hypot(dx, dz) || 1;
      const lost = C.damagePlayer(e.damage, e.enemyId, e.oilDrain * (C.diff?.drainMult ?? 1), { elite: true });
      C.knockPlayer(dd > 0.3 ? dx / dd : 1, dd > 0.3 ? dz / dd : 0, e.def.knock ?? 4);
      if (e.def.snapsLine && lost > 0) C.snapLine?.();   // a warded / i-framed slam keeps the line
      const m = e.mods;
      if (m?.tipsCreel) C.tipCreel?.(m.tipsCreel, p);
      if (m?.grip) C.gripPlayer?.(e, m.grip);
    }
    if (e.mods?.sporeCloud) addCloud(p.x, p.z, R + 1, e.mods.sporeCloud.time ?? 4, 'sporeCloud', e.mods.sporeCloud.lightMult ?? 0.8);
  }

  // ---------------------------------------------------------------- hazards: globs, slicks, clouds, floating fish
  const globs = [];     // {on, x0,z0, x1,z1, t, T, r, dmg, slick}
  const slicks = [];    // {on, x, z, r, t, T, kind, mult, seed}
  for (let i = 0; i < 16; i++) globs.push({ on: false, x0: 0, z0: 0, x1: 0, z1: 0, t: 0, T: 1, r: 2.4, art: null, src: null });
  for (let i = 0; i < 20; i++) slicks.push({ on: false, x: 0, z: 0, r: 2.4, t: 0, T: 6, kind: 'slick', mult: 0.8, seed: 0, vx: 0, vz: 0 });
  function lob(e, tx, tz, art) {
    const g = globs.find((x) => !x.on);
    if (!g) return;
    g.on = true; g.x0 = e.position.x; g.z0 = e.position.z; g.x1 = tx; g.z1 = tz; g.t = 0; g.T = art.flight ?? 1.2; g.r = art.ringRadius ?? 2.4; g.art = art; g.src = e.enemyId;
    fx.ink(e.position.x, 1.8 * e.scale, e.position.z, 3, 0.6);
  }
  function addCloud(x, z, r, T, kind, mult, vx = 0, vz = 0) {
    let s = slicks.find((q) => !q.on);
    if (!s) s = slicks[0];
    s.on = true; s.x = x; s.z = z; s.r = r; s.t = 0; s.T = T; s.kind = kind; s.mult = mult; s.seed = Math.random(); s.vx = vx; s.vz = vz;
    return s;
  }
  function updateHazards(dt) {
    for (const g of globs) {
      if (!g.on) continue;
      g.t += dt;
      const k = Math.min(1, g.t / g.T);
      // landing marker: dark ring that fills as the glob falls
      fx.decalsI.add(g.x1, g.z1, g.r, g.r, 0, DECAL.RING, COL.ink.r, COL.ink.g, COL.ink.b, 0.85, 0.16, 0.25 + 0.45 * k, 0, 0);
      fx.decalsG.add(g.x1, g.z1, g.r + 0.08, g.r + 0.08, k * 2, DECAL.DASHRING, COL.pale.r * 0.7, COL.pale.g * 0.7, COL.pale.b * 0.7, 0.45 + 0.4 * k, 0.05, 10, k * 3);
      const x = g.x0 + (g.x1 - g.x0) * k, z = g.z0 + (g.z1 - g.z0) * k, y = 1.8 + Math.sin(k * Math.PI) * 5 - k * 1.8;
      fx.orbs.add(x, y, z, 0.32, 0.38, 0.32, 0, 0.012, 0.012, 0.02);
      if (Math.random() < dt * 20) fx.smoke.emit(x, y, z, 0, -0.2, 0, 0.03, 0.03, 0.05, 0.35, 0.5, 0.7, 0.4, 2, 0);
      if (k >= 1) {
        g.on = false;
        ctx.water?.splash?.(g.x1, g.z1, { size: 1.4, count: 18, color: 0x101018 });
        fx.ink(g.x1, 0.3, g.z1, 8, 1.4);
        const art = g.art || {};
        const sl = art.slick || {};
        addCloud(g.x1, g.z1, sl.radius ?? 2.4, sl.time ?? 6, 'slick', sl.lightMult ?? 0.8);
        if (Math.hypot(raft.x - g.x1, raft.z - g.z1) <= g.r + 0.5 && C.canHurtPlayer()) C.damagePlayer(art.damage ?? 1, g.src || 'weeping_inkwell', 0, {});
      }
    }
    for (const s of slicks) {
      if (!s.on) continue;
      s.t += dt;
      if (s.t >= s.T) { s.on = false; continue; }
      if (s.vx || s.vz) {
        const dx = raft.x - s.x, dz = raft.z - s.z, d = Math.hypot(dx, dz) || 1;
        s.x += (dx / d) * s.vx * dt; s.z += (dz / d) * s.vx * dt;
      }
      const fade = Math.min(1, s.t * 3) * Math.min(1, (s.T - s.t) * 1.5);
      if (s.kind === 'slick') {
        fx.decalsI.add(s.x, s.z, s.r, s.r, s.seed * 6, DECAL.CLOUD, COL.slick.r, COL.slick.g, COL.slick.b, 0.82 * fade, 0, 0, 0, s.seed * 10);
        fx.decalsG.add(s.x, s.z, s.r * 1.02, s.r * 1.02, 0, DECAL.RING, 0.12, 0.1, 0.2, 0.35 * fade, 0.06, 0, 0, 0);
      } else {
        const c = COL.sporeCloud;
        fx.decalsI.add(s.x, s.z, s.r, s.r, s.seed * 6, DECAL.CLOUD, c.r * 0.45, c.g * 0.4, c.b * 0.45, 0.72 * fade, 0, 0, 0, s.seed * 10);
        fx.decalsG.add(s.x, s.z, s.r * 0.95, s.r * 0.95, s.seed * 3, DECAL.CLOUD, COL.spore.r * 0.5, COL.spore.g * 0.36, COL.spore.b * 0.32, 0.55 * fade, 0, 0, 0, s.seed * 20 + 3);
        fx.decalsG.add(s.x, s.z, s.r, s.r, 0, DECAL.DASHRING, COL.spore.r * 0.5, COL.spore.g * 0.4, COL.spore.b * 0.3, 0.4 * fade, 0.03, 18, s.t * 0.3);
        if (Math.random() < dt * 24) {
          const a = Math.random() * TAU, rr = Math.random() * s.r;
          fx.sparks.emit(s.x + Math.cos(a) * rr, 0.3 + Math.random(), s.z + Math.sin(a) * rr, 0, 0.35, 0, COL.spore.r, COL.spore.g, COL.spore.b, 0.12, 1.6, 0.8, 0, 0.5, 0);
        }
      }
      if (Math.hypot(raft.x - s.x, raft.z - s.z) < s.r) {
        if (s.kind === 'slick') { C.inSlick = true; C.addDim('slick', s.mult, 0.15); }
        else if (s.kind === 'veil') { C.addDim('veil', s.mult, 0.15); C.veilAura = Math.min(C.veilAura, s.mult); }
        else C.addDim('sporeCloud', s.mult, 0.15);
      }
    }
  }

  // floating fish (stolen by eels, tipped by the Undertow Grasp) — sail over to recover
  const floating = [];
  function floatFish(fish, x, z) {
    if (!fish) return;
    let visual = null;
    try { const v = ctx.models?.createFish?.(fish.speciesId, fish.weight || 1); if (v && !v.isStub && v.object3d instanceof THREE.Object3D) { visual = v; group.add(v.object3d); } } catch { /* optional */ }
    const p = new THREE.Vector3(x, 0, z);
    ctx.world?.collide?.(p, 0.6);
    floating.push({ fish, x: p.x, z: p.z, t: 0, T: 20, visual, position: p });
  }
  function updateFloating(dt, t) {
    for (let i = floating.length - 1; i >= 0; i--) {
      const f = floating[i];
      f.t += dt;
      const sink = f.t > f.T - 1.5 ? (f.t - (f.T - 1.5)) / 1.5 : 0;
      const wy = ctx.water?.getHeight?.(f.x, f.z) ?? 0;
      const pulse = 0.6 + 0.4 * Math.sin(t * 4 + i);
      fx.decalsG.add(f.x, f.z, 1.1, 1.1, 0, DECAL.RING, COL.fishGlow.r, COL.fishGlow.g, COL.fishGlow.b, (0.6 + 0.3 * pulse) * (1 - sink), 0.14, 0.15, 0, 0);
      fx.glows.add(f.x, wy + 0.25, f.z, COL.fishGlow.r, COL.fishGlow.g, COL.fishGlow.b, 1.4 * pulse, 0.6 * (1 - sink));
      if (f.visual) {
        f.visual.object3d.position.set(f.x, wy + 0.05 - sink * 0.6, f.z);
        f.visual.object3d.rotation.set(Math.PI / 2 * 0.9, t * 0.4 + i, 0);
        try { f.visual.update?.(dt, t, { swim: 0.2, flop: 0.4 }); } catch { /* ignore */ }
      }
      let done = sink >= 1;
      if (!done && C.run && Math.hypot(raft.x - f.x, raft.z - f.z) < 2.2) {
        const ok = C.recoverFish?.(f.fish, f.position);
        if (ok) done = true;
      }
      if (done) {
        if (f.visual) { try { f.visual.dispose?.(); } catch { /* ignore */ } f.visual.object3d?.parent?.remove(f.visual.object3d); }
        floating.splice(i, 1);
      }
    }
  }
  function clearFloating() {
    for (const f of floating) { if (f.visual) { try { f.visual.dispose?.(); } catch { /* ignore */ } f.visual.object3d?.parent?.remove(f.visual.object3d); } }
    floating.length = 0;
  }

  // ---------------------------------------------------------------- telegraph / status visuals
  function drawTelegraphs(e, t) {
    const p = e.position;
    if (e.behavior === 'slam') {
      const tel = e.def.telegraph || {};
      const R = tel.stainRadius ?? 3.2;
      if (e.state === 'stain') {
        const k = Math.min(1, e.stateT / (tel.stain ?? 1.4));
        const kk = 1 - Math.pow(1 - k, 2);
        fx.decalsI.add(p.x, p.z, R * 1.08, R * 1.08, e.seed * 6, DECAL.STAIN, COL.ink.r, COL.ink.g, COL.ink.b, 0.92, kk, 0, 0, e.seed * 10);
        const pulse = 0.55 + 0.45 * Math.sin(t * (10 + k * 14));
        fx.decalsG.add(p.x, p.z, R, R, 0, DECAL.RING, COL.pale.r, COL.pale.g, COL.pale.b, (0.3 + 0.45 * k) * pulse, 0.05, 0, 0, 0);
        fx.decalsG.add(p.x, p.z, R * (1.6 - 0.6 * k), R * (1.6 - 0.6 * k), t, DECAL.DASHRING, COL.pale.r, COL.pale.g, COL.pale.b, 0.5 * k, 0.04, 14, t * 2);
        if (Math.random() < 0.3) ctx.water?.addRipple?.(p.x + (Math.random() - 0.5) * R, p.z + (Math.random() - 0.5) * R, 0.4);
      } else if (e.state === 'breach' || e.state === 'slam') {
        fx.decalsI.add(p.x, p.z, R * 1.08, R * 1.08, e.seed * 6, DECAL.STAIN, COL.ink.r, COL.ink.g, COL.ink.b, 0.9, 1, 0, 0, e.seed * 10);
        const pulse = 0.6 + 0.4 * Math.sin(t * 30);
        fx.decalsG.add(p.x, p.z, R, R, 0, DECAL.RING, COL.pale.r, COL.pale.g, COL.pale.b, 0.85 * pulse, 0.06, 0, 0, 0);
      } else if (e.state === 'linger' || e.state === 'stagger') {
        const fade = e.state === 'linger' ? Math.max(0, 1 - e.stateT / 1.2) : 1;
        fx.decalsI.add(p.x, p.z, R * 0.9, R * 0.9, e.seed * 6, DECAL.STAIN, COL.ink.r, COL.ink.g, COL.ink.b, 0.6 * fade, 0.8, 0, 0, e.seed * 10);
        if (e.state === 'stagger') {
          for (let i = 0; i < 3; i++) {
            const a = t * 3 + i * TAU / 3;
            fx.glows.add(p.x + Math.cos(a) * 1.3, 3.4 * e.scale + Math.sin(t * 5 + i) * 0.2, p.z + Math.sin(a) * 1.3, COL.gold.r, COL.gold.g, COL.gold.b, 0.6, 0.9);
          }
        }
      }
      return;
    }
    if (e.behavior === 'leap') {
      if (e.state === 'surface') {
        const tel = e.def.telegraph || {};
        const k = Math.min(1, e.stateT / (tel.surface ?? 1));
        tmpC.set(e.eye).multiplyScalar(2);
        fx.decalsG.add(p.x, p.z, 2.6 - 1.9 * k, 2.6 - 1.9 * k, 0, DECAL.RING, tmpC.r, tmpC.g, tmpC.b, 0.5 + 0.5 * k, 0.12, 0.1, 0, 0);
        // leap lane through the raft
        const dx = raft.x - p.x, dz = raft.z - p.z, d = Math.hypot(dx, dz) || 1;
        const span = Math.max(6, d * 2);
        const cx = p.x + dx / d * span * 0.5, cz = p.z + dz / d * span * 0.5;
        const rot = Math.atan2(-dx, -dz);
        fx.decalsI.add(cx, cz, 0.9, span * 0.5, rot, DECAL.RECT, COL.ink.r, COL.ink.g, COL.ink.b, 0.35 + 0.35 * k, k, 0, 0, 0);
        fx.decalsG.add(cx, cz, 0.75, span * 0.5, rot, DECAL.RECT, tmpC.r * 0.35, tmpC.g * 0.35, tmpC.b * 0.35, 0.4 * k, k, 0, 0, 0);
      } else if (e.submerged) {
        fx.decalsI.add(p.x, p.z, 0.45, 1.3, e.yaw, DECAL.CLOUD, COL.ink.r, COL.ink.g, COL.ink.b, 0.5, 0, 0, 0, e.seed * 9);
      }
      return;
    }
  }

  // eyes / burn / status sparkle drawn into the glow layer
  function drawStatus(e, t, hy) {
    const p = e.position;
    const y = hy + (e.y || 0);
    if (e.flare > 0.05 && (e.behavior === 'chase' || e.behavior === 'orbitDive' || e.behavior === 'leap' || e.behavior === 'artillery')) {
      tmpC.set(e.eye);
      const s = (0.55 + 0.6 * e.flare) * e.scale;
      fx.glows.add(p.x, y + 0.12 * e.scale, p.z, tmpC.r * 2.5 + 1, tmpC.g * 2.5 + 1, tmpC.b * 2.5 + 1, s * 1.4, 0.35 + 0.55 * e.flare);
    }
    if (e.behavior === 'stalk' && !e.inLight && !(e.revealT > 0)) {
      // only gold pinprick eyes show in the dark
      const fy = Math.cos(e.yaw), fxv = Math.sin(e.yaw);
      const ex = -fxv * 0.3, ez = -fy * 0.3, px = fy * 0.11, pz = -fxv * 0.11;
      fx.glows.add(p.x + ex + px, y + 0.25, p.z + ez + pz, COL.gold.r, COL.gold.g, COL.gold.b, 0.35, 0.95);
      fx.glows.add(p.x + ex - px, y + 0.25, p.z + ez - pz, COL.gold.r, COL.gold.g, COL.gold.b, 0.35, 0.95);
    }
    if (e.burnT > 0 && Math.random() < 0.35) fx.sparks.emit(p.x + (Math.random() - 0.5) * e.radius, y + Math.random() * 0.4, p.z + (Math.random() - 0.5) * e.radius, 0, 1.2, 0, COL.ember.r, COL.ember.g, COL.ember.b, 0.14, 0.5, 1, -0.1, 1, 0.5);
    if (e.chargeT > 0 && Math.random() < 0.25) {
      const a = Math.random() * TAU;
      fx.sparks.emit(p.x + Math.cos(a) * 0.4, y + 0.2, p.z + Math.sin(a) * 0.4, 0, 0.6, 0, 1.2, 1.8, 3.2, 0.12, 0.25, 1, 0, 1, 0);
    }
    if (e.chillT > 0 && Math.random() < 0.15) fx.sparks.emit(p.x, y + 0.4, p.z, (Math.random() - 0.5), 0.2, (Math.random() - 0.5), 0.8, 1.1, 1.5, 0.1, 0.6, 0.8, 0, 1, -0.5);
    if (e.behavior === 'bulwark') {
      // glass bell-jar glint
      const gl = e.cracked ? 0.35 : 0.7;
      fx.glows.add(p.x, 1.2 * e.scale * 0.9, p.z, COL.glass.r * 0.5, COL.glass.g * 0.5, COL.glass.b * 0.5, 1.6 * e.scale * 0.6, 0.18 * gl);
      fx.glows.add(p.x - 0.25, 1.35 * e.scale * 0.8, p.z + 0.2, COL.glass.r, COL.glass.g, COL.glass.b, 0.25, 0.8 * gl);
    }
  }

  // ---------------------------------------------------------------- update + render
  const pos = new THREE.Vector3();
  function update(dt, t) {
    C.choirReady = 0;
    for (let i = 0; i < active.length; i++) { const e = active[i]; if (e.behavior === 'stalk' && e.state === 'gather' && e.n) C.choirReady++; }
    buildGrid();
    aggregatePacks();
    const leash = C.B?.combat?.leash || { dist: 40, time: 4 };
    for (let i = 0; i < active.length; i++) {
      const e = active[i];
      separation(e, i);
    }
    for (let i = active.length - 1; i >= 0; i--) {
      const e = active[i];
      if (!e || !e.alive) continue;
      e.age += dt; e.stateT += dt;
      if (e.spawnT > 0) e.spawnT = Math.max(0, e.spawnT - dt);
      e.stun = Math.max(0, e.stun - dt); e.rootT = Math.max(0, e.rootT - dt);
      if (e.slowT > 0) { e.slowT -= dt; if (e.slowT <= 0) e.slowK = 0; }
      e.chillT = Math.max(0, e.chillT - dt); e.chargeT = Math.max(0, e.chargeT - dt);
      e.contactCd = Math.max(0, e.contactCd - dt); e.cdRam = Math.max(0, e.cdRam - dt);
      e.hurt = Math.max(0, e.hurt - dt * 5);
      if (e.staggerT > 0) { e.staggerT -= dt; if (e.staggerT <= 0) e.staggerMult = 1; }
      if (e.behavior !== 'chase' && e.behavior !== 'orbitDive' && e.behavior !== 'leap') e.flare = Math.max(0, e.flare - dt * 2);
      const dR = distRaft(e);
      e.inLight = !C.lanternOut && dR <= C.lightR + e.radius * 0.5 && !e.submerged;
      // burn DoT (ignite / scorch)
      if (e.burnT > 0) {
        e.burnT -= dt;
        if (!e.invuln && !e.submerged) { e.hp -= e.burnDps * dt * (e.chillT > 0 ? 1 + C.chillVuln : 1); if (e.hp <= 0) { kill(e, 'burn'); continue; } }
      }
      switch (e.behavior) {
        case 'chase': bChase(e, dt); break;
        case 'pack': bPack(e, dt); break;
        case 'latch': bLatch(e, dt); break;
        case 'leap': bLeap(e, dt); break;
        case 'orbitDive': bOrbitDive(e, dt); break;
        case 'artillery': bArtillery(e, dt); break;
        case 'bulwark': bBulwark(e, dt); break;
        case 'stalk': bStalk(e, dt); break;
        case 'slam': bSlam(e, dt); break;
        case 'warden': C.warden?.update(e, dt, t); break;
        default: bChase(e, dt);
      }
      if (!e.alive) continue;
      // leash: stragglers far from the raft are moved back onto the spawn ring
      if (!e.elite && !e.boss && e.behavior !== 'latch') {
        if (dR > leash.dist) { e.leashT += dt; if (e.leashT > leash.time) { e.leashT = 0; C.placeOnRing?.(e.position, e.def.waterBound, e.def.depthMin); e.vel.set(0, 0, 0); } }
        else e.leashT = 0;
      }
      if (!Number.isFinite(e.position.x) || !Number.isFinite(e.position.z)) { e.position.set(raft.x + 20, 0, raft.z); e.vel.set(0, 0, 0); e.knock.set(0, 0, 0); }
    }
    updateHazards(dt);
    updateFloating(dt, t);
  }

  function render(dt, t) {
    for (const k of SWARM_KINDS) swarmCount[k] = 0;
    const draw = (e, fade) => {
      const hover = (MODEL_HOVER[e.kind] ?? 0.5) * e.scale;
      if (e.creature) {
        const o = e.creature.object3d;
        const wy = ctx.water?.getHeight?.(e.position.x, e.position.z) ?? 0;
        o.position.set(e.position.x, wy + (e.y || 0), e.position.z);
        o.rotation.y = e.yaw + Math.PI;  // creatures face +Z; yaw uses the heading convention
        const st = creatureState(e);
        try { e.creature.update?.(dt, t, st); } catch (err) { C.report('creature.update', err); }
        if (e.alive) drawTelegraphs(e, t);
        if (e.alive) drawStatus(e, t, hover);
        return;
      }
      const sw = swarms[e.kind];
      if (!sw) return;
      const i = swarmCount[e.kind];
      if (i >= sw.max) return;
      swarmCount[e.kind] = i + 1;
      pos.set(e.position.x, e.y || 0, e.position.z);
      let scale = e.scale;
      if (e.alive && e.spawnT > 0) { const sk = e.spawnT / 0.6; scale *= 1 - 0.65 * sk * sk; pos.y -= 0.7 * sk; }
      if (e.behavior === 'chase' && e.state === 'tell') scale *= 1 + 0.18 * e.flare;
      if (!e.alive) pos.y += e.dieT * 0.8;
      let hurt = e.hurt;
      let f = fade;
      if (e.behavior === 'stalk' && !e.inLight && !(e.revealT > 0) && e.alive) f = Math.max(f, 0.86);
      if (e.behavior === 'leap' && e.submerged) f = Math.max(f, 0.35);
      sw.set(i, pos, e.yaw, scale, hurt, f, e.phase);
      // eye colour: flare toward white before a lunge / dive / leap
      let eye = e.eye;
      if (e.flare > 0.5 && e.behavior !== 'latch') eye = 0xffffff;
      if (e.chillT > 0) eye = 0xbfe6ff;
      sw.setTint?.(i, e.tint, eye);
      if (e.alive) { drawTelegraphs(e, t); drawStatus(e, t, hover); }
    };
    for (let i = 0; i < active.length; i++) { const e = active[i]; draw(e, e.spawnT > 0 ? (e.spawnT / 0.6) * 0.3 : 0); }
    for (let i = dying.length - 1; i >= 0; i--) {
      const e = dying[i];
      e.dieT += dt;
      e.hurt = Math.max(0, e.hurt - dt * 6);
      const k = Math.min(1, e.dieT / e.dieDur);
      draw(e, k);
      if (k >= 1) { dying.splice(i, 1); release(e); }
    }
    for (const k of SWARM_KINDS) { const sw = swarms[k]; if (sw) { sw.setCount(swarmCount[k]); } }
  }
  const stateOut = { state: 'idle', k: 0 };
  function creatureState(e) {
    const o = stateOut;
    o.k = undefined;
    if (!e.alive) { o.state = 'die'; o.k = Math.min(1, e.dieT / e.dieDur); return o; }
    if (e.behavior === 'slam') {
      const tel = e.def.telegraph || {};
      switch (e.state) {
        case 'wait': case 'stain': o.state = 'move'; o.k = 0; e.y = -0.3; break;
        case 'breach': o.state = 'move'; o.k = Math.min(1, e.stateT / (tel.breach ?? 0.6)); e.y = 0; break;
        case 'slam': o.state = 'attack'; o.k = 0.35 + Math.min(1, e.stateT / 0.55) * 0.65; break;
        case 'linger': o.state = e.hurt > 0.6 ? 'hurt' : 'idle'; break;
        case 'stagger': o.state = 'hurt'; break;
        case 'sink': case 'escape': o.state = 'move'; o.k = 1 - Math.min(1, e.stateT / 0.7); break;
        default: o.state = 'idle';
      }
      return o;
    }
    if (e.warden) return C.warden?.creatureState(e, o) || o;
    o.state = e.hurt > 0.7 ? 'hurt' : 'move';
    return o;
  }

  function clear() {
    for (const e of active) release(e);
    active.length = 0;
    for (const e of dying) release(e);
    dying.length = 0;
    for (const g of globs) g.on = false;
    for (const s of slicks) s.on = false;
    clearFloating();
    for (const k of SWARM_KINDS) swarms[k]?.setCount(0);
  }

  // ---------------------------------------------------------------- queries
  function nearest(x, z, maxR, filter, exclude) {
    let best = null, bd = maxR * maxR;
    for (let i = 0; i < active.length; i++) {
      const e = active[i];
      if (!e.alive || !e.targetable || e.invuln || e === exclude) continue;
      if (filter && !filter(e)) continue;
      const dx = e.position.x - x, dz = e.position.z - z, d2 = dx * dx + dz * dz;
      if (d2 < bd) { bd = d2; best = e; }
    }
    return best;
  }
  /** Centre of the densest cluster (most enemies within r) among targetable enemies within range of (x,z). */
  const dens = new THREE.Vector3();
  function densest(x, z, range, r = 3.5) {
    let best = -1, bx = 0, bz = 0;
    const n = active.length;
    const step = n > 60 ? 2 : 1;
    for (let i = 0; i < n; i += step) {
      const e = active[i];
      if (!e.targetable || e.invuln) continue;
      const dx = e.position.x - x, dz = e.position.z - z;
      if (dx * dx + dz * dz > range * range) continue;
      let c = 0, sx = 0, sz = 0;
      for (let j = 0; j < n; j++) {
        const o = active[j];
        if (!o.targetable) continue;
        const ox = o.position.x - e.position.x, oz = o.position.z - e.position.z;
        if (ox * ox + oz * oz < r * r) { c++; sx += o.position.x; sz += o.position.z; }
      }
      if (c > best) { best = c; bx = sx / c; bz = sz / c; }
    }
    if (best < 0) return null;
    return dens.set(bx, 0, bz);
  }

  return {
    group, active, dying, swarms, floating, spawn, kill, despawn, update, render, clear, nearest, densest,
    addCloud, floatFish, clearFloating, ensureSwarms, nextPack: () => packSeq++, MODEL_HOVER, COL,
    hazards: { globs, slicks },
  };
}
