// The opening cut scene's director, trigger rule, view helpers and sound cue (docs/v3/intro/SPEC.md §3, §7, §10: A1, A2, A3, A7, A8,
// A10; lane B owns this file). Pure logic on fake games: the director (src/intro.js) with a recording stage, the save rules on
// core.js and progression-v3.js, the view's pure helpers (src/ui-intro.js) and the cue (src/audio-intro.js wired into src/audio.js)
// on the deterministic fake WebAudio (tools/tests/audio-env.mjs).
//   node tools/tests/intro.test.mjs      (or node tools/check.mjs)
// What is covered here and not in tools/tests/intro-seam.test.mjs (the seam both lanes compile against): the two skip paths and
// their budget, a skip at every moment of the film landing in one end state, the under-ink entry of the stage and main's hook, the
// valve's end state, reduced motion's stills and their event order, every error path, the trigger for fresh / returning / replay
// saves, and the whole of the sound cue.
import { makeAudioHarness, FakeAudioContext, installGlobals, createBus as fakeBus } from './audio-env.mjs';

globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
const D = await import('../../src/data.js');
const core = await import('../../src/core.js');
const DIR = await import('../../src/intro.js');
const VIEW = await import('../../src/ui-intro.js');
const PV3 = await import('../../src/progression-v3.js');
const AUDIO = await import('../../src/audio.js');
const CUE = await import('../../src/audio-intro.js');

let pass = 0, fail = 0;
function ok(cond, msg, extra) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra) : ''); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const near = (a, b, eps, msg) => ok(Math.abs(a - b) <= eps, `${msg} (got ${a}, want ${b} ± ${eps})`);
const section = (s) => console.log(`- ${s}`);
const I = D.INTRO, L = I.length, K = I.skip;

// ------------------------------------------------------------------ a fake game around the director
/** A stage that records every call (the contract of src/intro-stage.js): `ready` as given, optional faults. */
function recStage({ ready = false, throwAt = null, throwOn = null } = {}) {
  const calls = [];
  const st = {
    calls, live: false, built: ready, disposed: 0,
    prebuild() { calls.push(['prebuild']); if (throwOn === 'prebuild') throw new Error('boom prebuild'); st.built = true; return true; },
    get ready() { return st.built; },
    enter(o) { calls.push(['enter', { ...o }]); if (throwOn === 'enter') throw new Error('boom enter'); st.live = true; st.built = true; },
    setTime(t, o) { if (!st.live) { calls.push(['setTime-before-enter', t]); return; } calls.push(['setTime', t, { ...o }]); if (throwAt !== null && t > throwAt) throw new Error('boom setTime'); },
    exit() { calls.push(['exit']); st.live = false; },
    dispose() { calls.push(['dispose']); st.disposed++; if (throwOn === 'dispose') throw new Error('boom dispose'); st.live = false; st.built = false; },
    stats: () => ({ live: st.live, built: st.built }),
  };
  return st;
}
function game({ stage = recStage(), meta = { runs: 0 }, debug = false, savedRun = false, settings = null, sliceMs } = {}) {
  const ctx = { data: D, errors: [], bus: core.createBus(), state: { meta: settings ? { ...meta, settings } : meta, run: null }, flow: 'title' };
  const ev = [], order = [];
  for (const e of ['intro:start', 'intro:beat', 'intro:line', 'intro:skip', 'intro:done']) ctx.bus.on(e, (p) => { ev.push([e, p]); order.push(e === 'intro:beat' ? `beat:${p.id}` : e); });
  const dir = DIR.create(ctx, { debug, hasSavedRun: () => savedRun, createStage: () => stage, sliceMs });
  dir.init();
  globalThis.document = { hidden: false };
  let real = 0;
  const g = {
    ctx, ev, order, dir, stage,
    get real() { return real; },
    /** `sec` seconds of real time in frames of 1 / fps. */
    run(sec, fps = 60) { const n = Math.round(sec * fps); for (let i = 0; i < n && dir.isActive(); i++) { dir.update(1 / fps); real += 1 / fps; } return g; },
    /** Frames until the film's clock reaches t. */
    to(t, fps = 60) { let n = 0; while (dir.isActive() && dir.state.t < t - 1e-9 && n++ < 100000) { dir.update(1 / fps); real += 1 / fps; } return g; },
    out(fps = 60) { let n = 0; while (dir.isActive() && n++ < 100000) { dir.update(1 / fps); real += 1 / fps; } return n; },
    done: () => ev.filter(([e]) => e === 'intro:done').map(([, p]) => p),
    times: () => stage.calls.filter((c) => c[0] === 'setTime').map((c) => c[1]),
  };
  return g;
}
const quietly = (fn) => { const e = console.error; console.error = () => {}; try { return fn(); } finally { console.error = e; } };

// ================================================================== the timeline's arithmetic
section('timeline arithmetic');
eq(I.beats.map((b) => DIR.beatAt(I, b.t0).id), I.beats.map((b) => b.id), 'beatAt at every beat\'s first moment');
eq(I.beats.map((b) => DIR.beatAt(I, b.t1 - 1e-6).id), I.beats.map((b) => b.id), '… and its last');
eq(DIR.beatAt(I, -1).id, 'lit', 'beatAt before the film is the first beat');
for (const l of I.lines) {
  eq(DIR.lineAt(I, l.at - 1e-6), null, `line ${l.i + 1}: not up before its time`);
  near(DIR.lineAt(I, l.at + I.lineFade / 2).k, 0.5, 1e-6, `line ${l.i + 1}: half in after half the fade`);
  eq(DIR.lineAt(I, (l.at + l.out) / 2).k, 1, `line ${l.i + 1}: full in the middle`);
  near(DIR.lineAt(I, l.out - I.lineFade / 2).k, 0.5, 1e-6, `line ${l.i + 1}: half out before it goes`);
  eq(DIR.lineAt(I, l.out), null, `line ${l.i + 1}: gone at its out time`);
  ok(D.INTRO.text[l.i].length <= I.words.maxChars, `line ${l.i + 1}: at most ${I.words.maxChars} characters`);
}
ok(I.text.length <= 4, 'at most four lines');
{ let two = 0; for (let t = 0; t <= L; t += 0.005) if (I.lines.filter((l) => t >= l.at && t < l.out).length > 1) two++; eq(two, 0, 'never two lines at once'); }
eq(DIR.lineAt(I, L - 0.15), null, 'no words in the last 0.15 s (the hand-off comes on a clear frame)');
eq([DIR.skipModeAt(I, 0.6), DIR.skipModeAt(I, 6), DIR.skipModeAt(I, 10), DIR.skipModeAt(I, 12.39), DIR.skipModeAt(I, 12.4), DIR.skipModeAt(I, 17.9)], ['veil', 'veil', 'veil', 'veil', 'finish', 'finish'], 'skipModeAt: the ink in lit / fall / below, the fast finish from wick on');
eq([DIR.skipWordAt(I, 0.3), DIR.skipWordAt(I, K.showAt)], [0, 0], 'the Skip word is not shown before INTRO.skip.showAt');
eq(DIR.skipWordAt(I, 1.0), 1, 'the Skip word is fully shown within 1 s of the first frame');
near(DIR.skipWordAt(I, L - K.wordOut), 1, 1e-9, 'the Skip word goes with the film\'s last moments (the camera is at rest by then)'); eq(DIR.skipWordAt(I, L), 0, '… and is gone at the end');
near(DIR.skipWordAt(I, L - K.wordOut / 2), 0.5, 1e-9, '… fading on the film\'s clock');
ok(L - K.wordOut >= I.cameras.takes.at(-1).blend[1] && L - K.wordOut >= I.lines.at(-1).out, '… only once the camera has settled and the last line has gone');
ok(DIR.skipAllowed(I, L - 0.01), '… and the keys still skip to the very end');
ok(DIR.skipAllowed(I, 0.49) === false && DIR.skipAllowed(I, 0.5) === true, 'skipAllowed: the 0.5 s guard');
ok(K.showAt >= K.guard, 'the Skip word never shows inside the guard');
eq([DIR.cutDipAt(I, I.cut.at), DIR.cutDipAt(I, I.cut.at - I.calm.cutDip), DIR.cutDipAt(I, I.cut.at + I.calm.cutDip)], [1, 0, 0], 'cutDipAt: full ink on the cut, clear either side');
near(DIR.cutDipAt(I, I.cut.at - I.calm.cutDip / 4), 0.5, 1e-6, 'cutDipAt closes linearly');
eq(I.beats.slice(1).map((b) => DIR.stillDipAt(I, b.t0)), [1, 1, 1, 1], 'stillDipAt: full ink at every change of beat');
eq([DIR.stillDipAt(I, 3), DIR.stillDipAt(I, 0), DIR.stillDipAt(I, L)], [0, 0, 0], 'stillDipAt: clear inside the beats, at the start and at the end');
eq(DIR.inkFullAt(I), 0.35, 'inkFullAt: the first moment of full ink');
ok(DIR.inkFullAt(I) < I.swapAt && I.swapAt < I.veil.filter(([, k]) => k === 1).at(-1)[0], 'the stage takes the picture strictly inside the full ink');

