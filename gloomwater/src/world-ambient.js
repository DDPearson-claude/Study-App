// world-ambient.js — the Mossmere's ambient under the loop (the look audit's §3 additions; LOOP.ambient). Art only: nothing here reads
// the catch, the odds or the ledger, takes a bait or stands over a place. On the Mossmere under the loop (faceOn); ?wild=0 (GW_WILD,
// core.js) turns the moving ones off, the debris stays (it is the lake's own, in its obstacles).
//   Candle-boats  paper boats each carrying a candle, drifting slowly on the outflow to the Moss Sluice along LOOP.ambient.boats.lines;
//                 each gutters out at the gate's broken stone ring (its lip), sinks, and another is launched at its line's head. The
//                 raft within `keep` m pushes a boat aside. One InstancedMesh for the boats and one Points for the flames (a soft warm
//                 point each, never in the lake's mirror: no glitter on the water). 6 on high, 4 on medium, none on low.
//   Gate slits    the gate towers' eight candle slits flicker, and now and then one goes out and is lit again a few seconds later
//                 (createSlits / stepSlits, pure; world-art.js writes them into the landmark glows and their halos, no new call).
//   Debris        a half-sunk rowboat and four drowned rooftops in the middle-east water (debrisObstacles: world.js adds them to the
//                 lake's obstacles; debrisGeos: world-art.js merges them into its statics, no new call).
//   createBoats(D, rng, n) / stepBoats(B, o)    the boats (pure; the tests drive them)
//   createSlits(n, rng, C) / stepSlits(S, dt, rng, C, o)
//   attachAmbient(ctx)                          main's line: {update(dt, {show}), state(), calls(), dispose()} or null
import * as THREE from 'three';
import { toonMaterial, setupSurface } from './toon.js';
import { prep, merge, mat, lin, mixArr, scaleArr } from './world-geo.js';
import { createHalos } from './world-fx.js';
import { faceOn, faceRng, lightOf } from './watercraft-face.js';

const TAU = Math.PI * 2;
const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const range = (rng, p, d) => (Array.isArray(p) ? p[0] + rng() * (p[1] - p[0]) : d);

/** LOOP.ambient under the loop (null off it). */
export function ambientData(D) { return D?.LOOP_ENABLED === true && D?.LOOP?.ambient ? D.LOOP.ambient : null; }
/** LOOP.ambient while its moving parts are on (off with ?wild=0), else null. */
export function ambientOn(D) { const A = ambientData(D); return A && A.on === true ? A : null; }
/** How many candle-boats this tier draws (low: none). */
export function boatCount(D, tier = 'high') { return Math.max(0, num(ambientOn(D)?.boats?.count?.[tier], 0) | 0); }

