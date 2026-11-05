// audio-af.js — the synthesised sounds of automatic fishing and the First Evening (DESIGN §25.6, §25.4.8; §25.14.2a Au2, §25.14.2b
// FE-Au1; CONTRACT §13.7 audio). Same shape as audio-sfx.js: { fn(v, out, t, p, o, eng), gain, wet, dly, gap, max, pri, pj, vj, duck }.
// audio-sfx.js merges these into SFX, so audio.play(name) reaches them; only v3 events (fishing:strike / fishing:reel /
// fishing:escaped with a v3 cause / fishing:caught after an automatic play / the Landing's zone:change / firstEvening:*) fire them.
//
// Every play sound is shaped by what the beat carries and nothing else (audio-v3.js beatSounds): o.k (0–1, the class length on a log
// scale), o.tier (the mean fitted tier), o.dur (real seconds), o.strength, o.cls. A small fish is quick, light and bright; a big one
// slow, heavy and low. A better reel purrs where a winch grinds. Nothing here knows a species except the voices, which only
// fishing:caught (the reveal) plays.
import { mtof, clamp, rnd, envSwell } from './audio-dsp.js';

const lerp = (a, b, k) => a + (b - a) * k;
const K = (o) => clamp(typeof o?.k === 'number' ? o.k : 0.4, 0, 1);
const D = (o, d = 0.6) => clamp(typeof o?.dur === 'number' && o.dur > 0 ? o.dur : d, 0.05, 12);

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
/** attack → hold → release on a gain param (linear), for sustained beats. */
function asr(param, t, peak, a, end, r) {
  param.setValueAtTime(0, t);
  param.linearRampToValueAtTime(peak, t + a);
  param.setValueAtTime(peak, Math.max(t + a, end - r));
  param.linearRampToValueAtTime(0, end);
}
/** A splash scaled by the class length: the wash, the body, the droplets (k 0 a minnow's flick … 1 a giant's crash). */
function splash(v, out, t, k, pk = 1, p = 1) {
  v.burst(out, { t, a: 0.005, d: 0.28 + 0.5 * k, peak: 0.62 * pk, ft: 'lowpass', f: 3200 * p, f2: 460 * p, glide: 0.35 + 0.3 * k, q: 0.7 });
  v.burst(out, { kind: 'pink', t, a: 0.004, d: 0.22 + 0.25 * k, peak: 0.38 * pk, ft: 'bandpass', f: 760 * p, q: 0.8 });
  v.tone(out, { type: 'sine', f: 150 * p, f2: 48 * p, glide: 0.18, t, a: 0.003, d: 0.16 + 0.3 * k, peak: (0.18 + 0.45 * k) * pk });
  droplets(v, out, t + 0.1, 3 + Math.round(6 * k), 0.35 + 0.4 * k, 0.1 * pk, 900, 2900);
}
/** A short wooden creak (rod, raft, mooring rope): a buzzing low saw through a narrow formant, fluttering. */
function creak(v, out, t, f, dur, peak, form = 620) {
  const { osc } = v.tone(out, { type: 'sawtooth', f, f2: f * 0.86, glide: dur, t, a: dur * 0.3, hold: dur * 0.2, d: dur * 0.5, peak, ft: 'bandpass', ff: form, fq: 9 });
  const lfo = v.osc('square', rnd(17, 26), t, t + dur + 0.2); const lg = v.gain(f * 0.22); lfo.connect(lg); lg.connect(osc.frequency);
}
/** The drag's clicker: the pawl clicking on the spool as line is pulled off — a fast click train at `buzz` Hz quickening as the run
 *  goes (the click itself rises with it), through a band that climbs, with the hiss of line through the guides under it. */
function dragBuzz(v, eng, out, t, end, o, peak) {
  const B = afBufs(eng);
  const s = clickTrain(v, eng, B.click, t, end, o.buzz, o.scream ? 1.6 : 1.3);
  const bp = v.filter('bandpass', o.band, 1.5);
  bp.frequency.setValueAtTime(o.band, t);
  bp.frequency.exponentialRampToValueAtTime(o.band * o.rise, end);
  const env = v.gain(0);
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(peak * 0.7, t + 0.08);
  env.gain.linearRampToValueAtTime(peak, t + (end - t) * 0.8);
  env.gain.linearRampToValueAtTime(0, end + 0.04);
  s.connect(bp); bp.connect(env); env.connect(out);
  const hp = v.filter('highpass', 3200, 0.7); const hg = v.gain(0.28); s.connect(hp); hp.connect(hg); hg.connect(env);
  const n = v.noise('pink', t, end + 0.06); const nb = v.filter('bandpass', o.band * 1.5, 0.9); const ng = v.gain(0.16);
  nb.frequency.setValueAtTime(o.band * 1.5, t); nb.frequency.exponentialRampToValueAtTime(o.band * 1.5 * o.rise, end);
  n.connect(nb); nb.connect(ng); ng.connect(env);
  return { bp, env };
}

// ------------------------------------------------------------------ the ratchet's click (rendered once per AudioContext)
const BUFS = new WeakMap();
function afBufs(eng) {
  let b = BUFS.get(eng.ac);
  if (b) return b;
  const ac = eng.ac, sr = ac.sampleRate, len = Math.floor(sr * 0.2);
  // one pawl click: a sharp transient over two damped metal resonances; the rest of the buffer is silence (the loop's period)
  const click = ac.createBuffer(1, len, sr);
  const c = click.getChannelData(0);
  for (let i = 0; i < Math.floor(sr * 0.03); i++) {
    const t = i / sr;
    c[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.0006) * 0.9 + Math.sin(2 * Math.PI * 3300 * t) * Math.exp(-t / 0.0022) * 0.7
      + Math.sin(2 * Math.PI * 5150 * t) * Math.exp(-t / 0.0011) * 0.35;
  }
  // the gear's body under the click (big reels): a low damped thud
  const thump = ac.createBuffer(1, len, sr);
  const h = thump.getChannelData(0);
  let lp = 0;
  for (let i = 0; i < Math.floor(sr * 0.06); i++) {
    const t = i / sr;
    lp += ((Math.random() * 2 - 1) - lp) * 0.08;
    h[i] = Math.sin(2 * Math.PI * 165 * t) * Math.exp(-t / 0.012) * 0.8 + lp * Math.exp(-t / 0.008) * 0.9;
  }
  b = { click, thump };
  BUFS.set(ac, b);
  return b;
}
/** A looping buffer whose loop is one period: a train of clicks at `rate` Hz from t to end. */
function clickTrain(v, eng, buf, t, end, rate, rateTo = 1) {
  const s = eng.ac.createBufferSource();
  s.buffer = buf; s.loop = true; s.loopStart = 0; s.loopEnd = clamp(1 / Math.max(1, rate), 0.012, 0.19);
  v.src(s, t, end + 0.02);
  s.playbackRate.setValueAtTime(1, t);
  if (rateTo !== 1) s.playbackRate.linearRampToValueAtTime(rateTo, end);
  return s;
}

