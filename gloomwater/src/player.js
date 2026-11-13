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
//   inSlick (bool)                  raft is inside an ink slick (combat.speedMult < 1)
//   (combat.rooted === true also stops the raft)
//   cutLineK (0..1)                 progress of the "hold to cut the line" bail-out while reeling
//   inputMag (0..1)                 current steering input strength
// Events: player:anchor {anchored}, interact:change {id, label}; extra: player:bump {speed, position}.
//
// v3 (CONTRACT §13.3, §13.7 player, §13.7a the anchor, §13.12; DESIGN §25.14.2b FE-S1) — every addition is behind data.V3_ENABLED,
// so a flag-off build behaves exactly as before:
//   the Landing's raft mode (Landing v0): in flow 'hub' the raft sails the closed cove with no drains (survival idles in the hub),
//     spawns at COVE.arena.moorings[0].slot (7, 2) with yaw 90, and keeps to the cove's raft water (player-cove.js: the walk shapes,
//     the breakwaters and the soft wall across the arch, Murk's barge pad and the Waystones; only a glide passes the soft wall);
//     the Map Table's v0 post is an interact target (interact:change {id: 'station:map_table', label: 'Plan'}; interact() emits
//     station:open {id});
//   glide(path, {duration, onLine: {z, fn}}) -> Promise: scripted raft travel along waypoints (no input, no collision);
//   setOutFromPost({onLine}): Set Out — an input-locked auto-sail at raft speed from where the raft is, straight to each
//     FIRST_EVENING.gate.via point, then to joinAt, then glide([joinAt, ...COVE.setOutPath.slice(glideFrom)], {duration: 3}); the
//     arch crossing lands FIRST_EVENING.stepSec.setout (6 s) after Set Out; setOutFromMooring({onLine, skippable}): every later
//     run's 3 s glide from the jetty; skipGlide() jumps a skippable glide to the arch line; toMooring() / toPost();
//   the anchor (every v3 mode): while fishing.state is reeling, landing or lost, movement input is ignored (not buffered, no cut),
//     knock / push / pull / applyKnock / pushOut move nothing, and only fishing's tow (tow(dx, dz)) moves the raft;
//   writeSave(run) / restore(pos): run.pos {zone, x, z, y, mode, mooring}.
import * as THREE from 'three';
import { clamp, inWorld } from './core.js';
import { coveRaftMask, departurePlan, everyRunPlan, pointAt, hermite, pathLength, crossTime } from './player-cove.js';

