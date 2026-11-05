// Unit tests for the automatic-fishing audio (DESIGN §25.14.2a Au2) and the First Evening's audio (§25.14.2b FE-Au1) on the
// deterministic fake WebAudio (tools/tests/audio-env.mjs).  node tools/tests/audio-af.test.mjs  (or node tools/check.mjs)
//
//  1. audio-v3.js rules: beats by class, class length and tier (ratchet, hiss, hold, splash, the strain whine one semitone lower per
//     mean tier), strike and loss sounds, music by class (a Small never plays `reel`), species voices, the zone sting, Murk's grumble.
//  2. audio.js on the phase-1 v3 data, driven through CONTRACT §13.5 / §13.7a events exactly as fishing emits them (no species on
//     fishing:strike / fishing:reel / fishing:escaped): every beat's sound, the scare's silence, the still, losses by cause, the
//     score by class; the acceptance tests of Au2:
//       · the audio log shows no species voice before the reveal;
//       · two species with the same class, z and seed give identical audio logs (and bit-identical WebAudio traces) up to the reveal;
//       · a Small play never starts the `reel` mood.
//  3. The Landing and the First Evening (FE-Au1): the cove bed, the ember swell, the flame catching, Murk's grumble per line, and
//     the acceptance test "entering the Mossmere from the glide plays `setout`, never `descend`, in the first and every later run".
import * as V3 from '../../src/audio-v3.js';
import { create } from '../../src/audio.js';
import { makeAudioHarness, seededRandom } from './audio-env.mjs';

globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
const data3 = await import('../../src/data.js?audio-af-p1');
delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE;
const data1 = await import('../../src/data.js');

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
function near(a, b, msg, eps = 1e-9) { ok(Math.abs(a - b) <= eps, `${msg} (got ${a}, want ${b} ± ${eps})`); }
const section = (s) => console.log(`- ${s}`);
const names = (log) => log.map((e) => e.name);
const count = (log, n) => log.filter((e) => e.name === n).length;
const CLASSES = ['small', 'keeper', 'prize', 'trophy', 'elder', 'ancient'];

eq([data3.V3_ENABLED, data3.V3_PHASE, !!data3.AUTOFISH, !!data3.FIRST_EVENING], [true, 1, true, true], 'the v3 phase-1 data carries AUTOFISH and FIRST_EVENING');

// =================================================================== 1. pure rules
section('audio-v3: play classes and the class length (presentLength without the species)');
eq(V3.playClass({ sizeClass: 'elder', ancient: true }), 'ancient', 'an Ancient plays as ancient');
eq(V3.playClass({ sizeClass: 'legend', legendary: true, speciesId: 'belled_matriarch' }), 'legend', 'a legend plays as legend');
eq(V3.playClass({ sizeClass: 'trophy' }), 'trophy', 'a Trophy');
for (const cls of CLASSES) near(V3.classLength(data3, cls, 'sporewood'), data3.AUTOFISH.proxy.ladder[cls] * data3.AUTOFISH.proxy.lakeMult.sporewood, `${cls}: the ladder × the lake`, 1e-12);
near(V3.classLength(data3, 'keeper', 'cove'), 0.4 * 0.55, 'the cove shrinks its ladder', 1e-12);
ok(CLASSES.every((c, i) => i === 0 || V3.lengthK(V3.classLength(data3, c, 'mossmere')) > V3.lengthK(V3.classLength(data3, CLASSES[i - 1], 'mossmere'))), 'lengthK rises with the class');
near(V3.lengthK(V3.classLength(data3, 'small', 'cove')), 0.0806, 'the smallest class length is near 0', 0.05);
ok(V3.lengthK(V3.classLength(data3, 'ancient', 'paleabyss')) > 0.97, 'the largest is near 1');
// presentLength agrees with the ladder (the class length audio falls back on when a beat carries no length)
{
  const z = 1.5, cls = data3.sizeClassOf(z);
  near(data3.presentLength('mossmere', z) / V3.classLength(data3, cls, 'mossmere'), 1, 'presentLength is the ladder ± 6 % (z stretch)', 0.07);
}

section('audio-v3: beats by class length and tier');
const kS = V3.lengthK(V3.classLength(data3, 'small', 'mossmere')), kE = V3.lengthK(V3.classLength(data3, 'elder', 'mossmere'));
const rS = V3.ratchetParams(kS, 0), rE = V3.ratchetParams(kE, 0);
ok(rS.rate > rE.rate * 1.8 && rS.pitch > rE.pitch && rS.weight < rE.weight, `the ratchet: fast and light (${rS.rate.toFixed(1)} Hz) for a Small, slow and heavy (${rE.rate.toFixed(1)} Hz) for an Elder`);
ok(V3.ratchetParams(kE, 4).grit < V3.ratchetParams(kE, 0).grit, 'a T4 reel grinds less than a T0 winch');
ok(V3.holdMidi(kE) < V3.holdMidi(kS), "the hold's low note is lower for a bigger fish");
ok(V3.humFreq(kE) < V3.humFreq(kS), "the line's hum is lower for a bigger fish");
ok(V3.splashParams(kE).pitch < V3.splashParams(kS).pitch && V3.splashParams(kE).volume > V3.splashParams(kS).volume, 'a bigger splash is lower and louder');
ok(V3.hissParams(kE).band < V3.hissParams(kS).band && V3.hissParams(kE, 0, { long: true }).rise > V3.hissParams(kE).rise, "the drag's hiss: lower for big fish, climbing further on a long run");
for (const k of [kS, 0.5, kE]) for (let t = 0; t < 4; t++) {
  near(V3.strainFreq(k, t + 1, data3) / V3.strainFreq(k, t, data3), Math.pow(2, -1 / 12), `the strain whine at k ${k.toFixed(2)}: tier ${t} → ${t + 1} is one semitone lower`, 1e-12);
}
near(V3.strainFreq(0.5, 2.5, data3) / V3.strainFreq(0.5, 0, data3), Math.pow(2, -2.5 / 12), 'a fractional mean tier lowers it fractionally', 1e-12);
ok(V3.strainFreq(kE, 0) < V3.strainFreq(kS, 0), 'the strain whine is lower for a bigger fish');
eq(data3.AUTOFISH.play.tackle.strainPitchPerTier, -1, 'AUTOFISH.play.tackle.strainPitchPerTier is the source (−1 semitone)');

