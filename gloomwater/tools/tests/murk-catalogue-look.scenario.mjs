// Murk's catalogue in the browser (the user's words of 16 November 2026: the shelf as a printed brochure browsed page by page): a loop
// dev build past the tutorial with clams to spend; the book opened from Murk at home: the spread at the goal's page, a leaf mid-turn,
// the cover, a marked item and its order line, a bought plate stamped "Yours.", the Maps chapter (map plates, the sealed plate), the
// gear log's page, and the words on every page against the allow-list. Desktop and --mobile.
//   node build.mjs --dev --out=tools/out/mvp-cat/dev.html
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-cat/dev.html --shots=tools/out/mvp-cat/desktop --script=tools/tests/murk-catalogue-look.scenario.mjs --width=960 --height=540
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-cat/dev.html --shots=tools/out/mvp-cat/phone --script=tools/tests/murk-catalogue-look.scenario.mjs --mobile
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-cat/dev.html --shots=tools/out/mvp-cat/land --script=tools/tests/murk-catalogue-look.scenario.mjs --mobile --width=844 --height=390
// Then every spread at that size is walked and audited (names never cut, the engravings large, the ribbon and the running head clear).
// Prints `MURK_CAT {size, failures, notes}`; returns its failures.
import { makeKit, Abort } from './loop-1a.scenario.mjs';

