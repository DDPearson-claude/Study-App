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
//   frameCheck(M, cam, o)   the validator's check of a camera's frame at a screen size (the barge, the raft, every target and
//                           every word: ≥ 16 px from each other and from the Wick)
//   wickCorners(M)          the Wick's figure on the raft at home (the words keep off it)
//   raftCorners(M)          the raft's deck at its tie-up (CHART's word sits under it: UNDER_WORD)
//   wordMetrics(text, t)    a word's box (its width, its glyphs' height, its hooks' reach) estimated from its letters (the
//                           validator's; the screen measures its own)

/** The order of the targets: the tiles' focus order (Murk, Chart, Journal), then the wall. */
export const TARGET_ORDER = ['murk', 'chart', 'journal', 'rack', 'wall'];   // (the rod rack: the Wick's sheet at Tackle, SHEET.md §2.3)

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
  // the rod rack on the cabin's aft wall, port of the door: its upper half, where the rod hangs (from deck + 1.0: below it the chart table
  // sits in front of it from the portrait pose; SHEET.md §2.3, measured clear at all eight validator sizes)
  rack: { min: [-1.12, B.deckY + 1.0, B.cabinAft], max: [-0.88, B.deckY + 2.05, B.cabinAft + 0.2] },
  // Murk on his pad (his own frame: he faces +z), the pack to its top
  murk: { min: [-1.3, 0.15, -1.25], max: [1.3, 3.75, 1.45] },
};

// the Wick's figure on the raft at home, round the raft's centre (its cloak, its head and its flame): the words keep 16 px off it
export const WICK_BOX = { min: [-0.42, 0.22, -0.42], max: [0.42, 1.6, 0.42] };
// the words under the targets (ui.css .gw-jetty-tword: the display face, uppercase, tracked; the hooks either side only on desktop)
/** A word's cost (px of nudge) for sitting above its button or to its left: past it, the word leaves its band for its button's side. */
export const SIDE_COST = 80;
/** The words laid under the raft rather than under their own buttons (the user, 17 Nov 2026: "Put the word chart below the raft
 *  not to the right of the raft so it looks less cluttered"): centred under the raft's screen footprint, UNDER_GAP px below its
 *  lowest point (and ≥ 16 px under the Wick); the button stays over the chart table, the word still its tap. */
export const UNDER_WORD = { chart: 'raft' };
export const UNDER_GAP = 8;
/** The Wick's figure keeps this many px off each barge target's bounds (frameCheck), so the raft never covers one. */
export const WICK_CLEAR = 4;
/** The touch stick's resting hint on a phone (ui.css .gw-joy-hint: 96 px round 0.2 W, 0.83 H of the 44vw × 46vh zone). */
export const stickHint = (vw, vh) => ({ l: 0.198 * vw - 48, t: vh * (0.54 + 0.46 * 0.62) - 48, r: 0.198 * vw + 48, b: vh * (0.54 + 0.46 * 0.62) + 48 });
export const HOME_WORDS = { murk: 'Murk', chart: 'Chart', journal: 'Journal' };
export const WORD_TYPE = { desk: { size: 19, track: 0.2, hook: 42, band: 34 }, phone: { size: 17, track: 0.16, hook: 0, band: 30 } };
/** A word's box at a type {size px, track em, hook px}: {w (the letters and their tracking), h (the glyphs), hook (each side)},
 *  estimated a little wide (the display face's capitals: M and W the widest, I and J the narrowest). */
export function wordMetrics(text, { size = 19, track = 0.2, hook = 42 } = {}) {
  let w = 0;
  for (const ch of String(text || '').toUpperCase()) w += (/[MW]/.test(ch) ? 0.95 : /[IJ1]/.test(ch) ? 0.5 : ch === ' ' ? 0.3 : 0.68) + track;
  return { w: w * size, h: Math.round(size * 1.15), hook };
}

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
  for (const id of ['chart', 'journal', 'rack', 'wall']) out[id] = corners(TARGET_BOXES[id]).map((p) => place(p, M.hull, M.hull.yaw));
  // Murk's object turns by his facing + π (the merchant actor's arrive / moor convention: he faces (−sin y, −cos y))
  if (M.murk) out.murk = corners(TARGET_BOXES.murk).map((p) => place(p, M.murk, (Number(M.murk.yaw) || 0) + Math.PI));
  return out;
}
/** The Wick's figure's eight world corners at a mooring (on the raft at its tie-up), or null. */
export function wickCorners(M) {
  if (!M?.raft) return null;
  return corners(WICK_BOX).map(([x, y, z]) => [M.raft.x + x, y, M.raft.z + z]);
}
/** The raft's deck's four corners at its tie-up (the frame check's deck, ±1.3 m at 0.2 m), or null. */
export function raftCorners(M) {
  if (!M?.raft) return null;
  return [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]].map(([dx, dz]) => [M.raft.x + dx, 0.2, M.raft.z + dz]);
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
/** The clear distance between two rects (the larger of the horizontal and the vertical gap; negative when they overlap). */
export const apart = (a, b) => Math.max(a.l - b.r, b.l - a.r, a.t - b.b, b.t - a.b);

