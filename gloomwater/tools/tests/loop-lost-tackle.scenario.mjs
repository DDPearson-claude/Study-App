// Lost tackle, lanes L1 and L2 in the browser (docs/loop/LOST-TACKLE.md §9.1's scenario, its first half): a loop dev build from a
// fresh save, desktop and --mobile. Two pieces landed through debug.finds.force: the Lamplighter's Pole (alongside, 3 m) and the
// Veil Angler's Notebook; each the haul, the show and the card (the hook stamp, its one plain line, Keep with where it goes, Let go);
// Keep → Home: the tally carries both aboard for nothing, after every other find, and the notebook shows Veilback Brook
// (meta.loop.places.revealed) → the barge's rack and chart table with the six given → the catalogue's tackle row and a tap.
//
//   node build.mjs --dev --out=tools/out/lost-tackle/dev.html
//   node tools/playtest.mjs --html=tools/out/lost-tackle/dev.html --shots=tools/out/lost-tackle/desktop --script=tools/tests/loop-lost-tackle.scenario.mjs
//   node tools/playtest.mjs --html=tools/out/lost-tackle/dev.html --shots=tools/out/lost-tackle/phone --script=tools/tests/loop-lost-tackle.scenario.mjs --mobile --width=820 --height=900
//
// Prints `LOOP_TACKLE {size, failures, notes}`; returns its failures. Lanes L3–L6 and W extend it (the Kit row, the gear log, the
// Chart's ink-in and the sail through the Veil).
import { makeKit, Abort } from './loop-1a.scenario.mjs';

