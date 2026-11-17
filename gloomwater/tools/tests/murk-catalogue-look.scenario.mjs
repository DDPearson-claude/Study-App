// Murk's catalogue in the browser (the user's words of 16 November 2026: the shelf as a printed brochure browsed page by page): a loop
// dev build past the tutorial with clams to spend; the book opened from Murk at home: the spread at the goal's page, a leaf mid-turn,
// the cover, a marked item and its order line, a bought plate stamped "Yours.", the Maps chapter (map plates, the sealed plate), the
// gear log's page, and the words on every page against the allow-list. Desktop and --mobile.
//   node build.mjs --dev --out=tools/out/mvp-cat/dev.html
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-cat/dev.html --shots=tools/out/mvp-cat/desktop --script=tools/tests/murk-catalogue-look.scenario.mjs --width=960 --height=540
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-cat/dev.html --shots=tools/out/mvp-cat/phone --script=tools/tests/murk-catalogue-look.scenario.mjs --mobile
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-cat/dev.html --shots=tools/out/mvp-cat/land --script=tools/tests/murk-catalogue-look.scenario.mjs --mobile --width=844 --height=390
//   (and --mobile --width=667 --height=375: a smaller phone turned to landscape, the narrow low spread)
// Then every spread at that size is walked and audited (names never cut, the engravings large, the ribbon and the running head clear).
// Prints `MURK_CAT {size, failures, notes}`; returns its failures.
import { makeKit, Abort } from './loop-1a.scenario.mjs';

