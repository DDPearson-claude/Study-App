// actors-heron.js — WC-3 (docs/loop/WATERCRAFT.md §5.4, §9.4 item 4): a grey heron on the Mossmere under the loop. It stands still in
// the margins or at a reed edge where small fish are (a margin or reed spot whose minnow weight this phase is in the top third of the
// lake's areas, from watercraft.js), stabs now and then, lifts off with a croak when the raft comes within 8 m and lands again
// elsewhere, and leaves at dark. It changes no odd. One merged low-poly mesh (its poses swap geometry: one call) on high and medium;
// none on low. Never within 6 m of the mooring, the tow's glide-in or a place's landmark framing.
//   heronSpots(L, D, o)       the spots it may stand at this phase ([{x, z, area}]), pure
//   createHeronState / stepHeron(H, o)   the pure state machine (stand · stab · fly · gone); the tests drive it
//   attachHeron(ctx)          builds it under the loop (main's one line): its mesh in the scene, its own frame clock, 'heron:lift'
import * as THREE from 'three';
import { toonMaterial, setupSurface } from './toon.js';
import { prep, merge, mat, taperTube, lin, mixArr } from './world-geo.js';
import { buildLayout } from './world-layout.js';
import { AREAS, areaAt, areaWeight, probeOf, lightOf } from './watercraft.js';
import { faceOn, faceRng, avoidList, clearanceOf, reedPlan } from './watercraft-face.js';

const TAU = Math.PI * 2;
const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
export const HERON = Object.freeze({ lift: 8, keep: 6, stab: [6, 14], stabDur: 0.55, fly: [4, 6.5], flyH: 4.2, flyAway: 24, landFar: 18, minnow: 'dusk_minnow' });

/** The areas whose minnow weight this phase is in the top third of the lake's ten (watercraft.areaWeight), among margin and reeds. */
export function heronAreas(phase) {
  const w = AREAS.map((a) => [a, areaWeight(HERON.minnow, a, phase)]).sort((x, y) => y[1] - x[1]);
  const cut = w[Math.max(0, Math.ceil(w.length / 3) - 1)][1];
  return w.filter(([a, v]) => (a === 'margin' || a === 'reeds') && v >= cut - 1e-9).map(([a]) => a);
}
/**
 * The spots the heron may stand at this phase: shallow water by the shore and at the reed beds' open-water edge, each in a margin or reed
 * area of the top third for small fish, ≥ 6 m clear of the mooring, the glide-in, the places (and their landmarks), the dock posts.
 * L: world-layout's layout; D: the loop data. → [{x, z, area}] (none at night).
 */
export function heronSpots(L, D, { phase = 'calm', probe = null } = {}) {
  if (lightOf(phase) === 'night') return [];
  const ok = new Set(heronAreas(phase));
  const P = probe || { depth: () => 0.2, fromShore: (x, z) => (typeof L.shoreR === 'function' ? L.shoreR(Math.atan2(z, x)) : 60) - Math.hypot(x, z) };
  const avoid = avoidList(L, D);
  for (const id of typeof D?.loopPlaceIds === 'function' ? D.loopPlaceIds('mossmere') : []) {
    const lm = D.loopPlace(id)?.landmark;
    if (lm && Number.isFinite(lm.x)) avoid.circles.push({ x: lm.x, z: lm.z, r: 2, kind: `landmark:${id}` });
  }
  let hulls = null;
  try { hulls = D.loopMooring?.('mossmere', L.docks)?.circles || null; } catch { hulls = null; }
  const opt = { arena: D?.ZONES?.find?.((z) => z.id === 'mossmere')?.arena, hulls, docks: L.docks };
  const out = [];
  const take = (x, z) => {
    if (clearanceOf(avoid, x, z) < HERON.keep) return;
    const fs = P.fromShore(x, z);
    if (!(fs > 0.6)) return;
    if ((L.islands || []).some((o) => Math.hypot(x - o.x, z - o.z) < o.r + 0.6)) return;
    if ((L.obstacles || []).some((o) => Math.hypot(x - o.x, z - o.z) < o.r + 0.5)) return;
    const a = areaAt(x, z, P, opt);
    if (!ok.has(a)) return;
    if (out.some((s) => Math.hypot(s.x - x, s.z - z) < 4)) return;
    out.push({ x: Math.round(x * 100) / 100, z: Math.round(z * 100) / 100, area: a });
  };
  // the margins by the shore, every few degrees, 1.2–2.6 m out
  for (let deg = 0; deg < 360; deg += 4) {
    const a = (deg * Math.PI) / 180, sr = typeof L.shoreR === 'function' ? L.shoreR(a) : 60;
    for (const off of [1.4, 2.4]) take(Math.cos(a) * (sr - off), Math.sin(a) * (sr - off));
  }
  // the reed beds' clumps (a heron stands at their edge, in the open water beside the stems)
  // (the same plan world-art draws on high and medium: the arena's seed)
  for (const c of reedPlan(L, faceRng(((L.artSeed | 0) ^ 0x5eed5) >>> 0), { avoid: avoidList(L, D) })) take(c.x + 0.8, c.z + 0.4);
  return out;
}

