// The tow and the opening at the Landing (M1 step 5b, LANE 5B-TOW; docs/loop/OPENING.md §6.2 rev. 5, SPEC §6.5, M1.md §2.1, §4
// step 5b's gate): LOOP.tow's numbers and its pure helpers (towLegSeconds, towPlan, towGlidePose, towOpeningDue, legProgress,
// towPhases, the view's towFrame / towMarks), the tutorial machine's Landing beats and its resume after the tow (T65, T67 re-set),
// and the director (src/loop-tow.js) driven through loop-home's enterHome with a fake player, a fake view and a fake clock: it plays
// once and a second Sail never replays it; both halves play in the opening; a tap ends the leg and a tap ends the glide in at the
// mooring; a reload during it lands at the mooring with barge.towed written; reduced motion inks the leg at once and cuts the glide
// in; each part's length gated on its own (the leg 4 s + 0.5 s a crossing and ≤ 6 s, the Sluice Run's 5 s; the dip 0.6 s; the
// glide in 3 s); the opening reaches the first trip in under 60 s; the glide in's paths clear every island and pillar (T72).
//   node tools/tests/loop-tow.test.mjs   (or node tools/check.mjs)
if (typeof globalThis.document === 'undefined') {
  const noop = new Proxy(function () {}, {
    get: (t, k) => (k === 'createLinearGradient' || k === 'createRadialGradient' ? () => ({ addColorStop() {} })
      : k === 'measureText' ? () => ({ width: 40 }) : noop),
    apply: () => undefined, set: () => true,
  });
  globalThis.document = { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => noop }) };
}
import * as THREE from 'three';
import { createBus } from '../../src/core.js';
import { createLoopHome } from '../../src/loop-home.js';
import { loadLoopData, fakeLoop, freshLoopMeta } from './loop-fixture.mjs';

const D = await loadLoopData({ query: 'tow' });
const { createLoopTow, legProgress, towPhases, TOW_PHASES } = await import('../../src/loop-tow.js');
const { createLoopTutorial, LANDING_BEATS } = await import('../../src/loop-tutorial.js');
const { towFrame, towMarks, legPoint } = await import('../../src/ui-tow.js');
const { prepPieces } = await import('../../src/chart-draw.js');
const { CHART_ART } = await import('../../src/chart-art.js');
const { murkHold } = await import('../../src/first-evening.js');
const { SFX } = await import('../../src/audio-sfx.js');
const { TOW_SFX, registerTowSfx } = await import('../../src/audio-tow.js');

let pass = 0, fail = 0;
function ok(cond, msg, extra) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra) : ''); } }
const eq = (a, b, msg) => ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);
const near = (a, b, msg, e = 1e-6) => ok(Math.abs(a - b) <= e, `${msg} (got ${a}, want ${b} ± ${e})`);
const section = (s) => console.log(`- ${s}`);
const flush = () => new Promise((r) => setImmediate(r));
const TW = D.LOOP.tow, WAKE_HOLD = murkHold(D.TEXT_LOOP.murk.wake, D.FIRST_EVENING?.lines || {});
const ZONE = D.ZONES.find((z) => z.id === 'mossmere'), DOCKS = ZONE.arena.docks.map((d, i) => ({ ...d, yaw: i === 0 ? 0 : d.yaw || 0 }));
const MOOR = D.loopMooring('mossmere', DOCKS);

section('the data: LOOP.tow (SPEC §6.5, OPENING §6.2)');
{
  ok(D.LOOP_ENABLED === true && TW && TW === D.LOOP_TOW && TW.opening === true, 'LOOP.tow under the loop, the opening on');
  eq([TW.leg.base, TW.leg.crossing, TW.leg.max, TW.leg.reducedHold, TW.dip, TW.glide], [4, 0.5, 6, 1.5, 0.6, 3], 'the parts: leg 4 s + 0.5 s a crossing ≤ 6 s, reduced 1.5 s; dip 0.6 s; glide 3 s');
  eq([TW.landing.dip, TW.landing.arrive, TW.landing.wakeAfter], [0.6, 1.5, 1], 'the Landing: the dip 0.6 s, arrive 1.5 s, 1 s after the wake line');
  const leg = TW.legs.mossmere;
  ok(leg && leg.piece === 'sluiceRun' && leg.reverse === true && leg.crossings.length === 2 && leg.crossings.map((c) => c.kind).join() === 'locks,fall', 'the Sluice Run: one lock flight and one fall, up the run');
  eq(D.towLegSeconds(leg), 5, 'the Sluice Run\'s leg is 5 s');
  eq(D.towLegSeconds({ crossings: [1, 2, 3, 4, 5, 6] }), 6, 'a leg is never more than 6 s');
  eq(D.towLegSeconds({ crossings: [] }), 4, 'a leg with no crossing is 4 s');
  eq(D.towLegSeconds(leg, { reduced: true }), 1.5, 'reduced motion holds the inked leg 1.5 s');
  const P = D.towPlan('mossmere');
  eq([P.legS, P.dip, P.glide], [5, 0.6, 3], 'towPlan(mossmere): 5 s, 0.6 s, 3 s');
  ok(P.total <= 10, 'a tow is never more than 10 s', P.total);
  eq(D.towPlan('mossmere', { reduced: true }).glide, 0, 'reduced motion cuts the glide in');
  eq(D.towPlan('sporewood'), null, 'no leg for a water M1 does not ship');
  const piece = CHART_ART.live.pieces.find((p) => p.id === leg.piece);
  ok(!!piece, 'the leg\'s piece is the Chart\'s live layer\'s (CHART_ART.live.pieces)');
  const fresh = freshLoopMeta(D).loop;
  ok(D.towOpeningDue(fresh), 'a fresh loop block: the opening\'s tow is due');
  ok(!D.towOpeningDue({ ...fresh, barge: { water: 'mossmere', towed: ['mossmere'] } }), 'once towed: never again');
  ok(!D.towOpeningDue({ ...fresh, tutorial: { done: true, step: null } }), 'a done tutorial: never');
  ok(!D.towOpeningDue(null) && !D.towOpeningDue({}, 'sporewood'), 'nothing for no block or a water with no leg');
}

