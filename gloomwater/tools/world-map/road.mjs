#!/usr/bin/env node
// The route rule (WORLD.md §6.1, binding): the Lamp Road only goes forward. Every water lies farther
// along the road than the one before it; a side water up its own river may be a short out-and-back of
// its own length; no leg ever runs back past an earlier water.
//
//   node tools/world-map/road.mjs     check the road as canon.mjs gives it (no bake), print the table
//
// build.mjs runs the same check twice and stops the build if either fails: once on the canon courses
// (each leg along its waterway's own WORLD.md points, before anything is baked) and once on the road
// as the chart draws it (the same legs along the meandered rivers and the finished coast).
//
// The five checks, as WORLD.md §6.1 states them. The road is the sixteen legs in unlock order, each a
// polyline from the water before (the Landing for water 1). The trunk is the road with each side
// water's spur cut off at its junction.
//   1. Stations rise. A water's station is its distance along the trunk from the Landing, at its own
//      point (a trunk water) or at its junction (a side water). Stations strictly increase.
//   2. No leg passes an earlier water. Every point of a leg is at least `clearance` units from every
//      earlier water (the Landing included), except the water the leg leaves.
//   3. Side waters are their own out-and-back. A side water's leg out returns to its junction down the
//      same spur, no more than `spurRatio` times the spur's length; no other leg leaves the trunk and
//      comes back.
//   4. The trunk never retraces itself: no stretch of it runs within `retrace` units of trunk already
//      travelled (other than round the joint it has just passed).
//   5. No sharp turn back. Measured water to water, the road never turns more than `turn` degrees,
//      except at a declared side water.
import { fileURLToPath } from 'node:url';
import { WATERS, HOME, PIECES, LEGS, RIVERS, CANALS, ROAD_RULE } from './canon.mjs';
import { stretch } from './lib/util.mjs';

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const lengthOf = (p) => { let s = 0; for (let i = 1; i < p.length; i++) s += dist(p[i - 1], p[i]); return s; };
// the nearest point of a polyline to q (the first one, where several are as near)
function nearest(poly, q) {
  let best = Infinity, out = { d: Infinity, i: 0, t: 0, s: 0, p: poly[0] }, run = 0;
  for (let i = 0; i < poly.length - 1; i++) {
    const a = poly[i], b = poly[i + 1], vx = b[0] - a[0], vy = b[1] - a[1], l2 = vx * vx + vy * vy;
    const t = l2 > 0 ? Math.max(0, Math.min(1, ((q[0] - a[0]) * vx + (q[1] - a[1]) * vy) / l2)) : 0;
    const p = [a[0] + vx * t, a[1] + vy * t], d = dist(p, q), l = Math.sqrt(l2);
    if (d < best - 1e-9) { best = d; out = { d, i, t, s: run + l * t, p }; }
    run += l;
  }
  return out;
}
// points every `step` units along a polyline, each with its distance along: [x, y, s]
function walk(poly, step = 1) {
  const out = [[poly[0][0], poly[0][1], 0]]; let run = 0, next = step;
  for (let i = 0; i < poly.length - 1; i++) {
    const a = poly[i], b = poly[i + 1], l = dist(a, b);
    while (next <= run + l) { const t = (next - run) / (l || 1); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, next]); next += step; }
    run += l;
  }
  const e = poly[poly.length - 1];
  if (run - out[out.length - 1][2] > 1e-6) out.push([e[0], e[1], run]);
  return out;
}
// a polyline cut in two at its nearest point to q
function cutAt(poly, q) {
  const n = nearest(poly, q);
  const head = poly.slice(0, n.i + 1).map((p) => [p[0], p[1]]), tail = poly.slice(n.i + 1).map((p) => [p[0], p[1]]);
  if (dist(head[head.length - 1], n.p) > 1e-6) head.push(n.p);
  if (!tail.length || dist(tail[0], n.p) > 1e-6) tail.unshift(n.p);
  return { head, tail, d: n.d };
}
const join = (pieces) => { // polylines end to end, a shared joint kept once
  const out = [];
  for (const p of pieces) for (const q of p) { const l = out[out.length - 1]; if (!l || dist(l, q) > 1e-6) out.push([q[0], q[1]]); }
  return out;
};

