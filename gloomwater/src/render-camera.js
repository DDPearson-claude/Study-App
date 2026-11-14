// render-camera.js — the pure camera maths behind render.js's rig (render author). No three.js, no DOM, no ctx: the v3
// presets read from BALANCE.cameras (CONTRACT §13.7 render, DESIGN §25.14.2 R1), the fish / reel distances (line distance
// only, never the size class), the night blend's rule (combat.swarmActive, never the phase) and the trophy shot (R2:
// distance clamp(1.2 + 1.6·L, 1.6, 16) m, the crane to 50° above 4 m, the yaw toward data.landmarkOf(place) by at most
// ±35° from north). tools/tests/render-v3.test.mjs runs these in node.
//
// Render's convention (every preset): the camera orbits the focus at `elev` degrees and `dist` metres and looks at
// focus + `aim` metres along the view + `aimY` metres up, so the pitch is atan((dist·sin elev − aimY) / (dist·cos elev + aim)),
// not elev; `fov` is the vertical fov on landscape, `ahead` the velocity look-ahead (s), `stiff` the focus spring ω.

export const PARAM_KEYS = ['elev', 'dist', 'aim', 'aimY', 'fov', 'ahead', 'stiff'];
const DEG = Math.PI / 180;

const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

/** The trophy shot's numbers when data carries none (BALANCE.cameras.trophy / BALANCE.ceremony.camera are the truth). */
export const TROPHY_DEFAULT = Object.freeze({
  elev: 18, dist: 1.6, aim: 0, aimY: 0.6, fov: 44, ahead: 0, stiff: 2.4,
  base: 1.2, perM: 1.6, min: 1.6, max: 16, craneAbove: 4, craneElev: 50, yawMax: 35,
});
/** The crane (L > craneAbove) rises during the pose beat: it starts after the scoop has settled and takes CRANE_TIME. */
export const CRANE_DELAY = 0.35;
export const CRANE_TIME = 1.6;
/**
 * The subject (actors' measuring focus: the fish and the Wick) sits this fraction of the frame height ABOVE the centre:
 * ui's measuring band owns the foot of the frame during the ceremony (DESIGN §25.6.8, U3), so the catch is framed in the
 * open upper part, against the Starlit sky and the place's landmark.
 */
export const TROPHY_UP = 0.08;
/**
 * How far above the centre the subject sits, by the pose its length gives (DESIGN §25.6.8): a palm catch keeps the Wick's
 * flame in frame (0.06); a held fish 0.08; an alongside fish lies out toward the camera's side of the raft and its near
 * part is what ui's band would veil, so it rides higher (0.11), and higher again under the crane, looking down (0.14).
 */
export function trophyUp(L, T = TROPHY_DEFAULT) {
  const l = num(L, 0.5);
  if (trophyCranes(l, T)) return 0.14;
  return l >= 2 ? 0.11 : l < 0.25 ? 0.06 : TROPHY_UP;
}

function pickParams(src, into) {
  if (!src || typeof src !== 'object') return into;
  for (const k of PARAM_KEYS) if (typeof src[k] === 'number' && Number.isFinite(src[k])) into[k] = src[k];
  return into;
}

/**
 * The presets in force with v3 on. `cameras` = data BALANCE.cameras; `v1` = render's own MODES table. sail / fish / reel
 * come from data (every number); night keeps render's overview numbers (data's `night` carries only its rule and blend);
 * title / shop / death are untouched in P1. `downAim` is render's plain lean for casts toward the camera: data's fish /
 * reel `aim` is the framing of the common up-screen cast (the line runs away from the camera), and a cast toward the
 * camera eases back to v1's own lean (render.js UPCAST blends the two by the line's direction).
 */
export function v3Presets(cameras, v1) {
  const modes = {};
  for (const [k, v] of Object.entries(v1 || {})) modes[k] = { ...v };
  const C = cameras && typeof cameras === 'object' ? cameras : {};
  for (const k of ['sail', 'fish', 'reel']) if (modes[k]) pickParams(C[k], modes[k]);
  const trophy = { ...TROPHY_DEFAULT };
  for (const [k, v] of Object.entries(C.trophy || {})) if (typeof v === 'number' && Number.isFinite(v)) trophy[k] = v;
  trophy.dist = trophyDistance(0, trophy);
  modes.trophy = pickParams(trophy, { ...(modes.trophy || {}) });
  return {
    modes,
    downAim: { fish: num(v1?.fish?.aim, 0.8), reel: num(v1?.reel?.aim, 0.4) },
    trophy,
    nightBlend: num(C.night?.blend, 1.6),
    nightFollows: typeof C.night?.follows === 'string' ? C.night.follows : 'swarmActive',
  };
}

