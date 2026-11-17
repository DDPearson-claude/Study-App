// audio-mossmere.js — the Mossmere's own sound under the loop (docs/loop/m1-step3a/PLAN.md §2.2 item 7; M1 §2.13; PLAN CHOICEs
// 10, 17, 18). Pure rules: no WebAudio, no state. audio.js plays them (its continuous layers and the voices of audio-sfx.js's
// SFX_MOSS); tools/audio-render.mjs --set=mossmere renders the same tables offline; tools/tests/audio-mossmere.test.mjs proves them.
//
//   the bed by light        late day ('day': the evening's calm): the water's air and the reeds; dusk: the air thinner, the first
//                           low tone under it; night: the mere's low tones (the built Stillnight bed keeps its frogs and crickets)
//   each place in earshot   the Lily Maze's drip and sip, the chains under the Span, the Buoy Lights' low hum, the Bell Pool's far
//                           toll now and then; full within 12 m of the place's water, gone past 30 m
//   a standing bank         its place's voice low-passed and quieter (the mist muffles it); clear once its mist has lifted
//   the giant's back        a deep roll on world:giantBack, at night only (the back turns only on clear nights: PLAN CHOICE 10)
//   the lift, the seal      mist_lift on place:lift {phase: 'start'}; seal_press on loop:seal {seal: 'catch'}
//   the music               as built (PLAN CHOICE 17): the show's music by class, the evening's score otherwise; nothing here
//                           chooses a mood
// It runs only under the loop, on a trip on the Mossmere or at home (flow 'home'), never off the loop: the v3 beds are unchanged.

const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** The evening's light in the bed's words: the calm is late day, the gloomtide night (dawn and any other phase: day). */
export function mossLight(phase) { return phase === 'dusk' ? 'dusk' : phase === 'gloomtide' || phase === 'night' ? 'night' : 'day'; }

/** Does the Mossmere's sound run? Under the loop only: on a trip on the Mossmere, or at home (the Jetty is on the Mossmere). */
export function mossOn({ loopOn = false, flow = null, zone = null, outing = null } = {}) {
  if (loopOn !== true) return false;
  if (flow === 'home') return true;
  return flow === 'playing' && outing === 'trip' && (zone === 'mossmere' || zone == null);
}
/** The bed's level: 1 while the evening runs, softer under the pause or a screen (as the Stillnight bed), 0 when it is off. */
export function mossLevel(on, { paused = false, blocking = false } = {}) { return on ? (paused || blocking ? 0.5 : 1) : 0; }

/** The bed's continuous layers (each a looped noise or a tone through a filter; an LFO on the filter where it breathes). */
export const BED_LAYERS = Object.freeze({
  air:   { src: 'noise', kind: 'pink', ft: 'bandpass', f: 1900, q: 0.8, lfo: { rate: 0.05, depth: 600 } },   // the water's air
  reeds: { src: 'noise', kind: 'pink', ft: 'bandpass', f: 5200, q: 2, lfo: { rate: 0.11, depth: 1100 } },  // reeds stirring
  low:   { src: 'noise', kind: 'brown', ft: 'lowpass', f: 150, q: 0.7, lfo: { rate: 0.03, depth: 40 } },     // the mere's breath
  tone:  { src: 'osc', type: 'triangle', f: 55, ft: 'lowpass', ff: 190, q: 0.6, vib: 0.4 },                  // night's low tone (A1)
  tone2: { src: 'osc', type: 'sine', f: 82.4, ft: 'lowpass', ff: 220, q: 0.6, vib: 0.3 },                    // and its fifth (E2)
});
/** Each layer's gain by light (the master and the SFX bus come after: these sit under the built water bed, 0.022 … 0.11). */
// (the fix pass: late day and dusk sat 16–19 dB under night, the place's own sound all but silent for the first minute of every trip,
// the lift's included; they now sit about 5 dB under night, their character kept: day the air and the reeds, dusk thinner with the
// first low tone under it)
export const BED_LEVELS = Object.freeze({
  day:   { air: 0.15, reeds: 0.09, low: 0.000, tone: 0.000, tone2: 0.000 },
  dusk:  { air: 0.1, reeds: 0.06, low: 0.022, tone: 0.009, tone2: 0.000 },
  night: { air: 0.004, reeds: 0.003, low: 0.026, tone: 0.011, tone2: 0.006 },
});
/** The bed's gains at a light: {air, reeds, low, tone, tone2} (a fresh object). */
export function bedLevels(light) { return { ...(BED_LEVELS[light] || BED_LEVELS.day) }; }
/** The bed's breaths: one SFX now and then by light, [min, max] s apart. */
export const BED_BREATHS = Object.freeze({
  day: { sfx: 'moss_breeze', every: [5, 9], volume: 0.8 },
  dusk: { sfx: 'moss_dusk', every: [4, 8], volume: 0.75 },
  night: { sfx: 'moss_night', every: [6, 11], volume: 0.85 },
});
export function bedBreath(light) { return BED_BREATHS[light] || BED_BREATHS.day; }