// ---- the legs as WORLD.md gives them: each piece along its waterway's own course points
export function canonLegs() {
  const course = (id) => {
    const w = RIVERS.find((r) => r.id === id) || CANALS.find((c) => c.id === id);
    if (!w) throw new Error('no waterway ' + id);
    return w.pts.map((p) => [p[0], p[1]]);
  };
  const piece = (id) => {
    const pc = PIECES[id];
    if (!pc) throw new Error('no road piece ' + id);
    return pc.p ? pc.p.map((p) => [p[0], p[1]]) : stretch(course(pc.r), pc.from, pc.to);
  };
  return legsFrom(LEGS.map((leg) => leg.via.map((v) => (v[0] === '-' ? piece(v.slice(1)).reverse() : piece(v)))), 1);
}
// ---- the legs as the chart draws them (the page data's pieces: meandered rivers, the finished coast)
export function drawnLegs(data) {
  const pts = data.pieces.map((pc) => { const a = []; for (let i = 0; i < pc.p.length; i += 2) a.push([pc.p[i], pc.p[i + 1]]); return a; });
  return legsFrom(data.legs.map((leg) => leg.via.map(([idx, dir]) => (dir < 0 ? pts[idx].slice().reverse() : pts[idx]))), 2.5);
}
function legsFrom(viaLists, tol) {
  const legs = [null];
  viaLists.forEach((list, n) => {
    for (let i = 1; i < list.length; i++) {
      const gap = dist(list[i - 1][list[i - 1].length - 1], list[i][0]);
      if (gap > tol) throw new Error(`leg ${n + 1}: piece ${i + 1} does not join the piece before it (${gap.toFixed(1)} units apart)`);
    }
    legs.push(join(list));
  });
  return legs;
}

