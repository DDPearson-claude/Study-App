// Unit tests for the v3 audio (DESIGN §25.14.2 Au1, CONTRACT §13.7 audio) on a deterministic fake WebAudio
// (tools/tests/audio-env.mjs). node tools/tests/audio-v3.test.mjs  (or node tools/check.mjs)
//
//  1. audio-v3.js rules: the tell / rise / seal choices, the night-mode and Stillnight rule, the cord plan.
//  2. audio.js on the phase-1 v3 data (GW_V3, GW_V3_PHASE 1), driven through the CONTRACT §13 events, checks the Au1
//     acceptance "each sound fires on its event; a Stillnight plays the bed, not the gloom mood" with debug.audioLog():
//     class bite tells on fishing:tell (timed to the float on the game clock) / fishing:bite; rise plip vs gulp on
//     sign:spawn; cord ticks and class chimes on the ceremony's cord beat (fishing.view.measure); the seal on
//     fish:measured; the Night Rise motif on the night's phase:change and Lantern's swarm:window close; the Stillnight
//     score + bed on quiet nights, the gloom mood on swarm nights and in Gloomtide.
//  3. Flag-off parity: the same v1 event script, seeded, through this audio and through the pre-v3 audio (the files at
//     AUDIO_BASE_REF, default 76c4329, read with git into tools/out/audio-base/) builds a bit-identical WebAudio trace.
//     Skipped (not failed) when git or that commit is unavailable.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as data1 from '../../src/data.js';
import * as V3 from '../../src/audio-v3.js';
import { create } from '../../src/audio.js';
import { makeAudioHarness } from './audio-env.mjs';

globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
const data3 = await import('../../src/data.js?audio-v3-p1');
delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE;

const here = dirname(fileURLToPath(import.meta.url));
let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
function near(a, b, msg, eps = 1e-6) { ok(Math.abs(a - b) <= eps, `${msg} (got ${a}, want ${b} ± ${eps})`); }
const section = (s) => console.log(`- ${s}`);
const names = (log) => log.map((e) => e.name);
const count = (log, n) => log.filter((e) => e.name === n).length;

section('data builds');
eq(data1.V3_ENABLED, false, 'the default data is v1 (flag off)');
ok(!data1.BALANCE.nightModes && !data1.BALANCE.ceremony, 'v1 BALANCE carries no nightModes / ceremony');
eq([data3.V3_ENABLED, data3.V3_PHASE], [true, 1], 'the v3 phase-1 data');
ok(!!data3.BALANCE.nightModes && !!data3.BALANCE.ceremony && Array.isArray(data3.SIZE_CLASSES), 'v3 BALANCE carries nightModes and ceremony');

// =================================================================== 1. pure rules
section('audio-v3: bite tells');
for (const c of data3.SIZE_CLASSES) ok(!!V3.tellSfx(c.bite), `class ${c.id}'s tell ${c.bite} has a sound`);
eq(data3.SIZE_CLASSES.map((c) => V3.tellSfx(c.bite)), ['bite_doublepop', 'bite_plunge', 'bite_dragunder', 'bite_flat', 'bite_dome'], 'tell → SFX per class');
eq([V3.tellSfx(undefined), V3.tellSfx('nope')], [null, null], 'no tell (v1 bite payload) → no tell sound');
near(V3.tellDelay('dragUnder', 0.6, data3), 0.6 - data3.BALANCE.bite.dragUnder, 'drag-under starts BALANCE.bite.dragUnder before the bite');
near(V3.tellDelay('plunge', 0.6, data3), 0.6, 'the plunge is the bite itself');
near(V3.tellDelay('dome', 0.6, data3), 0, 'the dome bulges 0.6 s before the bite');
near(V3.tellDelay('flatSlide', 0.2, data3), 0, 'a short lead never schedules into the past');
near(V3.tellDelay('flatSlide', 0.6, data3, 0.3), 0.3, "fishing:tell's own dur wins when it sends one");

section('audio-v3: rise rings');
eq(['small', 'keeper', 'prize', 'trophy', 'elder', undefined].map(V3.riseSfx), ['rise_plip', 'rise_plip', 'rise_gulp', 'rise_gulp', 'rise_gulp', 'rise_plip'], 'plip for Small / Keeper, gulp for Prize+');
ok(V3.riseParams('elder').pitch < V3.riseParams('trophy').pitch && V3.riseParams('trophy').pitch < V3.riseParams('prize').pitch, 'bigger gulps are deeper');
ok(V3.riseParams('elder').volume > V3.riseParams('small').volume, 'bigger rises are louder');

