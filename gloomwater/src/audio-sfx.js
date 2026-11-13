// audio-sfx.js — every GLOOMWATER sound effect, synthesised. Each entry:
//   { fn(v, out, t, p, o, eng), gain, wet, dly, gap /*min s between plays*/, max /*concurrent*/,
//     pri /*0 low … 3 critical*/, pj /*pitch jitter*/, vj /*volume jitter*/, duck:[amount, seconds] }
// fn builds sources into `out` (an envelope/pan chain owned by the voice); t = start time,
// p = pitch multiplier (already jittered), o = caller options.
import { mtof, clamp, rnd, envSwell } from './audio-dsp.js';
import { SFX_AF, SFX_FE } from './audio-af.js';

const PENTA = [0, 2, 4, 7, 9];
const pent = (i) => PENTA[((i % 5) + 5) % 5] + 12 * Math.floor(i / 5);
const num0 = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

function chime(v, out, t, f, peak, d = 1.2) {
  v.tone(out, { type: 'sine', f, t, a: 0.004, d, peak });
  v.tone(out, { type: 'sine', f: f * 2.01, t, a: 0.003, d: d * 0.5, peak: peak * 0.35 });
  v.tone(out, { type: 'sine', f: f * 3.0, t, a: 0.002, d: d * 0.25, peak: peak * 0.15 });
}
function droplets(v, out, t, n, spread, peak, lo = 1300, hi = 3200) {
  for (let i = 0; i < n; i++) {
    const f = rnd(lo, hi);
    v.tone(out, { type: 'sine', f, f2: f * 1.9, glide: 0.03, t: t + Math.random() * spread, a: 0.001, d: 0.06, peak: peak * rnd(0.4, 1) });
  }
}
function bell(v, out, t, f, peak, ratios = [1, 2.32, 2.98, 4.15], decays = [1.6, 0.9, 0.6, 0.35]) {
  const amps = [1, 0.5, 0.35, 0.22];
  for (let i = 0; i < ratios.length; i++) v.tone(out, { type: 'sine', f: f * ratios[i], t, a: 0.002, d: decays[i], peak: peak * amps[i] });
}
function crackle(v, out, t, dur, peak, f = 2600) {
  const src = v.noise('crackle', t, t + dur + 0.05, rnd(0.85, 1.25));
  const flt = v.filter('bandpass', f, 0.7); const g = v.gain(0);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + 0.02); g.gain.setTargetAtTime(0, t + dur * 0.4, dur * 0.25);
  src.connect(flt); flt.connect(g); g.connect(out);
}