// ---- the check. legs[1..16]; opts.reach is how far a leg's end may stand from its water's point.
export function checkRoad(legs, opts = {}) {
  // opts.stated: also say how the stations compare with WORLD.md's own figures (the canon courses only).
  const rule = opts.rule || ROAD_RULE, side = rule.side, reach = opts.reach == null ? 6 : opts.reach;
  const W = [HOME.at, ...WATERS.map((w) => w.at)], names = [HOME.name, ...WATERS.map((w) => w.name)];
  const N = W.length - 1;
  const failed = [0, 0, 0, 0, 0, 0], notes = [];
  const rows = [];
  for (let k = 1; k <= N; k++) rows[k] = { k, name: names[k], side: !!side[k], len: lengthOf(legs[k]), fails: [] };
  const fail = (check, k, text) => { failed[check]++; notes.push(`check ${check}, ${text}`); if (k && !rows[k].fails.includes(check)) rows[k].fails.push(check); };

  // the road is unbroken: each leg starts at the water before and ends at its own
  for (let k = 1; k <= N; k++) {
    const p = legs[k], a = dist(p[0], W[k - 1]), b = dist(p[p.length - 1], W[k]);
    rows[k].reach = b;
    if (a > reach) fail(1, k, `leg ${k - 1} → ${k} starts ${a.toFixed(1)} units from ${names[k - 1]}`);
    if (b > reach) fail(1, k, `leg ${k - 1} → ${k} ends ${b.toFixed(1)} units from ${names[k]}`);
  }

  // the trunk: each side water's spur cut off at its junction
  const part = [null], spurIn = {}, spurOut = {};
  for (let k = 1; k <= N; k++) {
    let p = legs[k];
    if (side[k - 1]) { const c = cutAt(p, side[k - 1]); if (c.d > 3) fail(3, k, `leg ${k - 1} → ${k} never comes back to the junction of ${names[k - 1]} (${c.d.toFixed(1)} units off)`); spurOut[k - 1] = c.head; p = c.tail; }
    if (side[k]) { const c = cutAt(p, side[k]); if (c.d > 3) fail(3, k, `leg ${k - 1} → ${k} never passes the junction of ${names[k]} (${c.d.toFixed(1)} units off)`); spurIn[k] = c.tail; p = c.head; }
    part.push(p);
  }
  const trunk = join(part.slice(1));
  const arc = [0]; // the trunk's length at the end of each leg's part
  for (let k = 1; k <= N; k++) arc[k] = arc[k - 1] + lengthOf(part[k]);

  // 1. stations rise
  const stations = [];
  for (let k = 0, s0 = 0; k <= N; k++) {
    const n = nearest(trunk, side[k] || W[k]);
    if (!k) s0 = n.s; // the Landing's own place on the trunk is station 0
    const st = n.s - s0;
    stations.push(st);
    if (k) { rows[k].station = st; rows[k].off = n.d; }
    if (n.d > reach) fail(1, k, `${names[k]} stands ${n.d.toFixed(1)} units off the trunk`);
    if (k && !(st > stations[k - 1] + 1e-6)) fail(1, k, `${names[k]} (station ${st.toFixed(0)}) is not farther along than ${names[k - 1]} (station ${stations[k - 1].toFixed(0)})`);
  }

  // 2. no leg passes an earlier water
  let minClear = null;
  for (let k = 1; k <= N; k++) {
    let best = null;
    for (let j = 0; j <= k - 2; j++) {
      const d = nearest(legs[k], W[j]).d;
      if (!best || d < best.d) best = { j, d };
      if (d < rule.clearance) fail(2, k, `leg ${k - 1} → ${k} passes ${names[j]} at ${d.toFixed(1)} units (under ${rule.clearance})`);
    }
    rows[k].clear = best;
    if (best && (!minClear || best.d < minClear.d)) minClear = { ...best, k };
  }

  // 3. a side water is its own out-and-back, and nothing else is one
  for (const key of Object.keys(side)) {
    const k = +key, a = spurIn[k], b = spurOut[k];
    if (!a || !b) { fail(3, k, `${names[k]} is declared a side water but has no leg in and out`); continue; }
    const la = lengthOf(a), lb = lengthOf(b);
    let dev = 0;
    for (const q of walk(b)) dev = Math.max(dev, nearest(a, q).d);
    for (const q of walk(a)) dev = Math.max(dev, nearest(b, q).d);
    rows[k].spur = { in: la, out: lb, dev };
    if (lb > rule.spurRatio * la) fail(3, k + 1, `the way out of ${names[k]} is ${lb.toFixed(0)} units, over ${rule.spurRatio} times its spur (${la.toFixed(0)})`);
    if (dev > rule.retrace) fail(3, k + 1, `the way out of ${names[k]} leaves its own spur by ${dev.toFixed(1)} units`);
  }
  for (let k = 1; k < N; k++) {
    if (side[k]) continue;
    let back = 0;
    for (const q of walk(legs[k + 1])) { if (nearest(legs[k], q).d < rule.retrace) back = q[2]; else break; }
    rows[k + 1].back = back;
    if (back > 2 * rule.retrace) fail(3, k + 1, `leg ${k} → ${k + 1} goes back down the leg before it for ${back.toFixed(0)} units, and ${names[k]} is no side water`);
  }

  // 4. the trunk never retraces itself
  {
    const T = walk(trunk), gap = 2 * rule.retrace;
    let j0 = 0, run = null;
    const close = () => { if (!run) return; let k = 1; while (k < N && arc[k] < run.s0) k++; fail(4, k, `the trunk runs back along itself for ${(run.s1 - run.s0 + 1).toFixed(0)} units near (${run.at[0].toFixed(0)}, ${run.at[1].toFixed(0)}), on leg ${k - 1} → ${k}`); run = null; };
    for (let i = 0; i < T.length; i++) {
      while (j0 < T.length && T[j0][2] <= T[i][2] - gap) j0++;
      let near = false;
      for (let j = 0; j < j0; j++) if (dist(T[i], T[j]) < rule.retrace) { near = true; break; }
      if (near) { if (!run) run = { s0: T[i][2], s1: T[i][2], at: T[i] }; else run.s1 = T[i][2]; } else close();
    }
    close();
  }

  // 5. no sharp turn back, water to water
  let maxTurn = null;
  for (let k = 1; k < N; k++) {
    const u = [W[k][0] - W[k - 1][0], W[k][1] - W[k - 1][1]], v = [W[k + 1][0] - W[k][0], W[k + 1][1] - W[k][1]];
    const ang = (Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v))))) * 180) / Math.PI;
    rows[k].turn = ang;
    if (!side[k] && (!maxTurn || ang > maxTurn.ang)) maxTurn = { k, ang };
    if (ang > rule.turn && !side[k]) fail(5, k + 1, `the road turns ${ang.toFixed(0)}° at ${names[k]} (over ${rule.turn}°), and it is no side water`);
  }

  let far = rows[1];
  for (let k = 2; k <= N; k++) if (rows[k].reach > far.reach) far = rows[k];
  return { ok: failed.every((n) => !n), failed, notes, rows: rows.slice(1), stations, trunk: arc[N], minClear, maxTurn, far, names, rule, stated: !!opts.stated };
}

