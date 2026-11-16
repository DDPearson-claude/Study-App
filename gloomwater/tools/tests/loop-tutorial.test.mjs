// Unit tests for the tutorial at home's beat machine (src/loop-tutorial.js; docs/loop/OPENING.md §6, slice-1a/PLAN.md §2.3 item 8,
// §5.5, T65): the beats in order, the wake's line and its self-opening Chart (once, and never after an Escape), the clock that waits
// under another screen, one Murk line at a time from TEXT_LOOP.murk (Tallow's own count), Sail never pressed for the player, the
// reference and tap-through timings inside LOOP.tutorial.budget, and cue() naming only a tile or a button.
//   node tools/tests/loop-tutorial.test.mjs   (or node tools/check.mjs)
import { createBus } from '../../src/core.js';
import { loadLoopData, fakeLoop } from './loop-fixture.mjs';

const D = await loadLoopData();
const { createLoopTutorial, murkLineFor, TUTORIAL_TOPS } = await import('../../src/loop-tutorial.js');
const { murkHold } = await import('../../src/first-evening.js');

let pass = 0, fail = 0;
function ok(cond, msg, extra) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra) : ''); } }
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;
const section = (s) => console.log(`- ${s}`);
const M = D.TEXT_LOOP.murk, TT = D.LOOP.tutorial;
const WAKE_HOLD = murkHold(M.wake, D.FIRST_EVENING?.lines || {});

/** A machine on a fake loop with a fresh tutorial record (B's enterHome has begun it), plus its event log. */
function rig(state = {}) {
  const bus = createBus();
  const ev = [];
  for (const k of ['loop:tutorial', 'firstEvening:line', 'firstEvening:step']) bus.on(k, (p) => ev.push({ k, ...p }));
  const loop = fakeLoop({ D, tutorial: { done: false, step: 'arrive' }, ...state });
  const tut = createLoopTutorial({ bus, loop, data: D });
  return { bus, ev, loop, tut };
}
/** Run the clock in 50 ms steps under `top` for `secs`, honouring the machine's own Chart request like the view does. */
function run(R, secs, top = 'jetty', { honour = true } = {}) {
  let opened = -1;
  for (let t = 0; t < secs - 1e-9; t += 0.05) {
    R.tut.update(0.05, { top });
    if (honour && R.tut.wantsChart) { opened = t + 0.05; R.tut.onTile('chart'); top = 'chart'; }
  }
  return opened;
}

section('murkLineFor: the Wick\'s own count, once-lines, unknown ids');
{
  ok(murkLineFor('firstChart', 'wick', { D }) === M.firstChart, 'the Wick: "Three slots …"');
  ok(murkLineFor('firstChart', 'tallow', { D }) === M.firstChartBy.tallow && /^Four slots/.test(murkLineFor('firstChart', 'tallow', { D })), 'Tallow: "Four slots …"');
  for (const w of ['taper', 'stub', 'ashwick', null, 'nobody']) ok(murkLineFor('firstChart', w, { D }) === M.firstChart, `${w}: the built line`);
  ok(murkLineFor('firstSale', 'wick', { D }) === M.firstSale, 'a once-line not yet said is due');
  ok(murkLineFor('firstSale', 'wick', { D, said: { firstSale: true } }) === '', 'a once-line already said is empty');
  ok(murkLineFor('sailOut', 'wick', { D }) === '' && murkLineFor('nope', 'wick', { D }) === '' && murkLineFor(null) === '', 'sailOut (rotating) and unknown ids are empty');
  ok(M.firstChartBy.tallow.length <= M.firstChart.length, 'Tallow\'s line is no longer than the built one (no budget grows)');
}

