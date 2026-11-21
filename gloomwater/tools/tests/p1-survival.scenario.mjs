// Browser scenario for the v3 Phase 1 survival items (DESIGN §25.14.2 S1, S2, S3) on a v3 build at phase 1.
// Not a node test (check.mjs runs *.test.mjs only). Build a flag-on page, then drive it with playtest:
//   node build.mjs --dev --out=tools/out/p1-survival.html
//   sed 's#<script type="module">#<script>globalThis.GW_V3=true;globalThis.GW_V3_PHASE=1;</script><script type="module">#' \
//     tools/out/p1-survival.html > tools/out/p1-survival-v3.html      (or main's rollout switch, ?v3&v3phase=1, once it lands)
//   node tools/playtest.mjs --html=tools/out/p1-survival-v3.html --shots=tools/out/p1-survival-v3 \
//     --script=tools/tests/p1-survival.scenario.mjs --width=960 --height=540
// The run's outing / night mode are set the way Pg12 (progression.createRun) sets them when this branch runs without it.
// Flow: S1 day-1 phases (210 / 20 / 90 / 10), later calms, a gate passage → Sporewood's hushed calm, the HUD clock's
// reading → S2 the live oil rates per phase, a whole Mossmere day stepped through the real modules (28.3 / 30.1), Last
// Flicker → guttering (light 2.5) → relight → guttering → Snuffed (the death flow) → Lantern: Embers at 0 → Scorched, the
// run continues, dawn mends; Still: no snuff; Gloomtide: the Embers death → S3 satiety 0 for a whole day, Well-fed at 60%.
export default async function (api) {
  const { page, wait, frames, evalGame: g, log, shot } = api;
  const failures = [];
  let stepName = 'boot';
  const step = (s) => { stepName = s; log(`---- ${s}`); };
  const check = (cond, msg, extra) => {
    if (cond) { log('ok  ', msg, extra !== undefined ? JSON.stringify(extra) : ''); return true; }
    failures.push(`[${stepName}] ${msg}${extra !== undefined ? ` :: ${JSON.stringify(extra)}` : ''}`);
    log('FAIL', msg, extra !== undefined ? JSON.stringify(extra) : '');
    return false;
  };
  const near = (a, b, eps) => Math.abs(a - b) <= eps;
  const errs = async () => { const e = await g(() => window.__gw.errors.slice()); check(e.length === 0, 'ctx.errors stays empty', e); };
  const watch = () => g(() => {
    const c = window.__gw;
    window.__s = { ev: [] };
    if (c.__sWatch) return;
    c.__sWatch = true;
    for (const e of ['player:died', 'player:scorched', 'lampwatch:start', 'lampwatch:end', 'lantern:out', 'lantern:lit', 'lantern:flicker', 'player:damage', 'phase:change', 'resource:low']) {
      c.bus.on(e, (p) => window.__s.ev.push([e, p]));
    }
  });
  const count = (e) => g((e) => window.__s.ev.filter((x) => x[0] === e).length, e);
  const lastEv = (e) => g((e) => { const x = [...window.__s.ev].reverse().find((y) => y[0] === e); return x ? JSON.parse(JSON.stringify(x[1])) : null; }, e);
  /** A fresh run in `mode` (outing 'first' for still on the first run, like Pg12). */
  const newRun = (mode, outing) => g(([mode, outing]) => {
    const c = window.__gw;
    c.game.startNewRun({ nightMode: mode });
    const r = c.state.run;
    if (typeof r.nightMode !== 'string') r.nightMode = mode;      // Pg12 / M1 set these; this branch may run without them
    if (typeof r.outing !== 'string') r.outing = outing;
    c.ui.closeAll?.();
    return { zone: r.zone, day: r.day, phase: r.phase, nightMode: r.nightMode, outing: r.outing, hushDay: r.surv?.hushDay };
  }, [mode, outing]);
  /** Step the real survival module synchronously (main paused, so nothing else ticks) for `sec` of game time. */
  const stepSurvival = (sec, dt = 0.05) => g(([sec, dt]) => {
    const c = window.__gw;
    const was = c.paused; c.paused = true;
    for (let i = 0, n = Math.round(sec / dt); i < n; i++) c.survival.update(dt, 0);
    c.paused = was;
    const r = c.state.run;
    return { day: r.day, phase: r.phase, oil: r.oil, hp: r.hp, satiety: r.satiety, flow: c.flow };
  }, [sec, dt]);

  // ------------------------------------------------------------------------------------------------ boot
  step('boot: the v3 build at phase 1');
  for (let i = 0; i < 180 && !(await g(() => !!window.__gw?.survival && window.__gw.flow !== 'boot').catch(() => false)); i++) await wait(1000);
  await g(() => window.__gw?.debug?.renderScale?.(0.45)).catch(() => {});
  const boot = await g(() => ({ v3: window.__gw.data.V3_ENABLED, phase: window.__gw.data.V3_PHASE, oil: !!window.__gw.data.BALANCE.oil?.context }));
  check(boot.v3 === true && boot.phase === 1 && boot.oil, 'v3 build, phase 1, BALANCE.oil merged', boot);
  await watch();

  // ------------------------------------------------------------------------------------------------ S1
  step('S1: the day clock (First Outing, the Mossmere)');
  const r1 = await newRun('still', 'first');
  check(r1.zone === 'mossmere' && r1.phase === 'calm' && r1.day === 1 && r1.hushDay === 1, 'a fresh run: Mossmere calm, day 1, hush armed', r1);
  await frames(3);
  const d1 = await g(() => {
    const c = window.__gw, out = {};
    const pi = c.survival.getPhaseInfo();
    out.calm = pi.duration; out.hush = pi.hush; out.nightMode = pi.nightMode;
    for (const p of ['dusk', 'gloomtide', 'dawn']) { c.debug.skipPhase(); out[p] = c.survival.getPhaseInfo().duration; }
    c.debug.skipPhase(); out.day2calm = c.survival.getPhaseInfo().duration; out.day = c.state.run.day;
    out.plan1 = c.survival.getPhaseDurations(1); out.plan2 = c.survival.getPhaseDurations(2);
    return out;
  });
  check(d1.calm === 210 && d1.dusk === 20 && d1.gloomtide === 90 && d1.dawn === 10, 'getPhaseInfo().duration reads 210 / 20 / 90 / 10 on Mossmere day 1', d1);
  check(d1.hush === 30 && d1.nightMode === 'still', 'day 1 calm carries the 30 s Arrival Hush; the First Outing is still', { hush: d1.hush, mode: d1.nightMode });
  check(d1.day === 2 && d1.day2calm === 180, 'day 2 calm is 180', d1);
  check(d1.plan1.total === 330 && d1.plan2.total === 300, 'getPhaseDurations: day 1 is 5.5 min, a later day 5 min', { d1: d1.plan1, d2: d1.plan2 });

  step('S1: a gate passage in calm hushes the new lake\'s calm (Sporewood, mixed: 180 + 30)');
  const tr = await g(() => { const c = window.__gw; c.debug.openGate(); c.debug.addShells(2000); const t = c.progression.travel('sporewood'); return { ok: t.ok, msg: t.msg, zone: c.state.run.zone, phase: c.state.run.phase, day: c.state.run.day }; });
  check(tr.ok && tr.zone === 'sporewood', 'travelled to Sporewood through the gate', tr);
  await frames(5);
  const sw = await g(() => { const pi = window.__gw.survival.getPhaseInfo(); return { duration: pi.duration, hush: pi.hush, day: pi.day }; });
  check(sw.duration === 210 && sw.hush === 30, 'Sporewood\'s first calm is 180 + 30', sw);
  // Glasswater, a foot lake: the passage at dawn hushes the next calm; the calm after that reads 185
  const gw = await g(() => {
    const c = window.__gw;
    c.debug.setPhase('dawn');
    c.debug.openGate();
    const t = c.progression.travel('glasswater');
    const dawnDur = c.survival.getPhaseInfo().duration;
    c.debug.skipPhase();
    const first = c.survival.getPhaseInfo();
    for (let i = 0; i < 4; i++) c.debug.skipPhase();
    const later = c.survival.getPhaseInfo();
    return { ok: t.ok, msg: t.msg, zone: c.state.run.zone, dawnDur, first: [first.phase, first.day, first.duration, first.hush], later: [later.phase, later.day, later.duration, later.hush] };
  });
  check(gw.ok && gw.zone === 'glasswater' && gw.dawnDur === 10, 'a dawn passage to Glasswater', gw);
  check(gw.first[0] === 'calm' && gw.first[2] === 215, 'Glasswater: the first calm after the passage is 185 + 30', gw.first);
  check(gw.later[0] === 'calm' && gw.later[2] === 185 && gw.later[3] === 0, "185 in a foot lake's later calm", gw.later);
  await frames(5);
  const hud = await g(() => {
    const pi = window.__gw.survival.getPhaseInfo();
    const txt = [...document.querySelectorAll('#ui *')].map((e) => e.childElementCount === 0 ? e.textContent.trim() : '').find((t) => /^Gloomtide in \d+:\d\d$/.test(t)) || null;
    return { remaining: pi.duration - pi.time, durations: window.__gw.survival.getPhaseDurations(pi.day), hudText: txt };
  });
  const want = hud.remaining + hud.durations.dusk;
  const shown = hud.hudText ? hud.hudText.match(/(\d+):(\d\d)/).slice(1).reduce((m, s) => m * 60 + +s, 0) : null;
  // the HUD's calm countdown adds BALANCE.phases.dusk (14) to survival's remaining calm; v3's dusk is 20 (crossFileRequest ui-hud)
  log(shown !== null && Math.abs(shown - want) <= 2 ? 'ok   HUD clock matches survival' : 'NOTE HUD clock lags survival by the dusk difference (ui-hud uses BALANCE.phases; see crossFileRequests)', JSON.stringify({ hudText: hud.hudText, wantSeconds: Math.round(want) }));
  await shot('s1-glasswater-calm');
  await errs();

  // ------------------------------------------------------------------------------------------------ S2
  step('S2: the oil context table, live (Mossmere raft)');
  await newRun('lantern', 'normal');
  await frames(2);
  const rates = await g(async () => {
    const c = window.__gw, out = {};
    for (const p of ['calm', 'dusk', 'gloomtide', 'dawn']) {
      c.debug.setPhase(p);
      c.paused = true; c.survival.update(0.05, 0); c.paused = false;
      out[p] = c.survival.getVitals().oilRate;
    }
    out.context = c.survival.oilContext; out.zone = c.state.run.zone;
    c.debug.killAll?.();
    return out;
  });
  check(rates.zone === 'mossmere' && rates.context === 'raft', 'on the raft in the Mossmere: context raft', rates);
  check(near(rates.calm, 0.17 * 0.35, 1e-6) && near(rates.dusk, 0.17 * 0.5, 1e-6) && near(rates.gloomtide, 0.17, 1e-6) && near(rates.dawn, 0.17 * 0.35, 1e-6), 'live oil/s = 0.17 × {0.35, 0.5, 1.0, 0.35}', rates);

  step('S2: a whole Mossmere raft day with no casts, through the real modules (main paused, survival stepped)');
  const day = await g(() => {
    const c = window.__gw, r = c.state.run;
    c.debug.killAll?.();
    // day 1 (hushed): from calm 0 to the next calm
    r.day = 1; r.phase = 'calm'; r.phaseTime = 0; r.oil = 100; c.debug.hush(1);
    c.paused = true;
    let o = r.oil, n = 0;
    while (!(r.day === 2 && r.phase === 'calm') && n++ < 10000) c.survival.update(0.05, 0);
    const day1 = o - r.oil;
    r.oil = 100; o = 100; n = 0;
    while (!(r.day === 3 && r.phase === 'calm') && n++ < 10000) c.survival.update(0.05, 0);
    const day2 = o - r.oil;
    c.paused = false;
    return { day1, day2, flow: c.flow, died: window.__s.ev.filter((x) => x[0] === 'player:died').length };
  });
  check(near(day.day1, 30.1, 0.5), 'day 1 burns 30.1 ± 0.5', day);
  check(near(day.day2, 28.3, 0.5), 'a later raft day burns 28.3 ± 0.5', day);
  check(day.flow === 'playing' && day.died === 0, 'nothing ended the run', day);

  step('S2: 0 oil → Last Flicker (+12) → guttering (light 2.5) → relight → guttering → Snuffed');
  await g(() => { window.__s.ev.length = 0; const c = window.__gw; c.debug.setPhase('calm'); c.state.run.oil = 0.01; });
  await frames(3);
  const fl = await g(() => ({ oil: window.__gw.state.run.oil, flick: window.__s.ev.filter((x) => x[0] === 'lantern:flicker').length, gut: window.__gw.survival.guttering }));
  check(fl.flick === 1 && fl.oil > 11 && fl.oil <= 12 && !fl.gut, 'the Last Flicker gives 12 oil, once', fl);
  await g(() => { window.__gw.state.run.oil = 0.01; });
  await frames(4);
  const gt = await g(() => { const c = window.__gw; return { gut: c.survival.guttering, left: c.survival.gutterLeft, pi: c.survival.getPhaseInfo().guttering, out: window.__s.ev.filter((x) => x[0] === 'lantern:out').length, flick: window.__s.ev.filter((x) => x[0] === 'lantern:flicker').length }; });
  check(gt.gut && gt.pi && gt.out === 1 && gt.flick === 1 && gt.left > 20 && gt.left <= 25, 'guttering starts (lantern:out, no second flicker), gutterLeft ≤ 25', gt);
  await frames(20);
  const lr = await g(() => window.__gw.survival.lightRadius);
  check(near(lr, 2.5, 0.2), 'the guttering light is 2.5 m', lr);
  await shot('s2-guttering');
  await g(() => window.__gw.survival.addOil(17));   // what rendering a common does (progression → survival.addOil)
  await frames(2);
  const rl = await g(() => ({ gut: window.__gw.survival.guttering, lit: window.__s.ev.filter((x) => x[0] === 'lantern:lit').length }));
  check(!rl.gut && rl.lit === 1, 'a render relights the lantern', rl);
  await g(() => { window.__gw.state.run.oil = 0.01; window.__gw.debug.timeScale(6); });
  let snuffed = false;
  for (let i = 0; i < 400 && !snuffed; i++) { await frames(2); snuffed = (await count('player:died')) > 0; }
  await g(() => window.__gw.debug.timeScale(1));
  const died = await lastEv('player:died');
  check(snuffed && died?.cause === 'snuffed', "25 s of guttering → player:died {cause: 'snuffed'}", died);
  await frames(30);
  const deadFlow = await g(() => ({ flow: window.__gw.flow, title: [...document.querySelectorAll('#ui h1, #ui h2, #ui .gw-title')].map((e) => e.textContent.trim()).filter(Boolean).slice(0, 3) }));
  check(deadFlow.flow === 'dead', "the snuff ends the run through today's death flow", deadFlow);
  await shot('s2-snuffed');
  await errs();

  step('S2: Lantern — Embers at 0 are Scorched, never Snuffed; the run continues and dawn mends');
  await newRun('lantern', 'normal');
  await frames(3);
  const sc = await g(() => {
    const c = window.__gw, r = c.state.run;
    window.__s.ev.length = 0;
    c.debug.setPhase('gloomtide'); r.day = 2; r.oil = 80;
    c.debug.killAll?.();
    const before = r.oil;
    c.debug.hurt(99, 'hand_slam');
    return { flow: c.flow, hp: r.hp, oilLost: +(before - r.oil).toFixed(2), scorched: c.survival.scorched, lampWatch: c.survival.lampWatch, swarm: c.survival.getPhaseInfo().swarm,
      ev: window.__s.ev.filter((x) => /scorched|lampwatch|died/.test(x[0])).map((x) => x[0]) };
  });
  check(sc.flow === 'playing' && sc.hp === 0 && sc.ev.includes('player:scorched') && !sc.ev.includes('player:died'), 'Lantern: Embers at 0 → player:scorched, no player:died', sc);
  check(sc.oilLost === 30 && sc.lampWatch?.forced === true && sc.ev.includes('lampwatch:start') && sc.swarm === false, '−30 oil, a forced lamp-watch, no swarm tonight', sc);
  await frames(10);
  await shot('s2-scorched');
  const dawn = await g(() => { const c = window.__gw; c.debug.setPhase('dawn'); const r = c.state.run; return { hp: r.hp, max: c.progression.getStats().maxHp, scorched: c.survival.scorched, lw: c.survival.lampWatch, end: window.__s.ev.filter((x) => x[0] === 'lampwatch:end').length, flow: c.flow }; });
  check(dawn.hp === dawn.max && dawn.scorched === null && dawn.lw === null && dawn.end === 1 && dawn.flow === 'playing', 'dawn: lampwatch:end, the Embers mend in full, the run goes on', dawn);

  step('S2: Still — Embers at 0 never snuff; Gloomtide keeps the Embers death');
  const st = await g(() => {
    const c = window.__gw, r = c.state.run;
    r.nightMode = 'still'; window.__s.ev.length = 0;
    c.debug.setPhase('gloomtide');
    c.debug.hurt(99, 'debug');
    return { flow: c.flow, hp: r.hp, died: window.__s.ev.filter((x) => x[0] === 'player:died').length, scorched: window.__s.ev.filter((x) => x[0] === 'player:scorched').length };
  });
  check(st.flow === 'playing' && st.hp === 0 && st.died === 0 && st.scorched === 0, 'Still: Embers at 0 → no snuff, no Scorched card', st);
  const gl = await g(() => {
    const c = window.__gw, r = c.state.run;
    c.debug.setPhase('dawn'); r.nightMode = 'gloomtide'; window.__s.ev.length = 0;
    c.debug.hurt(99, 'hand_slam');
    return { died: window.__s.ev.filter((x) => x[0] === 'player:died').map((x) => x[1].cause) };
  });
  check(gl.died.length === 1 && gl.died[0] === 'gloom', "Gloomtide: Embers at 0 → player:died {cause: 'gloom'}", gl);
  await frames(20);
  await errs();

  // ------------------------------------------------------------------------------------------------ S3
  step('S3: satiety 0 for a full day causes no damage; Well-fed at ≥ 60%');
  await newRun('lantern', 'normal');
  await frames(3);
  const s3 = await g(() => {
    const c = window.__gw, r = c.state.run;
    c.debug.killAll?.();
    window.__s.ev.length = 0;
    r.satiety = 0; const hp = r.hp; r.oil = 100;
    c.paused = true;
    let n = 0; const d0 = r.day;
    while (!(r.day === d0 + 1 && r.phase === 'calm') && n++ < 10000) { c.survival.update(0.05, 0); if (r.phase === 'gloomtide') c.debug.killAll?.(); r.oil = Math.max(r.oil, 50); }
    c.paused = false;
    const out = { hpBefore: hp, hpAfter: r.hp, damage: window.__s.ev.filter((x) => x[0] === 'player:damage').length, died: window.__s.ev.filter((x) => x[0] === 'player:died').length,
      starving: c.survival.starving, hunger: window.__s.ev.filter((x) => x[0] === 'resource:low' && x[1].resource === 'satiety').length };
    r.satiety = 59; out.fed59 = c.survival.wellFed;
    const base = c.progression.getStats().reelSpeed;
    r.satiety = 60; out.fed60 = c.survival.wellFed; out.vitals = c.survival.getVitals().wellFed;
    c.progression.invalidate?.();
    out.reelGain = +(c.progression.getStats().reelSpeed - base).toFixed(3);
    return out;
  });
  check(s3.hpAfter === s3.hpBefore && s3.damage === 0 && s3.died === 0 && !s3.starving && s3.hunger === 0, 'satiety 0 for a full day: no damage, no starving, no hunger warning', s3);
  check(!s3.fed59 && s3.fed60 && s3.vitals, 'satiety ≥ 60% shows Well-fed (59 does not)', s3);
  log(s3.reelGain === 0.08 ? 'ok   Well-fed reelSpeed +0.08 through progression.getStats' : 'NOTE Well-fed stat effects come from progression.getStats (P1 progression branch); this build\'s progression adds', JSON.stringify({ reelGain: s3.reelGain }));
  await errs();

  return { failures };
}