section('the glide in\'s poses (towGlidePose) and their paths (T72)');
{
  const d = TW.glideIn.mossmere.d, p1 = D.towGlidePose(MOOR, 1, { d }), p0 = D.towGlidePose(MOOR, 0, { d });
  near(p1.hull.x, MOOR.hull.x, 'at the end the barge lies at its mooring (x)'); near(p1.hull.z, MOOR.hull.z, '… (z)');
  near(p1.raft.x, MOOR.raft.x, 'the raft at the stern\'s tie-up (x)'); near(p1.raft.z, MOOR.raft.z, '… (z)');
  near(p1.murk.x, MOOR.murk.x, 'Murk at his slot');
  near(Math.hypot(p0.hull.x - p1.hull.x, p0.hull.z - p1.hull.z), d, `the glide in starts ${d} m out along the barge's line`, 1e-9);
  const gap = (p) => Math.hypot(p.raft.x - p.stern.x, p.raft.z - p.stern.z);
  for (const u of [0, 0.3, 0.7, 1]) near(gap(D.towGlidePose(MOOR, u, { d })), gap(p1), `the raft keeps its place at the stern (u ${u})`, 1e-9);
  ok(gap(p1) < 4, 'the raft is tied close at the stern', gap(p1));
  const mid = D.towGlidePose(MOOR, 0.5, { d }), lin = D.towGlidePose(MOOR, 0.5, { d, ease: false });
  ok(Math.hypot(mid.hull.x - p1.hull.x, mid.hull.z - p1.hull.z) < Math.hypot(lin.hull.x - p1.hull.x, lin.hull.z - p1.hull.z), 'eased, it slows into its berth');
  // every pose clear of the lake's islands and pillars: the hull's keel circles, Murk's barge and the raft (T72's rule, the raft's
  // radius + 0.3 m for the raft; the hulls by their own radius)
  const A = ZONE.arena, rad = D.BALANCE?.move?.raftRadius ?? 1.6, K = D.LOOP.barge.keel;
  const solids = [...A.islands.map((q) => ({ x: q.x, z: q.z, r: q.r ?? 4, n: q.name })), ...A.pillars.map((q) => ({ x: q.x, z: q.z, r: q.r ?? 1.2, n: q.kind }))];
  let worst = Infinity, who = null;
  for (let i = 0; i <= 20; i++) {
    const p = D.towGlidePose(MOOR, i / 20, { d }), fx = -Math.sin(p.hull.yaw), fz = -Math.cos(p.hull.yaw);
    const bodies = [{ x: p.raft.x, z: p.raft.z, r: rad + 0.3, n: 'raft' }, { x: p.murk.x, z: p.murk.z, r: D.LOOP.barge.murkR, n: 'murk' }];
    for (let k = 0; k < K.n; k++) { const s = (k - (K.n - 1) / 2) * K.step; bodies.push({ x: p.hull.x + fx * s, z: p.hull.z + fz * s, r: K.r, n: 'hull' }); }
    for (const b of bodies) for (const o of solids) { const c = Math.hypot(b.x - o.x, b.z - o.z) - b.r - o.r; if (c < worst) { worst = c; who = `${b.n}/${o.n} @${i / 20}`; } }
  }
  ok(worst > 0, 'T72: the glide in (raft, barge and Murk) clears every island and pillar', { worst, who });
}

