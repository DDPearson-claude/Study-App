// The Wick's sheet, "Taper's Sheet", in the browser (docs/loop/SHEET.md v2 §9's gate; the user's words of 16 November 2026: "a page
// where we can view our gear quality, what we have as upgrades, how they impact our catch chances and a master character sheet or stats
// page we can view to see our buffs"). A loop dev build: a fresh save's sheet, then the worked example's (SHEET §3: Taper, the Double
// Creel, Ashwood · Braided Gut · Clockwork, Mire Worms on the hook, Keel II, Lantern I, the Buoy-Bell and the Lamp-Glass found, the
// Slate Cloak Dye and the Oxblood Pennant worn): every way in (the home pause, the Journal's first tab, the rack, the catalogue's Odds ›,
// a caught fish's Odds ›), the picks, a fit at home and its live numbers, the user's rule (both pikes "<1%" on worms alone; the spoon over
// them brings them), the new marks, the fit at the phone's 358 px column (no sideways scroll, text ≥ 16 px, targets ≥ 44 px, none
// overlapping), every word against the allow-list (screen 'sheet'), and the figures on screen against the model.
//   node build.mjs --dev --out=tools/out/mvp-sheet/dev.html
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-sheet/dev.html --shots=tools/out/mvp-sheet/desk --script=tools/tests/loop-sheet.scenario.mjs --width=960 --height=540
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-sheet/dev.html --shots=tools/out/mvp-sheet/phone --script=tools/tests/loop-sheet.scenario.mjs --mobile
//   (--part=look: the example's frames only)
// Prints `SHEET {size, failures, notes}`; returns its failures.
import { makeKit, Abort, uiLoopModule } from './loop-1a.scenario.mjs';

const MET = ['dusk_minnow', 'mossback_perch', 'gutter_crayfish', 'likely_chub', 'overbold_bass', 'rustfin_sucker', 'weeping_carp', 'candlefin_koi',
  'kissmark_trout', 'reedjaw_pike', 'bridgechain_sturgeon', 'thousandcast_pike'];