// ------------------------------------------------------------------ the state machine (pure)
/** A fresh heron: standing at the first spot (or gone with none). */
export function createHeronState(spots, rng = Math.random) {
  const s = spots?.length ? spots[Math.floor(rng() * spots.length) % spots.length] : null;
  return { mode: s ? 'stand' : 'gone', x: s?.x ?? 0, z: s?.z ?? 0, y: 0, yaw: rng() * TAU, t: 0, nextStab: HERON.stab[0] + rng() * (HERON.stab[1] - HERON.stab[0]), stabT: 0,
    from: null, to: null, flyDur: 0, lifts: 0, events: [] };
}
const pickSpot = (spots, raft, H, rng) => {
  const far = (spots || []).filter((s) => Math.hypot(s.x - raft.x, s.z - raft.z) >= HERON.landFar && Math.hypot(s.x - H.x, s.z - H.z) > 6);
  const list = far.length ? far : spots || [];
  return list.length ? list[Math.floor(rng() * list.length) % list.length] : null;
};
/**
 * One step: o = {dt, raft: {x, z}, phase, spots (this phase's), rng}. Standing: it stabs now and then; the raft within HERON.lift m lifts
 * it ('lift' event) to another spot ≥ HERON.landFar m from the raft; at night it flies off and is gone ('leave'); with day or dusk back
 * and spots to stand at, it comes in again ('arrive'). Returns H (its `events` list holds this step's events).
 */
export function stepHeron(H, { dt = 0.016, raft = null, phase = 'calm', spots = [], rng = Math.random } = {}) {
  H.events = [];
  H.t += dt;
  const night = lightOf(phase) === 'night';
  const fly = (to, away = false) => {
    H.from = { x: H.x, z: H.z }; H.to = to; H.mode = 'fly'; H.t = 0; H.away = away;
    H.flyDur = HERON.fly[0] + rng() * (HERON.fly[1] - HERON.fly[0]);
    H.yaw = Math.atan2(to.x - H.x, to.z - H.z);
  };
  if (H.mode === 'gone') {
    if (!night && spots.length) { const s = pickSpot(spots, raft || { x: 1e3, z: 1e3 }, H, rng); if (s) { H.x = s.x; H.z = s.z; H.mode = 'stand'; H.t = 0; H.y = 0; H.events.push('arrive'); } }
    return H;
  }
  if (H.mode === 'stand' || H.mode === 'stab') {
    if (night) {   // dark: off over the shore, gone
      const a = Math.atan2(H.z, H.x);
      fly({ x: Math.cos(a) * (Math.hypot(H.x, H.z) + HERON.flyAway), z: Math.sin(a) * (Math.hypot(H.x, H.z) + HERON.flyAway) }, true);
      H.events.push('leave');
      return H;
    }
    if (raft && Math.hypot(raft.x - H.x, raft.z - H.z) < HERON.lift) {
      const s = pickSpot(spots, raft, H, rng);
      if (s) { fly(s); H.lifts++; H.events.push('lift'); return H; }
    }
    if (H.mode === 'stab') { H.stabT += dt; if (H.stabT >= HERON.stabDur) { H.mode = 'stand'; H.stabT = 0; } return H; }
    H.nextStab -= dt;
    if (H.nextStab <= 0) { H.mode = 'stab'; H.stabT = 0; H.nextStab = HERON.stab[0] + rng() * (HERON.stab[1] - HERON.stab[0]); H.events.push('stab'); }
    return H;
  }
  // flying: a low arc from its spot to the next (or away and gone)
  const k = Math.min(1, H.t / Math.max(0.2, H.flyDur));
  const e = k * k * (3 - 2 * k);
  H.x = H.from.x + (H.to.x - H.from.x) * e; H.z = H.from.z + (H.to.z - H.from.z) * e;
  H.y = Math.sin(Math.PI * k) * HERON.flyH * (H.away ? 1.6 : 1);
  if (k >= 1) {
    if (H.away) { H.mode = 'gone'; H.y = 0; H.events.push('gone'); }
    else { H.mode = 'stand'; H.y = 0; H.t = 0; H.events.push('land'); }
  }
  return H;
}

