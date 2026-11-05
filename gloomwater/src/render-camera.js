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
 * Vertical fov (deg) for the trophy shot: the preset's 44°, widened only as far as the subject (actors' focus radius, m)
 * needs: its top must clear the frame's top edge with the subject raised `up` (ui's band may veil its foot), and on a phone
 * held upright it must fit across. A held fish (palm / arms / hang) is taller than wide; an alongside one (`wide`) is not.
 */
export function trophyFov(baseFov, radius, dist, aspect, { up = TROPHY_UP, wide = false, cap = 80 } = {}) {
  const f0 = num(baseFov, 44), d = Math.max(0.3, num(dist, 1.6)), r = Math.max(0, num(radius, 0)) * 0.95;
  const a = Math.max(0.2, num(aspect, 16 / 9));
  const tTop = r / (d * Math.max(0.2, 1 - 2 * up));
  const tAcross = (wide ? r : r * 0.6) / (d * a);
  const need = 2 * Math.atan(Math.max(tTop, tAcross)) / DEG;
  return clamp(Math.max(f0, need), f0, Math.max(f0, cap));
}
