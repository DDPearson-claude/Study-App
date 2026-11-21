// The Mossmere's own sound under the loop (docs/loop/m1-step3a/PLAN.md §2.2 item 7, T130; M1 §2.13; PLAN CHOICEs 10, 17, 18):
// the pure rules of src/audio-mossmere.js, then audio.js on the loop's data through a fake WebAudio (tools/tests/audio-env.mjs):
// the bed by light, each place in earshot (clear, or through its bank), the roll on world:giantBack at night only, the lift's and
// the seal's sounds, and nothing of it off the loop. The offline render and its -1.0 dBFS gate: tools/audio-render.mjs --set=mossmere.
//   node tools/tests/audio-mossmere.test.mjs   (or node tools/check.mjs)
import * as MOSS from '../../src/audio-mossmere.js';
import { SFX, MOSS_SFX } from '../../src/audio-sfx.js';
import { create } from '../../src/audio.js';
import { makeAudioHarness } from './audio-env.mjs';

globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
const DV3 = await import('../../src/data.js?moss-v3');
delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE;
const { loadLoopData, fakeLoop, tripRun } = await import('./loop-fixture.mjs');
const D = await loadLoopData({ query: 'audio-mossmere' });

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const section = (s) => console.log(`- ${s}`);

section('the rules (pure)');
{
  eq(['calm', 'dusk', 'gloomtide', 'dawn', 'night', undefined].map(MOSS.mossLight), ['day', 'dusk', 'night', 'day', 'night', 'day'], 'the light: the calm is late day, the gloomtide night');
  ok(MOSS.mossOn({ loopOn: true, flow: 'playing', zone: 'mossmere', outing: 'trip' }) && MOSS.mossOn({ loopOn: true, flow: 'home' }), 'on a trip on the Mossmere and at home under the loop');
  ok(![{ loopOn: false, flow: 'playing', zone: 'mossmere', outing: 'trip' }, { loopOn: false, flow: 'home' }, { loopOn: true, flow: 'playing', zone: 'mossmere', outing: 'normal' },
    { loopOn: true, flow: 'playing', zone: 'sporewood', outing: 'trip' }, { loopOn: true, flow: 'title' }, { loopOn: true, flow: 'intro' }].some((o) => MOSS.mossOn(o)),
  'never off the loop, off a trip, on another water, at the title or under the film');
  eq([MOSS.mossLevel(true), MOSS.mossLevel(true, { paused: true }), MOSS.mossLevel(true, { blocking: true }), MOSS.mossLevel(false)], [1, 0.5, 0.5, 0], 'the level: 1 live, softer under a pause or a screen, 0 off');
  const d = MOSS.bedLevels('day'), k = MOSS.bedLevels('dusk'), n = MOSS.bedLevels('night');
  ok(d.air > k.air && k.air > n.air && d.reeds > k.reeds && k.reeds > n.reeds, 'the bed: late day\'s water air and reeds, thinner at dusk, least at night');
  ok(d.low === 0 && k.low > 0 && n.low > k.low && d.tone === 0 && n.tone > k.tone && n.tone2 > 0 && k.tone2 === 0, 'the bed: night\'s low tones (none by day; the first at dusk)');
  ok(Object.keys(MOSS.BED_LAYERS).every((key) => key in d && key in k && key in n), 'every layer has a level in every light');
  ok(MOSS.bedLevels('day') !== MOSS.bedLevels('day') && MOSS.bedLevels('nonsense').air === d.air, 'bedLevels: a fresh object; an unknown light is day');
  eq(['day', 'dusk', 'night'].map((l) => MOSS.bedBreath(l).sfx), ['moss_breeze', 'moss_dusk', 'moss_night'], 'the bed\'s breaths by light');
  eq([MOSS.voiceGain(0), MOSS.voiceGain(12), MOSS.voiceGain(30), MOSS.voiceGain(45), MOSS.voiceGain(Infinity)], [1, 1, 0, 0, 0], 'earshot: full within 12 m of the water, gone past 30 m');
  let mono = true; for (let x = 12; x < 30; x += 0.5) if (MOSS.voiceGain(x + 0.5) > MOSS.voiceGain(x) + 1e-12) mono = false;
  ok(mono && MOSS.voiceGain(21) > 0.4 && MOSS.voiceGain(21) < 0.6, 'earshot: falling between, about half at 21 m');
  const bank = MOSS.bankVoice(false), clear = MOSS.bankVoice(true);
  ok(bank.gain < 1 && bank.gain > 0 && bank.muffle > 0 && clear.gain === 1 && clear.muffle === 0, `a standing bank's voice: low-passed (${bank.muffle} Hz) and quieter (×${bank.gain}); clear once lifted`);
  for (const id of D.loopPlaceIds('mossmere')) {   // (the Mossmere's places: LAKE 2's Sporewood places are lane A's to voice)
    const p = D.loopPlace(id);
    const c = p.area.kind === 'path' ? { x: (p.area.pts[0][0] + p.area.pts[1][0]) / 2, z: (p.area.pts[0][1] + p.area.pts[1][1]) / 2 } : { x: p.area.x, z: p.area.z };
    ok(MOSS.placeDistance(p.area, c.x, c.z) === 0, `placeDistance: 0 inside ${id}'s water (${p.area.kind})`);
    ok(MOSS.PLACE_VOICES[id] && SFX[MOSS.PLACE_VOICES[id].sfx], `${id} has its voice (${MOSS.PLACE_VOICES[id]?.sfx})`);
  }
  const disc = { kind: 'disc', x: 0, z: 0, r: 6 }, rect = { kind: 'rect', x: 0, z: 0, w: 4, d: 24 }, path = { kind: 'path', pts: [[0, 0], [10, 0]], w: 8 };
  ok(Math.abs(MOSS.placeDistance(disc, 10, 0) - 4) < 1e-9 && Math.abs(MOSS.placeDistance(rect, 5, 0) - 3) < 1e-9 && Math.abs(MOSS.placeDistance(rect, 5, 16) - Math.hypot(3, 4)) < 1e-9, 'placeDistance: a disc, a rect');
  ok(Math.abs(MOSS.placeDistance(path, 5, 10) - 6) < 1e-9 && Math.abs(MOSS.placeDistance(path, -7, 0) - 3) < 1e-9 && MOSS.placeDistance(null, 0, 0) === Infinity, 'placeDistance: a path (its width), none');
  const at = MOSS.placeVoiceAt(disc, 30, 0), atB = MOSS.placeVoiceAt(disc, 6, 0, { lifted: false }), atC = MOSS.placeVoiceAt(disc, 6, 0, { lifted: true });
  ok(at.gain < 0.5 && atB.gain === MOSS.BANK.gain && atB.muffle === MOSS.BANK.lowpass && atC.gain === 1 && atC.muffle === 0, 'placeVoiceAt: by distance, through a bank or clear');
  ok(MOSS.humLight('night') === 1 && MOSS.humLight('day') < MOSS.humLight('dusk') && MOSS.humLight('dusk') < 1, 'the Buoy Lights hum loudest when their lamps are lit, at night');
  ok(MOSS.giantRollOn('gloomtide') && !MOSS.giantRollOn('dusk') && !MOSS.giantRollOn('calm'), 'the giant\'s roll at night only (PLAN CHOICE 10)');
  eq(MOSS.MOSS_EVENTS, { giantBack: 'giant_roll', liftStart: 'mist_lift', seal: 'seal_press' }, 'the one-shots on events');
  ok(Object.values(MOSS.MOSS_EVENTS).every((n) => SFX[n]) && Object.values(MOSS.BED_BREATHS).every((b) => SFX[b.sfx]), 'every sound named here is an SFX');
  eq(MOSS_SFX.slice().sort(), ['giant_roll', 'mist_lift', 'moss_breeze', 'moss_buoy', 'moss_chain', 'moss_dusk', 'moss_lily', 'moss_night', 'moss_toll', 'seal_press'], 'SFX_MOSS: the bed\'s breaths, the places, the roll, the lift, the press');
  eq(['calm', 'stillnight', 'reel', 'boss'].map(MOSS.mossMusic), ['calm', 'stillnight', 'reel', 'boss'], 'the music rule as built (PLAN CHOICE 17): nothing here picks a mood');
  let s = 1; const rng = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const sch = MOSS.voiceSchedule([2, 4], 20, rng, 0.5);
  ok(sch[0] === 0.5 && sch.every((t, i) => !i || (t - sch[i - 1] >= 2 - 1e-9 && t - sch[i - 1] <= 4 + 1e-9)) && sch.at(-1) < 20, 'voiceSchedule: every [min, max] s from the first');
}

