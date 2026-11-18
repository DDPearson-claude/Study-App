// world-sporewood.js — Sporewood Pools' living landmarks under the loop (LAKE2 §3.3–§3.5) (world author). world-art.js calls it for a water
// built on an outline shore with a look (world-flora.lushLook): never on the Mossmere, never off the loop. None of it is stone.
//
//   the cap-rim window   far caps on the far rim, 28–40 m up, framing a ragged window of sky (the landmarks' statics: 0 new draws)
//   the Mother Cap       30 m on the Mother's Foot, its cap 22 m across over the Mother's Cup, its gills lit amber, vines from its rim
//   the Gill Harp        two cap trees leaning over the neck from both banks; their gills hang in strings the raft passes under
//   the Veil             a fallen cap stalk across the Veil inlet's mouth, a curtain of moss strands hung from it that parts round the raft
//   the Seep             a 2.5 m fall into the East Pool from a fern ravine: its own scrolling card and the foam at its foot (+1 draw)
//   the Lantern Stalks   five groves of tall glowcaps round both pools, the spore moths' lamps
//   the cap trees        moss-footed caps on the banks and the isles (the Two Stools, Mossback Isle's leaning cap), Rootknot's roots
//   Rootfoot Landing     the jetty on root-posts, an arch of living willow over its head, terracotta pots grown over with fern
//   the spore-haze       a thin rose-cream layer in the coves and on the Reed Flats from dusk (one mist-sheet draw)
// Its stalks, caps and roots join world-art's organics, rock and glow statics (kit) and the landmarks' (hero); its strands, ferns and
// moss are flora items (returned as `extra`, stamped with the kit). It draws from its own seeded stream (`rng`, world-art's art stream is
// only used through P, the built prop builders). → {extra, caps, lamps, falls, haze, info}
import * as THREE from 'three';
import { prep, mat, taperTube, latheGeo, wobble, lin, mixArr, scaleArr, rockGeo, TAU } from './world-geo.js';
import { sdfAt, sdfGrad, groundAt, shoreAt } from './world-outline.js';
import { createMistSheets } from './world-fx.js';
import { makeRng } from './core.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const G = { x: 0, z: 0 };

/** March from (x, z) along (dx, dz) until the field is below −back (on land `back` m in); → {x, z, d} or null within `max` m. */
export function landAlong(O, x, z, dx, dz, back = 1, max = 40) {
  const l = Math.hypot(dx, dz) || 1, ux = dx / l, uz = dz / l;
  for (let d = 0; d <= max; d += 0.25) { const px = x + ux * d, pz = z + uz * d; if (sdfAt(O, px, pz) < -back) return { x: px, z: pz, d }; }
  return null;
}
/** The narrowest crossing of the water along a polyline (its points between t0 and t1 of its length): {x, z, ux, uz (along), a, b (the
 *  two banks' points), w} — the Veil's mouth on the Veilwater's glide. */
export function narrowest(O, pts, t0 = 0.5, t1 = 1) {
  const segs = []; let tot = 0;
  for (let i = 0; i + 1 < pts.length; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); segs.push(l); tot += l; }
  let best = null;
  for (let s = t0 * tot; s <= t1 * tot; s += 0.5) {
    let r = s, i = 0; while (i < segs.length - 1 && r > segs[i]) { r -= segs[i]; i++; }
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], f = Math.min(1, r / (segs[i] || 1));
    const x = ax + (bx - ax) * f, z = az + (bz - az) * f, ux = (bx - ax) / (segs[i] || 1), uz = (bz - az) / (segs[i] || 1);
    if (sdfAt(O, x, z) < 0.5) continue;
    const a = landAlong(O, x, z, -uz, ux, 0, 30), b = landAlong(O, x, z, uz, -ux, 0, 30);
    if (!a || !b) continue;
    const w = a.d + b.d;
    if (!best || w < best.w) best = { x, z, ux, uz, a, b, w };
  }
  return best;
}

