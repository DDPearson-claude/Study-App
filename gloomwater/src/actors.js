// actors.js — the Wick, its raft & lantern (with the light pool on the water), rod / line /
// bobber, the catch hold-up, and Old Murk the merchant. CONTRACT §7 actors (actors author).
//
// Besides the explicit API, the Wick reacts to bus events so it stays alive even when a
// caller forgets a setPose(): fishing:state/cast/hook, flare, player:damage, player:died,
// levelup, fish:action (eat/render), fish:landed (new/record → celebrate), run:start,
// zone:change, flow:change, lantern:out/lit, shop:buy. Explicit setPose() always wins
// until the next fishing:state change. One-shot poses (cast, hookset, eat, flare, zap,
// hurt, celebrate, levelup, die) play once and return to the current base pose.
//
// Extras (optional, guard with ?.): getLanternPos(out), getHeadPos(out), getWickPos(out),
// pointAt(worldYaw) (brief turn, e.g. before a zap), merchantLight / merchant.light,
// lightPool (mesh), raftLevel, pose (current pose name).
import * as THREE from 'three';
import { createRaft, DECK_Y } from './actors-raft.js';
import { createWick } from './actors-wick.js';
import { createMerchant } from './actors-merchant.js';
import { makeLightPool, makeLine, makeBobber } from './actors-fx.js';

const damp = THREE.MathUtils.damp;
const clamp = THREE.MathUtils.clamp;
const AUTO_POSE = { idle: 'idle', charging: 'charge', casting: 'wait', waiting: 'wait', bite: 'wait', reeling: 'reel', landing: 'reel', lost: 'idle' };
const LANTERN_WARM = new THREE.Color(0xffa94d);

