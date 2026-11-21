// P1 fishing acceptance in the browser (DESIGN §25.14.2 F1, F2, F4, F13, F7; CONTRACT §13.7 fishing) on a v3 phase-1 build:
//
//   node build.mjs --dev --out=tools/out/p1-fishing.html
//   node tools/playtest.mjs --html=tools/out/p1-fishing.html --shots=tools/out/p1f/shots --script=tools/tests/p1-fishing.scenario.mjs --width=960 --height=540 --lean
//
// The page reloads with v3 on at phase 1 (globalThis.GW_V3 / GW_V3_PHASE set before the bundle runs, plus `?v3=1&v3phase=1` for
// builds that carry main's rollout switch), starts a run (nightMode Lantern; set on the run when progression predates Pg12) and
// drives window.__gw through fishing's debug hooks with a seeded size roll (debug.fishSeed):
//   - F4 / F2: a forced Elder Reedjaw at the stopgap's giant water plays the dome tell, bites with {sizeClass, biteTell}, hooks
//     with no pips and no old trick (both retired with the manual reel's data by D1′); a Lantern slam neither snaps nor ends it;
//   - F1 / F13: open water never rolls past 2.64 at μ 1.8; the float's notches are the same for two species at one point;
//     three catches at a giant spot raise "gone quiet", dawn clears it; fishing:caught carries z / class / length / favours;
//   - F7: Night Rise +0.25 on a night cast; a 14 m shove while waiting keeps the line in Lantern (player.js's knock check asks
//     fishing.cancel('moved'), which discounts combat displacement); a slam and a shove during a fight leave the fish on;
//   - F4: a lapsed bite is let pass (fishing:miss passed, refundBait when progression has it) and banks +0.15 for the next cast.
// Screenshots: the Elder's dome tell, the fight, the Night Rise cast.
export default async function (api) {
  const { page, frames, evalGame: g, log, shot } = api;
  const failures = [];
  let stepName = 'boot';
  const t0 = Date.now();
  const step = (s) => { stepName = s; log(`---- ${s}  (+${((Date.now() - t0) / 1000).toFixed(0)} s)`); };
  const check = (cond, msg, extra) => {
    if (cond) { log('ok  ', msg); return true; }
    failures.push(`[${stepName}] ${msg}${extra !== undefined ? ` :: ${JSON.stringify(extra)}` : ''}`);
    log('FAIL', msg, extra !== undefined ? JSON.stringify(extra) : '');
    return false;
  };
  const waitFor = async (fn, arg, maxFrames = 120) => { for (let i = 0; i < maxFrames; i++) { if (await g(fn, arg)) return true; await frames(1); } return false; };

  step('reload with v3 on at phase 1');
  await page.addInitScript(() => { globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; });
  await page.goto(page.url().split('?')[0] + '?v3=1&v3phase=1', { waitUntil: 'commit', timeout: 240000 });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 240000 });
  await g(() => { try { window.__gw.render.setQuality?.('low'); window.__gw.debug.renderScale?.(0.5); } catch { /* optional */ } });
  let s = await g(() => ({ en: window.__gw.data.V3_ENABLED, ph: window.__gw.data.V3_PHASE, size: !!window.__gw.data.BALANCE.size?.z }));
  check(s.en === true && s.ph === 1 && s.size, 'v3 phase-1 data in the build', s);

  step('start a run (Lantern)');
  await g(() => {
    const c = window.__gw;
    c.game.wipeAll?.();
    c.game.startNewRun({ character: 'wick', nightMode: 'lantern' });
    const r = c.state.run;
    if (r && !r.nightMode) r.nightMode = 'lantern';   // progression before Pg12: the mode the New Descent card would set
    window.__ev = [];
    for (const e of ['fishing:tell', 'fishing:bite', 'fishing:hook', 'fishing:caught', 'fishing:miss', 'fishing:escaped', 'fishing:oldTrick', 'fishing:pip', 'fish:escaped-big']) {
      c.bus.on(e, (p) => window.__ev.push({ e, p: JSON.parse(JSON.stringify(p, (k, v) => (v && v.isVector3 ? { x: v.x, z: v.z } : v))) }));
    }
  });
  await waitFor(() => window.__gw.flow === 'playing' && window.__gw.state.run?.active !== false, null, 200);
  await frames(30);
  const place = (x, z) => g(([x, z]) => { const c = window.__gw; c.player.position.set(x, 0, z); c.player.velocity?.set?.(0, 0, 0); }, [x, z]);
  const fish = () => g(() => window.__gw.debug.fishing());
  const reset = async () => { await g(() => window.__gw.fishing.cancel('reset')); await frames(2); };
  // the catch card, and a level-up picker a landed Elder's XP may open (banked level-ups are combat's C3): clear both
  const closeCard = async () => {
    for (let i = 0; i < 10; i++) {
      const m = await g(() => { const c = window.__gw; try { const o = c.combat.pendingOptions; if (o?.length) c.combat.chooseBoon?.(o[0].boonId ?? o[0].id ?? o[0]); } catch { /* optional */ } return c.debug.ui?.()?.openModal ?? null; });
      if (m === 'levelup') await page.keyboard.press('Digit1');   // the picker's own key, as tools/scenario-run.mjs does
      else await g(() => { try { window.__gw.ui.closeAll?.(); } catch { /* optional */ } });
      await frames(4);
      if (!(await g(() => !!window.__gw.ui.isBlocking?.()))) break;
    }
  };
  await g(() => window.__gw.debug.fishSeed(20261104));

  step('F4 / F2: an Elder Reedjaw at the stopgap giant water');
  await place(4, 14.8);
  await frames(4);
  s = await g(() => window.__gw.debug.forceBite({ speciesId: 'reedjaw_pike', z: 2.95, wait: 2 }));
  check(s === true, 'forced cast lands and waits');
  await waitFor(() => window.__gw.fishing.view.biteTell === 'dome', null, 160);
  await shot('p1f-elder-dome-tell');
  await waitFor(() => window.__gw.fishing.state === 'bite', null, 200);
  let ev = await g(() => window.__ev.slice());
  const bite = ev.filter((x) => x.e === 'fishing:bite').pop(), tell = ev.filter((x) => x.e === 'fishing:tell').pop();
  check(tell?.p.biteTell === 'dome' && bite?.p.sizeClass === 'elder' && bite?.p.biteTell === 'dome', 'the dome tell, then fishing:bite {elder, dome}', { tell: tell?.p, bite: bite?.p });
  let f = await fish();
  check(f.pressureKey === 'mm_deep_centre' && f.giant === true, 'the cast is in the stopgap giant water', { key: f.pressureKey, giant: f.giant });
  // hook, read the fight, slam it and land it in one evaluate: on a 1–8 fps software-GL page a T0 Elder would slip the hook
  // between two round-trips (nobody is holding the line), which is the fish's right but not what this step checks
  s = await g(() => {
    const c = window.__gw;
    c.fishing.onPointerDown();
    const a = c.debug.fishing(), pips = c.fishing.view.pips ? { ...c.fishing.view.pips } : null;
    c.fishing.slam(); c.fishing.cancel('snap');
    const afterSlam = c.fishing.state;
    c.debug.instantCatch();
    return { state: a.state, reel: a.reel, pips, afterSlam };
  });
  // D1′ retired the pips, the old trick and the size → fight table with the manual reel's data; the P1 reel runs on its defaults until F2′
  check(s.state === 'reeling' && !s.pips, 'hooked; no hook-hold pips (retired by D1′)', { state: s.state, pips: s.pips });
  check(s.reel && s.reel.trick === false && s.reel.trickDone === true, 'no old trick pending (retired by D1′)', s.reel);
  check(s.afterSlam === 'reeling', 'Lantern: a slam (fishing.slam and combat\'s cancel(\'snap\')) neither snaps nor ends the fight', s.afterSlam);
  await frames(3);
  ev = await g(() => window.__ev.slice());
  const caught = ev.filter((x) => x.e === 'fishing:caught').pop();
  check(caught?.p.z === 2.95 && caught.p.sizeClass === 'elder' && caught.p.length > 120 && Array.isArray(caught.p.favours), 'fishing:caught carries z, class, length (cm) and the favours', caught?.p);
  await closeCard();
  // a fresh Elder on the line for the screenshot
  await g(() => { window.__gw.fishing.cancel('reset'); window.__gw.debug.fishHook('reedjaw_pike', { z: 2.95 }); });
  await shot('p1f-elder-fight');
  await reset();
  await closeCard();

  step('F1: open water never rolls past 2.64 (μ 1.8, 120 forced bites)');
  await place(0, 46);
  await frames(4);
  s = await g(() => {
    const c = window.__gw, out = { max: -9, n: 0, keys: new Set() };
    c.debug.setFavour(1.8);
    for (let i = 0; i < 120; i++) {
      c.debug.forceBite({ speciesId: 'reedjaw_pike' });
      const d = c.debug.fishing();
      if (d.z != null) { out.max = Math.max(out.max, d.z); out.n++; out.keys.add(String(d.pressureKey)); }
      c.fishing.cancel('reset');
    }
    c.debug.setFavour(null);
    return { max: out.max, n: out.n, keys: [...out.keys] };
  });
  check(s.n === 120 && s.max <= 2.64 && s.keys.join() === 'null', 'z ≤ 2.64 outside giant water', s);

  step('F13: the float never reveals the rolled species');
  s = await g(() => {
    const c = window.__gw, a = {}, b = {};
    c.debug.forceBite({ speciesId: 'dusk_minnow' }); Object.assign(a, c.fishing.view.favour); c.fishing.cancel('reset');
    c.debug.forceBite({ speciesId: 'mossback_perch' }); Object.assign(b, c.fishing.view.favour); c.fishing.cancel('reset');
    return { a: { mu: a.mu, n: a.notches, t: a.terms?.map((t) => t.id) }, b: { mu: b.mu, n: b.notches, t: b.terms?.map((t) => t.id) } };
  });
  check(s.a.n === s.b.n && s.a.mu === s.b.mu && JSON.stringify(s.a.t) === JSON.stringify(s.b.t), 'the same notches and terms for two species at one point', s);

  step('F1 / F13: pressure at a giant spot, "gone quiet", dawn');
  await place(4, 14.8);
  await frames(4);
  // the Elder above was landed at this spot: a dawn first, so the count starts from zero today
  await g(() => window.__gw.bus.emit('phase:change', { phase: 'dawn', prev: 'gloomtide' }));
  s = await g(() => {
    const c = window.__gw, quiet = [], pr = [];
    for (let i = 0; i < 4; i++) {
      c.debug.forceBite({ speciesId: 'mossback_perch' });
      quiet.push(!!c.fishing.view.favour?.quiet);
      pr.push((c.fishing.view.favour?.terms || []).find((t) => t.family === 'pressure')?.value ?? 0);
      c.debug.instantCatch();
      try { c.ui.closeAll?.(); } catch { /* optional */ }
    }
    return { quiet, pr };
  });
  check(s.quiet.join() === 'false,false,false,true' && s.pr.join() === '0,-0.12,-0.24,-0.36', 'pressure −0.12 per catch; gone quiet after three', s);
  await closeCard();
  await g(() => window.__gw.bus.emit('phase:change', { phase: 'dawn', prev: 'gloomtide' }));
  s = await g(() => { const c = window.__gw; c.debug.forceBite({ speciesId: 'mossback_perch' }); const v = { ...c.fishing.view.favour }; c.fishing.cancel('reset'); return v.quiet; });
  check(s === false, 'dawn clears the pressure');

  step('F7: Night Rise and a shove while waiting (Lantern)');
  await g(() => (window.__gw.debug.setPhase ? window.__gw.debug.setPhase('gloomtide') : window.__gw.survival.setPhase?.('gloomtide')));
  await frames(10);
  await place(0, 46);
  await frames(4);
  s = await g(() => { const c = window.__gw; c.debug.forceBite({ speciesId: 'mossback_perch', wait: 4 }); return (c.fishing.view.favour?.terms || []).find((t) => t.id === 'nightRise')?.value ?? null; });
  check(s === 0.25, 'a night cast carries Night Rise +0.25', s);
  await shot('p1f-night-rise-cast');
  s = await g(() => { const c = window.__gw; c.player.applyKnock ? c.player.applyKnock(14, 0) : c.player.position.set(c.player.position.x + 14, 0, c.player.position.z); return true; });
  await frames(40);
  f = await fish();
  check(f.state === 'waiting' || f.state === 'bite', 'Lantern: a 14 m shove does not break the waiting line (fishing.lineBroken ignores it)', { state: f.state, ext: f.extShift });
  await reset();
  // a fight under fire: a slam (fishing.slam, combat's cancel('snap')) and a shove never cost the hooked fish in Lantern
  // (keeping the knock off the raft while hooked is combat's half of the rule, C6; fishing's half is that nothing ends the fight)
  s = await g(() => {
    const c = window.__gw;
    window.__ev.length = 0;
    c.debug.fishHook('mossback_perch', { z: 0.4 });
    const hooked = c.fishing.state;
    c.player.applyKnock?.(5, 0); c.fishing.slam(); c.fishing.cancel('snap');
    return { hooked, after: c.fishing.state };
  });
  await frames(4);
  f = await fish();
  ev = await g(() => window.__ev.slice());
  check(s.hooked === 'reeling' && s.after === 'reeling' && (f.state === 'reeling' || f.state === 'landing') && !ev.some((x) => x.e === 'fishing:escaped'),
    'Lantern: a slam and a shove during a fight leave the fish on', { s, state: f.state, esc: ev.filter((x) => x.e === 'fishing:escaped').map((x) => x.p) });
  await reset();
  await closeCard();
  await g(() => (window.__gw.debug.setPhase ? window.__gw.debug.setPhase('calm') : window.__gw.survival.setPhase?.('calm')));
  // the night may have brought a swarm (and a level-up picker, which pauses the game clock): clear both before timing a bite window
  await g(() => { try { window.__gw.combat.killAll?.('dawn'); } catch { /* optional */ } });
  await closeCard();
  await frames(6);

  step('F4: let it pass');
  await place(0, 46);
  await frames(4);
  await closeCard();   // a modal (catch card, picker) freezes the clock and the bite would never lapse
  const modal = await g(() => ({ blocking: !!window.__gw.ui.isBlocking?.(), modal: window.__gw.debug.ui?.()?.openModal ?? null }));
  if (modal.blocking) log('still blocking before the let-it-pass cast', JSON.stringify(modal));
  await g(() => { window.__ev.length = 0; window.__gw.debug.forceBite({ speciesId: 'mossback_perch' }); });
  await waitFor(() => window.__gw.fishing.state !== 'bite', null, 200);
  ev = await g(() => window.__ev.slice());
  const miss = ev.filter((x) => x.e === 'fishing:miss').pop();
  const hasRefund = await g(() => typeof window.__gw.progression.refundBait === 'function');
  const why = await g(() => ({ state: window.__gw.fishing.state, blocking: !!window.__gw.ui.isBlocking?.(), modal: window.__gw.debug.ui?.()?.openModal ?? null, paused: window.__gw.paused, flow: window.__gw.flow }));
  check(miss?.p.reason === 'passed' && (!hasRefund || miss.p.refunded !== undefined), 'a lapsed bite is let pass (refundBait when progression has it)', { miss: miss?.p, hasRefund, why });
  await frames(30);
  // the next forced cast aims where the pointer is over a camera that has moved since: land it back within 6 m of the lapsed
  // bobber by shifting the raft by the miss (at most 4 tries), then read the float
  s = await g(() => {
    const c = window.__gw, lp = c.debug.fishing().letPass, out = { lp, tries: [] };
    if (!lp) return out;
    for (let i = 0; i < 4; i++) {
      c.debug.forceBite({ speciesId: 'mossback_perch' });
      const b = c.fishing.bobberPos, d = b ? Math.hypot(b.x - lp.x, b.z - lp.z) : null;
      const v = (c.fishing.view.favour?.terms || []).find((t) => t.id === 'letItPass')?.value ?? 0;
      out.tries.push({ d: d == null ? null : Math.round(d * 10) / 10, v });
      const ox = b ? lp.x - b.x : 0, oz = b ? lp.z - b.z : 0;
      c.fishing.cancel('reset');
      if (d != null && d <= 5.5) break;
      c.player.position.set(c.player.position.x + ox, 0, c.player.position.z + oz); c.player.velocity?.set?.(0, 0, 0);
    }
    return out;
  });
  const last = s.tries?.[s.tries.length - 1];
  check(!!s.lp && last && last.d <= 5.5 && last.v === 0.15 && s.tries.every((t) => (t.d <= 6 ? t.v === 0.15 : t.v === 0)),
    'the next cast in the same water (within 6 m): +0.15; farther casts get none', s);

  const errs = await g(() => window.__gw.errors.slice());
  check(errs.length === 0, 'ctx.errors stays empty', errs);
  return { failures };
}
