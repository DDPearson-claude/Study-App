// audio-sporewood.js — Sporewood Pools' own sound under the loop (docs/loop/LAKE2.md §3.7, the pattern of audio-mossmere.js). Pure
// rules and the voices' recipes (audio-sfx.js's voice API: v.tone, v.burst, v.osc, v.gain, v.filter): no WebAudio of its own, no state.
// audio.js plays them (its continuous layers, a timer for each voice, the Gill Harp's hum and the Seep's fall as loops) on a trip at
// Sporewood or at home while the barge lies there; tools/audio-render.mjs --set=sporewood renders the same tables offline;
// tools/tests/audio-sporewood.test.mjs proves them. Never off the loop, never on the Mossmere: the Mossmere's sound is as it was.
//
//   the bed by light        late day: the air under the caps, leaves stirring, slow drips from the caps, soft spore pops, a few frog
//                           clicks; dusk: the drips thin, the frogs begin (a loose chorus that builds over the dusk), a low warm drone;
//                           night: the frog chorus full and low, a night insect pulse, the drone deeper
//   the Seep                a 2.5 m fall into the East Pool: its fall (a loop) and the drops at its foot, by distance
//   each place in earshot   the Lullaby's music-box drip, the Gill Harp's one hummed note (felt more than heard), the Veil's whisper,
//                           the Mother's Cup's slow breath; full within 12 m of the place's water, gone past 30 m (the Cup's 14 / 40);
//                           through a standing bank low-passed and quieter, clear once its mist has lifted (audio-mossmere.js's rules)
//   the giant's back        at night: the Harpstring's hum swells (harp_swell, and the hum loop with it); the Puffer: a paper rustle
//   the lily frogs          wild:frogDive {x, z} (a frog plopping off its raft as the raft comes near): frog_plop, by distance
//   the lift, the seal      as built (mist_lift, seal_press: every water's)
//   the music               as built: audio-music.js's `sporewood` theme (home at Sporewood plays its hub mood in that key)
import { mtof } from './audio-dsp.js';
import { mossLight, mossLevel, voiceGain, placeDistance, bankVoice, EARSHOT, voiceSchedule } from './audio-mossmere.js';

export { voiceSchedule };
const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a, b, t) => a + (b - a) * t;
export const WATER = 'sporewood';

/** The evening's light in the bed's words (the Mossmere's rule): the calm is late day, the gloomtide night, any other phase day. */
export const sporeLight = mossLight;
/** Does Sporewood's sound run? Under the loop only: on a trip at Sporewood, or at home while the barge lies there. */
export function sporeOn({ loopOn = false, flow = null, zone = null, outing = null } = {}) {
  if (loopOn !== true || zone !== WATER) return false;
  return flow === 'home' || (flow === 'playing' && outing === 'trip');
}
/** The bed's level: 1 while the evening runs, softer under the pause or a screen, 0 when it is off (the Mossmere's rule). */
export const sporeLevel = mossLevel;

/** The bed's continuous layers: a looped noise or a tone through a filter; `lfo` breathes the filter, `vib` the pitch, `am` the gain
 *  (a pulse: {rate Hz, depth 0..1}). The caps keep the wind off: the air is lower and softer than the Mossmere's open water. */
