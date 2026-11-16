// Murk's catalogue (the user's words of 16 November 2026: the shelf as a printed brochure browsed page by page), in node: the pure
// pagination (src/murk-catalogue.js: items → chapters → pages for a desktop spread and a phone page, the goal's page, the page count
// stable as items are bought), the engravings (src/murk-engrave.js: one for every item a save can see, ink and paper only, no flat
// colour and no gradient), and the words (TEXT_LOOP.goods on the allow-list; no percentage anywhere in the book's own words).
//   node tools/tests/murk-catalogue.test.mjs   (or node tools/check.mjs)
import { loadLoopData } from './loop-fixture.mjs';

const D = await loadLoopData({ query: 'murk-cat' });
const U = await import('../../src/ui-loop.js');
const PL = await import('../../src/progression-loop.js');
const HS = await import('../../src/home-shelf.js');
const LG = await import('../../src/loop-gear.js');
const M = await import('../../src/murk-catalogue.js');
const E = await import('../../src/murk-engrave.js');

let pass = 0, fail = 0;
function ok(cond, msg, extra) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra) : ''); } }
const eq = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);
const section = (s) => console.log(`- ${s}`);
const TL = D.TEXT_LOOP;

/** A small ledger on the real shelf (progression-loop's shelfItems, the session's "Yours." rule) and its buy, as the ledger's. */
function fake(o = {}) {
  const ml = { ...PL.freshLoop(D), ...o }, s = { session: [] };
  const items = () => PL.shelfItems(D, ml, s.session, { meta: { journal: {}, loop: ml } });
  const TABS = ['tackle', 'raft', 'bait', 'maps', 'home'];
  return {
    s: ml,
    shelf: () => ({ tabs: TABS.map((id) => ({ id, items: items().filter((i) => i.tab === id) })).filter((t) => t.items.length) }),
    goal: () => PL.goalOf(items()),
    buy(id) {
      const it = items().find((i) => i.id === id && !i.bought);
      if (!it || it.sealed || it.price == null || ml.clams < it.price) return { ok: false };
      ml.clams -= it.price;
      if (it.slot === 'hold') ml.holdSlots = it.level;
      else if (HS.applyHome(D, ml, it)) { /* a home level or a look */ }
      else if (it.slot === 'place') ml.maps.places.push(it.placeId);
      else if (it.slot === 'bait') { /* a consumable */ }
      else if (LG.applyGear(D, ml, it)) { /* a lure, a tin, a raft part, the Order Board */ }
      else ml.tackle[it.slot] = it.level;
      if (it.consumable !== true && !s.session.includes(id)) s.session.push(id);
      return { ok: true };
    },
  };
}
/** A shelf model as the view builds it (shelfCards of the ledger's shelf). */
const cardsOf = (L, clams = 0) => U.shelfCards(L.shelf(), { D, clams }).tabs;

section('bookLayout: a spread where two pages fit in landscape, else one page at a time');
{
  eq(M.bookLayout(960, 540), 'desktop', '960 × 540: a spread');
  eq(M.bookLayout(1280, 720), 'desktop', '1280 × 720: a spread');
  eq(M.bookLayout(390, 844), 'phone', '390 × 844: a page');
  eq(M.bookLayout(390, 664), 'phone', "Safari's 390 × 664: a page");
  eq(M.bookLayout(358, 640), 'phone', '358 px wide: a page');
  eq(M.bookLayout(844, 390), 'desktop', 'a phone turned to landscape (844 × 390): a spread');
  eq(M.bookLayout(700, 900), 'phone', 'a tall tablet: a page');
}

