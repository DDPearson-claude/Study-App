// chart-draw.js — the Chart's live layer, one code for the published world map and the game's Chart (docs/loop/M1.md §3.1, §3.8;
// SPEC §5.4; WORLD.md §10). A pure 2D-canvas module with no game imports: every piece takes its context, its state and its fonts
// as arguments. tools/world-map/build.mjs bundles it into the published page (page/app.js calls it as the global ChartDraw); the
// game imports it as a module (src/ui-chart.js). So the published map and the in-game Chart can never drift.
//
//   the page's and the game's pieces: chartView · prepPieces · pointOnPiece · road · chevron · returnMark · wisp · layoutMarks ·
//     lantern · hearth · vignette · LEAF · spacedWidth · inkText · handFont · chartText · sheetEdge · stone · compass · frame ·
//     pilgrim · raft
//   the game's Chart: kindGlyph · bookGlyph · clamGlyph · seal · blot · placeVignette · rolledSheet · layoutChart · drawChart
//
// Lamps are small lanterns with a flame-shaped point of amber and a soft glow. Never a ring or a disc round a mark, the raft or
// the Wick (WORLD.md §10).

// the chart's own colours: it is vellum and ink whatever the page's theme
export const C = { ink: '59,46,68', paper: '238,232,236', amber: '240,162,60', flame: '255,206,128', pale: '226,220,252', water: '58,54,118', sage: '166,212,160', stone: '236,232,241' };
const INK = `rgb(${C.ink})`, STONE = `rgb(${C.stone})`, AMBER = `rgb(${C.amber})`;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const hasPath2D = typeof Path2D !== 'undefined';

// ------------------------------------------------------------------ the view: chart units <-> screen px
/** A view {x, y, k, vw, vh, dpr}: the chart point at the screen's centre, px a chart unit, the screen in CSS px, the device ratio. */
export function chartView({ x = 0, y = 0, k = 1, vw = 1, vh = 1, dpr = 1, ox = null, oy = null } = {}) {
  // (ox, oy): the screen point the chart point (x, y) sits at; the screen's centre unless given
  const V = { x, y, k, vw, vh, dpr, ox: ox ?? vw / 2, oy: oy ?? vh / 2 };
  V.sx = (cx) => (cx - V.x) * V.k + V.ox;
  V.sy = (cy) => (cy - V.y) * V.k + V.oy;
  V.cx = (px) => (px - V.ox) / V.k + V.x;
  V.cy = (py) => (py - V.oy) / V.k + V.y;
  V.chartSpace = (ctx) => ctx.setTransform(V.dpr * V.k, 0, 0, V.dpr * V.k, V.dpr * (V.ox - V.x * V.k), V.dpr * (V.oy - V.y * V.k));
  V.screenSpace = (ctx) => ctx.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
  return V;
}

// ------------------------------------------------------------------ the road's geometry
/** The road's pieces made ready to draw, in place: pts, arc lengths, length and (in a browser) a Path2D. */
export function prepPieces(PC) {
  for (const pc of PC) {
    if (pc.pts) continue;
    pc.pts = []; for (let i = 0; i < pc.p.length; i += 2) pc.pts.push([pc.p[i], pc.p[i + 1]]);
    pc.s = [0]; for (let i = 1; i < pc.pts.length; i++) pc.s.push(pc.s[i - 1] + Math.hypot(pc.pts[i][0] - pc.pts[i - 1][0], pc.pts[i][1] - pc.pts[i - 1][1]));
    pc.len = pc.s[pc.s.length - 1];
    if (hasPath2D) { pc.path = new Path2D(); pc.path.moveTo(pc.pts[0][0], pc.pts[0][1]); for (let i = 1; i < pc.pts.length; i++) pc.path.lineTo(pc.pts[i][0], pc.pts[i][1]); }
  }
  return PC;
}
export const pointOnPiece = (pc, d) => {
  let j = 0; while (j < pc.pts.length - 2 && pc.s[j + 1] < d) j++;
  const t = (d - pc.s[j]) / (pc.s[j + 1] - pc.s[j] || 1), a = pc.pts[j], b = pc.pts[j + 1];
  return { x: lerp(a[0], b[0], t), y: lerp(a[1], b[1], t), ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
};
const strokePiece = (ctx, pc) => {
  if (pc.path) { ctx.stroke(pc.path); return; }
  ctx.beginPath(); ctx.moveTo(pc.pts[0][0], pc.pts[0][1]); for (let i = 1; i < pc.pts.length; i++) ctx.lineTo(pc.pts[i][0], pc.pts[i][1]); ctx.stroke();
};

// ---- the road: the water first, then a fine amber line inside it
/**
 * The Lamp Road. `own` and `rest` are piece indices (the owned road, and in the design view the road still to come, faintly);
 * `bothWays(i)` marks an out-and-back. `wisp` [x, y]: where the owned road runs on into a water not yet bought (a small lavender
 * wisp, no name and no shape). `alpha` inks it in (the sheet's reveal).
 */
export function road(ctx, V, PC, { own = [], rest = [], bothWays = () => false, wisp: w = null, alpha = 1 } = {}) {
  const k = V.k;
  V.chartSpace(ctx);
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const aw = clamp(1.2 + 0.3 * Math.log2(k / 0.6 + 0.001), 1.15, 2.3); // the amber line, in screen px
  const casing = 1 - sstep(1.7, 3.4, k);
  if (rest.length) {
    ctx.strokeStyle = `rgba(${C.amber},.42)`; ctx.lineWidth = 1.2 / k; ctx.setLineDash([0.1 / k, 4.5 / k]);
    for (const i of rest) strokePiece(ctx, PC[i]);
    ctx.setLineDash([]);
  }
  // 1. water under every river and canal leg, so the road is never the only sign of it
  if (casing > 0.01) {
    ctx.strokeStyle = `rgba(${C.water},${0.92 * casing})`; ctx.lineWidth = (aw + 2.5) / k;
    for (const i of own) { const pc = PC[i]; if ((pc.k === 'river' || pc.k === 'canal' || pc.k === 'haul') && !pc.wide) strokePiece(ctx, pc); }
    ctx.strokeStyle = `rgba(${C.pale},${0.55 * casing})`; ctx.lineWidth = (aw + 1.1) / k;
    for (const i of own) { const pc = PC[i]; if (pc.k === 'canal') strokePiece(ctx, pc); }
  }
  // 2. the amber line: solid on rivers, canals and lakes, hatched steps on the haul-way, dotted at sea
  for (const i of own) {
    const pc = PC[i];
    if (pc.k === 'sea') {
      ctx.setLineDash([0.1 / k, (aw * 3.1) / k]); ctx.lineWidth = (aw * 1.45) / k;
      ctx.strokeStyle = 'rgba(40,24,30,.5)'; ctx.lineWidth = (aw * 1.45 + 1.1) / k; strokePiece(ctx, pc);
      ctx.strokeStyle = AMBER; ctx.lineWidth = (aw * 1.45) / k; strokePiece(ctx, pc); ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = 'rgba(40,24,30,.55)'; ctx.lineWidth = (aw + 1.0) / k; strokePiece(ctx, pc);
      ctx.strokeStyle = AMBER; ctx.lineWidth = aw / k; strokePiece(ctx, pc);
      if (pc.k === 'haul') { // the lock stair: small hatched steps across the line
        ctx.lineCap = 'butt'; ctx.setLineDash([1.1 / k, 3.2 / k]); ctx.strokeStyle = `rgba(${C.ink},.9)`; ctx.lineWidth = (aw + 5) / k; strokePiece(ctx, pc); ctx.setLineDash([]); ctx.lineCap = 'round';
      }
    }
  }
  // 3. which way the water runs, and the return mark on an out-and-back
  V.screenSpace(ctx);
  for (const i of own) {
    const pc = PC[i], Lpx = pc.len * k;
    if (pc.flow && Lpx > 26) {
      const n = Math.max(1, Math.floor(Lpx / 58));
      for (let q = 0; q < n; q++) { const p = pointOnPiece(pc, pc.len * ((q + 0.62) / n)); chevron(ctx, V.sx(p.x), V.sy(p.y), p.ang, aw * 2.3 + 1.4); }
    }
    if (Lpx > 30 && pc.k !== 'sea' && bothWays(i)) { const p = pointOnPiece(pc, pc.len * (Lpx > 54 ? 0.3 : 0.5)); returnMark(ctx, V.sx(p.x), V.sy(p.y), p.ang, Lpx > 54 ? aw * 2.2 + 2.2 : aw * 1.7 + 1.6); }
  }
  if (w) wisp(ctx, V.sx(w[0]), V.sy(w[1]), clamp(11 * Math.sqrt(k), 10, 24));
  ctx.restore();
}
/** Where the owned road runs on into a water not yet bought: a small lavender wisp with no name and no shape. */
export function wisp(ctx, x, y, r) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, 'rgba(214,204,250,.95)'); g.addColorStop(0.5, 'rgba(200,190,244,.6)'); g.addColorStop(1, 'rgba(196,186,240,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r * 1.5, r, 0, 0, 6.3); ctx.fill();
  ctx.strokeStyle = 'rgba(116,104,176,.7)'; ctx.lineWidth = 1; ctx.lineCap = 'round';
  for (const [dx, dy, s] of [[-0.5, -0.25, 0.5], [0.25, 0.05, 0.62], [-0.2, 0.36, 0.42]]) { ctx.beginPath(); ctx.moveTo(x + (dx - s) * r, y + dy * r); ctx.bezierCurveTo(x + (dx - s * 0.4) * r, y + (dy - 0.22) * r, x + (dx + s * 0.4) * r, y + (dy + 0.22) * r, x + (dx + s) * r, y + dy * r); ctx.stroke(); }
}
export function chevron(ctx, x, y, ang, s) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.beginPath(); ctx.moveTo(-s * 0.45, -s * 0.62); ctx.lineTo(s * 0.5, 0); ctx.lineTo(-s * 0.45, s * 0.62);
  ctx.lineJoin = 'miter'; ctx.strokeStyle = `rgba(${C.paper},.9)`; ctx.lineWidth = 2.6; ctx.stroke();
  ctx.strokeStyle = `rgb(${C.ink})`; ctx.lineWidth = 1.15; ctx.stroke();
  ctx.restore();
}
export function returnMark(ctx, x, y, ang, s) { // two small arrows, out and back, set beside the line
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.translate(0, -s * 1.5);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (const pass of [0, 1]) {
    ctx.beginPath();
    ctx.moveTo(-s, -s * 0.3); ctx.lineTo(s, -s * 0.3); ctx.lineTo(s * 0.5, -s * 0.75);
    ctx.moveTo(s, s * 0.3); ctx.lineTo(-s, s * 0.3); ctx.lineTo(-s * 0.5, s * 0.75);
    if (!pass) { ctx.strokeStyle = `rgba(${C.paper},.9)`; ctx.lineWidth = 2.8; } else { ctx.strokeStyle = 'rgb(150,84,14)'; ctx.lineWidth = 1.15; }
    ctx.stroke();
  }
  ctx.restore();
}

// ------------------------------------------------------------------ marks: a lamp and a landmark vignette for each water
/**
 * The page's marks laid out afresh each frame, in screen px. A vignette stands at its landmark's true place; where that would
 * crowd its own lamp or a neighbour (zoomed out), it steps aside. `list`: [{n, at, vg, ...}]; adds lx, ly, vx, vy, u, vs.
 */
export function layoutMarks(V, list, { fitK, small = false }) {
  const k = V.k;
  const lampU = clamp(4.6 + 1.5 * Math.log2(k / fitK + 1), 5.2, 9.5);
  const vs = clamp(k * 13, small ? 13 : 18, 68);
  for (const m of list) {
    m.lx = V.sx(m.at[0]); m.ly = V.sy(m.at[1]); m.u = lampU; m.vs = vs;
    let vx = V.sx(m.vg[0]), vy = V.sy(m.vg[1]);
    const need = vs * 0.56 + lampU * 1.2;
    let dx = vx - m.lx, dy = vy - m.ly; const d = Math.hypot(dx, dy);
    if (d < need) { if (d < 0.01) { dx = 0; dy = -1; } else { dx /= d; dy /= d; } vx = m.lx + dx * need; vy = m.ly + dy * need; }
    m.vx = vx; m.vy = vy;
  }
  // neighbours' vignettes part a little; lamps keep their place
  for (let it = 0; it < 4; it++) for (let a = 0; a < list.length; a++) for (let b = a + 1; b < list.length; b++) {
    const A = list[a], B = list[b], dx = B.vx - A.vx, dy = B.vy - A.vy, d = Math.hypot(dx, dy), need = vs * 1.02;
    if (d < need && d > 0.01) { const push = (need - d) / 2; A.vx -= (dx / d) * push; A.vy -= (dy / d) * push; B.vx += (dx / d) * push; B.vy += (dy / d) * push; }
  }
  for (const A of list) for (const B of list) {
    const dx = A.vx - B.lx, dy = A.vy - B.ly, d = Math.hypot(dx, dy), need = vs * 0.5 + lampU;
    if (d < need && d > 0.01) { A.vx = B.lx + (dx / d) * need; A.vy = B.ly + (dy / d) * need; }
  }
  return list;
}