section('audio-v3: night modes and the Stillnight rule');
const NM = data3.BALANCE.nightModes;
eq(V3.nightModeFrom({ run: { nightMode: 'still' } }), null, 'v1 data → no night mode');
eq(V3.nightModeFrom({ run: { outing: 'first', nightMode: 'lantern' }, nightModes: NM }), 'still', 'the First Outing is all still');
eq(V3.nightModeFrom({ run: { outing: 'descent', nightMode: 'gloomtide' }, nightModes: NM }), null, 'The Long Descent plays v1 nights');
eq(V3.nightModeFrom({ eventMode: 'lantern', run: { nightMode: 'still' }, nightModes: NM }), 'lantern', "the event's nightMode wins");
eq(V3.nightModeFrom({ combatMode: null, survivalMode: 'gloomtide', run: {}, nightModes: NM }), 'gloomtide', "survival's getter");
eq(V3.nightModeFrom({ run: { nightMode: 'lantern' }, nightModes: NM }), 'lantern', 'the run');
eq(V3.nightModeFrom({ run: { nightMode: 'bogus' }, nightModes: NM }), null, 'an unknown mode → v1');
const NIGHTS = [
  [{ mode: null }, 'gloom', 'v1'],
  [{ mode: 'still', swarmActive: false, swarmTonight: false }, 'stillnight', 'Still'],
  [{ mode: 'lantern', swarmActive: false, swarmTonight: false }, 'stillnight', "Lantern's quiet (odd) night"],
  [{ mode: 'lantern', swarmActive: false, swarmTonight: true }, 'gloom', 'Lantern swarm night, before the window (forecast)'],
  [{ mode: 'lantern', swarmActive: true, swarmTonight: true, windowOpen: true }, 'gloom', 'Lantern, inside the window'],
  [{ mode: 'lantern', swarmActive: false, swarmTonight: true, windowClosed: true }, 'stillnight', "Lantern's quiet tail"],
  [{ mode: 'lantern', swarmActive: null, swarmTonight: false }, 'stillnight', 'a lamp-watch (no swarm tonight)'],
  [{ mode: 'gloomtide', swarmActive: false, swarmTonight: true }, 'gloom', 'Gloomtide'],
  [{ mode: 'still', swarmActive: true }, 'gloom', 'any gloomling up is a fight'],
];
for (const [inp, want, label] of NIGHTS) eq(V3.nightMood(inp), want, `night mood: ${label}`);

section('audio-v3: the measuring cord');
const reedjaw = data3.SPECIES_BY_ID.reedjaw_pike;
const thr = V3.cordThresholds(data3, reedjaw, 'mossmere');
eq(thr.map((x) => x.cls), ['prize', 'trophy', 'elder'], 'thresholds for the chiming classes');
near(thr[0].cm, data3.sizeLength(reedjaw, 1.04), 'Prize threshold = length at the Keeper cut (z 1.04)', 1e-9);
near(thr[2].cm, data3.sizeLength(reedjaw, 1.88 + 0.77), 'Elder threshold = length at z 2.65', 1e-9);
eq(V3.cordThresholds(data3, data3.SPECIES_BY_ID.belled_matriarch), [], 'a legend has no class thresholds');
eq(V3.cordThresholds(data1, data1.SPECIES_BY_ID.reedjaw_pike), [], 'v1 data → none');
eq(['small', 'keeper', 'prize', 'trophy', 'elder'].map((c) => V3.chimeClasses(c, data3).join('+')), ['', '', 'prize', 'prize+trophy', 'prize+trophy+elder'], 'chimes per class');
near(V3.cordDuration(data3, 'small'), 1.2 * 1.4 / 3.6, 'Small cord span', 1e-9);
near(V3.cordDuration(data3, 'elder'), 5.0 * 1.4 / 3.6, 'Elder cord span', 1e-9);
near(V3.cordDuration(data3, 'elder', { short: true }), 1.2 * 1.4 / 3.6, 'the 1.2 s variant during a swarm', 1e-9);
{
  const L = data3.sizeLength(reedjaw, 2.3), dur = V3.cordDuration(data3, 'trophy');
  const plan = V3.cordPlan({ length: L, dur, chimes: V3.chimeClasses('trophy', data3), thresholds: thr });
  ok(plan.ticks.length >= 6 && plan.ticks.length <= 28, `tick count ${plan.ticks.length}`);
  near(plan.ticks.at(-1).t, dur, 'the last knot lands on the stamp', 1e-9);
  near(plan.ticks.at(-1).cm, L, 'the last knot reads the full length', 1e-9);
  ok(plan.ticks.every((tk, i) => i === 0 || (tk.t > plan.ticks[i - 1].t && tk.pitch > plan.ticks[i - 1].pitch)), 'ticks rise in time and pitch');
  near(plan.ticks.at(-1).pitch, 2, 'an octave from first knot to last');
  eq(plan.chimes.map((c) => c.cls), ['prize', 'trophy'], 'a Trophy rings Prize then Trophy');
  for (const ch of plan.chimes) {
    const before = plan.ticks.filter((tk) => tk.cm <= ch.cm + 1e-9).at(-1), after = plan.ticks.find((tk) => tk.cm >= ch.cm - 1e-9);
    ok((!before || before.t <= ch.t + 1e-9) && (!after || ch.t <= after.t + 1e-9), `the ${ch.cls} chime rings as the count crosses ${ch.cm.toFixed(1)} cm`);
  }
}

