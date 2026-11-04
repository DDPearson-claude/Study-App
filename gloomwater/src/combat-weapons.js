// combat-weapons.js — boon weapons (DESIGN §10.3–10.4): orbit · motes · trail · hook · spark ·
// bell · nova · mines · vortex · beam, each with its Kindle (level 6) and toon/glow VFX.
// Parameters come straight from data BOONS[].levels / kindle.params; damage × damageMult and
// rolls critChance (in C.hitEnemy); cooldowns × cooldownMult. Helper of combat.js.
import * as THREE from 'three';
import { DECAL, lin } from './combat-fx.js';
import { toonMaterial, addOutline, INK } from './toon.js';

const TAU = Math.PI * 2;
const COL = {
  coal: lin(0xff8a2a, 2.6), coalCore: lin(0xffd08a, 1.9), coalHalo: lin(0xff7a20, 1.6), halo: lin(0xffc070, 3.4),
  mote: lin(0xfff0c8, 2.0), moteHalo: lin(0xffd890, 1.4), moth: lin(0xffe7a0, 2), flame: lin(0xff9a3a, 1.9), flameHot: lin(0xffc870, 2.6),
  thread: lin(0xffd27a, 2.2), hook: lin(0xf4efe2, 3), spark: lin(0xbfe4ff, 3.4), sparkGlow: lin(0x8fc8ff, 2.2),
  frost: lin(0xcfe8ff, 1.8), frostHot: lin(0xe8f6ff, 2.6), pulse: lin(0xffb860, 2.2), pulseHot: lin(0xffe0a8, 2.8),
  mine: lin(0xff7a30, 3.2), blast: lin(0xffa040, 2.8), vortex: lin(0x6ff5e0, 1.4), vortexHot: lin(0xb8fff0, 2.2),
  beam: lin(0xfff2d0, 2.4), beamCore: lin(0xffffff, 3.4), line: lin(0xffb050, 2.4), ink: lin(0x040508, 1),
};