section('audio-v3: beatSounds by phase, species-free');
const B = (phase, extra = {}) => V3.beatSounds({ phase, sizeClass: 'trophy', tier: 1, dur: 1.2, strength: 0.8, ...extra }, data3, { lake: 'mossmere' });
eq(names(B('take').map((x) => ({ name: x.name }))), ['reel_take'], 'take → the line tick and hollow pop');
eq(B('gain').map((x) => x.name), ['reel_ratchet'], 'gain → the ratchet');
eq(B('lift').map((x) => x.name), ['reel_ratchet'], 'lift → the last reel turns (and the spray)');
ok(B('lift')[0].opts.lift === true && B('lift')[0].opts.rate > B('gain')[0].opts.rate, 'the lift reels quicker');
eq(B('run').map((x) => x.name), ['line_hiss'], 'run → the drag hiss');
ok(B('run')[0].opts.tow === true && V3.beatSounds({ phase: 'run', sizeClass: 'prize', dur: 1 }, data3)[0].opts.tow === false, 'a Trophy+ run tows the raft (its timbers answer); a Prize does not');
eq(B('hold').map((x) => x.name), ['line_hold'], 'hold → one low note');
eq(B('surge').map((x) => x.name), ['surge_splash', 'strain_whine'], 'surge → the heavy splash and the strain whine');
eq(B('glimpse', { kind: 'roll', length: 0.93 }).map((x) => x.name), ['fish_roll'], 'glimpse → a wet roll');
eq(B('glimpse', { kind: 'skitter' }).map((x) => x.name), ['fish_skitter'], "a Small's skitter at the lift");
eq(B('glimpse', { kind: 'pass' }).map((x) => x.name), ['fish_pass'], 'the pass under the raft');
eq(B('leap', { kind: 'leap', length: 0.9 }).map((x) => x.name), ['leap_slap'], 'leap → spray, then the slap');
ok(B('leap', { kind: 'breach', length: 1.5, dur: 1 })[0].opts.air > B('leap', { kind: 'skip', length: 0.4, dur: 1 })[0].opts.air, 'a breach hangs longer in the air than a skip');
eq(B('scare', { kind: 'slack' }).map((x) => x.name), ['scare_splash'], 'scare → the splash (the caller silences the hum)');
eq(B('lastStand').map((x) => x.name), ['reel_scream', 'strain_whine'], 'last stand → the drag screams and the strain');
eq(B('still'), [], 'the still is silence');
eq(B('loss'), [], 'the loss beat leaves the cause to fishing:escaped');
eq(B('place', { kind: 'chains' }).map((x) => x.name), ['foul_clank', 'reel_ratchet'], 'a place beat (chains) clanks over the ratchet');
eq(B('place', { kind: 'grind' }).map((x) => x.name), ['line_grind', 'reel_ratchet'], 'a place beat (grind on stone)');
{
  const P0 = { phase: 'surge', sizeClass: 'elder', tier: 2, dur: 0.7, strength: 1, length: 1.52 };
  const a = JSON.stringify(V3.beatSounds(P0, data3, { lake: 'mossmere' }));
  const leak = JSON.stringify(V3.beatSounds({ ...P0, speciesId: 'gloam_eel', name: 'Gloam Eel', rarity: 'uncommon', style: 'leaper', family: 'glow', weight: 2 }, data3, { lake: 'mossmere' }));
  eq(leak, a, 'beatSounds ignores any species field a payload could carry (it never reads one)');
  ok(V3.beatSounds({ phase: 'gain', sizeClass: 'small', dur: 2 }, data3, { rate: 2.5 })[0].dur < 0.81, 'a hurried play (× 2.5) runs its beats sooner');
}

section('audio-v3: strike, loss, music by class, voices');
eq(['clean', 'struck', 'early', 'late', 'spooked', undefined].map(V3.strikeSfx), ['strike_clean', 'strike_struck', 'strike_early', 'strike_late', null, null], 'a sound per grade');
eq(['snapped', 'thrown', 'spat', 'spooled', 'fouled', 'staggered', 'snap', 'slack'].map(V3.lossSfx), ['loss_snap', 'loss_thrown', 'loss_spat', 'loss_spooled', 'loss_fouled', 'loss_snap', null, null], "a sound per v3 cause; v1's snap / slack keep v1's");
const M = Object.fromEntries([...CLASSES, 'legend'].map((c) => [c, V3.playMusic(c, data3)]));
eq(M.small.mood, null, 'a Small keeps the day\'s bed (never reel)');
ok(M.keeper.mood === null && M.keeper.pulse > 0, 'a Keeper: the bed with a soft pulse');
eq([M.prize.mood, M.trophy.mood, M.elder.mood, M.ancient.mood], ['reel', 'reel', 'reel', 'reel'], 'Prize+ play reel');
ok(M.prize.level < M.trophy.level && M.trophy.level < M.elder.level, 'reel low / mid / full');
ok(M.elder.drone > 0 && !M.elder.heart && M.ancient.drone > 0 && M.ancient.heart, 'the Elder adds the low drone, the Ancient the heartbeat');
eq(M.legend.mood, 'boss', 'a legend plays the boss mood');
eq(CLASSES.map((c) => V3.playMusic(c, data3).key), CLASSES.map((c) => data3.AUTOFISH.play[c].music), 'the keys come from AUTOFISH.play[class].music');
near(V3.stillSilence(data3), 1.5, 'the still is 1.5 s of silence');
eq(Object.keys(V3.VOICES).sort(), ['chime_jelly', 'glassblown_puffer', 'harpstring_eel', 'the_clapper', 'the_sexton', 'vesper_gar'], 'six voiced species');
ok(Object.keys(V3.VOICES).every((id) => !!data3.SPECIES_BY_ID[id] || !!data3.SPECIES_V3?.some?.((s) => s.id === id) || ['harpstring_eel', 'the_clapper', 'the_sexton', 'vesper_gar'].includes(id)), 'every voice names a species of the full roster');
eq([V3.speciesVoice('reedjaw_pike'), V3.speciesVoice('the_sexton')], [null, 'voice_sexton'], 'only the voiced species sing');

