// player.js — the raft controller: boat-feel sailing, collisions, anchoring rules with
// fishing, wakes & paddle ripples, and the Trade / Descend interactions (survival author).
// CONTRACT §7 player · DESIGN §4.1–4.2 · data BALANCE.move.
//
// Public API (contract):
//   position (Vector3, live), velocity (Vector3), heading (yaw), speed, anchored (bool)
//   getForward() -> Vector3 ; teleport(position, yaw)
//   interactable -> {id:'merchant'|'gate', label} | null ; interact() -> bool ; isNear(id) -> bool
// Optional extras (read with ?.):
//   getForward(out) / getRight(out) / getStern(out)  — non-allocating variants
//   knock(fromX, fromZ, dist = 4)   radial shove away from a point (hand slam, tick shove)
//   push(dirX, dirZ, dist)          shove along a direction ; applyKnock(dx, dz) shove by a vector (m)
//   pull(x, z, speed, duration = 0) drag the raft toward a point (Wickeater inhale); duration 0 =
//                                    this frame only (call every frame while it pulls)
//   root(seconds)                   no movement (Ringed Grasp grip)
//   inSlick (bool)                  raft is inside an ink slick: from combat.speedMult (<1), else
//                                    combat.inSlick?.(position) or combat.slicks [{x,z,r}|{position,radius}]
//   (combat.rooted === true also stops the raft)
//   cutLineK (0..1)                 progress of the "hold to cut the line" bail-out while reeling
//   inputMag (0..1)                 current steering input strength
// Events: player:anchor {anchored}, interact:change {id, label}; extra: player:bump {speed, position}.
import * as THREE from 'three';
import { clamp } from './core.js';

const LOCKED = new Set(['bite', 'reeling', 'landing']);
const CANCEL_ON_MOVE = new Set(['charging', 'casting', 'waiting']);
const MOVE_FALLBACK = {
  accel: 3.0, drag: 1.5, backpaddle: 1.8, backpaddleDot: -0.2, turnRate: 5.0, minHeadingSpeed: 0.4,
  raftRadius: 1.6, bounceSpeed: 4, bounce: 0.3, bounceShake: 0.1, anchorDrag: 6, anchorSpeed: 0.3,
  cutLineHold: 0.6, slickMult: 0.6, wakeEvery: 0.12, paddleRipple: 0.45, interactRange: 5, gateRange: 1.2,
};
const MERCHANT = Object.freeze({ id: 'merchant', label: 'Trade' });
const GATE = Object.freeze({ id: 'gate', label: 'Descend' });
const EXT_DRAG = 4.5;        // 1/s decay of knockback velocity → a shove of d metres starts at d·EXT_DRAG m/s
const INPUT_DEAD = 0.15;     // |move+joy| below this is no input (joystick also has its own dead zone)
const MAX_STEP = 1 / 30;     // integration sub-step (keeps collisions stable at timeScale 8)
const LEAVE_PAD = 0.6;       // m of hysteresis before an interaction prompt disappears

const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const real = (m) => !!m && !m.isStub;
const wrap = (a) => { a = (a + Math.PI) % (Math.PI * 2); if (a < 0) a += Math.PI * 2; return a - Math.PI; };

