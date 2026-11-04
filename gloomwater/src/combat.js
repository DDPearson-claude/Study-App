// combat.js — the night swarm and lantern combat (combat author). CONTRACT §7 combat.
// Owns: the swarm director (dusk scouts, Gloomtide credit spawner with swells, formations,
// Drowned Hand elites, Warden boss nights, calm Creelsnatch raids), every gloomling behaviour,
// lantern combat (aura burn, tap-zap, flare), the ten boon weapons and their Kindles, Cinders
// (XP), level-ups / Boon offers, and all combat VFX. DESIGN §7, §8, §10 with numbers from data.js.
//
// Helpers (imported only here): combat-fx.js (pooled VFX layers), combat-enemies.js (pool,
// behaviours, hazards), combat-warden.js (bosses), combat-weapons.js, combat-levels.js.
//
// Optional extensions others may read (all guard with ?.):
//   lightMult            Π light dims (latched moths, slick, veils, eclipse, snuff, hush; floor 0.5) × flare boost (×1.4 for 3 s)
//   lightDims, flareBoost, lightAdd (m, Gutsfire surge)  — the same split into parts
//   auraRadius           the radius the aura actually burns at this frame (m)
//   speedMult            raft speed multiplier from hazards (ink slick ×0.6) — for player.js
//   rooted               true while a Ringed Grasp grips the raft
//   flareCooldown / flareCooldownTotal / canFlare() / flareCost
//   pendingCount         queued level-up picks (incl. the open one); skip() → +Shells; getThreat()
//   stolenFish           [{fish, position, t}] floating fish to recover (edge markers)
//   bossAlive, getBoss() → enemy|null; latchedCount
//   spawnEnemy(id, position, opts) → enemy   (scripted summons; DESIGN §23.2 names it survival.spawnEnemy)
//   levelup payload extras: {gift, draft, remaining}; BoonOption extras: kind, weapon, tags, note, lore,
//     isKindle/fuses (Kindle cards), fallback (Spilled Shells / A Warm Breath / Oil Tears)
//   Reads (optional): progression.addShells / grantHeartwax, survival.grantIframes, player.applyKnock,
//     actors.getLanternPos / pointAt / lightPool, models.createSwarm(kind, max).setTint, run.flags.flareCharges,
//     run.flags.bankedLevels (Kindling Draft → consecutive draft level-ups), run.flags.zoneEnteredDay.
import * as THREE from 'three';
import { createFx, DECAL, lin } from './combat-fx.js';
import { createEnemies } from './combat-enemies.js';
import { createWarden } from './combat-warden.js';
import { createWeapons } from './combat-weapons.js';
import { createLevels } from './combat-levels.js';

const TAU = Math.PI * 2;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const COL = {
  zap: lin(0xfff1cf, 3.2), zapGlow: lin(0xffc870, 2.2), flare: lin(0xffd9a0, 2.6), flareHot: lin(0xfff4dc, 3.4), flareRing: lin(0xffb860, 2.0),
  burn: lin(0xffa040, 2.4), burnHot: lin(0xffd080, 3), gutter: lin(0xe8b860, 1.6), edge: lin(0xffb347, 1), grip: lin(0xe8c66a, 1.8), ink: lin(0x040508, 1),
  gold: lin(0xe8c66a, 2.4),
};
const HOOKED = new Set(['reeling', 'landing']);