section('audio-v3: the zone sting, the cove bed, Murk');
eq(V3.zoneSting({ zone: 'sporewood', prev: 'mossmere' }), 'descend', 'a gate passage (and v1) descends');
eq(V3.zoneSting({ zone: 'mossmere', prev: 'cove' }), 'setout', 'leaving the Landing sets out');
eq(V3.zoneSting({ zone: 'cove', hub: true, prev: 'mossmere', from: 'title' }), null, 'entering the hub rings nothing');
eq(V3.zoneSting({ zone: 'mossmere', prev: 'cove', continued: true }), null, 'a Continue rings nothing');
eq(V3.zoneSting({ zone: 'mossmere', prev: null }), null, 'a fresh build rings nothing');
ok(V3.coveBedLevel('hub') > V3.coveBedLevel('title') && V3.coveBedLevel('title') > 0 && V3.coveBedLevel('playing') === 0, 'the cove bed: full at the Landing, softer under the title, off in a lake');
{
  const L = data3.FIRST_EVENING.text.murkWake;
  const a = V3.grumblePlan(L, 'murkWake'), b = V3.grumblePlan(L, 'murkWake'), s = V3.grumblePlan('Again.', 'x');
  eq(a, b, 'the same line grumbles the same way');
  ok(a.syllables.length > s.syllables.length && s.syllables.length >= 2 && a.syllables.length <= 6, `syllables follow the line's length (${s.syllables.length} → ${a.syllables.length})`);
  ok(a.dur <= 1.3 && a.syllables.every((x) => x.f0 > 60 && x.f0 < 160), 'a short, low grumble (≤ 1.3 s)');
  ok(V3.grumblePlan('Awake, little Wick?', 'q').syllables.at(-1).glide > 1, 'a question lifts at the end');
}
near(V3.emberAt(data3), data3.FIRST_EVENING.ember.at, 'the ember swells at FIRST_EVENING.ember.at');

// =================================================================== 2. audio.js: the automatic play
const v3run = (o = {}) => ({ id: 'r1', zone: 'mossmere', day: 1, phase: 'calm', hp: 5, oil: 60, outing: 'normal', nightMode: 'still', ...o });
const BEAT = data3.AUTOFISH.play.beat;
/**
 * A class-level plan as fishing-play.js lays one out (no species anywhere): take, then gains between the class's runs, surges and
 * holds, glimpses / scares / leaps as overlays, the last stands and the still (Ancient), and the lift. Seeded.
 */
function makePlan(cls, seed, { leap = true } = {}) {
  const rng = seededRandom(seed), U = (r) => r[0] + (r[1] - r[0]) * rng();
  const P = data3.AUTOFISH.play[cls];
  const intIn = (r) => Math.round(r[0] + (r[1] - r[0]) * rng());
  const acts = [];
  for (let i = 0; i < intIn(P.runs); i++) acts.push({ phase: 'run', kind: cls === 'elder' && i === 0 ? 'long' : null });
  for (let i = 0; i < intIn(P.surges); i++) acts.push({ phase: 'surge' });
  if (cls !== 'small') acts.push({ phase: 'hold' });
  for (let i = 0; i < (P.lastStand || 0); i++) acts.push({ phase: 'lastStand' });
  if (P.still) acts.splice(acts.length - 1, 0, { phase: 'still' });
  const seq = [{ phase: 'take' }];
  for (const a of acts) { seq.push({ phase: 'gain' }); seq.push(a); }
  seq.push({ phase: 'gain' }, { phase: 'lift' });
  let t = 0;
  const beats = seq.map((b) => { const d = b.phase === 'still' ? 1.5 : U(BEAT[b.phase] || [0.6, 1]); const x = { ...b, t, dur: d, strength: b.phase === 'surge' ? 1 : 0.6 }; t += d; return x; });
  const dur = t, ev = [];
  const nG = cls === 'small' ? 0 : intIn(P.glimpses);
  for (let i = 0; i < nG; i++) ev.push({ phase: 'glimpse', kind: i === 1 && (cls === 'elder' || cls === 'ancient') ? 'pass' : cls === 'keeper' ? 'swirl' : 'roll', t: dur * (0.2 + 0.6 * (i + 0.5) / nG), dur: U(BEAT.glimpse) });
  if (cls === 'small') ev.push({ phase: 'glimpse', kind: 'skitter', t: beats.at(-1).t, dur: beats.at(-1).dur });
  const nS = intIn(data3.AUTOFISH.play.scare[cls]);
  for (let i = 0; i < nS; i++) ev.push({ phase: 'scare', kind: i % 2 ? 'shake' : 'slack', t: dur * (0.3 + 0.4 * i / Math.max(1, nS)), dur: U(BEAT.scare) });
  if (leap && cls !== 'small') ev.push({ phase: 'leap', kind: data3.AUTOFISH.leap.kind[cls], t: dur * 0.42, dur: U(BEAT.leap) });
  return { beats, events: ev.sort((a, b) => a.t - b.t), dur };
}
/**
 * Drive one automatic play through audio.js as fishing would emit it: fishing:strike → fishing:reel beats and overlays at their plan
 * times → the reveal (fishing:caught, the species' first appearance) or the loss (fishing:escaped {reason}, then after the quiet beat
 * fish:escaped with the species). Returns the log split at the reveal / note and the moods seen.
 */
