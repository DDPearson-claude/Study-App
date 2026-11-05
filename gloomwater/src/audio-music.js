// audio-music.js — generative, melancholic, original ambient score for GLOOMWATER.
// A lookahead step sequencer (16th-note grid) drives one "layer" per mood × zone.
// Moods crossfade by running two layers at once. Every layer owns instrument buses
// (pad / lead / bass / perc / fx) with their own reverb & delay sends, persistent
// drones/wind, and a motif that is generated, then developed section by section.
import { mtof, clamp, envAHD, envASR, envSwell, jit, rnd, pick } from './audio-dsp.js';

// ------------------------------------------------------------------ harmony
const MODES = {
  ionian:   [0, 2, 4, 5, 7, 9, 11],
  dorian:   [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  aeolian:  [0, 2, 3, 5, 7, 8, 10],
  harmonic: [0, 2, 3, 5, 7, 8, 11],
  melodic:  [0, 2, 3, 5, 7, 9, 11],
};

/** Per-zone colour: key, mode, tempo, instruments, texture and default progressions. */
export const ZONE_MUSIC = {
  mossmere: {
    root: 50, mode: 'dorian', tempo: 70, swing: 0, lead: 'kalimba', lead2: 'harp', pad: 'warm',
    texture: 'drips', ost: 'bass', leadOct: 1, verb: 1.0, toll: 62,
    progs: [[0, 3, 0, 6], [0, 2, 6, 3], [0, 6, 2, 3], [0, 4, 3, 6]],
  },
  sporewood: {
    root: 46, mode: 'aeolian', tempo: 64, swing: 0.6, lead: 'marimba', lead2: 'harp', pad: 'wah',
    texture: 'spores', ost: 'marimba', leadOct: 2, verb: 1.1, toll: 58,
    progs: [[0, 5, 2, 6], [0, 3, 5, 4], [0, 6, 5, 6], [5, 6, 0, 0]],
  },
  glasswater: {
    root: 49, mode: 'melodic', tempo: 76, swing: 0, lead: 'glass', lead2: 'koto', pad: 'glass',
    texture: 'shards', ost: 'koto', leadOct: 1, verb: 1.25, toll: 61,
    progs: [[0, 3, 0, 4], [0, 2, 3, 0], [0, 1, 3, 4], [0, 3, 1, 4]],
  },
  paleabyss: {
    root: 48, mode: 'phrygian', tempo: 54, swing: 0, lead: 'harp', lead2: 'glass', pad: 'choir',
    texture: 'tolls', ost: 'bass', leadOct: 1, verb: 1.3, toll: 48,
    progs: [[0, 1, 0, 6], [0, 5, 1, 0], [0, 3, 5, 1], [0, 6, 5, 1]],
  },
};

const MOOD_PROGS = {
  dusk: [[0, 5, 2, 6], [0, 5, 3, 4], [0, 3, 5, 4]],
  gloom: [[0, 1, 0, 6], [0, 5, 1, 0], [0, 3, 1, 0], [0, 6, 1, 0]],
  reel: [[0, 5, 6, 4], [0, 6, 5, 4], [0, 3, 6, 4]],
  boss: [[0, 5, 4, 0], [0, 3, 4, 4], [0, 1, 4, 0]],
  death: [[0, 5, 3, 0], [0, 3, 5, 4]],
  victory: [[5, 3, 0, 4], [0, 4, 5, 3]],
  stillnight: [[0, 5, 3, 4], [0, 3, 5, 0], [0, 6, 3, 4], [0, 5, 2, 0]],
};

// The GLOOMWATER theme (original). Scale degrees in the zone's mode, 16th-note grid, 4 bars.
const THEME = [
  [0, 4], [6, 3], [8, 2], [12, 0], [16, 1], [22, 2], [24, -1],
  [32, 4], [38, 5], [40, 4], [44, 2], [48, 3], [54, 2], [56, 0],
].map(([s, d], i) => ({ s, d, i, v: 1 }));
const THEME_SLOTS = (() => { const a = new Array(64).fill(null); for (const n of THEME) a[n.s] = n; return a; })();
const TITLE_CHORDS = [0, 6, 2, 0, 3, 4, 6, 0];
const ARC = [0.7, 0.85, 1.0, 0.8];
const ARP6 = [0, 2, 4, 7, 9, 11];
const ARP4 = [0, 2, 4, 7];
const STABLE = [0, 2, 4, 7];
const SHARD_DEG = [0, 2, 4, 6, 7, 9];
const DEATH_FALL = [4, 2, 0, -1, -3];
const CASCADE = [7, 9, 11, 14, 16, 18];

// Ostinato patterns in scale degrees relative to the current chord (null = rest).
const GLOOM_OST = [[0, 0, 7, 0, 0, 0, 4, 0], [0, 0, 0, 7, 0, 1, 0, 0], [0, 7, 0, 0, 4, 0, 2, 0]];
const REEL_PAT = [
  [0, 7, 4, 7, 2, 7, 4, 7, 0, 7, 4, 7, 2, 9, 4, 7],
  [0, 4, 7, 4, 0, 4, 9, 4, 0, 4, 7, 4, 8, 7, 4, 2],
];
const BOSS_DRUMS = [1, 0, 0, 0.6, 0, 0, 0.8, 0, 1, 0, 0.6, 0, 0, 0.7, 0, 0.5];

// [dry, wet, delay] sends per instrument bus
const BUS_SENDS = { pad: [0.85, 0.55, 0], lead: [1.5, 0.34, 0.16], bass: [0.6, 0.12, 0], perc: [1, 0.2, 0], fx: [0.9, 0.8, 0.28] };

// ------------------------------------------------------------------ motifs
function nearestStable(d) {
  const m = ((d % 7) + 7) % 7;
  if (m === 0 || m === 2 || m === 4) return d;
  return m === 1 ? d - 1 : m === 3 ? d - 1 : m === 5 ? d - 1 : d + 1;
}
function genMotif() {
  const notes = [];
  let s = pick([0, 0, 2, 4]);
  let d = pick([0, 2, 4, 4, 7]);
  const count = 3 + ((Math.random() * 4) | 0);
  for (let i = 0; i < count && s < 30; i++) {
    notes.push({ s, d, v: 0.78 + Math.random() * 0.22, i });
    s += pick([2, 2, 4, 4, 4, 6, 6, 8]);
    d += Math.random() < 0.72 ? pick([-1, 1, -1, 1, -2, 2]) : pick([-3, 3, 4, -4]);
    d = clamp(d, -3, 9);
  }
  notes[notes.length - 1].d = nearestStable(notes[notes.length - 1].d);
  return notes;
}
function develop(m) {
  let n = m.map((x) => ({ ...x }));
  const op = pick(['seq', 'seq', 'invert', 'orn', 'thin', 'shift', 'tail']);
  if (op === 'seq') { const k = pick([-2, -1, 1, 2, 3]); n.forEach((x) => { x.d = clamp(x.d + k, -4, 10); }); }
  else if (op === 'invert') { const d0 = n[0].d; n.forEach((x) => { x.d = clamp(d0 - (x.d - d0), -4, 10); }); }
  else if (op === 'orn') {
    const out = [];
    for (let i = 0; i < n.length; i++) {
      out.push(n[i]);
      const nx = n[i + 1];
      if (nx && Math.abs(nx.d - n[i].d) >= 2 && nx.s - n[i].s >= 4) out.push({ s: n[i].s + 2, d: n[i].d + Math.sign(nx.d - n[i].d), v: 0.6 });
    }
    n = out;
  } else if (op === 'thin' && n.length > 3) n.splice(1 + ((Math.random() * (n.length - 2)) | 0), 1);
  else if (op === 'shift' && n.length > 2) {
    const i = 1 + ((Math.random() * (n.length - 1)) | 0);
    const ns = n[i].s + pick([-2, 2]);
    if (ns > n[i - 1].s && (!n[i + 1] || ns < n[i + 1].s) && ns < 32) n[i].s = ns;
  } else if (op === 'tail' && n.length >= 2) {
    const a = n[n.length - 2], b = n[n.length - 1];
    const gap = b.s - a.s, s0 = b.s + Math.max(2, gap);
    if (s0 + gap < 32) { n.push({ s: s0, d: a.d - 1, v: 0.7 }, { s: s0 + gap, d: nearestStable(b.d - 1), v: 0.75 }); }
  }
  n.sort((x, y) => x.s - y.s);
  n = n.filter((x, i) => x.s >= 0 && x.s < 32 && (i === 0 || x.s !== n[i - 1].s));
  n.forEach((x, i) => { x.i = i; });
  return n;
}
function slots(m) { const a = new Array(32).fill(null); for (const n of m) a[n.s] = n; return a; }
const isChordTone = (d, c) => { const r = (((d - c) % 7) + 7) % 7; return r === 0 || r === 2 || r === 4; };
function snap(d, c) {
  if (isChordTone(d, c)) return d;
  if (isChordTone(d - 1, c)) return d - 1;
  if (isChordTone(d + 1, c)) return d + 1;
  return d;
}

// ------------------------------------------------------------------ instruments
const PADS = {
  warm: { oscs: [['sawtooth', -8, 0.22, 1], ['triangle', 7, 0.6, 1], ['sine', 3, 0.1, 2]], ft: 'lowpass', c0: 260, c1: 1500, q: 0.7, lfo: 0.09, lfoD: 220, a: 2.6, r: 3.4, comp: 1 },
  wah: { oscs: [['sawtooth', -10, 0.32, 1], ['sawtooth', 10, 0.32, 1], ['triangle', 0, 0.25, 1]], ft: 'bandpass', c0: 420, c1: 950, q: 1.8, lfo: 0.16, lfoD: 360, a: 2.2, r: 3.0, comp: 1.7 },
  glass: { oscs: [['sine', 0, 0.5, 1], ['triangle', 5, 0.16, 2], ['sine', -4, 0.16, 2]], ft: 'lowpass', c0: 1300, c1: 3200, q: 0.5, lfo: 0.21, lfoD: 600, a: 2.0, r: 3.6, comp: 0.9 },
  choir: { oscs: [['sawtooth', -7, 0.34, 1], ['sawtooth', 7, 0.34, 1], ['sawtooth', 0, 0.12, 2]], formants: [520, 1080, 2450], q: 6, vib: [4.8, 9], a: 3.0, r: 3.6, comp: 2.6 },
  dark: { oscs: [['sawtooth', -12, 0.3, 1], ['sawtooth', 11, 0.3, 1], ['triangle', 0, 0.2, 1]], ft: 'lowpass', c0: 180, c1: 700, q: 1.4, lfo: 0.23, lfoD: 110, a: 1.8, r: 2.8, comp: 1.1 },
};

const BELL = [[0.5, 0.5, 7], [1, 0.55, 5], [1.19, 0.42, 4], [1.5, 0.25, 3], [2, 0.32, 3.2], [2.66, 0.18, 2], [3.01, 0.12, 1.5], [4.2, 0.08, 0.9]];
const METAL = [[1, 0.5, 1.4], [2.76, 0.3, 0.9], [5.4, 0.18, 0.5], [8.93, 0.1, 0.3]];

function makeInstruments(eng) {
  const I = {};
  I.kalimba = (dest, t, midi, vel, pan = 0) => {
    const v = eng.voice('m'); const f = mtof(midi); const out = v.pan(pan, dest);
    const dur = 1.2 + 1.4 * clamp((76 - midi) / 24, 0, 1);
    v.tone(out, { type: 'sine', f, t, a: 0.003, d: dur, peak: vel * 0.55 });
    v.tone(out, { type: 'sine', f: f * 2.0, t, a: 0.002, d: dur * 0.4, peak: vel * 0.07 });
    v.tone(out, { type: 'sine', f: f * 6.08, t, a: 0.001, d: 0.12, peak: vel * 0.12 });
    v.tone(out, { type: 'triangle', f: f * 3.0, t, a: 0.002, d: 0.35, peak: vel * 0.05 });
    v.done();
  };
  I.marimba = (dest, t, midi, vel, pan = 0) => {
    const v = eng.voice('m'); const f = mtof(midi); const out = v.pan(pan, dest);
    v.tone(out, { type: 'sine', f, t, a: 0.002, d: clamp((90 - midi) / 30, 0.35, 1.1), peak: vel * 0.46 });
    v.tone(out, { type: 'sine', f: f * 3.93, t, a: 0.001, d: 0.09, peak: vel * 0.14 });
    v.tone(out, { type: 'sine', f: f * 9.4, t, a: 0.001, d: 0.025, peak: vel * 0.04 });
    v.done();
  };
  I.glass = (dest, t, midi, vel, pan = 0) => {
    const v = eng.voice('m'); const f = mtof(midi); const out = v.pan(pan, dest);
    v.tone(out, { type: 'sine', f, t, a: 0.008, d: 2.6, peak: vel * 0.24 });
    v.tone(out, { type: 'sine', f: f * 1.0035, t, a: 0.012, d: 2.2, peak: vel * 0.15 });
    v.tone(out, { type: 'sine', f: f * 2.0, t, a: 0.004, d: 1.3, peak: vel * 0.08 });
    v.tone(out, { type: 'sine', f: f * 3.01, t, a: 0.003, d: 0.6, peak: vel * 0.045 });
    v.done();
  };
  const plucker = (timbre, lvl) => (dest, t, midi, vel, pan = 0) => {
    const v = eng.voice('m'); const out = v.pan(pan, dest);
    const g = v.gain(vel * lvl); g.connect(out);
    v.buffer(eng.ks(midi, timbre), t, 1, g);
    v.done();
  };
  I.harp = plucker('harp', 0.62);
  I.koto = plucker('koto', 0.5);
  I.muted = plucker('muted', 0.5);
  I.tight = plucker('tight', 0.62);
  I.bassks = plucker('bass', 0.6);
  I.sparkle = (dest, t, midi, vel, pan = 0) => {
    const v = eng.voice('m'); const f = mtof(midi); const out = v.pan(pan, dest);
    v.tone(out, { type: 'sine', f, t, a: 0.002, d: 0.9, peak: vel * 0.16 });
    v.tone(out, { type: 'sine', f: f * 4.0, t, a: 0.001, d: 0.12, peak: vel * 0.05 });
    v.done();
  };
  I.toll = (dest, t, midi, vel, pan = 0) => {
    const v = eng.voice('m'); const f = mtof(midi); const out = v.pan(pan, dest);
    const parts = eng.mobile ? 5 : BELL.length;
    for (let i = 0; i < parts; i++) { const [r, a, d] = BELL[i]; v.tone(out, { type: 'sine', f: f * r, t, a: 0.004, d, peak: vel * a * 0.3 }); }
    v.done();
  };
  I.clang = (dest, t, vel, f = 330) => {
    const v = eng.voice('m');
    for (const [r, a, d] of METAL) v.tone(dest, { type: 'sine', f: f * r * jit(0.01), t, a: 0.001, d, peak: vel * a * 0.35 });
    v.burst(dest, { t, a: 0.001, d: 0.12, peak: vel * 0.12, ft: 'highpass', f: 3500 });
    v.done();
  };
  I.pad = (dest, t, midis, hold, vel, flavor) => {
    const P = PADS[flavor] || PADS.warm;
    const v = eng.voice('m');
    const end = t + P.a + hold + P.r + 0.05;
    const amp = v.gain(0); amp.connect(dest);
    envASR(amp.gain, t, (vel * P.comp) / Math.sqrt(midis.length), P.a, hold, P.r);
    let head;
    if (P.formants) {
      head = v.gain(1);
      for (const fr of P.formants) { const bp = v.filter('bandpass', fr * jit(0.03), P.q); head.connect(bp); bp.connect(amp); }
    } else {
      const flt = v.filter(P.ft, P.c0, P.q);
      flt.frequency.setValueAtTime(P.c0, t);
      flt.frequency.linearRampToValueAtTime(P.c1, t + P.a * 1.1);
      flt.frequency.linearRampToValueAtTime(P.c0 * 1.3, end);
      const lfo = v.osc('sine', P.lfo * jit(0.2), t, end); const lg = v.gain(P.lfoD);
      lfo.connect(lg); lg.connect(flt.frequency);
      flt.connect(amp); head = flt;
    }
    let vib = null;
    if (P.vib) { const lfo = v.osc('sine', P.vib[0] * jit(0.1), t, end); vib = v.gain(P.vib[1]); lfo.connect(vib); }
    const nOsc = eng.mobile ? 2 : P.oscs.length;
    for (let k = 0; k < nOsc; k++) {
      const [type, det, lvl, ratio] = P.oscs[k];
      const sg = v.gain(lvl);
      sg.connect(k < 2 ? v.pan(k === 0 ? -0.5 : 0.5, head) : head);
      for (let i = 0; i < midis.length; i++) {
        const o = v.osc(type, mtof(midis[i]) * ratio, t, end, det + rnd(-3, 3));
        o.connect(sg);
        if (vib) vib.connect(o.detune);
      }
    }
    v.done();
  };
  I.bassLong = (dest, t, midi, hold, vel) => {
    const v = eng.voice('m'); const f = mtof(midi); const end = t + 0.3 + hold + 1.6;
    const amp = v.gain(0); amp.connect(dest);
    envASR(amp.gain, t, vel, 0.3, hold, 1.4);
    const flt = v.filter('lowpass', 420, 0.8); flt.connect(amp);
    v.osc('triangle', f, t, end).connect(flt);
    v.osc('sine', f * 2, t, end, 3).connect(flt);
    v.done();
  };
  I.bassPluck = (dest, t, midi, vel, bright = 0.5) => {
    const v = eng.voice('m'); const f = mtof(midi); const end = t + 0.6;
    const flt = v.filter('lowpass', 200, 4.5);
    flt.frequency.setValueAtTime(eng.fclamp(180 + 1500 * bright), t);
    flt.frequency.setTargetAtTime(110, t + 0.01, 0.08);
    const g = v.gain(0); envAHD(g.gain, t, vel * 0.5, 0.004, 0, 0.45);
    flt.connect(g); g.connect(dest);
    v.osc('sawtooth', f, t, end).connect(flt);
    const sq = v.osc('square', f, t, end, 7); const sg = v.gain(0.3); sq.connect(sg); sg.connect(flt);
    v.done();
  };
  I.brass = (dest, t, midis, hold, vel) => {
    const v = eng.voice('m'); const end = t + 0.03 + hold + 0.6;
    const flt = v.filter('lowpass', 200, 2.2);
    flt.frequency.setValueAtTime(160, t);
    flt.frequency.linearRampToValueAtTime(600 + 1800 * vel, t + 0.07);
    flt.frequency.setTargetAtTime(520, t + 0.07, 0.15);
    flt.frequency.setTargetAtTime(150, t + 0.03 + hold, 0.12);
    const amp = v.gain(0); envASR(amp.gain, t, (vel * 0.3) / Math.sqrt(midis.length), 0.03, hold, 0.45);
    flt.connect(amp); amp.connect(dest);
    const dets = eng.mobile ? [0] : [-9, 8];
    for (const m of midis) for (const d of dets) v.osc('sawtooth', mtof(m), t, end, d + rnd(-2, 2)).connect(flt);
    v.done();
  };
  I.swell = (dest, t, midis, rise, vel) => {
    const v = eng.voice('m'); const end = t + rise + 0.15;
    const flt = v.filter('lowpass', 200, 1.5);
    flt.frequency.setValueAtTime(200, t); flt.frequency.exponentialRampToValueAtTime(2600, t + rise);
    const amp = v.gain(0); envSwell(amp.gain, t, vel * 0.26, rise, 0.09);
    flt.connect(amp); amp.connect(dest);
    for (const m of midis) v.osc('sawtooth', mtof(m), t, end, rnd(-14, 14)).connect(flt);
    const n = v.noise('white', t, end); const hp = v.filter('highpass', 5000, 0.7); const ng = v.gain(0);
    envSwell(ng.gain, t, vel * 0.05, rise, 0.06);
    n.connect(hp); hp.connect(ng); ng.connect(dest);
    v.done();
  };
  I.tremolo = (dest, t, midis, hold, vel, rate) => {
    const v = eng.voice('m'); const end = t + 0.5 + hold + 0.9;
    const amp = v.gain(0); envASR(amp.gain, t, vel * 0.11, 0.5, hold, 0.8); amp.connect(dest);
    const trem = v.gain(0.55); trem.connect(amp);
    const lfo = v.osc('sine', rate, t, end); const lg = v.gain(0.45); lfo.connect(lg); lg.connect(trem.gain);
    const flt = v.filter('lowpass', 2600, 0.8); flt.connect(trem);
    for (const m of midis) { v.osc('sawtooth', mtof(m), t, end, -6).connect(flt); v.osc('sawtooth', mtof(m), t, end, 7).connect(flt); }
    v.done();
  };
  I.riser = (dest, t, dur, vel) => {
    const v = eng.voice('m');
    const b = v.burst(dest, { t, a: dur, d: 0.12, peak: vel * 0.12, ft: 'bandpass', f: 400, f2: 5200, glide: dur, q: 2.5 });
    b.g.gain.cancelScheduledValues(t); envSwell(b.g.gain, t, vel * 0.12, dur, 0.1);
    v.done();
  };
  I.taiko = (dest, t, vel, pitch = 1) => {
    const v = eng.voice('m');
    v.tone(dest, { type: 'sine', f: 175 * pitch, f2: 62 * pitch, glide: 0.2, t, a: 0.002, d: 0.7, peak: vel * 0.8 });
    v.burst(dest, { t, a: 0.001, d: 0.16, peak: vel * 0.32, ft: 'bandpass', f: 220 * pitch, q: 0.9 });
    v.burst(dest, { t, a: 0.001, d: 0.025, peak: vel * 0.16, ft: 'highpass', f: 2500, q: 0.7 });
    v.done();
  };
  I.heart = (dest, t, vel) => {
    const v = eng.voice('m');
    v.tone(dest, { type: 'sine', f: 120, f2: 52, glide: 0.1, t, a: 0.003, d: 0.3, peak: vel * 0.8 });
    v.burst(dest, { kind: 'pink', t, a: 0.002, d: 0.09, peak: vel * 0.4, ft: 'lowpass', f: 320, q: 0.7 });
    v.tone(dest, { type: 'sine', f: 105, f2: 48, glide: 0.1, t: t + 0.19, a: 0.003, d: 0.34, peak: vel * 0.6 });
    v.done();
  };
  I.tom = (dest, t, vel, f = 110) => {
    const v = eng.voice('m');
    v.tone(dest, { type: 'sine', f: f * 1.8, f2: f, glide: 0.12, t, a: 0.002, d: 0.45, peak: vel * 0.7 });
    v.burst(dest, { t, a: 0.001, d: 0.08, peak: vel * 0.18, ft: 'bandpass', f: f * 2.2, q: 1.2 });
    v.done();
  };
  I.shaker = (dest, t, vel) => {
    const v = eng.voice('m');
    v.burst(dest, { t, a: 0.003, d: 0.05, peak: vel * 0.16, ft: 'highpass', f: 7000, q: 0.7 });
    v.done();
  };
  I.drip = (dest, t, vel, f) => {
    const v = eng.voice('m');
    v.tone(dest, { type: 'sine', f, f2: f * 2.3, glide: 0.035, t, a: 0.001, d: 0.09, peak: vel * 0.22 });
    if (Math.random() < 0.4) v.tone(dest, { type: 'sine', f: f * 1.6, f2: f * 3, glide: 0.03, t: t + rnd(0.09, 0.2), a: 0.001, d: 0.06, peak: vel * 0.08 });
    v.done();
  };
  I.puff = (dest, t, vel) => {
    const v = eng.voice('m');
    v.burst(dest, { kind: 'pink', t, a: 0.05, d: 0.35, peak: vel * 0.09, ft: 'bandpass', f: rnd(1400, 2600), f2: rnd(600, 1000), q: 1.6 });
    v.done();
  };
  return I;
}

// ------------------------------------------------------------------ engine
export function createMusic(eng, io) {
  const ac = eng.ac;
  const I = makeInstruments(eng);
  const P = { tension: 0, danger: false, legend: false, intensity: 0.3, enemies: 0, nightK: 0, solo: null };
  const layers = [];
  let current = null;
  let errCount = 0;

  // ---------------------------------------------------------------- helpers
  const d2m = (L, d, oct = 0) => {
    const sc = L.scale, n = sc.length;
    const o = Math.floor(d / n), i = ((d % n) + n) % n;
    return L.zp.root + 12 * (oct + o) + sc[i];
  };
  const stepDur = (L, s) => {
    const base = 15 / Math.max(30, L.spec.tempo(L));
    const sw = L.spec.swing ? L.zp.swing : 0;
    if (!sw) return base;
    return (s & 1) === 0 ? base * 2 * sw : base * 2 * (1 - sw);
  };
  const barSec = (L) => 16 * 15 / Math.max(30, L.spec.tempo(L));
  const chordMidis = (L, c, ext = true) => {
    const out = [d2m(L, c), d2m(L, c + 4), d2m(L, c + 9)];
    if (ext && !eng.mobile) out.push(d2m(L, c + (Math.random() < 0.5 ? 8 : 6)));
    // keep pads in a comfortable register
    const lo = L.zp.root - 3;
    for (let i = 0; i < out.length; i++) while (out[i] > lo + 26) out[i] -= 12;
    return out;
  };
  const bassMidi = (L, c) => { let m = d2m(L, c, -1); if (m > L.zp.root - 5) m -= 12; return m; };
  const lead = (L, t, d, vel, inst, oct = 0, bus = 'lead') => {
    const m = d2m(L, d, L.zp.leadOct + oct);
    const fn = I[inst] || I.harp;
    fn(L.bus[bus], t + Math.random() * 0.012, clamp(m, 36, 100), vel * jit(0.08), rnd(-0.35, 0.35));
    L.lastNote = d;
  };
  const pad = (L, t, c, bars, vel, flavor) => {
    const P2 = PADS[flavor || L.zp.pad] || PADS.warm;
    const hold = Math.max(0.2, bars * barSec(L) - P2.a * 0.6);
    I.pad(L.bus.pad, t, chordMidis(L, c), hold, vel * 0.11, flavor || L.zp.pad);
  };
  function newSection(L, progs) {
    L.section++;
    L.motif = (!L.motif || L.section % 4 === 0) ? genMotif() : develop(L.motif);
    L.slotsA = slots(L.motif);
    L.slotsB = slots(develop(L.motif));
    const list = progs || L.progs;
    let p = pick(list);
    if (list.length > 1 && p === L.prog) p = pick(list);
    L.prog = p;
    L.ostIdx = (Math.random() * 3) | 0;
  }
  function texture(L, t, s, amt) {
    const pos = s & 15, bar = s >> 4;
    switch (L.zp.texture) {
      case 'drips':
        if (Math.random() < 0.032 * amt) I.drip(L.bus.fx, t + Math.random() * 0.05, rnd(0.5, 1) * amt, rnd(900, 2600));
        break;
      case 'spores':
        if (Math.random() < 0.018 * amt) I.puff(L.bus.fx, t, amt);
        if (Math.random() < 0.016 * amt) I.sparkle(L.bus.fx, t, d2m(L, pick(STABLE), 3), 0.5 * amt, rnd(-0.6, 0.6));
        break;
      case 'shards':
        if (Math.random() < 0.02 * amt) I.glass(L.bus.fx, t, d2m(L, pick(SHARD_DEG), 3), 0.38 * amt, rnd(-0.7, 0.7));
        break;
      case 'tolls':
        if (pos === 0 && bar % 6 === 3) I.toll(L.bus.fx, t, L.zp.toll, 0.35 * amt, rnd(-0.4, 0.4));
        if (Math.random() < 0.012 * amt) I.drip(L.bus.fx, t, rnd(0.4, 0.8) * amt, rnd(700, 1800));
        break;
      default: break;
    }
  }
  function startDrone(L, level, cut = 320) {
    const t = ac.currentTime + 0.05;
    const out = ac.createGain(); out.gain.value = 0;
    out.gain.setTargetAtTime(level, t, 1.6);
    out.connect(L.bus.pad);
    const flt = ac.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = cut; flt.Q.value = 0.6;
    flt.connect(out);
    const r = L.zp.root - 12;
    const freqs = [mtof(r), mtof(r + 12) * 1.003, mtof(r + 19)];
    const types = ['triangle', 'sine', 'sine'];
    L.persist.push(out, flt);
    for (let i = 0; i < (eng.mobile ? 2 : 3); i++) {
      const o = ac.createOscillator(); o.type = types[i]; o.frequency.value = freqs[i];
      o.connect(flt); o.start(t); L.persist.push(o);
    }
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.055 * jit(0.3);
    const lg = ac.createGain(); lg.gain.value = level * 0.45;
    lfo.connect(lg); lg.connect(out.gain); lfo.start(t);
    L.persist.push(lfo, lg);
  }
  function startWind(L, level) {
    const t = ac.currentTime + 0.05;
    const src = ac.createBufferSource(); src.buffer = eng.buf('pink'); src.loop = true;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 760; bp.Q.value = 1.6;
    const g = ac.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(level, t, 2);
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.045 * jit(0.3);
    const lg = ac.createGain(); lg.gain.value = 380;
    lfo.connect(lg); lg.connect(bp.frequency);
    src.connect(bp); bp.connect(g); g.connect(L.bus.fx);
    src.start(t, Math.random() * 1.5); lfo.start(t);
    L.persist.push(src, bp, g, lfo, lg);
  }

  // ---------------------------------------------------------------- moods
  function stepCalm(L, s, t) {
    const bar = s >> 4, pos = s & 15, b8 = bar & 7, zp = L.zp;
    if (pos === 0) {
      if (b8 === 0) newSection(L);
      if ((bar & 1) === 0) {
        const c = L.prog[b8 >> 1]; L.chord = c;
        pad(L, t, c, 2, 0.8);
        I.bassLong(L.bus.bass, t, bassMidi(L, c), 2 * barSec(L) - 0.6, 0.05);
      }
    }
    const arc = ARC[L.section & 3];
    let n = null;
    if (b8 < 2) n = L.slotsA[(b8 << 4) | pos];
    else if (b8 >= 4 && b8 < 6) n = L.slotsB[((b8 - 4) << 4) | pos];
    if (n) lead(L, t, pos === 0 ? snap(n.d, L.chord) : n.d, 0.55 * n.v * arc, zp.lead);
    if (b8 === 2 && pos < 12 && (pos & 1) === 0) {
      const k = pos >> 1;
      lead(L, t, L.chord + ARP6[k] - 7, 0.24 + 0.03 * k, zp.lead2);
    }
    if (b8 === 3 && pos === 4 && L.lastNote !== undefined) lead(L, t, L.lastNote, 0.2, zp.lead2, 1);
    if (b8 === 6 && L.section > 0 && (pos === 0 || pos === 6 || pos === 10)) lead(L, t, L.chord + (pos === 0 ? 4 : pos === 6 ? 2 : 0), 0.26, zp.lead2, 0);
    if (L.section % 4 === 2 && b8 === 7 && pos === 8) lead(L, t, 0, 0.18, 'glass', 1);
    texture(L, t, s, 1);
  }

  function stepTitle(L, s, t) {
    const bar = s >> 4, pos = s & 15, b8 = bar & 7, cyc = bar >> 3, zp = L.zp;
    if (pos === 0) {
      if (b8 === 0) newSection(L);
      const c = TITLE_CHORDS[b8]; L.chord = c;
      pad(L, t, c, 1, 0.85);
      if ((b8 & 1) === 0) I.bassLong(L.bus.bass, t, bassMidi(L, c), 2 * barSec(L) - 0.8, 0.045);
    }
    if (b8 < 4) {
      const n = THEME_SLOTS[(b8 << 4) | pos];
      if (n) {
        lead(L, t, n.d, cyc & 1 ? 0.5 : 0.58, cyc & 1 ? 'glass' : zp.lead, cyc & 1 ? 1 : 0);
        if (cyc & 1) lead(L, t + 0.01, n.d, 0.22, 'harp', -1);
      }
    } else {
      if (pos < 8 && (pos & 1) === 0 && (b8 === 4 || b8 === 7)) lead(L, t, L.chord + ARP4[pos >> 1] - 7, 0.24, 'harp');
      if (b8 === 5 || b8 === 6) { const n = L.slotsA[((b8 - 5) << 4) | pos]; if (n) lead(L, t, n.d, 0.36 * n.v, zp.lead2); }
    }
    texture(L, t, s, 0.7);
  }

  function stepDusk(L, s, t) {
    const bar = s >> 4, pos = s & 15, b8 = bar & 7, zp = L.zp;
    if (pos === 0) {
      if (b8 === 0) newSection(L);
      if ((bar & 1) === 0) {
        const c = L.prog[b8 >> 1]; L.chord = c;
        pad(L, t, c, 2, 0.85, zp.pad === 'glass' ? 'glass' : zp.pad === 'choir' ? 'choir' : 'dark');
        I.bassLong(L.bus.bass, t, bassMidi(L, c), 2 * barSec(L) - 0.6, 0.055);
      }
      if ((bar & 3) === 0) I.toll(L.bus.fx, t, zp.toll, 0.3, rnd(-0.3, 0.3));
    }
    if (pos === 0 || pos === 8) I.muted(L.bus.lead, t, d2m(L, L.chord + (pos === 0 ? 0 : 4), 0), pos === 0 ? 0.32 : 0.24, pos === 0 ? -0.25 : 0.25);
    let n = null;
    if (b8 >= 2 && b8 < 4) { n = L.slotsA[((b8 - 2) << 4) | pos]; if (n && n.i > 2) n = null; }
    else if (b8 >= 6) { n = L.slotsB[((b8 - 6) << 4) | pos]; if (n && n.i > 1) n = null; }
    if (n) lead(L, t, n.d, 0.4 * n.v, zp.lead2 === 'koto' ? 'koto' : 'harp');
    texture(L, t, s, 0.5);
  }

  // v3 (DESIGN §25.5, Au1): a Stillnight — a quiet night in any mode — plays this bed instead of the gloom mood. A slow,
  // sparse nocturne in the lake's colour: long glass pads, single high notes like stars on the water, the Night Rise
  // figure climbing low in the harp, the lake's own texture and a far toll; no heartbeat, no ostinato, no drums.
  function stepStillnight(L, s, t) {
    const bar = s >> 4, pos = s & 15, b8 = bar & 7, zp = L.zp;
    if (pos === 0) {
      if (b8 === 0) newSection(L);
      if ((bar & 3) === 0) {
        const c = L.prog[(b8 >> 2) * 2]; L.chord = c;
        pad(L, t, c, 4, 0.62, zp.pad === 'choir' ? 'choir' : 'glass');
        I.bassLong(L.bus.bass, t, bassMidi(L, c), 4 * barSec(L) - 0.8, 0.035);
      } else if ((bar & 3) === 2) L.chord = L.prog[(b8 >> 2) * 2 + 1];
    }
    let n = null;
    if (b8 === 1 || b8 === 2) n = L.slotsA[((b8 - 1) << 4) | pos];
    else if (b8 === 5 || b8 === 6) n = L.slotsB[((b8 - 5) << 4) | pos];
    if (n && (n.i & 1) === 0) lead(L, t, pos === 0 ? snap(n.d, L.chord) : n.d, 0.3 * n.v, 'glass', 1);
    if (b8 === 3 && (pos === 0 || pos === 4 || pos === 8)) lead(L, t, L.chord + (pos === 0 ? 0 : pos === 4 ? 4 : 7), 0.2 + pos * 0.006, 'harp', -1);
    if (b8 === 7 && pos === 8 && (L.section & 1) === 1) I.toll(L.bus.fx, t, zp.toll - 12, 0.14, rnd(-0.4, 0.4));
    texture(L, t, s, 0.6);
  }

  function ost(L, t, midi, vel, bright) {
    switch (L.zp.ost) {
      case 'marimba': I.marimba(L.bus.bass, t, midi + 12, vel * 0.9, 0); if ((L.step & 7) === 0) I.bassPluck(L.bus.bass, t, midi, vel * 0.5, bright * 0.5); break;
      case 'koto': I.tight(L.bus.bass, t, midi + 12, vel * 0.8, 0); I.bassPluck(L.bus.bass, t, midi, vel * 0.45, bright * 0.6); break;
      default: I.bassPluck(L.bus.bass, t, midi, vel, bright);
    }
  }

  function stepGloom(L, s, t) {
    const bar = s >> 4, pos = s & 15, b8 = bar & 7, zp = L.zp, In = P.intensity;
    if (pos === 0) {
      if (b8 === 0) newSection(L);
      if ((bar & 1) === 0) { const c = L.prog[b8 >> 1]; L.chord = c; pad(L, t, c, 2, 0.55, zp.pad === 'choir' ? 'choir' : 'dark'); }
      if ((bar & 3) === 3) {
        const c = L.prog[((b8 + 1) & 7) >> 1];
        I.swell(L.bus.pad, t, [d2m(L, c, 1), d2m(L, c, 1) + 1, d2m(L, c + 4, 1)], barSec(L), 0.35 + 0.4 * In);
      }
      if (In > 0.6 && (bar & 3) === 0) {
        const m = d2m(L, L.chord + 4, 1);
        I.tremolo(L.bus.pad, t, [m, m + 1], barSec(L) * 1.6, 0.6 + 0.5 * In, (L.spec.tempo(L) / 60) * 4);
      }
    }
    if ((pos & 1) === 0) {
      const k = pos >> 1, dd = GLOOM_OST[L.ostIdx][k];
      if (dd !== null) {
        let m = d2m(L, L.chord + dd, -1);
        while (m < zp.root - 14) m += 12;
        while (m > zp.root + 2) m -= 12;
        ost(L, t, m, (k === 0 || k === 3 ? 1 : 0.7) * (0.55 + 0.55 * In), 0.25 + 0.6 * In);
      }
    }
    if (pos === 0 || (In > 0.5 && pos === 8)) I.heart(L.bus.perc, t, 0.35 + 0.55 * In);
    if (In > 0.55 && (bar & 3) === 3 && (pos === 12 || pos === 14)) I.tom(L.bus.perc, t, 0.5 * In, pos === 12 ? 120 : 95);
    if (In > 0.72 && (pos & 1) === 1) I.shaker(L.bus.perc, t, 0.35 * In + (pos & 2 ? 0.1 : 0));
    if (b8 >= 4 && b8 < 6) {
      const n = L.slotsA[((b8 - 4) << 4) | pos];
      if (n && (n.i & 1) === 0) lead(L, t, n.d, 0.34, zp.lead === 'glass' ? 'glass' : 'harp', -1);
    }
    if (zp.texture === 'tolls' || zp.texture === 'shards') texture(L, t, s, 0.35);
  }

  function stepReel(L, s, t) {
    const bar = s >> 4, pos = s & 15, b8 = bar & 7, T = P.tension;
    if (pos === 0) {
      if (b8 === 0) newSection(L);
      const c = L.prog[bar & 3]; L.chord = c;
      pad(L, t, c, 1, 0.55, 'dark');
      if (P.legend) I.brass(L.bus.pad, t, [bassMidi(L, c) + 12, d2m(L, c + 4, -1)], 0.3, 0.6);
    }
    if (pos === 0 || pos === 8) L.trans = Math.round(clamp(T, 0, 1) * 5);
    // driving low pulse: 8ths, accents on the beat, filter opening with tension
    if ((pos & 1) === 0 && (pos % 4 === 0 || T > 0.45)) I.bassPluck(L.bus.bass, t, bassMidi(L, L.chord) + (pos === 6 || pos === 14 ? 12 : 0), pos % 8 === 0 ? 0.85 : 0.55, 0.35 + 0.5 * T);
    const dd = REEL_PAT[L.ostIdx & 1][pos];
    const m = d2m(L, L.chord + dd, 0) + (L.trans || 0);
    I.tight(L.bus.lead, t, m, ((pos & 3) === 0 ? 0.75 : 0.5) * (0.75 + 0.35 * T), (pos & 1) ? 0.25 : -0.25);
    if (pos === 0 || pos === 8 || (P.legend && (pos === 4 || pos === 12)) || (T > 0.7 && pos === 14)) I.taiko(L.bus.perc, t, 0.3 + 0.25 * T, 1.15);
    I.shaker(L.bus.perc, t, (pos & 1) ? 0.35 : 0.16);
    if (P.danger && (pos === 0 || pos === 8)) { const h = d2m(L, L.chord, 1); I.tremolo(L.bus.pad, t, [h + 1, h + 13], barSec(L) * 0.4, 0.9, 12); }
    if ((bar & 3) === 3 && pos === 0 && T > 0.55) I.riser(L.bus.fx, t, barSec(L), 0.8);
  }

  function stepBoss(L, s, t) {
    const bar = s >> 4, pos = s & 15, b8 = bar & 7, In = Math.max(0.5, P.intensity);
    if (pos === 0) {
      if (b8 === 0) newSection(L);
      if ((bar & 1) === 0) { const c = L.prog[b8 >> 1]; L.chord = c; pad(L, t, c, 2, 0.6, 'choir'); }
      const b = bassMidi(L, L.chord);
      I.brass(L.bus.pad, t, [b + 12, d2m(L, L.chord + 4, -1), d2m(L, L.chord + 2, 0)], 0.28, 0.75);
    }
    if ((bar & 1) === 1 && pos === 10) I.brass(L.bus.pad, t, [bassMidi(L, L.chord) + 12, d2m(L, L.chord + 4, -1)], 0.12, 0.55);
    const dr = BOSS_DRUMS[pos];
    if (dr) I.taiko(L.bus.perc, t, dr * (0.48 + 0.3 * In), pos % 8 === 0 ? 0.82 : 1.15);
    if ((pos & 1) === 0) I.bassPluck(L.bus.bass, t, bassMidi(L, L.chord) + (pos === 6 || pos === 14 ? 12 : 0), 0.42, 0.35 + 0.4 * In);
    if ((bar & 3) === 3 && pos === 12) I.clang(L.bus.fx, t, 0.6, 280);
    if (b8 >= 4) {
      const n = (b8 < 6 ? L.slotsA : L.slotsB)[((b8 & 1) << 4) | pos];
      if (n) I.brass(L.bus.lead, t, [d2m(L, n.d, 0)], 0.22, 0.5);
    }
    if (pos & 1) I.shaker(L.bus.perc, t, 0.18);
  }

  function stinger(L, t, kind) {
    if (kind === 'death') {
      I.taiko(L.bus.perc, t, 1, 0.5);
      I.toll(L.bus.fx, t, L.zp.toll - 12, 0.6, 0);
      I.brass(L.bus.pad, t, [d2m(L, 0, -1), d2m(L, 2, -1), d2m(L, 4, -1)], 2.2, 0.55);
      for (let i = 0; i < DEATH_FALL.length; i++) I.harp(L.bus.lead, t + 0.5 + i * 0.42, d2m(L, DEATH_FALL[i], 1), 0.5 - i * 0.05, rnd(-0.3, 0.3));
      I.pad(L.bus.pad, t + 0.2, [d2m(L, 0), d2m(L, 4), d2m(L, 9)], 2.5, 0.08, 'dark');
    } else {
      for (let i = 0; i < 12; i++) I.harp(L.bus.lead, t + i * 0.055, d2m(L, [0, 2, 4][i % 3] + 7 * Math.floor(i / 3) - 7, 1), 0.3 + i * 0.02, -0.5 + i / 11);
      const t2 = t + 0.72;
      I.pad(L.bus.pad, t2, [d2m(L, 0), d2m(L, 4), d2m(L, 9), d2m(L, 11)], 2.2, 0.1, 'glass');
      I.brass(L.bus.pad, t2, [d2m(L, 0, -1), d2m(L, 4, -1), d2m(L, 2, 0)], 1.6, 0.4);
      I.toll(L.bus.fx, t2, L.zp.toll + 12, 0.35, 0);
      for (let i = 0; i < 6; i++) I.glass(L.bus.fx, t2 + 0.1 + i * 0.13, d2m(L, CASCADE[i], 1), 0.35, rnd(-0.6, 0.6));
      for (let i = 0; i < 8; i++) I.taiko(L.bus.perc, t + i * (0.09 - i * 0.006), 0.15 + i * 0.05, 1.4);
    }
  }

  function stepDeath(L, s, t) {
    if (s === 0) { stinger(L, t, 'death'); return; }
    const bar = s >> 4;
    if (bar < 2) return;
    const b = bar - 2, pos = s & 15, b8 = b & 7;
    if (pos === 0) {
      if (b8 === 0) newSection(L);
      if ((b & 1) === 0) { const c = L.prog[b8 >> 1]; L.chord = c; pad(L, t, c, 2, 0.6, L.zp.pad === 'choir' ? 'choir' : 'warm'); }
    }
    if (b8 >= 1 && b8 < 5 && (pos & 1) === 0) {
      const n = THEME_SLOTS[((b8 - 1) << 3) | (pos >> 1)];
      if (n && n.i < 7) lead(L, t, n.d, 0.36, 'harp');
    }
    if (b8 === 6 && pos === 0) I.toll(L.bus.fx, t, L.zp.toll, 0.22, 0);
    texture(L, t, s, 0.4);
  }

  function stepVictory(L, s, t) {
    if (s === 0) { stinger(L, t, 'victory'); return; }
    const bar = s >> 4;
    if (bar < 2) return;
    const b = bar - 2, pos = s & 15, b8 = b & 7;
    if (pos === 0) {
      if (b8 === 0) newSection(L);
      if ((b & 1) === 0) { const c = L.prog[b8 >> 1]; L.chord = c; pad(L, t, c, 2, 0.75, L.zp.pad === 'choir' ? 'choir' : 'glass'); I.bassLong(L.bus.bass, t, bassMidi(L, c), 2 * barSec(L) - 0.6, 0.06); }
    }
    if (b8 < 4) { const n = THEME_SLOTS[(b8 << 4) | pos]; if (n) lead(L, t, n.d, 0.45, 'glass', 0); }
    else if (b8 >= 6 && pos < 12 && (pos & 1) === 0) lead(L, t, L.chord + ARP6[pos >> 1] - 7, 0.24, 'harp');
    if (Math.random() < 0.02) I.sparkle(L.bus.fx, t, d2m(L, pick(STABLE), 3), 0.4, rnd(-0.6, 0.6));
  }

  const MOODS = {
    title: { mode: (zp) => zp.mode, tempo: (L) => L.zp.tempo * 0.86, swing: true, drone: 0.05, wind: 0.035, step: stepTitle },
    calm: { mode: (zp) => zp.mode, tempo: (L) => L.zp.tempo, swing: true, drone: 0.045, wind: 0.028, step: stepCalm },
    dusk: { mode: (zp) => (zp.mode === 'phrygian' ? 'phrygian' : 'aeolian'), progs: MOOD_PROGS.dusk, tempo: (L) => L.zp.tempo * 0.94, drone: 0.06, wind: 0.04, step: stepDusk },
    gloom: { mode: () => 'phrygian', progs: MOOD_PROGS.gloom, tempo: () => 84 + 18 * P.intensity, drone: 0.065, step: stepGloom },
    reel: { mode: () => 'aeolian', progs: MOOD_PROGS.reel, tempo: () => 106 + 26 * P.tension, step: stepReel },
    boss: { mode: () => 'harmonic', progs: MOOD_PROGS.boss, tempo: () => 98, drone: 0.06, step: stepBoss },
    death: { mode: (zp) => (zp.mode === 'phrygian' ? 'phrygian' : 'aeolian'), progs: MOOD_PROGS.death, tempo: () => 50, drone: 0.045, wind: 0.04, step: stepDeath },
    victory: { mode: () => 'ionian', progs: MOOD_PROGS.victory, tempo: () => 66, wind: 0.02, step: stepVictory },
    // v3: a quiet night (only audio's v3 night rule picks it; see audio-v3.js nightMood)
    stillnight: { mode: (zp) => (zp.mode === 'phrygian' ? 'aeolian' : zp.mode), progs: MOOD_PROGS.stillnight, tempo: (L) => L.zp.tempo * 0.78, drone: 0.04, wind: 0.032, step: stepStillnight },
  };

  // ---------------------------------------------------------------- layers
  function makeLayer(mood, zoneId, fadeIn) {
    const spec = MOODS[mood] || MOODS.calm;
    const zp = ZONE_MUSIC[zoneId] || ZONE_MUSIC.mossmere;
    const now = ac.currentTime;
    const L = {
      mood, zoneId, spec, zp, scale: MODES[spec.mode(zp)] || MODES.aeolian, progs: spec.progs || zp.progs,
      step: 0, nextTime: now + 0.08, stopAt: 0, killAt: 0, section: -1, chord: 0, prog: (spec.progs || zp.progs)[0],
      persist: [], bus: {}, outs: [], ostIdx: 0, trans: 0, motif: null, slotsA: new Array(32).fill(null), slotsB: new Array(32).fill(null),
    };
    const mk = (dest) => { const g = ac.createGain(); g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(1, now + Math.max(0.03, fadeIn)); g.connect(dest); L.outs.push(g); return g; };
    const outDry = mk(io.dry), outWet = mk(io.wet), outDly = mk(io.dly);
    for (const name in BUS_SENDS) {
      const [dry, wet, dly] = BUS_SENDS[name];
      const b = ac.createGain(); b.gain.value = P.solo && P.solo !== name ? 0 : dry;
      b.connect(outDry);
      const w = ac.createGain(); w.gain.value = wet * zp.verb; b.connect(w); w.connect(outWet);
      L.persist.push(b, w);
      if (dly > 0) { const dl = ac.createGain(); dl.gain.value = dly; b.connect(dl); dl.connect(outDly); L.persist.push(dl); }
      L.bus[name] = b;
    }
    if (spec.drone) startDrone(L, spec.drone, mood === 'gloom' || mood === 'boss' ? 260 : 340);
    if (spec.wind && !eng.mobile) startWind(L, spec.wind);
    layers.push(L);
    return L;
  }
  function stopLayer(L, fade) {
    if (L.stopAt) return;
    const now = ac.currentTime;
    for (const g of L.outs) {
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.linearRampToValueAtTime(0, now + Math.max(0.03, fade));
    }
    L.stopAt = now + fade;
    L.killAt = now + fade + 0.4;
  }
  function killLayer(L) {
    for (const n of L.persist) { try { n.stop?.(); } catch { /* not a source */ } try { n.disconnect(); } catch { /* ignore */ } }
    for (const g of L.outs) { try { g.disconnect(); } catch { /* ignore */ } }
    L.persist.length = 0; L.outs.length = 0;
    const i = layers.indexOf(L); if (i >= 0) layers.splice(i, 1);
  }

  function setMood(mood, zoneId, opts = {}) {
    if (!MOODS[mood]) return false;
    if (current && current.mood === mood && current.zoneId === zoneId && !current.stopAt) return false;
    const prev = current ? current.mood : null;
    let fade = opts.fade;
    if (fade === undefined) {
      if (mood === 'death' || mood === 'victory') fade = 1.2;
      else if (mood === 'boss') fade = 1.6;
      else if (mood === 'reel' || prev === 'reel') fade = 2.0;
      else if (prev === mood) fade = 4.0;            // zone colour change
      else fade = 3.0;
    }
    if (current) stopLayer(current, fade);
    // too many overlapping layers (rapid switching) → drop the oldest quickly
    while (layers.filter((l) => !l.killAt || l.killAt > ac.currentTime).length > 3) {
      const old = layers.find((l) => l !== current);
      if (!old) break;
      killLayer(old);
    }
    const fadeIn = mood === 'death' || mood === 'victory' ? 0.05 : fade;
    current = makeLayer(mood, zoneId, fadeIn);
    return true;
  }

  const LOOKAHEAD = 0.12;
  function tick() {
    if (ac.state !== 'running') return;
    const now = ac.currentTime, horizon = now + LOOKAHEAD;
    for (let li = layers.length - 1; li >= 0; li--) {
      const L = layers[li];
      if (L.killAt && now > L.killAt) { killLayer(L); continue; }
      if (L.nextTime < now - 0.3) L.nextTime = now + 0.02;   // fell behind (throttled timer)
      let guard = 0;
      while (L.nextTime < horizon && guard++ < 24) {
        if (L.stopAt && L.nextTime >= L.stopAt) { L.nextTime = Infinity; break; }
        const t = Math.max(L.nextTime, now + 0.005);
        if (!api.silent || !L.motif) try { L.spec.step(L, L.step, t); } catch (e) {
          if (errCount++ < 3) io.onError?.(e);
        }
        L.nextTime += stepDur(L, L.step);
        L.step++;
      }
    }
  }
  function stopAll(fade = 1) { for (const L of layers.slice()) stopLayer(L, fade); current = null; }

  const api = {
    silent: false,                 // music muted → keep time, skip building notes (CPU)
    params: P, layers, tick, setMood, stopAll,
    get mood() { return current ? current.mood : null; },
    get zone() { return current ? current.zoneId : null; },
    moods: Object.keys(MOODS),
  };
  return api;
}
