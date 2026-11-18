// LAKE 2, lane C in the browser (docs/loop/LAKE2.md §6, §9): the road in. A loop dev build from a fresh save; Sporewood is made to ship
// in the page (LOOP.shipped = 'sporewood', as the gate will set it in the source) and the save is given the Mossmere's end (its gear
// bought, its list landed, the clams for the map). Then, as a player would: Murk's lake map (its price, its line, "Moving on leaves bought
// gear behind."), bought (Murk's line); the Chart with two sheets (the window over both, the Mossmere's card, Sporewood's card from its
// mark: the outline coast, its hachures, reeds, in and out, isles, the jetty, Murk's barge); Sail for Sporewood: the leaving card, "Not
// yet" (the Chart as it was), Sail again and Tow: the leg up the Lockwater, the dip, the glide in to Rootfoot Landing (astern), the
// evening at Sporewood (the carry written, the tackle reset); home at Sporewood; the way back to the Mossmere (one dip) and back again
// (no card, no tow); then a second save towed and reloaded mid-leg (it lands at Rootfoot with the carry written once).
//   --part=chart   only the shelf's card, the Chart's frames and the leaving card (no tow): the look rounds at each size
//
//   node build.mjs --dev --out=tools/out/l2c/dev.html
//   node tools/playtest.mjs --html=tools/out/l2c/dev.html --shots=tools/out/l2c/desk --script=tools/tests/lake2-c.scenario.mjs --width=1280 --height=720
//   node tools/playtest.mjs --html=tools/out/l2c/dev.html --shots=tools/out/l2c/phone --script=tools/tests/lake2-c.scenario.mjs --mobile
//
// Prints `LAKE2_C {size, failures, notes, info}`; returns its failures.
import { makeKit, Abort } from './loop-1a.scenario.mjs';

