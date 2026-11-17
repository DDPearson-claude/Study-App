// M1 step 5b (lane 5b-home), the barge's side in the browser (docs/loop/M1.md §2.5, §2.6, §4 step 5b's gate): a loop dev build from a
// fresh save (no film), desktop and --mobile. Short and targeted: a few frames each.
//
//   node build.mjs --dev --out=tools/out/mvp-5bh/dev.html
//   node tools/playtest.mjs --html=tools/out/mvp-5bh/dev.html --shots=tools/out/mvp-5bh/scenario/desktop --script=tools/tests/loop-5b.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/mvp-5bh/dev.html --shots=tools/out/mvp-5bh/scenario/phone --script=tools/tests/loop-5b.scenario.mjs --mobile
//
// THE WALK. Home at the barge with nothing bought (the "before" frame), then each M1 home level in turn, a frame each (Bait Bed I, II;
// Barge lights I; the Long Wall's wing I with prints; Murk's Order Board I, II; the Matriarch home: her print on the eave, her stone
// gilt; the three looks), each changing the barge's own meshes; then each target opens its screen and Escape comes home: Murk (the
// shelf at its Home tab), the Chart (the Mossmere gilded once complete), the Journal (its Prints page), the doorway (the gallery, wing
// I's frames at true size). Prints `LOOP_5B {size, failures, notes}`.
import { makeKit, Abort } from './loop-1a.scenario.mjs';