section('bookPages: the fresh save (desktop and phone)');
{
  const tabs = cardsOf(fake());
  const counts = Object.fromEntries(tabs.map((t) => [t.id, t.cards.length]));
  ok(tabs.map((t) => t.id).join() === M.CHAPTERS.join(), 'the shelf has all five tabs on a fresh save', tabs.map((t) => t.id));
  for (const layout of ['desktop', 'phone']) {
    const per = M.BOOK[layout].per;
    const b = M.bookPages(tabs, { layout, odds: true, goal: 'hold:4', oddsLabel: TL.odds });
    const ids = b.pages.flatMap((p) => p.items);
    eq(ids, tabs.flatMap((t) => t.cards.map((c) => c.id)), `${layout}: every item once, in the shelf's order`);
    ok(b.pages.every((p) => p.items.length <= per), `${layout}: at most ${per} items a page`);
    eq(b.chapters.map((c) => c.id), [...M.CHAPTERS, 'odds'], `${layout}: a chapter per tab, in the shelf's order, then the gear log's page`);
    ok(b.chapters.every((c) => c.id === 'odds' ? b.pages[c.page].kind === 'odds' : b.pages[c.page].first === true && b.pages[c.page].chapter === c.id), `${layout}: each chapter opens on a fresh page that carries its tab word`);
    ok(b.chapters.filter((c) => c.id !== 'odds').every((c) => c.label === TL.tabs[c.id]), `${layout}: the chapter heads are the tab words`);
    const want = (layout === 'desktop' ? 2 : 1) + Object.values(counts).reduce((a, n) => a + Math.ceil(n / per), 0) + 1;
    eq(b.count, want + (layout === 'desktop' && want % 2 ? 1 : 0), `${layout}: the page count (cover${layout === 'desktop' ? ' and frontispiece' : ''}, chapters, the gear log${layout === 'desktop' ? ', an end leaf when odd' : ''})`);
    eq(b.pages[b.count - (b.pages[b.count - 1].kind === 'end' ? 2 : 1)].kind, 'odds', `${layout}: the gear log's page is the last (the only page with odds)`);
    eq(b.pages.filter((p) => p.kind === 'cover').length, 1, `${layout}: one cover`);
    eq(b.pages[0].kind, layout === 'desktop' ? 'front' : 'cover', `${layout}: the book opens on ${layout === 'desktop' ? 'the frontispiece facing the cover' : 'the cover'}`);
    ok(b.pages[b.goalPage]?.items.includes('hold:4'), `${layout}: the goal's page holds the goal item (Hold 4)`, b.goalPage);
    ok(b.pages.every((p, i) => p.n === i && (p.kind === 'front' || p.kind === 'cover' ? p.folio === null : p.folio === i)), `${layout}: folios on every page but the frontispiece and the cover`);
    if (layout === 'desktop') ok(b.count % 2 === 0 && b.spreads === b.count / 2, 'desktop: whole spreads only');
  }
}

section('bookPages: the page count is stable as items are bought (a bought card keeps its place, "Yours.")');
{
  const L = fake({ clams: 5000 });
  const before = { d: M.bookPages(cardsOf(L), { layout: 'desktop', odds: true }), p: M.bookPages(cardsOf(L), { layout: 'phone', odds: true }) };
  const buys = ['hold:4', 'rod:1', 'line:1', 'reel:1', 'lure:feather_fly', 'oars:1', 'keel:1', 'tin:mireworm', 'orders:1', 'baitBed:1', 'look:slate_dye'];
  for (const id of buys) {
    const r = L.buy(id);
    ok(r?.ok === true, `the ledger buys ${id}`, r);
    const tabs = cardsOf(L, L.s.clams);
    const d = M.bookPages(tabs, { layout: 'desktop', odds: true }), p = M.bookPages(tabs, { layout: 'phone', odds: true });
    ok(d.count === before.d.count && p.count === before.p.count, `after ${id}: the same page count (desktop ${d.count}, phone ${p.count})`);
    eq(d.itemPage, before.d.itemPage, `after ${id}: every item on the same desktop page`);
    eq(p.itemPage, before.p.itemPage, `after ${id}: every item on the same phone page`);
  }
  // the goal moves to the next cheapest card; its page is wherever that card sits
  const g = L.goal();
  const b = M.bookPages(cardsOf(L, L.s.clams), { layout: 'desktop', odds: true, goal: g });
  ok(g && b.pages[b.goalPage]?.items.includes(g.id), 'the goal\'s page follows the goal', { g, page: b.goalPage });
  eq(M.bookPages(cardsOf(L), { layout: 'desktop', goal: 'nope:1' }).goalPage, null, 'a goal not on the shelf: no goal page (the book opens at the cover)');
}

section('spreads, turns and focus');
{
  const b = M.bookPages(cardsOf(fake()), { layout: 'desktop', odds: true });
  eq(M.spreadPages(b, 0), [0, 1], 'the first spread: the frontispiece and the cover');
  eq(M.spreadOf(b, 3), 1, 'page 3 is on spread 1');
  eq(M.turnTo(b, 0, 1), 2, 'a turn forward from the cover: pages 2 and 3');
  eq(M.turnTo(b, 3, -1), 0, 'a turn back from page 3: the cover spread');
  eq(M.turnTo(b, b.count - 1, 1), b.count - 2, 'no turn past the last spread');
  eq(M.turnTo(b, 0, -1), 0, 'no turn before the first');
  const p = M.bookPages(cardsOf(fake()), { layout: 'phone', odds: true });
  eq([M.turnTo(p, 0, 1), M.turnTo(p, 4, -1), M.turnTo(p, p.count - 1, 1)], [1, 3, p.count - 1], 'a phone turns one page at a time');
  eq(M.focusPage(b, 'hold:4'), b.itemPage['hold:4'], 'focus on a card id');
  eq(M.focusPage(b, 'maps'), b.chapters.find((c) => c.id === 'maps').page, 'focus on a chapter');
  const place = Object.keys(b.itemPage).find((id) => id.startsWith('place:'));
  ok(place && M.focusPage(b, place.slice(6)) === b.itemPage[place], 'focus on a place id (the Chart\'s priced row)', place);
  eq(M.focusPage(b, 'nothing'), null, 'an unknown focus: none');
  eq(M.bookPages([], { layout: 'phone' }).count, 1, 'an empty shelf: the cover alone');
}