/** Each place's voice: a one-shot every [min, max] s, or a hum (the Buoy Lights) with a knock now and then. */
export const PLACE_VOICES = Object.freeze({
  lily_maze:      { sfx: 'moss_lily', every: [2.4, 5], volume: 0.9 },
  under_the_span: { sfx: 'moss_chain', every: [3, 6.5], volume: 0.85 },
  buoy_lights:    { sfx: 'moss_buoy', every: [7, 12], volume: 0.7, hum: { type: 'triangle', f: 58, ft: 'lowpass', ff: 260, q: 0.8, level: 0.03, vib: 0.6 } },
  bell_pool:      { sfx: 'moss_toll', every: [18, 32], volume: 0.9 },
  veilback_brook: { sfx: 'moss_lily', every: [4, 8], volume: 0.6 },   // (LOST-TACKLE §5: a lily bed's soft knock in the still brook)
});
/** The Buoy Lights hum at night (its lamps are lit); by day and dusk softer. */
export function humLight(light) { return light === 'night' ? 1 : light === 'dusk' ? 0.6 : 0.4; }
/** Earshot: full within `full` m of a place's water, gone past `gone` m (smoothstep between). */
export const EARSHOT = Object.freeze({ full: 12, gone: 30 });
export function voiceGain(dist, E = EARSHOT) {
  const d = num(dist, Infinity);
  if (d <= E.full) return 1;
  if (d >= E.gone) return 0;
  const u = 1 - (d - E.full) / (E.gone - E.full);
  return u * u * (3 - 2 * u);
}
/** A place's voice through its bank: clear once lifted; in a standing bank low-passed and quieter. */
export const BANK = Object.freeze({ gain: 0.45, lowpass: 1100 });
export function bankVoice(lifted) { return lifted ? { gain: 1, muffle: 0 } : { gain: BANK.gain, muffle: BANK.lowpass }; }

/** The distance (m) from a point to a place's water (its footprint: disc, rect, path), 0 inside. */
export function placeDistance(area, x, z) {
  if (!area || !Number.isFinite(x) || !Number.isFinite(z)) return Infinity;
  if (area.kind === 'disc') return Math.max(0, Math.hypot(x - area.x, z - area.z) - num(area.r, 0));
  if (area.kind === 'rect') {
    const dx = Math.max(0, Math.abs(x - area.x) - num(area.w, 0) / 2), dz = Math.max(0, Math.abs(z - area.z) - num(area.d, 0) / 2);
    return Math.hypot(dx, dz);
  }
  if (area.kind === 'path' && Array.isArray(area.pts) && area.pts.length) {
    const P = area.pts;
    let best = P.length === 1 ? Math.hypot(x - P[0][0], z - P[0][1]) : Infinity;
    for (let i = 0; i + 1 < P.length; i++) {
      const a = P[i], b = P[i + 1], vx = b[0] - a[0], vz = b[1] - a[1], L2 = vx * vx + vz * vz;
      const t = L2 > 0 ? clamp01(((x - a[0]) * vx + (z - a[1]) * vz) / L2) : 0;
      best = Math.min(best, Math.hypot(x - (a[0] + vx * t), z - (a[1] + vz * t)));
    }
    return Math.max(0, best - num(area.w, 0) / 2);
  }
  return Number.isFinite(area.x) ? Math.max(0, Math.hypot(x - area.x, z - area.z) - num(area.r, 0)) : Infinity;
}
/** A place's voice at the raft: {gain, muffle, dist} (gain 0 out of earshot). lifted: its mist has lifted (else a bank). */
export function placeVoiceAt(area, x, z, { lifted = false } = {}) {
  const dist = placeDistance(area, x, z), b = bankVoice(lifted);
  return { gain: voiceGain(dist) * b.gain, muffle: b.muffle, dist };
}

