// ui-finds.js — M1 step 5c (lane 5C): the finds on screen (docs/loop/FINDS.md §6.3–§6.5; SPEC §8.2, §8.3, §8.8). Under the loop only.
//
//   pure: findInkPath(id) (the find's 2D outline in a unit box: the card's ink drawing, the hold's glyph, the tally's row, the
//         catalogue's hatched silhouette) · findCardView(entry, D, {full}) · findsRowView(finds, D) (catalogueView's finds half: the
//         row's heading and three rows; the page's only rates, formatted from findShares) · FIND_GLYPHS (the kind stamps and the
//         where-it-goes and effect glyphs, ink SVG)
//   DOM:  drawFindArt(canvas, D, id, {w, h, hatch, gold}) · createFindsView(K) (the card: opens at the show's card for a find, Keep and
//         Let go; the catalogue's finds row; the hold's and the tally's glyphs; the find's own small sounds) · renderFindsRow(K, entry,
//         v) (the catalogue's finds row, ui-screens' renderCataloguePage calls it)
// Every word is TEXT_LOOP's (the finds' names and lines, Keep, Let go, Snags, "1 bite in N"); rates only on the catalogue's finds row.
import { icon } from './ui-icons.js';
import { fmtClams, debugEnabled } from './core.js';
import { HATCH } from './ui-fishart.js';
import { lostLogLines } from './loop-finds.js';   // LOST-TACKLE §6.2: the catalogue's tap shows a found piece's effect lines
import { gradeTargets } from './watercraft.js';

const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const arr = (v) => (Array.isArray(v) ? v : []);
const escH = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const T_ = (D) => D?.TEXT_LOOP || {};
const itemOf = (D, id) => arr(D?.LOOP?.finds?.items).find((x) => x?.id === id) || null;
const nameOf = (D, id) => T_(D).finds?.items?.[id]?.name || '';
const lineOf = (D, id) => T_(D).finds?.items?.[id]?.line || '';

// ------------------------------------------------------------------ the glyphs (ink, currentColor; the hold's, the card's, the row's)
const SV = (d, vb = '0 0 24 24') => `<svg class="gw-fd-glyph" viewBox="${vb}" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</g></svg>`;
export const FIND_GLYPHS = Object.freeze({
  coin: SV('<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="4.6" stroke-width="1"/>'),
  hull: SV('<path d="M3 13h18l-3 5H6z"/><path d="M8 13V8h7l2 5"/><path d="M12 8V5"/>'),
  ribbon: SV('<path d="M12 4c-3 0-4 3-2 5l2 2 2-2c2-2 1-5-2-5z"/><path d="M10 10l-3 10 3-2 2 3M14 10l3 10-3-2-2 3"/>'),
  raft: SV('<path d="M3 15h18M4 12h16M5 18h14"/><path d="M12 12V5l4 3"/>'),
  wick: SV('<path d="M12 4c-1.5 2-2 3-0.5 4.5S13.5 11 12 12"/><path d="M8 21v-6a4 4 0 0 1 8 0v6"/>'),
  barge: SV('<path d="M2 15h20l-2.5 4h-15z"/><path d="M5 15V9h9v6M14 11h4v4"/><path d="M8 9V6h3v3"/>'),
  tin: SV('<rect x="5" y="8" width="14" height="10" rx="2"/><path d="M5 11h14"/>'),
  chalk: SV('<rect x="3.5" y="4.5" width="17" height="12" rx="1.5"/><path d="M7 9h7M7 12.5h4"/><path d="M14.5 20.5l5-3" stroke-width="2.6"/>'),   // a slate and its chalk
  float: SV('<path d="M12 3v5"/><ellipse cx="12" cy="13" rx="4" ry="5"/><path d="M8 13h8"/>'),
  tick: SV('<path d="M5 13l4 4 10-10"/>'),
  // lost tackle (LOST-TACKLE §2.1): the kind stamp (a hook), and where a piece goes: the barge's gear rack, or the chart table
  hook: SV('<circle cx="14.5" cy="4.2" r="1.7"/><path d="M14.5 5.9V14.5a4.2 4.2 0 0 1-8.4 0v-2.6l2.6 2.2"/>'),
  rack: SV('<path d="M4 7.5h16M4 16.5h16"/><path d="M8.5 3.5l.8 17M15.5 3.5l-.8 17"/><path d="M12 9.5v4" stroke-width="2.4"/>'),
  table: SV('<path d="M3 12.5h18M6 12.5V20M18 12.5V20"/><path d="M6.5 10.5l5.5-2.2 5.5 2.2M12 8.3v2.2"/>'),
});
const KIND_GLYPH = { treasure: 'coin', part: 'hull', look: 'ribbon', tackle: 'hook' };
const WHERE_GLYPH = { wick: 'wick', raft: 'raft', barge: 'barge' };
const EFFECT_GLYPH = { bait: 'tin', order: 'chalk', bite: 'float' };
/** The glyph a find's Keep shows: where it goes (a part to the barge; a look to its wearer; lost tackle to the gear rack, a notebook
 *  to the chart table). */
export function whereOf(it) {
  if (it?.kind === 'tackle') return it.slot === 'notebook' ? 'table' : 'rack';
  return it?.kind === 'part' ? 'barge' : WHERE_GLYPH[it?.wearer] || 'barge';
}
const doesOf = (D, id) => (itemOf(D, id)?.kind === 'tackle' ? T_(D).finds?.items?.[id]?.does || '' : '');

