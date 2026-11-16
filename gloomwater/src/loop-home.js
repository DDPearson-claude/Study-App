// loop-home.js — the Full Hold's flow around the water (docs/loop/slice-1a/PLAN.md §2.2 items 3–7, 20; §3.5, §5.1; lane B).
// main.js owns the game loop and the flows; this is the part of it the loop adds, written as a factory over the few things it needs
// so node can drive it with a fake player and a fake clock (tools/tests/loop-evening.test.mjs: T63, T64, T66, the skips):
//   enterHome(from, tally)   flow `home`, the Jetty: the sail home (from a trip), the film's hand-off (from 'intro'), Start with no
//                            film ('new'), the title's Continue ('title'); every `from` begins a missing tutorial; then home:enter
//   startTrip(opts)          a trip: progression's loop creates it; zone:change {prev: null, sail: true}; run:start; the raft put back
//                            where the glide out ended (opts.at)
//   endTripHome(cause)       game.endRun under the loop: only 'home'; endTrip pays and saves before anything moves; then home
//   sail(plan)               the Chart's Sail: the tutorial's done saved, the screens closed, the 3 s glide out, then startTrip
//   beginIntro(opts)         New Descent's Start: the Wick, then the film (main's startIntro) or the Jetty with no film
//   canGoHome / goHome       the Home pill and the pause's Home
//   skipHomeGlide()          a tap or a skip key: the running home glide ends at its end and what follows runs at once
// Every neighbour is read through optional chaining (PLAN §3's stub rule): an absent one means the built behaviour, never a throw.
import { tripEndAllowed, tripStartAllowed, goHomeAllowed, filmAllowed, homeGlidePath, glideInPath } from './loop-rules.js';

const numOr = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

/**
 * deps: {ctx, data, report(where, err), setFlow(flow), resetBeats(), showLake(id), save(), savedRun: {get(), set(run)},
 *        hasSavedRun(), lockRunMode(run, mode), startIntro(opts) → bool, introOn() → {intro, debug, optIn}, lake (the first lake)}
 */
