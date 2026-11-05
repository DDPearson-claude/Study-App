// P1b render (DESIGN §25.14.2 R1 / R2, CONTRACT §13.7 render): the v3 camera rig in a browser with v3 on at phase 1.
//
//   node build.mjs --dev --out=tools/out/p1b-render.html
//   node tools/playtest.mjs --html=tools/out/p1b-render.html --shots=tools/out/p1b-render/desk --script=tools/tests/p1b-render.scenario.mjs --width=960 --height=540
//   node tools/playtest.mjs --html=tools/out/p1b-render.html --shots=tools/out/p1b-render/phone --script=tools/tests/p1b-render.scenario.mjs --mobile --width=390 --height=844
//   (--only=presets,reel,still,lantern,trophy runs a part; --fast skips the full-resolution beauty shots)
//
// R1  presets: the settled sail / fish / reel rig equals BALANCE.cameras (portrait: plus v1's raft widening) and the measured
//     pitch equals render's convention; a forced Keeper and a forced Elder hooked at the same line length give the same reel
//     distance (± 0.1 m), and over both fights the reel target is a function of the line distance only; a Stillnight (run 1,
//     the First Outing) and a Lantern lamp-watch keep the sail / fish framing; a Lantern swarm window blends to `night`.
// R2  trophy: setTrophyTarget for a 0.2 m, a 1.2 m and an 8.5 m catch puts the camera at 1.6, 3.12 and 14.8 m from the subject
//     and cranes to 50° on the last; with no place the yaw stays north; a landmark swings it by at most ±35°; the framing holds
//     while the catch card is up and eases back to sail after it; fishing:reveal goes through ctx.game.slowmo (0.25 s at 0.35)
//     and restores the time scale to 1.
export default async function (api) {
  const { page, frames, evalGame: g, log, shot } = api;
  const failures = [];
  const only = api.args?.only ? String(api.args.only).toLowerCase().split(',') : null;
  const want = (x) => !only || only.includes(x);
  const fast = !!api.args?.fast;
  const portrait = api.width < api.height;
  let stepName = 'boot';
  const t0 = Date.now();
  const step = (s) => { stepName = s; log(`---- ${s}  (+${((Date.now() - t0) / 1000).toFixed(0)} s)`); };
  const check = (cond, msg, extra) => {
    if (cond) { log('ok  ', msg, extra !== undefined ? JSON.stringify(extra) : ''); return true; }
    failures.push(`[${stepName}] ${msg}${extra !== undefined ? ` :: ${JSON.stringify(extra)}` : ''}`);
    log('FAIL', msg, extra !== undefined ? JSON.stringify(extra) : '');
    return false;
  };
  const waitFor = async (fn, arg, maxFrames = 120) => { for (let i = 0; i < maxFrames; i++) { if (await g(fn, arg)) return true; await frames(1); } return false; };
  const cam = () => g(() => window.__gw.debug.camera());
  // beauty shots at full resolution and quality; logic runs at a fraction of it (software GL)
  const lowRes = () => g(() => { try { window.__gw.render.setQuality?.('low'); window.__gw.debug.renderScale?.(0.35); } catch { /* optional */ } });
  const safeShot = async (name) => {
    if (!fast) { await g(() => { try { window.__gw.render.setQuality?.('high'); window.__gw.debug.renderScale?.(1); } catch { /* optional */ } }); await frames(3); }
    for (let i = 0; i < 3; i++) { try { await shot(name); break; } catch (e) { log('shot retry', name, String(e?.message || e).slice(0, 80)); } }
    if (!fast) await lowRes();
  };
  const noErrors = async () => { const e = await g(() => window.__gw.errors.slice()); check(e.length === 0, 'ctx.errors stays empty', e); };
  const clearModals = async () => {
    for (let i = 0; i < 10; i++) {
      await frames(2);
      const m = await g(() => ({ m: window.__gw.debug.ui?.()?.openModal ?? null, b: !!window.__gw.ui.isBlocking?.(), p: !!window.__gw.paused }));
      if (!m.b && !m.p && m.m !== 'levelup') return;
      await g(() => { const c = window.__gw, o = c.combat.pendingOptions; if (o?.length) c.combat.chooseBoon(o[0].boonId); c.ui.closeAll?.(); if (c.paused) c.game.resume?.(); });
    }
  };
  const place = (x, z) => g(([x, z]) => { const c = window.__gw; c.player.teleport ? c.player.teleport(new c.THREE.Vector3(x, 0, z), 0) : c.player.position.set(x, 0, z); c.player.velocity?.set?.(0, 0, 0); }, [x, z]);
  /** Let the rig settle on its targets (real time keeps running for render while game time may be frozen). */
  const settle = async (n = 40) => { await frames(n); };
  const freeze = (on) => g((on) => window.__gw.debug.timeScale(on ? 0 : 1), on);
  /** The settled rig vs a preset (+ v1's raft widening in portrait: fov + 22·pf, dist × (1 + 0.38·pf), elev + 7·pf). */
  const widened = (p, aspect) => {
    if (!(aspect < 1.25)) return { ...p };
    const t = Math.min(1, Math.max(0, (aspect - 1.25) / (0.5 - 1.25)));
    const pf = t * t * (3 - 2 * t);
    return { ...p, fov: Math.min(78, p.fov + pf * 22), dist: p.dist * (1 + pf * 0.38), elev: Math.min(80, p.elev + pf * 7) };
  };
  const matches = (c, p, keys, eps = 0.06) => keys.every((k) => Math.abs(c.cur[k] - p[k]) <= eps * Math.max(1, Math.abs(p[k])) * (k === 'aim' ? 2 : 1));
  const pitchFor = (p) => Math.atan2(p.dist * Math.sin(p.elev * Math.PI / 180) - p.aimY, p.dist * Math.cos(p.elev * Math.PI / 180) + p.aim) * 180 / Math.PI;

  // ------------------------------------------------------------------ boot: v3 on at phase 1, a fresh save
  step('boot (?v3=1&v3phase=1)');
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 240000 });
  await g(() => window.__gw.game.wipeAll());
  await page.goto(page.url().split('?')[0] + '?v3=1&v3phase=1', { waitUntil: 'commit', timeout: 240000 });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 240000 });
  await frames(2);
  await lowRes();
  let s = await g(() => { const c = window.__gw, d = c.data; return { en: d.V3_ENABLED, ph: d.V3_PHASE, cams: d.BALANCE.cameras, v3: c.debug.camera?.().v3 }; });
  check(s.en === true && s.ph === 1 && !!s.cams?.sail && s.v3 === true, 'v3 phase-1 build with BALANCE.cameras; render reads it', { en: s.en, ph: s.ph, v3: s.v3 });
  const CAMS = s.cams;

  step('run 1: the First Outing (all still)');
  await g(() => { const c = window.__gw; c.ui.closeAll?.(); c.game.startNewRun({ character: 'wick' }); });
  await waitFor(() => window.__gw.flow === 'playing', null, 120);
  await clearModals();
  s = await g(() => { const c = window.__gw, r = c.state.run; return { outing: r.outing, mode: r.nightMode, combat: c.combat.nightMode, phase: r.phase }; });
  check(s.outing === 'first' && s.combat === 'still', 'run 1 is the First Outing, still', s);
  await g(() => { const c = window.__gw; c.debug.god?.(true); c.debug.setOil?.(100); });
  // a quiet open-water spot facing north with room to cast up-screen
  await place(0, 30);
  await settle(6);

  // ------------------------------------------------------------------ R1: presets
  if (want('presets')) {
    step('R1 sail preset');
    await g(() => window.__gw.render.snapCamera());
    await settle(30);
    let c = await cam();
    const sail = widened(CAMS.sail, c.aspect);
    check(c.mode === 'sail' && matches(c, sail, ['elev', 'dist', 'aim', 'aimY', 'fov']), 'the settled sail rig equals BALANCE.cameras.sail' + (portrait ? ' (+ v1 portrait widening)' : ''), { cur: c.cur, want: sail });
    check(Math.abs(c.presetPitchDeg - pitchFor(sail)) < 0.6, 'sail pitch = atan((d·sin e − aimY)/(d·cos e + aim))', { pitch: c.presetPitchDeg, want: pitchFor(sail), measured: c.pitchDeg });
    check(Math.abs(c.yawDeg) < 0.5, 'fixed north yaw', c.yawDeg);
    await safeShot('r1-sail');

    step('R1 fish preset (a cast waiting up-screen)');
    s = await g(() => window.__gw.debug.forceBite({ wait: 30 }));
    await waitFor(() => window.__gw.fishing.state === 'waiting', null, 60);
    await freeze(true);
    check(await g(() => window.__gw.fishing.state === 'waiting'), 'a cast lands and waits', s);
    await settle(50);
    c = await cam();
    const sep = await g(() => { const c = window.__gw, b = c.fishing.bobberPos, p = c.player.position; return b ? Math.hypot(b.x - p.x, b.z - p.z) : null; });
    const fishBase = { ...CAMS.fish, dist: Math.max(CAMS.fish.dist, 8.5 + sep * 0.78), elev: CAMS.fish.elev + Math.min(20, Math.max(0, sep - 12)) * 0.4 };
    const fishW = widened(fishBase, c.aspect);
    check(c.mode === 'fish' && matches(c, fishW, ['elev', 'dist', 'aimY', 'fov']), `the fish rig: BALANCE.cameras.fish (28° / 13 m) backed off by the ${sep?.toFixed(1)} m line`, { cur: c.cur, want: fishW, sep });
    check(Math.abs(c.cur.aim - CAMS.fish.aim) < 0.35, 'an up-screen cast uses data\'s fish aim', { aim: c.cur.aim, want: CAMS.fish.aim });
    await safeShot('r1-fish');
    await g(() => { const c = window.__gw; c.fishing.cancel('debug'); });
    await freeze(false);
    await settle(10);
  }

  // ------------------------------------------------------------------ R1: the reel camera never reads the size class
  if (want('reel')) {
    step('R1 reel: a forced Keeper and a forced Elder at the same line length');
    await place(0, 30);
    await settle(4);
    const hookAt = async (z) => {
      await g(() => { const c = window.__gw; c.fishing.cancel('debug'); });
      await freeze(false);
      await settle(4);
      const okHook = await g((z) => window.__gw.debug.fishHook('reedjaw_pike', { z }), z);
      await freeze(true);                 // the fish stays where it was hooked; the camera keeps its real-time ease
      await settle(70);
      return g(() => {
        const c = window.__gw, b = c.fishing.bobberPos, p = c.player.position, cm = c.debug.camera(), f = c.debug.fishing?.() || {};
        return { hooked: c.fishing.state, sep: b ? Math.hypot(b.x - p.x, b.z - p.z) : null, dist: cm.cur.dist, tgt: cm.tgt.dist, mode: cm.mode, cls: f.sizeClass, z: f.z, tension: c.fishing.view.tension };
      }).then((r) => ({ ...r, okHook }));
    };
    const K = await hookAt(0.4);
    await safeShot('r1-reel-keeper');
    const E = await hookAt(2.9);
    await safeShot('r1-reel-elder');
    check(K.okHook && E.okHook && K.mode === 'reel' && E.mode === 'reel', 'both hooked, both framed by the reel camera', { K, E });
    check(K.cls === 'keeper' && E.cls === 'elder', 'a Keeper (z 0.4) and an Elder (z 2.9) of the same species', { K: K.cls, E: E.cls });
    check(Math.abs(K.sep - E.sep) < 0.25, 'hooked at the same line length', { K: K.sep, E: E.sep });
    check(Math.abs(K.dist - E.dist) <= 0.1, 'the same reel-camera distance (± 0.1 m)', { K: K.dist, E: E.dist, d: Math.abs(K.dist - E.dist) });
    // over both live fights (tension, surges and the fish's runs differ): the target distance is the line's function only
    const fight = async (z) => {
      await g(() => { const c = window.__gw; c.fishing.cancel('debug'); });
      await freeze(false);
      await settle(3);
      await g((z) => window.__gw.debug.fishHook('reedjaw_pike', { z }), z);
      const out = [];
      for (let i = 0; i < 40; i++) {
        const r = await g((i) => {
          const c = window.__gw, f = c.fishing, T = f.view?.tension ?? 0;
          if (f.state === 'reeling') { if (T < 0.5 && i % 3 !== 2) f.onPointerDown(); else f.onPointerUp(); }
          const b = f.bobberPos, p = c.player.position, cm = c.debug.camera();
          return { st: f.state, sep: b ? Math.hypot(b.x - p.x, b.z - p.z) : null, tgt: cm.tgt.dist, T, mode: cm.mode };
        }, i);
        if (r.st !== 'reeling') break;
        out.push(r);
        await frames(1);
      }
      await g(() => { const c = window.__gw; c.fishing.onPointerUp(); c.fishing.cancel('debug'); });
      return out;
    };
    const fk = await fight(0.4), fe = await fight(2.9);
    const R = CAMS.reel;
    const expect = (sep) => Math.max(R.dist, 7.5 + Math.min(40, Math.max(0, sep)) * 0.6);
    const bad = [...fk, ...fe].filter((r) => r.mode === 'reel' && r.sep != null && Math.abs(r.tgt - expect(r.sep)) > 1e-3);
    check(fk.length > 5 && fe.length > 5 && bad.length === 0, 'in both fights the reel target = max(10, 7.5 + 0.6 × line distance), whatever the tension', { keeper: fk.length, elder: fe.length, bad: bad.slice(0, 3), tK: Math.max(...fk.map((r) => r.T)), tE: Math.max(...fe.map((r) => r.T)) });
    await freeze(false);
    await settle(10);
  }

  // ------------------------------------------------------------------ R1: a Stillnight keeps the sail / fish framing
  if (want('still')) {
    step('R1 Stillnight (run 1, all still)');
    await clearModals();
    await g(() => { const c = window.__gw; c.fishing.cancel('debug'); c.debug.setDay(1); c.debug.setOil(100); c.debug.setPhase('dusk'); c.debug.setPhase('gloomtide'); });
    await place(0, 30);
    await g(() => { const c = window.__gw, r = c.state.run, d = c.survival.getPhaseInfo().duration || 90; r.phaseTime = 0.3 * d; });
    await settle(60);
    let c = await cam();
    s = await g(() => ({ swarm: window.__gw.combat.swarmActive, phase: window.__gw.state.run.phase, mode: window.__gw.combat.nightMode }));
    const sail = widened(CAMS.sail, c.aspect);
    check(s.phase === 'gloomtide' && s.swarm === false && s.mode === 'still', 'a Stillnight: night, no swarm', s);
    check(c.mode === 'sail' && c.nightK < 0.02 && matches(c, sail, ['elev', 'dist', 'fov']), 'the camera stays at the sail framing', { mode: c.mode, nightK: c.nightK, cur: c.cur });
    await safeShot('r1-stillnight-sail');
    await g(() => window.__gw.debug.forceBite({ wait: 30 }));
    await waitFor(() => window.__gw.fishing.state === 'waiting', null, 60);
    await freeze(true);
    await settle(50);
    c = await cam();
    check(c.mode === 'fish' && c.nightK < 0.02 && Math.abs(c.cur.elev - widened({ ...CAMS.fish }, c.aspect).elev) < 1.5, 'casting on a Stillnight keeps the fish framing (no overview)', { mode: c.mode, nightK: c.nightK, elev: c.cur.elev });
    await safeShot('r1-stillnight-fish');
    await g(() => window.__gw.fishing.cancel('debug'));
    await freeze(false);
    await g(() => { const c = window.__gw; c.debug.setPhase('dawn'); });
    await clearModals();
  }

  // ------------------------------------------------------------------ R1: Lantern — the swarm window blends to night; a lamp-watch does not
  if (want('lantern')) {
    step('run 2: Lantern');
    await g(() => { const c = window.__gw; c.ui.closeAll?.(); c.game.endRun('debug'); });
    await waitFor(() => window.__gw.flow !== 'playing', null, 30);
    await g(() => { const c = window.__gw; c.ui.closeAll?.(); c.game.startNewRun({ character: 'wick', nightMode: 'lantern' }); c.ui.closeAll?.(); c.debug.god?.(true); });
    await clearModals();
    s = await g(() => ({ mode: window.__gw.combat.nightMode, flow: window.__gw.flow }));
    check(s.mode === 'lantern' && s.flow === 'playing', 'run 2 plays Lantern', s);
    await lowRes();

    step('Lantern night 2: the swarm window → night overview');
    await place(0, 30);
    await g(() => { const c = window.__gw; c.debug.setDay(2); c.debug.setOil(100); c.debug.setPhase('dusk'); c.debug.setPhase('gloomtide'); const r = c.state.run, d = c.survival.getPhaseInfo().duration || 90; r.phaseTime = 0.02 * d; c.debug.timeScale(4); });
    await waitFor(() => window.__gw.combat.swarmActive === true, null, 400);
    await g(() => window.__gw.debug.timeScale(1));
    const before = await cam();
    await settle(80);
    let c = await cam();
    s = await g(() => ({ swarm: window.__gw.combat.swarmActive, k: window.__gw.survival.getPhaseInfo().k, alive: window.__gw.combat.enemies.filter((e) => e.alive).length }));
    check(s.swarm === true, 'combat.swarmActive inside the window', s);
    const night = widened({ ...c.presets.night }, c.aspect);
    check(c.mode === 'night' && c.nightK > 0.9 && Math.abs(c.cur.elev - night.elev) < 2.5 && Math.abs(c.cur.dist - night.dist) < 1.2, 'the camera blends to the night overview', { mode: c.mode, nightK: c.nightK, cur: c.cur, want: night, before: before.nightK });
    await safeShot('r1-lantern-swarm-night');
    await g(() => { const c = window.__gw; c.combat.killAll('scorched'); c.debug.setPhase('dawn'); });
    await clearModals();
    await settle(30);

    step('Lantern lamp-watch (night 4) keeps the sail framing');
    const lamp = await g(() => { const l = window.__gw.data.ZONE_BY_ID.mossmere.arena.watchLamps?.[0]; return l ? { id: l.id, x: l.x, z: l.z } : null; });
    if (check(!!lamp, 'a Mossmere watch-lamp', lamp)) {
      await g(() => { const c = window.__gw; c.ui.closeAll?.(); c.debug.setDay(4); c.debug.setOil(100); c.debug.setPhase('dusk'); });
      await place(lamp.x, lamp.z + 1.5);
      await frames(2);
      await g(() => window.__gw.debug.setPhase('gloomtide'));
      await clearModals();
      await g(() => { const c = window.__gw, r = c.state.run, d = c.survival.getPhaseInfo().duration || 90; r.phaseTime = 0.04 * d; c.debug.timeScale(4); });
      for (let i = 0; i < 300; i++) {
        const k = await g(([x, z]) => { const c = window.__gw; c.player.position.set(x, 0, z); c.player.velocity?.set?.(0, 0, 0); return c.survival.getPhaseInfo().k; }, [lamp.x, lamp.z + 1.5]);
        if (k >= 0.2) break;
        await frames(1);
      }
      await g(() => window.__gw.debug.timeScale(1));
      await settle(40);
      c = await cam();
      s = await g(() => ({ lw: window.__gw.state.run.lampWatch, swarm: window.__gw.combat.swarmActive, k: window.__gw.survival.getPhaseInfo().k }));
      const sail = widened(CAMS.sail, c.aspect);
      check(!!s.lw && s.swarm === false && s.k > 0.05 && s.k < 0.5, 'a lamp-watch inside the window holds the swarm off', s);
      check(c.mode === 'sail' && c.nightK < 0.05 && matches(c, sail, ['elev', 'dist', 'fov']), 'the camera stays at the sail framing in a lamp-watch', { mode: c.mode, nightK: c.nightK, cur: c.cur });
      await safeShot('r1-lampwatch-sail');
      await g(() => { const c = window.__gw; c.combat.killAll('scorched'); c.debug.setPhase('dawn'); });
      await clearModals();
    }
  }

  // ------------------------------------------------------------------ R2: the trophy shot
  if (want('trophy')) {
    step('R2 trophy: 0.2 m, 1.2 m, 8.5 m');
    await clearModals();
    await g(() => { const c = window.__gw; c.fishing.cancel('debug'); if (c.state.run.phase !== 'calm') c.debug.setPhase('calm'); });
    await clearModals();
    await place(0, 30);
    await settle(10);
    const catches = [
      { id: 'dusk_minnow', target: 0.2, want: 1.6, crane: false },
      { id: 'reedjaw_pike', target: 1.2, want: 3.12, crane: false },
      // (the 8.5 m legend is the final one: landing it ends the run in victory, so this branch frames the rule alone; the
      // integration trial with fishing's ceremony lands the real Lantern-Swallower)
      { id: null, target: 8.5, want: 14.8, crane: true },
    ];
    for (const k of catches) {
      // the z that gives the target length (data.sizeLength, bisection), then a debug catch held up by the Wick
      const z = k.id === null ? 0 : await g(([id, L]) => {
        const d = window.__gw.data, sp = d.SPECIES_BY_ID[id];
        let lo = -2, hi = 3.6;
        for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (d.sizeLength(sp, m) / 100 < L) lo = m; else hi = m; }
        return (lo + hi) / 2;
      }, [k.id, k.target]);
      const r = await g(([id, z, L]) => {
        const c = window.__gw;
        c.fishing.cancel('debug');
        const okc = id ? c.debug.instantCatch(id, { z }) : null;
        const p = c.player.position;
        // what fishing's ceremony hands render at the scoop (CONTRACT §13.7): the true length, no landmark without a place
        const set = c.render.setTrophyTarget({ length: L, landmark: null, position: { x: p.x + 1.4, y: 0, z: p.z - 1.4 }, place: null });
        return { okc, set };
      }, [k.id, z, k.target]);
      await settle(k.crane ? 120 : 80);
      const c = await cam();
      check(r.set && c.mode === 'trophy' && !!c.trophy, `${k.target} m: the trophy shot is on`, { r, mode: c.mode });
      if (c.trophy) {
        check(Math.abs(c.trophy.dist - k.want) < 1e-6, `${k.target} m → the rule's distance ${k.want} m`, c.trophy.dist);
        check(Math.abs(c.cur.dist - k.want) < 0.05 && Math.abs(c.trophy.camToSubject - k.want) < 0.12, `the camera sits ${k.want} m from the subject`, { rig: c.cur.dist, camToSubject: c.trophy.camToSubject });
        check(k.crane ? Math.abs(c.cur.elev - 50) < 0.6 : Math.abs(c.cur.elev - 18) < 0.6, k.crane ? 'cranes to 50°' : 'stays at 18° (no crane at or below 4 m)', c.cur.elev);
        check(Math.abs(c.yawDeg) < 0.3 && c.trophy.yawDeg === 0, 'no place → the yaw stays north', { yaw: c.yawDeg });
      }
      await safeShot(`r2-trophy-${String(k.target).replace('.', '_')}m`);
      // the card's turn: the framing holds while the catch card is up, then eases back to sail
      await g(() => window.__gw.render.setTrophyTarget(null));
      await settle(20);
      const held = await cam();
      const blocking = await g(() => !!window.__gw.ui.isBlocking?.());
      check(!blocking || (held.mode === 'trophy' && held.trophy?.hold), 'the trophy framing holds while the catch card is up', { blocking, mode: held.mode });
      await g(() => { const c = window.__gw; c.ui.closeAll?.(); });
      await clearModals();
      await settle(90);
      const back = await cam();
      check(back.mode === 'sail' && Math.abs(back.cur.dist - widened(CAMS.sail, back.aspect).dist) < 0.6, 'after the card the camera eases back to sail', { mode: back.mode, dist: back.cur.dist });
    }

    step('R2 trophy yaw toward a landmark (≤ ±35° from north)');
    {
      const p = await g(() => ({ x: window.__gw.player.position.x, z: window.__gw.player.position.z }));
      const lm = { x: p.x - 18, y: 4, z: p.z - 10 };   // north-west: the yaw turns toward −X, clamped to 35°
      await g((lm) => window.__gw.render.setTrophyTarget({ length: 1.2, landmark: lm, position: null, place: 'test' }), lm);
      await settle(90);
      const c = await cam();
      const want = Math.min(35, Math.atan2(18, 10) * 180 / Math.PI);
      check(c.mode === 'trophy' && Math.abs(c.trophy.yawDeg - want) < 0.05 && Math.abs(c.yawDeg - want) < 1, 'the yaw swings toward the landmark, clamped to 35°', { rule: c.trophy.yawDeg, cam: c.yawDeg, want });
      await g(() => window.__gw.render.setTrophyTarget(null));
      await g(() => window.__gw.ui.closeAll?.());
      await settle(90);
      const back = await cam();
      check(Math.abs(back.yawDeg) < 1, 'after the shot the yaw eases back to north', back.yawDeg);
    }

    step('R2 the leap reveal goes through ctx.game.slowmo and restores 1');
    {
      await g(() => { const c = window.__gw; c.fishing.cancel('debug'); c.debug.fishHook('reedjaw_pike', { z: 2.2 }); window.__lr = []; });
      const res = await g(() => {
        const c = window.__gw, p = c.fishing.bobberPos || c.player.position;
        const LR = c.data.BALANCE.bite.leapReveal;
        // what fishing emits at the first breach of a Prize+ fish (fishing:reveal, P1b F3)
        c.bus.emit('fishing:reveal', { sizeClass: 'trophy', ancient: false, length: 112, lengthM: 1.12, position: { x: p.x, y: 0.6, z: p.z }, time: LR.time, timescale: LR.timescale });
        const b = c.debug.beats();
        return { LR, ts: c.time.timeScale, slowmo: b.slowmo };
      });
      check(Math.abs(res.ts - res.LR.timescale) < 1e-9 && res.slowmo.active && Math.abs(res.slowmo.left - res.LR.time) < 1e-9, 'the reveal runs at timescale 0.35 for 0.25 s', res);
      // a second start inside the same beat changes nothing (fishing and render may both ask)
      const again = await g(() => { const c = window.__gw; c.game.slowmo(0.25, 0.35); return { ts: c.time.timeScale, left: c.debug.beats().slowmo.left }; });
      check(Math.abs(again.ts - 0.35) < 1e-9 && again.left <= 0.25 + 1e-9, 'a second start in the same beat changes nothing', again);
      let restored = false;
      for (let i = 0; i < 60 && !restored; i++) { await frames(1); restored = await g(() => window.__gw.time.timeScale === 1 && !window.__gw.debug.beats().slowmo.active); }
      check(restored, 'the time scale is restored to 1 after the beat');
      await g(() => window.__gw.fishing.cancel('debug'));
    }
  }

  // ------------------------------------------------------------------ R2 with fishing's measuring ceremony (P1b F5 + actors A2)
  // Runs where fishing.startCeremony exists (the P1b staging merge); on this branch alone it logs a skip.
  if (want('ceremony')) {
    step('R2 the real ceremony: forced 0.2 m, 1.2 m and 8.5 m landings');
    const has = await g(() => typeof window.__gw.fishing.startCeremony === 'function' && typeof window.__gw.debug.cerRate === 'function');
    if (!has) log('skip: this build has no measuring ceremony (fishing P1b F5); the trophy rule is proven above');
    else {
      await clearModals();
      await g(() => { const c = window.__gw; c.fishing.cancel('debug'); if (c.state.run.phase !== 'calm') c.debug.setPhase('calm'); c.debug.god?.(true); });
      await clearModals();
      const cases = [
        { id: 'dusk_minnow', target: 0.2, want: 1.6, crane: false, pose: 'palm' },
        { id: 'reedjaw_pike', target: 1.2, want: 3.12, crane: false, pose: 'hang' },
        { id: 'lantern_swallower', target: 8.5, want: 14.8, crane: true, pose: 'alongside' },
      ];
      for (const k of cases) {
        await place(k.target > 4 ? 6 : 0, 30);
        await settle(6);
        const z = await g(([id, L]) => {
          const d = window.__gw.data, sp = d.SPECIES_BY_ID[id];
          let lo = -2, hi = 3.6;
          for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (d.sizeLength(sp, m) / 100 < L) lo = m; else hi = m; }
          return (lo + hi) / 2;
        }, [k.id, k.target]);
        // a slow ceremony clock so the beats can be photographed on software GL; the camera keeps real time
        const r = await g(([id, z]) => {
          const c = window.__gw;
          c.fishing.cancel('debug');
          c.debug.cerRate(0.3);
          window.__trophyCalls = [];
          if (!window.__trophySpy) {
            window.__trophySpy = true;
            const orig = c.render.setTrophyTarget;
            c.render.setTrophyTarget = (t) => { window.__trophyCalls?.push(t ? { length: t.length, landmark: t.landmark ?? null } : null); return orig(t); };
          }
          return c.debug.instantCatch(id, { z, ceremony: true });
        }, [k.id, z]);
        await waitFor(() => !!window.__gw.debug.ceremony?.()?.active, null, 30);
        // the shot settles during the pose / cord beats
        let c = null, cer = null;
        for (let i = 0; i < 240; i++) {
          await frames(1);
          [c, cer] = await g(() => [window.__gw.debug.camera(), window.__gw.debug.ceremony?.()]);
          // settled: the rule's distance and crane, and the focus spring has caught the posed subject
          const settled = c.mode === 'trophy' && Math.abs(c.cur.dist - k.want) < 0.03 && (!k.crane || Math.abs(c.cur.elev - 50) < 0.4)
            && Math.abs((c.trophy?.camToSubject ?? 0) - k.want) < 0.1;
          if (settled && cer?.posed) break;
          if (!cer?.active) break;
        }
        const calls = await g(() => window.__trophyCalls.slice());
        check(r && calls.length >= 1 && Math.abs(calls[0].length - k.target) < 0.002 && calls[0].landmark === null, `${k.target} m: fishing hands render the true length and no landmark (no place in P1)`, calls);
        check(c.mode === 'trophy' && Math.abs(c.cur.dist - k.want) < 0.05, `${k.target} m landing → the camera at ${k.want} m`, { dist: c.cur.dist, camToSubject: c.trophy?.camToSubject, pose: cer?.pose });
        check(Math.abs((c.trophy?.camToSubject ?? 0) - k.want) < 0.15, 'measured from the framed subject (the fish and the Wick)', c.trophy?.camToSubject);
        check(k.crane ? Math.abs(c.cur.elev - 50) < 0.6 : Math.abs(c.cur.elev - 18) < 0.6, k.crane ? 'cranes to 50° on the 8.5 m legend' : 'no crane', c.cur.elev);
        check(Math.abs(c.yawDeg) < 0.3, 'no place → the yaw stays north', c.yawDeg);
        check(cer?.pose === k.pose, `the ${k.pose} pose`, cer?.pose);
        await safeShot(`r2-ceremony-${String(k.target).replace('.', '_')}m`);
        // the card's turn: fishing clears the target; the shot holds under the card and eases back after it
        await g(() => window.__gw.debug.cerRate(1));
        await waitFor(() => !window.__gw.debug.ceremony?.()?.active, null, 200);
        await settle(12);
        const held = await g(() => ({ cam: window.__gw.debug.camera(), modal: window.__gw.debug.ui?.()?.openModal ?? null, blocking: !!window.__gw.ui.isBlocking?.(), calls: window.__trophyCalls.slice() }));
        check(held.calls[held.calls.length - 1] === null, 'fishing clears the target at the card\'s turn', held.calls);
        check(!held.blocking || (held.cam.mode === 'trophy' && held.cam.trophy?.hold), 'the trophy framing holds under the catch card', { modal: held.modal, mode: held.cam.mode });
        if (k.target === 1.2) await safeShot('r2-ceremony-card');
        await clearModals();
        await settle(90);
        const back = await cam();
        check(back.mode === 'sail', 'after the card the camera eases back to sail', back.mode);
      }
    }
  }

  step('errors');
  await noErrors();
  return { failures };
}
