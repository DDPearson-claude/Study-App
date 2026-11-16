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
// M1 step 3a (docs/loop/m1-step3a/PLAN.md §2.2 items 5–6, PLAN CHOICEs 7, 8, 24; T128, T129):
//   the lift                 at a trip's start (never a Continue), each owned place whose mist has not lifted (loop.liftDue(), price
//                            order) in turn: ctx.cinematic on, place:lift {placeId, phase: 'start', name}, world.liftMist(id, 3),
//                            render.frameLandmark(landmark, {dur, back}); at 3 s {phase: 'title'}; at 4.2 s {phase: 'end'},
//                            loop.markLifted(id), the places synced; cinematic off after the last. update(dt) runs its clock (main's
//                            frame); skipLift() (a tap or a skip key) ends the running one at once; reduced motion skips the thinning
//   the places               world.setPlaces({owned, lifted}) at run:start, home:enter and after a buy (loop:buy)
//   sail({water, place})     the pick saved (loop.setPick); the glide out heads for an owned place's centre (sailPlan toward it);
//                            with no `place` the Chart's saved pick of that water; open water keeps 1a's authored glide
// Every neighbour is read through optional chaining (PLAN §3's stub rule): an absent one means the built behaviour, never a throw.
import { tripEndAllowed, tripStartAllowed, goHomeAllowed, filmAllowed, homeGlidePath, placeGlide } from './loop-rules.js';

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
  const S = { glide: null, sailing: false, lift: null };   // never saved: a reload during a glide is a reload at the Jetty (a lift
  // is marked only at its end, so a reload mid-lift plays it again on the next trip: T112)
  const LIFT = { thin: numOr(LOOPD.lift?.thin, 3), title: numOr(LOOPD.lift?.title, 1.2), back: numOr(LOOPD.lift?.back, 0.6) };
  const reducedMotion = typeof deps.reduced === 'function' ? deps.reduced : () => {
    if (ctx.state?.meta?.settings?.reducedMotion === true) return true;
    try { return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true; } catch { return false; }
  };
  const emit = (e, p) => { try { ctx.bus?.emit?.(e, p); } catch (err) { report(`emit ${e}`, err); } };
  /** The Jetty's dock (CHOICE 44: home is always docks[0]) as {position: {x, z}, yaw}, or null without a world. */
  function dockAt(i = 0) {
    const ds = safe(() => ctx.world?.getDocks?.(), null);
    const d = Array.isArray(ds) ? ds[i] : null;
    return d?.position && Number.isFinite(d.position.x) ? { position: { x: d.position.x, z: d.position.z }, yaw: numOr(d.yaw, 0) } : null;
  }
  function teleport(p, yaw) { if (p) { try { ctx.player?.teleport?.(p, numOr(yaw, 0)); } catch (e) { report('player.teleport', e); } } }
  function teleportHome() { const d = dockAt(); if (d) teleport(d.position, d.yaw); }
  /** Murk's barge moored at the Jetty: the next dock, else beside the first (R10). */
  function moorMurk() {
    const d1 = dockAt(1), d0 = dockAt();
    const m = d1 || (d0 ? { position: { x: d0.position.x + 6 * Math.cos(d0.yaw), z: d0.position.z - 6 * Math.sin(d0.yaw) }, yaw: d0.yaw } : null);
    if (!m) return;
    const V = ctx.THREE?.Vector3;
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

  // ---------------------------------------------------------------- M1 step 3a: the places and their lift
  /** A loop place ({id, name, x, z, landmark, area, kind, …}: data.loopPlace), or null. */
  const placeOf = (id) => safe(() => data.loopPlace?.(id), null);
  /** The ledger's places as plain arrays: {owned, lifted}. */
  function placesNow() {
    const L = loopApi();
    const ml = safe(() => L?.state?.(), null);
    const owned = Array.isArray(ml?.maps?.places) ? ml.maps.places.slice() : [];
    const lf = safe(() => L?.lifted?.(), null);
    const lifted = Array.isArray(lf) ? lf.slice() : Array.isArray(ml?.lifted) ? ml.lifted.slice() : [];
    return { owned, lifted };
  }
  /** world.setPlaces({owned, lifted}): the banks over what is not lifted, each place's dressing lit once it is. */
  function syncPlaces() {
    const p = placesNow();
    try { ctx.world?.setPlaces?.(p); } catch (e) { report('world.setPlaces', e); }
    return p;
  }
  if (ctx.bus?.on) {
    ctx.bus.on('run:start', () => syncPlaces());
    ctx.bus.on('home:enter', () => { S.lift = null; syncPlaces(); });
    ctx.bus.on('loop:buy', () => syncPlaces());
  }
  /** Where the lift's shot looks: world.placeAnchor(id), else the place's landmark, else its centre. */
  function landmarkOf(id) {
    const a = safe(() => ctx.world?.placeAnchor?.(id), null);
    if (a && Number.isFinite(a.x) && Number.isFinite(a.z)) return { x: a.x, y: numOr(a.y, 0), z: a.z };
    const p = placeOf(id), m = p?.landmark;
    if (m && Number.isFinite(m.x)) return { x: m.x, y: numOr(m.y, 0), z: m.z };
    return p && Number.isFinite(p.x) ? { x: p.x, y: 0, z: p.z } : null;
  }
  /** The lifts due at a trip's start (loop.liftDue(): owned, not lifted, in price order), one after another. → whether one began. */
  function beginLifts(ids = null) {
    if (ctx.flow !== 'playing' || ctx.state.run?.outing !== 'trip') return false;
    const due = Array.isArray(ids) ? ids : safe(() => loopApi()?.liftDue?.(), []);
    const q = (Array.isArray(due) ? due : []).filter((id, i, a) => typeof id === 'string' && a.indexOf(id) === i && !!placeOf(id));
    if (!q.length) return false;
    if (S.lift) { for (const id of q) if (S.lift.cur?.id !== id && !S.lift.queue.includes(id)) S.lift.queue.push(id); return true; }
    S.lift = { queue: q, cur: null };
    nextLift();
    return true;
  }
  function nextLift() {
    const L = S.lift;
    const id = L?.queue.shift();
    if (!id) { endLifts(); return; }
    const reduced = reducedMotion() === true;
    const c = { id, name: placeOf(id)?.name ?? id, t: 0, phase: 'start', thin: reduced ? 0 : LIFT.thin, reduced };
    L.cur = c;
    ctx.cinematic = false; ctx.cinematic = true;   // (each lift a fresh valve; the evening's clock stands still, T14's rule)
    emit('place:lift', { placeId: id, phase: 'start', name: c.name });
    try { ctx.world?.liftMist?.(id, c.thin); } catch (e) { report('world.liftMist', e); }
    const p = landmarkOf(id);
    if (p) { try { ctx.render?.frameLandmark?.(p, { dur: c.thin + LIFT.title, back: LIFT.back }); } catch (e) { report('render.frameLandmark', e); } }
    if (c.thin <= 0) toTitle(c);   // reduced motion: no thinning, the title still shows
  }
  function toTitle(c) { c.phase = 'title'; emit('place:lift', { placeId: c.id, phase: 'title', name: c.name }); }
  /** The running lift's end: {phase: 'end'}, markLifted (written only now: a reload mid-lift replays it), the places synced. */
  function endLift(skipped = false) {
    const c = S.lift?.cur;
    if (!c) return;
    S.lift.cur = null;
    if (skipped) {   // a tap or a skip key: the bank gone at once and the camera back
      try { ctx.world?.liftMist?.(c.id, 0); } catch (e) { report('world.liftMist', e); }
      try { ctx.render?.frameLandmark?.(null, { back: LIFT.back }); } catch (e) { report('render.frameLandmark', e); }
    }
    c.phase = 'end';
    emit('place:lift', { placeId: c.id, phase: 'end', name: c.name });
    try { loopApi()?.markLifted?.(c.id); } catch (e) { report('loop.markLifted', e); }
    syncPlaces();
    if (S.lift?.queue.length) nextLift(); else endLifts();
  }
  function endLifts() { S.lift = null; ctx.cinematic = false; }
  /** The lift's clock (main's frame, real seconds while the game runs). */
  function update(dt) {
    const c = S.lift?.cur;
    if (!c) return;
    if (ctx.flow !== 'playing' || !ctx.state.run) { S.lift = null; return; }   // (a lift never outlives its trip)
    if (ctx.paused || !(dt > 0)) return;
    c.t += Math.min(dt, 0.25);
    if (c.phase === 'start' && c.t >= c.thin) toTitle(c);
    if (c.phase === 'title' && c.t >= c.thin + LIFT.title) endLift(false);
  }
  /** A tap or a skip key during a lift: it ends at once (marked); the next due one follows. */
  function skipLift() { if (!S.lift?.cur) return false; endLift(true); return true; }

  /** Flow `home`, the Jetty (PLAN §2.2 item 7). */
  function enterHome(from = 'title', tally = null) {
    const start = raftNow();
    resetBeats();
    ctx.state.run = null;
    ctx.paused = false;
    S.sailing = false;
    S.lift = null;
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
      // the sail home: 2 s of raft speed toward the Jetty's dock; the clams were paid and saved before it started (R3: the snap to
      // the dock lands in the task that opens the tally)
      const path = dock && start ? homeGlidePath(start, dock.position, numOr(LOOPD.time?.raftSpeed, 6), 2) : null;
      if (path) homeGlide(path, { duration: 2, kind: 'home', to: dock.position, yaw: dock.yaw, done: () => arrive() });
      else { teleportHome(); arrive(); }
      return true;
    }
    if (from === 'intro') {
      // the hand-off (PLAN CHOICE 35): Murk moored and the save written at once (the seen film, the Wick and the tutorial reach the
      // disk before the glide), then 3 s from where the film left the raft to the first dock
      moorMurk();
      save();
      const d = start && dock ? Math.hypot(dock.position.x - start.x, dock.position.z - start.z) : 0;
      if (d > 0.05) homeGlide([[start.x, start.z], [dock.position.x, dock.position.z]], { duration: numOr(TUT.arrive, 3), kind: 'home', to: dock.position, yaw: dock.yaw, done: () => arrive({ moored: true }) });
      else { teleportHome(); arrive({ moored: true }); }
      return true;
    }
    teleportHome();
    try { ctx.render?.snapCamera?.(); } catch (e) { report('render.snapCamera', e); }   // (no glide from the title: the Jetty on the cut)
    arrive();
    return true;
  }

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
    // Murk stays home (M1 step 5 drops this line: his barge is moored beside the home barge, PLAN rev. 9)
    try { ctx.actors?.merchant?.leave?.({ instant: true }); } catch (e) { report('merchant.leave', e); }
    closeScreens();
    setFlow('playing');
    // the lake is already on screen: render does not flash, audio plays `setout`, ui shows no banner (PLAN §3.6)
    ctx.bus.emit('zone:change', { zone: run.zone, prev: null, sail: true });
    ctx.bus.emit('run:start', { continued: false });
    // the player's run:start listener put the raft at the lake's spawn: back where the glide out ended, before any frame (R16)
    if (opts.at?.position) teleport(opts.at.position, opts.at.yaw);
    save();
    beginLifts();   // M1 step 3a: the mist lifts over each place bought since the last evening (PLAN CHOICE 8)
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
    // M1 step 3a (PLAN CHOICE 7): Sail toward a place. `place` given (a string, or null for open water) is saved as the pick; with no
    // `place` the Chart's saved pick of this water is read. An owned place's glide heads for its centre (sailPlan toward it); open
    // water keeps 1a's authored glide (T66)
    const given = !!plan && typeof plan === 'object' && Object.prototype.hasOwnProperty.call(plan, 'place');
    let place = given ? plan.place : null;
    if (!given) { const pk = safe(() => L?.pick?.(), null); if (pk && pk.water === water) place = pk.place; }
    if (typeof place !== 'string' || !place) place = null;
    if (given) safe(() => L?.setPick?.({ water, place }), null);
    const owned = !!place && (safe(() => L?.state?.()?.maps?.places, null) || []).includes(place);
    const P = owned ? placeOf(place) : null;
    const dock = dockAt(), at = raftNow(), from = dock ? dock.position : at;
    // (toward a place: its bearing turned the least that keeps the glide clear of every obstacle; none clear: open water's glide)
    const obstacles = safe(() => ctx.world?.getObstacles?.(), null);
    const clear = numOr(data.BALANCE?.move?.raftRadius, 1.6) + 0.3;
    const gp = P && Number.isFinite(P.x) && from ? placeGlide(data.sailPlan, from, { x: P.x, z: P.z }, TUT, Array.isArray(obstacles) ? obstacles : [], { clear }) : null;
    const g = gp || data.sailPlan(from, { x: 0, z: 0 }, TUT, water);
    S.sailPlace = gp ? place : null;
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
    enterHome, startTrip, endTripHome, beginIntro, sail, canGoHome, goHome, skipHomeGlide, loopApi,
    /** A home glide is running: its kind ('home' | 'sailOut') or null. */
    gliding: () => (S.glide ? S.glide.kind : null),
    get sailing() { return S.sailing; },
    // M1 step 3a
    update, skipLift, syncPlaces, placesNow,
    /** Play the lifts of these places now (a trip only; the debug hook's): → whether one began or was queued. */
    beginLifts: (ids) => beginLifts(ids),
    /** The place whose lift is playing, or null (game.lifting()). */
    lifting: () => S.lift?.cur?.id ?? null,
    /** The running lift's readout {placeId, phase, t, queue} (debug), or null. */
    liftState: () => (S.lift?.cur ? { placeId: S.lift.cur.id, phase: S.lift.cur.phase, t: Math.round(S.lift.cur.t * 100) / 100, queue: S.lift.queue.slice() } : null),
    /** The place the last Sail headed for (null: open water). */
    get sailPlace() { return S.sailPlace ?? null; },
  };
}
