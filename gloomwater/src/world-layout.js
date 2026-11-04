// world-layout.js — deterministic lake layout per zone (world author).
// Pure data: islands, pillars, docks, gate, spawn, basins, light-shaft cracks and the
// queries that depend on them (shore radius, depth field, open water). No THREE objects.
import { makeRng, clamp, smoothstep } from './core.js';
import { makeRingNoise, ringNoise, TAU } from './world-geo.js';

/** Pillar/prop kinds per zone theme with weights. */
const PILLAR_KINDS = {
  mossmere: [['column', 4], ['pilings', 3], ['wreck', 1.2], ['lamp', 1.6]],
  sporewood: [['stalk', 5], ['pod', 2.5], ['shelf', 1.5]],
  glasswater: [['spire', 4], ['obelisk', 2.2], ['statue', 1.4]],
  paleabyss: [['rib', 4], ['vertebra', 2.2], ['coral', 2]],
};
const THEMES = ['mossmere', 'sporewood', 'glasswater', 'paleabyss'];
/** Authored pillar kinds (data.js arena.pillars[].kind) -> the art builder that draws them. */
const PILLAR_ART = {
  mossmere: { pier: 'column', pylon: 'lamp', statue: 'statue' },
  sporewood: { stalk: 'stalk', pod: 'pod', shelf: 'shelf' },
  glasswater: { reliquary: 'obelisk', shelf: 'spire', statue: 'statue' },
  paleabyss: { rib: 'rib', vertebra: 'vertebra', coral: 'coral' },
};
const PILLAR_ART_ANY = { pier: 'column', pylon: 'column', reliquary: 'obelisk', rib: 'rib', stalk: 'stalk', statue: 'statue' };
const isPt = (o) => !!o && typeof o === 'object' && Number.isFinite(o.x) && Number.isFinite(o.z);

export function themeOf(zone) {
  if (zone && THEMES.includes(zone.id)) return zone.id;
  return THEMES[Math.max(0, Math.min(3, zone?.index | 0))];
}

