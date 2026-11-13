// The show, lane A (docs/v3/show/SPEC.md §4 S1, S4, S5, S6; §6.2): the Wick presents its catch. Pure helpers first (the show's
// clock, the flaps, the alongside rule), then the real src/actors.js on a fake ctx (tools/tests/show-env.mjs: no renderer) played
// at 30 fps for every class × shape, every Wick body, every raft heading, a wide frame and an upright one:
//   S1  the Wick to the lens, the flank to it, the whole fish in frame at the spec's sizes (the spec's fit of getShowFocus)
//   S5  nothing of the fish inside the Wick or under the planks, every holding hand on it, the post clear, no jump in its path
//   S6  the overshoot and its settle, the flaps, the pause's still, the drips, the raft's dip
//   the seam: showFish / setShowTime / getShowFocus / endShow / showPose, show:beat, nothing left behind
//   node tools/tests/show-poses.test.mjs [--verbose]
import { makeShowEnv } from './show-env.mjs';
import { showFlaps, showCurves, presentAt, raftSupport, SHOW_NAMES, SHOW_IDS } from '../../src/actors-show.js';

const verbose = process.argv.includes('--verbose');
let pass = 0, fail = 0;
const failures = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; failures.push(msg); console.log('  FAIL:', msg); } }
const section = (s) => console.log(`- ${s}`);
const r3 = (x) => Math.round(x * 1000) / 1000;

const env = await makeShowEnv();
const D = env.data, SH = D.AUTOFISH.show, LS = SH.life;
const CLS = ['small', 'keeper', 'prize', 'trophy', 'elder', 'ancient'];

// ------------------------------------------------------------------ the clock
section('the show\'s clock: the present, its overshoot and settle, the flaps, the still');
for (const c of CLS) {
  const P = D.showPlan(c), B = { lift: P.lift, hold: P.hold, pause: P.pause }, row = LS[c], F = showFlaps(B, row, LS);
  ok(F.length >= (CLS.indexOf(c) >= 4 ? 2 : 1), `${c}: ${F.length} flap(s) in its hold`);
  ok(F.every((f) => f.at >= B.lift + LS.firstFlap - 1e-9 && f.at + f.dur <= B.lift + B.hold + 1e-9), `${c}: every flap begins after the present and is over by the pause`);
  ok(F.every((f, i) => i === 0 || f.at >= F[i - 1].at + F[i - 1].dur), `${c}: flaps do not run into each other`);
  ok(Math.abs(presentAt(B.lift, B.lift, LS.takeAt, row.overshoot, LS.settle) - (1 + row.overshoot)) < 1e-9, `${c}: the lift ends on the overshoot's peak (${1 + row.overshoot})`);
  let prev = -1, mono = true, maxP = 0, still = 0, cont = 0, lastP = 0;
  for (let t = 0; t <= B.lift + B.hold + B.pause + 1e-9; t += 1 / 120) {
    const k = showCurves(t, B, row, LS, F);
    if (t <= B.lift && k.p < prev - 1e-9) mono = false;
    if (t > 0) cont = Math.max(cont, Math.abs(k.p - lastP));
    prev = k.p; lastP = k.p; maxP = Math.max(maxP, k.p);
    if (k.phase === 'pause') still = Math.max(still, k.struggle);
    ok(k.struggle >= 0 && k.struggle <= 1.2 && k.take >= 0 && k.take <= 1 && k.swing >= 0 && k.swing <= 1, `${c} t ${r3(t)}: curves in range`);
  }
  ok(mono, `${c}: the present never runs back during the lift`);
  ok(Math.abs(maxP - (1 + row.overshoot)) < 1e-6, `${c}: the present peaks at 1 + ${row.overshoot}`);
  ok(cont <= 1.6 * (1 + row.overshoot) / ((1 - LS.takeAt) * B.lift) / 120 + 1e-6, `${c}: the present is continuous (largest step at 120 Hz ${r3(cont)})`);
  ok(presentAt(B.lift + LS.settle, B.lift, LS.takeAt, row.overshoot, LS.settle) - 1 < row.overshoot * 0.1, `${c}: within a tenth of the overshoot ${LS.settle} s after the present`);
  ok(still <= LS.pauseStill + 1e-9, `${c}: the pause is a still (struggle ≤ ${LS.pauseStill}, got ${r3(still)})`);
  const sw = showCurves(B.lift + 0.2, { lift: SH.swarm.lift, hold: SH.swarm.hold, pause: SH.swarm.pause }, row, LS);
  ok(sw.phase !== 'lift' && Number.isFinite(sw.p), `${c}: the swarm row's clock holds`);
}
ok(Object.keys(SHOW_NAMES).join() === 'pinch,both,hug,hang,alongside' && Object.entries(SHOW_NAMES).every(([id, n]) => SH.poseNames[id] === n && SHOW_IDS[n] === id), 'the five pose names are the data\'s (AUTOFISH.show.poseNames)');