// ---- lamps: each its own small lantern, a flame-shaped point of amber and a soft glow. Never a ring.
export function lantern(ctx, x, y, u, lit, strong) {
  if (lit) {
    const gr = u * (strong ? 4.6 : 3.1), g = ctx.createRadialGradient(x, y - u * 0.3, 0, x, y - u * 0.3, gr);
    g.addColorStop(0, `rgba(${C.flame},${strong ? 0.8 : 0.62})`); g.addColorStop(0.3, `rgba(${C.amber},.26)`); g.addColorStop(1, `rgba(${C.amber},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - u * 0.3, gr, 0, 6.3); ctx.fill();
  }
  // the hook and the cap
  ctx.strokeStyle = INK; ctx.lineWidth = Math.max(0.9, u * 0.16); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y - u * 1.72, u * 0.32, Math.PI * 0.9, Math.PI * 2.1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - u * 0.62, y - u * 1.28); ctx.lineTo(x + u * 0.62, y - u * 1.28); ctx.stroke();
  // the flame
  ctx.beginPath(); ctx.moveTo(x, y - u * 1.16); ctx.bezierCurveTo(x + u * 0.85, y - u * 0.3, x + u * 0.62, y + u * 0.62, x, y + u * 0.62); ctx.bezierCurveTo(x - u * 0.62, y + u * 0.62, x - u * 0.85, y - u * 0.3, x, y - u * 1.16);
  if (lit) { ctx.fillStyle = AMBER; ctx.fill(); ctx.strokeStyle = 'rgba(96,44,10,.85)'; ctx.lineWidth = Math.max(0.7, u * 0.11); ctx.stroke(); ctx.fillStyle = 'rgba(255,244,214,.95)'; ctx.beginPath(); ctx.ellipse(x, y + u * 0.12, u * 0.24, u * 0.36, 0, 0, 6.3); ctx.fill(); }
  else { ctx.fillStyle = `rgba(${C.paper},.85)`; ctx.fill(); ctx.strokeStyle = `rgba(${C.ink},.7)`; ctx.lineWidth = Math.max(0.8, u * 0.13); ctx.stroke(); }
  ctx.strokeStyle = INK; ctx.lineWidth = Math.max(0.9, u * 0.16);
  ctx.beginPath(); ctx.moveTo(x - u * 0.5, y + u * 0.84); ctx.lineTo(x + u * 0.5, y + u * 0.84); ctx.stroke();
}
// home: the Landing's hearth, the warmest point on the sheet; banked low until the road comes home
export function hearth(ctx, x, y, u, full) {
  const gr = u * (full ? 6.5 : 3.8), g = ctx.createRadialGradient(x, y, 0, x, y, gr);
  g.addColorStop(0, `rgba(255,214,150,${full ? 0.95 : 0.78})`); g.addColorStop(0.3, `rgba(250,170,70,${full ? 0.42 : 0.3})`); g.addColorStop(1, 'rgba(250,170,70,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, gr, 0, 6.3); ctx.fill();
  const f = full ? 1.5 : 1;
  ctx.beginPath(); ctx.moveTo(x, y - u * 1.5 * f); ctx.bezierCurveTo(x + u * 1.0 * f, y - u * 0.4, x + u * 0.8, y + u * 0.6, x, y + u * 0.6); ctx.bezierCurveTo(x - u * 0.8, y + u * 0.6, x - u * 1.0 * f, y - u * 0.4, x, y - u * 1.5 * f);
  ctx.fillStyle = full ? 'rgb(252,190,92)' : 'rgb(246,168,70)'; ctx.fill(); ctx.strokeStyle = 'rgba(96,44,10,.85)'; ctx.lineWidth = Math.max(0.7, u * 0.11); ctx.stroke();
  ctx.fillStyle = 'rgba(255,246,220,.95)'; ctx.beginPath(); ctx.ellipse(x, y + u * 0.05, u * 0.3 * f, u * 0.44 * f, 0, 0, 6.3); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1, u * 0.2); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - u * 1.1, y + u * 0.86); ctx.lineTo(x + u * 1.1, y + u * 0.86); ctx.stroke();
}

// ---- landmark vignettes (WORLD.md §10): one small ink drawing for each water, drawn in a 20-unit box
let X = null; // the context the vignette being drawn inks into
const vg = { halo: false, u: 1 };
// the foliage track of WATERS.md: olive at step 1, deep green at step 15
export const LEAF = (st) => {
  const hue = 84 + 2.9 * st, cap = Math.min(0.62, 0.25 + 0.04 * st), sat = Math.min(cap - 0.04, 0.24 + 0.02 * st), val = 0.43 + 0.01 * st;
  const f = (n) => { const q = (n + hue / 60) % 6; return Math.round(255 * (val - val * sat * Math.max(0, Math.min(q, 4 - q, 1)))); };
  return `rgb(${f(5)},${f(3)},${f(1)})`;
};
// P: one inked shape. In the halo pass it is only a vellum outline, so every mark reads on sea and forest alike.
function P(build, fill, lw, stroke) {
  X.beginPath(); build();
  const w = Math.max((lw || 1) * 0.7, 0.95 / vg.u); // local units: never thinner than a pixel on screen
  if (vg.halo) { X.strokeStyle = `rgba(${C.paper},.86)`; X.lineWidth = w + 2.4 / vg.u; X.stroke(); return; }
  if (fill) { X.fillStyle = fill; X.fill(); }
  if (stroke !== null) { X.strokeStyle = stroke || INK; X.lineWidth = w; X.stroke(); }
}
const dot = (x, y, r, col) => { if (vg.halo) return; X.beginPath(); X.arc(x, y, r, 0, 6.3); X.fillStyle = col || AMBER; X.fill(); };
const rect = (x, y, w, h) => () => X.rect(x, y, w, h);
const poly = (pts, close) => () => { X.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) X.lineTo(pts[i], pts[i + 1]); if (close !== false) X.closePath(); };
const wave = (x0, x1, y, amp) => () => { X.moveTo(x0, y); for (let x = x0; x < x1; x += 3) X.quadraticCurveTo(x + 0.75, y - (amp || 0.9), x + 1.5, y), X.quadraticCurveTo(x + 2.25, y + (amp || 0.9), Math.min(x1, x + 3), y); };
// (the vignettes, one per water, in the order of the road: the Landing first)
export function vignetteLanding() { // the cove arch, the hearth, and Murk's lily-pad barge with his towering pack and green lamp
  P(rect(-9.2, -2, 1.9, 8.4), STONE); P(rect(-3.2, 0.5, 1.9, 5.9), STONE);
  P(() => { X.arc(-5.3, -2, 3.9, Math.PI, Math.PI * 1.42); }, null, 1.5); P(() => { X.arc(-5.3, -2, 3.9, Math.PI * 1.62, Math.PI * 1.9); }, null, 1.5);
  if (!vg.halo) { X.beginPath(); X.moveTo(-5.3, 1.6); X.bezierCurveTo(-3.9, 3.6, -4.2, 5.8, -5.3, 5.8); X.bezierCurveTo(-6.4, 5.8, -6.7, 3.6, -5.3, 1.6); X.fillStyle = AMBER; X.fill(); }
  P(() => X.ellipse(4.6, 6.6, 5.2, 1.5, 0, 0, 6.3), 'rgb(116,132,100)');
  P(() => { X.moveTo(1.2, 6.1); X.quadraticCurveTo(0.4, 3.2, 2.6, 3.2); X.quadraticCurveTo(4.4, 3.4, 4.2, 6.1); X.closePath(); }, 'rgb(116,92,76)'); // the old toad
  P(poly([4.4, 6, 4.1, -5.6, 5.6, -7.2, 7.4, -5.6, 7.3, 6]), 'rgb(196,176,150)'); // his pack
  P(poly([4.2, -2, 7.4, -2], false), null, 0.8); P(poly([4.3, 2, 7.3, 2], false), null, 0.8);
  P(poly([5.7, -7.2, 6.6, -9.6, 8.4, -8.2], false), null, 0.8);
  P(poly([8.6, 6.2, 9.2, 0.4], false), null, 0.8); dot(9.3, -0.4, 1.05, `rgb(${C.sage})`);
}
export function vignetteMossmere() { // the Sunken Gate's towers, the Toppled Bridge and its hanging chain
  P(rect(-7.6, -7, 3, 11.4), STONE); P(rect(4.6, -7, 3, 11.4), STONE);
  P(poly([-8.2, -7, -4, -7], false), null, 1.5); P(poly([4, -7, 8.2, -7], false), null, 1.5);
  P(() => { X.moveTo(-4.6, 4.4); X.lineTo(-4.6, -0.6); X.arc(0, -0.6, 4.6, Math.PI, 0); X.lineTo(4.6, 4.4); }, null, 1.3);
  dot(-6.1, -3.6, 0.7); dot(6.1, -1.4, 0.7); dot(-6.1, 0.6, 0.6);
  P(poly([-9.6, 7.4, -1.6, 7.4], false), null, 1.9); P(poly([2.6, 8.6, 9.4, 7.2], false), null, 1.9);
  P(poly([-1.6, 7.4, -1.6, 8.3, -1.2, 9, -1.6, 9.8], false), null, 0.7);
}
export function vignetteSporewood() { // three giant mushroom caps
  const cap = (x, y, rx, ry, base, col) => { P(poly([x, y, x + 0.3, base], false), null, 1.4); P(() => { X.ellipse(x, y, rx, ry, 0, Math.PI, 0); X.closePath(); }, col); };
  cap(-6.2, 1.2, 3.3, 2.1, 7, '#c79ab8'); cap(6.2, -0.4, 3.7, 2.3, 7, '#d6a4ba'); cap(0, -3.4, 5.6, 3.4, 7, '#b98cc0');
  P(poly([-9, 7, 9, 7], false), null, 0.8);
}
export function vignetteGlasswater() { // crystal monoliths and the fallen chandelier
  P(poly([-5.2, 6, -6.4, -3, -4.6, -6.4, -2.9, -3, -3.4, 6]), '#d5dafb'); P(poly([5, 6, 4, -1, 5.7, -4.4, 7.3, -1, 6.7, 6]), '#d5dafb');
  P(poly([-0.9, 6, -1.9, -5, 0.2, -9.4, 2.2, -5, 1.4, 6]), '#e2e5fd'); P(poly([0.2, -9.4, 0.2, 6], false), null, 0.6);
  P(() => X.arc(-0.2, 7, 3.4, 0.15, Math.PI - 0.15), null, 0.9); dot(-2.7, 8.6, 0.6); dot(-0.2, 9.9, 0.7); dot(2.4, 8.6, 0.6);
}
export function vignettePallid() { // the bone-white ribs and the two Kneeling statues with their dark lantern
  const rib = (x, h, lean) => { P(() => { X.moveTo(x, 6); X.quadraticCurveTo(x - 1.4, -h * 0.55, x + lean, -h); }, null, 2.6); if (!vg.halo) { X.beginPath(); X.moveTo(x, 6); X.quadraticCurveTo(x - 1.4, -h * 0.55, x + lean, -h); X.strokeStyle = '#f6f3fa'; X.lineWidth = 0.95; X.stroke(); } };
  rib(-8, 4.5, 2.6); rib(-4.8, 8.4, 3.4); rib(-1.4, 6.4, 3); rib(1.6, 3, 2);
  P(poly([3.6, 6.4, 3.8, 3.4, 5, 2.2, 5.8, 3.6, 5.6, 6.4]), STONE); P(poly([8.2, 6.4, 8, 3.4, 6.9, 2.2, 6.2, 3.6, 6.4, 6.4].map((v, i) => (i % 2 ? v : v + 1.4))), STONE);
  P(poly([6.6, 3.4, 7.3, 4.3, 6.6, 5.2, 5.9, 4.3]), 'rgb(52,42,62)', 0.7);
  P(wave(-9.5, 9.6, 6.6, 0.5), null, 0.7);
}
export function vignetteRime() { // the glacier front, floe ice and the lantern by the one hole
  P(poly([-9.4, 1.6, -9.4, -2.6, -6, -6.4, -1.6, -7.4, 2.4, -5.2, 4.6, -1.8, 4.6, 1.6]), '#f7f7fd');
  P(poly([-6.5, 1.6, -6.2, -1.2], false), null, 0.7); P(poly([-3.2, 1.6, -3.4, -2.4], false), null, 0.7); P(poly([0, 1.6, 0.3, -1.6], false), null, 0.7); P(poly([2.6, 1.6, 2.5, -0.6], false), null, 0.7);
  P(poly([-8.4, 5, -5.6, 3.9, -4.2, 5.4, -7, 6.6]), '#f7f7fd', 0.8); P(poly([5.4, 4.4, 8.6, 4.8, 8, 6.8, 5, 6.2]), '#f7f7fd', 0.8);
  P(poly([-3.2, 7.4, 3.6, 7, 4.2, 9.2, -2.6, 9.6]), '#f7f7fd', 0.8);
  P(() => X.ellipse(0, 8.3, 1.3, 0.55, 0, 0, 6.3), 'rgb(44,40,90)', 0.6); dot(2.3, 7.5, 0.85);
}
export function vignetteThin() { // the broken weir under its sluice lamp
  P(rect(-9.4, 0.6, 6.4, 2.4), STONE); P(rect(2.4, 0.6, 7, 2.4), STONE);
  P(poly([-2.4, 1, -1.9, 2.6, -1.2, 3.4], false), null, 0.9); P(poly([1.4, 1.2, 0.8, 2.8], false), null, 0.9);
  for (const x of [-1.6, 0, 1.4]) P(() => { X.moveTo(x, 4); X.quadraticCurveTo(x + 0.7, 5.6, x - 0.2, 7.4); }, null, 0.7, `rgb(${C.water})`);
  P(wave(-8, 8, 8.8, 0.6), null, 0.7, `rgb(${C.water})`);
  P(poly([-6.6, 0.6, -6.6, -5.2], false), null, 1.1); P(poly([-7.6, -5.2, -5.6, -5.2], false), null, 1.1); dot(-6.6, -6.6, 1.1);
}
export function vignetteLastLight() { // the lighthouse on the Lamp Rock, its beam drawn as two fine rays
  if (!vg.halo) { X.beginPath(); X.moveTo(1.2, -8); X.lineTo(9.6, -10.4); X.moveTo(1.2, -7.6); X.lineTo(9.6, -5.6); X.strokeStyle = `rgb(${C.flame})`; X.lineWidth = 0.6; X.stroke(); }
  P(poly([-7.4, 7, -5.2, 2.8, -2, 1, 2.8, 1.6, 5.4, 4, 7.2, 7]), 'rgb(176,166,178)');
  P(poly([-1.8, 1.4, -1.1, -6.6, 1.1, -6.6, 1.8, 1.4]), STONE); P(poly([-1.5, -2.6, 1.5, -2.6], false), null, 0.7);
  P(rect(-1.5, -9, 3, 2.4), STONE, 0.9); P(poly([-1.9, -9, 0, -10.6, 1.9, -9], false), null, 0.9); dot(0, -7.8, 0.9);
  P(wave(-9.4, 9.4, 8, 0.6), null, 0.7, `rgb(${C.pale})`);
}
export function vignettePyrefall() { // the temple stairs into the river and the snow peaks behind
  P(poly([-9.6, 1.4, -4.6, -8.4, -0.4, 1.4]), STONE); P(poly([-1.6, 1.4, 4, -6.2, 9.6, 1.4]), STONE);
  P(poly([-6.3, -5, -5.2, -4, -4.4, -5.2, -3.4, -4], false), null, 0.7); P(poly([2.6, -4.2, 3.6, -3.2, 4.6, -4.4, 5.6, -3.4], false), null, 0.7);
  for (let i = 0; i < 4; i++) P(poly([-5.4 + i * 0.9, 2.6 + i * 1.6, 5.4 - i * 0.9, 2.6 + i * 1.6], false), null, 1.1);
  dot(-3.4, 1.9, 0.75); dot(2.6, 3.5, 0.75); dot(-1.2, 5.1, 0.75); dot(1.4, 6.7, 0.7);
  P(wave(-7, 7, 9.2, 0.6), null, 0.7, `rgb(${C.water})`);
}
export function vignetteReef() { // the spire and chimneys of the drowned town above the reef, the wreck on the drop-off
  P(poly([-5.2, 1, -3.8, -9.4, -2.4, 1]), STONE); P(rect(0.6, -3.4, 1.8, 4.4), STONE); P(rect(4.6, -1.8, 1.8, 2.8), STONE);
  P(poly([-2.4, -1, 0.6, -2.4], false), null, 0.8); P(poly([2.4, -1.8, 4.6, -0.8], false), null, 0.8);
  P(wave(-9.4, 9.4, 1.2, 0.7), null, 0.8, vg.halo ? null : `rgb(${C.pale})`);
  P(() => { X.moveTo(-3.6, 5.2); X.quadraticCurveTo(1.4, 10.6, 7.6, 6.2); X.lineTo(6.2, 5); X.quadraticCurveTo(1.4, 7.4, -2.4, 4.2); X.closePath(); }, 'rgb(206,190,186)', 0.9);
  P(poly([1.6, 6.4, 3, 2.6], false), null, 0.9);
}
export function vignetteStair() { // the broken lock stair between its two towers
  P(rect(-9.2, -8, 2.9, 12), STONE); P(rect(6.3, -2.6, 2.9, 10.6), STONE);
  P(poly([-9.8, -8, -5.7, -8], false), null, 1.4); P(poly([5.7, -2.6, 9.8, -2.6], false), null, 1.4); dot(-7.75, -9.6, 0.95); dot(7.75, -4.2, 0.95);
  P(poly([-6.3, -3, -3.6, -3, -3.6, -0.4, -0.9, -0.4, -0.9, 2.2, 0.6, 2.2], false), null, 1.4); P(poly([2.2, 3.4, 3.6, 3.4, 3.6, 5.6, 6.3, 5.6], false), null, 1.4);
  for (const [x, y] of [[-3.6, -0.2], [-0.9, 2.4], [1.4, 3.2], [3.6, 5.8]]) P(poly([x + 0.6, y + 0.4, x + 0.6, y + 2.2], false), null, 0.7, `rgb(${C.water})`);
}
export function vignetteFen() { // the great dam on the Step's lip with its one lamp, papyrus behind
  const tuft = (x) => { for (const d of [-1.3, -0.4, 0.5, 1.4]) P(poly([x + d * 0.4, 1.6, x + d * 1.3, -4.6 - (d * d) * 0.4 + 1], false), null, 1, LEAF(10)); dot(x - 1.7, -4.2, 0.55); dot(x + 1.8, -4.4, 0.55); };
  tuft(-6.4); tuft(-2.4); tuft(5.6);
  P(poly([-9.6, 1.6, 9.6, 1.6, 8.4, 5.6, -8.4, 5.6]), STONE);
  for (const x of [-5.6, -1.9, 1.9, 5.6]) P(poly([x, 1.6, x, 5.6], false), null, 0.7);
  P(poly([1.8, 1.6, 1.8, -2.6], false), null, 1.1); dot(1.8, -3.8, 1.1);
  P(() => X.ellipse(0, 8, 5.4, 1.1, 0, 0, 6.3), 'rgb(44,38,70)', 0.6);
}
export function vignetteSaltGate() { // the two gate towers, left open, and the unfinished hulls on the slipway
  P(rect(-9.4, -6.6, 2.8, 12), STONE); P(rect(-3.4, -6.6, 2.8, 12), STONE);
  P(poly([-10, -6.6, -6, -6.6], false), null, 1.4); P(poly([-4, -6.6, 0, -6.6], false), null, 1.4);
  P(wave(-9.6, 1, 6.8, 0.6), null, 0.7, `rgb(${C.water})`);
  P(poly([1.2, 7, 9.8, 2.8], false), null, 1);
  const hull = (x, y) => { P(() => { X.moveTo(x - 2.6, y + 1.3); X.lineTo(x + 2.6, y - 1.3); }, null, 1.1); for (const t of [-0.8, -0.3, 0.2, 0.7]) P(() => { const px = x + t * 3, py = y - t * 1.5; X.moveTo(px - 1.1, py - 2.6); X.quadraticCurveTo(px - 1.4, py - 0.2, px, py); }, null, 0.8); };
  hull(4.2, 4.2); hull(7.4, 0.4);
}
export function vignetteSlough() { // the canal's lock gate under swamp trees
  P(() => { X.moveTo(-8.8, 6.4); X.quadraticCurveTo(-7.4, 2, -7.6, -2.4); X.lineTo(-6.4, -2.4); X.quadraticCurveTo(-6.4, 2, -5, 6.4); }, 'rgb(150,136,128)', 0.9);
  P(() => { X.ellipse(-3.4, -5.2, 6.8, 3.7, 0, 0, 6.3); }, LEAF(12));
  for (const x of [-7.8, -4.6, -1.4, 1.6]) P(poly([x, -2.2, x, 0.4 + ((x * 7) % 2)], false), null, 0.7, 'rgb(112,132,112)');
  P(rect(-3.2, 2, 1.7, 5.4), STONE); P(rect(7.2, 2, 1.7, 5.4), STONE);
  P(poly([-1.5, 3.2, 3.7, 5.6, 7.2, 3.2], false), null, 1.9);
  P(wave(-1.2, 7, 8, 0.5), null, 0.7, `rgb(${C.water})`);
}
export function vignetteSiltway() { // two mile-posts along the bank, and the sunk barge's mast at the great bend
  P(() => { X.moveTo(-9.6, 2.8); X.quadraticCurveTo(-3, 1.4, 2.6, 3.6); }, null, 1);
  const post = (x, y) => P(() => { X.moveTo(x - 1, y); X.lineTo(x - 1, y - 4.6); X.arc(x, y - 4.6, 1, Math.PI, 0); X.lineTo(x + 1, y); X.closePath(); }, '#f6f3fa');
  post(-7.2, 2.6); post(-2.4, 2.4);
  P(poly([4.2, 8, 6.9, -8.4], false), null, 1.4); P(poly([3.9, -4.2, 9, -3.2], false), null, 1.1); P(poly([6.9, -8.4, 9.2, -7.4, 7, -6.2], true), 'rgb(196,176,150)', 0.7);
  P(() => X.ellipse(4.3, 8, 3.2, 0.9, 0, 0, 6.3), null, 0.7, 'rgb(112,92,84)'); P(wave(-9, 0.6, 7.2, 0.5), null, 0.7, 'rgb(112,92,84)');
}
export function vignetteLagoon() { // the stilt village with its lanterns, one of them green
  const hut = (x, y, w, h) => { for (const d of [0.14, 0.86]) P(poly([x + w * d, y + h, x + w * d, 7.6], false), null, 0.9); P(rect(x, y, w, h), STONE); P(poly([x - 0.9, y, x + w / 2, y - h * 1.05, x + w + 0.9, y]), 'rgb(196,176,150)'); };
  hut(-8.6, -2.8, 6, 3.8); hut(1.6, -0.6, 6, 3.4);
  P(poly([-2.6, -1.6, -1.2, -0.2], false), null, 0.6); dot(-1, 0.6, 0.85); P(poly([1.6, 0.6, 0.6, 1.8], false), null, 0.6); dot(0.5, 2.6, 0.8);
  P(poly([7.6, 0.6, 8.8, 1.8], false), null, 0.6); dot(9, 2.7, 0.95, `rgb(${C.sage})`);
  P(wave(-9.6, 9.6, 8, 0.6), null, 0.7, `rgb(${C.water})`);
}
export function vignetteInkwood() { // the Kitchen Stair's hearth under the canopy, and the orchard rows' dikes
  const g = LEAF(15);
  P(() => { X.arc(-5.4, -4.4, 4.2, 0, 6.3); }, g); P(() => { X.arc(5.8, -4, 3.9, 0, 6.3); }, g); P(() => { X.arc(0.2, -6, 4.8, 0, 6.3); }, g);
  P(poly([-5.6, -0.2, -5.2, 6], false), null, 1.2); P(poly([5.8, -0.1, 5.4, 6], false), null, 1.2);
  P(poly([-2.6, 6, -2.6, 2.6, 0, 0.9, 2.6, 2.6, 2.6, 6]), STONE); P(() => { X.moveTo(-1.3, 6); X.lineTo(-1.3, 4.4); X.arc(0, 4.4, 1.3, Math.PI, 0); X.lineTo(1.3, 6); }, 'rgb(52,42,62)', 0.7); dot(0, 5.2, 0.55);
  for (const y of [7.6, 9.2]) P(poly([-9.2, y, 9.2, y + 0.2], false), null, 0.7);
}
/** The vignettes in the road's order (n 0 the Landing, 1 the Mossmere … 16 the Inkwood): the page draws from all of them; the
 *  game imports only its shipped sheets' (src/ui-chart.js SHIPPED_VIGNETTES), so its bundle carries no other water's. */
export const VIGNETTES = [vignetteLanding, vignetteMossmere, vignetteSporewood, vignetteGlasswater, vignettePallid, vignetteRime, vignetteThin, vignetteLastLight, vignettePyrefall, vignetteReef, vignetteStair, vignetteFen, vignetteSaltGate, vignetteSlough, vignetteSiltway, vignetteLagoon, vignetteInkwood];
/** A water's landmark vignette (n 0 the Landing, 1 the Mossmere … 16 the Inkwood) centred at x, y, `vs` px across. Owned marks
 *  ink fully; an unowned one (the design view only) at 55%. */
export function vignette(ctx, n, x, y, vs, opts) { inkVignette(ctx, VIGNETTES[n], x, y, vs, opts); }
/** One vignette's drawing (one of VIGNETTES) inked centred at x, y, `vs` px across (the game passes its shipped sheets' own). */
export function inkVignette(ctx, draw, x, y, vs, { owned = true, alpha = 1 } = {}) {
  if (typeof draw !== 'function') return;
  const u = vs / 20;
  ctx.save(); ctx.translate(x, y); ctx.scale(u, u);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.globalAlpha *= (owned ? 1 : 0.55) * alpha;
  X = ctx; vg.u = u; vg.halo = true; draw(); vg.halo = false; draw(); X = null;
  ctx.restore();
}
export const VIGNETTE_COUNT = () => VIGNETTES.length;

// ------------------------------------------------------------------ lettering
// One style everywhere: dark ink on a soft reserve of vellum.
/** The width of `text` in `font` with `sp` px between letters; `cache` (a Map) keeps widths once the faces are in. */
export function spacedWidth(ctx, text, font, sp, cache = null) {
  const key = font + '|' + text;
  let w = cache ? cache.get(key) : undefined;
  if (w == null) { ctx.font = font; w = ctx.measureText(text).width; if (cache) cache.set(key, w); }
  return w + sp * (Array.from(text).length - 1);
}
/** `text` lettered centred on x, y, on a soft vellum reserve, as if the wash had been lifted where the pen would go. */
export function inkText(ctx, text, x, y, font, sp, alpha, colour, { dpr = 1, cache = null, reserve = 1 } = {}) {
  ctx.font = font; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.lineJoin = 'round';
  const chars = sp ? Array.from(text) : [text];
  const start = x - spacedWidth(ctx, text, font, sp, cache) / 2;
  const each = (fn) => { let cx = start; for (const ch of chars) { fn(ch, cx); cx += ctx.measureText(ch).width + sp; } };
  if (reserve > 0) {
    ctx.save(); ctx.shadowColor = `rgb(${C.paper})`; ctx.shadowBlur = 5 * dpr; ctx.globalAlpha *= reserve;
    ctx.strokeStyle = `rgba(${C.paper},.62)`; ctx.lineWidth = 2.8; each((ch, cx) => ctx.strokeText(ch, cx, y)); each((ch, cx) => ctx.strokeText(ch, cx, y));
    ctx.restore();
  }
  ctx.fillStyle = colour || `rgba(${C.ink},${alpha == null ? 0.96 : alpha})`; each((ch, cx) => ctx.fillText(ch, cx, y));
}
/** Each reach's sheets are lettered in their own hand (WORLD.md §10); the Inkwood's old plan in a plainer one. F: the four faces. */
export const handFont = (F, n, px) => {
  if (n === 16) return `400 ${Math.round(px * 1.02)}px ${F.hand}`;
  const act = n === 0 ? 0 : Math.floor((n - 1) / 4);
  return [`italic 400 ${px}px ${F.chart}`, `400 ${px}px ${F.chart}`, `italic 500 ${px}px ${F.body}`, `500 ${px}px ${F.body}`][act];
};
/** Lettering in chart units (the frame's): nothing when it would be smaller than `least` screen px at zoom k. */
export function chartText(ctx, k, text, x, y, size, font, fill, sp, align, least) {
  if (size * k < (least || 6.4)) return false;
  ctx.font = `${font.style || '400'} ${size}px ${font.fam}`; ctx.textBaseline = 'middle'; ctx.fillStyle = fill;
  const chars = Array.from(text); let w = 0;
  for (const ch of chars) w += ctx.measureText(ch).width + (sp || 0);
  w -= sp || 0;
  let cx = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
  ctx.textAlign = 'left';
  for (const ch of chars) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + (sp || 0); }
  return true;
}

// ------------------------------------------------------------------ the sheet's own furniture
/** Where the charted country stops: a feathered ink edge and a thin rim of mist (`whole`: the edge left at 16 of 16). */
export function sheetEdge(ctx, V, lines, { whole = false } = {}) {
  if (!lines) return;
  V.chartSpace(ctx);
  const k = V.k;
  ctx.beginPath();
  for (const a of lines) { ctx.moveTo(a[0], a[1]); for (let i = 2; i < a.length; i += 2) ctx.lineTo(a[i], a[i + 1]); }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (!whole) { ctx.strokeStyle = 'rgba(190,180,240,.3)'; ctx.lineWidth = 7 / k + 2.5; ctx.stroke(); }
  ctx.strokeStyle = `rgba(${C.ink},.5)`; ctx.lineWidth = 0.9 / k; ctx.setLineDash([7 / k, 2.2 / k, 1.2 / k, 2.2 / k]); ctx.stroke(); ctx.setLineDash([]);
}
/** A Waystone: a small standing stone, with a point of amber when its map is owned (gold: its legend landed). */
export function stone(ctx, x, y, s, lit, gold = false) {
  ctx.beginPath(); ctx.moveTo(x - s * 0.5, y + s * 0.7); ctx.lineTo(x - s * 0.5, y - s * 0.3); ctx.arc(x, y - s * 0.3, s * 0.5, Math.PI, 0); ctx.lineTo(x + s * 0.5, y + s * 0.7); ctx.closePath();
  ctx.fillStyle = gold ? 'rgb(236,196,104)' : lit ? 'rgb(244,238,230)' : 'rgb(164,158,186)'; ctx.fill(); ctx.strokeStyle = `rgba(${C.ink},.85)`; ctx.lineWidth = s * 0.11; ctx.stroke();
  if (lit) { ctx.beginPath(); ctx.moveTo(x, y - s * 0.52); ctx.quadraticCurveTo(x + s * 0.36, y + s * 0.1, x, y + s * 0.34); ctx.quadraticCurveTo(x - s * 0.36, y + s * 0.1, x, y - s * 0.52); ctx.fillStyle = gold ? 'rgb(150,84,14)' : AMBER; ctx.fill(); }
}
/** One small, plain compass rose (WORLD.md §10: no flourish beyond it). `style` strokes and fills it; `letter` adds the N. */
export function compass(ctx, rx, ry, R, style, { lw = 0.4, letter = null } = {}) {
  ctx.lineJoin = 'round'; ctx.strokeStyle = style; ctx.fillStyle = style; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.arc(rx, ry, R * 0.6, 0, 6.3); ctx.stroke();
  for (let q = 0; q < 8; q++) {
    const a = (q * Math.PI) / 4, long = q % 2 === 0 ? R : R * 0.5, wd = (q % 2 === 0 ? 2.3 : 1.4) * R / 21;
    ctx.beginPath(); ctx.moveTo(rx + Math.sin(a) * long, ry - Math.cos(a) * long);
    ctx.lineTo(rx + Math.sin(a + 1.57) * wd, ry - Math.cos(a + 1.57) * wd); ctx.lineTo(rx + Math.sin(a - 1.57) * wd, ry - Math.cos(a - 1.57) * wd); ctx.closePath();
    ctx.stroke(); if (q === 0) ctx.fill();
  }
  if (letter) letter();
}
/**
 * The page's border: the neatline and its band, the latitudes, the four cartouches (each empty until its reach's fourth map is
 * owned, then its Waystones and its act), the title cartouche, the compass rose and the Waystones' sill off the Landing's cove.
 * o: {SH, WIN, SILL, ACTS, owned, inked, reveal, foldTicks (drawn when given), F}.
 */
export function frame(ctx, V, o) {
  const { SH, WIN, SILL, ACTS, owned, inked, reveal, foldTicks, F } = o;
  const k = V.k;
  V.chartSpace(ctx);
  const ink = (a) => `rgba(${C.ink},${a})`, pale = (a) => `rgba(${C.pale},${a})`;
  const disp = { fam: F.display }, ital = { fam: F.chart, style: 'italic 400' };
  ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
  const X0 = SH.x0, Y0 = SH.y0, Y1 = SH.y0 + SH.h, e = SH.edge;
  // the neatline: a heavy rule and a fine one; the border band beyond it; a fine rule at the sheet's edge
  ctx.strokeStyle = ink(0.86); ctx.lineWidth = 1.1; ctx.strokeRect(WIN[0], WIN[1], WIN[2] - WIN[0], WIN[3] - WIN[1]);
  ctx.lineWidth = 0.3; ctx.strokeRect(WIN[0] - 2.6, WIN[1] - 2.6, WIN[2] - WIN[0] + 5.2, WIN[3] - WIN[1] + 5.2);
  ctx.strokeStyle = ink(0.6); ctx.strokeRect(X0 + e, Y0 + e, SH.w - 2 * e, SH.h - 2 * e);
  // ticks along the band, as on a ruled border
  ctx.beginPath(); ctx.strokeStyle = ink(0.55); ctx.lineWidth = 0.3;
  for (let x = 0; x <= 1000; x += 50) { ctx.moveTo(x, WIN[1] - 2.6); ctx.lineTo(x, WIN[1] - 6.2); ctx.moveTo(x, WIN[3] + 2.6); ctx.lineTo(x, WIN[3] + 6.2); }
  for (let y = 0; y <= 1400; y += 50) { ctx.moveTo(WIN[0] - 2.6, y); ctx.lineTo(WIN[0] - 6.2, y); ctx.moveTo(WIN[2] + 2.6, y); ctx.lineTo(WIN[2] + 6.2, y); }
  ctx.stroke();
  // true latitudes down the right band (the Fold swallows forty degrees)
  for (const [y, t] of [[190, '51°N'], [580, '49°N'], [758, '6°N'], [1100, '0°'], [1336, '4°S']]) { ctx.save(); ctx.translate(WIN[2] + 14, y); ctx.rotate(Math.PI / 2); chartText(ctx, k, t, 0, 0, 8.4, ital, ink(0.78), 0.3); ctx.restore(); }
  // the four cartouches, one for each reach: empty until its fourth map is owned, then its Waystones and its act
  const bandMid = (SH.neat + e) / 2;
  const cart = (i, cx, cy, rot) => {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
    const full = owned >= (i + 1) * 4 || inked, L = 316, Hh = 27;
    ctx.beginPath(); ctx.moveTo(-L / 2 + 9, -Hh / 2); ctx.lineTo(L / 2 - 9, -Hh / 2); ctx.lineTo(L / 2, 0); ctx.lineTo(L / 2 - 9, Hh / 2); ctx.lineTo(-L / 2 + 9, Hh / 2); ctx.lineTo(-L / 2, 0); ctx.closePath();
    ctx.fillStyle = 'rgba(244,240,236,.7)'; ctx.fill(); ctx.strokeStyle = ink(0.75); ctx.lineWidth = 0.45; ctx.stroke();
    if (full) {
      const a = ACTS[i], font = [{ fam: F.chart, style: 'italic 400' }, { fam: F.chart }, { fam: F.body, style: 'italic 500' }, { fam: F.body, style: '500' }][i];
      chartText(ctx, k, a.n, -L / 2 + 28, 0.8, 14, disp, ink(0.9), 0.8, null, 5.6);
      chartText(ctx, k, a.title, -L / 2 + 50, 0.4, 17.5, font, ink(0.96), 0.7, 'left', 5.6);
      for (let q = 0; q < 4; q++) stone(ctx, L / 2 - 68 + q * 14.6, 0.8, 10.5, true);
      if (i === 0) pilgrim(ctx, k, L / 2 + 16, 0);
    }
    ctx.restore();
  };
  cart(0, 590, Y0 + bandMid, 0);
  cart(1, X0 + bandMid, 372, -Math.PI / 2);
  cart(2, X0 + bandMid, 884, -Math.PI / 2);
  cart(3, 640, Y1 - bandMid, 0);
  // the title cartouche: a vellum label laid on the Warm Sea
  const tx = 118, ty = 1392;
  ctx.fillStyle = 'rgba(238,232,230,.95)'; ctx.fillRect(tx - 116, ty - 40, 232, 78);
  ctx.strokeStyle = ink(0.8); ctx.lineWidth = 0.8; ctx.strokeRect(tx - 116, ty - 40, 232, 78); ctx.lineWidth = 0.25; ctx.strokeRect(tx - 112.5, ty - 36.5, 225, 71);
  chartText(ctx, k, 'GLOOMWATER', tx, ty - 25, 7.4, disp, ink(0.66), 3.6);
  chartText(ctx, k, 'THE WAXWOLD', tx, ty - 3, 23, disp, ink(0.94), 5);
  ctx.strokeStyle = ink(0.6); ctx.lineWidth = 0.35;
  ctx.beginPath(); ctx.moveTo(tx - 86, ty + 13); ctx.lineTo(tx - 8, ty + 13); ctx.moveTo(tx + 8, ty + 13); ctx.lineTo(tx + 86, ty + 13); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tx, ty + 9.6); ctx.lineTo(tx + 3.4, ty + 13); ctx.lineTo(tx, ty + 16.4); ctx.lineTo(tx - 3.4, ty + 13); ctx.closePath(); ctx.stroke();
  chartText(ctx, k, 'a road chart of the Lamp Road', tx, ty + 26, 10.6, ital, ink(0.86), 0.3, null, 8.2);
  // one small, plain compass rose, in the corner by the Waystones. It and the sill stand in the Cold
  // Sea, which is blank vellum until the whole road is charted: pale ink on the sea, dark on the vellum.
  const onSea = inked || (owned >= 16 && !reveal), fur = (a) => (onSea ? pale(a) : ink(a * 0.9));
  const rx = 1000, ry = 14, R = 21;
  compass(ctx, rx, ry, R, fur(0.85), { letter: () => chartText(ctx, k, 'N', rx, ry - R - 7, 9, disp, fur(0.92), 0) });
  // the Waystones: the sill under the Landing's arch, sixteen stones in four arcs, one arc for each
  // reach (WORLD.md §7), drawn in the Cold Sea just off the Landing's cove
  const wx = SILL[0], wy = SILL[1];
  ctx.setLineDash([0.4, 2.4]); ctx.lineCap = 'round'; ctx.strokeStyle = fur(0.6); ctx.lineWidth = 0.4;
  ctx.beginPath(); ctx.moveTo(wx - 12, wy + 46); ctx.quadraticCurveTo(626, 158, 603, 171); ctx.stroke();
  ctx.setLineDash([]); ctx.lineCap = 'butt';
  ctx.fillStyle = STONE; ctx.strokeStyle = ink(0.9); ctx.lineWidth = 0.5;
  for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.rect(wx + sgn * 16 - 2.6, wy - 9, 5.2, 13); ctx.fill(); ctx.stroke(); }
  for (const [lw, col] of [[2.8, ink(0.9)], [1.6, STONE]]) { ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(wx, wy - 9, 16, Math.PI, Math.PI * 1.36); ctx.stroke(); ctx.beginPath(); ctx.arc(wx, wy - 9, 16, Math.PI * 1.52, Math.PI * 2); ctx.stroke(); }
  for (let arc = 0; arc < 4; arc++) for (let st = 0; st < 4; st++) {
    const n = arc * 4 + st + 1, t = (st - 1.5) / 1.5;
    stone(ctx, wx + t * 12.4, wy + 13 + arc * 8.6 + 1.7 * (1 - t * t), 5.8, n <= owned);
  }
  chartText(ctx, k, 'the Waystones', wx + 26, wy + 18, 9.2, ital, fur(0.95), 0.2, 'left');
  chartText(ctx, k, 'one lights for each map bought', wx + 26, wy + 29, 7.2, ital, fur(0.85), 0.15, 'left');
  // the Long Coast's sailing line is broken by the Fold: a tick at each pleat
  if (foldTicks) {
    ctx.strokeStyle = `rgba(${C.paper},.9)`; ctx.lineWidth = 0.6; ctx.beginPath();
    for (const [x, y] of foldTicks) { ctx.moveTo(x - 5, y + 1.4); ctx.lineTo(x + 5, y - 1.4); ctx.moveTo(x - 5, y + 3.2); ctx.lineTo(x + 5, y + 0.4); }
    ctx.stroke();
  }
}
// the court surveyors' little Pilgrim Salmon, always swimming down the road
export function pilgrim(ctx, k, x, y) {
  if (10 * k < 6) return;
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.moveTo(-8, 0); ctx.quadraticCurveTo(-2, -4.2, 6, -0.6); ctx.lineTo(10.4, -3.4); ctx.lineTo(9.4, 0); ctx.lineTo(10.4, 3.4); ctx.lineTo(6, 0.6); ctx.quadraticCurveTo(-2, 4.2, -8, 0); ctx.closePath();
  ctx.strokeStyle = `rgba(${C.ink},.85)`; ctx.lineWidth = 0.5; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-1, -2.6); ctx.lineTo(1.4, -4.6); ctx.lineTo(2.6, -2); ctx.moveTo(-4.8, -0.6); ctx.arc(-5.2, -0.6, 0.4, 0, 6.3); ctx.stroke();
  ctx.restore();
}
// ---- the raft: a small hull, the Wick and its flame. Never a ring.
export function raft(ctx, x, y, z, t, reduced) {
  const fl = reduced ? 1 : 0.92 + 0.08 * Math.sin(t / 97) + 0.05 * Math.sin(t / 41);
  ctx.save(); ctx.translate(x, y + (reduced ? 0 : Math.sin(t / 420) * 1.1)); ctx.scale(z, z);
  const g = ctx.createRadialGradient(0, -9, 0, 0, -9, 26 * fl);
  g.addColorStop(0, 'rgba(255,214,150,.9)'); g.addColorStop(0.25, 'rgba(250,170,70,.42)'); g.addColorStop(1, 'rgba(250,170,70,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -9, 26 * fl, 0, 6.3); ctx.fill();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // the raft
  ctx.beginPath(); ctx.moveTo(-8.5, -0.5); ctx.lineTo(8.5, -0.5); ctx.lineTo(6.6, 3); ctx.lineTo(-6.6, 3); ctx.closePath();
  ctx.strokeStyle = `rgba(${C.paper},.9)`; ctx.lineWidth = 2.6; ctx.stroke(); ctx.fillStyle = 'rgb(96,72,60)'; ctx.fill(); ctx.strokeStyle = 'rgb(34,24,36)'; ctx.lineWidth = 1; ctx.stroke();
  // its lantern on a pole
  ctx.beginPath(); ctx.moveTo(5.2, -0.5); ctx.lineTo(5.2, -9.5); ctx.strokeStyle = 'rgb(34,24,36)'; ctx.lineWidth = 1.1; ctx.stroke();
  ctx.beginPath(); ctx.arc(5.2, -10.6, 1.7, 0, 6.3); ctx.fillStyle = 'rgb(255,190,100)'; ctx.fill(); ctx.strokeStyle = 'rgb(96,44,10)'; ctx.lineWidth = 0.6; ctx.stroke();
  // the Wick: a small candle with a candle-flame head
  ctx.beginPath(); ctx.rect(-3.6, -6.2, 3.6, 5.7); ctx.fillStyle = 'rgb(248,240,226)'; ctx.fill(); ctx.strokeStyle = 'rgb(34,24,36)'; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-1.8, -13.4 * fl); ctx.bezierCurveTo(0.9, -10, 0.4, -6.6, -1.8, -6.6); ctx.bezierCurveTo(-4, -6.6, -4.5, -10, -1.8, -13.4 * fl);
  ctx.fillStyle = 'rgb(255,186,84)'; ctx.fill(); ctx.strokeStyle = 'rgb(120,56,8)'; ctx.lineWidth = 0.6; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-1.8, -8.4, 0.9, 1.4, 0, 0, 6.3); ctx.fillStyle = 'rgba(255,246,220,.95)'; ctx.fill();
  ctx.restore();
}

// ================================================================== the game's Chart (docs/loop/M1.md §3.3–§3.5, SPEC §5.4, §5.5 (f))
// Everything below is drawn from the game's model (chartModel) and its own arena data, in the bake's ink: the first sheet (the
// crop, the road, the Landing and the Mossmere's marks, the stones of arc I and the rose), each owned water's own sheet pinned
// beside its true place with a short ink stroke (its shore, isles, the bridge's piers, the Bell Pool, the docks, Murk's barge at
// the Jetty, and its places: vignettes when owned, mist blots when not), and the next water's rolled, sealed sheet with its three
// seals. No word but the water's and the places' names, the prices, the weights, a seal's count and "Coming soon".
const WAX = 'rgb(146,64,98)', WAX_DARK = 'rgb(92,34,62)', GOLD = 'rgb(214,164,58)', GOLD_INK = 'rgb(120,78,12)';
const MIST = '226,222,246';
const ink = (a) => `rgba(${C.ink},${a})`;

/** A place kind's small ink glyph (day ☀, old ◎, night ☾, crown ♛), `s` px across. */
export function kindGlyph(ctx, kind, x, y, s, { colour = ink(0.92), lw = 1.1 } = {}) {
  const r = s / 2;
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = colour; ctx.fillStyle = colour; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  if (kind === 'day') {
    ctx.arc(0, 0, r * 0.42, 0, 6.3);
    for (let q = 0; q < 8; q++) { const a = (q * Math.PI) / 4; ctx.moveTo(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62); ctx.lineTo(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.95); }
    ctx.stroke();
  } else if (kind === 'old') {
    ctx.arc(0, 0, r * 0.9, 0, 6.3); ctx.moveTo(r * 0.45, 0); ctx.arc(0, 0, r * 0.45, 0, 6.3); ctx.stroke();
  } else if (kind === 'night') {
    ctx.arc(0, 0, r * 0.9, Math.PI * 0.35, Math.PI * 1.65); ctx.arc(r * 0.42, 0, r * 0.62, Math.PI * 1.45, Math.PI * 0.55, true); ctx.closePath(); ctx.fill();
  } else if (kind === 'crown') {
    ctx.moveTo(-r * 0.9, r * 0.6); ctx.lineTo(-r * 0.9, -r * 0.35); ctx.lineTo(-r * 0.42, r * 0.08); ctx.lineTo(0, -r * 0.7); ctx.lineTo(r * 0.42, r * 0.08); ctx.lineTo(r * 0.9, -r * 0.35); ctx.lineTo(r * 0.9, r * 0.6); ctx.closePath(); ctx.stroke();
    for (const px of [-r * 0.9, 0, r * 0.9]) { ctx.beginPath(); ctx.arc(px, px ? -r * 0.48 : -r * 0.84, r * 0.12, 0, 6.3); ctx.fill(); }
  } else { ctx.arc(0, 0, r * 0.3, 0, 6.3); ctx.fill(); }
  ctx.restore();
}
/** The catalogue's book (SPEC §8.8): a small open book in ink, no word. */
export function bookGlyph(ctx, x, y, s, { colour = ink(0.9) } = {}) {
  const w = s / 2, h = s * 0.36;
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = colour; ctx.lineWidth = Math.max(1, s * 0.07); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.fillStyle = `rgba(${C.paper},.9)`;
  ctx.beginPath(); ctx.moveTo(0, -h * 0.7); ctx.quadraticCurveTo(-w * 0.5, -h * 1.15, -w, -h * 0.8); ctx.lineTo(-w, h * 0.95); ctx.quadraticCurveTo(-w * 0.5, h * 0.6, 0, h); ctx.quadraticCurveTo(w * 0.5, h * 0.6, w, h * 0.95); ctx.lineTo(w, -h * 0.8); ctx.quadraticCurveTo(w * 0.5, -h * 1.15, 0, -h * 0.7); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -h * 0.7); ctx.lineTo(0, h); ctx.stroke();
  ctx.globalAlpha *= 0.55; ctx.lineWidth = Math.max(0.7, s * 0.045);
  ctx.beginPath(); for (const yy of [-0.3, 0.05, 0.4]) { ctx.moveTo(-w * 0.75, h * yy); ctx.lineTo(-w * 0.22, h * yy + h * 0.06); ctx.moveTo(w * 0.22, h * yy + h * 0.06); ctx.lineTo(w * 0.75, h * yy); } ctx.stroke();
  ctx.restore();
}
/** A clam, the shelf's coin, in ink: the price's glyph. */
export function clamGlyph(ctx, x, y, s, { colour = ink(0.9) } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = colour; ctx.lineWidth = Math.max(0.9, s * 0.09); ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-s * 0.5, s * 0.08); ctx.quadraticCurveTo(-s * 0.42, -s * 0.42, 0, -s * 0.42); ctx.quadraticCurveTo(s * 0.42, -s * 0.42, s * 0.5, s * 0.08); ctx.quadraticCurveTo(0, s * 0.5, -s * 0.5, s * 0.08); ctx.closePath();
  ctx.fillStyle = 'rgba(236,212,160,.9)'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, s * 0.3); ctx.lineTo(0, -s * 0.36); ctx.moveTo(0, s * 0.3); ctx.lineTo(-s * 0.26, -s * 0.3); ctx.moveTo(0, s * 0.3); ctx.lineTo(s * 0.26, -s * 0.3); ctx.globalAlpha *= 0.6; ctx.stroke();
  ctx.restore();
}
// a seal's scalloped edge
const sealPath = (ctx, x, y, r) => { ctx.beginPath(); for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2, rr = r * (1 + 0.07 * Math.sin(a * 9)); i ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); };
/**
 * One of the three keys' seals (SPEC §5.5 (f)): `key` map | gear | catch; a hollow ink outline until `held`, then pressed wax with a
 * small tick. The map seal is the legend's wax; the gear seal carries a rod with its tier as pips; the catch seal a fish and
 * `count` ("6/12"), lettered under it with `font`.
 */
export function seal(ctx, key, x, y, r, { held = false, tier = 1, count = null, font = null } = {}) {
  ctx.save();
  sealPath(ctx, x, y, r);
  if (held) {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
    g.addColorStop(0, 'rgb(186,96,128)'); g.addColorStop(1, WAX_DARK);
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = WAX_DARK; ctx.lineWidth = Math.max(0.8, r * 0.08); ctx.stroke();
  } else {
    ctx.fillStyle = `rgba(${C.paper},.55)`; ctx.fill(); ctx.strokeStyle = ink(0.78); ctx.lineWidth = Math.max(0.9, r * 0.085); ctx.setLineDash([r * 0.32, r * 0.16]); ctx.stroke(); ctx.setLineDash([]);
  }
  const fg = held ? 'rgba(250,226,232,.95)' : ink(0.82), lw = Math.max(0.9, r * 0.1);
  ctx.strokeStyle = fg; ctx.fillStyle = fg; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (key === 'map') { // a rolled map's mark: a folded sheet
    ctx.beginPath(); ctx.moveTo(x - r * 0.5, y - r * 0.32); ctx.lineTo(x - r * 0.17, y - r * 0.45); ctx.lineTo(x + r * 0.17, y - r * 0.32); ctx.lineTo(x + r * 0.5, y - r * 0.45);
    ctx.lineTo(x + r * 0.5, y + r * 0.32); ctx.lineTo(x + r * 0.17, y + r * 0.45); ctx.lineTo(x - r * 0.17, y + r * 0.32); ctx.lineTo(x - r * 0.5, y + r * 0.45); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - r * 0.17, y - r * 0.45); ctx.lineTo(x - r * 0.17, y + r * 0.32); ctx.moveTo(x + r * 0.17, y - r * 0.32); ctx.lineTo(x + r * 0.17, y + r * 0.45); ctx.globalAlpha *= 0.6; ctx.stroke(); ctx.globalAlpha /= 0.6;
  } else if (key === 'gear') { // the rod, its tier as pips
    ctx.beginPath(); ctx.moveTo(x - r * 0.5, y + r * 0.42); ctx.lineTo(x + r * 0.45, y - r * 0.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(x - r * 0.24, y + r * 0.16, r * 0.14, 0, 6.3); ctx.stroke();
    const n = Math.max(1, Math.min(6, tier | 0));
    for (let q = 0; q < n; q++) { ctx.beginPath(); ctx.arc(x + r * (0.12 + 0.2 * q - 0.1 * (n - 1)) + r * 0.2, y + r * 0.5, r * 0.07, 0, 6.3); ctx.fill(); }
  } else { // the catch: a fish
    ctx.beginPath(); ctx.moveTo(x - r * 0.55, y); ctx.quadraticCurveTo(x - r * 0.1, y - r * 0.4, x + r * 0.3, y - r * 0.05); ctx.lineTo(x + r * 0.58, y - r * 0.26); ctx.lineTo(x + r * 0.52, y); ctx.lineTo(x + r * 0.58, y + r * 0.26); ctx.lineTo(x + r * 0.3, y + r * 0.05); ctx.quadraticCurveTo(x - r * 0.1, y + r * 0.4, x - r * 0.55, y); ctx.closePath(); ctx.stroke();
  }
  if (held) { // the small tick
    ctx.strokeStyle = 'rgba(255,240,244,.98)'; ctx.lineWidth = Math.max(1, r * 0.11);
    ctx.beginPath(); ctx.moveTo(x + r * 0.42, y - r * 0.78); ctx.lineTo(x + r * 0.58, y - r * 0.6); ctx.lineTo(x + r * 0.9, y - r * 0.98); ctx.stroke();
  }
  if (count && font) { ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = ink(0.88); ctx.fillText(count, x, y + r * 1.12); }
  ctx.restore();
}
/** A mist blot over a place not owned: soft lavender cloud, its edge a few faint ink curls. `seed` keeps each blot its own. */
export function blot(ctx, x, y, r, { seed = 1, alpha = 1 } = {}) {
  const h = (q) => { const s = Math.sin(seed * 12.9898 + q * 78.233) * 43758.5453; return s - Math.floor(s); };
  ctx.save(); ctx.globalAlpha *= alpha;
  for (let q = 0; q < 5; q++) {
    const a = h(q) * 6.3, d = r * 0.32 * h(q + 9), rr = r * (0.55 + 0.25 * h(q + 4));
    const cx = x + Math.cos(a) * d, cy = y + Math.sin(a) * d * 0.7;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
    g.addColorStop(0, `rgba(${MIST},.92)`); g.addColorStop(0.55, `rgba(${MIST},.6)`); g.addColorStop(1, `rgba(${MIST},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, rr * 1.25, rr * 0.85, 0, 0, 6.3); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(104,94,166,.6)'; ctx.lineWidth = 1.1; ctx.lineCap = 'round';
  for (const [dx, dy, s] of [[-0.45, -0.38, 0.42], [0.22, 0.36, 0.5]]) { ctx.beginPath(); ctx.moveTo(x + (dx - s) * r, y + dy * r); ctx.bezierCurveTo(x + (dx - s * 0.4) * r, y + (dy - 0.18) * r, x + (dx + s * 0.4) * r, y + (dy + 0.18) * r, x + (dx + s) * r, y + dy * r); ctx.stroke(); }
  ctx.restore();
}
/**
 * An owned place's small vignette (M1.md §3.3), `s` px across: the Lily Maze's pads with a koi glow, Under the Span's piers and
 * chain, the Buoy Lights' two drowned harbour lights, the Bell Pool's bell under the moon (one nick in its rim per wound); a
 * place the drawing does not know draws its kind's. `alpha` inks it in.
 */
export function placeVignette(ctx, id, kind, x, y, s, { wounds = 0, alpha = 1 } = {}) {
  const u = s / 20, look = PLACE_LOOK[id] || KIND_LOOK[kind] || 'dot';
  ctx.save(); ctx.translate(x, y); ctx.scale(u, u); ctx.globalAlpha *= alpha; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  X = ctx; vg.u = u;
  for (const halo of [true, false]) { vg.halo = halo; PLACE_DRAW[look](Math.max(0, wounds | 0)); }
  X = null; vg.halo = false;
  ctx.restore();
}
const PLACE_LOOK = { lily_maze: 'pads', under_the_span: 'span', buoy_lights: 'buoys', bell_pool: 'bell' };
const KIND_LOOK = { day: 'pads', old: 'span', night: 'buoys', crown: 'bell' };
const PLACE_DRAW = {
  pads() { // notched lily pads, a koi glowing under them
    if (!vg.halo) { const g = X.createRadialGradient(1.5, 1.5, 0, 1.5, 1.5, 7); g.addColorStop(0, 'rgba(255,190,110,.85)'); g.addColorStop(1, 'rgba(255,190,110,0)'); X.fillStyle = g; X.beginPath(); X.arc(1.5, 1.5, 7, 0, 6.3); X.fill(); }
    const pad = (x, y, r, a) => P(() => { X.moveTo(x, y); X.arc(x, y, r, a + 0.35, a + 6.0); X.closePath(); }, LEAF(1), 0.9);
    pad(-4.6, -2.2, 4.1, 0.4); pad(4.4, -3.8, 3.4, 2.4); pad(-1.2, 5.2, 3.6, 4.2); pad(6.2, 4.6, 2.6, 1.2);
    P(() => { X.moveTo(-0.8, 1.2); X.quadraticCurveTo(2, -0.6, 4.2, 1.6); X.quadraticCurveTo(2, 2.8, -0.8, 1.2); X.moveTo(4.2, 1.6); X.lineTo(5.6, 0.6); X.lineTo(5.4, 2.6); X.closePath(); }, 'rgb(240,150,80)', 0.6);
  },
  span() { // the Toppled Bridge: two piers, a broken arch between, its chain hanging from the break
    P(rect(-8.6, -3, 3, 10.4), STONE); P(rect(5.6, -3, 3, 10.4), STONE);
    P(() => { X.moveTo(-5.6, -1.2); X.quadraticCurveTo(-3.2, -6.4, -0.4, -6.2); }, null, 1.6); P(() => { X.moveTo(5.6, -1.2); X.quadraticCurveTo(3.8, -5.6, 2.2, -5.4); }, null, 1.6);
    P(poly([-0.4, -6.2, -0.1, -3.6, -0.5, -1.4, -0.1, 0.8, -0.5, 2.6], false), null, 0.8);
    P(poly([2.2, -5.4, 2.5, -3.4, 2.1, -1.6], false), null, 0.8);
    P(wave(-9.6, 9.6, 8.4, 0.6), null, 0.7, `rgb(${C.water})`);
  },
  buoys() { // two drowned harbour lights burning under the water
    for (const [bx, by] of [[-4.2, 0.6], [4.4, -1.4]]) {
      if (!vg.halo) { const g = X.createRadialGradient(bx, by + 1.4, 0, bx, by + 1.4, 5.2); g.addColorStop(0, 'rgba(255,200,120,.8)'); g.addColorStop(1, 'rgba(255,200,120,0)'); X.fillStyle = g; X.beginPath(); X.arc(bx, by + 1.4, 5.2, 0, 6.3); X.fill(); }
      P(poly([bx, by - 4.6, bx + 1.9, by, bx, by + 1.8, bx - 1.9, by]), 'rgb(240,236,250)', 0.8);
      P(poly([bx, by - 4.6, bx, by - 6.6], false), null, 0.8);
      dot(bx, by - 0.4, 0.9);
    }
    P(wave(-9.6, 9.6, 5.4, 0.6), null, 0.7, `rgb(${C.water})`);
  },
  bell(wounds) { // the harbour bell on the pool's floor, the moon over it; a nick in its rim for each wound
    if (!vg.halo) { X.beginPath(); X.arc(5.4, -7.2, 2.1, 0, 6.3); X.fillStyle = 'rgba(246,242,226,.95)'; X.fill(); X.beginPath(); X.arc(6.3, -7.6, 1.7, 0, 6.3); X.fillStyle = 'rgba(206,196,226,.95)'; X.fill(); }
    P(() => { X.moveTo(-5.6, 5); X.quadraticCurveTo(-5.4, -4.8, 0, -5.2); X.quadraticCurveTo(5.4, -4.8, 5.6, 5); X.closePath(); }, 'rgb(164,132,96)', 1.1);
    P(() => { X.moveTo(-6.8, 5); X.lineTo(6.8, 5); }, null, 1.4);
    P(() => { X.arc(0, -5.6, 1.1, Math.PI, 0); }, null, 0.9);
    dot(0, 6.4, 0.9, INK);
    if (!vg.halo) for (let q = 0; q < Math.min(3, wounds); q++) { // the nicks: small dark notches cut into the rim
      const nx = -4.4 + q * 2.3; X.beginPath(); X.moveTo(nx - 0.55, 5.1); X.lineTo(nx, 3.7); X.lineTo(nx + 0.55, 5.1); X.closePath(); X.fillStyle = `rgb(${C.paper})`; X.fill(); X.strokeStyle = INK; X.lineWidth = 0.5; X.stroke();
    }
    P(wave(-9.6, 9.6, 8.6, 0.6), null, 0.7, `rgb(${C.water})`);
  },
  dot() { dot(0, 0, 2.2, INK); },
};
/** The rolled, sealed sheet of the next water (SPEC §5.4): a sheet rolled at both ends, tied, its legend's wax on the tie. */
export function rolledSheet(ctx, x, y, w, h, { alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const r = h * 0.2;
  ctx.shadowColor = 'rgba(30,20,40,.35)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
  ctx.beginPath(); ctx.moveTo(x - w / 2 + r, y - h / 2); ctx.lineTo(x + w / 2 - r, y - h / 2 + 1); ctx.lineTo(x + w / 2 - r, y + h / 2 - 1); ctx.lineTo(x - w / 2 + r, y + h / 2); ctx.closePath();
  ctx.fillStyle = 'rgb(232,224,214)'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = ink(0.8); ctx.lineWidth = 1; ctx.stroke();
  for (const sx of [-1, 1]) { // the two rolls
    const cx = x + sx * (w / 2 - r);
    ctx.beginPath(); ctx.ellipse(cx, y, r, h / 2 + 1.5, 0, 0, 6.3); ctx.fillStyle = 'rgb(222,212,200)'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx + sx * r * 0.35, y, r * 0.45, h * 0.28, 0, 0, 6.3); ctx.strokeStyle = ink(0.45); ctx.stroke(); ctx.strokeStyle = ink(0.8);
  }
  // a faint wash where its water would be drawn: nothing on it (nothing unowned is drawn)
  ctx.strokeStyle = 'rgba(150,140,200,.35)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(x - w * 0.26, y - h * 0.18); ctx.lineTo(x + w * 0.22, y - h * 0.2); ctx.moveTo(x - w * 0.22, y + h * 0.16); ctx.lineTo(x + w * 0.26, y + h * 0.14); ctx.stroke();
  // the tie and the wax
  ctx.strokeStyle = 'rgba(120,90,70,.9)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x - 2, y - h / 2 - 1); ctx.lineTo(x + 2, y + h / 2 + 1); ctx.stroke();
  sealPath(ctx, x, y, h * 0.3); const g = ctx.createRadialGradient(x - h * 0.08, y - h * 0.1, 1, x, y, h * 0.3); g.addColorStop(0, 'rgb(190,98,132)'); g.addColorStop(1, WAX_DARK); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(250,220,230,.7)'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(x, y, h * 0.16, 0, 6.3); ctx.stroke();
  ctx.restore();
}

// ------------------------------------------------------------------ the game's layout (pure: no canvas)
const rectsMeet = (a, b, g = 0) => a[0] < b[0] + b[2] + g && a[0] + a[2] + g > b[0] && a[1] < b[1] + b[3] + g && a[1] + a[3] + g > b[1];
const around = (x, y, w, h) => [x - w / 2, y - h / 2, w, h];
/** The size of a tap target (CSS px): never under 44 (M1.md §3.4, SPEC §5.5 (f)). */
export const TARGET = 44;

/**
 * Where everything on the game's Chart goes, in CSS px, and its tap targets (M1.md §3.4). Pure: tests call it in node.
 * model: chartModel's. art: {sheets: [{n, box}], live}. view: {w, h, phone, water: {<waterId>: {R, shore, islands, piers, deep,
 * gate, docks}}, sites: {<placeId>: {x, z}}, measure(text, font) → px (optional; a fixed estimate without it), fonts F}.
 * Returns {phone, short, cont: {x, y, w, h, k, view}, cards: [{waterId, x, y, w, h, lake: {cx, cy, s, rect}, name: {x, y, font,
 * text}, book, pin}], places: [{id, kind, owned, price, at, site, leader, size, label, sub}], sealed: {…, trail}, fonts (every
 * font it letters in), targets: [{id, kind, rect, water, place, label, backdrop}]}.
 * On a phone every word is lettered at 16 px or more (M1.md §2.12). A phone sheet too short for the first sheet across the top
 * and the water's lake under it (Safari with its bars: a 390 x 844 iPhone shows about 664 px) narrows the first sheet; the sealed
 * sheet then stands at the water's sheet's left, so its wisp runs straight on from the first sheet's edge.
 */
export const LETTER = Object.freeze({
  phone: Object.freeze({ name: 19, place: 16, sub: 16, price: 16, count: 16, soon: 17 }),
  desk: Object.freeze({ name: 21, place: 15, sub: 14, price: 15, count: 15, soon: 17 }),
});
const SIDE_W = 118, CH_MIN = 120;   // (a short phone: the sealed sheet's column beside the water's sheet; the first sheet's least height)
export function layoutChart(model, art, view) {
  const Wd = Math.max(200, view.w | 0), Ht = Math.max(200, view.h | 0), phone = view.phone ?? Wd < 560;
  const F = view.F || { chart: 'serif', hand: 'cursive', display: 'serif' };
  const fig = F.figure || F.chart;   // the figures (prices, weights, the catch count) in the same court hand, roman (M1.md §3.1)
  const measure = view.measure || ((t, f) => String(t).length * (parseFloat(/(\d+(?:\.\d+)?)px/.exec(f)?.[1] || 13) * 0.5));
  const LS = phone ? LETTER.phone : LETTER.desk;
  const pad = phone ? 4 : 10, gap = phone ? 12 : 22;
  const first = (art?.sheets || [])[0] || { box: [496, 151, 214, 129] };
  const box = first.box, aspect = box[2] / box[3];
  const tutorial = model?.tutorial === true;
  const next = tutorial ? null : model?.next || null;
  const sealedOn = !!(next && next.shipped === false);
  const sheet = (model?.sheets || [])[0] || null;
  const geo = sheet ? view.water?.[sheet.waterId] || null : null;
  const out = { phone, short: false, w: Wd, h: Ht, targets: [], places: [], cards: [], sealed: null, fonts: [] };
  const font = (f) => { if (!out.fonts.includes(f)) out.fonts.push(f); return f; };
  const sealR = phone ? 12 : 13, strip = phone ? { w: 206, h: 64 } : { w: 206, h: 90 };
  const head = LS.name + 16;

  // ---- the first sheet's window: across the top on a phone (narrowed on a short one), the left column on a wide screen
  let cw, side = false;
  const full = Wd - 2 * pad;
  if (phone) {
    cw = full;
    const avail = Ht - pad - gap - pad - 2, natCh = full / aspect;
    const hasPlaces = !!sheet && (sheet.places || []).some((p) => view.sites?.[p.id]);
    const lakeMin = tutorial || !hasPlaces ? 132 : 212;
    if (sheet && avail - natCh - (sealedOn ? strip.h + 6 : 0) - head - 8 < lakeMin) {
      out.short = true; side = sealedOn;
      const want = side ? Math.min(full - 4 - SIDE_W - 12, 236) : lakeMin;
      cw = Math.min(full, clamp(avail - head - 8 - want, CH_MIN, natCh) * aspect);
    }
  } else cw = Math.min(Wd * 0.45, ((Ht - 2 * pad) * 0.66 * box[2]) / box[3]);
  const k = cw / box[2], ch = box[3] * k;
  const cont = { x: phone ? pad + (full - cw) / 2 : pad, y: pad, w: cw, h: ch, k };
  cont.view = { x: box[0], y: box[1], k, ox: cont.x, oy: cont.y };
  out.cont = cont;
  const cx = (x) => cont.x + (x - box[0]) * k, cy = (y) => cont.y + (y - box[1]) * k;

  // ---- each owned water's own sheet, pinned beside its true place
  let card = null;
  if (sheet) {
    if (phone) card = { x: pad + 2 + (side ? SIDE_W : 0), y: cont.y + cont.h + gap, w: full - 4 - (side ? SIDE_W : 0) };
    else card = { x: cont.x + cont.w + gap + 6, y: pad + 2, w: Wd - (cont.x + cont.w + gap + 6) - pad - 2 };
    // (a tall phone keeps a strip under the water's sheet for the sealed sheet, at its lower left)
    card.h = Ht - card.y - pad - 2 - (phone && sealedOn && !side ? strip.h + 6 : 0);
    const nameFont = font(`italic 400 ${LS.name}px ${F.chart}`);
    const lake = { rect: [card.x + 6, card.y + head, card.w - 12, card.h - head - 8] };
    const R = Math.max(10, geo?.Rmax || geo?.R || 60);
    lake.s = Math.min(lake.rect[2], lake.rect[3]) / (2 * R * 1.06);
    lake.cx = lake.rect[0] + lake.rect[2] / 2; lake.cy = lake.rect[1] + lake.rect[3] / 2;
    card.lake = lake;
    const nameW = measure(sheet.name, nameFont);
    card.name = { text: sheet.name, font: nameFont, x: card.x + 16, y: card.y + head / 2 + 2, w: nameW };
    // the catalogue's book beside the name (SPEC §8.8); not in the tutorial, where there is nothing to read but Murk's (M1.md §3.5)
    card.book = tutorial ? null : { x: card.name.x + nameW + 22, y: card.name.y, s: phone ? 20 : 22 };
    card.waterId = sheet.waterId;
    // the pin: the water's mark on the first sheet, and where its short ink stroke meets this sheet
    const at = (art?.live?.waters || []).find((w) => w.water === sheet.waterId)?.at || null;
    if (at) {
      const from = [cx(at[0]), cy(at[1])];
      card.pin = { from, to: phone ? [clamp(from[0], card.x + 14, card.x + card.w - 14), card.y] : [card.x, Math.max(card.y + 14, Math.min(card.y + card.h - 14, from[1]))] };
    }
    out.cards.push(card);
    out.targets.push({ id: `water:${sheet.waterId}`, kind: 'water', water: sheet.waterId, rect: [card.x, card.y + head - 4, card.w, card.h - head], label: sheet.name, backdrop: true });
    if (card.book) out.targets.push({ id: `book:${sheet.waterId}`, kind: 'book', water: sheet.waterId, rect: around(card.book.x, card.book.y, TARGET, TARGET), label: view.words?.book || 'Journal' });

    // ---- its places, at their arena sites; where two would overlap they are pushed apart along the shore with a fine leader
    const T = phone ? 46 : 50, sizeV = phone ? 34 : 40;
    const fixed = [[card.name.x - 4, card.name.y - LS.name / 2 - 4, nameW + 8, LS.name + 8]];
    if (card.book) fixed.unshift(around(card.book.x, card.book.y, TARGET, TARGET));
    const items = [];
    for (const p of sheet.places || []) {
      const site = view.sites?.[p.id];
      if (!site) continue;
      const sx = lake.cx + site.x * lake.s, sy = lake.cy + site.z * lake.s;
      items.push({ id: p.id, kind: p.kind || null, owned: p.owned === true, price: !tutorial && p.owned !== true && Number.isFinite(p.price) ? p.price : null, p, site: [sx, sy], at: [sx, sy], size: sizeV, T });
    }
    const inner = [card.x + T / 2 + 4, card.y + head + T / 2, card.x + card.w - T / 2 - 4, card.y + card.h - T / 2 - 6];
    const need = T + 8;
    for (let it = 0; it < 80; it++) {
      let moved = false;
      for (let a = 0; a < items.length; a++) for (let b = a + 1; b < items.length; b++) {
        const A = items[a], B = items[b];
        let dx = B.at[0] - A.at[0], dy = B.at[1] - A.at[1];
        if (Math.abs(dx) >= need || Math.abs(dy) >= need) continue;   // (square targets: apart on either axis is apart)
        // along the shore: the tangent at their mean bearing from the lake's centre, until they clear on one axis
        const mx = (A.at[0] + B.at[0]) / 2 - lake.cx, my = (A.at[1] + B.at[1]) / 2 - lake.cy, ml = Math.hypot(mx, my) || 1;
        let tx = -my / ml, ty = mx / ml;
        if (tx * dx + ty * dy < 0) { tx = -tx; ty = -ty; }
        if (Math.hypot(dx, dy) < 0.01) { dx = tx; dy = ty; }
        const gapX = Math.abs(tx) > 0.05 ? (need - Math.abs(dx)) / Math.abs(tx) : Infinity, gapY = Math.abs(ty) > 0.05 ? (need - Math.abs(dy)) / Math.abs(ty) : Infinity;
        const push = Math.min(gapX, gapY) / 2 + 0.5;
        A.at[0] -= tx * push; A.at[1] -= ty * push; B.at[0] += tx * push; B.at[1] += ty * push;
        moved = true;
      }
      for (const A of items) {
        A.at[0] = clamp(A.at[0], inner[0], inner[2]); A.at[1] = clamp(A.at[1], inner[1], inner[3]);
        for (const f of fixed) { const r = around(A.at[0], A.at[1], A.T, A.T); if (rectsMeet(r, f, 4)) { A.at[1] = f[1] + f[3] + A.T / 2 + 4; moved = true; } }
      }
      if (!moved) break;
    }
    // the lettering: each place's words where they meet nothing else (under it, else above, beside it), clear of the isles where
    // they can be. On a phone only the chosen place shows its best fish, but every owned place keeps its line's room where it can,
    // so choosing moves no word; only where the chosen place's best fish then finds no room at all (all four owned on a short phone)
    // is the chosen place lettered first (layout.relettered).
    // (the words keep clear of the water's name and of the book as drawn; a place's mark keeps clear of the book's whole target)
    const base = [fixed[fixed.length - 1], ...(card.book ? [around(card.book.x, card.book.y, card.book.s + 4, card.book.s * 0.8 + 4)] : [])];
    for (const A of items) base.push(around(A.at[0], A.at[1], A.size, A.size));
    let placed = base.slice();
    const isles = (geo?.islands || []).map((q) => { const r = Math.max(3, q.r * lake.s) * 1.1; return [lake.cx + q.x * lake.s - r, lake.cy + q.z * lake.s - r * 0.9, 2 * r, 1.8 * r]; });
    const inCard = (q) => q[0] >= card.x + 8 && q[0] + q[2] <= card.x + card.w - 8 && q[1] >= card.y + head - 6 && q[1] + q[3] <= card.y + card.h - 8;
    const free = (q) => inCard(q) && !placed.some((o) => rectsMeet(q, o, 1));
    // the nearest free spot (the spots come nearest first), slid along the line to stay on the sheet; lying on an isle costs it a
    // little, so the words keep by their place rather than wander off to clear water
    const nearest = (spots, bw, bh) => {
      const lo = card.x + 8 + bw / 2, hi = card.x + card.w - 8 - bw / 2;
      let best = null, cost = Infinity;
      spots.forEach((sp, i) => {
        const cxx = lo <= hi ? clamp(sp[0], lo, hi) : sp[0];
        if (Math.abs(cxx - sp[0]) > bw * 0.4) return;
        const q = around(cxx, sp[1], bw, bh);
        if (!free(q)) return;
        const c = i + Math.abs(cxx - sp[0]) / 12 + (isles.some((o) => rectsMeet(q, o, 0)) ? 6 : 0);
        if (c < cost) { cost = c; best = [cxx, sp[1]]; }
      });
      return best ? { at: best, cost } : null;
    };
    const firstFree = (spots, bw, bh) => nearest(spots, bw, bh)?.at || null;
    // the spots round a mark of radius r for a box bw x bh: under it, above it, beside it, at its corners, a little further out each round
    const ring = (x, y, r, bw, bh) => {
      const S = [];
      for (const d of [0, 10, 22, 36]) {
        const below = y + r + 2 + d + bh / 2, above = y - r - 2 - d - bh / 2, right = x + r + 4 + d + bw / 2, left = x - r - 4 - d - bw / 2;
        S.push([x, below], [x, above], [right, y], [left, y], [x + bw * 0.3, below], [x - bw * 0.3, below], [x + bw * 0.3, above], [x - bw * 0.3, above],
          [right, y + r + bh / 2 - 6], [left, y + r + bh / 2 - 6], [right, y - r - bh / 2 + 6], [left, y - r - bh / 2 + 6]);
      }
      return S;
    };
    const bestLine = (A) => { const s = { kind: 'best', speciesId: A.p.best.speciesId, weight: A.p.best.weight, font: font(`400 ${LS.sub}px ${fig}`), px: LS.sub }; s.w = Math.round(Math.round(LS.sub * 0.82) * 1.83) + 6 + measure(typeof view.fmtWeight === 'function' ? view.fmtWeight(s.weight) : '', s.font); return s; };
    const letterPass = (order, final) => { // → {done (the places in the order lettered), ok (no chosen best line short of room)}
      placed = base.slice();
      const done = [];
      let ok = true;
      for (const A of order) {
        delete A.label; delete A.label2; delete A.box; delete A.sub; delete A.fitSub;
        A.leader = Math.hypot(A.at[0] - A.site[0], A.at[1] - A.site[1]) > 5;
        // the ways its words may stand, in order: its name on one line, else stacked on two as a surveyor letters a crowded water; each
        // first with room kept for its best fish under it (an owned place), then without
        const sets = [];
        if (A.owned) {
          const nf = font(`italic 400 ${LS.place}px ${F.chart}`), text = A.p.name || A.id, star = A.p.giantLanded ? 16 : 0;
          const nm = (t, last) => ({ text: t, font: nf, px: LS.place, w: measure(t, nf) + (last ? star : 0) });
          const words = text.split(' ');
          let cut = 0, gapD = Infinity;
          for (let i = 1; i < words.length; i++) { const d = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length); if (d < gapD) { gapD = d; cut = i; } }
          const one = [nm(text, true)], two = cut ? [nm(words.slice(0, cut).join(' '), false), nm(words.slice(cut).join(' '), true)] : null;
          const sub = A.p.best ? bestLine(A) : null, tag = (ls, c) => Object.assign(ls, { cost: c });   // (stacked costs 3; no room kept, 10)
          if (sub) sets.push(tag([...one, sub], 0));
          if (sub && two) sets.push(tag([...two, sub], 3));
          sets.push(tag(one, sub ? 30 : 0));
          if (two) sets.push(tag(two, sub ? 33 : 3));
        } else if (A.price != null) { const pr = { text: String(A.price), font: font(`400 ${LS.price}px ${fig}`), px: LS.price, price: true }; pr.w = measure(pr.text, pr.font) + Math.round(LS.price * 0.78) + 5; sets.push(Object.assign([pr], { cost: 0 })); }
        if (!sets.length) { done.push(A); continue; }
        const [x, y] = A.at, r = A.size / 2;
        // (a place by the west or east shore letters out on the paper first, as a surveyor would, clear of the water)
        const sd = A.site[0] < lake.cx - lake.rect[2] * 0.18 ? -1 : A.site[0] > lake.cx + lake.rect[2] * 0.18 ? 1 : 0;
        const spotsFor = (bw, bh) => [...(sd && !phone ? [[x + sd * (r + 4 + bw / 2), y]] : []), ...ring(x, y, r, bw, bh)];
        const size = (ls) => { const lh = Math.max(...ls.map((l) => l.px)) + 3; return [Math.max(...ls.map((l) => l.w)) + 6, ls.length * lh + 2, lh]; };
        // the words stand nearest their place: a farther spot costs more than stacking the name or keeping no room for the best fish
        let use = null, best = null, bw = 0, bh = 0, lh = 0, cost = Infinity;
        sets.forEach((s) => {
          const [w0, h0, l0] = size(s), nb = nearest(spotsFor(w0, h0), w0, h0), c = nb ? nb.cost + s.cost : Infinity;
          if (c < cost) { cost = c; use = s; best = nb.at; [bw, bh, lh] = [w0, h0, l0]; }
        });
        if (!best) { use = sets[sets.length - 1]; [bw, bh, lh] = size(use); best = spotsFor(bw, bh)[0]; }
        const q = around(best[0], best[1], bw, bh);
        placed.push(q);
        use.forEach((l, i) => { l.x = best[0]; l.y = q[1] + 1 + lh * (i + 0.5); });
        const names = use.filter((l) => l.kind !== 'best'), sub = use.find((l) => l.kind === 'best');
        A.label = { ...names[0] };
        if (names[1]) A.label2 = { ...names[1] };
        A.box = q;
        const show = !phone || model?.pick?.place === A.id;
        if (sub && show) A.sub = sub;
        else if (!sub && A.owned && A.p.best && show) A.fitSub = bestLine(A);   // (no room kept for it: fitted below, moving no word)
        done.push(A);
      }
      // a chosen place whose best fish had no room kept for it: fitted last beside its name, moving no other word
      for (const A of done) {
        if (!A.fitSub) continue;
        const s = A.fitSub, q = A.box, lh = s.px + 3, r = A.size / 2, [x, y] = A.at;
        const spots = [[q[0] + q[2] / 2, q[1] + q[3] + 1.5 + lh / 2], [q[0] + q[2] / 2, q[1] - 1.5 - lh / 2], ...ring(x, y, r, s.w + 6, lh)];
        const fr = firstFree(spots, s.w + 6, lh), sp = fr || spots[0];
        if (!fr) { ok = false; if (final) { delete A.fitSub; continue; } }   // (no room at all: its best fish waits for a roomier sheet)
        placed.push(around(sp[0], sp[1], s.w + 6, lh));
        s.x = sp[0]; s.y = sp[1]; A.sub = s; delete A.fitSub;
      }
      return { done, ok };
    };
    const order = items.slice().sort((a, b) => (b.owned - a.owned) || ((b.price != null) - (a.price != null)));
    const pk = model?.pick?.place;
    let pass = letterPass(order, !pk);
    if (!pass.ok && pk) { pass = letterPass([...order.filter((A) => A.id === pk), ...order.filter((A) => A.id !== pk)], true); out.relettered = true; }
    out.places.push(...pass.done);
    for (const A of items) {
      if (A.owned) out.targets.push({ id: `place:${A.id}`, kind: 'place', water: sheet.waterId, place: A.id, rect: around(A.at[0], A.at[1], A.T, A.T), label: A.p.name || A.id });
      else if (A.price != null) out.targets.push({ id: `buy:${A.id}`, kind: 'buy', water: sheet.waterId, place: A.id, rect: around(A.at[0], A.at[1], A.T, A.T), label: String(A.price) });
    }
  }
  // ---- the sealed sheet: under the first sheet on a wide screen; at the water's sheet's lower left on a tall phone, at its left on a
  // short one; the wisp's trail runs on from the first sheet's edge under the owned road's end (never across another sheet's ground)
  if (sealedOn) {
    const r = sealR, wispAt = art?.live?.wisp ? [cx(art.live.wisp[0]), cont.y + cont.h] : null;
    let x, y, w, h, roll, seals, soon;
    const countFont = font(`400 ${LS.count}px ${fig}`), soonFont = font(`400 ${LS.soon}px ${F.hand}`);
    if (side && card) {
      x = pad + 2; y = card.y; w = SIDE_W - 8; h = Math.min(card.h, 112);
      roll = { x: x + w / 2, y: y + 16, w: 52, h: 24 };
      seals = ['map', 'gear', 'catch'].map((key, i) => ({ key, x: roll.x + (i - 1) * (2 * r + 6), y: roll.y + 32, r }));
      soon = { x: roll.x, y: seals[0].y + r + LS.count + 16, font: soonFont };
    } else {
      w = strip.w; h = strip.h;
      x = phone && card ? card.x + 2 : cont.x + Math.max(0, (cont.w - w) / 2) * 0.35;
      y = phone && card ? card.y + card.h + 6 : Math.min(Ht - pad - h, cont.y + cont.h + gap);
      roll = { x: x + (phone ? 48 : 38), y: y + h * 0.32, w: phone ? 52 : 66, h: phone ? 24 : 30 };
      seals = ['map', 'gear', 'catch'].map((key, i) => ({ key, x: roll.x + roll.w / 2 + 14 + r + i * (2 * r + (phone ? 7 : 9)), y: roll.y, r }));
      soon = phone ? { x: seals[2].x + r + 14, y: roll.y + 1, font: soonFont, align: 'left' } : { x: roll.x + roll.w / 2 + 14 + r * 3 + 9, y: y + h - 16, font: soonFont };
    }
    // the trail: from the first sheet's edge to the rolled sheet's end; on a tall phone it runs on under the water's sheet laid over it
    const trail = wispAt ? { from: wispAt, to: phone ? [roll.x + roll.w / 2 + 3, roll.y] : [roll.x - roll.w / 2 - 4, roll.y], under: phone && !side && card ? card.y + card.h - 3 : null } : null;
    out.sealed = { water: next.waterId, x, y, w, h, roll, seals, soon, countFont, trail, side, wispFrom: wispAt };
    out.targets.push({ id: `sealed:${next.waterId}`, kind: 'sealed', water: next.waterId, rect: [x, y, w, h], label: 'Coming soon' });
  }
  return out;
}

// ------------------------------------------------------------------ the game's drawing
export const deckle = (ctx, x, y, w, h, seed, amp = 1.2) => { // a hand-cut edge: a rectangle whose sides wander a little
  const h1 = (q) => { const s = Math.sin(seed * 31.7 + q * 12.9898) * 43758.5453; return s - Math.floor(s); };
  const pts = [], n = 18;
  for (let i = 0; i < n; i++) pts.push([x + (w * i) / n, y + (h1(i) - 0.5) * amp]);
  for (let i = 0; i < n; i++) pts.push([x + w + (h1(i + 40) - 0.5) * amp, y + (h * i) / n]);
  for (let i = 0; i < n; i++) pts.push([x + w - (w * i) / n, y + h + (h1(i + 80) - 0.5) * amp]);
  for (let i = 0; i < n; i++) pts.push([x + (h1(i + 120) - 0.5) * amp, y + h - (h * i) / n]);
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts) ctx.lineTo(p[0], p[1]); ctx.closePath();
};
/** Lettering the game's Chart records as it draws (the tests read `layout.texts`: names, prices, weights, counts, "Coming soon"). */
function letter(ctx, L, text, x, y, font, { colour = null, align = 'center', alpha = 0.95, reserve = 0.9, dpr = 1, record = true } = {}) {
  const s = String(text);
  if (record) L.texts.push(s);
  ctx.save();
  ctx.font = font;
  const w = ctx.measureText(s).width;
  const xc = align === 'left' ? x + w / 2 : align === 'right' ? x - w / 2 : x;
  inkText(ctx, s, xc, y, font, 0, alpha, colour, { dpr, reserve });
  ctx.restore();
  return w;
}

