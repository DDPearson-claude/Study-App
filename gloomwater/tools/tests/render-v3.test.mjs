// Unit tests for render's v3 camera maths (DESIGN §25.14.2 R1 / R2, CONTRACT §13.7 render): the presets read from
// BALANCE.cameras in render's convention, the fish / reel distances (line distance only, never the size class), the night
// rule (combat.swarmActive, never the phase) and the trophy shot (distance, crane, yaw toward the landmark, portrait fit).
//   node tools/tests/render-v3.test.mjs
globalThis.GW_V3 = true;
globalThis.GW_V3_PHASE = 1;
const data = await import('../../src/data.js');
const C = await import('../../src/render-camera.js');
const { MODES } = await import('../../src/render.js');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; failures.push(msg); console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const near = (a, b, msg, eps = 1e-9) => ok(Math.abs(a - b) <= eps, `${msg} (got ${a}, want ${b})`);
const section = (s) => console.log(`- ${s}`);
const DEG = Math.PI / 180;

const CAM = data.BALANCE.cameras;
ok(data.V3_ENABLED === true && data.V3_PHASE === 1 && !!CAM, 'v3 phase-1 data carries BALANCE.cameras');

// ------------------------------------------------------------------ R1: presets from BALANCE.cameras
section('R1 presets (render convention)');
{
  const v = C.v3Presets(CAM, MODES);
  const S = v.modes.sail, F = v.modes.fish, R = v.modes.reel, N = v.modes.night;
  eq([S.elev, S.dist, S.aim, S.aimY, S.fov], [24, 15, 6.5, 1.4, 52], 'sail 24° / 15 m / aim 6.5 / aimY 1.4 / fov 52');
  eq([F.elev, F.dist], [28, 13], 'fish 28° / 13 m');
  for (const k of C.PARAM_KEYS) {
    eq(S[k], CAM.sail[k], `sail.${k} is data's`);
    eq(F[k], CAM.fish[k], `fish.${k} is data's`);
    eq(R[k], CAM.reel[k], `reel.${k} is data's`);
  }
  eq(N, MODES.night, 'night keeps render\'s overview numbers (data carries its rule only)');
  eq(v.modes.title, MODES.title, 'title untouched in P1');
  eq(v.modes.shop, MODES.shop, 'shop untouched in P1');
  eq(v.modes.death, MODES.death, 'death untouched in P1');
  eq(v.nightBlend, CAM.night.blend, 'night blend rate from data');
  eq(v.nightFollows, 'swarmActive', 'the night overview follows combat.swarmActive');
  eq(v.downAim, { fish: MODES.fish.aim, reel: MODES.reel.aim }, 'casts toward the camera keep v1\'s plain lean');
  // the v1 table is never mutated by the merge (flag-off parity)
  eq([MODES.sail.elev, MODES.sail.dist, MODES.fish.elev, MODES.fish.dist], [32, 16.5, 34, 14], 'v1 MODES untouched');
  for (const k of Object.keys(MODES)) ok(v.modes[k] !== MODES[k], `v3 ${k} is a copy, not v1's object`);
  // pitch in render's convention
  near(C.pitchOf(S), Math.atan2(15 * Math.sin(24 * DEG) - 1.4, 15 * Math.cos(24 * DEG) + 6.5) / DEG, 'sail pitch = atan((d·sin e − aimY)/(d·cos e + aim))');
  ok(C.pitchOf(S) > 12 && C.pitchOf(S) < 14.5, `sail looks ≈ 13° down (got ${C.pitchOf(S).toFixed(2)})`);
  ok(C.pitchOf(F) > 30 && C.pitchOf(F) < 34, `fish looks ≈ 32° down (got ${C.pitchOf(F).toFixed(2)})`);
  // a missing / partial table falls back to v1's numbers key by key
  const part = C.v3Presets({ sail: { elev: 20 } }, MODES);
  eq([part.modes.sail.elev, part.modes.sail.dist], [20, MODES.sail.dist], 'partial table: present keys win, the rest are v1\'s');
  eq(C.v3Presets(null, MODES).modes.reel, { ...MODES.reel }, 'no table: v1\'s reel');
}