export function create(ctx) {
  const D = () => ctx.data || {};
  const cfg = () => {
    const m = D().BALANCE?.move;
    return m && typeof m === 'object' ? m : MOVE_FALLBACK;
  };
  const M = (key) => num(cfg()[key], MOVE_FALLBACK[key]);

  const position = new THREE.Vector3(0, 0, 8);
  const velocity = new THREE.Vector3();     // public: control + knockback (what the raft actually does)
  const cv = new THREE.Vector3();           // control velocity (paddling / coasting)
  const ext = new THREE.Vector3();          // knockback velocity (decays at EXT_DRAG)
  const pullV = new THREE.Vector3();        // pull velocity (this frame / timed)
  const dir = new THREE.Vector3();
  const want = new THREE.Vector3();
  const _f = new THREE.Vector3();
  const _r = new THREE.Vector3();

  let interactable = null;
  const near = { merchant: false, gate: false };
  let cutT = 0, rootT = 0, pullT = 0, pullSpeed = 0;
  const pullTarget = new THREE.Vector3();
  let pullOnce = false;
  let wakeT = 0, paddleT = 0, paddleSide = 1, bumpCd = 0, scrapeT = 0;

  // ---------------------------------------------------------------- stats (cached)
  let statsCache = null, statsAge = 99;
  function stats() {
    if (!statsCache || statsAge > 0.25) {
      let s = null;
      try { s = real(ctx.progression) ? ctx.progression.getStats?.(ctx.state.run || undefined) : null; } catch { s = null; }
      if (!s || s.isStub || typeof s !== 'object') s = { moveSpeed: num(D().STATS?.moveSpeed?.base, 6), castMax: num(D().STATS?.castMax?.base, 16) };
      statsCache = s; statsAge = 0;
    }
    return statsCache;
  }

  // ---------------------------------------------------------------- fishing helpers (defensive)
  function fishingState() {
    const f = ctx.fishing;
    if (!real(f)) return 'idle';
    const s = f.state;
    return typeof s === 'string' ? s : 'idle';
  }
  function fishingBusy(state) {
    const f = ctx.fishing;
    if (real(f) && typeof f.isBusy === 'function') {
      try { const b = f.isBusy(); if (typeof b === 'boolean') return b; } catch { /* fall through */ }
    }
    return state !== 'idle' && state !== 'lost';
  }
  function cancelFishing(reason) {
    const f = ctx.fishing;
    if (!real(f)) return;
    try { f.cancel?.(reason); } catch (e) { console.error('[player] fishing.cancel threw', e); }
  }

  // ---------------------------------------------------------------- vectors
  function getForward(out) {
    const o = out && out.isVector3 ? out : new THREE.Vector3();
    return o.set(-Math.sin(api.heading), 0, -Math.cos(api.heading));
  }
  function getRight(out) {
    const o = out && out.isVector3 ? out : new THREE.Vector3();
    return o.set(Math.cos(api.heading), 0, -Math.sin(api.heading));
  }
  function getStern(out) {
    const o = out && out.isVector3 ? out : new THREE.Vector3();
    getForward(_f);
    return o.set(position.x - _f.x * 1.5, 0, position.z - _f.z * 1.5);
  }

  // ---------------------------------------------------------------- water fx (all optional)
  const water = () => (real(ctx.water) ? ctx.water : null);
  function ripple(x, z, s) { try { water()?.addRipple?.(x, z, s); } catch { /* ignore */ } }
  function splash(x, z, opts) { try { water()?.splash?.(x, z, opts); } catch { /* ignore */ } }

  function setAnchored(v) {
    if (api.anchored === v) return;
    api.anchored = v;
    ctx.bus.emit('player:anchor', { anchored: v });
    if (v) {
      // the anchor stone drops off the bow: a plop and a widening ring
      getForward(_f);
      const bx = position.x + _f.x * 1.3, bz = position.z + _f.z * 1.3;
      splash(bx, bz, { size: 0.5, count: 8 });
      ripple(bx, bz, 0.7);
    }
  }

  function setInteract(next) {
    if ((next?.id || null) === (interactable?.id || null)) return;
    interactable = next;
    ctx.bus.emit('interact:change', { id: next?.id || null, label: next?.label || '' });
  }

  // ---------------------------------------------------------------- slicks (combat-owned hazard; optional)
  function checkSlick() {
    const c = ctx.combat;
    if (!real(c)) return false;
    try {
      if (typeof c.inSlick === 'function') return c.inSlick(position) === true;
      const arr = c.slicks;
      if (Array.isArray(arr)) {
        for (let i = 0; i < arr.length; i++) {
          const s = arr[i];
          if (!s) continue;
          const sx = num(s.x, num(s.position?.x, NaN)), sz = num(s.z, num(s.position?.z, NaN));
          const r = num(s.r, num(s.radius, 2.4));
          if (!Number.isFinite(sx)) continue;
          const dx = position.x - sx, dz = position.z - sz;
          if (dx * dx + dz * dz < r * r) return true;
        }
      }
    } catch { /* ignore */ }
    return false;
  }

  // ---------------------------------------------------------------- contact response
  function contact(nx, nz) {
    // knockback into a wall: absorb it with a little give
    const en = ext.x * nx + ext.z * nz;
    if (en < 0) { ext.x -= 1.2 * en * nx; ext.z -= 1.2 * en * nz; }
    const vn = cv.x * nx + cv.z * nz;
    if (vn >= 0) return;
    const impact = -vn;
    if (impact > M('bounceSpeed') && bumpCd <= 0) {
      const b = 1 + M('bounce');
      cv.x -= b * vn * nx; cv.z -= b * vn * nz;
      bumpCd = 0.3;
      const r = M('raftRadius');
      const px = position.x - nx * r, pz = position.z - nz * r;
      const k = clamp((impact - M('bounceSpeed')) / 3, 0, 1);
      splash(px, pz, { size: 0.7 + 0.6 * k, count: 12 + Math.round(10 * k) });
      ripple(px, pz, 0.8 + 0.6 * k);
      ripple(position.x, position.z, 0.35);
      ctx.render?.shake?.(M('bounceShake') + 0.08 * k, 0.25);
      try { ctx.audio?.play?.('splash_small', { volume: 0.5 + 0.4 * k }); } catch { /* ignore */ }
      ctx.bus.emit('player:bump', { speed: impact, position: { x: px, z: pz } });
    } else {
      cv.x -= vn * nx; cv.z -= vn * nz;          // slide along the obstacle
      if (impact > 0.8 && scrapeT <= 0) {        // scraping: little lapping ripples at the hull
        scrapeT = 0.22;
        const r = M('raftRadius');
        ripple(position.x - nx * r, position.z - nz * r, 0.25 + 0.1 * impact);
      }
    }
  }

  function integrate(h) {
    const world = ctx.world;
    const canCollide = real(world) && typeof world.collide === 'function';
    const r = M('raftRadius');
    want.set(
      position.x + (cv.x + ext.x + pullV.x) * h,
      0,
      position.z + (cv.z + ext.z + pullV.z) * h,
    );
    position.copy(want);
    if (!canCollide) return;
    try { world.collide(position, r); } catch (e) { console.error('[player] world.collide threw', e); return; }
    if (!Number.isFinite(position.x) || !Number.isFinite(position.z)) { position.copy(want); return; }
    position.y = 0;
    const cx = position.x - want.x, cz = position.z - want.z;
    const c2 = cx * cx + cz * cz;
    if (c2 > 1e-10) {
      const c = Math.sqrt(c2);
      contact(cx / c, cz / c);
    }
  }

  // ---------------------------------------------------------------- per-frame simulation
  function simulate(dt) {
    const s = stats();
    const inp = ctx.input || {};
    let mx = num(inp.move?.x, 0) + num(inp.joy?.x, 0);
    let my = num(inp.move?.y, 0) + num(inp.joy?.y, 0);
    let mag = Math.hypot(mx, my);
    if (mag > 1) { mx /= mag; my /= mag; mag = 1; }
    // screen-relative → world: rotate by the camera yaw (yaw 0 looks toward −Z)
    let yaw = 0;
    try { yaw = num(ctx.render?.getYaw?.(), 0); } catch { yaw = 0; }
    const sy = Math.sin(yaw), cy = Math.cos(yaw);
    dir.set(mx * cy - my * sy, 0, -mx * sy - my * cy);
    const inputActive = mag > INPUT_DEAD;
    api.inputMag = mag;

    // ---- anchoring rules (DESIGN §4.2)
    const fstate = fishingState();
    const busy = fishingBusy(fstate);
    const locked = LOCKED.has(fstate);
    if (inputActive && CANCEL_ON_MOVE.has(fstate)) cancelFishing('moved');
    if (fstate === 'reeling' && inputActive) {
      cutT += dt;
      if (cutT >= M('cutLineHold')) { cutT = 0; cancelFishing('moved'); }
    } else cutT = Math.max(0, cutT - dt * 2);
    api.cutLineK = clamp(cutT / Math.max(0.05, M('cutLineHold')));

    rootT = Math.max(0, rootT - dt);
    bumpCd = Math.max(0, bumpCd - dt);
    scrapeT = Math.max(0, scrapeT - dt);
    // hazards published by combat: speedMult (ink slick ×0.6), rooted (Ringed Grasp grip)
    const c = real(ctx.combat) ? ctx.combat : null;
    let hazardMult = 1;
    const sm = c ? c.speedMult : undefined;
    if (typeof sm === 'number' && Number.isFinite(sm) && sm > 0) hazardMult = Math.min(1, sm);
    api.inSlick = hazardMult < 0.999 || checkSlick();
    if (api.inSlick && hazardMult >= 0.999) hazardMult = M('slickMult');
    const blocked = locked || rootT > 0 || (c ? c.rooted === true : false);

    // ---- boat feel: v += (target − v)(1 − e^(−rate·dt))
    const top = Math.max(0, num(s.moveSpeed, 6)) * hazardMult;
    const tx = blocked ? 0 : dir.x * top, tz = blocked ? 0 : dir.z * top;
    let rate;
    if (inputActive && !blocked) {
      const sp = Math.hypot(cv.x, cv.z);
      const dot = sp > 0.3 ? (dir.x * cv.x + dir.z * cv.z) / (sp * Math.max(1e-4, mag)) : 1;
      rate = dot < M('backpaddleDot') ? M('accel') * M('backpaddle') : M('accel');
    } else rate = busy || blocked ? M('anchorDrag') : M('drag');
    const k = 1 - Math.exp(-rate * dt);
    cv.x += (tx - cv.x) * k;
    cv.z += (tz - cv.z) * k;

    // ---- external forces
    const ed = Math.exp(-EXT_DRAG * dt);
    ext.x *= ed; ext.z *= ed;
    if (ext.x * ext.x + ext.z * ext.z < 1e-4) ext.set(0, 0, 0);
    pullV.set(0, 0, 0);
    if (pullOnce || pullT > 0) {
      const dx = pullTarget.x - position.x, dz = pullTarget.z - position.z;
      const d = Math.hypot(dx, dz);
      if (d > 0.3) pullV.set((dx / d) * pullSpeed, 0, (dz / d) * pullSpeed);
      pullT = Math.max(0, pullT - dt);
      pullOnce = false;
    }

    // ---- integrate with sub-steps; world.collide every step (slide/bounce)
    const steps = Math.min(12, Math.max(1, Math.ceil(dt / MAX_STEP)));
    const h = dt / steps;
    for (let i = 0; i < steps; i++) integrate(h);

    velocity.set(cv.x + ext.x + pullV.x, 0, cv.z + ext.z + pullV.z);
    const sp = Math.hypot(velocity.x, velocity.z);
    api.speed = sp;

    // ---- heading slews toward the paddled direction (not toward knockbacks)
    const csp = Math.hypot(cv.x, cv.z);
    if (csp > M('minHeadingSpeed')) {
      const target = Math.atan2(-cv.x, -cv.z);
      const d = wrap(target - api.heading);
      const maxStep = M('turnRate') * dt;
      const step = clamp(d * (1 - Math.exp(-9 * dt)), -maxStep, maxStep);
      api.heading = wrap(api.heading + (Math.abs(d) < 1e-4 ? d : step));
    }

    // ---- anchored flag: busy fishing + nearly still; released when the raft next moves
    const aSpeed = M('anchorSpeed');
    if (!api.anchored) { if (busy && sp < aSpeed) setAnchored(true); }
    else if (sp > aSpeed + 0.05 && (inputActive || !busy)) setAnchored(false);

    // ---- a knock that drags the raft far from a waiting bobber reels the line in
    if (fstate === 'waiting') {
      const b = ctx.fishing?.bobberPos;
      if (b && Number.isFinite(b.x)) {
        const reach = num(ctx.fishing?.view?.castDist, 0) || num(s.castMax, 16);
        if (Math.hypot(b.x - position.x, b.z - position.z) > reach + 4) cancelFishing('moved');
      }
    }

    // ---- wakes & paddle ripples scaled by speed
    const frac = clamp(sp / Math.max(1, num(s.moveSpeed, 6)));
    wakeT -= dt;
    if (sp > 0.6 && wakeT <= 0) {
      wakeT = M('wakeEvery') / Math.max(0.3, frac);
      getStern(_r);
      try { water()?.addWake?.(_r.x, _r.z, velocity.x / sp, velocity.z / sp, clamp(frac * 1.05, 0.1, 1)); } catch { /* ignore */ }
    }
    paddleT -= dt;
    if (inputActive && !blocked && sp > 0.4 && paddleT <= 0) {
      paddleT = M('paddleRipple') * (1.25 - 0.4 * frac);
      paddleSide = -paddleSide;
      getRight(_r); getForward(_f);
      const px = position.x + _r.x * 1.25 * paddleSide - _f.x * 0.3;
      const pz = position.z + _r.z * 1.25 * paddleSide - _f.z * 0.3;
      ripple(px, pz, 0.22 + 0.33 * frac);
    }
  }

  // ---------------------------------------------------------------- interactions
  function updateInteract() {
    const run = ctx.state.run;
    const range = M('interactRange');
    // merchant: within range of a present, moored barge
    let nearM = false;
    const a = ctx.actors;
    const m = real(a) ? a.merchant : null;
    if (m && m.present === true && m.position && Number.isFinite(m.position.x)) {
      const d = Math.hypot(m.position.x - position.x, m.position.z - position.z);
      nearM = d <= range + (near.merchant ? LEAVE_PAD : 0);
    }
    // gate: inside the open whirlpool's reach
    let nearG = false;
    const w = ctx.world;
    if (run?.gateOpen && real(w)) {
      let g = null, gs = null;
      try { g = w.getGate?.(); gs = w.getGateState?.(); } catch { g = null; }
      if (g?.position && Number.isFinite(g.position.x) && gs !== 'hidden') {
        const d = Math.hypot(g.position.x - position.x, g.position.z - position.z);
        nearG = d <= num(g.radius, 4.5) * M('gateRange') + (near.gate ? LEAVE_PAD : 0);
      }
    }
    near.merchant = nearM; near.gate = nearG;
    const locked = LOCKED.has(fishingState());
    setInteract(locked ? null : nearG ? GATE : nearM ? MERCHANT : null);
  }

  // ---------------------------------------------------------------- spawn / teleport
  function teleport(p, yaw = 0) {
    position.set(num(p?.x, 0), 0, num(p?.z, 0));
    const w = ctx.world;
    if (real(w)) { try { w.collide?.(position, M('raftRadius')); position.y = 0; } catch { /* ignore */ } }
    if (!Number.isFinite(position.x) || !Number.isFinite(position.z)) position.set(0, 0, 8);
    cv.set(0, 0, 0); ext.set(0, 0, 0); pullV.set(0, 0, 0); velocity.set(0, 0, 0);
    api.speed = 0;
    api.heading = wrap(num(yaw, 0));
    cutT = 0; rootT = 0; pullT = 0; pullOnce = false; api.cutLineK = 0;
    wakeT = 0; paddleT = 0.2;
    if (api.anchored) setAnchored(false);
    near.merchant = near.gate = false;
    if (ctx.flow === 'playing' && ctx.state.run) updateInteract();
    else setInteract(null);
  }
  function spawn() {
    let s = null;
    try { s = real(ctx.world) ? ctx.world.getSpawn?.() : null; } catch { s = null; }
    if (s?.position && Number.isFinite(s.position.x)) teleport(s.position, num(s.yaw, 0));
    else teleport({ x: 0, z: 8 }, 0);
  }

  // ---------------------------------------------------------------- api
  const api = {
    position, velocity,
    heading: 0, speed: 0, anchored: false,
    inSlick: false, cutLineK: 0, inputMag: 0,
    get interactable() { return interactable; },

    init() {
      const bus = ctx.bus;
      bus.on('zone:change', () => { statsCache = null; spawn(); });
      bus.on('run:start', () => { statsCache = null; spawn(); });
      bus.on('flow:change', ({ flow, prev } = {}) => {
        if (flow !== 'playing') setInteract(null);
        if (flow === 'title' && prev && prev !== 'boot') spawn();
      });
      for (const e of ['boon:chosen', 'shop:buy', 'relic:buy', 'levelup']) bus.on(e, () => { statsCache = null; });
      spawn();
    },

    update(dt) {
      statsAge += Math.min(0.1, num(ctx.time?.dt, 0));
      const run = ctx.state.run;
      if (ctx.flow !== 'playing' || !run || run.active === false) {
        setInteract(null);
        return;
      }
      if (dt > 0) simulate(Math.min(dt, 0.5));
      updateInteract();
    },

    getForward,
    getRight,
    getStern,
    teleport,

    interact() {
      if (ctx.flow !== 'playing' || !ctx.state.run) return false;
      const id = interactable?.id;
      if (id === 'merchant') { ctx.ui?.openShop?.(); return true; }
      if (id === 'gate') { ctx.ui?.openDescend?.(); return true; }
      return false;
    },
    isNear(id) { return id === 'merchant' ? near.merchant : id === 'gate' ? near.gate : false; },

    // ---- optional extras for combat / abilities
    knock(fromX, fromZ, dist = 4) {
      let dx = position.x - num(Number(fromX), position.x), dz = position.z - num(Number(fromZ), position.z);
      let d = Math.hypot(dx, dz);
      if (d < 1e-3) { dx = -Math.sin(api.heading); dz = -Math.cos(api.heading); d = 1; }
      const v = Math.max(0, num(Number(dist), 4)) * EXT_DRAG;
      ext.x += (dx / d) * v; ext.z += (dz / d) * v;
    },
    push(dirX, dirZ, dist = 3) {
      const d = Math.hypot(num(dirX, 0), num(dirZ, 0));
      if (d < 1e-4) return;
      const v = Math.max(0, num(Number(dist), 3)) * EXT_DRAG;
      ext.x += (dirX / d) * v; ext.z += (dirZ / d) * v;
    },
    pull(x, z, speed = 3.5, duration = 0) {
      if (!Number.isFinite(x) || !Number.isFinite(z)) return;
      pullTarget.set(x, 0, z);
      pullSpeed = Math.max(0, num(Number(speed), 3.5));
      const dur = num(Number(duration), 0);
      if (dur > 0) pullT = Math.max(pullT, dur); else pullOnce = true;
    },
    applyKnock(dx, dz) {   // shove by a displacement vector (metres)
      const d = Math.hypot(num(Number(dx), 0), num(Number(dz), 0));
      if (d > 1e-4) api.push(dx, dz, d);
    },
    root(seconds = 3) { rootT = Math.max(rootT, num(Number(seconds), 0)); },
    get rooted() { return rootT > 0; },
  };
  return api;
}