/** The trophy rule's numbers: BALANCE.cameras.trophy, then BALANCE.ceremony.camera (the same rule), then the defaults. */
export function trophyRule(cameras, ceremonyCamera) {
  const T = { ...TROPHY_DEFAULT };
  for (const src of [ceremonyCamera, cameras?.trophy]) {
    if (!src || typeof src !== 'object') continue;
    for (const [k, v] of Object.entries(src)) if (typeof v === 'number' && Number.isFinite(v)) T[k] = v;
  }
  return T;
}

/** Pitch (deg, positive = looking down) of a preset in render's convention. */
export function pitchOf(p) {
  const e = num(p?.elev, 30) * DEG, d = num(p?.dist, 10);
  return Math.atan2(d * Math.sin(e) - num(p?.aimY, 0), d * Math.cos(e) + num(p?.aim, 0)) / DEG;
}

// ------------------------------------------------------------------ fishing framings (line distance only)
/** fish: the camera backs off as the cast lengthens and rises past 12 m (sep = Wick → bobber, m). */
export function fishDistance(sep, base) { return Math.max(num(base?.dist, 13), 8.5 + clamp(num(sep, 0), 0, 40) * 0.78); }
export function fishElev(sep, base) { return num(base?.elev, 28) + clamp(clamp(num(sep, 0), 0, 40) - 12, 0, 20) * 0.4; }
/**
 * reel (v3): the distance follows the line distance (Wick → line end) and nothing else, so a Keeper and an Elder at the
 * same line length are framed alike and the Elder looks bigger on screen (DESIGN §25.6.5, §25.7.5: "a camera that never
 * zooms by class"). The fight state chooses the framing (reeling / landing here, the trophy shot at the ceremony).
 */
export function reelDistance(sep, base) { return Math.max(num(base?.dist, 10), 7.5 + clamp(num(sep, 0), 0, 40) * 0.6); }

/** The night overview's target weight (v3): 1 only while combat.swarmActive and the run is in play; never the phase. */
export function nightTarget({ playing, swarmActive }) { return playing && swarmActive === true ? 1 : 0; }

// ------------------------------------------------------------------ the trophy shot (R2)
/** Distance (m) for a fish of L metres: clamp(base + perM·L, min, max) → 0.2 m: 1.6 · 1.2 m: 3.12 · 8.5 m: 14.8. */
export function trophyDistance(L, T = TROPHY_DEFAULT) {
  return clamp(num(T.base, 1.2) + num(T.perM, 1.6) * Math.max(0, num(L, 0)), num(T.min, 1.6), num(T.max, 16));
}
/** Above craneAbove (4 m) the camera cranes to craneElev (50°). */
export function trophyCranes(L, T = TROPHY_DEFAULT) { return num(L, 0) > num(T.craneAbove, 4); }
/** Elevation (deg) at t seconds into the shot: the preset's 18°, or for a crane an eased rise to 50° during the pose beat. */
export function trophyElev(L, T = TROPHY_DEFAULT, t = Infinity) {
  const e0 = num(T.elev, 18);
  if (!trophyCranes(L, T)) return e0;
  const k = easeInOutSine(clamp((num(t, Infinity) - CRANE_DELAY) / CRANE_TIME, 0, 1));
  return lerp(e0, num(T.craneElev, 50), k);
}
/**
 * Camera yaw (rad; render's convention: 0 looks north, −Z; positive turns toward −X) that puts the landmark behind the
 * subject, clamped to ±yawMax degrees from north. No landmark (no place, or P1 open water) → 0: the yaw stays north.
 */
