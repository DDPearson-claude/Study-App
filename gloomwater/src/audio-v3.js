// audio-v3.js — the pure rules behind GLOOMWATER's v3 sounds (DESIGN §25.14.2 Au1, CONTRACT §13.7 audio).
// No WebAudio here: audio.js asks these helpers which sound a v3 event plays, when, and at what pitch, so the rules
// can be unit-tested in node (tools/tests/audio-v3.test.mjs). Every helper takes the data module (ctx.data) as an
// argument and feature-detects the v3 fields (SIZE_CLASSES, sizeLength, BALANCE.ceremony / nightModes / bite);
// without them it answers the v1 way (null / the gloom mood), so a flag-off build never reaches a v3 sound.
//
//   tellSfx(biteTell) / tellDelay(biteTell, lead, data)   the class bite tell (fishing:tell {biteTell, lead})
//   riseSfx(sizeClass) / riseParams(sizeClass)            a rise ring's "plip" (Small, Keeper) or deep "gulp" (Prize+)
//   nightModeFrom({...}) / nightMood({...})               which night mode a run plays; Stillnight bed vs the gloom mood
//   cordThresholds / cordDuration / cordPlan              the measuring cord's knot ticks and class chimes
//   sealOf(sizeClass, data)                               the seal pressed at the stamp (fish:measured)

const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);

/** The class ladder (data.SIZE_CLASSES ids); used when data does not carry it. */
export const CLASS_IDS = ['small', 'keeper', 'prize', 'trophy', 'elder'];
export function classIndex(id) { const i = CLASS_IDS.indexOf(id); return i < 0 ? -1 : i; }

// ------------------------------------------------------------------ bite tells (DESIGN §25.6.4)
/** fishing.view.biteTell → the SFX that voices it. */
export const TELL_SFX = Object.freeze({
  doublePop: 'bite_doublepop',    // Small: a quick double pop
  plunge: 'bite_plunge',          // Keeper: the classic plunge
  dragUnder: 'bite_dragunder',    // Prize: a slow 0.4 s drag-under before the "!"
  flatSlide: 'bite_flat',         // Trophy: the float lies flat, then slides away
  dome: 'bite_dome',              // Elder (and every legend): a dome of water bulges up under the float
});
/** How long each tell's float animation runs before the "!" (fishing.js beginTell; Prize from BALANCE.bite.dragUnder). */
export const TELL_DUR = Object.freeze({ doublePop: 0.36, plunge: 0, dragUnder: 0.4, flatSlide: 0.5, dome: 0.6 });

export function tellSfx(biteTell) { return (typeof biteTell === 'string' && TELL_SFX[biteTell]) || null; }
export function tellDuration(biteTell, data) {
  if (biteTell === 'dragUnder') return num(data?.BALANCE?.bite?.dragUnder, TELL_DUR.dragUnder);
  return num(TELL_DUR[biteTell], 0);
}
/** fishing:tell fires `lead` s before the bite; the tell's animation (and its sound) starts dur s before the bite. */
export function tellDelay(biteTell, lead, data) {
  return Math.max(0, num(lead, 0) - tellDuration(biteTell, data));
}

// ------------------------------------------------------------------ rise rings (DESIGN §25.6.1)
/** A rise ring's voice: a "plip" for a small surface feeder, a deep "gulp" for a big one (Prize+). */
export function riseSfx(sizeClass) { return classIndex(sizeClass) >= 2 ? 'rise_gulp' : 'rise_plip'; }
/** Pitch drops and loudness grows with the class (the ring radius is ∝ the fish's length). */
export function riseParams(sizeClass) {
  const i = classIndex(sizeClass);
  const k = i < 0 ? 1 : i;
  return { pitch: [1.15, 1.0, 1.0, 0.86, 0.74][k], volume: [0.6, 0.75, 0.85, 1.0, 1.1][k] };
}

// ------------------------------------------------------------------ night modes (DESIGN §25.5)
/**
 * The night mode a run plays, or null for a v1 run (no BALANCE.nightModes, or The Long Descent): the event's
 * nightMode first (survival's phase:change), then combat's and survival's getters, then the run itself.
 */
export function nightModeFrom({ eventMode, combatMode, survivalMode, run, nightModes } = {}) {
  if (!nightModes || typeof nightModes !== 'object') return null;
  if (run && run.outing === 'descent') return null;
  for (const m of [eventMode, combatMode, survivalMode]) if (typeof m === 'string' && nightModes[m]) return m;
  if (!run) return null;
  if (run.outing === 'first') return 'still';
  return typeof run.nightMode === 'string' && nightModes[run.nightMode] ? run.nightMode : null;
}
/**
 * The score for a night (phase gloomtide): 'gloom' while a swarm is out or due, else 'stillnight' (the quiet night's
 * bed). Gloomtide is the classic night (the swarm is the whole night); Still never swarms; Lantern swarms only on its
 * swarm nights, from the window's forecast until the window closes (the last 45 s are always quiet).
 *   swarmActive    combat.swarmActive (a window open, or any gloomling still up), when combat has it
 *   swarmTonight   survival.getPhaseInfo().swarm (tonight's swarm minus a lamp-watch or a Scorched) or data's swarmTonight
 *   windowOpen / windowClosed   from combat's swarm:window events tonight
 */
export function nightMood({ mode, swarmActive = null, swarmTonight = null, windowOpen = false, windowClosed = false } = {}) {
  if (!mode || mode === 'gloomtide') return 'gloom';
  if (swarmActive === true || windowOpen) return 'gloom';
  if (mode === 'still') return 'stillnight';
  if (swarmTonight === true && !windowClosed) return 'gloom';
  return 'stillnight';
}

