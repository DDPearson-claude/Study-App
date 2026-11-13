// first-evening.js — the First Evening director (`ctx.firstEvening`): where a new game starts, and its tutorial.
// DESIGN §25.4.8 (binding), §25.14.2b FE-N1; CONTRACT §13.12. Created by main when data.V3_ENABLED && data.FIRST_EVENING; with v3
// off it is never created and nothing here runs.
//
// The step machine (FIRST_EVENING.steps): framing → wake → cast → wait → strike → play → measure → odds → gate → plan → setout.
// Steps advance on bus events only (fishing:cast / land / bite / strike / miss / caught, fish:escaped, the card closed =
// fish:action, the log = ui:screen {id: 'journal'}, station:open {id: 'map_table'} from the Map Table post, game.planSetOut, the
// arch crossing). A step never ends before its Murk line has played out (2.4 s + 0.05 s per character, FIRST_EVENING.lines); while
// a Murk line plays between actions the director holds the world input (`locksInput()`), so no strike window ever opens under a
// Murk or lore line, and the only tip allowed in the strike window is `fe_strike`. At most one line of each kind exists at a time
// (a new one replaces the old; `{key: null}` clears it).
//
// The director never touches an outcome: fishing.setTutorial({...}) is the only fishing call it makes besides cancelling a line on
// Skip, and it passes waits and presentation only (FIRST_EVENING.tutorialApi). Three losses jump to `gate` and defer the measuring
// lesson and Murk's odds line to the first lake. Skip (two taps on the Skip word; the first tap in `framing` also skips the
// framing) jumps to `plan` and grants nothing. A quit First Evening resumes at `cast` (before the catch: Murk's wake line once more,
// no framing) or at `gate` (after it). A replay (Settings or the legacy ribbon) runs framing → gate in a sandbox: main snapshots meta
// and blocks every save, and puts meta back byte for byte when the replay ends at the Map Table post.
//
// API (CONTRACT §13.12): start({replay}), skip(), isActive(), step, allowsTip(tipId), resume(); plus skipWord() (the Skip word's tap
// logic), hurry() (a tap on a lore line / the wake), onPlan(plan) / onCardClosed() (the First Outing card), locksInput(),
// locksMovement(), state (a debug readout). Events: firstEvening:step {id, prev, replay, skipped}, firstEvening:line {kind, key,
// text, hold}, firstEvening:done {skipped, replay, losses}; extras for the views: firstEvening:beat {id, ...}, firstEvening:skip
// {confirm}, firstEvening:card {open}.

const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const real = (m) => !!m && !m.isStub;

/** The time a Murk line stays up (FIRST_EVENING.lines: 2.4 s + 0.05 s per character). */
export function murkHold(text, L = {}) {
  return num(L.murkHold, 2.4) + num(L.murkPerChar, 0.05) * String(text || '').length;
}
/** The framing's three lore lines: [{i, at, hold, end}] (each holds 2.6 s and fades 0.4 s, clipped to fit before the next one). */
export function loreSchedule(FE) {
  const L = FE?.lines || {}, shot = FE?.shot || [], lore = FE?.text?.lore || [];
  const total = num(FE?.stepSec?.framing, 9), hold = num(L.hold, 2.6), fade = num(L.fade, 0.4);
  return lore.map((text, i) => {
    const at = num(shot[i]?.t, (i * total) / Math.max(1, lore.length));
    const next = i + 1 < lore.length ? num(shot[i + 1]?.t, ((i + 1) * total) / lore.length) : total;
    const h = Math.max(0.5, Math.min(hold, next - at - fade));
    return { i, at, hold: h, end: at + h + fade, text };
  });
}