/**
 * The buttons' rects. rects: {id: {l, t, r, b} | null} (the objects' projected bounds). o: {vw, vh, min (44), word (the word's
 * height under the box, px; 0 for a target with none), words: {id: bool}, max: [w, h] share of the view a box may take, margin
 * (px inside the view), reserve: [{l, t, r, b}] (the purse, the pause glyph, the goal line)}. Each box is grown round its centre
 * to `min`, shrunk to `max`, its word put under it, kept inside the view and off the reserved rects, then pushed apart from the
 * others (never under `min`).
 * Then the words (the owner's play-test, twice: words touching on a near-square phone): wordSize {id: {w, h, hook}} each word's
 * own box (its width, its glyphs' height, its hooks' reach each side: measured on screen, wordMetrics's estimate without it), its
 * glyphs at the foot of its button; every word ≥ `gap` px from every other word and from each rect of `avoid` (the Wick), clear of
 * the other buttons by `boxGap`, of the reserved rects and of the view's edge. A word's hooks are hidden when the hooked word would
 * come within those distances of anything; a word that would still touch is nudged the shortest way clear (along its band first,
 * then a little down or up), left to right. under: {id: {l, t, r, b}} a word laid under that rect instead (UNDER_WORD: CHART under
 * the raft), centred under it UNDER_GAP px below its foot and ≥ gap under each `avoid` rect, nudged the shortest way when that spot
 * is taken, its centre always below the rect's foot, and off each rect of underOff (the touch stick's ring on a phone held upright);
 * placed before the other words, which keep clear of it.
 * → {items: [{id, l, t, w, h, box: {l, t, r, b} (the object's part), word: bool, wordBox: {l, t, r, b} | null (the glyphs, the
 *   hooks' reach included when shown), hooks: bool, dx, dy (the word's nudge, px)}], ok, faults: []}
 */