export function buildLayout(zone) {
  const A = zone?.arena || {};
  const R = A.radius || 60;
  const seed = (A.seed || 1307) >>> 0;
  const theme = themeOf(zone);
  const rng = makeRng(seed);
  const L = {
    zone, theme, R, seed,
    shore: makeRingNoise(rng, [2, 3, 5, 7, 11, 13], (k) => (k === 2 ? 0.028 : k === 3 ? 0.022 : 0.04 / k)),
    islands: [], pillars: [], obstacles: [], docks: [], basins: [], cracks: [], spawn: null, gate: null,
    shelf: R * 0.26,
    np: [rng() * 10, rng() * 10, rng() * 10],
  };
  const shoreR = (a) => R * (1 + ringNoise(L.shore, a));
  L.shoreR = shoreR;

  // Authored arena data (data.js ZONES[].arena, DESIGN §4.4) wins; every field falls back to
  // the procedural placement below when it is missing (a number count, null or absent).
  L.authored = !!A.layout;

  // spawn (south, facing north / -Z so the sail camera looks across the lake)
  if (isPt(A.spawn)) L.spawn = { x: A.spawn.x, z: A.spawn.z, yaw: Number.isFinite(A.spawn.yaw) ? A.spawn.yaw : 0 };
  else L.spawn = { x: rng.range(-3, 3), z: R * 0.42, yaw: 0 };

  // Descent Gate: authored position, else northern half, deep open water. The final lake has
  // no gate (arena.gate === null): the hidden gate sits on its legend pool so the hero
  // landmarks still rise behind the finale.
  if (isPt(A.gate)) L.gate = { x: A.gate.x, z: A.gate.z, radius: Number(A.gate.r) || 4.5, name: A.gate.name || null, stones: [] };
  else if (A.gate === null && isPt(A.legendPool)) L.gate = { x: A.legendPool.x, z: A.legendPool.z, radius: 4.5, name: null, stones: [], none: true };
  else {
    const a = -Math.PI / 2 + rng.range(-0.75, 0.75);
    const d = R * rng.range(0.52, 0.64);
    L.gate = { x: Math.cos(a) * d, z: Math.sin(a) * d, radius: 4.5, stones: [] };
  }

  const dist = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);
  const insideShore = (x, z, pad) => Math.hypot(x, z) + pad <= shoreR(Math.atan2(z, x));

  // islands: authored circles {x, z, r, kind, name}, else procedural count
  if (Array.isArray(A.islands)) {
    const bigR = Math.max(0, ...A.islands.map((o) => Number(o.r) || 0));
    for (const o of A.islands) {
      if (!isPt(o) || !(o.r > 0)) continue;
      const big = o.kind === 'tower' || o.kind === 'giant' || (o.r >= 7.5 && o.r >= bigR);
      const flat = o.kind === 'wreck' || o.kind === 'cap' || o.kind === 'lily';
      const h = (rng.range(1.6, 3.2) * (big ? 1.5 : 1) + o.r * 0.25) * (flat ? 0.6 : 1);
      L.islands.push({ x: o.x, z: o.z, r: o.r, h, rot: rng() * TAU, shelf: 5, seed: rng() * 1000, big, kind: o.kind || null, name: o.name || null });
    }
  }
  const nIsl = Array.isArray(A.islands) ? 0 : (Number.isFinite(A.islands) ? A.islands : 6);
  for (let i = 0; i < nIsl; i++) {
    for (let tries = 0; tries < 300; tries++) {
      const big = i === 0;
      const r = big ? rng.range(6.5, 8.5) : rng.range(3.0, 6.0);
      const a = rng() * TAU, d = rng.range(12, R - 10);
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (!insideShore(x, z, r + 7)) continue;
      if (dist(x, z, L.spawn.x, L.spawn.z) < r + 10) continue;
      if (dist(x, z, L.gate.x, L.gate.z) < r + L.gate.radius + 8) continue;
      // keep the view straight ahead of the spawn mostly open
      if (Math.abs(x - L.spawn.x) < r + 4 && z < L.spawn.z && z > L.spawn.z - 22) continue;
      if (L.islands.some((o) => dist(x, z, o.x, o.z) < r + o.r + 7.5)) continue;
      L.islands.push({ x, z, r, h: rng.range(1.6, 3.2) * (big ? 1.5 : 1) + r * 0.25, rot: rng() * TAU, shelf: rng.range(6, 9), seed: rng() * 1000, big });
      break;
    }
  }

  // merchant docks: authored (day 1 = docks[0]), else open water near an island or the shore,
  // spaced apart; dock 0 nearest spawn
  if (Array.isArray(A.docks) && A.docks.some(isPt)) {
    // barge faces the lake centre (heading convention: yaw 0 faces -Z)
    for (const d of A.docks) {
      if (!isPt(d)) continue;
      // keep the barge (and its posts) clear of the noisy cliff line
      let x = d.x, z = d.z;
      for (let k = 0; k < 30 && !insideShore(x, z, 5.5); k++) { x *= 0.97; z *= 0.97; }
      L.docks.push({ x, z, yaw: Number.isFinite(d.yaw) ? d.yaw : Math.atan2(x, z) });
    }
  } else {
    const want = 4, cands = [];
    for (let tries = 0; tries < 400 && cands.length < 40; tries++) {
      let x, z;
      if (rng() < 0.55 && L.islands.length) {
        const o = rng.pick(L.islands); const a = rng() * TAU; const d = o.r + rng.range(4.5, 6.5);
        x = o.x + Math.cos(a) * d; z = o.z + Math.sin(a) * d;
      } else {
        const a = rng() * TAU; const d = shoreR(a) - rng.range(6, 9);
        x = Math.cos(a) * d; z = Math.sin(a) * d;
      }
      if (!insideShore(x, z, 5)) continue;
      if (L.islands.some((o) => dist(x, z, o.x, o.z) < o.r + 4.2)) continue;
      if (dist(x, z, L.gate.x, L.gate.z) < 14) continue;
      const ds = dist(x, z, L.spawn.x, L.spawn.z);
      if (ds < 13) continue;
      cands.push({ x, z, ds });
    }
    cands.sort((a, b) => Math.abs(a.ds - 22) - Math.abs(b.ds - 22));
    for (const c of cands) {
      if (L.docks.length >= want) break;
      if (L.docks.some((d) => dist(c.x, c.z, d.x, d.z) < 20)) continue;
      // barge faces the lake centre (heading convention: yaw 0 faces -Z)
      const yaw = Math.atan2(c.x, c.z);
      L.docks.push({ x: c.x, z: c.z, yaw });
    }
    if (!L.docks.length) L.docks.push({ x: L.spawn.x + 14, z: L.spawn.z - 6, yaw: 0 });
  }
  {
    // posts beside each dock (mooring) — lateral to the barge
    for (const d of L.docks) {
      const fx = -Math.sin(d.yaw), fz = -Math.cos(d.yaw); // forward
      const lx = -fz, lz = fx;                            // left
      d.posts = [
        { x: d.x + lx * 3.1 - fx * 1.2, z: d.z + lz * 3.1 - fz * 1.2, r: 0.35 },
        { x: d.x + lx * 3.0 + fx * 1.6, z: d.z + lz * 3.0 + fz * 1.6, r: 0.35 },
      ];
      d.buoy = { x: d.x - lx * 3.4 + fx * 2.4, z: d.z - lz * 3.4 + fz * 2.4 };
    }
  }

  // pillars / wrecks: authored circles {x, z, r, kind} (kind mapped onto the theme's art), else
  // procedural count
  const kinds = PILLAR_KINDS[theme];
  if (Array.isArray(A.pillars)) {
    for (const p of A.pillars) {
      if (!isPt(p) || !(p.r > 0)) continue;
      const kind = (PILLAR_ART[theme] && PILLAR_ART[theme][p.kind]) || PILLAR_ART_ANY[p.kind] || p.kind || 'column';
      L.pillars.push({ x: p.x, z: p.z, r: p.r, kind, dataKind: p.kind || null, h: rng.range(0.7, 1.3), rot: rng() * TAU, lean: rng.range(-0.08, 0.08), seed: rng() * 1000 });
    }
  }
  const nPil = Array.isArray(A.pillars) ? 0 : (Number.isFinite(A.pillars) ? A.pillars : 8);
  for (let i = 0; i < nPil; i++) {
    for (let tries = 0; tries < 300; tries++) {
      const kind = rng.weighted(kinds, (k) => k[1])[0];
      const r = kind === 'wreck' ? rng.range(2.0, 2.6) : kind === 'statue' ? rng.range(1.5, 2.0) : kind === 'pilings' ? rng.range(1.1, 1.5)
        : kind === 'stalk' ? rng.range(0.9, 1.5) : kind === 'coral' ? rng.range(1.2, 1.8) : rng.range(0.7, 1.4);
      let x, z;
      if (rng() < 0.4 && L.islands.length) {
        const o = rng.pick(L.islands); const a = rng() * TAU; const d = o.r * 1.1 + r + rng.range(4.6, 7.5);
        x = o.x + Math.cos(a) * d; z = o.z + Math.sin(a) * d;
      } else {
        const a = rng() * TAU, d = Math.sqrt(rng()) * (R - 6);
        x = Math.cos(a) * d; z = Math.sin(a) * d;
      }
      if (!insideShore(x, z, r + 4.5)) continue;
      if (dist(x, z, L.spawn.x, L.spawn.z) < r + 8) continue;
      if (dist(x, z, L.gate.x, L.gate.z) < r + L.gate.radius + 6.5) continue;
      if (L.docks.some((d) => dist(x, z, d.x, d.z) < r + 6)) continue;
      if (L.islands.some((o) => dist(x, z, o.x, o.z) < r + o.r * 1.1 + 4.6)) continue;
      if (L.pillars.some((o) => dist(x, z, o.x, o.z) < r + o.r + 4.2)) continue;
      L.pillars.push({ x, z, r, kind, h: rng.range(0.7, 1.3), rot: rng() * TAU, lean: rng.range(-0.08, 0.08), seed: rng() * 1000 });
      break;
    }
  }

  // collision circles (islands slightly inset so outlines/boulders overlap the raft a touch less)
  for (const o of L.islands) L.obstacles.push({ x: o.x, z: o.z, r: o.r * 1.08 + 0.2, kind: 'island' });
  for (const p of L.pillars) L.obstacles.push({ x: p.x, z: p.z, r: p.r, kind: p.kind });
  for (const d of L.docks) for (const p of d.posts) L.obstacles.push({ x: p.x, z: p.z, r: p.r, kind: 'post' });
  placeGateStones(L, rng);
  L.gateObstacles = L.gate.stones.map((s) => ({ x: s.x, z: s.z, r: s.r, kind: 'gatestone' }));

  if (L.authored) {
    // DESIGN §4.3 depth recipe inputs (see depthAt)
    L.layoutKind = A.layout;
    L.shelf = Number(A.shelf) || L.shelf;
    L.noiseAmp = Number.isFinite(A.noise) ? A.noise : 0.08;
    L.pools = (Array.isArray(A.deepPools) ? A.deepPools : []).filter(isPt).map((p) => ({ x: p.x, z: p.z, r: Number(p.r) || 10, depth: Number(p.depth) || 0.9, name: p.name || null }));
    L.reef = A.reef || null;
    L.causeway = A.causeway || null;
    L.plateau = A.plateau || null;
    L.trench = A.trench || null;
    L.legendPool = isPt(A.legendPool) ? { x: A.legendPool.x, z: A.legendPool.z, r: Number(A.legendPool.r) || 3.2 } : null;
    L.depthScale = null;
    calibrateDepth(L, Array.isArray(A.depthShare) ? A.depthShare : null);
  } else {
    // deep basins (one under the gate, one central, a few more)
    L.basins.push({ x: L.gate.x, z: L.gate.z, r: R * 0.34, amp: 1.0 });
    L.basins.push({ x: rng.range(-0.12, 0.12) * R, z: rng.range(-0.15, 0.05) * R, r: R * 0.4, amp: 0.9 });
    for (let i = 0; i < 2; i++) {
      const a = rng() * TAU, d = rng.range(0.3, 0.6) * R;
      L.basins.push({ x: Math.cos(a) * d, z: Math.sin(a) * d, r: R * rng.range(0.22, 0.3), amp: rng.range(0.75, 1.0) });
    }
  }

  // ceiling cracks -> light shafts. One lands just ahead of the spawn (title/sail framing).
  {
    const pts = [{ x: L.spawn.x + rng.range(-7, 7), z: L.spawn.z - rng.range(9, 15) }];
    for (let tries = 0; tries < 200 && pts.length < 4; tries++) {
      const a = rng() * TAU, d = Math.sqrt(rng()) * R * 0.8;
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (pts.some((p) => dist(x, z, p.x, p.z) < R * 0.45)) continue;
      pts.push({ x, z });
    }
    const leanA = rng() * TAU;
    L.lightDir = { x: Math.cos(leanA), z: Math.sin(leanA) };
    for (const p of pts) L.cracks.push({ x: p.x, z: p.z, lean: rng.range(0.12, 0.22), width: rng.range(2.6, 4.2), phase: rng() * TAU, power: rng.range(0.7, 1) });
  }

  // derive a stable sub-seed for art
  L.artSeed = (seed * 2654435761) >>> 0;
  return L;
}