/**
 * The game's Chart (M1.md §3.3, §3.8): drawChart(ctx2d, model, art, view, t) → its layout (layoutChart's, with `texts`: every
 * word it lettered). art: {sheets: [{n, box, image}], paper: {image}, live: {pieces, waters, home, wisp, edges}}. view: layoutChart's
 * plus {dpr, ink: {sheet: 0..1, places: {id: 0..1}}, reduced, fmtWeight(kg), fishGlyph(speciesId) → canvas | null, words: {soon},
 * pick: {water, place}}. Draws nothing unowned: the first sheet's crop already carries only its own reveal, and the next water
 * is a rolled sheet with nothing on it.
 */
export function drawChart(ctx, model, art, view, t = 0) {
  const L = layoutChart(model, art, view);
  L.texts = [];
  const dpr = view.dpr || 1, Wd = L.w, Ht = L.h, F = view.F || {};
  const inkSheet = view.ink?.sheet == null ? 1 : ease(clamp(view.ink.sheet, 0, 1));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, Wd, Ht);
  // ---- what stands still (the vellum, the first sheet, each water's sheet and its lake) is drawn once and kept (view.cache, the
  // game's: M1.md §2.14, a redraw ≤ 16 ms); what a choice or a purchase changes is drawn over it on every paint
  const cache = inkSheet >= 1 && !view.layers && view.cache ? view.cache : null;
  const key = cache ? baseKey(L, model, art, view, dpr) : null;
  let base = cache ? cache.get(key) : null;
  if (!base && cache) {
    base = cache.canvas(Math.round(Wd * dpr), Math.round(Ht * dpr));
    const g = base.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawBase(g, L, model, art, view, dpr, F, inkSheet, t);
    cache.set(key, base);
  }
  if (base) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(base, 0, 0); ctx.restore(); }
  else drawBase(ctx, L, model, art, view, dpr, F, inkSheet, t);
  for (const card of L.cards) drawCardTop(ctx, L, card, model, view, dpr, F, inkSheet);
  // ---- the next water: a wisp from the owned road to the rolled, sealed sheet; its three seals; "Coming soon"
  if (L.sealed) drawSealed(ctx, L, model, view, dpr, F, inkSheet);
  return L;
}
/** What the kept base depends on: the frame's size and the layout's sheets, the art, what the first sheet shows of the model. */
function baseKey(L, model, art, view, dpr) {
  const r = (v) => Math.round(v * 10) / 10, c = L.cont;
  return JSON.stringify([dpr, L.w, L.h, [c.x, c.y, c.w, c.h].map(r), L.cards.map((k) => [k.waterId, k.x, k.y, k.w, k.h, k.lake.s].map((v) => (typeof v === 'number' ? r(v) : v))),
    L.sealed?.trail ? [L.sealed.trail.from, L.sealed.trail.to, L.sealed.trail.under].flat().map((v) => (v == null ? null : r(v))) : null,
    !!(model?.tutorial || !model?.next), (model?.sheets || []).map((s) => [s.waterId, s.gilded === true]), (art?.sheets || []).map((s) => s.hash || s.n), !!art?.paper?.image, !!view.paperImage]);
}