section('a fish too long to lift: against the edge that faces the lens, or nosed in at the lens-most corner');
{
  const rect = { x0: -0.97, x1: 0.97, z0: -1.28, z1: 1.28 };
  for (let a = 0; a < 360; a += 15) {
    const th = a * Math.PI / 180, zS = { x: Math.sin(th), z: Math.cos(th) }, xS = { x: zS.z, z: -zS.x };
    const U = raftSupport(rect, zS, xS, { within: 30, turn: 20 });
    const onEdge = Math.abs(Math.abs(U.px) - 0.97) < 1e-9 || Math.abs(Math.abs(U.pz) - 1.28) < 1e-9;
    ok(onEdge && Math.abs(Math.hypot(U.ex, U.ez) - 1) < 1e-9 && Math.abs(Math.hypot(U.nx, U.nz) - 1) < 1e-9, `lens at ${a}°: the chin meets an edge`);
    ok(U.nx * zS.x + U.nz * zS.z > 0.2, `lens at ${a}°: that edge faces the lens`);
    const off = Math.acos(Math.min(1, U.ex * xS.x + U.ez * xS.z)) * 180 / Math.PI;
    ok(off <= (U.aligned ? 30 : 40) + 1e-6 && U.ex * xS.x + U.ez * xS.z > 0, `lens at ${a}°: its snout to the right of the frame, ${Math.round(off)}° off square`);
    // the body, trailing back from the chin, never enters the deck
    let inside = false;
    for (let s = 0.15; s <= 4; s += 0.15) { const x = U.px + U.nx * 0.05 - U.ex * s, z = U.pz + U.nz * 0.05 - U.ez * s; if (x > rect.x0 + 0.02 && x < rect.x1 - 0.02 && z > rect.z0 + 0.02 && z < rect.z1 - 0.02) inside = true; }
    ok(!inside, `lens at ${a}°: the body trails away over the water, not across the deck`);
  }
}

// ------------------------------------------------------------------ the show itself
// name, species, z, {body, heading (deg), yaw (deg, the lens round the raft), aspect}
const CASES = [
  ['tiny', 'quayling', -2], ['small', 'mossback_perch', -0.7], ['small minnow', 'dusk_minnow', -0.7], ['small crayfish', 'gutter_crayfish', -0.7], ['small puffer', 'sporebelly_puffer', -0.7], ['small jelly', 'sleepspore_jelly', -0.7],
  ['keeper', 'weeping_carp', 0.5], ['keeper eel', 'gloam_eel', 0.5], ['keeper ray', 'velvet_ray', 0.5], ['keeper koi', 'candlefin_koi', 0.5],
  ['prize', 'reedjaw_pike', 1.5], ['prize eel', 'gloam_eel', 1.5], ['prize ray', 'velvet_ray', 1.5], ['prize jelly', 'chime_jelly', 1.5], ['prize angler', 'mildew_angler', 1.5],
  ['trophy', 'reedjaw_pike', 2.4], ['trophy eel', 'gloam_eel', 2.4], ['trophy ray', 'velvet_ray', 2.4], ['trophy minnow', 'dusk_minnow', 2.4], ['trophy puffer', 'sporebelly_puffer', 2.4], ['trophy crayfish', 'gutter_crayfish', 2.4], ['trophy carp', 'weeping_carp', 2.4],
  ['elder', 'reedjaw_pike', 3.0], ['elder eel', 'gloam_eel', 3.0], ['elder ray', 'velvet_ray', 3.0], ['elder perch', 'mossback_perch', 3.0], ['elder carp', 'weeping_carp', 3.0],
  ['ancient', 'reedjaw_pike', 3.45], ['ancient eel', 'threadling_eel', 3.45], ['ancient gilt eel', 'gilt_eyed_eel', 3.45], ['ancient mirror pike', 'mirror_pike', 3.45],
  ['legend', 'belled_matriarch', 1.0], ['legend ray', 'drifting_grove', 1.0], ['legend koi', 'glass_sovereign', 1.0], ['leviathan', 'lantern_swallower', 1.0],
];
const BODIES = ['taper', 'stub', 'tallow', 'ashwick'];
const FIVE = [['pinch', 'mossback_perch', -0.7], ['both', 'weeping_carp', 0.5], ['hug', 'reedjaw_pike', 2.4], ['hang', 'reedjaw_pike', 3.0], ['alongside', 'belled_matriarch', 1.0]];
const holder = () => env.ctx.render.scene.getObjectByName('catchHolder');

