// loop-tutorial.js — the Full Hold's tutorial at home, as a pure beat machine (docs/loop/OPENING.md §6, slice-1a/PLAN.md §2.3
// item 8, §5.5; lane C). No THREE, no DOM, no fishing: ui-loop.js drives it from the Jetty and the Chart and draws its cue().
//
//   createLoopTutorial({bus, loop, data, now}) → {start({from}), update(dt, {top}), tap(), onTile(id), onEscapeChart(), onSail(),
//                                                 step, isActive(), cue(), wantsChart, state}
// The beats are arrive → wake → chart → out. `arrive` is main's glide (lane B), so the machine starts at `wake` on home:enter;
// `out` is main's glide out, which begins when the player presses Sail (the machine never presses it).
//   wake    the Jetty: the Chart tile breathes, Murk and the Journal are dimmed (still live), Murk's wake line (TEXT_LOOP.murk.wake,
//           held murkHold(text) s, the built grumble). A tap elsewhere ends the line early; a Chart tap opens the Chart at any
//           moment; LOOP.tutorial.chartWait s after the line ends the machine asks for the Chart, ONCE per start, and never after
//           the player has backed out of it (onEscapeChart): then only the tile's cue remains
//   chart   the Chart: Sail breathes and is live from the first frame; the departure line murkLineFor('firstChart', wick) every time
//           the Chart is the top screen (read directly, never through sayOnce, so a reload or a step back never loses it)
//   out     Sail was pressed (main writes the tutorial's done and glides out); the machine has nothing more to show
// The clock moves only while the top screen is the Jetty or the Chart (the home pause, Settings, the shelf and the Journal hold it).
// It writes the save only through loop.setTutorialStep (a readout: a resume always starts at the wake); loop.tutorialDone is main's
// (game.sail). It emits `loop:tutorial {step, prev}` and `firstEvening:line {kind: 'murk', key, text, hold, loop: true}` (audio's
// built grumble); never `firstEvening:step`.
import { murkHold } from './first-evening.js';

const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const val = (x) => (typeof x === 'function' ? x() : x);
/** The screens the tutorial's clock runs under. */
export const TUTORIAL_TOPS = Object.freeze(['jetty', 'chart']);
/** M1 step 5b (LANE 5B-TOW): the opening's beats at the Landing and in the tow, before home (landingBeat). */
export const LANDING_BEATS = Object.freeze(['arrive', 'wake', 'tow', 'glideIn']);

/**
 * Murk's line for a moment (SPEC §8.6): `firstChart` is the Wick's own count (TEXT_LOOP.murk.firstChartBy[wick], Tallow's "Four
 * slots …"), else TEXT_LOOP.murk[id]. With `said` (meta.loop.said) a once-line already said reads '' (nothing is due); 'sailOut'
 * rotates and is never "due" here (it is loop.sayOnce's). An unknown id reads ''. Pure.
 */
export function murkLineFor(id, wick = null, { D = null, said = null } = {}) {
  const M = D?.TEXT_LOOP?.murk || {};
  if (typeof id !== 'string' || !id || id === 'sailOut') return '';
  if (said && typeof said === 'object' && said[id]) return '';
  const w = typeof D?.loopWickId === 'function' ? D.loopWickId(wick) : wick;
  const text = id === 'firstChart' ? (M.firstChartBy?.[w] ?? M.firstChart) : M[id];
  return typeof text === 'string' ? text : '';
}