// ---------------------------------------------------------------------------------------------------------------------------
const placeCentre = (id) => { const a = D.loopPlace(id).area; return a.kind === 'path' ? { x: (a.pts[0][0] + a.pts[1][0]) / 2, z: (a.pts[0][1] + a.pts[1][1]) / 2 } : { x: a.x, z: a.z }; };
function mossEnv({ data = D, phase = 'calm', at = null, lifted = [], own = lifted, flow = 'playing', run = undefined } = {}) {
  const A = makeAudioHarness({ create, data, flow, run: run === undefined ? tripRun(D, {}) : run });
  A.ctx.survival.info.phase = phase;
  A.ctx.progression.loop = fakeLoop({ D, maps: { lakes: ['mossmere'], places: own.slice() }, lifted: lifted.slice() });
  if (at) Object.assign(A.ctx.player.position, placeCentre(at));
  return A;
}
const named = (A, n) => A.log().filter((e) => e.name === n);

section('audio.js on a trip: the bed by light (T130)');
{
  const A = mossEnv({ at: null });
  A.ctx.player.position = { x: 24, z: 30 };   // near the Jetty, far from every place
  A.step(12);
  const m = A.ctx.debug.audioMoss();
  ok(m.level === 1 && m.light === 'day' && m.layers.air > 0 && m.layers.reeds > 0 && !('low' in m.layers), `late day: the air and the reeds (${JSON.stringify(m.layers)})`);
  ok(named(A, 'moss_breeze').length >= 1 && named(A, 'moss_breeze').every((e) => e.why === 'bed:day'), `late day's breaths (${named(A, 'moss_breeze').length} in 12 s)`);
  ok(m.places.every((p) => p.gain === 0) && !A.log().some((e) => /^moss_(lily|chain|buoy|toll)$/.test(e.name)), 'no place in earshot from the Jetty');
  A.ctx.survival.info.phase = 'gloomtide'; A.step(14);
  const n = A.ctx.debug.audioMoss();
  ok(n.light === 'night' && n.layers.low > n.layers.air && n.layers.tone > 0 && n.layers.tone2 > 0, `night: the low tones lead (${JSON.stringify(n.layers)})`);
  ok(named(A, 'moss_night').length >= 1, 'night\'s breaths');
  A.ctx.paused = true; A.step(2);
  ok(A.ctx.debug.audioMoss().level === 0.5, 'under the pause the bed is softer');
  A.done();
  const H = mossEnv({ flow: 'home', run: null }); H.ctx.player.position = { x: 24, z: 38 }; H.step(4);
  ok(H.ctx.debug.audioMoss().level === 1 && H.ctx.debug.audioMoss().layers.air > 0, 'at home (the Jetty) the Mossmere\'s bed plays too');
  H.ctx.flow = 'title'; H.step(5);
  const t = H.ctx.debug.audioMoss();
  ok(t.level === 0 && Object.keys(t.layers).length === 0, 'at the title it fades and its loops are gone');
  H.done();
}
section('audio.js: each place in earshot, clear or through its bank (T130)');
{
  const A = mossEnv({ at: 'lily_maze', lifted: ['lily_maze'] });
  A.step(12);
  const lily = named(A, 'moss_lily');
  ok(lily.length >= 2 && lily.every((e) => e.why === 'lily_maze'), `the Lily Maze lifted: its drip and sip, clear (${lily.length} in 12 s)`);
  const pl = A.ctx.debug.audioMoss().places.find((p) => p.id === 'lily_maze');
  ok(pl.gain === 1 && pl.muffle === 0 && pl.dist === 0, 'inside its water: full, no muffle');
  ok(A.ctx.debug.audioMoss().places.find((p) => p.id === 'bell_pool').gain === 0, '… the Bell Pool out of earshot');
  A.done();
  const B = mossEnv({ at: 'under_the_span', lifted: [] });
  B.step(12);
  const ch = named(B, 'moss_chain');
  ok(ch.length >= 1 && ch.every((e) => e.why === 'under_the_span:bank'), `a standing bank: the chains through it (${ch.length})`);
  const sp = B.ctx.debug.audioMoss().places.find((p) => p.id === 'under_the_span');
  ok(sp.gain === MOSS.BANK.gain && sp.muffle === MOSS.BANK.lowpass, `… low-passed (${sp.muffle} Hz) and quieter (×${sp.gain})`);
  B.done();
  const C = mossEnv({ at: 'buoy_lights', lifted: ['buoy_lights'], phase: 'gloomtide' });
  C.step(3);
  const h = C.ctx.debug.audioMoss().hum;
  ok(h && h.level > 0.02, `the Buoy Lights' low hum at night (${JSON.stringify(h)})`);
  C.ctx.player.position = { x: 24, z: 38 }; C.step(4);
  ok(C.ctx.debug.audioMoss().hum.level < 0.001, '… gone out of earshot');
  C.done();
  const T = mossEnv({ at: 'bell_pool', lifted: ['bell_pool'] });
  T.step(40);
  ok(named(T, 'moss_toll').length >= 1 && named(T, 'moss_toll').length <= 3, `the Bell Pool's far toll now and then (${named(T, 'moss_toll').length} in 40 s)`);
  T.done();
}
section('audio.js: the roll, the lift, the press (T130)');
{
  const N = mossEnv({ phase: 'gloomtide', at: 'lily_maze' });
  const span = D.loopPlace('under_the_span');
  N.bus.emit('world:giantBack', { placeId: 'under_the_span', x: span.x, z: span.z }); N.step(0.2);
  const r = named(N, 'giant_roll');
  ok(r.length === 1 && r[0].why === 'under_the_span', 'world:giantBack at night: the deep roll (through its bank)');
  N.done();
  const Dy = mossEnv({ phase: 'dusk' });
  Dy.bus.emit('world:giantBack', { placeId: 'buoy_lights', x: -48, z: -2 }); Dy.step(0.2);
  ok(named(Dy, 'giant_roll').length === 0, 'never at dusk (the back turns on clear nights only)');
  Dy.bus.emit('place:lift', { placeId: 'lily_maze', phase: 'start', name: 'The Lily Maze' }); Dy.step(0.1);
  Dy.bus.emit('place:lift', { placeId: 'lily_maze', phase: 'title', name: 'The Lily Maze' }); Dy.step(0.1);
  ok(named(Dy, 'mist_lift').length === 1 && named(Dy, 'mist_lift')[0].why === 'lily_maze', 'place:lift {phase: start}: mist_lift, once');
  Dy.bus.emit('loop:seal', { seal: 'catch' }); Dy.step(0.1);
  ok(named(Dy, 'seal_press').length === 1, 'loop:seal {seal: catch}: seal_press');
  ok(['calm', 'dusk', 'stillnight', 'gloom', 'reel', 'hub'].includes(Dy.audio.getMood()), `the score's mood is a built one (${Dy.audio.getMood()})`);
  Dy.done();
}
section('off the loop: nothing of it (the v3 beds unchanged)');
{
  const O = mossEnv({ data: DV3, run: { zone: 'mossmere', day: 1, phase: 'calm', outing: 'normal' } });
  O.step(12);
  O.bus.emit('world:giantBack', { placeId: 'under_the_span', x: -29.5, z: 0.5 }); O.bus.emit('place:lift', { placeId: 'lily_maze', phase: 'start' }); O.bus.emit('loop:seal', { seal: 'catch' });
  O.step(0.5);
  ok(O.ctx.debug.audioMoss === undefined && !O.log().some((e) => MOSS_SFX.includes(e.name)), 'v3 without the loop: no Mossmere layer and none of its sounds');
  O.done();
  const L = mossEnv({ run: { ...tripRun(D, {}), outing: 'normal' } });
  L.step(6);
  ok(L.ctx.debug.audioMoss().level === 0 && !L.log().some((e) => MOSS_SFX.includes(e.name)), 'the loop\'s data but not a trip: none');
  L.done();
}

console.log(`audio-mossmere: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
