// chart-gild.js — M1 step 5b (lane 5b-home; docs/loop/M1.md §2.5): a water complete (its shelf bare, its list full, its giants and
// legend landed) has its sheet on the Chart gilded: its outline and its name re-inked in gold, 1.2 s, on the next open (once: the
// waters gilded are kept in meta.loop.gilt). Kept apart from chart-draw.js and ui-chart.js (their byte budget, ui-chart.test.mjs).
//   gildCard(ctx, card, model, a, view)   draws the gold over a gilded sheet; → its name's colour (null: not gilded)
//   gildStep(metaLoop, model, t, st, reduced)   the open's re-inking: → {k, more}; marks the water gilt once it has inked

/** A complete water's sheet (model.sheets[].gilded): its shore re-inked in gold and a gold neatline (a: the sheet's alpha times the
 *  1.2 s re-inking). → the name's gold colour, or null when the sheet is not gilded (chart-draw calls it as view.gild). */
export function gildCard(ctx, card, model, a = 1, view = {}) {
  if ((model?.sheets || []).find((q) => q.waterId === card.waterId)?.gilded !== true) return null;
  const k = Math.min(1, Math.max(0, a));
  if (!(k > 0)) return GOLD_NAME;
  const geo = view.water?.[card.waterId] || null, lake = card.lake;
  ctx.save(); ctx.globalAlpha = Math.min(1, k * 1.1); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(214,170,84,.95)'; ctx.lineWidth = 1.6;
  ctx.strokeRect(card.x + 5.5, card.y + 5.5, card.w - 11, card.h - 11);
  const shore = geo?.shore || [];
  if (lake && shore.length > 2) {
    const n = Math.max(3, Math.round(shore.length * Math.min(1, k)));
    ctx.beginPath();
    for (let i = 0; i < n; i++) { const p = shore[i % shore.length], x = lake.cx + p[0] * lake.s, y = lake.cy + p[1] * lake.s; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    if (k >= 1) ctx.closePath();
    ctx.shadowColor = 'rgba(240,190,90,.6)'; ctx.shadowBlur = 4; ctx.lineWidth = 2.2; ctx.strokeStyle = 'rgba(222,178,86,.95)'; ctx.stroke();
  }
  ctx.restore();
  return GOLD_NAME;
}
const GOLD_NAME = 'rgb(206,158,62)';
/** The gilding's 1.2 s on the open after a water is complete (reduced motion: at once). → {k (0..1), more (another frame wanted)}. */
export function gildStep(metaLoop, model, t, st, reduced = false, dur = 1200) {
  const gw = (model?.sheets || []).find((q) => q.gilded === true)?.waterId;
  if (!gw || !metaLoop || (Array.isArray(metaLoop.gilt) && metaLoop.gilt.includes(gw))) return { k: 1, more: false };
  const done = () => { metaLoop.gilt = [...(Array.isArray(metaLoop.gilt) ? metaLoop.gilt : []), gw]; };
  if (reduced) { done(); return { k: 1, more: false }; }
  if (st.gild0 == null) st.gild0 = t;
  const k = Math.min(1, (t - st.gild0) / dur);
  if (k >= 1) done();
  return { k, more: k < 1 };
}

// ---------------------------------------------------------------- LOST-TACKLE §5.2 (lanes W and C): the brook behind the Veil
// A water's sheet draws its shore notch's water once the notch's place is owned (a lost notebook has shown it): the shore opens at the
// Veil, a thin double line runs from it into the hill (off the sheet's edge where the sheet ends first), the reeds hatched along it, a
// few strokes of falling water across its mouth. Its name and its mark are the place's own (the places' layout). Inked in over 1.2 s the
// first time the Chart opens after (meta.loop.places.inked keeps it once; reduced motion: drawn at once).
const BROOK_INK = 1200;
/** The brook's ink on this open: → {k (0..1), more}. Marks it inked once its 1.2 s are over. */
export function brookStep(metaLoop, model, t, st, reduced = false, dur = BROOK_INK) {
  const id = brookOwned(model, metaLoop);
  if (!id || !metaLoop || typeof metaLoop !== 'object') return { k: 1, more: false };
  const P = metaLoop.places && typeof metaLoop.places === 'object' ? metaLoop.places : (metaLoop.places = { revealed: [] });
  const inked = Array.isArray(P.inked) ? P.inked : [];
  if (inked.includes(id)) return { k: 1, more: false };
  const done = () => { P.inked = [...inked, id]; };
  if (reduced) { done(); return { k: 1, more: false }; }
  if (st.brook0 == null) st.brook0 = t;
  const k = Math.min(1, (t - st.brook0) / dur);
  if (k >= 1) done();
  return { k, more: k < 1 };
}
/** An owned place on the Chart that a notebook has shown (meta.loop.places.revealed), or null. */
function brookOwned(model, metaLoop) {
  const rv = Array.isArray(metaLoop?.places?.revealed) ? metaLoop.places.revealed : [];
  for (const s of model?.sheets || []) for (const p of s.places || []) if (p?.owned === true && rv.includes(p.id)) return p.id;
  return null;
}
/** Draws a sheet's brook (view.water[waterId].notch, its place owned on the model) at ink k. */
export function brookCard(ctx, card, model, k = 1, view = {}) {
  const geo = view.water?.[card.waterId], N = geo?.notch, lake = card.lake;
  const sheet = (model?.sheets || []).find((q) => q.waterId === card.waterId);
  if (!N || !lake || !(k > 0) || !(sheet?.places || []).some((p) => p.id === N.place && p.owned === true)) return false;
  const S = lake.s, at = (al, lc) => { const t = Math.max(0, Math.min(1, (al - N.r0) / Math.max(1, N.end - N.r0))), lat = lc + 0.7 * Math.sin(Math.PI * t) * (t > 0 ? 1 : 0); return [lake.cx + (al * N.ca - lat * N.sa) * S, lake.cy + (al * N.sa + lat * N.ca) * S]; };
  const half = (al) => { const t = Math.max(0, Math.min(1, (al - N.r0) / Math.max(1, N.end - N.r0))); let h = N.hw; if (N.pool) h += (N.pool.hw - N.hw) * Math.min(1, Math.max(0, (t - N.pool.t0 + 0.1) / 0.16)) * (1 - Math.min(1, Math.max(0, (t - N.pool.t1 + 0.06) / 0.16))); return h + (N.endHw - h) * Math.max(0, (t - 0.84) / 0.16); };
  const a0 = N.r0 - 2.5, a1 = a0 + (N.end - a0) * Math.min(1, k * 1.15), n = 24;
  const side = (sg) => { const pts = []; for (let i = 0; i <= n; i++) { const al = a0 + ((a1 - a0) * i) / n; pts.push(at(al, sg * Math.max(1.6, half(al) * 0.62 + 0.9))); } return pts; };
  const L = side(-1), R = side(1), sc = Math.max(0.7, Math.min(1.4, S * 3));
  ctx.save(); ctx.globalAlpha = Math.min(1, k * 1.4); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // the water: the lake's own wash down the cut (it opens the shore's pen at the mouth)
  ctx.beginPath(); L.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]); ctx.closePath();
  ctx.fillStyle = 'rgb(124,120,196)'; ctx.fill();
  // the banks: the pen's double line, from the shore into the hill, and its head closed where it ends on the sheet
  ctx.strokeStyle = 'rgba(40,24,30,.88)'; ctx.lineWidth = 1.05 * sc;
  for (const B of [L, R]) { ctx.beginPath(); B.slice(2).forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); }
  if (k >= 1) { ctx.beginPath(); ctx.moveTo(L[n][0], L[n][1]); const m = at(N.end + 0.8, 0); ctx.quadraticCurveTo(m[0], m[1], R[n][0], R[n][1]); ctx.stroke(); }
  // the reeds: short pen ticks leaning off each bank, in broken clusters
  ctx.strokeStyle = 'rgba(40,24,30,.5)'; ctx.lineWidth = 0.6 * sc;
  ctx.beginPath();
  for (const [B, sg] of [[L, -1], [R, 1]]) for (let i = 4; i < B.length - 1; i++) {
    if ((i * 7 + (sg > 0 ? 3 : 0)) % 5 > 2) continue;
    const [x, y] = B[i], [x2, y2] = B[i + 1], dx = x2 - x, dy = y2 - y, l = Math.hypot(dx, dy) || 1, nx = -dy / l * sg, ny = dx / l * sg;
    for (const q of [0, 0.45]) { const bx = x + dx * q, by = y + dy * q, len = (2.6 + ((i * 13) % 4)) * sc; ctx.moveTo(bx + nx * 1.2, by + ny * 1.2); ctx.lineTo(bx + nx * (1.2 + len) + dx / l * 0.8, by + ny * (1.2 + len) + dy / l * 0.8); }
  }
  ctx.stroke();
  // the Veil: a few pale strokes of falling water across the mouth
  ctx.strokeStyle = 'rgba(236,232,252,.85)'; ctx.lineWidth = 0.7 * sc; ctx.beginPath();
  for (let i = -2; i <= 2; i++) { const p = at(N.r0 + 1.2, i * 1.2), q = at(N.r0 + 0.2, i * 1.2 + 0.3); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }
  ctx.stroke();
  ctx.restore();
  return true;
}