section('the raft leads the barge in on its line (towLeadPose), clear of the islands, pillars and shore');
{
  const { towLeadPose } = await import('../../src/loop-tow.js');
  const WL = await import('../../src/world-layout.js');
  const d = TW.glideIn.mossmere.d, line = TW.glideIn.mossmere.line, half = D.LOOP.barge.length / 2;
  const p1 = towLeadPose(MOOR, 1, { d, line }), p0 = towLeadPose(MOOR, 0, { d, line });
  near(p1.hull.x, MOOR.hull.x, 'at the end the barge lies at its mooring (x)'); near(p1.hull.z, MOOR.hull.z, '… (z)');
  near(Math.hypot(p0.hull.x - p1.hull.x, p0.hull.z - p1.hull.z), d, `it comes in ${d} m along its own line`, 1e-9);
  for (const u of [0, 0.5, 1]) {
    const p = towLeadPose(MOOR, u, { d, line }), fx = -Math.sin(p.hull.yaw), fz = -Math.cos(p.hull.yaw);
    const ahead = (p.raft.x - p.bow.x) * fx + (p.raft.z - p.bow.z) * fz;
    near(ahead, line + 1.1, `the raft leads, ${line} m of line ahead of the bow (u ${u})`, 1e-9);
    near(Math.hypot(p.bow.x - p.hull.x, p.bow.z - p.hull.z), half, '… the line made fast at the bow', 1e-9);
  }
  const Lay = WL.buildLayout(ZONE), rad = D.BALANCE?.move?.raftRadius ?? 1.6, A = ZONE.arena;
  const solids = [...A.islands.map((q) => ({ x: q.x, z: q.z, r: q.r ?? 4 })), ...A.pillars.map((q) => ({ x: q.x, z: q.z, r: q.r ?? 1.2 }))];
  let worst = Infinity, shore = Infinity;
  for (let i = 0; i <= 20; i++) {
    const p = towLeadPose(MOOR, i / 20, { d, line });
    for (const o of solids) worst = Math.min(worst, Math.hypot(p.raft.x - o.x, p.raft.z - o.z) - rad - 0.3 - o.r);
    shore = Math.min(shore, Lay.shoreR(Math.atan2(p.raft.z, p.raft.x)) - Math.hypot(p.raft.x, p.raft.z) - rad);
  }
  ok(worst > 0, 'T72: the leading raft clears every island and pillar', worst);
  ok(shore > 0, 'T72: … and the shore', shore);
}

section('legProgress: the leg\'s way (4 s of travel, a 0.5 s hold at each crossing)');
{
  const leg = TW.legs.mossmere, L = D.towLegSeconds(leg);
  eq(legProgress(0, L, leg.crossings), 0, 'starts at the Landing');
  eq(legProgress(L, L, leg.crossings), 1, 'ends at the water');
  let mono = true, prev = -1;
  for (let t = 0; t <= L + 1e-9; t += 0.05) { const u = legProgress(t, L, leg.crossings); if (u < prev - 1e-12) mono = false; prev = u; }
  ok(mono, 'never goes back');
  // the time spent within ±0.02 of each crossing is its hold (0.5 s)
  for (const c of leg.crossings) {
    let inside = 0;
    for (let t = 0; t < L; t += 0.001) { const u = legProgress(t, L, leg.crossings); if (Math.abs(u - c.at) <= 0.02) inside += 0.001; }
    near(inside, 0.5, `the ${c.kind}: about 0.5 s through it`, 0.03);
  }
  near(legProgress(2, 4, []), 0.5, 'with no crossing it is even');
}

section('towPhases: each part on its own; the opening under 60 s');
{
  const P = towPhases(D, 'mossmere', { opening: true });
  eq([P.landingDip, P.arrive, P.leg, P.dip, P.glide], [0.6, 1.5, 5, 0.6, 3], 'the opening\'s parts: dip 0.6, arrive 1.5, leg 5, dip 0.6, glide 3');
  near(P.wake, WAKE_HOLD + 1, 'the wake: Murk\'s line held, then 1 s');
  ok(P.arrive <= 2 && P.wake <= 7 && P.leg <= 6 && P.leg === 5, 'within OPENING §6.2\'s budgets (arrive ≤ 2 s, wake ≤ 7 s, the leg 5 s)');
  const T = D.LOOP.tutorial, film = 18;
  const home = P.landingDip + P.arrive + P.wake + P.leg + P.dip + P.glide + 3 + T.out;   // (the chart beat ≈ 3 s, then Sail)
  ok(home <= 26, `the home part ≈ 25 s untouched (${home.toFixed(2)} s)`);
  ok(film + home < 60, `the opening reaches the first trip in under 60 s (${(film + home).toFixed(2)} s)`);
  const R = towPhases(D, 'mossmere', { opening: true, reduced: true });
  eq([R.leg, R.glide], [1.5, 0], 'reduced motion: the leg held 1.5 s inked, the glide cut');
  const later = towPhases(D, 'mossmere', { opening: false });
  eq([later.arrive, later.wake, later.leg, later.dip, later.glide], [0, 0, 5, 0.6, 3], 'a later tow: no Landing beats, the leg, the dip, the glide in');
  ok(TOW_PHASES.indexOf('leg') < TOW_PHASES.indexOf('dip') && TOW_PHASES.indexOf('dip') < TOW_PHASES.indexOf('glide'), 'the phases in order');
}

