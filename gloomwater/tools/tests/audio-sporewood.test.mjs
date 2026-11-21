// Sporewood's own sound under the loop (docs/loop/LAKE2.md §3.7, §9 lane A): the pure rules and voices of src/audio-sporewood.js, then
// audio.js on the loop's data through a fake WebAudio (tools/tests/audio-env.mjs): the bed by light (the frog chorus building over the
// dusk), the Seep, each place in earshot (clear or through its bank, the Gill Harp's hum), the giants' backs at night, the lily frogs'
// plops, home at Sporewood (its bed, the score in its key), and none of it on the Mossmere (whose sound is as it was) or off the loop.
// The offline render, its -1.0 dBFS gate and the beds' level against the Mossmere's: tools/audio-render.mjs --set=sporewood.
//   node tools/tests/audio-sporewood.test.mjs   (or node tools/check.mjs)
import * as SPORE from '../../src/audio-sporewood.js';
import * as MOSS from '../../src/audio-mossmere.js';
import { SFX, MOSS_SFX } from '../../src/audio-sfx.js';
import { create } from '../../src/audio.js';
import { makeAudioHarness } from './audio-env.mjs';

globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
const DV3 = await import('../../src/data.js?spore-v3');
delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE;
const { loadLoopData, fakeLoop, tripRun } = await import('./loop-fixture.mjs');
const D = await loadLoopData({ query: 'audio-sporewood' });
const WL = await import('../../src/world-layout.js');
const WO = await import('../../src/world-outline.js');

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const section = (s) => console.log(`- ${s}`);
const SP = new Set(SPORE.SPORE_SFX);

