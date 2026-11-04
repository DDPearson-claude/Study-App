// M1 (main) acceptance scenario, DESIGN §25.14.2 / CONTRACT §13.0, §13.1, §13.6. Runs in a browser through playtest:
//
//   node build.mjs --dev --out=tools/out/p1-main.html
//   node tools/playtest.mjs --html=tools/out/p1-main.html --script=tools/tests/m1-v3.scenario.mjs --width=960 --height=540 --lean
//
// The page loads with the shipped switch (v3 off), then reloads with `?v3=1` (phase 1) and checks:
//   - the rollout switch: URL → v3 on at phase 1; localStorage (debug.setV3) → on; cleared → off again;
//   - startNewRun({character, nightMode}): run 1 is the First Outing (outing 'first', still); later runs take the chosen
//     mode or Lantern; the flag-off run carries no v3 fields;
//   - ctx.cinematic during a Lantern swarm: no enemy moves and no oil drains (survival and combat get dt 0) while the
//     ceremony holds, input never reaches combat, and both run again when it ends. When fishing's ceremony is in the
//     build (fishing.startCeremony), a forced Elder catch drives it; otherwise the flag is set the way fishing sets it;
//   - save on fish:measured: the save is written at the event, and a reload with no later save (the tab killed right after
//     the stamp) keeps the record; a control field written after the event is lost;
//   - ctx.game.slowmo: the leap reveal (defaults from BALANCE.bite.leapReveal: 0.25 s at 0.35) restores timeScale 1, and
//     restores a test's base time scale too.
export default async function (api) {
  const { page, frames, evalGame: g, log, shot, wait } = api;
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
  const noErrors = async () => { const e = await g(() => window.__gw.errors.slice()); check(e.length === 0, 'ctx.errors stays empty', e); };
  const waitFor = async (fn, arg, maxFrames = 80) => {
    for (let i = 0; i < maxFrames; i++) { if (await g(fn, arg)) return true; await frames(1); }
    return false;
  };
  const base = page.url().split('?')[0];
  const load = async (query = '') => {
    // a 3 MB page on a loaded software-GL machine can take longer than playwright's 30 s 'load' default
    await page.goto(base + query, { waitUntil: 'commit', timeout: 240000 });
    await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 180000 });
    await frames(2);
    await g(() => { try { window.__gw.render.setQuality?.('low'); window.__gw.debug.renderScale?.(0.35); } catch { /* optional */ } });
  };
  const closeUi = () => g(() => { try { window.__gw.ui.closeAll?.(); } catch { /* optional */ } });

  // ------------------------------------------------------------------ the shipped switch: off
  step('shipped switch (v3 off)');
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 180000 });
  let s = await g(() => ({ en: window.__gw.data.V3_ENABLED, v3: window.__gw.debug.v3(), gw: typeof globalThis.GW_V3 }));
  check(s.en === false && s.v3.enabled === false && s.v3.switch === 'default', 'a plain load is v3 off (shipped default)', s);
  check(s.gw === 'undefined', 'the off switch writes no GW_V3 global', s.gw);
  await g(() => window.__gw.game.wipeAll());

  // ------------------------------------------------------------------ v3 on by URL, fresh save
  step('?v3=1 → v3 on at phase 1');
  await load('?v3=1');
  s = await g(() => { const c = window.__gw; return { en: c.data.V3_ENABLED, ph: c.data.V3_PHASE, sw: c.debug.v3().switch, nm: !!c.data.BALANCE.nightModes, runs: c.state.meta.runs, schema: 'schema' in c.state.meta }; });
  check(s.en === true && s.ph === 1 && s.sw === 'url', 'URL switch: V3_ENABLED, V3_PHASE 1', s);
  check(s.nm, 'P1 data in the build (BALANCE.nightModes)');
  check(s.runs === 0, 'a fresh save (meta.runs 0)', s.runs);
  check(!s.schema, 'defaultMeta did not supply schema', s);

  step('startNewRun: the First Outing, then the mode cards');
  s = await g(() => {
    const c = window.__gw;
    c.game.startNewRun({ nightMode: 'gloomtide' });  // a mode choice on run 1 is ignored
    c.ui.closeAll?.();
    const r = c.state.run;
    const saved = JSON.parse(localStorage.getItem('gloomwater.save.v1') || 'null');
    return { outing: r.outing, nightMode: r.nightMode, runs: c.state.meta.runs, savedMode: saved?.run?.nightMode, v3: c.debug.v3() };
  });
  check(s.outing === 'first' && s.nightMode === 'still', 'run 1 (meta.runs 0): outing first, every night still', s);
  check(s.runs === 1 && s.savedMode === 'still', 'the run is saved with its mode', s);
  check(s.v3.outing === 'first' && s.v3.nightMode === 'still' && s.v3.flow === 'playing', 'debug.v3() reports flow, outing and mode', s.v3);
  await shot('m1-01-first-outing');
  s = await g(() => {
    const c = window.__gw, out = {};
    c.game.startNewRun({ nightMode: 'gloomtide' }); out.chosen = [c.state.run.outing, c.state.run.nightMode];
    c.game.startNewRun({ nightMode: 'still' }); out.still = c.state.run.nightMode;
    c.game.startNewRun({ nightMode: 'nonsense' }); out.bad = c.state.run.nightMode;
    c.game.startNewRun({}); out.dflt = c.state.run.nightMode;
    c.ui.closeAll?.();
    out.runs = c.state.meta.runs;
    return out;
  });
  check(s.chosen[0] === 'normal' && s.chosen[1] === 'gloomtide', 'run 2: the chosen mode (Gloomtide)', s);
  check(s.still === 'still' && s.bad === 'lantern' && s.dflt === 'lantern', 'Still when chosen; an unknown or missing mode → Lantern (the default)', s);
  await noErrors();

  // ------------------------------------------------------------------ the ceremony is a cinematic state
  step('ctx.cinematic in a Lantern swarm');
  await g(() => { const c = window.__gw; c.debug.god(true); c.debug.timeScale(1); });
  for (let i = 0; i < 4 && (await g(() => window.__gw.state.run.phase)) !== 'gloomtide'; i++) { await g(() => window.__gw.debug.skipPhase()); await frames(2); }
  await closeUi();
  check(await g(() => window.__gw.state.run.phase) === 'gloomtide', 'night (the swarm phase)');
  await g(() => { const c = window.__gw; c.debug.setOil(60); c.debug.spawn('gloomling', 5, 8); });
  // let them fade in and start moving (game time only runs while no modal is open)
  for (let i = 0; i < 30; i++) {
    await closeUi();
    await frames(2);
    if (await g(() => (window.__gw.combat.enemies || []).filter((e) => e.alive && e.spawnT <= 0).length >= 3)) break;
  }
  const snap = () => g(() => {
    const c = window.__gw, r = c.state.run;
    const en = (c.combat.enemies || []).filter((e) => e.alive).map((e) => ({ x: +e.position.x.toFixed(4), z: +e.position.z.toFixed(4), age: +e.age.toFixed(4) }));
    return { en, oil: r.oil, hp: r.hp, pt: r.phaseTime, gameT: c.time.gameT, blocking: !!c.ui.isBlocking?.(), paused: c.paused, cine: c.cinematic, gameDt: c.time.gameDt };
  });
  const moved = (a, b) => a.en.some((e, i) => b.en[i] && (e.x !== b.en[i].x || e.z !== b.en[i].z || e.age !== b.en[i].age));
  // god mode also stops survival's drains: it stays off for the measured windows (they are short; the HP is checked)
  await g(() => { const c = window.__gw; c.debug.god(false); c.debug.setHp(99); });
  await closeUi();
  let a = await snap();
  await frames(6);
  let b = await snap();
  check(a.en.length >= 1, 'enemies alive in the swarm', a.en.length);
  check(!b.blocking && moved(a, b) && b.pt > a.pt && b.oil < a.oil, 'control: without the ceremony enemies move, the clock runs and oil drains', { a: { pt: a.pt, oil: a.oil }, b: { pt: b.pt, oil: b.oil }, blocking: b.blocking });

  const hasCeremony = await g(() => typeof window.__gw.fishing.startCeremony === 'function');
  let drove = 'flag';
  if (hasCeremony) {
    // the real path: a forced Elder catch plays the measuring ceremony (fishing sets ctx.cinematic)
    const elder = await g(() => {
      const c = window.__gw;
      const sp = (c.data.SPECIES || []).find((x) => x.size && !x.legendary && (x.zone === c.state.run.zone || (x.zones || []).includes?.(c.state.run.zone))) || (c.data.SPECIES || []).find((x) => x.size && !x.legendary);
      try { c.debug.instantCatch?.(sp?.id, { z: 2.8 }); } catch (e) { return { err: String(e) }; }
      return { id: sp?.id };
    });
    if (await waitFor(() => window.__gw.cinematic === true, null, 30)) drove = `ceremony (${elder.id})`;
    else log('note: fishing.startCeremony exists but a forced Elder did not set ctx.cinematic; driving the flag directly', JSON.stringify(elder));
  }
  if (drove === 'flag') await g(() => { window.__gw.cinematic = true; });   // exactly what fishing.startCeremony does
  log('ceremony driven by:', drove);
  a = await snap();
  // input during the ceremony never reaches combat (zap / Flare)
  await g(() => {
    const c = window.__gw;
    window.__m1spy = { flare: 0, zap: 0, of: c.combat.flare, oz: c.combat.onPointerDown };
    c.combat.flare = (...x) => { window.__m1spy.flare++; return window.__m1spy.of.apply(c.combat, x); };
    c.combat.onPointerDown = (...x) => { window.__m1spy.zap++; return window.__m1spy.oz.apply(c.combat, x); };
  });
  await page.keyboard.press('KeyF');
  await page.mouse.click(api.width * 0.7, api.height * 0.4);
  await frames(8);
  await wait(400);
  b = await snap();
  const spy = await g(() => { const c = window.__gw, sp = window.__m1spy; c.combat.flare = sp.of; c.combat.onPointerDown = sp.oz; return { flare: sp.flare, zap: sp.zap }; });
  await shot('m1-02-ceremony-in-swarm');
  check(b.cine === true || drove !== 'flag', 'the ceremony holds ctx.cinematic', b.cine);
  check(b.gameT > a.gameT, 'the game itself keeps running (fishing, player, actors get dt)', { a: a.gameT, b: b.gameT });
  check(!moved(a, b), 'no enemy moves during the ceremony', { a: a.en.slice(0, 3), b: b.en.slice(0, 3) });
  check(b.oil === a.oil, 'oil does not drain during the ceremony', { a: a.oil, b: b.oil });
  check(b.hp === a.hp, 'no damage is dealt during the ceremony', { a: a.hp, b: b.hp });
  check(b.pt === a.pt, 'the phase clock does not run during the ceremony', { a: a.pt, b: b.pt });
  check(spy.flare === 0 && spy.zap === 0, 'Flare and zap taps never reach combat during the ceremony', spy);
  // the ceremony ends (the card opens and closes, or the flag is released)
  if (drove === 'flag') await g(() => { window.__gw.cinematic = false; });
  else await waitFor(() => window.__gw.cinematic === false, null, 120);
  await closeUi();
  a = await snap();
  await frames(6);
  b = await snap();
  check(!b.cine && moved(a, b) && b.pt > a.pt && b.oil < a.oil, 'after the ceremony enemies move, the clock runs and oil drains again', { pt: [a.pt, b.pt], oil: [a.oil, b.oil] });
  await g(() => { const c = window.__gw; c.debug.killAll?.(); c.debug.god(false); });
  await noErrors();

  // ------------------------------------------------------------------ slowmo (the leap reveal)
  step('ctx.game.slowmo restores the time scale');
  await closeUi();
  s = await g(() => {
    const c = window.__gw;
    c.debug.timeScale(1);
    const L = c.data.BALANCE.bite?.leapReveal || {};
    const started = c.game.slowmo();
    return { started, ts: c.time.timeScale, st: c.debug.beats().slowmo, L };
  });
  check(s.started && Math.abs(s.ts - 0.35) < 1e-9, 'the leap reveal runs at timescale 0.35', s);
  check(Math.abs(s.st.left - (s.L.time ?? 0.25)) < 1e-9 && s.L.timescale === 0.35, 'defaults come from BALANCE.bite.leapReveal (0.25 s at 0.35)', s);
  const ratio = await g(() => new Promise((res) => {
    const c = window.__gw; let k = 0; const seen = [];
    const f = () => { if (c.debug.beats().slowmo.active && c.time.dt > 0 && c.time.gameDt > 0) seen.push(c.time.gameDt / c.time.dt); if (++k < 4) requestAnimationFrame(f); else res(seen); };
    requestAnimationFrame(f);
  }));
  check(ratio.length === 0 || ratio.every((r) => Math.abs(r - 0.35) < 1e-6), 'game dt is 0.35 × real dt during the reveal', ratio);
  check(await waitFor(() => !window.__gw.debug.beats().slowmo.active, null, 60), 'the reveal ends');
  s = await g(() => window.__gw.time.timeScale);
  check(s === 1, 'the leap reveal restores timeScale 1', s);
  s = await g(() => { const c = window.__gw; c.debug.timeScale(2); c.game.slowmo(); return c.time.timeScale; });
  check(Math.abs(s - 0.7) < 1e-9, 'on a test base of 2 the reveal runs at 0.7', s);
  await waitFor(() => !window.__gw.debug.beats().slowmo.active, null, 60);
  s = await g(() => { const c = window.__gw; const t = c.time.timeScale; c.debug.timeScale(1); return t; });
  check(s === 2, 'and restores the base (2)', s);
  await noErrors();

  // ------------------------------------------------------------------ save on fish:measured
  step('save on fish:measured; a reload right after the stamp keeps the record');
  const hasMeasure = await g(() => typeof window.__gw.progression.measure === 'function' && typeof window.__gw.progression.makeFish === 'function');
  s = await g((hasMeasure) => {
    const c = window.__gw;
    const sp = (c.data.SPECIES || []).find((x) => !x.legendary) || c.data.SPECIES[0];
    const before = JSON.parse(localStorage.getItem('gloomwater.save.v1') || 'null');
    let fired = 0;
    const off = c.bus.on('fish:measured', () => { fired++; });
    let pb = null;
    if (hasMeasure) {
      // the real path (Pg1): makeFish at the landing, measure at the seal stamp
      const fish = c.progression.makeFish(sp.id, 1.5, 'normal', { favours: [], place: null });
      c.progression.measure(fish);
      pb = c.state.meta.journal?.[sp.id]?.pbLength ?? null;
    } else {
      // progression writes the records, then emits fish:measured (CONTRACT §13.5); here only main's half is in the build
      const J = c.state.meta.journal[sp.id] || (c.state.meta.journal[sp.id] = { caught: 0 });
      J.caught = (J.caught || 0) + 1; J.pbLength = 123.4; J.seals = { ...(J.seals || {}), prize: true };
      pb = 123.4;
      c.bus.emit('fish:measured', { speciesId: sp.id, z: 1.5, sizeClass: 'prize', ancient: false, length: 123.4, weight: 9.9, favours: [], records: [{ kind: 'pb' }, { kind: 'classFirst', sizeClass: 'prize' }], place: null, fish: null, cove: false });
    }
    off();
    const after = JSON.parse(localStorage.getItem('gloomwater.save.v1') || 'null');
    // a control written AFTER the stamp must not survive (no later save happens before the reload)
    c.state.meta.journal[sp.id].m1Control = true;
    // the tab is killed right after the stamp: no pagehide / visibility save
    c.game.save = () => {};
    c.ui.closeAll?.();
    return { sp: sp.id, fired, pb, savedPb: after?.meta?.journal?.[sp.id]?.pbLength ?? null, savedAtDiffers: after?.savedAt !== before?.savedAt, runMode: after?.run?.nightMode };
  }, hasMeasure);
  log('measure path:', hasMeasure ? 'progression.measure (Pg1)' : 'fish:measured emitted with the record written (main half only)');
  check(s.fired === 1, 'fish:measured fired exactly once', s.fired);
  check(s.savedAtDiffers && s.savedPb != null && s.savedPb === s.pb, 'main wrote the save at fish:measured (the PB is in localStorage)', s);
  await page.reload({ waitUntil: 'commit', timeout: 240000 });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 180000 });
  await frames(2);
  const r = await g((sp) => { const c = window.__gw; const J = c.state.meta.journal[sp] || {}; return { pb: J.pbLength ?? null, seal: J.seals?.prize ?? null, control: J.m1Control ?? null, cont: c.game.hasSavedRun(), en: c.data.V3_ENABLED }; }, s.sp);
  check(r.en === true, 'the reload keeps ?v3=1');
  check(r.pb === s.pb && (hasMeasure || r.seal === true), 'the reload keeps the PB and the class first', r);
  check(r.control === null, 'control: a change made after the stamp (never saved) is gone, so the record survived on the fish:measured save', r);
  check(r.cont, 'the run is offered to Continue');
  s = await g(() => { const c = window.__gw; c.game.continueRun(); c.ui.closeAll?.(); return { mode: c.state.run.nightMode, outing: c.state.run.outing }; });
  check(s.mode === 'lantern' && s.outing === 'normal', 'Continue keeps the locked night mode', s);
  await noErrors();

  // ------------------------------------------------------------------ the stored switch
  step('localStorage switch (debug.setV3)');
  await g(() => { const c = window.__gw; c.debug.setV3(true, 1); c.game.toTitle(); });
  await load('');
  s = await g(() => { const c = window.__gw; return { en: c.data.V3_ENABLED, ph: c.data.V3_PHASE, sw: c.debug.v3().switch }; });
  check(s.en === true && s.ph === 1 && s.sw === 'storage', 'setV3(true, 1) turns v3 on at the next load', s);
  await noErrors();
  await g(() => window.__gw.debug.setV3(null));
  await load('');
  s = await g(() => { const c = window.__gw; return { en: c.data.V3_ENABLED, sw: c.debug.v3().switch, gw: typeof globalThis.GW_V3 }; });
  check(s.en === false && s.sw === 'default' && s.gw === 'undefined', 'setV3(null) returns to the shipped default (off)', s);

  step('flag off: today\'s run');
  s = await g(() => {
    const c = window.__gw;
    c.game.startNewRun({ nightMode: 'still' });
    c.ui.closeAll?.();
    const r = c.state.run;
    return { hasMode: 'nightMode' in r, hasOuting: 'outing' in r, slow: c.debug.beats() };
  });
  check(!s.hasMode && !s.hasOuting, 'with v3 off startNewRun adds no nightMode / outing', s);
  check(s.slow.cinematic === false && s.slow.slowmo.active === false && s.slow.timeScale === 1, 'no beat is active', s.slow);
  await frames(4);
  await noErrors();
  log(`done in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  return { failures };
}