section('the view\'s pure parts (ui-tow: towFrame, towMarks)');
{
  for (const [w, h] of [[960, 540], [1280, 720], [390, 844], [390, 664], [358, 640]]) {
    const F = towFrame(w, h);
    ok(F.x >= 16 && F.x + F.w <= w - 15.9 && F.y + F.h <= h && F.w > 200 && F.h > 200, `${w}×${h}: the sheet inside the screen with its gutters`, F);
    ok(F.y >= 80, `${w}×${h}: room for Murk's line above the sheet`, F.y);
  }
  const pc = CHART_ART.live.pieces.find((p) => p.id === 'sluiceRun');
  prepPieces([pc]);
  const a = towMarks(pc, 0, true), b = towMarks(pc, 1, true);
  ok(Math.hypot(a.barge.x - CHART_ART.live.home.at[0], a.barge.y - CHART_ART.live.home.at[1]) < 2.5, 'at the start the barge lies at the Landing', a.barge);
  const w = CHART_ART.live.waters.find((q) => q.water === 'mossmere').at;
  ok(Math.hypot(b.raft.x - w[0], b.raft.y - w[1]) < 3, 'at the end the raft reaches the Mossmere\'s mark', b.raft);
  ok(a.sr - a.sb > 4 && Math.abs(b.sr - b.sb - 6) < 1e-9, 'the raft leads the barge on its line');
  const p0 = legPoint(pc, 0, true);
  ok(Math.hypot(p0.x - 600, p0.y - 189) < 1.5, 'up the run: the leg starts at the Landing\'s end of the piece');
}

section('the sound: the tow line, the oars, the locks and the fall (M1 §2.13)');
{
  eq(TOW_SFX, ['tow_oars', 'tow_creak', 'tow_lock', 'tow_fall'], 'four voices');
  registerTowSfx();
  ok(TOW_SFX.every((k) => typeof SFX[k]?.fn === 'function'), 'registered in the built table (under the loop)');
}

section('the tutorial machine: the Landing\'s beats, then home on the chart beat (T65, T67 with the tow)');
{
  const bus = createBus(), ev = [];
  for (const k of ['loop:tutorial', 'firstEvening:line']) bus.on(k, (p) => ev.push({ k, ...p }));
  const loop = fakeLoop({ D, tutorial: { done: false, step: 'arrive' } });
  const tut = createLoopTutorial({ bus, loop, data: D });
  eq(LANDING_BEATS, ['arrive', 'wake', 'tow', 'glideIn'], 'the Landing\'s beats');
  ok(tut.landingBeat('arrive') && tut.landingBeat('wake'), 'the beats are taken');
  ok(ev.some((e) => e.k === 'firstEvening:line' && e.key === 'wake' && e.text === D.TEXT_LOOP.murk.wake), 'the wake says Murk\'s wake line (his grumble)');
  ok(!tut.landingBeat('nope'), 'no other beat');
  eq(loop.s.tutorial.step, 'wake', 'the record\'s step is the readout');
  // a reload before the tow began: Continue → the Landing (loop-home's hook); after it, home on the chart beat
  loop.towBarge('mossmere'); tut.landingBeat('tow');
  const tut2 = createLoopTutorial({ bus, loop, data: D });
  ok(tut2.start({ from: 'title' }) === true && tut2.moored === true, 'T67: after the tow, home opens on the chart beat (moored)');
  ok(tut2.wantsChart === true, 'T67: … the Chart at once');
  eq(tut2.cue().line, null, 'T67: … no wake line at home (Murk said it at the Landing)');
  eq(tut2.cue().tile, 'chart', 'T65: … the chart table\'s target is the cue');
  ok(tut2.onTile('chart') && tut2.step === 'chart' && tut2.cue().line === D.murkLineFor?.('firstChart') || tut2.cue().line === D.TEXT_LOOP.murk.firstChart, 'T65: the chart beat with its line');
  ok(tut2.onEscapeChart() && tut2.cue().tile === 'chart' && !tut2.wantsChart, 'T65: Escape → only the chart table\'s cue remains');
  for (let i = 0; i < 400; i++) tut2.update(0.05, { top: 'jetty' });
  ok(!tut2.wantsChart, 'T65: … and the Chart never opens itself again');
  const fresh = fakeLoop({ D, tutorial: { done: false, step: 'arrive' } });
  const tut3 = createLoopTutorial({ bus, loop: fresh, data: D });
  ok(tut3.start({ from: 'title' }) && tut3.moored === false && tut3.cue().line === D.TEXT_LOOP.murk.wake, 'no tow yet: the wake as built');
}

