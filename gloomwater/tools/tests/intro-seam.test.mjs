// The opening cut scene's SEAM (docs/v3/intro/SPEC.md §8, CONTRACT §13.13). Owned by the lead / the merge agent: both build lanes
// keep it green and neither edits it. It pins what the two lanes compile against: the INTRO table's shape and its frozen block, the
// director's API and events (src/intro.js, lane B), the stage's API and its purity (src/intro-stage.js, lane A), the film's camera
// (takes, portrait values, the blend into render's sail rig), the trigger rule (A3) and the debug hook's name.
//   node tools/tests/intro-seam.test.mjs
globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
const D = await import('../../src/data.js');
const core = await import('../../src/core.js');
const DIR = await import('../../src/intro.js');
const STG = await import('../../src/intro-stage.js');
const { readFileSync } = await import('node:fs');

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const near = (a, b, eps, msg) => ok(Math.abs(a - b) <= eps, `${msg} (got ${a}, want ${b} ± ${eps})`);
const section = (s) => console.log(`- ${s}`);
const I = D.INTRO;

// ------------------------------------------------------------------ the frozen block (a lane that needs it changed asks the lead)
section('INTRO: the frozen block');
eq(I.length, 18, 'INTRO.length');
eq(I.beats.map((b) => [b.id, b.t0, b.t1]), [['lit', 0, 5], ['fall', 5, 8.2], ['below', 8.2, 12.4], ['wick', 12.4, 14.6], ['home', 14.6, 18]], 'INTRO.beats');
eq(I.text, ['A kingdom hangs a great lantern over its lake.', 'The lantern falls. The kingdom follows it down.', 'Its last candles fish to stay lit.', 'You are one of them.'], 'INTRO.text');
eq(I.words.band, { landscape: [0.86, 0.95], portrait: [0.90, 0.97] }, 'INTRO.words.band');
eq([I.veil, I.swapAt, I.cut.at], [[[0, 0], [0.35, 1], [0.6, 1], [1.4, 0]], 0.45, 8.2], 'INTRO.veil / swapAt / cut');
ok(core.HIDDEN_DEBUG_HOOKS.includes('intro'), "the debug hook 'intro' is a hidden hook (never in a release build)");

// ------------------------------------------------------------------ pure timeline helpers (lane B)
section('director: pure helpers');
eq(DIR.beatAt(I, 0).id, 'lit', 'beatAt(0)');
eq(DIR.beatAt(I, 8.2).id, 'below', 'beatAt(8.2) is the next beat (half-open intervals)');
eq(DIR.beatAt(I, 18).id, 'home', 'beatAt(length) stays in the last beat');
near(DIR.beatAt(I, 6.6).k, 0.5, 1e-9, 'beatAt().k runs 0 → 1 through the beat');
eq(DIR.lineAt(I, 0.5), null, 'no line before the first one');
eq(DIR.lineAt(I, 2).i, 0, 'line 0 at 2 s');
eq(DIR.lineAt(I, 10), null, 'the beat "below" is wordless');
eq(DIR.lineAt(I, 16).text, 'You are one of them.', 'the last line');
eq(DIR.lineAt(I, 17.8), null, 'no words when control begins');
ok(DIR.lineAt(I, I.lines[0].at + 0.2).k < 1 && DIR.lineAt(I, I.lines[0].at + 1).k === 1, 'a line fades in over INTRO.lineFade');
{ let lines = 0, prev = null; for (let t = 0; t <= 18; t += 0.01) { const l = DIR.lineAt(I, t); const i = l ? l.i : null; if (i !== prev && i !== null) lines++; prev = i; } eq(lines, I.text.length, 'every line shows exactly once, one at a time'); }
eq([DIR.veilAt(I, 0), DIR.veilAt(I, 0.45), DIR.veilAt(I, 2)], [0, 1, 0], 'veilAt: clear, full at the swap, clear again');
near(DIR.veilAt(I, 1.0), 0.5, 1e-9, 'veilAt interpolates');
eq(I.beats.map((b) => DIR.stillAt(I, (b.t0 + b.t1) / 2)), I.stills.map((s) => s.t), 'stillAt: one still per beat');
eq(DIR.stillAt(I, 0.2), 0.2, 'stillAt before the swap is the title frame');

