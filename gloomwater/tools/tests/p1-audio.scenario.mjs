// P1 audio acceptance in the browser (DESIGN §25.14.2 Au1, CONTRACT §13.7 audio) on a v3 phase-1 build:
//
//   node build.mjs --dev --out=tools/out/p1-audio-v3.html
//   node tools/playtest.mjs --html=tools/out/p1-audio-v3.html --shots=tools/out/p1a/shots --script=tools/tests/p1-audio.scenario.mjs --width=640 --height=360 --lean
//
// The page reloads with v3 on at phase 1 (globalThis.GW_V3 / GW_V3_PHASE before the bundle runs, plus `?v3=1&v3phase=1`),
// a key press unlocks the WebAudio graph, a run starts, and every check reads ctx.debug.audioLog() (the sounds issued, with
// their scheduled start) and ctx.debug.audio() (the score's mood, the bed loop). "Each sound fires on its event":
//   - a class bite tell on the float: with P1 fishing, a seeded forceBite({z, wait}) plays the real fishing:tell → the tell's
//     sound before the "!"; on a build without it, fishing:tell is emitted while the real fishing waits on a cast;
//   - rise rings: sign:spawn {kind: 'rise'} → rise_plip (Keeper) / rise_gulp (Elder), panned to the ring's side of the camera;
//   - the measuring cord: fishing.view.measure's cord beat → knot ticks and the Prize / Trophy / Elder chimes, then
//     fish:measured → the black wax seal; with P1 progression a real instantCatch → fish:measured → the compressed cord + seal;
//   - Night Rise on the night's phase:change (real survival, debug.setPhase) and the Stillnight score + bed on a Still night,
//     never the gloom mood; a Lantern swarm night keeps the gloom mood while the swarm is out (swarm:window: real P1 combat
//     when present, else emitted) and turns Stillnight, with Night Rise again, when the window closes.
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
    // the audio's own view of the moment, for the log
    g(() => { const c = window.__gw, d = c.debug.audio(); return { t: d.time, mood: d.mood, auto: d.auto, nightMode: d.nightMode, recent: c.debug.audioLog(14).map((e) => `${e.name}@${e.at.toFixed(2)}${e.why ? `:${e.why}` : ''}`) }; })
      .then((d) => log('     audio:', JSON.stringify(d))).catch(() => {});
    return false;
  };
  const waitFor = async (fn, arg, maxFrames = 120) => { for (let i = 0; i < maxFrames; i++) { if (await g(fn, arg)) return true; await frames(1); } return false; };
  const now = () => g(() => window.__gw.debug.audio().time);
  // the audio clock can crawl behind the wall clock on a loaded software-GL machine: a sound's minimum gap (night_rise 3 s,
  // gloom_rise 2 s) is audio time, so let it pass before the next night, as five minutes of a real day would
  const audioPast = (t) => waitFor((t) => window.__gw.debug.audio().time >= t, t, 400);
  // audioLog's `at` is rounded to the ms and the audio clock can stand still between two reads: compare with a 5 ms slack
  const since = (t) => g((t) => window.__gw.debug.audioLog(240).filter((e) => e.at >= t - 0.005), t);
  const heard = async (t, name, maxFrames = 80) => {
    let e = null;
    await waitFor(([t, name]) => window.__gw.debug.audioLog(240).some((x) => x.at >= t - 0.005 && x.name === name), [t, name], maxFrames);
    e = (await since(t)).filter((x) => x.name === name);
    return e;
  };
  // a catch card, a banked level-up (offered on the card or at the dawn bell) or a tip blocks the game: game time stops,
  // so the night clock, combat's window and the bed's breaths would stop with it
  const clearModals = async () => {
    for (let i = 0; i < 10; i++) {
      await frames(2);
      if (!(await g(() => !!window.__gw.ui.isBlocking?.() || window.__gw.paused))) return;
      const m = await g(() => window.__gw.debug.ui?.()?.openModal ?? null);
      if (m === 'levelup') await page.keyboard.press('Digit1');
      else await g(() => { try { window.__gw.ui.closeAll?.(); if (window.__gw.paused) window.__gw.game.resume?.(); } catch { /* optional */ } });
    }
  };
  const setPhase = async (name) => { await g((n) => window.__gw.debug.setPhase(n), name); await clearModals(); };

  step('reload with v3 on at phase 1');
  await page.addInitScript(() => { globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; });
  await page.goto(page.url().split('?')[0] + '?v3=1&v3phase=1', { waitUntil: 'commit', timeout: 240000 });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 240000 });
  await g(() => { try { window.__gw.render.setQuality?.('low'); window.__gw.debug.renderScale?.(0.5); } catch { /* optional */ } });
  let s = await g(() => ({ en: window.__gw.data.V3_ENABLED, ph: window.__gw.data.V3_PHASE, nm: !!window.__gw.data.BALANCE.nightModes, v3: window.__gw.audio.v3Names }));
  check(s.en === true && s.ph === 1 && s.nm, 'v3 phase-1 data in the build', s);
  check(Array.isArray(s.v3) && ['cord_tick', 'class_chime', 'seal_stamp', 'bite_dome', 'rise_plip', 'rise_gulp', 'night_rise', 'stillnight_bed'].every((n) => s.v3.includes(n)), 'audio carries the Au1 sounds', s.v3);

  step('unlock the audio (a key press) and start a Still run');
  await page.keyboard.press('Shift');
  check(await waitFor(() => window.__gw.debug.audio().state === 'running', null, 60), 'the WebAudio graph runs after a gesture');
  const real = await g(() => {
    const c = window.__gw;
    c.game.wipeAll?.();
    c.game.startNewRun({ character: 'wick', nightMode: 'still' });
    const r = c.state.run;
    if (r && !r.nightMode) r.nightMode = 'still';      // progression before Pg12: the mode the New Descent card would set
    if (r && !r.outing) r.outing = 'normal';
    try { c.debug.god?.(true); } catch { /* optional */ }
    return { fishing: typeof c.debug.fishSeed === 'function', progression: typeof c.progression.measure === 'function', combat: typeof c.combat.swarmActive === 'boolean' };
  });
  log('P1 modules present:', JSON.stringify(real));
  await clearModals();
  await frames(6);

  step('a class bite tell on the float, then the "!"');
  if (real.fishing) {
    await g(() => window.__gw.debug.fishSeed(20261105));
    const t = await now();
    s = await g(() => window.__gw.debug.forceBite({ speciesId: 'reedjaw_pike', z: 2.2, wait: 2 }));
    check(s === true, 'a forced Trophy Reedjaw cast lands and waits');
    check(await waitFor(() => window.__gw.fishing.state === 'bite', null, 240), 'it bites');
    const e = await since(t);
    const tell = e.find((x) => x.name === 'bite_flat'), bite = e.find((x) => x.name === 'bite');
    check(!!tell && tell.why === 'flatSlide', 'fishing:tell {flatSlide} → bite_flat', e.map((x) => x.name));
    check(!!bite && tell && tell.t <= bite.t + 1e-3, 'the tell sounds before the bite alert', { tell, bite });
    await g(() => window.__gw.fishing.cancel?.('reset'));
  } else {
    // v1 fishing jumps straight to the bite (a v1 fishing:bite: the full v1 bite sound); the v3 tell is then emitted while the
    // real float is still in its bite, and audio voices it on the game clock (fishing's own clock)
    const t = await now();
    s = await g(() => window.__gw.debug.forceBite());
    check(s === true && (await g(() => window.__gw.fishing.state)) === 'bite', 'a forced bite (v1 fishing)');
    check((await heard(t, 'bite', 40)).length >= 1, 'the v1 bite payload rings the full bite sound');
    const t2 = await now(), g2 = await g(() => window.__gw.time.gameT);
    await g(() => window.__gw.bus.emit('fishing:tell', { speciesId: 'reedjaw_pike', sizeClass: 'prize', biteTell: 'dragUnder', lead: 0.6 }));
    const e = await heard(t2, 'bite_dragunder', 60);
    const g3 = await g(() => window.__gw.time.gameT);
    check(e.length === 1 && e[0].why === 'dragUnder', 'fishing:tell {dragUnder} → bite_dragunder on the float', e);
    check(g3 - g2 >= 0.19, `the drag-under waits for its float animation on the game clock (${(g3 - g2).toFixed(2)} s ≥ 0.2 s)`);
    await g(() => window.__gw.fishing.cancel?.('reset'));
  }
  await clearModals();
  await frames(4);

  step('rise rings: plip and gulp, placed on the ring');
  {
    const t = await now();
    await g(() => {
      const c = window.__gw, p = c.player.position, yaw = c.render.getYaw?.() || 0;
      const at = (side) => ({ x: p.x + Math.cos(yaw) * 10 * side, z: p.z - Math.sin(yaw) * 10 * side });
      const L = at(-1), R = at(1);
      c.bus.emit('sign:spawn', { id: 'a1', kind: 'rise', x: L.x, z: L.z, sizeClass: 'keeper' });
      c.bus.emit('sign:spawn', { id: 'a2', kind: 'rise', x: R.x, z: R.z, sizeClass: 'elder' });
    });
    const e = await since(t);
    const plip = e.find((x) => x.name === 'rise_plip'), gulp = e.find((x) => x.name === 'rise_gulp');
    check(!!plip && plip.pan < 0, 'a Keeper rise on the left plips, panned left', plip);
    check(!!gulp && gulp.pan > 0, 'an Elder rise on the right gulps, panned right', gulp);
  }

  step('the measuring cord on the ceremony beat, then the seal');
  {
    const L = await g(() => Math.round(window.__gw.data.sizeLength(window.__gw.data.SPECIES_BY_ID.reedjaw_pike, 3.3) * 10) / 10);
    await g(() => { const v = window.__gw.fishing.view; v.speciesId = 'reedjaw_pike'; v.measure = { phase: 'pose', length: 0, sizeClass: null, seal: null }; });
    await frames(3);
    const t = await now();
    await g((L) => { window.__gw.fishing.view.measure = { phase: 'cord', length: L, sizeClass: 'elder', seal: null }; }, L);
    check(await waitFor(() => !!window.__gw.debug.audio().cord, null, 40), 'the cord beat starts the knots');
    const cord = (await g(() => window.__gw.debug.audio().cord)) || { end: 0 };
    const dur = await g(() => { const d = window.__gw.data; return d.BALANCE.ceremony ? 5.0 * 1.4 / 3.6 : 0; });
    await waitFor((end) => window.__gw.debug.audio().time >= end, cord.end, 200);
    await g((L) => {
      const c = window.__gw;
      c.fishing.view.measure = { phase: 'banners', length: L, sizeClass: 'elder', seal: 'blackWaxRibbon' };
      c.bus.emit('fish:measured', { speciesId: 'reedjaw_pike', z: 3.3, sizeClass: 'elder', ancient: true, length: L, weight: 12, favours: [], records: [{ kind: 'elderLog' }], fish: { uid: 'scenario-elder' }, cove: false });
    }, L);
    const e = await since(t);
    const ticks = e.filter((x) => x.name === 'cord_tick'), chimes = e.filter((x) => x.name === 'class_chime'), seal = e.find((x) => x.name === 'seal_stamp');
    check(ticks.length >= 6 && ticks.every((x, i) => i === 0 || x.t > ticks[i - 1].t), `the knots tick up (${ticks.length})`);
    check(Math.abs((ticks.at(-1)?.t ?? 0) - ticks[0]?.at - dur) < 0.05, 'the last knot lands at the end of the Elder\'s cord beat', { last: ticks.at(-1), first: ticks[0], dur });
    check(JSON.stringify(chimes.map((x) => x.why)) === '["prize","trophy","elder"]', 'the count passes Prize, Trophy and Elder: three chimes', chimes);
    check(!!seal && seal.why === 'blackWaxRibbon' && seal.t >= ticks.at(-1).t - 0.05, 'fish:measured stamps the black wax seal at the end of the cord', seal);
    await g(() => { window.__gw.fishing.view.measure = null; });
    await frames(3);
  }
  if (real.progression && real.fishing) {
    const t = await now();
    await g(() => window.__gw.debug.instantCatch('reedjaw_pike', { z: 2.3 }));
    const e = await heard(t, 'seal_stamp', 60);
    const all = await since(t);
    const ticks = all.filter((x) => x.name === 'cord_tick'), chimes = all.filter((x) => x.name === 'class_chime');
    check(e.length === 1 && e[0].why === 'oxbloodWax', 'a real Trophy catch (P1 progression measures at once) → the oxblood wax seal', e);
    check(ticks.length >= 4 && JSON.stringify(chimes.map((x) => x.why)) === '["prize","trophy"]', 'its cord runs compressed before the stamp: knots, Prize and Trophy chimes', { n: ticks.length, chimes });
    const fan = all.find((x) => x.name === 'catch_fanfare');
    check(!!fan && fan.t >= e[0].t + 0.25, 'the card fanfare follows the seal', fan);
    await clearModals();
  }

  step('a Still night: Night Rise, the Stillnight score and its bed, never the gloom mood');
  {
    await clearModals();
    const t = await now();
    await g(() => { window.__gw.state.run.nightMode = 'still'; });
    await setPhase('dusk');
    await setPhase('gloomtide');
    const rise = await heard(t, 'night_rise', 40);
    const early = await since(t);
    check(rise.length === 1 && !early.some((x) => x.name === 'gloom_rise'), 'the Still night opens with Night Rise, no gloom rise', early.map((x) => x.name));
    check(await waitFor(() => window.__gw.debug.audio().mood === 'stillnight', null, 60), 'the score turns to the Stillnight');
    const moods = new Set();
    for (let i = 0; i < 12; i++) { moods.add(await g(() => window.__gw.debug.audio().mood)); await frames(2); }
    check(!moods.has('gloom'), 'never the gloom mood on a Still night', [...moods]);
    check(await waitFor(() => window.__gw.debug.audio().loops.bed === true, null, 60), 'the Stillnight bed loop runs');
    const bed = await heard(t, 'stillnight_bed', 120);
    check(bed.length >= 1, 'the bed breathes (stillnight_bed)', bed.length);
    await shot('p1a-stillnight');
  }

  step('a Lantern swarm night: gloom while the swarm is out, Stillnight and Night Rise for the quiet tail');
  {
    // a second expedition's Lantern (the First Outing, meta.runs 0, is all still)
    const lastRise = (await g(() => window.__gw.debug.audioLog(240).filter((e) => e.name === 'night_rise' || e.name === 'gloom_rise').at(-1)?.at)) ?? 0;
    await audioPast(lastRise + 3.2);
    // (P1 combat locks the mode at run start: its test hook debug.mode(name) switches it, CONTRACT §13.11)
    await g(() => { const c = window.__gw; c.state.run.nightMode = 'lantern'; c.state.run.outing = 'normal'; try { c.debug.mode?.('lantern'); } catch { /* optional */ } c.debug.setDay?.(2); });
    await setPhase('dawn');
    const t = await now();
    await setPhase('dusk');
    await setPhase('gloomtide');
    check((await heard(t, 'night_rise', 40)).length === 1, 'Night Rise opens the swarm night too');
    check(await waitFor(() => window.__gw.debug.audio().mood === 'gloom', null, 60), 'the gloom mood while the swarm is due');
    const t2 = await now();
    if (real.combat) await g(() => { const r = window.__gw.state.run; r.phaseTime = Math.max(r.phaseTime || 0, 0.08 * (window.__gw.survival.getPhaseInfo().duration || 90)); });
    else await g(() => window.__gw.bus.emit('swarm:window', { state: 'open', night: 2, mode: 'lantern' }));
    check((await heard(t2, 'gloom_rise', 120)).length === 1, `the swarm window opens with the gloom rise (${real.combat ? 'P1 combat' : 'emitted'})`);
    check(await g(() => window.__gw.debug.audio().mood === 'gloom' && !window.__gw.debug.audio().loops.bed), 'inside the window: gloom, no bed');
    // the window is 40.5 s of night in play; here it is cut short, so let night_rise's 3 s minimum gap pass on the audio clock
    const lastNR = (await g(() => window.__gw.debug.audioLog(240).filter((e) => e.name === 'night_rise').at(-1)?.at)) ?? 0;
    await audioPast(lastNR + 3.2);
    const t3 = await now();
    if (real.combat) await g(() => { const r = window.__gw.state.run; r.phaseTime = 0.55 * (window.__gw.survival.getPhaseInfo().duration || 90); });
    else await g(() => window.__gw.bus.emit('swarm:window', { state: 'close', night: 2, mode: 'lantern', reason: 'window' }));
    const tail = await heard(t3, 'night_rise', 160);
    check(tail.length === 1 && tail[0].why === 'tail', 'the window closes: Night Rise for the quiet tail', tail);
    check(await waitFor(() => window.__gw.debug.audio().mood === 'stillnight', null, 120), 'the quiet tail is a Stillnight');
  }

  step('errors');
  const errs = await g(() => window.__gw.errors.slice());
  check(errs.length === 0, 'ctx.errors stays empty', errs);
  log(`done in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  return { failures };
}
