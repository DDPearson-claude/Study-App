// Offline renders of GLOOMWATER's synthesised sounds, to look at (spectrograms) and listen to (WAV) without playing the game.
//
//   node tools/audio-render.mjs [--out=tools/out/audio-render] [--only=name,name] [--set=af|fe|intro|mossmere|all] [--sr=32000]
//   --set=mossmere  the Mossmere under the loop (M1 step 3a, src/audio-mossmere.js): bed_day, bed_dusk, bed_night (the bed's layers
//                and breaths by light), each place clear and through its bank (lily, span, buoys, bell: _clear, _muffled),
//                giant_roll (through its bank), mist_lift, seal_press; exit code 1 if the master's peak passes -1.0 dBFS in any
//   --set=intro  the opening cut scene's cue (src/audio-intro.js, INTRO.sound): `intro_cue` is the whole film through the game's
//                bus (with ember_swell and flame_catch), `intro_bus` the cue's own bus alone, whose peak must stay under
//                INTRO.sound.peakDb + 3 dB (exit code 1 otherwise); `intro_skip_*` a skip's 0.25 s fade at three moments
//   --set=show --log=<film>/sound.json [--film=<silent.mp4> --mux=<out.mp4>] [--sr=48000] [--pre=14] [--tail=2.5] [--lead=1]
//                [--gain=auto|<dB>] [--seed=7]
//                the catch show's film, heard: the sound log of a film run (tools/tests/show-audit.scenario.mjs --video writes
//                it beside the frames) played back through the game's OWN audio module (src/audio.js: its handlers, its score
//                and beds, its buses and compressor) on an OfflineAudioContext stepped at the film's steps. Per take: a pre-roll
//                (what sounded before the first frame, the score and the water settled), every step's events on their step with
//                what audio reads of the game at that step, a tail. A step's sounds are laid --lead steps early (default 1), so
//                a sound falls within a step either side of the first frame that shows it (a frame holds three steps). The
//                takes are joined at the film's cuts (the tail of one rings 0.5 s under the next). One gain for the whole film
//                (auto: the mean to -21 dBFS, never a peak over -1.5 dBFS). Writes show.wav, show.png (spectrogram, the beats
//                marked), show.json (every sound the module issued at its film time, the game's own list from the run laid on
//                the steps beside it, the level per beat). With --film and --mux: the film with this sound (the picture copied,
//                AAC 192k, the last 0.6 s faded), ffmpeg's volumedetect and a spectrogram strip beside it.
//                Ends with the show's mix gates (slice-1a PLAN §2.2 item 25): the present the loudest beat of each show, no card sound
//                above it, the master's peak ≤ -1.0 dBFS, the Small's cord ticks ≥ 6 dB over the bed, no hush rise on the card's
//                first frame, the card's own unfold sound, no trial chime inside the show (exit code 1 when one fails). The committed
//                log is tools/tests/fixtures/show-seq-sound.json (a Small and an Elder).
//
// Bundles src/audio-dsp.js + src/audio-sfx.js (+ audio-af.js) + src/audio-v3.js with esbuild, opens it in headless Chromium and
// renders each case through an OfflineAudioContext with the game's own SFX bus shape (dry + the cavern convolver + the delay),
// so what is rendered is what audio.js plays. Each case writes <name>.wav and <name>.png: a log-frequency spectrogram (40 Hz –
// 11 kHz, dB-mapped ink on bone) over a peak-envelope strip, with 0.5 s ticks. A whole automatic play per class (the beats of a
// class-level plan scheduled at their times, plus the line's hum) renders as play_<class>.png / .wav, so the play can be judged
// as a whole: the ratchet's rate, the hiss climbing, the scare's gap, the still's silence, the strain whine's pitch by tier.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import * as esbuild from 'esbuild';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v === undefined ? true : v]; }));
const outDir = resolve(root, String(args.out || 'tools/out/audio-render'));
mkdirSync(outDir, { recursive: true });
const SR = Number(args.sr || (args.set === 'show' ? 48000 : 32000));

// ------------------------------------------------------------------ the cases
const P = (phase, cls, extra = {}) => ({ phase, sizeClass: cls === 'ancient' ? 'elder' : cls, ...(cls === 'ancient' ? { ancient: true } : {}), dur: 1.2, strength: 0.7, tier: 0, ...extra });
const BEATS = [];
for (const cls of ['small', 'elder']) {
  BEATS.push({ name: `take_${cls}`, beat: P('take', cls, { dur: 0.6 }) });
  BEATS.push({ name: `gain_${cls}`, beat: P('gain', cls, { dur: 1.6 }) });
  BEATS.push({ name: `run_${cls}`, beat: P('run', cls, { dur: 2 }) });
  BEATS.push({ name: `hold_${cls}`, beat: P('hold', cls, { dur: 1.6 }) });
  BEATS.push({ name: `surge_${cls}`, beat: P('surge', cls, { dur: 0.7, strength: 1 }) });
  BEATS.push({ name: `lift_${cls}`, beat: P('lift', cls, { dur: 1 }) });
}
BEATS.push({ name: 'gain_trophy_t0', beat: P('gain', 'trophy', { dur: 1.6, tier: 0 }) });
BEATS.push({ name: 'gain_trophy_t4', beat: P('gain', 'trophy', { dur: 1.6, tier: 4 }) });
for (const t of [0, 2, 4]) BEATS.push({ name: `surge_trophy_t${t}`, beat: P('surge', 'trophy', { dur: 0.9, strength: 1, tier: t }) });
BEATS.push({ name: 'glimpse_roll_prize', beat: P('glimpse', 'prize', { kind: 'roll', length: 0.6, dur: 1 }) });
BEATS.push({ name: 'glimpse_swirl_keeper', beat: P('glimpse', 'keeper', { kind: 'swirl', length: 0.4, dur: 1 }) });
BEATS.push({ name: 'glimpse_slap_trophy', beat: P('glimpse', 'trophy', { kind: 'tailSlap', length: 0.9, dur: 1 }) });
BEATS.push({ name: 'glimpse_pass_elder', beat: P('glimpse', 'elder', { kind: 'pass', length: 1.5, dur: 1.4 }) });
BEATS.push({ name: 'glimpse_skitter_small', beat: P('glimpse', 'small', { kind: 'skitter', length: 0.25, dur: 0.9 }) });
BEATS.push({ name: 'leap_skip_keeper', beat: P('leap', 'keeper', { kind: 'skip', length: 0.4, dur: 0.6 }) });
BEATS.push({ name: 'leap_trophy', beat: P('leap', 'trophy', { kind: 'leap', length: 0.9, dur: 0.9 }) });
BEATS.push({ name: 'leap_breach_ancient', beat: P('leap', 'ancient', { kind: 'breach', length: 2.8, dur: 1.1 }) });
BEATS.push({ name: 'scare_slack_prize', beat: P('scare', 'prize', { kind: 'slack', length: 0.6, dur: 0.9 }) });
BEATS.push({ name: 'scare_shake_trophy', beat: P('scare', 'trophy', { kind: 'shake', length: 0.9, dur: 0.9 }) });
BEATS.push({ name: 'laststand_elder', beat: P('lastStand', 'elder', { dur: 3, strength: 1 }) });
BEATS.push({ name: 'place_grind', beat: P('place', 'prize', { kind: 'grind', dur: 1.4 }) });
BEATS.push({ name: 'place_chains', beat: P('place', 'prize', { kind: 'chains', dur: 1.4 }) });
const ONE = (name, opts = {}, dur = 2.5) => ({ name, sfx: name, opts, dur });
const SINGLES = [
  ...['strike_clean', 'strike_struck', 'strike_early', 'strike_late'].map((n) => ONE(n, { k: 0.5 }, 1.4)),
  ...['loss_snap', 'loss_thrown', 'loss_spat', 'loss_spooled', 'loss_fouled'].map((n) => ONE(n, { k: 0.7 }, 2.6)),
  ONE('loss_snap', { k: 0.7, staggered: true }, 2.6),
  ONE('still_crash', { k: 0.95 }, 2.5), ONE('bite_pass', {}, 1), ONE('gotaway', { root: 50 }, 2.5),
  ...['voice_harpstring', 'voice_vesper', 'voice_sexton', 'voice_clapper', 'voice_wineglass', 'voice_chime'].map((n) => ONE(n, {}, 3.5)),
  ONE('cove_ambience', {}, 2), ONE('cove_bell_far', {}, 5), ONE('ember_swell', {}, 3.5), ONE('flame_catch', {}, 2.8), ONE('flame_catch', { flare: true }, 1.6),
  ONE('setout', { root: 50 }, 4.5),
];
SINGLES.find((c, i) => c.name === 'loss_snap' && c.opts.staggered && (c.name = 'loss_staggered', true));
SINGLES.find((c) => c.name === 'flame_catch' && c.opts.flare && (c.name = 'flame_flare', true));
const MURK = ['murkWake', 'murkOdds', 'murkSpooked'];
const PLAYS = ['small', 'keeper', 'prize', 'trophy', 'elder', 'ancient'];

