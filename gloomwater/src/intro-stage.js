// intro-stage.js — the opening cut scene's set and picture (LANE A "set and picture").
// docs/v3/intro/SPEC.md §4–§6 (binding), CONTRACT §13.13, DESIGN §25.4.9, docs/v3/intro/LANE-A.md (what was built and retuned).
// v3 only: created by the director (src/intro.js), which main creates only when data.V3_ENABLED; with v3 off nothing here runs.
//
// THE RULE: the stage is a PURE FUNCTION OF TIMELINE TIME. setTime(t) puts everything this module draws, and the camera, exactly
// where the film has it at t (0 … INTRO.length), whatever was shown before: the director can seek, a skip can jump to the end, a
// test can shoot any moment. The stage never reads a clock, listens for input, touches the DOM, plays a sound, writes state or
// emits on the bus; it creates no light and no render target. One-shot garnish on other modules (water.splash at the contact) may
// fire only when `opts.live` is true and a mark is crossed going forward; nothing the film needs depends on it.
//
// HOW IT IS MADE: three layers.
//   1. the score (pure numbers, no three.js state): introCamera() the lens, introScore() every piece of the set, introWindow()
//      one window of the kingdom. All of INTRO's times and sizes are read here and nowhere else.
//   2. the models (src/intro-models.js): the great lantern and its chains, the 54 windows and their mirror-only twins, the
//      contact ring, the ink card, the motes, the ember, the pale flank, two sparks.
//   3. the stage (createIntroStage): builds the models under the title, lays the score on them each frame, and drives the four
//      hooks it owns in other modules: render.setIntroCamera, world.setIntroMood / setIntroWaterLight, actors.setIntroKindle.
//
// API (createIntroStage(ctx)):
//   prebuild() -> bool      one slice of building per call (the models, then their programs warmed in the frame's own render
//                           target); true once everything is ready. Adds nothing visible. Call it in idle time under the title
//                           until it returns true; enter() does at once whatever is left.
//   ready -> bool
//   enter({replay, reduced}) the set goes live: its group joins ctx.render.scene (all hidden until INTRO.swapAt). Idempotent.
//   setTime(t, {live, seek, reduced})   everything at timeline time t. Before INTRO.swapAt the stage shows nothing and leaves the
//                           title camera, the world's mood and the raft's light alone (the opening ink has not closed yet); from
//                           the swap on the world wears the first run's opening mood (world.setIntroMood) and the raft's light is
//                           the film's (actors.setIntroKindle). `reduced` softens the contact flash and turns the cut into a dip.
//   exit()                  gives everything back: the camera (render.setIntroCamera(null)), the world's mood, the water light, the
//                           Wick's and the lantern's own light; takes the set out of the scene. Idempotent; never throws.
//   dispose()               exit() + frees every geometry and material this module created.
//   stats() -> {built, live, t, take, w, anchors, calls, triangles, geometries, textures, lights, steps, buildMs}
//                           calls / triangles: the set's own cost in the frame at t, every pass (the main one and the lake's mirror)
import * as THREE from 'three';
import { REFLECT_LAYER } from './toon.js';
import { buildLantern, buildWindows, buildRing, buildInkCard, buildMotes, buildEmber, buildFlank, buildSpark, flankPoint, FLANK_MARKS } from './intro-models.js';

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (a, b, x) => { const k = clamp01((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const inOutSine = (k) => -(Math.cos(Math.PI * clamp01(k)) - 1) / 2;
const EASES = { inOutSine, linear: clamp01, smooth: (k) => smooth(0, 1, k) };

/** The take (INTRO.cameras.takes entry) that owns timeline time t, or null before INTRO.swapAt / outside the film. Pure. */
export function introTake(INTRO, t) {
  const takes = INTRO?.cameras?.takes;
  if (!Array.isArray(takes) || !(t >= (INTRO.swapAt ?? 0))) return null;
  for (const tk of takes) if (t >= tk.from && t < tk.to) return tk;
  return t >= takes.at(-1).to ? takes.at(-1) : null;
}

/** How much of the `portrait` values applies at this viewport aspect: 1 at or under portraitBelow, 0 from 1.1 up. Pure. */
export function portraitWeight(INTRO, aspect) {
  const lo = Number(INTRO?.cameras?.portraitBelow) || 0.9;
  return 1 - smooth(lo, 1.1, Number(aspect) || 1);
}

/** One key's pose at this aspect: {pos: [anchor, x, y, z], look: [anchor, x, y, z], fov}. Pure. */
function keyPose(key, pw) {
  const P = key.portrait || {};
  const mix = (a, b) => (b && pw > 0 ? [a[0], lerp(a[1], b[1], pw), lerp(a[2], b[2], pw), lerp(a[3], b[3], pw)] : a);
  return { pos: mix(key.pos, P.pos), look: mix(key.look, P.look), fov: lerp(key.fov, P.fov ?? key.fov, pw) };
}

/** Catmull-Rom through the keys of one take (zero velocity at its two ends), per channel. Pure. */
function takePose(tk, t, pw) {
  const K = tk.keys, n = K.length;
  let i = 0;
  while (i < n - 2 && t >= K[i + 1].t) i++;
  const k0 = K[i], k1 = K[i + 1], span = k1.t - k0.t, u = clamp01((t - k0.t) / span);
  const p0 = keyPose(k0, pw), p1 = keyPose(k1, pw);
  const pm = i > 0 ? keyPose(K[i - 1], pw) : null, pn = i + 2 < n ? keyPose(K[i + 2], pw) : null;
  const tm = i > 0 ? K[i - 1].t : k0.t, tn = i + 2 < n ? K[i + 2].t : k1.t;
  const h = (a, b, am, an) => {
    const m0 = am === null ? 0 : ((b - am) / (k1.t - tm)) * span, m1 = an === null ? 0 : ((an - a) / (tn - k0.t)) * span;
    const u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * a + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * b + (u3 - u2) * m1;
  };
  const vec = (key) => [p0[key][0], ...[1, 2, 3].map((c) => h(p0[key][c], p1[key][c], pm ? pm[key][c] : null, pn ? pn[key][c] : null))];
  return { pos: vec('pos'), look: vec('look'), fov: h(p0.fov, p1.fov, pm ? pm.fov : null, pn ? pn.fov : null) };
}

/**
 * The film's camera at timeline time t for a viewport aspect. Pure (anchors are not resolved here):
 *   null                                              before INTRO.swapAt: the title's own camera
 *   { take, pos: [anchor, x, y, z], look: [...], fov, w, rig }   w = the weight of this pose over render's rig (1 → 0 in the last take)
 */
export function introCamera(INTRO, t, aspect = 16 / 9) {
  const tk = introTake(INTRO, t);
  if (!tk) return null;
  const pw = portraitWeight(INTRO, aspect);
  if (!tk.rig) return { take: tk.id, ...takePose(tk, Math.min(t, tk.to), pw), w: 1, rig: null };
  // the last take: the pose the film arrived with, fading into render's own rig
  const takes = INTRO.cameras.takes, prev = takes[takes.indexOf(tk) - 1];
  const from = prev && !prev.rig ? takePose(prev, prev.to, pw) : null;
  if (!from) return null;
  const [b0, b1] = tk.blend, ease = EASES[tk.ease] || inOutSine;
  return { take: tk.id, ...from, w: 1 - ease((t - b0) / (b1 - b0)), rig: tk.rig };
}

/** The film's two anchors in world metres: S the raft's spawn, G the Sunken Gate. null while the world cannot say. */
export function introAnchors(ctx) {
  const w = ctx?.world;
  if (!w || w.isStub) return null;
  let S = null, G = null;
  try { const sp = w.getSpawn?.(); if (sp?.position && Number.isFinite(sp.position.x)) S = { x: sp.position.x, z: sp.position.z }; } catch { S = null; }
  try { const h = w.getHeroAnchor?.(); if (h && Number.isFinite(h.x)) G = { x: h.x, z: h.z, face: h.face ?? 0, theme: h.theme ?? null }; } catch { G = null; }
  return S && G ? { S, G } : null;
}

/** [anchor, east, up, south] → [x, y, z] in world metres. Pure. */
export function resolvePoint(v, anchors) {
  const a = anchors?.[v[0]] || { x: 0, z: 0 };
  return [a.x + v[1], v[2], a.z + v[3]];
}

// ------------------------------------------------------------------ the score: every piece of the set at timeline time t (pure)
const easeOut = (k, p = 2.2) => 1 - Math.pow(1 - clamp01(k), p);
const bump = (a, b, t) => (t <= a || t >= b ? 0 : Math.sin(Math.PI * (t - a) / (b - a)));
/** Piecewise smooth through [[t, v], …] keys (no overshoot; holds the first and the last value outside). Pure. */
function keyed(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], smooth(keys[i - 1][0], keys[i][0], t));
  return keys[keys.length - 1][1];
}
/** Monotone cubic (Fritsch–Carlson) through rising keys [[t, v], …], linear before the first and after the last. Pure. */
function glide(keys, t) {
  const n = keys.length;
  const sec = (i) => (keys[i + 1][1] - keys[i][1]) / (keys[i + 1][0] - keys[i][0]);
  const slope = (i) => {
    if (i === 0) return sec(0);
    if (i === n - 1) return sec(n - 2);
    const a = sec(i - 1), b = sec(i);
    return a * b <= 0 ? 0 : (2 * a * b) / (a + b);
  };
  if (t <= keys[0][0]) return keys[0][1] + (t - keys[0][0]) * slope(0);
  if (t >= keys[n - 1][0]) return keys[n - 1][1] + (t - keys[n - 1][0]) * slope(n - 1);
  let i = 0;
  while (i < n - 2 && t >= keys[i + 1][0]) i++;
  const h = keys[i + 1][0] - keys[i][0], u = (t - keys[i][0]) / h, u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * keys[i][1] + (u3 - 2 * u2 + u) * h * slope(i) + (-2 * u3 + 3 * u2) * keys[i + 1][1] + (u3 - u2) * h * slope(i + 1);
}

const BELLY = [0, 0, 0];
const GUTTER = [[0, 1], [0.22, 0.4], [0.42, 1.05], [0.64, 0.3], [1, 0]];   // a candle going out: its light over the gutter (0 … 1)
const GLIDE = [[0, 0], [0, 0], [0, 0], [0, 0]];                              // (scratch keys for the flank's path: nothing is allocated per frame)
/**
 * One window of the kingdom at t: {k (its light, 0 … ≈1.2), heat (0 amber … 1 dying ember), mk (its reflection's light: the lake
 * remembers it a beat longer), rise (m: how far the mirror-only twin has risen, so its image sinks)}. The dark comes down the
 * towers with the lantern: the row at the top goes first, and every row is out by the contact. row 0 is the lowest. Pure.
 */
export function introWindow(INTRO, t, row, seed = 0.5, out = {}) {
  const S = INTRO.set, F = S.fall, Dk = S.dark, M = S.memory, rows = Math.max(2, S.windows.rows);
  const at = (Dk.from ?? 0.02) + ((rows - 1 - row) / (rows - 1)) * ((Dk.to ?? 0.6) - (Dk.from ?? 0.02));   // the fall's progress when the dark reaches this row
  const start = F.drop + (F.contact - F.drop) * Math.sqrt(at) + seed * (Dk.jitter ?? 0.1);
  const u = (t - start) / Dk.gutter;
  const own = (0.8 + 0.4 * ((seed * 7.13) % 1)) * (1 + 0.06 * Math.sin(t * (2.1 + seed * 3.3) + seed * 40));   // no two windows burn alike
  // a candle guttering: it dips, flares once, and goes
  const g = u <= 0 ? 1 : u >= 1 ? 0 : keyed(GUTTER, u);
  out.k = own * g;
  out.heat = smooth(0.2, 1, u);
  const end = start + M.linger, fade = M.fade ?? 0.5;
  out.mk = own * (1 - smooth(end - fade, end, t));
  const r = clamp01((t - start) / M.linger);
  out.rise = M.rise * r * r;
  out.start = start;
  return out;
}

/**
 * The whole set at timeline time t, as plain numbers (the stage lays them on the models; a test reads them). Pure: t, the
 * viewport aspect and `reduced` (softer flash, the cut as a dip) are its only inputs. `out` is reused when given.
 * Picture coordinates (`below`): x right, y up, in picture heights from the middle of the frame.
 */
export function introScore(INTRO, t, { aspect = 16 / 9, reduced = false } = {}, out = {}) {
  const S = INTRO.set, F = S.fall, L = INTRO.length, cut = INTRO.cut.at, B = S.below, W = S.wick;
  const on = t >= (INTRO.swapAt ?? 0), pw = portraitWeight(INTRO, aspect);
  out.on = on; out.t = t; out.end = t >= L;
  const soft = reduced ? 0.25 : 1;

  // ---- the great lantern: it hangs, a chain parts and it lurches, it drops (slow and heavy), it meets the water and goes under
  const la = out.lantern || (out.lantern = {});
  const fall = clamp01((t - F.drop) / (F.contact - F.drop)), p = fall * fall;
  const tau = Math.max(0, t - F.part);
  const lurch = (F.lurch ?? 0.06) * (smooth(0, 0.14, tau) + 0.5 * Math.exp(-8 * tau) * Math.sin(30 * tau) * (tau > 0 ? 1 : 0));
  const y0 = S.lantern.at[2] - 0.3 * smooth(0, 0.16, tau);
  la.vis = on && t < cut;
  la.y = t < F.contact ? lerp(y0, F.restY, p) : F.restY - (F.sink ?? 5) * (t - F.contact);
  la.tilt = t < F.drop ? lurch : lerp(lurch, F.tilt, Math.pow(fall, 1.3));
  la.fall = p;
  la.whip = 0.07 * Math.sin((t - F.drop) * 11) * fall * (t < F.contact ? 1 : Math.max(0, 1 - (t - F.contact) * 4));   // the stubs trail it
  const breath = 1 + 0.035 * Math.sin(t * 2.1) + 0.02 * Math.sin(t * 5.3 + 1.1);
  const flashU = (t - F.contact) / S.contact.flash, flash = t >= F.contact && flashU < 1 ? (1 - flashU) * (1 - flashU) * soft : 0;
  const under = smooth(F.contact, cut + 0.2, t);
  la.glow = breath * (1 - 0.5 * under);
  la.haloOpacity = Math.min(1, S.lantern.halo.opacity * breath * (1 - 0.35 * under) + 0.45 * flash);
  la.haloSize = S.lantern.halo.size * (1 + 0.55 * flash);
  la.pale = flash;                                   // the halo leans to pale gold in the flash
  la.flash = flash;
  // its light on the water (every tier): steady while it hangs, a surge at the contact, then nothing
  la.water = !la.vis ? 0 : t < F.contact ? breath : Math.max(0, 1 - flashU) * (1 + 1.2 * flash);

  // ---- the chains above their breaks: one parts (5.6), then the other two (5.9); each whips up out of frame
  const ch = out.chains || (out.chains = { a: {}, bc: {}, spark: {} });
  const whip = (from) => { const d = t - from; return d <= 0 ? 0 : 6 * d + 260 * d * d; };
  ch.a.lift = whip(F.part); ch.a.vis = la.vis && t < F.part + 0.5;
  ch.bc.lift = whip(F.drop); ch.bc.vis = la.vis && t < F.drop + 0.5;
  const s1 = bump(F.part, F.part + 0.16, t), s2 = bump(F.drop, F.drop + 0.14, t);
  ch.spark.k = Math.max(s1, s2 * 0.8); ch.spark.which = s1 > 0 ? 0 : s2 > 0 ? 1 : -1;

  // ---- the contact: one widening ring at the lantern's foot
  const ring = out.ring || (out.ring = {});
  const ru = (t - F.contact) / S.contact.ring.life;
  ring.vis = on && t >= F.contact && t < cut && ru < 1;
  ring.r = lerp(S.contact.ring.r[0], S.contact.ring.r[1], easeOut(ru, 2.4));
  ring.k = ring.vis ? (1 - ru) * (1 - ru) * 2.6 * (reduced ? 0.5 : 1) : 0;

  // ---- the kingdom's windows are lit from the swap to the cut (introWindow has each one)
  out.windows = on && t < cut;

  // ---- the ink card: full from the cut; it thins from the Wick's flame, and hesitates when the flame gutters
  const card = out.card || (out.card = {});
  const wickK = keyed(W.flame, t);
  const liftU = clamp01((t - W.lift[0]) / (W.lift[1] - W.lift[0]));
  card.opacity = t < cut ? (reduced ? smooth(cut - 0.3, cut, t) : 0) : 1 - smooth(W.lift[1] - 0.3, W.lift[1], t);
  card.vis = on && card.opacity > 0.001 && t < W.lift[1];
  card.open = t < W.lift[0] ? 0 : Math.min(1, 0.07 * wickK * (1 - liftU) + liftU * liftU * (3 - 2 * liftU));   // 0 … 1 of the way to the far corner
  card.surface = 1 - smooth(cut + 0.6, B.ember.sinkUntil + 0.6, t) * 0.75;                           // the lit water overhead falls away as we sink
  const dark = t >= cut && t < W.lift[0] + 0.2;

  // ---- motes: there from the cut, gone before the spark
  out.motes = dark ? 0.8 * smooth(cut, cut + 0.5, t) * (1 - smooth(B.flank.out - 0.25, B.flank.out + 0.15, t)) : 0;

  // ---- the pale flank: a straight glide across the picture (on a diagonal in portrait), faster once it has the ember
  const fl = out.flank || (out.flank = {}), FK = B.flank;
  const ang = pw * (FK.portraitAngle * Math.PI) / 180, ca = Math.cos(ang), sa = Math.sin(ang);
  const girth = lerp(FK.frame?.[0] ?? 1.15, FK.frame?.[1] ?? 0.5, pw);        // its girth in picture heights
  const unit = girth / FK.girth, len = FK.length * unit;                       // picture heights per metre; its length in picture heights
  const half = (aspect / 2) * Math.abs(ca) + 0.5 * Math.abs(sa);               // the picture's half-extent along its path
  const ex0 = (B.ember.to[0] - 0.5) * aspect, ey0 = 0.5 - B.ember.to[1];       // where the ember waits
  const eA = ex0 * ca + ey0 * sa, eB = -ex0 * sa + ey0 * ca;                   // … along and across the path
  const [bs, bv] = FLANK_MARKS.belly;
  // its nose along the path: a steady glide in, to the ember by `cover`; the belly (and the ember in it) out of frame by `leave`;
  // then it keeps going, half again as fast, while the dark takes it (it is never seen to its tail)
  const nLeave = half + 0.12 + bs * len, vOut = ((nLeave - (eA - 0.02)) / (FK.leave - FK.cover)) * 1.5;
  GLIDE[0][0] = FK.enter; GLIDE[0][1] = -half - 0.04; GLIDE[1][0] = FK.cover; GLIDE[1][1] = eA - 0.02; GLIDE[2][0] = FK.leave; GLIDE[2][1] = nLeave; GLIDE[3][0] = FK.out; GLIDE[3][1] = nLeave + vOut * (FK.out - FK.leave);
  const nose = glide(GLIDE, t);
  fl.vis = on && t >= FK.enter && t < FK.out;
  fl.angle = ang; fl.unit = unit; fl.nose = nose;
  const rise = lerp(FK.rise?.[0] ?? 0.13, FK.rise?.[1] ?? 0.12, pw);           // its middle line passes this far (in girths) above the ember: the ember meets the mouth
  const mid = nose - len / 2, across = eB + rise * girth, away = 0.3 * smooth(FK.cover, FK.out, t);
  fl.x = mid * ca - across * sa; fl.y = mid * sa + across * ca; fl.z = -away;
  fl.alpha = 1 - smooth(FK.leave + 0.1, FK.out, t);
  fl.eyeAt = nose - FLANK_MARKS.eye[0] * len;                                  // along the path (tests: the eye is in frame at FK.eye)

  // ---- the ember: it sinks and cools; the flank's nose takes it; it glows through the belly and leaves with it
  const em = out.ember || (out.ember = {});
  const e = easeOut((t - cut) / (B.ember.sinkUntil - cut), 2.2);
  const drift = 0.012 * Math.max(0, t - B.ember.sinkUntil);
  let ax = lerp((B.ember.from[0] - 0.5) * aspect, ex0, e), ay = lerp(0.5 - B.ember.from[1], ey0, e) - drift;
  let a = ax * ca + ay * sa, b = -ax * sa + ay * ca;
  const drawn = smooth(FK.cover - 0.3, FK.cover, t); a -= 0.035 * drawn * drawn;   // the last moment: it is drawn toward the mouth
  const covered = smooth(FK.cover - 0.02, FK.cover + 0.12, t);
  const pb = flankPoint(bs, bv, FK, BELLY), bellyA = nose - bs * len, bellyB = across + pb[1] * unit;
  if (t >= FK.cover) { a = Math.max(a, bellyA); b = lerp(b, bellyB, smooth(FK.cover, FK.cover + 0.7, t)); }
  em.x = a * ca - b * sa; em.y = a * sa + b * ca;
  em.size = lerp(B.ember.size[0], B.ember.size[1], e) * (1 + 0.07 * Math.sin(t * 9.1) * Math.sin(t * 5.7 + 1));
  em.heat = e;
  em.k = dark && t < FK.out ? (1 - 0.55 * covered) * fl.alpha : 0;
  em.covered = covered;
  em.vis = em.k > 0.002 && Math.abs(em.x) < aspect / 2 + 0.3;
  // … and where it is in the flank's own metres, for the glow through the belly
  fl.emberX = (a - mid) / unit; fl.emberY = (b - across) / unit; fl.emberK = fl.vis ? covered * 0.95 * (1 + 0.1 * Math.sin(t * 7.3)) : 0;

  // ---- the spark at the Wick's head
  const sp = out.spark || (out.spark = {});
  sp.k = bump(W.spark, W.spark + 0.22, t);
  sp.size = 0.18 + 0.75 * sp.k;

  // ---- the Wick's kindling and its hanging lantern (actors.setIntroKindle): out while the great lantern burns
  const kd = out.kindle || (out.kindle = {});
  kd.on = on;
  kd.wick = on ? wickK : 1;
  kd.lantern = on ? smooth(W.lantern[0], W.lantern[1], t) : 1;
  return out;
}

// ------------------------------------------------------------------ the stage
const BELOW_DIST = 10;      // m: how far in front of the lens the picture plane of the dark beat stands (its things are sized in picture heights)
const CARD_DIST = 60;       // m: the depth the ink card resets the picture to (everything of the dark beat is nearer)

export function createIntroStage(ctx) {
  const I = () => ctx.data?.INTRO || null;
  const st = { built: false, live: false, t: -1, take: null, w: 0, anchors: null, anchored: false, replay: false, reduced: false, mood: false, step: 0, buildMs: 0, kindled: false, lit: false };
  const pose = { pos: [0, 0, 0], look: [0, 0, 0], fov: 46, w: 1 };
  const real = (m) => !!m && !m.isStub;
  /** A real three.js scene and a DOM to make textures in: without them (a unit test's fake game) the stage flies the camera only. */
  const canBuild = () => typeof document !== 'undefined' && !!ctx.render?.scene?.isScene && !!ctx.render?.camera?.isCamera;

  // what the stage owns (null until built)
  let set = null;
  const score = {}, win = {}, kindle = { wick: 0, lantern: 0 }, waterLight = { x: 0, y: 0, z: 0, color: 0xed9e3b, intensity: 0, radius: 40, streak: 2 };
  const tmpC = new THREE.Color(), tmpV = new THREE.Vector3(), tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler(), tmpS = new THREE.Vector3(1, 1, 1), size2 = new THREE.Vector2();
  const lens = new THREE.PerspectiveCamera();   // a scratch lens (never in the scene): where a world point falls in the film's own frame

  // ---------------------------------------------------------------- building, in slices
  function hangPoint(INTRO, anchors) {
    const p = resolvePoint(INTRO.set.lantern.at, anchors);
    // over open water (it falls into its own reflection): step south, toward the lens, until the lake is clear under it
    const w = ctx.world;
    if (real(w) && typeof w.isOpenWater === 'function') {
      for (let i = 0; i < 6; i++) { let ok = true; try { ok = w.isOpenWater(p[0], p[2], 4) !== false; } catch { ok = true; } if (ok) break; p[2] += 2; }
    }
    return p;
  }
  function buildModels() {
    const INTRO = I(), S = INTRO.set, C = S.colors, anchors = st.anchors || (st.anchors = introAnchors(ctx));
    if (!anchors) throw new Error('intro-stage: the world has no spawn or hero anchor to build the set on');
    const tier = String(ctx.render.quality || 'medium');
    const hang = hangPoint(INTRO, anchors);
    const lantern = buildLantern({ height: S.lantern.height, radius: S.lantern.radius, colors: C, glow: S.lantern.glow, halo: S.lantern.halo, chainTopLocal: S.lantern.chainTop - hang[1] });
    const windows = buildWindows(anchors.G, S.windows, { colors: C, memory: (S.memory.tiers || []).includes(tier) });
    const ring = buildRing(C.ring), card = buildInkCard(C), motes = buildMotes(S.below.motes, 0xb8b0ea), ember = buildEmber(C), flank = buildFlank({ length: S.below.flank.length, girth: S.below.flank.girth, colors: C });
    const sparkTop = buildSpark(C.spark, 'intro:chain-spark'), sparkWick = buildSpark(C.spark, 'intro:wick-spark');
    card.uniforms.uDist.value = CARD_DIST;

    const group = new THREE.Group(); group.name = 'intro:set';
    const hangG = new THREE.Group(); hangG.name = 'intro:hang'; hangG.position.set(hang[0], hang[1], hang[2]);
    for (const u of lantern.uppers) hangG.add(u);
    hangG.add(sparkTop.sprite);
    group.add(hangG, lantern.group, windows.mesh, windows.halos.points, ring.mesh, card.mesh, sparkWick.sprite);
    if (windows.memory) group.add(windows.memory);
    ring.mesh.position.set(hang[0], 0.07, hang[2]);
    // the dark beat's things stand in front of the lens, in picture heights (the group is scaled to the lens each frame)
    const below = new THREE.Group(); below.name = 'intro:below';
    below.add(motes.points, ember.halo, ember.core, flank.group);
    group.visible = false; below.visible = false;

    const parts = [lantern, windows, ring, card, motes, ember, flank, sparkTop, sparkWick];
    set = {
      group, below, hangG, hang, lantern, windows, ring, card, motes, ember, flank, sparkTop, sparkWick, tier, anchors, gate: anchors.G.theme === 'mossmere' || !anchors.G.theme,
      geometries: parts.flatMap((p) => p.geometries), materials: parts.flatMap((p) => p.materials),
      warm: [lantern.group, hangG, windows.mesh, windows.halos.points, ...(windows.memory ? [windows.memory] : []), ring.mesh, card.mesh, below],
      colors: {
        glass: new THREE.Color(C.glass), halo: new THREE.Color(C.halo), pale: new THREE.Color(C.ring), window: new THREE.Color(C.window), dying: new THREE.Color(C.emberDeep),
        ember: new THREE.Color(C.ember), emberDeep: new THREE.Color(C.emberDeep), ring: new THREE.Color(C.ring),
      },
    };
  }
  /** The steps of a build, one per prebuild() call: the models, then each part's programs compiled as the frame will use them. */
  function stepCount() { return set ? 1 + set.warm.length : 1; }
  function buildStep() {
    const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
    if (st.step === 0) buildModels();
    else {
      const obj = set.warm[st.step - 1], R = ctx.render;
      // (warming is an optimisation: a renderer that cannot do it draws the film all the same)
      try { if (typeof R.warmPrograms === 'function') R.warmPrograms(obj); } catch { /* the first frame compiles instead */ }
    }
    st.step++;
    if (typeof performance !== 'undefined') st.buildMs += performance.now() - t0;
    return st.step >= stepCount();
  }
  function prebuild() {
    if (st.built) return true;
    if (!I()) return false;
    if (!canBuild()) { st.built = true; return true; }
    // (a world that cannot say yet where its raft and its landmark stand: not an error, ask again on the next slice)
    if (st.step === 0 && !(st.anchors || (st.anchors = introAnchors(ctx)))) return false;
    if (buildStep()) st.built = true;
    return st.built;
  }

  function attach() {
    if (!set) return;
    set.group.visible = false; set.below.visible = false;
    ctx.render.scene.add(set.group);
    ctx.render.camera.add(set.below);
  }
  function freeSet() {
    if (!set) return;
    const m = set; set = null;
    try {
      m.group.parent?.remove(m.group); m.below.parent?.remove(m.below);
      for (const o of [m.windows.mesh, m.windows.memory]) o?.dispose?.();   // (an InstancedMesh frees its instance buffers itself)
      for (const g of m.geometries) g.dispose();
      for (const mat of m.materials) mat.dispose();                          // (the sprites' shared glow texture stays: the raft holds it)
    } catch { /* never throws */ }
  }
  function buildAll() {
    let guard = 64;
    while (!prebuild() && guard-- > 0) { /* build at once whatever the idle slices left (the opening ink covers it) */ }
  }

  function enter({ replay = false, reduced = false } = {}) {
    if (st.live) return;
    buildAll();
    st.live = true; st.replay = !!replay; st.reduced = !!reduced; st.t = -1; st.anchored = false;
    st.anchors = st.anchors || introAnchors(ctx);
    attach();
  }

  /**
   * At the swap (the opening ink is full) the lake on screen is the film's for certain: a replay from a title that shows another
   * lake has swapped the Mossmere in by now. If the set was built on other anchors (under that other title), it is built again here.
   */
  function anchor() {
    st.anchored = true;
    const a = introAnchors(ctx);
    if (!a) return;
    const b = set ? set.anchors : null;
    st.anchors = a;
    if (b && Math.abs(a.G.x - b.G.x) < 1e-3 && Math.abs(a.G.z - b.G.z) < 1e-3 && Math.abs(a.S.x - b.S.x) < 1e-3 && Math.abs(a.S.z - b.S.z) < 1e-3 && a.G.theme === b.G.theme) return;
    if (!set && !canBuild()) return;
    freeSet(); st.built = false; st.step = 0;   // built on another lake's anchors, or not built yet (the world could not say): now
    buildAll(); attach();
  }

  /** From the swap on (the opening ink is full) the world wears the first run's opening mood: the last shot is lit as the run is. */
  function setMood(on) {
    if (on === st.mood) return;
    st.mood = on;
    try { if (real(ctx.world)) ctx.world.setIntroMood?.(on); } catch { /* optional */ }
  }

  function setCamera(t) {
    const R = ctx.render;
    if (!real(R) || typeof R.setIntroCamera !== 'function') return null;
    const cam = R.camera, aspect = cam && cam.aspect > 0 ? cam.aspect : 16 / 9;
    if (!st.anchors) st.anchors = introAnchors(ctx);
    const c = st.anchors ? introCamera(I(), t, aspect) : null;
    if (!c) { st.take = null; st.w = 0; R.setIntroCamera(null); return null; }
    pose.pos = resolvePoint(c.pos, st.anchors); pose.look = resolvePoint(c.look, st.anchors); pose.fov = c.fov; pose.w = c.w;
    st.take = c.take; st.w = c.w;
    R.setIntroCamera(pose);
    return c;
  }

  // ---------------------------------------------------------------- the score laid on the hooks (no three.js needed)
  function applyHooks(sc) {
    const A = ctx.actors, W = ctx.world;
    // the raft's own light: out while the great lantern burns, kindled in the `wick` beat, the game's own again at the end
    if (real(A) && typeof A.setIntroKindle === 'function') {
      if (sc.kindle.on) { kindle.wick = sc.kindle.wick; kindle.lantern = sc.kindle.lantern; A.setIntroKindle(kindle); st.kindled = true; }
      else if (st.kindled) { A.setIntroKindle(null); st.kindled = false; }
    }
    // the great lantern's pool and gold path on the water (every tier)
    if (real(W) && typeof W.setIntroWaterLight === 'function') {
      const S = I().set, k = sc.lantern.water;
      if (k > 0.001 && st.anchors) {
        const h = set ? set.hang : resolvePoint(S.lantern.at, st.anchors);
        waterLight.x = h[0]; waterLight.y = Math.max(0.6, sc.lantern.y); waterLight.z = h[2];
        waterLight.color = S.colors.glass; waterLight.intensity = S.lantern.water.intensity * k; waterLight.radius = S.lantern.water.radius;
        waterLight.streak = ctx.render?.quality === 'low' ? (S.lantern.water.streakLow ?? S.lantern.water.streak) : S.lantern.water.streak;
        W.setIntroWaterLight(waterLight); st.lit = true;
      } else if (st.lit) { W.setIntroWaterLight(null); st.lit = false; }
    }
  }

  // ---------------------------------------------------------------- the score laid on the models
  function applySet(sc, t, prev, c, opts) {
    const INTRO = I(), S = INTRO.set, R = ctx.render, cam = R.camera, aspect = cam.aspect > 0 ? cam.aspect : 16 / 9;
    const m = set, shown = sc.on && !sc.end;
    m.group.visible = shown;
    m.below.visible = false;
    if (!shown) return;

    // the great lantern
    const la = sc.lantern, L = m.lantern;
    L.group.visible = la.vis; m.hangG.visible = la.vis;
    if (la.vis) {
      L.group.position.set(m.hang[0], la.y, m.hang[2]);
      L.group.rotation.set(0, 0, la.tilt);
      // the chain stubs hang true whatever the lantern's tilt (a shear about the chains' foot), with a little whip in the fall
      { const th = la.tilt + la.whip, sn = Math.sin(th), cs = Math.cos(th), y0 = L.stubY;
        L.stubs.matrix.set(1, sn, 0, -y0 * sn, 0, cs, 0, y0 * (1 - cs), 0, 0, 1, 0, 0, 0, 0, 1); L.stubs.matrixWorldNeedsUpdate = true; }
      L.glass.material.color.setScalar(L.glow * la.glow);
      L.halo.material.opacity = la.haloOpacity;
      L.halo.material.color.copy(m.colors.halo).lerp(m.colors.pale, la.pale);
      L.halo.scale.setScalar(la.haloSize);
      const ch = sc.chains;
      L.uppers[0].visible = ch.a.vis; L.uppers[0].position.y = ch.a.lift;
      L.uppers[1].visible = ch.bc.vis; L.uppers[1].position.y = ch.bc.lift;
      const sp = m.sparkTop.sprite;
      sp.visible = ch.spark.k > 0.01;
      if (sp.visible) {
        const k = ch.spark.which === 0 ? 0 : 2, at = L.chainLocal[k];
        sp.position.set(ch.spark.which === 0 ? at[0] : 0, L.breakY[ch.spark.which === 0 ? 0 : 2] - (ch.spark.which === 0 ? 0 : 2), at[2]);
        sp.scale.setScalar(1.2 + 3.4 * ch.spark.k); sp.material.opacity = Math.min(1, ch.spark.k * 1.3);
      }
    }

    // the contact ring
    m.ring.mesh.visible = sc.ring.vis;
    if (sc.ring.vis) { m.ring.mesh.scale.set(sc.ring.r, 1, sc.ring.r); m.ring.mesh.material.color.setScalar(sc.ring.k); }

    // the kingdom's windows, their halos and their memory in the lake
    const Wn = m.windows;
    const lit = sc.windows && m.gate;   // (the towers they sit on are the Mossmere's)
    Wn.mesh.visible = lit; Wn.halos.points.visible = lit; if (Wn.memory) Wn.memory.visible = lit;
    if (lit) {
      const glow = S.windows.glow, lay = Wn.layout, amber = m.colors.window, dying = m.colors.dying, hc = Wn.haloColor;
      for (let i = 0; i < lay.length; i++) {
        const Li = lay[i], w = introWindow(INTRO, t, Li.row, Li.seed, win);
        tmpC.copy(amber).lerp(dying, w.heat).multiplyScalar(glow * w.k);
        Wn.mesh.setColorAt(i, tmpC);
        const h = Wn.haloOf[i];
        if (h >= 0) Wn.halos.setColor(h, hc[0] * w.k, hc[1] * w.k * (1 - 0.35 * w.heat), hc[2] * w.k * (1 - 0.5 * w.heat));
        if (Wn.memory) {
          tmpC.copy(amber).multiplyScalar(glow * 0.92 * w.mk);
          Wn.memory.setColorAt(i, tmpC);
          tmpM.compose(tmpV.set(Li.x, Li.y + w.rise, Li.z), tmpQ.setFromEuler(tmpE.set(0, Li.yaw, 0)), tmpS.set(Li.sx, Li.sy, 1));
          Wn.memory.setMatrixAt(i, tmpM);
        }
      }
      Wn.mesh.instanceColor.needsUpdate = true;
      Wn.halos.touchColors();
      Wn.halos.uniforms.uTime.value = t;
      Wn.halos.uniforms.uFogD.value = R.scene.fog?.density ?? 0.016;
      if (Wn.memory) { Wn.memory.instanceColor.needsUpdate = true; Wn.memory.instanceMatrix.needsUpdate = true; }
    }

    // the ink card and what stands in front of it
    const cd = sc.card, CU = m.card.uniforms;
    m.card.mesh.visible = cd.vis;
    if (cd.vis) {
      CU.uOpacity.value = cd.opacity; CU.uAspect.value = aspect; CU.uSurface.value = cd.surface;
      // it opens from the Wick's flame: where that falls in the film's own frame
      let fx = 0.2, fy = 0.25;
      if (cd.open > 0 && c) {
        const head = real(ctx.actors) && ctx.actors.getHeadPos ? ctx.actors.getHeadPos(tmpV) : null;
        if (head && Number.isFinite(head.x)) {
          lens.fov = pose.fov; lens.aspect = aspect; lens.near = cam.near; lens.far = cam.far; lens.updateProjectionMatrix();
          lens.position.set(pose.pos[0], pose.pos[1], pose.pos[2]); lens.up.set(0, 1, 0); lens.lookAt(pose.look[0], pose.look[1], pose.look[2]);
          lens.updateMatrixWorld(); lens.matrixWorldInverse.copy(lens.matrixWorld).invert();
          tmpV.project(lens);
          if (Number.isFinite(tmpV.x) && Math.abs(tmpV.x) < 1.2 && Math.abs(tmpV.y) < 1.2) { fx = tmpV.x * 0.5 + 0.5; fy = tmpV.y * 0.5 + 0.5; }
        }
      }
      const far = Math.hypot(Math.max(fx, 1 - fx) * aspect, Math.max(fy, 1 - fy));
      const feather = 0.16 + 0.7 * cd.open;
      CU.uOpen.value.set(fx, fy, cd.open * (far + feather), feather);
    }
    const B = m.below, dark = cd.vis && (sc.motes > 0.001 || sc.ember.vis || sc.flank.vis);
    B.visible = dark;
    if (dark) {
      const fov = c ? pose.fov : cam.fov, h = 2 * BELOW_DIST * Math.tan((fov * Math.PI) / 360);
      B.position.set(0, 0, -BELOW_DIST); B.scale.setScalar(h);
      const MU = m.motes.uniforms;
      m.motes.points.visible = sc.motes > 0.001;
      MU.uK.value = sc.motes; MU.uT.value = t; MU.uAspect.value = aspect;
      R.renderer.getDrawingBufferSize(size2); MU.uViewH.value = size2.y || 720;
      const em = sc.ember, E = m.ember;
      E.core.visible = E.halo.visible = em.vis;
      if (em.vis) {
        tmpC.copy(m.colors.ember).lerp(m.colors.emberDeep, em.heat);
        E.core.position.set(em.x, em.y, 0.02); E.halo.position.set(em.x, em.y, 0.02);
        E.core.scale.setScalar(em.size); E.halo.scale.setScalar(em.size * 3.4);
        E.core.material.color.copy(tmpC).multiplyScalar(1.5); E.core.material.opacity = Math.min(1, em.k * 1.15);
        E.halo.material.color.copy(tmpC); E.halo.material.opacity = 0.34 * em.k;
      }
      const fl = sc.flank, F = m.flank;
      F.group.visible = fl.vis;
      if (fl.vis) {
        F.group.position.set(fl.x, fl.y, fl.z); F.group.rotation.set(0, 0, fl.angle); F.group.scale.setScalar(fl.unit);
        F.uniforms.uAlpha.value = fl.alpha; F.eyeMat.opacity = fl.alpha;
        F.uniforms.uEmber.value.set(fl.emberX, fl.emberY, S.below.flank.girth * 0.2, fl.emberK);
      }
    }

    // the spark at the Wick's head (over the ink)
    const sw = m.sparkWick.sprite;
    sw.visible = sc.spark.k > 0.01;
    if (sw.visible) {
      const head = real(ctx.actors) && ctx.actors.getHeadPos ? ctx.actors.getHeadPos(tmpV) : null;
      if (head && Number.isFinite(head.x)) { sw.position.copy(head); sw.scale.setScalar(sc.spark.size); sw.material.opacity = Math.min(1, sc.spark.k * 1.4); } else sw.visible = false;
    }

    // live garnish: the lake's own splash where the lantern goes in (never on a seek; nothing depends on it)
    if (opts.live && !opts.seek && prev >= 0 && prev < S.fall.contact && t >= S.fall.contact && t - prev < 0.5) {
      try { if (real(ctx.water)) ctx.water.splash?.(m.hang[0], m.hang[2], { size: S.contact.splash, color: S.colors.ring }); } catch { /* garnish */ }
    }
  }

  function setTime(t, opts = {}) {
    if (!st.live || !I()) return;
    t = Math.max(0, Math.min(Number(t) || 0, I().length));
    if (!st.anchored && t >= (I().swapAt ?? 0)) anchor();
    setMood(t >= (I().swapAt ?? 0));
    const c = setCamera(t);
    // a seek shows the settled picture: the rig under the film's pose is put at rest too (the last take blends into it)
    if (opts.seek) { try { ctx.render?.snapCamera?.(); } catch { /* optional */ } }
    const aspect = ctx.render?.camera?.aspect > 0 ? ctx.render.camera.aspect : 16 / 9;
    const sc = introScore(I(), t, { aspect, reduced: opts.reduced === true || st.reduced }, score);
    applyHooks(sc);
    if (set) applySet(sc, t, st.t, c, opts);
    st.t = t;
  }

  function exit() {
    try { if (real(ctx.render)) ctx.render.setIntroCamera?.(null); } catch { /* never throws */ }
    st.mood = false;
    try { if (real(ctx.world)) { ctx.world.setIntroMood?.(false); ctx.world.setIntroWaterLight?.(null); } } catch { /* never throws */ }
    try { if (real(ctx.actors)) ctx.actors.setIntroKindle?.(null); } catch { /* never throws */ }
    try { if (set) { set.group.visible = false; set.below.visible = false; set.group.parent?.remove(set.group); set.below.parent?.remove(set.below); } } catch { /* never throws */ }
    st.live = false; st.take = null; st.w = 0; st.kindled = false; st.lit = false;
  }

  function dispose() {
    exit();
    freeSet();
    st.built = false; st.step = 0; st.buildMs = 0; st.anchors = null;
  }

  /** The set's own cost in the frame at st.t: every object that is drawn, in the main pass and (where it is mirrored) the lake's. */
  function cost() {
    let calls = 0, triangles = 0;
    if (!set || !st.live) return { calls, triangles };
    let mirror = false;
    try { mirror = ctx.water?.reflection?.on === true; } catch { mirror = false; }
    const visit = (o, vis) => {
      vis = vis && o.visible;
      if (!vis) return;
      if (o.isMesh || o.isSprite || o.isPoints) {
        const g = o.geometry, n = o.isSprite ? 2 : o.isPoints ? 0 : ((g.index ? g.index.count : g.attributes.position.count) / 3) * (o.isInstancedMesh ? o.count : 1);
        const passes = (o.layers.isEnabled(0) ? 1 : 0) + (mirror && o.layers.isEnabled(REFLECT_LAYER) ? 1 : 0);
        calls += passes; triangles += n * passes;
      }
      for (const ch of o.children) visit(ch, vis);
    };
    visit(set.group, true); visit(set.below, true);
    return { calls, triangles: Math.round(triangles) };
  }

  return {
    prebuild, enter, setTime, exit, dispose,
    get ready() { return st.built; },
    stats: () => ({ built: st.built, live: st.live, t: st.t, take: st.take, w: st.w, anchors: st.anchors, ...cost(),
      geometries: set ? set.geometries.length : 0, textures: 0, lights: 0, steps: [st.step, stepCount()], buildMs: +st.buildMs.toFixed(1), tier: set ? set.tier : null }),
  };
}
