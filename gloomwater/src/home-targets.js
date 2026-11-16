// home-targets.js — the home barge's tap targets (M1 §4 step 5a; SPEC §6.1): pure, no imports, so the actor, the screens and the
// validator share one set of numbers.
//
// At home the Jetty's three tiles become the barge's own places, each a DOM button over its object's projected bounds with its
// tile's word under it: Murk (his barge alongside: the shelf), Chart (the chart table under the awning), Journal (the lectern by
// the cabin door); from wing I of the Long Wall, the cabin's lit doorway (no word). This module holds
//   TARGET_BOXES            each target's box in its owner's local frame (the barge's: the bow at −z; Murk's: his own)
//   targetCorners(M)        → {murk, chart, journal, wall}: each box's eight world corners at a mooring (data.loopMooring)
//   project(p, cam, vw, vh) a point through a camera pose {pos, look, fov} (the home camera's own: render blends to it)
//   rectOf(corners, …)      the screen rect of a box's corners (null when any is behind the lens)
//   layoutTargets(rects, o) the buttons' rects: at least `min` px each way, the word under each, inside the view and clear of the
//                           reserved rects, and never overlapping (each pushed apart, never under `min`)
//   frameCheck(M, cam, o)   the validator's check of a camera's frame at a screen size (the barge, the raft and every target)

/** The order of the targets: the tiles' focus order (Murk, Chart, Journal), then the wall. */
export const TARGET_ORDER = ['murk', 'chart', 'journal', 'wall'];

// the barge's local frame (actors-home.js builds the objects at these places): deck 0.42 m over the water, the cabin's aft wall at
// z 2.25, the chart table under the awning, the lectern beside the door, the doorway itself
export const BARGE_LOCAL = {
  deckY: 0.42, cabinAft: 2.25,
  chart: { x: -1.0, z: 4.6, w: 0.95, d: 0.7, h: 0.8 },
  lectern: { x: 1.25, z: 3.0 },
  door: { x: -0.3, w: 0.8, h: 1.48 },
};
const B = BARGE_LOCAL;
export const TARGET_BOXES = {
  chart: { min: [B.chart.x - B.chart.w / 2 - 0.05, B.deckY, B.chart.z - B.chart.d / 2 - 0.05], max: [B.chart.x + B.chart.w / 2 + 0.05, B.deckY + B.chart.h + 0.15, B.chart.z + B.chart.d / 2 + 0.05] },
  journal: { min: [B.lectern.x - 0.3, B.deckY, B.lectern.z - 0.25], max: [B.lectern.x + 0.3, B.deckY + 1.3, B.lectern.z + 0.25] },
  wall: { min: [B.door.x - B.door.w / 2 - 0.04, B.deckY, B.cabinAft - 0.05], max: [B.door.x + B.door.w / 2 + 0.04, B.deckY + B.door.h + 0.08, B.cabinAft + 0.1] },
  // Murk on his pad (his own frame: he faces +z), the pack to its top
  murk: { min: [-1.3, 0.15, -1.25], max: [1.3, 3.75, 1.45] },
};

const corners = (b) => {
  const out = [];
  for (const x of [b.min[0], b.max[0]]) for (const y of [b.min[1], b.max[1]]) for (const z of [b.min[2], b.max[2]]) out.push([x, y, z]);
  return out;
};
/** A local point through an object's rotation.y (rot) and position (x, z): three.js's own convention. */
function place([x, y, z], { x: ox = 0, z: oz = 0 }, rot) {
  const c = Math.cos(rot), s = Math.sin(rot);
  return [ox + x * c + z * s, y, oz - x * s + z * c];
}
/** Each target's eight world corners at a mooring M ({hull: {x, z, yaw}, murk: {x, z, yaw}}). */
export function targetCorners(M) {
  if (!M?.hull) return null;
  const out = {};
  for (const id of ['chart', 'journal', 'wall']) out[id] = corners(TARGET_BOXES[id]).map((p) => place(p, M.hull, M.hull.yaw));
  // Murk's object turns by his facing + π (the merchant actor's arrive / moor convention: he faces (−sin y, −cos y))
  if (M.murk) out.murk = corners(TARGET_BOXES.murk).map((p) => place(p, M.murk, (Number(M.murk.yaw) || 0) + Math.PI));
  return out;
}
/** The barge's own extremes and the raft at its stern (the frame must hold all of them). */
export function bargePoints(M, { length = 12, beam = 3.6, top = 3.5 } = {}) {
  if (!M?.hull) return [];
  const pts = [];
  for (const z of [-length / 2, 0, length / 2]) for (const x of [-beam / 2, beam / 2]) for (const y of [0, z === 0 ? top : 1.2]) pts.push(place([x, y, z], M.hull, M.hull.yaw));
  // the raft tied at the stern: its deck and the Wick's flame over it (the player is always in the frame at home)
  if (M.raft) pts.push([M.raft.x, 0.2, M.raft.z], [M.raft.x, 2.6, M.raft.z]);
  return pts;
}