export function buildSporewoodArt({ ctx, L, look, kit, hero, P, K, PL, halos, addAnchor, low = false, inkC }) {
  const O = L.outline;
  const rng = makeRng(((L.artSeed | 0) ^ 0x5e3d7) >>> 0);
  const extra = [], caps = [], lamps = [], cuts = [], info = {};   // (cuts: circles on the lens's side the see-through cut reads)
  const lk = (h) => scaleArr(lin(h), num(look.albedo, 1.5));
  const mg = lk(look.mossG), mgh = lk(look.mossGHi), amt = num(look.mossAmt, 0.6);
  const capC = K.cap, capHi = K.capHi, glowC = PL.glow, bone = K.bone, org = K.organic;
  const stalkCol = (y0, mossTo = 2.5) => (px, py) => {
    const c = mixArr(org, bone, 0.2 + 0.25 * Math.sin(py * 1.3));
    return mixArr(c, mixArr(mg, mgh, 0.3), amt * clamp01(1 - (py - y0) / mossTo));   // (the foot moss-grown)
  };
  const gy = (x, z) => Math.max(0, groundAt(O, x, z));
  const D = ctx?.data;
  const glides = Object.values(D?.LOOP?.places || {}).filter((p) => p?.water === 'sporewood' && Array.isArray(p.out)).map((p) => p.out);
  const nearGlide = (x, z, r) => glides.some((g) => g.some((q, i) => i + 1 < g.length && segD(x, z, q, g[i + 1]) < r));

  // ---- a cap on a stalk: the stalk a tube along pts, the cap a lathe over its top, its gills glowing (organics, glow; halos, anchor)
  function capTree(pts, capR, { capH = 0.45, gill = glowC, spots = true, anchor = 0, mossTo = 2.5, tiltX = 0, tiltZ = 0, radial = 9, list = kit, stalk: srK = 0.13 } = {}) {
    const top = pts[pts.length - 1], sr = capR * srK;
    const stalk = taperTube(pts, (t) => sr * (1.45 - t * 0.5 + (t < 0.07 ? 0.6 * (1 - t / 0.07) : 0)), radial, Math.max(10, pts.length * 5));
    list.org.push(prep(stalk, { colorFn: stalkCol(pts[0].y, mossTo) }));
    const ch = capR * capH;
    const cap = latheGeo([[0.01, 0], [capR * 0.5, -ch * 0.02], [capR * 0.92, -ch * 0.06], [capR, ch * 0.08], [capR * 0.86, ch * 0.5], [capR * 0.48, ch * 0.9], [0, ch]], capR > 6 ? 26 : 16);
    wobble(cap, capR * 0.035, 1.1, top.x);
    // (LAKE 2, the art pass: the cap's underside and rim warm and light, a cream-ochre lit from its gills, so a cap never reads as a black
    // canopy; its crown the ochre of the built caps)
    const under = mixArr(capHi, bone, 0.35);
    list.org.push(prep(cap, { matrix: mat(top.x, top.y, top.z, tiltX, rng() * TAU, tiltZ), colorFn: (px, py, pz, nx, ny) => (ny < -0.2 ? mixArr(under, capHi, clamp01((py - top.y) / ch) * 0.5) : mixArr(capC, capHi, clamp01((py - top.y) / ch) * 0.8)) }));
    const gl = latheGeo([[capR * 0.16, -ch * 0.05], [capR * 0.6, -ch * 0.085], [capR * 0.95, -ch * 0.03]], capR > 6 ? 26 : 16);
    list.glow.push(prep(gl, { matrix: mat(top.x, top.y - 0.03, top.z, tiltX, 0, tiltZ), color: scaleArr(gill, 1.5) }));
    if (spots) for (let i = 0, n = 2 + ((rng() * 4) | 0); i < n; i++) {
      const a = rng() * TAU, d = capR * rng.range(0.2, 0.7);
      list.glow.push(prep(new THREE.SphereGeometry(capR * 0.045, 5, 4), { matrix: mat(top.x + Math.cos(a) * d, top.y + ch * (1 - (d / capR) * 0.6) * 0.93, top.z + Math.sin(a) * d), color: scaleArr(PL.accent, 1.6) }));
    }
    halos.add(top.x, top.y - ch * 0.3, top.z, scaleArr(gill, 0.6), Math.min(capR * 2.4, 9));
    if (anchor > 0) addAnchor(top.x, top.y - ch * 0.4, top.z, new THREE.Color().setRGB(gill[0], gill[1], gill[2]).getHex(), anchor, Math.min(capR * 2.6, 16));
    return { x: top.x, y: top.y, z: top.z, r: capR, ch };
  }
  /** Strands hung under a cap's rim (gill strings and moss), as flora items. */
  function hangUnder(c, n, { lenMin, lenMax, kindGill = 0.6, rMin = 0.3, rMax = 0.92, floor = 2.8 }) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + rng.range(-0.2, 0.2), d = c.r * rng.range(rMin, rMax);
      const x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d, y = c.y - c.ch * 0.06 * (d / c.r) - 0.05;
      const len = Math.max(0.6, Math.min(rng.range(lenMin, lenMax), y - floor));
      extra.push({ k: rng() < kindGill ? 'gill' : 'strand', x, y, z, ry: rng() * TAU, s: rng.range(0.8, 1.2), sy: len });
    }
  }

  // ==================================================================== the cap-rim window (far caps framing the sky)
  {
    const placed = [], q = {};
    const n = low ? 8 : 12;
    for (let t = 0; t < 600 && placed.length < n; t++) {
      shoreAt(O, rng() * O.len, q);
      if (q.nz > 0.35 && rng() < 0.8) continue;   // (mostly on the far side: they frame the top of the lens's frame)
      const d = rng.range(18, 34), x = q.x + q.nx * d, z = q.z + q.nz * d;
      if (sdfAt(O, x, z) > -14 || placed.some((p) => Math.hypot(p.x - x, p.z - z) < 20)) continue;
      placed.push({ x, z });
      const h = rng.range(28, 40), cr = rng.range(9, 15), y0 = gy(x, z) - 2, ry = rng() * TAU;
      const st = taperTube([V(0, -2, 0), V(rng.range(-2, 2), h * 0.5, 0), V(rng.range(-4, 4), h, 0)], (t2) => 2.2 * (1.3 - t2 * 0.5), 7, 10);
      hero.ink.push(prep(st, { matrix: mat(x, y0, z, 0, ry, 0), color: inkC }));
      const ch = cr * 0.38;
      const cap = latheGeo([[0.01, 0], [cr * 0.5, -ch * 0.02], [cr * 0.92, -ch * 0.06], [cr, ch * 0.08], [cr * 0.85, ch * 0.55], [cr * 0.45, ch * 0.92], [0, ch]], 16);
      const top = new THREE.Vector3(st.attributes.position.getX(st.attributes.position.count - 1), h, 0).applyAxisAngle(V(0, 1, 0), ry);
      hero.ink.push(prep(cap, { matrix: mat(x + top.x, y0 + h, z + top.z, rng.range(-0.1, 0.1), ry, rng.range(-0.1, 0.1)), color: mixArr(inkC, capC, 0.42) }));
      const gl = latheGeo([[cr * 0.2, -ch * 0.05], [cr * 0.6, -ch * 0.08], [cr * 0.94, -ch * 0.03]], 16);
      hero.glow.push(prep(gl, { matrix: mat(x + top.x, y0 + h - 0.15, z + top.z, 0, ry, 0), color: scaleArr(glowC, 0.75) }));
      for (let k = 0; k < 2; k++) { const a2 = ry + k * 3.1 + rng.range(-0.3, 0.3), rr = cr * rng.range(0.55, 0.85); halos.add(x + top.x + Math.cos(a2) * rr, y0 + h - ch * 0.25, z + top.z + Math.sin(a2) * rr, scaleArr(glowC, 0.5), 5); }
    }
    info.rim = placed.length;
  }

  // ==================================================================== the Mother Cap
  {
    const isl = (O.islands || []).find((o) => o.kind === 'cap');
    const cup = L.legendPool || { x: 48, z: 6, r: 3.2 };
    if (isl) {
      const bx = isl.x, bz = isl.z, by = gy(bx, bz) - 0.6, cx = cup.x + (bx - cup.x) * 0.25, cz = cup.z + (bz - cup.z) * 0.25;
      // (20 m, not the design's 30: the sail lens looks about 11° down with its top 17° up, so a 30 m cap was never in a play frame;
      // tipped a little toward the lens's side so its lit gills face the East Pool's south and the Landing)
      const pts = [V(bx, by, bz), V(bx - 0.6, by + 6, bz - 0.3), V(bx - (bx - cx) * 0.45, by + 12, bz - (bz - cz) * 0.45), V(cx + (bx - cx) * 0.1, 20, cz + (bz - cz) * 0.1)];
      const c = capTree(pts, 11, { capH: 0.4, anchor: 2.4, mossTo: 6, radial: 12, tiltX: 0.12, stalk: 0.11 });
      // its foot: the roots splaying into the water and over the isle, moss on them
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + rng.range(-0.3, 0.3), r1 = rng.range(2.6, 4.2);
        const rt = taperTube([V(bx + Math.cos(a) * 0.8, by + 2.2, bz + Math.sin(a) * 0.8), V(bx + Math.cos(a) * r1 * 0.6, by + 1.2, bz + Math.sin(a) * r1 * 0.6), V(bx + Math.cos(a) * r1, -0.4, bz + Math.sin(a) * r1)], (t) => 0.5 * (1 - t * 0.7), 6, 8);
        kit.org.push(prep(rt, { colorFn: stalkCol(-1, 6) }));
      }
      hangUnder(c, low ? 10 : 18, { lenMin: 3, lenMax: 9, kindGill: 0.2, rMin: 0.75, rMax: 0.98, floor: 4.5 });
      caps.push({ x: bx, z: bz, r: 2.6 });
      info.mother = { x: c.x, y: c.y, z: c.z, r: c.r };
    }
  }

  // ==================================================================== the Gill Harp: two caps leaning over the neck from both banks
  {
    const gh = D?.loopPlace?.('gill_harp')?.area || { x: 0, z: 6.5, r: 4.5 };
    const harp = [];
    for (const [sgn, ox] of [[-1, -5.5], [1, 5]]) {   // (−1: the north bank, −z; +1: the south bank, the lens's side)
      const ln = landAlong(O, gh.x + ox, gh.z, 0, sgn, sgn > 0 ? 6.5 : 3, 30);   // (the lens's side's foot well back: its stalk passes over the lens)
      if (!ln) continue;
      const by = gy(ln.x, ln.z) - 0.4, cz = gh.z + sgn * 1.2, cx = gh.x + ox * 0.6;
      const pts = [V(ln.x, by, ln.z), V(ln.x - ox * 0.05, by + 3.2, ln.z - sgn * 0.6), V((ln.x + cx) / 2, by + 6.8, (ln.z + cz) / 2 + sgn * 0.6), V(cx, 10.4 + (sgn > 0 ? 0.8 : 0), cz)];
      const c = capTree(pts, sgn > 0 ? 4.6 : 5.4, { capH: 0.4, anchor: 2, mossTo: 3.5, tiltX: -sgn * 0.12, stalk: 0.085 });
      for (let k = 0; k <= 6; k++) { const t = k / 6; cuts.push({ x: ln.x + (cx - ln.x) * t, z: ln.z + (cz - ln.z) * t, r: 0.9 }); }   // (its stalk: the lens's cut)
      // (LAKE 2, the art pass: more strings, and longer, so the Harp reads as caps with strings hanging from them, never a dark canopy)
      hangUnder(c, low ? 12 : 24, { lenMin: 6, lenMax: 8.6, kindGill: 0.8, rMin: 0.2, rMax: 0.96, floor: 2.4 });
      caps.push({ x: ln.x, z: ln.z, r: 1.2 });
      harp.push({ x: c.x, y: c.y, z: c.z });
    }
    info.harp = harp;
  }

  // ==================================================================== the Veil: a fallen stalk across the inlet's mouth, a moss curtain
  {
    const out = D?.LOOP?.places?.veilwater?.out;
    const m = Array.isArray(out) && out.length > 2 ? narrowest(O, out.slice(-3), 0.15, 0.85) : null;
    if (m) {
      const ax = m.a.x + (m.a.x - m.x) / Math.max(0.5, m.a.d) * 2.2, az = m.a.z + (m.a.z - m.z) / Math.max(0.5, m.a.d) * 2.2;
      const bx = m.b.x + (m.b.x - m.x) / Math.max(0.5, m.b.d) * 2.2, bz = m.b.z + (m.b.z - m.z) / Math.max(0.5, m.b.d) * 2.2;
      const ay = gy(ax, az) + 0.4, byy = gy(bx, bz) + 0.4, top = 4.6;
      const logAt = (t) => ({ x: ax + (bx - ax) * t, y: ay + (byy - ay) * t + Math.sin(Math.PI * t) * (top - (ay + byy) / 2) * 0.9, z: az + (bz - az) * t });
      const lp = [0, 0.25, 0.5, 0.75, 1].map((t) => { const p = logAt(t); return V(p.x, p.y, p.z); });
      kit.org.push(prep(taperTube(lp, (t) => 0.55 - 0.15 * t, 8, 16), { colorFn: (px, py, pz, nx, ny) => mixArr(mixArr(org, bone, 0.15), mixArr(mg, mgh, 0.4), amt * clamp01(ny * 1.4)) }));
      // the broken cap at its root end, half-sunk in the bank
      // (LAKE 2, the art pass: "a fallen cap fills a quarter of the frame at the lens": the broken cap is small and sunk well back into the
      // bank, behind the stalk's root, so the shot frames the strand curtain under its stalk)
      const capG = latheGeo([[0.01, 0], [1.3, -0.06], [1.5, 0.18], [1.2, 0.65], [0.5, 0.92], [0, 0.98]], 12);
      const kx = bx + (bx - m.x) / Math.max(0.5, m.b.d) * 1.6, kz = bz + (bz - m.z) / Math.max(0.5, m.b.d) * 1.6;
      kit.org.push(prep(capG, { matrix: mat(kx, gy(kx, kz) - 0.55, kz, 0.9, rng() * TAU, 0.4), colorFn: (px, py) => mixArr(capC, capHi, clamp01((py - byy + 0.8) / 2) * 0.6) }));
      // the curtain, two staggered rows over the water between the banks (it parts round the raft: flora's strands)
      const L2 = Math.hypot(bx - ax, bz - az), step = low ? 0.55 : 0.34;
      let n = 0;
      for (let row = 0; row < 2; row++) for (let s = row * step * 0.5; s < L2; s += step) {
        const t = s / L2, p = logAt(t), sh = sdfAt(O, p.x, p.z);
        if (sh < -0.3) continue;
        const off = (row - 0.5) * 0.28, x = p.x + m.ux * off, z = p.z + m.uz * off, y = p.y - 0.4;
        extra.push({ k: rng() < 0.12 ? 'gill' : 'strand', x, y, z, ry: Math.atan2(m.ux, m.uz) + rng.range(-0.4, 0.4), s: rng.range(0.9, 1.3), sy: Math.max(0.8, y - 0.35 - rng.range(0, 0.4)) });
        n++;
      }
      info.veil = { x: m.x, z: m.z, w: +m.w.toFixed(2), strands: n };
    }
  }

  // ==================================================================== the Seep: a fall into the East Pool from a fern ravine
  let falls = null;
  {
    const inflow = { x: 74.5, z: -24 };
    const ln = landAlong(O, inflow.x, inflow.z, 0.55, -0.35, 0.05, 30);
    if (ln) {
      sdfGrad(O, ln.x, ln.z, G);
      const fx = ln.x, fz = ln.z, h = 2.6, w = 2.1, ox = -G.x, oz = -G.z;   // (o: into the land)
      const lipX = fx + ox * 1.4, lipZ = fz + oz * 1.4;
      // the ravine's lips: mossy boulders either side of the fall
      for (const s of [-1, 1]) for (let k = 0; k < 2; k++) {
        const px = lipX + -oz * s * (w * 0.75 + k * 0.9) + ox * k * 0.8, pz = lipZ + ox * s * (w * 0.75 + k * 0.9) + oz * k * 0.8, r = rng.range(0.7, 1.2);
        kit.rock.push(prep(rockGeo(rng, { r, h: r * rng.range(1.1, 1.6), detail: 1, rough: 0.3 }), { matrix: mat(px, gy(px, pz) - 0.2, pz, 0, rng() * TAU, 0),
          colorFn: (x2, y2, z2, nx, ny) => mixArr(mixArr(K.rock, K.rockHi, 0.4), mixArr(mg, mgh, 0.5), amt * clamp01((ny - 0.2) * 1.6)) }));
      }
      for (let k = 0; k < 10; k++) {
        const a = rng() * TAU, d = rng.range(1.2, 4.5), px = lipX + Math.cos(a) * d + ox * 1.5, pz = lipZ + Math.sin(a) * d + oz * 1.5;
        if (sdfAt(O, px, pz) > -0.5) continue;
        extra.push({ k: k % 3 === 0 ? 'tfern' : 'fernUp', x: px, y: gy(px, pz) - 0.05, z: pz, ry: rng() * TAU, s: k % 3 === 0 ? rng.range(0.7, 0.9) : rng.range(0.9, 1.4), sy: 1 });
      }
      falls = buildFalls({ x: lipX, y: h, z: lipZ, bx: fx - ox * 0.4, bz: fz - oz * 0.4, w, nx: -ox, nz: -oz }, PL);
      info.seep = { x: +fx.toFixed(2), z: +fz.toFixed(2) };
    }
  }

  // ==================================================================== the Lantern Stalks: five groves of glowcaps round both pools
  {
    const groves = [], q = {};
    for (let t = 0; t < 800 && groves.length < 5; t++) {
      shoreAt(O, rng() * O.len, q);
      if (q.nz > 0.3 || q.h < 1.2) continue;
      const d = rng.range(2.4, 4.5), x = q.x + q.nx * d, z = q.z + q.nz * d;
      if (sdfAt(O, x, z) > -1.5 || groves.some((g) => Math.hypot(g.x - x, g.z - z) < 34) || nearGlide(x, z, 5)) continue;
      groves.push({ x, z });
    }
    groves.forEach((g, gi) => {
      const n = 3 + ((rng() * 3) | 0);
      for (let i = 0; i < n; i++) {
        const a = rng() * TAU, d = i === 0 ? 0 : rng.range(1.1, 2.8), x = g.x + Math.cos(a) * d, z = g.z + Math.sin(a) * d;
        if (sdfAt(O, x, z) > -0.8) continue;
        const hh = rng.range(4.2, 7.8), cr = rng.range(0.9, 1.7), by = gy(x, z) - 0.3, lean = rng.range(-0.35, 0.35);
        const pts = [V(x, by, z), V(x + lean * 0.4, by + hh * 0.45, z + lean * 0.2), V(x + lean, by + hh, z + lean * 0.5)];
        const c = capTree(pts, cr, { capH: 0.55, gill: mixArr(glowC, PL.candle || glowC, 0.25), spots: false, mossTo: 1.2, radial: 6 });
        lamps.push({ key: `stalk${gi}_${i}`, kind: 'cap', x: c.x, y: c.y - 0.2, z: c.z, k: 1 });
        caps.push({ x, z, r: 0.4 });
      }
    });
    info.groves = groves.length; info.lamps = lamps.length;
  }

  // ==================================================================== the cap trees on the banks and the isles; Rootknot's roots
  {
    const want = Math.round(num(look.flora?.capTrees, 14) * (low ? 0.6 : 1));
    let made = 0;
    for (const o of O.islands || []) {
      const ix = o.x, iz = o.z, top = gy(ix, iz);
      if (o.kind === 'moss') {
        const pts = [V(ix + 1.5, top - 0.3, iz), V(ix + 2.6, top + 3.5, iz + 0.6), V(ix + 4.6, top + 7, iz + 1.4)];
        capTree(pts, 3.4, { capH: 0.42, anchor: 2.6, mossTo: 2.5, tiltZ: -0.25 });
        caps.push({ x: ix + 1.5, z: iz, r: 0.7 }); made++;
      } else if (o.kind === 'stool') {
        const c = capTree([V(ix, top - 0.3, iz), V(ix + 0.1, top + 0.9, iz), V(ix + 0.15, top + 1.6, iz)], rng.range(1.5, 1.9), { capH: 0.5, spots: true, mossTo: 0.8, radial: 7 });
        caps.push({ x: ix, z: iz, r: 0.45 }); made++;
        lamps.push({ key: `stool${made}`, kind: 'cap', x: c.x, y: c.y - 0.1, z: c.z, k: 1 });
      } else if (o.kind === 'roots') {
        // (LAKE 2, the art pass: "a black spider on an islet". Its roots lower, paler and moss-grown, and over them a small cap on the stump
        // with its own lit gill strings, so the knot reads as roots under a cap with strings hanging from it)
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * TAU + rng.range(-0.2, 0.2), r1 = rng.range(2.2, 3.6), hgt = rng.range(0.9, 1.8) * 0.6;
          const rt = taperTube([V(ix + Math.cos(a) * 0.3, top + hgt * 0.4, iz + Math.sin(a) * 0.3), V(ix + Math.cos(a) * r1 * 0.55, top + hgt, iz + Math.sin(a) * r1 * 0.55), V(ix + Math.cos(a) * r1, -0.5, iz + Math.sin(a) * r1)], (t) => 0.28 * (1 - t * 0.6), 5, 8);
          kit.org.push(prep(rt, { colorFn: (px, py, pz, nx, ny) => mixArr(mixArr(org, bone, 0.3), mixArr(mg, mgh, 0.55), Math.min(1, amt * 1.3) * clamp01(ny * 1.2 + 0.2)) }));
        }
        const kc = capTree([V(ix, top - 0.4, iz), V(ix + 0.15, top + 1.2, iz + 0.05), V(ix + 0.25, top + 2.3, iz + 0.1)], 1.7, { capH: 0.5, spots: true, mossTo: 1.6, radial: 7 });
        hangUnder(kc, low ? 4 : 8, { lenMin: 1.2, lenMax: 1.9, kindGill: 0.85, rMin: 0.45, rMax: 0.95, floor: top + 0.15 });
        lamps.push({ key: 'rootknot', kind: 'cap', x: kc.x, y: kc.y - 0.1, z: kc.z, k: 1 });
      } else if (o.kind === 'tussock') {
        for (let i = 0; i < 7; i++) { const a = rng() * TAU, d = rng.range(0, 1.1); extra.push({ k: 'sedge', x: ix + Math.cos(a) * d, y: top - 0.05, z: iz + Math.sin(a) * d, ry: rng() * TAU, s: rng.range(1, 1.4), sy: rng.range(0.9, 1.3) }); }
      }
    }
    const q = {};
    for (let t = 0; t < 900 && made < want; t++) {
      shoreAt(O, rng() * O.len, q);
      if (q.nz > 0.3 || q.h < 1.4) continue;
      const d = rng.range(3, 8), x = q.x + q.nx * d, z = q.z + q.nz * d;
      if (sdfAt(O, x, z) > -2 || caps.some((c) => Math.hypot(c.x - x, c.z - z) < 9) || nearGlide(x, z, 6)) continue;
      const hh = rng.range(6, 11), cr = rng.range(2.4, 4.2), by = gy(x, z) - 0.3, b = rng.range(-0.25, 0.25);
      // (they lean a little out over the water, toward the open pool)
      const lx = -q.nx * hh * 0.18, lz = -q.nz * hh * 0.18;
      capTree([V(x, by, z), V(x + lx * 0.3 + b, by + hh * 0.5, z + lz * 0.3), V(x + lx, by + hh, z + lz)], cr, { capH: 0.45, anchor: made % 3 === 0 ? 2.8 : 0, mossTo: 2.4 });
      caps.push({ x, z, r: 0.8 });
      made++;
    }
    info.capTrees = made;
  }

  // ==================================================================== Rootfoot Landing: the root-post jetty, the willow arch, the pots
  {
    const d0 = L.docks?.[0];
    if (d0) {
      // the bank behind the tie-up: march from the dock away from the water
      sdfGrad(O, d0.x, d0.z, G);
      const back = landAlong(O, d0.x, d0.z, -G.x, -G.z, 0.8, 12);
      if (back) {
        const ux = -G.x, uz = -G.z, px = -uz, pz = ux, len = Math.hypot(back.x - d0.x, back.z - d0.z);
        // the deck: planks across the jetty, from the tie-up to the bank (its root-posts either side)
        for (let s = -0.4; s < len + 0.6; s += 0.42) {
          const x = d0.x + ux * s, z = d0.z + uz * s, y = Math.max(0.42, gy(x, z) + 0.05);
          kit.org.push(prep(new THREE.BoxGeometry(1.9, 0.09, 0.36), { matrix: mat(x, y, z, 0, Math.atan2(ux, uz), rng.range(-0.04, 0.04)), color: mixArr(K.wood, bone, 0.18 + rng() * 0.12) }));
        }
        for (let s = 0; s <= len + 0.4; s += 1.6) for (const side of [-1, 1]) {
          const x = d0.x + ux * s + px * side * 1.05, z = d0.z + uz * s + pz * side * 1.05, h = 1.3 + rng() * 0.4;
          const tw = rng() * TAU;
          const pts = [V(x, -0.8, z), V(x + Math.cos(tw) * 0.08, h * 0.5, z + Math.sin(tw) * 0.08), V(x - Math.cos(tw) * 0.05, h, z - Math.sin(tw) * 0.05)];
          kit.org.push(prep(taperTube(pts, (t) => 0.13 * (1.25 - t * 0.4), 6, 6), { colorFn: (x2, y2) => mixArr(mixArr(K.wood, org, 0.35), mixArr(mg, mgh, 0.4), amt * clamp01(1 - (y2 + 0.2) / 0.9)) }));
        }
        // the willow arch over the jetty's head: two living trunks bending to meet overhead, leaves hanging from it
        const hx = back.x, hz = back.z, hy = gy(hx, hz);
        const L1 = V(hx + px * 1.5, hy - 0.2, hz + pz * 1.5), L2 = V(hx - px * 1.5, hy - 0.2, hz - pz * 1.5);
        cuts.push({ x: L1.x, z: L1.z, r: 0.6 }, { x: L2.x, z: L2.z, r: 0.6 }, { x: hx, z: hz, r: 1 });
        for (const [a, b] of [[L1, L2], [L2, L1]]) {
          const pts = [a, V(a.x + (b.x - a.x) * 0.12, a.y + 2.2, a.z + (b.z - a.z) * 0.12), V(a.x + (b.x - a.x) * 0.45, a.y + 3.6, a.z + (b.z - a.z) * 0.45), V(a.x + (b.x - a.x) * 0.62, a.y + 3.3, a.z + (b.z - a.z) * 0.62)];
          kit.org.push(prep(taperTube(pts, (t) => 0.14 * (1 - t * 0.6), 6, 12), { colorFn: (x2, y2) => mixArr(mixArr(K.wood, org, 0.3), mixArr(mg, mgh, 0.3), amt * clamp01(1 - (y2 - hy) / 1.4)) }));
        }
        for (let i = 0; i < (low ? 6 : 12); i++) {
          const t = rng.range(0.1, 0.9), x = L1.x + (L2.x - L1.x) * t, z = L1.z + (L2.z - L1.z) * t, y = hy + 1.8 + 1.6 * Math.sin(Math.PI * t);
          extra.push({ k: 'strand', x: x + ux * rng.range(-0.25, 0.25), y, z: z + uz * rng.range(-0.25, 0.25), ry: rng() * TAU, s: rng.range(0.8, 1.1), sy: rng.range(0.6, 1.5) });
        }
        extra.push({ k: 'bush', x: L1.x + ux * 0.6, y: hy - 0.1, z: L1.z + uz * 0.6, ry: rng() * TAU, s: 0.7, sy: 0.9 }, { k: 'bush', x: L2.x + ux * 0.6, y: hy - 0.1, z: L2.z + uz * 0.6, ry: rng() * TAU, s: 0.65, sy: 0.85 });
        // terracotta pots grown over with fern, either side of the jetty's head
        const terra = mixArr(scaleArr(lin(0x9a5a40), 1.3), K.rock, 0.25);
        for (const [side, s0] of [[1, 2.4], [-1, 2.2], [1, 3.4]]) {
          const x = hx + px * side * s0 + ux * 0.8, z = hz + pz * side * s0 + uz * 0.8, y = gy(x, z) - 0.05, r = rng.range(0.28, 0.4);
          kit.org.push(prep(latheGeo([[0.01, 0], [r * 0.7, 0], [r, r * 0.9], [r * 1.12, r * 1.25], [r * 0.98, r * 1.3]], 9), { matrix: mat(x, y, z), colorFn: (x2, y2) => mixArr(terra, mixArr(mg, mgh, 0.4), amt * clamp01(1 - (y2 - y) / (r * 0.8)) * 0.8) }));
          extra.push({ k: 'fernUp', x, y: y + r * 1.15, z, ry: rng() * TAU, s: r * 1.6, sy: 1 });
        }
        info.landing = { x: +hx.toFixed(2), z: +hz.toFixed(2), deck: +len.toFixed(2) };
      }
    }
  }

  // ==================================================================== the spore-haze (one mist-sheet draw; world-art's applyMood tints it)
  let haze = null;
  {
    const H = look.haze || {};
    const src = [[-62, 36], [-46, 35.5], [-32, 29], [-56, -42], [-86, 40], [24, -28], [-8, 22], [62, -26]].map(([x, z], i) => ({ x, y: rng.range(0.35, Math.min(1.1, num(H.top, 1.2))), z, size: rng.range(12, 18), phase: i * 1.7, drift: 0.12 }))
      .filter((s) => sdfAt(O, s.x, s.z) > 0.5);
    // (createMistSheets keeps every other sheet: the list is doubled so each cove keeps one)
    haze = createMistSheets(src.flatMap((s) => [s, s]));
    haze.mesh.name = 'sporeHaze';
  }
  return { extra, caps, lamps, cuts, falls, haze, info };
}

