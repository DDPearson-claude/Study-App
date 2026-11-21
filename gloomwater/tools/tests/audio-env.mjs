// A deterministic fake WebAudio + game ctx for node tests of src/audio*.js (tools/tests/audio-v3.test.mjs).
//
// FakeAudioContext implements the node types audio.js / audio-dsp.js / audio-music.js / audio-sfx.js build (gain,
// oscillator, biquad, buffer source, convolver, delay, compressor, analyser, stereo panner) and records every node
// creation, connection, start / stop and AudioParam write in `trace` (rounded), so two runs of the same script can be
// compared bit for bit. Time only moves when the test calls advance(); sources fire `onended` once currentTime passes
// their stop time (in creation order), as a browser would, so voice counting and per-name limits behave as in play.
//
// makeAudioHarness({create, data, run, …}) wires one audio module to a fake ctx (bus, state, fishing / survival /
// combat stand-ins), unlocks it, and returns {ctx, audio, ac, bus, step(seconds), log()}.
const r4 = (v) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v * 1e4) / 1e4 : v);

export function seededRandom(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class FakeParam {
  constructor(ac, owner, name, value) { this.ac = ac; this.owner = owner; this.name = name; this._v = value; }
  get value() { return this._v; }
  set value(v) { this._v = v; this.ac.rec(`${this.owner.id}.${this.name}=${r4(v)}`); }
  rec(m, a, b) { this.ac.rec(`${this.owner.id}.${this.name}.${m}(${r4(a)},${r4(b)})`); return this; }
  setValueAtTime(v, t) { this._v = v; return this.rec('set', v, t); }
  linearRampToValueAtTime(v, t) { this._v = v; return this.rec('lin', v, t); }
  exponentialRampToValueAtTime(v, t) {
    if (!(v > 0) && !(v < 0)) throw new RangeError('exponentialRampToValueAtTime: value must be non-zero');
    this._v = v; return this.rec('exp', v, t);
  }
  setTargetAtTime(v, t, tc) { this._v = v; return this.rec('tgt', v, `${r4(t)}/${r4(tc)}`); }
  cancelScheduledValues(t) { return this.rec('cancel', t); }
}

class FakeNode {
  constructor(ac, type, params = {}) {
    this.ac = ac; this.type = type; this.id = `${type[0]}${++ac.nid}`;
    for (const [k, v] of Object.entries(params)) this[k] = new FakeParam(ac, this, k, v);
    ac.rec(`new ${this.id}`);
  }
  connect(dest) {
    this.ac.rec(`${this.id}->${dest instanceof FakeParam ? `${dest.owner.id}.${dest.name}` : dest.id}`);
    return dest;
  }
  disconnect() { this.ac.disconnects++; }
}
class FakeSource extends FakeNode {
  constructor(ac, type, params) { super(ac, type, params); this.startAt = null; this.stopAt = Infinity; this._onended = null; this.ended = false; ac.sources.push(this); }
  start(t = 0, off) { this.startAt = t; this.ac.rec(`${this.id}.start(${r4(t)}${off !== undefined ? `,${r4(off)}` : ''})`); }
  stop(t = 0) { this.stopAt = t; this.ac.rec(`${this.id}.stop(${r4(t)})`); }
  set onended(fn) { this._onended = fn; }
  get onended() { return this._onended; }
}
class FakeOsc extends FakeSource {
  constructor(ac) { super(ac, 'osc', { frequency: 440, detune: 0 }); this._type = 'sine'; }
  set type(v) { this._type = v; this.ac.rec(`${this.id}.type=${v}`); }
  get type() { return this._type; }
}
class FakeBufferSource extends FakeSource {
  constructor(ac) { super(ac, 'bsrc', { playbackRate: 1 }); this.buffer = null; this.loop = false; }
}
class FakeBiquad extends FakeNode {
  constructor(ac) { super(ac, 'biquad', { frequency: 350, Q: 1, gain: 0, detune: 0 }); this._type = 'lowpass'; }
  set type(v) { this._type = v; this.ac.rec(`${this.id}.type=${v}`); }
  get type() { return this._type; }
}
class FakeBuffer {
  constructor(channels, length, sampleRate) {
    this.numberOfChannels = channels; this.length = length; this.sampleRate = sampleRate; this.duration = length / sampleRate;
    this.data = Array.from({ length: channels }, () => new Float32Array(length));
  }
  getChannelData(i) { return this.data[i]; }
}

export class FakeAudioContext {
  constructor() {
    this.sampleRate = 22050; this.currentTime = 0; this.state = 'running'; this.nid = 0; this.disconnects = 0;
    this.trace = []; this.sources = []; this.destination = new FakeNode(this, 'dest');
    FakeAudioContext.last = this;
  }
  rec(s) { this.trace.push(`${r4(this.currentTime)}|${s}`); }
  createGain() { return new FakeNode(this, 'gain', { gain: 1 }); }
  createOscillator() { return new FakeOsc(this); }
  createBiquadFilter() { return new FakeBiquad(this); }
  createBufferSource() { return new FakeBufferSource(this); }
  createBuffer(ch, len, sr) { return new FakeBuffer(ch, len, sr); }
  createConvolver() { const n = new FakeNode(this, 'conv'); n.buffer = null; return n; }
  createDelay() { return new FakeNode(this, 'delay', { delayTime: 0 }); }
  createDynamicsCompressor() { return new FakeNode(this, 'comp', { threshold: -24, knee: 30, ratio: 12, attack: 0.003, release: 0.25 }); }
  createAnalyser() { const n = new FakeNode(this, 'analyser'); n.fftSize = 2048; n.smoothingTimeConstant = 0.8; n.getFloatTimeDomainData = (b) => b.fill(0); return n; }
  createStereoPanner() { return new FakeNode(this, 'pan', { pan: 0 }); }
  resume() { this.state = 'running'; return Promise.resolve(); }
  suspend() { return Promise.resolve(); }
  /** Move the clock and end every source whose stop time has passed (creation order). */
  advance(dt) {
    this.currentTime += dt;
    const keep = [];
    for (const s of this.sources) {
      if (!s.ended && s.stopAt <= this.currentTime) { s.ended = true; try { s._onended?.(); } catch { /* ignore */ } } else if (!s.ended) keep.push(s);
    }
    this.sources = keep;
  }
}

export function createBus() {
  const map = new Map();
  return {
    on(e, fn) { if (!map.has(e)) map.set(e, []); map.get(e).push(fn); return () => {}; },
    off() {},
    emit(e, p) { for (const fn of map.get(e) || []) fn(p); },
  };
}

/** Install the browser globals audio.js touches (window, document, AudioContext, timers). Returns a restore(). */
export function installGlobals() {
  const saved = { window: globalThis.window, document: globalThis.document, setInterval: globalThis.setInterval, btoa: globalThis.btoa };
  const listeners = [];
  globalThis.window = { AudioContext: FakeAudioContext, addEventListener: (...a) => listeners.push(a) };
  globalThis.document = { hidden: false, addEventListener: () => {} };
  globalThis.setInterval = () => 0;      // the 25 ms music tick: the harness calls update() instead
  return () => { for (const k of Object.keys(saved)) { if (saved[k] === undefined) delete globalThis[k]; else globalThis[k] = saved[k]; } };
}

/**
 * One audio module on a fake ctx. opts: {create (audio.js's create), data, run, flow, seed}.
 * The stand-ins are plain objects the test mutates: ctx.fishing {state, view, bobberPos}, ctx.survival {info},
 * ctx.combat {enemies, swarmActive?, nightMode?}.
 */
export function makeAudioHarness({ create, data, run = null, flow = 'playing', seed = 7, combat = null, survival = null } = {}) {
  const restoreRandom = Math.random;
  Math.random = seededRandom(seed);
  const restore = installGlobals();
  const bus = createBus();
  const info = { phase: 'calm', day: 1, time: 10, duration: 180, k: 0.05, isNight: false };
  const ctx = {
    bus, data, flow, paused: false, isMobile: false, debug: {}, errors: [],
    state: { meta: { settings: { master: 0.8, music: 0.6, sfx: 0.9 } }, run },
    time: { dt: 0.05, gameDt: 0.05, t: 0, gameT: 0, timeScale: 1, frame: 0 },
    input: { down: false },
    player: { position: { x: 0, z: 0 }, speed: 0, anchored: false },
    render: { getYaw: () => 0 },
    progression: { getStats: () => ({ moveSpeed: 6, lightRadius: 8 }) },
    ui: { isBlocking: () => false },
    fishing: { state: 'idle', view: { tension: 0, progress: 0 }, bobberPos: null },
    survival: survival || { info, getPhaseInfo() { return { ...this.info }; } },
    combat: combat || { enemies: [] },
  };
  const audio = create(ctx);
  ctx.audio = audio;
  audio.init();
  audio.unlock();
  const ac = FakeAudioContext.last;
  /** Advance real (audio) and game time by `seconds` in frames of `frame` s, calling update() each frame. */
  function step(seconds = 0.1, frame = 0.05) {
    let left = seconds;
    while (left > 1e-9) {
      const dt = Math.min(frame, left);
      left -= dt;
      ac.advance(dt);
      ctx.time.dt = dt; ctx.time.t += dt; ctx.time.frame++;
      ctx.time.gameDt = (ctx.flow === 'playing' || ctx.flow === 'hub') && !ctx.paused ? dt : 0;   // v3: the hub's world is live too
      ctx.time.gameT += ctx.time.gameDt;
      audio.update(dt);
    }
  }
  function done() { Math.random = restoreRandom; restore(); }
  return { ctx, audio, ac, bus, step, done, log: (n = 240) => ctx.debug.audioLog?.(n) || [] };
}
