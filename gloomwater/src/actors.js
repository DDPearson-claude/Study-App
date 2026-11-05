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
//
// v3 measuring ceremony (DESIGN §25.6.8; CONTRACT §13.7 actors): setPose('measurePalm' | 'measureArms' | 'measureHang' |
// 'measureAlongside') and showCord(lengthM, k 0..1). The Wick (0.85 m) cups a fish under 0.25 m at its chest, holds one up to
// 0.85 m across its arms, hangs one up to 2 m head-up off the rod tip, and kneels at the deck's edge over anything longer (and
// every legend), which lies alongside the raft on its side; the knotted cord unrolls along the fish from its snout to its tail
// tip. Who drives it: fishing's ceremony calls setPose / showCord explicitly (they win); without those calls actors follows
// fishing.view.measure ({phase: 'scoop'|'pose'|'cord'|'banners'|'card', length (cm), sizeClass}) itself, and a v3 fish handed
// over by showCatch (FishVisual.trueScale) takes its measuring pose by length on its own. The fish is held at its TRUE size
// (it lives in world space, not under the Wick's 1.22 scale). fish:measured (the seal stamp) gives a satisfied bob and a flare.
// Extras: measurePoseFor(lengthM, {legendary}), getMeasureFocus(out) → {center, radius, pose} | null (for the trophy camera).
import * as THREE from 'three';
import { createRaft, DECK_Y } from './actors-raft.js';
import { createWick, ONE_SHOT } from './actors-wick.js';
import { createMerchant } from './actors-merchant.js';
import { makeLightPool, makeLine, makeBobber } from './actors-fx.js';
import { createCord } from './actors-measure.js';
import { MEASURE_POSES, measurePoseFor, cordEase, cordDurationFor } from './models-size.js';