// ================================================================== the clock (A1)
section('the clock (A1)');
for (const fps of [144, 60, 30, 20, 10]) { const g = game(); g.dir.start({}); g.out(fps); near(g.real, L, 1 / fps + 1e-6, `${fps} fps: a full play lasts ${L} s`); eq(g.done().length, 1, `${fps} fps: one intro:done`); near(g.done()[0].t, L, 1e-9, `${fps} fps: it ends at the film's end`); }
{ const g = game(); g.dir.start({}); g.run(2); const t = g.dir.state.t; g.dir.update(30); near(g.dir.state.t, t + I.clock.maxDt, 1e-9, 'a 30 s frame (a tab coming back) moves the film by maxDt'); g.dir.update(-5); g.dir.update(NaN); near(g.dir.state.t, t + I.clock.maxDt, 1e-9, 'a negative or NaN frame time moves nothing'); g.dir.stop(); }
{ // the safety valve: a machine too slow to keep up still ends, in the end state
  const g = game(); g.dir.start({}); const n = g.out(2);
  const d = g.done()[0], last = g.times().at(-1), lastCall = g.stage.calls.filter((c) => c[0] === 'setTime').at(-1);
  ok(n * I.clock.valveDt >= I.clock.valve - 1e-9 && n * I.clock.valveDt < I.clock.valve + 1, `2 fps: the valve ends it after ${I.clock.valve} s of visible time (${(n * I.clock.valveDt).toFixed(2)} s)`);
  ok(d && d.skipped === false && d.error === false && d.t === L, 'the valve ends in intro:done {skipped: false} at the film\'s end', d);
  ok(last === L && lastCall[2].seek === true, 'the valve shows the end state (stage.setTime(length), settled) before it hands over');
  eq(g.stage.calls.at(-1)[0], 'dispose', '… and disposes the stage'); }
{ // hidden: nothing moves, nothing is skipped past
  const g = game(); g.dir.start({}); g.run(3); const t = g.dir.state.t, w = g.dir.state.wall, n = g.stage.calls.length;
  globalThis.document.hidden = true; g.run(40);
  ok(g.dir.state.t === t && g.dir.state.wall === w && g.stage.calls.length === n && g.dir.isActive(), 'while the page is hidden the film, the valve and the stage all stand still');
  globalThis.document.hidden = false; g.out();
  near(g.done()[0].t, L, 1e-9, '… and it plays to its end when the page shows again'); eq(g.done()[0].skipped, false, '… unskipped'); }

// ================================================================== when the stage goes live
section('the stage goes live under the ink');
{ // prebuilt, nothing to do under the ink: live at the press
  const g = game({ stage: recStage({ ready: true }) }); g.dir.start({});
  eq(g.stage.calls[0][0], 'enter', 'prebuilt: the stage is live at the press');
  ok(g.stage.calls.filter((c) => c[0] === 'enter').length === 1 && g.dir.state.entered, '… once'); g.out();
  eq(g.stage.calls.filter((c) => c[0] === 'enter').length, 1, 'enter() once per play'); }
