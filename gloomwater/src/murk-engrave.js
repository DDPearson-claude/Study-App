// murk-engrave.js — the engravings of Murk's catalogue (src/ui-catalogue-murk.js): one plate for every item his shelf sells, in one
// engraved hand: an ink line, parallel hatching for the half-tones, cross-hatching for the shadows, a little stipple, a hatched cast
// shadow under each thing; no flat colour, no gradient. Pure strings (node: tools/tests/murk-catalogue.test.mjs), drawn from the game's
// own items (the rod tiers, the line, the reel, the creel, the lures, the tins, the Heartmoss Ball, the raft's parts, the Order Board,
// the Bait Bed, the Long Wall's wing, the barge lights, the three looks, the place maps) and Murk's barge for the frontispiece.
// Ink is currentColor (the page's ink, set by the view's CSS); paper knock-outs are class "cat-pp" (the page's paper).
//
//   engrave(card, {uid})   an item plate (viewBox 200 × 150)
//   plateKey(card)         which drawing a card gets (a slot and its level or id)
//   frontispiece({uid})    Murk's barge at its mooring, lamp lit (the desktop's left page, the phone's cover)
//   ledgerPlate({uid})     the gear log's page: the open ledger and its quill
//   endPlate({uid})        the end leaf: Murk's lamp

