// loop-tow.js — the tow (M1 step 5b, LANE 5B-TOW; docs/loop/OPENING.md §6.2 rev. 5, SPEC §6.5, M1.md §2.1, §2.13, §3.5).
// One component every water's first tow reuses, in two halves: its leg on the drawn Chart (src/ui-tow.js draws it: the road's
// piece, the raft's mark towing the barge's on a line, Murk's barge alongside, the water's sheet inking in as they arrive in the
// opening), one ink dip into the water, then the glide in: the barge brought in to its mooring in the water, the raft at its stern
// on a short line, Murk's barge alongside, the home camera easing to the mooring's framing. In M1 only the opening plays it (the
// Landing to the Mossmere, up the Sluice Run); every later water's first Sail will call the same playTow(water).
//
//   pure (node: tools/tests/loop-tow.test.mjs): legProgress · towPhases · TOW_PHASES
//   createLoopTow(deps) → {opening({from, arrive}), playTow(water, {onDone}), update(dt), tap(), active(), state(), debug(cmd)}
//
// The opening (OPENING §6.2): the film's last frame → one ink dip → the Landing on the Chart (arrive, 1.5 s or a tap) → the wake (the
// Wick's mark kindles; Murk's wake line, the tutorial's own; 1 s after it, or a tap once it shows) → the tow. The save: when the tow
// begins, before it plays, meta.loop.barge.towed gains the water (loop.towBarge), the tutorial's step reads 'tow' and the game saves,
// so a reload mid-tow lands at the mooring and resumes at the chart beat (loop-tutorial.js). A tap ends the leg (the sheet inked at
// once) and a tap ends the glide in (at the mooring: loop-home's skipHomeGlide). Reduced motion inks the leg at once and holds
// LOOP.tow.leg.reducedHold s, and cuts the glide in to the mooring. No words; never a ring or a disc round the raft or the barge.
import { murkHold } from './first-evening.js';
import { registerTowSfx } from './audio-tow.js';

const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** The director's phases, in order (the opening's first four only in the opening). */
export const TOW_PHASES = Object.freeze(['dipIn', 'dipOut', 'arrive', 'wake', 'leg', 'dip', 'dipHold', 'dipClear', 'glide', 'done']);

/**
 * The raft's way along the leg at time t (0..1): `base` s of travel shared by distance, and a hold of (legS − base) / n s at each
 * crossing (a lock flight, a fall, a sea passage), where it creeps through a short span (±`w`) instead of stopping. Pure.
 */
export function legProgress(t, legS, crossings = [], base = 4, w = 0.02) {
  const T = Math.max(0.01, num(legS, 4)), tt = Math.max(0, num(t, 0));
  if (tt >= T) return 1;
  const cs = (Array.isArray(crossings) ? crossings : []).map((c) => clamp01(num(c?.at ?? c, 0.5))).filter((c) => c > w && c < 1 - w).sort((a, b) => a - b);
  const move = Math.min(T, Math.max(0.01, num(base, 4))), hold = cs.length ? Math.max(0, (T - move) / cs.length) : 0;
  const moveLen = Math.max(1e-6, 1 - 2 * w * cs.length), seg = [];
  let u = 0;
  for (const c of cs) { seg.push({ u0: u, u1: c - w, d: (move * (c - w - u)) / moveLen }); seg.push({ u0: c - w, u1: c + w, d: hold }); u = c + w; }
  seg.push({ u0: u, u1: 1, d: (move * (1 - u)) / moveLen });
  const total = seg.reduce((a, s) => a + s.d, 0), scale = total > 0 ? T / total : 1;
  let acc = 0;
  for (const s of seg) {
    const d = s.d * scale;
    if (tt <= acc + d || s === seg[seg.length - 1]) { const p = d > 0 ? clamp01((tt - acc) / d) : 1; return s.u0 + (s.u1 - s.u0) * p; }
    acc += d;
  }
  return 1;
}

