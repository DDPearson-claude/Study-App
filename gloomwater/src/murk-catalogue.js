// murk-catalogue.js — Murk's shelf as a printed catalogue (the user's words of 16 November 2026: "make buying things from murk look
// like an actual brochure we browse the pages of"): the pure half. No DOM and no data import: the view (src/ui-catalogue-murk.js)
// passes in ui-loop's shelfCards model, the layout and the goal; node tests (tools/tests/murk-catalogue.test.mjs) prove the pages.
//
//   bookLayout(vw, vh)                    'desktop' (a two-page spread) or 'phone' (one page at a time, full width)
//   bookSizes(vw, vh, layout)             the page's px and the spread's grid: 'full', 'short' (960 × 540: an item to a half-page row)
//                                         or 'low' (a phone turned to landscape: an item a page; `narrow` under 800 px wide)
//   bookPages(tabs, {layout, size, odds, goal}) the book: its pages in order (the frontispiece and the cover, one chapter per shelf tab in the
//                                         shelf's order, each opening on a fresh page with its tab word, its items set in a ruled grid
//                                         of BOOK[layout].per (a desktop's maps two a page), the gear log's page last), its chapters (the fore-edge tabs), the page of
//                                         every item and of the goal item. The page count depends only on how many items each chapter
//                                         holds, never on what is bought (a card bought on this visit keeps its place, "Yours.")
//   spreadOf · spreadPages · turnTo       the desktop's spreads (pages 2k and 2k + 1) and a turn by one leaf (two pages on a desktop)
//   focusPage(book, focus)                the page of a card id ('rod:1'), a place id ('lily_maze'), or a chapter id ('maps')
//   orderText(TL, priceText)              the order line's words: TEXT_LOOP.goods.buy, "Buy · {price}"
//
// Words: TEXT_LOOP.goods (the name on the running head and the cover, the order line) and the tab words; nothing else is printed.

const arr = (v) => (Array.isArray(v) ? v : []);
const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);

/** The book's grids: a desktop page holds 2 × 2 items, a phone page 1 × 2 (text ≥ 16 px at 358 px wide). */
export const BOOK = Object.freeze({
  // (a desktop's Maps chapter sets its map plates two to a page, side by side and the page's full height: a map is drawn large)
  desktop: Object.freeze({ per: 4, cols: 2, rows: 2, leaf: 2, chapters: Object.freeze({ maps: Object.freeze({ per: 2, cols: 2, rows: 1 }) }) }),
  phone: Object.freeze({ per: 2, cols: 1, rows: 2, leaf: 1 }),
  // a short spread (a page under `shortPage` px tall, 960 × 540): one item to a half-page row, its engraving beside its words, so the
  // drawing stays large; a map plate (or the sealed water's) has its page to itself
  short: Object.freeze({ per: 2, cols: 1, rows: 2, leaf: 2, chapters: Object.freeze({ maps: Object.freeze({ per: 1, cols: 1, rows: 1 }) }) }),
  // a low spread (a screen under `lowH` px tall: a phone turned to landscape, 844 × 390): one item a page, Murk's line and the purse
  // set beside the book
  low: Object.freeze({ per: 1, cols: 1, rows: 1, leaf: 2 }),
  // the spread needs room for two pages of at least `minPage` px and the fore-edge tabs; below it (or in portrait) one page at a time
  minPage: 300, edge: 64, turn: 0.45, shortPage: 520, lowH: 480, lowSide: 336,
  // a narrow low screen (a smaller phone turned to landscape, 667 × 375 or 740 × 360: under `lowNarrow` px wide) keeps the low spread
  // with a narrower side column (`lowSideNarrow`: the tabs as glyphs, the line and the foot in 160 px) and pages down to `lowMinPage`;
  // a landscape screen under `lowH` tall and `lowMinW` wide or more is a low spread, never the one-page phone layout (its 420 px page
  // ran off a 375 px screen)
  lowNarrow: 800, lowSideNarrow: 264, lowMinPage: 180, lowMinW: 600, lowAspect: 1.5,
});
/** The chapters, in the shelf's order (SPEC §8.4: Tackle · Raft · Bait · Maps · Home); the gear log's page closes the book. */
export const CHAPTERS = Object.freeze(['tackle', 'raft', 'bait', 'maps', 'home']);

/** 'desktop' when two pages fit side by side in landscape, else 'phone'; a landscape screen under BOOK.lowH tall (a phone turned on
 *  its side, 667 × 375 to 844 × 390) is always a spread, so bookSizes gives it the low treatment. Pure. */
export function bookLayout(vw, vh) {
  const w = Number(vw) || 0, h = Number(vh) || 0;
  if (h > 0 && h < BOOK.lowH && w >= BOOK.lowMinW && w > h * BOOK.lowAspect) return 'desktop';
  if (w < BOOK.minPage * 2 + BOOK.edge * 2 + 32) return 'phone';
  return w >= h * 1.05 ? 'desktop' : 'phone';
}

/**
 * The page's size for a screen (CSS px) and the spread's grid: {pw, ph, size}. A desktop: two pages side by side with room for the
 * fore-edge tabs ('full'); a page under BOOK.shortPage tall is 'short' (its pages a little wider, an item to a half-page row); a screen
 * under BOOK.lowH tall is 'low' (one item a page, the book's full height, Murk's line and the purse beside it). A phone: one page,
 * full width ('full'). Pure.
 */