/** The still part of the Chart: the vellum, the first sheet with its road, marks and stones, the wisp's trail under the water's sheet,
 *  and each water's sheet with its lake. */
function drawBase(ctx, L, model, art, view, dpr, F, inkSheet, t) {
  const Wd = L.w, Ht = L.h;
  // ---- the vellum the sheets are laid on
  ctx.save();
  ctx.shadowColor = 'rgba(4,2,12,.55)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 4;
  deckle(ctx, 3, 3, Wd - 6, Ht - 6, 7, 1.6); ctx.fillStyle = 'rgb(226,220,226)'; ctx.fill();
  ctx.restore();
  ctx.save(); deckle(ctx, 3, 3, Wd - 6, Ht - 6, 7, 1.6); ctx.clip();
  const paper = art?.paper?.image;
  if (paper) { // the bake's own paper, laid over the whole vellum (blurred once at its own size: its mottle is slow, its blocks gone)
    const iw = paper.width, ih = paper.height, sc = Math.max(Wd / iw, Ht / ih);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'low';   // (already soft: the plain filter is enough, and cheap)
    ctx.drawImage(paper, (Wd - iw * sc) / 2, (Ht - ih * sc) / 2, iw * sc, ih * sc);
  }
  // a soft lavender wash, deepest at the top (WORLD.md §10: deepest over the north and over unknown paper)
  const wash = ctx.createLinearGradient(0, 0, 0, Ht); wash.addColorStop(0, 'rgba(176,166,224,.16)'); wash.addColorStop(1, 'rgba(176,166,224,.04)');
  ctx.fillStyle = wash; ctx.fillRect(0, 0, Wd, Ht);
  ctx.restore();

  // ---- the first sheet (view.layers.first false: the paper alone, for the bare-paper test)
  const cont = L.cont, first = view.layers?.first === false ? null : (art?.sheets || [])[0];
  const V = chartView({ ...cont.view, vw: Wd, vh: Ht, dpr });
  const live = view.layers?.first === false ? {} : art?.live || {};
  ctx.save();
  ctx.beginPath(); ctx.rect(cont.x, cont.y, cont.w, cont.h); ctx.clip();
  ctx.globalAlpha = inkSheet;
  if (first?.image) { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(first.image, cont.x, cont.y, cont.w, cont.h); }
  if (live.edges) { sheetEdge(ctx, V, live.edges); V.screenSpace(ctx); }
  if (live.pieces) {
    if (!live.pieces[0]?.pts) prepPieces(live.pieces);
    road(ctx, V, live.pieces, { own: live.pieces.map((_, i) => i), wisp: model?.tutorial || !model?.next ? null : live.wisp, alpha: 1 });
  }
  V.screenSpace(ctx);
  const k = cont.k, vs = clamp(k * 13, 18, 36), u = clamp(4.2 + 1.2 * k, 5.2, 8.5);
  const marks = [];
  if (live.home) marks.push({ n: 0, at: live.home.at, vg: live.home.vg });
  for (const w of live.waters || []) marks.push({ n: w.n, at: w.at, vg: w.vg });
  layoutMarks(V, marks, { fitK: k * 0.6, small: L.phone });
  for (const m of marks) { m.u = u; m.vs = vs; inkVignette(ctx, view.vignettes?.[m.n], m.vx, m.vy, vs); }
  for (const m of marks) { if (m.n === 0) hearth(ctx, m.lx, m.ly, u * 1.15, false); else lantern(ctx, m.lx, m.ly, u, true, false); }
  // the road's stones, arc I, at the Landing's corner, and the plain rose beside them (M1.md §3.3): drawn in the sea, pale on it
  if (live.stones) {
    // one stone for each of the reach's four waters, in road order: inked once its sheet is owned, gold once its legend is landed
    const st = live.stones, sx = V.sx(st.at[0]), sy = V.sy(st.at[1]), ss = clamp(k * 3.4, 6, 11), shs = model?.sheets || [];
    for (let q = 0; q < 4; q++) {
      const tt = (q - 1.5) / 1.5, w = { lit: !!shs[q], gold: shs[q]?.gilded === true };
      stone(ctx, sx + tt * ss * 2.2, sy + 1.4 * (1 - tt * tt) * ss * 0.3, ss, w.lit === true, w.gold === true);
    }
    if (st.rose) compass(ctx, V.sx(st.rose[0]), V.sy(st.rose[1]), clamp(k * 6.5, 10, 18), `rgba(${C.pale},.85)`, { lw: 1 });
  }
  ctx.restore();

  // ---- each owned water's own sheet, pinned beside its true place with a short ink stroke (the wisp's trail laid under it)
  if (L.sealed) { ctx.save(); ctx.globalAlpha = inkSheet; drawTrail(ctx, L, 'under'); ctx.restore(); }
  for (const card of L.cards) drawCardBase(ctx, L, card, view, inkSheet, t);
}