/** A world point through a camera pose {pos, look, fov (vertical, degrees)} at vw × vh px → {x, y, depth}; depth ≤ 0 is behind. */
export function project(p, cam, vw, vh) {
  const [px, py, pz] = cam.pos, [lx, ly, lz] = cam.look;
  let fx = lx - px, fy = ly - py, fz = lz - pz;
  const fl = Math.hypot(fx, fy, fz) || 1; fx /= fl; fy /= fl; fz /= fl;
  // right = f × up(0, 1, 0); up' = right × f
  let rx = -fz, rz = fx; const rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl;
  const ux = -rz * fy, uy = rz * fx - rx * fz, uz = rx * fy;
  const dx = p[0] - px, dy = p[1] - py, dz = p[2] - pz;
  const depth = dx * fx + dy * fy + dz * fz;
  const xc = dx * rx + dz * rz, yc = dx * ux + dy * uy + dz * uz;
  const t = Math.tan(((Number(cam.fov) || 45) * Math.PI) / 360), aspect = vw / vh;
  if (depth <= 1e-6) return { x: NaN, y: NaN, depth };
  return { x: (xc / (depth * t * aspect) * 0.5 + 0.5) * vw, y: (-yc / (depth * t) * 0.5 + 0.5) * vh, depth };
}
/** The screen rect {l, t, r, b} of a box's corners through `proj(p) → {x, y, depth}`; null when a corner is behind the lens. */
export function rectOf(pts, proj) {
  let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
  for (const p of pts || []) {
    const q = proj(p);
    if (!(q && q.depth > 0) || !Number.isFinite(q.x) || !Number.isFinite(q.y)) return null;
    l = Math.min(l, q.x); r = Math.max(r, q.x); t = Math.min(t, q.y); b = Math.max(b, q.y);
  }
  return Number.isFinite(l) ? { l, t, r, b } : null;
}
const overlap = (a, b) => Math.min(a.r, b.r) - Math.max(a.l, b.l) > 0.5 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 0.5;

/**
 * The buttons' rects. rects: {id: {l, t, r, b} | null} (the objects' projected bounds). o: {vw, vh, min (44), word (the word's
 * height under the box, px; 0 for a target with none), words: {id: bool}, max: [w, h] share of the view a box may take, margin
 * (px inside the view), reserve: [{l, t, r, b}] (the purse, the pause glyph, the goal line)}. Each box is grown round its centre
 * to `min`, shrunk to `max`, its word put under it, kept inside the view and off the reserved rects, then pushed apart from the
 * others (never under `min`). → {items: [{id, l, t, w, h, box: {l, t, r, b} (the object's part), word: bool}], ok, faults: []}
 */