// ------------------------------------------------------------------ candle-boats (pure)
/** A drift line from its points: {pts, segs [{ax, az, dx, dz, len, s0}], len}. */
export function lineOf(pts) {
  const segs = [];
  let s0 = 0;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], len = Math.hypot(bx - ax, bz - az) || 1e-6;
    segs.push({ ax, az, dx: (bx - ax) / len, dz: (bz - az) / len, len, s0 });
    s0 += len;
  }
  return { pts, segs, len: s0 };
}
/** The point s m along a line, eased round its corners (a corner's 2 m blend), and its heading. → out {x, z, tx, tz} */
export function alongLine(L, s, out = {}) {
  const ss = Math.max(0, Math.min(L.len, s));
  let i = 0;
  while (i < L.segs.length - 1 && ss > L.segs[i].s0 + L.segs[i].len) i++;
  const g = L.segs[i], u = ss - g.s0;
  const x = g.ax + g.dx * u, z = g.az + g.dz * u;
  let tx = g.dx, tz = g.dz;
  // (the heading eases into the next segment's over the last 2 m, so a boat turns at a corner instead of snapping)
  const n = L.segs[i + 1], left = g.len - u;
  if (n && left < 2) { const w = 0.5 * smooth(0, 1, 1 - left / 2); tx += (n.dx - g.dx) * w; tz += (n.dz - g.dz) * w; }
  const p = L.segs[i - 1];
  if (p && u < 2) { const w = 0.5 * (1 - smooth(0, 1, u / 2)); tx += (p.dx - g.dx) * w; tz += (p.dz - g.dz) * w; }
  const tl = Math.hypot(tx, tz) || 1; tx /= tl; tz /= tl;
  out.x = x; out.z = z; out.tx = tx; out.tz = tz;
  return out;
}
/** The boats on their lines (LOOP.ambient.boats), seeded; the boats sharing a line spread along it. `n` caps the count. → B */
export function createBoats(D, rng = Math.random, n = null) {
  const C = ambientOn(D)?.boats;
  if (!C || !Array.isArray(C.lines) || !C.lines.length) return { boats: [], lines: [], C: null, t: 0 };
  const lines = C.lines.map(lineOf);
  const N = Math.min(n == null ? boatCount(D, 'high') : n, boatCount(D, 'high'));
  const order = Array.isArray(C.order) && C.order.length ? C.order : [0];
  const lineOfBoat = Array.from({ length: N }, (_, i) => (order[i % order.length] | 0) % lines.length);
  const boats = [];
  for (let i = 0; i < N; i++) {
    const li = lineOfBoat[i], L = lines[li];
    const mates = lineOfBoat.filter((q) => q === li).length, j = lineOfBoat.slice(0, i).filter((q) => q === li).length;
    const room = Math.max(1, L.len - C.gutter - 1);
    const s = room * ((j + 0.15 + rng() * 0.6) / mates);
    boats.push({ i, line: li, s, off: (rng() * 2 - 1) * num(C.off, 1), speed: range(rng, C.speed, 0.2), ph: rng() * TAU, mode: 'drift', t: 0, dur: 0,
      k: 1, fade: 1, y: 0, px: 0, pz: 0, x: 0, z: 0, yaw: 0, launches: 0, outs: 0, events: [] });
  }
  const B = { boats, lines, C, t: 0 };
  for (const b of boats) placeBoat(B, b, null);
  return B;
}
const _at = {};
function placeBoat(B, b, raft) {
  const C = B.C, L = B.lines[b.line];
  alongLine(L, b.s, _at);
  // (the side offset closes in over the last 6 m: they all come to the lip)
  const off = b.off * (1 - 0.5 * smooth(L.len - 6, L.len, b.s));
  let x = _at.x - _at.tz * off + Math.sin(b.t * 0.23 + b.ph) * 0.18, z = _at.z + _at.tx * off + Math.cos(b.t * 0.19 + b.ph * 1.3) * 0.18;
  // the raft's push: it shoves a boat aside to `keep` m, and the boat drifts back onto its line as the raft goes
  if (raft) {
    const keep = num(C.keep, 5);
    let dx = x + b.px - raft.x, dz = z + b.pz - raft.z, d = Math.hypot(dx, dz);
    if (d < keep) {
      if (d < 1e-4) { dx = -_at.tz; dz = _at.tx; d = 1; }
      const s = (keep - d) / d; b.px += dx * s; b.pz += dz * s;
    }
  }
  b.x = x + b.px; b.z = z + b.pz;
  b.yaw = Math.atan2(_at.tx, _at.tz) + 0.35 * Math.sin(b.t * 0.07 + b.ph);
}
/**
 * One step: o = {dt, raft: {x, z}, rng}. A boat drifts its line at its speed, its candle lit (a launch fades in); over the last
 * `gutter` m the flame wavers and dims, and at the line's end it is out ('out'), the boat sinks over `sink` s ('sunk'), and after
 * `wait` s another is launched at the head ('launch'), a new side offset and speed. The raft within `keep` m pushes it aside.
 */