export function trophyYaw(from, landmark, yawMaxDeg = 35) {
  if (!landmark || !from) return 0;
  const dx = num(landmark.x, NaN) - num(from.x, 0), dz = num(landmark.z, NaN) - num(from.z, 0);
  if (!Number.isFinite(dx) || !Number.isFinite(dz) || dx * dx + dz * dz < 1e-4) return 0;
  const lim = Math.abs(num(yawMaxDeg, 35)) * DEG;
  return clamp(Math.atan2(-dx, -dz), -lim, lim);
}
/**
 * The look target's height relative to the subject (m; negative = below it) that puts the subject `up` of the frame height
 * above the centre, for a camera `dist` metres away at `elevDeg` with a vertical fov of `fovDeg`.
 */
export function trophyLift(dist, fovDeg, elevDeg, up = TROPHY_UP) {
  const ang = Math.atan(2 * num(up, TROPHY_UP) * Math.tan(num(fovDeg, 44) * DEG / 2));
  return -num(dist, 1.6) * Math.tan(ang) / Math.max(0.3, Math.cos(num(elevDeg, 18) * DEG));
}
/**
 * How much of the subject's radius it spans across the frame, by pose: a palm catch is the Wick's own width, a fish held
 * across the arms a little more, one hanging off the rod tip stands out beside the Wick, an alongside fish is all length.
 */
export function trophyAcross(L) {
  const l = num(L, 0.5);
  return l < 0.25 ? 0.65 : l < 0.85 ? 0.75 : l < 2 ? 0.85 : 1;
}
/**
 * Vertical fov (deg) for the trophy shot: the preset's 44°, widened only as far as the subject (actors' focus radius, m)
 * needs: its top must clear the frame's top edge with the subject raised `up` (ui's band may veil its foot), and on a phone
 * held upright it must fit across (`across` = the share of the radius it spans sideways, trophyAcross).
 */
export function trophyFov(baseFov, radius, dist, aspect, { up = TROPHY_UP, across = 1, cap = 80 } = {}) {
  const f0 = num(baseFov, 44);
  const need = 2 * Math.atan(trophyNeed(radius, dist, aspect, { up, across })) / DEG;
  return clamp(Math.max(f0, need), f0, Math.max(f0, cap));
}
/** tan(half the vertical fov) the subject needs at `dist` (trophyFov's two tests: its top, and across). */
export function trophyNeed(radius, dist, aspect, { up = TROPHY_UP, across = 1 } = {}) {
  const d = Math.max(0.3, num(dist, 1.6)), r = Math.max(0, num(radius, 0)) * 0.95;
  const a = Math.max(0.2, num(aspect, 16 / 9));
  const tTop = r / (d * Math.max(0.2, 1 - 2 * up));
  const tAcross = r * clamp(num(across, 1), 0, 1) / (d * a);
  return Math.max(tTop, tAcross);
}
/** The phone held upright: the trophy fov stops at a comfortable 66°, and the camera steps back instead (raft presets widen
 *  on a portrait screen too); never past 1.6× the rule's distance. Landscape keeps the rule's distance exactly. */
export const TROPHY_PORTRAIT_FOV = 66;
export const TROPHY_PORTRAIT_BACK = 1.6;
/**
 * The trophy shot's fov and distance on this screen: landscape → the rule's distance, the fov fitted (trophyFov, cap 80);
 * portrait → the fov fitted up to TROPHY_PORTRAIT_FOV, then the distance grows until the subject fits.
 */
export function trophyFit(baseFov, radius, dist, aspect, { up = TROPHY_UP, across = 1 } = {}) {
  const f0 = num(baseFov, 44), d = Math.max(0.3, num(dist, 1.6)), a = num(aspect, 16 / 9);
  if (!(a < 1)) return { fov: trophyFov(f0, radius, d, a, { up, across, cap: 80 }), dist: d };
  const capF = Math.max(f0, TROPHY_PORTRAIT_FOV), tCap = Math.tan(capF * DEG / 2);
  const tNeed = trophyNeed(radius, d, a, { up, across });
  if (tNeed <= tCap) return { fov: clamp(Math.max(f0, 2 * Math.atan(tNeed) / DEG), f0, capF), dist: d };
  return { fov: capF, dist: Math.min(d * TROPHY_PORTRAIT_BACK, d * tNeed / tCap) };
}

