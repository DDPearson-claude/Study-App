// Automatic fishing in the browser (DESIGN §25.14.2a F4′, F2′, F17; CONTRACT §13.7a) on a v3 phase-1 build, with screenshots to look at:
//
//   node build.mjs --dev --out=tools/out/af-fishing.html
//   node tools/playtest.mjs --html=tools/out/af-fishing.html --shots=tools/out/af-fishing/shots --script=tools/tests/af-fishing.scenario.mjs --width=960 --height=540
//   (… --mobile for a 390 × 844 phone; --only=release,trophy,elder,small,night picks steps)
//
// release: a v3 page without the debug switch exposes no hidden-state hook (fishing(), fishSeed, fishPlan, fishChance, fishOutcome …).
// trophy:  a real click strikes a Trophy's bite (the class tell, the last dip, the strike ring); the play: the class estimate at the
//          first glimpse, a leap as the night-ink proxy's backlit silhouette at its class length (presentLength), the lift, the
//          reveal (createFish is first called there), the ceremony and the card. No species field on any event or on the view until
//          fishing:caught; the raft stays anchored (movement keys held through the play move nothing but the tow).
// elder:   an Elder forced to lose (snapped): its last stand, the loss beat, fishing:escaped {reason, sizeClass} and, after the 0.6 s
//          quiet beat, fish:escaped {speciesId, approxLength …}.
// small:   a Small: no glimpse in the play but the skitter at the lift.
// night:   a Prize at night in Lantern: the backlit leap against the lantern-lit spray.
export default async function (api) {
  const { page, frames, evalGame: g, log } = api;
  const failures = [];
  const mobile = !!api.args?.mobile;
  const only = api.args?.only ? new Set(String(api.args.only).split(',')) : null;
  const want = (k) => !only || only.has(k);
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
  const fs = await import('node:fs');
  const dir = api.args?.shots ? String(api.args.shots) : 'tools/out/shots';
  fs.mkdirSync(dir, { recursive: true });
  const tag = mobile ? 'phone-' : '';
  const shot = async (name, { dom = false } = {}) => {
    const p = `${dir}/${tag}${name}.png`;
    if (dom) {   // game time stands still while the compositor catches up (a page screenshot can stall for minutes on software GL)
      const ts = await g(() => { const c = window.__gw, k = c.time.timeScale; c.debug.timeScale?.(0); return k; });
      try { await page.screenshot({ path: p, timeout: 150000 }); log('screenshot', p); await g((k) => window.__gw.debug.timeScale?.(k), ts); return; } catch (e) { log('dom shot failed, canvas instead', name, String(e?.message || e).slice(0, 60)); }
      await g((k) => window.__gw.debug.timeScale?.(k), ts);
    }
    try {
      const url = await g(() => { const c = window.__gw; c.render.render?.(); return c.render.renderer.domElement.toDataURL('image/png'); });
      fs.writeFileSync(p, Buffer.from(String(url).split(',')[1] || '', 'base64'));
      log('screenshot', p);
    } catch (e) { log('canvas shot failed', name, String(e?.message || e).slice(0, 90)); }
  };
  const base = page.url().split('?')[0];
  await page.addInitScript(() => { globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1; });

  // ===================================================================== release: no hidden state without the debug switch
  if (want('release')) {
    step('release: a v3 page without ?debug=1 exposes no hidden-state hook');
    await page.goto(`${base}?v3=1&v3phase=1`, { waitUntil: 'commit', timeout: 300000 });
    await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 300000 });
    const r = await g(() => { const d = window.__gw.debug; return { v3: window.__gw.data.V3_ENABLED, hidden: ['fishing', 'fishSeed', 'fishSigns', 'preroll', 'fishOutcome', 'fishPlan', 'fishChance', 'fishPlay', 'fishStrike'].filter((k) => typeof d[k] === 'function'), force: typeof d.forceBite }; });
    check(r.v3 === true && r.hidden.length === 0 && r.force === 'function', 'a release v3 page: no fishing(), fishSeed, fishPlan, fishChance, fishOutcome, preroll …', r);
  }

  step('reload with v3 on at phase 1 and the debug switch');
  await page.goto(`${base}?v3=1&v3phase=1&debug=1`, { waitUntil: 'commit', timeout: 300000 });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 300000 });
  let s = await g(() => ({ en: window.__gw.data.V3_ENABLED, ph: window.__gw.data.V3_PHASE, dbg: typeof window.__gw.debug.fishPlan }));
  check(s.en === true && s.ph === 1 && s.dbg === 'function', 'v3 phase-1 build with the debug hooks', s);

  await g(() => {
    const c = window.__gw;
    c.game.wipeAll?.();
    c.state.meta.runs = 1;
    c.game.startNewRun({ character: 'wick', nightMode: 'lantern' });
    // every fishing event and its moment; createFish calls with fishing's state at the call
    window.__ev = [];
    const json = (p) => { try { return JSON.parse(JSON.stringify(p, (k, v) => (v && typeof v === 'object' && (v.isObject3D || v.isVector3) ? (v.isVector3 ? { x: v.x, z: v.z } : undefined) : (k === 'fish' ? (v ? { uid: v.uid, speciesId: v.speciesId } : v) : v)))); } catch { return null; } };
    const origEmit = c.bus.emit.bind(c.bus);
    c.bus.emit = (e, p) => { if (/^fishing:|^fish:|^tip:show/.test(e)) window.__ev.push({ e, t: c.time.t, p: json(p), state: c.fishing.state, view: { sp: c.fishing.view.speciesId, ra: c.fishing.view.rarity } }); return origEmit(e, p); };
    window.__cf = [];
    const m = c.models, orig = m.createFish.bind(m);
    m.createFish = (id, w) => { window.__cf.push({ id, state: c.fishing.state, t: c.time.t }); return orig(id, w); };
  });
  await waitFor(() => window.__gw.flow === 'playing' && window.__gw.state.run?.active !== false, null, 300);
  await frames(20);
  if (api.args?.scale) await g((sc) => { try { window.__gw.debug.renderScale?.(sc); } catch { /* optional */ } }, Number(api.args.scale));
  const raft = { x: 0, z: 46 };
  const place = (p) => g((p) => { const c = window.__gw; c.player.position.set(p.x, 0, p.z); c.player.velocity?.set?.(0, 0, 0); }, p);
  await place(raft);
  await frames(6);
  const clearModals = async () => {
    for (let i = 0; i < 12; i++) {
      await frames(2);
      const m = await g(() => ({ m: window.__gw.debug.ui?.()?.openModal ?? null, b: !!window.__gw.ui.isBlocking?.(), p: !!window.__gw.paused }));
      if (!m.b && !m.p) return;
      if (m.m === 'levelup') await g(() => { const c = window.__gw, o = c.combat.pendingOptions; if (o?.length) c.combat.chooseBoon(o[0].boonId); else c.ui.closeAll?.(); });
      else await g(() => { const c = window.__gw; try { c.ui.closeAll?.(); if (c.paused) c.game.resume?.(); } catch { /* optional */ } });
    }
  };
  /** The hidden-information scan over one cast's events: nothing species-derived before fishing:caught / fish:escaped. */
  const scan = async (from, legendary = false) => g(([from, legendary]) => {
    const c = window.__gw, names = new Set(c.data.SPECIES.flatMap((s) => [s.id, s.name]));
    const out = [];
    for (const x of window.__ev.slice(from)) {
      if (x.e === 'fishing:caught' || x.e === 'fish:escaped' || x.e === 'fish:measured' || x.e === 'fish:landed') break;
      const str = JSON.stringify(x.p);
      if (!legendary && (/"(speciesId|rarity|species|name|odds|chance)"\s*:/.test(str) || [...names].some((n) => str.includes(`"${n}"`)))) out.push(`${x.e} ${str.slice(0, 100)}`);
      if (!legendary && (x.view.sp || x.view.ra)) out.push(`view on ${x.e}: ${x.view.sp}`);
    }
    return out;
  }, [from, legendary]);

  /** One cast: a forced bite (species, z), a REAL click on the canvas during the bite (main routes it to the strike), the play stepped
   *  on the clock, with screenshots at its moments. */
  const cast = async (name, speciesId, z, { outcome = null, cause = null, leap = null, shots = {}, holdKeys = false, at = 0.12 } = {}) => {
    const mark = await g(() => window.__ev.length);
    const cf0 = await g(() => window.__cf.length);
    const r0 = await g(() => ({ x: window.__gw.player.position.x, z: window.__gw.player.position.z }));
    await g(([sp, z, outcome, cause, leap]) => {
      const c = window.__gw;
      c.debug.fishSeed(20261105 + Math.round(z * 100));
      c.debug.fishOutcome(outcome, cause);
      if (leap != null) { window.__leapKeep = window.__leapKeep ?? {}; window.__leapKeep[sp] = c.data.AUTOFISH.leaps[sp]; c.data.AUTOFISH.leaps[sp] = leap; }
      c.debug.forceBite({ speciesId: sp, z, wait: 1.6 });
    }, [speciesId, z, outcome, cause, leap]);
    // the tell, the last dip and the "!"
    let tellShot = false;
    for (let i = 0; i < 400; i++) {
      const st = await g(() => ({ s: window.__gw.fishing.state, tell: window.__gw.fishing.view.biteTell }));
      if (shots.tell && !tellShot && st.s === 'waiting' && st.tell) { tellShot = true; await shot(`${name}-tell`, { dom: true }); }
      if (st.s === 'bite') break;
      await frames(1);
    }
    const biteAt = await g(() => window.__gw.time.t);
    if (shots.bite) await shot(`${name}-bite`, { dom: true });
    // a real click in the world view strikes (the whole screen is the target)
    for (let i = 0; i < 20; i++) { const tt = await g(() => window.__gw.time.t); if (tt - biteAt >= at) break; await frames(1); }
    const W = api.width, H = api.height;
    await page.mouse.click(W * 0.5, H * 0.42);
    await frames(2);
    const st0 = await g(() => ({ s: window.__gw.fishing.state, grade: window.__gw.fishing.view.strike, plan: window.__gw.debug.fishPlan() }));
    check(st0.s === 'reeling' && !!st0.grade, `${name}: a click during the bite strikes (${st0.grade})`, st0.s);
    const plan = st0.plan;
    if (!plan) return null;
    if (holdKeys) await page.keyboard.down('KeyW');
    // step the play; screenshots at its moments (time slows near a moment so software GL catches it)
    const taken = new Set();
    const firstLeap = plan.events.find((e) => e.phase === 'leap'), firstGlimpse = plan.events.find((e) => e.phase === 'glimpse' && e.first);
    const ls = plan.lastStands?.[0];
    for (let i = 0; i < 2000; i++) {
      const v = await g(() => { const c = window.__gw, f = c.fishing, p = c.debug.fishPlay(); return { s: f.state, t: p?.t ?? null, play: f.view.play, sc: f.view.sizeClass, sp: f.view.speciesId, cer: !!c.debug.ceremony?.()?.active, prox: c.debug.fishFx?.()?.proxyState }; });
      if (v.s !== 'reeling' && v.s !== 'landing' && v.s !== 'lost') break;
      const near = (ev, lead = 0.6) => ev && v.t != null && v.t > ev.at - lead && v.t < ev.at + ev.dur;
      const slow = near(firstLeap, 0.3) || v.s === 'landing';
      await g((k) => window.__gw.debug.timeScale?.(k), slow ? 0.8 : 3);
      if (shots.glimpse && !taken.has('glimpse') && v.play?.glimpse && v.sc) { taken.add('glimpse'); await shot(`${name}-glimpse`); }
      if (shots.leap && !taken.has('leap') && v.play?.leap && v.prox?.visible && v.prox.y > 0.25) { taken.add('leap'); await shot(`${name}-leap`); await shot(`${name}-leap-hud`, { dom: true }); }
      if (shots.lastStand && !taken.has('lastStand') && v.play?.phase === 'lastStand') { taken.add('lastStand'); await shot(`${name}-laststand`); }
      if (shots.lift && !taken.has('lift') && v.play?.phase === 'lift' && v.prox?.visible) { taken.add('lift'); await shot(`${name}-lift`); }
      if (shots.reveal && !taken.has('reveal') && v.s === 'landing' && !v.cer) { taken.add('reveal'); await shot(`${name}-reveal`); }
      if (shots.ceremony && !taken.has('cer') && v.cer) { const ce = await g(() => window.__gw.debug.ceremony()); if (ce.t > ce.dur * 0.55) { taken.add('cer'); await shot(`${name}-ceremony`, { dom: true }); } }
      if (shots.loss && !taken.has('loss') && v.s === 'lost') { taken.add('loss'); await shot(`${name}-loss`); }
      await frames(1);
    }
    if (holdKeys) await page.keyboard.up('KeyW');
    await g(() => window.__gw.debug.timeScale?.(1));
    const res = await g(([mark, cf0]) => ({ ev: window.__ev.slice(mark), cf: window.__cf.slice(cf0), errs: window.__gw.errors.slice() }), [mark, cf0]);
    const r1 = await g(() => ({ x: window.__gw.player.position.x, z: window.__gw.player.position.z }));
    const leaks = await scan(mark);
    check(leaks.length === 0, `${name}: no species id, name, rarity or odds on any event or on the view before the reveal / the note`, leaks.slice(0, 3));
    const caught = res.ev.find((x) => x.e === 'fishing:caught');
    if (caught) {
      const early = res.cf.filter((x) => x.state !== 'landing');
      check(early.length === 0 && res.cf.some((x) => x.id === speciesId), `${name}: createFish is first called at the reveal (${res.cf.map((x) => `${x.id}@${x.state}`).join(', ')})`);
      check(caught.p.grade && caught.p.speciesId === speciesId, `${name}: fishing:caught names it, with the strike grade (${caught.p.grade})`);
    }
    if (holdKeys) {
      const moved = Math.hypot(r1.x - r0.x, r1.z - r0.z);
      check(Math.abs(moved - (plan.tow || 0)) < 0.35, `${name}: W held through the play: the raft moved ${moved.toFixed(2)} m (the plan's tow ${plan.tow} m)`);
    }
    if (leap != null) await g((sp) => { const c = window.__gw; c.data.AUTOFISH.leaps[sp] = window.__leapKeep[sp]; }, speciesId);
    await g(() => window.__gw.debug.fishOutcome(null));
    await clearModals();
    for (let i = 0; i < 60; i++) { if (await g(() => window.__gw.fishing.state === 'idle')) break; await frames(1); }
    return { plan, ev: res.ev, errs: res.errs };
  };

  // ===================================================================== a Trophy, landed (the whole beat)
  if (want('trophy')) {
    step('trophy: tell → click → play (glimpse, leap, lift) → reveal → ceremony');
    await g(() => { window.__gw.state.meta.settings.strikeRing = 'always'; });
    const r = await cast('trophy', 'reedjaw_pike', 2.3, { outcome: 'land', leap: 1, holdKeys: !mobile, shots: { tell: true, bite: true, glimpse: true, leap: true, lift: true, reveal: true, ceremony: true } });
    if (r) {
      const names = r.ev.map((x) => x.e);
      check(names.includes('fishing:tell') && names.includes('fishing:bite') && names.includes('fishing:strike') && names.includes('fishing:hook') && names.filter((n) => n === 'fishing:reel').length >= 8 && names.includes('fishing:caught'),
        'the events: tell, bite, strike, hook, the play\'s fishing:reel beats, caught', [...new Set(names)]);
      const tell = r.ev.find((x) => x.e === 'fishing:tell');
      check(tell?.p.lastDip === 0.25 && tell.p.biteTell === 'flatSlide', `the Trophy's tell: ${tell?.p.biteTell}, the 0.25 s last dip`, tell?.p);
      const leapEv = r.ev.find((x) => x.e === 'fishing:reel' && x.p.phase === 'leap');
      const pl = await g(() => window.__gw.data.presentLength('mossmere', 2.3));
      check(!!leapEv && Math.abs(leapEv.p.length - pl) < 0.002, `a leap carries the class length (${leapEv?.p.length} m = presentLength)`);
      const slow = await g(() => window.__gw.debug.beats?.());
      log('beats', JSON.stringify(slow));
    }
    await g(() => { window.__gw.state.meta.settings.strikeRing = 'firstExpedition'; });
  }

  // ===================================================================== an Elder, lost (snapped)
  if (want('elder')) {
    step('elder: the last stand, the loss, the quiet beat, fish:escaped');
    const r = await cast('elder', 'reedjaw_pike', 2.95, { outcome: 'lose', cause: 'snapped', leap: 0, shots: { lastStand: true, loss: true } });
    if (r) {
      const esc = r.ev.find((x) => x.e === 'fishing:escaped'), note = r.ev.find((x) => x.e === 'fish:escaped');
      check(esc && esc.p.reason === 'snapped' && esc.p.sizeClass === 'elder' && !('speciesId' in esc.p), `fishing:escaped {reason, sizeClass} at the loss, no species (${JSON.stringify(esc?.p)})`);
      check(note && note.p.speciesId === 'reedjaw_pike' && note.p.reason === 'snapped' && note.p.approxLength > 0 && note.t - esc.t >= 0.6 * 0.35 - 0.05,
        `fish:escaped after the quiet beat names it, near ${note?.p.approxLength} cm (${(note?.t - esc?.t).toFixed(2)} s of real clock at slowed time)`);
      check(r.plan.lastStands.length === 1 && r.ev.some((x) => x.e === 'fishing:reel' && x.p.phase === 'lastStand'), 'the Elder\'s last stand played');
    }
    await shot('elder-after-note', { dom: true });
  }

  // ===================================================================== a Small: the skitter
  if (want('small')) {
    step('small: no glimpse in the play, the skitter at the lift (the class estimate)');
    const r = await cast('small', 'dusk_minnow', -1.2, { outcome: 'land', shots: { lift: true, reveal: true } });
    if (r) {
      const sk = r.ev.filter((x) => x.e === 'fishing:reel' && x.p.phase === 'glimpse');
      check(sk.length === 1 && sk[0].p.kind === 'skitter', `the only glimpse is the skitter (${sk.map((x) => x.p.kind).join()})`);
    }
  }

  // ===================================================================== night: a Prize's leap, backlit
  if (want('night')) {
    step('night: a Prize leaps at night in Lantern');
    await g(() => { const c = window.__gw; c.debug.setPhase?.('gloomtide'); c.survival?.setPhase?.('gloomtide'); });
    await frames(30);
    await clearModals();
    await g(() => { const c = window.__gw; c.combat?.killAll?.('dawn'); });
    const r = await cast('night', 'weeping_carp', 1.6, { outcome: 'land', leap: 1, shots: { leap: true, glimpse: true } });
    if (r) check(r.ev.some((x) => x.e === 'fishing:reel' && x.p.phase === 'leap'), 'the night play leapt');
  }

  const errs = await g(() => window.__gw.errors.slice());
  check(errs.length === 0, 'ctx.errors stays empty', errs.slice(0, 5));
  log(`done in ${((Date.now() - t0) / 1000).toFixed(0)} s; ${failures.length} failure(s)`);
  return { failures };
}
