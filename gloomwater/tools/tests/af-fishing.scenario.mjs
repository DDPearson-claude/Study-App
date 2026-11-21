// Automatic fishing in the browser (DESIGN §25.14.2a F4′, F2′, F17; CONTRACT §13.7a) on a v3 phase-1 build, with screenshots to look at:
//
//   node build.mjs --dev --out=tools/out/af-fishing.html
//   node tools/playtest.mjs --html=tools/out/af-fishing.html --shots=tools/out/af-fishing/shots --script=tools/tests/af-fishing.scenario.mjs --width=960 --height=540
//   (… --mobile for a 390 × 844 phone; --only=release,trophy,elder,small,night picks steps)
//
// The play is stepped and captured INSIDE the page (a requestAnimationFrame loop renders and reads the canvas at each moment), so a
// loaded software-GL machine costs no round trip per frame and no page screenshot (which can stall for minutes).
//
// release: a v3 page without the debug switch exposes no hidden-state hook (fishing(), fishSeed, fishPlan, fishChance, fishOutcome …).
// trophy:  a REAL mouse click strikes a Trophy's bite (the class tell, the last dip, the strike ring); the play: the class estimate at the
//          first glimpse, a leap as the night-ink proxy's backlit silhouette at its class length (presentLength), the lift, the
//          reveal (createFish is first called there), the ceremony. No species field on any event or on the view until fishing:caught;
//          the raft stays anchored (W held through the play moves nothing but the plan's tow).
// elder:   an Elder forced to lose (snapped): its last stand, the loss beat, fishing:escaped {reason, sizeClass} and, after the 0.6 s
//          quiet beat, fish:escaped {speciesId, approxLength …}.
// small:   a Small: no glimpse in the play but the skitter at the lift.
// night:   a Prize at night in Lantern: the backlit leap.
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
  const fs = await import('node:fs');
  const dir = api.args?.shots ? String(api.args.shots) : 'tools/out/shots';
  fs.mkdirSync(dir, { recursive: true });
  const tag = mobile ? 'phone-' : '';
  const save = (name, url) => { if (!url) return; const p = `${dir}/${tag}${name}.png`; fs.writeFileSync(p, Buffer.from(String(url).split(',')[1] || '', 'base64')); log('screenshot', p); };
  /** Resolve when `cond` (source of (c) => bool, run every frame in the page) holds, or after maxMs. */
  const until = (cond, maxMs = 120000) => g(([src, maxMs]) => new Promise((res) => {
    const f = new Function('c', `return (${src})(c);`), t00 = performance.now();
    const tick = () => { let v = false; try { v = f(window.__gw); } catch { v = false; } if (v || performance.now() - t00 > maxMs) res(!!v); else requestAnimationFrame(tick); };
    tick();
  }), [cond.toString(), maxMs]);
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
  const s = await g(() => ({ en: window.__gw.data.V3_ENABLED, ph: window.__gw.data.V3_PHASE, dbg: typeof window.__gw.debug.fishPlan }));
  check(s.en === true && s.ph === 1 && s.dbg === 'function', 'v3 phase-1 build with the debug hooks', s);

  await g(() => {
    const c = window.__gw;
    c.game.wipeAll?.();
    c.state.meta.runs = 1;
    c.game.startNewRun({ character: 'wick', nightMode: 'lantern' });
    window.__ev = [];
    const json = (p) => { try { return JSON.parse(JSON.stringify(p, (k, v) => (v && typeof v === 'object' && (v.isObject3D || v.isVector3) ? (v.isVector3 ? { x: v.x, z: v.z } : undefined) : (k === 'fish' ? (v ? { uid: v.uid, speciesId: v.speciesId } : v) : v)))); } catch { return null; } };
    const origEmit = c.bus.emit.bind(c.bus);
    c.bus.emit = (e, p) => { if (/^fishing:|^fish:|^tip:show/.test(e)) window.__ev.push({ e, t: c.time.t, p: json(p), state: c.fishing.state, view: { sp: c.fishing.view.speciesId, ra: c.fishing.view.rarity } }); return origEmit(e, p); };
    window.__cf = [];
    const m = c.models, orig = m.createFish.bind(m);
    m.createFish = (id, w) => { window.__cf.push({ id, state: c.fishing.state, t: c.time.t }); return orig(id, w); };
  });
  await until((c) => c.flow === 'playing' && c.state.run?.active !== false, 120000);
  await frames(10);
  if (api.args?.scale) await g((sc) => { try { window.__gw.debug.renderScale?.(sc); } catch { /* optional */ } }, Number(api.args.scale));
  await g(() => { const c = window.__gw; c.player.position.set(0, 0, 46); c.player.velocity?.set?.(0, 0, 0); });
  await frames(4);
  const clearModals = () => g(() => new Promise((res) => {
    let n = 0;
    const tick = () => {
      const c = window.__gw, m = c.debug.ui?.()?.openModal ?? null;
      if ((!c.ui.isBlocking?.() && !c.paused) || n++ > 40) return res(true);
      try { if (m === 'levelup') { const o = c.combat.pendingOptions; if (o?.length) c.combat.chooseBoon(o[0].boonId); else c.ui.closeAll?.(); } else { c.ui.closeAll?.(); if (c.paused) c.game.resume?.(); } } catch { /* optional */ }
      requestAnimationFrame(tick);
    };
    tick();
  }));
  const scan = (from) => g((from) => {
    const c = window.__gw, names = new Set(c.data.SPECIES.flatMap((q) => [q.id, q.name]));
    const out = [];
    for (const x of window.__ev.slice(from)) {
      if (x.e === 'fishing:caught' || x.e === 'fish:escaped' || x.e === 'fish:measured' || x.e === 'fish:landed') break;
      const str = JSON.stringify(x.p);
      if (/"(speciesId|rarity|species|name|odds|chance)"\s*:/.test(str) || [...names].some((n) => str.includes(`"${n}"`))) out.push(`${x.e} ${str.slice(0, 100)}`);
      if (x.view.sp || x.view.ra) out.push(`view on ${x.e}: ${x.view.sp}`);
    }
    return out;
  }, from);

  /** One cast: a forced bite, a REAL click during the bite, then the play stepped and captured inside the page. */
  const cast = async (name, speciesId, z, { outcome = null, cause = null, leap = null, shots = [], holdKeys = false } = {}) => {
    const mark = await g(() => window.__ev.length);
    const cf0 = await g(() => window.__cf.length);
    const r0 = await g(() => ({ x: window.__gw.player.position.x, z: window.__gw.player.position.z }));
    await g(([sp, z, outcome, cause, leap]) => {
      const c = window.__gw;
      c.debug.fishSeed(20261105 + Math.round(z * 100));
      c.debug.fishOutcome(outcome, cause);
      window.__leapKeep = c.data.AUTOFISH.leaps[sp];
      if (leap != null) c.data.AUTOFISH.leaps[sp] = leap;
      window.__shots = {};
      c.debug.forceBite({ speciesId: sp, z, wait: 1.6 });
    }, [speciesId, z, outcome, cause, leap]);
    // the tell (captured in the page) and the "!"
    const bite = await g((want) => new Promise((res) => {
      const c = window.__gw, t00 = performance.now();
      c.debug.timeScale?.(3);   // the short wait at speed (a loaded machine renders a frame every few seconds)
      const tick = () => {
        const f = c.fishing;
        if (f.state === 'waiting' && f.view.biteTell) c.debug.timeScale?.(1);
        if (want.includes('tell') && !window.__shots.tell && f.state === 'waiting' && f.view.biteTell) { c.render.render?.(); window.__shots.tell = c.render.renderer.domElement.toDataURL('image/png'); }
        if (f.state === 'bite') { c.debug.timeScale?.(0.3); if (want.includes('bite') && !window.__shots.bite) { c.render.render?.(); window.__shots.bite = c.render.renderer.domElement.toDataURL('image/png'); } return res(true); }
        if (performance.now() - t00 > 900000) return res(false);
        requestAnimationFrame(tick);
      };
      tick();
    }), shots);
    // a real click in the world view strikes (the whole screen is the target); the game runs slowed so the tap lands in the window
    await page.mouse.click(api.width * 0.5, api.height * 0.42);
    await frames(1);
    const st0 = await g(() => { const c = window.__gw; c.debug.timeScale?.(1); return { s: c.fishing.state, grade: c.fishing.view.strike, plan: c.debug.fishPlan() }; });
    check(bite && st0.s === 'reeling' && !!st0.grade, `${name}: a click during the bite strikes (${st0.grade})`, st0.s);
    const plan = st0.plan;
    if (!plan) return null;
    if (holdKeys) await page.keyboard.down('KeyW');
    // the play, the reveal, the ceremony or the loss and the note: stepped in the page, a canvas capture at each moment
    const res = await g((want) => new Promise((res) => {
      const c = window.__gw, plan = c.debug.fishPlan(), t00 = performance.now(), sh = window.__shots;
      const firstLeap = plan.events.find((e) => e.phase === 'leap');
      const cap = (k) => { if (sh[k] || !want.includes(k)) return; c.render.render?.(); sh[k] = c.render.renderer.domElement.toDataURL('image/png'); };
      const tick = () => {
        const f = c.fishing, p = c.debug.fishPlay(), v = f.view, prox = c.debug.fishFx?.()?.proxyState, st = f.state;
        const ce = c.debug.ceremony?.();
        if (st === 'idle' || performance.now() - t00 > 1500000) { c.debug.timeScale?.(1); return res({ end: st, ms: performance.now() - t00 }); }
        const t = p?.t;
        const slow = (firstLeap && t != null && t > firstLeap.at - 0.3 && t < firstLeap.at + firstLeap.dur) || st === 'landing' || st === 'lost';
        c.debug.timeScale?.(slow ? 0.8 : 3);
        if (v.play?.glimpse && v.sizeClass) cap('glimpse');
        if (v.play?.leap && prox?.visible && prox.y > 0.2 + 0.4 * prox.length) cap('leap');
        if (v.play?.phase === 'lastStand') cap('laststand');
        if (v.play?.phase === 'lift' && prox?.visible && prox.alpha > 0.6) cap('lift');
        if (st === 'landing' && !ce?.active) cap('reveal');
        if (ce?.active && ce.t > ce.dur * 0.6) { cap('ceremony'); c.fishing.skipCeremony(); }
        if (st === 'lost') cap('loss');
        if (c.ui.isBlocking?.()) { try { c.ui.closeAll?.(); } catch { /* optional */ } }
        requestAnimationFrame(tick);
      };
      tick();
    }), shots);
    if (holdKeys) await page.keyboard.up('KeyW');
    const got = await g(() => window.__shots);
    for (const [k, url] of Object.entries(got)) save(`${name}-${k}`, url);
    const out = await g(([mark, cf0]) => ({ ev: window.__ev.slice(mark), cf: window.__cf.slice(cf0) }), [mark, cf0]);
    const r1 = await g(() => ({ x: window.__gw.player.position.x, z: window.__gw.player.position.z }));
    const leaks = await scan(mark);
    check(leaks.length === 0, `${name}: no species id, name, rarity or odds on any event or on the view before the reveal / the note`, leaks.slice(0, 3));
    const caught = out.ev.find((x) => x.e === 'fishing:caught');
    if (caught) {
      const early = out.cf.filter((x) => x.state !== 'landing');
      check(early.length === 0 && out.cf.some((x) => x.id === speciesId), `${name}: createFish is first called at the reveal (${out.cf.map((x) => `${x.id}@${x.state}`).join(', ')})`);
      check(!!caught.p.grade && caught.p.speciesId === speciesId, `${name}: fishing:caught names it, with the strike grade (${caught.p.grade})`);
    }
    if (holdKeys) {
      const moved = Math.hypot(r1.x - r0.x, r1.z - r0.z);
      check(Math.abs(moved - (plan.tow || 0)) < 0.35, `${name}: W held through the play: the raft moved ${moved.toFixed(2)} m (the plan's tow ${plan.tow} m)`);
    }
    log(`${name}: the play and its end took ${(res.ms / 1000).toFixed(0)} s of wall clock (${res.end})`);
    await g((sp) => { const c = window.__gw; c.data.AUTOFISH.leaps[sp] = window.__leapKeep; c.debug.fishOutcome(null); }, speciesId);
    await clearModals();
    return { plan, ev: out.ev };
  };

  // ===================================================================== a Trophy, landed (the whole beat)
  if (want('trophy')) {
    step('trophy: tell → click → play (glimpse, leap, lift) → reveal → ceremony');
    await g(() => { window.__gw.state.meta.settings.strikeRing = 'always'; });
    const r = await cast('trophy', 'reedjaw_pike', 2.3, { outcome: 'land', leap: 1, holdKeys: !mobile, shots: ['tell', 'bite', 'glimpse', 'leap', 'lift', 'reveal', 'ceremony'] });
    if (r) {
      const names = r.ev.map((x) => x.e);
      check(names.includes('fishing:tell') && names.includes('fishing:bite') && names.includes('fishing:strike') && names.includes('fishing:hook') && names.filter((n) => n === 'fishing:reel').length >= 8 && names.includes('fishing:caught'),
        'the events: tell, bite, strike, hook, the play\'s fishing:reel beats, caught', [...new Set(names)]);
      const tell = r.ev.find((x) => x.e === 'fishing:tell');
      check(tell?.p.lastDip === 0.25 && tell.p.biteTell === 'flatSlide', `the Trophy's tell: ${tell?.p.biteTell}, the 0.25 s last dip`, tell?.p);
      const leapEv = r.ev.find((x) => x.e === 'fishing:reel' && x.p.phase === 'leap');
      const pl = await g(() => window.__gw.data.presentLength('mossmere', 2.3));
      check(!!leapEv && Math.abs(leapEv.p.length - pl) < 0.002, `a leap carries the class length (${leapEv?.p.length} m = presentLength)`);
    }
    await g(() => { window.__gw.state.meta.settings.strikeRing = 'firstExpedition'; });
  }

  // ===================================================================== an Elder, lost (snapped)
  if (want('elder')) {
    step('elder: the last stand, the loss, the quiet beat, fish:escaped');
    const r = await cast('elder', 'reedjaw_pike', 2.95, { outcome: 'lose', cause: 'snapped', leap: 0, shots: ['laststand', 'loss'] });
    if (r) {
      const esc = r.ev.find((x) => x.e === 'fishing:escaped'), note = r.ev.find((x) => x.e === 'fish:escaped');
      check(esc && esc.p.reason === 'snapped' && esc.p.sizeClass === 'elder' && !('speciesId' in esc.p), `fishing:escaped {reason, sizeClass} at the loss, no species (${JSON.stringify(esc?.p)})`);
      check(note && note.p.speciesId === 'reedjaw_pike' && note.p.reason === 'snapped' && note.p.approxLength > 0 && note.t > esc.t,
        `fish:escaped after the quiet beat names it, near ${note?.p.approxLength} cm`);
      check(r.plan.lastStands.length === 1 && r.ev.some((x) => x.e === 'fishing:reel' && x.p.phase === 'lastStand'), 'the Elder\'s last stand played');
    }
  }

  // ===================================================================== a Small: the skitter
  if (want('small')) {
    step('small: no glimpse in the play, the skitter at the lift (the class estimate)');
    const r = await cast('small', 'dusk_minnow', -1.2, { outcome: 'land', shots: ['lift', 'reveal'] });
    if (r) {
      const sk = r.ev.filter((x) => x.e === 'fishing:reel' && x.p.phase === 'glimpse');
      check(sk.length === 1 && sk[0].p.kind === 'skitter', `the only glimpse is the skitter (${sk.map((x) => x.p.kind).join()})`);
    }
  }

  // ===================================================================== night: a Prize's leap, backlit
  if (want('night')) {
    step('night: a Prize leaps at night in Lantern');
    await g(() => { const c = window.__gw; c.debug.setPhase?.('gloomtide'); });
    await frames(20);
    await clearModals();
    await g(() => { const c = window.__gw; c.combat?.killAll?.('dawn'); });
    const r = await cast('night', 'weeping_carp', 1.6, { outcome: 'land', leap: 1, shots: ['leap', 'glimpse'] });
    if (r) check(r.ev.some((x) => x.e === 'fishing:reel' && x.p.phase === 'leap'), 'the night play leapt');
  }

  const errs = await g(() => window.__gw.errors.slice());
  check(errs.length === 0, 'ctx.errors stays empty', errs.slice(0, 5));
  log(`done in ${((Date.now() - t0) / 1000).toFixed(0)} s; ${failures.length} failure(s)`);
  return { failures };
}
