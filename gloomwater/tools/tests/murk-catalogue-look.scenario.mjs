// Murk's catalogue in the browser (the user's words of 16 November 2026: the shelf as a printed brochure browsed page by page): a loop
// dev build past the tutorial with clams to spend; the book opened from Murk at home: the spread at the goal's page, a leaf mid-turn,
// the cover, a marked item and its order line, a bought plate stamped "Yours.", the Maps chapter (map plates, the sealed plate), the
// gear log's page, and the words on every page against the allow-list. Desktop and --mobile.
//   node build.mjs --dev --out=tools/out/mvp-cat/dev.html
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-cat/dev.html --shots=tools/out/mvp-cat/desktop --script=tools/tests/murk-catalogue-look.scenario.mjs --width=960 --height=540
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-cat/dev.html --shots=tools/out/mvp-cat/phone --script=tools/tests/murk-catalogue-look.scenario.mjs --mobile
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
    await g(() => { const c = window.__gw; c.debug.loop.tutorial('done'); c.debug.loop.giveClams(200); c.game.save(); });
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
