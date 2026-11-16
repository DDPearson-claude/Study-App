// M1 step 5c (lane 5C), the Mossmere's finds in the browser (docs/loop/FINDS.md §12's "the user's look"; M1.md §2.16, §2.17): a loop
// dev build from a fresh save (no film), desktop and --mobile. Short and targeted: three finds landed through the debug hooks.
//
//   node build.mjs --dev --out=tools/out/mvp-5c/dev.html
//   node tools/playtest.mjs --html=tools/out/mvp-5c/dev.html --shots=tools/out/mvp-5c/desktop --script=tools/tests/loop-5c.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/mvp-5c/dev.html --shots=tools/out/mvp-5c/phone --script=tools/tests/loop-5c.scenario.mjs --mobile
//
// THE WALK. Home (before: the barge with no finds) → Sail → the Bent Tin Spoon, the Toll-Keeper's Purse and the Moat Bollard, each a
// snag (debug.finds.force): the slow slide under (fishing:bite {sizeClass: 'find'}), the strike, the haul (the find plan: no runs), the
// show in its pose with no flaps, fishing:found and never fishing:caught / fish:measured, the card (its drawing, name, line, Keep with
// its value or its where-it-goes glyph, Let go) and Keep → the hold's glyphs (the Purse's slot gold-edged) → Home: the tally's rows
// (the treasures by value, the Purse last, the bollard carried aboard), Sold → the barge with the bollard fitted (then the bell, the
// glass and the boxes given: after), the raft's vane and the rod's tassel → the catalogue's finds row: its heading, the eleven, every
// rate equal to findShares. Prints `LOOP_5C {size, failures, notes}`; returns its failures.
import { makeKit, Abort } from './loop-1a.scenario.mjs';