/** The giant's back rolls only at night (the docs' "clear nights", PLAN CHOICE 10): its deep roll is heard then. */
export function giantRollOn(phase) { return mossLight(phase) === 'night'; }
/** The roll carries further than a place's voice (a deep sound), and comes through the bank it turns in, low-passed. */
export const ROLL_EARSHOT = Object.freeze({ full: 18, gone: 55 });
export const ROLL_MUFFLE = 900;
/** The one-shots on events: the giant's back, the lift's start, the catch seal's press. */
export const MOSS_EVENTS = Object.freeze({ giantBack: 'giant_roll', liftStart: 'mist_lift', seal: 'seal_press' });
/** The music rule (PLAN CHOICE 17): as built. Returns the mood it is given (the Mossmere's sound never picks one). */
export function mossMusic(mood) { return mood; }

/** A seeded schedule of a voice's one-shots over `dur` s: [t, …] from its every [min, max] (the offline render's, and the tests'). */
export function voiceSchedule(every, dur, rng = Math.random, first = 0.35) {
  const [a, b] = Array.isArray(every) ? every : [3, 6];
  const out = [];
  for (let t = first; t < dur; t += a + (b - a) * rng()) out.push(Math.round(t * 1000) / 1000);
  return out;
}

// >>> WC-3 (docs/loop/WATERCRAFT.md §5.4, §5.6, §5.7, §9.4 item 5): the water's own voices on the Mossmere under the loop. Pure rules
// and recipes (audio-sfx.js's voice API, v.burst / v.tone, as audio-home.js's): audio.js registers SFX_WC the first time the
// Mossmere sounds, and plays them. Night is read by ear: the inflow's trickle, the stems' rustle; the legend's toll from below.
//   WATER_VOICES       the inflow's trickle under the Sluice Veil: a few small drips and a hiss of moving water, spatial, by distance
//   stemsRustle(p)     a sign:spawn of the stems tell (WC-2's kind 'stems'): the reeds knock and rustle where it plays
//   TOLL / tollOn(p)   the Belled Matriarch takes (fishing:bite {legendary, speciesId}): one low toll from the Bell Pool's floor
//   comebackQuiet(o)   Ashwick's comeback settling on the float makes no sound on the Mossmere under the loop (a surprise, §7)
export const WATER_VOICES = Object.freeze({
  inflow: { x: 57, z: 4, sfx: 'moss_trickle', every: [0.5, 1.15], volume: 0.62, earshot: Object.freeze({ full: 7, gone: 34 }) },
  // (LOST-TACKLE §5.3: the same trickle where the culvert spills at the head of Veilback Brook; heard only inside the cut)
  culvert: { x: 77.4, z: 5.3, sfx: 'moss_trickle', every: [0.45, 1.0], volume: 0.5, earshot: Object.freeze({ full: 5, gone: 20 }) },
});
/** The Sail's glide through the Sluice Veil (place:veil): a big splash and the falling water loud for a moment (LOST-TACKLE §5.2). */
export const VEIL_PASS = Object.freeze({ sfx: 'splash_big', volume: 0.7, pitch: 0.82, at: 2.6, trickles: 3 });
/** The trickle carries further by ear at night (the air is still) and is a touch softer under the day's breeze. */
export function trickleLight(light) { return light === 'night' ? 1 : light === 'dusk' ? 0.9 : 0.78; }
/** A water voice at the raft: its gain (0 out of earshot) and its distance. */
export function waterVoiceAt(V, x, z) {
  if (!V || !Number.isFinite(x) || !Number.isFinite(z)) return { gain: 0, dist: Infinity };
  const dist = Math.hypot(x - V.x, z - V.z);
  return { gain: voiceGain(dist, V.earshot || EARSHOT), dist };
}
export const STEMS = Object.freeze({ sfx: 'moss_rustle', volume: 0.75, kind: 'stems', earshot: Object.freeze({ full: 14, gone: 40 }) });
/** Does a sign:spawn play the stems' rustle (the stems tell's kind), and how loud at the raft? → gain 0..1 (0: no sound). */
export function stemsRustle(p = {}, x = NaN, z = NaN) {
  if (!p || p.kind !== STEMS.kind) return 0;
  if (!Number.isFinite(p.x) || !Number.isFinite(p.z) || !Number.isFinite(x) || !Number.isFinite(z)) return 1;
  return voiceGain(Math.hypot(p.x - x, p.z - z), STEMS.earshot);
}
export const CROAK = Object.freeze({ sfx: 'heron_croak', volume: 0.8, earshot: Object.freeze({ full: 12, gone: 50 }) });
/** The heron's croak as it lifts (heron:lift {x, z}), by distance from the raft: 0..1. */
export function croakGain(p = {}, x = NaN, z = NaN) {
  if (!Number.isFinite(p?.x) || !Number.isFinite(p?.z) || !Number.isFinite(x) || !Number.isFinite(z)) return 1;
  return voiceGain(Math.hypot(p.x - x, p.z - z), CROAK.earshot);
}
export const TOLL = Object.freeze({ sfx: 'moss_toll', pitch: 0.62, volume: 1, place: 'bell_pool', legend: 'belled_matriarch' });
/** The low toll as she takes: a legend's bite of the Belled Matriarch (the only species fishing names at a bite: CONTRACT §13.5). */
export function tollOn(p = {}) { return !!p && p.legendary === true && p.speciesId === TOLL.legend; }
/** Ashwick's comeback: no ember hiss on the Mossmere under the loop (the flag-off game and other waters keep it). */
export function comebackQuiet({ loopOn = false, zone = null } = {}) { return loopOn === true && (zone == null || zone === 'mossmere'); }