function drawCardBase(ctx, L, card, view, a, t) {
  const geo = view.water?.[card.waterId] || null;
  ctx.save(); ctx.globalAlpha = a;
  // the pin's short ink stroke, from the water's mark on the first sheet to its own sheet
  if (card.pin) {
    const [p, q] = [card.pin.from, card.pin.to];
    ctx.strokeStyle = ink(0.7); ctx.lineWidth = 1; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(p[0], p[1] + 9); ctx.bezierCurveTo(p[0] + (q[0] - p[0]) * 0.35, p[1] + 9 + (q[1] - p[1]) * 0.1, q[0] - (q[0] - p[0]) * 0.25, q[1], q[0], q[1]); ctx.stroke();
  }
  // the sheet: a smaller, paler leaf of the same vellum, laid on with a soft shadow
  ctx.save(); ctx.shadowColor = 'rgba(30,20,48,.38)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
  deckle(ctx, card.x, card.y, card.w, card.h, 3, 1.4); ctx.fillStyle = 'rgb(238,233,230)'; ctx.fill(); ctx.restore();
  ctx.save(); deckle(ctx, card.x, card.y, card.w, card.h, 3, 1.4); ctx.clip();
  const paper = view.paperImage;
  if (paper) { ctx.globalAlpha = a * 0.55; ctx.drawImage(paper, card.x, card.y, card.w, card.h); ctx.globalAlpha = a; }
  ctx.strokeStyle = ink(0.45); ctx.lineWidth = 0.8; ctx.strokeRect(card.x + 5.5, card.y + 5.5, card.w - 11, card.h - 11); // the surveyors' fine neatline
  if (card.pin) { const q = card.pin.to; ctx.beginPath(); ctx.arc(q[0], q[1], 2.6, 0, 6.3); ctx.fillStyle = 'rgb(150,108,60)'; ctx.fill(); ctx.strokeStyle = ink(0.8); ctx.lineWidth = 0.8; ctx.stroke(); }
  if (geo) drawLake(ctx, card.lake, geo, t);
  ctx.restore();
  ctx.restore();
}
/** What a choice or a purchase changes on a water's sheet: its name (underlined when its open water is chosen), the catalogue's book,
 *  its places (their ink-in, their words, the chosen one underlined). */