export function layoutTargets(rects, { vw = 960, vh = 540, min = 44, word = 26, words = {}, max = [0.42, 0.42], margin = 8, reserve = [] } = {}) {
  const items = [];
  for (const id of TARGET_ORDER) {
    const r = rects?.[id];
    if (!r) continue;
    const cx = (r.l + r.r) / 2, cy = (r.t + r.b) / 2;
    const w = Math.min(Math.max(min, r.r - r.l), Math.max(min, vw * max[0])), h = Math.min(Math.max(min, r.b - r.t), Math.max(min, vh * max[1]));
    const wd = words[id] === false ? 0 : word;
    items.push({ id, l: cx - w / 2, t: cy - h / 2, w, h: h + wd, bh: h, wd });
  }
  const R = (it) => ({ l: it.l, t: it.t, r: it.l + it.w, b: it.t + it.h });
  const keepIn = (it) => {
    it.l = Math.min(Math.max(margin, it.l), vw - margin - it.w);
    it.t = Math.min(Math.max(margin, it.t), vh - margin - it.h);
  };
  const pushOut = (it, z) => {
    // off a reserved rect, along the shorter way out
    const a = R(it), ox = Math.min(a.r, z.r) - Math.max(a.l, z.l), oy = Math.min(a.b, z.b) - Math.max(a.t, z.t);
    if (!(ox > 0 && oy > 0)) return;
    if (ox < oy) it.l += (a.l + a.r) / 2 < (z.l + z.r) / 2 ? -ox : ox; else it.t += (a.t + a.b) / 2 < (z.t + z.b) / 2 ? -oy : oy;
  };
  for (let iter = 0; iter < 40; iter++) {
    let moved = false;
    for (const it of items) { keepIn(it); for (const z of reserve) pushOut(it, z); keepIn(it); }
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j], A = R(a), Bq = R(b);
      if (!overlap(A, Bq)) continue;
      moved = true;
      const ox = Math.min(A.r, Bq.r) - Math.max(A.l, Bq.l), oy = Math.min(A.b, Bq.b) - Math.max(A.t, Bq.t);
      // shrink the larger first (never under min), then push apart along the shorter way
      for (const it of [a, b].sort((p, q) => q.w * q.h - p.w * p.h)) {
        if (ox < oy && it.w > min) { const k = Math.min(it.w - min, ox / 2 + 1); it.w -= k; it.l += (it === a ? (A.l < Bq.l ? 0 : k) : (Bq.l < A.l ? 0 : k)); }
        else if (it.bh > min) { const k = Math.min(it.bh - min, oy / 2 + 1); it.bh -= k; it.h -= k; it.t += k / 2; }
      }
      const A2 = R(a), B2 = R(b);
      if (!overlap(A2, B2)) continue;
      const ox2 = Math.min(A2.r, B2.r) - Math.max(A2.l, B2.l), oy2 = Math.min(A2.b, B2.b) - Math.max(A2.t, B2.t);
      if (ox2 < oy2) { const s = A2.l < B2.l ? -1 : 1; a.l += s * (ox2 / 2 + 1); b.l -= s * (ox2 / 2 + 1); }
      else { const s = A2.t < B2.t ? -1 : 1; a.t += s * (oy2 / 2 + 1); b.t -= s * (oy2 / 2 + 1); }
    }
    if (!moved) break;
  }
  const faults = [];
  for (let i = 0; i < items.length; i++) {
    const a = R(items[i]);
    if (items[i].w < min - 0.01 || items[i].bh < min - 0.01) faults.push(`${items[i].id} under ${min} px`);
    if (a.l < -0.5 || a.t < -0.5 || a.r > vw + 0.5 || a.b > vh + 0.5) faults.push(`${items[i].id} outside the view`);
    for (const z of reserve) if (overlap(a, z)) faults.push(`${items[i].id} over a reserved rect`);
    for (let j = i + 1; j < items.length; j++) if (overlap(a, R(items[j]))) faults.push(`${items[i].id} overlaps ${items[j].id}`);
  }
  return {
    items: items.map((it) => ({ id: it.id, l: it.l, t: it.t, w: it.w, h: it.h, box: { l: it.l, t: it.t, r: it.l + it.w, b: it.t + it.bh }, word: it.wd > 0 })),
    ok: faults.length === 0, faults,
  };
}

/**
 * The validator's frame check (M1 §4 step 5a): through `cam` at vw × vh, every point of the barge and the raft inside the frame
 * (`margin` px), every target's projected bounds in front of the lens and inside it, their raw bounds not overlapping, and the
 * laid-out buttons at least `min` px with none overlapping. which: the targets to check (the wall only once wing I is owned:
 * the check takes all four). → {ok, faults: [], rects, layout}
 */
export function frameCheck(M, cam, { vw, vh, min = 44, word = 26, margin = 16, which = TARGET_ORDER, reserve = [] } = {}) {
  const faults = [];
  const proj = (p) => project(p, cam, vw, vh);
  for (const p of bargePoints(M)) {
    const q = proj(p);
    if (!(q.depth > 0) || q.x < margin || q.x > vw - margin || q.y < margin || q.y > vh - margin) { faults.push(`the barge's point ${p.map((v) => v.toFixed(1)).join(',')} is out of frame (${Number.isFinite(q.x) ? `${q.x.toFixed(0)}, ${q.y.toFixed(0)}` : 'behind'})`); break; }
  }
  const C = targetCorners(M) || {}, rects = {};
  for (const id of which) {
    const r = C[id] ? rectOf(C[id], proj) : null;
    if (!r) { faults.push(`${id}: not in front of the lens`); continue; }
    if (r.l < 0 || r.t < 0 || r.r > vw || r.b > vh) faults.push(`${id}: its bounds leave the frame`);
    rects[id] = r;
  }
  const ids = Object.keys(rects);
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) if (overlap(rects[ids[i]], rects[ids[j]])) faults.push(`${ids[i]} and ${ids[j]} overlap on screen`);
  const layout = layoutTargets(rects, { vw, vh, min, word, words: { wall: false }, reserve });
  for (const f of layout.faults) faults.push(`the buttons: ${f}`);
  return { ok: faults.length === 0, faults, rects, layout };
}