export function layoutTargets(rects, { vw = 960, vh = 540, min = 44, word = 26, words = {}, max = [0.42, 0.42], margin = 8, reserve = [],
  wordSize = null, type = vw < 700 || vh < 500 ? WORD_TYPE.phone : WORD_TYPE.desk, avoid = [], gap = 16, boxGap = 8, under = {}, underOff = [] } = {}) {
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
  // the words: those laid under a rect first (the raft's CHART), then left to right by their buttons' centres
  const boxOf = (it) => ({ l: it.l, t: it.t, r: it.l + it.w, b: it.t + it.bh });
  const placed = [];
  const inView = (r) => r.l >= margin - 0.5 && r.r <= vw - margin + 0.5 && r.t >= margin - 0.5 && r.b <= vh - margin + 0.5;
  for (const it of [...items].sort((p, q) => (under?.[q.id] ? 1 : 0) - (under?.[p.id] ? 1 : 0) || (p.l + p.w / 2) - (q.l + q.w / 2))) {
    it.wb = null; it.hooks = false; it.dx = 0; it.dy = 0;
    if (!(it.wd > 0)) continue;
    const m = wordSize?.[it.id] || wordMetrics(HOME_WORDS[it.id] || it.id, type);
    const ww = Math.max(1, Number(m.w) || 1), wh = Math.max(1, Number(m.h) || 1), hk = Math.max(0, Number(m.hook) || 0);
    const cx = it.l + it.w / 2, b = it.t + it.h;
    const others = items.filter((o) => o !== it).map(boxOf);
    const clear = (r) => inView(r) && placed.every((z) => apart(r, z) >= gap - 0.01) && avoid.every((z) => !z || apart(r, z) >= gap - 0.01)
      && others.every((z) => apart(r, z) >= boxGap - 0.01) && reserve.every((z) => !overlap(r, z));
    const at = (dx, dy, h) => ({ l: cx - ww / 2 - h + dx, r: cx + ww / 2 + h + dx, t: b - wh + dy, b: b + dy });
    let best = null;
    const U = under?.[it.id];
    if (U) {
      // centred under the rect, UNDER_GAP below its foot and gap under the Wick, kept in the view (its centre still below the foot)
      const top = Math.min(Math.max(U.b + UNDER_GAP, ...avoid.filter(Boolean).map((z) => z.b + gap)), vh - margin - wh);
      const dx0 = (U.l + U.r) / 2 - cx, dy0 = top - (b - wh), lowest = U.b + 1 - wh / 2 - (b - wh);
      const clearU = (r) => clear(r) && underOff.every((z) => !z || !overlap(r, z));
      if (hk > 0 && clearU(at(dx0, dy0, hk))) best = { dx: dx0, dy: dy0, hooks: true };
      else {
        let cost = Infinity;
        for (let d = 0; d <= 48; d += 2) for (const dd of d ? [d, -d] : [0]) {
          const dy = dy0 + dd;
          if (dy < lowest || d * 1.5 >= cost) continue;
          for (let s = 0; s <= 80 && d * 1.5 + s < cost; s += 2) {
            const hit = (s ? [s, -s] : [0]).find((x) => clearU(at(dx0 + x, dy, 0)));
            if (hit !== undefined) { cost = d * 1.5 + s; best = { dx: dx0 + hit, dy, hooks: false }; break; }
          }
        }
      }
    }
    if (best) { /* under its rect */ }
    else if (hk > 0 && clear(at(0, 0, hk))) best = { dx: 0, dy: 0, hooks: true };
    else if (clear(at(0, 0, 0))) best = { dx: 0, dy: 0, hooks: false };
    else {
      // the shortest nudge clear: along the band (2 px steps), then a little below the band or above it
      let cost = Infinity;
      for (const dy of [0, 6, -6, 12, -12, 18, 24, -18, 30, 36, 42, 48]) {
        const cy = Math.abs(dy) * 2.5;
        if (cy >= cost) continue;
        for (let s = 0; s <= vw; s += 2) {
          if (cy + s >= cost) break;
          for (const dx of s ? [s, -s] : [0]) if (clear(at(dx, dy, 0))) { cost = cy + s; best = { dx, dy, hooks: false }; break; }
        }
      }
      // (beside its own button rather than far under it: above the box, or to its left, level with it, when the band's nudge would
      // carry the word more than SIDE_COST away; at 358 × 664 MURK sat 48 px under its box, under JOURNAL, away from Murk: the
      // user's yes, 17 Nov 2026)
      const above = -(it.h + 4), left = it.l - 6 - (cx + ww / 2), level = (it.t + it.bh / 2 + wh / 2) - b;
      for (const [dx0, dy, c0] of [[0, above, SIDE_COST], [left, level, SIDE_COST + 6]]) {
        for (let s = 0; s <= 40; s += 2) {
          if (c0 + s >= cost) break;
          const hit = (s ? [s, -s] : [0]).find((d) => clear(at(dx0 + d, dy, 0)));
          if (hit !== undefined) { cost = c0 + s; best = { dx: dx0 + hit, dy, hooks: false }; break; }
        }
      }
    }
    if (best) Object.assign(it, best);
    it.wb = at(it.dx, it.dy, it.hooks ? hk : 0);
    placed.push(it.wb);
  }
  const faults = [];
  for (let i = 0; i < items.length; i++) {
    const a = R(items[i]);
    if (items[i].w < min - 0.01 || items[i].bh < min - 0.01) faults.push(`${items[i].id} under ${min} px`);
    if (a.l < -0.5 || a.t < -0.5 || a.r > vw + 0.5 || a.b > vh + 0.5) faults.push(`${items[i].id} outside the view`);
    for (const z of reserve) if (overlap(a, z)) faults.push(`${items[i].id} over a reserved rect`);
    for (let j = i + 1; j < items.length; j++) if (overlap(a, R(items[j]))) faults.push(`${items[i].id} overlaps ${items[j].id}`);
  }
  // the words' own check (the glyphs, and the hooks while shown)
  for (let i = 0; i < items.length; i++) {
    const w = items[i].wb, id = items[i].id;
    if (!w) continue;
    if (!inView(w)) faults.push(`${id}'s word outside the view`);
    for (const z of reserve) if (overlap(w, z)) faults.push(`${id}'s word over a reserved rect`);
    for (const z of avoid) if (z && apart(w, z) < gap - 0.5) faults.push(`${id}'s word within ${gap} px of the Wick (${apart(w, z).toFixed(0)} px)`);
    for (let j = 0; j < items.length; j++) {
      if (j === i) continue;
      if (apart(w, boxOf(items[j])) < boxGap - 0.5) faults.push(`${id}'s word on ${items[j].id}'s button`);
      if (j > i && items[j].wb && apart(w, items[j].wb) < gap - 0.5) faults.push(`${id}'s and ${items[j].id}'s words within ${gap} px (${apart(w, items[j].wb).toFixed(0)} px)`);
    }
  }
  return {
    items: items.map((it) => ({ id: it.id, l: it.l, t: it.t, w: it.w, h: it.h, box: boxOf(it), word: it.wd > 0, wordBox: it.wb, hooks: it.hooks, dx: it.dx, dy: it.dy })),
    ok: faults.length === 0, faults,
  };
}

