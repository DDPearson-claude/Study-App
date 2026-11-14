// actors-show.js — THE SHOW: the Wick turns to the lens and presents its catch (docs/v3/show/SPEC.md; DESIGN §25.6.8; CONTRACT
// §13.7b). Lane A's half: the pose, the fish in the hands, the weight and the life. actors.js owns the seam (showFish,
// setShowTime, getShowFocus, endShow) and calls in here; fishing times it.
//
// How it is built. Everything is laid out in the raft's DECK space (so the raft may ride the water and dip under the weight), in
// a "show frame" whose z axis points at the lens: the Wick's spot and facing, where the fish is held and how it is turned, where
// each hand grips it, where the rod stands. The fish LEADS: it travels a path that is a function of the show's pose time alone
// (the swing in on the line → the hands take it → the present, with its overshoot → the hold's flaps → the still), and the
// Wick's hands are locked onto it by IK (actors-wick.js), so a hand is on the fish whatever the body does. The layout is settled
// on a ghost of the rig before anything has moved, so getShowFocus() can tell the camera where everything WILL be on the first
// frame of the lift. Five poses by the fish's true length (data.showPoseFor): pinch (one hand out to the lens), both (two hands
// pushed forward), hug (stood on its tail, heaved against the shoulder), hang (hung from the planted, bowing rod) and alongside
// (laid along the raft, chin against the deck's edge, the Wick standing over it with a hand on its brow).
import * as THREE from 'three';

const clamp = THREE.MathUtils.clamp;
const smooth01 = (x) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };
const wrapPi = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const DEG = Math.PI / 180;
const REACH = 2.6;   // how far a sleeve may stretch to keep a hand on the fish (× the arm; toward the lens it is foreshortened)

export const SHOW_NAMES = { pinch: 'showPinch', both: 'showBoth', hug: 'showHug', hang: 'showHang', alongside: 'showAlongside' };
export const SHOW_IDS = { showPinch: 'pinch', showBoth: 'both', showHug: 'hug', showHang: 'hang', showAlongside: 'alongside' };
export const SHOW_CLASSES = ['small', 'keeper', 'prize', 'trophy', 'elder', 'ancient'];
// the data's own rows (AUTOFISH.show.life / grip / facing) win; these stand in when a build carries none (a test, a v1 page)
const LIFE0 = {
  small: { overshoot: 0.18, twitch: [0.9, 0.45], drips: 3, strain: 0, dip: 0, flame: 0.25, bob: 0.02 },
  keeper: { overshoot: 0.15, twitch: [0.8, 0.5], drips: 5, strain: 0, dip: 0.01, flame: 0.35, bob: 0.02 },
  prize: { overshoot: 0.12, twitch: [0.7, 0.7], drips: 8, strain: 0.2, dip: 0.02, flame: 0.5, bob: 0.015 },
  trophy: { overshoot: 0.08, twitch: [0.55, 0.9], drips: 12, strain: 0.65, dip: 0.045, flame: 0.65, bob: 0.01 },
  elder: { overshoot: 0.05, twitch: [0.4, 1.2], drips: 16, strain: 0.85, dip: 0.06, flame: 0.9, bob: 0.008 },
  ancient: { overshoot: 0.05, twitch: [0.35, 1.3], drips: 18, strain: 1, dip: 0.07, flame: 1.0, bob: 0.008 },
  settle: 0.28, firstFlap: 0.2, pauseStill: 0.12, swingIn: 0.4, takeAt: 0.62,
};
const GRIP0 = {
  pinch: { hands: 1, reach: 0.3, reachTiny: 0.42, tinyBelow: 0.15, rod: 'planted' },
  both: { hands: 2, reach: 0.3, spread: 0.31, spreadClamp: [0.13, 0.44], rod: 'stowed' },
  hug: { hands: 2, tilt: 70, heave: 18, rod: 'stowed' },
  hang: { hands: 2, tailClear: 0.04, gap: 0.12, lean: [3, 30], rod: 'raised' },
  alongside: { hands: 1, stand: true, inset: 0.24, flankUp: 30, squareWithin: 12, noseIn: 18, turn: 16, rod: 'planted' },
};
const FACING0 = { faceWithin: 12, threeQuarter: { hang: 30, alongside: 35 }, flankWithin: 15, turnRate: 9 };

// ------------------------------------------------------------------ the show's clock (pure; tools/tests/show-poses.test.mjs)
/** The flaps of a hold: [{at, dur}] in pose time. The first comes firstFlap s after the present (as the overshoot settles), then
 *  one every twitch[1] s; each is over by the pause (which only breathes). */
export function showFlaps(beats, row, LS = LIFE0) {
  const first = LS.firstFlap ?? 0.2, period = Math.max(0.25, row?.twitch?.[1] ?? 0.6), end = beats.lift + beats.hold, out = [];
  for (let i = 0; i < 8; i++) {
    let at = beats.lift + first + i * period;
    const prev = out[out.length - 1];
    if (prev && end - at < 0.22 && end - 0.22 >= prev.at + prev.dur + 0.12) at = end - 0.22;   // the last one comes a little early rather than not at all
    const dur = Math.min(0.3, end - at);
    if (dur < 0.14) break;
    out.push({ at, dur });
  }
  return out;
}
/** How far the present has travelled at pose time t: 0 at the take, 1 + overshoot on the lift's last frame (its peak, at rest),
 *  then back to 1 on a critically damped return that is within a tenth of the overshoot `settle` s later. */
export function presentAt(t, lift, takeAt, overshoot, settle) {
  const tau = t - lift;
  if (tau > 0) { const x = 4 * tau / Math.max(0.05, settle); return 1 + overshoot * (1 + x) * Math.exp(-x); }
  const x = clamp((t / Math.max(0.05, lift) - takeAt) / (1 - takeAt), 0, 1);
  return (1 + overshoot) * x * x * (3 - 2 * x);
}
/**
 * Every curve of the show at pose time t (seconds since showFish): u the lift's progress, swing the fish swinging in on the line,
 * take the hands closing on it, dip the squash as they take the weight, p the present (presentAt), tau seconds since the present,
 * flap 0..1 (this instant's twitch), flaps how many have begun, struggle (what FishVisual.update gets), calm 0 → 1 into the
 * pause's still, phase 'lift' | 'hold' | 'pause'.
 */
export function showCurves(t, beats, row, LS = LIFE0, flaps = null, out = {}) {
  const lift = Math.max(0.05, beats.lift), sw = LS.swingIn ?? 0.4, ta = LS.takeAt ?? 0.62;
  const u = clamp(t / lift, 0, 1), F = flaps || showFlaps(beats, row, LS);
  out.t = t; out.u = u;
  out.swing = smooth01(u / (ta - 0.03));   // (it reaches the hands as they close)
  out.take = smooth01((u - sw * 0.8) / (ta - sw * 0.8));
  const d = clamp((u - (ta - 0.2)) / 0.42, 0, 1);
  out.dip = Math.sin(Math.PI * d) ** 2;
  out.p = presentAt(t, lift, ta, row?.overshoot ?? 0.1, LS.settle ?? 0.28);
  out.tau = t - lift;
  out.calm = smooth01((t - lift - beats.hold) / 0.22);
  out.phase = t < lift ? 'lift' : t < lift + beats.hold ? 'hold' : 'pause';
  let f = 0, n = 0;
  for (const fl of F) { if (t >= fl.at) n++; const e = (t - fl.at) / fl.dur; if (e >= 0 && e <= 1) f = Math.max(f, Math.sin(Math.PI * e)); }
  out.flap = out.phase === 'hold' ? f : 0; out.flaps = n;
  const still = LS.pauseStill ?? 0.12, quiet = Math.min(still * 0.6, 0.07);
  out.struggle = t < lift ? 0.25 + 0.45 * (1 - out.take) : out.phase === 'hold' ? Math.min(1.2, quiet + (row?.twitch?.[0] ?? 0.6) * out.flap) : quiet * (1 - 0.3 * out.calm);
  return out;
}
/**
 * Where a fish too long to lift lies against the raft (SPEC §2.2.5). rect = {x0, x1, z0, z1} the deck in its own space, zS / xS the
 * show frame's axes there (to the lens, lens-right), zones = for each edge ('+x', '-x', '+z', '-z') the stretch [lo, hi] of it
 * (the other coordinate) where the Wick can stand: the corners hold the brazier, the creel, the post and the rod rest. When an
 * edge faces the lens within `within` degrees the fish lies along it, its snout as far to the lens-right as the Wick can stand;
 * otherwise it noses in against the lens-left edge of the lens-most corner and trails away across the water, turned up to `turn`
 * degrees toward that edge. Returns {px, pz (where its chin meets the edge), nx, nz (out from the raft there), ex, ez (its axis,
 * tail → snout), aligned}.
 */
export function raftSupport(rect, zS, xS, { within = 30, turn = 20, zones = null } = {}) {
  const Z = zones || { '+x': [-0.42, 0.42], '-x': [-0.42, 0.42], '+z': [-0.42, 0.42], '-z': [-0.42, 0.42] };
  const edges = [[1, 0, '+x'], [-1, 0, '-x'], [0, 1, '+z'], [0, -1, '-z']].map(([nx, nz, id]) => ({ nx, nz, id, d: nx * zS.x + nz * zS.z, r: nx * xS.x + nz * xS.z }));
  edges.sort((a, b) => b.d - a.d);
  /** The point of an edge's free stretch furthest along (wx, wz), and the edge's direction that way. */
  const pick = (E, wx, wz) => {
    const [lo, hi] = Z[E.id] || [-0.3, 0.3];
    if (E.nx !== 0) { const up = wz >= 0; return { px: E.nx > 0 ? rect.x1 : rect.x0, pz: up ? hi : lo, ex: 0, ez: up ? 1 : -1 }; }
    const up = wx >= 0; return { px: up ? hi : lo, pz: E.nz > 0 ? rect.z1 : rect.z0, ex: up ? 1 : -1, ez: 0 };
  };
  const best = edges[0];
  if (best.d >= Math.cos(within * DEG)) {
    const P = pick(best, xS.x, xS.z);
    return { px: P.px, pz: P.pz, nx: best.nx, nz: best.nz, ex: P.ex, ez: P.ez, aligned: true };
  }
  // the two edges that meet at the lens-most corner: take the one to lens-left of it (the raft falls away behind a fish laid there)
  const E = edges[0].r < edges[1].r ? edges[0] : edges[1];
  const P = pick(E, zS.x, zS.z);            // as near the corner as the Wick can stand
  const A2 = pick(E, xS.x, xS.z);           // the edge's direction toward lens-right
  const ang = Math.acos(clamp(A2.ex * xS.x + A2.ez * xS.z, -1, 1)), k = Math.min(1, (turn * DEG) / Math.max(1e-3, ang));
  const ex = xS.x + (A2.ex - xS.x) * k, ez = xS.z + (A2.ez - xS.z) * k, n = Math.hypot(ex, ez) || 1;
  return { px: P.px, pz: P.pz, nx: E.nx, nz: E.nz, ex: ex / n, ez: ez / n, aligned: false };
}

// ------------------------------------------------------------------ the raft as the show sees it (deck space, metres)
const DECK_RECT = { x0: -0.97, x1: 0.97, z0: -1.28, z1: 1.28 };
const POLE_AT = { x: -0.62, z: -0.82 };   // the lantern post and what hangs from it, seen from above
// where the Wick can stand at each edge of the deck (the brazier is at the bow's left, the rod rest at its right, the post at
// the stern's left, the creel at its right; an upgraded raft keeps a rope coil and a crate along its left side)
const EDGE_ZONES = { '+x': [-0.35, 0.55], '-x': [-0.5, 0.4], '+z': [-0.25, 0.4], '-z': [-0.3, 0.3] };
const EDGE_ZONES_UP = { ...EDGE_ZONES, '-x': [-0.22, -0.12] };
const WATER_Y = 0.02;                     // the lake's surface in deck space (the deck floats that much low)

