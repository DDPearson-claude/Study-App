// P1b world + combat C2 (DESIGN §25.14.2 W1, C2; §25.5.2, §25.5.7, §25.6.1; CONTRACT §13.7 world / combat) with v3 on at
// phase 1, in a browser through playtest:
//
//   node build.mjs --dev --out=tools/out/p1b-world/v3.html
//   node tools/playtest.mjs --html=tools/out/p1b-world/v3.html --shots=tools/out/p1b-world/shots \
//        --script=tools/tests/p1b-world.scenario.mjs --width=960 --height=540
//   (add --mobile for a 390 px phone; --only=api,lamps,legend,c2,lakes runs a part; --low renders at quality low)
//
// W1  every lake: world.getWatchLamps() returns 2 lamps at the drawn dock buoy-lamps (≤ 0.1 m from ZONES[].arena.watchLamps)
//     with radius 6, and world.getGiantSpots() returns the 3 stopgap waters (RAFT_FALLBACK_V3); survival's lamp-watch takes
//     the world's lamp; the v3 visuals exist (2 pools, the legend glimmer); frames: the Mossmere's two buoy-lamps at dusk /
//     night / in a lamp-watch, a lamp by day, the legend pool idle and listening (with the edge marker), the other three
//     lakes' raft lamps at night.
// C2  combat.presentation follows the §25.5.7 table in each mode at calm, dusk and night (aura, Embers, Flare); a Flare
//     where the table hides it does nothing and costs no oil; frames of each mode at calm, dusk and night (no ring around
//     the raft in any of them: the aura is a soft wash).
// Every step: 0 ctx.errors (playtest adds page and console errors).
export default async function (api) {
  const { page, wait, log, shot, evalGame: g } = api;
  page.setDefaultTimeout(240000);
  const failures = [];
  const only = api.args?.only ? String(api.args.only).toLowerCase().split(',') : null;
  const want = (x) => !only || only.includes(x);
  const mobile = !!api.args?.mobile;
  const P = mobile ? 'm-' : '';
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
  const safeShot = async (name) => { for (let i = 0; i < 3; i++) { try { if (await shot(P + name)) return; } catch (e) { log('shot retry', name, String(e?.message || e).slice(0, 80)); } } };

  // ------------------------------------------------------------------ boot: v3 on at phase 1, a fresh save
  step('boot (?v3=1&v3phase=1)');
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 240000 });
  await g(() => window.__gw.game.wipeAll());
  await page.goto(page.url().split('?')[0] + '?v3=1&v3phase=1', { waitUntil: 'commit', timeout: 240000 });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 240000 });
  let s = await g(() => ({ en: window.__gw.data.V3_ENABLED, ph: window.__gw.data.V3_PHASE }));
  check(s.en === true && s.ph === 1, 'v3 phase 1 in the build', s);

  // in-page helpers (after palette-shots.mjs): settle the look without rendering, switch lakes, set mode / day / phase
  await g(({ low }) => {
    const c = window.__gw;
    const H = (window.__w = {});
    H.quality = () => { const q = low ? 'low' : 'high'; try { c.state.meta.settings.quality = q; } catch { /* optional */ } c.render.setQuality?.(q); };
    H.hideTransients = () => {
      try { const m = c.state.meta; m.seenTips = m.seenTips || {}; for (const t of c.data.TIPS || []) if (t?.id) m.seenTips[t.id] = true; } catch { /* optional */ }
      if (document.getElementById('w-hide')) return;
      const st = document.createElement('style'); st.id = 'w-hide';
      st.textContent = '.gw-banner, .gw-banner-layer, .gw-toast { display: none !important; }';
      document.head.appendChild(st);
    };
    H.settle = (sec = 6) => {
      const names = ['actors', 'models', 'world', 'water', 'render'];
      let t = c.time.t;
      for (let i = 0; i < Math.max(1, Math.round(sec / 0.05)); i++) { t += 0.05; for (const n of names) { const m = c[n]; if (m && !m.isStub && typeof m.update === 'function') { try { m.update(0.05, t); } catch { /* keep pumping */ } } } }
    };
    H.pumpCombat = (sec = 2) => { let t = c.time.t; for (let i = 0; i < Math.round(sec / 0.05); i++) { t += 0.05; try { c.combat.update(0.05, t); } catch { /* keep pumping */ } } };
    H.clearUi = () => {
      for (let i = 0; i < 12 && c.combat?.pendingOptions; i++) { try { c.combat.skip?.(); } catch { break; } }
      try { if (c.ui?.isBlocking?.()) c.ui.closeAll?.(); } catch { /* optional */ }
      try { if (c.paused) c.game.resume?.(); } catch { /* optional */ }
    };
    H.snap = () => { try { c.render.snapCamera?.(); } catch { /* optional */ } };
    H.ensureRun = () => {
      if (!c.state.run || c.flow !== 'playing') { c.state.meta.runs = Math.max(1, c.state.meta.runs | 0); c.game.startNewRun({ character: 'wick', nightMode: 'lantern' }); H.clearUi(); }
      try { c.debug.god?.(true); } catch { /* optional */ }
      if (c.state.run) c.state.run.xpNext = 1e9;
      return c.state.run;
    };
    H.goZone = (zone) => {
      const r = H.ensureRun();
      if (!(r.zonesUnlocked || []).includes(zone)) r.zonesUnlocked = [...(r.zonesUnlocked || []), zone];
      try { c.combat.killAll?.('debug'); } catch { /* optional */ }
      if (r.zone !== zone) { r.zone = zone; r.gateOpen = false; c.bus.emit('zone:change', { zone, prev: null }); }
      return r.zone;
    };
    H.mode = (m) => { H.ensureRun(); return c.debug.mode?.(m); };
    H.at = (day, phase, k) => {
      const r = H.ensureRun();
      c.debug.setDay(day);
      if (r.phase !== phase) { if (phase === 'gloomtide' && r.phase !== 'dusk') c.debug.setPhase('dusk'); c.debug.setPhase(phase); }
      const info = c.survival.getPhaseInfo?.();
      if (info?.duration > 0) r.phaseTime = info.duration * k;
      try { c.debug.setOil?.(1000); c.debug.setSatiety?.(1000); c.debug.setHp?.(99); } catch { /* optional */ }
      return c.survival.getPhaseInfo?.();
    };
    H.place = (x, z, yaw = 0) => { const p = new c.THREE.Vector3(x, 0, z); c.player.teleport ? c.player.teleport(p, yaw) : c.player.position.set(x, 0, z); c.player.velocity?.set?.(0, 0, 0); };
    H.info = () => {
      const r = c.state.run, pi = c.survival?.getPhaseInfo?.();
      return { zone: r?.zone, mode: c.combat?.nightMode, day: r?.day, phase: pi?.phase, k: +(pi?.k ?? 0).toFixed(2), enemies: c.combat?.enemies?.length ?? 0,
        present: c.combat?.presentation, aura: c.combat?.auraShown, lw: c.survival?.lampWatch, v3: c.debug.worldV3?.(), calls: c.render?.renderer?.info?.render?.calls };
    };
  }, { low: !!api.args?.low });
  await g(() => { window.__w.quality(); window.__w.hideTransients(); });
  await g(() => window.__w.ensureRun());
  await wait(1500);
  await g(() => window.__w.clearUi());
  s = await g(() => ({ flow: window.__gw.flow, mode: window.__gw.combat.nightMode, outing: window.__gw.state.run?.outing }));
  check(s.flow === 'playing' && s.mode === 'lantern' && s.outing === 'normal', 'a Lantern run (run 2) in the Mossmere', s);

  const frame = async (name, setup, { settle = 6, render = 2500, combat = 0, arg } = {}) => {
    try {
      const info = await g(setup, arg);
      if (combat > 0) await g((sec) => window.__w.pumpCombat(sec), combat);
      await g((sec) => { window.__w.clearUi(); window.__w.settle(sec); window.__w.snap(); }, settle);
      await wait(render);
      await g(() => { window.__w.clearUi(); window.__w.settle(0.5); window.__w.snap(); });
      await wait(600);
      await safeShot(name);
      log('frame', name, JSON.stringify(info), JSON.stringify(await g(() => window.__w.info())));
    } catch (e) { check(false, `frame ${name}: ${e?.message || e}`); }
  };

  // ------------------------------------------------------------------ W1: the API in every lake
  if (want('api')) {
    step('W1: getWatchLamps() and getGiantSpots() in every lake');
    const lakes = await g(() => window.__gw.data.ZONES.map((z) => z.id));
    for (const zid of lakes) {
      s = await g((zid) => {
        const c = window.__gw, H = window.__w;
        H.goZone(zid);
        const z = c.data.ZONE_BY_ID[zid], F = c.data.RAFT_FALLBACK_V3?.[zid];
        const lamps = c.world.getWatchLamps(), spots = c.world.getGiantSpots();
        const data = z.arena.watchLamps || [];
        return {
          n: lamps.length, r: lamps.map((l) => l.radius), lit: lamps.map((l) => l.lit),
          dist: lamps.map((l) => { const d = data.find((q) => q.id === l.id); return d ? +Math.hypot(d.x - l.position.x, d.z - l.position.z).toFixed(3) : 99; }),
          spots: spots.length, ids: spots.map((q) => q.id).join(), want: (F?.giants || []).map((q) => q.id).join(), places: (z.arena.places || []).length,
          vis: c.debug.worldV3?.().visuals,
        };
      }, zid);
      check(s.n === 2 && s.r.every((r) => r === 6) && s.lit.every(Boolean), `${zid}: getWatchLamps() → 2 lit lamps with pool r 6`, s);
      check(s.dist.every((d) => d <= 0.1), `${zid}: the lamps sit at the drawn dock buoy-lamps (≤ 0.1 m from arena.watchLamps)`, s.dist);
      check(s.places === 0 && s.spots === 3 && s.ids === s.want, `${zid}: getGiantSpots() → the 3 stopgap waters (no places in P1)`, s);
      check(s.vis && s.vis.lamps === 2 && s.vis.legend === true, `${zid}: v3 visuals built (2 watch-lamp pools, the legend glimmer)`, s.vis);
    }
    step('S6 seam: survival takes the lamp from world.getWatchLamps()');
    s = await g(() => {
      const c = window.__gw, H = window.__w;
      H.goZone('mossmere'); H.mode('lantern'); H.at(2, 'gloomtide', 0.02);
      const lamp = c.world.getWatchLamps().find((l) => l.id === 'se_buoy');
      H.place(lamp.position.x, lamp.position.z + 2);
      const lw = c.debug.lampWatch?.('se_buoy');
      const out = { lw, lamp: { x: lamp.position.x, z: lamp.position.z } };
      c.debug.lampWatch?.(null);
      return out;
    });
    check(!!s.lw && s.lw.lampId === 'se_buoy' && Math.abs(s.lw.x - s.lamp.x) < 1e-6 && Math.abs(s.lw.z - s.lamp.z) < 1e-6 && s.lw.radius === 6, "survival's lamp-watch anchors on world's se_buoy (same position, r 6)", s);
    await noErrors();
  }

  // ------------------------------------------------------------------ W1: the Mossmere's watch-lamps
  if (want('lamps')) {
    step('W1 frames: the Mossmere buoy-lamps');
    await frame('w01-moss-se-lamp-dusk-call', () => { const H = window.__w; H.goZone('mossmere'); H.mode('lantern'); H.at(2, 'dusk', 0.85); H.place(18.6, 47.5); return H.info(); });
    await frame('w02-moss-se-lamp-watch-night', () => {
      const c = window.__gw, H = window.__w;
      H.goZone('mossmere'); H.mode('lantern'); H.at(2, 'gloomtide', 0.02); H.place(19.4, 42.4);
      c.debug.lampWatch?.('se_buoy'); return H.info();
    }, { combat: 1 });
    await g(() => window.__gw.debug.lampWatch?.(null));
    await frame('w03-moss-w-lamp-night', () => { const H = window.__w; H.goZone('mossmere'); H.mode('lantern'); H.at(1, 'gloomtide', 0.6); H.place(-44.2, 19.4); return H.info(); });
    await frame('w04-moss-w-lamp-calm', () => { const H = window.__w; H.goZone('mossmere'); H.mode('lantern'); H.at(1, 'calm', 0.4); H.place(-44.2, 19.4); return H.info(); });
    s = await g(() => window.__gw.debug.worldV3());
    check(s.lampK.length === 2 && s.lampK.every((k) => k > 0.2), 'both watch-lamp pools burn (k > 0.2)', s);
    await noErrors();
  }

  // ------------------------------------------------------------------ W1: the legend pool
  if (want('legend')) {
    step('W1 frames: the legend pool (a still ring and a low gold glimmer; the edge marker)');
    await frame('w05-moss-legend-night', () => { const H = window.__w; H.goZone('mossmere'); H.mode('lantern'); H.at(1, 'gloomtide', 0.6); H.place(-3, -4.5); return H.info(); });
    const idle = await g(() => window.__gw.debug.worldV3().legendK);
    await frame('w06-moss-legend-listening', () => {
      const c = window.__gw, H = window.__w, r = H.ensureRun();
      H.goZone('mossmere'); H.mode('lantern'); H.at(1, 'calm', 0.55);
      r.bait = r.bait || {}; r.bait.heartmoss = 1; c.progression.equipBait?.('heartmoss', { quiet: true });
      H.place(-3, -4.5); return H.info();
    }, { render: 4000 });
    s = await g(() => ({ legendK: window.__gw.debug.worldV3().legendK, lp: window.__gw.fishing.legendPool ? { active: window.__gw.fishing.legendPool.active } : null, eq: window.__gw.progression.getEquippedBait?.() }));
    check(s.lp?.active === true && s.legendK > idle, 'the legend pool listens (heartmoss owned, calm): the glimmer brightens', { idle, ...s });
    await frame('w07-moss-legend-edge-marker', () => { const H = window.__w; H.place(38, -12); return H.info(); }, { render: 3500 });
    s = await g(() => [...document.querySelectorAll('.gw-mark.gw-mk-legend.gw-on')].length);
    check(s === 1, 'the edge marker still points at the legend pool (gw-mk-legend shown while it is off-screen)', s);
    await g(() => { const r = window.__gw.state.run; if (r?.bait) delete r.bait.heartmoss; window.__gw.progression.equipBait?.(null, { quiet: true }); });
    await noErrors();
  }

  // ------------------------------------------------------------------ W1: the other lakes' raft watch-lamps
  if (want('lakes')) {
    step('W1 frames: raft watch-lamps in Sporewood, Glasswater and the Pallid Deep');
    await frame('w08-sporewood-lamp-night', () => { const H = window.__w; H.goZone('sporewood'); H.mode('lantern'); H.at(1, 'gloomtide', 0.6); H.place(50.2, 29); return H.info(); });
    await frame('w09-glasswater-lamp-night', () => { const H = window.__w; H.goZone('glasswater'); H.mode('lantern'); H.at(1, 'gloomtide', 0.6); H.place(-47.8, 43.5); return H.info(); });
    await frame('w10-paleabyss-lamp-night', () => { const H = window.__w; H.goZone('paleabyss'); H.mode('lantern'); H.at(1, 'gloomtide', 0.6); H.place(-45.2, 58.5); return H.info(); });
    await frame('w11-glasswater-legend-night', () => { const H = window.__w; H.goZone('glasswater'); H.mode('lantern'); H.at(1, 'gloomtide', 0.6); H.place(0.5, -27.5); return H.info(); });
    await g(() => window.__w.goZone('mossmere'));
    await noErrors();
  }

  // ------------------------------------------------------------------ C2: the §25.5.7 table in each mode
  if (want('c2')) {
    step('C2: combat.presentation by mode at calm, dusk and night');
    const want7 = {
      still: { calm: [0, false, false], dusk: [0, false, false], gloomtide: [0, false, false] },
      lantern: { calm: [0, false, false], dusk: [0.5, true, true], gloomtide: [1, true, true] },
      gloomtide: { calm: [0, true, true], dusk: [1, true, true], gloomtide: [1, true, true] },
    };
    for (const mode of ['still', 'lantern', 'gloomtide']) {
      for (const [phase, k] of [['calm', 0.4], ['dusk', 0.6], ['gloomtide', 0.3]]) {
        s = await g(([mode, phase, k]) => {
          const c = window.__gw, H = window.__w;
          H.goZone('mossmere'); H.mode(mode); H.at(2, phase, k); H.place(0, 46);
          H.pumpCombat(0.2);
          return { p: c.combat.presentation, mode: c.combat.nightMode, swarm: c.combat.swarmTonight };
        }, [mode, phase, k]);
        const [aura, embers, flare] = want7[mode][phase];
        const auraOk = aura === 0 ? s.p.aura === 0 : aura === 1 ? s.p.aura === 1 : s.p.aura > 0.2 && s.p.aura < 1;
        check(s.mode === mode && auraOk && s.p.embers === embers && s.p.flare === flare, `${mode} ${phase}: aura ${aura === 0.5 ? 'fading in' : aura}, Embers ${embers}, Flare ${flare}`, s);
      }
    }
    s = await g(() => { const c = window.__gw, H = window.__w; H.mode('lantern'); H.at(1, 'gloomtide', 0.3); H.pumpCombat(0.2); return { p: c.combat.presentation, swarm: c.combat.swarmTonight }; });
    check(s.swarm === false && s.p.aura === 0 && !s.p.flare && !s.p.embers, 'Lantern on a quiet (odd) night: no aura, no Flare, no Embers', s);
    step('C2: a Flare where the table hides it does nothing and costs no oil');
    s = await g(() => {
      const c = window.__gw, H = window.__w;
      H.mode('still'); H.at(2, 'gloomtide', 0.3); c.debug.flareReset?.(); c.debug.setOil(80);
      const a = { ok: c.combat.flare(), can: c.combat.canFlare(), oil: c.state.run.oil };
      H.mode('gloomtide'); H.at(2, 'calm', 0.4); c.debug.flareReset?.(); c.debug.setOil(80);
      const b = { ok: c.combat.flare(), cd: c.combat.flareCooldown };
      c.debug.setOil(1000);
      return { a, b };
    });
    check(s.a.ok === false && s.a.can === false && s.a.oil === 80, 'Still: the Flare is refused, no oil spent', s.a);
    check(s.b.ok === true && s.b.cd > 0, 'Gloomtide: the Flare works in calm (always shown; its cooldown starts)', s.b);
    await noErrors();

    step('C2 frames: each mode at calm, dusk and night');
    for (const mode of ['still', 'lantern', 'gloomtide']) {
      for (const [phase, k, tag] of [['calm', 0.4, 'calm'], ['dusk', 0.7, 'dusk'], ['gloomtide', 0.3, 'night']]) {
        await frame(`c2-${mode}-${tag}`, ([mode, phase, k]) => {
          const H = window.__w;
          H.goZone('mossmere'); H.mode(mode); H.at(2, phase, k); H.place(2, 40);
          window.__gw.combat.killAll?.('debug');
          return H.info();
        }, { combat: phase === 'gloomtide' ? 4 : 2, settle: 4, arg: [mode, phase, k] });
        await g(() => window.__gw.combat.killAll?.('debug'));
      }
    }
    await noErrors();
  }

  const e = await g(() => window.__gw.errors.slice());
  check(e.length === 0, 'no ctx.errors at the end', e);
  log(`done in ${((Date.now() - t0) / 1000).toFixed(0)} s; ${failures.length} failure(s)`);
  return { failures };
}