// ------------------------------------------------------------------ the model (one mesh; its poses are geometries)
function heronGeos() {
  const grey = lin(0x8a87a3), dark = lin(0x34324a), pale = lin(0xc9c7d9), beak = lin(0x8e8460), leg = lin(0x5a5468);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const body = (pose) => {
    const parts = [];
    const bodyG = new THREE.SphereGeometry(0.17, 7, 5);
    parts.push(prep(bodyG, { matrix: mat(0, pose === 'fly' ? 0 : 0.62, 0, pose === 'fly' ? 0 : -0.35, 0, 0, [0.85, 0.8, 1.9]), colorFn: (x, y) => (y < (pose === 'fly' ? -0.04 : 0.58) ? pale : grey) }));
    // the neck: an S at rest, straight down and out in a stab, tucked back in flight
    const np = pose === 'stab' ? [V(0, 0.7, 0.22), V(0, 0.6, 0.42), V(0, 0.36, 0.58)] : pose === 'fly' ? [V(0, 0.05, 0.28), V(0, 0.14, 0.3), V(0, 0.12, 0.42)] : [V(0, 0.7, 0.22), V(0, 0.9, 0.18), V(0, 1.0, 0.3)];
    parts.push(prep(taperTube(np, (t) => 0.034 * (1 - t * 0.3), 5, 6), { color: pale }));
    const head = np[2];
    parts.push(prep(new THREE.SphereGeometry(0.045, 6, 4), { matrix: mat(head.x, head.y, head.z, 0, 0, 0, [0.85, 0.85, 1.3]), color: pale }));
    const bk = new THREE.ConeGeometry(0.02, 0.24, 4); bk.rotateX(Math.PI / 2); bk.translate(0, 0, 0.12);
    parts.push(prep(bk, { matrix: mat(head.x, head.y - (pose === 'stab' ? 0.03 : 0.005), head.z + 0.03, pose === 'stab' ? 0.9 : 0.05, 0, 0), color: beak }));
    parts.push(prep(new THREE.BoxGeometry(0.03, 0.012, 0.14), { matrix: mat(head.x, head.y + 0.03, head.z - 0.07, -0.3, 0, 0), color: dark }));   // the crest
    if (pose === 'fly' || pose === 'flyUp') {
      for (const s of [-1, 1]) {
        const w = new THREE.BoxGeometry(0.62, 0.02, 0.26); w.translate(s * 0.33, 0, 0);
        parts.push(prep(w, { matrix: mat(0, 0.03, -0.02, 0, 0, s * (pose === 'flyUp' ? 0.55 : -0.25)), colorFn: (x) => (Math.abs(x) > 0.42 ? dark : grey) }));
      }
      for (const s of [-1, 1]) parts.push(prep(new THREE.CylinderGeometry(0.008, 0.008, 0.5, 4), { matrix: mat(s * 0.03, -0.02, -0.5, Math.PI / 2, 0, 0), color: leg }));
    } else {
      for (const s of [-1, 1]) parts.push(prep(new THREE.CylinderGeometry(0.009, 0.011, 0.58, 4), { matrix: mat(s * 0.035, 0.26, -0.02, 0.05, 0, 0), color: leg }));
      for (const sd of [-1, 1]) parts.push(prep(new THREE.BoxGeometry(0.02, 0.07, 0.34), { matrix: mat(sd * 0.135, 0.63, -0.06, -0.35, 0, 0), color: mixArr(dark, grey, 0.35) }));   // the folded wings' dark edges
    }
    return merge(parts);
  };
  return { stand: body('stand'), stab: body('stab'), fly: body('fly'), flyUp: body('flyUp') };
}

