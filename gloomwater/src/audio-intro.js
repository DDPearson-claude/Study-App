// audio-intro.js — the opening cut scene's sound cue (LANE B "director and flow"; imported only by audio.js and the offline
// render tool). docs/v3/intro/SPEC.md §7.7, DESIGN §20, CONTRACT §13.13. One original cue in D Dorian (the Mossmere's key),
// synthesised on WebAudio with no samples, from the recipes in INTRO.sound.marks:
//
//   0.0–8.2  a bowed drone, D2 + A2 (two saws a few cents apart on each note, under a lowpass, swelling in)
//   1.0      one great bell, D3 (five sine partials, a long decay)
//   1.4–5.9  a glass chord, D4 – A4 – E5 (sine partials 1 / 2.76 / 5.4, a slow attack)
//   5.6      the chain parts: one small bright tick falling 2.2 → 1.6 kHz
//   5.9–7.9  the fall: the chord's top voice sinks a fifth, E5 → A4, the drone's root a semitone, D2 → C♯2
//   7.9      the contact: a sub thump 80 → 40 Hz and a low bell, A1; a 300 Hz lowpass closes on the whole cue
//   8.2–12.4 the deep: a sub drone, D1 + A1, under that lowpass; one slow, patient groan 70 → 52 Hz (never a sting)
//   12.5     the spark: a tiny tick past the lowpass, which opens to 6 kHz over 0.8 s
//   14.6     a solo harp: D4, F4, A4, G4 (the Mossmere motif's first four notes) at 58 BPM; the last one rings on
// (`ember_swell` at 9.0 and `flame_catch` at 12.8 are the game's own SFX: audio.js plays them on the SFX bus.)
//
// The cue is a bus of its own: voices → lowpass → level → the music gain (so the master and music sliders apply), with a send to
// the cavern reverb. It keeps no clock: the caller plays one event (src/intro.js soundEvents: {id, kind: 'on' | 'off' | 'note'})
// when the film's clock crosses it, at an audio time `at`. A skip ramps the level to 0 (`fade`), never stopping a wave mid-cycle;
// the sources are stopped only after the ramp has ended.
//
// API (createIntroCue(eng, {dry, wet}, INTRO.sound, {log})):
//   play(event, at) -> bool    one clock event at audio time `at` (default: now)
//   fade(seconds, at)          the level to 0 over `seconds`, then every source stops (a skip, a stop)
//   end(at)                    the film is over: sustained voices let go, the last notes ring
//   release()                  disconnect everything now
//   level -> the cue's level AudioParam's node (tests read its schedule) ; voices() -> sounding voices ; fired -> [event ids]
import { mtof } from './audio-dsp.js';

const db = (d) => Math.pow(10, (Number(d) || 0) / 20);
const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const OPEN = 16000;          // the bus lowpass when it is out of the way
const HELD = 90;             // a sustained source's own safety stop (s): the film can never outlast it
/** The cue's make-up gain: the table's levels are relative; this puts the loudest moment (the contact) near INTRO.sound.peakDb. */
export const CUE_GAIN = 1.45;