section('director: the clock (A1)');
{ let c = { t: 0, wall: 0 }, n = 0; while (!(c = DIR.stepClock(c, 1 / 60, I)).over && n++ < 5000) { /* run */ } near(n / 60, 18, 0.05, '60 fps: a full play lasts INTRO.length'); }
{ const c = DIR.stepClock({ t: 3, wall: 3 }, 5, I); near(c.t, 3 + I.clock.maxDt, 1e-9, 'one long frame (a hidden tab coming back) moves the film by maxDt only'); ok(c.wall <= 3 + I.clock.valveDt + 1e-9, '… and the valve by valveDt only'); }
{ let c = { t: 0, wall: 0 }, n = 0; while (!(c = DIR.stepClock(c, 0.5, I)).over && n++ < 5000) { /* 2 fps */ } ok(c.wall >= 25 - 1e-9 && c.t < 18, 'a 2 fps machine: the 25 s safety valve ends it'); }
{ let c = { t: 13, wall: 13 }, n = 0; const rate = (18 - 13) / I.skip.finish; while (!(c = DIR.stepClock(c, 1 / 60, I, rate)).over && n++ < 500) { /* fast finish */ } near(n / 60, I.skip.finish, 0.05, 'a rate plays the rest out in INTRO.skip.finish s'); }

section('director: the trigger rule (A3)');
const P = (o) => DIR.introPending({ v3: true, intro: I, meta: { runs: 0 }, debug: false, optIn: false, savedRun: false, ...o });
ok(P({}) === true, 'a fresh save on a release v3 build: pending');
ok(P({ v3: false }) === false, 'flag off: never');
ok(P({ meta: { runs: 1 } }) === false, 'a save with a run: never again');
ok(P({ meta: { runs: 0, intro: { seen: true } } }) === false, 'seen: never again');
ok(P({ savedRun: true }) === false, 'a run waiting to be continued: no');
ok(P({ debug: true }) === false, 'a debug build (the test harness): not unless a scenario opts in');
ok(P({ debug: true, optIn: true }) === true, 'a debug build that opted in: pending');
ok(DIR.introOptIn({ GW_INTRO: true }) && DIR.introOptIn({ location: { search: '?v3=1&intro=1' } }) && !DIR.introOptIn({ location: { search: '?v3=1&intro=10' } }) && !DIR.introOptIn({}), 'introOptIn: GW_INTRO or ?intro=1');