for (const fps of [60, 10, 4, 2]) {
  // not built: the build waits for one painted frame of full ink, and comes before the stage's first moment after the swap
  const g = game(); g.dir.start({});
  ok(!g.stage.calls.some((c) => c[0] === 'enter'), `${fps} fps, not prebuilt: nothing is built at the press`);
  let fullInkFrames = 0, enteredAt = null;
  while (g.dir.isActive() && enteredAt === null) {
    const before = DIR.veilAt(I, g.dir.state.t) >= 1;
    g.dir.update(1 / fps);
    if (g.dir.state.entered) enteredAt = g.dir.state.t; else if (DIR.veilAt(I, g.dir.state.t) >= 1 || before) fullInkFrames++;
  }
  ok(enteredAt !== null && enteredAt >= DIR.inkFullAt(I) && DIR.veilAt(I, enteredAt) >= 1 - 1e-9, `${fps} fps: the stage goes live under full ink (t ${enteredAt?.toFixed(3)})`);
  ok(fullInkFrames >= 1, `${fps} fps: after at least one frame of full ink was on screen`);
  const firstSet = g.stage.calls.find((c) => c[0] === 'setTime');
  ok(!g.stage.calls.some((c) => c[0] === 'setTime-before-enter' && c[1] >= I.swapAt), `${fps} fps: no moment after the swap was asked of a stage that was not live`);
  ok(firstSet && Math.abs(firstSet[1] - enteredAt) < 1e-3, `${fps} fps: the stage's first moment is the frame it went live`);
  g.dir.stop();
}
{ // main's hook (a replay's lake swap): once, under the ink, before enter(), even when the stage was prebuilt
  const seq = [], st = recStage({ ready: true }); const enter = st.enter; st.enter = (o) => { seq.push('enter'); enter(o); };
  const g = game({ stage: st }); let hookT = null, hookArg = null;
  g.dir.start({ replay: true, underInk: (a) => { seq.push('hook'); hookT = g.dir.state.t; hookArg = a; } });
  eq(seq, [], 'with work to do under the ink, nothing happens at the press');
  g.to(1);
  eq(seq, ['hook', 'enter'], 'the hook runs once, then the stage goes live');
  ok(hookT >= DIR.inkFullAt(I) && DIR.veilAt(I, hookT) >= 1 - 1e-9 && hookArg.replay === true, 'the hook runs under full ink', { hookT, hookArg });
  g.out(); eq(seq, ['hook', 'enter'], '… and never again'); }
{ const seq = []; const g = game(); g.dir.start({ underInk: () => seq.push('hook') }); g.dir.seek(9); eq(seq, ['hook'], 'a seek goes live at once (the hook first)'); ok(g.dir.state.entered && g.times().at(-1) === 9, '… and shows the sought moment'); g.dir.stop(); }
{ const seq = []; const g = game(); g.dir.start({ underInk: () => seq.push('hook') }); g.dir.stop(); const g2 = game({ stage: g.stage }); g2.dir.start({}); g2.out(); eq(seq, [], 'a film stopped before the ink never runs its hook, and the hook does not leak into the next play'); }
{ const g = game(); quietly(() => { g.dir.start({ underInk: () => { throw new Error('lake'); } }); g.out(); }); const d = g.done(); ok(d.length === 1 && d[0].error === true && !g.dir.isActive() && g.ctx.errors.length >= 1, 'a hook that throws ends the film cleanly (intro:done {error: true})'); }
{ // a press before the title's idle prebuild finished: the rest is built ONE slice a frame under the full ink, the clock held there
  const st = recStage(); let left = 6; const seq = [];
  st.prebuild = () => { st.calls.push(['prebuild']); seq.push(['slice', g.dir.state.t]); if (--left <= 0) st.built = true; return st.built; };
  const enter = st.enter; st.enter = (o) => { seq.push(['enter', g.dir.state.t, st.built]); enter(o); };
  const g = game({ stage: st, sliceMs: 0 });
  g.dir.start({ underInk: () => seq.push(['hook', g.dir.state.t]) });
  g.to(1);
  const slices = seq.filter((x) => x[0] === 'slice'), ts = slices.map((x) => x[1]);
  eq(seq[0][0], 'hook', 'an unbuilt stage: the under-ink work first');
  eq(slices.length, 6, '… then one slice a frame until it is ready', seq);
  ok(ts.every((t) => t === ts[0]) && DIR.veilAt(I, ts[0]) >= 1 && ts[0] < I.swapAt, '… the film\'s clock held at the full ink meanwhile, before the swap', ts);
  const en = seq.find((x) => x[0] === 'enter');
  ok(en && en[2] === true && DIR.veilAt(I, en[1]) >= 1, '… and the stage goes live built, still under the ink', en);
  g.out(); eq(g.done().length, 1, '… and the film plays to its end'); eq(g.done()[0].t, L, '… at the film\'s end'); }
{ // a world that never says its anchors: the hold is bounded, and enter() is left to build (or fail) under the ink
  const st = recStage(); let n = 0; st.prebuild = () => { n++; return false; };
  const g = game({ stage: st }); g.dir.start({}); g.to(2);
  ok(n > 0 && n <= 48 && g.dir.state.entered, 'a build that never finishes holds the clock a bounded number of frames', { n }); g.dir.stop(); }
{ // with time in the frame, several slices are taken in it (a fast machine is not held for ten frames)
  const st = recStage(); let left = 6, frames = 0; const seen = new Set();
  st.prebuild = () => { seen.add(g.dir.state.t); if (--left <= 0) st.built = true; return st.built; };
  const g = game({ stage: st, sliceMs: 50 }); g.dir.start({}); g.to(1);
  ok(seen.size === 1 && left <= 0, 'a frame with time to spare takes every slice it can', { frames: seen.size }); g.dir.stop(); }

// ================================================================== skip (A2)
section('skip: the guard and the two paths (A2)');
{ const g = game(); g.dir.start({});
  ok(g.dir.skip() === false, 'a skip on the first frame is ignored');
  g.to(0.49, 1000); ok(g.dir.skip() === false && g.dir.state.skip === null && !g.ev.some(([e]) => e === 'intro:skip'), 'a skip at 0.49 s is ignored (the guard)');
  g.to(0.5, 1000); ok(g.dir.skip() === true, 'a skip at 0.5 s is taken'); ok(g.dir.skip() === false, 'a second skip does nothing');
  eq(g.ev.filter(([e]) => e === 'intro:skip').length, 1, 'one intro:skip'); g.out(); eq(g.done().length, 1, 'one intro:done'); }
{ const g = game(); ok(g.dir.skip() === false, 'skip() while idle does nothing'); g.dir.start({}); g.dir.seek(5); ok(g.dir.skip() === false, 'a held (sought) film is not skipped'); g.dir.stop(); }
/** Skip at film time t on a fresh game; returns what happened. */
function skipAt(t, { fps = 60, reduced = false } = {}) {
  const g = game({ stage: recStage({ ready: true }) });
  g.dir.start({ reduced });
  g.to(t, fps);
  const t0 = g.dir.state.t, lineBefore = g.dir.state.line;
  const evAt = g.ev.length;
  const ok0 = g.dir.skip();
  const veil = [];
  let n = 0;
  while (g.dir.isActive() && n++ < 10000) { g.dir.update(1 / fps); veil.push(g.dir.state.skip ? g.dir.state.skip.k : null); }
  const took = n / fps;
  const after = g.ev.slice(evAt);
  return { g, ok0, t0, took, veil, after, lineBefore, mode: g.ev.find(([e]) => e === 'intro:skip')?.[1].mode, done: g.done() };
}
/** What a play leaves behind (the end state the director is responsible for): the stage's last moment, then its disposal. */
const endOf = (g) => { const c = g.stage.calls, sets = c.filter((x) => x[0] === 'setTime'); return { last: sets.at(-1)[1], tail: c.at(-1)[0], disposed: g.stage.disposed, live: g.stage.live, active: g.dir.isActive(), phase: g.dir.state.phase, line: g.dir.state.line, beat: g.dir.state.beat, skip: g.dir.state.skip, entered: g.dir.state.entered }; };
const fullPlay = (() => { const g = game({ stage: recStage({ ready: true }) }); g.dir.start({}); g.out(); return endOf(g); })();
eq(fullPlay, { last: L, tail: 'dispose', disposed: 1, live: false, active: false, phase: 'idle', line: null, beat: null, skip: null, entered: false }, 'a full play: the stage at the film\'s end, then disposed; the director idle');
{ let worstVeil = 0, worstFinish = 0, n = 0;
  for (let t = K.guard; t < L - 0.02; t += 0.173) {
    const s = skipAt(t); n++;
    const want = DIR.skipModeAt(I, s.t0);
    const tag = `skip at ${s.t0.toFixed(2)} s (${DIR.beatAt(I, s.t0).id})`;
    if (!(s.ok0 && s.done.length === 1 && s.done[0].skipped === true && s.done[0].replay === false && s.done[0].error === false && s.done[0].mode === want && s.mode === want)) { ok(false, `${tag}: one intro:done {skipped: true, mode: ${want}}`); continue; }
    if (JSON.stringify(endOf(s.g)) !== JSON.stringify(fullPlay)) { ok(false, `${tag}: lands in the full play's end state (${JSON.stringify(endOf(s.g))})`); continue; }
    if (s.after.some(([e, p]) => e === 'intro:line' && p.i !== null)) { ok(false, `${tag}: no line appears after the skip`); continue; }
    if (s.lineBefore !== null && !(s.after[0][0] === 'intro:line' && s.after[0][1].i === null && s.after[1][0] === 'intro:skip')) { ok(false, `${tag}: the words clear at once, before intro:skip`); continue; }
    if (want === 'veil') {
      worstVeil = Math.max(worstVeil, s.took);
      const full = s.veil.findIndex((k) => k >= 1);
      if (!(full >= 0 && full < s.veil.length - 1)) { ok(false, `${tag}: one frame of full ink is on screen before the jump`); continue; }
      if (!s.veil.slice(0, -1).every((k, i, a) => i === 0 || k >= a[i - 1])) { ok(false, `${tag}: the ink only closes`); continue; }
      const lastSet = s.g.stage.calls.filter((c) => c[0] === 'setTime').at(-1);
      if (!(lastSet[1] === L && lastSet[2].seek === true)) { ok(false, `${tag}: the jump shows the settled end state`); continue; }
    } else {
      worstFinish = Math.max(worstFinish, s.took);
      const sets = s.g.times();
      if (!sets.every((x, i) => i === 0 || x >= sets[i - 1] - 1e-9)) { ok(false, `${tag}: the fast finish plays forward to the end`); continue; }
    }
    pass++;
  }
  ok(n > 90, `a skip was tried at ${n} moments across every beat`);
  ok(worstVeil <= K.veilIn + 1 / 60 + 1e-6, `veil skip: intro:skip → intro:done within veilIn (${K.veilIn} s) at 60 fps (worst ${worstVeil.toFixed(3)} s)`);
  ok(worstVeil + K.veilOut <= 0.6 + 1 / 60 + 1e-6, `veil skip: with the opening ink (${K.veilOut} s) the whole skip fits 0.6 s (${(worstVeil + K.veilOut).toFixed(3)} s)`);
  ok(worstFinish <= K.finish + 1 / 60 + 1e-6 && worstFinish <= 0.6, `fast finish: the rest plays out within ${K.finish} s (worst ${worstFinish.toFixed(3)} s)`); }
