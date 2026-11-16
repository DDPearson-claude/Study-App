// ui-catalogue-murk.js — Murk's shelf as a printed catalogue (the user's words of 16 November 2026: "make buying things from murk look
// like an actual brochure we browse the pages of to buy items"). The shelf's modal ('shelf', ui-loop.js openShelf) draws this book in
// place of its cards; everything it sells, prices and buys is the shelf's own (ui-loop's shelfCards of progression-loop's shelf, its
// buy through the ledger, the price factor, the save). Read only under the loop (ui-loop builds it).
//
//   the book      desktop: a two-page spread (the gutter's shadow, the edges' thickness, a candle-lit pool behind it); phone: one page at
//                 a time, full width. Cream vellum and the Chart's ink, Drowned Filigree rules and corner ornaments, candle amber only on
//                 the prices, the clam and the bookmark. A running head on every page (the catalogue's name; the chapter's word on a
//                 right-hand page), a folio at the foot
//   the pages     the frontispiece (Murk's barge) facing the cover (the name, his motto, the orders' chalk slate, the goal line), one
//                 chapter per shelf tab in the shelf's order, each opening with its tab word, items in a ruled grid (2 × 2; a phone 1 × 2):
//                 a kicker, the NAME, the engraving (src/murk-engrave.js), the one line, the price; the gear log's page last (Odds ›, the
//                 only odds); the next water's sealed plate among the maps
//   browsing      the page corners, a horizontal swipe, ←/→ and PageUp/PageDown, Home/End, [ and ] for chapters; the fore-edge tabs jump to
//                 a chapter; a leaf turns in 0.45 s (a cut under reduced motion) with a soft paper sound; it opens at the goal's page, or
//                 where it was left this visit
//   buying        a tap marks an item (an ink ring round its price) and the order line "Buy · <price>" appears in the foot; its tap buys
//                 through the ledger; a bought plate is stamped "Yours." in red-brown ink; a dear item stays readable in a lighter ink (marked,
//                 its ring is faint and no order line comes: the price dimmed, nothing else)
// Selectors kept for the scenarios: [data-loop=shelf], [data-item], [data-place], [data-sealed], [data-buy] (the order line), [role=tab]
// (.gw-tab: the fore-edge), .gw-murk-line, [data-loop=orders] (lane 4's slate), .gw-shelf-odds (the gear log), [data-seal].
import { engrave, frontispiece, ledgerPlate, endPlate, plateNumeral, wickInk } from './murk-engrave.js';
import { bookLayout, bookSizes, bookPages, spreadPages, spreadOf, turnTo, focusPage, orderText, BOOK } from './murk-catalogue.js';
import { SFX } from './audio-sfx.js';

const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const arr = (v) => (Array.isArray(v) ? v : []);
const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };

/** The page's paper sound: a soft dry rustle of the leaf and a little air as it lands (synthesised; under the loop only). */
export const SFX_BOOK = {
  book_page: { gain: 0.5, gap: 0.12, max: 2, pri: 2, wet: 0.18, pj: 0.06, vj: 0.15, fn(v, out, t, p) {
    v.burst(out, { kind: 'pink', t, a: 0.05, hold: 0.08, d: 0.16, peak: 0.22, ft: 'bandpass', f: 2400 * p, f2: 3600 * p, glide: 0.2, q: 0.7 });
    v.burst(out, { kind: 'white', t: t + 0.04, a: 0.03, d: 0.12, peak: 0.07, ft: 'highpass', f: 5200 * p, q: 0.5 });
    v.burst(out, { kind: 'brown', t: t + 0.26, a: 0.01, d: 0.1, peak: 0.12, ft: 'lowpass', f: 600 * p, q: 0.6 });
  } },
};
function registerBookSfx() { for (const [k, def] of Object.entries(SFX_BOOK)) if (!SFX[k]) SFX[k] = def; }

const PAPER_NOISE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .2  0 0 0 0 .15  0 0 0 0 .24  0 0 0 .085 0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E\")";
const FIBRE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.012 .2' numOctaves='2' seed='7'/%3E%3CfeColorMatrix values='0 0 0 0 .3  0 0 0 0 .24  0 0 0 0 .3  0 0 0 .05 0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23f)'/%3E%3C/svg%3E\")";
/** Drowned Filigree's corner ornament and its rule, in the page's ink. */
const CORNER = '<svg class="gw-mb-corner" viewBox="0 0 40 40" aria-hidden="true"><path d="M3 37 V12 C3 6 6 3 12 3 H37" fill="none" stroke="currentColor" stroke-width="1"/><path d="M7 33 V15 C7 10 10 7 15 7 H33" fill="none" stroke="currentColor" stroke-width=".6"/><path d="M12 12 c6 -2 10 2 7 6 c-2 3 -6 1 -4 -1" fill="none" stroke="currentColor" stroke-width=".9"/><circle cx="3" cy="37" r="1.6" fill="currentColor"/><circle cx="37" cy="3" r="1.6" fill="currentColor"/></svg>';
const RULE = '<svg class="gw-mb-rule" viewBox="0 0 240 12" preserveAspectRatio="none" aria-hidden="true"><path d="M0 6 H98 M142 6 H240" stroke="currentColor" stroke-width=".9"/><path d="M0 9 H90 M150 9 H240" stroke="currentColor" stroke-width=".4"/><path d="M104 6 c4 -6 10 -6 12 0 c2 6 8 6 12 0 M116 6 c-2 3 -5 3 -6 0 M124 6 c2 -3 5 -3 6 0" fill="none" stroke="currentColor" stroke-width=".9"/><circle cx="120" cy="6" r="1.4" fill="currentColor"/></svg>';
const FLOURISH = '<svg class="gw-mb-flourish" viewBox="0 0 200 24" aria-hidden="true"><path d="M8 12 C40 12 60 4 84 10 C92 12 96 18 100 12 C104 18 108 12 116 10 C140 4 160 12 192 12" fill="none" stroke="currentColor" stroke-width="1"/><path d="M84 10 c-6 -8 4 -12 8 -6 M116 10 c6 -8 -4 -12 -8 -6" fill="none" stroke="currentColor" stroke-width=".8"/><circle cx="100" cy="12" r="2" fill="currentColor"/><circle cx="8" cy="12" r="1.4" fill="currentColor"/><circle cx="192" cy="12" r="1.4" fill="currentColor"/></svg>';
const RING = '<svg class="gw-mb-ring" viewBox="0 0 120 56" aria-hidden="true"><path d="M14 30 C10 14 40 5 66 6 C96 7 114 16 112 30 C110 46 80 52 56 51 C30 50 12 44 12 32 C12 22 24 13 38 10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" pathLength="1"/></svg>';
const CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const CURL = (dir) => `<svg viewBox="0 0 48 48" aria-hidden="true">${dir > 0 ? '<path d="M48 10 L48 48 L10 48 C26 44 44 30 48 10Z" class="gw-mb-curl-back"/><path d="M48 10 C44 30 26 44 10 48" fill="none" stroke="currentColor" stroke-width="1"/><path d="M30 30 l8 0 l-3 -3 M38 30 l-3 3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' : '<path d="M0 10 L0 48 L38 48 C22 44 4 30 0 10Z" class="gw-mb-curl-back"/><path d="M0 10 C4 30 22 44 38 48" fill="none" stroke="currentColor" stroke-width="1"/><path d="M18 30 l-8 0 l3 -3 M10 30 l3 3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'}</svg>`;