const f = (n) => String(Math.round(n * 10) / 10);
const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
function rngOf(str) {
  let s = 2166136261;
  for (const ch of String(str)) { s ^= ch.charCodeAt(0); s = Math.imul(s, 16777619); }
  return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
const x0r = (w, k) => w * k;

// ------------------------------------------------------------------ the engraver's kit
/** A plate: its own pattern ids (uid), its hatching tones, its strokes. → {svg(), …the tools}. */
function plate(uid, W = 200, H = 150, seed = uid) {
  const out = [], rnd = rngOf(seed);
  const id = (k) => `${uid}-${k}`;
  const line = (gap, sw, op = 1) => `<line x1="${f(gap / 2)}" y1="0" x2="${f(gap / 2)}" y2="${f(gap)}" stroke="currentColor" stroke-width="${sw}" stroke-opacity="${op}"/>`;
  const pat = (k, ang, gap, sw, op) => `<pattern id="${id(k)}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(${ang})">${line(gap, sw, op)}</pattern>`;
  const defs = [pat('t1', -38, 3.6, 0.55, 0.9), pat('t2', -38, 2.4, 0.7, 1), pat('t3', 48, 2.5, 0.6, 1), pat('t4', 8, 2.1, 0.5, 1),
    pat('th', 90, 2.7, 0.55, 1), pat('tv', 0, 2.6, 0.55, 1)];
  const P = {
    W, H, rnd, id,
    add: (s) => { out.push(s); return P; },
    /** hatch a shape: tone 1 light, 2 mid, 3 dark (cross-hatched), 4 darkest; or a named pattern ('th' horizontal, 'tv' vertical) */
    shade(d, tone = 2, extra = '') {
      const tones = typeof tone === 'string' ? [tone] : tone <= 1 ? ['t1'] : tone === 2 ? ['t2'] : tone === 3 ? ['t2', 't3'] : ['t2', 't3', 't4'];
      for (const t of tones) out.push(`<path class="cat-hatch" d="${d}" fill="url(#${id(t)})"${extra}/>`);
      return P;
    },
    /** an ink line (width sw) */
    ink(d, sw = 1.3, extra = '') { out.push(`<path d="${d}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`); return P; },
    /** solid ink (small: an eye, a knot, a pupil) */
    solid(d) { out.push(`<path d="${d}" fill="currentColor"/>`); return P; },
    /** paper laid over what is behind (a knock-out) */
    paper(d) { out.push(`<path class="cat-pp" d="${d}"/>`); return P; },
    /** stipple inside an ellipse */
    dots(cx, cy, rx, ry, n, r = 0.55) {
      let s = '';
      for (let i = 0; i < n; i++) { const a = rnd() * Math.PI * 2, k = Math.sqrt(rnd()); s += `<circle cx="${f(cx + Math.cos(a) * rx * k)}" cy="${f(cy + Math.sin(a) * ry * k)}" r="${f(r * (0.6 + rnd() * 0.7))}"/>`; }
      out.push(`<g fill="currentColor">${s}</g>`);
      return P;
    },
    /** the hatched cast shadow a thing throws on the plate (the light from the upper left) */
    ground(cx, cy, rx, ry = rx * 0.16) {
      P.shade(ell(cx + rx * 0.08, cy, rx, ry), 'th', ' opacity=".75"');
      P.ink(`M${f(cx - rx * 0.7)} ${f(cy + ry * 0.95)} h${f(rx * 0.5)} M${f(cx + rx * 0.1)} ${f(cy + ry * 1.05)} h${f(rx * 0.7)}`, 0.6, ' stroke-opacity=".7"');
      return P;
    },
    svg(cls = 'cat-eng') { return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false"><defs>${defs.join('')}</defs>${out.join('')}</svg>`; },
  };
  return P;
}
const ell = (cx, cy, rx, ry) => `M${f(cx - rx)} ${f(cy)} a${f(rx)} ${f(ry)} 0 1 0 ${f(rx * 2)} 0 a${f(rx)} ${f(ry)} 0 1 0 ${f(-rx * 2)} 0Z`;
const rect = (x, y, w, h) => `M${f(x)} ${f(y)}h${f(w)}v${f(h)}h${f(-w)}Z`;
const poly = (pts, close = true) => `M${pts.map((p) => `${f(p[0])} ${f(p[1])}`).join(' L')}${close ? 'Z' : ''}`;
/** a tapered shaft from (x0, y0) to (x1, y1), w0 wide at the start and w1 at the end */
function taper(x0, y0, x1, y1, w0, w1) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  return poly([[x0 + nx * w0 / 2, y0 + ny * w0 / 2], [x1 + nx * w1 / 2, y1 + ny * w1 / 2], [x1 - nx * w1 / 2, y1 - ny * w1 / 2], [x0 - nx * w0 / 2, y0 - ny * w0 / 2]]);
}
/** a point t of the way along a segment, offset o across it */
const along = (x0, y0, x1, y1, t, o = 0) => { const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1; return [x0 + dx * t - (dy / L) * o, y0 + dy * t + (dx / L) * o]; };

// ------------------------------------------------------------------ the tackle
function rod(P, lv) {
  const [x0, y0, x1, y1] = [26, 132, 188, 18];
  P.ground(100, 136, 78, 6);
  // the line from the tip, falling in a long curve to the hook
  P.ink(`M${x1} ${y1} C${x1 + 6} 48 ${x1 - 6} 86 ${x1 - 14} 104`, 0.7);
  P.ink(`M${x1 - 14} 104 v6 a3.2 3.2 0 0 1 -6.4 0 v-1.6`, 1);
  // the blank, tapering to the tip
  const blank = taper(x0, y0, x1, y1, 5.6, 1.3);
  P.paper(blank).shade(taper(...along(x0, y0, x1, y1, 0, 1.2), ...along(x0, y0, x1, y1, 1, 0.4), 2.6, 0.5), 2).ink(blank, 1.1);
  // the grip: cork rings (Ashwood plain, the later tiers wrapped and capped)
  const g0 = along(x0, y0, x1, y1, 0.02), g1 = along(x0, y0, x1, y1, 0.26);
  const grip = taper(g0[0], g0[1], g1[0], g1[1], 9.5, 8);
  P.paper(grip).shade(grip, lv >= 2 ? 3 : 2).ink(grip, 1.3);
  for (let i = 1; i < 9; i++) { const a = along(x0, y0, x1, y1, 0.02 + i * 0.026, -5), b = along(x0, y0, x1, y1, 0.02 + i * 0.026, 5); P.ink(`M${f(a[0])} ${f(a[1])} L${f(b[0])} ${f(b[1])}`, 0.55); }
  // the butt cap and the reel seat
  const c = along(x0, y0, x1, y1, 0.0);
  P.paper(ell(c[0], c[1], 5.6, 5.6)).shade(ell(c[0], c[1], 5.6, 5.6), 3).ink(ell(c[0], c[1], 5.6, 5.6), 1.2);
  const s0 = along(x0, y0, x1, y1, 0.3);
  P.ink(ell(s0[0], s0[1], 4.2, 4.2), 1.1);
  // a small reel hung under the seat, its drum hatched, its handle out
  const r0 = along(x0, y0, x1, y1, 0.31, 10);
  P.ink(`M${f(s0[0])} ${f(s0[1])} L${f(r0[0])} ${f(r0[1])}`, 1.6);
  P.paper(ell(r0[0], r0[1] + 3, 9, 9)).shade(`M${f(r0[0] + 1)} ${f(r0[1] - 6)} A9 9 0 0 1 ${f(r0[0] + 1)} ${f(r0[1] + 12)} A5 9 0 0 0 ${f(r0[0] + 1)} ${f(r0[1] - 6)}Z`, 3).ink(ell(r0[0], r0[1] + 3, 9, 9), 1.2).solid(ell(r0[0], r0[1] + 3, 1.6, 1.6));
  P.ink(`M${f(r0[0])} ${f(r0[1] + 3)} l7 5`, 1.3).ink(ell(r0[0] + 8, r0[1] + 9, 2, 2), 1);
  // the guides, more of them on the better rods; the silk whippings beside each
  const n = 4 + Math.min(3, lv);
  for (let i = 0; i < n; i++) {
    const t = 0.38 + (i / n) * 0.58, a = along(x0, y0, x1, y1, t, 0), b = along(x0, y0, x1, y1, t, 5 - t * 2.4);
    P.ink(`M${f(a[0])} ${f(a[1])} L${f(b[0])} ${f(b[1])}`, 0.9).ink(ell(b[0], b[1], 1.7 - t * 0.6, 1.7 - t * 0.6), 0.8);
    if (lv >= 2) { const w0 = along(x0, y0, x1, y1, t - 0.012, -2.4), w1 = along(x0, y0, x1, y1, t - 0.012, 2.4); P.ink(`M${f(w0[0])} ${f(w0[1])} L${f(w1[0])} ${f(w1[1])}`, 1.4); }
  }
  // the third tier: a carved ring of filigree at the ferrule
  if (lv >= 3) { const m = along(x0, y0, x1, y1, 0.5); P.ink(`M${f(m[0] - 7)} ${f(m[1] + 6)} c4 -8 10 -8 12 -2 c1 4 -4 6 -6 3`, 0.9).ink(ell(m[0], m[1], 3.4, 3.4), 1.1); }
  return P;
}
function lineSpool(P, lv) {
  P.ground(100, 132, 60, 7);
  // a wooden spool seen three-quarter on: two flanges, the wound line between them
  const cx = 92, top = 46, bot = 118, rx = 40, ry = 12;
  P.paper(`M${cx - rx} ${top} L${cx - rx} ${bot} A${rx} ${ry} 0 0 0 ${cx + rx} ${bot} L${cx + rx} ${top}Z`);
  // the wound line: contour lines following the drum, denser to the right (the shadow side)
  for (let i = 0; i < 26; i++) {
    const y = top + 8 + i * 2.6;
    P.ink(`M${cx - rx + 4} ${f(y)} A${rx - 4} ${ry - 3} 0 0 0 ${cx + rx - 4} ${f(y)}`, 0.5, ` stroke-opacity="${(0.55 + (i % 2) * 0.3).toFixed(2)}"`);
  }
  P.shade(`M${cx + 10} ${top + 6} L${cx + rx - 4} ${top + 6} L${cx + rx - 4} ${bot - 2} L${cx + 14} ${bot + 8}Z`, 3, ' opacity=".8"');
  // the flanges
  for (const y of [top, bot]) { P.paper(ell(cx, y, rx + 8, ry + 2)).shade(ell(cx, y, rx + 8, ry + 2), y === top ? 1 : 2).ink(ell(cx, y, rx + 8, ry + 2), 1.3).ink(ell(cx, y, 8, 3), 1); }
  P.ink(`M${cx - rx - 8} ${bot} v4 A${rx + 8} ${ry + 2} 0 0 0 ${cx + rx + 8} ${bot + 4} v-4`, 1.2);
  P.solid(ell(cx, top, 3, 1.2));
  // the free end: a loop of line out to a small hook
  P.ink(`M${cx + rx - 2} ${top + 30} C${cx + 70} ${top + 20} ${cx + 82} ${top + 60} ${cx + 64} ${top + 70} C${cx + 50} ${top + 76} ${cx + 52} ${top + 92} ${cx + 74} ${top + 94}`, 0.8);
  P.ink(`M${cx + 74} ${top + 94} v6 a3.4 3.4 0 0 1 -6.8 0 v-1.6`, 1);
  // the tier's bands on the flange (one, two, three)
  for (let i = 0; i < Math.max(1, lv); i++) P.ink(`M${cx - 30 + i * 6} ${top - 9} l3 18`, 1.3);
  return P;
}
function reel(P, lv) {
  P.ground(100, 134, 56, 7);
  const cx = 96, cy = 72, R = 46;
  // the foot under the reel
  P.paper(rect(cx - 30, cy + R - 4, 60, 9)).shade(rect(cx - 30, cy + R - 4, 60, 9), 3).ink(rect(cx - 30, cy + R - 4, 60, 9), 1.1);
  // the back plate's rim seen edge-on to the right (depth), then the face
  P.paper(ell(cx + 6, cy, R, R)).shade(ell(cx + 6, cy, R, R), 4).ink(ell(cx + 6, cy, R, R), 1.2);
  P.paper(ell(cx, cy, R, R)).ink(ell(cx, cy, R, R), 1.5).ink(ell(cx, cy, R - 5, R - 5), 0.8);
  // the face's half-tone: a crescent of shadow on the right, the light on the left left clean
  P.shade(`M${cx + 6} ${cy - R + 2} A${R - 2} ${R - 2} 0 0 1 ${cx + 6} ${cy + R - 2} A${R * 0.7} ${R - 6} 0 0 0 ${cx + 6} ${cy - R + 2}Z`, 2);
  // the spokes and the hub
  const n = lv >= 2 ? 6 : 4;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + 0.3, x = cx + Math.cos(a) * (R - 6), y = cy + Math.sin(a) * (R - 6);
    P.ink(`M${f(cx + Math.cos(a) * 9)} ${f(cy + Math.sin(a) * 9)} L${f(x)} ${f(y)}`, 2.6).ink(`M${f(cx + Math.cos(a) * 9)} ${f(cy + Math.sin(a) * 9)} L${f(x)} ${f(y)}`, 0.8, ' class="cat-pp-stroke"');
  }
  P.paper(ell(cx, cy, 9, 9)).shade(ell(cx, cy, 9, 9), 3).ink(ell(cx, cy, 9, 9), 1.3).solid(ell(cx, cy, 2.2, 2.2));
  // the handle and its knob
  const hx = cx + Math.cos(-0.9) * (R - 14), hy = cy + Math.sin(-0.9) * (R - 14);
  P.ink(`M${cx} ${cy} L${f(hx)} ${f(hy)}`, 3).paper(ell(hx, hy - 1, 6, 9)).shade(ell(hx + 1, hy, 5, 8), 2).ink(ell(hx, hy - 1, 6, 9), 1.2);
  // brass rings on the better reels: a fine engraved border
  if (lv >= 2) P.ink(ell(cx, cy, R - 9, R - 9), 0.6, ' stroke-dasharray="1.4 2.2"');
  if (lv >= 3) P.ink(ell(cx, cy, R + 3, R + 3), 0.6, ' stroke-dasharray="3 1.6"');
  // the line's end off the drum
  P.ink(`M${cx - R + 3} ${cy - 10} C${cx - R - 20} ${cy - 30} ${cx - R - 10} ${cy - 50} ${cx - R - 26} ${cy - 56}`, 0.7);
  return P;
}
function creel(P, slots) {
  P.ground(100, 134, 70, 8);
  const x0 = 38, x1 = 162, top = 58, bot = 128, inset = 8;
  const body = poly([[x0, top], [x1, top], [x1 - inset, bot], [x0 + inset, bot]]);
  P.paper(body);
  // the wicker: rows of short woven strokes, alternating, with the shade side cross-hatched
  for (let r = 0; r < 9; r++) {
    const y = top + 5 + r * 7.6, k = r / 9, xa = x0 + inset * k + 3, xb = x1 - inset * k - 3;
    for (let x = xa + (r % 2) * 5; x < xb - 6; x += 10) P.ink(`M${f(x)} ${f(y)} q5 -2.6 9 0`, 0.75);
  }
  for (let c = 0; c < 8; c++) { const t = c / 7; P.ink(`M${f(x0 + 4 + t * (x1 - x0 - 8))} ${top + 2} L${f(x0 + inset + 2 + t * (x1 - x0 - 2 * inset - 4))} ${bot - 2}`, 0.45, ' stroke-opacity=".7"'); }
  P.shade(poly([[x1 - 30, top], [x1, top], [x1 - inset, bot], [x1 - inset - 32, bot]]), 3, ' opacity=".85"');
  P.ink(body, 1.4);
  // a double creel: two compartments and two lids
  const lids = slots >= 5 ? 2 : 1;
  if (lids === 2) P.ink(`M100 ${top} L100 ${bot}`, 1.6);
  for (let i = 0; i < lids; i++) {
    const a = lids === 2 ? (i ? 100 : x0) : x0, b = lids === 2 ? (i ? x1 : 100) : x1;
    const lid = `M${a - 3} ${top} C${a - 2} ${top - 12} ${b + 2} ${top - 12} ${b + 3} ${top} Z`;
    P.paper(lid).shade(lid, 1).ink(lid, 1.3);
    P.ink(ell((a + b) / 2, top - 5, 6, 2.6), 1);   // the fish hole
  }
  // the strap and its buckle
  P.ink(`M${x0 + 4} ${top + 4} C${x0 - 22} 10 ${x1 + 22} 10 ${x1 - 4} ${top + 4}`, 2.4).ink(`M${x0 + 4} ${top + 4} C${x0 - 22} 10 ${x1 + 22} 10 ${x1 - 4} ${top + 4}`, 0.7, ' class="cat-pp-stroke"');
  P.ink(rect(x1 - 12, top + 10, 8, 10), 1.1);
  // Hold 6: a third strap round the girth
  if (slots >= 6) P.ink(`M${x0 + 2} ${top + 30} L${x1 - 2} ${top + 30}`, 2.2);
  return P;
}
// the lures
function lureFly(P) {
  P.ground(100, 132, 40, 5);
  P.ink('M66 70 L132 70 C150 70 152 100 132 104 C118 106 112 96 114 88', 1.8);   // the hook's shank and bend
  P.ink('M114 88 l-5 4', 1.6);
  P.ink(ell(62, 70, 4, 4), 1.4);
  // the hackle: a ruff of fine fibres, the wing laid back over the shank
  for (let i = 0; i < 30; i++) { const a = -Math.PI * 0.95 + (i / 29) * Math.PI * 1.9, r = 15 + (i % 3) * 3; P.ink(`M76 70 l${f(Math.cos(a) * r)} ${f(Math.sin(a) * r)}`, 0.5); }
  const wing = 'M78 66 C96 40 128 42 142 56 C126 54 104 58 82 70Z';
  P.paper(wing).shade(wing, 2).ink(wing, 1.1);
  for (let i = 0; i < 6; i++) P.ink(`M${84 + i * 8} ${66 - i * 1.5} q8 -6 16 -8`, 0.5);
  P.shade('M80 72 C96 74 116 74 126 72 L124 80 C110 82 94 80 80 76Z', 3).ink('M80 72 C96 74 116 74 126 72 L124 80 C110 82 94 80 80 76Z', 1);
  return P;
}
function lureSpoon(P) {
  P.ground(100, 134, 46, 5);
  const spoon = 'M58 40 C80 26 132 44 146 84 C156 112 128 126 108 112 C86 96 46 66 58 40Z';
  P.paper(spoon);
  P.shade('M100 52 C124 62 142 82 146 92 C150 112 128 122 112 110 C120 104 124 86 100 52Z', 3);
  P.shade(spoon, 1).ink(spoon, 1.6);
  P.ink('M70 44 C84 40 108 52 120 70', 0.9, ' stroke-opacity=".8"');   // the glint, left clean
  P.ink(ell(56, 38, 4, 4), 1.3).ink('M52 34 l-6 -8', 1.2).ink(ell(44, 23, 4, 4), 1.2);   // the split ring and swivel
  // the treble at the tail
  P.ink('M142 108 l10 12', 1.4);
  for (const a of [-0.5, 0.3, 1.1]) P.ink(`M152 120 c${f(Math.cos(a) * 10)} ${f(10 + Math.sin(a) * 3)} ${f(Math.cos(a) * 14 + 4)} ${f(Math.sin(a) * 4 + 2)} ${f(Math.cos(a) * 9 + 2)} ${f(Math.sin(a) * 2 - 3)}`, 1.1);
  return P;
}
function lureJig(P) {
  P.ground(100, 132, 50, 5);
  // the carved bone body: a tapering ridged shape behind a round lead head
  const body = 'M84 68 C110 58 146 62 164 76 C146 84 112 90 84 82Z';
  P.paper(body).shade(body, 1).ink(body, 1.3);
  for (let i = 0; i < 7; i++) P.ink(`M${96 + i * 9} ${64 + i * 0.4} q3 8 0 18`, 0.7);
  P.shade('M100 78 C124 82 148 80 164 76 C146 86 112 90 92 82Z', 3);
  P.paper(ell(74, 74, 15, 15)).shade(ell(78, 78, 11, 11), 3).ink(ell(74, 74, 15, 15), 1.5);
  P.ink(ell(70, 70, 3.4, 3.4), 1.2).solid(ell(70, 70, 1.4, 1.4));   // its eye
  P.ink('M62 66 l-12 -12', 1.4).ink(ell(47, 51, 3.4, 3.4), 1.2);
  P.ink('M80 86 C80 112 112 116 116 98 l-5 3', 1.8);   // the hook out of the head
  return P;
}
function lureBell(P) {
  P.ground(100, 134, 50, 5);
  P.ink('M40 60 L150 60', 1.2).ink(ell(36, 60, 4, 4), 1.2);   // the wire shaft and its eye
  // the blade on its clevis, turned as it spins
  const blade = 'M60 60 C66 36 96 30 104 44 C108 54 90 64 60 60Z';
  P.paper(blade).shade(blade, 2).shade('M70 58 C84 58 100 54 104 44 C108 54 90 64 70 60Z', 3).ink(blade, 1.4);
  // the little harbour bell, hung under the shaft
  const bell = 'M112 64 C112 70 108 92 100 100 L140 100 C132 92 128 70 128 64 C128 58 112 58 112 64Z';
  P.paper(bell).shade(bell, 1).shade('M122 62 C128 64 130 86 140 100 L124 100 C126 88 124 72 122 62Z', 3).ink(bell, 1.4);
  P.ink(ell(120, 102, 4, 3), 1.2).ink('M100 100 L140 100', 1.6).ink(ell(120, 58, 3, 3), 1);
  // the beads and the treble
  for (const x of [134, 141]) P.paper(ell(x, 60, 3.4, 3.4)).shade(ell(x, 60, 3.4, 3.4), 3).ink(ell(x, 60, 3.4, 3.4), 1);
  P.ink('M150 60 l10 6', 1.4);
  for (const a of [-0.6, 0.4, 1.2]) P.ink(`M160 66 c${f(Math.cos(a) * 9)} ${f(9 + Math.sin(a) * 2)} ${f(Math.cos(a) * 12 + 4)} ${f(Math.sin(a) * 3 + 2)} ${f(Math.cos(a) * 8 + 2)} ${f(Math.sin(a) * 2 - 3)}`, 1.1);
  return P;
}
// the bait
function tin(P, kind) {
  P.ground(98, 132, 62, 8);
  const cx = 92, top = 74, bot = 120, rx = 46, ry = 14;
  const side = `M${cx - rx} ${top} L${cx - rx} ${bot} A${rx} ${ry} 0 0 0 ${cx + rx} ${bot} L${cx + rx} ${top}Z`;
  P.paper(side).shade(`M${cx + 8} ${top} L${cx + rx} ${top} L${cx + rx} ${bot} A${rx} ${ry} 0 0 1 ${cx + 14} ${bot + ry - 1}Z`, 3).ink(side, 1.4);
  // the label band: an engraved cartouche, no words
  P.ink(`M${cx - rx} ${top + 14} A${rx} ${ry} 0 0 0 ${cx + rx} ${top + 14} M${cx - rx} ${top + 34} A${rx} ${ry} 0 0 0 ${cx + rx} ${top + 34}`, 0.9);
  P.ink(`M${cx - 24} ${top + 34} c4 -10 12 -12 24 -12 s20 2 24 12`, 0.8).ink(`M${cx - 10} ${top + 28} c4 -4 16 -4 20 0`, 0.7);
  // the rim, open: the bait inside
  P.paper(ell(cx, top, rx, ry)).ink(ell(cx, top, rx, ry), 1.4).ink(ell(cx, top, rx - 4, ry - 3), 0.8);
  if (kind === 'worm') {
    P.shade(ell(cx, top + 1, rx - 5, ry - 4), 3, ' opacity=".7"');
    for (const [x, y, s] of [[cx - 20, top - 2, 1], [cx + 4, top - 6, -1], [cx + 22, top, 1]]) {
      const d = `M${x} ${y} c${6 * s} -16 ${18 * s} -18 ${20 * s} -6 c${2 * s} 10 ${-10 * s} 10 ${-6 * s} 20`;
      P.ink(d, 4.2).ink(d, 2.2, ' class="cat-pp-stroke"');
      for (let i = 0; i < 4; i++) P.ink(`M${f(x + s * (3 + i * 4))} ${f(y - 8 - i * 2)} l${2 * s} 2`, 0.6);
    }
    // the lid leaning on the tin
    P.paper(ell(cx + 66, top + 30, 12, 34)).shade(ell(cx + 68, top + 30, 9, 30), 2).ink(ell(cx + 66, top + 30, 12, 34), 1.3).ink(ell(cx + 66, top + 30, 8, 28), 0.7);
  } else {
    // Lumen Moss: soft tufts heaped over the rim, a faint glow stippled round them
    for (const [x, y, r] of [[cx - 24, top - 6, 13], [cx, top - 12, 16], [cx + 24, top - 5, 12]]) {
      P.paper(ell(x, y, r, r * 0.75)).shade(ell(x + 3, y + 3, r * 0.75, r * 0.5), 2);
      for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; P.ink(`M${f(x + Math.cos(a) * r * 0.9)} ${f(y + Math.sin(a) * r * 0.7)} q${f(Math.cos(a) * 3)} ${f(Math.sin(a) * 3 - 2)} ${f(Math.cos(a) * 5)} ${f(Math.sin(a) * 2)}`, 0.7); }
    }
    P.dots(cx, top - 16, 56, 22, 70, 0.6);
    P.paper(ell(cx + 66, top + 30, 12, 34)).shade(ell(cx + 68, top + 30, 9, 30), 2).ink(ell(cx + 66, top + 30, 12, 34), 1.3);
  }
  return P;
}
function cutStrip(P) {
  // Cut Strip: three strips of a small fish on a board, the knife laid by them
  P.ground(100, 132, 70, 6);
  const board = 'M26 104 L166 92 L174 116 L34 128Z';
  P.paper(board).shade(board, 1).shade('M34 128 L174 116 L174 120 L36 132Z', 3).ink(board, 1.3).ink('M34 128 L36 132 L174 120 L174 116', 1.1);
  for (let i = 0; i < 3; i++) {
    const y = 90 - i * 6, x = 46 + i * 30;
    const st = `M${x} ${y + 8} C${x + 10} ${y - 4} ${x + 34} ${y - 6} ${x + 44} ${y + 2} C${x + 34} ${y + 8} ${x + 12} ${y + 14} ${x} ${y + 8}Z`;
    P.paper(st).shade(st, 2).ink(st, 1.2);
    for (let k = 0; k < 4; k++) P.ink(`M${x + 10 + k * 8} ${y + 1} q3 3 0 7`, 0.6);
  }
  P.ink('M110 120 L176 74', 2.2).paper('M150 92 L180 70 L184 76 L156 98Z').shade('M150 92 L180 70 L184 76 L156 98Z', 2).ink('M150 92 L180 70 L184 76 L156 98Z', 1.1);
  return P;
}
function mossBall(P) {
  P.ground(100, 134, 46, 7);
  const cx = 100, cy = 82, R = 40;
  P.paper(ell(cx, cy, R, R));
  P.shade(`M${cx + 4} ${cy - R + 2} A${R} ${R} 0 0 1 ${cx + 2} ${cy + R} A${R * 0.62} ${R} 0 0 0 ${cx + 4} ${cy - R + 2}Z`, 3);
  P.shade(ell(cx, cy, R, R), 1);
  // the moss's curls all over, and a stipple of spores on the lit side
  const rnd = P.rnd;
  for (let i = 0; i < 46; i++) {
    const a = rnd() * Math.PI * 2, k = Math.sqrt(rnd()) * 0.92, x = cx + Math.cos(a) * R * k, y = cy + Math.sin(a) * R * k;
    P.ink(`M${f(x)} ${f(y)} c2 -3 5 -2 4 1 c-1 2 -3 1 -2 0`, 0.6);
  }
  P.dots(cx - 14, cy - 14, 18, 14, 40, 0.5);
  P.ink(ell(cx, cy, R, R), 1.6);
  // the heart pressed in its face, and the cord it is tied with
  P.ink(`M${cx} ${cy + 10} c-14 -8 -14 -22 -4 -22 c3 0 4 2 4 4 c0 -2 1 -4 4 -4 c10 0 10 14 -4 22Z`, 1.2);
  P.ink(`M${cx - R + 6} ${cy - 18} C${cx - 10} ${cy - 30} ${cx + 10} ${cy - 30} ${cx + R - 6} ${cy - 18}`, 1.4);
  P.ink(`M${cx + 6} ${cy - R} C${cx + 4} ${cy - R - 16} ${cx + 22} ${cy - R - 20} ${cx + 30} ${cy - R - 10}`, 1.1);
  return P;
}
// the raft
function oars(P, lv) {
  P.ground(100, 134, 74, 6);
  for (const s of [1, -1]) {
    const x0 = 100 - s * 70, y0 = 128, x1 = 100 + s * 56, y1 = 30;
    const shaft = taper(x0, y0, x1, y1, 5, 5.5);
    P.paper(shaft).shade(shaft, s > 0 ? 2 : 1).ink(shaft, 1.2);
    // the blade at the top end
    const [bx, by] = along(x0, y0, x1, y1, 1.0), ang = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI;
    const blade = `M0 -6 C12 -11 34 -12 44 -7 C48 -4 48 4 44 7 C34 12 12 11 0 6Z`;
    P.add(`<g transform="translate(${f(bx)} ${f(by)}) rotate(${f(ang)})">`).paper(blade).shade(blade, s > 0 ? 3 : 2).ink(blade, 1.3).ink('M2 0 L42 0', 0.7).add('</g>');
    // the grip at the low end, banded on the second level
    const [gx, gy] = along(x0, y0, x1, y1, 0.04);
    P.paper(ell(gx, gy, 5, 5)).shade(ell(gx, gy, 5, 5), 3).ink(ell(gx, gy, 5, 5), 1.1);
    if (lv >= 2) for (const t of [0.12, 0.16, 0.2]) { const a = along(x0, y0, x1, y1, t, -4), b = along(x0, y0, x1, y1, t, 4); P.ink(`M${f(a[0])} ${f(a[1])} L${f(b[0])} ${f(b[1])}`, 1.4); }
    const [lx, ly] = along(x0, y0, x1, y1, 0.42);
    P.ink(ell(lx, ly, 4.5, 4.5), 1.1);   // the leather where it rides the pin
  }
  return P;
}
function keel(P, lv) {
  // a cut through the raft: three planks, the keel timber bolted under them, the water's line across
  P.shade('M10 92 L190 92 L190 150 L10 150Z', 'th', ' opacity=".55"');
  P.ink('M10 92 C40 89 70 95 100 92 S160 89 190 92', 1);
  for (let i = 0; i < 4; i++) { const x = 26 + i * 38; P.paper(rect(x, 54, 36, 14)).shade(rect(x, 54, 36, 14), i === 3 ? 3 : 2).ink(rect(x, 54, 36, 14), 1.2); P.ink(`M${x + 4} 61 q14 -3 28 0`, 0.5); }
  const k = lv >= 3 ? 'M48 68 L152 68 L144 80 C120 112 80 112 56 80Z' : lv >= 2 ? 'M52 68 L148 68 L140 78 C118 104 82 104 60 78Z' : 'M56 68 L144 68 L136 76 C116 96 84 96 64 76Z';
  P.paper(k).shade(k, 2).shade('M100 70 L144 68 L136 78 C120 98 108 102 100 102Z', 3).ink(k, 1.5);
  for (let i = 0; i < 3; i++) P.ink(`M${74 + i * 26} 70 v${lv >= 2 ? 16 : 10}`, 0.7).solid(ell(74 + i * 26, 72, 1.6, 1.6));
  if (lv >= 3) P.ink('M62 84 C84 108 116 108 138 84', 2.4);   // the iron shoe
  P.dots(100, 120, 70, 14, 30, 0.5);
  return P;
}
function lantern(P, lv) {
  P.ground(100, 138, 34, 5);
  const s = lv >= 2 ? 1.12 : 1;
  P.add(`<g transform="translate(100 82) scale(${s}) translate(-100 -82)">`);
  P.ink('M100 14 v10', 1.2).ink(ell(100, 12, 5, 5), 1.3);   // the ring
  const cap = 'M80 34 L120 34 L112 24 L88 24Z';
  P.paper(cap).shade(cap, 3).ink(cap, 1.3);
  const glass = 'M82 36 L118 36 L114 104 L86 104Z';
  P.paper(glass).ink(glass, 1.4);
  // the panes: the far frame through the glass, the flame inside, the light's rays
  P.ink('M100 36 L100 104', 0.9).shade('M106 38 L118 36 L114 104 L104 104Z', 2);
  P.ink('M100 60 C92 70 92 82 100 86 C108 82 108 70 100 60Z', 1.2).ink('M100 70 c-3 5 -3 10 0 12', 0.7);
  for (let i = 0; i < 7; i++) { const a = -Math.PI * 0.8 + i * 0.27; P.ink(`M${f(100 + Math.cos(a) * 34)} ${f(76 + Math.sin(a) * 34)} l${f(Math.cos(a) * 9)} ${f(Math.sin(a) * 9)}`, 0.7, ' stroke-opacity=".75"'); }
  const base = 'M80 104 L120 104 L116 116 L84 116Z';
  P.paper(base).shade(base, 3).ink(base, 1.3);
  P.ink('M84 116 h32', 2);
  P.add('</g>');
  return P;
}
// home
function orderBoard(P, lv) {
  P.ground(100, 138, 58, 6);
  P.ink('M60 140 L74 28 M140 140 L126 28', 2.6).ink('M60 140 L74 28 M140 140 L126 28', 0.8, ' class="cat-pp-stroke"');   // the easel's legs
  const board = rect(52, 36, 96, 70);
  P.paper(board).shade(board, 4).ink(board, 1.4).ink(rect(47, 31, 106, 80), 2.4).ink(rect(47, 31, 106, 80), 0.7, ' class="cat-pp-stroke"');
  // the chalk: a fish drawn and a few rows of Murk's hand, in paper on the dark slate, as many orders as the board holds
  const n = Math.max(1, Math.min(3, lv));
  for (let i = 0; i < n; i++) {
    const y = 50 + i * 20;
    P.ink(`M60 ${y} c4 -5 12 -5 16 0 c-4 5 -12 5 -16 0 M76 ${y} l5 -4 v8 Z`, 1.4, ' class="cat-pp-stroke"');
    P.ink(`M88 ${y + 1} c6 -3 10 2 16 -1 s10 2 16 -1 s8 1 12 0`, 1.2, ' class="cat-pp-stroke"');
  }
  P.ink('M128 100 l10 -4', 2.2, ' class="cat-pp-stroke"');   // a stub of chalk on the ledge
  P.ink('M50 107 h100', 2.6);
  return P;
}
function baitBed(P, lv) {
  P.ground(100, 136, 76, 6);
  const box = 'M30 82 L170 82 L162 122 L38 122Z';
  P.paper(box).shade(box, 2).shade('M130 82 L170 82 L162 122 L126 122Z', 3).ink(box, 1.4);
  for (let i = 0; i < 3; i++) P.ink(`M${34 + i} ${92 + i * 10} L${166 - i} ${92 + i * 10}`, 0.6);   // its planks
  // the soil heaped in it, stippled; the moss and the worms coming up through it
  const soil = 'M32 82 C50 70 80 74 100 70 C122 66 150 72 168 82Z';
  P.paper(soil).dots(100, 76, 64, 6, 120, 0.6).ink(soil, 1.1);
  for (let i = 0; i < lv + 3; i++) { const x = 48 + i * (104 / (lv + 2)); P.ink(`M${f(x)} 74 c-2 -8 4 -10 2 -18 M${f(x)} 74 c3 -6 8 -6 10 -12`, 0.9); }
  P.ink('M66 76 c4 -10 12 -10 14 -4 c1 4 -6 4 -4 8', 2.4).ink('M120 74 c-2 -9 8 -12 12 -6', 2.4);
  return P;
}
function wallWing(P) {
  // a length of the barge's cabin wall, its boards hatched, three framed ink prints hung on it
  P.shade(rect(10, 22, 180, 108), 1).ink(rect(10, 22, 180, 108), 1.2);
  for (let y = 40; y < 130; y += 18) P.ink(`M10 ${y} H190`, 0.6);
  P.ink('M10 130 H190', 2);
  const frames = [[22, 46, 44, 36], [78, 38, 48, 48], [138, 50, 40, 30]];
  for (const [x, y, w, h] of frames) {
    P.ink(`M${x + w / 2} ${y} L${x + w / 2 - 6} ${y - 12} L${x + w / 2 + 6} ${y - 12}Z`, 0.7);
    P.paper(rect(x - 4, y - 4, w + 8, h + 8)).shade(rect(x - 4, y - 4, w + 8, h + 8), 3).paper(rect(x, y, w, h)).ink(rect(x - 4, y - 4, w + 8, h + 8), 1.2).ink(rect(x, y, w, h), 0.8);
    const cx = x + w / 2, cy = y + h / 2, L = w * 0.36;
    P.ink(`M${f(cx - L)} ${f(cy)} C${f(cx - L / 2)} ${f(cy - h * 0.22)} ${f(cx + L / 2)} ${f(cy - h * 0.22)} ${f(cx + L * 0.7)} ${f(cy)} C${f(cx + L / 2)} ${f(cy + h * 0.22)} ${f(cx - L / 2)} ${f(cy + h * 0.22)} ${f(cx - L)} ${f(cy)}Z M${f(cx + L * 0.7)} ${f(cy)} l${f(L * 0.4)} -5 v10Z`, 0.9);
    P.solid(ell(cx - L * 0.6, cy - 1, 0.9, 0.9));
  }
  return P;
}
function bargeLights(P, lv) {
  // a swag of rope from post to post, small lanterns hung along it, the water's line under them
  P.shade('M0 124 L200 124 L200 150 L0 150Z', 'th', ' opacity=".5"');
  P.ink('M18 30 V124 M182 30 V124', 2.6);
  P.ink('M18 34 C60 74 140 74 182 34', 1.1);
  const n = 3 + lv;
  for (let i = 0; i < n; i++) {
    const t = (i + 1) / (n + 1), x = 18 + t * 164, y = 34 + Math.sin(t * Math.PI) * 30;
    P.ink(`M${f(x)} ${f(y)} v6`, 0.8);
    const g = `M${f(x - 5)} ${f(y + 9)} h10 l-1 14 h-8Z`;
    P.paper(g).ink(g, 1).shade(`M${f(x + 1)} ${f(y + 9)} h4 l-1 14 h-3Z`, 2).ink(`M${f(x - 6)} ${f(y + 7)} h12 l-2 -2 h-8Z`, 1);
    P.ink(`M${f(x)} ${f(y + 13)} c-2 3 -2 5 0 6 c2 -1 2 -3 0 -6`, 0.6);
    // the reflection, broken on the water
    P.ink(`M${f(x - 3)} ${128 + (i % 2) * 3} h6 M${f(x - 2)} ${135 + (i % 3)} h4 M${f(x - 1)} 142 h2`, 0.8, ' stroke-opacity=".8"');
  }
  return P;
}
function lookPlate(P, lookId) {
  P.ground(100, 136, 60, 6);
  if (lookId === 'oxblood_pennant') {
    P.ink('M64 132 L64 18', 2.6).ink(ell(64, 16, 3, 3), 1.2);
    const flag = 'M66 22 C96 28 128 22 160 38 C130 48 98 46 66 60Z';
    P.paper(flag).shade(flag, 3).ink(flag, 1.4);
    P.ink('M70 30 C98 34 122 30 146 38 M70 50 C98 46 120 46 140 42', 0.6, ' class="cat-pp-stroke"');
    return P;
  }
  if (lookId === 'amber_glass') {
    // a lantern's chimney of faceted glass, the facets hatched by their turn to the light
    const pts = [[78, 30], [122, 30], [132, 70], [122, 120], [78, 120], [68, 70]];
    P.paper(poly(pts)).shade(poly([[100, 30], [122, 30], [132, 70], [122, 120], [100, 120]]), 2).shade(poly([[116, 30], [122, 30], [132, 70], [122, 120], [114, 120]]), 3).ink(poly(pts), 1.5);
    P.ink('M100 30 V120 M68 70 H132', 0.7).ink(ell(100, 30, 22, 4), 1.1).ink(ell(100, 120, 22, 4), 1.1);
    P.ink('M84 40 L80 100', 1.2, ' class="cat-pp-stroke"');
    return P;
  }
  // the Slate Cloak Dye: a folded cloak and the dye's stoppered bottle beside it
  // the cloak on its peg: the hood, the long fall of cloth, its folds
  P.ink('M62 22 h20 M72 22 v8', 2);
  const body = 'M62 48 C50 66 42 98 34 126 C52 130 92 130 110 126 C102 98 94 66 82 48 C78 54 66 54 62 48Z';
  P.paper(body).shade(body, 2).shade('M76 52 C88 66 98 98 110 126 C100 128 92 128 86 128 C86 100 82 72 76 52Z', 3).ink(body, 1.4);
  for (const [x0, x1] of [[60, 48], [68, 62], [78, 82], [86, 98]]) P.ink(`M${x0} 60 C${(x0 + x1) / 2 - 3} 90 ${x1 - 2} 110 ${x1} 127`, 0.8);
  const hood = 'M58 44 C56 28 88 28 86 44 C86 52 80 58 72 58 C64 58 58 52 58 44Z';
  P.paper(hood).shade(hood, 2).shade('M72 31 C84 32 87 40 86 46 C85 53 80 57 74 58 C78 50 78 38 72 31Z', 3).ink(hood, 1.3).ink('M63 46 C66 52 78 52 81 46', 0.8);
  const bottle = 'M136 60 h16 v10 C166 76 168 92 168 104 C168 118 160 122 144 122 C128 122 120 118 120 104 C120 92 122 76 136 70Z';
  P.paper(bottle).shade('M146 70 C160 76 166 92 166 106 C166 118 158 121 148 122Z', 3).shade(bottle, 1).ink(bottle, 1.4).ink(rect(138, 50, 12, 10), 1.1);
  P.ink('M126 96 C140 92 152 100 166 96', 0.8);
  return P;
}
// maps and the sealed next water
function mapPlate(P, card, geo = null) {
  const rnd = P.rnd;
  // a sheet of chart, its corner turned; the shore inked, the water hatched, a compass rose; the fish is the view's own drawing
  const sheet = 'M12 14 L188 10 L184 132 L170 140 L16 136Z';
  P.paper(sheet).ink(sheet, 1.4).ink('M184 132 L170 128 L170 140', 1).shade('M184 132 L170 128 L170 140Z', 3);
  const G = isObj(geo) && Number(geo.R) > 0 ? geo : null;
  if (G) {
    // the water itself (its rim, its isles) at one scale, the place marked with an engraver's cross and the way to it dotted
    const k = 52 / G.R, cx = 98, cy = 72, X = (x) => cx + x * k, Y = (z) => cy + z * k * 0.86;
    let d = '';
    for (let i = 0; i <= 40; i++) {
      const a = (i / 40) * Math.PI * 2, r = G.R * (1 + 0.06 * Math.sin(3 * a + 1.3) + 0.035 * Math.sin(5 * a + 0.4) + 0.02 * Math.cos(9 * a));
      d += `${i ? 'L' : 'M'}${f(X(Math.cos(a) * r))} ${f(Y(Math.sin(a) * r))} `;
    }
    P.shade(`${d}Z`, 'th', ' opacity=".55"').ink(`${d}Z`, 1.3).ink(`${d}Z`, 0.5, ` transform="translate(${f(cx * -0.04)} ${f(cy * -0.04)}) scale(1.04)"`);
    for (const q of Array.isArray(G.isles) ? G.isles : []) {
      const ir = Math.max(2.2, Number(q.r) * k), path = ell(X(q.x), Y(q.z), ir, ir * 0.8);
      P.paper(path).shade(path, 3).ink(path, 1);
    }
    if (G.at) {
      const ax = X(G.at.x), ay = Y(G.at.z);
      if (G.from) P.ink(`M${f(X(G.from.x))} ${f(Y(G.from.z))} Q${f((X(G.from.x) + ax) / 2 + 8)} ${f((Y(G.from.z) + ay) / 2 - 8)} ${f(ax)} ${f(ay)}`, 1, ' stroke-dasharray="1.6 2.6"');
      P.ink(`M${f(ax - 4)} ${f(ay - 4)} l8 8 M${f(ax + 4)} ${f(ay - 4)} l-8 8`, 2.2, ' class="cat-pp-stroke"').ink(`M${f(ax - 4)} ${f(ay - 4)} l8 8 M${f(ax + 4)} ${f(ay - 4)} l-8 8`, 1.4);
    }
  } else {
    let d = '';
    for (let i = 0; i <= 28; i++) {
      const a = (i / 28) * Math.PI * 2, r = 1 + 0.12 * Math.sin(3 * a + rnd() * 0.6) + 0.06 * Math.sin(7 * a);
      d += `${i ? 'L' : 'M'}${f(100 + Math.cos(a) * 70 * r)} ${f(76 + Math.sin(a) * 44 * r)} `;
    }
    P.shade(`${d}Z`, 'th', ' opacity=".5"').ink(`${d}Z`, 1.2);
  }
  // the place's own mark (its landmark, small, in the margin)
  const kind = String(card?.placeId || '');
  if (kind === 'under_the_span') P.ink('M24 120 C34 104 50 104 60 120 M20 120 H64', 1.4);
  else if (kind === 'bell_pool') P.ink('M36 104 C36 112 32 118 28 120 H48 C44 118 40 112 40 104 C40 100 36 100 36 104Z M38 122 v2', 1.2);
  else if (kind === 'buoy_lights') P.ink('M30 120 C30 110 46 110 46 120Z M38 110 V100 M34 100 h8', 1.2);
  else P.ink('M28 116 a8 5 0 1 0 16 0 a8 5 0 1 0 -16 0 M36 116 l6 -4', 1.1);
  // the rose
  P.ink('M164 28 v24 M152 40 h24 M164 28 l3 12 l-3 12 l-3 -12Z', 0.9).ink(ell(164, 40, 7, 7), 0.6);
  return P;
}
function sealedPlate(P) {
  // the next water's map, rolled and tied, its wax set over the knot
  P.ground(100, 132, 70, 6);
  const roll = 'M30 64 L170 50 L174 92 L34 106Z';
  P.paper(roll).shade('M30 86 L172 72 L174 92 L34 106Z', 3).shade(roll, 1).ink(roll, 1.4);
  P.paper(ell(32, 85, 8, 21)).ink(ell(32, 85, 8, 21), 1.2).ink(ell(32, 85, 4, 12), 0.8).ink(ell(32, 85, 1.5, 5), 0.8);
  P.ink('M98 58 C96 70 100 88 102 100 M110 56 C108 68 112 86 114 98', 2);
  P.paper(ell(106, 78, 16, 15)).shade(ell(106, 78, 16, 15), 4).ink(ell(106, 78, 16, 15), 1.5).ink(ell(106, 78, 9, 8), 1, ' class="cat-pp-stroke"');
  P.ink('M100 92 C96 110 92 118 84 124 M112 92 C118 108 124 116 132 120', 1.6);
  return P;
}
/** The bare hook (the Wick's sheet): an eyed hook on a short snell, its barb and its shadow. */
function bareHook(P) {
  P.ground(100, 134, 40, 6);
  P.ink('M100 14 C99 30 101 44 100 58', 0.8);
  P.ink(ell(100, 62, 5, 5), 1.6);
  const shank = 'M98 66 L98 108 C98 128 128 128 128 106 L128 96', shankIn = 'M102 66 L102 107 C102 122 124 122 124 106 L124 98';
  P.ink(shank, 2.6).ink(shankIn, 0.7);
  P.ink('M128 96 L134 104 M128 96 L122 103', 1.6);
  P.shade('M98 90 L102 90 L102 108 C102 116 110 120 116 119 L112 124 C104 124 98 118 98 108Z', 3);
  return P;
}
function parcel(P) {
  P.ground(100, 134, 56, 6);
  const top = 'M54 62 L100 44 L148 60 L102 80Z', left = 'M54 62 L102 80 L102 126 L54 108Z', right = 'M102 80 L148 60 L148 106 L102 126Z';
  P.paper(top).shade(top, 1).ink(top, 1.3).paper(left).shade(left, 2).ink(left, 1.3).paper(right).shade(right, 3).ink(right, 1.3);
  P.ink('M78 53 L124 70 L124 116 M78 53 L78 117', 1.6).ink('M100 62 C92 50 104 44 106 56 C110 44 120 52 104 62', 1.2);
  return P;
}