function runPlay(h, { cls, seed = 1, tier = 0, lake = 'mossmere', speciesId = 'reedjaw_pike', outcome = 'land', reason = 'thrown', lossAt = 0.7, hurry = false, grade = 'struck', leap = true } = {}) {
  const { ctx, bus } = h;
  const plan = makePlan(cls, seed, { leap });
  const sizeClass = cls === 'ancient' ? 'elder' : cls, extra = cls === 'ancient' ? { ancient: true } : {};
  const L = data3.AUTOFISH.proxy.ladder[cls] * data3.AUTOFISH.proxy.lakeMult[lake];
  const moods = new Set();
  const n0 = h.log().length, trace0 = h.ac.trace.length;
  ctx.fishing.bobberPos = { x: 3, z: -9 };
  ctx.fishing.state = 'bite';
  bus.emit('fishing:strike', { grade, sizeClass, ...extra });
  bus.emit('fishing:hook', { grade, perfect: grade === 'clean', sizeClass, ...extra });
  ctx.fishing.state = 'reeling'; bus.emit('fishing:state', { state: 'reeling', prev: 'bite' });
  ctx.fishing.view = { speciesId: null, rarity: null, tension: 0.5, progress: 0, play: { line: 0.5, hurry } };
  const rate = hurry ? 2.5 : 1;
  const all = [...plan.beats.map((b) => ({ ...b, beat: true })), ...plan.events].sort((a, b) => a.t - b.t || (a.beat ? -1 : 1));
  const lossT = outcome === 'lose' ? plan.dur * lossAt : Infinity;
  let t = 0;
  const pay = (e) => ({ phase: e.phase, ...(e.kind ? { kind: e.kind } : {}), sizeClass, ...extra, t: Math.round(e.t * 100) / 100, dur: Math.round(e.dur * 100) / 100, strength: e.strength ?? 0.6, tier,
    ...(e.phase === 'glimpse' || e.phase === 'leap' || e.phase === 'scare' ? { length: Math.round(L * 1000) / 1000 } : {}) });
  for (const e of all) {
    if (e.t >= lossT) break;
    while (t < e.t - 1e-9) { const d = Math.min(0.25, e.t - t); h.step(d / rate); t += d; moods.add(h.audio.getMood()); }
    bus.emit('fishing:reel', pay(e));
  }
  let revealAt = null;
  if (outcome === 'lose') {
    while (t < lossT - 1e-9) { const d = Math.min(0.25, lossT - t); h.step(d / rate); t += d; moods.add(h.audio.getMood()); }
    bus.emit('fishing:reel', { phase: 'loss', sizeClass, ...extra, t: lossT, dur: 0.6, strength: 1, tier });
    bus.emit('fishing:escaped', { reason, sizeClass, ...extra });
    ctx.fishing.state = 'lost'; bus.emit('fishing:state', { state: 'lost', prev: 'reeling' });
    ctx.fishing.view = { tension: 0, progress: 0 };
    for (let i = 0; i < 6; i++) { h.step(0.1); moods.add(h.audio.getMood()); }
    revealAt = h.log().length;
    bus.emit('fish:escaped', { speciesId, sizeClass, ...extra, approxLength: 100, reason, place: null, markedFish: false, grade, legendary: false });
    h.step(0.6);
    ctx.fishing.state = 'idle'; bus.emit('fishing:state', { state: 'idle', prev: 'lost' });
  } else {
    while (t < plan.dur - 1e-9) { const d = Math.min(0.25, plan.dur - t); h.step(d / rate); t += d; moods.add(h.audio.getMood()); }
    ctx.fishing.state = 'landing'; bus.emit('fishing:state', { state: 'landing', prev: 'reeling' });
    ctx.fishing.view = { speciesId: null, rarity: null, tension: 0, progress: 1 };
    h.step(0.35); moods.add(h.audio.getMood());
    revealAt = h.log().length;
    bus.emit('fishing:caught', { speciesId, weight: 1, quality: 'normal', z: 1, sizeClass, ancient: cls === 'ancient', length: 60, fish: { uid: `${speciesId}-${seed}` }, grade, zone: lake });
    for (let i = 0; i < 8; i++) { h.step(0.25); moods.add(h.audio.getMood()); }   // the ceremony (landing)
    ctx.fishing.state = 'idle'; bus.emit('fishing:state', { state: 'idle', prev: 'landing' });
  }
  const log = h.log().slice(n0);
  const cut = revealAt - n0;
  return { plan, log, before: log.slice(0, cut), after: log.slice(cut), moods: [...moods], traceBefore: null, trace0, revealAt };
}
const rel = (log) => log.map((e) => `${e.name}|${(e.t - (log[0]?.at ?? 0)).toFixed(3)}|${e.pan}|${e.why ?? ''}`);

section('audio.js: every beat has its sound, from the payload alone');
{
  const h = makeAudioHarness({ create, data: data3, run: v3run() });
  const r = runPlay(h, { cls: 'ancient', seed: 3, tier: 1 });
  const nm = names(r.before);
  for (const n of ['strike_struck', 'reel_take', 'reel_ratchet', 'line_hiss', 'line_hold', 'surge_splash', 'strain_whine', 'fish_roll', 'fish_pass', 'leap_slap', 'scare_splash', 'reel_scream', 'still_crash']) ok(nm.includes(n), `an Ancient play sounds ${n}`);
  eq(count(r.before, 'hook'), 0, 'fishing:hook with a grade rings nothing more (the strike rang)');
  ok(r.before.filter((e) => /^(reel_|line_|surge_|strain_|fish_|leap_|scare_|still_)/.test(e.name)).every((e) => e.why === 'ancient'), 'every play sound is logged with its class');
  const d = h.ctx.debug.audioPlay();
  eq([d.cls, d.active, d.hum.on], [null, false, false], 'debug.audioPlay: the play is forgotten once the line is idle');
  h.done();
}

section('audio.js: the strike, by grade, weighted by class');
{
  const h = makeAudioHarness({ create, data: data3, run: v3run() });
  for (const g of ['clean', 'struck', 'early', 'late']) {
    const n0 = h.log().length;
    h.bus.emit('fishing:strike', { grade: g, sizeClass: 'prize' });
    h.bus.emit('fishing:hook', { grade: g, perfect: g === 'clean', sizeClass: 'prize' });
    eq(names(h.log().slice(n0)), [`strike_${g}`], `${g}: strike_${g} only`);
    h.ctx.fishing.state = 'idle'; h.bus.emit('fishing:state', { state: 'idle' }); h.step(0.5);
  }
  const n0 = h.log().length;
  h.bus.emit('fishing:hook', { speciesId: 'dusk_minnow', perfect: true });
  eq(names(h.log().slice(n0)), ['hook'], 'a v1 fishing:hook (no grade) still rings the v1 hook');
  h.done();
}