// ------------------------------------------------------------------ the measuring cord (DESIGN §25.6.8)
/** The cm at which the count crosses each chiming class threshold (Prize, Trophy, Elder) for this species. */
export function cordThresholds(data, sp, zone = null) {
  const C = data?.SIZE_CLASSES;
  if (!Array.isArray(C) || typeof data?.sizeLength !== 'function' || !sp?.size || sp.rarity === 'legendary') return [];
  const out = [];
  for (let i = 1; i < C.length; i++) {
    if (!C[i].chime) continue;
    let cm = NaN;
    try { cm = data.sizeLength(sp, C[i - 1].zMax, zone); } catch { cm = NaN; }
    if (Number.isFinite(cm) && cm > 0) out.push({ cls: C[i].id, cm });
  }
  return out;
}
/** The chiming classes a fish of this class passes on its way up the cord (Small and Keeper ring none). */
export function chimeClasses(sizeClass, data) {
  const C = Array.isArray(data?.SIZE_CLASSES) ? data.SIZE_CLASSES : CLASS_IDS.map((id, i) => ({ id, chime: i >= 2 }));
  const top = C.findIndex((c) => c.id === sizeClass);
  if (top < 0) return [];
  return C.slice(0, top + 1).filter((c) => c.chime).map((c) => c.id);
}
/**
 * The cord's span in the ceremony: the class's ceremony length (SIZE_CLASSES[].ceremony; the 1.2 s variant during a
 * swarm window) × the cord beat's share of the reference timeline (BALANCE.ceremony.beats: cord 1.4–2.8 of 3.6 s).
 */
export function cordDuration(data, sizeClass, { short = false } = {}) {
  const B = data?.BALANCE?.ceremony;
  const cls = Array.isArray(data?.SIZE_CLASSES) ? data.SIZE_CLASSES.find((c) => c.id === sizeClass) : null;
  const total = short ? num(B?.cinematic?.duringSwarm, 1.2) : num(cls?.ceremony, 2.4);
  const cord = Array.isArray(B?.beats?.cord) ? num(B.beats.cord[1]) - num(B.beats.cord[0]) : 1.4;
  const full = Array.isArray(B?.beats?.banners) ? num(B.beats.banners[1], 3.6) : 3.6;
  return clamp(total * (cord > 0 ? cord : 1.4) / (full > 0 ? full : 3.6), 0.35, 3);
}
/** Without a ceremony on screen (a fishing build that measures at once) the cord plays compressed before the stamp. */
export function compactCordDuration(sizeClass) {
  const i = classIndex(sizeClass);
  return clamp(0.35 + 0.15 * Math.max(0, i), 0.35, 1.0);
}
const EASE = 2;   // count(k) = L · (1 − (1 − k)^EASE): quick at first, settling onto the final knot
const easeInv = (u) => 1 - Math.pow(1 - clamp(u), 1 / EASE);
/**
 * The knot ticks and class chimes of one cord: ticks evenly spaced in centimetres (one knot each) on an ease-out
 * clock, pitch rising an octave from the first knot to the last; a chime at the moment the count passes each class
 * threshold the fish reaches. Times are seconds from the cord's start; the last tick lands on `dur` (the stamp).
 *   {length (cm), dur (s), chimes: ['prize', …], thresholds: [{cls, cm}], ticks?: N}
 */
export function cordPlan({ length, dur, chimes = [], thresholds = [], ticks } = {}) {
  const L = Math.max(0.1, num(length, 1));
  const D = clamp(num(dur, 1), 0.2, 6);
  const N = Math.max(4, Math.round(num(ticks, clamp(Math.round(D * 14), 6, 28))));
  const out = { dur: D, length: L, ticks: [], chimes: [] };
  for (let i = 1; i <= N; i++) {
    const u = i / N;
    out.ticks.push({ t: D * easeInv(u), pitch: Math.pow(2, u), cm: L * u, i });
  }
  const byCls = new Map(thresholds.map((x) => [x.cls, num(x.cm, NaN)]));
  chimes.forEach((cls, j) => {
    let cm = byCls.get(cls);
    if (!Number.isFinite(cm) || cm <= 0) cm = L * (0.55 + 0.4 * ((j + 1) / (chimes.length + 1)));   // no threshold: spread them late
    const u = clamp(cm / L, 0, 1);
    out.chimes.push({ t: D * easeInv(u), cls, cm: Math.min(cm, L) });
  });
  out.chimes.sort((a, b) => a.t - b.t);
  return out;
}

// ------------------------------------------------------------------ the seal (DESIGN §25.6.8)
const SEALS = { prize: 'inkStamp', trophy: 'oxbloodWax', elder: 'blackWaxRibbon' };
/** The seal stamped for a class (null for Small and Keeper: only the ink of the record). A legend takes the black wax. */
export function sealOf(sizeClass, data, { legendary = false } = {}) {
  if (legendary) return SEALS.elder;
  const c = Array.isArray(data?.SIZE_CLASSES) ? data.SIZE_CLASSES.find((x) => x.id === sizeClass) : null;
  if (c && 'seal' in c) return c.seal || null;
  return SEALS[sizeClass] || null;
}
/** The gold thread on the seal: an Ancient (an Elder with z ≥ 3.2) or a legend. */
export function goldThread({ ancient = false, legendary = false } = {}) { return !!ancient || !!legendary; }
