// Murk's orders said and shown (the user's words of 17 November 2026: "When you buy murks board it doesn't tell you what he wants you
// to catch anywhere that I can see"): buy the Order Board at Murk's catalogue (the book turns to its cover, his slate in view, his line
// "Bring me …"), then sail: the HUD's chalk slate beside the hold row (clear of every HUD piece), its tip on a hover or a tap, gone in
// the bite, back with the chalk tick once a caught fish fills the order; the Journal's "Murk wants one.". Frames and a few checks.
//   nice -n 10 node tools/playtest.mjs --html=<dev.html> --shots=<dir> --script=tools/tests/loop-orders.scenario.mjs --width=1280 --height=800
//   (add --mobile --width=820 --height=900 for the touch layout). Prints `LOOP_ORDERS {size, failures, notes}`.
import { makeKit, Abort } from './loop-1a.scenario.mjs';

export default async function (api) {
  const { page, evalGame: g, log } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: 'orders' });
  const ml = () => g(() => JSON.parse(JSON.stringify(window.__gw.state.meta.loop)));
  const slate = () => g(() => {
    const el = document.querySelector('[data-loop=oslate]');
    if (!el || el.hidden || getComputedStyle(el).visibility === 'hidden' || Number(getComputedStyle(el).opacity) < 0.5) return { shown: false };
    const r = el.getBoundingClientRect(), R = (n) => { const b = n.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom }; };
    // every other visible HUD piece it must not overlap
    const others = [...document.querySelectorAll('.gw-hud *')].filter((n) => !el.contains(n) && !n.contains(el) && n.children.length === 0 && (n.textContent.trim() || n.tagName === 'CANVAS' || n.tagName === 'svg' || n.tagName === 'BUTTON'))
      .filter((n) => { const b = n.getBoundingClientRect(), cs = getComputedStyle(n); return b.width > 1 && b.height > 1 && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.05 && !n.closest('[hidden]'); });
    const hits = others.filter((n) => { const b = n.getBoundingClientRect(); return b.left < r.right && b.right > r.left && b.top < r.bottom && b.bottom > r.top; }).map((n) => `${n.tagName}.${n.className?.baseVal ?? n.className}`);
    return { shown: true, rect: R(el), n: el.querySelectorAll('[data-order]').length, ticks: el.querySelectorAll('.gw-chalk-tick').length, hits, vw: innerWidth, vh: innerHeight,
      inside: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, tip: document.querySelector('.gw-oslate-tip.gw-in')?.textContent ?? null };
  });
  try {
    K.step('orders: a fresh save past the tutorial, clams to spend');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => window.__gw.game.beginIntro({ character: 'stub' }));
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    await g(() => { const c = window.__gw; c.debug.loop.tow?.('cut'); c.debug.loop.tutorial('done'); c.debug.loop.giveClams(400); c.game.save(); });
    await K.reload();
    const TL = await g(() => window.__gw.data.TEXT_LOOP);
    K.need(await K.tap('[data-modal=title] .gw-tbtn', TL.continue), 'Continue');
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'home');
    await K.secs(1.6); await K.settle(300);

    K.step('orders: buy the Order Board at Murk\'s catalogue');
    K.need(await K.tap('[data-modal=jetty] [data-tile=murk]'), 'the shelf');
    K.need((await K.until("c.debug.ui().openModal === 'shelf'", 4)).ok, 'the shelf is open');
    await K.settle(400);
    const b = await K.buyBox('orders:1', TL.tabs.home);
    K.need(!!b, 'the Order Board\'s order line');
    await K.tapXY(b.x, b.y); await K.steps(2);
    await K.settle(2200); await K.steps(2);
    let L = await ml();
    K.check(L.home.orders === 1 && L.orders.length === 1 && L.orders[0].said === true, 'bought: one order, said', { home: L.home, orders: L.orders });
    const cover = await g(() => ({ line: document.querySelector('[data-loop=shelf] .gw-murk-line')?.textContent || '', slate: [...document.querySelectorAll('[data-loop=shelf] [data-loop=orders] [data-order]')].filter((n) => n.getBoundingClientRect().width > 0).map((n) => n.textContent.trim()) }));
    K.check(/^Bring me .+\.$/.test(cover.line) && cover.slate.length === 1 && cover.line.includes(cover.slate[0]), 'the book on its cover: the slate in view and Murk\'s line naming its order', cover);
    await K.shoot('cover-line');
    await K.scan('the cover with the line');

    // two orders the walk can fill and see (the chalk is the ledger's; a Dusk Minnow is caught on demand below)
    await g(() => { const c = window.__gw, m = c.state.meta.loop; m.home.orders = 2; m.orders = [{ id: 'ord_a', speciesId: 'dusk_minnow', kind: 'count', n: 1, have: 0, said: true }, { id: 'ord_b', speciesId: 'weeping_carp', kind: 'count', n: 1, have: 0, said: true }]; m.holdSlots = Math.max(5, m.holdSlots | 0); c.state.meta.journal.dusk_minnow = { ...(c.state.meta.journal.dusk_minnow || {}), caught: 1, biggest: 0, firstDay: 1, firstRun: 1, pbLength: 70 }; c.game.save(); });
    await K.key('Escape'); await K.settle(400);

    K.step('orders: the Journal\'s word on a wanted fish');
    await g(() => window.__gw.ui.openLog({ speciesId: 'dusk_minnow' }));
    await K.settle(600); await K.steps(2);
    const wants = await g(() => [...document.querySelectorAll('[data-loop=wants]')].map((n) => n.textContent));
    K.check(wants.length === 1 && wants[0] === TL.orderSay.wants, 'the Dusk Minnow\'s page: "Murk wants one."', wants);
    await K.shoot('journal-wants');
    await g(() => window.__gw.ui.closeAll?.()); await K.settle(300);
    await g(() => { const c = window.__gw; if (c.debug.ui().openModal !== 'jetty') c.ui.loop.openJetty(); });
    await K.settle(300);

    K.step('orders: sail; the slate on the water');
    K.need(await K.tap('[data-modal=jetty] [data-tile=chart]'), 'the Chart');
    await K.until("c.debug.ui().openModal === 'chart'", 4);
    await K.settle(500); await K.steps(3);
    K.need(await K.tap('[data-action=sail]'), 'Sail');
    K.need((await K.until("c.flow === 'playing' && c.state.run?.outing === 'trip' && !c.loopHome?.gliding?.()", 12)).ok || (await K.until("c.flow === 'playing'", 2)).ok, 'the trip begins');
    await K.secs(4); await K.settle(500);
    let S = await slate();
    if (!S.shown) S.debug = await g(() => window.__gw.ui.loop?.slate?.debug?.());
    K.check(S.shown && S.n === 2 && S.inside && S.hits.length === 0, 'the slate: two drawings, on screen, clear of every HUD piece', S);
    await K.shoot('hud-slate');
    // the tip: a hover on a desktop, a tap on a phone
    const o = await K.box('[data-loop=oslate] [data-order=ord_b]');
    if (o) { if (K.phone) await K.tapXY(o.x, o.y); else await page.mouse.move(o.x, o.y); }
    await K.steps(2); await K.settle(400);
    S = await slate();
    K.check(S.tip === 'a Weeping Carp', 'the tip: the order\'s own words', S.tip);
    await K.shoot('hud-tip');
    await K.scan('the water with the slate\'s tip');
    if (!K.phone) await page.mouse.move(4, 4);
    K.check((await g(() => window.__gw.state.run?.creel?.length ?? 0)) === 0 && (await g(() => window.__gw.fishing.state)) === 'idle', 'the tap cast nothing');

    K.step('orders: a Dusk Minnow fills its order');
    await K.realCatch('dusk_minnow', 0.3, { what: 'the Dusk Minnow', onBite: async () => { await K.steps(1); await K.settle(400); const s = await slate(); K.check(!s.shown, 'the slate hides in the bite', s); } });
    const sh = await K.until("c.fishing?.inShow === true || c.debug.ui().openModal === 'catch'", 25);
    K.need(sh.ok, 'the show');
    K.check(!(await slate()).shown, 'hidden in the catch show');
    if ((await K.state()).inShow) await K.key('Space');
    await K.until("c.debug.ui().openModal === 'catch'", 10);
    await K.settle(300);
    await K.tap('[data-modal=catch] [data-action=keep]');
    await K.until("c.debug.ui().openModal !== 'catch'", 3);
    await K.until("c.fishing.state === 'idle'", 6);
    await K.secs(1); await K.settle(500);
    S = await slate();
    K.check(S.shown && S.ticks === 1 && S.hits.length === 0, 'back after the catch: the Dusk Minnow\'s drawing ticked', S);
    await K.shoot('hud-tick');
    await K.noErrors('the orders walk');
  } catch (e) {
    if (e instanceof Abort) K.note('the walk stopped', e.message);
    else K.check(false, 'the walk threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
  }
  await K.release().catch(() => {});
  log('LOOP_ORDERS', JSON.stringify({ size: K.tag, failures: K.failures, notes: K.notes }));
  return { failures: K.failures };
}