/**
 * Six standing stones ring the gate. Their angle is chosen so that the gaps between them line
 * up with open water (e.g. the reliquary ring around Glasswater's Vault Seal): each candidate
 * ring is scored by how many gaps have a raft-wide radial lane from the whirlpool outward.
 */
function placeGateStones(L, rng) {
  const G = L.gate, n = 6, sr = G.radius + 2.1;
  const jit = [], hs = [], leans = [];
  for (let i = 0; i < n; i++) { jit.push(rng.range(-0.08, 0.08)); hs.push(rng.range(2.4, 3.6)); leans.push(rng.range(-0.12, 0.12)); }
  const obs = [];
  for (const o of L.islands) obs.push({ x: o.x, z: o.z, r: o.r * 1.08 + 0.2 });
  for (const p of L.pillars) obs.push({ x: p.x, z: p.z, r: p.r });
  for (const d of L.docks) for (const p of d.posts || []) obs.push(p);
  const near = obs.filter((o) => Math.hypot(o.x - G.x, o.z - G.z) < sr + o.r + 14);
  const build = (a0) => {
    const st = [];
    for (let i = 0; i < n; i++) {
      const aa = a0 + (i / n) * TAU + jit[i];
      st.push({ x: G.x + Math.cos(aa) * sr, z: G.z + Math.sin(aa) * sr, r: 0.75, a: aa, h: hs[i], lean: leans[i] });
    }
    return st;
  };
  const clearAt = (x, z, st) => {
    let m = L.shoreR(Math.atan2(z, x)) - Math.hypot(x, z);
    for (const o of near) m = Math.min(m, Math.hypot(x - o.x, z - o.z) - o.r);
    for (const o of st) m = Math.min(m, Math.hypot(x - o.x, z - o.z) - o.r);
    return m;
  };
  const a00 = rng() * TAU;
  let best = null, bestScore = -Infinity;
  for (let c = 0; c < (near.length ? 24 : 1); c++) {
    const a0 = a00 + (c / 24) * (TAU / n);
    const st = build(a0);
    let lanes = 0, sum = 0;
    for (let i = 0; i < n; i++) {
      const am = a0 + ((i + 0.5) / n) * TAU;
      let lane = Infinity;
      for (let r = G.radius; r <= sr + 9; r += 0.6) lane = Math.min(lane, clearAt(G.x + Math.cos(am) * r, G.z + Math.sin(am) * r, st));
      if (lane >= 1.9) lanes++;
      sum += Math.min(lane, 4);
    }
    const score = lanes * 100 + sum;
    if (score > bestScore) { bestScore = score; best = st; }
  }
  G.stones = best;
}

