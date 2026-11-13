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
//
// v3 automatic fishing (DESIGN §25.6, §25.14.2a Au2; audio-v3.js beatSounds, audio-af.js voices). The play's sound comes only
// from the payloads (class, `ancient`, class length, mean fitted tier, beat), never a species:
//   fishing:strike {grade}        → strike_clean / _struck / _early / _late, weighted by the class; the play begins
//                                   (fishing:hook with a grade then rings nothing more)
//   fishing:reel {phase, …}       → take: reel_take · gain / lift: reel_ratchet (fast and light → slow and heavy) · run:
//                                   line_hiss (the drag rising; a Trophy+ tows the raft) · hold: line_hold (one low note) ·
//                                   surge: surge_splash + strain_whine (one semitone lower per mean tier) · glimpse: fish_roll
//                                   / fish_skitter / fish_pass · leap: leap_slap · scare: scare_splash, the line's hum stops for
//                                   its slack moment · lastStand: reel_scream + the strain + the drone swelling · still: silence
//                                   (hum, drone and score), then still_crash · place (P2): line_grind / foul_clank
//   the line's hum (a loop, by class length) under the whole play; the Elder / Ancient drone on the music bus
//   music by class (AUTOFISH.play[class].music): Small the day's bed · Keeper + a soft pulse · Prize / Trophy / Elder `reel`
//                                   low / mid / full · Ancient + the heartbeat · a legend the boss mood; a Small never starts `reel`
//   fishing:escaped {reason}      → loss_snap (snapped; staggered with the hit first) / loss_thrown / loss_spat / loss_spooled /
//                                   loss_fouled; the score drops for the quiet beat; fish:escaped (the note) → gotaway (Trophy+)
//   fishing:caught                → the species' voice, if it has one (the reveal: never before)
//   fishing:miss {passed}         → bite_pass; {spooked} → as v1's early tap
// The Landing and the First Evening (DESIGN §25.4.8, FE-Au1):
//   zone:change {hub: true}       → the cove bed (the hearth, the water at the quay, a far bell) and the `hub` mood; no descend;
//                                   from a snuff, the snuff motif under the hearth
//   zone:change {prev: 'cove'}    → `setout` instead of `descend` on every departure (a Continue rings nothing)
//   firstEvening:step framing     → the bed rises; ember_swell at FIRST_EVENING.ember.at (or on firstEvening:beat {id: 'ember'})
//   firstEvening:step wake        → flame_catch (after the framing) · setout → the lantern flaring (flame_catch {flare})
//   firstEvening:line {kind: 'murk'} → murk_grumble, as many syllables as the line, from Murk's barge
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
const V3_MOODS = ['stillnight', 'hub'];
const ALL_MOODS = [...MOODS, ...V3_MOODS];
const LOG_MAX = 240;
const SFX_LEVEL = 0.85;
const STILL_DUCK = 0.02;      // v3: the score in the Ancient's still (1.5 s of silence, DESIGN §25.6.5)
const AF_MUSIC = 0.8;         // v3: the score sits back a little under an automatic play, so the reel's own sounds lead

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
    cls: undefined, seal: undefined, ancient: false, root: undefined, alertOnly: false, why: undefined, at: undefined, dur: undefined, voicing: undefined };
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
  // v3 automatic fishing (Au2): the play in progress, from the strike to the card or the loss
  const af = { active: false, cls: null, legend: false, tier: 0, len: 0.4, music: null, held: [], hum: null, humTarget: 0, humMuteUntil: 0,
    humIdle: 0, drone: null, droneTarget: 0, droneIdle: 0, afterStill: false, stillUntil: 0, beats: [] };
  // v3 the Landing (FE-Au1): the cove bed and the First Evening's cues
  const cove = { active: false, from: null, fire: null, roar: null, lap: null, pan: null, idle: 0, breathT: 1.5, bellT: 7, flickT: 0, risenAt: -9 };
  const fe = { emberDue: null, emberDone: true, step: null };
  const handlers = Object.create(null);   // event → [fn]: audio's own listeners (debug.audioEvent drives them without the bus)

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

    N = { master, comp, analyser, conv, delay, muffle, musicDry, musicWet, musicDly, musicVol, musicWetVol, musicDlyVol, sfxDry, sfxWet, sfxDly, sfxVol, sfxWetVol, sfxDlyVol, verbReturn, dReturn };
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
    // v3: the Ancient's still holds the score near silence (STILL_DUCK), an automatic play sits it back (AF_MUSIC); 1 otherwise (v1)
    const want = curve(set.music) * MUSIC_LEVEL * (pausedish ? 0.6 : 1) * duckAmt * (now < af.stillUntil ? STILL_DUCK : af.active ? AF_MUSIC : 1);
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
    // o.at (v3): an absolute start on the audio clock, so a run of scheduled sounds (the cord's knots) keeps its spacing
    // even when the clock moves while they are being built
    const t = typeof o.at === 'number' && o.at > now + 0.005 ? o.at : now + 0.005 + Math.max(0, num(o.delay, 0));
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
    s.cls = undefined; s.seal = undefined; s.ancient = false; s.root = undefined; s.alertOnly = false; s.why = undefined; s.at = undefined;
    s.dur = undefined; s.voicing = undefined;
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
    if (ctx.flow === 'hub' && cove.active) return 'cove';
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
    if (flow === 'hub') return afPlayMood(fishState()) || 'hub';   // v3: the Landing (the First Evening's play is Small / Keeper)
    const run = ctx.state?.run;
    if (flow !== 'playing' || !run) return 'title';
    if (victoryHold > 0) return 'victory';
    if (bossPresent()) return 'boss';
    const fs = fishState();
    const am = afPlayMood(fs);                 // v3 automatic play: the score by class (undefined otherwise)
    if (am !== undefined) return am || dayMood();
    if (fs === 'reeling' || fs === 'landing') return 'reel';
    return dayMood();
  }
  function dayMood() {
    const ph = phaseName();
    if (ph === 'gloomtide') return nightMoodNow();
    if (ph === 'dusk') return 'dusk';
    return 'calm';
  }
  /** The automatic play's mood (null = the day's own), or undefined when no automatic play is on (v1, P1's manual reel). */
  function afPlayMood(fs) {
    if (!af.cls || !af.music) return undefined;
    if (!af.active && fs !== 'reeling' && fs !== 'landing') return undefined;
    return af.music.mood;
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
    const base = ac.currentTime + 0.01 + Math.max(0, t0);   // one clock for the whole cord
    for (const tk of plan.ticks) {
      resetScratch(); scratch.at = base + tk.t; scratch.pitch = tk.pitch; scratch.volume = 0.8 + 0.2 * (tk.i / n); scratch.force = true;
      const h = playV('cord_tick', scratch); if (h) voices.push(h);
    }
    for (const ch of plan.chimes) {
      resetScratch(); scratch.at = base + ch.t; scratch.cls = ch.cls; scratch.force = true;
      const h = playV('class_chime', scratch); if (h) voices.push(h);
    }
    cord = { voices, key: info.key ?? null, start: base, end: base + plan.dur, ticks: n, chimes: plan.chimes.map((c) => c.cls) };
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
    feTick();
  }

  // ---------------------------------------------------------------- v3 automatic fishing (DESIGN §25.6.5, Au2)
  const r3 = (v) => Math.round(v * 1000) / 1000;
  const HUM_BY_PHASE = { take: 0.6, gain: 0.5, lift: 0.45, run: 0.75, hold: 1, surge: 0.9, lastStand: 1, place: 0.55 };
  /** The lake the line is in (the class ladder's lake multiplier): the cove at the Landing, else the run's lake. */
  function afLake() {
    if (cove.active) return 'cove';
    const r = ctx.state?.run;
    if (r && typeof r.zone === 'string') return r.zone;
    try { const z = ctx.world?.getZone?.(); if (z && typeof z.id === 'string') return z.id; } catch { /* optional */ }
    return null;
  }
  /** The play's speed: × AUTOFISH.play.inputs.hurry.mult while a Small / Keeper play is hurried (fishing.view.play.hurry). */
  function afRate() {
    const pl = fishView()?.play;
    return pl && pl.hurry === true ? Math.max(1, num(ctx.data?.AUTOFISH?.play?.inputs?.hurry?.mult, 2.5)) : 1;
  }
  function afNote(phase, kind, dur) {
    af.beats.push({ phase, kind: kind ?? null, at: r3(ac.currentTime), dur: r3(num(dur, 0)) });
    if (af.beats.length > 64) af.beats.splice(0, af.beats.length - 64);
  }
  /** The strike (or a reel beat with no strike before it): the play begins, at its class. */
  function afBegin(p) {
    af.active = true;
    af.cls = V3.playClass(p);
    af.legend = af.cls === 'legend';
    af.tier = num(p.tier, 0);
    af.len = num(p.length, 0) > 0 ? num(p.length) : V3.classLength(ctx.data, af.cls, afLake());
    af.music = V3.playMusic(af.cls, ctx.data);
    af.afterStill = false; af.stillUntil = 0; af.humMuteUntil = 0; af.humTarget = 0.6;
    af.droneTarget = af.music.drone;
    af.held.length = 0; af.beats.length = 0; af.strain = null;
    moodTimer = 0.5;   // the score follows on the next update
  }
  /** Fade the sustained sounds of the beat before (a ratchet never runs under a run). */
  function afFadeHeld() {
    for (const h of af.held) silence(h, false);
    af.held.length = 0;
  }
  /** The play is over (the card, the next cast, idle): forget it. */
  function afReset() {
    if (!af.cls && !af.active) return;
    afFadeHeld();
    af.active = false; af.cls = null; af.music = null; af.legend = false;
    af.humTarget = 0; af.droneTarget = 0; af.afterStill = false;
    moodTimer = 0.5;
  }
  function afStrike(p) {
    const name = V3.strikeSfx(p.grade);
    if (!name) return;
    afBegin(p);
    afNote('strike', p.grade, 0);
    play(name, { k: V3.lengthK(af.len), cls: af.cls, why: af.cls, pan: bobberPan(), force: true });
  }
  /** One fishing:reel beat: its sounds (audio-v3 beatSounds, from the payload alone), the hum, the drone, the still. */
  function afBeat(p) {
    if (typeof p.phase !== 'string') return;
    if (!af.active) afBegin(p);
    if (p.tier !== undefined) af.tier = num(p.tier, af.tier);
    if (num(p.length, 0) > 0) af.len = num(p.length);
    const now = ac.currentTime, rate = afRate();
    const overlay = p.phase === 'glimpse' || p.phase === 'leap' || p.phase === 'scare';   // these ride on the beat under them
    const dur = Math.max(0.05, num(p.dur, 0.6) / rate);
    afNote(p.phase, p.kind, dur);
    if (!overlay) afFadeHeld();
    if (p.phase === 'still') {
      // the still (Ancient): everything stops — the hum, the drone, the score — then it thunders off on the next beat. Gated on
      // the audio clock at once (a slow frame must not let the line hum on into the silence), and brought back at its end.
      af.humMuteUntil = now + dur; af.stillUntil = now + dur; af.afterStill = true; af.droneTarget = 0;
      afHumGate(now + dur);
      afDroneGate(now + dur);
      afScoreGate(now + dur);
      return;
    }
    if (p.phase === 'loss') { af.humTarget = 0; return; }   // fishing:escaped carries the cause and its sound
    if (af.afterStill && !overlay) {
      af.afterStill = false;
      play('still_crash', { k: V3.lengthK(af.len), cls: af.cls, why: af.cls, pan: bobberPan(), force: true });
    }
    const pan = bobberPan();
    for (const snd of V3.beatSounds(p, ctx.data, { lake: afLake(), rate })) {
      const h = playV(snd.name, { ...snd.opts, dur: snd.dur, delay: snd.delay, pan, why: snd.opts.cls, force: true });
      if (h && V3.SUSTAINED.has(snd.name)) af.held.push(h);
      if (h && snd.name === 'strain_whine') af.strain = r3(snd.opts.freq);
    }
    if (p.phase === 'scare') { af.humMuteUntil = now + clamp(dur * 0.45, 0.2, 0.6); afHumGate(af.humMuteUntil); }   // the hum stops; then it returns
    else if (!overlay) af.humTarget = HUM_BY_PHASE[p.phase] ?? 0.6;
    if (p.phase === 'lastStand') af.droneTarget = Math.min(1.5, (af.music?.drone || 0) * 1.6);   // the drone swells
    else if (!overlay) af.droneTarget = af.music?.drone || 0;
  }
  /** fishing:escaped with a v3 cause: the loss's own sound, then quiet (the hum and drone stop, the score drops for the beat). */
  function afLoss(p, name) {
    afFadeHeld();
    const cls = af.cls || V3.playClass(p);
    const k = V3.lengthK(af.cls ? af.len : V3.classLength(ctx.data, cls, afLake()));
    af.humTarget = 0; af.humMuteUntil = ac.currentTime + 30; af.droneTarget = 0;
    afHumGate(af.humMuteUntil);
    afNote('lost', p.reason, 0);
    play(name, { k, cls, staggered: p.reason === 'staggered', why: p.reason, pan: bobberPan(), force: true });
    af.active = false;
    moodTimer = 0.5;
  }
  /** fishing:landing — the swell rises into the reveal (class only: the species is still hidden). Its length follows the wipe and
   *  the slow-motion beat (AUTOFISH.landing); the chime that resolves it plays on fishing:caught. */
  let land = null;
  function landSwell(p) {
    if (ctx.data?.V3_ENABLED !== true) return;
    const cls = V3.landingClass(p);
    const V = V3.landingVoicing(cls);
    const LF = ctx.data?.AUTOFISH?.landing?.[cls] || null;
    const wipe = num(p.dur, num(LF?.wipe, 0.4));
    const sm = Array.isArray(LF?.slowmo) ? LF.slowmo : [0, 1];
    const ss = num(sm[0], 0), sc = clamp(num(sm[1], 1), 0.05, 1);
    const real = ss > 0 ? (wipe <= ss * sc ? wipe / sc : ss + (wipe - ss * sc)) : wipe;
    resetScratch(); scratch.dur = Math.max(0.3, real + 0.05); scratch.root = V.root; scratch.force = true; scratch.why = cls;
    land = { cls, at: ac.currentTime, swell: playV('land_swell', scratch) };
  }
  /** The reveal resolves: the class chime (a new species or a legend adds a shimmer); the swell lets go. */
  function landChime(p) {
    const l = land;
    land = null;
    if (!l || ac.currentTime - l.at > 6) return;
    if (l.swell) silence(l.swell, false);
    let special = p.legendary === true;
    try { special = special || !(num(ctx.state?.meta?.journal?.[p.speciesId]?.caught) > 0); } catch { /* ignore */ }
    resetScratch(); scratch.voicing = V3.landingVoicing(l.cls, { special }); scratch.force = true; scratch.why = l.cls + (special ? '+' : '');
    play('land_chime', scratch);
  }
  /** fishing:caught — the reveal: the species' voice, if it has one (never before); the play's hum and drone end. */
  function afCaught(p) {
    if (ctx.data?.V3_ENABLED !== true) return;
    landChime(p);
    const voice = V3.speciesVoice(p.speciesId);
    if (voice) play(voice, { why: p.speciesId, pan: bobberPan(), delay: 0.05, force: true });
    if (!af.cls) return;
    afFadeHeld();
    afNote('caught', null, 0);
    af.humTarget = 0; af.droneTarget = 0; af.active = false;
  }
  /** Silence the line's hum now, on the audio clock, and bring it back at `until` (a scare's slack moment, the still, a loss). */
  function afHumGate(until) {
    const l = af.hum;
    if (!l || l.dead) return;
    const now = ac.currentTime, g = l.g.gain;
    try {
      g.cancelScheduledValues(now); g.setTargetAtTime(0, now, 0.015);
      if (until - now < 20) g.setTargetAtTime(af.humTarget * 0.045 * 0.95, until, 0.12);
    } catch { /* ignore */ }
    l._g = 0;   // the per-frame update keeps off the gain until the gate ends
  }
  /** The drone falls silent for the still and comes back with the crash (tc 0.9). */
  function afDroneGate(until) {
    const l = af.drone;
    if (!l || l.dead) return;
    const now = ac.currentTime, g = l.g.gain;
    try { g.cancelScheduledValues(now); g.setTargetAtTime(0, now, 0.03); g.setTargetAtTime((af.music?.drone || 0) * 0.06, until, 0.9); } catch { /* ignore */ }
    l._g = 0;
  }
  /** The score holds its breath through the still (busGains applies it now) and returns at its end on the audio clock; the
   *  cavern's tail and echoes and the water under the raft hush with it, so the silence is a silence. */
  function afScoreGate(until) {
    if (!N) return;
    busGains();
    const now = ac.currentTime;
    const back = curve(set.music) * MUSIC_LEVEL * AF_MUSIC;
    try {
      for (const g of [N.musicVol.gain, N.musicWetVol.gain, N.musicDlyVol.gain]) g.setTargetAtTime(back, until, 0.5);
      for (const [g, v] of [[N.verbReturn.gain, 0.85], [N.dReturn.gain, 0.5]]) { g.cancelScheduledValues(now); g.setTargetAtTime(v * 0.08, now, 0.08); g.setTargetAtTime(v, until, 0.35); }
      if (water && !water.dead) { const wg = water.g.gain; wg.cancelScheduledValues(now); wg.setTargetAtTime(0.004, now, 0.1); water._g = 0.004; }
    } catch { /* ignore */ }
  }
  function makeHum(f) {
    const l = makeOscLoop('triangle', f, 'bandpass', f * 2, 4, N.sfxDry);
    l.lg.gain.value = f * 0.006;
    return l;
  }
  function makeDrone() {
    const t = ac.currentTime, r = zoneRoot() - 24;
    const g = ac.createGain(); g.gain.value = 0;
    const flt = ac.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = 240; flt.Q.value = 0.9;
    const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(r); o.detune.value = -7;
    const o2 = ac.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = mtof(r + 7); o2.detune.value = 6;
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.11;
    const lg = ac.createGain(); lg.gain.value = 90;
    lfo.connect(lg); lg.connect(flt.frequency);
    o.connect(flt); o2.connect(flt); flt.connect(g); g.connect(N.musicDry);
    o.start(t); o2.start(t); lfo.start(t);
    return { o, o2, flt, g, lfo, lg, dead: false, idle: 0 };
  }
  /** The play's continuous layers: the line's hum (stops for a scare's slack and the still) and the Elder / Ancient drone. */
  function afContinuous(dt, flow, fs, fv) {
    const now = ac.currentTime;
    const inWorld = (flow === 'playing' || flow === 'hub') && ctx.paused !== true;
    if (af.active && inWorld) {
      const k = V3.lengthK(af.len), f = V3.humFreq(k);
      if (!af.hum || af.hum.dead) af.hum = makeHum(f);
      const line = clamp(num(fv?.play?.line, 0.5), 0, 1);
      const muted = now < af.humMuteUntil;
      if (!muted) setT(af.hum, 'g', af.hum.g.gain, af.humTarget * 0.045 * (0.7 + 0.5 * line), 0.12);   // muted: afHumGate holds it
      setT(af.hum, 'o', af.hum.o.frequency, f * (1 + 0.1 * line), 0.25, 0.004);
      setT(af.hum, 'f', af.hum.flt.frequency, f * 2 * (1 + 0.1 * line), 0.25, 0.004);
      af.humIdle = 0;
    } else if (af.hum) {
      setT(af.hum, 'g', af.hum.g.gain, 0, 0.04);
      af.humIdle += dt;
      if (af.humIdle > 0.8) af.hum = killLoop(af.hum);
    }
    const droning = !!af.cls && (af.music?.drone || 0) > 0 && (af.active || fs === 'landing') && (flow === 'playing' || flow === 'hub');
    if (droning) {
      if (!af.drone || af.drone.dead) af.drone = makeDrone();
      const still = now < af.stillUntil;
      if (!still) setT(af.drone, 'g', af.drone.g.gain, af.droneTarget * 0.06 * (ctx.paused === true ? 0.5 : 1), 0.9);   // still: afDroneGate holds it
      setT(af.drone, 'c', af.drone.flt.frequency, 200 + 240 * clamp(af.droneTarget, 0, 1.5), 0.8, 0.01);
      af.droneIdle = 0;
    } else if (af.drone) {
      setT(af.drone, 'g', af.drone.g.gain, 0, 0.5);
      af.droneIdle += dt;
      if (af.droneIdle > 2.5) af.drone = killLoop(af.drone);
    }
  }

  // ---------------------------------------------------------------- v3 the Landing and the First Evening (FE-Au1)
  const HEARTH = { x: -18, z: -4.5 };
  function coveEnter(p) {
    cove.active = true; cove.from = p.from || null;
    cove.breathT = 1.2; cove.bellT = 6 + Math.random() * 4;
    if (p.from === 'snuffed') { resetScratch(); scratch.volume = 0.5; scratch.pitch = 0.85; play('snuff', scratch); }
    moodTimer = 0.5;
  }
  function coveLeave() {
    cove.active = false; cove.from = null;
    fe.emberDue = null; fe.emberDone = true; fe.step = null;
    coveKill();
  }
  function coveKill() {
    cove.fire = killLoop(cove.fire); cove.roar = killLoop(cove.roar); cove.lap = killLoop(cove.lap);
    if (cove.pan) { const pn = cove.pan; cove.pan = null; setTimeout(() => { try { pn.disconnect(); } catch { /* ignore */ } }, 500); }
  }
  /** The cove bed: the hearth (crackle and a low roar, placed at the hearth), the water at the quay, its breaths, a far bell. */
  function coveContinuous(dt, flow) {
    const lvl = cove.active ? V3.coveBedLevel(flow, { paused: ctx.paused === true || isBlocking() }) : 0;
    if (lvl <= 0) {
      if (cove.fire || cove.lap || cove.roar) {
        for (const l of [cove.fire, cove.roar, cove.lap]) if (l) setT(l, 'g', l.g.gain, 0, 0.6);
        cove.idle += dt;
        if (cove.idle > 2.5) coveKill();
      }
      return;
    }
    cove.idle = 0;
    if (!cove.pan) {
      cove.pan = ac.createStereoPanner ? ac.createStereoPanner() : ac.createGain();
      cove.pan.connect(N.sfxDry);
    }
    if (!cove.fire) cove.fire = makeNoiseLoop('crackle', 'bandpass', 2100, 0.6, cove.pan);
    if (!cove.roar) cove.roar = makeNoiseLoop('brown', 'lowpass', 260, 0.7, cove.pan);
    if (!cove.lap) {
      cove.lap = makeNoiseLoop('pink', 'bandpass', 430, 1.1, N.sfxDry);
      cove.lap.lfo = ac.createOscillator(); cove.lap.lfo.frequency.value = 0.21;
      cove.lap.lg = ac.createGain(); cove.lap.lg.gain.value = 140;
      cove.lap.lfo.connect(cove.lap.lg); cove.lap.lg.connect(cove.lap.flt.frequency); cove.lap.lfo.start();
    }
    // the bed rises under the first lore line (FIRST_EVENING framing) and settles
    const rise = clamp((ac.currentTime - cove.risenAt) / 3, 0, 1);
    const k = lvl * (fe.step === 'framing' ? 0.45 + 0.55 * rise : 1);
    const o = { pan: 0 };
    const hg = spatial(HEARTH, o);
    if (cove.pan.pan) setT(cove, 'pan', cove.pan.pan, o.pan, 0.4, 0.01);
    cove.flickT -= dt;
    if (cove.flickT <= 0) { cove.flickT = 0.18 + Math.random() * 0.35; cove.flick = 0.75 + Math.random() * 0.5; }
    setT(cove.fire, 'g', cove.fire.g.gain, 0.09 * k * hg * (cove.flick || 1), 0.15, 0.01);
    setT(cove.roar, 'g', cove.roar.g.gain, 0.05 * k * hg * (0.8 + 0.2 * (cove.flick || 1)), 0.3, 0.01);
    setT(cove.lap, 'g', cove.lap.g.gain, 0.04 * k, 0.8);
    cove.breathT -= dt;
    if (cove.breathT <= 0) {
      resetScratch(); scratch.pan = (Math.random() * 2 - 1) * 0.5; scratch.volume = (0.55 + 0.45 * Math.random()) * k;
      play('cove_ambience', scratch);
      cove.breathT = 2.8 + Math.random() * 3.6;
    }
    cove.bellT -= dt;
    if (cove.bellT <= 0) {
      resetScratch(); scratch.pan = 0.25; scratch.volume = 0.8 * k;
      play('cove_bell_far', scratch);
      cove.bellT = 26 + Math.random() * 18;
    }
  }
  function murkPan(o) {
    const m = ctx.actors?.merchant?.position;
    if (m && typeof m.x === 'number') return spatial(m, o);
    if (cove.active) return spatial({ x: 4, z: -6.5 }, o);
    o.pan = 0; return 1;
  }
  function playEmber() {
    if (fe.emberDone) return;
    fe.emberDone = true; fe.emberDue = null;
    resetScratch(); scratch.volume = 0.9; scratch.pan = 0; scratch.why = 'ember';
    play('ember_swell', scratch);
  }
  function feTick() {
    if (fe.emberDue !== null && !fe.emberDone && gameT() >= fe.emberDue) playEmber();
  }
  function feStep(p) {
    fe.step = p.id || null;
    if (p.id === 'framing') { fe.emberDue = gameT() + V3.emberAt(ctx.data); fe.emberDone = false; cove.risenAt = ac.currentTime; }
    else if (p.id === 'wake' && p.prev === 'framing') { resetScratch(); scratch.why = 'wake'; scratch.volume = 0.9; play('flame_catch', scratch); }
    else if (p.id === 'setout') { resetScratch(); scratch.why = 'flare'; scratch.volume = 0.7; play('flame_catch', { ...scratch, flare: true }); }
    if (p.id !== 'framing' && fe.emberDue !== null) { fe.emberDue = null; fe.emberDone = true; }
  }
  function feLine(p) {
    if (p.kind !== 'murk' || typeof p.text !== 'string' || !p.text) return;
    const o = { pan: 0 };
    const g = murkPan(o);
    play('murk_grumble', { plan: V3.grumblePlan(p.text, p.key || ''), why: p.key || 'murk', pan: o.pan * 0.6, volume: 0.75 + 0.25 * g, force: true });
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
    for (const k of ['o', 'lfo', 's', 'o2']) { try { l[k]?.stop(stopAt); } catch { /* ignore */ } }
    const src = l.o || l.s;
    if (src) src.onended = () => { for (const k of ['o', 'flt', 'g', 'lfo', 'lg', 's', 'hp', 'hg', 'o2']) { try { l[k]?.disconnect(); } catch { /* ignore */ } } };
    return null;
  }
  function stopContinuous() {
    strain = killLoop(strain); charge = killLoop(charge); aura = killLoop(aura); bed = killLoop(bed);
    af.hum = killLoop(af.hum); af.drone = killLoop(af.drone);
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
    // v3: the Landing (flow hub) is a live world too: sailing, casting and the First Evening's play (no run there)
    const liveW = live || (flow === 'hub' && ctx.paused !== true && num(ctx.time?.gameDt) > 0);
    const sp = liveW ? num(ctx.player?.speed) : 0;
    const maxSp = Math.max(1, num(st?.moveSpeed, 6));
    const spFrac = clamp(sp / maxSp, 0, 1.2);
    if (!water && (flow === 'playing' || flow === 'title' || flow === 'hub')) {
      water = makeNoiseLoop('pink', 'bandpass', 620, 0.9, N.sfxDry);
      water.lfo = ac.createOscillator(); water.lfo.frequency.value = 0.13;
      water.lg = ac.createGain(); water.lg.gain.value = 240;
      water.lfo.connect(water.lg); water.lg.connect(water.flt.frequency); water.lfo.start();
    }
    if (water) {
      const tgt = ((flow === 'playing' || flow === 'title' || flow === 'hub') ? 0.022 + 0.09 * Math.min(1, spFrac) : 0.0) * (now < af.stillUntil ? 0.18 : 1);   // v3: hushed in the still
      setT(water, 'g', water.g.gain, tgt, 0.4);
      setT(water, 'f', water.flt.frequency, 560 + 600 * Math.min(1, spFrac), 0.3, 0.01);
    }

    // --- paddle splashes when sailing fast
    const anchored = ctx.player?.anchored === true;
    if (liveW && spFrac > 0.45 && !anchored) {
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
    const reeling = live && (fs === 'reeling' || fs === 'landing') && !af.cls;   // v3: an automatic play has its own layers
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

    if (liveW && fs === 'charging' && fv) {
      const c = clamp(num(fv.charge));
      if (!charge) { charge = makeOscLoop('triangle', 220, 'lowpass', 900, 0.7, N.sfxDry); charge.lg.gain.value = 3; }
      setT(charge, 'g', charge.g.gain, 0.025 + 0.03 * c, 0.03);
      setT(charge, 'o', charge.o.frequency, 170 + 420 * c, 0.025, 0.003);
      const cleanAt = num(fv.cleanAt, num(ctx.data?.BALANCE?.cast?.cleanAt, 0.92));   // v3: fishing's view (Quiet Hands)
      const clean = c >= cleanAt;
      if (clean && !wasClean) play('charge_ping');
      wasClean = clean;
    } else if (charge) { charge = killLoop(charge); wasClean = false; }

    // --- v3: the Stillnight bed (night air, far frogs, reed crickets) under the stillnight score; like the water bed the
    // air keeps on under a modal or the pause (softer), the frogs and crickets only while the night runs
    if (flow === 'playing' && !!run && music.mood === 'stillnight') {
      if (!bed) bed = makeNoiseLoop('brown', 'lowpass', 340, 0.6, N.sfxDry);
      setT(bed, 'g', bed.g.gain, live ? 0.035 : 0.018, 1.2);
      bedIdle = 0;
      if (live) bedTimer -= dt;
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

    // --- v3: the automatic play's hum and drone, the Landing's bed
    afContinuous(dt, flow, fs, fv);
    coveContinuous(dt, flow);

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
    // v3 automatic play: the score by class (null / 0 / false outside one, so v1's reel is untouched)
    const am = af.cls && af.music && (af.active || fishState() === 'reeling' || fishState() === 'landing') ? af.music : null;
    P.reelLevel = am && am.mood === 'reel' ? am.level : null;
    P.pulse = am ? am.pulse : 0;
    P.heart = !!(am && am.heart);
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
    const h = (p) => { if (!unlocked || !ac) return; try { fn(p || EMPTY); } catch (e) { report(evt, e); } };
    (handlers[evt] || (handlers[evt] = [])).push(h);
    ctx.bus?.on?.(evt, h);
  }
  function wire() {
    // fishing
    on('fishing:cast', (p) => { afReset(); resetScratch(); scratch.power = num(p.power, 0.7); play('cast_whoosh', scratch); });
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
    on('fishing:hook', (p) => {
      if (typeof p.grade === 'string') return;   // v3: fishing:strike already rang the strike
      resetScratch(); scratch.perfect = !!p.perfect; play('hook', scratch);
    });
    on('fishing:miss', (p) => {
      resetScratch(); scratch.pan = bobberPan();
      if (p.reason === 'passed') { scratch.volume = 0.8; play('bite_pass', scratch); return; }   // v3: let it pass
      if (p.reason === 'early' || p.reason === 'spooked') { scratch.volume = 0.6; play('denied', scratch); } else { scratch.volume = 0.7; play('splash_small', scratch); }
    });
    on('fishing:surge', (p) => {
      resetScratch(); scratch.pan = bobberPan(); scratch.volume = 0.5 + 0.4 * clamp(num(p.strength, 1) / 1.5);
      play('splash_big', scratch); play('line_strain', scratch);
    });
    on('fishing:caught', (p) => {
      afCaught(p);
      resetScratch(); scratch.pan = bobberPan(); play('splash_big', scratch);
      // v3: the Fish's final length for the measuring cord (fishing:caught + {fish, z, sizeClass, ancient, length, favours})
      if (typeof p.sizeClass === 'string' && num(p.length) > 0) {
        catchInfo = { speciesId: p.speciesId ?? null, sizeClass: p.sizeClass, ancient: !!p.ancient, length: num(p.length), zone: p.zone ?? ctx.state?.run?.zone ?? null,
          key: p.fish?.uid ?? `${p.speciesId}:${p.length}`, at: ac.currentTime };
      }
    });
    on('fishing:escaped', (p) => {
      const lossName = V3.lossSfx(p.reason);
      if (lossName) { afLoss(p, lossName); return; }   // v3 causes; v1's 'snap' / 'slack' below
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
      tell = { name, why: p.biteTell, at: gameT() + V3.tellDelay(p.biteTell, p.lead, ctx.data, p.dur), played: false };
      tellTick();
    });
    on('fishing:state', (p) => {
      if (tell && p.state !== 'waiting' && p.state !== 'bite') dropTell();
      if (p.state === 'idle' || p.state === 'charging' || p.state === 'casting') afReset();
    });
    // ---- v3 automatic fishing (Au2): the strike, the play's beats (no species on any of them before the reveal)
    on('fishing:strike', (p) => afStrike(p));
    on('fishing:landing', (p) => landSwell(p));
    on('fishing:reel', (p) => afBeat(p));
    on('fish:escaped', (p) => {
      // the got-away note (after the quiet beat): the card (Trophy and bigger) gets two low ink notes
      const big = p.legendary === true || p.ancient === true || p.sizeClass === 'trophy' || p.sizeClass === 'elder';
      if (big && ctx.data?.V3_ENABLED === true) { resetScratch(); scratch.root = zoneRoot(); scratch.why = p.sizeClass || 'legend'; play('gotaway', scratch); }
    });
    // ---- v3 the First Evening (FE-Au1)
    on('firstEvening:step', (p) => feStep(p));
    on('firstEvening:beat', (p) => { if (p.id === 'ember') playEmber(); });
    on('firstEvening:line', (p) => feLine(p));
    // an Elder's old trick (fishing:surge {trick} already plays the splash and strain) gets a low warning swell
    on('fishing:oldTrick', () => { resetScratch(); scratch.pan = bobberPan(); scratch.pitch = 0.72; scratch.volume = 0.9; play('surge_warn', scratch); });
    // a legend snag (Still / Lantern Grasping Dark): the 1 s telegraph, then the strain of the +0.2 spike
    on('fishing:snag', (p) => {
      resetScratch(); scratch.pan = bobberPan();
      if (p.state === 'warn') { scratch.pitch = 0.6; play('surge_warn', scratch); } else { scratch.volume = 0.9; play('line_strain', scratch); }
    });
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
        delay = plan && cord ? Math.max(0, cord.end + 0.04 - ac.currentTime) : 0;
      }
      resetScratch(); scratch.seal = seal; scratch.ancient = V3.goldThread({ ancient: p.ancient, legendary }); scratch.force = true;
      if (delay > 0) scratch.at = ac.currentTime + delay; else scratch.delay = 0;
      if (!seal) scratch.why = p.sizeClass || null;
      play('seal_stamp', scratch);
      if (seal === 'blackWaxRibbon') duck(0.6, 0.9 + delay);
      stampAt = ac.currentTime + delay;
      catchInfo = null;
      if (Array.isArray(p.records) && p.records.some((r) => r && r.kind === 'oldLedger')) { resetScratch(); scratch.delay = delay + 0.9; play('murk_bell_far', scratch); }
      // a personal best or a class first: a brighter figure just after the seal (the landing's record chime)
      if (Array.isArray(p.records) && p.records.some((r) => r && (r.kind === 'pb' || r.kind === 'classFirst'))) { resetScratch(); scratch.delay = delay + 0.28; scratch.force = true; play('record_chime', scratch); }
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
    on('zone:change', (p) => {
      // v3 (CONTRACT §13.3): the hub is entered with no sting (the cove bed starts); leaving the cove plays `setout`, never
      // `descend`; a Continue rings nothing. v1 (no hub, no cove): `descend` whenever there is a prev, as before.
      if (p.hub) { coveEnter(p); return; }
      if (cove.active) coveLeave();
      const sting = V3.zoneSting(p);
      if (!sting) return;
      stopContinuous();
      if (sting === 'setout') { resetScratch(); scratch.root = ZONE_MUSIC[p.zone]?.root ?? zoneRoot(); scratch.why = p.zone || null; play('setout', scratch); }
      else play('descend');
    });
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
        time: ac ? ac.currentTime : 0,
        mood: music?.mood || null,
        zone: music?.zone || null,
        voices: eng ? eng.active : 0,
        musicVoices: eng ? (eng.tags.m || 0) : 0,
        layers: music ? music.layers.length : 0,
        rms: measureRms(),
        forced,
        intensity: music ? +music.params.intensity.toFixed(3) : 0,
        played, last: lastName,
        loops: { strain: !!strain && !strain.dead, charge: !!charge && !charge.dead, aura: !!aura && !aura.dead, water: !!water, bed: !!bed && !bed.dead && (bed._g ?? 0) > 0,
          hum: !!af.hum && !af.hum.dead, drone: !!af.drone && !af.drone.dead, cove: !!cove.fire && !cove.fire.dead },
        auto: unlocked ? autoMood() : null,
        nightMode: nightMode(),
        cord: cord ? { ticks: cord.ticks, chimes: cord.chimes.slice(), end: cord.end, compact: !!cord.compact, active: !!ac && ac.currentTime < cord.end } : null,
        play: af.cls ? { active: af.active, cls: af.cls, mood: af.music?.mood ?? null } : null,
        cove: { active: cove.active, from: cove.from, bed: !!(cove.fire && !cove.fire.dead && (cove.fire._g ?? 0) > 0), step: fe.step },
      });
      // v3 (Au2): the automatic play as audio hears it — class, class length, tier, the score, the hum and drone, the beats
      ctx.debug.audioPlay = () => {
        const now = ac ? ac.currentTime : 0;
        return {
          active: af.active, cls: af.cls, legend: af.legend, tier: af.tier, len: r3(af.len), k: r3(V3.lengthK(af.len)),
          music: af.music ? { ...af.music } : null, mood: music?.mood || null,
          params: music ? { reelLevel: music.params.reelLevel, pulse: music.params.pulse, heart: music.params.heart } : null,
          hum: { on: !!af.hum && !af.hum.dead, level: r3(num(af.hum?._g, 0)), freq: r3(num(af.hum?._o, 0)), muted: now < af.humMuteUntil, target: af.humTarget },
          drone: { on: !!af.drone && !af.drone.dead, level: r3(num(af.drone?._g, 0)), target: af.droneTarget },
          still: now < af.stillUntil, duck: r3((now < duckUntil ? duckAmt : 1) * (now < af.stillUntil ? STILL_DUCK : 1)), held: af.held.length, strain: af.strain ?? null, beats: af.beats.map((b) => ({ ...b })),
        };
      };
      // test tooling: drive audio's own listeners with an event, without the rest of the game hearing it
      ctx.debug.audioEvent = (evt, payload = {}) => { const hs = handlers[evt] || []; for (const h of hs) h(payload); return hs.length; };
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
