// murk-catalogue.js — Murk's shelf as a printed catalogue (the user's words of 16 November 2026: "make buying things from murk look
// like an actual brochure we browse the pages of"): the pure half. No DOM and no data import: the view (src/ui-catalogue-murk.js)
// passes in ui-loop's shelfCards model, the layout and the goal; node tests (tools/tests/murk-catalogue.test.mjs) prove the pages.
//
//   bookLayout(vw, vh)                    'desktop' (a two-page spread) or 'phone' (one page at a time, full width)
//   bookPages(tabs, {layout, odds, goal}) the book: its pages in order (the frontispiece and the cover, one chapter per shelf tab in the
//                                         shelf's order, each opening on a fresh page with its tab word, its items set in a ruled grid
//                                         of BOOK[layout].per, the gear log's page last), its chapters (the fore-edge tabs), the page of
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
  desktop: Object.freeze({ per: 4, cols: 2, rows: 2, leaf: 2 }),
  phone: Object.freeze({ per: 2, cols: 1, rows: 2, leaf: 1 }),
  // the spread needs room for two pages of at least `minPage` px and the fore-edge tabs; below it (or in portrait) one page at a time
  minPage: 300, edge: 64, turn: 0.45,
});
/** The chapters, in the shelf's order (SPEC §8.4: Tackle · Raft · Bait · Maps · Home); the gear log's page closes the book. */
export const CHAPTERS = Object.freeze(['tackle', 'raft', 'bait', 'maps', 'home']);

/** 'desktop' when two pages fit side by side in landscape, else 'phone'. Pure. */
export function bookLayout(vw, vh) {
  const w = Number(vw) || 0, h = Number(vh) || 0;
  if (w < BOOK.minPage * 2 + BOOK.edge * 2 + 32) return 'phone';
  return w >= h * 1.05 ? 'desktop' : 'phone';
}

/**
 * The book from shelfCards' tabs ([{id, label, cards: [{id, …}]}]). Pages: {n, kind: 'front' | 'cover' | 'items' | 'odds' | 'end',
 * chapter, label, first (the chapter's opening page: it carries the tab word as its head), items (card ids, at most `per`), part
 * (the chapter's page count so far), folio (the printed page number; none on the frontispiece and the cover)}. On a desktop the book is
 * an even number of pages (an end leaf when needed) so every spread is whole.
 */
export function bookPages(tabs, { layout = 'desktop', odds = false, goal = null, oddsLabel = '' } = {}) {
  const L = BOOK[layout] ? layout : 'desktop', G = BOOK[L], per = G.per;
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
    for (let i = 0, part = 0; i < cards.length; i += per, part++) {
      const items = cards.slice(i, i + per).map((c) => String(c.id));
      for (const it of items) if (!(it in itemPage)) itemPage[it] = pages.length;
      pages.push({ kind: 'items', chapter: id, label: String(t.label ?? id), first: i === 0, items, part });
    }
  }
  if (odds) { chapters.push({ id: 'odds', label: String(oddsLabel || 'Odds'), page: pages.length }); pages.push({ kind: 'odds', chapter: 'odds' }); }
  if (L === 'desktop' && pages.length % 2) pages.push({ kind: 'end' });
  pages.forEach((p, i) => { p.n = i; p.folio = p.kind === 'front' || p.kind === 'cover' ? null : i; if (!('items' in p)) p.items = []; });
  const goalId = isObj(goal) ? goal.id : goal;
  const goalPage = goalId != null && String(goalId) in itemPage ? itemPage[String(goalId)] : null;
  return { layout: L, per, cols: G.cols, rows: G.rows, leaf: G.leaf, pages, chapters, itemPage, goalPage, count: pages.length,
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
