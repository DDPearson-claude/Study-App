// M1 step 3a in the browser (docs/loop/m1-step3a/PLAN.md T149; lane D owns this file): the places, the giants, the legend and the
// Mossmere's catalogue on a loop dev build, from a seeded save (the step-2 fixture: Hold 5, T1, clams), on whichever Chart the build draws
// (on M+3a the list; once 3b is in, the drawn Chart, and the same walk again with the art forced off through ctx.debug.ui.chartList).
//
//   node build.mjs --dev --out=tools/out/m1-s3a/loop.html
//   node tools/playtest.mjs --html=tools/out/m1-s3a/loop.html --shots=tools/out/m1-s3a/desktop --script=tools/tests/loop-3a.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/m1-s3a/loop.html --shots=tools/out/m1-s3a/phone --script=tools/tests/loop-3a.scenario.mjs --mobile
//   node tools/tests/loop-3a.scenario.mjs   (no browser) dry-runs the pure helpers on the loop data and exits non-zero on a fault
// Options: --charts=drawn,list (the Charts to walk; default: the drawn one when 3b is in, then the list) --noshots --quality=low|medium|high
//
// THE WALK (T149): the Chart's places → buy the Lily Maze from its card → Sail toward it → its lift (the bank thins, the title card) → a
// cast into the Buoy Lights' bank (nothing spent) → home → the other maps and two balls → fit one on the foot's [data-slot=bait] → Sail to
// the Bell Pool by day → her sure bite → her card Keep · 500 → home: the tally pays 500, Murk's line → a forced Thousandcast at Under the
// Span at dusk → the gold card → the catalogue (the head, all 17, no %, the hatch probe) → Hold 6 and the two-row hold on the phone; a DOM
// scan of the HUD, the strike, the play and the show finds no % and no size before the card (SPEC decision 62); no console error; after
// every Sail debug.ui().stack is empty.
//
// THE HELPER (PLAN §2.4 item 6). On D's own branch nothing calls world.setPlaces or liftMist (main.js is lane B's), so `places` drives D's
// APIs directly in debug builds (window.__gw.world.setPlaces / liftMist / placeAnchor, window.__gw.render.frameLandmark, ctx.player.teleport,
// the built ctx.debug.setPhase); it switches to B's ctx.debug.loop.own / lift / at whenever they are present, so the stage's run needs no
// edit. A neighbour that is absent (lane C's Chart rows, bait slot, catalogue; lane B's mist cast) fails its check with a note; it never
// throws. Time is driven by loop-1a's synthetic clock (makeKit): nothing is judged on wall-clock playback.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { makeKit, Abort } from './loop-1a.scenario.mjs';

const here = dirname(fileURLToPath(import.meta.url));
export const SAVE_FIXTURE = resolve(here, 'fixtures/loop-save-m1s2.json');
export const PLACE_IDS = ['lily_maze', 'under_the_span', 'buoy_lights', 'bell_pool'];

// ================================================================== pure helpers (node; the dry run checks them)
/** The step-2 save (the fixture), with `over` merged into meta.loop (deep for maps, bait, fitted) and the hold set. */
export function seededSave({ clams = null, holdSlots = null, own = null, lifted = null, balls = 0, over = {} } = {}) {
  const sv = JSON.parse(readFileSync(SAVE_FIXTURE, 'utf8'));
  const L = sv.meta.loop;
  if (clams !== null) L.clams = clams;
  if (holdSlots !== null) L.holdSlots = holdSlots;
  if (own) L.maps = { ...(L.maps || {}), places: own.slice() };
  if (lifted) L.lifted = lifted.slice();
  if (balls > 0) L.bait = { ...(L.bait || {}), mossmere: { ...(L.bait?.mossmere || {}), heartmoss: balls } };
  Object.assign(L, over);
  sv.run = null;
  return sv;
}
/** A raft pose that looks at a place from the south (the play camera's fixed yaw looks north): `back` m south of its footprint's middle. */
export function poseSouthOf(place, back = 12, dx = 0) {
  const a = place?.area;
  if (!a) return null;
  const c = a.kind === 'path' ? { x: (a.pts[0][0] + a.pts[a.pts.length - 1][0]) / 2, z: (a.pts[0][1] + a.pts[a.pts.length - 1][1]) / 2 } : { x: a.x, z: a.z };
  const half = a.kind === 'disc' ? a.r : a.kind === 'rect' ? a.d / 2 : a.w / 2 + Math.abs(a.pts[0][1] - a.pts[a.pts.length - 1][1]) / 2;
  return { x: c.x + dx, z: c.z + half + back, yaw: 0 };
}
/** A text holds a percentage (a digit then %, or a lone %): T149's scan, SPEC decision 62's rule. */
export function hasPercent(s) { return /%/.test(String(s ?? '')); }
/** A size word or a weight before the card (decision 62): "lb", "pounds", "Small" … "Elder" are the card's, never the strike's or the play's. */
export function hasSize(s, classes = ['Small', 'Keeper', 'Prize', 'Trophy', 'Elder', 'Ancient']) {
  const t = String(s ?? '');
  return /\d\s*(lb|lbs|pounds|kg|cm|in)\b/i.test(t) || classes.some((c) => new RegExp(`\\b${c}\\b`).test(t));
}