section('the words: TEXT_LOOP.goods, on the allow-list');
{
  ok(typeof TL.goods?.name === 'string' && TL.goods.name.length > 0 && TL.goods.name.length <= 18, "the catalogue's name is TEXT_LOOP's (the running head and the cover)", TL.goods);
  const o = M.orderText(TL, '30');
  eq(o.text, 'Buy · 30', 'the order line: "Buy · 30"');
  ok(U.textAllowed(TL.goods.name, { D }), 'the name passes ui-loop\'s textAllowed');
  ok(U.textAllowed(o.text, { D }) && U.textAllowed('Buy ·', { D }) && U.textAllowed('Buy · 1.2k', { D }), 'the order line passes textAllowed (whole, and its words before the clam glyph)');
  ok(!U.textAllowed('Buy · lots', { D }), 'the order line takes a number only');
  const all = JSON.stringify(TL.goods);
  ok(!/%/.test(all), 'no percentage in the catalogue\'s words');
}

section('the engravings: one for every item a save can see; ink line, hatching and stipple, no flat colour, no gradient');
{
  const seen = new Set();
  const cardsAll = [];
  for (const meta of [fake(), fake({ holdSlots: 5, tackle: { rod: 2, line: 2, reel: 2 }, raft: { oars: 1, keel: 2, lantern: 1 }, home: { orders: 2, baitBed: 1, wall: 0, lights: 0 } })]) {
    for (const t of cardsOf(meta)) for (const c of t.cards) cardsAll.push(c);
  }
  for (const c of cardsAll) {
    const key = E.plateKey(c);
    if (seen.has(key)) continue;
    seen.add(key);
    const svg = E.engrave(c, { uid: 't' + seen.size });
    ok(typeof svg === 'string' && svg.startsWith('<svg') && svg.length > 600, `${c.id}: an engraving (${key})`, svg?.slice(0, 80));
    ok(!/Gradient/i.test(svg), `${c.id}: no gradient`);
    const fills = [...svg.matchAll(/fill="([^"]+)"/g)].map((m) => m[1]).filter((f) => !['none', 'var(--cat-ink)', 'var(--cat-paper)', 'currentColor'].includes(f) && !f.startsWith('url(#'));
    ok(fills.length === 0, `${c.id}: fills are ink or paper only`, [...new Set(fills)]);
    ok(/<line|<path/.test(svg) && /cat-hatch|stroke-dasharray|<circle/.test(svg), `${c.id}: hatching or stipple`);
  }
  ok(seen.size >= 12, 'a dozen different plates or more across the two saves', seen.size);
  ok(E.engrave({ id: 'tin:cut_strip', slot: 'tin', baitId: 'cut_strip' }, { uid: 'cs' }) !== E.engrave({ id: 'tin:mireworm', slot: 'tin', baitId: 'mireworm' }, { uid: 'cs' }), 'Cut Strip has its own drawing (never sold; its plate is ready)');
  ok(E.engrave({ id: 'x', slot: 'nope' }, { uid: 'z' }).startsWith('<svg'), 'an unknown item still gets a plate (the generic parcel)');
  eq(E.engrave({ id: 'rod:1', slot: 'rod', level: 1 }, { uid: 'a' }), E.engrave({ id: 'rod:1', slot: 'rod', level: 1 }, { uid: 'a' }), 'deterministic (the same plate twice)');
  ok(E.engrave({ id: 'rod:1', slot: 'rod', level: 1 }, { uid: 'a' }) !== E.engrave({ id: 'rod:2', slot: 'rod', level: 2 }, { uid: 'a' }), 'each rod tier its own drawing');
  {
    const pl = D.loopPlace('lily_maze'), A = D.ZONE_BY_ID.mossmere.arena;
    const geo = { R: A.radius, isles: A.islands.map((q) => ({ x: q.x, z: q.z, r: q.r })), at: { x: pl.x, z: pl.z }, from: { x: A.docks[0].x, z: A.docks[0].z } };
    const a = E.engrave({ id: 'place:lily_maze', slot: 'place', placeId: 'lily_maze' }, { uid: 'm', geo }), b = E.engrave({ id: 'place:lily_maze', slot: 'place', placeId: 'lily_maze' }, { uid: 'm' });
    ok(a !== b && a.includes('stroke-dasharray') && !/Gradient/.test(a), "a place map draws its water: the Mossmere's rim and isles, the place's cross and the way from the mooring");
  }
  ok(E.frontispiece({ uid: 'f' }).startsWith('<svg') && !/Gradient/i.test(E.frontispiece({ uid: 'f' })), "the frontispiece: Murk's barge, ink only");
}

console.log(`\nmurk-catalogue: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