export function stepBoats(B, { dt = 0.016, raft = null, rng = Math.random } = {}) {
  const C = B.C;
  if (!C) return B;
  const d = Math.max(0, num(dt, 0));
  B.t += d;
  for (const b of B.boats) {
    b.events = []; b.t += d;
    const L = B.lines[b.line];
    // the push relaxes (0.35 m/s) while the raft is off
    const pl = Math.hypot(b.px, b.pz);
    if (pl > 0) { const s = Math.max(0, pl - 0.35 * d) / pl; b.px *= s; b.pz *= s; }
    if (b.mode === 'wait') {
      b.dur -= d;
      if (b.dur <= 0) {
        b.mode = 'drift'; b.s = 0; b.t = 0; b.k = 0; b.fade = 0; b.y = 0; b.px = 0; b.pz = 0;
        b.off = (rng() * 2 - 1) * num(C.off, 1); b.speed = range(rng, C.speed, 0.2); b.launches++; b.events.push('launch');
      } else continue;
    }
    if (b.mode === 'sink') {
      b.dur -= d;
      const u = 1 - clamp01(b.dur / Math.max(0.1, num(C.sink, 3)));
      b.y = -0.32 * smooth(0, 1, u); b.fade = 1 - smooth(0.5, 1, u); b.k = 0;
      if (b.dur <= 0) { b.mode = 'wait'; b.dur = range(rng, C.wait, 5); b.fade = 0; b.events.push('sunk'); }
      placeBoat(B, b, raft);
      continue;
    }
    b.s += b.speed * d;
    b.fade = Math.min(1, b.fade + d / 2);
    const g0 = L.len - num(C.gutter, 3.5);
    if (b.s >= g0 && b.mode === 'drift') { b.mode = 'gutter'; b.events.push('gutter'); }
    if (b.mode === 'drift') b.k = Math.min(1, b.k + d / 2.5);
    else {
      const u = clamp01((b.s - g0) / Math.max(0.1, L.len - g0));
      const waver = 0.62 + 0.38 * Math.abs(Math.sin(b.t * 11.3 + b.ph) * Math.sin(b.t * 4.1 + b.ph * 2));
      b.k = Math.pow(1 - u, 1.4) * waver;
    }
    if (b.s >= L.len) { b.s = L.len; b.mode = 'sink'; b.dur = num(C.sink, 3); b.k = 0; b.outs++; b.events.push('out'); }
    placeBoat(B, b, raft);
  }
  return B;
}
/** How lit the candles read by the light: faint by day, warm at dusk, full at night. */
export function flameLight(phase, k = 0) {
  const kk = clamp01(num(k));
  if (phase === 'dusk') return 0.6 + 0.4 * kk;
  if (lightOf(phase) === 'night') return 1;
  if (phase === 'dawn') return 1 - 0.55 * kk;
  return 0.45;
}