export function createLoopTutorial({ bus = null, loop = null, data = null, now = null } = {}) {
  const D = () => val(data) || {};
  const L = () => { const l = val(loop); return l && typeof l === 'object' && !l.isStub ? l : null; };
  const T = () => D().LOOP?.tutorial || {};
  const emit = (evt, p) => { try { bus?.emit?.(evt, p); } catch { /* a bus listener's fault is not the tutorial's */ } };
  const call = (name, ...a) => { try { const f = L()?.[name]; return typeof f === 'function' ? f.apply(L(), a) : null; } catch { return null; } };
  const hold = (text) => murkHold(text, D().FIRST_EVENING?.lines || {});

  const S = {
    active: false, step: null, from: null,
    t: 0,              // the machine's own clock (seconds it has run while the Jetty or the Chart was on top)
    lineOn: false,     // the wake line is up
    lineT: 0,          // how long it has been up
    lineHold: 0,       // how long it stays (murkHold)
    sinceLine: 0,      // seconds since it ended (the Chart's self-open waits chartWait after it)
    autoOpened: false, // the wake's self-opening of the Chart has fired (once per start)
    escaped: false,    // the player backed out of the Chart: it never opens itself again
    wantsChart: false, // the machine asks the view to open the Chart, as the tile would
    chartOpens: 0,
  };
  const wickNow = () => call('wick') || 'wick';
  // M1 step 5b (LANE 5B-TOW): the opening's tow has played when the barge has been towed to the first water and the build plays it
  const towPlayed = () => {
    if (D().LOOP?.tow?.opening !== true) return false;
    const first = D().LOOP?.barge?.arc?.[0] || 'mossmere', b = call('barge');
    return Array.isArray(b?.towed) && b.towed.includes(first);
  };
  const wakeText = () => D().TEXT_LOOP?.murk?.wake || '';
  const chartText = () => murkLineFor('firstChart', wickNow(), { D: D() });
  function go(step) {
    const prev = S.step;
    S.step = step;
    S.t = step === prev ? S.t : 0;
    emit('loop:tutorial', { step, prev });
    if (step === 'wake' || step === 'chart') call('setTutorialStep', step);
  }
  function say(key, text) {
    if (!text) return;
    emit('firstEvening:line', { kind: 'murk', key, text, hold: hold(text), loop: true });
  }
  function showWake({ line = true } = {}) {
    S.lineOn = line && !!wakeText();
    S.lineT = 0;
    S.lineHold = S.lineOn ? hold(wakeText()) : 0;
    S.sinceLine = 0;
    if (S.lineOn) say('wake', wakeText());
  }

  const api = {
    /** home:enter (B's enterHome has begun the record): the wake, unless the tutorial is done. Returns whether it runs. */
    start({ from = null } = {}) {
      const rec = call('tutorial');
      S.from = from;
      if (rec?.done === true || !L()) {
        const was = S.active;
        S.active = false; S.wantsChart = false;
        if (was && S.step !== 'out') go('done');
        else if (S.step !== 'out') S.step = 'done';
        return false;
      }
      S.active = true; S.autoOpened = false; S.escaped = false; S.wantsChart = false; S.chartOpens = 0;
      go('wake');
      // >>> M1 step 5b (LANE 5B-TOW; OPENING §6.2, M1 §3.5): once the opening's tow has played (meta.loop.barge.towed holds the first
      // water) the wake was the Landing's: home opens on the chart beat over the moored barge (the Chart at once, its line), and
      // after an Escape only the chart table's cue remains. A reload mid-tow lands here too.
      if (towPlayed()) { S.moored = true; showWake({ line: false }); S.autoOpened = true; S.wantsChart = true; return true; }
      S.moored = false;
      // <<< M1 step 5b
      showWake();
      return true;
    },
    // >>> M1 step 5b (LANE 5B-TOW): the opening's beats before home, at the Landing on the Chart (loop-tow.js drives them; the tow's
    // view draws them): 'arrive', 'wake' (Murk's wake line, said here: firstEvening:line, his grumble), 'tow' (the leg begins: the
    // save's readout), 'glideIn'. → whether the beat was taken.
    landingBeat(step) {
      if (!LANDING_BEATS.includes(step)) return false;
      if (call('tutorial')?.done === true) return false;
      S.active = true; S.wantsChart = false; S.lineOn = false;
      const prev = S.step;
      S.step = step; S.t = 0;
      emit('loop:tutorial', { step, prev, landing: true });
      call('setTutorialStep', step);
      if (step === 'wake') say('wake', wakeText());
      return true;
    },
    /** M1 step 5b: home opened on the chart beat after the tow (no wake line at home). */
    get moored() { return S.moored === true; },
    // <<< M1 step 5b
    /** Real time, from the view's update. `top` is the top modal's id; the clock waits under anything but the Jetty or the Chart. */
    update(dt, { top = null } = {}) {
      if (!S.active) return;
      const d = Math.max(0, Math.min(0.25, num(dt)));
      if (!TUTORIAL_TOPS.includes(top)) return;
      S.t += d;
      if (S.step !== 'wake' || top !== 'jetty') return;
      let rest = d;
      if (S.lineOn) {
        S.lineT += d;
        if (S.lineT < S.lineHold - 1e-9) return;
        S.lineOn = false; S.sinceLine = 0;
        rest = S.lineT - S.lineHold;   // (the part of this frame after the line ended counts toward the wait)
      }
      if (S.autoOpened || S.escaped) return;
      S.sinceLine += rest;
      if (S.sinceLine >= num(T().chartWait, 3) - 1e-9) { S.autoOpened = true; S.wantsChart = true; }
    },
    /** A tap on the Jetty outside a tile: it only ends the wake line early. */
    tap() {
      if (!S.active || S.step !== 'wake' || !S.lineOn) return false;
      S.lineOn = false; S.sinceLine = 0;
      return true;
    },
    /** A Jetty tile was pressed (or the machine's own request was honoured): the Chart is the chart beat; the others wait. */
    onTile(id) {
      if (id === 'chart') S.wantsChart = false;
      if (!S.active || id !== 'chart') return false;
      if (S.step !== 'wake' && S.step !== 'chart') return false;
      S.lineOn = false;
      S.chartOpens++;
      go('chart');
      say('firstChart', chartText());
      return true;
    },
    /** Escape (or Back) on the Chart: the Jetty's Chart cue again, with no line; the Chart never opens itself again. */
    onEscapeChart() {
      S.escaped = true; S.wantsChart = false;
      if (!S.active || S.step !== 'chart') return false;
      go('wake');
      showWake({ line: false });
      return true;
    },
    /** Sail: the machine ends (main saves the tutorial's done before the glide out). It never presses Sail itself. */
    onSail() {
      if (!S.active) return false;
      S.active = false; S.wantsChart = false; S.lineOn = false;
      go('out');
      return true;
    },
    get step() { return S.step; },
    isActive: () => S.active,
    /** What the screens show: a tile's cue, Sail's cue, the dimmed tiles and the one line (null for none). Names only a tile or a button. */
    cue() {
      if (!S.active) return { tile: null, sail: false, dim: false, line: null };
      if (S.step === 'wake') return { tile: 'chart', sail: false, dim: true, line: S.lineOn ? wakeText() || null : null };
      if (S.step === 'chart') return { tile: null, sail: true, dim: false, line: chartText() || null };
      return { tile: null, sail: false, dim: false, line: null };
    },
    get wantsChart() { return S.wantsChart; },
    get state() { return { ...S, now: typeof now === 'function' ? num(now(), 0) : null }; },
  };
  return api;
}
