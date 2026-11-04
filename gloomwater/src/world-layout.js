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

  // spawn (south, facing north / -Z so the sail camera looks across the lake)
  const sd = R * 0.42;
  L.spawn = { x: rng.range(-3, 3), z: sd, yaw: 0 };

  // Descent Gate: northern half, deep open water
  {
    const a = -Math.PI / 2 + rng.range(-0.75, 0.75);
    const d = R * rng.range(0.52, 0.64);
    L.gate = { x: Math.cos(a) * d, z: Math.sin(a) * d, radius: 4.5, stones: [] };
    const n = 6, sr = L.gate.radius + 2.1, a0 = rng() * TAU;
    for (let i = 0; i < n; i++) {
      const aa = a0 + (i / n) * TAU + rng.range(-0.08, 0.08);
      L.gate.stones.push({ x: L.gate.x + Math.cos(aa) * sr, z: L.gate.z + Math.sin(aa) * sr, r: 0.75, a: aa, h: rng.range(2.4, 3.6), lean: rng.range(-0.12, 0.12) });
    }
  }

  const dist = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);
  const insideShore = (x, z, pad) => Math.hypot(x, z) + pad <= shoreR(Math.atan2(z, x));

  // islands
  const nIsl = A.islands ?? 6;
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

  // merchant docks: open water near an island or the shore, spaced apart; dock 0 nearest spawn
  {
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

  // pillars / wrecks
  const kinds = PILLAR_KINDS[theme];
  const nPil = A.pillars ?? 8;
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
  L.gateObstacles = L.gate.stones.map((s) => ({ x: s.x, z: s.z, r: s.r, kind: 'gatestone' }));

  // deep basins (one under the gate, one central, a few more)
  L.basins.push({ x: L.gate.x, z: L.gate.z, r: R * 0.34, amp: 1.0 });
  L.basins.push({ x: rng.range(-0.12, 0.12) * R, z: rng.range(-0.15, 0.05) * R, r: R * 0.4, amp: 0.9 });
  for (let i = 0; i < 2; i++) {
    const a = rng() * TAU, d = rng.range(0.3, 0.6) * R;
    L.basins.push({ x: Math.cos(a) * d, z: Math.sin(a) * d, r: R * rng.range(0.22, 0.3), amp: rng.range(0.75, 1.0) });
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

/** Depth 0 (shore/islands) .. 1 (deep basins). Smooth and deterministic. */
export function depthAt(L, x, z) {
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