// ------------------------------------------------------------------ the gate's candle slits (pure)
const flick = (t, p) => 0.5 + 0.5 * (0.55 * Math.sin(t * 6.3 + p) * Math.sin(t * 2.1 + p * 3) + 0.3 * Math.sin(t * 13.7 + p * 7) + 0.15 * Math.sin(t * 1.3 + p * 2));
/** An out slit's light e s after it began to gutter (SLIT_DOWN s), then dark for `dur` s: it gutters down, is out, then catches, gutters and steadies. */
export function slitOut(e, dur) {
  if (e < SLIT_DOWN) return (1 - smooth(0, SLIT_DOWN, e)) * (0.7 + 0.3 * Math.cos(e * 31));
  if (e < SLIT_DOWN + dur) return 0;
  const u = e - SLIT_DOWN - dur;
  if (u < 0.15) return 0.9 * smooth(0, 0.15, u);
  if (u < 0.45) return 0.9 - 0.55 * smooth(0.15, 0.45, u);
  return Math.min(1, 0.35 + 0.65 * smooth(0.45, 1.3, u));
}
export const SLIT_DOWN = 0.7, SLIT_RELIGHT = 1.3;   // (s: the gutter down before it is dark, the catch after)
/** The slits' state (n slits, LOOP.ambient.slits): k[i] how lit each is (0..1), `out` the one going out (or -1). */
export function createSlits(n, rng = Math.random, C = {}) {
  const ph = new Float32Array(n); for (let i = 0; i < n; i++) ph[i] = rng() * TAU;
  return { n, t: 0, next: range(rng, C.every, 20) * 0.5, out: -1, last: -1, e: 0, dur: 0, ph, k: new Float32Array(n).fill(1), outs: 0 };
}
/** One step: each slit flickers (`flicker` deep, off with o.flicker false); every `every` s one goes out for `out` s and is lit again. */
export function stepSlits(S, dt, rng = Math.random, C = {}, { flicker = true } = {}) {
  const d = Math.max(0, num(dt, 0));
  S.t += d;
  if (S.out < 0) {
    S.next -= d;
    if (S.next <= 0 && S.n > 0) {
      let i = Math.floor(rng() * S.n) % S.n;
      if (i === S.last && S.n > 1) i = (i + 1) % S.n;
      S.out = i; S.last = i; S.e = 0; S.dur = range(rng, C.out, 4); S.outs++;
    }
  } else {
    S.e += d;
    if (S.e >= SLIT_DOWN + S.dur + SLIT_RELIGHT) { S.out = -1; S.next = range(rng, C.every, 20); }
  }
  const F = num(C.flicker, 0.24);
  for (let i = 0; i < S.n; i++) S.k[i] = (flicker ? 1 - F * flick(S.t, S.ph[i]) : 1) * (i === S.out ? slitOut(S.e, S.dur) : 1);
  return S;
}

// ------------------------------------------------------------------ the drowned debris
/** The debris pieces on this water (LOOP.ambient.debris under the loop on the Mossmere; whatever ?wild says). */
export function debrisPieces(D, zoneId) { const A = ambientData(D); return A && faceOn(D, zoneId) && Array.isArray(A.debris) ? A.debris : []; }
/** Their collision circles for the lake's obstacles (kind 'debris': the water draws no foam ring round them). */
export function debrisObstacles(D, zoneId) { return debrisPieces(D, zoneId).map((p) => ({ x: p.x, z: p.z, r: num(p.r, 1.5), kind: 'debris' })); }