export function create(ctx) {
  const D = () => ctx.data || {};
  const FE = () => D().FIRST_EVENING || {};
  const STEPS = () => (Array.isArray(FE().steps) ? FE().steps : ['framing', 'wake', 'cast', 'wait', 'strike', 'play', 'measure', 'odds', 'gate', 'plan', 'setout']);
  const T = () => FE().text || {};
  const bus = ctx.bus;
  const emit = (e, p) => { try { bus.emit(e, p); } catch (err) { report(err); } };
  function report(err) { try { console.error('[first-evening]', err); ctx.errors?.push?.(`first-evening: ${err?.message || err}`); } catch { /* ignore */ } }
  const call = (fn) => { try { return fn(); } catch (err) { report(err); return undefined; } };

  const S = {
    active: false, replay: false, step: null, prev: null, t: 0, clock: 0, losses: 0, skipped: false,
    murk: null,        // {key, text, t, hold}
    lore: null,        // {key, text, t, hold}
    tip: null,         // key
    pending: null,     // a transition waiting for the Murk line: {to, fn}
    skipArmed: 0,      // s left on the "Skip the first evening?" confirm
    loreIdx: -1, emberDone: false, wipeT: -1, wipeDone: false, wakeMurkStarted: false, resumed: false,
    castSeen: false, settled: false, castIdle: 0, ringPulsed: false, escaped: false, escapedT: null,
    caught: false, landed: false, logOpen: false, logOpened: false, inRange: false, card: false,
    tutorialSet: false, grade: null, fumbled: false, deferred: null, departing: false, doneFired: false,
    lastShot: null,
  };

  // ------------------------------------------------------------------ meta (progression owns meta.firstEvening; main mirrors it)
  const feMeta = () => {
    const m = ctx.state?.meta;
    if (!m) return null;
    if (!m.firstEvening || typeof m.firstEvening !== 'object') m.firstEvening = { done: false, step: null, skipped: false, legacy: false };
    return m.firstEvening;
  };
  const writeMeta = (fn) => { if (S.replay) return; const fe = feMeta(); if (fe) call(() => fn(fe)); };

  // ------------------------------------------------------------------ lines
  const isTouch = () => !!ctx.isMobile;
  function tipText(key) {
    const t = FE().tips?.[key];
    if (!t) return '';
    if (typeof t === 'string') return t;
    return isTouch() ? t.touch || t.desktop || '' : t.desktop || t.touch || '';
  }
  function showTip(key) {
    if (S.tip === key) return;
    S.tip = key;
    emit('firstEvening:line', { kind: 'tip', key: key || null, text: key ? tipText(key) : '' });
  }
  function clearTip() { if (S.tip !== null) showTip(null); }
  function sayMurk(key, text = null) {
    const tx = text ?? (Array.isArray(T()[key]) ? '' : T()[key]) ?? '';
    const hold = murkHold(tx, FE().lines);
    S.murk = { key, text: tx, t: 0, hold };
    emit('firstEvening:line', { kind: 'murk', key, text: tx, hold });
  }
  function clearMurk() { if (S.murk) { S.murk = null; emit('firstEvening:line', { kind: 'murk', key: null, text: '' }); } }
  function sayLore(i, item) {
    S.lore = { key: `lore${i + 1}`, text: item.text, t: 0, hold: item.hold + num(FE().lines?.fade, 0.4) };
    emit('firstEvening:line', { kind: 'lore', key: S.lore.key, text: item.text, hold: item.hold });
  }
  function clearLore() { if (S.lore) { S.lore = null; emit('firstEvening:line', { kind: 'lore', key: null, text: '' }); } }
  const murkUp = () => !!S.murk && S.murk.t < S.murk.hold;
  /** Run `fn` once Murk's line has played out (now if none is up). */
  function afterMurk(fn) { if (murkUp()) S.pending = { fn }; else { S.pending = null; fn(); } }
  const beat = (id, extra = {}) => emit('firstEvening:beat', { id, step: S.step, ...extra });

  // ------------------------------------------------------------------ the tutorial seam (CONTRACT §13.7a)
  function tutorialOpts() {
    const B = FE().bite || {};
    return {
      nibbleAt: B.nibbleAt, biteAt: B.biteAt, retryBiteAt: B.retryBiteAt, retryNibbles: B.retryNibbles,
      strikeRing: 'always', estimate: FE().estimate ? { ...FE().estimate } : true,
    };
  }
  function setTutorial(on) {
    const f = ctx.fishing;
    if (!real(f) || typeof f.setTutorial !== 'function') return;
    call(() => f.setTutorial(on ? tutorialOpts() : null));
    S.tutorialSet = !!on;
  }
  function cancelLine(reason) {
    const f = ctx.fishing;
    if (!real(f)) return;
    const st = f.state;
    if (typeof st === 'string' && st !== 'idle') call(() => (typeof f.hardReset === 'function' ? f.hardReset() : f.cancel?.(reason)));
  }

  // ------------------------------------------------------------------ steps
  function go(id, opts = {}) {
    const prev = S.step;
    S.prev = prev; S.step = id; S.t = 0; S.pending = null;
    if (id !== 'framing') clearLore();
    clearTip();
    emit('firstEvening:step', { id, prev, replay: S.replay, skipped: !!opts.skipped });
    enter(id, opts);
  }
  function enter(id, opts) {
    const F = FE();
    switch (id) {
      case 'framing':
        S.loreIdx = -1; S.emberDone = false; S.lastShot = loreSchedule(F);
        call(() => ctx.actors?.setLantern?.(num(F.wake?.lanternStart, 0.7)));
        break;
      case 'wake':
        S.wipeT = -1; S.wipeDone = false; S.wakeMurkStarted = false; S.resumed = !!opts.resumed;
        if (!S.resumed) call(() => ctx.actors?.playWake?.());
        else { S.wakeMurkStarted = true; sayMurk(F.stepMurk?.wake?.key || 'murkWake'); }   // a resume: Murk's wake line once more, at once
        call(() => ctx.actors?.setLantern?.(num(F.wake?.lanternStart, 0.7)));
        break;
      case 'cast':
        S.castSeen = false; S.settled = false; S.castIdle = 0; S.ringPulsed = false; S.escaped = false; S.escapedT = null;
        if (!S.tutorialSet) setTutorial(true);
        showTip('fe_cast');
        break;
      case 'wait':
        S.settled = false;
        break;
      case 'strike':
        showTip('fe_strike');
        break;
      case 'play':
        S.escaped = false; S.escapedT = null;
        showTip('fe_play');
        break;
      case 'measure':
        S.landed = false;
        break;
      case 'odds':
        S.logOpen = false; S.logOpened = false;
        sayMurk('murkOdds');
        beat('logGlow', { on: true });
        break;
      case 'gate':
        S.inRange = false; S.card = false;
        if (!opts.quiet) sayMurk(S.replay && opts.replayLine ? 'murkReplay' : 'murkGate');
        showTip('fe_sail');
        beat('postGlow', { on: true, post: F.gate?.post || 'map_table' });
        break;
      case 'plan':
        S.card = true;
        openCard();
        break;
      case 'setout':
        S.setoutSaid = false;
        clearTip();
        setTutorial(false);
        startDeparture();
        break;
      default: break;
    }
  }

  function openCard() {
    const lines = T().outingLines || [];
    emit('firstEvening:card', { open: true, lines: lines.slice() });
    const ui = ctx.ui;
    if (!real(ui)) return;
    const card = { firstOuting: true, zone: 'mossmere', character: F_SETOUT().character, nightMode: F_SETOUT().nightMode, outing: F_SETOUT().outing, lines: lines.slice() };
    if (typeof ui.showFirstOuting === 'function') call(() => ui.showFirstOuting(card));
    else if (typeof ui.showSetOut === 'function') call(() => ui.showSetOut(card));
  }
  const F_SETOUT = () => ({ character: 'wick', nightMode: 'still', outing: 'first', ...(FE().setOut || {}) });

  function startDeparture() {
    S.departing = true;
    const F = FE();
    call(() => ctx.actors?.setLantern?.(num(F.setOut?.lanternTo, 1), num(F.setOut?.lanternOver, 0.8)));
    beat('setout', { glide: num(F.setOut?.glide, 3) });
    const p = ctx.player;
    let started = false;
    if (real(p) && typeof p.setOutFromPost === 'function') {
      const r = call(() => p.setOutFromPost({ onLine: () => onArch() }));
      started = r !== false && r !== undefined && r !== null;
    }
    if (!started) S.departFallback = num(F.stepSec?.setout, 6);   // no player glide in this build: the step's time stands in for it
  }
  function onArch() {
    if (S.step !== 'setout' || S.doneFired) return;
    finish(false);
  }

  /** The end of the First Evening (the arch crossing) or of a replay (the Map Table post). */
  function finish(replayEnd) {
    if (S.doneFired) return;
    S.doneFired = true;
    const payload = { skipped: S.skipped, replay: S.replay, losses: S.losses };
    if (!S.replay) {
      writeMeta((fe) => { fe.done = true; fe.step = null; if (S.skipped) fe.skipped = true; if (S.deferred) fe.deferred = { ...S.deferred }; if (S.fumbled) fe.fumbled = true; });
      const seen = ctx.state?.meta?.seenTips;
      if (seen && typeof seen === 'object') for (const id of FE().marksSeen || []) seen[id] = true;
    }
    clearTip(); clearMurk(); clearLore();
    S.active = false; S.departing = false;
    setTutorial(false);
    const wasReplay = S.replay;
    S.step = null;
    void replayEnd;
    emit('firstEvening:done', payload);
    S.replay = false;
    if (wasReplay) S.losses = 0;
  }

  // ------------------------------------------------------------------ per-frame
  function update(dt) {
    if (!S.active) return;
    if (!(dt > 0)) return;
    S.t += dt; S.clock += dt;
    if (S.skipArmed > 0) { S.skipArmed = Math.max(0, S.skipArmed - dt); if (S.skipArmed === 0) emit('firstEvening:skip', { confirm: false }); }
    if (S.murk) {
      S.murk.t += dt;
      if (S.murk.t >= S.murk.hold) { const key = S.murk.key; S.murk = null; emit('firstEvening:line', { kind: 'murk', key: null, text: '', ended: key }); }
    }
    if (S.lore) { S.lore.t += dt; }
    if (S.pending && !murkUp()) { const fn = S.pending.fn; S.pending = null; fn(); if (!S.active) return; }
    const F = FE();
    switch (S.step) {
      case 'framing': {
        const sched = S.lastShot || loreSchedule(F);
        if (!S.emberDone && S.t >= num(F.ember?.at, 0.8)) {
          S.emberDone = true;
          call(() => ctx.world?.setEmber?.({ pulse: true }));
          beat('ember', { x: F.ember?.x, z: F.ember?.z });
        }
        for (let i = S.loreIdx + 1; i < sched.length; i++) {
          if (S.t >= sched[i].at) { S.loreIdx = i; sayLore(i, sched[i]); } else break;
        }
        if (S.lore && S.loreIdx >= 0 && S.t >= sched[S.loreIdx].end) clearLore();
        const end = Math.max(num(F.stepSec?.framing, 9), sched.length ? sched[sched.length - 1].end : 0);
        if (S.t >= end) go('wake');
        break;
      }
      case 'wake': {
        const M = F.stepMurk?.wake || { at: 1.2, then: 0.8 };
        if (!S.wakeMurkStarted && S.t >= (S.resumed ? 0 : num(M.at, 1.2))) { S.wakeMurkStarted = true; sayMurk(M.key || 'murkWake'); }
        if (S.wakeMurkStarted && !murkUp() && S.wipeT < 0) {
          if (S.resumed) { go('cast'); break; }
          if (worldMode() === 'foot') {
            // P3: the Wick walks to the jetty (DESIGN §25.4.8); the slice never gets here
            call(() => ctx.bus.emit('firstEvening:beat', { id: 'jettyGlow', step: 'wake' }));
            S.wipeT = 0; S.wipeDone = true;
          } else {
            S.wipeT = 0;
            beat('wipe', { dur: num(M.then, num(F.wake?.wipe, 0.8)) });
          }
        }
        if (S.wipeT >= 0) {
          const W = num(M.then, num(F.wake?.wipe, 0.8));
          S.wipeT += dt;
          if (!S.wipeDone && S.wipeT >= W * 0.5) { S.wipeDone = true; call(() => ctx.player?.toMooring?.()); }
          if (S.wipeT >= W) go('cast');
        }
        break;
      }
      case 'cast': {
        if (!S.castSeen && !murkUp()) {
          S.castIdle += dt;
          if (S.castIdle >= 10 && !S.ringPulsed) { S.ringPulsed = true; beat('castRing', {}); }
          if (S.castIdle >= 20) { S.castIdle = 10; S.ringPulsed = false; }
        }
        break;
      }
      case 'wait':
        if (!S.settled && S.t >= 1.2) { S.settled = true; showTip('fe_wait'); }   // no land event in this fishing build
        break;
      case 'play':
        if (S.escaped === true && S.escapedT !== null) {
          S.escapedT += dt;
          if (S.escapedT >= 0.8) { S.escapedT = null; onLoss(); }
        }
        break;
      case 'odds':
        if (!murkUp() && !S.logOpen) { beat('logGlow', { on: S.logOpened ? false : 'soft' }); go('gate'); }
        break;
      case 'plan':
        // the card was closed without Set Out (a ui that closes before it calls planSetOut gets a short grace)
        if (S.closeGrace > 0) { S.closeGrace -= dt; if (S.closeGrace <= 0) { S.closeGrace = 0; api.onCardClosed(); } }
        break;
      case 'setout': {
        const SM = F.stepMurk?.setout;
        if (SM && !S.setoutSaid && S.t >= num(SM.at, 0.5)) { S.setoutSaid = true; sayMurk(SM.key || 'murkFirstOil'); }
      }
        if (S.departFallback > 0) { S.departFallback -= dt; if (S.departFallback <= 0) { S.departFallback = 0; onArch(); } }
        break;
      default: break;
    }
  }
  const worldMode = () => { try { const m = ctx.world?.getMode?.(); return typeof m === 'string' ? m : 'raft'; } catch { return 'raft'; } };

  // ------------------------------------------------------------------ fishing and ui events
  function onLoss() {
    S.escaped = 'done';
    S.losses++;
    const lines = T().murkLost || [];
    const max = num(FE().bite?.maxLosses, 3);
    const text = lines[Math.min(S.losses, lines.length) - 1] || '';
    sayMurk(`murkLost${S.losses}`, text);
    if (S.losses >= max) {
      S.deferred = { measure: true, odds: true };
      writeMeta((fe) => { fe.deferred = { measure: true, odds: true }; });
      afterMurk(() => go('gate', { quiet: false }));
    } else afterMurk(() => go('cast'));
  }
  const on = (evt, fn) => bus.on(evt, (p) => { if (!S.active) return; try { fn(p || {}); } catch (err) { report(err); } });

  function wire() {
    on('fishing:cast', () => {
      if (S.step === 'cast' && !murkUp()) { S.castSeen = true; go('wait'); }
    });
    on('fishing:land', () => { if (S.step === 'wait' && !S.settled) { S.settled = true; showTip('fe_wait'); } });
    on('fishing:settle', () => { if (S.step === 'wait' && !S.settled) { S.settled = true; showTip('fe_wait'); } });
    on('fishing:bite', () => {
      if (S.step === 'wait' || S.step === 'cast') { clearMurk(); go('strike'); }
    });
    on('fishing:miss', ({ reason }) => {
      if ((S.step === 'wait' || S.step === 'cast') && (reason === 'spooked' || reason === 'early')) {
        S.fumbled = true;
        clearTip();
        sayMurk('murkSpooked');
        afterMurk(() => go('cast'));
      } else if (S.step === 'strike' && (reason === 'passed' || reason === 'late' || reason === 'timeout' || reason === 'missed')) {
        S.fumbled = true;
        clearTip();
        sayMurk('murkPassed');
        afterMurk(() => go('cast'));
      }
    });
    const struck = (grade) => {
      if (S.step !== 'strike') return;
      S.grade = grade || 'struck';
      if (S.grade === 'early' || S.grade === 'late') S.fumbled = true;
      go('play');
    };
    on('fishing:strike', ({ grade }) => struck(grade));
    on('fishing:hook', ({ grade, perfect }) => { if (S.step === 'strike') struck(grade || (perfect ? 'clean' : 'struck')); });
    on('fishing:caught', () => { if (S.step === 'play' || S.step === 'strike') go('measure'); });
    // the loss: fishing:escaped at the loss beat, then fish:escaped (the got-away note) after the 0.6 s quiet beat; Murk speaks
    // 0.8 s after the note (a build whose fishing never sends the note still moves on 1.8 s after the loss)
    on('fishing:escaped', () => { if (S.step === 'play' && !S.escaped) { S.escaped = true; S.escapedT = -1; } });
    on('fish:escaped', () => {
      if (S.step === 'strike') go('play');
      if (S.step === 'play' && S.escaped !== 'done') { S.escaped = true; S.escapedT = Math.max(S.escapedT ?? 0, 0); }
    });
    on('fish:landed', () => { if (S.step === 'measure') S.landed = true; });
    on('fish:action', () => { if (S.step === 'measure') go('odds'); });
    on('ui:modal', ({ id, open }) => {
      if (S.step === 'measure' && open === false && id === 'catch' && S.landed) go('odds');
      onScreen({ id, open });
    });
    on('ui:screen', (p) => onScreen(p));
    on('interact:change', ({ id }) => { S.inRange = id === 'station:map_table'; });
    on('station:open', ({ id }) => {
      if (id !== (FE().gate?.post || 'map_table')) return;
      if (S.step !== 'gate') return;
      if (S.replay) {
        // the replay ends at the Map Table post (FIRST_EVENING.replay.endsAt 'gate')
        afterMurk(() => { clearTip(); sayMurk('murkReplay'); afterMurk(() => finish(true)); });
        return;
      }
      afterMurk(() => { if (S.step === 'gate') go('plan'); });
    });
  }
  function onScreen({ id, open }) {
    if ((id === 'firstOuting' || id === 'setOut') && open === false && S.step === 'plan') { S.closeGrace = 0.2; return; }
    if (id !== 'journal' && id !== 'log') return;
    if (S.step !== 'odds') return;
    if (open) { S.logOpen = true; S.logOpened = true; beat('logGlow', { on: false }); } else S.logOpen = false;
  }

  // ------------------------------------------------------------------ api
  const api = {
    get step() { return S.step; },
    get replay() { return S.replay; },
    /** True while a replay runs: makeFish / measure, the save and challenges must write nothing (main restores meta at the end). */
    get sandbox() { return S.active && S.replay; },
    get losses() { return S.losses; },
    get skipConfirm() { return S.skipArmed > 0; },
    /** The framing's clock (render's `prologue` keyframes, FIRST_EVENING.shot) while the framing runs, else null. */
    get shotT() { return S.active && S.step === 'framing' ? S.t : null; },
    get murkLine() { return S.murk ? { ...S.murk } : null; },
    get tip() { return S.tip; },
    isActive: () => S.active,
    init() { wire(); },
    update,
    /** Begin on a save without meta.firstEvening.done (or Settings → Replay, or the legacy ribbon: replay = true). */
    start({ replay = false } = {}) {
      Object.assign(S, { active: true, replay: !!replay, losses: 0, skipped: false, doneFired: false, departing: false, departFallback: 0,
        fumbled: false, deferred: null, tutorialSet: false, skipArmed: 0, murk: null, lore: null, tip: null, pending: null, grade: null });
      if (!replay) writeMeta((fe) => { fe.done = false; fe.step = 'framing'; });
      go('framing');
    },
    /** Boot with meta.firstEvening.step set: before the catch → `cast` (Murk's wake line once more, no framing); after → `gate`. */
    resume() {
      const fe = ctx.state?.meta?.firstEvening;
      const steps = STEPS();
      const i = steps.indexOf(fe?.step), m = steps.indexOf('measure');
      Object.assign(S, { active: true, replay: false, losses: 0, skipped: !!fe?.skipped, doneFired: false, departing: false, departFallback: 0,
        fumbled: !!fe?.fumbled, deferred: fe?.deferred || null, tutorialSet: false, skipArmed: 0, murk: null, lore: null, tip: null, pending: null });
      call(() => ctx.player?.toMooring?.());
      if (i >= 0 && i >= m) go('gate');
      else go('wake', { resumed: true });
    },
    /** Two taps on the Skip word: jump to `plan`, meta.firstEvening.skipped = true, nothing granted. */
    skip() {
      if (!S.active || S.step === 'plan' || S.step === 'setout') return;
      S.skipped = true;
      S.skipArmed = 0;
      emit('firstEvening:skip', { confirm: false, done: true });
      writeMeta((fe) => { fe.skipped = true; });
      cancelLine('skip');
      setTutorial(false);
      clearMurk(); clearLore();
      call(() => ctx.player?.toPost?.());
      if (S.replay) { finish(true); return; }
      go('plan', { skipped: true });
    },
    /** The Skip word's tap: in `framing` the first tap skips the framing; every first tap arms "Skip the first evening?" for 2.5 s; a
     *  second tap inside it skips. Returns what it did ('framing' | 'armed' | 'skipped' | null). */
    skipWord() {
      if (!S.active || S.step === 'plan' || S.step === 'setout') return null;
      if (S.skipArmed > 0) { api.skip(); return 'skipped'; }
      S.skipArmed = num(FE().skip?.confirmSec, 2.5);
      emit('firstEvening:skip', { confirm: true, text: T().skipConfirm || 'Skip the first evening?' });
      if (S.step === 'framing') { clearLore(); go('wake'); return 'framing'; }
      return 'armed';
    },
    /** A tap (or Esc / Enter) while a lore line or the wake is up: hurry the line / skip the wake's animation (never Murk's line). */
    hurry() {
      if (!S.active) return false;
      if (S.step === 'framing') {
        const sched = S.lastShot || loreSchedule(FE());
        const next = sched.find((x) => x.at > S.t + 1e-6);
        if (next) { S.t = next.at; return true; }
        S.t = Math.max(S.t, num(FE().stepSec?.framing, 9)); return true;
      }
      if (S.step === 'wake' && !S.wakeMurkStarted) { S.t = Math.max(S.t, num(FE().stepMurk?.wake?.at, 1.2)); return true; }
      return false;
    },
    /** game.planSetOut from the First Outing card (CONTRACT §13.1): Set Out. */
    onPlan() {
      if (!S.active || S.step !== 'plan') return false;
      S.closeGrace = 0;
      emit('firstEvening:card', { open: false, confirmed: true });
      go('setout');
      return true;
    },
    /** The First Outing card closed without Set Out: back to `gate`. */
    onCardClosed() {
      if (!S.active || S.step !== 'plan') return false;
      emit('firstEvening:card', { open: false, confirmed: false });
      go('gate', { quiet: true });
      return true;
    },
    /** Stop without finishing (to the title, a wipe): meta.firstEvening.step stays saved, so the next Begin resumes. */
    stop() {
      if (!S.active) return;
      clearTip(); clearMurk(); clearLore();
      setTutorial(false);
      S.active = false; S.step = null; S.pending = null; S.departing = false;
      if (S.replay) { S.replay = false; }
    },
    /** Only the current step's tip passes while active (ui asks before any tip). */
    allowsTip(tipId) {
      if (!S.active) return true;
      return !!tipId && tipId === S.tip;
    },
    /** The world takes no tap while the framing, the wake or the departure play, or while Murk speaks between actions. */
    locksInput() {
      if (!S.active) return false;
      if (S.step === 'framing' || S.step === 'wake' || S.step === 'setout' || S.step === 'plan') return true;
      return !!S.pending || (murkUp() && (S.step === 'cast' || S.step === 'wait' || S.step === 'odds'));
    },
    /** No sailing in the framing, the wake, on the card or in the departure (the gate step is where the raft is sailed). */
    locksMovement() {
      if (!S.active) return false;
      return S.step === 'framing' || S.step === 'wake' || S.step === 'plan' || S.step === 'setout';
    },
    get state() {
      return { active: S.active, replay: S.replay, step: S.step, t: +S.t.toFixed(3), clock: +S.clock.toFixed(3), losses: S.losses, skipped: S.skipped,
        murk: S.murk ? { key: S.murk.key, left: +(S.murk.hold - S.murk.t).toFixed(2) } : null, lore: S.lore?.key || null, tip: S.tip,
        pending: !!S.pending, skipArmed: +S.skipArmed.toFixed(2), grade: S.grade, fumbled: S.fumbled, deferred: S.deferred, departing: S.departing };
    },
    /** Debug (CONTRACT §13.11 firstEvening(step | 'reset' | 'done')): jump to a step, reset the save flag, or mark it done. */
    debugJump(step) {
      if (step === 'reset') { const m = ctx.state?.meta; if (m) delete m.firstEvening; S.active = false; S.step = null; return true; }
      if (step === 'done') { writeMeta((fe) => { fe.done = true; fe.step = null; }); S.active = false; S.step = null; return true; }
      if (!STEPS().includes(step)) return false;
      if (!S.active) Object.assign(S, { active: true, replay: false, losses: 0, skipped: false, doneFired: false, murk: null, lore: null, tip: null, pending: null });
      go(step);
      return true;
    },
    /** Debug: set the loss count (firstEveningLosses(n)). */
    setLosses(n) { S.losses = Math.max(0, n | 0); return S.losses; },
  };

  // ------------------------------------------------------------------ after the First Evening: the deferred lessons and directed tips
  bus.on('fishing:bite', () => {
    if (S.active) return;
    const run = ctx.state?.run, fe = ctx.state?.meta?.firstEvening;
    if (!run || !fe || ctx.flow !== 'playing') return;
    if (fe.legacy && !fe.changedTip) { fe.changedTip = true; emit('tip:show', { id: FE().legacy?.firstBiteTip || 'af_changed' }); }
    if (fe.fumbled && !fe.reminded) { fe.reminded = true; emit('tip:show', { id: 'af_strikeReminder' }); }
  });
  bus.on('merchant:arrive', () => {
    if (S.active) return;
    const fe = ctx.state?.meta?.firstEvening;
    if (!fe?.deferred?.odds || !ctx.state?.run) return;
    fe.deferred.odds = false;
    sayMurkAfterDone('murkOdds');
  });
  bus.on('fish:measured', ({ cove } = {}) => {
    if (S.active || cove) return;
    const fe = ctx.state?.meta?.firstEvening;
    if (!fe?.deferred?.measure || !ctx.state?.run) return;
    fe.deferred.measure = false;
    emit('firstEvening:beat', { id: 'deferredMeasure', step: null });
  });
  function sayMurkAfterDone(key) {
    const tx = T()[key] || '';
    emit('firstEvening:line', { kind: 'murk', key, text: tx, hold: murkHold(tx, FE().lines), deferred: true });
  }

  return api;
}
