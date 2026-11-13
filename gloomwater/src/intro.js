// intro.js — the opening cut scene's director, `ctx.intro` (LANE B "director and flow").
// docs/v3/intro/SPEC.md §3, §7 (binding), CONTRACT §13.13, DESIGN §25.4.9. Created by main only when data.V3_ENABLED && data.INTRO;
// with v3 off it is never created and nothing here runs.
//
// The director owns TIME and nothing you can see: it advances the film's clock on real elapsed time (a clamped per-frame dt, paused
// while the page is hidden, a 25 s safety valve), tells the stage which moment to show (stage.setTime(t): the stage is a pure
// function of t, src/intro-stage.js), and says on the bus what the words, the Skip word, the veil and the sound should do. It never
// touches three.js, the DOM, the save or the run: main hands the game over on `intro:done`.
//
// STATUS: the seam commit's SKELETON. It plays 0 → INTRO.length, seeks, emits the events and ends cleanly; a skip ends at once.
// Lane B builds on it: the skip's two paths (the ink veil in lit / fall / below, the fast finish in wick / home), reduced motion's
// cross-fades, the view (src/ui-intro.js), the sound cue, the title's trigger and the hand-off in main.js.
//
// API (create(ctx, opts)):
//   init()                                wires nothing visible (visibility is read live in update)
//   pending() -> bool                     would the title's primary button play the film now? (the A3 rule: introPending)
//   prewarm()                             a fresh save's title is up: let the stage build in idle time
//   start({replay, reduced}) -> bool      from t = 0; false if already playing
//   skip() -> bool                        honoured after INTRO.skip.guard s of film
//   update(realDt)                        main calls it once a frame BEFORE the module loop (so world, actors and render see this frame's t)
//   seek(t) -> state                      debug / tests: hold the clock at t and show exactly that moment (starts the film if idle)
//   stop()                                hard abort with no event (toTitle, wipeAll)
//   isActive() -> bool ;  state -> {phase, t, beat, line, replay, reduced, skipped, wall, hold}
// Events (ctx.bus):
//   intro:start {replay, reduced}
//   intro:beat  {id, i, prev, t}          on every beat change (the sound cue schedules its sections on it)
//   intro:line  {i, text, at, out} | {i: null}   one line at a time (ui-intro fades it by the film's clock)
//   intro:skip  {t, mode: 'veil' | 'finish'}
//   intro:done  {skipped, replay, t, error}      exactly once per start; main hands over (or returns to the title after a replay)
import { createIntroStage } from './intro-stage.js';

const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);

/** The beat that owns timeline time t: {id, i, t0, t1, k} (k = 0 … 1 through it). Pure. */
export function beatAt(INTRO, t) {
  const B = INTRO?.beats || [];
  if (!B.length) return null;
  let i = B.findIndex((b) => t < b.t1);
  if (i < 0) i = B.length - 1;
  const b = B[i];
  return { id: b.id, i, t0: b.t0, t1: b.t1, k: clamp((t - b.t0) / Math.max(1e-6, b.t1 - b.t0), 0, 1) };
}

/** The line on screen at t: {i, text, at, out, k} (k = its opacity, 0 … 1, by INTRO.lineFade) or null. Pure. */
export function lineAt(INTRO, t) {
  const L = (INTRO?.lines || []).find((l) => t >= l.at && t < l.out);
  if (!L) return null;
  const f = Math.max(1e-3, num(INTRO.lineFade, 0.4));
  return { i: L.i, text: INTRO.text[L.i], at: L.at, out: L.out, k: clamp(Math.min((t - L.at) / f, (L.out - t) / f), 0, 1) };
}

/** The opening ink dip's opacity at t (INTRO.veil: [t, k] keys, linear between them). Pure. */
export function veilAt(INTRO, t) {
  const V = INTRO?.veil || [];
  if (!V.length || t <= V[0][0]) return V.length ? V[0][1] : 0;
  for (let i = 1; i < V.length; i++) if (t < V[i][0]) return V[i - 1][1] + ((V[i][1] - V[i - 1][1]) * (t - V[i - 1][0])) / (V[i][0] - V[i - 1][0]);
  return V.at(-1)[1];
}