// a gabled roof breaking the surface: its ridge `top` m up, its eaves under the water; slate courses, moss at the waterline
function roofGeo(p, K) {
  const w = num(p.w, 3), l = num(p.l, 3.4) + 0.3, top = num(p.top, 0.7), h = w * 0.48, e = top - h;
  const P = [
    [0, top, -l / 2], [0, top, l / 2], [-w / 2, e, l / 2], [-w / 2, e, -l / 2],   // the left slope
    [0, top, l / 2], [0, top, -l / 2], [w / 2, e, -l / 2], [w / 2, e, l / 2],     // the right slope
  ];
  const pos = [];
  const quad = (a, b, c, d) => pos.push(...a, ...b, ...c, ...a, ...c, ...d);
  quad(P[3], P[2], P[1], P[0]); quad(P[7], P[6], P[5], P[4]);   // (wound so the slopes face out and up)
  // the gable walls, set in under the overhang
  const gi = l / 2 - 0.18;
  pos.push(0, top - 0.06, gi, -w / 2 + 0.12, e, gi, w / 2 - 0.12, e, gi);
  pos.push(0, top - 0.06, -gi, w / 2 - 0.12, e, -gi, -w / 2 + 0.12, e, -gi);
  let g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  const slate = mixArr(K.stone, K.rockHi, 0.42), wall = mixArr(K.stone, K.bone, 0.25), dark = scaleArr(K.rock, 0.5);
  g = prep(g, { colorFn: (x, y, z, nx, ny) => {
    if (Math.abs(ny) < 0.2) {                                                              // a gable wall, its attic window drowned dark
      if (Math.abs(x) < 0.24 && y > top - 0.95 && y < top - 0.42) return dark;
      return mixArr(wall, K.moss, y < 0.25 ? 0.6 : 0.15);
    }
    if (y > top - 0.07) return mixArr(K.rockHi, K.bone, 0.18);                            // the ridge tiles
    if (p.broken && x > 0.2 && Math.abs(z) < l * 0.22 && y > e + 0.25 && y < top - 0.25) return dark;   // the fallen-in patch
    const course = ((top - y) / 0.17) % 1;
    const c = course < 0.22 ? scaleArr(slate, 0.5) : slate;                               // the slate courses
    return y < 0.22 ? mixArr(c, K.moss, 0.55) : c;
  } });
  const parts = [g];
  if (p.chimney) parts.push(prep(new THREE.BoxGeometry(0.5, 1.1, 0.55), { matrix: mat(w * 0.2, top + 0.2, l * 0.22), colorFn: (x, y) => (y > top + 0.68 ? scaleArr(K.rock, 0.7) : mixArr(K.stone, K.rock, 0.55)) }));
  if (p.broken) for (const zz of [-0.45, 0, 0.45]) parts.push(prep(new THREE.BoxGeometry(0.07, 0.07, 1.0), { matrix: mat(w * 0.27, top - h * 0.5 + 0.03, zz * l * 0.42, 0, 0, -0.75), color: K.wood }));
  return parts;
}
// a rowboat sunk by the stern, its bow up: an outer and an inner shell (the water fills it), strakes, a thwart
function rowboatGeo(p, K) {
  const len = num(p.len, 3), sx = len * 0.2, sy = len * 0.14, sz = len / 2;
  const wood = mixArr(mixArr(K.wood, K.woodHi || K.wood, 0.5), K.stone, 0.42);
  const strakes = (x, y) => { const c = ((y + 2) / 0.09) % 1 < 0.14 ? scaleArr(wood, 0.6) : wood; return y < 0.25 ? mixArr(c, K.moss, 0.45) : c; };
  const outer = prep(new THREE.SphereGeometry(1, 12, 5, 0, TAU, Math.PI / 2, Math.PI / 2), { matrix: mat(0, 0, 0, 0, 0, 0, [sx, sy, sz]) });
  const inner = new THREE.SphereGeometry(0.93, 12, 5, 0, TAU, Math.PI / 2, Math.PI / 2);
  inner.scale(sx, sy, sz);
  const ix = inner.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i]; ix[i] = ix[i + 2]; ix[i + 2] = t; }
  inner.deleteAttribute('normal');
  const parts = [outer, prep(inner), prep(new THREE.BoxGeometry(sx * 1.85, 0.06, 0.24), { matrix: mat(0, -0.05, sz * 0.25) })];
  const pose = mat(0, 0.08, 0, -0.4, 0, 0.2);   // the bow up, a list to one side; the stern under
  for (const g of parts) {
    g.applyMatrix4(pose);
    const P = g.attributes.position, col = g.attributes.color.array;
    for (let i = 0; i < P.count; i++) { const c = strakes(P.getX(i), P.getY(i)); col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2]; }
  }
  parts[1].attributes.color.array.forEach((v, i, a) => { a[i] = v * 0.7; });   // its inside a step darker
  return parts;
}
/** The debris as prepped geometries for world-art's merged statics: {rock: [], org: []} (K: world-art's kit colours). */
export function debrisGeos(pieces, K) {
  const out = { rock: [], org: [] };
  for (const p of pieces || []) {
    const m = mat(p.x, 0, p.z, 0, num(p.yaw, 0), 0);
    if (p.kind === 'roof') for (const g of roofGeo(p, K)) out.rock.push(g.applyMatrix4(m));
    else if (p.kind === 'rowboat') for (const g of rowboatGeo(p, K)) out.org.push(g.applyMatrix4(m));
  }
  return out;
}