/** Low-frequency seeded noise in [-1, 1]. */
function lowNoise(L, x, z) {
  const np = L.np;
  return 0.6 * Math.sin(x * 0.11 + np[0]) * Math.cos(z * 0.13 + np[1]) + 0.4 * Math.sin((x + z) * 0.071 + np[2]);
}
/** 1 inside an axis strip along z (|x − cx| < width/2, zFrom..zTo), soft 3 m edges. */
function strip(S, x, z) {
  if (!S) return 0;
  const w = (Number(S.width) || 6) / 2;
  const along = smoothstep(S.zFrom - 4, S.zFrom, z) * (1 - smoothstep(S.zTo, S.zTo + 4, z));
  return along * (1 - smoothstep(w, w + 3, Math.abs(x - (S.x || 0))));
}
/** DESIGN §4.3 depth recipe for an authored arena (before calibration). */
function recipeDepth(L, x, z) {
  const r = Math.hypot(x, z);
  const fromShore = L.shoreR(Math.atan2(z, x)) - r;
  if (fromShore <= 0) return 0;
  const R = L.R;
  let base;
  switch (L.layoutKind) {
    case 'twoBasins': {
      base = 0.475 + 0.125 * lowNoise(L, x * 1.3, z * 1.3);                 // 0.35..0.6 between the basins
      const k = strip(L.reef, x, z);
      if (k > 0) base += ((L.reef.depth ?? 0.15) - base) * k;
      break;
    }
    case 'ringTrench': {
      const pr = L.plateau?.r ?? 22, pd = L.plateau?.depth ?? 0.2;
      const ti = L.trench?.rInner ?? 26, to = L.trench?.rOuter ?? 48, td = L.trench?.depth ?? 0.92;
      base = r < (ti + to) / 2 ? pd + (td - pd) * smoothstep(pr, ti, r) : td + (0.45 - td) * smoothstep(to, to + 4, r);
      break;
    }
    case 'drop': {
      base = 0.8;
      const k = strip(L.causeway, x, z);
      if (k > 0) base += ((L.causeway.depth ?? 0.2) - base) * k;
      break;
    }
    default: { const q = 1 - Math.min(1, r / R); base = 0.15 + 0.6 * q * q; }   // 'bowl'
  }
  let isl = 1;
  for (let i = 0; i < L.islands.length; i++) {
    const o = L.islands[i];
    const e = Math.hypot(x - o.x, z - o.z) - o.r;
    if (e < 5) isl *= smoothstep(0, 5, e);
  }
  let d = clamp(base * smoothstep(0, L.shelf, fromShore) * isl + L.noiseAmp * lowNoise(L, x, z), 0, 1);
  for (let i = 0; i < L.pools.length; i++) {
    const p = L.pools[i];
    const q = Math.hypot(x - p.x, z - p.z);
    if (q < p.r) d = Math.max(d, p.depth * smoothstep(p.r, p.r * 0.6, q));
  }
  return d;
}