/** main's line: under the loop, the heron on the Mossmere (high and medium; hidden on low). → {mesh, update(dt), state(), dispose()} or null. */
export function attachHeron(ctx) {
  if (ctx?.data?.LOOP_ENABLED !== true) return null;
  const scene = ctx.render?.scene;
  if (!scene || ctx.render.isStub) return null;
  const Z = (ctx.data.ZONES || []).find((z) => z.id === 'mossmere');
  if (!Z) return null;
  const L = buildLayout(Z);   // (once: the spots are found from the same seeded layout the world draws)
  const G = heronGeos();
  const material = toonMaterial({ color: 0xffffff, vertexColors: true, rim: 0.35, rimColor: 0xd4d0f2, steps: 3 });
  const mesh = new THREE.Mesh(G.stand, material);
  mesh.name = 'heron'; mesh.visible = false;
  setupSurface(mesh, { cast: false, reflect: false });
  scene.add(mesh);
  const rng = faceRng(0x4e7a11);
  const S = { H: null, spots: [], key: '' };
  const zoneId = () => { try { return ctx.world?.getZone?.()?.id ?? ctx.state?.run?.zone ?? null; } catch { return null; } };
  const phaseNow = () => { try { return ctx.survival?.getPhaseInfo?.()?.phase || ctx.state?.run?.phase || 'calm'; } catch { return 'calm'; } };
  function update(dt = 0.016) {
    const q = ctx.render?.quality || 'high';
    const on = q !== 'low' && faceOn(ctx.data, zoneId()) && (ctx.flow === 'playing' || ctx.flow === 'home') && !ctx.cinematic;
    if (!on) { mesh.visible = false; return; }
    const phase = phaseNow(), light = lightOf(phase);
    if (light !== S.key) {
      S.key = light;
      let probe = null;
      try { probe = ctx.world && !ctx.world.isStub ? probeOf(ctx.world) : null; } catch { probe = null; }
      S.spots = heronSpots(L, ctx.data, { phase, probe });
      if (!S.H) S.H = createHeronState(S.spots, rng);
    }
    const p = ctx.player?.position;
    stepHeron(S.H, { dt: Math.min(0.1, Math.max(0, num(dt, 0))), raft: p ? { x: p.x, z: p.z } : null, phase, spots: S.spots, rng });
    const H = S.H;
    for (const e of H.events) if (e === 'lift' || e === 'leave') { try { ctx.bus?.emit?.('heron:lift', { x: H.from?.x ?? H.x, z: H.from?.z ?? H.z }); } catch { /* optional */ } }
    mesh.visible = H.mode !== 'gone';
    if (!mesh.visible) return;
    const flap = H.mode === 'fly' && Math.sin(H.t * 9) > 0;
    const want = H.mode === 'fly' ? (flap ? G.flyUp : G.fly) : H.mode === 'stab' ? G.stab : G.stand;
    if (mesh.geometry !== want) mesh.geometry = want;
    let wy = 0;
    try { wy = ctx.water && !ctx.water.isStub ? num(ctx.water.getHeight?.(H.x, H.z), 0) : 0; } catch { wy = 0; }
    mesh.position.set(H.x, (H.mode === 'fly' ? 0.4 : -0.12) + H.y + wy * 0.3, H.z);
    mesh.rotation.y = H.yaw;
  }
  return { mesh, update, state: () => (S.H ? { mode: S.H.mode, x: S.H.x, z: S.H.z, lifts: S.H.lifts, spots: S.spots.length } : null),
    dispose() { scene.remove(mesh); for (const g of Object.values(G)) g.dispose(); material.dispose(); } };
}
