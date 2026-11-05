// Browser scenario for automatic fishing's progression items (DESIGN §25.14.2a Pg13, Pg14, S7; §25.14.2b FE-Pg1) on a v3
// phase-1 build. Not a node test (check.mjs runs *.test.mjs only):
//   node build.mjs --dev --out=tools/out/af-progression.html
//   node tools/playtest.mjs --html=tools/out/af-progression.html --shots=tools/out/afp/v3 --script=tools/tests/af-progression.scenario.mjs --width=960 --height=540
//   (add --mobile --width=390 --height=844 for the phone layout)
// Flow: boot (?v3=1&v3phase=1, a fresh save: meta.firstEvening {done: false}) → the legacy rule on three saves through the page's
// own migrateSave (v1, P1-era v3, mid-FE) → a run: getLoadout / getStats().hold / getCatchBuffs (Well-fed +2) → Murk: the lures
// at 40% (the Harbour-Bell Spinner bought, on the line, the bait off) → a real cast: the item AT THE CAST counts after a swap →
// a lost Trophy (fish:escaped): the Glimpsed page with odds, no Memories, the gear log pinned to it → an Elder escape: named,
// the Elder Log, a Marked Fish with its +6 once → a snapped line keeps the lure → an Elder Reedjaw at z 2.8 sells for 99 (127 ×
// 0.78) → the logs (getOdds = catchOdds with the owned relics; every per-run level raises the Reedjaw's Trophy) → the death screen
// lists the got-away lines → at the title: the run-less Quayling (Memories once, First Light) and a First Evening replay that
// leaves meta byte-identical → reload with a v1 save: legacy {done: true}, the offer ribbon.
export default async function (api) {
  const { page, frames, evalGame: g, log, shot } = api;
  const failures = [];
  let stepName = 'boot';
  const t0 = Date.now();
  const step = (s) => { stepName = s; log(`---- ${s}  (+${((Date.now() - t0) / 1000).toFixed(0)} s)`); };
  const check = (cond, msg, extra) => {
    if (cond) { log('ok  ', msg, extra !== undefined ? JSON.stringify(extra) : ''); return true; }
    failures.push(`[${stepName}] ${msg}${extra !== undefined ? ` :: ${JSON.stringify(extra)}` : ''}`);
    log('FAIL', msg, extra !== undefined ? JSON.stringify(extra) : '');
    return false;
  };
  const waitFor = async (fn, arg, maxFrames = 240) => { for (let i = 0; i < maxFrames; i++) { if (await g(fn, arg).catch(() => false)) return true; await frames(1); } return false; };
  const lowRes = () => g(() => { try { window.__gw.render.setQuality?.('low'); window.__gw.debug.renderScale?.(0.4); } catch { /* optional */ } });
  const hiShot = async (name) => {
    await g(() => { try { window.__gw.render.setQuality?.('high'); window.__gw.debug.renderScale?.(1); } catch { /* optional */ } });
    await frames(4);
    const p = await shot(name);
    await lowRes();
    return p;
  };
  // a UI screenshot (a modal over the world) keeps the 3D at its low scale: the DOM renders crisp anyway, and a full-quality frame
  // under a modal times out on a loaded software-GL machine
  const uiShot = async (name) => { await frames(3); return shot(name); };
  const noErrors = async () => { const e = await g(() => window.__gw.errors.slice()); check(e.length === 0, 'ctx.errors stays empty', e); };
  const boot = async (save) => {
    // write the save, then block the page's own pagehide / visibilitychange autosave from overwriting it on the way out
    await g((save) => {
      try {
        localStorage.clear();
        if (save) localStorage.setItem('gloomwater.save.v1', JSON.stringify(save));
        const orig = Storage.prototype.setItem;
        Storage.prototype.setItem = function (k, v) { if (k === 'gloomwater.save.v1') return undefined; return orig.call(this, k, v); };
      } catch { /* ignore */ }
    }, save || null);
    await page.goto(page.url().split('?')[0] + '?v3=1&v3phase=1', { waitUntil: 'commit', timeout: 240000 });
    for (let i = 0; i < 240 && !(await g(() => !!window.__gw?.progression && window.__gw.flow !== 'boot').catch(() => false)); i++) await page.waitForTimeout(1000);
    await lowRes();
    await frames(3);
  };
  const closeModals = async () => {
    for (let i = 0; i < 10; i++) {
      await frames(2);
      const m = await g(() => ({ b: !!window.__gw.ui.isBlocking?.(), p: !!window.__gw.paused, lv: window.__gw.debug.ui?.()?.openModal === 'levelup' }));
      if (!m.b && !m.p) return;
      await g(() => { const c = window.__gw; try { if (c.combat?.pendingOptions?.length) c.combat.chooseBoon(c.combat.pendingOptions[0].boonId); c.ui.closeAll?.(); if (c.paused) c.game.resume?.(); } catch { /* optional */ } });
    }
  };

  // ------------------------------------------------------------------------------------------------ boot: a fresh save
  step('boot (?v3=1&v3phase=1), a fresh save');
  await boot(null);
  const b0 = await g(() => { const c = window.__gw; return { v3: c.data.V3_ENABLED, phase: c.data.V3_PHASE, fe: c.state.meta.firstEvening ?? null, flow: c.flow, get: c.progression.getFirstEvening?.() }; });
  check(b0.v3 === true && b0.phase === 1, 'a v3 phase-1 build', b0);
  check(JSON.stringify(b0.fe) === JSON.stringify({ done: false, step: null, skipped: false, legacy: false }), 'FE-Pg1: a fresh save boots with meta.firstEvening {done: false, step: null}', b0.fe);
  check(b0.get && b0.get.offer === false, 'no legacy offer on a fresh save', b0.get);
  await hiShot('01-title-fresh');

  step('FE-Pg1: the legacy rule on three saves (the page\'s own migrateSave)');
  const mig = await g(() => {
    const c = window.__gw;
    const v1 = c.debug.migrate({ version: 2, meta: { runs: 4, journal: { pale_leviathan: { caught: 1 }, dusk_minnow: { caught: 2 } } }, run: null });
    const p1 = c.debug.migrate({ version: 2, meta: { runs: 2, v3ids: true, journal: { dusk_minnow: { caught: 1 } } }, run: null });
    const mid = c.debug.migrate({ version: 2, meta: { runs: 0, v3ids: true, journal: { quayling: { caught: 1 } }, firstEvening: { done: false, step: 'gate', skipped: false, legacy: false } }, run: null });
    return { v1: v1.meta.firstEvening, p1: p1.meta.firstEvening, mid: mid.meta.firstEvening, ids: !!v1.meta.journal.lantern_swallower };
  });
  check(mig.v1?.done === true && mig.v1?.legacy === true && mig.ids, 'a v1 save: {done: true, legacy: true} (after Pg0)', mig.v1);
  check(mig.p1?.done === true && mig.p1?.legacy === true, 'a P1-era v3 save: legacy', mig.p1);
  check(mig.mid?.done === false && mig.mid?.step === 'gate' && mig.mid?.legacy === false, 'a mid-FE save after the catch: untouched (resumes at the gate)', mig.mid);

  // ------------------------------------------------------------------------------------------------ a run
  step('a run: getLoadout, getStats().hold, getCatchBuffs (S7)');
  await g(() => window.__gw.game.startNewRun({}));
  await waitFor(() => window.__gw.flow === 'playing' && !!window.__gw.state.run);
  await closeModals();
  const r0 = await g(() => {
    const c = window.__gw, P = c.progression, D = c.data, r = c.state.run;
    r.upgrades = { rod_ashwood: 2, line_gut: 1, reel_brass: 1 };
    P.invalidateStats();
    r.satiety = 100;
    const lo = P.getLoadout();
    const buffs = P.getCatchBuffs();
    return { outing: r.outing, lures: r.lures, equipped: r.equipped, lo, hold: P.getStats().hold, want: D.upgradeHold(r.upgrades), buffs,
      buffHold: D.catchBuffHold('dusk_minnow', 'keeper', buffs), item: P.getEquippedItem() };
  });
  check(r0.outing === 'first' && JSON.stringify(r0.lures) === '{}', 'run 1 is the First Outing, with no lures yet (run.lures {})', r0);
  check(JSON.stringify(r0.lo.hold) === JSON.stringify(r0.want) && JSON.stringify(r0.hold) === JSON.stringify(r0.want), 'Pg13: getLoadout().hold = getStats().hold = data.upgradeHold(run.upgrades)', { lo: r0.lo.hold, stats: r0.hold });
  check(r0.lo.perRun === true && r0.lo.item === r0.item, 'perRun (legends: fightRun) and the item on the line', r0.lo);
  check(r0.buffs.wellFed === true && r0.buffHold === 2, 'S7: Well-fed is exactly +2 Hold through getCatchBuffs', { buffs: r0.buffs, hold: r0.buffHold });

  step('Pg14: Murk sells the lures at 40% (start lakes only), the Spinner goes on the line');
  await g(() => { const c = window.__gw; c.debug.summonMerchant(); c.state.run.shells = 400; });
  await frames(6);
  const shopOpen = await g(() => { try { window.__gw.ui.openShop(); return true; } catch { return false; } });
  await frames(6);
  const lures = await g(() => window.__gw.progression.shop.getItems().filter((i) => i.kind === 'lure').map((i) => ({ id: i.lureId, price: i.price, hold: i.hold, canBuy: i.canBuy })));
  const want = await g(() => window.__gw.data.LURES.filter((l) => l.onSale === 'start').map((l) => ({ id: l.id, price: Math.round(l.price * 0.4) })));
  check(lures.length === want.length && want.every((w) => lures.some((x) => x.id === w.id && x.price === w.price)), 'every "start" lure is on sale at round(price × 0.4); the deeper lakes\' are absent', { lures, want });
  if (shopOpen) {
    await g(() => { const tab = [...document.querySelectorAll('#ui button, #ui [role=tab]')].find((x) => /^\s*Gear/.test(x.textContent || '')); tab?.click(); });
    await frames(6);
    await g(() => { const el = [...document.querySelectorAll('.gw-item')].find((x) => /Harbour-Bell/.test(x.textContent || '')); el?.scrollIntoView?.({ block: 'center' }); });
    await frames(4);
    await uiShot('02-murk-lure-rows');
  }
  const buy = await g(() => {
    const c = window.__gw, P = c.progression, r = c.state.run;
    r.bait = { ...(r.bait || {}), mireworm: 5 };
    P.equipBait('mireworm');
    const s0 = r.shells;
    const res = P.shop.buy('lure:bell_spinner');
    return { ok: res.ok, msg: res.msg, spent: s0 - r.shells, lures: { ...r.lures }, equipped: r.equipped, bait: r.equippedBait, again: P.shop.buy('lure:bell_spinner').ok, deep: P.shop.buy('lure:mirror_shard').ok };
  });
  check(buy.ok && buy.spent === 88 && buy.lures.bell_spinner === true, 'the Harbour-Bell Spinner: 88 Shells (220 × 0.4), kept in run.lures', buy);
  check(buy.equipped === 'bell_spinner' && buy.bait === null, 'one item on the line: the lure on, the bait off', buy);
  check(buy.again === false && buy.deep === false, 'one per run; an unlit lake\'s lure is refused', buy);
  if (shopOpen) { await frames(4); await uiShot('03-murk-after-buy'); }
  await closeModals();

  step('Pg13: a real cast — the item AT THE CAST counts after a swap');
  await g(() => { const c = window.__gw; c.debug.dismissMerchant?.(); });
  const cast = await g(async () => {
    const c = window.__gw;
    const F = c.fishing;
    const before = F.state;
    return { before };
  });
  // a real cast through fishing's own path (forceBite {wait}: beginCast → consumeBait → fishing:cast → the bobber lands and waits);
  // a mouse hold is unreliable at 1–3 fps on a loaded software-GL machine
  await closeModals();
  await g(() => window.__gw.debug.forceBite?.({ speciesId: 'mossback_perch', wait: 4 }));
  const cast1 = await waitFor(() => ['casting', 'waiting', 'bite'].includes(window.__gw.fishing.state), null, 200);
  const swap = await g(() => {
    const c = window.__gw, P = c.progression;
    const st = c.fishing.state;
    const atCast = P.getLoadout().item;
    P.equipBait('mireworm');                       // a swap after the cast …
    const afterSwap = P.getLoadout().item;
    return { st, atCast, afterSwap, now: P.getEquippedItem() };
  });
  check(cast1 && swap.atCast === 'bell_spinner', 'the cast went out with the Spinner on the line', { cast1, ...swap, before: cast.before });
  check(swap.afterSwap === 'bell_spinner' && swap.now === 'mireworm', '… a swap after the cast changes nothing until the next cast (getLoadout reads the cast item)', swap);
  await hiShot('04-line-out');
  await g(() => { const c = window.__gw; c.fishing.cancel?.('scenario'); });
  await waitFor(() => window.__gw.fishing.state === 'idle', null, 200);
  const back = await g(() => window.__gw.progression.getLoadout().item);
  check(back === 'mireworm', 'line back: the log reads the item on the line now', back);
  await g(() => window.__gw.progression.equipLure('bell_spinner'));

  step('F15 / Pg13: a lost Trophy — a Glimpsed page with odds and no Memories; the gear log pins it');
  const gl = await g(() => {
    const c = window.__gw, P = c.progression, m = c.state.meta;
    const mem0 = m.memories;
    const seen = [];
    c.bus.on('journal:seen', (p) => seen.push(p.speciesId));
    c.bus.emit('fish:escaped', { speciesId: 'gloam_eel', sizeClass: 'trophy', z: 2.1, approxLength: 95, reason: 'thrown', place: null, x: 2, zPos: 4, markedFish: false, grade: 'struck', legendary: false });
    const o = P.getOdds('gloam_eel');
    return { entry: m.journal.gloam_eel, memories: m.memories - mem0, seen, known: o.known, trophy: o.pct?.trophy, pinned: P.getGearLog().pinned };
  });
  check(gl.entry?.seen === true && gl.entry?.caught === 0 && gl.seen.includes('gloam_eel'), 'a Glimpsed page (journal:seen): known, not caught', gl.entry);
  check(gl.memories === 0, 'no Memories for a loss', gl.memories);
  check(gl.known === 'glimpsed' && gl.trophy > 0 && gl.trophy < 100, 'its odds show in the log (floored %)', { known: gl.known, trophy: gl.trophy });
  check(gl.pinned?.speciesId === 'gloam_eel' && gl.pinned.reason === 'thrown' && gl.pinned.auto === true, 'the gear log pins the last fish that got away', gl.pinned);
  await g(() => { try { window.__gw.ui.openJournal(); } catch { /* optional */ } });
  await frames(6);
  await g(() => { const card = [...document.querySelectorAll('.gw-jr-card')].find((x) => /Gloam/.test(x.textContent || '')); card?.click(); });
  await frames(6);
  await uiShot('05-journal-glimpsed');
  await closeModals();

  step('F15: an Elder escape — named at the loss, the Elder Log, a Marked Fish (+6 once)');
  const el = await g(() => {
    const c = window.__gw, P = c.progression, m = c.state.meta;
    const p = { speciesId: 'reedjaw_pike', sizeClass: 'elder', z: 2.8, approxLength: 160, reason: 'snapped', place: null, x: 6, zPos: 9, markedFish: true, grade: 'clean', legendary: false };
    c.bus.emit('fish:escaped', p);
    const mf = P.getMarkedFish('mossmere');
    const o = P.getOdds('reedjaw_pike');
    return { name: p.name, log: m.elderLog?.at(-1), mf, marked: o.marked, first: mf[0] ? P.markedFishHooked(mf[0].id) : null, second: mf[0] ? P.markedFishHooked(mf[0].id) : null };
  });
  check(typeof el.name === 'string' && el.log?.lost === 'snapped' && el.log?.name === el.name, `named at the loss (${el.name}) and in the Elder Log as "still out there"`, el.log);
  check(el.mf.length === 1 && el.mf[0].x === 6 && el.mf[0].z0 === 9, 'a Marked Fish anchored at the escape point', el.mf);
  check(el.marked.length === 1 && el.marked[0].p > 0 && el.marked[0].bonus === true, 'its own line in the log with the +6', el.marked);
  check(el.first?.marked === true && el.second?.marked === false, 're-hooked: +6 once', { first: el.first, second: el.second });

  step('Pg14: a snapped line never loses the lure');
  const snap = await g(() => {
    const c = window.__gw, P = c.progression, r = c.state.run;
    c.bus.emit('fishing:escaped', { reason: 'snapped', sizeClass: 'trophy' });
    c.bus.emit('fish:escaped', { speciesId: 'weeping_carp', sizeClass: 'trophy', approxLength: 80, reason: 'snapped', markedFish: false });
    return { lures: { ...r.lures }, item: P.getEquippedItem() };
  });
  check(snap.lures.bell_spinner === true && snap.item === 'bell_spinner', 'the Spinner survives the snap, still on the line', snap);

  step('Pg13: the landing normaliser — an Elder Reedjaw at z 2.8 sells for round(127 × 0.78)');
  await g(() => window.__gw.debug.landFish('reedjaw_pike', { z: 2.8 }));
  await waitFor(() => window.__gw.ui.isBlocking?.() === true, null, 60);
  const fish = await g(() => { const c = window.__gw; const f = c.state.run.creel.find((x) => x.speciesId === 'reedjaw_pike' && x.sizeClass === 'elder'); return f ? { value: f.value, sizeClass: f.sizeClass, name: f.name, raw: c.data.fishValueV3(c.data.SPECIES_BY_ID.reedjaw_pike, 2.8, {}) } : null; });
  check(fish && fish.raw === 127 && fish.value === Math.round(127 * 0.78), 'an Elder Reedjaw at z 2.8: 127 × 0.78 = 99 Shells', fish);
  await frames(8);
  await hiShot('06-catch-card-elder');
  await closeModals();

  step('Pg13: the logs — getOdds = catchOdds with the owned relics; every per-run level raises the Trophy');
  const logs = await g(() => {
    const c = window.__gw, P = c.progression, D = c.data, r = c.state.run, m = c.state.meta;
    m.relics = { ...(m.relics || {}), seven_knots: 2 };
    const o = P.getOdds('reedjaw_pike');
    const lo = { ...P.getLoadout(), item: P.getEquippedItem() };
    const want = D.catchOdds('reedjaw_pike', lo, { strike: 'struck', buffs: { relics: { seven_knots: 2 } } });
    const ups0 = { ...r.upgrades };
    const steps = [];
    for (const [slot, ids] of Object.entries(D.BALANCE.upgradeTiers.slots)) {
      if (slot === 'creel') continue;
      r.upgrades = {};
      let prev = P.getOdds('reedjaw_pike').odds.trophy;
      for (const id of ids) for (let lv = 1; lv <= D.UPGRADE_BY_ID[id].maxLevel; lv++) { r.upgrades[id] = lv; const p = P.getOdds('reedjaw_pike').odds.trophy; steps.push({ id, lv, gain: +(100 * (p - prev)).toFixed(2) }); prev = p; }
    }
    r.upgrades = ups0;
    const gear = P.getGearLog();
    const spin = gear.find((x) => x.id === 'bell_spinner');
    return { same: JSON.stringify(o.odds) === JSON.stringify(want), odds: o.pct, steps, minGain: Math.min(...steps.map((s) => s.gain)), rating: P.getTackleRating('mossmere'), spin: spin && { hold: spin.hold, owned: spin.owned, compare: spin.compare }, pinned: gear.pinned };
  });
  check(logs.same, 'getOdds equals catchOdds with the owned relics (Struck, no run buffs)', logs.odds);
  check(logs.minGain >= 1, `every per-run rod, line and reel level raises the Reedjaw's Trophy by ≥ 1 point (smallest +${logs.minGain})`, logs.steps);
  check(typeof logs.rating?.word === 'string' && !/\d/.test(logs.rating.word), `the tackle rating in words: "${logs.rating?.held}s held, ${logs.rating?.next}s are ${logs.rating?.word}"`, logs.rating);
  check(logs.spin?.owned === true && logs.spin.hold === 10, 'the gear log: the Spinner row (+10, owned this run)', logs.spin);
  await noErrors();

  step('the death screen lists the got-away lines');
  await g(() => window.__gw.game.endRun('snuffed'));
  await waitFor(() => window.__gw.flow === 'dead' || window.__gw.ui.isBlocking?.() === true, null, 120);
  const sum = await g(() => { const c = window.__gw; const s = c.progression.summarizeRun?.('victory-preview'); return { flow: c.flow, gotAway: s?.gotAway ?? null, marked: s?.markedFishCreated ?? null }; });
  check(Array.isArray(sum.gotAway) && sum.gotAway.some((l) => /Gloam Eel, near 95 cm, threw the hook/.test(l)) && sum.gotAway.some((l) => /Elder Reedjaw Pike/.test(l)), 'summary.gotAway: "A Trophy Gloam Eel, near 95 cm, threw the hook, day 1." …', sum);
  await frames(10);
  await uiShot('07-death-screen');

  step('FE-Pg1 at the title: the run-less Quayling (Memories once, First Light); a replay writes nothing');
  await g(() => { const c = window.__gw; try { c.ui.closeAll?.(); c.game.toTitle?.(); } catch { /* optional */ } });
  await waitFor(() => window.__gw.flow === 'title', null, 120);
  const q = await g(() => {
    const c = window.__gw, P = c.progression, m = c.state.meta;
    const mem0 = m.memories;
    const fl0 = !!m.challenges.first_light;
    P.measure(P.makeFish('quayling', -0.4, 'normal'));
    const mem1 = m.memories;
    for (let i = 0; i < 11; i++) P.measure(P.makeFish('quayling', 0.3, 'normal'));
    return { caught: m.journal.quayling?.caught, firstGain: mem1 - mem0, laterGain: m.memories - mem1, firstLight: !!m.challenges.first_light, fl0 };
  });
  check(q.caught === 12 && q.firstGain >= 3 && q.laterGain === 0, 'a Quayling banks its Memories once (run-less measure; no mastery Memories)', q);
  check(q.firstLight, 'the Quayling counts for First Light', q);
  const rep = await g(() => {
    const c = window.__gw, P = c.progression, m = c.state.meta;
    const snap = JSON.stringify(m);
    c.bus.emit('firstEvening:step', { id: 'framing', prev: null, replay: true });
    for (const id of ['wake', 'cast', 'wait', 'strike', 'play']) c.bus.emit('firstEvening:step', { id, prev: null, replay: true });
    c.bus.emit('fish:escaped', { speciesId: 'quayling', sizeClass: 'small', approxLength: 12, reason: 'spat' });
    const f = P.makeFish('quayling', 0.1, 'normal');
    const res = P.measure(f);
    for (const id of ['measure', 'odds', 'gate']) c.bus.emit('firstEvening:step', { id, prev: null, replay: true });
    c.bus.emit('firstEvening:done', { skipped: false, replay: true, losses: 1 });
    return { same: JSON.stringify(m) === snap, replayFlag: res.replay === true, fe: m.firstEvening };
  });
  check(rep.same && rep.replayFlag, 'FE-Pg1: meta is byte-identical after a replay', rep);
  await noErrors();

  // ------------------------------------------------------------------------------------------------ a legacy save
  step('FE-Pg1: reload with a v1 save — legacy {done: true}, the offer ribbon');
  await boot({ version: 2, savedAt: 1, meta: { memories: 40, memoriesEarnedTotal: 40, relics: {}, runs: 6, deaths: 5, deepestZone: 1, totalFish: 50, journal: { dusk_minnow: { caught: 9, biggest: 0.3 }, pale_leviathan: { caught: 1, biggest: 200 } }, unlocks: {}, challenges: {}, challengeProgress: {}, seenTips: {}, settings: {} }, run: null });
  const leg = await g(() => { const c = window.__gw; return { fe: c.state.meta.firstEvening, get: c.progression.getFirstEvening(), ids: !!c.state.meta.journal.lantern_swallower, flow: c.flow }; });
  check(leg.fe?.done === true && leg.fe?.legacy === true && leg.ids, 'a v1 save boots with meta.firstEvening {done: true, legacy: true}', leg);
  check(leg.get?.offer === true, 'the title may offer "A new first evening (1 min)" once (getFirstEvening().offer)', leg.get);
  await uiShot('08-title-legacy');
  await noErrors();
  return { failures };
}