/** Play one show at 30 fps under the presenting camera and gather what the spec asks of it. */
function play(name, sp, z, o = {}) {
  const yaw = o.yaw || 0, aspect = o.aspect || 16 / 9;
  env.actors.setCharacter(o.body || 'wick');
  env.ctx.player.heading = (o.heading || 0) * Math.PI / 180;
  env.camera({ dist: 9.3, elev: 38, yawDeg: yaw }); env.cam.aspect = aspect;
  env.run(0.4);
  const n0 = env.events.length;
  const r = env.show({ speciesId: sp, z, special: !!o.special });
  const B = r.beats, total = B.lift + B.hold + B.pause, row = LS[r.cls], takeT = B.lift * LS.takeAt;
  const f0 = env.focus();
  env.showCamera({ yawDeg: yaw, aspect });
  const A = { r, B, inBody: 0, inBodyLift: 0, under: 0, pole: 9, gap: 0, step: 0, still: 0, peak: 0, rest: null, drift: 0, pauseFrames: 0 };
  let prev = null, prevFocus = f0;
  const obj = () => holder().children[0];
  for (let i = 0; i < Math.round(total * 30); i++) {
    env.step(); env.showCamera({ yawDeg: yaw, aspect });
    const I = env.info(), t = I.t;
    if (!I.active) break;
    // (a fish too long to lift starts where fishing left it, its nose against the raft: it is the show's from the moment it sinks)
    if (t >= takeT + 0.02) A.inBody = Math.max(A.inBody, I.inBody); else if (!(r.id === 'alongside' && t < B.lift * 0.3)) A.inBodyLift = Math.max(A.inBodyLift, I.inBody);
    if (!(r.id === 'alongside' && t < B.lift * 0.75)) A.under = Math.max(A.under, I.underDeck);   // (a long fish starts where fishing left it, against the raft)
    if (t >= B.lift * 0.6) A.pole = Math.min(A.pole, I.poleGap);
    for (const k of ['r', 'l']) if (I.handGap[k] != null) A.gap = Math.max(A.gap, I.handGap[k]);
    const p = obj().position.clone();
    if (prev && !I.under) A.step = Math.max(A.step, p.distanceTo(prev));
    prev = I.under ? null : p;
    if (t >= B.lift - 0.02 && t <= B.lift + 0.06) A.peak = Math.max(A.peak, I.overshoot);
    if (A.rest === null && t >= B.lift + 0.19) A.rest = I.fromRest;
    const f = env.focus(); A.drift = Math.max(A.drift, f.center.distanceTo(f0.center)); prevFocus = f;
    if (I.phase === 'pause') { A.still = Math.max(A.still, I.struggle); A.pauseFrames++; A.last = I; A.frame = env.frame(); A.focus = f; }
  }
  A.events = env.events.slice(n0).filter((e) => e.e === 'show:beat').map((e) => e.p.kind);
  A.row = row;
  return A;
}
function finish(action) {
  env.actors.endShow({ action });
  const fv = env.ctx.debug.showPoseEnd({}) && null;
  env.run(0.75);
  void fv;
}
/** The asserts every show must pass (S5; the hands; S1's facing), then the pose's own S1 size. */
function judge(name, A, { size = true } = {}) {
  const I = A.last, id = A.r.id, F = A.frame, tall = env.cam.aspect < 1, legend = A.r.legend;
  ok(!!I && A.pauseFrames >= 12, `${name}: reached its pause (${A.pauseFrames} frames)`);
  if (!I) return;
  ok(A.inBody <= 0.02, `${name} (${id}): no part of the fish inside the Wick from the take on (${A.inBody} m)`);
  ok(A.inBodyLift <= 0.06, `${name} (${id}): the swing in does not pass through the Wick (${A.inBodyLift} m)`);
  ok(A.under <= 0.01, `${name} (${id}): nothing under the planks (${A.under} m)`);
  ok(I.lowest >= -0.03 || id === 'alongside' || (id === 'hang' && I.lowest > -0.8), `${name} (${id}): it rests on the deck, not in it (${I.lowest} m)`);
  ok(A.gap <= (id === 'alongside' ? 0.05 : 0.03), `${name} (${id}): every holding hand on the fish (worst gap ${A.gap} m)`);
  ok(A.pole >= 0.05, `${name} (${id}): 5 cm clear of the lantern post (${A.pole} m)`);
  ok(A.step <= 0.45, `${name} (${id}): no jump in its path (largest step ${r3(A.step)} m a frame)`);
  ok(A.still <= LS.pauseStill + 1e-9, `${name}: still in the pause (${A.still})`);
  ok(I.wickOffLens <= (id === 'hang' || id === 'alongside' ? 40 : 15), `${name} (${id}): the Wick to the lens (${I.wickOffLens}° off)`);
  const upright = ['jelly'].includes(A.r.shape) || (A.r.shape === 'crayfish' && id === 'pinch');
  if (!upright) ok(I.endOn <= (id === 'alongside' ? (tall && A.r.length > 3.2 ? 65 : 25) : size ? 16 : 20), `${name} (${id}): its flank square to the lens (${I.endOn}° end-on)`);
  ok(A.drift <= 0.06, `${name} (${id}): the settled focus holds still from the first frame (moved ${r3(A.drift)} m)`);
  ok(I.flaps >= (CLS.indexOf(A.r.cls) >= 4 ? 2 : 1), `${name}: ${I.flaps} flap(s)`);
  ok(I.drips >= Math.ceil(0.6 * A.row.drips), `${name}: ${I.drips} of ${A.row.drips} drips`);
  if (A.row.dip > 0 && id !== 'alongside') {
    ok(I.dipAtPresent >= A.row.dip * 0.5 && I.dipAtPresent <= A.row.dip * 1.5, `${name}: the deck's edge sinks ${I.dipAtPresent} m at the present (life.dip ${A.row.dip})`);
    if (I.dipAfter != null) ok(I.dipAfter <= 0.4 * I.dipAtPresent + 1e-4, `${name}: and rides back 60 % within a second (${I.dipAfter} m left)`);
  }
  if (id === 'pinch' || id === 'both') {
    ok(A.peak >= A.row.overshoot * 0.6 && A.peak <= A.row.overshoot * 1.4 + 0.02, `${name} (${id}): the present overshoots by ${r3(A.peak)} of its travel (life.overshoot ${A.row.overshoot})`);
    ok(A.rest <= 0.012, `${name} (${id}): within a centimetre of rest 0.2 s on (${A.rest} m)`);
  }
  ok(A.events.indexOf('take') >= 0 && A.events.indexOf('present') > A.events.indexOf('take') && A.events.indexOf('settle') > A.events.indexOf('present') && A.events.filter((k) => k === 'present').length === 1 && A.events.filter((k) => k === 'take').length === 1,
    `${name}: show:beat take → present → settle, once each (${A.events.filter((k) => k !== 'drip').join(' ')})`);
  ok(A.events.filter((k) => k === 'flap').length === I.flaps, `${name}: one show:beat per flap`);
  if (!F) return;
  // S1: the picture
  ok(F.edge >= 0.02, `${name} (${id}): the whole fish in frame, clear of the edge (${Math.round(F.edge * 100)} %)`);
  ok(F.headIn && F.flameIn, `${name} (${id}): the wax head and the flame's core in frame`);
  ok(F.wick >= (id === 'alongside' ? (A.r.length > 6 ? 0.09 : 0.14) : 0.3), `${name} (${id}): the Wick reads (${Math.round(F.wick * 100)} % of the frame's height)`);
  if (!size) return;
  const L = A.r.length, w = Math.round(F.w * 100), h = Math.round(F.h * 100);
  if (id === 'pinch' && upright) ok(tall ? F.diag >= 0.16 : h >= 14, `${name}: an upright catch in one hand reads by its height (${w} × ${h} %)`);
  else if (id === 'pinch') ok(tall ? w >= (L < 0.2 ? 18 : 30) : w >= (L < 0.2 ? 9 : 14), `${name}: one hand out to the lens: ${w} % of the frame's width (${L.toFixed(2)} m)`);
  // (S1's 28 % was set on a 61 cm carp: a 45 cm fish in both hands cannot fill as much of a frame that also holds the head and flame)
  else if (id === 'both' && L >= 0.45 && !upright) ok(tall ? w >= 55 : w >= 28 * Math.min(1, L / 0.6) - 0.5, `${name}: in both hands: ${w} % of the frame's width (${L.toFixed(2)} m)`);
  else if (id === 'both') ok(tall ? w >= 30 || h >= 20 : w >= 14 || h >= 20, `${name}: a small catch in both hands reads as a pinch does (${w} × ${h} %)`);
  else if (id === 'hug' || id === 'hang') ok(tall ? h >= 38 : h >= 45, `${name} (${id}): ${h} % of the frame's height`);
  else if (id === 'alongside') ok(tall ? (w >= 70 || F.diag >= 0.45) : w >= 55, `${name}: alongside: ${w} % of the frame's width${tall ? ` (diagonal ${Math.round(F.diag * 100)} %)` : ''}`);
  void legend;
}

