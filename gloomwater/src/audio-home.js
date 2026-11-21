// audio-home.js — M1 step 5b (lane 5b-home): home's sound on the barge (docs/loop/M1.md §2.13: "Home has its bed (the stove, water
// against the hulls, a far bell; Murk's hand bell is the sound of home)"; SPEC §6.1). Pure rules and the voices' recipes: no state.
// audio.js plays them (one stove loop and a timer for each voice) only under the loop, in flow 'home', over the Mossmere's own bed;
// tools/tests/loop-5b.test.mjs proves the rules. Never off the loop: the v3 beds are unchanged.
//
//   homeOn({loopOn, flow})      home's bed runs: under the loop, at home only (the evening keeps the Mossmere's bed alone)
//   HOME_BED                    the stove's banked roar (a looped noise through a low-pass) and its level
//   HOME_VOICES                 the one-shots now and then: the stove's crackle, water against the hulls, a far bell, Murk's hand bell
//   SFX_HOME                    their recipes (audio-sfx.js's voice API: v.burst, v.tone), registered by audio.js the first time home sounds
const rnd = (a, b) => a + Math.random() * (b - a);

/** Home's bed runs under the loop at home only. */
export function homeOn({ loopOn = false, flow = null } = {}) { return loopOn === true && flow === 'home'; }
/** Its level: full while home is up, softer under a screen (the shelf, the Chart, the Journal, the gallery), 0 otherwise. */
export function homeLevel(on, { blocking = false, paused = false } = {}) { return on ? (blocking || paused ? 0.6 : 1) : 0; }

/** The stove's banked roar (brown noise, low-passed), at its gain under the built beds. */
export const HOME_BED = Object.freeze({ stove: { kind: 'brown', ft: 'lowpass', f: 240, q: 0.7, level: 0.03 } });
/** The voices, each [min, max] s apart; `at`: where it sounds ('stove' the cabin door, 'hull' the barge's side, 'murk' his barge,
 *  'far' out over the water, unpanned). */
export const HOME_VOICES = Object.freeze({
  stove:    { sfx: 'home_crackle', every: [0.9, 2.6], volume: 0.7, at: 'stove' },
  hull:     { sfx: 'home_lap', every: [1.8, 4.2], volume: 0.75, at: 'hull' },
  farBell:  { sfx: 'home_far_bell', every: [22, 40], volume: 0.6, at: 'far', first: 6 },
  handBell: { sfx: 'merchant_bell', every: [34, 70], volume: 0.32, at: 'murk', first: 3 },   // Murk's hand bell: the built bell, softly
});

function crackle(v, out, t, peak) {
  for (let i = 0, n = 1 + ((Math.random() * 3) | 0); i < n; i++) {
    const tt = t + i * rnd(0.03, 0.16);
    v.burst(out, { kind: 'white', t: tt, a: 0.001, d: rnd(0.012, 0.04), peak: peak * rnd(0.5, 1), ft: 'bandpass', f: rnd(1800, 4200), q: 1.3 });
  }
}
export const SFX_HOME = {
  home_crackle: { gain: 0.32, gap: 0.3, max: 2, pri: 0, wet: 0.2, vj: 0.3, fn(v, out, t, p) {
    // the stove's banked fire: a few dry crackles, and now and then a log settling
    crackle(v, out, t, 0.3);
    if (Math.random() < 0.25) v.burst(out, { kind: 'brown', t: t + rnd(0.1, 0.4), a: 0.01, d: 0.25, peak: 0.25, ft: 'lowpass', f: 180 * p, q: 0.8 });
  } },
  home_lap: { gain: 0.42, gap: 0.8, max: 2, pri: 0, wet: 0.35, vj: 0.25, fn(v, out, t, p) {
    // water against the hulls: a slow slap and its suck back, low, with a small hollow knock of the planks
    v.burst(out, { kind: 'pink', t, a: 0.12, hold: 0.06, d: 0.5, peak: 0.26, ft: 'lowpass', f: 620 * p, f2: 380 * p, glide: 0.5, q: 0.8 });
    v.burst(out, { kind: 'pink', t: t + 0.35, a: 0.2, d: 0.6, peak: 0.1, ft: 'bandpass', f: 1300 * p, q: 0.9 });
    if (Math.random() < 0.4) v.tone(out, { type: 'sine', f: 190 * p, f2: 160 * p, glide: 0.1, t: t + 0.05, a: 0.003, d: 0.16, peak: 0.12 });
  } },
  home_far_bell: { gain: 0.38, gap: 8, max: 1, pri: 1, wet: 0.85, dly: 0.25, pj: 0.01, fn(v, out, t, p) {
    // a far bell across the water at first light: a bell's partials, softened by the distance
    const lp = v.filter('lowpass', 1600, 0.5); lp.connect(out);
    const f = 392 * p;
    for (const [r, d, a] of [[1, 4.2, 0.55], [2.0, 2.6, 0.22], [2.76, 1.6, 0.14], [5.4, 0.7, 0.05]]) v.tone(lp, { type: 'sine', f: f * r, t, a: 0.004, d, peak: 0.3 * a });
  } },
};
export const HOME_SFX = Object.keys(SFX_HOME);
