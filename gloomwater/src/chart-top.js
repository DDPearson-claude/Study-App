// chart-top.js — M1 step 5b (lane 5b-home): the chart table's top under the barge's awning shows the Chart (docs/loop/M1.md §2.6,
// §4 step 5b: "the Chart with the chart table's top drawn by drawToTexture"). The same bake the drawn Chart lays first (src/chart-art.js,
// the world map's first sheet), on the chart's vellum, with the surveyors' neatline, the road's four stones (one inked per water the
// barge has been towed to, gilt once its legend is home) and, once the water is complete, its name's frame in gold. One small canvas
// (512 × 340), drawn once when its art decodes and again only when what it shows changes; actors-home maps it on one plane.
//
//   drawToTexture(canvas, {image, paper, stones, gilded})   draws the table's sheet; → true when it drew with the bake
//   loadChartImage()                                        the bake decoded once (a Promise of an image, or null without a DOM)
import { CHART_ART } from './chart-art.js';

const W = 512, H = 340;
let imgP = null;
/** The first sheet's bake, decoded once (null in node or when it cannot decode). */
export function loadChartImage() {
  if (imgP) return imgP;
  imgP = new Promise((res) => {
    try {
      const s = CHART_ART?.sheets?.[0];
      if (!s?.uri || typeof Image === 'undefined') { res(null); return; }
      const img = new Image();
      img.onload = () => res(img); img.onerror = () => res(null);
      img.src = s.uri;
    } catch { res(null); }
  });
  return imgP;
}
/** A soft-edged vellum leaf (a deckled rectangle). */
function leaf(g, x, y, w, h, r = 4) {
  g.beginPath();
  const n = 18;
  for (let i = 0; i <= n; i++) { const t = i / n; g.lineTo(x + w * t, y + Math.sin(t * 31) * r * 0.35); }
  for (let i = 0; i <= n; i++) { const t = i / n; g.lineTo(x + w + Math.sin(t * 27) * r * 0.35, y + h * t); }
  for (let i = 0; i <= n; i++) { const t = i / n; g.lineTo(x + w * (1 - t), y + h + Math.sin(t * 23) * r * 0.35); }
  for (let i = 0; i <= n; i++) { const t = i / n; g.lineTo(x + Math.sin(t * 29) * r * 0.35, y + h * (1 - t)); }
  g.closePath();
}
/** The chart table's sheet (pure canvas drawing): `image` the bake (or null: the vellum and its neatline alone). */
export function drawToTexture(canvas, { image = null, stones = [], gilded = false } = {}) {
  if (!canvas) return false;
  canvas.width = W; canvas.height = H;
  const g = canvas.getContext?.('2d');
  if (!g) return false;
  g.fillStyle = 'rgb(58,44,40)'; g.fillRect(0, 0, W, H);   // the table's own wood, round the sheet
  leaf(g, 10, 10, W - 20, H - 20);
  g.fillStyle = 'rgb(230,222,214)'; g.fill();
  g.save(); leaf(g, 10, 10, W - 20, H - 20); g.clip();
  let drew = false;
  if (image && image.width > 0) {
    // the bake fitted to the sheet by its height, centred (its edges fall off the leaf as on the Chart's own vellum)
    const k = (H - 34) / image.height, iw = image.width * k, ih = image.height * k;
    try { g.globalAlpha = 1; g.drawImage(image, (W - iw) / 2, 17, iw, ih); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.8; g.drawImage(image, (W - iw) / 2, 17, iw, ih); drew = true; } catch { drew = false; }
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
  }
  // the surveyors' fine neatline, in gold once the water is complete (M1.md §2.5's gilding)
  g.strokeStyle = gilded ? 'rgba(214,170,84,.95)' : 'rgba(59,46,68,.55)'; g.lineWidth = gilded ? 3 : 1.5;
  g.strokeRect(22, 22, W - 44, H - 44);
  // the road's four stones of arc I in the sheet's corner (blank, inked, gilt)
  for (let i = 0; i < 4; i++) {
    const st = stones[i] || 'blank', x = W - 120 + i * 24, y = H - 44;
    g.beginPath(); g.ellipse(x, y, 7, 9, 0, 0, Math.PI * 2);
    g.fillStyle = st === 'gilt' ? 'rgb(236,196,104)' : st === 'ink' ? 'rgb(244,238,230)' : 'rgb(164,158,186)'; g.fill();
    g.strokeStyle = 'rgba(59,46,68,.85)'; g.lineWidth = 1.2; g.stroke();
    if (st !== 'blank') { g.beginPath(); g.arc(x, y - 1, 2.6, 0, Math.PI * 2); g.fillStyle = st === 'gilt' ? 'rgb(150,84,14)' : 'rgb(240,162,60)'; g.fill(); }
  }
  g.restore();
  return drew;
}
export const CHART_TOP_SIZE = Object.freeze({ w: W, h: H });
