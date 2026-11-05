// audio.js — GLOOMWATER procedural WebAudio: generative score + synthesised SFX.
// CONTRACT §7 audio: unlock(); play(name, {volume, pitch, pan}); setMood(mood); applySettings().
//
// Graph:  music layers ─┬─ dry → muffle(LPF) → musicVol ─┐
//                       ├─ wet → musicWetVol ──→ Convolver (3.5 s cavern IR) → verbReturn ─┤
//                       └─ dly → musicDlyVol ──→ Delay ⟲ feedback(LP/HP) → delayReturn ───┤
//         sfx voices ───┬─ dry → sfxVol ────────────────────────────────────────────────┤
//                       ├─ wet → sfxWetVol → Convolver                                   │
//                       └─ dly → sfxDlyVol → Delay                                       ▼
//                                                     master → DynamicsCompressor → Analyser → destination
// Nothing is created before unlock() (first user gesture); every API is a safe no-op until then.
// The context suspends while the tab is hidden and resumes when visible (and on any later gesture).
//
// Moods are auto-picked every ~0.5 s (audio clock) from ctx.flow, survival.getPhaseInfo(),
// fishing.state and a boss in combat.enemies; the zone colour comes from run.zone (title: deepest zone).
// setMood(mood, {zone, fade, lock}) forces a mood until the auto-picked mood next changes ('auto' clears;
// lock:true keeps it). Continuous layers: water bed + paddle strokes (player.speed), reel ratchet / drag
// scream / line-strain whine (fishing.view), cast-charge creak + clean-cast ping, last-Ember heartbeat,
// lantern-aura crackle loop scaled by shades inside survival.lightRadius.
// Extras: getMood(), isUnlocked(), duck(amount, s), names, extraNames, moods, rms(), note(midi).
// Debug: ctx.debug.audio() → {state, mood, zone, voices, musicVoices, layers, rms, played, last, loops, …};
// ctx.debug.audioMood(m); ctx.debug.audioParams({intensity, tension, danger, legend, solo}|null);
// ctx.debug.audioRecord(seconds) → Promise<{sampleRate, channels, b64}> (post-compressor capture);
// ctx.debug.audioLog(n) → the last n sounds issued [{name, at, t, pan, why}] (at = audio time issued, t = scheduled start).
//
// v3 (DESIGN §25.14.2 Au1, CONTRACT §13.7 audio), reached only by v3 events / payload fields (audio-v3.js holds the rules):
//   fishing:tell {biteTell, lead}  → the class bite tell (bite_doublepop / _plunge / _dragunder / _flat / _dome) on the
//                                   float, timed to the tell's float animation on the game clock; the "!" (fishing:bite)
//                                   then rings only the alert. A bite with a biteTell but no tell event voices it at once.
//   sign:spawn {kind:'rise', sizeClass, x, z} (and a per-ring sign:rise, deduped by id) → rise_plip (Small, Keeper) or
//                                   rise_gulp (Prize+), placed on the ring.
//   fishing.view.measure.phase 'cord' → the knotted cord: knot ticks (cord_tick, rising an octave) and a class_chime as
//                                   the count passes each Prize / Trophy / Elder threshold of that species.
//   fish:measured                 → seal_stamp (ink stamp / oxblood wax / black wax and ribbon; an Ancient's gold thread)
//                                   at the stamp, silencing any knot still due; Murk's far bell for an Old Ledger record.
//                                   Without a ceremony on screen the cord runs compressed first, then the stamp.
//   phase:change gloomtide (v3 run) → night_rise (the Night Rise motif) in every mode; Gloomtide keeps gloom_rise first.
//   swarm:window open / close     → gloom_rise when a Lantern swarm comes; night_rise again when its window closes.
//   a Stillnight (any quiet night: Still, Lantern's quiet nights and tail, a lamp-watch) plays the `stillnight` mood
//                                   and the Stillnight bed (night air + stillnight_bed breaths) instead of the gloom mood.
import { createEngine, clamp, lerp, mtof } from './audio-dsp.js';
import { createMusic, ZONE_MUSIC } from './audio-music.js';
import { SFX, CONTRACT_SFX, V3_SFX } from './audio-sfx.js';
import * as V3 from './audio-v3.js';

const ZONE_KEYS = Object.keys(ZONE_MUSIC);
const PENTA = [0, 2, 4, 7, 9];
const TAGS = Object.fromEntries(Object.keys(SFX).map((k) => [k, 's:' + k]));
const EMPTY = Object.freeze({});
const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const curve = (v) => Math.pow(clamp(num(v, 0.8), 0, 1), 1.6);
const MUSIC_LEVEL = 0.9;
const MOODS = ['title', 'calm', 'dusk', 'gloom', 'reel', 'boss', 'death', 'victory'];
const V3_MOODS = ['stillnight'];
const ALL_MOODS = [...MOODS, ...V3_MOODS];
const LOG_MAX = 240;
const SFX_LEVEL = 0.85;