for (const fps of [30, 10, 5, 3]) {
  // a slow machine: the skip's timers run on real time, so it still ends within a few frames
  const v = skipAt(6, { fps }), f = skipAt(13, { fps });
  ok(v.done.length === 1 && v.took <= Math.max(0.6, K.veilIn + 2 / fps + 1e-6), `${fps} fps: a veil skip ends within ${Math.max(0.6, K.veilIn + 2 / fps).toFixed(2)} s (${v.took.toFixed(2)} s)`);
  ok(f.done.length === 1 && f.took <= Math.max(0.6, K.finish + 1 / fps + 1e-6), `${fps} fps: a fast finish ends within ${Math.max(0.6, K.finish + 1 / fps).toFixed(2)} s (${f.took.toFixed(2)} s)`);
  eq([endOf(v.g), endOf(f.g)], [fullPlay, fullPlay], `${fps} fps: both land in the full play's end state`);
}
{ const s = skipAt(0.5); ok(s.done.length === 1 && s.g.dir.state.entered === false && s.g.stage.calls.some((c) => c[0] === 'enter'), 'a skip at the guard\'s edge still goes live before it ends (main\'s hook has run)'); }
{ // a skip under reduced motion is the same skip
  const s = skipAt(10, { reduced: true }); ok(s.done.length === 1 && s.done[0].skipped && JSON.stringify(endOf(s.g)) === JSON.stringify(fullPlay), 'reduced motion: a skip lands in the same end state'); }

// ================================================================== seek / resume / stop
section('seek, resume, stop');
{ const g = game(); g.dir.seek(3.3); const a = g.times().at(-1); g.run(2); ok(a === 3.3 && g.dir.state.t === 3.3 && g.dir.state.hold, 'a sought film holds its moment');
  g.dir.resume(); g.run(1); near(g.dir.state.t, 4.3, 1e-6, 'resume() lets it run on');
  g.dir.seek(99); eq(g.dir.state.t, L, 'seek clamps to the film'); g.dir.seek(-3); eq(g.dir.state.t, 0, '… at both ends');
  g.dir.stop(); ok(!g.dir.isActive() && g.done().length === 0 && g.stage.calls.at(-1)[0] === 'dispose', 'stop(): idle, the stage disposed, no event');
  g.dir.stop(); eq(g.stage.disposed, 1, 'stop() twice disposes once'); }
{ const g = game(); g.dir.start({}); g.run(1); g.dir.stop(); ok(g.dir.start({}) === true, 'a stopped film can be started again'); eq(g.dir.state.t, 0, '… from its first frame'); g.out(); eq(g.done().length, 1, '… and ends once'); }

