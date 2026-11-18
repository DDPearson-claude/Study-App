// LAKE 2, lane S in the browser (docs/loop/LAKE2.md §7, §5.6, §6.5): Murk's shop, the finds and the new water's box at Sporewood. A loop
// dev build from a fresh save; Sporewood is made to ship in the page (LOOP.shipped = 'sporewood', as the gate will set it) and the save is
// given the Mossmere's end with Sporewood's lake map. Then: Sail for Sporewood and Tow (the leaving card's own flow); on the first evening
// there, the new water's guide box (shown by its seam: the scenario runner presets the guide off) and its place clear of the raft; three of
// Sporewood's treasures landed by a forced snag (the Bee-Skep Lid, the Gardener's Trowel, the Seed-Keeper's Casket: the haul, the show,
// the card, Keep), the other two's cards; home at Rootfoot (the tally's rows for them); Murk's catalogue at Sporewood walked spread by spread
// (its own engravings: no word cut, every word ≥ 16 px, no target under 44 px, nothing off the screen), a buy; the Tackle screen's chips and
// the Wick's sheet with Sporewood's engravings; Murk's board at Sporewood (its own fish only).
//
//   node build.mjs --dev --out=tools/out/l2s/dev.html
//   nice -n 10 node tools/playtest.mjs --html=tools/out/l2s/dev.html --shots=tools/out/l2s/desk --script=tools/tests/lake2-s.scenario.mjs --width=1280 --height=720
//   nice -n 10 node tools/playtest.mjs --html=tools/out/l2s/dev.html --shots=tools/out/l2s/phone --script=tools/tests/lake2-s.scenario.mjs --mobile
// Options: --part=shop (the shop only: no tow, the save towed by the ledger)   --noshots
// Prints `LAKE2_S {size, failures, notes, info}`; returns {failures}.
import { makeKit, Abort } from './loop-1a.scenario.mjs';

const SW = ['seed_jar', 'skep_lid', 'gardeners_trowel', 'cloche_handle', 'seedkeeper_casket'];