// ------------------------------------------------------------------ the page
const entry = `
import { createEngine } from '${resolve(root, 'src/audio-dsp.js').replace(/\\/g, '/')}';
import { SFX } from '${resolve(root, 'src/audio-sfx.js').replace(/\\/g, '/')}';
import * as V3 from '${resolve(root, 'src/audio-v3.js').replace(/\\/g, '/')}';
import * as DATA from '${resolve(root, 'src/data.js').replace(/\\/g, '/')}';
import { createIntroCue } from '${resolve(root, 'src/audio-intro.js').replace(/\\/g, '/')}';
import { soundEvents } from '${resolve(root, 'src/intro.js').replace(/\\/g, '/')}';
import { create as createAudio } from '${resolve(root, 'src/audio.js').replace(/\\/g, '/')}';
import * as MOSS from '${resolve(root, 'src/audio-mossmere.js').replace(/\\/g, '/')}';
function bus(ac, eng) {
  const master = ac.createGain(); master.gain.value = 0.85;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.25;
  master.connect(comp); comp.connect(ac.destination);
  const conv = ac.createConvolver(); conv.buffer = eng.impulse(3.5); const vr = ac.createGain(); vr.gain.value = 0.85; conv.connect(vr); vr.connect(master);
  const delay = ac.createDelay(2); delay.delayTime.value = 0.43; const fb = ac.createGain(); fb.gain.value = 0.36;
  const dlp = ac.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 2400; const dhp = ac.createBiquadFilter(); dhp.type = 'highpass'; dhp.frequency.value = 260;
  delay.connect(dlp); dlp.connect(dhp); dhp.connect(fb); fb.connect(delay); const dr = ac.createGain(); dr.gain.value = 0.5; dhp.connect(dr); dr.connect(master);
  return { master, conv, delay };
}
function voice(eng, B, name, t, opts) {
  const def = SFX[name]; if (!def) throw new Error('no sfx ' + name);
  const v = eng.voice('s:' + name);
  const out = v.gain(Math.max(0, Math.min(2, opts.volume ?? 1)) * (def.gain ?? 1));
  let head = out;
  if (opts.pan) { const pn = v.n(eng.ac.createStereoPanner()); pn.pan.value = opts.pan; out.connect(pn); head = pn; }
  head.connect(B.master);
  if (def.wet) { const w = v.gain(def.wet); head.connect(w); w.connect(B.conv); }
  if (def.dly) { const d = v.gain(def.dly); head.connect(d); d.connect(B.delay); }
  def.fn(v, out, t, Math.max(0.25, Math.min(4, opts.pitch ?? 1)), opts, eng);
  v.done();
}
async function render(dur, build) {
  const ac = new OfflineAudioContext(2, Math.ceil(${SR} * dur), ${SR});
  const eng = createEngine(ac, {});
  const B = bus(ac, eng);
  build(ac, eng, B);
  const buf = await ac.startRendering();
  return [buf.getChannelData(0), buf.getChannelData(1)].map((c) => Array.from(c, (x) => Math.round(Math.max(-1, Math.min(1, x)) * 32767)));
}
window.renderBeat = (beat, lake) => {
  const snds = V3.beatSounds(beat, DATA, { lake });
  const dur = Math.max(...snds.map((s) => s.delay + s.dur), 0.5) + 1.6;
  return render(dur, (ac, eng, B) => { for (const s of snds) voice(eng, B, s.name, 0.05 + s.delay, { ...s.opts, dur: s.dur }); });
};
window.renderOne = (name, opts, dur) => render(dur, (ac, eng, B) => voice(eng, B, name, 0.05, opts));
window.renderMurk = (key) => {
  const text = DATA.FIRST_EVENING.text[key];
  return render(1.9, (ac, eng, B) => voice(eng, B, 'murk_grumble', 0.05, { plan: V3.grumblePlan(text, key) }));
};
// a whole play: a class-level plan (as fishing-play.js lays one out), its beats' sounds at their times and the line's hum under it
window.renderPlay = (cls, tier, seed) => {
  const A = DATA.AUTOFISH;
  let s = seed >>> 0;
  const rnd = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const P0 = A.play[cls], U = (r) => r[0] + (r[1] - r[0]) * rnd(), I = (r) => Math.round(U(r));
  const acts = [];
  for (let i = 0; i < I(P0.runs); i++) acts.push({ phase: 'run', kind: cls === 'elder' && i === 0 ? 'long' : null });
  for (let i = 0; i < I(P0.surges); i++) acts.push({ phase: 'surge' });
  if (cls !== 'small') acts.push({ phase: 'hold' });
  for (let i = 0; i < (P0.lastStand || 0); i++) acts.push({ phase: 'lastStand' });
  if (P0.still) acts.splice(acts.length - 1, 0, { phase: 'still' });
  const seq = [{ phase: 'take' }]; for (const a of acts) seq.push({ phase: 'gain' }, a); seq.push({ phase: 'gain' }, { phase: 'lift' });
  const tierMul = Math.pow(1 + A.play.tackle.durPerTier, tier);
  let t = 0; const beats = seq.map((b) => { const d = (b.phase === 'still' ? 1.5 : U(A.play.beat[b.phase] || [0.6, 1])) * tierMul; const x = { ...b, t, dur: d }; t += d; return x; });
  const dur = t, ev = [];
  const nG = cls === 'small' ? 0 : I(P0.glimpses);
  for (let i = 0; i < nG; i++) ev.push({ phase: 'glimpse', kind: i === 1 && (cls === 'elder' || cls === 'ancient') ? 'pass' : cls === 'keeper' ? 'swirl' : i === 1 ? 'tailSlap' : 'roll', t: dur * (0.2 + 0.6 * (i + 0.5) / nG), dur: U(A.play.beat.glimpse) });
  if (cls === 'small') ev.push({ phase: 'glimpse', kind: 'skitter', t: beats.at(-1).t, dur: beats.at(-1).dur });
  const nS = I(A.play.scare[cls]);
  for (let i = 0; i < nS; i++) ev.push({ phase: 'scare', kind: i % 2 ? 'shake' : 'slack', t: dur * (0.3 + 0.35 * i / Math.max(1, nS)), dur: U(A.play.beat.scare) });
  if (cls !== 'small') ev.push({ phase: 'leap', kind: A.leap.kind[cls], t: dur * 0.42, dur: U(A.play.beat.leap) });
  const L = (c) => V3.classLength(DATA, c, 'mossmere');
  const total = dur + 2.2;
  return render(total, (ac, eng, B) => {
    const sizeClass = cls === 'ancient' ? 'elder' : cls, extra = cls === 'ancient' ? { ancient: true } : {};
    voice(eng, B, 'strike_struck', 0.05, { k: V3.lengthK(L(cls)) });
    // the line's hum (audio.js keeps it as a loop; here one oscillator automated beat by beat)
    const k = V3.lengthK(L(cls)), f = V3.humFreq(k);
    const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f * 2; bp.Q.value = 4;
    const hg = ac.createGain(); hg.gain.value = 0; o.connect(bp); bp.connect(hg); hg.connect(B.master); o.start(0.1); o.stop(total);
    const HUM = { take: 0.6, gain: 0.5, lift: 0.45, run: 0.75, hold: 1, surge: 0.9, lastStand: 1, place: 0.55 };
    let afterStill = false;
    for (const b of beats) {
      const at = 0.15 + b.t;
      if (b.phase === 'still') { hg.gain.setTargetAtTime(0, at, 0.015); afterStill = true; continue; }
      if (afterStill) { afterStill = false; voice(eng, B, 'still_crash', at, { k }); }
      hg.gain.setTargetAtTime(HUM[b.phase] * 0.045 * 0.95, at, 0.12);
      for (const s of V3.beatSounds({ phase: b.phase, kind: b.kind, sizeClass, ...extra, dur: b.dur, strength: b.phase === 'surge' || b.phase === 'lastStand' ? 1 : 0.6, tier }, DATA, { lake: 'mossmere' })) {
        voice(eng, B, s.name, at + s.delay, { ...s.opts, dur: s.dur });
      }
    }
    for (const e of ev) {
      const at = 0.15 + e.t;
      if (e.phase === 'scare') { hg.gain.setTargetAtTime(0, at, 0.015); hg.gain.setTargetAtTime(0.03, at + Math.min(0.6, Math.max(0.2, e.dur * 0.45)), 0.12); }
      for (const s of V3.beatSounds({ phase: e.phase, kind: e.kind, sizeClass, ...extra, dur: e.dur, tier, length: L(cls) }, DATA, { lake: 'mossmere' })) voice(eng, B, s.name, at + s.delay, { ...s.opts, dur: s.dur });
    }
    hg.gain.setTargetAtTime(0, 0.15 + dur, 0.05);
  }).then((pcm) => ({ pcm, beats: beats.map((b) => [b.phase, +(0.15 + b.t).toFixed(2)]), events: ev.map((e) => [e.phase + (e.kind ? ':' + e.kind : ''), +(0.15 + e.t).toFixed(2)]) }));
};
// the opening cut scene's cue: every clock event at its film time. bus: 'game' = through the game's music-like path (reverb, the
// compressor, with the two SFX), 'raw' = the cue's own bus straight to the output (what INTRO.sound.peakDb limits).
// skipAt: a skip there (the bus fades in INTRO.sound.skipFade, nothing later is played).
window.renderIntro = (mode, skipAt) => {
  const I = DATA.INTRO, S = I.sound, ev = soundEvents(I);
  const dur = skipAt ? skipAt + 1.2 : I.length + (S.endRing || 3.2) + 0.6;
  return render(dur, (ac, eng, B) => {
    const raw = mode === 'raw';
    const music = ac.createGain(); music.gain.value = raw ? 1 : 0.62;   // (the game's music gain at its default setting, about)
    music.connect(raw ? ac.destination : B.master);
    const wetIn = ac.createGain(); wetIn.gain.value = raw ? 0 : 0.62; wetIn.connect(B.conv);
    const cue = createIntroCue(eng, { dry: music, wet: wetIn }, S, {});
    for (const e of ev) {
      if (skipAt && e.t > skipAt) continue;
      const at = 0.05 + e.t;
      if (e.mark.sfx) { if (!raw && e.kind === 'on') voice(eng, B, e.mark.sfx, at, { volume: e.mark.volume ?? 1 }); continue; }
      cue.play(e, at);
    }
    if (skipAt) cue.fade(S.skipFade, 0.05 + skipAt); else cue.end(0.05 + I.length);
  }).then((pcm) => ({ pcm, beats: I.beats.map((b) => [b.id, +(0.05 + b.t0).toFixed(2)]), events: ev.filter((e) => e.kind !== 'off' && (!skipAt || e.t <= skipAt)).map((e) => [e.id + (e.kind === 'note' ? e.i : ''), +(0.05 + e.t).toFixed(2)]) }));
};
window.introPeakDb = DATA.INTRO.sound.peakDb;
// ---- the Mossmere under the loop (--set=mossmere; M1 step 3a, src/audio-mossmere.js): the bed by light, each place's voice clear
// and through its bank, the giant's roll, the lift, the catch seal's press. The loops are built as audio.js builds them (its
// makeNoiseLoop / makeOscLoop and the LFO on the filter), into the SFX bus's dry path; the one-shots are the game's SFX_MOSS.
const seeded = (seed) => { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
function mossLoop(ac, eng, def, dest, level, t0, t1) {
  const g = ac.createGain(); g.gain.value = 0; g.connect(dest);
  const flt = ac.createBiquadFilter(); flt.type = def.ft; flt.frequency.value = def.src === 'osc' ? def.ff : def.f; flt.Q.value = def.q; flt.connect(g);
  let src;
  if (def.src === 'osc') {
    src = ac.createOscillator(); src.type = def.type; src.frequency.value = def.f;
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.13; const lg = ac.createGain(); lg.gain.value = def.vib || 0; lfo.connect(lg); lg.connect(src.frequency); lfo.start(t0); lfo.stop(t1);
  } else {
    src = ac.createBufferSource(); src.buffer = eng.buf(def.kind); src.loop = true;
    if (def.lfo) { const lfo = ac.createOscillator(); lfo.frequency.value = def.lfo.rate; const lg = ac.createGain(); lg.gain.value = def.lfo.depth; lfo.connect(lg); lg.connect(flt.frequency); lfo.start(t0); lfo.stop(t1); }
  }
  src.connect(flt); src.start(t0); src.stop(t1);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(level, t0 + 0.6); g.gain.setValueAtTime(level, t1 - 0.6); g.gain.linearRampToValueAtTime(0, t1 - 0.05);
}
window.renderMossBed = (light, dur, seed) => {
  const prev = Math.random; Math.random = seeded(seed);
  return render(dur, (ac, eng, B) => {
    const L = MOSS.bedLevels(light);
    for (const [key, def] of Object.entries(MOSS.BED_LAYERS)) if (L[key] > 0) mossLoop(ac, eng, def, B.master, L[key], 0.05, dur);
    const Bth = MOSS.bedBreath(light);
    for (const t of MOSS.voiceSchedule(Bth.every, dur - 3, Math.random, 0.8)) voice(eng, B, Bth.sfx, t, { volume: Bth.volume, pan: (Math.random() * 2 - 1) * 0.55 });
  }).then((pcm) => { Math.random = prev; return pcm; });
};
window.renderMossPlace = (id, muffled, dur, seed) => {
  const prev = Math.random; Math.random = seeded(seed);
  const V = MOSS.PLACE_VOICES[id], b = MOSS.bankVoice(!muffled);
  return render(dur, (ac, eng, B) => {
    if (V.hum) {
      const H = V.hum, lp = b.muffle > 0 ? Math.min(H.ff, b.muffle * 0.3) : H.ff;
      mossLoop(ac, eng, { src: 'osc', type: H.type, f: H.f, ft: H.ft, ff: lp, q: H.q, vib: H.vib }, B.master, H.level * b.gain * MOSS.humLight('night'), 0.05, dur);
    }
    for (const t of MOSS.voiceSchedule(V.every, dur - (id === 'bell_pool' ? 6 : 1.2), Math.random, 0.3)) voice(eng, B, V.sfx, t, { volume: V.volume * b.gain, muffle: b.muffle });
  }).then((pcm) => { Math.random = prev; return pcm; });
};
window.mossMuffle = MOSS.ROLL_MUFFLE;
window.mossLiftDur = DATA.LOOP?.lift?.thin ?? 3;
// ---- the catch show's film (--set=show): one take of a film run's sound log through the game's own audio module.
// The module is given an OfflineAudioContext (behind a face that always reads 'running' and cannot be resumed or suspended by
// the module) and a ctx whose every read answers from the log's snapshot of that step; the context is suspended at each step's
// time, the step's events are handed to the module's own listeners, its update() runs, and rendering goes on.
window.renderShowTake = async (take, meta, o) => {
  // (one seed per take: the score's own choices and every sound's small jitter repeat from run to run)
  let seed = (o.seed >>> 0) || 7;
  Math.random = () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  window.setInterval = () => 0;   // (the module's 25 ms score tick: update() ticks the score at every step here)
  const SR = o.sr, fps = o.fps, stepS = o.stepMs / 1000, lead = o.lead * stepS, PRE = o.pre, TAIL = o.tail;
  const F = take.frames, N = take.st.length, dur = F.length / fps;
  // the film time of step n: a kept frame is 1 / fps of film whatever steps its chunk held (three; fewer where a stop fell)
  const filmT = (n) => {
    if (!F.length || n >= F[F.length - 1]) return dur + (n - (F[F.length - 1] || 0)) * stepS;
    let k = 0; while (n >= F[k]) k++;
    const a = k ? F[k - 1] : 0;
    return (k + (n - a) / Math.max(1, F[k] - a)) / fps;
  };
  // what sounded before the first frame, on the GAME's clock (the run is staged at a few frames a second: the bite that fell
  // one game frame before the film fell seconds before it by the wall clock); the wall clock where the log has no game time
  const g0 = take.pre?.gameT;
  const preX = (e) => { const g = e.st?.gameT; return typeof g0 === 'number' && typeof g === 'number' && g <= g0 + 1e-6 && g0 - g < 600 ? g - g0 : e.w / 1000; };
  const pre = take.ev.filter((e) => e.pre);
  let film = take.ev.filter((e) => !e.pre);
  // the film's cut of a long play (the scenario jumps the play to its last seconds with debug.fishPlayTo, and the game hands
  // every skipped beat to its listeners in that one step): the sound is cut as the picture is. A step that holds more than one
  // of the play's own beats is that cut: the beats wholly skipped do not sound, the beat cut into sounds for what is left of it
  const OVER = new Set(['glimpse', 'leap', 'scare']);
  const isBeat = (e) => e.ev === 'fishing:reel' && e.p && typeof e.p.phase === 'string' && typeof e.p.t === 'number';
  const cuts = [];
  for (const s0 of [...new Set(film.filter(isBeat).map((e) => e.s))]) {
    const batch = film.filter((e) => e.s === s0 && isBeat(e));
    if (batch.filter((e) => !OVER.has(e.p.phase)).length < 2) continue;
    const next = film.find((e) => e.s > s0 && isBeat(e) && !OVER.has(e.p.phase));
    const T = next ? next.p.t - (next.s - s0) * stepS : Math.max(...batch.map((e) => e.p.t));   // the play's clock after the jump
    const live = batch.filter((e) => e.p.t <= T + 1e-6 && e.p.t + (e.p.dur || 0) > T + 0.05);
    for (const e of live) e.p = { ...e.p, dur: +(e.p.t + e.p.dur - T).toFixed(3), cutFrom: e.p.dur };
    film = film.filter((e) => !batch.includes(e) || live.includes(e));
    cuts.push({ step: s0, x: +filmT(s0).toFixed(3), to: +T.toFixed(2), skipped: batch.filter((e) => !live.includes(e)).map((e) => e.p.phase + (e.p.kind ? ':' + e.p.kind : '')), into: live.map((e) => ({ phase: e.p.phase, left: e.p.dur })) });
  }
  const byStep = new Map(); for (const e of film) { if (!byStep.has(e.s)) byStep.set(e.s, []); byStep.get(e.s).push(e); }
  // the ticks, on the film's axis x (s; the output's sample 0 is x = 0): the pre-roll, the steps, the tail
  const ticks = [];
  { let pi = 0, j = 0;
    for (let x = -PRE; x < -lead - stepS / 2; x = -PRE + (++j) * stepS) {
      const evs = []; while (pi < pre.length && (j === 0 ? preX(pre[pi]) <= x : preX(pre[pi]) - lead <= x)) evs.push(pre[pi++]);
      ticks.push({ x, evs, st: null, pre: true });
    }
    const rest = pre.slice(pi);   // (anything of the last instants before the first frame goes with step 0)
    for (let n = 0; n < N; n++) ticks.push({ x: filmT(n) - lead, n, evs: [...(n === 0 ? rest : []), ...(byStep.get(n) || [])], st: take.st[n] });
    for (const [sx, es] of byStep) if (sx >= N) ticks[ticks.length - 1].evs.push(...es);
    for (let x = ticks[ticks.length - 1].x + stepS; x < dur + TAIL; x += stepS) ticks.push({ x, evs: [], st: null }); }
  const total = PRE + dur + TAIL + 0.05;
  const real = new OfflineAudioContext(2, Math.ceil(SR * total), SR);
  const face = new Proxy(real, { get(t, k) {
    if (k === 'state') return 'running';
    if (k === 'resume' || k === 'suspend' || k === 'close') return () => Promise.resolve();
    const v = t[k]; return typeof v === 'function' ? v.bind(t) : v; } });
  window.AudioContext = function () { return face; };
  // ---- the game, as audio reads it (every read from the step's snapshot)
  let cur = pre.find((e) => e.st)?.st || take.pre || take.st[0];
  let gameNow = null;   // (before the first frame the game's clock runs on with the pre-roll: a bite tell waits for its moment on it)
  const U = (v) => (v === null ? undefined : v);
  const L = Object.create(null);
  const ctx = {
    bus: { on(ev, fn) { (L[ev] || (L[ev] = [])).push(fn); }, emit() {} },
    data: DATA, debug: {}, isMobile: !!meta.isMobile, actors: {},
    get flow() { return cur.flow; }, get paused() { return cur.paused === true; }, get cinematic() { return cur.cinematic === true; },
    state: { get run() { return cur.run; }, meta: { settings: Object.fromEntries(Object.entries(meta.settings || {}).filter(([, v]) => v !== null)), journal: meta.journal || {}, deepestZone: meta.deepestZone || 0 } },
    ui: { isBlocking: () => cur.blocking === true },
    survival: { getPhaseInfo: () => (cur.phase ? { ...cur.phase, swarm: U(cur.phase.swarm) } : null), get nightMode() { return U(cur.surv?.nightMode); }, get lightRadius() { return U(cur.surv?.lightRadius); } },
    combat: { get enemies() { const n = cur.combat?.n || 0; return Array.from({ length: n }, (_, i) => (i === 0 && cur.combat.boss ? { boss: true, hp: 1 } : {})); },
      get nightMode() { return U(cur.combat?.nightMode); }, get swarmActive() { return U(cur.combat?.swarmActive); } },
    fishing: { get state() { return cur.fs || 'idle'; }, get view() { return cur.fv; }, get bobberPos() { return cur.bob; } },
    player: { get position() { return cur.pos; }, get speed() { return cur.speed || 0; }, get anchored() { return cur.anchored === true; } },
    render: { getYaw: () => cur.yaw || 0 },
    input: { get down() { return cur.down === true; } },
    time: { get gameT() { return gameNow ?? (cur.gameT || 0); }, get gameDt() { return cur.gameDt || 0; }, get frame() { return cur.frame || 0; } },
    progression: { getStats: () => cur.stats },
    world: { getZone: () => ({ id: cur.run?.zone }) },
  };
  const audio = createAudio(ctx);
  audio.init();
  audio.unlock();
  const issued = [], seen = new Set(), moods = [];
  let lastMood = null;
  const hand = (e) => { if (e.ev) for (const h of (L[e.ev] || [])) h(e.p || {}); else if (e.call && typeof audio[e.call] === 'function') audio[e.call](...(e.a || [])); };
  /** What the module issued since the last look (its own log), each sound at its scheduled start on the film's axis. */
  const collect = (step) => {
    for (const s of ctx.debug.audioLog(240)) { const key = s.name + '|' + s.at + '|' + s.t; if (!seen.has(key)) { seen.add(key); issued.push({ name: s.name, x: +(s.t - PRE).toFixed(3), issued: +(s.at - PRE).toFixed(3), why: s.why ?? null, pan: s.pan, step }); } }
    if (seen.size > 4000) { const keep = [...seen].slice(-600); seen.clear(); for (const k of keep) seen.add(k); }
  };
  const run = (i) => {
    const tk = ticks[i];
    gameNow = tk.pre && typeof g0 === 'number' ? g0 + tk.x + lead : null;
    const before = tk.evs.filter((e) => e.pre);   // (what sounded before the first frame: each with the game as it was then)
    for (const e of before) { if (e.st) cur = e.st; if (!tk.pre) gameNow = null; hand(e); }
    if (before.length) collect(null);
    if (tk.st) cur = tk.st;
    for (const e of tk.evs) if (!e.pre) hand(e);
    audio.update(i ? Math.min(0.1, tk.x - ticks[i - 1].x) : stepS);
    collect(tk.n ?? null);
    const m = audio.getMood();
    if (m !== lastMood) { lastMood = m; moods.push({ x: +tk.x.toFixed(3), mood: m, zone: ctx.debug.audio().zone }); }
  };
  // the suspends, on distinct render quanta, each scheduled while the one before holds the context
  const Q = 128, frames = []; let lastF = 0;
  for (let i = 1; i < ticks.length; i++) { let f = Math.round((PRE + ticks[i].x) * SR / Q) * Q; if (f <= lastF) f = lastF + Q; frames.push(f); lastF = f; }
  run(0);
  const arm = (i) => { if (i >= ticks.length) return; real.suspend(frames[i - 1] / SR).then(() => { try { run(i); } catch (e) { console.warn('show step', i, String(e)); } arm(i + 1); real.resume(); }); };
  arm(1);
  const buf = await real.startRendering();
  const a = buf.getChannelData(0), b = buf.getChannelData(1), i0 = Math.round(PRE * SR), n = Math.min(a.length - i0, Math.round((dur + TAIL) * SR));
  const out = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) { out[2 * i] = a[i0 + i]; out[2 * i + 1] = b[i0 + i]; }
  const bytes = new Uint8Array(out.buffer); let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  // the marks of the take, on the film's axis: the first event of each kind
  const at = (pred) => { const e = film.find(pred); return e ? +(filmT(e.s)).toFixed(3) : null; };
  const marks = {
    strike: at((e) => e.ev === 'fishing:strike'), T0: at((e) => e.ev === 'fishing:landing'), caught: at((e) => e.ev === 'fishing:caught'),
    lift: at((e) => e.ev === 'fishing:show' && e.p.phase === 'lift'), present: at((e) => e.ev === 'fishing:show' && e.p.phase === 'hold'),
    pause: at((e) => e.ev === 'fishing:show' && e.p.phase === 'pause'), card: at((e) => e.ev === 'fishing:show' && e.p.phase === 'card'),
    cardOpen: at((e) => e.ev === 'ui:modal' && e.p.open === true), count: at((e) => e.ev === 'card:count'), stamp: at((e) => e.ev === 'card:stamp'),
    action: at((e) => e.ev === 'fish:action'), cardClose: at((e) => e.ev === 'ui:modal' && e.p.open === false),
  };
  return { b64: btoa(bin), n, dur, issued, moods, marks, cuts, steps: N, stepT: Array.from({ length: N }, (_, k) => +filmT(k).toFixed(4)) };
};
window.ready = true;
`;
const bundle = await esbuild.build({ stdin: { contents: entry, resolveDir: root, loader: 'js' }, bundle: true, format: 'iife', write: false, logLevel: 'silent' });
// (the show is a v3 thing: its replay reads data.js as the film's page did, the flag on at the film's phase)
const showLogPath = args.set === 'show' ? resolve(process.cwd(), String(args.log || 'tools/out/show/film/sound.json')) : null;
const showLog = showLogPath ? JSON.parse(readFileSync(showLogPath, 'utf8')) : null;
const flag = showLog ? `<script>globalThis.GW_V3=true;globalThis.GW_V3_PHASE=${Number(showLog.meta?.v3phase) || 1};</script>` : '';
const html = `<!doctype html><meta charset="utf-8"><body>${flag}<script>${bundle.outputFiles[0].text}</script>`;
const htmlPath = resolve(outDir, 'render.html');
writeFileSync(htmlPath, html);