/**
 * The validator's frame check (M1 §4 step 5a): through `cam` at vw × vh, every point of the barge and the raft inside the frame
 * (`margin` px), every target's projected bounds in front of the lens and inside it, their raw bounds not overlapping, and the
 * laid-out buttons at least `min` px with none overlapping, and their words (wordMetrics's boxes at the screen's type, or
 * `wordSize`) ≥ 16 px from each other and from the Wick, off the other buttons and inside the view. which: the targets to check (the wall only once wing I is owned:
 * the check takes all four). → {ok, faults: [], rects, layout}
 */
export function frameCheck(M, cam, { vw, vh, min = 44, word = null, margin = 16, which = TARGET_ORDER, reserve = [], wordSize = null } = {}) {
  // (and CHART's word under the raft: UNDER_WORD)
  // (the screen's own type and word band: ui-loop's placeTargets, a phone under 700 px wide or 500 px tall)
  const phone = vw < 700 || vh < 500, type = phone ? WORD_TYPE.phone : WORD_TYPE.desk;
  const faults = [];
  const proj = (p) => project(p, cam, vw, vh);
  for (const p of bargePoints(M)) {
    const q = proj(p);
    if (!(q.depth > 0) || q.x < margin || q.x > vw - margin || q.y < margin || q.y > vh - margin) { faults.push(`the barge's point ${p.map((v) => v.toFixed(1)).join(',')} is out of frame (${Number.isFinite(q.x) ? `${q.x.toFixed(0)}, ${q.y.toFixed(0)}` : 'behind'})`); break; }
  }
  // the raft's deck whole in the frame too (the player at home), a few px in from the edge
  if (M.raft) for (const [dx, dz] of [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]]) {
    const q = proj([M.raft.x + dx, 0.2, M.raft.z + dz]);
    if (!(q.depth > 0) || q.x < 4 || q.x > vw - 4 || q.y < 4 || q.y > vh - 4) { faults.push('the raft\'s deck leaves the frame'); break; }
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
  const wick = rectOf(wickCorners(M), proj);
  // the Wick on the raft never stands over a barge target (the polish audit: on a near-square phone the Wick hid the chart table)
  if (wick) for (const id of ids) if (id !== 'murk' && apart(rects[id], wick) < WICK_CLEAR) faults.push(`the Wick covers ${id} (${apart(rects[id], wick).toFixed(0)} px)`);
  const raft = rectOf(raftCorners(M), proj), under = {};
  for (const [id, of] of Object.entries(UNDER_WORD)) if (of === 'raft' && raft) under[id] = raft;
  const layout = layoutTargets(rects, { vw, vh, min, word: word ?? type.band, words: { wall: false, rack: false }, reserve, margin: phone ? 6 : 10, type, wordSize, avoid: wick ? [wick] : [], under, underOff: phone && vw < vh ? [stickHint(vw, vh)] : [] });
  for (const f of layout.faults) faults.push(`the buttons: ${f}`);
  // CHART's word under the raft (the user's 17 Nov 2026): its centre below the raft's lowest projected point, inside its width,
  // and on a phone off the touch stick's resting ring
  for (const id of Object.keys(UNDER_WORD)) {
    const w = layout.items.find((it) => it.id === id)?.wordBox, U = under[id];
    if (!w || !U) continue;
    const cx = (w.l + w.r) / 2, cy = (w.t + w.b) / 2;
    if (!(cy > U.b) || cx < U.l || cx > U.r) faults.push(`${id}'s word is not under the raft (its centre ${cx.toFixed(0)}, ${cy.toFixed(0)}; the raft ${U.l.toFixed(0)}–${U.r.toFixed(0)}, foot ${U.b.toFixed(0)})`);
    if (phone && vw < vh && overlap(w, stickHint(vw, vh))) faults.push(`${id}'s word on the touch stick's ring`);
  }
  return { ok: faults.length === 0, faults, rects, layout };
}