export default async function (api) {
  const { page, evalGame: g, log } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: 'tackle' });
  /** One piece landed and shown: force it, the snag's bite, the strike, the haul, the show, the card; Keep. */
  async function landFind(id, { shotHaul = false } = {}) {
    K.step(`tackle: the ${id}`);
    await g(() => { window.__fd = { found: [], caught: 0 }; const c = window.__gw; if (!window.__fdOn) { window.__fdOn = true;
      c.bus.on('fishing:found', (p) => window.__fd.found.push(p)); c.bus.on('fishing:caught', () => window.__fd.caught++); } });
    K.need(await g((i) => window.__gw.debug.finds.force(i, { wait: 1.2 }), id), `debug.finds.force(${id}): the next bite is a snag`);
    K.need((await K.until("c.fishing.state === 'bite'", 6)).ok, 'the snag bites');
    await g(() => { const f = window.__gw.fishing; f.onPointerDown?.({ input: 'mouse' }); f.onPointerUp?.(); });
    K.check((await K.until("c.fishing.state === 'reeling'", 3)).ok, 'struck: the haul runs');
    if (shotHaul) { await K.secs(1.2); await K.shoot(`haul-${id}`); }
    const h = await K.until("c.fishing.view?.show?.phase === 'hold' || c.fishing.view?.show?.phase === 'pause'", 14);
    K.check(h.ok, 'the show reaches its present (the piece held up)', h);
    const seen = await g(() => ({ ...window.__fd, show: window.__gw.fishing.view?.show ? { pose: window.__gw.fishing.view.show.pose } : null }));
    K.check(seen.found.length === 1 && seen.found[0].findId === id && seen.caught === 0, 'fishing:found, never fishing:caught', seen);
    await K.secs(0.7); await K.shoot(`show-${id}`);
    K.need((await K.until("c.debug.ui().openModal === 'catch'", 12)).ok, 'the card opens');
    await K.secs(0.5); await K.settle(300);
    const card = await g(() => { const T = window.__lp, p = T.one('[data-modal=catch] [data-loop=find]'); if (!p) return null;
      const bs = [...document.querySelectorAll('[data-modal=catch] .gw-btn')].filter(T.visible).map((b) => { const r = b.getBoundingClientRect(); return { a: b.dataset.action, w: r.width, h: r.height, svg: !!b.querySelector('svg'), t: b.textContent.trim() }; });
      const small = [...p.querySelectorAll('*')].filter((e) => T.visible(e) && e.children.length === 0 && (e.textContent || '').trim() && parseFloat(getComputedStyle(e).fontSize) < 16).map((e) => e.textContent.trim());
      return { find: p.dataset.find, name: p.querySelector('.gw-fd-name')?.textContent, does: p.querySelector('.gw-fd-does')?.textContent, line: !!p.querySelector('.gw-fd-line'),
        stamp: !!p.querySelector('.gw-fd-stamp svg'), bs, small, digits: /\d|%/.test(`${p.querySelector('.gw-fd-name')?.textContent} ${p.querySelector('.gw-fd-does')?.textContent}`) || /%/.test(p.textContent) }; });
    const W = await g((i) => window.__gw.data.TEXT_LOOP.finds.items[i], id);
    K.check(card && card.find === id && card.name === W.name && card.does === W.does && !card.line && card.stamp, 'the card: its drawing, the hook stamp, its name, its one plain line (no owner\'s line)', card);
    K.check(card && card.bs.length === 2 && card.bs.every((b) => b.w >= 43.5 && b.h >= 43.5) && card.bs.find((b) => b.a === 'keep')?.svg, 'Keep (with where it goes) and Let go, each a ≥ 44 px target', card?.bs);
    K.check(card && !card.digits, 'no number or percentage on the card', card);
    if (K.phone) K.check(card && card.small.length === 0, 'every word on the card ≥ 16 px on a phone', card?.small);
    await K.shoot(`card-${id}`);
    await K.scan(`the card of the ${id}`);
    const cf = await fits('[data-modal=catch] [data-loop=find]');
    K.check(cf.length === 0, 'the card: no word cut, off screen or overlapping', cf);
    K.need(await K.tap('[data-modal=catch] [data-action=keep]'), 'Keep');
    await K.settle(300); await K.secs(0.8);
    K.check((await g(() => window.__gw.debug.finds.state().hold)).includes(id), 'kept: the piece takes a slot in the hold');
    await K.noErrors(`the ${id}`);
  }
  /** No text cut, off screen or overlapping inside `sel` (the binding: no overlap or cut at any size). → the faults. */
  const fits = (sel) => g((s) => { const root = document.querySelector(s); if (!root) return [['missing', s]];
    const vis = (e) => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0; };
    const leaves = [...root.querySelectorAll('*')].filter((e) => e.children.length === 0 && (e.textContent || '').trim() && vis(e) && !e.closest('kbd, [class*="key"]'));
    const R = leaves.map((e) => { const cs = getComputedStyle(e); return { t: e.textContent.trim(), r: e.getBoundingClientRect(), cut: (e.scrollWidth > e.clientWidth + 1 && cs.overflowX !== 'visible') || cs.textOverflow === 'ellipsis' && e.scrollWidth > e.clientWidth + 1 }; });
    const out = [];
    for (const a of R) { if (a.cut) out.push(['cut', a.t]); if (a.r.left < -0.5 || a.r.right > innerWidth + 0.5 || a.r.top < -0.5 || a.r.bottom > innerHeight + 0.5) out.push(['off', a.t]); }
    for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) { const a = R[i].r, b = R[j].r, ix = Math.min(a.right, b.right) - Math.max(a.left, b.left), iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (ix > 1 && iy > 1) out.push(['overlap', R[i].t, R[j].t]); }
    return out; }, sel);
  const cam = (pos, look, fov) => g(({ pos, look, fov }) => { const c = window.__gw, H = c.world.getMooring().hull, cs = Math.cos(H.yaw), sn = Math.sin(H.yaw);
    const W = (x, y, z) => [H.x + cs * x + sn * z, y, H.z - sn * x + cs * z];
    c.render.setIntroCamera({ pos: W(...pos), look: W(...look), fov, w: 1 }); }, { pos, look, fov });

  try {
    K.step('tackle: a fresh save, home, Sail');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => { window.__lp.ev.length = 0; window.__gw.game.beginIntro({ character: 'wick' }); });
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    await g(() => { const c = window.__gw; c.debug.loop.tow?.('cut'); c.debug.loop.tutorial('done'); const L = c.state.meta.loop; L.evenings = Math.max(1, L.evenings); L.holdSlots = 4; c.ui.closeAll?.(); c.ui.loop.openJetty(); });
    await K.secs(1.2); await K.settle(300);
    K.need(await g(() => window.__gw.game.sail({ water: 'mossmere' })), 'Sail');
    K.need((await K.until("c.flow === 'playing' && c.fishing.state === 'idle'", 12)).ok, 'on the water');
    await K.secs(0.5);
    const sh0 = await g(() => window.__gw.progression.loop.findShares('mossmere'));
    K.check(['lamp_pole', 'belfry_winch', 'ferry_thread', 'guard_button', 'veil_notebook', 'lily_notebook'].every((id) => Math.abs(sh0[id] - 0.01) < 1e-9), 'the live draw: each piece 1% on a fresh save', sh0);

    await landFind('lamp_pole', { shotHaul: true });
    await landFind('veil_notebook');
    await K.secs(0.4); await K.settle(200);
    await K.shoot('hold-row');

    K.step('tackle: Home: the tally');
    K.need(await g(() => window.__gw.game.goHome()), 'Home');
    K.need((await K.until("c.debug.ui().openModal === 'tally'", 10)).ok, 'the tally opens');
    await K.secs(9); await K.settle(300);
    const rows = await g(() => [...document.querySelectorAll('[data-loop=tally] .gw-trow')].map((li) => ({ name: li.querySelector('.gw-trow-name b')?.textContent, v: li.querySelector('.gw-trow-v')?.textContent.trim(), tackle: li.classList.contains('gw-trow--tackle'), glyph: !!li.querySelector('.gw-trow-v svg') })));
    K.check(rows.map((r) => r.name).join('|') === "Lamplighter's Pole|The Veil Angler's Notebook", 'the tally: both pieces carried aboard', rows);
    K.check(rows.every((r) => r.tackle && r.v === '' && r.glyph), '… each in dim ink, its where-it-goes glyph in the price\'s place, no clams', rows);
    await K.shoot('tally');
    await K.scan('the tally');
    const tf = await fits('[data-loop=tally]');
    K.check(tf.length === 0, 'the tally: no word cut, off screen or overlapping', tf);
    await K.tap('[data-loop=tally] [data-action=sold]') || await K.tap('[data-action=sold]');
    await K.until("c.debug.ui().openModal === 'jetty'", 6);
    await K.secs(1.5); await K.settle(300);
    const st = await g(() => ({ got: window.__gw.debug.finds.state().finds.got, revealed: window.__gw.state.meta.loop.places?.revealed, said: window.__gw.state.meta.loop.said }));
    K.check(st.got.lamp_pole === 1 && st.got.veil_notebook === 1, 'both owned', st.got);
    K.check(JSON.stringify(st.revealed) === '["veilback_brook"]', 'the notebook showed Veilback Brook (meta.loop.places.revealed)', st.revealed);
    await K.shoot('home-after');

    K.step('tackle: the rack and the chart table');
    await g(() => window.__gw.debug.finds.give(['belfry_winch', 'ferry_thread', 'guard_button', 'lily_notebook']));
    await K.secs(1.2); await K.settle(300);
    const calls = await g(() => window.__gw.actors.home?.calls?.() ?? null);
    K.check(calls && calls.main <= 6 && calls.mirror <= 2 && calls.shadow <= 2, 'home stays inside its budget with the six on board (≤ 6 / 2 / 2)', calls);
    const fsig = await g(() => window.__gw.actors.home?.variant?.fsig ?? null);
    K.check(fsig === '0000:111111', 'the barge\'s variant carries the six', fsig);
    await g(() => window.__gw.ui.closeAll?.());
    await K.secs(0.4);
    await K.shoot('home-tackle');
    await cam([0.3, 1.6, 3.9], [-1.08, 1.45, 2.32], 50); await K.secs(0.5);
    await K.shoot('barge-rack');
    await cam([0.55, 1.75, 5.95], [-1.0, 1.24, 4.6], 44); await K.secs(0.5);
    await K.shoot('barge-chart-table');
    await g(() => window.__gw.render.setIntroCamera(null));
    await K.secs(0.3);

    K.step('tackle: the catalogue\'s tackle row');
    await g(() => window.__gw.debug.finds.catalogue());
    await K.secs(0.4); await K.settle(400);
    const row = await g(() => { const T = window.__lp, grid = T.one('[data-modal=journal] .gw-cat-finds [data-row=tackle]'); if (!grid) return null;
      grid.scrollIntoView({ block: 'center' });
      const cards = [...grid.querySelectorAll('.gw-cat-find')].map((b) => { const r = b.getBoundingClientRect(); return { id: b.dataset.find, name: b.querySelector('.gw-cat-name')?.textContent.trim(), rate: b.querySelector('.gw-cat-rate')?.textContent.trim(), tick: !!b.querySelector('.gw-cat-rate svg'), w: r.width, h: r.height }; });
      return { cards }; });
    K.need(row, 'the catalogue shows its tackle row');
    K.check(row.cards.length === 6 && row.cards.every((c) => c.tick && c.name && c.name !== '· · ·'), 'the six, each inked, named and ticked', row.cards);
    K.check(row.cards.every((c) => c.w >= 43.5 && c.h >= 43.5), 'every card a ≥ 44 px target', row.cards.map((c) => [c.id, Math.round(c.w), Math.round(c.h)]));
    await K.secs(0.3);
    await K.shoot('catalogue-row');
    const rf = await fits('[data-modal=journal] .gw-cat-finds [data-row=tackle]');
    K.check(rf.length === 0, 'the tackle row: no name cut, off screen or overlapping', rf);
    // the finds row's own words (the Journal's built words around it are 3a's): a name, "· · ·", a rate, the owner's line, what it does
    const words = await g(() => { const s = document.querySelector('[data-modal=journal] .gw-cat-finds'), T = window.__gw.data.TEXT_LOOP.finds, out = [];
      const ok = new Set([T.snags, `· ${T.biteIn.replace('{n}', String(Math.round(1 / window.__gw.data.LOOP.finds.snag.perBite)))}`, '· · ·', ...Object.values(T.items).flatMap((x) => [x.name, x.line, x.does].filter(Boolean))]);
      for (const e of s ? s.querySelectorAll('*') : []) { if (e.children.length) continue; const t = (e.textContent || '').trim(); if (!t) continue;
        if (!(ok.has(t) || /^\d{1,2}(\.\d)?%$/.test(t) || (/ ×\d+$/.test(t) && ok.has(t.replace(/ ×\d+$/, ''))))) out.push(t); }
      return out; });
    K.check(words.length === 0, 'every word on the finds row is the finds\' own', words);
    K.need(await K.tap('[data-modal=journal] .gw-cat-finds [data-find=lamp_pole]'), 'tap the Pole');
    await K.settle(300); await K.secs(0.3);
    const big = await g(() => { const b = document.querySelector('[data-modal=journal] .gw-fd-big'); if (!b) return null; b.scrollIntoView({ block: 'center' }); return { id: b.dataset.find, text: [...b.querySelectorAll('b, p')].map((e) => e.textContent.trim()) }; });
    const Wp = await g(() => window.__gw.data.TEXT_LOOP.finds.items.lamp_pole);
    K.check(big && big.id === 'lamp_pole' && big.text.join('|') === [Wp.name, Wp.line, Wp.does].join('|'), 'the tap: its drawing, its name, the owner\'s line, what it does', big);
    await K.secs(0.3);
    await K.shoot('catalogue-tackle');
    const bf = await fits('[data-modal=journal] .gw-fd-big');
    K.check(bf.length === 0, 'the tap: no word cut, off screen or overlapping', bf);
    await K.noErrors('the walk');
  } catch (e) {
    if (e instanceof Abort) K.note('the walk stopped', e.message);
    else K.check(false, 'the walk threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
  }
  await K.release().catch(() => {});
  log('LOOP_TACKLE', JSON.stringify({ size: K.tag, failures: K.failures, notes: K.notes }));
  return { failures: K.failures };
}