export function create(ctx) {
  let ac = null, eng = null, music = null, N = null;
  let unlocked = false, timer = null, errCount = 0;
  const lastPlay = Object.create(null);
  const set = { master: -1, music: -1, sfx: -1 };
  const raw = { master: undefined, music: undefined, sfx: undefined };
  let musicGainApplied = -1, muffleApplied = -1;
  let duckUntil = 0, duckAmt = 1;

  // mood state
  let lastAt = 0, played = 0, lastName = null;
  let forcedZone = null;
  let moodTimer = 0, forced = null, forcedAuto = null, forcedLock = false, leaveReelT = 0, victoryHold = 0;
  // continuous layers state
  let tickAcc = 0, hbTimer = 0, paddleTimer = 0, paddleSide = 1, auraTimer = 0, auraTarget = 0, auraPulse = 0, auraIdle = 0;
  let lastProgress = 0, wasDanger = false, wasSurgeWarn = false, wasClean = false, statsT = 99, statsCache = null, fishIdle = 0;
  let strain = null, charge = null, aura = null, water = null;
  const scratch = { volume: 1, pitch: 1, pan: 0, delay: 0, crit: false, big: false, elite: false, perfect: false, dying: false, force: false, rarity: undefined, power: undefined, anchored: undefined, resource: undefined,
    cls: undefined, seal: undefined, ancient: false, root: undefined, alertOnly: false, why: undefined };
  let inPointer = false, zapFrame = -1;
  let rmsBuf = null;
  let override = null;          // debug: force score params, e.g. {intensity: 0.8, tension: 0.6}
  let xpCombo = 0, xpLast = -9;
  const log = [];               // the last LOG_MAX sounds issued (debug.audioLog)
  // v3 (Au1)
  const night = { day: -1, windowOpen: false, windowClosed: false };   // tonight's swarm window, from swarm:window
  let tell = null;              // {name, at (game s), played}: the class bite tell of the bite in progress
  let catchInfo = null;         // the v3 fishing:caught payload (the Fish's final length for the cord)
  let cord = null;              // {voices: [handle], end, key}: the knot ticks and chimes scheduled for this measuring
  let measurePhase = null, stampAt = -9;
  let bed = null, bedTimer = 0.6, bedIdle = 0;
  const signHeard = new Map();  // sign id → audio time of its last rise sound

  function report(where, e) {
    if (errCount++ > 6) return;
    try { console.warn(`[audio] ${where}:`, e); } catch { /* ignore */ }
  }

  // ---------------------------------------------------------------- graph
  function buildGraph() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try { ac = new AC({ latencyHint: 'interactive' }); } catch { try { ac = new AC(); } catch { ac = null; return false; } }
    eng = createEngine(ac, { mobile: !!ctx.isMobile });
    const g = (v = 1) => { const n = ac.createGain(); n.gain.value = v; return n; };
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.25;
    const analyser = ac.createAnalyser(); analyser.fftSize = 1024; analyser.smoothingTimeConstant = 0.5;
    const master = g(0);
    const hpf = ac.createBiquadFilter(); hpf.type = 'highpass'; hpf.frequency.value = 32; hpf.Q.value = 0.7;
    master.connect(hpf); hpf.connect(comp); comp.connect(analyser); analyser.connect(ac.destination);

    const conv = ac.createConvolver();
    conv.buffer = eng.impulse(ctx.isMobile ? 2.4 : 3.5);
    const verbReturn = g(0.85); conv.connect(verbReturn); verbReturn.connect(master);

    const delay = ac.createDelay(2); delay.delayTime.value = 0.43;
    const fb = g(0.36);
    const dlp = ac.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 2400;
    const dhp = ac.createBiquadFilter(); dhp.type = 'highpass'; dhp.frequency.value = 260;
    delay.connect(dlp); dlp.connect(dhp); dhp.connect(fb); fb.connect(delay);
    const dReturn = g(0.5); dhp.connect(dReturn); dReturn.connect(master);
    const dVerb = g(0.3); dhp.connect(dVerb); dVerb.connect(conv);

    const musicDry = g(1), musicWet = g(1), musicDly = g(1);
    const muffle = ac.createBiquadFilter(); muffle.type = 'lowpass'; muffle.frequency.value = 18000; muffle.Q.value = 0.5;
    const musicVol = g(0), musicWetVol = g(0), musicDlyVol = g(0);
    const lowShelf = ac.createBiquadFilter(); lowShelf.type = 'lowshelf'; lowShelf.frequency.value = 170; lowShelf.gain.value = -5;
    const air = ac.createBiquadFilter(); air.type = 'highshelf'; air.frequency.value = 4500; air.gain.value = 3;
    musicDry.connect(lowShelf); lowShelf.connect(air); air.connect(muffle); muffle.connect(musicVol); musicVol.connect(master);
    musicWet.connect(musicWetVol); musicWetVol.connect(conv);
    musicDly.connect(musicDlyVol); musicDlyVol.connect(delay);

    const sfxDry = g(1), sfxWet = g(1), sfxDly = g(1);
    const sfxVol = g(0), sfxWetVol = g(0), sfxDlyVol = g(0);
    sfxDry.connect(sfxVol); sfxVol.connect(master);
    sfxWet.connect(sfxWetVol); sfxWetVol.connect(conv);
    sfxDly.connect(sfxDlyVol); sfxDlyVol.connect(delay);

    N = { master, comp, analyser, conv, delay, muffle, musicDry, musicWet, musicDly, musicVol, musicWetVol, musicDlyVol, sfxDry, sfxWet, sfxDly, sfxVol, sfxWetVol, sfxDlyVol };
    music = createMusic(eng, { dry: musicDry, wet: musicWet, dly: musicDly, onError: (e) => report('music', e) });
    rmsBuf = new Float32Array(analyser.fftSize);
    return true;
  }

  // ---------------------------------------------------------------- settings
  function readSettings() {
    const s = ctx.state?.meta?.settings || EMPTY;
    return { master: clamp(num(s.master, 0.8), 0, 1), music: clamp(num(s.music, 0.6), 0, 1), sfx: clamp(num(s.sfx, 0.9), 0, 1) };
  }
  function applySettings() {
    const ms = ctx.state?.meta?.settings;
    raw.master = ms?.master; raw.music = ms?.music; raw.sfx = ms?.sfx;
    const s = readSettings();
    set.master = s.master; set.music = s.music; set.sfx = s.sfx;
    if (!ac || !N) return;
    const now = ac.currentTime;
    N.master.gain.setTargetAtTime(curve(s.master), now, 0.05);
    const sv = curve(s.sfx) * SFX_LEVEL;
    N.sfxVol.gain.setTargetAtTime(sv, now, 0.05);
    N.sfxWetVol.gain.setTargetAtTime(sv, now, 0.05);
    N.sfxDlyVol.gain.setTargetAtTime(sv, now, 0.05);
    musicGainApplied = -1;
  }
  function pollSettings() {
    const s = ctx.state?.meta?.settings;
    if (!s) return;
    if (s.master !== raw.master || s.music !== raw.music || s.sfx !== raw.sfx) applySettings();
  }
  function duck(amount = 0.5, seconds = 1) {
    if (!ac) return;
    const now = ac.currentTime, a = clamp(num(amount, 0.5), 0.05, 1);
    duckAmt = now < duckUntil ? Math.min(duckAmt, a) : a;
    duckUntil = Math.max(duckUntil, now + Math.max(0.05, num(seconds, 1)));
  }
  function busGains() {
    const now = ac.currentTime;
    if (now >= duckUntil) duckAmt = 1;
    const pausedish = ctx.flow === 'playing' && music.mood !== 'victory' && (ctx.paused === true || isBlocking());
    const want = curve(set.music) * MUSIC_LEVEL * (pausedish ? 0.6 : 1) * duckAmt;
    if (Math.abs(want - musicGainApplied) > 0.001) {
      const tc = want < musicGainApplied ? 0.06 : 0.5;
      N.musicVol.gain.setTargetAtTime(want, now, tc);
      N.musicWetVol.gain.setTargetAtTime(want, now, tc);
      N.musicDlyVol.gain.setTargetAtTime(want * (pausedish ? 0.5 : 1), now, tc);
      musicGainApplied = want;
    }
    const mf = pausedish ? 1100 : Math.min(18000, ac.sampleRate * 0.45);
    if (mf !== muffleApplied) { N.muffle.frequency.setTargetAtTime(mf, now, pausedish ? 0.12 : 0.35); muffleApplied = mf; }
  }
  function isBlocking() {
    try { const b = ctx.ui?.isBlocking?.(); return b === true; } catch { return false; }
  }

  // ---------------------------------------------------------------- play
  function play(name, opts) { return !!playV(name, opts); }
  /** play() that hands back {out, at, name}: out is the voice's level, so a scheduled sound can be silenced (silence()). */
  function playV(name, opts) {
    if (!ac || !unlocked || !N || ac.state === 'closed') return null;
    const def = SFX[name];
    if (!def) return null;
    const o = opts || EMPTY;
    const now = ac.currentTime;
    const last = lastPlay[name];
    if (last !== undefined && now - last < (def.gap || 0) && !o.force) return null;
    const tag = TAGS[name];
    if ((eng.tags[tag] || 0) >= (def.max || 4)) return null;
    const pri = def.pri ?? 1;
    const sfxVoices = eng.active - (eng.tags.m || 0);
    if (sfxVoices >= (pri >= 3 ? 110 : pri === 2 ? 72 : pri === 1 ? 48 : 34)) return null;
    lastPlay[name] = now;
    const vol = clamp(num(o.volume, 1), 0, 2) * (def.gain ?? 1) * (1 + (Math.random() * 2 - 1) * (def.vj ?? 0.1));
    const pitch = clamp(num(o.pitch, 1), 0.25, 4) * (1 + (Math.random() * 2 - 1) * (def.pj ?? 0.04));
    if (vol <= 0.0005) return null;
    const t = now + 0.005 + Math.max(0, num(o.delay, 0));
    const v = eng.voice(tag);
    let out = null;
    try {
      out = v.gain(vol);
      let head = out;
      const pan = clamp(num(o.pan, 0), -1, 1);
      if (pan && ac.createStereoPanner) { const pn = v.n(ac.createStereoPanner()); pn.pan.value = pan; out.connect(pn); head = pn; }
      head.connect(N.sfxDry);
      if (def.wet) { const w = v.gain(def.wet); head.connect(w); w.connect(N.sfxWet); }
      if (def.dly) { const d = v.gain(def.dly); head.connect(d); d.connect(N.sfxDly); }
      def.fn(v, out, t, pitch, o, eng);
    } catch (e) { report('sfx ' + name, e); }
    v.done();
    played++; lastName = name;
    log.push({ name, at: Math.round(now * 1000) / 1000, t: Math.round(t * 1000) / 1000, pan: Math.round(num(o.pan, 0) * 100) / 100, why: o.why ?? o.cls ?? o.seal ?? undefined });
    if (log.length > LOG_MAX) log.splice(0, log.length - LOG_MAX);
    if (def.duck) duck(def.duck[0], def.duck[1]);
    return { out, at: t, name };
  }
  /** Silence a sound handed back by playV: only one still to start (future), or any (a short fade). */
  function silence(h, futureOnly = true) {
    if (!h || !h.out || !ac) return false;
    const now = ac.currentTime;
    if (futureOnly && h.at <= now) return false;
    try { h.out.gain.cancelScheduledValues(now); h.out.gain.setValueAtTime(h.out.gain.value, now); h.out.gain.linearRampToValueAtTime(0, now + 0.03); } catch { return false; }
    return true;
  }

  // ---------------------------------------------------------------- helpers
  function camYaw() { try { const y = ctx.render?.getYaw?.(); return num(y, 0); } catch { return 0; } }
  /** pan & distance gain for a world position (camera-relative). Writes o.pan, returns gain. */
  function spatial(pos, o) {
    const p = ctx.player?.position;
    o.pan = 0;
    if (!pos || !p || typeof pos.x !== 'number' || typeof p.x !== 'number') return 1;
    const yaw = camYaw();
    const dx = pos.x - p.x, dz = (num(pos.z) - num(p.z));
    const rx = dx * Math.cos(yaw) - dz * Math.sin(yaw);
    o.pan = clamp(rx / 16, -0.85, 0.85);
    const dist = Math.sqrt(dx * dx + dz * dz);
    return clamp(1.15 - dist / 42, 0.18, 1);
  }
  function resetScratch() {
    const s = scratch;
    s.volume = 1; s.pitch = 1; s.pan = 0; s.delay = 0; s.crit = false; s.big = false; s.elite = false; s.perfect = false;
    s.dying = false; s.force = false; s.rarity = undefined; s.power = undefined; s.anchored = undefined; s.resource = undefined;
    s.cls = undefined; s.seal = undefined; s.ancient = false; s.root = undefined; s.alertOnly = false; s.why = undefined;
    return s;
  }
  function phaseInfo() {
    try { const pi = ctx.survival?.getPhaseInfo?.(); if (pi && typeof pi.phase === 'string') return pi; } catch { /* stub */ }
    return null;
  }
  function phaseName() { return phaseInfo()?.phase || (typeof ctx.state?.run?.phase === 'string' ? ctx.state.run.phase : 'calm'); }
  function enemyList() { const e = ctx.combat?.enemies; return Array.isArray(e) ? e : null; }
  function bossPresent() {
    const es = enemyList(); if (!es) return false;
    for (let i = 0; i < es.length; i++) { const e = es[i]; if (e && e.boss && (e.hp === undefined || e.hp > 0)) return true; }
    return false;
  }
  function fishState() { const s = ctx.fishing?.state; return typeof s === 'string' ? s : 'idle'; }
  function fishView() { const v = ctx.fishing?.view; return v && typeof v === 'object' && !v.isStub ? v : null; }
  function zoneId() {
    const zones = ctx.data?.ZONES;
    const run = ctx.state?.run;
    let id = run && typeof run.zone === 'string' ? run.zone : null;
    if (!id) { const idx = num(ctx.state?.meta?.deepestZone, 0) | 0; id = Array.isArray(zones) ? zones[clamp(idx, 0, zones.length - 1)]?.id : null; }
    if (id && ZONE_MUSIC[id]) return id;
    if (id && Array.isArray(zones)) { const z = zones.find((zz) => zz.id === id); if (z && ZONE_KEYS[z.index]) return ZONE_KEYS[z.index]; }
    return 'mossmere';
  }
  function stats() {
    if (statsT > 1 || !statsCache) {
      statsT = 0;
      try { const s = ctx.progression?.getStats?.(); if (s && typeof s === 'object' && !s.isStub) statsCache = s; } catch { /* ignore */ }
    }
    return statsCache;
  }

  // ---------------------------------------------------------------- moods
  function autoMood() {
    const flow = ctx.flow;
    if (flow === 'dead') return 'death';
    const run = ctx.state?.run;
    if (flow !== 'playing' || !run) return 'title';
    if (victoryHold > 0) return 'victory';
    if (bossPresent()) return 'boss';
    const fs = fishState();
    if (fs === 'reeling' || fs === 'landing') return 'reel';
    const ph = phaseName();
    if (ph === 'gloomtide') return nightMoodNow();
    if (ph === 'dusk') return 'dusk';
    return 'calm';
  }
  function pickMood(dt) {
    if (!music) return;
    const auto = autoMood();
    if (forced && !forcedLock && auto !== forcedAuto) { forced = null; forcedZone = null; }
    let mood = forced || auto;
    // hysteresis: leaving the reel waits ~1 s so quick state blips don't flap the score
    if (!forced && music.mood === 'reel' && mood !== 'reel' && mood !== 'death' && mood !== 'boss') {
      leaveReelT += dt;
      if (leaveReelT < 1.0) mood = 'reel';
    } else leaveReelT = 0;
    music.setMood(mood, (forced && forcedZone) || zoneId());
  }
  function setMood(mood, opts = {}) {
    if (mood && mood !== 'auto' && !ALL_MOODS.includes(mood)) return forced || 'auto';
    if (!mood || mood === 'auto') { forced = null; forcedZone = null; forcedLock = false; }
    else {
      forced = String(mood); forcedLock = !!opts?.lock; forcedAuto = autoMood();
      forcedZone = opts?.zone && ZONE_MUSIC[opts.zone] ? opts.zone : null;
    }
    if (music && unlocked) {
      const m = forced || autoMood();
      music.setMood(m, (forced && forcedZone) || zoneId(), opts?.fade !== undefined ? { fade: opts.fade } : {});
    }
    return forced || 'auto';
  }

  // ---------------------------------------------------------------- v3 night (DESIGN §25.5): Stillnight vs the gloom mood
  const real = (m) => !!m && !m.isStub;
  /** The run's night mode, or null for a v1 run (no BALANCE.nightModes, or The Long Descent). */
  function nightMode(eventMode) {
    const nightModes = ctx.data?.BALANCE?.nightModes;
    if (!nightModes) return null;
    let combatMode, survivalMode;
    try { if (real(ctx.combat)) combatMode = ctx.combat.nightMode; } catch { combatMode = undefined; }
    try { if (real(ctx.survival)) survivalMode = ctx.survival.nightMode; } catch { survivalMode = undefined; }
    return V3.nightModeFrom({ eventMode, combatMode, survivalMode, run: ctx.state?.run, nightModes });
  }
  /** combat.swarmActive (a window open, a Gloomtide night, any gloomling up), or null when combat predates it. */
  function swarmActiveNow() {
    if (!real(ctx.combat)) return null;
    try { const v = ctx.combat.swarmActive; return typeof v === 'boolean' ? v : null; } catch { return null; }
  }
  /** Tonight's swarm: survival's phase info (minus a lamp-watch or a Scorched), else data's swarmTonight for the run. */
  function swarmTonightNow(mode) {
    const pi = phaseInfo();
    if (typeof pi?.swarm === 'boolean') return pi.swarm;
    const run = ctx.state?.run;
    try {
      const f = ctx.data?.swarmTonight;
      if (typeof f === 'function' && run) return f(mode, Math.max(1, run.day | 0), run.outing || 'normal') === true && !run.scorched && !run.lampWatch;
    } catch { /* fall through */ }
    return null;
  }
  function syncNight() {
    const d = ctx.state?.run?.day ?? -1;
    if (night.day !== d) { night.day = d; night.windowOpen = false; night.windowClosed = false; }
  }
  /** The night's score: 'gloom' (v1, Gloomtide, a swarm out or due) or 'stillnight' (a quiet night). */
  function nightMoodNow() {
    const mode = nightMode();
    if (!mode) return 'gloom';
    syncNight();
    return V3.nightMood({ mode, swarmActive: swarmActiveNow(), swarmTonight: swarmTonightNow(mode), windowOpen: night.windowOpen, windowClosed: night.windowClosed });
  }
  function zoneRoot() { return ZONE_MUSIC[zoneId()]?.root ?? 50; }

  // ---------------------------------------------------------------- v3 fishing: bite tells, the cord and the seal
  function gameT() { return num(ctx.time?.gameT, ac ? ac.currentTime : 0); }
  function playTell(name, why) {
    resetScratch(); scratch.pan = bobberPan(); scratch.why = why; scratch.force = true;
    return playV(name, scratch);
  }
  /** The bite tell due on the game clock (fishing's own clock), voiced when its float animation starts. */
  function tellTick() {
    if (!tell) return;
    const fs = fishState();
    if (fs !== 'waiting' && fs !== 'bite') { dropTell(); return; }
    if (!tell.played && gameT() >= tell.at) { tell.played = true; tell.h = playTell(tell.name, tell.why); }
  }
  /** The bite never came (an early tap spooked it, the line was pulled in): a tell still due stays silent, one under way fades. */
  function dropTell() {
    if (tell?.h) silence(tell.h, false);
    tell = null;
  }
  function cancelCord() {
    if (!cord) return;
    for (const h of cord.voices) silence(h, true);
    cord = null;
  }
  /**
   * Schedule one measuring cord from now (+ t0): a knot tick per step of the count and a class chime at each threshold
   * the fish passes (audio-v3 cordPlan). info = {speciesId, sizeClass, length (cm), zone, key}. Returns the plan.
   */
  function startCord(info, dur, t0 = 0) {
    cancelCord();
    const data = ctx.data;
    const sp = data?.SPECIES_BY_ID?.[info.speciesId] || null;
    const chimes = sp?.rarity === 'legendary' ? [] : V3.chimeClasses(info.sizeClass, data);
    const plan = V3.cordPlan({ length: info.length, dur, chimes, thresholds: V3.cordThresholds(data, sp, info.zone ?? null) });
    const voices = [];
    const n = plan.ticks.length;
    for (const tk of plan.ticks) {
      resetScratch(); scratch.delay = t0 + tk.t; scratch.pitch = tk.pitch; scratch.volume = 0.8 + 0.2 * (tk.i / n); scratch.force = true;
      const h = playV('cord_tick', scratch); if (h) voices.push(h);
    }
    for (const ch of plan.chimes) {
      resetScratch(); scratch.delay = t0 + ch.t; scratch.cls = ch.cls; scratch.force = true;
      const h = playV('class_chime', scratch); if (h) voices.push(h);
    }
    cord = { voices, key: info.key ?? null, start: ac.currentTime + t0, end: ac.currentTime + t0 + plan.dur, ticks: n, chimes: plan.chimes.map((c) => c.cls) };
    return plan;
  }
  /** fishing.view.measure: the cord beat of the ceremony starts the knot ticks (CONTRACT §13.7 fishing view.measure). */
  function measureTick() {
    const m = fishView()?.measure;
    const ph = m && typeof m === 'object' && typeof m.phase === 'string' ? m.phase : null;
    if (ph === measurePhase) return;
    measurePhase = ph;
    if (ph === 'cord') {
      const ci = catchInfo && ac.currentTime - catchInfo.at < 30 ? catchInfo : null;
      const sizeClass = typeof m.sizeClass === 'string' ? m.sizeClass : ci?.sizeClass;
      const length = num(ci?.length, num(m.length, 0));
      if (!sizeClass || !(length > 0)) return;
      const speciesId = ci?.speciesId ?? fishView()?.speciesId ?? null;
      const dur = num(m.cordDur, num(m.dur, V3.cordDuration(ctx.data, sizeClass, { short: swarmActiveNow() === true })));
      startCord({ speciesId, sizeClass, length, zone: ci?.zone ?? ctx.state?.run?.zone ?? null, key: ci?.key ?? null }, dur);
    } else if (ph === null && cord && ac.currentTime < cord.end) cancelCord();   // the ceremony ended early
  }
  function riseSound(p) {
    const now = ac.currentTime;
    if (p.id !== undefined && p.id !== null) {
      const last = signHeard.get(p.id);
      if (last !== undefined && now - last < 0.5) return;
      signHeard.set(p.id, now);
      if (signHeard.size > 32) signHeard.delete(signHeard.keys().next().value);
    }
    const pos = { x: num(p.x, num(p.position?.x, NaN)), z: num(p.z, num(p.position?.z, NaN)) };
    const rp = V3.riseParams(p.sizeClass);
    resetScratch();
    const g = Number.isFinite(pos.x) && Number.isFinite(pos.z) ? spatial(pos, scratch) : 1;
    scratch.volume = rp.volume * g; scratch.pitch = rp.pitch; scratch.why = p.sizeClass || null;
    play(V3.riseSfx(p.sizeClass), scratch);
  }
  function v3Tick() {
    tellTick();
    measureTick();
  }

  // ---------------------------------------------------------------- continuous layers
  function makeOscLoop(type, f, ft, ff, q, dest) {
    const t = ac.currentTime;
    const o = ac.createOscillator(); o.type = type; o.frequency.value = f;
    const flt = ac.createBiquadFilter(); flt.type = ft; flt.frequency.value = ff; flt.Q.value = q;
    const g = ac.createGain(); g.gain.value = 0;
    const lfo = ac.createOscillator(); lfo.frequency.value = 7.5;
    const lg = ac.createGain(); lg.gain.value = 0;
    lfo.connect(lg); lg.connect(o.frequency);
    o.connect(flt); flt.connect(g); g.connect(dest);
    o.start(t); lfo.start(t);
    return { o, flt, g, lfo, lg, dead: false, idle: 0 };
  }
  function makeNoiseLoop(kind, ft, ff, q, dest) {
    const t = ac.currentTime;
    const s = ac.createBufferSource(); s.buffer = eng.buf(kind); s.loop = true;
    const flt = ac.createBiquadFilter(); flt.type = ft; flt.frequency.value = ff; flt.Q.value = q;
    const g = ac.createGain(); g.gain.value = 0;
    s.connect(flt); flt.connect(g); g.connect(dest);
    s.start(t, Math.random() * 1.5);
    return { s, flt, g, dead: false, idle: 0 };
  }
  /** setTargetAtTime only when the target moved (avoids flooding the automation timeline every frame). */
  function setT(l, key, param, value, tc, eps = 0.002) {
    const k = '_' + key;
    if (l[k] !== undefined && Math.abs(l[k] - value) <= eps * Math.max(1, Math.abs(value))) return;
    l[k] = value;
    param.setTargetAtTime(value, ac.currentTime, tc);
  }
  function killLoop(l) {
    if (!l || l.dead) return null;
    l.dead = true;
    const now = ac.currentTime;
    try { l.g.gain.cancelScheduledValues(now); l.g.gain.setTargetAtTime(0, now, 0.05); } catch { /* ignore */ }
    const stopAt = now + 0.35;
    for (const k of ['o', 'lfo', 's']) { try { l[k]?.stop(stopAt); } catch { /* ignore */ } }
    const src = l.o || l.s;
    if (src) src.onended = () => { for (const k of ['o', 'flt', 'g', 'lfo', 'lg', 's', 'hp', 'hg']) { try { l[k]?.disconnect(); } catch { /* ignore */ } } };
    return null;
  }
  function stopContinuous() {
    strain = killLoop(strain); charge = killLoop(charge); aura = killLoop(aura); bed = killLoop(bed);
    tickAcc = 0; auraTarget = 0; auraPulse = 0; wasDanger = false; wasSurgeWarn = false; wasClean = false;
  }

  function continuous(dt) {
    const now = ac.currentTime;
    const flow = ctx.flow;
    const run = ctx.state?.run;
    const live = flow === 'playing' && !!run && ctx.paused !== true && num(ctx.time?.gameDt) > 0;
    statsT += dt;
    const st = stats();

    // --- water bed under the raft (always some lapping; louder when sailing)
    const sp = live ? num(ctx.player?.speed) : 0;
    const maxSp = Math.max(1, num(st?.moveSpeed, 6));
    const spFrac = clamp(sp / maxSp, 0, 1.2);
    if (!water && (flow === 'playing' || flow === 'title')) {
      water = makeNoiseLoop('pink', 'bandpass', 620, 0.9, N.sfxDry);
      water.lfo = ac.createOscillator(); water.lfo.frequency.value = 0.13;
      water.lg = ac.createGain(); water.lg.gain.value = 240;
      water.lfo.connect(water.lg); water.lg.connect(water.flt.frequency); water.lfo.start();
    }
    if (water) {
      const tgt = (flow === 'playing' || flow === 'title') ? 0.022 + 0.09 * Math.min(1, spFrac) : 0.0;
      setT(water, 'g', water.g.gain, tgt, 0.4);
      setT(water, 'f', water.flt.frequency, 560 + 600 * Math.min(1, spFrac), 0.3, 0.01);
    }

    // --- paddle splashes when sailing fast
    const anchored = ctx.player?.anchored === true;
    if (live && spFrac > 0.45 && !anchored) {
      paddleTimer -= dt;
      if (paddleTimer <= 0) {
        resetScratch(); scratch.pan = paddleSide * 0.35; scratch.volume = 0.45 + 0.5 * Math.min(1, spFrac);
        play('paddle', scratch);
        paddleSide = -paddleSide;
        paddleTimer = lerp(0.9, 0.5, clamp((spFrac - 0.45) / 0.55));
      }
    } else paddleTimer = Math.min(paddleTimer, 0.15);

    // --- fishing: reel ratchet, drag scream, line strain whine, charge creak
    const fs = fishState();
    const fv = fishView();
    const tension = clamp(num(fv?.tension), 0, 1.2);
    const progress = num(fv?.progress);
    const reeling = live && (fs === 'reeling' || fs === 'landing');
    if (reeling) {
      fishIdle = 0;
      const holding = ctx.input?.down === true;
      const surge = fv?.surge === true;
      const dp = progress - lastProgress;
      let rate = 0, pitch = 1, vol = 0.6;
      if (fs === 'landing') { rate = 16; pitch = 1.15; }
      else if (surge && !holding) { rate = 24; pitch = 0.72; vol = 0.75; }
      else if (holding) { rate = 7 + 15 * clamp(tension); pitch = 0.92 + 0.3 * clamp(progress); }
      else if (dp > 0.0005) rate = 4;
      tickAcc += dt * rate;
      if (tickAcc >= 1) {
        tickAcc = Math.min(tickAcc - 1, 1);
        resetScratch(); scratch.pitch = pitch; scratch.volume = vol;
        play('reel_tick', scratch);
      }
      // strain whine
      // fishing.view.danger is a 0..1 number (DESIGN §5.10); a boolean is still honoured
      const dangerK = typeof fv?.danger === 'boolean' ? (fv.danger ? 1 : 0) : clamp(num(fv?.danger));
      const danger = dangerK > 0.5;
      if (!strain) strain = makeOscLoop('sawtooth', 600, 'bandpass', 1400, 7, N.sfxDry);
      const lvl = danger ? (0.035 + 0.11 * Math.max(clamp((tension - 0.7) / 0.3), (dangerK - 0.5) * 2)) : (tension > 0.6 ? 0.012 * (tension - 0.6) / 0.4 : 0);
      setT(strain, 'g', strain.g.gain, lvl * 0.9, 0.06);
      setT(strain, 'o', strain.o.frequency, 480 + 900 * clamp(tension), 0.05, 0.004);
      setT(strain, 'f', strain.flt.frequency, 1100 + 1500 * clamp(tension), 0.05, 0.004);
      setT(strain, 'v', strain.lg.gain, danger ? 22 : 6, 0.1);
      if (danger && !wasDanger) { resetScratch(); scratch.volume = 0.8; play('line_strain', scratch); }
      wasDanger = danger;
      const sw = num(fv?.surgeWarn) > 0;
      if (sw && !wasSurgeWarn) play('surge_warn');
      wasSurgeWarn = sw;
    } else {
      wasDanger = false; wasSurgeWarn = false;
      if (strain) { fishIdle += dt; setT(strain, 'g', strain.g.gain, 0, 0.05); if (fishIdle > 0.6) strain = killLoop(strain); }
    }
    lastProgress = progress;

    if (live && fs === 'charging' && fv) {
      const c = clamp(num(fv.charge));
      if (!charge) { charge = makeOscLoop('triangle', 220, 'lowpass', 900, 0.7, N.sfxDry); charge.lg.gain.value = 3; }
      setT(charge, 'g', charge.g.gain, 0.025 + 0.03 * c, 0.03);
      setT(charge, 'o', charge.o.frequency, 170 + 420 * c, 0.025, 0.003);
      const cleanAt = num(ctx.data?.BALANCE?.cast?.cleanAt, 0.92);
      const clean = c >= cleanAt;
      if (clean && !wasClean) play('charge_ping');
      wasClean = clean;
    } else if (charge) { charge = killLoop(charge); wasClean = false; }

    // --- v3: the Stillnight bed (night air, far frogs, reed crickets) under the stillnight score
    if (live && music.mood === 'stillnight') {
      if (!bed) bed = makeNoiseLoop('brown', 'lowpass', 340, 0.6, N.sfxDry);
      setT(bed, 'g', bed.g.gain, 0.035, 1.2);
      bedIdle = 0;
      bedTimer -= dt;
      if (bedTimer <= 0) {
        resetScratch(); scratch.pan = (Math.random() * 2 - 1) * 0.6; scratch.volume = 0.7 + Math.random() * 0.3;
        play('stillnight_bed', scratch);
        bedTimer = 2.6 + Math.random() * 2.8;
      }
    } else if (bed) {
      setT(bed, 'g', bed.g.gain, 0, 0.6);
      bedTimer = 0.6; bedIdle += dt;
      if (bedIdle > 3) bed = killLoop(bed);
    }

    // --- heartbeat at hp ≤ 2 (DESIGN §6.6), quicker on the last Ember
    const hp = num(run?.hp, 99);
    if (live && hp > 0 && hp <= 2) {
      hbTimer -= dt;
      if (hbTimer <= 0) { play('heartbeat', hp <= 1 ? undefined : { volume: 0.7 }); hbTimer = 60 / ((phaseInfo()?.isNight ? 104 : 78) * (hp <= 1 ? 1 : 0.8)); }
    } else hbTimer = 0.4;

    // --- lantern aura crackle (scaled by shades inside the light)
    auraTimer -= dt;
    if (auraTimer <= 0) {
      auraTimer = 0.1;
      let near = 0;
      const es = live ? enemyList() : null;
      const p = ctx.player?.position;
      if (es && p) {
        const lr = Math.max(1, num(ctx.survival?.lightRadius, num(st?.lightRadius, 8)));
        const r2 = lr * lr;
        for (let i = 0; i < es.length; i++) {
          const ep = es[i]?.position;
          if (!ep) continue;
          const dx = ep.x - p.x, dz = ep.z - p.z;
          if (dx * dx + dz * dz < r2) near++;
        }
      }
      const lit = num(run?.oil, 1) > 0 ? 1 : 0;
      auraTarget = clamp(near / 7, 0, 1) * lit;
    }
    auraPulse = Math.max(0, auraPulse - dt * 1.5);
    const aLvl = live ? clamp(auraTarget * 0.8 + auraPulse, 0, 1) : 0;
    if (aLvl > 0.02 && !aura) {
      aura = makeNoiseLoop('crackle', 'bandpass', 2600, 0.6, N.sfxDry);
      aura.hp = ac.createBiquadFilter(); aura.hp.type = 'highpass'; aura.hp.frequency.value = 3800;
      aura.hg = ac.createGain(); aura.hg.gain.value = 0.25;
      aura.s.connect(aura.hp); aura.hp.connect(aura.hg); aura.hg.connect(aura.g);
    }
    if (aura) {
      setT(aura, 'g', aura.g.gain, aLvl * 0.42, 0.15, 0.01);
      setT(aura, 'r', aura.s.playbackRate, 0.85 + 0.5 * aLvl, 0.3, 0.01);
      if (aLvl <= 0.02) { auraIdle += dt; if (auraIdle > 3) aura = killLoop(aura); } else auraIdle = 0;
    }
  }

  // ---------------------------------------------------------------- params for the score
  function updateParams(dt) {
    const P = music.params;
    const fv = fishView();
    P.tension = clamp(num(fv?.tension), 0, 1);
    P.danger = typeof fv?.danger === 'boolean' ? fv.danger : num(fv?.danger) > 0.5;
    P.legend = fv?.rarity === 'legendary';
    const es = enemyList();
    P.enemies = es ? es.length : 0;
    const pi = phaseInfo();
    P.nightK = pi?.isNight ? clamp(num(pi.k)) : 0;
    const hp = num(ctx.state?.run?.hp, 9);
    const target = clamp(0.18 + 0.5 * P.nightK + P.enemies / 45 + (hp <= 1 ? 0.15 : 0), 0, 1);
    P.intensity += (target - P.intensity) * Math.min(1, dt * 0.8);
    if (override) for (const k in override) if (k in P) P[k] = override[k];
  }

  // ---------------------------------------------------------------- bus wiring
  function on(evt, fn) {
    ctx.bus?.on?.(evt, (p) => { if (!unlocked || !ac) return; try { fn(p || EMPTY); } catch (e) { report(evt, e); } });
  }
  function wire() {
    // fishing
    on('fishing:cast', (p) => { resetScratch(); scratch.power = num(p.power, 0.7); play('cast_whoosh', scratch); });
    on('fishing:land', (p) => { resetScratch(); scratch.volume = spatial(p.position, scratch) * 0.6 + 0.4; play('bobber_plop', scratch); });
    on('fishing:nibble', () => { resetScratch(); scratch.pan = bobberPan(); play('nibble', scratch); });
    on('fishing:bite', (p) => {
      const tellName = V3.tellSfx(p.biteTell);
      if (tellName) {
        // v3: the class tell voices the water (scheduled by fishing:tell, or now when it never came); the "!" rings the alert
        if (!tell || !tell.played) playTell(tellName, p.biteTell);
        tell = null;
        resetScratch(); scratch.pan = bobberPan(); scratch.alertOnly = true; play('bite', scratch);
        return;
      }
      resetScratch(); scratch.pan = bobberPan(); play('bite', scratch);
    });
    on('fishing:hook', (p) => { resetScratch(); scratch.perfect = !!p.perfect; play('hook', scratch); });
    on('fishing:miss', (p) => {
      resetScratch(); scratch.pan = bobberPan();
      if (p.reason === 'early') { scratch.volume = 0.6; play('denied', scratch); } else { scratch.volume = 0.7; play('splash_small', scratch); }
    });
    on('fishing:surge', (p) => {
      resetScratch(); scratch.pan = bobberPan(); scratch.volume = 0.5 + 0.4 * clamp(num(p.strength, 1) / 1.5);
      play('splash_big', scratch); play('line_strain', scratch);
    });
    on('fishing:caught', (p) => {
      resetScratch(); scratch.pan = bobberPan(); play('splash_big', scratch);
      // v3: the Fish's final length for the measuring cord (fishing:caught + {fish, z, sizeClass, ancient, length, favours})
      if (typeof p.sizeClass === 'string' && num(p.length) > 0) {
        catchInfo = { speciesId: p.speciesId ?? null, sizeClass: p.sizeClass, ancient: !!p.ancient, length: num(p.length), zone: p.zone ?? ctx.state?.run?.zone ?? null,
          key: p.fish?.uid ?? `${p.speciesId}:${p.length}`, at: ac.currentTime };
      }
    });
    on('fishing:escaped', (p) => {
      resetScratch();
      if (p.reason === 'snap') play('line_snap', scratch);
      else { scratch.volume = 0.8; play('splash_small', scratch); scratch.volume = 0.5; scratch.pitch = 0.8; play('denied', scratch); }
    });
    on('fish:landed', (p) => {
      // v3 (measured: true): the card opens at the stamp, so the fanfare waits for the seal to land first
      const after = p.measured === true ? Math.max(0, stampAt - ac.currentTime) + 0.3 : 0;
      resetScratch(); scratch.rarity = p.species?.rarity || 'common'; scratch.delay = after;
      play('catch_fanfare', scratch);
      if (p.isNew) { resetScratch(); scratch.delay = after + 0.65; play('new_species', scratch); }
    });
    on('fish:action', (p) => {
      const a = p.action;
      if (a === 'eat') play('eat');
      else if (a === 'render') play('render_oil');
      else if (a === 'sell') play('coin');
      else if (a === 'release') { resetScratch(); scratch.volume = 0.7; play('splash_small', scratch); }
      else if (a === 'keep') play('creel');
    });
    on('shells:change', (p) => { if (num(p.delta) > 0) { resetScratch(); scratch.pitch = 1 + Math.min(0.25, num(p.delta) / 400); play('coin', scratch); } });
    on('shop:buy', () => play('buy'));
    on('relic:buy', () => play('buy'));
    on('merchant:arrive', () => { resetScratch(); scratch.volume = Math.max(0.5, spatial(ctx.actors?.merchant?.position, scratch)); play('merchant_bell', scratch); });
    on('merchant:leave', () => { resetScratch(); scratch.volume = 0.4 * Math.max(0.5, spatial(ctx.actors?.merchant?.position, scratch)); scratch.pitch = 0.94; play('merchant_bell', scratch); });
    on('phase:change', (p) => {
      if (p.phase === 'gloomtide') {
        const mode = nightMode(p.nightMode);
        if (!mode) { play('gloom_rise'); return; }
        // v3: Night Rise, the big-fish hour, opens every night in every mode (Gloomtide's swarm still rises first)
        night.day = ctx.state?.run?.day ?? -1; night.windowOpen = false; night.windowClosed = false;
        if (mode === 'gloomtide') play('gloom_rise');
        resetScratch(); scratch.root = zoneRoot(); scratch.why = mode;
        if (mode === 'gloomtide') { scratch.delay = 2.6; scratch.volume = 0.6; }
        play('night_rise', scratch);
        moodTimer = 0.5;
      } else if (p.phase === 'dawn') play('dawn');
      else if (p.phase === 'dusk') play('dusk_toll');
    });
    on('player:anchor', (p) => { resetScratch(); scratch.anchored = p.anchored !== false; play('anchor', scratch); });
    on('interact:change', (p) => { if (p.id) { resetScratch(); scratch.volume = 0.7; scratch.pitch = 0.85; play('ui_hover', scratch); } });
    // ---- v3 (DESIGN §25, Au1): only v3 events reach these
    on('fishing:tell', (p) => {
      const name = V3.tellSfx(p.biteTell);
      if (!name) return;
      tell = { name, why: p.biteTell, at: gameT() + V3.tellDelay(p.biteTell, p.lead, ctx.data), played: false };
      tellTick();
    });
    on('fishing:state', (p) => { if (tell && p.state !== 'waiting' && p.state !== 'bite') dropTell(); });
    on('sign:spawn', (p) => { if (p.kind === 'rise') riseSound(p); });
    on('sign:rise', (p) => riseSound(p));
    on('sign:end', (p) => { if (p.id !== undefined) signHeard.delete(p.id); });
    on('fish:measured', (p) => {
      const legendary = ctx.data?.SPECIES_BY_ID?.[p.speciesId]?.rarity === 'legendary';
      const seal = V3.sealOf(p.sizeClass, ctx.data, { legendary });
      let delay = 0;
      if (cord && !cord.compact && ac.currentTime <= cord.end + 1.5) cancelCord();   // the ceremony's cord: the stamp lands now, any knot still due is silenced
      else {
        // no ceremony on screen (fishing measured at once): the cord runs compressed, then the stamp
        const key = p.fish?.uid ?? `${p.speciesId}:${p.length}`;
        const plan = num(p.length) > 0 ? startCord({ speciesId: p.speciesId, sizeClass: p.sizeClass, length: num(p.length), zone: catchInfo?.zone ?? ctx.state?.run?.zone ?? null, key },
          V3.compactCordDuration(p.sizeClass)) : null;
        if (cord) cord.compact = true;
        delay = plan ? plan.dur + 0.04 : 0;
      }
      resetScratch(); scratch.seal = seal; scratch.ancient = V3.goldThread({ ancient: p.ancient, legendary }); scratch.delay = delay; scratch.force = true;
      if (!seal) scratch.why = p.sizeClass || null;
      play('seal_stamp', scratch);
      if (seal === 'blackWaxRibbon') duck(0.6, 0.9 + delay);
      stampAt = ac.currentTime + delay;
      catchInfo = null;
      if (Array.isArray(p.records) && p.records.some((r) => r && r.kind === 'oldLedger')) { resetScratch(); scratch.delay = delay + 0.9; play('murk_bell_far', scratch); }
    });
    on('swarm:window', (p) => {
      syncNight();
      const mode = typeof p.mode === 'string' ? p.mode : nightMode();
      if (p.state === 'open') {
        night.windowOpen = true;
        if (mode !== 'gloomtide') play('gloom_rise');                  // a Lantern swarm comes (Gloomtide's rose with the night)
      } else if (p.state === 'close') {
        night.windowOpen = false; night.windowClosed = true;
        if (p.reason === 'window' && phaseName() === 'gloomtide') {   // the quiet tail: the rise resumes, uninterrupted
          resetScratch(); scratch.volume = 0.7; scratch.root = zoneRoot(); scratch.why = 'tail'; play('night_rise', scratch);
        }
      }
      moodTimer = 0.5;
    });
    // combat
    on('enemy:spawn', (p) => {
      const e = p.enemy || EMPTY; resetScratch();
      scratch.elite = !!e.elite;
      const g = spatial(e.position, scratch);
      if (e.boss) return;                       // boss:spawn handles it
      scratch.volume = e.elite ? Math.max(0.6, g) : g * 0.8;
      scratch.force = !!e.elite;
      play('enemy_spawn', scratch);
    });
    on('enemy:hit', (p) => {
      // a hit dispatched synchronously from a pointerdown is a tap-zap (combat.onPointerDown)
      if (inPointer && zapFrame !== ctx.time?.frame) { zapFrame = ctx.time?.frame; resetScratch(); scratch.volume = 0.9; play('zap', scratch); }
      resetScratch(); scratch.crit = !!p.crit;
      const g = spatial(p.position || p.enemy?.position, scratch);
      scratch.volume = g * (p.crit ? 1 : 0.75);
      auraPulse = Math.min(0.6, auraPulse + 0.05);
      play('enemy_hit', scratch);
    });
    on('enemy:slain', (p) => {
      const e = p.enemy || EMPTY; resetScratch();
      scratch.big = !!(e.elite || e.boss);
      scratch.volume = spatial(p.position || e.position, scratch) * (scratch.big ? 1.1 : 0.85);
      play('enemy_die', scratch);
    });
    on('enemy:steal', () => play('steal'));
    on('boss:spawn', () => play('boss_roar'));
    on('boss:slain', (p) => { resetScratch(); scratch.dying = true; scratch.pitch = 0.85; play('boss_roar', scratch); resetScratch(); scratch.big = true; play('enemy_die', scratch); });
    on('flare', () => play('flare'));
    on('levelup', () => play('levelup'));
    on('boon:chosen', () => play('boon_pick'));
    on('xp:gain', (p) => {
      const now = ac.currentTime;
      xpCombo = now - xpLast < 0.7 ? Math.min(xpCombo + 1, 10) : 0;
      xpLast = now;
      resetScratch();
      const semis = PENTA[xpCombo % 5] + 12 * Math.floor(xpCombo / 5);
      scratch.pitch = Math.pow(2, semis / 12);
      scratch.volume = 0.75 + Math.min(10, num(p.amount, 1)) * 0.025;
      play('xp_pickup', scratch);
    });
    on('player:damage', () => play('player_hurt'));
    on('player:heal', () => play('heal'));
    on('player:died', () => { stopContinuous(); play('death'); });
    on('lantern:out', () => play('snuff'));
    on('lantern:lit', () => play('ignite'));
    on('resource:low', (p) => { if (p.resource === 'hp') return; resetScratch(); scratch.resource = p.resource; play('warn', scratch); });
    // progression / meta
    on('challenge:complete', () => play('challenge_complete'));
    on('unlock', () => { resetScratch(); scratch.delay = lastPlay.challenge_complete !== undefined && ac.currentTime - lastPlay.challenge_complete < 0.5 ? 1.1 : 0; play('unlock', scratch); });
    on('bounty:complete', () => { play('coin'); resetScratch(); scratch.volume = 0.6; scratch.delay = 0.1; play('challenge_complete', scratch); });
    on('gate:open', () => play('gate_open'));
    on('zone:change', (p) => { if (p.prev) { stopContinuous(); play('descend'); } });
    on('victory', () => { victoryHold = 40; play('victory'); });
    on('ui:modal', (p) => play(p.open ? 'ui_open' : 'ui_close'));
    on('run:start', () => { victoryHold = 0; stopContinuous(); });
    on('run:end', () => stopContinuous());
    on('flow:change', (p) => { if (p.flow !== 'playing') stopContinuous(); moodTimer = 0.5; });
  }
  function bobberPan() {
    const b = ctx.fishing?.bobberPos;
    if (!b || typeof b.x !== 'number') return 0;
    const o = { pan: 0 };
    spatial(b, o);
    return o.pan * 0.7;
  }

  // ---------------------------------------------------------------- unlock / lifecycle
  function tick() {
    try { if (music && ac && ac.state === 'running') music.tick(); } catch (e) { report('tick', e); }
  }
  function unlock() {
    try {
      if (!ac && !buildGraph()) return false;
      if (ac.state !== 'running' && !document.hidden) { const pr = ac.resume?.(); pr?.catch?.(() => {}); }
      if (!unlocked) {
        unlocked = true;
        try {   // iOS: play a silent buffer inside the gesture
          const b = ac.createBuffer(1, 1, 22050); const s = ac.createBufferSource(); s.buffer = b; s.connect(ac.destination); s.start(0);
        } catch { /* ignore */ }
        applySettings();
        if (!timer) timer = setInterval(tick, 25);
        pickMood(0);
      }
      return true;
    } catch (e) { report('unlock', e); return false; }
  }
  function onVisibility() {
    if (!ac) return;
    try {
      if (document.hidden) ac.suspend?.()?.catch?.(() => {});
      else if (unlocked) ac.resume?.()?.catch?.(() => {});
    } catch { /* ignore */ }
  }
  function onGesture() {
    if (!ac) { unlock(); return; }
    if (ac.state !== 'running' && !document.hidden) { try { ac.resume?.()?.catch?.(() => {}); } catch { /* ignore */ } }
  }
  function measureRms() {
    if (!N || !rmsBuf) return 0;
    try {
      N.analyser.getFloatTimeDomainData(rmsBuf);
      let s = 0;
      for (let i = 0; i < rmsBuf.length; i++) s += rmsBuf[i] * rmsBuf[i];
      return Math.sqrt(s / rmsBuf.length);
    } catch { return 0; }
  }

  const api = {
    init() {
      wire();
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('pointerdown', onGesture, { capture: true, passive: true });
      window.addEventListener('pointerdown', () => { inPointer = false; });          // bubble: after the canvas handler
      window.addEventListener('pointerdown', () => { inPointer = true; queueMicrotask(() => { inPointer = false; }); }, { capture: true, passive: true });
      window.addEventListener('keydown', onGesture, { capture: true, passive: true });
      window.addEventListener('touchend', onGesture, { capture: true, passive: true });
      ctx.debug.audio = () => ({
        state: ac ? ac.state : 'locked',
        mood: music?.mood || null,
        zone: music?.zone || null,
        voices: eng ? eng.active : 0,
        musicVoices: eng ? (eng.tags.m || 0) : 0,
        layers: music ? music.layers.length : 0,
        rms: measureRms(),
        forced,
        intensity: music ? +music.params.intensity.toFixed(3) : 0,
        played, last: lastName,
        loops: { strain: !!strain && !strain.dead, charge: !!charge && !charge.dead, aura: !!aura && !aura.dead, water: !!water, bed: !!bed && !bed.dead },
        auto: unlocked ? autoMood() : null,
        nightMode: nightMode(),
        cord: cord ? { ticks: cord.ticks, chimes: cord.chimes.slice(), end: cord.end, compact: !!cord.compact, active: !!ac && ac.currentTime < cord.end } : null,
      });
      ctx.debug.audioLog = (n = 60) => log.slice(-Math.max(1, Math.min(LOG_MAX, num(n, 60) | 0))).map((e) => ({ ...e }));
      ctx.debug.audioMood = (m) => setMood(m);
      ctx.debug.audioParams = (o) => {
        override = o && typeof o === 'object' ? { ...o } : null;
        if (music) { if (override) Object.assign(music.params, override); else music.params.solo = null; }
        return override;
      };
      // test tooling: capture the post-compressor mix → {sampleRate, channels:2, b64 (interleaved int16)}
      ctx.debug.audioRecord = (seconds = 4) => new Promise((resolve) => {
        if (!ac || !N || !ac.createScriptProcessor) { resolve(null); return; }
        const sp = ac.createScriptProcessor(4096, 2, 2);
        const total = Math.floor(clamp(num(seconds, 4), 0.1, 30) * ac.sampleRate);
        const chunks = [];
        let n = 0;
        sp.onaudioprocess = (e) => {
          if (n >= total) return;
          const a = e.inputBuffer.getChannelData(0), b = e.inputBuffer.numberOfChannels > 1 ? e.inputBuffer.getChannelData(1) : a;
          chunks.push([new Float32Array(a), new Float32Array(b)]);
          n += a.length;
          if (n < total) return;
          try { N.comp.disconnect(sp); sp.disconnect(); } catch { /* ignore */ }
          const out = new Int16Array(n * 2);
          let k = 0;
          for (const [l, r] of chunks) for (let i = 0; i < l.length; i++) { out[k++] = clamp(l[i], -1, 1) * 32767; out[k++] = clamp(r[i], -1, 1) * 32767; }
          const bytes = new Uint8Array(out.buffer);
          let bin = '';
          for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
          resolve({ sampleRate: ac.sampleRate, channels: 2, b64: btoa(bin) });
        };
        N.comp.connect(sp); sp.connect(ac.destination);
      });
    },
    update(dt) {
      if (!ac || !unlocked || !N) return;
      if (ac.state !== 'running') return;
      try {
        dt = Math.min(num(dt, 0.016), 0.1);
        music.tick();
        pollSettings();
        updateParams(dt);
        // mood polling runs on the audio clock (robust to frame-time clamping / slow frames)
        const at = ac.currentTime, rdt = lastAt ? Math.min(1, Math.max(0, at - lastAt)) : dt;
        lastAt = at;
        moodTimer += rdt;
        if (victoryHold > 0) victoryHold -= rdt;
        if (moodTimer >= 0.5) { pickMood(moodTimer); moodTimer = 0; }
        music.silent = curve(set.music) * curve(set.master) < 0.0005;
        continuous(dt);
        v3Tick();
        busGains();
      } catch (e) { report('update', e); }
    },
    unlock,
    play,
    setMood,
    applySettings,
    // ---- optional extras
    getMood: () => music?.mood || null,
    isUnlocked: () => unlocked && !!ac && ac.state === 'running',
    duck,
    names: CONTRACT_SFX.slice(),
    extraNames: Object.keys(SFX).filter((k) => !CONTRACT_SFX.includes(k) && !V3_SFX.includes(k)),
    moods: MOODS.slice(),
    v3Names: V3_SFX.slice(),            // CONTRACT §13.7 audio's v3 SFX that exist (Au1)
    v3Moods: V3_MOODS.slice(),
    rms: measureRms,
    /** soft glass chime at a MIDI pitch — for UI flourishes (e.g. ascending notes on a reward list). */
    note(midi, { volume = 0.5 } = {}) {
      if (!ac || !unlocked) return false;
      return play('charge_ping', { volume, pitch: mtof(clamp(num(midi, 93), 48, 108)) / mtof(93), force: true });
    },
  };
  return api;
}