/** Which drawing a card gets: 'rod:2', 'lure:bone_jig', 'tin:lumen_moss', 'look:amber_glass', 'place:lily_maze', 'lake', … */
export function plateKey(card) {
  const c = isObj(card) ? card : {};
  const id = String(c.id || ''), slot = c.slot || id.split(':')[0];
  const lv = Number.isFinite(Number(c.level)) ? Number(c.level) : Number(id.split(':')[1]);
  if (['rod', 'line', 'reel', 'oars', 'keel', 'lantern', 'orders', 'baitBed', 'wall', 'lights'].includes(slot)) return `${slot}:${Number.isFinite(lv) ? lv : 1}`;
  if (slot === 'hold') return `hold:${Number.isFinite(lv) ? lv : 4}`;
  if (slot === 'lure') return `lure:${c.lureId || id.slice(5)}`;
  if (slot === 'tin') return `tin:${c.baitId || id.slice(4)}`;
  if (slot === 'bait') return `bait:${c.baitId || id.slice(5)}`;
  if (slot === 'look') return `look:${c.lookId || id.slice(5)}`;
  if (slot === 'place') return `place:${c.placeId || id.slice(6)}`;
  if (slot === 'lake') return 'lake';
  if (slot === 'hook') return 'hook:bare';   // the Wick's sheet: the bare hook (never sold)
  return 'parcel';
}
/** An item's engraving (viewBox 200 × 150), its pattern ids scoped by `uid` (unique in the page). */
export function engrave(card, { uid = 'e', geo = null } = {}) {
  // (level 0, the Willow Switch, Twine and the Wooden Winch, is drawn as itself: the Wick's sheet shows the tackle you start with)
  const key = plateKey(card), [kind, rest = ''] = key.split(':'), lv = rest !== '' && Number.isFinite(Number(rest)) ? Number(rest) : 1;
  const P = plate(String(uid).replace(/[^A-Za-z0-9_-]/g, ''), 200, 150, key);
  const zoom = ({ 'lure:bell_spinner': [1.12, 100, 80], 'lure:glimmer_spoon': [1.24, 100, 78], 'lure:bone_jig': [1.3, 104, 80] })[key]
    || { lure: [1.4, 100, 84], lantern: [1.22, 100, 84], bait: [1.12, 100, 90], look: [1.12, 100, 90] }[kind];
  if (zoom) P.add(`<g transform="translate(${zoom[1]} ${zoom[2]}) scale(${zoom[0]}) translate(${-zoom[1]} ${-zoom[2]})">`);
  if (kind === 'rod') rod(P, lv);
  else if (kind === 'line') lineSpool(P, lv);
  else if (kind === 'reel') reel(P, lv);
  else if (kind === 'hold') creel(P, lv);
  else if (kind === 'lure') ({ feather_fly: lureFly, glimmer_spoon: lureSpoon, bone_jig: lureJig, bell_spinner: lureBell }[rest] || lureSpoon)(P);
  else if (kind === 'tin' && rest === 'cut_strip') cutStrip(P);
  else if (kind === 'tin') tin(P, rest === 'lumen_moss' ? 'moss' : 'worm');
  else if (kind === 'bait') mossBall(P);
  else if (kind === 'oars') oars(P, lv);
  else if (kind === 'keel') keel(P, lv);
  else if (kind === 'lantern') lantern(P, lv);
  else if (kind === 'orders') orderBoard(P, lv);
  else if (kind === 'baitBed') baitBed(P, lv);
  else if (kind === 'wall') wallWing(P, lv);
  else if (kind === 'lights') bargeLights(P, lv);
  else if (kind === 'look') lookPlate(P, rest);
  else if (kind === 'place') mapPlate(P, card, geo);
  else if (kind === 'lake') sealedPlate(P);
  else if (kind === 'hook') bareHook(P);
  else parcel(P);
  if (zoom) P.add('</g>');
  return P.svg(`cat-eng cat-eng--${kind}`);
}
/** The tier's numeral for a plate's corner (an engraver's plate number: "II"), or ''. Pure. */
export function plateNumeral(card) { const lv = Number(card?.level); return Number.isFinite(lv) && lv >= 1 && card?.slot !== 'hold' ? ROMAN[lv - 1] || '' : ''; }