// =====================================================================================================================
// the director through loop-home's enterHome, with a fake player, a fake view and a fake clock
function towEnv({ reduced = false, flow = 'intro', viewOn = true } = {}) {
  const bus = createBus(), ev = [], calls = [], saves = [];
  const origEmit = bus.emit.bind(bus);
  bus.emit = (e, p = {}) => { ev.push({ e, p }); origEmit(e, p); };
  const loop = fakeLoop({ D, onTrip: false, tutorial: { done: false, step: 'arrive' } });
  const player = {
    position: { x: 0, z: 46 }, heading: 0, g: null,
    glide(path, o = {}) {
      const pts = path.map((p) => (Array.isArray(p) ? { x: p[0], z: p[1] } : { x: p.x, z: p.z }));
      this.position = { ...pts[0] };
      let res; const pr = new Promise((r) => { res = r; });
      this.g = { pts, o, t: 0, res };
      calls.push(`glide:${o.kind}`);
      bus.emit('player:glide', { state: 'start', kind: o.kind || 'glide' });
      return pr;
    },
    step(dt) {
      const g = this.g; if (!g) return;
      g.t += dt;
      const k = Math.min(1, g.t / g.o.duration), a = g.pts[0], b = g.pts[g.pts.length - 1];
      this.position = { x: a.x + (b.x - a.x) * k, z: a.z + (b.z - a.z) * k };
      if (k >= 1) this.end();
    },
    end() { const g = this.g; if (!g) return; this.g = null; bus.emit('player:glide', { state: 'end', kind: g.o.kind || 'glide' }); g.res(false); },
    skipGlide() { if (!this.g || !this.g.o.skippable) return false; calls.push('skipGlide'); this.end(); return true; },
    teleport(p, yaw) { this.end(); this.position = { x: p.x, z: p.z }; this.heading = yaw; calls.push('teleport'); },
  };
  const view = {
    on: false, top: true, paints: 0, dips: [], last: null, tap: null,
    open(o) { this.on = true; this.tap = o.onTap; calls.push('view.open'); return true; },
    close() { this.on = false; calls.push('view.close'); },
    paint(st) { this.paints++; this.last = st; },
    dip(a) { this.dips.push(a); },
    isTop() { return this.on && this.top; },
  };
  const tutBus = bus;
  const meta = { ...freshLoopMeta(D), loop: loop.s };
  const ctx = {
    THREE, bus, data: D, flow, paused: false, cinematic: false, state: { meta, run: null }, player,
    ui: { closeAll() { calls.push('closeAll'); }, isBlocking: () => false, isCatchOpen: () => false, loop: { tow: viewOn ? view : null, tutorial: null } },
    progression: { createRun: (o) => loop.createTrip(o), loop },
    actors: { merchant: { moor() { calls.push('merchant.moor'); }, arrive() {}, leave() {} }, home: { poses: [], moor(p) { this.poses.push({ ...p }); } }, setCharacter() {} },
    world: { getDocks: () => DOCKS.map((d) => ({ position: new THREE.Vector3(d.x, 0, d.z), yaw: d.yaw })), getMooring: () => MOOR, getObstacles: () => [] },
    render: { snapCamera() { calls.push('snapCamera'); } },
    fishing: { state: 'idle', inShow: false, cancel() {}, isAnchored: () => false },
    audio: { play(n) { calls.push(`sfx:${n}`); return true; } },
  };
  ctx.ui.loop.tutorial = createLoopTutorial({ bus: tutBus, loop, data: D });
  let H = null;
  const T = createLoopTow({ ctx, data: D, home: () => H, save: () => { saves.push({ towed: [...loop.s.barge.towed], step: loop.s.tutorial?.step, phase: T.phase }); calls.push('save'); }, reduced: () => reduced });
  let saved = null;
  H = createLoopHome({
    ctx, data: D, lake: 'mossmere', report: (w, e) => calls.push(`report:${w}:${e?.message}`),
    setFlow: (f) => { ctx.flow = f; }, resetBeats() {}, showLake() {}, save: () => { saves.push({ towed: [...loop.s.barge.towed], step: loop.s.tutorial?.step, phase: T.phase, home: true }); calls.push('save'); },
    savedRun: { get: () => saved, set: (r) => { saved = r; } }, hasSavedRun: () => false, lockRunMode() {},
    startIntro: () => false, introOn: () => ({ intro: false }), tow: () => T,
  });
  /** Run the frame: the tow's update and the player's glide, `sec` seconds at dt. */
  const step = async (sec, dt = 1 / 30) => { const n = Math.max(1, Math.round(sec / dt)); for (let i = 0; i < n; i++) { T.update(dt); player.step(dt); await flush(); } };
  const until = async (fn, max = 30, dt = 1 / 30) => { let t = 0; while (!fn() && t < max) { T.update(dt); player.step(dt); await flush(); t += dt; } return t; };
  return { ctx, T, H, loop, view, player, ev, calls, saves, step, until, names: () => ev.map((x) => x.e) };
}