const CSS = `
.gw-loop-on .gw-m-shelf .gw-modal-body { max-width: none; }
.gw-book { --cat-paper: rgb(238, 228, 210); --cat-paper-2: rgb(226, 214, 194); --cat-ink: rgb(38, 29, 44); --cat-ink-2: rgba(38, 29, 44, .62);
  --cat-faint: rgba(38, 29, 44, .34); --cat-amber: rgb(168, 96, 22); --cat-gold: rgb(240, 172, 74); --cat-stamp: rgb(150, 58, 42);
  --pw: 360px; --ph: 500px; position: relative; display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--cat-ink);
  user-select: none; -webkit-user-select: none; touch-action: pan-y; }
.gw-book .gw-murk-line { margin: 0; min-height: 25px; max-width: min(560px, 92vw); text-align: center; font: italic 400 19px/1.3 var(--f-body); color: var(--ink, #e8e4f2);
  text-shadow: 0 0 10px rgba(0,0,0,.9), 0 0 2px #000; opacity: 0; transition: opacity .5s; }
.gw-book .gw-murk-line.gw-in { opacity: 1; }
.gw-book .gw-murk-line:empty { visibility: hidden; }
.gw-book[data-layout=phone] .gw-book-frame { flex-direction: column; align-items: center; }
.gw-book-frame { position: relative; display: flex; }
.gw-book-frame::before { content: ''; position: absolute; inset: -18% -14%; z-index: -1; pointer-events: none;
  background: radial-gradient(ellipse 50% 50% at 50% 48%, rgba(255, 186, 104, .2), rgba(255, 170, 90, .07) 55%, rgba(0,0,0,0) 72%); }
.gw-book-spread { position: relative; display: flex; perspective: 2200px; }
.gw-book[data-layout=desktop] .gw-book-spread::after { content: ''; position: absolute; top: 0; bottom: 0; left: 50%; width: 44px; margin-left: -22px; pointer-events: none; z-index: 3;
  background: linear-gradient(90deg, rgba(40, 26, 30, 0) 0%, rgba(40, 26, 30, .1) 30%, rgba(30, 18, 24, .38) 48%, rgba(30, 18, 24, .42) 50%, rgba(30, 18, 24, .3) 53%, rgba(40, 26, 30, .08) 72%, rgba(40, 26, 30, 0) 100%); }
.gw-mb-slot { position: relative; width: var(--pw); height: var(--ph); }
.gw-mb-page { position: absolute; inset: 0; overflow: hidden; background-color: var(--cat-paper); background-image: ${PAPER_NOISE}, ${FIBRE},
  radial-gradient(ellipse 120% 100% at 50% 50%, rgba(0,0,0,0) 62%, rgba(120, 92, 70, .14) 100%); color: var(--cat-ink);
  display: flex; flex-direction: column; padding: 14px 22px 10px; box-sizing: border-box; }
.gw-mb-slot--l .gw-mb-page { border-radius: 5px 1px 1px 5px; box-shadow: -1px 1px 0 var(--cat-paper-2), -2px 2px 0 rgb(214, 204, 190), -3px 3px 0 var(--cat-paper-2), -4px 4px 0 rgb(206, 195, 180),
  -5px 5px 0 rgb(220, 211, 198), -6px 6px 0 rgb(196, 184, 168), -8px 9px 18px rgba(0,0,0,.55); }
.gw-mb-slot--r .gw-mb-page, .gw-book[data-layout=phone] .gw-mb-page { border-radius: 1px 5px 5px 1px; box-shadow: 1px 1px 0 var(--cat-paper-2), 2px 2px 0 rgb(214, 204, 190), 3px 3px 0 var(--cat-paper-2),
  4px 4px 0 rgb(206, 195, 180), 5px 5px 0 rgb(220, 211, 198), 6px 6px 0 rgb(196, 184, 168), 8px 9px 18px rgba(0,0,0,.55); }
.gw-book[data-layout=phone] .gw-mb-page { border-radius: 4px; }
.gw-mb-corner { position: absolute; width: 30px; height: 30px; color: var(--cat-ink-2); pointer-events: none; }
.gw-mb-corner.c-tl { top: 6px; left: 6px; } .gw-mb-corner.c-tr { top: 6px; right: 6px; transform: scaleX(-1); }
.gw-mb-corner.c-bl { bottom: 6px; left: 6px; transform: scaleY(-1); } .gw-mb-corner.c-br { bottom: 6px; right: 6px; transform: scale(-1); }
.gw-mb-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; padding: 2px 10px 3px; border-bottom: 1.5px solid var(--cat-ink);
  box-shadow: 0 2.5px 0 -1.6px var(--cat-ink); font: 400 16px/1 var(--f-display); letter-spacing: .16em; text-transform: uppercase; color: var(--cat-ink); }
.gw-mb-head .gw-mb-name { font-family: var(--f-display); }
.gw-mb-head .gw-mb-ch { font: italic 400 16px/1 var(--f-body); letter-spacing: .04em; text-transform: none; color: var(--cat-ink-2); }
.gw-mb-slot--l .gw-mb-head, .gw-mb-slot--r .gw-mb-head { margin: 0 6px; }
.gw-mb-body { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; }
.gw-mb-foot { display: flex; justify-content: center; align-items: center; min-height: 34px; padding: 0; flex: none; font: 500 16px/1 var(--f-body); color: var(--cat-ink-2); letter-spacing: .1em; }
.gw-mb-foot::before, .gw-mb-foot::after { content: '\\2014'; margin: 0 8px; color: var(--cat-faint); }
.gw-mb-foot:empty::before, .gw-mb-foot:empty::after { content: none; }
.gw-mb-chap { display: flex; flex-direction: column; align-items: center; margin: 4px 0 0; flex: none; }
.gw-mb-chap h3 { margin: 0; font: 400 24px/1 var(--f-fell); letter-spacing: .14em; text-transform: uppercase; color: var(--cat-ink); }
.gw-mb-rule { display: block; width: 64%; height: 8px; color: var(--cat-ink-2); margin-top: 2px; }
.gw-mb-grid { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr)); grid-template-rows: repeat(var(--rows, 2), minmax(0, 1fr)); }
.gw-plate { position: relative; min-width: 0; min-height: 0; display: flex; flex-direction: column; align-items: center; padding: 5px 8px 3px; box-sizing: border-box; }
.gw-book[data-layout=desktop] .gw-plate:nth-child(2n) { border-left: 1px solid var(--cat-ink-2); }
.gw-book[data-layout=desktop] .gw-mb-grid[data-rows="2"] .gw-plate:nth-child(n+3) { border-top: 1px solid var(--cat-ink-2); }
.gw-book[data-layout=phone] .gw-plate:nth-child(n+2) { border-top: 1px solid var(--cat-ink-2); }
.gw-plate-hit { position: absolute; inset: 0; z-index: 1; border: 0; padding: 0; margin: 0; background: none; cursor: pointer; -webkit-tap-highlight-color: transparent; border-radius: 2px; }
.gw-plate-hit:focus-visible { outline: 1.5px dashed var(--cat-ink-2); outline-offset: -5px; }
.gw-plate-hit:hover ~ .gw-plate-art .cat-eng { transform: translateY(-1px) scale(1.015); }
.gw-plate-kick { font: 400 16px/1.05 var(--f-display); letter-spacing: .14em; text-transform: uppercase; color: var(--cat-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
/* a place or a water is never cut: its kicker wraps (as every kicker does on a short or a low spread) */
.gw-plate--map .gw-plate-kick, .gw-plate--sealed .gw-plate-kick, .gw-book.gw-short .gw-plate-kick, .gw-book.gw-low .gw-plate-kick { white-space: normal; overflow: visible; text-overflow: clip; text-wrap: balance; }
.gw-plate-name { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; flex: none; font: 700 20px/1 var(--f-body); text-transform: uppercase;
  letter-spacing: .005em; color: var(--cat-ink); text-align: center; transform: scaleX(.86); transform-origin: 50% 50%; width: 116%; margin: 0 -8%; }
.gw-plate-name .gw-map-star { font-style: normal; margin-right: .2em; color: var(--cat-amber); }
.gw-plate-art { position: relative; flex: 1; min-height: 0; width: 100%; display: flex; align-items: center; justify-content: center; }
.gw-plate-art .cat-eng { width: 100%; height: 100%; max-height: 100%; color: var(--cat-ink); transition: transform .3s; }
.gw-book .cat-pp { fill: var(--cat-paper); } .gw-book .cat-pp-stroke { stroke: var(--cat-paper); }
.gw-plate-line { flex: none; width: 100%; font: italic 400 16px/1.1 var(--f-body); color: var(--cat-ink); text-align: center; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.gw-plate-low { width: 100%; display: flex; align-items: flex-end; justify-content: flex-end; gap: 6px; min-height: 26px; flex: none; }
.gw-book[data-layout=desktop] .gw-plate-low { margin-top: -2px; }
.gw-book[data-layout=desktop] .gw-plate-kick { line-height: 1; }
.gw-plate-price { flex: none; margin-right: 8px; }
.gw-plate-price { position: relative; display: inline-flex; align-items: center; gap: 4px; font: 700 22px/1 var(--f-body); color: var(--cat-amber); font-variant-numeric: lining-nums; padding: 2px 4px; }
.gw-plate-price .gw-price { color: inherit; font: inherit; gap: 4px; }
.gw-plate-price .gw-ico { display: inline-block; width: 21px; height: 21px; color: var(--cat-amber); }
.gw-plate.gw-dear .gw-plate-price { color: var(--cat-faint); }
.gw-plate.gw-dear .gw-mb-ring { color: var(--cat-faint); } .gw-plate.gw-dear .gw-plate-price .gw-ico { color: var(--cat-faint); }
.gw-mb-ring { position: absolute; left: -16px; right: -16px; top: -12px; bottom: -12px; width: calc(100% + 32px); height: calc(100% + 24px); color: var(--cat-ink); pointer-events: none; }
.gw-mb-ring path { stroke-dasharray: 1; stroke-dashoffset: 0; animation: gwMbRing .5s ease-out both; }
@keyframes gwMbRing { from { stroke-dashoffset: 1; } }
.gw-plate.gw-marked .gw-plate-art .cat-eng { transform: none; }
.gw-plate-num { position: absolute; top: 4px; right: 8px; font: italic 400 16px/1 var(--f-body); color: var(--cat-faint); }
.gw-plate-count { position: absolute; right: 12%; bottom: 8%; min-width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;
  border: 1.5px solid var(--cat-ink); background: var(--cat-paper); font: 700 16px/1 var(--f-body); color: var(--cat-ink); }
.gw-mb-stamp { position: absolute; left: 50%; top: 50%; z-index: 2; pointer-events: none; transform: translate(-50%, -50%) rotate(-14deg); padding: 4px 16px 2px;
  font: 400 clamp(16px, calc(var(--pw) / 13.5), 30px)/1 var(--f-fell); letter-spacing: .12em; text-transform: uppercase; color: var(--cat-stamp); border: 2.5px solid currentColor; border-radius: 4px;
  box-shadow: inset 0 0 0 2px var(--cat-paper), inset 0 0 0 3.2px currentColor; opacity: .86; mix-blend-mode: multiply; white-space: nowrap; }
.gw-mb-stamp.gw-press { animation: gwMbStamp .42s cubic-bezier(.2, .9, .3, 1.2) both; }
@keyframes gwMbStamp { 0% { opacity: 0; transform: translate(-50%, -50%) rotate(-14deg) scale(1.7); } 60% { opacity: .95; } 100% { opacity: .86; transform: translate(-50%, -50%) rotate(-14deg) scale(1); } }
.gw-plate.gw-bought .gw-plate-art, .gw-plate.gw-bought .gw-plate-price { opacity: .78; }
.gw-plate-art { overflow: hidden; }
.gw-plate-map { position: absolute; left: 50%; bottom: 3%; display: flex; align-items: flex-end; gap: 4px; pointer-events: none; transform: translateX(-50%) scale(var(--k, 1)); transform-origin: 50% 100%; }
.gw-book[data-layout=desktop] .gw-plate-art > .gw-plate-hours { position: absolute; top: 0; left: 2px; flex-direction: column; gap: 2px; }
.gw-plate-map canvas { filter: drop-shadow(0 0 1.5px var(--cat-paper)) drop-shadow(0 0 1.5px var(--cat-paper)); }
.gw-plate-map .gw-map-wick { flex: none; display: block; }
.gw-plate-map .gw-map-wick .cat-eng { width: 100%; height: 100%; display: block; color: var(--cat-ink); }
.gw-plate-map canvas { flex: none; }
.gw-plate-hours { display: flex; gap: 4px; justify-content: center; color: var(--cat-ink-2); }
.gw-plate-hours .gw-ico { width: 18px; height: 18px; }
.gw-plate--sealed .gw-seal-row, .gw-plate--sealed .gw-seals { position: relative; z-index: 2; display: flex; gap: 6px; justify-content: center; }
.gw-plate--sealed .gw-seal-btn { min-width: 44px; min-height: 44px; color: var(--cat-ink); }
.gw-plate-soon { font: italic 400 16px/1.2 var(--f-body); color: var(--cat-ink-2); }
.gw-plate--sealed .gw-seal-n { color: var(--cat-ink); text-shadow: none; font-size: 16px; }
.gw-plate--sealed .gw-seal-btn { background: none; border: 0; }
.gw-mb-cover { flex: 1; min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 6px 0 4px; text-align: center; }
.gw-mb-title { margin: 6px 0 0; font: 400 40px/1 var(--f-fell); letter-spacing: .1em; text-transform: uppercase; color: var(--cat-ink); }
.gw-mb-flourish { width: 70%; height: 20px; color: var(--cat-ink); }
.gw-mb-motto { margin: 2px 12px; font: italic 400 17px/1.25 var(--f-body); color: var(--cat-ink-2); }
.gw-mb-coverart { flex: 1; min-height: 0; width: 100%; display: flex; align-items: center; justify-content: center; }
.gw-mb-coverart .cat-eng { height: 100%; max-height: 100%; width: auto; max-width: 92%; color: var(--cat-ink); }
.gw-mb-cover .gw-orders { margin: 4px auto 6px; width: 88%; max-width: 320px; transform: rotate(-1.2deg); box-shadow: inset 0 0 0 1.5px rgba(122, 96, 70, .85), inset 0 0 18px rgba(0,0,0,.55), 3px 5px 0 rgba(60, 40, 30, .18), 0 2px 8px rgba(0,0,0,.35); }
.gw-mb-goal { margin: 4px 0 0; padding-top: 6px; border-top: 1px solid var(--cat-faint); font: italic 400 17px/1.2 var(--f-body); color: var(--cat-ink); }
.gw-mb-goal .gw-ico { display: inline-block; width: 18px; height: 18px; vertical-align: -3px; color: var(--cat-amber); margin: 0 2px; }
.gw-mb-goal b { color: var(--cat-amber); font-style: normal; }
.gw-mb-frontis { flex: 1; min-height: 0; margin: 8px 4px 4px; border: 1.5px solid var(--cat-ink); outline: 1px solid var(--cat-ink-2); outline-offset: 3px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.gw-mb-frontis .cat-eng { width: 100%; height: 100%; color: var(--cat-ink); }
.gw-mb-odds { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }
.gw-mb-odds .cat-eng { width: 78%; height: auto; color: var(--cat-ink); }
.gw-book .gw-shelf-odds { min-height: 48px; padding: 6px 22px; border: 1.5px solid var(--cat-ink); border-radius: 3px; background: none; color: var(--cat-ink); cursor: pointer;
  font: 400 20px/1 var(--f-display); letter-spacing: .14em; text-transform: uppercase; box-shadow: inset 0 0 0 3px var(--cat-paper), inset 0 0 0 4px var(--cat-ink-2); }
.gw-book .gw-shelf-odds:hover, .gw-book .gw-shelf-odds:focus-visible { background: rgba(38, 29, 44, .06); outline: none; }
.gw-mb-end { flex: 1; display: flex; align-items: center; justify-content: center; }
.gw-mb-end .cat-eng { width: 52%; color: var(--cat-ink-2); }
.gw-mb-ribbon { position: absolute; top: -6px; right: 26%; width: 18px; height: 72px; z-index: 4; pointer-events: none; background: rgb(126, 40, 34);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 84%, 0 100%); box-shadow: inset -4px 0 0 rgba(0,0,0,.2); }
.gw-mb-ribbon::after { content: ''; position: absolute; inset: 0 7px; background: rgba(255, 210, 160, .16); }
/* the fore-edge tabs */
.gw-book-tabs { position: absolute; top: 58px; display: flex; flex-direction: column; gap: 4px; z-index: 0; }
.gw-book[data-layout=desktop] .gw-book-tabs { left: 100%; margin-left: -4px; }
.gw-book .gw-book-tab { min-height: 44px; min-width: 64px; padding: 0 12px 0 14px; display: flex; align-items: center; justify-content: flex-start; gap: 6px; border: 0;
  border-radius: 0 6px 6px 0; cursor: pointer; background-color: var(--cat-paper-2); background-image: ${PAPER_NOISE}; color: var(--cat-ink-2);
  font: 400 16px/1 var(--f-display); letter-spacing: .1em; text-transform: uppercase; text-shadow: none; box-shadow: 2px 2px 0 rgb(196, 184, 168), 4px 5px 10px rgba(0,0,0,.45);
  transition: transform .2s, color .2s; -webkit-tap-highlight-color: transparent; }
.gw-book .gw-book-tab .gw-ico { width: 18px; height: 18px; }
.gw-book .gw-book-tab[aria-selected=true] { color: var(--cat-ink); transform: translateX(6px); background-color: var(--cat-paper); }
.gw-book .gw-book-tab:hover, .gw-book .gw-book-tab:focus-visible { color: var(--cat-ink); outline: none; transform: translateX(4px); }
.gw-book .gw-book-tab::after { content: none; }
.gw-book[data-layout=phone] .gw-book-tabs { position: static; flex-direction: row; justify-content: center; gap: 3px; order: -1; margin: 0 0 -4px; z-index: 0; }
.gw-book[data-layout=phone] .gw-book-tab { min-width: 50px; padding: 0 8px; justify-content: center; border-radius: 6px 6px 0 0; box-shadow: 1px -1px 0 rgb(196, 184, 168), 0 -3px 8px rgba(0,0,0,.35); }
.gw-book .gw-book-tab .gw-ico { display: inline-block; }
.gw-book[data-layout=phone] .gw-book-tab .gw-ico { width: 24px; height: 24px; }
.gw-book[data-layout=phone] .gw-book-close { top: auto; bottom: -58px; right: 2px; }
.gw-book[data-layout=phone] .gw-book-tab[aria-selected=true] { transform: translateY(-4px); }
.gw-book .gw-vh { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
/* the page corners */
.gw-mb-turn { position: absolute; bottom: 0; z-index: 5; width: 48px; height: 44px; padding: 0; border: 0; background: none; cursor: pointer; color: var(--cat-ink-2); -webkit-tap-highlight-color: transparent; }
.gw-mb-turn svg { width: 100%; height: 100%; display: block; }
.gw-mb-turn .gw-mb-curl-back { fill: var(--cat-paper-2); filter: drop-shadow(-2px -2px 2px rgba(0,0,0,.18)); }
.gw-mb-turn--next { right: 0; } .gw-mb-turn--prev { left: 0; }
.gw-mb-turn:hover, .gw-mb-turn:focus-visible { color: var(--cat-ink); outline: none; }
.gw-mb-turn[disabled] { visibility: hidden; }
/* the leaf in the turn */
.gw-mb-leaf { position: absolute; top: 0; width: var(--pw); height: var(--ph); z-index: 6; transform-style: preserve-3d; pointer-events: none; }
.gw-mb-leaf > .gw-mb-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.gw-mb-leaf > .gw-mb-face--back { transform: rotateY(180deg); }
.gw-mb-leaf > .gw-mb-face::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(90deg, rgba(30, 18, 24, .0), rgba(30, 18, 24, .22)); opacity: 0; animation: gwMbShade var(--turn, .45s) ease-in-out; }
@keyframes gwMbShade { 50% { opacity: 1; } }
/* the foot: the purse and the order line */
.gw-book-foot { display: flex; align-items: center; justify-content: center; gap: 14px; min-height: 52px; }
.gw-book-purse { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; background: rgba(12, 10, 20, .55); color: var(--cat-gold);
  font: 700 20px/1 var(--f-body); box-shadow: 0 0 0 1px rgba(240, 172, 74, .3); }
.gw-book-purse .gw-price { color: inherit; font: inherit; }
.gw-book-purse .gw-ico { width: 20px; height: 20px; color: var(--cat-gold); }
.gw-book-order { min-height: 48px; padding: 4px 22px 2px; display: inline-flex; align-items: center; gap: 6px; border: 0; cursor: pointer; border-radius: 3px;
  background-color: var(--cat-paper); background-image: ${PAPER_NOISE}; color: var(--cat-ink); font: 700 20px/1 var(--f-body); letter-spacing: .02em;
  box-shadow: 0 0 0 1.5px var(--cat-ink) inset, 0 0 0 4px var(--cat-paper) inset, 0 0 0 5px var(--cat-ink-2) inset, 0 4px 12px rgba(0,0,0,.5); transform: rotate(-.6deg);
  animation: gwMbSlip .35s ease-out both; -webkit-tap-highlight-color: transparent; }
.gw-book-order .gw-ico { width: 20px; height: 20px; color: var(--cat-amber); }
.gw-book-order b { color: var(--cat-amber); }
.gw-book-order:hover, .gw-book-order:focus-visible { outline: none; box-shadow: 0 0 0 1.5px var(--cat-ink) inset, 0 0 0 4px var(--cat-paper) inset, 0 0 0 5px var(--cat-ink) inset, 0 0 18px rgba(255, 190, 110, .45); }
.gw-book-order[disabled] { cursor: default; color: var(--cat-faint); animation: none; }
.gw-book-order[disabled] b, .gw-book-order[disabled] .gw-ico { color: var(--cat-faint); }
@keyframes gwMbSlip { from { opacity: 0; transform: translateY(8px) rotate(-.6deg); } }
.gw-book-close { position: absolute; top: -6px; right: -6px; z-index: 8; width: 44px; height: 44px; border-radius: 50%; border: 0; cursor: pointer; display: flex; align-items: center; justify-content: center;
  background: rgba(12, 10, 20, .6); color: rgba(236, 230, 244, .85); box-shadow: 0 0 0 1px rgba(236, 230, 244, .25); }
.gw-book-close svg { width: 22px; height: 22px; }
.gw-book-close:hover, .gw-book-close:focus-visible { color: #fff; outline: none; box-shadow: 0 0 0 1.5px rgba(255, 200, 130, .7); }
.gw-book[data-layout=desktop] .gw-book-close { right: -58px; top: -10px; }
/* the phone's plate: the drawing beside its words */
.gw-book[data-layout=phone] .gw-mb-page { padding: 10px 12px 10px; }
.gw-book[data-layout=phone] .gw-plate { display: grid; grid-template-columns: minmax(0, 44%) minmax(0, 1fr); grid-template-rows: auto auto auto 1fr; column-gap: 8px; align-items: start; padding: 8px 4px 4px; }
.gw-book[data-layout=phone] .gw-plate-art { grid-column: 1; grid-row: 1 / span 4; height: 100%; }
.gw-book[data-layout=phone] .gw-plate-kick, .gw-book[data-layout=phone] .gw-plate-name, .gw-book[data-layout=phone] .gw-plate-line, .gw-book[data-layout=phone] .gw-plate-hours,
.gw-book[data-layout=phone] .gw-plate-soon, .gw-book[data-layout=phone] .gw-seals { grid-column: 2; text-align: left; justify-content: flex-start; }
.gw-book[data-layout=phone] .gw-plate-name { white-space: normal; width: 114%; margin: 2px 0; transform-origin: 0 50%; font-size: 21px; line-height: 1.04; text-align: left; }
.gw-book[data-layout=phone] .gw-plate-line { -webkit-line-clamp: 3; text-align: left; margin-top: 4px; flex: 1; }
.gw-book[data-layout=phone] .gw-plate-hours { grid-row: 3; margin-top: 4px; }
.gw-book[data-layout=phone] .gw-plate-low { grid-column: 2; grid-row: 4; flex-direction: column; align-items: stretch; justify-content: space-between; }
.gw-book[data-layout=phone] .gw-plate-low .gw-plate-price { align-self: flex-end; }
.gw-book[data-layout=phone] .gw-mb-title { font-size: 34px; }
.gw-book[data-layout=phone] .gw-mb-chap h3 { font-size: 24px; }
/* a name with a long word (THOUSANDCAST) set a size smaller, so the word is never cut; a lone plate on a page of two takes its width */
.gw-book .gw-plate-name.gw-long { font-size: 17px; }
.gw-mb-grid[data-rows="1"] .gw-plate:only-child { grid-column: 1 / -1; }
/* a short spread (960 x 540): an item to a half-page row, its engraving beside its words as a mail-order catalogue sets them, so the
   drawing keeps its size; the plate's kicker is the chapter's head already; the tier numeral in the drawing's corner, clear of the name;
   a map has its page to itself (the plate as on a tall spread) */
.gw-book.gw-short .gw-kick-ch { display: none; }
.gw-book.gw-short .gw-mb-grid[data-rows="2"] .gw-plate { display: grid; grid-template-columns: minmax(0, 44%) minmax(0, 1fr); grid-template-rows: auto auto auto minmax(0, 1fr);
  column-gap: 12px; align-items: start; padding: 8px 6px 4px 2px; }
.gw-book.gw-short .gw-mb-grid[data-rows="2"] .gw-plate-art { grid-column: 1; grid-row: 1 / -1; height: 100%; }
.gw-book.gw-short .gw-mb-grid[data-rows="2"] .gw-plate-kick, .gw-book.gw-short .gw-mb-grid[data-rows="2"] .gw-plate-name,
.gw-book.gw-short .gw-mb-grid[data-rows="2"] .gw-plate-line, .gw-book.gw-short .gw-mb-grid[data-rows="2"] .gw-plate-low { grid-column: 2; text-align: left; }
.gw-book.gw-short .gw-mb-grid[data-rows="2"] .gw-plate-name { width: 114%; margin: 2px 0 0; transform: scaleX(.88); transform-origin: 0 50%; font-size: 21px; line-height: 1.02; }
.gw-book.gw-short .gw-mb-grid[data-rows="2"] .gw-plate-name.gw-long { font-size: 18px; }
.gw-book.gw-short .gw-mb-grid[data-rows="2"] .gw-plate-line { margin-top: 6px; -webkit-line-clamp: 4; line-height: 1.12; }
.gw-book.gw-short .gw-mb-grid[data-rows="2"] .gw-plate-low { grid-row: 4; align-self: end; }
.gw-book.gw-short .gw-mb-grid[data-rows="2"] .gw-plate-num { left: 6px; right: auto; top: 6px; }
.gw-book.gw-short .gw-mb-grid[data-rows="2"] .gw-plate-art { box-sizing: border-box; padding-top: 20px; }   /* (the drawing below the numeral) */
/* ("Yours." on the drawing, set a size smaller and lower, the name and its line left readable) */
.gw-book.gw-short .gw-mb-grid[data-rows="2"] .gw-mb-stamp { left: 21%; top: 56%; padding: 3px 10px 1px; font-size: 22px; letter-spacing: .08em; }
.gw-book.gw-short .gw-mb-grid[data-cols="1"] .gw-plate:nth-child(2n) { border-left: 0; }
.gw-book.gw-short .gw-mb-grid[data-cols="1"] .gw-plate:nth-child(n+2) { border-top: 1px solid var(--cat-ink-2); }
/* a low spread (a phone turned to landscape, 844 x 390): an item a page at the book's full height; Murk's line and the foot (the purse
   and the order line) in a column beside the book, the fore-edge tabs between them */
.gw-book.gw-low { display: grid; grid-template-columns: auto minmax(0, 186px); grid-template-rows: minmax(0, 1fr) auto; align-items: center; column-gap: 0; row-gap: 12px; }
.gw-book.gw-low .gw-book-frame { grid-column: 1; grid-row: 1 / span 2; margin-right: 108px; }
.gw-book.gw-low .gw-murk-line { grid-column: 2; grid-row: 1; align-self: end; max-width: 186px; text-align: left; font-size: 18px; }
.gw-book.gw-low .gw-book-foot { grid-column: 2; grid-row: 2; align-self: start; flex-direction: column; align-items: flex-start; gap: 10px; min-height: 0; }
.gw-book.gw-low .gw-book-tabs { top: 52px; margin-left: 0; }
.gw-book.gw-low .gw-kick-ch, .gw-book.gw-low .gw-mb-head .gw-mb-ch { display: none; }
.gw-book.gw-low .gw-mb-head { margin: 0 14px; justify-content: center; }
.gw-book.gw-low .gw-plate-num { top: auto; bottom: 8px; left: 8px; right: auto; }
.gw-book.gw-low .gw-mb-page { padding: 10px 18px 10px; }   /* (the folio's 34 px and this keep the page corners' 44 px clear of the plate) */
.gw-book.gw-low .gw-mb-chap h3 { font-size: 22px; }
/* a narrow low spread (667 x 375, 740 x 360): the fore-edge tabs as glyphs (their words for a reader), the side column 160 px */
.gw-book.gw-low.gw-narrow { grid-template-columns: auto minmax(0, 160px); }
.gw-book.gw-low.gw-narrow .gw-book-frame { margin-right: 66px; }
.gw-book.gw-low.gw-narrow .gw-murk-line { max-width: 160px; }
.gw-book.gw-low.gw-narrow .gw-book-tabs { top: 40px; gap: 3px; }
.gw-book.gw-low.gw-narrow .gw-book-tab { min-width: 50px; padding: 0 8px 0 10px; justify-content: center; }
.gw-book.gw-low.gw-narrow .gw-book-tab .gw-ico { width: 22px; height: 22px; }
.gw-book.gw-low.gw-narrow .gw-book-order { padding: 4px 14px 2px; }
/* (the running head on one line between the corner ornaments, the cover's name clear of them) */
.gw-book.gw-low.gw-narrow .gw-mb-head { margin: 0 4px; padding: 2px 4px 3px; letter-spacing: .05em; white-space: nowrap; }
.gw-book.gw-low.gw-narrow .gw-mb-title { font-size: 32px; }
/* the phone's running head clear of the corner ornaments */
.gw-book[data-layout=phone] .gw-mb-head { margin: 0 18px; }
/* a tall phone page (390 x 844): the drawing over its words, as on a desktop page, larger */
.gw-book.gw-tall .gw-plate { display: flex; flex-direction: column; align-items: center; padding: 8px 6px 4px; }
.gw-book.gw-tall .gw-plate-kick, .gw-book.gw-tall .gw-plate-name { text-align: center; }
.gw-book.gw-tall .gw-plate-name { transform-origin: 50% 50%; margin: 2px -8%; width: 116%; }
.gw-book.gw-tall .gw-plate-art { height: auto; flex: 1; min-height: 0; }
.gw-book.gw-tall .gw-plate-low { flex-direction: row; align-items: flex-end; }
.gw-book.gw-tall .gw-plate-line { text-align: left; -webkit-line-clamp: 2; }
.gw-book.gw-tall .gw-plate-hours { justify-content: center; }
@media (prefers-reduced-motion: reduce) { .gw-mb-ring path, .gw-mb-stamp.gw-press, .gw-book-order { animation: none; } }
`;