// ================================================================== the in-page places helper (installed as window.__p3)
/** Runs in the page: D's own APIs, or lane B's ctx.debug.loop hooks when present. Self-contained (serialised into the page). */
export function installPlaces() {
  const c = window.__gw;
  const B = () => (c.debug?.loop && typeof c.debug.loop.own === 'function' ? c.debug.loop : null);
  const ml = () => { try { return c.progression?.loop?.state?.() ?? c.state.meta.loop; } catch { return c.state.meta.loop; } };
  const ids = (id) => (id === 'all' ? Object.keys(c.data.LOOP?.places || {}) : [id]);
  const sync = () => { const m = ml(); try { c.world.setPlaces?.({ owned: (m?.maps?.places || []).slice(), lifted: (m?.lifted || []).slice() }); } catch { /* optional */ } };
  const P = {
    viaB: () => !!B(),
    /** own(id | 'all'): the place map owned (and saved), its bank still standing until its lift. */
    own(id = 'all') {
      if (B()) return B().own(id);
      const m = ml(); if (!m) return null;
      m.maps = m.maps || {}; m.maps.places = Array.isArray(m.maps.places) ? m.maps.places : [];
      for (const p of ids(id)) if (!m.maps.places.includes(p)) m.maps.places.push(p);
      sync();
      return m.maps.places.slice();
    },
    /** lift(id | 'all', {play}): the place's lift beat now (play), or lifted at once; marked lifted in the save. */
    lift(id = 'all', { play = true } = {}) {
      if (B()) return B().lift(id, { play });
      const m = ml(); if (!m) return null;
      P.own(id);
      m.lifted = Array.isArray(m.lifted) ? m.lifted : [];
      const L = c.data.LOOP?.lift || {};
      for (const p of ids(id)) {
        if (m.lifted.includes(p)) continue;
        m.lifted.push(p);
        try { c.world.liftMist?.(p, play ? (L.thin ?? 3) : 0); } catch { /* optional */ }
        if (play) { const a = c.world.placeAnchor?.(p); if (a) c.render.frameLandmark?.(a, { dur: (L.thin ?? 3) + (L.title ?? 1.2), back: L.back ?? 0.6 }); }
      }
      if (!play) sync();
      return { lifting: play ? ids(id)[0] : null, lifted: m.lifted.slice() };
    },
    /** Every place back under its bank (the save's lifted list emptied; owned kept). */
    unlift() { const m = ml(); if (m) m.lifted = []; sync(); return true; },
    /** at(id, {dx, dz, back, yaw}): the raft put at a pose: inside the place's water (its middle, offset dx / dz), or `back` m south of it. */
    at(id, { dx = 0, dz = 0, back = null, yaw = 0 } = {}) {
      const p = c.data.loopPlace?.(id);
      if (!p) return null;
      const a = p.area;
      const mid = a.kind === 'path' ? { x: (a.pts[0][0] + a.pts[a.pts.length - 1][0]) / 2, z: (a.pts[0][1] + a.pts[a.pts.length - 1][1]) / 2 } : { x: a.x, z: a.z };
      let pt = { x: mid.x + dx, z: mid.z + dz };
      if (back !== null) {
        const half = a.kind === 'disc' ? a.r : a.kind === 'rect' ? a.d / 2 : a.w / 2 + Math.abs(a.pts[0][1] - a.pts[a.pts.length - 1][1]) / 2;
        pt = { x: mid.x + dx, z: mid.z + half + back + dz };
        // (open water near that pose: a few metres either side, then a little nearer, until the raft fits)
        const open = (x, z) => { try { return c.world.isOpenWater?.(x, z, 2.4) !== false; } catch { return true; } };
        if (!open(pt.x, pt.z)) {
          let found = null;
          for (const bz of [0, -2, -4, 2, -6]) { for (const sx of [3, -3, 6, -6, 9, -9, 12, -12]) { if (open(pt.x + sx, pt.z + bz)) { found = { x: pt.x + sx, z: pt.z + bz }; break; } } if (found) break; }
          if (found) pt = found;
        }
      } else if (B() && dx === 0 && dz === 0) { const r = B().at(id); if (r) pt = r; }
      try { c.player.teleport?.(pt, yaw); } catch { /* optional */ }
      try { c.render.snapCamera?.(); } catch { /* optional */ }
      return pt;
    },
    /** A raft pose anywhere: {x, z, yaw}. */
    pose(x, z, yaw = 0) { try { c.player.teleport?.({ x, z }, yaw); c.render.snapCamera?.(); } catch { /* optional */ } return { x, z }; },
    /** The evening's light: phase ('calm' late day, 'dusk', 'gloomtide' night) at share k of it. */
    light(phase, k = 0.5) {
      const r = c.state.run; if (!r) return null;
      if (r.phase !== phase) c.debug.setPhase?.(phase);
      const info = c.survival.getPhaseInfo?.();
      if (info && info.duration > 0) r.phaseTime = info.duration * k;
      return r.phase;
    },
    /** A still camera pose laid over the rig (the cut scene's hook): {pos, look, fov} or null to release. */
    camera(p) { try { c.render.setIntroCamera?.(p ? { w: 1, ...p } : null); } catch { /* optional */ } return !!p; },
    /** The world's readout of the banks (ctx.debug.world.places), and B's when present. */
    readout() { return { world: c.debug.world?.places?.() ?? c.world.places?.() ?? null, loop: B()?.places?.() ?? null }; },
    /** Debug: a giant's back now in a place's bank. */
    back(id) { return c.debug.world?.giantBack?.(id) ?? false; },
  };
  window.__p3 = P;
  return 'ok';
}