// ================================================================== reduced motion (A8)
section('reduced motion (A8)');
{ const g = game({ stage: recStage({ ready: true }) }); const seq = [];
  const set = g.stage.setTime; g.stage.setTime = (t, o) => { seq.push(['set', t]); set(t, o); };
  g.ctx.bus.on('intro:beat', (p) => seq.push(['beat', p.id]));
  const lines = [];
  g.ctx.bus.on('intro:line', (p) => lines.push([p.i, +g.dir.state.t.toFixed(2)]));
  g.dir.start({ reduced: true }); g.out();
  const after = g.times().filter((t) => !(t < I.swapAt));
  eq([...new Set(after)], [...I.stills.map((s) => s.t), L], 'the stage is shown five stills, one per beat, then the end state, and nothing else after the swap');
  eq(after.filter((t) => t === L).length, 1, '… the end state on the last frame only');
  ok(g.stage.calls.filter((c) => c[0] === 'setTime').every((c) => c[2].reduced === true), 'the stage is told it is showing stills');
  near(g.real, L, 1 / 60 + 1e-6, 'the same length');
  const plain = game({ stage: recStage({ ready: true }) }); const plines = [];
  plain.ctx.bus.on('intro:line', (p) => plines.push([p.i, +plain.dir.state.t.toFixed(2)])); plain.dir.start({}); plain.out();
  eq(lines, plines, 'the same four lines at the same times');
  // every change of beat is announced BEFORE the stage shows the new still (the view copies the outgoing picture on it)
  let okOrder = true;
  for (const b of I.beats.slice(1)) { const i = seq.findIndex((x) => x[0] === 'beat' && x[1] === b.id); const still = I.stills.find((s) => s.beat === b.id).t; const firstNew = seq.findIndex((x) => x[0] === 'set' && x[1] === still); if (!(i >= 0 && firstNew > i)) okOrder = false; }
  ok(okOrder, 'intro:beat comes before the stage moves to the new beat');
  eq(g.ev[0][1].reduced, true, 'intro:start {reduced: true}'); }
{ // where reduced motion comes from
  const mm = globalThis.matchMedia;
  globalThis.matchMedia = () => ({ matches: true }); let g = game(); g.dir.start({}); eq(g.dir.state.reduced, true, 'prefers-reduced-motion turns it on'); g.dir.stop();
  g = game(); g.dir.start({ reduced: false }); eq(g.dir.state.reduced, false, 'start({reduced: false}) overrides the system'); g.dir.stop();
  globalThis.matchMedia = () => ({ matches: false }); g = game({ settings: { reducedMotion: true } }); g.dir.start({}); eq(g.dir.state.reduced, true, 'meta.settings.reducedMotion turns it on'); g.dir.stop();
  g = game({ settings: { reducedFlashing: true } }); g.dir.start({}); ok(g.dir.state.reduced === false && g.dir.state.calm === true, 'reducedFlashing alone: the film moves, the cut and the flash are softened (calm)');
  g.to(1); ok(g.stage.calls.filter((c) => c[0] === 'setTime').at(-1)[2].calm === true, '… and the stage is told'); g.dir.stop();
  globalThis.matchMedia = () => { throw new Error('no'); }; g = game(); g.dir.start({}); eq(g.dir.state.reduced, false, 'a matchMedia that throws is read as off'); g.dir.stop();
  if (mm === undefined) delete globalThis.matchMedia; else globalThis.matchMedia = mm; }

// ================================================================== errors (A10)
section('errors end the film cleanly (A10)');
for (const [what, st] of [['enter() throws', recStage({ throwOn: 'enter' })], ['enter() throws when prebuilt (at the press)', recStage({ ready: true, throwOn: 'enter' })],
  ['setTime throws in lit', recStage({ ready: true, throwAt: 1 })], ['setTime throws in below', recStage({ ready: true, throwAt: 9 })], ['setTime throws at the end', recStage({ ready: true, throwAt: L - 0.01 })],
  ['dispose() throws', recStage({ ready: true, throwOn: 'dispose' })]]) {
  const g = game({ stage: st });
  quietly(() => { g.dir.start({}); g.out(); });
  const d = g.done();
  ok(d.length === 1 && !g.dir.isActive() && g.ctx.errors.length >= 1, `${what}: one intro:done, the director idle, the error reported`);
  if (what !== 'dispose() throws') ok(d[0].error === true, `${what}: intro:done {error: true}`);
  ok(st.calls.some((c) => c[0] === 'dispose'), `${what}: the stage was disposed`);
}
{ const g = game({ stage: recStage({ ready: true, throwAt: 3 }) }); quietly(() => { g.dir.start({}); g.to(2); g.dir.skip(); g.out(); }); const d = g.done(); ok(d.length === 1 && d[0].skipped === true && d[0].error === true, 'a skip whose jump throws still ends once'); }
{ const g = game(); const dir = DIR.create(g.ctx, { createStage: () => { throw new Error('no stage'); } }); quietly(() => { dir.start({}); for (let i = 0; i < 60 * 19 && dir.isActive(); i++) dir.update(1 / 60); }); ok(!dir.isActive() && g.done().length === 1 && g.done()[0].error === false, 'no stage at all: the film (words and sound) still plays and ends'); }
{ const g = game({ stage: recStage({ throwOn: 'prebuild' }) }); eq(quietly(() => g.dir.prewarm()), false, 'prewarm() never throws'); }
{ const g = game(); g.ctx.bus.on('intro:done', () => { throw new Error('listener'); }); quietly(() => { g.dir.start({}); g.out(); }); ok(!g.dir.isActive(), 'a listener that throws does not keep the film alive'); }
delete globalThis.document;

// ================================================================== the trigger and the save (A3)
section('the trigger rule and the save flag (A3)');
const P = (o) => DIR.introPending({ v3: true, intro: I, meta: { runs: 0 }, debug: false, optIn: false, savedRun: false, ...o });
eq([P({}), P({ meta: core.defaultMeta() })], [true, true], 'a fresh save: pending');
eq([P({ meta: { runs: 1 } }), P({ meta: { runs: 7, intro: undefined } }), P({ meta: { runs: 0, intro: { seen: true, skipped: true } } })], [false, false, false], 'a returning save (a run started, or the film seen): never');
eq([P({ meta: { runs: 0, intro: null } }), P({ meta: { runs: 0, intro: 'yes' } }), P({ meta: { runs: 0, intro: [] } }), P({ meta: { runs: 0, intro: { seen: 'true' } } }), P({ meta: { runs: 0, intro: { seen: false } } }), P({ meta: { runs: '0' } }), P({ meta: { runs: null } })],
  [true, true, true, true, true, true, true], 'a missing or garbage meta.intro reads as not seen (it plays; it never throws)');
eq([P({ meta: null }), P({ intro: null }), P({ v3: false }), P({ savedRun: true })], [false, false, false, false], 'no meta, no INTRO, flag off, a run waiting: no');
eq([P({ debug: true }), P({ debug: true, optIn: true }), P({ debug: false, optIn: false })], [false, true, true], 'a debug build plays it only after an opt-in; a release build needs none');
{ const m = { runs: 0 }; const r = DIR.markIntroSeen(m, false); eq(m.intro, { seen: true, skipped: false }, 'markIntroSeen: meta.intro = {seen: true, skipped: false}'); ok(r === m.intro && DIR.introSeen(m), '… and it reads as seen');
  eq(DIR.markIntroSeen({ intro: 'junk' }, true), { seen: true, skipped: true }, 'garbage is replaced'); eq(DIR.markIntroSeen({ intro: [1] }, 1), { seen: true, skipped: true }, 'an array is replaced');
  eq(DIR.markIntroSeen({ intro: { seen: false, note: 'kept' } }, false), { seen: false, note: 'kept', seen: true, skipped: false }, 'other keys of a record are kept');
  eq(DIR.markIntroSeen(null, true), null, 'no meta: nothing'); }
{ // the flag survives the save's own rules: the envelope, the defaults, the v3 migration
  eq('intro' in core.defaultMeta(), false, 'core.defaultMeta() never creates meta.intro (the flag-off save is untouched)');
  const meta = core.defaultMeta(); meta.runs = 1; DIR.markIntroSeen(meta, true);
  const stored = JSON.parse(JSON.stringify({ version: 1, savedAt: 1, meta, run: null }));
  eq(core.normalizeSave(stored).meta.intro, { seen: true, skipped: true }, 'normalizeSave keeps meta.intro');
  eq(PV3.migrateSave(D, JSON.parse(JSON.stringify(stored))).meta.intro, { seen: true, skipped: true }, 'progression\'s migrateSave keeps meta.intro');
  const old = core.normalizeSave(PV3.migrateSave(D, { version: 1, meta: { runs: 4, journal: {} }, run: null }));
  ok(old.meta.intro === undefined && P({ meta: old.meta }) === false, 'a save from before the film (runs > 0) is never shown it by itself');
  const fresh = core.normalizeSave(PV3.migrateSave(D, { version: 0, meta: {}, run: null }));
  ok(P({ meta: fresh.meta }) === true, 'a migrated fresh save is pending'); }