export function createLoopHome(deps) {
  const { ctx, data, report = () => {}, setFlow, resetBeats = () => {}, showLake = () => {}, save = () => {}, savedRun, hasSavedRun,
    lockRunMode = () => {}, startIntro = () => false, introOn = () => ({ intro: false, debug: false, optIn: false }) } = deps;
  const LAKE = deps.lake || 'mossmere';
  const LOOPD = data?.LOOP || {};
  const TUT = LOOPD.tutorial || {};
  const safe = (fn, d = null) => { try { const v = fn(); return v === undefined || (v && v.isStub) ? d : v; } catch (e) { report('loop home', e); return d; } };
  const real = (m) => !!m && !m.isStub;
  /** progression's loop API (null before lane A wires it). */
  function loopApi() {
    const p = ctx.progression;
    if (!real(p)) return null;
    const l = p.loop;
    return l && typeof l === 'object' && !l.isStub ? l : null;
  }
  const S = { glide: null, sailing: false };   // never saved: a reload during a glide is a reload at the Jetty
  /** The Jetty's dock (CHOICE 44: home is always docks[0]) as {position: {x, z}, yaw}, or null without a world. */
  function dockAt(i = 0) {
    const ds = safe(() => ctx.world?.getDocks?.(), null);
    const d = Array.isArray(ds) ? ds[i] : null;
    return d?.position && Number.isFinite(d.position.x) ? { position: { x: d.position.x, z: d.position.z }, yaw: numOr(d.yaw, 0) } : null;
  }
  function teleport(p, yaw) { if (p) { try { ctx.player?.teleport?.(p, numOr(yaw, 0)); } catch (e) { report('player.teleport', e); } } }
  function teleportHome() { const d = dockAt(); if (d) teleport(d.position, d.yaw); }
  /** The water's mooring (M1 step 5a, SPEC §6.5: world.getMooring(), data.loopMooring on its docks), or null. */
  const mooring = () => safe(() => ctx.world?.getMooring?.(), null);
  /** Murk's barge moored at the Jetty: the mooring's murk slot (moored mode: lamp dark, no turning); else the next dock, else beside
   *  the first (R10). */
  function moorMurk() {
    const M = mooring(), V = ctx.THREE?.Vector3;
    if (M?.murk && typeof ctx.actors?.merchant?.moor === 'function') {
      const pos = V ? new V(M.murk.x, 0, M.murk.z) : { x: M.murk.x, y: 0, z: M.murk.z };
      try { ctx.actors.merchant.moor(pos, M.murk.yaw, { zone: M.water }); } catch (e) { report('merchant.moor', e); }
      return;
    }
    const d1 = dockAt(1), d0 = dockAt();
    const m = d1 || (d0 ? { position: { x: d0.position.x + 6 * Math.cos(d0.yaw), z: d0.position.z - 6 * Math.sin(d0.yaw) }, yaw: d0.yaw } : null);
    if (!m) return;
    const pos = V ? new V(m.position.x, 0, m.position.z) : { x: m.position.x, y: 0, z: m.position.z };
    try { ctx.actors?.merchant?.arrive?.(pos, m.yaw, { instant: true }); } catch (e) { report('merchant.arrive', e); }
  }
  function raftNow() { const p = ctx.player?.position; return p && Number.isFinite(p.x) ? { x: p.x, z: p.z } : null; }
  function closeScreens() { try { ctx.ui?.closeAll?.(); } catch (e) { report('ui.closeAll', e); } }
  /**
   * A loop glide in flow `home` (player.glide's `kind`: 'home' for the hand-off and the sail home, 'sailOut' for the glide out). At
   * its end, or a tap or a skip key, the raft snaps to the glide's end and `done` runs, in the same task.
   */
  function homeGlide(path, { duration, kind, to, yaw, done }) {
    const g = { kind, to, yaw, done, over: false };
    S.glide = g;
    const finish = () => {
      if (g.over) return;
      g.over = true;
      if (S.glide === g) S.glide = null;
      teleport(to, yaw);
      try { done?.(); } catch (e) { report(`home glide (${kind})`, e); }
    };
    let p = null;
    try { p = ctx.player?.glide?.(path, { duration, skippable: true, kind }); } catch (e) { report('player.glide', e); }
    if (p && typeof p.then === 'function') p.then(finish, finish);
    else finish();   // (no player glide in this build: the raft is put at the end at once)
    return g;
  }
  /** A tap, or a skip key with no screen up, during a home glide: the raft goes to the glide's end and what follows runs at once. */
  function skipHomeGlide() {
    const g = S.glide;
    if (!g) return false;
    try { ctx.player?.skipGlide?.(); } catch (e) { report('player.skipGlide', e); }
    teleport(g.to, g.yaw);   // (teleport also ends the glide; the glide's promise then runs what follows)
    return true;
  }

  /** Flow `home`, the Jetty (PLAN §2.2 item 7). */
  function enterHome(from = 'title', tally = null) {
    const start = raftNow();
    resetBeats();
    ctx.state.run = null;
    ctx.paused = false;
    S.sailing = false;
    if (S.glide) { S.glide.over = true; S.glide = null; }
    closeScreens();
    const L = loopApi();
    if (L?.tutorial?.()?.done !== true) { try { L?.beginTutorial?.(); } catch (e) { report('loop.beginTutorial', e); } }
    if (from === 'new' || from === 'title') {
      const ml = ctx.state.meta?.loop;
      showLake(from === 'new' ? LAKE : (ml?.lastTrip?.zone ?? ml?.maps?.lakes?.[0] ?? LAKE));
    }
    setFlow('home');
    const dock = dockAt();
    const arrive = ({ moored = false } = {}) => {
      if (!moored) moorMurk();
      ctx.bus.emit('home:enter', { from, tally });
      save();
    };
    if (from === 'trip') {
      // the sail home: 2 s toward the Jetty; the clams were paid and saved before it started. With the home barge (M1 step 5a) the
      // glide ends at its stern, the raft's tie-up (docks[0]): straight in or through the mooring's lane, at most LOOP.barge.reach
      // m of it (a longer way begins that far out, the camera put there with the raft); the tally opens as it ties up
      const M = mooring();
      if (M && start) {
        const g = glideInPath(start, M, { reach: numOr(LOOPD.barge?.reach, 24), pad: raftPad(), obstacles: obstacleList() });
        if (g && g.len > 0.05) {
          if (g.cut) teleport({ x: g.path[0][0], z: g.path[0][1] }, headingOf(g.path));
          homeGlide(g.path, { duration: numOr(LOOPD.time?.home, 2), kind: 'home', to: M.raft, yaw: M.raft.yaw, done: () => arrive() });
          if (g.cut) snapCamera();   // (the sail framing on the raft where the glide begins: the glide is running, so not the home's)
        } else { teleportHome(); arrive(); }
        return true;
      }
      const path = dock && start ? homeGlidePath(start, dock.position, numOr(LOOPD.time?.raftSpeed, 6), 2) : null;
      if (path) homeGlide(path, { duration: 2, kind: 'home', to: dock.position, yaw: dock.yaw, done: () => arrive() });
      else { teleportHome(); arrive(); }
      return true;
    }
    if (from === 'intro') {
      // the hand-off (PLAN CHOICE 35): Murk moored and the save written at once (the seen film, the Wick and the tutorial reach the
      // disk before the glide), then 3 s from where the film left the raft to the first dock
      moorMurk();
      towed();
      save();
      const d = start && dock ? Math.hypot(dock.position.x - start.x, dock.position.z - start.z) : 0;
      // (the home barge: the glide in reaches the stern through the mooring's lane when the straight way crosses a hull)
      const M = mooring(), g = M && d > 0.05 ? glideInPath(start, M, { pad: raftPad(), obstacles: obstacleList() }) : null;
      const path = g && !g.cut ? g.path : [[start?.x, start?.z], [dock?.position.x, dock?.position.z]];
      if (d > 0.05) homeGlide(path, { duration: numOr(TUT.arrive, 3), kind: 'home', to: dock.position, yaw: dock.yaw, done: () => arrive({ moored: true }) });
      else { teleportHome(); arrive({ moored: true }); }
      return true;
    }
    if (from === 'new') towed();
    teleportHome();
    snapCamera();   // (no glide from the title: the Jetty on the cut)
    arrive();
    return true;
  }
  /** The opening's barge (M1 step 5a; step 5b's tow writes the same): the barge lies at the first water, its tow played. */
  function towed() { try { loopApi()?.towBarge?.(LAKE); } catch (e) { report('loop.towBarge', e); } }
  function snapCamera() { try { ctx.render?.snapCamera?.(); } catch (e) { report('render.snapCamera', e); } }
  const raftPad = () => numOr(data?.BALANCE?.move?.raftRadius, 1.6);
  const obstacleList = () => { const o = safe(() => ctx.world?.getObstacles?.(), null); return Array.isArray(o) ? o : null; };
  const headingOf = (P) => (P.length >= 2 ? Math.atan2(-(P[1][0] - P[0][0]), -(P[1][1] - P[0][1])) : 0);

  /** A trip (PLAN §2.2 item 3): the evening on the water, created by progression's loop; on failure the Wick stays home. */
  function startTrip(opts = {}) {
    if (!tripStartAllowed({ flow: ctx.flow, hasSavedTrip: hasSavedRun() })) {
      report('startTrip', new Error(`a trip starts only at home or the title (flow ${ctx.flow}, a saved trip: ${hasSavedRun()})`));
      return false;
    }
    // a saved non-trip descent is kept in meta.loop.parkedRun, never resumed under the loop (PLAN CHOICE 5)
    const waiting = savedRun.get();
    if (waiting && waiting.active && waiting.outing !== 'trip') { try { loopApi()?.parkRun?.(waiting); } catch (e) { report('loop.parkRun', e); } }
    resetBeats();
    let run = null;
    try {
      run = ctx.progression.createRun({ startZone: opts.water || LAKE, character: data.loopWickId(ctx.state.meta?.loop?.wick), nightMode: 'still', outing: 'trip' });
    } catch (e) { report('createRun', e); }
    if (!run || run.isStub || typeof run !== 'object') { report('startTrip', new Error('no trip was created; the Wick stays home')); return false; }
    lockRunMode(run, { nightMode: 'still', outing: 'trip' });   // (fills only what createTrip left out; never meta.runs, never lastCharacter)
    ctx.state.run = run;
    savedRun.set(null);
    ctx.paused = false;
    S.sailing = false; S.glide = null;
    // Murk stays moored beside the home barge through the evening (M1 step 5a: no merchant.leave; PLAN rev. 9's T29: no
    // merchant:arrive and no Trade pill on a trip); moored again before the Sail's zone:change, so nothing unmoors him
    moorMurk();
    closeScreens();
    setFlow('playing');
    // the lake is already on screen: render does not flash, audio plays `setout`, ui shows no banner (PLAN §3.6)
    ctx.bus.emit('zone:change', { zone: run.zone, prev: null, sail: true });
    ctx.bus.emit('run:start', { continued: false });
    // the player's run:start listener put the raft at the lake's spawn: back where the glide out ended, before any frame (R16)
    if (opts.at?.position) teleport(opts.at.position, opts.at.yaw);
    save();
    return true;
  }

  /** game.endRun under the loop (PLAN §2.2 item 5): only 'home' ends a trip; endTrip pays and saves before anything moves. */
  function endTripHome(cause) {
    if (!tripEndAllowed(cause)) { report('endRun', new Error('a trip ends only at home: ' + cause)); return false; }
    if (ctx.flow !== 'playing' || !ctx.state.run) return false;
    const run = ctx.state.run;
    let tally = null;
    const L = loopApi();
    try { tally = L?.endTrip?.() ?? null; } catch (e) { report('loop.endTrip', e); }
    if (!L && run.active !== false) run.active = false;   // (no loop in this build: the trip is not saved again)
    resetBeats();
    ctx.state.run = null;
    savedRun.set(null);
    ctx.bus.emit('run:end', { summary: null, cause: 'home' });
    enterHome('trip', tally && typeof tally === 'object' ? tally : null);
    return true;
  }

  /** New Descent's Start under the loop (PLAN §2.2 item 20, CHOICE 34): the chosen Wick, then the film, or the Jetty without one. */
  function beginIntro(opts = {}) {
    if (hasSavedRun() || ctx.flow !== 'title') return false;
    const id = data.loopWickId(opts.character);
    const L = loopApi();
    const wear = () => {
      try { L?.setWick?.(id); } catch (e) { report('loop.setWick', e); }
      try { ctx.actors?.setCharacter?.(id); } catch (e) { report('actors.setCharacter', e); }
    };
    wear();
    if (filmAllowed(introOn()) && startIntro({ replay: false, reduced: opts.reduced })) return true;
    wear();   // (a film that could not start went back through main's leaveIntro, which forgets a first film's Wick)
    closeScreens();
    enterHome('new');
    return true;
  }

  /** The Chart's Sail (PLAN §2.2 item 4, CHOICE 38): the tutorial's done saved first, the screens closed, the 3 s glide out, the trip. */
  function sail(plan = {}) {
    if (S.sailing) return false;
    if (!tripStartAllowed({ flow: ctx.flow, hasSavedTrip: hasSavedRun() })) return false;
    const water = (plan && typeof plan.water === 'string' && plan.water) || LAKE;
    const L = loopApi();
    if (L?.isOpen?.(water) === false) return false;   // (v8: only an open water; in 1a only the Mossmere, always open)
    if (L?.tutorial?.()?.done !== true) { try { L?.tutorialDone?.(); } catch (e) { report('loop.tutorialDone', e); } }
    closeScreens();   // (a blocking Chart would freeze the glide, R17)
    if (ctx.flow !== 'home') { showLake(water); resetBeats(); ctx.state.run = null; ctx.paused = false; setFlow('home'); teleportHome(); }
    const dock = dockAt(), at = raftNow();
    const g = data.sailPlan(dock ? dock.position : at, { x: 0, z: 0 }, TUT, water);
    S.sailing = true;
    const go = () => {
      if (!S.sailing) return;
      S.sailing = false;
      if (!startTrip({ water, at: { position: g.to, yaw: g.yaw } })) teleportHome();   // (no trip: back at the dock, still home)
    };
    homeGlide(g.path, { duration: numOr(TUT.out, 3), kind: 'sailOut', to: g.to, yaw: g.yaw, done: go });
    return true;
  }

  /** May the player go home now? → {ok, why} (PLAN §2.2 item 6; loop-rules.goHomeAllowed). */
  function canGoHome({ fromPause = false } = {}) {
    const f = ctx.fishing, fs = safe(() => f?.state, 'idle') || 'idle';
    return goHomeAllowed({
      flow: ctx.flow, outing: ctx.state.run?.outing ?? null, paused: ctx.paused === true, fromPause: fromPause === true, cinematic: ctx.cinematic === true,
      inShow: safe(() => f?.inShow, false) === true, fishingState: fs, blocking: safe(() => ctx.ui?.isBlocking?.(), false) === true,
      cardOpen: safe(() => ctx.ui?.isCatchOpen?.(), false) === true, notePending: fs === 'lost' && safe(() => f?.isAnchored?.(), false) === true,
    });
  }
  /** Home: a line in the water is reeled in (nothing spent: no bite has fired, PLAN CHOICE 4), then the trip ends. */
  function goHome({ fromPause = false } = {}) {
    if (!canGoHome({ fromPause }).ok) return false;
    const fs = safe(() => ctx.fishing?.state, 'idle');
    if (fs === 'charging' || fs === 'casting' || fs === 'waiting') { try { ctx.fishing?.cancel?.('home'); } catch (e) { report('fishing.cancel', e); } }
    if (fromPause) ctx.paused = false;
    return endTripHome('home');
  }

  return {
    enterHome, startTrip, endTripHome, beginIntro, sail, canGoHome, goHome, skipHomeGlide, loopApi, moorMurk,
    /** A home glide is running: its kind ('home' | 'sailOut') or null. */
    gliding: () => (S.glide ? S.glide.kind : null),
    get sailing() { return S.sailing; },
  };
}