const damp = THREE.MathUtils.damp;
const clamp = THREE.MathUtils.clamp;
const AUTO_POSE = { idle: 'idle', charging: 'charge', casting: 'wait', waiting: 'wait', bite: 'wait', reeling: 'reel', landing: 'reel', lost: 'idle' };
const LANTERN_WARM = new THREE.Color(0xffa94d);
const MEASURE = new Set(MEASURE_POSES);
const WICK_HOME = new THREE.Vector3(0.1, DECK_Y, 0.16);
const UP = new THREE.Vector3(0, 1, 0);
const FILL_WARM = new THREE.Color(0xffc890);

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
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xead6a8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: true });
  const bobRing = new THREE.Mesh(new THREE.RingGeometry(0.82, 1, 40, 1), ringMat);
  bobRing.rotation.x = -Math.PI / 2; bobRing.renderOrder = 2; bobRing.visible = false; group.add(bobRing);
  const merchantR = createMerchant(ctx); group.add(merchantR.object3d);
  const lightHolder = new THREE.Group(); lightHolder.name = 'actorLights'; group.add(lightHolder);
  lightHolder.add(merchantR.light); // keep the merchant light always in the scene graph (stable light count)
  const lanternLight = raft.light;
  const LFLAME_I = raft.lflame.outerMat.uniforms.uI.value;
  const catchHolder = new THREE.Group(); catchHolder.name = 'catchHolder'; group.add(catchHolder);
  const cord = createCord(ctx); group.add(cord.group);

  // ---------------------------------------------------------------- state
  const st = {
    lantern: 1, lanternCur: 1, radius: 8, radiusCur: 8, vitality: 1, boost: 0, out: false, smokeT: 0,
    raftLevelExplicit: false, characterExplicit: false,
    line: { visible: false, end: new THREE.Vector3(), hasEnd: false, tension: 0, slack: 0 },
    bob: { visible: false, pos: new THREE.Vector3(), state: 'floating', prev: '', stateT: 0, dipT: 0, spin: 0 },
    catchFish: null, catchBig: false, eatFish: null, eatT: 0, celebratePending: false, brazierFlare: 0,
    prevVel: new THREE.Vector3(), accLocal: new THREE.Vector3(), prevHeading: 0, turn: 0, pitch: 0, roll: 0, y: 0,
    lastCreel: -1, creelT: 0, t: 0, snapT: 0, puffAt: -9, arriveFrame: -1, brazierDelay: 0,
    // v3 measuring: explicit pose (setPose), the ceremony's pose (fishing.view.measure), the held v3 fish's own pose, the
    // alongside side, the fish's hand-over blend, and the cord (explicit showCord wins and sticks; else the view drives it)
    meas: { pose: null, cerPose: null, auto: null, active: null, t: 0, side: 1, vphase: null, vphaseT: 0, idleT: 0,
      blend: 1, from: null, rippleT: 0, fill: { k: 0, saved: null }, expo: 0, cord: { explicit: false, L: 0, k: 0, kShow: 0, show: false, autoL: 0, autoK: 0, autoShow: false } },
  };
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), tip = new THREE.Vector3(), end = new THREE.Vector3(), camPos = new THREE.Vector3();
  const localVel = new THREE.Vector3();
  const mv = { hR: new THREE.Vector3(), hL: new THREE.Vector3(), a: new THREE.Vector3(), x: new THREE.Vector3(), y: new THREE.Vector3(), z: new THREE.Vector3(),
    c: new THREE.Vector3(), p: new THREE.Vector3(), q: new THREE.Quaternion(), q2: new THREE.Quaternion(), m: new THREE.Matrix4(), s: new THREE.Vector3(),
    snout: new THREE.Vector3(), hasSnout: false, focus: new THREE.Vector3(), focusR: 0 };
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
    // the pool fill leans gold: added over cold indigo water, a redder amber reads copper/rose
    // (no reach ring: the soft pool itself shows how far the light goes, DESIGN §19.1)
    pool.mat.uniforms.uColor.value.copy(lc).lerp(new THREE.Color(0xffc46a), 0.45);
  }
  function autoRaftLevel() {
    if (st.raftLevelExplicit) return;
    const run = ctx.state?.run;
    let total = 0;
    for (const u of D().UPGRADES || []) if (u.category === 'raft') total += run?.upgrades?.[u.id] || 0;
    raft.setLevel(total >= 7 ? 3 : total >= 4 ? 2 : total >= 1 ? 1 : 0);
  }
  function releaseCatch(keepMeasure = false) {
    const f = st.catchFish;
    try { f?.setWarm?.(0); } catch { /* visual */ }
    st.catchFish = null;
    wick.setHolding(false);
    if (f?.object3d && (f.object3d.parent === wick.holdAnchor || f.object3d.parent === catchHolder)) f.object3d.parent.remove(f.object3d);
    if (!keepMeasure) endMeasure();
    else { st.meas.auto = null; st.meas.from = null; st.meas.blend = 1; }
  }
  /** Give Murk's lamp light back exactly as it was (the ceremony borrowed it as a candle fill while he was away). */
  function restoreFill() {
    const FL = st.meas.fill, ml = merchantR.light;
    if (FL.saved) {
      ml.color.copy(FL.saved.color); ml.distance = FL.saved.distance; ml.decay = FL.saved.decay;
      if (merchantR.mode === 'hidden') ml.intensity = 0;
    }
    FL.saved = null; FL.k = 0;
  }
  /** The ceremony is over (catch released, a new lake, death): the Wick goes home and the cord rolls up. */
  function endMeasure() {
    const M = st.meas;
    M.pose = null; M.cerPose = null; M.auto = null; M.active = null; M.from = null; M.blend = 1; M.idleT = 0;
    M.cord.explicit = false; M.cord.show = false; M.cord.autoShow = false; M.cord.L = 0;
  }
  function clearEat() {
    if (st.eatFish) { try { st.eatFish.dispose(); } catch { /* ignore */ } st.eatFish = null; }
  }
  function resetTransient() {
    st.line.visible = false; st.bob.visible = false; line.mesh.visible = false; bobber.group.visible = false; bobRing.visible = false;
    releaseCatch(); clearEat(); endMeasure();
    wick.group.position.copy(WICK_HOME);
    wick.setAim(null); wick.setPose(null); wick.setCharge(0); wick.setReel(0, 0);
    st.celebratePending = false;
  }

  // ---------------------------------------------------------------- API
  const merchant = {
    get present() { return merchantR.present; },
    get position() { return merchantR.position; },
    get object3d() { return merchantR.object3d; },
    get light() { return merchantR.light; },
    arrive(position, yaw = 0, opts) { restoreFill(); st.arriveFrame = ctx.time?.frame ?? -1; merchantR.arrive(position, yaw, opts); },
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
              // a measured v3 Fish carries its true length (cm) and size score; a v1 fish its weight
              const size = Number(fish.length) > 0 && Number.isFinite(fish.z) ? { z: fish.z, lengthCm: fish.length } : fish.weight;
              const fv = ctx.models.createFish(fish.speciesId, size);
              if (fv?.object3d) { st.eatFish = fv; st.eatT = 0; wick.holdAnchor.add(fv.object3d); }
            }
          } catch { st.eatFish = null; }
          wick.setPose('eat');
        } else if (action === 'render') { releaseCatch(); wick.setPose('toss'); st.brazierDelay = 0.42; }
        else if (action === 'release' || action === 'sell' || action === 'keep') { /* catch card closes → showCatch(null) from the owner */ }
      });
      bus.on('fish:landed', ({ isNew, isRecord } = {}) => { if (isNew || isRecord) st.celebratePending = true; });
      // v3: the seal stamps (records written): a satisfied bob, the head flame flares, the lantern breathes up
      bus.on('fish:measured', () => { wick.stamp(); st.boost = Math.max(st.boost, 0.4); });
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
      // water height under the bow / stern / left / right (raft-local → world)
      const hF = H(px + 1.25 * s, pz + 1.25 * c), hB = H(px - 1.25 * s, pz - 1.25 * c);
      const hL = H(px + 0.95 * c, pz - 0.95 * s), hR = H(px - 0.95 * c, pz + 0.95 * s);
      const avg = (hF + hB + hL + hR) / 4;
      localVel.set(vx * c - vz * s, 0, vx * s + vz * c);
      const dHead = Math.atan2(Math.sin(heading - st.prevHeading), Math.cos(heading - st.prevHeading));
      if (dt > 0 && Math.abs(dHead) / dt > 8) { st.prevHeading = heading; st.turn = 0; st.accLocal.set(0, 0, 0); st.prevVel.copy(localVel); } // teleport / respawn
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
      // once the float is out, face it directly (independent of any yaw convention used by setAim)
      env.targetYaw = null;
      if (env.fishingBusy || st.line.visible) {
        const tx = st.bob.visible ? st.bob.pos.x : st.line.hasEnd && st.line.visible ? st.line.end.x : null;
        const tz = st.bob.visible ? st.bob.pos.z : st.line.end.z;
        if (tx !== null && st.bob.state !== 'flying' && Math.hypot(tx - px, tz - pz) > 1.2) env.targetYaw = Math.atan2(-(tx - px), -(tz - pz));
      }
      if (ctx.flow === 'dead' && !wick.dead) wick.setPose('die');
      if (st.celebratePending && !st.catchFish && wick.pose !== 'eat') { st.celebratePending = false; wick.setPose('celebrate'); }
      // v3 measuring: which pose (explicit > the ceremony view > the held fish's own), where the Wick stands
      mv.hasSnout = false;
      const mp = resolveMeasure(dt);
      env.measurePose = mp;
      if (mp) { const dh = camPos.distanceTo(wick.group.getWorldPosition(tmp2)); env.closeK = clamp((8.5 - dh) / 5, 0, 1); } else env.closeK = 0;
      { // the close-up's exposure (eased): the lantern right over the Wick comes down while the camera is near
        const M = st.meas; M.expo = damp(M.expo, env.closeK, 6, dt); if (Math.abs(M.expo - env.closeK) < 1e-3) M.expo = env.closeK;
      }
      if (mp) wick.setMeasure({ lenB: measureLength() / Math.max(0.1, wick.group.scale.x), side: st.meas.side, faceYaw: mp === 'measureAlongside' ? st.meas.side * Math.PI / 2 : null });
      { // an alongside fish: the Wick kneels at the deck's edge on its side, then walks home
        const hx = mp === 'measureAlongside' ? st.meas.side * 0.6 : WICK_HOME.x, hz = mp === 'measureAlongside' ? 0.3 : WICK_HOME.z;
        wick.group.position.x = damp(wick.group.position.x, hx, 4.5, dt); wick.group.position.z = damp(wick.group.position.z, hz, 4.5, dt);
      }
      wick.update(dt, t, env);

      // ---------------------------------------------------------- catch display
      const fv = st.catchFish;
      if (fv) {
        const obj = fv.object3d;
        if (!obj || (obj.parent !== wick.holdAnchor && obj.parent !== catchHolder)) { st.catchFish = null; wick.setHolding(false); }
        else if (mp) {
          if (obj.parent !== catchHolder) beginHandOver(obj);   // a measuring pose arrived for a fish held the v1 way
          placeMeasured(fv, mp, dt, t);
        } else if (st.catchBig) {
          if (obj.parent !== catchHolder) catchHolder.add(obj);
          wick.getRodTip(tip);
          obj.position.set(tip.x, tip.y - fv.length * 0.5 - 0.12, tip.z);
          tmp.subVectors(camPos, obj.position);
          // hang head-up, flank toward the camera (rays present their disc instead)
          obj.rotation.set(-Math.PI / 2, fv.shape === 'ray' ? Math.atan2(-tmp.x, -tmp.z) : Math.atan2(-tmp.z, tmp.x), 0, 'YXZ');
          obj.scale.setScalar(1);
          try { fv.update?.(dt, t, { swim: 0.2, struggle: 0.35 + Math.max(0, Math.sin(t * 2.1)) * 0.4 }); } catch { /* visual */ }
        } else {
          if (obj.parent !== wick.holdAnchor) wick.holdAnchor.add(obj);   // (a measuring pose ended while the fish stays shown)
          obj.position.set(0, 0, 0); obj.rotation.set(0, Math.PI / 2, 0); obj.scale.setScalar(1);
          try { fv.update?.(dt, t, { swim: 0.35, struggle: 0.25 + Math.max(0, Math.sin(t * 1.7)) * 0.35 }); } catch { /* visual */ }
        }
      }
      if (mp && wick.stowed?.visible) {   // a close-up from the bow: the stowed rod would stand in front of the subject like a post
        const dSub = camPos.distanceTo(mv.focusR > 0 ? mv.focus : wick.group.getWorldPosition(tmp));
        wick.stowed.updateWorldMatrix(true, false);
        let near = Infinity;
        for (const y of [0, 0.5, 1.0, 1.5, 2.0]) near = Math.min(near, camPos.distanceTo(tmp2.set(0, y, 0).applyMatrix4(wick.stowed.matrixWorld)));
        if (near < dSub * 0.9) wick.stowed.visible = false;
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
      let lineT = L.tension, lineS = L.slack;
      if (!lineEnd && mp === 'measureHang' && mv.hasSnout) { lineEnd = mv.snout; lineT = clamp(0.35 + measureLength() * 0.12, 0.35, 0.7); lineS = 0; }   // the fish's weight on the tip
      wick.bendRod(lineEnd, lineT);
      if (lineEnd) {
        wick.getRodTip(tip);
        line.shape(tip, lineEnd, lineS, lineT, t, hasWater() ? H : null);
        line.ribbon(camPos);
        line.mesh.visible = true;
      } else line.mesh.visible = false;
      updateCord(dt, mp);
      if (st.snapT > 0) { st.snapT -= dt; }

      // ---------------------------------------------------------- lantern, light, pool
      const xk = st.meas.expo;   // 0 outside a measuring close-up: everything below is then exactly the v1 lantern
      if (mp) st.boost = Math.max(st.boost, 0.16 * (1 - xk));   // the lantern leans in on the ceremony (seen from afar)
      st.lanternCur = damp(st.lanternCur, st.lantern, 3, dt);
      st.radiusCur = damp(st.radiusCur, st.radius, 3, dt);
      st.boost = Math.max(0, st.boost - dt * 1.1);
      const lv = st.lanternCur, low = lv < 0.25 ? 1 - lv / 0.25 : 0;
      const flick = 1 + Math.sin(t * 7.1) * 0.035 + Math.sin(t * 12.7 + 1.3) * 0.025 + Math.sin(t * 23.3) * 0.015
        + low * (Math.sin(t * 17) * 0.12 + (Math.sin(t * 3.1) > 0.92 ? -0.35 : 0));
      const lit = st.lantern > 0.001 && !st.out;
      const glow = lit ? (0.22 + 0.78 * lv) * flick * (1 + st.boost * 1.6 * (1 - 0.7 * xk)) : 0;
      // in a close-up the lantern hangs half a metre over the pale wax head: it comes down so the Wick reads, warm, not white
      lanternLight.intensity = 9.5 * glow * (1 - 0.5 * xk);
      lanternLight.distance = Math.max(7, st.radiusCur * 2.1 + 3);
      // a measuring close-up: the hanging lantern's glass, halo and flame would bloom over the subject, so they dim with the
      // camera's nearness to the lantern
      const lck = mp ? clamp((6 - camPos.distanceTo(raft.lantern.getWorldPosition(tmp2))) / 4, 0, 1) * Math.max(xk, 0.5) : 0;
      raft.glassMat.opacity = (0.1 + 0.38 * Math.min(1.5, glow)) * (mp ? 0.75 : 1) * (1 - 0.45 * lck);
      raft.halo.material.opacity = 0.26 * Math.min(1.6, glow) * (1 - 0.85 * lck);
      raft.lflame.outerMat.uniforms.uI.value = LFLAME_I * (1 - 0.45 * lck);
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
      // the ceremony's candle fill: a soft warm light on the held fish's flank. No new light (the light count stays stable):
      // while Murk is away his lamp's PointLight (always in the scene, dark) is borrowed, then given back as it was
      const FL = st.meas.fill, borrow = !!mp && merchantR.mode === 'hidden';
      FL.k = damp(FL.k, borrow ? 1 : 0, borrow ? 5 : 8, dt);
      if (FL.k > 0.01 && merchantR.mode === 'hidden') {
        const ml = merchantR.light;
        if (!FL.saved) FL.saved = { color: ml.color.clone(), distance: ml.distance, decay: ml.decay };
        // low and in front of the held fish, toward the camera: a soft warm glow on its flank (not on the pale wax head)
        const fo = st.catchFish?.object3d;
        if (fo && fo.parent === catchHolder) tmp.copy(fo.position); else wick.flame.group.getWorldPosition(tmp).y -= 0.35;
        const L = st.catchFish?.length || 0.5;
        tmp2.subVectors(camPos, tmp); tmp2.y = 0; if (tmp2.lengthSq() > 1e-6) tmp.addScaledVector(tmp2.normalize(), 0.45 + Math.min(1.2, L * 0.25));
        tmp.y -= 0.02;
        if (ml.parent) ml.parent.worldToLocal(ml.position.copy(tmp)); else ml.position.copy(tmp);
        ml.color.copy(wick.flameColor).lerp(FILL_WARM, 0.6);
        ml.distance = 2.5 + Math.min(4, L * 0.8); ml.decay = 1.6;
        ml.intensity = (0.5 + Math.min(1.5, L * 0.25)) * FL.k * (0.94 + Math.sin(st.t * 9.3) * 0.04 + Math.sin(st.t * 14.1) * 0.02);
      } else if (FL.saved) restoreFill();
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
    setPose(name) {
      if (MEASURE.has(name)) { st.meas.pose = name; st.meas.idleT = 0; return; }   // v3 measuring poses (held until another base pose)
      if (name === 'die') releaseCatch();
      if (!name || ONE_SHOT[name] === undefined) st.meas.pose = null;
      wick.setPose(name);
    },
    /** v3: the knotted cord along the held fish, unrolled to k (0 → 1); lengthM ≤ 0 / null rolls it away (CONTRACT §13.7). */
    showCord(lengthM, k = 1) {
      const C = st.meas.cord, L = Number(lengthM);
      C.explicit = true;
      if (!(L > 0)) { C.show = false; return; }
      C.L = L; C.k = clamp(Number.isFinite(Number(k)) ? Number(k) : 1, 0, 1); C.show = true;
    },
    /** The measuring pose for a fish of lengthM metres (DESIGN §25.6.8: palm < 0.25 · arms < 0.85 · hang < 2.0 · alongside, legends alongside). */
    measurePoseFor(lengthM, opts = {}) { return measurePoseFor(lengthM, { poses: D().BALANCE?.ceremony?.poses, ...opts }); },
    /** While a measuring pose is up: the sphere around the fish and the Wick (for the trophy camera), else null. */
    getMeasureFocus(out = new THREE.Vector3()) {
      if (!st.meas.active || !(mv.focusR > 0)) return null;
      return { center: out.copy(mv.focus), radius: mv.focusR, pose: st.meas.active };
    },
    get measurePose() { return st.meas.active; },
    /** The laid cord (tests, ui): {k, length, start, end (the fully laid end), radius} or null while rolled up. */
    getCordInfo() {
      if (!cord.visible) return null;
      return { k: cord.k, length: cord.length, start: cord.pointAt(0, new THREE.Vector3()), end: cord.pointAt(1, new THREE.Vector3()), radius: cord.radius };
    },
    get cordK() { return cord.visible ? cord.k : 0; },
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
      if (!fishVisual || !fishVisual.object3d) { releaseCatch(); return; }
      releaseCatch(true);   // an explicit measuring pose / cord set just before the hand-over stays
      st.catchFish = fishVisual;
      st.catchBig = (fishVisual.length || 0) > 1.05;
      // v3: a fish at true scale (or one handed over during a ceremony) is held in world space at its true size and takes
      // its measuring pose by length; it eases in from wherever fishing left it
      if (fishVisual.trueScale === true || st.meas.pose || st.meas.cerPose) {
        st.meas.auto = fishVisual.trueScale === true ? api.measurePoseFor(fishVisual.length, { legendary: !!fishVisual.legendary }) : null;
        beginHandOver(fishVisual.object3d);
        wick.setHolding(true, false);
        return;
      }
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
      cord.dispose();
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
      ringMat.color.set(B.state === 'bite' ? 0xff5a3a : 0xead6a8);   // pale gold-stone ripple (transient), red on a bite
      ringMat.opacity = (1 - ph) * (B.state === 'bite' ? 0.9 : 0.5);
    } else bobRing.visible = false;
  }

  // ---------------------------------------------------------------- v3 measuring ceremony (DESIGN §25.6.8)
  function viewMeasure() {
    try { const m = ctx.fishing?.view?.measure; return m && typeof m === 'object' && typeof m.phase === 'string' ? m : null; } catch { return null; }
  }
  /** Which measuring pose is up this frame: explicit setPose > fishing.view.measure > the held v3 fish's own (by length). */
  function resolveMeasure(dt) {
    const M = st.meas, fv = st.catchFish, vm = viewMeasure();
    if (vm) {
      if (vm.phase !== M.vphase) { M.vphase = vm.phase; M.vphaseT = 0; } else M.vphaseT += dt;
      const lenM = fv?.trueScale ? fv.length : Number(vm.length) > 0 ? Number(vm.length) / 100 : (fv?.length || 0);
      M.cerPose = vm.phase === 'scoop' || !(lenM > 0) ? null : api.measurePoseFor(lenM, { legendary: !!(fv?.legendary || vm.legendary) });
      M.cord.autoL = lenM;
      if (vm.phase === 'cord') {
        const d = Number(vm.cordDur ?? vm.dur);
        const dur = d > 0 ? d : cordDurationFor(D(), vm.sizeClass, { short: ctx.combat?.swarmActive === true });
        M.cord.autoK = cordEase(M.vphaseT / dur); M.cord.autoShow = true;
      } else if (vm.phase === 'banners' || vm.phase === 'card') { M.cord.autoK = 1; M.cord.autoShow = true; }
      else { M.cord.autoK = 0; M.cord.autoShow = false; }
    } else if (M.vphase !== null) { M.vphase = null; M.cerPose = null; M.cord.autoShow = false; }
    // an explicit pose outliving its ceremony (no fish, no view, no cinematic) lets go after a second
    if (M.pose && !vm && !fv && !ctx.cinematic) { M.idleT += dt; if (M.idleT > 1) M.pose = null; } else M.idleT = 0;
    const active = M.pose || M.cerPose || (fv ? M.auto : null) || null;
    if (active !== M.active) {
      if (active === 'measureAlongside') M.side = pickSide();
      M.active = active; M.t = 0;
    } else M.t += dt;
    return active;
  }
  function measureLength() {
    const M = st.meas;
    return st.catchFish?.length || (M.cord.explicit ? M.cord.L : M.cord.autoL) || 0.5;
  }
  /** The raft side (+1 = raft-local +x) nearer the camera: an alongside fish lies there, in full view. */
  function pickSide() {
    raft.yawGroup.updateMatrixWorld();
    mv.p.copy(camPos); raft.yawGroup.worldToLocal(mv.p);
    return mv.p.x >= 0 ? 1 : -1;
  }
  /** Move the fish into world space at its true size, easing from where it was (fishing's landing spot, or the hands). */
  function beginHandOver(obj) {
    const M = st.meas;
    if (obj.parent) {
      obj.updateMatrixWorld();
      M.from = { pos: obj.getWorldPosition(new THREE.Vector3()), quat: obj.getWorldQuaternion(new THREE.Quaternion()) };
      M.blend = 0;
    } else { M.from = null; M.blend = 1; }
    catchHolder.add(obj);
    obj.scale.setScalar(1);
  }
  const pulse = (t, period, len) => { const ph = (((t % period) + period) % period) / period; return ph < len ? Math.sin((ph / len) * Math.PI) : 0; };
  /** Pose the held fish for the measuring pose: on the cupped palms, across the arms, off the rod tip, or alongside. */
  function placeMeasured(fv, mp, dt, t) {
    const obj = fv.object3d, M = st.meas, L = fv.length || 0.5;
    const b = fv.bounds || { noseZ: L * 0.5, tailZ: -L * 0.5, halfW: L * 0.07, top: L * 0.1, bottom: -L * 0.1 };
    const ray = fv.shape === 'ray', midZ = (b.noseZ + b.tailZ) / 2;
    let swim = 0.2, struggle = 0.12;
    if (mp === 'measurePalm' || mp === 'measureArms') {
      wick.getHandPos('r', mv.hR); wick.getHandPos('l', mv.hL);
      mv.a.subVectors(mv.hL, mv.hR); mv.a.y = 0;
      if (mv.a.lengthSq() < 1e-6) { wick.group.getWorldQuaternion(mv.q2); mv.a.set(1, 0, 0).applyQuaternion(mv.q2); mv.a.y = 0; }
      mv.a.normalize();
      mv.z.copy(mv.a); mv.y.copy(UP);   // nose toward the left hand, back up
      if (ray) { mv.s.subVectors(camPos, mv.hR); mv.s.y = 0; if (mv.s.lengthSq() > 1e-6) mv.y.addScaledVector(mv.s.normalize(), 1.3); mv.y.addScaledVector(mv.z, -mv.y.dot(mv.z)).normalize(); }   // a ray shows us its disc
      mv.x.crossVectors(mv.y, mv.z).normalize();
      if (mp === 'measurePalm' && !ray) {   // a fish in cupped hands lists onto its side: the flank facing us tips up 30°
        mv.s.subVectors(camPos, mv.hR);
        const sx = mv.x.dot(mv.s) >= 0 ? 1 : -1;
        mv.s.copy(mv.x).multiplyScalar(sx * Math.cos(0.52)).addScaledVector(UP, Math.sin(0.52)).normalize();   // the tipped flank normal
        mv.x.copy(mv.s).multiplyScalar(sx); mv.y.crossVectors(mv.z, mv.x).normalize();
      }
      const handR = 0.046 * wick.group.scale.x;
      mv.c.addVectors(mv.hR, mv.hL).multiplyScalar(0.5);
      mv.c.addScaledVector(UP, mp === 'measurePalm' ? handR * 1.1 - b.bottom : handR * 0.4 - b.bottom * 0.4).addScaledVector(mv.z, -midZ);
      swim = mp === 'measurePalm' ? 0.22 : 0.3; struggle = 0.08 + pulse(t, 2.7, 0.2) * 0.75;
    } else if (mp === 'measureHang') {
      wick.getRodTip(tip);
      mv.snout.copy(tip).addScaledVector(UP, -(0.05 + Math.min(0.22, L * 0.06))); mv.hasSnout = true;
      mv.s.subVectors(camPos, mv.snout); mv.s.y = 0; if (mv.s.lengthSq() < 1e-6) mv.s.set(0, 0, 1); mv.s.normalize();   // toward the camera
      const swing = 0.2 * Math.sin(M.t * 2.2) * Math.exp(-M.t / 2.2) + 0.035 * Math.sin(t * 0.9);   // a pendulum that settles
      mv.z.copy(UP).applyAxisAngle(mv.s, swing);
      if (ray) { mv.y.copy(mv.s); mv.y.addScaledVector(mv.z, -mv.y.dot(mv.z)).normalize(); mv.x.crossVectors(mv.y, mv.z).normalize(); }   // the disc to the camera
      else { mv.x.copy(mv.s); mv.x.addScaledVector(mv.z, -mv.x.dot(mv.z)).normalize(); mv.y.crossVectors(mv.z, mv.x).normalize(); }   // the flank to the camera
      mv.c.copy(mv.snout).addScaledVector(mv.z, -b.noseZ);
      swim = 0.12; struggle = 0.14 + pulse(t, 3.1, 0.18) * 0.8;
    } else {   // alongside: on its side at the surface, beside the raft, snout by the kneeling Wick, tail toward the stern
      raft.yawGroup.updateMatrixWorld();
      const rad = ray ? b.halfW : Math.max(b.halfW, (b.top - b.bottom) * 0.5);
      mv.p.set(M.side * (1.2 + rad * 1.05), 0, 0.45 - b.noseZ).applyMatrix4(raft.yawGroup.matrixWorld);
      mv.z.set(0, 0, 1).transformDirection(raft.yawGroup.matrixWorld); mv.z.y = 0; mv.z.normalize();
      if (ray) { mv.y.copy(UP); mv.x.crossVectors(mv.y, mv.z).normalize(); }   // a ray lies flat, disc up
      else {   // the flank faces the camera, tipped at least 30° up: it lies on its side, spent
        mv.s.subVectors(camPos, mv.p); mv.s.addScaledVector(mv.z, -mv.s.dot(mv.z));
        let hx = mv.s.x, hz = mv.s.z; const hl = Math.hypot(hx, hz);
        if (hl < 1e-4) { hx = -mv.z.z * M.side; hz = mv.z.x * M.side; } else { hx /= hl; hz /= hl; }
        const phi = Math.max(Math.atan2(Math.max(0, mv.s.y), Math.max(1e-4, hl)), 0.52);
        mv.x.set(hx * Math.cos(phi), Math.sin(phi), hz * Math.cos(phi));
        mv.y.crossVectors(mv.z, mv.x).normalize();
      }
      mv.c.copy(mv.p);
      mv.c.y = H(mv.p.x, mv.p.z) + (ray ? 0.02 : (b.top - b.bottom) * 0.08) + Math.sin(t * 1.1) * 0.012 * Math.min(2, 1 + L * 0.2);
      swim = 0.08; struggle = 0.03 + pulse(t, 3.7, 0.16) * 0.45;
      M.rippleT -= dt;
      if (M.rippleT <= 0) {   // the water laps at its tail and flank
        M.rippleT = 0.8 + Math.random() * 0.9;
        mv.s.copy(mv.c).addScaledVector(mv.z, b.tailZ * (0.6 + Math.random() * 0.4));
        ctx.water?.addRipple?.(mv.s.x, mv.s.z, 0.35 + Math.min(2, L * 0.12));
      }
    }
    mv.m.makeBasis(mv.x, mv.y, mv.z); mv.q.setFromRotationMatrix(mv.m);
    if (M.from && M.blend < 1) {
      M.blend = Math.min(1, M.blend + dt / 0.45);
      const e = M.blend * M.blend * (3 - 2 * M.blend);
      obj.position.lerpVectors(M.from.pos, mv.c, e); obj.quaternion.slerpQuaternions(M.from.quat, mv.q, e);
    } else { obj.position.copy(mv.c); obj.quaternion.copy(mv.q); }
    obj.scale.setScalar(1);
    try { fv.update?.(dt, t, { swim, struggle }); fv.setWarm?.(Math.min(1, M.blend * 1.2)); } catch { /* visual */ }
    // the trophy camera's subject: the fish and the Wick
    wick.flame.group.getWorldPosition(mv.s);
    // (weighted toward the fish: a palm-sized catch is the subject, the Wick's face its frame)
    const wf = mp === 'measurePalm' ? 0.75 : mp === 'measureArms' ? 0.6 : mp === 'measureHang' ? 0.55 : 0.62;
    mv.focus.copy(mv.s).lerp(obj.position, wf);
    mv.focusR = obj.position.distanceTo(mv.s) * Math.max(wf, 1 - wf) + Math.max(L * 0.5, 0.35);
  }
  /** Lay the cord along the held fish's flank (the side facing the camera), snout → tail tip. */
  function placeCord(fv) {
    const obj = fv.object3d, L = fv.length || 0.5;
    const b = fv.bounds || { noseZ: L * 0.5, tailZ: -L * 0.5, halfW: L * 0.07, top: L * 0.1, bottom: -L * 0.1 };
    obj.updateMatrixWorld();
    mv.x.setFromMatrixColumn(obj.matrixWorld, 0).normalize();
    mv.y.setFromMatrixColumn(obj.matrixWorld, 1).normalize();
    mv.z.setFromMatrixColumn(obj.matrixWorld, 2).normalize();
    const ray = fv.shape === 'ray';
    // the snout: on the body's mid-line for a big fish; on a small one the knots would hide the flank, so its cord runs along
    // the belly edge, between the fish and the palms (touching the belly, sagging only a little)
    const low = ray ? 0 : clamp((0.45 - L) / 0.2, 0, 1);
    // (bounds.bottom is the fin tips: the belly line sits about 60% of the way down from the mid-line)
    mv.p.set(0, ray ? 0 : THREE.MathUtils.lerp((b.top + b.bottom) * 0.5, THREE.MathUtils.lerp((b.top + b.bottom) * 0.5, b.bottom, 0.6), low), b.noseZ).applyMatrix4(obj.matrixWorld);
    mv.s.subVectors(camPos, mv.p);
    const n = ray ? mv.y : mv.x;   // the face of the fish toward which the cord lies (flank, or a ray's disc)
    const cz = mv.c.copy(n).multiplyScalar(n.dot(mv.s) >= 0 ? 1 : -1);
    const cx = mv.a.copy(mv.z).negate();
    const cy = mv.hR.crossVectors(cz, cx).normalize();
    cord.place(mv.p, cx, cy, cz, 1 - 0.75 * low);
  }
  function updateCord(dt, mp) {
    const C = st.meas.cord, fv = st.catchFish;
    const L = C.explicit ? C.L : C.autoL, k = C.explicit ? C.k : C.autoK;
    const show = (C.explicit ? C.show : C.autoShow) && L > 0 && (!!fv || !!mp);
    if (show) {
      const b = fv?.bounds;
      cord.ensure(L, fv ? (fv.shape === 'ray' ? Math.max(0.005, b?.top ?? 0.02) : (b?.halfW ?? L * 0.07)) : 0);
      if (fv && fv.object3d?.parent === catchHolder) placeCord(fv);
      else {   // no fish in hand: lay it across the Wick's hands
        wick.getHandPos('r', mv.hR); wick.getHandPos('l', mv.hL);
        mv.a.subVectors(mv.hL, mv.hR); mv.a.y = 0; if (mv.a.lengthSq() < 1e-6) mv.a.set(1, 0, 0); mv.a.normalize();
        mv.p.addVectors(mv.hR, mv.hL).multiplyScalar(0.5).addScaledVector(mv.a, -L / 2);
        mv.s.subVectors(camPos, mv.p); mv.s.y = 0; mv.s.addScaledVector(mv.a, -mv.s.dot(mv.a)); if (mv.s.lengthSq() < 1e-6) mv.s.set(0, 0, 1); mv.s.normalize();
        mv.y.crossVectors(mv.s, mv.a).normalize();
        cord.place(mv.p, mv.a, mv.y, mv.s);
      }
    }
    C.kShow = k >= C.kShow ? damp(C.kShow, k, 24, dt) : k;   // smooth any coarse steps upward; snap back down
    if (Math.abs(k - C.kShow) < 1e-3) C.kShow = k;
    const passed = cord.update(dt, { k: C.kShow, show });
    if (passed.length && ctx.models?.emitEmber) {   // warm motes rise from each knot as it is laid
      const r = cord.radius;
      for (const kn of passed) {
        cord.pointAt(kn.u, mv.s);
        for (let i = 0; i < (kn.great ? 4 : 2); i++) ctx.models.emitEmber(mv.s, { color: kn.great ? 0xffc46a : 0xffd9a0, vy: 0.35 + r * 30, spread: 0.12 + r * 20, size: 0.025 + r * 4, sizeGrow: -0.01, lifeT: 0.9, alpha: 0.9, jitter: r * 2 });
      }
    }
    // the alongside leader: a short line from the kneeling Wick's hand to the cord's ring at the snout
    if (mp === 'measureAlongside' && cord.visible && !line.mesh.visible) {
      wick.getHandPos('r', mv.hR); cord.pointAt(0, mv.s);
      line.shape(mv.hR, mv.s, 0.35, 0.1, st.t, null);
      line.ribbon(camPos);
      line.mesh.visible = true;
    }
  }

  return api;
}