// ------------------------------------------------------------------ R1: reel / fish distances never read the size class
section('R1 reel distance follows the line only');
{
  const R = C.v3Presets(CAM, MODES).modes.reel;
  eq(C.reelDistance.length, 2, 'reelDistance(sep, base): no class, tension or species argument exists');
  for (const sep of [0, 3, 6, 10, 14.2, 22, 39]) near(C.reelDistance(sep, R), Math.max(R.dist, 7.5 + sep * 0.6), `reel distance at ${sep} m`);
  ok(C.reelDistance(4, R) === R.dist, 'a short line keeps the preset distance');
  ok(C.reelDistance(20, R) > C.reelDistance(10, R), 'a longer line pulls the camera back');
  near(C.reelDistance(80, R), C.reelDistance(40, R), 'the line distance is capped at 40 m');
  const F = C.v3Presets(CAM, MODES).modes.fish;
  near(C.fishDistance(4, F), 13, 'fish: short casts keep 13 m');
  near(C.fishDistance(12, F), 8.5 + 12 * 0.78, 'fish: long casts back off with the line');
  near(C.fishElev(10, F), 28, 'fish: 28° up to 12 m');
  near(C.fishElev(20, F), 28 + 8 * 0.4, 'fish: rises past 12 m');
}

// ------------------------------------------------------------------ R1: the night rule
section('R1 night overview follows combat.swarmActive');
{
  eq(C.nightTarget({ playing: true, swarmActive: true }), 1, 'a swarm window → night');
  eq(C.nightTarget({ playing: true, swarmActive: false }), 0, 'a Stillnight / lamp-watch / quiet tail → sail');
  eq(C.nightTarget({ playing: false, swarmActive: true }), 0, 'not in play → no overview');
  eq(C.nightTarget({ playing: true }), 0, 'unknown swarm state → sail');
}