/**
 * Measure the recipe's shallow/mid/deep share of open water (DEPTH_BANDS 0.35 / 0.75) and,
 * when arena.depthShare is given, build a monotonic remap so the lake meets it. The remap
 * keeps 0 → 0 and 1 → 1 and the order of every point, so the authored shapes (pools,
 * reefs, trench, causeway) keep their relative depths.
 */
function calibrateDepth(L, share) {
  const vals = [];
  const step = Math.max(1.5, L.R / 40);
  for (let x = -L.R; x <= L.R; x += step) for (let z = -L.R; z <= L.R; z += step) {
    if (!isOpenWaterL(L, L.obstacles, x, z, 0.5)) continue;
    vals.push(recipeDepth(L, x, z));
  }
  vals.sort((a, b) => a - b);
  const q = (f) => vals[Math.min(vals.length - 1, Math.max(0, Math.round(f * (vals.length - 1))))];
  const frac = (lo, hi) => vals.filter((v) => v >= lo && v < hi).length / Math.max(1, vals.length);
  L.depthStats = { raw: [frac(0, 0.35), frac(0.35, 0.75), frac(0.75, 1.01)] };
  if (!share || share.length < 3 || !vals.length) return;
  const tot = share[0] + share[1] + share[2];
  if (!(tot > 0)) return;
  const t1 = q(share[0] / tot), t2 = q((share[0] + share[1]) / tot);
  if (!(t1 > 0.02 && t2 > t1 + 0.02 && t2 < 0.98)) return;
  L.depthScale = { t1, t2 };
}

