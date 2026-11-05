// P1 staging smoke (DESIGN §25.14.2, CONTRACT §13): the merged Phase 1 modules played together in the Mossmere with v3 on
// at phase 1, in a browser through playtest:
//
//   node build.mjs --dev --out=tools/out/p1s/p1-v3.html
//   node tools/playtest.mjs --html=tools/out/p1s/p1-v3.html --shots=tools/out/p1s/smoke --script=tools/tests/p1-smoke.scenario.mjs --width=960 --height=540 --lean
//   (--only=run1,lantern runs a part; the run set-up always happens)
//
// run 1 (New Descent through the ui): the First Outing, all still (main → progression → combat / survival agree);
//   S1–S3: day-1 calm 210 s, dusk 20, night 90, dawn 10, day-2 calm 180; oil/s from the raft context table; Well-fed at full
//   satiety (+reelSpeed in getStats), satiety 0 harmless;
//   F1: 30 forced bites at μ 1.8 in the stopgap giant water (mm_deep_centre) hold Elders, 30 in open water stay ≤ 2.64;
//   F4 / F2: a forced Elder Reedjaw plays the dome tell (audio bite_dome), bites {elder, dome}, hooks with pips; past 55 % the
//   old trick fires (fishing:oldTrick, audio); landing it: fishing:caught → fish:measured → fish:landed {measured}, the PB in
//   meta and in the saved envelope (main saves on fish:measured), audio seal_stamp; a Still night: Night Rise (audio), the
//   stillnight mood, no spawns; S2 guttering → Snuffed (player:died {cause: 'snuffed'}).
// run 2 (Lantern): night 1 spawns nothing; night 2 spawns only inside k 0.05–0.50, and a hand slam on a hooked fish moves
//   neither the raft nor the line; Scorched (Embers to 0): the swarm withdraws, oil −30, a forced lamp-watch, the run goes
//   on, dawn mends; S6: dusk ending at the South-East Buoy-Lamp holds night 4's swarm off, sailing away opens the window.
// Every step: 0 ctx.errors (playtest adds page and console errors).
export default async function (api) {
  const { page, frames, evalGame: g, log, shot } = api;
  const failures = [];
  const only = api.args?.only ? String(api.args.only).toLowerCase().split(',') : null;
  const want = (x) => !only || only.includes(x);
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
  const safeShot = async (name) => { for (let i = 0; i < 3; i++) { try { await shot(name); return; } catch (e) { log('shot retry', name, String(e?.message || e).slice(0, 80)); } } };
  const noErrors = async () => { const e = await g(() => window.__gw.errors.slice()); check(e.length === 0, 'ctx.errors stays empty', e); };
  const clickButton = (label, scope = '#ui') => g(([label, scope]) => {
    const root = document.querySelector(scope) || document;
    const text = (x) => (x.querySelector(':scope > span')?.textContent || x.textContent).replace(/\s+/g, ' ').trim();
    const b = [...root.querySelectorAll('button')].find((x) => !x.disabled && x.offsetParent !== null && (x.dataset.action === label.toLowerCase() || text(x).startsWith(label)));
    if (!b) return false;
    b.click();
    return true;
  }, [label, scope]);
  // a catch card, a banked or swarm level-up and tips block the game clock: clear them the way a player would
  const clearModals = async () => {
    for (let i = 0; i < 12; i++) {
      await frames(2);
      const m = await g(() => ({ m: window.__gw.debug.ui?.()?.openModal ?? null, b: !!window.__gw.ui.isBlocking?.(), p: !!window.__gw.paused }));
      if (!m.b && !m.p && m.m !== 'levelup') return;
      if (m.m === 'levelup') await g(() => { const c = window.__gw, o = c.combat.pendingOptions; if (o?.length) c.combat.chooseBoon(o[0].boonId); else c.ui.closeAll?.(); });
      else if (m.m === 'catch') { if (!(await clickButton('Keep'))) await g(() => window.__gw.ui.closeAll?.()); }
      else await g(() => { const c = window.__gw; try { c.ui.closeAll?.(); if (c.paused) c.game.resume?.(); } catch { /* optional */ } });
    }
  };
  const place = (x, z) => g(([x, z]) => { const c = window.__gw; c.player.teleport ? c.player.teleport(new c.THREE.Vector3(x, 0, z), 0) : c.player.position.set(x, 0, z); c.player.velocity?.set?.(0, 0, 0); }, [x, z]);
  const recorder = () => g(() => {
    const c = window.__gw;
    window.__sm = [];
    const json = (p) => { try { return JSON.parse(JSON.stringify(p, (k, v) => (v && typeof v === 'object' && (v.isObject3D || v.isVector3) ? (v.isVector3 ? { x: v.x, z: v.z } : undefined) : v))); } catch { return null; } };
    const evs = ['fishing:tell', 'fishing:bite', 'fishing:hook', 'fishing:oldTrick', 'fishing:caught', 'fish:measured', 'fish:landed', 'fishing:escaped',
      'enemy:spawn', 'swarm:window', 'player:scorched', 'lampwatch:start', 'lampwatch:end', 'player:died', 'phase:change', 'levelup', 'levelup:banked', 'fishing:snag'];
    for (const e of evs) {
      c.bus.on(e, (p) => {
        try {
          const pl = e === 'enemy:spawn' ? { id: p?.enemy?.enemyId } : e === 'fish:landed' ? { measured: p?.measured, species: p?.species?.id ?? p?.speciesId } : e === 'levelup' ? { banked: !!p?.banked } : json(p);
          window.__sm.push({ e, k: +(c.survival.getPhaseInfo().k || 0).toFixed(4), phase: c.state.run?.phase, day: c.state.run?.day, p: pl });
        } catch { /* ignore */ }
      });
    }
  });
  const mark = () => g(() => (window.__sm || []).length);
  const since = (n, e) => g(([n, e]) => (window.__sm || []).slice(n).filter((x) => !e || x.e === e), [n, e]);
  const atK = (k) => g((k) => { const c = window.__gw, r = c.state.run, d = c.survival.getPhaseInfo().duration || 90; r.phaseTime = k * d; return c.survival.getPhaseInfo().k; }, k);
  const runUntilK = async (k, maxFrames = 700, each) => {
    for (let i = 0; i < maxFrames; i++) {
      const s = await g(() => { const c = window.__gw; if ((c.state.run?.oil ?? 100) < 40) c.debug.setOil(100); return { k: c.survival.getPhaseInfo().k, phase: c.state.run?.phase, flow: c.flow }; });
      if (s.phase !== 'gloomtide' || s.k >= k || s.flow !== 'playing') return s;
      if (each) await each(s);
      if (i % 4 === 3) await clearModals();
      await frames(1);
    }
    return null;
  };
  const night = async (n) => { await clearModals(); return g((n) => { const c = window.__gw; c.ui.closeAll?.(); c.debug.setDay(n); c.debug.setOil(100); c.debug.setPhase('dusk'); c.debug.setPhase('gloomtide'); return c.survival.getPhaseInfo(); }, n); };
  const audioT = () => g(() => window.__gw.debug.audio?.().time ?? 0);
  const heard = async (t, name, maxFrames = 60) => {
    await waitFor(([t, name]) => (window.__gw.debug.audioLog?.(240) || []).some((x) => x.at >= t - 0.005 && x.name === name), [t, name], maxFrames);
    return g(([t, name]) => (window.__gw.debug.audioLog?.(240) || []).filter((x) => x.at >= t - 0.005 && x.name === name), [t, name]);
  };

  // ------------------------------------------------------------------ boot: v3 on at phase 1, a fresh save
  step('boot (?v3=1&v3phase=1)');
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 240000 });
  await g(() => window.__gw.game.wipeAll());
  await page.goto(page.url().split('?')[0] + '?v3=1&v3phase=1', { waitUntil: 'commit', timeout: 240000 });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 240000 });
  await frames(2);
  await g(() => { try { window.__gw.render.setQuality?.('low'); window.__gw.debug.renderScale?.(0.35); } catch { /* optional */ } });
  let s = await g(() => { const c = window.__gw, d = c.data; return { en: d.V3_ENABLED, ph: d.V3_PHASE, runs: c.state.meta.runs, size: !!d.BALANCE.size?.fight, nm: !!d.BALANCE.nightModes, oil: !!d.BALANCE.oil?.context, sw: c.debug.v3?.()?.switch ?? null }; });
  check(s.en === true && s.ph === 1 && s.size && s.nm && s.oil, 'v3 phase-1 data in the build (size, nightModes, oil table)', s);
  check(s.runs === 0, 'a fresh save', s.runs);
  await recorder();
  await page.keyboard.press('Shift');   // a gesture unlocks the WebAudio graph
  const audioOn = await waitFor(() => window.__gw.debug.audio?.().state === 'running', null, 60);
  check(audioOn, 'the WebAudio graph runs after a gesture');

  // ------------------------------------------------------------------ run 1: New Descent → the First Outing (all still)
  step('run 1: New Descent (ui) → the First Outing');
  check(await clickButton('New Descent', '.gw-m-title'), 'title has New Descent');
  await frames(3);
  if (!(await clickButton('Descend as'))) await g(() => window.__gw.game.startNewRun({ character: 'wick' }));
  await waitFor(() => window.__gw.flow === 'playing', null, 120);
  await frames(4);
  await clearModals();
  s = await g(() => { const c = window.__gw, r = c.state.run; return { outing: r.outing, mode: r.nightMode, combat: c.combat.nightMode, surv: c.debug.survival().nightMode, zone: r.zone, day: r.day, phase: r.phase, runs: c.state.meta.runs }; });
  check(s.outing === 'first' && s.combat === 'still' && s.surv === 'still' && s.zone === 'mossmere' && s.day === 1 && s.phase === 'calm', 'run 1 is the First Outing: still in combat and survival, day 1 calm in the Mossmere', s);
  await g(() => window.__gw.debug.timeScale?.(4));

  if (want('run1')) {
    step('S1 / S2 / S3: the day clock, the oil table, Well-fed');
    s = await g(() => {
      const c = window.__gw, d = c.data, st = c.progression.getStats(), v = c.survival.getVitals(), z = d.ZONE_BY_ID.mossmere;
      const want = st.oilDrain * (z.drain?.oil ?? 1) * d.BALANCE.oil.context.raft.calm;
      return { dur: c.survival.getPhaseInfo().duration, rate: v.oilRate, want, ctx: c.debug.survival().oilContext, fed: c.survival.wellFed, durs: c.survival.getPhaseDurations?.(1) };
    });
    check(s.dur === 210, 'day-1 calm lasts 210 s (180 + the 30 s Arrival Hush)', s);
    check(s.ctx === 'raft' && Math.abs(s.rate - s.want) < 1e-6, 'oil/s = oilDrain × zone oil × context.raft.calm (no Heat factor)', s);
    check(s.fed === true, 'full satiety reads Well-fed', s.fed);
    s = await g(() => {
      const c = window.__gw;
      c.progression.invalidateStats?.();
      const full = c.progression.getStats().reelSpeed;
      c.debug.setSatiety(30); c.progression.invalidateStats?.();
      const low = { reel: c.progression.getStats().reelSpeed, fed: c.survival.wellFed };
      c.debug.setSatiety(0);
      return { full, low, hp: c.state.run.hp };
    });
    for (let i = 0; i < 30; i++) await frames(1);   // ≈ 6 s of game time at satiety 0 (timeScale 4)
    const hp2 = await g(() => window.__gw.state.run.hp);
    check(s.low.fed === false && Math.abs(s.full - s.low.reel - 0.08) < 1e-6, 'Well-fed adds reelSpeed +0.08 (lost below 60 %)', s);
    check(hp2 === s.hp, 'satiety 0 costs no Embers', { before: s.hp, after: hp2 });
    await g(() => window.__gw.debug.setSatiety(100));

    step('F1: the size roll — the stopgap giant water holds Elders, open water stays ≤ 2.64 (μ 1.8)');
    await place(4, 14.8);
    await frames(3);
    await g(() => window.__gw.debug.fishSeed?.(20261105));
    s = await g(() => {
      const c = window.__gw, out = { n: 0, elders: 0, max: -9, keys: new Set(), classes: {} };
      c.debug.setFavour(1.8);
      for (let i = 0; i < 30; i++) {
        c.debug.forceBite({ speciesId: 'reedjaw_pike' });
        const d = c.debug.fishing();
        if (d.z != null) { out.n++; out.max = Math.max(out.max, d.z); if (d.sizeClass === 'elder') out.elders++; out.classes[d.sizeClass] = (out.classes[d.sizeClass] || 0) + 1; out.keys.add(String(d.pressureKey)); }
        c.fishing.cancel('reset');
      }
      c.debug.setFavour(null);
      return { ...out, keys: [...out.keys] };
    });
    check(s.n === 30 && s.keys.join() === 'mm_deep_centre' && s.elders >= 1, 'forced bites at mm_deep_centre roll sizes and hold Elders', s);
    await place(0, 46);
    await frames(3);
    s = await g(() => {
      const c = window.__gw, out = { n: 0, max: -9, keys: new Set() };
      c.debug.setFavour(1.8);
      for (let i = 0; i < 30; i++) {
        c.debug.forceBite({ speciesId: 'reedjaw_pike' });
        const d = c.debug.fishing();
        if (d.z != null) { out.n++; out.max = Math.max(out.max, d.z); out.keys.add(String(d.pressureKey)); }
        c.fishing.cancel('reset');
      }
      c.debug.setFavour(null);
      return { ...out, keys: [...out.keys] };
    });
    check(s.n === 30 && s.max <= 2.64 && s.keys.join() === 'null', 'open water never rolls past a top Trophy (2.64)', s);

    step('F4 / F2: an Elder Reedjaw — the dome tell, pips, the old trick, the landing and the PB');
    await g(() => window.__gw.debug.timeScale?.(1));   // real time for the bite window (a 4× clock outruns the round-trips)
    await place(4, 14.8);
    await frames(3);
    let tA = await audioT();
    let m0 = await mark();
    s = await g(() => window.__gw.debug.forceBite({ speciesId: 'reedjaw_pike', z: 2.95, wait: 2 }));
    check(s === true, 'a forced cast lands in giant water and waits');
    await waitFor(() => window.__gw.fishing.view.biteTell === 'dome', null, 200);
    await safeShot('smoke-elder-dome');
    // hook in the same evaluate that sees the bite (a round-trip can outlast the hook window on a 1–8 fps page)
    let hookedAt = null;
    // and jump the fight past 55 % at once, so the old trick comes (the reel starts it on its next update)
    await waitFor(() => {
      const c = window.__gw, f = c.fishing;
      if (f.state !== 'bite') return false;
      f.onPointerDown();
      const r = c.debug.fishReel?.();
      window.__hook = { state: f.state, pips: f.view.pips ? { ...f.view.pips } : null, trickDone: r?.trickDone, stamina: r?.stamina };
      if (r) r.P = Math.max(r.P, 0.6);
      return true;
    }, null, 300);
    hookedAt = await g(() => window.__hook || null);
    const tell = (await since(m0, 'fishing:tell')).pop(), bite = (await since(m0, 'fishing:bite')).pop();
    check(tell?.p.biteTell === 'dome' && typeof tell.p.dur === 'number' && bite?.p.sizeClass === 'elder' && bite.p.biteTell === 'dome', 'fishing:tell {dome, dur}, then fishing:bite {elder, dome}', { tell: tell?.p, bite: bite?.p });
    const dome = await heard(tA, 'bite_dome');
    check(dome.length >= 1, 'audio plays bite_dome for the Elder tell', dome.length);
    // a small bot keeps the Elder on while the trick plays (tension held under 0.45)
    s = hookedAt || {};
    check(s.state === 'reeling' && s.pips?.n >= 2 && s.trickDone === false, 'hooked with hook-hold pips and an old trick pending', s);
    let trick = null;
    for (let i = 0; i < 120 && !trick; i++) {
      const k = await g(() => { const c = window.__gw, f = c.fishing, T = f.view?.tension ?? 0; if (f.state === 'reeling') { if (T < 0.45) f.onPointerDown(); else f.onPointerUp(); } return f.state; });
      trick = (await since(m0, 'fishing:oldTrick')).pop() || null;
      if (k !== 'reeling') break;
      await frames(1);
    }
    check(!!trick && ['pull', 'leap'].includes(trick.p.kind), 'past 55 % the Elder plays its old trick (fishing:oldTrick)', trick?.p);
    tA = await audioT();
    m0 = await mark();
    await g(() => { const c = window.__gw; c.fishing.onPointerUp(); c.debug.instantCatch(); });
    await waitFor(() => window.__gw.debug.ui?.()?.openModal === 'catch', null, 120);
    const evs = (await since(m0)).filter((x) => ['fishing:caught', 'fish:measured', 'fish:landed'].includes(x.e));
    const meas = evs.find((x) => x.e === 'fish:measured');
    // without F5's ceremony progression measures inside the fishing:caught dispatch (as v1's landFish did), so a listener
    // registered after progression (this recorder) hears fishing:caught last: the order that matters is measured → landed
    const iM = evs.findIndex((x) => x.e === 'fish:measured'), iL = evs.findIndex((x) => x.e === 'fish:landed');
    check(evs.filter((x) => x.e === 'fishing:caught').length === 1 && evs.filter((x) => x.e === 'fish:measured').length === 1 && evs.filter((x) => x.e === 'fish:landed').length === 1
      && iM >= 0 && iM < iL && evs[iL].p.measured === true, 'one fishing:caught; fish:measured once, then fish:landed {measured: true}', evs.map((x) => [x.e, x.p?.measured]));
    // a first catch of the species is "new", not a 'pb' record (progression writes the PB into the journal either way)
    const recs = (meas?.p.records || []);
    check(meas?.p.sizeClass === 'elder' && meas.p.z === 2.95 && meas.p.length > 120 && !!meas.p.name
      && recs.some((r) => r.kind === 'classFirst' && r.sizeClass === 'elder') && recs.some((r) => r.kind === 'elderLog'),
      'fish:measured carries the Elder\'s class, z, length, its name, the Elder class first and the Elder Log line', meas?.p && { z: meas.p.z, cls: meas.p.sizeClass, len: meas.p.length, rec: recs.map((r) => r.kind), name: meas.p.name });
    s = await g(() => {
      const c = window.__gw, j = c.state.meta.journal?.reedjaw_pike;
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem('gloomwater.save.v1'))?.meta?.journal?.reedjaw_pike ?? null; } catch { saved = null; }
      return { pb: j?.pbLength, seals: j?.seals, savedPb: saved?.pbLength ?? null };
    });
    check(s.pb > 120 && s.seals?.elder && s.savedPb === s.pb, 'the PB and the Elder seal are in meta and already in the saved envelope', s);
    const seal = await heard(tA, 'seal_stamp', 120);
    check(seal.length >= 1, 'audio stamps the seal on fish:measured', seal.length);
    await safeShot('smoke-elder-card');
    await clearModals();
    await g(() => window.__gw.debug.timeScale?.(4));

    step('a Still night: Night Rise, the stillnight mood, nothing spawns');
    m0 = await mark();
    tA = await audioT();
    await g(() => { const c = window.__gw; c.debug.setPhase('dusk'); });
    s = await g(() => window.__gw.survival.getPhaseInfo().duration);
    check(s === 20, 'dusk lasts 20 s', s);
    await g(() => window.__gw.debug.setPhase('gloomtide'));
    await clearModals();
    const pcN = (await since(m0, 'phase:change')).pop();
    s = await g(() => window.__gw.survival.getPhaseInfo().duration);
    check(pcN?.p.phase === 'gloomtide' && pcN.p.nightMode === 'still' && s === 90, 'the night\'s phase:change carries nightMode still; 90 s', { pc: pcN?.p, dur: s });
    const rise = await heard(tA, 'night_rise', 120);
    check(rise.length >= 1, 'audio plays Night Rise', rise.length);
    await atK(0.1);
    await runUntilK(0.35, 300);
    s = await g(() => window.__gw.debug.audio?.() || {});
    check(s.mood === 'stillnight' && s.mood !== 'gloom', 'a Still night plays the stillnight mood, not the gloom', { mood: s.mood, bed: s.loops?.bed });
    check((await since(m0, 'enemy:spawn')).length === 0 && (await since(m0, 'swarm:window')).length === 0, 'nothing spawns on a Still night');
    await g(() => window.__gw.debug.setPhase('dawn'));
    s = await g(() => window.__gw.survival.getPhaseInfo().duration);
    check(s === 10, 'dawn lasts 10 s', s);
    await g(() => window.__gw.debug.setPhase('calm'));
    await clearModals();
    s = await g(() => ({ day: window.__gw.state.run.day, dur: window.__gw.survival.getPhaseInfo().duration }));
    check(s.day === 2 && s.dur === 180, 'day 2 calm lasts 180 s', s);

    step('S2: guttering → Snuffed ends the run through the death flow');
    m0 = await mark();
    s = await g(() => { const c = window.__gw; c.debug.god(false); const left = c.debug.gutter(); return { left, gut: c.survival.guttering, light: c.survival.lightRadius }; });
    for (let i = 0; i < 10; i++) await frames(1);
    const g2 = await g(() => ({ gut: window.__gw.survival.guttering, left: window.__gw.survival.gutterLeft, flow: window.__gw.flow }));
    check(s.gut === true && g2.gut === true && g2.left < s.left && g2.flow === 'playing', 'oil 0 with the Last Flicker spent: guttering counts down', { s, g2 });
    await g(() => window.__gw.debug.snuff());
    await waitFor(() => window.__gw.flow === 'dead', null, 60);
    const died = (await since(m0, 'player:died')).pop();
    check(died?.p.cause === 'snuffed', 'player:died {cause: snuffed}', died?.p);
    await waitFor(() => window.__gw.debug.ui?.()?.openModal === 'death', null, 60);
    await safeShot('smoke-snuffed');
    await noErrors();
  } else {
    await g(() => { const c = window.__gw; c.ui.closeAll?.(); c.game.endRun('debug'); });
  }

  // ------------------------------------------------------------------ run 2: Lantern
  step('run 2: Lantern');
  await waitFor(() => window.__gw.flow !== 'playing', null, 30);
  s = await g(() => {
    const c = window.__gw;
    c.ui.closeAll?.();
    c.game.startNewRun({ character: 'wick', nightMode: 'lantern' });
    c.ui.closeAll?.(); c.debug.timeScale?.(4); c.debug.god?.(false);
    const r = c.state.run;
    return { outing: r.outing, mode: r.nightMode, combat: c.combat.nightMode, runs: c.state.meta.runs, flow: c.flow };
  });
  check(s.outing === 'normal' && s.mode === 'lantern' && s.combat === 'lantern' && s.flow === 'playing', 'run 2 plays Lantern (a normal outing)', s);
  await clearModals();

  if (want('lantern')) {
    step('Lantern night 1 (odd): nothing spawns');
    let m0 = await mark();
    await night(1);
    await atK(0.02);
    await runUntilK(0.56, 400);
    check((await since(m0, 'enemy:spawn')).length === 0 && (await since(m0, 'swarm:window')).length === 0, 'Lantern night 1 spawns nothing');

    step('Lantern night 2: spawns only inside k 0.05–0.50; a hand slam on a hooked fish costs nothing on the line');
    m0 = await mark();
    await night(2);
    await atK(0.02);
    let slamRes = null;
    await runUntilK(0.56, 900, async (st) => {
      if (!slamRes && st.k > 0.14) {
        await clearModals();
        const a = await g(() => {
          const c = window.__gw;
          c.debug.setHp(5);
          c.combat.killAll('scorched');
          c.debug.fishHook('dusk_minnow');
          const p0 = { x: c.player.position.x, z: c.player.position.z }, st0 = c.fishing.state;
          const hand = c.debug.spawn('drowned_hand', 1)?.[0];
          if (hand) { hand.state = 'slam'; hand.stateT = 0.3; hand.n = 0; hand.position.set(c.player.position.x, 0, c.player.position.z); }
          return { p0, st0, hand: !!hand, hp0: c.state.run.hp };
        });
        const n0 = await mark();
        for (let i = 0; i < 12; i++) {
          // after the slam the hand lingers against the raft (combat's pushPlayerOut shove), as in tools/tests/p1-combat.scenario.mjs
          await g((i) => {
            const c = window.__gw, f = c.fishing, T = f.view?.tension ?? 0;
            if (i === 5) for (const e of c.combat.enemies) if (e.enemyId === 'drowned_hand') { e.state = 'linger'; e.stateT = 0; e.position.set(c.player.position.x + 0.2, 0, c.player.position.z); }
            if (f.state === 'reeling') { if (T < 0.45) f.onPointerDown(); else f.onPointerUp(); }
          }, i);
          await frames(1);
        }
        const b = await g(() => { const c = window.__gw; return { x: c.player.position.x, z: c.player.position.z, st: c.fishing.state, hp: c.state.run.hp }; });
        const esc = await since(n0, 'fishing:escaped');
        slamRes = { a, b, moved: Math.hypot(b.x - a.p0.x, b.z - a.p0.z), esc: esc.map((x) => x.p?.reason) };
        await g(() => { const c = window.__gw; c.fishing.onPointerUp(); for (const e of c.combat.enemies) if (e.enemyId === 'drowned_hand') e.hp = 0; c.fishing.cancel('debug'); });
        await clearModals();
      }
    });
    const ks = (await since(m0, 'enemy:spawn')).map((x) => x.k);
    const win = await since(m0, 'swarm:window');
    check(ks.length > 0 && ks.every((k) => k >= 0.04 && k <= 0.51), 'Lantern night 2 spawns, all inside k 0.05–0.50', { n: ks.length, min: ks.length ? Math.min(...ks) : null, max: ks.length ? Math.max(...ks) : null });
    check(win[0]?.p.state === 'open' && Math.abs(win[0].k - 0.05) < 0.03 && win.some((w) => w.p.state === 'close' && Math.abs(w.k - 0.5) < 0.03), 'swarm:window opens at 0.05 and closes at 0.50', win.map((w) => [w.p.state, w.k]));
    check(!!slamRes && slamRes.a.st0 === 'reeling' && slamRes.a.hand, 'a fish on the line and a hand slamming the raft', slamRes);
    if (slamRes) {
      check(slamRes.moved < 0.05, 'the slam and the lingering hand\'s shove moved neither the Wick nor the raft', { moved: slamRes.moved });
      check(!slamRes.esc.includes('snap') && ['reeling', 'landing'].includes(slamRes.b.st), 'the line did not snap; the fish is still on', slamRes);
    }
    s = await g(() => ({ alive: window.__gw.combat.enemies.filter((e) => e.alive && !(e.boss && e.state === 'withdraw')).length, active: window.__gw.combat.swarmActive }));
    check(s.alive === 0 && !s.active, 'past k 0.50 the swarm has withdrawn (the quiet tail)', s);
    await safeShot('smoke-lantern-tail');

    step('Scorched: Embers to 0 in Lantern');
    await night(2); await atK(0.15); await frames(4); await clearModals();
    s = await g(() => {
      const c = window.__gw;
      c.combat.killAll('scorched'); c.fishing.cancel?.('debug');
      c.debug.setOil(100);
      c.debug.spawn('gloomling', 4, 10);
      c.debug.setHp(1);
      const hand = c.debug.spawn('drowned_hand', 1)?.[0];
      if (hand) { hand.state = 'slam'; hand.stateT = 0.3; hand.n = 0; hand.position.set(c.player.position.x, 0, c.player.position.z); }
      return { oil: c.state.run.oil };
    });
    m0 = await mark();
    await waitFor(() => !!window.__gw.state.run?.scorched, null, 40);
    for (let i = 0; i < 5; i++) await frames(1);
    const sc = await g(() => { const c = window.__gw, r = c.state.run; return { scorched: r.scorched, lw: r.lampWatch, oil: r.oil, hp: r.hp, flow: c.flow, alive: c.combat.enemies.filter((e) => e.alive && !(e.boss && e.state === 'withdraw')).length }; });
    check(!!sc.scorched && sc.flow === 'playing', 'Scorched, and the run goes on', sc);
    check(sc.alive === 0 && s.oil - sc.oil >= 30 && !!sc.lw?.forced, 'the swarm withdrew, the lantern lost 30 oil, a forced lamp-watch holds', { before: s.oil, sc });
    check((await since(m0, 'player:scorched')).length === 1 && (await since(m0, 'player:died')).length === 0, 'player:scorched once, no death');
    await safeShot('smoke-scorched');
    await g(() => window.__gw.debug.setPhase('dawn'));
    await frames(4);
    await clearModals();
    s = await g(() => ({ scorched: window.__gw.state.run.scorched, lw: window.__gw.state.run.lampWatch, hp: window.__gw.state.run.hp, flow: window.__gw.flow }));
    check(!s.scorched && !s.lw && s.hp > 0 && s.flow === 'playing', 'dawn mends the Embers and ends the Scorched watch', s);

    step('S6: a lamp-watch at the South-East Buoy-Lamp holds night 4\'s swarm; sailing away opens the window');
    await clearModals();
    const lamp = await g(() => { const l = window.__gw.data.ZONE_BY_ID.mossmere.arena.watchLamps?.[0]; return l ? { id: l.id, x: l.x, z: l.z } : null; });
    check(lamp?.id === 'se_buoy', 'the Mossmere\'s watch-lamp', lamp);
    if (lamp) {
      m0 = await mark();
      await g(() => { const c = window.__gw; c.ui.closeAll?.(); c.debug.setDay(4); c.debug.setOil(100); c.debug.setHp(5); c.debug.setPhase('dusk'); });
      await place(lamp.x, lamp.z + 1.5);
      await frames(2);
      await g(() => window.__gw.debug.setPhase('gloomtide'));
      await clearModals();
      const lw = (await since(m0, 'lampwatch:start')).pop();
      s = await g(() => ({ lw: window.__gw.state.run.lampWatch, tonight: window.__gw.combat.swarmTonight }));
      check(lw?.p.lampId === 'se_buoy' && lw.p.forced === false && s.lw?.lampId === 'se_buoy', 'dusk ending in the buoy-lamp\'s pool starts a lamp-watch', { ev: lw?.p, s });
      await atK(0.04);
      await runUntilK(0.16, 300, async () => { await place(lamp.x, lamp.z + 1.5); });
      check((await since(m0, 'swarm:window')).length === 0 && (await since(m0, 'enemy:spawn')).length === 0, 'the watch holds the swarm off (no window, no spawns) past k 0.05');
      const kLeave = await g(() => window.__gw.survival.getPhaseInfo().k);
      await place(0, 46);   // the spawn bay: ≈ 21 m from the lamp, 15 m out of its pool
      await waitFor(() => !window.__gw.state.run.lampWatch, null, 40);
      await runUntilK(kLeave + 0.06, 200);
      const end = (await since(m0, 'lampwatch:end')).pop(), open = (await since(m0, 'swarm:window')).find((w) => w.p.state === 'open');
      check(end?.p.lampId === 'se_buoy' && end.p.forced === false, 'sailing out of the pool ends the watch (lampwatch:end)', end?.p);
      check(!!open && open.k >= kLeave - 0.01 && open.k <= kLeave + 0.08, 'the swarm window opens at the current k', { kLeave, open: open && [open.p, open.k] });
      await g(() => { const c = window.__gw; c.combat.killAll('scorched'); c.debug.setPhase('dawn'); });
      await clearModals();
    }
  }

  step('errors');
  await noErrors();
  return { failures };
}
