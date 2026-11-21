// audio-dsp.js — low-level WebAudio toolkit for the audio module (imported only by audio*.js).
// Voice lifetime tracking (every scheduled source stops, then its whole sub-graph is
// disconnected), envelope helpers, and procedurally generated buffers: noise colours,
// a fire-crackle loop, a cavern impulse response and Karplus–Strong plucked strings.

export const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const jit = (amt) => 1 + (Math.random() * 2 - 1) * amt;
export const rnd = (a, b) => a + (b - a) * Math.random();
export const pick = (arr) => arr[(Math.random() * arr.length) | 0];
const EPS = 0.0001;

// ------------------------------------------------------------------ voice
/** A short-lived sub-graph. Register nodes; sources are started/stopped; when the
 *  latest-ending source fires `ended`, every node is disconnected and counters drop. */
class Voice {
  constructor(eng, tag) {
    this.eng = eng; this.tag = tag; this.nodes = []; this.last = null; this.lastEnd = -1; this.closed = false;
    eng.active++;
    eng.tags[tag] = (eng.tags[tag] || 0) + 1;
  }
  n(node) { this.nodes.push(node); return node; }
  gain(v = 1) { const g = this.eng.ac.createGain(); g.gain.value = v; return this.n(g); }
  filter(type = 'lowpass', f = 1000, q = 0.7) {
    const b = this.eng.ac.createBiquadFilter();
    b.type = type; b.frequency.value = this.eng.fclamp(f); b.Q.value = q;
    return this.n(b);
  }
  pan(p, dest) {
    const ac = this.eng.ac;
    if (!p || !ac.createStereoPanner) return dest;
    const s = this.n(ac.createStereoPanner());
    s.pan.value = clamp(p, -1, 1);
    s.connect(dest);
    return s;
  }
  src(node, t0, t1) {
    const s0 = Math.max(t0, 0);
    node.start(s0);
    node.stop(Math.max(t1, s0 + 0.01));
    this.nodes.push(node);
    if (t1 > this.lastEnd) { this.lastEnd = t1; this.last = node; }
    return node;
  }
  osc(type, f, t0, t1, detune = 0) {
    const o = this.eng.ac.createOscillator();
    o.type = type; o.frequency.value = this.eng.fclamp(f);
    if (detune) o.detune.value = detune;
    return this.src(o, t0, t1);
  }
  /** Looping noise source starting at a random offset. kind: white|pink|brown|crackle */
  noise(kind, t0, t1, rate = 1) {
    const ac = this.eng.ac;
    const b = ac.createBufferSource();
    b.buffer = this.eng.buf(kind);
    b.loop = true; b.playbackRate.value = rate;
    const off = Math.random() * (b.buffer.duration - 0.05);
    const s0 = Math.max(t0, 0);
    b.start(s0, off);
    b.stop(Math.max(t1, s0 + 0.01));
    this.nodes.push(b);
    if (t1 > this.lastEnd) { this.lastEnd = t1; this.last = b; }
    return b;
  }
  buffer(buffer, t0, rate = 1, gainNode = null) {
    const b = this.eng.ac.createBufferSource();
    b.buffer = buffer; b.playbackRate.value = rate;
    const dur = buffer.duration / rate;
    this.src(b, t0, t0 + dur + 0.02);
    if (gainNode) b.connect(gainNode);
    return b;
  }

  /** Oscillator through an envelope into dest. o = {type, f, f2, glide, t, a, d, peak, detune, hold, ft, ff, fq, ff2} */
  tone(dest, o) {
    const t = o.t, a = o.a ?? 0.005, d = o.d ?? 0.3, hold = o.hold ?? 0;
    const end = t + a + hold + d * 1.15 + 0.02;
    const osc = this.osc(o.type || 'sine', o.f, t, end, o.detune || 0);
    if (o.f2) {
      osc.frequency.setValueAtTime(this.eng.fclamp(o.f), t);
      osc.frequency.exponentialRampToValueAtTime(this.eng.fclamp(Math.max(o.f2, 1)), t + (o.glide ?? (a + d * 0.5)));
    }
    const g = this.gain(0);
    let head = osc;
    if (o.ft) {
      const flt = this.filter(o.ft, o.ff || 1200, o.fq ?? 0.8);
      if (o.ff2) { flt.frequency.setValueAtTime(this.eng.fclamp(o.ff), t); flt.frequency.exponentialRampToValueAtTime(this.eng.fclamp(o.ff2), t + (o.fglide ?? d)); }
      osc.connect(flt); head = flt;
    }
    head.connect(g); g.connect(dest);
    envAHD(g.gain, t, o.peak ?? 0.5, a, hold, d);
    return { osc, g };
  }