/** The node-side kit for 3a: loop-1a's makeKit plus the save boot and the places helper. */
export function makeKit3a(api, { label = '3a' } = {}) {
  const K = makeKit(api, { label });
  const { evalGame: g } = api;
  K.p = (fn, arg) => g(fn, arg);
  K.places = {
    own: (id = 'all') => g((id) => window.__p3.own(id), id),
    lift: (id = 'all', o = {}) => g(([id, o]) => window.__p3.lift(id, o), [id, o]),
    unlift: () => g(() => window.__p3.unlift()),
    at: (id, o = {}) => g(([id, o]) => window.__p3.at(id, o), [id, o]),
    pose: (x, z, yaw = 0) => g(([x, z, y]) => window.__p3.pose(x, z, y), [x, z, yaw]),
    light: (phase, k = 0.5) => g(([p, k]) => window.__p3.light(p, k), [phase, k]),
    camera: (p) => g((p) => window.__p3.camera(p), p),
    readout: () => g(() => window.__p3.readout()),
    back: (id) => g((id) => window.__p3.back(id), id),
    viaB: () => g(() => window.__p3.viaB()),
  };
  const install0 = K.install;
  K.install = async () => { await install0(); await api.page.evaluate(`(${installPlaces.toString()})()`); };
  /** Boot the loop page on a seeded save (the fixture, tweaked): the fresh page, the save written, a reload, the title. */
  K.boot = async (save, { query = '' } = {}) => {
    await K.load({ fresh: true, query });
    await g((sv) => { const c = window.__gw; c.game.save = () => {}; localStorage.setItem('gloomwater.save.v1', JSON.stringify(sv)); }, save);
    await K.reload();
  };
  /** From the title to the Jetty (Continue: a save with no trip goes home). */
  K.toJetty = async () => {
    await g(() => { const c = window.__gw; try { c.ui.closeAll?.(); } catch { /* optional */ } c.game.continueRun(); });
    const r = await K.until("c.flow === 'home'", 20);
    K.need(r.ok, 'the save opens at the Jetty', r);
    await K.secs(1.2);
    return r;
  };
  /** Home from a trip (the pause's Home path, game.goHome), the tally run to its end (Escape, Sold), the Jetty. */
  K.toHomeVia = async ({ tally = false } = {}) => {
    if ((await K.state()).flow === 'playing') {
      await g(() => { const c = window.__gw; try { c.fishing.cancel?.('debug'); } catch { /* optional */ } return c.game.goHome?.(); });
      const t = await K.until("c.debug.ui().openModal === 'tally' || (c.flow === 'home' && !c.game.homeGlide?.())", 40);
      if (!t.ok) K.note('home: no tally and no Jetty in 40 s', await K.state());
      if ((await K.state()).modal === 'tally') {
        if (tally) await K.shoot('tally');
        await K.key('Escape'); await K.secs(0.3); await K.settle(400);
        await K.tap('[data-loop=tally] [data-action=sold]') || await K.tap('[data-action=sold]');
        await K.until("c.debug.ui().openModal === 'jetty'", 3);
        if (tally) await K.shoot('jetty-after-tally');
      }
    }
    await K.until("c.flow === 'home'", 10);
    await K.secs(0.5);
  };
  /** A real buy: the shelf's card (its tab first), else the ledger's buy (noted). → {ok, via} */
  K.buyReal = async (id, tabWord) => {
    const before = await g(() => window.__gw.progression.loop.state().clams);
    await g(() => { const c = window.__gw; try { c.ui.closeAll?.(); } catch { /* optional */ } c.ui?.loop?.openShelf?.(); });
    await K.secs(0.4); await K.settle(350);
    const b = await K.buyBox(id, tabWord);
    let via = 'card';
    if (b && !b.disabled) { await K.tapXY(b.x, b.y); await K.steps(3); }
    else { via = 'ledger'; await g((id) => window.__gw.progression.loop.buy?.(id), id); }
    const after = await g(() => window.__gw.progression.loop.state().clams);
    await g(() => window.__gw.ui.closeAll?.());
    await K.steps(2);
    return { ok: after < before, via, before, after };
  };
  /** Every visible word in the UI's layers but the catch card's (T149's % and size scan). */
  K.uiText = () => g(() => { const T = window.__lp; return [...document.querySelectorAll('#ui *')].filter((e) => !e.children.length && T.visible(e) && !e.closest('[data-modal=catch]')).map((e) => e.textContent).join(' | '); });
  /** Sail (from the Jetty): game.sail({water, place}) and the glide out, to the trip. */
  K.sail = async (place = null, { water = 'mossmere' } = {}) => {
    await g(([w, p]) => { const c = window.__gw; try { c.ui.closeAll?.(); } catch { /* optional */ } c.game.sail(p ? { water: w, place: p } : { water: w }); }, [water, place]);
    const r = await K.until("c.flow === 'playing' && c.state.run?.outing === 'trip' && !c.game.homeGlide?.()", 30);
    K.need(r.ok, `Sail${place ? ` toward ${place}` : ''} starts a trip`, r);
    const st = await K.state();
    K.check(st.stack.length === 0, 'after the Sail debug.ui().stack is empty', st.stack);
    return r;
  };
  return K;
}