import { wav, spectrogram } from './audio-spectro.mjs';

// ------------------------------------------------------------------ the show's film (--set=show)
const dB = (v) => 20 * Math.log10(Math.max(1e-9, v));
/** Peak and RMS (dBFS, both channels) of [L, R] float arrays between two times. */
function level(ch, sr, t0 = 0, t1 = Infinity) {
  const a = Math.max(0, Math.round(t0 * sr)), b = Math.min(ch[0].length, Math.round(t1 * sr));
  let pk = 0, ss = 0;
  for (const c of ch) for (let i = a; i < b; i++) { const v = Math.abs(c[i]); if (v > pk) pk = v; ss += v * v; }
  return b > a ? { peak: +dB(pk).toFixed(1), rms: +dB(Math.sqrt(ss / ((b - a) * ch.length))).toFixed(1) } : { peak: null, rms: null };
}
async function renderShow() {
  const log = showLog, fps = log.fps || 12, stepMs = log.stepMs || 1000 / 36;
  const o = { sr: SR, fps, stepMs, lead: Number(args.lead ?? 1), pre: Number(args.pre ?? 14), tail: Number(args.tail ?? 2.5), seed: Number(args.seed ?? 7) };
  page.on('console', (m) => { if (m.type() === 'warning' || m.type() === 'error') console.log(`[page ${m.type()}]`, m.text()); });
  const filmLen = log.takes.reduce((n, t) => n + t.frames.length, 0) / fps;
  const mix = [new Float64Array(Math.round(filmLen * SR)), new Float64Array(Math.round(filmLen * SR))];
  const ramp = (k) => { const c = Math.cos(0.5 * Math.PI * Math.max(0, Math.min(1, k))); return 1 - c * c; };   // 0 → 1
  const FADE_IN = 0.12, RING = 0.5;
  const takes = [];
  let start = 0;
  for (const [i, take] of log.takes.entries()) {
    const r = await page.evaluate(([t, m, oo]) => window.renderShowTake(t, m, oo), [take, log.meta || {}, { ...o, seed: o.seed + i }]);
    const f = new Float32Array(new Uint8Array(Buffer.from(r.b64, 'base64')).buffer);
    const i0 = Math.round(start * SR), nEnd = Math.round(r.dur * SR);
    for (let k = 0; k < r.n; k++) {
      const j = i0 + k; if (j >= mix[0].length) break;
      // in over the first frames; after the take's last frame its tail rings on under the next take, fading
      const g = ramp(k / (FADE_IN * SR)) * (k < nEnd ? 1 : 1 - ramp((k - nEnd) / (RING * SR)));
      if (g <= 0 && k >= nEnd) break;
      mix[0][j] += f[2 * k] * g; mix[1][j] += f[2 * k + 1] * g;
    }
    // the game's own list of the sounds it issued in the film run, laid on the steps by the audio clock each step logged
    const clock = take.st.map((st) => st?.au?.t ?? null);
    const game = (take.audioLog || []).map((e) => { let n = clock.findIndex((t) => t !== null && t >= e.at - 6e-4); /* (the two clocks are rounded, to 4 and 3 places) */ if (n < 0) n = clock.length; const pre = take.pre?.au?.t != null && e.at <= take.pre.au.t;
      return { name: e.name, step: pre ? null : n, x: pre ? null : +(r.stepT[Math.min(n, r.steps - 1)] ?? r.dur).toFixed(3), why: e.why ?? null }; });
    // the two lists against each other: the same name within a step (the run's audio clock is coarse beside a fast step)
    const key = (e) => `${e.name}@${e.step}`;
    const A = game.filter((e) => e.step !== null), B = r.issued.filter((e) => e.step !== null), used = new Set();
    const onlyGameAll = A.filter((a) => { const j = B.findIndex((b, i) => !used.has(i) && b.name === a.name && Math.abs(b.step - a.step) <= 1); if (j < 0) return true; used.add(j); return false; });
    const cutSteps = new Set(r.cuts.map((c) => c.step));
    const atCut = onlyGameAll.filter((e) => cutSteps.has(e.step)).map(key), onlyGame = onlyGameAll.filter((e) => !cutSteps.has(e.step)).map(key), onlyReplay = B.filter((_, i) => !used.has(i)).map(key);
    // each beat's first sound against the frame that first shows it (ms; a frame holds three steps)
    const fps0 = fps, sync = [];
    const frameOf = (step) => { let k = take.frames.findIndex((f) => step < f); if (k < 0) k = take.frames.length - 1; return k; };
    for (const [label, ev, snd] of [['the strike', (e) => e.ev === 'fishing:strike', /^strike_/], ['T0, the swell', (e) => e.ev === 'fishing:landing', /^land_swell$/], ['caught, the chime', (e) => e.ev === 'fishing:caught', /^land_chime$/],
      ['the lift', (e) => e.ev === 'fishing:show' && e.p.phase === 'lift', /^show_lift$/], ['the present', (e) => e.ev === 'fishing:show' && e.p.phase === 'hold', /^show_present$/], ['the card opens', (e) => e.ev === 'ui:modal' && e.p.open === true, /^ui_open$/],
      ['the count', (e) => e.ev === 'card:count', /^cord_tick$/], ['the stamp', (e) => e.ev === 'card:stamp', /^seal_stamp$/], ['the card closes', (e) => e.ev === 'ui:modal' && e.p.open === false, /^ui_close$/]]) {
      const e = take.ev.find((x) => !x.pre && ev(x)); if (!e) continue;
      const k = frameOf(e.s), s0 = r.issued.find((x) => snd.test(x.name) && x.step !== null && x.step >= e.s);
      sync.push({ beat: label, step: e.s, frame: take.frame0 + k, frameAt: +(start + k / fps0).toFixed(3), sound: s0 ? s0.name : null, soundAt: s0 ? +(start + s0.x).toFixed(3) : null, ms: s0 ? Math.round((s0.x - k / fps0) * 1000) : null });
    }
    takes.push({ name: take.name, species: take.species, cls: take.cls, lengthCm: take.lengthCm, action: take.action ?? null, start: +start.toFixed(3), dur: r.dur, frames: [take.frame0, take.frame0 + take.frames.length - 1], steps: r.steps, clock: take.clock ?? null,
      marks: r.marks, cuts: r.cuts, moods: r.moods, issued: r.issued, game, sync, check: { game: A.length, replay: B.length, atCut, onlyGame, onlyReplay } });
    console.log(`take ${i + 1}  ${take.name}  ${take.species} (${take.cls}, ${take.lengthCm} cm)  film ${start.toFixed(2)} – ${(start + r.dur).toFixed(2)} s  ${r.steps} steps, ${take.ev.length} events, ${r.issued.length} sounds issued`);
    start += r.dur;
  }
  // ---- one gain for the whole film
  const raw = level(mix, SR);
  let gainDb = args.gain !== undefined && args.gain !== 'auto' ? Number(args.gain) : Math.min(-21 - raw.rms, -1.5 - raw.peak);
  const gk = Math.pow(10, gainDb / 20);
  for (const c of mix) for (let i = 0; i < c.length; i++) c[i] *= gk;
  const out = level(mix, SR);
  const pcm = mix.map((c) => Array.from(c, (x) => Math.round(Math.max(-1, Math.min(1, x)) * 32767)));
  // ---- the beats: where each falls in the film and how loud the film is through it
  const beats = [], marksPng = [];
  const SEG = [['bite → strike', null, 'strike'], ['the play', 'strike', 'T0'], ['the reveal (T0 → the lift)', 'T0', 'lift'], ['the lift', 'lift', 'present'], ['the present and the hold', 'present', 'pause'], ['the still pause', 'pause', 'cardOpen'],
    ['the card (open → the count)', 'cardOpen', 'count'], ['the count', 'count', 'stamp'], ['the stamp and after', 'stamp', 'action'], ['the card closing, back to play', 'action', null]];
  for (const t of takes) {
    // (a beat's window opens where its sounds do: its event's film time less the lead)
    const M = t.marks, ld = o.lead * stepMs / 1000, at = (k) => (k === null || M[k] === null ? null : M[k] - ld);
    for (const [label, a, b] of SEG) {
      const x0 = a === null ? 0 : at(a), x1 = b === null ? t.dur : at(b);
      if (x0 === null || x1 === null || !(x1 > x0)) continue;
      beats.push({ take: t.name, beat: label, from: +(t.start + x0).toFixed(2), to: +(t.start + x1).toFixed(2), ...level(mix, SR, t.start + x0, t.start + x1) });
    }
    for (const [k, x] of Object.entries(M)) if (x !== null) marksPng.push([k, t.start + x]);
  }
  // a 50 ms envelope (dBFS RMS), for the eye
  const env = []; for (let x = 0; x < filmLen; x += 0.05) env.push(level(mix, SR, x, x + 0.05).rms);
  writeFileSync(resolve(outDir, 'show.wav'), wav(pcm, SR));
  writeFileSync(resolve(outDir, 'show.png'), spectrogram(pcm, SR, marksPng));
  console.log(`\nthe film: ${filmLen.toFixed(2)} s at ${SR} Hz; raw peak ${raw.peak} dBFS, mean ${raw.rms} dBFS; gain ${gainDb.toFixed(1)} dB → peak ${out.peak} dBFS, mean ${out.rms} dBFS`);
  for (const t of takes) {
    console.log(`\n${t.name}  (${t.species}, ${t.cls}; the film from ${t.start.toFixed(2)} s; the card's clock: ${t.clock || '?'})`);
    console.log('  marks  ' + Object.entries(t.marks).filter(([, x]) => x !== null).map(([k, x]) => `${k} ${(t.start + x).toFixed(2)}`).join('  '));
    for (const c of t.cuts) console.log(`  the play's cut at ${(t.start + c.x).toFixed(2)} s (to ${c.to} s of the play): ${c.skipped.length} skipped beats not sounded (${c.skipped.join(' ')}); cut into ${c.into.map((b) => `${b.phase} with ${b.left} s left`).join(', ') || 'nothing'}`);
    console.log('  score  ' + t.moods.filter((m) => m.x >= -1).map((m) => `${m.mood}/${m.zone} @ ${(t.start + m.x).toFixed(2)}`).join('  ') + `   (before the first frame: ${t.moods.filter((m) => m.x < -1).map((m) => m.mood).join(' → ') || '—'})`);
    console.log('  sounds issued (film s):');
    let line = '   ';
    for (const e of t.issued.filter((e) => e.x > -1.2).sort((a, b) => a.x - b.x)) { const w = ` ${e.name}${e.why ? `[${e.why}]` : ''}@${(t.start + e.x).toFixed(2)}`; if (line.length + w.length > 150) { console.log(line); line = '   '; } line += w; }
    console.log(line);
    console.log(`  against the game's own list from the film run: ${t.check.game} issued there, ${t.check.replay} here on the film's steps; only there: ${t.check.onlyGame.join(' ') || '—'}; only here: ${t.check.onlyReplay.join(' ') || '—'}${t.check.atCut.length ? `; piled there on the play's cut, not sounded here: ${t.check.atCut.length}` : ''}`);
    console.log('  sound against picture (the beat\'s first sound, ms after the first frame that shows it): ' + t.sync.map((y) => `${y.beat} f${y.frame} ${y.ms === null ? 'no sound' : (y.ms >= 0 ? '+' : '') + y.ms}`).join(' · '));
    // the take's level, a quarter second at a time (dBFS RMS), and what is issued inside the pause
    const q = []; for (let x = 0; x < t.dur; x += 0.25) q.push(Math.round(level(mix, SR, t.start + x, t.start + x + 0.25).rms));
    console.log('  level per 0.25 s (dBFS): ' + q.join(' '));
    const ld = o.lead * stepMs / 1000;
    const inPause = t.issued.filter((e) => t.marks.pause !== null && t.marks.cardOpen !== null && e.x >= t.marks.pause - ld - 0.001 && e.x < t.marks.cardOpen - ld - 0.001).map((e) => `${e.name}@${(t.start + e.x).toFixed(2)}`);
    console.log(`  issued inside the pause: ${inPause.join(' ') || 'nothing'}`);
  }
  console.log('\n  beat                                   film s          peak    mean (dBFS)');
  for (const b of beats) console.log(`  ${(b.take + ': ' + b.beat).padEnd(40)} ${b.from.toFixed(2).padStart(5)} – ${b.to.toFixed(2).padStart(5)}   ${String(b.peak).padStart(6)}  ${String(b.rms).padStart(6)}`);
  // ---- the show's mix gates (slice-1a PLAN §2.2 item 25; M1.md §2.13 (1)): on the levels above (one gain for the whole film, so
  // every comparison is the module's own) and the module's own output before that gain (the master's peak)
  const gates = [];
  const gate = (ok, msg, extra) => { gates.push({ ok: !!ok, msg, extra: extra ?? null }); };
  const ldS = o.lead * stepMs / 1000;
  for (const t of takes) {
    const pk = (label) => beats.find((b) => b.take === t.name && b.beat === label)?.peak ?? null;
    const P = pk('the present and the hold'), showBeats = [['the reveal', pk('the reveal (T0 → the lift)')], ['the lift', pk('the lift')]];
    const loud = showBeats.filter(([, v]) => v !== null && P !== null && v > P + 0.05);
    gate(P !== null && !loud.length, `${t.name}: the present is the loudest beat of its show (present ${P} dBFS; ${showBeats.map(([k, v]) => `${k} ${v}`).join(', ')})`);
    const card = [['the card opening', pk('the card (open → the count)')], ['the count', pk('the count')], ['the stamp and after', pk('the stamp and after')]];
    const over = card.filter(([, v]) => v !== null && P !== null && v > P + 0.05);
    gate(P !== null && !over.length, `${t.name}: no card sound above its show's present (${card.map(([k, v]) => `${k} ${v}`).join(', ')})`);
    const M = t.marks, at = (k) => (M[k] === null || M[k] === undefined ? null : t.start + M[k] - ldS);
    const open = at('cardOpen');
    if (open !== null) {
      const near = t.issued.filter((e) => t.start + e.x >= open - 0.001 && t.start + e.x <= open + 0.25);
      gate(!near.some((e) => /^rise_/.test(e.name)), `${t.name}: no hush rise on the card's first frame`, near.map((e) => e.name));
      gate(near.some((e) => e.name === 'ui_unfold') && !near.some((e) => e.name === 'ui_open'), `${t.name}: the card unfolds with its own sound (ui_unfold, not ui_open)`, near.map((e) => e.name));
    }
    const t0 = at('T0');
    if (t0 !== null && open !== null) {
      const trial = t.issued.filter((e) => /^(challenge_complete|unlock)$/.test(e.name) && t.start + e.x >= t0 && t.start + e.x < open);
      gate(!trial.length, `${t.name}: no trial chime inside the show (T0 → the card)`, trial.map((e) => e.name));
    }
    if (t.cls === 'small' && at('count') !== null) {
      // the cord's ticks over the bed: each tick's level (RMS, its first 25 ms) against the bed just before the count (100 ms)
      const c0 = at('count'), bed = level(mix, SR, c0 - 0.12, c0 - 0.02).rms;
      const ticks = t.issued.filter((e) => e.name === 'cord_tick').map((e) => level(mix, SR, t.start + e.x, t.start + e.x + 0.025).rms).sort((a, b) => a - b);
      const med = ticks.length ? ticks[Math.floor(ticks.length / 2)] : null;
      gate(med !== null && bed !== null && med - bed >= 6, `${t.name}: the cord's ticks stand ≥ 6 dB over the bed (median tick ${med} dBFS, bed ${bed} dBFS, ${ticks.length} ticks)`);
    }
  }
  gate(raw.peak <= -1.0, `the master's peak ≤ -1.0 dBFS (the module's own output: ${raw.peak} dBFS)`);
  console.log('\n  the show\'s mix gates (PLAN §2.2 item 25):');
  for (const g of gates) console.log(`  ${g.ok ? 'ok  ' : 'FAIL'}  ${g.msg}${!g.ok && g.extra ? ` :: ${JSON.stringify(g.extra)}` : ''}`);
  const summary = { log: showLogPath, sr: SR, seconds: +filmLen.toFixed(3), options: o, raw, gainDb: +gainDb.toFixed(2), level: out, takes, beats, env50ms: env, gates };
  // ---- the film with its sound
  if (args.film && args.mux) {
    const FF = '/usr/bin/ffmpeg', film = resolve(process.cwd(), String(args.film)), mux = resolve(process.cwd(), String(args.mux));
    mkdirSync(dirname(mux), { recursive: true });
    const probe = spawnSync('/usr/bin/ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=nb_frames,duration', '-of', 'csv=p=0', film], { encoding: 'utf8' }).stdout.trim();
    const vdur = Number(probe.split(',')[0]) || 0;
    if (Math.abs(vdur - filmLen) > 0.05) console.log(`  WARNING: the film is ${vdur} s, the sound log ${filmLen.toFixed(3)} s (another run's frames?)`);
    const fadeAt = Math.max(0, filmLen - 0.6).toFixed(3);
    execFileSync(FF, ['-y', '-loglevel', 'error', '-i', film, '-i', resolve(outDir, 'show.wav'), '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-af', `afade=t=out:st=${fadeAt}:d=0.6`, '-shortest', '-movflags', '+faststart', mux], { stdio: 'inherit' });
    const vd = spawnSync(FF, ['-hide_banner', '-i', mux, '-vn', '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
    const mean = Number(/mean_volume:\s*(-?[\d.]+) dB/.exec(vd)?.[1]), max = Number(/max_volume:\s*(-?[\d.]+) dB/.exec(vd)?.[1]);
    // the strip beside the film: the film's own sound (with its closing fade), the beats marked
    const strip = mux.replace(/\.mp4$/, '') + '-spectrogram.png', f0 = Math.round(Number(fadeAt) * SR);
    writeFileSync(strip, spectrogram(pcm.map((c) => c.map((v, i) => (i < f0 ? v : Math.round(v * Math.max(0, 1 - (i - f0) / (0.6 * SR)))))), SR, marksPng));
    const strip2 = mux.replace(/\.mp4$/, '') + '-spectrum-ffmpeg.png';
    spawnSync(FF, ['-y', '-loglevel', 'error', '-i', mux, '-lavfi', 'showspectrumpic=s=2440x480:legend=1:scale=log:fscale=log:color=intensity', strip2], { stdio: 'inherit' });
    summary.mux = { film, out: mux, videoSeconds: vdur, mean_volume: mean, max_volume: max, strip, strip2 };
    console.log(`\n${mux}\n  ffmpeg volumedetect: mean ${mean} dB, max ${max} dB  ${max < -1 ? 'ok (no clipping: max under -1 dB)' : 'FAIL (max not under -1 dB)'}  ${mean >= -26 && mean <= -18 ? 'ok (mean in -26 … -18 dB)' : 'NOTE (mean outside -26 … -18 dB)'}\n  ${strip}\n  ${strip2}`);
  }
  writeFileSync(resolve(outDir, 'show.json'), JSON.stringify(summary));
  console.log(`\nshow.wav, show.png, show.json → ${outDir}`);
  const failed = gates.filter((g) => !g.ok).length;
  console.log(failed ? `the show's mix: ${failed} of ${gates.length} gates FAILED` : `the show's mix: all ${gates.length} gates passed`);
  return failed ? 1 : 0;
}

// ------------------------------------------------------------------ run
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('pageerror', String(e)));
await page.goto(pathToFileURL(htmlPath).href);
await page.waitForFunction(() => window.ready === true);
if (showLog) { const code = await renderShow(); await browser.close(); process.exit(code); }
const only = args.only ? new Set(String(args.only).split(',')) : null;
const set = String(args.set || 'all');
const want = (n) => !only || only.has(n);
const jobs = [];
if (set === 'all' || set === 'af') {
  for (const b of BEATS) if (want(b.name)) jobs.push({ name: b.name, run: () => page.evaluate(([beat]) => window.renderBeat(beat, 'mossmere'), [b.beat]) });
  for (const c of SINGLES) if (want(c.name)) jobs.push({ name: c.name, run: () => page.evaluate(([n, o, d]) => window.renderOne(n, o, d), [c.sfx, c.opts, c.dur]) });
  for (const cls of PLAYS) for (const tier of [0, 4]) {
    const name = `play_${cls}_t${tier}`;
    if (want(name) || want(`play_${cls}`)) jobs.push({ name, play: true, run: () => page.evaluate(([c, t]) => window.renderPlay(c, t, 7), [cls, tier]) });
  }
}
if (set === 'all' || set === 'fe') {
  for (const c of SINGLES.filter((x) => /^(cove_|ember|flame|setout)/.test(x.name))) if (want(c.name) && set === 'fe') jobs.push({ name: c.name, run: () => page.evaluate(([n, o, d]) => window.renderOne(n, o, d), [c.sfx, c.opts, c.dur]) });
  for (const key of MURK) if (want(`murk_${key}`)) jobs.push({ name: `murk_${key}`, run: () => page.evaluate((k) => window.renderMurk(k), key) });
}
if (set === 'intro' || (set === 'all' && only && [...only].some((n) => n.startsWith('intro_')))) {
  if (want('intro_cue')) jobs.push({ name: 'intro_cue', play: true, run: () => page.evaluate(() => window.renderIntro('game', 0)) });
  if (want('intro_bus')) jobs.push({ name: 'intro_bus', play: true, limitDb: true, run: () => page.evaluate(() => window.renderIntro('raw', 0)) });
  for (const t of [3, 7.95, 16]) { const name = `intro_skip_${String(t).replace('.', '_')}`; if (want(name)) jobs.push({ name, play: true, skipAt: t, run: () => page.evaluate((x) => window.renderIntro('raw', x), t) }); }
}
// the Mossmere (M1 step 3a, PLAN T131): the bed's three lights, each place clear and through its bank, the roll, the lift, the press;
// exit 1 if the master's peak passes -1.0 dBFS in any
if (set === 'mossmere') {
  for (const [i, light] of ['day', 'dusk', 'night'].entries()) { const name = `bed_${light}`; if (want(name)) jobs.push({ name, moss: true, run: () => page.evaluate(([l, s]) => window.renderMossBed(l, 14, s), [light, 11 + i]) }); }
  for (const [i, [id, short]] of [['lily_maze', 'lily'], ['under_the_span', 'span'], ['buoy_lights', 'buoys'], ['bell_pool', 'bell']].entries()) {
    for (const muffled of [false, true]) {
      const name = `${short}_${muffled ? 'muffled' : 'clear'}`;
      if (want(name)) jobs.push({ name, moss: true, run: () => page.evaluate(([p, m, d, s]) => window.renderMossPlace(p, m, d, s), [id, muffled, id === 'bell_pool' ? 26 : 10, 21 + i]) });
    }
  }
  if (want('giant_roll')) jobs.push({ name: 'giant_roll', moss: true, run: () => page.evaluate(() => window.renderOne('giant_roll', { muffle: window.mossMuffle }, 3.6)) });
  if (want('mist_lift')) jobs.push({ name: 'mist_lift', moss: true, run: () => page.evaluate(() => window.renderOne('mist_lift', { dur: window.mossLiftDur }, window.mossLiftDur + 3)) });
  if (want('seal_press')) jobs.push({ name: 'seal_press', moss: true, run: () => page.evaluate(() => window.renderOne('seal_press', {}, 3.2)) });
}
const summary = [];
let over = 0;
const peakDb = await page.evaluate(() => window.introPeakDb);
for (const j of jobs) {
  const r = await j.run();
  const pcm = j.play ? r.pcm : r;
  const marks = j.play ? [...r.beats, ...r.events] : [];
  writeFileSync(resolve(outDir, `${j.name}.wav`), wav(pcm, SR));
  writeFileSync(resolve(outDir, `${j.name}.png`), spectrogram(pcm, SR, marks));
  let peak = 0; for (const c of pcm) for (const v of c) { const a = Math.abs(v) / 32767; if (a > peak) peak = a; }
  let ss = 0; for (const v of pcm[0]) ss += (v / 32767) ** 2;
  const rms = Math.sqrt(ss / pcm[0].length);
  summary.push({ name: j.name, sec: +(pcm[0].length / SR).toFixed(2), peak: +peak.toFixed(3), rms: +rms.toFixed(4), ...(j.play ? { beats: r.beats.map((b) => b.join('@')).join(' '), events: r.events.map((e) => e.join('@')).join(' ') } : {}) });
  console.log(`${j.name.padEnd(26)} ${String(summary.at(-1).sec).padStart(5)} s  peak ${summary.at(-1).peak.toFixed(3)}  rms ${summary.at(-1).rms.toFixed(4)}${j.play ? `\n    beats ${summary.at(-1).beats}\n    events ${summary.at(-1).events}` : ''}`);
  if (j.moss) {
    // the Mossmere's master gate (T131): every render's peak under -1.0 dBFS
    const dbfs = 20 * Math.log10(Math.max(1e-6, peak)), rmsDb = 20 * Math.log10(Math.max(1e-6, rms));
    summary.at(-1).peakDb = +dbfs.toFixed(2); summary.at(-1).rmsDb = +rmsDb.toFixed(1);
    console.log(`    peak ${dbfs.toFixed(1)} dBFS, rms ${rmsDb.toFixed(1)} dBFS${dbfs > -1.0 ? '   FAIL: over -1.0 dBFS' : ''}`);
    if (dbfs > -1.0) over++;
  }
  if (j.limitDb) {
    // the cue's own bus (A7): its peak against INTRO.sound.peakDb, never over -3 dBFS; and where in the film the peak falls
    const dbfs = 20 * Math.log10(Math.max(1e-6, peak));
    let at = 0, pk = 0; pcm[0].forEach((v, i) => { const a = Math.abs(v); if (a > pk) { pk = a; at = i; } });
    const secs = []; for (let s0 = 0; s0 < pcm[0].length; s0 += SR) { let m = 0; for (let i = s0; i < Math.min(pcm[0].length, s0 + SR); i++) m = Math.max(m, Math.abs(pcm[0][i]), Math.abs(pcm[1][i])); secs.push((20 * Math.log10(Math.max(1e-6, m / 32767))).toFixed(0)); }
    console.log(`    the cue's bus peaks at ${dbfs.toFixed(1)} dBFS (${(at / SR).toFixed(2)} s); target ${peakDb} dBFS, limit -3 dBFS\n    peak per second (dBFS): ${secs.join(' ')}`);
    summary.at(-1).peakDb = +dbfs.toFixed(2);
    if (dbfs > -3) { over++; console.log('    FAIL: over -3 dBFS'); }
  }
  if (j.skipAt) {
    // a skip (A7): the bus is silent 0.3 s after it, and the fade is a ramp (no step larger than the wave's own slope allows)
    const i0 = Math.round((0.05 + j.skipAt) * SR), i1 = Math.round((0.05 + j.skipAt + 0.3) * SR);
    let tail = 0; for (let i = i1; i < pcm[0].length; i++) tail = Math.max(tail, Math.abs(pcm[0][i]), Math.abs(pcm[1][i]));
    let step = 0; for (let i = Math.max(1, i0 - 64); i < Math.min(pcm[0].length, i1 + 64); i++) step = Math.max(step, Math.abs(pcm[0][i] - pcm[0][i - 1]));
    let before = 0; for (let i = Math.max(1, i0 - SR); i < i0; i++) before = Math.max(before, Math.abs(pcm[0][i] - pcm[0][i - 1]));
    console.log(`    skip at ${j.skipAt} s: residue after 0.3 s ${(tail / 32767).toFixed(5)}; largest sample step in the fade ${(step / 32767).toFixed(4)} (in the second before it ${(before / 32767).toFixed(4)})`);
    summary.at(-1).skip = { tail: +(tail / 32767).toFixed(5), step: +(step / 32767).toFixed(4), before: +(before / 32767).toFixed(4) };
    if (tail / 32767 > 0.002) { over++; console.log('    FAIL: the cue still sounds 0.3 s after the skip'); }
    if (step > before * 1.5 + 40) { over++; console.log('    FAIL: a click in the fade'); }
  }
}
writeFileSync(resolve(outDir, 'summary.json'), JSON.stringify(summary, null, 1));
await browser.close();
console.log(`\n${jobs.length} renders → ${outDir}`);
if (over) process.exit(1);
