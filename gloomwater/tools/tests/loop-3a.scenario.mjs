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
    const drawn = await g(() => window.__gw.ui?.loop?.chart?.ready?.() === true || !!document.querySelector('.gw-p-chart--drawn'));
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
    const bought = await g(() => { const L = window.__gw.progression?.loop; try { return L?.buy?.('place:lily_maze') ?? null; } catch (e) { return String(e); } });
    K.check(bought && bought.ok !== false, 'buy("place:lily_maze") owns it', bought);
    if (!(bought && bought.ok !== false)) await K.places.own('lily_maze');
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
    await K.places.at('buoy_lights', { back: 7 });
    await K.secs(0.5);
    const ev0 = await K.evCount();
    const bag0 = await g(() => ({ bites: { ...(window.__gw.state.run?.bites || {}) } }));
    await g(() => { const c = window.__gw, p = c.data.loopPlace('buoy_lights'); c.debug.castAt?.({ x: p.area.x, z: p.area.z }) ?? c.fishing.castAt?.({ x: p.area.x, z: p.area.z }); });
    const mist = await K.until("window.__lp.ev.some((e) => e.e === 'fishing:mist')", 4);
    if (!mist.ok) K.note('no fishing:mist on this tree (lane B\'s cast into mist absent)');
    await K.secs(2.6);
    const bag1 = await g(() => ({ bites: { ...(window.__gw.state.run?.bites || {}) } }));
    K.check(JSON.stringify(bag0) === JSON.stringify(bag1), 'T121: a cast into a bank spends no bite', { bag0, bag1 });
    const evs = await K.events(ev0);
    K.check(!evs.some((e) => e.e === 'fishing:bite'), 'T121: no bite in the bank', evs.map((e) => e.e));

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