// ================================================================== the scenario (T149)
export default async function (api) {
  const { page, evalGame: g, log, args } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit3a(api, { label: '3a' });
  const seen = { places: {}, charts: [] };
  try {
    K.step('boot: the step-2 save, Hold 5, T1, clams');
    await K.boot(seededSave({ clams: 2400, holdSlots: 5, over: { tackle: { rod: 1, line: 1, reel: 1 } } }));
    const D = await g(() => { const d = window.__gw.data; return { loop: d.LOOP_ENABLED === true, places: Object.keys(d.LOOP?.places || {}), T: d.TEXT_LOOP, lift: d.LOOP?.lift, prices: Object.fromEntries(Object.entries(d.LOOP?.places || {}).map(([k, v]) => [k, v.price])) }; });
    K.need(D.loop, 'a loop build');
    K.check(JSON.stringify(D.places) === JSON.stringify(PLACE_IDS), 'LOOP.places holds the four in the Chart\'s order', D.places);
    await K.toJetty();
    // (3b's drawn Chart replaces the list once its art has decoded: open it once, idle a moment, and look)
    await g(() => window.__gw.ui?.loop?.openChart?.());
    await K.secs(0.6); await K.settle(900);
    const drawn = await g(() => !!document.querySelector('.gw-p-chart--drawn'));
    await g(() => window.__gw.ui.closeAll?.()); await K.steps(2);
    const charts = typeof args.charts === 'string' ? args.charts.split(',') : drawn ? ['drawn', 'list'] : ['list'];
    for (const which of charts) {
      K.step(`the Chart (${which})`);
      seen.charts.push(which);
      if (which === 'list') await g(() => window.__gw.debug.ui?.chartList?.(true));
      await g(() => { const c = window.__gw; c.ui?.loop?.openChart?.() ?? c.ui?.openChart?.() ?? c.debug.loop?.chart?.(); });
      await K.secs(0.6); await K.settle(400);
      const rows = await g(() => [...document.querySelectorAll('[data-loop=chart] [data-place]')].filter((e) => window.__lp.visible(e)).map((e) => e.dataset.place));
      K.check(rows.length > 0, `T134 (${which}): the Chart shows a row per owned or priced place`, rows);
      K.check(rows.every((r) => PLACE_IDS.includes(r)) && rows.join() === PLACE_IDS.filter((p) => rows.includes(p)).join(), `T134 (${which}): the rows in the Chart's order`, rows);
      const slot = await g(() => { const s = document.querySelector('[data-loop=chart] [data-slot=bait]'), sail = document.querySelector('[data-loop=chart] [data-action=sail]'); return { slot: !!s, before: !!(s && sail && s.compareDocumentPosition(sail) & Node.DOCUMENT_POSITION_FOLLOWING) }; });
      K.check(slot.slot && slot.before, `T134 (${which}): the bait slot sits in the foot before Sail`, slot);
      await K.shoot(`chart-${which}`);
      await g(() => window.__gw.ui.closeAll?.());
      await K.steps(2);
    }

    K.step('buy the Lily Maze, Sail toward it, its lift');
    const bought = await K.buyReal('place:lily_maze', D.T.tabs?.maps);
    K.check(bought.ok && bought.via === 'card', 'T149: the Lily Maze bought from its map card (60)', bought);
    const ownsLily = await g(() => (window.__gw.progression.loop.state().maps?.places || []).includes('lily_maze'));
    if (!ownsLily) await K.places.own('lily_maze');
    await K.sail('lily_maze');
    const liftPlays = await K.until("(c.game.lifting?.() ?? null) === 'lily_maze'", 2);
    if (!liftPlays.ok) { K.note('no lift beat on this tree (lane B absent): driving D\'s APIs directly'); await K.places.lift('lily_maze', { play: true }); }
    await K.secs(1.4);
    const mid = await K.places.readout();
    const lb = mid.world?.banks?.find((b) => b.id === 'lily_maze');
    K.check(lb && lb.op < 0.95, 'the Lily Maze\'s bank thins during the lift', lb);
    await K.shoot('lift-thinning');
    await K.secs(2.2);
    await K.shoot('lift-title');
    await K.secs(1.6);
    const after = await K.places.readout();
    const la = after.world?.banks?.find((b) => b.id === 'lily_maze');
    K.check(la && la.op === 0 && la.lifted, 'after the lift the Lily Maze\'s bank is gone and its dressing lit', la);
    seen.places.lily_maze = la;

    K.step('a cast into the Buoy Lights\' bank');
    await K.places.light('gloomtide', 0.3);
    await K.places.at('buoy_lights', { back: 1.5 });
    await K.secs(0.5);
    const ev0 = await K.evCount();
    const bag0 = await g(() => ({ bites: { ...(window.__gw.state.run?.bites || {}) } }));
    // (a forced cast from the bank's edge lands in it, as lane B's tests cast: forceBite's cast with no species named)
    await g(() => { const d = window.__gw.debug; try { window.__gw.fishing.cancel?.('debug'); d.forceBite?.({ wait: 2 }); } catch { /* optional */ } });
    const mist = await K.until("window.__lp.ev.some((e) => e.e === 'fishing:mist')", 4);
    if (!mist.ok) K.note('no fishing:mist on this tree (lane B\'s cast into mist absent)');
    await K.secs(2.6);
    const bag1 = await g(() => ({ bites: { ...(window.__gw.state.run?.bites || {}) } }));
    K.check(JSON.stringify(bag0) === JSON.stringify(bag1), 'T121: a cast into a bank spends no bite', { bag0, bag1 });
    const evs = await K.events(ev0);
    K.check(!evs.some((e) => e.e === 'fishing:bite'), 'T121: no bite in the bank', evs.map((e) => e.e));

    // ---------------------------------------------------------------- home, the other maps, two balls, Hold 6
    K.step('home: the other maps, two balls, Hold 6');
    await K.toHomeVia();
    const T = D.T;
    for (const [id, tab] of [['place:under_the_span', T.tabs?.maps], ['place:buoy_lights', T.tabs?.maps], ['place:bell_pool', T.tabs?.maps], ['bait:heartmoss', T.tabs?.bait], ['bait:heartmoss', T.tabs?.bait], ['hold:6', T.tabs?.raft]]) {
      const r = await K.buyReal(id, tab);
      K.check(r.ok, `T149: ${id} bought from the shelf${r.via === 'ledger' ? ' (through the ledger: no card on this tree)' : ''}`, r);
    }
    const st = await g(() => { const m = window.__gw.progression.loop.state(); return { places: m.maps?.places, balls: m.bait?.mossmere?.heartmoss ?? 0, hold: m.holdSlots }; });
    K.check(PLACE_IDS.every((p) => st.places?.includes(p)), 'T149: the four place maps owned', st.places);
    K.check(st.balls === 2, 'T149: two Heartmoss Balls in the bag', st.balls);
    K.check(st.hold === 6, 'T149: Hold 6', st.hold);

    K.step('fit a ball on the Chart\'s foot, Sail to the Bell Pool by day');
    await g(() => { const c = window.__gw; c.ui?.loop?.openChart?.(); });
    await K.secs(0.5); await K.settle(400);
    const slotTap = await K.tap('[data-loop=chart] [data-slot=bait]');
    await K.steps(3);
    let fitted = await g(() => window.__gw.progression.loop.fitted?.()?.bait ?? null);
    K.check(!!slotTap && fitted === 'heartmoss', 'T134/T149: the foot\'s bait slot fits the Heartmoss Ball', { tapped: !!slotTap, fitted });
    if (fitted !== 'heartmoss') await g(() => window.__gw.progression.loop.fit?.('bait', 'heartmoss'));
    await K.shoot('chart-ball-fitted');
    const rowTap = await K.tap('[data-loop=chart] [data-place=bell_pool]');
    await K.steps(2);
    const pk = await g(() => window.__gw.progression.loop.pick?.() ?? null);
    K.check(!!rowTap && pk?.place === 'bell_pool', 'T134: the Bell Pool\'s row chosen (the pick saved)', pk);
    const sailTap = await K.tap('[data-loop=chart] [data-action=sail]', null, { settle: 0 });
    if (!sailTap) await g(() => window.__gw.game.sail({ water: 'mossmere', place: 'bell_pool' }));
    const tr = await K.until("c.flow === 'playing' && c.state.run?.outing === 'trip' && !c.game.homeGlide?.()", 30);
    K.need(tr.ok, 'T149: Sail starts the trip toward the Bell Pool', tr);
    K.check((await K.state()).stack.length === 0, 'after the Sail debug.ui().stack is empty');
    // the three lifts due play in price order; a skip key ends each
    for (let i = 0; i < 4; i++) {
      const l = await g(() => window.__gw.game.lifting?.() ?? null);
      if (!l) break;
      await K.secs(1.2);
      if (i === 0) await K.shoot('lift-span');
      await K.key('Space');
      await K.steps(3);
    }
    const ro = await K.places.readout();
    K.check(['under_the_span', 'buoy_lights', 'bell_pool'].every((id) => ro.world?.banks?.find((b) => b.id === id)?.op === 0), 'T149: every bought place lifted', ro.world?.banks);

    K.step('her sure bite at the Bell Pool by day');
    await K.places.light('calm', 0.5);
    await K.places.at('bell_pool', {});
    await K.secs(0.5);
    const scans = [];
    const scan = async (where) => { const r = await K.uiText(); scans.push({ where, pct: hasPercent(r), size: hasSize(r) }); };
    await scan('the HUD');
    let legend = null;
    try {
      legend = await K.realCatch(null, null, { what: 'the Matriarch', natural: true, onBite: () => scan('the strike'), onPlay: () => scan('the play') });
    } catch (e) { if (!(e instanceof Abort)) throw e; K.note('her bite did not come (lanes A and B: the ball, her pool and her hour)'); }
    if (legend) {
      const sh = await K.until("c.fishing?.inShow === true || c.debug.ui().openModal === 'catch'", 25);
      if (sh.ok && (await K.state()).inShow) { await scan('the show'); await K.key('Space'); }
      const cd = await K.until("c.debug.ui().openModal === 'catch'", 20);
      if (cd.ok) {
        await K.settle(300); await K.secs(1.6);
        const card = await K.card();
        K.check(card.fish?.speciesId === 'belled_matriarch', 'T149: the bite was hers', card.fish);
        K.check(card.keep?.to === 500, 'T139/T149: her card Keep · 500', card.keep);
        await K.shoot('card-matriarch');
        await K.tap('[data-modal=catch] [data-action=keep]');
        await K.until("c.debug.ui().openModal !== 'catch'", 3);
      } else K.check(false, 'T149: her card');
    }
    K.check(scans.every((x) => !x.pct && !x.size), 'T149: no % and no size on the HUD, the strike, the play or the show (decision 62)', scans);

    K.step('home: the tally pays 500, Murk\'s line');
    await K.toHomeVia({ tally: true });
    const last = await g(() => window.__gw.progression.loop.lastTrip?.() ?? window.__gw.progression.loop.state().lastTrip);
    K.check((last?.lines || []).some((l) => l.speciesId === 'belled_matriarch' && l.clams === 500), 'T149: the tally pays 500 for her', last?.lines);
    const murk = await g((s) => window.__lp.seen(s), T.murk?.legendFirst);
    K.check(murk, 'T144: Murk\'s line for her', T.murk?.legendFirst);

    K.step('a forced Thousandcast at Under the Span at dusk: the gold card');
    await K.sail('under_the_span');
    for (let i = 0; i < 3 && await g(() => !!window.__gw.game.lifting?.()); i++) { await K.key('Space'); await K.steps(2); }
    await K.places.light('dusk', 0.5);
    await K.places.at('under_the_span', {});
    await K.secs(0.4);
    try {
      await K.realCatch('thousandcast_pike', 1.4, { what: 'the Thousandcast', onBite: () => scan('the giant\'s strike') });
      const sh = await K.until("c.fishing?.inShow === true || c.debug.ui().openModal === 'catch'", 25);
      if (sh.ok && (await K.state()).inShow) { await K.secs(0.8); await K.shoot('show-thousandcast'); await K.key('Space'); }
      const cd = await K.until("c.debug.ui().openModal === 'catch'", 20);
      if (cd.ok) {
        await K.settle(300); await K.secs(1.6);
        const star = await g(() => { const m = document.querySelector('[data-modal=catch]'); return m ? /★\s*Thousandcast Pike/.test(m.textContent) : null; });
        K.check(star === true, 'T139: the gold card: ★ before its name', star);
        await K.shoot('card-thousandcast');
        await K.tap('[data-modal=catch] [data-action=keep]');
        await K.until("c.debug.ui().openModal !== 'catch'", 3);
      } else K.check(false, 'T149: the Thousandcast\'s card');
    } catch (e) { if (!(e instanceof Abort)) throw e; }

    K.step('the catalogue');
    await g(() => { const c = window.__gw; const o = { from: 'chart', zone: 'mossmere' }; try { (c.ui?.screens?.openJournal ?? c.ui?.openJournal)?.(o); } catch { /* optional */ } });
    await K.secs(0.5); await K.settle(400);
    const cat = await g(() => {
      const T2 = window.__lp, root = document.querySelector('[data-modal=journal]') || document.querySelector('.gw-p-journal');
      if (!root) return null;
      const cards = [...root.querySelectorAll('[data-species]')].filter(T2.visible).map((e) => e.dataset.species);
      const texts = [...root.querySelectorAll('[data-species]')].map((e) => e.textContent);
      return { cards: [...new Set(cards)], pct: texts.some((t) => /%/.test(t)) || /%/.test(root.textContent.replace(/Odds ›/g, '')) };
    });
    K.check(cat && cat.cards.length === 17, 'T136/T149: the catalogue shows all 17 of the Mossmere\'s fish', cat?.cards?.length);
    K.check(cat && !cat.pct, 'T136/T149: no % in the catalogue', cat);
    const probe = await g(() => window.__gw.debug.ui?.hatchProbe?.('kissmark_trout', 116, 62) ?? null);
    K.check(probe && probe.offHue === 0, 'T137: the hatch probe (sepia ink only)', probe);
    await K.shoot('catalogue');
    await g(() => window.__gw.ui.closeAll?.());

    K.step('Hold 6 and the two-row hold on the phone (Tallow\'s 7)');
    await K.toHomeVia();
    await g(() => window.__gw.progression.loop.setWick?.('tallow'));
    await K.sail(null);
    await K.secs(0.5); await K.settle(700);
    const hold = await g(() => {
      const row = document.querySelector('.gw-hud .gw-hold') || document.querySelector('[data-loop=hold]');
      const cells = row ? [...row.querySelectorAll('.gw-slot')] : [];
      return { cells: cells.length, rows: new Set(cells.map((e) => Math.round(e.getBoundingClientRect().top))).size };
    });
    K.check(hold.cells === 7, 'T141: Tallow at Hold 6 has seven cells', hold);
    K.check(K.phone ? hold.rows === 2 : hold.rows === 1, `T141: ${K.phone ? 'two rows on the phone' : 'one row on the desktop'}`, hold);
    await K.shoot('hold-tallow');

    K.step('the readout and the errors');
    log('places', JSON.stringify(await K.places.readout()));
    await K.noErrors('the walk');
  } catch (e) {
    if (!(e instanceof Abort)) K.failures.push(`[${K.part}] threw: ${e?.stack || e}`);
  }
  log(`LOOP_3A ${JSON.stringify({ size: K.tag, failures: K.failures, notes: K.notes, seen })}`);
  return { failures: K.failures };
}