export const BED_LAYERS = Object.freeze({
  canopy: Object.freeze({ src: 'noise', kind: 'pink', ft: 'bandpass', f: 640, q: 0.9, lfo: Object.freeze({ rate: 0.04, depth: 200 }) }),     // the air under the caps
  leaves: Object.freeze({ src: 'noise', kind: 'pink', ft: 'bandpass', f: 4300, q: 1.6, lfo: Object.freeze({ rate: 0.07, depth: 1000 }) }),   // leaves stirring overhead
  warm:   Object.freeze({ src: 'osc', type: 'sine', f: mtof(46), ft: 'lowpass', ff: 320, q: 0.5, vib: 0.2 }),                               // the dusk's warm drone (B♭2)
  warm2:  Object.freeze({ src: 'osc', type: 'sine', f: mtof(46) * 1.0057, ft: 'lowpass', ff: 320, q: 0.5, vib: 0.2 }),                      // its twin, a slow beat against it
  deep:   Object.freeze({ src: 'osc', type: 'triangle', f: mtof(34), ft: 'lowpass', ff: 180, q: 0.6, vib: 0.3 }),                          // night's deeper drone (B♭1)
  pulse:  Object.freeze({ src: 'noise', kind: 'white', ft: 'bandpass', f: 3500, q: 6, am: Object.freeze({ rate: 7.2, depth: 1 }) }),        // the night insects' pulse
});
/** Each layer's gain by light (under the built water bed, as the Mossmere's: late day and dusk a few dB under night's full chorus). */
export const BED_LEVELS = Object.freeze({
  day:   Object.freeze({ canopy: 0.15, leaves: 0.035, warm: 0, warm2: 0, deep: 0, pulse: 0 }),
  dusk:  Object.freeze({ canopy: 0.09, leaves: 0.016, warm: 0.012, warm2: 0.008, deep: 0, pulse: 0 }),
  night: Object.freeze({ canopy: 0.006, leaves: 0, warm: 0.007, warm2: 0.005, deep: 0.03, pulse: 0.008 }),
});
/** The bed's gains at a light (a fresh object). */
export function bedLevels(light) { return { ...(BED_LEVELS[light] || BED_LEVELS.day) }; }
/** The bed's one-shots by light, each on its own timer: [min, max] s apart, panned up to ±spread. */
export const BED_VOICES = Object.freeze({
  day: Object.freeze({
    drip:  Object.freeze({ sfx: 'spore_drip', every: [1.0, 2.8], volume: 0.85, spread: 0.75 }),   // slow drips from the caps
    pop:   Object.freeze({ sfx: 'spore_pop', every: [4.5, 9.5], volume: 0.7, spread: 0.6 }),      // soft spore pops
    click: Object.freeze({ sfx: 'frog_click', every: [6, 13], volume: 0.65, spread: 0.8 }),      // a few frog clicks from the rafts
  }),
  dusk: Object.freeze({
    drip:  Object.freeze({ sfx: 'spore_drip', every: [3.8, 8], volume: 0.55, spread: 0.75 }),     // the drips thin
  }),
  night: Object.freeze({}),
});
/** The bed's one-shots at a light: [[key, voice], …]. */
export function bedVoices(light) { return Object.entries(BED_VOICES[light] || BED_VOICES.day); }
/** The frog chorus: none by day; at dusk it begins sparse and builds with the dusk's progress k (0..1); at night full and low. */
export const CHORUS = Object.freeze({
  sfx: 'frog_croak', spread: 0.85,
  dusk: Object.freeze({ from: [6, 10], to: [0.9, 2.1], volume: [0.42, 0.75], croaks: [1, 2], pitch: 1 }),
  night: Object.freeze({ every: [0.45, 1.15], volume: 0.95, croaks: [2, 3], pitch: 0.88 }),
});
/** The chorus at a light and the phase's progress k: {every: [min, max] s, volume, croaks: [min, max], pitch} or null (no frogs). */
export function chorus(light, k = 0) {
  if (light === 'night') { const N = CHORUS.night; return { every: N.every.slice(), volume: N.volume, croaks: N.croaks.slice(), pitch: N.pitch }; }
  if (light !== 'dusk') return null;
  const C = CHORUS.dusk, u = Math.pow(clamp01(num(k, 0)), 1.2);
  return { every: [lerp(C.from[0], C.to[0], u), lerp(C.from[1], C.to[1], u)], volume: lerp(C.volume[0], C.volume[1], u), croaks: C.croaks.slice(), pitch: C.pitch };
}

/** Each place's voice: a one-shot every [min, max] s, or (the Gill Harp) a hum of partials, each a loop with a slow sway on its gain.
 *  `earshot` where it carries further than the built 12 / 30 m. */