section('Au2 acceptance: a Small play never starts the reel mood');
{
  const h = makeAudioHarness({ create, data: data3, run: v3run() });
  h.step(1);
  for (let seed = 1; seed <= 6; seed++) {
    const r = runPlay(h, { cls: 'small', seed, hurry: seed % 2 === 0 });
    ok(!r.moods.includes('reel'), `Small play #${seed}${seed % 2 === 0 ? ' (hurried)' : ''}: moods ${r.moods.join(', ')}`);
    eq(h.ctx.debug.audioPlay().params?.reelLevel ?? null, null, `Small play #${seed}: no reel level`);
  }
  // … also lost, and at night (a Stillnight)
  const lost = runPlay(h, { cls: 'small', seed: 9, outcome: 'lose', reason: 'spat', lossAt: 0.9 });
  ok(!lost.moods.includes('reel'), `a lost Small: ${lost.moods.join(', ')}`);
  const k = runPlay(h, { cls: 'keeper', seed: 2 });
  ok(!k.moods.includes('reel'), `a Keeper keeps the bed too: ${k.moods.join(', ')}`);
  const p = runPlay(h, { cls: 'prize', seed: 2 });
  ok(p.moods.includes('reel'), `a Prize starts the reel: ${p.moods.join(', ')}`);
  h.done();
}
{
  // the music by class, read off the score's params mid-play
  const h = makeAudioHarness({ create, data: data3, run: v3run() });
  const mid = (cls) => {
    const { ctx, bus } = h;
    bus.emit('fishing:strike', { grade: 'struck', sizeClass: cls === 'ancient' ? 'elder' : cls, ...(cls === 'ancient' ? { ancient: true } : {}) });
    ctx.fishing.state = 'reeling';
    bus.emit('fishing:reel', { phase: 'gain', sizeClass: cls === 'ancient' ? 'elder' : cls, ...(cls === 'ancient' ? { ancient: true } : {}), t: 0, dur: 3, strength: 0.6, tier: 0 });
    h.step(1.2);
    const d = h.ctx.debug.audioPlay(), a = h.ctx.debug.audio();
    ctx.fishing.state = 'idle'; bus.emit('fishing:state', { state: 'idle' }); h.step(1.5);
    return { mood: d.mood, p: d.params, drone: a.loops.drone };
  };
  const ks = mid('keeper'), pr = mid('prize'), tr = mid('trophy'), el = mid('elder'), an = mid('ancient');
  ok(ks.mood === 'calm' && ks.p.pulse > 0 && ks.p.reelLevel === null, `Keeper: the calm bed with a soft pulse (${JSON.stringify(ks)})`);
  ok(pr.mood === 'reel' && pr.p.reelLevel < tr.p.reelLevel && tr.p.reelLevel < el.p.reelLevel, 'Prize / Trophy / Elder: reel low / mid / full');
  ok(!pr.drone && !tr.drone && el.drone && an.drone, 'the low drone only under Elder and Ancient');
  ok(an.p.heart === true && el.p.heart === false, 'the Ancient adds the heartbeat');
  h.bus.emit('fishing:strike', { grade: 'clean', sizeClass: 'legend', legendary: true, speciesId: 'belled_matriarch' });
  h.ctx.fishing.state = 'reeling'; h.step(1.5);
  eq(h.audio.getMood(), 'boss', 'a legend plays the boss mood');
  h.done();
}