export default async function (api) {
  const { page, evalGame: g, log } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: 'cat' });
  const book = () => g(() => window.__gw.ui?.loop?.murkBook?.debug?.() ?? null);
  try {
    K.step('cat: a save past the tutorial, clams to spend, home');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => window.__gw.game.beginIntro({ character: 'wick' }));
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    await g(() => { const c = window.__gw; c.debug.loop.tow?.('cut'); c.debug.loop.tutorial('done'); c.debug.loop.giveClams(200); c.game.save(); });   // (the opening's tow cut first)
    await K.reload();
    const TL = await g(() => window.__gw.data.TEXT_LOOP);
    K.need(await K.tap('[data-modal=title] .gw-tbtn', TL.continue), "the title's Continue");
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Continue: home');
    await K.secs(1.4);
    await K.settle(400);

    K.step('cat: the book opens at the goal');
    K.need(await K.tap('[data-modal=jetty] [data-tile=murk]'), 'the Murk target');
    K.need((await K.until("c.debug.ui().openModal === 'shelf'", 4)).ok, 'the shelf (the book) is open');
    await K.settle(700);
    let b = await book();
    K.check(b && b.goalPage != null && Math.floor(b.page / (b.layout === 'desktop' ? 2 : 1)) === Math.floor(b.goalPage / (b.layout === 'desktop' ? 2 : 1)), 'it opens at the goal\'s page', b);
    const goal = await g(() => window.__gw.progression.loop.goal());
    K.check(!!(await K.box(`[data-loop=shelf] [data-item="${goal.id}"]`)), `the goal item (${goal.id}) is on the page shown`);
    await K.shoot('cat-open');
    await K.scan('the book: the goal page');
    const sizes = await g(() => [...document.querySelectorAll('[data-loop=shelf] *')].filter((e) => e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim()) && window.__lp.visible(e))
      .map((e) => ({ t: e.textContent.trim().slice(0, 24), px: parseFloat(getComputedStyle(e).fontSize) })).filter((x) => x.px < 16));
    K.check(sizes.length === 0, 'every word in the book is 16 px or larger', sizes.slice(0, 6));
    const taps = await g(() => {
      const els = [...document.querySelectorAll('[data-loop=shelf] button')].filter(window.__lp.visible).filter((e) => !e.classList.contains('gw-plate-hit'));
      return els.map((e) => { const r = e.getBoundingClientRect(); return { c: e.className.split(' ')[0], w: Math.round(r.width), h: Math.round(r.height) }; }).filter((x) => x.w < 44 || x.h < 44);
    });
    K.check(taps.length === 0, 'every tap target in the book is 44 px or larger', taps);
    const over = await g(() => {
      const R = (e) => e.getBoundingClientRect(), hit = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
      const vis = (sel) => [...document.querySelectorAll(`[data-loop=shelf] ${sel}`)].filter(window.__lp.visible);
      const plates = vis('.gw-plate'), lone = [...vis('.gw-mb-turn'), ...vis('.gw-book-tab'), ...vis('.gw-book-close'), ...vis('[data-buy]'), ...vis('[data-purse]')];
      const out = [];
      for (let i = 0; i < lone.length; i++) {
        for (const p of plates) if (hit(R(lone[i]), R(p))) out.push(`${lone[i].className.split(' ')[0]} × ${p.dataset.item}`);
        for (let j = i + 1; j < lone.length; j++) if (hit(R(lone[i]), R(lone[j]))) out.push(`${lone[i].className.split(' ')[0]} × ${lone[j].className.split(' ')[0]}`);
      }
      return out;
    });
    const fit = await g(() => { const out = []; for (const e of document.querySelectorAll('[data-loop=shelf] .gw-mb-slot, [data-loop=shelf] .gw-book-foot, [data-loop=shelf] .gw-book-tab, [data-loop=shelf] .gw-book-close')) { const r = e.getBoundingClientRect(); if (r.left < -0.5 || r.top < -0.5 || r.right > innerWidth + 0.5 || r.bottom > innerHeight + 0.5) out.push(`${e.className.split(' ')[0]} ${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}`); } return out; });
    K.check(fit.length === 0, 'the book, its tabs and its foot fit the screen (no part cut off)', fit);
    K.check(over.length === 0, 'no tap target overlaps another (the corners, the tabs, the close mark, the order line and the plates)', over);

    K.step('cat: a leaf mid-turn, then the next spread');
    await g(() => window.__gw.ui.loop.murkBook.slow(9));   // (the turn slowed for the shot: 4 s instead of 0.45 s)
    await K.key('ArrowRight', { settle: 0 });
    await page.waitForTimeout(1500);
    await K.shoot('cat-turn');
    await page.waitForTimeout(3600);
    await g(() => window.__gw.ui.loop.murkBook.slow(1));
    b = await book();
    K.check(b && !b.turning, 'the turn lands', b);
    await K.shoot('cat-next');
    await K.scan('the book: the next spread');

    K.step('cat: the cover');
    await K.key('Home');
    await page.waitForTimeout(650);
    await K.shoot('cat-cover');
    await K.scan('the book: the cover');

    K.step('cat: mark an item, the order line, buy it');
    const id = goal.id;
    let p = await K.buyBox(id, null);
    K.need(p && !p.disabled, `the order line for ${id}`, p);
    await K.shoot('cat-marked');
    await K.scan('the book: an item marked');
    const before = await g(() => window.__gw.progression.loop.state().clams);
    await K.tapXY(p.x, p.y);
    await K.steps(3); await K.settle(500);
    const after = await g(() => window.__gw.progression.loop.state().clams);
    K.check(after === before - goal.price, `the buy spends ${goal.price}`, { before, after });
    K.check((await g(() => window.__lp.text('[data-loop=shelf]') || '')).includes(TL.yours), 'the bought plate is stamped "Yours."');
    await K.shoot('cat-bought');

    K.step('cat: the Maps chapter and the gear log');
    K.check(!!(await K.tap('[data-loop=shelf] [role=tab]', TL.tabs.maps)), 'the fore-edge tab Maps');
    await page.waitForTimeout(650);
    await K.shoot('cat-maps');
    await K.scan('the book: maps');
    if (await K.tap('[data-loop=shelf] [role=tab]', TL.odds)) {
      await page.waitForTimeout(650);
      await K.shoot('cat-odds');
      await K.scan('the book: the gear log\'s page');
      K.check(!!(await K.tap('[data-loop=shelf] .gw-shelf-odds')), 'Odds › opens the gear log');
      await K.settle(500);
      K.check((await g(() => window.__gw.debug.ui().openModal)) === 'gear', 'the gear log is open', await g(() => window.__gw.debug.ui().openModal));
      await K.key('Escape'); await K.settle(300);
    }
    K.step('cat: Home chapter');
    await K.tap('[data-loop=shelf] [role=tab]', TL.tabs.home);
    await page.waitForTimeout(650);
    await K.shoot('cat-home');
    await K.scan('the book: home');

    // every spread at this size (the integration's review, 16 Nov: at 960 x 540 the engravings shrank to 40-60 px, tier numerals ran
    // into names, map kickers were cut with an ellipsis, the ribbon cut the chapter head; a phone's running head sat on the corner):
    // no name, kicker or place cut; no numeral on a name; the ribbon on no letter; the running head clear of the corners; an item's
    // engraving a third of its plate or more; every plate's words inside it; text 16 px or more; the book on the screen. Each chapter's
    // opening spread is shot.
    K.step('cat: every spread');
    b = await book();
    const leaf = b.layout === 'desktop' ? 2 : 1, openings = new Set(b.chapters.map((c) => Math.floor(c.page / leaf) * leaf));
    const bad = { cut: [], num: [], ribbon: [], head: [], art: [], spill: [], small: [], fit: [] };
    for (let p = 0; p < b.count; p += leaf) {
      await g((p) => window.__gw.ui.loop.murkBook.go(p), p);
      await page.waitForTimeout(650);
      const a = await g(() => {
        const root = document.querySelector('[data-loop=shelf]'), vis = window.__lp.visible, R = (e) => e.getBoundingClientRect();
        const hit = (x, y) => x.left < y.right - 0.5 && y.left < x.right - 0.5 && x.top < y.bottom - 0.5 && y.top < x.bottom - 0.5;
        const o = { cut: [], num: [], ribbon: [], head: [], art: [], spill: [], small: [], fit: [] };
        for (const e of root.querySelectorAll('.gw-mb-slot .gw-plate-kick, .gw-mb-slot .gw-plate-name')) if (vis(e) && (e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1)) o.cut.push(e.textContent.trim());
        for (const pl of root.querySelectorAll('.gw-mb-slot .gw-plate')) {
          const P = R(pl), art = pl.querySelector('.gw-plate-art'), n = pl.querySelector('.gw-plate-num');
          if (art && !pl.matches('.gw-plate--map, .gw-plate--sealed')) { const A = R(art), k = (A.width * A.height) / Math.max(1, P.width * P.height); if (k < 0.33) o.art.push(`${pl.dataset.item} ${k.toFixed(2)}`); }
          for (const t of pl.querySelectorAll('.gw-plate-kick, .gw-plate-name, .gw-plate-line, .gw-plate-low')) {
            if (!vis(t)) continue;
            const T = R(t);
            if (T.bottom > P.bottom + 1 || T.top < P.top - 1) o.spill.push(`${pl.dataset.item} ${t.className.split(' ')[0]}`);
            if (n && t !== n && !t.matches('.gw-plate-line, .gw-plate-low') && hit(R(n), T)) o.num.push(`${pl.dataset.item}: ${n.textContent} × ${t.textContent.trim()}`);
          }
        }
        for (const rb of root.querySelectorAll('.gw-mb-slot .gw-mb-ribbon')) for (const w of rb.parentElement.querySelectorAll('.gw-mb-head > span, .gw-mb-chap h3')) if (vis(w) && hit(R(w), R(rb))) o.ribbon.push(w.textContent.trim());
        for (const pg of root.querySelectorAll('.gw-mb-slot .gw-mb-page')) for (const sp of pg.querySelectorAll('.gw-mb-head > span')) for (const c of pg.querySelectorAll('.gw-mb-corner.c-tl, .gw-mb-corner.c-tr')) if (vis(sp) && hit(R(sp), R(c))) o.head.push(sp.textContent.trim());
        o.small = [...root.querySelectorAll('*')].filter((e) => [...e.childNodes].some((x) => x.nodeType === 3 && x.nodeValue.trim()) && vis(e)).map((e) => ({ t: e.textContent.trim().slice(0, 20), px: parseFloat(getComputedStyle(e).fontSize) })).filter((x) => x.px < 16).map((x) => `${x.t} ${x.px}`);
        for (const e of root.querySelectorAll('.gw-mb-slot, .gw-book-foot, .gw-book-tab, .gw-book-close, [data-buy], [data-purse]')) { const r = R(e); if (vis(e) && (r.left < -0.5 || r.top < -0.5 || r.right > innerWidth + 0.5 || r.bottom > innerHeight + 0.5)) o.fit.push(e.className.split(' ')[0]); }
        return o;
      });
      for (const k of Object.keys(bad)) for (const x of a[k]) bad[k].push(`p${p}: ${x}`);
      if (openings.has(p)) { const d = await book(); await K.shoot(`cat-spread-${d.pages[Math.min(p + leaf - 1, d.count - 1)]?.chapter || d.pages[p]?.kind || p}`); }
    }
    K.check(bad.cut.length === 0, 'every spread: no name, kicker or place is cut', bad.cut);
    K.check(bad.num.length === 0, 'every spread: no tier numeral on a name or a kicker', bad.num);
    K.check(bad.ribbon.length === 0, 'every spread: the ribbon covers no letter of a head', bad.ribbon);
    K.check(bad.head.length === 0, 'every spread: the running head clear of the corner ornaments', bad.head);
    K.check(bad.art.length === 0, 'every spread: an item\'s engraving is a third of its plate or more', bad.art);
    K.check(bad.spill.length === 0, 'every spread: each plate\'s words stay inside it', bad.spill);
    K.check(bad.small.length === 0, 'every spread: every word 16 px or larger', bad.small.slice(0, 8));
    K.check(bad.fit.length === 0, 'every spread: the book, its tabs and its foot on the screen', bad.fit.slice(0, 8));
    await K.key('Escape'); await K.settle(400);
    K.check((await g(() => window.__gw.debug.ui().openModal)) === 'jetty', 'Escape closes the book back home', await g(() => window.__gw.debug.ui().openModal));
    await K.noErrors('the book');
  } catch (e) {
    if (!(e instanceof Abort)) K.check(false, `threw: ${e?.stack || e}`);
  }
  await K.release().catch(() => {});
  log('MURK_CAT', JSON.stringify({ size: K.tag, failures: K.failures, notes: K.notes }));
  return { failures: K.failures };
}
