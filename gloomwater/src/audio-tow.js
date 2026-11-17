// audio-tow.js — the tow's sounds (M1 step 5b, LANE 5B-TOW; M1.md §2.13: "the tow its sounds (the tow line's creak, the oars, the
// Sluice Run's locks and fall)"; SPEC §6.5: felt, never read). Four voices in the built sfx tables' shape (audio-sfx.js: gain, gap,
// max, pri, wet and fn(v, out, t, p, o) on the voice kit), added to SFX only under the loop (registerTowSfx, from loop-tow.js), so
// the flag-off game's tables are untouched. The mix by ear is step 6's; these sit under the −1.0 dBFS master at the built levels.
import { SFX } from './audio-sfx.js';

const rnd = (a, b) => a + Math.random() * (b - a);
export const SFX_TOW = {
  // two oar strokes: the blade's soft entry, the water off it, a wooden knock in the rowlock
  tow_oars: { gain: 0.42, gap: 0.6, max: 2, pri: 0, wet: 0.35, vj: 0.2, pj: 0.05, fn(v, out, t, p) {
    for (let i = 0; i < 2; i++) {
      const tt = t + i * rnd(0.42, 0.5);
      v.burst(out, { kind: 'pink', t: tt, a: 0.03, hold: 0.06, d: 0.34, peak: 0.2, ft: 'bandpass', f: 900 * p, f2: 520 * p, glide: 0.3, q: 0.8 });
      v.burst(out, { kind: 'white', t: tt + 0.05, a: 0.01, d: 0.22, peak: 0.05, ft: 'bandpass', f: 4200 * p, q: 1.6 });
      v.tone(out, { type: 'triangle', f: 210 * p, f2: 160 * p, glide: 0.05, t: tt + 0.18, a: 0.002, d: 0.07, peak: 0.12 });
    }
  } },
  // the tow line takes the weight: a slow rope creak, a little wood answering it
  tow_creak: { gain: 0.36, gap: 1, max: 1, pri: 0, wet: 0.3, vj: 0.2, pj: 0.06, fn(v, out, t, p) {
    const f = rnd(150, 190) * p;
    v.tone(out, { type: 'sawtooth', f, f2: f * 1.22, glide: 0.5, t, a: 0.12, hold: 0.18, d: 0.3, peak: 0.05 });
    v.burst(out, { kind: 'brown', t, a: 0.1, hold: 0.2, d: 0.35, peak: 0.08, ft: 'bandpass', f: 700 * p, f2: 900 * p, glide: 0.5, q: 2.2 });
  } },
  // a lock flight: the old gate's deep wooden thud, its chain, then the water let through under it
  tow_lock: { gain: 0.6, gap: 1, max: 1, pri: 1, wet: 0.55, dly: 0.12, vj: 0.1, fn(v, out, t, p) {
    v.tone(out, { type: 'sine', f: 62 * p, f2: 44 * p, glide: 0.4, t, a: 0.004, hold: 0.05, d: 0.7, peak: 0.42 });
    v.burst(out, { kind: 'brown', t, a: 0.004, d: 0.25, peak: 0.24, ft: 'lowpass', f: 420 * p, q: 0.7 });
    for (let i = 0; i < 3; i++) { const f = rnd(1800, 2600) * p; v.tone(out, { type: 'triangle', f, f2: f * 0.97, glide: 0.04, t: t + 0.3 + i * 0.09, a: 0.002, d: 0.08, peak: 0.05 }); }
    v.burst(out, { kind: 'pink', t: t + 0.35, a: 0.5, hold: 0.6, d: 0.9, peak: 0.16, ft: 'bandpass', f: 1300 * p, f2: 800 * p, glide: 1.6, q: 0.6 });
  } },
  // the fall: water dropping over the old weir, swelling as they pass it and gone behind them
  tow_fall: { gain: 0.55, gap: 1, max: 1, pri: 1, wet: 0.5, vj: 0.1, fn(v, out, t, p) {
    v.burst(out, { kind: 'pink', t, a: 0.6, hold: 0.5, d: 1.1, peak: 0.24, ft: 'bandpass', f: 1600 * p, f2: 1100 * p, glide: 1.8, q: 0.5 });
    v.burst(out, { kind: 'brown', t: t + 0.1, a: 0.5, hold: 0.4, d: 1.0, peak: 0.2, ft: 'lowpass', f: 260 * p, q: 0.8 });
    v.burst(out, { kind: 'white', t: t + 0.2, a: 0.4, hold: 0.3, d: 0.7, peak: 0.04, ft: 'bandpass', f: 6000 * p, q: 1.2 });
  } },
};
export const TOW_SFX = Object.freeze(Object.keys(SFX_TOW));
/** Add the tow's voices to the built table (idempotent; under the loop only: loop-tow.js calls it when LOOP_ENABLED). */
export function registerTowSfx() {
  for (const k of TOW_SFX) if (!SFX[k]) SFX[k] = SFX_TOW[k];
  return TOW_SFX.slice();
}