section('the opening, both halves, untouched (OPENING §6.2; M1 §4 step 5b\'s tow tests)');
{
  const E = towEnv();
  const times = {};
  let t = 0;
  const mark = () => { const p = E.T.phase; if (p && !(p in times)) times[p] = t; };
  ok(E.H.enterHome('intro') === true, 'the hand-off');
  eq(E.T.phase, 'dipIn', 'the film\'s last frame → the ink dip: the tow took the hand-off');
  ok(!E.names().includes('home:enter'), 'no home:enter yet (home comes after the tow)');
  ok(E.saves.length >= 1 && E.saves[0].towed.length === 0, 'the hand-off\'s save is written at once (the tow not yet begun)');
  const dt = 1 / 30;
  while ((E.T.phase || !E.names().includes('home:enter')) && t < 40) { mark(); E.T.update(dt); E.player.step(dt); await flush(); t += dt; }
  mark();
  ok(E.names().includes('home:enter') && E.ev.find((x) => x.e === 'home:enter').p.from === 'intro', 'home:enter {from: intro} after the glide in');
  const span = (a, b) => (times[b] ?? t) - times[a];
  near(span('dipIn', 'arrive'), 0.6, 'the dip into the Landing: 0.6 s', 0.08);
  near(span('arrive', 'wake'), 1.5, 'arrive: 1.5 s', 0.08);
  near(span('wake', 'leg'), WAKE_HOLD + 1, 'the wake: the line, then 1 s', 0.08);
  near(span('leg', 'dip'), 5, 'the leg: the Sluice Run\'s 5 s', 0.08);
  ok(span('dip', 'glide') >= 0.6 - 0.04 && span('dip', 'glide') <= 0.6 + 0.2, 'the dip: 0.6 s (held a frame or two at full)', span('dip', 'glide'));
  const glideS = t - times.glide;
  near(glideS, 3, 'the glide in: 3 s', 0.12);
  ok(E.calls.includes('view.open') && E.calls.includes('view.close') && E.calls.includes('glide:towIn'), 'both halves: the Chart\'s leg, then the glide in, in the water');
  const ls = E.saves.find((s) => s.phase === 'leg' || (s.towed.includes('mossmere') && !s.home));
  ok(!!ls && ls.towed.includes('mossmere') && ls.step === 'tow', 'the save when the tow begins: barge.towed and the tow\'s step, before it plays', E.saves);
  eq([E.player.position.x, E.player.position.z], [MOOR.raft.x, MOOR.raft.z], 'the raft tied at the stern');
  const last = E.ctx.actors.home.poses[E.ctx.actors.home.poses.length - 1];
  ok(Math.abs(last.x - MOOR.hull.x) < 1e-6 && Math.abs(last.z - MOOR.hull.z) < 1e-6, 'the barge moored at the Jetty');
  ok(E.ctx.actors.home.poses.length > 20, 'the barge came in with the raft (moved through the glide in)', E.ctx.actors.home.poses.length);
  ok(E.calls.includes('sfx:tow_lock') && E.calls.includes('sfx:tow_fall') && E.calls.includes('sfx:tow_oars') && E.calls.includes('sfx:tow_creak'), 'the tow\'s sounds: the locks, the fall, the oars, the line');
  ok(E.ctx.state.meta.loop.chartPick?.water === 'mossmere', 'the Mossmere\'s sheet inked on the tow (the chart beat does not ink it again)');
  ok(t - times.dipIn < 25, `the home part before the chart beat ≈ ${(t - times.dipIn).toFixed(1)} s`);
  // a second time: never again
  ok(E.T.opening({ from: 'title' }) === false, 'it plays once');
  const n0 = E.calls.filter((c) => c === 'view.open').length;
  E.H.enterHome('title');
  ok(E.calls.filter((c) => c === 'view.open').length === n0 && E.T.phase === null, 'Continue after it: no tow, home at once');
  const s1 = E.H.sail({ water: 'mossmere' });
  ok(s1 === true && E.T.phase === null && E.calls.filter((c) => c === 'view.open').length === n0, 'a Sail never replays it');
  eq(E.ev.filter((x) => x.e === 'loop:tow' && x.p.phase === 'leg').length, 1, 'one leg in all');
}

section('taps: the arrive, the wake once its line shows, the leg (inked at once), the glide in (at the mooring)');
{
  const E = towEnv();
  E.H.enterHome('intro');
  await E.until(() => E.T.phase === 'arrive');
  ok(E.view.tap() === true && E.T.phase === 'wake', 'a tap ends the arrive');
  await E.step(0.2);
  ok(E.view.tap() === true && E.T.phase === 'leg', 'a tap once the line shows begins the tow');
  await E.step(0.5);
  ok(E.T.state().u < 0.5, 'the leg runs');
  ok(E.view.tap() === true && E.T.phase === 'dip' && E.T.state().u === 1 && E.T.state().ink === 1, 'a tap ends the leg: the sheet inked at once, then the dip');
  await E.until(() => E.T.phase === 'glide');
  await E.step(0.5);
  ok(E.player.g && E.player.g.o.kind === 'towIn', 'the glide in runs');
  ok(E.H.skipHomeGlide() === true, 'a tap ends the glide in (loop-home\'s skipHomeGlide, as main\'s tap does)');
  await E.step(0.1);
  ok(E.T.phase === null && E.names().includes('home:enter'), '… at the mooring, home at once');
  eq([E.player.position.x, E.player.position.z], [MOOR.raft.x, MOOR.raft.z], '… the raft at the stern');
  ok(E.ctx.actors.home.poses.at(-1).x === MOOR.hull.x, '… the barge at its mooring');
}