export const SFX_AF = {
  // ------------------------------------------------------------- the strike (§25.6.4): ≤ 0.6 s, readable with the sound off too
  strike_clean: { gain: 0.95, gap: 0.15, max: 2, pri: 3, wet: 0.3, pj: 0.01, fn(v, out, t, p, o) {
    const k = K(o);
    // a crisp tock (a hardwood block), the line coming tight on the class's weight, and a rising chime
    v.tone(out, { type: 'sine', f: 1180 * p, f2: 820 * p, glide: 0.03, t, a: 0.0008, d: 0.06, peak: 0.6 });
    v.burst(out, { t, a: 0.0005, d: 0.014, peak: 0.45, ft: 'bandpass', f: 3100, q: 2.2 });
    v.tone(out, { type: 'sine', f: lerp(190, 82, k), f2: lerp(70, 34, k), glide: 0.12, t: t + 0.01, a: 0.002, d: 0.18 + 0.12 * k, peak: 0.5 + 0.3 * k });
    v.burst(out, { kind: 'pink', t: t + 0.01, a: 0.02, d: 0.22, peak: 0.16, ft: 'bandpass', f: 2600, f2: 700, glide: 0.2, q: 1.4 });
    chime(v, out, t + 0.05, mtof(84), 0.15, 0.7);
    chime(v, out, t + 0.1, mtof(88), 0.13, 0.8);
    chime(v, out, t + 0.15, mtof(91), 0.12, 1.1);
  } },
  strike_struck: { gain: 0.9, gap: 0.15, max: 2, pri: 3, wet: 0.22, pj: 0.02, fn(v, out, t, p, o) {
    const k = K(o);
    v.tone(out, { type: 'sine', f: 1050 * p, f2: 760 * p, glide: 0.03, t, a: 0.0008, d: 0.055, peak: 0.55 });
    v.burst(out, { t, a: 0.0005, d: 0.012, peak: 0.36, ft: 'bandpass', f: 2800, q: 2 });
    v.tone(out, { type: 'sine', f: lerp(180, 78, k), f2: lerp(66, 32, k), glide: 0.12, t: t + 0.01, a: 0.002, d: 0.17 + 0.12 * k, peak: 0.48 + 0.3 * k });
    v.burst(out, { kind: 'pink', t: t + 0.01, a: 0.02, d: 0.2, peak: 0.13, ft: 'bandpass', f: 2200, f2: 650, glide: 0.18, q: 1.4 });
  } },
  strike_early: { gain: 0.8, gap: 0.15, max: 2, pri: 3, wet: 0.15, pj: 0.02, fn(v, out, t, p, o) {
    const k = K(o);
    // a dull tk: the tap came before the float went (it jerks sideways), muffled, with a small side splash
    v.tone(out, { type: 'triangle', f: 520 * p, f2: 380 * p, glide: 0.03, t, a: 0.001, d: 0.05, peak: 0.42, ft: 'lowpass', ff: 900 });
    v.burst(out, { kind: 'pink', t, a: 0.001, d: 0.03, peak: 0.24, ft: 'lowpass', f: 1000, q: 0.8 });
    v.tone(out, { type: 'sine', f: lerp(150, 70, k), f2: lerp(60, 30, k), glide: 0.1, t: t + 0.03, a: 0.003, d: 0.16, peak: 0.34 + 0.2 * k });
    v.burst(out, { t: t + 0.04, a: 0.003, d: 0.14, peak: 0.16, ft: 'bandpass', f: 1300, f2: 600, glide: 0.12, q: 0.9 });
  } },
  strike_late: { gain: 0.85, gap: 0.15, max: 2, pri: 3, wet: 0.18, pj: 0.02, fn(v, out, t, p, o) {
    const k = K(o);
    // a slower thunk: the float is already gone; the line comes tight with a slump
    v.tone(out, { type: 'sine', f: 330 * p, f2: 120 * p, glide: 0.16, t, a: 0.018, d: 0.22, peak: 0.55, ft: 'lowpass', ff: 1100 });
    v.burst(out, { kind: 'pink', t, a: 0.015, d: 0.12, peak: 0.22, ft: 'lowpass', f: 700, q: 0.7 });
    v.tone(out, { type: 'sine', f: lerp(130, 60, k), f2: lerp(52, 28, k), glide: 0.18, t: t + 0.06, a: 0.01, d: 0.24 + 0.1 * k, peak: 0.4 + 0.25 * k });
    v.tone(out, { type: 'sawtooth', f: 420, f2: 300, glide: 0.25, t: t + 0.08, a: 0.03, d: 0.25, peak: 0.04, ft: 'bandpass', ff: 700, fq: 5 });
  } },

  // ------------------------------------------------------------- the play's beats (§25.6.5), all by class length and tier
  reel_take: { gain: 0.95, gap: 0.2, max: 2, pri: 3, wet: 0.25, fn(v, out, t, p, o) {
    const k = K(o);
    // the line's tick as it snaps tight, a hollow pop (the float pulled under), spray where it was; a big fish loads the rod
    v.burst(out, { t, a: 0.0004, d: 0.012, peak: 0.55, ft: 'bandpass', f: 5200, q: 5 });
    v.tone(out, { type: 'triangle', f: 2400, t, a: 0.0005, d: 0.02, peak: 0.12 });
    const f0 = lerp(640, 210, k);
    v.tone(out, { type: 'sine', f: f0 * p, f2: f0 * 0.36 * p, glide: 0.07 + 0.05 * k, t: t + 0.015, a: 0.002, d: 0.12 + 0.12 * k, peak: 0.55 });
    v.burst(out, { kind: 'pink', t: t + 0.02, a: 0.006, d: 0.24 + 0.32 * k, peak: 0.22 + 0.26 * k, ft: 'lowpass', f: 2600 - 1300 * k, f2: 560, glide: 0.3, q: 0.7 });
    droplets(v, out, t + 0.08, 2 + Math.round(4 * k), 0.3, 0.08, 1100, 3000);
    if (k > 0.3) creak(v, out, t + 0.03, lerp(120, 64, k), 0.3 + 0.2 * k, 0.05 * k, 680);
  } },
  reel_ratchet: { gain: 0.9, gap: 0, max: 3, pri: 2, wet: 0.12, pj: 0.03, vj: 0.05, fn(v, out, t, p, o, eng) {
    // the reel gaining line: a train of pawl clicks, fast and light for a small fish, slow and heavy for a big one; it quickens a
    // touch as the fish comes in; a T0 winch grinds under it, a T4 reel barely does. The lift ends in spray at the scoop.
    const k = K(o), dur = D(o, 1), end = t + dur, B = afBufs(eng);
    const rate = clamp(typeof o.rate === 'number' ? o.rate : lerp(26, 6, k), 3, 40);
    const vol = 0.85;   // the class's loudness is o.volume, applied by play() to the whole voice
    const clk = clickTrain(v, eng, B.click, t, end, rate, o.lift ? 1.12 : 1.05);
    const bp = v.filter('bandpass', 3600 * p, 1.3);
    const cg = v.gain(0); asr(cg.gain, t, 0.55 * vol, 0.03, end, 0.06);
    clk.connect(bp); bp.connect(cg); cg.connect(out);
    const hp = v.filter('highpass', 2400, 0.7); const hg = v.gain(0); asr(hg.gain, t, 0.16 * vol, 0.02, end, 0.05);
    clk.connect(hp); hp.connect(hg); hg.connect(out);
    const w = clamp(typeof o.weight === 'number' ? o.weight : k, 0, 1);
    if (w > 0.25) {
      const th = clickTrain(v, eng, B.thump, t, end, rate, o.lift ? 1.12 : 1.05);
      const lp = v.filter('lowpass', 520, 0.7); const tg = v.gain(0); asr(tg.gain, t, 0.5 * w * vol, 0.03, end, 0.08);
      th.connect(lp); lp.connect(tg); tg.connect(out);
    }
    const grit = clamp(typeof o.grit === 'number' ? o.grit : 0.5, 0, 1);
    if (grit > 0.15) {
      const n = v.noise('brown', t, end + 0.05);
      const f = v.filter('bandpass', lerp(520, 240, k), 1.3); const g = v.gain(0); asr(g.gain, t, 0.09 * grit * vol, 0.08, end, 0.1);
      const am = v.gain(0.5); const lfo = v.osc('sine', rate * 0.5, t, end + 0.05); const lg = v.gain(0.5); lfo.connect(lg); lg.connect(am.gain);
      n.connect(f); f.connect(am); am.connect(g); g.connect(out);
    }
    if (o.lift) {
      // the fish drawn to the raft: spray at its class scale as it breaks the surface for the scoop
      v.burst(out, { kind: 'pink', t: Math.max(t, end - 0.12), a: 0.02, d: 0.3 + 0.35 * k, peak: 0.28 + 0.2 * k, ft: 'bandpass', f: 1700 - 700 * k, f2: 520, glide: 0.3, q: 0.9 });
      droplets(v, out, Math.max(t, end - 0.05), 3 + Math.round(4 * k), 0.4, 0.07, 1000, 2800);
    }
  } },
  line_hiss: { gain: 0.85, gap: 0, max: 2, pri: 2, wet: 0.18, pj: 0.02, fn(v, out, t, p, o, eng) {
    // a run: line peels off the spool against the drag — the clicker's buzz and the hiss rising; a long run (an Elder's 4–8 m)
    // climbs further; a Trophy or bigger tows the raft, and the raft's timbers answer
    const k = K(o), dur = D(o, 1.2), end = t + dur;
    const H = { buzz: o.buzz ?? lerp(46, 24, k), band: (o.band ?? lerp(3200, 1500, k)) * p, rise: o.rise ?? 1.35, scream: false };
    dragBuzz(v, eng, out, t, end, H, 0.62);
    const body = clamp(o.body ?? k, 0, 1);
    if (body > 0.2) {
      const { osc } = v.tone(out, { type: 'triangle', f: lerp(150, 62, k), t, a: 0.2, hold: Math.max(0, dur - 0.45), d: 0.3, peak: 0.12 * body, ft: 'lowpass', ff: 480 });
      osc.frequency.linearRampToValueAtTime(lerp(170, 72, k), end);
    }
    if (o.tow) creak(v, out, t + 0.05, lerp(90, 58, k), 0.55, 0.07 + 0.05 * k, 520);
  } },
  line_hold: { gain: 0.8, gap: 0, max: 2, pri: 2, wet: 0.35, pj: 0.005, vj: 0.04, fn(v, out, t, p, o) {
    // a stalemate: the rod deep and still and the line humming — one low note (lower for a bigger fish), bowed a little so it
    // carries on a phone's speaker, trembling under the load, the taut line singing faintly above it
    const dur = D(o, 1), end = t + dur + 0.25;
    const f = mtof(clamp(typeof o.midi === 'number' ? o.midi : 45, 24, 72)) * p;
    const g = v.gain(0); asr(g.gain, t, 0.1, 0.35, end, 0.35); g.connect(out);
    const trem = v.osc('sine', 3.2, t, end + 0.05); const tg = v.gain(0.02); trem.connect(tg); tg.connect(g.gain);
    v.osc('sine', f, t, end + 0.05, -2).connect(g);
    const tri = v.osc('triangle', f * 2, t, end + 0.05, 2); const lp = v.filter('lowpass', 900, 0.7); const trg = v.gain(0.5);
    tri.connect(lp); lp.connect(trg); trg.connect(g);
    const saw = v.osc('sawtooth', f, t, end + 0.05, 3); const slp = v.filter('lowpass', Math.min(2400, f * 3.2), 0.8); const sg0 = v.gain(0.22);
    saw.connect(slp); slp.connect(sg0); sg0.connect(g);
    const s2 = v.osc('sine', f * 6.02, t, end + 0.05); const sg = v.gain(0); asr(sg.gain, t, 0.018, 0.5, end, 0.3);
    const lfo = v.osc('sine', 4.6, t, end + 0.05); const lg = v.gain(0.01); lfo.connect(lg); lg.connect(sg.gain);
    s2.connect(sg); sg.connect(out);
  } },
  surge_splash: { gain: 0.85, gap: 0.08, max: 3, pri: 2, wet: 0.32, pj: 0.03, fn(v, out, t, p, o) {
    // a burst of spray at the line end, the rod jerks, the lantern swings on its hook
    const k = K(o);
    splash(v, out, t, k, 1.05, p);
    v.burst(out, { t: t + 0.01, a: 0.001, d: 0.03, peak: 0.16, ft: 'bandpass', f: 900, q: 3 });
    creak(v, out, t + 0.02, lerp(130, 70, k), 0.22, 0.04 + 0.04 * k, 760);
    for (const [dt, f] of [[0.1, 2650], [0.24, 2480]]) v.tone(out, { type: 'sine', f, t: t + dt, a: 0.001, d: 0.06, peak: 0.035 });
  } },
  strain_whine: { gain: 1.0, gap: 0.12, max: 2, pri: 2, pj: 0, vj: 0.04, fn(v, out, t, p, o) {
    // the line under strain: a thin saw whine through a narrow band, trembling — pitched by the class length and one semitone
    // lower per mean fitted tier (better gear sounds like better gear); exact pitch, no jitter
    const f = clamp(typeof o.freq === 'number' ? o.freq : 800, 120, 3000), dur = D(o, 0.6), end = t + dur;
    const osc = v.osc('sawtooth', f, t, end + 0.1);
    osc.frequency.setValueAtTime(f, t);
    osc.frequency.linearRampToValueAtTime(f * 1.03, t + dur * 0.7);
    osc.frequency.linearRampToValueAtTime(f * 0.985, end);
    const lfo = v.osc('sine', o.long ? 7 : 9, t, end + 0.1); const lg = v.gain(f * 0.011); lfo.connect(lg); lg.connect(osc.frequency);
    const bp = v.filter('bandpass', f * 1.6, 7);
    const g = v.gain(0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.2, t + 0.08);
    g.gain.setValueAtTime(0.2, Math.max(t + 0.08, end - 0.18)); g.gain.linearRampToValueAtTime(0, end + 0.04);
    osc.connect(bp); bp.connect(g); g.connect(out);
    const s = v.osc('sine', f * 2, t, end + 0.1); const sg = v.gain(0); asr(sg.gain, t, 0.035, 0.1, end, 0.15);
    lg.connect(s.frequency); s.connect(sg); sg.connect(out);
  } },
  fish_roll: { gain: 0.75, gap: 0.12, max: 2, pri: 1, wet: 0.35, pj: 0.04, fn(v, out, t, p, o) {
    // a glimpse: the shape rolls at the surface (a wet roll), a swirl near the raft, or a tail slap — pitched by the class length
    const k = K(o), kind = o.kind || 'roll';
    if (kind === 'swirl') {
      const g = v.burst(out, { kind: 'pink', t, a: 0.06, hold: 0.12, d: 0.35, peak: 0.34, ft: 'bandpass', f: 900 * p, q: 2 });
      const lfo = v.osc('sine', 11, t, t + 0.7); const lg = v.gain(320 * p); lfo.connect(lg); lg.connect(g.flt.frequency);
      v.tone(out, { type: 'sine', f: 240 * p, f2: 150 * p, glide: 0.3, t: t + 0.05, a: 0.04, d: 0.3, peak: 0.2 });
      return;
    }
    if (kind === 'tailSlap') {
      v.burst(out, { t, a: 0.001, d: 0.02, peak: 0.5, ft: 'highpass', f: 1500, q: 0.7 });
      splash(v, out, t + 0.005, k, 0.7, p);
      return;
    }
    v.burst(out, { kind: 'pink', t, a: 0.04, d: 0.32 + 0.3 * k, peak: 0.42, ft: 'bandpass', f: 1400 * p, f2: 430 * p, glide: 0.38, q: 1.1 });
    v.tone(out, { type: 'sine', f: 280 * p, f2: 110 * p, glide: 0.18, t: t + 0.06, a: 0.01, d: 0.22 + 0.1 * k, peak: 0.32 });
    droplets(v, out, t + 0.15, 2 + Math.round(3 * k), 0.35, 0.07, 1000, 2600);
  } },
  fish_skitter: { gain: 0.6, gap: 0.2, max: 2, pri: 1, wet: 0.25, pj: 0.06, fn(v, out, t, p, o) {
    // a Small at the lift: it skitters across the top — a run of tiny flicks
    const dur = clamp(D(o, 0.8), 0.3, 1.4), n = 5 + Math.round(dur * 4);
    for (let i = 0; i < n; i++) {
      const tt = t + (i / n) * dur * 0.9 + Math.random() * 0.03, f = rnd(1300, 2300) * p;
      v.tone(out, { type: 'sine', f, f2: f * 1.8, glide: 0.02, t: tt, a: 0.001, d: 0.04, peak: rnd(0.18, 0.32) });
      v.burst(out, { t: tt, a: 0.001, d: 0.03, peak: 0.08, ft: 'bandpass', f: f * 1.6, q: 1.5 });
    }
  } },
  fish_pass: { gain: 0.85, gap: 0.5, max: 1, pri: 2, wet: 0.45, pj: 0.02, fn(v, out, t, p, o, eng) {
    // the pass (Elder, Ancient): the shadow slides under the raft — a low wash crossing beneath you, one knock of the timbers
    const k = K(o), dur = clamp(D(o, 1.2), 0.6, 2.4), end = t + dur, ac = eng.ac;
    const n = v.noise('brown', t, end + 0.2);
    const lp = v.filter('lowpass', 160, 0.9); lp.frequency.setValueAtTime(160, t); lp.frequency.linearRampToValueAtTime(420 + 200 * k, t + dur * 0.5); lp.frequency.linearRampToValueAtTime(140, end);
    const g = v.gain(0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.75, t + dur * 0.5); g.gain.linearRampToValueAtTime(0, end + 0.15);
    let head = g;
    if (ac.createStereoPanner) { const pn = v.n(ac.createStereoPanner()); pn.pan.setValueAtTime(-0.7, t); pn.pan.linearRampToValueAtTime(0.7, end); g.connect(pn); head = pn; }
    n.connect(lp); lp.connect(g); head.connect(out);
    v.tone(out, { type: 'sine', f: lerp(70, 40, k), t, a: dur * 0.45, d: dur * 0.5, peak: 0.3 });
    v.tone(out, { type: 'sine', f: 140, f2: 70, glide: 0.08, t: t + dur * 0.5, a: 0.003, d: 0.2, peak: 0.25 });
    v.burst(out, { kind: 'pink', t: t + dur * 0.5, a: 0.002, d: 0.08, peak: 0.16, ft: 'bandpass', f: 600, q: 1.2 });
    creak(v, out, t + dur * 0.52, 80, 0.45, 0.05, 480);
  } },
  leap_slap: { gain: 0.95, gap: 0.15, max: 2, pri: 3, wet: 0.4, pj: 0.03, fn(v, out, t, p, o) {
    // a leap: spray as the silhouette clears the water, a breath of air, then the slap on the way back in (skip, leap, breach)
    const k = K(o), kind = o.kind || 'leap', air = clamp(typeof o.air === 'number' ? o.air : 0.5, 0.15, 1.2);
    const pk = kind === 'skip' ? 0.6 : kind === 'breach' ? 1.15 : 0.9;
    v.burst(out, { kind: 'pink', t, a: 0.01, d: 0.22, peak: 0.36 * pk, ft: 'highpass', f: 900 * p, f2: 3200 * p, glide: 0.18, q: 0.7 });
    droplets(v, out, t + 0.04, 3 + Math.round(3 * k), 0.25, 0.08, 1500, 3400);
    const tl = t + air;
    v.burst(out, { t: tl, a: 0.0008, d: 0.022, peak: 0.7 * pk, ft: 'highpass', f: 1400, q: 0.7 });
    splash(v, out, tl + 0.004, k, 1.1 * pk, p);
    if (kind === 'breach') {
      // a heavy half-out roll: the wash keeps rolling off its back
      v.burst(out, { kind: 'brown', t: tl + 0.05, a: 0.08, d: 0.7, peak: 0.45, ft: 'lowpass', f: 900 * p, f2: 220, glide: 0.6, q: 0.8 });
    }
  } },
  scare_splash: { gain: 0.8, gap: 0.2, max: 2, pri: 2, wet: 0.3, pj: 0.03, fn(v, out, t, p, o, eng) {
    // a scare: the line falls slack for a heartbeat (or the head shakes at the surface); a splash; then it comes tight again
    const k = K(o), slack = clamp(typeof o.slack === 'number' ? o.slack : 0.35, 0.15, 0.7);
    if (o.kind === 'shake') {
      for (let i = 0; i < 4; i++) v.burst(out, { t: t + i * 0.075, a: 0.002, d: 0.1, peak: 0.34 - i * 0.05, ft: 'bandpass', f: (1500 - i * 120) * p, q: 0.9 });
      v.tone(out, { type: 'sine', f: 210 * p, f2: 120 * p, glide: 0.2, t, a: 0.004, d: 0.22, peak: 0.25 });
    } else {
      // the line goes limp: a soft falling wobble of slack line on the water, then one splash
      const { osc } = v.tone(out, { type: 'sine', f: 620, f2: 240, glide: slack, t, a: 0.02, d: slack, peak: 0.05 });
      const lfo = v.osc('sine', 13, t, t + slack + 0.2); const lg = v.gain(18); lfo.connect(lg); lg.connect(osc.frequency);
      splash(v, out, t + 0.06, k, 0.6, p);
    }
    // tight again: the line twangs taut (a low pluck by the class length)
    const g = v.gain(0.32); g.connect(out);
    v.buffer(eng.ks(Math.round(lerp(52, 33, k)), 'tight'), t + slack + 0.05, 1, g);
  } },
  reel_scream: { gain: 0.9, gap: 0.3, max: 1, pri: 3, wet: 0.25, pj: 0.02, duck: [0.75, 1.5], fn(v, out, t, p, o, eng) {
    // the last stand (Elder, Ancient): the big turn, the longest run — the drag screams and keeps climbing; the spool's pawl
    // sings a rising note over it, and the water heaves under the raft
    const k = K(o), dur = D(o, 2.5), end = t + dur;
    const H = { buzz: o.buzz ?? lerp(60, 34, k), band: (o.band ?? lerp(3600, 1900, k)) * p, rise: o.rise ?? 1.9, scream: true };
    dragBuzz(v, eng, out, t, end, H, 0.7);
    const f0 = lerp(300, 170, k);
    const { osc } = v.tone(out, { type: 'sawtooth', f: f0, t, a: 0.25, hold: Math.max(0, dur - 0.5), d: 0.3, peak: 0.07, ft: 'bandpass', ff: f0 * 4, fq: 6 });
    osc.frequency.linearRampToValueAtTime(f0 * 1.7, end);
    const vib = v.osc('sine', 6.5, t, end + 0.3); const vg = v.gain(f0 * 0.02); vib.connect(vg); vg.connect(osc.frequency);
    v.burst(out, { kind: 'brown', t, a: dur * 0.6, d: dur * 0.5, peak: 0.16, ft: 'lowpass', f: 180, f2: 340, glide: dur, q: 0.8 });
    v.tone(out, { type: 'sine', f: lerp(62, 40, k), t, a: dur * 0.5, hold: dur * 0.3, d: 0.6, peak: 0.1 });
  } },
  still_crash: { gain: 1.0, gap: 0.5, max: 1, pri: 3, wet: 0.45, pj: 0.02, duck: [0.6, 1], fn(v, out, t, p, o, eng) {
    // after the still: it thunders off — a crash of water and a burst of drag
    const k = K(o);
    v.burst(out, { t, a: 0.0008, d: 0.03, peak: 0.7, ft: 'highpass', f: 1200, q: 0.7 });
    splash(v, out, t + 0.005, Math.max(k, 0.85), 1.3, p);
    v.tone(out, { type: 'sine', f: 70, f2: 30, glide: 0.5, t, a: 0.004, d: 0.9, peak: 0.6 });
    dragBuzz(v, eng, out, t + 0.05, t + 1.1, { buzz: 58, band: 2400, rise: 1.5, scream: true }, 0.6);
  } },
  line_grind: { gain: 0.7, gap: 0.2, max: 1, pri: 1, wet: 0.3, pj: 0.04, fn(v, out, t, p, o) {
    // a place's beat (P2): under the Span the line grinds on stone; in the Lily Maze it saws through pads
    const dur = D(o, 1.2), end = t + dur, lilies = o.kind === 'lilies';
    const n = v.noise(lilies ? 'pink' : 'white', t, end + 0.05);
    const bp = v.filter('bandpass', (lilies ? 1100 : 700) * p, lilies ? 1.6 : 2.6);
    const am = v.gain(0.4); const lfo = v.osc(lilies ? 'triangle' : 'square', lilies ? 3.2 : rnd(9, 14), t, end + 0.05); const lg = v.gain(0.4); lfo.connect(lg); lg.connect(am.gain);
    const g = v.gain(0); asr(g.gain, t, lilies ? 0.22 : 0.28, 0.1, end, 0.15);
    n.connect(bp); bp.connect(am); am.connect(g); g.connect(out);
  } },
  foul_clank: { gain: 0.8, gap: 0.25, max: 2, pri: 2, wet: 0.5, pj: 0.03, fn(v, out, t, p) {
    // chains: a clank of old iron and a short rattle (the Gatehouse Door, the Chain Garden; a fouled line)
    const f = 290 * p;
    for (const [r, a, d] of [[1, 0.5, 1.2], [2.76, 0.3, 0.8], [5.4, 0.18, 0.45], [8.93, 0.1, 0.3]]) v.tone(out, { type: 'sine', f: f * r, t, a: 0.001, d, peak: a * 0.45 });
    v.burst(out, { t, a: 0.001, d: 0.08, peak: 0.25, ft: 'highpass', f: 3000, q: 0.7 });
    for (let i = 0; i < 4; i++) v.tone(out, { type: 'triangle', f: rnd(1700, 2600), t: t + 0.12 + i * 0.05 + Math.random() * 0.02, a: 0.001, d: 0.05, peak: 0.06 });
  } },

  // ------------------------------------------------------------- the loss, by cause (§25.6.5), then the quiet beat
  loss_snap: { gain: 0.95, gap: 0.3, max: 1, pri: 3, wet: 0.4, duck: [0.3, 1.6], fn(v, out, t, p, o, eng) {
    // snapped: a crack, the line whipping back on the wind, then a ringing (the rod springs straight). Staggered: the hit first.
    let t0 = t;
    if (o.staggered) {
      v.tone(out, { type: 'sine', f: 95, f2: 38, glide: 0.18, t, a: 0.003, d: 0.25, peak: 0.75 });
      v.burst(out, { kind: 'pink', t, a: 0.002, d: 0.12, peak: 0.45, ft: 'lowpass', f: 700, q: 0.7 });
      t0 = t + 0.12;
    }
    v.burst(out, { t: t0, a: 0.0006, d: 0.035, peak: 0.95, ft: 'highpass', f: 2200, q: 0.7 });
    v.tone(out, { type: 'sawtooth', f: 2300 * p, f2: 160 * p, glide: 0.22, t: t0, a: 0.001, d: 0.3, peak: 0.24, ft: 'lowpass', ff: 5200 });
    // the ringing: two close metal partials beating, and the rod's own low twang
    for (const [f, pk, d] of [[1320, 0.1, 1.4], [1327, 0.08, 1.3], [1985, 0.05, 0.9]]) v.tone(out, { type: 'sine', f: f * p, t: t0 + 0.03, a: 0.002, d, peak: pk });
    const g = v.gain(0.38); g.connect(out);
    v.buffer(eng.ks(40, 'tight'), t0 + 0.02, 1, g);
  } },
  loss_thrown: { gain: 0.9, gap: 0.3, max: 1, pri: 3, wet: 0.4, duck: [0.35, 1.4], fn(v, out, t, p, o) {
    // thrown: a tick (the hook flying back with a glint), the line falls slack, a splash as the shape drops back
    const k = K(o);
    v.tone(out, { type: 'sine', f: 3600, t, a: 0.0005, d: 0.04, peak: 0.3 });
    v.burst(out, { t, a: 0.0005, d: 0.01, peak: 0.3, ft: 'bandpass', f: 5200, q: 4 });
    chime(v, out, t + 0.03, 2620, 0.06, 0.5);
    const { osc } = v.tone(out, { type: 'sine', f: 560, f2: 230, glide: 0.35, t: t + 0.05, a: 0.02, d: 0.35, peak: 0.05 });
    const lfo = v.osc('sine', 12, t, t + 0.5); const lg = v.gain(16); lfo.connect(lg); lg.connect(osc.frequency);
    splash(v, out, t + 0.2, k, 0.85, p);
  } },
  loss_spat: { gain: 0.8, gap: 0.3, max: 1, pri: 3, wet: 0.45, duck: [0.4, 1.4], fn(v, out, t, p, o) {
    // spat at the raft: a soft splash and a swirl, then quiet (the closest heartbreak)
    const k = K(o);
    v.burst(out, { kind: 'pink', t, a: 0.01, d: 0.35 + 0.2 * k, peak: 0.36, ft: 'lowpass', f: 1000 * p, f2: 420, glide: 0.3, q: 0.8 });
    const g = v.burst(out, { kind: 'pink', t: t + 0.12, a: 0.08, hold: 0.1, d: 0.4, peak: 0.16, ft: 'bandpass', f: 700 * p, q: 2 });
    const lfo = v.osc('sine', 8, t, t + 0.9); const lg = v.gain(220); lfo.connect(lg); lg.connect(g.flt.frequency);
    v.tone(out, { type: 'sine', f: 190 * p, f2: 120 * p, glide: 0.3, t: t + 0.05, a: 0.02, d: 0.3, peak: 0.14 });
  } },
  loss_spooled: { gain: 0.9, gap: 0.3, max: 1, pri: 3, wet: 0.3, duck: [0.3, 1.8], fn(v, out, t, p, o, eng) {
    // spooled: the reel spins empty and the last of the line drains away — the drag's clicks race up into a scream, then nothing
    const dur = 1.15, end = t + dur, B = afBufs(eng);
    const s = clickTrain(v, eng, B.click, t, end, 38, 2.7);
    const bp = v.filter('bandpass', 1900 * p, 1.6); bp.frequency.setValueAtTime(1900 * p, t); bp.frequency.exponentialRampToValueAtTime(5200 * p, end);
    const env = v.gain(0); env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(0.55, t + 0.12); env.gain.linearRampToValueAtTime(0.85, end - 0.01); env.gain.linearRampToValueAtTime(0, end + 0.012);
    s.connect(bp); bp.connect(env); env.connect(out);
    const hp = v.filter('highpass', 3000, 0.7); const hg = v.gain(0.3); s.connect(hp); hp.connect(hg); hg.connect(env);
    const { osc } = v.tone(out, { type: 'sawtooth', f: 300, t, a: 0.2, hold: dur - 0.21, d: 0.012, peak: 0.06, ft: 'bandpass', ff: 1400, fq: 8 });
    osc.frequency.exponentialRampToValueAtTime(900, end);
    v.tone(out, { type: 'sine', f: 4200, t: end + 0.03, a: 0.0005, d: 0.03, peak: 0.08 });   // the line's end flicks off the spool
  } },
  loss_fouled: { gain: 0.9, gap: 0.3, max: 1, pri: 3, wet: 0.5, duck: [0.35, 1.6], fn(v, out, t, p, o, eng) {
    // fouled on the chains: a clank, a creak, a crack
    const f = 270 * p;
    for (const [r, a, d] of [[1, 0.5, 1.1], [2.76, 0.3, 0.7], [5.4, 0.18, 0.4]]) v.tone(out, { type: 'sine', f: f * r, t, a: 0.001, d, peak: a * 0.4 });
    v.burst(out, { t, a: 0.001, d: 0.07, peak: 0.22, ft: 'highpass', f: 2800, q: 0.7 });
    creak(v, out, t + 0.25, 72, 0.55, 0.09, 520);
    v.burst(out, { t: t + 0.85, a: 0.0006, d: 0.035, peak: 0.85, ft: 'highpass', f: 2200, q: 0.7 });
    v.tone(out, { type: 'sawtooth', f: 2100, f2: 170, glide: 0.2, t: t + 0.85, a: 0.001, d: 0.25, peak: 0.18, ft: 'lowpass', ff: 5000 });
    void eng;
  } },
  bite_pass: { gain: 0.55, gap: 0.3, max: 1, pri: 2, wet: 0.3, fn(v, out, t, p) {
    // let it pass: the fish lets go, the float bobs back up and the bait comes back
    v.tone(out, { type: 'sine', f: 260 * p, f2: 620 * p, glide: 0.08, t, a: 0.004, d: 0.12, peak: 0.4 });
    v.burst(out, { t, a: 0.003, d: 0.12, peak: 0.16, ft: 'lowpass', f: 1300, q: 0.8 });
    droplets(v, out, t + 0.08, 2, 0.2, 0.06, 1800, 3000);
  } },
  gotaway: { gain: 0.55, gap: 1, max: 1, pri: 2, wet: 0.6, dly: 0.2, fn(v, out, t, p, o, eng) {
    // the got-away card (Trophy and bigger), after the quiet beat: two low muted notes falling, a breath of ink
    const r = clamp(typeof o.root === 'number' ? o.root : 50, 40, 62);
    for (const [s, dt, vel] of [[7, 0, 0.32], [3, 0.42, 0.28]]) { const g = v.gain(vel); g.connect(out); v.buffer(eng.ks(r + s, 'muted'), t + dt, 1, g); }
    v.burst(out, { kind: 'pink', t, a: 0.2, d: 0.6, peak: 0.05, ft: 'bandpass', f: 900, q: 0.8 });
    void p;
  } },

  // ------------------------------------------------------------- species voices: silent during the play, once at the reveal
  voice_harpstring: { gain: 0.6, gap: 1, max: 1, pri: 3, wet: 0.6, dly: 0.2, fn(v, out, t, p, o, eng) {
    // the Harpstring Eel's hum: a harp string still singing in its body
    for (const [m, dt, vel] of [[57, 0, 0.4], [64, 0.09, 0.32], [69, 0.18, 0.28]]) { const g = v.gain(vel); g.connect(out); v.buffer(eng.ks(m, 'harp'), t + dt, 1, g); }
    const { osc } = v.tone(out, { type: 'sine', f: 220 * p, t, a: 0.6, hold: 0.4, d: 1.2, peak: 0.14 });
    v.tone(out, { type: 'sine', f: 220.8 * p, t, a: 0.6, hold: 0.4, d: 1.2, peak: 0.1 });
    const lfo = v.osc('sine', 5.2, t, t + 2.4); const lg = v.gain(1.6); lfo.connect(lg); lg.connect(osc.frequency);
  } },
  voice_vesper: { gain: 0.55, gap: 1, max: 1, pri: 3, wet: 0.6, dly: 0.25, fn(v, out, t, p) {
    // the Vesper Gar's fins ring like struck glass, trembling
    const g = v.gain(0.5); g.connect(out);
    const lfo = v.osc('sine', 14, t, t + 1.8); const lg = v.gain(0.35); lfo.connect(lg); lg.connect(g.gain);
    for (const [f, pk, d] of [[1568, 0.22, 1.5], [2357, 0.12, 1.1], [3136, 0.08, 0.7]]) v.tone(g, { type: 'sine', f: f * p, t, a: 0.004, d, peak: pk });
  } },
  voice_sexton: { gain: 0.65, gap: 1.5, max: 1, pri: 3, wet: 0.75, dly: 0.2, fn(v, out, t, p) {
    // the Sexton's toll: a low bell, once
    bell(v, out, t, mtof(45) * p, 0.42, [1, 2.0, 2.76, 4.07], [3.4, 2.0, 1.3, 0.7]);
    v.burst(out, { t, a: 0.001, d: 0.05, peak: 0.12, ft: 'bandpass', f: 1200, q: 1.2 });
  } },
  voice_clapper: { gain: 0.6, gap: 1.5, max: 1, pri: 3, wet: 0.7, dly: 0.2, fn(v, out, t, p) {
    // the Clapper's bell: the clapper knocks, the bell answers, twice
    for (const dt of [0, 0.55]) {
      v.burst(out, { t: t + dt, a: 0.001, d: 0.04, peak: 0.18, ft: 'bandpass', f: 1600, q: 1.5 });
      bell(v, out, t + dt, mtof(66) * p, dt ? 0.22 : 0.3);
    }
  } },
  voice_wineglass: { gain: 0.5, gap: 1, max: 1, pri: 3, wet: 0.55, dly: 0.2, fn(v, out, t, p) {
    // the Glassblown Puffer: a wet finger round a wineglass rim
    const f = mtof(83) * p;
    const g = v.gain(0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.2, t + 0.6); g.gain.setValueAtTime(0.2, t + 1.3); g.gain.linearRampToValueAtTime(0, t + 2.0);
    g.connect(out);
    const am = v.gain(0.8); am.connect(g);
    const lfo = v.osc('sine', 5.5, t, t + 2.1); const lg = v.gain(0.2); lfo.connect(lg); lg.connect(am.gain);
    v.osc('sine', f, t, t + 2.1).connect(am);
    const h = v.osc('sine', f * 2.003, t, t + 2.1); const hg = v.gain(0.12); h.connect(hg); hg.connect(am);
  } },
  voice_chime: { gain: 0.55, gap: 1, max: 1, pri: 3, wet: 0.55, dly: 0.25, fn(v, out, t, p) {
    // the Chime Jelly: a little cluster of chimes, like a wind-bell under water
    for (const [m, dt] of [[88, 0], [93, 0.07], [96, 0.15], [91, 0.26]]) chime(v, out, t + dt, mtof(m) * p, 0.12, 1.3);
  } },
};