// ================================================================== the dry run (node, no browser)
export async function dryRun() {
  const bad = [];
  const sv = seededSave({ clams: 999, holdSlots: 6, own: ['lily_maze'], balls: 2 });
  if (sv.meta.loop.clams !== 999 || sv.meta.loop.holdSlots !== 6) bad.push('seededSave sets clams and the hold');
  if (JSON.stringify(sv.meta.loop.maps.places) !== '["lily_maze"]') bad.push('seededSave owns places');
  if (sv.meta.loop.bait.mossmere.heartmoss !== 2) bad.push('seededSave fills the bag');
  if (sv.run !== null) bad.push('seededSave has no trip');
  if (!hasPercent('27%') || hasPercent('27 lb')) bad.push('hasPercent');
  if (!hasSize('12.4 lb') || !hasSize('A Trophy') || hasSize('Keep · 500 clams')) bad.push('hasSize');
  globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; globalThis.GW_LOOP = true;
  const D = await import('../../src/data.js?loop3a');
  for (const id of PLACE_IDS) {
    const p = D.loopPlace(id), q = poseSouthOf(p, 10);
    if (!p || !q) { bad.push(`no pose for ${id}`); continue; }
    if (!(q.z > (p.area.z ?? p.area.pts[0][1]))) bad.push(`${id}: the pose is south of the place`);
  }
  if (JSON.stringify(Object.keys(D.LOOP.places)) !== JSON.stringify(PLACE_IDS)) bad.push('PLACE_IDS is LOOP.places\' order');
  if (typeof installPlaces.toString() !== 'string' || !/window\.__p3/.test(installPlaces.toString())) bad.push('installPlaces serialises');
  return bad;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const bad = await dryRun();
  if (bad.length) { console.log('loop-3a dry run FAIL\n  ' + bad.join('\n  ')); process.exit(1); }
  console.log('loop-3a dry run ok');
}
