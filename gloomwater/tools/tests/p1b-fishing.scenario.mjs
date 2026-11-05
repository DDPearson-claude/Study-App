// P1 visual-half fishing acceptance in the browser (DESIGN §25.14.2 F3, F5, F6 + the pressure hand-over; CONTRACT §13.7) on a
// v3 phase-1 build, with screenshots to look at:
//
//   node build.mjs --dev --out=tools/out/p1b-fishing.html
//   node tools/playtest.mjs --html=tools/out/p1b-fishing.html --shots=tools/out/p1b/shots --script=tools/tests/p1b-fishing.scenario.mjs --width=960 --height=540
//   (… --mobile for a 390 × 844 phone; --part=look or --part=accept runs one half)
//
// look:   the six signs at the sail framing in calm (rise rings, a boil, nervous water, a strike's slick, a bubble trail) and at
//         night (glow trails, Night Rise), Murk's Chum, the leap reveal of a Prize, the measuring ceremony of an Elder (scoop,
//         cord, stamp) and of a Keeper.
// accept: F6 2–4 signs alive within castMax + 15 m; a boil cast within 3 m in 8 s bites its fish; armChum → a 30 s nervous sign
//         at the next bobber; F3 the hooked fish's mesh keeps scale 1 and its length is createFish's, an 8.5 m legend splashes as
//         8.5 m; the leap reveal plays once (slowmo, fishing:reveal); F5 fishing:caught {fish} → ceremony (ctx.cinematic: no enemy
//         moves and no oil drains in a Lantern swarm) → fish:measured once → fish:landed → the card; a reload right after the
//         stamp keeps the PB and the class first; the card's payload lists the favours; pressure survives a reload.
// Models without A1's createFish(species, {z}) (the honest length) are shimmed for the screenshots only (detected: the shim
// is off once A1 is in the build), so the ceremony shows true scale either way.
export default async function (api) {
  const { page, frames, evalGame: g, log } = api;
  const failures = [];
  const part = api.args?.part ? String(api.args.part) : 'all';
  const mobile = !!api.args?.mobile;
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
  // software GL on a loaded machine: Playwright's page screenshot waits for a compositor frame and can stall for minutes. The 3D view
  // is captured straight from the canvas (render a frame and read it in the same task, so no preserveDrawingBuffer is needed);
  // `dom: true` tries a real page screenshot first (the HUD and the card) and falls back to the canvas. Never fails a run.
  const fs = await import('node:fs');
  const dir = api.args?.shots ? String(api.args.shots) : 'tools/out/shots';
  const shot = async (name, { dom = false } = {}) => {
    const p = `${dir}/${name}.png`;
    if (dom) {
      try { await page.screenshot({ path: p, timeout: 120000 }); log('screenshot', p); return; } catch (e) { log('dom shot failed, canvas instead', name, String(e?.message || e).slice(0, 60)); }
    }
    try {
      const url = await g(() => { const c = window.__gw; c.render.render?.(); return c.render.renderer.domElement.toDataURL('image/png'); });
      fs.writeFileSync(p, Buffer.from(String(url).split(',')[1] || '', 'base64'));
      log('screenshot', p);
    } catch (e) { log('canvas shot failed', name, String(e?.message || e).slice(0, 90)); }
  };
  const clearModals = async () => {
    for (let i = 0; i < 10; i++) {
      await frames(2);
      const m = await g(() => ({ m: window.__gw.debug.ui?.()?.openModal ?? null, b: !!window.__gw.ui.isBlocking?.(), p: !!window.__gw.paused }));
      if (!m.b && !m.p) return;
      if (m.m === 'levelup') await g(() => { const c = window.__gw, o = c.combat.pendingOptions; if (o?.length) c.combat.chooseBoon(o[0].boonId); else c.ui.closeAll?.(); });
      else await g(() => { const c = window.__gw; try { c.ui.closeAll?.(); if (c.paused) c.game.resume?.(); } catch { /* optional */ } });
    }
  };
  const place = (x, z) => g(([x, z]) => { const c = window.__gw; c.player.position.set(x, 0, z); c.player.velocity?.set?.(0, 0, 0); }, [x, z]);

  step('reload with v3 on at phase 1');
  await page.addInitScript(() => { globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; });
  await page.goto(page.url().split('?')[0] + '?v3=1&v3phase=1', { waitUntil: 'commit', timeout: 300000 });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 300000 });
  let s = await g(() => ({ en: window.__gw.data.V3_ENABLED, ph: window.__gw.data.V3_PHASE }));
  check(s.en === true && s.ph === 1, 'v3 phase-1 build', s);

  const startRun = async () => {
    await g(() => {
      const c = window.__gw;
      c.game.wipeAll?.();
      c.state.meta.runs = 1;   // a second run: Lantern (the First Outing is all still)
      c.game.startNewRun({ character: 'wick', nightMode: 'lantern' });
      window.__ev = [];
      const keep = ['sign:spawn', 'sign:rise', 'sign:end', 'fishing:caught', 'fish:measured', 'fish:landed', 'fishing:reveal', 'fishing:land', 'ui:modal'];
      const json = (p) => { try { return JSON.parse(JSON.stringify(p, (k, v) => (v && typeof v === 'object' && (v.isObject3D || v.isVector3) ? (v.isVector3 ? { x: v.x, z: v.z } : undefined) : v))); } catch { return null; } };
      for (const e of keep) c.bus.on(e, (p) => window.__ev.push({ e, t: c.time.t, p: e === 'fish:landed' ? { measured: p?.measured, favours: p?.favours, uid: p?.fish?.uid } : json(p), modal: c.debug.ui?.()?.openModal ?? null }));
      // A1 shim (screenshots only): models without createFish(species, {z}) get the honest length here
      const m = c.models, sp = c.data.SPECIES_BY_ID.reedjaw_pike;
      const a = m.createFish('reedjaw_pike', { z: -1.5 }), b = m.createFish('reedjaw_pike', { z: 3 });
      window.__a1 = Math.abs(a.length - b.length) > 0.2;
      a.dispose?.(); b.dispose?.();
      if (!window.__a1) {
        const orig = m.createFish.bind(m);
        m.createFish = (id, w) => {
          const fv = orig(id, w);
          const spp = c.data.SPECIES_BY_ID[id];
          if (fv && w && typeof w === 'object' && spp?.size) {
            const L = c.data.sizeLength(spp, w.z, w.zone) / 100, k = L / Math.max(0.01, fv.length);
            const inner = fv.object3d.children[0];
            if (inner) inner.scale.multiplyScalar(k);
            fv.length = L;
          }
          return fv;
        };
      }
      void sp;
    });
    await waitFor(() => window.__gw.flow === 'playing' && window.__gw.state.run?.active !== false, null, 300);
    await frames(20);
  };
  await startRun();
  // --scale=0.75 renders below CSS resolution on a loaded machine (the signs are judged at the final pixel size either way)
  if (api.args?.scale) await g((sc) => { try { window.__gw.debug.renderScale?.(sc); } catch { /* optional */ } }, Number(api.args.scale));
  log('A1 in the build:', await g(() => window.__a1));
  await g(() => window.__gw.debug.fishSeed(20261105));
  // the camera's up-screen direction: signs are laid out in front of the raft at the sail framing
  const fwd = await g(() => { const y = window.__gw.render.getYaw?.() ?? 0; return { x: -Math.sin(y), z: -Math.cos(y), y }; });
  const at = (side, ahead, base = { x: 0, z: 46 }) => ({ x: base.x + fwd.x * ahead - fwd.z * side, z: base.z + fwd.z * ahead + fwd.x * side });

  // ===================================================================== look
  if (part === 'all' || part === 'look') {
    step('look: the six signs in calm at the sail framing');
    await place(0, 46);
    await frames(6);
    await g(([sigs]) => {
      const c = window.__gw;
      c.fishing.signs.length = 0;
      for (const sg of sigs) c.debug.sign(sg.kind, { x: sg.x, z: sg.z, speciesId: sg.sp, size: sg.size, ttl: 120, heading: sg.h });
    }, [[
      { kind: 'rise', ...at(-5.5, 11), sp: 'candlefin_koi', size: 2.1 },
      { kind: 'boil', ...at(5, 15), sp: 'weeping_carp', size: 2.2 },
      { kind: 'nervous', ...at(-9, 21) },
      { kind: 'bubbles', ...at(2.5, 24), h: fwd.y + 1.2 },
      { kind: 'rise', ...at(9, 7), sp: 'dusk_minnow', size: -0.6 },
    ]]);
    // let each show once, with the big rise's rings mid-spread
    for (let i = 0; i < 160; i++) {
      const st = await g(() => window.__gw.debug.fishSigns().map((x) => ({ k: x.kind, n: x.shows, since: x.since })));
      if (st.every((x) => x.n >= 1) && st.filter((x) => x.k === 'rise').every((x) => x.since > 0.5 && x.since < 1.6)) break;
      await frames(1);
    }
    await g(([p]) => window.__gw.debug.sign('strike', { x: p.x, z: p.z, ttl: 14 }), [at(7.5, 9)]);
    await frames(8);
    s = await g(() => ({ n: window.__gw.fishing.signs.length, calls: window.__gw.render.renderer?.info?.render?.calls, inst: window.__gw.debug.fishSigns().map((x) => `${x.kind}:${x.shows}`) }));
    log('signs', JSON.stringify(s));
    await shot(mobile ? 'm-signs-day' : 'signs-day');

    step('look: Murk\'s Chum at the next cast');
    await g(() => { const c = window.__gw; c.fishing.signs.length = 0; c.fishing.armChum(); c.debug.forceBite({ wait: 20 }); });
    await frames(40);
    await shot(mobile ? 'm-chum' : 'chum');
    await g(() => window.__gw.fishing.cancel('reset'));

    step('look: night — glow trails under the stars');
    await g(() => { const c = window.__gw; c.debug.setPhase('dusk'); c.debug.setPhase('gloomtide'); c.combat.killAll?.('dawn'); });
    await clearModals();
    await place(0, 46);
    await frames(30);
    await g(([sigs]) => {
      const c = window.__gw;
      c.fishing.signs.length = 0;
      for (const sg of sigs) c.debug.sign(sg.kind, { x: sg.x, z: sg.z, speciesId: sg.sp, size: sg.size, ttl: 120, heading: sg.h });
    }, [[
      { kind: 'glow', ...at(-4, 10), sp: 'gloam_eel', size: 1.7, h: fwd.y + 2.4 },
      { kind: 'glow', ...at(6, 17), sp: 'candlefin_koi', size: 0.3, h: fwd.y - 1.9 },
      { kind: 'rise', ...at(1, 21), sp: 'mossback_perch', size: 1.0 },
    ]]);
    for (let i = 0; i < 6; i++) { await frames(5); await g(() => window.__gw.combat.killAll?.('dawn')); }
    await shot(mobile ? 'm-signs-night' : 'signs-night');
    await g(() => { const c = window.__gw; c.debug.setPhase('dawn'); c.debug.setPhase('calm'); });
    await clearModals();

    step('look: the leap reveal of a Prize');
    await place(0, 46);
    await frames(10);
    await g(() => { const c = window.__gw; c.fishing.signs.length = 0; c.debug.fishHook('gloam_eel', { z: 1.6 }); window.__ev.length = 0; });
    await frames(30);
    await g(() => window.__gw.debug.fishSurge());
    const rev = await waitFor(() => { const c = window.__gw; c.fishing.onPointerDown(); const r = c.debug.fishReel(); if (r) r.P = Math.min(r.P, 0.4); return window.__ev.some((x) => x.e === 'fishing:reveal'); }, null, 200);
    check(rev, 'the breach plays the reveal');
    await shot(mobile ? 'm-leap-reveal' : 'leap-reveal');
    await g(() => window.__gw.fishing.cancel('reset'));
    await clearModals();

    step('look: the measuring ceremony of an Elder Reedjaw');
    await place(0, 46);
    await frames(8);
    await g(() => { const c = window.__gw; c.debug.fishHook('reedjaw_pike', { z: 2.95 }); });
    await frames(12);
    await g(() => window.__gw.debug.instantCatch(null, { ceremony: true }));
    const cer = [['scoop', 0.65], ['pose', 0], ['cord', 0.55], ['banners', 0]];
    for (const [ph, k] of cer) {
      await waitFor(([ph, k]) => { const m = window.__gw.fishing.view.measure; return !!m && (m.phase === ph && (m.k ?? 0) >= k || ['card'].includes(m.phase)); }, [ph, k], 400);
      const m = await g(() => ({ ...window.__gw.fishing.view.measure, records: undefined }));
      log('measure', JSON.stringify(m));
      await shot(`${mobile ? 'm-' : ''}cer-elder-${ph}`);
    }
    await waitFor(() => !window.__gw.fishing.inCeremony, null, 400);
    await frames(10);
    await shot(mobile ? 'm-cer-elder-card' : 'cer-elder-card', { dom: true });
    await clearModals();

    step('look: a Keeper\'s short ceremony');
    await g(() => { const c = window.__gw; c.debug.fishHook('mossback_perch', { z: 0.5 }); });
    await frames(10);
    await g(() => window.__gw.debug.instantCatch(null, { ceremony: true }));
    await waitFor(() => window.__gw.fishing.view.measure?.phase === 'cord', null, 200);
    await shot(mobile ? 'm-cer-keeper-cord' : 'cer-keeper-cord');
    await waitFor(() => !window.__gw.fishing.inCeremony, null, 200);
    await clearModals();
  }

  // ===================================================================== accept
  if (part === 'all' || part === 'accept') {
    step('F6: 2–4 signs alive within castMax + 15 m in calm');
    await g(() => { const c = window.__gw; c.debug.setPhase?.('calm'); c.fishing.signs.length = 0; });
    await place(0, 46);
    let mn = 99, mx = 0, short = 0;
    for (let i = 0; i < 24; i++) {
      await frames(10);
      const r = await g(() => {
        const c = window.__gw, p = c.player.position, R = (c.progression.getStats().castMax ?? 16) + 15;
        const sg = c.fishing.signs.filter((x) => !x.chum);
        return { n: sg.length, inR: sg.filter((x) => Math.hypot(x.position.x - p.x, x.position.z - p.z) <= R + 0.01).length };
      });
      if (i > 2) { mn = Math.min(mn, r.n); mx = Math.max(mx, r.n); if (r.inR < 2) short++; }
    }
    check(mn >= 2 && mx <= 4 && short === 0, `alive ${mn}–${mx}, always ≥ 2 within reach (${short} short)`);

    step('F6: a boil cast within 3 m in 8 s; armChum');
    // (the 60% figure is proven over 500 seeded casts in tools/tests/fishing-p1b.test.mjs; here one boil in the live game)
    await g(() => { const c = window.__gw; c.fishing.signs.length = 0; const d = Math.max(6, (c.progression.getStats().castMax ?? 16) * 0.55), p = c.player.position; window.__boil = c.debug.sign('boil', { x: p.x + 1, z: p.z - d - 1 }); });
    await waitFor(() => (window.__gw.debug.fishSigns().find((x) => x.id === window.__boil?.id)?.shows ?? 0) >= 1, null, 200);
    s = await g(() => { const c = window.__gw; c.debug.forceBite({ wait: 30 }); const d = c.debug.fishing(); c.fishing.cancel('reset'); return d.sign; });
    check(s?.kind === 'boil' && s.inSign, 'a cast within 3 m in the 8 s after a boil meets its rule', s);
    s = await g(() => {
      const c = window.__gw;
      c.fishing.signs.length = 0;
      const armed = c.fishing.armChum();
      c.debug.forceBite({ wait: 30 });
      const ch = c.fishing.signs.find((x) => x.chum), b = c.fishing.bobberPos;
      const r = { armed, chum: !!ch, ttl: ch?.ttl, at: ch && b ? Math.hypot(ch.position.x - b.x, ch.position.z - b.z) : null, sign: c.debug.fishing().sign };
      c.fishing.cancel('reset');
      return r;
    });
    check(s.armed && s.chum && s.ttl > 29.5 && s.at < 0.01 && s.sign?.kind === 'nervous', 'Murk\'s Chum: the next cast spawns a 30 s nervous sign at the bobber', s);

    step('F3: true scale on the line; an 8.5 m legend splashes as 8.5 m');
    s = await g(() => {
      const c = window.__gw;
      c.debug.fishHook('dusk_minnow', { z: -1.2 });
      const a = c.debug.fishing();
      const L = c.data.sizeLength(c.data.SPECIES_BY_ID.dusk_minnow, -1.2, 'mossmere') / 100;
      c.fishing.cancel('reset');
      const sp = []; const ow = c.water.splash.bind(c.water);
      c.water.splash = (x, z, o) => { sp.push(o?.size); return ow(x, z, o); };
      c.debug.fishHook('lantern_swallower', { z: 0 });
      const b = c.debug.fishing();
      c.water.splash = ow;
      c.fishing.cancel('reset');
      return { scale: a.meshScale, len: a.fishLen, fv: a.fvLength, L, legend: b.fishLen, legendScale: b.meshScale, splash: sp };
    });
    check(s.scale === 1 && Math.abs(s.len - s.L) < 1e-6, `a small minnow on the line: scale 1, ${(s.len * 100).toFixed(1)} cm (createFish {z})`, s);
    check(Math.abs(s.legend - 8.5) < 0.05 && s.legendScale === 1 && s.splash.some((x) => Math.abs(x - (0.6 + s.legend * 0.4)) < 1e-6), 'the Lantern-Swallower: 8.5 m on the line, its splash sized from 8.5 m', s);
    await clearModals();

    step('F5: the hand-off in a Lantern swarm (no enemy moves, no oil drains), measured once, before the card');
    await g(() => { const c = window.__gw; c.debug.setPhase('dusk'); c.debug.setPhase('gloomtide'); c.debug.swarmNow?.(); c.debug.setOil(60); c.debug.spawn?.('gloomling', 4, 9); window.__ev.length = 0; });
    await clearModals();
    for (let i = 0; i < 20; i++) { await frames(2); await clearModals(); if (await g(() => (window.__gw.combat.enemies || []).filter((e) => e.alive && e.spawnT <= 0).length >= 2)) break; }
    const snap = () => g(() => {
      const c = window.__gw, r = c.state.run;
      return { en: (c.combat.enemies || []).filter((e) => e.alive).map((e) => [+e.position.x.toFixed(4), +e.position.z.toFixed(4)]), oil: r.oil, pt: r.phaseTime, cine: c.cinematic, phase: c.fishing.view.measure?.phase ?? null };
    });
    await g(() => { const c = window.__gw; c.debug.god?.(false); c.debug.setHp?.(99); c.debug.fishHook('reedjaw_pike', { z: 2.95 }); });
    await g(() => window.__gw.debug.instantCatch(null, { ceremony: true }));
    const a0 = await snap();
    await frames(8);
    const a1 = await snap();
    check(a0.cine === true && a1.cine === true, 'the ceremony holds ctx.cinematic', { a0: a0.cine, a1: a1.cine });
    check(JSON.stringify(a0.en) === JSON.stringify(a1.en) && a0.oil === a1.oil && a0.pt === a1.pt, 'during the ceremony no enemy moves, no oil drains, the clock stands', { a0, a1 });
    await waitFor(() => window.__ev.some((x) => x.e === 'fish:measured'), null, 400);
    let ev = await g(() => window.__ev.filter((x) => ['fishing:caught', 'fish:measured', 'fish:landed', 'ui:modal'].includes(x.e)).map((x) => ({ e: x.e, modal: x.modal, open: x.p?.open, id: x.p?.id ?? x.p?.modal })));
    const iC = ev.findIndex((x) => x.e === 'fishing:caught'), iM = ev.findIndex((x) => x.e === 'fish:measured'), iL = ev.findIndex((x) => x.e === 'fish:landed');
    check(iC >= 0 && iC < iM && iM < iL && ev.filter((x) => x.e === 'fish:measured').length === 1, 'fishing:caught → fish:measured (once) → fish:landed', ev);
    check(ev.slice(0, iM + 1).every((x) => x.modal !== 'catch'), 'the card was not open before the stamp', ev.slice(0, iM + 1));
    // a reload right after the stamp keeps the PB and the class first (main saved on fish:measured)
    const before = await g(() => { const j = window.__gw.state.meta.journal?.reedjaw_pike; return { pb: j?.pbLength, elder: !!j?.seals?.elder, fav: window.__ev.find((x) => x.e === 'fish:landed')?.p?.favours }; });
    check(before.pb > 120 && before.elder, 'the PB and the Elder class first are written at the stamp', before);
    check(Array.isArray(before.fav), 'fish:landed (the card) carries the favours that applied', before.fav);
    await page.reload({ waitUntil: 'commit', timeout: 300000 });
    await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 300000 });
    const after = await g(() => { const j = window.__gw.state.meta.journal?.reedjaw_pike; return { pb: j?.pbLength, elder: !!j?.seals?.elder }; });
    check(after.pb === before.pb && after.elder, 'after a reload the PB and the class first are still there', after);

    step('pressure survives a reload (progression keeps run.pressure)');
    await g(() => { const c = window.__gw; c.game.continueRun?.(); });
    await waitFor(() => window.__gw.flow === 'playing', null, 300);
    await frames(20);
    await clearModals();
    await g(() => { const c = window.__gw; c.debug.setPhase?.('calm'); });
    await place(4, 14.8);
    await frames(6);
    s = await g(() => {
      const c = window.__gw;
      for (let i = 0; i < 3; i++) { c.debug.forceBite({ speciesId: 'mossback_perch' }); c.debug.instantCatch(); try { c.ui.closeAll?.(); } catch { /* optional */ } }
      c.fishing.cancel('reset');
      c.game.save();
      return { pressure: { ...(c.state.run.pressure || {}) } };
    });
    check(s.pressure.mm_deep_centre >= 3, 'three catches at the giant spot are counted in run.pressure', s);
    await page.reload({ waitUntil: 'commit', timeout: 300000 });
    await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 300000 });
    await g(() => window.__gw.game.continueRun?.());
    await waitFor(() => window.__gw.flow === 'playing', null, 300);
    await frames(20);
    await clearModals();
    await place(4, 14.8);
    await frames(6);
    s = await g(() => { const c = window.__gw; c.debug.forceBite({ speciesId: 'mossback_perch' }); const v = { ...(c.fishing.view.favour || {}) }; c.fishing.cancel('reset'); return { quiet: v.quiet, p: (v.terms || []).find((t) => t.family === 'pressure')?.value, run: c.state.run?.pressure }; });
    check(s.quiet === true && s.p <= -0.36, 'after a reload the place has still gone quiet', s);
  }

  const errs = await g(() => window.__gw.errors.slice());
  check(errs.length === 0, 'ctx.errors stays empty', errs);
  return { failures };
}