export default async function (api) {
  const { page, evalGame: g, log } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: '5c' });
  const top = async () => (await K.state()).modal;
  /** One snag landed and shown: force it, let the float slide under, strike, haul, the show, the card; returns what was seen. */
  async function landFind(id, { shotShow = true, shotCard = true, shotHaul = false } = {}) {
    K.step(`5c: the ${id}`);
    await g(() => { window.__fd = { found: [], caught: 0, measured: 0, bites: [] }; const c = window.__gw; if (!window.__fdOn) { window.__fdOn = true;
      c.bus.on('fishing:found', (p) => window.__fd.found.push(p)); c.bus.on('fishing:caught', () => window.__fd.caught++); c.bus.on('fish:measured', () => window.__fd.measured++);
      c.bus.on('fishing:bite', (p) => window.__fd.bites.push(p)); } });
    K.need(await g((i) => window.__gw.debug.finds.force(i, { wait: 1.2 }), id), `debug.finds.force(${id}): the next bite is a snag`);
    const b = await K.until("c.fishing.state === 'bite'", 6);
    K.need(b.ok, 'the snag bites', b);
    const bite = await g(() => window.__fd.bites.at(-1));
    K.check(bite?.sizeClass === 'find' && !bite?.speciesId, "its bite carries sizeClass 'find' and no species", bite);
    const hud = await g(() => [...document.querySelectorAll('.gw-hud *')].filter((e) => window.__lp.visible(e) && /\b(Small|Keeper|Prize|Trophy|Elder)\b/.test(e.textContent || '') && !e.children.length).map((e) => e.textContent.trim()).slice(0, 4));
    K.check(hud.length === 0, 'the HUD names no class for a find', hud);
    await g(() => { const f = window.__gw.fishing; f.onPointerDown?.({ input: 'mouse' }); f.onPointerUp?.(); });
    const r = await K.until("c.fishing.state === 'reeling'", 3);
    K.check(r.ok, 'struck: the haul runs', r);
    const plan = await g(() => window.__gw.debug.fishPlan?.() ?? null);
    K.check(plan && plan.sizeClass === 'find' && plan.beats.every((x) => ['take', 'gain', 'lift'].includes(x.phase)), 'the find plan: no runs, no surges, no holds', plan?.beats?.map((x) => x.phase));
    if (shotHaul) { await K.secs(1.0); await K.shoot(`haul-${id}`); }
    const h = await K.until("c.fishing.view?.show?.phase === 'hold' || c.fishing.view?.show?.phase === 'pause'", 12);
    K.check(h.ok, 'the show reaches its present (the find held up)', h);
    const seen = await g(() => ({ ...window.__fd, show: window.__gw.fishing.view?.show ? { pose: window.__gw.fishing.view.show.pose, find: window.__gw.fishing.view.show.find } : null }));
    K.check(seen.found.length === 1 && seen.found[0].findId === id, 'fishing:found {findId, waterKey}', seen.found);
    K.check(seen.caught === 0 && seen.measured === 0, 'never fishing:caught or fish:measured (the measure never opens)', { caught: seen.caught, measured: seen.measured });
    if (shotShow) { await K.secs(0.7); await K.shoot(`show-${id}`); }
    const c = await K.until("c.debug.ui().openModal === 'catch'", 12);
    K.need(c.ok, 'the find card opens', c);
    await K.secs(0.5); await K.settle(300);
    const card = await g(() => { const T = window.__lp, p = T.one('[data-modal=catch] [data-loop=find]'); if (!p) return null;
      const bs = [...document.querySelectorAll('[data-modal=catch] .gw-btn')].filter(T.visible).map((b) => { const r = b.getBoundingClientRect(); return { a: b.dataset.action, w: r.width, h: r.height, t: b.textContent.trim() }; });
      const small = [...p.querySelectorAll('*')].filter((e) => T.visible(e) && e.children.length === 0 && (e.textContent || '').trim() && parseFloat(getComputedStyle(e).fontSize) < 16).map((e) => e.textContent.trim());
      return { find: p.dataset.find, name: p.querySelector('.gw-fd-name')?.textContent, line: p.querySelector('.gw-fd-line')?.textContent, bs, small, pct: /%/.test(p.textContent) }; });
    K.check(card && card.find === id && card.name && card.line, 'the card: its drawing, its name, its one line', card);
    K.check(card && card.bs.length === 2 && card.bs.every((b) => b.w >= 43.5 && b.h >= 43.5), 'Keep and Let go, each a ≥ 44 px target', card?.bs);
    K.check(card && !card.pct, 'no percentage on the card', card);
    if (K.phone) K.check(card && card.small.length === 0, 'every word on the card ≥ 16 px on a phone', card?.small);
    if (shotCard) await K.shoot(`card-${id}`);
    await K.scan(`the card of the ${id}`);
    K.need(await K.tap('[data-modal=catch] [data-action=keep]'), 'Keep');
    await K.settle(300); await K.secs(0.8);
    const hold = await g(() => window.__gw.debug.finds.state().hold);
    K.check(hold.includes(id), 'kept: the find takes a slot in the hold', hold);
    K.check((await top()) !== 'catch', 'the card closed');
    await K.noErrors(`the ${id}`);
  }

  try {
    K.step('5c: a fresh save, Start with no film, home');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => { window.__lp.ev.length = 0; window.__gw.game.beginIntro({ character: 'wick' }); });
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    // the tutorial done, an evening played (a snag never comes on evening 1), Hold 4
    await g(() => { const c = window.__gw; c.debug.loop.tutorial('done'); const L = c.state.meta.loop; L.evenings = Math.max(1, L.evenings); L.holdSlots = 4; c.ui.closeAll?.(); c.ui.loop.openJetty(); });
    await K.secs(1.6); await K.settle(400);
    await K.shoot('home-before');
    K.step('5c: Sail');
    K.need(await g(() => window.__gw.game.sail({ water: 'mossmere' })), 'Sail');
    K.need((await K.until("c.flow === 'playing' && c.fishing.state === 'idle'", 12)).ok, 'on the water');
    await K.secs(0.5);

    await landFind('tin_spoon', { shotHaul: true });
    await landFind('toll_purse');
    await landFind('moat_bollard');
    await K.secs(0.5); await K.settle(200);
    const cells = await g(() => [...document.querySelectorAll('.gw-hold .gw-slot')].map((c) => ({ f: c.dataset.filled, gild: c.classList.contains('gw-gild'), find: !!c.querySelector('.gw-slot-find') })));
    K.check(cells.filter((c) => c.find).length === 3 && cells.filter((c) => c.gild).length === 1, "the hold row: three find glyphs, the Purse's slot gold-edged", cells);
    await K.shoot('hold-row');

    K.step('5c: Home: the tally');
    K.need(await g(() => window.__gw.game.goHome()), 'Home');
    K.need((await K.until("c.debug.ui().openModal === 'tally'", 10)).ok, 'the tally opens');
    await K.secs(12); await K.settle(300);
    const rows = await g(() => [...document.querySelectorAll('[data-loop=tally] .gw-trow')].map((li) => ({ name: li.querySelector('.gw-trow-name b')?.textContent, v: li.querySelector('.gw-trow-v')?.textContent.trim(), find: !!li.querySelector('.gw-trow-find') })));
    K.check(rows.map((r) => r.name).join('|') === "Bent Tin Spoon|The Toll-Keeper's Purse|Moat Bollard", 'the tally: the spoon, the Purse last of the treasures, the bollard carried aboard', rows);
    K.check(rows[0]?.v === '14' && rows[1]?.v === '1,750' && rows[2]?.v === '', 'the treasures paid 14 and 1,750; the bollard for nothing (its glyph)', rows);
    await K.shoot('tally');
    await K.tap('[data-loop=tally] [data-action=sold]') || await K.tap('[data-action=sold]');
    await K.until("c.debug.ui().openModal === 'jetty'", 6);
    await K.secs(1.5); await K.settle(300);
    const got = await g(() => window.__gw.debug.finds.state().finds.got);
    K.check(got.tin_spoon === 1 && got.toll_purse === 1 && got.moat_bollard === 1, 'each find brought home is counted (the bollard fitted)', got);
    await K.shoot('home-bollard');

    K.step('5c: the barge with its three parts and its window boxes; the raft\'s vane and the rod\'s tassel');
    await g(() => window.__gw.debug.finds.give(['buoy_bell', 'gate_glass', 'lily_boxes', 'toll_vane', 'rod_tassel']));
    await K.secs(1.2); await K.settle(300);
    const calls = await g(() => window.__gw.actors.home?.calls?.() ?? null);
    K.check(calls && calls.main <= 6 && calls.mirror <= 2 && calls.shadow <= 2, 'home stays inside its budget with every part fitted (≤ 6 / 2 / 2)', calls);
    let homeLights = await g(() => { const c = window.__gw, h = c.actors.home; let n = 0; c.render.scene.traverse((o) => { if (o.isPointLight && o.intensity > 0) { let p = o; while (p) { if (p === h?.object3d) n++; p = p.parent; } } }); return n; });
    K.check(homeLights === 0, 'no PointLight on the barge', homeLights);
    const looks = await g(() => ({ v: window.__gw.actors.home?.variant?.fsig ?? null }));
    K.check(looks.v === '1111', 'the barge\'s variant carries the bell, the glass, the bollard and the boxes', looks);
    await g(() => window.__gw.ui.closeAll?.());
    await K.secs(0.4);
    await K.shoot('home-parts');
    // a closer look at the stern and the starboard side (the bollard, the boxes, the glass), then the bow quarter (the bell)
    await g(() => { const c = window.__gw, M = c.world.getMooring(), H = M.hull, cs = Math.cos(H.yaw), sn = Math.sin(H.yaw);
      const W = (x, y, z) => [H.x + cs * x + sn * z, y, H.z - sn * x + cs * z];
      c.render.setIntroCamera({ pos: W(6.5, 3.2, 6.5), look: W(0.6, 0.9, 1.6), fov: 46, w: 1 }); });
    await K.secs(0.4);
    await K.shoot('barge-stern-close');
    await g(() => { const c = window.__gw, M = c.world.getMooring(), H = M.hull, cs = Math.cos(H.yaw), sn = Math.sin(H.yaw);
      const W = (x, y, z) => [H.x + cs * x + sn * z, y, H.z - sn * x + cs * z];
      c.render.setIntroCamera({ pos: W(6.5, 3.0, -6.5), look: W(1.2, 1.2, -3.0), fov: 44, w: 1 }); });
    await K.secs(0.4);
    await K.shoot('barge-bow-close');
    await g(() => { const c = window.__gw, p = c.player.position; c.render.setIntroCamera({ pos: [p.x + 3.2, 2.2, p.z + 3.2], look: [p.x, 0.8, p.z], fov: 46, w: 1 }); });
    await K.secs(0.4);
    await K.shoot('raft-looks');
    const lk = await g(() => { const c = window.__gw; let vane = false, tassel = false; c.actors.group.traverse((o) => { if (o.name === 'find:vane') vane = true; if (o.name === 'find:tassel') tassel = true; }); return { vane, tassel }; });
    K.check(lk.vane && lk.tassel, 'the vane on the raft\'s stern post and the tassel on the rod', lk);
    await g(() => window.__gw.render.setIntroCamera(null));
    await K.secs(0.3);

    K.step('5c: the catalogue\'s finds row');
    await g(() => window.__gw.debug.finds.catalogue());
    await K.secs(0.4); await K.settle(400);
    const row = await g(() => { const T = window.__lp, s = T.one('[data-modal=journal] .gw-cat-finds'); if (!s) return null;
      s.scrollIntoView({ block: 'center' });
      const cards = [...s.querySelectorAll('.gw-cat-find')].map((b) => { const r = b.getBoundingClientRect(); return { id: b.dataset.find, name: b.querySelector('.gw-cat-name')?.textContent.trim(), rate: b.querySelector('.gw-cat-rate')?.textContent.trim(), tick: !!b.querySelector('.gw-cat-rate svg'), w: r.width, h: r.height, l: r.left, t: r.top, r: r.right, b: r.bottom }; });
      const sh = window.__gw.progression.loop.findShares('mossmere');
      const fmt = (x) => { const p = x * 100; if (!(p > 1e-9)) return ''; if (p >= 10 - 1e-9) return `${Math.round(p)}%`; const r = Math.round(p * 10) / 10; return `${r % 1 === 0 ? r.toFixed(0) : r.toFixed(1)}%`; };
      return { head: s.querySelector('.gw-cat-gh')?.textContent.replace(/\s+/g, ' ').trim(), cards, want: Object.fromEntries(Object.entries(sh).map(([k, v]) => [k, fmt(v)])) }; });
    K.need(row, 'the catalogue shows its finds row');
    K.check(/^Snags\s*· 1 bite in 20$/.test(row.head), 'its heading: "Snags · 1 bite in 20"', row.head);
    K.check(row.cards.length === 11, 'the Mossmere\'s eleven', row.cards.length);
    K.check(row.cards.every((c) => (c.tick ? row.want[c.id] === '' : c.rate === row.want[c.id])), 'every rate on the row equals findShares (an owned part or look its tick)', row.cards.map((c) => [c.id, c.rate, row.want[c.id]]));
    K.check(row.cards.find((c) => c.id === 'toll_purse')?.rate === '1%', 'the Purse: 1%', row.cards.find((c) => c.id === 'toll_purse'));
    K.check(row.cards.filter((c) => c.name === '· · ·').length === 3 && row.cards.find((c) => c.id === 'tin_spoon')?.name === 'Bent Tin Spoon', 'a find not had is "· · ·"; a find had is named', row.cards.map((c) => [c.id, c.name]));
    K.check(row.cards.every((c) => c.w >= 43.5 && c.h >= 43.5), 'every card a ≥ 44 px target', row.cards.map((c) => [c.id, Math.round(c.w), Math.round(c.h)]));
    await K.secs(0.3);
    await K.shoot('catalogue-finds');
    // the finds row's own words (the Journal's built words around it are 3a's): a heading word, a find's name (× a count), "· · ·" or a rate
    const words = await g(() => { const s = document.querySelector('[data-modal=journal] .gw-cat-finds'), T = window.__gw.data.TEXT_LOOP.finds, out = [];
      const ok = new Set([T.snags, `· ${T.biteIn.replace('{n}', String(Math.round(1 / window.__gw.data.LOOP.finds.snag.perBite)))}`, '· · ·', ...Object.values(T.items).flatMap((x) => [x.name, x.line])]);
      for (const e of s ? s.querySelectorAll('*') : []) { if (e.children.length) continue; const t = (e.textContent || '').trim(); if (!t) continue;
        if (!(ok.has(t) || /^\d{1,2}(\.\d)?%$/.test(t) || (/ ×\d+$/.test(t) && ok.has(t.replace(/ ×\d+$/, ''))))) out.push(t); }
      return out; });
    K.check(words.length === 0, 'every word on the finds row is the finds\' own (a name, "· · ·", a rate, the heading)', words);
    const fishPct = await g(() => [...document.querySelectorAll('[data-modal=journal] .gw-cat-card:not(.gw-cat-find)')].filter((b) => /%/.test(b.textContent)).length);
    K.check(fishPct === 0, 'no percentage under any fish on the page', fishPct);
    await K.noErrors('the walk');
  } catch (e) {
    if (e instanceof Abort) K.note('the walk stopped', e.message);
    else K.check(false, 'the walk threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
  }
  await K.release().catch(() => {});
  log('LOOP_5C', JSON.stringify({ size: K.tag, failures: K.failures, notes: K.notes }));
  return { failures: K.failures };
}