/** Depth 0 (shore/islands) .. 1 (deep basins). Smooth and deterministic. */
export function depthAt(L, x, z) {
  if (L.authored) {
    const d = recipeDepth(L, x, z);
    const S = L.depthScale;
    if (!S) return d;
    if (d <= S.t1) return 0.35 * d / S.t1;
    if (d <= S.t2) return 0.35 + 0.4 * (d - S.t1) / (S.t2 - S.t1);
    return 0.75 + 0.25 * (d - S.t2) / (1 - S.t2);
  }
  const d = Math.hypot(x, z);
  const sr = L.shoreR(Math.atan2(z, x));
  const fromShore = sr - d;
  if (fromShore <= 0) return 0;
  let k = smoothstep(0, L.shelf, fromShore);
  for (let i = 0; i < L.islands.length; i++) {
    const o = L.islands[i];
    const e = Math.hypot(x - o.x, z - o.z) - o.r;
    if (e < o.shelf) k *= smoothstep(-0.5, o.shelf, e);
  }
  for (let i = 0; i < L.pillars.length; i++) {
    const p = L.pillars[i];
    const e = Math.hypot(x - p.x, z - p.z) - p.r;
    if (e < 3) k *= 0.45 + 0.55 * smoothstep(0, 3, e);
  }
  let keep = 1;
  for (let i = 0; i < L.basins.length; i++) {
    const B = L.basins[i];
    const q = Math.hypot(x - B.x, z - B.z) / B.r;
    if (q < 1) { const f = 1 - q * q; keep *= 1 - B.amp * f * (0.55 + 0.45 * f); }
  }
  const b = 1 - keep;
  const np = L.np;
  const n = 0.5 + 0.3 * Math.sin(x * 0.11 + np[0]) * Math.cos(z * 0.13 + np[1]) + 0.2 * Math.sin((x + z) * 0.071 + np[2]);
  const base = 0.3 + 0.24 * n + 0.74 * b;
  return clamp(base * k, 0, 1);
}

export function isOpenWaterL(L, obstacles, x, z, r = 1) {
  const d = Math.hypot(x, z);
  if (d > L.shoreR(Math.atan2(z, x)) - r) return false;
  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];
    const m = o.r + r, dx = x - o.x, dz = z - o.z;
    if (dx * dx + dz * dz < m * m) return false;
  }
  return true;
}