function drawCardTop(ctx, L, card, model, view, dpr, F, a) {
  ctx.save(); ctx.globalAlpha = a;
  deckle(ctx, card.x, card.y, card.w, card.h, 3, 1.4); ctx.clip();
  // the water's name and the catalogue's book beside it (SPEC §8.8: no word)
  const pick = model?.pick || {};
  // M1 step 5b (lane 5b-home; M1.md §2.5): a water complete is re-inked in gold (chart-gild.js, passed in as view.gild: its name's colour)
  const gilt = view.gild?.(ctx, card, model, a, view);
  const nw = letter(ctx, L, card.name.text, card.name.x, card.name.y, card.name.font, { align: 'left', dpr, reserve: 0.7, colour: gilt });
  if (pick.water === card.waterId && !pick.place) underline(ctx, card.name.x, card.name.y + 12, nw);
  if (card.book) bookGlyph(ctx, card.book.x, card.book.y, card.book.s);
  // the places
  for (const A of L.places) drawPlace(ctx, L, A, pick, view, dpr, F, a);
  ctx.restore();
}
const underline = (ctx, x, y, w) => { // the chosen word underlined in ink, as a pen would: a little uneven
  ctx.save(); ctx.strokeStyle = ink(0.85); ctx.lineWidth = 1.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 2, y + 0.6); ctx.quadraticCurveTo(x + w * 0.5, y - 1.2, x + w + 3, y + 0.8); ctx.stroke(); ctx.restore();
};