function outlineInstanced(geo, max, thickness, im) {
  const mat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide, fog: true });
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\ntransformed += normalize(normal) * ${thickness.toFixed(4)};`);
  };
  mat.customProgramCacheKey = () => 'gwCombatOutline' + thickness;
  const m = new THREE.InstancedMesh(geo, mat, max);
  m.instanceMatrix = im; m.frustumCulled = false; m.count = 0; m.renderOrder = -1;
  return m;
}

export function createWeapons(C) {
  const { ctx, fx } = C;
  const raft = C.raft;
  const group = new THREE.Group(); group.name = 'combat:weapons';
  C.group.add(group);
  const list = [];                 // owned weapon instances
  let activeK = 0;                 // fades combat-only visuals in at dusk/night or when enemies are near
  let spinBoostT = 0;              // Great Lantern spin-on-hurt

  // ---------------------------------------------------------------- shared meshes
  // bell (Tolling Bell / Requiem)
  const bellGeo = new THREE.LatheGeometry([
    new THREE.Vector2(0.0, 0.42), new THREE.Vector2(0.07, 0.42), new THREE.Vector2(0.11, 0.36), new THREE.Vector2(0.15, 0.2),
    new THREE.Vector2(0.18, 0.06), new THREE.Vector2(0.25, -0.04), new THREE.Vector2(0.27, -0.08), new THREE.Vector2(0.0, -0.08),
  ], 14);
  const bellMat = toonMaterial({ color: 0x6b5236, emissive: 0x2a1a08, rim: 0.5, rimColor: 0xcfe8ff });
  const bell = new THREE.Mesh(bellGeo, bellMat);
  addOutline(bell, { thickness: 0.018 });
  bell.visible = false; group.add(bell);
  let bellSwing = 0;
  // hooks
  const hookGeo = new THREE.TorusGeometry(0.16, 0.035, 6, 14, Math.PI * 1.25);
  const hookMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xf4efe2).multiplyScalar(1.6), toneMapped: false, fog: true });
  const hookMeshes = [];
  for (let i = 0; i < 4; i++) { const h = new THREE.Mesh(hookGeo, hookMat); h.visible = false; group.add(h); hookMeshes.push(h); }
  // floats (mines): cork bobbers with a coal cap
  const floatGeo = new THREE.SphereGeometry(0.24, 12, 9);
  {
    const p = floatGeo.attributes.position, cols = new Float32Array(p.count * 3), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      c.set(y > 0.06 ? 0xd9cdb0 : y > -0.02 ? 0x2a1610 : 0x7a2418);
      cols.set([c.r, c.g, c.b], i * 3);
    }
    floatGeo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    floatGeo.scale(1, 0.8, 1);
  }
  const FLOAT_MAX = 12;
  const floatMesh = new THREE.InstancedMesh(floatGeo, toonMaterial({ color: 0xffffff, vertexColors: true, rim: 0.45 }), FLOAT_MAX);
  floatMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  floatMesh.frustumCulled = false; floatMesh.count = 0;
  const floatOutline = outlineInstanced(floatGeo, FLOAT_MAX, 0.035, floatMesh.instanceMatrix);
  group.add(floatMesh, floatOutline);
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s4 = new THREE.Vector3(), p4 = new THREE.Vector3(), e4 = new THREE.Euler();

  // ---------------------------------------------------------------- pools
  const motes = [];
  for (let i = 0; i < 48; i++) motes.push({ on: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, target: null, life: 0, pierce: 0, hit0: 0, hit1: 0, hit2: 0, dmg: 0, speed: 9, range: 16, reseek: false, moth: false, w: null, trailT: 0 });
  const segs = [];
  for (let i = 0; i < 90; i++) segs.push({ on: false, x: 0, z: 0, t: 0, life: 1, w: 1, seed: 0, hot: false });
  let segCursor = 0;
  const hooks = [];
  for (let i = 0; i < 4; i++) hooks.push({ on: false, x: 0, y: 1, z: 0, target: null, bounces: 0, phase: 'out', hits: [], back: [], life: 0, w: null, mesh: hookMeshes[i], spin: 0, last: null });
  const floats = [];
  for (let i = 0; i < FLOAT_MAX; i++) floats.push({ on: false, x: 0, z: 0, fx0: 0, fz0: 0, fx1: 0, fz1: 0, fly: 0, t: 0, w: null, seed: 0 });
  const vortices = [];
  for (let i = 0; i < 4; i++) vortices.push({ on: false, x: 0, z: 0, t: 0, T: 3, R: 3, pull: 3, dps: 6, tick: 0, w: null, endFlare: false, seed: 0 });

  // ---------------------------------------------------------------- params
  function paramsFor(boon, level) {
    if (level >= 6 && boon.kindle?.params) return boon.kindle.params;
    const lv = boon.levels || [];
    return lv[Math.max(0, Math.min(lv.length - 1, level - 1))] || {};
  }
  function sync() {
    const run = C.run;
    const boons = run?.boons || {};
    const BY = ctx.data.BOON_BY_ID || {};
    // remove weapons no longer owned
    for (let i = list.length - 1; i >= 0; i--) if (!boons[list[i].id]) list.splice(i, 1);
    for (const [id, lvl] of Object.entries(boons)) {
      const b = BY[id];
      if (!b || b.kind !== 'weapon' || !(lvl > 0)) continue;
      let w = list.find((x) => x.id === id);
      if (!w) { w = { id, boon: b, type: b.weapon, level: 0, p: null, t: 0.6 + Math.random() * 0.6, a: Math.random() * TAU, n: 0, tick: 0, kindle: false }; list.push(w); }
      w.level = lvl; w.p = paramsFor(b, lvl); w.kindle = lvl >= 6;
    }
    C.chillVuln = 0;
    for (const w of list) if (w.type === 'bell' && w.p.chillVuln) C.chillVuln = w.p.chillVuln;
  }
  const cd = (w, base) => Math.max(0.15, (base || 1) * (C.stats.cooldownMult ?? 1));
  const dmg = (base) => (base || 0) * (C.stats.damageMult ?? 1);
  const targets = C.enemies;

  // ---------------------------------------------------------------- ORBIT
  function wOrbit(w, dt, t) {
    const p = w.p;
    const n = p.count || 2;
    const R = p.radiusLightMult ? Math.max(2.5, p.radiusLightMult * C.lightR) : (p.radius || 2.8);
    w.a += (p.spin || 2.4) * dt;
    const k = 0.35 + 0.65 * activeK;
    const halo = w.kindle;
    for (let i = 0; i < n; i++) {
      const a = w.a + (i / n) * TAU;
      const x = raft.x + Math.cos(a) * R, z = raft.z + Math.sin(a) * R, y = 0.9 + Math.sin(t * 3 + i) * 0.12;
      const c = halo ? COL.halo : COL.coal;
      fx.orbs.add(x, y, z, 0.17, 0.17, 0.17, a, COL.coalCore.r * k, COL.coalCore.g * k, COL.coalCore.b * k);
      fx.glows.add(x, y, z, c.r, c.g, c.b, (halo ? 1.6 : 1.15), 0.75 * k);
      if (activeK > 0.2 && Math.random() < dt * 30) {
        fx.sparks.emit(x, y, z, -Math.sin(a) * 0.6, 0.4, Math.cos(a) * 0.6, COL.coal.r, COL.coal.g * 0.8, COL.coal.b * 0.6, 0.13, 0.45, 0.9, -0.15, 2, 0.4);
      }
      if (activeK < 0.05) continue;
      for (let j = 0; j < targets.length; j++) {
        const e = targets[j];
        if (!e.targetable || e.invuln || e.cdOrbit > 0) continue;
        const dx = e.position.x - x, dz = e.position.z - z;
        const rr = 0.55 + e.radius;
        if (dx * dx + dz * dz > rr * rr) continue;
        e.cdOrbit = p.hitCooldown || 0.6;
        const ox = e.position.x - raft.x, oz = e.position.z - raft.z, od = Math.hypot(ox, oz) || 1;
        C.hitEnemy(e, dmg(p.damage), { knockX: ox / od, knockZ: oz / od, knock: 0.7, source: w.id });
        if (p.burnDps) { e.burnT = Math.max(e.burnT, p.burnTime || 2); e.burnDps = Math.max(e.burnDps, dmg(p.burnDps)); }
        fx.burst(x, y, z, COL.coal, 5, 2.5, 0.12, 0.35);
      }
    }
    if (activeK > 0.05) fx.decalsG.add(raft.x, raft.z, R, R, 0, DECAL.DASHRING, COL.coalHalo.r, COL.coalHalo.g, COL.coalHalo.b, 0.18 * activeK * (halo ? 1.6 : 1), 0.035, n * 3, -w.a);
  }

  // ---------------------------------------------------------------- MOTES
  function launchMote(w, i, n) {
    const m = motes.find((x) => !x.on);
    if (!m) return;
    const L = C.lantern, p = w.p;
    const a = Math.random() * TAU;
    m.on = true; m.x = L.x; m.y = L.y + 0.2; m.z = L.z;
    const s = (p.speed || 9) * 0.55;
    m.vx = Math.cos(a) * s; m.vz = Math.sin(a) * s; m.vy = 3 + Math.random() * 1.5;
    m.target = null; m.life = 3.2; m.pierce = p.pierce || 0; m.hit0 = m.hit1 = m.hit2 = 0;
    m.dmg = p.damage; m.speed = p.speed || 9; m.range = p.range || 16; m.reseek = !!p.reseek; m.moth = w.kindle; m.w = w; m.trailT = 0;
  }
  function wMotes(w, dt) {
    const p = w.p;
    w.t -= dt;
    if (w.t <= 0) {
      if (C.enemiesSys.nearest(raft.x, raft.z, p.range || 16)) {
        w.t = cd(w, p.cooldown || 1.5);
        const n = p.count || 2;
        for (let i = 0; i < n; i++) launchMote(w, i, n);
      } else w.t = 0.25;
    }
  }
  function updateMotes(dt, t) {
    for (const m of motes) {
      if (!m.on) continue;
      m.life -= dt;
      if (m.life <= 0) { m.on = false; continue; }
      if (!m.target || !m.target.alive || !m.target.targetable) {
        m.target = C.enemiesSys.nearest(m.x, m.z, m.range, (e) => e.id !== m.hit0 && e.id !== m.hit1 && e.id !== m.hit2);
      }
      const tgt = m.target;
      if (tgt) {
        const ty = 0.7 + (tgt.y || 0);
        const dx = tgt.position.x - m.x, dy = ty - m.y, dz = tgt.position.z - m.z;
        const d = Math.hypot(dx, dy, dz) || 1;
        const turn = Math.min(1, dt * 7);
        m.vx += (dx / d * m.speed - m.vx) * turn; m.vy += (dy / d * m.speed - m.vy) * turn; m.vz += (dz / d * m.speed - m.vz) * turn;
        if (d < 0.45 + tgt.radius) {
          C.hitEnemy(tgt, dmg(m.dmg), { knockX: m.vx / m.speed, knockZ: m.vz / m.speed, knock: 0.5, source: m.w?.id });
          fx.burst(m.x, m.y, m.z, COL.mote, 6, 2.6, 0.12, 0.35, 1, -2);
          m.hit2 = m.hit1; m.hit1 = m.hit0; m.hit0 = tgt.id;
          if (m.pierce > 0) { m.pierce--; m.target = null; }
          else { m.on = false; continue; }
        }
      } else { m.vy -= 6 * dt; if (m.y < 0.2) { m.on = false; continue; } }
      m.x += m.vx * dt; m.y += m.vy * dt; m.z += m.vz * dt;
      if (m.y < 0.25) { m.y = 0.25; m.vy = Math.abs(m.vy) * 0.3; }
      const c = m.moth ? COL.moth : COL.mote;
      fx.orbs.add(m.x, m.y, m.z, 0.09, 0.09, 0.09, 0, c.r, c.g, c.b);
      fx.glows.add(m.x, m.y, m.z, COL.moteHalo.r, COL.moteHalo.g, COL.moteHalo.b, m.moth ? 1.0 : 0.75, 0.85);
      if (m.moth) {
        const fl = Math.abs(Math.sin(t * 28 + m.x)) * 0.32;
        const vl = Math.hypot(m.vx, m.vz) || 1, sx = -m.vz / vl, sz = m.vx / vl;
        fx.glows.add(m.x + sx * fl, m.y + 0.05, m.z + sz * fl, c.r * 0.6, c.g * 0.6, c.b * 0.4, 0.45, 0.6);
        fx.glows.add(m.x - sx * fl, m.y + 0.05, m.z - sz * fl, c.r * 0.6, c.g * 0.6, c.b * 0.4, 0.45, 0.6);
      }
      m.trailT -= dt;
      if (m.trailT <= 0) { m.trailT = 0.025; fx.sparks.emit(m.x, m.y, m.z, 0, 0.1, 0, c.r * 0.7, c.g * 0.6, c.b * 0.4, 0.14, 0.32, 0.7, -0.3, 2, 0); }
    }
  }

  // ---------------------------------------------------------------- TRAIL
  let lastSegX = 0, lastSegZ = 0;
  function wTrail(w, dt) {
    const p = w.p;
    const minSpeed = p.minSpeed ?? 1.5;
    if (C.raftSpeed >= minSpeed && activeK > 0.3) {
      const dx = raft.x - lastSegX, dz = raft.z - lastSegZ;
      if (dx * dx + dz * dz > 0.42) {
        lastSegX = raft.x; lastSegZ = raft.z;
        const s = segs[segCursor]; segCursor = (segCursor + 1) % segs.length;
        const fwd = C.raftVel, sp = Math.max(0.1, C.raftSpeed);
        s.on = true; s.x = raft.x - fwd.x / sp * 1.3; s.z = raft.z - fwd.z / sp * 1.3; s.t = 0; s.life = p.life || 2.5; s.w = p.width || 1.4; s.seed = Math.random(); s.hot = w.kindle;
        s.dps = p.dps || 5; s.ign = p.igniteTime || 2; s.src = w.id;
      }
    } else { lastSegX = raft.x + 99; }
  }
  function updateSegs(dt, t) {
    let tick = false;
    trailTick -= dt;
    if (trailTick <= 0) { trailTick = 0.1; tick = true; }
    for (const s of segs) {
      if (!s.on) continue;
      s.t += dt;
      if (s.t >= s.life) { s.on = false; continue; }
      const k = s.t / s.life;
      const fade = Math.min(1, s.t * 8) * (1 - k * k);
      const r = s.w * (0.65 + 0.15 * Math.sin(t * 9 + s.seed * 20));
      const c = s.hot ? COL.flameHot : COL.flame;
      fx.decalsG.add(s.x, s.z, r, r, s.seed * TAU, DECAL.FLAME, c.r, c.g, c.b, 0.95 * fade, 0, 0, 0, s.seed * 30);
      if (Math.random() < dt * 9 * fade) {
        fx.sparks.emit(s.x + (Math.random() - 0.5) * s.w, 0.25, s.z + (Math.random() - 0.5) * s.w, (Math.random() - 0.5) * 0.4, 1.4 + Math.random(), (Math.random() - 0.5) * 0.4, c.r, c.g * 0.85, c.b * 0.6, 0.16, 0.6, 1, -0.15, 1.2, 0.5);
      }
      if (tick) {
        const rr = s.w * 0.62;
        for (let j = 0; j < targets.length; j++) {
          const e = targets[j];
          if (!e.targetable || e.invuln || e.cdTrail > 0) continue;
          const dx = e.position.x - s.x, dz = e.position.z - s.z, m = rr + e.radius * 0.6;
          if (dx * dx + dz * dz > m * m) continue;
          e.cdTrail = 0.099;
          C.hitEnemy(e, dmg(s.dps) * 0.1, { aura: true, source: s.src });
          e.burnT = Math.max(e.burnT, s.ign); e.burnDps = Math.max(e.burnDps, dmg(s.dps) * 0.4);
        }
      }
    }
  }
  let trailTick = 0;

  // ---------------------------------------------------------------- HOOK
  function wHook(w, dt) {
    const p = w.p;
    w.t -= dt;
    if (w.t > 0) return;
    const tgt = C.enemiesSys.nearest(raft.x, raft.z, 15);
    if (!tgt) { w.t = 0.25; return; }
    const h = hooks.find((x) => !x.on);
    if (!h) { w.t = 0.2; return; }
    w.t = cd(w, p.cooldown || 2.2);
    const L = C.lantern;
    h.on = true; h.x = L.x; h.y = L.y; h.z = L.z; h.target = tgt; h.bounces = p.bounces ?? 3; h.phase = 'out';
    h.hits.length = 0; h.back.length = 0; h.life = 4.5; h.w = w; h.last = null; h.spin = 0;
    ctx.audio?.play?.('cast_whoosh', { volume: 0.35, pitch: 1.5 });
  }
  function updateHooks(dt, t) {
    const L = C.lantern;
    for (const h of hooks) {
      if (!h.on) { h.mesh.visible = false; continue; }
      const p = h.w?.p || {};
      h.life -= dt;
      const sp = p.speed || 18;
      let tx, ty, tz;
      if (h.phase === 'out') {
        if (!h.target || !h.target.alive || !h.target.targetable) {
          h.target = C.enemiesSys.nearest(h.x, h.z, p.bounceRange || 7, (e) => !h.hits.includes(e.id));
          if (!h.target) h.phase = 'back';
        }
      }
      if (h.phase === 'out' && h.target) { tx = h.target.position.x; ty = 0.7 + (h.target.y || 0); tz = h.target.position.z; }
      else { tx = L.x; ty = L.y; tz = L.z; }
      const dx = tx - h.x, dy = ty - h.y, dz = tz - h.z, d = Math.hypot(dx, dy, dz) || 1;
      const step = Math.min(d, sp * dt);
      h.x += dx / d * step; h.y += dy / d * step; h.z += dz / d * step;
      h.spin += dt * 18;
      if (h.phase === 'out' && h.target && d < 0.5 + h.target.radius) {
        const e = h.target;
        const crit = Math.random() < (C.stats.critChance ?? 0) ? (p.critMult || 2) : 1;
        C.hitEnemy(e, dmg(p.damage) * crit, { crit: crit > 1, noCritRoll: true, knockX: dx / d, knockZ: dz / d, knock: 0.8, source: h.w?.id });
        fx.burst(h.x, h.y, h.z, COL.thread, 7, 3, 0.12, 0.35);
        h.hits.push(e.id); h.last = e;
        if (h.bounces > 0) { h.bounces--; h.target = C.enemiesSys.nearest(h.x, h.z, p.bounceRange || 7, (o) => !h.hits.includes(o.id)); if (!h.target) h.phase = 'back'; }
        else h.phase = 'back';
        if (h.phase === 'back' && p.pull && h.last?.alive && !h.last.boss && !h.last.elite) {
          const ox = raft.x - h.last.position.x, oz = raft.z - h.last.position.z, od = Math.hypot(ox, oz) || 1;
          C.knockEnemy(h.last, ox / od, oz / od, Math.min(p.pull, Math.max(0, od - 2)));
        }
      } else if (h.phase === 'back') {
        if (p.returns) {
          for (let j = 0; j < targets.length; j++) {
            const e = targets[j];
            if (!e.targetable || e.invuln || h.back.includes(e.id)) continue;
            const ex = e.position.x - h.x, ez = e.position.z - h.z, m = 0.6 + e.radius;
            if (ex * ex + ez * ez < m * m) { h.back.push(e.id); C.hitEnemy(e, dmg(p.damage) * 0.75, { source: h.w?.id }); fx.burst(h.x, h.y, h.z, COL.thread, 4, 2, 0.1, 0.3); }
          }
        }
        if (d < 0.6) h.on = false;
      }
      if (h.life <= 0) h.on = false;
      // visuals: barbed hook + glowing thread with a little sag
      h.mesh.visible = h.on;
      if (h.on) {
        h.mesh.position.set(h.x, h.y, h.z);
        h.mesh.rotation.set(Math.PI / 2, h.spin, 0);
        const mx = (L.x + h.x) / 2, mz = (L.z + h.z) / 2, my = (L.y + h.y) / 2 - 0.35;
        fx.ribbons.seg(L.x, L.y, L.z, mx, my, mz, 0.05, 0.05, COL.thread.r, COL.thread.g, COL.thread.b, 0.75);
        fx.ribbons.seg(mx, my, mz, h.x, h.y, h.z, 0.05, 0.05, COL.thread.r, COL.thread.g, COL.thread.b, 0.75);
        fx.glows.add(h.x, h.y, h.z, COL.thread.r, COL.thread.g, COL.thread.b, 0.9, 0.7);
      }
    }
  }

  // ---------------------------------------------------------------- SPARK
  const chainIds = [];
  function castSpark(w, fromX, fromZ) {
    const p = w.p;
    const first = C.enemiesSys.nearest(fromX, fromZ, p.range || 11);
    if (!first) return false;
    const L = C.lantern;
    chainIds.length = 0;
    let prev = null, e = first, px = L.x, py = L.y, pz = L.z;
    const n = 1 + (p.chains ?? 3);
    for (let i = 0; i < n && e; i++) {
      const ey = 0.75 + (e.y || 0);
      fx.bolt(px, py, pz, e.position.x, ey, e.position.z, COL.spark, { width: i === 0 ? 0.14 : 0.1, life: 0.2, jag: 0.7 });
      fx.glows.add(e.position.x, ey, e.position.z, COL.sparkGlow.r, COL.sparkGlow.g, COL.sparkGlow.b, 1.6, 0.9);
      fx.burst(e.position.x, ey, e.position.z, COL.spark, 5, 3.5, 0.1, 0.25, 1, -3);
      C.hitEnemy(e, dmg(p.damage), { stun: p.stun || 0.15, source: w.id });
      if (p.charge) e.chargeT = Math.max(e.chargeT, p.charge.time || 3);
      chainIds.push(e.id);
      prev = e; px = e.position.x; py = ey; pz = e.position.z;
      e = C.enemiesSys.nearest(px, pz, p.chainRange || 4.5, (o) => !chainIds.includes(o.id));
    }
    void prev;
    return true;
  }
  function wSpark(w, dt) {
    const p = w.p;
    w.t -= dt;
    if (w.n > 0) { w.n -= dt; if (w.n <= 0) castSpark(w, raft.x + (Math.random() - 0.5) * 6, raft.z + (Math.random() - 0.5) * 6); }
    if (w.t > 0) return;
    if (castSpark(w, raft.x, raft.z)) {
      w.t = cd(w, p.cooldown || 2);
      if ((p.casts || 1) > 1) w.n = 0.18;
      ctx.audio?.play?.('zap', { volume: 0.4, pitch: 1.3 });
    } else w.t = 0.25;
  }

  // ---------------------------------------------------------------- BELL
  function wBell(w, dt) {
    const p = w.p;
    w.t -= dt;
    if (w.t > 0) return;
    const R = p.radius || 8;
    let any = false;
    for (let j = 0; j < targets.length && !any; j++) { const e = targets[j]; if (e.targetable && Math.hypot(e.position.x - raft.x, e.position.z - raft.z) < R + e.radius) any = true; }
    if (!any) { w.t = 0.3; return; }
    w.t = cd(w, p.cooldown || 6);
    w.n = (w.n || 0) + 1;
    const root = p.rootEvery && w.n % p.rootEvery === 0;
    for (let j = targets.length - 1; j >= 0; j--) {
      const e = targets[j];
      if (!e || !e.targetable || e.invuln) continue;
      if (Math.hypot(e.position.x - raft.x, e.position.z - raft.z) > R + e.radius) continue;
      e.slowK = Math.max(e.slowK, p.slow || 0.35); e.slowT = Math.max(e.slowT, p.slowTime || 2.5);
      if (p.chillVuln) e.chillT = Math.max(e.chillT, p.slowTime || 2.5);
      if (root && !e.boss) e.rootT = Math.max(e.rootT, p.rootTime || 1);
      C.hitEnemy(e, dmg(p.damage), { source: w.id });
    }
    bellSwing = 1;
    fx.timedDecal({ x: raft.x, z: raft.z, r0: 1, r1: R, life: 0.55, color: COL.frostHot, p1: 0.07, p2: 0.12, alpha: 1 });
    fx.timedDecal({ x: raft.x, z: raft.z, r0: R * 0.9, r1: R * 1.04, life: 1.2, color: COL.frost, type: DECAL.DASHRING, p1: 0.03, p2: 24, ease: 3, alpha: 0.7 });
    if (root) fx.timedDecal({ x: raft.x, z: raft.z, r0: R * 0.2, r1: R, life: 0.9, color: COL.frost, type: DECAL.GLOW, p1: 2.5, alpha: 0.35 });
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * TAU;
      fx.sparks.emit(raft.x + Math.cos(a) * 1.2, 1.6, raft.z + Math.sin(a) * 1.2, Math.cos(a) * R * 1.4, 0.3, Math.sin(a) * R * 1.4, COL.frost.r, COL.frost.g, COL.frost.b, 0.16, 0.65, 0.9, -0.1, 1.5, 0);
    }
    ctx.audio?.play?.('merchant_bell', { volume: 0.4, pitch: w.kindle ? 0.5 : 0.62 });
  }
  function updateBell(dt, t, owned) {
    bell.visible = owned && activeK > 0.05;
    if (!bell.visible) return;
    bellSwing = Math.max(0, bellSwing - dt * 0.9);
    const L = C.lantern;
    bell.position.set(raft.x + (L.x - raft.x) * -0.6, 2.7 + Math.sin(t * 1.4) * 0.06, raft.z + (L.z - raft.z) * -0.6);
    bell.rotation.set(Math.sin(t * 9) * 0.5 * bellSwing + Math.sin(t * 1.1) * 0.05, t * 0.2, Math.cos(t * 7) * 0.3 * bellSwing);
    bell.scale.setScalar((0.8 + 0.2 * activeK) * (1 + 0.15 * bellSwing));
    fx.glows.add(bell.position.x, bell.position.y - 0.05, bell.position.z, COL.frost.r, COL.frost.g, COL.frost.b, 1.1, 0.12 + 0.5 * bellSwing);
  }

  // ---------------------------------------------------------------- NOVA
  function wNova(w, dt) {
    const p = w.p;
    w.t -= dt;
    if (w.t > 0) return;
    const R = Math.max(2, (p.radiusMult || 1) * C.lightR);
    let any = false;
    for (let j = 0; j < targets.length && !any; j++) { const e = targets[j]; if (e.targetable && Math.hypot(e.position.x - raft.x, e.position.z - raft.z) < R + e.radius) any = true; }
    if (!any) { w.t = 0.3; return; }
    w.t = cd(w, p.cooldown || 5);
    let oil = 0;
    for (let j = targets.length - 1; j >= 0; j--) {
      const e = targets[j];
      if (!e || !e.targetable || e.invuln) continue;
      const dx = e.position.x - raft.x, dz = e.position.z - raft.z, d = Math.hypot(dx, dz) || 1;
      if (d > R + e.radius) continue;
      C.hitEnemy(e, dmg(p.damage), { knockX: dx / d, knockZ: dz / d, knock: p.knock || 2, source: w.id });
      if (p.oilPerHit && oil < (p.oilMaxPerPulse || 3)) oil = Math.min(p.oilMaxPerPulse || 3, oil + p.oilPerHit);
    }
    if (oil > 0) C.addOil(oil, true);
    fx.timedDecal({ x: raft.x, z: raft.z, r0: 0.8, r1: R, life: 0.5, color: w.kindle ? COL.pulseHot : COL.pulse, p1: 0.1, p2: 0.18, alpha: 1 });
    fx.timedDecal({ x: raft.x, z: raft.z, r0: R * 0.3, r1: R * 1.05, life: 0.7, color: COL.pulse, type: DECAL.GLOW, p1: 1.6, alpha: 0.35, ease: 3 });
    fx.burst(C.lantern.x, C.lantern.y, C.lantern.z, COL.pulseHot, 14, 5, 0.16, 0.5, 1.2, -2);
    ctx.audio?.play?.('aura_burn', { volume: 0.9, pitch: 0.8 });
  }

  // ---------------------------------------------------------------- MINES
  function wMines(w, dt) {
    const p = w.p;
    w.t -= dt;
    if (w.t > 0) return;
    const live = floats.reduce((n, f) => n + (f.on ? 1 : 0), 0);
    if (live >= (p.max || 3)) { w.t = 0.3; return; }
    w.t = cd(w, p.cooldown || 2.5);
    const f = floats.find((x) => !x.on);
    if (!f) return;
    let tx, tz;
    if (C.raftSpeed > 1.5) {
      const sp = C.raftSpeed;
      tx = raft.x - C.raftVel.x / sp * 2.2; tz = raft.z - C.raftVel.z / sp * 2.2;
    } else {
      const c = C.enemiesSys.densest(raft.x, raft.z, 14);
      const toss = p.toss || [4, 8];
      let dx, dz;
      if (c) { dx = c.x - raft.x; dz = c.z - raft.z; } else { const a = Math.random() * TAU; dx = Math.cos(a); dz = Math.sin(a); }
      const d = Math.hypot(dx, dz) || 1;
      const dist = Math.max(toss[0], Math.min(toss[1], d));
      tx = raft.x + dx / d * dist; tz = raft.z + dz / d * dist;
    }
    const pt = p4.set(tx, 0, tz);
    ctx.world?.collide?.(pt, 0.4);
    f.on = true; f.fx0 = C.lantern.x; f.fz0 = C.lantern.z; f.fx1 = pt.x; f.fz1 = pt.z; f.x = f.fx0; f.z = f.fz0; f.fly = 0.45; f.t = 0; f.w = w; f.seed = Math.random();
  }
  function blast(f) {
    const p = f.w?.p || {};
    const R = p.blastRadius || 2.5;
    for (let j = targets.length - 1; j >= 0; j--) {
      const e = targets[j];
      if (!e || !e.targetable || e.invuln) continue;
      const dx = e.position.x - f.x, dz = e.position.z - f.z, d = Math.hypot(dx, dz) || 1;
      if (d > R + e.radius) continue;
      C.hitEnemy(e, dmg(p.damage), { knockX: dx / d, knockZ: dz / d, knock: 1.4, source: f.w?.id });
    }
    fx.timedDecal({ x: f.x, z: f.z, r0: 0.4, r1: R, life: 0.4, color: COL.blast, p1: 0.25, p2: 0.4, alpha: 1 });
    fx.timedDecal({ x: f.x, z: f.z, r0: R * 0.5, r1: R * 1.2, life: 0.8, color: COL.ink, type: DECAL.STAIN, p1: 1, additive: false, ease: 3, alpha: 0.6 });
    fx.burst(f.x, 0.4, f.z, COL.blast, 22, 6, 0.2, 0.6, 3, -8);
    fx.ink(f.x, 0.4, f.z, 5, 1.2);
    ctx.water?.splash?.(f.x, f.z, { size: 1.2, count: 14 });
    C.shake(0.08, 0.15);
    ctx.audio?.play?.('splash_big', { volume: 0.5, pitch: 1.3 });
    if (p.pullsCinders) C.levels?.pullCinders(f.x, f.z, 9);
    f.on = false;
  }
  function updateFloats(dt, t) {
    let n = 0;
    for (const f of floats) {
      if (!f.on) continue;
      const p = f.w?.p || {};
      if (f.fly > 0) {
        f.fly -= dt;
        const k = 1 - Math.max(0, f.fly) / 0.45;
        f.x = f.fx0 + (f.fx1 - f.fx0) * k; f.z = f.fz0 + (f.fz1 - f.fz0) * k;
        f.y = 1.6 * (1 - k) + Math.sin(k * Math.PI) * 1.5;
        if (f.fly <= 0) { f.y = 0; ctx.water?.addRipple?.(f.x, f.z, 0.5); }
      } else {
        f.t += dt;
        if (p.drift) {
          const e = C.enemiesSys.nearest(f.x, f.z, 8);
          if (e) { const dx = e.position.x - f.x, dz = e.position.z - f.z, d = Math.hypot(dx, dz) || 1; f.x += dx / d * p.drift * dt; f.z += dz / d * p.drift * dt; }
        }
        const armed = f.t >= (p.arm ?? 0.6);
        if (armed) {
          const tr = p.trigger || 1.5;
          for (let j = 0; j < targets.length; j++) {
            const e = targets[j];
            if (!e.targetable || e.invuln) continue;
            const dx = e.position.x - f.x, dz = e.position.z - f.z, m = tr + e.radius * 0.5;
            if (dx * dx + dz * dz < m * m) { blast(f); break; }
          }
          if (!f.on) continue;
        }
        if (f.t >= (p.life || 12)) { fx.ink(f.x, 0.3, f.z, 3, 0.6); f.on = false; continue; }
        const wy = ctx.water?.getHeight?.(f.x, f.z) ?? 0;
        f.y = wy + 0.05 + Math.sin(t * 3 + f.seed * 10) * 0.04;
        const pulse = armed ? 0.6 + 0.4 * Math.sin(t * 9 + f.seed * 10) : 0.25;
        fx.glows.add(f.x, f.y + 0.25, f.z, COL.mine.r, COL.mine.g, COL.mine.b, 0.75 * pulse + 0.3, 0.8);
        if (armed) fx.decalsG.add(f.x, f.z, (p.trigger || 1.5), (p.trigger || 1.5), 0, DECAL.DASHRING, COL.mine.r * 0.25, COL.mine.g * 0.25, COL.mine.b * 0.25, 0.4, 0.06, 8, t * 0.8 + f.seed * 5);
      }
      e4.set(Math.sin(t * 2 + f.seed * 9) * 0.15, f.seed * TAU, Math.cos(t * 1.7 + f.seed * 4) * 0.15);
      q4.setFromEuler(e4); s4.setScalar(1); p4.set(f.x, f.y, f.z);
      m4.compose(p4, q4, s4);
      floatMesh.setMatrixAt(n++, m4);
    }
    floatMesh.count = n; floatOutline.count = n;
    floatMesh.visible = floatOutline.visible = n > 0;
    if (n) floatMesh.instanceMatrix.needsUpdate = true;
  }

  // ---------------------------------------------------------------- VORTEX
  function openVortex(w, x, z) {
    const v = vortices.find((q) => !q.on);
    if (!v) return;
    const p = w.p;
    v.on = true; v.x = x; v.z = z; v.t = 0; v.T = p.duration || 3; v.R = p.radius || 3; v.pull = p.pull || 3; v.dps = p.dps || 6; v.tick = 0; v.w = w; v.endFlare = !!p.endFlare; v.seed = Math.random();
    ctx.water?.splash?.(x, z, { size: 1.4, count: 16 });
    ctx.audio?.play?.('splash_big', { volume: 0.45, pitch: 0.7 });
  }
  function wVortex(w, dt) {
    const p = w.p;
    w.t -= dt;
    if (w.t > 0) return;
    const c = C.enemiesSys.densest(raft.x, raft.z, p.range || 14);
    if (!c) { w.t = 0.35; return; }
    w.t = cd(w, p.cooldown || 9);
    const cx = c.x, cz = c.z;
    openVortex(w, cx, cz);
    if ((p.count || 1) > 1) {
      // second whirlpool on the next densest crowd away from the first
      let best = null, bd = 0;
      for (const e of targets) {
        if (!e.targetable) continue;
        const d1 = Math.hypot(e.position.x - cx, e.position.z - cz), d0 = Math.hypot(e.position.x - raft.x, e.position.z - raft.z);
        if (d0 < (p.range || 14) && d1 > (p.radius || 3) * 2 && d1 > bd) { bd = d1; best = e; }
      }
      if (best) openVortex(w, best.position.x, best.position.z);
    }
  }
  function updateVortices(dt, t) {
    for (const v of vortices) {
      if (!v.on) continue;
      v.t += dt;
      const k = v.t / v.T;
      if (k >= 1) {
        if (v.endFlare) C.flareBurst(v.x, v.z, v.R * 1.6, 1, { free: true, source: 'vortex' });
        fx.timedDecal({ x: v.x, z: v.z, r0: v.R, r1: v.R * 1.6, life: 0.5, color: COL.vortexHot, p1: 0.1 });
        v.on = false; continue;
      }
      const open = Math.min(1, v.t * 3) * Math.min(1, (v.T - v.t) * 2.5);
      const R = v.R * (0.7 + 0.3 * open);
      fx.decalsI.add(v.x, v.z, R * 0.8, R * 0.8, 0, DECAL.STAIN, COL.ink.r, COL.ink.g, COL.ink.b, 0.6 * open, 0.9, 0, 0, v.seed * 9);
      fx.decalsG.add(v.x, v.z, R * 1.25, R * 1.25, 0, DECAL.SPIRAL, COL.vortex.r * 0.7, COL.vortex.g * 0.7, COL.vortex.b * 0.7, 0.5 * open, t * 7 + v.seed * 6, 0, 0, 0);
      fx.decalsG.add(v.x, v.z, R * 1.6, R * 1.6, 0, DECAL.DASHRING, COL.vortex.r * 0.4, COL.vortex.g * 0.4, COL.vortex.b * 0.4, 0.5 * open, 0.03, 18, -t * 3);
      if (Math.random() < dt * 30) {
        const a = Math.random() * TAU, rr = R * 1.4;
        fx.sparks.emit(v.x + Math.cos(a) * rr, 0.25, v.z + Math.sin(a) * rr, -Math.sin(a) * 5 - Math.cos(a) * 2, 0.2, Math.cos(a) * 5 - Math.sin(a) * 2, COL.vortexHot.r, COL.vortexHot.g, COL.vortexHot.b, 0.12, 0.45, 0.8, 0, 0.5, 0);
      }
      if (Math.random() < dt * 4) ctx.water?.addRipple?.(v.x, v.z, 0.8);
      v.tick -= dt;
      const doTick = v.tick <= 0;
      if (doTick) v.tick = 0.25;
      for (let j = targets.length - 1; j >= 0; j--) {
        const e = targets[j];
        if (!e || !e.targetable || e.invuln) continue;
        const dx = v.x - e.position.x, dz = v.z - e.position.z, d = Math.hypot(dx, dz) || 1;
        if (d > v.R * 1.6 + e.radius) continue;
        if (!e.boss && !e.elite && d > 0.4) {
          const pull = v.pull * (e.behavior === 'bulwark' ? 0.5 : 1);
          e.position.x += (dx / d * pull + (-dz / d) * pull * 0.6) * dt; e.position.z += (dz / d * pull + (dx / d) * pull * 0.6) * dt;
        }
        if (doTick && d <= v.R + e.radius) C.hitEnemy(e, dmg(v.dps) * 0.25, { aura: true, source: v.w?.id });
      }
    }
  }

  // ---------------------------------------------------------------- BEAM
  function wBeam(w, dt, t) {
    const p = w.p;
    const n = p.beams || 1;
    const spin = (spinBoostT > 0 && p.spinOnHurt) ? (p.spinOnHurt.mult || 3) : 1;
    w.a += (p.turnSpeed || 1.2) * spin * dt;
    const len = C.lightR + (p.lengthAdd || 4);
    const width = p.width || 0.9;
    const L = C.lantern;
    const k = activeK;
    if (k < 0.02) return;
    for (let i = 0; i < n; i++) {
      const a = w.a + (i / n) * TAU;
      const dx = Math.cos(a), dz = Math.sin(a);
      const ex = raft.x + dx * len, ez = raft.z + dz * len;
      const rot = Math.atan2(-dx, -dz);
      // ground light on the water + the shaft itself
      fx.decalsG.add(raft.x + dx * len * 0.5, raft.z + dz * len * 0.5, width * 0.8, len * 0.5, rot, DECAL.RECT, COL.beam.r * 0.45, COL.beam.g * 0.4, COL.beam.b * 0.3, 0.45 * k, 1, 0, 0, 0);
      fx.ribbons.seg(L.x, L.y, L.z, ex, 0.5, ez, width * 0.7, width * 2, COL.beam.r * 0.4, COL.beam.g * 0.36, COL.beam.b * 0.28, 0.16 * k, 0.02 * k);
      fx.ribbons.seg(L.x, L.y, L.z, ex, 0.55, ez, width * 0.22, width * 0.55, COL.beamCore.r * 0.7, COL.beamCore.g * 0.66, COL.beamCore.b * 0.56, 0.5 * k, 0.06 * k);
      if (Math.random() < dt * 14) {
        const r = Math.random() * len;
        fx.sparks.emit(raft.x + dx * r, 0.4 + Math.random() * 0.8, raft.z + dz * r, 0, 0.15, 0, COL.beam.r, COL.beam.g, COL.beam.b, 0.1, 0.8, 0.8, 0, 0.5, 0);
      }
      for (let j = 0; j < targets.length; j++) {
        const e = targets[j];
        if (e.invuln || e.submerged) continue;
        const rx = e.position.x - raft.x, rz = e.position.z - raft.z;
        const along = rx * dx + rz * dz;
        if (along < 0 || along > len + e.radius) continue;
        const perp = Math.abs(rx * dz - rz * dx);
        if (perp > width * 0.5 + e.radius) continue;
        e.revealT = 0.6;
        if (e.cdBeam > 0 || !e.targetable) continue;
        e.cdBeam = p.hitCooldown || 0.4;
        C.hitEnemy(e, dmg(p.damage), { beam: true, source: w.id });
        if (p.scorch) { e.burnT = Math.max(e.burnT, p.scorch); e.burnDps = Math.max(e.burnDps, dmg(p.damage) * 0.25); }
        fx.burst(e.position.x, 0.8, e.position.z, COL.beam, 3, 2, 0.1, 0.3);
      }
    }
  }

  // ---------------------------------------------------------------- Lantern on the Line (proc): the fishing line scorches
  const rod = new THREE.Vector3();
  function lineProc(dt, t) {
    const pr = C.lineProc;
    if (!pr) return;
    const bob = ctx.fishing?.bobberPos;
    if (!bob || typeof bob.x !== 'number') return;
    const tip = ctx.actors?.getRodTip?.();
    if (!tip || typeof tip.x !== 'number') return;
    rod.copy(tip);
    const ax = rod.x, az = rod.z, bx = bob.x, bz = bob.z;
    const lx = bx - ax, lz = bz - az, ll = lx * lx + lz * lz || 1;
    fx.ribbons.seg(rod.x, rod.y, rod.z, bx, (bob.y || 0) + 0.1, bz, 0.12, 0.12, COL.line.r, COL.line.g, COL.line.b, 0.55 + 0.25 * Math.sin(t * 12));
    if (Math.random() < dt * 20) { const k = Math.random(); fx.sparks.emit(ax + lx * k, rod.y * (1 - k) + 0.2, az + lz * k, 0, 0.6, 0, COL.line.r, COL.line.g, COL.line.b, 0.12, 0.4, 1, 0, 1, 0); }
    lineTick -= dt;
    const tick = lineTick <= 0;
    if (tick) lineTick = 0.25;
    const R = pr.lineRadius || 1.5;
    for (let j = targets.length - 1; j >= 0; j--) {
      const e = targets[j];
      if (!e || !e.targetable || e.invuln) continue;
      const px = e.position.x - ax, pz = e.position.z - az;
      const k = Math.max(0, Math.min(1, (px * lx + pz * lz) / ll));
      const qx = px - lx * k, qz = pz - lz * k;
      if (qx * qx + qz * qz > (R + e.radius) * (R + e.radius)) continue;
      e.slowK = Math.max(e.slowK, pr.lineSlow || 0.3); e.slowT = Math.max(e.slowT, 0.3);
      if (tick) C.hitEnemy(e, dmg(pr.lineDps || 6) * 0.25, { aura: true, source: 'lantern_on_the_line' });
    }
  }
  let lineTick = 0;

  // ---------------------------------------------------------------- frame
  function update(dt, t) {
    const night = C.phase === 'dusk' || C.phase === 'gloomtide' || C.phase === 'dawn';
    const want = night || targets.length > 0 ? 1 : 0;
    activeK += (want - activeK) * Math.min(1, dt * 1.5);
    spinBoostT = Math.max(0, spinBoostT - dt);
    for (let j = 0; j < targets.length; j++) {
      const e = targets[j];
      if (e.cdOrbit > 0) e.cdOrbit -= dt;
      if (e.cdBeam > 0) e.cdBeam -= dt;
      if (e.cdTrail > 0) e.cdTrail -= dt;
      if (e.revealT > 0) e.revealT -= dt;
    }
    let bellOwned = false;
    for (const w of list) {
      try {
        switch (w.type) {
          case 'orbit': wOrbit(w, dt, t); break;
          case 'motes': wMotes(w, dt); break;
          case 'trail': wTrail(w, dt); break;
          case 'hook': wHook(w, dt); break;
          case 'spark': wSpark(w, dt); break;
          case 'bell': bellOwned = true; wBell(w, dt); break;
          case 'nova': wNova(w, dt); break;
          case 'mines': wMines(w, dt); break;
          case 'vortex': wVortex(w, dt); break;
          case 'beam': wBeam(w, dt, t); break;
          default: break;
        }
      } catch (err) { C.report('weapon ' + w.id, err); }
    }
    updateMotes(dt, t); updateSegs(dt, t); updateHooks(dt, t); updateFloats(dt, t); updateVortices(dt, t); updateBell(dt, t, bellOwned);
    lineProc(dt, t);
  }
  function clear() {
    for (const m of motes) m.on = false;
    for (const s of segs) s.on = false;
    for (const h of hooks) { h.on = false; h.mesh.visible = false; }
    for (const f of floats) f.on = false;
    for (const v of vortices) v.on = false;
    floatMesh.count = 0; floatOutline.count = 0; bell.visible = false;
  }
  function ramActive() {
    const w = list.find((x) => x.type === 'trail' && x.p?.ram);
    if (!w) return false;
    return C.raftSpeed >= (w.p.ram.speedFrac ?? 0.8) * (C.stats.moveSpeed || 6);
  }
  function ramParams() { return list.find((x) => x.type === 'trail' && x.p?.ram)?.p.ram || null; }
  function onHurt() {
    const w = list.find((x) => x.type === 'beam' && x.p?.spinOnHurt);
    if (w) spinBoostT = w.p.spinOnHurt.time || 3;
  }

  return { list, sync, update, clear, ramActive, ramParams, onHurt, paramsFor, get activeK() { return activeK; } };
}