section('T65: the beats in order, the wake line and the self-opening Chart');
{
  const R = rig();
  ok(R.tut.start({ from: 'intro' }) === true && R.tut.isActive() && R.tut.step === 'wake', 'start → the wake');
  const lines = R.ev.filter((e) => e.k === 'firstEvening:line');
  ok(lines.length === 1 && lines[0].key === 'wake' && lines[0].text === M.wake && lines[0].kind === 'murk' && lines[0].loop === true && near(lines[0].hold, WAKE_HOLD), 'the wake line once, for the grumble', lines);
  ok(near(WAKE_HOLD, 5.95, 0.01), 'the wake line holds 5.95 s', WAKE_HOLD);
  const c = R.tut.cue();
  ok(c.tile === 'chart' && c.dim === true && c.sail === false && c.line === M.wake, 'cue: the Chart tile breathes, the others dim, the line', c);
  ok(R.ev.some((e) => e.k === 'loop:tutorial' && e.step === 'wake'), 'loop:tutorial {step: wake}');
  ok(R.loop.s.tutorial.step === 'wake', 'setTutorialStep(wake) is the readout');
  const at = run(R, 20);
  ok(near(at, WAKE_HOLD + TT.chartWait, 0.06), `the Chart opens itself ${TT.chartWait} s after the line`, at);
  ok(R.tut.step === 'chart' && R.tut.cue().sail === true && R.tut.cue().tile === null && R.tut.cue().line === M.firstChart, 'the chart beat: Sail breathes, the departure line', R.tut.cue());
  ok(R.ev.filter((e) => e.k === 'firstEvening:line').map((e) => e.key).join(',') === 'wake,firstChart', 'one Murk line at a time: wake, then firstChart');
  ok(!R.ev.some((e) => e.k === 'firstEvening:step'), 'never firstEvening:step');
  // Sail is never pressed for the player, however long they wait
  run(R, 120, 'chart');
  ok(R.tut.step === 'chart' && R.tut.isActive(), 'the machine waits on the Chart for the player (no Sail of its own)');
  ok(!R.loop.calls.some((x) => x.name === 'tutorialDone' || x.name === 'sayOnce'), 'it never calls tutorialDone or sayOnce');
  ok(R.tut.onSail() === true && R.tut.step === 'out' && !R.tut.isActive(), 'Sail → out; the machine ends');
  ok(R.tut.cue().tile === null && R.tut.cue().sail === false && R.tut.cue().line === null, 'after Sail no cue at all');
  ok(R.ev.filter((e) => e.k === 'loop:tutorial').map((e) => e.step).join(',') === 'wake,chart,out', 'the beats in order: wake → chart → out');
}

section('T65: taps, the Chart tile, and a tap elsewhere');
{
  const R = rig();
  R.tut.start({ from: 'new' });
  run(R, 1.0);
  ok(R.tut.tap() === true && R.tut.cue().line === null && R.tut.step === 'wake', 'a tap elsewhere only ends the line (still the wake, the tile still cued)', R.tut.cue());
  ok(R.tut.tap() === false, 'a second tap does nothing');
  const at = run(R, 10);
  ok(near(at, TT.chartWait, 0.06), 'the Chart then opens chartWait after the tap', at);
  const R2 = rig();
  R2.tut.start({ from: 'new' });
  ok(R2.tut.onTile('murk') === false && R2.tut.step === 'wake', 'the Murk tile is live but not a beat');
  ok(R2.tut.onTile('chart') === true && R2.tut.step === 'chart', 'a Chart tap opens the chart beat at any moment');
}

section('T65: the clock waits while another screen is on top');
{
  const R = rig();
  R.tut.start({ from: 'title' });
  for (const top of ['homepause', 'settings', 'shelf', 'journal', null, 'tally']) {
    const before = R.tut.state.t;
    run(R, 30, top, { honour: false });
    ok(R.tut.state.t === before && R.tut.step === 'wake' && !R.tut.wantsChart && R.tut.cue().line === M.wake, `under ${top} nothing moves`);
  }
  ok(TUTORIAL_TOPS.join(',') === 'jetty,chart', 'the clock runs only under the Jetty or the Chart');
}

section('T65 (rev. 4): after an Escape from the Chart it never opens itself again');
{
  const R = rig();
  R.tut.start({ from: 'intro' });
  run(R, 20);
  ok(R.tut.step === 'chart', 'the Chart opened itself');
  ok(R.tut.onEscapeChart() === true && R.tut.step === 'wake' && R.tut.cue().tile === 'chart' && R.tut.cue().line === null, 'Escape → the Jetty, the Chart cue, no line', R.tut.cue());
  const opened = run(R, 300);
  ok(opened < 0 && R.tut.step === 'wake' && R.tut.cue().tile === 'chart', 'five minutes later the Chart has not opened itself (only the tile\'s cue)');
  ok(R.tut.onTile('chart') === true && R.tut.cue().line === M.firstChart, 'the tile opens it again, with the departure line again');
  ok(R.ev.filter((e) => e.k === 'firstEvening:line' && e.key === 'firstChart').length === 2, 'the departure line on every Chart open before the first Sail');
  // an Escape before the self-open also stops it for good
  const R2 = rig();
  R2.tut.start({ from: 'intro' });
  R2.tut.onTile('chart');
  R2.tut.onEscapeChart();
  ok(run(R2, 300) < 0, 'an Escape from a tapped Chart: no self-open later either');
  // the self-open fires at most once per start
  const R3 = rig();
  R3.tut.start({ from: 'intro' });
  run(R3, 20);
  R3.tut.onTile('jetty');
  ok(R3.tut.state.autoOpened === true, 'autoOpened is set once it fires');
}