// ------------------------------------------------------------------ R2: the trophy shot
section('R2 trophy distance, crane, yaw');
{
  const T = C.trophyRule(CAM, data.BALANCE.ceremony?.camera);
  eq([T.base, T.perM, T.min, T.max, T.craneAbove, T.craneElev, T.yawMax], [1.2, 1.6, 1.6, 16, 4, 50, 35], 'rule from data (cameras.trophy / ceremony.camera)');
  eq(C.v3Presets(CAM, MODES).trophy.yawMax, 35, 'v3Presets carries the same rule');
  near(C.trophyDistance(0.2, T), 1.6, '0.2 m fish → 1.6 m (clamped)');
  near(C.trophyDistance(1.2, T), 3.12, '1.2 m fish → 3.12 m', 1e-12);
  near(C.trophyDistance(8.5, T), 14.8, '8.5 m fish → 14.8 m', 1e-12);
  near(C.trophyDistance(12, T), 16, 'a 12 m fish → 16 m (clamped)');
  near(C.trophyDistance(0.04, T), 1.6, 'a 4 cm fry → 1.6 m');
  eq([C.trophyCranes(0.2, T), C.trophyCranes(1.2, T), C.trophyCranes(4, T), C.trophyCranes(4.01, T), C.trophyCranes(8.5, T)], [false, false, false, true, true], 'cranes only above 4 m');
  near(C.trophyElev(8.5, T, 0), 18, 'the crane starts at the preset 18°');
  near(C.trophyElev(8.5, T, C.CRANE_DELAY + C.CRANE_TIME), 50, 'the crane reaches 50°');
  near(C.trophyElev(8.5, T), 50, 'settled crane: 50°');
  near(C.trophyElev(1.2, T, 99), 18, 'no crane at 1.2 m: 18°');
  const mid = C.trophyElev(8.5, T, C.CRANE_DELAY + C.CRANE_TIME / 2);
  near(mid, 34, 'the crane is eased (half way at half time)', 1e-9);
  let mono = true, prev = -1;
  for (let t = 0; t <= 3; t += 0.05) { const e = C.trophyElev(8.5, T, t); if (e < prev - 1e-12) mono = false; prev = e; }
  ok(mono, 'the crane never dips');
  ok(Math.abs(C.trophyElev(8.5, T, C.CRANE_DELAY + 0.01) - 18) < 0.01, 'the crane starts gently (ease in)');
  // yaw: north (0) without a landmark; toward the landmark, clamped to ±35°
  const at = { x: 10, z: -4 };
  eq(C.trophyYaw(at, null, 35), 0, 'no landmark (no place) → north');
  eq(C.trophyYaw(at, undefined, 35), 0, 'undefined landmark → north');
  near(C.trophyYaw(at, { x: 10, y: 3, z: -40 }, 35), 0, 'a landmark due north → north');
  near(C.trophyYaw(at, { x: 10 - Math.tan(20 * DEG) * 30, y: 3, z: -34 }, 35) / DEG, 20, 'a landmark 20° west of north → yaw +20° (toward −X)', 1e-9);
  near(C.trophyYaw(at, { x: 50, y: 3, z: -4 }, 35) / DEG, -35, 'a landmark due east → clamped to −35°', 1e-9);
  near(C.trophyYaw(at, { x: -30, y: 3, z: -4 }, 35) / DEG, 35, 'a landmark due west → clamped to +35°', 1e-9);
  ok(Math.abs(C.trophyYaw(at, { x: 11, y: 3, z: 40 }, 35)) <= 35 * DEG + 1e-12, 'a landmark behind → never more than ±35°');
  eq(C.trophyYaw(at, { x: 10, y: 3, z: -4 }, 35), 0, 'a landmark on the subject → north');
  // the subject raised above the frame's centre (ui's band owns its foot) and the fov fit
  const lift = C.trophyLift(3.12, 44, 18);
  ok(lift < 0, 'the camera looks a little below the subject (it sits above the frame centre)');
  near(Math.atan(-lift * Math.cos(18 * DEG) / 3.12), Math.atan(2 * C.TROPHY_UP * Math.tan(22 * DEG)), 'the subject sits TROPHY_UP of the frame height above centre', 1e-12);
  ok(C.trophyLift(14.8, 46, 50) < C.trophyLift(14.8, 46, 18), 'looking down from the crane needs a deeper offset for the same screen lift');
  eq(C.trophyFov(44, 0.5, 3.12, 16 / 9), 44, 'a subject that fits keeps the preset fov 44');
  const fh = C.trophyFov(44, 1.25, 3.12, 16 / 9);
  ok(fh > 44 && fh < 52, `a tall hang subject widens a little so its top clears the frame (got ${fh.toFixed(1)})`);
  const tTop = Math.tan(fh / 2 * DEG) * (1 - 2 * C.TROPHY_UP) * 3.12;
  ok(tTop >= 1.25 * 0.95 - 1e-9, 'the widened fov covers the raised subject\'s top');
  const pf = C.trophyFov(44, 1.6, 3.12, 390 / 844);
  ok(pf > 44 && pf <= 80, `portrait widens the fov so the subject fits across (got ${pf.toFixed(1)})`);
  const pf2 = C.trophyFov(44, 1.2, 3.12, 390 / 844, { across: C.trophyAcross(1.2) });
  ok(Math.tan(pf2 / 2 * DEG) * (390 / 844) * 3.12 >= 1.2 * C.trophyAcross(1.2) * 0.95 - 1e-9, 'across: a hanging fish spans 0.85 of its radius sideways');
  ok(pf2 < C.trophyFov(44, 1.2, 3.12, 390 / 844), 'a held fish needs less width than its whole radius');
  eq([C.trophyAcross(0.2), C.trophyAcross(0.6), C.trophyAcross(1.2), C.trophyAcross(8.5)], [0.65, 0.75, 0.85, 1], 'across shares by pose');
  eq(C.trophyFov(44, 9, 14.8, 390 / 844, { cap: 80 }), 80, 'never past the cap');
  // trophyFit: landscape keeps the rule's distance; portrait fits up to 66°, then steps back (≤ 1.6×)
  for (const [L, r] of [[0.2, 0.7], [1.2, 1.8], [8.5, 5.5]]) {
    const dd = C.trophyDistance(L, T), up = C.trophyUp(L, T), across = C.trophyAcross(L);
    const land = C.trophyFit(44, r, dd, 16 / 9, { up, across });
    eq(land.dist, dd, `landscape ${L} m: the rule's distance ${dd} m`);
    ok(land.fov >= 44 && land.fov <= 80, `landscape ${L} m: fov ${land.fov.toFixed(1)} within 44–80`);
    const port = C.trophyFit(44, r, dd, 390 / 844, { up, across });
    ok(port.fov <= C.TROPHY_PORTRAIT_FOV + 1e-9 && port.dist >= dd - 1e-9 && port.dist <= dd * C.TROPHY_PORTRAIT_BACK + 1e-9, `portrait ${L} m: fov ${port.fov.toFixed(1)} ≤ 66, distance ${port.dist.toFixed(2)} in [rule, 1.6× rule]`);
    const t = Math.tan(port.fov / 2 * DEG);
    ok(port.dist === dd * C.TROPHY_PORTRAIT_BACK || C.trophyNeed(r, port.dist, 390 / 844, { up, across }) <= t + 1e-9, `portrait ${L} m: the subject fits`);
  }
  eq(C.trophyFit(44, 0.7, 1.6, 390 / 844, { up: 0.06, across: 0.65 }).dist, 1.6, 'a palm catch on a phone keeps 1.6 m');
  eq([C.trophyUp(0.2, T), C.trophyUp(0.6, T), C.trophyUp(1.2, T), C.trophyUp(3, T), C.trophyUp(8.5, T)], [0.06, C.TROPHY_UP, C.TROPHY_UP, 0.11, 0.14], 'the subject rides higher for an alongside fish and under the crane');
}