// ------------------------------------------------------------------ the show camera (docs/v3/show/SPEC.md §2.6; AUTOFISH.show.camera)
// After the fish clears the water the Wick turns to the lens and presents it. The show camera does not frame a sphere: it FITS
// the named points actors returns (the fish's snout, tail, back and belly, the wax head, the flame, the hands, the feet, the rod
// tip), so the fish, held toward the lens, is the subject at any length from a few centimetres to several metres, on a 16:9 screen
// and on a phone held upright. All of it is pure maths here; render.js blends the fitted pose over the play's rig.
const smooth01 = (t) => { const x = clamp(t, 0, 1); return x * x * (3 - 2 * x); };
/** The numbers in force when data carries none (AUTOFISH.show.camera is the truth). */
export const SHOW_CAMERA_DEFAULT = Object.freeze({
  margin: { landscape: 0.08, portrait: 0.06 }, minLens: 0.35, floor: 0.45, out: 0.9, follow: 10, still: 0.02,
  pose: {
    pinch: { elev: 8, fov: 44, fovPortrait: 58, keep: ['fish', 'head', 'flame'], tinyFov: 52, tinyFlameTip: 0 },
    both: { elev: 10, fov: 42, fovPortrait: 60, keep: ['fish', 'head', 'flame', 'hands'] },
    hug: { elev: 10, fov: 44, fovPortrait: 62, keep: ['fish', 'head', 'flame', 'feet'] },
    hang: { elev: 8, fov: 46, fovPortrait: 64, keep: ['fish', 'head', 'flame', 'feet', 'rodTip'] },
    alongside: { elev: 16, fov: 48, fovPortrait: 66, keep: ['fish', 'head', 'flame', 'feet'], craneAbove: 4, craneElev: 40, rakeAbove: 3.2, rake: 55 },
  },
});
/** 0 on a landscape screen, 1 on a phone held upright, eased between an aspect of 1.25 and 0.8. */
export function showUpright(aspect) { return smooth01((1.25 - num(aspect, 16 / 9)) / 0.45); }
/**
 * The camera row for a pose on this screen: {elev, fov (vertical, deg), margin, keep, rake (deg off broadside; 0 = none),
 * craned}. `pose` null (the reveal, before actors has the fish) reads the `both` row. A pinch under tinyBelow metres opens to
 * tinyFov (the fish comes right up to the lens); an alongside fish over craneAbove metres is craned over (eased in over 1.5 m),
 * and on an upright screen one over rakeAbove metres is filmed along its length from the head end.
 */
export function showRow(C, pose, { length = 0.5, aspect = 16 / 9, tinyBelow = 0.15 } = {}) {
  const cam = C && typeof C === 'object' ? C : SHOW_CAMERA_DEFAULT;
  const id = pose && cam.pose?.[pose] ? pose : 'both';
  const R = cam.pose?.[id] || SHOW_CAMERA_DEFAULT.pose[id], L = Math.max(0, num(length, 0.5));
  const up = showUpright(aspect);
  let fov = num(R.fov, 44), elev = num(R.elev, 10), flameTip = null;
  if (id === 'pinch' && L < tinyBelow && Number.isFinite(R.tinyFov)) fov = R.tinyFov;
  if (id === 'pinch' && L < tinyBelow && Number.isFinite(R.tinyFlameTip)) flameTip = R.tinyFlameTip;   // (a tiny fish's close-up keeps the flame's core, not its tip)
  fov = lerp(fov, Math.max(fov, num(R.fovPortrait, fov)), up);
  let craned = 0, rake = 0;
  if (id === 'alongside') {
    craned = Number.isFinite(R.craneAbove) ? smooth01((L - R.craneAbove) / 1.5) : 0;
    if (up > 0.5 && Number.isFinite(R.rakeAbove) && L > R.rakeAbove) { rake = num(R.rake, 55); craned = 1; }
    elev = lerp(elev, num(R.craneElev, 40), craned);
  }
  const M = cam.margin || SHOW_CAMERA_DEFAULT.margin;
  return { id, elev, fov, margin: lerp(num(M.landscape, 0.08), num(M.portrait, 0.06), up), headroom: num(R.headroom, num(cam.headroom, 0)), footroom: num(R.footroom, num(cam.footroom, 0)), keep: Array.isArray(R.keep) ? R.keep : ['fish', 'head', 'flame'], flameTip, rake, craned, upright: up };
}
/** The view's axes for render's convention (yaw 0 looks north, −Z, from the south; elev degrees above the subject): right, up, forward. */
export function showAxes(yaw, elevDeg) {
  const sy = Math.sin(yaw), cy = Math.cos(yaw), e = num(elevDeg, 10) * DEG, ce = Math.cos(e), se = Math.sin(e);
  const f = [-sy * ce, -se, -cy * ce], r = [cy, 0, -sy];
  return { r, u: [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]], f };
}
const dot3 = (p, a) => p.x * a[0] + p.y * a[1] + p.z * a[2];
/**
 * THE FIT (SPEC §2.6). points: world points to keep in frame; depthAt: the fish's centre (the look point's depth). With the
 * view's right, up and forward axes, each point has x, y (across and up the frame) and z (depth). A point is inside when
 * |x − cx| ≤ (d + z − zc) · tan(fovH / 2) · (1 − 2·margin), and the same for y with fovV. The smallest d that holds for every
 * point is exact per axis (the tightest "left" and "right" points meet their edges together); d is then no less than
 * minLens + the nearest point's (zc − z); and cx, cy are re-centred on the projected extents at that d.
 * `shiftY` raises the subject that share of the frame's height above the centre (a phone's card owns the foot of the frame).
 * Returns {dist, look: {x, y, z}, cx, cy, zc, by: 'x' | 'y' | 'near'}, or null without points.
 */