const RO = (o) => DIR.replayOffered({ v3: true, intro: I, meta: { runs: 0 }, pending: false, ...o });
eq([RO({ meta: { runs: 1 } }), RO({ meta: { runs: 0, intro: { seen: true } } }), RO({ meta: { runs: 3, intro: { seen: true, skipped: true } } })], [true, true, true], 'the replay word: on a save that has started or seen the film');
eq([RO({}), RO({ meta: { runs: 2 }, pending: true }), RO({ meta: { runs: 2 }, v3: false }), RO({ meta: null })], [false, false, false, false], 'no replay word on an untouched save (a debug build with no opt-in: today\'s title), while pending, or with the flag off');
ok(I.trigger.replay.writes === false && I.trigger.replay.word.length <= 12 && !/\s.*\s/.test(I.trigger.replay.word), 'the replay entry is one or two words and writes nothing');
{ // the director itself writes nothing, in a first play, a skip or a replay
  for (const o of [{}, { replay: true }]) { const meta = { runs: 0, journal: {} }, before = JSON.stringify(meta); const g = game({ meta }); g.dir.start(o); g.to(3); g.dir.skip(); g.out(); eq(JSON.stringify(g.ctx.state.meta), before, `the director leaves meta alone (${o.replay ? 'replay' : 'first play'})`); eq(g.done()[0].replay, !!o.replay, '… and says which it was'); } }
{ const dbg = game({ debug: true }); eq(dbg.dir.pending(), false, 'director.pending() in a debug build: false'); dbg.dir.setOptIn(true); eq(dbg.dir.pending(), true, '… true after setOptIn(true)'); dbg.dir.setOptIn(false); eq(dbg.dir.pending(), false, '… and off again');
  eq(game({ debug: true, savedRun: true }).dir.setOptIn(true) && game({ savedRun: true }).dir.pending(), false, 'a waiting run: not pending');
  ok(DIR.introOptIn({ GW_INTRO: true }) && DIR.introOptIn({ location: { search: '?intro=1' } }) && !DIR.introOptIn({ GW_INTRO: 1 }) && !DIR.introOptIn({ location: { search: '?nointro=1' } }) && !DIR.introOptIn({ location: null }), 'the opt-in: GW_INTRO === true or ?intro=1, nothing looser'); }

// ================================================================== the view's pure helpers
section('the view (pure helpers)');
eq(VIEW.wordsBand(I, 960, 540), { portrait: false, top: 0.86, bottom: 0.95 }, 'the words band in landscape');
eq(VIEW.wordsBand(I, 390, 844), { portrait: true, top: 0.90, bottom: 0.97 }, 'the words band on a phone held upright');
ok(VIEW.wordsBand(I, 0, 0).portrait === false, 'no viewport: landscape');
{ const lh = 1.24, band = (w, h) => { const b = VIEW.wordsBand(I, w, h); return (b.bottom - b.top) * h; };
  ok(band(390, 844) >= 2 * I.words.size.phone * lh, 'a phone\'s band holds two rows of 18 px'); ok(band(960, 540) >= I.words.size.desktop * lh, 'a 540 px landscape band holds a row of 19 px'); ok(I.words.minSize >= 16 && I.words.size.phone >= I.words.minSize, 'never under 16 px'); }
const st0 = (o) => ({ t: 0, skip: null, calm: false, reduced: false, ...o });
eq([VIEW.veilFor(I, st0({ t: 0 })), VIEW.veilFor(I, st0({ t: 0.45 })), VIEW.veilFor(I, st0({ t: 3 }))], [0, 1, 0], 'veilFor: the opening dip');
eq(VIEW.veilFor(I, st0({ t: 6, skip: { mode: 'veil', k: 0.6 } })), 0.6, 'veilFor: a skip\'s closing ink');
eq(VIEW.veilFor(I, st0({ t: 14, skip: { mode: 'finish', k: 0 } })), 0, 'veilFor: no ink in a fast finish');
eq([VIEW.veilFor(I, st0({ t: I.cut.at })), VIEW.veilFor(I, st0({ t: I.cut.at, calm: true }))], [0, 1], 'veilFor: the cut is hard, and an ink dip under reduced flashing');
eq([VIEW.veilFor(I, st0({ t: 5, reduced: true })), VIEW.veilFor(I, st0({ t: 5, reduced: true }), { snapshots: false })], [0, 1], 'veilFor: reduced motion dips to ink only when the picture cannot be copied');
eq(VIEW.veilFor(null, null), 0, 'veilFor: nothing to draw');

// ================================================================== the sound cue (A7)
section('the sound cue: its clock events');
const EV = DIR.soundEvents(I);
ok(EV.every((e, i) => i === 0 || e.t >= EV[i - 1].t), 'soundEvents are in time order');
eq(EV.filter((e) => e.kind === 'on').map((e) => e.id), I.sound.marks.filter((m) => !m.beat).map((m) => m.id), 'one "on" per mark, in the table\'s order');
eq(EV.filter((e) => e.kind === 'off').map((e) => [e.id, e.t]), [['glass', 5.9], ['fallBend', 7.9], ['drone', 8.2], ['deep', 12.4]], 'a sustained section ends when the clock reaches its `to`');
{ const harp = EV.filter((e) => e.kind === 'note'); eq(harp.map((e) => e.midi), [62, 65, 69, 67], 'the harp: D4 F4 A4 G4'); near(harp[1].t - harp[0].t, 60 / 58, 0.002, '… at 58 BPM'); ok(harp.at(-1).t < L && harp[0].t === 14.6, '… from 14.6 s, all inside the film'); }
{ const i = EV.findIndex((e) => e.id === 'glass' && e.kind === 'off'), j = EV.findIndex((e) => e.id === 'fallBend' && e.kind === 'on'); ok(i < j && EV[i].t === EV[j].t, 'at 5.9 s the chord lets go before the fall bends its top voice'); }
eq(DIR.soundEventsBetween(EV, -1, 0).map((e) => e.id), ['drone'], 'the first frame plays the drone');
eq(DIR.soundEventsBetween(EV, 0, 1.0).map((e) => e.id), ['bell'], 'the bell at 1.0 s (a mark belongs to the frame that reaches it)');
eq(DIR.soundEventsBetween(EV, 1.0, 1.0), [], 'no event twice');
{ let n = 0, t = -1; for (let x = 0; x <= L + 1e-9; x += 1 / 30) { n += DIR.soundEventsBetween(EV, t, x).length; t = x; } eq(n, EV.length, 'stepping the clock plays every event exactly once'); }
ok(I.sound.marks.filter((m) => m.sfx).every((m) => AUDIO && typeof m.sfx === 'string'), 'SFX marks name a sound');