export function create(ctx) {
  const group = new THREE.Group(); group.name = 'actors';
  const raft = createRaft(ctx);
  group.add(raft.yawGroup);
  const wick = createWick(ctx, { raftDeck: raft.deck, deckY: DECK_Y });
  wick.group.position.set(0.1, DECK_Y, 0.16);
  wick.group.scale.setScalar(1.22);
  raft.deck.add(wick.group);
  const pool = makeLightPool(); group.add(pool.mesh);
  const line = makeLine(44); group.add(line.mesh);
  const bobber = makeBobber(); group.add(bobber.group);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffc27a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: true });
  const bobRing = new THREE.Mesh(new THREE.RingGeometry(0.82, 1, 40, 1), ringMat);
  bobRing.rotation.x = -Math.PI / 2; bobRing.renderOrder = 2; bobRing.visible = false; group.add(bobRing);
  const merchantR = createMerchant(ctx); group.add(merchantR.object3d);
  const lightHolder = new THREE.Group(); lightHolder.name = 'actorLights'; group.add(lightHolder);
  lightHolder.add(merchantR.light); // keep the merchant light always in the scene graph (stable light count)
  const lanternLight = raft.light;
  const catchHolder = new THREE.Group(); catchHolder.name = 'catchHolder'; group.add(catchHolder);

  // ---------------------------------------------------------------- state
  const st = {
    lantern: 1, lanternCur: 1, radius: 8, radiusCur: 8, vitality: 1, boost: 0, out: false, smokeT: 0,
    raftLevelExplicit: false, characterExplicit: false,
    line: { visible: false, end: new THREE.Vector3(), hasEnd: false, tension: 0, slack: 0 },
    bob: { visible: false, pos: new THREE.Vector3(), state: 'floating', prev: '', stateT: 0, dipT: 0, spin: 0 },
    catchFish: null, catchBig: false, eatFish: null, eatT: 0, celebratePending: false, brazierFlare: 0,
    prevVel: new THREE.Vector3(), accLocal: new THREE.Vector3(), prevHeading: 0, turn: 0, pitch: 0, roll: 0, y: 0,
    lastCreel: -1, creelT: 0, t: 0, snapT: 0, puffAt: -9, arriveFrame: -1, brazierDelay: 0,
  };
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), tip = new THREE.Vector3(), end = new THREE.Vector3(), camPos = new THREE.Vector3();
  const localVel = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const env = { autoBase: 'idle', moving: false, speed: 0, heading: 0, camYaw: null, localVel, fishingState: 'idle', fishingBusy: false, tension: 0 };

  const hasWater = () => ctx.water && !ctx.water.isStub && typeof ctx.water.getHeight === 'function';
  const H = (x, z) => { if (!hasWater()) return 0; const v = ctx.water.getHeight(x, z); return typeof v === 'number' && Number.isFinite(v) ? v : 0; };
  const playerOk = () => ctx.player && !ctx.player.isStub && ctx.player.position && typeof ctx.player.position.x === 'number';
  const D = () => ctx.data || {};

  function characterById(id) {
    const d = D();
    return (id && (d.CHARACTER_BY_ID?.[id] || (d.CHARACTERS || []).find?.((c) => c.id === id))) || (d.CHARACTERS || [])[0] || null;
  }
  function applyCharacter(c) {
    if (!c) return;
    const look = { ...(c.look || {}), id: c.id };
    wick.setLook(look);
    const fc = new THREE.Color(look.flame ?? 0xffb347);
    const lc = LANTERN_WARM.clone().lerp(fc, 0.22);
    lanternLight.color.copy(lc);
    raft.lflame.outerMat.uniforms.uColor.value.copy(lc);
    raft.halo.material.color.copy(lc);
    raft.glassMat.color.copy(lc).multiplyScalar(1.6);
    pool.mat.uniforms.uColor.value.copy(lc).lerp(new THREE.Color(0xff8a3a), 0.35);
    pool.mat.uniforms.uRing.value.copy(lc).lerp(new THREE.Color(0xffe2b0), 0.35);
  }
  function autoRaftLevel() {
    if (st.raftLevelExplicit) return;
    const run = ctx.state?.run;
    let total = 0;
    for (const u of D().UPGRADES || []) if (u.category === 'raft') total += run?.upgrades?.[u.id] || 0;
    raft.setLevel(total >= 7 ? 3 : total >= 4 ? 2 : total >= 1 ? 1 : 0);
  }
  function releaseCatch() {
    const f = st.catchFish;
    st.catchFish = null;
    wick.setHolding(false);
    if (f?.object3d && (f.object3d.parent === wick.holdAnchor || f.object3d.parent === catchHolder)) f.object3d.parent.remove(f.object3d);
  }
  function clearEat() {
    if (st.eatFish) { try { st.eatFish.dispose(); } catch { /* ignore */ } st.eatFish = null; }
  }
  function resetTransient() {
    st.line.visible = false; st.bob.visible = false; line.mesh.visible = false; bobber.group.visible = false; bobRing.visible = false;
    releaseCatch(); clearEat();
    wick.setAim(null); wick.setPose(null); wick.setCharge(0); wick.setReel(0, 0);
    st.celebratePending = false;
  }

  // ---------------------------------------------------------------- API
  const merchant = {
    get present() { return merchantR.present; },
    get position() { return merchantR.position; },
    get object3d() { return merchantR.object3d; },
    get light() { return merchantR.light; },
    arrive(position, yaw = 0, opts) { st.arriveFrame = ctx.time?.frame ?? -1; merchantR.arrive(position, yaw, opts); },
    leave(opts) { merchantR.leave(opts); },
    ringBell(s) { merchantR.ringBell(s); },
  };

  const api = {
    group, raft: raft.yawGroup, wick: wick.group, lanternLight, merchant, merchantLight: merchantR.light, lightPool: pool.mesh,
    get pose() { return wick.pose; },
    get raftLevel() { return raft.level; },

    init() {
      if (ctx.render?.scene && !ctx.render.isStub) ctx.render.scene.add(group);
      const bus = ctx.bus;
      if (!bus) return;
      bus.on('fishing:state', ({ state } = {}) => {
        wick.setPose(null);
        if (state === 'idle' || state === 'lost') { wick.setCharge(0); }
      });
      bus.on('fishing:cast', () => wick.setPose('cast'));
      bus.on('fishing:hook', () => wick.setPose('hookset'));
      bus.on('fishing:escaped', ({ reason } = {}) => { if (reason === 'snap') st.snapT = 0.35; });
      bus.on('flare', () => { wick.setPose('flare'); st.boost = 1; raft.nudge(0.8, -0.6); });
      bus.on('player:damage', () => { wick.setPose('hurt'); raft.nudge((Math.random() - 0.5) * 3, -2); });
      bus.on('player:died', () => { releaseCatch(); clearEat(); st.line.visible = false; st.bob.visible = false; wick.setPose('die'); });
      bus.on('levelup', () => wick.setPose('levelup'));
      bus.on('boon:chosen', () => { st.boost = Math.max(st.boost, 0.5); });
      bus.on('fish:action', ({ action, fish } = {}) => {
        if (action === 'eat') {
          releaseCatch(); clearEat();
          try {
            if (fish?.speciesId && ctx.models?.createFish && !ctx.models.isStub) {
              const fv = ctx.models.createFish(fish.speciesId, fish.weight);
              if (fv?.object3d) { st.eatFish = fv; st.eatT = 0; wick.holdAnchor.add(fv.object3d); }
            }
          } catch { st.eatFish = null; }
          wick.setPose('eat');
        } else if (action === 'render') { releaseCatch(); wick.setPose('toss'); st.brazierDelay = 0.42; }
        else if (action === 'release' || action === 'sell' || action === 'keep') { /* catch card closes → showCatch(null) from the owner */ }
      });
      bus.on('fish:landed', ({ isNew, isRecord } = {}) => { if (isNew || isRecord) st.celebratePending = true; });
      bus.on('run:start', () => {
        wick.revive(); resetTransient();
        st.raftLevelExplicit = false; st.characterExplicit = false;
        applyCharacter(characterById(ctx.state?.run?.character));
        autoRaftLevel(); st.lantern = 1; st.vitality = 1; wick.setVitality(1);
      });
      // a new lake: drop transient visuals; hide a merchant left over from the old lake unless
      // someone already re-placed him during this same event dispatch
      bus.on('zone:change', () => { resetTransient(); if (st.arriveFrame !== (ctx.time?.frame ?? -2)) merchantR.leave({ instant: true }); });
      bus.on('flow:change', ({ flow } = {}) => {
        if (flow === 'title') { wick.revive(); resetTransient(); applyCharacter(characterById(ctx.state?.meta?.lastCharacter)); st.lantern = 1; st.vitality = 1; wick.setVitality(1); merchantR.leave({ instant: true }); }
      });
      bus.on('lantern:out', () => { lanternPuff(); });
      bus.on('lantern:lit', () => { st.boost = Math.max(st.boost, 0.6); });
      bus.on('shop:buy', () => autoRaftLevel());
      bus.on('merchant:arrive', () => merchantR.ringBell(1));
      applyCharacter(characterById(ctx.state?.meta?.lastCharacter));
    },

    update(dt = 0.016, t = 0) {
      dt = Math.min(Math.max(dt || 0, 0), 0.1);
      st.t += dt; t = st.t;
      const cam = ctx.render?.camera;
      if (cam) cam.getWorldPosition(camPos); else camPos.set(0, 9, 13);
      // ---------------------------------------------------------- raft placement on the water
      let px = 0, pz = 0, heading = 0, vx = 0, vz = 0;
      if (playerOk()) {
        px = ctx.player.position.x; pz = ctx.player.position.z; heading = Number(ctx.player.heading) || 0;
        vx = ctx.player.velocity?.x || 0; vz = ctx.player.velocity?.z || 0;
      }
      const yaw = heading + Math.PI, c = Math.cos(yaw), s = Math.sin(yaw);
      raft.yawGroup.position.set(px, 0, pz);
      raft.yawGroup.rotation.y = yaw;
      const sample = (lx, lz) => H(px + lx * c + lz * s, pz - lx * s + lz * c);
      const hF = sample(0, 1.25), hB = sample(0, -1.25), hL = sample(0.95, 0), hR = sample(-0.95, 0);
      const avg = (hF + hB + hL + hR) / 4;
      localVel.set(vx * c - vz * s, 0, vx * s + vz * c);
      if (dt > 0) {
        st.accLocal.x = damp(st.accLocal.x, (localVel.x - st.prevVel.x) / dt, 6, dt);
        st.accLocal.z = damp(st.accLocal.z, (localVel.z - st.prevVel.z) / dt, 6, dt);
        st.turn = damp(st.turn, Math.atan2(Math.sin(heading - st.prevHeading), Math.cos(heading - st.prevHeading)) / dt, 5, dt);
      }
      st.prevVel.copy(localVel); st.prevHeading = heading;
      const speed = Math.hypot(vx, vz);
      const pitchT = clamp(-Math.atan2(hF - hB, 2.5) - st.accLocal.z * 0.02 - speed * 0.008, -0.25, 0.25);
      const rollT = clamp(Math.atan2(hL - hR, 1.9) + st.turn * speed * 0.012, -0.25, 0.25);
      st.pitch = damp(st.pitch, pitchT, 5, dt); st.roll = damp(st.roll, rollT, 5, dt);
      st.y = damp(st.y, avg, 8, dt);
      raft.tilt.rotation.set(st.pitch, 0, st.roll);
      raft.tilt.position.y = st.y - 0.02 - Math.min(0.03, speed * 0.004);
      raft.waterShadow.position.y = st.y + 0.035;
      raft.swing(dt, st.accLocal.x, st.accLocal.z, st.pitch, st.roll);

      // ---------------------------------------------------------- Wick
      const fstate = ctx.fishing && !ctx.fishing.isStub && typeof ctx.fishing.state === 'string' ? ctx.fishing.state : 'idle';
      env.fishingState = fstate;
      env.fishingBusy = fstate !== 'idle' && fstate !== 'lost';
      env.autoBase = AUTO_POSE[fstate] || 'idle';
      if (env.autoBase === 'reel' && st.line.tension > 0.85) env.autoBase = 'strain';
      env.tension = st.line.tension;
      env.speed = speed; env.moving = speed > 0.6 && !env.fishingBusy; env.heading = heading;
      const phase = ctx.survival && !ctx.survival.isStub ? ctx.survival.getPhaseInfo?.()?.phase : null;
      env.warm = phase === 'dusk' && !env.moving && !env.fishingBusy && ctx.flow === 'playing';
      if (cam && playerOk()) env.camYaw = Math.atan2(-(camPos.x - px), -(camPos.z - pz)); else env.camYaw = null;
      if (ctx.flow === 'dead' && !wick.dead) wick.setPose('die');
      if (st.celebratePending && !st.catchFish && wick.pose !== 'eat') { st.celebratePending = false; wick.setPose('celebrate'); }
      wick.update(dt, t, env);

      // ---------------------------------------------------------- catch display
      const fv = st.catchFish;
      if (fv) {
        const obj = fv.object3d;
        if (!obj || (obj.parent !== wick.holdAnchor && obj.parent !== catchHolder)) { st.catchFish = null; wick.setHolding(false); }
        else if (st.catchBig) {
          wick.getRodTip(tip);
          obj.position.set(tip.x, tip.y - fv.length * 0.5 - 0.12, tip.z);
          tmp.subVectors(camPos, obj.position);
          obj.rotation.set(-Math.PI / 2, Math.atan2(-tmp.z, tmp.x), 0, 'YXZ');
          obj.scale.setScalar(1);
          try { fv.update?.(dt, t, { swim: 0.2, struggle: 0.35 + Math.max(0, Math.sin(t * 2.1)) * 0.4 }); } catch { /* visual */ }
        } else {
          obj.position.set(0, 0, 0); obj.rotation.set(0, Math.PI / 2, 0); obj.scale.setScalar(1);
          try { fv.update?.(dt, t, { swim: 0.35, struggle: 0.25 + Math.max(0, Math.sin(t * 1.7)) * 0.35 }); } catch { /* visual */ }
        }
      }
      if (st.eatFish) {
        st.eatT += dt;
        const k = st.eatT / 1.5, obj = st.eatFish.object3d;
        obj.position.set(0, 0.02, -0.12); obj.rotation.set(0.3, Math.PI / 2, 0);
        obj.scale.setScalar(Math.max(0.001, Math.min(0.55 / Math.max(0.2, st.eatFish.length), 1) * (1 - Math.max(0, k - 0.25) * 1.2)));
        try { st.eatFish.update?.(dt, t, { swim: 0.3, struggle: 0.6 }); } catch { /* visual */ }
        if (k >= 1.05) clearEat();
      }

      // ---------------------------------------------------------- rod, line, bobber
      const L = st.line, B = st.bob;
      if (ctx.flow === 'dead' || ctx.flow === 'title') { L.visible = false; B.visible = false; }
      let lineEnd = null;
      if (B.visible) {
        B.stateT += dt;
        if (B.state !== B.prev) { onBobberState(B.state, B.prev); B.prev = B.state; B.stateT = 0; }
        positionBobber(dt, t);
      }
      bobber.group.visible = B.visible;
      if (!B.visible) bobRing.visible = false;
      if (L.visible && (L.hasEnd || B.visible)) {
        if (B.visible && (!L.hasEnd || L.end.distanceTo(B.pos) < 0.8)) { bobber.tilt.updateWorldMatrix(true, false); end.set(0, 0.2, 0).applyMatrix4(bobber.tilt.matrixWorld); }
        else end.copy(L.end);
        lineEnd = end;
      }
      wick.bendRod(lineEnd, L.tension);
      if (lineEnd) {
        wick.getRodTip(tip);
        line.shape(tip, lineEnd, L.slack, L.tension, t, hasWater() ? H : null);
        line.ribbon(camPos);
        line.mesh.visible = true;
      } else line.mesh.visible = false;
      if (st.snapT > 0) { st.snapT -= dt; }

      // ---------------------------------------------------------- lantern, light, pool
      st.lanternCur = damp(st.lanternCur, st.lantern, 3, dt);
      st.radiusCur = damp(st.radiusCur, st.radius, 3, dt);
      st.boost = Math.max(0, st.boost - dt * 1.1);
      const lv = st.lanternCur, low = lv < 0.25 ? 1 - lv / 0.25 : 0;
      const flick = 1 + Math.sin(t * 7.1) * 0.035 + Math.sin(t * 12.7 + 1.3) * 0.025 + Math.sin(t * 23.3) * 0.015
        + low * (Math.sin(t * 17) * 0.12 + (Math.sin(t * 3.1) > 0.92 ? -0.35 : 0));
      const lit = st.lantern > 0.001 && !st.out;
      const glow = lit ? (0.22 + 0.78 * lv) * flick * (1 + st.boost * 1.6) : 0;
      lanternLight.intensity = 9.5 * glow;
      lanternLight.distance = Math.max(7, st.radiusCur * 2.1 + 3);
      raft.glassMat.opacity = 0.1 + 0.38 * Math.min(1.5, glow);
      raft.halo.material.opacity = 0.26 * Math.min(1.6, glow);
      raft.halo.scale.setScalar(2.2 * (0.6 + 0.4 * Math.min(1.5, glow)) * (1 + st.boost * 0.8));
      raft.lflame.group.visible = lit;
      raft.lflame.group.scale.setScalar(0.45 + 0.55 * lv * (1 + st.boost * 0.5));
      raft.lflame.outerMat.uniforms.uT.value = t * 1.1; raft.lflame.innerMat.uniforms.uT.value = t * 1.3;
      raft.lflame.outerMat.uniforms.uWild.value = low * 1.2;
      if (!lit) {
        st.smokeT -= dt;
        if (st.smokeT <= 0) { st.smokeT = 0.5; raft.lantern.getWorldPosition(tmp); tmp.y -= 0.4; ctx.models?.emitSmoke?.(tmp, { color: 0x3a3640, vy: 0.4, spread: 0.1, size: 0.18, sizeGrow: 0.35, lifeT: 2.2, alpha: 0.3, jitter: 0.04 }); }
      }
      const pu = pool.mat.uniforms;
      pu.uT.value = t;
      pu.uPulse.value = Math.sin(t * 1.6) * 0.5 + 0.5 + (flick - 1) * 2;
      pu.uK.value = lit ? (0.5 + 0.5 * lv) * (1 + st.boost * 1.4) : damp(pu.uK.value, 0, 6, dt);
      pu.uDanger.value = lit ? low : 0;
      const R = Math.max(0.5, st.radiusCur * (1 + st.boost * 0.08));
      pu.uRadius.value = R;
      pool.mesh.visible = pu.uK.value > 0.01;
      if (pool.mesh.visible) pool.layout(px, pz, R, hasWater() ? H : null, 0.07);
      // brazier
      if (st.brazierDelay > 0) { st.brazierDelay -= dt; if (st.brazierDelay <= 0) { st.brazierFlare = 1; raft.brazier.flame.group.getWorldPosition(tmp); ctx.models?.puff?.(tmp, { color: 0xffa040, count: 8, size: 0.45, smokeColor: 0x2a2026 }); } }
      st.brazierFlare = Math.max(0, st.brazierFlare - dt * 0.6);
      const bz = raft.brazier;
      bz.coalsMat.color.set(0xff5a20).multiplyScalar(1.5 + Math.sin(t * 2.3) * 0.3 + st.brazierFlare * 2);
      bz.flame.group.scale.setScalar(0.85 + st.brazierFlare * 1.4 + Math.sin(t * 5) * 0.05);
      bz.flame.outerMat.uniforms.uT.value = t * 1.2; bz.flame.innerMat.uniforms.uT.value = t * 1.4;
      if (st.brazierFlare > 0.6 && Math.random() < dt * 30) { bz.flame.group.getWorldPosition(tmp); ctx.models?.emitEmber?.(tmp, { color: 0xffa040, vy: 2.2, spread: 0.8, size: 0.08, lifeT: 0.9, alpha: 1, jitter: 0.1 }); }
      // pennant / chime / trophies, L3 bulbs
      raft.animate(t, -localVel.x, -localVel.z);
      const bulbMat = raft.details[2].userData.bulbMat;
      if (bulbMat) bulbMat.color.set(0xffc36a).multiplyScalar(2 + Math.sin(t * 2.2) * 0.4);
      // creel tails / auto raft level (cheap, ~2 Hz)
      st.creelT -= dt;
      if (st.creelT <= 0) {
        st.creelT = 0.5;
        const n = ctx.state?.run?.creel?.length || 0;
        if (n !== st.lastCreel) { st.lastCreel = n; raft.setCreelCount(n); }
        const lg = ctx.state?.run?.legendaries; raft.setTrophies(lg ? Object.keys(lg).filter((k) => lg[k]).length : 0);
        autoRaftLevel();
      }

      // ---------------------------------------------------------- merchant
      merchantR.update(dt, hasWater() ? H : null);
    },

    getRodTip() { return wick.getRodTip(new THREE.Vector3()); },
    setLine({ visible = false, end: e = null, tension = 0, slack = 0 } = {}) {
      const L = st.line;
      L.visible = !!visible;
      L.hasEnd = !!(e && Number.isFinite(e.x));
      if (L.hasEnd) L.end.set(e.x, Number.isFinite(e.y) ? e.y : 0, e.z);
      L.tension = clamp(Number(tension) || 0, 0, 1.5);
      L.slack = clamp(Number(slack) || 0, 0, 2);
    },
    setBobber({ visible = false, position = null, state = 'floating' } = {}) {
      const B = st.bob;
      B.visible = !!visible && (!!position || B.visible);
      if (position && Number.isFinite(position.x)) B.pos.set(position.x, Number.isFinite(position.y) ? position.y : 0, position.z);
      if (typeof state === 'string') B.state = state;
    },
    setPose(name) { if (name === 'die') releaseCatch(); wick.setPose(name); },
    setCharge(k) { wick.setCharge(k); },
    setReel(k, lateral = 0) { wick.setReel(k, lateral); },
    setAim(worldYaw) { wick.setAim(worldYaw); },
    pointAt(worldYaw, hold = 0.5) { if (Number.isFinite(worldYaw)) wick.pointAt(worldYaw, hold); },
    setLanternLevel(k) {
      const v = clamp(Number.isFinite(k) ? k : 1, 0, 1);
      if (v <= 0.001 && st.lantern > 0.001) lanternPuff();
      st.lantern = v; st.out = v <= 0.001;
    },
    setLightRadius(m) { if (Number.isFinite(m)) st.radius = clamp(m, 0, 40); },
    setVitality(k) {
      st.vitality = clamp(Number.isFinite(k) ? k : 1, 0, 1);
      const hp = ctx.state?.run?.hp; // vitality = hp / maxHp, so k / hp = one Ember's share
      wick.setVitality(st.vitality, Number.isFinite(hp) && hp > 0 && st.vitality > 0 ? st.vitality / hp : undefined);
    },
    setCharacter(c) {
      const data = typeof c === 'string' ? characterById(c) : c;
      if (!data) return;
      st.characterExplicit = true;
      applyCharacter(data);
    },
    showCatch(fishVisual) {
      releaseCatch();
      if (!fishVisual || !fishVisual.object3d) return;
      st.catchFish = fishVisual;
      st.catchBig = (fishVisual.length || 0) > 1.05;
      (st.catchBig ? catchHolder : wick.holdAnchor).add(fishVisual.object3d);
      wick.setHolding(true, st.catchBig);
    },
    pickMerchant(ndc) {
      if (!merchantR.present || !merchantR.object3d.visible || !ndc) return false;
      const cam = ctx.render?.camera;
      if (!cam || !cam.isCamera) return false;
      tmp.copy(merchantR.object3d.position); tmp.y += 1.6;
      const dist = camPos.distanceTo(tmp);
      tmp2.copy(tmp).project(cam);
      if (tmp2.z < 1 && tmp2.z > -1) {
        const w = typeof innerWidth === 'number' ? innerWidth : 1280, h = typeof innerHeight === 'number' ? innerHeight : 720;
        const dx = (tmp2.x - ndc.x) * w / 2, dy = (tmp2.y - ndc.y) * h / 2;
        const pxPerM = h / (2 * Math.max(0.1, dist) * Math.tan(THREE.MathUtils.degToRad(cam.fov || 50) / 2));
        const r = Math.max(ctx.isMobile ? 80 : 64, 2.7 * pxPerM);
        if (dx * dx + dy * dy < r * r) return true;
      }
      raycaster.setFromCamera(ndc, cam);
      merchantR.object3d.updateMatrixWorld();
      return raycaster.intersectObject(merchantR.proxy, false).length > 0;
    },
    setRaftLevel(n) { st.raftLevelExplicit = true; raft.setLevel(n); },
    getLanternPos(out = new THREE.Vector3()) { raft.lantern.updateWorldMatrix(true, false); return out.set(0, -0.46, 0).applyMatrix4(raft.lantern.matrixWorld); },
    getHeadPos(out = new THREE.Vector3()) { return wick.flame.group.getWorldPosition(out); },
    getWickPos(out = new THREE.Vector3()) { return wick.group.getWorldPosition(out); },
    dispose() {
      ctx.render?.scene?.remove?.(group);
      for (const m of [...raft.mats, ...wick.mats, ...merchantR.mats, ...bobber.mats]) m?.dispose?.();
      pool.dispose(); line.dispose();
    },
  };

  function lanternPuff() {
    if (st.t - st.puffAt < 0.4) return;
    st.puffAt = st.t;
    raft.lantern.getWorldPosition(tmp); tmp.y -= 0.45;
    ctx.models?.puff?.(tmp, { color: 0xffa040, count: 10, size: 0.6, smokeColor: 0x2a2630 });
  }
  function onBobberState(state, prev) {
    const B = st.bob;
    if (state === 'bite') {
      wick.ringBell(1.6);
      ctx.water?.splash?.(B.pos.x, B.pos.z, { size: 0.35, count: 8 });
      ctx.water?.addRipple?.(B.pos.x, B.pos.z, 1.2);
    } else if (state === 'floating' && prev === 'flying') {
      ctx.water?.addRipple?.(B.pos.x, B.pos.z, 0.6);
    }
  }
  function positionBobber(dt, t) {
    const B = st.bob, g = bobber.group, tl = bobber.tilt;
    const x = B.pos.x, z = B.pos.z;
    const h = H(x, z);
    let y = h, tx = 0, tz = 0, tipCol = 0xffb066, tipI = 2.4, halo = 0.55;
    switch (B.state) {
      case 'flying':
        y = B.pos.y; B.spin += dt * 12; tx = Math.sin(B.spin) * 0.6; tz = Math.cos(B.spin * 0.7) * 0.4; break;
      case 'nibble': {
        const d = Math.pow(Math.max(0, Math.sin(t * 9 + Math.sin(t * 2.7) * 2)), 6);
        y = h - 0.02 - d * 0.08; tx = d * 0.25; tipI = 2.8 + d * 2; halo = 0.6 + d * 0.3;
        B.dipT -= dt; if (d > 0.85 && B.dipT <= 0) { B.dipT = 0.4; ctx.water?.addRipple?.(x, z, 0.35); wick.ringBell(0.5); }
        break;
      }
      case 'bite':
        y = h - 0.15 - Math.sin(t * 22) * 0.025; tx = Math.sin(t * 17) * 0.3; tz = Math.cos(t * 13) * 0.2;
        tipCol = 0xff4a30; tipI = 3 + Math.max(0, Math.sin(t * 16)) * 3; halo = 0.9; break;
      case 'hooked':
        y = h - 0.1 + Math.sin(t * 15) * 0.02; tx = 0.5 + Math.sin(t * 9) * 0.15; tipCol = 0xffc070; tipI = 2.2; break;
      default:
        y = h - 0.02 + Math.sin(t * 2.1) * 0.012; tx = Math.sin(t * 1.3) * 0.08; tz = Math.cos(t * 1.1) * 0.06;
    }
    g.position.set(x, y, z);
    if (B.state === 'hooked' || B.state === 'bite') {
      wick.getRodTip(tip); const yawTo = Math.atan2(tip.x - x, tip.z - z); g.rotation.set(0, yawTo, 0);
    }
    tl.rotation.x = damp(tl.rotation.x, tx, 10, dt); tl.rotation.z = damp(tl.rotation.z, tz, 10, dt);
    bobber.tipMat.color.set(tipCol).multiplyScalar(tipI);
    bobber.halo.material.color.set(tipCol);
    bobber.halo.material.opacity = Math.min(1, halo * 1.25);
    // keep the float readable from the gameplay camera: halo grows with distance
    const camD = camPos.distanceTo(g.position), far = clamp(camD / 14, 0.8, 2.2);
    bobber.halo.scale.setScalar(0.8 * far * (1 + (B.state === 'bite' ? Math.max(0, Math.sin(t * 16)) * 0.7 : 0)));
    // expanding ripple ring on the water around the float
    if (B.state !== 'flying') {
      const rate = B.state === 'bite' ? 2.6 : B.state === 'nibble' ? 1.6 : B.state === 'hooked' ? 2.0 : 0.7;
      const ph = (t * rate) % 1;
      bobRing.visible = true;
      bobRing.position.set(x, h + 0.075, z);
      bobRing.scale.setScalar((0.25 + ph * (B.state === 'bite' ? 1.4 : 0.9)) * Math.max(1, far * 0.8));
      ringMat.color.set(B.state === 'bite' ? 0xff5a3a : 0xffc27a);
      ringMat.opacity = (1 - ph) * (B.state === 'bite' ? 0.9 : 0.5);
    } else bobRing.visible = false;
  }

  return api;
}