export function showFit(points, { yaw = 0, elev = 10, fov = 44, aspect = 16 / 9, margin = 0.08, marginTop = null, marginBottom = null, minLens = 0.35, depthAt = null, shiftY = 0 } = {}) {
  const pts = (points || []).filter((p) => p && Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z));
  if (!pts.length) return null;
  const A = showAxes(yaw, elev);
  const tv = Math.tan(clamp(num(fov, 44), 10, 120) * DEG / 2), th = tv * Math.max(0.2, num(aspect, 16 / 9));
  // (the top and the foot of the frame may keep their own margins: room over the flame, room under the hands)
  const m = clamp(num(margin, 0.08), 0, 0.3), kx = th * (1 - 2 * m);
  const kT = tv * (1 - 2 * clamp(num(marginTop, m), 0, 0.3)), kB = tv * (1 - 2 * clamp(num(marginBottom, m), 0, 0.3));
  const xs = pts.map((p) => dot3(p, A.r)), ys = pts.map((p) => dot3(p, A.u)), zs = pts.map((p) => dot3(p, A.f));
  const zc = depthAt && Number.isFinite(depthAt.x) ? dot3(depthAt, A.f) : zs.reduce((a, b) => a + b, 0) / zs.length;
  // per axis: d ≥ (x − cx) / k − dz and d ≥ (cx − x) / k − dz for every point; the least d is where the two envelopes meet
  const solve = (vs, kp, kn) => {
    let a = -Infinity, b = -Infinity;
    for (let i = 0; i < vs.length; i++) { const dz = zs[i] - zc; a = Math.max(a, vs[i] / kp - dz); b = Math.max(b, -vs[i] / kn - dz); }
    const c = (a - b) / (1 / kp + 1 / kn);
    return { c, d: a - c / kp };
  };
  const X = solve(xs, kx, kx), Y = solve(ys, kT, kB);
  let near = -Infinity;
  for (let i = 0; i < zs.length; i++) near = Math.max(near, zc - zs[i]);
  const dNear = num(minLens, 0.35) + Math.max(0, near);
  const dist = Math.max(X.d, Y.d, dNear, 0.05);
  const by = dist === X.d ? 'x' : dist === Y.d ? 'y' : 'near';
  // re-centre on the projected extents at the distance chosen (the axis that did not set it has room to spare)
  // (the spare room is shared in proportion to each side's safe extent: kp up / right, kn down / left)
  const centre = (vs, c0, kp, kn) => {
    let lo = Infinity, hi = -Infinity;
    for (const v of vs) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
    let a = lo, b = hi, c = c0;
    for (let it = 0; it < 24; it++) {
      c = (a + b) / 2;
      let mx = -Infinity, mn = Infinity;
      for (let i = 0; i < vs.length; i++) { const q = (vs[i] - c) / Math.max(1e-4, dist + zs[i] - zc); mx = Math.max(mx, q); mn = Math.min(mn, q); }
      if (mx / kp + mn / kn > 0) a = c; else b = c;
    }
    return c;
  };
  const cx = by === 'x' ? X.c : centre(xs, X.c, kx, kx);
  let cy = by === 'y' ? Y.c : centre(ys, Y.c, kT, kB);
  cy -= clamp(num(shiftY, 0), -0.4, 0.4) * 2 * tv * dist;
  return { dist, cx, cy, zc, by, look: { x: A.r[0] * cx + A.u[0] * cy + A.f[0] * zc, y: A.r[1] * cx + A.u[1] * cy + A.f[1] * zc, z: A.r[2] * cx + A.u[2] * cy + A.f[2] * zc } };
}
/** Where a world point lands in the frame for a fitted camera: {x, y} in −1..1 (0 = the centre; ±1 = the edges), z = its depth (m). */
export function showProject(p, fit, { yaw = 0, elev = 10, fov = 44, aspect = 16 / 9 } = {}) {
  const A = showAxes(yaw, elev), tv = Math.tan(num(fov, 44) * DEG / 2), th = tv * num(aspect, 16 / 9);
  const z = fit.dist + dot3(p, A.f) - fit.zc;
  return { x: (dot3(p, A.r) - fit.cx) / (Math.max(1e-6, z) * th), y: (dot3(p, A.u) - fit.cy) / (Math.max(1e-6, z) * tv), z };
}
/** The kept points of a show focus (actors.getShowFocus().keep) for a row's `keep` list; missing groups are skipped. */
export function showKeep(focus, keys) {
  const out = [], K = focus && focus.keep;
  if (!K) return out;
  for (const k of keys || []) { const g = K[k]; if (Array.isArray(g)) for (const p of g) if (p && Number.isFinite(p.x)) out.push(p); }
  return out;
}
/**
 * The raked yaw (an upright screen, a long alongside fish): the lens turns `rakeDeg` off broadside toward the fish's head end,
 * so the head and the Wick are near and the body runs away up the frame. yaw0: the play's yaw; axis: the fish's tail → snout
 * direction on the water {x, z}. Returns the yaw nearest yaw0 from which the view runs from the head toward the tail.
 */