export function bookSizes(vw, vh, layout = bookLayout(vw, vh)) {
  const W = Number(vw) || 0, H = Number(vh) || 0;
  if (layout === 'desktop') {
    if (H < BOOK.lowH) {
      const ph = Math.max(240, H - 44);
      if (W < BOOK.lowNarrow) return { pw: Math.floor(Math.max(BOOK.lowMinPage, Math.min((W - BOOK.lowSideNarrow) / 2, ph * 0.9))), ph: Math.floor(ph), size: 'low', narrow: true };
      return { pw: Math.floor(Math.max(220, Math.min((W - BOOK.lowSide) / 2, ph * 0.9))), ph: Math.floor(ph), size: 'low' };
    }
    const ph0 = Math.max(300, Math.min(H - 132, 700));
    const pw = Math.max(BOOK.minPage, Math.min((W - 220) / 2, ph0 * 0.76));
    const ph = Math.floor(Math.min(ph0, pw / 0.62));
    if (ph < BOOK.shortPage) return { pw: Math.floor(Math.max(BOOK.minPage, Math.min((W - 220) / 2, ph * 0.92))), ph, size: 'short' };
    return { pw: Math.floor(pw), ph, size: 'full' };
  }
  return { pw: Math.floor(Math.min(W - 20, 520)), ph: Math.floor(Math.max(420, Math.min(H - 176, 760))), size: 'full' };
}

/**
 * The book from shelfCards' tabs ([{id, label, cards: [{id, …}]}]). Pages: {n, kind: 'front' | 'cover' | 'items' | 'odds' | 'end',
 * chapter, label, first (the chapter's opening page: it carries the tab word as its head), items (card ids, at most `per`), part
 * (the chapter's page count so far), folio (the printed page number; none on the frontispiece and the cover)}. On a desktop the book is
 * an even number of pages (an end leaf when needed) so every spread is whole.
 */
export function bookPages(tabs, { layout = 'desktop', size = 'full', odds = false, goal = null, oddsLabel = '' } = {}) {
  const L = layout === 'phone' ? 'phone' : 'desktop';
  const Z = L === 'desktop' && (size === 'short' || size === 'low') ? size : 'full', G = BOOK[Z === 'full' ? L : Z], per = G.per;
  const pages = [], chapters = [], itemPage = {};
  if (L === 'desktop') pages.push({ kind: 'front' });
  pages.push({ kind: 'cover' });
  const byId = new Map(arr(tabs).filter((t) => isObj(t) && typeof t.id === 'string').map((t) => [t.id, t]));
  const order = [...CHAPTERS, ...[...byId.keys()].filter((id) => !CHAPTERS.includes(id))];
  for (const id of order) {
    const t = byId.get(id);
    const cards = arr(t?.cards).filter((c) => isObj(c) && c.id != null);
    if (!cards.length) continue;
    chapters.push({ id, label: String(t.label ?? id), page: pages.length });
    const CG = G.chapters?.[id] || null, n = CG?.per || per, cols = CG?.cols || G.cols, rows = CG?.rows || G.rows;
    for (let i = 0, part = 0; i < cards.length; i += n, part++) {
      const items = cards.slice(i, i + n).map((c) => String(c.id));
      for (const it of items) if (!(it in itemPage)) itemPage[it] = pages.length;
      pages.push({ kind: 'items', chapter: id, label: String(t.label ?? id), first: i === 0, items, part, cols, rows });
    }
  }
  if (odds) { chapters.push({ id: 'odds', label: String(oddsLabel || 'Odds'), page: pages.length }); pages.push({ kind: 'odds', chapter: 'odds' }); }
  if (L === 'desktop' && pages.length % 2) pages.push({ kind: 'end' });
  pages.forEach((p, i) => { p.n = i; p.folio = p.kind === 'front' || p.kind === 'cover' ? null : i; if (!('items' in p)) p.items = []; });
  const goalId = isObj(goal) ? goal.id : goal;
  const goalPage = goalId != null && String(goalId) in itemPage ? itemPage[String(goalId)] : null;
  return { layout: L, size: Z, per, cols: G.cols, rows: G.rows, leaf: G.leaf, pages, chapters, itemPage, goalPage, count: pages.length,
    spreads: L === 'desktop' ? pages.length / 2 : pages.length };
}

/** The spread a page is on (a desktop: pages 2k and 2k + 1 face each other; a phone: the page itself). */
export function spreadOf(book, page) {
  const n = Math.max(0, Math.min(Math.floor(Number(page) || 0), (book?.count || 1) - 1));
  return book?.layout === 'desktop' ? Math.floor(n / 2) : n;
}
/** The pages a spread shows: [left, right] on a desktop, [page] on a phone. */
export function spreadPages(book, spread) {
  const s = Math.max(0, Math.min(Math.floor(Number(spread) || 0), (book?.spreads || 1) - 1));
  return book?.layout === 'desktop' ? [s * 2, s * 2 + 1] : [s];
}
/** The first page shown after turning `dir` leaves (+1 forward, −1 back) from `page`, held inside the book. */
export function turnTo(book, page, dir) {
  const s = spreadOf(book, page) + Math.sign(Number(dir) || 0);
  const k = Math.max(0, Math.min(s, (book?.spreads || 1) - 1));
  return spreadPages(book, k)[0];
}
/** The page to open at for a focus: a card id, a place id (its map 'place:<id>'), or a chapter id; null when the book has none. */
export function focusPage(book, focus) {
  if (focus == null || !book) return null;
  const f = String(focus);
  for (const id of [f, `place:${f}`]) if (id in book.itemPage) return book.itemPage[id];
  const ch = book.chapters.find((c) => c.id === f);
  return ch ? ch.page : null;
}
/** The order line under a marked item: "Buy · {price}" (TEXT_LOOP.goods.buy), split round the price for the clam glyph. */
export function orderText(TL, priceText = '') {
  const tpl = String(TL?.goods?.buy || 'Buy · {price}');
  const [a, b = ''] = tpl.split('{price}');
  return { text: tpl.replace('{price}', String(priceText)), before: a, after: b };
}