export default async function (api) {
  const { page, evalGame: g, log } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: 'cat' });
  const book = () => g(() => window.__gw.ui?.loop?.murkBook?.debug?.() ?? null);
  // the Murk target on the home view: placed each frame from the barge's projected bounds, so it can be hidden for a few frames while
  // the camera settles (a busy machine draws slowly); waited for in game time, its layout noted when it never shows
  const tapMurk = async () => {
    for (let i = 0; i < 24; i++) {
      const b = await K.tap('[data-modal=jetty] [data-tile=murk]');
      if (b) return b;
      await K.secs(0.4); await K.settle(150);
    }
    K.note('the Murk target never showed', await g(() => ({ modal: window.__gw.debug.ui().openModal, tiles: [...document.querySelectorAll('[data-modal=jetty] [data-tile]')].map((e) => ({ id: e.dataset.tile, vis: getComputedStyle(e).visibility, op: getComputedStyle(e).opacity, r: [e.getBoundingClientRect().left, e.getBoundingClientRect().top, e.getBoundingClientRect().width].map(Math.round) })) })));
    await K.shoot('cat-no-murk');
    return null;
  };
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
    K.need(await tapMurk(), 'the Murk target');
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

    K.step('cat: the Maps chapter and the sheet\'s Odds');
    K.check(!!(await K.tap('[data-loop=shelf] [role=tab]', TL.tabs.maps)), 'the fore-edge tab Maps');
    await page.waitForTimeout(650);
    await K.shoot('cat-maps');
    await K.scan('the book: maps');
    if (await K.tap('[data-loop=shelf] [role=tab]', TL.odds)) {
      await page.waitForTimeout(650);
      await K.shoot('cat-odds');
      await K.scan('the book: the gear log\'s page');
      // (under the loop Taper's Sheet replaces the gear log, SHEET.md §8.5 and §2.4: the book's Odds › opens the Journal on its sheet
      // tab at the sheet's Odds, over the book; Back or Escape returns to the book at the same page. Where Odds is, SHEET.md §4.1-4.2:
      // on a desktop spread "opening at Odds scrolls the right page to its head", the picks that govern Buffs and Odds; on a phone's
      // one scroll the Odds section's own head)
      K.check(!!(await K.tap('[data-loop=shelf] .gw-shelf-odds')), 'Odds › opens the Wick\'s sheet');
      await K.settle(500);
      const sh = await g(() => {
        const c = window.__gw, root = document.querySelector('[data-modal=journal] .gw-sheet'), desk = root?.dataset.layout === 'desktop';
        const sec = root?.querySelector(desk ? '[data-sec=picks]' : '[data-sec=odds]'), odds = root?.querySelector('[data-sec=odds]');
        let at = null;
        if (sec) {
          const r = sec.getBoundingClientRect();
          let clip = { top: 0, bottom: innerHeight };   // the section's head inside every scrolling box round it and the window
          for (let n = sec.parentElement; n && n !== document.body; n = n.parentElement) {
            const cs = getComputedStyle(n);
            if (/(auto|scroll|hidden)/.test(cs.overflowY)) { const q = n.getBoundingClientRect(); clip = { top: Math.max(clip.top, q.top), bottom: Math.min(clip.bottom, q.bottom) }; }
          }
          // (a desktop's Odds sits on the right page under the picks: that page, its Odds in it, scrolled to its head)
          const pg = desk ? sec.parentElement : null, sameP = !desk || (!!odds && pg.contains(odds));
          at = { layout: root.dataset.layout, top: Math.round(r.top), clipTop: Math.round(clip.top), clipBottom: Math.round(clip.bottom), scrollTop: pg ? pg.scrollTop : null,
            shown: r.top >= clip.top - 2 && r.top + 24 <= clip.bottom && sameP && (!desk || pg.scrollTop <= 1) };
        }
        return { modal: c.debug.ui().openModal, stack: c.debug.ui().stack, sheet: !!root, odds: at };
      });
      K.check(sh.modal === 'journal' && sh.sheet, 'the Journal is open on the Wick\'s sheet (its first tab), not the gear log', sh);
      K.check(sh.odds?.shown === true, 'the sheet opens at its Odds (SHEET.md §4: a desktop\'s right page at its head, the picks over Buffs and Odds; a phone\'s Odds section head on screen)', sh.odds);
      await K.shoot('cat-sheet-odds');
      await K.key('Escape'); await K.settle(400);
      K.check((await g(() => window.__gw.debug.ui().openModal)) === 'shelf', 'Escape on the sheet returns to the book', await g(() => window.__gw.debug.ui().openModal));
    }
    K.step('cat: Home chapter');
    await K.tap('[data-loop=shelf] [role=tab]', TL.tabs.home);
    await page.waitForTimeout(650);
    await K.shoot('cat-home');
    await K.scan('the book: home');

    // Murk speaks (the review of integration B: on a low spread his line sits in the side column, over the purse and the order line, and
    // was never shown): clams to spend, the book opened again, the first place map bought ("It's in the mist. Go and look."), then
    // another item marked so the order line stands under his line; the line, the purse and the order line apart and on the screen
    K.step('cat: Murk speaks beside the book');
    await K.key('Escape'); await K.settle(400);
    await g(() => window.__gw.debug.loop.giveClams(600));
    K.need(await tapMurk(), 'the Murk target again');
    K.need((await K.until("c.debug.ui().openModal === 'shelf'", 4)).ok, 'the book is open again');
    await K.settle(700);
    K.check(!!(await K.tap('[data-loop=shelf] [role=tab]', TL.tabs.maps)), 'the fore-edge tab Maps');
    await page.waitForTimeout(650);
    const mapId = await g(() => [...document.querySelectorAll('[data-loop=shelf] .gw-plate--map:not(.gw-bought):not(.gw-dear)')].find(window.__lp.visible)?.dataset.item ?? null);
    const mb = mapId ? await K.buyBox(mapId, TL.tabs.maps) : null;
    K.need(mb && !mb.disabled, 'a place map to buy and its order line', { mapId, mb });
    await K.tapXY(mb.x, mb.y);
    await K.steps(3); await K.settle(800);
    const said = await g(() => { const e = document.querySelector('[data-loop=shelf] .gw-murk-line'); return e ? { t: e.textContent.trim(), o: +getComputedStyle(e).opacity } : null; });
    K.check(!!said?.t && said.o > 0.9, "Murk's line shows when the first map is bought", said);
    for (let i = 0; i < 8; i++) {
      const hitBox = await g(() => { const e = [...document.querySelectorAll('[data-loop=shelf] .gw-mb-slot .gw-plate:not(.gw-bought):not(.gw-dear):not(.gw-plate--sealed) .gw-plate-hit')].find(window.__lp.visible); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      if (hitBox) { await K.tapXY(hitBox.x, hitBox.y); await K.steps(1); await K.settle(350); break; }
      await K.key('ArrowRight'); await K.settle(650);
    }
    const side = await g(() => {
      const q = (s) => [...document.querySelectorAll(`[data-loop=shelf] ${s}`)].find(window.__lp.visible);
      const els = { line: q('.gw-murk-line'), purse: q('[data-purse]'), buy: q('[data-buy]') }, out = { missing: [], off: [], over: [], boxes: {} };
      const R = {};
      for (const [k, e] of Object.entries(els)) {
        if (!e) { out.missing.push(k); continue; }
        // (the line's own words, not its box: a wrapped line is as tall as its words)
        const rg = document.createRange(); rg.selectNodeContents(e);
        const r = k === 'line' && e.textContent.trim() ? rg.getBoundingClientRect() : e.getBoundingClientRect();
        R[k] = r; out.boxes[k] = [r.left, r.top, r.right, r.bottom].map(Math.round);
        if (r.left < -0.5 || r.top < -0.5 || r.right > innerWidth + 0.5 || r.bottom > innerHeight + 0.5) out.off.push(k);
      }
      const ks = Object.keys(R), hit = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
      for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) if (hit(R[ks[i]], R[ks[j]])) out.over.push(`${ks[i]} × ${ks[j]}`);
      const pg = [...document.querySelectorAll('[data-loop=shelf] .gw-mb-slot, [data-loop=shelf] .gw-book-tab')].filter(window.__lp.visible).map((e) => e.getBoundingClientRect());
      for (const k of ks) if (pg.some((p) => hit(p, R[k]))) out.over.push(`${k} × the book`);
      return out;
    });
    K.check(side.missing.length === 0, "Murk's line, the purse and the order line all shown", side);
    K.check(side.off.length === 0, "Murk's line, the purse and the order line on the screen", side);
    K.check(side.over.length === 0, "Murk's line, the purse and the order line apart (and off the pages and the tabs)", side);
    await K.shoot('cat-murk-line');

    // every spread at this size (the integration's review, 16 Nov: at 960 x 540 the engravings shrank to 40-60 px, tier numerals ran
    // into names, map kickers were cut with an ellipsis, the ribbon cut the chapter head; a phone's running head sat on the corner):
    // no name, kicker or place cut; no numeral on a name; the ribbon on no letter; the running head clear of the corners; an item's
    // engraving a third of its plate or more; every plate's words inside it; text 16 px or more; the book on the screen. Each chapter's
    // opening spread is shot.
    K.step('cat: every spread');
    b = await book();
    const leaf = b.layout === 'desktop' ? 2 : 1, openings = new Set(b.chapters.map((c) => Math.floor(c.page / leaf) * leaf));
    const bad = { cut: [], num: [], ribbon: [], head: [], art: [], spill: [], small: [], fit: [], stamp: [] }, inkMin = { h: 1e9, k: 1e9, at: '' };
    for (let p = 0; p < b.count; p += leaf) {
      await g((p) => window.__gw.ui.loop.murkBook.go(p), p);
      await page.waitForTimeout(650);
      const a = await g(() => {
        const root = document.querySelector('[data-loop=shelf]'), vis = window.__lp.visible, R = (e) => e.getBoundingClientRect();
        const hit = (x, y) => x.left < y.right - 0.5 && y.left < x.right - 0.5 && x.top < y.bottom - 0.5 && y.top < x.bottom - 0.5;
        const o = { cut: [], num: [], ribbon: [], head: [], art: [], spill: [], small: [], fit: [], stamp: [], ink: [] };
        // the drawn ink of an engraving: its <svg>'s getBBox (the strokes, not the grid cell it sits in) mapped through the screen CTM
        const inkOf = (svg) => {
          try {
            const bb = svg.getBBox(), m = svg.getScreenCTM();
            if (!m || !(bb.width > 0)) return null;
            const pts = [[bb.x, bb.y], [bb.x + bb.width, bb.y], [bb.x, bb.y + bb.height], [bb.x + bb.width, bb.y + bb.height]].map(([x, y]) => ({ x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f }));
            const xs = pts.map((q) => q.x), ys = pts.map((q) => q.y), A = R(svg);
            // (the drawing is clipped by its box: the ink shown is the part inside it)
            const left = Math.max(Math.min(...xs), A.left), right = Math.min(Math.max(...xs), A.right), top = Math.max(Math.min(...ys), A.top), bottom = Math.min(Math.max(...ys), A.bottom);
            return { left, right, top, bottom, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
          } catch { return null; }
        };
        // the words' own boxes (a line each), and a rotated stamp's quad against them (separating axes: the quad's two and the box's two)
        const wordRects = (e) => { const r = document.createRange(); r.selectNodeContents(e); return [...r.getClientRects()].filter((q) => q.width > 1 && q.height > 1); };
        const quadOf = (e) => {
          const A = R(e), cx = (A.left + A.right) / 2, cy = (A.top + A.bottom) / 2, w = e.offsetWidth / 2, h = e.offsetHeight / 2;
          const mt = getComputedStyle(e).transform, M = mt && mt !== 'none' ? new DOMMatrix(mt) : new DOMMatrix(), ang = Math.atan2(M.b, M.a), c = Math.cos(ang), s = Math.sin(ang);
          return [[-w, -h], [w, -h], [w, h], [-w, h]].map(([x, y]) => ({ x: cx + x * c - y * s, y: cy + x * s + y * c }));
        };
        const quadHits = (Q, T) => {
          const P = [{ x: T.left, y: T.top }, { x: T.right, y: T.top }, { x: T.right, y: T.bottom }, { x: T.left, y: T.bottom }];
          for (const [a, b] of [[Q[0], Q[1]], [Q[1], Q[2]], [{ x: 0, y: 0 }, { x: 1, y: 0 }], [{ x: 0, y: 0 }, { x: 0, y: 1 }]]) {
            const nx = -(b.y - a.y), ny = b.x - a.x, pr = (L) => L.map((q) => q.x * nx + q.y * ny);
            const q = pr(Q), t = pr(P);
            if (Math.max(...q) <= Math.min(...t) + 0.5 || Math.max(...t) <= Math.min(...q) + 0.5) return false;
          }
          return true;
        };
        for (const e of root.querySelectorAll('.gw-mb-slot .gw-plate-kick, .gw-mb-slot .gw-plate-name')) if (vis(e) && (e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1)) o.cut.push(e.textContent.trim());
        for (const pl of root.querySelectorAll('.gw-mb-slot .gw-plate')) {
          const P = R(pl), art = pl.querySelector('.gw-plate-art'), n = pl.querySelector('.gw-plate-num');
          const svg = art?.querySelector('svg.cat-eng'), ink = svg && vis(pl) ? inkOf(svg) : null;
          // (the review of integration B: the old check measured the .gw-plate-art cell, so 40-60 px drawings passed): the drawn ink is
          // a third of its plate's area, or at least 90 px tall (at 960 x 540 a half-page row's plate is about 140 px), or a wide
          // drawing (a keel, a rod) 120 px along its longer side; on a screen under 540 px tall the two bars scale with its height
          if (art && !pl.matches('.gw-plate--map, .gw-plate--sealed') && vis(pl)) {
            if (!ink) o.art.push(`${pl.dataset.item} no ink`);
            else {
              const k = (ink.width * ink.height) / Math.max(1, P.width * P.height);
              o.ink.push({ id: pl.dataset.item, h: Math.round(ink.height), k: +k.toFixed(2) });
              const sc = Math.min(1, innerHeight / 540);   // (the bars scale down on a screen under 540 px tall: 62 and 83 px at 375)
              if (k < 1 / 3 && ink.height < Math.min(90 * sc, P.height * 0.62) && Math.max(ink.width, ink.height) < 120 * sc) o.art.push(`${pl.dataset.item} ink ${Math.round(ink.width)}x${Math.round(ink.height)} (${k.toFixed(2)} of the plate)`);
            }
          }
          if (n && ink && vis(n) && hit(R(n), ink)) o.num.push(`${pl.dataset.item}: ${n.textContent} × its drawing`);
          for (const st of pl.querySelectorAll('.gw-mb-stamp')) {
            if (!vis(st)) continue;
            const Q = quadOf(st);
            for (const t of pl.querySelectorAll('.gw-plate-kick, .gw-plate-name, .gw-plate-line, .gw-plate-price')) if (vis(t) && wordRects(t).some((T) => quadHits(Q, T))) o.stamp.push(`${pl.dataset.item}: ${st.textContent.trim()} × ${t.textContent.trim().slice(0, 24)}`);
          }
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
      for (const x of a.ink) if (x.h < inkMin.h) Object.assign(inkMin, { h: x.h, k: x.k, at: `p${p} ${x.id}` });
      if (openings.has(p)) { const d = await book(); await K.shoot(`cat-spread-${d.pages[Math.min(p + leaf - 1, d.count - 1)]?.chapter || d.pages[p]?.kind || p}`); }
    }
    K.check(bad.cut.length === 0, 'every spread: no name, kicker or place is cut', bad.cut);
    K.check(bad.num.length === 0, 'every spread: no tier numeral on a name, a kicker or its drawing', bad.num);
    K.check(bad.ribbon.length === 0, 'every spread: the ribbon covers no letter of a head', bad.ribbon);
    K.check(bad.head.length === 0, 'every spread: the running head clear of the corner ornaments', bad.head);
    K.check(bad.art.length === 0, 'every spread: an item\'s drawn ink is a third of its plate, 90 px tall, or 120 px along its longer side', bad.art);
    K.note?.(`the smallest drawing: ${inkMin.h} px tall (${inkMin.k} of its plate, ${inkMin.at})`);
    K.check(bad.stamp.length === 0, 'every spread: the "Yours." stamp covers none of its plate\'s words', bad.stamp);
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