// ------------------------------------------------------------------ the find's outline in a unit box (x right, y down; ~[0, 1]²)
/** Trace a find's outline into a 2D context in unit space (the caller scales): its silhouette (fill 'evenodd') and, for the ink drawing,
 *  `detail` strokes inside it. → {aspect (w / h of its box)}. */
export function findInkPath(g, id, { detail = false } = {}) {
  const E = (x, y, rx, ry) => { g.moveTo(x + rx, y); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); };
  const R = (x, y, w, h) => { g.rect(x, y, w, h); };
  switch (id) {
    case 'tin_spoon': R(0.02, 0.46, 0.6, 0.08); E(0.78, 0.48, 0.2, 0.15); if (detail) { g.moveTo(0.62, 0.5); g.lineTo(0.7, 0.5); } return { aspect: 3.2 };
    case 'door_ring': E(0.5, 0.56, 0.4, 0.4); E(0.5, 0.56, 0.3, 0.3); R(0.42, 0.04, 0.16, 0.16); if (detail) { g.moveTo(0.3, 0.3); g.lineTo(0.36, 0.36); } return { aspect: 1 };
    case 'salt_lens': E(0.5, 0.5, 0.46, 0.46); if (detail) { E(0.5, 0.5, 0.38, 0.38); g.moveTo(0.3, 0.32); g.lineTo(0.4, 0.26); } return { aspect: 1 };
    case 'two_headed_coin': E(0.5, 0.5, 0.42, 0.42); if (detail) { E(0.5, 0.5, 0.34, 0.34); E(0.5, 0.46, 0.1, 0.13); g.moveTo(0.38, 0.7); g.quadraticCurveTo(0.5, 0.6, 0.62, 0.7); } return { aspect: 1 };
    case 'toll_purse': E(0.5, 0.6, 0.44, 0.34); g.moveTo(0.2, 0.36); g.quadraticCurveTo(0.5, 0.0, 0.8, 0.36); g.lineTo(0.72, 0.38); g.quadraticCurveTo(0.5, 0.12, 0.28, 0.38); g.closePath(); if (detail) { E(0.42, 0.38, 0.06, 0.04); E(0.56, 0.36, 0.06, 0.04); g.moveTo(0.2, 0.66); g.quadraticCurveTo(0.5, 0.74, 0.8, 0.66); } return { aspect: 1.25 };
    case 'buoy_bell': g.moveTo(0.4, 0.14); g.quadraticCurveTo(0.5, 0.06, 0.6, 0.14); g.quadraticCurveTo(0.66, 0.6, 0.9, 0.8); g.lineTo(0.1, 0.8); g.quadraticCurveTo(0.34, 0.6, 0.4, 0.14); g.closePath(); E(0.5, 0.88, 0.07, 0.07); E(0.5, 0.06, 0.06, 0.05); if (detail) { g.moveTo(0.2, 0.72); g.lineTo(0.8, 0.72); } return { aspect: 1 };
    case 'gate_glass': R(0.1, 0.1, 0.8, 0.8); if (detail) { g.moveTo(0.5, 0.1); g.lineTo(0.5, 0.9); g.moveTo(0.1, 0.5); g.lineTo(0.9, 0.5); } return { aspect: 1.1 };
    case 'moat_bollard': g.moveTo(0.24, 0.92); g.lineTo(0.3, 0.34); g.lineTo(0.16, 0.24); g.quadraticCurveTo(0.5, 0.04, 0.84, 0.24); g.lineTo(0.7, 0.34); g.lineTo(0.76, 0.92); g.closePath(); if (detail) { g.moveTo(0.3, 0.5); g.quadraticCurveTo(0.5, 0.56, 0.7, 0.5); g.moveTo(0.28, 0.24); g.quadraticCurveTo(0.5, 0.16, 0.72, 0.24); } return { aspect: 0.9 };
    case 'rod_tassel': E(0.5, 0.16, 0.12, 0.1); g.moveTo(0.42, 0.22); g.lineTo(0.3, 0.92); g.lineTo(0.7, 0.92); g.lineTo(0.58, 0.22); g.closePath(); if (detail) { for (const x of [0.4, 0.5, 0.6]) { g.moveTo(x, 0.3); g.lineTo(x - 0.02, 0.88); } } return { aspect: 0.6 };
    case 'toll_vane': g.moveTo(0.94, 0.4); g.quadraticCurveTo(0.7, 0.18, 0.36, 0.32); g.lineTo(0.14, 0.16); g.lineTo(0.2, 0.4); g.lineTo(0.14, 0.64); g.lineTo(0.36, 0.48); g.quadraticCurveTo(0.7, 0.62, 0.94, 0.4); g.closePath(); R(0.48, 0.52, 0.04, 0.44); if (detail) { E(0.8, 0.37, 0.025, 0.025); } return { aspect: 1.5 };
    case 'lily_boxes': R(0.04, 0.56, 0.42, 0.34); R(0.54, 0.56, 0.42, 0.34); for (const x of [0.14, 0.25, 0.36, 0.64, 0.75, 0.86]) { g.moveTo(x - 0.06, 0.56); g.lineTo(x, 0.36); g.lineTo(x + 0.06, 0.56); g.closePath(); } return { aspect: 1.8 };
    // lost tackle (LOST-TACKLE §3.1, §4): no two closed shapes overlap (the fill and the hatch's clip are even-odd)
    case 'lamp_pole': R(0.02, 0.44, 0.08, 0.14); R(0.1, 0.47, 0.76, 0.08); E(0.92, 0.36, 0.055, 0.2); E(0.92, 0.36, 0.028, 0.12);
      if (detail) { for (const x of [0.3, 0.55]) { g.moveTo(x, 0.47); g.lineTo(x, 0.55); } g.moveTo(0.86, 0.51); g.lineTo(0.9, 0.55); } return { aspect: 6 };
    case 'belfry_winch': {   // a clock wheel (one toothed outline, its hub open) and its crank's knob
      const cx = 0.42, cy = 0.52, n = 12;
      for (let i = 0; i <= n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, r = i % 2 ? 0.36 : 0.44; const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; if (i) g.lineTo(x, y); else g.moveTo(x, y); }
      g.closePath(); E(cx, cy, 0.09, 0.09); E(0.92, 0.12, 0.06, 0.06);
      if (detail) { E(cx, cy, 0.26, 0.26); g.moveTo(cx + 0.09, cy - 0.06); g.lineTo(0.88, 0.16); } return { aspect: 1.15 };
    }
    case 'ferry_thread': R(0.14, 0.08, 0.6, 0.1); R(0.22, 0.18, 0.44, 0.64); R(0.14, 0.82, 0.6, 0.1); E(0.9, 0.66, 0.07, 0.07);
      if (detail) { for (const y of [0.3, 0.42, 0.54, 0.66]) { g.moveTo(0.24, y); g.lineTo(0.64, y + 0.04); } g.moveTo(0.66, 0.4); g.quadraticCurveTo(0.84, 0.44, 0.9, 0.59); } return { aspect: 1 };
    case 'guard_button': E(0.38, 0.5, 0.34, 0.34); E(0.87, 0.66, 0.1, 0.15); E(0.87, 0.66, 0.055, 0.1);
      if (detail) { E(0.38, 0.5, 0.25, 0.25); g.moveTo(0.28, 0.46); g.quadraticCurveTo(0.38, 0.36, 0.48, 0.46); g.moveTo(0.72, 0.52); g.lineTo(0.8, 0.56); } return { aspect: 1.3 };
    case 'veil_notebook': R(0.08, 0.18, 0.74, 0.74); g.moveTo(0.56, 0.18); g.lineTo(0.64, 0.02); g.lineTo(0.92, 0.08); g.lineTo(0.82, 0.18); g.closePath();
      if (detail) { g.moveTo(0.08, 0.56); g.lineTo(0.82, 0.52); g.moveTo(0.46, 0.18); g.lineTo(0.48, 0.92); g.moveTo(0.82, 0.3); g.quadraticCurveTo(0.86, 0.5, 0.82, 0.7); } return { aspect: 1.1 };
    case 'lily_notebook': R(0.16, 0.06, 0.66, 0.8); g.moveTo(0.6, 0.86); g.lineTo(0.64, 1.0); g.lineTo(0.7, 0.92); g.lineTo(0.74, 0.86); g.closePath();
      if (detail) { g.moveTo(0.49, 0.62); g.quadraticCurveTo(0.36, 0.4, 0.49, 0.26); g.quadraticCurveTo(0.62, 0.4, 0.49, 0.62); g.moveTo(0.49, 0.62); g.quadraticCurveTo(0.32, 0.56, 0.3, 0.42); g.moveTo(0.49, 0.62); g.quadraticCurveTo(0.66, 0.56, 0.68, 0.42); g.moveTo(0.22, 0.06); g.lineTo(0.22, 0.86); } return { aspect: 0.95 };
    // Sporewood's treasures (LAKE 2, lane S): no two closed shapes overlap, as above
    case 'seed_jar': R(0.24, 0.04, 0.52, 0.12); R(0.32, 0.16, 0.36, 0.12); g.moveTo(0.14, 0.4); g.quadraticCurveTo(0.14, 0.28, 0.32, 0.28); g.lineTo(0.68, 0.28); g.quadraticCurveTo(0.86, 0.28, 0.86, 0.4);
      g.lineTo(0.84, 0.88); g.quadraticCurveTo(0.84, 0.96, 0.74, 0.96); g.lineTo(0.26, 0.96); g.quadraticCurveTo(0.16, 0.96, 0.16, 0.88); g.closePath();
      if (detail) { g.moveTo(0.15, 0.58); g.lineTo(0.85, 0.58); g.moveTo(0.15, 0.68); g.lineTo(0.85, 0.68); g.moveTo(0.36, 0.22); g.quadraticCurveTo(0.3, 0.34, 0.24, 0.42); } return { aspect: 0.85 };
    case 'skep_lid': E(0.5, 0.07, 0.06, 0.05); g.moveTo(0.03, 0.9); g.quadraticCurveTo(0.06, 0.14, 0.5, 0.13); g.quadraticCurveTo(0.94, 0.14, 0.97, 0.9); g.closePath();
      if (detail) { for (const [y, w] of [[0.32, 0.3], [0.5, 0.4], [0.68, 0.45], [0.82, 0.46]]) { g.moveTo(0.5 - w, y); g.quadraticCurveTo(0.5, y + 0.06, 0.5 + w, y); } } return { aspect: 1.5 };
    case 'gardeners_trowel': g.moveTo(0.98, 0.5); g.quadraticCurveTo(0.8, 0.1, 0.5, 0.26); g.lineTo(0.5, 0.74); g.quadraticCurveTo(0.8, 0.9, 0.98, 0.5); g.closePath(); R(0.4, 0.44, 0.1, 0.12); R(0.02, 0.38, 0.36, 0.24);
      if (detail) { g.moveTo(0.56, 0.5); g.lineTo(0.9, 0.5); g.moveTo(0.1, 0.42); g.lineTo(0.1, 0.58); } return { aspect: 3 };
    case 'cloche_handle': E(0.5, 0.2, 0.17, 0.17); R(0.42, 0.37, 0.16, 0.13); g.moveTo(0.06, 0.92); g.lineTo(0.2, 0.62); g.lineTo(0.38, 0.5); g.lineTo(0.62, 0.5); g.lineTo(0.8, 0.6); g.lineTo(0.9, 0.78);
      g.lineTo(0.76, 0.72); g.lineTo(0.66, 0.9); g.lineTo(0.5, 0.74); g.lineTo(0.3, 0.86); g.lineTo(0.2, 0.78); g.closePath();
      if (detail) { g.moveTo(0.42, 0.14); g.quadraticCurveTo(0.46, 0.08, 0.54, 0.08); g.moveTo(0.3, 0.62); g.lineTo(0.42, 0.7); } return { aspect: 1 };
    case 'seedkeeper_casket': g.moveTo(0.06, 0.4); g.quadraticCurveTo(0.08, 0.08, 0.5, 0.06); g.quadraticCurveTo(0.92, 0.08, 0.94, 0.4); g.closePath(); R(0.06, 0.44, 0.88, 0.5);
      if (detail) { for (const x of [0.18, 0.5, 0.82]) { g.moveTo(x, 0.1); g.lineTo(x, 0.94); } R(0.46, 0.5, 0.08, 0.14); g.moveTo(0.06, 0.4); g.lineTo(0.94, 0.4); } return { aspect: 1.6 };
    default: E(0.5, 0.5, 0.4, 0.4); return { aspect: 1 };
  }
}
const ASPECT = (id) => { try { return findInkPath({ moveTo() {}, lineTo() {}, ellipse() {}, rect() {}, quadraticCurveTo() {}, closePath() {} }, id).aspect || 1; } catch { return 1; } };
const TINT = { treasure: 'rgba(232, 190, 119, .22)', part: 'rgba(174, 172, 208, .2)', look: 'rgba(210, 150, 174, .2)', tackle: 'rgba(196, 178, 152, .2)' };
/**
 * Draw a find (DOM): its ink drawing (a pale line on its tint, the jackpot gold), or, for one not yet had, its soft hatched silhouette
 * (SPEC §8.8's hatch on the prop's outline: 0.75 px lines 3 px apart at 45°, the edge at 1 px and again at 2 px and 25% ink; gold for
 * the jackpot). Never breaks a screen over an illustration.
 */