// ------------------------------------------------------------------ the full plates
/** Murk's barge at its mooring (the frontispiece): the cabin and its stove-pipe, the lamp post lit, the hull on still water, reeds. */
export function frontispiece({ uid = 'fp', w = 300, h = 380 } = {}) {
  const P = plate(String(uid), w, h, 'front');
  const wl = h * 0.7;
  // the water: long horizontal hatching, broken by the reflection
  P.shade(`M0 ${wl} H${w} V${h} H0Z`, 'th', ' opacity=".7"');
  for (let i = 0; i < 9; i++) P.ink(`M${20 + (i * 37) % (w - 60)} ${f(wl + 12 + i * 10)} h${30 + (i % 3) * 16}`, 0.7);
  // the hull
  const hull = `M30 ${wl - 30} L${w - 24} ${wl - 30} C${w - 30} ${wl - 6} ${w - 50} ${wl + 6} ${w - 70} ${wl + 6} L60 ${wl + 6} C44 ${wl + 4} 34 ${wl - 10} 30 ${wl - 30}Z`;
  P.paper(hull).shade(hull, 3).ink(hull, 1.6);
  for (let i = 0; i < 3; i++) P.ink(`M${36 + i * 4} ${wl - 22 + i * 8} H${w - 30 - i * 8}`, 0.8, ' class="cat-pp-stroke"');
  // the cabin: its boards, its window lit (left clean), its door, its roof's overhang and the stove-pipe smoking
  const cab = rect(60, wl - 120, 150, 90);
  P.paper(cab).shade(cab, 2).shade(rect(160, wl - 120, 50, 90), 3).ink(cab, 1.5);
  for (let y = wl - 108; y < wl - 30; y += 12) P.ink(`M60 ${y} H210`, 0.6);
  P.paper(rect(80, wl - 100, 34, 30)).ink(rect(80, wl - 100, 34, 30), 1.4).ink(`M97 ${wl - 100} v30 M80 ${wl - 85} h34`, 1);
  for (let i = 0; i < 6; i++) { const a = Math.PI * (0.15 + i * 0.14); P.ink(`M${f(97 + Math.cos(a) * 26)} ${f(wl - 85 + Math.sin(a) * 22)} l${f(Math.cos(a) * 8)} ${f(Math.sin(a) * 8)}`, 0.6, ' stroke-opacity=".7"'); }
  P.paper(rect(136, wl - 92, 26, 62)).shade(rect(136, wl - 92, 26, 62), 4).ink(rect(136, wl - 92, 26, 62), 1.3);
  const roof = `M46 ${wl - 118} L120 ${wl - 168} L224 ${wl - 118}Z`;
  P.paper(roof).shade(roof, 2).shade(`M120 ${wl - 168} L224 ${wl - 118} L150 ${wl - 118}Z`, 3).ink(roof, 1.6);
  for (let i = 1; i < 6; i++) P.ink(`M${46 + i * 14} ${f(wl - 118 - i * 9.4)} L${74 + i * 26} ${wl - 118}`, 0.5);
  P.paper(rect(176, wl - 172, 12, 40)).shade(rect(176, wl - 172, 12, 40), 3).ink(rect(176, wl - 172, 12, 40), 1.2);
  P.ink(`M182 ${wl - 178} C170 ${wl - 200} 196 ${wl - 214} 182 ${wl - 236} C172 ${wl - 252} 192 ${wl - 262} 186 ${wl - 280}`, 1, ' stroke-dasharray="5 3"');
  // the lamp post at the bow and its lantern, lit: rays drawn as fine strokes
  const lx = w - 52, ly = wl - 170;
  P.ink(`M${lx} ${wl - 30} V${ly}`, 2.6).ink(`M${lx} ${ly} h-18 v8`, 1.6);
  const lan = `M${lx - 26} ${ly + 8} h16 l-2 26 h-12Z`;
  P.paper(lan).ink(lan, 1.3).ink(`M${lx - 18} ${ly + 16} c-3 5 -3 9 0 11 c3 -2 3 -6 0 -11`, 0.9);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; P.ink(`M${f(lx - 18 + Math.cos(a) * 26)} ${f(ly + 22 + Math.sin(a) * 26)} l${f(Math.cos(a) * 12)} ${f(Math.sin(a) * 12)}`, 0.6, ' stroke-opacity=".75"'); }
  // its reflection on the water, in broken strokes
  for (let i = 0; i < 6; i++) P.ink(`M${lx - 24 + (i % 2) * 4} ${f(wl + 14 + i * 9)} h${12 - i}`, 1.2, ' class="cat-pp-stroke"');
  // the deck's rail, a barrel and a crate of Murk's goods at the stern
  P.ink(`M34 ${wl - 46} H58 M34 ${wl - 46} V${wl - 30} M46 ${wl - 46} V${wl - 30} M214 ${wl - 46} H${w - 34} M226 ${wl - 46} V${wl - 30} M${w - 34} ${wl - 46} V${wl - 30}`, 1.1);
  const barrel = `M36 ${wl - 30} C34 ${wl - 44} 36 ${wl - 56} 38 ${wl - 60} H54 C56 ${wl - 56} 58 ${wl - 44} 56 ${wl - 30}Z`;
  P.paper(barrel).shade(barrel, 2).shade(`M48 ${wl - 60} H54 C56 ${wl - 56} 58 ${wl - 44} 56 ${wl - 30} H48Z`, 3).ink(barrel, 1.2).ink(`M36 ${wl - 40} H57 M37 ${wl - 52} H56`, 0.8);
  P.paper(rect(214, wl - 52, 26, 22)).shade(rect(214, wl - 52, 26, 22), 1).shade(rect(230, wl - 52, 10, 22), 3).ink(rect(214, wl - 52, 26, 22), 1.2).ink(`M214 ${wl - 52} L240 ${wl - 30}`, 0.7);
  // the mooring post in the water and the rope to the bow
  P.paper(rect(w - 18, wl - 70, 9, 90)).shade(rect(w - 14, wl - 70, 5, 90), 3).ink(rect(w - 18, wl - 70, 9, 90), 1.3).ink(`M${w - 19} ${wl - 70} q4.5 -6 9 0`, 1.1);
  P.ink(`M${w - 18} ${wl - 58} C${w - 22} ${wl - 40} ${w - 30} ${wl - 34} ${w - 30} ${wl - 30}`, 1.4);
  // reeds on the near bank, and stars stippled in the sky
  for (let i = 0; i < 12; i++) { const x = 8 + i * 5 + (i % 3) * 2; P.ink(`M${x} ${h - 4} C${x + 2} ${h - 40} ${x + 4} ${h - 60} ${x + (i % 2 ? 10 : -4)} ${h - 70 - (i % 4) * 8}`, 0.9); }
  for (const [x, y] of [[x0r(w, 0.2), 30], [x0r(w, 0.62), 22], [x0r(w, 0.85), 48]]) P.ink(`M${f(x - 3)} ${y} h6 M${f(x)} ${y - 3} v6`, 0.7);
  P.dots(w / 2, 50, w / 2 - 10, 34, 26, 0.7);
  // the moon over the water, its dark side hatched
  const mx = 58, my = 52, mr = 18;
  P.paper(ell(mx, my, mr, mr)).shade(`M${mx} ${my - mr} A${mr} ${mr} 0 0 1 ${mx} ${my + mr} A${mr * 0.55} ${mr} 0 0 0 ${mx} ${my - mr}Z`, 3).ink(ell(mx, my, mr, mr), 1.1);
  for (let i = 0; i < 7; i++) P.ink(`M${f(mx - 14 + i * 4)} ${f(wl + 8 + i * 6)} h${f(8 - Math.abs(3 - i))}`, 1, ' class="cat-pp-stroke"');
  return P.svg('cat-eng cat-eng--front');
}
/** The gear log's page: an open ledger, its columns ruled, a quill in the gutter. */
export function ledgerPlate({ uid = 'lg' } = {}) {
  const P = plate(String(uid), 200, 150, 'ledger');
  P.ground(100, 134, 80, 6);
  const L = 'M16 46 C50 36 84 40 100 50 L100 128 C84 118 50 116 16 126Z', R = 'M100 50 C116 40 150 36 184 46 L184 126 C150 116 116 118 100 128Z';
  P.paper(L).paper(R).shade('M100 50 C116 40 150 36 184 46 L184 56 C150 48 116 50 100 60Z', 1).ink(L, 1.3).ink(R, 1.3);
  for (let i = 0; i < 7; i++) { P.ink(`M24 ${f(58 + i * 9)} C50 ${f(50 + i * 9)} 80 ${f(52 + i * 9)} 94 ${f(60 + i * 9)}`, 0.5); P.ink(`M106 ${f(60 + i * 9)} C120 ${f(52 + i * 9)} 150 ${f(50 + i * 9)} 176 ${f(58 + i * 9)}`, 0.5); }
  P.ink('M60 46 L58 120 M142 46 L144 120', 0.7);
  P.shade('M96 50 L104 50 L104 128 L96 128Z', 3);
  P.ink('M120 30 C140 10 170 6 186 4 C176 14 150 26 124 34Z', 1.1).shade('M124 34 C150 26 176 14 186 4 C170 18 150 28 128 36Z', 2).ink('M124 34 L104 64', 1.2);
  return P.svg('cat-eng cat-eng--ledger');
}
/** The Wick in ink, for a map plate's scale (the fish life-size beside it, SPEC §8.4, M1.md §2.4): the cloak, the round head and the
 *  candle on it, its flame. viewBox 100 × 120, the figure 0.78 of its height, standing on the box's foot. */