export const SFX = {
  // ------------------------------------------------------------- UI
  ui_click: { gain: 0.5, gap: 0.03, max: 4, pri: 3, pj: 0.05, fn(v, out, t, p) {
    v.tone(out, { type: 'sine', f: 1500 * p, f2: 950 * p, glide: 0.03, t, a: 0.001, d: 0.05, peak: 0.45 });
    v.burst(out, { t, a: 0.001, d: 0.018, peak: 0.22, ft: 'bandpass', f: 3600 * p, q: 1.5 });
  } },
  ui_hover: { gain: 0.35, gap: 0.05, max: 2, pri: 1, pj: 0.03, fn(v, out, t, p) {
    v.tone(out, { type: 'sine', f: 2300 * p, t, a: 0.002, d: 0.04, peak: 0.35 });
  } },
  ui_open: { gain: 1.0, gap: 0.08, max: 2, pri: 3, wet: 0.35, fn(v, out, t, p) {
    v.burst(out, { kind: 'pink', t, a: 0.06, d: 0.22, peak: 0.4, ft: 'bandpass', f: 500 * p, f2: 2200 * p, glide: 0.25, q: 1.2 });
    chime(v, out, t + 0.04, mtof(74) * p, 0.16, 0.7);
    chime(v, out, t + 0.1, mtof(81) * p, 0.1, 0.8);
  } },
  ui_close: { gain: 0.95, gap: 0.08, max: 2, pri: 3, wet: 0.3, fn(v, out, t, p) {
    v.burst(out, { kind: 'pink', t, a: 0.03, d: 0.2, peak: 0.36, ft: 'bandpass', f: 1800 * p, f2: 420 * p, glide: 0.22, q: 1.2 });
    chime(v, out, t + 0.02, mtof(76) * p, 0.1, 0.5);
    chime(v, out, t + 0.07, mtof(69) * p, 0.1, 0.6);
  } },
  denied: { gain: 0.5, gap: 0.12, max: 2, pri: 3, pj: 0.01, fn(v, out, t, p) {
    v.tone(out, { type: 'triangle', f: 233 * p, t, a: 0.004, d: 0.1, peak: 0.45, ft: 'lowpass', ff: 900 });
    v.tone(out, { type: 'triangle', f: 207 * p, t: t + 0.11, a: 0.004, d: 0.16, peak: 0.45, ft: 'lowpass', ff: 800 });
  } },

  // ------------------------------------------------------------- fishing
  cast_whoosh: { gain: 1.1, gap: 0.1, max: 2, pri: 2, fn(v, out, t, p, o) {
    const pw = clamp(o.power ?? 0.7, 0.2, 1);
    v.burst(out, { t, a: 0.03, d: 0.16 + 0.12 * pw, peak: 0.55, ft: 'bandpass', f: 2800 * p, f2: 480 * p, glide: 0.24, q: 2.2 });
    v.burst(out, { kind: 'pink', t: t + 0.02, a: 0.05, d: 0.25, peak: 0.25, ft: 'lowpass', f: 900 * p, q: 0.7 });
    v.tone(out, { type: 'sine', f: 2100 * p, f2: 800 * p, glide: 0.5 + 0.4 * pw, t: t + 0.05, a: 0.03, d: 0.5 * pw + 0.2, peak: 0.05 });
    for (let i = 0; i < 6; i++) v.burst(out, { t: t + 0.08 + i * (0.05 + i * 0.012), a: 0.0005, d: 0.01, peak: 0.12 * (1 - i / 7), ft: 'bandpass', f: 4200, q: 4 });
  } },
  bobber_plop: { gain: 0.7, gap: 0.08, max: 2, pri: 2, wet: 0.3, fn(v, out, t, p) {
    v.tone(out, { type: 'sine', f: 980 * p, f2: 240 * p, glide: 0.06, t, a: 0.002, d: 0.11, peak: 0.6 });
    v.burst(out, { t, a: 0.003, d: 0.14, peak: 0.28, ft: 'lowpass', f: 2000 * p, q: 0.8 });
    droplets(v, out, t + 0.08, 3, 0.25, 0.12);
  } },
  nibble: { gain: 0.5, gap: 0.08, max: 2, pri: 2, fn(v, out, t, p) {
    v.tone(out, { type: 'sine', f: 720 * p, f2: 480 * p, glide: 0.04, t, a: 0.001, d: 0.05, peak: 0.4 });
    v.burst(out, { t, a: 0.001, d: 0.03, peak: 0.16, ft: 'bandpass', f: 1300 * p, q: 1.5 });
  } },
  bite: { gain: 0.95, gap: 0.2, max: 2, pri: 3, wet: 0.3, pj: 0.02, fn(v, out, t, p, o) {
    // v3 (o.alertOnly): the class's bite tell already voiced the water (bite_doublepop … bite_dome), so only the alert rings
    if (!o.alertOnly) {
      v.tone(out, { type: 'sine', f: 420 * p, f2: 110 * p, glide: 0.13, t, a: 0.002, d: 0.26, peak: 0.7 });
      v.burst(out, { t, a: 0.003, d: 0.2, peak: 0.42, ft: 'lowpass', f: 1000, q: 0.8 });
    }
    // the alert: bright, unmistakable, rising
    chime(v, out, t + 0.02, mtof(88) * p, 0.3, 0.45);
    chime(v, out, t + 0.07, mtof(95) * p, 0.24, 0.55);
  } },
  hook: { gain: 0.9, gap: 0.15, max: 2, pri: 3, wet: 0.25, fn(v, out, t, p, o) {
    v.burst(out, { t, a: 0.004, d: 0.08, peak: 0.5, ft: 'highpass', f: 2500 * p, f2: 6500 * p, glide: 0.07, q: 0.8 });
    v.tone(out, { type: 'sine', f: 170 * p, f2: 58 * p, glide: 0.12, t, a: 0.002, d: 0.2, peak: 0.85 });
    v.burst(out, { t: t + 0.01, a: 0.002, d: 0.16, peak: 0.35, ft: 'lowpass', f: 1400, q: 0.8 });
    if (o.perfect) { chime(v, out, t + 0.03, mtof(84), 0.2, 0.8); chime(v, out, t + 0.09, mtof(91), 0.18, 0.9); chime(v, out, t + 0.15, mtof(96), 0.15, 1.1); }
  } },
  reel_tick: { gain: 1.1, gap: 0.022, max: 4, pri: 1, pj: 0.06, fn(v, out, t, p) {
    v.burst(out, { t, a: 0.0005, d: 0.012, peak: 0.7, ft: 'bandpass', f: 4200 * p, q: 4 });
    v.tone(out, { type: 'square', f: 2500 * p, t, a: 0.0005, d: 0.008, peak: 0.06 });
  } },
  line_strain: { gain: 1.3, gap: 0.25, max: 2, pri: 2, fn(v, out, t, p) {
    const { osc } = v.tone(out, { type: 'sawtooth', f: 720 * p, t, a: 0.06, hold: 0.25, d: 0.35, peak: 0.3, ft: 'bandpass', ff: 1500 * p, fq: 6 });
    const lfo = v.osc('sine', 9, t, t + 0.8); const lg = v.gain(30); lfo.connect(lg); lg.connect(osc.frequency);
    v.burst(out, { kind: 'pink', t, a: 0.05, hold: 0.2, d: 0.3, peak: 0.12, ft: 'bandpass', f: 900, q: 3 });
  } },
  line_snap: { gain: 0.9, gap: 0.2, max: 1, pri: 3, wet: 0.3, duck: [0.6, 0.6], fn(v, out, t, p) {
    v.tone(out, { type: 'sawtooth', f: 1900 * p, f2: 110 * p, glide: 0.25, t, a: 0.001, d: 0.32, peak: 0.32, ft: 'lowpass', ff: 5000 });
    v.burst(out, { t, a: 0.0008, d: 0.05, peak: 0.85, ft: 'highpass', f: 3000, q: 0.7 });
    v.tone(out, { type: 'sine', f: 210, f2: 70, glide: 0.12, t: t + 0.005, a: 0.002, d: 0.15, peak: 0.5 });
    v.burst(out, { kind: 'pink', t: t + 0.12, a: 0.01, d: 0.3, peak: 0.25, ft: 'bandpass', f: 1200, q: 0.9 });
  } },
  splash_small: { gain: 0.55, gap: 0.05, max: 3, pri: 1, wet: 0.25, fn(v, out, t, p) {
    v.burst(out, { t, a: 0.004, d: 0.22, peak: 0.55, ft: 'bandpass', f: 1500 * p, f2: 650 * p, glide: 0.2, q: 0.8 });
    v.tone(out, { type: 'sine', f: 520 * p, f2: 200 * p, glide: 0.06, t, a: 0.002, d: 0.08, peak: 0.25 });
    droplets(v, out, t + 0.06, 3, 0.3, 0.1);
  } },
  splash_big: { gain: 0.75, gap: 0.12, max: 2, pri: 2, wet: 0.35, fn(v, out, t, p) {
    v.burst(out, { t, a: 0.01, d: 0.6, peak: 0.75, ft: 'lowpass', f: 2600 * p, f2: 500 * p, glide: 0.5, q: 0.7 });
    v.burst(out, { kind: 'pink', t, a: 0.006, d: 0.38, peak: 0.45, ft: 'bandpass', f: 650 * p, q: 0.8 });
    v.tone(out, { type: 'sine', f: 95 * p, f2: 48 * p, glide: 0.2, t, a: 0.004, d: 0.3, peak: 0.4 });
    droplets(v, out, t + 0.15, 6, 0.6, 0.13, 1000, 2800);
  } },
  catch_fanfare: { gain: 1.0, gap: 0.3, max: 1, pri: 3, wet: 0.45, dly: 0.2, fn(v, out, t, p, o, eng) {
    const lvl = { common: 0, uncommon: 1, rare: 2, legendary: 3 }[o.rarity] ?? 0;
    const root = 67;
    const notes = [0, 4, 7, 12, 16];
    for (let i = 0; i < 3 + Math.min(lvl, 2); i++) {
      const g = v.gain(0.42 - i * 0.03); g.connect(out);
      v.buffer(eng.ks(root + notes[i], 'harp'), t + i * 0.075, 1, g);
    }
    chime(v, out, t + 0.3, mtof(root + 12 + (lvl >= 2 ? 7 : 4)), 0.14 + lvl * 0.04, 1.4);
    if (lvl >= 1) chime(v, out, t + 0.38, mtof(root + 19), 0.12, 1.6);
    if (lvl >= 2) {
      const b = v.burst(out, { t: t + 0.25, a: 0.5, d: 1.0, peak: 0.12, ft: 'highpass', f: 6000, q: 0.5 });
      b.flt.frequency.value = 6000;
      for (let i = 0; i < 5; i++) chime(v, out, t + 0.4 + i * 0.09, mtof(root + 24 + pent(i)), 0.07, 0.9);
    }
    if (lvl >= 3) {
      for (const m of [43, 50, 55, 59, 62]) v.tone(out, { type: 'triangle', f: mtof(m), t: t + 0.35, a: 0.35, hold: 0.8, d: 2.2, peak: 0.08 });
      v.tone(out, { type: 'sine', f: 55, t: t + 0.3, a: 0.2, hold: 0.5, d: 1.8, peak: 0.35 });
    }
  }, duck: [0.55, 1.6] },
  new_species: { gain: 0.7, gap: 0.5, max: 1, pri: 3, wet: 0.55, dly: 0.3, fn(v, out, t, p) {
    const b = v.burst(out, { t, a: 0.4, d: 0.8, peak: 0.12, ft: 'bandpass', f: 3000, f2: 9000, glide: 1.0, q: 1.5 });
    b.g.gain.cancelScheduledValues(t); envSwell(b.g.gain, t, 0.12, 0.6, 0.4);
    const motif = [76, 83, 81, 88];
    for (let i = 0; i < motif.length; i++) chime(v, out, t + 0.15 + i * 0.16, mtof(motif[i]) * p, 0.18, 1.5);
  } },
  coin: { gain: 0.6, gap: 0.04, max: 5, pri: 2, pj: 0.06, fn(v, out, t, p) {
    v.tone(out, { type: 'sine', f: 2350 * p, t, a: 0.001, d: 0.12, peak: 0.42 });
    v.tone(out, { type: 'sine', f: 3530 * p, t: t + 0.035, a: 0.001, d: 0.18, peak: 0.32 });
    v.tone(out, { type: 'square', f: 4800 * p, t, a: 0.0005, d: 0.02, peak: 0.04 });
  } },
  buy: { gain: 0.6, gap: 0.1, max: 2, pri: 3, wet: 0.2, fn(v, out, t, p) {
    for (let i = 0; i < 3; i++) {
      const f = rnd(2100, 2700) * p;
      v.tone(out, { type: 'sine', f, t: t + i * 0.055, a: 0.001, d: 0.12, peak: 0.3 });
      v.tone(out, { type: 'sine', f: f * 1.5, t: t + i * 0.055 + 0.02, a: 0.001, d: 0.14, peak: 0.2 });
    }
    v.tone(out, { type: 'sine', f: 150, f2: 70, glide: 0.08, t: t + 0.17, a: 0.002, d: 0.14, peak: 0.45 });
    v.burst(out, { kind: 'pink', t: t + 0.17, a: 0.003, d: 0.09, peak: 0.25, ft: 'lowpass', f: 900, q: 0.7 });
  } },
  eat: { gain: 0.6, gap: 0.3, max: 1, pri: 2, fn(v, out, t, p) {
    for (let i = 0; i < 3; i++) {
      const tt = t + i * 0.14 + rnd(0, 0.03);
      v.burst(out, { t: tt, a: 0.002, d: 0.06, peak: 0.5, ft: 'lowpass', f: rnd(1200, 2200) * p, q: 1.2 });
      v.burst(out, { t: tt + 0.01, a: 0.001, d: 0.025, peak: 0.25, ft: 'bandpass', f: rnd(2500, 4000), q: 2 });
    }
    v.tone(out, { type: 'sine', f: 320 * p, f2: 140 * p, glide: 0.12, t: t + 0.48, a: 0.01, d: 0.14, peak: 0.4 });
  } },
  render_oil: { gain: 1.0, gap: 0.3, max: 1, pri: 2, wet: 0.3, fn(v, out, t, p) {
    v.burst(out, { t, a: 0.05, d: 0.9, peak: 0.18, ft: 'highpass', f: 3200, q: 0.7 });
    crackle(v, out, t, 1.0, 0.5);
    for (let i = 0; i < 7; i++) { const f = rnd(260, 700) * p; v.tone(out, { type: 'sine', f, f2: f * 1.6, glide: 0.04, t: t + 0.1 + Math.random() * 0.7, a: 0.004, d: 0.05, peak: 0.16 }); }
    v.burst(out, { kind: 'pink', t: t + 0.2, a: 0.3, d: 0.5, peak: 0.3, ft: 'bandpass', f: 300, f2: 1200, glide: 0.6, q: 1 });
    v.tone(out, { type: 'triangle', f: mtof(69) * p, t: t + 0.3, a: 0.2, d: 0.9, peak: 0.08 });
  } },

  // ------------------------------------------------------------- combat
  flare: { gain: 0.95, gap: 0.2, max: 2, pri: 3, wet: 0.5, dly: 0.15, duck: [0.6, 0.8], fn(v, out, t, p) {
    v.burst(out, { t, a: 0.02, d: 0.7, peak: 0.8, ft: 'bandpass', f: 300 * p, f2: 5200 * p, glide: 0.25, q: 0.9 });
    v.tone(out, { type: 'sine', f: 125 * p, f2: 56 * p, glide: 0.35, t, a: 0.006, d: 0.7, peak: 0.6 });
    for (const m of [81, 88, 93]) v.tone(out, { type: 'triangle', f: mtof(m) * p, t: t + 0.03, a: 0.01, d: 1.3, peak: 0.12 });
    crackle(v, out, t + 0.05, 0.6, 0.35, 4500);
  } },
  zap: { gain: 0.55, gap: 0.05, max: 3, pri: 2, pj: 0.08, fn(v, out, t, p) {
    v.tone(out, { type: 'square', f: 1450 * p, f2: 230 * p, glide: 0.07, t, a: 0.001, d: 0.09, peak: 0.32, ft: 'lowpass', ff: 5000 });
    v.tone(out, { type: 'sawtooth', f: 2700 * p, f2: 800 * p, glide: 0.05, t, a: 0.001, d: 0.05, peak: 0.18 });
    v.burst(out, { t, a: 0.0008, d: 0.045, peak: 0.42, ft: 'highpass', f: 4000, q: 0.7 });
  } },
  aura_burn: { gain: 1.2, gap: 0.08, max: 2, pri: 0, fn(v, out, t, p) {
    crackle(v, out, t, 0.35, 0.6, 2400 * p);
    v.burst(out, { t, a: 0.01, d: 0.25, peak: 0.12, ft: 'highpass', f: 5000, q: 0.7 });
  } },
  enemy_spawn: { gain: 0.55, gap: 0.22, max: 3, pri: 0, wet: 0.6, pj: 0.1, fn(v, out, t, p, o) {
    if (o.elite) {
      v.burst(out, { kind: 'brown', t, a: 0.35, d: 1.3, peak: 1.0, ft: 'lowpass', f: 220, q: 0.8 });
      v.tone(out, { type: 'sine', f: 46, t, a: 0.3, d: 1.5, peak: 0.6 });
      v.burst(out, { kind: 'pink', t: t + 0.4, a: 0.2, d: 0.8, peak: 0.4, ft: 'bandpass', f: 500, f2: 200, glide: 1, q: 1 });
      return;
    }
    v.burst(out, { kind: 'pink', t, a: 0.25, d: 0.4, peak: 0.45, ft: 'bandpass', f: 800 * p, f2: 1900 * p, glide: 0.5, q: 6 });
    v.tone(out, { type: 'sine', f: 120 * p, f2: 80 * p, glide: 0.5, t, a: 0.2, d: 0.45, peak: 0.18 });
  } },
  enemy_hit: { gain: 0.42, gap: 1 / 12, max: 4, pri: 0, pj: 0.1, fn(v, out, t, p, o) {
    v.burst(out, { t, a: 0.001, d: 0.06, peak: 0.5, ft: 'bandpass', f: 3000 * p, q: 2 });
    v.tone(out, { type: 'sine', f: 540 * p, f2: 250 * p, glide: 0.06, t, a: 0.001, d: 0.07, peak: 0.32 });
    if (o.crit) { v.tone(out, { type: 'triangle', f: 1700 * p, f2: 2400 * p, glide: 0.05, t, a: 0.001, d: 0.12, peak: 0.3 }); v.burst(out, { t, a: 0.001, d: 0.03, peak: 0.4, ft: 'highpass', f: 5000 }); }
  } },
  enemy_die: { gain: 0.48, gap: 1 / 14, max: 6, pri: 1, wet: 0.25, pj: 0.12, fn(v, out, t, p, o) {
    const big = !!o.big;
    v.burst(out, { kind: 'pink', t, a: 0.002, d: big ? 0.6 : 0.25, peak: 0.7, ft: 'lowpass', f: 1700 * p, f2: 260 * p, glide: big ? 0.5 : 0.2, q: 0.8 });
    v.tone(out, { type: 'sine', f: (big ? 200 : 340) * p, f2: (big ? 40 : 70) * p, glide: big ? 0.4 : 0.18, t, a: 0.002, d: big ? 0.5 : 0.22, peak: 0.6 });
    v.tone(out, { type: 'sine', f: rnd(1600, 2400) * p, t: t + 0.02, a: 0.002, d: 0.22, peak: 0.08 });
    if (big) crackle(v, out, t, 0.6, 0.4, 3000);
  } },
  player_hurt: { gain: 0.9, gap: 0.25, max: 1, pri: 3, wet: 0.3, duck: [0.5, 0.7], fn(v, out, t, p) {
    v.tone(out, { type: 'sine', f: 140 * p, f2: 55 * p, glide: 0.18, t, a: 0.002, d: 0.32, peak: 0.8 });
    v.burst(out, { kind: 'pink', t, a: 0.003, d: 0.25, peak: 0.6, ft: 'lowpass', f: 650, q: 0.8 });
    v.burst(out, { t: t + 0.02, a: 0.01, d: 0.45, peak: 0.28, ft: 'bandpass', f: 2600, f2: 900, glide: 0.4, q: 1.2 });
    v.tone(out, { type: 'sawtooth', f: mtof(52), t, a: 0.01, d: 0.5, peak: 0.07, ft: 'lowpass', ff: 1200 });
    v.tone(out, { type: 'sawtooth', f: mtof(53), t, a: 0.01, d: 0.5, peak: 0.07, ft: 'lowpass', ff: 1200 });
  } },
  heartbeat: { gain: 0.8, gap: 0.3, max: 1, pri: 2, pj: 0.01, vj: 0.03, fn(v, out, t) {
    v.tone(out, { type: 'sine', f: 118, f2: 50, glide: 0.09, t, a: 0.004, d: 0.22, peak: 0.9 });
    v.burst(out, { kind: 'pink', t, a: 0.002, d: 0.08, peak: 0.45, ft: 'lowpass', f: 300, q: 0.7 });
    v.tone(out, { type: 'sine', f: 100, f2: 44, glide: 0.09, t: t + 0.17, a: 0.004, d: 0.25, peak: 0.7 });
  } },
  boss_roar: { gain: 1.0, gap: 1, max: 1, pri: 3, wet: 0.6, duck: [0.45, 2.5], fn(v, out, t, p, o) {
    const dying = !!o.dying;
    const dur = dying ? 2.6 : 2.2;
    const fmt = v.filter('bandpass', 300, 3);
    const fmt2 = v.filter('bandpass', 900, 5);
    fmt.frequency.setValueAtTime(260, t);
    fmt.frequency.linearRampToValueAtTime(dying ? 700 : 950, t + 0.5);
    fmt.frequency.linearRampToValueAtTime(220, t + dur);
    const amp = v.gain(0);
    amp.gain.setValueAtTime(0, t); amp.gain.linearRampToValueAtTime(0.6, t + 0.25); amp.gain.setValueAtTime(0.6, t + 1.0); amp.gain.linearRampToValueAtTime(0, t + dur);
    fmt.connect(amp); fmt2.connect(amp); amp.connect(out);
    fmt2.frequency.setValueAtTime(700, t); fmt2.frequency.linearRampToValueAtTime(dying ? 1400 : 1900, t + 0.5); fmt2.frequency.linearRampToValueAtTime(600, t + dur);
    const growl = v.osc('sine', 28, t, t + dur + 0.1); const gg = v.gain(0.35); const trem = v.gain(0.65);
    growl.connect(gg); gg.connect(trem.gain); trem.connect(fmt); trem.connect(fmt2);
    for (const m of [40, 41, 47, 52]) {
      const o2 = v.osc('sawtooth', mtof(m) * p, t, t + dur + 0.1, rnd(-15, 15));
      if (dying) { o2.frequency.setValueAtTime(mtof(m) * p, t); o2.frequency.exponentialRampToValueAtTime(mtof(m - 12) * p, t + dur); }
      o2.connect(trem);
    }
    v.tone(out, { type: 'sine', f: 70, f2: 38, glide: 1.5, t, a: 0.08, d: 2.4, peak: 0.6 });
    v.burst(out, { kind: 'brown', t, a: 0.3, hold: 0.6, d: 1.6, peak: 0.5, ft: 'lowpass', f: 420, q: 0.8 });
  } },
  gloom_rise: { gain: 0.8, gap: 2, max: 1, pri: 3, wet: 0.65, duck: [0.5, 3], fn(v, out, t, p) {
    v.tone(out, { type: 'sine', f: 92, f2: 38, glide: 2, t, a: 0.02, d: 2.6, peak: 0.6 });
    const flt = v.filter('lowpass', 150, 2); flt.frequency.setValueAtTime(150, t); flt.frequency.exponentialRampToValueAtTime(1100, t + 2.2); flt.frequency.exponentialRampToValueAtTime(180, t + 3.6);
    const amp = v.gain(0); amp.gain.setValueAtTime(0, t); amp.gain.linearRampToValueAtTime(0.32, t + 2.2); amp.gain.linearRampToValueAtTime(0, t + 3.6);
    flt.connect(amp); amp.connect(out);
    for (const m of [38, 39, 45, 50]) v.osc('sawtooth', mtof(m) * p, t, t + 3.7, rnd(-10, 10)).connect(flt);
    const g = [1, 1.47, 2.09, 2.56, 3.37];
    for (let i = 0; i < g.length; i++) v.tone(out, { type: 'sine', f: 98 * g[i], t: t + 0.05, a: 0.4, d: 4 - i * 0.5, peak: 0.12 / (1 + i * 0.4) });
    const b = v.burst(out, { kind: 'pink', t, a: 2, d: 0.6, peak: 0.25, ft: 'bandpass', f: 400, f2: 1600, glide: 2, q: 1.2 });
    b.g.gain.cancelScheduledValues(t); envSwell(b.g.gain, t, 0.25, 2.1, 0.5);
  } },
  dawn: { gain: 0.7, gap: 2, max: 1, pri: 3, wet: 0.55, dly: 0.2, fn(v, out, t, p) {
    for (const m of [50, 57, 62, 66, 69]) v.tone(out, { type: 'triangle', f: mtof(m) * p, t, a: 1.2, hold: 0.4, d: 2.6, peak: 0.07, ft: 'lowpass', ff: 1800 });
    const asc = [74, 78, 81, 86, 90];
    for (let i = 0; i < asc.length; i++) chime(v, out, t + 0.5 + i * 0.18, mtof(asc[i]) * p, 0.12, 1.6);
    v.burst(out, { kind: 'pink', t, a: 1, d: 1.5, peak: 0.08, ft: 'bandpass', f: 1500, q: 0.7 });
  } },
  merchant_bell: { gain: 0.6, gap: 0.6, max: 1, pri: 2, wet: 0.5, pj: 0.02, fn(v, out, t, p) {
    bell(v, out, t, 1250 * p, 0.42);
    bell(v, out, t + 0.33, 1250 * p * 0.985, 0.34);
    bell(v, out, t + 0.66, 1250 * p * 1.01, 0.22);
  } },
  xp_pickup: { gain: 0.36, gap: 0.035, max: 6, pri: 1, pj: 0.005, vj: 0.08, fn(v, out, t, p) {
    const f = 784 * p;
    v.tone(out, { type: 'sine', f, t, a: 0.002, d: 0.18, peak: 0.5 });
    v.tone(out, { type: 'triangle', f: f * 2, t, a: 0.001, d: 0.07, peak: 0.12 });
  } },
  levelup: { gain: 1.05, gap: 0.4, max: 1, pri: 3, wet: 0.5, dly: 0.25, duck: [0.5, 1.6], fn(v, out, t, p) {
    const arp = [72, 76, 79, 84, 88, 91];
    for (let i = 0; i < arp.length; i++) {
      v.tone(out, { type: 'triangle', f: mtof(arp[i]) * p, t: t + i * 0.06, a: 0.004, d: 0.7, peak: 0.16 });
      v.tone(out, { type: 'sine', f: mtof(arp[i] + 12) * p, t: t + i * 0.06, a: 0.002, d: 0.4, peak: 0.07 });
    }
    const b = v.burst(out, { t, a: 0.4, d: 0.8, peak: 0.14, ft: 'highpass', f: 6000, q: 0.5 }); b.flt.frequency.value = 6000;
    v.tone(out, { type: 'sine', f: 82, t, a: 0.25, d: 0.9, peak: 0.16 });
    for (const m of [84, 88, 91]) chime(v, out, t + 0.4, mtof(m) * p, 0.1, 1.6);
  } },
  boon_pick: { gain: 0.8, gap: 0.2, max: 1, pri: 3, wet: 0.4, fn(v, out, t, p) {
    v.tone(out, { type: 'sine', f: 155, f2: 60, glide: 0.12, t, a: 0.002, d: 0.22, peak: 0.7 });
    const ch = [79, 86, 91];
    for (let i = 0; i < ch.length; i++) chime(v, out, t + i * 0.035, mtof(ch[i]) * p, 0.14, 1.2);
    v.burst(out, { kind: 'pink', t, a: 0.02, d: 0.3, peak: 0.2, ft: 'bandpass', f: 1300, f2: 300, glide: 0.3, q: 1 });
  } },
  paddle: { gain: 0.85, gap: 0.15, max: 3, pri: 0, pj: 0.08, wet: 0.15, fn(v, out, t, p) {
    v.burst(out, { kind: 'pink', t, a: 0.03, d: 0.22, peak: 0.5, ft: 'bandpass', f: 650 * p, f2: 1300 * p, glide: 0.15, q: 1.2 });
    v.burst(out, { t: t + 0.04, a: 0.01, d: 0.16, peak: 0.22, ft: 'bandpass', f: 2600 * p, f2: 1500 * p, glide: 0.15, q: 1.4 });
    v.tone(out, { type: 'sine', f: 250 * p, f2: 420 * p, glide: 0.06, t: t + 0.02, a: 0.01, d: 0.08, peak: 0.16 });
    droplets(v, out, t + 0.16, 2, 0.2, 0.06);
  } },
  anchor: { gain: 0.65, gap: 0.4, max: 1, pri: 2, wet: 0.3, fn(v, out, t, p, o) {
    const up = o.anchored === false;
    for (let i = 0; i < 6; i++) {
      const tt = t + i * 0.045 + Math.random() * 0.01;
      v.tone(out, { type: 'square', f: rnd(2400, 3400) * p, t: tt, a: 0.0005, d: 0.025, peak: 0.08, ft: 'bandpass', ff: 3000, fq: 3 });
      v.tone(out, { type: 'sine', f: rnd(1700, 2300) * p, t: tt, a: 0.0005, d: 0.04, peak: 0.12 });
    }
    if (!up) {
      v.tone(out, { type: 'sine', f: 300 * p, f2: 90 * p, glide: 0.1, t: t + 0.3, a: 0.002, d: 0.3, peak: 0.6 });
      v.burst(out, { t: t + 0.3, a: 0.004, d: 0.3, peak: 0.45, ft: 'lowpass', f: 1800, q: 0.8 });
    } else {
      v.burst(out, { kind: 'pink', t: t + 0.25, a: 0.02, d: 0.35, peak: 0.35, ft: 'bandpass', f: 900, q: 1 });
      droplets(v, out, t + 0.3, 4, 0.4, 0.1);
    }
  } },

  // ------------------------------------------------------------- progression / meta
  challenge_complete: { gain: 0.8, gap: 0.6, max: 1, pri: 3, wet: 0.45, dly: 0.2, duck: [0.55, 1.6], fn(v, out, t, p) {
    const up = [72, 79, 84];
    for (let i = 0; i < up.length; i++) v.tone(out, { type: 'triangle', f: mtof(up[i]) * p, t: t + i * 0.09, a: 0.004, d: 0.4, peak: 0.18 });
    for (const m of [84, 88, 91, 96]) chime(v, out, t + 0.3, mtof(m) * p, 0.1, 1.8);
    v.tone(out, { type: 'sine', f: 65, t: t + 0.28, a: 0.02, d: 0.8, peak: 0.35 });
    droplets(v, out, t + 0.4, 6, 0.8, 0.06, 3000, 6000);
  } },
  unlock: { gain: 0.8, gap: 0.6, max: 1, pri: 3, wet: 0.55, dly: 0.25, duck: [0.55, 1.8], fn(v, out, t, p) {
    const b = v.burst(out, { t, a: 0.5, d: 0.6, peak: 0.18, ft: 'highpass', f: 3000, f2: 8500, glide: 0.8, q: 0.7 });
    b.g.gain.cancelScheduledValues(t); envSwell(b.g.gain, t, 0.18, 0.55, 0.4);
    for (const m of [74, 79, 81]) v.tone(out, { type: 'sine', f: mtof(m) * p, t, a: 0.08, hold: 0.35, d: 0.3, peak: 0.12 });
    for (const m of [74, 78, 81, 86]) chime(v, out, t + 0.5, mtof(m) * p, 0.12, 1.8);
  } },
  gate_open: { gain: 0.85, gap: 2, max: 1, pri: 3, wet: 0.6, duck: [0.5, 3], fn(v, out, t, p) {
    v.burst(out, { kind: 'brown', t, a: 0.6, hold: 0.6, d: 2.4, peak: 0.6, ft: 'lowpass', f: 260, q: 0.8 });
    const grind = v.burst(out, { t, a: 0.4, hold: 0.8, d: 1.5, peak: 0.25, ft: 'bandpass', f: 320, q: 3 });
    const lfo = v.osc('sine', 7, t, t + 3.5); const lg = v.gain(120); lfo.connect(lg); lg.connect(grind.flt.frequency);
    v.burst(out, { kind: 'pink', t: t + 0.6, a: 1, d: 2.2, peak: 0.3, ft: 'bandpass', f: 500, f2: 1800, glide: 1.6, q: 4 });
    for (const m of [38, 45, 50, 57, 62]) v.tone(out, { type: 'triangle', f: mtof(m) * p, t: t + 0.8, a: 1.4, hold: 0.5, d: 2.6, peak: 0.07 });
    v.tone(out, { type: 'sine', f: 55, t, a: 0.8, hold: 0.6, d: 2.2, peak: 0.3 });
  } },
  descend: { gain: 0.85, gap: 2, max: 1, pri: 3, wet: 0.7, duck: [0.45, 3.5], fn(v, out, t, p) {
    v.burst(out, { kind: 'pink', t, a: 0.3, d: 2.6, peak: 0.55, ft: 'bandpass', f: 2200, f2: 180, glide: 2.6, q: 3 });
    const sw = v.burst(out, { t, a: 0.5, d: 2.2, peak: 0.2, ft: 'bandpass', f: 900, q: 6 });
    const lfo = v.osc('sine', 5.5, t, t + 3.2); const lg = v.gain(500); lfo.connect(lg); lg.connect(sw.flt.frequency);
    v.tone(out, { type: 'sine', f: 96, f2: 34, glide: 2.4, t: t + 0.6, a: 0.02, d: 3, peak: 0.7 });
    for (const m of [45, 52, 57, 60]) v.tone(out, { type: 'triangle', f: mtof(m) * p, t: t + 0.4, a: 1.5, hold: 0.3, d: 2.5, peak: 0.07, ft: 'lowpass', ff: 1400 });
  } },
  death: { gain: 0.9, gap: 2, max: 1, pri: 3, wet: 0.6, duck: [0.35, 2], fn(v, out, t, p) {
    v.burst(out, { t, a: 0.005, d: 0.6, peak: 0.6, ft: 'bandpass', f: 2600, f2: 500, glide: 0.5, q: 0.9 });
    v.tone(out, { type: 'sine', f: 620 * p, f2: 80 * p, glide: 0.8, t, a: 0.01, d: 0.9, peak: 0.28 });
    v.tone(out, { type: 'sine', f: 82, f2: 33, glide: 1.6, t: t + 0.25, a: 0.01, d: 3, peak: 0.7 });
    for (const m of [33, 36, 40]) v.tone(out, { type: 'sawtooth', f: mtof(m), t: t + 0.25, a: 0.02, d: 3, peak: 0.07, ft: 'lowpass', ff: 700, ff2: 160, fglide: 2.5 });
  } },
  victory: { gain: 0.85, gap: 2, max: 1, pri: 3, wet: 0.55, dly: 0.25, duck: [0.5, 2.5], fn(v, out, t, p) {
    const cas = [79, 83, 86, 91, 95, 98];
    for (let i = 0; i < cas.length; i++) chime(v, out, t + i * 0.1, mtof(cas[i]) * p, 0.14, 1.8);
    for (const m of [55, 62, 67, 71, 74]) v.tone(out, { type: 'triangle', f: mtof(m) * p, t: t + 0.2, a: 0.6, hold: 0.6, d: 2.6, peak: 0.08 });
    for (let i = 0; i < 10; i++) v.tone(out, { type: 'sine', f: 92, f2: 70, glide: 0.1, t: t + i * 0.06, a: 0.002, d: 0.2, peak: 0.1 + i * 0.05 });
  } },

  // ------------------------------------------------------------- extras (internal; also playable by name)
  dusk_toll: { gain: 0.55, gap: 2, max: 1, pri: 2, wet: 0.75, fn(v, out, t, p) {
    const B = [0.5, 1, 1.19, 1.5, 2, 2.66];
    const D = [6, 4.5, 3.5, 2.5, 3, 1.8];
    const A = [0.5, 0.55, 0.42, 0.25, 0.32, 0.18];
    for (let k = 0; k < 2; k++) for (let i = 0; i < B.length; i++) v.tone(out, { type: 'sine', f: 196 * p * B[i], t: t + k * 2.2, a: 0.004, d: D[i], peak: A[i] * 0.3 * (k ? 0.7 : 1) });
  } },
  heal: { gain: 0.55, gap: 0.4, max: 1, pri: 2, wet: 0.45, fn(v, out, t, p) {
    for (const m of [69, 73, 76]) v.tone(out, { type: 'sine', f: mtof(m) * p, t, a: 0.12, d: 1.1, peak: 0.12 });
    chime(v, out, t + 0.15, mtof(88) * p, 0.1, 1.2);
  } },
  warn: { gain: 0.8, gap: 1, max: 1, pri: 2, wet: 0.3, fn(v, out, t, p, o) {
    if (o.resource === 'satiety') {          // stomach growl
      const g = v.burst(out, { kind: 'brown', t, a: 0.1, hold: 0.4, d: 0.4, peak: 0.9, ft: 'bandpass', f: 140, q: 3 });
      const lfo = v.osc('sine', 11, t, t + 1.1); const lg = v.gain(60); lfo.connect(lg); lg.connect(g.flt.frequency);
      return;
    }
    if (o.resource === 'oil') {             // lantern sputter
      crackle(v, out, t, 0.8, 0.5, 1800);
      v.tone(out, { type: 'sine', f: 330 * p, f2: 260 * p, glide: 0.6, t, a: 0.02, d: 0.6, peak: 0.1 });
      return;
    }
    v.tone(out, { type: 'triangle', f: 440 * p, t, a: 0.01, d: 0.2, peak: 0.25 });
    v.tone(out, { type: 'triangle', f: 415 * p, t: t + 0.22, a: 0.01, d: 0.3, peak: 0.25 });
  } },
  snuff: { gain: 0.8, gap: 0.5, max: 1, pri: 2, wet: 0.4, fn(v, out, t, p) {
    v.burst(out, { t, a: 0.004, d: 0.45, peak: 0.5, ft: 'bandpass', f: 2200, f2: 500, glide: 0.4, q: 1 });
    v.tone(out, { type: 'sine', f: 420 * p, f2: 70 * p, glide: 0.5, t, a: 0.01, d: 0.6, peak: 0.25 });
  } },
  ignite: { gain: 1.4, gap: 0.5, max: 1, pri: 2, wet: 0.35, fn(v, out, t, p) {
    v.burst(out, { kind: 'pink', t, a: 0.05, d: 0.4, peak: 0.5, ft: 'bandpass', f: 300, f2: 1800, glide: 0.25, q: 1 });
    crackle(v, out, t + 0.05, 0.5, 0.35);
    v.tone(out, { type: 'triangle', f: mtof(64) * p, t: t + 0.1, a: 0.1, d: 0.8, peak: 0.08 });
  } },
  steal: { gain: 0.75, gap: 0.5, max: 1, pri: 3, wet: 0.3, fn(v, out, t, p) {
    v.burst(out, { t, a: 0.01, d: 0.45, peak: 0.6, ft: 'lowpass', f: 2400, f2: 500, glide: 0.4, q: 0.7 });
    v.burst(out, { kind: 'pink', t: t + 0.05, a: 0.05, d: 0.4, peak: 0.4, ft: 'bandpass', f: 1200, f2: 3500, glide: 0.3, q: 6 });
    v.tone(out, { type: 'triangle', f: 330 * p, t: t + 0.15, a: 0.01, d: 0.15, peak: 0.25 });
    v.tone(out, { type: 'triangle', f: 311 * p, t: t + 0.3, a: 0.01, d: 0.3, peak: 0.25 });
  } },
  charge_ping: { gain: 0.5, gap: 0.3, max: 1, pri: 1, fn(v, out, t, p) {
    chime(v, out, t, mtof(93) * p, 0.25, 0.3);
  } },
  surge_warn: { gain: 0.8, gap: 0.4, max: 1, pri: 2, fn(v, out, t, p) {
    const g = v.burst(out, { kind: 'brown', t, a: 0.25, d: 0.35, peak: 0.8, ft: 'lowpass', f: 260, q: 2 });
    g.g.gain.cancelScheduledValues(t); envSwell(g.g.gain, t, 0.8, 0.35, 0.15);
    v.tone(out, { type: 'sawtooth', f: 90 * p, f2: 140 * p, glide: 0.35, t, a: 0.3, d: 0.15, peak: 0.08, ft: 'lowpass', ff: 600 });
  } },
  creel: { gain: 0.65, gap: 0.2, max: 1, pri: 2, fn(v, out, t, p) {
    v.burst(out, { kind: 'pink', t, a: 0.004, d: 0.12, peak: 0.5, ft: 'bandpass', f: 700 * p, q: 1.2 });
    v.tone(out, { type: 'sine', f: 160 * p, f2: 90 * p, glide: 0.06, t, a: 0.002, d: 0.1, peak: 0.4 });
    for (let i = 0; i < 3; i++) v.burst(out, { t: t + 0.03 + i * 0.03, a: 0.001, d: 0.02, peak: 0.15, ft: 'bandpass', f: 2200, q: 3 });
  } },
};