// ------------------------------------------------------------------ the candle-boat model
function boatGeo(C) {
  const paper = lin(C.paper ?? 0xd6cbb6), fold = scaleArr(paper, 0.74), wax = lin(C.wax ?? 0xeee4cc), ink = lin(0x1a1420);
  const s = num(C.len, 0.5) / 0.5;
  const pos = [], col = [];
  const tri = (a, b, c, k) => { pos.push(...a, ...b, ...c); for (let i = 0; i < 3; i++) col.push(...k); };
  const quad = (a, b, c, d, k) => { tri(a, b, c, k); tri(a, c, d, k); };
  // a folded paper tray: a narrow keel, flared sides, a peak at the bow and the stern (the paper boat's shape), its floor inside
  const B = 0.07, T = 0.11, Lb = 0.16, Lt = 0.25, H = 0.085, P = 0.15;
  const b0 = [-B, 0, -Lb], b1 = [B, 0, -Lb], b2 = [B, 0, Lb], b3 = [-B, 0, Lb];
  const t0 = [-T, H, -Lt * 0.8], t1 = [T, H, -Lt * 0.8], t2 = [T, H, Lt * 0.8], t3 = [-T, H, Lt * 0.8];
  const bow = [0, P, Lt], stern = [0, P * 0.9, -Lt];
  quad(b3, b2, t2, t3, paper); quad(b1, b0, t0, t1, paper);       // the sides
  quad(b2, b1, t1, t2, fold); quad(b0, b3, t3, t0, fold);        // (the long sides)
  tri(t3, t2, bow, paper); tri(b3, t3, bow, fold); tri(t2, b2, bow, fold);
  tri(t1, t0, stern, paper); tri(b1, t1, stern, fold); tri(t0, b0, stern, fold);
  quad([-T * 0.8, H * 0.7, Lt * 0.7], [T * 0.8, H * 0.7, Lt * 0.7], [T * 0.8, H * 0.7, -Lt * 0.7], [-T * 0.8, H * 0.7, -Lt * 0.7], fold);   // the floor
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  const cand = new THREE.CylinderGeometry(0.034, 0.038, 0.085, 7); cand.translate(0, H * 0.7 + 0.042, 0);
  const wick = new THREE.CylinderGeometry(0.006, 0.006, 0.025, 3); wick.translate(0, H * 0.7 + 0.096, 0);
  const parts = [prep(cand, { color: wax }), prep(wick, { color: ink })];
  // (the tray keeps its own colours and normals as built: prep would drop them)
  const merged = merge([g, ...parts.map((q) => q.toNonIndexed())]);
  merged.scale(s, s, s);
  return merged;
}
/** The flame's height over the boat's origin (m). */
const flameY = (C) => (0.085 * 0.7 + 0.13) * (num(C.len, 0.5) / 0.5);