section('the sound cue on the audio graph (A7)');
/** audio.js on the fake WebAudio, with a film whose clock the test moves. */
function cueHarness({ flow = 'title', settings = null } = {}) {
  const H = makeAudioHarness({ create: AUDIO.create, data: D, flow, run: null });
  if (settings) Object.assign(H.ctx.state.meta.settings, settings);
  const film = { on: false, t: 0, hold: false };
  H.ctx.intro = { isActive: () => film.on, get state() { return { t: film.t, hold: film.hold }; } };
  H.film = film;
  H.cue = () => H.ctx.debug.audioIntro();
  H.marks = () => H.log().filter((e) => e.name === 'intro_cue').map((e) => e.why);
  /** The film from its clock's t0 to t1 in frames of dt, audio and film in step. */
  H.play = (t1, dt = 1 / 30) => { while (film.t < t1 - 1e-9) { film.t = Math.min(t1, film.t + dt); H.step(dt, dt); } };
  H.begin = () => { film.on = true; film.t = 0; film.hold = false; H.ctx.flow = 'intro'; H.bus.emit('flow:change', { flow: 'intro', prev: 'title' }); H.bus.emit('intro:start', { replay: false, reduced: false }); };
  H.sfxNames = () => H.log().map((e) => e.name).filter((n) => n !== 'intro_cue');
  return H;
}
{ const H = cueHarness(); H.step(1.5);
  eq(H.audio.getMood(), 'title', 'before the film the title music plays');
  const t0 = H.ac.currentTime, tr0 = H.ac.trace.length;
  H.begin();
  eq(H.marks(), ['start', 'drone'], 'intro:start: the cue begins and the drone with it');
  // the title's harp is out within titleFade: every layer's outputs ramp to 0 by t0 + 0.3
  const ramps = H.ac.trace.slice(tr0).filter((s) => /\.gain\.lin\(0,/.test(s)).map((s) => Number(s.match(/lin\(0,([\d.]+)\)/)[1]));
  ok(ramps.length >= 3 && ramps.every((t) => t <= t0 + I.sound.titleFade + 1e-6), `the title music's gain goes to 0 within ${I.sound.titleFade} s`, ramps);
  eq(H.cue().layers, 0, 'no music layer is left running');
  let maxVoices = 0, moods = new Set();
  const seen = [];
  for (let t = 0; t < L - 1e-9;) { t = Math.min(L, t + 1 / 30); H.film.t = t; H.step(1 / 30, 1 / 30); maxVoices = Math.max(maxVoices, H.cue().voices); moods.add(H.audio.getMood()); if (H.cue().water && !seen.length) seen.push(t); }
  eq(H.marks(), ['start', 'drone', 'bell', 'glass', 'ping', 'glass:off', 'fallBend', 'fallBend:off', 'impact', 'drone:off', 'deep', 'ember', 'groan', 'deep:off', 'spark', 'flame', 'harp:note0', 'harp:note1', 'harp:note2', 'harp:note3'], 'every mark, once, in order');
  eq(H.sfxNames().filter((n) => n === 'ember_swell' || n === 'flame_catch'), ['ember_swell', 'flame_catch'], 'ember_swell and flame_catch are the game\'s own SFX, at their marks');
  eq([...moods], [null], 'the title music stays out for the whole film (no mood is picked under the cue)');
  ok(maxVoices >= 4 && maxVoices <= I.sound.voices, `at most ${I.sound.voices} voices at once (peak ${maxVoices})`);
  near(seen[0], 12.5, 1 / 30 + 1e-6, 'the lake\'s water returns with the spark');
  ok(Math.abs(H.cue().lowpass - 6000) < 1, 'the lowpass that closed at the contact is open again (6 kHz) for the harp');
  near(H.cue().level, CUE.CUE_GAIN, 1e-9, 'an unskipped cue keeps its level to the end');
  // the end: the game's own score takes over, the last note rings, then the cue's nodes are released
  H.film.on = false; H.ctx.flow = 'playing'; H.ctx.state.run = { zone: 'mossmere', phase: 'calm', day: 1, hp: 5 };
  H.bus.emit('intro:done', { skipped: false, replay: false, error: false }); H.bus.emit('flow:change', { flow: 'playing', prev: 'intro' }); H.bus.emit('run:start', { continued: false });
  H.step(0.6);
  eq(H.audio.getMood(), I.sound.into, 'after the hand-off the lake\'s calm bed comes in');
  ok(H.cue().active && H.cue().releasing && !H.cue().hold, 'the cue rings on under it');
  ok(!H.log().some((e) => e.name === 'descend' || e.name === 'setout'), 'no sting at the hand-off');
  H.step(I.sound.endRing + 0.5);
  ok(!H.cue().active && H.cue().voices === 0, 'then its nodes are released');
  eq(H.ctx.errors, [], 'no errors'); H.done(); }
{ // the cue is wired into the music gain: its level node feeds two nodes (the music gain, its own reverb send)
  const H = cueHarness(); H.step(0.5); const n0 = H.ac.trace.length; H.begin();
  const tr = H.ac.trace.slice(n0), made = tr.filter((s) => / new g\d+$/.test(s) || /\|new g\d+$/.test(s));
  ok(made.length >= 5, 'the cue builds a bus of its own');
  H.film.on = false; H.bus.emit('intro:done', { skipped: false }); H.step(5); H.done(); }
for (const at of [0.6, 3, 7.95, 10, 13.2, 16.2]) {
  // a skip: the bus ramps to 0 in skipFade from wherever it is, nothing later plays, the nodes go
  const H = cueHarness(); H.step(0.5); H.begin(); H.play(at);
  const before = H.marks().length, now = H.ac.currentTime, n0 = H.ac.trace.length, lvl = H.cue().level;
  H.bus.emit('intro:skip', { t: at, mode: DIR.skipModeAt(I, at) });
  const tr = H.ac.trace.slice(n0);
  const ramp = tr.map((s) => s.match(/^[\d.]+\|(g\d+)\.gain\.lin\(0,([\d.]+)\)$/)).filter(Boolean);
  ok(ramp.length >= 1 && ramp.every((m) => Number(m[2]) <= now + 0.3 + 0.006) && ramp.some((m) => Number(m[2]) >= now + I.sound.skipFade - 1e-6), `skip at ${at} s: the bus ramps to 0 in ${I.sound.skipFade} s (never a stop)`, ramp.map((m) => m[2]));
  ok(tr.some((s) => new RegExp(`\\.gain\\.set\\(${String(Math.round(lvl * 1e4) / 1e4).replace('.', '\\.')},`).test(s)), `skip at ${at} s: the ramp starts from the level it had`);
  const stops = tr.map((s) => s.match(/\.stop\(([\d.]+)\)$/)).filter(Boolean).map((m) => Number(m[1]));
  ok((stops.length >= 1 || at > 13) && stops.every((t) => t >= now + I.sound.skipFade - 1e-6), `skip at ${at} s: sources stop only after the ramp has ended`, { now, stops: stops.filter((t) => t < now + I.sound.skipFade) });
  eq(H.marks().at(-1), 'fade', `skip at ${at} s: logged`);
  H.play(Math.min(L, at + 2)); eq(H.marks().length, before + 1, `skip at ${at} s: nothing of the film plays after it`);
  H.film.on = false; H.ctx.flow = 'playing'; H.ctx.state.run = { zone: 'mossmere', phase: 'calm', day: 1, hp: 5 }; H.bus.emit('intro:done', { skipped: true }); H.step(0.6);
  ok(!H.cue().active && H.cue().voices === 0 && !H.cue().hold, `skip at ${at} s: the cue's nodes are released within the second`);
  eq(H.audio.getMood(), 'calm', `skip at ${at} s: the game's score takes over`);
  H.done();
}
{ // locked audio: silent, nothing is built, nothing queues up
  const restoreRandom = Math.random, restore = installGlobals(); FakeAudioContext.last = null;
  const bus = fakeBus();
  const ctx = { bus, data: D, flow: 'title', paused: false, isMobile: false, debug: {}, errors: [], state: { meta: { settings: { master: 0.8, music: 0.6, sfx: 0.9 } }, run: null }, time: { dt: 0.05, gameDt: 0, t: 0, gameT: 0, timeScale: 1, frame: 0 }, input: {}, player: { position: { x: 0, z: 0 }, speed: 0 }, render: { getYaw: () => 0 }, progression: { getStats: () => ({}) }, ui: { isBlocking: () => false }, fishing: { state: 'idle', view: {} }, survival: { getPhaseInfo: () => ({ phase: 'calm', day: 1, k: 0 }) }, combat: { enemies: [] } };
  const audio = AUDIO.create(ctx); audio.init();
  ctx.intro = { isActive: () => true, state: { t: 0, hold: false } };
  bus.emit('intro:start', { replay: false }); for (let i = 0; i < 40; i++) { ctx.intro.state.t += 0.1; audio.update(0.1); }
  ok(FakeAudioContext.last === null && ctx.debug.audioLog().length === 0 && ctx.debug.audioIntro().active === false, 'audio locked (no gesture yet): no context, nothing scheduled, nothing logged');
  audio.unlock(); for (let i = 0; i < 20; i++) { ctx.intro.state.t += 0.1; FakeAudioContext.last.advance(0.1); audio.update(0.1); }
  ok(ctx.debug.audioLog().filter((e) => e.name === 'intro_cue').length === 0, '… and unlocking mid-film does not replay what was missed');
  Math.random = restoreRandom; restore(); }
{ // a context that is not running: nothing is scheduled past the film's first half second
  const H = cueHarness(); H.step(0.5); H.begin(); H.ac.state = 'suspended';
  H.film.t = 0.3; H.ctx.audio.update(0.05);
  for (let t = 0.3; t < 6;) { t += 0.1; H.film.t = t; /* (update returns early on a suspended context) */ H.ctx.audio.update(0.1); }
  eq(H.marks(), ['start', 'drone'], 'a suspended context: nothing plays, nothing queues');
  H.ac.state = 'running'; H.film.t = 6.1; H.step(0.1, 0.1);
  eq(H.marks(), ['start', 'drone'], 'when it runs again the missed marks are not played late (a jump plays nothing)');
  H.play(8); ok(H.marks().includes('impact') && !H.marks().includes('bell'), '… and the film\'s later marks play in their place');
  H.film.on = false; H.bus.emit('intro:done', {}); H.step(5); H.done(); }
{ // a sought (held) film plays nothing; a film stopped with no event fades like a skip
  const H = cueHarness(); H.step(0.5); H.begin(); H.film.hold = true;
  for (const t of [3, 9, 15, 2]) { H.film.t = t; H.step(0.1, 0.1); }
  eq(H.marks(), ['start', 'drone'], 'a held film: seeks play nothing');
  H.film.hold = false; H.play(3); ok(H.marks().includes('glass') === false, 'resuming from 2 s plays only what the clock then crosses');
  const n0 = H.ac.trace.length, now = H.ac.currentTime; H.film.on = false; H.ctx.flow = 'title'; H.step(0.05, 0.05);
  ok(H.ac.trace.slice(n0).some((s) => /\.gain\.lin\(0,/.test(s)) && H.marks().at(-1) === 'fade', 'a film stopped with no event: the cue fades');
  H.step(0.6); ok(!H.cue().active && !H.cue().hold, '… its nodes are released'); H.step(0.6); eq(H.audio.getMood(), 'title', '… and the title music returns'); ok(now > 0, 'clock'); H.done(); }
{ // a replay ends at the title
  const H = cueHarness(); H.step(0.5); H.begin(); H.play(L); H.film.on = false; H.ctx.flow = 'title'; H.bus.emit('intro:done', { skipped: false, replay: true }); H.bus.emit('flow:change', { flow: 'title', prev: 'intro' }); H.step(0.6);
  eq(H.audio.getMood(), 'title', 'a replay hands back to the title mood'); H.step(4); H.done(); }
{ // a second film right after the first starts clean
  const H = cueHarness(); H.step(0.5); H.begin(); H.play(2); H.bus.emit('intro:skip', { t: 2 }); H.film.on = false; H.bus.emit('intro:done', { skipped: true, replay: true });
  H.begin(); eq(H.marks().filter((w) => w === 'start').length, 2, 'a replay straight after a skip starts a new cue'); ok(H.cue().active && H.cue().level === CUE.CUE_GAIN && H.cue().t <= 0, '… at full level from the first mark');
  H.film.on = false; H.bus.emit('intro:done', {}); H.step(5); H.done(); }
{ // the cue alone: levels, the lowpass, the fade's own schedule
  const restore = installGlobals(); const ac = new FakeAudioContext();
  const { createEngine } = await import('../../src/audio-dsp.js');
  const eng = createEngine(ac, {}); const dry = ac.createGain(), wetN = ac.createGain();
  const cue = CUE.createIntroCue(eng, { dry, wet: wetN }, I.sound, {});
  ok(cue.play({ id: 'nonsense', kind: 'on' }) === false && cue.fired.length === 0, 'an unknown mark is not played');
  for (const e of EV) if (!e.mark.sfx) cue.play(e, e.t);
  eq(cue.fired.length, EV.filter((e) => !e.mark.sfx).length, 'every event of the table has a recipe');
  ok(20 * Math.log10(CUE.CUE_GAIN) < 6, 'the make-up gain is modest (the offline render holds the peak: tools/audio-render.mjs --set=intro)');
  const end = cue.fade(0.25, 20); near(end, 20.005 + 0.25 + 0.04, 1e-6, 'fade() says when the sources have stopped');
  cue.release(); cue.release(); ok(cue.dead && cue.voices() === 0 && cue.play(EV[0]) === false, 'release() frees everything, once; a dead cue plays nothing');
  restore(); }

console.log(`intro: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