// ------------------------------------------------------------------ the camera (lane A; pure)
section('stage: the film\'s camera');
const A = { S: { x: 0, z: 46 }, G: { x: 0, z: -77.63 } };
eq(STG.introCamera(I, 0.2), null, 'before INTRO.swapAt the title keeps its camera');
{ const c = STG.introCamera(I, I.swapAt); ok(c && c.take === 'gate' && c.w === 1 && c.rig === null, 'the gate take starts at the swap'); eq(STG.resolvePoint(c.pos, A), [0, 2.2, 34], 'its first pose: 12 m north of the raft, 2.2 m over the water'); }
{ let worst = 0, prev = null;
  for (let t = I.swapAt; t < 8.2; t += 1 / 60) { const c = STG.introCamera(I, t), p = STG.resolvePoint(c.pos, A); if (prev) worst = Math.max(worst, Math.hypot(p[0] - prev[0], p[1] - prev[1], p[2] - prev[2])); prev = p; }
  ok(worst < 0.08, `the gate take is one continuous move (largest step at 60 fps ${worst.toFixed(3)} m)`); }
{ const a = STG.introCamera(I, 8.19), b = STG.introCamera(I, 8.2); ok(a.take === 'gate' && b.take === 'shoulder', 'the one cut is at INTRO.cut.at'); }
{ const c0 = STG.introCamera(I, 14.6), c1 = STG.introCamera(I, 16), c2 = STG.introCamera(I, I.cameras.takes.at(-1).blend[1]), c3 = STG.introCamera(I, 18);
  ok(c0.take === 'home' && c0.rig === 'sail' && c0.w === 1 && c1.w > 0 && c1.w < 1 && c2.w === 0 && c3.w === 0, 'the last take hands the camera to the sail rig (w 1 → 0) and rests');
  { const a = STG.resolvePoint(c0.pos, A), b = STG.resolvePoint(STG.introCamera(I, 14.5999).pos, A); ok(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 0.01, 'no jump into the last take'); } }
{ const land = STG.introCamera(I, 3, 16 / 9), port = STG.introCamera(I, 3, 390 / 844), mid = STG.introCamera(I, 3, 1.0);
  ok(land.fov === 46 && Math.abs(port.fov - 62) < 1e-6 && mid.fov > 46 && mid.fov < 62, 'portrait values apply under INTRO.cameras.portraitBelow and blend up to 1.1');
  eq([STG.portraitWeight(I, 0.46), STG.portraitWeight(I, 1.78)], [1, 0], 'portraitWeight'); }
for (let t = 0; t <= 18; t += 0.37) { const a = JSON.stringify(STG.introCamera(I, t, 1.5)); STG.introCamera(I, 18 - t, 0.5); if (a !== JSON.stringify(STG.introCamera(I, t, 1.5))) { ok(false, `introCamera is pure (t ${t})`); break; } }
pass++;

// ------------------------------------------------------------------ the stage's API on a fake game (lane A keeps it; purity in calls)
section('stage: API and purity');
function fakeGame() {
  const cams = [], calls = { mood: [], light: [], kindle: [], snap: 0 };
  const ctx = { data: D, errors: [], bus: core.createBus(), state: { meta: { runs: 0 }, run: null }, flow: 'title' };
  ctx.render = { camera: { aspect: 16 / 9 }, setIntroCamera(p) { cams.push(p ? { pos: [...p.pos], look: [...p.look], fov: p.fov, w: p.w } : null); }, snapCamera() { calls.snap++; },
    scene: { add() {}, remove() {} }, renderer: { info: { memory: { geometries: 0, textures: 0 } } } };
  ctx.world = { getSpawn: () => ({ position: { x: 0, y: 0, z: 46 }, yaw: 0 }), getHeroAnchor: () => ({ x: 0, z: -77.63, face: 0, theme: 'mossmere' }),
    setIntroMood(on) { calls.mood.push(on); }, setIntroWaterLight(l) { calls.light.push(l); }, isOpenWater: () => true, getZone: () => ({ id: 'mossmere' }) };
  ctx.actors = { setIntroKindle(k) { calls.kindle.push(k); }, getHeadPos: (o = {}) => Object.assign(o, { x: 0, y: 1.6, z: 46 }) };
  ctx.water = { addRipple() {}, splash() {}, getHeight: () => 0 };
  return { ctx, cams, calls };
}
{ const g = fakeGame(), st = STG.createIntroStage(g.ctx);
  for (const k of ['prebuild', 'enter', 'setTime', 'exit', 'dispose', 'stats']) ok(typeof st[k] === 'function', `stage.${k}()`);
  ok('ready' in st, 'stage.ready');
  st.setTime(3); eq(g.cams.length, 0, 'setTime before enter() does nothing');
  st.enter({}); st.enter({}); eq(g.calls.mood, [true], 'enter() is idempotent and puts the world in the opening mood');
  st.setTime(0.2); eq(g.cams.at(-1), null, 'before the swap the stage leaves the title camera alone');
  st.setTime(3); const a = JSON.stringify(g.cams.at(-1)); st.setTime(16); st.setTime(9); st.setTime(3);
  eq(JSON.stringify(g.cams.at(-1)), a, 'setTime(t) is a pure function of t (same pose after other moments)');
  st.setTime(18); eq(g.cams.at(-1).w, 0, 'at the end the rig alone has the camera');
  st.setTime(99); eq(st.stats().t, 18, 'setTime clamps to the film');
  st.exit(); st.exit(); eq(g.cams.at(-1), null, 'exit() gives the camera back'); eq(g.calls.mood.at(-1), false, '… and the world its own mood');
  ok(g.calls.light.at(-1) === null, '… and takes its light off the water');
  st.dispose(); ok(st.ready === false, 'dispose() frees the set'); eq(g.ctx.errors, [], 'no errors'); }