// ------------------------------------------------------------------ main's line
/** Under the loop with the ambient on: the candle-boats on the Mossmere (high and medium; none on low). → {update, state, dispose} or null */
export function attachAmbient(ctx) {
  const A = ambientOn(ctx?.data);
  const scene = ctx?.render?.scene;
  if (!A || !scene || ctx.render.isStub) return null;
  const C = A.boats, max = Math.max(boatCount(ctx.data, 'high'), boatCount(ctx.data, 'medium'));
  if (!C || !(max > 0)) return null;
  const rng = faceRng(0xb0a7c4);
  const B = createBoats(ctx.data, rng, max);
  const geo = boatGeo(C);
  const m = toonMaterial({ color: 0xffffff, vertexColors: true, rim: 0.3, rimColor: 0xd8d0ec, steps: 3, side: THREE.DoubleSide });
  // (its own candle warms the paper and the wax, by the flame's light: aGlow per boat, 0 once it is out)
  geo.setAttribute('aGlow', new THREE.InstancedBufferAttribute(new Float32Array(max), 1));
  const base = m.onBeforeCompile;
  m.onBeforeCompile = (sh, r) => {
    base(sh, r);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aGlow; varying float vGlow;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvGlow = aGlow;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vGlow;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * vec3(1.0, 0.72, 0.46) * vGlow * 0.85;');
  };
  m.customProgramCacheKey = () => 'gwToonSurf:candleBoat';
  const mesh = new THREE.InstancedMesh(geo, m, max);
  mesh.name = 'candleBoats'; mesh.frustumCulled = false; mesh.visible = false;
  setupSurface(mesh, { cast: false, reflect: false });
  const H = createHalos(max);
  H.points.name = 'candleBoatFlames'; H.points.visible = false;
  for (let i = 0; i < max; i++) H.add(0, -50, 0, [0, 0, 0], num(C.size, 0.75), i * 1.7 + 0.4);
  H.commit();
  scene.add(mesh); scene.add(H.points);
  const fl = lin(C.flame ?? 0xffbf78), fy = flameY(C);
  const S = { on: false, lit: 0 };
  const v = new THREE.Vector3(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), v2 = new THREE.Vector2();
  const zoneId = () => { try { return ctx.world?.getZone?.()?.id ?? ctx.state?.run?.zone ?? null; } catch { return null; } };
  function update(dt = 0.016, { show = false } = {}) {
    const q0 = ctx.render?.quality || 'high';
    const flow = ctx.flow;
    const on = q0 !== 'low' && faceOn(ctx.data, zoneId()) && (flow === 'playing' || flow === 'home') && !ctx.cinematic && !show;
    S.on = on; mesh.visible = on; H.points.visible = on;
    if (!on) return;
    const d = Math.min(0.1, Math.max(0, num(dt, 0)));
    const p = ctx.player?.position;
    stepBoats(B, { dt: d, raft: p ? { x: p.x, z: p.z } : null, rng });
    let pi = null;
    try { pi = ctx.survival?.getPhaseInfo?.() || null; } catch { pi = null; }
    const lit = flameLight(pi?.phase || ctx.state?.run?.phase || 'calm', pi?.k);
    S.lit = lit;
    const n = Math.min(B.boats.length, boatCount(ctx.data, q0));
    for (let i = 0; i < n; i++) {
      const b = B.boats[i];
      let wy = 0;
      try { wy = ctx.water && !ctx.water.isStub ? num(ctx.water.getHeight?.(b.x, b.z), 0) : 0; } catch { wy = 0; }
      const shown = b.mode !== 'wait' && b.fade > 0.01;
      e.set(Math.sin(B.t * 1.3 + b.ph) * 0.07, b.yaw, Math.cos(B.t * 1.1 + b.ph) * 0.06, 'YXZ');
      q.setFromEuler(e);
      sc.setScalar(shown ? 0.55 + 0.45 * b.fade : 1e-4);
      const y = wy + b.y + Math.sin(B.t * 1.7 + b.ph) * 0.008;
      mesh.setMatrixAt(i, m4.compose(v.set(b.x, y, b.z), q, sc));
      const k = shown ? b.k * lit * b.fade : 0;
      geo.attributes.aGlow.setX(i, k);
      H.setPos(i, b.x, y + fy * sc.x, b.z);
      H.setColor(i, fl[0] * k, fl[1] * k, fl[2] * k);
    }
    for (let i = n; i < max; i++) H.setColor(i, 0, 0, 0);
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true; geo.attributes.aGlow.needsUpdate = true;
    H.touchPositions(); H.touchColors();
    H.uniforms.uTime.value = B.t;
    H.uniforms.uFogD.value = num(scene.fog?.density, 0.0055);
    const r = ctx.render?.renderer;
    if (r?.getDrawingBufferSize) { r.getDrawingBufferSize(v2); H.uniforms.uViewH.value = v2.y || 720; }
  }
  return {
    update,
    state: () => ({ on: S.on, lit: +S.lit.toFixed(2), boats: B.boats.map((b) => ({ line: b.line, mode: b.mode, x: +b.x.toFixed(2), z: +b.z.toFixed(2), k: +b.k.toFixed(2), launches: b.launches, outs: b.outs })),
      slits: (() => { try { return ctx.world?.ambient?.() ?? null; } catch { return null; } })() }),
    calls: () => (S.on ? 2 : 0),
    dispose() { scene.remove(mesh); scene.remove(H.points); geo.dispose(); m.dispose(); H.geo.dispose(); H.mat.dispose(); },
  };
}