  /** Filtered noise burst into dest. o = {kind, t, a, d, hold, peak, ft, f, f2, glide, q, rate} */
  burst(dest, o) {
    const t = o.t, a = o.a ?? 0.005, d = o.d ?? 0.2, hold = o.hold ?? 0;
    const end = t + a + hold + d * 1.15 + 0.02;
    const src = this.noise(o.kind || 'white', t, end, o.rate || 1);
    const flt = this.filter(o.ft || 'bandpass', o.f || 1000, o.q ?? 1);
    if (o.f2) {
      flt.frequency.setValueAtTime(this.eng.fclamp(o.f), t);
      flt.frequency.exponentialRampToValueAtTime(this.eng.fclamp(Math.max(o.f2, 10)), t + (o.glide ?? (a + d)));
    }
    const g = this.gain(0);
    src.connect(flt); flt.connect(g); g.connect(dest);
    envAHD(g.gain, t, o.peak ?? 0.5, a, hold, d);
    return { src, flt, g };
  }

  /** Finish building: cleanup is attached to the latest-ending source. */
  done() {
    if (!this.last) { this.cleanup(); return; }
    this.last.onended = () => this.cleanup();
  }
  cleanup() {
    if (this.closed) return;
    this.closed = true;
    for (let i = 0; i < this.nodes.length; i++) { try { this.nodes[i].disconnect(); } catch { /* already */ } }
    this.nodes.length = 0;
    this.eng.active--;
    this.eng.tags[this.tag]--;
  }
}

// ------------------------------------------------------------------ envelopes
/** attack (linear) → hold → exponential-ish decay (setTarget, ~-43 dB at d). */
export function envAHD(param, t, peak, a, hold, d) {
  param.setValueAtTime(0, t);
  param.linearRampToValueAtTime(Math.max(peak, 0), t + Math.max(a, 0.001));
  if (hold > 0) param.setValueAtTime(Math.max(peak, 0), t + a + hold);
  param.setTargetAtTime(0, t + Math.max(a, 0.001) + hold, Math.max(d, 0.004) / 5);
}
/** attack → sustain until t+a+hold → release; slow pads. */
export function envASR(param, t, peak, a, hold, r) {
  param.setValueAtTime(0, t);
  param.linearRampToValueAtTime(peak, t + a);
  param.setValueAtTime(peak, t + a + Math.max(hold, 0));
  param.linearRampToValueAtTime(0, t + a + Math.max(hold, 0) + r);
}
/** exponential swell (reverse envelope) then quick cut. */
export function envSwell(param, t, peak, rise, cut = 0.08) {
  param.setValueAtTime(EPS, t);
  param.exponentialRampToValueAtTime(Math.max(peak, EPS * 2), t + rise);
  param.linearRampToValueAtTime(0, t + rise + cut);
}

