// The Full Hold's evening (docs/loop/slice-1a/PLAN.md §2.2, lane B; §6.1's B line): main's pure guards (loop-rules.js) and its home
// flow (loop-home.js, driven with a fake player and a fake clock), fishing, survival, combat, player and audio under the loop, the
// five Wicks' fishing passives (docs/loop/WICKS.md §2: Taper, Stub, Ashwick; nothing for Tallow), the catch show's four leftovers
// (item 25: the audio side; the offline render's gates are tools/audio-render.mjs --set=show) and the film's line 3 (item 26).
// Every check runs on the real loop data (tools/tests/loop-fixture.mjs) and, where a branch must not move the built game, on the
// v3-without-loop data too.
//   node tools/tests/loop-evening.test.mjs   (or node tools/check.mjs)
if (typeof globalThis.document === 'undefined') {
  const noop = new Proxy(function () {}, {
    get: (t, k) => (k === 'createLinearGradient' || k === 'createRadialGradient' ? () => ({ addColorStop() {} })
      : (k === 'getImageData' || k === 'createImageData') ? (w = 1, h = 1) => ({ data: new Uint8ClampedArray(Math.max(1, (w | 0) * (h | 0)) * 4), width: w, height: h })
        : k === 'measureText' ? () => ({ width: 40 }) : noop),
    apply: () => undefined, set: () => true,
  });
  globalThis.document = { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => noop }) };
}
import * as THREE from 'three';
import { createBus, defaultMeta } from '../../src/core.js';
import * as R from '../../src/loop-rules.js';
import { createLoopHome } from '../../src/loop-home.js';

// the data: v3 without the loop first (its own module instance), then the loop's (the flags stay set, as a loop page has them)
globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
const DV3 = await import('../../src/data.js?evening-v3');
delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE;
const { loadLoopData, fakeLoop, tripRun, freshLoopMeta } = await import('./loop-fixture.mjs');
const D = await loadLoopData({ query: 'evening-loop' });
const { makeFishingEnv } = await import('./fishing-env.mjs');
const { create: createSurvival } = await import('../../src/survival.js');
const { create: createCombat } = await import('../../src/combat.js');
const { create: createPlayer } = await import('../../src/player.js');
const { create: createAudio } = await import('../../src/audio.js');
const AV3 = await import('../../src/audio-v3.js');
const { makeAudioHarness, seededRandom } = await import('./audio-env.mjs');

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
function near(a, b, msg, eps = 1e-6) { ok(Math.abs(a - b) <= eps, `${msg} (got ${a}, want ${b} ± ${eps})`); }
const section = (s) => console.log(`- ${s}`);
const note = (s) => console.log(`  note: ${s}`);
const flush = () => new Promise((r) => setImmediate(r));
const SP = (id) => D.SPECIES_BY_ID[id];

section('the data this file runs on');
ok(D.LOOP_ENABLED === true && D.V3_PHASE === 1 && Object.keys(D.PARKED).length === 31, 'the loop data (GW_LOOP, phase 1, the 31 parked keys)');
ok(DV3.LOOP_ENABLED === false && Object.keys(DV3.PARKED).length === 0, 'v3 without the loop: LOOP_ENABLED false, PARKED {}');

// =====================================================================================================================
section('loop-rules: main\'s pure guards (T31, T44, T49, T58, T62, T63)');
{
  ok(R.tripEndAllowed('home') && !['died', 'snuffed', 'abandoned', 'victory', 'unknown', undefined].some((c) => R.tripEndAllowed(c)), 'T31: a trip ends only with cause home');
  ok(R.tripStartAllowed({ flow: 'home', hasSavedTrip: false }) && R.tripStartAllowed({ flow: 'title', hasSavedTrip: false }), 'T31: a trip starts from home or the title');
  ok(!R.tripStartAllowed({ flow: 'home', hasSavedTrip: true }) && !R.tripStartAllowed({ flow: 'playing', hasSavedTrip: false }) && !R.tripStartAllowed({ flow: 'intro' }),
    'T31: never over a saved trip, never from the water or the film');
  eq(R.startRoute({ loopOn: true, intro: true }), 'home', 'T44: the film\'s hand-off goes home');
  eq(R.startRoute({ loopOn: true }), 'trip', 'T44: any other start is a trip');
  eq(R.startRoute({ loopOn: false, intro: true }), 'built', 'T44: off the loop the built route');
  const base = { flow: 'playing', outing: 'trip' };
  for (const st of ['idle', 'charging', 'casting', 'waiting']) eq(R.goHomeAllowed({ ...base, fishingState: st }), { ok: true, why: null }, `T49: home allowed in ${st}`);
  for (const st of ['bite', 'reeling', 'landing']) eq(R.goHomeAllowed({ ...base, fishingState: st }).why, 'play', `T49: ${st} → play`);
  eq(R.goHomeAllowed({ ...base, inShow: true }).why, 'show', 'T49: in the show → show');
  eq(R.goHomeAllowed({ ...base, cinematic: true }).why, 'show', 'T49: cinematic → show');
  eq(R.goHomeAllowed({ ...base, cardOpen: true }).why, 'card', 'T49: the card open → card');
  eq(R.goHomeAllowed({ ...base, blocking: true }).why, 'card', 'T49: a blocking screen → card');
  eq(R.goHomeAllowed({ ...base, blocking: true, fromPause: true, paused: true }), { ok: true, why: null }, 'T49: from the pause, its own blocking panel is no bar');
  eq(R.goHomeAllowed({ ...base, fishingState: 'lost', notePending: true }).why, 'note', 'T49: a got-away note pending → note');
  eq(R.goHomeAllowed({ ...base, paused: true }).why, 'flow', 'T49: paused without fromPause → flow');
  eq(R.goHomeAllowed({ flow: 'home', outing: 'trip' }).why, 'flow', 'T49: flow ≠ playing → flow');
  eq(R.goHomeAllowed({ flow: 'playing', outing: 'normal' }).why, 'flow', 'T49: not a trip → flow');
  ok(!R.tripKeyAllowed('KeyE') && !R.tripKeyAllowed('KeyF') && !R.tripKeyAllowed('Space'), 'T58: E, F and Space (outside a bite or a show) do nothing on a trip');
  ok(R.tripKeyAllowed('Space', { biting: true }) && R.tripKeyAllowed('Space', { inShow: true }) && R.tripKeyAllowed('KeyW') && R.tripKeyAllowed('Escape'), 'T58: the strike, the hurry, moving and Escape pass');
  const fresh = freshLoopMeta(D);
  ok(R.loopFreshSave(fresh, false), 'T62: a fresh loop block is fresh');
  ok(R.loopFreshSave({ ...defaultMeta(), runs: 7 }, false), 'T62: an old v3 save with runs and no loop block is fresh to the loop');
  ok(!R.loopFreshSave(fresh, true), 'T62: not with a trip saved');
  ok(!R.loopFreshSave({ ...fresh, loop: { ...fresh.loop, wick: 'stub' } }, false), 'T62: not with a Wick chosen');
  ok(!R.loopFreshSave({ ...fresh, loop: { ...fresh.loop, tutorial: { done: false, step: 'wake' } } }, false), 'T62: not with a tutorial record');
  ok(!R.loopFreshSave({ ...fresh, loop: { ...fresh.loop, evenings: 1 } }, false), 'T62: not after an evening sold');
  ok(R.filmAllowed({ intro: true, debug: false }) && R.filmAllowed({ intro: true, debug: true, optIn: true }), 'T63: the film plays in a release build, and in a debug build after the opt-in');
  ok(!R.filmAllowed({ intro: true, debug: true }) && !R.filmAllowed({ intro: false }), 'T63: not in a debug build without the opt-in, nor without the film');
  const p = R.homeGlidePath({ x: 35, z: -40 }, { x: 24, z: 38 }, 6, 2);
  near(Math.hypot(p[1][0] - p[0][0], p[1][1] - p[0][1]), 12, 'the sail home: 2 s of raft speed (6 m/s) toward the dock', 1e-9);
  const q = R.homeGlidePath({ x: 25, z: 39 }, { x: 24, z: 38 }, 6, 2);
  near(Math.hypot(q[1][0] - 24, q[1][1] - 38), 0, '… never past the dock', 1e-9);
  eq(R.homeGlidePath({ x: 24, z: 38 }, { x: 24, z: 38 }), null, '… and none when the raft is at the dock');
}

