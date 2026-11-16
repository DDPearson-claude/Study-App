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
export const BED_LEVELS = Object.freeze({
  day:   { air: 0.016, reeds: 0.010, low: 0.000, tone: 0.000, tone2: 0.000 },
  dusk:  { air: 0.009, reeds: 0.006, low: 0.010, tone: 0.004, tone2: 0.000 },
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