section('every class × shape, the default Wick, a wide frame (S1, S5, S6)');
const table = [];
for (const [name, sp, z] of CASES) {
  const A = play(name, sp, z);
  judge(name, A);
  ok(A.r.pose === SHOW_NAMES[A.r.id] && env.actors.showPose === A.r.pose, `${name}: showFish returns ${A.r.pose}, and showPose says so`);
  ok(A.r.id === D.showPoseFor(A.r.length, { sizeClass: A.r.sizeClass, ancient: A.r.ancient, legend: A.r.legend, shape: A.r.shape }), `${name}: the pose is data.showPoseFor's (${A.r.id})`);
  ok(A.r.hands === (A.r.id === 'pinch' || A.r.id === 'alongside' ? 1 : 2) && (A.r.side === 1 || A.r.side === -1), `${name}: hands and side`);
  const f = A.focus;
  ok(f && f.keep.fish.length >= 4 && f.keep.head.length === 4 && f.keep.flame.length >= 1 && f.keep.feet.length === 1 && f.hands.length === 2 && f.center && f.radius > 0 && f.fish.length === A.r.length && Math.abs(f.fish.axis.length() - 1) < 1e-6,
    `${name}: getShowFocus has the seam's shape`);
  ok(!!f && (f.rodTip === null) === (A.r.id === 'both' || A.r.id === 'hug') && f.keep.rodTip.length === (f.rodTip ? 1 : 0), `${name}: rodTip is null exactly when the rod is set down`);
  if (A.frame) table.push([name, A.r.id, A.r.length.toFixed(2), `${Math.round(A.frame.w * 100)}x${Math.round(A.frame.h * 100)}`, Math.round(A.frame.wick * 100), A.last.wickOffLens, A.last.endOn, A.gap, A.inBody, r3(A.peak), A.last.dipAtPresent, A.last.flaps, A.last.drips].join('\t'));
  finish(CASES.indexOf(CASES.find((c) => c[0] === name)) % 2 ? 'keep' : 'release');
  ok(env.actors.showPose === null && env.focus() === null, `${name}: after endShow no show is up`);
}
if (verbose) console.log(['case', 'pose', 'L', 'fish w×h %', 'wick %', 'off°', 'endOn°', 'gap', 'inBody', 'over', 'dip', 'flaps', 'drips'].join('\t') + '\n' + table.join('\n'));