// =====================================================================================================================
// the home flow with a fake player and a fake clock (T63, T64, T66; rev. 4: the skips by tap and key, the `kind` option)
const DOCKS = [{ x: 24, z: 38, yaw: 0.6 }, { x: 49, z: 6, yaw: 1.1 }, { x: 35, z: -40, yaw: 2 }];
function homeEnv({ film = true, filmStarts = true, createFails = false, loopOver = {}, flow = 'title' } = {}) {
  const bus = createBus(), ev = [], calls = [], saves = [], reports = [];
  const origEmit = bus.emit.bind(bus);
  bus.emit = (e, p = {}) => { ev.push({ e, p }); origEmit(e, p); };
  const loop = fakeLoop({ D, onTrip: false, ...loopOver });
  const player = {
    position: { x: 0, z: 0 }, yaw: 0, g: null, glides: [],
    glide(path, o = {}) {
      const pts = path.map((p) => (Array.isArray(p) ? { x: p[0], z: p[1] } : { x: p.x, z: p.z }));
      this.position = { ...pts[0] };
      let res; const pr = new Promise((r) => { res = r; });
      this.g = { pts, o, t: 0, res };
      this.glides.push({ pts, o: { ...o } });
      calls.push(`glide:${o.kind}`);
      bus.emit('player:glide', { state: 'start', kind: o.kind || 'glide' });
      return pr;
    },
    step(dt) {
      const g = this.g; if (!g) return;
      g.t += dt;
      const k = Math.min(1, g.t / g.o.duration), a = g.pts[0], b = g.pts[g.pts.length - 1];
      this.position = { x: a.x + (b.x - a.x) * k, z: a.z + (b.z - a.z) * k };
      if (k >= 1) this.end();
    },
    end() { const g = this.g; if (!g) return; this.g = null; bus.emit('player:glide', { state: 'end', kind: g.o.kind || 'glide' }); g.res(false); },
    skipGlide() { if (!this.g || !this.g.o.skippable) return false; calls.push('skipGlide'); this.end(); return true; },
    teleport(p, yaw) { this.end(); this.position = { x: p.x, z: p.z }; this.yaw = yaw; calls.push('teleport'); },
  };
  const ui = { blocking: false, closeAll() { calls.push('closeAll'); this.blocking = false; }, isBlocking() { return this.blocking; }, isCatchOpen: () => false };
  const ctx = {
    THREE, bus, data: D, flow, paused: false, cinematic: false,
    state: { meta: freshLoopMeta(D), run: null },
    player, ui,
    progression: { createRun: (o) => { calls.push('createRun'); return createFails ? null : loop.createTrip(o); }, loop },
    actors: { merchant: { arrive() { calls.push('merchant.arrive'); }, leave() { calls.push('merchant.leave'); } }, setCharacter(id) { calls.push(`setCharacter:${id}`); } },
    world: { getDocks: () => DOCKS.map((d) => ({ position: new THREE.Vector3(d.x, 0, d.z), yaw: d.yaw })) },
    fishing: { state: 'idle', inShow: false, cancel(r) { calls.push(`cancel:${r}`); this.state = 'idle'; }, isAnchored: () => false },
  };
  let saved = null;
  const at = { wick: undefined, setChar: false };
  const H = createLoopHome({
    ctx, data: D, report: (w) => reports.push(w), lake: 'mossmere',
    setFlow: (f) => { const prev = ctx.flow; ctx.flow = f; if (prev !== f) bus.emit('flow:change', { flow: f, prev }); },
    resetBeats() {}, showLake: (id) => calls.push(`showLake:${id}`),
    save: () => { calls.push('save'); saves.push({ flow: ctx.flow, wick: loop.s.wick, tutorial: loop.s.tutorial ? { ...loop.s.tutorial } : null, ev: ev.length }); },
    savedRun: { get: () => saved, set: (r) => { saved = r; } },
    hasSavedRun: () => !!(saved && saved.active && saved.outing === 'trip'),
    lockRunMode() {},
    startIntro: () => { calls.push('startIntro'); at.wick = loop.s.wick; at.setChar = calls.includes(`setCharacter:${loop.s.wick}`); if (filmStarts) { ctx.flow = 'intro'; return true; } return false; },
    introOn: () => ({ intro: film, debug: false, optIn: false }),
  });
  const step = async (sec, dt = 1 / 30) => { const n = Math.round(sec / dt); for (let i = 0; i < n; i++) player.step(dt); await flush(); };
  return { ctx, H, loop, player, ui, ev, calls, saves, reports, at, step, setSaved: (r) => { saved = r; }, getSaved: () => saved, names: () => ev.map((x) => x.e) };
}
section('the opening: Start carries the Wick, then the film or the Jetty (T60, T63)');
{
  const E = homeEnv();
  ok(E.H.beginIntro({ character: 'stub' }) === true && E.calls.includes('startIntro'), 'T63: Start plays the film in one press');
  ok(E.at.wick === 'stub' && E.at.setChar, 'T60: the Wick is set (loop.setWick, actors.setCharacter) before the film starts');
  eq(E.ctx.flow, 'intro', '… the flow is the film\'s');
  const U = homeEnv();
  U.H.beginIntro({ character: 'nobody' });
  eq(U.loop.s.wick, 'wick', 'T60: an unknown id gives the Wick (data.loopWickId)');
  const N = homeEnv({ film: false });
  ok(N.H.beginIntro({ character: 'taper' }) === true && !N.calls.includes('startIntro'), 'T63: with no film (filmAllowed false) Start does not try one');
  eq(N.ctx.flow, 'home', 'T63: … it goes straight to flow home');
  eq(N.player.position, { x: 24, z: 38 }, 'T63: … the raft at the first dock');
  eq(N.loop.s.tutorial, { done: false, step: 'arrive' }, 'T63: … the tutorial begun (it opens at the wake)');
  eq(N.ev.find((x) => x.e === 'home:enter')?.p.from, 'new', 'T63: … home:enter {from: new}');
  ok(N.calls.indexOf('showLake:mossmere') >= 0 && N.calls.includes('merchant.arrive'), '… the Mossmere shown and Murk moored');
  ok(!('intro' in N.ctx.state.meta) || N.ctx.state.meta.intro === defaultMeta().intro, 'T63: meta.intro untouched');
  const F = homeEnv({ filmStarts: false });
  F.H.beginIntro({ character: 'ashwick' });
  ok(F.calls.includes('startIntro') && F.ctx.flow === 'home' && F.loop.s.wick === 'ashwick', 'a film that cannot start: the Jetty, the Wick kept');
  const S = homeEnv(); S.setSaved({ active: true, outing: 'trip' });
  ok(S.H.beginIntro({ character: 'wick' }) === false, 'no Start while a trip is saved');
  const T = homeEnv({ flow: 'home' });
  ok(T.H.beginIntro({}) === false, 'no Start outside the title');
}
section('the hand-off: intro → the 3 s glide home → the Jetty (T64)');
{
  const E = homeEnv(); E.ctx.flow = 'intro'; E.loop.setWick('tallow'); E.player.position = { x: 10, z: 20 };
  E.H.enterHome('intro');
  eq(E.ctx.flow, 'home', 'T64: flow home at once');
  ok(E.saves.length >= 1 && E.saves[0].flow === 'home' && E.saves[0].wick === 'tallow' && E.saves[0].tutorial?.done === false, 'T64: the save at its start holds the Wick and the tutorial (before the glide moves)');
  ok(E.calls.indexOf('merchant.arrive') >= 0 && E.calls.indexOf('merchant.arrive') < E.calls.indexOf('glide:home'), 'T64: Murk is moored when it starts');
  const g = E.player.glides[0];
  ok(g && g.o.kind === 'home' && g.o.duration === D.LOOP.tutorial.arrive && g.o.skippable === true, 'T64: a 3 s skippable glide, kind home');
  eq(g.pts[0], { x: 10, z: 20 }, 'T64: from the film\'s last place');
  eq(g.pts.at(-1), { x: 24, z: 38 }, 'T64: to docks[0]');
  ok(!E.names().includes('home:enter'), 'T64: home:enter waits for the glide');
  await E.step(1.5);
  ok(!E.names().includes('home:enter'), '… still gliding at 1.5 s');
  await E.step(1.6);
  eq(E.ev.find((x) => x.e === 'home:enter')?.p, { from: 'intro', tally: null }, 'T64: then home:enter {from: intro}');
  eq(E.player.position, { x: 24, z: 38 }, 'T64: the raft at the dock');
  const K = homeEnv(); K.ctx.flow = 'intro'; K.player.position = { x: 0, z: 10 };
  K.H.enterHome('intro');
  await K.step(0.4);
  eq(K.H.gliding(), 'home', 'H.gliding() names the running glide');
  ok(K.H.skipHomeGlide() === true, 'rev. 4: a tap (or a skip key) ends the glide');
  await flush();
  ok(K.names().includes('home:enter') && K.player.position.x === 24 && K.player.position.z === 38 && K.H.gliding() === null, '… at the dock, and the Jetty opens at once');
  ok(K.H.skipHomeGlide() === false, '… with no glide a skip does nothing');
}
section('the Chart\'s Sail: the glide out, then the trip (T66)');
{
  const E = homeEnv({ film: false });
  E.H.beginIntro({ character: 'wick' });
  E.ui.blocking = true;   // (the Chart is a blocking screen)
  E.calls.length = 0; E.ev.length = 0;
  ok(E.H.sail({ water: 'mossmere' }) === true, 'Sail');
  eq(E.loop.s.tutorial, { done: true, step: null }, 'T66: the first Sail saves the tutorial done before anything moves');
  ok(E.calls.indexOf('closeAll') >= 0 && E.calls.indexOf('closeAll') < E.calls.indexOf('glide:sailOut') && E.ui.blocking === false, 'T66: the screens close before the glide (R17)');
  const g = E.player.glides.at(-1), plan = D.sailPlan({ x: 24, z: 38 }, { x: 0, z: 0 }, D.LOOP.tutorial, 'mossmere');
  ok(g.o.kind === 'sailOut' && g.o.duration === D.LOOP.tutorial.out && g.o.skippable, 'T66: a 3 s glide, kind sailOut, skippable');
  eq(g.pts.at(-1), plan.to, 'T66: to sailPlan(dock, centre).to');
  near(Math.hypot(g.pts[0].x - 24, g.pts[0].z - 38), 0, 'T66: from the dock', 1e-9);
  ok(E.H.sail({ water: 'mossmere' }) === false, 'a second Sail while the glide runs is ignored');
  await E.step(2.5);
  ok(!E.names().includes('run:start') && E.ctx.flow === 'home', 'T66: run:start never fires before the glide ends');
  await E.step(0.6);
  eq(E.ctx.flow, 'playing', 'T66: then the trip');
  const zc = E.ev.find((x) => x.e === 'zone:change');
  eq(zc?.p, { zone: 'mossmere', prev: null, sail: true }, 'T66: zone:change {prev: null, sail: true}');
  ok(E.names().indexOf('zone:change') < E.names().indexOf('run:start'), '… then run:start');
  eq(E.player.position, plan.to, 'T66: after run:start the raft is at the glide\'s end (no respawn jump)');
  ok(E.ctx.state.run?.outing === 'trip' && !E.calls.includes('merchant.leave'), 'the run is a trip; Murk stays moored (M1 step 5a: startTrip never calls merchant.leave)');
  // a trip that ended near docks[2]: the sail home leaves the raft at docks[0], and the next Sail starts there
  E.player.position = { x: 33, z: -36 };
  E.ev.length = 0;
  ok(E.H.endTripHome('home') === true, 'Home');
  ok(E.loop.calls.some((c) => c.name === 'endTrip'), 'endTrip pays (and saves) first');
  ok(E.names().includes('run:end') && !E.names().includes('home:enter'), 'run:end, then the sail home');
  eq(E.ev.find((x) => x.e === 'run:end')?.p, { summary: null, cause: 'home' }, 'run:end {summary: null, cause: home}');
  const h = E.player.glides.at(-1);
  ok(h.o.kind === 'home' && h.o.duration === 2, 'the sail home: a 2 s glide, kind home');
  await E.step(2.1);
  const he = E.ev.find((x) => x.e === 'home:enter');
  ok(he?.p.from === 'trip' && he.p.tally && he.p.tally.id, 'home:enter {from: trip, tally} after the run:end');
  ok(E.names().indexOf('run:end') < E.names().indexOf('home:enter'), '… in that order (ui\'s run:end closes its screens first)');
  eq(E.player.position, { x: 24, z: 38 }, 'T66: the raft at docks[0]');
  E.H.sail({ water: 'mossmere' });
  const n = E.player.glides.at(-1);
  ok(Math.hypot(n.pts[0].x - 24, n.pts[0].z - 38) <= 0.5, 'T66: every later Sail glides too, from where the raft is (≤ 0.5 m)');
  await E.step(1);
  E.H.skipHomeGlide(); await flush();
  ok(E.ctx.flow === 'playing' && E.player.position.x === plan.to.x, 'a tap ends the glide out at its end and the trip starts');
}
section('the trip\'s ends and refusals (T31, T45, PLAN CHOICE 5)');
{
  const E = homeEnv({ film: false }); E.H.beginIntro({ character: 'wick' }); E.H.sail({}); await E.step(3.2);
  ok(E.H.endTripHome('died') === false && E.reports.includes('endRun') && E.ctx.flow === 'playing', 'T31: endRun(died) is refused and reported; the trip goes on');
  ok(E.H.endTripHome('abandoned') === false, 'T31: … abandoned too');
  E.ctx.fishing.state = 'bite';
  eq(E.H.canGoHome(), { ok: false, why: 'play' }, 'canGoHome during a bite: play');
  ok(E.H.goHome() === false && E.ctx.flow === 'playing', 'goHome refused during a play');
  E.ctx.fishing.state = 'waiting';
  ok(E.H.goHome() === true && E.calls.includes('cancel:home'), 'goHome while waiting: the line is reeled in (cancel home), then the trip ends');
  const P = homeEnv({ flow: 'home' }); P.setSaved({ active: true, outing: 'trip' });
  ok(P.H.sail({}) === false && P.H.startTrip({}) === false, 'T31: no Sail and no trip while a trip is saved');
  const Q = homeEnv({ flow: 'home' }); const desc = { active: true, outing: 'normal', id: 'old' }; Q.setSaved(desc);
  ok(Q.H.startTrip({}) === true && Q.loop.s.parkedRun === desc, 'PLAN CHOICE 5: a saved descent is parked at the first trip');
  const C = homeEnv({ flow: 'home', createFails: true });
  ok(C.H.startTrip({}) === false && C.ctx.flow === 'home' && C.reports.includes('startTrip'), 'no trip created: reported, the Wick stays home');
  const S = homeEnv({ flow: 'home', createFails: true });
  S.H.sail({}); await S.step(3.2);
  ok(S.ctx.flow === 'home' && S.player.position.x === 24, '… after a Sail, back at the dock');
  const O = homeEnv({ flow: 'home', loopOver: { maps: { lakes: ['mossmere'], places: [] } } });
  ok(O.H.sail({ water: 'sporewood' }) === false, 'v8: a water that is not open cannot be sailed to');
  const T = homeEnv(); T.ctx.flow = 'title';
  ok(T.H.enterHome('title') && T.ctx.flow === 'home' && T.ev.find((x) => x.e === 'home:enter')?.p.from === 'title', 'the title\'s Continue at home: home:enter {from: title}');
  ok(T.loop.s.tutorial?.done === false, 'rev. 4: every enterHome begins a missing tutorial');
}

