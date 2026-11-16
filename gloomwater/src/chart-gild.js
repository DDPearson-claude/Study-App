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