// ------------------------------------------------------------------ the director on a fake game (lane B keeps the API and events)
section('director: API and events');
function play({ stage, hidden = false, meta = { runs: 0 }, debug = false } = {}) {
  const g = fakeGame(); g.ctx.state.meta = meta;
  const ev = [];
  for (const e of ['intro:start', 'intro:beat', 'intro:line', 'intro:skip', 'intro:done']) g.ctx.bus.on(e, (p) => ev.push([e, p]));
  const dir = DIR.create(g.ctx, { debug, hasSavedRun: () => false, ...(stage ? { createStage: () => stage } : {}) });
  dir.init();
  globalThis.document = { hidden };
  return { ...g, ev, dir, run(sec, fps = 60) { for (let i = 0; i < sec * fps; i++) dir.update(1 / fps); } };
}
{ const p = play();
  for (const k of ['init', 'pending', 'prewarm', 'start', 'skip', 'update', 'seek', 'stop', 'isActive']) ok(typeof p.dir[k] === 'function', `director.${k}()`);
  eq(p.dir.pending(), true, 'pending() on a fresh save');
  eq(p.dir.isActive(), false, 'idle'); p.dir.update(1); eq(p.ev, [], 'update() while idle does nothing');
  ok(p.dir.start({}) === true && p.dir.start({}) === false, 'start() once');
  p.run(17.9); ok(p.dir.isActive(), 'still playing at 17.9 s');
  p.run(0.3); ok(!p.dir.isActive(), 'over at 18 s');
  const names = p.ev.map(([e]) => e);
  eq([names[0], names.at(-1), names.filter((e) => e === 'intro:done').length], ['intro:start', 'intro:done', 1], 'intro:start first, intro:done last and once');
  eq(p.ev.filter(([e]) => e === 'intro:beat').map(([, x]) => x.id), I.beats.map((b) => b.id), 'intro:beat for every beat, in order');
  eq(p.ev.filter(([e, x]) => e === 'intro:line' && x.i !== null).map(([, x]) => x.i), [0, 1, 2, 3], 'intro:line for every line, in order');
  ok(p.ev.filter(([e]) => e === 'intro:line').every(([, x], i, a) => x.i === null || i === 0 || a[i - 1][1].i === null), 'one line at a time: each is cleared before the next');
  const done = p.ev.at(-1)[1]; ok(done.skipped === false && done.replay === false && done.error === false && Math.abs(done.t - 18) < 1e-6, 'intro:done {skipped: false, replay: false, t: 18}');
  eq(p.cams.at(-1), null, 'the stage was exited and the camera given back'); eq(p.ctx.state.meta, { runs: 0 }, 'the director writes nothing to meta'); eq(p.ctx.errors, [], 'no errors'); }
{ const p = play(); p.dir.start({}); p.run(0.3); ok(p.dir.skip() === false && p.dir.isActive(), 'a skip inside the 0.5 s guard is ignored (the stray second tap of Begin)');
  p.run(0.4); ok(p.dir.skip() === true, 'a skip after the guard is taken'); p.run(1);
  const done = p.ev.filter(([e]) => e === 'intro:done'); ok(done.length === 1 && done[0][1].skipped === true && !p.dir.isActive(), 'a skip ends in one intro:done {skipped: true}');
  eq(p.ev.find(([e]) => e === 'intro:skip')[1].mode, 'veil', 'a skip in the first beats is the veil kind'); }
{ const p = play(); p.dir.start({}); p.run(13); p.dir.skip(); eq(p.ev.find(([e]) => e === 'intro:skip')[1].mode, 'finish', 'a skip from the beat INTRO.skip.finishFrom on is the fast-finish kind'); }
{ const p = play({ hidden: true }); p.dir.start({}); p.run(5); near(p.dir.state.t, 0, 1e-9, 'the film does not run while the page is hidden'); globalThis.document.hidden = false; p.run(1); ok(p.dir.state.t > 0.9, '… and runs on when it shows again'); p.dir.stop(); }
{ const p = play(); const s = p.dir.seek(6.5); ok(s.phase === 'playing' && s.hold && Math.abs(s.t - 6.5) < 1e-9 && s.beat === 'fall' && s.replay === true, 'seek(t) holds the film at t (a sought film is a replay: it never marks the save)');
  p.run(3); near(p.dir.state.t, 6.5, 1e-9, 'a held film does not move'); ok(p.calls.snap >= 1, 'a seek shows the settled picture');
  const a = JSON.stringify(p.cams.at(-1)); p.dir.seek(16); p.dir.seek(6.5); eq(JSON.stringify(p.cams.at(-1)), a, 'seek(t) is repeatable'); p.dir.stop(); ok(!p.dir.isActive() && p.ev.filter(([e]) => e === 'intro:done').length === 0, 'stop() ends it with no event'); }
{ const p = play(); p.dir.start({ reduced: true }); p.run(3); near(p.cams.at(-1).pos[2], STG.resolvePoint(STG.introCamera(I, I.stills[0].t).pos, A)[2], 1e-6, 'reduced motion: the stage holds the beat\'s still');
  eq(p.dir.state.line, 0, '… with the same lines'); p.dir.stop(); }
{ // A10: a stage that throws ends the film cleanly, once
  const bad = { prebuild() { return true; }, enter() {}, setTime(t) { if (t > 2) throw new Error('boom'); }, exit() {}, dispose() {}, stats: () => ({}) };
  const p = play({ stage: bad }); p.dir.start({}); p.run(3);
  const done = p.ev.filter(([e]) => e === 'intro:done'); ok(done.length === 1 && done[0][1].error === true && !p.dir.isActive(), 'an exception in the stage ends the film with intro:done {error: true}');
  ok(p.ctx.errors.length >= 1, '… and is reported'); }