export default async function (api) {
  const { page, evalGame: g, log } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: '5b' });
  const top = async () => (await K.state()).modal;
  const barge = () => g(() => { const h = window.__gw.actors.home; const s = h.stats(); return { sig: JSON.stringify(s.variant), verts: s.verts, calls: s.calls }; });
  const setLoop = (fn) => g(fn);
  try {
    K.step('5b: a fresh save, Start with no film, home at the barge');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => { window.__lp.ev.length = 0; window.__gw.game.beginIntro({ character: 'wick' }); });
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    await g(() => { const c = window.__gw; c.debug.loop.tow?.('cut'); c.debug.loop.tutorial('done'); c.ui.closeAll?.(); c.ui.loop.openJetty(); });   // (the opening's tow cut to the mooring first: loop-tow.scenario plays it)
    await K.secs(1.6); await K.settle(300);
    const b0 = await barge();
    await K.shoot('home-before');

    // ------------------------------------------------------------------ each home level changes the barge (a before-and-after pair)
    K.step('5b: each M1 home level changes the scene');
    const prints = await g(() => {
      const d = window.__gw.data, out = {};
      for (const s of d.SPECIES.filter((x) => x.zone === 'mossmere' && !x.cove)) out[s.id] = { length: Math.round(d.sizeL50(s, 'mossmere') * 1.12 * 10) / 10, cls: 'prize', key: 'open:mossmere', zone: 'mossmere', evening: 4, n: 1 };
      return out;
    });
    const levels = [
      ['bed1', (L) => { L.home.baitBed = 1; }], ['bed2', (L) => { L.home.baitBed = 2; }], ['lights1', (L) => { L.home.lights = 1; }],
      ['wall1', (L, P) => { L.home.wall = 1; L.prints = P; }], ['orders1', (L) => { L.home.orders = 1; }], ['orders2', (L) => { L.home.orders = 2; }],
      ['eave', (L) => { L.legends = { ...(L.legends || {}), belled_matriarch: 1 }; }], ['looks', (L) => { L.looks = ['slate_dye', 'oxblood_pennant', 'amber_glass']; }],
    ];
    let prev = b0;
    for (const [id, fn] of levels) {
      await g(([src, P]) => { const L = window.__gw.state.meta.loop; (0, eval)(`(${src})`)(L, P); }, [fn.toString(), prints]);
      await K.secs(0.7); await K.settle(200);
      const b = await barge();
      if (id === 'looks') {
        const lk = await g(() => window.__gw.state.meta.loop.looks.slice());
        K.check(lk.length === 3, 'the three looks owned (worn on the Wick and the raft)', lk);
      } else K.check(b.sig !== prev.sig && (b.verts.timber !== prev.verts.timber || b.verts.glow !== prev.verts.glow), `${id}: the barge changes (its own meshes)`, { before: prev.verts, after: b.verts });
      await K.shoot(`home-${id}`);
      prev = b;
    }
    const calls = (await barge()).calls;
    K.check(calls.main <= 6 && calls.mirror <= 2 && calls.shadow <= 2, `every M1 home object: ${calls.main} / ${calls.mirror} / ${calls.shadow} calls (≤ 6 / 2 / 2)`, calls);
    await K.noErrors('the levels');

    // ------------------------------------------------------------------ each target opens its screen and comes home
    K.step('5b: each target opens its screen; Escape comes home');
    await g(() => { const c = window.__gw, L = c.state.meta.loop; L.clams = 900; c.ui.closeAll?.(); c.ui.loop.openJetty(); });
    await K.steps(3); await K.settle(300);
    const opens = { murk: 'shelf', chart: 'chart', journal: 'journal', wall: 'gallery' };
    for (const id of ['murk', 'chart', 'journal', 'wall']) {
      K.need(await K.tap(`[data-modal=jetty] [data-tile=${id}]`), `the ${id} target can be tapped`);
      await K.settle(500); await K.steps(3);
      const m = await top();
      K.check(m === opens[id], `[data-tile=${id}] opens its screen (${opens[id]})`, m);
      if (id === 'murk') {
        // the Home tab
        const t = await g(() => { const T = window.__lp, b = [...document.querySelectorAll('[data-modal=shelf] .gw-tab')].find((x) => /Home/.test(x.textContent)); if (!b) return false; b.click(); return true; });
        await K.settle(700); await K.steps(2);   // (Murk's catalogue: the fore-edge tab turns the leaves to the Home chapter, 0.45 s)
        K.check(t, 'the shelf has its Home tab');
        // Murk's catalogue: the Home chapter's plates across its pages (a phone shows two a page), its first page on screen
        const cards = await g(() => { const b = window.__gw.ui.loop.murkBook?.debug?.(); return b ? b.pages.filter((p) => p.chapter === 'home').flatMap((p) => p.items) : [...document.querySelectorAll('[data-modal=shelf] [data-item]')].map((e) => e.dataset.item); });
        K.check(['baitBed:2', 'wall:1', 'lights:1'].every((x) => cards.includes(x)), 'the Home chapter: the Bait Bed, the Long Wall, Barge lights and the looks', cards);
        K.check(!!(await K.box(`[data-modal=shelf] [data-item="${cards[0]}"]`)), 'the Home chapter opens on its first plate', cards[0]);
        await K.shoot('shelf-home');
        await K.scan('shelf home');
      }
      if (id === 'chart') { await K.settle(1800); await K.steps(4); await K.settle(600); await K.shoot('chart'); }
      if (id === 'journal') {
        const t = await g(() => { const b = [...document.querySelectorAll('[data-modal=journal] .gw-tab')].find((x) => /Prints/.test(x.textContent)); if (!b) return false; b.click(); return true; });
        await K.settle(400); await K.steps(2);
        const n = await g(() => document.querySelectorAll('[data-modal=journal] [data-print]').length);
        K.check(t && n >= 10, 'the Journal\'s Prints page: a card for each printed fish', n);
        await K.shoot('journal-prints');
        await K.scan('prints', { roots: ['[data-modal=journal] .gw-prints'] });   // (the Prints page's own words: the catalogue's head is 3a's)
      }
      if (id === 'wall') {
        const f = await g(() => [...document.querySelectorAll('[data-modal=gallery] [data-frame]')].map((e) => ({ id: e.dataset.frame, w: e.querySelector('canvas')?.getBoundingClientRect().width || 0, gold: e.classList.contains('gw-gframe--gold') })));
        K.check(f.length >= 10 && !f.some((x) => x.id === 'belled_matriarch'), 'the gallery: wing I\'s frames (the legend is on the eave, not the wall)', f.map((x) => x.id));
        const by = Object.fromEntries(f.map((x) => [x.id, x]));
        K.check(by.thousandcast_pike?.gold && by.hullkiss_lamprey?.gold && !by.dusk_minnow?.gold, 'the giants in gold frames');
        K.check(by.dusk_minnow && by.reedjaw_pike && by.reedjaw_pike.w > by.dusk_minnow.w * 2, 'true size: the pike\'s print over twice the minnow\'s', { minnow: by.dusk_minnow?.w, pike: by.reedjaw_pike?.w });
        await K.shoot('gallery');
        await K.scan('gallery');
      }
      await K.key('Escape');
      await K.settle(400); await K.steps(3);
      const back = await K.state();
      K.check(back.modal === 'jetty' && back.flow === 'home', `… and Escape comes home`, { modal: back.modal });
    }
    // ------------------------------------------------------------------ the Mossmere complete: the empty shelf and the gilded sheet
    K.step('5b: the Mossmere complete: its sheet on the Chart gilded');
    const gi = await g(() => {
      const c = window.__gw, d = c.data, L = c.state.meta.loop, J = c.state.meta.journal;
      Object.assign(L, { holdSlots: 6, tackle: { rod: 2, line: 2, reel: 2 }, looks: ['slate_dye', 'oxblood_pennant', 'amber_glass'] });
      L.maps.places = d.loopPlaceIds('mossmere'); L.home = { ...L.home, baitBed: 2, wall: 1, lights: 1, orders: 2 };
      L.raft = { ...L.raft, oars: 2, keel: 2, lantern: 2 }; if (d.LOOP.lures) L.lures = Object.keys(d.LOOP.lures).filter((id) => d.LOOP.lures[id].water === 'mossmere');
      for (const s of d.SPECIES.filter((x) => x.zone === 'mossmere' && !x.cove)) J[s.id] = { ...(J[s.id] || {}), caught: 1 };
      L.home.lights = 0; L.clams = 500; delete L.gilt; if (L.said) delete L.said.shelfBare;   // (the last card left: Barge lights I)
      const items = c.progression.loop.shelf().tabs.flatMap((t) => t.items);
      const left = items.filter((i) => i.consumable !== true && i.sealed !== true && i.price != null && !i.bought).map((i) => i.id);
      return { left };
    });
    K.check(gi.left.length === 1 && gi.left[0] === 'lights:1', 'one card left on the shelf: Barge lights I', gi.left);
    // (a reload: the view's tutorial machine starts from the ledger's record, done, so the Chart is the player's own, not the tutorial's)
    await g(() => window.__gw.game.save?.());
    await K.reload();
    const TLc = await g(() => window.__gw.data.TEXT_LOOP);
    K.need(await K.tap('[data-modal=title] .gw-tbtn', TLc.continue), 'the title\'s Continue');
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Continue: home');
    await K.secs(1.4); await K.settle(300);
    // the 32nd purchase: Murk's empty-shelf line, once (M1.md §2.5, SPEC §8.6)
    await K.tap('[data-modal=jetty] [data-tile=murk]');
    await K.settle(400); await K.steps(2);
    // Murk's catalogue: Barge lights I's plate in the Home chapter, marked, and its order line in the book's foot
    const bl = await K.buyBox('lights:1', TLc.tabs.home);
    K.need(bl && !bl.disabled, 'Barge lights I\'s order line', bl);
    await K.tapXY(bl.x, bl.y); await K.steps(2);
    await K.settle(400); await K.steps(2);
    const bare = await g(() => ({ line: document.querySelector('[data-modal=shelf] .gw-murk-line')?.textContent || '', want: window.__gw.data.TEXT_LOOP.murk.shelfBare, goal: window.__gw.progression.loop.goal() }));
    K.check(bare.line === bare.want && bare.goal === null, 'the last card bought: Murk\'s "Shelf\'s bare." line, and no goal line', bare);
    await K.shoot('shelf-bare');
    await K.key('Escape'); await K.settle(400); await K.steps(3);
    await K.shoot('home-all');
    await K.tap('[data-modal=jetty] [data-tile=chart]');
    await K.settle(700); await K.steps(3);
    // (the re-inking runs 1.2 s on the page's clock, which the kit's driver advances only by the frames it steps: 1.5 s of them)
    await K.secs(1.5); await K.settle(600); await K.steps(2);
    const gm = await g(() => { const c = window.__gw; return { gilt: (c.state.meta.loop.gilt || []).slice(), sheets: c.ui.loop.chartModel?.()?.sheets?.map((x) => [x.waterId, x.gilded]) ?? null }; });
    K.check(gm.gilt.includes('mossmere'), 'the Mossmere\'s sheet re-inked in gold on this open (once: meta.loop.gilt)', gm);
    await K.shoot('chart-gilded');
    await K.key('Escape'); await K.settle(300);
    await K.noErrors('the walk');
  } catch (e) {
    if (e instanceof Abort) K.note('the walk stopped', e.message);
    else K.check(false, 'the walk threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
  }
  await K.release().catch(() => {});
  log('LOOP_5B', JSON.stringify({ size: K.tag, failures: K.failures, notes: K.notes }));
  return { failures: K.failures };
}