export function showRakeYaw(yaw0, axis, rakeDeg = 55) {
  const ax = num(axis?.x, 0), az = num(axis?.z, 0), l = Math.hypot(ax, az);
  if (!(l > 1e-6) || !(rakeDeg > 0)) return yaw0;
  const thA = Math.atan2(ax, az), thF = Math.atan2(-Math.sin(yaw0), -Math.cos(yaw0));   // headings of the fish's axis and of the view
  let d = thF - thA; d = Math.atan2(Math.sin(d), Math.cos(d));
  const want = (90 + clamp(rakeDeg, 0, 80)) * DEG * (d >= 0 ? 1 : -1);                  // the view runs against the axis: head → tail
  const thV = thA + want;
  return Math.atan2(-Math.sin(thV), -Math.cos(thV));
}
/** The blend's ease (0 → 1 → 0): no jump in position or speed at either end, and the lowest top speed an ease can have
 *  (1.5 × the mean), so the lens never pops and never whips: 12 m in 0.8 s peaks at 0.75 m a frame at 30 fps. */
export function showEase(p) { return smooth01(p); }
/**
 * Seconds until the present for a show's view (fishing.view.show): the rest of the reveal and the lift (the lift at
 * `liftRate` once the player has hurried). 0 from the hold on. The lens has arrived when this reaches 0.
 */
export function showArrival(view, liftRate = 2.5) {
  if (!view || typeof view !== 'object') return 0;
  const D = view.dur || {}, rate = view.hurried ? Math.max(1, num(liftRate, 2.5)) : 1;
  if (view.phase === 'reveal') return Math.max(0, num(D.reveal, 0) - num(view.t, 0)) + num(D.lift, 0.5) / rate;
  if (view.phase === 'lift') return Math.max(0, num(D.lift, 0.5) - num(view.poseT, 0)) / rate;
  return 0;
}