section('audio-v3: seals');
eq(['small', 'keeper', 'prize', 'trophy', 'elder'].map((c) => V3.sealOf(c, data3)), [null, null, 'inkStamp', 'oxbloodWax', 'blackWaxRibbon'], 'seal per class (data.SIZE_CLASSES)');
eq(V3.sealOf('keeper', data3, { legendary: true }), 'blackWaxRibbon', 'a legend takes the black wax');
eq([V3.goldThread({ ancient: true }), V3.goldThread({ legendary: true }), V3.goldThread({})], [true, true, false], 'the gold thread');

// =================================================================== 2. audio.js on v3 data
const v3run = (o = {}) => ({ id: 'r1', zone: 'mossmere', day: 1, phase: 'calm', hp: 5, oil: 60, outing: 'normal', nightMode: 'lantern', ...o });

section('audio.js v3: class bite tells (fishing:tell → the tell on the float; fishing:bite → the alert)');
{
  const h = makeAudioHarness({ create, data: data3, run: v3run() });
  const { ctx, bus } = h;
  ctx.fishing.bobberPos = { x: 8, z: -10 };
  for (const c of data3.SIZE_CLASSES) {
    const tell = c.bite, sfx = V3.tellSfx(tell), lead = 0.6, dur = V3.TELL_DUR[tell] === undefined ? 0 : (tell === 'dragUnder' ? data3.BALANCE.bite.dragUnder : V3.TELL_DUR[tell]);
    ctx.fishing.state = 'waiting';
    const g0 = ctx.time.gameT, n0 = h.log().length;
    bus.emit('fishing:tell', { speciesId: 'reedjaw_pike', sizeClass: c.id, biteTell: tell, lead });
    let heardAt = null;
    for (let i = 0; i < 20 && heardAt === null; i++) {
      if (h.log().slice(n0).some((e) => e.name === sfx)) heardAt = ctx.time.gameT - g0;
      else h.step(0.05);
    }
    ok(heardAt !== null, `${c.id}: ${sfx} plays on fishing:tell`);
    near(heardAt, lead - dur, `${c.id}: ${sfx} starts with the float's tell (${(lead - dur).toFixed(2)} s after the event)`, 0.051);
    const e = h.log().slice(n0).find((x) => x.name === sfx);
    ok(e && e.pan > 0, `${c.id}: the tell is panned to the float (right): ${e?.pan}`);
    // the "!": state bite, then fishing:bite with the v3 payload
    while (ctx.time.gameT - g0 < lead) h.step(0.05);
    ctx.fishing.state = 'bite';
    bus.emit('fishing:state', { state: 'bite', prev: 'waiting' });
    bus.emit('fishing:bite', { speciesId: 'reedjaw_pike', sizeClass: c.id, biteTell: tell });
    const after = h.log().slice(n0);
    eq(count(after, sfx), 1, `${c.id}: the tell sounds once`);
    eq(count(after, 'bite'), 1, `${c.id}: the bite alert rings on fishing:bite`);
    ctx.fishing.state = 'idle'; bus.emit('fishing:state', { state: 'idle', prev: 'bite' });
    h.step(1);
  }
  // a v3 bite with no tell event (debug.forceBite): the tell voices at the bite
  let n0 = h.log().length;
  ctx.fishing.state = 'bite';
  bus.emit('fishing:bite', { speciesId: 'reedjaw_pike', sizeClass: 'trophy', biteTell: 'flatSlide' });
  eq(names(h.log().slice(n0)), ['bite_flat', 'bite'], 'a bite without a tell event voices its tell, then the alert');
  ctx.fishing.state = 'idle'; h.step(1);
  // a tell cut short before its float moves (an early tap spooks the fish): never voiced
  n0 = h.log().length;
  ctx.fishing.state = 'waiting';
  bus.emit('fishing:tell', { speciesId: 'reedjaw_pike', sizeClass: 'trophy', biteTell: 'flatSlide', lead: 0.6 });
  h.step(0.05);
  ctx.fishing.state = 'idle'; bus.emit('fishing:state', { state: 'idle', prev: 'waiting' }); bus.emit('fishing:miss', { reason: 'early' });
  h.step(1);
  eq(count(h.log().slice(n0), 'bite_flat'), 0, 'a tell whose bite never comes stays silent');
  // … and one already under way (the dome starts at once) fades out
  ctx.fishing.state = 'waiting';
  n0 = h.log().length;
  bus.emit('fishing:tell', { speciesId: 'reedjaw_pike', sizeClass: 'elder', biteTell: 'dome', lead: 0.6 });
  eq(count(h.log().slice(n0), 'bite_dome'), 1, 'the dome bulges at once (its tell spans the whole lead)');
  h.step(0.1);
  const tr = h.ac.trace.length;
  ctx.fishing.state = 'idle'; bus.emit('fishing:state', { state: 'idle', prev: 'waiting' });
  ok(h.ac.trace.slice(tr).some((x) => /\.gain\.lin\(0,/.test(x)), 'a tell under way fades when its bite never comes');
  h.step(1);
  h.done();
}

section('audio.js v3: rise rings (sign:spawn kind rise → plip / gulp, placed on the ring)');
{
  const h = makeAudioHarness({ create, data: data3, run: v3run() });
  const { bus } = h;
  let n0 = h.log().length;
  bus.emit('sign:spawn', { id: 1, kind: 'rise', x: -10, z: 0, sizeClass: 'keeper' });
  let e = h.log().slice(n0);
  eq(names(e), ['rise_plip'], 'a Keeper rise plips');
  ok(e[0]?.pan < 0, `left of the Wick → panned left (${e[0]?.pan})`);
  h.step(0.3);
  n0 = h.log().length;
  bus.emit('sign:spawn', { id: 2, kind: 'rise', x: 12, z: 0, sizeClass: 'elder' });
  e = h.log().slice(n0);
  eq(names(e), ['rise_gulp'], 'an Elder rise gulps');
  ok(e[0]?.pan > 0, `right of the Wick → panned right (${e[0]?.pan})`);
  n0 = h.log().length;
  bus.emit('sign:rise', { id: 2, kind: 'rise', x: 12, z: 0, sizeClass: 'elder' });
  eq(count(h.log().slice(n0), 'rise_gulp'), 0, 'a sign:rise for the ring just heard is deduped');
  h.step(1.2);
  bus.emit('sign:rise', { id: 2, kind: 'rise', x: 12, z: 0, sizeClass: 'elder' });
  eq(count(h.log().slice(n0), 'rise_gulp'), 1, 'the next ring of that sign gulps again');
  n0 = h.log().length;
  bus.emit('sign:spawn', { id: 3, kind: 'boil', x: 4, z: 4, sizeClass: 'prize' });
  eq(h.log().slice(n0).filter((x) => /^rise_/.test(x.name)).length, 0, 'other signs are not rises');
  h.done();
}

section('audio.js v3: the measuring ceremony (cord ticks, class chimes, the seal)');
function ceremony(h, { speciesId, z, uid, stopAt = null }) {
  const { ctx, bus } = h;
  const sp = data3.SPECIES_BY_ID[speciesId];
  const sizeClass = data3.sizeClassOf(z), length = Math.round(data3.sizeLength(sp, z) * 10) / 10;
  bus.emit('fishing:caught', { speciesId, weight: 1, quality: 'normal', z, sizeClass, ancient: data3.isAncient(z), length, fish: { uid }, zone: 'mossmere' });
  const n0 = h.log().length;
  for (const phase of ['scoop', 'pose']) { ctx.fishing.view.measure = { phase, length: 0, sizeClass: null, seal: null }; h.step(0.4); }
  ctx.fishing.view.measure = { phase: 'cord', length: 0, sizeClass, seal: null };
  h.step(0.05);
  const cordStart = h.ac.currentTime;
  const dbg = ctx.debug.audio();
  const dur = V3.cordDuration(data3, sizeClass);
  h.step(stopAt === null ? dur : stopAt);
  ctx.fishing.view.measure = { phase: 'banners', length, sizeClass, seal: V3.sealOf(sizeClass, data3) };
  const stampNow = h.ac.currentTime, traceAt = h.ac.trace.length;
  bus.emit('fish:measured', { speciesId, z, sizeClass, ancient: data3.isAncient(z), length, weight: 1, favours: [], records: [{ kind: 'pb' }, { kind: 'oldLedger' }], fish: { uid }, cove: false });
  bus.emit('fish:landed', { fish: { uid }, isNew: false, species: sp, measured: true, sizeClass, length });
  const log = h.log().slice(n0);
  const cancels = h.ac.trace.slice(traceAt).filter((s) => /\.gain\.cancel\(/.test(s)).length;
  h.step(1.5);
  ctx.fishing.view.measure = null; h.step(0.1);
  return { log, dbg, cordStart, stampNow, dur, length, sizeClass, cancels };
}
{
  const h = makeAudioHarness({ create, data: data3, run: v3run() });
  const r = ceremony(h, { speciesId: 'reedjaw_pike', z: 2.3, uid: 'f1' });
  const ticks = r.log.filter((e) => e.name === 'cord_tick'), chimes = r.log.filter((e) => e.name === 'class_chime');
  eq(r.sizeClass, 'trophy', 'z 2.3 is a Trophy');
  ok(r.dbg.cord && r.dbg.cord.ticks === ticks.length && ticks.length >= 6, `the cord beat schedules its knots (${ticks.length})`);
  ok(ticks.every((e) => e.at >= r.cordStart - 0.06 && e.at <= r.cordStart + 0.001), 'the knots are issued when the cord beat starts');
  near(ticks.at(-1).t - ticks[0].at, r.dur, 'the last knot lands at the end of the cord beat', 0.02);
  ok(ticks.every((e, i) => i === 0 || e.t > ticks[i - 1].t), 'knots tick up in order');
  eq(chimes.map((e) => e.why), ['prize', 'trophy'], 'a chime as the count crosses Prize, then Trophy');
  const plan = V3.cordPlan({ length: r.length, dur: r.dur, chimes: ['prize', 'trophy'], thresholds: V3.cordThresholds(data3, reedjaw, 'mossmere') });
  for (let i = 0; i < chimes.length; i++) near(chimes[i].t - ticks[0].t + plan.ticks[0].t, plan.chimes[i].t, `${chimes[i].why} chime at its threshold`, 0.01);
  const stamp = r.log.filter((e) => e.name === 'seal_stamp');
  eq(stamp.map((e) => e.why), ['oxbloodWax'], 'fish:measured stamps the oxblood wax seal');
  near(stamp[0].t, r.stampNow, 'the stamp lands on fish:measured', 0.01);
  const bell = r.log.find((e) => e.name === 'murk_bell_far');
  ok(bell && bell.t > stamp[0].t + 0.8, 'an Old Ledger record rings Murk\'s far bell after the stamp');
  const fan = r.log.find((e) => e.name === 'catch_fanfare');
  ok(fan && fan.t >= stamp[0].t + 0.29, 'the card fanfare waits for the seal');
  // an Elder skipped mid-cord: the stamp lands at once and the knots still due fall silent
  const s = ceremony(h, { speciesId: 'reedjaw_pike', z: 3.3, uid: 'f2', stopAt: 0.3 });
  eq(s.log.filter((e) => e.name === 'class_chime').map((e) => e.why), ['prize', 'trophy', 'elder'], 'an Elder rings all three chimes');
  const due = s.log.filter((e) => (e.name === 'cord_tick' || e.name === 'class_chime') && e.t > s.stampNow + 0.001).length;
  ok(due > 0 && s.cancels >= due, `a skipped ceremony silences the ${due} knots / chimes still due (${s.cancels} silenced)`);
  eq(s.log.filter((e) => e.name === 'seal_stamp').map((e) => e.why), ['blackWaxRibbon'], 'an Elder (Ancient) gets the black wax seal');
  // a Small fish: the cord ticks with no chime, no seal (only the ink dab)
  const k = ceremony(h, { speciesId: 'dusk_minnow', z: -0.9, uid: 'f3' });
  eq(k.log.filter((e) => e.name === 'class_chime').length, 0, 'a Small rings no chime');
  ok(k.log.filter((e) => e.name === 'cord_tick').length >= 6, 'a Small still ticks its cord');
  eq(k.log.filter((e) => e.name === 'seal_stamp').map((e) => e.why), ['small'], 'a Small gets the plain ink dab, no seal');
  h.done();
}
{
  // no ceremony on screen (P1 fishing measures at once): fish:measured plays the cord compressed, then the stamp
  const h = makeAudioHarness({ create, data: data3, run: v3run() });
  const n0 = h.log().length, now = h.ac.currentTime;
  const L = Math.round(data3.sizeLength(reedjaw, 1.5) * 10) / 10;
  h.bus.emit('fish:measured', { speciesId: 'reedjaw_pike', z: 1.5, sizeClass: 'prize', ancient: false, length: L, records: [], fish: { uid: 'g1' }, cove: false });
  const log = h.log().slice(n0);
  const ticks = log.filter((e) => e.name === 'cord_tick'), stamp = log.find((e) => e.name === 'seal_stamp');
  ok(ticks.length >= 4, `fallback: the cord still ticks (${ticks.length})`);
  eq(log.filter((e) => e.name === 'class_chime').map((e) => e.why), ['prize'], 'fallback: the Prize chime');
  ok(stamp && stamp.why === 'inkStamp' && stamp.t >= ticks.at(-1).t, 'fallback: the ink stamp lands after the last knot');
  near(stamp.t - now, V3.compactCordDuration('prize') + 0.045, 'fallback: the stamp waits for the compact cord', 0.01);
  // a legend: no chimes, the black wax with the gold thread
  const n1 = h.log().length;
  h.step(2);
  h.bus.emit('fish:measured', { speciesId: 'belled_matriarch', z: 0, sizeClass: 'keeper', ancient: false, length: 300, records: [], fish: { uid: 'g2' } });
  const lg = h.log().slice(n1);
  eq(lg.filter((e) => e.name === 'class_chime').length, 0, 'a legend rings no class chime');
  eq(lg.filter((e) => e.name === 'seal_stamp').map((e) => e.why), ['blackWaxRibbon'], 'a legend takes the black wax');
  h.done();
}

section('audio.js v3: Night Rise and the Stillnight bed');
function nightHarness({ mode, day = 1, swarm = false, data = data3, nightMode = mode }) {
  const run = v3run({ nightMode, day, phase: 'dusk' });
  if (!nightMode) delete run.nightMode;
  const combat = { enemies: [], swarmActive: false, nightMode: mode || null };
  const h = makeAudioHarness({ create, data, run, combat });
  h.ctx.survival.info = { phase: 'dusk', day, time: 18, duration: 20, k: 0.9, isNight: false, ...(mode ? { swarm: null, nightMode: mode } : {}) };
  h.step(1);
  run.phase = 'gloomtide';
  h.ctx.survival.info = { phase: 'gloomtide', day, time: 0, duration: 90, k: 0, isNight: true, ...(mode ? { swarm, nightMode: mode } : {}) };
  const n0 = h.log().length;
  h.bus.emit('phase:change', { phase: 'gloomtide', prev: 'dusk', day, ...(mode ? { nightMode: mode, swarm } : {}) });
  return { h, n0, run, combat };
}
/** Step `seconds` and collect the music moods seen. */
function moodsOver(h, seconds) { const seen = new Set(); for (let t = 0; t < seconds; t += 0.25) { h.step(0.25); seen.add(h.audio.getMood()); } return [...seen]; }
{
  const { h, n0 } = nightHarness({ mode: 'still' });
  const rise = h.log().slice(n0);
  eq(names(rise), ['night_rise'], 'Still: the night opens with the Night Rise motif, not the gloom rise');
  const moods = moodsOver(h, 8);
  eq(moods, ['stillnight'], 'Still: the Stillnight score, never the gloom mood');
  const d = h.ctx.debug.audio();
  ok(d.loops.bed === true, 'Still: the Stillnight bed loop runs');
  ok(count(h.log().slice(n0), 'stillnight_bed') >= 1, 'Still: the bed breathes (stillnight_bed)');
  eq([d.auto, d.nightMode], ['stillnight', 'still'], 'debug.audio(): auto mood and night mode');
  // under the pause (or a modal) the night air keeps on, softer, and the frogs fall quiet until the night runs again
  h.ctx.paused = true;
  const nb = count(h.log(), 'stillnight_bed');
  h.step(8);
  ok(h.ctx.debug.audio().loops.bed === true && count(h.log(), 'stillnight_bed') === nb, 'paused: the air keeps on, no breaths');
  h.ctx.paused = false;
  h.step(6);
  ok(count(h.log(), 'stillnight_bed') > nb, 'unpaused: the breaths return');
  // dawn: the bed stops with the night
  h.run = null;
  h.ctx.state.run.phase = 'dawn'; h.ctx.survival.info = { phase: 'dawn', day: 1, time: 0, duration: 10, k: 0, isNight: false };
  h.bus.emit('phase:change', { phase: 'dawn', prev: 'gloomtide', day: 1, nightMode: 'still' });
  h.step(6);
  eq([h.audio.getMood(), h.ctx.debug.audio().loops.bed], ['calm', false], 'dawn: the calm score, the bed gone');
  h.done();
}
{
  const { h, n0 } = nightHarness({ mode: 'lantern', day: 1, swarm: false });
  eq(names(h.log().slice(n0)), ['night_rise'], "Lantern's quiet night: Night Rise");
  eq(moodsOver(h, 6), ['stillnight'], "Lantern's quiet night is a Stillnight");
  h.done();
}
{
  const { h, n0, combat } = nightHarness({ mode: 'lantern', day: 2, swarm: true });
  eq(names(h.log().slice(n0)), ['night_rise'], 'Lantern swarm night: Night Rise opens it too');
  eq(moodsOver(h, 3), ['gloom'], 'Lantern swarm night: the gloom mood while the swarm is due');
  let n1 = h.log().length;
  combat.swarmActive = true;
  h.bus.emit('swarm:window', { state: 'open', night: 2, mode: 'lantern' });
  eq(names(h.log().slice(n1)), ['gloom_rise'], 'the swarm window opens with the gloom rise');
  eq(moodsOver(h, 4), ['gloom'], 'inside the window: gloom');
  ok(!h.ctx.debug.audio().loops.bed, 'no bed while the swarm is out');
  n1 = h.log().length;
  combat.swarmActive = false;
  h.bus.emit('swarm:window', { state: 'close', night: 2, mode: 'lantern', reason: 'window' });
  eq(h.log().slice(n1).filter((e) => e.name === 'night_rise').map((e) => e.why), ['tail'], 'the window closes: Night Rise again for the quiet tail');
  const tail = moodsOver(h, 8);
  eq(tail.at(-1), 'stillnight', `the quiet tail is a Stillnight (${tail.join(' → ')})`);
  ok(h.ctx.debug.audio().loops.bed, 'the bed returns for the tail');
  h.done();
}
{
  const { h, n0, run } = nightHarness({ mode: 'lantern', day: 2, swarm: false });
  run.lampWatch = { lampId: 'se_buoy', x: 0, z: 0, forced: false };
  eq(moodsOver(h, 4), ['stillnight'], 'a lamp-watch (no swarm tonight) is a Stillnight');
  ok(names(h.log().slice(n0)).includes('night_rise'), 'the lamp-watch night still rises');
  h.done();
}
{
  const { h, n0 } = nightHarness({ mode: 'gloomtide', day: 1, swarm: true });
  const log = h.log().slice(n0);
  eq(names(log), ['gloom_rise', 'night_rise'], 'Gloomtide: the gloom rise, then Night Rise');
  const nr = log.find((e) => e.name === 'night_rise');
  near(nr.t - nr.at, 2.605, 'Gloomtide: Night Rise follows the swarm\'s rise by 2.6 s', 0.01);
  eq(moodsOver(h, 4), ['gloom'], 'Gloomtide nights keep the gloom mood');
  h.done();
}
{
  const { h, n0 } = nightHarness({ mode: 'still', nightMode: 'still' });
  h.done();
  // The First Outing (meta.runs 0) is all still whatever the run's mode reads
  const g = nightHarness({ mode: null, nightMode: 'lantern' });
  g.run.outing = 'first';
  g.h.ctx.combat.nightMode = undefined;
  eq(g.h.ctx.debug.audio().nightMode, 'still', 'the First Outing reads Still');
  g.h.done();
  void n0;
}
{
  const { h, n0 } = nightHarness({ mode: null, nightMode: null, data: data1 });
  eq(names(h.log().slice(n0)), ['gloom_rise'], 'v1 data: the gloom rise only');
  eq(moodsOver(h, 4), ['gloom'], 'v1 data: the gloom mood');
  ok(!h.ctx.debug.audio().loops.bed, 'v1 data: no bed');
  h.done();
}

// =================================================================== 3. flag-off parity with the pre-v3 audio
section('flag-off parity: the v1 event script against the pre-v3 audio (WebAudio trace)');
async function loadBase() {
  const ref = process.env.AUDIO_BASE_REF || '76c4329';
  const dir = resolve(here, '..', 'out', 'audio-base', ref);
  try {
    mkdirSync(dir, { recursive: true });
    for (const f of ['audio.js', 'audio-dsp.js', 'audio-music.js', 'audio-sfx.js']) {
      const src = execFileSync('git', ['show', `${ref}:gloomwater/src/${f}`], { cwd: here, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      writeFileSync(resolve(dir, f), src);
    }
  } catch { return null; }
  return { ref, mod: await import(pathToFileURL(resolve(dir, 'audio.js')).href) };
}
function v1Script(createFn, seed) {
  const run = { id: 'r1', zone: 'mossmere', day: 1, phase: 'calm', hp: 5, oil: 60 };
  const combat = { enemies: [] };
  const h = makeAudioHarness({ create: createFn, data: data1, run, combat, seed });
  const { ctx, bus } = h;
  const S = ctx.survival;
  const phase = (p, k = 0) => { run.phase = p; S.info = { phase: p, day: run.day, time: k * 60, duration: 60, k, isNight: p === 'gloomtide' }; };
  phase('calm');
  bus.emit('flow:change', { flow: 'playing', prev: 'title' }); bus.emit('run:start', { continued: false });
  h.step(2);
  ctx.player.speed = 5; h.step(2); ctx.player.speed = 0;
  ctx.fishing.state = 'charging';
  for (let c = 0; c <= 1; c += 0.1) { ctx.fishing.view = { charge: c, tension: 0, progress: 0 }; h.step(0.1); }
  bus.emit('fishing:cast', { power: 0.8 }); ctx.fishing.state = 'casting'; h.step(0.4);
  bus.emit('fishing:land', { position: { x: 3, z: -8 } }); ctx.fishing.state = 'waiting'; ctx.fishing.bobberPos = { x: 3, z: -8 }; h.step(1);
  bus.emit('fishing:nibble', {}); h.step(0.4);
  ctx.fishing.state = 'bite'; bus.emit('fishing:state', { state: 'bite', prev: 'waiting' }); bus.emit('fishing:bite', { speciesId: 'dusk_minnow' }); h.step(0.2);
  bus.emit('fishing:hook', { speciesId: 'dusk_minnow', perfect: true }); ctx.fishing.state = 'reeling';
  for (let i = 0; i < 40; i++) {
    ctx.input.down = i % 7 < 4;
    ctx.fishing.view = { tension: 0.3 + 0.7 * Math.abs(Math.sin(i / 6)), progress: i / 40, danger: i % 13 > 9 ? 0.8 : 0.1, surge: i % 11 === 0, surgeWarn: i % 17 === 0 ? 1 : 0, rarity: 'rare' };
    if (i === 20) bus.emit('fishing:surge', { strength: 1.2 });
    h.step(0.1);
  }
  ctx.fishing.state = 'landing'; h.step(1);
  bus.emit('fishing:caught', { speciesId: 'dusk_minnow', weight: 0.3, quality: 'perfect' }); ctx.fishing.state = 'idle'; ctx.fishing.view = { tension: 0, progress: 0 };
  bus.emit('fish:landed', { fish: { speciesId: 'dusk_minnow' }, isNew: true, isRecord: false, species: { rarity: 'uncommon' } });
  bus.emit('ui:modal', { open: true, id: 'catch' }); h.step(1.5);
  for (const a of ['keep', 'eat', 'render', 'sell', 'release']) { bus.emit('fish:action', { action: a }); h.step(0.4); }
  bus.emit('ui:modal', { open: false, id: 'catch' });
  bus.emit('shells:change', { shells: 40, delta: 12 }); bus.emit('shop:buy', {}); bus.emit('relic:buy', {}); bus.emit('interact:change', { id: 'merchant' });
  bus.emit('merchant:arrive', {}); h.step(1); bus.emit('merchant:leave', {}); bus.emit('player:anchor', { anchored: true }); h.step(1);
  phase('dusk', 0.1); bus.emit('phase:change', { phase: 'dusk', prev: 'calm', day: 1 }); h.step(4);
  phase('gloomtide', 0.05); bus.emit('phase:change', { phase: 'gloomtide', prev: 'dusk', day: 1 }); h.step(3);
  for (let i = 0; i < 6; i++) {
    const e = { id: i, position: { x: 2 + i, z: 1 }, elite: i === 4, hp: 3 };
    combat.enemies.push(e);
    bus.emit('enemy:spawn', { enemy: e }); bus.emit('enemy:hit', { enemy: e, position: e.position, amount: 1, crit: i % 2 === 0 });
    h.step(0.2);
  }
  bus.emit('xp:gain', { amount: 3 }); bus.emit('xp:gain', { amount: 4 }); bus.emit('levelup', {}); bus.emit('boon:chosen', {}); bus.emit('flare', {});
  run.hp = 1; bus.emit('player:damage', { amount: 1 }); h.step(2);
  const boss = { id: 'b', boss: true, hp: 40, position: { x: 0, z: 9 } };
  combat.enemies.push(boss); bus.emit('boss:spawn', { enemy: boss }); h.step(3);
  boss.hp = 0; bus.emit('boss:slain', { enemy: boss });
  for (const e of combat.enemies.splice(0)) bus.emit('enemy:slain', { enemy: e, position: e.position });
  bus.emit('enemy:steal', {}); run.hp = 3; bus.emit('player:heal', { amount: 2 }); bus.emit('resource:low', { resource: 'oil' });
  bus.emit('lantern:out', {}); h.step(0.6); bus.emit('lantern:lit', {}); h.step(2);
  phase('dawn'); bus.emit('phase:change', { phase: 'dawn', prev: 'gloomtide', day: 1 }); h.step(2);
  run.day = 2; phase('calm'); bus.emit('phase:change', { phase: 'calm', prev: 'dawn', day: 2 }); h.step(2);
  ctx.fishing.state = 'waiting'; bus.emit('fishing:miss', { reason: 'early' }); bus.emit('fishing:miss', { reason: 'late' }); ctx.fishing.state = 'idle';
  bus.emit('fishing:escaped', { reason: 'snap' }); h.step(0.5); bus.emit('fishing:escaped', { reason: 'slack' }); h.step(0.5);
  bus.emit('challenge:complete', {}); bus.emit('unlock', {}); bus.emit('bounty:complete', {}); bus.emit('gate:open', {}); h.step(2);
  bus.emit('zone:change', { zone: 'sporewood', prev: 'mossmere' }); run.zone = 'sporewood'; h.step(3);
  bus.emit('victory', {}); h.step(2);
  ctx.flow = 'dead'; bus.emit('player:died', { cause: 'gloom' }); bus.emit('flow:change', { flow: 'dead', prev: 'playing' }); bus.emit('run:end', {}); h.step(3);
  const trace = h.ac.trace.slice();
  h.done();
  return trace;
}
{
  const base = await loadBase();
  if (!base) console.log('  (skipped: git or the base commit is unavailable)');
  else {
    const a = v1Script(base.mod.create, 11), b = v1Script(create, 11);
    ok(a.length > 5000, `the script exercises the audio (${a.length} trace entries)`);
    eq(b.length, a.length, `trace length matches the pre-v3 audio at ${base.ref}`);
    const first = a.findIndex((x, i) => x !== b[i]);
    ok(first < 0, `the WebAudio trace is bit-identical to ${base.ref}${first < 0 ? '' : ` (first difference at #${first}: ${a[first]} vs ${b[first]})`}`);
  }
}

section('the landing payoff: the swell and the chime by class only (bigger is lower, longer and fuller); a new species adds a shimmer');
{
  const C = ['small', 'keeper', 'prize', 'trophy', 'elder', 'ancient'];
  const v = C.map((c) => V3.landingVoicing(c));
  ok(v.every((x, i) => i === 0 || (x.root < v[i - 1].root && x.swell > v[i - 1].swell && x.notes.length >= v[i - 1].notes.length)), 'each class rises lower and longer into a fuller chord');
  ok(!v[0].bell && !v[1].bell && v[3].bell && v[4].bell, 'the bronze bell from Trophy up');
  ok(V3.landingVoicing('keeper', { special: true }).shimmer > V3.landingVoicing('keeper').shimmer, 'a new species shimmers');
  ok(V3.landingClass({ sizeClass: 'elder', ancient: true }) === 'ancient' && V3.landingClass({ legend: true }) === 'ancient' && V3.landingClass({ sizeClass: 'prize' }) === 'prize' && V3.landingClass({}) === 'keeper', 'landingClass: an Ancient or a legend plays the top row');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