// ------------------------------------------------------------------ the First Evening and the Landing (FE-Au1)
export const SFX_FE = {
  cove_ambience: { gain: 0.85, gap: 0.8, max: 2, pri: 0, wet: 0.45, vj: 0.2, fn(v, out, t, p) {
    // one breath of the cove: water slapping the quay stone, a hollow gloop under the jetty, sometimes a mooring rope creaks
    v.burst(out, { kind: 'pink', t, a: 0.05, d: 0.32, peak: 0.32, ft: 'bandpass', f: rnd(380, 520) * p, f2: 240, glide: 0.3, q: 1.2 });
    if (Math.random() < 0.7) v.tone(out, { type: 'sine', f: rnd(150, 210), f2: rnd(95, 120), glide: 0.12, t: t + rnd(0.08, 0.2), a: 0.01, d: 0.14, peak: 0.16 });
    if (Math.random() < 0.35) creak(v, out, t + rnd(0.2, 0.8), rnd(88, 110), 0.45, 0.035, 640);
    if (Math.random() < 0.4) droplets(v, out, t + rnd(0.1, 1.0), 1, 0.1, 0.07, 1100, 2000);
  } },
  cove_bell_far: { gain: 0.42, gap: 6, max: 1, pri: 1, wet: 0.9, dly: 0.25, pj: 0.01, fn(v, out, t, p) {
    // a far bell, somewhere out past the sea-gate, low and softened by the distance
    const lp = v.filter('lowpass', 900, 0.5); lp.connect(out);
    bell(v, lp, t, mtof(50) * p, 0.34, [1, 2.0, 2.76, 4.07], [4.2, 2.4, 1.4, 0.8]);
  } },
  ember_swell: { gain: 0.7, gap: 3, max: 1, pri: 3, wet: 0.7, dly: 0.2, fn(v, out, t, p) {
    // the great lantern's last ember, far down the channel, pulses once: one low, warm swell
    const rise = 1.2, fall = 1.5, end = t + rise + fall;
    const lp = v.filter('lowpass', 280, 0.7); lp.frequency.setValueAtTime(280, t); lp.frequency.linearRampToValueAtTime(950, t + rise); lp.frequency.linearRampToValueAtTime(300, end);
    const g = v.gain(0); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.26, t + rise); g.gain.linearRampToValueAtTime(0, end);
    lp.connect(g); g.connect(out);
    for (const [m, det] of [[38, -4], [45, 5], [50, -3], [54, 6]]) v.osc('triangle', mtof(m) * p, t, end + 0.05, det).connect(lp);
    v.tone(out, { type: 'sine', f: mtof(26) * p, t, a: rise, d: fall, peak: 0.14 });
    const b = v.burst(out, { kind: 'pink', t, a: rise, d: fall, peak: 0.06, ft: 'lowpass', f: 600, q: 0.6 });
    b.g.gain.cancelScheduledValues(t); envSwell(b.g.gain, t, 0.06, rise, fall);
  } },
  flame_catch: { gain: 0.95, gap: 0.6, max: 2, pri: 3, wet: 0.35, fn(v, out, t, p, o) {
    // the nearest cold candle sparks; the flame catches, gutters, catches again, and steadies (the wake, 1.2 s)
    // (o.flare: the Wick's lantern flaring to full at Set Out, one brighter swell)
    const crack = (tt, pk) => v.burst(out, { t: tt, a: 0.0005, d: 0.012, peak: pk, ft: 'bandpass', f: rnd(2600, 4200), q: 2 });
    if (o.flare) {
      v.burst(out, { kind: 'pink', t, a: 0.12, d: 0.45, peak: 0.36, ft: 'bandpass', f: 280 * p, f2: 1500 * p, glide: 0.3, q: 1 });
      for (let i = 0; i < 4; i++) crack(t + 0.05 + i * 0.07 + Math.random() * 0.03, 0.18);
      v.tone(out, { type: 'triangle', f: mtof(64) * p, t: t + 0.1, a: 0.15, d: 0.8, peak: 0.06 });
      return;
    }
    crack(t, 0.25); crack(t + 0.09, 0.2); crack(t + 0.16, 0.28);
    v.burst(out, { kind: 'pink', t: t + 0.24, a: 0.06, d: 0.28, peak: 0.34, ft: 'bandpass', f: 300 * p, f2: 1500 * p, glide: 0.22, q: 1 });
    // gutters: the fire drops, sputters
    v.tone(out, { type: 'sine', f: 280, f2: 190, glide: 0.2, t: t + 0.62, a: 0.02, d: 0.2, peak: 0.05 });
    crack(t + 0.66, 0.12); crack(t + 0.74, 0.1);
    // catches again and steadies
    v.burst(out, { kind: 'pink', t: t + 0.92, a: 0.05, d: 0.3, peak: 0.28, ft: 'bandpass', f: 360 * p, f2: 1300 * p, glide: 0.2, q: 1 });
    const c = v.noise('crackle', t + 0.95, t + 2.3, rnd(0.9, 1.1)); const bp = v.filter('bandpass', 2400, 0.7); const cg = v.gain(0);
    cg.gain.setValueAtTime(0, t + 0.95); cg.gain.linearRampToValueAtTime(0.32, t + 1.1); cg.gain.linearRampToValueAtTime(0, t + 2.3);
    c.connect(bp); bp.connect(cg); cg.connect(out);
    v.tone(out, { type: 'triangle', f: mtof(62) * p, t: t + 1.0, a: 0.3, hold: 0.3, d: 0.9, peak: 0.05 });
  } },
  murk_grumble: { gain: 0.9, gap: 0.3, max: 2, pri: 3, wet: 0.3, pj: 0.02, fn(v, out, t, p, o) {
    // Old Murk, from his barge: a short pitched grumble, no words, as many syllables as the line is long (audio-v3 grumblePlan)
    const plan = o.plan && Array.isArray(o.plan.syllables) ? o.plan : { syllables: [{ t: 0, dur: 0.14, f0: 100, glide: 0.9, vowel: 0, gravel: 0.5 }] };
    const VOW = [[420, 820], [620, 1050], [330, 880], [520, 720]];   // o, a, u, uh
    for (const s of plan.syllables) {
      const tt = t + s.t, end = tt + s.dur;
      const f0 = s.f0 * p;
      const src = v.osc('sawtooth', f0, tt, end + 0.05);
      src.frequency.setValueAtTime(f0, tt); src.frequency.linearRampToValueAtTime(f0 * s.glide, end);
      const env = v.gain(0); env.gain.setValueAtTime(0, tt); env.gain.linearRampToValueAtTime(0.32, tt + 0.025); env.gain.setValueAtTime(0.32, Math.max(tt + 0.025, end - 0.04)); env.gain.linearRampToValueAtTime(0, end);
      const [f1, f2] = VOW[s.vowel % VOW.length];
      for (const [ff, q, a] of [[f1, 5, 1], [f2, 7, 0.5]]) { const bp = v.filter('bandpass', ff, q); const ag = v.gain(a); src.connect(bp); bp.connect(ag); ag.connect(env); }
      // the gravel in an old throat: a low fry, chopped
      const n = v.noise('pink', tt, end + 0.05); const lp = v.filter('lowpass', 1100, 0.7); const fry = v.gain(0);
      const sq = v.osc('square', rnd(28, 42), tt, end + 0.05); const sg = v.gain(0.12 * s.gravel); sq.connect(sg); sg.connect(fry.gain);
      n.connect(lp); lp.connect(fry); fry.connect(env);
      env.connect(out);
    }
  } },
  setout: { gain: 0.85, gap: 2, max: 1, pri: 3, wet: 0.6, dly: 0.25, duck: [0.6, 2.6], fn(v, out, t, p, o, eng) {
    // the departure, under the arch past the lit Waystone (replaces `descend` on every departure from the Landing): a figure
    // rising from low in the lake's key, water swelling under the arch, the Waystone's chime ahead
    const r = clamp(typeof o.root === 'number' ? o.root : 50, 40, 60);
    for (const [s, dt, vel] of [[-12, 0, 0.44], [-5, 0.28, 0.4], [0, 0.56, 0.4], [4, 0.8, 0.36], [7, 1.04, 0.38], [12, 1.36, 0.42]]) {
      const g = v.gain(vel); g.connect(out); v.buffer(eng.ks(r + s, 'harp'), t + dt, 1, g);
    }
    const sw = v.burst(out, { kind: 'pink', t, a: 1.2, d: 1.4, peak: 0.18, ft: 'lowpass', f: 300, f2: 1100, glide: 1.4, q: 0.7 });
    sw.g.gain.cancelScheduledValues(t); envSwell(sw.g.gain, t, 0.18, 1.3, 1.2);
    for (const m of [r - 12, r - 5, r + 4]) v.tone(out, { type: 'triangle', f: mtof(m) * p, t: t + 0.3, a: 1.0, hold: 0.5, d: 1.6, peak: 0.055, ft: 'lowpass', ff: 1200 });
    v.tone(out, { type: 'sine', f: mtof(r - 24) * p, t, a: 0.8, hold: 0.6, d: 1.6, peak: 0.1 });
    chime(v, out, t + 1.7, mtof(r + 24) * p, 0.1, 1.8);
    chime(v, out, t + 1.82, mtof(r + 31) * p, 0.07, 2.0);
  } },
};