export function drawFindArt(canvas, D, id, { w = 116, h = 62, hatch = false, gold = false, pad = 0.12, bold = h <= 30, ink: inkRgb = null } = {}) {
  try {
    const dpr = Math.min(2, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    if (!canvas.style.width) { canvas.style.width = `${w}px`; canvas.style.height = `${h}px`; }
    const g = canvas.getContext('2d');
    if (!g) return canvas;
    g.clearRect(0, 0, canvas.width, canvas.height);
    const a = ASPECT(id), W = canvas.width, H = canvas.height;
    const bh = Math.min(H * (1 - pad * 2), (W * (1 - pad * 2)) / a), bw = bh * a;
    const ox = (W - bw) / 2, oy = (H - bh) / 2;
    // (`ink` [r, g, b]: the Wick's sheet draws a found part on paper in its own ink, SHEET.md §7.3)
    const it = itemOf(D, id), ink = Array.isArray(inkRgb) ? inkRgb : gold ? [232, 190, 119] : hatch ? HATCH.rgb : [236, 235, 246];
    const rgba = (k) => `rgba(${ink[0]}, ${ink[1]}, ${ink[2]}, ${k})`;
    // the outline is laid out in a unit box a wide and 1 tall; a proxy maps it to device px (so every line keeps its own width)
    const X = (x) => ox + x * bw, Y = (y) => oy + y * bh;
    const P = { moveTo: (x, y) => g.moveTo(X(x), Y(y)), lineTo: (x, y) => g.lineTo(X(x), Y(y)), closePath: () => g.closePath(),
      quadraticCurveTo: (a1, b1, x, y) => g.quadraticCurveTo(X(a1), Y(b1), X(x), Y(y)), rect: (x, y, w2, h2) => g.rect(X(x), Y(y), w2 * bw, h2 * bh),
      ellipse: (x, y, rx, ry, r0, a0, a1) => g.ellipse(X(x), Y(y), Math.max(0.01, rx * bw), Math.max(0.01, ry * bh), r0, a0, a1) };
    const path = () => { g.beginPath(); findInkPath(P, id); };
    g.lineJoin = 'round'; g.lineCap = 'round';
    if (hatch) {
      g.save(); path(); g.clip('evenodd');
      g.strokeStyle = rgba(HATCH.ink); g.lineWidth = HATCH.line * dpr;
      const step = HATCH.step * dpr;
      g.beginPath();
      for (let x = -H; x < W + H; x += step) { g.moveTo(x, 0); g.lineTo(x + H, H); }
      g.stroke(); g.restore();
      path(); g.strokeStyle = rgba(HATCH.ink); g.lineWidth = HATCH.edge * dpr; g.stroke();
      path(); g.strokeStyle = rgba(HATCH.haloInk * HATCH.ink); g.lineWidth = HATCH.halo * dpr; g.stroke();
    } else {
      // (a small glyph, the hold's and the tally's, is filled solid in its ink so it reads at 22 px)
      path(); g.fillStyle = bold ? rgba(gold ? 0.85 : 0.7) : gold ? 'rgba(232, 190, 119, .28)' : Array.isArray(inkRgb) ? rgba(0.16) : TINT[it?.kind] || TINT.part; g.fill('evenodd');
      path(); g.strokeStyle = rgba(0.95); g.lineWidth = (bold ? 1.2 : 1.4) * dpr; g.stroke();
      g.beginPath(); findInkPath(P, id, { detail: true }); g.strokeStyle = rgba(0.6); g.lineWidth = 0.9 * dpr; g.stroke();
    }
  } catch { /* never break a screen over an illustration */ }
  return canvas;
}

// ------------------------------------------------------------------ the card (FINDS §6.3)
/** The find card's words and buttons: {id, name, line, does (a lost-tackle piece's one plain line, shown in its line's place; '' for
 *  any other find), kind, gold, stamp (glyph), keep: {label, clams | null, clamsText, glyph | null, disabled}, letGo: {label}}. Keep is
 *  dimmed (no words) when the hold is full, Let go then focused. Pure. */
export function findCardView(entry, D, { full = false } = {}) {
  const id = entry?.find, it = itemOf(D, id), TL = T_(D);
  if (!it) return null;
  const treasure = it.kind === 'treasure', clams = treasure ? Math.max(0, Math.round(num(Number(entry.clams), 0))) : null;
  return { id, name: nameOf(D, id), line: lineOf(D, id), does: doesOf(D, id), kind: it.kind, gold: it.grade === 'jackpot', stamp: KIND_GLYPH[it.kind] || 'coin',
    keep: { label: TL.keep || 'Keep', clams, clamsText: clams != null ? fmtClams(clams) : null, glyph: treasure ? null : whereOf(it), disabled: full === true },
    letGo: { label: TL.letGo || 'Let go' } };
}

// ------------------------------------------------------------------ the catalogue's finds row (FINDS §6.5, SPEC §8.8)
/** catalogueView's finds half from catalogueFor's (loop-finds.findCatalogue): {heading: 'Snags', rate: '1 bite in 20', rows: [{kind,
 *  cards: [{id, kind, had, name ('· · ·' when not had), count ('×3' for a treasure had more than once), rateText (null when owned),
 *  tick, gold, glyph (a part's effect glyph once owned)}]}]}. Pure. */
export function findsRowView(finds, D) {
  if (!isObj(finds) || !isObj(finds.rows)) return null;
  const card = (c) => ({ id: c.id, kind: c.kind, had: c.had === true, name: c.had ? nameOf(D, c.id) || c.name || c.id : '· · ·',
    count: c.kind === 'treasure' && num(c.count, 0) > 1 ? `×${c.count}` : null, rateText: c.tick ? null : c.rateText ?? null,
    tick: c.tick === true, gold: c.gold === true, glyph: c.kind === 'part' && c.tick ? EFFECT_GLYPH[c.effect] || null : null });
  return { heading: finds.heading?.snags || T_(D).finds?.snags || 'Snags', rate: finds.heading?.rate || '',
    rows: ['treasure', 'part', 'look', 'tackle'].filter((k) => k !== 'tackle' || arr(finds.rows[k]).length).map((k) => ({ kind: k, cards: arr(finds.rows[k]).map(card) })) };
}

let styled = false;
function style() {
  if (styled || typeof document === 'undefined') return;
  styled = true;
  const s = document.createElement('style');
  s.id = 'gw-finds-css';
  // the Drowned Filigree's ink on the night page; every target ≥ 44 px, text ≥ 16 px on a phone
  s.textContent = `
.gw-fd-glyph { width: 1.15em; height: 1.15em; vertical-align: -0.2em; }
.gw-p-find { max-width: 420px; text-align: center; }
.gw-p-find .gw-fd-hero { display: flex; justify-content: center; padding: 10px 0 4px; }
.gw-p-find .gw-fd-hero canvas { filter: drop-shadow(0 0 10px rgba(160, 150, 240, .25)); }
.gw-p-find.gw-fd-gold .gw-fd-hero canvas { filter: drop-shadow(0 0 14px rgba(232, 190, 119, .45)); }
.gw-p-find .gw-fd-name { font-size: 22px; margin: 4px 0 2px; color: var(--ink-hi); letter-spacing: .02em; }
.gw-p-find.gw-fd-gold .gw-fd-name { color: var(--gold); }
.gw-p-find .gw-fd-line { font-size: 17px; font-style: italic; color: var(--ink-dim); margin: 2px 12px 8px; }
.gw-p-find .gw-fd-does { font-size: 17px; color: var(--ink-hi); margin: 2px 12px 8px; letter-spacing: .01em; }
.gw-trow.gw-trow--tackle .gw-trow-name b { color: var(--ink-dim); font-weight: 500; }
.gw-p-find .gw-fd-stamp { display: inline-flex; width: 34px; height: 34px; align-items: center; justify-content: center; border: 1.5px solid var(--ink-line); border-radius: 50%; color: var(--ink-dim); margin-bottom: 4px; }
.gw-p-find.gw-fd-gold .gw-fd-stamp { color: var(--gold); border-color: rgba(232, 190, 119, .6); }
.gw-p-find .gw-fd-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.gw-p-find .gw-fd-actions .gw-btn { min-height: 48px; min-width: 120px; font-size: 17px; }
.gw-p-find .gw-fd-actions .gw-btn em { font-style: normal; margin-left: .35em; display: inline-flex; align-items: center; gap: .2em; }
.gw-slot .gw-slot-find { width: 40px; height: 22px; }
.gw-slot.gw-gild .gw-slot-find { filter: drop-shadow(0 0 4px rgba(232, 190, 119, .55)); }
.gw-trow .gw-trow-find { width: 56px; height: 28px; }
.gw-trow .gw-trow-v .gw-fd-glyph { width: 22px; height: 22px; color: var(--ink-dim); }
.gw-cat-finds { margin-top: 14px; scroll-margin-top: 64px; }   /* scrolled to, its heading stops below the catalogue's sticky head band */
.gw-cat-finds .gw-cat-gh b { margin-left: .4em; }
.gw-cat-finds .gw-cat-gh small { margin-left: .6em; color: var(--ink-dim); font-size: 15px; }
.gw-cat-finds .gw-cat-card .gw-cat-rate { font-size: 13px; color: var(--ink-dim); min-height: 16px; display: inline-flex; gap: .3em; align-items: center; }
.gw-cat-finds .gw-cat-card.gw-fd-gold .gw-cat-rate, .gw-cat-finds .gw-cat-card.gw-fd-gold .gw-cat-name { color: var(--gold); }
.gw-cat-finds .gw-cat-card .gw-cat-rate .gw-fd-glyph { width: 15px; height: 15px; }
.gw-cat-finds .gw-fd-big { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px; text-align: center; }
.gw-cat-finds .gw-fd-big p { font-size: 16px; color: var(--ink-dim); font-style: italic; margin: 0; }
.gw-cat-finds .gw-fd-big p.gw-fd-does { font-style: normal; color: var(--ink-hi); }
/* lost tackle's row: three to a row (two on a phone), so its long names ("Lamplighter's") never run into the next card */
.gw-cat-finds .gw-cat-grid[data-row=tackle] { grid-template-columns: repeat(3, minmax(0, 1fr)); }
@media (max-width: 700px) { .gw-cat-finds .gw-cat-grid[data-row=tackle] { grid-template-columns: repeat(2, minmax(0, 1fr)); } .gw-cat-finds { scroll-margin-top: 104px; } .gw-cat-finds .gw-cat-card .gw-cat-rate { font-size: 16px; } .gw-p-find .gw-fd-name { font-size: 20px; } }
`;
  document.head.appendChild(s);
}

/** The catalogue's finds row (DOM), after the places and before Odds ›: the heading "Snags · 1 bite in 20", then the treasures, the
 *  parts and the looks, each a card like a fish's with its rate under it (an owned part or look its tick; a part had its effect glyph).
 *  A tap enlarges it: had, its drawing, name and line; not had, its silhouette and its rate. */
export function renderFindsRow(K, entry, v, { phone = false } = {}) {
  style();
  const h = K.h, D = K.D();
  const sec = h('section', 'gw-cat-group gw-cat-finds');
  sec.dataset.finds = 'mossmere';
  const hd = h('div', 'gw-cat-gh', `<i class="gw-cat-kind" aria-hidden="true">${FIND_GLYPHS.coin}</i><b></b><small></small>`);
  hd.querySelector('b').textContent = v.heading;
  hd.querySelector('small').textContent = v.rate ? `· ${v.rate}` : '';
  sec.appendChild(hd);
  const z = phone ? { w: 100, h: 54 } : { w: 116, h: 62 };
  const big = entry.state.findBig || null;
  for (const row of v.rows) {
    const grid = h('div', 'gw-cat-grid');
    grid.dataset.row = row.kind;
    for (const c of row.cards) {
      const b = h('button', `gw-cat-card gw-cat-find${c.had ? ' gw-caught' : ' gw-hatched'}${c.gold ? ' gw-fd-gold' : ''}`);
      b.type = 'button';
      b.dataset.find = c.id;
      b.setAttribute('aria-label', c.had ? c.name : '· · ·');
      const art = h('span', 'gw-cat-art');
      const cv = h('canvas', 'gw-fishart');
      cv.style.width = `${z.w}px`; cv.style.height = `${z.h}px`;
      drawFindArt(cv, D, c.id, { w: z.w, h: z.h, hatch: !c.had, gold: c.gold });
      art.appendChild(cv); b.appendChild(art);
      b.insertAdjacentHTML('beforeend', `<span class="gw-cat-name"><span></span></span><span class="gw-cat-rate"></span>`);
      b.querySelector('.gw-cat-name > span').textContent = c.count ? `${c.name} ${c.count}` : c.name;
      const rate = b.querySelector('.gw-cat-rate');
      if (c.tick) rate.innerHTML = `${c.glyph ? FIND_GLYPHS[c.glyph] : ''}${FIND_GLYPHS.tick}`;
      else rate.textContent = c.rateText || '';
      b.addEventListener('click', (e) => { e.stopPropagation(); K.sfx?.('ui_click'); entry.state.findBig = entry.state.findBig === c.id ? null : c.id; entry.render(); });
      grid.appendChild(b);
    }
    sec.appendChild(grid);
  }
  if (big) {
    const c = v.rows.flatMap((r) => r.cards).find((x) => x.id === big);
    if (c) {
      const bx = h('div', 'gw-fd-big');
      bx.dataset.find = c.id;
      const cv = h('canvas', 'gw-fishart');
      const bw = phone ? 200 : 240, bh = phone ? 108 : 128;
      cv.style.width = `${bw}px`; cv.style.height = `${bh}px`;
      drawFindArt(cv, D, c.id, { w: bw, h: bh, hatch: !c.had, gold: c.gold });
      bx.appendChild(cv);
      if (c.had) {
        const nm = h('b'); nm.textContent = c.name; bx.appendChild(nm); const p = h('p'); p.textContent = lineOf(D, c.id); bx.appendChild(p);
        // (lost tackle: what it does, in the logs' own words with their numbers, LOST-TACKLE §6.2; the card keeps its one plain line)
        const ls = lostLogLines(D, c.id, { likes: c.id === 'guard_button' ? gradeTargets(c.id, D).length : null });
        for (const t of ls.length ? ls : [doesOf(D, c.id)].filter(Boolean)) { const q = h('p', 'gw-fd-does'); q.textContent = t; bx.appendChild(q); }
      }
      const r = h('span', 'gw-cat-rate');
      if (c.tick) r.innerHTML = FIND_GLYPHS.tick; else r.textContent = c.rateText || '';
      bx.appendChild(r);
      bx.addEventListener('click', (e) => { e.stopPropagation(); entry.state.findBig = null; entry.render(); });
      sec.appendChild(bx);
    }
  }
  return sec;
}

/**
 * The finds' view (under the loop; ui.js builds it beside the loop view): the card opens at the show's card for a find (fishing:found
 * then fishing:show {phase: 'card', uid}); it is the 'catch' modal, so the hold, Home and the logs treat it as the catch card.
 * Keep → loop.keepFind, Let go → loop.letGoFind; the card closes, fishing's endCatch hands the prop back to the water or the creel.
 */
export function createFindsView(K) {
  const { ctx, h } = K;
  const D = () => K.D();
  const report = (w, e) => { try { K.report?.(`finds.${w}`, e); } catch { /* ignore */ } };
  const loop = () => { const l = ctx.progression?.loop; return l && typeof l === 'object' && !l.isStub ? l : null; };
  const audio = (name, o) => { try { return ctx.audio?.play?.(name, o) === true; } catch { return false; } };
  const parts = () => K.screens?.parts || {};
  style();
  let pending = null;   // {entry, at}
  const on = (e, f) => { try { ctx.bus.on(e, (p) => { try { f(p || {}); } catch (err) { report(e, err); } }); } catch (err) { report('on', err); } };
  on('fishing:found', (p) => {
    const entry = isObj(p.entry) ? p.entry : null;
    if (!entry) return;
    pending = { entry, at: (typeof performance !== 'undefined' ? performance.now() : Date.now()), restored: p.restored === true };
    if (pending.restored) return;   // Continue with the card open (progression.restorePendingTrip): no glint; update() reopens the card
    // the reveal's glint: a soft chime, warmer and longer for the jackpot (FINDS §8; the built bright coin until the find's own); lost
    // tackle's own, lower and older (old brass and a dry tock: LOST-TACKLE §2.1)
    if (entry.kind === 'tackle') { if (!audio('tackle_glint', { volume: 0.4 })) audio('coin', { volume: 0.26, pitch: 0.9 }); }
    else if (entry.grade === 'jackpot') { if (!audio('coinBright', { volume: 0.5, pitch: 0.8 })) audio('coin', { volume: 0.5, pitch: 0.7 }); }
    else audio('coin', { volume: 0.28, pitch: 1.35 });
  });
  on('fishing:show', (p) => { if (p.phase === 'card' && pending && (!p.uid || p.uid === pending.entry.uid)) openCard(); });
  on('run:end', () => { pending = null; });
  // the Rust Buoy-Bell rings once as the raft ties up at dawn, and Murk's hand bell answers (FINDS §5.1, §8)
  on('home:enter', (p) => {
    if (p.from !== 'trip' || !(Number(loop()?.finds?.()?.got?.buoy_bell) >= 1)) return;
    audio('merchant_bell', { volume: 0.5, pitch: 0.62 });
    setTimeout(() => audio('merchant_bell', { volume: 0.35, pitch: 1.25 }), 1100);
  });
  // a find never offered by a show (none, or a stuck one) is never dropped by the next cast: its card opens then (its bite is spent)
  on('fishing:state', (p) => { if (p.state === 'casting' && pending && !K.has('catch')) openCard(); });

  function openCard() {
    const pd = pending;
    if (!pd) return;
    pending = null;
    const st = { entry: pd.entry, locked: false };
    try {
      K.openModal('catch', renderCard, { state: st, cls: 'gw-m-center gw-m-find', dismissable: false, onEscape: () => choose('letgo'),
        onKey: (code) => { if (code === 'Digit1' || code === 'Numpad1') { choose('keep'); return true; } if (code === 'Digit2' || code === 'Numpad2') { choose('letgo'); return true; } return false; } });
    } catch (e) { report('open', e); }
  }
  function choose(action) {
    const e = K.entry?.('catch');
    if (!e || !e.state?.entry || e.state.locked) return;
    const L = loop();
    const res = action === 'keep' ? L?.keepFind?.(e.state.entry) : L?.letGoFind?.(e.state.entry);
    if (action === 'keep' && res && res.ok === false) { K.toast?.(res.msg || '', 'bad'); return; }
    e.state.locked = true;
    if (action === 'keep') { const k = e.state.entry.kind; if (!(k === 'tackle' && audio('tackle_knock', { volume: 0.45 }))) audio(k === 'treasure' ? 'coin' : 'creel', { volume: 0.4 }); }
    K.closeModal('catch');
  }
  function renderCard(entry, body) {
    const { panel = null, btn = null } = parts();
    if (!panel || !btn) return;
    const full = loop()?.holdFull?.() === true;
    const v = findCardView(entry.state.entry, D(), { full });
    if (!v) return;
    const { panel: pn, content, foot } = panel(entry, body, { cls: `gw-p-find${v.gold ? ' gw-fd-gold' : ''}`, close: false });
    pn.dataset.loop = 'find';
    pn.dataset.find = v.id;
    const phone = (K.vw || 960) < 700;
    const hero = h('div', 'gw-fd-hero');
    const cv = h('canvas', 'gw-fishart');
    const w = phone ? 220 : 260, hh = phone ? 118 : 140;
    cv.style.width = `${w}px`; cv.style.height = `${hh}px`;
    drawFindArt(cv, D(), v.id, { w, h: hh, gold: v.gold, pad: 0.08 });
    hero.appendChild(cv);
    content.appendChild(hero);
    // (lost tackle: under the name one plain line saying what it does, in the owner's line's place: LOST-TACKLE §2.1, §6.2)
    content.insertAdjacentHTML('beforeend', `<span class="gw-fd-stamp" aria-hidden="true">${FIND_GLYPHS[v.stamp] || ''}</span><h2 class="gw-fd-name"></h2><p class="${v.does ? 'gw-fd-does' : 'gw-fd-line'}"></p>`);
    content.querySelector('.gw-fd-name').textContent = v.name;
    content.querySelector(v.does ? '.gw-fd-does' : '.gw-fd-line').textContent = v.does || v.line;
    foot.classList.add('gw-fd-actions');
    const A = { hooks: false, brush: true };
    const keepLabel = v.keep.clams != null ? `${escH(v.keep.label)} <em>${icon('clam')}<b>${escH(v.keep.clamsText)}</b></em>` : `${escH(v.keep.label)} <em>${FIND_GLYPHS[v.keep.glyph] || ''}</em>`;
    foot.appendChild(btn(keepLabel, { ...A, key: '1', action: 'keep', cls: 'gw-cc-act gw-btn--primary gw-cc-keep', disabled: v.keep.disabled, autofocus: !v.keep.disabled, onClick: () => choose('keep') }));
    foot.appendChild(btn(escH(v.letGo.label), { ...A, key: '2', action: 'letgo', cls: 'gw-cc-act gw-cc-letgo', autofocus: v.keep.disabled, onClick: () => choose('letgo') }));
  }
  // debug builds only (the scenarios): ctx.debug.finds = {force(id, opts), give(ids), take(ids), state(), keep(), letgo(), catalogue()}
  if (debugEnabled()) {
    ctx.debug = ctx.debug || {};
    ctx.debug.finds = {
      force: (id, o = { wait: 1.2 }) => ctx.debug.forceFind?.(id, o) ?? false,
      /** own these finds (fitted or worn), as a tally would have counted them; saved */
      give: (ids = []) => { const L = loop()?.state?.(); if (!L) return null; L.finds = L.finds || { got: {}, worn: {}, share: {} }; for (const id of [].concat(ids)) L.finds.got[id] = Math.max(1, Number(L.finds.got[id]) || 0);
        // (lost tackle, LOST-TACKLE §8: a given found lure is owned as the tally would own it, in meta.loop.lures)
        for (const id of [].concat(ids)) if (K.D?.()?.LOOP?.lostTackle?.[id]?.slot === 'lure') { if (!Array.isArray(L.lures)) L.lures = []; if (!L.lures.includes(id)) L.lures.push(id); }
        try { ctx.game?.save?.(); } catch { /* ignore */ } return { ...L.finds.got }; },
      take: (ids = []) => { const L = loop()?.state?.(); if (!L?.finds) return null; for (const id of [].concat(ids)) delete L.finds.got[id]; return { ...L.finds.got }; },
      state: () => ({ pending: pending ? { ...pending.entry } : null, card: K.has('catch') ? (K.entry('catch')?.state?.entry?.find ?? 'fish') : null, finds: loop()?.finds?.() ?? null,
        hold: (ctx.state?.run?.creel || []).map((f) => f?.find || f?.speciesId), shares: loop()?.findShares?.() ?? null }),
      keep: () => choose('keep'), letgo: () => choose('letgo'),
      catalogue: () => { try { return K.screens?.openJournal?.({ zone: 'mossmere' }) ?? ctx.ui?.openJournal?.({ zone: 'mossmere' }); } catch (e) { report('catalogue', e); return false; } },
    };
  }
  return {
    update() {
      // a restored find (Continue with its card open) reopens once the evening plays and no other screen is up
      if (pending?.restored) { if (ctx.flow === 'playing' && !K.has('catch') && !K.hasBlocking?.()) openCard(); return; }
      // the valve: a find whose show never reached its card (no show in this build, a stuck one) opens its card after 9 s
      if (pending && !K.has('catch') && ((typeof performance !== 'undefined' ? performance.now() : Date.now()) - pending.at) > 9000 && ctx.fishing?.view?.show?.phase !== 'lift') openCard();
    },
    pending: () => (pending ? { ...pending.entry } : null),
    open: openCard,
    choose,
    renderRow: (entry, v, o) => renderFindsRow(K, entry, v, o),
    drawArt: (cv, id, o) => drawFindArt(cv, D(), id, o),
  };
}