function drawLake(ctx, lake, geo, t) {
  const S = lake.s, X0 = lake.cx, Y0 = lake.cy, at = (x, z) => [X0 + x * S, Y0 + z * S];
  const shore = geo.shore || [];
  if (shore.length < 3) return;
  const pathOf = (pts, k = 1) => { ctx.beginPath(); pts.forEach((p, i) => { const q = at(p[0] * k, p[1] * k); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); };
  const n = shore.length, R = geo.Rmax || 60, h1 = (q) => { const s = Math.sin(q * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  // the bank's hachures, falling away from the water: in broken clusters where the bank is steep, each stroke its own length and
  // slant, as a pen lays them (never an even ring of ticks round the shore)
  const steep = (a) => Math.sin(a * 3 + 1.3) * 0.55 + Math.sin(a * 7 + 0.4) * 0.3 + Math.sin(a * 11 + 2.1) * 0.2;
  ctx.save(); ctx.strokeStyle = ink(0.44); ctx.lineCap = 'round';
  const fine = [], bold = [];
  for (let i = 0; i < n * 3; i++) {
    const f = i / 3, i0 = Math.floor(f) % n, i1 = (i0 + 1) % n, u = f - Math.floor(f);
    const px = lerp(shore[i0][0], shore[i1][0], u), pz = lerp(shore[i0][1], shore[i1][1], u);
    const st = steep(Math.atan2(pz, px));
    if (st < 0.08 || h1(i) > 0.3 + st * 0.62) continue;   // a gentle bank bare; gaps inside each cluster
    const r = Math.hypot(px, pz) || 1, nx = px / r, nz = pz / r, sl = (h1(i + 13) - 0.5) * 0.75;
    const len = (2.4 + st * 5.5) * (0.5 + h1(i + 7) * 0.85), dx = nx - nz * sl, dz = nz + nx * sl;
    const a = at(px + nx * 1.2, pz + nz * 1.2), P = h1(i + 21) > 0.62 ? bold : fine;
    P.push(a[0], a[1], a[0] + dx * len, a[1] + dz * len);
  }
  for (const [P, lw] of [[fine, 0.6], [bold, 0.95]]) { ctx.lineWidth = lw; ctx.beginPath(); for (let q = 0; q < P.length; q += 4) { ctx.moveTo(P[q], P[q + 1]); ctx.lineTo(P[q + 2], P[q + 3]); } ctx.stroke(); }
  ctx.restore();
  // the water: a flat violet wash, paler in a band that follows the shore as the bake's lakes are (never a dial's gradient from the
  // middle), a slow mottle, its deep pools darker; one broken pale lining inside the shore
  pathOf(shore);
  ctx.fillStyle = 'rgb(124,120,196)'; ctx.fill();
  ctx.save(); pathOf(shore); ctx.clip();
  const band = Math.max(8, R * S * 0.3);
  ctx.strokeStyle = 'rgba(194,190,240,.075)'; ctx.lineJoin = 'round';   // (many faint strokes, so the band has no step to read as a ring)
  for (let q = 0; q < 16; q++) { ctx.lineWidth = band * 2 * Math.pow(1 - q / 16, 1.4); pathOf(shore); ctx.stroke(); }
  for (let q = 0; q < 7; q++) { // the mottle: broad soft patches, lighter and darker, as the bake's sea carries
    const a = h1(q + 40) * 6.283, d = R * S * 0.62 * Math.sqrt(h1(q + 50)), rr = R * S * (0.22 + 0.2 * h1(q + 60)), c = [X0 + Math.cos(a) * d, Y0 + Math.sin(a) * d];
    const gg = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], rr), col = q % 2 ? '84,78,156' : '176,172,232';
    gg.addColorStop(0, `rgba(${col},.16)`); gg.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = gg; ctx.beginPath(); ctx.ellipse(c[0], c[1], rr * 1.3, rr * 0.8, h1(q + 70) * 3, 0, 6.3); ctx.fill();
  }
  for (const d of geo.deep || []) { const c = at(d.x, d.z), r = d.r * S; const gg = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], r); gg.addColorStop(0, 'rgba(58,52,118,.38)'); gg.addColorStop(1, 'rgba(58,52,118,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, 6.3); ctx.fill(); }
  ctx.restore();
  ctx.save(); ctx.strokeStyle = 'rgba(234,230,252,.55)'; ctx.lineWidth = 0.8; ctx.lineCap = 'round';
  ctx.setLineDash([R * S * 0.5, 5, R * S * 0.18, 9, R * S * 0.34, 4, R * S * 0.1, 12]);
  pathOf(shore, 1 - Math.min(0.08, 3.2 / (R * S))); ctx.stroke();
  ctx.restore();
  // the shore: a feathered under-line, then the pen
  ctx.save(); pathOf(shore); ctx.strokeStyle = ink(0.3); ctx.lineWidth = 2.6; ctx.filter = 'blur(1.6px)'; ctx.stroke(); ctx.restore();
  pathOf(shore); ctx.strokeStyle = ink(0.92); ctx.lineWidth = 1.25; ctx.lineJoin = 'round'; ctx.stroke();
  // the gate: the Moss Sluice's two towers on the north shore, and the Lamp Road leaving by it for the Landing
  if (geo.gate) {
    const c = at(geo.gate.x, geo.gate.z), w = Math.max(3, 2.2 * S);
    ctx.strokeStyle = `rgba(40,24,30,.55)`; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(c[0] + 2, lake.rect[1] - 6); ctx.stroke();
    ctx.strokeStyle = AMBER; ctx.lineWidth = 2; ctx.stroke();
    chevron(ctx, c[0] + 1, (c[1] + lake.rect[1]) / 2, -Math.PI / 2 + 0.05, 6.5);
    for (const sg of [-1, 1]) { ctx.beginPath(); ctx.rect(c[0] + sg * w - 2.2, c[1] - 6, 4.4, 8); ctx.fillStyle = STONE; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.stroke(); }
  }
  // the isles: pale stone in ink, a few ticks for their rock
  for (const isle of geo.islands || []) {
    const c = at(isle.x, isle.z), r = Math.max(3, isle.r * S), seed = isle.x * 7.1 + isle.z * 3.3;
    ctx.beginPath();
    for (let q = 0; q <= 12; q++) { const an = (q / 12) * 6.283, rr = r * (1 + 0.14 * Math.sin(an * 3 + seed) + 0.06 * Math.sin(an * 5 + seed * 0.7)); const px = c[0] + Math.cos(an) * rr, py = c[1] + Math.sin(an) * rr * 0.86; q ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.closePath(); ctx.fillStyle = 'rgb(232,226,222)'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.strokeStyle = ink(0.35); ctx.lineWidth = 0.7; ctx.beginPath();
    for (let q = 0; q < 4; q++) { const ox = c[0] - r * 0.5 + q * r * 0.33; ctx.moveTo(ox, c[1] + r * 0.4); ctx.lineTo(ox + r * 0.25, c[1] - r * 0.2); } ctx.stroke(); ctx.restore();
    if (isle.kind === 'tower') { ctx.beginPath(); ctx.rect(c[0] - 2.2, c[1] - 9, 4.4, 9); ctx.fillStyle = STONE; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.stroke(); ctx.beginPath(); ctx.moveTo(c[0] - 3, c[1] - 9); ctx.lineTo(c[0] + 3, c[1] - 9); ctx.lineWidth = 1.3; ctx.stroke(); }
  }
  // the Toppled Bridge: its piers, and the broken deck between them
  const piers = geo.piers || [];
  if (piers.length > 1) {
    ctx.save(); ctx.strokeStyle = ink(0.75); ctx.lineWidth = 1.1; ctx.setLineDash([5, 3.5]);
    ctx.beginPath(); piers.forEach((p, i) => { const c = at(p.x, p.z); i ? ctx.lineTo(c[0], c[1]) : ctx.moveTo(c[0], c[1]); }); ctx.stroke(); ctx.restore();
    for (const p of piers) { const c = at(p.x, p.z), r = Math.max(2.2, p.r * S * 0.9); ctx.beginPath(); ctx.rect(c[0] - r, c[1] - r, 2 * r, 2 * r); ctx.fillStyle = STONE; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.stroke(); }
  }
  // the docks: a short jetty in the pen, two fine rails from the bank out to the dock, a few planks across, two posts at its end
  for (const d of geo.docks || []) {
    const r = Math.hypot(d.x, d.z) || 1, nx = d.x / r, nz = d.z / r, c = at(d.x, d.z);
    const sr = geo.shoreAt ? geo.shoreAt(Math.atan2(d.z, d.x)) : (geo.Rmax || r + 6), e = at(nx * sr, nz * sr);
    const px = -nz, pz = nx, wd = Math.max(1.1, 0.55 * S);
    ctx.beginPath(); ctx.moveTo(e[0] + px * wd, e[1] + pz * wd); ctx.lineTo(c[0] + px * wd, c[1] + pz * wd); ctx.lineTo(c[0] - px * wd, c[1] - pz * wd); ctx.lineTo(e[0] - px * wd, e[1] - pz * wd); ctx.closePath();
    ctx.fillStyle = 'rgba(214,196,176,.55)'; ctx.fill();
    ctx.strokeStyle = ink(0.8); ctx.lineWidth = 0.7; ctx.lineCap = 'round'; ctx.beginPath();
    for (const o of [-1, 1]) { ctx.moveTo(e[0] + px * wd * o, e[1] + pz * wd * o); ctx.lineTo(c[0] + px * wd * o, c[1] + pz * wd * o); }
    for (const q of [0.3, 0.62, 0.9]) { const m = [lerp(e[0], c[0], q), lerp(e[1], c[1], q)]; ctx.moveTo(m[0] + px * wd, m[1] + pz * wd); ctx.lineTo(m[0] - px * wd, m[1] - pz * wd); }
    ctx.stroke();
    ctx.fillStyle = ink(0.9); for (const o of [-1, 1]) { ctx.beginPath(); ctx.arc(c[0] + px * wd * o * 1.15, c[1] + pz * wd * o * 1.15, Math.max(0.8, 0.32 * S), 0, 6.3); ctx.fill(); }
  }
  // Murk's barge alone at the Jetty (M1.md §3.3; the home barge joins it from step 5): his towering pack and his sage-green lamp
  if (geo.jetty) {
    const c = at(geo.jetty.x, geo.jetty.z), r = Math.hypot(geo.jetty.x, geo.jetty.z) || 1, bx = c[0] - (geo.jetty.x / r) * 12, by = c[1] - (geo.jetty.z / r) * 12;
    ctx.save(); ctx.translate(bx, by);
    ctx.beginPath(); ctx.ellipse(0, 2.4, 7, 2.2, 0, 0, 6.3); ctx.fillStyle = 'rgb(120,134,104)'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-1, 2); ctx.lineTo(-1.4, -6.4); ctx.lineTo(1.2, -8); ctx.lineTo(3.2, -6.2); ctx.lineTo(3, 2); ctx.closePath(); ctx.fillStyle = 'rgb(196,176,150)'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4.6, 2); ctx.lineTo(5.4, -3.2); ctx.stroke();
    ctx.beginPath(); ctx.arc(5.5, -4.2, 1.25, 0, 6.3); ctx.fillStyle = `rgb(${C.sage})`; ctx.fill();
    ctx.restore();
  }
}

