// Offline renders of GLOOMWATER's synthesised sounds, to look at (spectrograms) and listen to (WAV) without playing the game.
//
//   node tools/audio-render.mjs [--out=tools/out/audio-render] [--only=name,name] [--set=af|fe|all] [--sr=32000]
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
import * as esbuild from 'esbuild';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v === undefined ? true : v]; }));
const outDir = resolve(root, String(args.out || 'tools/out/audio-render'));
mkdirSync(outDir, { recursive: true });
const SR = Number(args.sr || 32000);

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
window.ready = true;
`;
const bundle = await esbuild.build({ stdin: { contents: entry, resolveDir: root, loader: 'js' }, bundle: true, format: 'iife', write: false, logLevel: 'silent' });
const html = `<!doctype html><meta charset="utf-8"><body><script>${bundle.outputFiles[0].text}</script>`;
const htmlPath = resolve(outDir, 'render.html');
writeFileSync(htmlPath, html);

import { wav, spectrogram } from './audio-spectro.mjs';

// ------------------------------------------------------------------ run
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('pageerror', String(e)));
await page.goto(pathToFileURL(htmlPath).href);
await page.waitForFunction(() => window.ready === true);
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
const summary = [];
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
}
writeFileSync(resolve(outDir, 'summary.json'), JSON.stringify(summary, null, 1));
await browser.close();
console.log(`\n${jobs.length} renders → ${outDir}`);