section('T65: Tallow\'s departure line and a reload (resume at the wake)');
{
  const R = rig({ wick: 'tallow' });
  R.tut.start({ from: 'intro' });
  R.tut.onTile('chart');
  ok(R.tut.cue().line === M.firstChartBy.tallow, 'Tallow: "Four slots in that hold. Fill them and come home."');
  // a reload in the chart beat: a fresh machine on the same record starts at the wake again
  ok(R.loop.s.tutorial.step === 'chart', 'the record read "chart"');
  const tut2 = createLoopTutorial({ bus: R.bus, loop: R.loop, data: D });
  ok(tut2.start({ from: 'title' }) === true && tut2.step === 'wake' && tut2.cue().line === M.wake, 'a resume always starts at the wake, with the line again');
  tut2.onTile('chart');
  ok(tut2.cue().line === M.firstChartBy.tallow, 'and the Chart shows the departure line again');
  // a done record: never again
  const D2 = rig({ tutorial: { done: true, step: null } });
  ok(D2.tut.start({ from: 'title' }) === false && !D2.tut.isActive() && D2.tut.cue().tile === null && D2.tut.cue().line === null, 'a done save never sees the tutorial');
  ok(D2.tut.onTile('chart') === false && D2.tut.tap() === false, 'and its taps do nothing');
  // no loop at all (a build without lane A's object): inert, never a throw
  const tut3 = createLoopTutorial({ bus: createBus(), loop: null, data: D });
  ok(tut3.start({}) === false && tut3.cue().tile === null, 'no loop: inert');
}

section('T65: the reference run and the tap-through inside the budget');
{
  // the reference: no taps, the Chart opens itself, Sail 2.5 s after it opens; the glides are main's (arrive + out)
  const R = rig();
  R.tut.start({ from: 'intro' });
  let t = 0;
  while (R.tut.step === 'wake' && t < 60) { R.tut.update(0.05, { top: 'jetty' }); t += 0.05; if (R.tut.wantsChart) R.tut.onTile('chart'); }
  t += 2.5;
  R.tut.onSail();
  const ref = TT.arrive + t + TT.out;
  ok(ref <= TT.budget.reference && ref <= TT.budget.max, `the reference run ${ref.toFixed(2)} s ≤ ${TT.budget.reference} s`, ref);
  ok(near(ref, TT.arrive + WAKE_HOLD + TT.chartWait + 2.5 + TT.out, 0.06), 'it is arrive + the wake line + chartWait + 2.5 + out (≈ 17.5 s)', ref);
  // the tap-through: the Chart tile at once, then Sail at once; the glides played out
  const R2 = rig();
  R2.tut.start({ from: 'intro' });
  R2.tut.onTile('chart');
  R2.tut.onSail();
  const tap = TT.arrive + 0.5 + 0.5 + TT.out;
  ok(tap <= TT.budget.tapThrough && tap <= TT.budget.max, `the tap-through ${tap} s ≤ ${TT.budget.tapThrough} s`, tap);
}

section('T65: cue() only ever names a tile or a button');
{
  const R = rig();
  const seen = new Set();
  const look = () => { const c = R.tut.cue(); seen.add(JSON.stringify([c.tile, c.sail])); ok([null, 'chart'].includes(c.tile) && typeof c.sail === 'boolean' && typeof c.dim === 'boolean' && (c.line === null || Object.values(M).flat().includes(c.line) || c.line === M.firstChartBy.tallow), 'cue shape', c); };
  look();
  R.tut.start({});
  for (let i = 0; i < 400; i++) { R.tut.update(0.05, { top: R.tut.step === 'chart' ? 'chart' : 'jetty' }); if (R.tut.wantsChart) R.tut.onTile('chart'); if (i % 20 === 0) look(); }
  R.tut.onEscapeChart(); look(); R.tut.onTile('chart'); look(); R.tut.onSail(); look();
  ok(seen.size >= 3, 'the cues seen: the tile, Sail, none', [...seen]);
}

console.log(`\nloop-tutorial: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