// ---- the per-leg table
export function reportRoad(res, title, log = console.log) {
  const { rule, names } = res;
  const pad = (s, n) => String(s).padEnd(n), lpad = (s, n) => String(s).padStart(n);
  log(`${title}:`);
  log(`  ${pad('leg', 8)}${pad('to', 21)}${lpad('length', 7)}${lpad('station', 9)}  ${pad('nearest earlier water', 27)}${pad('turns by', 22)}${pad('out-and-back', 25)}checks 1-5`);
  res.rows.forEach((r, i) => {
    const clear = r.clear ? `${names[r.clear.j].replace(/^The /, '')} at ${r.clear.d.toFixed(0)}` : 'none before it';
    const before = res.rows[i - 1]; // the turn the road makes to set out on this leg, at the water it leaves
    const turn = !before ? 'sets out' : `${before.turn.toFixed(0)}°${before.side ? ' off a side water' : ''}`;
    const spur = r.spur ? `own spur ${r.spur.in.toFixed(0)} in, ${r.spur.out.toFixed(0)} out` : 'none';
    const marks = [1, 2, 3, 4, 5].map((c) => (r.fails.includes(c) ? 'FAIL' : 'ok')).join(' ');
    log(`  ${pad(`${r.k - 1} → ${r.k}`, 8)}${pad(r.name.replace(/^The /, ''), 21)}${lpad(r.len.toFixed(0), 7)}${lpad(r.station.toFixed(0) + (r.side ? 'j' : ' '), 9)}  ${pad(clear, 27)}${pad(turn, 22)}${pad(spur, 25)}${marks}`);
  });
  const what = ['', 'stations rise', `no leg within ${rule.clearance} units of an earlier water`, 'side waters are their own out-and-back, and nothing else is', `the trunk never runs within ${rule.retrace} units of itself`, `no turn over ${rule.turn}° but at a side water`];
  for (let c = 1; c <= 5; c++) log(`  ${res.failed[c] ? 'FAIL' : 'ok  '} ${c}. ${what[c]}`);
  for (const n of res.notes) log(`       ${n}`);
  log(`  stations: ${res.stations.map((s, k) => s.toFixed(0) + (rule.side[k] ? 'j' : '')).join(', ')}  (j: a side water, measured at its junction)`);
  log(`  closest pass of an earlier water: ${res.minClear.d.toFixed(0)} units (leg ${res.minClear.k - 1} → ${res.minClear.k}, past ${names[res.minClear.j]}); sharpest turn off a side water: ${res.maxTurn.ang.toFixed(0)}° at ${names[res.maxTurn.k]}; trunk ${res.trunk.toFixed(0)} units`);
  log(`  every leg ends at its water's own point, or within ${res.far.reach.toFixed(1)} units of it (the farthest: ${res.far.name})`);
  if (rule.stations && res.stated) {
    const worst = Math.max(...res.stations.map((s, i) => Math.abs(s - rule.stations[i])));
    log(`  ${worst <= 1 ? 'ok  ' : 'WARNING'} WORLD.md §6.1 states ${rule.stations.join(', ')}: the largest difference is ${worst.toFixed(0)} unit${worst.toFixed(0) === '1' ? '' : 's'}`);
  }
  log(res.ok ? '  ok   the Lamp Road only goes forward' : '  FAIL the Lamp Road goes back on itself');
  return res.ok;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const ok = reportRoad(checkRoad(canonLegs(), { reach: 6, stated: true }), 'the route rule (WORLD.md §6.1), on the canon courses');
  if (!ok) process.exit(1);
}