section('the rules (pure)');
{
  eq(['calm', 'dusk', 'gloomtide', 'dawn', undefined].map(SPORE.sporeLight), ['day', 'dusk', 'night', 'day', 'day'], 'the light: the Mossmere\'s rule (the calm late day, the gloomtide night)');
  ok(SPORE.sporeOn({ loopOn: true, flow: 'playing', zone: 'sporewood', outing: 'trip' }) && SPORE.sporeOn({ loopOn: true, flow: 'home', zone: 'sporewood' }), 'on a trip at Sporewood and at home while it lies there');
  ok(![{ loopOn: false, flow: 'playing', zone: 'sporewood', outing: 'trip' }, { loopOn: true, flow: 'playing', zone: 'sporewood', outing: 'normal' }, { loopOn: true, flow: 'playing', zone: 'mossmere', outing: 'trip' },
    { loopOn: true, flow: 'home', zone: 'mossmere' }, { loopOn: true, flow: 'home' }, { loopOn: true, flow: 'title', zone: 'sporewood' }, { loopOn: true, flow: 'intro', zone: 'sporewood' }].some((o) => SPORE.sporeOn(o)),
  'never off the loop, off a trip, on the Mossmere, at home on the Mossmere, at the title or under the film');
  ok(MOSS.mossOn({ loopOn: true, flow: 'home' }) && MOSS.mossOn({ loopOn: true, flow: 'home', zone: 'mossmere' }) && !MOSS.mossOn({ loopOn: true, flow: 'home', zone: 'sporewood' }),
    'the Mossmere\'s bed at home as before; not at home at Sporewood (each water its own)');
  const d = SPORE.bedLevels('day'), k = SPORE.bedLevels('dusk'), n = SPORE.bedLevels('night');
  ok(Object.keys(SPORE.BED_LAYERS).every((key) => key in d && key in k && key in n), 'every layer has a level in every light');
  ok(d.canopy > k.canopy && k.canopy > n.canopy && d.leaves > k.leaves && n.leaves === 0, 'the air under the caps and the leaves by day, thinner at dusk, all but gone at night');
  ok(d.warm === 0 && d.deep === 0 && k.warm > 0 && k.deep === 0 && n.deep > n.warm && n.deep > 0, 'the drone: none by day, a low warm one at dusk, deeper at night');
  ok(d.pulse === 0 && k.pulse === 0 && n.pulse > 0, 'the night insects\' pulse at night only');
  ok(SPORE.bedLevels('day') !== SPORE.bedLevels('day') && SPORE.bedLevels('nonsense').canopy === d.canopy, 'bedLevels: a fresh object; an unknown light is day');
  ok(SPORE.BED_LAYERS.pulse.am?.rate > 4 && SPORE.BED_LAYERS.leaves.lfo && SPORE.BED_LAYERS.deep.f < SPORE.BED_LAYERS.warm.f, 'the pulse pulses; the leaves breathe; the night\'s drone below the dusk\'s');
  const dv = Object.fromEntries(SPORE.bedVoices('day')), kv = Object.fromEntries(SPORE.bedVoices('dusk'));
  eq(Object.keys(dv), ['drip', 'pop', 'click'], 'late day: drips from the caps, spore pops, frog clicks');
  ok(kv.drip && kv.drip.every[0] > dv.drip.every[0] && !kv.pop && SPORE.bedVoices('night').length === 0, 'dusk: the drips thin; night: none of them');
  ok(SPORE.chorus('day', 0.5) === null, 'no chorus by day (a few clicks)');
  const c0 = SPORE.chorus('dusk', 0), c5 = SPORE.chorus('dusk', 0.5), c1 = SPORE.chorus('dusk', 1), cn = SPORE.chorus('night', 0.3);
  ok(c0.every[0] > c5.every[0] && c5.every[0] > c1.every[0] && c0.every[1] > c1.every[1] && c0.volume < c1.volume, `the chorus builds over the dusk (every ${c0.every.map((x) => x.toFixed(1))} → ${c1.every.map((x) => x.toFixed(1))} s)`);
  ok(cn.every[1] < c1.every[1] && cn.volume >= c1.volume && cn.pitch < 1 && cn.croaks[1] > c1.croaks[1], 'at night full and low (denser, lower, more calls a frog)');
  ok(SPORE.chorus('dusk', -1).every[0] === c0.every[0] && SPORE.chorus('dusk', 7).every[0] === c1.every[0], 'the dusk\'s progress clamped to 0..1');

  eq(Object.keys(SPORE.PLACE_VOICES).sort(), D.loopPlaceIds('sporewood').slice().sort(), 'a voice for each of Sporewood\'s places');
  for (const id of D.loopPlaceIds('sporewood')) {
    const V = SPORE.PLACE_VOICES[id], a = D.loopPlace(id).area;
    ok(V.sfx ? SP.has(V.sfx) : Array.isArray(V.hum) && V.hum.length > 0, `${id}: its voice (${V.sfx || 'a hum'})`);
    ok(SPORE.placeVoiceAt(id, a, a.x, a.z, { lifted: true }).gain === 1, `${id}: full on its water once lifted`);
    const b = SPORE.placeVoiceAt(id, a, a.x, a.z, { lifted: false });
    ok(b.gain === MOSS.BANK.gain && b.muffle === MOSS.BANK.lowpass, `${id}: through its standing bank low-passed and quieter`);
  }
  const cup = D.loopPlace('mothers_cup').area, lul = D.loopPlace('lullaby').area;
  ok(SPORE.placeVoiceAt('mothers_cup', cup, cup.x + cup.r + 35, cup.z, { lifted: true }).gain > 0 && SPORE.placeVoiceAt('lullaby', lul, lul.x + lul.r + 35, lul.z, { lifted: true }).gain === 0,
    'the Mother\'s breath carries further (gone past 40 m; the others past 30)');
  const H = SPORE.PLACE_VOICES.gill_harp.hum;
  ok(H[0].f < 50 && H[1].f > H[0].f && Math.abs(H[1].f / H[0].f - 2) < 0.01 && H.every((h) => h.sway?.depth > 0), 'the Gill Harp: one note, felt (F1) and heard (its octave), swaying');
  ok(SPORE.harpLight('night') === 1 && SPORE.harpLight('day') < SPORE.harpLight('dusk'), 'the hum fullest at night');

  // the Seep: on the water at the fall's foot, by the East Pool's north-east shore; never heard at Rootfoot Landing
  const L = WL.buildLayout(D.ZONES.find((z) => z.id === 'sporewood')), sd = WO.sdfAt(L.outline, SPORE.SEEP.x, SPORE.SEEP.z);
  ok(sd > 0 && sd < 3, `the Seep sounds on the water at its foot (${sd.toFixed(2)} m from the shore)`);
  const M = D.LOOP.mooring.sporewood.hull;
  ok(SPORE.seepAt(M.x, M.z).gain === 0 && SPORE.seepAt(SPORE.SEEP.x - 3, SPORE.SEEP.z).gain === 1 && SPORE.seepAt(NaN, 0).gain === 0, 'the Seep: full at its foot, gone at Rootfoot Landing');
  ok(SPORE.seepLight('night') === 1 && SPORE.seepLight('day') < SPORE.seepLight('dusk'), 'the fall clearest in the still night');
  ok(SP.has(SPORE.SEEP.drop.sfx) && SPORE.SEEP.fall.src === 'noise', 'its fall a loop, its drops a voice');

  ok(SPORE.backOn('gloomtide') && !SPORE.backOn('dusk') && !SPORE.backOn('calm'), 'the giants\' backs at night only');
  eq([SPORE.backVoice('gill_harp').sfx, SPORE.backVoice('veilwater').sfx, SPORE.backVoice('lullaby').sfx], ['harp_swell', 'puffer_rustle', 'giant_roll'], 'the Harpstring\'s hum swells, the Puffer rustles (another place: the roll)');
  ok(SPORE.backVoice('gill_harp').swell?.gain > 1 && SPORE.backVoice('veilwater').swell === null, 'the Harpstring\'s swell lifts the hum loop too');
  ok(SPORE.plopGain({ x: 0, z: 0 }, 3, 0) === 1 && SPORE.plopGain({ x: 0, z: 0 }, 30, 0) === 0 && SPORE.plopGain({}, 0, 0) === 0, 'a frog\'s plop: near only');
  eq(SPORE.SPORE_SFX.slice().sort(), ['cup_breath', 'frog_click', 'frog_croak', 'frog_plop', 'harp_swell', 'lullaby_drip', 'puffer_rustle', 'seep_drop', 'spore_drip', 'spore_pop', 'veil_whisper'],
    'SFX_SPORE: the bed\'s one-shots, the frogs, the places, the Seep, the backs');
  ok(SPORE.SPORE_SFX.every((n) => !(n in SFX)), 'none of them in the built table (added the first time Sporewood sounds, under the loop only)');
  ok(Object.values(SPORE.BED_VOICES).every((l) => Object.values(l).every((v) => SP.has(v.sfx))) && SP.has(SPORE.CHORUS.sfx) && SP.has(SPORE.PLOP.sfx), 'every sound named here is one of them');
  ok(SPORE.SPORE_SFX.every((n) => typeof SPORE.SFX_SPORE[n].fn === 'function' && SPORE.SFX_SPORE[n].max >= 1 && SPORE.SFX_SPORE[n].gain > 0), 'each a voice with its limits');
  ok(SPORE.SFX_SPORE.lullaby_drip.pj < 0.01 && SPORE.SFX_SPORE.harp_swell.pj < 0.01, 'the tuned voices (the music box, the harp) keep their pitch (in the score\'s key)');
}