section('a reload during the tow lands at the mooring with barge.towed written (T67)');
{
  for (const at of ['leg', 'glide']) {
    const E = towEnv();
    E.H.enterHome('intro');
    await E.until(() => E.T.phase === at);
    await E.step(0.3);
    ok(E.loop.s.barge.towed.includes('mossmere'), `${at}: barge.towed is written`);
    // the reload: a new page on the same save; Continue → enterHome('title')
    const R = towEnv({ flow: 'title' });
    R.loop.s.barge = { water: 'mossmere', towed: [...E.loop.s.barge.towed] };
    R.loop.s.tutorial = { ...E.loop.s.tutorial };
    R.ctx.state.meta.loop = R.loop.s;
    R.H.enterHome('title');
    ok(R.T.phase === null && !R.calls.includes('view.open'), `${at}: Continue: no tow`);
    eq([R.player.position.x, R.player.position.z], [24, 38], `${at}: the raft at the mooring's tie-up`);
    ok(R.names().includes('home:enter'), `${at}: home at once`);
    const tut = R.ctx.ui.loop.tutorial;
    ok(tut.start({ from: 'title' }) && tut.moored && tut.wantsChart, `${at}: the tutorial resumes at the chart beat over the barge`);
  }
  // a reload before the tow began (the Landing's arrive or wake): Continue → the Landing again, the line again, then the tow
  const E = towEnv();
  E.H.enterHome('intro');
  await E.until(() => E.T.phase === 'wake');
  const R = towEnv({ flow: 'title' });
  R.loop.s.tutorial = { ...E.loop.s.tutorial };
  R.ctx.state.meta.loop = R.loop.s;
  R.H.enterHome('title');
  ok(R.T.phase === 'dipIn' && !R.names().includes('home:enter'), 'T67: a reload in the wake: Continue → the Landing again');
  await R.until(() => R.T.phase === 'wake');
  ok(R.ev.some((x) => x.e === 'loop:tutorial' && x.p.step === 'wake'), 'T67: … the wake again, its line');
}

section('reduced motion: the leg inked at once and held 1.5 s; the glide in cut to the mooring');
{
  const E = towEnv({ reduced: true });
  E.H.enterHome('intro');
  await E.until(() => E.T.phase === 'leg');
  ok(E.T.state().u === 1 && E.T.state().ink === 1, 'the leg is inked at once');
  let t = 0;
  while (E.T.phase === 'leg' && t < 5) { E.T.update(1 / 30); await flush(); t += 1 / 30; }
  near(t, 1.5, 'held 1.5 s', 0.05);
  await E.until(() => E.T.phase === null || E.names().includes('home:enter'), 3);
  ok(!E.calls.includes('glide:towIn') && E.names().includes('home:enter'), 'the glide in cut: home at once after the dip');
  eq([E.player.position.x, E.player.position.z], [MOOR.raft.x, MOOR.raft.z], '… the raft at the stern');
}

section('no view, or the tow not due: 5a\'s hand-off as built');
{
  const E = towEnv({ viewOn: false });
  E.H.enterHome('intro');
  ok(E.T.phase === null && E.calls.includes('glide:home'), 'no tow view: the hand-off glide');
  const F = towEnv();
  F.loop.s.barge = { water: 'mossmere', towed: ['mossmere'] };
  F.H.enterHome('intro');
  ok(F.T.phase === null && F.calls.includes('glide:home'), 'already towed: the hand-off glide');
}

section('playTow(water): the same component for a later water (no Landing beats)');
{
  const E = towEnv({ flow: 'home' });
  E.loop.s.tutorial = { done: true, step: null };
  let done = 0;
  ok(E.T.playTow('mossmere', { onDone: () => done++ }) === true && E.T.phase === 'leg', 'playTow: straight into the leg');
  ok(E.T.playTow('mossmere') === false, 'one at a time');
  await E.until(() => done > 0, 15);
  eq(done, 1, 'onDone once, after the glide in');
  ok(E.ev.filter((x) => x.e === 'loop:tow').map((x) => x.p.phase).join() === 'leg,dip,dipHold,dipClear,glide,done', 'leg → dip → glide in', E.ev.filter((x) => x.e === 'loop:tow').map((x) => x.p.phase));
  ok(E.T.playTow('sporewood') === false, 'no leg, no tow');
}

