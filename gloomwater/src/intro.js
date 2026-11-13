// intro.js — the opening cut scene's director, `ctx.intro` (LANE B "director and flow").
// docs/v3/intro/SPEC.md §3, §7 (binding), CONTRACT §13.13, DESIGN §25.4.9. Created by main only when data.V3_ENABLED && data.INTRO;
// with v3 off it is never created and nothing here runs.
//
// The director owns TIME and nothing you can see: it advances the film's clock on real elapsed time (a clamped per-frame dt, paused
// while the page is hidden, a 25 s safety valve), tells the stage which moment to show (stage.setTime(t): the stage is a pure
// function of t, src/intro-stage.js), and says on the bus what the words, the Skip word, the veil and the sound should do. It never
// touches three.js, the DOM, the save or the run: main hands the game over on `intro:done`. No three.js import, so it runs in node
// (tools/tests/intro.test.mjs, tools/tests/intro-seam.test.mjs).
//
// API (create(ctx, opts)):
//   init()                                wires nothing visible (visibility is read live in update)
//   pending() -> bool                     would the title's primary button play the film now? (the A3 rule: introPending)
//   prewarm() -> bool                     a fresh save's title is up: let the stage build in idle time (true once it is ready)
//   start({replay, reduced, underInk}) -> bool   from t = 0; false if already playing. `underInk` (main's, optional) is called once
//                                         under the opening's full ink, before the stage goes live (a replay's lake swap, §7.4)
//   skip() -> bool                        honoured after INTRO.skip.guard s of film, once
//   update(realDt)                        main calls it once a frame BEFORE the module loop (so world, actors and render see this frame's t)
//   seek(t) -> state                      debug / tests: hold the clock at t and show exactly that moment (starts the film if idle)
//   resume() -> state                     let a held (sought) film run on
//   stop()                                hard abort with no event (toTitle, wipeAll)
//   isActive() -> bool
//   state -> {phase, t, wall, beat, line, replay, reduced, calm, skipped, hold, optIn, failed, entered, skip: null | {mode, k, w}}
//   setOptIn(on) ;  stage
// Events (ctx.bus), emitted by the director only:
//   intro:start {replay, reduced, calm}
//   intro:beat  {id, i, prev, t}          on every beat change, BEFORE the stage shows the new beat (the view copies the outgoing
//                                         still under reduced motion; the sound cue schedules by the clock, see soundEvents)
//   intro:line  {i, text, at, out} | {i: null}   one line at a time (ui-intro fades it by the film's clock)
//   intro:skip  {t, mode: 'veil' | 'finish'}
//   intro:done  {skipped, replay, t, error, mode}   exactly once per start; main hands over (or returns to the title after a replay)
//
// When the stage goes live (stage.enter): at the press if it was prebuilt under the title and nothing waits to be done under the
// ink; otherwise under the opening's full ink (INTRO.veil), one frame after the ink has been painted full, so a build, a lake
// swap or a change of grade never shows. (Main always passes `underInk`, so in the game the stage always goes live under the ink.)
//
// What the stage is told each frame: stage.setTime(t, {live | seek, reduced, calm}). `live` on a played frame, `seek` when the
// moment was jumped to (a debug seek, a skip's jump to the end, the valve). `reduced`: t is the beat's still (INTRO.stills) and the
// film's last call is setTime(INTRO.length). `calm`: reduced flashing (the stage softens the contact flash; the view makes the cut
// an ink dip). The stage is disposed before `intro:done` is emitted.
//
// A skip (SPEC §7.3). Beats lit / fall / below (`veil`): the film runs on while the view's ink closes (state.skip.k 0 → 1 over
// INTRO.skip.veilIn); one painted frame of full ink later the film jumps to its end and `intro:done {skipped}` hands over; the view
// then opens the ink on the play frame (INTRO.skip.veilOut). Beats wick / home (`finish`): no ink; the words clear and the rest of
// the film plays out in INTRO.skip.finish s. Both timers run on real elapsed time (each frame at most INTRO.clock.valveDt).
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
  return (Number(meta.runs) || 0) === 0 && !introSeen(meta);
}

/** Has this save seen the film? Pure and defensive: `meta.intro` is created lazily and may be missing or garbage. */
export function introSeen(meta) {
  const r = meta && typeof meta === 'object' ? meta.intro : null;
  return !!(r && typeof r === 'object' && r.seen === true);
}