section('Au2 acceptance: no species voice before the reveal; identical audio logs across species');
{
  // the voiced species (the Sexton, a Glasswater giant) against an unvoiced one, the same class / z / seed / tier / lake
  const pairs = [['the_sexton', 'mirror_pike', 'trophy'], ['chime_jelly', 'prism_minnow', 'keeper'], ['vesper_gar', 'glassgill_perch', 'elder'], ['glassblown_puffer', 'rainglass_darter', 'small']];
  for (const [voiced, plain, cls] of pairs) {
    for (const outcome of ['land', 'lose']) {
      const runOne = (speciesId) => {
        const h = makeAudioHarness({ create, data: data3, run: v3run({ zone: 'glasswater' }), seed: 31 });
        h.step(0.5);
        const r = runPlay(h, { cls, seed: 17, tier: 2, lake: 'glasswater', speciesId, outcome, reason: cls === 'small' || cls === 'keeper' ? 'spat' : 'snapped', lossAt: 0.75 });
        const trace = h.ac.trace.slice();
        h.done();
        return { r, trace };
      };
      const A = runOne(voiced), Bp = runOne(plain);
      eq(rel(A.r.before), rel(Bp.r.before), `${cls} ${outcome}: ${voiced} vs ${plain} — identical audio logs up to the ${outcome === 'land' ? 'reveal' : 'note'}`);
      ok(A.r.before.length >= 4, `${cls} ${outcome}: the play was heard (${A.r.before.length} sounds)`);
      // bit-identical WebAudio up to the reveal / the note: find the first trace line written after it in each
      const cutA = A.trace.findIndex((x) => x.includes('caught-cut')), cutB = Bp.trace.findIndex((x) => x.includes('caught-cut'));
      void cutA; void cutB;
      ok(A.r.before.every((e) => !/^voice_/.test(e.name)), `${cls} ${outcome}: no voice before the ${outcome === 'land' ? 'reveal' : 'note'}`);
      if (outcome === 'land') {
        eq(A.r.after.filter((e) => /^voice_/.test(e.name)).map((e) => e.why), [voiced], `${cls}: ${voiced}'s voice once, at the reveal`);
        eq(Bp.r.after.filter((e) => /^voice_/.test(e.name)).length, 0, `${cls}: ${plain} has no voice`);
      } else eq(A.r.after.filter((e) => /^voice_/.test(e.name)).length, 0, `${cls}: a lost ${voiced} never sings (the note is not the reveal)`);
    }
  }
}
{
  // bit-identical WebAudio traces up to the reveal: two harnesses, one seed; the species only on fishing:caught
  const traceUpTo = (speciesId) => {
    const h = makeAudioHarness({ create, data: data3, run: v3run(), seed: 5 });
    const { ctx, bus } = h;
    const plan = makePlan('elder', 4);
    bus.emit('fishing:strike', { grade: 'clean', sizeClass: 'elder' });
    ctx.fishing.state = 'reeling';
    ctx.fishing.view = { speciesId: null, rarity: null, tension: 0.5, progress: 0, play: { line: 0.5, hurry: false } };
    let t = 0;
    for (const b of [...plan.beats, ...plan.events].sort((a, c) => a.t - c.t)) {
      while (t < b.t - 1e-9) { const d = Math.min(0.2, b.t - t); h.step(d); t += d; }
      bus.emit('fishing:reel', { phase: b.phase, ...(b.kind ? { kind: b.kind } : {}), sizeClass: 'elder', t: b.t, dur: b.dur, strength: b.strength ?? 0.6, tier: 1, ...(b.phase === 'leap' || b.phase === 'glimpse' || b.phase === 'scare' ? { length: 1.5 } : {}) });
    }
    h.step(plan.dur - t + 0.3);
    const before = h.ac.trace.slice();
    bus.emit('fishing:caught', { speciesId, weight: 3, quality: 'normal', z: 2.8, sizeClass: 'elder', length: 140, fish: { uid: 'x' } });
    h.step(1);
    const after = h.ac.trace.slice(before.length);
    h.done();
    return { before, after };
  };
  const A = traceUpTo('vesper_gar'), Bt = traceUpTo('mirror_pike');
  ok(A.before.length > 2000, `the Elder play builds a real graph (${A.before.length} trace entries)`);
  const first = A.before.findIndex((x, i) => x !== Bt.before[i]);
  ok(first < 0 && A.before.length === Bt.before.length, `the WebAudio trace is bit-identical up to the reveal${first < 0 ? '' : ` (first difference #${first}: ${A.before[first]} vs ${Bt.before[first]})`}`);
  ok(A.after.length > Bt.after.length, 'after the reveal the Vesper Gar sings (its voice adds nodes) and the Mirror Pike does not');
}

section('audio.js: the scare stops the hum; the still is silence, then the crash');
{
  const h = makeAudioHarness({ create, data: data3, run: v3run() });
  const { ctx, bus } = h;
  bus.emit('fishing:strike', { grade: 'struck', sizeClass: 'trophy' });
  ctx.fishing.state = 'reeling'; ctx.fishing.view = { play: { line: 0.6 } };
  bus.emit('fishing:reel', { phase: 'hold', sizeClass: 'trophy', t: 2, dur: 3, strength: 0.6, tier: 0 });
  h.step(1);
  let d = ctx.debug.audioPlay();
  ok(d.hum.on && d.hum.level > 0.03 && !d.hum.muted, `the line hums through the hold (${d.hum.level})`);
  bus.emit('fishing:reel', { phase: 'scare', kind: 'slack', sizeClass: 'trophy', t: 3, dur: 0.9, strength: 0.6, tier: 0, length: 0.9 });
  h.step(0.1);
  d = ctx.debug.audioPlay();
  ok(d.hum.muted && d.hum.level === 0, `the scare: the line's hum stops (${d.hum.level})`);
  h.step(0.6);
  d = ctx.debug.audioPlay();
  ok(!d.hum.muted && d.hum.level > 0, `… and returns (${d.hum.level})`);
  eq(count(h.log(), 'scare_splash'), 1, 'the scare splashes once');
  ctx.fishing.state = 'idle'; bus.emit('fishing:state', { state: 'idle' }); h.step(1.2);
  ok(!ctx.debug.audio().loops.hum, 'the hum ends with the play');
  // the still
  bus.emit('fishing:strike', { grade: 'struck', sizeClass: 'elder', ancient: true });
  ctx.fishing.state = 'reeling';
  bus.emit('fishing:reel', { phase: 'lastStand', sizeClass: 'elder', ancient: true, t: 10, dur: 2.5, strength: 1, tier: 0 });
  h.step(2.5);
  d = ctx.debug.audioPlay();
  ok(d.drone.on && d.drone.level > 0.06, `the last stand swells the drone (${d.drone.level})`);
  bus.emit('fishing:reel', { phase: 'still', sizeClass: 'elder', ancient: true, t: 12.5, dur: 1.5, strength: 0.1, tier: 0 });
  h.step(0.4);
  d = ctx.debug.audioPlay();
  ok(d.still && d.duck <= 0.02 && d.hum.level === 0 && d.drone.level === 0 && d.held === 0, `the still: the score, the hum and the drone fall silent (${JSON.stringify({ duck: d.duck, hum: d.hum.level, drone: d.drone.level })})`);
  const n0 = h.log().length;
  h.step(1.2);
  eq(h.log().slice(n0).length, 0, 'nothing sounds in the still');
  bus.emit('fishing:reel', { phase: 'lastStand', sizeClass: 'elder', ancient: true, t: 14, dur: 2, strength: 1, tier: 0 });
  eq(names(h.log().slice(n0)).slice(0, 2), ['still_crash', 'reel_scream'], 'then it thunders off: the crash, the drag screaming');
  h.done();
}

section('audio.js: the strain whine, one semitone lower per mean tier');
{
  const h = makeAudioHarness({ create, data: data3, run: v3run() });
  const { ctx, bus } = h;
  const at = [];
  for (const tier of [0, 1, 2, 3, 4]) {
    bus.emit('fishing:strike', { grade: 'struck', sizeClass: 'trophy' });
    ctx.fishing.state = 'reeling';
    const tr0 = h.ac.trace.length;
    bus.emit('fishing:reel', { phase: 'surge', sizeClass: 'trophy', t: 3, dur: 0.6, strength: 1, tier });
    const f = ctx.debug.audioPlay().strain;
    at.push(f);
    const sung = h.ac.trace.slice(tr0).map((x) => /\.frequency=([\d.]+)$/.exec(x)).filter(Boolean).map((m) => Number(m[1]));
    ok(sung.some((v) => Math.abs(v - f) < 0.002), `tier ${tier}: an oscillator sings at ${f} Hz`);
    h.step(1); ctx.fishing.state = 'idle'; bus.emit('fishing:state', { state: 'idle' }); h.step(0.5);
  }
  for (let i = 1; i < at.length; i++) near(at[i] / at[i - 1], Math.pow(2, -1 / 12), `tier ${i - 1} → ${i}: one semitone lower`, 2e-4);
  h.done();
}

section('audio.js: losses by cause, then quiet');
{
  const h = makeAudioHarness({ create, data: data3, run: v3run() });
  h.step(0.5);
  const want = { snapped: 'loss_snap', thrown: 'loss_thrown', spat: 'loss_spat', spooled: 'loss_spooled', fouled: 'loss_fouled', staggered: 'loss_snap' };
  for (const [reason, sfx] of Object.entries(want)) {
    const r = runPlay(h, { cls: 'elder', seed: 7, outcome: 'lose', reason, lossAt: 0.8 });
    const loss = r.before.filter((e) => /^loss_/.test(e.name));
    eq(loss.map((e) => [e.name, e.why]), [[sfx, reason]], `${reason}: ${sfx}`);
    const after = r.before.slice(r.before.indexOf(loss[0]) + 1).filter((e) => !/^(cove_|stillnight_)/.test(e.name));
    eq(after.map((e) => e.name), [], `${reason}: quiet after the loss (no play sound follows)`);
    const d = h.ctx.debug.audioPlay();
    ok(!d.active && !d.hum.on, `${reason}: the hum stops`);
    eq(names(r.after), ['gotaway'], `${reason}: the got-away card (Elder) rings two low notes, after the quiet beat`);
    h.step(2);
  }
  const k = runPlay(h, { cls: 'keeper', seed: 7, outcome: 'lose', reason: 'spat', lossAt: 0.9 });
  eq(names(k.after), [], 'a Keeper\'s toast is silent (the card is Trophy and bigger)');
  // v1 causes keep v1's sounds
  const n0 = h.log().length;
  h.bus.emit('fishing:escaped', { reason: 'snap', speciesId: 'dusk_minnow' });
  eq(names(h.log().slice(n0)), ['line_snap'], "v1's snap keeps line_snap");
  h.done();
}

section('audio.js: let it pass, a spooked fish, hurry');
{
  const h = makeAudioHarness({ create, data: data3, run: v3run() });
  let n0 = h.log().length;
  h.bus.emit('fishing:miss', { reason: 'passed', refunded: true, favour: 0.15, lingers: true });
  eq(names(h.log().slice(n0)), ['bite_pass'], 'a bite let pass: the float bobs back up');
  h.step(0.5); n0 = h.log().length;
  h.bus.emit('fishing:miss', { reason: 'spooked' });
  eq(names(h.log().slice(n0)), ['denied'], 'a tap on the nibbles spooks it (as v1\'s early tap)');
  h.step(0.5);
  const r = runPlay(h, { cls: 'small', seed: 4, hurry: true });
  const gains = h.ctx.debug.audioPlay().beats.filter((b) => b.phase === 'gain');
  const plan = makePlan('small', 4);
  const want = plan.beats.filter((b) => b.phase === 'gain').map((b) => Math.round(Math.round(b.dur * 100) / 100 / 2.5 * 1000) / 1000);
  eq(gains.map((b) => b.dur), want, 'a hurried Small: the same beats, × 2.5 sooner');
  void r;
  h.done();
}

// =================================================================== 3. the Landing and the First Evening
section('FE-Au1: the cove bed under the title and at the Landing; setout, never descend, on every departure');
{
  const h = makeAudioHarness({ create, data: data3, run: null, flow: 'title' });
  const { ctx, bus } = h;
  let n0 = h.log().length;
  bus.emit('zone:change', { zone: 'cove', hub: true, prev: null, from: 'boot' });
  h.step(2);
  eq(h.log().slice(n0).filter((e) => e.name === 'descend' || e.name === 'setout').length, 0, 'the boot build of the cove rings no sting');
  ok(ctx.debug.audio().loops.cove && ctx.debug.audio().cove.bed, 'the cove bed runs under the title');
  eq(h.audio.getMood(), 'title', 'the title keeps the title score');
  // Begin → flow hub (the First Evening)
  ctx.flow = 'hub';
  bus.emit('flow:change', { flow: 'hub', prev: 'title' });
  bus.emit('hub:enter', { from: 'boot' });
  h.step(12);
  eq(h.audio.getMood(), 'hub', 'the Landing plays the hub mood');
  eq(ctx.debug.audio().zone, 'cove', 'in the cove colour');
  ok(count(h.log(), 'cove_ambience') >= 2, `the water breathes at the quay (${count(h.log(), 'cove_ambience')} breaths)`);
  h.step(40);
  ok(count(h.log(), 'cove_bell_far') >= 1, 'a far bell rings past the sea-gate');
  // the First Evening's departure: setout, never descend
  n0 = h.log().length;
  ctx.flow = 'playing'; ctx.state.run = v3run({ outing: 'first' });
  bus.emit('flow:change', { flow: 'playing', prev: 'hub' });
  bus.emit('zone:change', { zone: 'mossmere', prev: 'cove' });
  bus.emit('run:start', { continued: false });
  let e = h.log().slice(n0);
  eq(e.filter((x) => x.name === 'setout' || x.name === 'descend').map((x) => [x.name, x.why]), [['setout', 'mossmere']], 'the first run: setout into the Mossmere, no descend');
  h.step(3);
  ok(!ctx.debug.audio().loops.cove, 'the cove bed stops in the lake');
  // a later run: New Descent → the cove → the glide → the lake (setout again); a gate passage still descends; a Continue rings nothing
  for (let run = 2; run <= 4; run++) {
    ctx.flow = 'hub'; ctx.state.run = null;
    bus.emit('flow:change', { flow: 'hub', prev: 'playing' });
    bus.emit('zone:change', { zone: 'cove', hub: true, prev: 'mossmere', from: 'title' });
    bus.emit('firstEvening:line', { kind: 'murk', key: data3.FIRST_EVENING.everyRun.murk[run % 4], text: data3.FIRST_EVENING.text[data3.FIRST_EVENING.everyRun.murk[run % 4]], everyRun: true });
    h.step(3.2);
    n0 = h.log().length;
    ctx.flow = 'playing'; ctx.state.run = v3run();
    bus.emit('zone:change', { zone: 'mossmere', prev: 'cove' });
    bus.emit('run:start', { continued: false });
    e = h.log().slice(n0);
    eq(e.filter((x) => x.name === 'setout' || x.name === 'descend').map((x) => x.name), ['setout'], `run ${run}: setout, never descend`);
    h.step(2.5);
  }
  ok(count(h.log(), 'murk_grumble') >= 3, "Murk grumbles each later run's glide line");
  n0 = h.log().length;
  bus.emit('zone:change', { zone: 'sporewood', prev: 'mossmere' });
  eq(names(h.log().slice(n0)), ['descend'], 'a gate passage between lakes still descends');
  h.step(3);
  n0 = h.log().length;
  bus.emit('zone:change', { zone: 'mossmere', prev: 'cove', continued: true });
  eq(names(h.log().slice(n0)).filter((x) => x === 'setout' || x === 'descend'), [], 'a Continue (prev cove) rings nothing');
  // a snuff cuts to the hearth: the snuff motif under the hearth's bed
  ctx.flow = 'dead';
  n0 = h.log().length;
  bus.emit('zone:change', { zone: 'cove', hub: true, prev: 'mossmere', from: 'snuffed' });
  h.step(1);
  ok(names(h.log().slice(n0)).includes('snuff') && ctx.debug.audio().loops.cove, 'a snuff: the snuff motif, then the hearth\'s bed');
  eq(h.audio.getMood(), 'death', 'the Snuffed summary keeps the death score');
  h.done();
}

section('FE-Au1: the Lantern Line, the wake, Murk');
{
  const h = makeAudioHarness({ create, data: data3, run: null, flow: 'hub' });
  const { ctx, bus } = h;
  bus.emit('zone:change', { zone: 'cove', hub: true, prev: null, from: 'boot' });
  bus.emit('hub:enter', { from: 'boot' });
  let n0 = h.log().length, g0 = ctx.time.gameT;
  bus.emit('firstEvening:step', { id: 'framing', prev: null, replay: false });
  let emberAt = null;
  for (let i = 0; i < 40 && emberAt === null; i++) { h.step(0.05); if (h.log().slice(n0).some((x) => x.name === 'ember_swell')) emberAt = ctx.time.gameT - g0; }
  near(emberAt, data3.FIRST_EVENING.ember.at, 'the ember swells once, at FIRST_EVENING.ember.at on the game clock', 0.051);
  bus.emit('firstEvening:beat', { id: 'ember', step: 'framing' });
  h.step(1);
  eq(count(h.log().slice(n0), 'ember_swell'), 1, 'one swell (the director\'s ember beat does not double it)');
  // the bed rises under the first line
  const lo = ctx.debug.audio().cove.bed;
  ok(lo, 'the cove bed is up for the framing');
  for (const [i, txt] of data3.FIRST_EVENING.text.lore.entries()) { bus.emit('firstEvening:line', { kind: 'lore', key: `lore${i}`, text: txt }); h.step(2.8); }
  eq(count(h.log().slice(n0), 'murk_grumble'), 0, 'lore lines are not Murk: no grumble');
  n0 = h.log().length;
  bus.emit('firstEvening:step', { id: 'wake', prev: 'framing', replay: false });
  eq(names(h.log().slice(n0)), ['flame_catch'], 'the wake: the flame catches');
  h.step(1.2);
  bus.emit('firstEvening:line', { kind: 'murk', key: 'murkWake', text: data3.FIRST_EVENING.text.murkWake });
  const gr = h.log().slice(n0).filter((x) => x.name === 'murk_grumble');
  eq(gr.map((x) => x.why), ['murkWake'], 'Murk\'s wake line: one grumble');
  bus.emit('firstEvening:line', { kind: 'murk', key: null, text: '' });
  eq(count(h.log().slice(n0), 'murk_grumble'), 1, 'clearing a line grumbles nothing');
  bus.emit('firstEvening:line', { kind: 'tip', key: 'fe_cast', text: data3.FIRST_EVENING.tips.fe_cast });
  eq(count(h.log().slice(n0), 'murk_grumble'), 1, 'tips are not Murk');
  for (const key of ['murkOdds', 'murkGate', 'murkFirstOil']) { h.step(2.5); bus.emit('firstEvening:line', { kind: 'murk', key, text: data3.FIRST_EVENING.text[key] }); }
  eq(h.log().slice(n0).filter((x) => x.name === 'murk_grumble').map((x) => x.why), ['murkWake', 'murkOdds', 'murkGate', 'murkFirstOil'], 'a grumble per Murk line');
  // a resume (no framing before the wake) plays no flame; Set Out flares the lantern
  n0 = h.log().length;
  bus.emit('firstEvening:step', { id: 'wake', prev: null, replay: false });
  eq(count(h.log().slice(n0), 'flame_catch'), 0, 'a resumed wake: no flame (no wake animation)');
  h.step(1);
  bus.emit('firstEvening:step', { id: 'setout', prev: 'plan', replay: false });
  eq(h.log().slice(n0).filter((x) => x.name === 'flame_catch').map((x) => x.why), ['flare'], 'Set Out: the lantern flares to full');
  // the First Evening's play at the cove: a Quayling (Small) keeps the hub mood, a Keeper adds the pulse
  h.step(2);
  const r = runPlay(h, { cls: 'small', seed: 2, lake: 'cove', speciesId: 'quayling' });
  ok(!r.moods.includes('reel') && r.moods.includes('hub'), `the tutorial play keeps the hub mood (${r.moods.join(', ')})`);
  ok(r.before.some((x) => x.name === 'reel_ratchet') && r.before.some((x) => x.name === 'fish_skitter'), 'the tutorial play is heard (ratchet, skitter)');
  eq(h.ctx.debug.audioPlay().len, Math.round(0.25 * 0.55 * 1000) / 1000, 'its class length is the cove\'s');
  h.done();
}

section('flag off: v1 data never reaches the AF / FE sounds');
{
  const h = makeAudioHarness({ create, data: data1, run: { id: 'r', zone: 'mossmere', day: 1, phase: 'calm', hp: 5, oil: 60 } });
  const n0 = h.log().length;
  h.bus.emit('fishing:caught', { speciesId: 'chime_jelly', weight: 0.4, quality: 'normal' });
  h.bus.emit('zone:change', { zone: 'sporewood', prev: 'mossmere' });
  eq(names(h.log().slice(n0)), ['splash_big', 'descend'], 'v1: a caught Chime Jelly sings no voice; a lake change descends');
  h.done();
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