export default async function (api) {
  const { page, evalGame: g, log, args, width, height } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: 'l2s' });
  const info = {};
  const shopOnly = args.part === 'shop';
  const modal = () => g(() => window.__gw.debug.ui().openModal);
  /** every word on screen inside `sel`: its own box (never cut), on the screen, ≥ 16 px; every button ≥ 44 px; no two words over each other */
  const audit = (sel) => g((s) => {
    const T = window.__lp, out = { cut: [], off: [], small: [], taps: [], over: [] }, vw = innerWidth, vh = innerHeight;
    // (the topmost words only: the book keeps its other leaves stacked under the open spread; the guide's small tag is every box's, as built)
    const onTop = (e) => { const r = e.getBoundingClientRect(), t = document.elementFromPoint(Math.min(vw - 1, Math.max(0, r.left + r.width / 2)), Math.min(vh - 1, Math.max(0, r.top + r.height / 2))); return !t || e.contains(t) || t.contains(e) || !t.closest(s) || !!t.closest('button'); };
    const words = [...document.querySelectorAll(`${s} *`)].filter((e) => T.visible(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim()) && !e.closest('.gw-vh, svg, .gw-guide-tag') && onTop(e));
    for (const e of words) {
      const r = e.getBoundingClientRect(), cs = getComputedStyle(e), t = e.textContent.trim().slice(0, 28);
      if ((e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1) && cs.overflow !== 'visible' && cs.display !== 'inline') out.cut.push(t);
      if (r.left < -0.5 || r.right > vw + 0.5 || r.top < -0.5 || r.bottom > vh + 0.5) out.off.push(t);
      if (parseFloat(cs.fontSize) < 15.5) out.small.push(`${t} ${cs.fontSize}`);
    }
    for (const b of [...document.querySelectorAll(`${s} button`)].filter(T.visible).filter((e) => !e.classList.contains('gw-plate-hit'))) { const r = b.getBoundingClientRect(); if (r.width < 43.5 || r.height < 43.5) out.taps.push(`${b.className.split(' ')[0]} ${Math.round(r.width)}×${Math.round(r.height)}`); }
    const R = words.filter((e) => !words.some((o) => o !== e && o.contains(e))).map((e) => [e.textContent.trim().slice(0, 18), e.getBoundingClientRect()]);
    for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) { const a = R[i][1], b = R[j][1]; if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2) out.over.push(`${R[i][0]} × ${R[j][0]}`); }
    return out;
  }, sel);
  const clean = (a) => a && !a.cut.length && !a.off.length && !a.small.length && !a.taps.length && !a.over.length;
  /** the Mossmere's end with Sporewood's lake map (Sporewood shipped in the page) */
  const mossmereEnd = () => g(() => {
    const c = window.__gw, d = c.data, l = c.state.meta.loop;
    d.LOOP.shipped = 'sporewood';
    Object.assign(l, { clams: 30000, tackle: { rod: 2, line: 2, reel: 2 }, holdSlots: 6, raft: { oars: 2, keel: 2, lantern: 2 }, evenings: Math.max(12, l.evenings || 0) });
    l.home = { ...(l.home || {}), orders: 2 };
    c.state.meta.journal = c.state.meta.journal || {};
    for (const s of d.SPECIES.filter((x) => x.zone === 'mossmere')) c.state.meta.journal[s.id] = { ...(c.state.meta.journal[s.id] || {}), caught: Math.max(1, Number(c.state.meta.journal[s.id]?.caught) || 0) };
    const r = c.progression.loop.buy('lake:sporewood');
    c.game.save();
    return { map: r?.ok === true, lakes: [...l.maps.lakes] };
  });
  /** one Sporewood snag landed: forced, struck, the show, the card; Keep or Let go */
  async function landFind(id, { keep = true, shotShow = true } = {}) {
    K.step(`l2s: the ${id}`);
    K.need(await g((i) => window.__gw.debug.finds.force(i, { wait: 1.2 }), id), `debug.finds.force(${id}): the next bite is a snag`);
    K.need((await K.until("c.fishing.state === 'bite'", 8)).ok, 'the snag bites');
    await g(() => { const f = window.__gw.fishing; f.onPointerDown?.({ input: 'mouse' }); f.onPointerUp?.(); });
    K.check((await K.until("c.fishing.state === 'reeling'", 3)).ok, 'struck: the haul runs');
    const h = await K.until("c.fishing.view?.show?.phase === 'hold' || c.fishing.view?.show?.phase === 'pause'", 14);
    K.check(h.ok, 'the show holds it up', h);
    if (shotShow) { await K.secs(0.8); await K.shoot(`show-${id}`); }
    const c = await K.until("c.debug.ui().openModal === 'catch'", 12);
    K.need(c.ok, 'its card opens', c);
    await K.secs(0.5); await K.settle(300);
    const card = await g(() => { const p = document.querySelector('[data-modal=catch] [data-loop=find]'); return p ? { find: p.dataset.find, name: p.querySelector('.gw-fd-name')?.textContent, line: p.querySelector('.gw-fd-line')?.textContent, keep: p.closest('[data-modal=catch]').querySelector('[data-action=keep]')?.textContent.replace(/\s+/g, ' ').trim() } : null; });
    const want = await g((i) => ({ name: window.__gw.data.TEXT_LOOP.finds.items[i].name, line: window.__gw.data.TEXT_LOOP.finds.items[i].line }), id);
    K.check(card && card.find === id && card.name === want.name && card.line === want.line, `the card: ${want.name}, "${want.line}"`, card);
    const a = await audit('[data-modal=catch]');
    K.check(clean(a), 'the card: no word cut, off the screen, under 16 px or over another; every target ≥ 44 px', a);
    await K.shoot(`card-${id}`);
    await K.scan(`the card of the ${id}`);
    K.need(await K.tap(`[data-modal=catch] [data-action=${keep ? 'keep' : 'letgo'}]`), keep ? 'Keep' : 'Let go');
    await K.settle(300); await K.secs(0.8);
    await K.noErrors(`the ${id}`);
    return card;
  }

  try {
    K.step('l2s: a fresh save, Start with no film, the Mossmere\'s end with Sporewood\'s lake map');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => { window.__lp.ev.length = 0; window.__gw.game.beginIntro({ character: 'wick' }); });
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    await g(() => { const c = window.__gw; c.debug.loop.tow?.('cut'); c.debug.loop.tutorial('done'); c.ui.loop?.tutorial?.start?.({}); c.ui.closeAll?.(); });
    await K.secs(0.5);
    const end = await mossmereEnd();
    K.need(end.map, 'Sporewood\'s lake map bought', end);

    if (shopOnly) {
      const t = await g(() => { const L = window.__gw.progression.loop; const r = L.towTo('sporewood'); window.__gw.game.save(); return { ok: r.ok, first: r.first }; });
      K.need(t.ok && t.first, 'towed by the ledger (the shop part)', t);
    } else {
      K.step('l2s: Sail for Sporewood, Tow: the first evening there');
      await g(() => window.__gw.game.sail({ water: 'sporewood' }));
      await K.secs(0.8); await K.settle(300);
      K.check(await g(() => !!document.querySelector('[data-loop=leave]')), 'Sail for Sporewood: the leaving card');
      K.need(await K.tap('[data-loop=leave] [data-action=tow]'), 'the leaving card\'s Tow');
      K.need((await K.until("c.flow === 'playing' && c.state.run?.zone === 'sporewood'", 30)).ok, 'the evening at Sporewood');
      await K.until('c.game.lifting?.() === null', 14);
      await K.secs(1.2); await K.settle(400);

      K.step('l2s: the new water\'s guide box at the first cast there');
      const gs = await g(() => { const v = window.__gw.ui.loop?.guide; const s = v?.debug?.()?.snapshot; return { newWater: s?.newWater ?? null, casts: s?.casts, fish: s?.fish }; });
      K.check(gs.newWater === 'sporewood', 'the guide reads the trip\'s water as a new water', gs);
      const shown = await g(() => window.__gw.ui.loop.guide.show('newWater'));
      K.check(shown === true, 'the box shows (its seam; the runner presets the guide off)');
      await K.secs(0.6); await K.settle(300);
      const gb = await g(() => { const el = document.querySelector('.gw-guide--newWater'); const d = window.__gw.ui.loop.guide.debug(); return el ? { text: el.querySelector('.gw-guide-text')?.textContent, placed: d.placed, seen: Object.keys(d.seen).filter((k) => k.startsWith('newWater')) } : null; });
      const words = await g(() => window.__gw.data.TEXT_LOOP.guide.newWater);
      K.check(gb && gb.text === words && gb.placed?.ok === true, `the box: "${words}", placed clear of the raft, the float and the HUD`, gb);
      K.check(gb && JSON.stringify(gb.seen) === '["newWater:sporewood"]', 'seen once, under Sporewood\'s key', gb?.seen);
      const ga = await audit('.gw-guide');
      K.check(clean(ga), 'the box: no word cut, off the screen, under 16 px or over another', ga);
      await K.shoot('guide-new-water');
      await g(() => window.__gw.ui.loop.guide.close('ok'));
      await K.settle(300);
      await K.noErrors('the guide box');

      // the hold made roomy for the scenario (the carried slot and the first evenings' kit hold four)
      await g(() => { const l = window.__gw.state.meta.loop; l.holdSlots = 7; });
      await landFind('skep_lid');
      await landFind('gardeners_trowel', { shotShow: true });
      await landFind('seedkeeper_casket', { shotShow: true });
      await landFind('seed_jar', { keep: false, shotShow: false });
      await landFind('cloche_handle', { keep: false, shotShow: true });
      const hold = await g(() => window.__gw.debug.finds.state().hold);
      K.check(['skep_lid', 'gardeners_trowel', 'seedkeeper_casket'].every((id) => hold.includes(id)) && !hold.includes('seed_jar'), 'three kept, two let go', hold);

      K.step('l2s: home at Rootfoot: the tally sells them at Sporewood\'s values');
      const before = await g(() => window.__gw.state.meta.loop.clams);
      await g(() => window.__gw.game.goHome({}));
      let tallied = null;
      for (let i = 0; i < 10; i++) {
        await K.until("c.debug.ui().openModal === 'tally' || (c.flow === 'home' && c.debug.ui().openModal === 'jetty')", 14);
        const m = await modal();
        if (m === 'tally') { await K.secs(2.5); await K.settle(400); if (!tallied) { tallied = await g(() => document.querySelector('[data-modal=tally]')?.innerText.replace(/\s+/g, ' ').trim() || ''); await K.shoot('tally'); } }
        if (m === 'jetty' || (await g(() => window.__gw.flow)) === 'home' && m === 'jetty') break;
        if (!(await K.tap(`[data-modal=${m}] .gw-btn--primary`))) await K.key('Escape');
        await K.settle(600);
      }
      const after = await g(() => window.__gw.state.meta.loop.clams);
      K.check(after - before >= 72 + 180 + 3000, `the purse took the tally (+${after - before}: the Lid 72, the Trowel 180, the Casket 3,000 with the trip's fish)`, { before, after, tallied: tallied?.slice(0, 200) });
      const got = await g(() => ({ ...window.__gw.state.meta.loop.finds.got }));
      K.check(got.skep_lid === 1 && got.gardeners_trowel === 1 && got.seedkeeper_casket === 1 && !got.seed_jar, 'each kept find counted', got);
      await K.noErrors('the tally');
    }

    K.step('l2s: home at Sporewood: Murk\'s catalogue in Sporewood\'s own engravings');
    if ((await g(() => window.__gw.flow)) !== 'home') { await g(() => window.__gw.game.goHome({})); await K.until("c.flow === 'home'", 20); }
    await g(() => window.__gw.ui.closeAll?.());
    await K.secs(1.2); await K.settle(400);
    await g(() => window.__gw.ui.loop.openShelf({ tab: 'tackle' }));
    K.need((await K.until("c.debug.ui().openModal === 'shelf'", 6)).ok, 'the book opens');
    await K.settle(800);
    const plates = await g(() => [...document.querySelectorAll('[data-loop=shelf] [data-item]')].filter(window.__lp.visible).map((e) => ({ id: e.dataset.item, eng: (e.querySelector('svg.cat-eng')?.getAttribute('class') || '').replace('cat-eng ', '') })));
    info.firstPlates = plates;
    const book = await g(() => window.__gw.ui?.loop?.murkBook?.debug?.() ?? null);
    const pages = book?.count ?? 0, step = book?.layout === 'desktop' ? 2 : 1;
    const seen = new Map();
    await K.key('Home'); await K.secs(0.7); await K.settle(300);
    for (let p = 0, n = 0; p < pages && n < 24; p += step, n++) {
      const items = await g(() => [...document.querySelectorAll('[data-loop=shelf] [data-item]')].filter(window.__lp.visible).map((e) => ({ id: e.dataset.item, name: e.querySelector('.gw-plate-name, h3, b')?.textContent?.trim() || '', svg: e.querySelector('svg.cat-eng')?.outerHTML.length || 0 })));
      for (const it of items) seen.set(it.id, it);
      const a = await audit('[data-loop=shelf]');
      K.check(clean(a), `the book, spread ${n + 1}: no word cut, off the screen, under 16 px or over another; every target ≥ 44 px`, a);
      if (items.length) await K.shoot(`book-${String(n + 1).padStart(2, '0')}`);
      await K.key('ArrowRight'); await K.secs(0.7); await K.settle(250);
    }
    const ids = [...seen.keys()];
    info.bookItems = ids;
    K.check(['rod:1', 'line:1', 'reel:1', 'lure:spore_moth', 'lure:ember_minnow', 'lure:root_jig', 'lure:sporelamp_fly', 'tin:spore_cake', 'tin:amber_larvae'].every((id) => ids.includes(id)), 'the book holds Sporewood\'s tiers, its four lures and its two tins', ids);
    K.check(!ids.some((id) => ['lure:feather_fly', 'lure:glimmer_spoon', 'lure:bone_jig', 'lure:bell_spinner', 'tin:mireworm', 'tin:lumen_moss'].includes(id)), 'no Mossmere lure or tin in Sporewood\'s book', ids);
    K.check(!ids.some((id) => ['place:lily_maze', 'place:under_the_span', 'place:bell_pool', 'bait:heartmoss'].includes(id)), 'no Mossmere place map or legend\'s bait in Sporewood\'s book', ids);
    K.check(ids.includes('bait:glowcap_bulb'), 'the Glowcap Bulb on Sporewood\'s shelf', ids);
    K.check([...seen.values()].every((it) => it.svg > 1000 || !/^(rod|line|reel|lure|tin|hold|oars|keel|lantern):/.test(it.id)), 'every item its engraving');
    const named = await g(() => [...document.querySelectorAll('[data-loop=shelf] [data-item]')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()).join(' | '));
    K.check(!/Ashwood|Braided Gut|Brass Spool|Lidded Creel/.test(named), 'no Mossmere tier or creel named', named.slice(0, 200));
    await K.scan('Murk\'s book at Sporewood');
    // a buy from the book (Stalkwood, the rod's first tier)
    await g(() => window.__gw.ui.closeAll?.());
    await g(() => window.__gw.ui.loop.openShelf({ tab: 'tackle', focus: 'rod:1' }));
    await K.settle(700);
    const p = await K.buyBox('rod:1', null);
    if (p && !p.disabled) { await K.tapXY(p.x, p.y); await K.steps(3); await K.settle(500); }
    K.check(await g(() => window.__gw.state.meta.loop.tackle.rod === 1), 'Stalkwood bought from the book');
    await K.shoot('book-bought');
    await g(() => window.__gw.ui.closeAll?.());
    await K.noErrors('the book');

    K.step('l2s: the Tackle screen and the Wick\'s sheet: Sporewood\'s engravings on the chips and plates');
    await g(() => window.__gw.ui.loop.tackle.openScreen({ from: 'rack' }));
    await K.settle(600);
    const chips = await g(() => [...document.querySelectorAll('[data-modal=tacklescreen] .gw-ts-chip')].map((c) => ({ key: c.dataset.key, eng: (c.querySelector('svg.cat-eng')?.getAttribute('class') || '').replace('cat-eng ', '') })));
    info.chips = chips;
    K.check(chips.some((c) => c.key === 'stalkwood') && chips.some((c) => c.key === 'seedpod_twirl') && chips.some((c) => c.key === 'spore_cake'), 'the screen\'s chips: the Stalkwood, the Seedpod Twirl, Spore Cake', chips);
    const ta = await audit('[data-modal=tacklescreen]');
    K.check(clean(ta), 'the Tackle screen: no word cut, off the screen, under 16 px or over another', ta);
    await K.shoot('tackle-screen');
    await g(() => window.__gw.ui.closeAll?.());
    await K.settle(300);

    K.step('l2s: Murk\'s board at Sporewood: its own fish');
    const ord = await g(() => window.__gw.progression.loop.orders().map((o) => ({ sp: o.speciesId, zone: window.__gw.data.SPECIES_BY_ID[o.speciesId]?.zone, text: o.text })));
    K.check(ord.length === 2 && ord.every((o) => o.zone === 'sporewood'), 'Order Board II at Sporewood: two of Sporewood\'s fish', ord);
    info.orders = ord;
    await K.noErrors('the end');
  } catch (e) {
    if (!(e instanceof Abort)) { K.failures.push(`[${K.part}] threw: ${String(e?.stack || e).split('\n').slice(0, 3).join(' | ')}`); log('THREW', e); }
  }
  await K.release().catch(() => {});
  log('LAKE2_S', JSON.stringify({ size: `${width}x${height}`, failures: K.failures, notes: K.notes, info }));
  return { failures: K.failures };
}