export function createShow({ ctx, raft, wick, holder, deckY = 0.24, home, setDip = null }) {
  const deck = raft.deck;
  const D = () => ctx.data || {};
  const A = () => D().AUTOFISH?.show || {};
  const V = () => new THREE.Vector3();
  const T = { a: V(), b: V(), c: V(), d: V(), e: V(), f: V(), g: V(), h: V(), q: new THREE.Quaternion(), q2: new THREE.Quaternion(), m: new THREE.Matrix4(), X: V(), Y: V(), Z: V(), n: V() };
  const UP = new THREE.Vector3(0, 1, 0);
  const deckQ = new THREE.Quaternion(), deckQi = new THREE.Quaternion(), camD = V(), camW = V();
  const sec = {}, sec2 = {}, sec3 = {};   // (sec is skin()'s own scratch: never hold it across a skin() call)
  const curves = {};
  let S = null;          // the show that is up
  let gone = null;       // a fish on its way out (endShow's gesture), and the Wick's hands and rod letting go
  let hold = null;       // setPose('show…') with no fish (the pose viewer's bare pose)
  const dip = { x: 0, v: 0, dirX: 0, dirZ: 0, atPresent: null, peak: 0 };
  const rodBow = { x: 0, z: 0, on: false };
  const lineOut = { on: false, end: V(), tension: 0, slack: 0 };
  const stats = { drips: 0, flaps: 0, beats: {}, maxP: 0, restAt: null, handGap: { r: 0, l: 0 }, maxHandGap: 0 };

  const emit = (kind, strength = 1) => { stats.beats[kind] = (stats.beats[kind] || 0) + 1; try { ctx.bus?.emit?.('show:beat', { kind, strength: clamp(strength, 0, 1), cls: S?.cls ?? gone?.cls ?? null }); } catch { /* a listener's fault is not the show's */ } };
  const toWorld = (v) => v.applyMatrix4(deck.matrixWorld);
  function frameQuat(out, Zf, N, face) {   // the fish's frame: Zf = tail → snout; face 'flank': a flank's normal along −N; 'back': its back along N
    T.Z.copy(Zf).normalize();
    T.n.copy(N).addScaledVector(T.Z, -N.dot(T.Z));
    if (T.n.lengthSq() < 1e-8) T.n.set(T.Z.y, T.Z.z, T.Z.x).addScaledVector(T.Z, -T.Z.dot(T.n));
    T.n.normalize();
    if (face === 'back') { T.Y.copy(T.n); T.X.crossVectors(T.Y, T.Z); } else { T.X.copy(T.n).negate(); T.Y.crossVectors(T.Z, T.X); }
    T.m.makeBasis(T.X, T.Y, T.Z);
    return out.setFromRotationMatrix(T.m);
  }
  const handR = () => 0.046 * wick.group.scale.x * (wick.build?.[0] || 1);

  // ---------------------------------------------------------------- the lens, in deck space
  function readLens(cam, camPos, dt, snap) {
    deck.updateWorldMatrix(true, false);
    deck.getWorldQuaternion(deckQ); deckQi.copy(deckQ).invert();
    camW.copy(camPos); camD.copy(camPos); deck.worldToLocal(camD);
    const z = T.a;
    if (cam && cam.isCamera) { cam.getWorldDirection(z).negate(); z.y = 0; } else z.set(0, 0, 0);
    if (z.lengthSq() < 0.05) { z.copy(camPos).sub(wick.group.getWorldPosition(T.b)); z.y = 0; }
    if (z.lengthSq() < 1e-6) z.set(0, 0, 1);
    z.normalize().applyQuaternion(deckQi); z.y = 0; z.normalize();
    const L = S || hold;
    if (!L) return;
    if (cam && cam.isCamera && Number.isFinite(cam.aspect)) L.tall = cam.aspect < 1;
    if (snap || !L.hasLens) { L.zS.copy(z); L.hasLens = true; }
    else if (L.id !== 'alongside') { L.zS.lerp(z, 1 - Math.exp(-4 * dt)); L.zS.y = 0; L.zS.normalize(); }   // (a fish laid alongside keeps its lie: the lens may crane and rake over it)
    L.xS.set(L.zS.z, 0, -L.zS.x);
  }

  // ---------------------------------------------------------------- per fish: how its shape is held
  function kitFor(fv, id) {
    const shape = fv.shape, L = fv.length;
    const K = { face: 'flank', nose: 'side', tilt: 9, noseUp: 4, noseIn: 6, f0: 0.44, bend: null, round: false, wings: false };
    // a ray shows its back: flat on the palm tipped to us, or held up by its lower wing like a painting (its disc to the lens, its
    // snout to the right of the frame as every held fish's); stood or hung, it is head-up
    if (shape === 'ray') { K.face = 'back'; K.wings = true; K.nose = id === 'pinch' || id === 'both' ? 'side' : 'up'; K.tilt = id === 'pinch' ? 58 : 12; K.f0 = 0.27; K.noseUp = id === 'both' ? 8 : 4; }
    // a crayfish is held from below by its carapace, back to us, claws up and out
    else if (shape === 'crayfish') { K.face = 'back'; K.nose = id === 'pinch' ? 'diag' : 'side'; K.tilt = id === 'pinch' ? 16 : 48; K.noseUp = 0; K.f0 = 0.5; }
    else if (shape === 'jelly') { K.face = 'back'; K.nose = 'up'; K.tilt = 0; K.round = true; K.f0 = 0.3; }
    else if (shape === 'puffer') { K.round = true; K.f0 = 0.42; K.noseUp = 6; }
    else if (shape === 'eel') {
      if (id === 'pinch') K.bend = { head: [0.34, 0.2, 0.75], tail: [0.6, 0.26, 1.0] };
      else if (id === 'both') K.bend = { head: [0.2, 0.12, -0.3], tail: [0.76, 0.16, 0.95], sag: 0.035 };
    }
    if (L < 0.15 && id === 'pinch') K.tilt = Math.max(K.tilt, 14);
    return K;
  }
  /** A point on the body's surface (fish-local metres, bent as the body is): station f, a direction (dx, dy) across the body. */
  function skin(fv, f, dx, dy, lift, out) {
    const s = fv.section ? fv.section(f, sec) : { z: 0, halfW: fv.length * 0.07, top: fv.length * 0.1, bottom: -fv.length * 0.1 };
    const yc = (s.top + s.bottom) / 2, hd = (s.top - s.bottom) / 2, hw = s.halfW, n = Math.hypot(dx * hw, dy * hd) || 1e-4;
    const m = Math.hypot(dx, dy) || 1;
    out.set(dx * hw * hw / n + (dx / m) * lift, yc + dy * hd * hd / n + (dy / m) * lift, s.z);
    return fv.bendPoint ? fv.bendPoint(out) : out;
  }
  function clearance(G, p) {   // > 0: how far p is inside the Wick's body (the cloak's capsule, the wax head), metres
    const v = G.vol;
    T.h.subVectors(v.b, v.a); const l2 = T.h.lengthSq(), k = l2 > 1e-8 ? clamp(T.g.subVectors(p, v.a).dot(T.h) / l2, 0, 1) : 0;
    const dc = T.g.copy(v.a).addScaledVector(T.h, k).distanceTo(p);
    return Math.max(v.r - dc, v.headR - v.head.distanceTo(p));
  }

  /** Slide a fish (pos, quat) along `dir` until none of its skin is inside the Wick's body; returns how far it went. */
  const pcDir = V(), pcTry = V();
  function pushClear(L, G, pos, quat, dir, f0 = 0.04, f1 = 0.96, stepM = 0.012, tol = 0.004, G2 = null) {
    let went = 0;
    pcDir.copy(dir);
    for (let it = 0; it < 60; it++) {
      let worst = -Infinity;
      for (let f = f0; f <= f1 + 1e-6; f += 0.07) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const p = skin(L.fv, f, dx, dy, 0, T.e).applyQuaternion(quat).add(pos);
        worst = Math.max(worst, clearance(G, p), G2 ? clearance(G2, p) : -Infinity);
      }
      if (worst <= tol) break;
      pos.addScaledVector(pcDir, stepM); went += stepM;
    }
    return went;
  }
  /** The body as the hands take the fish (bent to it, not yet leaning back): the take point must clear this one too. */
  function probeTake(L) {
    const sp = restSpec(L); sp.p = 0; sp.dip = 1; sp.take = 1; sp.glance = 1; sp.fishYawLocal = L.lensYaw; sp.fishElev = -0.55;
    const g = wick.probeShow(sp, { x: L.spot.x, y: L.spot.y, z: L.spot.z, faceYaw: L.faceYaw }, L.Gt0 || {});
    L.Gt0 = g;
    L.Gt = L.Gt || { vol: { a: V(), b: V(), head: V(), r: 0, headR: 0 } };
    L.Gt.vol.a.copy(g.vol.a); L.Gt.vol.b.copy(g.vol.b); L.Gt.vol.head.copy(g.vol.head); L.Gt.vol.r = g.vol.r; L.Gt.vol.headR = g.vol.headR;
    return L.Gt;
  }

  // ---------------------------------------------------------------- the settled layout (deck space), pose by pose
  function restSpec(L) {
    return { pose: L.name, side: L.side, p: 1, take: 1, swing: 1, calm: 0, flap: 0, dip: 0, bob: 0, weight: L.weight, life: L.row, glance: 0, special: 0, wide: 0, tiny: L.tiny,
      lensYawLocal: L.lensYaw, lensElev: L.lensElev, fishYawLocal: null, fishElev: 0, crouch: L.crouch || 0, faceYaw: L.faceYaw, hugTwist: L.hugTwist || 0 };
  }
  function probe(L) {
    L.G = wick.probeShow(restSpec(L), { x: L.spot.x, y: L.spot.y, z: L.spot.z, faceYaw: L.faceYaw }, L.G || {});
    return L.G;
  }
  /**
   * The body's facing: at the lens from where it stands (three-quarter toward the fish for hang and alongside). The layout is
   * settled for where the show camera COMES TO REST (it is still easing in when the lift begins): on the show frame's axis
   * through the picture's middle, at the pose's distance and height. The live Wick looks at the real lens once it is near.
   */
  const CAM_ELEV = { pinch: 8, both: 10, hug: 10, hang: 8, alongside: 16 };
  function faceLens(L) {
    const row = A().camera?.pose?.[L.id], elev = (row?.elev ?? CAM_ELEV[L.id] ?? 10) * DEG;
    const d = L.id === 'pinch' ? 1.1 : L.id === 'both' ? 0.95 + 0.7 * L.L : L.id === 'hug' ? 2.1 : L.id === 'hang' ? 1.4 + 1.0 * L.L : Math.max(2.3, 0.9 * L.L);
    const mid = L.hasMid ? L.mid : T.a.copy(L.spot).addScaledVector(UP, 0.6);
    const est = L.camEst.copy(mid).addScaledVector(L.zS, d * Math.cos(elev)).addScaledVector(UP, d * Math.sin(elev));
    const head = T.b.copy(L.spot); head.y += 0.8 * wick.group.scale.x / 1.22;
    const aim = (c, o) => { const dx = c.x - L.spot.x, dz = c.z - L.spot.z, far = Math.hypot(dx, dz); o.yaw = far > 0.25 ? Math.atan2(dx, dz) : Math.atan2(L.zS.x, L.zS.z); o.elev = clamp(Math.atan2(c.y - head.y, Math.max(0.3, far)), -0.3, 0.7); };
    aim(est, L.aimRest);
    // the live lens: the real camera once it has come within reach of its resting place, the estimate before
    const k = Math.max(smooth01(1.25 - camD.distanceTo(est) / Math.max(0.5, d)), smooth01(2.2 - camD.distanceTo(mid) / Math.max(0.5, d)));
    aim(T.c.copy(est).lerp(camD, k), L.aimLive);
    const off = (L.F.threeQuarter?.[L.id] || 0) * DEG;
    L.lensYaw = L.aimRest.yaw; L.lensElev = L.aimRest.elev;
    L.faceYaw = L.aimRest.yaw + L.side * off; L.faceLive = L.aimLive.yaw + L.side * off;
  }
  const along = (L, v, axis) => (v.x - L.spot.x) * axis.x + (v.z - L.spot.z) * axis.z;
  /** Bring a grip (and with it the fish) back inside the arm's reach: returns the shift applied to `pos`. */
  function pullIn(L, key, gripLocal, pos, quat, extra, max = REACH) {
    const h = T.e.copy(gripLocal).applyQuaternion(quat).add(pos);
    if (extra) h.add(extra);
    const before = T.f.copy(h);
    const moved = wick.ghostReach(key, h, max);
    if (moved > 0) pos.add(h.sub(before));
    return moved;
  }
  /** The first of the candidate grips [station, dx, dy, lift (× the hand)] that hand can reach, else the nearest miss; returns the miss (m). */
  function bestGrip(L, key, cands, out) {
    const rh = handR();
    let best = Infinity;
    for (const [f, dx, dy, lift] of cands) {
      const g = skin(L.fv, f, dx, dy, rh * lift, T.c);
      const w = T.d.copy(g).applyQuaternion(L.Y.quat).add(L.Y.pos), m = wick.ghostReach(key, T.f.copy(w), REACH);
      if (m < best - 1e-4) { best = m; out.copy(g); }
      if (m <= 1e-4) break;
    }
    return best;
  }
  function settleHand(L, key, gripLocal) { return (key === 'r' ? L.Y.handR : L.Y.handL).copy(gripLocal).applyQuaternion(L.Y.quat).add(L.Y.pos); }

  function solveHeld(L) {   // pinch and both: on the hands, out toward the lens
    const Y = L.Y, fv = L.fv, K = L.kit, Gt = probeTake(L), G = probe(L), sd = L.side, rh = handR(), b = L.b;
    const pinch = L.id === 'pinch', tiny = pinch && L.tiny;
    const faceZ = along(L, G.eyes, L.zS);
    const lensN = T.a.copy(L.zS).multiplyScalar(Math.cos(K.tilt * DEG)).addScaledVector(UP, Math.sin(K.tilt * DEG));
    const nose = T.b;
    if (K.nose === 'up') nose.copy(UP).addScaledVector(L.xS, 0.12 * sd).addScaledVector(L.zS, -Math.sin(K.tilt * DEG) * 0.9);
    else if (K.nose === 'diag') nose.copy(UP).addScaledVector(L.xS, 1.0).addScaledVector(L.zS, -Math.sin(K.tilt * DEG) * 0.6);
    else nose.copy(L.xS).addScaledVector(L.zS, Math.tan(K.noseIn * DEG) * (pinch ? sd : 1)).addScaledVector(UP, Math.tan(K.noseUp * DEG));   // (square to the lens's own line to it)
    frameQuat(Y.quat, nose, lensN, K.face);
    // the take: the same turn, the flank tipped up a little more (it lies in the hands before it is shown)
    frameQuat(Y.takeQuat, T.c.copy(nose).addScaledVector(UP, -0.1).addScaledVector(L.zS, -0.08), T.d.copy(lensN).addScaledVector(UP, 0.35), K.face);
    // where its middle is held
    const midZ = (b.noseZ + b.tailZ) / 2, cy = (b.top + b.bottom) / 2;
    const upright = K.nose === 'up' || K.nose === 'diag';
    const cLocal = T.c.set(0, upright || K.wings ? 0 : cy, upright ? (fv.section ? fv.section(K.f0, sec).z : midZ) : K.wings ? midZ + ((fv.section ? fv.section(K.f0, sec).z : midZ) - midZ) * 0.6 : midZ);
    const sh = sd > 0 ? G.shL : G.shR, chest = (G.shL.y + G.shR.y) / 2;
    const little = pinch ? 0 : clamp((0.62 - L.L) / 0.3, 0, 1);   // a small fish in both hands is held out as far as a pinch (and a little higher)
    const reach = pinch ? (tiny ? L.grip.reachTiny : L.grip.reach) : L.grip.reach + little * 0.1;
    const ext = upright ? (b.noseZ - cLocal.z) * (K.nose === 'diag' ? 0.75 : 1) : K.wings && !pinch ? b.halfW : Math.max(0.01, b.top - cy);   // how far it stands above its middle
    let x, y;
    if (pinch && !L.tall && !tiny) {   // a wide frame: held up beside the face at its cheek, so the lens comes right in on the two of them
      x = sd * (G.head.radius * 0.94 + (tiny ? 0.03 : upright ? 0.06 : 0.32 * L.L)); y = G.head.center.y - (tiny ? 0.03 : 0.08) - (upright ? ext * 0.5 : 0);
    } else if (pinch) {       // an upright frame (and any tiny fish on a wide one: before the dark of the face, where a sliver of silver reads; it sits just
                              // under eye level and the near lens drops it below the eyes): under the chin, the face above it
      x = sd * Math.abs(along(L, sh, L.xS)) * 0.3; y = Math.min(sh.y + (tiny ? (L.tall ? 0.07 : 0.44) : 0.02), G.eyes.y - (tiny && !L.tall ? -0.07 : 0.12) - ext);
    } else { x = 0; y = Math.min(chest - 0.01 + little * 0.08, G.eyes.y - 0.06 - ext); }   // the face must show above it
    const c = T.d.copy(L.spot).addScaledVector(L.xS, x).addScaledVector(L.zS, faceZ + reach); c.y = y;
    Y.pos.copy(cLocal).applyQuaternion(Y.quat).negate().add(c);
    // the grips (fish-local): under the belly, or under a ray's lower wing
    if (pinch) {
      const key = sd > 0 ? 'l' : 'r', g = key === 'l' ? Y.gripL : Y.gripR;
      if (fv.shape === 'crayfish') skin(fv, 0.72, 0, -1, rh * 0.6, g);                             // held from below by the carapace, behind its claws
      else if (K.round && fv.shape === 'jelly') { fv.section(0.42, sec); g.set(0, 0, sec.z - rh * 0.7); }   // the bell sits on the palm
      else {   // on the upturned palm; a fish no deeper than the fist rides ON it (else the round hand, nearer the lens, hides it)
        const dep = fv.section ? (fv.section(K.f0, sec), sec.top - sec.bottom) : rh;
        skin(fv, K.f0, 0, -1, rh * (0.72 + 0.28 * clamp((1.6 * rh - dep) / (0.8 * rh), 0, 1)), g);
      }
      L.lockKeys = [key];
    } else {
      const lo = (L.grip.spreadClamp?.[0] ?? 0.13) / 2, hi = (L.grip.spreadClamp?.[1] ?? 0.44) / 2;
      if (K.wings) {   // a ray, like a painting: both hands under its lower wing, the disc to the lens
        const dn = T.X.set(1, 0, 0).applyQuaternion(Y.quat).y < 0 ? 1 : -1;   // which of its wings hangs down
        const h = clamp(0.2 * L.L, lo, hi * 0.8);
        skin(fv, clamp(K.f0 - h / L.L, 0.06, 0.4), dn, -0.25, rh * 0.6, Y.gripL); skin(fv, clamp(K.f0 + h / L.L, 0.14, 0.47), dn, -0.25, rh * 0.6, Y.gripR);
      } else if (fv.shape === 'jelly') { fv.section(0.4, sec); const w = Math.min(sec.halfW * 0.6, hi); Y.gripL.set(-w, 0, sec.z - rh * 0.6); Y.gripR.set(w, 0, sec.z - rh * 0.6); }
      else {
        const h = clamp((L.grip.spread ?? 0.31) * L.L, lo, hi) * (K.round ? 0.6 : 1);
        const fl = clamp(K.f0 - h / L.L, 0.07, 0.9), fr = clamp(K.f0 + h / L.L, 0.1, 0.93);
        skin(fv, fl, 0, -1, rh * 0.72, Y.gripL); skin(fv, fr, 0, -1, rh * 0.72, Y.gripR);   // (the snout is to lens-right: the left hand's side)
      }
      L.lockKeys = ['r', 'l'];
    }
    // bring it back inside the arms' reach, the overshoot's peak included
    const ov = L.row.overshoot ?? 0.1;
    for (let it = 0; it < 3; it++) {
      let moved = 0;
      const thrust = T.g.copy(L.zS).multiplyScalar(reach * 0.85 * ov).addScaledVector(UP, 0.07 * ov);
      for (const key of L.lockKeys) moved = Math.max(moved, pullIn(L, key, key === 'r' ? Y.gripR : Y.gripL, Y.pos, Y.quat, thrust));
      if (moved < 1e-4) break;
    }
    pushClear(L, G, Y.pos, Y.quat, L.zS);
    // the take point: close in at the collar, a little lower; never inside the cloak
    const back = Math.max(0.12, along(L, T.e.copy(cLocal).applyQuaternion(Y.quat).add(Y.pos), L.zS) - faceZ) * 0.85;
    Y.takePos.copy(Y.pos).addScaledVector(L.zS, -back).addScaledVector(UP, -0.07);
    pushClear(L, G, Y.takePos, Y.takeQuat, L.zS, 0.04, 0.96, 0.012, 0.004, Gt);
    Y.travel = Y.takePos.distanceTo(Y.pos);
    for (const key of L.lockKeys) settleHand(L, key, key === 'r' ? Y.gripR : Y.gripL);
    // the rod: planted like a staff in the other hand (pinch), or set down on the bow rest (both)
    if (pinch) plantRod(L, -sd, 0.31, 0.1, 5, 3); else Y.rod.mode = 'stowed';
    if (pinch) { const key = sd > 0 ? 'r' : 'l'; rodGrip(L, key, 0.4); }
  }
  /** The rod planted by its butt on the deck beside the Wick: side ±1 (lens-right +), out and forward from its spot, leaning. */
  function plantRod(L, side, out, fwd, leanOut, leanBack) {
    const R = L.Y.rod;
    R.mode = 'planted';
    R.butt.copy(L.spot).addScaledVector(L.xS, side * out * L.wide).addScaledVector(L.zS, fwd); R.butt.y = deckY;
    R.dir.copy(UP).addScaledVector(L.xS, side * Math.tan(leanOut * DEG)).addScaledVector(L.zS, -Math.tan(leanBack * DEG)).normalize();
    R.bow.set(0, 0);
    tipOf(L);
  }
  function tipOf(L) {   // the planted rod's tip (deck space), its bow included
    const R = L.Y.rod, len = wick.rodLength * R.scale, bx = R.bow.x, bz = R.bow.y;
    T.q.setFromUnitVectors(UP, R.dir);
    L.Y.tip.set(bx * len, len * (1 - 0.5 * (bx * bx + bz * bz)), bz * len).applyQuaternion(T.q).add(R.butt).addScaledVector(R.dir, wick.rodButt * R.scale);
    L.Y.hasTip = true;
  }
  function rodGrip(L, key, h) {   // a hand on the planted rod, h metres above the deck
    const R = L.Y.rod, o = key === 'r' ? L.Y.handR : L.Y.handL;
    o.copy(R.butt).addScaledVector(R.dir, h / Math.max(0.3, R.dir.y));
    if (L.G) wick.ghostReach(key, T.e.copy(o), REACH);
    return o;
  }

  function solveHug(L) {   // stood on its tail on the deck, heaved against the shoulder
    const Y = L.Y, fv = L.fv, K = L.kit, Gt = probeTake(L), G = probe(L), sd = L.side, rh = handR(), b = L.b;
    const tau = (L.grip.tilt ?? 70) * DEG, shNear = sd > 0 ? G.shL : G.shR;
    const hingeF = 0.86, arc = 0.07;
    const axis = T.a.copy(L.xS).multiplyScalar(sd * Math.cos(tau)).addScaledVector(UP, Math.sin(tau));   // tail → snout: up and out over the shoulder
    if (K.wings) { axis.copy(UP).addScaledVector(L.xS, sd * 0.14).normalize(); frameQuat(Y.quat, axis, T.b.copy(L.zS).addScaledVector(UP, 0.12), 'back'); }
    else frameQuat(Y.quat, axis, T.b.copy(L.zS).addScaledVector(UP, 0.1), 'flank');
    // which way is its belly? toward the Wick: flip the flank shown if the back would lean on the shoulder
    if (!K.wings) { T.Y.set(0, 1, 0).applyQuaternion(Y.quat); if (T.Y.dot(L.xS) * sd < 0) { T.q.setFromAxisAngle(T.Z.set(0, 0, 1), Math.PI); Y.quat.multiply(T.q); } }
    L.bendHold = K.wings ? { tail: [0.54, 0.1, -1.35] } : { tail: [hingeF, arc, tau] };
    fv.setBend?.(L.bendHold);
    // stand it: the lowest point of the bent body on the planks, its axis passing over the near shoulder
    const sHinge = fv.section(K.wings ? 0.5 : hingeF, sec3);
    const ySh = shNear.y - deckY;
    const xSh = Math.abs(along(L, shNear, L.xS));
    Y.pos.set(0, 0, 0);
    let low = Infinity;
    for (let f = K.wings ? 0.3 : 0.6; f <= 1.0001; f += 0.05) for (const dy of [-1, 1]) { const p = skin(fv, f, 0, dy, 0, T.e).applyQuaternion(Y.quat); if (p.y < low) low = p.y; }
    const hin = Y.pivot.set(0, (sHinge.top + sHinge.bottom) / 2, sHinge.z).applyQuaternion(Y.quat);   // the hinge, relative to the origin
    const hingeY = deckY + (hin.y - low) + 0.005;
    const xHinge = K.wings ? sd * (xSh + 0.02 + fv.section(0.3, sec2).halfW * 0.55) : sd * (xSh - 0.08) - sd * (ySh - (hingeY - deckY)) / Math.tan(tau);
    const zFront = along(L, shNear, L.zS) + 0.06 * G.scale + (fv.section(0.45, sec2).halfW) + 0.02;
    Y.pos.copy(L.spot).addScaledVector(L.xS, xHinge).addScaledVector(L.zS, zFront); Y.pos.y = hingeY; Y.pos.sub(hin);
    const hinL = T.h.copy(hin).clone();
    // push it clear of the cloak and the head (forward, and out along the deck)
    pushClear(L, G, Y.pos, Y.quat, T.e.copy(L.zS).addScaledVector(L.xS, sd * 0.25).normalize(), 0.04, 0.9, 0.012, 0.004, Gt);
    // the hands: the far one flat on the flank that faces us (as near its jaw as the arm reaches), the near one round its back
    const nearK = sd > 0 ? 'l' : 'r', farK = sd > 0 ? 'r' : 'l';
    const fx = T.X.set(1, 0, 0).applyQuaternion(Y.quat).dot(L.zS) >= 0 ? 1 : -1;   // the flank that faces the lens
    const wx = T.X.dot(L.xS) * sd >= 0 ? 1 : -1;                                   // (a ray: which wing is the outer one)
    const gN = nearK === 'l' ? Y.gripL : Y.gripR, gF = farK === 'l' ? Y.gripL : Y.gripR;
    const fAt = (h) => clamp(hingeF - (h - (hingeY - deckY)) / Math.max(0.1, L.L * Math.sin(tau)), 0.1, hingeF - 0.08);
    const farC = [], nearC = [];
    for (const dh of [0.1, 0.0, -0.1, -0.2, -0.3]) {
      if (K.wings) { farC.push([clamp(0.3 - dh, 0.08, 0.5), -wx, 0, 0.3]); nearC.push([clamp(0.32 - dh, 0.1, 0.5), wx, 0, 0.3]); continue; }
      for (const [dx, dy] of [[fx * 0.8, -0.55], [fx * 0.5, -0.85], [0, -1]]) farC.push([fAt(ySh + dh), dx, dy, 0.6]);
      nearC.push([fAt(ySh + dh - 0.02), fx * 0.35, 1, 0.55]);
    }
    const miss = bestGrip(L, farK, farC, gF); bestGrip(L, nearK, nearC, gN);
    if (miss > 0.008 && L.hugTwist < 0.5) L.hugTwist = Math.min(0.5, L.hugTwist + 0.1);   // it turns further to the fish until the far hand is on it
    L.lockKeys = ['r', 'l'];
    settleHand(L, 'r', Y.gripR); settleHand(L, 'l', Y.gripL);
    // the heave: it comes aboard leaning out and low, and is hauled up against the shoulder about its tail
    Y.pivot.copy(hinL).add(Y.pos);
    T.q.setFromAxisAngle(L.zS, -sd * (L.grip.heave ?? 18) * DEG * (K.wings ? 0.5 : 1));
    Y.takeQuat.copy(T.q).multiply(Y.quat);
    Y.takePos.copy(Y.pos).sub(Y.pivot).applyQuaternion(T.q).add(Y.pivot).addScaledVector(L.xS, sd * 0.05);
    Y.travel = T.e.set(0, 0, (b.noseZ + b.tailZ) / 2).applyQuaternion(Y.quat).add(Y.pos).distanceTo(T.f.set(0, 0, (b.noseZ + b.tailZ) / 2).applyQuaternion(Y.takeQuat).add(Y.takePos));
    Y.rod.mode = 'stowed';
    L.dipDir.copy(L.xS).multiplyScalar(sd).addScaledVector(L.zS, 0.5).normalize();
  }

  function solveHang(L) {   // it cannot be lifted: hung head-up from the planted, bowing rod, the Wick close beside it
    const Y = L.Y, fv = L.fv, K = L.kit, G = probe(L), sd = L.side, rh = handR(), b = L.b, R = Y.rod;
    const mid = fv.section(0.45, sec), belly = K.wings ? mid.halfW : Math.abs(mid.bottom);
    const nearK = sd > 0 ? 'l' : 'r', farK = sd > 0 ? 'r' : 'l', shNear = sd > 0 ? G.shL : G.shR;
    const gN = nearK === 'l' ? Y.gripL : Y.gripR;
    const len = wick.rodLength * R.scale, bow = 0.07 + 0.07 * L.weight, clear = L.grip.tailClear ?? 0.04, hook = 0.06;
    // the rod: its butt planted in front of the near foot, leaning over to the fish, bowing under it
    R.mode = 'raised';
    R.butt.copy(L.spot).addScaledVector(L.xS, sd * 0.2 * L.wide).addScaledVector(L.zS, G.vol.r + 0.07); R.butt.y = deckY;
    const zF = along(L, shNear, L.zS) + 0.13;
    let lean = 0.2, best = Infinity, out = 0;
    const gaps = [L.grip.gap ?? 0.12, 0.07, 0.03];
    for (let gi = 0; gi < gaps.length; gi++) {
      const gap = gaps[gi];
      const xF = sd * (G.vol.r + gap + belly + out);
      const top = T.a.copy(L.spot).addScaledVector(L.xS, xF).addScaledVector(L.zS, zF);
      const run = T.b.subVectors(top, R.butt); run.y = 0;
      const horiz = Math.max(0.05, run.length() - bow * len * 0.9);
      lean = clamp(Math.asin(clamp(horiz / len, 0, 0.9)), (L.grip.lean?.[0] ?? 3) * DEG, (L.grip.lean?.[1] ?? 30) * DEG);
      run.normalize();
      R.dir.copy(UP).multiplyScalar(Math.cos(lean)).addScaledVector(run, Math.sin(lean)).normalize();
      T.q.setFromUnitVectors(UP, R.dir); T.q2.copy(T.q).invert();
      const bl = T.c.copy(run).applyQuaternion(T.q2);   // the bow's direction in the rod's own frame
      R.bow.set(bl.x * bow, bl.z * bow);
      tipOf(L);
      // the heave starts lower and further out (the rod laid over, bowed deep): the present hauls it upright
      R.dir0.copy(UP).multiplyScalar(Math.cos(lean + 15 * DEG)).addScaledVector(run, Math.sin(lean + 15 * DEG)).normalize();
      R.bow0.set(bl.x * (bow + 0.1), bl.z * (bow + 0.1));
      // the fish: head-up under the tip, flank to the lens, belly to the Wick; its tail just clear of the planks, or lying on them
      frameQuat(Y.quat, UP, T.d.copy(L.zS).addScaledVector(UP, 0.06), K.face);
      if (!K.wings) { T.Y.set(0, 1, 0).applyQuaternion(Y.quat); if (T.Y.dot(L.xS) * sd < 0) { T.q.setFromAxisAngle(T.Z.set(0, 0, 1), Math.PI); Y.quat.multiply(T.q); } }
      const onDeck = top.x > DECK_RECT.x0 - 0.15 && top.x < DECK_RECT.x1 + 0.15 && top.z > DECK_RECT.z0 - 0.15 && top.z < DECK_RECT.z1 + 0.15;
      const room = Y.tip.y - hook - deckY - clear;   // how much fish can hang clear of the planks
      let rest = L.L > room && onDeck ? clamp((L.L - room) / L.L + 0.02, 0, 0.45) : 0;
      // (a tail that must rest lies out along the planks, away from the Wick's feet; an eel hangs in a slow curve; a ray's disc
      // hangs beside the Wick, not over its head: most of its long tail trails on the deck)
      if (K.wings && onDeck) rest = Math.max(rest, 0.2);
      L.bendHold = rest > 0.01 ? { tail: [1 - rest - 0.05, 0.07, K.wings ? 1.5 : -1.5] } : (fv.shape === 'eel' ? { tail: [0.7, 0.3, -0.3] } : (K.wings ? { tail: [0.6, 0.3, 0.25] } : null));
      fv.setBend?.(L.bendHold);
      Y.line = Math.max(hook, rest > 0.01 ? Math.max(hook, Y.tip.y - deckY - clear - L.L * (1 - rest)) : Y.tip.y - deckY - clear - L.L);
      Y.rested = rest > 0.01; Y.onDeck = onDeck;
      Y.pos.copy(Y.tip).addScaledVector(UP, -(Y.line + b.noseZ));
      Y.hangLocal.set(0, 0, b.noseZ);
      // (it hangs under the tip: if any of it would be in the Wick, the tip itself goes further out, and the layout is made again)
      const went = pushClear(L, G, pcTry.copy(Y.pos), Y.quat, T.e.copy(L.xS).multiplyScalar(sd), 0.04, 0.96, 0.01, -0.05);
      if (went > 0.005 && out < 0.5) { out += went + 0.01; gi--; continue; }
      // the near hand rests on its flank, as high as the arm reaches
      const fx = T.X.set(1, 0, 0).applyQuaternion(Y.quat).dot(L.zS) >= 0 ? 1 : -1, wx = T.X.dot(L.xS) * sd >= 0 ? -1 : 1;
      let m0 = Infinity;
      for (const dh of [0.05, -0.05, -0.15]) for (const [dx, dy] of K.wings ? [[wx, 0.5], [wx, 1]] : [[fx * 0.75, -0.65], [fx * 0.4, -0.95], [0, -1]]) {
        const f = clamp((Y.pos.y + b.noseZ - (shNear.y + dh)) / L.L, 0.06, 0.9);
        const g = skin(fv, f, dx, dy, rh * 0.6, T.c);
        const w = T.e.copy(g).applyQuaternion(Y.quat).add(Y.pos), m = wick.ghostReach(nearK, T.f.copy(w), REACH);
        if (m < m0 - 1e-4) { m0 = m; if (m < best - 1e-4) gN.copy(g); }
        if (m <= 0) break;
      }
      if (m0 < best) best = m0;
      if (m0 <= 1e-4) break;
    }
    settleHand(L, nearK, gN);
    rodGrip(L, farK, 0.42);
    L.lockKeys = ['r', 'l'];
    Y.takePos.copy(Y.pos); Y.takeQuat.copy(Y.quat);
    Y.travel = len * (Math.sin(lean + 15 * DEG) - Math.sin(lean));
    L.dipDir.copy(L.xS).multiplyScalar(sd).addScaledVector(L.zS, 0.3).normalize();
  }

  function solveAlongside(L) {   // laid along the raft in the water, its chin against the deck's edge, the Wick standing over it
    const Y = L.Y, fv = L.fv, K = L.kit, b = L.b, rh = handR(), flat = K.wings;
    if (!L.sup) L.sup = raftSupport(DECK_RECT, L.zS, L.xS, { within: L.grip.squareWithin ?? 12, turn: L.grip.turn ?? 16, zones: (raft.level || 0) >= 1 ? EDGE_ZONES_UP : EDGE_ZONES });   // (latched: it never swaps edges as the lens settles)
    const U = L.sup;
    const phi = Math.max((L.grip.flankUp ?? 30) * DEG, 0.52);
    const e = T.a.set(U.ex, 0, U.ez), n = T.b.set(U.nx, 0, U.nz);
    // how wide it lies toward the raft, and how high, at its deepest and at its head
    const tipF = 38 * DEG;   // a flat fish: its back tipped this far to the lens (flat on the water it would be a line from here)
    const ext = (q) => (flat ? q.halfW * Math.cos(tipF) + ((q.top - q.bottom) / 2) * Math.sin(tipF) : Math.hypot(((q.top - q.bottom) / 2) * Math.cos(phi), q.halfW * Math.sin(phi)));
    const hgt = (q) => (flat ? q.halfW * Math.sin(tipF) + ((q.top - q.bottom) / 2) * Math.cos(tipF) : Math.hypot(((q.top - q.bottom) / 2) * Math.sin(phi), q.halfW * Math.cos(phi)));
    let fw = 0.4, rho = 0;
    for (let f = 0.15; f <= 0.75; f += 0.05) { const r = ext(fv.section(f, sec)); if (r > rho) { rho = r; fw = f; } }
    const headF = 0.09, rhoH = ext(fv.section(headF, sec)), thickH = hgt(sec), thick = hgt(fv.section(fw, sec2));
    // along an edge: nosed in a little, so the head meets the planks while the belly clears them
    if (U.aligned) {
      const offSq = Math.acos(clamp(e.x * L.xS.x + e.z * L.xS.z, -1, 1)), toward = (e.x * L.zS.x + e.z * L.zS.z) > 0 ? -1 : 1;   // (nosing in turns it toward or away from square)
      const psi = clamp(Math.atan2(rho - rhoH, (fw - headF) * L.L), 0, Math.max(0, (L.grip.noseIn ?? 18) * (flat ? 0.67 : 1) * DEG - toward * offSq));
      e.multiplyScalar(Math.cos(psi)).addScaledVector(n, -Math.sin(psi)).normalize();
    }
    // its frame: the flank that faces us tipped up, its back toward the raft; a flat fish lies back up
    const hN = T.c.copy(L.zS).addScaledVector(e, -L.zS.dot(e)); if (hN.lengthSq() < 1e-6) hN.copy(n); hN.normalize();
    if (flat) frameQuat(Y.quat, e, T.d.copy(UP).multiplyScalar(Math.cos(tipF)).addScaledVector(hN, Math.sin(tipF)), 'back');
    else {
      frameQuat(Y.quat, e, T.d.copy(hN).multiplyScalar(Math.cos(phi)).addScaledVector(UP, Math.sin(phi)), 'flank');
      T.Y.set(0, 1, 0).applyQuaternion(Y.quat); if (T.Y.y < 0) { T.q.setFromAxisAngle(T.Z.set(0, 0, 1), Math.PI); Y.quat.multiply(T.q); }
    }
    // the head lifted to the deck's edge: a little pitch, the rest in the neck
    const yMid = WATER_Y + thick * 0.2, yHead = deckY + thickH * 0.3, span = Math.max(0.2, (fw - headF) * L.L);
    const rise = Math.max(0, yHead - yMid), pitch = Math.min(Math.asin(clamp(rise / span, 0, 0.5)), 8 * DEG);
    T.q.setFromAxisAngle(T.d.crossVectors(e, UP).normalize(), pitch); Y.quat.premultiply(T.q);
    const neck = flat ? 0 : clamp(Math.atan2(rise - Math.sin(pitch) * span, 0.2 * L.L), 0, 0.7);
    L.bendHold = { head: neck > 0.03 ? [0.27, 0.16, -neck] : null, tail: fv.shape === 'eel' ? [0.6, 0.3, 0.3] : null };
    fv.setBend?.(L.bendHold);
    // place it: the head at the edge, the middle afloat
    const hl = T.d.set(0, (sec.top + sec.bottom) / 2, sec.z); fv.section(headF, sec); hl.set(0, (sec.top + sec.bottom) / 2, sec.z); fv.bendPoint?.(hl);
    Y.pos.set(U.px, 0, U.pz).addScaledVector(n, rhoH + 0.025); Y.pos.y = yHead;
    Y.pos.sub(hl.applyQuaternion(Y.quat));
    const midW = T.d.set(0, 0, fv.section(fw, sec2).z).applyQuaternion(Y.quat).add(Y.pos);
    if (midW.y < WATER_Y + thick * 0.08) Y.pos.y += WATER_Y + thick * 0.08 - midW.y;
    // nothing of it over the planks: out along the edge's normal until its skin is clear of the deck
    for (let it = 0; it < 60; it++) {
      let inside = 0;
      for (let f = 0; f <= 0.5; f += 0.04) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const p = skin(fv, f, dx, dy, 0, T.e).applyQuaternion(Y.quat).add(Y.pos);
        if (p.y > WATER_Y) inside = Math.max(inside, Math.min(p.x - DECK_RECT.x0, DECK_RECT.x1 - p.x, p.z - DECK_RECT.z0, DECK_RECT.z1 - p.z) + 0.015);
      }
      if (inside <= 0) break;
      Y.pos.addScaledVector(n, Math.min(0.05, inside + 0.005));
    }
    // the Wick: standing on the planks behind its brow, three-quarter toward the body, the rod planted in the far hand
    const inset = L.grip.inset ?? 0.24;
    L.spotWant.set(clamp(U.px - n.x * inset, DECK_RECT.x0 + inset, DECK_RECT.x1 - inset), deckY, clamp(U.pz - n.z * inset, DECK_RECT.z0 + inset, DECK_RECT.z1 - inset));
    L.spot.copy(L.spotWant);
    faceLens(L);
    const nearK = L.side > 0 ? 'l' : 'r', farK = L.side > 0 ? 'r' : 'l';
    const gN = nearK === 'l' ? Y.gripL : Y.gripR;
    const upL = T.g.copy(UP).applyQuaternion(T.q2.copy(Y.quat).invert()).clone(), inL = T.h.copy(n).negate().applyQuaternion(T.q2).clone(), nOut = n.clone();
    for (let pass = 0; pass < 3; pass++) {
      const G = probe(L), shNear = L.side > 0 ? G.shL : G.shR;
      if (pass !== 1) pushClear(L, G, Y.pos, Y.quat, nOut, 0, 0.5, 0.01, 0.002);   // (again once it has crouched: the cloak leans out over the edge)
      // the hand: on the nearest of its brow and snout the arm can reach
      let best = null;
      for (const f of [0.1, 0.06, 0.14, 0.03, 0.2, 0.26]) for (const k of [1, 0.75, 0.5, 0.25, 0]) {
        const g = skin(fv, f, upL.x * k + inL.x * (1 - k), upL.y * k + inL.y * (1 - k), rh * 0.55, T.c);
        const w = T.e.copy(g).applyQuaternion(Y.quat).add(Y.pos), m = wick.ghostReach(nearK, T.d.copy(w), REACH + 0.3) + (1 - k) * 0.01 + Math.abs(f - 0.1) * 0.02;
        if (best === null || m < best - 1e-4) { best = m; gN.copy(g); }
      }
      settleHand(L, nearK, gN);
      L.crouch = clamp((shNear.y - (nearK === 'l' ? Y.handL : Y.handR).y - 0.26) / 0.22, 0, 1);
    }
    plantRod(L, -L.side, 0.32, 0.04, 4, 2);
    rodGrip(L, farK, 0.4);
    L.lockKeys = ['r', 'l'];
    // it comes in along the raft: a slide up to the edge, its head not yet lifted
    Y.takeQuat.copy(Y.quat);
    Y.takePos.copy(Y.pos).addScaledVector(e, -Math.min(0.25, 0.08 * L.L)).addScaledVector(n, 0.3 + 0.05 * Math.min(L.L, 9)); Y.takePos.y -= rise * 0.5;
    Y.travel = Y.takePos.distanceTo(Y.pos);
    L.dipDir.copy(n);
  }

  function solve(L) {
    L.Y.hasTip = false;
    if (L.id !== 'alongside') { L.spot.copy(L.spotWant); faceLens(L); }
    if (L.id === 'pinch' || L.id === 'both') solveHeld(L);
    else if (L.id === 'hug') solveHug(L);
    else if (L.id === 'hang') solveHang(L);
    else solveAlongside(L);
    if (L.Y.rod.mode === 'stowed') L.Y.hasTip = false;
    // the picture's middle (what the resting lens looks at): between the fish's middle and the Wick's head
    if (L.fv && L.G) { T.a.set(0, (L.b.top + L.b.bottom) / 2, (L.b.noseZ + L.b.tailZ) / 2).applyQuaternion(L.Y.quat).add(L.Y.pos); L.mid.copy(T.a).lerp(L.G.head.center, 0.5); L.hasMid = true; }
  }

  // ---------------------------------------------------------------- begin / end
  function newLayout(fv, id, cls, o = {}) {
    const a = A(), LS = a.life || LIFE0, row = LS[cls] || LIFE0[cls] || LIFE0.keeper, ci = Math.max(0, SHOW_CLASSES.indexOf(cls));
    const L = fv ? fv.length || 0.5 : 0.5;
    const b = fv?.bounds || { noseZ: L * 0.5, tailZ: -L * 0.5, halfW: L * 0.07, top: L * 0.1, bottom: -L * 0.1 };
    const lay = {
      fv, obj: fv?.object3d || null, L, b, shape: fv?.shape || 'minnow', id, name: SHOW_NAMES[id], cls, ci, weight: ci / 5, row, LS,
      grip: { ...(GRIP0[id] || {}), ...(a.grip?.[id] || {}) }, F: { ...FACING0, ...(a.facing || {}) },
      beats: { lift: 0.5, hold: 0.5, pause: 0.7, ...(o.beats && typeof o.beats === 'object' ? o.beats : {}) }, special: !!o.special,
      t: 0, driven: false, frame: 0, side: 1, tiny: false, tall: false, crouch: 0, wide: 1, hugTwist: 0,
      zS: V().set(0, 0, 1), xS: V().set(1, 0, 0), hasLens: false, spot: V().copy(home), spotWant: V().copy(home), lensYaw: 0, lensElev: 0.15, faceYaw: 0, faceLive: 0,
      camEst: V(), mid: V(), hasMid: false, aimRest: { yaw: 0, elev: 0.15 }, aimLive: { yaw: 0, elev: 0.15 },
      from: { pos: V(), quat: new THREE.Quaternion() }, dipDir: V().set(0, 0, 1), bendHold: null, bendNow: null, lockKeys: [],
      Y: { pos: V(), quat: new THREE.Quaternion(), takePos: V(), takeQuat: new THREE.Quaternion(), gripR: V(), gripL: V(), handR: V(), handL: V(), rodHandNear: V(), pivot: V(), hangLocal: V(), tip: V(), hasTip: false, travel: 0.3, line: 0.1,
        rod: { mode: 'stowed', butt: V(), dir: V().set(0, 1, 0), dir0: V().set(0, 1, 0), bow: new THREE.Vector2(), bow0: new THREE.Vector2(), scale: wick.group.scale.x * (wick.build?.[1] || 1) } },
      now: { pos: V(), quat: new THREE.Quaternion(), swingA: 0 }, G: null, kit: null, spec: null, k: { r: 0, l: 0, rod: 0, stow: 0, nearToFish: 0 },
      pend: { a: 0, tw: 0 }, drip: { next: 0, n: 0, pre: 0 }, seen: { take: false, present: false, settle: false, flaps: 0 }, wet: 1, bob2: 0,
    };
    lay.wide = Math.max(0.8, (wick.build?.[0] || 1));
    lay.flaps = showFlaps(lay.beats, row, LS);
    if (fv) { lay.kit = kitFor(fv, id); lay.tiny = id === 'pinch' && L < (lay.grip.tinyBelow ?? 0.15); }
    return lay;
  }
  /** What stands behind each side of the Wick as the lens sees it: [lens-left, lens-right] clutter (the brazier's flame, the
   *  lantern post and its lantern, the creel, an upgraded raft's crate). low = a catch held at chest height (the brazier and the
   *  creel are behind it); a tall one stood or hung beside the Wick has only the post to fear. */
  function clutter(L, low) {
    const lvl = raft.level || 0, out = [0, 0];
    // [x, z, behind a catch held at the chest, behind one stood or hung, in front of one stood or hung (it hides its foot)]
    const props = [[-0.64, 0.84, 1, 0.3, 0.9], [POLE_AT.x, POLE_AT.z, 0.6, 1.2, 0], [-0.4, -0.55, 0.4, 0.8, 0], [0.62, -0.8, 0.5, 0.2, 0.9]];
    if (lvl >= 2) props.push([-0.6, -0.6, 0.5, 0.2, 0.9]);
    for (const [x, z, wLow, wTall, wFront] of props) {
      const xs = (x - L.spot.x) * L.xS.x + (z - L.spot.z) * L.xS.z, zs = (x - L.spot.x) * L.zS.x + (z - L.spot.z) * L.zS.z;
      if (Math.abs(xs) < 0.12 || Math.abs(xs) > 1.4) continue;
      const near = 1 - 0.4 * Math.abs(xs) / 1.4;
      if (zs <= 0.9) out[xs > 0 ? 1 : 0] += (low ? wLow : wTall) * near;                  // behind it, or beside (in front of the Wick it is out of a close frame)
      if (!low && zs > 0.25 && Math.abs(xs) < 1.1) out[xs > 0 ? 1 : 0] += wFront * near;   // between the lens and a fish that stands on the deck
    }
    return out;
  }
  /** Which side of the Wick the fish is held, stood or hung (+1 = lens-right): where it came up, unless the raft's own things
   *  stand behind it there; a pinch prefers its left hand (the rod is in the right), the body of an alongside fish trails left. */
  function pickSide(L) {
    if (L.id === 'alongside') return -1;
    if (L.id === 'both') return 1;
    const c = clutter(L, L.id === 'pinch');
    if (L.id === 'pinch') return c[1] > c[0] + 0.25 ? -1 : 1;
    const from = L.hasFrom ? ((L.from.pos.x - L.spot.x) * L.xS.x + (L.from.pos.z - L.spot.z) * L.xS.z >= 0 ? 1 : -1) : 1;
    const side = c[from > 0 ? 1 : 0] > c[from > 0 ? 0 : 1] + 0.5 ? -from : from;
    // a fish stood or hung beside the Wick is never shown behind the creel or the brazier (with the lens low, either one hides its
    // foot and half its length): if one stands between the lens and that side and not the other, it goes to the other side
    return hidesFoot(L, side) && !hidesFoot(L, -side) ? -side : side;
  }
  function hidesFoot(L, side) {
    // the line from the lens (dl m off, along zS) to the fish's foot (≈ xf m to that side of the Wick): does it pass within the
    // prop's reach where the prop stands? Only props the low lens still sees count (not right under it, not behind the Wick)
    const dl = L.id === 'hug' ? 2.1 : 1.4 + 1.0 * L.L, xf = side * (L.id === 'hug' ? 0.34 : 0.42);
    for (const [x, z] of [[0.62, -0.8], [-0.64, 0.84]]) {   // the creel, the brazier
      const xs = (x - L.spot.x) * L.xS.x + (z - L.spot.z) * L.xS.z, zs = (x - L.spot.x) * L.zS.x + (z - L.spot.z) * L.zS.z;
      if (zs < 0.2 || zs > dl - 0.8) continue;
      if (Math.abs(xs - xf * (dl - zs) / dl) < 0.42) return true;
    }
    return false;
  }
  function begin(fv, o = {}, cam, camPos) {
    if (S) finish(false);
    if (gone) dropGone();
    const d = D();
    const legend = !!(o.legend ?? o.legendary ?? fv.legendary);
    const id = SHOW_NAMES[o.pose] ? o.pose : (SHOW_IDS[o.pose] || d.showPoseFor?.(fv.length, { sizeClass: o.sizeClass, ancient: !!o.ancient, legend, shape: fv.shape }) || 'both');
    const cls = SHOW_CLASSES.includes(o.cls) ? o.cls : (d.showClassOf?.({ sizeClass: o.sizeClass, ancient: !!o.ancient, legend }) || 'keeper');
    S = newLayout(fv, id, cls, o);
    hold = null;
    const obj = fv.object3d;
    deck.updateWorldMatrix(true, false); deck.getWorldQuaternion(deckQ); deckQi.copy(deckQ).invert();
    if (obj.parent) { obj.updateWorldMatrix(true, false); obj.getWorldPosition(S.from.pos); obj.getWorldQuaternion(S.from.quat); S.hasFrom = true; }
    else S.hasFrom = false;
    holder.add(obj); obj.scale.setScalar(1);
    if (S.hasFrom) { deck.worldToLocal(S.from.pos); S.from.quat.premultiply(deckQi); }
    readLens(cam, camPos, 0, true);
    S.side = pickSide(S);
    try { fv.setBend?.(S.kit.bend || null); } catch { /* visual */ }
    for (let i = 0; i < (id === 'hug' ? 6 : 2); i++) solve(S);   // (again: the later passes know where the picture's middle is, and how far a hug must turn)
    if (!S.hasFrom) { S.from.pos.copy(S.Y.takePos).addScaledVector(S.zS, 0.6).addScaledVector(UP, -0.3); S.from.quat.copy(S.Y.takeQuat); }
    S.now.pos.copy(S.from.pos); S.now.quat.copy(S.from.quat);
    Object.assign(stats, { drips: 0, flaps: 0, beats: {}, maxP: 0, restAt: null, maxHandGap: 0, dipAtPresent: null, dipAfter: null, dipPeak: 0 });
    stats.handGap.r = 0; stats.handGap.l = 0;
    dip.atPresent = null; dip.peak = 0;
    try { fv.setWet?.(1); } catch { /* visual */ }
    return { pose: S.name, id, hands: id === 'pinch' || id === 'alongside' ? 1 : 2, side: S.side };
  }
  function finish(gesture, action) {
    if (!S) return;
    const L = S; S = null;
    wick.setShow(null);
    try { L.fv.setWet?.(0); } catch { /* visual */ }
    if (L.obj) L.obj.visible = true;
    gone = { L, t: 0, action: gesture ? action : null, cls: L.cls, k: { ...L.k }, obj: L.obj, fv: L.fv, from: { pos: L.obj.position.clone(), quat: L.obj.quaternion.clone() }, done: !gesture, out: V(), far: 0.5 };
    {   // the way back over the side: out from the raft (a giant), else off to its own side of the picture, never at the lens; far enough to clear the planks
      const P = L.now.pos, o = gone.out;
      if (L.id === 'alongside') { o.copy(L.zS); gone.far = 0.5; }
      else {
        const sd = L.id === 'both' ? 1 : L.side || 1;
        o.copy(L.xS).multiplyScalar(sd).addScaledVector(L.zS, 0.2).normalize();
        const tx = Math.abs(o.x) > 1e-4 ? ((o.x > 0 ? DECK_RECT.x1 : DECK_RECT.x0) - P.x) / o.x : Infinity, tz = Math.abs(o.z) > 1e-4 ? ((o.z > 0 ? DECK_RECT.z1 : DECK_RECT.z0) - P.z) / o.z : Infinity;
        gone.far = Math.max(0, Math.min(tx, tz)) + 0.3 + 0.4 * L.L;
      }
    }
    if (!gesture || action === 'eat' || action === 'render') { letGo(gone); }
  }
  function letGo(g) {   // the fish leaves the scene at once (fishing disposes the model)
    g.done = true;
    try { g.fv.setBend?.(null); g.fv.setWarm?.(0); } catch { /* visual */ }
    if (g.obj && g.obj.parent === holder) holder.remove(g.obj);
  }
  function dropGone() { if (gone) { if (!gone.done) letGo(gone); wick.setHandLock('r', null); wick.setHandLock('l', null); wick.setRodDrive({}); rodBow.on = false; gone = null; } }

  // ---------------------------------------------------------------- one frame, before the Wick is posed
  const eq = new THREE.Quaternion(), ep = V();
  function fishNow(L, c, dt) {   // where the fish is at this pose time (deck space)
    const Y = L.Y, N = L.now, id = L.id;
    const a = c.swing, p = c.p;
    if (id === 'hang') {
      // under the rod's tip on its line: the rod is heaved upright by the present; a pendulum that settles
      const R = Y.rod, kp = clamp(p, 0, 1.3);
      ep.copy(R.dir0).lerp(R.dir, kp).normalize(); L.rodDirNow.copy(ep);
      L.rodBowNow.set(R.bow0.x + (R.bow.x - R.bow0.x) * kp, R.bow0.y + (R.bow.y - R.bow0.y) * kp);
      const len = wick.rodLength * R.scale, bx = L.rodBowNow.x, bz = L.rodBowNow.y;
      T.q.setFromUnitVectors(UP, ep);
      const tip = T.a.set(bx * len, len * (1 - 0.5 * (bx * bx + bz * bz)), bz * len).applyQuaternion(T.q).add(R.butt).addScaledVector(ep, wick.rodButt * R.scale);
      L.tipNow.copy(tip);
      // (it swings out from the Wick as it comes up and settles back under the tip: never in against the cloak)
      const tt = L.t, sw = L.side * 0.2 * Math.exp(-tt / 0.7) * (0.55 + 0.45 * Math.cos(2.7 * tt)) * (0.4 + 0.6 * a) + 0.015 * Math.sin(tt * 0.9) * (1 - 0.6 * c.calm) + 0.03 * c.flap * Math.sin(tt * 19);
      const tw = (0.13 * Math.exp(-tt / 1.3) * Math.sin(1.4 * tt + 0.6) + 0.03 * Math.sin(tt * 0.7)) * (1 - 0.5 * c.calm);
      T.q.setFromAxisAngle(L.zS, sw); T.q2.setFromAxisAngle(UP, tw);
      eq.copy(T.q).multiply(T.q2).multiply(Y.quat);
      // (a fish longer than the tip is high rests its tail: it cannot drop below the planks, so the line slackens instead)
      ep.copy(Y.hangLocal).applyQuaternion(eq).negate().add(tip).addScaledVector(UP, -Y.line);
      if (Y.rested) ep.y = Math.max(ep.y, Y.pos.y - 0.002);
      if (a < 1) { blendIn(L, a, ep, eq); } else { N.pos.copy(ep); N.quat.copy(eq); }
      return;
    }
    if (id === 'alongside') {
      const g = clamp(c.u / 0.9, 0, 1), kp = clamp(p, 0, 1);
      ep.copy(Y.takePos).lerp(Y.pos, kp); eq.copy(Y.takeQuat).slerp(Y.quat, kp);
      ep.y += Math.max(0, p - 1) * 0.5;   // (the present's overshoot is a lift of the head, never a shove into the planks)
      ep.y += Math.sin(L.t * 1.1) * 0.012 * Math.min(2, 1 + L.L * 0.2) * (1 - 0.5 * c.calm);
      T.q.setFromAxisAngle(T.a.set(0, 0, 1).applyQuaternion(eq), 0.03 * c.flap * Math.sin(L.t * 17));
      eq.premultiply(T.q);
      if (g < 1) underTo(L, g, ep, eq); else { N.pos.copy(ep); N.quat.copy(eq); L.under = false; }
      return;
    }
    // held and hugged: take point → hold point by the present (its overshoot carries on past), the flaps on top
    const kp = clamp(p, 0, 1.4), over = p - Math.min(p, 1);
    if (id === 'hug') {
      eq.copy(Y.takeQuat).slerp(Y.quat, clamp(kp, 0, 1));
      if (over > 0) { T.q.setFromAxisAngle(L.zS, L.side * over * (L.grip.heave ?? 18) * DEG); eq.premultiply(T.q); }
      // about its tail on the planks: the hinge stays put
      T.q.copy(eq).multiply(T.q2.copy(Y.quat).invert());
      ep.copy(Y.pos).sub(Y.pivot).applyQuaternion(T.q).add(Y.pivot).addScaledVector(L.xS, L.side * 0.05 * (1 - clamp(kp, 0, 1)));
      const tr = L.row.strain > 0.01 ? (Math.sin(L.t * 37) * 0.004 + Math.sin(L.t * 23.7) * 0.003) * L.row.strain * (1 - c.calm) : 0;
      T.q.setFromAxisAngle(L.zS, -L.side * (0.035 * c.flap * Math.sin(L.t * 21) + tr)); eq.premultiply(T.q);
      ep.sub(Y.pivot).applyQuaternion(T.q).add(Y.pivot);
    } else {
      ep.copy(Y.takePos).lerp(Y.pos, kp);
      eq.copy(Y.takeQuat).slerp(Y.quat, clamp(kp, 0, 1));
      // the weight in the hands: a dip as they take it, a give with each flap, the fish kicking about its middle
      ep.y -= 0.022 * c.dip * (0.4 + L.weight) + 0.016 * c.flap * (0.5 + L.weight);
      const kick = 0.16 * c.flap * Math.sin(L.t * 23) * (L.kit.round ? 0.4 : 1) * (1 - 0.5 * L.weight);
      T.q.setFromAxisAngle(L.zS, kick); eq.premultiply(T.q);
      ep.y += (L.spec?.bobM || 0);
    }
    if (a < 1) blendIn(L, a, ep, eq); else { N.pos.copy(ep); N.quat.copy(eq); }
  }
  /** The posture this frame: the one it rests in, and on a flap the tail fin's kick (behind the rear hand: the grips do not move)
   *  or, for a fish stood on its tail, a toss of its head. Flat and round catches flap with their own bodies (FishVisual). */
  function flapBend(L, c) {
    const rest = L.bendHold || L.kit.bend || null;
    if (!(c.flap > 0.01) || L.kit.wings || L.shape === 'jelly' || L.shape === 'crayfish' || L.shape === 'puffer' || L.id === 'alongside' || (L.id === 'hang' && L.Y.rested)) return rest;
    if (L.id === 'hug') return { ...(rest || {}), head: [0.3, 0.22, 0.2 * c.flap * Math.sin(L.t * 17)] };
    const kick = 0.6 * c.flap * Math.sin(L.t * 21) * (1 - 0.4 * L.weight), t0 = rest?.tail;
    if (t0 && t0[0] < 0.75) return rest;
    return { ...(rest || {}), tail: t0 ? [t0[0], t0[1], t0[2] + kick] : [0.8, 0.16, kick] };
  }
  /** Nothing of the fish goes under the planks: over the deck it rides up onto them (eased in from the deck's edge). */
  function overDeck(L) {
    const N = L.now, fv = L.fv;
    let lift = 0;
    for (let f = 0; f <= 1.0001; f += 0.05) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const p = skin(fv, f, dx, dy, 0, T.e).applyQuaternion(N.quat).add(N.pos);
      const inX = Math.min(p.x - DECK_RECT.x0, DECK_RECT.x1 - p.x), inZ = Math.min(p.z - DECK_RECT.z0, DECK_RECT.z1 - p.z), inside = Math.min(inX, inZ);
      if (inside > -0.15) lift = Math.max(lift, (deckY + 0.006 - p.y) * smooth01((inside + 0.15) / 0.15));
    }
    if (lift > 0) N.pos.y += lift;
  }
  /** The swing in: from where fishing left it, up on the line and round into the hands (a 0 → 1), in front of the Wick. */
  function blendIn(L, a, toPos, toQuat) {
    const N = L.now, F = L.from;
    const tip = wick.getRodTip(T.a); deck.worldToLocal(tip);
    // a control point under the rod's tip: it is hoisted, then let down into the hands
    const ctrl = T.b.copy(F.pos).lerp(toPos, 0.55); ctrl.y = Math.max(F.pos.y, toPos.y) + 0.18 + 0.12 * F.pos.distanceTo(toPos);
    ctrl.lerp(tip, 0.12);
    // (never through the Wick: the path's middle keeps to the lens side of it)
    const zA = along(L, F.pos, L.zS), zB = along(L, toPos, L.zS), zC = along(L, ctrl, L.zS), need = (L.G?.vol.r || 0.33) + 0.15 + (L.b.halfW || 0.05);
    const zMid = 0.25 * zA + 0.5 * zC + 0.25 * zB;
    if (zMid < need) ctrl.addScaledVector(L.zS, 2 * (need - zMid));
    const i = 1 - a;
    N.pos.set(i * i * F.pos.x + 2 * i * a * ctrl.x + a * a * toPos.x, i * i * F.pos.y + 2 * i * a * ctrl.y + a * a * toPos.y, i * i * F.pos.z + 2 * i * a * ctrl.z + a * a * toPos.z);
    // it dangles head-up on the line on the way (the snout toward the tip), flank to the lens
    const dang = T.q;
    if (L.id === 'hang' || L.id === 'hug') dang.copy(toQuat);
    else frameQuat(dang, T.c.copy(UP).addScaledVector(L.xS, 0.25), T.d.copy(L.zS), L.kit.face);
    N.quat.copy(F.quat).slerp(dang, smooth01(a / 0.55));
    N.quat.slerp(toQuat, smooth01((a - 0.45) / 0.55));
    L.now.swingA = a;
  }
  /** A fish too long to lift is hauled round to the raft's side under the surface (the lake is opaque: it sinks where it rose,
   *  and comes up again against the deck's edge), so nothing of it ever sweeps through the raft. g 0 → 1. */
  function underTo(L, g, toPos, toQuat) {
    // (just under: its back cuts the surface on the way, and it is out of sight for well under half the lift)
    const N = L.now, F = L.from, deep = Math.max(L.b.halfW, (L.b.top - L.b.bottom) / 2) * 1.15 + 0.08;
    const down = smooth01(g / 0.22), up = smooth01((g - 0.42) / 0.5), k = smooth01((g - 0.06) / 0.66);
    N.pos.copy(F.pos).lerp(toPos, k); N.quat.copy(F.quat).slerp(toQuat, k);
    N.pos.y = F.pos.y + (toPos.y - F.pos.y) * k - deep * down * (1 - up);
    L.under = down > 0.98 && up < 0.02;
    if (!L.rose && up > 0.2) { L.rose = true; try { T.e.set(0, 0, L.b.noseZ * 0.5).applyQuaternion(N.quat).add(N.pos); toWorld(T.e); ctx.water?.splash?.(T.e.x, T.e.z, { size: 0.4 + 0.25 * Math.min(4, L.L), count: Math.round(10 + 3 * Math.min(6, L.L)), ring: false }); } catch { /* visual */ } }
  }

  function step(dt, t, cam, camPos) {
    lineOut.on = false; rodBow.on = false;
    if (gone) stepGone(dt, t, camPos);
    const L = S;
    if (!L) {
      if (hold) { readLens(cam, camPos, dt, false); faceLens(hold); hold.spec = hold.spec || restSpec(hold); Object.assign(hold.spec, { faceYaw: hold.faceLive, lensYawLocal: hold.aimLive.yaw, lensElev: hold.aimLive.elev, turnRate: hold.F.turnRate }); wick.setShow(hold.spec); }
      return;
    }
    if (!L.obj || L.obj.parent !== holder) { finish(false); return; }   // the model was taken away under us (disposed, re-parented)
    L.frame++;
    readLens(cam, camPos, dt, false);
    const c = showCurves(L.t, L.beats, L.row, L.LS, L.flaps, curves);
    // the posture it settles into (set before the solve: the grips are found on the bent body)
    if (L.id === 'pinch' || L.id === 'both') { L.bendHold = L.kit.bend; }
    try { L.fv.setBend?.(L.bendHold || L.kit.bend || null); } catch { /* visual */ }
    solve(L);
    const Y = L.Y;
    // ---- the Wick's spec (the pose reads it this frame)
    const sp = (L.spec = L.spec || restSpec(L));
    const s = wick.group.scale.x;
    const tau = c.tau;
    // the proud bob after the settle; a new species or a legend bobs again, bigger, eyes wide for a beat
    const bobAt = (x, w) => (x > 0 && x < w ? Math.sin(Math.PI * x / w) : 0);
    const bobM = (L.row.bob || 0) * bobAt(tau - 0.3, 0.3) + (L.special ? (L.row.bob || 0.01) * 1.9 * bobAt(tau - 0.62, 0.34) : 0);
    sp.bobM = bobM * (1 - c.calm);
    // a glance: at the fish as it comes in, to us at the present, back at the fish once in a long hold, at us through the pause
    let glance = 1 - smooth01((c.u - 0.55) / 0.4);
    if (L.tiny) glance = Math.max(glance, bobAt(tau - 0.02, 0.4) * 0.85);
    if (L.beats.hold >= 0.8) glance = Math.max(glance, bobAt(tau - L.beats.hold * 0.5, 0.42) * (L.id === 'hang' || L.id === 'hug' ? 0.5 : 0.8));   // (beside a big fish it is a turn of the head, not a lean into it)
    const mid = T.a.set(0, 0, (L.b.noseZ + L.b.tailZ) / 2).applyQuaternion(L.now.quat).add(L.now.pos);
    Object.assign(sp, { pose: L.name, side: L.side, p: c.p, take: c.take, swing: c.swing, calm: c.calm, flap: c.flap, dip: c.dip, bob: sp.bobM / s, weight: L.weight, life: L.row, glance: glance * (1 - c.calm),
      hugTwist: L.hugTwist,
      special: L.special ? bobAt(tau - 0.6, 0.5) : 0, wide: L.special ? bobAt(tau - 0.1, 0.7) : (L.tiny ? bobAt(tau - 0.02, 0.35) * 0.6 : 0), tiny: L.tiny, crouch: L.crouch,
      faceYaw: L.faceLive, turnRate: L.F.turnRate, lensYawLocal: L.aimLive.yaw, lensElev: L.aimLive.elev,
      fishYawLocal: Math.atan2(mid.x - L.spot.x, mid.z - L.spot.z), fishElev: clamp(Math.atan2(mid.y - (L.spot.y + 0.8 * s / 1.22), Math.max(0.2, Math.hypot(mid.x - L.spot.x, mid.z - L.spot.z))), -0.6, 0.6),
      t: L.t, lift: L.beats.lift, hold: L.beats.hold, pause: L.beats.pause, cls: L.cls, lenB: L.L / s, depthB: (L.b.top - L.b.bottom) / s, shape: L.shape });
    wick.setShow(sp);
    // ---- the rod: planted, raised, or set down
    const R = Y.rod, K = L.k, ta = L.LS.takeAt ?? 0.62;
    L.rodDirNow = L.rodDirNow || V(); L.rodBowNow = L.rodBowNow || new THREE.Vector2(); L.tipNow = L.tipNow || V();
    if (R.mode === 'stowed') { K.rod = 0; K.stow = smooth01((L.t - ta * 0.8 * L.beats.lift) / 0.3); }
    else { K.stow = 0; K.rod = smooth01((c.u - 0.2) / (R.mode === 'raised' ? 0.3 : ta - 0.2)); L.rodDirNow.copy(R.dir); L.rodBowNow.copy(R.bow); }
    // ---- the fish (it leads)
    fishNow(L, c, dt);
    if (L.id !== 'alongside') overDeck(L);
    const obj = L.obj;
    obj.position.copy(L.now.pos); toWorld(obj.position);
    obj.quaternion.copy(deckQ).multiply(L.now.quat);
    obj.scale.setScalar(1);
    obj.visible = !L.under;
    obj.updateMatrixWorld(true);
    try {
      L.bendShown = flapBend(L, c); L.fv.setBend?.(L.bendShown);   // (after the grips were found on the body at rest)
      L.fv.update?.(dt, t, { swim: L.id === 'alongside' ? 0.08 : 0.16 + 0.1 * (1 - c.take), struggle: c.struggle * (L.id === 'alongside' ? 0.5 : 1) });
      L.wet = Math.max(0.55, L.wet - dt * 0.12); L.fv.setWet?.(L.wet); L.fv.setWarm?.(Math.min(1, c.take * 1.2));
    } catch { /* visual */ }
    // ---- the hands, locked on
    const near = L.side > 0 ? 'l' : 'r', far = L.side > 0 ? 'r' : 'l';
    const grip = (key) => T.b.copy(key === 'r' ? Y.gripR : Y.gripL).applyMatrix4(obj.matrixWorld);
    const onRod = (h) => toWorld(T.b.copy(R.butt).addScaledVector(L.rodDirNow, h / Math.max(0.3, L.rodDirNow.y)));
    if (L.id === 'pinch') { K[near] = c.take; wick.setHandLock(near, grip(near), K[near], REACH); K[far] = K.rod; wick.setHandLock(far, onRod(0.4), K[far], REACH); }
    else if (L.id === 'both') { K.r = c.take; K.l = c.take; wick.setHandLock('r', grip('r'), K.r, REACH); wick.setHandLock('l', grip('l'), K.l, REACH); }
    else if (L.id === 'hug') {   // the near arm takes it; the far one comes round as it is hauled up against the shoulder
      K[near] = c.take; K[far] = c.take * smooth01((c.p - 0.2) / 0.6);
      wick.setHandLock(near, grip(near), K[near], REACH); wick.setHandLock(far, grip(far), K[far], REACH);
    }
    else if (L.id === 'hang') {
      K[far] = K.rod; wick.setHandLock(far, onRod(0.42), K[far], REACH);
      K.nearToFish = smooth01((c.u - ta) / 0.3); K[near] = Math.max(K.rod, K.nearToFish);
      const a1 = T.c.copy(onRod(0.6)), a2 = grip(near);
      wick.setHandLock(near, a1.lerp(a2, K.nearToFish), K[near], REACH);
    } else { K[far] = K.rod; wick.setHandLock(far, onRod(0.4), K[far], REACH); K[near] = smooth01((c.u - 0.55) / 0.4); wick.setHandLock(near, grip(near), K[near], REACH + 0.3); }
    if (R.mode === 'stowed') wick.setRodDrive({ stow: K.stow });
    else {
      wick.setRodDrive({ butt: toWorld(T.c.copy(R.butt)), dir: T.d.copy(L.rodDirNow).applyQuaternion(deckQ), k: K.rod, scale: R.scale, stow: 0 });
      if (K.rod >= 0.999) { rodBow.on = true; rodBow.x = L.rodBowNow.x; rodBow.z = L.rodBowNow.y; }
    }
    // ---- the line: from the tip to its mouth while it swings in; the hang's own line throughout
    const mouth = T.e.set(0, 0, L.b.noseZ); L.fv.bendPoint?.(mouth); mouth.applyMatrix4(obj.matrixWorld);
    if (L.id === 'hang') { lineOut.on = true; lineOut.end.copy(mouth); lineOut.tension = 0.5 + 0.3 * L.weight; lineOut.slack = 0; }
    else if (L.id !== 'alongside' ? c.u < ta * 0.82 : c.u < 0.5) { lineOut.on = true; lineOut.end.copy(mouth); lineOut.tension = 0.5 * (1 - c.swing) + 0.15; lineOut.slack = 0.2 + 0.5 * c.swing; }
    // ---- the raft takes the weight
    const dipW = (L.row.dip || 0) * (L.id === 'alongside' ? 0.35 : 1) * smooth01((c.u - 0.3) / 0.45) * (1 - 0.66 * smooth01(tau / 0.85));
    const sub = Math.max(1, Math.ceil(dt / 0.008)), h = dt / sub;
    for (let i = 0; i < sub; i++) { dip.v += (95 * (dipW - dip.x) - 9.5 * dip.v) * h; dip.x += dip.v * h; }
    T.a.copy(L.dipDir); dip.dirX = T.a.x; dip.dirZ = T.a.z;
    dip.peak = Math.max(dip.peak, dip.x);
    if (tau >= 0 && stats.dipAtPresent == null) stats.dipAtPresent = dip.x;
    if (tau >= 1 && stats.dipAfter == null) stats.dipAfter = dip.x;
    // ---- beats, drips
    if (!L.seen.take && c.u >= ta) { L.seen.take = true; emit('take', 0.4 + 0.6 * L.weight); }
    if (!L.seen.present && tau >= 0) { L.seen.present = true; emit('present', 0.5 + 0.5 * L.weight); }
    if (!L.seen.settle && tau >= (L.LS.settle ?? 0.28)) { L.seen.settle = true; emit('settle', 0.3); }
    while (L.seen.flaps < c.flaps) { L.seen.flaps++; stats.flaps++; emit('flap', clamp(0.35 + 0.5 * L.L, 0, 1)); drops(L, 2, true); }
    drips(L, c, dt);
    stats.maxP = Math.max(stats.maxP, c.p);
    L.c = c;
  }
  // water off the fish: a sheet as it comes aboard, then the hold's drips from its belly and tail (the particle pool's motes)
  function drops(L, n, quick) {
    const M = ctx.models; if (!M?.emitEmber || !L.obj) return;
    for (let i = 0; i < n; i++) {
      const f = Math.random() < 0.3 ? 0.97 : 0.15 + Math.random() * 0.7;
      const p = skin(L.fv, f, 0, -1, 0, T.g).applyMatrix4(L.obj.matrixWorld);
      // straight down in the world, whatever way the fish is held
      p.y -= 0.01;
      M.emitEmber(p, { color: 0xdfe6ff, vx: 0, vz: 0, vy: quick ? -1.9 : -1.5, spread: quick ? 0.35 : 0.05, size: clamp(0.022 + L.L * 0.012, 0.022, 0.06), sizeGrow: -0.02, lifeT: 0.5, alpha: 0.85, jitter: 0.012 });
    }
  }
  function drips(L, c, dt) {
    const total = L.row.drips || 0;
    if (c.phase === 'lift') { L.drip.pre += dt * (4 + total) * c.swing * (1 - c.take * 0.5); while (L.drip.pre >= 1) { L.drip.pre -= 1; drops(L, 1, true); } return; }
    if (!total) return;
    const k = clamp(c.tau / Math.max(0.2, L.beats.hold), 0, 1), due = Math.floor(total * (1 - (1 - k) * (1 - k)) + 1e-6) + (c.tau > 0 ? 1 : 0);
    while (L.drip.n < Math.min(total, due)) { L.drip.n++; stats.drips++; drops(L, 1, false); if (L.drip.n % 2 === 1) emit('drip', 0.3); }
  }

  // ---------------------------------------------------------------- the way out (endShow)
  function stepGone(dt, t, camPos) {
    const g = gone; g.t += dt;
    const k = smooth01(g.t / 0.3);
    for (const key of ['r', 'l']) g.k[key] *= Math.exp(-12 * dt);
    // the hands let go, the rod comes back to the hand (or stays planted until the hand has it)
    wick.setHandLock('r', null); wick.setHandLock('l', null);
    const R = g.L.Y.rod;
    if (R.mode === 'stowed') wick.setRodDrive({ stow: g.k.stow * (1 - k) });
    else wick.setRodDrive({ butt: toWorld(T.c.copy(R.butt)), dir: T.d.copy(g.L.rodDirNow || R.dir).applyQuaternion(deckQ), k: g.k.rod * (1 - k), scale: R.scale });
    if (!g.done) {
      const obj = g.obj;
      if (!obj || obj.parent !== holder) g.done = true;
      else {
        const e = smooth01(g.t / 0.5), L = g.L;
        if (g.action === 'keep' && (L.id === 'pinch' || L.id === 'both')) {   // into the creel
          const to = toWorld(T.a.set(0.62, deckY + 0.3, -0.8));
          obj.position.lerpVectors(g.from.pos, to, e); obj.position.y += Math.sin(Math.PI * e) * 0.3;
          obj.scale.setScalar(Math.max(0.05, 1 - e * Math.min(0.95, 1 - 0.2 / Math.max(0.2, L.L))));
          T.q.setFromAxisAngle(T.b.set(1, 0, 0), e * 2.2); obj.quaternion.copy(g.from.quat).multiply(T.q);
        } else {   // back over the side: a low toss for a small one, a slide for a big one; a small splash, no ring
          const outW = T.a.copy(g.out).applyQuaternion(deckQ), far = g.far;
          obj.position.copy(g.from.pos).addScaledVector(outW, far * e);
          const wy = (ctx.water?.getHeight?.(obj.position.x, obj.position.z) ?? 0) - L.L * 0.2;
          obj.position.y = g.from.pos.y + (wy - g.from.pos.y) * e * e * e + (L.id === 'alongside' ? 0 : Math.sin(Math.PI * e) * (0.2 + 0.12 * Math.min(2, L.L)));   // (a heave: it clears the edge before it drops)
          T.q.setFromAxisAngle(T.b.set(1, 0, 0), e * 1.2); obj.quaternion.copy(g.from.quat).multiply(T.q);
          if (e >= 1 && !g.splashed) { g.splashed = true; try { ctx.water?.splash?.(obj.position.x, obj.position.z, { size: 0.3 + 0.2 * Math.min(3, L.L), count: 8, ring: false }); } catch { /* visual */ } }
        }
        try { g.fv.update?.(dt, t, { swim: 0.3, struggle: 0.3 }); } catch { /* visual */ }
        if (e >= 1) { obj.visible = false; letGo(g); obj.visible = true; }
      }
    }
    dip.v += (95 * (0 - dip.x) - 9.5 * dip.v) * Math.min(dt, 0.03); dip.x += dip.v * Math.min(dt, 0.03);
    if (g.t > 0.62 && g.done) { wick.setRodDrive({}); gone = null; }
  }

  // ---------------------------------------------------------------- what the camera keeps (the SETTLED layout, world space)
  function focus(center = new THREE.Vector3()) {
    const L = S;
    if (!L) return null;
    const rest = (L.row.dip || 0) * (L.id === 'alongside' ? 0.35 : 1) * 0.34;
    if (setDip) { setDip(rest, L.dipDir.x, L.dipDir.z); }
    deck.updateWorldMatrix(true, false); deck.getWorldQuaternion(deckQ);
    try { L.fv.setBend?.(L.bendHold || L.kit.bend || null); } catch { /* visual */ }
    try { return focusNow(L, center); }
    finally {
      try { if (L.bendShown !== undefined) L.fv.setBend?.(L.bendShown); } catch { /* visual */ }
      if (setDip) { setDip(dip.x, dip.dirX, dip.dirZ); deck.updateWorldMatrix(true, false); deck.getWorldQuaternion(deckQ); }
    }
  }
  function focusNow(L, center) {
    const Y = L.Y, fv = L.fv, b = L.b, G = L.G || probe(L);
    const P = (v) => v.clone().applyMatrix4(deck.matrixWorld);
    const fl = (x, y, z) => { const v = new THREE.Vector3(x, y, z); fv.bendPoint?.(v); return P(v.applyQuaternion(Y.quat).add(Y.pos)); };
    const midZ = (b.noseZ + b.tailZ) / 2, cy = (b.top + b.bottom) / 2;
    const snout = fl(0, 0, b.noseZ), tail = fl(0, 0, b.tailZ);
    // its back and belly at the deepest station; a flat fish's wing tips stand in for them
    const wings = L.kit.wings;
    let fw = 0.4, deep = 0; for (let f = 0.15; f <= 0.75; f += 0.1) { const s = fv.section ? fv.section(f, sec) : null; const dd = s ? (wings ? s.halfW : s.top - s.bottom) : 0; if (dd > deep) { deep = dd; fw = f; } }
    const sM = fv.section ? fv.section(fw, sec) : { z: midZ, top: b.top, bottom: b.bottom, halfW: b.halfW };
    const back = wings ? fl(sM.halfW, 0, sM.z) : fl(0, Math.max(sM.top, b.top * 0.85), sM.z), belly = wings ? fl(-sM.halfW, 0, sM.z) : fl(0, Math.min(sM.bottom, b.bottom * 0.85), sM.z);
    const fc = fl(0, cy, midZ);
    const axis = new THREE.Vector3(0, 0, 1).applyQuaternion(Y.quat).applyQuaternion(deckQ), up = new THREE.Vector3(0, 1, 0).applyQuaternion(Y.quat).applyQuaternion(deckQ);
    const hc = P(G.head.center), hr = G.head.radius;
    const camR = new THREE.Vector3(L.xS.x, 0, L.xS.z).applyQuaternion(deckQ);
    const headPts = [hc.clone().addScaledVector(camR, hr), hc.clone().addScaledVector(camR, -hr), hc.clone().addScaledVector(UP, hr * 1.05), hc.clone().addScaledVector(UP, -hr * 0.8)];
    const flame = P(G.flame), feet = P(G.feet);
    const hands = [P(Y.handR), P(Y.handL)];
    const rodUp = Y.rod.mode !== 'stowed' && Y.hasTip;
    const tip = rodUp ? P(Y.tip) : null;
    // (a hung fish: the frame need not climb the whole rod. It keeps the line's top, a little above the snout)
    const tipKeep = tip ? (L.id === 'hang' ? tip.clone().setY(Math.min(tip.y, snout.y + clamp(0.3 * L.L, 0.25, 0.5))) : tip) : null;
    if (tipKeep && L.id === 'hang') { tipKeep.x = snout.x + (tip.x - snout.x) * 0.5; tipKeep.z = snout.z + (tip.z - snout.z) * 0.5; }
    const fishPts = [snout, tail, back, belly];
    // (and its outermost points as it is posed: a fin, a bent tail, a wing: left, right, top, bottom and nearest the lens)
    { const H = hull(true), ax = [camR, camR.clone().negate(), UP, UP.clone().negate(), new THREE.Vector3(L.zS.x, 0, L.zS.z).applyQuaternion(deckQ)];
      for (const a of ax) { let best = null, bd = -Infinity; for (const p of H) { const d = p.dot(a); if (d > bd) { bd = d; best = p; } } if (best && !fishPts.includes(best)) fishPts.push(best); } }
    if (L.id === 'pinch') fishPts.push(hands[L.side > 0 ? 1 : 0].clone().addScaledVector(UP, -handR() * 1.2));   // (and the palm it lies on)
    // the flame: its core; and, where the lens stands back, most of the way up it (a close-up may let the tip touch the frame)
    const flameUp = L.id === 'pinch' ? (L.tiny ? null : flame.clone().lerp(P(G.flameTop), 0.3)) : flame.clone().lerp(P(G.flameTop), L.id === 'both' ? 0.5 : 0.85);
    const keep = { fish: fishPts, head: headPts, flame: flameUp ? [flame, flameUp] : [flame], hands: L.id === 'pinch' ? [hands[L.side > 0 ? 1 : 0]] : hands, feet: [feet], rodTip: tipKeep ? [tipKeep] : [] };
    const all = [...keep.fish, ...keep.head, flame, ...(L.id === 'hang' || L.id === 'hug' || L.id === 'alongside' ? keep.feet : [])];
    const box = new THREE.Box3().setFromPoints(all);
    box.getCenter(center);
    let r = 0; for (const p of all) r = Math.max(r, p.distanceTo(center));
    return { pose: L.name, id: L.id, t: L.t, lift: clamp(L.t / Math.max(0.05, L.beats.lift), 0, 1), side: L.side,
      fish: { center: fc, axis, up, length: L.L, depth: b.top - b.bottom }, head: { center: hc, radius: hr, flame }, feet, hands, rodTip: tip, keep, center, radius: r };
  }

  /** The fish as it is posed now: its bounds' box cut into slices along its length, each bent as the body is (world space).
   *  A geometry bounding box knows nothing of setBend's posture; this does. */
  const hullM = new THREE.Matrix4(), hullQ = new THREE.Quaternion(), ONE = new THREE.Vector3(1, 1, 1);
  function hull(settled = false) {
    const L = S;
    if (!L || !L.obj) return [];
    const b = L.b, out = [], fins = !L.kit.wings && L.shape !== 'jelly' && L.shape !== 'crayfish';
    L.obj.updateMatrixWorld(true); deck.updateWorldMatrix(true, false);
    const M = settled ? hullM.compose(L.Y.pos, hullQ.copy(L.Y.quat), ONE).premultiply(deck.matrixWorld) : L.obj.matrixWorld;
    const wy = L.id === 'alongside' ? T.a.set(0, WATER_Y, 0).applyMatrix4(deck.matrixWorld).y : -Infinity;
    for (let i = 0; i <= 16; i++) {
      const f = i / 16, q = L.fv.section ? L.fv.section(f, sec) : { z: b.noseZ + (b.tailZ - b.noseZ) * f, halfW: b.halfW, top: b.top, bottom: b.bottom };
      // the body's own section, and (fins stand in its mid-plane) the bounds' full height on the mid-line
      const pts = [[q.halfW, (q.top + q.bottom) / 2], [-q.halfW, (q.top + q.bottom) / 2], [0, q.top], [0, q.bottom]];
      if (fins && f > 0.12) pts.push([0, b.top * (f > 0.9 ? 1 : 0.92)], [0, b.bottom * (f > 0.9 ? 1 : 0.92)]);
      for (const [x, y] of pts) { const v = new THREE.Vector3(x, y, q.z); L.fv.bendPoint?.(v); v.applyMatrix4(M); if (v.y < wy) v.y = wy; out.push(v); }
    }
    return out;
  }

  // ---------------------------------------------------------------- numbers for the viewer (S5, S6)
  function info() {
    const L = S;
    if (!L) return { active: false, gone: !!gone, stats: { ...stats } };
    const obj = L.obj, fv = L.fv, vol = wick.getVolumes({});
    obj.updateMatrixWorld(true); deck.updateWorldMatrix(true, false);
    let inBody = 0, underDeck = 0, poleGap = Infinity, low = Infinity;
    const pole = raft.poleParts?.samples || [];
    const inv = T.m.copy(deck.matrixWorld).invert();
    const G = { vol };
    for (let f = 0; f <= 1.0001; f += 0.05) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const w = skin(fv, f, dx, dy, 0, new THREE.Vector3()).applyMatrix4(obj.matrixWorld);
      inBody = Math.max(inBody, clearance(G, w));
      const d = w.clone().applyMatrix4(inv);
      low = Math.min(low, d.y - deckY);
      if (d.y > WATER_Y && d.x > DECK_RECT.x0 && d.x < DECK_RECT.x1 && d.z > DECK_RECT.z0 && d.z < DECK_RECT.z1) underDeck = Math.max(underDeck, deckY - d.y);
      for (const p of pole) poleGap = Math.min(poleGap, Math.hypot(p.x - d.x, p.y - d.y, p.z - d.z) - 0.05);
    }
    const hand = {}, gap = {};
    for (const key of ['r', 'l']) {
      const hp = wick.getHandPos(key, new THREE.Vector3());
      hand[key] = hp;
      if (L.lockKeys.includes(key) && L.k[key] > 0.98) {
        const onFish = (L.id === 'pinch' && key === (L.side > 0 ? 'l' : 'r')) || L.id === 'both' || L.id === 'hug' || ((L.id === 'hang' || L.id === 'alongside') && key === (L.side > 0 ? 'l' : 'r') && (L.id !== 'hang' || L.k.nearToFish > 0.98));
        if (onFish) {
          // how far the hand's surface is from the fish's: the nearest of the body's sampled skin, less the hand's radius
          let dmin = Infinity;
          for (let f = 0; f <= 1.0001; f += 0.02) for (let a = 0; a < 12; a++) { const w = skin(fv, f, Math.cos(a * Math.PI / 6), Math.sin(a * Math.PI / 6), 0, T.g).applyMatrix4(obj.matrixWorld); dmin = Math.min(dmin, w.distanceTo(hp)); }
          gap[key] = Math.max(0, dmin - handR());
          for (const p of pole) { const d = hp.clone().applyMatrix4(inv); poleGap = Math.min(poleGap, Math.hypot(p.x - d.x, p.y - d.y, p.z - d.z) - 0.05 - handR()); }
        }
      }
    }
    const midL = new THREE.Vector3(0, 0, (L.b.noseZ + L.b.tailZ) / 2);
    const mid = midL.clone().applyQuaternion(L.now.quat).add(L.now.pos), rest = midL.clone().applyQuaternion(L.Y.quat).add(L.Y.pos), take = midL.clone().applyQuaternion(L.Y.takeQuat).add(L.Y.takePos);
    const dir = rest.clone().sub(take), travel = dir.length() || 1e-6;
    const overshoot = mid.clone().sub(rest).dot(dir) / (travel * travel);
    const camF = T.a.copy(camW).sub(obj.getWorldPosition(T.b)).normalize();
    const ax = new THREE.Vector3(0, 0, 1).applyQuaternion(obj.quaternion);
    const wf = new THREE.Vector3(0, 0, 1).applyQuaternion(wick.group.getWorldQuaternion(new THREE.Quaternion()));
    const toCam = camW.clone().sub(wick.group.getWorldPosition(new THREE.Vector3())); toCam.y = 0; toCam.normalize(); wf.y = 0; wf.normalize();
    const r3 = (x) => Math.round(x * 1000) / 1000;
    return { active: true, id: L.id, pose: L.name, cls: L.cls, t: r3(L.t), phase: L.c?.phase, side: L.side, length: r3(L.L), shape: L.shape, under: !!L.under,
      p: r3(L.c?.p ?? 0), struggle: r3(L.c?.struggle ?? 0), flap: r3(L.c?.flap ?? 0), take: r3(L.c?.take ?? 0),
      inBody: r3(inBody), underDeck: r3(underDeck), lowest: r3(low), poleGap: r3(poleGap), handGap: { r: gap.r == null ? null : r3(gap.r), l: gap.l == null ? null : r3(gap.l) },
      travel: r3(travel), fromRest: r3(mid.distanceTo(rest)), overshoot: r3(overshoot), endOn: r3(90 - Math.acos(Math.min(1, Math.abs(ax.dot(camF)))) / DEG),
      wickOffLens: r3(Math.acos(clamp(wf.dot(toCam), -1, 1)) / DEG), dip: r3(dip.x), dipAtPresent: stats.dipAtPresent == null ? null : r3(stats.dipAtPresent), dipAfter: stats.dipAfter == null ? null : r3(stats.dipAfter),
      drips: stats.drips, flaps: stats.flaps, beats: { ...stats.beats }, rod: L.Y.rod.mode, line: r3(L.Y.line), k: { r: r3(L.k.r), l: r3(L.k.l), rod: r3(L.k.rod), stow: r3(L.k.stow) } };
  }

  return {
    get active() { return !!S; },
    get pose() { return S ? S.name : hold ? hold.name : null; },
    get id() { return S ? S.id : null; },
    get spec() { return S ? S.spec : null; },
    get spot() { return S ? S.spot : hold ? hold.spot : null; },
    get t() { return S ? S.t : 0; },
    get fish() { return S ? S.fv : null; },
    get leaving() { return !!gone; },
    get dip() { return dip; },
    get line() { return lineOut; },
    get bow() { return rodBow; },
    get stats() { return stats; },
    begin,
    setTime(t) { if (S && Number.isFinite(t)) { S.t = Math.max(S.t, t); S.driven = true; } },
    /** The show's own clock: a frame fishing did not time advances by dt. */
    tick(dt) { if (S) { if (!S.driven) S.t += dt; S.driven = false; } },
    step,
    /** The fish leaves the hands (action: keep | release | eat | render | undefined), the Wick returns to play. */
    end(action) { if (S) finish(action === 'keep' || action === 'release', action); else if (hold) { hold = null; wick.setShow(null); } },
    /** At once, no gesture (a reset, a new lake, death). */
    abort() { if (S) finish(false); dropGone(); hold = null; wick.setShow(null); dip.x = 0; dip.v = 0; },
    /** A bare show pose with no fish (setPose('showBoth'): the pose viewer). */
    holdPose(name) { const id = SHOW_IDS[name]; if (!id) { hold = null; return; } if (S) return; hold = newLayout(null, id, 'keeper'); hold.side = id === 'alongside' ? -1 : 1; },
    focus, info, hull,
  };
}