export default async function (api) {
  const { page, evalGame: g, log, args, width, height } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: 'sheet' });
  const lookOnly = args.part === 'look';
  const sheetOpen = () => g(() => !!document.querySelector('[data-modal=journal] .gw-sheet'));
  /** Every visible text node and accessible name on the sheet, against ui-loop.textAllowed(t, {screen: 'sheet'}). */
  const scanSheet = async (where) => {
    const texts = await g(() => {
      const root = document.querySelector('[data-modal=journal] .gw-sheet');
      if (!root) return [];
      const out = new Set();
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let t = tw.nextNode(); t; t = tw.nextNode()) {
        const el = t.parentElement; if (!el || el.closest('svg, style')) continue;
        const r = el.getBoundingClientRect(); if (!(r.width > 0.5 && r.height > 0.5)) continue;
        const s = t.nodeValue.replace(/\s+/g, ' ').trim(); if (s) out.add(s);
      }
      for (const el of root.querySelectorAll('[aria-label]')) out.add(el.getAttribute('aria-label').trim());
      const tab = document.querySelector('[data-modal=journal] .gw-tab--sheet');
      if (tab) { out.add(tab.getAttribute('aria-label')); out.add(tab.textContent.trim()); }
      return [...out];
    });
    const k = await uiLoopModule();
    const W = k.UL.allowedWords(k.D);
    const extra = new Set(['Close', 'Back', 'Journal', ...Object.values(k.D.TEXT_LOOP.sheet.hours), k.D.TEXT_LOOP.sheet.fresh, k.D.TEXT_LOOP.sheet.pinned]);
    const bad = texts.filter((t) => !extra.has(t) && !k.UL.textAllowed(t, { D: k.D, screen: 'sheet', words: W }) && !/^.+'s Journal$/.test(t) && !/^Taper's Sheet: /.test(t));
    K.check(bad.length === 0, `words (${where}): every text on the sheet passes textAllowed (screen 'sheet')`, bad.slice(0, 12));
    K.check(!texts.some((t) => /\b(reeds|pads|margin|stones|dropoff|drop-off|inflow|outflow|deep water|wind lane)\b/i.test(t)), `words (${where}): no area is named`);
    K.check(!texts.some((t) => /(^|[^+\d])Hold \d/.test(t)), `words (${where}): no "Hold {n}" (the creel is its name)`);
    return texts;
  };
  /** The fit (SHEET §9 item 6): no sideways scroll, text ≥ 16 px, targets ≥ 44 px and none overlapping. */
  const fitCheck = async (where) => {
    const r = await g(() => {
      const root = document.querySelector('[data-modal=journal] .gw-sheet');
      if (!root) return null;
      const small = [], tiny = [], over = [], cut = [];
      for (const el of root.querySelectorAll('*')) {
        if (el.closest('svg')) continue;
        const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim());
        const r = el.getBoundingClientRect();
        if (hasText && r.width > 0 && parseFloat(getComputedStyle(el).fontSize) < 15.5) small.push(`${el.className || el.tagName}: ${el.textContent.trim().slice(0, 20)} ${getComputedStyle(el).fontSize}`);
      }
      const btns = [...root.querySelectorAll('button, [role=button], tr.gw-sh-row')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
      for (const b of btns) { const r = b.getBoundingClientRect(); if (r.width < 43.5 || r.height < 43.5) tiny.push(`${b.className}: ${Math.round(r.width)}×${Math.round(r.height)}`); }
      const hit = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
      const leaves = btns.filter((b) => !btns.some((o) => o !== b && b.contains(o)));
      for (let i = 0; i < leaves.length; i++) for (let j = i + 1; j < leaves.length; j++) {
        if (leaves[i].contains(leaves[j]) || leaves[j].contains(leaves[i])) continue;
        if (hit(leaves[i].getBoundingClientRect(), leaves[j].getBoundingClientRect())) over.push(`${leaves[i].className} × ${leaves[j].className}`);
      }
      for (const p of root.querySelectorAll('.gw-sh-scroll')) if (p.scrollWidth > p.clientWidth + 1) cut.push(`page scrolls sideways ${p.scrollWidth} > ${p.clientWidth}`);
      if (document.documentElement.scrollWidth > innerWidth + 1) cut.push('the document scrolls sideways');
      const rr = root.getBoundingClientRect();
      if (rr.left < -0.5 || rr.right > innerWidth + 0.5) cut.push(`the sheet leaves the screen ${Math.round(rr.left)}..${Math.round(rr.right)}`);
      return { small: small.slice(0, 8), tiny: tiny.slice(0, 8), over: over.slice(0, 8), cut, pages: [...root.querySelectorAll('.gw-sh-scroll')].map((p) => ({ w: p.clientWidth, h: p.clientHeight, sh: p.scrollHeight })) };
    });
    if (!r) { K.check(false, `fit (${where}): the sheet is open`); return null; }
    K.check(r.small.length === 0, `fit (${where}): every text on the sheet is 16 px or larger`, r.small);
    K.check(r.tiny.length === 0, `fit (${where}): every target is 44 px or larger`, r.tiny);
    K.check(r.over.length === 0, `fit (${where}): no two targets overlap`, r.over);
    K.check(r.cut.length === 0, `fit (${where}): nothing scrolls sideways or leaves the screen`, r.cut);
    log('pages', JSON.stringify(r.pages));
    return r;
  };
  /** The Journal's tab row on a phone (the review at 358 px): four tabs in the row with no sideways scroll, none under the close X, the
   *  words 16 px; the page's running head "Taper's Sheet" (the user's answer 42) on screen. */
  const tabCheck = async (where) => {
    const r = await g(() => {
      const M = document.querySelector('[data-modal=journal]'), tb = M?.querySelector('.gw-tabs'), x = M?.querySelector('.gw-x');
      if (!tb) return null;
      const box = (e) => { const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom }; };
      const tabs = [...tb.querySelectorAll('.gw-tab')].map((t) => ({ cls: t.className, ...box(t), fs: parseFloat(getComputedStyle(t).fontSize), w: t.getBoundingClientRect().width, h: t.getBoundingClientRect().height }));
      const X = x ? box(x) : null, row = box(tb);
      const hit = (a, b) => a.l < b.r - 0.5 && b.l < a.r - 0.5 && a.t < b.b - 0.5 && b.t < a.b - 0.5;
      const h2 = M.querySelector('.gw-ph h2');
      return { sw: tb.scrollWidth, cw: tb.clientWidth, lastR: tabs.length ? tabs[tabs.length - 1].r : 0, rowR: row.r, underX: X ? tabs.filter((t) => hit(t, X)).map((t) => t.cls) : [],
        small: tabs.filter((t) => t.fs < 15.5).map((t) => `${t.cls} ${t.fs}`), tiny: tabs.filter((t) => t.w < 43.5 || t.h < 43.5).map((t) => `${t.cls} ${Math.round(t.w)}x${Math.round(t.h)}`),
        head: h2 && h2.getBoundingClientRect().width > 0 ? h2.textContent.trim() : null, n: tabs.length };
    });
    if (!r) { K.check(false, `tabs (${where}): the Journal's tab row`); return null; }
    K.check(r.sw <= r.cw + 1 && r.lastR <= r.rowR + 0.5, `tabs (${where}): the row fits, its last tab (the giants' star) inside it`, r);
    K.check(r.underX.length === 0, `tabs (${where}): no tab under the close X`, r.underX);
    K.check(r.small.length === 0 && r.tiny.length === 0, `tabs (${where}): the tabs' words 16 px, their targets 44 px`, { small: r.small, tiny: r.tiny });
    K.check(r.head === "Taper's Sheet", `tabs (${where}): the page's running head names it "Taper's Sheet"`, r.head);
    log('tabs', where, JSON.stringify(r));
    return r;
  };
  /** A real tap on a sheet element, scrolled into its page's view first (a page scrolls on its own). */
  const tapIn = async (sel, text = null) => {
    await g((s) => { const t = [...document.querySelectorAll(s)].find((e) => e.getBoundingClientRect().width > 0); try { t?.scrollIntoView({ block: 'center' }); } catch { /* ignore */ } }, sel);
    await K.settle(250);
    return K.tap(sel, text);
  };
  /** Close the Journal with its Escape (the Jetty stays). */
  const closeJournal = async () => {
    await g(() => document.querySelector('[data-modal=journal] .gw-x')?.click());
    for (let i = 0; i < 20 && (await g(() => !!document.querySelector('[data-modal=journal]'))); i++) await K.settle(200);
    await K.settle(300);
    // (opened from the home pause: the pause under it closes too, so the Jetty is what is left)
    if (await g(() => !!document.querySelector('[data-modal=homepause]') && !document.querySelector('[data-modal=journal]'))) { await K.key('Escape'); await K.settle(500); }
  };
  const modals = () => g(() => [...document.querySelectorAll('[data-modal]')].map((e) => e.dataset.modal));
  /** Back to the Jetty: the Journal by its X, Murk's book by its Escape (each returns where it came from). */
  const toJetty = async () => {
    for (let i = 0; i < 6; i++) {
      const m = await modals();
      if (m.includes('journal')) { await g(() => document.querySelector('[data-modal=journal] .gw-x')?.click()); await K.settle(500); }
      else if (m.includes('shelf') || m.includes('homepause')) { await K.key('Escape'); await K.settle(600); }
      else break;
    }
  };
  const shotTop = async (name, sel = null) => {
    if (sel) await g((s) => { const t = document.querySelector(`[data-modal=journal] ${s}`); try { t?.scrollIntoView({ block: 'start' }); } catch { /* ignore */ } }, sel);
    await K.settle(200);
    await K.shoot(name);
  };
  try {
    K.step('sheet: a save past the tutorial, home');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => window.__gw.game.beginIntro({ character: 'taper' }));
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    // during the opening's tutorial the home pause stays Resume · Settings (T73)
    await g(() => window.__gw.ui.loop?.openHomePause?.());
    await K.settle(300);
    const tutPause = await g(() => [...document.querySelectorAll('[data-modal=homepause] .gw-mbtn')].map((b) => b.querySelector('span')?.textContent.trim()));
    K.check(tutPause.length === 2, 'during the tutorial the home pause is Resume · Settings', tutPause);
    await g(() => { window.__gw.ui.closeAll?.(); });
    await g(() => { const c = window.__gw; c.debug.loop.tutorial('done'); c.game.save(); });
    await K.reload();
    const TL = await g(() => window.__gw.data.TEXT_LOOP);
    K.need(await K.tap('[data-modal=title] .gw-tbtn', TL.continue), "the title's Continue");
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Continue: home');
    await K.secs(1.2);
    await K.settle(400);

    if (!lookOnly) {
      K.step('sheet: a fresh save, from the home pause');
      await g(() => window.__gw.ui.loop?.openHomePause?.());
      await K.settle(300);
      const items = await g(() => [...document.querySelectorAll('[data-modal=homepause] .gw-mbtn')].map((b) => b.querySelector('span:not(.gw-sh-wick)')?.textContent.trim()));
      K.check(items.length === 3 && items[1] === "Taper's Sheet", 'after the tutorial: Resume · Taper\'s Sheet · Settings', items);
      K.need(await K.tap('[data-modal=homepause] [data-loop=sheet]'), 'the pause item');
      K.need(await sheetOpen(), 'the sheet is open');
      await K.settle(500);
      await shotTop('fresh-head');
      await scanSheet('a fresh save');
      await fitCheck('a fresh save');
      const fresh = await g(() => window.__gw.ui.sheet?.model?.() || null);
      K.check(fresh && fresh.odds.rows.length === 0 && fresh.odds.unmet > 0, 'a fresh save names no fish: the foot counts them', fresh && { rows: fresh.odds.rows.length, unmet: fresh.odds.unmet });
      await g(() => window.__gw.ui.closeAll?.());
    }

    K.step('sheet: the worked example (SHEET §3)');
    await g((met) => {
      const c = window.__gw, m = c.state.meta, L = m.loop;
      Object.assign(L, { wick: 'taper', evenings: 14, holdSlots: 5, tackle: { rod: 1, line: 1, reel: 2 }, lures: ['glimmer_spoon', 'feather_fly'],
        fitted: { lure: null, bait: 'mireworm' }, raft: { oars: 1, keel: 2, lantern: 1 }, home: { orders: 1, baitBed: 1, wall: 1, lights: 1 }, looks: ['slate_dye', 'oxblood_pennant'], clams: 1500 });
      L.bait = { mossmere: { mireworm: 7, cut_strip: 3 } };
      L.maps.places = ['lily_maze', 'under_the_span']; L.lifted = ['lily_maze', 'under_the_span'];
      L.finds.got = { buoy_bell: 1, gate_glass: 1 };
      for (const id of met) m.journal[id] = { caught: 1, biggest: 0, firstDay: 1, firstRun: 1 };
      m.gearPin = { speciesId: 'thousandcast_pike', sizeClass: 'trophy' };
      L.sheetSeen = [];
      c.game.save();
    }, MET);
    await K.reload();
    K.need(await K.tap('[data-modal=title] .gw-tbtn', TL.continue), "the title's Continue");
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Continue: home');
    await K.secs(1.2);
    await K.settle(400);
    // the home pause's item carries the drop while something is new
    await g(() => window.__gw.ui.loop?.openHomePause?.());
    await K.settle(300);
    K.check(await g(() => !!document.querySelector('[data-modal=homepause] [data-loop=sheet] .gw-sh-drop')), 'the pause item carries the new mark');
    K.need(await K.tap('[data-modal=homepause] [data-loop=sheet]'), 'the pause item');
    await K.settle(600);
    K.need(await sheetOpen(), 'the sheet is open (example)');
    K.check(await g(() => !!document.querySelector('[data-modal=journal] .gw-tab--sheet.gw-on, [data-modal=journal] .gw-tab--sheet[aria-selected=true]')), 'it is the Journal\'s first tab');
    await shotTop('example-head');
    if (K.phone) await tabCheck(`${width}x${height}`);
    await scanSheet('the example, open water');
    await fitCheck('the example');
    // the page-open budget (SHEET §9: 50 ms): a warm opening from the pause, timed in the page (a note: the machine's load moves it)
    { const ms = await g(() => Number(document.querySelector('[data-modal=journal] .gw-sheet')?.dataset.ms ?? NaN));
      K.note(ms > 0 ? `the sheet's page built in ${ms} ms (budget 50 ms)` : 'the page\'s build time reads 0 here: the playtest\'s clock does not move inside a script, so the 50 ms budget is not measured by this run'); }
    // the picks: Under the Span at dusk, Trophy
    K.need(await tapIn('[data-modal=journal] [data-where=under_the_span]'), 'the Under the Span chip');
    await K.settle(400);
    const M = await g(() => window.__gw.ui.sheet.model());
    K.check(M.picks.place === 'under_the_span' && M.picks.light === 'dusk', 'the picks: Under the Span at dusk', M.picks);
    const rows = await g(() => [...document.querySelectorAll('[data-modal=journal] tr.gw-sh-row')].map((tr) => ({ id: tr.dataset.fish, share: tr.children[1].textContent.trim(), odds: tr.children[2].textContent.trim() })));
    const pct = (p) => (p * 100 < 1 ? '<1%' : `${Math.round(p * 100)}%`);
    const want = M.odds.rows.map((r) => ({ id: r.id, share: pct(r.share), odds: `${Math.floor(r.land.trophy * 100 + 1e-9)}%` }));
    K.check(JSON.stringify(rows) === JSON.stringify(want), 'every figure in the table is the model\'s', { rows: rows.slice(0, 4), want: want.slice(0, 4) });
    const pikes = rows.filter((r) => ['reedjaw_pike', 'thousandcast_pike'].includes(r.id));
    K.check(pikes.length === 2 && pikes.every((r) => r.share === '<1%'), 'the user\'s rule on the page: on Mire Worms alone both pikes read "<1%"', pikes);
    await shotTop('example-span', '[data-sec=odds]');
    await scanSheet('the example, Under the Span');
    if (K.phone) { await shotTop('example-buffs', '[data-sec=buffs]'); await shotTop('example-tackle', '[data-sec=tackle]'); await shotTop('example-raft', '[data-sec=raft]'); }
    else await g(() => { for (const p of document.querySelectorAll('[data-modal=journal] .gw-sh-scroll')) p.scrollTop = p.scrollHeight; });
    if (!K.phone) { await K.settle(200); await K.shoot('example-pages-end'); }
    // a fit at home: the spoon over the worms (the chip in the Tackle plate or the picks)
    K.need(await tapIn('[data-modal=journal] [data-fit="lure:glimmer_spoon"]'), 'the spoon chip');
    await K.settle(500);
    const M2 = await g(() => window.__gw.ui.sheet.model());
    K.check(M2.tackle.hook.lure === 'glimmer_spoon' && M2.tackle.hook.tipped, 'the spoon fitted, the worm tipped on it', M2.tackle.hook);
    K.check(await g(() => window.__gw.progression.loop.fitted().lure === 'glimmer_spoon'), 'the fit is the Chart\'s (loop.fitted)');
    const tc = M2.odds.rows.find((r) => r.id === 'thousandcast_pike');
    K.check(tc && tc.share > 0.05, 'the spoon brings the pike to the hook', tc && tc.share);
    K.check(await g(() => !!document.querySelector('[data-modal=journal] [data-fit="bait:mireworm"] .gw-sh-barb')), 'the worm\'s chip carries the tipped barb');
    await shotTop('example-spoon', '[data-sec=odds]');
    // the class picked: the Prize; the pinned row opens to five classes
    K.need(await tapIn('[data-modal=journal] [data-cls=prize]'), 'the Prize chip');
    await K.settle(400);
    K.check(await g(() => window.__gw.ui.sheet.model().picks.cls === 'prize'), 'the class pick governs the page');
    K.check(await g(() => !!document.querySelector('[data-modal=journal] tr.gw-sh-open')), 'the pinned fish\'s row opens to all five classes');
    await tapIn('[data-modal=journal] [data-cls=trophy]'); await K.settle(300);
    // the new marks: half the plate on screen for 0.8 s, saved when the page closes
    await K.settle(1200);
    await closeJournal();
    const seen = await g(() => window.__gw.state.meta.loop.sheetSeen.length);
    K.check(seen > 0, 'the marks seen on the page are saved when it closes', seen);

    for (const wh of String(args.also || '').split(',').filter(Boolean)) {
      const [w2, h2] = wh.split('x').map(Number);
      if (!(w2 > 0 && h2 > 0)) continue;
      K.step(`sheet: the example at ${w2} × ${h2}`);
      await page.setViewportSize({ width: w2, height: h2 });
      await K.settle(900);
      await g(() => window.__gw.ui.openSheet({ from: 'pause', view: { place: 'under_the_span', light: 'dusk', cls: 'trophy' } }));
      await K.settle(900);
      const sz = `${w2}x${h2}`;
      await shotTop(`${sz}-head`);
      if (w2 < 700) await tabCheck(sz);
      await fitCheck(sz);
      await scanSheet(sz);
      if (w2 < 700) { await shotTop(`${sz}-buffs`, '[data-sec=buffs]'); await shotTop(`${sz}-tackle`, '[data-sec=tackle]'); await shotTop(`${sz}-raft`, '[data-sec=raft]'); }
      await shotTop(`${sz}-odds`, '[data-sec=odds]');
      await closeJournal();
      await page.setViewportSize({ width, height });
      await K.settle(900);
    }

    if (!lookOnly) {
      K.step('sheet: every way in');
      // the catalogue's foot, Odds ›
      await g(() => window.__gw.ui.openJournal({ from: 'jetty' }));
      await K.settle(400);
      await g(() => { const t = [...document.querySelectorAll('[data-modal=journal] .gw-tab')].find((b) => !b.classList.contains('gw-tab--sheet')); t?.click(); });
      await K.settle(400);
      const odds = await tapIn('[data-modal=journal] .gw-cat-odds');
      await K.settle(500);
      K.check(odds && (await sheetOpen()), 'the catalogue\'s Odds › opens the sheet');
      // a caught fish's Odds ›: pins it
      await g(() => window.__gw.ui.openLog({ speciesId: 'reedjaw_pike', section: 'odds', sizeClass: 'prize' }));
      await K.settle(500);
      const so = await tapIn('[data-modal=journal] .gw-odds-sheet');
      await K.settle(500);
      const pin = await g(() => window.__gw.state.meta.gearPin);
      K.check(so && (await sheetOpen()) && pin?.speciesId === 'reedjaw_pike' && pin.sizeClass === 'prize', 'a caught fish\'s Odds › opens the sheet with that fish pinned at the lit class', pin);
      await closeJournal();
      // Murk's book: its Odds › opens the sheet's Odds over the book, and closing the sheet leaves the book at the same page
      if (await g(() => typeof window.__gw.ui.loop?.openShelf === 'function')) {
        await g(() => window.__gw.ui.loop.openShelf({ tab: 'tackle' }));
        await K.settle(800);
        await g(() => document.querySelector('[data-loop=shelf] [role=tab].gw-tab[data-chapter=odds]')?.click());
        await K.settle(900);
        const pg = await g(() => window.__gw.ui.loop.murkBook?.debug?.()?.page ?? null);
        const ob = await K.tap('[data-loop=shelf] .gw-shelf-odds');
        await K.settle(700);
        const om = await g(() => window.__gw.ui.sheet?.model?.() || null);
        K.check(ob && (await sheetOpen()), 'the book\'s Odds › opens the sheet', { ob, modals: await modals() });
        await shotTop('book-odds', '[data-sec=odds]');
        await g(() => document.querySelector('[data-modal=journal] .gw-x')?.click());
        for (let i = 0; i < 20 && (await g(() => !!document.querySelector('[data-modal=journal]'))); i++) await K.settle(200);
        await K.settle(400);
        const back = await g(() => ({ book: !!document.querySelector('[data-loop=shelf]'), page: window.__gw.ui.loop.murkBook?.debug?.()?.page ?? null }));
        K.check(back.book && back.page === pg, 'closing the sheet returns to the book at the same page', { pg, back, picks: om?.picks?.place });
        await toJetty();
        // the Next line (at home): a tap opens Murk's book at that card
        await g(() => window.__gw.ui.openSheet({ from: 'pause' }));
        await K.settle(700);
        const nid = await g(() => { const b = document.querySelector('[data-modal=journal] .gw-sh-nextbtn'); return b ? b.closest('[data-plate]')?.dataset.plate || '?' : null; });
        const want = await g(() => { const m = window.__gw.ui.sheet.model(); const p = m.tackle.slots.find((x) => x.next); return p ? p.next.id : null; });
        if (nid && want) {
          // (a phone: the plate is folded; a tap unfolds it and shows its Next line)
          if (K.phone && !(await g((k) => document.querySelector(`[data-modal=journal] [data-plate="${k}"]`)?.classList.contains('gw-open'), nid))) { await tapIn(`[data-modal=journal] [data-plate="${nid}"]`); await K.settle(400); }
          await tapIn('[data-modal=journal] .gw-sh-nextbtn');
          await K.settle(900);
          const at = await g((id) => { const el = document.querySelector(`[data-loop=shelf] [data-item="${id}"]`); const r = el?.getBoundingClientRect(); return { book: !!document.querySelector('[data-loop=shelf]'), shown: !!r && r.width > 0 && r.right > 0 && r.left < innerWidth }; }, want);
          K.check(at.book && at.shown, 'the Next line opens Murk\'s book at that card', { want, at });
          await K.shoot('next-book');
        } else K.note('no Next line on the page here', { nid, want });
        await toJetty();
      } else K.note('no openShelf seam here');
      // the rack target at home (no word; its accessible name the full label)
      await K.settle(300);
      log('modals before the rack', JSON.stringify(await modals()));
      const rack = await g(() => { const b = document.querySelector('[data-modal=jetty] [data-tile=rack]'); return b ? { label: b.getAttribute('aria-label'), word: b.textContent.trim(), vis: getComputedStyle(b).visibility } : null; });
      K.check(rack && rack.label === "Taper's Sheet" && rack.word === '', 'the rack target: no word, its accessible name "Taper\'s Sheet"', rack);
      if (rack && rack.vis !== 'hidden') {
        await K.tap('[data-modal=jetty] [data-tile=rack]');
        await K.settle(500);
        const M3 = await g(() => window.__gw.ui.sheet.model());
        K.check(await sheetOpen(), 'the rack opens the sheet');
        await K.shoot('rack-tackle');
        await closeJournal();
      } else K.note('the rack target is not placed in this frame', rack);
      // the seam for the interiors: openSheet({from: 'ledger'}) and openSheet({from: 'rack', section: 'tackle'})
      K.check(await g(() => window.__gw.ui.openSheet({ from: 'ledger' }) === true), 'openSheet({from: "ledger"}) opens it');
      await closeJournal();
      K.step('sheet: a trip');
      await g(() => window.__gw.game.sail?.({ water: 'mossmere' }));
      const out = await K.until("c.flow === 'playing'", 12);
      if (out.ok) {
        await K.secs(2);
        await K.key('Escape');   // (the game's own pause: main pauses the trip and opens its menu)
        await K.settle(900);
        if (!(await g(() => !!document.querySelector('[data-modal=pause]')))) { await g(() => window.__gw.game?.pause?.()); await K.settle(900); }
        const trip = await g(() => [...document.querySelectorAll('[data-modal=pause] .gw-mbtn')].map((b) => b.querySelector('span:not(.gw-sh-wick)')?.textContent.trim()));
        K.check(trip[1] === "Taper's Sheet", 'the trip pause: Resume · Taper\'s Sheet · Home · Settings', trip);
        log('trip: before the item', JSON.stringify({ modals: await modals(), locked: await g(() => window.__gw.ui.logLocked?.()), state: await g(() => window.__gw.fishing?.state ?? null) }));
        await g(() => document.querySelector('[data-modal=pause] [data-loop=sheet]')?.click());
        await K.settle(700);
        log('trip: after the item', JSON.stringify({ modals: await modals(), errors: await g(() => window.__gw.errors.slice(-3)) }));
        K.check(await sheetOpen(), 'the trip pause item opens the sheet');
        await K.settle(600);
        K.check(await sheetOpen(), 'the sheet stays open over the trip\'s pause');
        // the picks made at home (Under the Span, the Prize then the Trophy) do not follow onto the lake (the review's must 1, SHEET §3.5)
        const hour = await g(() => { const c = window.__gw; return c.data.loopLight?.(c.survival?.getPhaseInfo?.()?.phase ?? 'calm') ?? null; });
        const tp = await g(() => window.__gw.ui.sheet.model().picks);
        K.check(tp.place === null && tp.light === hour, 'on a trip the page opens where the raft is (the open water) at the hour it is', { picks: tp, hour });
        // the hook's chips are live on a trip (the user, 16 Nov 2026: answer 43 superseded): a tap changes the run's hook
        const live = await g(() => [...document.querySelectorAll('[data-modal=journal] [data-fit]')].filter((b) => !b.disabled && !b.classList.contains('gw-on')).map((b) => b.dataset.fit));
        K.check(live.length > 0, 'on a trip the hook\'s chips are live (loop.changeHook)', live);
        const pickB = live.find((k) => k.startsWith('bait:') && k !== 'bait:');
        if (pickB) {
          await tapIn(`[data-modal=journal] [data-fit="${pickB}"]`);
          await K.settle(500);
          const hk = await g(() => ({ run: window.__gw.state.run?.equippedBait ?? null, model: window.__gw.ui.sheet.model().tackle.hook.bait }));
          K.check(hk.run === pickB.slice(5) && hk.model === hk.run, 'a chip on a trip changes the run\'s bait, and the page reads it', { pickB, hk });
        }
        await K.shoot('trip');
        await scanSheet('a trip');
        await g(() => window.__gw.ui.closeAll?.());
        await K.settle(500);
        // a cast lands and comes in quietly: the page opens on "Where you last cast" (the user's answer 41)
        await g(() => { try { window.__gw.game?.resume?.(); } catch { /* ignore */ } });
        await K.secs(0.6);
        const pt = await K.waterPoint();
        await K.pressHold(pt.x, pt.y, 0.5, 'c.fishing.state');
        const cast = await K.until("c.fishing.state === 'waiting' || c.fishing.state === 'bite'", 8);
        if (cast.ok) {
          const lc = await g(() => window.__gw.fishing.lastCastArea?.() || null);
          await g(() => window.__gw.fishing.reelInQuiet?.());
          await K.until("c.fishing.state === 'idle'", 4);
          await g(() => window.__gw.ui.openSheet({ from: 'pause' }));
          await K.settle(700);
          const ap = await g(() => window.__gw.ui.sheet.model()?.picks || null);
          const want = lc && lc.place ? lc.place : 'last';
          K.check(ap && ap.place === want && ap.light === hour, 'after a cast the page opens where you last cast, at the trip\'s hour', { lc, picks: ap, hour });
          await K.shoot('trip-lastcast');
          await g(() => window.__gw.ui.closeAll?.());
        } else K.note('the real press did not cast here', cast);
      } else K.note('the sail did not start a trip here', out);
    }
  } catch (e) {
    if (!(e instanceof Abort)) K.check(false, `the scenario threw: ${String(e?.stack || e).slice(0, 400)}`);
  }
  await K.noErrors('the sheet');
  await K.release().catch(() => {});   // (the frames let go, so the playtest's own summary can count them)
  log('SHEET', JSON.stringify({ size: `${width}x${height}`, failures: K.failures, notes: K.notes }));
  return { failures: K.failures };
}