// ------------------------------------------------------------------ engine
export function createEngine(ac, { mobile = false } = {}) {
  const sr = ac.sampleRate;
  const nyq = sr * 0.5 * 0.92;
  const bufs = {};
  const ksCache = new Map();
  const eng = {
    ac, sr, mobile, active: 0, tags: Object.create(null),
    fclamp: (f) => (f > nyq ? nyq : f < 10 ? 10 : f),
    voice: (tag) => new Voice(eng, tag),
    buf(kind) { return bufs[kind] || (bufs[kind] = makeBuffer(kind)); },
    ks: (midi, timbre) => ksBuffer(midi, timbre),
    impulse: (seconds) => makeImpulse(seconds),
    count(prefix) { let n = 0; for (const k in eng.tags) if (k.startsWith(prefix)) n += eng.tags[k]; return n; },
  };

  function makeBuffer(kind) {
    const len = Math.floor(sr * (kind === 'crackle' ? 3 : 2));
    const b = ac.createBuffer(1, len, sr);
    const d = b.getChannelData(0);
    if (kind === 'white') {
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    } else if (kind === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
      }
    } else if (kind === 'brown') {
      let last = 0;
      for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
    } else if (kind === 'crackle') {
      // sparse pops of decaying noise (wood/wax fire) over a faint hiss
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.015;
      let i = 0;
      while (i < len) {
        i += Math.floor(sr * (0.004 + Math.random() * Math.random() * 0.09));
        const amp = Math.pow(Math.random(), 2.2) * 0.95 + 0.05;
        const L = Math.floor(sr * (0.0008 + Math.random() * 0.006));
        const tone = Math.random() < 0.3;
        let lp = 0;
        for (let j = 0; j < L && i + j < len; j++) {
          const e = Math.exp(-6 * j / L);
          const w = Math.random() * 2 - 1;
          lp = tone ? lp + (w - lp) * 0.35 : w;
          d[i + j] += lp * amp * e;
        }
      }
      // fade loop seam
      const F = Math.floor(sr * 0.02);
      for (let k = 0; k < F; k++) { const g = k / F; d[k] *= g; d[len - 1 - k] *= g; }
    }
    return b;
  }

  /** Stereo cavern IR: predelay, a few early reflections, a darkening exponential tail. */
  function makeImpulse(seconds = 3.5) {
    const len = Math.floor(sr * seconds);
    const b = ac.createBuffer(2, len, sr);
    const pre = Math.floor(sr * 0.018);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      let lp = 0;
      for (let i = pre; i < len; i++) {
        const t = (i - pre) / (len - pre);
        const env = Math.pow(1 - t, 2.4) * Math.exp(-t * 2.2);
        const coef = 0.94 - 0.62 * Math.sqrt(t);           // tail gets darker over time
        lp += ((Math.random() * 2 - 1) - lp) * coef;
        d[i] = lp * env;
      }
      // early reflections (cave walls), slightly different per ear
      const taps = [0.011, 0.023, 0.031, 0.047, 0.059, 0.073, 0.089];
      for (let k = 0; k < taps.length; k++) {
        const p = pre + Math.floor(sr * (taps[k] + (ch ? 0.0023 * k : 0)));
        if (p < len) d[p] += (k % 2 ? -1 : 1) * (0.55 - k * 0.06);
      }
      // gentle fade in to avoid a click
      for (let i = 0; i < pre + 64 && i < len; i++) d[i] *= i / (pre + 64);
    }
    return b;
  }

  /** Karplus–Strong pluck rendered offline. Buffer sample-rate chosen so the period is
   *  an exact integer + filter delay → perfectly tuned at any pitch; the browser resamples. */
  const TIMBRES = {
    harp:   { t60: 2.6, bright: 0.75, pos: 0.18, stretch: 0.5, maxDur: 3.2 },
    muted:  { t60: 0.9, bright: 0.35, pos: 0.3, stretch: 0.5, maxDur: 1.2 },
    bass:   { t60: 1.4, bright: 0.45, pos: 0.12, stretch: 0.5, maxDur: 1.8 },
    tight:  { t60: 0.7, bright: 0.9, pos: 0.12, stretch: 0.5, maxDur: 0.9 },
    koto:   { t60: 1.8, bright: 1.0, pos: 0.08, stretch: 0.42, maxDur: 2.4 },
  };
  function ksBuffer(midi, timbreName = 'harp') {
    midi = Math.round(clamp(midi, 24, 108));
    const key = midi * 16 + (Object.keys(TIMBRES).indexOf(timbreName) + 1);
    const hit = ksCache.get(key);
    if (hit) { ksCache.delete(key); ksCache.set(key, hit); return hit; }
    const T = TIMBRES[timbreName] || TIMBRES.harp;
    const f = mtof(midi);
    const lag = 1 - T.stretch;                 // delay added by the two-tap averaging filter
    let N = Math.max(6, Math.round(28000 / f - lag));
    let rate = (N + lag) * f;
    if (rate > 96000) { N = Math.max(4, Math.floor(96000 / f - lag)); rate = (N + lag) * f; }
    if (rate < 8000) { N = Math.ceil(8000 / f - lag); rate = (N + lag) * f; }
    const t60 = T.t60 * clamp(Math.pow(220 / f, 0.45), 0.35, 1.9);
    const dur = Math.min(T.maxDur, t60);
    const len = Math.max(N * 4, Math.floor(dur * rate));
    const b = ac.createBuffer(1, len, rate);
    const y = b.getChannelData(0);
    // excitation: low-passed noise with a pluck-position comb, DC removed
    let lp = 0, mean = 0;
    const exc = new Float32Array(N);
    for (let i = 0; i < N; i++) { lp += ((Math.random() * 2 - 1) - lp) * (0.12 + 0.88 * T.bright); exc[i] = lp; }
    const P = Math.max(1, Math.round(N * T.pos));
    for (let i = 0; i < N; i++) { y[i] = exc[i] - (i >= P ? exc[i - P] : 0) * 0.9; mean += y[i]; }
    mean /= N;
    for (let i = 0; i < N; i++) y[i] -= mean;
    const rho = Math.pow(0.001, 1 / (t60 * f));
    const s = T.stretch;
    for (let i = N; i < len; i++) y[i] = rho * (s * y[i - N] + (1 - s) * (i - N - 1 >= 0 ? y[i - N - 1] : 0));
    // normalise and fade the very end
    let peak = 0;
    for (let i = 0; i < len; i++) { const a = y[i] < 0 ? -y[i] : y[i]; if (a > peak) peak = a; }
    const norm = peak > 0 ? 0.9 / peak : 1;
    const F = Math.min(len, Math.floor(rate * 0.08));
    for (let i = 0; i < len; i++) { y[i] *= norm; if (i > len - F) y[i] *= (len - i) / F; }
    ksCache.set(key, b);
    if (ksCache.size > 72) ksCache.delete(ksCache.keys().next().value);
    return b;
  }

  return eng;
}
