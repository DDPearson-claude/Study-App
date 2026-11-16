// M1 step 4 (lane 4) in the browser (docs/loop/M1.md §4 step 4's MVP gate): a loop dev build from a fresh save (no film), desktop and
// --mobile. Short: it buys and fits a lure and a tin, shows the raft's parts on the raft, opens and fulfils one of Murk's orders, cuts a
// Small into Cut Strip, and lands a Gloam Eel on Lumen Moss at the Buoy Lights at night (through the debug hooks).
//
//   node build.mjs --dev --out=tools/out/mvp-4/dev.html
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-4/dev.html --shots=tools/out/mvp-4/desktop --script=tools/tests/loop-4.scenario.mjs --width=960 --height=540
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-4/dev.html --shots=tools/out/mvp-4/phone --script=tools/tests/loop-4.scenario.mjs --mobile
//
// Prints `LOOP_4 {size, failures, notes}`; returns its failures.
import { makeKit, Abort } from './loop-1a.scenario.mjs';

export default async function (api) {
  const { page, evalGame: g, log } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: '4' });
  const ml = () => g(() => JSON.parse(JSON.stringify(window.__gw.state.meta.loop)));
  const run = () => g(() => { const r = window.__gw.state.run; return r ? { bait: { ...(r.bait || {}) }, lure: r.lure ?? null, equippedBait: r.equippedBait ?? null, creel: (r.creel || []).length, outing: r.outing } : null; });

  try {
    K.step('4: a fresh save, Start with no film, home');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => { window.__lp.ev.length = 0; window.__gw.game.beginIntro({ character: 'stub' }); });
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    // the tutorial done (its own walk is loop-1a's) and clams to spend; a reload so the home view starts past the tutorial
    await g(() => { const c = window.__gw; c.debug.loop.tutorial('done'); c.debug.loop.giveClams(2000); c.game.save(); });
    await K.reload();
    const TL0 = await g(() => window.__gw.data.TEXT_LOOP);
    K.need(await K.tap('[data-modal=title] .gw-tbtn', TL0.continue), 'the title\'s Continue');
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Continue: home');
    await K.secs(1.6);
    await K.settle(400);

    // ------------------------------------------------------------------ Murk's shelf: a lure, a tin, the raft's parts, the Order Board
    K.step('4: Murk\'s shelf');
    K.need(await K.tap('[data-modal=jetty] [data-tile=murk]'), 'the Murk target opens the shelf');
    K.need((await K.until("c.debug.ui().openModal === 'shelf'", 4)).ok, 'the shelf is open');
    await K.settle(300);
    const TL = await g(() => window.__gw.data.TEXT_LOOP);
    const buy = async (id, tab) => {
      let b = await K.buyBox(id, TL.tabs[tab]);
      if (b) { await g((i) => document.querySelector(`[data-buy="${i}"]`)?.scrollIntoView({ block: 'center' }), id); await K.settle(250); b = await K.box(`[data-buy="${id}"]`); }
      if (!K.check(!!b, `the shelf shows ${id} (${tab})`)) return false;
      await K.tapXY(b.x, b.y); await K.steps(2); await K.settle(200);
      return true;
    };
    await buy('lure:glimmer_spoon', 'tackle');
    await K.shoot('shelf-tackle');
    await K.scan('the shelf: Tackle');
    await buy('tin:lumen_moss', 'bait');
    await buy('tin:mireworm', 'bait');
    await K.shoot('shelf-bait');
    await K.scan('the shelf: Bait');
    await buy('oars:1', 'raft'); await buy('keel:1', 'raft'); await buy('lantern:1', 'raft');
    await K.scan('the shelf: Raft');
    await buy('orders:1', 'home');
    let L = await ml();
    K.check(L.lures.includes('glimmer_spoon') && L.bait.mossmere.lumen_moss === 10 && L.bait.mossmere.mireworm === 10, 'bought: the Glimmer Spoon, a tin of Lumen Moss, a tin of Mire Worms', { lures: L.lures, bag: L.bait.mossmere });
    K.check(L.raft.oars === 1 && L.raft.keel === 1 && L.raft.lantern === 1 && L.home.orders === 1, 'bought: Oars I, Keel I, Lantern I, the Order Board I', { raft: L.raft, home: L.home });
    K.check(L.orders.length === 1, 'Murk chalks one order', L.orders);
    // the order the walk fills: a Dusk Minnow (the chalk is the ledger's; the walk sets the fish so it can be caught on demand)
    await g(() => { const m = window.__gw.state.meta.loop; m.orders = [{ id: 'ord_walk', speciesId: 'dusk_minnow', kind: 'count', n: 1, have: 0 }]; window.__gw.game.save(); });
    await K.key('Escape'); await K.settle(250);
    K.need(await K.tap('[data-modal=jetty] [data-tile=murk]'), 'the shelf again');
    await K.until("c.debug.ui().openModal === 'shelf'", 4);
    await K.settle(300);
    // Murk's catalogue: his chalk slate is tipped into the book's cover (Home: the cover)
    await K.key('Home'); await K.settle(700);
    const board = await g(() => { const T = window.__lp, el = T.one('[data-loop=orders]'); return el ? { rows: [...el.querySelectorAll('[data-order]')].filter(T.visible).map((b) => { const r = b.getBoundingClientRect(); return { id: b.dataset.order, text: b.textContent.trim(), h: r.height }; }) } : null; });
    K.check(board && board.rows.length === 1 && board.rows[0].text === 'a Dusk Minnow', 'Murk\'s chalk board on his shelf: "a Dusk Minnow"', board);
    K.check(board && board.rows.every((r) => r.h >= 44), 'each order is a tap target ≥ 44 px', board?.rows);
    await K.shoot('shelf-orders');
    await K.scan('the shelf: the orders');
    await K.key('Escape'); await K.settle(250);

    // ------------------------------------------------------------------ the raft's parts on the raft, at home
    K.step('4: the raft\'s parts on the raft');
    await K.secs(1.0);
    const rg = await g(() => window.__gw.actors.raftGear?.debug?.() ?? null);
    K.check(rg && rg.oars === 1 && rg.keel === 1 && rg.lantern === 1 && rg.parts === 1, 'the raft shows Oars I, Keel I and Lantern I (one merged mesh)', rg);
    await K.shoot('home-raft');
    await g(() => { const c = window.__gw, p = c.player.position; c.render.setIntroCamera({ pos: [p.x + 3.2, 2.4, p.z - 3.6], look: [p.x, 0.6, p.z], fov: 42, w: 1 }); });
    await K.secs(0.4);
    await K.shoot('raft-parts-close');
    await g(() => window.__gw.render.setIntroCamera(null));
    await K.steps(2);

    // ------------------------------------------------------------------ the Chart: the lure slot and the tins in the bait slot
    K.step('4: the Chart\'s slots');
    K.need(await K.tap('[data-modal=jetty] [data-tile=chart]'), 'the Chart target');
    await K.until("c.debug.ui().openModal === 'chart'", 4);
    await K.settle(500); await K.steps(3);
    K.check(!!(await K.box('[data-slot=lure]')) && !!(await K.box('[data-slot=bait]')), 'the lure slot beside the bait slot, in the Chart\'s foot');
    await K.tap('[data-slot=lure]'); await K.settle(250);
    for (let i = 0; i < 4; i++) { L = await ml(); if (L.fitted.bait === 'lumen_moss') break; await K.tap('[data-slot=bait]'); await K.settle(250); }
    L = await ml();
    K.check(L.fitted.lure === 'glimmer_spoon' && L.fitted.bait === 'lumen_moss', 'a lure and a bait fitted together: the Glimmer Spoon and Lumen Moss', L.fitted);
    const slots = await g(() => ['lure', 'bait', 'sail'].map((k) => { const el = k === 'sail' ? document.querySelector('[data-action=sail]') : document.querySelector(`[data-slot=${k}]`); const r = el?.getBoundingClientRect(); return r ? { k, l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height } : null; }));
    const ov = []; for (let i = 0; i < slots.length; i++) for (let j = i + 1; j < slots.length; j++) { const a = slots[i], b = slots[j]; if (a && b && Math.min(a.r, b.r) - Math.max(a.l, b.l) > 0.5 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 0.5) ov.push(`${a.k}/${b.k}`); }
    K.check(slots.every((s) => s && s.w >= 43.5 && s.h >= 43.5) && ov.length === 0, 'the slots and Sail ≥ 44 px, none overlapping', { slots, ov });
    await K.shoot('chart-slots');
    await K.scan('the Chart');
    // the Buoy Lights owned and lifted (the debug hook), the pick open water
    await g(() => window.__gw.debug.loop.lift('buoy_lights', { play: false }));
    K.need(await K.tap('[data-action=sail]'), 'Sail');
    K.need((await K.until("c.flow === 'playing' && c.state.run?.outing === 'trip' && !c.loopHome?.gliding?.()", 12)).ok || (await K.until("c.flow === 'playing'", 2)).ok, 'the trip begins');
    await K.secs(4);
    let R = await run();
    K.check(R && R.lure === 'glimmer_spoon' && R.equippedBait === 'lumen_moss' && R.bait.lumen_moss === 10, 'on the trip the line carries the lure and the tin', R);

    // ------------------------------------------------------------------ an order filled: a Dusk Minnow, its chalk tick on the card
    K.step('4: a Dusk Minnow for Murk\'s order');
    await K.realCatch('dusk_minnow', 0.3, { what: 'the Dusk Minnow' });
    const sh = await K.until("c.fishing?.inShow === true || c.debug.ui().openModal === 'catch'", 25);
    K.need(sh.ok, 'the Dusk Minnow reaches its card');
    if ((await K.state()).inShow) await K.key('Space');
    await K.until("c.debug.ui().openModal === 'catch'", 10);
    await K.settle(300); await K.secs(1.5);
    const tick = await g(() => !!document.querySelector('[data-modal=catch] .gw-cc-keep .gw-chalk-tick'));
    K.check(tick, 'the card: a chalk tick by Keep\'s value (the fish fills an order)');
    await K.shoot('card-order');
    await K.scan('the card (an order)');
    await K.tap('[data-modal=catch] [data-action=keep]');
    await K.until("c.debug.ui().openModal !== 'catch'", 3);
    await K.until("c.fishing.state === 'idle'", 6);
    R = await run();
    K.check(R.bait.lumen_moss === 9, 'the cast spent one Lumen Moss', R.bait);

    // ------------------------------------------------------------------ Cut Strip: a held Let go on a Small
    K.step('4: Cut Strip on a held Let go');
    await K.realCatch('dusk_minnow', -1.3, { what: 'a Small Dusk Minnow' });
    const sh2 = await K.until("c.fishing?.inShow === true || c.debug.ui().openModal === 'catch'", 25);
    K.need(sh2.ok, 'the Small reaches its card');
    if ((await K.state()).inShow) await K.key('Space');
    await K.until("c.debug.ui().openModal === 'catch'", 10);
    await K.settle(300); await K.secs(1.5);
    const lg = await K.box('[data-modal=catch] [data-action=letgo]');
    K.need(lg, 'Let go on the card');
    const knife = await g(() => !!document.querySelector('[data-modal=catch] [data-action=letgo] .gw-cut-knife'));
    K.check(knife, 'Let go carries the knife (a Small can be cut)');
    await K.pressHold(lg.x, lg.y, 1.0, null, { mid: async () => { await K.shoot('card-cutting'); }, midAt: 0.4 });
    await K.until("c.debug.ui().openModal !== 'catch'", 3);
    R = await run();
    K.check(R.bait.cut_strip === 3 && R.creel === 1, 'held, it is cut into three Cut Strips (not kept, not let go)', R);
    await K.until("c.fishing.state === 'idle'", 6);

    // ------------------------------------------------------------------ the Gloam Eel on Lumen Moss at the Buoy Lights, at night
    K.step('4: the Gloam Eel at the Buoy Lights at night');
    await g(() => { const c = window.__gw; c.debug.setPhase?.('gloomtide'); const i = c.survival.getPhaseInfo?.(); if (i && i.duration > 0) c.state.run.phaseTime = i.duration * 0.3; c.debug.loop.at('buoy_lights'); c.render.snapCamera?.(); });
    await K.secs(0.6);
    const roll = await g(() => ({ moss: window.__gw.debug.fishPoolRoll?.(1500, { place: 'buoy_lights', bait: 'lumen_moss' }), bare: window.__gw.debug.fishPoolRoll?.(1500, { place: 'buoy_lights', bait: null }) }));
    K.check((roll.moss?.counts?.gloam_eel | 0) > 0 && !(roll.bare?.counts?.gloam_eel > 0), 'the pool there: the Gloam Eel bites on Lumen Moss, and on nothing else', { moss: roll.moss?.counts?.gloam_eel, bare: roll.bare?.counts?.gloam_eel ?? 0 });
    await K.realCatch('gloam_eel', 0.4, { what: 'the Gloam Eel' });
    const sh3 = await K.until("c.fishing?.inShow === true || c.debug.ui().openModal === 'catch'", 25);
    K.need(sh3.ok, 'the Gloam Eel reaches its card');
    if ((await K.state()).inShow) { await K.shoot('eel-show'); await K.key('Space'); }
    await K.until("c.debug.ui().openModal === 'catch'", 10);
    await K.settle(300); await K.secs(1.5);
    const eelCard = await g(() => (document.querySelector('[data-modal=catch] .gw-catch-name')?.textContent || '').trim());
    K.check(/Gloam Eel/.test(eelCard), 'the card: the Gloam Eel', eelCard);
    await K.shoot('card-eel');
    await K.tap('[data-modal=catch] [data-action=keep]');
    await K.until("c.debug.ui().openModal !== 'catch'", 3);
    R = await run();
    K.check(R.creel === 2, 'the Gloam Eel in the hold', R);

    // ------------------------------------------------------------------ the Belled Matriarch, a catfish (her play forced: the look)
    if (!K.phone) {
      K.step('4: the Matriarch on her catfish plan');
      const before = await g(() => window.__gw.state.run.creel.length);
      await K.realCatch('belled_matriarch', 0.2, { what: 'the Belled Matriarch', onPlay: async () => { await K.shoot('matriarch-play'); } });
      const sh4 = await K.until("c.fishing?.inShow === true || c.debug.ui().openModal === 'catch'", 40);
      if (sh4.ok && (await K.state()).inShow) { await K.secs(1.2); await K.shoot('matriarch-show'); await K.key('Space'); }
      const card4 = await K.until("c.debug.ui().openModal === 'catch'", 12);
      if (K.check(card4.ok, 'her card opens')) {
        await K.settle(300); await K.secs(1.5);
        await K.shoot('card-matriarch');
        const shape = await g(() => window.__gw.data.SPECIES_BY_ID.belled_matriarch.model.shape);
        K.check(shape === 'catfish', 'the Matriarch is drawn on the catfish plan', shape);
        await K.tap('[data-modal=catch] [data-action=keep]');
        await K.until("c.debug.ui().openModal !== 'catch'", 3);
        K.check((await g(() => window.__gw.state.run.creel.length)) === before + 1, 'she is in the hold');
      }
      await K.until("c.fishing.state === 'idle'", 6);
    }

    // ------------------------------------------------------------------ home: the tally doubles the order's fish, with a chalk tick
    K.step('4: home, the tally');
    K.need(await g(() => window.__gw.game.goHome()), 'Home');
    K.need((await K.until("c.debug.ui().openModal === 'tally'", 8)).ok, 'the tally opens');
    await K.secs(6); await K.settle(300);
    const lt = await g(() => window.__gw.state.meta.loop.lastTrip);
    const minnow = lt.lines.find((l) => l.speciesId === 'dusk_minnow');
    K.check(minnow && minnow.order === true && minnow.clams === 2 * minnow.base, 'the Dusk Minnow filled the order: doubled', minnow);
    const eel = lt.lines.find((l) => l.speciesId === 'gloam_eel');
    K.check(eel && !eel.order && eel.clams === eel.base, 'the Gloam Eel at its price', eel);
    const ticks = await g(() => document.querySelectorAll('[data-loop=tally] .gw-trow .gw-chalk-tick').length);
    K.check(ticks === 1, 'one tally row carries the chalk tick', ticks);
    await K.shoot('tally-order');
    await K.scan('the tally');
    await K.tap('[data-loop=tally] [data-action=sold]') || await K.tap('[data-action=sold]');
    await K.until("c.debug.ui().openModal === 'jetty'", 6);
    L = await ml();
    K.check(!L.orders.some((o) => o.id === 'ord_walk') && L.orders.length === 1, 'the order is gone and Murk has chalked a new one', L.orders);
    const casts = K.phone ? 3 : 4;   // (the Matriarch's cast on a desktop spends one too: the tin on the line)
    K.check(L.bait.mossmere.cut_strip === 3 && L.bait.mossmere.lumen_moss === 10 - casts, `the bag came home: three Cut Strips, ${10 - casts} Lumen Moss (${casts} casts)`, L.bait.mossmere);
    // the catalogue: the Gloam Eel's card in ink (its tin glyph), the Matriarch's catfish drawing (desktop) or her hatch
    if (await K.tap('[data-modal=jetty] [data-tile=journal]')) {
      await K.settle(600); await K.steps(3);
      await g(() => document.querySelector('[data-species=gloam_eel]')?.scrollIntoView({ block: 'center' }));
      await K.settle(300);
      await K.shoot('catalogue');
      await K.key('Escape'); await K.settle(200);
    }
    await K.noErrors('the walk');
  } catch (e) {
    if (e instanceof Abort) K.note('the walk stopped', e.message);
    else K.check(false, 'the walk threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
  }
  await K.release().catch(() => {});   // (the page's frames back: the runner's closing fps probe needs them)
  log('LOOP_4', JSON.stringify({ size: K.tag, failures: K.failures, notes: K.notes }));
  return { failures: K.failures };
}