export default async function (api) {
  const { page, evalGame: g, log, args, width, height } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit(api, { label: 'l2c' });
  const info = {};
  const chartOnly = args.part === 'chart';
  const towState = () => g(() => window.__gw.debug.loop.tow?.('state') || null);
  const barge = () => g(() => { const l = window.__gw.state.meta.loop; return { water: l.barge?.water, towed: [...(l.barge?.towed || [])], carry: l.carry ? { ...l.carry, raft: { ...(l.carry.raft || {}) } } : null, tackle: { ...l.tackle }, holdSlots: l.holdSlots, raft: { ...l.raft }, zone: window.__gw.world.getZone?.()?.id }; });
  // the Mossmere's end: its gear bought (Rod T2, Line T2, Reel T2, Hold 6, the raft's parts at II), its list landed, clams for the map
  const mossmereEnd = () => g(() => {
    const c = window.__gw, d = c.data, l = c.state.meta.loop;
    d.LOOP.shipped = 'sporewood';
    Object.assign(l, { clams: 12000, tackle: { rod: 2, line: 2, reel: 2 }, holdSlots: 6, raft: { oars: 2, keel: 2, lantern: 2 } });
    c.state.meta.journal = c.state.meta.journal || {};
    for (const s of d.SPECIES.filter((x) => x.zone === 'mossmere')) c.state.meta.journal[s.id] = { ...(c.state.meta.journal[s.id] || {}), caught: Math.max(1, Number(c.state.meta.journal[s.id]?.caught) || 0) };
    c.game.save();
    return { list: c.progression.loop.listCount('mossmere'), seals: c.progression.loop.seals('sporewood') };
  });
  const chartTargets = () => g(() => [...document.querySelectorAll('[data-modal=chart] [data-water], [data-modal=chart] [data-sheet], [data-modal=chart] [data-sealed], [data-modal=chart] [data-place]')]
    .map((b) => ({ water: b.dataset.water || null, sheet: b.dataset.sheet || null, sealed: b.dataset.sealed || null, place: b.dataset.place || null, r: (({ x, y, width, height }) => [Math.round(x), Math.round(y), Math.round(width), Math.round(height)])(b.getBoundingClientRect()) })));
  const overlaps = (sel) => g((s) => { const R = [...document.querySelectorAll(s)].map((b) => b.getBoundingClientRect()).filter((r) => r.width > 0);
    const out = []; for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) { const a = R[i], b = R[j]; if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1) out.push([i, j]); } return out; }, sel);
  const overflow = (sel) => g((s) => {   // (no word cut or spilling its box: every text element inside its own box and inside the viewport)
    const out = [];
    for (const el of document.querySelectorAll(`${s} p, ${s} h2, ${s} b, ${s} button span, ${s} .gw-shelf-line, ${s} .gw-plate-line`)) {
      const r = el.getBoundingClientRect(); if (!r.width || !r.height || el.closest('.gw-vh')) continue;   // (.gw-vh: words for a screen reader only)
      if ((el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) && getComputedStyle(el).overflow !== 'visible') out.push(['cut', el.className, el.textContent.slice(0, 30)]);
      if (r.left < -0.5 || r.right > innerWidth + 0.5 || r.top < -0.5 || r.bottom > innerHeight + 0.5) out.push(['off', el.className, el.textContent.slice(0, 30), [r.left, r.top, r.right, r.bottom].map(Math.round)]);
    }
    return out;
  }, sel);
  try {
    K.step('l2c: a fresh save, Start with no film, home at the Mossmere');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => { window.__lp.ev.length = 0; window.__gw.game.beginIntro({ character: 'wick' }); });
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    await g(() => { const c = window.__gw; c.debug.loop.tow?.('cut'); c.debug.loop.tutorial('done'); c.ui.closeAll?.(); });
    await K.secs(0.5);
    const end = await mossmereEnd();
    info.end = end;
    K.check(end.seals?.gear?.held && end.seals?.catch?.held && !end.seals?.map?.held, 'the Mossmere\'s end: the gear and catch seals pressed, the map\'s to buy', end.seals);

    K.step('l2c: Murk\'s lake map (its price, its line, the leaving note)');
    await g(() => window.__gw.ui.loop.openShelf({ tab: 'maps', focus: 'lake:sporewood' }));
    await K.secs(1.2); await K.settle(400);
    const plate = await g(() => { const el = document.querySelector('[data-modal=shelf] [data-item="lake:sporewood"]'); return el ? { text: el.textContent.replace(/\s+/g, ' ').trim(), r: el.getBoundingClientRect().toJSON?.() } : null; });
    K.check(!!plate && /leaves bought gear behind/.test(plate.text) && !/Coming soon/.test(plate.text), 'the lake map\'s card: its line and the leaving note, no "Coming soon"', plate);
    await K.shoot('shelf-lake-map');
    K.check((await overflow('[data-modal=shelf]')).length === 0, 'the shelf: no word cut or off the screen', await overflow('[data-modal=shelf]'));
    const bought = await g(() => { const c = window.__gw; const r = c.progression.loop.buy('lake:sporewood'); c.ui.closeAll?.(); return r; });
    K.check(bought?.ok === true, 'the lake map bought', bought);

    K.step('l2c: the Chart with two sheets');
    await g(() => window.__gw.ui.loop.openChart());
    await K.secs(2.4); await K.settle(500);
    const t1 = await chartTargets();
    info.targets = t1;
    K.check(t1.some((t) => t.sheet === 'sporewood'), 'Sporewood\'s mark on the window is a target (its sheet laid beside it)', t1);
    K.check(!t1.some((t) => t.sealed === 'sporewood'), 'Sporewood is no longer the sealed sheet', t1);
    await K.shoot('chart-two-sheets');
    await K.tap('[data-modal=chart] [data-sheet=sporewood]');
    await K.secs(1.2); await K.settle(500);
    const t2 = await chartTargets();
    K.check(t2.some((t) => t.water === 'sporewood') && t2.some((t) => t.sheet === 'mossmere'), 'Sporewood\'s card laid beside the window; the Mossmere\'s mark the way back to its card', t2);
    await K.shoot('chart-sporewood-card');
    // Sporewood's four places on its own sheet (the two the lake map opens owned, the others mist or priced), each name wholly on the
    // water or the paper (never across the shore's pen), inside the card, meeting no other word or target; no two targets overlap
    const lay = await g(() => { const L = window.__gw.debug.loop.chart('layout'), c = L?.cards?.find((k) => k.waterId === 'sporewood');
      const meet = (a, b) => a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1];
      const P = (L?.places || []).filter((p) => p.box);
      return c ? { ids: (L?.places || []).map((p) => p.id), named: P.map((A) => ({ id: A.id, side: A.side, inCard: A.box[0] >= c.x && A.box[0] + A.box[2] <= c.x + c.w && A.box[1] >= c.y && A.box[1] + A.box[3] <= c.y + c.h,
        hits: [...P.filter((q) => q !== A).map((q) => q.box), ...(L?.targets || []).filter((q) => !q.backdrop && q.place !== A.id && q.kind !== 'water').map((q) => q.rect)].filter((o) => meet(A.box, o)).length })) } : null; });
    info.sporewoodCard = lay;
    K.check(!!lay && ['lullaby', 'gill_harp', 'veilwater', 'mothers_cup'].every((id) => lay.ids.includes(id)), 'Sporewood\'s sheet: its four places drawn', lay?.ids);
    K.check(!!lay && lay.named.every((n) => n.side !== 'cross' && n.inCard && n.hits === 0), 'Sporewood\'s sheet: every name off the shore\'s pen, on the card, meeting no other word or target', lay?.named);
    const ov = await overlaps('[data-modal=chart] [data-place], [data-modal=chart] [data-sheet], [data-modal=chart] [data-action=catalogue], [data-modal=chart] [data-action=sail]');
    K.check(ov.length === 0, 'the Chart\'s targets do not overlap', ov);
    await K.scan('the Chart with two sheets');
    if (await g(() => !!document.querySelector('[data-modal=chart] [data-place=lullaby]'))) {
      await K.tap('[data-modal=chart] [data-place=lullaby]');
      await K.secs(0.8); await K.settle(500);
      await K.shoot('chart-sporewood-lullaby');
    }
    await K.noErrors('the Chart');

    K.step('l2c: Sail for Sporewood: the leaving card, Not yet');
    await K.tap('[data-modal=chart] [data-action=sail]');
    await K.secs(0.8); await K.settle(400);
    const card = await g(() => { const el = document.querySelector('[data-loop=leave]'); return el ? el.textContent.replace(/\s+/g, ' ').trim() : null; });
    K.check(!!card && /Tow/.test(card) && /Not yet/.test(card) && /\+2/.test(card), 'the leaving card: what stays, what the hands keep (+2 a slot), Tow and Not yet', card);
    await K.shoot('leave-card');
    K.check((await overflow('[data-loop=leave]')).length === 0, 'the leaving card: no word cut or off the screen', await overflow('[data-loop=leave]'));
    const b0 = await barge();
    await K.tap('[data-loop=leave] [data-action=stay]');
    await K.secs(0.6); await K.settle(300);
    const b1 = await barge();
    K.check(JSON.stringify(b0) === JSON.stringify(b1) && (await g(() => !!document.querySelector('[data-modal=chart]') && !document.querySelector('[data-loop=leave]'))), 'Not yet: the Chart as it was, nothing written', { b0, b1 });
    if (chartOnly) throw new Abort('the chart part only');

    K.step('l2c: Sail again, Tow: the leg up the Lockwater');
    await K.tap('[data-modal=chart] [data-action=sail]');
    await K.secs(0.6); await K.settle(300);
    await K.tap('[data-loop=leave] [data-action=tow]');
    await K.steps(2);
    const s0 = await towState();
    K.check(s0?.phase === 'leg' && s0.water === 'sporewood' && s0.parts?.leg === 5, 'the tow begins: the leg, 5 s (4 s and a fall and a lock)', s0);
    const bt = await barge();
    K.check(bt.water === 'sporewood' && bt.towed.includes('sporewood') && bt.carry?.rod === 2 && bt.carry?.line === 2 && bt.carry?.reel === 2 && bt.tackle.rod === 0 && bt.raft.oars === 0, 'written as it begins: the barge towed, the carry +2 / +2 / +2, the bought gear left', bt);
    for (const [at, name] of [[0.6, 'leg-start'], [2.2, 'leg-lock'], [1.9, 'leg-end']]) { await K.secs(at); await K.settle(300); await K.shoot(name); }
    K.need((await K.until("c.debug.loop.tow?.('state')?.phase === 'glide'", 4)).ok, 'the dip, then the glide in');
    const z = await barge();
    K.check(z.zone === 'sporewood', 'under the dip the world went to Sporewood', z);
    await K.secs(0.4); await K.settle(400); await K.shoot('glide-in-early');
    await K.secs(1.3); await K.settle(400); await K.shoot('glide-in-late');
    K.need((await K.until("c.flow === 'playing'", 12)).ok, 'the evening begins at Sporewood (the glide out from the stern)');
    const run = await g(() => ({ zone: window.__gw.state.run?.zone, towed: window.__gw.state.meta.loop.barge.towed.slice() }));
    K.check(run.zone === 'sporewood', 'the trip is at Sporewood', run);
    await K.secs(3); await K.settle(400); await K.shoot('first-evening-lift');
    await K.until('c.game.lifting?.() === null', 12);
    await K.secs(1); await K.settle(400); await K.shoot('first-evening');
    await K.noErrors('the tow');

    K.step('l2c: home at Sporewood, then the way back to the Mossmere and again to Sporewood');
    await g(() => window.__gw.game.goHome({}));
    K.need((await K.until("c.flow === 'home' && !c.game.homeGlide?.()", 10)).ok, 'home at Sporewood');
    await g(() => window.__gw.ui.closeAll?.());
    await K.secs(1.5); await K.settle(400); await K.shoot('home-rootfoot');
    const ev0 = await K.evCount();
    K.check(await g(() => window.__gw.game.sail({ water: 'mossmere' })) === true, 'Sail for the Mossmere: no card');
    await K.steps(3);
    const wb = await towState();
    K.check(/^back/.test(wb?.phase || ''), 'the way back: one ink dip', wb);
    K.need((await K.until("c.flow === 'playing'", 12)).ok, 'the evening at the Mossmere');
    const back = await barge();
    K.check(back.water === 'mossmere' && back.zone === 'mossmere' && back.carry?.rod === 2 && back.tackle.rod === 0, 'the barge at the Mossmere: only the barge moved (the carry as it was)', back);
    const tows = (await K.events(ev0)).filter((e) => e.e === 'loop:tow' && e.p?.phase === 'leg');
    K.check(tows.length === 0, 'no leg on the way back', tows);
    await K.secs(1.5); await K.settle(400); await K.shoot('way-back-mossmere');
    await g(() => window.__gw.game.goHome({}));
    K.need((await K.until("c.flow === 'home' && !c.game.homeGlide?.()", 10)).ok, 'home at the Mossmere');
    await g(() => window.__gw.ui.closeAll?.());
    K.check(await g(() => window.__gw.game.sail({ water: 'sporewood' })) === true && !(await g(() => !!document.querySelector('[data-loop=leave]'))), 'Sail for Sporewood again: no card, the way back');
    K.need((await K.until("c.flow === 'playing'", 12)).ok, 'the evening at Sporewood again');
    const again = await barge();
    K.check(again.water === 'sporewood' && again.carry?.rod === 2, 'the carry written once: +2 still', again);
    await K.noErrors('the way back');

    K.step('l2c: a second save, reloaded mid-leg');
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => { window.__gw.game.beginIntro({ character: 'wick' }); });
    K.need((await K.until("c.flow === 'home'", 5)).ok, 'Start: flow home');
    await g(() => { const c = window.__gw; c.debug.loop.tow?.('cut'); c.debug.loop.tutorial('done'); c.ui.closeAll?.(); });
    await mossmereEnd();
    await g(() => { const c = window.__gw; c.progression.loop.buy('lake:sporewood'); c.game.save(); });
    await g(() => window.__gw.game.sail({ water: 'sporewood', leave: true }));
    K.need((await K.until("c.debug.loop.tow?.('state')?.phase === 'leg'", 3)).ok, 'the leg begins');
    await K.secs(1.5);
    await K.reload();
    await g(() => window.__gw.data.LOOP.shipped = 'sporewood');
    await g(() => window.__gw.game.toHome());
    K.need((await K.until("c.flow === 'home'", 6)).ok, 'Continue: home');
    await K.secs(1.5); await K.settle(400);
    const rl = await barge();
    K.check(rl.water === 'sporewood' && rl.zone === 'sporewood' && rl.towed.includes('sporewood') && rl.carry?.rod === 2 && rl.tackle.rod === 0, 'reloaded mid-leg: home at Rootfoot Landing, the carry written once', rl);
    await K.shoot('reload-mid-tow');
    await K.noErrors('the reload');
  } catch (e) {
    if (!(e instanceof Abort)) { K.failures.push(`[${K.part}] threw: ${e?.stack || e}`); log('THREW', e?.stack || e); }
  }
  const out = { size: `${width}x${height}`, failures: K.failures, notes: K.notes, info };
  log('LAKE2_C ' + JSON.stringify(out));
  return K.failures;
}