/** Reduced motion: the still the stage holds at t (one per beat, INTRO.stills). Before INTRO.swapAt the film's own t (the title frame). Pure. */
export function stillAt(INTRO, t) {
  if (t < num(INTRO?.swapAt, 0)) return t;
  const b = beatAt(INTRO, t);
  const s = (INTRO?.stills || []).find((x) => x.beat === b?.id);
  return s ? s.t : t;
}

/** The debug opt-in to auto-play (CONTRACT §13.13): `globalThis.GW_INTRO === true` before the page's scripts, or `?intro=1`. */
export function introOptIn(g = globalThis) {
  if (g.GW_INTRO === true) return true;
  try { return /[?&]intro=1(?:&|$)/.test(g.location?.search || ''); } catch { return false; }
}

/**
 * The trigger (A3), pure: the title's primary button plays the film only on a v3 build, on a fresh save (no run ever started,
 * the film not seen), with no run waiting, and never in a debug build unless a scenario opted in.
 */
export function introPending({ v3 = false, intro = null, meta = null, debug = false, optIn = false, savedRun = false } = {}) {
  if (!v3 || !intro || !meta) return false;
  if (debug && !optIn) return false;
  if (savedRun) return false;
  return (Number(meta.runs) || 0) === 0 && !(meta.intro && meta.intro.seen);
}

/** One step of the film's clock, pure: {t, wall} + a real frame time → the next {t, wall, over}. `rate` > 1 plays a skip's fast finish. */
export function stepClock(clock, realDt, INTRO, rate = 1) {
  const C = INTRO?.clock || {}, dt = clamp(num(realDt, 0), 0, num(C.maxDt, 0.1));
  const t = Math.min(num(INTRO?.length, 18), clock.t + dt * Math.max(0, rate));
  const wall = clock.wall + clamp(num(realDt, 0), 0, num(C.valveDt, 0.25));
  return { t, wall, over: t >= num(INTRO?.length, 18) - 1e-9 || wall >= num(C.valve, 25) };
}