/** The Seep's fall: a scrolling card from the ravine's lip down to the water and the foam at its foot (one mesh, one draw). */
function buildFalls(f, PL) {
  const n = 8, pos = [], uv = [], idx = [];
  const px = -f.nz, pz = f.nx;   // (across the fall)
  for (let k = 0; k <= n; k++) {
    const t = k / n, y = f.y * (1 - t), out = 0.35 * Math.pow(t, 1.6) + 0.15 * t;   // (it falls out and down, spreading a little)
    const x = f.x + (f.bx - f.x) * t + f.nx * out, z = f.z + (f.bz - f.z) * t + f.nz * out, w = f.w * (0.8 + 0.35 * t);
    pos.push(x - px * w / 2, y, z - pz * w / 2, x + px * w / 2, y, z + pz * w / 2); uv.push(0, t, 1, t);
    if (k < n) { const a = 2 * k; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  }
  // the foam at its foot: a fan of quads on the water (uv.y > 1 marks it), soft and broken, never a ring
  const base = pos.length / 3, fx = f.bx + f.nx * 0.6, fz = f.bz + f.nz * 0.6;
  for (let j = 0; j <= 2; j++) for (let i = 0; i <= 4; i++) {
    const s = (i / 4 - 0.5) * f.w * 1.7, d = j * 1.1;
    pos.push(fx + px * s + f.nx * d, 0.05, fz + pz * s + f.nz * d); uv.push(i / 4, 1 + j / 2);
  }
  for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) { const a = base + j * 5 + i; idx.push(a, a + 5, a + 1, a + 1, a + 5, a + 6); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeBoundingSphere();
  const foam = PL.foam || [0.8, 0.78, 0.86];
  const m = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uTime: { value: 0 }, uColor: { value: new THREE.Color().setRGB(foam[0], foam[1], foam[2]) }, uK: { value: 1 } }]),
    vertexShader: /* glsl */`
      #include <common>
      #include <fog_pars_vertex>
      varying vec2 vUv;
      void main() { vUv = uv; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */`
      #include <common>
      #include <fog_pars_fragment>
      uniform float uTime, uK; uniform vec3 uColor;
      varying vec2 vUv;
      float h1(float n) { return fract(sin(n) * 43758.5453); }
      float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); float a = h1(i.x + i.y * 57.0), b = h1(i.x + 1.0 + i.y * 57.0), c = h1(i.x + (i.y + 1.0) * 57.0), d = h1(i.x + 1.0 + (i.y + 1.0) * 57.0); return mix(mix(a, b, f.x), mix(c, d, f.x), f.y); }
      void main() {
        float a;
        if (vUv.y <= 1.0) {
          // the fall: streaks running down, broken; thinner at its edges
          float s = vn(vec2(vUv.x * 11.0, vUv.y * 3.0 - uTime * 2.2)) * 0.65 + vn(vec2(vUv.x * 23.0 + 3.0, vUv.y * 6.0 - uTime * 3.1)) * 0.35;
          a = smoothstep(0.35, 0.75, s) * smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x) * (0.55 + 0.45 * vUv.y);
        } else {
          // the foam on the water at its foot: soft blobs drifting out, fading with the distance from the fall
          float t = vUv.y - 1.0;
          float s = vn(vec2(vUv.x * 7.0, t * 5.0 - uTime * 0.6)) * 0.6 + vn(vec2(vUv.x * 13.0 + 7.0, t * 9.0 - uTime * 0.9)) * 0.4;
          a = smoothstep(0.42, 0.8, s) * (1.0 - smoothstep(0.1, 1.0, t)) * smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.75, vUv.x) * 0.7;
        }
        a *= uK;
        if (a < 0.01) discard;
        gl_FragColor = vec4(uColor * (0.75 + 0.25 * a), a * 0.85);
        #include <fog_fragment>
      }`,
    transparent: true, depthWrite: false, fog: true, side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(g, m);
  mesh.name = 'seepFalls'; mesh.renderOrder = 3;
  return { mesh, geo: g, mat: m };
}

function segD(x, z, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], L2 = vx * vx + vz * vz, t = L2 > 0 ? clamp01(((x - a[0]) * vx + (z - a[1]) * vz) / L2) : 0;
  return Math.hypot(x - (a[0] + vx * t), z - (a[1] + vz * t));
}