section('never stranded: the flow leaving home drops the tow; the tutorial done or its screen closed cuts it to the mooring');
{
  // the flow leaves home mid-leg (Settings' Forget everything, the title): dropped, nothing called
  const A = towEnv();
  A.H.enterHome('intro');
  await A.until(() => A.T.phase === 'leg');
  A.ctx.flow = 'title';
  await A.step(0.1);
  ok(A.T.phase === null && A.view.on === false && !A.names().includes('home:enter'), 'the flow left home: the tow dropped, its screen closed, no home:enter');
  // the tutorial marked done under the Landing (a debug build's shortcut): cut to the mooring, written as begun, home:enter
  const B = towEnv();
  B.H.enterHome('intro');
  await B.until(() => B.T.phase === 'arrive');
  B.loop.s.tutorial = { done: true, step: null };
  await B.step(0.1);
  ok(B.T.phase === null && B.loop.s.barge.towed.includes('mossmere') && B.names().includes('home:enter'), 'the tutorial done: cut to the mooring (barge.towed, home:enter)');
  eq([B.player.position.x, B.player.position.z], [MOOR.raft.x, MOOR.raft.z], '… the raft at the stern');
  ok(B.ctx.actors.home.poses.at(-1).x === MOOR.hull.x, '… the barge at its mooring');
  // its screen closed by another (ui.closeAll) during the wake: cut, the save written first
  const C = towEnv();
  C.view.isOpen = function () { return this.on; };
  C.H.enterHome('intro');
  await C.until(() => C.T.phase === 'wake');
  C.view.on = false;
  await C.step(0.1);
  ok(C.T.phase === null && C.loop.s.barge.towed.includes('mossmere') && C.saves.some((x) => x.towed.includes('mossmere')) && C.names().includes('home:enter'), 'its screen closed under it: cut (towed and saved), home:enter');
  // the debug build's cut, and Continue before the tow resuming at the wake with no arrive beat
  const E = towEnv();
  E.H.enterHome('intro');
  await E.until(() => E.T.phase === 'leg');
  ok(E.T.debug('cut') === true && E.T.phase === null && E.names().includes('home:enter'), 'debug(\'cut\'): the tow at its end at once');
  ok(E.T.debug('cut') === false, '… and nothing to cut after');
  const R = towEnv({ flow: 'title' });
  R.H.enterHome('title');
  await R.until(() => R.T.phase === 'wake');
  ok(!R.T.state().marks.some((m) => m.what === 'arrive'), 'Continue before the tow: the dip, then the wake (no arrive beat)');
  const M = R.T.state().marks, at = (w) => M.find((m) => m.what === w)?.sim;
  near(at('wake') - at('dipIn'), D.LOOP.tow.landing.dip, 'the marks on the tow\'s own clock: the dip 0.6 s', 0.05);
}

section('the glide in\'s camera: drawn back from the dip, dollying in to the mooring\'s framing');
{
  const E = towEnv();
  E.H.enterHome('intro');
  await E.until(() => E.T.phase === 'leg');
  eq(E.T.camPull(), 0, 'on the Chart: no pull');
  await E.until(() => E.T.phase === 'dipHold');
  eq(E.T.camPull(), 1, 'at the dip: drawn back');
  await E.until(() => E.T.phase === 'glide');
  ok(E.T.camPull() > 0.95, 'the glide in begins drawn back', E.T.camPull());
  await E.step(1.5);
  const mid = E.T.camPull();
  ok(mid > 0.2 && mid < 0.8, 'half way in, half way back', mid);
  await E.until(() => E.T.phase === null, 3);
  eq(E.T.camPull(), 0, 'at the mooring: its own framing');
  eq(D.LOOP.tow.cam.pull, 2.2, 'LOOP.tow.cam.pull');
  const R = towEnv({ reduced: true });
  R.H.enterHome('intro');
  await R.until(() => R.T.phase === 'dipHold');
  eq(R.T.camPull(), 0, 'reduced motion: no dolly');
}

section('it plays once: a second Sail, the sail home and a Continue never replay it');
{
  const E = towEnv();
  E.H.enterHome('intro');
  await E.until(() => E.names().includes('home:enter'), 30);
  const tows = () => E.ev.filter((x) => x.e === 'loop:tow').length;
  const n0 = tows();
  ok(n0 > 0 && E.T.phase === null, 'the opening\'s tow played');
  ok(E.H.sail({ water: 'mossmere' }) === true, 'the first Sail');
  await E.step(3.5);
  ok(E.ctx.flow === 'playing' && E.T.phase === null && tows() === n0, 'the Sail and its glide out: no tow');
  E.H.endTripHome('home');
  await E.step(3);
  ok(E.ctx.flow === 'home' && E.T.phase === null && tows() === n0, 'the sail home: no tow');
  ok(E.H.sail({ water: 'mossmere' }) === true, 'a second Sail');
  await E.step(3.5);
  ok(E.T.phase === null && tows() === n0, 'a second Sail never replays the tow');
  E.ctx.flow = 'title';
  E.H.enterHome('title');
  ok(E.T.phase === null && tows() === n0, 'Continue at home: no tow');
}

console.log(`\nloop-tow: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