/**
 * The book (ui-loop's createLoopView builds it once): `deps` are ui-loop's own pieces ({K, L, D, TL, h, report, icon, clamTag, shelfCards,
 * goalLine, sealRow, gear, buy, mapArtSizes, drawFishInk, reducedMotion, openOdds, hasOdds, wick, tutorial, close}). → {render(entry, body),
 * onKey(code), debug(), slow(k), go(page), pageOf(focus)}.
 */
export function createMurkBook(deps) {
  const { K, L, D, TL, h, report = () => {}, icon, clamTag } = deps;
  try {
    if (typeof document !== 'undefined' && !document.getElementById('gw-mb-css')) {
      const st = document.createElement('style'); st.id = 'gw-mb-css'; st.textContent = CSS; document.head.appendChild(st);
    }
  } catch (e) { report('cat.css', e); }
  try { registerBookSfx(); } catch (e) { report('cat.sfx', e); }
  // where the book was left this visit (an item on that page, or its kind): cleared at home:enter and a trip's start
  let memo = null, uidN = 0, live = null, lastSwipe = -1e9;
  try { for (const ev of ['home:enter', 'run:start']) K.ctx?.bus?.on?.(ev, () => { memo = null; }); } catch (e) { report('cat.bus', e); }
  // a turned phone or a resized window: the book drawn again at its new size (a spread or a page), at the same item
  try {
    let rt = 0;
    if (typeof addEventListener === 'function') addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { const e = K.entry?.('shelf'); if (e && live?.entry === e) e.render(); }, 180); });
  } catch (e) { report('cat.resize', e); }
  const uid = () => `mc${(uidN = (uidN + 1) % 1e6)}`;
  const vw = () => num(K.vw, typeof innerWidth === 'number' ? innerWidth : 960), vh = () => num(K.vh, typeof innerHeight === 'number' ? innerHeight : 540);

  function shelfModel() {
    const clams = num(Number(L('state')?.clams), 0);
    return { clams, tabs: deps.shelfCards(L('shelf'), { D: D(), clams }).tabs };
  }
  /** The book for this screen: its layout, the page's size and the spread's grid (murk-catalogue's bookSizes: 'full', 'short' at
   *  960 × 540, 'low' on a phone turned to landscape), and its pages. */
  function bookOf(model) {
    const goal = L('goal'), layout = bookLayout(vw(), vh()), z = bookSizes(vw(), vh(), layout);
    return { goal, z, book: bookPages(model.tabs, { layout, size: z.size, odds: deps.hasOdds(), goal, oddsLabel: TL().odds || 'Odds ›' }) };
  }
  const cardOf = (model, id) => { for (const t of model.tabs) for (const c of t.cards) if (c.id === id) return { card: c, tab: t }; return null; };

  // ------------------------------------------------------------------ the pages
  function pageHead(B, p) {
    const head = h('div', 'gw-mb-head');
    const name = h('span', 'gw-mb-name'); name.textContent = TL().goods?.name || '';
    const right = B.layout === 'desktop' ? p.n % 2 === 1 : true;
    const ch = p.kind === 'items' && !p.first ? (B.chapters.find((c) => c.id === p.chapter)?.label || '') : '';
    if (right && ch) { const s = h('span', 'gw-mb-ch'); s.textContent = ch; head.appendChild(s); head.appendChild(name); }
    else { head.appendChild(name); if (ch) { const s = h('span', 'gw-mb-ch'); s.textContent = ch; head.appendChild(s); } }
    return head;
  }
  function plateEl(entry, model, c, tab, B) {
    const S = entry.state;
    const el = h('div', `gw-plate${c.bought ? ' gw-bought' : ''}${c.dear ? ' gw-dear' : ''}${S.marked === c.id ? ' gw-marked' : ''}${c.slot === 'lake' ? ' gw-plate--sealed' : ''}${c.slot === 'place' ? ' gw-plate--map' : ''}`);
    el.dataset.item = c.id;
    if (c.slot === 'place') el.dataset.place = c.placeId || '';
    if (c.slot === 'lake') el.dataset.sealed = c.waterId || '';
    const hit = h('button', 'gw-plate-hit');
    hit.type = 'button';
    hit.setAttribute('aria-label', c.slot === 'place' ? `${c.fishName || ''} ${c.priceText || ''}`.trim() : `${c.name} ${c.bought ? (TL().yours || '') : c.priceText || ''}`.trim());
    if (c.slot !== 'lake') hit.addEventListener('click', (e) => { e.stopPropagation(); if (performance.now() - lastSwipe > 350) mark(entry, c); });
    else hit.tabIndex = -1;
    el.appendChild(hit);
    // the kicker: a hold step's own count ("Hold 4"), a map's place, else the chapter's word
    const kick = h('small', `gw-plate-kick${c.slot === 'hold' || c.slot === 'place' ? '' : ' gw-kick-ch'}`);
    kick.textContent = c.slot === 'hold' ? String(TL().holdName || 'Hold {n}').replace('{n}', String(c.level)) : c.slot === 'place' ? (D().loopPlace?.(c.placeId)?.name || c.name || '') : c.slot === 'lake' ? (c.name || tab.label) : tab.label;
    if (c.slot === 'lake' && !kick.textContent) kick.textContent = tab.label;
    el.appendChild(kick);
    if (c.slot !== 'lake') {
      const nm0 = c.slot === 'place' ? c.fishName || '' : c.name || '';
      const name = h('b', `gw-plate-name${Math.max(0, ...String(nm0).split(/\s+/).map((w) => w.length)) >= 11 ? ' gw-long' : ''}`);
      if (c.slot === 'place') { if (c.star) name.innerHTML = '<i class="gw-map-star" aria-hidden="true">★</i>'; name.appendChild(document.createTextNode(c.fishName || '')); }
      else name.textContent = c.name;
      el.appendChild(name);
    }
    const art = h('div', 'gw-plate-art');
    art.innerHTML = engrave(c, { uid: uid(), geo: c.slot === 'place' ? placeGeo(c.placeId) : null });
    const nm = plateNumeral(c);
    if (nm && B.layout === 'desktop') { const n = h('i', 'gw-plate-num'); n.textContent = nm; n.setAttribute('aria-hidden', 'true'); el.appendChild(n); }
    if (c.slot === 'place') mapArt(art, c, B);
    if (c.consumable && c.count > 0) { const n = h('b', 'gw-plate-count'); n.textContent = String(c.count); art.appendChild(n); }
    el.appendChild(art);
    if (c.slot === 'place' && arr(c.hours).length) (B.layout === 'desktop' ? art : el).appendChild(h('span', 'gw-plate-hours', arr(c.hours).map((g) => `<i aria-hidden="true">${icon(g)}</i>`).join('')));
    if (c.slot === 'lake') {
      try { const row = deps.sealRow(c.seals, { from: 'shelf' }); row.classList.add('gw-seal-row'); el.appendChild(row); } catch (e) { report('cat.seals', e); }
      const soon = h('span', 'gw-plate-soon'); soon.textContent = TL().comingSoon || 'Coming soon'; el.appendChild(soon);
      return el;
    }
    // the one line under the drawing (a desktop: its own row, the full width; a phone: beside the drawing), then the price
    if (c.line && B.layout === 'desktop') { const ln = h('span', 'gw-plate-line'); ln.textContent = c.line; el.appendChild(ln); }
    const low = h('div', 'gw-plate-low');
    if (c.line && B.layout !== 'desktop') { const ln = h('span', 'gw-plate-line'); ln.textContent = c.line; low.appendChild(ln); }
    const price = h('span', 'gw-plate-price', c.price == null ? '' : clamTag(c.price));
    if (S.marked === c.id && !c.bought) price.insertAdjacentHTML('beforeend', RING);
    low.appendChild(price);
    el.appendChild(low);
    if (c.bought) {
      const st = h('span', `gw-mb-stamp${S.stamp === c.id ? ' gw-press' : ''}`);
      st.textContent = c.buyWord || TL().yours || 'Yours.';
      el.appendChild(st);
    }
    return el;
  }
  /** A place map's geometry for its engraving: its water's rim radius and isles, the place, and the mooring the way starts from. */
  function placeGeo(placeId) {
    try {
      const pl = D().loopPlace?.(placeId), z = D().ZONE_BY_ID?.[pl?.zone || 'mossmere'], A = z?.arena;
      if (!pl || !A) return null;
      const dock = arr(A.docks)[0];
      return { R: num(A.radius, 60), isles: arr(A.islands).map((q) => ({ x: num(q.x), z: num(q.z), r: num(q.r, 4) })), at: { x: num(pl.x), z: num(pl.z) },
        from: dock ? { x: num(dock.x), z: num(dock.z) } : null };
    } catch { return null; }
  }
  /** A map plate's fish, drawn in the page's ink beside the Wick at one scale (SPEC §8.4, M1.md §2.4: "life-size beside the Wick"). */
  function mapArt(art, c, B) {
    try {
      const sp = D().SPECIES_BY_ID?.[c.fish] || arr(D().SPECIES).find((s) => s?.id === c.fish);
      if (!sp) return;
      const wrap = h('div', 'gw-plate-map');
      const A = deps.mapArtSizes(D(), sp, B.layout === 'phone' ? { w: 118, h: 56 } : { w: Math.max(110, Math.min(170, (live?.pw || 340) / 2 - 30)), h: 64 });
      const wk = h('span', 'gw-map-wick', wickInk({ uid: uid() }));
      wk.style.width = `${A.wick.w.toFixed(1)}px`; wk.style.height = `${A.wick.h.toFixed(1)}px`;
      const cv = h('canvas', '');
      deps.drawFishInk(cv, sp, { w: Math.max(8, Math.round(A.fish.w)), h: Math.max(6, Math.round(A.fish.h)), pad: 0.04, gain: 7, color: '#261d2c' });
      wrap.appendChild(wk); wrap.appendChild(cv);
      art.appendChild(wrap);
    } catch (e) { report('cat.mapArt', e); }
  }
  function coverEl(entry, B, goal) {
    const box = h('div', 'gw-mb-cover');
    const t = h('h2', 'gw-mb-title'); t.textContent = TL().goods?.name || ''; box.appendChild(t);
    box.insertAdjacentHTML('beforeend', FLOURISH);
    const motto = TL().murk?.firstSale;
    if (motto) { const m = h('p', 'gw-mb-motto'); m.textContent = motto; box.appendChild(m); }
    const art = h('div', 'gw-mb-coverart', B.layout === 'phone' ? frontispiece({ uid: uid() }) : endPlate({ uid: uid() }));
    box.appendChild(art);
    // Murk's orders: his chalk slate tipped into the cover (lane 4's board, unchanged)
    try { deps.gear.shelfBoard(box, null, entry); } catch (e) { report('cat.orders', e); }
    const g = deps.tutorial?.() ? null : deps.goalLine(goal, { D: D(), wick: deps.wick() });
    if (g) { const gl = h('p', 'gw-mb-goal', g.html); gl.dataset.goal = g.id || ''; box.appendChild(gl); }
    return box;
  }
  function pageEl(entry, model, B, n, goal) {
    const p = B.pages[n];
    const pg = h('section', `gw-mb-page gw-mb-page--${p?.kind || 'end'}`);
    pg.dataset.page = String(n);
    if (!p) return pg;
    pg.insertAdjacentHTML('beforeend', `${CORNER.replace('gw-mb-corner', 'gw-mb-corner c-tl')}${CORNER.replace('gw-mb-corner', 'gw-mb-corner c-tr')}${CORNER.replace('gw-mb-corner', 'gw-mb-corner c-bl')}${CORNER.replace('gw-mb-corner', 'gw-mb-corner c-br')}`);
    if (p.kind !== 'front' && p.kind !== 'cover') pg.appendChild(pageHead(B, p));
    const body = h('div', 'gw-mb-body');
    if (p.kind === 'front') body.appendChild(h('div', 'gw-mb-frontis', frontispiece({ uid: uid() })));
    else if (p.kind === 'cover') body.appendChild(coverEl(entry, B, goal));
    else if (p.kind === 'odds') {
      const o = h('div', 'gw-mb-odds', ledgerPlate({ uid: uid() }));
      const b = h('button', 'gw-shelf-odds');
      b.type = 'button'; b.textContent = TL().odds || 'Odds ›';
      b.addEventListener('click', (e) => { e.stopPropagation(); K.sfx?.('ui_click'); deps.openOdds(); });
      o.appendChild(b);
      body.appendChild(o);
    } else if (p.kind === 'end') body.appendChild(h('div', 'gw-mb-end', endPlate({ uid: uid() })));
    else {
      const tab = model.tabs.find((t) => t.id === p.chapter);
      if (p.first) {
        const ch = h('div', 'gw-mb-chap');
        const h3 = h('h3', ''); h3.textContent = tab?.label || ''; ch.appendChild(h3);
        ch.insertAdjacentHTML('beforeend', RULE);
        body.appendChild(ch);
      }
      const grid = h('div', 'gw-mb-grid');
      grid.style.setProperty('--cols', String(p.cols || B.cols)); grid.style.setProperty('--rows', String(p.rows || B.rows));
      grid.dataset.cols = String(p.cols || B.cols); grid.dataset.rows = String(p.rows || B.rows);
      for (const id of p.items) { const f = cardOf(model, id); if (f) grid.appendChild(plateEl(entry, model, f.card, f.tab, B)); }
      body.appendChild(grid);
      if (goal && p.items.includes(goal.id) && !deps.tutorial?.()) pg.appendChild(h('i', 'gw-mb-ribbon'));
    }
    pg.appendChild(body);
    const foot = h('div', 'gw-mb-foot');
    if (p.folio != null) foot.textContent = String(p.folio);
    pg.appendChild(foot);
    return pg;
  }

  // ------------------------------------------------------------------ the book
  function render(entry, body) {
    const S = entry.state;
    const model = shelfModel(), { goal, z, book: B } = bookOf(model);
    const prevLayout = S.layout;
    S.layout = `${B.layout}:${B.size}`;   // (a turn to another grid reopens at the item shown: its page differs there)
    // where to open: the card or tab asked for (the Chart's priced row, the sealed card's gear seal), else where it was left this visit,
    // else the goal's page, else the cover
    if (S.page == null || prevLayout !== S.layout || ((S.focus || S.tab) && !S.focused)) {
      let p = null;
      if ((S.focus || S.tab) && !S.focused) {
        S.focused = true; p = focusPage(B, S.focus) ?? focusPage(B, S.tab);
        if (S.focus != null) S.focusCard = [String(S.focus), `place:${S.focus}`].find((id) => id in B.itemPage) || null;
      }
      if (p == null && S.anchor) p = focusPage(B, S.anchor) ?? (S.anchor === 'odds' ? B.chapters.find((c) => c.id === 'odds')?.page : null);
      if (p == null && memo && S.page == null) p = focusPage(B, memo.anchor) ?? B.pages.findIndex((x) => x.kind === memo.anchor);
      if (p == null || p < 0) p = B.goalPage ?? (B.layout === 'desktop' ? 0 : 0);
      S.page = spreadPages(B, spreadOf(B, p))[0];
    }
    S.page = spreadPages(B, spreadOf(B, S.page))[0];
    const { pw, ph } = z;
    const root = h('div', 'gw-book');
    root.dataset.loop = 'shelf';
    root.dataset.layout = B.layout;
    root.style.setProperty('--pw', `${pw}px`); root.style.setProperty('--ph', `${ph}px`); root.style.setProperty('--turn', `${BOOK.turn}s`);
    if (B.layout === 'phone' && ph >= 600) root.classList.add('gw-tall');   // (a tall phone page: each drawing over its words, larger)
    if (B.size === 'short') root.classList.add('gw-short');   // (a short spread, 960 x 540: an item to a half-page row, its engraving beside its words)
    if (B.size === 'low') root.classList.add('gw-low');       // (a phone turned to landscape: an item a page, Murk's line and the purse beside the book)
    const glyphTabs = B.layout === 'phone' || (B.size === 'low' && z.narrow === true);
    if (glyphTabs && B.layout === 'desktop') root.classList.add('gw-narrow');   // (667 x 375, 740 x 360: the tabs as glyphs, a narrower side column)
    const line = h('p', `gw-murk-line${S.line ? ' gw-in' : ''}`);
    line.textContent = S.line || '';
    root.appendChild(line);
    const frame = h('div', 'gw-book-frame');
    const spread = h('div', 'gw-book-spread');
    frame.appendChild(spread);
    // the fore-edge tabs: a chapter each, and the gear log's
    const tabs = h('nav', 'gw-book-tabs');
    tabs.setAttribute('role', 'tablist');
    const TAB_ICON = { tackle: 'rod', raft: 'hull', bait: 'worm', maps: 'map', home: 'hearth', odds: 'ledger' };
    for (const ch of B.chapters) {
      const b = h('button', `gw-tab gw-book-tab gw-book-tab--${ch.id}`);
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.dataset.chapter = ch.id;
      const word = ch.id === 'odds' ? (TL().odds || 'Odds ›') : ch.label;
      b.innerHTML = glyphTabs ? `<span class="gw-vh">${escT(word)}</span>${icon(TAB_ICON[ch.id] || 'star')}` : `<span>${escT(word)}</span>`;
      b.setAttribute('aria-label', word);
      b.addEventListener('click', (e) => { e.stopPropagation(); K.sfx?.('ui_click', { volume: 0.4 }); go(entry, ch.page); });
      tabs.appendChild(b);
    }
    frame.appendChild(tabs);
    const close = h('button', 'gw-book-close', CLOSE);
    close.type = 'button'; close.dataset.action = 'close'; close.setAttribute('aria-label', 'Escape');
    close.addEventListener('click', (e) => { e.stopPropagation(); deps.close(); });
    frame.appendChild(close);
    root.appendChild(frame);
    const foot = h('div', 'gw-book-foot');
    root.appendChild(foot);
    body.appendChild(root);
    live = { entry, model, B, goal, root, spread, tabs, foot, pw, ph };
    paintSpread();
    paintFoot();
    swipe(root, entry);
    // the card asked for, focused
    if (S.focusCard) {
      const el = [...spread.querySelectorAll('[data-item]')].find((x) => x.dataset.item === S.focusCard)?.querySelector('.gw-plate-hit');
      S.focusCard = null;
      if (el) requestAnimationFrame(() => { try { el.focus({ preventScroll: true }); } catch { /* ignore */ } });
    }
  }
  const escT = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /** The spread's pages in their slots, the corners, the tab of the chapter shown. */
  function paintSpread() {
    if (!live) return;
    const { entry, model, B, goal, spread, tabs, root } = live, S = entry.state;
    spread.innerHTML = '';
    const pages = spreadPages(B, spreadOf(B, S.page));
    pages.forEach((n, i) => {
      const slot = h('div', `gw-mb-slot gw-mb-slot--${B.layout === 'desktop' ? (i ? 'r' : 'l') : 'one'}`);
      slot.appendChild(pageEl(entry, model, B, n, goal));
      spread.appendChild(slot);
    });
    const first = spreadOf(B, S.page) === 0, last = spreadOf(B, S.page) >= B.spreads - 1;
    const slots = spread.querySelectorAll('.gw-mb-slot');
    const prev = h('button', 'gw-mb-turn gw-mb-turn--prev', CURL(-1));
    prev.type = 'button'; prev.dataset.action = 'prev'; prev.disabled = first; prev.setAttribute('aria-label', '‹');
    prev.addEventListener('click', (e) => { e.stopPropagation(); turn(entry, -1); });
    const next = h('button', 'gw-mb-turn gw-mb-turn--next', CURL(1));
    next.type = 'button'; next.dataset.action = 'next'; next.disabled = last; next.setAttribute('aria-label', '›');
    next.addEventListener('click', (e) => { e.stopPropagation(); turn(entry, 1); });
    slots[0]?.appendChild(prev);
    slots[slots.length - 1]?.appendChild(next);
    // the chapter shown (the right page's on a spread): its tab stands out; data-tab names it
    const shown = pages.map((n) => B.pages[n]).filter(Boolean);
    const ch = (shown.slice().reverse().find((p) => p.chapter) || {}).chapter || (shown.some((p) => p.kind === 'cover') ? '' : '');
    root.dataset.tab = ch || '';
    for (const b of tabs.querySelectorAll('[role=tab]')) b.setAttribute('aria-selected', String(b.dataset.chapter === ch));
    fitMaps(spread); fitRibbons(spread); fitInk(spread);
    const anchorPage = B.pages[pages[pages.length - 1]];
    S.anchor = anchorPage?.items?.[0] || anchorPage?.kind || null;
    memo = { anchor: S.anchor };
  }
  /** The goal's ribbon hung clear of the words it falls across (the running head's and the chapter's head): the first of a few places
   *  along the page's top where it covers no letter (else the one that covers least). */
  function fitRibbons(scope) {
    const go = () => {
      for (const rb of scope.querySelectorAll('.gw-mb-ribbon')) {
        const pg = rb.parentElement, P = pg?.getBoundingClientRect?.();
        if (!P || !P.width) continue;
        const R0 = rb.getBoundingClientRect(), w = R0.width || 18;
        const words = [...pg.querySelectorAll('.gw-mb-head > span, .gw-mb-chap h3')].map((e) => e.getBoundingClientRect()).filter((r) => r.width && r.top < R0.bottom + 2 && r.bottom > R0.top - 2);
        let best = null;
        // (a narrow low page, 201 px at 667 x 375: the running head spans it, so the ribbon may hang at the outer edge, over the corner)
        const narrow = !!live?.root?.classList?.contains('gw-narrow');
        for (const f of narrow ? [0.26, 0.14, 0.4, 0.54, 0.68, 0.9, 0.82] : [0.26, 0.14, 0.4, 0.54, 0.68, 0.82]) {
          const x1 = P.right - f * P.width, x0 = x1 - w;
          const cover = words.reduce((a, r) => a + Math.max(0, Math.min(x1 + 3, r.right) - Math.max(x0 - 3, r.left)), 0);
          if (!best || cover < best.cover) best = { f, cover };
          if (cover <= 0) break;
        }
        if (best) rb.style.right = `${(best.f * 100).toFixed(1)}%`;
      }
    };
    try { go(); requestAnimationFrame(go); } catch (e) { report('cat.ribbon', e); }
  }
  /** On a short or a low spread (960 x 540, a phone turned to landscape) an item's engraving is drawn to its ink: its viewBox cropped to
   *  the drawn strokes (a small margin round them, never more than 1.6 times larger), so a squat tin or a flat keel fills its column
   *  instead of floating small in the 200 x 150 plate (the review of integration B: drawings of 60 px in a 140 px row). */
  function fitInk(scope) {
    if (!live || (live.B.size !== 'short' && live.B.size !== 'low')) return;
    const go = () => {
      for (const svg of scope.querySelectorAll('.gw-plate:not(.gw-plate--map):not(.gw-plate--sealed) .gw-plate-art svg.cat-eng')) {
        if (svg.dataset.ink) continue;
        const vb = svg.viewBox?.baseVal, bb = svg.getBBox?.();
        if (!vb || !vb.width || !bb || !(bb.width > 0) || !(bb.height > 0)) continue;
        const pad = Math.max(bb.width, bb.height) * 0.05;
        let x0 = Math.max(vb.x, bb.x - pad), y0 = Math.max(vb.y, bb.y - pad), x1 = Math.min(vb.x + vb.width, bb.x + bb.width + pad), y1 = Math.min(vb.y + vb.height, bb.y + bb.height + pad);
        // (never more than 1.6 times larger: the crop at least 1 / 1.6 of the plate's width or height, grown about its middle)
        const k = Math.max((x1 - x0) / vb.width, (y1 - y0) / vb.height), need = 1 / 1.6;
        if (k < need) { const g = need / k, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, hw = ((x1 - x0) * g) / 2, hh = ((y1 - y0) * g) / 2; x0 = cx - hw; x1 = cx + hw; y0 = cy - hh; y1 = cy + hh; }
        svg.setAttribute('viewBox', `${x0.toFixed(1)} ${y0.toFixed(1)} ${(x1 - x0).toFixed(1)} ${(y1 - y0).toFixed(1)}`);
        svg.dataset.ink = '1';
      }
    };
    try { go(); } catch (e) { report('cat.fitInk', e); }
  }
  /** A map plate's Wick and fish at one scale, shrunk together to fit the drawing's box (never one without the other). */
  function fitMaps(scope) {
    const go = () => {
      for (const m of scope.querySelectorAll('.gw-plate-map')) {
        const box = m.parentElement?.getBoundingClientRect(), w = m.offsetWidth, hh = m.offsetHeight;
        if (!box || !w || !hh) continue;
        m.style.setProperty('--k', String(Math.min(1, (box.height * 0.94) / hh, (box.width * 0.92) / w).toFixed(3)));
      }
    };
    try { go(); requestAnimationFrame(go); } catch (e) { report('cat.fitMaps', e); }
  }
  /** The foot: the purse, and the order line for the marked item. */
  function paintFoot() {
    if (!live) return;
    const { entry, model, foot } = live, S = entry.state;
    foot.innerHTML = '';
    const purse = h('div', 'gw-book-purse', clamTag(model.clams));
    purse.dataset.purse = '';
    foot.appendChild(purse);
    const f = S.marked ? cardOf(model, S.marked) : null;
    if (!f || f.card.bought || f.card.price == null || f.card.dear) return;   // (too dear: the price dimmed, nothing else, SPEC §8.4)
    const c = f.card, o = orderText(TL(), c.priceText);
    const b = h('button', 'gw-book-order', `${escT(o.before.trimEnd())} ${icon('clam')}<b>${escT(c.priceText)}</b>${escT(o.after)}`);
    b.type = 'button';
    b.dataset.buy = c.id;
    b.dataset.action = 'buy';
    b.addEventListener('click', (e) => { e.stopPropagation(); S.stamp = c.consumable ? null : c.id; deps.buy(entry, c.id); });
    foot.appendChild(b);
  }
  function mark(entry, c) {
    const S = entry.state;
    if (c.bought) { K.sfx?.('ui_hover', { volume: 0.4 }); return; }
    S.marked = S.marked === c.id && !c.consumable ? null : c.id;
    S.stamp = null;
    K.sfx?.('ui_click', { volume: 0.45 });
    paintSpread(); paintFoot();
    if (S.marked) requestAnimationFrame(() => { try { live?.foot.querySelector('[data-buy]')?.focus({ preventScroll: true }); } catch { /* ignore */ } });
  }

  // ------------------------------------------------------------------ turning
  let turning = null, turnScale = 1;
  function go(entry, page) {
    if (!live || live.entry !== entry) return;
    const { B } = live, S = entry.state;
    const from = spreadOf(B, S.page), to = spreadOf(B, page);
    if (to === from) return;
    animateTurn(entry, to > from ? 1 : -1, spreadPages(B, to)[0]);
  }
  function turn(entry, dir) {
    if (!live || live.entry !== entry) return false;
    const S = entry.state, to = turnTo(live.B, S.page, dir);
    if (spreadOf(live.B, to) === spreadOf(live.B, S.page)) return false;
    animateTurn(entry, dir, to);
    return true;
  }
  function animateTurn(entry, dir, toPage) {
    const S = entry.state;
    if (turning) { clearTimeout(turning.t); turning.done(); }
    const { B, model, goal, spread } = live;
    const reduced = deps.reducedMotion();
    try { K.ctx?.audio?.play?.('book_page', { volume: 0.8 }); } catch { /* audio optional */ }
    if (reduced) { S.page = toPage; S.stamp = null; paintSpread(); return; }
    const oldPages = spreadPages(B, spreadOf(B, S.page)), newPages = spreadPages(B, spreadOf(B, toPage));
    const slots = [...spread.querySelectorAll('.gw-mb-slot')];
    const leaf = h('div', 'gw-mb-leaf');
    const front = h('div', 'gw-mb-face gw-mb-face--front'), back = h('div', 'gw-mb-face gw-mb-face--back');
    leaf.appendChild(front); leaf.appendChild(back);
    const T = Math.round(BOOK.turn * 1000 * turnScale);
    const page = (n) => { const el = pageEl(entry, model, B, n, goal); requestAnimationFrame(() => { fitMaps(el); fitRibbons(el); fitInk(el); }); return el; };
    S.stamp = null;
    if (B.layout === 'desktop') {
      // forward: the right page lifts at the gutter and lays down on the left; under it the next right page, behind it the next left
      const fwd = dir > 0;
      const keep = fwd ? 1 : 0, under = fwd ? newPages[1] : newPages[0], backPage = fwd ? newPages[0] : newPages[1];
      const lifting = slots[keep].querySelector('.gw-mb-page');
      front.appendChild(lifting);
      back.appendChild(page(backPage));
      slots[keep].innerHTML = '';
      slots[keep].appendChild(page(under));
      leaf.style.left = fwd ? '50%' : '0';
      leaf.style.transformOrigin = fwd ? '0 50%' : '100% 50%';
      leaf.style.transition = `transform ${T}ms cubic-bezier(.45, .05, .3, 1)`;
      spread.appendChild(leaf);
      void leaf.offsetWidth;
      leaf.style.transform = `rotateY(${fwd ? -180 : 180}deg)`;
    } else {
      // a phone: forward, the page turns away over its left edge; back, the page before turns in over it
      const fwd = dir > 0;
      leaf.style.left = '0';
      leaf.style.transformOrigin = '0 50%';
      leaf.style.transition = `transform ${T}ms cubic-bezier(.45, .05, .3, 1), opacity ${T}ms ease-in`;
      if (fwd) {
        front.appendChild(slots[0].querySelector('.gw-mb-page'));
        slots[0].innerHTML = ''; slots[0].appendChild(page(newPages[0]));
        spread.appendChild(leaf); void leaf.offsetWidth;
        leaf.style.transform = 'rotateY(-100deg)'; leaf.style.opacity = '0.2';
      } else {
        front.appendChild(page(newPages[0]));
        leaf.style.transform = 'rotateY(-100deg)'; leaf.style.opacity = '0.2';
        spread.appendChild(leaf); void leaf.offsetWidth;
        leaf.style.transform = 'rotateY(0deg)'; leaf.style.opacity = '1';
      }
    }
    void oldPages;
    const done = () => { turning = null; S.page = toPage; if (live?.entry === entry) paintSpread(); };
    turning = { t: setTimeout(done, T + 30), done };
  }
  function swipe(root, entry) {
    let st = null;
    root.addEventListener('pointerdown', (e) => { if (e.button != null && e.button !== 0) return; st = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId }; }, { passive: true });
    const end = (e) => {
      if (!st || e.pointerId !== st.id) return;
      const dx = e.clientX - st.x, dy = e.clientY - st.y, dt = performance.now() - st.t;
      st = null;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4 && dt < 900) { lastSwipe = performance.now(); turn(entry, dx < 0 ? 1 : -1); }
    };
    root.addEventListener('pointerup', end, { passive: true });
    root.addEventListener('pointercancel', () => { st = null; }, { passive: true });
  }
  /** The shelf's keys: ←/→ and PageUp/PageDown turn a leaf, Home/End go to the cover and the last page, [ and ] go by chapter. */
  function onKey(code) {
    const e = K.entry?.('shelf');
    if (!e || !live || live.entry !== e) return false;
    const S = e.state, B = live.B;
    if (code === 'ArrowRight' || code === 'PageDown') { turn(e, 1); return true; }
    if (code === 'ArrowLeft' || code === 'PageUp') { turn(e, -1); return true; }
    if (code === 'Home') { go(e, 0); return true; }
    if (code === 'End') { go(e, B.count - 1); return true; }
    if (code === 'BracketRight' || code === 'BracketLeft') {
      const cur = spreadOf(B, S.page), list = B.chapters.map((c) => c.page);
      const tgt = code === 'BracketRight' ? list.find((p) => spreadOf(B, p) > cur) : [...list].reverse().find((p) => spreadOf(B, p) < cur);
      if (tgt != null) go(e, tgt); else if (code === 'BracketLeft') go(e, 0);
      return true;
    }
    return false;
  }
  /** The book's state for the debug hooks and the scenarios: its layout, page, spread, pages and chapters. */
  function debug() {
    if (!live) return null;
    const { B, entry } = live;
    return { layout: B.layout, page: entry.state.page, spread: spreadOf(B, entry.state.page), count: B.count, chapters: B.chapters.map((c) => ({ ...c })), goalPage: B.goalPage,
      marked: entry.state.marked ?? null, turning: !!turning, pages: B.pages.map((p) => ({ kind: p.kind, chapter: p.chapter ?? null, items: p.items.slice() })) };
  }
  return { render, onKey, debug, slow: (k) => { turnScale = Math.max(0.1, Number(k) || 1); }, go: (page) => { const e = K.entry?.('shelf'); if (e) go(e, page); }, pageOf: (focus) => (live ? focusPage(live.B, focus) : null) };
}