export function create(ctx, opts = {}) {
  const I = () => ctx.data?.INTRO || null;
  const bus = ctx.bus;
  function report(where, err) { try { console.error(`[intro] ${where}`, err); ctx.errors?.push?.(`intro.${where}: ${err?.message || err}`); } catch { /* ignore */ } }
  const emit = (e, p) => { try { bus?.emit?.(e, p); } catch (err) { report(e, err); } };

  let stage = null;
  function getStage() {
    if (stage) return stage;
    try { stage = (opts.createStage || createIntroStage)(ctx); } catch (err) { report('createStage', err); stage = null; }
    return stage;
  }
  const S = { phase: 'idle', t: 0, wall: 0, beat: null, line: null, replay: false, reduced: false, skipped: false, hold: false, optIn: introOptIn(), failed: false };

  function reducedMotion(force) {
    if (typeof force === 'boolean') return force;
    if (ctx.state?.meta?.settings?.reducedMotion === true) return true;
    try { return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true; } catch { return false; }
  }

  /** Show the film at S.t: the stage, then the beat and the line as events (only when they change). */
  function present(flags) {
    const D = I(), t = S.t;
    const st = getStage();
    if (st && !S.failed) {
      try { st.setTime(S.reduced ? stillAt(D, t) : t, { ...flags, reduced: S.reduced }); } catch (err) { S.failed = true; report('stage.setTime', err); }
    }
    const b = beatAt(D, t);
    if (b && b.id !== S.beat) { const prev = S.beat; S.beat = b.id; emit('intro:beat', { id: b.id, i: b.i, prev, t }); }
    const l = lineAt(D, t), li = l ? l.i : null;
    if (li !== S.line) { S.line = li; emit('intro:line', l ? { i: l.i, text: l.text, at: l.at, out: l.out } : { i: null }); }
  }

  function finish({ skipped = false, error = false } = {}) {
    if (S.phase === 'idle') return;
    const done = { skipped: !!skipped || S.skipped, replay: S.replay, t: S.t, error: !!error || S.failed };
    try { stage?.dispose?.(); } catch (err) { report('stage.dispose', err); }
    S.phase = 'idle'; S.hold = false; S.beat = null;
    if (S.line !== null) { S.line = null; emit('intro:line', { i: null }); }
    emit('intro:done', done);
  }

  const api = {
    init() { /* nothing to wire: the director is driven by main (start / update / skip) */ },
    pending() {
      return introPending({ v3: ctx.data?.V3_ENABLED === true, intro: I(), meta: ctx.state?.meta, debug: !!opts.debug, optIn: S.optIn,
        savedRun: !!(typeof opts.hasSavedRun === 'function' ? opts.hasSavedRun() : false) });
    },
    /** Debug builds: opt in to (or out of) auto-play for this page (CONTRACT §13.13). */
    setOptIn(on) { S.optIn = !!on; return S.optIn; },
    prewarm() { try { return getStage()?.prebuild?.() ?? false; } catch (err) { report('stage.prebuild', err); return false; } },
    start({ replay = false, reduced } = {}) {
      if (S.phase !== 'idle' || !I()) return false;
      Object.assign(S, { phase: 'playing', t: 0, wall: 0, beat: null, line: null, replay: !!replay, reduced: reducedMotion(reduced), skipped: false, hold: false, failed: false });
      const st = getStage();
      try { st?.enter?.({ replay: S.replay, reduced: S.reduced }); } catch (err) { S.failed = true; report('stage.enter', err); }
      emit('intro:start', { replay: S.replay, reduced: S.reduced });
      present({ live: true });
      if (S.failed) finish({ error: true });
      return true;
    },
    skip() {
      const D = I();
      if (S.phase !== 'playing' || !D || S.t < num(D.skip?.guard, 0.5)) return false;
      S.skipped = true;
      const b = beatAt(D, S.t), from = D.beats.findIndex((x) => x.id === D.skip?.finishFrom);
      emit('intro:skip', { t: S.t, mode: from >= 0 && b.i >= from ? 'finish' : 'veil' });
      // SKELETON: a skip ends at once. Lane B: the ink veil (veilIn → jump to the end → veilOut) or the fast finish (INTRO.skip.finish)
      S.t = D.length;
      present({ seek: true });
      finish({ skipped: true });
      return true;
    },
    update(realDt) {
      if (S.phase !== 'playing' || S.hold) return;
      try { if (globalThis.document?.hidden) return; } catch { /* no document: run */ }
      const D = I();
      const c = stepClock(S, realDt, D);
      S.t = c.t; S.wall = c.wall;
      present({ live: true });
      if (S.failed) finish({ error: true });
      else if (c.over) finish();
    },
    seek(t) {
      const D = I();
      if (!D) return api.state;
      if (S.phase === 'idle') api.start({ replay: true });
      if (S.phase !== 'playing') return api.state;
      S.hold = true;
      S.t = clamp(num(Number(t), 0), 0, D.length);
      present({ seek: true });
      return api.state;
    },
    /** Debug / tests: let a held (sought) film run on from where it stands. */
    resume() { S.hold = false; return api.state; },
    stop() {
      if (S.phase === 'idle') return;
      try { stage?.dispose?.(); } catch (err) { report('stage.dispose', err); }
      S.phase = 'idle'; S.hold = false; S.beat = null; S.line = null;
    },
    isActive: () => S.phase !== 'idle',
    get stage() { return getStage(); },
    get state() {
      return { phase: S.phase, t: +S.t.toFixed(4), wall: +S.wall.toFixed(3), beat: S.beat, line: S.line, replay: S.replay, reduced: S.reduced,
        skipped: S.skipped, hold: S.hold, optIn: S.optIn, failed: S.failed };
    },
  };
  return api;
}