// ------------------------------------------------------------------ the show camera (docs/v3/show/SPEC.md §2.6; AUTOFISH.show.camera)
section('the show camera: the fit of named points, for 16:9 and a phone held upright, from a few centimetres to several metres');
{
  const SC = data.AUTOFISH.show.camera;
  const P3 = (x, y, z) => ({ x, y, z });
  /** A stand-in layout: the Wick at the origin facing +z (the lens is to the south, yaw 0), the fish held `reach` m toward the lens. */
  const layout = (L, { reach = 0.3, y = 0.62, depth = L * 0.25, dx = 0 } = {}) => {
    const head = P3(0, 0.82, 0), hr = 0.21;
    return { fish: P3(dx, y, reach), points: [P3(dx + L / 2, y, reach), P3(dx - L / 2, y, reach), P3(dx, y + depth / 2, reach), P3(dx, y - depth / 2, reach),
      P3(hr, head.y, 0), P3(-hr, head.y, 0), P3(0, head.y + hr, 0), P3(0, head.y - hr, 0), P3(0, 1.2, 0)] };
  };
  const within = (pts, fit, o, m) => pts.every((p) => { const q = C.showProject(p, fit, o); return Math.abs(q.x) <= 1 - 2 * m + 1e-6 && Math.abs(q.y) <= 1 - 2 * m + 1e-6 && q.z > 0; });
  const edge = (pts, fit, o) => Math.max(...pts.map((p) => { const q = C.showProject(p, fit, o); return Math.max(Math.abs(q.x), Math.abs(q.y)); }));
  for (const aspect of [960 / 540, 390 / 844, 1, 21 / 9]) {
    for (const [pose, L, o2] of [['pinch', 0.067, { reach: 0.42, y: 0.8, dx: 0.2 }], ['pinch', 0.33, {}], ['both', 0.61, { reach: 0.24 }], ['both', 0.89, { reach: 0.24 }], ['hug', 1.12, { reach: 0.15, y: 0.56, depth: 1.12, dx: 0.3 }],
      ['hang', 1.66, { reach: 0.05, y: 0.9, depth: 1.66, dx: 0.4 }], ['alongside', 2.65, { reach: 0.9, y: 0.1 }], ['alongside', 9.1, { reach: 1.6, y: 0.1 }]]) {
      const row = C.showRow(SC, pose, { length: L, aspect });
      const lay = layout(L, o2);
      const o = { yaw: 0, elev: row.elev, fov: row.fov, aspect, margin: row.margin, minLens: SC.minLens, depthAt: lay.fish };
      const fit = C.showFit(lay.points, o);
      const tag = `${pose} ${L} m @ ${aspect.toFixed(2)}`;
      ok(fit && fit.dist > 0 && within(lay.points, fit, o, row.margin), `${tag}: every kept point inside the safe area (lens ${fit?.dist.toFixed(2)} m, fov ${row.fov.toFixed(0)}°)`);
      ok(fit.by === 'near' || Math.abs(edge(lay.points, fit, o) - (1 - 2 * row.margin)) < 1e-6, `${tag}: the tightest point sits on the safe area's edge (the smallest distance that holds)`);
      ok(lay.points.every((p) => C.showProject(p, fit, o).z >= SC.minLens - 1e-6), `${tag}: the lens is never nearer than ${SC.minLens} m to a kept point`);
      // a smaller distance would crop: at 0.97 × the fitted distance some point leaves the safe area (unless minLens set it)
      if (fit.by !== 'near') ok(!within(lay.points, { ...fit, dist: fit.dist * 0.97 }, o, row.margin), `${tag}: 3 % nearer crops`);
    }
  }
  // the fisherman's trick is the fit's own arithmetic: held toward the lens, the same fish fills more of the frame
  const rowB = C.showRow(SC, 'both', { length: 0.6, aspect: 16 / 9 });
  // (the fish's width over the wax head's width, on screen)
  const share = (reach) => { const lay = layout(0.6, { reach }); const o = { yaw: 0, elev: rowB.elev, fov: rowB.fov, aspect: 16 / 9, margin: rowB.margin, depthAt: lay.fish }; const fit = C.showFit(lay.points, o);
    const w = (a, b) => C.showProject(lay.points[a], fit, o).x - C.showProject(lay.points[b], fit, o).x;
    return w(0, 1) / w(4, 5); };
  ok(share(0.3) > share(0.05) * 1.15 && share(0.5) > share(0.3) * 1.1, `held out to the lens the fish looks bigger beside the face (× ${share(0.05).toFixed(2)} → × ${share(0.3).toFixed(2)} → × ${share(0.5).toFixed(2)} the head's width)`);
  // room over the flame and under the hands; a card's lift
  const lay = layout(0.33), o0 = { yaw: 0, elev: 8, fov: 44, aspect: 16 / 9, margin: 0.08, depthAt: lay.fish };
  const f1 = C.showFit(lay.points, { ...o0, marginTop: 0.12, marginBottom: 0.1 });
  const ys = lay.points.map((p) => C.showProject(p, f1, o0).y);
  near(Math.max(...ys), 1 - 0.24, 'marginTop: the highest point sits 12 % under the top edge', 1e-6);
  near(Math.min(...ys), -(1 - 0.2), 'marginBottom: the lowest 10 % over the foot', 1e-6);
  const f2 = C.showFit(lay.points, { ...o0, shiftY: 0.24 });
  near(Math.min(...lay.points.map((p) => C.showProject(p, f2, o0).y)) - Math.min(...lay.points.map((p) => C.showProject(p, C.showFit(lay.points, o0), o0).y)), 0.48, 'shiftY 0.24 raises the subject 24 % of the frame\'s height', 0.02);
  // any yaw: the fit turns with the lens (the raft's heading does not matter)
  for (const yaw of [0, 1.1, -2.4, Math.PI]) {
    const rot = (p) => ({ x: p.x * Math.cos(yaw) + p.z * Math.sin(yaw), y: p.y, z: -p.x * Math.sin(yaw) + p.z * Math.cos(yaw) });
    const pts = lay.points.map(rot), o = { ...o0, yaw, depthAt: rot(lay.fish) };
    near(C.showFit(pts, o).dist, C.showFit(lay.points, o0).dist, `yaw ${yaw.toFixed(1)}: the same distance`, 1e-9);
  }
  ok(C.showFit([], o0) === null && C.showFit([{ x: NaN, y: 0, z: 0 }], o0) === null, 'no points: no fit');
  // (the review's fixes, SPEC §8) a wide screen's card stands at the right: the picture is fitted into the left of the frame
  { const fS = C.showFit(lay.points, { ...o0, marginRight: 0.5 }), xsS = lay.points.map((p) => C.showProject(p, fS, o0).x);
    ok(Math.max(...xsS) <= 1 - 2 * 0.5 + 1e-3 && Math.min(...xsS) >= -1 + 2 * o0.margin - 0.02, `marginRight 0.5: every point in the left half, inside the left margin (x ${Math.min(...xsS).toFixed(2)} … ${Math.max(...xsS).toFixed(2)})`);
    ok(fS.dist >= C.showFit(lay.points, o0).dist - 1e-9, 'marginRight never brings the lens nearer'); }
  // the way back runs at an even rate of zoom: 0 → 1, never backwards, slow at both ends, and far gentler at the start than a plain ease
  { let prev = 0, mono = true; for (let i = 0; i <= 100; i++) { const e = C.showOutEase(i / 100, 8); if (e < prev - 1e-12) mono = false; prev = e; }
    ok(mono && Math.abs(C.showOutEase(0, 8)) < 1e-12 && Math.abs(C.showOutEase(1, 8) - 1) < 1e-12, 'showOutEase: 0 → 1, monotonic');
    ok(C.showOutEase(0.33, 8) < 0.5 * C.showEase(0.33), `showOutEase: a third of the way through the lens has gone ${(C.showOutEase(0.33, 8) * 100).toFixed(0)} % of its way (a plain ease: ${(C.showEase(0.33) * 100).toFixed(0)} %)`);
    near(C.showOutEase(0.4, 1), C.showEase(0.4), 'showOutEase: with no change of distance it is the plain ease', 2e-3); }
  // a tiny pinch brings the lens down to the hand's height; a flame far above the catch (the Taper) brings a `both` lens under it
  ok(C.showRow(SC, 'pinch', { length: 0.1, aspect: 16 / 9 }).elev === SC.pose.pinch.tinyElev && C.showRow(SC, 'pinch', { length: 0.33, aspect: 16 / 9 }).elev === SC.pose.pinch.elev, 'pinch: tinyElev under tinyBelow only');
  ok(C.showRow(SC, 'both', { length: 0.6, aspect: 16 / 9, rise: 0.8 }).elev === SC.pose.both.elev && C.showRow(SC, 'both', { length: 0.6, aspect: 16 / 9, rise: 1.5 }).elev === SC.pose.both.lowElev, 'both: the lens comes down only when the flame stands far over the catch');
  // the rows: fov by screen, a tiny fish's wider lens, the crane, the upright rake
  eq([C.showRow(SC, 'pinch', { length: 0.33, aspect: 16 / 9 }).fov, C.showRow(SC, 'pinch', { length: 0.1, aspect: 16 / 9 }).fov, C.showRow(SC, 'pinch', { length: 0.33, aspect: 390 / 844 }).fov],
    [SC.pose.pinch.fov, SC.pose.pinch.tinyFov, SC.pose.pinch.fovPortrait], 'pinch: 44°; 52° under 0.15 m; 58° upright');
  eq(C.showRow(SC, null, { length: 0.5, aspect: 16 / 9 }).id, 'both', 'the reveal (no pose yet) reads the `both` row');
  const A = SC.pose.alongside;
  eq([C.showRow(SC, 'alongside', { length: 2.65, aspect: 16 / 9 }).elev, C.showRow(SC, 'alongside', { length: 9.1, aspect: 16 / 9 }).elev], [A.elev, A.craneElev], 'alongside: 16°; craned to 40° for the 9 m one');
  ok(C.showRow(SC, 'alongside', { length: 4.5, aspect: 16 / 9 }).elev > A.elev && C.showRow(SC, 'alongside', { length: 4.5, aspect: 16 / 9 }).elev < A.craneElev, 'the crane eases in above 4 m');
  eq([C.showRow(SC, 'alongside', { length: 9.1, aspect: 16 / 9 }).rake, C.showRow(SC, 'alongside', { length: 9.1, aspect: 390 / 844 }).rake, C.showRow(SC, 'alongside', { length: 2.65, aspect: 390 / 844 }).rake], [0, A.rake, 0], 'the rake: upright only, above 3.2 m');
  eq(C.showRow(SC, 'alongside', { length: 9.1, aspect: 390 / 844 }).elev, A.craneElev, 'raked: craned to 40°');
  near(C.showRow(SC, 'both', { length: 0.6, aspect: 16 / 9 }).margin, SC.margin.landscape, 'margin 8 % on a landscape screen'); near(C.showRow(SC, 'both', { length: 0.6, aspect: 390 / 844 }).margin, SC.margin.portrait, '6 % upright');
  eq([C.showRow(SC, 'hang', { length: 1.6, aspect: 16 / 9 }).headroom, C.showRow(SC, 'pinch', { length: 0.3, aspect: 16 / 9 }).headroom, C.showRow(SC, 'both', { length: 0.6, aspect: 16 / 9 }).footroom, C.showRow(SC, 'hug', { length: 1.2, aspect: 16 / 9 }).footroom],
    [SC.pose.hang.headroom, SC.headroom, SC.pose.both.footroom ?? SC.footroom, SC.footroom], 'a row may keep its own room over the subject (a hung fish sways with the raft) or under it (two hands under a fish); the others take the camera\'s');
  eq([C.showRow(SC, 'pinch', { length: 0.115, aspect: 16 / 9 }).flameTip, C.showRow(SC, 'pinch', { length: 0.33, aspect: 16 / 9 }).flameTip, C.showRow(SC, 'both', { length: 0.6, aspect: 16 / 9 }).flameTip],
    [SC.pose.pinch.tinyFlameTip, SC.pose.pinch.flameTip ?? null, SC.pose.both.flameTip ?? null], 'a tiny fish\'s close-up keeps the flame\'s core, not its tip; a row may keep its own room over the flame');
  // the raked yaw: 55° off broadside, toward the head end, whichever way the fish lies
  near(C.showRakeYaw(0, { x: 1, z: 0 }, 55) / DEG, 55, 'snout to the east: the lens swings east', 1e-6);
  near(C.showRakeYaw(0, { x: -1, z: 0 }, 55) / DEG, -55, 'snout to the west: the lens swings west', 1e-6);
  eq(C.showRakeYaw(0.3, null, 55), 0.3, 'no axis: no rake');
  // a 9.1 m fish upright, raked: never cropped
  { const L = 9.1, aspect = 390 / 844, row = C.showRow(SC, 'alongside', { length: L, aspect });
    const pts = [P3(-L / 2, 0.1, 1.6), P3(L / 2, 0.1, 1.6), P3(0, 0.6, 1.6), P3(0, -0.3, 1.6), P3(L / 2 - 0.6, 0.82, 0.6), P3(L / 2 - 0.6, 1.2, 0.6), P3(L / 2 - 0.6, 0.2, 0.6)];
    const yaw = C.showRakeYaw(0, { x: 1, z: 0 }, row.rake), o = { yaw, elev: row.elev, fov: row.fov, aspect, margin: row.margin, depthAt: P3(0, 0.1, 1.6) };
    const fit = C.showFit(pts, o), flat = C.showFit(pts, { ...o, yaw: 0, elev: A.elev });
    ok(within(pts, fit, o, row.margin) && fit.dist < flat.dist * 0.75, `the Lantern-Swallower on a phone: whole in frame, raked from ${fit.dist.toFixed(1)} m (broadside it would need ${flat.dist.toFixed(1)} m)`); }
  // the blend: eased, arriving exactly at the present
  eq([C.showEase(0), C.showEase(1), C.showEase(-1), C.showEase(2)], [0, 1, 0, 1], 'the ease runs 0 → 1 and clamps');
  let vmax = 0; for (let i = 1; i <= 200; i++) vmax = Math.max(vmax, (C.showEase(i / 200) - C.showEase((i - 1) / 200)) * 200);
  ok(vmax <= 1.5 + 1e-6 && C.showEase(0.01) < 0.001 && 1 - C.showEase(0.99) < 0.001, `no jump at either end; top speed ${vmax.toFixed(2)} × the mean (12 m in 0.8 s = ${(vmax * 12 / 0.8 / 30).toFixed(2)} m a frame at 30 fps)`);
  const view = (phase, t, poseT, hurried = false) => ({ phase, t, poseT, hurried, dur: { reveal: 0.35, lift: 0.45, hold: 0.5, pause: 0.7 } });
  near(C.showArrival(view('reveal', 0, 0)), 0.8, 'T0: the present is reveal + lift away');
  near(C.showArrival(view('reveal', 0.2, 0, true), 2.5), 0.15 + 0.18, 'hurried in the reveal: the reveal whole, the lift at × 2.5');
  near(C.showArrival(view('lift', 0.5, 0.15)), 0.3, 'in the lift: what is left of it');
  eq([C.showArrival(view('hold', 1, 0.6)), C.showArrival(view('card', 2, 1.7)), C.showArrival(null)], [0, 0, 0], 'from the hold on: arrived');
  // every class's settle (data) means the lens has arrived by the present; the data's rows are sane
  for (const cls of data.SHOW_CLASSES) { const pl = data.showPlan(cls); ok(SC.settle[cls] * (pl.reveal + pl.lift) >= 4.75, `${cls}: settle × (reveal + lift) ≥ 4.75`); }
  ok(SC.followStill > SC.follow && SC.settleAfter < data.AUTOFISH.show.beats.keeper.hold && SC.headroom >= 0 && SC.footroom >= 0 && SC.margin.landscape + SC.footroom < 0.2, 'the target is frozen inside the shortest hold; room at the foot within reason');
}