// ---------------------------------------------------------------------------------------------------------------------------
const centre = (id) => { const a = D.loopPlace(id).area; return { x: a.x, z: a.z }; };
const FAR = { x: -38, z: 36 };   // (the West Pool's north water: no place, no Seep in earshot)
function sporeEnv({ data = D, phase = 'calm', k = 0.05, at = null, pos = null, lifted = [], flow = 'playing', run = undefined, zone = 'sporewood', world = null } = {}) {
  const A = makeAudioHarness({ create, data, flow, run: run === undefined ? tripRun(D, { zone }) : run });
  A.ctx.survival.info.phase = phase; A.ctx.survival.info.k = k;
  A.ctx.progression.loop = fakeLoop({ D, maps: { lakes: ['mossmere', 'sporewood'], places: lifted.slice() }, lifted: lifted.slice() });
  if (world) A.ctx.world = { getZone: () => ({ id: world }) };
  Object.assign(A.ctx.player.position, at ? centre(at) : pos || FAR);
  return A;
}
const named = (A, n) => A.log().filter((e) => e.name === n);
const spores = (A) => A.log().filter((e) => SP.has(e.name));

section('audio.js on a trip at Sporewood: the bed by light');
{
  const A = sporeEnv({});
  A.step(14);
  const s = A.ctx.debug.audioSpore();
  ok(s.level === 1 && s.light === 'day' && s.layers.canopy > 0 && s.layers.leaves > 0 && !('warm' in s.layers) && !('deep' in s.layers), `late day: the air under the caps and the leaves (${JSON.stringify(s.layers)})`);
  ok(named(A, 'spore_drip').length >= 3 && named(A, 'spore_drip').every((e) => e.why === 'bed:day'), `late day's drips from the caps (${named(A, 'spore_drip').length} in 14 s)`);
  ok(named(A, 'spore_pop').length >= 1 && named(A, 'frog_croak').length === 0, 'spore pops; no chorus by day');
  ok(A.ctx.debug.audioMoss().level === 0 && !A.log().some((e) => MOSS_SFX.includes(e.name) || /^moss_/.test(e.name)), 'none of the Mossmere\'s bed at Sporewood');
  ok(s.places.length === 4 && s.places.every((p) => p.gain === 0) && s.hum === null && s.fall === null, 'no place, no harp, no Seep in earshot on the West Pool\'s north water');
  A.ctx.survival.info.phase = 'dusk'; A.ctx.survival.info.k = 0.05; A.step(30);
  const early = named(A, 'frog_croak').length;
  const ds = A.ctx.debug.audioSpore();
  ok(ds.light === 'dusk' && ds.layers.warm > 0 && ds.layers.warm2 > 0, `dusk: the low warm drone (${JSON.stringify(ds.layers)})`);
  A.ctx.survival.info.k = 0.95; A.step(30);
  const late = named(A, 'frog_croak').length - early;
  ok(early >= 1 && late > early * 2, `the frogs begin at dusk and build (${early} calls in its first 30 s, ${late} in its last)`);
  A.ctx.survival.info.phase = 'gloomtide'; A.step(16);
  const ns = A.ctx.debug.audioSpore();
  ok(ns.light === 'night' && ns.layers.deep > ns.layers.warm && ns.layers.pulse > 0, `night: the drone deeper, the insects' pulse (${JSON.stringify(ns.layers)})`);
  const nf = named(A, 'frog_croak').filter((e) => e.why === 'frogs:night');
  ok(nf.length >= 12, `night: the chorus full (${nf.length} calls in 16 s)`);
  A.step(8);
  ok(!('leaves' in A.ctx.debug.audioSpore().layers), 'a layer silent at night is let go (the leaves)');
  A.ctx.paused = true; A.step(2);
  ok(A.ctx.debug.audioSpore().level === 0.5, 'under the pause the bed is softer');
  A.ctx.paused = false; A.ctx.flow = 'title'; A.step(5);
  const t = A.ctx.debug.audioSpore();
  ok(t.level === 0 && Object.keys(t.layers).length === 0 && t.hum === null && t.fall === null, 'at the title it fades and its loops are gone');
  A.done();
}
section('audio.js: the Seep, and each place in earshot');
{
  const S = sporeEnv({ pos: { x: SPORE.SEEP.x - 4, z: SPORE.SEEP.z } });
  S.step(6);
  const f = S.ctx.debug.audioSpore().fall;
  ok(f && f.level > 0.05, `by the Seep: its fall (${JSON.stringify(f)})`);
  ok(named(S, 'seep_drop').length >= 4 && named(S, 'seep_drop').every((e) => e.why === 'seep' && e.pan > 0), `… and the drops at its foot, from the east (${named(S, 'seep_drop').length} in 6 s)`);
  Object.assign(S.ctx.player.position, FAR); S.step(5);
  ok(S.ctx.debug.audioSpore().fall === null, '… gone out of earshot (its loop let go)');
  S.done();
  const Lu = sporeEnv({ at: 'lullaby', lifted: ['lullaby'] });
  Lu.step(14);
  const lu = named(Lu, 'lullaby_drip');
  ok(lu.length >= 2 && lu.every((e) => e.why === 'lullaby'), `the Lullaby lifted: its music-box drip, clear (${lu.length} in 14 s)`);
  ok(Lu.ctx.debug.audioSpore().places.find((p) => p.id === 'veilwater').gain === 0, '… the Veilwater out of earshot');
  Lu.done();
  const V = sporeEnv({ at: 'veilwater', lifted: [] });
  V.step(14);
  const vw = named(V, 'veil_whisper');
  ok(vw.length >= 2 && vw.every((e) => e.why === 'veilwater:bank'), `a standing bank: the Veil's whisper through it (${vw.length})`);
  V.done();
  const C = sporeEnv({ at: 'mothers_cup', lifted: ['mothers_cup'] });
  C.step(24);
  ok(named(C, 'cup_breath').length >= 2 && named(C, 'cup_breath').length <= 4, `the Mother's Cup: a slow breath (${named(C, 'cup_breath').length} in 24 s)`);
  C.done();
  const G = sporeEnv({ at: 'gill_harp', lifted: ['gill_harp'], phase: 'gloomtide' });
  G.step(4);
  const h = G.ctx.debug.audioSpore().hum;
  ok(Array.isArray(h) && h.length === 2 && h[0].level > h[1].level && h[1].level > 0, `the Gill Harp: its one note hummed, felt over heard (${JSON.stringify(h)})`);
  ok(!G.log().some((e) => e.why === 'gill_harp'), '… a hum, no one-shot');
  G.ctx.progression.loop = fakeLoop({ D, maps: { lakes: ['mossmere', 'sporewood'], places: [] }, lifted: [] });
  G.step(3);
  const hb = G.ctx.debug.audioSpore().hum;
  ok(hb[0].lowpass < SPORE.PLACE_VOICES.gill_harp.hum[0].ff + 1 && hb[1].lowpass <= MOSS.BANK.lowpass * 0.3 + 1 && hb[1].level < h[1].level, `… through a standing bank, darker and quieter (${JSON.stringify(hb)})`);
  Object.assign(G.ctx.player.position, FAR); G.step(5);
  ok(G.ctx.debug.audioSpore().hum === null, '… gone out of earshot (its loops let go)');
  G.done();
}
section('audio.js: the giants\' backs, the lily frogs, the reeds');
{
  const N = sporeEnv({ phase: 'gloomtide', at: 'gill_harp', lifted: ['gill_harp'] });
  N.step(3);
  const h0 = N.ctx.debug.audioSpore().hum[0].level;
  const g = centre('gill_harp');
  N.bus.emit('world:giantBack', { placeId: 'gill_harp', x: g.x, z: g.z }); N.step(2);
  const sw = named(N, 'harp_swell');
  ok(sw.length === 1 && sw[0].why === 'gill_harp' && N.ctx.debug.audioSpore().swell === true, 'world:giantBack at the Gill Harp at night: the Harpstring\'s hum swells');
  ok(N.ctx.debug.audioSpore().hum[0].level > h0 * 2, `… the hum loop with it (${h0} → ${N.ctx.debug.audioSpore().hum[0].level})`);
  N.step(6);
  ok(N.ctx.debug.audioSpore().swell === false && N.ctx.debug.audioSpore().hum[0].level < h0 * 1.2, '… and settles back');
  const v = centre('veilwater');
  N.bus.emit('world:giantBack', { placeId: 'veilwater', x: v.x, z: v.z }); N.step(0.2);
  ok(named(N, 'puffer_rustle').length === 1 && named(N, 'giant_roll').length === 0, 'the Puffer under the Veil: a paper rustle (never the Mossmere\'s roll)');
  N.done();
  const Dy = sporeEnv({ phase: 'dusk', at: 'gill_harp' });
  Dy.bus.emit('world:giantBack', { placeId: 'gill_harp', x: 0, z: 6.5 }); Dy.step(0.2);
  ok(named(Dy, 'harp_swell').length === 0, 'never at dusk');
  Dy.bus.emit('place:lift', { placeId: 'lullaby', phase: 'start', name: 'The Lullaby' }); Dy.bus.emit('loop:seal', { seal: 'catch' }); Dy.step(0.2);
  ok(named(Dy, 'mist_lift').length === 1 && named(Dy, 'seal_press').length === 1, 'the lift and the seal as at every water');
  Dy.done();
  const F = sporeEnv({ pos: { x: -50, z: -30 } });
  F.step(1);
  F.bus.emit('wild:frogDive', { x: -48, z: -31 }); F.step(0.2);
  F.bus.emit('wild:frogDive', { x: 10, z: 10 }); F.step(0.2);
  const pl = named(F, 'frog_plop');
  ok(pl.length === 1 && pl[0].why === 'frog', 'a lily frog plops off its raft near the raft; one far off is not heard');
  F.bus.emit('sign:spawn', { kind: 'stems', x: -49, z: -30 }); F.step(0.2);
  ok(named(F, 'moss_rustle').length === 1, 'the stems tell: Sporewood\'s reeds knock too');
  F.done();
}
section('home at Sporewood');
{
  const H = sporeEnv({ flow: 'home', run: null, world: 'sporewood', pos: { x: 32, z: 25 } });
  H.step(8);
  const s = H.ctx.debug.audioSpore();
  ok(s.level === 1 && s.layers.canopy > 0 && named(H, 'spore_drip').length >= 1, 'home at Rootfoot Landing: Sporewood\'s bed');
  ok(H.ctx.debug.audioMoss().level === 0 && !H.log().some((e) => /^moss_/.test(e.name)), '… not the Mossmere\'s');
  ok(H.log().some((e) => /^home_/.test(e.name)) || H.ctx.debug.audio().mood === 'hub', '… home\'s own bed and mood as built');
  eq(H.ctx.debug.audio().zone, 'sporewood', 'the score at home there in Sporewood\'s key (audio-music.js\'s built theme)');
  H.ctx.world = null; H.ctx.state.meta.loop = { barge: { water: 'sporewood', towed: ['mossmere', 'sporewood'] } }; H.step(2);
  ok(H.ctx.debug.audioSpore().level === 1, 'with no world to ask, where the barge lies');
  H.done();
  const M = sporeEnv({ flow: 'home', run: null, world: 'mossmere', zone: 'mossmere', pos: { x: 24, z: 38 } });
  M.step(6);
  ok(M.ctx.debug.audioMoss().level === 1 && M.ctx.debug.audioSpore().level === 0 && spores(M).length === 0, 'home on the Mossmere: the Mossmere\'s bed as before, none of Sporewood\'s');
  ok(M.ctx.debug.audio().zone !== 'sporewood', `… the score not in Sporewood's key (${M.ctx.debug.audio().zone})`);
  M.done();
}
section('the Mossmere and off the loop: none of it');
{
  const M = sporeEnv({ zone: 'mossmere', pos: { x: 24, z: 30 } });
  M.step(12);
  M.bus.emit('wild:frogDive', { x: 24, z: 31 }); M.bus.emit('world:giantBack', { placeId: 'gill_harp', x: 24, z: 32 }); M.step(0.5);
  ok(M.ctx.debug.audioSpore().level === 0 && spores(M).length === 0, 'a trip on the Mossmere: none of Sporewood\'s sounds');
  ok(M.ctx.debug.audioMoss().level === 1 && M.ctx.debug.audioMoss().places.every((p) => D.LOOP.places[p.id].water === 'mossmere'), 'the Mossmere\'s bed, its own places only');
  M.done();
  const O = sporeEnv({ data: DV3, run: { zone: 'sporewood', day: 1, phase: 'calm', outing: 'normal' } });
  O.step(12);
  O.bus.emit('wild:frogDive', { x: 30, z: 30 }); O.bus.emit('world:giantBack', { placeId: 'gill_harp', x: 0, z: 6.5 });
  O.step(0.5);
  ok(O.ctx.debug.audioSpore === undefined && spores(O).length === 0, 'v3 without the loop: no Sporewood layer, none of its sounds');
  O.done();
  const T = sporeEnv({ run: { ...tripRun(D, { zone: 'sporewood' }), outing: 'normal' } });
  T.step(6);
  ok(T.ctx.debug.audioSpore().level === 0 && spores(T).length === 0, 'the loop\'s data but not a trip: none');
  T.done();
}

console.log(`audio-sporewood: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