export const PLACE_VOICES = Object.freeze({
  lullaby:     Object.freeze({ sfx: 'lullaby_drip', every: [3, 5.8], volume: 0.85 }),
  gill_harp:   Object.freeze({ sfx: null, hum: Object.freeze([
    Object.freeze({ type: 'sine', f: mtof(29), ft: 'lowpass', ff: 150, q: 0.7, level: 0.026, vib: 0.12, sway: Object.freeze({ rate: 0.09, depth: 0.35 }) }),       // F1: felt
    Object.freeze({ type: 'triangle', f: mtof(41), ft: 'lowpass', ff: 260, q: 0.9, level: 0.008, vib: 0.25, sway: Object.freeze({ rate: 0.07, depth: 0.45 }) }), // F2: heard
  ]) }),
  veilwater:   Object.freeze({ sfx: 'veil_whisper', every: [3, 6.5], volume: 0.85 }),
  mothers_cup: Object.freeze({ sfx: 'cup_breath', every: [7, 10.5], volume: 0.9, earshot: Object.freeze({ full: 14, gone: 40 }) }),
});
/** The Gill Harp's hum by light: the strings hum always, fullest at night (the Harpstring's lit strings turning under them). */
export function harpLight(light) { return light === 'night' ? 1 : light === 'dusk' ? 0.85 : 0.7; }
/** A place's voice at the raft: {gain, muffle, dist} (gain 0 out of earshot); through its standing bank unless lifted. */
export function placeVoiceAt(id, area, x, z, { lifted = false } = {}) {
  const V = PLACE_VOICES[id], dist = placeDistance(area, x, z), b = bankVoice(lifted);
  return { gain: voiceGain(dist, V?.earshot || EARSHOT) * b.gain, muffle: b.muffle, dist };
}

/** The Seep: a 2.5 m fall into the East Pool from a fern ravine (world-sporewood.js: its foot at about (80.2, −27.6), the water to its
 *  west). Its fall a looped noise by distance; the drops at its foot one-shots. Heard over a seventh of the open water (the East Pool's
 *  north-east), never at Rootfoot Landing (71 m off). */
export const SEEP = Object.freeze({
  x: 79.2, z: -27.6, earshot: Object.freeze({ full: 8, gone: 40 }),
  fall: Object.freeze({ src: 'noise', kind: 'pink', ft: 'bandpass', f: 1250, q: 0.55, lfo: Object.freeze({ rate: 0.27, depth: 380 }), level: 0.16 }),
  drop: Object.freeze({ sfx: 'seep_drop', every: [0.4, 0.95], volume: 1 }),
});
/** The fall by light: a touch softer under the day's air, clearest in the still night (the Mossmere's trickle's rule). */
export function seepLight(light) { return light === 'night' ? 1 : light === 'dusk' ? 0.9 : 0.8; }
/** The Seep at the raft: {gain (0 out of earshot), dist}. */
export function seepAt(x, z, S = SEEP) {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return { gain: 0, dist: Infinity };
  const dist = Math.hypot(x - S.x, z - S.z);
  return { gain: voiceGain(dist, S.earshot), dist };
}

/** The giant's back (world:giantBack {placeId}) at night only (the backs turn in the standing banks on clear nights): the Harpstring's
 *  hum swells (a one-shot and the hum loop × `gain` for `hold` s), the Festival Puffer's globe a paper rustle; another place the roll. */
export const BACKS = Object.freeze({
  gill_harp: Object.freeze({ sfx: 'harp_swell', swell: Object.freeze({ gain: 2.6, hold: 5.5 }) }),
  veilwater: Object.freeze({ sfx: 'puffer_rustle' }),
});
export const BACK_FALLBACK = 'giant_roll';
export const backOn = (phase) => mossLight(phase) === 'night';
/** The back's sound at a place: {sfx, swell|null}. */
export function backVoice(placeId) { const B = BACKS[placeId]; return B ? { sfx: B.sfx, swell: B.swell || null } : { sfx: BACK_FALLBACK, swell: null }; }
/** The back carries as the Mossmere's roll does (a deep sound, through its bank). */
export const BACK_EARSHOT = Object.freeze({ full: 18, gone: 55 });
export const BACK_MUFFLE = 900;