// ------------------------------------------------------------------ M1 step 3a: the lift's shot (landmarkShot; the stage bcb76be, the fix pass)
section('M1 step 3a: the lift\'s landmark shot (a path filmed broadside outside its radius, clear of the islands; a place\'s own crane)');
{
  const span = { x: -29.5, y: 1.8, z: 0.5, r: 14.5, face: [-9 / 22.85, 21 / 22.85] };   // Under the Span: (−40, −4) → (−19, 5), w 8
  const along = [21 / 22.85, 9 / 22.85];
  for (const raft of [{ x: -25, z: -10 }, { x: -20, z: 12 }]) {
    const s = C.landmarkShot(raft, span, { aspect: 16 / 9 });
    const vx = s.pos[0] - span.x, vz = s.pos[2] - span.z, h = Math.hypot(vx, vz);
    const cosAlong = Math.abs((vx * along[0] + vz * along[1]) / h);
    ok(cosAlong < 0.05, `a path is filmed across its broadside, never down its length (raft ${raft.x},${raft.z}: ${cosAlong.toFixed(3)} along it)`);
    ok(Math.sign(vx * span.face[0] + vz * span.face[1]) === Math.sign((raft.x - span.x) * span.face[0] + (raft.z - span.z) * span.face[1]), '… on the raft\'s side of it');
    ok(s.dist >= 0.7 * C.LANDMARK_SHOT.near && h > 8, `… from outside its water (${h.toFixed(1)} m out)`);
    eq(s.look, [span.x, span.y, span.z], '… looking at the place');
  }
  // dropping the anchor's radius and broadside (the bug bcb76be fixed): filmed down the bridge's length
  const bare = C.landmarkShot({ x: -45, z: -10 }, { x: span.x, y: span.y, z: span.z });
  const bv = [bare.pos[0] - span.x, bare.pos[2] - span.z], bh = Math.hypot(bv[0], bv[1]);
  ok(Math.abs((bv[0] * along[0] + bv[1] * along[1]) / bh) > 0.5, '(without its face the shot stands down the path: the face is what turns it)');
  // an island between the lens and the place: the lens steps round (then up) until its line is clear (the stage's boulder)
  const islands = [{ x: -30, z: 14, r: 6.68, kind: 'island' }, { x: -40, z: -4, r: 1.4, kind: 'column' }];
  const raftN = { x: -33, z: 12 };
  const s0 = C.landmarkShot(raftN, span, { aspect: 16 / 9 });
  ok(!!C.shotBlocked(s0.pos, s0.look, islands), '(the raft by the north island: the plain broadside stands over the island)');
  const s1 = C.landmarkShot(raftN, span, { aspect: 16 / 9, obstacles: islands });
  ok(!C.shotBlocked(s1.pos, s1.look, islands) && Math.hypot(s1.pos[0] + 30, s1.pos[2] - 14) > 6.68 + 3, 'with the islands given, the lens stands clear of the island and its line to the place is open');
  ok(C.shotBlocked([span.x, 2, span.z + 30], span.look ?? [span.x, 1.8, span.z], [{ x: span.x, z: span.z + 15, r: 6, kind: 'island' }]) !== null, 'shotBlocked: a low line through an island is blocked');
  ok(C.shotBlocked([span.x, 2, span.z + 30], [span.x, 1.8, span.z], [{ x: span.x - 20, z: span.z + 15, r: 6, kind: 'island' }, { x: span.x, z: span.z + 15, r: 1.4, kind: 'column' }]) === null, 'shotBlocked: an island off the line, or the place\'s own pier, is not');
  // a portrait frame: the long place filmed off its broadside and further back (all three spans fit)
  const sp = C.landmarkShot({ x: -25, z: -10 }, span, { aspect: 390 / 844 }), sl = C.landmarkShot({ x: -25, z: -10 }, span, { aspect: 16 / 9 });
  const pv = [sp.pos[0] - span.x, sp.pos[2] - span.z], ph = Math.hypot(pv[0], pv[1]);
  const offDeg = Math.acos(Math.min(1, Math.abs((pv[0] * span.face[0] + pv[1] * span.face[1]) / ph))) / DEG;
  ok(offDeg > 25 && offDeg < 50 && sp.dist > sl.dist && sp.fov > sl.fov, `on a portrait frame a path is filmed ${offDeg.toFixed(0)}° off its broadside, further back, wider`);
  // a place's own crane (the Bell Pool: its side, elevation and distance)
  const bell = { x: -3.4, y: 0, z: -15.9, r: 6, side: [0.93, 0.37], elev: 46, dist: 10.5 };
  const sb = C.landmarkShot({ x: -20, z: -30 }, bell, { aspect: 16 / 9 });
  near(sb.pos[1], 10.5 * Math.sin(46 * DEG), 'a place\'s elev and dist: the Bell Pool\'s lens about 7.5 m up, looking down on its bell', 1e-6);
  ok((sb.pos[0] - bell.x) * 0.93 + (sb.pos[2] - bell.z) * 0.37 > 7, '… from its own side whatever side the raft is on');
}

console.log(`render-v3: ${pass} passed, ${fail} failed`);
if (fail) { console.log(failures.join('\n')); process.exit(1); }