delete globalThis.document;

// ------------------------------------------------------------------ the lane markers (the merge stays trivial)
section('lane markers in the shared files');
const src = (f) => readFileSync(new URL(`../../src/${f}`, import.meta.url), 'utf8');
const balanced = (text, lane) => (text.match(new RegExp(`>>> INTRO LANE ${lane}`, 'g')) || []).length === (text.match(new RegExp(`<<< INTRO LANE ${lane}`, 'g')) || []).length;
for (const [f, lane, other] of [['main.js', 'B', 'A'], ['ui.css', 'B', 'A'], ['ui-screens.js', 'B', 'A'], ['render.js', 'A', 'B'], ['world.js', 'A', 'B']]) {
  const t = src(f);
  ok(t.includes(`>>> INTRO LANE ${lane}`) && balanced(t, lane), `${f}: lane ${lane}'s blocks are marked and closed`);
  ok(!t.includes(`INTRO LANE ${other}`), `${f}: nothing of lane ${other}'s`);
}
{ const t = src('data.js'); ok(['>>> INTRO shared (frozen)', '<<< INTRO shared', '>>> INTRO LANE A', '<<< INTRO LANE A', '>>> INTRO LANE B', '<<< INTRO LANE B'].every((m) => t.includes(m)), 'data.js: INTRO is in three marked blocks'); }

console.log(`intro-seam: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