// v3 (DESIGN §25, Au1; CONTRACT §13.7 audio): the measuring cord, the seals, the class bite tells, the rise rings, the
// Night Rise motif and the Stillnight bed. Merged into SFX below so play(name) reaches them; only v3 events fire them.
export const SFX_V3 = {
  // ------------------------------------------------------------- the landing's payoff (AUTOFISH.landing)
  land_swell: { gain: 0.7, gap: 0.2, max: 1, pri: 3, wet: 0.5, dly: 0.12, pj: 0.01, fn(v, out, t, p, o) {
    // the rise into the reveal: an airy swell of filtered noise climbing, under a soft fifth gliding up a tone (o.dur s, o.root)
    const d = clamp(num0(o.dur, 0.6), 0.25, 2);
    const r = num0(o.root, 69);
    const b = v.burst(out, { kind: 'pink', t, a: d * 0.9, d: 0.25, peak: 0.16, ft: 'bandpass', f: 500 * p, f2: 3600 * p, glide: d, q: 1.1 });
    b.g.gain.cancelScheduledValues(t); envSwell(b.g.gain, t, 0.16, d, 0.18);
    for (const [m, pk] of [[r - 12, 0.12], [r - 5, 0.08], [r, 0.06]]) {
      const f = mtof(m - 2) * p;
      v.tone(out, { type: 'sine', f, f2: f * 1.1225, glide: d, t, a: d * 0.85, hold: 0.05, d: 0.2, peak: pk });
    }
  } },
  land_chime: { gain: 0.9, gap: 0.25, max: 1, pri: 3, wet: 0.55, dly: 0.22, pj: 0.004, fn(v, out, t, p, o, eng) {
    // the reveal resolves: a bright arpeggio on the root (harp), a clear chime on top, by class a bronze bell and a low warmth;
    // a new species or a legend adds a high shimmer falling like light off the water
    const V = o.voicing || { root: 74, notes: [0, 4, 7, 12], gap: 0.06, bell: false, sub: false, shimmer: 0 };
    const r = V.root;
    V.notes.forEach((n, i) => {
      const g = v.gain(0.4 - Math.min(0.2, i * 0.025)); g.connect(out);
      v.buffer(eng.ks(r + n, 'harp'), t + i * V.gap, p, g);
    });
    const top = t + V.notes.length * V.gap;
    chime(v, out, top, mtof(r + 24) * p, 0.2, 1.6);
    chime(v, out, top + 0.012, mtof(r + 31) * p, 0.11, 1.3);
    if (V.bell) bell(v, out, t, mtof(r - 12) * p, 0.26, [1, 2.0, 2.76, 4.07], [2.6, 1.5, 0.9, 0.5]);
    if (V.sub) v.tone(out, { type: 'sine', f: mtof(r - 24) * p, t, a: 0.02, hold: 0.2, d: 1.4, peak: 0.2 });
    for (let i = 0; i < (V.shimmer || 0); i++) chime(v, out, top + 0.08 + i * 0.07, mtof(r + 36 - pent(i) - (i > 4 ? 12 : 0)) * p, 0.06, 0.9);
  }, duck: [0.35, 0.9] },
  record_chime: { gain: 0.75, gap: 0.4, max: 1, pri: 3, wet: 0.55, dly: 0.25, pj: 0.004, fn(v, out, t, p, o) {
    // a record at the stamp (a personal best, a class first): a rising three-note figure over a held fifth, brighter than the seal
    const r = num0(o.root, 76);
    [0, 7, 12, 19].forEach((n, i) => chime(v, out, t + i * 0.11, mtof(r + n) * p, 0.16 - i * 0.015, 1.5));
    v.tone(out, { type: 'triangle', f: mtof(r - 12) * p, t, a: 0.08, hold: 0.4, d: 1.2, peak: 0.07 });
    v.tone(out, { type: 'triangle', f: mtof(r - 5) * p, t, a: 0.08, hold: 0.4, d: 1.2, peak: 0.05 });
  } },
  // ------------------------------------------------------------- the measuring ceremony (§25.6.8)
  cord_tick: { gain: 0.5, gap: 0, max: 48, pri: 3, pj: 0.008, vj: 0.06, fn(v, out, t, p) {
    // one knot of the measuring cord passing the mark: a dry fibre tick on a small wooden blip (p rises with the count)
    v.burst(out, { t, a: 0.0005, d: 0.014, peak: 0.5, ft: 'bandpass', f: 2800 * p, q: 3 });
    v.tone(out, { type: 'triangle', f: 640 * p, t, a: 0.001, d: 0.045, peak: 0.22 });
    v.tone(out, { type: 'sine', f: 1280 * p, t, a: 0.001, d: 0.02, peak: 0.06 });
  } },
  class_chime: { gain: 0.8, gap: 0, max: 6, pri: 3, wet: 0.5, dly: 0.15, pj: 0.005, fn(v, out, t, p, o) {
    // the count crosses a class threshold: a clear chime (Prize), a warmer fifth (Trophy), a bronze bell (Elder)
    const cls = o.cls || 'prize';
    if (cls === 'elder') {
      bell(v, out, t, mtof(62) * p, 0.34, [1, 2.0, 2.76, 4.07], [3.2, 1.8, 1.1, 0.6]);
      chime(v, out, t + 0.02, mtof(86) * p, 0.14, 1.8);
      v.tone(out, { type: 'sine', f: mtof(38) * p, t, a: 0.01, d: 1.6, peak: 0.22 });
    } else if (cls === 'trophy') {
      chime(v, out, t, mtof(79) * p, 0.24, 1.6);
      chime(v, out, t + 0.012, mtof(86) * p, 0.16, 1.4);
      v.tone(out, { type: 'sine', f: mtof(55) * p, t, a: 0.01, d: 0.9, peak: 0.1 });
    } else chime(v, out, t, mtof(84) * p, 0.26, 1.3);
  } },
  seal_stamp: { gain: 0.95, gap: 0.15, max: 2, pri: 3, wet: 0.35, pj: 0.02, fn(v, out, t, p, o) {
    const seal = o.seal || null;
    if (!seal) {
      // Small / Keeper carry no seal: only the record's ink, a light dab on the card
      v.burst(out, { kind: 'pink', t, a: 0.002, d: 0.05, peak: 0.3, ft: 'bandpass', f: 1600 * p, q: 1.2 });
      v.tone(out, { type: 'sine', f: 170 * p, f2: 90 * p, glide: 0.05, t, a: 0.002, d: 0.08, peak: 0.3 });
      return;
    }
    if (seal === 'inkStamp') {
      // Prize: the bone-white ink stamp of a knotted cord — wood on paper, then the lift
      v.tone(out, { type: 'sine', f: 150 * p, f2: 62 * p, glide: 0.07, t, a: 0.002, d: 0.16, peak: 0.85 });
      v.burst(out, { kind: 'pink', t, a: 0.001, d: 0.07, peak: 0.55, ft: 'bandpass', f: 1900 * p, q: 0.9 });
      v.burst(out, { t, a: 0.0005, d: 0.012, peak: 0.3, ft: 'highpass', f: 4200, q: 0.7 });
      v.burst(out, { kind: 'pink', t: t + 0.06, a: 0.01, d: 0.12, peak: 0.12, ft: 'bandpass', f: 900 * p, q: 1 });
    } else {
      // Trophy: an oxblood wax seal · Elder: black wax with a ribbon — a heavier, wetter press and a low warm tone
      const elder = seal === 'blackWaxRibbon';
      v.tone(out, { type: 'sine', f: (elder ? 96 : 120) * p, f2: (elder ? 36 : 48) * p, glide: elder ? 0.22 : 0.14, t, a: 0.004, d: elder ? 0.4 : 0.26, peak: 0.95 });
      v.burst(out, { kind: 'brown', t, a: 0.006, d: elder ? 0.3 : 0.2, peak: 0.6, ft: 'lowpass', f: 1300 * p, f2: 260, glide: elder ? 0.28 : 0.18, q: 1.6 });
      v.burst(out, { kind: 'pink', t: t + 0.015, a: 0.004, d: 0.1, peak: 0.25, ft: 'bandpass', f: 700 * p, q: 2.5 });
      for (const [m, pk] of [[elder ? 45 : 50, 0.07], [elder ? 52 : 57, 0.05]]) {
        v.tone(out, { type: 'triangle', f: mtof(m) * p, t: t + 0.04, a: 0.08, hold: 0.2, d: elder ? 1.6 : 1.0, peak: pk, ft: 'lowpass', ff: 900 });
      }
      if (elder) {
        const r = v.burst(out, { t: t + 0.12, a: 0.05, d: 0.35, peak: 0.16, ft: 'bandpass', f: 3200, q: 0.8 });   // the ribbon settles
        const lfo = v.osc('sine', 17, t + 0.12, t + 0.6); const lg = v.gain(900); lfo.connect(lg); lg.connect(r.flt.frequency);
        bell(v, out, t + 0.1, mtof(50) * p, 0.16, [1, 2.0, 2.76, 4.07], [3.6, 2, 1.2, 0.7]);
      }
    }
    if (o.ancient) {
      // an Ancient: the seal's gold thread
      const asc = [86, 89, 93, 96, 101];
      for (let i = 0; i < asc.length; i++) chime(v, out, t + 0.18 + i * 0.07, mtof(asc[i]) * p, 0.09, 1.4);
    }
  } },
  murk_bell_far: { gain: 0.55, gap: 1.5, max: 1, pri: 2, wet: 0.85, dly: 0.2, pj: 0.01, fn(v, out, t, p) {
    // Murk's bell rung across the lake (an Old Ledger figure beaten): low, far, softened by the distance
    const lp = v.filter('lowpass', 1700, 0.5); lp.connect(out);
    bell(v, lp, t, 720 * p, 0.36);
    bell(v, lp, t + 0.75, 720 * p * 0.988, 0.26);
    bell(v, lp, t + 1.5, 720 * p * 1.006, 0.17);
  } },

  // ------------------------------------------------------------- the class bite tells (§25.6.4), panned to the float
  bite_doublepop: { gain: 0.55, gap: 0.2, max: 2, pri: 2, wet: 0.2, fn(v, out, t, p) {
    // Small: a quick double pop
    for (const [dt, k] of [[0, 1], [0.17, 0.8]]) {
      v.tone(out, { type: 'sine', f: 1150 * p, f2: 520 * p, glide: 0.03, t: t + dt, a: 0.001, d: 0.05, peak: 0.45 * k });
      v.burst(out, { t: t + dt, a: 0.001, d: 0.03, peak: 0.14 * k, ft: 'bandpass', f: 2400 * p, q: 1.6 });
    }
    droplets(v, out, t + 0.2, 2, 0.15, 0.08, 1800, 3400);
  } },
  bite_plunge: { gain: 0.75, gap: 0.2, max: 2, pri: 2, wet: 0.3, fn(v, out, t, p) {
    // Keeper: the classic plunge — the float dips under with a round bloop
    v.tone(out, { type: 'sine', f: 480 * p, f2: 120 * p, glide: 0.11, t, a: 0.002, d: 0.22, peak: 0.62 });
    v.burst(out, { t, a: 0.003, d: 0.16, peak: 0.32, ft: 'lowpass', f: 1100 * p, q: 0.8 });
    droplets(v, out, t + 0.08, 2, 0.2, 0.08);
  } },
  bite_dragunder: { gain: 0.8, gap: 0.3, max: 2, pri: 2, wet: 0.3, fn(v, out, t, p) {
    // Prize: a slow 0.4 s drag-under — a low gurgle pulled down and away
    const g = v.burst(out, { kind: 'pink', t, a: 0.08, hold: 0.2, d: 0.25, peak: 0.45, ft: 'bandpass', f: 520 * p, f2: 170 * p, glide: 0.42, q: 2.2 });
    const lfo = v.osc('sine', 13, t, t + 0.6); const lg = v.gain(90); lfo.connect(lg); lg.connect(g.flt.frequency);
    v.tone(out, { type: 'sine', f: 210 * p, f2: 82 * p, glide: 0.42, t, a: 0.05, hold: 0.15, d: 0.3, peak: 0.42 });
    for (let i = 0; i < 4; i++) {
      const f = rnd(240, 420) * p;
      v.tone(out, { type: 'sine', f, f2: f * 1.8, glide: 0.04, t: t + 0.05 + i * 0.09 + Math.random() * 0.03, a: 0.002, d: 0.05, peak: 0.12 });
    }
  } },
  bite_flat: { gain: 0.8, gap: 0.3, max: 2, pri: 2, wet: 0.3, fn(v, out, t, p) {
    // Trophy: the float lies flat (a soft slap on the skin of the water), then slides away
    v.burst(out, { t, a: 0.002, d: 0.08, peak: 0.42, ft: 'lowpass', f: 950 * p, q: 0.9 });
    v.tone(out, { type: 'sine', f: 260 * p, f2: 170 * p, glide: 0.06, t, a: 0.002, d: 0.1, peak: 0.32 });
    v.burst(out, { kind: 'pink', t: t + 0.08, a: 0.18, hold: 0.12, d: 0.25, peak: 0.26, ft: 'bandpass', f: 1500 * p, f2: 800 * p, glide: 0.45, q: 1.6 });
    v.tone(out, { type: 'sine', f: 140 * p, f2: 95 * p, glide: 0.4, t: t + 0.1, a: 0.1, hold: 0.1, d: 0.3, peak: 0.2 });
  } },
  bite_dome: { gain: 0.9, gap: 0.4, max: 1, pri: 3, wet: 0.45, fn(v, out, t, p) {
    // Elder (and every legend): a dome of water bulges up under the float — a deep swell, then the water rolls off it
    v.tone(out, { type: 'sine', f: 46 * p, f2: 72 * p, glide: 0.55, t, a: 0.5, d: 0.5, peak: 0.7 });
    const b = v.burst(out, { kind: 'brown', t, a: 0.5, d: 0.45, peak: 0.6, ft: 'lowpass', f: 180 * p, f2: 520 * p, glide: 0.55, q: 1.2 });
    b.g.gain.cancelScheduledValues(t); envSwell(b.g.gain, t, 0.6, 0.55, 0.3);
    v.burst(out, { kind: 'pink', t: t + 0.5, a: 0.02, d: 0.5, peak: 0.4, ft: 'bandpass', f: 700 * p, f2: 320 * p, glide: 0.4, q: 0.8 });
    droplets(v, out, t + 0.55, 5, 0.5, 0.1, 900, 2400);
  } },

  // ------------------------------------------------------------- rise rings (§25.6.1), positioned on the ring
  rise_plip: { gain: 0.5, gap: 0.12, max: 3, pri: 1, wet: 0.3, pj: 0.08, fn(v, out, t, p) {
    // a small surface feeder takes a fly: a tiny bright plip
    v.tone(out, { type: 'sine', f: 1250 * p, f2: 2700 * p, glide: 0.025, t, a: 0.001, d: 0.055, peak: 0.42 });
    v.burst(out, { t, a: 0.001, d: 0.025, peak: 0.1, ft: 'bandpass', f: 3600 * p, q: 2 });
    droplets(v, out, t + 0.05, 1, 0.08, 0.06, 2200, 3800);
  } },
  rise_gulp: { gain: 0.75, gap: 0.2, max: 2, pri: 1, wet: 0.4, pj: 0.06, fn(v, out, t, p) {
    // a big fish sucks something down: a deep, round gulp (the air pocket collapsing) and a slow ring of water
    v.tone(out, { type: 'sine', f: 105 * p, f2: 300 * p, glide: 0.06, t, a: 0.004, d: 0.14, peak: 0.6 });
    v.tone(out, { type: 'sine', f: 70 * p, f2: 48 * p, glide: 0.2, t, a: 0.004, d: 0.26, peak: 0.4 });
    v.burst(out, { kind: 'brown', t, a: 0.004, d: 0.18, peak: 0.45, ft: 'lowpass', f: 700 * p, f2: 260, glide: 0.15, q: 1.4 });
    v.burst(out, { kind: 'pink', t: t + 0.09, a: 0.03, d: 0.4, peak: 0.12, ft: 'bandpass', f: 600 * p, q: 0.9 });
  } },

  // ------------------------------------------------------------- the night (§25.5)
  night_rise: { gain: 0.8, gap: 3, max: 2, pri: 3, wet: 0.6, dly: 0.25, fn(v, out, t, p, o, eng) {
    // Night Rise, the big-fish hour: a figure rising from low in the lake's key (o.root), bubbles climbing, a glint above
    const r = clamp(o.root ?? 50, 40, 60);
    for (const [s, dt, vel] of [[-12, 0, 0.5], [-5, 0.3, 0.46], [0, 0.6, 0.44], [2, 0.86, 0.4], [7, 1.22, 0.5]]) {
      const g = v.gain(vel); g.connect(out);
      v.buffer(eng.ks(r + s, 'harp'), t + dt, 1, g);
    }
    for (const m of [r - 12, r - 5]) v.tone(out, { type: 'triangle', f: mtof(m) * p, t, a: 0.9, hold: 0.6, d: 1.8, peak: 0.06, ft: 'lowpass', ff: 700 });
    v.tone(out, { type: 'sine', f: mtof(r - 24) * p, t, a: 0.6, hold: 0.4, d: 1.6, peak: 0.2 });
    for (let i = 0; i < 7; i++) {
      const f = (260 + i * 85) * p * rnd(0.92, 1.08);
      v.tone(out, { type: 'sine', f, f2: f * 1.7, glide: 0.04, t: t + 0.2 + i * 0.2 + Math.random() * 0.05, a: 0.002, d: 0.06, peak: 0.07 + i * 0.012 });
    }
    chime(v, out, t + 1.55, mtof(r + 24) * p, 0.1, 1.8);
    chime(v, out, t + 1.68, mtof(r + 31) * p, 0.08, 2.0);
  } },
  stillnight_bed: { gain: 0.4, gap: 1, max: 2, pri: 0, wet: 0.6, vj: 0.2, fn(v, out, t, p) {
    // one breath of the Stillnight bed: frogs far across the water, a reed-cricket trill, a slow drip
    const n = 1 + ((Math.random() * 3) | 0);
    for (let i = 0; i < n; i++) {
      const tt = t + i * rnd(0.22, 0.4), f = rnd(170, 250) * p, end = tt + 0.3;
      const src = v.osc('triangle', f, tt, end);
      const bp = v.filter('bandpass', f * 2.2, 2);
      const am = v.gain(0.5);
      const lfo = v.osc('square', rnd(26, 38), tt, end); const lg = v.gain(0.5); lfo.connect(lg); lg.connect(am.gain);
      const env = v.gain(0);
      env.gain.setValueAtTime(0, tt); env.gain.linearRampToValueAtTime(0.18, tt + 0.03); env.gain.setTargetAtTime(0, tt + 0.12, 0.04);
      src.connect(bp); bp.connect(am); am.connect(env); env.connect(out);
    }
    if (Math.random() < 0.6) {
      const tt = t + rnd(0.1, 0.9), f = rnd(4200, 5600) * p;
      for (let i = 0; i < 10; i++) v.tone(out, { type: 'sine', f, t: tt + i * 0.045, a: 0.002, d: 0.018, peak: 0.035 });
    }
    if (Math.random() < 0.5) {
      const f = rnd(900, 1700);
      v.tone(out, { type: 'sine', f, f2: f * 2.2, glide: 0.03, t: t + rnd(0, 1.2), a: 0.001, d: 0.08, peak: 0.12 });
    }
  } },
};
// automatic fishing (Au2) and the First Evening (FE-Au1): audio-af.js
export const AF_SFX = Object.keys(SFX_AF);
export const FE_SFX = Object.keys(SFX_FE);
export const V3_SFX = [...Object.keys(SFX_V3), ...AF_SFX, ...FE_SFX];
Object.assign(SFX, SFX_V3, SFX_AF, SFX_FE);

export const CONTRACT_SFX = ['ui_click', 'ui_hover', 'ui_open', 'ui_close', 'cast_whoosh', 'bobber_plop', 'nibble', 'bite',
  'hook', 'reel_tick', 'line_strain', 'line_snap', 'splash_small', 'splash_big', 'catch_fanfare', 'new_species', 'coin',
  'buy', 'eat', 'render_oil', 'flare', 'zap', 'aura_burn', 'enemy_spawn', 'enemy_hit', 'enemy_die', 'player_hurt',
  'heartbeat', 'gloom_rise', 'dawn', 'merchant_bell', 'xp_pickup', 'levelup', 'boon_pick', 'paddle', 'anchor',
  'boss_roar', 'challenge_complete', 'unlock', 'gate_open', 'descend', 'death', 'victory', 'denied'];