/**
 * The hand-off's one write (SPEC §7.1, §8.3): `meta.intro = {seen: true, skipped}`. In place; anything that was there and is not
 * a plain record is replaced, other keys of a record are kept (a later build may add its own). Returns the record.
 */
export function markIntroSeen(meta, skipped = false) {
  if (!meta || typeof meta !== 'object') return null;
  const old = meta.intro && typeof meta.intro === 'object' && !Array.isArray(meta.intro) ? meta.intro : {};
  meta.intro = { ...old, seen: true, skipped: !!skipped };
  return meta.intro;
}

/** Does the title offer the quiet replay word? A v3 build with the film, not pending, on a save that has started (or seen it). Pure. */
export function replayOffered({ v3 = false, intro = null, meta = null, pending = false } = {}) {
  if (!v3 || !intro || !meta || pending) return false;
  return (Number(meta.runs) || 0) > 0 || introSeen(meta);
}

/** One step of the film's clock, pure: {t, wall} + a real frame time → the next {t, wall, over}. `rate` > 1 plays a skip's fast finish. */
export function stepClock(clock, realDt, INTRO, rate = 1) {
  const C = INTRO?.clock || {}, dt = clamp(num(realDt, 0), 0, num(C.maxDt, 0.1));
  const len = num(INTRO?.length, 18);
  let t = Math.min(len, clock.t + dt * Math.max(0, rate));
  if (t >= len - 1e-9) t = len;   // (the end is the end exactly, whatever the frames summed to)
  const wall = clock.wall + clamp(num(realDt, 0), 0, num(C.valveDt, 0.25));
  return { t, wall, over: t >= len || wall >= num(C.valve, 25) };
}

/** Which kind of skip a press at t is: the ink veil in the first beats, the fast finish from INTRO.skip.finishFrom on. Pure. */
export function skipModeAt(INTRO, t) {
  const b = beatAt(INTRO, t), from = (INTRO?.beats || []).findIndex((x) => x.id === INTRO?.skip?.finishFrom);
  return b && from >= 0 && b.i >= from ? 'finish' : 'veil';
}

/**
 * The Skip word's opacity at t: nothing before INTRO.skip.showAt, in over `wordFade` s (shown within 1 s of the first frame), and
 * out over the film's last `wordOut` s, while the camera is at rest (the keys still skip to the end). Pure.
 */
export function skipWordAt(INTRO, t) {
  const K = INTRO?.skip || {};
  const up = (t - num(K.showAt, 0.6)) / Math.max(1e-3, num(K.wordFade, 0.3));
  const down = num(K.wordOut, 0) > 0 ? (num(INTRO?.length, 18) - t) / K.wordOut : 1;
  return clamp(Math.min(up, down), 0, 1);
}

/** Is a skip honoured at t? Not inside the guard (the stray second tap of Begin). Pure. */
export function skipAllowed(INTRO, t) { return t >= num(INTRO?.skip?.guard, 0.5) - 1e-6; }

/**
 * Reduced flashing (and reduced motion without a snapshot): the hard cut becomes an ink dip, INTRO.calm.cutDip s in all, centred on
 * the cut. Its opacity at t. Pure.
 */
export function cutDipAt(INTRO, t) {
  const C = INTRO?.cut || {}, half = Math.max(1e-3, num(INTRO?.calm?.cutDip, 0.3) / 2);
  return clamp(1 - Math.abs(t - num(C.at, 8.2)) / half, 0, 1);
}

/**
 * Reduced motion's fallback when the picture cannot be copied (SPEC §7.6): an ink dip around every change of still, half of
 * INTRO.stillFade closing before the beat ends and half opening after. Its opacity at t. Pure.
 */
export function stillDipAt(INTRO, t) {
  const half = Math.max(1e-3, num(INTRO?.stillFade, 0.5) / 2);
  let k = 0;
  for (const b of (INTRO?.beats || []).slice(1)) k = Math.max(k, 1 - Math.abs(t - b.t0) / half);
  return clamp(k, 0, 1);
}

/** The first moment the opening ink is full (the stage may go live and a lake may be swapped under it). Pure. */
export function inkFullAt(INTRO) {
  const f = (INTRO?.veil || []).find(([, k]) => k >= 1);
  return f ? f[0] : 0;
}