export function createIntroCue(eng, dest, sound, opts = {}) {
  const ac = eng.ac;
  const S = sound || {};
  const marks = Object.fromEntries((S.marks || []).map((m) => [m.id, m]));
  const fired = [];
  const voices = [];           // every Voice of the cue (sources are stopped through them after a fade)
  const held = { drone: null, glass: [], top: null, deep: null };
  let dead = false;

  // ---------------------------------------------------------------- the bus
  const g = (v = 1) => { const n = ac.createGain(); n.gain.value = v; return n; };
  const pre = g(1);                         // voices under the lowpass
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = eng.fclamp(OPEN); lp.Q.value = 0.5;
  const past = g(1);                        // voices past the lowpass (the spark)
  const level = g(CUE_GAIN);                // the cue's level: a skip ramps this
  const wet = g(num(S.wet, 0.5));
  pre.connect(lp); lp.connect(level); past.connect(level);
  if (dest?.dry) level.connect(dest.dry);
  if (dest?.wet) { level.connect(wet); wet.connect(dest.wet); }
  const nodes = [pre, lp, past, level, wet];

  const voice = () => { const v = eng.voice('m'); voices.push(v); return v; };
  const T = (at) => Math.max(num(at, ac.currentTime), ac.currentTime) + 0.005;
  /** Let a sustained voice go: its gain to 0 over `rel` s (a time constant, so no click), then its sources stop. */
  function letGo(h, at, rel = 0.4) {
    if (!h || h.gone) return;
    h.gone = true;
    const t = T(at);
    try { h.g.gain.cancelScheduledValues(t); h.g.gain.setTargetAtTime(0, t, Math.max(0.01, rel / 4)); } catch { /* ignore */ }
    for (const s of h.src) { try { s.stop(t + rel + 0.1); } catch { /* ended */ } }
  }

  // ---------------------------------------------------------------- the sections
  const ON = {
    /** The bowed drone: two saws a few cents apart on each note, a dark lowpass, a slow swell, a slower breath on the bow. */
    drone(m, at) {
      const t = T(at), v = voice(), L = db(m.db ?? -18), cents = num(m.cents, 6);
      const flt = v.filter('lowpass', num(m.lowpass, 420), 0.7);
      const gg = v.gain(0);
      flt.connect(gg); gg.connect(pre);
      const src = [], byNote = [];
      for (const midi of m.notes || [38, 45]) {
        const pair = [];
        for (const c of [-cents, cents]) { const o = v.osc('sawtooth', mtof(midi), t, t + HELD, c); const og = v.gain(0.3); o.connect(og); og.connect(flt); src.push(o); pair.push(o); }
        byNote.push({ midi, osc: pair });
      }
      gg.gain.setValueAtTime(0, t);
      gg.gain.linearRampToValueAtTime(L, t + Math.max(0.05, num(m.swell, 1.2)));
      const lfo = v.osc('sine', 0.21, t, t + HELD); const lg = v.gain(L * 0.14); lfo.connect(lg); lg.connect(gg.gain); src.push(lfo);
      v.done();
      held.drone = { v, g: gg, src, byNote };
    },
    /** One great bell: sine partials, the high ones dying first; a soft low knock for the hammer. */
    bell(m, at) {
      const t = T(at), v = voice(), L = db(m.db ?? -14), f = mtof((m.notes || [50])[0]), decay = num(m.decay, 6);
      const P = m.partials || [1, 2.0, 2.4, 3.0, 4.5], A = [1, 0.46, 0.3, 0.22, 0.1], D = [1, 0.62, 0.45, 0.34, 0.2];
      const sum = P.reduce((s, _, i) => s + (A[i] ?? 0.08), 0);
      P.forEach((r, i) => v.tone(pre, { type: 'sine', f: f * r, t, a: 0.006, d: decay * (D[i] ?? 0.2), peak: (L * (A[i] ?? 0.08)) / sum * 1.6 }));
      v.tone(pre, { type: 'sine', f: f / 2, t, a: 0.004, d: 0.22, peak: L * 0.35 });
      v.done();
    },
    /** The glass chord: per note three sine partials and a faint second voice a few cents up, so it shimmers. Held until `off`. */
    glass(m, at) {
      const t = T(at), L = db(m.db ?? -20), notes = m.notes || [62, 69, 76], P = m.partials || [1, 2.76, 5.4], A = [1, 0.22, 0.06];
      held.glass = notes.map((midi, k) => {
        const v = voice(), gg = v.gain(0), src = [], main = [];
        gg.connect(pre);
        P.forEach((r, i) => { const o = v.osc('sine', mtof(midi) * r, t, t + HELD); const og = v.gain(A[i] ?? 0.05); o.connect(og); og.connect(gg); src.push(o); main.push({ o, r }); });
        const sh = v.osc('sine', mtof(midi), t, t + HELD, 5); const sg = v.gain(0.3); sh.connect(sg); sg.connect(gg); src.push(sh); main.push({ o: sh, r: 1 });
        gg.gain.setValueAtTime(0, t);
        gg.gain.linearRampToValueAtTime((L / notes.length) * 1.5, t + Math.max(0.02, num(m.attack, 0.4)) + k * 0.12);
        v.done();
        return { v, g: gg, src, main, midi, level: (L / notes.length) * 1.5 };
      });
    },
    /** The chain parts: one small bright tick, falling. */
    ping(m, at) {
      const t = T(at), v = voice(), L = db(m.db ?? -16), hz = m.hz || [2200, 1600], dur = num(m.dur, 0.08);
      v.tone(pre, { type: 'sine', f: hz[0], f2: hz[1], glide: dur, t, a: 0.001, d: 0.16, peak: L });
      v.tone(pre, { type: 'sine', f: hz[0] * 2.7, f2: hz[1] * 2.7, glide: dur, t, a: 0.001, d: 0.05, peak: L * 0.3 });
      v.burst(pre, { kind: 'white', t, a: 0.0005, d: 0.012, peak: L * 0.5, ft: 'bandpass', f: 3600, q: 2 });
      v.done();
    },
    /** The fall: the chord's top voice sinks a fifth and thins, the drone's root sinks a semitone. */
    fallBend(m, at) {
      const t = T(at), dur = Math.max(0.1, num(m.to, m.t + 2) - m.t), B = m.bend || {};
      const from = B.from || [], to = B.to || [];
      const top = held.top || held.glass.at(-1);
      if (top && !top.gone && Number.isFinite(to[0])) {
        const ratio = mtof(to[0]) / mtof(num(from[0], top.midi));
        for (const { o, r } of top.main) { try { o.frequency.setValueAtTime(mtof(top.midi) * r, t); o.frequency.exponentialRampToValueAtTime(eng.fclamp(mtof(top.midi) * r * ratio), t + dur); } catch { /* ignore */ } }
        try { top.g.gain.setTargetAtTime(top.level * 0.5, t, dur / 3); } catch { /* ignore */ }
        held.top = top;
      }
      const d = held.drone;
      if (d && !d.gone && Number.isFinite(to[1])) {
        const n = d.byNote.find((x) => x.midi === from[1]);
        for (const o of n ? n.osc : []) { try { o.frequency.setValueAtTime(mtof(n.midi), t); o.frequency.exponentialRampToValueAtTime(mtof(to[1]), t + dur); } catch { /* ignore */ } }
      }
    },
    /** The contact: a sub thump, a low bell, and the lowpass closing on everything. */
    impact(m, at) {
      const t = T(at), v = voice(), L = db(m.db ?? -12), hz = m.hz || [80, 40];
      v.tone(pre, { type: 'sine', f: hz[0], f2: hz[1], glide: 0.2, t, a: 0.004, d: 0.6, peak: L * 0.9 });
      v.burst(pre, { kind: 'brown', t, a: 0.004, d: 0.3, peak: L * 0.5, ft: 'lowpass', f: 220, q: 0.6 });
      const f = mtof((m.notes || [33])[0]);
      [[1, 1, 3.6], [2, 0.5, 2.4], [2.4, 0.3, 1.6], [3, 0.2, 1.1]].forEach(([r, a, d]) => v.tone(pre, { type: 'sine', f: f * r, t, a: 0.005, d, peak: L * 0.42 * a }));
      v.done();
      try { lp.frequency.cancelScheduledValues(t); lp.frequency.setTargetAtTime(num(m.lowpass, 300), t, Math.max(0.01, num(m.over, 0.15) / 3)); } catch { /* ignore */ }
    },
    /** The deep: a sub drone under the lowpass, with a faint octave so a small speaker still hears it breathe. */
    deep(m, at) {
      const t = T(at), v = voice(), L = db(m.db ?? -20), gg = v.gain(0), src = [];
      gg.connect(pre);
      for (const midi of m.notes || [26, 33]) {
        const o = v.osc('sine', mtof(midi), t, t + HELD); const og = v.gain(0.75); o.connect(og); og.connect(gg); src.push(o);
        const o2 = v.osc('triangle', mtof(midi + 12), t, t + HELD, 4); const og2 = v.gain(0.16); o2.connect(og2); og2.connect(gg); src.push(o2);
      }
      gg.gain.setValueAtTime(0, t);
      gg.gain.linearRampToValueAtTime(L * 0.85, t + 0.7);
      const lfo = v.osc('sine', 0.13, t, t + HELD); const lg = v.gain(L * 0.17); lfo.connect(lg); lg.connect(gg.gain); src.push(lfo);
      v.done();
      held.deep = { v, g: gg, src };
    },
    /** One slow groan, sinking: something very large turning over, a long way down. Patient: it swells and goes, no attack. */
    groan(m, at) {
      const t = T(at), v = voice(), L = db(m.db ?? -18), hz = m.hz || [70, 52], dur = num(m.dur, 2.5), end = t + dur + 0.9;
      const flt = v.filter('lowpass', 190, 2.2);
      const gg = v.gain(0);
      flt.connect(gg); gg.connect(pre);
      const o = v.osc('sawtooth', hz[0], t, end); o.frequency.setValueAtTime(hz[0], t); o.frequency.exponentialRampToValueAtTime(hz[1], t + dur); o.connect(flt);
      const s = v.osc('sine', hz[0] / 2, t, end); s.frequency.setValueAtTime(hz[0] / 2, t); s.frequency.exponentialRampToValueAtTime(hz[1] / 2, t + dur);
      const sg = v.gain(0.7); s.connect(sg); sg.connect(gg);
      flt.frequency.setValueAtTime(150, t); flt.frequency.linearRampToValueAtTime(260, t + dur * 0.45); flt.frequency.linearRampToValueAtTime(140, t + dur);
      gg.gain.setValueAtTime(0, t);
      gg.gain.linearRampToValueAtTime(L * 0.42, t + dur * 0.4);
      gg.gain.setValueAtTime(L * 0.42, t + dur * 0.6);
      gg.gain.linearRampToValueAtTime(0, end - 0.05);
      const wob = v.osc('sine', 2.6, t, end); const wg = v.gain(L * 0.06); wob.connect(wg); wg.connect(gg.gain);
      v.done();
    },
    /** The spark: a tiny tick that the lowpass does not cover; then the lowpass opens. */
    spark(m, at) {
      const t = T(at), v = voice(), L = db(m.db ?? -22);
      v.burst(past, { kind: 'white', t, a: 0.0005, d: 0.014, peak: L * 1.6, ft: 'bandpass', f: 3400, q: 2.5 });
      v.tone(past, { type: 'sine', f: 1900, f2: 1500, glide: 0.03, t, a: 0.001, d: 0.05, peak: L });
      v.done();
      try { lp.frequency.cancelScheduledValues(t); lp.frequency.setTargetAtTime(eng.fclamp(num(m.lowpass, 6000)), t, Math.max(0.01, num(m.over, 0.8) / 3)); } catch { /* ignore */ }
    },
  };
  const OFF = {
    drone(m, at) { letGo(held.drone, at, 0.12); },                       // the hard cut: gone with the picture
    glass(m, at) {                                                        // the lower voices let go; the top one waits to fall
      const all = held.glass.filter((h) => h && !h.gone);
      if (!all.length) return;
      const top = marks.fallBend ? all.at(-1) : null;
      for (const h of all) if (h !== top) letGo(h, at, 1.4);
      held.top = top;
      if (top) { for (const s of top.src) { try { s.stop(T(at) + 8); } catch { /* ended */ } } }
    },
    fallBend(m, at) { letGo(held.top, at, 0.25); held.top = null; },
    deep(m, at) { letGo(held.deep, at, 0.6); },
  };
  /** One harp note (Karplus–Strong, the engine's own harp): the motif's notes die away, the last one rings. */
  function note(e, at) {
    const m = e.mark || marks[e.id] || {}, t = T(at), v = voice(), L = db(m.db ?? -12);
    const last = e.i === (e.n ?? (m.notes || []).length) - 1;
    const gg = v.gain(L * 1.55 * (e.i === 0 ? 1 : 0.92));
    gg.connect(pre);
    v.buffer(eng.ks(e.midi, 'harp'), t, 1, gg);
    if (!last) { try { gg.gain.setTargetAtTime(0, t + 0.12, Math.max(0.1, num(m.decay, 1.2) / 2)); } catch { /* ignore */ } }
    v.done();
  }

  const api = {
    level, lowpass: lp, fired,
    play(e, at) {
      if (dead || !e) return false;
      try {
        if (e.kind === 'note') note(e, at);
        else if (e.kind === 'off') { if (!OFF[e.id]) return false; OFF[e.id](e.mark || marks[e.id] || {}, at); }
        else { if (!ON[e.id]) return false; ON[e.id](e.mark || marks[e.id] || {}, at); }
      } catch (err) { try { opts.onError?.(err); } catch { /* ignore */ } return false; }
      fired.push(e.kind === 'on' ? e.id : `${e.id}:${e.kind}${e.kind === 'note' ? e.i : ''}`);
      return true;
    },
    /** The level to 0 over `seconds` (a linear ramp from where it is), then every source stops. */
    fade(seconds = 0.25, at) {
      if (dead) return 0;
      const t = T(at), s = Math.max(0.02, num(seconds, 0.25));
      try { level.gain.cancelScheduledValues(t); level.gain.setValueAtTime(level.gain.value, t); level.gain.linearRampToValueAtTime(0, t + s); } catch { /* ignore */ }
      for (const v of voices) for (const n of v.nodes) { if (typeof n.stop === 'function') { try { n.stop(t + s + 0.04); } catch { /* ended */ } } }
      return t + s + 0.04;
    },
    /** The film is over: whatever is still held lets go, the bells and the last harp note ring out by themselves. */
    end(at) {
      for (const h of [held.drone, held.deep, held.top, ...held.glass]) letGo(h, at, 0.5);
      return T(at) + num(S.endRing, 3.2);
    },
    release() {
      if (dead) return;
      dead = true;
      for (const v of voices) { for (const n of v.nodes) { if (typeof n.stop === 'function') { try { n.stop(0); } catch { /* ended */ } } } try { v.cleanup(); } catch { /* ignore */ } }
      voices.length = 0;
      for (const n of nodes) { try { n.disconnect(); } catch { /* ignore */ } }
    },
    get dead() { return dead; },
    voices: () => voices.filter((v) => !v.closed).length,
  };
  return api;
}