export function create(ctx) {
  const group = new THREE.Group(); group.name = 'combat';
  const errorsSeen = new Map();
  const C = {
    ctx, group, enemies: [],
    raft: new THREE.Vector3(), raftVel: new THREE.Vector3(), raftSpeed: 0, lantern: new THREE.Vector3(0, 2, 0),
    run: null, stats: {}, diff: null, zoneId: 'mossmere', zoneIndex: 0, zone: null, phase: 'calm', phaseK: 0, day: 1,
    lightR: 8, oilFrac: 1, lanternOut: false, obstacles: [], contactRadius: 1.8, sepDist: 0.9,
    light: {}, B: null, chillVuln: 0, veilAura: 1, inSlick: false, eclipse: 0, choirReady: 0, lineProc: null,
    report(where, err) {
      const n = (errorsSeen.get(where) || 0) + 1;
      errorsSeen.set(where, n);
      if (n <= 2) { console.error(`[combat] ${where}:`, err); ctx.errors?.push?.(`combat ${where}: ${err?.message || err}`); }
    },
  };
  const fx = createFx(ctx, group);
  C.fx = fx;
  const enemiesSys = createEnemies(C);
  C.enemiesSys = enemiesSys;
  const warden = createWarden(C);
  C.warden = warden;
  const weapons = createWeapons(C);
  C.weapons = weapons;
  const levels = createLevels(C);
  C.levels = levels;
  const enemies = C.enemies;

  const data = () => ctx.data;
  const real = (m) => !!m && !m.isStub;

  // ---------------------------------------------------------------- frame state
  const fallbackStats = () => {
    const out = {};
    for (const [k, def] of Object.entries(data().STATS || {})) out[k] = def.base;
    return out;
  };
  let statsCache = null, statsT = 0;
  function refreshStats(force) {
    if (!force && statsCache && --statsT > 0) { C.stats = statsCache; return; }
    statsT = 8;
    let s = null;
    try { s = ctx.progression?.getStats?.(); } catch (e) { C.report('getStats', e); }
    if (!s || s.isStub || typeof s !== 'object') s = statsCache || fallbackStats();
    statsCache = s;
    C.stats = s;
  }
  let diffT = 0;
  function zoneInfo() {
    const z = data().ZONE_BY_ID?.[C.run?.zone] || (data().ZONES || []).find((q) => q.id === C.run?.zone) || (data().ZONES || [])[0];
    C.zone = z; C.zoneId = z?.id || 'mossmere'; C.zoneIndex = z?.index ?? 0;
  }
  function phaseInfo() {
    let pi = null;
    try { pi = ctx.survival?.getPhaseInfo?.(); } catch { /* stub */ }
    const run = C.run;
    if (pi && !pi.isStub && typeof pi.phase === 'string') { C.phase = pi.phase; C.phaseK = clamp01(Number(pi.k) || 0); C.day = pi.day || run?.day || 1; C.phaseDur = pi.duration || 90; C.phaseTime = pi.time || 0; }
    else {
      C.phase = run?.phase || 'calm'; C.day = run?.day || 1;
      const dur = C.phase === 'gloomtide' ? (data().gloomtideLength?.(C.day) ?? 90) : (data().BALANCE?.phases?.[C.phase] ?? 60);
      C.phaseDur = dur; C.phaseTime = run?.phaseTime || 0; C.phaseK = clamp01(C.phaseTime / dur);
    }
  }
  function nightInZone() {
    const run = C.run;
    const entered = run?.flags?.zoneEnteredDay;
    if (Number.isFinite(entered)) return Math.max(1, (run.day || 1) - entered + 1);
    return Math.max(1, run?.day || 1);
  }
  function refreshDiff(force) {
    diffT -= 1;
    if (!force && diffT > 0 && C.diff) return;
    diffT = 12;
    const k = C.phase === 'gloomtide' ? C.phaseK : 0.5;
    try { C.diff = data().difficultyFor?.(C.day, C.zoneIndex, k, { nightInZone: nightInZone() }) || C.diff; } catch (e) { C.report('difficultyFor', e); }
    if (!C.diff) C.diff = { spawnRate: 0.75, maxAlive: 30, hpMult: 1, speedMult: 1, damageMult: 1, drainMult: 1, kinds: [{ id: 'gloomling', w: 1 }], eliteEvery: 0, boss: null, elites: [], heat: 0, xpScale: 1 };
  }
  const v3 = new THREE.Vector3();
  const lastRaft = new THREE.Vector3();
  function refreshRaft(dt) {
    const p = ctx.player?.position;
    if (real(ctx.player) && p && Number.isFinite(p.x)) C.raft.set(p.x, 0, p.z);
    const v = ctx.player?.velocity;
    if (real(ctx.player) && v && Number.isFinite(v.x)) C.raftVel.set(v.x, 0, v.z);
    else if (dt > 0) C.raftVel.set((C.raft.x - lastRaft.x) / dt, 0, (C.raft.z - lastRaft.z) / dt);
    lastRaft.copy(C.raft);
    C.raftSpeed = Math.hypot(C.raftVel.x, C.raftVel.z);
    // lantern position (zap origin, moths latch here)
    const a = ctx.actors;
    let ok = false;
    try {
      if (real(a) && typeof a.getLanternPos === 'function') { const r = a.getLanternPos(C.lantern); ok = !!r && Number.isFinite(C.lantern.x); }
      if (!ok && real(a) && a.lanternLight instanceof THREE.Object3D) { a.lanternLight.getWorldPosition(C.lantern); ok = Number.isFinite(C.lantern.x); }
    } catch { ok = false; }
    if (!ok || Math.hypot(C.lantern.x - C.raft.x, C.lantern.z - C.raft.z) > 4) C.lantern.set(C.raft.x, 2.1, C.raft.z);
  }

  // ---------------------------------------------------------------- light dims & aura radius
  const dims = {};                 // name → {mult, t}
  C.addDim = (name, mult, time) => {
    const d = dims[name];
    if (!d || d.t <= 0) dims[name] = { mult, t: time };
    else { d.mult = Math.min(d.mult, mult); d.t = Math.max(d.t, time); }
  };
  const latched = [null, null, null, null];
  let flareBoostT = 0, gutsT = 0, gutsP = null;
  let lightDims = 1, flareBoost = 1, lightAdd = 0, survAppliesMult = false;
  function refreshLight(dt) {
    const run = C.run, S = C.stats, L = C.light;
    const maxOil = Math.max(1, S.maxOil || 100);
    C.oilFrac = clamp01((run?.oil ?? maxOil) / maxOil);
    C.lanternOut = (run?.oil ?? 1) <= 0;
    let prod = 1;
    for (const k in dims) { const d = dims[k]; if (d.t > 0) { d.t -= dt; prod *= d.mult; } }
    let nl = 0;
    for (const m of latched) if (m) nl++;
    prod *= Math.pow(L.mothDim ?? 0.88, nl);
    // a legendary's Eclipse phase (fishing.lightMult, DESIGN §5.6) dims the lantern under the same floor
    try { const fm = ctx.fishing?.lightMult; if (real(ctx.fishing) && typeof fm === 'number' && fm > 0 && fm < 1) prod *= fm; } catch { /* optional */ }
    lightDims = Math.max(L.dimFloor ?? 0.5, prod);
    flareBoostT = Math.max(0, flareBoostT - dt);
    flareBoost = flareBoostT > 0 ? (C.B?.combat?.flare?.lightBoost ?? 1.4) : 1;
    gutsT = Math.max(0, gutsT - dt);
    lightAdd = gutsT > 0 ? (gutsP?.lightRadius || 0) : 0;
    const M = lightDims * flareBoost;
    const base = C.lanternOut ? (L.emberGlow ?? 2.5) : (S.lightRadius || 8) * ((L.floorRadius ?? 0.55) + (1 - (L.floorRadius ?? 0.55)) * C.oilFrac);
    let surv = null;
    try { const r = ctx.survival?.lightRadius; if (real(ctx.survival) && typeof r === 'number' && Number.isFinite(r) && r > 0) surv = r; } catch { /* ignore */ }
    if (surv == null) { C.lightR = C.lanternOut ? base : base * M + lightAdd; return; }
    if (ctx.survival.appliesCombatLight === true) survAppliesMult = true;
    else if (Math.abs(M - 1) > 0.04 && base > 0.5 && !C.lanternOut) {
      const r = surv / base;
      survAppliesMult = Math.abs(r - M) < Math.abs(r - 1);
    }
    // survival.lightRadius already folds in lightMult and Gutsfire's lightAdd when appliesCombatLight
    C.lightR = C.lanternOut ? surv : (survAppliesMult ? surv : surv * M + lightAdd);
  }
  C.tryLatch = (e) => {
    const max = e.def.maxLatched ?? 4;
    let n = 0;
    for (const m of latched) if (m) n++;
    if (n >= max) return false;
    const i = latched.indexOf(null);
    if (i < 0) return false;
    latched[i] = e; e.latchSlot = i;
    fx.burst(C.lantern.x, C.lantern.y, C.lantern.z, lin(e.eye, 2), 6, 1.5, 0.12, 0.4);
    return true;
  };
  C.unlatch = (e, knock = true) => {
    if (e.latchSlot >= 0 && latched[e.latchSlot] === e) latched[e.latchSlot] = null;
    e.latchSlot = -1;
    if (e.alive) {
      e.state = 'move'; e.stun = Math.max(e.stun, 0.6);
      if (knock) { const dx = e.position.x - C.raft.x, dz = e.position.z - C.raft.z, d = Math.hypot(dx, dz) || 1; e.position.y = 0; C.knockEnemy(e, dx / d, dz / d, 3); }
    }
  };

  // ---------------------------------------------------------------- player plumbing
  const pKnock = new THREE.Vector3();
  let grip = null;
  C.canHurtPlayer = () => !!C.run && C.run.active !== false && ctx.flow === 'playing' && (C.run.hp ?? 1) > 0;
  C.addOil = (n) => { if (!n) return; try { ctx.survival?.addOil?.(n); } catch (e) { C.report('addOil', e); } };
  C.damagePlayer = (embers, source, oil = 0, o = {}) => {
    if (!C.canHurtPlayer()) return;
    let inv = false;
    try { inv = ctx.survival?.isInvulnerable?.() === true; } catch { inv = false; }
    const dm = C.diff?.damageMult ?? 1;
    let n = embers > 0 ? Math.max(1, Math.floor(embers * dm)) : 0;
    if (o.boss) n = Math.min(C.B?.damage?.bossHitCap ?? 3, n);
    if (inv) { if (oil > 0) C.addOil(-oil * (C.B?.damage?.iframeOilMult ?? 0.5)); return 0; }
    if (oil > 0) C.addOil(-oil);
    let lost = 0;
    if (n > 0) {
      try {
        const r = ctx.survival?.damage?.(n, source || 'gloom');
        lost = real(ctx.survival) && typeof r === 'number' ? r : n;   // survival returns the Embers lost (0 when warded)
      } catch (e) { C.report('survival.damage', e); }
    }
    return lost;
  };
  C.knockPlayer = (dx, dz, dist) => {
    if (!real(ctx.player) || !ctx.player.position) return;
    if (typeof ctx.player.applyKnock === 'function') { try { ctx.player.applyKnock(dx * dist, dz * dist); return; } catch { /* fall back */ } }
    pKnock.x += dx * dist * 6; pKnock.z += dz * dist * 6;
  };
  C.pullPlayer = (dx, dz, speed, dt) => {
    const p = ctx.player?.position;
    if (!real(ctx.player) || !p || grip) return;
    // the raft controller owns its velocity: ask it to drift toward the maw this frame
    if (typeof ctx.player.pull === 'function') { try { ctx.player.pull(p.x + dx * 10, p.z + dz * 10, speed); return; } catch { /* fall back */ } }
    p.x += dx * speed * dt; p.z += dz * speed * dt;
    ctx.world?.collide?.(p, C.B?.move?.raftRadius ?? 1.6);
  };
  C.pushPlayerOut = (x, z, r) => {
    const p = ctx.player?.position;
    if (!real(ctx.player) || !p) return;
    const rr = r + (C.B?.move?.raftRadius ?? 1.6) * 0.8;
    const dx = p.x - x, dz = p.z - z, d = Math.hypot(dx, dz);
    if (d >= rr || d < 1e-4) return;
    p.x = x + dx / d * rr; p.z = z + dz / d * rr;
    const v = ctx.player.velocity;
    if (v) { const vn = v.x * dx / d + v.z * dz / d; if (vn < 0) { v.x -= vn * dx / d; v.z -= vn * dz / d; } }
  };
  C.gripPlayer = (e, g) => {
    grip = { e, t: g.time ?? 3, oil: g.oilPerSec ?? 3, zaps: 0, need: g.zapsToBreak ?? 3, x: C.raft.x, z: C.raft.z };
    try { ctx.player?.root?.(grip.t); } catch { /* optional; combat.rooted also stops the raft */ }
    ctx.bus.emit('toast', { text: 'The Grasp holds you. Zap it three times!', kind: 'bad' });
  };
  function updatePlayerEffects(dt, t) {
    const p = ctx.player?.position;
    if (!real(ctx.player) || !p) { pKnock.set(0, 0, 0); grip = null; return; }
    if (pKnock.lengthSq() > 0.0004) {
      p.x += pKnock.x * dt; p.z += pKnock.z * dt;
      const k = Math.exp(-6 * dt); pKnock.x *= k; pKnock.z *= k;
      ctx.world?.collide?.(p, C.B?.move?.raftRadius ?? 1.6);
    } else pKnock.set(0, 0, 0);
    if (grip) {
      grip.t -= dt;
      if (grip.t <= 0 || !grip.e.alive || grip.zaps >= grip.need || !C.canHurtPlayer()) {
        if (grip.zaps >= grip.need) { fx.burst(C.raft.x, 0.8, C.raft.z, COL.grip, 18, 4, 0.18, 0.6); ctx.bus.emit('toast', { text: 'You tear free.', kind: 'good' }); }
        grip = null;
      } else {
        p.x = grip.x; p.z = grip.z;
        if (ctx.player.velocity) ctx.player.velocity.set(0, 0, 0);
        C.addOil(-grip.oil * dt);
        const pulse = 0.6 + 0.4 * Math.sin(t * 8);
        fx.decalsI.add(grip.x, grip.z, 2.4, 2.4, 0, DECAL.STAIN, 0.02, 0.02, 0.02, 0.7, 0.85, 0, 0, 0.3);
        fx.decalsG.add(grip.x, grip.z, 2.3, 2.3, t, DECAL.DASHRING, COL.grip.r, COL.grip.g, COL.grip.b, 0.6 * pulse, 0.08, 6, t * 2);
      }
    }
  }
  C.snapLine = () => {
    try {
      const st = ctx.fishing?.state;
      if ((st === 'bite' || HOOKED.has(st)) && ctx.fishing?.view?.rarity !== 'legendary') ctx.fishing.cancel?.('snap');
    } catch (e) { C.report('snapLine', e); }
  };
  C.giveShells = (n) => {
    n = Math.round(n || 0);
    if (n <= 0 || !C.run) return;
    const pr = ctx.progression;
    try {
      if (real(pr) && typeof pr.addShells === 'function') { pr.addShells(n, 'combat'); return; }
      if (typeof ctx.debug?.addShells === 'function') { ctx.debug.addShells(n); return; }
    } catch (e) { C.report('giveShells', e); }
    C.run.shells = (C.run.shells || 0) + n;
    if (C.run.stats) C.run.stats.shellsEarned = (C.run.stats.shellsEarned || 0) + n;
    ctx.bus.emit('shells:change', { shells: C.run.shells, delta: n });
  };
  C.floatText = (pos, text, css) => { try { ctx.ui?.floatText?.(pos, text, css); } catch { /* optional */ } };
  C.shake = (i, d) => { try { ctx.render?.shake?.(i, d); } catch { /* optional */ } };
  C.ramActive = () => weapons.ramActive();
  C.ramParams = () => weapons.ramParams();
  C.onBoonsChanged = () => { refreshStats(true); weapons.sync(); };

  // creel theft / recovery
  const speciesOf = (id) => data().SPECIES_BY_ID?.[id] || (data().SPECIES || []).find((s) => s.id === id);
  function randomStealable() {
    const creel = C.run?.creel;
    if (!Array.isArray(creel) || !creel.length) return null;
    const ok = creel.filter((f) => f && speciesOf(f.speciesId)?.rarity !== 'legendary');
    return ok.length ? ok[(Math.random() * ok.length) | 0] : null;
  }
  C.stealFish = (e) => {
    const f = randomStealable();
    if (!f) return null;
    let fish = null;
    try { fish = ctx.progression?.removeFromCreel?.(f.uid); } catch (err) { C.report('removeFromCreel', err); }
    if (!fish || fish.isStub) return null;
    ctx.bus.emit('enemy:steal', { enemy: e, fish });
    C.floatText(C.raft.clone(), `${speciesOf(fish.speciesId)?.name || 'Fish'} stolen!`, 'bad');
    return fish;
  };
  C.onFishEscaped = (e) => {
    if (!e.carrying) return;
    ctx.bus.emit('toast', { text: `The ${e.name} slipped away with your ${speciesOf(e.carrying.speciesId)?.name || 'fish'}.`, kind: 'bad' });
  };
  let fullWarnT = 0;
  C.recoverFish = (fish, pos) => {
    let ok = false;
    try { ok = ctx.progression?.addToCreel?.(fish) === true; } catch (e) { C.report('addToCreel', e); }
    if (ok) { ctx.bus.emit('toast', { text: `Recovered your ${speciesOf(fish.speciesId)?.name || 'fish'}.`, kind: 'good' }); fx.burst(pos.x, 0.6, pos.z, lin(0x9fe8d8, 2), 12, 3, 0.14, 0.5); }
    else if (ctx.time.gameT > fullWarnT) { fullWarnT = ctx.time.gameT + 4; C.floatText(pos.clone(), 'Creel full', 'bad'); }
    return ok;
  };
  C.tipCreel = (n, pos) => {
    for (let i = 0; i < n; i++) {
      const f = randomStealable();
      if (!f) break;
      let fish = null;
      try { fish = ctx.progression?.removeFromCreel?.(f.uid); } catch { fish = null; }
      if (!fish || fish.isStub) break;
      const a = Math.random() * TAU;
      enemiesSys.floatFish(fish, pos.x + Math.cos(a) * 3.5, pos.z + Math.sin(a) * 3.5);
    }
  };

  // spawn ring (DESIGN §7.2 placement)
  C.placeOnRing = (out, waterBound, depthMin = 0, rMin, rMax, front) => {
    const cb = C.B?.combat || {};
    const ring = cb.spawnRing || [22, 34];
    const r0 = rMin ?? ring[0], r1 = rMax ?? ring[1];
    const w = ctx.world;
    const samples = cb.ringSamples ?? 12;
    for (let i = 0; i < samples; i++) {
      const behind = !front && Math.random() < (cb.behindShare ?? 0.35);
      const a = behind ? Math.random() * Math.PI : Math.PI + Math.random() * Math.PI;
      const r = r0 + Math.random() * (r1 - r0);
      const x = C.raft.x + Math.cos(a) * r, z = C.raft.z + Math.sin(a) * r;
      let ok = true;
      try {
        if (real(w)) {
          if (w.isOpenWater?.(x, z, 1) === false) ok = false;
          if (ok && depthMin > 0 && (w.getDepth?.(x, z) ?? 1) < depthMin) ok = false;
        }
      } catch { ok = true; }
      if (ok) { out.set(x, 0, z); return out; }
    }
    try {
      const p = real(w) ? w.randomWaterPoint?.({ from: C.raft, minDist: cb.fallbackMinDist ?? 18, maxDist: Math.max(r1, 60), clearance: 1, depthMin }) : null;
      if (p && Number.isFinite(p.x)) { out.set(p.x, 0, p.z); return out; }
    } catch { /* fall through */ }
    const a = Math.random() * TAU;
    out.set(C.raft.x + Math.cos(a) * r0, 0, C.raft.z + Math.sin(a) * r0);
    return out;
  };

  // ---------------------------------------------------------------- damage to enemies
  let hitEmits = 0, numTokens = 12, critTokens = 10;
  const crit2 = () => C.B?.combat?.crit?.mult ?? 2;
  C.knockEnemy = (e, dx, dz, dist) => {
    if (!e || !e.alive || e.boss || e.elite || e.latchSlot >= 0 || !(dist > 0)) return;
    const mass = e.behavior === 'bulwark' ? 0.45 : 1;
    e.knock.x += dx * dist * 6 * mass; e.knock.z += dz * dist * 6 * mass;
  };
  C.hitEnemy = (e, amount, o = {}) => {
    if (!e || !e.alive || e.invuln || !(amount > 0)) return 0;
    if (e.submerged && !o.force) return 0;
    if (e.damageFilter && !e.damageFilter(o)) {
      if (!o.aura && Math.random() < 0.3) fx.burst(e.position.x, 3, e.position.z, lin(0x9fe8ff, 1.6), 3, 2, 0.12, 0.3);
      return 0;
    }
    let dmg = amount;
    let crit = !!o.crit;
    if (!o.noCritRoll) { if (!crit && Math.random() < (C.stats.critChance || 0)) crit = true; if (crit) dmg *= crit2(); }
    if (e.chillT > 0) dmg *= 1 + C.chillVuln;
    if (e.staggerT > 0) dmg *= e.staggerMult || 1;
    e.hp -= dmg;
    e.hurt = Math.max(e.hurt, o.aura ? 0.05 + Math.random() * 0.08 : 0.85);
    if (!o.aura && e.creature) { try { e.creature.hit?.(); } catch { /* ignore */ } }
    if (o.stun && !e.boss && !e.elite) e.stun = Math.max(e.stun, o.stun);
    if (o.knock) C.knockEnemy(e, o.knockX || 0, o.knockZ || 0, o.knock);
    if (!o.aura || crit) {
      if (o.zap || hitEmits < 8) { hitEmits++; ctx.bus.emit('enemy:hit', { enemy: e, position: e.position, amount: dmg, crit }); }
    }
    damageNumber(e, dmg, crit, !!o.aura);
    if (e.hp <= 0) enemiesSys.kill(e, o.source || 'slain');
    return dmg;
  };
  const numPos = new THREE.Vector3();
  function damageNumber(e, dmg, crit, aura) {
    if (ctx.state.meta?.settings?.damageNumbers === false) return;
    if (!real(ctx.ui) || typeof ctx.ui.damageNumber !== 'function') return;
    if (crit) { if (critTokens < 1) return; critTokens--; }
    else { if (aura && dmg < 3) return; if (numTokens < 1) return; numTokens--; }
    numPos.set(e.position.x, (enemiesSys.MODEL_HOVER[e.kind] ?? 0.6) * e.scale + (e.y || 0) + 0.6 + e.radius, e.position.z);
    try { ctx.ui.damageNumber(numPos.clone(), Math.max(1, Math.round(dmg)), crit); } catch { /* optional */ }
  }

  // ---------------------------------------------------------------- deaths & rewards
  const night = { duskRate: -1, gloomT: 0, credit: 0, scoutCredit: 0, eliteNext: 0, formDone: [false, false], bossState: 'none', bossT: 0, kills: 0, nextDrip: 0, stragglerK: -1, stragglerDone: false, hush: 0 };
  const bursts = [];
  let bossRef = null;
  const xpScale = () => C.diff?.xpScale ?? 1;
  C.onEnemyDeath = (e, cause, drop) => {
    if (e.latchSlot >= 0) C.unlatch(e, false);
    if (e === bossRef) bossRef = null;
    if (e.warden) warden.onDeath(e);
    if (grip && grip.e === e) grip = null;
    const run = C.run;
    if (!run || cause === 'despawn' || cause === 'escape' || cause === 'zone' || cause === 'dawn') return;
    if (cause === 'contact') return;     // a burst on the raft is not a kill and drops nothing
    const S = C.stats;
    run.stats = run.stats || {};
    run.stats.enemiesSlain = (run.stats.enemiesSlain || 0) + 1;
    const meta = ctx.state.meta;
    if (meta) meta.totalSlain = (meta.totalSlain || 0) + 1;
    night.kills++;
    const p = e.position;
    ctx.bus.emit('enemy:slain', { enemy: e, position: p });
    const valueMult = C.zone?.valueMult ?? 1;
    if (e.boss) {
      run.stats.bossesSlain = (run.stats.bossesSlain || 0) + 1;
      bossReward(e);
    } else if (e.elite) {
      run.stats.elitesSlain = (run.stats.elitesSlain || 0) + 1;
      levels.drop(p.x, p.z, e.xp * xpScale(), { great: true });
      levels.oilMote(p.x, 2, p.z, e.def.oilDrop ?? C.B?.combat?.eliteOil ?? 15);
      C.giveShells((e.def.shells ?? 6) * valueMult);
      C.shake(0.25, 0.4);
      ctx.bus.emit('toast', { text: `${e.name} broken.`, kind: 'good' });
    } else if (drop) {
      levels.drop(p.x, p.z, e.xp * xpScale());
    }
    // oil drip: the first kill after every 15 s of night
    if (C.phase === 'gloomtide' && night.gloomT >= night.nextDrip) {
      const od = C.B?.combat?.oilDrips || { every: 15, base: 3, perZone: 1.5 };
      night.nextDrip = night.gloomT + (od.every ?? 15);
      levels.oilMote(p.x, 1, p.z, (od.base ?? 3) + (od.perZone ?? 1.5) * C.zoneIndex);
    }
    // sporeling death burst (chain pops)
    if (e.def.deathBurst) bursts.push({ x: p.x, z: p.z, r: e.def.deathBurst.radius ?? 2.2, dmg: (e.def.deathBurst.damage ?? 3) * (S.damageMult ?? 1), src: e.id });
    // Ashwick — Cinder Heart: every Nth kill in a night fires a free mini-flare
    const q = characterQuirk();
    if (q?.id === 'cinder_heart' && (C.phase === 'gloomtide' || C.phase === 'dusk') && night.kills % (q.every || 12) === 0) {
      C.flareBurst(C.raft.x, C.raft.z, q.radius ?? 5, q.damageMult ?? 0.5, { free: true, mini: true });
    }
    if (e.carrying) { enemiesSys.floatFish(e.carrying, p.x, p.z); e.carrying = null; }
  };
  function bossReward(e) {
    const run = C.run, p = e.position;
    const heal = C.B?.heal?.heartwax ?? 1;
    run.flags = run.flags || {};
    const before = run.flags.heartwax | 0;
    let handled = false;
    try { handled = ctx.progression?.grantHeartwax?.(e.enemyId) === true; } catch { handled = false; }
    if (!handled) run.flags.heartwax = before + 1;
    const gained = (run.flags.heartwax | 0) > before;
    if (gained) pendingHeal += heal;
    levels.queueGift();
    C.giveShells(e.def.shells ?? 40);
    levels.oilMote(p.x, 3, p.z, C.B?.combat?.wardenOil ?? 40);
    levels.drop(p.x, p.z, e.xp * xpScale(), { great: true });
    fx.timedDecal({ x: p.x, z: p.z, r0: 2, r1: 22, life: 2, color: lin(e.eye, 2), p1: 0.05 });
    fx.timedDecal({ x: p.x, z: p.z, r0: 1, r1: 14, life: 2.4, color: COL.flare, type: DECAL.GLOW, p1: 2, alpha: 0.5, ease: 3 });
    if (!ctx.state.meta?.settings?.reducedFlashing) ctx.render?.flash?.(0xfff0d0, 0.35, 0.8);
    night.bossState = 'done';
    ctx.bus.emit('boss:slain', { enemy: e });
    ctx.bus.emit('toast', { text: gained ? `${e.name} is silenced. Heartwax: +1 Ember.` : `${e.name} is silenced.`, kind: 'good' });
  }
  C.onEliteEscaped = (e) => { ctx.bus.emit('toast', { text: `The ${e.name} sinks away.`, kind: 'info' }); };
  let pendingHeal = 0;
  function processBursts() {
    let guard = 0;
    while (bursts.length && guard++ < 24) {
      const b = bursts.shift();
      fx.timedDecal({ x: b.x, z: b.z, r0: 0.3, r1: b.r, life: 0.35, color: lin(0xffb46a, 2), p1: 0.3, p2: 0.3 });
      fx.burst(b.x, 0.8, b.z, lin(0xffb46a, 2.4), 10, 4, 0.14, 0.4);
      for (let i = enemies.length - 1; i >= 0; i--) {
        const o = enemies[i];
        if (!o || o.id === b.src || o.boss || o.elite) continue;
        if (Math.hypot(o.position.x - b.x, o.position.z - b.z) <= b.r + o.radius) C.hitEnemy(o, b.dmg, { noCritRoll: true, source: 'sporeburst' });
      }
    }
  }

  // ---------------------------------------------------------------- flare
  let flareCd = 0, flareTotal = 1, denyT = 0;
  const flarePos = new THREE.Vector3();
  C.staggerHand = (e) => {
    const fs = e.def.flareStagger || {};
    e.state = 'stagger'; e.stateT = 0; e.a = fs.time ?? 2; e.staggerMult = fs.damageTaken ?? 1.5; e.staggerT = e.a;
    e.invuln = false; e.targetable = true; e.y = 0; e.n = 0;
    fx.burst(e.position.x, 2.5, e.position.z, COL.gold, 24, 5, 0.2, 0.7);
    ctx.audio?.play?.('enemy_hit', { volume: 1, pitch: 0.6 });
    C.floatText(v3.set(e.position.x, 4, e.position.z).clone(), 'Staggered!', 'good');
  };
  C.flareBurst = (x, z, radius, dmgMult = 1, o = {}) => {
    const fl = C.B?.combat?.flare || {};
    const S = C.stats;
    const g = data().weaponScale?.(C.run?.level || 1) ?? 1;
    const base = (fl.damage ?? 10) * g * (S.damageMult ?? 1) * dmgMult;
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (!e || !e.alive) continue;
      const dx = e.position.x - x, dz = e.position.z - z, d = Math.hypot(dx, dz) || 1;
      if (d > radius + e.radius) continue;
      if (e.behavior === 'slam' && (e.state === 'stain' || e.state === 'breach') && !o.mini) C.staggerHand(e);
      if (e.latchSlot >= 0 && (fl.clearsLatched ?? true)) C.unlatch(e, false);
      if (e.invuln || (e.submerged && !e.def.flies && e.behavior !== 'leap')) continue;
      const pct = e.boss ? (fl.bossHpPct ?? 0.03) : (fl.maxHpPct ?? 0.15);
      const amt = base + e.maxHp * pct * dmgMult;
      C.hitEnemy(e, amt, { knockX: dx / d, knockZ: dz / d, knock: (fl.knock ?? 6) * (o.mini ? 0.5 : 1), stun: (fl.stun ?? 1.5) * (o.mini ? 0.5 : 1), source: o.source || 'flare', force: e.behavior === 'leap' });
    }
    // VFX: an expanding ring of light on the water, a pool flash, sparks from the lantern
    const L = C.lantern;
    fx.timedDecal({ x, z, r0: 0.6, r1: radius, life: 0.55, color: COL.flareRing, p1: 0.07, p2: 0.06, alpha: 0.9 });
    fx.timedDecal({ x, z, r0: radius * 0.6, r1: radius * 1.15, life: 0.9, color: COL.flareRing, type: DECAL.DASHRING, p1: 0.03, p2: 28, ease: 3, alpha: 0.7 });
    if (o.mini) fx.timedDecal({ x, z, r0: radius * 0.5, r1: radius * 1.05, life: 0.5, color: COL.flare, type: DECAL.GLOW, p1: 2.2, alpha: 0.12, ease: 3 });
    const n = o.mini ? 18 : 46;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + Math.random() * 0.2, sp = radius * (1.1 + Math.random() * 0.6);
      fx.sparks.emit(L.x, L.y, L.z, Math.cos(a) * sp, 1 + Math.random() * 3, Math.sin(a) * sp, COL.flare.r, COL.flare.g, COL.flare.b, 0.2 + Math.random() * 0.15, 0.55 + Math.random() * 0.3, 1, -0.2, 2.2, -3);
    }
    fx.burst(L.x, L.y, L.z, COL.flare, o.mini ? 6 : 12, 2, 0.25, 0.45, 3, -1);
    ctx.water?.addRipple?.(x, z, o.mini ? 1.2 : 2.5);
  };
  function flare() {
    const run = C.run;
    if (!run || ctx.flow !== 'playing' || ctx.paused) return false;
    const S = C.stats;
    const deny = (msg) => {
      if (ctx.time.t < denyT) return false;
      denyT = ctx.time.t + 0.6;
      try { ctx.audio?.play?.('denied'); } catch { /* ignore */ }
      if (msg) C.floatText(C.lantern.clone(), msg, 'bad');
      return false;
    };
    if (flareCd > 0) return deny(null);
    if ((run.oil ?? 0) <= 0) return deny('No light to flare');
    let charges = 0, where = null;
    if ((run.flags?.flareCharges || 0) > 0) { charges = run.flags.flareCharges; where = 'flags'; }
    else if ((run.flareCharges || 0) > 0) { charges = run.flareCharges; where = 'run'; }
    const cost = S.flareCost ?? 16;
    if (!charges && (run.oil ?? 0) < cost) return deny('Not enough oil');
    if (charges) { if (where === 'flags') run.flags.flareCharges--; else run.flareCharges--; }
    else C.addOil(-cost);
    flareTotal = Math.max(0.5, (S.flareCooldown ?? 16) * (S.cooldownMult ?? 1));
    flareCd = flareTotal;
    fullFlare();
    return true;
  }
  function fullFlare() {
    const S = C.stats, fl = C.B?.combat?.flare || {};
    flareBoostT = fl.boostTime ?? 3;
    try { (ctx.survival?.grantIframes || ctx.survival?.addIframes)?.call(ctx.survival, fl.iframes ?? 0.3); } catch { /* optional */ }
    const R = S.flareRadius ?? 10;
    C.flareBurst(C.raft.x, C.raft.z, R, 1, {});
    if (!ctx.state.meta?.settings?.reducedFlashing) { try { ctx.render?.flash?.(0xffe2b0, 0.1, 0.2); } catch { /* optional */ } }
    ctx.bus.emit('flare', { position: flarePos.copy(C.raft), radius: R });
  }

  // ---------------------------------------------------------------- zap
  let zapCd = 0;
  const proj = new THREE.Vector3();
  function pickEnemy(ndc) {
    const cam = ctx.render?.camera;
    if (!cam || !cam.isCamera) return null;
    const W = innerWidth, H = innerHeight;
    const px = (ndc.x * 0.5 + 0.5) * W, py = (-ndc.y * 0.5 + 0.5) * H;
    const zc = C.B?.combat?.zap || {};
    const pick = ctx.isMobile ? (zc.pickPxTouch ?? 56) : (zc.pickPx ?? 48);
    const range = zc.range ?? 26;
    const focal = H / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov || 50) / 2));
    let best = null, bestD = Infinity;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e.alive || !e.targetable || e.invuln || e.submerged) continue;
      if (e.behavior === 'stalk' && !e.inLight && !(e.revealT > 0)) continue;
      if (Math.hypot(e.position.x - C.raft.x, e.position.z - C.raft.z) > range) continue;
      const hy = (enemiesSys.MODEL_HOVER[e.kind] ?? 0.5) * e.scale + (e.y || 0) + (e.kind === 'hand' ? 1.6 * e.scale : e.kind === 'warden' ? 3 * e.scale : 0.1);
      proj.set(e.position.x, hy, e.position.z);
      const camD = proj.distanceTo(cam.position);
      proj.project(cam);
      if (proj.z > 1 || proj.z < -1) continue;
      const sx = (proj.x * 0.5 + 0.5) * W, sy = (-proj.y * 0.5 + 0.5) * H;
      const body = (e.radius * (e.kind === 'hand' || e.kind === 'warden' ? 1.3 : 0.8)) / Math.max(1, camD) * focal;
      const d = Math.hypot(sx - px, sy - py) - body;
      if (d < pick && d < bestD) { bestD = d; best = e; }
    }
    return best;
  }
  function onPointerDown(ndc) {
    const run = C.run;
    if (!run || ctx.flow !== 'playing' || ctx.paused || !ndc) return false;
    let e = null;
    try { e = pickEnemy(ndc); } catch (err) { C.report('pick', err); return false; }
    if (!e) return false;
    if (zapCd > 0) return true;
    doZap(e);
    return true;
  }
  function doZap(e) {
    const run = C.run, S = C.stats, zc = C.B?.combat?.zap || {};
    const dk = C.B?.damage?.darkness || {};
    zapCd = zc.cooldown ?? 0.2;
    const cost = S.zapCost ?? 1;
    let mult = 1, wax = false;
    if ((run.oil ?? 0) >= cost) C.addOil(-cost);
    else if ((run.oil ?? 0) > 0) C.addOil(-run.oil);
    else { wax = true; mult = dk.waxZapDamage ?? 0.5; try { ctx.survival?.addSatiety?.(-(dk.waxZapSatiety ?? 4)); } catch { /* ignore */ } }
    const g = data().weaponScale?.(run.level || 1) ?? 1;
    let dmg = (S.zapDamage ?? 6) * g * (S.damageMult ?? 1) * mult;
    if (e.airborne) dmg *= zc.airborneMult ?? e.def.zapAirborneMult ?? 2;
    dmg *= e.zapTaken || 1;
    if (e.chargeT > 0) {
      const sg = weapons.list.find((w) => w.p?.charge);
      dmg *= sg?.p.charge.zapMult ?? 3; e.chargeT = 0;
      fx.burst(e.position.x, 1, e.position.z, lin(0xbfe4ff, 3), 16, 5, 0.16, 0.4);
    }
    if (e.latchSlot >= 0) { C.unlatch(e, true); C.addOil(e.def.latchedRefund ?? zc.latchedRefund ?? 1); }
    if (e.behavior === 'slam' && e.state === 'breach') { e.zaps++; if (e.zaps >= (e.def.zapStagger ?? 3)) C.staggerHand(e); }
    if (grip && grip.e === e) { grip.zaps++; C.floatText(C.raft.clone(), `${grip.zaps}/${grip.need}`, 'good'); }
    const L = C.lantern;
    const hy = (enemiesSys.MODEL_HOVER[e.kind] ?? 0.5) * e.scale + (e.y || 0) + (e.kind === 'hand' ? 1.4 : e.kind === 'warden' ? 3 : 0.1);
    fx.bolt(L.x, L.y, L.z, e.position.x, hy, e.position.z, wax ? lin(0xc8b8a0, 2) : COL.zap, { width: 0.16, life: 0.2, jag: 0.6 });
    fx.bolt(L.x, L.y, L.z, e.position.x, hy, e.position.z, COL.zapGlow, { width: 0.07, life: 0.14, jag: 1.1 });
    fx.burst(e.position.x, hy, e.position.z, COL.zap, 10, 4, 0.13, 0.32, 1.5, -4);
    fx.timedDecal({ x: e.position.x, z: e.position.z, r0: 0.3, r1: 1.6, life: 0.3, color: COL.zapGlow, p1: 0.3, alpha: 0.8 });
    fx.burst(L.x, L.y, L.z, COL.zapGlow, 4, 1.5, 0.15, 0.2, 0.5, 0);
    const dx = e.position.x - C.raft.x, dz = e.position.z - C.raft.z, d = Math.hypot(dx, dz) || 1;
    try { ctx.actors?.pointAt?.(Math.atan2(-dx, -dz)); ctx.actors?.setPose?.('zap'); } catch { /* optional */ }
    C.hitEnemy(e, dmg, { stun: zc.stun ?? 0.25, knockX: dx / d, knockZ: dz / d, knock: zc.knock ?? 1.2, zap: true, source: 'zap' });
  }

  // ---------------------------------------------------------------- aura (lantern burn)
  let auraAcc = 0, fastT = 0, fannedK = 0;
  function characterQuirk() { const id = C.run?.character; const ch = id ? (data().CHARACTER_BY_ID?.[id] || (data().CHARACTERS || []).find((c) => c.id === id)) : null; return ch?.quirk || null; }
  function auraMult() {
    let m = C.veilAura;
    if (C.lineProc?.auraMult) m *= C.lineProc.auraMult;
    const q = characterQuirk();
    if (q?.id === 'fanned_flame') m *= 1 + ((q.auraMult ?? 1.3) - 1) * fannedK;
    return m;
  }
  function updateFanned(dt) {
    const q = characterQuirk();
    if (q?.id !== 'fanned_flame') { fannedK = 0; return; }
    const fast = C.raftSpeed >= (q.speedFrac ?? 0.8) * (C.stats.moveSpeed || 6);
    fastT = fast ? fastT + dt : 0;
    if (fastT >= (q.after ?? 1.5)) fannedK = 1;
    else if (!fast) fannedK = Math.max(0, fannedK - dt / (q.fade ?? 1));
  }
  function aura(dt, t) {
    const tick = C.B?.combat?.auraTick ?? 0.25;
    auraAcc += dt;
    if (C.lanternOut) { auraAcc = 0; return; }
    const S = C.stats, L = C.light;
    const R = C.lightR;
    // the light's edge — the "cinder line" — faintly inked during the night
    if ((C.phase !== 'calm' || enemies.length) && !(ctx.actors?.lightPool instanceof THREE.Object3D)) {
      fx.decalsG.add(C.raft.x, C.raft.z, R, R, 0, DECAL.DASHRING, COL.edge.r, COL.edge.g * 0.8, COL.edge.b * 0.5, 0.16, 0.012, Math.round(R * 4), t * 0.05);
    }
    if (auraAcc < tick) return;
    auraAcc -= tick;
    if (auraAcc > tick) auraAcc = 0;
    const dps = (S.auraDps ?? 2) + (gutsT > 0 ? (gutsP?.auraDps || 0) : 0);
    if (!(dps > 0)) return;
    const per = dps * ((L.floorAura ?? 0.3) + (1 - (L.floorAura ?? 0.3)) * C.oilFrac) * (S.damageMult ?? 1) * tick * auraMult();
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (!e || !e.alive || e.invuln || e.submerged) continue;
      const d = Math.hypot(e.position.x - C.raft.x, e.position.z - C.raft.z);
      if (d > R + e.radius * 0.5) continue;
      const taken = e.latchSlot >= 0 ? (e.def.auraTakenLatched ?? 0.5) : (e.auraTaken ?? 1);
      // visible burn: embers lift off whatever the light touches
      const hy = (enemiesSys.MODEL_HOVER[e.kind] ?? 0.5) * e.scale + (e.y || 0);
      const nb = e.boss ? 6 : e.elite ? 4 : 2;
      for (let k = 0; k < nb; k++) {
        const ox = (Math.random() - 0.5) * e.radius * 1.6, oz = (Math.random() - 0.5) * e.radius * 1.6;
        const c = Math.random() < 0.3 ? COL.burnHot : COL.burn;
        fx.sparks.emit(e.position.x + ox, hy + Math.random() * e.radius, e.position.z + oz, ox * 0.5, 1.2 + Math.random() * 1.4, oz * 0.5, c.r, c.g, c.b, 0.12 + Math.random() * 0.08, 0.45 + Math.random() * 0.35, 1, -0.12, 1.5, 0.6);
      }
      C.hitEnemy(e, per * taken, { aura: true, source: 'aura' });
    }
  }

  // ---------------------------------------------------------------- director
  const spawnPt = new THREE.Vector3();
  const aliveCount = new Map();
  function countAlive() {
    aliveCount.clear();
    let n = 0;
    for (const e of enemies) { if (e.boss) continue; n++; aliveCount.set(e.enemyId, (aliveCount.get(e.enemyId) || 0) + 1); }
    return n;
  }
  function packSize(def) {
    const H = C.diff?.heat ?? 0;
    let n = def.pack || 1;
    if (def.packPerHeat) n = Math.floor(n + def.packPerHeat * H);
    if (def.packMax) n = Math.min(def.packMax, n);
    return Math.max(1, n);
  }
  function kindCap(def) {
    if (!def.maxAlive) return Infinity;
    const H = C.diff?.heat ?? 0;
    return def.maxAlive + Math.floor((def.maxAlivePerHeat || 0) * H);
  }
  function spawnPack(id, opts = {}) {
    const def = data().ENEMY_BY_ID?.[id];
    if (!def) return 0;
    const n = opts.count ?? packSize(def);
    const center = opts.at ? spawnPt.copy(opts.at) : C.placeOnRing(spawnPt, def.waterBound, def.depthMin || 0, opts.rMin, opts.rMax, opts.front);
    const pack = n > 1 ? enemiesSys.nextPack() : 0;
    const spread = C.B?.combat?.packSpread ?? 2.5;
    let made = 0;
    const cx = center.x, cz = center.z;
    for (let i = 0; i < n; i++) {
      let x = cx, z = cz;
      if (i > 0) {
        const a = Math.random() * TAU, r = Math.sqrt(Math.random()) * spread;
        x = cx + Math.cos(a) * r; z = cz + Math.sin(a) * r;
        if (def.waterBound && ctx.world?.isOpenWater?.(x, z, 0.5) === false) { x = cx; z = cz; }
      }
      const e = enemiesSys.spawn(id, x, z, { packId: pack, packIdx: i, silent: i > 0, speedMult: opts.speedMult, dirX: opts.dirX, dirZ: opts.dirZ, tide: opts.tide, force: opts.force });
      if (e) made++;
    }
    return made;
  }
  function pickKind(list, alive, maxAlive) {
    let tot = 0;
    for (const k of list) {
      const def = data().ENEMY_BY_ID?.[k.id];
      if (!def || (aliveCount.get(k.id) || 0) >= kindCap(def)) continue;
      if (def.behavior === 'leap' && !(C.run?.creel?.length) && Math.random() < 0.5) continue;
      if (alive + packSize(def) > maxAlive) continue;
      tot += k.w;
    }
    if (tot <= 0) return null;
    let r = Math.random() * tot;
    for (const k of list) {
      const def = data().ENEMY_BY_ID?.[k.id];
      if (!def || (aliveCount.get(k.id) || 0) >= kindCap(def) || alive + packSize(def) > maxAlive) continue;
      r -= k.w;
      if (r <= 0) return def;
    }
    return null;
  }
  function wardenAlive() { return !!bossRef && bossRef.alive; }
  function resetNight() {
    night.gloomT = 0; night.credit = 0; night.scoutCredit = 0; night.formDone = [false, false]; night.bossState = 'none'; night.bossT = 0;
    night.kills = 0; night.nextDrip = 0; night.hush = 0;
    const L = C.diff?.gloomtide || data().gloomtideLength?.(C.day) || 90;
    night.eliteNext = (C.diff?.eliteFirstAt ?? 0.25) * L;
  }
  function director(dt) {
    const run = C.run;
    const cb = C.B?.combat || {};
    const D = C.diff;
    if (!run || !D) return;
    const maxLive = cb.maxLive ?? 150;
    if (C.phase === 'dusk') {
      const du = cb.dusk || { rateMult: 0.3, maxAlive: 6, kinds: ['gloomling'] };
      let alive = countAlive();
      if (alive >= (du.maxAlive ?? 6)) return;
      if (!(night.duskRate >= 0)) {
        try { night.duskRate = data().difficultyFor(C.day, C.zoneIndex, 0.5, { nightInZone: nightInZone() }).spawnRate * (du.rateMult ?? 0.3); } catch { night.duskRate = 0.2; }
      }
      const rate = night.duskRate;
      night.scoutCredit = Math.min(3, night.scoutCredit + rate * dt);
      if (night.scoutCredit >= 1) {
        const kinds = (du.kinds || ['gloomling']).filter((id) => D.kinds?.some((k) => k.id === id));
        const list = kinds.map((id) => D.kinds.find((k) => k.id === id));
        const def = pickKind(list.length ? list : [{ id: 'gloomling', w: 1 }], alive, du.maxAlive ?? 6);
        if (def) { const n = spawnPack(def.id); night.scoutCredit -= Math.max(1, n); } else night.scoutCredit = 0;
      }
      return;
    }
    if (C.phase === 'calm') {
      // calm straggler: one Creelsnatch raid per calm (deeper lakes or later days), only if the creel holds fish
      const sg = cb.stragglers || {};
      if (night.stragglerK < 0) { const w = sg.window || [0.3, 0.8]; night.stragglerK = w[0] + Math.random() * (w[1] - w[0]); night.stragglerDone = false; }
      const eligible = (C.zoneIndex >= (sg.fromZone ?? 1) || C.day >= (sg.fromDay ?? 5)) && (run.creel?.length || 0) > 0;
      if (eligible && !night.stragglerDone && C.phaseK >= night.stragglerK) {
        night.stragglerDone = true;
        spawnPack(sg.kind || 'creelsnatch', { count: 1 });
      }
      return;
    }
    if (C.phase !== 'gloomtide') return;
    night.gloomT += dt;
    const k = C.phaseK;
    const N = cb.night || {};
    const quiet = k >= (N.quietFrom ?? 0.93);
    const fState = ctx.fishing?.state;
    const hooked = HOOKED.has(fState);
    const legend = hooked && ctx.fishing?.view?.rarity === 'legendary';
    let bait = null;
    try { bait = data().BAIT_BY_ID?.[run.equippedBait]; } catch { bait = null; }
    const mult = (C.lanternOut ? (C.B?.damage?.darkness?.spawnMult ?? 1.3) : 1) * (hooked ? (cb.reelingRateMult ?? 0.8) : 1) * (legend ? (cb.legendFightRateMult ?? 0.65) : 1)
      * (wardenAlive() ? (cb.director?.bossRateMult ?? 0.6) : 1) * (1 + (bait?.gloomDraw || 0));
    night.credit = Math.min(10, night.credit + (D.spawnRate || 0) * dt * mult);
    let alive = countAlive();
    let guard = 0;
    while (night.credit >= 1 && guard++ < 12 && alive < maxLive) {
      const def = pickKind(D.kinds || [], alive, Math.min(D.maxAlive || 30, maxLive));
      if (!def) break;
      const n = spawnPack(def.id);
      if (!n) break;
      night.credit -= n; alive += n;
      for (let i = 0; i < n; i++) aliveCount.set(def.id, (aliveCount.get(def.id) || 0) + 1);
    }
    // elites (Drowned Hand) on their timer; paused while a Warden lives
    const legendBlocks = legend && (cb.legendPausesElites ?? false);
    if (D.eliteEvery > 0 && !quiet && !wardenAlive() && !legendBlocks && night.gloomT >= night.eliteNext) {
      night.eliteNext = night.gloomT + D.eliteEvery;
      const list = D.elites?.length ? D.elites : [{ id: 'drowned_hand', w: 1 }];
      const pick = list[(Math.random() * list.length) | 0];
      spawnElite(pick.id);
    }
    // formations at k = 0.35 / 0.65 (skipped on boss nights and while a Warden lives)
    const fa = D.formationAt || [];
    for (let i = 0; i < fa.length && i < 2; i++) {
      if (night.formDone[i] || k < fa[i]) continue;
      night.formDone[i] = true;
      if (wardenAlive() || (D.boss && night.bossState !== 'done') || quiet) continue;
      spawnFormation();
    }
    // Warden: banner at bossAt, rises 3 s later
    if (D.boss && night.bossState === 'none' && k >= (D.bossAt ?? 0.35) && !quiet) {
      const def = data().ENEMY_BY_ID?.[D.boss];
      const blocked = def?.neverDuringLegend && hooked && ctx.fishing?.view?.speciesId === def.neverDuringLegend;
      if (def && !blocked) {
        night.bossState = 'banner'; night.bossT = 3;
        const bb = data().TEXT?.bossBanner || ['{name}', 'A Warden rises from the Gloom'];
        try { ctx.ui?.banner?.(bb[0].replace('{name}', def.name), bb[1]); } catch { /* optional */ }
        ctx.audio?.play?.('gloom_rise', { volume: 0.8, pitch: 0.6 });
      }
    }
    if (night.bossState === 'banner') {
      night.bossT -= dt;
      if (night.bossT <= 0) { night.bossState = 'risen'; spawnBoss(D.boss); }
    }
  }
  function spawnElite(id) {
    const def = data().ENEMY_BY_ID?.[id];
    if (!def) return null;
    const e = enemiesSys.spawn(id, C.raft.x, C.raft.z, { force: true });
    const mods = def.zoneMods?.[C.zoneId];
    if (mods?.pair) enemiesSys.spawn(id, C.raft.x, C.raft.z, { force: true, delay: mods.pairGap ?? 1, silent: true });
    return e;
  }
  function spawnBoss(id) {
    const def = data().ENEMY_BY_ID?.[id];
    if (!def) return null;
    C.placeOnRing(spawnPt, false, 0, 12, 17, true);
    if (Math.hypot(spawnPt.x - C.raft.x, spawnPt.z - C.raft.z) > 20) C.placeOnRing(spawnPt, false, 0, 11, 18, false);
    const e = enemiesSys.spawn(id, spawnPt.x, spawnPt.z, { force: true, silent: true });
    if (!e) return null;
    bossRef = e;
    ctx.bus.emit('enemy:spawn', { enemy: e });
    ctx.bus.emit('boss:spawn', { enemy: e });   // render owns the boss-rise shake
    ctx.water?.splash?.(e.position.x, e.position.z, { size: 3, count: 40 });
    return e;
  }
  function formationAvailable(f) {
    const z = C.zoneIndex;
    if (z < (f.zoneMin ?? 0)) return false;
    if (z === (f.zoneMin ?? 0) && C.day < (f.dayMin ?? 1)) return false;
    if (z === 0 && f.zone0DayMin && C.day < f.zone0DayMin) return false;
    if (z === 0 && (f.zoneMin ?? 0) > 0 && !f.zone0DayMin) return false;
    return true;
  }
  function spawnFormation(forceId) {
    const list = (data().FORMATIONS || []).filter((f) => forceId ? f.id === forceId : formationAvailable(f));
    if (!list.length) return null;
    let tot = 0;
    for (const f of list) tot += f.weight || 1;
    let r = Math.random() * tot, f = list[0];
    for (const q of list) { r -= q.weight || 1; if (r <= 0) { f = q; break; } }
    const H = C.diff?.heat ?? 0;
    const cnt = (c) => !c ? 1 : c.min != null ? c.min + Math.floor(Math.random() * ((c.max ?? c.min) - c.min + 1)) : Math.floor((c.base || 0) + (c.perHeat || 0) * H + (c.perHeatHalf || 0) * Math.floor(H / 2));
    const enemy = f.enemyByZone?.[C.zoneId] || f.enemy;
    const raft = C.raft;
    try { ctx.ui?.banner?.(f.name, f.banner); } catch { /* optional */ }
    const at = new THREE.Vector3();
    switch (f.id) {
      case 'encircle': {
        const n = Math.min(40, cnt(f.count));
        const R = f.ringRadius || 18;
        const pack = enemiesSys.nextPack();
        for (let i = 0; i < n; i++) {
          const a = (i / n) * TAU;
          const x = raft.x + Math.cos(a) * R, z = raft.z + Math.sin(a) * R;
          if (ctx.world?.isOpenWater?.(x, z, 0.8) === false) continue;
          enemiesSys.spawn(enemy, x, z, { force: true, silent: i > 0, packId: data().ENEMY_BY_ID?.[enemy]?.pack > 1 ? pack : 0, packIdx: i % 3 });
        }
        break;
      }
      case 'tide': {
        const packs = f.packs ? f.packs[0] + Math.floor(Math.random() * (f.packs[1] - f.packs[0] + 1)) : 3;
        const size = Math.min(26, cnt(f.packSize));
        const a = Math.random() * TAU;
        const dx = Math.cos(a), dz = Math.sin(a);
        const bw = f.bandWidth || 24;
        for (let i = 0; i < packs; i++) {
          const off = (i / Math.max(1, packs - 1) - 0.5) * bw;
          at.set(raft.x - dx * 28 + -dz * off, 0, raft.z - dz * 28 + dx * off);
          ctx.world?.collide?.(at, 1);
          spawnPack(enemy, { at, count: Math.max(1, Math.round(size / packs)), speedMult: f.speedMult || 1.25, dirX: dx, dirZ: dz, tide: 9, force: true });
        }
        break;
      }
      case 'dimming': {
        const n = Math.min(14, cnt(f.count));
        const a = Math.random() * TAU;
        for (let i = 0; i < n; i++) {
          const aa = a + (Math.random() - 0.5) * 0.7, rr = 20 + Math.random() * 6;
          enemiesSys.spawn(enemy, raft.x + Math.cos(aa) * rr, raft.z + Math.sin(aa) * rr, { force: true, silent: i > 0 });
        }
        break;
      }
      case 'volley': {
        const n = cnt(f.count) || 3;
        const R = f.ringRadius || 16, a0 = Math.random() * TAU;
        for (let i = 0; i < n; i++) {
          const a = a0 + (i / n) * TAU;
          at.set(raft.x + Math.cos(a) * R, 0, raft.z + Math.sin(a) * R);
          ctx.world?.collide?.(at, 1);
          enemiesSys.spawn(enemy, at.x, at.z, { force: true, silent: i > 0 });
        }
        break;
      }
      case 'procession': {
        const n = cnt(f.count);
        const a = Math.random() * TAU, dx = Math.cos(a), dz = Math.sin(a);
        for (let i = 0; i < n; i++) {
          at.set(raft.x + dx * 24 + -dz * (i - n / 2) * 2.6, 0, raft.z + dz * 24 + dx * (i - n / 2) * 2.6);
          ctx.world?.collide?.(at, 1);
          enemiesSys.spawn(enemy, at.x, at.z, { force: true, silent: i > 0 });
        }
        if (f.escort) spawnPack(f.escort, { at: at.set(raft.x + dx * 27, 0, raft.z + dz * 27), force: true });
        break;
      }
      case 'hush': {
        const trios = f.count?.trios || 3;
        for (let i = 0; i < trios; i++) spawnPack(enemy, { count: 3, force: true });
        if (f.lightMult) C.addDim('hush', f.lightMult, f.duration || 8);
        break;
      }
      default: {
        const n = cnt(f.count);
        for (let i = 0; i < n; i++) spawnPack(enemy, { count: 1, force: true });
      }
    }
    return f;
  }

  // ---------------------------------------------------------------- lifecycle
  function clearAll() {
    enemiesSys.clear(); warden.clear(); weapons.clear(); levels.clearCinders(); fx.clear();
    for (let i = 0; i < 4; i++) latched[i] = null;
    for (const k in dims) dims[k].t = 0;
    bursts.length = 0; bossRef = null; grip = null; pKnock.set(0, 0, 0);
    flareBoostT = 0; gutsT = 0;
  }
  function killAll(reason = 'killAll') {
    const dawn = reason === 'dawn';
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (!e?.alive) continue;
      if (e.boss && dawn) { warden.withdraw(e); continue; }
      if (e.carrying && dawn) { enemiesSys.floatFish(e.carrying, e.position.x, e.position.z); e.carrying = null; }
      const drop = reason === 'debug';
      enemiesSys.kill(e, drop ? 'slain' : reason, { drop });
    }
    if (dawn) levels.collectAll();
  }
  let hadRun = false, lastRunId = null;
  function onRunStart({ continued } = {}) {
    clearAll();
    levels.reset();
    C.run = ctx.state.run;
    const run = C.run;
    if (!run) return;
    hadRun = true; lastRunId = run.id;
    levels.ensureRunFields(run);
    zoneInfo(); refreshStats(true); phaseInfo(); refreshDiff(true); resetNight();
    weapons.sync();
    flareCd = 0; zapCd = 0;
    night.stragglerK = -1;
    const pend = run.flags?.pendingPicks | 0;
    if (continued && pend > 0) levels.restorePending(Math.min(pend, 20));
    else if (!continued) {
      const banked = run.flags?.bankedLevels ?? run.flags?.kindlingDraft ?? 0;
      if (banked > 0) { levels.queueDraft(banked | 0); run.flags.bankedLevels = 0; run.flags.kindlingDraft = 0; }
    }
  }

  function update(dt, t) {
    const run = ctx.state.run;
    if (!run) { if (hadRun) { clearAll(); levels.reset(); hadRun = false; C.run = null; } return; }
    if (run !== C.run) {
      // a run appeared without run:start (e.g. created while combat was inert) — adopt it
      if (run.id !== lastRunId) onRunStart({ continued: true });
      C.run = run;
    }
    hitEmits = 0;
    if (!(dt > 0)) { levels.update(0, t); return; }
    numTokens = Math.min(12, numTokens + dt * 14);
    critTokens = Math.min(10, critTokens + dt * 18);
    C.B = data().BALANCE || {};
    C.light = C.B.light || {};
    C.contactRadius = C.B.damage?.contactRadius ?? 1.8;
    C.sepDist = C.B.combat?.separation ?? 0.9;
    refreshStats(); zoneInfo(); phaseInfo(); refreshDiff(false); refreshRaft(dt);
    try { const o = ctx.world?.getObstacles?.(); C.obstacles = Array.isArray(o) ? o : []; } catch { C.obstacles = []; }
    C.veilAura = 1; C.inSlick = false;
    C.eclipse = Math.max(0, C.eclipse - dt);
    if (pendingHeal > 0 && C.canHurtPlayer()) { const h = pendingHeal; pendingHeal = 0; try { ctx.survival?.heal?.(h); } catch { /* ignore */ } }
    flareCd = Math.max(0, flareCd - dt); zapCd = Math.max(0, zapCd - dt);
    updateFanned(dt);
    // Lantern on the Line: while a fish is hooked at dusk / night
    C.lineProc = null;
    const lotl = run.boons?.lantern_on_the_line | 0;
    if (lotl > 0 && HOOKED.has(ctx.fishing?.state)) {
      const b = data().BOON_BY_ID?.lantern_on_the_line;
      const pr = b?.proc;
      if (pr && (pr.phases || ['dusk', 'gloomtide']).includes(C.phase)) C.lineProc = pr.levels?.[Math.min(lotl, pr.levels.length) - 1] || null;
    }
    refreshLight(dt);

    fx.begin();
    try { director(dt); } catch (e) { C.report('director', e); }
    try { enemiesSys.update(dt, t); } catch (e) { C.report('enemies.update', e); }
    try { processBursts(); } catch (e) { C.report('bursts', e); }
    try { warden.updateGlobal(dt, t); } catch (e) { C.report('warden', e); }
    try { aura(dt, t); } catch (e) { C.report('aura', e); }
    try { weapons.update(dt, t); } catch (e) { C.report('weapons', e); }
    try { levels.update(dt, t); } catch (e) { C.report('levels', e); }
    try { updatePlayerEffects(dt, t); } catch (e) { C.report('player fx', e); }
    try { enemiesSys.render(dt, t); } catch (e) { C.report('enemies.render', e); }
    fx.end(dt, t);
  }

  // ---------------------------------------------------------------- debug & threat
  const KIND_TO_ID = { wisp: 'gloomling', mite: 'inkmite', moth: 'duskmantle', eel: 'creelsnatch', hand: 'drowned_hand' };
  function debugSpawn(idOrKind = 'gloomling', n = 1, dist) {
    if (!C.run) return [];
    const run = C.run;
    if (!C.diff) { zoneInfo(); phaseInfo(); refreshDiff(true); }
    let id = idOrKind;
    if (id === 'warden' || id === 'boss') id = C.zone?.warden || 'the_wickeater';
    if (KIND_TO_ID[id]) id = KIND_TO_ID[id];
    const def = data().ENEMY_BY_ID?.[id];
    if (!def) return [];
    const before = new Set(enemies);
    void run;
    for (let i = 0; i < n; i++) {
      if (def.elite) spawnElite(id);
      else if (def.boss) { const e = spawnBoss(id); if (e) e.warden.rise = 1.2; }
      else spawnPack(id, { rMin: dist ?? 11, rMax: (dist ?? 11) + 5, front: true, force: true });
    }
    return enemies.filter((e) => !before.has(e));
  }
  function getThreat() {
    const S = C.stats, D = C.diff || {};
    const g = data().ENEMY_BY_ID?.gloomling || { hp: 4, speed: 2.6 };
    const hp = g.hp * (D.hpMult ?? 1);
    const dps = (S.auraDps ?? 2) * (0.3 + 0.7 * C.oilFrac) * (S.damageMult ?? 1) * auraMult();
    const cross = C.lightR / Math.max(0.1, g.speed * (D.speedMult ?? 1) * (C.light.insideSlow ?? 0.75));
    const ttk = dps > 0 ? hp / dps : Infinity;
    return { R: +(ttk / cross).toFixed(2), timeToKill: +ttk.toFixed(2), timeToCross: +cross.toFixed(2), heat: D.heat ?? 0, lightR: +C.lightR.toFixed(2), oilFrac: +C.oilFrac.toFixed(2), alive: enemies.length };
  }

  // ---------------------------------------------------------------- API
  const api = {
    enemies,
    get pendingOptions() { return levels.pendingOptions; },
    get level() { return ctx.state.run?.level || 1; },
    get xp() { return ctx.state.run?.xp || 0; },
    get xpNext() { return ctx.state.run?.xpNext || (data().xpForLevel?.(ctx.state.run?.level || 1) ?? 5); },
    get pendingCount() { return levels.pendingCount; },
    get lightMult() { return lightDims * flareBoost; },
    get lightDims() { return lightDims; },
    get flareBoost() { return flareBoost; },
    get lightAdd() { return lightAdd; },
    get auraRadius() { return C.lanternOut ? 0 : C.lightR; },
    get speedMult() { return C.inSlick ? (C.B?.move?.slickMult ?? 0.6) : 1; },
    get rooted() { return !!grip; },
    /** A free flare burst (Second Wick revive, DESIGN §6.7): no oil, no charge, cooldown untouched. */
    freeFlare() { if (!C.run || ctx.flow !== 'playing') return false; fullFlare(); return true; },
    get flareCooldown() { return flareCd; },
    get flareCooldownTotal() { return flareTotal; },
    get flareCost() { return C.stats?.flareCost ?? 16; },
    get bossAlive() { return wardenAlive(); },
    get latchedCount() { return latched.filter(Boolean).length; },
    get stolenFish() { return enemiesSys.floating; },
    getBoss() { return wardenAlive() ? bossRef : null; },
    group,
    get _fx() { return fx; },
    init() {
      ctx.render?.scene?.add?.(group);
      try { enemiesSys.ensureSwarms(); } catch (e) { C.report('swarms', e); }
      const bus = ctx.bus;
      bus.on('run:start', (p) => onRunStart(p || {}));
      bus.on('zone:change', ({ prev } = {}) => {
        clearAll();
        C.run = ctx.state.run;
        if (!C.run) return;
        zoneInfo(); phaseInfo(); refreshDiff(true); resetNight(); night.stragglerK = -1;
        void prev;
      });
      bus.on('phase:change', ({ phase, prev } = {}) => {
        if (!ctx.state.run) return;
        C.run = ctx.state.run;
        phaseInfo(); refreshDiff(true);
        if (phase === 'dusk') { levels.newNight(); night.scoutCredit = 0.6; night.duskRate = -1; }
        if (phase === 'gloomtide') { if (prev !== 'dusk') levels.newNight(); resetNight(); }
        if (phase === 'dawn') killAll('dawn');
        if (phase === 'calm') { night.stragglerK = -1; night.stragglerDone = false; }
      });
      bus.on('player:damage', ({ amount } = {}) => {
        if (!(amount >= 1) || !C.run) return;
        weapons.onHurt();
        // Gutter-burst: a free radial knock on every Ember lost
        const gb = C.B?.damage?.gutterBurst || { radius: 4, push: 5, stun: 0.5 };
        const q = characterQuirk();
        const tallow = q?.id === 'slow_melt';
        const R = (gb.radius ?? 4) * (tallow ? (q.burstRadiusMult ?? 1.5) : 1);
        for (let i = enemies.length - 1; i >= 0; i--) {
          const e = enemies[i];
          if (!e?.alive || e.boss || e.elite) continue;
          const dx = e.position.x - C.raft.x, dz = e.position.z - C.raft.z, d = Math.hypot(dx, dz) || 1;
          if (d > R + e.radius) continue;
          if (e.latchSlot >= 0) continue;
          C.knockEnemy(e, dx / d, dz / d, gb.push ?? 5);
          e.stun = Math.max(e.stun, gb.stun ?? 0.5);
        }
        if (tallow && q.burstDamage) C.flareBurst(C.raft.x, C.raft.z, R, 1, { free: true, mini: true, source: 'gutter' });
        fx.timedDecal({ x: C.raft.x, z: C.raft.z, r0: 0.8, r1: R, life: 0.45, color: COL.gutter, p1: 0.12, p2: 0.1, alpha: 0.9 });
        fx.burst(C.raft.x, 1.2, C.raft.z, COL.gutter, 16, R * 1.4, 0.16, 0.4, 1, -2);
      });
      bus.on('fish:action', ({ action } = {}) => {
        if (action !== 'render' || !C.run) return;
        const lv = C.run.boons?.gutsfire | 0;
        const pr = data().BOON_BY_ID?.gutsfire?.proc;
        if (lv > 0 && pr?.levels) {
          gutsP = pr.levels[Math.min(lv, pr.levels.length) - 1];
          gutsT = gutsP?.time || 6;
          fx.timedDecal({ x: C.raft.x, z: C.raft.z, r0: 1, r1: C.lightR + 2, life: 0.7, color: COL.burnHot, p1: 0.08, p2: 0.12 });
        }
      });
      bus.on('fish:landed', () => {
        if (!C.run) return;
        const q = characterQuirk();
        if (q?.id === 'anglers_ember' && flareCd > 0) flareCd = Math.max(0, flareCd - (q.flareRefund ?? 0.25) * flareTotal);
        const lv = C.run.boons?.lantern_on_the_line | 0;
        const pr = data().BOON_BY_ID?.lantern_on_the_line?.proc;
        const lvP = lv > 0 ? pr?.levels?.[Math.min(lv, pr.levels.length) - 1] : null;
        if (lvP?.flareOnNightLand && (C.phase === 'gloomtide' || C.phase === 'dusk') && ctx.flow === 'playing') fullFlare();
      });
      bus.on('run:end', () => { grip = null; pKnock.set(0, 0, 0); });
      Object.assign(ctx.debug, {
        spawn: (idOrKind, n = 1, dist) => debugSpawn(idOrKind, n, dist),
        killAll: () => killAll('debug'),
        levelUp: (n = 1) => levels.levelUp(n),
        giveBoon: (id, level) => {
          const run = ctx.state.run, b = data().BOON_BY_ID?.[id];
          if (!run || !b) return false;
          levels.ensureRunFields(run);
          const cur = run.boons[id] || 0;
          run.boons[id] = Math.max(1, Math.min(b.kind === 'weapon' && b.kindle ? 6 : b.maxLevel || 5, level ?? cur + 1));
          C.run = run; C.onBoonsChanged();
          ctx.bus.emit('boon:chosen', { boonId: id, level: run.boons[id], kind: b.kind });
          return run.boons[id];
        },
        threat: () => { const r = getThreat(); console.log('[combat] threat', r); return r; },
        formation: (id) => spawnFormation(id)?.id || null,
        combat: () => ({ enemies: enemies.length, cinders: levels.cinderCount, pending: levels.pendingCount, lightR: C.lightR, lightMult: lightDims * flareBoost, flareCd, weapons: weapons.list.map((w) => `${w.id}:${w.level}`), boss: bossRef?.name || null, night: { ...night } }),
        flareReset: () => { flareCd = 0; return true; },
      });
    },
    update,
    onPointerDown,
    flare,
    flareReady() { return flareCd <= 0 ? 1 : clamp01(1 - flareCd / Math.max(0.01, flareTotal)); },
    canFlare() { const r = ctx.state.run; if (!r || flareCd > 0 || (r.oil ?? 0) <= 0) return false; return (r.flags?.flareCharges || r.flareCharges || 0) > 0 || (r.oil ?? 0) >= (C.stats?.flareCost ?? 16); },
    addXp(n) { if (!C.run) C.run = ctx.state.run; levels.addXp(n); },
    chooseBoon(boonId) { if (!C.run) C.run = ctx.state.run; return levels.chooseBoon(boonId); },
    reroll() { return levels.reroll(); },
    skip() { return levels.skip(); },
    skipBoon() { return levels.skip(); },
    getBoons() { if (!C.run) C.run = ctx.state.run; return levels.getBoons(); },
    killAll,
    getThreat,
    spawnEnemy(id, position, opts = {}) { if (!C.run) return null; return enemiesSys.spawn(id, position?.x ?? C.raft.x, position?.z ?? C.raft.z, opts); },
  };
  return api;
}