/**
 * The sound cue as clock events (SPEC §7.7), pure: every mark of INTRO.sound.marks as {t, id, kind: 'on'}, the end of a sustained
 * section as {t: mark.to, id, kind: 'off'}, and a mark with `beat` (the harp) as one {kind: 'note', i, midi} per note. Sorted by
 * time (ties keep the table's order, an 'off' before an 'on'). The cue plays an event when the film's clock crosses its t, so a
 * paused film pauses the score and a slow machine stays in step.
 */
export function soundEvents(INTRO) {
  const out = [];
  (INTRO?.sound?.marks || []).forEach((m, k) => {
    if (num(m.beat, 0) > 0 && Array.isArray(m.notes)) m.notes.forEach((midi, i) => out.push({ t: m.t + i * m.beat, id: m.id, kind: 'note', i, midi, n: m.notes.length, mark: m, k }));
    else out.push({ t: m.t, id: m.id, kind: 'on', mark: m, k });
    if (Number.isFinite(m.to)) out.push({ t: m.to, id: m.id, kind: 'off', mark: m, k: k - 0.5 });
  });
  return out.sort((a, b) => a.t - b.t || (a.kind === 'off' ? -1 : 0) - (b.kind === 'off' ? -1 : 0) || a.k - b.k);
}

/** The sound events the clock crosses going from t0 to t1 (t0 < e.t <= t1; t0 < 0 includes the events at 0). Pure. */
export function soundEventsBetween(events, t0, t1) { return events.filter((e) => e.t > t0 && e.t <= t1); }

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
  const S = { phase: 'idle', t: 0, wall: 0, beat: null, line: null, replay: false, reduced: false, calm: false, skipped: false, hold: false,
    optIn: introOptIn(), failed: false, entered: false, ink: 0, hook: null, skip: null };

  function reducedMotion(force) {
    if (typeof force === 'boolean') return force;
    if (ctx.state?.meta?.settings?.reducedMotion === true) return true;
    try { return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true; } catch { return false; }
  }

  /** The stage goes live (once per play): main's under-ink work first (a replay's lake swap), then stage.enter(). */
  function enterStage() {
    if (S.entered) return;
    S.entered = true;
    const hook = S.hook;
    S.hook = null;
    if (hook) { try { hook({ replay: S.replay, t: S.t }); } catch (err) { S.failed = true; report('underInk', err); } }
    try { getStage()?.enter?.({ replay: S.replay, reduced: S.reduced }); } catch (err) { S.failed = true; report('stage.enter', err); }
  }
  /** Not live yet: wait for one painted frame of full ink (or the ink's end, whatever the frame rate did), then go live. */
  function enterUnderInk(D) {
    if (S.entered) return;
    const V = D.veil || [], lastFull = [...V].reverse().find(([, k]) => k >= 1);
    if (S.ink >= 1 || !V.length || S.t >= (lastFull ? lastFull[0] : 0)) { enterStage(); return; }
    if (veilAt(D, S.t) >= 1) S.ink++;
  }

  /** Show the film at S.t: the beat (as an event, before the stage moves), the stage, then the line (only when it changes). */
  function present(flags) {
    const D = I(), t = S.t;
    const b = beatAt(D, t);
    if (b && b.id !== S.beat) { const prev = S.beat; S.beat = b.id; emit('intro:beat', { id: b.id, i: b.i, prev, t }); }
    const st = getStage();
    if (st && !S.failed) {
      // reduced motion: the beat's still; the film's last moment is always the end state itself (a skip and a full play meet there)
      const shown = S.reduced && t < D.length ? stillAt(D, t) : t;
      try { st.setTime(shown, { ...flags, reduced: S.reduced, calm: S.calm }); } catch (err) { S.failed = true; report('stage.setTime', err); }
    }
    const l = S.skip ? null : lineAt(D, t), li = l ? l.i : null;
    if (li !== S.line) { S.line = li; emit('intro:line', l ? { i: l.i, text: l.text, at: l.at, out: l.out } : { i: null }); }
  }

  function finish({ skipped = false, error = false } = {}) {
    if (S.phase === 'idle') return;
    const done = { skipped: !!skipped || S.skipped, replay: S.replay, t: S.t, error: !!error || S.failed, mode: S.skip ? S.skip.mode : null };
    try { stage?.dispose?.(); } catch (err) { report('stage.dispose', err); }
    S.phase = 'idle'; S.hold = false; S.beat = null; S.skip = null; S.hook = null; S.entered = false;
    if (S.line !== null) { S.line = null; emit('intro:line', { i: null }); }
    emit('intro:done', done);
  }
  /** The film's end state, whatever was on screen: the stage at INTRO.length, settled (a skip under ink, the valve). */
  function jumpToEnd(D) {
    S.t = D.length;
    enterStage();
    present({ seek: true });
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
    start({ replay = false, reduced, underInk = null } = {}) {
      if (S.phase !== 'idle' || !I()) return false;
      const calm = ctx.state?.meta?.settings?.reducedFlashing === true;
      Object.assign(S, { phase: 'playing', t: 0, wall: 0, beat: null, line: null, replay: !!replay, reduced: reducedMotion(reduced), calm, skipped: false, hold: false,
        failed: false, entered: false, ink: 0, hook: typeof underInk === 'function' ? underInk : null, skip: null });
      const st = getStage();
      // prebuilt under the title and nothing to do under the ink: live at the press (it costs nothing and shows nothing before the swap)
      if (!S.hook && st && st.ready === true) enterStage();
      emit('intro:start', { replay: S.replay, reduced: S.reduced, calm: S.calm });
      present({ live: true });
      if (S.failed) finish({ error: true });
      return true;
    },
    skip() {
      const D = I();
      if (S.phase !== 'playing' || !D || S.skip || S.hold || !skipAllowed(D, S.t)) return false;
      const mode = skipModeAt(D, S.t), K = D.skip || {};
      S.skipped = true;
      S.skip = { mode, w: 0, k: 0, painted: false, rate: mode === 'finish' ? Math.max(1, (D.length - S.t) / Math.max(1e-3, num(K.finish, 0.5))) : 1 };
      if (S.line !== null) { S.line = null; emit('intro:line', { i: null }); }   // the words clear at once
      emit('intro:skip', { t: S.t, mode });
      return true;
    },
    update(realDt) {
      if (S.phase !== 'playing' || S.hold) return;
      try { if (globalThis.document?.hidden) return; } catch { /* no document: run */ }
      const D = I(), K = D.skip || {};
      const c = stepClock(S, realDt, D, S.skip ? S.skip.rate : 1);
      S.t = c.t; S.wall = c.wall;
      let end = c.over, jump = c.over && c.t < D.length - 1e-9;   // (the valve: the end state without the rest of the film)
      if (S.skip) {
        const k = S.skip;
        k.w += clamp(num(realDt, 0), 0, num(D.clock?.valveDt, 0.25));
        if (k.mode === 'veil') {
          // full a little early, so one frame of full ink is on screen before the jump and the whole skip still fits its budget
          const vin = Math.max(1e-3, num(K.veilIn, 0.25));
          if (k.painted && k.w >= vin) { end = true; jump = true; }
          k.k = clamp(k.w / (vin * 0.8), 0, 1);
          if (k.k >= 1) k.painted = true;
        } else if (k.w >= num(K.finish, 0.5)) { end = true; jump = S.t < D.length - 1e-9; }
      }
      if (!S.entered && !end) enterUnderInk(D);
      if (jump) jumpToEnd(D); else present({ live: true });
      if (S.failed) finish({ error: true });
      else if (end) finish();
    },
    seek(t) {
      const D = I();
      if (!D) return api.state;
      if (S.phase === 'idle') api.start({ replay: true });
      if (S.phase !== 'playing') return api.state;
      S.hold = true; S.skip = null;
      S.t = clamp(num(Number(t), 0), 0, D.length);
      enterStage();
      present({ seek: true });
      if (S.failed) finish({ error: true });
      return api.state;
    },
    /** Debug / tests: let a held (sought) film run on from where it stands. */
    resume() { S.hold = false; return api.state; },
    stop() {
      if (S.phase === 'idle') return;
      try { stage?.dispose?.(); } catch (err) { report('stage.dispose', err); }
      S.phase = 'idle'; S.hold = false; S.beat = null; S.line = null; S.skip = null; S.hook = null; S.entered = false;
    },
    isActive: () => S.phase !== 'idle',
    get stage() { return getStage(); },
    get state() {
      return { phase: S.phase, t: +S.t.toFixed(4), wall: +S.wall.toFixed(3), beat: S.beat, line: S.line, replay: S.replay, reduced: S.reduced, calm: S.calm,
        skipped: S.skipped, hold: S.hold, optIn: S.optIn, failed: S.failed, entered: S.entered,
        skip: S.skip ? { mode: S.skip.mode, k: +S.skip.k.toFixed(4), w: +S.skip.w.toFixed(4) } : null };
    },
  };
  return api;
}