const LOCKED = new Set(['bite', 'reeling', 'landing']);
const CANCEL_ON_MOVE = new Set(['charging', 'casting', 'waiting']);
const ANCHOR_STATES = new Set(['reeling', 'landing', 'lost']);   // v3: AUTOFISH.play.anchor.states (from the strike to the card or the note)
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
  const V3 = () => D().V3_ENABLED === true;
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
  // v3: the Landing (cove raft mode), the glides and the anchor
  let coveMode = false;            // the hub's zone is the cove (zone:change {hub: true})
  let coveMask = null;             // player-cove.js raft water (built lazily, once per page)
  let glideS = null;               // the running glide: {legs: [{pts, prof}], leg, t, onLine, fired, resolve, skippable, crossAt, total}
  let wasAnchoredV3 = false;
  let nearPost = null;             // id of the v0 post in reach

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

  /** v3 the anchor (AUTOFISH.play.anchor): a fish is on, from the strike until the card or the note, in every night mode. */
  function anchorStates() {
    const a = D().AUTOFISH?.play?.anchor;
    return Array.isArray(a?.states) ? new Set(a.states) : ANCHOR_STATES;
  }
  function anchoredNow() {
    if (!V3()) return false;
    // fishing knows exactly when the note shows (isAnchored); without it, the anchor's states
    const f = ctx.fishing;
    if (real(f) && typeof f.isAnchored === 'function') { try { const a = f.isAnchored(); if (typeof a === 'boolean') return a; } catch { /* fall through */ } }
    return anchorStates().has(fishingState());
  }
  const feLocks = () => { try { return ctx.firstEvening?.locksMovement?.() === true; } catch { return false; } };

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

  /** The world's collision applies in the cove only once the world has built it (a build without the cove keeps a lake there). */
  function worldIsCove() { try { return ctx.world?.getZone?.()?.id === 'cove'; } catch { return false; } }
  function mask() {
    if (coveMask === null) { try { coveMask = coveRaftMask(D(), { raftRadius: M('raftRadius') }) || false; } catch (e) { console.error('[player] cove mask', e); coveMask = false; } }
    return coveMask || null;
  }
  /** Keep the raft on the closed cove's raft water: accept the move, else slide along x or z, else stay. Returns the contact normal. */
  function coveStep(fromX, fromZ) {
    const m = mask();
    if (!m) return null;
    if (m.ok(position.x, position.z)) return null;
    const tx = position.x, tz = position.z;
    if (m.ok(tx, fromZ)) { position.z = fromZ; return [0, Math.sign(fromZ - tz) || 1]; }
    if (m.ok(fromX, tz)) { position.x = fromX; return [Math.sign(fromX - tx) || 1, 0]; }
    position.x = fromX; position.z = fromZ;
    const dx = fromX - tx, dz = fromZ - tz, d = Math.hypot(dx, dz) || 1;
    return [dx / d, dz / d];
  }

  function integrate(h) {
    if (coveMode && V3()) { integrateCove(h); return; }
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

  function integrateCove(h) {
    const fx = position.x, fz = position.z;
    position.set(fx + (cv.x + ext.x + pullV.x) * h, 0, fz + (cv.z + ext.z + pullV.z) * h);
    const world = ctx.world;
    if (worldIsCove() && real(world) && typeof world.collide === 'function') {
      try { world.collide(position, M('raftRadius')); position.y = 0; } catch (e) { console.error('[player] world.collide threw', e); }
      if (!Number.isFinite(position.x) || !Number.isFinite(position.z)) position.set(fx, 0, fz);
    }
    const n = coveStep(fx, fz);
    if (n) contact(n[0], n[1]);
  }

  // ---------------------------------------------------------------- per-frame simulation
  function simulate(dt) {
    const s = stats();
    const inp = ctx.input || {};
    let mx = num(inp.move?.x, 0) + num(inp.joy?.x, 0);
    let my = num(inp.move?.y, 0) + num(inp.joy?.y, 0);
    // v3: the anchor (movement input is ignored and not buffered while a fish is on) and the First Evening's locked beats
    const anchorV3 = anchoredNow();
    if (anchorV3 || (coveMode && V3() && feLocks())) { mx = 0; my = 0; }
    if (anchorV3 && !wasAnchoredV3) { cv.set(0, 0, 0); ext.set(0, 0, 0); pullV.set(0, 0, 0); pullT = 0; pullOnce = false; }
    wasAnchoredV3 = anchorV3;
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
    if (fstate === 'reeling' && inputActive && !V3()) {   // v1's hold-to-cut (v3: no cut; the anchor ignores the input)
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
    api.inSlick = hazardMult < 0.999;
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

    // ---- external forces (v3 anchor: nothing but fishing's tow moves the raft)
    if (anchorV3) { ext.set(0, 0, 0); pullT = 0; pullOnce = false; cv.set(0, 0, 0); }
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
    leash();

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
    // fishing.lineBroken() is the one owner of that rule (v3: in Still / Lantern it discounts raft movement combat caused,
    // CONTRACT §13.7 the hard rule); the distance check below stays for a fishing module without it
    if (fstate === 'waiting' && typeof ctx.fishing?.lineBroken === 'function') {
      let broken = false;
      try { broken = ctx.fishing.lineBroken() === true; } catch { broken = false; }
      if (broken) cancelFishing('moved');
    } else if (fstate === 'waiting') {
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

  /**
   * v3 Scorched (CONTRACT §13.4): a forced lamp-watch holds the raft within its radius (10 m) of the anchor until dawn.
   * survival.lampWatch is null outside a v3 run, so this never acts in v1 or The Long Descent. The outward part of the
   * paddling and knockback velocity is dropped, so the raft slides along the edge instead of bouncing.
   */
  function leash() {
    const s = ctx.survival;
    if (!real(s)) return;
    let lw = null;
    try { lw = s.lampWatch; } catch { lw = null; }
    if (!lw || lw.forced !== true || !Number.isFinite(lw.x) || !Number.isFinite(lw.z)) return;
    const R = Math.max(1, num(lw.radius, 10));
    const dx = position.x - lw.x, dz = position.z - lw.z;
    const d = Math.hypot(dx, dz);
    if (d <= R || d < 1e-6) return;
    const nx = dx / d, nz = dz / d;
    position.x = lw.x + nx * R;
    position.z = lw.z + nz * R;
    const vc = cv.x * nx + cv.z * nz;
    if (vc > 0) { cv.x -= vc * nx; cv.z -= vc * nz; }
    const ve = ext.x * nx + ext.z * nz;
    if (ve > 0) { ext.x -= ve * nx; ext.z -= ve * nz; }
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
    endGlide();
    position.set(num(p?.x, 0), 0, num(p?.z, 0));
    const w = ctx.world;
    if (coveMode && V3()) {
      if (worldIsCove() && real(w)) { try { w.collide?.(position, M('raftRadius')); position.y = 0; } catch { /* ignore */ } }
      const m = mask(), q = m?.nearest(position.x, position.z);
      if (q) position.set(q[0], 0, q[1]);
    } else if (real(w)) { try { w.collide?.(position, M('raftRadius')); position.y = 0; } catch { /* ignore */ } }
    if (!Number.isFinite(position.x) || !Number.isFinite(position.z)) position.set(0, 0, 8);
    cv.set(0, 0, 0); ext.set(0, 0, 0); pullV.set(0, 0, 0); velocity.set(0, 0, 0);
    api.speed = 0;
    api.heading = wrap(num(yaw, 0));
    cutT = 0; rootT = 0; pullT = 0; pullOnce = false; api.cutLineK = 0;
    wakeT = 0; paddleT = 0.2;
    if (api.anchored) setAnchored(false);
    near.merchant = near.gate = false;
    nearPost = null;
    if (ctx.flow === 'playing' && ctx.state.run) updateInteract();
    else setInteract(null);
  }
  /** v3 Landing v0: the raft at its mooring slot by the jetty (COVE.arena.moorings[0]: (7, 2), yaw 90). */
  function mooring() {
    const mo = D().COVE?.arena?.moorings?.[0];
    return { x: num(mo?.slot?.x, 7), z: num(mo?.slot?.z, 2), yaw: (num(mo?.yawDeg, 90) * Math.PI) / 180 };
  }
  function spawn() {
    if (coveMode && V3()) { const m = mooring(); teleport({ x: m.x, z: m.z }, m.yaw); return; }
    let s = null;
    try { s = real(ctx.world) ? ctx.world.getSpawn?.() : null; } catch { s = null; }
    if (s?.position && Number.isFinite(s.position.x)) teleport(s.position, num(s.yaw, 0));
    else teleport({ x: 0, z: 8 }, 0);
  }

  // ---------------------------------------------------------------- v3: the Landing's posts (Landing v0, COVE.v0.posts)
  /** Posts offered in the FE slice: the Map Table's (FIRST_EVENING.gate.post). The other stations wait for P3. */
  function livePosts() {
    const C = D().COVE, post = D().FIRST_EVENING?.gate?.post || 'map_table';
    return (C?.v0?.posts || []).filter((p) => p.id === post);
  }
  function updateInteractHub() {
    if (glideS || !coveMode || !V3() || feLocks()) { nearPost = null; setInteract(null); return; }
    const C = D().COVE, range = num(C?.v0?.range, M('interactRange'));
    let best = null, bd = Infinity;
    for (const p of livePosts()) {
      const d = Math.hypot(p.x - position.x, p.z - position.z);
      if (d <= range + (nearPost === p.id ? LEAVE_PAD : 0) && d < bd) { bd = d; best = p; }
    }
    nearPost = best ? best.id : null;
    if (!best) { setInteract(null); return; }
    const st = (C?.stations || []).find((x) => x.id === best.id);
    setInteract({ id: `station:${best.id}`, label: st?.pill || 'Plan' });
  }

  // ---------------------------------------------------------------- v3: glides (CONTRACT §13.7 player.glide)
  function endGlide() {
    if (!glideS) return;
    const g = glideS; glideS = null;
    api.gliding = false;
    try { g.resolve?.(g.fired); } catch { /* ignore */ }
    ctx.bus.emit('player:glide', { state: 'end', fired: g.fired, kind: g.kind });
  }
  function startGlide(legs, { onLine = null, skippable = false, kind = 'glide', crossAt = null } = {}) {
    endGlide();
    const total = legs.reduce((a, l) => a + l.prof.T, 0);
    return new Promise((resolve) => {
      glideS = { legs, leg: 0, t: 0, tAll: 0, onLine, fired: false, resolve, skippable, kind, total, crossAt };
      api.gliding = true;
      cv.set(0, 0, 0); ext.set(0, 0, 0); pullV.set(0, 0, 0);
      setInteract(null);
      ctx.bus.emit('player:glide', { state: 'start', kind, skippable, total, crossAt });
    });
  }
  const _gp = {};
  function glideStep(dt) {
    const g = glideS;
    if (!g) return;
    const fx = position.x, fz = position.z;
    let left = dt;
    while (left > 0 && glideS === g) {
      const L = g.legs[g.leg];
      const step = Math.min(left, Math.max(0, L.prof.T - g.t));
      g.t += step; g.tAll += step; left -= step;
      pointAt(L.pts, L.prof.s(g.t), _gp);
      const pz = position.z;
      position.set(_gp.x, 0, _gp.z);
      if (Math.hypot(_gp.dx, _gp.dz) > 0.5) api.heading = Math.atan2(-_gp.dx, -_gp.dz);
      // the line (COVE.archLineZ): fires once, heading north
      const ln = g.onLine;
      if (ln && !g.fired && Number.isFinite(ln.z) && pz > ln.z && position.z <= ln.z) {
        g.fired = true;
        ctx.bus.emit('player:glide', { state: 'line', z: ln.z, t: g.tAll, kind: g.kind });
        try { ln.fn?.(); } catch (e) { console.error('[player] glide onLine', e); }
        if (glideS !== g) return;   // the line started the run (a zone change ended the glide)
      }
      if (g.t >= L.prof.T - 1e-9) {
        if (g.leg + 1 < g.legs.length) { g.leg++; g.t = 0; } else { endGlide(); return; }
      }
      if (step <= 0) break;
    }
    if (dt > 0) velocity.set((position.x - fx) / dt, 0, (position.z - fz) / dt);
    api.speed = Math.hypot(velocity.x, velocity.z);
    // the wake behind a gliding raft
    wakeT -= dt;
    const sp = api.speed;
    if (sp > 0.6 && wakeT <= 0) {
      wakeT = M('wakeEvery') / Math.max(0.3, clamp(sp / 6, 0, 1));
      getStern(_r);
      try { water()?.addWake?.(_r.x, _r.z, velocity.x / sp, velocity.z / sp, clamp(sp / 6, 0.1, 1)); } catch { /* ignore */ }
    }
  }
  function lineFor(onLine) {
    const z = num(D().COVE?.archLineZ, -18);
    if (typeof onLine === 'function') return { z, fn: onLine };
    if (onLine && typeof onLine.fn === 'function') return { z: num(onLine.z, z), fn: onLine.fn };
    return null;
  }

  // ---------------------------------------------------------------- api
  const api = {
    position, velocity,
    heading: 0, speed: 0, anchored: false,
    inSlick: false, cutLineK: 0, inputMag: 0,
    gliding: false,
    get interactable() { return interactable; },
    /** v3: the Landing's raft mode is on (zone:change {hub: true} until the next lake). */
    get coveMode() { return coveMode && V3(); },
    /** v3: the running glide (render's `setout` camera, tests). */
    get glideState() { const g = glideS; return g ? { kind: g.kind, t: g.tAll, total: g.total, crossAt: g.crossAt, fired: g.fired, skippable: g.skippable, leg: g.leg } : null; },
    /** v3 the anchor: true while a fish is on (fishing.state reeling, landing or lost). */
    get anchorV3() { return anchoredNow(); },

    init() {
      const bus = ctx.bus;
      bus.on('zone:change', (e = {}) => { coveMode = !!(e.hub && V3()); statsCache = null; spawn(); });
      bus.on('run:start', () => { statsCache = null; spawn(); });
      bus.on('flow:change', ({ flow, prev } = {}) => {
        if (flow !== 'playing' && flow !== 'hub') setInteract(null);
        if (flow === 'title' && prev && prev !== 'boot') spawn();
      });
      for (const e of ['boon:chosen', 'shop:buy', 'relic:buy', 'levelup']) bus.on(e, () => { statsCache = null; });
      spawn();
    },

    update(dt) {
      statsAge += Math.min(0.1, num(ctx.time?.dt, 0));
      if (V3() && ctx.flow === 'hub') {
        // the Landing (CONTRACT §13.1, §13.3): no run, no drains; a glide drives the raft, otherwise the closed cove's raft mode
        if (dt > 0) { if (glideS) glideStep(Math.min(dt, 0.25)); else if (coveMode) simulate(Math.min(dt, 0.5)); }
        updateInteractHub();
        return;
      }
      const run = ctx.state.run;
      if (ctx.flow !== 'playing' || !run || run.active === false) {
        if (glideS && V3() && !inWorld(ctx)) endGlide();
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
      if (V3() && ctx.flow === 'hub') {
        const id = interactable?.id;
        if (typeof id === 'string' && id.startsWith('station:')) {
          const sid = id.slice(8);
          ctx.bus.emit('station:open', { id: sid, label: interactable.label });
          if (!ctx.firstEvening?.isActive?.() && sid === 'map_table') ctx.ui?.showSetOut?.();
          return true;
        }
        return false;
      }
      if (ctx.flow !== 'playing' || !ctx.state.run) return false;
      const id = interactable?.id;
      if (id === 'merchant') { ctx.ui?.openShop?.(); return true; }
      if (id === 'gate') { ctx.ui?.openDescend?.(); return true; }
      return false;
    },
    isNear(id) {
      if (typeof id === 'string' && id.startsWith('station:')) return nearPost === id.slice(8);
      return id === 'merchant' ? near.merchant : id === 'gate' ? near.gate : false;
    },

    // ---- v3: the Landing (FE-S1)
    /** The raft at its mooring slot by the jetty (the wake's ink wipe; every later run's start). */
    toMooring() { const m = mooring(); teleport({ x: m.x, z: m.z }, m.yaw); return { x: position.x, z: position.z }; },
    /** The raft in the Map Table post's reach (a skipped First Evening's card; tests). */
    toPost() {
      const p = livePosts()[0] || { x: -9, z: 7.6 };
      const m = mask(), q = m?.nearest(p.x, p.z + 3.4, 6);
      teleport(q ? { x: q[0], z: q[1] } : { x: p.x, z: p.z + 3.4 }, Math.PI / 2);
      return { x: position.x, z: position.z };
    },
    /**
     * Scripted raft travel along waypoints [[x, z], …] for `duration` s (no input, no collision; the soft wall is passed only like
     * this). `onLine` {z, fn} (or a function: z = COVE.archLineZ) fires once when the raft crosses z heading north. -> Promise
     */
    glide(path, { duration = 3, onLine = null, skippable = false, v0 = 0 } = {}) {
      const pts = (Array.isArray(path) ? path : []).map((p) => (Array.isArray(p) ? [p[0], p[1]] : [p.x, p.z]));
      if (pts.length < 2) return Promise.resolve(false);
      const ln = lineFor(onLine);
      const prof = hermite(pathLength(pts), Math.max(0.05, num(duration, 3)), Math.max(0, num(v0, 0)));
      position.set(pts[0][0], 0, pts[0][1]);
      return startGlide([{ pts, prof }], { onLine: ln, skippable, kind: 'glide', crossAt: ln ? crossTime(pts, prof, ln.z) : null });
    },
    /**
     * Set Out from the Map Table post (FIRST_EVENING.gate / setOut): an input-locked auto-sail at raft speed straight to each via
     * point and to joinAt, then the 3 s glide into COVE.setOutPath; the arch crossing lands stepSec.setout (6 s) after the call.
     */
    setOutFromPost({ onLine = null } = {}) {
      const C = D().COVE, F = D().FIRST_EVENING || {}, GT = F.gate || {};
      if (!C?.setOutPath || !GT.joinAt) return false;
      const lane0 = GT.via?.[0] || GT.joinAt;
      const dl = Math.hypot(lane0[0] - position.x, lane0[1] - position.z) || 1;
      const along = Math.max(0, (velocity.x * (lane0[0] - position.x) + velocity.z * (lane0[1] - position.z)) / dl);
      const plan = departurePlan({
        start: [position.x, position.z], via: GT.via || [], joinAt: GT.joinAt, setOutPath: C.setOutPath, glideFrom: num(GT.glideFrom, 1),
        archLineZ: num(C.archLineZ, -18), vStart: along, vRaft: Math.max(1, num(stats().moveSpeed, 6)), glide: num(F.setOut?.glide, 3),
        total: num(F.stepSec?.setout, 6),
      });
      return startGlide([{ pts: plan.lane, prof: plan.sail }, { pts: plan.glidePath, prof: plan.glideProf }],
        { onLine: lineFor(onLine), skippable: false, kind: 'setout', crossAt: plan.crossAt });
    },
    /** Every later run (FIRST_EVENING.everyRun): from the mooring, the 3 s glide along COVE.setOutPath; `skippable` after the first. */
    setOutFromMooring({ onLine = null, skippable = true, duration = null } = {}) {
      const C = D().COVE, F = D().FIRST_EVENING || {};
      if (!C?.setOutPath) return false;
      const m = mooring();
      teleport({ x: m.x, z: m.z }, m.yaw);
      const dur = duration ?? num(F.everyRun?.glide, 3);
      const plan = everyRunPlan({ setOutPath: C.setOutPath, archLineZ: num(C.archLineZ, -18), glide: Math.max(0.01, dur) });
      return startGlide([{ pts: C.setOutPath.map((p) => [p[0], p[1]]), prof: plan.prof }], { onLine: lineFor(onLine), skippable, kind: 'everyRun', crossAt: plan.crossAt });
    },
    /** Tap during a skippable glide: jump to the arch line (the line fires; the run starts). Returns true when it skipped. */
    skipGlide() {
      const g = glideS;
      if (!g || !g.skippable) return false;
      const ln = g.onLine;
      if (ln && !g.fired) {
        g.fired = true;
        const L = g.legs[g.legs.length - 1];
        const z = ln.z - 0.01;
        const pt = L.pts.find((p) => p[1] <= z) || L.pts[L.pts.length - 1];
        position.set(pt[0], 0, Math.min(pt[1], z));
        ctx.bus.emit('player:glide', { state: 'line', z: ln.z, t: g.tAll, kind: g.kind, skipped: true });
        try { ln.fn?.(); } catch (e) { console.error('[player] glide onLine', e); }
      }
      if (glideS === g) endGlide();
      return true;
    },
    /** v3 the anchor's one mover: fishing's tow of the play (AUTOFISH.play[class].tow), a displacement in metres with collision. */
    tow(dx, dz) {
      const x = num(Number(dx), 0), z = num(Number(dz), 0);
      if (!x && !z) return false;
      const fx = position.x, fz = position.z;
      position.x += x; position.z += z;
      if (coveMode && V3()) coveStep(fx, fz);
      else if (real(ctx.world)) { try { ctx.world.collide?.(position, M('raftRadius')); position.y = 0; } catch { /* ignore */ } }
      if (!Number.isFinite(position.x) || !Number.isFinite(position.z)) position.set(fx, 0, fz);
      return true;
    },
    /** CONTRACT §13.6: run.pos {zone, x, z, y, mode, mooring} before every autosave. */
    writeSave(run) {
      if (!run || typeof run !== 'object') return;
      run.pos = { zone: run.zone ?? null, x: +position.x.toFixed(3), z: +position.z.toFixed(3), y: 0, mode: 'raft', mooring: null };
    },
    /** Snap to a saved position (Continue): the nearest open water (world.collide) or, failing that, the zone spawn. */
    restore(pos) {
      if (!pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.z)) return false;
      teleport({ x: pos.x, z: pos.z }, api.heading);
      return true;
    },

    // ---- optional extras for combat / abilities (v3: the anchor makes every one a no-op while a fish is on)
    knock(fromX, fromZ, dist = 4) {
      if (anchoredNow()) return;
      let dx = position.x - num(Number(fromX), position.x), dz = position.z - num(Number(fromZ), position.z);
      let d = Math.hypot(dx, dz);
      if (d < 1e-3) { dx = -Math.sin(api.heading); dz = -Math.cos(api.heading); d = 1; }
      const v = Math.max(0, num(Number(dist), 4)) * EXT_DRAG;
      ext.x += (dx / d) * v; ext.z += (dz / d) * v;
    },
    push(dirX, dirZ, dist = 3) {
      if (anchoredNow()) return;
      const d = Math.hypot(num(dirX, 0), num(dirZ, 0));
      if (d < 1e-4) return;
      const v = Math.max(0, num(Number(dist), 3)) * EXT_DRAG;
      ext.x += (dirX / d) * v; ext.z += (dirZ / d) * v;
    },
    pull(x, z, speed = 3.5, duration = 0) {
      if (anchoredNow()) return;
      if (!Number.isFinite(x) || !Number.isFinite(z)) return;
      pullTarget.set(x, 0, z);
      pullSpeed = Math.max(0, num(Number(speed), 3.5));
      const dur = num(Number(duration), 0);
      if (dur > 0) pullT = Math.max(pullT, dur); else pullOnce = true;
    },
    applyKnock(dx, dz) {   // shove by a displacement vector (metres)
      if (anchoredNow()) return;
      const d = Math.hypot(num(Number(dx), 0), num(Number(dz), 0));
      if (d > 1e-4) api.push(dx, dz, d);
    },
    root(seconds = 3) { rootT = Math.max(rootT, num(Number(seconds), 0)); },
    get rooted() { return rootT > 0; },
  };
  return api;
}