// =====================================================================================================================
// M1 step 3a (docs/loop/m1-step3a/PLAN.md §2.2 item 5, PLAN CHOICEs 7, 8, 24): the lift at a trip's start, Sail toward a place
function liftEnv({ own = ['lily_maze', 'bell_pool'], lifted = [], reduced = false, pick = null } = {}) {
  const E = homeEnv({ flow: 'home', loopOver: { maps: { lakes: ['mossmere'], places: own.slice() }, lifted: lifted.slice(), tutorial: { done: true, step: null }, chartPick: pick } });
  const C = E.calls;
  Object.assign(E.ctx.world, {
    liftMist: (id, s) => { C.push(`liftMist:${id}:${s}`); return true; },
    placeAnchor: (id) => ({ ...D.loopPlace(id).landmark }),
    setPlaces: (p) => { C.push(`setPlaces:${p.owned.join('+')}|${p.lifted.join('+')}`); },
  });
  E.ctx.render = { frameLandmark: (p, o = {}) => { C.push(`frame:${p ? `${p.x},${p.z}` : 'null'}:${o.dur ?? '-'}:${o.back ?? '-'}`); return true; } };
  if (reduced) E.ctx.state.meta.settings = { ...(E.ctx.state.meta.settings || {}), reducedMotion: true };
  /** the lift's clock: n seconds of main's frame at dt (and the fake world's events at their times) */
  E.run = (sec, dt = 1 / 30) => { const n = Math.round(sec / dt); for (let i = 0; i < n; i++) { E.ctx.time = { t: (E.ctx.time?.t || 0) + dt }; E.H.update(dt); } };
  E.lifts = () => E.ev.filter((x) => x.e === 'place:lift').map((x) => `${x.p.placeId}:${x.p.phase}`);
  return E;
}
section('M1 step 3a: the lift at a trip\'s start (T128)');
{
  const E = liftEnv();
  ok(E.H.sail({ water: 'mossmere' }) === true, '(Sail with two places owned and not lifted)');
  await E.step(3.2);
  eq(E.ctx.flow, 'playing', '(the trip)');
  ok(E.calls.some((c) => c === 'setPlaces:lily_maze+bell_pool|'), 'T128: world.setPlaces({owned, lifted}) at run:start (nothing lifted yet)');
  eq(E.lifts(), ['lily_maze:start'], 'T128: after the glide out and run:start the first due place\'s lift begins (price order: the Lily Maze)');
  ok(E.names().indexOf('run:start') < E.names().indexOf('place:lift'), '… after run:start');
  const st = E.ev.find((x) => x.e === 'place:lift').p;
  eq(st, { placeId: 'lily_maze', phase: 'start', name: 'The Lily Maze' }, 'T128: place:lift {placeId, phase: start, name}');
  ok(E.calls.includes(`liftMist:lily_maze:${D.LOOP.lift.thin}`), `T128: world.liftMist(id, ${D.LOOP.lift.thin})`);
  const lm = D.loopPlace('lily_maze').landmark;
  ok(E.calls.includes(`frame:${lm.x},${lm.z}:${D.LOOP.lift.thin + D.LOOP.lift.title}:${D.LOOP.lift.back}`), 'T128: render.frameLandmark(the landmark, {dur: thin + title, back})');
  ok(E.ctx.cinematic === true && E.H.lifting() === 'lily_maze', 'T128: ctx.cinematic on; lifting() names the place');
  eq(E.H.canGoHome(), { ok: false, why: 'show' }, 'T128: no Home press during it');
  E.run(2.9);
  eq(E.lifts(), ['lily_maze:start'], '… still thinning at 2.9 s');
  E.run(0.15);
  eq(E.lifts(), ['lily_maze:start', 'lily_maze:title'], `T128: {phase: title} at ${D.LOOP.lift.thin} s`);
  eq(E.ev.filter((x) => x.e === 'place:lift').at(-1).p.name, 'The Lily Maze', '… with the place\'s name');
  ok(!E.loop.s.lifted.includes('lily_maze'), 'T112: not marked before its end (a reload here replays it)');
  E.run(1.1);
  ok(!E.lifts().includes('lily_maze:end') && E.ctx.cinematic, '… the title holds to 4.2 s');
  E.run(0.15);
  ok(E.lifts().includes('lily_maze:end') && E.loop.s.lifted.includes('lily_maze'), `T128: {phase: end} and markLifted at ${D.LOOP.lift.thin + D.LOOP.lift.title} s`);
  ok(E.calls.some((c) => c === 'setPlaces:lily_maze+bell_pool|lily_maze'), '… the places synced with it lifted');
  eq(E.lifts().at(-1), 'bell_pool:start', 'PLAN CHOICE 24: the next due lift follows (the Bell Pool)');
  ok(E.ctx.cinematic === true, 'T128: ctx.cinematic true throughout');
  E.run(4.3);
  ok(E.lifts().includes('bell_pool:end') && E.ctx.cinematic === false && E.H.lifting() === null, 'T128: after the last, cinematic off and nothing lifting');
  eq(E.loop.s.lifted, ['lily_maze', 'bell_pool'], '… both lifted, in price order');
  eq(E.H.canGoHome(), { ok: true, why: null }, '… and Home is open again');
  // a tap (or a skip key: main routes both to skipLift) ends the running lift at once
  const K = liftEnv();
  K.H.sail({ water: 'mossmere' }); await K.step(3.2); K.run(1);
  ok(K.H.skipLift() === true, 'T128: a tap or a skip key ends the running lift');
  ok(K.lifts().includes('lily_maze:end') && K.loop.s.lifted.includes('lily_maze'), '… at once, marked');
  ok(K.calls.includes('liftMist:lily_maze:0') && K.calls.some((c) => c.startsWith('frame:null')), '… the bank gone (liftMist(id, 0)) and the camera sent back');
  eq(K.lifts().at(-1), 'bell_pool:start', '… then the next due lift');
  K.H.skipLift();
  ok(K.H.skipLift() === false && K.ctx.cinematic === false, '… with none running a skip does nothing');
  // reduced motion: no thinning, the title still shows
  const R = liftEnv({ own: ['under_the_span'], reduced: true });
  R.H.sail({ water: 'mossmere' }); await R.step(3.2);
  ok(R.calls.includes('liftMist:under_the_span:0'), 'T128: reduced motion skips the thinning (liftMist(id, 0))');
  eq(R.lifts(), ['under_the_span:start', 'under_the_span:title'], '… the title shows at once');
  R.run(D.LOOP.lift.title + 0.1);
  ok(R.lifts().includes('under_the_span:end') && R.loop.s.lifted.includes('under_the_span'), '… and ends after it');
  // the pause holds a lift; nothing due: no lift; a lifted place never lifts again
  const P = liftEnv({ own: ['lily_maze'] });
  P.H.sail({ water: 'mossmere' }); await P.step(3.2);
  P.ctx.paused = true; P.run(6);
  ok(P.H.lifting() === 'lily_maze' && !P.lifts().includes('lily_maze:title'), 'the pause holds the lift');
  P.ctx.paused = false; P.run(4.4);
  ok(P.lifts().includes('lily_maze:end'), '… and it goes on after');
  const N = liftEnv({ own: ['lily_maze'], lifted: ['lily_maze'] });
  N.H.sail({ water: 'mossmere' }); await N.step(3.2);
  ok(N.lifts().length === 0 && N.ctx.cinematic === false && N.calls.some((c) => c === 'setPlaces:lily_maze|lily_maze'), 'T128: a place already lifted never lifts again (its dressing lit from run:start)');
  // a Continue's run:start syncs the places and plays no lift (PLAN §2.2 item 5: at run:start, not continued)
  const Q = liftEnv({ own: ['buoy_lights'] }); Q.ctx.flow = 'playing'; Q.ctx.state.run = Q.loop.createTrip({});
  Q.bus = Q.ctx.bus; Q.ctx.bus.emit('run:start', { continued: true });
  ok(Q.lifts().length === 0 && Q.calls.some((c) => c === 'setPlaces:buoy_lights|'), 'a Continue: the places synced, no lift');
  // home:enter and a buy sync the places too
  const H2 = liftEnv({ own: [] });
  H2.ctx.bus.emit('home:enter', { from: 'title' }); H2.loop.s.maps.places.push('lily_maze'); H2.ctx.bus.emit('loop:buy', { item: 'place:lily_maze', price: 60, clams: 0 });
  ok(H2.calls.includes('setPlaces:|') && H2.calls.includes('setPlaces:lily_maze|'), 'world.setPlaces at home:enter and after loop:buy');
}
section('M1 step 3a: Sail toward a place (T129, PLAN CHOICE 7)');
{
  const dock = { x: 24, z: 38 };
  const E = liftEnv({ own: ['lily_maze'], lifted: ['lily_maze'] });
  ok(E.H.sail({ water: 'mossmere', place: 'lily_maze' }) === true, 'Sail({water, place})');
  eq(E.loop.s.chartPick, { water: 'mossmere', place: 'lily_maze' }, 'T129: the pick is saved (loop.setPick)');
  // (the stage: the game's glide toward a place is the data's, data.loopSailPlan, which validate-data --loop proves clear (T118); the
  // Lily Maze's is its authored `out`, bent south of the statue off the Jetty; a place with none glides outDist m toward its centre)
  const g = E.player.glides.at(-1), lm = D.loopPlace('lily_maze'), plan = D.loopSailPlan(dock, { water: 'mossmere', place: 'lily_maze' });
  eq(g.pts, plan.path, 'T129: the glide out heads for the place (data.loopSailPlan: the Lily Maze\'s authored glide)');
  const dir = (a, b) => Math.atan2(b.z - a.z, b.x - a.x);
  ok(Math.abs(dir(dock, g.pts.at(-1)) - dir(dock, lm)) < (30 * Math.PI) / 180, 'T129: … toward the place (its bearing within 30° of the line from the Jetty)');
  near(Math.hypot(g.pts.at(-1).x - dock.x, g.pts.at(-1).z - dock.z), D.LOOP.tutorial.outDist, `T129: … about ${D.LOOP.tutorial.outDist} m out`, 0.5);
  ok(g.o.kind === 'sailOut' && g.o.duration === D.LOOP.tutorial.out, '… the same 3 s glide (kind sailOut)');
  await E.step(3.2);
  ok(E.ctx.flow === 'playing' && E.player.position.x === plan.to.x && E.H.sailPlace === 'lily_maze', 'T129: the trip starts where that glide ended');
  const open = D.sailPlan(dock, { x: 0, z: 0 }, D.LOOP.tutorial, 'mossmere');
  const U = liftEnv({ own: [] });
  U.H.sail({ water: 'mossmere', place: 'bell_pool' });
  ok(U.loop.s.chartPick === null && JSON.stringify(U.player.glides.at(-1).pts.at(-1)) === JSON.stringify(open.to), 'T129: a place not owned: the pick refused, open water\'s glide');
  const O = liftEnv({ own: ['lily_maze'] });
  O.H.sail({ water: 'mossmere', place: null });
  ok(JSON.stringify(O.player.glides.at(-1).pts) === JSON.stringify(open.path) && O.loop.s.chartPick?.place === null, 'T129: open water (place null): 1a\'s authored glide (T66), the pick {place: null}');
  const S = liftEnv({ own: ['under_the_span'], pick: { water: 'mossmere', place: 'under_the_span' } });
  S.H.sail({ water: 'mossmere' });
  const us = D.loopPlace('under_the_span');
  const sp0 = S.player.glides.at(-1).pts.at(-1), sp1 = D.sailPlan(dock, { x: us.x, z: us.z }, D.LOOP.tutorial, null).to;
  near(Math.hypot(sp0.x - sp1.x, sp0.z - sp1.z), 0, 'with no `place` the Chart\'s saved pick of that water is sailed to (3b writes it on a tap)', 1e-9);
  const W = liftEnv({ own: [] });
  W.H.sail({ water: 'mossmere' });
  eq(W.player.glides.at(-1).pts.at(-1), open.to, 'T66 unchanged: no pick, no place: open water\'s glide');
  // the glide's clearance (T118's rule: the raft's radius + 0.3 m off every island and pillar): a bearing turned the least that clears
  const clear = D.BALANCE.move.raftRadius + 0.3;
  const blocker = [{ x: 24 - 9, z: 38, r: 1.2 }];
  near(R.glideClearance([{ x: 0, z: 0 }, { x: 10, z: 0 }], [{ x: 5, z: 3, r: 1 }]), 2, 'glideClearance: the least distance to an obstacle\'s edge', 1e-9);
  const bent = R.placeGlide(D.sailPlan, dock, { x: -10, z: 38 }, D.LOOP.tutorial, blocker, { clear });
  const wrap = (a) => Math.abs(((a + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
  ok(bent && R.glideClearance(bent.path, blocker) >= clear && wrap(Math.atan2(bent.to.z - 38, bent.to.x - 24) - Math.PI) <= (60 * Math.PI) / 180 + 1e-9 && wrap(Math.atan2(bent.to.z - 38, bent.to.x - 24) - Math.PI) > 0.01, `placeGlide: an obstacle on the line: the bearing turned (to ${bent?.to.x.toFixed(1)}, ${bent?.to.z.toFixed(1)}), clear by ${R.glideClearance(bent?.path, blocker).toFixed(2)} m`);
  ok(R.placeGlide(D.sailPlan, dock, { x: -10, z: 38 }, D.LOOP.tutorial, [{ x: 24, z: 38, r: 30 }], { clear }) === null, 'placeGlide: nothing clear within 60°: null (open water\'s glide)');
  // the Mossmere's own layout: each place's glide out from the Jetty clears every obstacle (a straight one to the Lily Maze would not)
  const { buildLayout, isOpenWaterL } = await import('../../src/world-layout.js');
  const LY = buildLayout(D.ZONES[0]);
  for (const id of Object.keys(D.LOOP.places)) {
    const p = D.loopPlace(id), straight = D.sailPlan(dock, { x: p.x, z: p.z }, D.LOOP.tutorial, null);
    const g2 = R.placeGlide(D.sailPlan, dock, { x: p.x, z: p.z }, D.LOOP.tutorial, LY.obstacles, { clear });
    const turn = g2 ? Math.abs(((Math.atan2(g2.to.z - 38, g2.to.x - 24) - Math.atan2(p.z - 38, p.x - 24) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI) * 180 / Math.PI : null;
    ok(g2 && R.glideClearance(g2.path, LY.obstacles) >= clear && isOpenWaterL(LY, LY.obstacles, g2.to.x, g2.to.z, D.BALANCE.move.raftRadius),
      `T129/T118: the glide toward ${id} clears every obstacle by ≥ ${clear} m (${R.glideClearance(g2?.path, LY.obstacles).toFixed(2)} m; turned ${turn?.toFixed(0)}°; straight ${R.glideClearance(straight.path, LY.obstacles).toFixed(2)} m)`);
  }
  const Ob = liftEnv({ own: ['lily_maze'] });
  Ob.ctx.world.getObstacles = () => LY.obstacles;
  Ob.H.sail({ water: 'mossmere', place: 'lily_maze' });
  ok(R.glideClearance(Ob.player.glides.at(-1).pts, LY.obstacles) >= clear && Ob.H.sailPlace === 'lily_maze', 'T129: Sail toward the Lily Maze with the world\'s obstacles: its glide clears the statue off the Jetty');
}

// =====================================================================================================================
// fishing on a trip (fishing-env with the loop's data and a fake loop)
const OPEN = 'open:mossmere';
function tripEnv({ wick = 'wick', loopOver = {}, evening = 1, phase = 'calm', seed = 42, data = D, outing = 'trip', render = undefined } = {}) {
  const loop = fakeLoop({ D, wick, ...loopOver });
  const env = makeFishingEnv({ data, mode: 'still', outing, phase, seed, loop, render,
    runOver: { bait: {}, equippedBait: null, evening, character: wick, nightMode: 'still' } });
  env.ctx.bus.on('fishing:bite', (e) => loop.noteBite(e));
  env.ctx.bus.on('fishing:miss', (e) => { if (e.reason === 'spooked') loop.noteBite(e); });
  env.loop = loop;
  env.count = (e) => env.events.filter((x) => x.e === e).length;
  env.toBite = (o = {}) => { env.ctx.debug.forceBite({ wait: 2, ...o }); for (let i = 0; i < 400 && env.F.state === 'waiting'; i++) env.tick(1); return env.F.state === 'bite'; };
  env.toIdle = (max = 3000) => { for (let i = 0; i < max && env.F.state !== 'idle'; i++) { env.F.skipCeremony?.(); env.tick(1); } };
  return env;
}
section('fishing: the cast refused on a full hold (T3)');
{
  const E = tripEnv({ loopOver: { fish: [{}, {}, {}] } });
  E.events.length = 0;
  E.F.onPointerDown({ input: 'mouse' }); E.tick(3);
  ok(E.F.state === 'idle' && E.count('loop:holdFull') === 1 && E.events.find((x) => x.e === 'loop:holdFull').p.via === 'cast', 'T3: from idle the press never charges; loop:holdFull {via: cast} once');
  E.F.onPointerUp();
  const L = tripEnv(); L.ctx.debug.forceBite({ wait: 3 }); L.tick(3); L.F.onPointerDown({ input: 'mouse' }); L.F.onPointerUp();
  ok(L.F.state === 'lost', '(a spook leaves the line coming in)');
  L.loop.s.fish = [{}, {}, {}]; L.tick(10); L.events.length = 0;
  L.F.onPointerDown({ input: 'mouse' });
  ok(L.F.state !== 'charging' && L.count('loop:holdFull') === 1, 'T3: from lost too');
  const T = tripEnv({ wick: 'tallow', loopOver: { fish: [{}, {}, {}] } });
  T.F.onPointerDown({ input: 'mouse' });
  ok(T.F.state === 'charging', 'Tallow: the cast is not refused one before its count (4 slots)');
  T.F.onPointerUp(); T.reset();
  T.loop.s.fish.push({}); T.events.length = 0; T.F.onPointerDown({ input: 'mouse' });
  ok(T.F.state === 'idle' && T.count('loop:holdFull') === 1, '… and refused at it');
  const O = tripEnv({ outing: 'normal', data: DV3, loopOver: { fish: [{}, {}, {}] } });
  O.F.onPointerDown({ input: 'mouse' });
  ok(O.F.state === 'charging' && O.count('loop:holdFull') === 0, 'off a trip the hold never refuses a cast');
}
section('fishing: the cast draws no ring round the raft and no aim word on a trip (the user\'s rule; SPEC §8.1)');
{
  const charge = (o) => {
    const scene = new THREE.Scene();
    const E = o.outing === 'trip' ? tripEnv({ render: { scene } }) : (() => { const e = makeFishingEnv({ data: DV3, mode: 'still', render: { scene }, runOver: { bait: {}, equippedBait: null } }); return e; })();
    const by = (n) => scene.getObjectByName(n);
    E.F.onPointerDown({ input: 'mouse' }); E.tick(2);
    const near = { state: E.F.state, dist: E.F.view.castDist, ring: by('range-ring').visible, ret: by('reticle').visible, label: by('reticle-label').visible };
    let far = null;
    for (let i = 0; i < 90 && !far; i++) { E.tick(1); if (E.F.view.castDist >= 9) far = { ring: by('range-ring').visible, ret: by('reticle').visible, label: by('reticle-label').visible, arc: by('cast-arc').visible }; }
    E.F.onPointerUp();
    return { near, far };
  };
  const T = charge({ outing: 'trip' });
  ok(T.near.state === 'charging', `(a trip: charging, the aim ${T.near.dist?.toFixed(1)} m out)`);
  ok(!T.near.ring && !T.near.ret && !T.near.label, 'a trip: no range ring round the raft, no reticle and no band word while the aim is near the raft');
  ok(T.far && !T.far.ring && !T.far.ret && !T.far.label && T.far.arc, 'a trip: further out the cast arc alone shows the aim; never the range ring, a reticle or a band word');
  const N = charge({ outing: 'normal' });
  ok(N.near.ring && N.near.ret && N.near.label, '(off a trip the built range ring, reticle and band word)');
}
section('fishing: every bite spends one at its water (T8, T9)');
{
  const E = tripEnv();
  E.ctx.debug.forceBite({ wait: 3 }); E.tick(3); E.events.length = 0;
  E.F.onPointerDown({ input: 'mouse' });
  eq(E.events.find((x) => x.e === 'fishing:miss')?.p, { reason: 'spooked', waterKey: OPEN }, 'T8: a spook: fishing:miss {reason: spooked, waterKey}');
  ok(E.count('fishing:bite') === 0, '… and no fishing:bite (no bite tell)');
  for (const [kind, outcome] of [['passed', null], ['landed', 'land'], ['lost', 'lose']]) {
    const P = tripEnv(); P.events.length = 0;
    P.ctx.debug.fishOutcome(outcome);
    ok(P.toBite({ speciesId: 'mossback_perch', z: 0.3 }), `(${kind}: the bite is live)`);
    if (outcome) { P.tick(3); P.F.onPointerDown({ input: 'mouse' }); P.F.onPointerUp(); }
    P.toIdle();
    const bites = P.events.filter((x) => x.e === 'fishing:bite');
    ok(bites.length === 1 && bites[0].p.waterKey === OPEN, `T8: ${kind}: exactly one fishing:bite, with its waterKey`);
    if (kind === 'passed') eq(P.loop.s.bites[OPEN], 1, 'T8: the fake loop counted it');
  }
  const L = tripEnv();
  eq(L.ctx.debug.fishing().fishLinger, undefined, '(the linger is not on the readout)');
  const lf = Object.values(L.ctx.debug).find((v) => v && typeof v === 'object' && typeof v.fishLinger === 'function');
  ok(!lf || lf.fishLinger() === null, 'T9 (the lead\'s ruling "drop"): fishLinger() is null');
  L.toBite({ speciesId: 'weeping_carp', z: 1.6 }); L.toIdle();
  L.events.length = 0;
  L.toBite({}); L.toIdle();
  const b2 = L.events.filter((x) => x.e === 'fishing:bite');
  ok(b2.length === 1 && b2[0].p.waterKey === OPEN && !b2[0].p.comeback, 'T9: a re-cast after a pass is a new bite at its own cast\'s waterKey');
}
section('fishing: quiet water and the let-go (T11, T16, T52)');
{
  const E = tripEnv({ loopOver: { bites: { [OPEN]: 6 }, mercy: { [OPEN]: 0.2 } } });
  const fav = E.loop.favour(OPEN);
  eq([fav.over, fav.quiet], [3, true], '(6 spent at 4 good: 3 over, quiet)');
  E.ctx.progression.getCondition = () => 'hush';
  E.ctx.progression.getPressure = () => -0.3;
  const f = E.F.favourAt({ x: 30, z: 30 });
  const q = f.terms.find((t) => t.family === 'quiet'), lg = f.terms.find((t) => t.family === 'letGo');
  ok(q && q.value === fav.favour, `T11: the quiet term's value equals loop.favour(key).favour (${q?.value})`);
  ok(lg && lg.value === fav.mercy, 'T11: the letGo term is the mercy');
  ok(!f.terms.some((t) => t.id === 'hush' || t.family === 'pressure' || t.id === 'letItPass'), 'T16, T52: no hush, pressure or let-it-pass term on a trip');
  const O = tripEnv({ outing: 'normal', data: DV3 }); O.ctx.progression.getCondition = () => 'hush';
  ok(O.F.favourAt({ x: 30, z: 30 }).terms.some((t) => t.id === 'hush'), '(off a trip the hush term is built)');
  // the wait at fixed seeds: ×waitMult before the clamp (T11), Stub ×0.78 (WICKS §2.3)
  const waitOf = (wick, spent) => {
    const W = tripEnv({ wick, loopOver: { bites: { [OPEN]: spent } } });
    const prev = Math.random; Math.random = seededRandom(5);
    try { W.ctx.debug.forceBite({ natural: true }); } finally { Math.random = prev; }
    return W.dbg().wait;
  };
  const w0 = waitOf('wick', 0), w6 = waitOf('wick', 6), s0 = waitOf('stub', 0), s6 = waitOf('stub', 6);
  near(w6 / w0, D.quietTerms(3, 'wick').waitMult, `T11: the wait grows ×${D.quietTerms(3, 'wick').waitMult} three bites past the good ones (${w0.toFixed(2)} → ${w6.toFixed(2)} s)`, 1e-6);
  near(s0 / w0, D.LOOP.wicks.stub.waitMul, `Stub: the wait ×${D.LOOP.wicks.stub.waitMul} (${s0.toFixed(2)} s)`, 1e-6);
  near(s6 / s0, 1, 'Stub: quiet water keeps the fresh wait (no growth)', 1e-6);
  // the float's dots: 4 → 3 on a bite → 4 again on a let go (T52)
  const B = tripEnv();
  B.ctx.debug.forceBite({ wait: 2 }); B.tick(20);
  eq(B.F.view.favour?.bitesLeft, 4, 'T52: the float shows 4 good bites');
  for (let i = 0; i < 400 && B.F.state === 'waiting'; i++) B.tick(1);
  B.tick(16);
  eq(B.F.view.favour?.bitesLeft, 3, 'T52: 3 after the bite');
  B.toIdle(); B.loop.letGo({ waterKey: OPEN });
  B.ctx.debug.forceBite({ wait: 2 }); B.tick(20);
  eq(B.F.view.favour?.bitesLeft, 4, 'T52: 4 again after a let go');
  ok(B.F.view.favour?.quiet === false, '… not quiet');
  // no signs on quiet water (T52)
  const water = (E) => { let k = 0; E.ctx.world.randomWaterPoint = (o) => { k++; const a = k * 2.39996, f = o?.from || { x: 30, z: 30 }; return new THREE.Vector3(f.x + Math.cos(a) * 10, 0, f.z + Math.sin(a) * 10); }; return E; };
  const Q = water(tripEnv({ loopOver: { bites: { [OPEN]: 4 } } })); Q.tick(30 * 30);
  const A = water(tripEnv()); A.tick(30 * 30);
  ok(Q.F.signs.length === 0 && A.F.signs.length > 0, `T52: no sign spawns once bitesLeft is 0 (${Q.F.signs.length} on quiet water, ${A.F.signs.length} on good water)`);
  // a pass writes no favour (SPEC §3.2)
  const P = tripEnv(); P.toBite({}); P.toIdle();
  const miss = P.events.find((x) => x.e === 'fishing:miss' && x.p.reason === 'passed');
  ok(miss && miss.p.favour === 0 && P.dbg().letPass === null, 'a passed bite writes no let-it-pass favour on a trip');
}
section('fishing: the hours (T15), the counters (T55), no giant water (T30)');
{
  const any = { ...SP('dusk_minnow'), id: 'test_any', time: 'any', rarity: 'common', depth: [0, 1], bait: null };
  const dusk = { ...SP('mossback_perch'), id: 'test_dusk', time: 'dusk', rarity: 'common', depth: [0, 1], bait: null };
  const koi = SP('candlefin_koi'), koiDepth = ((koi.depth?.[0] ?? 0) + (koi.depth?.[1] ?? 1)) / 2;
  const D2 = Object.assign(Object.create(null), D, { SPECIES: [any, dusk, koi], SPECIES_BY_ID: { ...D.SPECIES_BY_ID, test_any: any, test_dusk: dusk } });
  const seen = (phase) => {
    const E = tripEnv({ data: D2, phase }); const out = new Set(); E.ctx._depth = koiDepth;
    for (let i = 0; i < 120; i++) { E.ctx.debug.forceBite({ natural: true }); out.add(E.dbg().species); E.reset(); }
    return out;
  };
  const day = seen('calm'), dsk = seen('dusk'), night = seen('gloomtide');
  ok(!day.has('test_dusk') && night.has('test_dusk') && dsk.has('test_dusk'), 'T15: a "dusk" fish (LOOP.hours) bites at dusk and night, not by day');
  ok(dsk.has('candlefin_koi') && !night.has('candlefin_koi'), 'T15: the built calm koi still bites at dusk and not at night');
  const E1 = tripEnv({ evening: 1 }), E2 = tripEnv({ evening: 2 });
  E1.ctx.state.meta.runs = 9; E2.ctx.state.meta.runs = 0;   // (meta.runs is never the evening on a trip)
  E1.toBite({ speciesId: 'dusk_minnow', z: -1 }); E2.toBite({ speciesId: 'dusk_minnow', z: -1 });
  ok(!!E1.F.view.strikeRing && E2.F.view.strikeRing === null, 'T55: the strike ring on evening 1, not on evening 2');
  for (const E of [E1, E2]) { E.ctx.debug.fishOutcome('land'); E.tick(3); E.F.onPointerDown({ input: 'mouse' }); E.F.onPointerUp(); E.tick(2); E.F.onPointerDown({ input: 'mouse' }); E.tick(3); }
  ok(E1.F.view.play && E1.F.view.play.hurry === false && E2.F.view.play?.hurry === true, 'T55: a hold hurries a Small on evening 2, not on evening 1');
  const W = tripEnv();
  const G = DV3.RAFT_FALLBACK_V3?.mossmere?.giants || [];
  ok(G.length > 0 && G.every((g) => W.F.waterAt({ x: g.x, z: g.z })?.giant === false), 'T30: no giant water at the old stopgap centres');
  // (M1 step 3a's seam: the four places are in the arena under the loop, so a point inside one keeps that place's key; no giant water)
  let pts = 0, inPlace = 0;
  for (let i = 0; i < 20; i++) {
    const a = i * 2.39996, r = 6 + 40 * ((i * 0.618) % 1), x = Math.cos(a) * r, z = Math.sin(a) * r, w = W.F.waterAt({ x, z }), pl = D.placeAtV3('mossmere', x, z);
    if (pl) inPlace++;
    if (w?.giant === false && (pl ? w.waterKey === pl.id && w.placeId === pl.id : w.waterKey === OPEN && w.placeId === null)) pts++;
  }
  eq(pts, 20, `T30: 20 points: no giant water; the open key in open water (${20 - inPlace}), a place's own key inside it (${inPlace})`);
  const cap = D.BALANCE.size.classMaxZ.trophy;
  let worst = -9, elder = 0;
  for (const id of ['dusk_minnow', 'mossback_perch', 'gutter_crayfish', 'weeping_carp', 'candlefin_koi', 'reedjaw_pike']) {
    for (let i = 0; i < 2000 / 6; i++) { const z = W.F.rollSize(id, 1.8, { giant: false }); worst = Math.max(worst, z); if (D.sizeClassOf(z) === 'elder') elder++; }
  }
  ok(worst <= cap + 1e-9 && elder === 0, `T30: 2,000 rolls at the most favour give no Elder (max z ${worst.toFixed(3)} ≤ ${cap})`);
}
section('the Wicks on the water: Taper (WICKS §2.2)');
{
  // the day pool at a mid cast: uncommon and rare pass the sign rule, so the first bite of the evening is never common
  const E = tripEnv({ wick: 'taper' }); E.ctx._depth = 0.55;
  let commons = 0, spent = 0;
  for (let i = 0; i < 80; i++) {
    E.loop.s.taperFirst = false; E.loop.calls.length = 0;
    E.toBite({});
    if (SP(E.dbg().species)?.rarity === 'common') commons++;
    if (E.loop.calls.some((c) => c.name === 'spendTaperFirst')) spent++;
    E.reset();
  }
  ok(commons === 0, `Taper: the first bite of the evening is never common where the pool allows (${commons}/80 common)`);
  eq(spent, 80, 'Taper: the flag is set once by each bite served under the rule (spendTaperFirst)');
  let later = 0;
  E.loop.s.taperFirst = true;
  for (let i = 0; i < 80; i++) { E.toBite({}); if (SP(E.dbg().species)?.rarity === 'common') later++; E.reset(); }
  ok(later > 20, `Taper: once spent, commons bite again (${later}/80)`);
  // a spook during the nibbles spends the rule like any bite (WICKS §2.2 (a)): the next cast is the plain pool
  {
    const K = tripEnv({ wick: 'taper' }); K.ctx._depth = 0.55; K.loop.calls.length = 0;
    K.ctx.debug.forceBite({ wait: 3 }); K.tick(3); K.F.onPointerDown({ input: 'mouse' }); K.F.onPointerUp();
    ok(K.F.state === 'lost' && K.events.some((x) => x.e === 'fishing:miss' && x.p.reason === 'spooked'), '(Taper: the press during the nibbles spooks)');
    eq(K.loop.calls.filter((c) => c.name === 'spendTaperFirst').length, 1, 'Taper: a spooked first bite spends the rule once (spendTaperFirst)');
    ok(K.loop.api ? !K.loop.api.taperFirstOpen() : K.loop.s.taperFirst === true, 'Taper: … and the rule is closed for the evening');
    const P = tripEnv({ wick: 'taper' }); P.ctx._depth = 0.55; P.loop.calls.length = 0;
    ok(P.toBite({}), '(Taper: a bite left to lapse)');
    for (let i = 0; i < 400 && P.F.state === 'bite'; i++) P.tick(1);
    eq(P.loop.calls.filter((c) => c.name === 'spendTaperFirst').length, 1, 'Taper: a passed first bite spends it once too');
  }
  // where the uncommon-and-rare pool fails the sign rule the rule waits (the flag stays clear)
  const pool = (phase, d) => D.SPECIES.filter((s) => s.zone === 'mossmere' && s.rarity !== 'legendary' && !s.bait && d >= (s.depth?.[0] ?? 0) && d <= (s.depth?.[1] ?? 1)
    && (s.time === 'calm' ? phase !== 'gloomtide' : s.time === 'gloom' ? phase === 'gloomtide' : true));
  const wait = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95].map((d) => ['gloomtide', d]).concat([0.05, 0.15, 0.25].map((d) => ['calm', d]))
    .find(([ph, d]) => { const p = pool(ph, d), w = p.map((s) => D.RARITY_WEIGHTS[s.rarity] ?? 10); return D.wickPoolWeights('taper', p, w, { firstBite: true, signRule: D.AUTOFISH.signRule }) === w && p.some((s) => s.rarity === 'common'); });
  if (wait) {
    const N = tripEnv({ wick: 'taper', phase: wait[0] }); N.ctx._depth = wait[1];
    let c = 0, sp = 0;
    for (let i = 0; i < 40; i++) { N.loop.calls.length = 0; N.toBite({}); if (SP(N.dbg().species)?.rarity === 'common') c++; if (N.loop.calls.some((x) => x.name === 'spendTaperFirst')) sp++; N.reset(); }
    ok(sp === 0 && N.loop.s.taperFirst === false, `Taper: where the pool fails the sign rule (${wait[0]}, depth ${wait[1]}) the rule waits and the flag stays clear`);
    ok(c > 0, `… the plain pool bites there (${c}/40 common)`);
  } else note('no Mossmere pool fails the sign rule at these depths: the rule-waits case is untested here (loop.test covers wickPoolWeights)');
  const W = tripEnv({ wick: 'wick' }); W.ctx._depth = 0.55;
  let wc = 0; for (let i = 0; i < 80; i++) { W.toBite({}); if (SP(W.dbg().species)?.rarity === 'common') wc++; W.reset(); }
  ok(wc > 20 && !W.loop.calls.some((c) => c.name === 'spendTaperFirst'), `every other Wick's first bite is the plain pool (${wc}/80 common)`);
}
section('the Wicks on the water: Stub\'s spook exposure, recorded (WICKS §2.3)');
{
  const expo = (wick) => {
    const E = tripEnv({ wick }); let n = 0, waits = 0;
    const prev = Math.random; Math.random = seededRandom(11);
    try { for (let i = 0; i < 200; i++) { E.ctx.debug.forceBite({ natural: true }); const d = E.dbg(); if (d.events.length) n++; waits += d.wait; E.reset(); } } finally { Math.random = prev; }
    return { share: n / 200, wait: waits / 200 };
  };
  const a = expo('wick'), b = expo('stub');
  note(`spook exposure (casts with a nibble or feint before the tell): the Wick ${(100 * a.share).toFixed(0)}% (mean wait ${a.wait.toFixed(2)} s), Stub ${(100 * b.share).toFixed(0)}% (${b.wait.toFixed(2)} s)`);
  ok(b.wait < a.wait && b.share <= a.share + 0.05, 'Stub: quicker bites, and no more nibbles to spook on');
}
section('the Wicks on the water: Ashwick\'s comeback (WICKS §2.5)');
{
  const cb = { waterKey: OPEN, speciesId: 'weeping_carp', z: 2.05 };   // (WC-1: a fish the bare hook brings; a stray's comeback waits: watercraft.test.mjs)
  const E = tripEnv({ wick: 'ashwick', loopOver: { comeback: { ...cb } } });
  E.events.length = 0;
  ok(E.toBite({}), '(the bite is live)');
  ok(E.dbg().species === 'weeping_carp' && Math.abs(E.dbg().z - 2.05) < 1e-9, 'Ashwick: the next bite at that water is that fish at the same z');
  ok(E.count('fishing:comeback') === 1, 'Ashwick: the float settles with the ember (fishing:comeback, the hiss)');
  const b = E.events.find((x) => x.e === 'fishing:bite')?.p;
  ok(b && b.comeback === true && b.waterKey === OPEN, 'Ashwick: fishing:bite {comeback: true, waterKey}');
  ok(E.loop.calls.some((c) => c.name === 'consumeComeback') && E.loop.s.comeback === null, 'Ashwick: consumed when its bite is served');
  eq(E.loop.s.bites[OPEN], 1, 'Ashwick: it spends a bite like any bite');
  E.toIdle(); E.events.length = 0;
  E.toBite({}); E.toIdle();
  ok(!E.events.some((x) => x.e === 'fishing:bite' && x.p.comeback), 'Ashwick: it comes back once');
  // WC-1 (WATERCRAFT.md §3.6): a pike's comeback waits on the bare hook (it never takes one past 1 in 100): kept, no fishing:comeback
  const P = tripEnv({ wick: 'ashwick', loopOver: { comeback: { ...cb, speciesId: 'reedjaw_pike' } } }); P.events.length = 0;
  P.toBite({}); P.toIdle();
  ok(P.loop.s.comeback !== null && P.count('fishing:comeback') === 0 && !P.events.some((x) => x.e === 'fishing:bite' && x.p.comeback), 'Ashwick (WC-1): a stray\'s comeback waits on a hook it will not take');
  const S = tripEnv({ wick: 'ashwick', loopOver: { comeback: { ...cb } } });
  S.ctx.debug.forceBite({ wait: 3 }); S.tick(3); S.F.onPointerDown({ input: 'mouse' });
  ok(S.loop.s.comeback === null, 'Ashwick: a spook spends it');
  const O = tripEnv({ wick: 'ashwick', loopOver: { comeback: { ...cb, waterKey: 'open:sporewood' } } });
  O.toBite({}); O.toIdle();
  ok(O.loop.s.comeback !== null && O.count('fishing:comeback') === 0, 'Ashwick: a cast at another water keeps it waiting');
  const W = tripEnv({ wick: 'ashwick', loopOver: { comeback: { ...cb } } }); W.events.length = 0;
  W.ctx.debug.forceBite({ speciesId: 'dusk_minnow', wait: 2 });
  ok(W.dbg().species === 'dusk_minnow', '(a debug forced species wins over the comeback)');
}
section('fishing: the flag-off payloads are the built objects (T39, PLAN §4.1 rule 4)');
{
  const O = tripEnv({ outing: 'normal', data: DV3 });
  O.toBite({ speciesId: 'mossback_perch', z: 0.3 });
  eq(Object.keys(O.events.find((x) => x.e === 'fishing:bite').p).sort(), ['biteTell', 'sizeClass'], 'v3 without the loop: fishing:bite carries no waterKey');
  O.toIdle(); O.ctx.debug.forceBite({ wait: 3 }); O.tick(3); O.F.onPointerDown({ input: 'mouse' });
  eq(O.events.filter((x) => x.e === 'fishing:miss').at(-1).p, { reason: 'spooked' }, '… nor the spook');
  const N = tripEnv({ outing: 'normal', data: D });   // the loop's data, not a trip (a non-trip run is never on the loop's rules)
  N.toBite({ speciesId: 'mossback_perch', z: 0.3 });
  ok(!('waterKey' in N.events.find((x) => x.e === 'fishing:bite').p), 'loop data, not a trip: no waterKey either');
}

// =====================================================================================================================
section('survival on a trip: the evening (T13, T14, T16, T17, T27)');
function survEnv({ data = D, outing = 'trip' } = {}) {
  const bus = createBus(), events = [];
  const fishing = { state: 'idle', view: {}, inShow: false };
  const ctx = {
    THREE, bus, data, state: { meta: defaultMeta(), run: null }, time: { dt: 0.05, gameDt: 0.05, t: 0, gameT: 0, timeScale: 1, frame: 1 },
    flow: 'playing', paused: false, cinematic: false, debug: {}, errors: [], isMobile: false, input: {}, game: { save() {} },
    progression: { getStats: () => Object.fromEntries(Object.entries(data.STATS).map(([k, v]) => [k, v.base])), tryRevive: () => false },
    player: { position: new THREE.Vector3(10, 0, 20) }, fishing, actors: {}, world: {}, combat: {}, ui: {}, render: {},
  };
  const orig = bus.emit.bind(bus); bus.emit = (e, p = {}) => { events.push({ e, p }); orig(e, p); };
  const S = createSurvival(ctx); ctx.survival = S; S.init();
  const run = outing === 'trip' ? tripRun(data, {}) : { ...tripRun(data, {}), outing };
  ctx.state.run = run;
  bus.emit('zone:change', { zone: 'mossmere', prev: null, sail: true }); bus.emit('run:start', { continued: false });
  const tick = (sec) => { const n = Math.round(sec / 0.05); for (let i = 0; i < n; i++) { ctx.time.frame++; S.update(0.05, ctx.time.t += 0.05); } };
  return { ctx, S, run, events, fishing, tick, count: (e) => events.filter((x) => x.e === e).length };
}
{
  const E = survEnv();
  const pi = E.S.getPhaseInfo();
  ok(pi.phase === 'calm' && pi.duration === 40 && pi.hush === 0, 'T13, T16: the day is 40 s, with no hush');
  E.tick(39.9); eq(E.run.phase, 'calm', 'T13: still day at 39.9 s');
  E.tick(0.2); eq(E.run.phase, 'dusk', 'T13: dusk at 40 s');
  E.tick(20); eq(E.run.phase, 'gloomtide', 'T13: night at 60 s');
  E.events.length = 0;
  E.tick(600);
  ok(E.run.phase === 'gloomtide' && E.count('phase:change') === 0 && E.count('day:start') === 0, 'T13: the night holds (no phase:change past it, no day:start)');
  const n = E.S.getPhaseInfo();
  ok(Object.values(n).every((v) => typeof v !== 'number' || !Number.isNaN(v)), 'T17: no NaN in getPhaseInfo() after 10 min of night');
  ok(n.duration === Infinity && n.remaining === Infinity && n.open === true && n.k <= 0.85 && n.time > 600, `T17: an open night (k ${n.k}, time ${n.time.toFixed(0)} s, unclamped)`);
  eq(E.S.getPhaseDurations(), { calm: 40, dusk: 20, gloomtide: null, dawn: E.S.getPhaseDurations().dawn, total: null, hush: 0, open: true }, 'getPhaseDurations on a trip');
  const vit = { oil: E.run.oil, sat: E.run.satiety, hp: E.run.hp };
  E.ctx.debug.setOil(1); E.ctx.debug.hurt(3); E.ctx.debug.snuff(); E.ctx.debug.setHp(0); E.ctx.debug.setSatiety(0); E.ctx.debug.gutter(); E.ctx.debug.scorch();
  E.S.damage(5, 'gloom');
  E.tick(120);
  eq({ oil: E.run.oil, sat: E.run.satiety, hp: E.run.hp }, vit, 'T27: no change in oil, satiety or health (the debug hooks are no-ops on a trip)');
  ok(E.count('player:died') === 0 && E.S.getVitals().wellFed === false, 'T27: no death; no Well-fed');
  // frozen in the ceremony (T14)
  const F = survEnv(); F.tick(10);
  const t0 = F.run.phaseTime;
  F.fishing.inShow = true; F.tick(5);
  near(F.run.phaseTime, t0, 'T14: the evening stands still while fishing.inShow (from T0, the reveal included)', 1e-9);
  F.fishing.inShow = false; F.ctx.cinematic = true; F.tick(5);
  near(F.run.phaseTime, t0, 'T14: … and while ctx.cinematic', 1e-9);
  F.ctx.cinematic = false; F.tick(1);
  ok(F.run.phaseTime > t0 + 0.9, '… then it runs again');
  const V = survEnv({ data: DV3, outing: 'normal' });
  ok(V.S.getPhaseInfo().duration !== 40 && !('open' in V.S.getPhaseInfo()), 'v3 without the loop: the built phases, no `open` key');
}

// =====================================================================================================================
section('combat parked on a trip (T26)');
{
  const bus = createBus(), events = [];
  const orig = bus.emit.bind(bus); bus.emit = (e, p = {}) => { events.push(e); orig(e, p); };
  const clock = { phase: 'gloomtide', time: 0 };
  const run = { ...tripRun(D, {}), phase: 'gloomtide', boons: {}, stats: {}, legendaries: {}, creel: [] };
  const stats = Object.fromEntries(Object.entries(D.STATS).map(([k, d]) => [k, d.base]));
  const ctx = {
    THREE, bus, data: D, state: { meta: defaultMeta(), run }, time: { dt: 0.05, gameDt: 0.05, t: 0, gameT: 0, frame: 0, timeScale: 1 },
    flow: 'playing', paused: false, cinematic: false, debug: {}, errors: [], isMobile: false, input: { move: { x: 0, y: 0 }, joy: { x: 0, y: 0 } },
    render: { scene: { add() {} }, camera: null, shake() {}, flash() {} }, audio: { play() {} }, water: { addRipple() {}, splash() {}, getHeight: () => 0 },
    world: { isOpenWater: () => true, getDepth: () => 1, collide() {}, getObstacles: () => [], randomWaterPoint: () => null },
    player: { position: new THREE.Vector3(0, 0, 0), velocity: new THREE.Vector3(0, 0, 0), applyKnock() {}, pull() {} },
    survival: { getPhaseInfo: () => ({ phase: clock.phase, day: 1, time: clock.time, duration: Infinity, k: 0.5, isNight: true, open: true }), damage() { return 0; }, addOil() {}, heal() {}, isInvulnerable: () => false, addSatiety() {} },
    fishing: { state: 'idle', view: {}, bobberPos: null, cancel() {}, slam() {}, snag() { return true; } },
    progression: { getStats: () => stats, addShells() {}, isUnlocked: () => false, grantHeartwax: () => true, removeFromCreel: () => null, addToCreel: () => true },
    ui: { isBlocking: () => false, banner() {}, floatText() {}, damageNumber() {} },
  };
  const C = createCombat(ctx); ctx.combat = C; C.init();
  bus.emit('run:start', { continued: false });
  for (let i = 0; i < 2400; i++) { ctx.time.t += 0.05; ctx.time.frame++; clock.time += 0.05; C.update(0.05, ctx.time.t); }
  ok(C.enemies.length === 0 && !events.includes('enemy:spawn') && !events.includes('boss:spawn'), 'T26: 120 s of night on a trip: no enemy');
  ok(C.onPointerDown({ x: 0, y: 0 }) === false && C.flare() === false, 'no zap and no Flare on a trip');
  const lvl = run.level, xp = run.xp;
  C.addXp(50, { source: 'fish' }); bus.emit('fish:landed', { fish: { speciesId: 'dusk_minnow' }, xp: 5 });
  ok(run.level === lvl && run.xp === xp, 'no XP and no levels on a trip');
}

// =====================================================================================================================
section('player: the gate and Murk are scenery on a trip (T46); the home flow steps the glide; the kind option');
{
  const mk = (outing, flow = 'playing') => {
    const bus = createBus(), events = [];
    bus.on('player:glide', (p) => events.push({ ...p }));
    const run = { ...tripRun(D, {}), outing, gateOpen: true };
    const ctx = {
      bus, data: D, flow, state: { meta: {}, run }, time: { dt: 1 / 30 }, input: { move: { x: 0, y: 0 }, joy: { x: 0, y: 0 } },
      render: { getYaw: () => 0 }, fishing: { state: 'idle', cancel() {} },
      world: { getZone: () => D.ZONES[0], getMode: () => 'raft', getSpawn: () => ({ position: { x: 0, z: 8 }, yaw: 0 }), collide() {},
        getGate: () => ({ position: { x: 0, z: 8 }, radius: 4.5 }), getGateState: () => 'open' },
      actors: { merchant: { present: true, position: { x: 1, z: 8 } } }, ui: { openShop() { this.shop = true; }, openDescend() { this.descend = true; } },
      survival: null, combat: null,
    };
    const pl = createPlayer(ctx); ctx.player = pl; pl.init();
    return { ctx, pl, bus, events, step: (s) => { for (let i = 0; i < Math.round(s * 30); i++) pl.update(1 / 30); } };
  };
  const T = mk('trip'); T.step(0.2);
  ok(T.pl.interactable === null && T.pl.interact() === false && !T.ctx.ui.shop && !T.ctx.ui.descend, 'T46: at the gate and beside Murk on a trip: no pill, E does nothing');
  const N = mk('normal'); N.step(0.2);
  ok(N.pl.interactable?.id === 'gate', '(off a trip the built gate pill)');
  const H = mk('trip', 'home'); H.ctx.state.run = null;
  const p = H.pl.glide([[0, 0], [0, 6]], { duration: 1, skippable: true, kind: 'sailOut' });
  H.step(0.5);
  ok(H.pl.position.z > 1 && H.pl.position.z < 5.5, 'flow home steps the glide');
  H.step(0.6);
  ok(H.events.some((e) => e.state === 'start' && e.kind === 'sailOut') && H.events.some((e) => e.state === 'end' && e.kind === 'sailOut'), 'player:glide carries the kind (start and end)');
  ok(p instanceof Promise, 'glide returns its promise');
  H.pl.glide([[0, 0], [0, 6]], { duration: 1 });
  ok(H.events.at(-1).kind === 'glide', 'a built caller passes no kind: glide');
  const Z = mk('trip'); Z.step(0.1); Z.pl.teleport({ x: 20, z: 20 }, 0);
  Z.bus.emit('zone:change', { zone: 'mossmere', prev: null, sail: true });
  ok(Z.pl.position.x === 20 && Z.pl.position.z === 20, 'no respawn on zone:change {sail: true} under the loop');
  Z.bus.emit('zone:change', { zone: 'mossmere', prev: null });
  ok(Z.pl.position.z === 8 && Z.pl.position.x === 0, '(any other zone:change respawns as built)');
  // the anchor's plop as the first cast charges: on a trip its drops only (never a ring around the raft); off a trip as built
  const plop = (outing) => {
    const A = mk(outing), w = { splashes: [], ripples: 0, splash(x, z, o) { this.splashes.push(o); }, addRipple() { this.ripples++; } };
    A.ctx.water = w; A.ctx.fishing = { state: 'charging', isBusy: () => true, cancel() {} };
    A.step(0.2);
    return { anchored: A.pl.anchored, w };
  };
  const Pt = plop('trip'), Pn = plop('normal');
  ok(Pt.anchored && Pt.w.splashes.length === 1 && Pt.w.splashes[0].ring === false && Pt.w.ripples === 0, 'on a trip the anchor drops with its spray and no ring');
  ok(Pn.anchored && Pn.w.splashes.length === 1 && Pn.w.splashes[0].ring === undefined && Pn.w.ripples === 1, '(off a trip the built plop and ring)');
}

// =====================================================================================================================
section('audio: home, the sail, the passives\' sounds (T56) and the show\'s leftovers (item 25)');
{
  eq(AV3.loopHomeMood('home', true), 'hub', 'T56: flow home under the loop is the hub mood');
  ok(AV3.loopHomeMood('home', false) === null && AV3.loopHomeMood('title', true) === null, 'T56: nowhere else');
  eq(AV3.zoneSting({ zone: 'mossmere', prev: null, sail: true }), 'setout', 'T56: a Sail rings setout');
  ok(AV3.zoneSting({ zone: 'mossmere', prev: null }) === null && AV3.zoneSting({ zone: 'sporewood', prev: 'mossmere' }) === 'descend', '(the built stings unchanged)');
  const A = makeAudioHarness({ create: createAudio, data: D, flow: 'home' });
  A.step(1.2);
  eq(A.audio.getMood?.(), 'hub', 'T56: the audio mood at home is hub');
  A.done();
  const B = makeAudioHarness({ create: createAudio, data: D, run: tripRun(D, {}) });
  B.bus.emit('fishing:comeback', { phase: 'float' }); B.step(0.1);
  ok(B.log().some((e) => e.name === 'ember_hiss'), 'Ashwick: the ember hiss');
  B.done();
  const S = makeAudioHarness({ create: createAudio, data: DV3, run: { zone: 'mossmere', day: 1, phase: 'calm' } });
  S.ctx.flow = 'intro';
  S.bus.emit('card:stamp', { sizeClass: 'elder', records: [] }); S.bus.emit('card:count', { length: 120, sizeClass: 'elder', dur: 0.5 }); S.step(0.5);
  ok(!S.log().some((e) => e.name === 'seal_stamp' || e.name === 'cord_tick'), 'item 25: no card stamp (nor count) sounds under the film');
  S.ctx.flow = 'playing';
  S.bus.emit('card:stamp', { sizeClass: 'elder', records: [] }); S.step(0.2);
  ok(S.log().some((e) => e.name === 'seal_stamp'), '(in play it stamps)');
  S.ctx.cinematic = true;
  S.bus.emit('challenge:complete', { challenge: { id: 'x' } }); S.bus.emit('unlock', { key: 'k' }); S.step(1);
  ok(!S.log().some((e) => e.name === 'challenge_complete' || e.name === 'unlock'), 'item 25: a trial\'s chimes are held inside the show');
  S.ctx.cinematic = false; S.ctx.fishing.view.show = { phase: 'card' }; S.step(1);
  ok(!S.log().some((e) => e.name === 'challenge_complete'), '… and while its card is up');
  S.ctx.fishing.view.show = null; S.step(2.5);
  const names = S.log().map((e) => e.name);
  ok(names.includes('challenge_complete') && names.includes('unlock') && names.indexOf('challenge_complete') < names.indexOf('unlock'), '… then rung with their toasts, in order');
  S.ctx.fishing.view.show = { phase: 'hold' };
  S.bus.emit('sign:rise', { id: 's1', kind: 'rise', x: 4, z: 4, sizeClass: 'prize' }); S.step(0.2);
  ok(!S.log().some((e) => /^rise_/.test(e.name)), 'item 25: no rise sounds through the show\'s hush');
  S.ctx.fishing.view.show = null;
  S.bus.emit('sign:rise', { id: 's2', kind: 'rise', x: 4, z: 4, sizeClass: 'prize' }); S.step(0.2);
  ok(S.log().some((e) => /^rise_/.test(e.name)), '(after it, the lake rises again)');
  S.bus.emit('ui:modal', { open: true, id: 'catch' }); S.step(0.1);
  S.bus.emit('ui:modal', { open: true, id: 'shop' }); S.step(0.3);
  const ui = S.log().map((e) => e.name).filter((n) => /^ui_/.test(n));
  ok(ui.includes('ui_unfold') && ui.includes('ui_open'), 'item 25: the catch card unfolds with its own sound; other screens open as built');
  S.done();
  ok(AV3.SHOW_MIX.present > 1 && AV3.SHOW_MIX.lift < 1 && AV3.stampVolume('blackWaxRibbon') < AV3.stampVolume('inkStamp'), 'item 25: the mix\'s table (the render\'s gates measure it)');
}

// =====================================================================================================================
section('the film\'s line 3 under the loop (item 26, LORE §12)');
{
  const I = D.INTRO, IV = DV3.INTRO;
  eq(I.text[2], 'Its last candles fish from lamp to lamp.', 'the loop\'s line 3');
  eq(IV.text[2], 'Its last candles fish to stay lit.', 'v3 without the loop keeps its line');
  eq([I.lines[2].at, IV.lines[2].at], [12.5, 12.5], '`at` never moves');
  // A5 as validate-data reads it: characters / (out − at − lineFade) ≤ 17.5; one line at a time; the "below" beat wordless
  const a5 = (out) => {
    const l = { ...I.lines[2], out }, below = I.beats.find((b) => b.id === 'below');
    return { cps: I.text[2].length / (out - l.at - I.lineFade), gap: I.lines[3].at - out, end: out <= I.length - 0.15, below: !(l.at < below.t1 && out > below.t0) };
  };
  eq([I.lines[2].out, IV.lines[2].out], [15.2, 14.85], 'line 3 goes at 15.2 under the loop (the apply block); v3 without the loop keeps 14.85');
  const now = a5(I.lines[2].out);
  ok(now.cps <= 17.5 && now.gap >= 0.2 && now.end && now.below, `line 3 meets A5 under the loop: ${now.cps.toFixed(2)} a second, ${now.gap.toFixed(2)} s before line 4`);
  const rows = (s, px = 390, sizePx = I.words.size.phone) => Math.ceil(s.length * sizePx * 0.5 / (px - 32));
  ok(rows(I.text[2]) <= I.words.maxLines, `line 3 takes at most ${I.words.maxLines} rows at 390 px (est. ${rows(I.text[2])})`);
}

console.log(`loop-evening: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
