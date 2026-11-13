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
/** fishing:tell fires `lead` s before the bite; the tell's animation (and its sound) starts dur s before the bite
 *  (the event's own `dur` when fishing sends it, else TELL_DUR / BALANCE.bite.dragUnder). */
export function tellDelay(biteTell, lead, data, dur) {
  const d = typeof dur === 'number' && Number.isFinite(dur) && dur >= 0 ? dur : tellDuration(biteTell, data);
  return Math.max(0, num(lead, 0) - d);
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

// ------------------------------------------------------------------ the landing's payoff (AUTOFISH.landing; the user's 2026-11-13 ask)
/**
 * The swell into the reveal and the resolved chime at it, by class only (the swell starts while the species is still hidden; the
 * chime plays on fishing:caught, the reveal). Bigger is lower, longer and fuller: a Small rings two bright notes and is done; an
 * Elder or an Ancient (or a legend) rises the longest into a full chord over a bronze bell. `special` (a new species or a legend)
 * adds a high shimmer.
 *   landingVoicing(cls, {special}) -> {root (midi), notes (semitones above root), gap (s between notes), swell (s), bell, sub, shimmer}
 */
const LANDING_V = {
  small:   { root: 79, notes: [0, 7], gap: 0.07, swell: 0.4, bell: false, sub: false, shimmer: 0 },
  keeper:  { root: 74, notes: [0, 4, 7, 12], gap: 0.06, swell: 0.5, bell: false, sub: false, shimmer: 0 },
  prize:   { root: 69, notes: [0, 4, 7, 12, 16], gap: 0.065, swell: 0.75, bell: false, sub: true, shimmer: 3 },
  trophy:  { root: 65, notes: [0, 7, 12, 16, 19, 24], gap: 0.07, swell: 0.95, bell: true, sub: true, shimmer: 4 },
  elder:   { root: 60, notes: [0, 7, 12, 16, 19, 24, 28], gap: 0.075, swell: 1.2, bell: true, sub: true, shimmer: 5 },
  ancient: { root: 57, notes: [0, 7, 12, 16, 19, 24, 28, 31], gap: 0.08, swell: 1.35, bell: true, sub: true, shimmer: 6 },
};
export function landingClass({ sizeClass = null, ancient = false, legend = false } = {}) {
  if (legend || ancient) return 'ancient';
  return LANDING_V[sizeClass] ? sizeClass : 'keeper';
}
export function landingVoicing(cls, { special = false } = {}) {
  const v = LANDING_V[cls] || LANDING_V.keeper;
  return { ...v, notes: v.notes.slice(), shimmer: v.shimmer + (special ? 4 : 0) };
}

// =================================================================== automatic fishing (DESIGN §25.6, §25.14.2a Au2; CONTRACT §13.7a)
// The play's sounds come ONLY from what fishing:strike / fishing:reel / fishing:escaped carry: the size class (and `ancient`),
// the class length (`length`, else the lake's class ladder: never a species' own length), the mean fitted tier and the beat
// (phase, kind, strength, dur). No helper below takes a species: two species with the same class, z and seed give the same
// sounds (species-swap invariance, §25.6.10). Species voices play once, on fishing:caught (speciesVoice), never before.

/** The play classes (AUTOFISH.play keys): the five size classes plus `ancient` (an Elder with z ≥ 3.2) and `legend`. */
export const PLAY_CLASSES = ['small', 'keeper', 'prize', 'trophy', 'elder', 'ancient'];
/** The class key a fishing:reel / fishing:strike payload plays: `ancient` when flagged, `legend` for a legend. */
export function playClass(p = {}) {
  if (p.legendary || p.sizeClass === 'legend') return 'legend';
  if (p.ancient && (p.sizeClass === 'elder' || !p.sizeClass)) return 'ancient';
  return PLAY_CLASSES.includes(p.sizeClass) ? p.sizeClass : 'keeper';
}
const LADDER = { small: 0.25, keeper: 0.4, prize: 0.6, trophy: 0.9, elder: 1.5, ancient: 2.8, legend: 3.6 };
const LAKE_MULT = { cove: 0.55, mossmere: 1, sporewood: 1.1, glasswater: 1.2, paleabyss: 1.35 };
/**
 * The class length (m) of a hooked fish before the reveal: AUTOFISH.proxy's ladder × the lake (presentLength without its ±6 % z
 * stretch, which only glimpse / leap / scare payloads carry). Never a species' own length.
 */
export function classLength(data, cls, lake = null) {
  const P = data?.AUTOFISH?.proxy;
  const lad = num(P?.ladder?.[cls], LADDER[cls] ?? LADDER.keeper);
  const mult = num(P?.lakeMult?.[lake], LAKE_MULT[lake] ?? 1);
  return lad * mult;
}
const L_MIN = 0.12, L_MAX = 3.9;   // the cove's Small (0.25 × 0.55 − 6 %) … the Pallid Deep's Ancient (2.8 × 1.35 + 6 %)
/** 0 … 1 on a log scale from the smallest class length to the largest: the one number every pitch and weight follows. */
export function lengthK(L) {
  const v = clamp(num(L, 0.4), L_MIN, L_MAX * 1.2);
  return clamp(Math.log(v / L_MIN) / Math.log(L_MAX / L_MIN), 0, 1);
}
const lerp2 = (a, b, k) => a + (b - a) * k;
const tierOf = (t) => clamp(num(t, 0), 0, 4);

/** The reel ratchet: fast and light for a small fish, slow and heavy for a big one; better reels (tier) run smoother. */
export function ratchetParams(k, tier = 0, { lift = false } = {}) {
  const T = tierOf(tier);
  const rate = lerp2(26, 6, k) * (1 + 0.035 * T) * (lift ? 1.3 : 1);   // clicks per second (a Small ≈ 22, an Elder ≈ 11, an Ancient ≈ 8)
  return {
    rate,
    pitch: lerp2(1.35, 0.58, k),                 // the click's resonance (× 3.6 kHz)
    weight: lerp2(0.15, 1, k),                   // the gear body / thump under each click
    grit: clamp(0.85 - 0.18 * T, 0.12, 0.85),    // a T0 winch grinds; a T4 reel purrs
    volume: lerp2(0.55, 0.95, k),
  };
}
/** The strain whine's frequency (Hz): lower for a longer fish, one semitone lower per mean fitted tier (AUTOFISH.play.tackle). */
export const STRAIN_SEMITONES_PER_TIER = -1;
export function strainFreq(k, tier = 0, data = null) {
  const per = num(data?.AUTOFISH?.play?.tackle?.strainPitchPerTier, STRAIN_SEMITONES_PER_TIER);
  return lerp2(1180, 520, k) * Math.pow(2, (per * num(tier, 0)) / 12);
}
/** The hold's one low note (MIDI): lower for bigger fish. */
export function holdMidi(k) { return Math.round(lerp2(57, 31, k)); }
/** The line's hum (Hz): a taut thin line sings higher on a small fish, lower on a big one. */
export function humFreq(k) { return lerp2(330, 78, k); }
/** A splash: pitch falls and weight grows with the class length; strength (0–1) from the beat. */
export function splashParams(k, strength = 0.6) {
  const s = clamp(num(strength, 0.6), 0, 1.5);
  return { pitch: lerp2(1.45, 0.52, k), volume: clamp(lerp2(0.5, 1.05, k) * (0.7 + 0.35 * s), 0.2, 1.4), weight: k };
}
/** The drag hiss of a run: the clicker's buzz (Hz) and the hiss band; a long run (Elder's 4–8 m) peels longer and higher. */
export function hissParams(k, tier = 0, { long = false, scream = false } = {}) {
  const T = tierOf(tier);
  return {
    buzz: lerp2(46, 24, k) * (scream ? 1.45 : long ? 1.15 : 1),
    band: lerp2(3200, 1500, k) * (scream ? 1.25 : 1),
    rise: scream ? 1.9 : long ? 1.6 : 1.35,     // the band climbs by this factor over the run
    body: lerp2(0.1, 0.8, k),
    grit: clamp(0.8 - 0.15 * T, 0.15, 0.8),
  };
}

/**
 * The sounds one fishing:reel beat plays: [{name, delay, dur, opts}] (delay and dur in real seconds; `rate` is the play's speed,
 * 2.5 while a Small / Keeper play is hurried). The phase drives everything; the class length and tier shape it. The loss beat plays
 * nothing here (fishing:escaped carries the cause), and the still is silence (the caller mutes the hum and ducks the score).
 *   {phase, kind, sizeClass, ancient, legendary, length, tier, strength, dur}, data, {lake, rate}
 */
export function beatSounds(p = {}, data = null, { lake = null, rate = 1 } = {}) {
  const cls = playClass(p);
  const L = num(p.length, 0) > 0 ? num(p.length) : classLength(data, cls, lake);
  const k = lengthK(L), tier = tierOf(p.tier);
  const dur = Math.max(0.05, num(p.dur, 0.6) / Math.max(0.2, num(rate, 1)));
  const strength = clamp(num(p.strength, 0.6), 0, 1.5);
  const base = { k, tier, cls, len: Math.round(L * 1000) / 1000, strength, dur };
  const out = [];
  const add = (name, delay, d, extra = {}) => out.push({ name, delay: Math.max(0, delay), dur: Math.max(0.05, d), opts: { ...base, ...extra } });
  switch (p.phase) {
    case 'take': add('reel_take', 0, Math.min(0.9, dur)); break;
    case 'gain': add('reel_ratchet', 0, dur, ratchetParams(k, tier)); break;
    case 'lift': add('reel_ratchet', 0, dur, { ...ratchetParams(k, tier, { lift: true }), lift: true }); break;
    case 'run': add('line_hiss', 0, dur, { ...hissParams(k, tier, { long: p.kind === 'long' }), long: p.kind === 'long', tow: cls === 'trophy' || cls === 'elder' || cls === 'ancient' }); break;
    case 'hold': add('line_hold', 0, dur, { midi: holdMidi(k) }); break;
    case 'surge':
      add('surge_splash', 0, Math.min(1.2, dur), splashParams(k, strength));
      add('strain_whine', 0.04, Math.max(0.35, Math.min(dur, 1.4)), { freq: strainFreq(k, tier, data) });
      break;
    case 'glimpse': add(p.kind === 'skitter' ? 'fish_skitter' : p.kind === 'pass' ? 'fish_pass' : 'fish_roll', 0, dur, { kind: p.kind || 'roll', ...splashParams(k, 0.5) }); break;
    case 'leap': {
      // spray as it clears the water, the slap on the way back in: the airtime follows the arc (skip, leap, breach)
      const air = clamp(dur * (p.kind === 'skip' ? 0.5 : p.kind === 'breach' ? 0.6 : 0.68), 0.18, 1.1);
      add('leap_slap', 0, air + 0.9, { kind: p.kind || 'leap', air, ...splashParams(k, 1) });
      break;
    }
    case 'scare': add('scare_splash', 0, dur, { kind: p.kind || 'slack', slack: clamp(dur * 0.45, 0.2, 0.6), ...splashParams(k, 0.7) }); break;
    case 'lastStand':
      add('reel_scream', 0, dur, hissParams(k, tier, { scream: true }));
      add('strain_whine', 0.1, Math.min(dur, 2.4), { freq: strainFreq(k, tier, data) * 1.06, long: true });
      break;
    case 'place': {
      const kind = p.kind || 'grind';
      if (kind === 'chains') add('foul_clank', 0, dur, { kind });
      else if (kind === 'grind' || kind === 'lilies') add('line_grind', 0, dur, { kind });
      add('reel_ratchet', 0, dur, ratchetParams(k, tier));
      break;
    }
    default: break;   // 'still' (silence), 'loss' (fishing:escaped plays the cause)
  }
  return out;
}
/** Beats whose sound sustains over the beat: the next beat fades them (a ratchet never runs under a run). */
export const SUSTAINED = new Set(['reel_ratchet', 'line_hiss', 'line_hold', 'reel_scream', 'line_grind', 'strain_whine']);

/** fishing:strike {grade} → its sound (Clean: a crisp tock and a rising chime · Struck: tock · Early: a dull tk · Late: a slower thunk). */
export const STRIKE_SFX = Object.freeze({ clean: 'strike_clean', struck: 'strike_struck', early: 'strike_early', late: 'strike_late' });
export function strikeSfx(grade) { return (typeof grade === 'string' && STRIKE_SFX[grade]) || null; }
/** fishing:escaped {reason} (v3 causes) → the loss sound; v1's 'snap' / 'slack' → null (v1 plays its own). */
export const LOSS_SFX = Object.freeze({ snapped: 'loss_snap', thrown: 'loss_thrown', spat: 'loss_spat', spooled: 'loss_spooled', fouled: 'loss_fouled', staggered: 'loss_snap' });
export function lossSfx(reason) { return (typeof reason === 'string' && LOSS_SFX[reason]) || null; }

/**
 * The score during a play, by class (AUTOFISH.play[class].music): a Small keeps the calm bed (reel ticks only), a Keeper adds a soft
 * pulse, Prize / Trophy / Elder play `reel` low / mid / full (the Elder with a low drone), an Ancient adds a heartbeat and 1.5 s of
 * silence for the still; a legend plays the boss mood. mood null = keep the mood the day would play.
 */
const MUSIC_BY_KEY = {
  calm: { mood: null, level: 0, pulse: 0, drone: 0, heart: false },
  calmPulse: { mood: null, level: 0, pulse: 1, drone: 0, heart: false },
  reelLow: { mood: 'reel', level: 0.34, pulse: 0, drone: 0, heart: false },
  reelMid: { mood: 'reel', level: 0.67, pulse: 0, drone: 0, heart: false },
  reelFull: { mood: 'reel', level: 1, pulse: 0, drone: 0.7, heart: false },
  reelHeart: { mood: 'reel', level: 1, pulse: 0, drone: 1, heart: true },
};
const MUSIC_DEFAULT = { small: 'calm', keeper: 'calmPulse', prize: 'reelLow', trophy: 'reelMid', elder: 'reelFull', ancient: 'reelHeart' };
export function playMusic(cls, data = null) {
  if (cls === 'legend') return { mood: 'boss', level: 1, pulse: 0, drone: 0, heart: false, key: 'boss' };
  const key = data?.AUTOFISH?.play?.[cls]?.music || MUSIC_DEFAULT[cls] || 'calm';
  return { ...(MUSIC_BY_KEY[key] || MUSIC_BY_KEY.calm), key };
}
/** The still (Ancient): this many seconds of silence (AUTOFISH.play.beat.still), then the crash. */
export function stillSilence(data) { const s = data?.AUTOFISH?.play?.beat?.still; return Array.isArray(s) ? num(s[0], 1.5) : 1.5; }

// ------------------------------------------------------------------ species voices (only on fishing:caught, §25.6.5)
/** The species that have a voice, and the sound it is (they are silent during the play and sing once at the reveal). */
export const VOICES = Object.freeze({
  harpstring_eel: 'voice_harpstring',    // the Harpstring's hum
  vesper_gar: 'voice_vesper',            // the Vesper Gar's ringing fins
  the_sexton: 'voice_sexton',            // the Sexton's toll
  the_clapper: 'voice_clapper',          // the Clapper's bell
  glassblown_puffer: 'voice_wineglass',  // the Glassblown Puffer's wineglass
  chime_jelly: 'voice_chime',            // the Chime Jelly's chime
});
export function speciesVoice(speciesId) { return (typeof speciesId === 'string' && VOICES[speciesId]) || null; }

// =================================================================== the First Evening and the Landing (DESIGN §25.4.8, FE-Au1)
/**
 * The sting a zone:change plays: `descend` between two lakes (v1 and v3 gate passages), `setout` on every departure from the
 * Landing (prev 'cove', CONTRACT §13.3), nothing entering the hub or on a Continue (the title orbited the cove).
 */
export function zoneSting(p = {}) {
  if (!p || !p.prev) return null;
  if (p.hub) return null;
  if (p.continued) return null;
  return p.prev === 'cove' ? 'setout' : 'descend';
}
/** The cove bed's level by flow: under the title, at the Landing, and under the hearth cut of a snuff. */
export function coveBedLevel(flow, { paused = false } = {}) {
  const base = flow === 'hub' ? 1 : flow === 'title' ? 0.62 : flow === 'dead' ? 0.8 : 0;
  return base * (paused ? 0.55 : 1);
}
function hashStr(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
/**
 * Murk's grumble for one line: a few low pitched syllables (no words), as many as the line is long (2–6), its contour fixed by the
 * line itself (the same line grumbles the same way every time), always ≤ 1.3 s so it sits under the line's first moment.
 * → {dur, syllables: [{t, dur, f0, glide, vowel, gravel}]}
 */
export function grumblePlan(text = '', key = '') {
  const s = String(text || key || '');
  const n = clamp(Math.round(s.length / 15) + 1, 2, 6);
  let h = hashStr(`${key}|${s}`);
  const rnd01 = () => { h = (Math.imul(h ^ (h >>> 15), 2246822519) + 0x9e3779b9) >>> 0; return h / 4294967296; };
  const question = /\?\s*$/.test(s);
  const syl = [];
  let t = 0;
  for (let i = 0; i < n; i++) {
    const last = i === n - 1;
    const d = 0.1 + 0.08 * rnd01() + (last ? 0.07 : 0);
    const f0 = 92 + 26 * rnd01() - (last && !question ? 12 : 0) + (last && question ? 18 : 0);
    syl.push({ t: Math.round(t * 1000) / 1000, dur: Math.round(d * 1000) / 1000, f0: Math.round(f0 * 10) / 10,
      glide: last ? (question ? 1.18 : 0.82) : 0.94 + 0.12 * rnd01(), vowel: (rnd01() * 4) | 0, gravel: 0.3 + 0.5 * rnd01() });
    t += d + 0.025 + 0.05 * rnd01();
    if (t > 1.15) break;
  }
  return { dur: Math.min(1.3, t), syllables: syl };
}
/** The Lantern Line's ember (FIRST_EVENING.ember.at): its one swell, this many seconds into the framing. */
export function emberAt(data) { return num(data?.FIRST_EVENING?.ember?.at, 0.8); }