/** A lily frog plopping off its raft (wild:frogDive {x, z}): a small sound, near. → gain 0..1 at the raft. */
export const PLOP = Object.freeze({ sfx: 'frog_plop', volume: 0.8, earshot: Object.freeze({ full: 6, gone: 24 }) });
export function plopGain(p = {}, x = NaN, z = NaN) {
  if (!Number.isFinite(p?.x) || !Number.isFinite(p?.z) || !Number.isFinite(x) || !Number.isFinite(z)) return 0;
  return voiceGain(Math.hypot(p.x - x, p.z - z), PLOP.earshot);
}

// ------------------------------------------------------------------------------------------------------------------------- the voices
const rr = (a, b) => a + (b - a) * Math.random();
/** A voice through a standing bank: low-passed at o.muffle Hz (else as it is). */
function muffled(v, out, o) {
  const m = num(o?.muffle, 0);
  if (!(m > 0)) return out;
  const lp = v.filter('lowpass', m, 0.7); lp.connect(out);
  return lp;
}
/** The Lullaby's notes: a music box tuned to the score's key (B♭, the minor pentatonic over B♭5). */
const LULL = [82, 85, 87, 89, 92, 94, 97];

export const SFX_SPORE = {
  spore_drip: { gain: 0.5, gap: 0.2, max: 3, pri: 0, wet: 0.55, dly: 0.1, pj: 0.12, vj: 0.3, fn(v, out, t, p, o) {
    // a drop off a cap's rim into still water under it: a hollow, low plunk (the cavity closing), a tick at the touch, a little body
    const dst = muffled(v, out, o);
    const drop = (tt, f, k) => {
      v.tone(dst, { type: 'sine', f, f2: f * 2.6, glide: 0.035, t: tt, a: 0.001, d: 0.11, peak: 0.26 * k });
      v.tone(dst, { type: 'sine', f: f * 0.5, f2: f * 0.42, glide: 0.08, t: tt + 0.004, a: 0.002, d: 0.09, peak: 0.08 * k });
      v.burst(dst, { kind: 'white', t: tt, a: 0.001, d: 0.012, peak: 0.05 * k, ft: 'bandpass', f: 3200 * p, q: 1.5 });
    };
    drop(t, rr(520, 900) * p, 1);
    if (Math.random() < 0.35) drop(t + rr(0.2, 0.5), rr(680, 1150) * p, 0.55);
  } },
  spore_pop: { gain: 0.45, gap: 0.5, max: 2, pri: 0, wet: 0.35, vj: 0.3, fn(v, out, t, p, o) {
    // a puffball on the bank lets go: one to three soft pops, then a breath of spore dust drifting off
    const dst = muffled(v, out, o);
    const n = 1 + ((Math.random() * 3) | 0);
    for (let i = 0; i < n; i++) {
      const tt = t + i * rr(0.07, 0.16);
      v.burst(dst, { kind: 'pink', t: tt, a: 0.001, d: 0.02, peak: 0.26 * rr(0.6, 1), ft: 'lowpass', f: rr(900, 1600) * p, q: 0.8 });
      v.tone(dst, { type: 'sine', f: rr(180, 320) * p, f2: 120 * p, glide: 0.03, t: tt, a: 0.001, d: 0.04, peak: 0.14 });
    }
    v.burst(dst, { kind: 'pink', t: t + 0.03, a: 0.04, hold: 0.06, d: 0.4, peak: 0.08, ft: 'bandpass', f: 2200 * p, f2: 1200 * p, glide: 0.45, q: 0.9 });
  } },
  frog_click: { gain: 0.5, gap: 0.3, max: 2, pri: 0, wet: 0.3, pj: 0.1, vj: 0.3, fn(v, out, t, p, o) {
    // a lily frog by day: a few dry clicks from its throat, quick, from a raft somewhere in the cove
    const dst = muffled(v, out, o);
    const n = 2 + ((Math.random() * 3) | 0), f = rr(1800, 2600) * p;
    for (let i = 0; i < n; i++) {
      const tt = t + i * rr(0.05, 0.09);
      v.burst(dst, { kind: 'white', t: tt, a: 0.0008, d: 0.01, peak: 0.28, ft: 'bandpass', f: f * rr(0.95, 1.05), q: 3.5 });
      v.tone(dst, { type: 'triangle', f: rr(420, 620) * p, t: tt, a: 0.001, d: 0.025, peak: 0.08 });
    }
  } },
  frog_croak: { gain: 0.55, gap: 0.12, max: 5, pri: 0, wet: 0.45, pj: 0.08, vj: 0.3, fn(v, out, t, p, o) {
    // one lily frog: a low, round throat-pulse ('grunk'), o.n times (the chorus is many of them, panned round the raft)
    const dst = muffled(v, out, o);
    const n = Math.max(1, Math.min(4, num(o?.n, 1 + ((Math.random() * 2) | 0)) | 0));
    let tt = t;
    const f0 = rr(100, 155) * p, fm = rr(500, 780) * p, rate = rr(15, 23);   // (one frog: its own pitch, throat and pulse)
    for (let i = 0; i < n; i++) {
      const f = f0 * rr(0.97, 1.03), dur = rr(0.16, 0.26), end = tt + dur + 0.08;
      const src = v.osc('sawtooth', f, tt, end);
      src.frequency.setValueAtTime(f, tt); src.frequency.linearRampToValueAtTime(f * 0.92, tt + dur);
      const bp = v.filter('bandpass', fm, 3.2);
      const am = v.gain(0.5);
      const lfo = v.osc('square', rate, tt, end); const lg = v.gain(0.5); lfo.connect(lg); lg.connect(am.gain);
      const env = v.gain(0);
      env.gain.setValueAtTime(0, tt); env.gain.linearRampToValueAtTime(0.16, tt + 0.02); env.gain.setTargetAtTime(0.1, tt + 0.05, 0.04); env.gain.setTargetAtTime(0, tt + dur, 0.03);
      src.connect(bp); bp.connect(am); am.connect(env); env.connect(dst);
      v.tone(dst, { type: 'sine', f: f * 0.5, t: tt, a: 0.02, hold: dur * 0.4, d: dur * 0.6, peak: 0.05 });
      tt += dur + rr(0.12, 0.26);
    }
  } },
  frog_plop: { gain: 0.6, gap: 0.15, max: 3, pri: 0, wet: 0.3, pj: 0.1, vj: 0.2, fn(v, out, t, p, o) {
    // a lily frog off its raft: a little plip as it goes in, the round bloop of the water closing over it, a drop or two
    const dst = muffled(v, out, o);
    const f = rr(380, 560) * p;
    v.burst(dst, { kind: 'white', t, a: 0.001, d: 0.03, peak: 0.08, ft: 'bandpass', f: 2600 * p, q: 1.4 });
    v.tone(dst, { type: 'sine', f, f2: f * 2.2, glide: 0.03, t: t + 0.01, a: 0.001, d: 0.07, peak: 0.3 });
    v.tone(dst, { type: 'sine', f: f * 0.55, f2: f * 0.4, glide: 0.06, t: t + 0.012, a: 0.002, d: 0.08, peak: 0.1 });
    for (let i = 0, k = 1 + ((Math.random() * 2) | 0); i < k; i++) { const g = rr(1300, 2200) * p; v.tone(dst, { type: 'sine', f: g, f2: g * 1.7, glide: 0.02, t: t + rr(0.1, 0.25), a: 0.001, d: 0.04, peak: 0.07 }); }
  } },
  lullaby_drip: { gain: 0.5, gap: 1.5, max: 2, pri: 0, wet: 0.65, dly: 0.2, pj: 0.002, vj: 0.15, fn(v, out, t, p, o) {
    // the Lullaby: drips off the lily rafts that fall on the notes of a music box (a tine's tone, its quick high partial, a click),
    // two to four notes of a slow falling figure in the score's key, sometimes a real drip into the water after
    const dst = muffled(v, out, o);
    let i = 2 + ((Math.random() * 4) | 0), tt = t;
    const n = 2 + ((Math.random() * 3) | 0);
    for (let k = 0; k < n; k++) {
      const f = mtof(LULL[i]) * p, a = 1 - k * 0.12;
      v.tone(dst, { type: 'sine', f, t: tt, a: 0.001, d: 1.1, peak: 0.17 * a });
      v.tone(dst, { type: 'sine', f: f * 3.01, t: tt, a: 0.001, d: 0.22, peak: 0.05 * a });
      v.tone(dst, { type: 'sine', f: f * 5.2, t: tt, a: 0.0005, d: 0.05, peak: 0.02 * a });
      const step = [-1, -1, -2, 1][(Math.random() * 4) | 0];
      i = Math.max(0, Math.min(LULL.length - 1, i + step));
      tt += rr(0.42, 0.58) * (1 + k * 0.08);
    }
    if (Math.random() < 0.5) { const f = rr(1300, 2100) * p; v.tone(dst, { type: 'sine', f, f2: f * 1.9, glide: 0.025, t: tt + rr(0.1, 0.4), a: 0.001, d: 0.06, peak: 0.14 }); }
  } },
  veil_whisper: { gain: 1, gap: 1.2, max: 2, pri: 0, wet: 0.45, pj: 0.05, vj: 0.2, fn(v, out, t, p, o) {
    // the Veil's whisper: the draught off the backwater through the moss curtain, its strands brushing (a flutter in the hush) and
    // now and then one ticking against another
    const dst = muffled(v, out, o);
    const dur = rr(1.4, 2.2), end = t + dur * 1.3 + 0.3;
    const hp = v.filter('highpass', 900, 0.7); hp.connect(dst);   // (a whisper: nothing of the pink noise's low end)
    const trem = v.gain(0.55); trem.connect(hp);
    const lfo = v.osc('sine', rr(3.5, 5.5), t, end); const lg = v.gain(0.45); lfo.connect(lg); lg.connect(trem.gain);
    v.burst(trem, { kind: 'pink', t, a: dur * 0.45, hold: dur * 0.15, d: dur * 0.55, peak: 0.4, ft: 'bandpass', f: rr(2600, 3400) * p, f2: rr(3800, 4800) * p, glide: dur * 0.6, q: 0.9 });
    v.burst(dst, { kind: 'white', t: t + dur * 0.3, a: dur * 0.3, d: dur * 0.5, peak: 0.075, ft: 'highpass', f: 6500, q: 0.7 });
    for (let i = 0, k = 2 + ((Math.random() * 2) | 0); i < k; i++) v.burst(dst, { kind: 'white', t: t + rr(0.2, dur), a: 0.0008, d: 0.008, peak: 0.12, ft: 'bandpass', f: rr(4600, 5800) * p, q: 2.5 });
  } },
  cup_breath: { gain: 0.6, gap: 3, max: 1, pri: 0, wet: 0.6, dly: 0.1, pj: 0.03, vj: 0.15, fn(v, out, t, p, o) {
    // the Mother's Cup: the sinkhole breathes, a slow rise and fall of air through the well under the Mother Cap, a hollow note
    // under it, and a few slow bubbles out of the deep as it breathes out (big things breathe with her)
    const dst = muffled(v, out, o);
    const inh = rr(1.8, 2.4), exh = rr(2.4, 3.2);
    v.burst(dst, { kind: 'pink', t, a: inh, d: 0.6, peak: 0.14, ft: 'bandpass', f: 380 * p, f2: 760 * p, glide: inh, q: 1.1 });
    v.burst(dst, { kind: 'pink', t: t + inh * 0.9, a: 0.4, hold: exh * 0.3, d: exh * 0.7, peak: 0.16, ft: 'bandpass', f: 720 * p, f2: 300 * p, glide: exh, q: 1 });
    v.tone(dst, { type: 'sine', f: 49 * p, f2: 58 * p, glide: inh, t, a: inh, hold: 0.3, d: exh, peak: 0.12 });
    v.tone(dst, { type: 'triangle', f: 98 * p, f2: 116 * p, glide: inh, t, a: inh, hold: 0.3, d: exh, peak: 0.03, ft: 'lowpass', ff: 260 });
    for (let i = 0, k = 3 + ((Math.random() * 3) | 0); i < k; i++) { const f = rr(170, 360) * p; v.tone(dst, { type: 'sine', f, f2: f * 1.9, glide: 0.05, t: t + inh + exh * rr(0.2, 0.75), a: 0.002, d: 0.07, peak: 0.06 }); }
  } },
  seep_drop: { gain: 0.45, gap: 0.2, max: 3, pri: 0, wet: 0.4, pj: 0.1, vj: 0.25, fn(v, out, t, p) {
    // the Seep's foot: water off the lip breaking on the pool, a short splash of white water and a few bright drops
    v.burst(out, { kind: 'white', t, a: 0.01, hold: 0.05, d: 0.18, peak: 0.05, ft: 'bandpass', f: rr(1800, 3000) * p, q: 1 });
    for (let i = 0, k = 2 + ((Math.random() * 3) | 0); i < k; i++) { const f = rr(700, 1500) * p; v.tone(out, { type: 'sine', f, f2: f * 1.6, glide: 0.03, t: t + rr(0, 0.3), a: 0.001, d: 0.06, peak: 0.12 * rr(0.5, 1) }); }
  } },
  harp_swell: { gain: 1, gap: 4, max: 1, pri: 2, wet: 0.6, dly: 0.15, pj: 0.002, fn(v, out, t, p, o) {
    // the Harpstring's back under the neck: the Gill Harp's one note swells, its strings singing with it (F1, F2, C3, F3), the
    // brightness opening and closing as the lit strings turn
    const dst = muffled(v, out, o);
    const sw = 1.6, hold = 1.2, rel = 2.8, end = t + sw + hold + rel + 0.1;
    const lp = v.filter('lowpass', 200, 1.1); lp.connect(dst);
    lp.frequency.setValueAtTime(200, t); lp.frequency.linearRampToValueAtTime(900, t + sw + hold * 0.5); lp.frequency.linearRampToValueAtTime(220, t + sw + hold + rel);
    for (const [m, a, type] of [[29, 0.2, 'triangle'], [41, 0.12, 'triangle'], [48, 0.06, 'sine'], [53, 0.04, 'sine']]) {
      const s = v.osc(type, mtof(m) * p, t, end), g = v.gain(0);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + sw); g.gain.setValueAtTime(a, t + sw + hold); g.gain.linearRampToValueAtTime(0, t + sw + hold + rel);
      s.connect(g); g.connect(lp);
    }
    v.tone(dst, { type: 'sawtooth', f: mtof(41) * p, t: t + 0.3, a: sw, hold: hold * 0.6, d: rel * 0.8, peak: 0.025, ft: 'bandpass', ff: 520, fq: 2.5 });
  } },
  puffer_rustle: { gain: 1, gap: 4, max: 1, pri: 2, wet: 0.4, pj: 0.05, fn(v, out, t, p, o) {
    // the Festival Puffer's back under the Veil: its paper lantern of a body filling, a dry rustle swelling and settling, the air
    // drawn in, a soft low bloop as it rolls back down
    const dst = muffled(v, out, o);
    const dur = rr(0.9, 1.3), n = 22 + ((Math.random() * 10) | 0);
    for (let k = 0; k < n; k++) {
      const u = k / n, tt = t + dur * Math.pow(u, 0.8) * rr(0.92, 1.08);
      v.burst(dst, { kind: 'white', t: tt, a: 0.0008, d: rr(0.006, 0.02), peak: 0.16 * rr(0.4, 1) * Math.sin(Math.PI * (0.15 + 0.85 * u)), ft: 'bandpass', f: rr(2800, 7200) * p, q: rr(1.2, 2.4) });
    }
    v.burst(dst, { kind: 'pink', t, a: dur * 0.6, d: 0.5, peak: 0.12, ft: 'bandpass', f: 600 * p, f2: 1500 * p, glide: dur, q: 0.9 });
    v.tone(dst, { type: 'sine', f: 150 * p, f2: 110 * p, glide: 0.25, t: t + dur, a: 0.01, d: 0.3, peak: 0.2 });
  } },
};
export const SPORE_SFX = Object.freeze(Object.keys(SFX_SPORE));