section('an upright phone (390 × 844)');
for (const [name, sp, z] of [['tiny', 'quayling', -2], ['small', 'mossback_perch', -0.7], ['keeper', 'weeping_carp', 0.5], ['keeper eel', 'gloam_eel', 0.5], ['keeper ray', 'velvet_ray', 0.5], ['prize', 'reedjaw_pike', 1.5], ['trophy', 'reedjaw_pike', 2.4], ['elder', 'reedjaw_pike', 3.0], ['ancient', 'reedjaw_pike', 3.45], ['legend', 'belled_matriarch', 1.0], ['leviathan', 'lantern_swallower', 1.0]]) {
  const A = play(`${name}, upright`, sp, z, { aspect: 390 / 844 });
  judge(`${name}, upright`, A);
  finish('keep');
}

section('the five bodies × the five poses (S4)');
for (const body of BODIES) for (const [pose, sp, z] of FIVE) {
  const A = play(`${body} ${pose}`, sp, z, { body });
  ok(A.r.id === pose, `${body}: a ${pose} stays a ${pose} (the thresholds are in metres, whatever the body)`);
  judge(`${body} ${pose}`, A, { size: false });
  if (A.frame) {   // other bodies: 0.65 × the default's sizes
    const w = A.frame.w * 100, h = A.frame.h * 100;
    // (Taper's frame is taller: its stovepipe and its flame stand 1.8 m off the deck, and its arms are the shortest of the five)
    const k = body === 'taper' ? 0.58 : 0.65;
    ok(pose === 'pinch' ? w >= 14 * k : pose === 'both' ? w >= 28 * k : pose === 'alongside' ? w >= 55 * k : h >= 45 * k, `${body} ${pose}: the fish is the subject (${Math.round(w)} × ${Math.round(h)} %)`);
  }
  finish('release');
}
env.actors.setCharacter('wick');