export function wickInk({ uid = 'wk' } = {}) {
  const P = plate(String(uid), 100, 120, 'wick');
  P.shade('M28 118 h48', 'th', ' opacity=".6"');
  const cloak = 'M50 50 C38 52 30 70 26 116 L74 116 C70 70 62 52 50 50Z';
  P.paper(cloak).shade(cloak, 2).shade('M52 52 C62 56 70 74 74 116 L58 116 C58 86 56 64 52 52Z', 3).ink(cloak, 2);
  P.paper(ell(50, 46, 13, 12)).shade('M52 34 A12 12 0 0 1 52 58 A7 12 0 0 0 52 34Z', 3).ink(ell(50, 46, 13, 12), 2);
  P.paper(rect(45, 18, 10, 17)).shade(rect(50, 18, 5, 17), 2).ink(rect(45, 18, 10, 17), 1.8);
  P.ink('M50 4 C44 10 44 15 50 18 C56 15 56 10 50 4Z', 1.6).ink('M50 10 v5', 1.2);
  return P.svg('cat-eng cat-eng--wick');
}
/** The end leaf: Murk's lamp on its bracket, small. */
export function endPlate({ uid = 'en' } = {}) {
  const P = plate(String(uid), 200, 150, 'end');
  lantern(P, 1);
  return P.svg('cat-eng cat-eng--end');
}