function drawPlace(ctx, L, A, pick, view, dpr, F, a) {
  const [x, y] = A.at, s = A.size, inkIn = view.ink?.places?.[A.id];
  const k = inkIn == null ? 1 : ease(clamp(inkIn, 0, 1));
  // a fine ink leader to its site where it was pushed aside
  if (A.leader) {
    ctx.save(); ctx.strokeStyle = ink(0.6); ctx.lineWidth = 0.8; ctx.setLineDash([2.2, 2]);
    const dx = A.site[0] - x, dy = A.site[1] - y, d = Math.hypot(dx, dy) || 1, r0 = s * 0.42;
    ctx.beginPath(); ctx.moveTo(x + (dx / d) * r0, y + (dy / d) * r0); ctx.lineTo(A.site[0], A.site[1]); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(A.site[0], A.site[1], 1.6, 0, 6.3); ctx.fillStyle = ink(0.85); ctx.fill();
    ctx.restore();
  }
  if (!A.owned || k < 1) blot(ctx, x, y, s * 0.62, { seed: A.id.length * 3.7 + A.site[0] * 0.01, alpha: A.owned ? 1 - k : 1 });
  if (A.owned) placeVignette(ctx, A.id, A.kind, x, y, s * (A.kind === 'old' ? 0.82 : 1), { wounds: A.p.wounds || 0, alpha: k });
  // its kind's glyph: in the blot's heart when it is mist, at the vignette's shoulder when owned
  const gs = A.owned ? (L.phone ? 11 : 12.5) : (L.phone ? 14 : 16);
  kindGlyph(ctx, A.kind, A.owned ? x - s * 0.5 : x, A.owned ? y - s * 0.46 : y, gs, { colour: A.owned ? ink(0.85) : 'rgba(70,60,128,.95)', lw: A.owned ? 1.1 : 1.4 });
  // a Marked Fish waits here: a small ink ripple beside it (two broken arcs, never a ring)
  if (A.p.marked) {
    ctx.save(); ctx.strokeStyle = ink(0.7); ctx.lineWidth = 0.9;
    for (const r of [3.2, 6]) { ctx.beginPath(); ctx.ellipse(x + s * 0.5, y + s * 0.18, r * 1.4, r * 0.6, 0, 0.3, 2.5); ctx.stroke(); ctx.beginPath(); ctx.ellipse(x + s * 0.5, y + s * 0.18, r * 1.4, r * 0.6, 0, 3.5, 5.7); ctx.stroke(); }
    ctx.restore();
  }
  if (!A.label) return;
  const lab = A.label;
  const px = lab.px || 13;
  if (lab.price) { // only Murk's three blots carry a price
    ctx.save(); ctx.font = lab.font; const w = ctx.measureText(lab.text).width; ctx.restore();
    const cs = Math.round(px * 0.78), gx = lab.x - (w + cs + 3) / 2 + cs / 2;
    clamGlyph(ctx, gx, lab.y, cs);
    letter(ctx, L, lab.text, gx + cs / 2 + 3, lab.y, lab.font, { align: 'left', dpr, reserve: 0.8 });
    return;
  }
  // its name (stacked on two lines where the water is crowded: the whole name is recorded once), underlined when chosen
  const l2 = A.label2 || null, star = A.p.giantLanded ? 8 : 0;
  if (l2) L.texts.push(A.p.name || `${lab.text} ${l2.text}`);
  const lx = lab.x - (l2 ? 0 : star);
  let w = letter(ctx, L, lab.text, lx, lab.y, lab.font, { dpr, alpha: 0.96 * k, reserve: 0.85, record: !l2 });
  let ex = lx, ey = lab.y;
  if (l2) { ex = l2.x - star; ey = l2.y; const w1 = w; w = letter(ctx, L, l2.text, ex, ey, l2.font, { dpr, alpha: 0.96 * k, reserve: 0.85, record: false }); if (pick.place === A.id) underline(ctx, lx - w1 / 2, lab.y + px * 0.62, w1); }
  if (pick.place === A.id) underline(ctx, ex - w / 2, ey + px * 0.62, w);
  if (A.p.giantLanded) { // its giant landed: a gold star
    const sx = ex + w / 2 + 9, sy = ey - 1;
    ctx.save(); ctx.beginPath(); for (let q = 0; q < 10; q++) { const an = -Math.PI / 2 + (q * Math.PI) / 5, r = q % 2 ? 2.4 : 5.6; ctx.lineTo(sx + Math.cos(an) * r, sy + Math.sin(an) * r); } ctx.closePath();
    ctx.fillStyle = GOLD; ctx.fill(); ctx.strokeStyle = GOLD_INK; ctx.lineWidth = 0.8; ctx.stroke(); ctx.restore();
    L.texts.push('★');
  }
  if (A.sub && A.sub.kind === 'best') { // your best fish there: its glyph and its weight in pounds; never a number else
    const txt = typeof view.fmtWeight === 'function' ? view.fmtWeight(A.sub.weight) : '';
    ctx.save(); ctx.font = A.sub.font; const tw = ctx.measureText(txt).width; ctx.restore();
    const gh = Math.round((A.sub.px || 12) * 0.82), gw = Math.round(gh * 1.83), gx = A.sub.x - (tw + gw + 4) / 2;
    const glyph = typeof view.fishGlyph === 'function' ? view.fishGlyph(A.sub.speciesId) : null;
    if (glyph) { ctx.save(); ctx.globalAlpha *= 0.95; ctx.drawImage(glyph, gx, A.sub.y - gh / 2, gw, gh); ctx.restore(); }
    letter(ctx, L, txt, gx + gw + 4, A.sub.y, A.sub.font, { align: 'left', dpr, alpha: 0.9, reserve: 0.8 });
  }
}

/** The wisp's dotted trail (its part under a laid-on sheet drawn first, so that sheet covers it), and the wisp itself. */
function drawTrail(ctx, L, part) {
  const tr = L.sealed?.trail;
  if (!tr) return;
  const [sx, sy] = tr.from, [ex, ey] = tr.to;
  ctx.save(); ctx.strokeStyle = 'rgba(150,138,214,.65)'; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.setLineDash([1, 5]);
  ctx.beginPath();
  if (tr.under != null) { // (a tall phone: down under the water's sheet, then out from its foot to the rolled sheet's end)
    if (part === 'under') { ctx.moveTo(sx, sy); ctx.lineTo(sx, tr.under + 8); ctx.stroke(); ctx.restore(); return; }
    const by = tr.under;
    ctx.moveTo(sx, by); ctx.bezierCurveTo(sx, by + (ey - by) * 0.7, ex + 26, ey, ex, ey); ctx.stroke(); ctx.restore();
    wisp(ctx, (sx + ex) / 2 + 4, (by + ey) / 2 + 4, 7);
    return;
  }
  if (part === 'under') { ctx.restore(); return; }
  // (it meets the rolled sheet's end from outside: its left end on a wide screen, its right end on a phone)
  if (L.phone) { ctx.moveTo(sx, sy); ctx.bezierCurveTo(sx, sy + (ey - sy) * 0.6, ex + 26, ey, ex, ey); } else { ctx.moveTo(sx, sy); ctx.bezierCurveTo(sx, sy + 26, ex - 30, ey - 4, ex, ey); }
  ctx.stroke(); ctx.restore();
  wisp(ctx, (sx + ex) / 2 + (L.phone ? 0 : 8), (sy + ey) / 2 + (L.phone ? 2 : 6), L.phone ? 7 : 8);
}

function drawSealed(ctx, L, model, view, dpr, F, a) {
  const S = L.sealed, next = model?.next || {}, seals = next.seals || {};
  ctx.save(); ctx.globalAlpha = a;
  // the wisp runs on from the owned road (it leaves the first sheet under the road's end, never across another sheet's ground)
  drawTrail(ctx, L, 'over');
  rolledSheet(ctx, S.roll.x, S.roll.y, S.roll.w, S.roll.h);
  for (const sl of S.seals) {
    const st = seals[sl.key] || {};
    const count = sl.key === 'catch' && Number.isFinite(st.need) ? `${st.have | 0}/${st.need | 0}` : null;
    seal(ctx, sl.key, sl.x, sl.y, sl.r, { held: st.held === true, tier: st.tier || 1, count, font: S.countFont });
    if (count) L.texts.push(count);
  }
  letter(ctx, L, view.words?.soon || 'Coming soon', S.soon.x, S.soon.y, S.soon.font, { dpr, alpha: 0.9, reserve: 0.6, align: S.soon.align || 'center' });
  ctx.restore();
}