/** Each part's seconds for a tow (gated on its own, M1 §4 step 5b): {arrive, wake, leg, dip, glide} (arrive and wake: the opening). */
export function towPhases(D, water, { opening = false, reduced = false, wick = null } = {}) {
  const T = D?.LOOP?.tow || {}, plan = typeof D?.towPlan === 'function' ? D.towPlan(water, { reduced }, T) : null;
  const wake = D?.TEXT_LOOP?.murk?.wake || '';
  const hold = wake ? murkHold(wake, D?.FIRST_EVENING?.lines || {}) : 0;
  void wick;
  return {
    landingDip: opening ? num(T.landing?.dip, 0.6) : 0, arrive: opening ? num(T.landing?.arrive, 1.5) : 0,
    wake: opening ? hold + num(T.landing?.wakeAfter, 1) : 0, lineHold: opening ? hold : 0,
    leg: plan ? plan.legS : 0, dip: plan ? plan.dip : num(T.dip, 0.6), glide: plan ? plan.glide : 0,
  };
}

/**
 * deps: {ctx, data, report(where, err), home: () => loopHome (its glideHome, moorMurk), save(), reduced() → bool}
 */
export function createLoopTow(deps) {
  const { ctx, data: D, report = () => {}, home = () => null, save = () => {} } = deps;
  const T = () => D?.LOOP?.tow || {};
  const safe = (fn, d = null) => { try { const v = fn(); return v === undefined ? d : v; } catch (e) { report('tow', e); return d; } };
  const loop = () => { const p = ctx.progression; if (!p || p.isStub) return null; const l = p.loop; return l && typeof l === 'object' && !l.isStub ? l : null; };
  const view = () => { const v = ctx.ui?.loop?.tow; return v && typeof v === 'object' ? v : null; };
  const tut = () => ctx.ui?.loop?.tutorial || null;
  const reduced = typeof deps.reduced === 'function' ? deps.reduced : () => {
    if (ctx.state?.meta?.settings?.reducedMotion === true) return true;
    try { return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true; } catch { return false; }
  };
  const audio = (name, o) => { try { ctx.audio?.play?.(name, o); } catch { /* sound is never the tow's fault */ } };
  const emit = (e, p) => { try { ctx.bus?.emit?.(e, p); } catch (err) { report(`emit ${e}`, err); } };
  try { if (D?.LOOP_ENABLED === true) registerTowSfx(); } catch (e) { report('tow sfx', e); }

  const S = { phase: null, t: 0, water: null, opening: false, from: null, arrive: null, onDone: null, P: null, reduced: false,
    u: 0, ink: 0, kindle: 0, line: null, lineOn: false, dipA: 0, frames: 0, M: null, glide: null, mesh: null, sound: { oar: 0, creak: 0, crossed: 0 },
    marks: [], begun: false, resume: false, clock: 0 };
  // (each mark on the tow's own real clock, S.clock: the seconds its update ran, the waits under a pause left out)
  const mark = (what) => { S.marks.push({ what, phase: S.phase, sim: Math.round(S.clock * 1000) / 1000 }); if (S.marks.length > 40) S.marks.shift(); };

  function go(phase) {
    S.phase = phase; S.t = 0; S.frames = 0;
    mark(phase);
    emit('loop:tow', { phase, water: S.water, opening: S.opening });
  }
  const leg = () => T().legs?.[S.water] || null;

  /** The opening's tow (enterHome's hook): → true when it took over the hand-off (the tow is due and its view is up). */
  function opening({ from = 'intro', arrive = null } = {}) {
    const ml = ctx.state?.meta?.loop;
    if (S.phase || !safe(() => D.towOpeningDue?.(ml, 'mossmere'), false) || !view()) return false;
    S.from = from; S.arrive = arrive; S.onDone = null;
    begin('mossmere', { opening: true });
    // (Continue before the tow began: OPENING §6.2 resumes at the wake, the Landing on the Chart and the line again; no arrive beat)
    S.resume = from === 'title';
    return true;
  }
  /** A water's first tow (SPEC §6.5; every later water's first Sail): its leg on the Chart, the dip, the glide in. → whether it began. */
  function playTow(water, { onDone = null } = {}) {
    if (S.phase || !view() || !T().legs?.[water]) return false;
    S.onDone = onDone; S.arrive = null; S.from = 'tow';
    begin(water, { opening: false });
    return true;
  }
  function begin(water, { opening: op }) {
    S.water = water; S.opening = op; S.reduced = reduced() === true; S.begun = false; S.resume = false; S.M = null;
    S.P = towPhases(D, water, { opening: op, reduced: S.reduced });
    S.u = 0; S.ink = op ? 0 : 1; S.kindle = op ? 0 : 1; S.line = null; S.lineOn = false; S.dipA = 0;
    S.sound = { oar: 0, creak: 0, crossed: 0 };
    if (op) { go('dipIn'); safe(() => tut()?.landingBeat?.('arrive')); }
    else { openView(); beginLeg(); }
  }
  function openView() {
    safe(() => view().open({ water: S.water, opening: S.opening, onTap: () => tap() }));
    paint();
  }
  function paint() {
    safe(() => view()?.paint?.({ phase: S.phase, water: S.water, opening: S.opening, u: S.u, ink: S.ink, kindle: S.kindle, line: S.lineOn ? S.line : null, reduced: S.reduced, t: S.t }));
  }
  /** The tow begins: written first (the barge towed, the tutorial's step 'tow', the save), then the leg plays. */
  function beginLeg() {
    const L = loop();
    safe(() => L?.towBarge?.(S.water));
    if (S.opening) {
      safe(() => tut()?.landingBeat?.('tow'));
      // the Mossmere's sheet inks in on this tow (its one ink-in): the chart beat's first open does not ink it again (ui-chart reads a
      // chosen place as "the Chart has been seen"); open water, as the tutorial's Chart chooses
      const ml = ctx.state?.meta?.loop;
      if (ml && !(ml.chartPick && typeof ml.chartPick === 'object')) ml.chartPick = { water: S.water, place: null };
    }
    safe(() => save());
    S.begun = true;
    go('leg');
    S.lineOn = false;
    if (S.reduced) { S.u = 1; S.ink = 1; }
    audio('tow_creak', { volume: 0.6 });
  }

  /** A tap (or Enter / Space) on the tow's Chart: ends the arrive, the wake once its line shows, or the leg (inked at once). */
  function tap() {
    const p = S.phase;
    if (p === 'arrive') { toWake(); return true; }
    if (p === 'wake') { if (S.lineOn || S.t > 0.05) { beginLeg(); return true; } return false; }
    if (p === 'leg') { S.u = 1; S.ink = 1; paint(); toDip(); return true; }
    if (p === 'glide') { safe(() => home()?.skipHomeGlide?.()); return true; }
    return false;
  }
  function toWake() {
    go('wake');
    const text = D?.TEXT_LOOP?.murk?.wake || '';
    S.line = text || null; S.lineOn = !!text;
    safe(() => tut()?.landingBeat?.('wake'));   // (the machine says the line: firstEvening:line, Murk's grumble)
  }
  function toDip() { go('dip'); }

  /** The dip's full ink: the Chart closes, the water is set up (the raft, the barge, Murk at the glide in's start; the camera on it). */
  function setupWater() {
    safe(() => view()?.close?.());
    const M = safe(() => ctx.world?.getMooring?.(), null);
    S.M = M && M.hull ? M : null;
    if (!S.M) return;
    const d = num(T().glideIn?.[S.water]?.d, 14);
    const p0 = D.towGlidePose(S.M, 0, { d, ease: false });
    placeBoats(p0);
    try { ctx.player?.teleport?.({ x: p0.raft.x, z: p0.raft.z }, p0.raft.yaw); } catch (e) { report('player.teleport', e); }
    try { ctx.render?.snapCamera?.(); } catch (e) { report('render.snapCamera', e); }
    lineMesh(true);
    placeLine(p0);
  }
  function placeBoats(p) {
    if (!p) return;
    try { ctx.actors?.home?.moor?.(p.hull); } catch (e) { report('home.moor', e); }
    if (p.murk && typeof ctx.actors?.merchant?.moor === 'function') {
      const V = ctx.THREE?.Vector3;
      try { ctx.actors.merchant.moor(V ? new V(p.murk.x, 0, p.murk.z) : { x: p.murk.x, y: 0, z: p.murk.z }, p.murk.yaw, { zone: S.water }); } catch (e) { report('merchant.moor', e); }
    }
  }
  // ---- the tow line in the water: one thin rope from the raft's bow to the barge's stern (one draw call, only while it glides in)
  function lineMesh(on) {
    const THREE = ctx.THREE, scene = ctx.render && !ctx.render.isStub ? ctx.render.scene : null;
    if (!on) { if (S.mesh) { try { S.mesh.parent?.remove(S.mesh); S.mesh.geometry.dispose(); S.mesh.material.dispose(); } catch { /* ignore */ } S.mesh = null; } return; }
    if (S.mesh || !THREE || !scene) return;
    try {
      const g = new THREE.CylinderGeometry(0.03, 0.03, 1, 5, 1, true);
      g.rotateX(Math.PI / 2);   // (its length along +Z, so lookAt lays it between the two ends)
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x3e2a30 }));
      m.name = 'tow:line'; m.frustumCulled = false;
      scene.add(m); S.mesh = m;
    } catch (e) { report('tow line', e); S.mesh = null; }
  }
  function placeLine(p) {
    const m = S.mesh, rp = ctx.player?.position;
    if (!m || !p || !rp) return;
    const h = num(ctx.player?.heading, p.raft.yaw), bx = rp.x - Math.sin(h) * 1.1, bz = rp.z - Math.cos(h) * 1.1;
    const dx = p.stern.x - bx, dz = p.stern.z - bz, len = Math.max(0.05, Math.hypot(dx, dz));
    m.position.set((bx + p.stern.x) / 2, 0.5, (bz + p.stern.z) / 2);
    m.scale.set(1, 1, len);
    m.lookAt(p.stern.x, 0.58, p.stern.z);
  }
  /** The glide in: the raft's own glide (loop-home's, so a tap or a skip key ends it at the mooring), the barge and Murk with it. */
  function beginGlide() {
    go('glide');
    safe(() => tut()?.landingBeat?.('glideIn'));
    const M = S.M, H = home();
    const done = () => finish();
    if (!M || S.reduced || !H?.glideHome) {   // (reduced motion, or no glide in this build: cut to the mooring)
      if (M?.raft) { try { ctx.player?.teleport?.({ x: M.raft.x, z: M.raft.z }, M.raft.yaw); } catch (e) { report('player.teleport', e); } }
      done(); return;
    }
    const d = num(T().glideIn?.[S.water]?.d, 14), p0 = D.towGlidePose(M, 0, { d, ease: false });
    S.glide = { from: { x: p0.raft.x, z: p0.raft.z }, d };
    audio('tow_oars', { volume: 0.7 });
    H.glideHome([[p0.raft.x, p0.raft.z], [M.raft.x, M.raft.z]], { duration: S.P.glide, kind: 'towIn', to: M.raft, yaw: M.raft.yaw, done });
  }
  function glidePose() {
    const g = S.glide, M = S.M, rp = ctx.player?.position;
    if (!g || !M || !rp) return null;
    const u = clamp01(Math.hypot(rp.x - g.from.x, rp.z - g.from.z) / Math.max(0.01, g.d));
    return D.towGlidePose(M, u, { d: g.d, ease: false });
  }
  /** The tow's end: everything at its mooring; the opening goes home (home:enter, the chart beat), a later tow its onDone. */
  function finish() {
    if (S.phase === 'done' || !S.phase) return;
    const M = S.M || safe(() => ctx.world?.getMooring?.(), null);
    if (M?.hull) placeBoats(D.towGlidePose(M, 1, { d: 0, ease: false }));
    lineMesh(false);
    S.glide = null; S.dipA = 0;
    safe(() => view()?.dip?.(0));
    go('done');
    const arrive = S.arrive, onDone = S.onDone;
    S.phase = null; S.arrive = null; S.onDone = null;
    if (arrive) { try { arrive(); } catch (e) { report('tow arrive', e); } }
    if (onDone) { try { onDone(); } catch (e) { report('tow onDone', e); } }
  }

  /** The tow dropped (the flow left home): its screen, its dip and its line gone; nothing written, nothing called. */
  function cancel() {
    safe(() => view()?.close?.()); safe(() => view()?.dip?.(0));
    lineMesh(false);
    S.glide = null; S.dipA = 0; S.arrive = null; S.onDone = null;
    mark('cancel');
    S.phase = null;
  }
  /** The tow cut short to its end (its Chart closed under it, or the tutorial done): written as begun, everything at its mooring. */
  function cut() {
    if (!S.begun) {
      const L = loop();
      safe(() => L?.towBarge?.(S.water));
      safe(() => save());
      S.begun = true;
    }
    safe(() => view()?.close?.()); safe(() => view()?.dip?.(0));
    const M = S.M || safe(() => ctx.world?.getMooring?.(), null);
    if (M?.raft) { try { ctx.player?.teleport?.({ x: M.raft.x, z: M.raft.z }, M.raft.yaw); } catch (e) { report('player.teleport', e); } }
    if (S.phase === 'glide') { safe(() => home()?.skipHomeGlide?.()); if (!S.phase) return; }
    mark('cut');
    S.M = M && M.hull ? M : null;
    finish();
  }

  // ---- sound: the oars and the tow line through the leg and the glide in; each crossing its own (the locks, the fall)
  function sounds(dt) {
    const s = S.sound;
    s.oar -= dt; s.creak -= dt;
    if (s.oar <= 0) { audio('tow_oars', { volume: 0.55 }); s.oar = 1.15; }
    if (s.creak <= 0) { audio('tow_creak', { volume: 0.45 }); s.creak = 1.9; }
    const cs = leg()?.crossings || [];
    while (S.phase === 'leg' && s.crossed < cs.length && S.u >= num(cs[s.crossed]?.at, 1) - 0.03) {
      const k = cs[s.crossed]?.kind;
      audio(k === 'fall' ? 'tow_fall' : k === 'sea' ? 'tow_fall' : 'tow_lock', { volume: 0.8 });
      s.crossed++;
    }
  }

  /** Main's frame (real seconds). The clock waits while another screen is over the tow's Chart (the home pause, Settings). */
  function update(dt) {
    if (!S.phase) return;
    const d = Math.max(0, Math.min(0.25, num(dt, 0)));
    const V = view();
    // never stranded (SPEC §6.5: no way to fail): the flow left home (Settings' Forget everything, the title) → the tow is dropped;
    // the opening's tutorial marked done under it (a debug build's shortcut) or its Chart closed by something else → cut to the mooring
    if (ctx.flow !== 'home') { cancel(); return; }
    if (S.opening && safe(() => loop()?.tutorial?.()?.done === true, false)) { cut(); return; }
    if (['arrive', 'wake', 'leg'].includes(S.phase) && V && typeof V.isOpen === 'function' && !V.isOpen()) { cut(); return; }
    const onChart = ['arrive', 'wake', 'leg'].includes(S.phase);
    if (onChart && V && V.isTop && !V.isTop()) return;
    S.t += d; S.frames++; S.clock += d;
    const T0 = T(), P = S.P;
    switch (S.phase) {
      case 'dipIn': {   // the film's last frame → ink
        const half = Math.max(0.01, P.landingDip / 2);
        S.dipA = clamp01(S.t / half); safe(() => V?.dip?.(S.dipA));
        if (S.t >= half) { openView(); go('dipOut'); }
        break;
      }
      case 'dipOut': {  // ink → the Landing on the Chart
        const half = Math.max(0.01, P.landingDip / 2);
        S.dipA = 1 - clamp01(S.t / half); safe(() => V?.dip?.(S.dipA));
        paint();
        if (S.t >= half) { S.dipA = 0; safe(() => V?.dip?.(0)); if (S.resume) toWake(); else go('arrive'); }
        break;
      }
      case 'arrive':
        paint();
        if (S.t >= P.arrive) toWake();
        break;
      case 'wake': {
        S.kindle = S.reduced ? 1 : clamp01(S.t / Math.max(0.05, num(T0.landing?.kindle, 0.8)));
        if (S.lineOn && S.t >= P.lineHold) S.lineOn = false;
        paint();
        if (S.t >= P.wake) beginLeg();
        break;
      }
      case 'leg': {
        if (!S.reduced) {
          const L = leg();
          S.u = Math.max(S.u, legProgress(S.t, P.leg, L?.crossings || [], num(T0.leg?.base, 4)));
          // the opening: the water's sheet inks in as they arrive (the last third of the way)
          if (S.opening) S.ink = Math.max(S.ink, clamp01((S.u - 0.62) / 0.34));
        }
        sounds(d);
        paint();
        if (S.t >= P.leg) toDip();
        break;
      }
      case 'dip': {
        const half = Math.max(0.01, P.dip / 2);
        S.dipA = clamp01(S.t / half); safe(() => V?.dip?.(S.dipA));
        if (S.t >= half) { safe(() => V?.dip?.(1)); setupWater(); go('dipHold'); }
        break;
      }
      case 'dipHold':   // held at full ink until the water's first frame is drawn (two frames run under it)
        if (S.frames >= 2) go('dipClear');
        break;
      case 'dipClear': {
        const half = Math.max(0.01, P.dip / 2);
        S.dipA = 1 - clamp01(S.t / half); safe(() => V?.dip?.(S.dipA));
        if (S.t >= half) { safe(() => V?.dip?.(0)); beginGlide(); }
        break;
      }
      case 'glide': {
        const p = glidePose();
        if (p) { placeBoats(p); placeLine(p); }
        sounds(d);
        break;
      }
      default: break;
    }
  }

  /** The glide in's camera (render's homePose): 1 drawn back along the mooring's framing from the dip, easing to 0 at the mooring. */
  function camPull() {
    const p = S.phase;
    if (p === 'dip' || p === 'dipHold' || p === 'dipClear') return S.reduced ? 0 : 1;
    if (p !== 'glide' || S.reduced) return 0;
    const k = clamp01(S.t / Math.max(0.05, num(S.P?.glide, 3)));
    return 1 - k * k * (3 - 2 * k);
  }
  const state = () => ({ phase: S.phase, t: Math.round(S.t * 1000) / 1000, water: S.water, opening: S.opening, u: Math.round(S.u * 1000) / 1000, ink: Math.round(S.ink * 1000) / 1000,
    kindle: S.kindle, line: S.lineOn ? S.line : null, dip: Math.round(S.dipA * 1000) / 1000, reduced: S.reduced, begun: S.begun, parts: S.P ? { ...S.P } : null, marks: S.marks.slice() });
  return {
    opening, playTow, update, tap, state, camPull,
    active: () => !!S.phase,
    /** The tow's phase now, or null. */
    get phase() { return S.phase; },
    /** debug builds (ctx.debug.loop.tow): 'state' (the readout), 'tap', 'cut' (the tow to its end at once: a scenario's shortcut) */
    debug: (cmd) => (cmd === 'tap' ? tap() : cmd === 'cut' ? (S.phase ? (cut(), true) : false) : state()),
  };
}