const rr = (a, b) => a + (b - a) * Math.random();
export const SFX_WC = {
  moss_trickle: { gain: 0.4, gap: 0.3, max: 2, pri: 0, wet: 0.35, pj: 0.08, vj: 0.25, fn(v, out, t, p) {
    // the inflow: water running in over gravel under the Veil's spill: a short hiss of moving water and two or three small drips
    v.burst(out, { kind: 'white', t, a: 0.05, hold: 0.12, d: 0.35, peak: 0.07, ft: 'bandpass', f: rr(2400, 3600) * p, f2: rr(1800, 2600) * p, glide: 0.4, q: 1.3 });
    const n = 2 + ((Math.random() * 2) | 0);
    for (let i = 0; i < n; i++) { const f = rr(1100, 2300) * p; v.tone(out, { type: 'sine', f, f2: f * 1.7, glide: 0.02, t: t + rr(0, 0.45), a: 0.001, d: 0.05, peak: 0.14 * rr(0.5, 1) }); }
  } },
  heron_croak: { gain: 0.55, gap: 1.5, max: 1, pri: 1, wet: 0.5, dly: 0.12, pj: 0.04, fn(v, out, t, p) {
    // the heron lifting off: a harsh, dry 'fraank', and the slow first beats of its wings
    const end = t + 0.32, f = 330 * p;
    const src = v.osc('sawtooth', f, t, end), bp = v.filter('bandpass', 1150 * p, 2.4), env = v.gain(0);
    env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(0.2, t + 0.03); env.gain.setTargetAtTime(0.12, t + 0.08, 0.05); env.gain.setTargetAtTime(0, t + 0.22, 0.04);
    src.frequency.setValueAtTime(f, t); src.frequency.linearRampToValueAtTime(f * 0.72, end);
    src.connect(bp); bp.connect(env); env.connect(out);
    v.burst(out, { kind: 'white', t, a: 0.01, hold: 0.18, d: 0.12, peak: 0.05, ft: 'bandpass', f: 2600 * p, q: 1.4 });
    for (let i = 0; i < 3; i++) v.burst(out, { kind: 'pink', t: t + 0.35 + i * 0.42, a: 0.06, d: 0.22, peak: 0.07 * (1 - i * 0.25), ft: 'lowpass', f: 700 * p, q: 0.8 });
  } },
  moss_rustle: { gain: 0.5, gap: 0.6, max: 2, pri: 0, wet: 0.3, vj: 0.2, fn(v, out, t, p) {
    // the stems: something big knocks the reed stems under water; their heads rattle dry against each other above it
    const n = 3 + ((Math.random() * 3) | 0);
    for (let i = 0; i < n; i++) v.burst(out, { kind: 'white', t: t + i * rr(0.05, 0.12), a: 0.008, d: rr(0.06, 0.14), peak: 0.09 * rr(0.6, 1), ft: 'bandpass', f: rr(3800, 6400) * p, q: 2.2 });
    v.burst(out, { kind: 'pink', t: t + 0.02, a: 0.05, hold: 0.08, d: 0.4, peak: 0.07, ft: 'bandpass', f: 1500 * p, q: 0.9 });
    v.tone(out, { type: 'sine', f: 180 * p, f2: 140 * p, glide: 0.08, t, a: 0.004, d: 0.12, peak: 0.06 });
  } },
};
export const WC_SFX = Object.keys(SFX_WC);
// <<< WC-3