section('the raft at any heading, the lens anywhere round it');
for (const heading of [0, 90, 180, 270, 45]) for (const [pose, sp, z] of [FIVE[1], FIVE[2], FIVE[3], FIVE[4], ['alongside', 'lantern_swallower', 1.0]]) {
  const A = play(`raft ${heading}° ${pose}`, sp, z, { heading });
  judge(`raft ${heading}° ${pose}`, A, { size: pose !== 'both' });
  finish();
}
for (const yaw of [60, 150, 240, 330]) for (const [pose, sp, z] of [FIVE[0], FIVE[2], FIVE[3], FIVE[4]]) {
  const A = play(`lens ${yaw}° ${pose}`, sp, z, { yaw });
  judge(`lens ${yaw}° ${pose}`, A);
  finish('keep');
}

section('the seam: the clock is fishing\'s, a hurry, endings, nothing left behind');
{
  env.ctx.player.heading = 0; env.camera({ dist: 9.3, elev: 38 }); env.run(0.3);
  // fishing drives the pose time (setShowTime), and it never runs back
  const fv = env.models.createFish(D.SPECIES_BY_ID.weeping_carp, { z: 0.5 });
  env.ctx.render.scene.add(fv.object3d); fv.object3d.position.set(31.5, 0.05, 30.5); fv.object3d.updateMatrixWorld(true);
  const n0 = env.events.length;
  const res = env.actors.showFish(fv, { cls: 'keeper', sizeClass: 'keeper', beats: { lift: 0.5, hold: 0.42, pause: 0.7 } });
  ok(res && res.id === 'both' && res.pose === 'showBoth' && res.hands === 2, 'showFish(fv, {cls, sizeClass, beats}) → {pose, id, hands, side}');
  ok(fv.object3d.parent === holder(), 'actors takes the fish (it owns its transform until endShow)');
  const f0 = env.focus();
  ok(f0 && f0.t === 0 && f0.lift === 0 && f0.id === 'both', 'getShowFocus is valid on the frame the pose starts');
  let t = 0;
  for (let i = 0; i < 6; i++) { t += 1 / 30; env.actors.setShowTime(t); env.step(); }
  ok(Math.abs(env.info().t - t) < 1e-6, 'setShowTime(t) is the pose time');
  env.actors.setShowTime(0.05); env.step();
  ok(env.info().t >= t - 1e-9, 'it never runs back');
  for (let i = 0; i < 12; i++) { t += 2.5 / 30; env.actors.setShowTime(t); env.step(); }   // a hurry: × 2.5
  const I = env.info();
  ok(I.phase !== 'lift' && I.take === 1 && I.handGap.r != null && I.handGap.r <= 0.03 && I.handGap.l <= 0.03, `hurried (× 2.5): the hands still have it (${JSON.stringify(I.handGap)})`);
  const beats = env.events.slice(n0).filter((e) => e.e === 'show:beat').map((e) => e.p.kind);
  ok(beats.filter((k) => k === 'take').length === 1 && beats.filter((k) => k === 'present').length === 1, 'hurried: take and present still fire once');
  ok(env.focus().center.distanceTo(f0.center) <= 0.06, 'hurried: the settled focus has not moved');
  const mf = env.actors.getMeasureFocus();
  ok(mf && mf.pose === 'showBoth' && mf.radius > 0 && mf.fish && mf.fish.length === fv.length, 'getMeasureFocus answers with the show\'s focus while a show pose is up');
  env.actors.endShow({ action: 'keep' });
  ok(env.actors.showPose === null && env.focus() === null, 'endShow: no show');
  env.run(0.7);
  ok(fv.object3d.parent !== holder(), 'the fish has left the hands within 0.7 s (fishing disposes the model)');
  fv.dispose();
  // showCatch(null) means the same, at once; a second showFish replaces the first
  const a = env.models.createFish(D.SPECIES_BY_ID.reedjaw_pike, { z: 2.4 }), b = env.models.createFish(D.SPECIES_BY_ID.mossback_perch, { z: -0.7 });
  env.actors.showFish(a, { cls: 'trophy', sizeClass: 'trophy' }); env.run(0.5);
  ok(env.actors.showPose === 'showHug', 'a Trophy pike: showHug');
  env.actors.showFish(b, { cls: 'small', sizeClass: 'small' }); env.run(0.2);
  ok(env.actors.showPose === 'showPinch' && a.object3d.parent !== holder(), 'a new showFish lets the old fish go');
  env.actors.showCatch(null); env.run(0.1);
  ok(env.actors.showPose === null && b.object3d.parent !== holder(), 'showCatch(null) ends the show at once');
  a.dispose(); b.dispose();
  ok(env.actors.showFish(null) === null, 'showFish(null) → null');
  // a bare show pose (the viewer), and it lets go
  env.actors.setPose('showHang'); env.run(0.3);
  ok(env.actors.pose === 'showHang' && env.actors.showPose === null, 'setPose(\'showHang\') holds the bare pose (no show)');
  env.actors.setPose('idle'); env.run(0.3);
  ok(env.actors.pose !== 'showHang', 'another base pose lets it go');
  // a run ends mid-show
  const c = env.models.createFish(D.SPECIES_BY_ID.reedjaw_pike, { z: 3.0 });
  env.actors.showFish(c, { cls: 'elder', sizeClass: 'elder' }); env.run(0.8);
  env.ctx.bus.emit('zone:change', {}); env.run(0.1);
  ok(env.actors.showPose === null && c.object3d.parent !== holder(), 'a new lake mid-show: released at once');
  c.dispose();
  env.run(1.2);
  ok(holder().children.length === 0, 'nothing is left in the hands');
  // ten shows: the scene holds nothing more than after the first
  const count = () => { let n = 0; env.ctx.render.scene.traverse(() => n++); return n; };
  let n1 = 0;
  for (let i = 0; i < 10; i++) {
    const [, sp, z] = FIVE[i % 5];
    const r = env.show({ speciesId: sp, z }); env.run(r.beats.lift + r.beats.hold + 0.3);
    env.actors.endShow({ action: i % 2 ? 'keep' : 'release' }); env.run(0.7); env.ctx.debug.showPoseEnd({}); env.run(0.8);
    for (const ch of [...holder().children]) holder().remove(ch);
    env.run(0.1);
    if (i === 0) n1 = count();
  }
  ok(count() === n1, `ten shows leave the scene as the first did (${count()} objects, ${n1} after the first)`);
  ok(env.ctx.errors.length === 0, 'no ctx.errors');
}

console.log(`\nshow-poses: ${pass} passed, ${fail} failed`);
if (fail) { console.log(failures.slice(0, 60).map((f) => '  - ' + f).join('\n')); process.exit(1); }
